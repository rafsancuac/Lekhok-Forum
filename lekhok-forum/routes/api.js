const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Public read endpoints (no auth) ─────────────────────────────────────────
router.get('/notices', async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  let q = 'SELECT * FROM notices';
  const params = [];
  if (category && category !== 'all') { q += ' WHERE category = ?'; params.push(category); }
  q += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  res.json(await db.prepare(q).all(...params));
});

router.get('/events', async (req, res) => {
  const { upcoming } = req.query;
  const today = new Date().toISOString().split('T')[0];
  let q, params = [];
  if (upcoming === 'true')  { q = 'SELECT * FROM events WHERE date >= ? ORDER BY date ASC';  params = [today]; }
  else if (upcoming === 'false') { q = 'SELECT * FROM events WHERE date <  ? ORDER BY date DESC'; params = [today]; }
  else { q = 'SELECT * FROM events ORDER BY date DESC'; }
  res.json(await db.prepare(q).all(...params));
});

router.get('/members', async (req, res) => {
  const { type } = req.query;
  let q = `
    SELECT m.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
           u.full_name AS user_full_name, u.designation AS user_designation
    FROM members m
    LEFT JOIN users u ON u.id = m.user_id`;
  const params = [];
  if (type) { q += ' WHERE m.member_type = ?'; params.push(type); }
  q += ' ORDER BY m.sort_order';
  res.json(await db.prepare(q).all(...params));
});

router.get('/gallery', async (req, res) => {
  res.json(await db.prepare('SELECT * FROM gallery ORDER BY id DESC').all());
});

router.get('/resources', async (req, res) => {
  const { category } = req.query;
  let q = 'SELECT * FROM resources';
  const params = [];
  if (category) { q += ' WHERE category = ?'; params.push(category); }
  q += ' ORDER BY id DESC';
  res.json(await db.prepare(q).all(...params));
});

// ── Contact form submission ────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'নাম এবং বার্তা আবশ্যক' });
  await db.prepare('INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name, email || null, subject || null, message);
  res.json({ success: true, message: 'আপনার বার্তা পাঠানো হয়েছে।' });
});

module.exports = router;

