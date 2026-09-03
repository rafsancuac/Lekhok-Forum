const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'lekhok.db');

let db;
let SQL;
let saveTimer;

// ── Initialize sql.js and load/create DB ────────────────────────────────────
async function initDb() {
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  runMigrations();
  try {
    seedIfEmpty();
  } catch(e) {
    console.error('Seed error:', e.message);
    throw e;
  }
  return db;
}

function runMigrations() {
  db.exec(`
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

    -- ── v2: User accounts ──────────────────────────────────────────
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
      avatar_url TEXT,
      status TEXT DEFAULT 'active',
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

    -- ── v2: Posts (articles + questions) ──────────────────────────
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      type TEXT DEFAULT 'article',
      title TEXT NOT NULL,
      body TEXT,
      excerpt TEXT,
      cover_image TEXT,
      tags TEXT,
      category TEXT,
      status TEXT DEFAULT 'published',
      featured INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER,
      comment_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    -- ── v2: Daily content (admin/moderator) ──────────────────────
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

    -- ── v2: Notifications ────────────────────────────────────────
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

    -- ── v2: Constitution sections ────────────────────────────────
    CREATE TABLE IF NOT EXISTS constitution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_title TEXT NOT NULL,
      content TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- ── v2: Past leaders ─────────────────────────────────────────
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

    -- ── v2: Achievements / Awards ────────────────────────────────
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      recipient_name TEXT,
      year TEXT,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- ── v2: Gallery (photos + captions) ─────────────────────────
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      caption TEXT,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ── v2: Direct messages (Messenger-like) ────────────────────
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

    -- ── v2: Complaints (private to admin/moderators) ────────────
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submitted_by INTEGER,
      subject TEXT NOT NULL,
      body TEXT,
      file_url TEXT,
      status TEXT DEFAULT 'new',
      assigned_to INTEGER,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ── v2: Moderator scope (admin can grant per-section perms) ─
    CREATE TABLE IF NOT EXISTS moderator_scopes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scope TEXT NOT NULL,
      granted_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add advisory member_type (alter for existing tables)
  try { db.exec("ALTER TABLE members ADD COLUMN member_type TEXT DEFAULT 'central'"); } catch(e) {}
  // Fix: complaints needs file_name alongside file_url (attachment original filename)
  try { db.exec("ALTER TABLE complaints ADD COLUMN file_name TEXT"); } catch(e) {}
  // Fix: users table was missing 'role' — needed for moderator/admin permission checks
  try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch(e) {}
}

// ── Moderator permission system ─────────────────────────────────────────────
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

function isModerator(userId) {
  return !!prepare('SELECT id FROM moderators WHERE user_id = ?').get(userId);
}

function getModeratorScopes(userId) {
  return prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(userId).map(r => r.scope);
}

function hasScope(userId, scope) {
  return !!prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(userId, scope);
}

function grantModerator(userId, scopes, grantedBy) {
  if (!isModerator(userId)) {
    prepare('INSERT INTO moderators (user_id, added_by) VALUES (?, ?)').run(userId, grantedBy || null);
  }
  prepare("UPDATE users SET role = 'moderator' WHERE id = ?").run(userId);
  prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
  (scopes || []).forEach(s => {
    prepare('INSERT INTO moderator_scopes (user_id, scope, granted_by) VALUES (?, ?, ?)').run(userId, s, grantedBy || null);
  });
}

function revokeModerator(userId) {
  prepare('DELETE FROM moderators WHERE user_id = ?').run(userId);
  prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(userId);
  prepare("UPDATE users SET role = 'user' WHERE id = ?").run(userId);
}

function listModerators() {
  const mods = prepare(`
    SELECT u.id as user_id, u.username, u.full_name, u.avatar_url
    FROM moderators m JOIN users u ON u.id = m.user_id
    ORDER BY u.full_name
  `).all();
  return mods.map(m => ({ ...m, scopes: getModeratorScopes(m.user_id) }));
}

function searchPromotableUsers(q) {
  if (!q) return [];
  return prepare(`
    SELECT id, username, full_name FROM users
    WHERE (username LIKE ? OR full_name LIKE ?) AND role != 'admin'
    ORDER BY full_name LIMIT 15
  `).all('%' + q + '%', '%' + q + '%');
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Debounced auto-save (avoid hammering disk)
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDb, 200);
}

// Wrap prepare() to return an object compatible with the old better-sqlite3 API
function wrapStmt(stmt) {
  return {
    all: (...params) => {
      const result = [];
      stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      while (stmt.step()) result.push(stmt.getAsObject());
      stmt.reset();
      return result;
    },
    get: (...params) => {
      stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      const has = stmt.step();
      const row = has ? stmt.getAsObject() : null;
      stmt.reset();
      return row;
    },
    run: (...params) => {
      stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      stmt.step();
      stmt.reset();
      const idRes = db.exec('SELECT last_insert_rowid() as id');
      const lastInsertRowid = idRes.length ? idRes[0].values[0][0] : undefined;
      persist();
      return { changes: db.getRowsModified(), lastInsertRowid };
    }
  };
}

function prepare(sql) {
  return wrapStmt(db.prepare(sql));
}

function exec(sql) {
  db.exec(sql);
  persist();
}

function seedIfEmpty() {
  const adminCount = prepare('SELECT COUNT(*) as c FROM admin_users').get().c;
  const galleryCount = prepare('SELECT COUNT(*) as c FROM gallery').get().c;
  if (adminCount > 0 && galleryCount > 0) return;

    const hash = bcrypt.hashSync('admin123', 10);
  prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)').run('admin', hash, 'প্রশাসক');
  
  const defaultSettings = [
    ['site_name', 'লেখক ফোরাম'],
    ['tagline', 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়'],
    ['contact_email', 'info@lekhokforum.org'],
    ['contact_phone', '০১XXXXXXXXX'],
    ['contact_address', 'আপনার ক্যাম্পাস ঠিকানা'],
    ['facebook_url', '#'],
    ['telegram_url', '#'],
    ['youtube_url', '#']
  ];
  defaultSettings.forEach(([k, v]) => prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(k, v));

  const notices = [
    ['নতুন সদস্য নিবন্ধন শুরু', 'আগ্রহী প্রার্থীরা অনলাইনে আবেদন করতে পারবেন।', 'notice', '২০২৬ সালের ১ জানুয়ারি'],
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'এবারের সম্মেলনে থাকছে কবিতা পাঠ, প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', 'event', '২০২৬ সালের ১৫ ফেব্রুয়ারি'],
    ['প্রকাশনা বিজ্ঞপ্তি', 'আমাদের নতুন ম্যাগাজিন প্রকাশিত হয়েছে। সদস্যদের জন্য বিনামূল্যে কপি পাওয়া যাবে।', 'press', '২০২৬ সালের ২০ জানুয়ারি'],
    ['কার্যনির্বাহী সভা', 'আগামী ৫ তারিখ সন্ধ্যা ৬টায় কার্যনির্বাহী সভা অনুষ্ঠিত হবে।', 'notice', '২০২৬ সালের ৩ জানুয়ারি'],
    ['ফেলোশিপ কার্যক্রম', 'প্রতিভাবান লেখকদের জন্য বিশেষ ফেলোশিপ ঘোষণা করা হয়েছে। আবেদনের শেষ তারিখ ৩১ মার্চ।', 'notice', '২০২৬ সালের ১০ ফেব্রুয়ারি'],
    ['লেখক সম্মাননা ২০২৬', 'প্রতি বছরের মতো এবারও শীর্ষ লেখকদের সম্মাননা প্রদান করা হবে।', 'press', '২০২৬ সালের ১৫ মার্চ']
  ];
    notices.forEach(n => prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)').run(...n));
  
  const events = [
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন, আলোচনা সভা এবং সাংস্কৃতিক অনুষ্ঠান।', '২০২৬-০২-১৫', '২০২৬-০২-১৫', 'ঢাকা বিশ্ববিদ্যালয়', 'https://picsum.photos/seed/event1/800/400', 1],
    ['আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন', 'ভাষা আন্দোলনের শহীদদের স্মরণে আলোচনা সভা ও কবিতা পাঠ।', '২০২৬-০২-২১', '২০২৬-০২-২১', 'শহীদ মিনার', 'https://picsum.photos/seed/event2/800/400', 0],
    ['গবেষণা কর্মশালা: লেখালেখির পদ্ধতি', 'প্রফেশনাল লেখকদের তত্ত্বাবধানে একদিনের গবেষণা কর্মশালা।', '২০২৬-০৩-১০', '২০২৬-০৩-১০', 'অনলাইন (জুম)', 'https://picsum.photos/seed/event3/800/400', 0],
    ['প্রকাশনা মেলা ও বইমেলা', 'সদস্যদের প্রকাশিত বইয়ের প্রদর্শনী ও বিক্রয়।', '২০২৬-০৪-২০', '২০২৬-০৪-২২', 'বাংলা একাডেমি', 'https://picsum.photos/seed/event4/800/400', 1]
  ];
    events.forEach(e => prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(...e));
  
  const members = [
    ['মো. রুহুল আমিন', 'সভাপতি', 'কেন্দ্রীয় কমিটি', 'দীর্ঘদিন ধরে সাংগঠনিক কাজে সক্রিয়। তরুণ লেখকদের পৃষ্ঠপোষকতা করে আসছেন।', 'https://picsum.photos/seed/mem1/300/300', '#', '', 'central', 1],
    ['সাইশা সুলতানা সাদিয়া', 'মহাসচিব', 'কেন্দ্রীয় কমিটি', 'প্রগতিশীল লেখালেখি ও সাংস্কৃতিক আন্দোলনে অগ্রণী।', 'https://picsum.photos/seed/mem2/300/300', '#', '', 'central', 2],
    ['আবদুল্লাহ আল মাহমুদ', 'সাংগঠনিক সম্পাদক', 'কেন্দ্রীয় কমিটি', 'সাংগঠনিক দক্ষতা ও নেতৃত্বের গুণাবলি সম্পন্ন।', 'https://picsum.photos/seed/mem3/300/300', '#', '', 'central', 3],
    ['ফারজানা আক্তার', 'প্রচার সম্পাদক', 'কেন্দ্রীয় কমিটি', 'ডিজিটাল মাধ্যমে সংগঠনের উপস্থিতি বৃদ্ধিতে কাজ করছেন।', 'https://picsum.photos/seed/mem4/300/300', '#', '', 'central', 4],
    ['নাঈম হোসেন', 'সদস্য', 'বিশ্ববিদ্যালয় শাখা', 'নতুন প্রজন্মের মধ্যে সংগঠন সম্প্রসারণে কাজ করছেন।', 'https://picsum.photos/seed/mem5/300/300', '#', '', 'branch', 5],
    ['তাহসিন আরা', 'সদস্য', 'বিশ্ববিদ্যালয় শাখা', 'সৃজনশীল লেখালেখি ও গবেষণায় আগ্রহী।', 'https://picsum.photos/seed/mem6/300/300', '#', '', 'branch', 6]
  ];
    members.forEach(m => prepare('INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(...m));
  
  const gallery = [
    ['সাহিত্য সম্মেলন ২০২৫', 'সম্মেলনের একাংশ — কবি ও লেখকদের পদচারণায় মুখরিত ছিল পুরো মঞ্চ।', 'https://picsum.photos/seed/gal1/600/400', 'events', '২০২৫-১২-১০'],
    ['কর্মশালা ২০২৫', 'গবেষণা কর্মশালায় তরুণ গবেষকদের সরব উপস্থিতি।', 'https://picsum.photos/seed/gal2/600/400', 'workshops', '২০২৫-১০-০৫'],
    ['ম্যাগাজিন প্রকাশ', 'নতুন ম্যাগাজিনের মোড়ক উন্মোচন অনুষ্ঠান।', 'https://picsum.photos/seed/gal3/600/400', 'events', '২০২৫-০৮-২০'],
    ['আলোচনা সভা', 'মাসিক আলোচনা সভায় বিশিষ্ট ব্যক্তিবর্গ।', 'https://picsum.photos/seed/gal4/600/400', 'meetings', '২০২৫-০৭-১৫'],
    ['বইমেলা স্টল', 'অমর একুশে বইমেলায় আমাদের স্টল।', 'https://picsum.photos/seed/gal5/600/400', 'events', '২০২৫-০২-০১'],
    ['টিম মিটিং', 'কার্যনির্বাহী সভায় উপস্থিত সদস্যবৃন্দ।', 'https://picsum.photos/seed/gal6/600/400', 'meetings', '২০২৫-০৬-১০'],
    ['পুরস্কার বিতরণী', 'বার্ষিক লেখক সম্মাননা ২০২৫।', 'https://picsum.photos/seed/gal7/600/400', 'awards', '২০২৫-১২-১৫'],
    ['নবীন বরণ', 'নতুন সদস্যদের বরণ ও পরিচিতি সভা।', 'https://picsum.photos/seed/gal8/600/400', 'events', '২০২৫-০৯-০১'],
    ['সেমিনার', 'বাংলা সাহিত্যের ভবিষ্যৎ শীর্ষক সেমিনার।', 'https://picsum.photos/seed/gal9/600/400', 'workshops', '২০২৫-১১-২০'],
    ['সাংস্কৃতিক সন্ধ্যা', 'সাংস্কৃতিক সন্ধ্যায় নজরুলগীতি ও রবীন্দ্রসঙ্গীত পরিবেশনা।', 'https://picsum.photos/seed/gal10/600/400', 'events', '২০২৫-১২-২৫']
  ];
  // v2: gallery table columns = title, caption, image_url, category (no event_date column)
  gallery.forEach(g => {
    const [title, caption, image_url, category] = g;
    prepare('INSERT INTO gallery (title, caption, image_url, category) VALUES (?, ?, ?, ?)').run(title, caption, image_url, category);
  });
  
  // ── Seed 10 demo items for daily content sections ──
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const quizzes = [
    ['আজকের কুইজ: কবিতায় ছন্দ কত প্রকার?', 'মূলত ৩ প্রকার — মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত। উত্তর দিতে এই লিংকে যান: https://forms.gle/example', null, today],
    ['কুইজ: বাংলা সাহিত্যের জনক কে?', 'বাংলা সাহিত্যের জনক বঙ্কিমচন্দ্র চট্টোপাধ্যায়। আরও জানতে: https://example.com/quiz', null, yesterday],
    ['কুইজ: রবীন্দ্রনাথ কতটি গীতাঞ্জলি কাব্য রচনা করেন?', '৫২টি গীতাঞ্জলি কাব্য। বিস্তারিত: https://example.com', null, '2026-08-31'],
    ['কুইজ: লেখক ফোরাম কবে প্রতিষ্ঠিত?', '২০১৮ সালে। https://example.com/founded', null, '2026-08-30'],
    ['কুইজ: নজরুলের প্রথম কাব্য কোনটি?', 'বিষের বাঁশী (১৯২১)।', null, '2026-08-29'],
    ['কুইজ: মাইকেল মধুসূদনের প্রথম কাব্য?', 'তিলোত্তমাসম্ভব (১৮৬০)।', null, '2026-08-28'],
    ['কুইজ: ফোরামের প্রথম সভাপতির নাম কী?', 'মো. রুহুল আমিন।', null, '2026-08-27'],
    ['কুইজ: বাংলা একাডেমি কবে প্রতিষ্ঠিত?', '১৯৫৫ সালের ৩ ডিসেম্বর।', null, '2026-08-26'],
    ['কুইজ: অমর একুশে বইমেলা কোথায় অনুষ্ঠিত হয়?', 'বাংলা একাডেমি প্রাঙ্গণ, ঢাকা।', null, '2026-08-25'],
    ['কুইজ: বাংলা ভাষার প্রথম মহাকাব্য কোনটি?', 'মেঘনাদবধ কাব্য (মাইকেল মধুসূদন)।', null, '2026-08-24']
  ];
  quizzes.forEach((q, i) => {
    prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('quiz', q[0], q[1], q[2], q[3]);
  });
  
  const onThisDay = [
    ['আজকের এই দিনে: ১৯৪৯ সালে ভাষা আন্দোলন', '১৯৪৯ সালের ২১ ফেব্রুয়ারি ভাষা আন্দোলনের ইতিহাস।', 'https://picsum.photos/seed/hist1/600/300', today],
    ['এই দিনে: কাজী নজরুলের জন্ম', '১৮৯৯ সালের ২৪ মে কাজী নজরুল ইসলামের জন্ম।', 'https://picsum.photos/seed/hist2/600/300', '2026-05-24'],
    ['এই দিনে: রবীন্দ্রনাথের নোবেল', '১৯১৩ সালের এই দিনে রবীন্দ্রনাথ নোবেল পুরস্কার পান।', 'https://picsum.photos/seed/hist3/600/300', '2026-11-13'],
    ['এই দিনে: লেখক ফোরামের প্রতিষ্ঠা', '২০১৮ সালের এই দিনে লেখক ফোরাম যাত্রা শুরু করে।', 'https://picsum.photos/seed/hist4/600/300', '2026-04-12'],
    ['এই দিনে: বঙ্গবন্ধুর ঐতিহাসিক ভাষণ', '১৯৭১ সালের এই দিনে বঙ্গবন্ধু ঐতিহাসিক ভাষণ দেন।', 'https://picsum.photos/seed/hist5/600/300', '2026-03-07'],
    ['এই দিনে: মুক্তিযুদ্ধ শুরু', '১৯৭১ সালের ২৬ মার্চ মহান মুক্তিযুদ্ধ শুরু।', 'https://picsum.photos/seed/hist6/600/300', '2026-03-26'],
    ['এই দিনে: বাংলাদেশ স্বাধীন', '১৯৭১ সালের ১৬ ডিসেম্বর বাংলাদেশ স্বাধীনতা লাভ।', 'https://picsum.photos/seed/hist7/600/300', '2026-12-16'],
    ['এই দিনে: শহীদ দিবস', '১৯৫২ সালের ২১ ফেব্রুয়ারি শহীদ দিবস।', 'https://picsum.photos/seed/hist8/600/300', '2026-02-21'],
    ['এই দিনে: আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা', '১৯৯৯ সালে ইউনেস্কো এই দিনটিকে আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা করে।', 'https://picsum.photos/seed/hist9/600/300', '2026-11-17'],
    ['এই দিনে: প্রথম সংবিধান', '১৯৭২ সালের ৪ নভেম্বর বাংলাদেশের সংবিধান কার্যকর।', 'https://picsum.photos/seed/hist10/600/300', '2026-11-04']
  ];
    onThisDay.forEach((o, i) => {
    prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('this_day', o[0], o[1], o[2], o[3]);
  });
  
  const activities = [
    ['বার্ষিক সাহিত্য সম্মেলন', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', 'https://picsum.photos/seed/act1/600/300', '2026-02-15'],
    ['লেখক প্রশিক্ষণ কর্মশালা', 'নতুন লেখকদের জন্য দুই দিনব্যাপী প্রশিক্ষণ।', 'https://picsum.photos/seed/act2/600/300', '2026-03-10'],
    ['বই পড়া কর্মসূচি', 'মাসব্যাপী বই পড়া ও আলোচনা।', 'https://picsum.photos/seed/act3/600/300', '2026-04-05'],
    ['ক্যাম্পাস কবিতা উৎসব', 'বিশ্ববিদ্যালয় ক্যাম্পাসে কবিতা উৎসব।', 'https://picsum.photos/seed/act4/600/300', '2026-05-12'],
    ['সাংস্কৃতিক সন্ধ্যা', 'নজরুল ও রবীন্দ্রসঙ্গীত সন্ধ্যা।', 'https://picsum.photos/seed/act5/600/300', '2026-06-20'],
    ['প্রকাশনা উৎসব', 'নতুন বই ও ম্যাগাজিন প্রকাশ উপলক্ষে উৎসব।', 'https://picsum.photos/seed/act6/600/300', '2026-07-15'],
    ['গবেষণা সেমিনার', 'বাংলা সাহিত্যের আধুনিক ধারা শীর্ষক সেমিনার।', 'https://picsum.photos/seed/act7/600/300', '2026-08-08'],
    ['আন্তর্জাতিক সাহিত্য সম্মেলন', 'দক্ষিণ এশীয় লেখকদের অংশগ্রহণে সম্মেলন।', 'https://picsum.photos/seed/act8/600/300', '2026-09-22'],
    ['ফেলোশিপ পুরস্কার বিতরণ', 'প্রতিভাবান লেখকদের ফেলোশিপ প্রদান।', 'https://picsum.photos/seed/act9/600/300', '2026-10-30'],
    ['বার্ষিক সাধারণ সভা', 'বার্ষিক সাধারণ সভা ও নির্বাচন।', 'https://picsum.photos/seed/act10/600/300', '2026-12-15']
  ];
    activities.forEach(a => prepare('INSERT INTO daily_content (content_type, title, body, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)').run('activity', a[0], a[1], a[2], a[3]));
  
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
    epapers.forEach(e => prepare('INSERT INTO daily_content (content_type, title, body, link_url, image_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, ?, 1)').run('epaper', e[0], e[1], e[2], e[3], e[4]));
  
  // ── 10 achievements ──
  const achievements = [
    ['বার্ষিক সেরা লেখক', 'মো. রুহুল আমিন', '২০২৫', 'বছরের সেরা লেখক হিসেবে নির্বাচিত।', null, 1],
    ['জাতীয় কবিতা পুরস্কার', 'সাইশা সুলতানা সাদিয়া', '২০২৪', 'জাতীয় পর্যায়ে কবিতায় প্রথম স্থান।', null, 2],
    ['ফেলোশিপ অনুদান', 'আবদুল্লাহ আল মাহমুদ', '২০২৪', 'ফেলোশিপ গবেষণা অনুদান প্রাপ্তি।', null, 3],
    ['প্রকাশনা সম্মাননা', 'ফারজানা আক্তার', '২০২৩', 'সেরা প্রকাশনার জন্য সম্মাননা।', null, 4],
    ['ক্যাম্পাস সেরা লেখক', 'নাঈম হোসেন', '২০২৫', 'বিশ্ববিদ্যালয় ক্যাম্পাসে সেরা লেখক।', null, 5],
    ['কাব্য পুরস্কার', 'তাহসিন আরা', '২০২৪', 'কাব্য রচনায় বিশেষ অবদান।', null, 6],
    ['প্রবন্ধ প্রতিযোগিতা', 'রাকিব হাসান', '২০২৩', 'আন্তর্জাতিক প্রবন্ধ প্রতিযোগিতায় পুরস্কার।', null, 7],
    ['অনুবাদ সম্মাননা', 'মারিয়া ইসলাম', '২০২৪', 'সেরা অনুবাদক হিসেবে সম্মানিত।', null, 8],
    ['ডিজিটাল লেখালেখি', 'সাদিয়া আহমেদ', '২০২৫', 'ডিজিটাল লেখালেখিতে অসামান্য অবদান।', null, 9],
    ['সাংগঠনিক সম্মাননা', 'মো. জাহিদ হাসান', '২০২৪', 'সংগঠনের জন্য বিশেষ অবদান।', null, 10]
  ];
    achievements.forEach(a => prepare('INSERT INTO achievements (title, recipient_name, year, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...a));
  
  // ── 10 past leaders ──
  const pastPresidents = [
    ['মো. রুহুল আমিন', 'president', '২০২২', '২০২৪', null, 1],
    ['মো. আনোয়ার হোসেন', 'president', '২০২০', '২০২২', null, 2],
    ['ড. শামসুদ্দিন আহমেদ', 'president', '২০১৮', '২০২০', null, 3],
    ['মো. কামাল উদ্দিন', 'president', '২০১৬', '২০১৮', null, 4],
    ['মো. শাহজাহান সরকার', 'president', '২০১৪', '২০১৬', null, 5]
  ];
    pastPresidents.forEach(p => prepare('INSERT INTO past_leaders (name, role, term_start, term_end, photo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...p));
  
  const pastSecretaries = [
    ['সাইশা সুলতানা সাদিয়া', 'general_secretary', '২০২২', '২০২৪', null, 1],
    ['ফারজানা আক্তার', 'general_secretary', '২০২০', '২০২২', null, 2],
    ['নাঈম হোসেন', 'general_secretary', '২০১৮', '২০২০', null, 3],
    ['মারিয়া ইসলাম', 'general_secretary', '২০১৬', '২০১৮', null, 4],
    ['তাহসিন আরা', 'general_secretary', '২০১৪', '২০১৬', null, 5]
  ];
    pastSecretaries.forEach(p => prepare('INSERT INTO past_leaders (name, role, term_start, term_end, photo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(...p));
  
  // ── 10 constitution sections ──
  const constitutionSections = [
    ['ধারা ১: নাম ও সংজ্ঞা', 'এই সংগঠনের নাম "লেখক ফোরাম"। এটি একটি অরাজনৈতিক, অলাভজনক সাহিত্য ও সংস্কৃতি বিষয়ক সংগঠন।', 1],
    ['ধারা ২: উদ্দেশ্য', 'বাংলা ভাষা ও সাহিত্যের চর্চা, প্রচার ও সম্প্রসারণ। তরুণ লেখকদের পৃষ্ঠপোষকতা। সৃজনশীলতার বিকাশ।', 2],
    ['ধারা ৩: সদস্যপদ', 'যেকোনো বাংলাভাষী লেখক এই সংগঠনের সদস্য হতে পারবেন। সদস্যপদ অর্জনের জন্য নির্ধারিত ফি প্রদান করতে হবে।', 3],
    ['ধারা ৪: সদস্যদের অধিকার', 'সাধারণ সভায় ভোটাধিকার, নির্বাচনে প্রার্থিতার অধিকার, সংগঠনের সকল কার্যক্রমে অংশগ্রহণের অধিকার।', 4],
    ['ধারা ৫: সদস্যদের দায়িত্ব', 'সংগঠনের গঠনতন্ত্র মেনে চলা, নিয়মিত চাঁদা প্রদান, সকল কার্যক্রমে সক্রিয় অংশগ্রহণ।', 5],
    ['ধারা ৬: কার্যনির্বাহী কমিটি', 'সভাপতি, মহাসচিব, সাংগঠনিক সম্পাদকসহ মোট ১১ সদস্যের কমিটি দুই বছর মেয়াদে নির্বাচিত হবে।', 6],
    ['ধারা ৭: সাধারণ সভা', 'বছরে অন্তত একবার সাধারণ সভা অনুষ্ঠিত হবে। বিশেষ সাভা প্রয়োজনে যেকোনো সময় আহ্বান করা যাবে।', 7],
    ['ধারা ৮: অর্থনৈতিক বিষয়', 'সদস্যদের চাঁদা, অনুদান, প্রকাশনা থেকে অর্জিত আয় সংগঠনের কাজে ব্যয় হবে।', 8],
    ['ধারা ৯: গঠনতন্ত্র সংশোধন', 'গঠনতন্ত্র সংশোধনের জন্য সাধারণ সভায় দুই-তৃতীয়াংশ সদস্যের ভোট প্রয়োজন।', 9],
    ['ধারা ১০: বিলুপ্তি', 'সংগঠন বিলুপ্ত হলে সম্পদ ক্যাম্পাস গ্রন্থাগারে হস্তান্তর করা হবে।', 10]
  ];
    constitutionSections.forEach(c => prepare('INSERT INTO constitution (section_title, content, sort_order) VALUES (?, ?, ?)').run(...c));
  
  // ── 10 demo user posts (with sample authors from members) ──
  const sampleAuthors = [
    { name: 'মো. রুহুল আমিন', handle: 'amin' },
    { name: 'সাইশা সুলতানা সাদিয়া', handle: 'sadia' },
    { name: 'আবদুল্লাহ আল মাহমুদ', handle: 'mahmud' },
    { name: 'ফারজানা আক্তার', handle: 'farzana' },
    { name: 'নাঈম হোসেন', handle: 'naim' }
  ];
  // Create demo user accounts for these authors
  const demoPwd = bcrypt.hashSync('demo123', 10);
    sampleAuthors.forEach(a => {
    const exists = prepare('SELECT id FROM users WHERE username = ?').get(a.handle);
    if (!exists) {
      prepare(`INSERT INTO users (username, password_hash, full_name, gender, designation, bio, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`)
        .run(a.handle, demoPwd, a.name, 'male', 'সাহিত্যিক', `${a.name} একজন প্রতিশ্রুতিশীল লেখক।`);
    }
  });
  
  const sampleArticles = [
    ['কবিতায় ছন্দের যাত্রা', 'কবিতায় ছন্দ এক অনন্য শিল্পরূপ। মাত্রাবৃত্ত, স্বরবৃত্ত ও অক্ষরবৃত্ত — এই তিনটি প্রধান ছন্দ বাংলা কবিতার মেরুদণ্ড।', 'কবিতা,ছন্দ', 'https://picsum.photos/seed/art1/800/400'],
    ['বাংলা গদ্যের বিবর্তন', 'বঙ্কিমচন্দ্র থেকে শুরু করে আধুনিক বাংলা গদ্যের বিবর্তন একটি দীর্ঘ যাত্রা। প্রতিটি যুগ এনেছে নতুন ধারা ও কণ্ঠস্বর।', 'গদ্য,সাহিত্য', 'https://picsum.photos/seed/art2/800/400'],
    ['প্রবন্ধ রচনায় যুক্তি ও অনুভূতি', 'প্রবন্ধ হলো যুক্তি ও অনুভূতির সংশ্লেষ। একটি ভালো প্রবন্ধ পাঠকের চিন্তা ও হৃদয় দুটোকেই স্পর্শ করে।', 'প্রবন্ধ,রচনা', 'https://picsum.photos/seed/art3/800/400'],
    ['উপন্যাসের চরিত্রায়ণ', 'উপন্যাসে চরিত্রের গভীরতা সাহিত্যিক সাফল্যের মূল চাবিকাঠি। জীবন্ত চরিত্র গড়তে পারাই লেখকের প্রকৃত দক্ষতা।', 'উপন্যাস,চরিত্র', 'https://picsum.photos/seed/art4/800/400'],
    ['ছোটগল্পের শিল্প', 'সংক্ষিপ্ত আকারে বিশাল কথা বলা — এটাই ছোটগল্পের শিল্প। প্রতিটি শব্দ গুরুত্বপূর্ণ, প্রতিটি বাক্য অর্থবহ।', 'ছোটগল্প,শিল্প', 'https://picsum.photos/seed/art5/800/400'],
    ['অনুবাদ সাহিত্যের ভূমিকা', 'অনুবাদ সাহিত্যিক আদান-প্রদানের সবচেয়ে কার্যকর মাধ্যম। এটি একটি ভাষাকে অন্য ভাষায় জীবন্ত রাখে।', 'অনুবাদ,সাহিত্য', 'https://picsum.photos/seed/art6/800/400'],
    ['নারী লেখকদের কণ্ঠস্বর', 'বাংলা সাহিত্যে নারী লেখকদের অবদান অপরিসীম। বেগম রোকেয়া থেকে শুরু করে আজকের নারী লেখকেরা — সকলেই এক একটি উজ্জ্বল নক্ষত্র।', 'নারী,সাহিত্যিক', 'https://picsum.photos/seed/art7/800/400'],
    ['প্রকৃতি ও কবিতা', 'প্রকৃতি কবির অনুপ্রেরণার চিরন্তন উৎস। বাংলা কবিতায় প্রকৃতির রূপ অসংখ্য — মেঘ, বৃষ্টি, নদী, পাহাড়।', 'প্রকৃতি,কবিতা', 'https://picsum.photos/seed/art8/800/400'],
    ['সাহিত্য ও সমাজ', 'সাহিত্য সমাজের দর্পণ। সমাজের পরিবর্তনের সাথে সাথে সাহিত্যের ধারাও বদলায়।', 'সমাজ,সাহিত্য', 'https://picsum.photos/seed/art9/800/400'],
    ['ডিজিটাল যুগে লেখালেখি', 'ডিজিটাল প্ল্যাটফর্ম লেখালেখির নতুন দিগন্ত খুলে দিয়েছে। ব্লগ, সোশ্যাল মিডিয়া, ই-বুক — সবকিছু আজ লেখকের হাতিয়ার।', 'ডিজিটাল,প্রযুক্তি', 'https://picsum.photos/seed/art10/800/400']
  ];
    sampleArticles.forEach((a, i) => {
    const author = sampleAuthors[i % sampleAuthors.length];
    const u = prepare('SELECT id FROM users WHERE username = ?').get(author.handle);
    if (u) {
      prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, status, featured, published_at) VALUES (?, 'article', ?, ?, ?, ?, ?, 'published', ?, datetime('now', '-' || ? || ' days'))`)
        .run(u.id, a[0], a[1], a[1].substring(0, 150), a[2], a[3], i < 3 ? 1 : 0, i);
    }
  });
  
  // Sample questions
  const sampleQ = [
    ['বাংলা কবিতায় ছন্দ কি এখনো প্রাসঙ্গিক?', 'গদ্যছন্দের যুগে মাত্রাবৃত্ত কি তার আকর্ষণ হারাচ্ছে? আপনার মতামত দিন।', 'সাহিত্য'],
    ['কোন লেখক আপনাকে সবচেয়ে বেশি অনুপ্রাণিত করেছেন?', 'আমার কাছে রবীন্দ্রনাথ, নজরুল, জীবনানন্দ — সকলেই অনুপ্রেরণাদায়ী। আপনার প্রিয় কে?', 'সাহিত্য'],
    ['সোশ্যাল মিডিয়া কি সাহিত্য চর্চায় বাধা?', 'ফেসবুক-টুইটার কি গভীর পাঠের অভ্যাস নষ্ট করছে? নাকি সাহিত্যকে নতুন শ্রোতা দিচ্ছে?', 'প্রযুক্তি'],
    ['তরুণ লেখকদের জন্য পরামর্শ কী?', 'নতুন লেখক হিসেবে কীভাবে শুরু করব? কোন কৌশল অনুসরণ করা উচিত?', 'পরামর্শ'],
    ['অনলাইন ম্যাগাজিন বনাম প্রিন্ট?', 'প্রিন্ট ম্যাগাজিন কি ডিজিটাল যুগে টিকে থাকতে পারবে?', 'প্রকাশনা'],
    ['কবিতায় রাজনৈতিক সুর কতটা সমীচীন?', 'রাজনৈতিক কবিতা কি সাহিত্যিক শিল্পকেই প্রশ্নবিদ্ধ করে?', 'রাজনীতি'],
    ['গ্রামীণ সাহিত্য কি আজকের যুগে অবহেলিত?', 'আধুনিক লেখকেরা কি গ্রামীণ জীবন থেকে দূরে সরে যাচ্ছেন?', 'সমাজ'],
    ['কোন ভাষায় লিখব — বাংলা নাকি ইংরেজি?', 'বাংলা ভাষায় লিখলে কি আন্তর্জাতিক শ্রোতা পাওয়া কঠিন?', 'ভাষা'],
    ['ফেলোশিপ পেতে কী কী যোগ্যতা লাগে?', 'তরুণ লেখক হিসেবে কোন ফেলোশিপগুলো আবেদনের যোগ্য?', 'ফেলোশিপ'],
    ['সাহিত্য পুরস্কার কি সত্যিকারের মূল্যায়ন?', 'পুরস্কার কি সাহিত্যিক মান নির্দেশ করে, নাকি জনপ্রিয়তা?', 'পুরস্কার']
  ];
      sampleQ.forEach((q, i) => {
    const author = sampleAuthors[i % sampleAuthors.length];
    const u = prepare('SELECT id FROM users WHERE username = ?').get(author.handle);
    if (u) {
      prepare(`INSERT INTO posts (author_id, type, title, body, category, status, published_at) VALUES (?, 'question', ?, ?, ?, 'published', datetime('now', '-' || ? || ' days'))`)
        .run(u.id, q[0], q[1], q[2], i);
    }
  });
    
  // 10 advisory members
  const advisors = [
    ['অধ্যাপক ড. মো. আবুল কালাম', 'advisor', 'প্রধান উপদেষ্টা', 'ভাষা ও সাহিত্যের প্রবীণ গবেষক।', 'https://picsum.photos/seed/adv1/300/300', '#', 'আবুল কালাম', 1],
    ['বিচারপতি (অব.) হাসিনা বেগম', 'advisor', 'আইনি উপদেষ্টা', 'আইন ও সংস্কৃতি বিষয়ে অভিজ্ঞ।', 'https://picsum.photos/seed/adv2/300/300', '#', 'হাসিনা', 2],
    ['প্রফেসর ড. রফিকুল ইসলাম', 'advisor', 'শিক্ষা উপদেষ্টা', 'শিক্ষা ও গবেষণা বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv3/300/300', '#', 'রফিকুল', 3],
    ['মো. সাইফুল ইসলাম', 'advisor', 'অর্থনৈতিক উপদেষ্টা', 'অর্থনীতি ও সংগঠন বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv4/300/300', '#', 'সাইফুল', 4],
    ['কবি মো. নাজমুল হক', 'advisor', 'সাহিত্য উপদেষ্টা', 'প্রবীণ কবি ও সাহিত্যিক।', 'https://picsum.photos/seed/adv5/300/300', '#', 'নাজমুল', 5],
    ['ডা. সেলিনা আক্তার', 'advisor', 'স্বাস্থ্য উপদেষ্টা', 'চিকিৎসা ও স্বাস্থ্য বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv6/300/300', '#', 'সেলিনা', 6],
    ['মো. ফারুক আহমেদ', 'advisor', 'প্রযুক্তি উপদেষ্টা', 'প্রযুক্তি ও ডিজিটাল মিডিয়া বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv7/300/300', '#', 'ফারুক', 7],
    ['শিল্পী নাজনীন আক্তার', 'advisor', 'সাংস্কৃতিক উপদেষ্টা', 'চিত্রশিল্পী ও সাংস্কৃতিক ব্যক্তিত্ব।', 'https://picsum.photos/seed/adv8/300/300', '#', 'নাজনীন', 8],
    ['মো. তৌহিদুল ইসলাম', 'advisor', 'গণমাধ্যম উপদেষ্টা', 'সাংবাদিক ও গণমাধ্যম বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv9/300/300', '#', 'তৌহিদুল', 9],
    ['অধ্যাপক সুফিয়া বেগম', 'advisor', 'নারী উন্নয়ন উপদেষ্টা', 'নারী অধিকার ও উন্নয়ন বিশেষজ্ঞ।', 'https://picsum.photos/seed/adv10/300/300', '#', 'সুফিয়া', 10]
  ];
    advisors.forEach(a => {
    // v2: members table uses (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order)
    prepare('INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(a[0], a[1], a[2], a[3], a[4], a[5], a[6], 'advisory', a[7]);
  });
  
  // 10 resources
  const resourceItems = [
    ['কবিতা লেখার কৌশল', 'https://example.com/files/poetry-tips.pdf', 'pdf', 'কবিতা লেখার মূল ভিত্তি হলো অনুভূতির সত্যিকারের প্রকাশ।', 'guide', 'সম্পাদক'],
    ['প্রবন্ধ রচনার পদ্ধতি', 'https://example.com/files/essay-method.pdf', 'pdf', 'প্রবন্ধে যুক্তি ও অনুভূতির ভারসাম্য রক্ষা করতে হয়।', 'guide', 'মো. রুহুল আমিন'],
    ['ফেলোশিপ ও গবেষণা অনুদান', 'https://example.com/files/fellowship.pdf', 'pdf', 'দেশী-বিদেশী বিভিন্ন ফেলোশিপ ও গবেষণা অনুদান সম্পর্কে বিস্তারিত তথ্য।', 'scholarship', 'সাইশা সুলতানা সাদিয়া'],
    ['অনলাইনে লেখালেখি ও প্রকাশনা', 'https://example.com/files/publishing.pdf', 'pdf', 'ডিজিটাল প্ল্যাটফর্মে লেখা প্রকাশ করার সুবিধা ও সতর্কতা।', 'guide', 'ফারজানা আক্তার'],
    ['গঠনতন্ত্র সম্পূর্ণ কপি', 'https://example.com/files/constitution.pdf', 'pdf', 'লেখক ফোরামের সম্পূর্ণ গঠনতন্ত্র।', 'document', 'প্রশাসন'],
    ['বার্ষিক প্রতিবেদন ২০২৫', 'https://example.com/files/annual-2025.pdf', 'pdf', '২০২৫ সালের বার্ষিক প্রতিবেদন।', 'report', 'প্রশাসন'],
    ['সদস্যপদ ফর্ম', 'https://example.com/files/membership.pdf', 'pdf', 'সদস্যপদের জন্য আবেদন ফর্ম।', 'form', 'প্রশাসন'],
    ['কবিতার সংকলন — ভলিউম ১', 'https://example.com/files/poetry-vol1.pdf', 'pdf', 'সেরা কবিতার সংকলন।', 'anthology', 'সম্পাদক'],
    ['ছোটগল্প সংকলন', 'https://example.com/files/stories.pdf', 'pdf', 'সদস্যদের লেখা ছোটগল্পের সংকলন।', 'anthology', 'সম্পাদক'],
    ['সাহিত্য পরিভাষা', 'https://example.com/files/terms.pdf', 'pdf', 'সাহিত্য বিষয়ক গুরুত্বপূর্ণ পরিভাষা।', 'reference', 'সম্পাদক']
  ];
  // Resources table: (title, content, category, author, tags) — store description as content, category as category, author as author, file type as tag
  resourceItems.forEach(r => prepare('INSERT INTO resources (title, content, category, author, tags) VALUES (?, ?, ?, ?, ?)')
    .run(r[0], r[3], r[4], r[5], r[2]));

  
  saveDb();
  console.log('✓ Database seeded with sample data');
}

function getSetting(key) {
  const row = prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP').run(key, value);
}

module.exports = {
  initDb,
  get db() { return db; },
  prepare,
  exec,
  getSetting,
  setSetting,
  saveDb,
  MODERATOR_SCOPES,
  isModerator,
  getModeratorScopes,
  hasScope,
  grantModerator,
  revokeModerator,
  listModerators,
  searchPromotableUsers
};
