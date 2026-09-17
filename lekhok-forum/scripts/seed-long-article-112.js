#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   সেশন ১১২: দীর্ঘ QA-লেখা সিডার — 'পড়া চালিয়ে যান' উইজেট E2E-র জন্য
   ───────────────────────────────────────────────────────────────────────
   কেন: বিদ্যমান সিড-লেখাগুলো ৩৭–৪৯ অক্ষরের হাসি-খর্ব — article-body উচ্চতা
   এত ছোট যে স্ক্রল-রেশিও সবসময় ১.০-এ পৌঁছে যায় → মাঝ-পথে পড়ার অবস্থান
   (lf_read_pos) কখনো সংরক্ষিত-ই হয় না। দীর্ঘ লেখা ছাড়া নতুন উইজেটের
   সেভ-পথ E2E সম্ভব নয়।

   তৈরি করে (idempotent — একই title থাকলে বাদ):
     • md_rafsan-এর নামে ~৪০০০+ অক্ষরের প্রকাশিত লেখা (## হেডিংসহ — TOC টেস্ট-বোনাস)

   ⚠️ অবশ্যই **সার্ভার বন্ধ অবস্থায়** চালান — চলমান সার্ভারের ইন-মেমরি DB
      শাটডাউন-সেভে এই সিড মুছে ফেলে (last-writer-wins)।

   ব্যবহার: node scripts/seed-long-article-112.js [lekhok.db-পাথ]
   ═══════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lekhok.db'));
const TITLE = 'চর্চার দীর্ঘ পথে: একটি লেখার পরিপক্বতা কীভাবে মাপা যায় (QA-১১২)';

(async () => {
  if (!fs.existsSync(DB_PATH)) { console.error('DB পাওয়া যায়নি: ' + DB_PATH); process.exit(1); }
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));

  const dup = db.exec("SELECT id FROM posts WHERE title = '" + TITLE.replace(/'/g, "''") + "' LIMIT 1");
  if (dup.length) { console.log('আগেই আছে (id=' + dup[0].values[0][0] + ') — বাদ'); process.exit(0); }

  const author = db.exec("SELECT id FROM users WHERE username = 'md_rafsan' LIMIT 1");
  if (!author.length) { console.error('md_rafsan পাওয়া যায়নি — আগে seed-qa-users চালান'); process.exit(1); }
  const authorId = author[0].values[0][0];

  /* ~৪২০০ অক্ষরের বাংলা প্রবন্ধ — ৫টি ## অংশ (TOC ≥৩ শর্ত পূরণ) */
  const para = 'লেখা একটি শরীর — প্রথম খসড়া তার কঙ্কাল, সম্পাদনা তার পেশি, আর পাঠকের সময় তার প্রাণবায়ু। ';
  const body = [
    '## ভূমিকা: কেন দৈর্ঘ্য প্রশ্ন হয়ে ওঠে',
    para.repeat(6),
    '## পাঠকের সময়: অদৃশ্য মুদ্রা',
    para.repeat(6),
    '## খসড়া থেকে প্রকাশ: পরিপক্বতার পাঁচ সিঁড়ি',
    para.repeat(6),
    '## প্রতিক্রিয়া পড়া: শুধু সংখ্যা নয়',
    para.repeat(6),
    '## উপসংহার: লেখকও এক পাঠক',
    para.repeat(6)
  ].join('\n\n');

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  db.run(
    "INSERT INTO posts (author_id, type, title, body, excerpt, tags, category, status, featured, view_count, like_count, comment_count, reactions, published_at, created_at, share_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [authorId, 'article', TITLE, body, 'পাঠকের সময় ও লেখকের ধৈর্য — দীর্ঘ-প্রবন্ধ QA-সিড (সেশন ১১২)', 'চর্চা,লেখালেখা', 'সাহিত্য', 'published', 0, 3, 0, 0, '{}', now, now, 0]
  );
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  const newId = db.exec("SELECT id FROM posts WHERE title = '" + TITLE.replace(/'/g, "''") + "'");
  console.log('সিড-হয়েছে: posts.id=' + newId[0].values[0][0] + ' · body=' + body.length + ' অক্ষর');
})().catch(e => { console.error(e); process.exit(1); });
