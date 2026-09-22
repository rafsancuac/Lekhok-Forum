// ══════════════════════════════════════════════════════════════════════════════
// সুপার-এডমিন প্যানেল (সেশন ৭৭) — /admin/super/*
// ══════════════════════════════════════════════════════════════════════════════
// উদ্দেশ্য: সাইটের মালিকানা-স্তরের নিয়ন্ত্রণ —
//   • অ্যাডমিন যুক্ত/রিমুভ/লক/পাসওয়ার্ড-রিসেট/রোল বদল
//   • অ্যাডমিনের কাজের-এরিয়ার অনুমোদন (admin_users.scopes — খালি = পূর্ণ প্যানল)
//   • সংবেদনশীল সাইট-তথ্য (যোগাযোগ, সোশ্যাল, সাইট-পরিচয়) সম্পাদনা
//   • সাইট-ওয়াইড টগল (রক্ষণাবেক্ষণ-মোড, রেজিস্ট্রেশন-অনুমোদন, ক্লেইম-অনুমোদন)
//   • কমিউনিটি-অ্যাকাউন্টকে superadmin-এ উন্নীত/অবনমন
// প্রতিটি মিউটেশন audit_log-এ TA42.audit দিয়ে এবং অ্যাক্টিভিটি-লগ মিডলওয়্যার
// (admin/routes.js-এর finish-হুক) দিয়ে স্বয়ংক্রিয়ভাবে রেকর্ড হয়।
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const TA42 = require('../helpers/trash-audit');
const SC = require('../helpers/support-center');   // সাপোর্ট-সেন্টার (Next-পোর্ট)

const getSetting = db.getSetting;
const setSetting = db.setSetting;

// ── কাজের-এরিয়া ক্যাটালগ — কনটেন্ট-স্কোপ + অ্যাডমিন-এরিয়া একত্রে ─────────────
// admin_users.scopes-এ এই কীগুলোই থাকে; খালি/null = সীমাহীন।
// কনটেন্ট-কী (notice, event, …) requireScope-ও মানে; অ্যাডমিন-এরিয়া কী
// admin/routes.js-এর ADMIN_PATH_AREAS-এর সাথে মিলে requireAdmin পথে যাচাই হয়।
const SUPER_AREAS = [
  { group: 'কনটেন্ট ও কার্যক্রম', items: [
    { key: 'notice',      label: 'বিজ্ঞপ্তি',         icon: 'fas fa-bullhorn' },
    { key: 'event',       label: 'ইভেন্ট',            icon: 'fas fa-calendar-day' },
    { key: 'gallery',     label: 'গ্যালারি',           icon: 'fas fa-images' },
    { key: 'daily',       label: 'ডেইলি কনটেন্ট',      icon: 'fas fa-sun' },
    { key: 'complaints',  label: 'অভিযোগ নিষ্পত্তি',    icon: 'fas fa-flag' }
  ]},
  { group: 'সংগঠন ও কমিউনিটি', items: [
    { key: 'members',     label: 'কমিটি সদস্য ও ক্লেইম',   icon: 'fas fa-users' },
    { key: 'users',       label: 'ইউজার ও মডারেটর',        icon: 'fas fa-users-cog' },
    { key: 'community',   label: 'বার্তা/নিউজলেটার/টাস্ক',  icon: 'fas fa-envelope' },
    { key: 'organization', label: 'অর্জন/গঠনতন্ত্র/নেতৃত্ব', icon: 'fas fa-trophy' },
    { key: 'resources',   label: 'রিসোর্স',             icon: 'fas fa-book' }
  ]},
  { group: 'সিস্টেম ও নজরদারি', items: [
    { key: 'content',     label: 'কনটেন্ট সম্পাদক ও সেকশন', icon: 'fas fa-pen-square' },
    { key: 'settings',    label: 'সেটিংস ও সিকিউরিটি',     icon: 'fas fa-cog' },
    { key: 'media',       label: 'মিডিয়া লাইব্রেরি',        icon: 'fas fa-photo-film' },
    { key: 'oversight',   label: 'অডিট/লগ/ট্র্যাশ/অ্যানালিটিক্স', icon: 'fas fa-file-shield' }
  ]}
];
const VALID_AREA_KEYS = SUPER_AREAS.flatMap(g => g.items.map(i => i.key));

