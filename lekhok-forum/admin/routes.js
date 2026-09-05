const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { broadcastToAll } = require('../helpers/notify');
const { galleryUpload, attachmentUpload, withUpload } = require('../middleware/upload');
const getSetting = db.getSetting;
const setSetting = db.setSetting;

// ── Auth middleware ──────────────────────────────────────────────────────────
// Admin  = admin_users session OR user session with role='admin'  → full access
// Staff  = admin + user session with role='moderator' (scope-limited)
const ADMIN_SCOPES = ['daily', 'notices', 'events', 'gallery', 'complaints'];
// Unified scope catalogue (v2.6): canonical singular keys match the
// /moderator panel + MODERATOR_SCOPES catalogue; legacy plural keys keep
// working via db.hasScope() aliases. The scope checkbox UI shows this list.
const CANONICAL_SCOPES = [
  { key: 'notice',      label: 'বিজ্ঞপ্তি',        icon: 'fas fa-bullhorn' },
  { key: 'event',       label: 'ইভেন্ট',           icon: 'fas fa-calendar-day' },
  { key: 'gallery',     label: 'গ্যালারি',          icon: 'fas fa-images' },
  { key: 'complaints',  label: 'অভিযোগ',           icon: 'fas fa-flag' },
  { key: 'daily',       label: 'ডেইলি কনটেন্ট',    icon: 'fas fa-sun' },
  { key: 'quiz',        label: 'আজকের কুইজ',       icon: 'fas fa-question-circle' },
  { key: 'this_day',    label: 'আজকের এই দিনে',    icon: 'fas fa-history' },
  { key: 'best_writer', label: 'মাসিক সেরা লেখক',  icon: 'fas fa-pen-fancy' },
  { key: 'activity',    label: 'সাংগঠনিক কার্যক্রম', icon: 'fas fa-running' },
  { key: 'epaper',      label: 'আজকের ই-পেপার',   icon: 'fas fa-newspaper' }
];
const VALID_SCOPE_KEYS = CANONICAL_SCOPES.map(s => s.key).concat(ADMIN_SCOPES); // canonical + legacy plural

function expandScopes(list) {
  const out = new Set(list || []);
  for (const s of (list || [])) {
    if (db.SCOPE_ALIASES && db.SCOPE_ALIASES[s]) out.add(db.SCOPE_ALIASES[s]);
  }
  return [...out];
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUser) return next();
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  return res.redirect('/admin/login');
}

function isStaff(req) {
  if (req.session && req.session.adminUser) return true;
  const u = req.session && req.session.user;
  return !!(u && (u.role === 'admin' || u.role === 'moderator'));
}

// Scope check: admin always true; moderator must have a moderator_scopes row
async function hasScope(req, scope) {
  if (req.session && req.session.adminUser) return true;
  const u = req.session && req.session.user;
  if (!u) return false;
  if (u.role === 'admin') return true;
  if (u.role !== 'moderator') return false;
  // Delegate to db.hasScope — alias-aware (notice/notices, event/events)
  // and cross-backend (sql.js + Turso).
  return !!(await db.hasScope(u.id, scope));
}

function requireScope(scope) {
  return async (req, res, next) => {
    if (!isStaff(req)) return res.redirect('/admin/login');
    if (!(await hasScope(req, scope))) {
      return res.status(403).render('admin/denied', { currentPath: '/admin' });
    }
    next();
  };
}

function requireStaff(req, res, next) {
  if (!isStaff(req)) return res.redirect('/admin/login');
  next();
}

// ── Login (GET) ──────────────────────────────────────────────────────────────
router.get('/login', async (req, res) => {
  if (req.session.adminUser) return res.redirect('/admin');
  res.render('admin/login', { error: null, layout: false, currentPath: '/admin/login' });
});

