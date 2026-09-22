/**
 * db.js — Unified DB layer.
 *
 *  • Local (dev):    sql.js  (in-memory + on-disk lekhok.db)
 *  • Production:     @libsql/client (Turso, serverless-friendly)
 *
 * Exposes the SAME synchronous-looking API that the rest of the app uses:
 *   db.prepare(sql)      → { .all(...), .get(...), .run(...) }
 *   db.exec(sql)
 *   db.getSetting(key)
 *   db.setSetting(k, v)
 *   db.saveDb()          → no-op on Turso
 *
 * On Turso, the API is *asynchronous-friendly*; we wrap async calls in a tiny
 * sync emulation where possible (better-sqlite3-style) by awaiting inside
 * the prepare/run methods. For .all() and .get() the return is a Promise.
 *
 * To keep the existing routes working unchanged we use a clever trick: at
 * boot, the `initDb()` promise is awaited before the Express app starts
 * listening, and a thin proxy is exposed so that route code can continue
 * to write synchronous code.
 */

const bcrypt = require('bcryptjs');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DB_PATH     = path.join(__dirname, 'lekhok.db');
const IS_TURSO    = !!process.env.TURSO_DATABASE_URL;

// ── DB snapshot-over-Vercel-Blob mode (serverless WITHOUT Turso) ────────────
// When a BLOB_READ_WRITE_TOKEN exists and Turso is NOT configured, the sql.js
// database image is periodically pushed to Vercel Blob and restored on every
// cold boot — so data survives serverless restarts with zero external
// accounts. Opt out with DB_BLOB_SNAPSHOT=0 (or set Turso vars for real
// transactional persistence — see DEPLOYMENT.md for the trade-offs).
const BLOB_TOKEN      = process.env.BLOB_READ_WRITE_TOKEN || '';
const USE_DB_SNAPSHOT = !IS_TURSO && !!BLOB_TOKEN && process.env.DB_BLOB_SNAPSHOT !== '0';
const SNAPSHOT_PATH   = 'private/db-' + crypto.createHash('sha256')
  .update(process.env.SESSION_SECRET || 'lekhok-forum-snapshot')
  .digest('hex').slice(0, 16) + '.sqlite';
let _uploadTimer   = null;
let _snapshotDirty = false;   // সেশন ৩৮: আপলোড-বেকি রাইট থাকলে true
let _bootRestored  = false;
let _bootSeeded    = false;
// সেশন ১৭৯: মাল্টি-ইনস্ট্যান্স হট-রি-সিঙ্ক — Vercel-এ একাধিক উষ্ণ ল্যাম্বডা প্রত্যেকে
// নিজের ইন-মেমোরি sql.js কপি নিয়ে চলে; আগে এক-ইনস্ট্যান্সের রাইট অন্যটি কখনোই
// দেখত না (শুধু কোল্ড-বুটে স্ন্যাপশট লোড) — ফলে অ্যাডমিন-সেভ (যেমন কার্যবর্ষ)
// হোমপ্যানেল/হোমপেজে হারিয়ে যেত বা পুরনো দেখাত। এখন প্রতিটি ইনস্ট্যান্স
// ব্লবের uploadedAt দেখে বুঝবে অন্য কেউ নতুন স্ন্যাপশট দিয়েছে কি না — দিলে
// নিজের কপি হট-রি-প্লেস করবে (নিজের অ-আপলোডেড রাইট থাকলে নয়)।
let _lastBlobUploadAt = 0;    // আমার-শেষ-জানা ব্লব-আপলোড (নিজেরটি সহ)
let _lastSyncCheckAt  = 0;    // শেষ রি-সিঙ্ক-যাচাই (থ্রটল)
let _syncInFlight     = null; // একক-ফ্লাইট প্রমিজ

