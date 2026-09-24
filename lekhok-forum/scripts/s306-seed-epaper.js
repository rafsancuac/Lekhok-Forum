#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   s306-seed-epaper.js — session306 QA-সিডার: epaper_files.page_count-ব্যাজ-টেস্ট-ডেটা
   **সার্ভার বন্ধ অবস্থায় চালান** (SIGTERM-save clobber-গোটচা — pkill -9; s280-নীতি)।
   Idempotent: source='s306-qa' মার্কার-সারি থাকলে skip; --clean = মার্কার-সারি-বিলোপ।
   ব্যবহার: node scripts/s306-seed-epaper.js [lekhok.db-পাথ] [--clean]
   ৩-সারি page_count-যুক্ত (৫২/১২/৮) — s280-মার্কার-সারি (page_count-শূন্য) ব্যাজ-অনুপস্থিত-
   পথের নিয়ন্ত্রণ-দল হিসেবে থাকে। fid FAKE-ফরম্যাট-বৈধ (লোকাল-অফলাইনে iframe-ফলব্যাক)।
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..', 'lekhok.db'));
const CLEAN = process.argv.includes('--clean');

const dhakaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

// সেশন-৩২৪-সংশোধন: ৩-কন্ট্রোল-সারি (page_count-NULL — ব্যাজ-বিহীন-দল) dhakaToday-তারিখেই —
//   তারিখ-রোলওভার-টাইম-বোম্ব-নিরসন (s280-সারির-হার্ডকোডেড-তারিখ গতকাল-হয়ে-গেলে today-গ্রুপে
//   ব্যাজ-বিহীন-দল-শূন্য হত — s306-suite-ব্যর্থতা ×২-প্রমাণিত); কন্ট্রোল = নিজস্ব-মার্কারে —
//   s280-নির্ভরতা-শূন্য, --clean-এ-সর্ব-বিলোপ (নেট-শূন্য-অটুট)।
const ROWS = [
  { date: dhakaToday, name: 's306কিউএ প্রথম আলো', fid: 's306fakepaper01A', pages: 52 },
  { date: dhakaToday, name: 's306কিউএ ইত্তেফাক', fid: 's306fakepaper02B', pages: 12 },
  { date: dhakaToday, name: 's306কিউএ কালবেলা', fid: 's306fakepaper03C', pages: 8 },
  { date: dhakaToday, name: 's306কিউএ যুগান্তর', fid: 's306fakepaper04D', pages: null },
  { date: dhakaToday, name: 's306কিউএ নয়া দিগন্ত', fid: 's306fakepaper05E', pages: null },
  { date: dhakaToday, name: 's306কিউএ ভোরের কাগজ', fid: 's306fakepaper06F', pages: null }
];

initSqlJs().then(function (SQL) {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const all = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; };
  const run = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); st.step(); st.free(); };

  // পূর্ব-শর্ত: page_count-কলাম বিদ্যমান (migrate-পূর্বক — s306-patch + migrate-চুক্তি)
  const cols = all('PRAGMA table_info(epaper_files)').map(function (c) { return c.name; });
  if (!cols.includes('page_count')) {
    console.error('FATAL: epaper_files.page_count-কলাম নেই — আগে node db/migrate.js চালান');
    process.exit(1);
  }

  if (CLEAN) {
    const before = all("SELECT id FROM epaper_files WHERE source = 's306-qa'").length;
    run("DELETE FROM epaper_files WHERE source = 's306-qa'");
    const after = all("SELECT id FROM epaper_files WHERE source = 's306-qa'").length;
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log('CLEAN ✓ (মুছে গেছে ' + before + ' সারি; অবশিষ্ট ' + after + ')');
    return;
  }

  const existing = all("SELECT id FROM epaper_files WHERE source = 's306-qa'").length;
  if (existing > 0) {
    console.log('SKIP ✓ (s306-qa মার্কার-সারি ইতিমধ্যে ' + existing + ' — ইডেমপোটেন্ট-স্কিপ)');
    return;
  }

  let n = 0;
  for (const r of ROWS) {
    run("INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, ?, NULL, ?, 's306-qa', 1)",
      r.date, r.name, 'https://drive.google.com/file/d/' + r.fid + '/view', r.fid, r.pages);
    n++;
  }
  const total = all("SELECT id FROM epaper_files WHERE source = 's306-qa'").length;
  const withPages = all("SELECT id FROM epaper_files WHERE source = 's306-qa' AND page_count >= 1").length;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('SEED ✓ (যোগ ' + n + '; মোট ' + total + '; page_count-যুক্ত ' + withPages + ')');
}).catch(function (e) { console.error('FATAL:', e.message); process.exit(1); });
