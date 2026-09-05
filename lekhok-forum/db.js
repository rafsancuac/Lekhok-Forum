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
let _bootRestored  = false;
let _bootSeeded    = false;

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
    uploaded_by INTEGER,
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
  CREATE INDEX IF NOT EXISTS idx_nq_status ON newsletter_queue(status);
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
];
async function applyLaterMigrations() {
  for (const [table, col, def] of LATER_COLUMNS) {
    try {
      await backend.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`).run();
    } catch (e) { /* duplicate column — fine */ }
  }
  // After columns are guaranteed, auto-link members/past_leaders to users by
  // exact full_name match. Idempotent — only fills rows where user_id is null.
  try { await autoLinkMembersToUsers(); } catch (e) {
    console.error('[db] autoLinkMembersToUsers failed:', e.message);
  }
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
  { key: 'complaints',  label: 'অভিযোগ দেখা' }
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

  function saveDb() {
    const data = Buffer.from(_sqlJsDb.export());
    if (USE_DB_SNAPSHOT) {
      // /tmp is writable on serverless — keeps the live instance consistent
      try { fs.writeFileSync('/tmp/lekhok.db', data); } catch (_) {}
      // Debounced upload to Vercel Blob (survives cold starts)
      if (_uploadTimer) clearTimeout(_uploadTimer);
      _uploadTimer = setTimeout(uploadSnapshot, 1500);
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
    try {
      const { put } = require('@vercel/blob');
      const data = Buffer.from(_sqlJsDb.export());   // fresh state at upload time
      await put(SNAPSHOT_PATH, data, {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN,
        contentType: 'application/octet-stream'
      });
      console.log('[db] Snapshot saved to Vercel Blob (' + data.length + ' bytes)');
    } catch (e) {
      console.error('[db] Snapshot upload failed:', e.message);
    }
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
    "ALTER TABLE resources ADD COLUMN description TEXT"
  ];
  for (const s of alt) {
    try { await backend.exec(s); } catch (_) {}
  }

  // ── Data migration — global rebrand to the real branch identity ───────────
  // (1) settings: replace rows that still carry the old demo defaults. Only
  //     exact old values are updated, so admin-customized values are never
  //     clobbered. Idempotent — safe on every boot.
  const rebrand = [
    ['site_name',       'লেখক ফোরাম',            'বাংলাদেশ তরুণ কলাম লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়'],
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
  const ORG_DESIG_SUFFIX = 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম';
  const COMMITTEE_HISTORY = [
    { term: '২০২১-২২', members: [
      ['Md. Rafsan',             'সভাপতি',              'md_rafsan',        'male'],
      ['K.M. Akij Mahmud',       'সাধারণ সম্পাদক',         'akij_mahmud',      'male'],
      ['Mushfiqur Rahman Emon',  'সাংগঠনিক সম্পাদক',       'mushfiqur_emon',   'male'],
      ['Rabby Hasan',            'অর্থ সম্পাদক',           'rabby_hasan',      'male'],
      ['Jannatul Ferdous SaYma', 'দপ্তর সম্পাদক',           'jannatul_sayma',   'female'],
      ['Murad Hoshen',           'উপ দপ্তর সম্পাদক',        'murad_hoshen',     'male'],
      ['আয়েশা সিদ্দিকা এ্যানি',       'প্রচার সম্পাদক',         'ayesha_siddika_anny', 'female'],
      ['Tawhida Akter',          'উপ প্রচার সম্পাদক',       'tawhida_akter',    'female'],
      ['Sk Rafiquzzaman',        'প্রশিক্ষণ বিষয়ক সম্পাদক',   'sk_rafiquzzaman',  'male']
    ]},
    { term: '২০২২-২৩', members: [
      ['মো. ইউছাফুল ইসলাম সিকাত',   'সভাপতি',                 'yousuful_islam_sikat', 'male'],
      ['মো. সাইফুল মিয়া',          'সহ-সভাপতি',               'saiful_mia',           'male'],
      ['রেদওয়ান আহমেদ',            'সাধারণ সম্পাদক',           'redwan_ahmed',         'male'],
      ['নিবেদ চক্রবর্তী',           'যুগ্ম সাধারণ সম্পাদক',      'nibed_chakraborty',    'male'],
      ['মাহমূদুল রহমান',            'সাংগঠনিক সম্পাদক',         'mahmudul_rahman',      'male'],
      ['আসামুজ্জামান চৌধুরী সহাট',   'সহ-সাংগঠনিক সম্পাদক',      'asamuzzaman_chowdhury', 'male'],
      ['মো. আজিজুল হক',           'অর্থ সম্পাদক',             'azizul_haq',           'male'],
      ['নাসরিন সুলতানা রিয়া',       'দপ্তর সম্পাদক',             'nasrin_sultana_riya',  'female'],
      ['আজিজুল হক রাহি',           'উপ-দপ্তর সম্পাদক',          'azizul_hoque_rahi',    'male'],
      ['মেসবাহ উদ্দিন মিরিস',       'প্রচার ও প্রকাশনা সম্পাদক',   'mesbah_uddin_miris',   'male'],
      ['আবির হাসান',              'প্রশিক্ষণ বিষয়ক সম্পাদক',    'abir_hasan',           'male'],
      ['মিহাবল্ল জায়াত তারিন',      'সাহিত্য ও পাঠচক্র বিষয়ক সম্পাদক', 'mihaballa_jayat_tarin', 'male'],
      ['হৃদি সরকার',              'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'hridi_sorkar',      'female'],
      ['মারজান হোসেন',            'সম্পাদকীয় পর্ষদ',          'marjan_hossen',        'male'],
      ['হাসনা বেগম',              'সম্পাদকীয় পর্ষদ',          'hasna_begum',          'female']
    ]},
    { term: '২০২৪-২৫', members: [
      ['মাহমূদুল রহমান',            'সভাপতি',                 'mahmudul_rahman',      'male'],
      ['মিহাবল্ল জায়াত তারিন',      'সহ-সভাপতি',               'mihaballa_jayat_tarin', 'male'],
      ['মেসবাহ উদ্দিন মিরিস',       'সাধারণ সম্পাদক',           'mesbah_uddin_miris',   'male'],
      ['সায়াওয়াত হোসাইন রিকাত',     'যুগ্ম-সাধারণ সম্পাদক',      'sayawat_hossain_rikat', 'male'],
      ['আজিজুল হক রাহি',           'সাংগঠনিক সম্পাদক',         'azizul_hoque_rahi',    'male'],
      ['হৃদি সরকার',              'সহ-সাংগঠনিক সম্পাদক',      'hridi_sorkar',         'female'],
      ['সুমন চৌধুরী',             'অর্থ সম্পাদক',             'sumon_chowdhury',      'male'],
      ['কারিশমা ইরিন এ্যামি',        'দপ্তর সম্পাদক',             'karishma_erin_anny',   'female'],
      ['ইসমাইল হোসেন ইমন',         'উপ-দপ্তর সম্পাদক',          'ismail_hossen_emon',   'male'],
      ['মুহাম্মাদ রিয়াদ উদ্দিন',     'সাহিত্য ও প্রকাশনা সম্পাদক',  'muhammad_riyad_uddin', 'male'],
      ['মোজফ্ফা কামাল',            'প্রচার সম্পাদক',           'mojaffa_kamal',        'male'],
      ['মো. রাকিব হোসেন',          'প্রশিক্ষণ বিষয়ক সম্পাদক',    'rakib_hossen',         'male'],
      ['মো. জাহিদুল হক',           'তথ্য ও প্রযুক্তি বিষয়ক সম্পাদক', 'jahidul_haq',       'male'],
      ['এনামুল হক',               'সম্পাদকীয় পর্ষদ',          'enamul_hoque',         'male'],
      ['মোলেম শাহরিয়ার শাওন',       'সম্পাদকীয় পর্ষদ',          'molem_shahriar_shaon', 'male'],
      ['জায়াতুল ফেরদাউস ইকরা',      'কার্যনির্বাহী সদস্য',        'jayatul_ferdaus_ikra', 'female'],
      ['সাধী রানী',               'কার্যনির্বাহী সদস্য',        'sadhi_rani',           'female']
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
      const ORG_SUFFIX = 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম (চবি)';
      const desig = (role) => `${role}, ${ORG_SUFFIX}`;

      // [current username → new username, official Bengali full name]
      const ACCOUNT_FIXES = [
        ['md_rafsan',             'md_rakebul',          'মোঃ রাকেবুল'],
        ['akij_mahmud',           'akij_mahmud',         'আকিজ মাহমুদ'],
        ['mushfiqur_emon',        'mushfiqur_emon',      'মুশফিকুর রহমান ইমন'],
        ['rabby_hasan',           'rabby_hasan',         'রাব্বি হাসান'],
        ['jannatul_sayma',        'jannatul_sayma',      'জান্নাতুল ফেরদৌস সায়মা'],
        ['murad_hoshen',          'murad_hossen',        'মোঃ মুরাদ হোসেন'],
        ['ayesha_siddika_anny',   'ayesha_siddika_anny', 'আয়েশা সিদ্দিকা এ্যানি'],
        ['tawhida_akter',         'tawhida_akter',       'তৌহিদা আক্তার'],
        ['sk_rafiquzzaman',       'sk_rafiquzzaman',     'শেখ রফিকুজ্জামান'],
        ['yousuful_islam_sikat',  'irashadul_sifat',     'মো. ইরেশাদুল ইসলাম সিফাত'],
        ['saiful_mia',            'saiful_mira',         'মো. সাইফুল মিরা'],
        ['redwan_ahmed',          'redwan_ahmed',        'রেডওয়ান আহমেদ'],
        ['nibed_chakraborty',     'nibed_chakraborty',   'নিবেদ চক্রবর্তী'],
        ['mahmudul_rahman',       'mahmudul_rahman',     'মাহমূদুল রহমান'],
        ['asamuzzaman_chowdhury', 'asaduzzaman_toujuri', 'আসাদুজ্জামান তৌজুরী স্মার্ট'],
        ['azizul_haq',            'azizul_haq',          'মো. আজিজুল হক'],
        ['nasrin_sultana_riya',   'nasrin_sultana_riya', 'নাসরিন সুলতানা রিয়া'],
        ['azizul_hoque_rahi',     'azizul_hoque_rahi',   'আজিজুল হক রাহি'],
        ['mesbah_uddin_miris',    'mesbah_uddin_miris',  'মেসবাহ উদ্দিন মিরিস'],
        ['abir_hasan',            'abir_hasan',          'আবির হাসান'],
        ['mihaballa_jayat_tarin', 'mihaballa_jayat_tarin', 'মিহাবল্ল জায়াত তারিন'],
        ['hridi_sorkar',          'hridi_sorkar',        'হৃদি সরকার'],
        ['marjan_hossen',         'marjan_hossen',       'মারজান হোসেন'],
        ['hasna_begum',           'hasna_begum',         'হাসনা বেগম']
      ];

      // [name, role, username-slug, gender] — অফিসিয়াল বিজ্ঞপ্তি অনুযায়ী
      const V2_TERMS = [
        { term: '২০২০-২১', members: [
          ['আরমান শেখ',              'সভাপতি',                 'arman_sheikh',     'male'],
          ['মোঃ রাকেবুল',             'সাধারণ সম্পাদক',           'md_rakebul',       'male'],
          ['নেজাম উদ্দীন',             'সাংগঠনিক সম্পাদক',         'nezam_uddin',      'male'],
          ['আকিজ মাহমুদ',             'দপ্তর সম্পাদক',            'akij_mahmud',      'male'],
          ['মুশফিকুর রহমান ইমন',       'উপদপ্তর সম্পাদক',           'mushfiqur_emon',   'male'],
          ['রাব্বি হাসান',             'অর্থ সম্পাদক',             'rabby_hasan',      'male'],
          ['জান্নাতুল ফেরদৌস সায়মা',     'প্রচার সম্পাদিকা',           'jannatul_sayma',   'female'],
          ['আয়েশা সিদ্দিকা এ্যানি',       'উপপ্রচার সম্পাদিকা',         'ayesha_siddika_anny', 'female']
        ]},
        { term: '২০২১-২২', members: [
          ['মোঃ রাকেবুল',             'সভাপতি',                 'md_rakebul',       'male'],
          ['আকিজ মাহমুদ',             'সাধারণ সম্পাদক',           'akij_mahmud',      'male'],
          ['মোঃ মুরাদ হোসেন',          'সাংগঠনিক সম্পাদক',         'murad_hossen',     'male'],
          ['আয়েশা সিদ্দিকা এ্যানি',       'সহ-সাংগঠনিক সম্পাদক',       'ayesha_siddika_anny', 'female'],
          ['এম. আতহার নূর',           'অর্থ সম্পাদক',             'atihar_noor',      'male'],
          ['রিয়ান চন্দ্র পাল',          'সহ-অর্থ সম্পাদক',           'rian_chandra_pal', 'male'],
          ['তৌহিদা আক্তার',            'প্রচার সম্পাদক',            'tawhida_akter',    'female'],
          ['মো. মারুফ মতুব্বর',         'উপ-প্রচার সম্পাদক',          'maruf_motubbar',   'male'],
          ['জান্নাতুল ফেরদৌস সায়মা',     'দপ্তর সম্পাদক',            'jannatul_sayma',   'female'],
          ['মো. সাইফুল মিরা',          'উপ-দপ্তর সম্পাদক',          'saiful_mira',      'male'],
          ['শেখ রফিকুজ্জামান',          'প্রশিক্ষণ বিষয়ক সম্পাদক',     'sk_rafiquzzaman',  'male'],
          ['মো. মিজানুর রহমান',        'উপ-প্রশিক্ষণ সম্পাদক',        'mijanur_rahman',   'male'],
          ['মো. সিফাত তানুকানার',       'সাহিত্য ও পাঠচক্র সম্পাদক',    'sifat_tanukanar',  'male']
        ]},
        { term: '২০২২-২৩', members: [
          ['আকিজ মাহমুদ',             'সভাপতি',                 'akij_mahmud',      'male'],
          ['আয়েশা সিদ্দিকা এ্যানি',       'সহ-সভাপতি',               'ayesha_siddika_anny', 'female'],
          ['মোঃ মুরাদ হোসেন',          'সাধারণ সম্পাদক',           'murad_hossen',     'male'],
          ['মো. ইরেশাদুল ইসলাম সিফাত',   'যুগ্ম সাধারণ সম্পাদক',      'irashadul_sifat',  'male'],
          ['শেখ রফিকুজ্জামান',          'সাংগঠনিক সম্পাদক',         'sk_rafiquzzaman',  'male'],
          ['তৌহিদা আক্তার',            'সহ-সাংগঠনিক সম্পাদক',       'tawhida_akter',    'female'],
          ['এম. আতহার নূর',           'অর্থ সম্পাদক',             'atihar_noor',      'male'],
          ['মাহমূদুল রহমান',            'প্রশিক্ষণ বিষয়ক সম্পাদক',     'mahmudul_rahman',  'male'],
          ['মো. মারুফ মতুব্বর',         'প্রচার ও প্রকাশনা সম্পাদক',    'maruf_motubbar',   'male'],
          ['রোকসানা আক্তার',           'সাহিত্য ও পাঠচক্র সম্পাদক',    'roksana_akter',    'female'],
          ['মো. সাইফুল মিরা',          'দপ্তর সম্পাদক',            'saiful_mira',      'male'],
          ['মো. আজিজুল হক',           'উপ-দপ্তর সম্পাদক',          'azizul_haq',       'male'],
          ['সনবুল আহমেদ',             'তথ্য প্রযুক্তি বিষয়ক সম্পাদক',  'sonbul_ahmed',     'male'],
          ['আসাদুজ্জামান বুলবুল',        'সম্পাদকীয় পর্ষদ',           'asaduzzaman_bulbul', 'male'],
          ['আসাদুজ্জামান তৌজুরী স্মার্ট',  'সম্পাদকীয় পর্ষদ',           'asaduzzaman_toujuri', 'male']
        ]},
        { term: '২০২৩-২৪', members: [
          ['মো. ইরেশাদুল ইসলাম সিফাত',   'সভাপতি',                 'irashadul_sifat',  'male'],
          ['মো. সাইফুল মিরা',          'সহ-সভাপতি',               'saiful_mira',      'male'],
          ['রেডওয়ান আহমেদ',            'সাধারণ সম্পাদক',           'redwan_ahmed',     'male'],
          ['নিবেদ চক্রবর্তী',           'যুগ্ম সাধারণ সম্পাদক',      'nibed_chakraborty', 'male'],
          ['মাহমূদুল রহমান',            'সাংগঠনিক সম্পাদক',         'mahmudul_rahman',  'male'],
          ['আসাদুজ্জামান তৌজুরী স্মার্ট',  'সহ-সাংগঠনিক সম্পাদক',       'asaduzzaman_toujuri', 'male'],
          ['মো. আজিজুল হক',           'অর্থ সম্পাদক',             'azizul_haq',       'male'],
          ['নাসরিন সুলতানা রিয়া',       'দপ্তর সম্পাদক',            'nasrin_sultana_riya', 'female'],
          ['আজিজুল হক রাহি',           'উপ-দপ্তর সম্পাদক',          'azizul_hoque_rahi', 'male'],
          ['মেসবাহ উদ্দিন মিরিস',       'প্রচার ও প্রকাশনা সম্পাদক',    'mesbah_uddin_miris', 'male'],
          ['আবির হাসান',              'প্রশিক্ষণ বিষয়ক সম্পাদক',     'abir_hasan',       'male'],
          ['মিহাবল্ল জায়াত তারিন',      'সাহিত্য ও পাঠচক্র বিষয়ক সম্পাদক', 'mihaballa_jayat_tarin', 'male'],
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

  await runMigrations();
  await applyLaterMigrations();

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
async function ensureDemoModerator() {
  const DEMO_MOD = {
    username: 'moderator',
    password: 'moderator123',
    full_name: 'ডেমো মডারেটর',
    designation: 'মডারেটর',
    bio: 'ডেমো মডারেটর অ্যাকাউন্ট — মডারেটর প্যানেল পরীক্ষার জন্য।'
  };
  const scopes = [
    // canonical (moderator panel + catalogue)
    'quiz', 'this_day', 'best_writer', 'activity', 'notice', 'epaper', 'event', 'complaints',
    // admin-panel feature scopes
    'daily', 'gallery',
    // legacy plural variants (kept so admin checkbox UI state stays accurate)
    'notices', 'events'
  ];
  const existing = await prepare('SELECT id FROM users WHERE username = ?').get(DEMO_MOD.username);
  if (existing) {
    // Already present — only top up scopes if a moderator has none (e.g. the
    // user was promoted manually with the old broken default grant).
    const cnt = await prepare('SELECT COUNT(*) AS c FROM moderator_scopes WHERE user_id = ?').get(existing.id);
    if (existing.role !== 'moderator' || !cnt || cnt.c === 0) {
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
    ['site_name', 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়'],
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
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন, আলোচনা সভা এবং সাংস্কৃতিক অনুষ্ঠান।', '২০২৬-০২-১৫', '২০২৬-০২-১৫', 'ক্যাম্পাস অডিটোরিয়াম', 'https://picsum.photos/seed/event1/800/400', 1],
    ['আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন', 'ভাষা আন্দোলনের শহীদদের স্মরণে আলোচনা সভা ও কবিতা পাঠ।', '২০২৬-০২-২১', '২০২৬-০২-২১', 'শহীদ মিনার', 'https://picsum.photos/seed/event2/800/400', 0],
    ['গবেষণা কর্মশালা: লেখালেখির পদ্ধতি', 'প্রফেশনাল লেখকদের তত্ত্বাবধানে একদিনের গবেষণা কর্মশালা।', '২০২৬-০৩-১০', '২০২৬-০৩-১০', 'অনলাইন (জুম)', 'https://picsum.photos/seed/event3/800/400', 0],
    ['প্রকাশনা মেলা ও বইমেলা', 'সদস্যদের প্রকাশিত বইয়ের প্রদর্শনী ও বিক্রয়।', '২০২৬-০৪-২০', '২০২৬-০৪-২২', 'কেন্দ্রীয় মিলনায়তন', 'https://picsum.photos/seed/event4/800/400', 1]
  ];
  for (const e of events) { try { await prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(...e); } catch(e2) {} }

  // Branch committee (২০২১-২২ কার্যবর্ষ) — the real elected leadership of
  // বাংলাদেশ তরুণ কলাম লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় শাখা, with term_year
  // set so the committee year-filter route has data to show.
  const CURRENT_TERM = '২০২১-২২';
  const committee = [
    ['Md. Rafsan', 'সভাপতি', 0], ['K.M. Akij Mahmud', 'সাধারণ সম্পাদক', 1],
    ['Mushfiqur Rahman Emon', 'সাংগঠনিক সম্পাদক', 2], ['Rabby Hasan', 'অর্থ সম্পাদক', 3],
    ['Jannatul Ferdous SaYma', 'দপ্তর সম্পাদক', 4], ['Murad Hoshen', 'উপ দপ্তর সম্পাদক', 5],
    ['আয়েশা সিদ্দিকা এ্যানি', 'প্রচার সম্পাদক', 6], ['Tawhida Akter', 'উপ প্রচার সম্পাদক', 7],
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
      await prepare(`INSERT INTO members (name, role, designation, member_type, sort_order) VALUES (?, 'উপদেষ্টা', ?, 'advisory', ?)`)
        .run(name, designation, sort_order);
    } catch(e) {}
  }

  const gallery = [
    ['সাহিত্য সম্মেলন ২০২৫', 'সম্মেলনের একাংশ — কবি ও লেখকদের পদচারণায় মুখরিত ছিল পুরো মঞ্চ।', 'https://picsum.photos/seed/gal1/600/400', 'events'],
    ['কর্মশালা ২০২৫', 'গবেষণা কর্মশালায় তরুণ গবেষকদের সরব উপস্থিতি।', 'https://picsum.photos/seed/gal2/600/400', 'workshops'],
    ['ম্যাগাজিন প্রকাশ', 'নতুন ম্যাগাজিনের মোড়ক উন্মোচন অনুষ্ঠান।', 'https://picsum.photos/seed/gal3/600/400', 'events'],
    ['আলোচনা সভা', 'মাসিক আলোচনা সভায় বিশিষ্ট ব্যক্তিবর্গ।', 'https://picsum.photos/seed/gal4/600/400', 'meetings'],
    ['বইমেলা স্টল', 'অমর একুশে বইমেলায় আমাদের স্টল।', 'https://picsum.photos/seed/gal5/600/400', 'events'],
    ['টিম মিটিং', 'কার্যনির্বাহী সভায় উপস্থিত সদস্যবৃন্দ।', 'https://picsum.photos/seed/gal6/600/400', 'meetings'],
    ['পুরস্কার বিতরণী', 'বার্ষিক লেখক সম্মাননা ২০২৫।', 'https://picsum.photos/seed/gal7/600/400', 'awards'],
    ['নবীন বরণ', 'নতুন সদস্যদের বরণ ও পরিচিতি সভা।', 'https://picsum.photos/seed/gal8/600/400', 'events'],
    ['সেমিনার', 'বাংলা সাহিত্যের ভবিষ্যৎ শীর্ষক সেমিনার।', 'https://picsum.photos/seed/gal9/600/400', 'workshops'],
    ['সাংস্কৃতিক সন্ধ্যা', 'সাংস্কৃতিক সন্ধ্যায় নজরুলগীতি ও রবীন্দ্রসঙ্গীত পরিবেশনা।', 'https://picsum.photos/seed/gal10/600/400', 'events'],
    ['সংবাদ সম্মেলন', 'সংগঠনের বার্ষিক সংবাদ সম্মেলনে সাংবাদিকদের প্রশ্নোত্তর পর্ব।', 'https://picsum.photos/seed/press1/600/400', 'press'],
    ['সংবাদপত্রে সংবাদ', 'জাতীয় দৈনিকে প্রকাশিত সংগঠনের কার্যক্রমের সংবাদ।', 'https://picsum.photos/seed/press2/600/400', 'press'],
    ['টেলিভিশন সাক্ষাৎকার', 'জাতীয় টেলিভিশনে সদস্যদের সাক্ষাৎকারের মুহূর্ত।', 'https://picsum.photos/seed/press3/600/400', 'press'],
    ['মিডিয়া কভারেজ', 'গণমাধ্যমে সংগঠনের ইভেন্টের কভারেজ।', 'https://picsum.photos/seed/press4/600/400', 'press'],
    ['সৃজনশীল লেখালেখি কর্মশালা', 'কর্মশালায় অংশগ্রহণকারীদের কলম চর্চার মুহূর্ত।', 'https://picsum.photos/seed/ws1/600/400', 'workshops'],
    ['প্রযুক্তি কর্মশালা', 'ডিজিটাল প্রকাশনা ও অনলাইন প্ল্যাটফর্ম বিষয়ক কর্মশালা।', 'https://picsum.photos/seed/ws2/600/400', 'workshops'],
    ['সম্পাদনা কর্মশালা', 'পাণ্ডুলিপি সম্পাদনা ও স্টাইলগাইড প্রশিক্ষণ।', 'https://picsum.photos/seed/ws3/600/400', 'workshops'],
    ['কবিতা পাঠ কর্মশালা', 'আবৃত্তি ও কবিতা পাঠ প্রশিক্ষণ কর্মশালা।', 'https://picsum.photos/seed/ws4/600/400', 'workshops'],
    ['বসন্ত উৎসব', 'বসন্ত উপলক্ষে আয়োজিত সাংস্কৃতিক অনুষ্ঠানের মুহূর্ত।', 'https://picsum.photos/seed/event-spring/600/400', 'events'],
    ['বার্ষিক সাধারণ সভা', 'বার্ষিক সাধারণ সভা ও পুরস্কার বিতরণীর মঞ্চ।', 'https://picsum.photos/seed/event-agm/600/400', 'events']
  ];
  for (const [title, caption, image_url, category] of gallery) {
    try { await prepare('INSERT INTO gallery (title, caption, image_url, category) VALUES (?, ?, ?, ?)').run(title, caption, image_url, category); } catch(e) {}
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const quizzes = [
    ['আজকের কুইজ: কবিতায় ছন্দ কত প্রকার?', 'মূলত ৩ প্রকার — মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত।', null, today],
    ['কুইজ: বাংলা সাহিত্যের একজন পথিকৃৎ কে ছিলেন?', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়কে আধুনিক বাংলা উপন্যাসের পথিকৃৎ ধরা হয়।', null, yesterday],
    ['কুইজ: রবীন্দ্রনাথ নোবেল পুরস্কার পান কোন গ্রন্থের জন্য?', 'গীতাঞ্জলি কাব্যগ্রন্থের জন্য, ১৯১৩ সালে।', null, '2026-08-31'],
    ['কুইজ: নজরুলের প্রথম কাব্যগ্রন্থ কোনটি?', 'বিষের বাঁশী (১৯২৪)।', null, '2026-08-30'],
    ['কুইজ: মাইকেল মধুসূদনের প্রথম মহাকাব্য?', 'মেঘনাদবধ কাব্য (১৮৬১)।', null, '2026-08-29'],
    ['কুইজ: বাংলা একাডেমি কবে প্রতিষ্ঠিত হয়?', '১৯৫৫ সালের ৩ ডিসেম্বর।', null, '2026-08-28'],
    ['কুইজ: অমর একুশে বইমেলা কোথায় হয়?', 'বাংলা একাডেমি প্রাঙ্গণ, ঢাকা।', null, '2026-08-27'],
    ['কুইজ: বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?', 'মেঘনাদবধ কাব্য।', null, '2026-08-26'],
    ['কুইজ: বাংলা ভাষা আন্দোলন কোন সালে হয়?', '১৯৫২ সালে।', null, '2026-08-25'],
    ['কুইজ: "সঞ্চয়িতা" কার কাব্য সংকলন?', 'রবীন্দ্রনাথ ঠাকুরের।', null, '2026-08-24']
  ];
  for (const q of quizzes) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('quiz', ...q); } catch(e) {} }

  const onThisDay = [
    ['আজকের এই দিনে: ভাষা আন্দোলনের ইতিহাস', '১৯৫২ সালের ২১ ফেব্রুয়ারি ভাষা আন্দোলনের ইতিহাস।', 'https://picsum.photos/seed/hist1/600/300', today],
    ['এই দিনে: কাজী নজরুলের জন্ম', '১৮৯৯ সালের ২৪ মে কাজী নজরুল ইসলামের জন্ম।', 'https://picsum.photos/seed/hist2/600/300', '2026-05-24'],
    ['এই দিনে: রবীন্দ্রনাথের নোবেল', '১৯১৩ সালের এই দিনে রবীন্দ্রনাথ নোবেল পুরস্কার পান।', 'https://picsum.photos/seed/hist3/600/300', '2026-11-13'],
    ['এই দিনে: বঙ্গবন্ধুর ঐতিহাসিক ভাষণ', '১৯৭১ সালের এই দিনে ঐতিহাসিক ভাষণ প্রদান।', 'https://picsum.photos/seed/hist5/600/300', '2026-03-07'],
    ['এই দিনে: মুক্তিযুদ্ধ শুরু', '১৯৭১ সালের ২৬ মার্চ মহান মুক্তিযুদ্ধ শুরু।', 'https://picsum.photos/seed/hist6/600/300', '2026-03-26'],
    ['এই দিনে: বাংলাদেশ স্বাধীন', '১৯৭১ সালের ১৬ ডিসেম্বর বাংলাদেশ স্বাধীনতা লাভ।', 'https://picsum.photos/seed/hist7/600/300', '2026-12-16'],
    ['এই দিনে: শহীদ দিবস', '১৯৫২ সালের ২১ ফেব্রুয়ারি শহীদ দিবস।', 'https://picsum.photos/seed/hist8/600/300', '2026-02-21'],
    ['এই দিনে: আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা', '১৯৯৯ সালে ইউনেস্কো এই দিনটি ঘোষণা করে।', 'https://picsum.photos/seed/hist9/600/300', '2026-11-17'],
    ['এই দিনে: সংবিধান কার্যকর', '১৯৭২ সালের ৪ নভেম্বর বাংলাদেশের সংবিধান কার্যকর।', 'https://picsum.photos/seed/hist10/600/300', '2026-11-04'],
    ['এই দিনে: স্বাধীনতার ঘোষণা', '১৯৭১ সালের ২৬ মার্চ স্বাধীনতার ঘোষণা।', 'https://picsum.photos/seed/hist4/600/300', '2026-04-12']
  ];
  for (const o of onThisDay) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('this_day', ...o); } catch(e) {} }

  const activities = [
    ['বার্ষিক সাহিত্য সম্মেলন', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', 'https://picsum.photos/seed/act1/600/300', '2026-02-15'],
    ['লেখক প্রশিক্ষণ কর্মশালা', 'নতুন লেখকদের জন্য দুই দিনব্যাপী প্রশিক্ষণ।', 'https://picsum.photos/seed/act2/600/300', '2026-03-10'],
    ['বই পড়া কর্মসূচি', 'মাসব্যাপী বই পড়া ও আলোচনা।', 'https://picsum.photos/seed/act3/600/300', '2026-04-05'],
    ['ক্যাম্পাস কবিতা উৎসব', 'ক্যাম্পাসে কবিতা উৎসব।', 'https://picsum.photos/seed/act4/600/300', '2026-05-12'],
    ['সাংস্কৃতিক সন্ধ্যা', 'নজরুল ও রবীন্দ্রসঙ্গীত সন্ধ্যা।', 'https://picsum.photos/seed/act5/600/300', '2026-06-20'],
    ['প্রকাশনা উৎসব', 'নতুন বই ও ম্যাগাজিন প্রকাশ উপলক্ষে উৎসব।', 'https://picsum.photos/seed/act6/600/300', '2026-07-15'],
    ['গবেষণা সেমিনার', 'বাংলা সাহিত্যের আধুনিক ধারা শীর্ষক সেমিনার।', 'https://picsum.photos/seed/act7/600/300', '2026-08-08'],
    ['আন্তঃক্যাম্পাস সাহিত্য সম্মেলন', 'বিভিন্ন ক্যাম্পাসের লেখকদের অংশগ্রহণে সম্মেলন।', 'https://picsum.photos/seed/act8/600/300', '2026-09-22'],
    ['ফেলোশিপ পুরস্কার বিতরণ', 'প্রতিভাবান লেখকদের ফেলোশিপ প্রদান।', 'https://picsum.photos/seed/act9/600/300', '2026-10-30'],
    ['বার্ষিক সাধারণ সভা', 'বার্ষিক সাধারণ সভা ও নির্বাচন।', 'https://picsum.photos/seed/act10/600/300', '2026-12-15']
  ];
  for (const a of activities) { try { await prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('activity', ...a); } catch(e) {} }

  const epapers = [
    ['দৈনিক ই-পেপার ০১', 'আজকের ই-পেপার পড়ুন।', 'https://example.com/epaper/01.pdf', 'https://picsum.photos/seed/ep1/600/300', today],
    ['দৈনিক ই-পেপার ০২', 'গতকালের ই-পেপার।', 'https://example.com/epaper/02.pdf', 'https://picsum.photos/seed/ep2/600/300', yesterday],
    ['সাপ্তাহিক ম্যাগাজিন — সপ্তাহ ১', 'এই সপ্তাহের সেরা লেখা।', 'https://example.com/weekly/01.pdf', 'https://picsum.photos/seed/ep3/600/300', '2026-09-01'],
    ['মাসিক সাহিত্য পত্রিকা', 'এই মাসের বিশেষ সংখ্যা।', 'https://example.com/monthly/01.pdf', 'https://picsum.photos/seed/ep4/600/300', '2026-09-01'],
    ['বিশেষ সংখ্যা: ভাষা আন্দোলন', 'ভাষা আন্দোলন বিশেষ সংখ্যা।', 'https://example.com/special/01.pdf', 'https://picsum.photos/seed/ep5/600/300', '2026-02-21'],
    ['সাহিত্য বিশেষ সংখ্যা', 'কবি-সাহিত্যিকদের লেখা।', 'https://example.com/literature/01.pdf', 'https://picsum.photos/seed/ep6/600/300', '2026-04-12'],
    ['গবেষণা পত্রিকা', 'গবেষণামূলক প্রবন্ধ সংকলন।', 'https://example.com/research/01.pdf', 'https://picsum.photos/seed/ep7/600/300', '2026-06-15'],
    ['নবীন লেখক সংখ্যা', 'নতুন লেখকদের লেখা সংকলন।', 'https://example.com/new/01.pdf', 'https://picsum.photos/seed/ep8/600/300', '2026-07-20'],
    ['বিশেষ সাক্ষাৎকার', 'বিশিষ্ট লেখকদের সাক্ষাৎকার।', 'https://example.com/interview/01.pdf', 'https://picsum.photos/seed/ep9/600/300', '2026-08-10'],
    ['বর্ষপূর্তি সংখ্যা', 'পত্রিকার বর্ষপূর্তি বিশেষ সংখ্যা।', 'https://example.com/anniversary/01.pdf', 'https://picsum.photos/seed/ep10/600/300', '2026-12-01']
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
    ['ধারা ১: নাম ও সংজ্ঞা', 'এই সংগঠনের নাম "বাংলাদেশ তরুণ কলাম লেখক ফোরাম"। এটি একটি অরাজনৈতিক, অলাভজনক সাহিত্য ও সংস্কৃতি বিষয়ক সংগঠন।', 1],
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
    ['গঠনতন্ত্র সম্পূর্ণ কপি', 'বাংলাদেশ তরুণ কলাম লেখক ফোরামের সম্পূর্ণ গঠনতন্ত্র।', 'document', 'প্রশাসন'],
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
      ['কবিতায় ছন্দের যাত্রা', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত — এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।', 'কবিতা,ছন্দ', 'https://picsum.photos/seed/art1/800/400'],
      ['বাংলা গদ্যের বিবর্তন', 'আধুনিক বাংলা গদ্যের বিবর্তন একটি দীর্ঘ যাত্রা। প্রতিটি যুগ এনেছে নতুন ধারা ও কণ্ঠস্বর।', 'গদ্য,সাহিত্য', 'https://picsum.photos/seed/art2/800/400'],
      ['প্রবন্ধ রচনায় যুক্তি ও অনুভূতি', 'প্রবন্ধ হলো যুক্তি ও অনুভূতির সংশ্লেষ। একটি ভালো প্রবন্ধ পাঠকের চিন্তা ও হৃদয় দুটোকেই স্পর্শ করে।', 'প্রবন্ধ,রচনা', 'https://picsum.photos/seed/art3/800/400'],
      ['উপন্যাসের চরিত্রায়ণ', 'উপন্যাসে চরিত্রের গভীরতা সাহিত্যিক সাফল্যের মূল চাবিকাঠি।', 'উপন্যাস,চরিত্র', 'https://picsum.photos/seed/art4/800/400'],
      ['ছোটগল্পের শিল্প', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা — এটাই ছোটগল্পের শিল্প।', 'ছোটগল্প,শিল্প', 'https://picsum.photos/seed/art5/800/400'],
      ['অনুবাদ সাহিত্যের ভূমিকা', 'অনুবাদ সাহিত্যিক আদান-প্রদানের সবচেয়ে কার্যকর মাধ্যম।', 'অনুবাদ,সাহিত্য', 'https://picsum.photos/seed/art6/800/400'],
      ['নারী লেখকদের কণ্ঠস্বর', 'বাংলা সাহিত্যে নারী লেখকদের অবদান অপরিসীম।', 'নারী,সাহিত্যিক', 'https://picsum.photos/seed/art7/800/400'],
      ['প্রকৃতি ও কবিতা', 'প্রকৃতি কবির অনুপ্রেরণার চিরন্তন উৎস।', 'প্রকৃতি,কবিতা', 'https://picsum.photos/seed/art8/800/400'],
      ['সাহিত্য ও সমাজ', 'সাহিত্য সমাজের দর্পণ। সমাজের পরিবর্তনের সাথে সাথে সাহিত্যের ধারাও বদলায়।', 'সমাজ,সাহিত্য', 'https://picsum.photos/seed/art9/800/400'],
      ['ডিজিটাল যুগে লেখালেখি', 'ডিজিটাল প্ল্যাটফর্ম লেখালেখির নতুন দিগন্ত খুলে দিয়েছে।', 'ডিজিটাল,প্রযুক্তি', 'https://picsum.photos/seed/art10/800/400']
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
      ['কোন লেখক আপনাকে সবচেয়ে বেশি অনুপ্রাণিত করেছেন?', 'আমার কাছে রবীন্দ্রনাথ, নজরুল, জীবনানন্দ — সকলেই অনুপ্রেরণাদায়ী। আপনার প্রিয় কে?', 'সাহিত্য'],
      ['সোশ্যাল মিডিয়া কি সাহিত্য চর্চায় বাধা?', 'ফেসবুক-টুইটার কি গভীর পাঠের অভ্যাস নষ্ট করছে? নাকি নতুন শ্রোতা দিচ্ছে?', 'প্রযুক্তি'],
      ['তরুণ লেখকদের জন্য পরামর্শ কী?', 'নতুন লেখক হিসেবে কীভাবে শুরু করব?', 'পরামর্শ'],
      ['অনলাইন ম্যাগাজিন বনাম প্রিন্ট?', 'প্রিন্ট ম্যাগাজিন কি ডিজিটাল যুগে টিকে থাকতে পারবে?', 'প্রকাশনা'],
      ['কবিতায় রাজনৈতিক সুর কতটা সমীচীন?', 'রাজনৈতিক কবিতা কি সাহিত্যিক শিল্পকেই প্রশ্নবিদ্ধ করে?', 'রাজনীতি'],
      ['গ্রামীণ সাহিত্য কি আজকের যুগে অবহেলিত?', 'আধুনিক লেখকেরা কি গ্রামীণ জীবন থেকে দূরে সরে যাচ্ছেন?', 'সমাজ'],
      ['কোন ভাষায় লিখব — বাংলা নাকি ইংরেজি?', 'বাংলা ভাষায় লিখলে কি আন্তর্জাতিক শ্রোতা পাওয়া কঠিন?', 'ভাষা'],
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

module.exports = {
  initDb,
  get db()       { return _sqlJsDb; },  // legacy direct access (sql.js only)
  prepare,
  exec,
  getSetting,
  getSettingsAll,
  setSetting,
  saveDb,
  flushDb,
  MODERATOR_SCOPES,
  SCOPE_ALIASES,
  DAILY_CONTENT_SCOPES,
  isModerator,
  getModeratorScopes,
  hasScope,
  grantModerator,
  revokeModerator,
  listModerators,
  searchPromotableUsers,
  IS_TURSO,
  USE_DB_SNAPSHOT
};
