#!/usr/bin/env node
/**
 * db/migrate.js — Run schema migrations against the configured database.
 *
 * Usage:
 *   node db/migrate.js              # uses local sql.js (default)
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node db/migrate.js  # Turso
 *
 * Idempotent — safe to run multiple times (CREATE TABLE IF NOT EXISTS).
 */

const fs   = require('fs');
const path = require('path');

// ── 1. Resolve DB backend ─────────────────────────────────────────────────────
const IS_VERCEL   = !!process.env.TURSO_DATABASE_URL;
const schemaPath  = path.join(__dirname, 'schema.sql');
const schema      = fs.readFileSync(schemaPath, 'utf8');

if (IS_VERCEL) {
  // ── Turso / libSQL path ─────────────────────────────────────────────────
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url:  process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || ''
  });

  const statements = schema
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  (async () => {
    console.log('[migrate] Running Turso migrations…');
    for (const sql of statements) {
      try {
        await client.execute(sql);
        console.log('  ✓', sql.substring(0, 60).replace(/\n/g, ' ').trim() + '…');
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log('  — (already present)', sql.substring(0, 50).trim());
        } else {
          console.error('  ✗ ERROR:', err.message);
        }
      }
    }
    // session306: epaper_files.page_count-নিশ্চিতকারী (পুরাতন-ডিপ্লয়ে কলাম-যোগ — ইডেমপোটেন্ট)
    try {
      await client.execute('ALTER TABLE epaper_files ADD COLUMN page_count INTEGER');
      console.log('  + epaper_files.page_count যোগ হয়েছে');
    } catch (colErr306) {
      if (!/duplicate column|already exists/i.test(String(colErr306 && colErr306.message))) {
        console.error('  ✗ page_count-মাইগ্রেশন:', colErr306 && colErr306.message);
      }
    }
    await client.close();
    console.log('[migrate] Done.');
  })().catch(err => { console.error('[migrate] Fatal:', err.message); process.exit(1); });

} else {
  // ── Local sql.js path (dev only) ───────────────────────────────────────
  // session306-ফিক্স: top-level-await + require = ERR_AMBIGUOUS_MODULE_SYNTAX (Node 22+) —
  // লোকাল-শাখা async-IIFE-এ মোড়ানো → CJS-পার্স-পুনঃপ্রতিষ্ঠা (node db/migrate.js পুনঃচালু)
  (async () => {
  const initSqlJs = require('sql.js');
  const SQL       = await initSqlJs();
  const dbPath    = path.join(__dirname, '..', 'lekhok.db');
  let db          = new SQL.Database();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  }

  const statements = schema
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log('[migrate] Running local sql.js migrations…');
  for (const sql of statements) {
    try {
      db.run(sql);
      console.log('  ✓', sql.substring(0, 60).replace(/\n/g, ' ').trim() + '…');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('  — (already present)', sql.substring(0, 50).trim());
      } else {
        console.error('  ✗ ERROR:', err.message);
      }
    }
  }

  // session306: epaper_files.page_count-নিশ্চিতকারী (লোকাল sql.js — ইডেমপোটেন্ট)
  try {
    db.run('ALTER TABLE epaper_files ADD COLUMN page_count INTEGER');
    console.log('  + epaper_files.page_count যোগ হয়েছে (লোকাল)');
  } catch (colErr306) {
    if (!/duplicate column|already exists/i.test(String(colErr306 && colErr306.message))) {
      console.error('  ✗ page_count-মাইগ্রেশন:', colErr306 && colErr306.message);
    }
  }
  const out = fs.writeFileSync(dbPath, db.export());
  console.log('[migrate] Saved to lekhok.db');
  console.log('[migrate] Done.');
  })().catch((migErr306) => { console.error('migrate Fatal:', migErr306 && migErr306.message); process.exit(1); });
}
