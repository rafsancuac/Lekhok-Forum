const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { broadcastToAll } = require('../helpers/notify');
const { galleryUpload, withUpload } = require('../middleware/upload');
const getSetting = db.getSetting;
const setSetting = db.setSetting;

// ── Auth middleware ──────────────────────────────────────────────────────────
// Admin  = admin_users session OR user session with role='admin'  → full access
// Staff  = admin + user session with role='moderator' (scope-limited)
const ADMIN_SCOPES = ['daily', 'notices', 'events', 'gallery', 'complaints'];

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
function hasScope(req, scope) {
  if (req.session && req.session.adminUser) return true;
  const u = req.session && req.session.user;
  if (!u) return false;
  if (u.role === 'admin') return true;
  if (u.role !== 'moderator') return false;
  return !!db.prepare('SELECT id FROM moderator_scopes WHERE user_id = ? AND scope = ?').get(u.id, scope);
}

function requireScope(scope) {
  return (req, res, next) => {
    if (!isStaff(req)) return res.redirect('/admin/login');
    if (!hasScope(req, scope)) {
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
router.get('/login', (req, res) => {
  if (req.session.adminUser) return res.redirect('/admin');
  res.render('admin/login', { error: null, layout: false, currentPath: '/admin/login' });
});

// ── Login (POST) ─────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('admin/login', { error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড', layout: false, currentPath: '/admin/login' });
  }
  req.session.adminUser = { id: user.id, username: user.username, display_name: user.display_name };
  res.redirect('/admin');
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/', requireStaff, (req, res) => {
  const counts = {
    notices:   db.prepare('SELECT COUNT(*) as c FROM notices').get().c,
    events:    db.prepare('SELECT COUNT(*) as c FROM events').get().c,
    members:   db.prepare('SELECT COUNT(*) as c FROM members').get().c,
    gallery:   db.prepare('SELECT COUNT(*) as c FROM gallery').get().c,
    resources: db.prepare('SELECT COUNT(*) as c FROM resources').get().c,
    messages:  db.prepare('SELECT COUNT(*) as c FROM contact_submissions').get().c,
    users:     db.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").get().c,
    posts:     db.prepare("SELECT COUNT(*) as c FROM posts WHERE status='published'").get().c,
    daily:     db.prepare('SELECT COUNT(*) as c FROM daily_content').get().c,
    complaints: db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status='new'").get().c
  };
  res.render('admin/dashboard', { counts, currentPath: '/admin' });
});

// ── Notices CRUD (scope: notices; create broadcasts to all users) ───────────
router.get('/notices', requireScope('notices'), (req, res) => {
  const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  res.render('admin/notices/list', { notices, currentPath: '/admin/notices' });
});

router.get('/notices/new', requireScope('notices'), (req, res) => {
  res.render('admin/notices/form', { notice: null, error: null, currentPath: '/admin/notices' });
});

