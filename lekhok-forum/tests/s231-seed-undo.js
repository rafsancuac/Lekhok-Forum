#!/usr/bin/env node
// s231-seed-undo.js — ফাইল-লেভেল-DB-এডিট (sql.js-মেমোরি-আইসোলেশন-চুক্তি: সার্ভার-বন্ধ-অবস্থায়-ই-চালাতে-হবে)
// ব্যবহার: node tests/s231-seed-undo.js seed|cleanup
// TAG-উপসর্গ 'Task231-UNDO' — জঞ্জাল-শূন্য-চুক্তি (seed-আগেই-প্রি-ক্লিন; cleanup-এ শেষ-পরিষ্কার)
'use strict';
const path = require('path');
const fs = require('fs');
process.chdir(path.join(__dirname, '..')); // app root (lekhok.db relative)
const TAG = 'Task231-UNDO';
const mode = process.argv[2] || 'seed';

(async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (!fs.existsSync('lekhok.db')) { console.error('FATAL: lekhok.db নেই'); process.exit(1); }
  const db = new SQL.Database(fs.readFileSync('lekhok.db'));
  db.run('DELETE FROM user_reports WHERE message_text LIKE ?', [TAG + '%']); // প্রি-ক্লিন (বারবার-রান-নিরাপদ)
  if (mode === 'seed') {
    for (let i = 1; i <= 2; i++) {
      db.run(
        "INSERT INTO user_reports (sender_id, message_text, media_type, status, created_at) VALUES (1, ?, 'TEXT', 'PENDING', datetime('now'))",
        [TAG + '-ভেক্টর' + i + ' পরীক্ষা-বার্তা']
      );
    }
  } else if (mode !== 'cleanup') {
    console.error('mode: seed|cleanup'); process.exit(1);
  }
  fs.writeFileSync('lekhok.db', Buffer.from(db.export()));
  const c = db.exec("SELECT COUNT(*) FROM user_reports WHERE message_text LIKE '" + TAG + "%'");
  console.log(mode.toUpperCase() + '-COUNT=' + c[0].values[0][0]);
})().catch(e => { console.error('FATAL ' + e.message); process.exit(1); });
