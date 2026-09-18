const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { avatarUpload, withUpload } = require('../middleware/upload');
const security = require('../helpers/security-config');
const { loginLimiter, forgotLimiter, registerLimiter, clientIp } = require('../helpers/rate-limit');
const totp = require('../helpers/totp');
const otp = require('../helpers/otp'); // সেশন ১১৫: ইমেইল-ওটিপি (মাল্টি-মেথড 2FA)
const rolePolicy = require('../helpers/role-policy');

// ── সেশন ৪৬: রোল-বেজড রিডাইরেক্ট হেল্পার ─────────────────────────────────────
// প্রতিটি রোলের নিজস্ব ড্যাশবোর্ড — admin→/admin, moderator→/moderator, user→/dashboard।
function dashboardFor(user) {
  const role = (user && user.role) || 'user';
  if (role === 'admin' || role === 'superadmin') return '/admin';
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
  // সেশন ৬২: 2FA-ধাপ ৫-বার ভুল কোডে লক হলে এখানে ফেরে — কারণ জানাই।
  const locked62 = req.query.e === 'mfa_locked';
  res.render('user/login', {
    error: locked62 ? 'নিরাপত্তার কারণে দুই-ধাপ যাচাই বন্ধ করা হয়েছে (একাধিক ভুল কোড)। আবার লগইন করুন।' : null,
    next: safeNextPath(req.query.next),
    currentPath: '/login'
  });
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
    // সেশন ৯১-ফিক্স: ফিল্ড-বাইন্ড ক্র্যাশ-গার্ড — username/password অনুপস্থিত (বা
    // নন-স্ট্রিং) হলে sql.js "bind a value of an unknown type (undefined)"-500 হতো;
    // এখন সবসময় স্ট্রিং-কোয়ার্স → গ্রেসফুল "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড"।
    const username = String(req.body && req.body.username || '');
    const password = String(req.body && req.body.password || '');
    const ident = username.trim();
    // টাস্ক ১৪: Member ID / Email / username — তিনটিই লগইন আইডেন্টিফায়ার
    // (Section 13: Member ID বা Email; username ব্যাকওয়ার্ড-কম্প্যাট)
    let user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(ident, ident);
    if (!user && /^MEM-/i.test(ident)) {
      user = await db.prepare(
        'SELECT u.* FROM users u JOIN members m ON m.user_id = u.id WHERE UPPER(m.member_id) = ?'
      ).get(ident.toUpperCase());
    }
    if (user && await bcrypt.compare(password, user.password_hash)) {
      // ── সেশন ৮৩: লগইন-পোর্টাল বিভাজন (নিরাপত্তা) ─────────────────────────
      // /login = শুধু সাধারণ ইউজার। স্টাফ (মডারেটর/এডমিন/সুপার-এডমিন)
      // অ্যাকাউন্ট এখানে প্রত্যাখ্যাত — তাদের জায়গা স্টাফ পোর্টাল (/admin/login)।
      if (rolePolicy.isStaffRole(user.role)) {
        loginOk(lk43);
        return res.render('user/login', {
          error: rolePolicy.USER_PORTAL_STAFF_MESSAGE + ' <a href="/admin/login">স্টাফ পোর্টালে লগইন করুন</a>',
          next: safeNextPath(req.body.next || req.query.next),
          currentPath: '/login',
          staffNotice: true
        });
      }
      if (user.status === 'banned') {
        return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
      }
      if (user.status === 'pending') {
        return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট এখনও যাচাইয়ের অপেক্ষায়। অ্যাডমিন অনুমোদনের পর লগইন করুন।', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
      }
      loginOk(lk43);
      // সেশন ৫৮: 2FA-সক্রিয় অ্যাকাউন্টে দ্বিতীয় ধাপ — পাসওয়ার্ড ঠিক মেলেছে,
      // এখন অ্যাপের ৬-অঙ্কের কোড চাই (লগইন-ফর্মে কোনো 2FA-ফিল্ড নেই; সেটআপ
      // ইউজারের সেটিংস-পেজে)। পাসওয়ার্ড সেশনে রাখি না — শুধু মেয়াদী পেন্ডিং-স্টেট।
      const dest = safeNextPath(req.body.next || req.query.next) || dashboardFor(user);
      // ── সেশন ১১৫: মাল্টি-মেথড 2FA — মেথড-রাউটিং ──
      // twofa_method='email' হলে অ্যাপের বদলে নিবন্ধিত ইমেইলে ৬-অঙ্কের কোড যায়
      // (Resend ফ্রি-টিয়ার; কি না থাকলে কনসোল-ফলব্যাক — কোড DB-তে থাকেই, যাচাই চলে)।
      // মেথড='totp' বা লেগেসি (কলাম-NULL) হলে আগের অ্যাপ-চ্যালেঞ্জই চলে।
      // গার্ড: ইমেইল-মেথড কিন্তু ইমেইলই নেই → লক-আউট-প্রতিরোধে অ্যাপ-সিক্রেট থাকলে
      // সেটিই ফিরে যাই, নইলে 2FA-স্কিপ (fail-open, কনসোলে সতর্কতা)।
      const mfaMethod = (user.totp_enabled && user.twofa_method === 'email') ? 'email' : 'totp';
      if (mfaMethod === 'email' && user.email) {
        const issue = otp.issueOtp(user.id, 'email');
        let otpSent = false;
        if (issue.ok) {
          const sent = await otp.sendMail({
            to: user.email,
            subject: 'লেখক ফোরাম: লগইন ভেরিফিকেশন কোড',
            html: otp.otpEmailHtml(issue.code, 'login'),
          });
          otpSent = !!sent.ok;
          if (!sent.ok) console.warn('[auth] 2FA-ইমেইল পাঠানো ব্যর্থ — চ্যালেঞ্জ চলছে (ব্যাকআপ-কোড পথ খোলা)');
        } else {
          console.log(`[auth] 2FA-ইমেইল কুলডাউন (${issue.retryAfter}s) — আগের টোকেন (৫-মিনিট-মেয়াদ) বৈধ থাকতে পারে`);
        }
        req.session.mfaPending = {
          kind: 'user', mode: 'email', uid: user.id, dest,
          hint: user.full_name || user.username,
          emailMask: otp.maskEmail(user.email),
          otpSent, retryAfter: issue.ok ? 0 : issue.retryAfter,
          ts: Date.now(),
        };
        return new Promise((resolve) => req.session.save(() => { res.redirect('/login/2fa'); resolve(); }));
      }
      if (user.totp_enabled && user.totp_secret) {
        req.session.mfaPending = { kind: 'user', uid: user.id, dest, hint: user.full_name || user.username, ts: Date.now() };
        return new Promise((resolve) => req.session.save(() => { res.redirect('/login/2fa'); resolve(); }));
      }
      // সেশন ৯৩ (D1): pen_name সেশনে — নোটিফিকেশন/সারফেসে displayName() যেন কলমী-নাম দেখায়
      req.session.user = { id: user.id, username: user.username, full_name: user.full_name, pen_name: user.pen_name || null, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
      await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
      // ── সেশন ৯৫: ফোর্স-চেঞ্জ গেট ────────────────────────────────────────────
      // সুপার-এডমিনের দেওয়া অস্থায়ী পাসওয়ার্ডে লগইন — গন্তব্য যাই হোক না কেন,
      // /force-change-password-এই পাঠানো হবে; সেখানে নিজস্ব নতুন পাসওয়ার্ড
      // সেট না করা পর্যন্ত server.js-র গার্ড-মিডলওয়্যার অন্য সব পেজ ব্লক করবে।
      if (user.must_change_password) {
        req.session.mustChangePassword = true;
        return new Promise((resolve) => req.session.save(() => { res.redirect('/force-change-password'); resolve(); }));
      }
      // রোল-বেজড গন্তব্য + (সেফ) `next` — প্রোটেক্টেড পেজ থেকে এলে সেখানেই ফিরে যাই
      return new Promise((resolve) => req.session.save((err) => {
        if (err) console.error('[auth] /login session save error:', err);
        res.redirect(dest);
        resolve();
      }));
    }

    // ── সেশন ৮৩: admin_users-অ্যাকাউন্ট /login থেকে আর লগইন করতে পারে না ──
    // আগের "fallback" (সেশন ৮-এর সুবিধা) সরানো হলো — ইউজার/স্টাফ লগইন
    // ইন্টারফেস সম্পূর্ণ আলাদা (নিরাপত্তা-নির্দেশ)। স্টাফ যাবে /admin/login-এ।
    const admin = await db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.trim());
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      loginOk(lk43);
      return res.render('user/login', {
        error: rolePolicy.USER_PORTAL_STAFF_MESSAGE + ' <a href="/admin/login">স্টাফ পোর্টালে লগইন করুন</a>',
        next: safeNextPath(req.body.next || req.query.next),
        currentPath: '/login',
        staffNotice: true
      });
    }

    loginFail((req.ip || '') + '|' + String(req.body.username || '').toLowerCase());
    return res.render('user/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
  } catch (e) {
    console.error('[auth] /login error:', e);
    return res.status(500).render('user/login', { error: 'লগইন ব্যর্থ: ' + e.message, next: safeNextPath(req.body.next || req.query.next), currentPath: '/login' });
  }
});

