#!/usr/bin/env node
/* s286-seedmonths.js — session286 সুইট-হেল্পার: বহু-মাস epaper_files-মার্কার-সিড/ক্লিন
   (s284-seedyear-মডেল; s272 marker-seed-নেট-শূন্য-চুক্তি)
   ব্যবহার: node scripts/s286-seedmonths.js seed | clean
   মার্কার ×৮ (২০২৬-জানুয়ারি..আগস্ট — ৪-কলাম-গ্রিডের প্রথম-দু-সারি পূর্ণ-enabled;
     সেপ্টেম্বর..ডিসেম্বর disabled — skip/wrap/Home/End-অ্যাসার্ট নির্ধারণসই):
     fid S286TEST0..7 → 2026-01-10 .. 2026-08-10, source='qa-s286'
   ক্লিনে এ-৮-দিয়েই DELETE (অন্য-সারি-স্পর্শ-শূন্য; s284-মার্কার-অস্পৃশ্য)।
   ক্রম-গোটচা (session279-নোট): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক — পুরাতন-প্রসেসের
   graceful-shutdown-flush নিজের in-memory-কপি ফাইলে-ওভাররাইট করে (উল্টো-ক্রমে মার্কার-হারায়/ফের-আসে)। */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const SRC = 'qa-s286';
const MARKS = [];
for (let i = 0; i < 8; i++) {
  const mo = String(i + 1).padStart(2, '0');
  MARKS.push({
    fid: 'S286TEST' + i,
    date: '2026-' + mo + '-10',
    name: 's286-প্রোব-' + (i + 1),
    url: 'https://example.com/s286-' + i + '.pdf'
  });
}

(async () => {
  await db.initDb();
  if (MODE === 'seed') {
    let okN = 0, alreadyN = 0;
    for (const m of MARKS) {
      const ex = db.prepare('SELECT id FROM epaper_files WHERE drive_file_id = ? AND source = ?').all(m.fid, SRC);
      if (ex.length) { alreadyN++; continue; }
      db.prepare("INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, source, published) VALUES (?,?,?,?,?,1)")
        .run(m.date, m.name, m.url, m.fid, SRC);
      okN++;
    }
    db.saveDb();
    const total = db.prepare("SELECT COUNT(*) AS c FROM epaper_files WHERE source = ?").all(SRC)[0].c;
    console.log('SEED-OK inserted=' + okN + ' already=' + alreadyN + ' total=' + total);
    process.exit(0);
  } else if (MODE === 'clean') {
    const ph = MARKS.map(() => '?').join(',');
    const r = db.prepare("DELETE FROM epaper_files WHERE source = ? AND drive_file_id IN (" + ph + ")")
      .run(SRC, ...MARKS.map(m => m.fid));
    db.saveDb();
    const total = db.prepare("SELECT COUNT(*) AS c FROM epaper_files WHERE source = ?").all(SRC)[0].c;
    console.log('CLEAN-OK deleted=' + (r.changes || 0) + ' residual=' + total);
    process.exit(0);
  }
  console.error('ব্যবহার: node scripts/s286-seedmonths.js seed|clean');
  process.exit(1);
})().catch((e) => { console.error('SEED-ERR:', e && e.message); process.exit(1); });
