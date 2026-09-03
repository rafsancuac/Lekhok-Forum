#!/usr/bin/env node
/**
 * db/seed-committee.js — Seed the 13-member কার্যনির্বাহী কমিটি.
 *
 * Idempotent: clears all rows where member_type='central' and re-inserts.
 *
 * Usage: node db/seed-committee.js
 */

const fs   = require('fs');
const path = require('path');

(async () => {
  const initSqlJs = require('sql.js');

  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const SQL = await initSqlJs();
  let db = new SQL.Database();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  }

  // Ensure members table exists
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    institution TEXT,
    image_url TEXT,
    member_type TEXT DEFAULT 'central',
    sort_order INTEGER DEFAULT 0,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const committee = [
    { name: 'কারিশমা ইরিন এ্যামি',   role: 'সহ-সাংগঠনিক সম্পাদক',     sort_order: 10 },
    { name: 'আজিজ ওয়েসি',            role: 'সাংগঠনিক সম্পাদক',          sort_order: 9  },
    { name: 'মোঃ রেজাউল করিম',        role: 'দপ্তর সম্পাদক',             sort_order: 8  },
    { name: 'মোঃ নাঈম মিজি',          role: 'সাহিত্য ও প্রকাশনা সম্পাদক', sort_order: 7  },
    { name: 'মাহফুজ রহমান',           role: 'প্রচার সম্পাদক',             sort_order: 6  },
    { name: 'মাহমুদুল হাসান শাকিব',  role: 'তথ্য ও প্রযুক্তি সম্পাদক', sort_order: 5  },
    { name: 'জান্নাতুল ফেরদৌস ইকরা', role: 'অর্থ সম্পাদক',               sort_order: 4  },
    { name: 'নুসরাত সুলতানা',         role: 'প্রশিক্ষণ বিষয়ক সম্পাদক',   sort_order: 3  },
    { name: 'রাসেল হোসেন সাকিব',     role: 'যুগ্ম সাধারণ সম্পাদক',       sort_order: 2  },
    { name: 'সানজিদা আফরোজ',         role: 'সহ-দপ্তর সম্পাদক',           sort_order: 1  },
    { name: 'আব্দুল্লাহ আল নাঈম',     role: 'সম্পাদকীয় পর্ষদ সদস্য',      sort_order: 11 },
    { name: 'আবরার আহাদ রাফি',       role: 'কার্যনির্বাহী সদস্য',         sort_order: 12 },
    { name: 'ঋতু আক্তার',             role: 'কার্যনির্বাহী সদস্য',         sort_order: 13 }
  ];

  // Clear existing central members, then re-insert
  db.run(`DELETE FROM members WHERE member_type = 'central'`);

  const insert = db.prepare('INSERT INTO members (name, role, member_type, sort_order) VALUES (?, ?, ?, ?)');
  committee.forEach(m => {
    insert.run([m.name, m.role, 'central', m.sort_order]);
  });
  insert.free();

  fs.writeFileSync(dbPath, db.export());
  console.log(`[seed-committee] Inserted ${committee.length} কেন্দ্রীয় কার্যনির্বাহী কমিটি members.`);
})().catch(err => { console.error(err); process.exit(1); });
