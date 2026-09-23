#!/usr/bin/env node
/* s296-seedhome.js — session296 সুইট-হেল্পার: প্রশস্ত-কিয়স্ক মার্কার-সিড/ক্লিন (s272/s281/s292 net-zero চুক্তি)
   ব্যবহার: node scripts/s296-seedhome.js seed | clean
   ক্রম-গোটচা (session279): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক (graceful-flush-উল্টো-লেখা)।
   মার্কার-জোড়া: drive_file_id='S296TESTFILE1..7' + source='qa-s296' — ক্লিনে এ-জোড়া-দিয়েই DELETE।
   সিড-৭-সারি (রিয়েল-নাম — epPopularRank296 র‍্যাংক-ক্রম + epaperThumbByName291 থাম্ব-মিল যাচাই):
     ইত্তেফাক → যুগান্তর → সমকাল → কালের কণ্ঠ → মানবকণ্ঠ → আমার দেশ (সব-র‍্যাংকড) + s296-অমিল-পত্রিকা
     (র‍্যাংক-বহির্ভূত → টেক্সট-ফলব্যাক-শাখা; id-ক্রমে শেষে-সন্নিবেশিত তবু র‍্যাংক-বাছাইয়ে শেষেই থাকে)
   প্রথম আলো ইচ্ছাকৃত-বাদ — s292-seedhome-এর মার্কার-সারিটি ('প্রথম আলো') একই-দিনে থাকলে
   র‍্যাংক-১ হিসেবে সেটাই প্রথম হয় (উভয়-সিডার-সহ-অস্তিত্ব যাচাই)। */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const SRC = 'qa-s296';
const ROWS = [
  { fid: 'S296TESTFILE1', name: 'ইত্তেফাক' },
  { fid: 'S296TESTFILE2', name: 'যুগান্তর' },
  { fid: 'S296TESTFILE3', name: 'সমকাল' },
  { fid: 'S296TESTFILE4', name: 'কালের কণ্ঠ' },
  { fid: 'S296TESTFILE5', name: 'মানবকণ্ঠ' },
  { fid: 'S296TESTFILE6', name: 'আমার দেশ' },
  { fid: 'S296TESTFILE7', name: 's296-অমিল-পত্রিকা' }
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
        .run(dhakaToday(), r.name, 'https://example.com/s296-probe.pdf', r.fid, SRC);
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
    console.log('ব্যবহার: node scripts/s296-seedhome.js seed|clean');
    process.exit(1);
  }
})().catch((e) => { console.error('SEED-ERR', e && e.message); process.exit(1); });