// ────────────────────────────────────────────────────────────────────────────
// Migration SQL (kept in-sync with db/schema.sql for local-dev convenience)
// ────────────────────────────────────────────────────────────────────────────
const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'notice',
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    end_date TEXT,
    location TEXT,
    image_url TEXT,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    designation TEXT,
    bio TEXT,
    image_url TEXT,
    social_fb TEXT,
    social_email TEXT,
    member_type TEXT DEFAULT 'central',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'general',
    author TEXT,
    tags TEXT,
    res_type TEXT DEFAULT 'link',
    file_size TEXT,
    thumbnail_url TEXT,
    duration TEXT,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    reply_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    designation TEXT,
    social_fb TEXT,
    social_twitter TEXT,
    social_linkedin TEXT,
    social_website TEXT,
    address TEXT,
    birth_date TEXT,
    gender TEXT DEFAULT 'other',
    show_email INTEGER DEFAULT 0,
    show_phone INTEGER DEFAULT 0,
    show_birth INTEGER DEFAULT 1,
    interests TEXT DEFAULT '[]',
    notify_prefs TEXT DEFAULT '{}',
    display_prefs TEXT DEFAULT '{}',
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    role TEXT DEFAULT 'user',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS moderators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    added_by INTEGER,
    permissions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    type TEXT DEFAULT 'article',
    title TEXT NOT NULL,
    body TEXT,
    excerpt TEXT,
    cover_image TEXT,
    tags TEXT,
    mentions TEXT,
    category TEXT,
    shared_from INTEGER DEFAULT NULL,
    status TEXT DEFAULT 'published',
    featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    accepted_comment_id INTEGER DEFAULT NULL,
    reactions TEXT DEFAULT '{}',
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    parent_id INTEGER,
    like_count INTEGER DEFAULT 0,
    reactions TEXT DEFAULT '{}',
    edited_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER,
    comment_id INTEGER,
    reaction_type TEXT DEFAULT 'like',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS blocks (
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id)
  );
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS daily_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,
    title TEXT,
    body TEXT,
    image_url TEXT,
    link_url TEXT,
    file_url TEXT,
    scheduled_date TEXT,
    published INTEGER DEFAULT 1,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    choice INTEGER,
    correct INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quiz_id)
  );
  CREATE TABLE IF NOT EXISTS epaper_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_date TEXT NOT NULL,
    paper_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    drive_file_id TEXT,
    drive_thumb_id TEXT,
    source TEXT DEFAULT 'epaper-bot',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_epaper_files_date ON epaper_files(scheduled_date, id);
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT,
    title TEXT,
    body TEXT,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS constitution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_title TEXT NOT NULL,
    content TEXT,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS past_leaders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    term_start TEXT,
    term_end TEXT,
    photo_url TEXT,
    bio TEXT,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    recipient_name TEXT,
    year TEXT,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    caption TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    photographer TEXT,
    event_date TEXT,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS press_clippings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    paper_name TEXT,
    image_url TEXT NOT NULL,
    published_date TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a INTEGER NOT NULL,
    user_b INTEGER NOT NULL,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    body TEXT,
    file_url TEXT,
    file_name TEXT,
    duration INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_by INTEGER,
    subject TEXT NOT NULL,
    body TEXT,
    file_url TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'new',
    assigned_to INTEGER,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS user_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    media_type TEXT DEFAULT 'TEXT',
    media_url TEXT,
    media_name TEXT,
    status TEXT DEFAULT 'PENDING',
    admin_note TEXT,
    note_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_user_reports_sender ON user_reports(sender_id, created_at);
  CREATE TABLE IF NOT EXISTS moderator_scopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    scope TEXT NOT NULL,
    granted_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_active INTEGER DEFAULT 1,
    source TEXT DEFAULT 'footer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
  );
  CREATE TABLE IF NOT EXISTS newsletter_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER,
    post_id INTEGER,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME
  );
  CREATE TABLE IF NOT EXISTS newsletter_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT DEFAULT 'article',
    ref_id INTEGER,
    title TEXT,
    author_name TEXT,
    subscriber_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    added_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS message_reactions (
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    role TEXT,
    action TEXT,
    target TEXT,
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_actlog_recent ON activity_logs(id);
  CREATE TABLE IF NOT EXISTS account_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_profile_id INTEGER,
    submitted_user_id INTEGER,
    kind TEXT DEFAULT 'claim',
    claim_status TEXT DEFAULT 'pending',
    submitted_data TEXT DEFAULT '{}',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_claims_status ON account_claims(claim_status);
  CREATE INDEX IF NOT EXISTS idx_claims_member ON account_claims(member_profile_id);
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_pwd_resets_token ON password_resets(token_hash);
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    post_id INTEGER,
    comment_id INTEGER,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'open',
    action TEXT,
    resolved_by INTEGER,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id);
  CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id);
  CREATE TABLE IF NOT EXISTS call_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    caller_id INTEGER NOT NULL,
    callee_id INTEGER NOT NULL,
    kind TEXT DEFAULT 'audio',
    status TEXT DEFAULT 'ringing',
    offer_sdp TEXT,
    answer_sdp TEXT,
    ended_by INTEGER,
    ended_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME,
    ended_at DATETIME
  );
  CREATE INDEX IF NOT EXISTS idx_calls_callee ON call_sessions(callee_id, status);
  CREATE INDEX IF NOT EXISTS idx_calls_caller ON call_sessions(caller_id, status);
  CREATE INDEX IF NOT EXISTS idx_calls_conv ON call_sessions(conversation_id);
  CREATE TABLE IF NOT EXISTS call_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_callsig_call ON call_signals(call_id, id);
  CREATE TABLE IF NOT EXISTS two_factor_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'email',
    expires_at INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_2fa_tokens_user ON two_factor_tokens(user_id, method);
  /* সেশন ১১৩: গ্রুপ-কল (mesh) — প্রতি-কল-অংশগ্রহণকারী ট্র্যাকিং। 1:1-এও ব্যবহৃত
     হয় না (1:1 পুরনো caller_id/callee_id-পথেই চলে — অক্ষুণ্ণ); শুধু is_group=1
     সেশনে অংশগ্রহণ/রিং/জয়েন/লিভ-স্টেট এখানেই থাকে। */
  CREATE TABLE IF NOT EXISTS call_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'ringing',
    joined_at DATETIME,
    left_at DATETIME,
    UNIQUE(call_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS idx_callpart_call ON call_participants(call_id, status);
  CREATE INDEX IF NOT EXISTS idx_callpart_user ON call_participants(user_id, status);
`;

// Columns added in later migrations — applied to existing installs during initDb().
const LATER_COLUMNS = [
  // [table, column, definition]
  ['posts', 'repost_of',   'INTEGER'],
  ['posts', 'repost_note', 'TEXT'],
  // Member/past-leader linkage to registered user accounts — added 2026-09
  // (committee / advisory / past leaders render the linked user's avatar,
  //  name, and a link to /profile/:username everywhere they appear).
  ['members',      'user_id', 'INTEGER REFERENCES users(id) ON DELETE SET NULL'],
  ['past_leaders', 'user_id', 'INTEGER REFERENCES users(id) ON DELETE SET NULL'],
  // সেশন ৪৯: লিডারশিপ কার্ডে LinkedIn লিংক + আলাদা "বাণী" (message/quote)
  ['members',      'social_linkedin', 'TEXT'],
  ['members',      'message', 'TEXT'],
  ['past_leaders', 'social_fb', 'TEXT'],
  ['past_leaders', 'social_linkedin', 'TEXT'],
  ['past_leaders', 'message', 'TEXT'],
  ['conversations', 'is_group', 'INTEGER DEFAULT 0'],
  // সেশন ১১৩: গ্রুপ-কল — 1:1-সেশনে 0; গ্রুপ-কলে 1 (callee_id=0 রাখা হয়)
  ['call_sessions', 'is_group', 'INTEGER DEFAULT 0'],
  ['conversations', 'title', 'TEXT'],
  // টাস্ক ১৪: মেম্বার অ্যাকাউন্ট ক্লেইম/অ্যাক্টিভেশন
  ['members', 'member_id',     'TEXT'],
  ['members', 'department',    'TEXT'],
  ['members', 'account_status',"TEXT DEFAULT 'unclaimed'"],
  ['members', 'claimed_at',    'DATETIME'],
  ['members', 'verified_at',   'DATETIME'],
  // সেশন ৫৭: নেতৃত্ব কার্ডে "আইডির ইউয়ারএল" (প্রোফাইল-লিংক) + ফ্রেশ-DB সেফটি —
  // schema.sql-এর members টেবিলে designation/social_fb/social_email/term_year
  // নেই (পুরনো ডিবিতে ঐতিহাসিকভাবে ছিল); নতুন ডিপ্লয়ে INSERT ভেঙে যেত।
  ['members', 'profile_url',   'TEXT'],
  ['members', 'designation',   'TEXT'],
  ['members', 'social_fb',     'TEXT'],
  ['members', 'social_email',  'TEXT'],
  ['members', 'term_year',     'TEXT'],
  // সিকিউরিটি টাস্ক: অ্যাডমিন MFA (TOTP) + ব্যাকআপ কোড
  ['admin_users', 'totp_secret',    'TEXT'],
  ['admin_users', 'totp_enabled',   'INTEGER DEFAULT 0'],
  ['admin_users', 'backup_codes',   'TEXT'],
  // সেশন ৫৮: ইউজার-লেভেল 2FA (TOTP) — লগইন-ফর্ম পরিষ্কার থাকে, 2FA সেটআপ/
  // ব্যবস্থাপনা ইউজারের নিজের সেটিংস-পেজে; লগইনে 2FA-সক্রিয় হলে দ্বিতীয় ধাপ
  // (/login/2fa) এসে কোড চায় (Google Authenticator-সামঞ্জস্যপূর্ণ)।
  ['users', 'totp_secret',    'TEXT'],
  ['users', 'totp_enabled',   'INTEGER DEFAULT 0'],
  ['users', 'backup_codes',   'TEXT'],
  // সেশন ৬০: ইন্টারঅ্যাক্টিভ কুইজ — options (JSON-অ্যারে) + answer
  // (সঠিক অপশনের 0-ইনডেক্স)। উত্তর যাচাই সার্ভার-সাইড (POST /quiz/check),
  // ভিউতে answer পাঠানো হয় না।
  ['daily_content', 'options', 'TEXT'],
  ['daily_content', 'answer',  'INTEGER'],
  // সেশন ৬০ (theme-session): "সংযুক্ত অ্যাকাউন্ট" সেকশনকে সত্যিকারের কার্যকর করতে —
  // users.social_telegram (fb/twitter/linkedin/website আগেই আছে)।
  ['users', 'social_telegram', 'TEXT'],
  // সেশন ৭৬: মেসেজিং প্রো-ফিচার — রিপ্লাই-থ্রেডিং, এডিট-ট্রেস, প্রতি-সদস্য
  // মিউট/পিন (1:1-এ সেশন-মিউটে অন-ডিমান্ড conversation_members রো তৈরি হয়)।
  ['messages', 'reply_to_id', 'INTEGER'],
  ['messages', 'edited_at',   'TEXT'],
  // সেশন ১৫৮: ভয়েস-মেসেজ স্থায়ী-ফিক্স — রেকর্ডার-সাইডে মাপা সেকেন্ড DB-তে।
  // MediaRecorder (Chromium) webm-হেডারে Duration-এলিমেন্ট লেখে না →
  // audio.duration = Infinity → রিফ্রেশে ০:০০। সমাধান: রেকর্ডিং-সময়ে setInterval-
  // গণিত সেকেন্ড এখানে সংরক্ষিত — বাবল সর্বদা data-duration পায় (মাইগ্রেশন
  // idempotent — duplicate-column নিরীহ catch; Turso/sql.js উভয়-ব্যাকএন্ডে চলে)।
  ['messages', 'duration', 'INTEGER DEFAULT 0'],
  ['conversation_members', 'muted',  'INTEGER DEFAULT 0'],
  ['conversation_members', 'pinned', 'INTEGER DEFAULT 0'],
  // সেশন ৮৫: পিনড-পোস্ট — লেখক তার সেরা লেখা প্রোফাইল-টাইমলাইনের শীর্ষে
  // পিন করতে পারেন (pen_name/genres কলাম সেশন-৮০-র social.js ALTER-লুপে আছে)।
  ['posts', 'is_pinned', 'INTEGER DEFAULT 0'],
  // সেশন ৯১/৯৩ (লাইভ-বাগফিক্স + fresh-deploy-বাগফিক্স, দুই-এজেন্টের সমান্তরাল আবিষ্কার):
  // users-এর pen_name/genres আগে শুধু /settings-ভিজিটে লেজি-ALTER হতো → লাইভ Turso-তে
  // ও fresh DB/ডিপ্লয়ে /dashboard-এর feed-কোয়েরি (u.pen_name) 500 দিত ("no such column")।
  // এখন বুট-টাইমেই ensure (idempotent — duplicate-column → নিরীহ catch)।
  ['users', 'pen_name', 'TEXT'],
  ['users', 'genres', 'TEXT'],
  ['users', 'allow_messages_from', "TEXT DEFAULT 'everyone'"],
  ['users', 'bookmarks_public', 'INTEGER DEFAULT 0'],
  // সেশন ১৪৭: ফেসবুক-প্যারিটি বিস্তারিত পরিচিতি — রক্তের গ্রুপ / নিজ জেলা /
  // শিক্ষা-প্রতিষ্ঠান / শিক্ষাবর্ষ (প্রোফাইল-হেডার মেটা-চিপ + সাইডবার পরিচিতি +
  // tab-about; /profile/edit ফর্ম থেকে সেভ)। schema.sql-এও যোগ করা (fresh-DB)।
  ['users', 'blood_group',    'TEXT'],
  ['users', 'hometown',       'TEXT'],
  ['users', 'institution',    'TEXT'],
  ['users', 'academic_year',  'TEXT'],
  // সেশন ৯৫: অ্যাকাউন্ট-রিকভারি ট্র্যাকিং (সুপার-এডমিন প্যানেল) —
  // password_changed_at: সর্বশেষ পাসওয়ার্ড সেট/পরিবর্তনের সময়;
  // must_change_password: সুপার-এডমিন-প্রদত্ত অস্থায়ী পাসওয়ার্ডে লগইন করেছে
  // কিনা (1 = লগইন-পরবর্তী ফোর্স-চেঞ্জ গেট সক্রিয়)। মূল পাসওয়ার্ড কখনোই
  // plaintext-এ সংরক্ষিত হয় না — শুধু bcrypt-hash থাকে, রিভার্স-অসম্ভব।
  ['users', 'password_changed_at', 'DATETIME'],
  ['users', 'must_change_password', 'INTEGER DEFAULT 0'],
  // সেশন ৯৭: গ্যালারি মেটাডেটা — ফটোগ্রাফার-ক্রেডিট + ইভেন্টের তারিখ।
  // (/gallery আধুনিকায়ন: কার্ড-হোভার ও লাইটবক্সে ক্রেডিট/তারিখ দেখায়;
  //  event_date ফাঁকা হলে created_at fallback — routes/pages.js)।
  // ফ্রেশ-DB-সেফটি: নিচের CREATE TABLE-এও যোগ করা (সেশন-৫৭-লেশন)।
  ['gallery', 'photographer', 'TEXT'],
  ['gallery', 'event_date',   'TEXT'],
  // সেশন ১০৪: FB-প্যারিটি কমেন্ট-সিস্টেম — edited_at (সম্পাদনা-স্ট্যাম্প,
  // GET /api/comments + কমেন্ট-বাবলের 'সম্পাদিত' মার্কার)।
  ['comments', 'edited_at', 'DATETIME'],
  // সেশন ১০১: রিসোর্স-মাল্টিমিডিয়া আপগ্রেড — res_type (pdf/audio/video/image/doc/link)
  // legacy file_type (document/video/link) থেকে আলাদা; পড়ার সময় res_type ফাঁক থাকলে
  // file_type থেকে derive হয়। file_size হিউম্যান-রিডেবল ("15.4 MB"), duration
  // অডিও/ভিডিওর ("22:45"), downloads/views কাউন্টার, thumbnail_url ইমেজ-কার্ড-কভার,
  // created_by = আপলোডকারীর username (অ্যাডমিন/মডারেটর)।
  ['resources', 'res_type',      "TEXT DEFAULT 'link'"],
  ['resources', 'file_size',     'TEXT'],
  ['resources', 'thumbnail_url', 'TEXT'],
  ['resources', 'duration',      'TEXT'],
  ['resources', 'downloads',     'INTEGER DEFAULT 0'],
  ['resources', 'views',         'INTEGER DEFAULT 0'],
  ['resources', 'created_by',    'TEXT'],
  // সেশন ১০২: নোটিফিকেশন-ড্রপডাউন actor-avatar — কে ট্রিগার করেছে তার রেফারেন্স
  // (nullable — সিস্টেম/মডারেশন-নোটিফিকেশনে actor নেই, আইকন-ফলব্যাক থাকবে)।
  ['notifications', 'actor_id', 'INTEGER'],
  // সেশন ১০৭: যোগাযোগ-বার্তা ইনবক্স — is_read (অপঠিত-ব্যাজ/ফিল্টার),
  // is_archived (ইনবক্স পরিষ্কার রাখতে আর্কাইভ-ফোল্ডার)। LATER_COLUMNS-এ
  // আছে বলে পুরনো DB (লোকাল sql.js + লাইভ Turso)-তে মাইগ্রেশন-ছাড়াই
  // প্রথম বুটেই কলাম পৌঁছে যায় (duplicate-column → নিরীহ catch)।
  ['contact_submissions', 'is_read',     'INTEGER DEFAULT 0'],
  ['contact_submissions', 'is_archived', 'INTEGER DEFAULT 0'],
  // সেশন ১০৭: রিসোর্স সিরিজ/সংকলন (প্লেলিস্ট) — series = সিরিজ-নাম (ফ্রি-টেক্সট,
  // একই নাম = এক সিরিজ), series_order = পর্ব-ক্রম (১-ভিত্তিক; শূন্য হলে id-ভিত্তিক
  // ফলব্যাক)। ডিটেইল-পেজে পর্ব-নেভিগেটর, লিস্টে ?series= ফিল্টার, কার্ডে পর্ব-ব্যাজ।
  // [নাম্বার-রেস-নোট: দুই-এজেন্ট-উভয়ে '১০৭' লেবেল ব্যবহার করেছে — ইউনিয়ন-মার্জে দুই-ফিচারই অক্ষত]
  ['resources', 'series',       'TEXT'],
  ['resources', 'series_order', 'INTEGER'],
  // সেশন ১০৯: ইনবক্স রিপ্লাই-নোট — অ্যাডমিন প্রতিটি বার্তার পাশে নিজের উত্তর-
  // রেকর্ড রাখতে পারেন (কে কী জবাব দিল কখন — CSV-তেও যায়)। nullable দুটোই।
  // [লেবেল-রেস-নোট: '১০৯' লেবেলও দুই-এজেন্টে গেছে — আমার ব্লক contact_submissions-নোট, অন্যটি style.css]
  ['contact_submissions', 'admin_reply', 'TEXT'],
  ['contact_submissions', 'replied_at',  'TEXT'],
  // সেশন ১১৫: মাল্টি-মেথড 2FA — twofa_method ('totp'|'email') নির্ধারণ করে লগইনের
  // দ্বিতীয় ধাপে কোন ধরনের কোড চাওয়া হবে। totp_enabled আগের মতোই মাস্টার-সুইচ
  // (পুরনো সব চেক — লগইন-ইন্টারসেপ্ট/ব্যাকআপ/ডিসেবল — অক্ষত থাকে)।
  // [নাম্বার-রেস-নোট: ১১০-অ্যাকশন-রেল-ফিক্সের পর সমান্তরাল-এজেন্টে ১১১-১১৪ নেওয়া — সর্বোচ্চ+১ রীতিতে ১১৫]
  ['users', 'twofa_method', "TEXT DEFAULT 'totp'"],
  // সেশন ১৫৩: FB-রিচ-কম্পোজার — কলাম-সেট alt-তালিকার প্রতিচ্ছবি (ফ্রেশ-ডিপ্লয়ে
  // প্রথম বুটেই পৌঁছায়; duplicate-column → নিরীহ catch)।
  ['posts', 'rich_content',     'TEXT'],
  ['posts', 'background_color', 'TEXT'],
  ['posts', 'feeling',          'TEXT'],
  ['posts', 'location',         'TEXT'],
  ['posts', 'audience',         "TEXT DEFAULT 'PUBLIC'"],
  ['post_images', 'media_type', "TEXT DEFAULT 'image'"],
];
/* সেশন ৩ — ব্র্যান্ড-রিনেম মাইগ্রেশন (ইউজার-সিদ্ধান্ত: দীর্ঘ নাম → "লেখক ফোরাম" সব জায়গায়)
   কোড-ডিফল্ট/সিড বদলালেও পুরনো DB-তে (লোকাল lekhok.db + প্রোডাকশন Turso) পুরনো স্ট্রিং
   থেকে যেত। এই মাইগ্রেশন প্রতি বুটে চলে, idempotent (২য় রানে কোনো রো ম্যাচ করে না),
   Turso-সেফ (সাধারণ UPDATE+REPLACE), এবং শুধু যে রো-তে পুরনো নাম আছে সেগুলোই ছোঁয় —
   অ্যাডমিনের নিজের কাস্টম লেখা (যেখানে পুরনো নাম নেই) অক্ষত থাকে। */
const BRAND_OLD = 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম';
const BRAND_NEW = 'লেখক ফোরাম';
async function brandRenameMigration() {
  const targets = [
    ['settings', 'value', "(key = 'site_name' OR key GLOB 'content_*')"],
    ['constitution', 'section_title', null],
    ['constitution', 'content', null],
    ['resources', 'title', null],
    ['resources', 'content', null],
    ['members', 'role', null],
    ['members', 'designation', null],
    ['members', 'bio', null],
    ['past_leaders', 'role', null],
    ['past_leaders', 'bio', null],
  ];
  for (const [t, c, extra] of targets) {
    try {
      const where = `${c} LIKE ?` + (extra ? ` AND ${extra}` : '');
      await backend.prepare(
        `UPDATE ${t} SET ${c} = REPLACE(${c}, ?, ?) WHERE ${where}`
      ).run(BRAND_OLD, BRAND_NEW, '%' + BRAND_OLD + '%');
    } catch (e) { /* টেবিল/কলাম এখনো নেই (পুরনো ডিপ্লয়) — পরের বুটে হবে */ }
  }
}

async function applyLaterMigrations() {
  for (const [table, col, def] of LATER_COLUMNS) {
    try {
      await backend.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`).run();
    } catch (e) { /* duplicate column — fine */ }
  }
  // সেশন ৬২: কুইজ-স্কোর সার্ভার-পার্সিস্টেন্স — লগইন-ইউজারের প্রতিটি কুইজ-
  // উত্তর DB-তে থাকে (UNIQUE(user_id, quiz_id) → প্রথম উত্তরই চূড়ান্ত,
  // localStorage-নির্ভরতা দূর — ডিভাইস-বদলেও স্কোর থাকে)। MIGRATION_SQL-ও
  // আপডেট করা; এখানে আবার CREATE করা fingerprint-বাস্টিং নিশ্চিত করে (ফাংশন-
  // সোর্স বদলায় → লাইভ Turso-তে ফুল-ইনিট চলবে)।
  try {
    await backend.exec(`CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      choice INTEGER,
      correct INTEGER DEFAULT 0,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, quiz_id)
    )`);
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, answered_at)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id)');
  } catch (e) { /* already exists — fine */ }
  // সেশন ১১৩: গ্রুপ-কল — অংশগ্রহণকারী-টেবিল (MIGRATION_SQL-এও যোগ; এখানে
  // পুনঃCREATE → ফাংশন-সোর্স-হ্যাশ বদলায় → লাইভ Turso-তে ফুল-ইনিট চলবে)।
  try {
    await backend.exec(`CREATE TABLE IF NOT EXISTS call_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'ringing',
      joined_at DATETIME,
      left_at DATETIME,
      UNIQUE(call_id, user_id)
    )`);
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_callpart_call ON call_participants(call_id, status)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_callpart_user ON call_participants(user_id, status)');
  } catch (e) { console.error('[db] call_participants (session 113):', e.message); }
  // সেশন ৯৩: WebRTC কল — সিগন্যালিং-স্টোর (Vercel-serverless-নিরাপদ: WebSocket
  // নেই, কথোপকথনের বিদ্যমান HTTP-পোলিং-প্যাটার্নেই SDP/ICE রিলে)। MIGRATION_SQL-এও
  // যোগ; এখানে পুনঃCREATE → ফাংশন-সোর্স-হ্যাশ বদলায় → লাইভ Turso-তে ফুল-ইনিট চলবে।
  try {
    await backend.exec(`CREATE TABLE IF NOT EXISTS call_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      caller_id INTEGER NOT NULL,
      callee_id INTEGER NOT NULL,
      kind TEXT DEFAULT 'audio',
      status TEXT DEFAULT 'ringing',
      offer_sdp TEXT,
      answer_sdp TEXT,
      ended_by INTEGER,
      ended_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      answered_at DATETIME,
      ended_at DATETIME
    )`);
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_calls_callee ON call_sessions(callee_id, status)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_calls_caller ON call_sessions(caller_id, status)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_calls_conv ON call_sessions(conversation_id)');
    await backend.exec(`CREATE TABLE IF NOT EXISTS call_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_callsig_call ON call_signals(call_id, id)');
  } catch (e) { console.error('[db] call tables (session 93):', e.message); }
  // সেশন ৬৭: bookmarks-স্কিমা-হার্ডেনিং — (১) ঐতিহাসিক ডুপ্লিকেট-রো ডিডুপ
  // (earliest MIN(id) থাকিয়ে) + UNIQUE INDEX uq_bookmarks_user_post — টগল-
  // রেস/ডাবল-ক্লিকে ডুপ্লিকেট রো আর জমবে না (টেবিলে আগে কোনো UNIQUE-ই ছিল না);
  // (২) orphan-self-heal — মুছে-ফেলা পোস্টের সংরক্ষণ-রো প্রতি বুটে পরিষ্কার
  // (/bookmarks স্ট্যাটাস-ফিল্টারে অদৃশ্য থাকত কিন্তু DB-তে জমা ছিল; ডিলিট-
  // রুটে এখন ক্লিনআপ-আছে — এটি রেট্রো-হেলিং)।
  try {
    await backend.exec('DELETE FROM bookmarks WHERE id NOT IN (SELECT MIN(id) FROM bookmarks GROUP BY user_id, post_id)');
    await backend.exec('CREATE UNIQUE INDEX IF NOT EXISTS uq_bookmarks_user_post ON bookmarks(user_id, post_id)');
    await backend.exec('DELETE FROM bookmarks WHERE post_id NOT IN (SELECT id FROM posts)');
  } catch (e) { console.error('[db] bookmarks hardening (session 67):', e.message); }
  // সেশন ৬৭: cover_image-ডেটা-হিল — QA/লেগেসি-সেভে '[]' (মাল্টি-ইমেজ-JSON স্ট্রিং)
  // ঢুকে গিয়েছিল; <input type=url> HTML5-ভ্যালিডেশনে এই মান ফর্ম-সেভই
  // নীরবে ব্লক করে দেয় (এডিট-পেজ আটকে যাওয়ার আসল কারণ)। খালি/অবৈধ মান → NULL।
  try {
    await backend.exec("UPDATE posts SET cover_image = NULL WHERE TRIM(COALESCE(cover_image,'')) IN ('[]', 'null', 'Null', 'NULL', '{}', '')");
  } catch (e) { console.error('[db] cover_image heal (session 67):', e.message); }
  // Session 68: post_images junk heal — the dual-input form bug stored '[]' /
  // '["[]","[]"]'-style junk as image_url rows (rendered as broken /[] img-src
  // on feed/articles/press pages). Anything that is not an http(s):// or
  // /-prefixed URL was already rendering broken, so delete it outright. Also
  // broad-cover-heal posts.cover_image with the same URL pattern (the exact-
  // match heal above misses nested junk like '["[]","[]"]').
  try {
    await backend.exec(`DELETE FROM post_images
      WHERE image_url IS NULL OR TRIM(image_url) = ''
         OR (TRIM(image_url) NOT LIKE 'http://%'
             AND TRIM(image_url) NOT LIKE 'https://%'
             AND TRIM(image_url) NOT LIKE '/%')`);
    await backend.exec(`UPDATE posts SET cover_image = NULL
      WHERE TRIM(COALESCE(cover_image,'')) != ''
        AND TRIM(cover_image) NOT LIKE 'http://%'
        AND TRIM(cover_image) NOT LIKE 'https://%'
        AND TRIM(cover_image) NOT LIKE '/%'`);
  } catch (e) { console.error('[db] post_images heal (session 68):', e.message); }
  // সেশন ৮১: পোস্ট-মডারেশন — reports টেবিল (report/hide + moderator queue)।
  // MIGRATION_SQL-এও যোগ করা হয়েছে, কিন্তু বুট-ফিঙ্গারপ্রিন্ট ফাংশন-সোর্স হ্যাশ
  // করে — এখানে আবার CREATE করা ফুল-ইনিট নিশ্চিত করে (কুইজ-attempts-এর প্যাটার্ন)।
  try {
    await backend.exec(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      post_id INTEGER,
      comment_id INTEGER,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'open',
      action TEXT,
      resolved_by INTEGER,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id)');
    await backend.exec('CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id)');
  } catch (e) { console.error('[db] reports table (session 81):', e.message); }
  try { await brandRenameMigration(); } catch (e) {
    console.error('[db] brandRenameMigration failed:', e.message);
  }
  // After columns are guaranteed, auto-link members/past_leaders to users by
  // exact full_name match. Idempotent — only fills rows where user_id is null.
  try { await autoLinkMembersToUsers(); } catch (e) {
    console.error('[db] autoLinkMembersToUsers failed:', e.message);
  }
  // টাস্ক ১৪: মেম্বার আইডি (MEM-XXXXX) backfill + account_status সিঙ্ক
  try { await backfillMemberIds(); } catch (e) {
    console.error('[db] backfillMemberIds failed:', e.message);
  }
  // সিকিউরিটি টাস্ক: নিরাপদ ডিফল্টসহ সিকিউরিটি সেটিংস সিড (idempotent)
  try { await seedSecuritySettings(); } catch (e) {
    console.error('[db] seedSecuritySettings failed:', e.message);
  }
  // সেশন ৬০: ইন্টারঅ্যাক্টিভ কুইজ-ব্যাকফিল — পুরনো (options-হীন) কুইজ-রোতে
  // পরিচিত সিড-কুইজের বিকল্প+উত্তর বসানো। Idempotent: options খালি না-হলে ছোঁয় না।
  try { await quizInteractiveBackfill60(); } catch (e) {
    console.error('[db] quizInteractiveBackfill60 failed:', e.message);
  }
  // সেশন ৬৪: কুইজ-লিডারবোর্ড ডেমো-ব্যাকফিল — বোর্ড যেন খালি না দেখায়।
  // Idempotent + non-destructive (নিয়ম নিচের ফাংশন-কমেন্টে)।
  try { await quizDemoAttemptsBackfill64(); } catch (e) {
    console.error('[db] quizDemoAttemptsBackfill64 failed:', e.message);
  }
  // সেশন ৬৭: TOC-ডেমো-লেখা (লাইভে সূচিপত্র-ফিচার দৃশ্যমান করতে)।
  try { await tocDemoArticle67(); } catch (e) {
    console.error('[db] tocDemoArticle67 failed:', e.message);
  }
}

// সেশন ৬০: পরিচিত সিড-কুইজগুলোর বিকল্প-সেট (শিরোনাম/বডির ইউনিক অংশ দিয়ে ম্যাচ)।
// মডারেটর-তৈরি নতুন কুইজ ম্যাচ না হলে স্পর্শ হয় না — সেগুলো ফর্ম থেকেই
// options/answer পায়, না দিলে স্ট্যাটিক কার্ডে ফলব্যাক করে।
const QUIZ_BACKFILL_60 = [
  ['কবিতায় ছন্দ কত প্রকার',        ['২ প্রকার', '৩ প্রকার', '৪ প্রকার', '৫ প্রকার'], 1],
  ['পথিকৃৎ',                        ['রবীন্দ্রনাথ ঠাকুর', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়', 'কাজী নজরুল ইসলাম', 'মাইকেল মধুসূদন দত্ত'], 1],
  ['নোবেল পুরস্কার পান কোন গ্রন্থের', ['সোনার তরী', 'গীতাঞ্জলি', 'চোখের বালি', 'বলাকা'], 1],
  ['নজরুলের প্রথম কাব্যগ্রন্থ',      ['অগ্নি-বীণা', 'বিষের বাঁশী', 'ভাঙার গান', 'সিন্ধু-হিন্দোল'], 1],
  ['মাইকেল মধুসূদনের প্রথম মহাকাব্য', ['কৃষ্ণকুমারী', 'মেঘনাদবধ কাব্য', 'শর্মিষ্ঠা', 'বীরাঙ্গনা কাব্য'], 1],
  ['বাংলা একাডেমি কবে প্রতিষ্ঠিত',   ['১৯৪৭ সালে', '১৯৫২ সালে', '১৯৫৫ সালে', '১৯৭১ সালে'], 2],
  ['অমর একুশে বইমেলা কোথায়',        ['রমনা বটমূল', 'বাংলা একাডেমি প্রাঙ্গণ', 'সোহরাওয়ার্দী উদ্যান', 'জাতীয় জাদুঘর প্রাঙ্গণ'], 1],
  ['বাংলা সাহিত্যের প্রথম মহাকাব্য',  ['মেঘনাদবধ কাব্য', 'শ্রীকৃষ্ণকীর্তন', 'অন্নদামঙ্গল', 'কৃষ্ণকুমারী'], 0],
  ['ভাষা আন্দোলন কোন সালে',          ['১৯৪৭ সালে', '১৯৫২ সালে', '১৯৫৮ সালে', '১৯৬৯ সালে'], 1],
  ['সঞ্চয়িতা',                       ['কাজী নজরুল ইসলামের', 'রবীন্দ্রনাথ ঠাকুরের', 'জীবনানন্দ দাশের', 'সুকান্ত ভট্টাচার্যের'], 1],
];
async function quizInteractiveBackfill60() {
  const rows = await backend.prepare("SELECT id, title, body FROM daily_content WHERE content_type = 'quiz' AND (options IS NULL OR options = '')").all();
  let filled = 0;
  for (const row of rows) {
    const t = String(row.title || '');
    const b = String(row.body || '');
    let hit = null;
    for (const [key, options, answer] of QUIZ_BACKFILL_60) {
      if (t.includes(key) || b.includes(key)) { hit = { options, answer }; break; }
    }
    if (hit) {
      await backend.prepare('UPDATE daily_content SET options = ?, answer = ? WHERE id = ?')
        .run(JSON.stringify(hit.options), hit.answer, row.id);
      filled++;
    }
  }
  if (filled) console.log('[db] quizInteractiveBackfill60: enriched', filled, 'quiz row(s) with options/answer');
}

// সেশন ৬৪: কুইজ-লিডারবোর্ড ডেমো-ব্যাকফিল — সেশন ৬২-৬৩-এর টপ-পেন্ডিং।
// লিডারবোর্ড quiz_attempts-ডেটার উপর দাঁড়ায়; ডেমো-সাইটে প্রায় কেউ উত্তর
// দেয়নি বলে বোর্ড অদৃশ্য থাকত। ৫ ডেমো-সদস্যের (seed-ইউজার — ismail/monem/
// karishma/mahfuz/nusrat) জন্য বাস্তবসঙ্গত ইতিহাস বসানো হয়।
// নিরাপত্তা-নিয়ম:
//   • শুধু পরিচিত ৫ ডেমো-username (role='user', status='active') ছোঁয়া হয় —
//     রিয়েল ইউজার/মডারেটর/অ্যাডমিন কখনো স্পর্শ হয় না
//   • প্রতি ইউজারের ইতিমধ্যে ৩+ আটেম্প্ট থাকলে স্কিপ (আসল খেলোয়াড় স্পর্শ-মুক্ত)
//   • INSERT OR IGNORE + UNIQUE(user_id, quiz_id) → আসল উত্তর কখনো ওভাররাইট নয়
//   • শুধু answer+options-সহ পাবলিশড কুইজ — correct/choice সার্ভার-সত্য
//   • আজকের কুইজ বাদ — ডেমো-ইউজারের আজকের-উত্তর আজই না দেখায়
//   • answered_at অতীতে ছড়ানো (ক্রমবর্ধমান) — স্ট্রিক-গণনা সঙ্গতিপূর্ণ
const QUIZ_DEMO_USERS_64 = [
  // [username, কতটি, সময়-ক্রমে সঠিক-প্যাটার্ন (১=সঠিক)]
  ['karishma', 8, [1, 1, 1, 0, 1, 1, 1, 1]], // ৭/৮ — শীর্ষ
  ['ismail',   7, [1, 0, 1, 1, 0, 1, 1]],    // ৫/৭
  ['mahfuz',   6, [1, 1, 0, 0, 1, 1]],       // ৪/৬
  ['nusrat',   6, [0, 1, 0, 1, 1, 0]],       // ৩/৬
  ['monem',    5, [0, 1, 0, 0, 1]],          // ২/৫
];
async function quizDemoAttemptsBackfill64() {
  // উত্তরযোগ্য কুইজ — আজকেরটি বাদ, নতুন→পুরনো ক্রমে
  const quizzes = await backend.prepare(
    "SELECT id, answer, options FROM daily_content WHERE content_type = 'quiz' AND published = 1 AND options IS NOT NULL AND options != '' AND answer IS NOT NULL AND (scheduled_date IS NULL OR scheduled_date < date('now')) ORDER BY scheduled_date DESC, created_at DESC LIMIT 12"
  ).all();
  if (!quizzes.length) return;
  const fmt = (ms) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
  let inserted = 0;
  for (const [username, want, pattern] of QUIZ_DEMO_USERS_64) {
    const u = await backend.prepare(
      "SELECT id FROM users WHERE username = ? AND role = 'user' AND status = 'active'"
    ).get(username);
    if (!u) continue;
    const mine = await backend.prepare(
      'SELECT COUNT(*) AS c FROM quiz_attempts WHERE user_id = ?'
    ).get(u.id);
    if (mine && mine.c >= 3) continue;
    // সবচেয়ে সাম্প্রতিক want-টি কুইজ, কালানুক্রমিক (পুরনো→নতুন) উত্তর
    const picks = quizzes.slice(0, Math.min(want, quizzes.length)).reverse();
    for (let i = 0; i < picks.length; i++) {
      const q = picks[i];
      const correct = pattern[i % pattern.length] ? 1 : 0;
      let opts = [];
      try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
      let choice = q.answer;
      if (!correct && Array.isArray(opts) && opts.length > 1) {
        choice = (q.answer + 1 + i) % opts.length;
        if (choice === q.answer) choice = (q.answer + 1) % opts.length;
      }
      const when = fmt(Date.now() - (picks.length - i) * 36 * 3600000 - (username.length * 777) * 60000);
      try {
        const r = await backend.prepare(
          'INSERT OR IGNORE INTO quiz_attempts (user_id, quiz_id, choice, correct, answered_at) VALUES (?, ?, ?, ?, ?)'
        ).run(u.id, q.id, choice, correct, when);
        inserted += (r.changes || r.rowsAffected || 0);
      } catch (e) { /* UNIQUE-সংঘর্ষ/ইত্যাদি — চলমান থাকুক */ }
    }
  }
  if (inserted) console.log('[db] quizDemoAttemptsBackfill64: seeded', inserted, 'demo attempt(s) — leaderboard visible');
}

// সেশন ৬৭: TOC-ডেমো-লেখা — সেশন ৬৫-এর অটো-সূচিপত্র (##/### হেডিং) এখনো লাইভে
// কোনো লেখায় দৃশ্যমান ছিল না (কনটেন্ট-নির্ভর ফিচার; লাইভে কেউ ## লেখেনি)।
// এই এককালীন ব্যাকফিল নতুন লেখকদের জন্য একটি সহায়িকা-ধরনের ডেমো-লেখা যোগ
// করে যাতে ৫টি ## + ২টি ### সেকশন আছে — ফলে লাইভে সূচিপত্র-কার্ড, স্ক্রলস্পাই,
// H2/H3 এডিটর-টুলবারের ব্যবহার-উদাহরণ সবই দৃশ্যমান হয়। শিরোনাম-ম্যাচে
// idempotent — ডেমো-লেখা মুছে ফেললেও আর ফিরে আসে না।
async function tocDemoArticle67() {
  const TITLE67 = 'লেখার হাতে খড়ি: নতুন লেখকদের জন্য ধাপে ধাপে সহায়িকা';
  const existing = await backend.prepare("SELECT id FROM posts WHERE title = ?").get(TITLE67);
  if (existing) return;
  // ডেমো-অথর: সাধারণ ইউজার-রোল (monem), না থাকলে karishma, শেষ ফলব্যাক ismail।
  const author = (await backend.prepare("SELECT id, username FROM users WHERE username = 'monem' AND status = 'active'").get())
               || (await backend.prepare("SELECT id, username FROM users WHERE username = 'karishma' AND status = 'active'").get())
               || (await backend.prepare("SELECT id, username FROM users WHERE username = 'ismail' AND status = 'active'").get());
  if (!author) return; // ডেমো-ইউজার নেই — খালি ইনস্টলে seedDemoContent পরে চলবে
  const body67 = [
    'লেখা শেখার কোনো শর্টকাট নেই — আছে শুধু নিয়মিত চর্চার দীর্ঘ পথ। এই সহায়িকায় সেই পথের প্রথম কয়েকটি ধাপ ধরে ধরে দেখানো হলো, যেন নতুন যে-কোনো লেখক আজই শুরু করতে পারেন। লেখক ফোরামের সম্মুখভাগে নিয়মিত যে-প্রশ্নগুলো আসে — “কীভাবে শুরু করব?”, “কোথা থেকে শিখব?” — তারই সমাধান-সূত্র এখানে।',
    '',
    '## প্রথম ধাপ: পাঠের ভিত গড়া',
    '',
    'ভালো লেখক হওয়ার আগে ভালো পাঠক হতে হয়। প্রতিদিন অন্তত বিশ মিনিট গুণগতভাবে পড়ুন — কবিতা, গল্প, প্রবন্ধ যা-ই হোক। পড়ার সময় লক্ষ্য করুন লেখক কীভাবে বাক্য সাজাচ্ছেন, কোথায় থামছেন, কোথায় ছুটছেন। এই নিঃশব্দ পর্যবেক্ষণই আপনার নিজের লেখার ভিত তৈরি করবে।',
    '',
    '### বই বাছাইয়ের সূত্র',
    '',
    'যুগ ধরে টিকে থাকা লেখা দিয়ে শুরু করুন; পাশাপাশি সমকালীন লেখকদেরও পড়ুন, যেন ভাষার চলতি স্রোতটাও ধরা পড়ে। একই ধরনের দুটি বই পাশাপাশি পড়লে রীতির তুলনা নিজেই স্পষ্ট হয়।',
    '',
    '### পড়ার খাতা রাখুন',
    '',
    'যে-বাক্য, যে-উপমা আপনাকে থামিয়ে দেয়, সেটি খাতায় টুকে রাখুন। মাসের শেষে খাতাটি পুনরায় পড়লে দেখবেন আপনার নিজের রুচির একটি মানচিত্র তৈরি হয়ে গেছে — সেটিই আপনার লেখার দিকনির্দেশ।',
    '',
    '## দ্বিতীয় ধাপ: নিয়মিত লেখার অভ্যাস',
    '',
    'অনুপ্রেরণার জন্য অপেক্ষা করবেন না — অভ্যাসই অনুপ্রেরণাকে ডেকে আনে। প্রতিদিন নির্দিষ্ট সময়ে, সম্ভব হলে একই জায়গায় বসে লিখুন। প্রথম দিকে দিনে দুই-তিন অনুচ্ছেদই যথেষ্ট। মোটা খাতায় লিখলে ফের মুছে লেখার ভয়টাও কমে যায়।',
    '',
    '## তৃতীয় ধাপ: খসড়া থেকে পরিমার্জন',
    '',
    'প্রথম খসড়ার কাজ শুধু হাঁটু ছোঁড়া — মানে নিখুঁত হওয়া নয়, প্রবাহিত হওয়া। লেখা শেষ হলে এক রাত পুরোনো করে রাখুন; পরদিন জোরে জোরে পড়ে শুনুন — যেখানে নিঃশ্বাস আটকায়, সেখানেই বাক্য কাটা দরকার। বিশেষণ আর খাঁটি শব্দ যাচাই করুন: প্রতিটি শব্দ যেন মাইনে রাখে।',
    '',
    '## চতুর্থ ধাপ: প্রতিক্রিয়া নিয়ে বাড়ানো জ্ঞান',
    '',
    'লেখা একা-ঘরে বন্ধ থাকলে বাড়ে না। লেখক ফোরামের মতো সম্প্রদায়ে নিজের লেখা প্রকাশ করুন, অন্যের লেখায় মন্তব্য করুন — অন্যকে দেওয়া সৎ সমালোচনা নিজের চোখও ধারালো করে। প্রতিক্রিয়া যত আগে, বৃদ্ধি তত দ্রুত।',
    '',
    '## প্রকাশের সাহস',
    '',
    'নিখুঁত হওয়ার অপেক্ষায় প্রকাশ করা যায় না — নিখুঁতি আসে প্রকাশের পরেই। আজই ছোট একটা লেখা সাজিয়ে ফেলুন, সম্প্রদায়ে দিন, প্রতিক্রিয়া নিন। কলম যত বাহিরে বেরোবে, তত শাণ পাবে। শুভকামনা — আপনার প্রথম লাইনটি এখনই লেখা হোক।'
  ].join('\n');
  await backend.prepare(
    `INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, status, category, featured, view_count, published_at)
     VALUES (?, 'article', ?, ?, ?, ?, ?, 'published', 'column', 1, 0, datetime('now'))`
  ).run(
    author.id, TITLE67, body67,
    'লেখা শেখার কোনো শর্টকাট নেই — আছে শুধু নিয়মিত চর্চার দীর্ঘ পথ। নতুন লেখকদের জন্য ধাপে ধাপে সহায়িকা: পাঠের ভিত, দৈনিক অভ্যাস, পরিমার্জন, সম্প্রদায়ের প্রতিক্রিয়া আর প্রকাশের সাহস।',
    '/img/cover/tocguide67/800/400',
    'সহায়িকা,লেখালেখি,নতুন লেখক'
  );
  console.log('[db] tocDemoArticle67: seeded TOC demo article (5×H2 + 2×H3) by @' + author.username);
}

// সিকিউরিটি সেটিংস — ডিফল্ট নিরাপদ মান (fail-closed)। অ্যাডমিন পরে টগল করতে পারে।
async function seedSecuritySettings() {
  const defaults = [
    ['account_claim_requires_admin_approval', '0'],  // ক্লেইম অটো-অনুমোদন (ডিফল্ট)
    ['require_registration_approval', '0'],          // রেজিস্ট্রেশন অটো-অ্যাক্টিভ
    // নোট: REQUIRE_MFA_FOR_ADMIN সিড করি না — ডিফল্ট true (fail-closed) থাকে;
    // MFA প্রয়োগ হয় totp_enabled কলামের উপর (এনরোলড হলেই বাধ্যতামূলক)।
  ];
  for (const [k, v] of defaults) {
    try { await backend.prepare("INSERT INTO settings (key, value) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = ?)").run(k, v, k); } catch (e) {}
  }
}

// ── টাস্ক ১৪: মেম্বার আইডি ব্যবস্থাপনা ──────────────────────────────────────
// MEM-XXXXX ফরম্যাটে ইউনিক মেম্বার আইডি। আইডি একটি identifier — সিক্রেট নয়।
function formatMemberId(n) { return 'MEM-' + String(n).padStart(5, '0'); }

// পরবর্তী সিকোয়েন্স নাম্বার (বিদ্যমান MEM-XXXXX গুলোর সর্বোচ্চ + ১)
async function nextMemberSeq() {
  try {
    const row = await backend.prepare(
      "SELECT MAX(CAST(SUBSTR(member_id, 5) AS INTEGER)) AS m FROM members WHERE member_id LIKE 'MEM-%'"
    ).get();
    return ((row && row.m) ? Number(row.m) : 0) + 1;
  } catch (e) { return 1; }
}

async function nextMemberId() {
  const seq = await nextMemberSeq();
  return formatMemberId(seq);
}

// বিদ্যমান মেম্বারদের MEM-XXXXX দিন (শুধু যাদের এখনো নেই) + account_status ডিফল্ট।
// ইউজার-সিদ্ধান্ত: "unclaimed_keep_link" — সব বিদ্যমান প্রোফাইল fresh claim ফ্লো দিয়ে
// শুরু করবে (account_status='unclaimed'), কিন্তু user_id লিংক অক্ষত থাকবে (বিদ্যমান
// লগইন ভাঙবে না; ডুপ্লিকেট প্রোফাইল তৈরি হবে না)। account_status এখন claim-state
// (unclaimed/pending/active/suspended), user_id নয়।
// Idempotent — প্রতি বুটে নিরাপদ; অনুমোদিত (claimed_at set) প্রোফাইল কখনো রিসেট হয় না।
async function backfillMemberIds() {
  try {
    await backend.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id)");
  } catch (e) {}
  const rows = await backend.prepare('SELECT id, user_id FROM members ORDER BY id').all();
  let seq = await nextMemberSeq();
  for (const r of (rows || [])) {
    const has = await backend.prepare('SELECT member_id FROM members WHERE id = ?').get(r.id);
    if (has && has.member_id) continue; // আগেই আছে
    const mid = formatMemberId(seq++);
    try { await backend.prepare('UPDATE members SET member_id = ? WHERE id = ?').run(mid, r.id); } catch (e) {}
  }
  // ১) ডিফল্ট: খালি account_status → 'unclaimed'
  await backend.exec("UPDATE members SET account_status = 'unclaimed' WHERE account_status IS NULL OR account_status = ''");
  // ২) এক-কালীন রিসেট (টাস্ক ১৪): আগের ভুল backfill লিংকড মেম্বারদের 'active' করে
  //    দিয়েছিল। claimed_at NOT NULL হলে = সত্যিকারের অনুমোদিত (অ্যাডমিন ফ্লো) — সেগুলো
  //    অক্ষত থাকবে। শুধু লিগ্যাসি অটো-লিংক (claimed_at NULL) গুলো 'unclaimed' হয়।
  try {
    const done = await backend.prepare("SELECT value FROM settings WHERE key = 't14_unclaimed_reset'").get();
    if (!done) {
      await backend.exec("UPDATE members SET account_status = 'unclaimed' WHERE account_status = 'active' AND claimed_at IS NULL");
      await backend.prepare("INSERT INTO settings (key, value) VALUES ('t14_unclaimed_reset', '1')").run();
    }
  } catch (e) { /* settings টেবিল না থাকলে স্কিপ */ }
}

// Auto-link committee / advisory / past leaders to their registered user
// accounts by matching full name. Runs once per deploy; safe on every boot.
async function autoLinkMembersToUsers() {
  const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const alphaOnly = (s) => norm(s).replace(/[^a-z0-9\u0980-\u09ff]/g, '');
  const fuzzyContains = (a, b) => {
    const aa = alphaOnly(a), bb = alphaOnly(b);
    return (aa.length > 3 && bb.length > 3) && (aa.includes(bb) || bb.includes(aa));
  };
  const tables = ['members', 'past_leaders'];
  for (const t of tables) {
    const rows = await backend.prepare(`SELECT id, name FROM ${t} WHERE user_id IS NULL`).all();
    if (!rows || !rows.length) continue;
    const users = await backend.prepare('SELECT id, full_name FROM users WHERE full_name IS NOT NULL').all();
    for (const r of rows) {
      const rn = norm(r.name);
      let match = users.find(u => norm(u.full_name) === rn);
      if (!match) match = users.find(u => fuzzyContains(r.name, u.full_name) || fuzzyContains(u.full_name, r.name));
      if (match) {
        await backend.prepare(`UPDATE ${t} SET user_id = ? WHERE id = ? AND user_id IS NULL`).run(match.id, r.id);
      }
    }
  }
}

// ── Moderator scope catalogue (used by admin/moderator routes) ────────────
const MODERATOR_SCOPES = [
  { key: 'quiz',        label: 'আজকের কুইজ' },
  { key: 'this_day',    label: 'আজকের এই দিনে' },
  { key: 'best_writer', label: 'মাসিক সেরা লেখক' },
  { key: 'activity',    label: 'সাংগঠনিক কার্যক্রম' },
  { key: 'notice',      label: 'বিজ্ঞপ্তি' },
  { key: 'epaper',      label: 'আজকের ই-পেপার' },
  { key: 'event',       label: 'ইভেন্ট পেইজ' },
  { key: 'complaints',  label: 'অভিযোগ দেখা' },
  { key: 'content',     label: 'সেকশন কন্টেন্ট (সেশন ৪২)' },
  // সেশন ৮৩: ইউজার তদারকি — মডারেটর ইউজার-নিষেধ/ফেরত (রোল নয়) পরিচালনা করবে
  { key: 'user_mgmt',   label: 'ইউজার তদারকি' },
  // সেশন ১০১: রিসোর্স আপলোড — মডারেটরও অডিও/ভিডিও/পিডিএফ/ছবি-রিসোর্স প্রকাশ করবে
  { key: 'resources',   label: 'রিসোর্স' }
];

// ────────────────────────────────────────────────────────────────────────────
// Backend wrapper — exposes a unified `prepare()` interface.
// ────────────────────────────────────────────────────────────────────────────

let backend;        // 'sqljs' | 'turso'
let _sqlJsDb;       // sql.js Database
let _tursoClient;   // @libsql/client
let _saveTimer;     // debounce for local disk save

function normalizeParams(params) {
  return (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
}

// ── sql.js implementation ──────────────────────────────────────────────────
function makeSqlJsBackend(SQL, initialBuffer) {
  if (initialBuffer) {
    _sqlJsDb = new SQL.Database(initialBuffer);
  } else if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _sqlJsDb = new SQL.Database(buf);
  } else {
    _sqlJsDb = new SQL.Database();
  }

  // ── Content management helpers ──────────────────────────────────────────────
// getContent(page, key) → reads from settings table with key 'content_<page>_<key>'
// setContent(page, key, value) → writes to settings table
// getAllContent() → returns all content_* keys as { page: { key: value } }
function getContentSync(settingsMap, page, key, fallback) {
  const fullKey = 'content_' + page + '_' + key;
  return (settingsMap && fullKey in settingsMap) ? settingsMap[fullKey] : (fallback !== undefined ? fallback : '');
}

async function getContent(page, key, fallback) {
  const val = await getSetting('content_' + page + '_' + key);
  return val !== null ? val : (fallback !== undefined ? fallback : '');
}

function setContent(page, key, value) {
  return setSetting('content_' + page + '_' + key, value);
}

function saveDb() {
    const data = Buffer.from(_sqlJsDb.export());
    if (USE_DB_SNAPSHOT) {
      // /tmp is writable on serverless — keeps the live instance consistent
      try { fs.writeFileSync('/tmp/lekhok.db', data); } catch (_) {}
      // Debounced upload to Vercel Blob (survives cold starts)
      _snapshotDirty = true;
      if (_uploadTimer) clearTimeout(_uploadTimer);
      _uploadTimer = setTimeout(uploadSnapshot, 400);
      return;
    }
    // No Turso, no Blob token configured: best-effort local write. This path
    // works for local dev (DB_PATH is a normal writable file) but will throw
    // EROFS if it ever runs on Vercel's read-only bundle filesystem — fall
    // back to /tmp so the app still boots (without persistence) rather than
    // crashing outright if someone deploys before setting up Blob or Turso.
    try {
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      try { fs.writeFileSync('/tmp/lekhok.db', Buffer.from(data)); } catch (_) {}
    }
  }
  async function uploadSnapshot() {
    _uploadTimer = null;
    if (!USE_DB_SNAPSHOT) return;
    _snapshotDirty = false;
    try {
      const { put } = require('@vercel/blob');
      const data = Buffer.from(_sqlJsDb.export());   // fresh state at upload time
      await put(SNAPSHOT_PATH, data, {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN,
        contentType: 'application/octet-stream'
      });
      _lastBlobUploadAt = Date.now(); // সেশন ১৭৯: নিজের আপলোড মনে রাখি — রি-সিঙ্ক এড়াতে
      console.log('[db] Snapshot saved to Vercel Blob (' + data.length + ' bytes)');
    } catch (e) {
      console.error('[db] Snapshot upload failed:', e.message);
    }
  }

  // ── সেশন ১৭৯: হট-রি-সিঙ্ক — অন্য ইনস্ট্যান্সের নতুন স্ন্যাপশট এলে নিজের কপি
  // বদলে ফেলা। force=true → থ্রটল প্রায়-বন্ধ (অ্যাডমিন-পেজ/সেভ), নইলে ৪৫সে থ্রটল।
  // রেস-সেফটি: সোয়াপ-এর ঠিক-আগে _snapshotDirty রিচেক — ফেচ-চলাকালীন রাইট
  // এলে সোয়াপ বাতিল (রাইট হারানো-রোধ); রিচেক-থেকে-সোয়াপ সিঙ্ক্রোনাস ব্লক।
  async function syncIfStale(force) {
    if (!USE_DB_SNAPSHOT) return false;
    if (_snapshotDirty) return false; // আমার অ-আপলোডেড রাইট আছে — রিলোডে হারাবে; ডিবাউন্স-আপলোডই পথ
    const now = Date.now();
    if (now - _lastSyncCheckAt < (force ? 2000 : 45000)) return false;
    if (_syncInFlight) return _syncInFlight;
    _lastSyncCheckAt = now;
    _syncInFlight = (async () => {
      try {
        const { list } = require('@vercel/blob');
        const res = await list({ prefix: SNAPSHOT_PATH, limit: 1, token: BLOB_TOKEN });
        const hit = res.blobs && res.blobs.length ? res.blobs[0] : null;
        if (!hit) return false;
        const ua = typeof hit.uploadedAt === 'number' ? hit.uploadedAt : (Date.parse(hit.uploadedAt || '') || 0);
        if (!(ua > _lastBlobUploadAt + 1500)) return false; // অন্য-ইনস্ট্যান্স-আপলোড নেই
        const r = await fetch(hit.url);
        if (!r.ok) return false;
        const buf = Buffer.from(await r.arrayBuffer());
        if (_snapshotDirty) return false; // ফেচ-চলাকালীন রাইট এসেছে → সোয়াপ বাতিল
        const fresh = new SQL.Database(buf);
        try { _sqlJsDb.close(); } catch (_) {}
        _sqlJsDb = fresh;
        _lastBlobUploadAt = ua;
        console.log('[db] Hot re-sync from Vercel Blob (' + buf.length + ' bytes, uploadedAt=' + new Date(ua).toISOString() + ')');
        return true;
      } catch (e) {
        console.warn('[db] Hot re-sync skipped:', e.message);
        return false;
      } finally {
        _syncInFlight = null;
      }
    })();
    return _syncInFlight;
  }
  function persist() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(saveDb, 200);
  }
  function wrapStmt(stmt) {
    return {
      all: (...params) => {
        const result = [];
        stmt.bind(normalizeParams(params));
        while (stmt.step()) result.push(stmt.getAsObject());
        stmt.reset();
        return result;
      },
      get: (...params) => {
        stmt.bind(normalizeParams(params));
        const has = stmt.step();
        const row = has ? stmt.getAsObject() : null;
        stmt.reset();
        return row;
      },
      run: (...params) => {
        stmt.bind(normalizeParams(params));
        stmt.step();
        stmt.reset();
        const idRes = _sqlJsDb.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = idRes.length ? idRes[0].values[0][0] : undefined;
        persist();
        return { changes: _sqlJsDb.getRowsModified(), lastInsertRowid };
      }
    };
  }
  return {
    prepare: (sql) => wrapStmt(_sqlJsDb.prepare(sql)),
    exec:    (sql) => { _sqlJsDb.exec(sql); persist(); },
    save:    saveDb,
    flush:   uploadSnapshot,
    syncIfStale,
    type:    'sqljs'
  };
}

// ── Snapshot helpers (Vercel Blob, no-Turso deploys) ───────────────────────
async function fetchSnapshot() {
  if (!USE_DB_SNAPSHOT) return null;
  try {
    const { list } = require('@vercel/blob');
    const res = await list({ prefix: SNAPSHOT_PATH, limit: 1, token: BLOB_TOKEN });
    const hit = res.blobs && res.blobs.length ? res.blobs[0] : null;
    if (!hit) return null;
    const r = await fetch(hit.url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    // সেশন ১৭৯: বুটে যে-স্ন্যাপশট লোড হলো তার সময় মনে রাখি — নইলে প্রথম
    // রি-সিঙ্ক-যাচাইয়েই নিজের-সদ্য-লোড-করা স্ন্যাপশটকে "নতুন" ভেবে আবার নামাতাম।
    const ua = typeof hit.uploadedAt === 'number' ? hit.uploadedAt : (Date.parse(hit.uploadedAt || '') || 0);
    if (ua) _lastBlobUploadAt = ua;
    console.log('[db] Snapshot restored from Vercel Blob (' + buf.length + ' bytes)');
    return buf;
  } catch (e) {
    console.warn('[db] Snapshot restore skipped:', e.message);
    return null;
  }
}

// ── Turso implementation ───────────────────────────────────────────────────
function makeTursoBackend(client) {
  return {
    prepare: (sql) => ({
      all: async (...params) => {
        const r = await client.execute({ sql, args: normalizeParams(params) });
        return r.rows;
      },
      get: async (...params) => {
        const r = await client.execute({ sql, args: normalizeParams(params) });
        return r.rows[0] || null;
      },
      run: async (...params) => {
        const r = await client.execute({ sql, args: normalizeParams(params) });
        return { changes: r.rowsAffected, lastInsertRowid: Number(r.lastInsertRowid) };
      }
    }),
    exec: async (sql) => { await client.execute(sql); },
    save: () => {}, // no-op for cloud
    type: 'turso'
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Migration runner
// ────────────────────────────────────────────────────────────────────────────
async function runMigrations() {
  const stmts = MIGRATION_SQL
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  if (backend.type === 'turso') {
    for (const sql of stmts) {
      try { await backend.exec(sql); }
      catch (e) {
        const msg = e.message || '';
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[migrate]', msg.slice(0, 120));
        }
      }
    }
  } else {
    for (const sql of stmts) {
      try { backend.exec(sql); }
      catch (e) {
        const msg = e.message || '';
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[migrate]', msg.slice(0, 120));
        }
      }
    }
  }

  // Defensive ALTERs (for very old DBs)
  const alt = [
    "ALTER TABLE members ADD COLUMN member_type TEXT DEFAULT 'central'",
    "ALTER TABLE epaper_files ADD COLUMN drive_thumb_id TEXT",
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
    "ALTER TABLE complaints ADD COLUMN file_name TEXT",
    "ALTER TABLE users ADD COLUMN last_login DATETIME",
    "ALTER TABLE posts ADD COLUMN mentions TEXT",
    "ALTER TABLE posts ADD COLUMN shared_from INTEGER DEFAULT NULL",
    "ALTER TABLE posts ADD COLUMN share_count INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN cover_url TEXT",
    "ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'",
    "ALTER TABLE posts ADD COLUMN reactions TEXT DEFAULT '{}'",
    "ALTER TABLE comments ADD COLUMN reactions TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN notify_prefs TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN display_prefs TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN interests TEXT DEFAULT '[]'",
    "ALTER TABLE members ADD COLUMN term_year TEXT",
    "ALTER TABLE members ADD COLUMN user_id INTEGER",
    "ALTER TABLE resources ADD COLUMN file_url TEXT",
    "ALTER TABLE resources ADD COLUMN link_url TEXT",
    "ALTER TABLE resources ADD COLUMN file_type TEXT DEFAULT 'link'",
    "ALTER TABLE resources ADD COLUMN description TEXT",
    // সেশন ৯৩: সেশন-৮০-র ইউজার-কলামগুলো বুট-মাইগ্রেশনে — আগে শুধু /settings-
    // রুটের লেজি-ALTER-এ যোত (পুরনো DB-তে /settings ভিজিট না-হলে ফিড-কোয়েরির
    // 'u.pen_name' সরাসরি ৫০০ খেতো; এখন সব-কোল্ড-বুটে নিরাপদ-ইডেম্পটেন্ট)।
    "ALTER TABLE users ADD COLUMN pen_name TEXT",
    "ALTER TABLE users ADD COLUMN genres TEXT DEFAULT '[]'",
    "ALTER TABLE users ADD COLUMN allow_messages_from TEXT DEFAULT 'everyone'",
    "ALTER TABLE users ADD COLUMN bookmarks_public INTEGER DEFAULT 0",
    // সেশন ১১২: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ — JSON {type:'preset'|'typo'|'custom', value}
    // (helpers/covers.js একক-উৎস; হোমের 'লেখকদের কালি' রো-তে মিনি-প্রচ্ছদ রেন্ডার)
    ['posts', 'home_cover', 'TEXT'],
    // সেশন ৯৫: অ্যাকাউন্ট-রিকভারি — পাসওয়ার্ড-ট্র্যাকিং কলাম (LATER_COLUMNS-এর
    // প্রতিচ্ছবি; উভয় তালিকায় থাকা নিরাপদ — duplicate-column নিরীহ catch)।
    "ALTER TABLE users ADD COLUMN password_changed_at DATETIME",
    "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0",
    // সেশন ৭৭: সুপার-এডমিন প্যানেল — অ্যাডমিন অ্যাকাউন্টে কাজের-পরিধি (scopes),
    // লক-স্টেট ও শেষ-লগইন ট্র্যাকিং
    "ALTER TABLE admin_users ADD COLUMN scopes TEXT",
    "ALTER TABLE admin_users ADD COLUMN locked INTEGER DEFAULT 0",
    "ALTER TABLE admin_users ADD COLUMN last_login DATETIME",
    // সেশন ৯০: হোম-কিউরেশন — পোস্টের প্রকৃত শ্রেণি + এডমিন/মডারেটর নিয়ন্ত্রণ-ফ্ল্যাগ।
    // post_kind: 'writing' (আসল সাহিত্য) | 'question' | 'avatar_update' | 'cover_update'
    // | 'share' (অন্যের লেখার শেয়ার-কপি — সেশন ৯৪)
    // — type='article' এখনো সোশ্যাল-ফিডে অটো-পোস্ট দেখাতে ব্যবহৃত, তাই শ্রেণি-বিভাজন
    //   আলাদা কলামে; হোমপেজ/লেখা-তালিকা/সার্চ কেবল post_kind='writing' নেবে।
    "ALTER TABLE posts ADD COLUMN post_kind TEXT DEFAULT 'writing'",
    // home_featured: হোমপেজের 'লেখকদের কালি / সাম্প্রতিক লেখা'-তে দেখানোর নির্বাচন
    // (featured কলাম 'মাসিক সেরা লেখক'-র জন্য আগে থেকেই ব্যস্ত — তাই আলাদা ফ্ল্যাগ)
    "ALTER TABLE posts ADD COLUMN home_featured INTEGER DEFAULT 0",
    "ALTER TABLE posts ADD COLUMN home_featured_at TEXT",
    // archive_visible: 'সব লেখা দেখুন' (/articles) তালিকায় দৃশ্যমান কিনা —
    // মডারেটর/এডমিন যেকোনো লেখা তালিকা থেকে সরিয়ে রাখতে পারবেন (ডিফল্ট: দৃশ্যমান)
    "ALTER TABLE posts ADD COLUMN archive_visible INTEGER DEFAULT 1",
    // সেশন ১১২: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ (LATER_COLUMNS-এর প্রতিচ্ছবি —
    // উভয় তালিকায় থাকা নিরাপদ — duplicate-column নিরীহ catch)
    "ALTER TABLE posts ADD COLUMN home_cover TEXT",
    // সেশন ১৩১: গ্রহণকৃত-উত্তর (accepted answer) — প্রশ্নের (type='question') কোন
    // উত্তর (comments.id) প্রশ্নকর্তা কর্তৃক গ্রহীতা হিসেবে চিহ্নিত; NULL = এখনো নয়।
    // টগল-মডেল API: POST /api/qa/:id/accept-answer (routes/social.js)।
    "ALTER TABLE posts ADD COLUMN accepted_comment_id INTEGER DEFAULT NULL",
    // সেশন ১৫৩: FB-স্টাইল রিচ-কম্পোজার (ইউজার-স্পেক A-to-Z) —
    // rich_content: contentEditable-HTML (সার্ভার-স্যানিটাইজড — helpers/rich-sanitize.js);
    // NULL = ক্লাসিক (article-form) পোস্ট — পুরনো রেন্ডার-পথ অক্ষুণ্ণ।
    // background_color: 'Aa' গ্রেডিয়েন্ট-কী (fbg1..fbg8 — CSS-ক্লাস হোয়াইটলিস্ট)।
    // feeling/location: কম্পোজারের অনুভূতি/চেক-ইন চিপ। audience: PUBLIC | FRIENDS
    // (পারস্পরিক-অনুসরণ = বন্ধু) | ONLY_ME — helpers/shared-posts.js filterByAudience153।
    "ALTER TABLE posts ADD COLUMN rich_content TEXT",
    "ALTER TABLE posts ADD COLUMN background_color TEXT",
    "ALTER TABLE posts ADD COLUMN feeling TEXT",
    "ALTER TABLE posts ADD COLUMN location TEXT",
    "ALTER TABLE posts ADD COLUMN audience TEXT DEFAULT 'PUBLIC'",
    // post_images.media_type: 'image' | 'video' | 'audio' — একই টেবিলে মিডিয়া-কোলাজের
    // সমস্ত অ্যাটাচমেন্ট (sort_order = কোলাজ-ক্রম); ডিফল্ট 'image' = পুরনো-রো অক্ষত।
    "ALTER TABLE post_images ADD COLUMN media_type TEXT DEFAULT 'image'",
    // session243 — user_reports-মিডিয়া-ট্রায়ো (prod-schema-drift ফিক্স): CREATE-টেবিলে কলাম-তিনটি
    // ছিল কিন্তু পুরনো-প্রোড DB-তে অনুপস্থিত (defensive-ALTER-শূন্য) — ফলে প্রোডে মিডিয়া-ফিল্টার/
    // ব্যাজ/মিরর-সাইলেন্টলি-ডেড ছিল; scMediaCounts-এর-অবাধ-SELECT-ই-প্রথম-উন্মোচন (৫০০)।
    // বুটে idempotent-ALTER = স্বয়ং-নিরাময় (duplicate-column-ত্রুটি-নীরব-স্বাভাবিক)।
    "ALTER TABLE user_reports ADD COLUMN media_type TEXT DEFAULT 'TEXT'",
    "ALTER TABLE user_reports ADD COLUMN media_url TEXT",
    "ALTER TABLE user_reports ADD COLUMN media_name TEXT"
  ];
  for (const s of alt) {
    try { await backend.exec(s); } catch (_) {}
  }

  // ── সেশন ১০০-খ: রিসোর্স res_type লেগেসি-ব্যাকফিল (idempotent) ────────────────
  // session101-a-র res_type কলাম ALTER DEFAULT 'link' দিয়ে যোগ হয়েছে — পুরনো রোতে
  // file_type যা-ই থাকুক, res_type='link'-এ আটকে থাকে; ফলে পাবলিক কার্ড/অ্যাডমিন লিস্টে
  // পিডিএফ/অডিও/ভিডিও/ছবি সব 'লিংক' ব্যাজ দেখায়। বুটে একবার file_type থেকে ক্যানোনিক্যাল
  // মান বসিয়ে দিই (document→doc ম্যাপিং সহ); normalizeResType read-time ফলব্যাকও রইল।
  try {
    await backend.exec(`
      UPDATE resources
         SET res_type = CASE LOWER(COALESCE(file_type, ''))
                         WHEN 'document' THEN 'doc'
                         WHEN 'pdf'    THEN 'pdf'
                         WHEN 'audio'  THEN 'audio'
                         WHEN 'video'  THEN 'video'
                         WHEN 'image'  THEN 'image'
                         WHEN 'doc'    THEN 'doc'
                         ELSE 'link' END
       WHERE (res_type IS NULL OR res_type = 'link')
         AND file_type IS NOT NULL
         AND LOWER(file_type) IN ('pdf','audio','video','image','doc','document')
    `);
  } catch (_) {}

  // ── সেশন ৭৭: সুপার-এডমিন বুটস্ট্র্যাপ ──────────────────────────────────────
  // সাইটে যদি কোনো সুপার-এডমিন না থাকে, প্রথম (প্রাচীনতম) অ্যাডমিন অ্যাকাউন্টকে
  // একবার superadmin-এ উন্নীত করা হয় — idempotent, প্রতি বুটে নিরাপদ।
  try {
    await backend.exec(`
      UPDATE admin_users
         SET role = 'superadmin'
       WHERE id = (SELECT MIN(id) FROM admin_users)
         AND NOT EXISTS (SELECT 1 FROM admin_users WHERE role = 'superadmin')
    `);
  } catch (_) {}

  // ── সেশন ৯০: হোম-কিউরেশন — অটো-পোস্ট শ্রেণি-ব্যাকফিল ───────────────────────
  // প্রোফাইল/কভার-ছবি বদলালে সৃষ্ট সোশ্যাল-অ্যাক্টিভিটি পোস্টগুলো আগে
  // type='article' হিসেবে ঢুকত (কোডের পুরনো বাচনা: "… প্রোফাইল পিকচার আপডেট
  // করেছেন"; লাইভে পুরনো বাচনাও আছে: "… প্রোফাইল ছবির আপডেট করেছেন") — ফলে
  // হোমপেজের 'লেখকদের কালি' ও /articles-তালিকায় সাহিত্যের ছদ্মবেশে ঢুকে পড়ত।
  // এখন সেগুলো post_kind দিয়ে চিহ্নিত হয় এবং লেখা-সারফেস থেকে বাদ পড়ে
  // (সোশ্যাল ফিড/প্রোফাইল-টাইমলাইনে আগের মতোই থাকে)। Idempotent —
  // একবার 'avatar_update' হলে post_kind='writing'-গার্ড আর মেলে না।
  try {
    await backend.exec(`
      UPDATE posts SET post_kind = 'avatar_update', archive_visible = 0, home_featured = 0
       WHERE post_kind = 'writing'
         AND (title LIKE '%প্রোফাইল পিকচার আপডেট%'
           OR title LIKE '%প্রোফাইল ছবি%'
           OR body LIKE '%নতুন প্রোফাইল পিকচার%');
    `);
    // সেশন ৯১: এক exec-এ ৩ স্টেটমেন্ট ছিল — sql.js সহ্য করে কিন্তু Turso বলে
    // SQL_MANY_STATEMENTS এবং পুরো ব্যাকফিল নীরবে বাদ পড়ত; আলাদা exec-এ ভাঙা হলো।
    await backend.exec(`
      UPDATE posts SET post_kind = 'cover_update', archive_visible = 0, home_featured = 0
       WHERE post_kind = 'writing'
         AND (title LIKE '%কভার ফটো আপডেট%'
           OR title LIKE '%কভার ছবি%'
           OR body LIKE '%নতুন কভার ফটো%');
    `);
    await backend.exec(`
      UPDATE posts SET post_kind = 'question'
       WHERE post_kind = 'writing' AND type = 'question';
    `);
    // ── সেশন ৯৪: শেয়ার-কপি পুনঃশ্রেণিবদ্ধ ──
    // ইউজার-নির্দেশ: হোমপেজের 'লেখকদের কালি / সাম্প্রতিক লেখা' ও 'সব লেখা
    // দেখুন' তালিকায় কেবল মূল লেখকের অরিজিনাল পোস্ট আসবে — কোনো ইউজার অন্যের
    // পোস্ট নিজের টাইমলাইনে শেয়ার করলে সেই কপি কখনোই এই তালিকায় ঢুকবে না।
    // shared_from IS NOT NULL = শেয়ার-কপি (Prisma-প্ল্যানের isShared/originalPostId
    // → এখানে একটাই কলাম shared_from)। post_kind='share' মার্ক + লেখা-সারফেসের
    // দুই ফ্ল্যাগ রিসেট; সোশাল-ফিড/প্রোফাইল-টাইমলাইনে দৃশ্যমানতা অক্ষুণ্ণ।
    // Idempotent — একবার 'share' হলে post_kind='writing'-গার্ড আর মেলে না।
    await backend.exec(`
      UPDATE posts SET post_kind = 'share', archive_visible = 0, home_featured = 0
       WHERE shared_from IS NOT NULL AND post_kind = 'writing';
    `);
    // নিরাপত্তা-জাল: যেকোনো শেয়ার-কপি (post_kind যাই হোক) কখনোই হোম-নির্বাচিত/
    // আর্কাইভ-দৃশ্যমান থাকতে পারবে না — ঐতিহাসিক ভুল-নির্বাচন থাকলে পরিষ্কার।
    await backend.exec(`
      UPDATE posts SET home_featured = 0, archive_visible = 0
       WHERE shared_from IS NOT NULL AND (home_featured = 1 OR archive_visible = 1);
    `);
  } catch (e) {
    console.warn('[migrate] post-kind backfill:', (e.message || '').slice(0, 120));
  }

  // ── Data migration — global rebrand to the real branch identity ───────────
  // (1) settings: replace rows that still carry the old demo defaults. Only
  //     exact old values are updated, so admin-customized values are never
  //     clobbered. Idempotent — safe on every boot.
  const rebrand = [
    ['site_name',       'লেখক ফোরাম',            'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়'],
    ['tagline',         'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়', 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়।'],
    ['contact_phone',   '০১XXXXXXXXX',           '০১********* (বিকাশ/নগদ)'],
    ['contact_address', 'আপনার ক্যাম্পাস ঠিকানা',   'চট্টগ্রাম বিশ্ববিদ্যালয়, চট্টগ্রাম']
  ];
  for (const [k, oldV, newV] of rebrand) {
    try {
      await backend.prepare("UPDATE settings SET value = ? WHERE key = ? AND value = ?").run(newV, k, oldV);
    } catch (_) {}
  }
  // motto is a NEW key — old DBs don't have it; add it if missing.
  try {
    await backend.prepare("INSERT INTO settings (key, value) SELECT 'motto', 'তারুণ্যের শাণিত কলমে আলোকিত ধরনী' WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'motto')").run();
  } catch (_) {}

  // ── সেশন ৭৩ ডেটা-মাইগ্রেশন — picsum.photos কভার → লোকাল /img/cover/ ──────
  // picsum-এর নিজস্ব robots.txt Googlebot-কে ব্লক করে (Disallow: /), তাই
  // তাদের ইমেজ Google-এর রেন্ডারড স্ক্রিনশটে আসত না। প্রোডাকশন DB (Blob-
  // স্ন্যাপশট/টার্সো) পুরনো URL-ই ধরে রাখে, তাই seed-বদল যথেষ্ট নয় — বসবাস
  // করা সারিগুলোও এখানে রিরাইট করতে হয়। Idempotent: শুধু picsum-প্রিফিক্সযুক্ত
  // মান বদলায়, দ্বিতীয় বুটে no-op। prepare().run() → persist() → স্ন্যাপশট-
  // আপলোড অটো-শিডিউল হয়।
  try {
    const picsumTables = [
      ['posts',         'cover_image'],
      ['post_images',   'image_url'],   // লিস্ট-রুট আগে এটা দেখে — art1-10 এখানেই ছিল
      ['events',        'image_url'],
      ['gallery',       'image_url'],
      ['daily_content', 'image_url'],
      ['press_clippings','image_url'],
      ['members',       'image_url'],
      ['achievements',  'image_url'],
      ['past_leaders',  'photo_url'],
    ];
    let picsumFixed = 0;
    for (const [tbl, col] of picsumTables) {
      try {
        const r = await backend.prepare(
          `UPDATE ${tbl} SET ${col} = REPLACE(${col}, 'https://picsum.photos/seed/', '/img/cover/') ` +
          `WHERE ${col} LIKE 'https://picsum.photos/seed/%'`
        ).run();
        picsumFixed += (r && r.changes) || 0;
      } catch (_) { /* টেবিল/কলাম না থাকলে স্কিপ */ }
    }
    if (picsumFixed > 0) {
      console.log('[db] picsum→local cover migration: rewrote ' + picsumFixed + ' row(s)');
    }
  } catch (_) { /* non-fatal */ }

  // ── সেশন ৪০ মাইগ্রেশন ────────────────────────────────────────────────────
  // (40a) nav_json: কার্যনির্বাহী পরিষদে 'স্থায়ী পরিষদ' + রিসোর্সে ২ সাব-পেজ ড্রপডাউন
  try {
    const navRow40 = await backend.prepare("SELECT value FROM settings WHERE key = 'nav_json' AND value != ''").get();
    if (navRow40 && navRow40.value) {
      let nav40 = JSON.parse(navRow40.value); let changed40 = false;
      const com40 = (nav40 || []).find(i => i && i.href === '/committee');
      if (com40 && Array.isArray(com40.children) && !com40.children.some(c => c.href === '/committee/permanent')) {
        const at = com40.children.findIndex(c => c.href === '/committee');
        com40.children.splice(at + 1, 0, { label: 'স্থায়ী পরিষদ', href: '/committee/permanent', icon: 'fa-award' });
        changed40 = true;
      }
      const res40 = (nav40 || []).find(i => i && i.href === '/resources');
      if (res40 && !res40.children) {
        res40.children = [
          { label: 'গুরুত্বপূর্ণ ফাইল ও রিসোর্স', href: '/resources', icon: 'fa-folder-open' },
          { label: 'পত্রিকার ইমেইল', href: '/resources/emails', icon: 'fa-envelope' }
        ];
        changed40 = true;
      }
      if (changed40) await backend.prepare("UPDATE settings SET value = ? WHERE key = 'nav_json'").run(JSON.stringify(nav40));
    }
  } catch (e) { console.error('[db] nav 40 migration (non-fatal):', e.message); }
  // (40b) স্থায়ী পরিষদ সিড — ৫ সদস্য, ইউজার-আইডি লিংকড (ফটো কার্ড পাবলিক পেজে)
  try {
    const pc40 = await backend.prepare("SELECT COUNT(*) AS c FROM members WHERE member_type = 'permanent'").get();
    if (!pc40 || pc40.c === 0) {
      const pu40 = await backend.prepare("SELECT id, full_name FROM users WHERE status = 'active' AND role = 'user' ORDER BY id LIMIT 5").all();
      const proles40 = ['আহ্বায়ক', 'সদস্য সচিব', 'স্থায়ী সদস্য', 'স্থায়ী সদস্য', 'স্থায়ী সদস্য'];
      for (let i = 0; i < pu40.length; i++) {
        await backend.prepare("INSERT INTO members (name, role, member_type, user_id, sort_order) VALUES (?, ?, 'permanent', ?, ?)")
          .run(pu40[i].full_name, proles40[i], pu40[i].id, i + 1);
      }
      if (pu40.length) console.log(`[db] ✓ স্থায়ী পরিষদ seeded: ${pu40.length} সদস্য (user-linked)`);
    }
  } catch (e) { console.error('[db] permanent seed (non-fatal):', e.message); }

  // (1b) nav_json migration — /press page (পত্রিকায় আমাদের নিউজ) into the
  //      পরিচিতি submenu of ANY customized menu, keeping admin edits intact.
  //      Idempotent: skipped when /press already present anywhere.
  try {
    const navRow = await backend.prepare("SELECT value FROM settings WHERE key = 'nav_json' AND value != ''").get();
    if (navRow && navRow.value && !String(navRow.value).includes('"/press"') && !String(navRow.value).includes("'\/press'")) {
      const nav = JSON.parse(navRow.value);
      const parent = nav.find(m => m.href === '/about' || m.label === 'পরিচিতি');
      if (parent && Array.isArray(parent.children)) {
        const magIdx = parent.children.findIndex(c => (c.href || '').startsWith('/about#magazine'));
        const item = { label: 'পত্রিকায় আমাদের নিউজ', href: '/press', icon: 'fa-newspaper' };
        if (magIdx >= 0) parent.children.splice(magIdx + 1, 0, item);
        else parent.children.push(item);
        await backend.prepare("UPDATE settings SET value = ? WHERE key = 'nav_json'").run(JSON.stringify(nav));
      }
    }
  } catch (_) {}

  // (1c) em dash cleanup in seeded demo content — session 27 rule: zero
  //      visible em dashes site-wide. Fresh seeds now ship clean (see the
  //      seeders below), but DBs created before that fix still carry the old
  //      strings. Exact-match UPDATE only, so any admin-edited text is never
  //      clobbered. Idempotent — safe on every boot.
  const emdashFixes = [
    ['posts', 'title',   'কোন ভাষায় লিখব — বাংলা নাকি ইংরেজি?', 'কোন ভাষায় লিখব, বাংলা নাকি ইংরেজি?'],
    ['posts', 'body',    'আমার কাছে রবীন্দ্রনাথ, নজরুল, জীবনানন্দ — সকলেই অনুপ্রেরণাদায়ী। আপনার প্রিয় কে?', 'আমার কাছে রবীন্দ্রনাথ, নজরুল, জীবনানন্দ, সকলেই অনুপ্রেরণাদায়ী। আপনার প্রিয় কে?'],
    ['posts', 'body',    'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত — এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত, এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।'],
    ['posts', 'excerpt', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত — এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত, এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।'],
    ['posts', 'body',    'সংক্ষিপ্ত আকারে বিশাল কথা বলা — এটাই ছোটগল্পের শিল্প।', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা, এটাই ছোটগল্পের শিল্প।'],
    ['posts', 'excerpt', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা — এটাই ছোটগল্পের শিল্প।', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা, এটাই ছোটগল্পের শিল্প।'],
    ['users', 'bio',     'ডেমো মডারেটর অ্যাকাউন্ট — মডারেটর প্যানেল পরীক্ষার জন্য।', 'ডেমো মডারেটর অ্যাকাউন্ট, মডারেটর প্যানেল পরীক্ষার জন্য।'],
    ['gallery', 'caption', 'সম্মেলনের একাংশ — কবি ও লেখকদের পদচারণায় মুখরিত ছিল পুরো মঞ্চ।', 'সম্মেলনের একাংশ, কবি ও লেখকদের পদচারণায় মুখরিত ছিল পুরো মঞ্চ।'],
    ['daily_content', 'body',  'মূলত ৩ প্রকার — মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত।', 'মূলত ৩ প্রকার: মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত।'],
    ['daily_content', 'title', 'সাপ্তাহিক ম্যাগাজিন — সপ্তাহ ১', 'সাপ্তাহিক ম্যাগাজিন, সপ্তাহ ১']
  ];
  for (const [tbl, col, oldV, newV] of emdashFixes) {
    try {
      await backend.prepare(`UPDATE ${tbl} SET ${col} = ? WHERE ${col} = ?`).run(newV, oldV);
    } catch (_) {}
  }

  // (2) committee: dedupe race-created duplicates first (serverless cold boots
  //     can run the old check-then-insert concurrently), merge any user_id the
  //     duplicates carried onto the kept row, then enforce uniqueness with a
  //     UNIQUE index so concurrent boots can never duplicate again.
  try {
    await backend.exec(`UPDATE members SET user_id = (
      SELECT m2.user_id FROM members m2
      WHERE m2.name = members.name AND IFNULL(m2.term_year,'') = IFNULL(members.term_year,'')
        AND m2.member_type = members.member_type AND m2.user_id IS NOT NULL
      LIMIT 1
    ) WHERE user_id IS NULL`);
  } catch (_) {}
  try {
    await backend.exec(`DELETE FROM members WHERE id NOT IN (
      SELECT MIN(id) FROM members GROUP BY name, IFNULL(term_year,''), member_type
    )`);
  } catch (_) {}
  try {
    await backend.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_members_unique_name_term ON members(name, IFNULL(term_year,''), member_type)");
  } catch (_) {}

  //     drop the fake demo ২০২৫-২০২৬ central committee (exact seed-list match
  //     only — admin-added real members are never touched), then ensure the
  //     real ২০২১-২২ branch committee exists.
  const FAKE_DEMO_COMMITTEE = [
    'ইসমাইল হোসেন', 'মোনেম শাহরিয়ার শাওন', 'কারিশমা ইরিন এ্যামি', 'আজিজ ওয়েসি',
    'মোঃ রেজাউল করিম', 'মোঃ নাঈম মিজি', 'মাহফুজ রহমান', 'মাহমুদুল হাসান শাকিব',
    'জান্নাতুল ফেরদৌস ইকরা', 'নুসরাত সুলতানা', 'রাসেল হোসেন সাকিব', 'সানজিদা আফরোজ',
    'আব্দুল্লাহ আল নাঈম', 'আবরার আহাদ রাফি', 'ঋতু আক্তার'
  ];
  try {
    await backend.prepare(
      `DELETE FROM members WHERE member_type = 'central' AND term_year = '২০২৫-২০২৬'
       AND name IN (${FAKE_DEMO_COMMITTEE.map(() => '?').join(',')})`
    ).run(...FAKE_DEMO_COMMITTEE);
  } catch (_) {}

  const BRANCH_TERM = '২০২১-২২';
  // v2 migration-এর পর ২০২১-২২ কমিটি অফিসিয়াল বাংলা তালিকায় সংশোধিত
  // (নিচে committee-history v2 ব্লক)। পুরনো ইংরেজি ডেমো তালিকাটি প্রতি বুটে
  // জোরপূর্বক মুছে ফেলা হয় — exact seed-list match, অ্যাডমিন-যোগকৃত সদস্য
  // কখনো স্পর্ষ হয় না। ('আয়েশা সিদ্দিকা এ্যানি' নতুন তালিকাতেও আছেন, তাই বাদ।)
  const LEGACY_BRANCH_ROWS = [
    'Md. Rafsan', 'K.M. Akij Mahmud', 'Mushfiqur Rahman Emon', 'Rabby Hasan',
    'Jannatul Ferdous SaYma', 'Murad Hoshen', 'Tawhida Akter', 'Sk Rafiquzzaman'
  ];
  try {
    await backend.prepare(
      `DELETE FROM members WHERE member_type = 'central' AND term_year = ?
       AND name IN (${LEGACY_BRANCH_ROWS.map(() => '?').join(',')})`
    ).run(BRANCH_TERM, ...LEGACY_BRANCH_ROWS);
  } catch (_) {}

  // ── Committee history (২০২১-২২ → ২০২৪-২৫) with a user account per member ──
  // The user asked for EVERY committee member to have a user id so the whole
  // committee page is clickable through to /profile/:username (social feed).
  // Data source: the two official PDF notifications (smarok no.
  // বাতকলোকেশন/বিরিব/০১/২০-২৪ dated ০৬/০৯/২০২৩ and /বিরিব/২৪-২৫ dated
  // ২৩/০১/২৫) plus the already-seeded ২০২১-২২ list.
  //   [name, role, username-slug, gender]
  // Names already owning an account (exact full_name match — e.g. the karishma
  // demo account) are LINKED, never duplicated. Fresh accounts get a random
  // password (owner claims it later via admin password reset).
  const ORG_DESIG_SUFFIX = 'লেখক ফোরাম';
  const COMMITTEE_HISTORY = [
    { term: '২০২১-২২', members: [
      ['Md. Rafsan',             'সভাপতি',              'md_rafsan',        'male'],
      ['K.M. Akij Mahmud',       'সাধারণ সম্পাদক',         'akij_mahmud',      'male'],
      ['Mushfiqur Rahman Emon',  'সাংগঠনিক সম্পাদক',       'mushfiqur_emon',   'male'],
      ['Rabby Hasan',            'অর্থ সম্পাদক',           'rabby_hasan',      'male'],
      ['Jannatul Ferdous SaYma', 'দপ্তর সম্পাদক',           'jannatul_sayma',   'female'],
      ['Murad Hoshen',           'উপ দপ্তর সম্পাদক',        'murad_hoshen',     'male'],
      ['আয়েশা সিদ্দিকা',       'প্রচার সম্পাদক',         'ayesha_siddika_anny', 'female'],
      ['Tawhida Akter',          'উপ প্রচার সম্পাদক',       'tawhida_akter',    'female'],
      ['Sk Rafiquzzaman',        'প্রশিক্ষণ বিষয়ক সম্পাদক',   'sk_rafiquzzaman',  'male']
    ]},
    { term: '২০২২-২৩', members: [

      ['মো. ইউছাফুল ইসলাম সিকাত',   'সভাপতি',                 'yousuful_islam_sikat', 'male'],
      ['মো. সাইফুল মিয়া',          'সহ-সভাপতি',               'saiful_mia',           'male'],
      ['রেদওয়ান আহমেদ',            'সাধারণ সম্পাদক',           'redwan_ahmed',         'male'],
      ['গিরেন্দ্র চক্রবর্তী',           'যুগ্ম সাধারণ সম্পাদক',      'nibed_chakraborty',    'male'],
      ['মাহফুজুর রহমান',            'সাংগঠনিক সম্পাদক',         'mahmudul_rahman',      'male'],
      ['আসামুজ্জামান চৌধুরী সহাট',   'সহ-সাংগঠনিক সম্পাদক',      'asamuzzaman_chowdhury', 'male'],
      ['মো. আজিজুল হক',           'অর্থ সম্পাদক',             'azizul_haq',           'male'],
      ['নাসরিন সুলতানা হিরা',       'দপ্তর সম্পাদক',             'nasrin_sultana_riya',  'female'],
      ['আজিজুল হক রাহি',           'উপ-দপ্তর সম্পাদক',          'azizul_hoque_rahi',    'male'],
      ['মেসবাহ উদ্দিন মিহির',       'প্রচার ও প্রকাশনা সম্পাদক',   'mesbah_uddin_miris',   'male'],
      ['আবির হাসান',              'প্রশিক্ষণ বিষয়ক সম্পাদক',    'abir_hasan',           'male'],
      ['মিসবাহুল জান্নাত তারিন',      'সাহিত্য ও পাঠচক্র বিষয়ক সম্পাদক', 'mihaballa_jayat_tarin', 'male'],
      ['হৃদি সরকার',              'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'hridi_sorkar',      'female'],
      ['মারজান হোসেন',            'সম্পাদকীয় পর্ষদ',          'marjan_hossen',        'male'],
      ['হাসনা বেগম',              'সম্পাদকীয় পর্ষদ',          'hasna_begum',          'female']
    ]},
    { term: '২০২৪-২৫', members: [
      ['মাহফুজুর রহমান',            'সভাপতি',                 'mahmudul_rahman',      'male'],
      ['মিজবাহুল জান্নাত তারিন',      'সহ-সভাপতি',               'mihaballa_jayat_tarin', 'male'],
      ['মেসবাহ উদ্দিন মিহির',       'সাধারণ সম্পাদক',           'mesbah_uddin_miris',   'male'],
      ['সাখাওয়াত হোসাইন রিফাত',     'যুগ্ম-সাধারণ সম্পাদক',      'sayawat_hossain_rikat', 'male'],
      ['আজিজুল হক রাহি',           'সাংগঠনিক সম্পাদক',         'azizul_hoque_rahi',    'male'],
      ['হৃদি সরকার',              'সহ-সাংগঠনিক সম্পাদক',      'hridi_sorkar',         'female'],
      ['সুমন চৌধুরী',             'অর্থ সম্পাদক',             'sumon_chowdhury',      'male'],
      ['কারিশমা ইরিন এ্যামি',        'দপ্তর সম্পাদক',             'karishma_erin_anny',   'female'],
      ['ইসমাইল হোসেন ইমন',         'উপ-দপ্তর সম্পাদক',          'ismail_hossen_emon',   'male'],
      ['মুহাম্মাদ রিয়াদ উদ্দিন',     'সাহিত্য ও প্রকাশনা',  'muhammad_riyad_uddin', 'male'],
      ['মোস্তফা কামাল',            'প্রচার সম্পাদক',           'mojaffa_kamal',        'male'],
      ['মো. রাসেল হোসেন',          'প্রশিক্ষণ বিষয়ক সম্পাদক',    'rakib_hossen',         'male'],
      ['মো. জাহিদুল হক',           'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'jahidul_haq',       'male'],
      ['এনামুল হক',               'সম্পাদকীয় পর্ষদ',          'enamul_hoque',         'male'],
      ['মোনেম শাহরিয়ার শাওন',       'সম্পাদকীয় পর্ষদ',          'molem_shahriar_shaon', 'male'],
      ['জান্নাতুল ফেরদৌস ইকরা',      'কার্যনির্বাহী সদস্য',        'jayatul_ferdaus_ikra', 'female'],
      ['সাথী রানী',               'কার্যনির্বাহী সদস্য',        'sadhi_rani',           'female']
    ]}
  ];

  // Fast path: skip entirely once a previous boot finished the seeding.
  let historySeeded = false;
  try { historySeeded = !!(await backend.prepare("SELECT value FROM settings WHERE key = 'committee_history_seeded'").get()); }
  catch (_) {}

  if (!historySeeded) {
    // Chronological order → for multi-term members the LAST term's role wins
    // in the user's designation (updated only where this migration owns it).
    for (const { term, members } of COMMITTEE_HISTORY) {
      for (let i = 0; i < members.length; i++) {
        const [name, role, slug, gender] = members[i];
        const desigText = `${role}, ${ORG_DESIG_SUFFIX} (চবি)`;
        try {
          // 1. Link to an existing account by exact full_name, else create one.
          let user = await backend.prepare('SELECT id FROM users WHERE full_name = ? LIMIT 1').get(name);
          if (!user) {
            // unique username: base slug, then _2, _3 … on collision
            let uname = slug, n = 1;
            for (;;) {
              const taken = await backend.prepare('SELECT id FROM users WHERE username = ?').get(uname);
              if (!taken) break;
              n += 1; uname = `${slug}_${n}`;
            }
            const pwd = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
            try {
              await backend.prepare(
                "INSERT INTO users (username, password_hash, full_name, designation, gender, status, role) VALUES (?, ?, ?, ?, ?, 'active', 'user')"
              ).run(uname, pwd, name, desigText, gender);
            } catch (e) {
              // concurrent cold boot lost the username race → reuse its row
              if (!/UNIQUE|duplicate/i.test(e.message || '')) throw e;
            }
            user = await backend.prepare('SELECT id FROM users WHERE username = ?').get(uname)
                  || await backend.prepare('SELECT id FROM users WHERE full_name = ? LIMIT 1').get(name);
          }
          if (!user) continue;
          // keep the designation in sync for accounts THIS migration created;
          // custom/demo designations are never clobbered.
          await backend.prepare(
            "UPDATE users SET designation = ? WHERE id = ? AND (designation IS NULL OR designation LIKE ?)"
          ).run(desigText, user.id, `%${ORG_DESIG_SUFFIX}%`);
          // 2. Ensure the member row exists (UNIQUE index makes it race-safe),
          //    then attach the user id where still missing.
          await backend.prepare(
            "INSERT OR IGNORE INTO members (name, role, designation, member_type, term_year, sort_order, user_id) VALUES (?, ?, ?, 'central', ?, ?, ?)"
          ).run(name, role, 'চট্টগ্রাম বিশ্ববিদ্যালয় শাখা কমিটি', term, i, user.id);
          await backend.prepare(
            "UPDATE members SET user_id = ? WHERE name = ? AND IFNULL(term_year,'') = ? AND member_type = 'central' AND user_id IS NULL"
          ).run(user.id, name, term);
        } catch (e) {
          console.warn(`[migrate] committee-history ${term} "${name}":`, (e.message || '').slice(0, 100));
        }
      }
    }
    try {
      await backend.prepare("INSERT INTO settings (key, value) VALUES ('committee_history_seeded', '1')").run();
    } catch (_) {
      try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'committee_history_seeded'").run(); } catch (_) {}
    }
  }

  // ── Committee history v2 — official press-release data (ছবি ভিত্তিক) ──────
  // Corrects the v1 seed against the four official প্রেস বিজ্ঞপ্তি:
  //   • ২০২০-২১ (স্মারক বাতকলোকেশন-বিরি/৩-২১, ১ মার্চ ২০২১)   — ৮ জন   [NEW]
  //   • ২০২১-২২ (গঠন ১২ আগস্ট ২০২১ + পুনর্গঠন ২০ মার্চ ২০২২) — ১৩ জন চূড়ান্ত
  //   • ২০২২-২৩ (বিরি/চবি/কমিটি/৯-২২, ১৭ আগস্ট ২০২২)          — ১৫ জন   [v1-এ ভুল ছিল]
  //   • ২০২৩-২৪ (বিরি/০১/২৩-২৪, ৩ সেপ্টেম্বর ২০২৩)            — ১৫ জন   [NEW]
  //   • ২০২৪-২৫ stays as v1 seeded it (official ২৩/০১/২৫ notice).
  // Every member keeps a linked user account: v1 accounts are RENAMED to the
  // official Bengali names (usernames too, where the slug was wrong) and the
  // missing people get fresh accounts with random passwords.
  if (true) {
    let v2Seeded = false;
    try { v2Seeded = !!(await backend.prepare("SELECT value FROM settings WHERE key = 'committee_history_v2_seeded'").get()); }
    catch (_) {}
    if (!v2Seeded) {
      const ORG_SUFFIX = 'লেখক ফোরাম (চবি)';
      const desig = (role) => `${role}, ${ORG_SUFFIX}`;

      // [current username → new username, official Bengali full name]
      const ACCOUNT_FIXES = [
        ['md_rafsan',             'md_rafsan',          'মোঃ রাফছান'],
        ['akij_mahmud',           'akij_mahmud',         'আকিজ মাহমুদ'],
        ['mushfiqur_emon',        'mushfiqur_emon',      'মুশফিকুর রহমান ইমন'],
        ['rabby_hasan',           'rabby_hasan',         'রাব্বি হাসান'],
        ['jannatul_sayma',        'jannatul_sayma',      'জান্নাতুল ফেরদৌস সায়মা'],
        ['murad_hoshen',          'murad_hossen',        'মোঃ মুরাদ হোসেন'],
        ['ayesha_siddika_anny',   'ayesha_siddika_anny', 'আয়েশা সিদ্দিকা'],
        ['tawhida_akter',         'tawhida_akter',       'তৌহিদা আক্তার'],
        ['sk_rafiquzzaman',       'sk_rafiquzzaman',     'শেখ রফিকুজ্জামান'],
        ['yousuful_islam_sikat',  'irashadul_sifat',     'মো. ইত্তেখারুল ইসলাম সিফাত'],
        ['saiful_mia',            'saiful_mira',         'মো. সাইফুল মিয়া'],
        ['redwan_ahmed',          'redwan_ahmed',        'রেদওয়ান আহমদ'],
        ['nibed_chakraborty',     'nibed_chakraborty',   'গিরেন্দ্র চক্রবর্তী'],
        ['mahmudul_rahman',       'mahmudul_rahman',     'মাহফুজুর রহমান'],
        ['asamuzzaman_chowdhury', 'asaduzzaman_toujuri', 'আসাদুজ্জামান চৌধুরী সম্রাট'],
        ['azizul_haq',            'azizul_haq',          'মো. আজিজুল হক'],
        ['nasrin_sultana_riya',   'nasrin_sultana_riya', 'নাসরিন সুলতানা হিরা'],
        ['azizul_hoque_rahi',     'azizul_hoque_rahi',   'আজিজুল হক রাহি'],
        ['mesbah_uddin_miris',    'mesbah_uddin_miris',  'মেসবাহ উদ্দিন মিহির'],
        ['abir_hasan',            'abir_hasan',          'আবির হাসান'],
        ['mihaballa_jayat_tarin', 'mihaballa_jayat_tarin', 'মিসবাহুল জান্নাত তারিন'],
        ['hridi_sorkar',          'hridi_sorkar',        'হৃদি সরকার'],
        ['marjan_hossen',         'marjan_hossen',       'মারজান হোসেন'],
        ['hasna_begum',           'hasna_begum',         'হাসনা বেগম']
      ];

      // [name, role, username-slug, gender] — অফিসিয়াল বিজ্ঞপ্তি অনুযায়ী
      const V2_TERMS = [
        { term: '২০২০-২১', members: [
          ['আরমান শেখ',              'সভাপতি',                 'arman_sheikh',     'male'],
          ['মো. রাফছান',             'সাধারণ সম্পাদক',           'md_rafsan',       'male'],
          ['নেজাম উদ্দীন',             'সাংগঠনিক সম্পাদক',         'nezam_uddin',      'male'],
          ['আকিজ মাহমুদ',             'দপ্তর সম্পাদক',            'akij_mahmud',      'male'],
          ['মুশফিকুর রহমান ইমন',       'উপদপ্তর সম্পাদক',           'mushfiqur_emon',   'male'],
          ['রাব্বি হাসান',             'অর্থ সম্পাদক',             'rabby_hasan',      'male'],
          ['জান্নাতুল ফেরদৌস সায়মা',     'প্রচার সম্পাদিকা',           'jannatul_sayma',   'female'],
          ['আয়শা সিদ্দিকা',       'উপপ্রচার সম্পাদিকা',         'ayesha_siddika_anny', 'female']
        ]},
        { term: '২০২১-২২', members: [
          ['মোঃ রাফছান',             'সভাপতি',                 'md_rafsan',       'male'],
          ['আকিজ মাহমুদ',             'সাধারণ সম্পাদক',           'akij_mahmud',      'male'],
          ['মো. মুরাদ হোসেন',          'সাংগঠনিক সম্পাদক',         'murad_hossen',     'male'],
          ['আয়েশা সিদ্দিকা',       'সহ-সাংগঠনিক সম্পাদক',       'ayesha_siddika_anny', 'female'],
          ['এম. আতহার নূর',           'অর্থ সম্পাদক',             'atihar_noor',      'male'],
          ['রিপন চন্দ্র পাল',          'সহ-অর্থ সম্পাদক',           'rian_chandra_pal', 'male'],
          ['জান্নাতুল ফেরদৌস সায়মা',     'দপ্তর সম্পাদক',            'jannatul_sayma',   'female'],
          ['মো. সাইফুল মিয়া',          'উপ-দপ্তর সম্পাদক',          'saiful_mira',      'male'],
          ['তৌহিদা আক্তার',            'প্রচার সম্পাদক',            'tawhida_akter',    'female'],
          ['মো. মারুফ মজুমদার',         'উপ-প্রচার সম্পাদক',          'maruf_motubbar',   'male'],
          ['শেখ রফিকুজ্জামান',          'প্রশিক্ষণ বিষয়ক সম্পাদক',     'sk_rafiquzzaman',  'male'],
          ['মো. মিজানুর রহমান',        'উপ-প্রশিক্ষণ সম্পাদক',        'mijanur_rahman',   'male'],
          ['মো. সিফাত তালুকদার',       'সাহিত্য ও পাঠচক্র সম্পাদক',    'sifat_tanukanar',  'male']
        ]},
        { term: '২০২২-২৩', members: [
          ['আকিজ মাহমুদ',             'সভাপতি',                 'akij_mahmud',      'male'],
          ['আয়েশা সিদ্দিকা',       'সহ-সভাপতি',               'ayesha_siddika_anny', 'female'],
          ['মোঃ মুরাদ হোসেন',          'সাধারণ সম্পাদক',           'murad_hossen',     'male'],
          ['মো. ইত্তেখারুল ইসলাম সিফাত',   'যুগ্ম সাধারণ সম্পাদক',      'irashadul_sifat',  'male'],
          ['শেখ রফিকউজ্জামান',          'সাংগঠনিক সম্পাদক',         'sk_rafiquzzaman',  'male'],
          ['তৌহিদা আক্তার',            'সহ-সাংগঠনিক সম্পাদক',       'tawhida_akter',    'female'],
          ['এম. আতাহার নূর',           'অর্থ সম্পাদক',             'atihar_noor',      'male'],
          ['মাহফুজুর রহমান',            'প্রশিক্ষণ বিষয়ক সম্পাদক',     'mahmudul_rahman',  'male'],
          ['মো. মারুফ মজুমদার',         'প্রচার ও প্রকাশনা সম্পাদক',    'maruf_motubbar',   'male'],
          ['রেদওয়ান আহমদ',           'সাহিত্য ও পাঠাগার সম্পাদক',    'redwan_ahmed',     'male'],
          ['মোঃ সাইফুল মিয়া',          'দপ্তর সম্পাদক',            'saiful_mira',      'male'],
          ['আজিজুল হক',           'উপ-দপ্তর সম্পাদক',          'azizul_haq',       'male'],
          ['সবুজ আহমেদ',             'তথ্য প্রযুক্তি বিষয়ক সম্পাদক',  'sonbul_ahmed',     'male'],
          ['আসাদুজ্জামান বুলবুল',        'সম্পাদকীয় পর্ষদ',           'asaduzzaman_bulbul', 'male'],
          ['আসাদুজ্জামান চৌধুরী সম্রাট',  'সম্পাদকীয় পর্ষদ',           'asaduzzaman_toujuri', 'male']
        ]},
        { term: '২০২৩-২৪', members: [
          ['মো. ইত্তেখারুল ইসলাম সিফাত',   'সভাপতি',                 'irashadul_sifat',  'male'],
          ['মো. সাইফুল মিয়া',          'সহ-সভাপতি',               'saiful_mira',      'male'],
          ['রেদওয়ান আহমদ',            'সাধারণ সম্পাদক',           'redwan_ahmed',     'male'],
          ['গিরেন্দ্র চক্রবর্তী',           'যুগ্ম সাধারণ সম্পাদক',      'nibed_chakraborty', 'male'],
          ['মাহফুজুর রহমান',            'সাংগঠনিক সম্পাদক',         'mahmudul_rahman',  'male'],
          ['আসাদুজ্জামান চৌধুরী সম্রাট',  'সহ-সাংগঠনিক সম্পাদক',       'asaduzzaman_toujuri', 'male'],
          ['মো. আজিজুল হক',           'অর্থ সম্পাদক',             'azizul_haq',       'male'],
          ['নাসরিন সুলতানা হিরা',       'দপ্তর সম্পাদক',            'nasrin_sultana_riya', 'female'],
          ['আজিজুল হক রাহি',           'উপ-দপ্তর সম্পাদক',          'azizul_hoque_rahi', 'male'],
          ['মেসবাহ উদ্দিন মিহির',       'প্রচার ও প্রকাশনা সম্পাদক',    'mesbah_uddin_miris', 'male'],
          ['আবির হাসান',              'প্রশিক্ষণ বিষয়ক সম্পাদক',     'abir_hasan',       'male'],
          ['মিসবাহুল জান্নাত তারিন',      'সাহিত্য ও পাঠচক্র বিষয়ক সম্পাদক', 'mihaballa_jayat_tarin', 'male'],
          ['হৃদি সরকার',              'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'hridi_sorkar',   'female'],
          ['মারজান হোসেন',            'সম্পাদকীয় পর্ষদ',           'marjan_hossen',    'male'],
          ['হাসনা বেগম',              'সম্পাদকীয় পর্ষদ',           'hasna_begum',      'female']
        ]}
      ];

      // ensureAccount → reuse by username, else create with a random password
      const ensureAccount = async (slug, name, gender) => {
        let u = await backend.prepare('SELECT id FROM users WHERE username = ? LIMIT 1').get(slug);
        if (u) return u.id;
        let uname = slug, n = 1;
        for (;;) {
          const taken = await backend.prepare('SELECT id FROM users WHERE username = ?').get(uname);
          if (!taken) break;
          n += 1; uname = `${slug}_${n}`;
        }
        const pwd = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
        try {
          await backend.prepare(
            "INSERT INTO users (username, password_hash, full_name, designation, gender, status, role) VALUES (?, ?, ?, ?, ?, 'active', 'user')"
          ).run(uname, pwd, name, 'সদস্য, ' + ORG_SUFFIX, gender);
        } catch (e) {
          if (!/UNIQUE|duplicate/i.test(e.message || '')) throw e;
        }
        u = await backend.prepare('SELECT id FROM users WHERE username = ? LIMIT 1').get(uname);
        return u ? u.id : null;
      };

      try {
        // 1. Rename v1 accounts to the official Bengali names (username + full_name)
        for (const [oldU, newU, newName] of ACCOUNT_FIXES) {
          const row = await backend.prepare('SELECT id FROM users WHERE username = ? LIMIT 1').get(oldU);
          if (!row) continue;
          if (newU !== oldU) {
            const clash = await backend.prepare('SELECT id FROM users WHERE username = ?').get(newU);
            if (!clash || clash.id === row.id) {
              try { await backend.prepare('UPDATE users SET username = ? WHERE id = ?').run(newU, row.id); }
              catch (_) {}
            }
          }
          await backend.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(newName, row.id);
        }

        // 2. Drop the v1 central rows of the terms we are re-authoring
        await backend.exec(
          "DELETE FROM members WHERE member_type = 'central' AND term_year IN ('২০২১-২২','২০২২-২৩','২০২৩-২৪')"
        );

        // 3. Insert the corrected history; designation = latest term's role
        for (const { term, members } of V2_TERMS) {
          for (let i = 0; i < members.length; i++) {
            const [name, role, slug, gender] = members[i];
            try {
              const uid = await ensureAccount(slug, name, gender);
              await backend.prepare(
                "INSERT OR IGNORE INTO members (name, role, designation, member_type, term_year, sort_order, user_id) VALUES (?, ?, ?, 'central', ?, ?, ?)"
              ).run(name, role, 'চট্টগ্রাম বিশ্ববিদ্যালয় শাখা কমিটি', term, i, uid);
              if (uid) {
                await backend.prepare(
                  "UPDATE members SET user_id = ? WHERE name = ? AND IFNULL(term_year,'') = ? AND member_type = 'central' AND user_id IS NULL"
                ).run(uid, name, term);
                await backend.prepare(
                  "UPDATE users SET designation = ? WHERE id = ? AND (designation IS NULL OR designation LIKE ?)"
                ).run(desig(role), uid, `%${ORG_SUFFIX}%`);
              }
            } catch (e) {
              console.warn(`[migrate] committee-v2 ${term} "${name}":`, (e.message || '').slice(0, 100));
            }
          }
        }

        // 4. Members who also serve in ২০২৪-২৫ get that (latest) role back
        try {
          const latest = await backend.prepare(
            "SELECT m.role, m.user_id FROM members m WHERE m.member_type = 'central' AND m.term_year = '২০২৪-২৫' AND m.user_id IS NOT NULL"
          ).all();
          for (const r of latest) {
            await backend.prepare(
              "UPDATE users SET designation = ? WHERE id = ? AND (designation IS NULL OR designation LIKE ?)"
            ).run(desig(r.role), r.user_id, `%${ORG_SUFFIX}%`);
          }
        } catch (_) {}

        try {
          await backend.prepare("INSERT INTO settings (key, value) VALUES ('committee_history_v2_seeded', '1')").run();
        } catch (_) {
          try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'committee_history_v2_seeded'").run(); } catch (_) {}
        }
      } catch (e) {
        console.warn('[migrate] committee-v2 skipped:', (e.message || '').slice(0, 140));
      }
    }
  }

  // ── Committee history v3 — official doc correction (টাস্ক ১২, ২০২৬-০৯-০৮) ──
  // v1/v2 seed-এ গার্বলড নাম ছিল (রাকেবুল/মিরা/মতুব্বর ইত্যাদি); এটা আগের
  // ডিপ্লয়ে জমে থাকা ভুল ডেটা ঠিক করে — নতুন ফ্ল্যাগ, তাই সেট ফ্ল্যাগ থাকলেও
  // পুরনো ডিপ্লয়-এ ঠিক একবার চলে।
  if (true) {
    let v3Seeded = false;
    try { v3Seeded = !!(await backend.prepare("SELECT value FROM settings WHERE key = 'committee_history_v3_seeded'").get()); }
    catch (_) {}
    if (!v3Seeded) {
      try {
        const UFIX = [
          ['মোঃ রাকেবুল', 'মোঃ রাফছান'],
          ['আয়েশা সিদ্দিকা এ্যানি', 'আয়েশা সিদ্দিকা'],
          ['মো. ইরেশাদুল ইসলাম সিফাত', 'মো. ইত্তেখারুল ইসলাম সিফাত'],
          ['মো. সাইফুল মিরা', 'মো. সাইফুল মিয়া'],
          ['রেডওয়ান আহমেদ', 'রেদওয়ান আহমদ'],
          ['নিবেদ চক্রবর্তী', 'গিরেন্দ্র চক্রবর্তী'],
          ['মাহমূদুল রহমান', 'মাহফুজুর রহমান'],
          ['আসাদুজ্জামান তৌজুরী স্মার্ট', 'আসাদুজ্জামান চৌধুরী সম্রাট'],
          ['নাসরিন সুলতানা রিয়া', 'নাসরিন সুলতানা হিরা'],
          ['মেসবাহ উদ্দিন মিরিস', 'মেসবাহ উদ্দিন মিহির'],
          ['মিহাবল্ল জায়াত তারিন', 'মিসবাহুল জান্নাত তারিন'],
          ['সায়াওয়াত হোসাইন রিকাত', 'সাখাওয়াত হোসাইন রিফাত'],
          ['মোজফ্ফা কামাল', 'মোস্তফা কামাল'],
          ['মো. রাকিব হোসেন', 'মো. রাসেল হোসেন'],
          ['মোলেম শাহরিয়ার শাওন', 'মোনেম শাহরিয়ার শাওন'],
          ['জায়াতুল ফেরদাউস ইকরা', 'জান্নাতুল ফেরদৌস ইকরা'],
          ['সাধী রানী', 'সাথী রানী'],
          ['রিয়ান চন্দ্র পাল', 'রিপন চন্দ্র পাল'],
          ['মো. মারুফ মতুব্বর', 'মো. মারুফ মজুমদার'],
          ['মো. সিফাত তানুকানার', 'মো. সিফাত তালুকদার'],
          ['সনবুল আহমেদ', 'সবুজ আহমেদ']
        ];
        // 1) users.full_name গার্বলড → সঠিক
        for (const [g, c] of UFIX) {
          await backend.prepare('UPDATE users SET full_name = ? WHERE full_name = ?').run(c, g);
        }
        await backend.prepare("UPDATE users SET username = 'md_rafsan' WHERE username = 'md_rakebul'").run();

        // 2) কেন্দ্রীয়-বাইরে (স্থায়ী পরিষদ/উপদেষ্টা) গার্বলড নাম → সঠিক
        for (const [g, c] of UFIX) {
          await backend.prepare("UPDATE members SET name = ? WHERE name = ? AND member_type != 'central'").run(c, g);
        }

        // 3) কেন্দ্রীয় কমিটি নতুন করে সঠিক ডেটায় (ডকের হুবহু নাম/পদবি/ক্রম)
        await backend.exec("DELETE FROM members WHERE member_type = 'central'");
        const uidBySlug = {};
        for (const r of await backend.prepare('SELECT id, username FROM users').all()) uidBySlug[r.username] = r.id;
        const V3 = [
          { term: '২০২০-২১', members: [
            ['আরমান শেখ', 'সভাপতি', 'arman_sheikh'],
            ['মো. রাফছান', 'সাধারণ সম্পাদক', 'md_rafsan'],
            ['নেজাম উদ্দীন', 'সাংগঠনিক সম্পাদক', 'nezam_uddin'],
            ['আকিজ মাহমুদ', 'দপ্তর সম্পাদক', 'akij_mahmud'],
            ['মুশফিকুর রহমান ইমন', 'উপদপ্তর সম্পাদক', 'mushfiqur_emon'],
            ['রাব্বি হাসান', 'অর্থ সম্পাদক', 'rabby_hasan'],
            ['জান্নাতুল ফেরদৌস সায়মা', 'প্রচার সম্পাদিকা', 'jannatul_sayma'],
            ['আয়শা সিদ্দিকা', 'উপপ্রচার সম্পাদিকা', 'ayesha_siddika_anny']
          ]},
          { term: '২০২১-২২', members: [
            ['মোঃ রাফছান', 'সভাপতি', 'md_rafsan'],
            ['আকিজ মাহমুদ', 'সাধারণ সম্পাদক', 'akij_mahmud'],
            ['মো. মুরাদ হোসেন', 'সাংগঠনিক সম্পাদক', 'murad_hossen'],
            ['আয়েশা সিদ্দিকা', 'সহ-সাংগঠনিক সম্পাদক', 'ayesha_siddika_anny'],
            ['এম. আতহার নূর', 'অর্থ সম্পাদক', 'atihar_noor'],
            ['রিপন চন্দ্র পাল', 'সহ-অর্থ সম্পাদক', 'rian_chandra_pal'],
            ['জান্নাতুল ফেরদৌস সায়মা', 'দপ্তর সম্পাদক', 'jannatul_sayma'],
            ['মো. সাইফুল মিয়া', 'উপ-দপ্তর সম্পাদক', 'saiful_mira'],
            ['তৌহিদা আক্তার', 'প্রচার সম্পাদক', 'tawhida_akter'],
            ['মো. মারুফ মজুমদার', 'উপ-প্রচার সম্পাদক', 'maruf_motubbar'],
            ['শেখ রফিকুজ্জামান', 'প্রশিক্ষণ বিষয়ক সম্পাদক', 'sk_rafiquzzaman'],
            ['মো. মিজানুর রহমান', 'উপ-প্রশিক্ষণ সম্পাদক', 'mijanur_rahman'],
            ['মো. সিফাত তালুকদার', 'সাহিত্য ও পাঠচক্র সম্পাদক', 'sifat_tanukanar']
          ]},
          { term: '২০২২-২৩', members: [
            ['আকিজ মাহমুদ', 'সভাপতি', 'akij_mahmud'],
            ['আয়েশা সিদ্দিকা', 'সহ-সভাপতি', 'ayesha_siddika_anny'],
            ['মোঃ মুরাদ হোসেন', 'সাধারণ সম্পাদক', 'murad_hossen'],
            ['মো. ইত্তেখারুল ইসলাম সিফাত', 'যুগ্ম সাধারণ সম্পাদক', 'irashadul_sifat'],
            ['শেখ রফিকউজ্জামান', 'সাংগঠনিক সম্পাদক', 'sk_rafiquzzaman'],
            ['তৌহিদা আক্তার', 'সহ-সাংগঠনিক সম্পাদক', 'tawhida_akter'],
            ['এম. আতাহার নূর', 'অর্থ সম্পাদক', 'atihar_noor'],
            ['মাহফুজুর রহমান', 'প্রশিক্ষণ বিষয়ক সম্পাদক', 'mahmudul_rahman'],
            ['মো. মারুফ মজুমদার', 'প্রচার ও প্রকাশনা সম্পাদক', 'maruf_motubbar'],
            ['রেদওয়ান আহমদ', 'সাহিত্য ও পাঠাগার সম্পাদক', 'redwan_ahmed'],
            ['মোঃ সাইফুল মিয়া', 'দপ্তর সম্পাদক', 'saiful_mira'],
            ['আজিজুল হক', 'উপ-দপ্তর সম্পাদক', 'azizul_haq'],
            ['সবুজ আহমেদ', 'তথ্য প্রযুক্তি বিষয়ক সম্পাদক', 'sonbul_ahmed'],
            ['আসাদুজ্জামান বুলবুল', 'সম্পাদকীয় পর্ষদ', 'asaduzzaman_bulbul'],
            ['আসাদুজ্জামান চৌধুরী সম্রাট', 'সম্পাদকীয় পর্ষদ', 'asaduzzaman_toujuri']
          ]},
          { term: '২০২৩-২৪', members: [
            ['মো. ইত্তেখারুল ইসলাম সিফাত', 'সভাপতি', 'irashadul_sifat'],
            ['মো. সাইফুল মিয়া', 'সহ-সভাপতি', 'saiful_mira'],
            ['রেদওয়ান আহমদ', 'সাধারণ সম্পাদক', 'redwan_ahmed'],
            ['গিরেন্দ্র চক্রবর্তী', 'যুগ্ম সাধারণ সম্পাদক', 'nibed_chakraborty'],
            ['মাহফুজুর রহমান', 'সাংগঠনিক সম্পাদক', 'mahmudul_rahman'],
            ['আসাদুজ্জামান চৌধুরী সম্রাট', 'সহ-সাংগঠনিক সম্পাদক', 'asaduzzaman_toujuri'],
            ['মো. আজিজুল হক', 'অর্থ সম্পাদক', 'azizul_haq'],
            ['নাসরিন সুলতানা হিরা', 'দপ্তর সম্পাদক', 'nasrin_sultana_riya'],
            ['আজিজুল হক রাহি', 'উপ-দপ্তর সম্পাদক', 'azizul_hoque_rahi'],
            ['মেসবাহ উদ্দিন মিহির', 'প্রচার ও প্রকাশনা সম্পাদক', 'mesbah_uddin_miris'],
            ['আবির হাসান', 'প্রশিক্ষণ বিষয়ক সম্পাদক', 'abir_hasan'],
            ['মিসবাহুল জান্নাত তারিন', 'সাহিত্য ও পাঠচক্র বিষয়ক সম্পাদক', 'mihaballa_jayat_tarin'],
            ['হৃদি সরকার', 'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'hridi_sorkar'],
            ['মারজান হোসেন', 'সম্পাদকীয় পর্ষদ', 'marjan_hossen'],
            ['হাসনা বেগম', 'সম্পাদকীয় পর্ষদ', 'hasna_begum']
          ]},
          { term: '২০২৪-২৫', members: [
            ['মাহফুজুর রহমান', 'সভাপতি', 'mahmudul_rahman'],
            ['মিজবাহুল জান্নাত তারিন', 'সহ-সভাপতি', 'mihaballa_jayat_tarin'],
            ['মেসবাহ উদ্দিন মিহির', 'সাধারণ সম্পাদক', 'mesbah_uddin_miris'],
            ['সাখাওয়াত হোসাইন রিফাত', 'যুগ্ম-সাধারণ সম্পাদক', 'sayawat_hossain_rikat'],
            ['আজিজুল হক রাহি', 'সাংগঠনিক সম্পাদক', 'azizul_hoque_rahi'],
            ['হৃদি সরকার', 'সহ-সাংগঠনিক সম্পাদক', 'hridi_sorkar'],
            ['সুমন চৌধুরী', 'অর্থ সম্পাদক', 'sumon_chowdhury'],
            ['কারিশমা ইরিন এ্যামি', 'দপ্তর সম্পাদক', 'karishma_erin_anny'],
            ['ইসমাইল হোসেন ইমন', 'উপ-দপ্তর সম্পাদক', 'ismail_hossen_emon'],
            ['মুহাম্মাদ রিয়াদ উদ্দিন', 'সাহিত্য ও প্রকাশনা', 'muhammad_riyad_uddin'],
            ['মোস্তফা কামাল', 'প্রচার সম্পাদক', 'mojaffa_kamal'],
            ['মো. রাসেল হোসেন', 'প্রশিক্ষণ বিষয়ক সম্পাদক', 'rakib_hossen'],
            ['মো. জাহিদুল হক', 'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'jahidul_haq'],
            ['এনামুল হক', 'সম্পাদকীয় পর্ষদ', 'enamul_hoque'],
            ['মোনেম শাহরিয়ার শাওন', 'সম্পাদকীয় পর্ষদ', 'molem_shahriar_shaon'],
            ['জান্নাতুল ফেরদৌস ইকরা', 'কার্যনির্বাহী সদস্য', 'jayatul_ferdaus_ikra'],
            ['সাথী রানী', 'কার্যনির্বাহী সদস্য', 'sadhi_rani']
          ]}
        ];
        for (const { term, members } of V3) {
          for (let i = 0; i < members.length; i++) {
            const [name, role, slug] = members[i];
            const uid = uidBySlug[slug] || null;
            await backend.prepare(
              "INSERT INTO members (name, role, designation, member_type, term_year, sort_order, user_id) VALUES (?, ?, ?, 'central', ?, ?, ?)"
            ).run(name, role, 'চট্টগ্রাম বিশ্ববিদ্যালয় শাখা কমিটি', term, i, uid);
          }
        }

        // 4) ফ্ল্যাগ সেট
        try { await backend.prepare("INSERT INTO settings (key, value) VALUES ('committee_history_v3_seeded', '1')").run(); }
        catch (_) { try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'committee_history_v3_seeded'").run(); } catch (_) {} }
      } catch (e) {
        console.warn('[migrate] committee-v3 skipped:', (e.message || '').slice(0, 140));
      }
    }
  }

  // ── টাস্ক ১২ (পর্ব ৩, অংশ ক): উপদেষ্টা পরিষদে কার্যবর্ষ বসানো ──
  // আগে advisory এন্ট্রিগুলোর term_year খালি ছিল — কার্যবর্ষ ফিল্টারের জন্য
  // সব উপদেষ্টার একটা বছর থাকা দরকার। ডিফল্ট = সর্বশেষ কার্যবর্ষ ২০২৪-২৫
  // (ইউজার পরে অ্যাডমিন থেকে ইডিট করবেন)। নতুন ফ্ল্যাগ → ঠিক একবার চলে।
  try {
    const v4Seeded = await backend.prepare("SELECT value FROM settings WHERE key = 'advisory_term_v4_seeded'").get();
    if (!v4Seeded) {
      await backend.prepare(
        "UPDATE members SET term_year = '২০২৪-২৫' WHERE member_type = 'advisory' AND (term_year IS NULL OR term_year = '')"
      ).run();
      try { await backend.prepare("INSERT INTO settings (key, value) VALUES ('advisory_term_v4_seeded', '1')").run(); }
      catch (_) { try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'advisory_term_v4_seeded'").run(); } catch (_) {} }
    }
  } catch (e) {
    console.warn('[migrate] advisory-term-v4 skipped:', (e.message || '').slice(0, 140));
  }

  // ── টাস্ক ১২ (পর্ব ৩, অংশ খ): মডিউল সেপারেশন ──
  // কেন্দ্রীয় কমিটিতে ভুলভাবে থাকা "উপদেষ্টা" role-এর এন্ট্রিগুলো (যেমন ২০২২-২৩-এ
  // মো. রাফছান) উপদেষ্টা পরিষদে স্থানান্তর। এছাড়া ভবিষ্যতে কেন্দ্রীয়তে উপদেষ্টা
  // আর ঢুকবে না (ব্যাকএন্ড ভ্যালিডেশন) — এটা শুধু বিদ্যমান ডেটা ঠিক করে।
  try {
    const v5Seeded = await backend.prepare("SELECT value FROM settings WHERE key = 'council_separation_v5_seeded'").get();
    if (!v5Seeded) {
      const centralAdvisors = await backend.prepare(
        "SELECT * FROM members WHERE member_type = 'central' AND role LIKE '%উপদেষ্টা%'"
      ).all();
      for (const r of centralAdvisors || []) {
        try {
          // একই ডেটায় advisory-তে কপি (user_id লিংকসহ) — নাম/পদ/বছর/বায়ো/ছবি/সোশ্যাল
          // সব হুবহু সংরক্ষিত; designation-এ উপদেষ্টা-কনটেক্সটে রাখা হয়
          await backend.prepare(
            `INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email,
               social_linkedin, message, member_type, term_year, sort_order, user_id, created_at)
             VALUES (?, ?, 'উপদেষ্টা', ?, ?, ?, ?, ?, ?, 'advisory', ?, ?, ?, ?)`
          ).run(r.name, r.role, r.bio, r.image_url, r.social_fb, r.social_email,
                r.social_linkedin, r.message, r.term_year, r.sort_order, r.user_id, r.created_at);
          await backend.prepare("DELETE FROM members WHERE id = ?").run(r.id);
        } catch (e) {
          console.warn('[migrate] council-v5 move member', r.id, ':', (e.message || '').slice(0, 120));
        }
      }
      // নিশ্চিত সিড: মো. রাফছান উপদেষ্টা (২০২২-২৩) — fresh install-এও যেন থাকে,
      // md_rafsan অ্যাকাউন্ট থাকলে তার সাথে লিংক হবে
      try {
        const rafsan = await backend.prepare("SELECT id FROM users WHERE username = 'md_rafsan' LIMIT 1").get();
        await backend.prepare(
          "INSERT OR IGNORE INTO members (name, role, designation, member_type, term_year, sort_order, user_id) VALUES (?, 'উপদেষ্টা', 'উপদেষ্টা', 'advisory', '২০২২-২৩', 0, ?)"
        ).run('মো. রাফছান', rafsan ? rafsan.id : null);
      } catch (_) {}
      try { await backend.prepare("INSERT INTO settings (key, value) VALUES ('council_separation_v5_seeded', '1')").run(); }
      catch (_) { try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'council_separation_v5_seeded'").run(); } catch (_) {} }
    }
  } catch (e) {
    console.warn('[migrate] council-separation-v5 skipped:', (e.message || '').slice(0, 140));
  }

  // ── টাস্ক ১৩ (পর্ব ৪, অংশ ক): মাল্টি-ইমেজ ──
  // এক পোস্টে একাধিক ছবি — generic post_images টেবিল (সব ৬ পোস্ট টাইপের জন্য এক টেবিল;
  // sort_order → reorder)। বিদ্যমান single-image ডেটা কপি হয় (মূল কলাম অক্ষত)।
  try {
    await backend.prepare(`CREATE TABLE IF NOT EXISTS post_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();
    try { await backend.prepare("CREATE INDEX IF NOT EXISTS idx_post_images ON post_images(entity_type, entity_id, sort_order)").run(); } catch (_) {}

    const v6 = await backend.prepare("SELECT value FROM settings WHERE key = 'post_images_v6_seeded'").get();
    if (!v6) {
      const migrateOne = async (type, table, col) => {
        const rows = await backend.prepare(`SELECT id, ${col} AS img FROM ${table} WHERE ${col} IS NOT NULL AND ${col} != ''`).all();
        for (const r of rows || []) {
          try {
            await backend.prepare("INSERT INTO post_images (entity_type, entity_id, image_url, sort_order) VALUES (?, ?, ?, 0)").run(type, r.id, r.img);
          } catch (_) {}
        }
      };
      await migrateOne('event', 'events', 'image_url');
      await migrateOne('daily', 'daily_content', 'image_url');
      await migrateOne('news', 'press_clippings', 'image_url');
      await migrateOne('post', 'posts', 'cover_image');
      try { await backend.prepare("INSERT INTO settings (key, value) VALUES ('post_images_v6_seeded', '1')").run(); }
      catch (_) { try { await backend.prepare("UPDATE settings SET value = '1' WHERE key = 'post_images_v6_seeded'").run(); } catch (_) {} }
    }
  } catch (e) {
    console.warn('[migrate] post-images-v6 skipped:', (e.message || '').slice(0, 140));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Boot fast-path (Turso only)
// ────────────────────────────────────────────────────────────────────────────
// প্রতিটি কোল্ড বুটে runMigrations + applyLaterMigrations + seed-চেক ≈ ১০০+
// সিরিয়াল কোয়েরি চলে; দূরবর্তী Turso-তে প্রতি-কোয়েরি RTT ≈ ১০০-২০০ms হওয়ায়
// বুট ১৫ সেকেন্ড+ হয়ে গেছে এবং Vercel-এর ফাংশন-টাইমআউট ভেঙে সাইট 500 দিচ্ছিল।
// সমাধান: পূর্ণ ইনিট সফল হলে স্কিমা/মাইগ্রেশন/সিড-ফাংশনের সোর্স-হ্যাশ
// (_boot_cache.init_fingerprint) সেভ করা হয়; পরের বুটে হ্যাশ মিললে সব স্কিপ —
// বুট ১-২ কোয়েরিতে নামে। ফাংশন-সোর্স বদলালে (নতুন মাইগ্রেশন/সিড) হ্যাশ নিজেই
// বদলায়, তাই নতুন মাইগ্রেশন সবসময় চলে।
// সেশন ৫৮-ফিক্স: শুধু ফাংশন-সোর্স যথেষ্ট নয় — LATER_COLUMNS-অ্যারে বা
// runMigrations-এর SQL-তালিকায় নতুন কলাম/স্টেটমেন্ট যোগ হলে ফাংশন-বডি
// অপরিবর্তিত থাকে → পুরনো ফিঙ্গারপ্রিন্টে cache-HIT → ALTER কখনোই চলে না
// (লাইভে users-totp কলাম না-হওয়ায় 2FA-confirm 500 — এই ঘটনাই এটা ধরিয়েছে)।
// এখন ডেটা-তালিকাগুলোও হ্যাশে ঢুকেছে; ভবিষ্যতের যেকোনো কলাম-যোগ নিরাপদে
// ফুল-ইনিট ট্রিগার করবে।
const BOOT_CACHE_VERSION = 'v2';
function bootFingerprint() {
  const crypto = require('crypto');
  const fns = [runMigrations, applyLaterMigrations, applySession42Migrations, seedAdmin, seedIfEmptyLocal,
               seedDemoContent, ensureDemoModerator];
  return crypto.createHash('md5')
    .update(BOOT_CACHE_VERSION + '|' + fns.map(f => f.toString()).join('§')
            + '|' + JSON.stringify(LATER_COLUMNS))
    .digest('hex');
}

// ────────────────────────────────────────────────────────────────────────────
// Public API (legacy-compatible)
// ────────────────────────────────────────────────────────────────────────────
async function initDb() {
  if (IS_TURSO) {
    const { createClient } = require('@libsql/client');
    _tursoClient = createClient({
      url:  process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });
    backend = makeTursoBackend(_tursoClient);
    console.log('[db] Using Turso / libSQL at', process.env.TURSO_DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
  } else {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const snap = await fetchSnapshot();
    _bootRestored = !!snap;
    backend = makeSqlJsBackend(SQL, snap);
    console.log(USE_DB_SNAPSHOT
      ? '[db] sql.js + Vercel Blob snapshot mode (no Turso configured)'
      : '[db] Using local sql.js at ' + DB_PATH);
  }

  // Turso ফাস্ট-পাথ: আগের পূর্ণ ইনিটের ফিঙ্গারপ্রিন্ট মিললে মাইগ্রেশন/সিড-চেক স্কিপ
  if (IS_TURSO) {
    try {
      const row = await backend.prepare("SELECT value FROM _boot_cache WHERE key='init_fingerprint'").get();
      if (row && row.value === bootFingerprint()) {
        console.log('[db] Boot cache HIT — schema/migrations/seeds already applied, skipping checks');
        return;
      }
      console.log('[db] Boot cache MISS or stale fingerprint — running full init');
    } catch (_) {
      // _boot_cache টেবিল এখনো নেই (প্রথম আপগ্রেড-বুট) → পূর্ণ পথ
      console.log('[db] No boot cache table yet — running full init');
    }
  }

  await runMigrations();
  await applyLaterMigrations();
  await applySession42Migrations();

  // Seed if empty (Turso + local)
  if (IS_TURSO) {
    const c = await backend.prepare('SELECT COUNT(*) as c FROM admin_users').get();
    if (c.c === 0) {
      console.log('[db] Seeding initial admin + settings…');
      await seedAdmin();
    }
    // Fresh Turso deploys now get the SAME documented demo content + accounts
    // as a fresh local install (previously only the admin row was seeded, so
    // /articles, /qa, /profile/ismail and the ismail/… demo123 logins were
    // all 404 on a brand-new deploy). Guarded by the gallery/users count
    // checks, so after the first seed this is one cheap SELECT per boot.
    try {
      await seedDemoContent();
    } catch (e) {
      console.error('[db] Demo content seeding failed (non-fatal):', e.message);
    }
  } else {
    const c = backend.prepare('SELECT COUNT(*) as c FROM admin_users').get();
    if (c.c === 0) {
      console.log('[db] First run — seeding admin account + settings…');
      // BUG (found in testing): seedIfEmptyLocal() never actually created the
      // admin_users row, only logged a message — the documented admin/admin123
      // login never worked on any fresh local install. seedAdmin() is the
      // function that actually does it; it's backend-agnostic (works against
      // both sql.js and Turso), so reuse it here too.
      await seedAdmin();
      seedIfEmptyLocal();
      _bootSeeded = true;
    }
    // Independent of admin_users (so it also fills in if admin already
    // existed but content tables are empty — e.g. after this fix ships):
    try {
      await seedDemoContent();
    } catch (e) {
      console.error('[db] Demo content seeding failed (non-fatal):', e.message);
    }
  }

  // Demo moderator account (moderator / moderator123) — idempotent, runs on
  // EVERY boot for both backends. The moderator system existed in code
  // (grantModerator, /moderator panel, moderator_scopes) but no moderator
  // account was ever created — `moderators` and `moderator_scopes` were empty
  // on every install, so the documented moderator flow had no login.
  try {
    await ensureDemoModerator();
  } catch (e) {
    console.error('[db] Demo moderator seeding failed (non-fatal):', e.message);
  }

  // সেশন ৬৭: TOC-ডেমো-লেখা — applyLaterMigrations-এ চালানো হয়েছে পুরনো
  // ইনস্টলের জন্য; কিন্তু ফ্রেশ-ইনস্টলে users তখনো তৈরি হয়নি (seed পরে চলে)
  // — তাই সিডের পরেও একবার (idempotent — শিরোনাম-ম্যাচে স্কিপ)।
  try {
    await tocDemoArticle67();
  } catch (e) {
    console.error('[db] tocDemoArticle67 (post-seed pass) failed:', e.message);
  }

  // পূর্ণ ইনিট সফল → Turso-তে ফিঙ্গারপ্রিন্ট সেভ (পরের কোল্ড বুট ফাস্ট-পাথে যাবে)
  if (IS_TURSO) {
    try {
      await backend.exec("CREATE TABLE IF NOT EXISTS _boot_cache (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now')))");
      await backend.prepare("INSERT INTO _boot_cache (key, value) VALUES ('init_fingerprint', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')").run(bootFingerprint());
      console.log('[db] Boot fingerprint saved — next cold boot will use the fast path');
    } catch (e) {
      console.error('[db] Boot cache write failed (non-fatal):', e.message);
    }
  }

  // Blob-snapshot mode: make sure the very first state (fresh seed or just
  // migrated schema) lands in Blob so subsequent cold boots restore it.
  if (USE_DB_SNAPSHOT && (!_bootRestored || _bootSeeded)) {
    await backend.flush();
  }
}

// ── Demo moderator seeder ───────────────────────────────────────────────────
// Creates username `moderator` (password `moderator123`) with role
// 'moderator' and ALL canonical scopes so both panels (/moderator AND the
// scope-limited /admin sections) work out of the box. Canonical scope keys
// unify the old plural/split keys ('notices'/'events' on /admin vs
// 'notice'/'event' on /moderator) — plural legacy keys are also granted so
// older exact-match UI checks keep showing the right checkbox state.
// ── সেশন ৪২ মাইগ্রেশন: ট্র্যাশ (সফট-ডিলিট), অডিট লগ, সাইট-সেকশন আইটেম ──
async function applySession42Migrations() {
  // (42a) টেবিল তৈরি
  await backend.prepare(`CREATE TABLE IF NOT EXISTS trash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    payload TEXT NOT NULL,
    deleted_by INTEGER,
    deleted_by_name TEXT,
    deleted_at TEXT NOT NULL
  )`).run();
  await backend.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_name TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    item_id INTEGER,
    detail TEXT,
    created_at TEXT NOT NULL
  )`).run();
  await backend.prepare(`CREATE TABLE IF NOT EXISTS site_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    title TEXT,
    subtitle TEXT,
    body TEXT,
    icon TEXT,
    extra TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT
  )`).run();

  // (42b) site_items সিড — রেজিস্ট্রির defaults থেকে (প্রতি সেকশনে একবারই)
  try {
    const { SECTIONS } = require('./helpers/sections-registry');
    for (const key of Object.keys(SECTIONS)) {
      const c = await backend.prepare('SELECT COUNT(*) AS c FROM site_items WHERE section = ?').get(key);
      if (c && c.c === 0) {
        let i = 1;
        for (const d of SECTIONS[key].defaults) {
          await backend.prepare(`INSERT INTO site_items (section, sort_order, title, subtitle, body, icon, extra, is_active, created_at)
                                 VALUES (?,?,?,?,?,?,?,?, datetime('now','localtime'))`)
            .run(key, i++, d.title || '', d.subtitle || '', d.body || '', d.icon || '', d.extra || '', 1);
        }
      }
    }
  } catch (e) { console.error('[db] site_items seed (non-fatal):', e.message); }

  // (42c) টাস্ক ১৩: যাতায়াত সময়সূচি — settings JSON-এ সিড (প্রতি ইনস্টলে একবারই;
  // আগে থেকে থাকলে (যেমন অ্যাডমিন আপডেট করলে) ওভাররাইট হয় না)
  try {
    const existing = await backend.prepare("SELECT value FROM settings WHERE key = 'transport_schedule'").get();
    if (!existing) {
      const ts = require('./helpers/transport-schedule');
      await backend.prepare("INSERT INTO settings (key, value) VALUES ('transport_schedule', ?)").run(JSON.stringify(ts));
    }
  } catch (e) { console.error('[db] transport_schedule seed (non-fatal):', e.message); }

  // (43a) সেশন ৪: site_items-এ ছবি কলাম + কনটেন্ট রিভিশন টেবিল + ইনডেক্স
  try { await backend.prepare('ALTER TABLE site_items ADD COLUMN image TEXT').run(); } catch (e) {}
  try { await backend.prepare('ALTER TABLE newsletter_subscribers ADD COLUMN confirm_token TEXT').run(); } catch (e) {}
  await backend.prepare(`CREATE TABLE IF NOT EXISTS content_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT,
    saved_by TEXT,
    saved_at TEXT NOT NULL
  )`).run();
  // (44a) সেশন ৪৪: পেজ-ভিজিট কাউন্টার (অ্যানালিটিক্স ভিজিট ট্রেন্ড)
  await backend.prepare(`CREATE TABLE IF NOT EXISTS page_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    day TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    UNIQUE(path, day)
  )`).run();
  try { await backend.prepare('CREATE INDEX IF NOT EXISTS idx_visits_day ON page_visits(day)').run(); } catch (e) {}
  const IDX43 = [
    'CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)',
    'CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_trash_deleted ON trash(deleted_at)',
    'CREATE INDEX IF NOT EXISTS idx_trash_table ON trash(table_name)',
    'CREATE INDEX IF NOT EXISTS idx_site_sec ON site_items(section, sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_subs_email ON newsletter_subscribers(email)',
    'CREATE INDEX IF NOT EXISTS idx_subs_active ON newsletter_subscribers(is_active)'
  ];
  for (const q of IDX43) { try { await backend.prepare(q).run(); } catch (e) {} }

  // (50) পারফরম্যান্স: hot-query পাথে missing indexes (comments/likes/messages/
  // bookmarks/follows)। sql.js-এ ছোট ডেটায় মাইনর, Turso-তে (প্রোডাকশন) বড় লাভ।
  const IDX50 = [
    'CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_likes_comment ON likes(comment_id)',
    'CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, post_id)',
    'CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_type_status ON posts(type, status)',
    'CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id)',
    'CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id)'
  ];
  for (const q of IDX50) { try { await backend.prepare(q).run(); } catch (e) {} }

  // ── সেশন ১০১ (রোডম্যাপ-০৪): রিঅ্যাক্ট/লাইক রেস-সেফ ইনভ্যারিয়েন্ট ──
  // পুরোনো রেস থেকে জমা ডুপ্লিকেট-লাইক পুড়িয়ে (প্রতি গ্রুপে MIN(id) রক্ষা) ইউজার-প্রতি-
  // টার্গেট এক-রো ইউনিক-ইনডেক্স — routes/social.js-এর INSERT OR IGNORE-এর ভিত্তি।
  // Partial-ইনডেক্স: post-লাইক ও comment-লাইক একই ইউজারে সহাবস্থান করে (NULL-পার্থক্য)।
  const IDX101 = [
    "DELETE FROM likes WHERE id NOT IN (SELECT MIN(id) FROM likes GROUP BY user_id, COALESCE(post_id, 0), COALESCE(comment_id, 0))",
    'CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_post ON likes(user_id, post_id) WHERE post_id IS NOT NULL',
    'CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_comment ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL'
  ];
  for (const q of IDX101) { try { await backend.prepare(q).run(); } catch (e) {} }

  // (42c) ৩০ দিনের পুরনো ট্র্যাশ পার্জ
  try {
    await backend.prepare(`DELETE FROM trash WHERE deleted_at < datetime('now', '-30 days', 'localtime')`).run();
  } catch (e) {}
}

async function ensureDemoModerator() {
  const DEMO_MOD = {
    username: 'moderator',
    password: 'moderator123',
    full_name: 'ডেমো মডারেটর',
    designation: 'মডারেটর',
    bio: 'ডেমো মডারেটর অ্যাকাউন্ট, মডারেটর প্যানেল পরীক্ষার জন্য।'
  };
  const scopes = [
    // canonical (moderator panel + catalogue)
    'quiz', 'this_day', 'best_writer', 'activity', 'notice', 'epaper', 'event', 'complaints',
    'content',
    // admin-panel feature scopes
    'daily', 'gallery',
    // legacy plural variants (kept so admin checkbox UI state stays accurate)
    'notices', 'events'
  ];
  // সেশন ৮৩ বাগফিক্স: আগে শুধু `SELECT id` হতো — existing.role সবসময় undefined
  // থাকত, ফলে `existing.role !== 'moderator'` প্রতি বুটেই সত্য হয়ে টপআপ চলত এবং
  // অ্যাডমিন-মঞ্জুরকৃত কাস্টম স্কোপ (যেমন user_mgmt) প্রতি বুটে মুছে যেত। এখন role
  // সহ সেলেক্ট — টপআপ কেবল তখনই, যখন রোল মডারেটর নয় বা স্কোপ-সারি সত্যিই নেই।
  const existing = await prepare('SELECT id, role FROM users WHERE username = ?').get(DEMO_MOD.username);
  if (existing) {
    // Already present — only top up scopes if a moderator has none (e.g. the
    // user was promoted manually with the old broken default grant).
    const cnt = await prepare('SELECT COUNT(*) AS c FROM moderator_scopes WHERE user_id = ?').get(existing.id);
    if ((existing.role || 'user') !== 'moderator' || !cnt || cnt.c === 0) {
      await grantModerator(existing.id, scopes, null);
      saveDb();
      console.log('[db] ✓ Demo moderator scopes topped up');
    }
    return;
  }
  const hash = bcrypt.hashSync(DEMO_MOD.password, 10);
  await prepare(
    `INSERT INTO users (username, password_hash, full_name, designation, bio, gender, status, role) VALUES (?, ?, ?, ?, ?, 'other', 'active', 'user')`
  ).run(DEMO_MOD.username, hash, DEMO_MOD.full_name, DEMO_MOD.designation, DEMO_MOD.bio);
  const u = await prepare('SELECT id FROM users WHERE username = ?').get(DEMO_MOD.username);
  await grantModerator(u.id, scopes, null);
  saveDb();
  console.log('[db] ✓ Demo moderator seeded (login: moderator / moderator123)');
}

async function seedAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  await backend.prepare(
    "INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)"
  ).run('admin', hash, 'প্রশাসক');
  const defaults = [
    ['site_name', 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়'],
    ['tagline', 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়।'],
    ['motto', 'তারুণ্যের শাণিত কলমে আলোকিত ধরনী'],
    ['contact_email', 'info@lekhokforum.org'],
    ['contact_phone', '০১********* (বিকাশ/নগদ)'],
    ['contact_address', 'চট্টগ্রাম বিশ্ববিদ্যালয়, চট্টগ্রাম'],
    ['facebook_url', '#'],
    ['telegram_url', '#'],
    ['youtube_url', '#']
  ];
  for (const [k, v] of defaults) {
    await backend.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(k, v);
  }
}

function seedIfEmptyLocal() {
  // For local dev: defer to a separate script if you want full demo data.
  // The app will still run with an empty DB and admin can add content.
  console.log('[db] Local seed skipped — DB is empty. Use /admin to add content.');
}

// ── Rich demo-content seeder (restored — was dropped during the Turso/libsql
//    rewrite, regressing the explicit "10 demo items per section" requirement
//    and leaving /committee, /team, /gallery, /quiz etc. empty on fresh
//    installs). Runs once when the relevant tables are empty — safe to call
//    every boot. Now DUAL-BACKEND: every statement is awaited (pass-through
//    on sql.js, real await on Turso/libsql), so a fresh Turso/Vercel deploy
//    gets the same documented demo content + accounts as a local install.
//    Previously this ran local-only, so fresh Turso deploys had zero demo
//    users/posts and the documented logins (ismail/… demo123) 404'd. ──────
async function seedDemoContent() {
  const g = await prepare('SELECT COUNT(*) as c FROM gallery').get();
  if (g && g.c > 0) return; // already seeded (or admin/moderators added real content)

  console.log('[db] Seeding demo content (gallery/quiz/achievements/committee/...)…');

  const notices = [
    ['নতুন সদস্য নিবন্ধন শুরু', 'আগ্রহী প্রার্থীরা অনলাইনে আবেদন করতে পারবেন।', 'notice', '২০২৬ সালের ১ জানুয়ারি'],
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'এবারের সম্মেলনে থাকছে কবিতা পাঠ, প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', 'event', '২০২৬ সালের ১৫ ফেব্রুয়ারি'],
    ['প্রকাশনা বিজ্ঞপ্তি', 'আমাদের নতুন ম্যাগাজিন প্রকাশিত হয়েছে। সদস্যদের জন্য বিনামূল্যে কপি পাওয়া যাবে।', 'press', '২০২৬ সালের ২০ জানুয়ারি'],
    ['কার্যনির্বাহী সভা', 'আগামী ৫ তারিখ সন্ধ্যা ৬টায় কার্যনির্বাহী সভা অনুষ্ঠিত হবে।', 'notice', '২০২৬ সালের ৩ জানুয়ারি'],
    ['ফেলোশিপ কার্যক্রম', 'প্রতিভাবান লেখকদের জন্য বিশেষ ফেলোশিপ ঘোষণা করা হয়েছে। আবেদনের শেষ তারিখ ৩১ মার্চ।', 'notice', '২০২৬ সালের ১০ ফেব্রুয়ারি'],
    ['লেখক সম্মাননা ২০২৬', 'প্রতি বছরের মতো এবারও শীর্ষ লেখকদের সম্মাননা প্রদান করা হবে।', 'press', '২০২৬ সালের ১৫ মার্চ']
  ];
  for (const n of notices) { try { await prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)').run(...n); } catch(e) {} }

  const events = [
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন, আলোচনা সভা এবং সাংস্কৃতিক অনুষ্ঠান।', '২০২৬-০২-১৫', '২০২৬-০২-১৫', 'ক্যাম্পাস অডিটোরিয়াম', '/img/cover/event1/800/400', 1],
    ['আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন', 'ভাষা আন্দোলনের শহীদদের স্মরণে আলোচনা সভা ও কবিতা পাঠ।', '২০২৬-০২-২১', '২০২৬-০২-২১', 'শহীদ মিনার', '/img/cover/event2/800/400', 0],
    ['গবেষণা কর্মশালা: লেখালেখির পদ্ধতি', 'প্রফেশনাল লেখকদের তত্ত্বাবধানে একদিনের গবেষণা কর্মশালা।', '২০২৬-০৩-১০', '২০২৬-০৩-১০', 'অনলাইন (জুম)', '/img/cover/event3/800/400', 0],
    ['প্রকাশনা মেলা ও বইমেলা', 'সদস্যদের প্রকাশিত বইয়ের প্রদর্শনী ও বিক্রয়।', '২০২৬-০৪-২০', '২০২৬-০৪-২২', 'কেন্দ্রীয় মিলনায়তন', '/img/cover/event4/800/400', 1]
  ];
  for (const e of events) { try { await prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(...e); } catch(e2) {} }

  // Branch committee (২০২১-২২ কার্যবর্ষ) — the real elected leadership of
  // লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় শাখা, with term_year
  // set so the committee year-filter route has data to show.
  const CURRENT_TERM = '২০২১-২২';
  const committee = [
    ['Md. Rafsan', 'সভাপতি', 0], ['K.M. Akij Mahmud', 'সাধারণ সম্পাদক', 1],
    ['Mushfiqur Rahman Emon', 'সাংগঠনিক সম্পাদক', 2], ['Rabby Hasan', 'অর্থ সম্পাদক', 3],
    ['Jannatul Ferdous SaYma', 'দপ্তর সম্পাদক', 4], ['Murad Hoshen', 'উপ দপ্তর সম্পাদক', 5],
    ['আয়েশা সিদ্দিকা', 'প্রচার সম্পাদক', 6], ['Tawhida Akter', 'উপ প্রচার সম্পাদক', 7],
    ['Sk Rafiquzzaman', 'প্রশিক্ষণ বিষয়ক সম্পাদক', 8]
  ];
  for (const [name, role, sort_order] of committee) {
    try {
      await prepare(`INSERT OR IGNORE INTO members (name, role, designation, member_type, term_year, sort_order)
               VALUES (?, ?, 'চট্টগ্রাম বিশ্ববিদ্যালয় শাখা কমিটি', 'central', ?, ?)`).run(name, role, CURRENT_TERM, sort_order);
    } catch(e) {}
  }

  const advisors = [
    ['অধ্যাপক ড. মো. আবুল কালাম', 'প্রধান উপদেষ্টা', 1], ['বিচারপতি (অব.) হাসিনা বেগম', 'আইনি উপদেষ্টা', 2],
    ['প্রফেসর ড. রফিকুল ইসলাম', 'শিক্ষা উপদেষ্টা', 3], ['মো. সাইফুল ইসলাম', 'অর্থনৈতিক উপদেষ্টা', 4],
    ['কবি মো. নাজমুল হক', 'সাহিত্য উপদেষ্টা', 5], ['ডা. সেলিনা আক্তার', 'স্বাস্থ্য উপদেষ্টা', 6],
    ['মো. ফারুক আহমেদ', 'প্রযুক্তি উপদেষ্টা', 7], ['শিল্পী নাজনীন আক্তার', 'সাংস্কৃতিক উপদেষ্টা', 8],
    ['মো. তৌহিদুল ইসলাম', 'গণমাধ্যম উপদেষ্টা', 9], ['অধ্যাপক সুফিয়া বেগম', 'নারী উন্নয়ন উপদেষ্টা', 10]
  ];
  for (const [name, designation, sort_order] of advisors) {
    try {
      await prepare(`INSERT INTO members (name, role, designation, member_type, term_year, sort_order) VALUES (?, 'উপদেষ্টা', ?, 'advisory', '২০২৪-২৫', ?)`)
        .run(name, designation, sort_order);
    } catch(e) {}
  }

  const gallery = [
    ['সাহিত্য সম্মেলন ২০২৫', 'সম্মেলনের একাংশ, কবি ও লেখকদের পদচারণায় মুখরিত ছিল পুরো মঞ্চ।', '/img/cover/gal1/600/400', 'events'],
    ['কর্মশালা ২০২৫', 'গবেষণা কর্মশালায় তরুণ গবেষকদের সরব উপস্থিতি।', '/img/cover/gal2/600/400', 'workshops'],
    ['ম্যাগাজিন প্রকাশ', 'নতুন ম্যাগাজিনের মোড়ক উন্মোচন অনুষ্ঠান।', '/img/cover/gal3/600/400', 'events'],
    ['আলোচনা সভা', 'মাসিক আলোচনা সভায় বিশিষ্ট ব্যক্তিবর্গ।', '/img/cover/gal4/600/400', 'meetings'],
    ['বইমেলা স্টল', 'অমর একুশে বইমেলায় আমাদের স্টল।', '/img/cover/gal5/600/400', 'events'],
    ['টিম মিটিং', 'কার্যনির্বাহী সভায় উপস্থিত সদস্যবৃন্দ।', '/img/cover/gal6/600/400', 'meetings'],
    ['পুরস্কার বিতরণী', 'বার্ষিক লেখক সম্মাননা ২০২৫।', '/img/cover/gal7/600/400', 'awards'],
    ['নবীন বরণ', 'নতুন সদস্যদের বরণ ও পরিচিতি সভা।', '/img/cover/gal8/600/400', 'events'],
    ['সেমিনার', 'বাংলা সাহিত্যের ভবিষ্যৎ শীর্ষক সেমিনার।', '/img/cover/gal9/600/400', 'workshops'],
    ['সাংস্কৃতিক সন্ধ্যা', 'সাংস্কৃতিক সন্ধ্যায় নজরুলগীতি ও রবীন্দ্রসঙ্গীত পরিবেশনা।', '/img/cover/gal10/600/400', 'events'],
    ['সংবাদ সম্মেলন', 'সংগঠনের বার্ষিক সংবাদ সম্মেলনে সাংবাদিকদের প্রশ্নোত্তর পর্ব।', '/img/cover/press1/600/400', 'press'],
    ['সংবাদপত্রে সংবাদ', 'জাতীয় দৈনিকে প্রকাশিত সংগঠনের কার্যক্রমের সংবাদ।', '/img/cover/press2/600/400', 'press'],
    ['টেলিভিশন সাক্ষাৎকার', 'জাতীয় টেলিভিশনে সদস্যদের সাক্ষাৎকারের মুহূর্ত।', '/img/cover/press3/600/400', 'press'],
    ['মিডিয়া কভারেজ', 'গণমাধ্যমে সংগঠনের ইভেন্টের কভারেজ।', '/img/cover/press4/600/400', 'press'],
    ['সৃজনশীল লেখালেখি কর্মশালা', 'কর্মশালায় অংশগ্রহণকারীদের কলম চর্চার মুহূর্ত।', '/img/cover/ws1/600/400', 'workshops'],
    ['প্রযুক্তি কর্মশালা', 'ডিজিটাল প্রকাশনা ও অনলাইন প্ল্যাটফর্ম বিষয়ক কর্মশালা।', '/img/cover/ws2/600/400', 'workshops'],
    ['সম্পাদনা কর্মশালা', 'পাণ্ডুলিপি সম্পাদনা ও স্টাইলগাইড প্রশিক্ষণ।', '/img/cover/ws3/600/400', 'workshops'],
    ['কবিতা পাঠ কর্মশালা', 'আবৃত্তি ও কবিতা পাঠ প্রশিক্ষণ কর্মশালা।', '/img/cover/ws4/600/400', 'workshops'],
    ['বসন্ত উৎসব', 'বসন্ত উপলক্ষে আয়োজিত সাংস্কৃতিক অনুষ্ঠানের মুহূর্ত।', '/img/cover/event-spring/600/400', 'events'],
    ['বার্ষিক সাধারণ সভা', 'বার্ষিক সাধারণ সভা ও পুরস্কার বিতরণীর মঞ্চ।', '/img/cover/event-agm/600/400', 'events']
  ];
  for (const [title, caption, image_url, category] of gallery) {
    try { await prepare('INSERT INTO gallery (title, caption, image_url, category) VALUES (?, ?, ?, ?)').run(title, caption, image_url, category); } catch(e) {}
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // সেশন ৬০: [শিরোনাম, বডি(ব্যাখ্যা), image_url, তারিখ, options(JSON), answer]
  const quizzes = [
    ['আজকের কুইজ: কবিতায় ছন্দ কত প্রকার?', 'মূলত ৩ প্রকার: মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত।', null, today, JSON.stringify(['২ প্রকার','৩ প্রকার','৪ প্রকার','৫ প্রকার']), 1],
    ['কুইজ: বাংলা সাহিত্যের একজন পথিকৃৎ কে ছিলেন?', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়কে আধুনিক বাংলা উপন্যাসের পথিকৃৎ ধরা হয়।', null, yesterday, JSON.stringify(['রবীন্দ্রনাথ ঠাকুর','বঙ্কিমচন্দ্র চট্টোপাধ্যায়','কাজী নজরুল ইসলাম','মাইকেল মধুসূদন দত্ত']), 1],
    ['কুইজ: রবীন্দ্রনাথ নোবেল পুরস্কার পান কোন গ্রন্থের জন্য?', 'গীতাঞ্জলি কাব্যগ্রন্থের জন্য, ১৯১৩ সালে।', null, '2026-08-31', JSON.stringify(['সোনার তরী','গীতাঞ্জলি','চোখের বালি','বলাকা']), 1],
    ['কুইজ: নজরুলের প্রথম কাব্যগ্রন্থ কোনটি?', 'বিষের বাঁশী (১৯২৪)।', null, '2026-08-30', JSON.stringify(['অগ্নি-বীণা','বিষের বাঁশী','ভাঙার গান','সিন্ধু-হিন্দোল']), 1],
    ['কুইজ: মাইকেল মধুসূদনের প্রথম মহাকাব্য?', 'মেঘনাদবধ কাব্য (১৮৬১)।', null, '2026-08-29', JSON.stringify(['কৃষ্ণকুমারী','মেঘনাদবধ কাব্য','শর্মিষ্ঠা','বীরাঙ্গনা কাব্য']), 1],
    ['কুইজ: বাংলা একাডেমি কবে প্রতিষ্ঠিত হয়?', '১৯৫৫ সালের ৩ ডিসেম্বর।', null, '2026-08-28', JSON.stringify(['১৯৪৭ সালে','১৯৫২ সালে','১৯৫৫ সালে','১৯৭১ সালে']), 2],
    ['কুইজ: অমর একুশে বইমেলা কোথায় হয়?', 'বাংলা একাডেমি প্রাঙ্গণ, ঢাকা।', null, '2026-08-27', JSON.stringify(['রমনা বটমূল','বাংলা একাডেমি প্রাঙ্গণ','সোহরাওয়ার্দী উদ্যান','জাতীয় জাদুঘর প্রাঙ্গণ']), 1],
    ['কুইজ: বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?', 'মেঘনাদবধ কাব্য।', null, '2026-08-26', JSON.stringify(['মেঘনাদবধ কাব্য','শ্রীকৃষ্ণকীর্তন','অন্নদামঙ্গল','কৃষ্ণকুমারী']), 0],
    ['কুইজ: বাংলা ভাষা আন্দোলন কোন সালে হয়?', '১৯৫২ সালে।', null, '2026-08-25', JSON.stringify(['১৯৪৭ সালে','১৯৫২ সালে','১৯৫৮ সালে','১৯৬৯ সালে']), 1],
    ['কুইজ: "সঞ্চয়িতা" কার কাব্য সংকলন?', 'রবীন্দ্রনাথ ঠাকুরের।', null, '2026-08-24', JSON.stringify(['কাজী নজরুল ইসলামের','রবীন্দ্রনাথ ঠাকুরের','জীবনানন্দ দাশের','সুকান্ত ভট্টাচার্যের']), 1]
  ];
  for (const q of quizzes) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published, options, answer) VALUES (?, ?, ?, ?, ?, 1, ?, ?)').run('quiz', ...q); } catch(e) {} }

  const onThisDay = [
    ['আজকের এই দিনে: ভাষা আন্দোলনের ইতিহাস', '১৯৫২ সালের ২১ ফেব্রুয়ারি ভাষা আন্দোলনের ইতিহাস।', '/img/cover/hist1/600/300', today],
    ['এই দিনে: কাজী নজরুলের জন্ম', '১৮৯৯ সালের ২৪ মে কাজী নজরুল ইসলামের জন্ম।', '/img/cover/hist2/600/300', '2026-05-24'],
    ['এই দিনে: রবীন্দ্রনাথের নোবেল', '১৯১৩ সালের এই দিনে রবীন্দ্রনাথ নোবেল পুরস্কার পান।', '/img/cover/hist3/600/300', '2026-11-13'],
    ['এই দিনে: বঙ্গবন্ধুর ঐতিহাসিক ভাষণ', '১৯৭১ সালের এই দিনে ঐতিহাসিক ভাষণ প্রদান।', '/img/cover/hist5/600/300', '2026-03-07'],
    ['এই দিনে: মুক্তিযুদ্ধ শুরু', '১৯৭১ সালের ২৬ মার্চ মহান মুক্তিযুদ্ধ শুরু।', '/img/cover/hist6/600/300', '2026-03-26'],
    ['এই দিনে: বাংলাদেশ স্বাধীন', '১৯৭১ সালের ১৬ ডিসেম্বর বাংলাদেশ স্বাধীনতা লাভ।', '/img/cover/hist7/600/300', '2026-12-16'],
    ['এই দিনে: শহীদ দিবস', '১৯৫২ সালের ২১ ফেব্রুয়ারি শহীদ দিবস।', '/img/cover/hist8/600/300', '2026-02-21'],
    ['এই দিনে: আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা', '১৯৯৯ সালে ইউনেস্কো এই দিনটি ঘোষণা করে।', '/img/cover/hist9/600/300', '2026-11-17'],
    ['এই দিনে: সংবিধান কার্যকর', '১৯৭২ সালের ৪ নভেম্বর বাংলাদেশের সংবিধান কার্যকর।', '/img/cover/hist10/600/300', '2026-11-04'],
    ['এই দিনে: স্বাধীনতার ঘোষণা', '১৯৭১ সালের ২৬ মার্চ স্বাধীনতার ঘোষণা।', '/img/cover/hist4/600/300', '2026-04-12']
  ];
  for (const o of onThisDay) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('this_day', ...o); } catch(e) {} }

  const activities = [
    ['বার্ষিক সাহিত্য সম্মেলন', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', '/img/cover/act1/600/300', '2026-02-15'],
    ['লেখক প্রশিক্ষণ কর্মশালা', 'নতুন লেখকদের জন্য দুই দিনব্যাপী প্রশিক্ষণ।', '/img/cover/act2/600/300', '2026-03-10'],
    ['বই পড়া কর্মসূচি', 'মাসব্যাপী বই পড়া ও আলোচনা।', '/img/cover/act3/600/300', '2026-04-05'],
    ['ক্যাম্পাস কবিতা উৎসব', 'ক্যাম্পাসে কবিতা উৎসব।', '/img/cover/act4/600/300', '2026-05-12'],
    ['সাংস্কৃতিক সন্ধ্যা', 'নজরুল ও রবীন্দ্রসঙ্গীত সন্ধ্যা।', '/img/cover/act5/600/300', '2026-06-20'],
    ['প্রকাশনা উৎসব', 'নতুন বই ও ম্যাগাজিন প্রকাশ উপলক্ষে উৎসব।', '/img/cover/act6/600/300', '2026-07-15'],
    ['গবেষণা সেমিনার', 'বাংলা সাহিত্যের আধুনিক ধারা শীর্ষক সেমিনার।', '/img/cover/act7/600/300', '2026-08-08'],
    ['আন্তঃক্যাম্পাস সাহিত্য সম্মেলন', 'বিভিন্ন ক্যাম্পাসের লেখকদের অংশগ্রহণে সম্মেলন।', '/img/cover/act8/600/300', '2026-09-22'],
    ['ফেলোশিপ পুরস্কার বিতরণ', 'প্রতিভাবান লেখকদের ফেলোশিপ প্রদান।', '/img/cover/act9/600/300', '2026-10-30'],
    ['বার্ষিক সাধারণ সভা', 'বার্ষিক সাধারণ সভা ও নির্বাচন।', '/img/cover/act10/600/300', '2026-12-15']
  ];
  for (const a of activities) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('activity', ...a); } catch(e) {} }

  const epapers = [
    ['দৈনিক ই-পেপার ০১', 'আজকের ই-পেপার পড়ুন।', 'https://example.com/epaper/01.pdf', '/img/cover/ep1/600/300', today],
    ['দৈনিক ই-পেপার ০২', 'গতকালের ই-পেপার।', 'https://example.com/epaper/02.pdf', '/img/cover/ep2/600/300', yesterday],
    ['সাপ্তাহিক ম্যাগাজিন, সপ্তাহ ১', 'এই সপ্তাহের সেরা লেখা।', 'https://example.com/weekly/01.pdf', '/img/cover/ep3/600/300', '2026-09-01'],
    ['মাসিক সাহিত্য পত্রিকা', 'এই মাসের বিশেষ সংখ্যা।', 'https://example.com/monthly/01.pdf', '/img/cover/ep4/600/300', '2026-09-01'],
    ['বিশেষ সংখ্যা: ভাষা আন্দোলন', 'ভাষা আন্দোলন বিশেষ সংখ্যা।', 'https://example.com/special/01.pdf', '/img/cover/ep5/600/300', '2026-02-21'],
    ['সাহিত্য বিশেষ সংখ্যা', 'কবি-সাহিত্যিকদের লেখা।', 'https://example.com/literature/01.pdf', '/img/cover/ep6/600/300', '2026-04-12'],
    ['গবেষণা পত্রিকা', 'গবেষণামূলক প্রবন্ধ সংকলন।', 'https://example.com/research/01.pdf', '/img/cover/ep7/600/300', '2026-06-15'],
    ['নবীন লেখক সংখ্যা', 'নতুন লেখকদের লেখা সংকলন।', 'https://example.com/new/01.pdf', '/img/cover/ep8/600/300', '2026-07-20'],
    ['বিশেষ সাক্ষাৎকার', 'বিশিষ্ট লেখকদের সাক্ষাৎকার।', 'https://example.com/interview/01.pdf', '/img/cover/ep9/600/300', '2026-08-10'],
    ['বর্ষপূর্তি সংখ্যা', 'পত্রিকার বর্ষপূর্তি বিশেষ সংখ্যা।', 'https://example.com/anniversary/01.pdf', '/img/cover/ep10/600/300', '2026-12-01']
  ];
  for (const e of epapers) { try { await prepare('INSERT INTO daily_content (content_type, title, body, link_url, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, ?, 1)').run('epaper', ...e); } catch(err) {} }

  const achievements = [
    ['বার্ষিক সেরা লেখক', 'ইসমাইল হোসেন', '২০২৫', 'বছরের সেরা লেখক হিসেবে নির্বাচিত।', null, 1],
    ['জাতীয় কবিতা পুরস্কার', 'কারিশমা ইরিন এ্যামি', '২০২৪', 'জাতীয় পর্যায়ে কবিতায় প্রথম স্থান।', null, 2],
    ['ফেলোশিপ অনুদান', 'মোনেম শাহরিয়ার শাওন', '২০২৪', 'ফেলোশিপ গবেষণা অনুদান প্রাপ্তি।', null, 3],
    ['প্রকাশনা সম্মাননা', 'জান্নাতুল ফেরদৌস ইকরা', '২০২৩', 'সেরা প্রকাশনার জন্য সম্মাননা।', null, 4],
    ['ক্যাম্পাস সেরা লেখক', 'মাহফুজ রহমান', '২০২৫', 'ক্যাম্পাসে সেরা লেখক।', null, 5],
    ['কাব্য পুরস্কার', 'নুসরাত সুলতানা', '২০২৪', 'কাব্য রচনায় বিশেষ অবদান।', null, 6],
    ['প্রবন্ধ প্রতিযোগিতা', 'রাসেল হোসেন সাকিব', '২০২৩', 'প্রবন্ধ প্রতিযোগিতায় পুরস্কার।', null, 7],
    ['অনুবাদ সম্মাননা', 'সানজিদা আফরোজ', '২০২৪', 'সেরা অনুবাদক হিসেবে সম্মানিত।', null, 8],
    ['ডিজিটাল লেখালেখি', 'ঋতু আক্তার', '২০২৫', 'ডিজিটাল লেখালেখিতে অসামান্য অবদান।', null, 9],
    ['সাংগঠনিক সম্মাননা', 'আবরার আহাদ রাফি', '২০২৪', 'সংগঠনের জন্য বিশেষ অবদান।', null, 10]
  ];
  for (const a of achievements) { try { await prepare('INSERT INTO achievements (title, recipient_name, year, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...a); } catch(e) {} }

  const pastPresidents = [
    ['মো. আনোয়ার হোসেন', 'president', '২০২২', '২০২৪', null, 1],
    ['ড. শামসুদ্দিন আহমেদ', 'president', '২০২০', '২০২২', null, 2],
    ['মো. কামাল উদ্দিন', 'president', '২০১৮', '২০২০', null, 3],
    ['মো. শাহজাহান সরকার', 'president', '২০১৬', '২০১৮', null, 4],
    ['মো. জহিরুল ইসলাম', 'president', '২০১৪', '২০১৬', null, 5]
  ];
  for (const p of pastPresidents) { try { await prepare('INSERT INTO past_leaders (name, role, term_start, term_end, photo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...p); } catch(e) {} }

  const pastSecretaries = [
    ['ফারহানা ইয়াসমিন', 'general_secretary', '২০২২', '২০২৪', null, 1],
    ['তানভীর আহমেদ', 'general_secretary', '২০২০', '২০২২', null, 2],
    ['মেহেদী হাসান', 'general_secretary', '২০১৮', '২০২০', null, 3],
    ['সাবরিনা ইসলাম', 'general_secretary', '২০১৬', '২০১৮', null, 4],
    ['ওয়াহিদুজ্জামান', 'general_secretary', '২০১৪', '২০১৬', null, 5]
  ];
  for (const p of pastSecretaries) { try { await prepare('INSERT INTO past_leaders (name, role, term_start, term_end, photo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...p); } catch(e) {} }

  const constitutionSections = [
    ['ধারা ১: নাম ও সংজ্ঞা', 'এই সংগঠনের নাম "লেখক ফোরাম"। এটি একটি অরাজনৈতিক, অলাভজনক সাহিত্য ও সংস্কৃতি বিষয়ক সংগঠন।', 1],
    ['ধারা ২: উদ্দেশ্য', 'বাংলা ভাষা ও সাহিত্যের চর্চা, প্রচার ও সম্প্রসারণ। তরুণ লেখকদের পৃষ্ঠপোষকতা। সৃজনশীলতার বিকাশ।', 2],
    ['ধারা ৩: সদস্যপদ', 'যেকোনো লেখক এই সংগঠনের সদস্য হতে পারবেন। সদস্যপদ অর্জনের জন্য নির্ধারিত ফি প্রদান করতে হবে।', 3],
    ['ধারা ৪: সদস্যদের অধিকার', 'সাধারণ সভায় ভোটাধিকার, নির্বাচনে প্রার্থিতার অধিকার, সংগঠনের সকল কার্যক্রমে অংশগ্রহণের অধিকার।', 4],
    ['ধারা ৫: সদস্যদের দায়িত্ব', 'সংগঠনের গঠনতন্ত্র মেনে চলা, নিয়মিত চাঁদা প্রদান, সকল কার্যক্রমে সক্রিয় অংশগ্রহণ।', 5],
    ['ধারা ৬: কার্যনির্বাহী কমিটি', 'সভাপতি, সাধারণ সম্পাদকসহ কমিটি নির্দিষ্ট মেয়াদে নির্বাচিত হবে।', 6],
    ['ধারা ৭: সাধারণ সভা', 'বছরে অন্তত একবার সাধারণ সভা অনুষ্ঠিত হবে। বিশেষ সভা প্রয়োজনে যেকোনো সময় আহ্বান করা যাবে।', 7],
    ['ধারা ৮: অর্থনৈতিক বিষয়', 'সদস্যদের চাঁদা, অনুদান, প্রকাশনা থেকে অর্জিত আয় সংগঠনের কাজে ব্যয় হবে।', 8],
    ['ধারা ৯: গঠনতন্ত্র সংশোধন', 'গঠনতন্ত্র সংশোধনের জন্য সাধারণ সভায় দুই-তৃতীয়াংশ সদস্যের ভোট প্রয়োজন।', 9],
    ['ধারা ১০: বিলুপ্তি', 'সংগঠন বিলুপ্ত হলে সম্পদ যথাযথ কর্তৃপক্ষের কাছে হস্তান্তর করা হবে।', 10]
  ];
  for (const c of constitutionSections) { try { await prepare('INSERT INTO constitution (section_title, content, sort_order) VALUES (?, ?, ?)').run(...c); } catch(e) {} }

  const resourceItems = [
    ['কবিতা লেখার কৌশল', 'কবিতা লেখার মূল ভিত্তি হলো অনুভূতির সত্যিকারের প্রকাশ।', 'guide', 'সম্পাদক'],
    ['প্রবন্ধ রচনার পদ্ধতি', 'প্রবন্ধে যুক্তি ও অনুভূতির ভারসাম্য রক্ষা করতে হয়।', 'guide', 'প্রশাসন'],
    ['ফেলোশিপ ও গবেষণা অনুদান', 'দেশী-বিদেশী বিভিন্ন ফেলোশিপ ও গবেষণা অনুদান সম্পর্কে বিস্তারিত তথ্য।', 'scholarship', 'প্রশাসন'],
    ['অনলাইনে লেখালেখি ও প্রকাশনা', 'ডিজিটাল প্ল্যাটফর্মে লেখা প্রকাশ করার সুবিধা ও সতর্কতা।', 'guide', 'সম্পাদক'],
    ['গঠনতন্ত্র সম্পূর্ণ কপি', 'লেখক ফোরামের সম্পূর্ণ গঠনতন্ত্র।', 'document', 'প্রশাসন'],
    ['বার্ষিক প্রতিবেদন ২০২৫', '২০২৫ সালের বার্ষিক প্রতিবেদন।', 'report', 'প্রশাসন'],
    ['সদস্যপদ ফর্ম', 'সদস্যপদের জন্য আবেদন ফর্ম।', 'form', 'প্রশাসন'],
    ['কবিতার সংকলন — ভলিউম ১', 'সেরা কবিতার সংকলন।', 'anthology', 'সম্পাদক'],
    ['ছোটগল্প সংকলন', 'সদস্যদের লেখা ছোটগল্পের সংকলন।', 'anthology', 'সম্পাদক'],
    ['সাহিত্য পরিভাষা', 'সাহিত্য বিষয়ক গুরুত্বপূর্ণ পরিভাষা।', 'reference', 'সম্পাদক']
  ];
  for (const r of resourceItems) { try { await prepare('INSERT INTO resources (title, content, category, author, tags) VALUES (?, ?, ?, ?, ?)').run(r[0], r[1], r[2], r[3], r[2]); } catch(e) {} }

  // Demo users + sample articles/questions (only if `users` table is still empty —
  // don't clobber a real db/seed-users.js run)
  const uc = await prepare('SELECT COUNT(*) as c FROM users').get();
  if (!uc || uc.c === 0) {
    const demoPwd = bcrypt.hashSync('demo123', 10);
    const sampleAuthors = [
      { name: 'ইসমাইল হোসেন', handle: 'ismail' },
      { name: 'মোনেম শাহরিয়ার শাওন', handle: 'monem' },
      { name: 'কারিশমা ইরিন এ্যামি', handle: 'karishma' },
      { name: 'মাহফুজ রহমান', handle: 'mahfuz' },
      { name: 'নুসরাত সুলতানা', handle: 'nusrat' }
    ];
    for (const a of sampleAuthors) {
      try {
        await prepare(`INSERT INTO users (username, password_hash, full_name, gender, designation, bio, status, role) VALUES (?, ?, ?, ?, ?, ?, 'active', 'user')`)
          .run(a.handle, demoPwd, a.name, 'other', 'সাহিত্যিক', `${a.name} একজন প্রতিশ্রুতিশীল লেখক।`);
      } catch(e) {}
    }

    const sampleArticles = [
      ['কবিতায় ছন্দের যাত্রা', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত, এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।', 'কবিতা,ছন্দ', '/img/cover/art1/800/400'],
      ['বাংলা গদ্যের বিবর্তন', 'আধুনিক বাংলা গদ্যের বিবর্তন একটি দীর্ঘ যাত্রা। প্রতিটি যুগ এনেছে নতুন ধারা ও কণ্ঠস্বর।', 'গদ্য,সাহিত্য', '/img/cover/art2/800/400'],
      ['প্রবন্ধ রচনায় যুক্তি ও অনুভূতি', 'প্রবন্ধ হলো যুক্তি ও অনুভূতির সংশ্লেষ। একটি ভালো প্রবন্ধ পাঠকের চিন্তা ও হৃদয় দুটোকেই স্পর্শ করে।', 'প্রবন্ধ,রচনা', '/img/cover/art3/800/400'],
      ['উপন্যাসের চরিত্রায়ণ', 'উপন্যাসে চরিত্রের গভীরতা সাহিত্যিক সাফল্যের মূল চাবিকাঠি।', 'উপন্যাস,চরিত্র', '/img/cover/art4/800/400'],
      ['ছোটগল্পের শিল্প', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা, এটাই ছোটগল্পের শিল্প।', 'ছোটগল্প,শিল্প', '/img/cover/art5/800/400'],
      ['অনুবাদ সাহিত্যের ভূমিকা', 'অনুবাদ সাহিত্যিক আদান-প্রদানের সবচেয়ে কার্যকর মাধ্যম।', 'অনুবাদ,সাহিত্য', '/img/cover/art6/800/400'],
      ['নারী লেখকদের কণ্ঠস্বর', 'বাংলা সাহিত্যে নারী লেখকদের অবদান অপরিসীম।', 'নারী,সাহিত্যিক', '/img/cover/art7/800/400'],
      ['প্রকৃতি ও কবিতা', 'প্রকৃতি কবির অনুপ্রেরণার চিরন্তন উৎস।', 'প্রকৃতি,কবিতা', '/img/cover/art8/800/400'],
      ['সাহিত্য ও সমাজ', 'সাহিত্য সমাজের দর্পণ। সমাজের পরিবর্তনের সাথে সাথে সাহিত্যের ধারাও বদলায়।', 'সমাজ,সাহিত্য', '/img/cover/art9/800/400'],
      ['ডিজিটাল যুগে লেখালেখি', 'ডিজিটাল প্ল্যাটফর্ম লেখালেখির নতুন দিগন্ত খুলে দিয়েছে।', 'ডিজিটাল,প্রযুক্তি', '/img/cover/art10/800/400']
    ];
    for (let i = 0; i < sampleArticles.length; i++) {
      const a = sampleArticles[i];
      const author = sampleAuthors[i % sampleAuthors.length];
      const u = await prepare('SELECT id FROM users WHERE username = ?').get(author.handle);
      if (u) {
        try {
          await prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, status, featured, published_at) VALUES (?, 'article', ?, ?, ?, ?, ?, 'published', ?, datetime('now', '-' || ? || ' days'))`)
            .run(u.id, a[0], a[1], a[1].substring(0, 150), a[3], a[2], i < 3 ? 1 : 0, i);
        } catch(e) {}
      }
    }

    const sampleQ = [
      ['বাংলা কবিতায় ছন্দ কি এখনো প্রাসঙ্গিক?', 'গদ্যছন্দের যুগে মাত্রাবৃত্ত কি তার আকর্ষণ হারাচ্ছে? আপনার মতামত দিন।', 'সাহিত্য'],
      ['কোন লেখক আপনাকে সবচেয়ে বেশি অনুপ্রাণিত করেছেন?', 'আমার কাছে রবীন্দ্রনাথ, নজরুল, জীবনানন্দ, সকলেই অনুপ্রেরণাদায়ী। আপনার প্রিয় কে?', 'সাহিত্য'],
      ['সোশ্যাল মিডিয়া কি সাহিত্য চর্চায় বাধা?', 'ফেসবুক-টুইটার কি গভীর পাঠের অভ্যাস নষ্ট করছে? নাকি নতুন শ্রোতা দিচ্ছে?', 'প্রযুক্তি'],
      ['তরুণ লেখকদের জন্য পরামর্শ কী?', 'নতুন লেখক হিসেবে কীভাবে শুরু করব?', 'পরামর্শ'],
      ['অনলাইন ম্যাগাজিন বনাম প্রিন্ট?', 'প্রিন্ট ম্যাগাজিন কি ডিজিটাল যুগে টিকে থাকতে পারবে?', 'প্রকাশনা'],
      ['কবিতায় রাজনৈতিক সুর কতটা সমীচীন?', 'রাজনৈতিক কবিতা কি সাহিত্যিক শিল্পকেই প্রশ্নবিদ্ধ করে?', 'রাজনীতি'],
      ['গ্রামীণ সাহিত্য কি আজকের যুগে অবহেলিত?', 'আধুনিক লেখকেরা কি গ্রামীণ জীবন থেকে দূরে সরে যাচ্ছেন?', 'সমাজ'],
      ['কোন ভাষায় লিখব, বাংলা নাকি ইংরেজি?', 'বাংলা ভাষায় লিখলে কি আন্তর্জাতিক শ্রোতা পাওয়া কঠিন?', 'ভাষা'],
      ['ফেলোশিপ পেতে কী কী যোগ্যতা লাগে?', 'তরুণ লেখক হিসেবে কোন ফেলোশিপগুলো আবেদনের যোগ্য?', 'ফেলোশিপ'],
      ['সাহিত্য পুরস্কার কি সত্যিকারের মূল্যায়ন?', 'পুরস্কার কি সাহিত্যিক মান নির্দেশ করে, নাকি জনপ্রিয়তা?', 'পুরস্কার']
    ];
    for (let i = 0; i < sampleQ.length; i++) {
      const q = sampleQ[i];
      const author = sampleAuthors[i % sampleAuthors.length];
      const u = await prepare('SELECT id FROM users WHERE username = ?').get(author.handle);
      if (u) {
        try {
          await prepare(`INSERT INTO posts (author_id, type, title, body, category, status, published_at) VALUES (?, 'question', ?, ?, ?, 'published', datetime('now', '-' || ? || ' days'))`)
            .run(u.id, q[0], q[1], q[2], i);
        } catch(e) {}
      }
    }
  }

  saveDb();
  console.log('[db] ✓ Demo content seeded (gallery, quiz, achievements, committee, resources, sample posts...)');
}

