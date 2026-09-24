#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   s307-seed-feed.js — session307 QA-সিডার: ফোন-ফিড বাস্তব-হাইড্রেশন টেস্ট-ডেটা
   **সার্ভার বন্ধ অবস্থায় চালান** (SIGTERM-save clobber-গোটচা — pkill -9; s280-নীতি)।
   Idempotent: username 's307qa%' মার্কার-ইউজার থাকলে skip; --clean = মার্কার-সারি-বিলোপ
   (পোস্ট + ইউজার — net-zero ×৩-অ্যাসার্ট-উপযোগী)।
   ২-ইউজার + ৬-পোস্ট: পাঁচ-মিনিট→দুই-ঘণ্টা ব্যবধানে published_at (সর্ব-নতুন →
   LIMIT 8-হাইড্রেশনে অগ্রাধিকার), ১-টি cover_image-যুক্ত (has-img পথ), ১-টি HTML-বডি
   (strip-পথ), excerpt-বহু / বডি-বহু মিশ্র। কাউন্টার-বৈচিত্র্য = বাংলা-সংখ্যা-রেন্ডার-যাচাই।
   ব্যবহার: node scripts/s307-seed-feed.js [lekhok.db-পাথ] [--clean]
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const bcryptjs = require('bcryptjs');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..', 'lekhok.db'));
const CLEAN = process.argv.includes('--clean');

const agoMin = (m) => new Date(Date.now() - m * 60000).toISOString().slice(0, 19).replace('T', ' ');

const USERS = [
  { u: 's307qa01', full: 'কিউএ লেখক এক', pen: 'কলম-কিউএ-১' },
  { u: 's307qa02', full: 'কিউএ লেখক দুই', pen: '' } // pen_name-শূন্য → full_name-ফলব্যাক-পথ
];

const POSTS = [
  { a: 1, title: 's307কিউএ — নদীর গল্প পুনঃপাঠ', excerpt: 'সেশন-৩০৭-কিউএ হাইড্রেশন নিয়ন্ত্রণ-সারি এক — সর্বশেষ পোস্ট (৫ মিনিট)।', body: '', like: 210, cmt: 32, view: 512, img: 's307qa-cover.png', min: 5 },
  { a: 2, title: 's307কিউএ — কুইজ-জয়ের দিন', excerpt: 'সেশন-৩০৭-কিউএ সারি দুই — এক্সসার্প্ট-পথ (১২ মিনিট)।', body: '', like: 128, cmt: 24, view: 340, img: null, min: 12 },
  { a: 1, title: 's307কিউএ — সম্পাদকীয় পাতা', excerpt: '', body: 'সেশন-৩০৭-কিউএ সারি তিন — বডি-ফলব্যাক-পথ (২০ মিনিট)। ই-পেপারের সম্পাদকীয় পড়তে হবে সবাইকে।', like: 96, cmt: 18, view: 280, img: null, min: 20 },
  { a: 2, title: 's307কিউএ — নবীন-বরণ গ্যালারি', excerpt: 'সেশন-৩০৭-কিউএ সারি চার (৩৫ মিনিট)।', body: '', like: 74, cmt: 11, view: 190, img: null, min: 35 },
  { a: 1, title: 's307কিউএ — ছন্দ নাকি ভাব', excerpt: 'সেশন-৩০৭-কিউএ সারি পাঁচ — জনপ্রিয়তা-সর্ট-শীর্ষ (engagement সর্বোচ্চ)।', body: '', like: 153, cmt: 47, view: 460, img: null, min: 60 },
  { a: 2, title: 's307কিউএ — ডায়েরি চ্যালেঞ্জ', excerpt: '', body: '<p>সেশন-৩০৭-কিউএ সারি ছয় — HTML-বডি strip-পথ (১২০ মিনিট)।</p>', like: 88, cmt: 15, view: 210, img: null, min: 120 }
];

initSqlJs().then(function (SQL) {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const all = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; };
  const run = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); st.step(); st.free(); };

  // পূর্ব-শর্ত: audience-কলাম (migrate-পূর্বক — LATER_COLUMNS-চুক্তি)
  const cols = all('PRAGMA table_info(posts)').map(function (c) { return c.name; });
  if (!cols.includes('audience')) {
    console.error('FATAL: posts.audience-কলাম নেই — আগে node db/migrate.js চালান');
    process.exit(1);
  }

  if (CLEAN) {
    const bp = all("SELECT id FROM posts WHERE title LIKE 's307কিউএ%'").length;
    run("DELETE FROM posts WHERE title LIKE 's307কিউএ%' OR author_id IN (SELECT id FROM users WHERE username LIKE 's307qa%')");
    const bu = all("SELECT id FROM users WHERE username LIKE 's307qa%'").length;
    run("DELETE FROM users WHERE username LIKE 's307qa%'");
    const ap = all("SELECT id FROM posts WHERE title LIKE 's307কিউএ%'").length;
    const au = all("SELECT id FROM users WHERE username LIKE 's307qa%'").length;
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log('CLEAN ✓ (পোস্ট ' + bp + '→' + ap + '; ইউজার ' + bu + '→' + au + ')');
    return;
  }

  const existing = all("SELECT id FROM users WHERE username LIKE 's307qa%'").length;
  if (existing > 0) {
    console.log('SKIP ✓ (s307qa মার্কার-ইউজার ইতিমধ্যে ' + existing + ' — ইডেমপোটেন্ট-স্কিপ)');
    return;
  }

  const hash = bcryptjs.hashSync('s307qa-no-login-qa-only', 8);
  run("INSERT INTO users (username, email, password_hash, full_name, pen_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'user', 'active', CURRENT_TIMESTAMP)",
    USERS[0].u, 's307qa01@qa.invalid', hash, USERS[0].full, USERS[0].pen);
  run("INSERT INTO users (username, email, password_hash, full_name, pen_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'user', 'active', CURRENT_TIMESTAMP)",
    USERS[1].u, 's307qa02@qa.invalid', hash, USERS[1].full, USERS[1].pen);
  const uid = {};
  all("SELECT id, username FROM users WHERE username LIKE 's307qa%'").forEach(function (r) { uid[r.username] = r.id; });

  POSTS.forEach(function (p) {
    run("INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, category, status, like_count, comment_count, view_count, audience, published_at, created_at) VALUES (?, 'article', ?, ?, ?, ?, 'general', 'published', ?, ?, ?, 'PUBLIC', ?, ?)",
      uid[p.a === 1 ? 's307qa01' : 's307qa02'], p.title, p.body || '', p.excerpt || '', p.img, p.like, p.cmt, p.view, agoMin(p.min), agoMin(p.min));
  });

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('SEED ✓ (ইউজার ২ + পোস্ট ' + POSTS.length + ' — s307কিউএ মার্কার)');
});