router.post('/notices', requireScope('notices'), (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.render('admin/notices/form', { notice: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/notices' });
  db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)').run(title, content || '', category || 'notice', date || '');
  // Auto-notify all users about the new notice
  broadcastToAll('notice', 'নতুন বিজ্ঞপ্তি', title, '/notices', req.session.user ? req.session.user.id : 0);
  res.redirect('/admin/notices');
});

router.get('/notices/:id/edit', requireScope('notices'), (req, res) => {
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
  if (!notice) return res.redirect('/admin/notices');
  res.render('admin/notices/form', { notice, error: null, currentPath: '/admin/notices' });
});

router.put('/notices/:id', requireScope('notices'), (req, res) => {
  const { title, content, category, date } = req.body;
  db.prepare('UPDATE notices SET title=?, content=?, category=?, date=? WHERE id=?').run(title, content || '', category || 'notice', date || '', req.params.id);
  res.redirect('/admin/notices');
});

router.delete('/notices/:id', requireScope('notices'), (req, res) => {
  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.redirect('/admin/notices');
});

// ── Events CRUD (scope: events; create broadcasts to all users) ─────────────
router.get('/events', requireScope('events'), (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  res.render('admin/events/list', { events, currentPath: '/admin/events' });
});

router.get('/events/new', requireScope('events'), (req, res) => {
  res.render('admin/events/form', { event: null, error: null, currentPath: '/admin/events' });
});

router.post('/events', requireScope('events'), (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  if (!title) return res.render('admin/events/form', { event: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/events' });
  db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0);
  // Auto-notify all users about the new event
  broadcastToAll('event', 'নতুন ইভেন্ট', title, '/events', req.session.user ? req.session.user.id : 0);
  res.redirect('/admin/events');
});

router.get('/events/:id/edit', requireScope('events'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.redirect('/admin/events');
  res.render('admin/events/form', { event, error: null, currentPath: '/admin/events' });
});

router.put('/events/:id', requireScope('events'), (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  db.prepare('UPDATE events SET title=?, description=?, date=?, end_date=?, location=?, image_url=?, featured=? WHERE id=?').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0, req.params.id);
  res.redirect('/admin/events');
});

router.delete('/events/:id', requireScope('events'), (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.redirect('/admin/events');
});

// ── Members CRUD ─────────────────────────────────────────────────────────────
router.get('/members', requireAdmin, (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY sort_order').all();
  res.render('admin/members/list', { members, currentPath: '/admin/members' });
});

router.get('/members/new', requireAdmin, (req, res) => {
  res.render('admin/members/form', { member: null, error: null, currentPath: '/admin/members' });
});

router.post('/members', requireAdmin, (req, res) => {
  const { name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order } = req.body;
  if (!name) return res.render('admin/members/form', { member: req.body, error: 'নাম আবশ্যক', currentPath: '/admin/members' });
  db.prepare('INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, role || '', designation || '', bio || '', image_url || '', social_fb || '', social_email || '', member_type || 'central', parseInt(sort_order) || 0);
  res.redirect('/admin/members');
});

router.get('/members/:id/edit', requireAdmin, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.redirect('/admin/members');
  res.render('admin/members/form', { member, error: null, currentPath: '/admin/members' });
});

router.put('/members/:id', requireAdmin, (req, res) => {
  const { name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order } = req.body;
  db.prepare('UPDATE members SET name=?, role=?, designation=?, bio=?, image_url=?, social_fb=?, social_email=?, member_type=?, sort_order=? WHERE id=?').run(name, role || '', designation || '', bio || '', image_url || '', social_fb || '', social_email || '', member_type || 'central', parseInt(sort_order) || 0, req.params.id);
  res.redirect('/admin/members');
});

router.delete('/members/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.redirect('/admin/members');
});

// ── Gallery CRUD (scope: gallery; supports file upload or image URL) ────────
router.get('/gallery', requireScope('gallery'), (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.render('admin/gallery/list', { items, currentPath: '/admin/gallery' });
});

router.get('/gallery/new', requireScope('gallery'), (req, res) => {
  res.render('admin/gallery/form', { item: null, error: null, currentPath: '/admin/gallery' });
});

router.post('/gallery', requireScope('gallery'), withUpload(galleryUpload), (req, res) => {
  const { title, image_url, caption, category } = req.body;
  const img = req.file ? '/uploads/gallery/' + req.file.filename : image_url;
  if (!img) return res.render('admin/gallery/form', { item: req.body, error: 'ছবি আপলোড করুন বা URL দিন', currentPath: '/admin/gallery' });
  db.prepare('INSERT INTO gallery (title, image_url, caption, category) VALUES (?, ?, ?, ?)').run(title || '', img, caption || '', category || 'general');
  res.redirect('/admin/gallery');
});

router.get('/gallery/:id/edit', requireScope('gallery'), (req, res) => {
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/gallery');
  res.render('admin/gallery/form', { item, error: null, currentPath: '/admin/gallery' });
});

router.put('/gallery/:id', requireScope('gallery'), withUpload(galleryUpload), (req, res) => {
  const { title, image_url, caption, category } = req.body;
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  const img = req.file ? '/uploads/gallery/' + req.file.filename : (image_url || item.image_url);
  db.prepare('UPDATE gallery SET title=?, image_url=?, caption=?, category=? WHERE id=?').run(title || '', img, caption || '', category || 'general', req.params.id);
  res.redirect('/admin/gallery');
});

router.delete('/gallery/:id', requireScope('gallery'), (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.redirect('/admin/gallery');
});

// ── Resources CRUD ───────────────────────────────────────────────────────────
router.get('/resources', requireAdmin, (req, res) => {
  const resources = db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  res.render('admin/resources/list', { resources, currentPath: '/admin/resources' });
});

router.get('/resources/new', requireAdmin, (req, res) => {
  res.render('admin/resources/form', { resource: null, error: null, currentPath: '/admin/resources' });
});