// ── সেশন ৫৮: লগইন ধাপ-২ (2FA কোড যাচাই) ─────────────────────────────────────
// লগইন-ফর্মে 2FA-ফিল্ড নেই (ইউজার-নির্দেশনা); পাসওয়ার্ড মিললে এই ধাপটি আসে।
// mfaPending: { kind: 'user'|'admin', uid, dest, hint, ts, fails } — ১০ মিনিট মেয়াদী;
// পাসওয়ার্ড কখনো সেশনে রাখা হয় না।
// সেশন ৬২: ব্রুট-ফোর্স গার্ড — `fails`-কাউন্টার; ৫ বার ভুল কোডে mfaPending
// বাতিল + লগইনে ফেরত (আবার পাসওয়ার্ড দিতে হবে); প্রতিটি ব্যর্থতায় ক্রমবর্ধমান
// দেরি (৩০০ms × ব্যর্থতা-সংখ্যা) — স্বয়ংক্রিয় চেষ্টা ধীর করে।
const MFA_TTL_MS = 10 * 60 * 1000;
const MFA_MAX_FAILS = 5;
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
function mfaOf(req) {
  const m = req.session && req.session.mfaPending;
  if (!m || !m.kind || !m.uid) return null;
  if (Date.now() - (m.ts || 0) > MFA_TTL_MS) {
    req.session.mfaPending = null;
    return null;
  }
  return m;
}

