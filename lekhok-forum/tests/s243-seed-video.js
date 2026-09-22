#!/usr/bin/env node
// s243-seed-video.js — session243 মিডিয়া-চিপ-সম্পূর্ণতা-সুইট-সিড (ফাইল-লেভেল-DB-এডিট — sql.js-মেমোরি-আইসোলেশন-চুক্তি: সার্ভার-বন্ধ-অবস্থায়-ই-চালাতে-হবে)
// ব্যবহার: node tests/s243-seed-video.js seed|cleanup
// TAG-উপসর্গ 'Task243-VIDEO' — জঞ্জাল-শূন্য-চুক্তি (seed-আগেই-প্রি-ক্লিন; cleanup-এ শেষ-পরিষ্কার)
// সিড: TEXT ×২ + IMAGE ×১ + AUDIO ×১ + VIDEO ×২ (চিপ-ব্যাজ নিখুত-যাচাই {t:2,i:1,a:1,v:2}; media_url-শূন্য — রিড-ওনলি-রেন্ডার)
'use strict';
const path = require('path');
const fs = require('fs');
process.chdir(path.join(__dirname, '..')); // app root (lekhok.db relative)
const TAG = 'Task243-VIDEO';
const mode = process.argv[2] || 'seed';

(async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (!fs.existsSync('lekhok.db')) { console.error('FATAL: lekhok.db নেই'); process.exit(1); }
  const db = new SQL.Database(fs.readFileSync('lekhok.db'));
  db.run('DELETE FROM user_reports WHERE message_text LIKE ?', [TAG + '%']); // প্রি-ক্লিন (বারবার-রান-নিরাপদ)
  if (mode === 'seed') {
    const rows = [
      [TAG + '-লেখা-এক', 'TEXT'],
      [TAG + '-লেখা-দুই', 'TEXT'],
      [TAG + '-ছবি-সংযুক্তি', 'IMAGE'],
      [TAG + '-ভয়েস-বার্তা', 'AUDIO'],
      [TAG + '-ভিডিও-এক', 'VIDEO'],
      [TAG + '-ভিডিও-দুই', 'VIDEO'],
    ];
    for (const [sg, mt] of rows) {
      db.run(
        "INSERT INTO user_reports (sender_id, message_text, media_type, status, created_at) VALUES (1, ?, ?, 'PENDING', datetime('now'))",
        [sg, mt]
      );
    }
  } else if (mode !== 'cleanup') {
    console.error('mode: seed|cleanup'); process.exit(1);
  }
  fs.writeFileSync('lekhok.db', Buffer.from(db.export()));
  const c = db.exec("SELECT COUNT(*) FROM user_reports WHERE message_text LIKE '" + TAG + "%'");
  console.log(mode.toUpperCase() + '-COUNT=' + c[0].values[0][0]);
})().catch(e => { console.error('FATAL ' + e.message); process.exit(1); });