// ── Synchronous-looking wrapper ────────────────────────────────────────────
// Every route callsite now awaits prepare(...).all()/get()/run():
//   • sql.js — methods are synchronous; `await` on their plain results is a
//     harmless pass-through, so the same route code runs unchanged.
//   • Turso — methods return promises; the awaited chain resolves normally.
function prepare(sql) {
  return backend.prepare(sql);
}

function exec(sql) {
  if (backend.type === 'sqljs') return backend.exec(sql);
  return backend.exec(sql); // already returns a promise; callers may not await
}

async function getSetting(key) {
  const row = backend.type === 'sqljs'
    ? backend.prepare('SELECT value FROM settings WHERE key = ?').get(key)
    : await backend.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

// All settings in one query — used by server.js per-request middleware to
// expose a synchronous getSetting() accessor to EJS templates (a template
// cannot await). One cheap SELECT per request on Turso.
// Settings read cache — every request reads settings via middleware; on Turso
// that is a network round-trip per request. A short TTL cache (10s) removes it,
// and setSetting() invalidates immediately so admin saves reflect instantly.
let _settingsCache = null;
let _settingsCacheAt = 0;
const SETTINGS_CACHE_MS = 10000;

async function getSettingsAll() {
  const now = Date.now();
  if (_settingsCache && now - _settingsCacheAt < SETTINGS_CACHE_MS) return _settingsCache;
  const rows = backend.type === 'sqljs'
    ? backend.prepare('SELECT key, value FROM settings').all()
    : await backend.prepare('SELECT key, value FROM settings').all();
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  _settingsCache = map;
  _settingsCacheAt = now;
  return map;
}

function setSetting(key, value) {
  _settingsCache = null;  // invalidate read cache — next read re-queries
  if (backend.type === 'sqljs') {
    backend.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    ).run(key, value);
    return;
  }
  return backend.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
  ).run(key, value);
}

