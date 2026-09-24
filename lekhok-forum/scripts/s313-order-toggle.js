#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   s313-order-toggle.js — session313 QA-টুল: settings.home_feed_order পাঠ/লেখা
   **সার্ভার বন্ধ অবস্থায় চালান** (SIGTERM-save clobber-গোটচা — pkill -9; s280-নীতি;
   in-memory-স্টেল-গোটচা — লেখার-পরে সার্ভার-রিস্টার্ট বাধ্যতমূলক — s311-নোট)।
   ব্যবহার: node scripts/s313-order-toggle.js get
            node scripts/s313-order-toggle.js set '<JSON-অ্যারে-লিটারেল>'
            node scripts/s313-order-toggle.js set 'null'   (সেটিং-মুছুন — ডিফল্ট-ফিরিয়ে-আনুন)
   আউটপুট: get → raw-মান বা NULL; set → SET ✓ / CLEARED ✓
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(path.join(__dirname, '..', 'lekhok.db'));
const MODE = process.argv[2] || 'get';
const RAW = process.argv[3];

initSqlJs().then(function (SQL) {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const all = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; };
  const run = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); st.step(); st.free(); };

  const rows = all("SELECT value FROM settings WHERE key = 'home_feed_order'");
  const cur = rows.length ? rows[0].value : null;

  if (MODE === 'get') {
    console.log(cur === null || cur === undefined ? 'NULL' : String(cur));
    return;
  }
  if (MODE !== 'set') { console.error('ব্যবহার: get | set <json>'); process.exit(1); }

  let val = null;
  if (RAW !== 'null' && RAW !== undefined) {
    try { val = JSON.stringify(JSON.parse(RAW)); } catch (e) { console.error('FATAL: অবৈধ-JSON: ' + e.message); process.exit(1); }
  }
  if (val === null) {
    if (cur !== null) run("DELETE FROM settings WHERE key = 'home_feed_order'");
    console.log('CLEARED ✓ (পূর্বে: ' + (cur === null ? 'NULL' : cur) + ')');
  } else {
    if (rows.length) run("UPDATE settings SET value = ? WHERE key = 'home_feed_order'", val);
    else run("INSERT INTO settings (key, value) VALUES ('home_feed_order', ?)", val);
    console.log('SET ✓ (পূর্বে: ' + (cur === null ? 'NULL' : cur) + ')');
  }
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
});