router.post('/resources', requireAdmin, (req, res) => {
  const { title, content, category, author, tags } = req.body;
  if (!title) return res.render('admin/resources/form', { resource: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/resources' });
  db.prepare('INSERT INTO resources (title, content, category, author, tags) VALUES (?, ?, ?, ?, ?)').run(title, content || '', category || 'general', author || '', tags || '');
  res.redirect('/admin/resources');
});

router.get('/resources/:id/edit', requireAdmin, (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!resource) return res.redirect('/admin/resources');
  res.render('admin/resources/form', { resource, error: null, currentPath: '/admin/resources' });
});

router.put('/resources/:id', requireAdmin, (req, res) => {
  const { title, content, category, author, tags } = req.body;
  db.prepare('UPDATE resources SET title=?, content=?, category=?, author=?, tags=? WHERE id=?').run(title, content || '', category || 'general', author || '', tags || '', req.params.id);
  res.redirect('/admin/resources');
});

router.delete('/resources/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  res.redirect('/admin/resources');
});

// ── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', requireAdmin, (req, res) => {
  const keys = ['site_name','tagline','contact_email','contact_phone','contact_address','facebook_url','telegram_url','youtube_url'];
  const settings = {};
  keys.forEach(k => { settings[k] = getSetting(k) || ''; });
  res.render('admin/settings', { settings, success: null, currentPath: '/admin/settings' });
});

router.post('/settings', requireAdmin, (req, res) => {
  const keys = ['site_name','tagline','contact_email','contact_phone','contact_address','facebook_url','telegram_url','youtube_url'];
  keys.forEach(k => setSetting(k, req.body[k] || ''));
  const settings = {};
  keys.forEach(k => { settings[k] = getSetting(k) || ''; });
  res.render('admin/settings', { settings, success: 'সেটিংস সংরক্ষিত হয়েছে', currentPath: '/admin/settings' });
});

// ── Messages ─────────────────────────────────────────────────────────────────
router.get('/messages', requireAdmin, (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC').all();
  res.render('admin/messages', { messages, currentPath: '/admin/messages' });
});

