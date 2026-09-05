const express = require('express');
const router = express.Router();
const db = require('../db');
const { broadcastToAll } = require('./dashboard');
const { validateNavJson, parseNav } = require('../helpers/nav');

function ensureModerator(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.session.user.role !== 'moderator' && req.session.user.role !== 'admin') {
    return res.status(403).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
  }
  next();
}

function requireScope(scope) {
  return async (req, res, next) => {
    if (req.session.user.role === 'admin') return next(); // admin implicitly has every scope
    if (!(await db.hasScope(req.session.user.id, scope))) {
      return res.status(403).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
    }
    next();
  };
}

function today() { return new Date().toISOString().split('T')[0]; }

// ── Site menu management (admin + moderators) ────────────────────────────────
router.get('/navigation', ensureModerator, async (req, res) => {
  const settings = await db.getSettingsAll();
  res.render('user/moderator-navigation', {
    navConfig: parseNav(settings['nav_json']),
    success: req.query.saved ? 'মেনু সংরক্ষিত হয়েছে — সাইটে সাথে সাথে প্রযোজ্য' : null,
    error: null,
    currentPath: '/moderator/navigation'
  });
});

router.post('/navigation', ensureModerator, async (req, res) => {
  if (req.body.reset) {
    await db.setSetting('nav_json', '');
    return res.redirect('/moderator/navigation?saved=1');
  }
  const v = validateNavJson(req.body.nav_json);
  if (!v.ok) {
    const settings = await db.getSettingsAll();
    return res.status(400).render('user/moderator-navigation', {
      navConfig: parseNav(settings['nav_json']),
      success: null,
      error: v.error,
      currentPath: '/moderator/navigation'
    });
  }
  await db.setSetting('nav_json', v.nav.length ? JSON.stringify(v.nav) : '');
  res.redirect('/moderator/navigation?saved=1');
});

// ── Committee members management (admin + moderators) ────────────────────────
// Drives /committee (member_type='central') and /committee/advisory
// (member_type='advisory') public pages. Each row carries কার্যবর্ষ (term_year).
const MEMBER_TYPES = ['central', 'advisory'];

async function resolveMemberUserId(username) {
  const uname = String(username || '').trim();
  if (!uname) return null;
  const u = await db.prepare('SELECT id FROM users WHERE username = ?').get(uname);
  return u ? u.id : null;
}

function memberFormValues(b) {
  return {
    name: String(b.name || '').trim().slice(0, 120),
    role: String(b.role || '').trim().slice(0, 120),
    designation: String(b.designation || '').trim().slice(0, 160),
    bio: String(b.bio || '').trim().slice(0, 1200),
    image_url: String(b.image_url || '').trim().slice(0, 400),
    social_fb: String(b.social_fb || '').trim().slice(0, 300),
    social_email: String(b.social_email || '').trim().slice(0, 160),
    member_type: MEMBER_TYPES.includes(b.member_type) ? b.member_type : 'central',
    term_year: String(b.term_year || '').trim().slice(0, 40),
    sort_order: Math.max(0, parseInt(b.sort_order, 10) || 0)
  };
}

router.get('/members', ensureModerator, async (req, res) => {
  const members = await db.prepare(`
    SELECT m.*, u.username AS user_username
    FROM members m LEFT JOIN users u ON u.id = m.user_id
    ORDER BY CASE m.member_type WHEN 'central' THEN 0 ELSE 1 END, m.sort_order ASC, m.id ASC
  `).all();
  res.render('user/moderator-members', {
    members,
    posted: req.query.posted || null,
    removed: req.query.removed || null,
    error: req.query.error || null,
    currentPath: '/moderator/members'
  });
});

