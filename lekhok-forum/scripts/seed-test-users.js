process.env.DB_BACKEND = 'sqljs';
const db = require('../db.js');
const bcrypt = require('bcryptjs');
(async () => {
  try {
    await db.initDb();
    await new Promise(r => setTimeout(r, 3500)); // initDb-এর ট্রেলিং async-সিড শেষ হওয়া পর্যন্ত অপেক্ষা
    for (const [username, role] of [['testuser', 'user'], ['testadmin', 'admin']]) {
      const ex = await db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (!ex) {
        const hash = bcrypt.hashSync('demo123', 10);
        await db.prepare("INSERT INTO users (username, password_hash, full_name, gender, status, role) VALUES (?, ?, ?, 'other', 'active', ?)")
          .run(username, hash, 'টেস্ট ' + username, role);
        console.log('seeded', username, role);
      } else {
        await db.prepare('UPDATE users SET role = ?, status = ? WHERE username = ?').run(role, 'active', username);
        console.log('updated', username, role);
      }
    }
    const mod = await db.prepare("SELECT id FROM users WHERE username = 'moderator'").get();
    if (mod) {
      const exs = await db.prepare('SELECT 1 AS x FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(mod.id, 'user_mgmt');
      if (!exs) { await db.prepare('INSERT INTO moderator_scopes (user_id, scope) VALUES (?, ?)').run(mod.id, 'user_mgmt'); console.log('moderator +user_mgmt scope'); }
      else console.log('user_mgmt already present');
    }
    db.saveDb(); await db.flushDb();
    await new Promise(r => setTimeout(r, 1200)); // দেরিতে-সেভ রেস এড়াতে
    db.saveDb(); await db.flushDb();
    console.log('DB saved OK');
    process.exit(0);
  } catch (e) { console.error('SEED ERR', e); process.exit(1); }
})();
