#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   QA-ইউজার সিডার (সেশন ৯১ থেকে পুনরুদ্ধার + সেশন ৯৩-এ সংযোজন)
   ───────────────────────────────────────────────────────────────────────
   কখন চালাবেন: **সার্ভার বন্ধ অবস্থায়** — চলমান সার্ভারের ইন-মেমরি DB
   শাটডাউন-সেভে এই সিড মুছে ফেলে (last-writer-wins)।

   তৈরি করে (idempotent — থাকলে বাদ):
     testuser   / demo123   (role=user)
     testadmin  / demo123   (role=user)  ← নামে admin হলেও ইউজার-রোল
     testagent1 / Test@1234 (role=user)
     testagent2 / Test@1234 (role=user)
     ismail/monem/karishma/mahfuz/nusrat / demo123 (রোস্টার-সিড-ডিবিতে
                  ডেমো-ইউজার সিড-হয় না বলে — E2E-র জন্য)

   ব্যবহার: node scripts/seed-qa-users.js [lekhok.db-পাথ]
   ═══════════════════════════════════════════════════════════════════════ */
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lekhok.db'));

const USERS = [
  ['testuser', 'demo123', 'টেস্ট ইউজার'],
  ['testadmin', 'demo123', 'টেস্ট অ্যাডমিন (ইউজার-রোল)'],
  ['testagent1', 'Test@1234', 'টেস্ট এজেন্ট এক'],
  ['testagent2', 'Test@1234', 'টেস্ট এজেন্ট দুই'],
  ['ismail', 'demo123', 'ইসমাইল হোসেন'],
  ['monem', 'demo123', 'মোনেম শাহরিয়ার শাওন'],
  ['karishma', 'demo123', 'কারিশমা ইরিন এ্যামি'],
  ['mahfuz', 'demo123', 'মাহফুজ রহমান'],
  ['nusrat', 'demo123', 'নুসরাত সুলতানা']
];

(async () => {
  if (!fs.existsSync(DB_PATH)) { console.error('DB পাওয়া যায়নি: ' + DB_PATH + ' (আগে অন্তত-একবার সার্ভার বুট করুন)'); process.exit(1); }
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  let added = 0, skipped = 0;
  for (const [username, password, fullName] of USERS) {
    const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
    stmt.bind([username]);
    const exists = stmt.step();
    stmt.free();
    if (exists) { skipped++; continue; }
    const hash = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO users (username, password_hash, full_name, gender, designation, bio, status, role) VALUES (?, ?, ?, 'other', 'সাহিত্যিক', 'QA সিড-অ্যাকাউন্ট (session91/93)', 'active', 'user')",
      [username, hash, fullName]
    );
    added++;
    console.log('  + ' + username + ' / ' + password);
  }
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('সম্পন্ন — নতুন: ' + added + ', আগেই-ছিল: ' + skipped + ' (DB: ' + DB_PATH + ')');
})().catch(e => { console.error('ব্যর্থ:', e.message); process.exit(1); });
