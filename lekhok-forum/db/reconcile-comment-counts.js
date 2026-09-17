// সেশন ১১৯ — posts.comment_count রিকনসিল (idempotent মেইনটেন্যান্স)
//
// বাগ-প্রমাণ (লোকাল QA-DB): posts.id=1 কলামে comment_count=২, বাস্তবে ০
// (প্রাচীন-যুগের হারানো-কমেন্ট/অরফান-ক্লিনআপে কাউন্টার বাসি হয়ে ছিল; বর্তমান
// DELETE-পাথগুলো সিঙ্ক করলেও পুরনো-ক্ষত থেকে যেত)।
//
// এই স্ক্রিপ্ট: প্রতিটি পোস্টের comment_count-কে comments-টেবিলের প্রকৃত-সারির
// সাথে মিলিয়ে দেয় — শুধু অসঙ্গত-রো আপডেট হয় (idempotent: দ্বিতীয়বার চালালে ০)।
//
// চালানো: node db/reconcile-comment-counts.js [db-path]
// (ডিফল্ট: lekhok-forum/lekhok.db — server.js-এর মতো একই ফাইল)
'use strict';
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

(async () => {
  const dbPath = process.argv[2] || path.join(__dirname, '..', 'lekhok.db');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(dbPath));

  const rows = db.exec(`
    SELECT p.id, p.comment_count AS stored,
           (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS actual
    FROM posts p
    WHERE p.comment_count != (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)
  `)[0];

  if (!rows) {
    console.log('[reconcile] সব পোস্টের comment_count সঙ্গতিপূর্ণ — কিছু করার নেই।');
    return;
  }

  let fixed = 0;
  for (const [id, stored, actual] of rows.values) {
    db.prepare('UPDATE posts SET comment_count = ? WHERE id = ?').run([actual, id]);
    console.log(`[reconcile] posts.id=${id}: ${stored} → ${actual}`);
    fixed++;
  }
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  console.log(`[reconcile] সম্পন্ন — ${fixed} রো সংশোধিত (${dbPath})`);
})().catch(e => { console.error('[reconcile] ব্যর্থ:', e.message); process.exit(1); });
