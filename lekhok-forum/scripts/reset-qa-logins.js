#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   QA-লগইন রিসেটার (সেশন ৯৭) — লাইভ-টেস্ট-লগইন ভাঙার নিরাময়
   ───────────────────────────────────────────────────────────────────────
   সমস্যা: লাইভে ismail / riya / tanvir / secret123 কাজ করে না —
     ① সেশন-৯৫-এর ফোর্স-চেঞ্জ-গেট (must_change_password=1) লগইনকে
        /force-change-password-এ আটকে রাখে, অথবা
     ② কোনো QA-রাউন্ডে পাসওয়ার্ড বদলে গেছে, অথবা
     ③ riya/tanvir কোনো সিড-স্ক্রিপ্টেই ছিল না (seed-qa-users.js-এ ছিল না)।

   এই স্ক্রিপ্ট যা করে (FORCE-RESET — ইউজার থাকুক বা না থাকুক):
     ismail   / secret123   (রিসেট: পাসওয়ার্ড + must_change_password=0 + active)
     riya     / secret123   (একই — না থাকলে তৈরি)
     tanvir   / secret123   (একই — না থাকলে তৈরি)
     + বাকি QA-রোস্টার না-থাকলে তৈরি হয় (আছে হলে ধরা হয় না — নিচে দেখুন)

   ══ লাইভ-Turso-তে চালানোর নিয়ম (গুরুত্বপূর্ণ) ═════════════════════════
     export TURSO_DATABASE_URL='libsql://lekhok-forum-rafsancuac.aws-ap-south-1.turso.io'
     export TURSO_AUTH_TOKEN='<লাইভ-টোকেন>'
     node scripts/reset-qa-logins.js
   → Turso-সংযোগে সরাসরি রিসেট হবে; Vercel-রিডিপ্লয়ের দরকার নেই।

   লোকাল ফাইল-DB-তে (sql.js):
     node scripts/reset-qa-logins.js            # lekhok.db (ডিফল্ট)
     node scripts/reset-qa-logins.js path.db    # নির্দিষ্ট ফাইল
   ⚠️ sql.js-ফাইলের ক্ষেত্রে চলমান সার্ভারের ইন-মেমরি কপি শাটডাউন-সেভে
      লেখা-উল্টে খেতে পারে (last-writer-wins) — সার্ভার বন্ধ রাখুন।

   অন্যান্য QA-ইউজার (শুধু তৈরি, আছে হলে স্পর্শ করা হয় না — লাইভে
   ইউজার-বদলানো পাসওয়ার্ড ভাঙার ঝুঁকি এড়াতে):
     testuser/testadmin=demo123 · testagent1/testagent2=Test@1234 ·
     monem/karishma/mahfuz/nusrat=demo123
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const TRIO_PASSWORD = 'secret123';

// [username, password, fullName, forceReset]
const TRIO = [
  ['ismail', TRIO_PASSWORD, 'ইসমাইল হোসেন',      true],
  ['riya',   TRIO_PASSWORD, 'রিয়া আক্তার',        true],
  ['tanvir', TRIO_PASSWORD, 'তানভীর আহমেদ',      true],
];
const ROSTER_CREATE_ONLY = [
  ['testuser',   'demo123',   'টেস্ট ইউজার'],
  ['testadmin',  'demo123',   'টেস্ট অ্যাডমিন (ইউজার-রোল)'],
  ['testagent1', 'Test@1234', 'টেস্ট এজেন্ট এক'],
  ['testagent2', 'Test@1234', 'টেস্ট এজেন্ট দুই'],
  ['monem',      'demo123',   'মোনেম শাহরিয়ার শাওন'],
  ['karishma',   'demo123',   'কারিশমা ইরিন এ্যামি'],
  ['mahfuz',     'demo123',   'মাহফুজ রহমান'],
  ['nusrat',     'demo123',   'নুসরাত সুলতানা'],
];

const INSERT_SQL = "INSERT INTO users (username, password_hash, full_name, gender, designation, bio, status, role, must_change_password) VALUES (?, ?, ?, 'other', 'সাহিত্যিক', 'QA সিড-অ্যাকাউন্ট (session97 reset)', 'active', 'user', 0)";

// ── ব্যাকএন্ড নির্ধারণ: Turso (env) অগ্রাধিকার, নাহলে লোকাল sql.js ফাইল ──
async function openBackend() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url) {
    const { createClient } = require('@libsql/client');
    const client = createClient({ url, authToken: token });
    const exec = async (sql, params = []) => client.execute({ sql, args: params });
    const all = async (sql, params = []) => (await client.execute({ sql, args: params })).rows;
    return {
      kind: 'turso', exec, all,
      finish: async () => {},
      label: 'Turso: ' + url,
    };
  }
  // লোকাল sql.js ফাইল
  const DB_PATH = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lekhok.db'));
  if (!fs.existsSync(DB_PATH)) {
    console.error('DB পাওয়া যায়নি: ' + DB_PATH + ' (আগে অন্তত-একবার সার্ভার বুট করুন, বা Turso env দিন)');
    process.exit(1);
  }
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  return {
    kind: 'sqljs',
    exec: (sql, params = []) => { db.run(sql, params); },
    all: (sql, params = []) => {
      const stmt = db.prepare(sql); stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free(); return rows;
    },
    finish: async () => { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); },
    label: 'sql.js: ' + DB_PATH,
  };
}

(async () => {
  const b = await openBackend();
  console.log('ব্যাকএন্ড: ' + b.label);

  // সেশন-৯৫ কলাম ডিফেন্সিভ-নিশ্চিত (ফ্রেশ/পুরনো ডিবি — দুটোতেই নিরাপদ)
  for (const ddl of [
    'ALTER TABLE users ADD COLUMN password_changed_at DATETIME',
    'ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0',
  ]) {
    try { await b.exec(ddl); } catch (e) { /* আগেই-আছে */ }
  }

  let reset = 0, created = 0, kept = 0;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // ১) ট্রায়ো — থাকুক বা না থাকুক, ফোর্স-রিসেট
  for (const [username, password, fullName] of TRIO) {
    const hash = bcrypt.hashSync(password, 10);
    const rows = await b.all('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length) {
      await b.exec(
        "UPDATE users SET password_hash=?, status='active', must_change_password=0, password_changed_at=? WHERE username=?",
        [hash, now, username]
      );
      reset++; console.log('  ↻ রিসেট  ' + username + ' / ' + password);
    } else {
      await b.exec(INSERT_SQL, [username, hash, fullName]);
      created++; console.log('  + তৈরি   ' + username + ' / ' + password);
    }
  }

  // ২) বাকি রোস্টার — শুধু অনুপস্থিত তৈরি
  for (const [username, password, fullName] of ROSTER_CREATE_ONLY) {
    const rows = await b.all('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length) { kept++; continue; }
    await b.exec(INSERT_SQL, [username, bcrypt.hashSync(password, 10), fullName]);
    created++; console.log('  + তৈরি   ' + username + ' / ' + password);
  }

  await b.finish();
  console.log('সম্পন্ন — রিসেট: ' + reset + ', তৈরি: ' + created + ', অস্পৃষ্ট: ' + kept);
  console.log('টেস্ট-লগইন → ismail / riya / tanvir · পাসওয়ার্ড: ' + TRIO_PASSWORD);
  process.exit(0);
})().catch(e => { console.error('ব্যর্থ:', e.message); process.exit(1); });
