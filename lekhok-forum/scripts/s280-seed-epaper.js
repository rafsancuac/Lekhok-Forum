#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   s280-seed-epaper.js — session280 QA-সিডার: epaper_files ৩-প্যানেল-টেস্ট-ডেটা
   **সার্ভার বন্ধ অবস্থায় চালান** (SIGTERM-save clobber-গোটচা — pkill -9)।
   Idempotent: source='s280-qa' মার্কার-সারি থাকলে skip; --clean = মার্কার-সারি-বিলোপ।
   ব্যবহার: node scripts/s280-seed-epaper.js [lekhok.db-পাথ] [--clean]
   ফিড fid = FAKE ফরম্যাট-বৈধ (epaperFidValid-অতিক্রম) — লোকাল-অফলাইনে ড্রাইভ-ফেচ
   ব্যর্থ হবেই → রিডার iframe-ফলব্যাক + রেল-খালি-অবস্থা (সুইট সেটাই অ্যাসার্ট করে)।
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..', 'lekhok.db'));
const CLEAN = process.argv.includes('--clean');

// ঢাকা-আজ (en-CA) — সিড-তারিখ প্রতি-রানে তাজা (ক্যালেন্ডার-আজ-রিং/ডট অ্যাসার্টের জন্য)
const dhakaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dhakaYesterday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' })
  .format(new Date(Date.now() - 24 * 3600 * 1000));

const ROWS = [
  { date: dhakaToday, name: 's280কিউএ প্রথম আলো', fid: 's280fakepaper01A' },
  { date: dhakaToday, name: 's280কিউএ ইত্তেফাক', fid: 's280fakepaper02B' },
  { date: dhakaToday, name: 's280কিউএ কালবেলা', fid: 's280fakepaper03C' },
  { date: dhakaYesterday, name: 's280কিউএ প্রথম আলো', fid: 's280fakepaper04D' },
  { date: dhakaYesterday, name: 's280কিউএ যুগান্তর', fid: 's280fakepaper05E' }
];

initSqlJs().then(function (SQL) {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const all = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; };
  const run = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); st.step(); st.free(); };

  if (CLEAN) {
    const before = all("SELECT id FROM epaper_files WHERE source = 's280-qa'").length;
    run("DELETE FROM epaper_files WHERE source = 's280-qa'");
    const after = all("SELECT id FROM epaper_files WHERE source = 's280-qa'").length;
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log('CLEAN ✓ (মুছে গেছে ' + before + ' সারি; অবশিষ্ট ' + after + ')');
    return;
  }

  const existing = all("SELECT id FROM epaper_files WHERE source = 's280-qa'");
  if (existing.length >= ROWS.length) {
    console.log('SKIP: s280-qa-সারি ' + existing.length + 'টি আগে-থেকেই-আছে');
    return;
  }
  // পুরনো-তারিখ-সারি থাকলেও আজকের-তারিখ-সারি সিড-করা দরকার (তারিখ-তাজা-রাখতে)
  run("DELETE FROM epaper_files WHERE source = 's280-qa'");
  ROWS.forEach(function (r) {
    run("INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, source, published) VALUES (?, ?, ?, ?, 's280-qa', 1)",
      r.date, r.name, 'https://drive.google.com/file/d/' + r.fid + '/view', r.fid);
  });
  const n = all("SELECT id FROM epaper_files WHERE source = 's280-qa'").length;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('SEED ✓ (s280-qa-সারি ' + n + 'টি; আজ=' + dhakaToday + ' গতকাল=' + dhakaYesterday + ')');
}).catch(function (e) { console.error('FATAL:', e.message); process.exit(1); });
