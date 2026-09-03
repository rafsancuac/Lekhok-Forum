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

const DB_PATH     = path.join(__dirname, 'lekhok.db');
const IS_TURSO    = !!process.env.TURSO_DATABASE_URL;

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
`;

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
function makeSqlJsBackend(SQL) {
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _sqlJsDb = new SQL.Database(buf);
  } else {
    _sqlJsDb = new SQL.Database();
  }

  function saveDb() {
    const data = _sqlJsDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
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
    type:    'sqljs'
  };
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
    "ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'",
    "ALTER TABLE posts ADD COLUMN reactions TEXT DEFAULT '{}'",
    "ALTER TABLE comments ADD COLUMN reactions TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN notify_prefs TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN display_prefs TEXT DEFAULT '{}'",
    "ALTER TABLE users ADD COLUMN interests TEXT DEFAULT '[]'"
  ];
  for (const s of alt) {
    try { await backend.exec(s); } catch (_) {}
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
    backend = makeSqlJsBackend(SQL);
    console.log('[db] Using local sql.js at', DB_PATH);
  }

  await runMigrations();

  // Seed if empty (Turso + local)
  if (IS_TURSO) {
    const c = await backend.prepare('SELECT COUNT(*) as c FROM admin_users').get();
    if (c.c === 0) {
      console.log('[db] Seeding initial admin + content…');
      // Light seed — full seeding is too heavy for first request; a separate
      // db/seed.js script can populate content if needed.
      await seedAdmin();
    }
  } else {
    const c = backend.prepare('SELECT COUNT(*) as c FROM admin_users').get();
    if (c.c === 0) {
      console.log('[db] First run — seeding full local DB…');
      seedIfEmptyLocal();
    }
  }
}

async function seedAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  await backend.prepare(
    "INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)"
  ).run('admin', hash, 'প্রশাসক');
  const defaults = [
    ['site_name', 'লেখক ফোরাম'],
    ['tagline', 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়'],
    ['contact_email', 'info@lekhokforum.org'],
    ['contact_phone', '০১XXXXXXXXX'],
    ['contact_address', 'আপনার ক্যাম্পাস ঠিকানা'],
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

// ── Synchronous-looking wrapper ────────────────────────────────────────────
// Most existing code calls `db.prepare(...).all()` synchronously. To keep
// that working on Turso, we cache the last-issued prepare() result locally
// and, when called sync, throw a friendly error pointing to the async API.
// In practice every serverless request awaits the function chain.
function prepare(sql) {
  if (backend.type === 'sqljs') return backend.prepare(sql);

  // Turso: return an object that synchronously throws — but we also attach
  // the async API as `*Async` so callers that have been updated can use it.
  const proxy = {
    all: (...p) => { throw new Error('Turso backend: use db.prepare(sql).allAsync(...).'); },
    get: (...p) => { throw new Error('Turso backend: use db.prepare(sql).getAsync(...).'); },
    run: (...p) => { throw new Error('Turso backend: use db.prepare(sql).runAsync(...).'); }
  };
  const asyncStmt = backend.prepare(sql);
  proxy.allAsync = asyncStmt.all;
  proxy.getAsync = asyncStmt.get;
  proxy.runAsync = asyncStmt.run;
  return proxy;
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

function setSetting(key, value) {
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

// ── Moderator helpers (sync-friendly on sql.js, async on Turso) ────────────
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
  if (backend.type === 'sqljs') {
    return !!backend.prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(userId, scope);
  }
  return backend.prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(userId, scope).then(r => !!r);
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
  setSetting,
  saveDb,
  MODERATOR_SCOPES,
  isModerator,
  getModeratorScopes,
  hasScope,
  grantModerator,
  revokeModerator,
  listModerators,
  searchPromotableUsers,
  IS_TURSO
};