// ── Content management helpers ──────────────────────────────────────────────
// getContent(page, key) → reads from settings table with key 'content_<page>_<key>'
// setContent(page, key, value) → writes to settings table
// getAllContent() → returns all content_* keys as { page: { key: value } }
function getContentSync(settingsMap, page, key, fallback) {
  const fullKey = 'content_' + page + '_' + key;
  return (settingsMap && fullKey in settingsMap) ? settingsMap[fullKey] : (fallback !== undefined ? fallback : '');
}

async function getContent(page, key, fallback) {
  const val = await getSetting('content_' + page + '_' + key);
  return val !== null ? val : (fallback !== undefined ? fallback : '');
}

function setContent(page, key, value) {
  return setSetting('content_' + page + '_' + key, value);
}

function saveDb() {
  if (backend) backend.save();
}

// flushDb — force-upload the DB snapshot to Vercel Blob right now (no debounce).
// Called on server shutdown; no-op outside snapshot mode.
async function flushDb() {
  if (backend && backend.flush) await backend.flush();
}

// ── Moderator helpers (sync-friendly on sql.js, async on Turso) ────────────
// Scope alias map: the /admin panel historically used plural keys
// ('notices', 'events') while the /moderator panel + MODERATOR_SCOPES
// catalogue use singular ('notice', 'event'). A moderator holding either
// variant must pass BOTH panels' checks, so hasScope() accepts aliases.
const SCOPE_ALIASES = { notices: 'notice', events: 'event', notice: 'notices', event: 'events' };
// The admin scope UI also offers a single umbrella 'daily' checkbox as a
// shortcut for all four daily-content types — but nothing ever checked for
// it, so granting only 'daily' silently unlocked none of /moderator/daily/*
// (found in testing: granting 'daily' via /admin/users/:id/scopes still 403'd
// on /moderator/daily/quiz). Any of these four scope checks now also passes
// if the user holds the umbrella 'daily' scope instead.
const DAILY_CONTENT_SCOPES = ['quiz', 'this_day', 'activity', 'epaper'];
function isModerator(userId) {
  if (backend.type === 'sqljs') return !!backend.prepare('SELECT id FROM moderators WHERE user_id = ?').get(userId);
  return backend.prepare('SELECT id FROM moderators WHERE user_id = ?').get(userId).then(r => !!r);
}
function getModeratorScopes(userId) {
  if (backend.type === 'sqljs') {
    return backend.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(userId).map(r => r.scope);
  }
  return backend.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(userId).then(rows => rows.map(r => r.scope));
}
function hasScope(userId, scope) {
  const variants = [scope];
  if (SCOPE_ALIASES[scope]) variants.push(SCOPE_ALIASES[scope]);
  if (DAILY_CONTENT_SCOPES.includes(scope)) variants.push('daily');
  if (backend.type === 'sqljs') {
    return variants.some(v => !!backend.prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(userId, v));
  }
  return (async () => {
    for (const v of variants) {
      const r = await backend.prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(userId, v);
      if (r) return true;
    }
    return false;
  })();
}
function grantModerator(userId, scopes, grantedBy) {
  if (backend.type === 'sqljs') {
    const m = backend.prepare('SELECT id FROM moderators WHERE user_id = ?').get(userId);
    if (!m) backend.prepare('INSERT INTO moderators (user_id, added_by) VALUES (?, ?)').run(userId, grantedBy || null);
    backend.prepare("UPDATE users SET role = 'moderator' WHERE id = ?").run(userId);
    backend.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
    (scopes || []).forEach(s => {
      backend.prepare('INSERT INTO moderator_scopes (user_id, scope, granted_by) VALUES (?, ?, ?)').run(userId, s, grantedBy || null);
    });
    return;
  }
  return (async () => {
    const m = await backend.prepare('SELECT id FROM moderators WHERE user_id = ?').get(userId);
    if (!m) await backend.prepare('INSERT INTO moderators (user_id, added_by) VALUES (?, ?)').run(userId, grantedBy || null);
    await backend.prepare("UPDATE users SET role = 'moderator' WHERE id = ?").run(userId);
    await backend.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
    for (const s of (scopes || [])) {
      await backend.prepare('INSERT INTO moderator_scopes (user_id, scope, granted_by) VALUES (?, ?, ?)').run(userId, s, grantedBy || null);
    }
  })();
}
function revokeModerator(userId) {
  if (backend.type === 'sqljs') {
    backend.prepare('DELETE FROM moderators WHERE user_id = ?').run(userId);
    backend.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
    backend.prepare("UPDATE users SET role = 'user' WHERE id = ?").run(userId);
    return;
  }
  return (async () => {
    await backend.prepare('DELETE FROM moderators WHERE user_id = ?').run(userId);
    await backend.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
    await backend.prepare("UPDATE users SET role = 'user' WHERE id = ?").run(userId);
  })();
}
function listModerators() {
  if (backend.type === 'sqljs') {
    const mods = backend.prepare(`
      SELECT u.id as user_id, u.username, u.full_name, u.avatar_url
      FROM moderators m JOIN users u ON u.id = m.user_id
      ORDER BY u.full_name
    `).all();
    return mods.map(m => ({ ...m, scopes: getModeratorScopes(m.user_id) }));
  }
  return (async () => {
    const mods = await backend.prepare(`
      SELECT u.id as user_id, u.username, u.full_name, u.avatar_url
      FROM moderators m JOIN users u ON u.id = m.user_id
      ORDER BY u.full_name
    `).all();
    return Promise.all(mods.map(async m => ({ ...m, scopes: await getModeratorScopes(m.user_id) })));
  })();
}
function searchPromotableUsers(q) {
  if (!q) return [];
  if (backend.type === 'sqljs') {
    return backend.prepare(`
      SELECT id, username, full_name FROM users
      WHERE (username LIKE ? OR full_name LIKE ?) AND role != 'admin'
      ORDER BY full_name LIMIT 15
    `).all('%' + q + '%', '%' + q + '%');
  }
  return backend.prepare(`
    SELECT id, username, full_name FROM users
    WHERE (username LIKE ? OR full_name LIKE ?) AND role != 'admin'
    ORDER BY full_name LIMIT 15
  `).all('%' + q + '%', '%' + q + '%');
}

