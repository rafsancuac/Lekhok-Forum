#!/usr/bin/env node
/**
 * scripts/seed-resources-100.js — সেশন ১০০: রিসোর্স মাল্টিমিডিয়া-আপগ্রেড সিড।
 *
 * কী করে:
 *  1. db.initDb() → বুট-মাইগ্রেশন চালায় (resources-এ file_size/duration/thumbnail_url/
 *     views/downloads কলাম — LATER_COLUMNS)।
 *  2. পুরনো ডেমো-রিসোর্সগুলোকে মিক্সড-মিডিয়াতে আপডেট করে (শুধু ফাঁকা file_url/file_type
 *     রোগুলোতে — ইউজারের নিজের যোগ করা রিসোর্স অক্ষত থাকে)।
 *  3. resources টেবিল খালি হলে সম্পূর্ণ ডেমো-সেট বসায়।
 *
 * ⚠️ সার্ভার **বন্ধ** অবস্থায় চালাতে হবে (চালু সার্ভারের ইন-মেমরি DB ফাইল-সিড ওভাররাইট করে)।
 *    চালানো: node scripts/seed-resources-100.js
 */
const fs = require('fs');
const path = require('path');

// ── ডেমো ফাইলের অস্তিত্ব যাচাই-সহ আপডেট-ম্যাপ ──
const RES_DIR = path.join(__dirname, '..', 'public', 'uploads', 'resources');
const exists = (f) => { try { return fs.existsSync(path.join(RES_DIR, f)); } catch (e) { return false; } };

const UPDATES = [
  // [title-match, file_type, file_url, file_size, duration]
  ['কবিতা লেখার কৌশল',                       'pdf',   'lekhok-poetry-guide.pdf',        '1.2 MB', null],
  ['নবীন লেখকদের বানান রীতি নির্দেশিকা',       'pdf',   'lekhok-banana-nirdeshika.pdf',   '0.9 MB', null],
  ['অডিও পাঠচক্র: রবীন্দ্রনাথের কবিতা',         'audio', 'lekhok-audio-demo.wav',          '0.2 MB', '০১:০৫ মিনিট'],
  ['কর্মশালা: ছোটগল্পের কাঠামো',              'video', 'https://www.youtube.com/watch?v=aBcD3fGhIjK', null, '২২:৪৫ মিনিট'],
  ['ফেলোশিপ ও গবেষণা অনুদান',                 'link',  null, null, null],
  ['সাহিত্য-ইনফোগ্রাফিক: প্রকাশনার পথে',        'image', 'lekhok-infographic.png',         '0.3 MB', null],
  ['বার্ষিক প্রতিবেদন ২০২৫',                   'pdf',   'lekhok-annual-report.pdf',       '2.4 MB', null],
  ['সদস্যপদ ফর্ম',                            'pdf',   'lekhok-membership-form.pdf',     '0.5 MB', null]
];

async function main() {
  const db = require('../db');
  await db.initDb();

  const count = await db.prepare('SELECT COUNT(*) as c FROM resources').get();
  console.log('[res100] resources টেবিলে আছে:', (count && count.c) || 0, 'রো');

  let updated = 0, skipped = 0;
  for (const [titleMatch, type, file, size, dur] of UPDATES) {
    const fileUrl = file
      ? (file.startsWith('http') ? file : '/uploads/resources/' + file)
      : null;
    // ফাইল-বান্ডেল না থাকলে (নতুন clone) — স্কিপ, টাইপ-নির্ভর UI তবু কাজ করবে (লিংক-ফলব্যাক)
    if (file && !file.startsWith('http') && !exists(file)) { skipped++; continue; }

    const row = await db.prepare('SELECT id, file_url FROM resources WHERE title = ?').get(titleMatch);
    if (!row) { skipped++; continue; }
    if (row.file_url) { skipped++; continue; } // ইতিমধ্যে ফাইল আছে — অক্ষত রাখি
    await db.prepare('UPDATE resources SET file_type = ?, file_url = ?, file_size = ?, duration = ? WHERE id = ?')
      .run(type, fileUrl, size, dur, row.id);
    updated++;
  }
  console.log('[res100] আপডেট:', updated, '· স্কিপ:', skipped);

  // টেবিল খালি হলে মিনিমাল ডেমো-সেট (পাবলিক পেজ কখনো খালি না দেখায়)
  const c2 = await db.prepare('SELECT COUNT(*) as c FROM resources').get();
  if (!c2 || c2.c === 0) {
    const demo = [
      ['কবিতা লেখার কৌশল', 'কবিতা লেখার ধাপে-ধাপে নির্দেশনা — ছন্দ, উপমা ও প্রতীক।', 'guide', 'সম্পাদক', 'pdf', '/uploads/resources/lekhok-poetry-guide.pdf', '1.2 MB', null],
      ['অডিও পাঠচক্র: রবীন্দ্রনাথের কবিতা', 'নির্বাচিত কবিতার আবৃত্তি ও আলোচনা।', 'audio-lecture', 'সম্পাদক', 'audio', '/uploads/resources/lekhok-audio-demo.wav', '0.2 MB', '০১:০৫ মিনিট'],
      ['কর্মশালা: ছোটগল্পের কাঠামো', 'ছোটগল্পের কাঠামো নিয়ে কর্মশালার ভিডিও সেশন।', 'video-class', 'মাহফুজ রহমান', 'video', 'https://www.youtube.com/watch?v=aBcD3fGhIjK', null, '২২:৪৫ মিনিট'],
      ['ফেলোশিপ ও গবেষণা অনুদান', 'ফেলোশিপ ও গবেষণা অনুদানের তথ্যভাণ্ডার।', 'scholarship', 'প্রশাসন', 'link', 'https://www.banglaacademy.org.bd', null, null],
      ['বার্ষিক প্রতিবেদন ২০২৫', '২০২৫ সালের বার্ষিক প্রতিবেদন।', 'report', 'প্রশাসন', 'pdf', '/uploads/resources/lekhok-annual-report.pdf', '2.4 MB', null]
    ];
    for (const d of demo) {
      try {
        await db.prepare('INSERT INTO resources (title, content, category, author, tags, file_url, file_type, file_size, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(d[0], d[1], d[2], d[3], d[2], d[5], d[4], d[6], d[7]);
      } catch (e) {}
    }
    console.log('[res100] খালি টেবিল — ডেমো-সেট বসানো হয়েছে');
  }

  db.saveDb();
  console.log('[res100] ✓ saveDb() সম্পন্ন — এখন সার্ভার চালানো যাবে');
  process.exit(0);
}

main().catch((e) => { console.error('[res100] ব্যর্থ:', e.message); process.exit(1); });
