#!/usr/bin/env node
/* s281-seedpaper.js — session281 সুইট-হেল্পার: epaper_files-মার্কার-সিড/ক্লিন (s272 marker-seed-নেট-শূন্য-চুক্তি)
   ব্যবহার: node scripts/s281-seedpaper.js seed | clean
   ক্রম-গোটচা (session279-নোট): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক — পুরাতন-প্রসেসের
   graceful-shutdown-flush নিজের in-memory-কপি ফাইলে-ওভাররাইট করে (উল্টো-ক্রমে মার্কার-হারায়/ফের-আসে)।
   মার্কার: drive_file_id='S281TESTFILE' + source='qa-s281' — ক্লিনে এ-জোড়া-দিয়েই DELETE (অন্য-সারি-স্পর্শ-শূন্য)। */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const FID = 'S281TESTFILE';
const SRC = 'qa-s281';

function dhakaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

(async () => {
  await db.initDb();
  if (MODE === 'seed') {
    const ex = db.prepare('SELECT id FROM epaper_files WHERE drive_file_id = ? AND source = ?').all(FID, SRC);
    if (ex.length) { console.log('SEED-ALREADY id=' + ex[0].id); process.exit(0); }
    db.prepare("INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, source, published) VALUES (?,?,?,?,?,1)")
      .run(dhakaToday(), 's281-প্রোব-পত্রিকা', 'https://example.com/s281-probe.pdf', FID, SRC);
    db.saveDb();
    const row = db.prepare('SELECT id FROM epaper_files WHERE drive_file_id = ? AND source = ?').all(FID, SRC);
    console.log('SEED-OK id=' + (row[0] && row[0].id));
    process.exit(0);
  } else if (MODE === 'clean') {
    const r = db.prepare('DELETE FROM epaper_files WHERE drive_file_id = ? AND source = ?').run(FID, SRC);
    db.saveDb();
    console.log('CLEAN-OK deleted=' + (r.changes || 0));
    process.exit(0);
  }
  console.error('ব্যবহার: node scripts/s281-seedpaper.js seed|clean');
  process.exit(1);
})().catch((e) => { console.error('SEED-ERR:', e && e.message); process.exit(1); });
