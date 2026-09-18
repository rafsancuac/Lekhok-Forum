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

// ── সেশন ১৩১: জনপ্রিয়-সিরিজ লাইভ-এন্ডপয়েন্ট (RES-124-ব্যাকলগ ②) ──────────────
// GET /api/resources/series-stats — স্টাফ-গেটেড (adminUser-সেশন অথবা user-রোল
// admin/superadmin/moderator — admin/routes.js requireAdmin-এর সেশন-মডেল মিরর)।
// admin-প্যানেলের rss-গ্রিডের হুবহু সূত্র: score = views + downloads×2, top-N।
// ?limit= 1..20 (ডিফল্ট ৬)। নো-স্টোর — লাইভ-রিফ্রেশ-বাটনের উদ্দেশ্যেই।
router.get('/resources/series-stats', (req, res) => {
  const au131 = req.session && req.session.adminUser;
  const u131 = req.session && req.session.user;
  const role131 = u131 && u131.role;
  const staff131 = !!au131 || role131 === 'admin' || role131 === 'superadmin' || role131 === 'moderator';
  if (!staff131) return res.status(403).json({ ok: false, error: 'forbidden' });
  const limit131 = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));
  try {
    const rows131 = db.prepare("SELECT TRIM(series) AS series, COUNT(*) AS n, COALESCE(SUM(views),0) AS v, COALESCE(SUM(downloads),0) AS d FROM resources WHERE series IS NOT NULL AND TRIM(series) != '' GROUP BY TRIM(series) ORDER BY (COALESCE(SUM(views),0) + COALESCE(SUM(downloads),0)*2) DESC, n DESC LIMIT ?").all(limit131);
    const stats131 = rows131.map(r => { const score = (r.v || 0) + (r.d || 0) * 2; return { series: r.series, n: r.n, v: r.v, d: r.d, score, pct: 0 }; });
    const max131 = stats131.reduce((m, s) => Math.max(m, s.score), 0) || 1;
    stats131.forEach(s => { s.pct = Math.max(6, Math.round(s.score / max131 * 100)); });
    res.set('Cache-Control', 'no-store');
    return res.json({ ok: true, stats: stats131, max: max131, ts: Date.now() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'series-stats failed' });
  }
});

// ── Contact form submission ────────────────────────────────────────────────
// সেশন ১০৩: ① ইন-মেমরি রেট-লিমিট (প্রতি IP ৫/১০মি — স্প্যাম-গার্ড) ② প্লেইন-ফর্ম-POST
// (Accept: text/html) এখন JSON-পেজে আটকাবে না — /contact?success=|error=-এ 303-রিডাইরেক্ট
// (ভিউতে স্ট্রিপ রেন্ডার হয়); fetch/AJAX সাবমিটে আগের মতো JSON।
const _cxHits103 = new Map(); // ip → [Date.now(), ...]
const _CX_RL103 = { max: 5, windowMs: 10 * 60 * 1000 };
function _cxRateLimited103(ip) {
  const now = Date.now();
  const arr = (_cxHits103.get(ip) || []).filter(t => now - t < _CX_RL103.windowMs);
  const limited = arr.length >= _CX_RL103.max;
  if (!limited) { arr.push(now); _cxHits103.set(ip, arr); }
  if (_cxHits103.size > 500) { // মেমরি-গার্ড: পুরনো-কী প্রুন
    for (const [k, v] of _cxHits103) {
      if (!v.some(t => now - t < _CX_RL103.windowMs)) _cxHits103.delete(k);
    }
  }
  return limited;
}
router.post('/contact', async (req, res) => {
  const wantsHtml = String(req.get('accept') || '').includes('text/html');
  const reply = (ok, msg, code) => {
    if (wantsHtml) return res.redirect(303, '/contact?' + (ok ? 'success=' : 'error=') + encodeURIComponent(msg));
    if (ok) return res.json({ ok: true, success: true, message: msg });
    return res.status(code || 400).json({ ok: false, error: msg });
  };
  const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
  if (_cxRateLimited103(ip)) return reply(false, 'অনেকবার বার্তা পাঠানো হয়েছে — ১০ মিনিট পরে আবার চেষ্টা করুন।', 429);
  const { name, email, subject, message } = req.body || {};
  if (!name || !message) return reply(false, 'নাম এবং বার্তা আবশ্যক', 400);
  const clamp = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  try {
    await db.prepare('INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(clamp(name, 120), clamp(email, 200) || null, clamp(subject, 200) || null, clamp(message, 4000));
  } catch (e) {
    return reply(false, 'সার্ভার সমস্যা — কিছুক্ষণ পরে আবার চেষ্টা করুন।', 500);
  }
  reply(true, 'আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!');
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




// ── E1 (সেশন ৯১, মার্জ): হেলথ-এন্ডপয়েন্ট (কোনো-অথ-নয়, লাইট) — সুপারভাইজার-হ্যাং-চেক,
// আপটাইম-মনিটর ও ক্রন-এজেন্টের পারফরম্যান্স-অডিটে ব্যবহৃত। রিবেজ-মার্জ: দুই-এজেন্টের
// ভার্সন এক-হুকে — session90-এর কী-নাম (status/database/latency/uptimeSeconds —
// কনজিউমার-সামঞ্জস্য) + session91-এর ok/env বুলিয়ান-ফিল্ড।
router.get('/health', async (req, res) => {
  const start = Date.now();
  let dbOk = false, dbError = null;
  try { await db.prepare('SELECT 1').get(); dbOk = true; }
  catch (e) { dbError = e.message; }
  const latency = Date.now() - start;
  const mem = process.memoryUsage();
  res.status(dbOk ? 200 : 503).set('Cache-Control', 'no-store').json({
    ok: dbOk,
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
    env: process.env.VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString()
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

// ── সেশন ১০১: রিসোর্স ভিউ/ডাউনলোড-কাউন্টার (public — পেজ-কার্ড ক্লিকে ফায়ার) ──
// kind=view (অডিও-প্লে/ভিডিও-মোডাল খুললে) | download (ফাইল-লিংক খোলা/ডাউনলোড)।
// রেট-গার্ড: একই সেশনে প্রতি-রিসোর্স-প্রতি-কাইন্ড ৩০ সেকেন্ডে ১ বারই গোনা হয়।
const resStatHits = new Map(); // "kind:id:uid|ip" → ts
router.post('/resources/:id/stat', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const kind = req.body && req.body.kind === 'download' ? 'download' : 'view';
    if (!id || id < 1) return res.status(400).json({ ok: false, error: 'invalid id' });
    const u = req.session && req.session.user;
    const key = kind + ':' + id + ':' + (u ? 'u' + u.id : req.ip || 'anon');
    const now = Date.now();
    const last = resStatHits.get(key) || 0;
    if (now - last < 30 * 1000) return res.json({ ok: true, deduped: true });
    resStatHits.set(key, now);
    if (resStatHits.size > 2000) { // মেমোরি-গার্ড
      for (const [k, ts] of resStatHits) { if (now - ts > 10 * 60 * 1000) resStatHits.delete(k); }
    }
    const col = kind === 'download' ? 'downloads' : 'views';
    await db.prepare('UPDATE resources SET ' + col + ' = COALESCE(' + col + ', 0) + 1 WHERE id = ?').run(id);
    const row = await db.prepare('SELECT views, downloads FROM resources WHERE id = ?').get(id);
    res.json({ ok: true, views: row ? row.views : 0, downloads: row ? row.downloads : 0 });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'stat failed' });
  }
});

module.exports = router;