// ── Login (POST) ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.render('admin/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', layout: false, currentPath: '/admin/login' });
    }
    req.session.adminUser = { id: user.id, username: user.username, display_name: user.display_name };
    return new Promise((resolve) => req.session.save((err) => {
      if (err) console.error('[admin] /admin/login session save error:', err);
      res.redirect('/admin');
      resolve();
    }));
  } catch (e) {
    console.error('[admin] /admin/login error:', e);
    return res.status(500).render('admin/login', { error: 'লগইন ব্যর্থ: ' + e.message, layout: false, currentPath: '/admin/login' });
  }
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', async (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/', requireStaff, async (req, res) => {
  const counts = {
    notices:   (await db.prepare('SELECT COUNT(*) as c FROM notices').get()).c,
    events:    (await db.prepare('SELECT COUNT(*) as c FROM events').get()).c,
    members:   (await db.prepare('SELECT COUNT(*) as c FROM members').get()).c,
    gallery:   (await db.prepare('SELECT COUNT(*) as c FROM gallery').get()).c,
    resources: (await db.prepare('SELECT COUNT(*) as c FROM resources').get()).c,
    messages:  (await db.prepare('SELECT COUNT(*) as c FROM contact_submissions').get()).c,
    users:     (await db.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").get()).c,
    posts:     (await db.prepare("SELECT COUNT(*) as c FROM posts WHERE status='published'").get()).c,
    daily:     (await db.prepare('SELECT COUNT(*) as c FROM daily_content').get()).c,
    complaints: (await db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status='new'").get()).c
  };
  // সাম্প্রতিক কার্যক্রম — ড্যাশবোর্ডে সরাসরি এক নজরে (fail-safe প্রতিটি ব্লক)
  const safe = async (label, sql) => {
    try { return await db.prepare(sql).all(); }
    catch (e) { console.error(`[admin:dashboard] ${label}:`, e.message); return []; }
  };
  const recent = {
    notices:    await safe('notices',    'SELECT id, title, date FROM notices ORDER BY id DESC LIMIT 5'),
    events:     await safe('events',     'SELECT id, title, date FROM events ORDER BY id DESC LIMIT 5'),
    messages:   await safe('messages',   'SELECT id, name, subject, created_at FROM contact_submissions ORDER BY id DESC LIMIT 5'),
    complaints: await safe('complaints', "SELECT id, subject, status, created_at FROM complaints ORDER BY id DESC LIMIT 5"),
    users:      await safe('users',      'SELECT id, full_name, username, created_at FROM users ORDER BY id DESC LIMIT 5'),
    posts:      await safe('posts',      "SELECT id, title, published_at FROM posts WHERE status='published' ORDER BY id DESC LIMIT 5")
  };
  res.render('admin/dashboard', { counts, recent, currentPath: '/admin' });
});

// ── Notices CRUD (scope: notices; create broadcasts to all users) ───────────
router.get('/notices', requireScope('notices'), async (req, res) => {
  const notices = await db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  res.render('admin/notices/list', { notices, currentPath: '/admin/notices' });
});

router.get('/notices/new', requireScope('notices'), async (req, res) => {
  res.render('admin/notices/form', { notice: null, error: null, currentPath: '/admin/notices' });
});

router.post('/notices', requireScope('notices'), async (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.render('admin/notices/form', { notice: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/notices' });
  await db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)').run(title, content || '', category || 'notice', date || '');
  // Auto-notify all users about the new notice
  await broadcastToAll('notice', 'নতুন বিজ্ঞপ্তি', title, '/notices', req.session.user ? req.session.user.id : 0);
  // Newsletter — email all active subscribers automatically (queued even
  // without a mail provider, so the panel always shows the record).
  try {
    const mailer = require('../helpers/mailer');
    const r = await mailer.notifySubscribers({
      kind: 'notice', title, body: content || '', authorName: 'প্রশাসন'
    });
    console.log(`[newsletter] notice: queued=${r.queued} sent=${r.sent} failed=${r.failed}`);
  } catch (e) { console.error('[newsletter] notice notify failed:', e.message); }
  res.redirect('/admin/notices?saved=1');
});

router.get('/notices/:id/edit', requireScope('notices'), async (req, res) => {
  const notice = await db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
  if (!notice) return res.redirect('/admin/notices?saved=1');
  res.render('admin/notices/form', { notice, error: null, currentPath: '/admin/notices' });
});

router.put('/notices/:id', requireScope('notices'), async (req, res) => {
  const { title, content, category, date } = req.body;
  await db.prepare('UPDATE notices SET title=?, content=?, category=?, date=? WHERE id=?').run(title, content || '', category || 'notice', date || '', req.params.id);
  res.redirect('/admin/notices?saved=1');
});

router.delete('/notices/:id', requireScope('notices'), async (req, res) => {
  await db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.redirect('/admin/notices?saved=1');
});

// ── Events CRUD (scope: events; create broadcasts to all users) ─────────────
router.get('/events', requireScope('events'), async (req, res) => {
  const events = await db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  res.render('admin/events/list', { events, currentPath: '/admin/events' });
});

router.get('/events/new', requireScope('events'), async (req, res) => {
  res.render('admin/events/form', { event: null, error: null, currentPath: '/admin/events' });
});

router.post('/events', requireScope('events'), async (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  if (!title) return res.render('admin/events/form', { event: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/events' });
  await db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0);
  // Auto-notify all users about the new event
  await broadcastToAll('event', 'নতুন ইভেন্ট', title, '/events', req.session.user ? req.session.user.id : 0);
  res.redirect('/admin/events?saved=1');
});

router.get('/events/:id/edit', requireScope('events'), async (req, res) => {
  const event = await db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.redirect('/admin/events?saved=1');
  res.render('admin/events/form', { event, error: null, currentPath: '/admin/events' });
});

router.put('/events/:id', requireScope('events'), async (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  await db.prepare('UPDATE events SET title=?, description=?, date=?, end_date=?, location=?, image_url=?, featured=? WHERE id=?').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0, req.params.id);
  res.redirect('/admin/events?saved=1');
});

router.delete('/events/:id', requireScope('events'), async (req, res) => {
  await db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.redirect('/admin/events?saved=1');
});

// ── Members CRUD ─────────────────────────────────────────────────────────────
// Helper — fetch all users for the "link to account" dropdown.
const fetchAllUsers = () => db.prepare("SELECT id, username, full_name FROM users ORDER BY full_name").all();

router.get('/members', requireAdmin, async (req, res) => {
  const members = await db.prepare("SELECT * FROM members ORDER BY IFNULL(term_year,'') DESC, member_type, sort_order").all();
  res.render('admin/members/list', { members, currentPath: '/admin/members' });
});

router.get('/members/new', requireAdmin, async (req, res) => {
  const allUsers = await fetchAllUsers();
  res.render('admin/members/form', { member: null, error: null, allUsers, currentPath: '/admin/members' });
});

router.post('/members', requireAdmin, async (req, res) => {
  const { name, role, designation, bio, image_url, social_fb, social_email, member_type, term_year, sort_order, user_id } = req.body;
  if (!name) {
    const allUsers = await fetchAllUsers();
    return res.render('admin/members/form', { member: req.body, error: 'নাম আবশ্যক', allUsers, currentPath: '/admin/members' });
  }
  const userIdNum = user_id && String(user_id).trim() !== '' ? parseInt(user_id, 10) : null;
  const termYear = term_year && String(term_year).trim() !== '' ? String(term_year).trim() : null;
  try {
    await db.prepare('INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, term_year, sort_order, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, role || '', designation || '', bio || '', image_url || '', social_fb || '', social_email || '', member_type || 'central', termYear, parseInt(sort_order) || 0, userIdNum);
  } catch (e) {
    const allUsers = await fetchAllUsers();
    return res.render('admin/members/form', { member: req.body, error: 'এই নাম, কার্যবর্ষ ও ধরনে একজন সদস্য ইতিমধ্যে যোগ করা আছেন।', allUsers, currentPath: '/admin/members' });
  }
  res.redirect('/admin/members?saved=1');
});

router.get('/members/:id/edit', requireAdmin, async (req, res) => {
  const member = await db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.redirect('/admin/members?saved=1');
  const allUsers = await fetchAllUsers();
  res.render('admin/members/form', { member, error: null, allUsers, currentPath: '/admin/members' });
});

router.put('/members/:id', requireAdmin, async (req, res) => {
  const { name, role, designation, bio, image_url, social_fb, social_email, member_type, term_year, sort_order, user_id } = req.body;
  const userIdNum = user_id && String(user_id).trim() !== '' ? parseInt(user_id, 10) : null;
  const termYear = term_year && String(term_year).trim() !== '' ? String(term_year).trim() : null;
  try {
    await db.prepare('UPDATE members SET name=?, role=?, designation=?, bio=?, image_url=?, social_fb=?, social_email=?, member_type=?, term_year=?, sort_order=?, user_id=? WHERE id=?').run(name, role || '', designation || '', bio || '', image_url || '', social_fb || '', social_email || '', member_type || 'central', termYear, parseInt(sort_order) || 0, userIdNum, req.params.id);
  } catch (e) {
    const allUsers = await fetchAllUsers();
    return res.render('admin/members/form', { member: { ...req.body, id: req.params.id }, error: 'এই নাম, কার্যবর্ষ ও ধরনে আরেকজন সদস্য ইতিমধ্যে আছেন।', allUsers, currentPath: '/admin/members' });
  }
  res.redirect('/admin/members?saved=1');
});

router.delete('/members/:id', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.redirect('/admin/members?saved=1');
});

// ── Gallery CRUD (scope: gallery; supports file upload or image URL) ────────
router.get('/gallery', requireScope('gallery'), async (req, res) => {
  const items = await db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.render('admin/gallery/list', { items, currentPath: '/admin/gallery' });
});

router.get('/gallery/new', requireScope('gallery'), async (req, res) => {
  res.render('admin/gallery/form', { item: null, error: null, currentPath: '/admin/gallery' });
});

router.post('/gallery', requireScope('gallery'), withUpload(galleryUpload), async (req, res) => {
  const { title, image_url, caption, category } = req.body;
  const img = req.file ? '/uploads/gallery/' + req.file.filename : image_url;
  if (!img) return res.render('admin/gallery/form', { item: req.body, error: 'ছবি আপলোড করুন বা URL দিন', currentPath: '/admin/gallery' });
  await db.prepare('INSERT INTO gallery (title, image_url, caption, category) VALUES (?, ?, ?, ?)').run(title || '', img, caption || '', category || 'general');
  res.redirect('/admin/gallery?saved=1');
});

router.get('/gallery/:id/edit', requireScope('gallery'), async (req, res) => {
  const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/gallery?saved=1');
  res.render('admin/gallery/form', { item, error: null, currentPath: '/admin/gallery' });
});

router.put('/gallery/:id', requireScope('gallery'), withUpload(galleryUpload), async (req, res) => {
  const { title, image_url, caption, category } = req.body;
  const item = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  const img = req.file ? '/uploads/gallery/' + req.file.filename : (image_url || item.image_url);
  await db.prepare('UPDATE gallery SET title=?, image_url=?, caption=?, category=? WHERE id=?').run(title || '', img, caption || '', category || 'general', req.params.id);
  res.redirect('/admin/gallery?saved=1');
});

router.delete('/gallery/:id', requireScope('gallery'), async (req, res) => {
  await db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.redirect('/admin/gallery?saved=1');
});

// ── Resources CRUD ───────────────────────────────────────────────────────────
router.get('/resources', requireAdmin, async (req, res) => {
  const resources = await db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  res.render('admin/resources/list', { resources, currentPath: '/admin/resources' });
});

router.get('/resources/new', requireAdmin, async (req, res) => {
  res.render('admin/resources/form', { resource: null, error: null, currentPath: '/admin/resources' });
});

router.post('/resources', requireAdmin, async (req, res) => {
  const { title, content, category, author, tags, file_url, link_url, file_type } = req.body;
  if (!title) return res.render('admin/resources/form', { resource: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/resources' });
  await db.prepare('INSERT INTO resources (title, content, category, author, tags, file_url, link_url, file_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(title, content || '', category || 'general', author || '', tags || '', file_url || null, link_url || null, file_type || 'link');
  res.redirect('/admin/resources?saved=1');
});

router.get('/resources/:id/edit', requireAdmin, async (req, res) => {
  const resource = await db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!resource) return res.redirect('/admin/resources?saved=1');
  res.render('admin/resources/form', { resource, error: null, currentPath: '/admin/resources' });
});

router.put('/resources/:id', requireAdmin, async (req, res) => {
  const { title, content, category, author, tags, file_url, link_url, file_type } = req.body;
  await db.prepare('UPDATE resources SET title=?, content=?, category=?, author=?, tags=?, file_url=?, link_url=?, file_type=? WHERE id=?').run(title, content || '', category || 'general', author || '', tags || '', file_url || null, link_url || null, file_type || 'link', req.params.id);
  res.redirect('/admin/resources?saved=1');
});

router.delete('/resources/:id', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  res.redirect('/admin/resources?saved=1');
});

// ── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', requireAdmin, async (req, res) => {
  const keys = ['site_name','tagline','contact_email','contact_phone','contact_address','facebook_url','telegram_url','youtube_url'];
  const settings = {};
  for (const k of keys) { settings[k] = await getSetting(k) || ''; }
  res.render('admin/settings', { settings, success: null, currentPath: '/admin/settings' });
});

router.post('/settings', requireAdmin, async (req, res) => {
  const keys = ['site_name','tagline','contact_email','contact_phone','contact_address','facebook_url','telegram_url','youtube_url'];
  for (const k of keys) await setSetting(k, req.body[k] || '');
  const settings = {};
  for (const k of keys) { settings[k] = await getSetting(k) || ''; }
  res.render('admin/settings', { settings, success: 'সেটিংস সংরক্ষিত হয়েছে', currentPath: '/admin/settings' });
});

// ── Messages ─────────────────────────────────────────────────────────────────
router.get('/messages', requireAdmin, async (req, res) => {
  const messages = await db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC').all();
  res.render('admin/messages', { messages, currentPath: '/admin/messages' });
});

// ── Newsletter subscribers (visible to admin AND moderators) ─────────────────
router.get('/subscribers', requireStaff, async (req, res) => {
  const subs = await db.prepare('SELECT * FROM newsletter_subscribers ORDER BY id DESC').all();
  const logs = await db.prepare('SELECT * FROM newsletter_log ORDER BY id DESC LIMIT 30').all();
  const stats = {
    total: subs.length,
    active: subs.filter(s => s.is_active).length,
    sent: (await db.prepare("SELECT COUNT(*) as c FROM newsletter_queue WHERE status = 'sent'").get()).c,
    pending: (await db.prepare("SELECT COUNT(*) as c FROM newsletter_queue WHERE status != 'sent'").get()).c,
    mailConfigured: require('../helpers/mailer').isConfigured()
  };
  res.render('admin/subscribers', { subs, logs, stats, currentPath: '/admin/subscribers' });
});

// CSV export — full subscriber detail for offline records
router.get('/subscribers/export', requireStaff, async (req, res) => {
  const subs = await db.prepare('SELECT * FROM newsletter_subscribers ORDER BY id ASC').all();
  const rows = [['id', 'email', 'name', 'active', 'source', 'created_at', 'unsubscribed_at']];
  for (const s of subs) rows.push([s.id, s.email, s.name || '', s.is_active ? 'yes' : 'no', s.source || '', s.created_at || '', s.unsubscribed_at || '']);
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
  res.send('\ufeff' + csv); // BOM so Excel renders Bengali/UTF-8 correctly
});

// Toggle active state / delete — admin only (moderators get view-only)
router.post('/subscribers/:id/toggle', requireAdmin, async (req, res) => {
  await db.prepare('UPDATE newsletter_subscribers SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
  res.redirect('/admin/subscribers?saved=1');
});
router.post('/subscribers/:id/delete', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(req.params.id);
  res.redirect('/admin/subscribers?saved=1');
});

// Retry pending/failed emails for a notification batch (admin only)
router.post('/subscribers/retry/:logId', requireAdmin, async (req, res) => {
  try {
    const r = await require('../helpers/mailer').retryLog(req.params.logId);
    if (!r.ok) console.error('[newsletter] retry:', r.error);
  } catch (e) { console.error('[newsletter] retry failed:', e.message); }
  res.redirect('/admin/subscribers?saved=1');
});

// ── Moderators & permission scopes ────────────────────────────────────────────
router.get('/moderators', requireAdmin, async (req, res) => {
  const users = await db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM moderator_scopes ms WHERE ms.user_id = u.id) as scope_count,
      (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) as post_count
    FROM users u ORDER BY u.role DESC, u.full_name ASC
  `).all();
  // (async migration) nested per-user scope lookups moved from sync .map to for..of
  const staff = [];
  for (const u of users.filter(u => u.role === 'moderator' || u.role === 'admin')) {
    const scopes = await db.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(u.id);
    // Expand aliases so checkbox state is accurate whichever variant is stored
    staff.push({ ...u, scopes: expandScopes(scopes.map(r => r.scope)) });
  }
  res.render('admin/moderators', { users, staff, CANONICAL_SCOPES, currentPath: '/admin/moderators' });
});

router.post('/moderators/:userId/grant', requireAdmin, async (req, res) => {
  let scopes = req.body.scopes || [];
  if (!Array.isArray(scopes)) scopes = [scopes];
  const granterId = req.session.adminUser ? req.session.adminUser.id : (req.session.user ? req.session.user.id : null);
  await db.grantModerator(parseInt(req.params.userId), scopes, granterId);
  res.redirect('/admin/moderators?saved=1');
});

router.post('/moderators/:userId/revoke', requireAdmin, async (req, res) => {
  await db.revokeModerator(parseInt(req.params.userId));
  res.redirect('/admin/moderators?saved=1');
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Daily Content (scope: daily) — quiz / this_day / epaper / activity ──────
// ══════════════════════════════════════════════════════════════════════════════
const DAILY_TYPES = {
  quiz:        { label: 'আজকের কুইজ',         link: '/quiz',          icon: 'fas fa-question-circle' },
  this_day:    { label: 'আজকের এই দিনে',      link: '/on-this-day',   icon: 'fas fa-history' },
  epaper:      { label: 'আজকের ই-পেপার',      link: '/epaper',        icon: 'fas fa-newspaper' },
  activity:    { label: 'সাংগঠনিক কার্যক্রম', link: '/activities',    icon: 'fas fa-running' },
  best_writer: { label: 'মাসিক সেরা লেখক',    link: '/best-writer',   icon: 'fas fa-pen-fancy' }
};

function dailyTypeMeta(type) { return DAILY_TYPES[type] || { label: type, link: '/' }; }

router.get('/daily', requireScope('daily'), async (req, res) => {
  const items = await db.prepare('SELECT * FROM daily_content ORDER BY scheduled_date DESC, id DESC LIMIT 100').all();
  res.render('admin/daily/list', { items, DAILY_TYPES, currentPath: '/admin/daily' });
});

router.get('/daily/new', requireScope('daily'), async (req, res) => {
  res.render('admin/daily/form', { item: null, error: null, DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
});

router.post('/daily', requireScope('daily'), async (req, res) => {
  const { content_type, title, body, image_url, link_url, scheduled_date, published } = req.body;
  if (!DAILY_TYPES[content_type]) return res.render('admin/daily/form', { item: req.body, error: 'ধরন নির্বাচন করুন', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  if (!title) return res.render('admin/daily/form', { item: req.body, error: 'শিরোনাম আবশ্যক', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  const isPublished = published ? 1 : 0;
  await db.prepare('INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, published, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(content_type, title, body || null, image_url || null, link_url || null, scheduled_date || new Date().toISOString().split('T')[0], isPublished, req.session.user ? req.session.user.id : null);
  // Auto-notify ALL users when a moderator/admin publishes daily content
  if (isPublished) {
    const meta = dailyTypeMeta(content_type);
    broadcastToAll('daily', meta.label + ' প্রকাশিত', title, meta.link, req.session.user ? req.session.user.id : 0);
  }
  res.redirect('/admin/daily?saved=1');
});

router.get('/daily/:id/edit', requireScope('daily'), async (req, res) => {
  const item = await db.prepare('SELECT * FROM daily_content WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/daily?saved=1');
  res.render('admin/daily/form', { item, error: null, DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
});

router.put('/daily/:id', requireScope('daily'), async (req, res) => {
  const { content_type, title, body, image_url, link_url, scheduled_date, published } = req.body;
  if (!DAILY_TYPES[content_type]) return res.render('admin/daily/form', { item: { ...req.body, id: req.params.id }, error: 'ধরন নির্বাচন করুন', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  if (!title) return res.render('admin/daily/form', { item: { ...req.body, id: req.params.id }, error: 'শিরোনাম আবশ্যক', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  const isPublished = published ? 1 : 0;
  await db.prepare('UPDATE daily_content SET content_type=?, title=?, body=?, image_url=?, link_url=?, scheduled_date=?, published=? WHERE id=?')
    .run(content_type, title, body || null, image_url || null, link_url || null, scheduled_date || new Date().toISOString().split('T')[0], isPublished, req.params.id);
  res.redirect('/admin/daily?saved=1');
});

router.delete('/daily/:id', requireScope('daily'), async (req, res) => {
  await db.prepare('DELETE FROM daily_content WHERE id = ?').run(req.params.id);
  res.redirect('/admin/daily?saved=1');
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Complaints management (scope: complaints) — private, admin/moderators ───
// ══════════════════════════════════════════════════════════════════════════════
router.get('/complaints', requireScope('complaints'), async (req, res) => {
  const status = req.query.status || '';
  let q = `SELECT c.*, u.full_name as submitter_name, u.username as submitter_username, u.avatar_url as submitter_avatar
           FROM complaints c LEFT JOIN users u ON c.submitted_by = u.id`;
  const params = [];
  if (status) { q += ' WHERE c.status = ?'; params.push(status); }
  q += ' ORDER BY c.created_at DESC';
  const complaints = await db.prepare(q).all(...params);
  const newCount = (await db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status='new'").get()).c;
  res.render('admin/complaints', { complaints, status, newCount, currentPath: '/admin/complaints' });
});

router.put('/complaints/:id', requireScope('complaints'), async (req, res) => {
  const { status, admin_notes } = req.body;
  const allowed = ['new', 'in_review', 'resolved', 'dismissed'];
  await db.prepare("UPDATE complaints SET status=?, admin_notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(allowed.includes(status) ? status : 'new', admin_notes || null, req.params.id);
  res.redirect('/admin/complaints?saved=1');
});

router.delete('/complaints/:id', requireScope('complaints'), async (req, res) => {
  await db.prepare('DELETE FROM complaints WHERE id = ?').run(req.params.id);
  res.redirect('/admin/complaints?saved=1');
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Moderators & users management (admin only) ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// NOTE: a second, identical `GET /moderators` registration used to live here —
// Express only ever used the first one, so it was dead code. Removed in v2.6.

// Change a user's role (user / moderator / admin / banned)
router.post('/users/:id/role', requireAdmin, async (req, res) => {
  const { role, status } = req.body;
  const allowedRoles = ['user', 'moderator', 'admin'];
  const allowedStatus = ['active', 'pending', 'banned'];
  const target = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.redirect('/admin/moderators?saved=1');
  if (role && allowedRoles.includes(role)) {
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    if (role === 'moderator' && !await db.prepare('SELECT id FROM moderator_scopes WHERE user_id = ?').get(req.params.id)) {
      // New moderators get the full canonical scope set by default (v2.6).
      // Previously only ['daily','notices','events'] was granted — plural keys
      // satisfied NONE of the /moderator panel's singular scope checks, so a
      // freshly promoted moderator could not use their own panel at all.
      await db.grantModerator(parseInt(req.params.id), VALID_SCOPE_KEYS, null);
    }
  }
  if (status && allowedStatus.includes(status)) {
    await db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  }
  res.redirect('/admin/moderators?saved=1');
});

// Reset a user's password (admin hands over committee accounts etc.)
router.post('/users/:id/password', requireAdmin, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || String(new_password).length < 6) {
    return res.redirect('/admin/users/' + req.params.id + '/edit?pwd=short');
  }
  const hash = bcrypt.hashSync(String(new_password), 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
  res.redirect('/admin/users/' + req.params.id + '/edit?pwd=ok');
});

// ── v2.2: User management (full list + edit) ──────────────────────────────────
router.get('/users', requireAdmin, async (req, res) => {
  const q = (req.query.q || '').trim();
  const roleFilter = req.query.role || '';
  const statusFilter = req.query.status || '';
  let sql = `SELECT u.id, u.username, u.full_name, u.email, u.role, u.status, u.gender, u.created_at, u.last_login,
                    (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) AS post_count,
                    (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS follower_count
             FROM users u WHERE 1=1`;
  const params = [];
  if (q) { sql += ' AND (u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)'; params.push('%' + q + '%', '%' + q + '%', '%' + q + '%'); }
  if (roleFilter)   { sql += ' AND u.role = ?';   params.push(roleFilter); }
  if (statusFilter) { sql += ' AND u.status = ?'; params.push(statusFilter); }
  sql += ' ORDER BY u.created_at DESC LIMIT 200';
  const users = await db.prepare(sql).all(...params);
  res.render('admin/users/list', { users, q, roleFilter, statusFilter, currentPath: '/admin/users' });
});

router.get('/users/:id/edit', requireAdmin, async (req, res) => {
  const u = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.redirect('/admin/users?saved=1');
  const rawScopes = (await db.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(u.id)).map(r => r.scope);
  const scopes = expandScopes(rawScopes);
  const postCount = (await db.prepare('SELECT COUNT(*) AS c FROM posts WHERE author_id = ?').get(u.id)).c;
  const complaintCount = (await db.prepare('SELECT COUNT(*) AS c FROM complaints WHERE submitted_by = ?').get(u.id)).c;
  const followerCount = (await db.prepare('SELECT COUNT(*) AS c FROM follows WHERE following_id = ?').get(u.id)).c;
  res.render('admin/users/edit', {
    u, scopes, postCount, complaintCount, followerCount, CANONICAL_SCOPES,
    pwdStatus: req.query.pwd || null, currentPath: '/admin/users'
  });
});

// Update a moderator's scopes
router.post('/users/:id/scopes', requireAdmin, async (req, res) => {
  const target = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.redirect('/admin/moderators?saved=1');
  await db.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(req.params.id);
  const scopes = Array.isArray(req.body.scopes) ? req.body.scopes : (req.body.scopes ? [req.body.scopes] : []);
  for (const s of scopes) {
    // Accept canonical + legacy plural keys (aliases keep old rows working)
    if (VALID_SCOPE_KEYS.includes(s)) {
      const granterId = req.session.user ? req.session.user.id : (req.session.adminUser ? req.session.adminUser.id : null);
      await db.prepare('INSERT INTO moderator_scopes (user_id, scope, granted_by) VALUES (?, ?, ?)').run(req.params.id, s, granterId);
    }
  }
  res.redirect('/admin/moderators?saved=1');
});

// ── v2.2: Achievements CRUD ──────────────────────────────────────────────────
router.get('/achievements', requireAdmin, async (req, res) => {
  const items = await db.prepare('SELECT * FROM achievements ORDER BY year DESC, id DESC').all();
  res.render('admin/achievements/list', { items, currentPath: '/admin/achievements' });
});
router.get('/achievements/new', requireAdmin, async (req, res) => {
  res.render('admin/achievements/form', { item: null, error: null, currentPath: '/admin/achievements' });
});
router.post('/achievements', requireAdmin, withUpload(attachmentUpload), async (req, res) => {
  const { title, recipient_name, year, description } = req.body;
  const image_url = req.file ? '/uploads/attachments/' + req.file.filename : (req.body.image_url || null);
  await db.prepare('INSERT INTO achievements (title, recipient_name, year, description, image_url) VALUES (?, ?, ?, ?, ?)').run(title, recipient_name, parseInt(year) || null, description || null, image_url);
  res.redirect('/admin/achievements?saved=1');
});
router.get('/achievements/:id/edit', requireAdmin, async (req, res) => {
  const item = await db.prepare('SELECT * FROM achievements WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/achievements?saved=1');
  res.render('admin/achievements/form', { item, error: null, currentPath: '/admin/achievements' });
});
router.put('/achievements/:id', requireAdmin, withUpload(attachmentUpload), async (req, res) => {
  const { title, recipient_name, year, description } = req.body;
  const image_url = req.file ? '/uploads/attachments/' + req.file.filename : (req.body.image_url || null);
  await db.prepare('UPDATE achievements SET title=?, recipient_name=?, year=?, description=?, image_url=? WHERE id=?').run(title, recipient_name, parseInt(year) || null, description || null, image_url, req.params.id);
  res.redirect('/admin/achievements?saved=1');
});
router.delete('/achievements/:id', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM achievements WHERE id = ?').run(req.params.id);
  res.redirect('/admin/achievements?saved=1');
});

// ── v2.2: Constitution CRUD ──────────────────────────────────────────────────
router.get('/constitution', requireAdmin, async (req, res) => {
  const items = await db.prepare('SELECT * FROM constitution ORDER BY sort_order, id').all();
  res.render('admin/constitution/list', { items, currentPath: '/admin/constitution' });
});
router.get('/constitution/new', requireAdmin, async (req, res) => {
  res.render('admin/constitution/form', { item: null, error: null, currentPath: '/admin/constitution' });
});
router.post('/constitution', requireAdmin, async (req, res) => {
  const { section_title, content, sort_order } = req.body;
  await db.prepare('INSERT INTO constitution (section_title, content, sort_order) VALUES (?, ?, ?)').run(section_title, content, parseInt(sort_order) || 0);
  res.redirect('/admin/constitution?saved=1');
});
router.get('/constitution/:id/edit', requireAdmin, async (req, res) => {
  const item = await db.prepare('SELECT * FROM constitution WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/constitution?saved=1');
  res.render('admin/constitution/form', { item, error: null, currentPath: '/admin/constitution' });
});
router.put('/constitution/:id', requireAdmin, async (req, res) => {
  const { section_title, content, sort_order } = req.body;
  await db.prepare('UPDATE constitution SET section_title=?, content=?, sort_order=? WHERE id=?').run(section_title, content, parseInt(sort_order) || 0, req.params.id);
  res.redirect('/admin/constitution?saved=1');
});
router.delete('/constitution/:id', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM constitution WHERE id = ?').run(req.params.id);
  res.redirect('/admin/constitution?saved=1');
});

// ── v2.2: Past leaders CRUD ──────────────────────────────────────────────────
router.get('/past-leaders', requireAdmin, async (req, res) => {
  const items = await db.prepare('SELECT * FROM past_leaders ORDER BY term_start DESC, id DESC').all();
  res.render('admin/past-leaders/list', { items, currentPath: '/admin/past-leaders' });
});
router.get('/past-leaders/new', requireAdmin, async (req, res) => {
  const allUsers = await fetchAllUsers();
  res.render('admin/past-leaders/form', { item: null, error: null, allUsers, currentPath: '/admin/past-leaders' });
});
router.post('/past-leaders', requireAdmin, withUpload(attachmentUpload), async (req, res) => {
  const { name, role, term_start, term_end, bio, sort_order, user_id } = req.body;
  const photo_url = req.file ? '/uploads/attachments/' + req.file.filename : (req.body.photo_url || null);
  const userIdNum = user_id && String(user_id).trim() !== '' ? parseInt(user_id, 10) : null;
  await db.prepare('INSERT INTO past_leaders (name, role, term_start, term_end, photo_url, bio, sort_order, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(name, role, term_start || null, term_end || null, photo_url, bio || null, parseInt(sort_order) || 0, userIdNum);
  res.redirect('/admin/past-leaders?saved=1');
});
router.get('/past-leaders/:id/edit', requireAdmin, async (req, res) => {
  const item = await db.prepare('SELECT * FROM past_leaders WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/past-leaders?saved=1');
  const allUsers = await fetchAllUsers();
  res.render('admin/past-leaders/form', { item, error: null, allUsers, currentPath: '/admin/past-leaders' });
});
router.put('/past-leaders/:id', requireAdmin, withUpload(attachmentUpload), async (req, res) => {
  const { name, role, term_start, term_end, bio, sort_order, user_id } = req.body;
  const photo_url = req.file ? '/uploads/attachments/' + req.file.filename : (req.body.photo_url || null);
  const userIdNum = user_id && String(user_id).trim() !== '' ? parseInt(user_id, 10) : null;
  await db.prepare('UPDATE past_leaders SET name=?, role=?, term_start=?, term_end=?, photo_url=?, bio=?, sort_order=?, user_id=? WHERE id=?').run(name, role, term_start || null, term_end || null, photo_url, bio || null, parseInt(sort_order) || 0, userIdNum, req.params.id);
  res.redirect('/admin/past-leaders?saved=1');
});
router.delete('/past-leaders/:id', requireAdmin, async (req, res) => {
  await db.prepare('DELETE FROM past_leaders WHERE id = ?').run(req.params.id);
  res.redirect('/admin/past-leaders?saved=1');
});

module.exports = router;
