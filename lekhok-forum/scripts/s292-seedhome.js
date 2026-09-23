#!/usr/bin/env node
/* s292-seedhome.js — session292 সুইট-হেল্পার: হোম-কিয়স্ক মার্কার-সিড/ক্লিন (s272/s281 net-zero চুক্তি)
   ব্যবহার: node scripts/s292-seedhome.js seed | clean
   ক্রম-গোটচা (session279): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক (graceful-flush-উল্টো-লেখা)।
   মার্কার-জোড়া: drive_file_id='S292TESTFILE1/2' + source='qa-s292' — ক্লিনে এ-জোড়া-দিয়েই DELETE।
   সিড-২-সারি: ① paper_name='প্রথম আলো' (data/newspaperLinks সঠিক-মিল → থাম্ব-আছে)
               ② paper_name='s292-অমিল-পত্রিকা' (মিল-নেই → থাম্ব-শূন্য — টেক্সট-ফলব্যাক-শাখা) */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const SRC = 'qa-s292';
const ROWS = [
  { fid: 'S292TESTFILE1', name: 'প্রথম আলো' },
  { fid: 'S292TESTFILE2', name: 's292-অমিল-পত্রিকা' }
];

function dhakaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

(async () => {
  await db.initDb();
  if (MODE === 'seed') {
    let seeded = 0;
    for (const r of ROWS) {
      const ex = db.prepare('SELECT id FROM epaper_files WHERE drive_file_id = ? AND source = ?').all(r.fid, SRC);
      if (ex.length) { seeded++; continue; }
      db.prepare("INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, source, published) VALUES (?,?,?,?,?,1)")
        .run(dhakaToday(), r.name, 'https://example.com/s292-probe.pdf', r.fid, SRC);
      seeded++;
    }
    db.saveDb();
    const n = db.prepare('SELECT COUNT(*) AS c FROM epaper_files WHERE source = ?').all(SRC)[0].c;
    console.log('SEED-OK count=' + n);
    process.exit(0);
  } else if (MODE === 'clean') {
    let total = 0;
    for (const r of ROWS) {
      const res = db.prepare('DELETE FROM epaper_files WHERE drive_file_id = ? AND source = ?').run(r.fid, SRC);
      total += (res.changes || 0);
    }
    db.saveDb();
    console.log('CLEAN-OK deleted=' + total);
    process.exit(0);
  } else {
    console.log('ব্যবহার: node scripts/s292-seedhome.js seed|clean');
    process.exit(1);
  }
})().catch((e) => { console.error('SEED-ERR', e && e.message); process.exit(1); });
