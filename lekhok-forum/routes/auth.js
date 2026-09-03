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
  const { username, password } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (user && bcrypt.compareSync(password, user.password_hash)) {
    if (user.status === 'banned') {
      return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে', currentPath: '/login' });
    }
    req.session.user = { id: user.id, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
    await db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    return res.redirect('/dashboard');
  }

  // Admin-panel account fallback
  const admin = await db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (admin && bcrypt.compareSync(password, admin.password_hash)) {
    req.session.adminUser = { id: admin.id, username: admin.username, display_name: admin.display_name };
    return res.redirect('/admin');
  }

  return res.render('user/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', currentPath: '/login' });
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
  const avatarPath = req.file ? '/uploads/avatars/' + req.file.filename : null;
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
  const { full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, show_email, show_phone, show_birth } = req.body;

  const avatarPath = req.file ? '/uploads/avatars/' + req.file.filename : u.avatar_url || null;
  await db.prepare(
    `UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=?, avatar_url=? WHERE id=?`
  ).run(
    full_name || u.full_name, email || null, phone || null, bio || null, designation || null, address || null,
    birth_date || null, gender || 'other',
    social_fb || null, social_twitter || null, social_linkedin || null, social_website || null,
    show_email ? 1 : 0, show_phone ? 1 : 0, show_birth ? 1 : 0, avatarPath, u.id
  );
  const updated = await db.prepare('SELECT id, username, full_name, avatar_url, gender, role FROM users WHERE id = ?').get(u.id);
  req.session.user = updated;
  res.redirect('/profile/' + updated.username + '?updated=1');
});

module.exports = router;
