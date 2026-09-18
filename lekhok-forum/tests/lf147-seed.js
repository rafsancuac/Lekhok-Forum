#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   tests/lf147-seed.js — সেশন ১৪৭ E2E টেস্ট-ডেটা (প্রতিষ্ঠিত fbtest-প্যাটার্ন)
   fbtest1/2/3 (demo123) + ফলো-গ্রাফ + লেখা + মন্তব্য-সহ-শেয়ার (নেস্টেড-শেয়ার ডেমো)
   স্ট্যান্ডঅ্যালোন sql.js-এডিট — সার্ভার বন্ধ-অবস্থায় চালাতে হবে (pkill -9 আগে)!
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const initSqlJs = require('sql.js');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const db = new SQL.Database(fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : undefined);

  const q = (sql, params) => {
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };
  const run = (sql, params) => db.run(sql, params || []);

  // ── ইউজার (idempotent) ──
  const users = [
    { u: 'fbtest1', n: 'ফাজল টেস্টওয়ান', pen: 'নীলকণ্ঠ', bio: 'Writer | Columnist | Organizer\nBlogger | Graphics Designer', bg: 'A+', ht: 'কুমিল্লা', inst: 'চট্টগ্রাম বিশ্ববিদ্যালয়', year: 'March 2025', addr: 'চট্টগ্রাম', desig: 'সহকারী সম্পাদক' },
    { u: 'fbtest2', n: 'ফাজল টেস্টটু', pen: 'সেঁজুতি', bio: 'কবি ও গল্পকার', bg: 'B+', ht: 'সিলেট', inst: 'সিলেট বিশ্ববিদ্যালয়', year: '2022', addr: 'সিলেট', desig: 'কলামিস্ট' },
    { u: 'fbtest3', n: 'ফাজল টেস্টথ্রি', pen: null, bio: 'প্রাবন্ধিক', bg: null, ht: 'রাজশাহী', inst: null, year: null, addr: 'রাজশাহী', desig: 'সদস্য' }
  ];
  const ids = {};
  for (const t of users) {
    let row = q('SELECT id FROM users WHERE username = ?', [t.u])[0];
    if (!row) {
      const hash = bcrypt.hashSync('demo123', 10);
      run(`INSERT INTO users (username, password_hash, full_name, pen_name, bio, designation, address, blood_group, hometown, institution, academic_year, role, status, gender, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', 'active', 'male', datetime('now'))`,
        [t.u, hash, t.n, t.pen, t.bio, t.desig, t.addr, t.bg, t.ht, t.inst, t.year]);
      row = q('SELECT id FROM users WHERE username = ?', [t.u])[0];
      console.log('user+', t.u, row.id);
    } else {
      run('UPDATE users SET blood_group=COALESCE(?,blood_group), hometown=COALESCE(?,hometown), institution=COALESCE(?,institution), academic_year=COALESCE(?,academic_year), bio=COALESCE(?,bio), address=COALESCE(?,address), pen_name=COALESCE(?,pen_name), designation=COALESCE(?,designation) WHERE id=?',
        [t.bg, t.ht, t.inst, t.year, t.bio, t.addr, t.pen, t.desig, row.id]);
    }
    ids[t.u] = row.id;
  }

  // ── ফলো-গ্রাফ ──
  const follows = [['fbtest2', 'fbtest1'], ['fbtest3', 'fbtest1'], ['fbtest1', 'fbtest2'], ['fbtest1', 'fbtest3']];
  for (const [a, b] of follows) {
    if (!q('SELECT 1 x FROM follows WHERE follower_id=? AND following_id=?', [ids[a], ids[b]]).length) {
      run('INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, datetime("now"))', [ids[a], ids[b]]);
    }
  }

  // ── লেখা (idempotent — title-অনুসন্ধান) ──
  const mkPost = (author, title, body, opts) => {
    let p = q('SELECT id FROM posts WHERE title = ? AND author_id = ?', [title, ids[author]])[0];
    if (p) return p.id;
    run(`INSERT INTO posts (author_id, type, title, body, excerpt, category, status, view_count, like_count, comment_count, reactions, published_at, created_at)
         VALUES (?, 'article', ?, ?, ?, 'general', 'published', ?, ?, 0, '{}', datetime('now','localtime'), datetime('now','localtime'))`,
      [ids[author], title, body, body.slice(0, 140), opts.views, opts.likes]);
    p = q('SELECT id FROM posts WHERE title = ? AND author_id = ?', [title, ids[author]])[0];
    return p.id;
  };
  const art1 = mkPost('fbtest1', 'LF147 অব্যক্ত আর্তনাদের দীর্ঘ ছায়া', 'একটি জাতির আর্তনাদ কীভাবে নীরব হয়ে যায় — ইতিহাসের নির্মম শিক্ষা নিয়ে দীর্ঘ প্রবন্ধ। কলাম ও ফিচার লেখার ধারায় আজকের এই আলোচনা।', { views: 21, likes: 8 });
  const art2 = mkPost('fbtest1', 'LF147 কলাম: প্রাপ্তি ও প্রত্যাশা', 'নতুন বছরের দোরগোড়ায় লেখক-জীবনের প্রাপ্তি ও অসমাপ্ত প্রত্যাশা নিয়ে হৃদ্যতাপূর্ণ আলাপ।', { views: 11, likes: 3 });
  const art3 = mkPost('fbtest2', 'LF147 গল্প: একপেশে চুক্তির গল্প', 'মার্কিন বাণিজ্য চুক্তির অন্তর্নিহিত কৌশল নিয়ে সমসাময়িক বিশ্লেষণ — একপেশে চুক্তি বাতিলের দাবিতে গল্প-রূপান্তর।', { views: 33, likes: 12 });

  // ── মন্তব্য-সহ শেয়ার (fbtest1 শেয়ার করল fbtest2-এর গল্প) ──
  const NOTE147 = 'অবিলম্বে এই একপেশে চুক্তি বাতিল করা হোক!';
  if (!q("SELECT 1 x FROM posts WHERE shared_from = ? AND author_id = ?", [art3, ids.fbtest1]).length) {
    run(`INSERT INTO posts (author_id, type, title, body, excerpt, category, status, shared_from, repost_of, repost_note, post_kind, home_featured, archive_visible, published_at, created_at)
         VALUES (?, 'article', '', '', '', 'general', 'published', ?, ?, ?, 'share', 0, 0, datetime('now','localtime'), datetime('now','localtime'))`,
      [ids.fbtest1, art3, art3, NOTE147]);
    console.log('share+ created (note)');
  }

  // ── রিঅ্যাকশন (হাইলাইটস-স্কোর বাস্তব) ──
  try {
    if (!q('SELECT 1 x FROM likes WHERE post_id=? AND user_id=?', [art3, ids.fbtest1]).length) {
      run("INSERT INTO likes (post_id, user_id, reaction_type, created_at) VALUES (?, ?, 'wow', datetime('now','localtime'))", [art3, ids.fbtest1]);
    }
  } catch (e) { console.log('likes-skip', e.message); }

  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  const fsyncCheck = q("SELECT COUNT(*) c FROM posts WHERE post_kind='share'")[0].c;
  console.log('SEEDED ✓ shares:', fsyncCheck, '| users:', JSON.stringify(ids), '| arts:', art1, art2, art3);
})().catch(e => { console.error('SEED-FAIL', e); process.exit(1); });
