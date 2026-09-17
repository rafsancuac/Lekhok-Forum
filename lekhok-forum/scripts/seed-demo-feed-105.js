#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   সেশন ১০৫: ডেমো-ফিড সিডার — ডিজাইন-সিস্টেম E2E-QA-র জন্য
   ───────────────────────────────────────────────────────────────────────
   **সার্ভার বন্ধ অবস্থায়** চালান (SIGTERM-save clobber-গোটচা — pkill -9)।
   Idempotent: existing-টাইটেল পেলে skip।
   ব্যবহার: node scripts/seed-demo-feed-105.js [lekhok.db-পাথ]
   ═══════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lekhok.db'));

const POSTS = [
  { handle: 'md_rafsan', type: 'article', title: 'চট্টগ্রামের বর্ষা ও আমাদের ক্যাম্পাস-দিনগুলো', body: 'বর্ষা এলেই ক্যাম্পাস বদলে যায় — শিউলি-পুকুরের ধারে বৃষ্টির ফোঁটা, টং-এ চা আর তর্ক।\n\n> এই গল্পগুলো লিখে রাখা দরকার ছিল।\n\nপ্রথম বর্ষে ডরমেটরির ছাদে বৃষ্টি ভেজা সেই সন্ধ্যার কথা আজও মনে পড়ে।', tags: 'বর্ষা,ক্যাম্পাস,স্মৃতি' },
  { handle: 'jannatul_sayma', type: 'article', title: 'কলমে-নামে লেখা শুরু করার গল্প', body: 'ছদ্মনাম নিয়ে অনেকে দ্বিধায় থাকেন। আমার মতে কলমে-নাম একটা স্বাধীনতা — যেখানে ভয় না পেয়ে সত্যিটা লেখা যায়।', tags: 'লেখালেখি,কলমী-নাম' },
  { handle: 'murad_hossen', type: 'question', title: 'প্রথম কবিতা প্রকাশের আগে কী কী মাথায় রাখা উচিত?', body: 'নতুন লেখক হিসেবে প্রথম কবিতা প্রকাশ করতে চাই — সংশোধন, সম্পাদনা নাকি প্রথমে পাঠক-ফিডব্যাক?', tags: 'কবিতা,প্রশ্ন' }
];

const COMMENTS = [
  { post: 0, handle: 'akij_mahmud', body: 'শিউলি-পুকুরের বৃষ্টিটা একেবারে চোখের সামনে ভেসে উঠলো — **দুর্দান্ত** লেখা!' },
  { post: 0, handle: 'riya', body: 'ছাদের সেই সন্ধ্যার কথা আমারও মনে আছে 😄', replyTo: 0 },
  { post: 1, handle: 'rabby_hasan', body: 'কলমে-নামের স্বাধীনতার কথাটা মনে গাঁথা হয়ে গেল।' }
];

initSqlJs().then(function (SQL) {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const q1 = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const row = st.step() ? st.getAsObject() : null; st.free(); return row; };
  const all = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; };
  const run = function (sql, ...a) { const st = db.prepare(sql); st.bind(a); st.step(); st.free(); };

  let made = 0;
  const postIds = [];
  POSTS.forEach(function (p, i) {
    const ex = q1('SELECT id FROM posts WHERE title = ?', p.title);
    if (ex) { postIds[i] = ex.id; return; }
    const u = q1('SELECT id FROM users WHERE username = ?', p.handle);
    if (!u) { postIds[i] = null; return; }
    run("INSERT INTO posts (author_id, type, title, body, tags, status, published_at, like_count, comment_count, view_count, share_count) VALUES (?, ?, ?, ?, ?, 'published', datetime('now', '-' || ? || ' days'), 0, 0, 0, 0)",
      u.id, p.type, p.title, p.body, p.tags, i + 1);
    const row = q1('SELECT id FROM posts WHERE title = ?', p.title);
    postIds[i] = row && row.id;
    made++;
  });

  let cmade = 0;
  const commentIds = [];
  COMMENTS.forEach(function (c) {
    const pid = postIds[c.post];
    if (!pid) return;
    const u = q1('SELECT id FROM users WHERE username = ?', c.handle);
    if (!u) return;
    const dup = q1('SELECT id FROM comments WHERE post_id = ? AND author_id = ? AND body = ?', pid, u.id, c.body);
    if (dup) { commentIds[COMMENTS.indexOf(c)] = dup.id; return; }
    const parentId = (c.replyTo !== undefined && commentIds[c.replyTo]) ? commentIds[c.replyTo] : null;
    run("INSERT INTO comments (post_id, author_id, body, parent_id, created_at) VALUES (?, ?, ?, ?, datetime('now'))", pid, u.id, c.body, parentId);
    const row = q1('SELECT id FROM comments WHERE post_id = ? AND author_id = ? AND body = ?', pid, u.id, c.body);
    commentIds[COMMENTS.indexOf(c)] = row && row.id;
    run('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', pid);
    cmade++;
  });

  // রিঅ্যাকশন — বাঁধা-সংখ্যক (কাউন্টার-বার/ব্যাজ/মডাল QA)
  const RX = [['md_rafsan', 'like'], ['jannatul_sayma', 'love'], ['akij_mahmud', 'like'], ['rabby_hasan', 'wow'], ['riya', 'love'], ['tawhida_akter', 'like'], ['ayesha_siddika_anny', 'haha'], ['mushfiqur_emon', 'sad']];
  let rxmade = 0;
  RX.forEach(function (r) {
    const u = q1('SELECT id FROM users WHERE username = ?', r[0]);
    if (!u) return;
    postIds.forEach(function (pid) {
      if (!pid) return;
      const ex = q1('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', u.id, pid);
      if (ex) return;
      run("INSERT INTO likes (user_id, post_id, reaction_type, created_at) VALUES (?, ?, ?, datetime('now'))", u.id, pid, r[1]);
      rxmade++;
    });
  });
  // কমেন্ট-লাইক (প্রথম কমেন্টে)
  const c0 = commentIds[0];
  if (c0) {
    [['jannatul_sayma', 'like'], ['rabby_hasan', 'love'], ['riya', 'like']].forEach(function (r) {
      const u = q1('SELECT id FROM users WHERE username = ?', r[0]);
      if (!u) return;
      const ex = q1('SELECT id FROM likes WHERE user_id = ? AND comment_id = ?', u.id, c0);
      if (ex) return;
      run("INSERT INTO likes (user_id, comment_id, reaction_type, created_at) VALUES (?, ?, ?, datetime('now'))", u.id, c0, r[1]);
      run('UPDATE comments SET like_count = like_count + 1 WHERE id = ?', c0);
    });
  }
  // like_count ক্যালিব্রেশন
  run("UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)");

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('[seed105] posts=' + made + ' comments=' + cmade + ' reactions=' + rxmade + ' — done');
}).catch(function (e) { console.error(e); process.exit(1); });