function parseScopes(v) {
  if (Array.isArray(v)) return v.filter(x => VALID_AREA_KEYS.includes(x));
  if (typeof v === 'string' && v.trim()) {
    try {
      const a = JSON.parse(v);
      if (Array.isArray(a)) return a.filter(x => VALID_AREA_KEYS.includes(x));
    } catch (_) {}
  }
  return null; // সীমাহীন
}

// ── গার্ড: সুপার-এডমিন কেবল ──────────────────────────────────────────────────
// সেশনের রোল নয় — প্রতি রিকোয়েস্টে DB থেকে ফ্রেশ রোল/লক যাচাই (লাইভ-রিভোকেশন)।
// দুই পথ: ① admin_users (প্যানেল লগইন) role='superadmin'
//          ② users (কমিউনিটি অ্যাকাউন্ট) role='superadmin'
async function requireSuperAdmin(req, res, next) {
  try {
    if (req.session && req.session.adminUser) {
      const row = await db.prepare('SELECT id, username, role, locked FROM admin_users WHERE id = ?').get(req.session.adminUser.id);
      if (row && !row.locked && row.role === 'superadmin') {
        res.locals.superActor = { kind: 'admin', id: row.id, name: row.username, label: 'সুপার এডমিন' };
        return next();
      }
    } else if (req.session && req.session.user && req.session.user.role === 'superadmin') {
      const row = await db.prepare('SELECT id, username, role, status FROM users WHERE id = ?').get(req.session.user.id);
      if (row && row.status === 'active' && row.role === 'superadmin') {
        res.locals.superActor = { kind: 'user', id: row.id, name: row.username, label: 'সুপার এডমিন (কমিউনিটি)' };
        return next();
      }
    }
    // লগইন-করা কিন্তু সুপার-এডমিন নন → অ্যাক্সেস-নেই পেজ
    if ((req.session && req.session.adminUser) || (req.session && req.session.user)) {
      return res.status(403).render('admin/denied', { currentPath: '/admin/super', homePath: '/admin' });
    }
    return res.redirect('/admin/login');
  } catch (e) {
    console.error('[super] guard error:', e);
    return res.status(500).send('সুপার-এডমিন যাচাই ব্যর্থ');
  }
}
router.use(requireSuperAdmin);

// ফ্ল্যাশ-মেসেজ সংক্ষেপ যাচাই (?saved=… / ?err=…)
const FLASH = {
  admin_add: 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে',
  admin_update: 'অ্যাডমিন তথ্য ও কাজের-পরিধি সংরক্ষিত হয়েছে',
  admin_pwd: 'পাসওয়ার্ড রিসেট হয়েছে',
  admin_lock: 'অ্যাডমিন লক করা হয়েছে — লগইন ব্লকড',
  admin_unlock: 'অ্যাডমিন আনলক হয়েছে',
  admin_remove: 'অ্যাডমিন অ্যাকাউন্ট সরানো হয়েছে',
  admin_2fa: 'দুই-স্তর যাচাই (2FA) বন্ধ করা হয়েছে',
  settings: 'সংবেদনশীল তথ্য সংরক্ষিত হয়েছে',
  maint_on: 'রক্ষণাবেক্ষণ-মোড চালু হয়েছে — দর্শকরা সাইট দেখছেন না',
  maint_off: 'রক্ষণাবেক্ষণ-মোড বন্ধ — সাইট স্বাভাবিক',
  user_role: 'ইউজারের রোল পরিবর্তিত হয়েছে',
  scope_revoke: "মডারেটরের 'ইউজার তদারকি' স্কোপ প্রত্যাহার হয়েছে — সে এখন /moderator/users-এ ঢুকতে পারবে না", // সেশন ৯০
  support_admin: 'নির্ধারিত সাপোর্ট-অ্যাডমিন সংরক্ষিত হয়েছে',   // সাপোর্ট-সেন্টার (Next-পোর্ট)
  support_clear: 'সাপোর্ট-অ্যাডমিন নিয়োগ বাতিল করা হয়েছে'
};

const SUPPORT_ERR = {
  not_eligible: 'এই অ্যাকাউন্টটি সাপোর্ট-অ্যাডমিন হতে পারবে না — শুধু সক্রিয় অ্যাডমিন/সুপার-অ্যাডমিন নির্বাচনযোগ্য',
  no_user: 'ইউজার পাওয়া যায়নি'
};

