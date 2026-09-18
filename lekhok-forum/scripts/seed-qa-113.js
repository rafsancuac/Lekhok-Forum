#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   seed-qa-113.js — Q&A উত্তর-থ্রেড E2E-সিডার (সেশন ১১৩)
   ──────────────────────────────────────────────────────────────────────────
   কখন চালাবেন: **সার্ভার বন্ধ অবস্থায়** (শাটডাউন-ফ্লাশ last-writer-wins —
   চলমান সার্ভারের ইন-মেমরি DB সিড মুছে ফেলে; seed-resources-107-গোটচা)।

   তৈরি করে (idempotent — টাইটেল-ম্যাচে বাদ):
     • প্রশ্ন: "নতুন লেখকরা কোথায় থেকে শুরু করবেন?" (testuser, প্রকাশিত)
     • উত্তর-১ (md_rafsan, like_count=৩ → শীর্ষ-উত্তর-চিপ E2E)
     • উত্তর-২ (testadmin, like_count=০)
     • রিপ্লাই (testuser → উত্তর-১-এর সন্তান, parent_id) — থ্রেড-ট্রি E2E
   এছাড়া testuser/testadmin না-থাকলে তৈরি (demo123) — seed-test-users-১১৩-মিরর।

   ব্যবহার: node scripts/seed-qa-113.js
   ═══════════════════════════════════════════════════════════════════════════ */
process.env.DB_BACKEND = 'sqljs';
const db = require('../db.js');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await db.initDb();
    await new Promise(r => setTimeout(r, 3500)); // initDb-ট্রেলিং-সিড শেষ হওয়া পর্যন্ত
    // ⚠️ seed-test-users-কনভেনশন: testadmin = users-টেবিলে role='admin'
    // (সুপার-নয়, "user-role admin") — ভিন্ন-রোলে বানালে role-policy-স্যুটের
    // state-ডাইভার্জ (ban→403-ক্যাসকেড)।
    const ensureUser = async (username, fullName, role = 'user') => {
      const ex = await db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (ex) {
        await db.prepare("UPDATE users SET role = ?, status = 'active' WHERE username = ?").run(role, username);
        return ex.id;
      }
      const hash = bcrypt.hashSync('demo123', 10);
      const r = await db.prepare("INSERT INTO users (username, password_hash, full_name, gender, status, role) VALUES (?, ?, ?, 'other', 'active', ?)").run(username, hash, fullName, role);
      console.log('seeded user', username, role);
      return Number(r.lastInsertRowid);
    };
    const uidTest = await ensureUser('testuser', 'টেস্ট ইউজার', 'user');
    const uidAdmin = await ensureUser('testadmin', 'টেস্ট অ্যাডমিন', 'admin');
    // নেগেটিভ-পাথ-ইউজার (কোনো প্রিভিলেজ নেই) — role-policy-স্যুটের 403-চেক এখন
    // এই-ইউজার দিয়ে (testadmin users-টেবিলে role='admin' → mod-edit তার অধিকার)।
    await ensureUser('qa113user', 'কিউএ-১১৩ প্লেইন ইউজার', 'user');
    const rafsan = await db.prepare('SELECT id FROM users WHERE username = ?').get('md_rafsan');
    const uidRaf = rafsan ? rafsan.id : uidAdmin;

    const TITLE = 'নতুন লেখকরা কোথায় থেকে শুরু করবেন?';
    const exQ = await db.prepare("SELECT id FROM posts WHERE type = 'question' AND title = ?").get(TITLE);
    if (exQ) {
      console.log('QA-সিড ইতিমধ্যে আছে (post', exQ.id, ') — idempotent স্কিপ');
      // সেশন ১৩১: পুরনো-সিড-থ্রেডেও গ্রহণকৃত-উত্তর ডেমো-স্টেট নিশ্চিত (idempotent —
      // এখনো-না-মার্ক-হলে সর্বোচ্চ-লাইক-টপ-উত্তরটিকেই গ্রহীতা করে; ম্যানুয়ালি-মার্ক-থাকলে অস্পৃশ্য)
      await db.prepare(`UPDATE posts SET accepted_comment_id = (
        SELECT id FROM comments WHERE post_id = ? ORDER BY like_count DESC, created_at ASC LIMIT 1
      ) WHERE id = ? AND accepted_comment_id IS NULL`).run(exQ.id, exQ.id);
      db.saveDb(); await db.flushDb(); process.exit(0);
    }

    const body = 'আমি **নতুন লেখক**। লেখালেখি শুরু করতে চাই —\n\n- প্রথমে ব্লগ, নাকি গল্প?\n- প্রতিদিন কতটুকু লিখা ভালো?\n\nঅভিজ্ঞদের পরামর্শ চাই।';
    const q = await db.prepare("INSERT INTO posts (author_id, type, title, body, category, tags, post_kind, status, published_at) VALUES (?, 'question', ?, ?, 'general', 'নতুন-লেখক', 'question', 'published', CURRENT_TIMESTAMP)").run(uidTest, TITLE, body);
    const qid = Number(q.lastInsertRowid);

    const a1 = await db.prepare('INSERT INTO comments (post_id, author_id, body, like_count) VALUES (?, ?, ?, 3)').run(qid, uidRaf, 'ছোট-ছোট **অনুবাদ** দিয়ে শুরু করুন — ভাষা-হাত পড়ে, নিজের গল্পের সাহসও জমে। সাথে ফোরামে প্রতিদিন ২০০ শব্দ লিখুন।');
    const a2 = await db.prepare('INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)').run(qid, uidAdmin, 'পড়া ছাড়া লেখা হয় না — মাসে অন্তত একটি বই পড়ুন, তারপর নিজের ভঙ্গিতে লিখুন।');
    const r1 = await db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id) VALUES (?, ?, ?, ?)').run(qid, uidTest, 'ধন্যবাদ! প্রতিদিন ২০০ শব্দ শুরু করছি আজ থেকেই।', Number(a1.lastInsertRowid));
    await db.prepare('UPDATE posts SET comment_count = 3 WHERE id = ?').run(qid);
    console.log('seeded question', qid, '| answers', Number(a1.lastInsertRowid), Number(a2.lastInsertRowid), '| reply', Number(r1.lastInsertRowid));
    db.saveDb(); await db.flushDb();
    await new Promise(r => setTimeout(r, 1200));
    db.saveDb(); await db.flushDb();
    console.log('DB saved OK');
    process.exit(0);
  } catch (e) { console.error('SEED ERR', e); process.exit(1); }
})();
