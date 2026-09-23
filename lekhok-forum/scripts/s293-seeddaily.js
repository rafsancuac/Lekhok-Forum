#!/usr/bin/env node
/* s293-seeddaily.js — session293 সুইট-হেল্পার: daily_content মার্কার-সিড/ক্লিন (s272/s281/s292 net-zero চুক্তি)
   ব্যবহার: node scripts/s293-seeddaily.js seed | clean
   ক্রম-গোটচা (session279): সিড/ক্লিনের-আগে চলমান-সার্ভার কিল-বাধ্যতমূলক (graceful-flush-উল্টো-লেখা)।
   মার্কার: title LIKE 'qa293-%' — ক্লিনে একক-প্যাটার্ন DELETE (অন্য-সারি-স্পর্শ-শূন্য)।
   কেন-DB-সিড (POST-নয়): POST /admin/daily published=1-এ broadcastToAll-নোটিফিকেশন (s274/s277-চুক্তি —
   মার্কার-সিড-ই২ই-নিষিদ্ধ) → DB-সরাসরি-সিড; published=0+1 দুই-শাখাই-বিনা-বিজ্ঞপ্তিতে।
   সিড-৩-সারি: quiz/প্রকাশিত + activity/খসড়া + this_day/প্রকাশিত (দুই-ধরন-দুই-স্ট্যাটাস-ফ্যাসেট-লাইভ) */
const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

const MODE = process.argv[2] || '';
const ROWS = [
  { type: 'quiz', title: 'qa293-কুইজ-প্রোব', body: 'qa293-কুইজ-মার্কার-বডি', pub: 1 },
  { type: 'activity', title: 'qa293-কার্যক্রম-খসড়া', body: 'qa293-কার্যক্রম-মার্কার-বডি', pub: 0 },
  { type: 'this_day', title: 'qa293-এইদিন-প্রোব', body: 'qa293-এইদিন-মার্কার-বডি', pub: 1 }
];

function dhakaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

(async () => {
  await db.initDb();
  if (MODE === 'seed') {
    const today = dhakaToday();
    let seeded = 0;
    for (const r of ROWS) {
      const ex = db.prepare('SELECT id FROM daily_content WHERE title = ?').all(r.title);
      if (ex.length) { seeded++; continue; }
      db.prepare('INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, published, author_id, options, answer) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .run(r.type, r.title, r.body, null, null, today, r.pub, null, null, null);
      seeded++;
    }
    db.saveDb();
    const n = db.prepare("SELECT COUNT(*) AS c FROM daily_content WHERE title LIKE 'qa293-%'").all()[0].c;
    console.log('SEED-OK count=' + n);
    process.exit(0);
  } else if (MODE === 'clean') {
    const res = db.prepare("DELETE FROM daily_content WHERE title LIKE 'qa293-%'").run();
    db.saveDb();
    console.log('CLEAN-OK deleted=' + (res.changes || 0));
    process.exit(0);
  } else {
    console.log('ব্যবহার: node scripts/s293-seeddaily.js seed|clean');
    process.exit(1);
  }
})().catch((e) => { console.error('SEED-ERR', e && e.message); process.exit(1); });
