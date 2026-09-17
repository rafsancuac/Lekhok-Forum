const express = require('express');
const router = express.Router();
const db = require('../db');

// ── সেশন ৮৯ (E1): হেলথ-এন্ডপয়েন্ট সেশন-৯১-এ ফেইল-সেফ-ফিল্ডসহ ফাইলের শেষে একত্রিত
//    (no-store ক্যাশ-হেডার + status/database ফিল্ড) — এখানকার ডুপ্লিকেট-রুট সরানো।

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

// ── সেশন ৪৩: ডাবল-অপ্ট-ইন কনফার্মেশন লিংক ──
router.get('/newsletter/confirm', async (req, res) => {
  const tok = String(req.query.token || '');
  if (!tok) return res.status(400).send('কনফার্ম টোকেন নেই।');
  try {
    const r = await db.prepare('UPDATE newsletter_subscribers SET is_active = 1, confirm_token = NULL WHERE confirm_token = ?').run(tok);
    const n = !!(r && (r.changes ?? r.rows_affected ?? 0));
    return res.send(n
      ? '<!DOCTYPE html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:60px 20px"><h2>✅ ইমেইল কনফার্ম হয়েছে</h2><p>নিউজলেটার সাবস্ক্রিপশন এখন চালু। ধন্যবাদ!</p>'
      : '<!DOCTYPE html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:60px 20px"><h2>⚠️ লিংকটি সঠিক নয়</h2><p>অথবা ইমেইলটি আগেই কনফার্ম করা হয়েছে।</p>');
  } catch (e) {
    return res.status(500).send('সার্ভার সমস্যা — কিছুক্ষণ পর আবার চেষ্টা করুন।');
  }
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
    // সেশন ৪৩: ডাবল-অপ্ট-ইন (লাইট) — শুধু RESEND_API_KEY কনফিগার করা থাকলে।
    // নতুন/রি-অ্যাক্টিভেটেড সাবস্ক্রাইবারকে কনফার্ম-লিংক মেইল হয়; কী না থাকলে আগের মতোই তাৎক্ষণিক সক্রিয়।
    let msg = changed
      ? 'সাবস্ক্রিপশন সফল! এখন থেকে নতুন লেখা প্রকাশের খবর সরাসরি ইমেইলে পাবেন।'
      : 'আপনি ইতিমধ্যেই সাবস্ক্রাইব করেছেন — ধন্যবাদ!';
    if (changed) {
      try {
        const mailer = require('../helpers/mailer');
        if (mailer.isConfigured()) {
          const tok = require('crypto').randomBytes(12).toString('hex');
          await db.prepare('UPDATE newsletter_subscribers SET confirm_token = ? WHERE email = ?').run(tok, email);
          const base = (process.env.SITE_URL || (req.protocol + '://' + req.get('host'))).replace(/\/+$/, '');
          const link = base + '/api/newsletter/confirm?token=' + tok;
          await mailer.sendMail({
            to: email,
            subject: 'লেখক ফোরাম নিউজলেটার — ইমেইল কনফার্ম করুন',
            text: 'আপনার সাবস্ক্রিপশন নিশ্চিত করতে এই লিংকে ক্লিক করুন: ' + link
          });
          msg = 'প্রায় শেষ! আপনার ইমেইলে পাঠানো কনফার্ম-লিংকে ক্লিক করলে সাবস্ক্রিপশন চালু হবে।';
        }
      } catch (e) { console.error('[newsletter] confirm-mail error:', e.message); }
    }
    res.json({ ok: true, message: msg });
  } catch (e) {
    console.error('[newsletter] subscribe error:', e.message);
    res.status(500).json({ ok: false, message: 'সার্ভার সমস্যা — কিছুক্ষণ পর আবার চেষ্টা করুন।' });
  }
});




// ── E1 (সেশন ৯১): হেলথ-এন্ডপয়েন্ট (কোনো-অথ-নয়, লাইট) — সুপারভাইজার-হ্যাং-চেক
// ও আপটাইম-মনিটরের জন্য। db-ok = একটি ট্রিভিয়াল SELECT; uptime/memory সহ।
// ক্যাশ-নীতি: no-store (মনিটর সবসময় লাইভ-মান দেখুক)।
router.get('/health', async (req, res) => {
  let dbOk = false, dbLatencyMs = null;
  const t0 = Date.now();
  try {
    await db.prepare('SELECT 1 AS ok').get();
    dbOk = true;
    dbLatencyMs = Date.now() - t0;
  } catch (e) { /* db-ডাউনেও 503-এ কাঠামোবদ্ধ বডি দিই */ }
  const mem = process.memoryUsage();
  res.set('Cache-Control', 'no-store');
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    status: dbOk ? 'healthy' : 'degraded',
    db: { ok: dbOk, latency_ms: dbLatencyMs },
    uptime_s: Math.round(process.uptime()),
    memory: { rss_mb: Math.round(mem.rss / 1048576), heap_used_mb: Math.round(mem.heapUsed / 1048576) },
    node: process.version,
    env: process.env.VERCEL ? 'vercel' : 'local',
    ts: new Date().toISOString()
  });
});

// ── Global search (public, no auth) ─ session33: উপরের আকস্মিক module.exports টা সরানো হলো;
// এখন সব রাউট রেজিস্টার হওয়ার পর একটিমাত্র এক্সপোর্ট (ফাইল শেষে)। ──
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
      SELECT id, username, full_name, designation, avatar_url
      FROM users
      WHERE status = 'active' AND (username LIKE ? OR full_name LIKE ?)
      ORDER BY full_name LIMIT 10
    `).all(like, like);
    res.json({ articles, questions, users });
  } catch (e) {
    res.json({ articles: [], questions: [], users: [] });
  }
});

// ── সেশন ৯০ (রোডম্যাপ-আইটেম ১৮): সিস্টেম-হেলথ-চেক ────────────────────────────
// অথ-মুক্ত, লাইটওয়েট — সুপারভাইজার-হ্যাং-চেক, আপটাইম-মনিটর ও ক্রন-এজেন্টের
// পারফরম্যান্স-অডিট (মিনিট ৮-১১) এই এন্ডপয়েন্ট ব্যবহার করবে।
router.get('/health', async (req, res) => {
  const start = Date.now();
  let dbOk = false, dbError = null;
  try { await db.prepare('SELECT 1').get(); dbOk = true; }
  catch (e) { dbError = e.message; }
  const latency = Date.now() - start;
  const mem = process.memoryUsage();
  res.status(dbOk ? 200 : 503).set('Cache-Control', 'no-store').json({
    status: dbOk ? 'healthy' : 'unhealthy',
    database: dbOk ? 'connected' : ('failed' + (dbError ? ': ' + dbError : '')),
    latency: latency + 'ms',
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / 1048576),
      heapUsedMb: Math.round(mem.heapUsed / 1048576),
      heapTotalMb: Math.round(mem.heapTotal / 1048576)
    },
    node: process.version,
    app: 'lekhok-forum',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
