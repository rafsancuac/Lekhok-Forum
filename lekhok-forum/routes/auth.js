const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { avatarUpload, withUpload } = require('../middleware/upload');
const security = require('../helpers/security-config');
const { loginLimiter, forgotLimiter, registerLimiter, clientIp } = require('../helpers/rate-limit');
const totp = require('../helpers/totp');

// ── সেশন ৪৬: রোল-বেজড রিডাইরেক্ট হেল্পার ─────────────────────────────────────
// প্রতিটি রোলের নিজস্ব ড্যাশবোর্ড — admin→/admin, moderator→/moderator, user→/dashboard।
function dashboardFor(user) {
  const role = (user && user.role) || 'user';
  if (role === 'admin') return '/admin';
  if (role === 'moderator') return '/moderator';
  return '/dashboard';
}

// শুধু সেফ, same-origin রিলেটিভ পাথ গ্রহণ করি (// বা scheme:// ব্লক — open-redirect গার্ড)।
function safeNextPath(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return null;
  return raw;
}

// ── Login (GET) ──────────────────────────────────────────────────────────────
router.get('/login', async (req, res) => {
  if (req.session.adminUser) return res.redirect('/admin');
  if (req.session.user) return res.redirect(dashboardFor(req.session.user));
  res.render('user/login', { error: null, next: safeNextPath(req.query.next), currentPath: '/login' });
});

// ── Login (POST) ─────────────────────────────────────────────────────────────
// 1) Regular users (users table)
// 2) Fallback: admin panel accounts (admin_users) — admins were previously
//    shown a confusing "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড" on /login; now the
//    same credentials work here and land straight on /admin.
// সেশন ৪৩: লগইন ব্রুট-ফোর্স গার্ড — IP+username-এ ১৫ মিনিটে ১০ ব্যর্থ চেষ্টা
const _loginHits43 = new Map();
function loginLimited(key) {
  const now = Date.now();
  const arr = (_loginHits43.get(key) || []).filter(t => now - t < 15 * 60 * 1000);
  _loginHits43.set(key, arr);
  return arr.length >= 10;
}
function loginFail(key) { const now = Date.now(); const arr = (_loginHits43.get(key) || []).filter(t => now - t < 15 * 60 * 1000); arr.push(now); _loginHits43.set(key, arr); }
function loginOk(key) { _loginHits43.delete(key); }