router.get('/login/2fa', async (req, res) => {
  const m = mfaOf(req);
  if (!m) return res.redirect('/login');
  // সেশন ১১৫: মেথড-সচেতন রেন্ডার — mode='email' হলে ইমেইল-ওটিপি UI (রিসেন্ড-বাটনসহ)
  res.render('user/login-2fa', { error: null, hint: m.hint || '', mode: m.mode || 'totp', emailMask: m.emailMask || '', otpSent: m.otpSent !== false, retryAfter: m.retryAfter || 0, resendMsg: req.query.sent ? 'নতুন কোড ইমেইলে পাঠানো হয়েছে।' : (req.query.rate ? `অনুগ্রহ করে ${req.query.rate} সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।` : null), currentPath: '/login/2fa' });
});

router.post('/login/2fa', async (req, res) => {
  const m = mfaOf(req);
  if (!m) return res.redirect('/login');
  const code = String(req.body.totp_code || '').trim();
  // সেশন ১১৫: মেথড-সচেতন রেন্ডার (ত্রুটি-ফেরতেও মোড/ইমেইল-মাস্ক অক্ষত)
  const render2fa = (error) => res.status(200).render('user/login-2fa', { error, hint: m.hint || '', mode: m.mode || 'totp', emailMask: m.emailMask || '', otpSent: m.otpSent !== false, retryAfter: m.retryAfter || 0, resendMsg: null, currentPath: '/login/2fa' });
  if (!code) return render2fa('অ্যাপে দেখানো ৬-অঙ্কের কোড দিন।');

  // সেশন ৬২: ব্যর্থ-উত্তর গণনা + লক — ৫ম ব্যর্থতায় ধাপ বাতিল, লগইনে ফেরত।
  const failAndRender = async (baseMsg) => {
    m.fails = (m.fails || 0) + 1;
    const left = MFA_MAX_FAILS - m.fails;
    await sleepMs(300 * m.fails); // ক্রমবর্ধমান দেরি — অটোমেটেড চেষ্টা ধীর
    if (m.fails >= MFA_MAX_FAILS) {
      req.session.mfaPending = null;
      return new Promise((resolve) => req.session.save(() => {
        res.redirect('/login?e=mfa_locked');
        resolve();
      }));
    }
    render2fa(baseMsg + ' (আর ' + left + ' বার চেষ্টা করতে পারবেন)');
  };

  try {
    if (m.kind === 'user') {
      const user = await db.prepare('SELECT id, username, full_name, avatar_url, gender, role, status, email, totp_secret, totp_enabled, twofa_method, backup_codes, must_change_password FROM users WHERE id = ?').get(m.uid);
      // সেশন ১১৫: মেথড-নির্ণয় — twofa_method='email' হলে ওটিপি-টোকেন দিয়ে যাচাই,
      // নইলে অ্যাপ-টিওটিপি। লেগেসি-ইউজারের (কলাম NULL) মেথড 'totp'-ই ধরা হয়।
      const method = (user && user.totp_enabled && user.twofa_method === 'email') ? 'email' : 'totp';
      if (!user || !user.totp_enabled
          || (method === 'totp' && !user.totp_secret)
          || (method === 'email' && !user.email)
          || user.status === 'banned') {
        req.session.mfaPending = null;
        return res.redirect('/login');
      }
      let ok = (method === 'email')
        ? otp.verifyOtp(user.id, code, 'email').ok
        : totp.verifyTotp(user.totp_secret, code);
      if (!ok && user.backup_codes) {
        try {
          const codes = JSON.parse(user.backup_codes);
          const consumed = totp.consumeBackupCode(code, codes);
          if (consumed.ok) {
            ok = true;
            await db.prepare('UPDATE users SET backup_codes = ? WHERE id = ?').run(JSON.stringify(consumed.remaining), user.id);
          }
        } catch (e) {}
      }
      if (!ok) return failAndRender('কোড মিলছে না। অ্যাপে নতুন কোড দেখে আবার চেষ্টা করুন (কোড ৩০ সেকেন্ডে বদলায়)।');
      req.session.mfaPending = null;
      req.session.user = { id: user.id, username: user.username, full_name: user.full_name, pen_name: user.pen_name || null, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
      await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
      // সেশন ৯৫: 2FA-পার হওয়া টেম্পোরারি-পাসওয়ার্ড লগইনেও ফোর্স-চেঞ্জ গেট
      if (user.must_change_password) {
        req.session.mustChangePassword = true;
        return new Promise((resolve) => req.session.save(() => { res.redirect('/force-change-password'); resolve(); }));
      }
      return new Promise((resolve) => req.session.save((err) => {
        if (err) console.error('[auth] /login/2fa session save error:', err);
        res.redirect(m.dest || dashboardFor(user));
        resolve();
      }));
    }

    // kind === 'admin'
    const admin = await db.prepare('SELECT id, username, display_name, totp_secret, totp_enabled, backup_codes FROM admin_users WHERE id = ?').get(m.uid);
    if (!admin || !admin.totp_enabled || !admin.totp_secret) {
      req.session.mfaPending = null;
      return res.redirect('/login');
    }
    let ok = totp.verifyTotp(admin.totp_secret, code);
    if (!ok && admin.backup_codes) {
      try {
        const codes = JSON.parse(admin.backup_codes);
        const consumed = totp.consumeBackupCode(code, codes);
        if (consumed.ok) {
          ok = true;
          await db.prepare('UPDATE admin_users SET backup_codes = ? WHERE id = ?').run(JSON.stringify(consumed.remaining), admin.id);
        }
      } catch (e) {}
    }
    if (!ok) return failAndRender('কোড মিলছে না। অ্যাপে নতুন কোড দেখে আবার চেষ্টা করুন (কোড ৩০ সেকেন্ডে বদলায়)।');
    req.session.mfaPending = null;
    return new Promise((resolve) => req.session.regenerate((err) => {
      if (err) console.error('[auth] /login/2fa admin session regenerate error:', err);
      req.session.adminUser = { id: admin.id, username: admin.username, display_name: admin.display_name };
      req.session.save((err2) => {
        if (err2) console.error('[auth] /login/2fa admin session save error:', err2);
        res.redirect(m.dest || '/admin');
        resolve();
      });
    }));
  } catch (e) {
    console.error('[auth] /login/2fa error:', e);
    return render2fa('যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
  }
});

// ── সেশন ১১৫: ইমেইল-ওটিপি রিসেন্ড (লগইন-চ্যালেঞ্জ পেজ থেকে) ──
// কুলডাউন-গার্ড helpers/otp.js-এ (৪৫সে); ব্যর্থতায় ?rate=<sec> ফ্ল্যাশ।
router.post('/login/2fa/resend', async (req, res) => {
  const m = mfaOf(req);
  if (!m || m.kind !== 'user' || m.mode !== 'email') return res.redirect('/login');
  const user = await db.prepare('SELECT id, email FROM users WHERE id = ?').get(m.uid);
  if (!user || !user.email) { req.session.mfaPending = null; return res.redirect('/login'); }
  const issue = otp.issueOtp(user.id, 'email');
  if (!issue.ok) {
    const rate = Math.max(issue.retryAfter, 1);
    return new Promise((resolve) => req.session.save(() => { res.redirect('/login/2fa?rate=' + rate); resolve(); }));
  }
  const sent = await otp.sendMail({
    to: user.email,
    subject: 'লেখক ফোরাম: লগইন ভেরিফিকেশন কোড',
    html: otp.otpEmailHtml(issue.code, 'login'),
  });
  m.otpSent = !!sent.ok; m.retryAfter = 0;
  req.session.mfaPending = m;
  return new Promise((resolve) => req.session.save(() => { res.redirect('/login/2fa?sent=1'); resolve(); }));
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
  req.session.user = { id: uid, username: uname, full_name, pen_name: null, avatar_url: avatarPath, gender: gender || 'other', role: 'user' };
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
  const { full_name, pen_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, show_email, show_phone, show_birth, new_password, confirm_password, blood_group, hometown, institution, academic_year } = req.body;

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
      `UPDATE users SET full_name=?, pen_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, blood_group=?, hometown=?, institution=?, academic_year=?, show_email=?, show_phone=?, show_birth=?, avatar_url=COALESCE(?, avatar_url), password_hash=?, password_changed_at=CURRENT_TIMESTAMP, must_change_password=0 WHERE id=?`
    ).run(
      full_name.trim(),
      clean(pen_name),
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
      clean(blood_group),
      clean(hometown),
      clean(institution),
      clean(academic_year),
      show_email ? 1 : 0,
      show_phone ? 1 : 0,
      show_birth ? 1 : 0,
      avatarPath,
      passwordHash,
      u.id
    );
  } else {
    await db.prepare(
      `UPDATE users SET full_name=?, pen_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, blood_group=?, hometown=?, institution=?, academic_year=?, show_email=?, show_phone=?, show_birth=?, avatar_url=COALESCE(?, avatar_url) WHERE id=?`
    ).run(
      full_name.trim(),
      clean(pen_name),
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
      clean(blood_group),
      clean(hometown),
      clean(institution),
      clean(academic_year),
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
    pen_name: updated.pen_name || null,
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
  await db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?").run(hash, rec.user_id);
  await db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(rec.id);
  // অ্যাডমিন-অ্যাকশন হিসেবে অডিট (পাসওয়ার্ড কখনো লগ হয় না)
  try { await db.logActivity({ user_id: rec.user_id, username: null, role: 'user', action: 'password-reset', target: 'users', detail: 'self-service' }); } catch (e) {}
  res.redirect('/login?reset=1');
});

// ══════════════════════════════════════════════════════════════════════════════
// সেশন ৯৫: ফোর্স-চেঞ্জ পাসওয়ার্ড — অস্থায়ী পাসওয়ার্ডে লগইন-পরবর্তী গেট
// ══════════════════════════════════════════════════════════════════════════════
// সুপার-এডমিন /admin/super/users-support থেকে অস্থায়ী পাসওয়ার্ড (Lekhok#NNNN)
// তৈরি করে দিলে must_change_password=1 সেট হয়। ইউজার লগইন করলেই এই পেজে
// আসে; নিজস্ব নতুন পাসওয়ার্ড সেট করা ছাড়া অন্য কোথাও যেতে পারে না
// (server.js-র গার্ড-মিডলওয়্যার)। সফল পরিবর্তনে ফ্ল্যাগ নামে ও তারিখ রেকর্ড হয়।
router.get('/force-change-password', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const u = await db.prepare('SELECT id, username, full_name, must_change_password FROM users WHERE id = ?').get(req.session.user.id);
  if (!u) return res.redirect('/login');
  if (!u.must_change_password) {
    req.session.mustChangePassword = false;
    return res.redirect(dashboardFor(req.session.user));
  }
  res.render('user/force-change-password', {
    error: null, userName: u.full_name || u.username, currentPath: '/force-change-password'
  });
});

router.post('/force-change-password', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const u = await db.prepare('SELECT id, username, must_change_password FROM users WHERE id = ?').get(req.session.user.id);
  if (!u) return res.redirect('/login');
  const back = (err) => res.render('user/force-change-password', {
    error: err, userName: (req.session.user && (req.session.user.full_name || req.session.user.username)) || '', currentPath: '/force-change-password'
  });
  if (!u.must_change_password) {
    req.session.mustChangePassword = false;
    return res.redirect(dashboardFor(req.session.user));
  }
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirmPassword || '');
  if (password.length < 6) return back('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (password !== confirm) return back('পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না');
  if (password.indexOf(' ') !== -1) return back('পাসওয়ার্ডে স্পেস থাকতে পারবে না');

  const hash = await bcrypt.hash(password, 10);
  await db.prepare(
    "UPDATE users SET password_hash = ?, must_change_password = 0, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(hash, u.id);
  req.session.mustChangePassword = false; // গেট-উত্তরণ — পরের রিকোয়েস্ট থেকে মুক্ত
  try {
    await db.logActivity({
      user_id: u.id, username: u.username, role: (req.session.user && req.session.user.role) || 'user',
      action: 'password-change', target: 'users', detail: 'forced-after-temp'
    });
  } catch (e) { /* অ্যাক্টিভিটি-লগ ব্যর্থ হলেও পরিবর্তন বাতিল হবে না */ }
  return new Promise((resolve) => req.session.save((err) => {
    if (err) console.error('[auth] force-change-password session save error:', err);
    res.redirect(dashboardFor(req.session.user));
    resolve();
  }));
});

module.exports = router;