// ══════════════════════════════════════════════════════════════════════════════
// ড্যাশবোর্ড
// ══════════════════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  const safe = async (label, sql) => {
    try { return await db.prepare(sql).all(); }
    catch (e) { console.error(`[super:dashboard] ${label}:`, e.message); return []; }
  };
  const safeOne = async (label, sql) => {
    try { return (await db.prepare(sql).get()) || { c: 0 }; }
    catch (e) { console.error(`[super:dashboard] ${label}:`, e.message); return { c: 0 }; }
  };

  const admins = await safe('admins', `SELECT id, username, display_name, role, locked, totp_enabled, scopes, last_login, created_at FROM admin_users ORDER BY id`);
  const stats = {
    admins:        admins.length,
    superadmins:   admins.filter(a => a.role === 'superadmin').length,
    lockedAdmins:  admins.filter(a => a.locked).length,
    restricted:    admins.filter(a => a.scopes && parseScopes(a.scopes) !== null).length,
    moderators:    (await safeOne('mods', `SELECT COUNT(*) as c FROM users WHERE role='moderator' AND status='active'`)).c,
    users:         (await safeOne('users', `SELECT COUNT(*) as c FROM users WHERE status='active'`)).c,
    posts:         (await safeOne('posts', `SELECT COUNT(*) as c FROM posts WHERE status='published'`)).c,
    complaints:    (await safeOne('comp', `SELECT COUNT(*) as c FROM complaints WHERE status='new'`)).c,
    subscribers:   (await safeOne('subs', `SELECT COUNT(*) as c FROM newsletter_subscribers WHERE is_active=1`)).c,
    pendingUsers:  (await safeOne('pending', `SELECT COUNT(*) as c FROM users WHERE status='pending'`)).c,
    pendingClaims: (await safeOne('claims', `SELECT COUNT(*) as c FROM account_claims WHERE claim_status='pending'`)).c
  };
  const activity = await safe('activity', `SELECT id, username, role, action, target, detail, created_at FROM activity_logs ORDER BY id DESC LIMIT 12`);
  const audit = await safe('audit', `SELECT id, actor_name, action, table_name, item_id, detail, created_at FROM audit_log ORDER BY id DESC LIMIT 12`);

  // ── সেশন ৮৬: রোল-হায়ারার্কি ও নজরদারি সারসংক্ষেপ (সুপার-এডমিনের চেইন-দৃশ্যমানতা) ──
  // ① চেইন-গণনা (সুপার › এডমিন › মডারেটর › ইউজার) ② user_mgmt-স্কোপধারী মডারেটররা
  // ③ নিষিদ্ধ ইউজার ④ মডারেটর-তদারকির সাম্প্রতিক অ্যাকশন (audit_log)।
  const oversight = {
    superadmins: (await safeOne('o-super', `SELECT COUNT(*) as c FROM users WHERE role='superadmin' AND status='active'`)).c
      + admins.filter(a => a.role === 'superadmin').length,
    adminsUsers: (await safeOne('o-admin', `SELECT COUNT(*) as c FROM users WHERE role='admin' AND status='active'`)).c,
    adminPanel: admins.filter(a => a.role !== 'superadmin').length,
    moderators: stats.moderators,
    users: stats.users,
    banned: (await safeOne('o-ban', `SELECT COUNT(*) as c FROM users WHERE status='banned'`)).c,
    userMgmtMods: [],
    recentActions: await safe('o-actions', `SELECT id, actor_name, action, detail, created_at FROM audit_log WHERE table_name='users' AND action='status' AND detail LIKE 'moderator-oversight%' ORDER BY id DESC LIMIT 8`)
  };
  try {
    const umRows = await db.prepare(`
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.last_login,
        (SELECT COUNT(*) FROM users WHERE status='banned') AS banned_total
      FROM moderator_scopes ms JOIN users u ON u.id = ms.user_id
      WHERE ms.scope = 'user_mgmt' AND u.status = 'active' LIMIT 12`).all();
    oversight.userMgmtMods = umRows;
  } catch (e) { console.error('[super:dashboard] userMgmtMods:', e.message); }
  const siteStatus = {
    maintenance: (await getSetting('maintenance_mode')) === '1',
    regApproval: (await getSetting('require_registration_approval')) === '1',
    claimApproval: (await getSetting('account_claim_requires_admin_approval')) === '1'
  };
  res.render('admin/super/dashboard', {
    admins, stats, activity, audit, siteStatus, SUPER_AREAS, oversight,
    flash: req.query.saved ? (FLASH[req.query.saved] || 'পরিবর্তন সফল') : null,
    flashErr: req.query.err === '1' ? 'অনুরোধ সম্পূর্ন হয়নি — আবার চেষ্টা করুন' : null,
    currentPath: '/admin/super'
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// অ্যাডমিন ব্যবস্থাপনা
// ══════════════════════════════════════════════════════════════════════════════
router.get('/admins', async (req, res) => {
  const admins = await db.prepare(
    'SELECT id, username, display_name, role, locked, totp_enabled, totp_secret, scopes, last_login, created_at FROM admin_users ORDER BY id'
  ).all();
  res.render('admin/super/admins', {
    admins, SUPER_AREAS,
    meAdminId: (req.session.adminUser && req.session.adminUser.id) || null,
    superCount: admins.filter(a => a.role === 'superadmin').length,
    flash: req.query.saved ? (FLASH[req.query.saved] || 'পরিবর্তন সফল') : null,
    flashErr: req.query.err === '1' ? 'অনুরোধ সম্পূর্ন হয়নি — আবার চেষ্টা করুন' : null,
    currentPath: '/admin/super/admins'
  });
});

// নতুন অ্যাডমিন যুক্ত
router.post('/admins/add', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const display_name = String(req.body.display_name || '').trim();
    const password = String(req.body.password || '');
    const role = req.body.role === 'superadmin' ? 'superadmin' : 'admin';
    if (!/^[a-z0-9_]{3,30}$/.test(username)) return res.redirect('/admin/super/admins?err=1');
    if (password.length < 8) return res.redirect('/admin/super/admins?err=1');
    const exists = await db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
    if (exists) return res.redirect('/admin/super/admins?err=1');
    const scopes = parseScopes(req.body.scopes);
    const hash = await bcrypt.hash(password, 10);
    const r = await db.prepare(
      'INSERT INTO admin_users (username, password_hash, display_name, role, scopes, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(username, hash, display_name || username, role, scopes === null ? null : JSON.stringify(scopes));
    await TA42.audit(db, req, 'super-admin-add', 'admin_users', r.lastInsertRowid, `${username} (${role})`);
    res.redirect('/admin/super/admins?saved=admin_add');
  } catch (e) {
    console.error('[super] admins/add:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// অ্যাডমিন আপডেট — রোল, নাম, কাজের-এরিয়ার অনুমোদন
router.post('/admins/:id/update', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
    if (!target) return res.redirect('/admin/super/admins?err=1');
    const display_name = String(req.body.display_name || '').trim() || target.username;
    let role = req.body.role === 'superadmin' ? 'superadmin' : 'admin';
    // নিরাপত্তা-গার্ড: শেষ সুপার-এডমিনকে সাধারণ অ্যাডমিনে নামানো যায় না
    if (target.role === 'superadmin' && role !== 'superadmin') {
      const sc = (await db.prepare("SELECT COUNT(*) as c FROM admin_users WHERE role = 'superadmin' AND id != ?").get(id)).c;
      if (sc === 0) role = 'superadmin'; // শেষ একজন — রোল অপরিবর্তিত রাখা হলো
    }
    const scopes = parseScopes(req.body.scopes);
    // সুপার-এডমিনের পরিধি কখনোই সীমিত হতে পারে না
    const scopesFinal = (role === 'superadmin') ? null : (scopes === null ? null : JSON.stringify(scopes));
    await db.prepare('UPDATE admin_users SET display_name = ?, role = ?, scopes = ? WHERE id = ?')
      .run(display_name, role, scopesFinal, id);
    await TA42.audit(db, req, 'super-admin-update', 'admin_users', id,
      `role=${role}; scopes=${scopesFinal === null ? 'সীমাহীন' : scopesFinal}`);
    res.redirect('/admin/super/admins?saved=admin_update');
  } catch (e) {
    console.error('[super] admins/update:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// পাসওয়ার্ড রিসেট
router.post('/admins/:id/password', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const password = String(req.body.new_password || '');
    if (password.length < 8) return res.redirect('/admin/super/admins?err=1');
    const hash = await bcrypt.hash(password, 10);
    await db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, id);
    await TA42.audit(db, req, 'super-admin-pwd-reset', 'admin_users', id, '');
    res.redirect('/admin/super/admins?saved=admin_pwd');
  } catch (e) {
    console.error('[super] admins/password:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// লক / আনলক — লক হলে সক্রিয় সেশনও পরের রিকোয়েস্টে বাতিল (server.js মিডলওয়্যার)
router.post('/admins/:id/lock', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
    if (!target) return res.redirect('/admin/super/admins?err=1');
    // নিজেকে বা শেষ সুপার-এডমিনকে লক করা নিষিদ্ধ
    if (req.session.adminUser && req.session.adminUser.id === id) return res.redirect('/admin/super/admins?err=1');
    if (target.role === 'superadmin') {
      const sc = (await db.prepare("SELECT COUNT(*) as c FROM admin_users WHERE role = 'superadmin' AND locked = 0 AND id != ?").get(id)).c;
      if (sc === 0) return res.redirect('/admin/super/admins?err=1');
    }
    await db.prepare('UPDATE admin_users SET locked = 1 WHERE id = ?').run(id);
    await TA42.audit(db, req, 'super-admin-lock', 'admin_users', id, target.username);
    res.redirect('/admin/super/admins?saved=admin_lock');
  } catch (e) {
    console.error('[super] admins/lock:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

router.post('/admins/:id/unlock', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.prepare('UPDATE admin_users SET locked = 0 WHERE id = ?').run(id);
    await TA42.audit(db, req, 'super-admin-unlock', 'admin_users', id, '');
    res.redirect('/admin/super/admins?saved=admin_unlock');
  } catch (e) {
    console.error('[super] admins/unlock:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// অ্যাডমিন রিমুভ
router.post('/admins/:id/remove', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
    if (!target) return res.redirect('/admin/super/admins?err=1');
    // নিজেকে সরানো নিষিদ্ধ; শেষ সুপার-এডমিনকে সরানো নিষিদ্ধ
    if (req.session.adminUser && req.session.adminUser.id === id) return res.redirect('/admin/super/admins?err=1');
    if (target.role === 'superadmin') {
      const sc = (await db.prepare("SELECT COUNT(*) as c FROM admin_users WHERE role = 'superadmin' AND id != ?").get(id)).c;
      if (sc === 0) return res.redirect('/admin/super/admins?err=1');
    }
    await db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
    await TA42.audit(db, req, 'super-admin-remove', 'admin_users', id, target.username);
    res.redirect('/admin/super/admins?saved=admin_remove');
  } catch (e) {
    console.error('[super] admins/remove:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// 2FA (TOTP) সুপার-এডমিন কর্তৃক বন্ধ
router.post('/admins/:id/2fa-clear', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.prepare('UPDATE admin_users SET totp_enabled = 0, totp_secret = NULL, backup_codes = NULL WHERE id = ?').run(id);
    await TA42.audit(db, req, 'super-admin-2fa-clear', 'admin_users', id, '');
    res.redirect('/admin/super/admins?saved=admin_2fa');
  } catch (e) {
    console.error('[super] admins/2fa-clear:', e);
    res.redirect('/admin/super/admins?err=1');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// সেশন ৯৫: ইউজার তথ্য ও পাসওয়ার্ড সাপোর্ট (অ্যাকাউন্ট-রিকভারি)
// ══════════════════════════════════════════════════════════════════════════════
// নিরাপত্তা-নীতি: ডাটাবেজে পাসওয়ার্ড কখনো plaintext-এ থাকে না — শুধু bcrypt-
// hash (একমুখী, রিভার্স-অসম্ভব)। সুপার-এডমিন "বিপদে পড়া" ব্যবহারকারীকে সাহায্য
// করেন ইন্ডাস্ট্রি-স্ট্যান্ডার্ড পথে: ইউজারের পরিচয়-তথ্য (আইডি/নাম/ইমেইল/সর্বশেষ
// পাসওয়ার্ড-পরিবর্তনের তারিখ) দেখে যাচাই করে এক-বার-ব্যবহারযোগ্য "অস্থায়ী
// পাসওয়ার্ড" (Lekhok#NNNN) তৈরি করে ইউজারকে দেন। ইউজার এই পাসওয়ার্ডে লগইন
// করলেই ফোর্স-চেঞ্জ গেট (/force-change-password) তাকে নিজস্ব নতুন পাসওয়ার্ড
// সেট করতে বাধ্য করে। প্রতিটি মিউটেশন audit_log-এ TA42.audit দিয়ে রেকর্ড হয়।
// ── GET /admin/super/users-support — তথ্য-তালিকা (সার্ভার-সাইড সার্চ + ক্লায়েন্ট-ফিল্টার) ──
router.get('/users-support', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let sql = `SELECT u.id, u.username, u.full_name, u.pen_name, u.email, u.phone, u.role, u.status,
                      u.gender, u.avatar_url, u.password_changed_at, u.must_change_password,
                      u.totp_enabled, u.last_login, u.created_at,
                      (SELECT m.member_id FROM members m WHERE m.user_id = u.id LIMIT 1) AS member_id
               FROM users u`;
    const params = [];
    if (q) {
      sql += ` WHERE (u.username LIKE ? OR u.full_name LIKE ? OR u.pen_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR CAST(u.id AS TEXT) LIKE ?)`;
      params.push('%' + q + '%', '%' + q + '%', '%' + q + '%', '%' + q + '%', '%' + q + '%', '%' + q + '%');
    }
    sql += ` ORDER BY (u.must_change_password = 1) DESC, u.id DESC LIMIT 300`;
    const users = await db.prepare(sql).all(...params);

    // পরিসংখ্যান-চিপ (সার্চ-নিরপেক্ষ, পূর্ণ-টেবিল থেকে)
    const one = async (label, s) => {
      try { return (await db.prepare(s).get()).c; }
      catch (e) { console.error(`[super:users-support] ${label}:`, e.message); return 0; }
    };
    const stats = {
      total:       await one('total',  'SELECT COUNT(*) as c FROM users'),
      active:      await one('active', "SELECT COUNT(*) as c FROM users WHERE status='active'"),
      pending:     await one('pend',   "SELECT COUNT(*) as c FROM users WHERE status='pending'"),
      banned:      await one('banned', "SELECT COUNT(*) as c FROM users WHERE status='banned'"),
      tempActive:  await one('temp',   'SELECT COUNT(*) as c FROM users WHERE must_change_password = 1'),
      with2fa:     await one('2fa',    'SELECT COUNT(*) as c FROM users WHERE totp_enabled = 1')
    };

    res.render('admin/super/users', {
      users, q, stats,
      flash: req.query.saved ? (FLASH[req.query.saved] || 'পরিবর্তন সফল') : null,
      flashErr: req.query.err === '1' ? 'অনুরোধ সম্পূর্ন হয়নি — আবার চেষ্টা করুন' : null,
      currentPath: '/admin/super/users-support'
    });
  } catch (e) {
    console.error('[super] users-support:', e);
    res.status(500).send('ইউজার-তালিকা লোড ব্যর্থ');
  }
});

// ── POST /admin/super/users/:id/reset-temp — অস্থায়ী পাসওয়ার্ড জেনারেশন (JSON) ──
// fetch()-ভিত্তিক (Content-Type: application/json → CSRF-গার্ডের urlencoded/multipart
// স্কোপের বাইরে; ক্রস-অরিজিন সিম্পল-ফর্ম JSON পাঠাতে পারে না)। রেসপন্সে কাঁচা
// টেম্পোরারি পাসওয়ার্ড একবারই দেখানো হয় — সার্ভার আর কোথাও সংরক্ষণ করে না।
router.post('/users/:id/reset-temp', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) return res.status(400).json({ ok: false, error: 'অবৈধ আইডি' });
    const target = await db.prepare('SELECT id, username, full_name, role, status, must_change_password FROM users WHERE id = ?').get(id);
    if (!target) return res.status(404).json({ ok: false, error: 'ব্যবহারকারী পাওয়া যায়নি' });

    // ৮-অক্ষরের ওয়ান-টাইম পাসওয়ার্ড (crypto.randomInt — predictible Math.random নয়)
    const crypto = require('crypto');
    const rawTemp = 'Lekhok#' + crypto.randomInt(1000, 9999);
    const hash = await bcrypt.hash(rawTemp, 10);
    await db.prepare(
      "UPDATE users SET password_hash = ?, must_change_password = 1, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(hash, id);

    await TA42.audit(db, req, 'super-user-temp-pwd', 'users', id,
      `${target.username} (${target.full_name || target.username})${target.must_change_password ? ' — পুনঃজেনারেট' : ''}`);

    res.json({
      ok: true,
      message: 'অস্থায়ী পাসওয়ার্ড সফলভাবে তৈরি হয়েছে।',
      temporaryPassword: rawTemp,
      username: target.username,
      fullName: target.full_name || target.username,
      loginHint: target.username
    });
  } catch (e) {
    console.error('[super] users/reset-temp:', e);
    res.status(500).json({ ok: false, error: 'সার্ভার সমস্যা — আবার চেষ্টা করুন' });
  }
});


// ══════════════════════════════════════════════════════════════════════════════
// সংবেদনশীল সাইট-তথ্য ও সাইট-ওয়াইড টগল
// ══════════════════════════════════════════════════════════════════════════════
router.get('/settings', async (req, res) => {
  const keys = ['site_name', 'motto', 'tagline', 'contact_email', 'contact_phone', 'contact_address',
                'facebook_url', 'telegram_url', 'youtube_url', 'twitter_url',
                'require_registration_approval', 'account_claim_requires_admin_approval', 'maintenance_mode'];
  const settings = {};
  for (const k of keys) settings[k] = (await getSetting(k)) || '';
  res.render('admin/super/settings', {
    settings,
    flash: req.query.saved ? (FLASH[req.query.saved] || 'সংরক্ষিত হয়েছে') : null,
    currentPath: '/admin/super/settings'
  });
});

router.post('/settings', async (req, res) => {
  const keys = ['site_name', 'motto', 'tagline', 'contact_email', 'contact_phone', 'contact_address',
                'facebook_url', 'telegram_url', 'youtube_url', 'twitter_url'];
  for (const k of keys) await setSetting(k, String(req.body[k] || '').trim());
  // টগলগুলো চেকবক্স — অনুপস্থিত = বন্ধ
  await setSetting('require_registration_approval', req.body.require_registration_approval === 'on' ? '1' : '0');
  await setSetting('account_claim_requires_admin_approval', req.body.account_claim_requires_admin_approval === 'on' ? '1' : '0');
  await TA42.audit(db, req, 'super-settings-save', 'settings', null, keys.filter(k => req.body[k]).join(','));
  res.redirect('/admin/super/settings?saved=settings');
});

// রক্ষণাবেক্ষণ-মোড টগল (সাইট-লক)
router.post('/maintenance', async (req, res) => {
  const cur = await getSetting('maintenance_mode');
  const nextv = (cur === '1') ? '0' : '1';
  await setSetting('maintenance_mode', nextv);
  await TA42.audit(db, req, 'super-maintenance-toggle', 'settings', null, nextv === '1' ? 'ON' : 'OFF');
  const back = req.get('referer') || '/admin/super';
  res.redirect(nextv === '1' ? '/admin/super?saved=maint_on' : '/admin/super?saved=maint_off');
  void back;
});

// ══════════════════════════════════════════════════════════════════════════════
// সাপোর্ট-সেন্টার নিয়োগ (lekhok-forum-next → Express পোর্ট) — নাম-সার্চ + রোল-যাচাই
// সুপার-অ্যাডমিন একজন সক্রিয় admin/superadmin-কে "নিয়োজিত সাপোর্ট-অ্যাডমিন" করেন;
// ইউজারদের অভিযোগ তার মেসেঞ্জার-থ্রেড দিয়ে রিভিউ-ডেস্কে মিরর হয়।
// ══════════════════════════════════════════════════════════════════════════════
router.get('/support-settings', async (req, res) => {
  const current = await SC.getSupportAdmin();
  res.render('admin/super/support-settings', {
    current,
    flash: FLASH[req.query.saved] || null,
    err: SUPPORT_ERR[req.query.err] || null,
    currentPath: '/admin/super/support-settings'
  });
});

// নাম-সার্চ (JSON) — ইউজার-কনফার্মড সিদ্ধান্ত-⑥ প্যাটার্ন: নাম লিখে খুঁজে নিয়োগ
router.get('/support-settings/search', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (!q) return res.json({ users: [] });
  const like = '%' + q + '%';
  const rows = await db.prepare(
    "SELECT id, full_name, username, avatar_url, role FROM users WHERE status = 'active' AND role IN ('admin','superadmin') AND (full_name LIKE ? OR username LIKE ?) ORDER BY full_name LIMIT 10"
  ).all(like, like);
  res.json({ users: rows });
});

router.post('/support-settings', async (req, res) => {
  const uid = parseInt(req.body.user_id, 10);
  const ok = uid && await SC.setSupportAdmin(uid);
  if (!ok) return res.redirect('/admin/super/support-settings?err=not_eligible');
  const target = await db.prepare('SELECT username FROM users WHERE id = ?').get(uid);
  await TA42.audit(db, req, 'support-admin-assign', 'settings', null, 'SUPPORT_ADMIN_ID=' + uid + (target ? ' (' + target.username + ')' : ''));
  res.redirect('/admin/super/support-settings?saved=support_admin');
});

router.post('/support-settings/clear', async (req, res) => {
  await SC.clearSupportAdmin();
  await TA42.audit(db, req, 'support-admin-clear', 'settings', null, 'SUPPORT_ADMIN_ID=');
  res.redirect('/admin/super/support-settings?saved=support_clear');
});

// ══════════════════════════════════════════════════════════════════════════════
// কমিউনিটি-অ্যাকাউন্ট রোল নিয়ন্ত্রণ (superadmin-এ উন্নীত/অবনমনসহ)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/users/:id/role', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const role = String(req.body.role || '');
    if (!['user', 'moderator', 'admin', 'superadmin'].includes(role)) return res.redirect('/admin/users?err=1');
    const target = await db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id);
    if (!target) return res.redirect('/admin/users?err=1');
    // শেষ কমিউনিটি-সুপার-এডমিনকে অবনমন নিষিদ্ধ (কেবল এক পথ থাকলে)
    if (target.role === 'superadmin' && role !== 'superadmin') {
      const au = await db.prepare("SELECT COUNT(*) as c FROM admin_users WHERE role='superadmin' AND locked=0").get();
      const uu = await db.prepare("SELECT COUNT(*) as c FROM users WHERE role='superadmin' AND status='active' AND id != ?").get(id);
      if (au.c === 0 && uu.c === 0) return res.redirect('/admin/users?err=1');
    }
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    if (role === 'moderator') {
      const has = await db.prepare('SELECT id FROM moderator_scopes WHERE user_id = ?').get(id);
      if (!has) await db.grantModerator(id, (db.MODERATOR_SCOPES || []).map(s => s.key), null);
    }
    await TA42.audit(db, req, 'super-user-role', 'users', id, `${target.username}: ${target.role} → ${role}`);
    res.redirect('/admin/users?saved=user_role');
  } catch (e) {
    console.error('[super] users/role:', e);
    res.redirect('/admin/users?err=1');
  }
});

// ═══ সেশন ৯০: user_mgmt স্কোপ প্রত্যাহার (সুপার-এডমিনের সরাসরি নিয়ন্ত্রণ) ═══
// নজরদারি-কার্ডের মডারেটর-তালিকা থেকেই এক-ক্লিকে 'ইউজার তদারকি' স্কোপ বাতিল —
// মডারেটর সঙ্গে সঙ্গে /moderator/users-এ অ্যাক্সেস হারান (requireScope লাইভ-চেক)।
// রোল অপরিবর্তিত থাকে — শুধু স্কোপটাই প্রত্যাহার হয় (নিয়োগ/অপসারণ এডমিনের এরিয়া)।
router.post('/moderators/:id/revoke-user-mgmt', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(id);
    if (!target || target.role !== 'moderator') return res.redirect('/admin/super?err=1');
    const r = await db.prepare("DELETE FROM moderator_scopes WHERE user_id = ? AND scope = 'user_mgmt'").run(id);
    if (r && r.changes === 0) return res.redirect('/admin/super?err=1');
    await TA42.audit(db, req, 'scope-revoke', 'users', id, 'user_mgmt স্কোপ প্রত্যাহার: ' + target.username);
    res.redirect('/admin/super?saved=scope_revoke');
  } catch (e) {
    console.error('[super] revoke-user-mgmt:', e);
    res.redirect('/admin/super?err=1');
  }
});

module.exports = router;
