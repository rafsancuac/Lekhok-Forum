/**
 * migrate-link-members-to-users.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Auto-links committee/advisory/founder/branch members (and past_leaders) to
 * their registered user accounts by matching the member's `name` against
 * `users.full_name`.  Idempotent — safe to re-run.
 *
 * Matching strategy
 * ─────────────────
 * 1. Exact match (case-insensitive, whitespace-normalised).
 * 2. Contains match — one name fully contains the other after normalisation.
 *    e.g. "মোনেম শাহরিয়ার শাওন" ↔ "Monem Shahriyar Shawon" → contains via
 *    transliterated normal form.
 *
 * Usage
 * ──────
 *   node db/migrate-link-members-to-users.js        # uses ./lekhok.db
 *   node db/migrate-link-members-to-users.js --prod # uses TURSO_DATABASE_URL
 *
 * Run against the same DB that the app uses so the link survives the next
 * Blob restore on Vercel.
 */

const path  = require('path');
const fs    = require('fs');
const https = require('https');

// ── CLI ──────────────────────────────────────────────────────────────────────
const isProd = process.argv.includes('--prod');
const DB_PATH = isProd ? null : path.join(__dirname, '..', 'lekhok.db');

// ── sql.js bootstrap ─────────────────────────────────────────────────────────
let initSqlJs;
if (isProd) {
  initSqlJs = require('sql.js');
} else {
  initSqlJs = require(path.join(__dirname, '..', 'node_modules', 'sql.js'));
}

let db;
(async () => {
  const SQL = await initSqlJs({
    locateFile: (f) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', f)
  });

  if (isProd) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) { console.error('TURSO_DATABASE_URL not set for --prod'); process.exit(1); }
    const buf = await new Promise((res, rej) => {
      https.get(url, (r) => { const d = []; r.on('data', c => d.push(c)); r.on('end', () => res(Buffer.concat(d))); }).on('error', rej);
    });
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  }

  // ── Ensure columns exist ────────────────────────────────────────────────────
  const membersCols = cols('members');
  if (!membersCols.includes('user_id')) {
    db.run("ALTER TABLE members ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
    console.log('[migrate] Added user_id column to members');
  }

  const pastCols = cols('past_leaders');
  if (!pastCols.includes('user_id')) {
    db.run("ALTER TABLE past_leaders ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
    console.log('[migrate] Added user_id column to past_leaders');
  }

  // ── Load reference data ─────────────────────────────────────────────────────
  const users = {};
  const userStmt = db.prepare('SELECT id, username, full_name FROM users');
  while (userStmt.step()) {
    const u = userStmt.getAsObject();
    if (u.full_name) users[u.id] = u;
  }
  userStmt.free();
  console.log(`[migrate] Loaded ${Object.keys(users).length} users\n`);

  // ── Normalisation helpers ──────────────────────────────────────────────────
  const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

  /** Returns a transliteration-approximate normal form: keep only letters/numbers. */
  const alphaOnly = (s) => norm(s).replace(/[^a-z0-9\u0980-\u09ff]/g, '');

  /** Fuzzy contains: one string's alpha form is inside the other's. */
  const fuzzyContains = (a, b) => {
    const aa = alphaOnly(a), bb = alphaOnly(b);
    return (aa.length > 3 && bb.length > 3) && (aa.includes(bb) || bb.includes(aa));
  };

  // ── Link helper ────────────────────────────────────────────────────────────
  const link = (table, id, userId, reason) => {
    db.run(`UPDATE ${table} SET user_id = ? WHERE id = ?`, [userId, id]);
    console.log(`  ✓ ${table} id=${id} → user_id=${userId} (${reason})`);
  };

  const match = (table, member) => {
    const mn = norm(member.name);
    for (const [uid, u] of Object.entries(users)) {
      const un = norm(u.full_name);
      if (mn === un) {
        link(table, member.id, uid, `exact match "${mn}"`);
        return true;
      }
    }
    for (const [uid, u] of Object.entries(users)) {
      if (fuzzyContains(member.name, u.full_name)) {
        link(table, member.id, uid, `fuzzy match "${member.name}" ↔ "${u.full_name}"`);
        return true;
      }
      if (fuzzyContains(u.full_name, member.name)) {
        link(table, member.id, uid, `fuzzy match "${u.full_name}" ↔ "${member.name}"`);
        return true;
      }
    }
    return false;
  };

  // ── Process members ────────────────────────────────────────────────────────
  console.log('─── Members ───────────────────────────────────────────────');
  let linked = 0, skipped = 0;
  const stmt = db.prepare("SELECT * FROM members ORDER BY sort_order");
  while (stmt.step()) {
    const m = stmt.getAsObject();
    if (m.user_id) { skipped++; continue; }
    const ok = match('members', m);
    if (!ok) console.log(`  – no match for "${m.name}" (member_type=${m.member_type})`);
    else linked++;
  }
  stmt.free();
  console.log(`\nMembers: linked ${linked}, already had user_id ${skipped}`);

  // ── Process past_leaders ───────────────────────────────────────────────────
  console.log('\n─── Past Leaders ──────────────────────────────────────────');
  let plLinked = 0, plSkipped = 0;
  const stmt2 = db.prepare("SELECT * FROM past_leaders ORDER BY sort_order");
  while (stmt2.step()) {
    const p = stmt2.getAsObject();
    if (p.user_id) { plSkipped++; continue; }
    const ok = match('past_leaders', p);
    if (!ok) console.log(`  – no match for "${p.name}" (role=${p.role})`);
    else plLinked++;
  }
  stmt2.free();
  console.log(`\nPast leaders: linked ${plLinked}, already had user_id ${plSkipped}`);

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalLinked = linked + plLinked;
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  Total linked: ${totalLinked} members/past-leaders`);
  console.log(`══════════════════════════════════════════════════════════\n`);

  // ── Persist ────────────────────────────────────────────────────────────────
  if (isProd) {
    console.log('[migrate] --prod mode: not writing back (read-only Turso dump)');
  } else {
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log(`[migrate] Saved to ${DB_PATH}`);
  }

  db.close();
})();

function cols(table) {
  const c = [];
  const s = db.prepare(`PRAGMA table_info(${table})`);
  while (s.step()) c.push(s.getAsObject().name);
  s.free();
  return c;
}
