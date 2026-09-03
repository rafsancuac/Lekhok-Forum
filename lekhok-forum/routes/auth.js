const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// ── Login (GET) ──────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/profile/' + req.session.user.username);
  res.render('user/login', { error: null, currentPath: '/login' });
});

// ── Login (POST) ─────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('user/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', currentPath: '/login' });
  }
  if (user.status === 'banned') {
    return res.render('user/login', { error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে', currentPath: '/login' });
  }
  req.session.user = { id: user.id, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, gender: user.gender, role: user.role || 'user' };
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  res.redirect('/profile/' + user.username);
});

// ── Register (GET) ───────────────────────────────────────────────────────────
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/profile/' + req.session.user.username);
  res.render('user/register', { error: null, form: {}, currentPath: '/register' });
});

// ── Register (POST) ──────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { username, password, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website } = req.body;
  if (!username || !password || !full_name) {
    return res.render('user/register', { error: 'ব্যবহারকারী নাম, পাসওয়ার্ড ও নাম আবশ্যক', form: req.body, currentPath: '/register' });
  }
  if (password.length < 6) {
    return res.render('user/register', { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে', form: req.body, currentPath: '/register' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email || '');
  if (existing) {
    return res.render('user/register', { error: 'এই ব্যবহারকারী নাম বা ইমেইল ইতিমধ্যে ব্যবহৃত', form: req.body, currentPath: '/register' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`INSERT INTO users (username, password_hash, full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    username, hash, full_name, email || null, phone || null, bio || null, designation || null, address || null, birth_date || null, gender || 'other',
    social_fb || null, social_twitter || null, social_linkedin || null, social_website || null
  );
  req.session.user = { id: result.lastInsertRowid, username, full_name, avatar_url: null, gender: gender || 'other', role: 'user' };
  res.redirect('/profile/' + username);
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

// ── Profile edit (GET) ───────────────────────────────────────────────────────
router.get('/profile/edit', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  res.render('user/edit', { user, error: null, success: null, currentPath: '/profile/edit' });
});

// ── Profile edit (POST) ──────────────────────────────────────────────────────
router.post('/profile/edit', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const u = req.session.user;
  const { full_name, email, phone, bio, designation, address, birth_date, gender, social_fb, social_twitter, social_linkedin, social_website, show_email, show_phone, show_birth } = req.body;
  db.prepare(`UPDATE users SET full_name=?, email=?, phone=?, bio=?, designation=?, address=?, birth_date=?, gender=?, social_fb=?, social_twitter=?, social_linkedin=?, social_website=?, show_email=?, show_phone=?, show_birth=? WHERE id=?`).run(
    full_name || u.full_name, email || null, phone || null, bio || null, designation || null, address || null, birth_date || null, gender || 'other',
    social_fb || null, social_twitter || null, social_linkedin || null, social_website || null,
    show_email ? 1 : 0, show_phone ? 1 : 0, show_birth ? 1 : 0, u.id
  );
  // Refresh session
  const updated = db.prepare('SELECT id, username, full_name, avatar_url, gender FROM users WHERE id = ?').get(u.id);
  req.session.user = updated;
  res.redirect('/profile/' + updated.username + '?updated=1');
});

module.exports = router;
