#!/usr/bin/env node
/* s284-seedyear.js — session284 সুইট-হেল্পার: বহু-বছর epaper_files-মার্কার-সিড/ক্লিন
   (s281-seedpaper-মডেল; s272 marker-seed-নেট-শূন্য-চুক্তি)
   ব্যবহার: node scripts/s284-seedyear.js seed | clean
   মার্কার ×২ (স্থির-তারিখ — বছর-তালিকায় ≥২-বছর-গ্যারান্টি):
     A: 2026-03-15  drive_file_id='S284TESTA'  source='qa-s284'
     B: 2025-11-20  drive_file_id='S284TESTB'  source='qa-s284'
   ক্লিনে এ-জোড়া-দিয়েই DELETE (অন্য-সারি-স্পর্শ-শূন্য)।
   ক্রম-গোটচা (session279-নোট): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক — পুরাতন-প্রসেসের
   graceful-shutdown-flush নিজের in-memory-কপি ফাইলে-ওভাররাইট করে (উল্টো-ক্রমে মার্কার-হারায়/ফের-আসে)। */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const MARKS = [
  { fid: 'S284TESTA', date: '2026-03-15', name: 's284-প্রোব-ক', url: 'https://example.com/s284-a.pdf' },
  { fid: 'S284TESTB', date: '2025-11-20', name: 's284-প্রোব-খ', url: 'https://example.com/s284-b.pdf' }
];
const SRC = 'qa-s284';

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
    const r = db.prepare("DELETE FROM epaper_files WHERE source = ? AND drive_file_id IN (?,?)").run(SRC, MARKS[0].fid, MARKS[1].fid);
    db.saveDb();
    const total = db.prepare("SELECT COUNT(*) AS c FROM epaper_files WHERE source = ?").all(SRC)[0].c;
    console.log('CLEAN-OK deleted=' + (r.changes || 0) + ' residual=' + total);
    process.exit(0);
  }
  console.error('ব্যবহার: node scripts/s284-seedyear.js seed|clean');
  process.exit(1);
})().catch((e) => { console.error('SEED-ERR:', e && e.message); process.exit(1); });
