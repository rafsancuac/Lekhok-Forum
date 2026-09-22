#!/usr/bin/env node
// s238-seed-lbox.js — লাইটবক্স-সুইট-সিড (ফাইল-লেভেল-DB-এডিট — sql.js-মেমোরি-আইসোলেশন-চুক্তি: সার্ভার-বন্ধ-অবস্থায়-ই-চালাতে-হবে)
// ব্যবহার: node tests/s238-seed-lbox.js seed|cleanup
// TAG-উপসর্গ 'Task238-LBOX' — জঞ্জাল-শূন্য-চুক্তি (seed-আগেই-প্রি-ক্লিন; cleanup-এ শেষ-পরিষ্কার)
// মিডিয়া-কার্ড ×১: IMAGE + ১×১-PNG-data-URI (স্বয়ংসম্পূর্ণ — নেটওয়ার্ক/ফাইল-নির্ভরতা-শূন্য)
'use strict';
const path = require('path');
const fs = require('fs');
process.chdir(path.join(__dirname, '..')); // app root (lekhok.db relative)
const TAG = 'Task238-LBOX';
const mode = process.argv[2] || 'seed';
// 1×1 লাল-পিক্সেল PNG (স্ট্যান্ডার্ড-বেস৬৪ — ইমেজ-ডিকোড-নিশ্চিত)
const PNG1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

(async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (!fs.existsSync('lekhok.db')) { console.error('FATAL: lekhok.db নেই'); process.exit(1); }
  const db = new SQL.Database(fs.readFileSync('lekhok.db'));
  db.run('DELETE FROM user_reports WHERE message_text LIKE ?', [TAG + '%']); // প্রি-ক্লিন (বারবার-রান-নিরাপদ)
  if (mode === 'seed') {
    db.run(
      "INSERT INTO user_reports (sender_id, message_text, media_type, media_url, status, created_at) VALUES (1, ?, 'IMAGE', ?, 'PENDING', datetime('now'))",
      [TAG + '-ছবি-সংযুক্তি-পরীক্ষা', PNG1]
    );
  } else if (mode !== 'cleanup') {
    console.error('mode: seed|cleanup'); process.exit(1);
  }
  fs.writeFileSync('lekhok.db', Buffer.from(db.export()));
  const c = db.exec("SELECT COUNT(*) FROM user_reports WHERE message_text LIKE '" + TAG + "%'");
  console.log(mode.toUpperCase() + '-COUNT=' + c[0].values[0][0]);
})().catch(e => { console.error('FATAL ' + e.message); process.exit(1); });
