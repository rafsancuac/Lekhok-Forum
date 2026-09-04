const express = require('express');
const router = express.Router();
const db = require('../db');
const { broadcastToAll } = require('./dashboard');

function ensureModerator(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.session.user.role !== 'moderator' && req.session.user.role !== 'admin') {
    return res.status(403).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  }
  next();
}

function requireScope(scope) {
  return async (req, res, next) => {
    if (req.session.user.role === 'admin') return next(); // admin implicitly has every scope
    if (!(await db.hasScope(req.session.user.id, scope))) {
      return res.status(403).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
    }
    next();
  };
}

function today() { return new Date().toISOString().split('T')[0]; }

// ── Moderator dashboard ──────────────────────────────────────────────────────
router.get('/', ensureModerator, async (req, res) => {
  const myScopes = req.session.user.role === 'admin'
    ? db.MODERATOR_SCOPES.map(s => s.key)
    : await db.getModeratorScopes(req.session.user.id);
  res.render('user/moderator-dashboard', {
    scopes: db.MODERATOR_SCOPES,
    myScopes,
    scopeAliases: db.SCOPE_ALIASES,
    dailyContentScopes: db.DAILY_CONTENT_SCOPES,
    currentPath: '/moderator'
  });
});

// ── Generic daily_content poster (quiz / this_day / activity / epaper) ──────
const DAILY_TYPES = {
  quiz:      { scope: 'quiz',      label: 'আজকের কুইজ' },
  this_day:  { scope: 'this_day',  label: 'আজকের এই দিনে' },
  activity:  { scope: 'activity',  label: 'সাংগঠনিক কার্যক্রম' },
  epaper:    { scope: 'epaper',    label: 'আজকের ই-পেপার' }
};

router.get('/daily/:type', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const items = await db.prepare('SELECT * FROM daily_content WHERE content_type = ? ORDER BY scheduled_date DESC, id DESC LIMIT 30').all(req.params.type);
    res.render('user/moderator-daily-form', { type: req.params.type, meta, items, todayDate: today(), currentPath: '/moderator' });
  });
});

router.post('/daily/:type', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const { title, body, image_url, link_url, scheduled_date } = req.body;
    if (!title) return res.redirect('/moderator/daily/' + req.params.type);
    await db.prepare(`INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, author_id, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
      .run(req.params.type, title, body || '', image_url || '', link_url || '', scheduled_date || today(), req.session.user.id);
    await broadcastToAll('daily_' + req.params.type, meta.label, `নতুন আপডেট: ${title}`, '/' + (req.params.type === 'this_day' ? 'on-this-day' : req.params.type), req.session.user.id);
    res.redirect('/moderator/daily/' + req.params.type + '?posted=1');
  });
});

router.delete('/daily/:type/:id', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    await db.prepare('DELETE FROM daily_content WHERE id = ? AND content_type = ?').run(req.params.id, req.params.type);
    res.redirect('/moderator/daily/' + req.params.type);
  });
});

// ── Notices ──────────────────────────────────────────────────────────────────
router.get('/notices', ensureModerator, requireScope('notice'), async (req, res) => {
  const notices = await db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 30').all();
  res.render('user/moderator-notices', { notices, currentPath: '/moderator' });
});

router.post('/notices', ensureModerator, requireScope('notice'), async (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.redirect('/moderator/notices');
  await db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)')
    .run(title, content || '', category || 'notice', date || today());
  await broadcastToAll('notice', 'নতুন বিজ্ঞপ্তি', title, '/notices', req.session.user.id);
  res.redirect('/moderator/notices?posted=1');
});

router.delete('/notices/:id', ensureModerator, requireScope('notice'), async (req, res) => {
  await db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.redirect('/moderator/notices');
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', ensureModerator, requireScope('event'), async (req, res) => {
  const events = await db.prepare('SELECT * FROM events ORDER BY date DESC LIMIT 30').all();
  res.render('user/moderator-events', { events, currentPath: '/moderator' });
});

router.post('/events', ensureModerator, requireScope('event'), async (req, res) => {
  const { title, description, date, end_date, location, image_url } = req.body;
  if (!title) return res.redirect('/moderator/events');
  await db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, 0)')
    .run(title, description || '', date || '', end_date || '', location || '', image_url || '');
  await broadcastToAll('event', 'নতুন ইভেন্ট', title, '/events', req.session.user.id);
  res.redirect('/moderator/events?posted=1');
});

router.delete('/events/:id', ensureModerator, requireScope('event'), async (req, res) => {
  await db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.redirect('/moderator/events');
});

// ── Best Writer (toggle featured on an existing article) ────────────────────
router.get('/best-writer', ensureModerator, requireScope('best_writer'), async (req, res) => {
  const articles = await db.prepare(`
    SELECT p.id, p.title, p.featured, u.full_name, u.username
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.type = 'article' AND p.status = 'published'
    ORDER BY p.published_at DESC LIMIT 40
  `).all();
  res.render('user/moderator-best-writer', { articles, currentPath: '/moderator' });
});

router.post('/best-writer/:id/toggle', ensureModerator, requireScope('best_writer'), async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (post) {
    const next = post.featured ? 0 : 1;
    await db.prepare('UPDATE posts SET featured = ? WHERE id = ?').run(next, post.id);
    if (next) {
      await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
        .run(post.author_id, 'best_writer', 'অভিনন্দন!', 'আপনার লেখাটি মাসিক সেরা লেখক হিসেবে নির্বাচিত হয়েছে', '/articles/' + post.id);
    }
  }
  res.redirect('/moderator/best-writer');
});

// ── Complaints (read + status update; visible only to scoped moderators) ────
router.get('/complaints', ensureModerator, requireScope('complaints'), async (req, res) => {
  const items = await db.prepare(`
    SELECT c.*, u.full_name, u.username FROM complaints c
    JOIN users u ON c.submitted_by = u.id
    ORDER BY c.created_at DESC
  `).all();
  res.render('user/moderator-complaints', { items, currentPath: '/moderator' });
});

router.post('/complaints/:id/status', ensureModerator, requireScope('complaints'), async (req, res) => {
  const { status, admin_notes } = req.body;
  await db.prepare("UPDATE complaints SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(status || 'new', admin_notes || '', req.params.id);
  res.redirect('/moderator/complaints');
});

module.exports = router;
