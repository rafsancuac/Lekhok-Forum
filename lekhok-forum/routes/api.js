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

// ── Newsletter subscribe (footer form) ───────────────────────────────────────
router.post('/newsletter/subscribe', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name  = String(req.body.name || '').trim() || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।' });
  }
  try {
    // Single round-trip upsert (speed: was SELECT + INSERT/UPDATE = 2-3 queries):
    //   • new address             → INSERT        (changes = 1)
    //   • previously unsubscribed → re-activated  (changes = 1)
    //   • already active          → WHERE fails   (changes = 0)
    const r = await db.prepare(`
      INSERT INTO newsletter_subscribers (email, name, source) VALUES (?, ?, 'footer')
      ON CONFLICT(email) DO UPDATE SET is_active = 1, unsubscribed_at = NULL
      WHERE newsletter_subscribers.is_active = 0
    `).run(email, name);
    const changed = !!(r && (r.changes ?? r.rows_affected ?? 0));
    res.json({ ok: true, message: changed
      ? 'সাবস্ক্রিপশন সফল! এখন থেকে নতুন লেখা প্রকাশের খবর সরাসরি ইমেইলে পাবেন।'
      : 'আপনি ইতিমধ্যেই সাবস্ক্রাইব করেছেন — ধন্যবাদ!' });
  } catch (e) {
    console.error('[newsletter] subscribe error:', e.message);
    res.status(500).json({ ok: false, message: 'সার্ভার সমস্যা — কিছুক্ষণ পর আবার চেষ্টা করুন।' });
  }
});

module.exports = router;


// ── Global search (public, no auth) ─────────────────────────────────────────
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ articles: [], questions: [], users: [] });
  const like = '%' + q + '%';
  try {
    const articles = await db.prepare(`
      SELECT p.id, p.title, u.full_name as author_name
      FROM posts p JOIN users u ON p.author_id = u.id
      WHERE p.type = 'article' AND p.status = 'published'
        AND (p.title LIKE ? OR p.body LIKE ?)
      ORDER BY p.published_at DESC LIMIT 10
    `).all(like, like);
    const questions = await db.prepare(`
      SELECT p.id, p.title, u.full_name as author_name
      FROM posts p JOIN users u ON p.author_id = u.id
      WHERE p.type = 'question' AND p.status = 'published'
        AND (p.title LIKE ? OR p.body LIKE ?)
      ORDER BY p.created_at DESC LIMIT 10
    `).all(like, like);
    const users = await db.prepare(`
      SELECT id, username, full_name, avatar_url
      FROM users
      WHERE status = 'active' AND (username LIKE ? OR full_name LIKE ?)
      ORDER BY full_name LIMIT 10
    `).all(like, like);
    res.json({ articles, questions, users });
  } catch (e) {
    res.json({ articles: [], questions: [], users: [] });
  }
});

module.exports = router;
