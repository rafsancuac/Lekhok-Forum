/* s273-dbcheck.js — session273 QA পূর্বযাচাই: admin_users রোল + users সুপার-অ্যাকাউন্ট তালিকা */
const db = require('../db');
(async () => {
  await db.initDb();
  const admins = await db.prepare('SELECT id, username, role, locked FROM admin_users ORDER BY id').all();
  console.log('ADMIN_USERS:', JSON.stringify(admins));
  const sup = await db.prepare("SELECT id, username, role, status FROM users WHERE role='superadmin' ORDER BY id LIMIT 10").all();
  console.log('SUPER_USERS:', JSON.stringify(sup));
  const total = await db.prepare('SELECT COUNT(*) AS c FROM users').get();
  const roles = await db.prepare('SELECT role, COUNT(*) AS c FROM users GROUP BY role').all();
  console.log('USER_TOTAL:', JSON.stringify(total), 'ROLES:', JSON.stringify(roles));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
