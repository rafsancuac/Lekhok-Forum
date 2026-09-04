#!/usr/bin/env node
/**
 * db/seed-content.js — Generate posts, images, likes, comments
 * for the remaining user(s) in the users table.
 *
 * Per user policy: We treat "Rafshan" (admin) and "মোঃ রাফছান" (user-created)
 * as content authors. Since they're the only accounts in the system,
 * posts will be authored by them and likes/comments will be self-engagement
 * (since there's nobody else to react). This simulates activity.
 *
 * For more realistic activity, add more user accounts via the registration
 * page (or via the Admin panel) and re-run this script with multi-user mode.
 *
 * Usage: node db/seed-content.js
 */

const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const db = new SQL.Database(fs.readFileSync(dbPath));

  function allRows(sql, params = []) {
    const out = [];
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    while (stmt.step()) out.push(stmt.getAsObject());
    stmt.free();
    return out;
  }

  function runSql(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    stmt.step();
    stmt.free();
  }

  // Find all active users to populate content for
  const users = allRows("SELECT id, username, full_name, role FROM users WHERE status = 'active' ORDER BY id");
  if (users.length === 0) {
    console.log('No users to seed content for. Run filter-users first or register users.');
    return;
  }
  console.log(`[seed-content] Generating content for ${users.length} user(s):`);
  users.forEach(u => console.log(`  - @${u.username} (${u.full_name}, role=${u.role})`));

  // ── Bengali post content ─────────────────────────────────────────────────
  // Mix of articles, Q&A, and activities. Each user gets ~6-10 posts.
  const articleTopics = [
    { title: 'শহরের ব্যস্ততা ও লেখালেখির অভিজ্ঞতা', body: 'শহরের কোলাহলে কান খাড়া করে শুনলে শব্দ নয়, কথা শোনা যায়। প্রতিটি রাস্তা যেন একটি গল্প বলে, প্রতিটি মুখ যেন একটি চরিত্র। লেখকের কলম এসব দৃশ্যকে শব্দে রূপ দেয়।', tags: 'লেখালেখি,শহুরে-জীবন,প্রেরণা', category: 'প্রবন্ধ' },
    { title: 'বাংলা কবিতায় আধুনিকতার ছোঁয়া', body: 'আধুনিক বাংলা কবিতায় ছন্দের বদলে এসেছে স্বাধীন ছন্দ। কবিরা এখন শব্দের বিদ্রোহে নতুন অর্থ খোঁজেন। রবীন্দ্রনাথ থেকে জসীমউদ্দীন, সুনীল থেকে মাহবুব-উল-আলম চৌধুরী—এই যাত্রা চলমান।', tags: 'কবিতা,আধুনিকতা,বাংলা-সাহিত্য', category: 'কবিতা' },
    { title: 'ফেসবুকের যুগে লেখক সমাজ', body: 'সোশ্যাল মিডিয়া এসেছে, কিন্তু লেখকের কলম থেমে নেই। বরং এখন লেখা ছড়ায় আরও বেশি। ব্লগ, ফেসবুক পোস্ট, ইনস্টাগ্রাম ক্যাপশন—সব জায়গায় সাহিত্যের ছোঁয়া।', tags: 'সোশ্যাল-মিডিয়া,লেখক,প্রযুক্তি', category: 'প্রবন্ধ' },
    { title: 'একটি অসমাপ্ত উপন্যাসের গল্প', body: 'কখনো কি এমন হয়েছে যে গল্পটা মাঝপথে থেমে গেছে? কলমটা হাতে নিলে কাল্পনিক পৃথিবী আবার জ্বলে ওঠে। অসমাপ্ত গল্পগুলোই অনেক সময় সবচেয়ে মর্মস্পর্শী।', tags: 'উপন্যাস,গল্প,অসমাপ্ত', category: 'গল্প' },
    { title: 'সকালের কাগজের সাথে এক কাপ চা', body: 'সকালবেলা কাগজের পাতা ওল্টানোর শব্দ, চায়ের কাপে বাষ্পের ঘূর্ণি—এটুকুই অনেকের প্রাত্যহিক রিচুয়াল। সংবাদের পাশাপাশি সাহিত্যের পাতাগুলোও পড়া দরকার।', tags: 'সকাল,চা,সংবাদপত্র,জীবন', category: 'এসোপ' },
    { title: 'ভাষা আন্দোলনের চেতনায় আমরা', body: '১৯৫২ সালের ভাষা আন্দোলন আমাদের মাতৃভাষার মর্যাদা রক্ষার শিক্ষা দিয়েছে। বাংলা ভাষা শুধু কথা বলার মাধ্যম নয়, এটি আমাদের সংস্কৃতির প্রাণ।', tags: 'ভাষা-আন্দোলন,বাংলা,ইতিহাস', category: 'প্রবন্ধ' },
    { title: 'নিঃসঙ্গ রাতের সঙ্গী এই কলম', body: 'রাতের নীরবতায় যখন পৃথিবী ঘুমিয়ে পড়ে, কলম তখন জেগে ওঠে। একা একা লেখার মধ্যে এক বিচিত্র তৃপ্তি আছে—নিজের সাথে নিজের আড্ডা।', tags: 'রাত,লেখা,নিঃসঙ্গতা', category: 'কবিতা' },
    { title: 'বৃষ্টির দিনে ছোটদের গল্প', body: 'আজ বৃষ্টি পড়ছে জানালার ওপর। বাচ্চারা জানালার ধারে বসে মেঘের রাজ্যে ঘুরে বেড়াচ্ছে কল্পনার ঘোড়ায়। আমি তাদের জন্য একটা নতুন গল্প বানালাম।', tags: 'বৃষ্টি,শিশু-সাহিত্য,গল্প', category: 'শিশু-সাহিত্য' }
  ];

  // Comment templates
  const commentTemplates = [
    'চমৎকার লেখা! পড়ে মন ভালো হয়ে গেল।',
    'এই বিষয়ে আরও লিখুন, অপেক্ষায় থাকব।',
    'সত্যিই অসাধারণ প্রকাশভঙ্গি।',
    'আপনার লেখার ধরন আমার খুব পছন্দ।',
    'এই গল্পটি আমাকে গভীরভাবে স্পর্শ করেছে।',
    'চালিয়ে যান, আপনার কলম থামবে না।',
    'আমি এই লেখাটি পড়ে অনেক কিছু শিখলাম।',
    'কখনো ভাবিনি এভাবে দেখা যায়!',
    'লেখাটির শেষটা একটু অন্যরকম হলে ভালো হতো।',
    'সময় নিয়ে পড়ার মতো লেখা।'
  ];

  // ── Seed posts ──────────────────────────────────────────────────────────────
  let postsCreated = 0;
  const postIds = [];

  users.forEach((u, idx) => {
    articleTopics.forEach((t, i) => {
      const slug = t.title.toLowerCase().replace(/[^\w\s-]/g, '').slice(0, 30);
      const excerpt = t.body.slice(0, 120) + '...';
      // Use picsum.photos seeded images for variety
      const seed = (u.id * 100 + i);
      const cover = `https://picsum.photos/seed/${seed}/800/400`;
      const reactions = JSON.stringify({ like: Math.floor(Math.random()*15)+1, love: Math.floor(Math.random()*8), haha: Math.floor(Math.random()*3), wow: Math.floor(Math.random()*2), sad: 0 });
      try {
        const stmt = db.prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, category, status, featured, view_count, like_count, comment_count, published_at, created_at, reactions)
                                  VALUES (?, 'article', ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`);
        stmt.run([
          u.id, t.title, t.body, excerpt, cover, t.tags, t.category,
          Math.floor(Math.random()*100)+10,  // view_count
          Math.floor(Math.random()*25)+2,    // like_count
          0,                                  // comment_count (updated after)
          reactions
        ]);
        stmt.free();
        const newId = db.exec('SELECT last_insert_rowid() as id')[0]?.values?.[0]?.[0];
        if (newId) postIds.push(newId);
        postsCreated++;
      } catch (e) {
        console.error('Insert post failed:', e.message);
      }
    });
  });
  console.log(`[seed-content] Created ${postsCreated} posts`);

  // ── Seed likes (per post) ───────────────────────────────────────────────
  let likesCreated = 0;
  postIds.forEach((pid, i) => {
    users.forEach(u => {
      // Each user has 70% chance to like each post
      if (Math.random() < 0.7) {
        const types = ['like', 'love', 'like', 'like', 'haha', 'wow', 'love'];
        const rt = types[Math.floor(Math.random() * types.length)];
        try {
          const stmt = db.prepare('INSERT INTO likes (user_id, post_id, reaction_type) VALUES (?, ?, ?)');
          stmt.run([u.id, pid, rt]);
          stmt.free();
          likesCreated++;
        } catch (e) { /* unique constraint */ }
      }
    });
  });
  console.log(`[seed-content] Created ${likesCreated} likes`);

  // Recompute like_count + reactions on posts
  postIds.forEach(pid => {
    const counts = allRows('SELECT reaction_type, COUNT(*) as c FROM likes WHERE post_id = ? GROUP BY reaction_type', [pid]);
    const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
    counts.forEach(r => { reactions[r.reaction_type || 'like'] = r.c; });
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    runSql('UPDATE posts SET like_count = ?, reactions = ? WHERE id = ?', [total, JSON.stringify(reactions), pid]);
  });
  console.log(`[seed-content] Recomputed post reaction counts`);

  // ── Seed comments ────────────────────────────────────────────────────────
  let commentsCreated = 0;
  postIds.forEach((pid, i) => {
    users.forEach(u => {
      // 1-3 comments per user per post
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numComments; c++) {
        const body = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        const cmts = Math.floor(Math.random() * 3);
        const reactions = JSON.stringify({ like: cmts, love: 0, haha: 0, wow: 0, sad: 0 });
        try {
          const stmt = db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id, like_count, reactions) VALUES (?, ?, ?, NULL, ?, ?)');
          stmt.run([pid, u.id, body, cmts, reactions]);
          stmt.free();
          commentsCreated++;
        } catch (e) { /* skip */ }
      }
    });
    // Update comment_count
    const c = allRows('SELECT COUNT(*) as cnt FROM comments WHERE post_id = ?', [pid])[0].cnt;
    runSql('UPDATE posts SET comment_count = ? WHERE id = ?', [c, pid]);
  });
  console.log(`[seed-content] Created ${commentsCreated} comments`);

  // ── Save ───────────────────────────────────────────────────────────────
  fs.writeFileSync(dbPath, db.export());
  console.log(`\n✅ Seeding complete. ${postsCreated} posts, ${likesCreated} likes, ${commentsCreated} comments.`);
})().catch(err => { console.error(err); process.exit(1); });
