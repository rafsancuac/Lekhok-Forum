const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Public read endpoints (no auth) ─────────────────────────────────────────
router.get('/notices', (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  let q = 'SELECT * FROM notices';
  const params = [];
  if (category && category !== 'all') { q += ' WHERE category = ?'; params.push(category); }
  q += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  res.json(db.prepare(q).all(...params));
});

router.get('/events', (req, res) => {
  const { upcoming } = req.query;
  const today = new Date().toISOString().split('T')[0];
  let q, params = [];
  if (upcoming === 'true')  { q = 'SELECT * FROM events WHERE date >= ? ORDER BY date ASC';  params = [today]; }
  else if (upcoming === 'false') { q = 'SELECT * FROM events WHERE date <  ? ORDER BY date DESC'; params = [today]; }
  else { q = 'SELECT * FROM events ORDER BY date DESC'; }
  res.json(db.prepare(q).all(...params));
});

router.get('/members', (req, res) => {
  const { type } = req.query;
  let q = 'SELECT * FROM members';
  const params = [];
  if (type) { q += ' WHERE member_type = ?'; params.push(type); }
  q += ' ORDER BY sort_order';
  res.json(db.prepare(q).all(...params));
});

router.get('/gallery', (req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY id DESC').all());
});

router.get('/resources', (req, res) => {
  const { category } = req.query;
  let q = 'SELECT * FROM resources';
  const params = [];
  if (category) { q += ' WHERE category = ?'; params.push(category); }
  q += ' ORDER BY id DESC';
  res.json(db.prepare(q).all(...params));
});

// ── Contact form submission ────────────────────────────────────────────────
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'নাম এবং বার্তা আবশ্যক' });
  db.prepare('INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name, email || null, subject || null, message);
  res.json({ success: true, message: 'আপনার বার্তা পাঠানো হয়েছে।' });
});

module.exports = router;