router.post('/login', async (req, res) => {
  const lk43 = (req.ip || '') + '|' + String(req.body.username || '').toLowerCase();
  if (loginLimited(lk43)) return res.status(429).render('user/login', { error: 'অনেকবার ব্যর্থ চেষ্টা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
  try {
    const { username, password } = req.body;
    const ident = String(username || '').trim();
    // টাস্ক ১৪: Member ID / Email / username — তিনটিই লগইন আইডেন্টিফায়ার
    // (Section 13: Member ID বা Email; username ব্যাকওয়ার্ড-কম্প্যাট)
    let user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(ident, ident);
    if (!user && /^MEM-/i.test(ident)) {
      user = await db.prepare(
        'SELECT u.* FROM users u JOIN members m ON m.user_id = u.id WHERE UPPER(m.member_id) = ?'
      ).get(ident.toUpperCase());
    }
    if (user && await bcrypt.compare(password, user.password_hash)) {
      if (user.status === 'banned') {
        return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
      }
      if (user.status === 'pending') {
        return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট এখনও যাচাইয়ের অপেক্ষায়। অ্যাডমিন অনুমোদনের পর লগইন করুন।', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
      }
      loginOk(lk43);
      req.session.user = { id: user.id, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
      await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
      // রোল-বেজড গন্তব্য + (সেফ) `next` — প্রোটেক্টেড পেজ থেকে এলে সেখানেই ফিরে যাই
      const dest = safeNextPath(req.body.next || req.query.next) || dashboardFor(user);
      return new Promise((resolve) => req.session.save((err) => {
        if (err) console.error('[auth] /login session save error:', err);
        res.redirect(dest);
        resolve();
      }));
    }

    // Admin-panel account fallback
    const admin = await db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      // সিকিউরিটি: MFA সক্রিয় থাকলে এই পথ দিয়েও যাচাই বাধ্যতামূলক
      // (অন্যথায় /login দিয়ে 2FA এড়িয়ে যাওয়া যেত)।
      if (admin.totp_enabled) {
        const code = String(req.body.totp_code || '').trim();
        let mfaOk = totp.verifyTotp(admin.totp_secret, code);
        if (!mfaOk && admin.backup_codes) {
          try {
            const codes = JSON.parse(admin.backup_codes);
            const consumed = totp.consumeBackupCode(code, codes);
            if (consumed.ok) { mfaOk = true; await db.prepare('UPDATE admin_users SET backup_codes = ? WHERE id = ?').run(JSON.stringify(consumed.remaining), admin.id); }
          } catch (e) {}
        }
        if (!mfaOk) {
          return res.render('user/login', { error: 'এই অ্যাকাউন্টে 2FA সক্রিয়। অ্যাপ থেকে বর্তমান কোড দিন (অথবা অ্যাডমিন লগইন ব্যবহার করুন)।', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
        }
      }
      loginOk(lk43);
      req.session.adminUser = { id: admin.id, username: admin.username, display_name: admin.display_name };
      const dest = safeNextPath(req.body.next || req.query.next) || '/admin';
      return new Promise((resolve) => req.session.regenerate((err) => {
        if (err) console.error('[auth] /login admin session regenerate error:', err);
        req.session.adminUser = { id: admin.id, username: admin.username, display_name: admin.display_name };
        req.session.save((err2) => {
          if (err2) console.error('[auth] /login admin session save error:', err2);
          res.redirect(dest);
          resolve();
        });
      }));
    }

    loginFail((req.ip || '') + '|' + String(req.body.username || '').toLowerCase());
    return res.render('user/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
  } catch (e) {
    console.error('[auth] /login error:', e);
    return res.status(500).render('user/login', { error: 'লগইন ব্যর্থ: ' + e.message, next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
  }
});

// ── Register (GET) ───────────────────────────────────────────────────────────
router.get('/register', async (req, res) => {
  if (req.session.adminUser) return res.redirect('/admin');
  if (req.session.user) return res.redirect(dashboardFor(req.session.user));
  res.render('user/register', { error: null, form: {}, currentPath: '/register' });
});

// ── Register (POST, with optional avatar upload) ────────────────────────────
// টাস্ক ১৪: নিবন্ধনে অটো Member ID + (ঐচ্ছিক) অ্যাডমিন অনুমোদন গেট।
// ডিফল্ট: তাৎক্ষণিক active (আগের মতো)। settings-এ `require_registration_approval`
// = 1 হলে → PENDING_REVIEW (অ্যাডমিন অনুমোদনের আগে active নয়)।
router.post('/register', withUpload(avatarUpload), async (req, res) => {
  const rk = clientIp(req) + '|register';
  if (registerLimiter.isLimited(rk)) return res.status(429).render('user/register', { error: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।', form: req.body, currentPath: '/register' });
  registerLimiter.hit(rk);
  const { username, password, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, member_id, department, session } = req.body;
  const back = (err) => res.render('user/register', { error: err, form: req.body, currentPath: '/register' });

  if (req.uploadError) return back(req.uploadError);
  if (!password || !full_name) return back('পাসওয়ার্ড ও নাম আবশ্যক');
  if (password.length < 6) return back('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (!username && !email) return back('ব্যবহারকারী নাম অথবা ইমেইল আবশ্যক');

  // username ঐচ্ছিক — না দিলে email লোকাল-পার্ট থেকে বানাই
  let uname = String(username || '').trim();
  if (!uname) {
    const base = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
    uname = base || ('m' + Date.now().toString(36));
  }
  const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(uname, email || '');
  if (existing) return back('এই ব্যবহারকারী নাম বা ইমেইল ইতিমধ্যে ব্যবহৃত');

  // অ্যাডমিন অনুমোদন গেট (কেন্দ্রীভূত কনফিগ; ডিফল্ট off — ব্যাকওয়ার্ড-কম্প্যাট)
  const requireApproval = await security.isRegistrationApprovalRequired();

  const hash = await bcrypt.hash(password, 10);
  const avatarPath = req.file ? (req.file.url || req.file.path) : null;
  const status = requireApproval ? 'pending' : 'active';
  const result = await db.prepare(
    `INSERT INTO users (username, password_hash, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    uname, hash, full_name, email || null, phone || null, bio || null, designation || null, address || null,
    birth_date || null, gender || 'other',
    social_fb || null, social_twitter || null, social_linkedin || null, social_website || null, avatarPath, status
  );
  const uid = result.lastInsertRowid;

  // টাস্ক ১৪: প্রতিটি নিবন্ধনে একটি Member Profile + অটো Member ID
  try {
    const mid = await db.nextMemberId();
    await db.prepare(
      "INSERT INTO members (name, role, designation, member_type, term_year, department, user_id, member_id, account_status, sort_order) VALUES (?, 'সদস্য', ?, 'general', ?, ?, ?, ?, ?, 0)"
    ).run(full_name, designation || null, session || null, department || null, uid, mid, requireApproval ? 'pending' : 'active');
    // পেন্ডিং হলে ক্লেইম-রেকর্ড (kind=registration) — অ্যাডমিন রিভিউ ড্যাশবোর্ডে দেখাবে
    if (requireApproval) {
      await db.prepare(
        "INSERT INTO account_claims (member_profile_id, submitted_user_id, kind, claim_status, submitted_data) SELECT id, ?, 'registration', 'pending', ? FROM members WHERE user_id = ?"
      ).run(uid, JSON.stringify({ name: full_name, email: email || '', phone: phone || '', department: department || '', session: session || '' }), uid);
    }
  } catch (e) { console.error('[auth] register member-profile create failed:', e.message); }

  if (requireApproval) {
    return res.render('user/register-pending', { email, currentPath: '/register' });
  }
  req.session.user = { id: uid, username: uname, full_name, avatar_url: avatarPath, gender: gender || 'other', role: 'user' };
  req.session.save(() => res.redirect('/profile/' + uname + '?welcome=1'));
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  // req.session.destroy() ensures the session is removed from the DB-backed
  // store before we redirect — nulling req.session.user alone is racy on
  // serverless because the next request can still read the old user.
  req.session.destroy(() => res.redirect('/'));
});

// ── Profile edit (GET) ───────────────────────────────────────────────────────
router.get('/profile/edit', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  res.render('user/edit', { user, error: req.query.err || null, success: req.query.ok || null, currentPath: '/profile/edit' });
});

// ── Profile edit (POST, with optional avatar upload) ─────────────────────────
router.post('/profile/edit', withUpload(avatarUpload), async (req, res) => {
  try {
  if (!req.session.user) return res.redirect('/login');
  const u = req.session.user;
  const { full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, show_email, show_phone, show_birth, new_password, confirm_password } = req.body;

  if (req.uploadError) {
    return res.redirect('/profile/edit?err=' + encodeURIComponent(req.uploadError));
  }
  if (!full_name || !full_name.trim()) {
    return res.redirect('/profile/edit?err=' + encodeURIComponent('পূর্ণ নাম আবশ্যক'));
  }

  // Password change (optional). Empty + empty = no change. Any non-empty value
  // must be 6+ chars and match the confirm field.
  let passwordHash = null;
  if (new_password || confirm_password) {
    if (String(new_password).length < 6) {
      return res.redirect('/profile/edit?err=' + encodeURIComponent('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'));
    }
    if (new_password !== confirm_password) {
      return res.redirect('/profile/edit?err=' + encodeURIComponent('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না'));
    }
    passwordHash = await bcrypt.hash(new_password, 10);
  }

  // Preserve current avatar unless a new file was uploaded.
  // req.file.url is correct in BOTH modes: local → /uploads/avatars/…, Vercel → blob https URL
  // Always pass NULL when no new file — COALESCE then keeps the existing avatar.
  const avatarPath = req.file ? (req.file.url || req.file.path) : null;
  // Treat empty strings as null for nullable fields. The form always sends every field, so a blank
  // value is the user's intent to clear it.
  const clean = (v) => (v == null || String(v).trim() === '') ? null : String(v).trim();
  if (passwordHash) {
    await db.prepare(
      `UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=?, avatar_url=COALESCE(?, avatar_url), password_hash=? WHERE id=?`
    ).run(
      full_name.trim(),
      clean(email),
      clean(phone),
      clean(bio),
      clean(designation),
      clean(address),
      clean(birth_date),
      gender && ['male','female','other'].includes(gender) ? gender : (u.gender || 'other'),
      clean(social_fb),
      clean(social_twitter),
      clean(social_linkedin),
      clean(social_website),
      show_email ? 1 : 0,
      show_phone ? 1 : 0,
      show_birth ? 1 : 0,
      avatarPath,
      passwordHash,
      u.id
    );
  } else {
    await db.prepare(
      `UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=?, avatar_url=COALESCE(?, avatar_url) WHERE id=?`
    ).run(
      full_name.trim(),
      clean(email),
      clean(phone),
      clean(bio),
      clean(designation),
      clean(address),
      clean(birth_date),
      gender && ['male','female','other'].includes(gender) ? gender : (u.gender || 'other'),
      clean(social_fb),
      clean(social_twitter),
      clean(social_linkedin),
      clean(social_website),
      show_email ? 1 : 0,
      show_phone ? 1 : 0,
      show_birth ? 1 : 0,
      avatarPath,
      u.id
    );
  }
  // Re-read the full user record so session reflects every updated field (including avatar_url).
  const updated = await db.prepare('SELECT * FROM users WHERE id = ?').get(u.id);
  if (!updated || !updated.username) {
    return res.redirect('/profile/edit?err=' + encodeURIComponent('প্রোফাইল আপডেটে সমস্যা হয়েছে'));
  }
  req.session.user = {
    id: updated.id,
    username: updated.username,
    full_name: updated.full_name,
    avatar_url: updated.avatar_url,
    gender: updated.gender,
    role: updated.role || 'user'
  };
  // Explicitly save session before redirect — required on serverless (Vercel)
  // where the response is sent before the async session write completes.
  return new Promise((resolve) => {
    req.session.save((err) => {
      if (err) console.error('[auth] /profile/edit session save error:', err);
      res.redirect('/profile/' + updated.username + '?updated=1' + (passwordHash ? '&pwd=1' : ''));
      resolve();
    });
  });
  } catch (e) {
    console.error('[auth] /profile/edit error:', e && e.stack || e);
    res.status(500).send('প্রোফাইল সম্পাদনায় সমস্যা: ' + (e && e.message || 'অজানা'));
  }
});

// ── টাস্ক ১৪ (Section 24): ফরগট/রিসেট পাসওয়ার্ড ─────────────────────────────
// Member ID বা Name একা রিকভারি নয় (কোনোটাই সিক্রেট নয়) — শুধু verified email।
// টোকেন random 32-বাইট, SHA-256 হ্যাশ করে সংরক্ষণ; ৬০ মিনিট মেয়াদ; একবারই ব্যবহারযোগ্য।
const cryptoAuth = require('crypto');

function findUserByIdentifier(ident) {
  return db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(ident, ident);
}

router.get('/forgot-password', (req, res) => {
  res.render('user/forgot-password', { error: null, done: false, currentPath: '/forgot-password' });
});

router.post('/forgot-password', async (req, res) => {
  const fk = clientIp(req) + '|forgot';
  if (forgotLimiter.isLimited(fk)) return res.status(429).render('user/forgot-password', { error: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।', done: false, currentPath: '/forgot-password' });
  forgotLimiter.hit(fk);
  const ident = String(req.body.identifier || '').trim();
  const back = (err) => res.render('user/forgot-password', { error: err, done: false, currentPath: '/forgot-password' });
  if (!ident) return back('ইমেইল বা ব্যবহারকারী নাম দিন');
  // Member ID দিয়ে চাইলে → লিংকড ইউজারের ইমেইল খুঁজি
  let user = findUserByIdentifier(ident);
  if (!user && /^MEM-/i.test(ident)) {
    const row = await db.prepare(
      'SELECT u.* FROM users u JOIN members m ON m.user_id = u.id WHERE UPPER(m.member_id) = ?'
    ).get(ident.toUpperCase());
    user = row || null;
  }
  // ইউজার এনিউমারেশন রোধ: পাওয়া না গেলেও একই বার্তা
  if (!user || !user.email) {
    return res.render('user/forgot-password', { error: null, done: true, currentPath: '/forgot-password' });
  }
  const token = cryptoAuth.randomBytes(32).toString('hex');
  const tokenHash = cryptoAuth.createHash('sha256').update(token).digest('hex');
  await db.prepare(
    "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, datetime('now', '+60 minutes'))"
  ).run(user.id, tokenHash);

  const mailer = require('../helpers/mailer');
  // রিসেট লিংকের বেস = আসল রিকোয়েস্ট অরিজিন (Vercel-এ BASE_URL ছাড়াই সঠিক)
  const origin = (process.env.BASE_URL || (req.protocol + '://' + req.get('host')));
  const resetUrl = origin + '/reset-password?token=' + token;
  if (mailer.isConfigured()) {
    try {
      await mailer.sendMail({
        to: user.email,
        subject: 'পাসওয়ার্ড রিসেট — লেখক ফোরাম',
        text: 'পাসওয়ার্ড রিসেট করতে এই লিংকে যান: ' + resetUrl + '\nলিংকটি ৬০ মিনিটের মধ্যে মেয়াদোত্তীর্ণ হবে।',
        html: '<p>পাসওয়ার্ড রিসেট করতে <a href="' + resetUrl + '">এখানে ক্লিক করুন</a>। লিংকটি ৬০ মিনিটের মধ্যে মেয়াদোত্তীর্ণ হবে।</p>'
      });
    } catch (e) { console.error('[auth] forgot-password email failed:', e.message); }
  } else {
    // ইমেইল সার্ভিস কনফিগার হয়নি (ডেভ/ডেমো) — রিসেট লিংক কনসোলে দেখাই
    console.log('[auth] (no email service) password reset link:', resetUrl);
  }
  res.render('user/forgot-password', { error: null, done: true, currentPath: '/forgot-password' });
});

router.get('/reset-password', async (req, res) => {
  const token = String(req.query.token || '');
  const tokenHash = token ? cryptoAuth.createHash('sha256').update(token).digest('hex') : '';
  const rec = tokenHash ? await db.prepare("SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')").get(tokenHash) : null;
  if (!rec) return res.render('user/reset-password', { error: 'এই লিংকটি মেয়াদোত্তীর্ণ বা ইতিমধ্যে ব্যবহৃত। আবার অনুরোধ করুন।', token: null, currentPath: '/reset-password' });
  res.render('user/reset-password', { error: null, token, currentPath: '/reset-password' });
});

router.post('/reset-password', async (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirmPassword || '');
  const back = (err) => res.render('user/reset-password', { error: err, token, currentPath: '/reset-password' });
  if (!token) return back('রিসেট টোকেন নেই — আবার অনুরোধ করুন');
  if (password.length < 6) return back('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (password !== confirm) return back('পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না');
  const tokenHash = cryptoAuth.createHash('sha256').update(token).digest('hex');
  const rec = await db.prepare("SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')").get(tokenHash);
  if (!rec) return back('এই লিংকটি মেয়াদোত্তীর্ণ বা ইতিমধ্যে ব্যবহৃত');
  const hash = await bcrypt.hash(password, 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, rec.user_id);
  await db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(rec.id);
  // অ্যাডমিন-অ্যাকশন হিসেবে অডিট (পাসওয়ার্ড কখনো লগ হয় না)
  try { await db.logActivity({ user_id: rec.user_id, username: null, role: 'user', action: 'password-reset', target: 'users', detail: 'self-service' }); } catch (e) {}
  res.redirect('/login?reset=1');
});

module.exports = router;
