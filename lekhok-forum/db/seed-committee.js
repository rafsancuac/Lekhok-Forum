#!/usr/bin/env node
/**
 * db/seed-committee.js — Seed the ২০২৫-২৬ কার্যবর্ষের ১৫-সদস্যের কার্যনির্বাহী কমিটি।
 *
 * Idempotent: clears all rows where member_type='central' and re-inserts.
 *
 * user_id linking POLICY (২০২৫-০৯-২০): links are NOT auto-created anymore.
 * AUTO_LINK_USERS=false মানে সব কার্ড আনলিংকড থাকবে — সদস্য নিজে /claim করলে
 * (বা অ্যাডমিন UPDATE members SET user_id=.. WHERE member_id=.. করলে) লিংক হবে।
 * AUTO_LINK_USERS=true করলে নিচের usernames ক্যান্ডিডেট দিয়ে dev-এ লিংক হবে।
 *
 * Usage: node db/seed-committee.js
 */

const fs   = require('fs');
const path = require('path');

const AUTO_LINK_USERS = false;

(async () => {
  const initSqlJs = require('sql.js');

  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const SQL = await initSqlJs();
  let db = new SQL.Database();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  }

  // Ensure members table exists (mirror prod schema essentials)
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    institution TEXT,
    image_url TEXT,
    member_type TEXT DEFAULT 'central',
    sort_order INTEGER DEFAULT 0,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    term_year TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    member_id TEXT UNIQUE,
    account_status TEXT DEFAULT 'unclaimed'
  )`);

  // Ensure users table exists (for FK lookups in fresh dev DBs)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL
  )`);

  // ২০২৫-২৬ কার্যবর্ষ — গঠিত কমিটি (অফিসিয়াল তালিকা অনুযায়ী, কার্যক্রমিক ক্রমে)
  const TERM_YEAR = '২০২৫-২৬';
  const committee = [
    { name: 'ইসমাইল হোসেন ইমন',     role: 'সভাপতি',                  sort_order: 0,  member_id: 'MEM-00093', usernames: ['ismail_hossen_emon', 'ismail'] },
    { name: 'মোনেম শাহরিয়ার শাওন',  role: 'সাধারণ সম্পাদক',           sort_order: 1,  member_id: 'MEM-00094', usernames: ['molem_shahriar_shaon', 'monem'] },
    { name: 'রাসেল হোসেন সাকিব',     role: 'যুগ্ম সাধারণ সম্পাদক',      sort_order: 2,  member_id: 'MEM-00095', usernames: ['rakib_hossen'] },
    { name: 'আজিজ ওয়েসি',           role: 'সাংগঠনিক সম্পাদক',         sort_order: 3,  member_id: 'MEM-00096', usernames: [] },
    { name: 'কারিশমা ইরিন এ্যামি',   role: 'সহ-সাংগঠনিক সম্পাদক',     sort_order: 4,  member_id: 'MEM-00097', usernames: ['karishma'] },
    { name: 'জান্নাতুল ফেরদৌস ইকরা', role: 'অর্থ সম্পাদক',              sort_order: 5,  member_id: 'MEM-00098', usernames: ['jayatul_ferdaus_ikra'] },
    { name: 'মোঃ রেজাউল করিম',       role: 'দপ্তর সম্পাদক',            sort_order: 6,  member_id: 'MEM-00099', usernames: [] },
    { name: 'সানজিদা আফরোজ',         role: 'সহ-দপ্তর সম্পাদক',         sort_order: 7,  member_id: 'MEM-00100', usernames: [] },
    { name: 'মোঃ নাঈম মিজি',         role: 'সাহিত্য ও প্রকাশনা সম্পাদক', sort_order: 8,  member_id: 'MEM-00101', usernames: [] },
    { name: 'মাহফুজ রহমান',          role: 'প্রচার সম্পাদক',            sort_order: 9,  member_id: 'MEM-00102', usernames: ['mahfuz'] },
    { name: 'নুসরাত সুলতানা',        role: 'প্রশিক্ষণ বিষয়ক সম্পাদক',  sort_order: 10, member_id: 'MEM-00103', usernames: ['nusrat'] },
    { name: 'মাহমুদুল হাসান শাকিব',  role: 'তথ্য ও প্রযুক্তি সম্পাদক',  sort_order: 11, member_id: 'MEM-00104', usernames: [] },
    { name: 'আব্দুল্লাহ আল নাঈম',    role: 'সম্পাদকীয় পর্ষদ সদস্য',     sort_order: 12, member_id: 'MEM-00105', usernames: [] },
    { name: 'আবরার আহাদ রাফি',       role: 'কার্যনির্বাহী সদস্য',         sort_order: 13, member_id: 'MEM-00106', usernames: [] },
    { name: 'ঋতু আক্তার',            role: 'কার্যনির্বাহী সদস্য',         sort_order: 14, member_id: 'MEM-00107', usernames: [] }
  ];

  // Resolve user_id by username candidates (first existing wins; null otherwise)
  const uidFor = (usernames) => {
    for (const u of usernames) {
      const stmt = db.prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
      stmt.bind([u]);
      if (stmt.step()) {
        const id = stmt.get()[0];
        stmt.free();
        return id;
      }
      stmt.free();
    }
    return null;
  };

  // Clear existing central members, then re-insert
  db.run(`DELETE FROM members WHERE member_type = 'central'`);

  const insert = db.prepare(
    'INSERT INTO members (name, role, member_type, sort_order, term_year, user_id, member_id, account_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  let linked = 0;
  committee.forEach(m => {
    const uid = AUTO_LINK_USERS ? uidFor(m.usernames) : null;
    if (uid) linked++;
    insert.run([m.name, m.role, 'central', m.sort_order, TERM_YEAR, uid, m.member_id, 'unclaimed']);
  });
  insert.free();

  fs.writeFileSync(dbPath, db.export());
  console.log(`[seed-committee] Inserted ${committee.length} members for ${TERM_YEAR} (${linked} user-linked).`);
})().catch(err => { console.error(err); process.exit(1); });