// ── অ্যাক্টিভিটি লগ (সেশন ৩৭) — fire-and-forget; লগ ফেল করলে মূল কাজ যেন না ভাঙে ──
async function logActivity(entry) {
  try {
    await prepare(
      'INSERT INTO activity_logs (user_id, username, role, action, target, detail) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      entry.user_id || null,
      entry.username || null,
      entry.role || null,
      entry.action || null,
      entry.target || null,
      String(entry.detail || '').slice(0, 300)
    );
  } catch (e) { /* টেবিল নেই (পুরনো বুট) বা লেখ ব্যর্থ — নীরবে উপেক্ষা */ }
}

// সেশন ৪২: পাবলিক সেকশন আইটেম (DB → না থাকলে রেজিস্ট্রি defaults)
async function getSectionItems(section) {
  try {
    const rows = await prepare('SELECT * FROM site_items WHERE section = ? AND is_active = 1 ORDER BY sort_order, id').all(section);
    if (rows && rows.length) return rows;
  } catch (e) {}
  const { SECTIONS } = require('./helpers/sections-registry');
  return ((SECTIONS[section] || {}).defaults || []).map((d, i) => ({ id: null, section, sort_order: i + 1, title: d.title || '', subtitle: d.subtitle || '', body: d.body || '', icon: d.icon || '', extra: d.extra || '', is_active: 1 }));
}

