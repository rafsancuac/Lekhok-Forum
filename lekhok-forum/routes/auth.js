const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { avatarUpload, withUpload } = require('../middleware/upload');

// ── Login (GET) ──────────────────────────────────────────────────────────────
router.get('/login', async (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('user/login', { error: null, currentPath: '/login' });
});

// ── Login (POST) ─────────────────────────────────────────────────────────────
// 1) Regular users (users table)
// 2) Fallback: admin panel accounts (admin_users) — admins were previously
//    shown a confusing "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড" on /login; now the
//    same credentials work here and land straight on /admin.
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      if (user.status === 'banned') {
        return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে', currentPath: '/login' });
      }
      req.session.user = { id: user.id, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
      await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
      return new Promise((resolve) => req.session.save((err) => {
        if (err) console.error('[auth] /login session save error:', err);
        res.redirect('/dashboard');
        resolve();
      }));
    }

    // Admin-panel account fallback
    const admin = await db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (admin && bcrypt.compareSync(password, admin.password_hash)) {
      req.session.adminUser = { id: admin.id, username: admin.username, display_name: admin.display_name };
      return new Promise((resolve) => req.session.save((err) => {
        if (err) console.error('[auth] /login admin session save error:', err);
        res.redirect('/admin');
        resolve();
      }));
    }

    return res.render('user/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', currentPath: '/login' });
  } catch (e) {
    console.error('[auth] /login error:', e);
    return res.status(500).render('user/login', { error: 'লগইন ব্যর্থ: ' + e.message, currentPath: '/login' });
  }
});

// ── Register (GET) ───────────────────────────────────────────────────────────
router.get('/register', async (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('user/register', { error: null, form: {}, currentPath: '/register' });
});

// ── Register (POST, with optional avatar upload) ────────────────────────────
router.post('/register', withUpload(avatarUpload), async (req, res) => {
  const { username, password, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website } = req.body;
  const back = (err) => res.render('user/register', { error: err, form: req.body, currentPath: '/register' });

  if (req.uploadError) return back(req.uploadError);
  if (!username || !password || !full_name) return back('ব্যবহারকারী নাম, পাসওয়ার্ড ও নাম আবশ্যক');
  if (password.length < 6) return back('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email || '');
  if (existing) return back('এই ব্যবহারকারী নাম বা ইমেইল ইতিমধ্যে ব্যবহৃত');

  const hash = bcrypt.hashSync(password, 10);
  // req.file.url is correct in BOTH modes: local → /uploads/avatars/…, Vercel → blob https URL
  const avatarPath = req.file ? (req.file.url || req.file.path) : null;
  const result = await db.prepare(
    `INSERT INTO users (username, password_hash, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    username, hash, full_name, email || null, phone || null, bio || null, designation || null, address || null,
    birth_date || null, gender || 'other',
    social_fb || null, social_twitter || null, social_linkedin || null, social_website || null, avatarPath
  );
  req.session.user = { id: result.lastInsertRowid, username, full_name, avatar_url: avatarPath, gender: gender || 'other', role: 'user' };
  res.redirect('/profile/' + username + '?welcome=1');
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', async (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

// ── Profile edit (GET) ───────────────────────────────────────────────────────
router.get('/profile/edit', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  res.render('user/edit', { user, error: req.query.err || null, success: req.query.ok || null, currentPath: '/profile/edit' });
});

// ── Profile edit (POST, with optional avatar upload) ─────────────────────────
router.post('/profile/edit', withUpload(avatarUpload), async (req, res) => {
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
    passwordHash = bcrypt.hashSync(new_password, 10);
  }

  // Preserve current avatar unless a new file was uploaded.
  // req.file.url is correct in BOTH modes: local → /uploads/avatars/…, Vercel → blob https URL
  const avatarPath = req.file ? (req.file.url || req.file.path) : (u.avatar_url || null);
  // Treat empty strings as null for nullable fields. The form always sends every field, so a blank
  // value is the user's intent to clear it.
  const clean = (v) => (v == null || String(v).trim() === '') ? null : String(v).trim();
  if (passwordHash) {
    await db.prepare(
      `UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=?, avatar_url=?, password_hash=? WHERE id=?`
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
      `UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=?, avatar_url=? WHERE id=?`
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
  req.session.user = {
    id: updated.id,
    username: updated.username,
    full_name: updated.full_name,
    avatar_url: updated.avatar_url,
    gender: updated.gender,
    role: updated.role || 'user'
  };
  res.redirect('/profile/' + updated.username + '?updated=1' + (passwordHash ? '&pwd=1' : ''));
});

module.exports = router;