router.post('/members', ensureModerator, async (req, res) => {
  const v = memberFormValues(req.body);
  if (!v.name) return res.redirect('/moderator/members?error=' + encodeURIComponent('নাম আবশ্যক — সদস্য যোগ হয়নি।'));
  const user_id = await resolveMemberUserId(req.body.username);
  try {
    await db.prepare(`
      INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order, term_year, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(v.name, v.role, v.designation, v.bio, v.image_url, v.social_fb, v.social_email,
           v.member_type, v.sort_order, v.term_year || null, user_id);
  } catch (e) {
    if (String(e.message || '').includes('idx_members_unique_name_term')) {
      return res.redirect('/moderator/members?error=' + encodeURIComponent('এই নাম, কার্যবর্ষ ও ধরনের সদস্য ইতিমধ্যেই আছে — কার্যবর্ষ বদলে দিন বা বিদ্যমান সদস্য সম্পাদনা করুন।'));
    }
    throw e;
  }
  res.redirect('/moderator/members?posted=1');
});

router.post('/members/:id', ensureModerator, async (req, res) => {
  const row = await db.prepare('SELECT id FROM members WHERE id = ?').get(req.params.id);
  if (!row) return res.redirect('/moderator/members?error=' + encodeURIComponent('সদস্যটি খুঁজে পাওয়া যায়নি।'));
  const v = memberFormValues(req.body);
  if (!v.name) return res.redirect('/moderator/members?error=' + encodeURIComponent('নাম আবশ্যক — পরিবর্তন সংরক্ষিত হয়নি।'));
  const user_id = await resolveMemberUserId(req.body.username);
  try {
    await db.prepare(`
      UPDATE members SET name = ?, role = ?, designation = ?, bio = ?, image_url = ?,
        social_fb = ?, social_email = ?, member_type = ?, sort_order = ?, term_year = ?, user_id = ?
      WHERE id = ?
    `).run(v.name, v.role, v.designation, v.bio, v.image_url, v.social_fb, v.social_email,
           v.member_type, v.sort_order, v.term_year || null, user_id, req.params.id);
  } catch (e) {
    if (String(e.message || '').includes('idx_members_unique_name_term')) {
      return res.redirect('/moderator/members?error=' + encodeURIComponent('এই নাম, কার্যবর্ষ ও ধরনের আরেকজন সদস্য আছে — নাম বা কার্যবর্ষ আলাদা করুন।'));
    }
    throw e;
  }
  res.redirect('/moderator/members?posted=1');
});

router.post('/members/:id/delete', ensureModerator, async (req, res) => {
  await db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.redirect('/moderator/members?removed=1');
});

// ── Moderator dashboard ──────────────────────────────────────────────────────
router.get('/', ensureModerator, async (req, res) => {
  const myScopes = req.session.user.role === 'admin'
    ? db.MODERATOR_SCOPES.map(s => s.key)
    : await db.getModeratorScopes(req.session.user.id);
  // Stats for dashboard
  let stats = { notices: 0, events: 0, daily: 0 };
  try { stats.notices = (await db.prepare('SELECT COUNT(*) as c FROM notices').get()).c; } catch(e) {}
  try { stats.events = (await db.prepare('SELECT COUNT(*) as c FROM events').get()).c; } catch(e) {}
  try { stats.daily = (await db.prepare('SELECT COUNT(*) as c FROM daily_content WHERE published = 1').get()).c; } catch(e) {}
  res.render('user/moderator-dashboard', {
    scopes: db.MODERATOR_SCOPES,
    myScopes,
    scopeAliases: db.SCOPE_ALIASES,
    dailyContentScopes: db.DAILY_CONTENT_SCOPES,
    stats,
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
    res.render('user/moderator-daily-form', { type: req.params.type, meta, items, todayDate: today(), posted: req.query.posted || null, currentPath: '/moderator' });
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
  res.render('user/moderator-notices', { notices, posted: req.query.posted || null, currentPath: '/moderator' });
});

router.post('/notices', ensureModerator, requireScope('notice'), async (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.redirect('/moderator/notices');
  await db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)')
    .run(title, content || '', category || 'notice', date || today());
  await broadcastToAll('notice', 'নতুন বিজ্ঞপ্তি', title, '/notices', req.session.user.id);
  // Newsletter — subscribers get an automatic email for every new notice
  try {
    const mailer = require('../helpers/mailer');
    await mailer.notifySubscribers({
      kind: 'notice', title, body: content || '', authorName: req.session.user.full_name || ''
    });
  } catch (e) { console.error('[newsletter] moderator notice notify failed:', e.message); }
  res.redirect('/moderator/notices?posted=1');
});

router.delete('/notices/:id', ensureModerator, requireScope('notice'), async (req, res) => {
  await db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.redirect('/moderator/notices');
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', ensureModerator, requireScope('event'), async (req, res) => {
  const events = await db.prepare('SELECT * FROM events ORDER BY date DESC LIMIT 30').all();
  res.render('user/moderator-events', { events, posted: req.query.posted || null, currentPath: '/moderator' });
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