// টাস্ক ১৩: যাতায়াত সময়সূচি — DB (settings JSON) প্রথম; না থাকলে হেল্পার ডিফল্ট
// টাস্ক ১৩ (পর্ব ৪, অংশ ক): মাল্টি-ইমেজ হেল্পার
async function getPostImages(entityType, entityId) {
  try {
    // সেশন ১৫৩: media_type-ও ('image'|'video'|'audio') — FB-কোলাজ রেন্ডারের জন্য;
    // পুরনো DB-তে কলাম না-থাকলে নিরীহ-catch ফলব্যাকে image-হিসেবেই ধরা হয়।
    const rows = await prepare(
      'SELECT id, image_url, sort_order, media_type FROM post_images WHERE entity_type = ? AND entity_id = ? ORDER BY sort_order, id'
    ).all(entityType, entityId);
    return (rows || []).map(r => ({ ...r, media_type: r.media_type || 'image' }));
  } catch (e) { return []; }
}

// সেশন ১৫৩: FB-কম্পোজার মিডিয়া-লেখক — items = [{url, type}] (type: image|video|audio,
// কোলাজ-ক্রম অনুযায়ী)। normalizeImageList68-চুক্তি পুনঃব্যবহার (URL-স্যানিটাইজ + ডিডুপ)।
async function setPostMedia153(entityType, entityId, items) {
  const list = (Array.isArray(items) ? items : [])
    .map(it => ({ url: String((it && it.url) || '').trim(), type: String((it && it.type) || 'image').toLowerCase() }))
    .filter(it => /^https?:\/\//i.test(it.url) || it.url.startsWith('/'))
    .filter(it => ['image', 'video', 'audio'].includes(it.type));
  await prepare('DELETE FROM post_images WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
  for (let i = 0; i < list.length; i++) {
    await prepare('INSERT INTO post_images (entity_type, entity_id, image_url, sort_order, media_type) VALUES (?, ?, ?, ?, ?)')
      .run(entityType, entityId, list[i].url, i, list[i].type);
  }
  return list.length;
}

// images = array of URL strings (ক্রম অনুযায়ী) → পুরনো মুছে নতুন ক্রমে লিখে
// Session 68: central image-list sanitizer — dual-input bug sent array-of-JSON-strings
// ('["..."]') and '[]'-junk straight into image_url rows (rendered as /[] 404-src).
// (a) string elements that are themselves JSON arrays get flattened; (b) every URL
// must be http(s):// or /-prefixed; (c) dedupe. All writers go through this.
function normalizeImageList68(v) {
  const out = [];
  const seen = new Set();
  const push = (x) => {
    const s = String(x == null ? '' : x).trim();
    if (!s) return;
    if (s.startsWith('[')) {
      try {
        const a = JSON.parse(s);
        if (Array.isArray(a)) { a.forEach(push); return; }
      } catch (e) { /* plain string — falls through to pattern check */ }
    }
    if (/^https?:\/\//i.test(s) || s.startsWith('/')) {
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
  };
  if (Array.isArray(v)) v.forEach(push);
  else push(v);
  return out;
}

async function setPostImages(entityType, entityId, images) {
  const list = normalizeImageList68(images);
  await prepare('DELETE FROM post_images WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
  for (let i = 0; i < list.length; i++) {
    await prepare('INSERT INTO post_images (entity_type, entity_id, image_url, sort_order) VALUES (?, ?, ?, ?)').run(entityType, entityId, list[i], i);
  }
  return list.length;
}

async function getTransportSchedule() {
  try {
    const raw = await getSetting('transport_schedule');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.shuttle && parsed.bus && parsed.train) {
        // সেশন ১০২: পুরনো DB-JSON-এ freeShuttle কী না থাকলে হেল্পার-ডিফল্ট ইনজেক্ট —
        // লাইভ/পুরনো ডেটাতেও নতুন চাকসু-ফ্রি-বাস প্যানেল দেখা যায়; admin-মান থাকলে সেটিই প্রাধান্য।
        if (!parsed.freeShuttle) {
          try { parsed.freeShuttle = require('./helpers/transport-schedule').freeShuttle; } catch (e) {}
        }
        return parsed;
      }
    }
  } catch (e) { /* নীরবে হেল্পার ফলব্যাকে যাই */ }
  return require('./helpers/transport-schedule');
}

// সেশন ১৭৯: মডিউল-স্তরের রি-সিঙ্ক র‍্যাপার — sql.js+Blob ব্যাকএন্ডে হট-রি-সিঙ্ক চালায়;
// Turso/লোকাল-মোডে no-op (backend.syncIfStale নেই)। server.js মিডলওয়্যার এটাই ডাকে।
async function syncIfStale(force) {
  try {
    if (backend && typeof backend.syncIfStale === 'function') return await backend.syncIfStale(force);
  } catch (e) {
    console.warn('[db] syncIfStale wrapper:', e.message);
  }
  return false;
}

module.exports = {
  initDb,
  get db()       { return _sqlJsDb; },  // legacy direct access (sql.js only)
  prepare,
  getSectionItems,
  getTransportSchedule,
  getPostImages,
  setPostMedia153,
  setPostImages,
  exec,
  getSetting,
  getSettingsAll,
  setSetting,
  saveDb,
  flushDb,
  get snapshotActive() { return USE_DB_SNAPSHOT; },  // Vercel Blob-snapshot mode কিনা
  get snapshotDirty()  { return _snapshotDirty; },   // ফ্লাশ-না-হওয়া রাইট আছে কিনা
  syncIfStale, // সেশন ১৭৯: মাল্টি-ইনস্ট্যান্স হট-রি-সিঙ্ক (sql.js+Blob মোডেই কার্যকর)
  MODERATOR_SCOPES,
  SCOPE_ALIASES,
  DAILY_CONTENT_SCOPES,
  isModerator,
  getModeratorScopes,
  hasScope,
  logActivity,
  grantModerator,
  revokeModerator,
  listModerators,
  searchPromotableUsers,
  IS_TURSO,
  USE_DB_SNAPSHOT,
  getContent,
  getContentSync,
  setContent,
  formatMemberId,
  nextMemberId,
  nextMemberSeq
};
