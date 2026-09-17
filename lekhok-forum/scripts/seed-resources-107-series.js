#!/usr/bin/env node
/**
 * scripts/seed-resources-107-series.js — সেশন ১০৭: রিসোর্স সিরিজ/সংকলন ডেমো-সিড।
 *
 * কী করে:
 *  ডেমো-রিসোর্সগুলোকে (seed-resources-101 দ্বারা সৃষ্ট) "নবীন লেখক কর্মশালা" সিরিজে
 *  যুক্ত করে — শুধু নির্দিষ্ট শিরোনামের রো এবং শুধু series ফাঁকা হলে (ইউজারের নিজের
 *  রিসোর্স ও আগে-থেকে-সিরিজযুক্ত রো অক্ষত; দ্বিতীয়বার চালালে কিছুই বদলায় না)।
 *
 * ⚠️ সার্ভার **বন্ধ** অবস্থায় চালাতে হবে (sql.js in-memory DB ফাইল-সিড ওভাররাইট করে)।
 *    চালানো: node scripts/seed-resources-107-series.js
 */
process.env.DB_BACKEND = process.env.DB_BACKEND || 'sqljs';
const db = require('../db.js');

// [শিরোনাম-ম্যাচ, পর্ব-ক্রম] — ডেমো-সেটের তিনটি মাল্টিমিডিয়া-রিসোর্স
const ASSIGN = [
  ['কবিতা লেখার কৌশল', 1],               // pdf
  ['অডিও পাঠচক্র: রবীন্দ্রনাথের কবিতা', 2], // audio
  ['কর্মশালা: ছোটগল্পের কাঠামো', 3],       // video (ইউটিউব)
];
const SERIES = 'নবীন লেখক কর্মশালা';

(async () => {
  try {
    await db.initDb();
    await new Promise(r => setTimeout(r, 3500)); // initDb-এর ট্রেলিং async-সিড শেষ হওয়া পর্যন্ত অপেক্ষা
    let n = 0;
    for (const [title, order] of ASSIGN) {
      const row = await db.prepare('SELECT id, series FROM resources WHERE title = ?').get(title);
      if (!row) { console.log('  ~ নেই (স্কিপ):', title); continue; }
      if (row.series && String(row.series).trim()) { console.log('  ~ ইতিমধ্যে সিরিজযুক্ত (স্কিপ): id', row.id, '→', row.series); continue; }
      await db.prepare('UPDATE resources SET series = ?, series_order = ? WHERE id = ?').run(SERIES, order, row.id);
      console.log('  + সিরিজযুক্ত: id', row.id, '→', SERIES, '#', order, '(' + title + ')');
      n++;
    }
    await db.saveDb(); await db.flushDb();
    console.log('সম্পন্ন — যুক্ত:', n, '· সিরিজ:', SERIES);
    process.exit(0);
  } catch (e) {
    console.error('seed-107 error:', e);
    process.exit(1);
  }
})();