// ── Moderators & permission scopes ────────────────────────────────────────────
router.get('/moderators', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM moderator_scopes ms WHERE ms.user_id = u.id) as scope_count,
      (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) as post_count
    FROM users u ORDER BY u.role DESC, u.full_name ASC
  `).all();
  const staff = users
    .filter(u => u.role === 'moderator' || u.role === 'admin')
    .map(u => ({
      ...u,
      scopes: db.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(u.id).map(r => r.scope)
    }));
  res.render('admin/moderators', { users, staff, ADMIN_SCOPES, currentPath: '/admin/moderators' });
});

router.post('/moderators/:userId/grant', requireAdmin, (req, res) => {
  let scopes = req.body.scopes || [];
  if (!Array.isArray(scopes)) scopes = [scopes];
  db.grantModerator(parseInt(req.params.userId), scopes, req.session.adminUser.id);
  res.redirect('/admin/moderators');
});

router.post('/moderators/:userId/revoke', requireAdmin, (req, res) => {
  db.revokeModerator(parseInt(req.params.userId));
  res.redirect('/admin/moderators');
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Daily Content (scope: daily) — quiz / this_day / epaper / activity ──────
// ══════════════════════════════════════════════════════════════════════════════
const DAILY_TYPES = {
  quiz:      { label: 'আজকের কুইজ',      link: '/quiz' },
  this_day:  { label: 'আজকের এই দিনে',   link: '/on-this-day' },
  epaper:    { label: 'আজকের ই-পেপার',   link: '/epaper' },
  activity:  { label: 'সাংগঠনিক কার্যক্রম', link: '/activities' },
  best_writer: { label: 'মাসিক সেরা লেখক', link: '/best-writer' }
};

function dailyTypeMeta(type) { return DAILY_TYPES[type] || { label: type, link: '/' }; }

router.get('/daily', requireScope('daily'), (req, res) => {
  const items = db.prepare('SELECT * FROM daily_content ORDER BY scheduled_date DESC, id DESC LIMIT 100').all();
  res.render('admin/daily/list', { items, DAILY_TYPES, currentPath: '/admin/daily' });
});

router.get('/daily/new', requireScope('daily'), (req, res) => {
  res.render('admin/daily/form', { item: null, error: null, DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
});

router.post('/daily', requireScope('daily'), (req, res) => {
  const { content_type, title, body, image_url, link_url, scheduled_date, published } = req.body;
  if (!DAILY_TYPES[content_type]) return res.render('admin/daily/form', { item: req.body, error: 'ধরন নির্বাচন করুন', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  if (!title) return res.render('admin/daily/form', { item: req.body, error: 'শিরোনাম আবশ্যক', DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
  const isPublished = published ? 1 : 0;
  db.prepare('INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, published, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(content_type, title, body || null, image_url || null, link_url || null, scheduled_date || new Date().toISOString().split('T')[0], isPublished, req.session.user ? req.session.user.id : null);
  // Auto-notify ALL users when a moderator/admin publishes daily content
  if (isPublished) {
    const meta = dailyTypeMeta(content_type);
    broadcastToAll('daily', meta.label + ' প্রকাশিত', title, meta.link, req.session.user ? req.session.user.id : 0);
  }
  res.redirect('/admin/daily');
});

router.get('/daily/:id/edit', requireScope('daily'), (req, res) => {
  const item = db.prepare('SELECT * FROM daily_content WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/daily');
  res.render('admin/daily/form', { item, error: null, DAILY_TYPES, today: new Date().toISOString().split('T')[0], currentPath: '/admin/daily' });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Complaints management (scope: complaints) — private, admin/moderators ───
// ══════════════════════════════════════════════════════════════════════════════
router.get('/complaints', requireScope('complaints'), (req, res) => {
  const status = req.query.status || '';
  let q = `SELECT c.*, u.full_name as submitter_name, u.username as submitter_username, u.avatar_url as submitter_avatar
           FROM complaints c LEFT JOIN users u ON c.submitted_by = u.id`;
  const params = [];
  if (status) { q += ' WHERE c.status = ?'; params.push(status); }
  q += ' ORDER BY c.created_at DESC';
  const complaints = db.prepare(q).all(...params);
  const newCount = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status='new'").get().c;
  res.render('admin/complaints', { complaints, status, newCount, currentPath: '/admin/complaints' });
});

router.put('/complaints/:id', requireScope('complaints'), (req, res) => {
  const { status, admin_notes } = req.body;
  const allowed = ['new', 'in_review', 'resolved', 'dismissed'];
  db.prepare("UPDATE complaints SET status=?, admin_notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(allowed.includes(status) ? status : 'new', admin_notes || null, req.params.id);
  res.redirect('/admin/complaints');
});

router.delete('/complaints/:id', requireScope('complaints'), (req, res) => {
  db.prepare('DELETE FROM complaints WHERE id = ?').run(req.params.id);
  res.redirect('/admin/complaints');
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Moderators & users management (admin only) ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
router.get('/moderators', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM moderator_scopes ms WHERE ms.user_id = u.id) as scope_count,
      (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) as post_count
    FROM users u ORDER BY u.role DESC, u.full_name ASC
  `).all();
  const staff = users
    .filter(u => u.role === 'moderator' || u.role === 'admin')
    .map(u => ({
      ...u,
      scopes: db.prepare('SELECT scope FROM moderator_scopes WHERE user_id = ?').all(u.id).map(r => r.scope)
    }));
  res.render('admin/moderators', { users, staff, ADMIN_SCOPES, currentPath: '/admin/moderators' });
});

// Change a user's role (user / moderator / admin / banned)
router.post('/users/:id/role', requireAdmin, (req, res) => {
  const { role, status } = req.body;
  const allowedRoles = ['user', 'moderator', 'admin'];
  const allowedStatus = ['active', 'pending', 'banned'];
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.redirect('/admin/moderators');
  if (role && allowedRoles.includes(role)) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    if (role === 'moderator' && !db.prepare('SELECT id FROM moderator_scopes WHERE user_id = ?').get(req.params.id)) {
      // New moderators get the common scopes by default
      ['daily', 'notices', 'events'].forEach(s =>
        db.prepare('INSERT INTO moderator_scopes (user_id, scope) VALUES (?, ?)').run(req.params.id, s));
    }
  }
  if (status && allowedStatus.includes(status)) {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  }
  res.redirect('/admin/moderators');
});

// Update a moderator's scopes
router.post('/users/:id/scopes', requireAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.redirect('/admin/moderators');
  db.prepare('DELETE FROM moderator_scopes WHERE user_id = ?').run(req.params.id);
  const scopes = Array.isArray(req.body.scopes) ? req.body.scopes : (req.body.scopes ? [req.body.scopes] : []);
  scopes.forEach(s => {
    if (ADMIN_SCOPES.includes(s)) {
      db.prepare('INSERT INTO moderator_scopes (user_id, scope, granted_by) VALUES (?, ?, ?)').run(req.params.id, s, req.session.user ? req.session.user.id : null);
    }
  });
  res.redirect('/admin/moderators');
});

module.exports = router;
