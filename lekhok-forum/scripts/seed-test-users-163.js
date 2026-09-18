#!/usr/bin/env node
/* session163: টেস্ট-ইউজার পুনঃসিড (sandbox-reset-এ DB থেকে testuser হারিয়েছে)
   seed-qa-113.js-এর ensureUser-প্যাটার্ন মিরর (bcryptjs demo123) — কনটেন্ট-সিড ছাড়া */
const path = require('path');
process.env.DB_BACKEND = 'sqljs';
const db = require(path.join(__dirname, '..', 'db.js'));
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await db.initDb();
    await new Promise(r => setTimeout(r, 3500)); // initDb-ট্রেলিং-সিড শেষ হওয়া পর্যন্ত
    const ensureUser = async (username, fullName, role = 'user') => {
      const ex = await db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (ex) {
        await db.prepare("UPDATE users SET role = ?, status = 'active' WHERE username = ?").run(role, username);
        console.log('exists', username);
        return Number(ex.id);
      }
      const hash = bcrypt.hashSync('demo123', 10);
      const r = await db.prepare("INSERT INTO users (username, password_hash, full_name, gender, status, role) VALUES (?, ?, ?, 'other', 'active', ?)").run(username, hash, fullName, role);
      console.log('seeded user', username, role);
      return Number(r.lastInsertRowid);
    };
    await ensureUser('testuser', 'টেস্ট ইউজার', 'user');
    await ensureUser('testadmin', 'টেস্ট অ্যাডমিন', 'admin');
    db.saveDb(); await db.flushDb();
    await new Promise(r => setTimeout(r, 1200));
    db.saveDb(); await db.flushDb();
    console.log('DB saved OK');
    process.exit(0);
  } catch (e) { console.error('SEED ERR', e); process.exit(1); }
})();
