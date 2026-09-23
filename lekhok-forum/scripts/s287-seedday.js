#!/usr/bin/env node
/* s287-seedday.js — session287 সুইট-হেল্পার: epaper_files-মার্কার-সিড/ক্লিন (দিন-গ্রিড-নেভ ep287)
   (s286-seedmonths-মডেল; s272 marker-seed-নেট-শূন্য-চুক্তি)
   ব্যবহার: node scripts/s287-seedday.js seed | clean
   মার্কার ×১ (২০২৬-০৯-১৫ — hasPayload-গ্যারান্টি (s283-গোটচা: রিডার-মার্কআপ payload-অবস্থায়-ই)
     + সেপ্টেম্বর-বুট-গ্রিড (দিন-বাটন ১..৩০); ভবিষ্যৎ-দিন disabled-ব্লক = ব্রাউজার-তারিখ-নির্ভর —
     সুইট-অ্যাসার্ট সব-ডায়নামিক): fid S287TESTA → 2026-09-15, source='qa-s287'
   ক্লিনে এ-১-দিয়েই DELETE (অন্য-সারি-স্পর্শ-শূন্য; s284/s286-মার্কার-অস্পৃশ্য)।
   ক্রম-গোটচা (session279-নোট): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক — পুরাতন-প্রসেসের
   graceful-shutdown-flush নিজের in-memory-কপি ফাইলে-ওভাররাইট করে (উল্টো-ক্রমে মার্কার-হারায়/ফের-আসে)। */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const SRC = 'qa-s287';
const MARKS = [{
  fid: 'S287TESTA',
  date: '2026-09-15',
  name: 's287-প্রোব-১',
  url: 'https://example.com/s287-a.pdf'
}];

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
  console.error('ব্যবহার: node scripts/s287-seedday.js seed|clean');
  process.exit(1);
})().catch((e) => { console.error('SEED-ERR:', e && e.message); process.exit(1); });
