const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, getSetting, setSetting } = require('../db');

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUser) return next();
  return res.redirect('/admin/login');
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
router.get('/', requireAdmin, (req, res) => {
  const counts = {
    notices:   db.prepare('SELECT COUNT(*) as c FROM notices').get().c,
    events:    db.prepare('SELECT COUNT(*) as c FROM events').get().c,
    members:   db.prepare('SELECT COUNT(*) as c FROM members').get().c,
    gallery:   db.prepare('SELECT COUNT(*) as c FROM gallery').get().c,
    resources: db.prepare('SELECT COUNT(*) as c FROM resources').get().c,
    messages:  db.prepare('SELECT COUNT(*) as c FROM contact_submissions').get().c
  };
  res.render('admin/dashboard', { counts, currentPath: '/admin' });
});

// ── Notices CRUD ─────────────────────────────────────────────────────────────
router.get('/notices', requireAdmin, (req, res) => {
  const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  res.render('admin/notices/list', { notices, currentPath: '/admin/notices' });
});

router.get('/notices/new', requireAdmin, (req, res) => {
  res.render('admin/notices/form', { notice: null, error: null, currentPath: '/admin/notices' });
});

router.post('/notices', requireAdmin, (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.render('admin/notices/form', { notice: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/notices' });
  db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)').run(title, content || '', category || 'notice', date || '');
  res.redirect('/admin/notices');
});

router.get('/notices/:id/edit', requireAdmin, (req, res) => {
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
  if (!notice) return res.redirect('/admin/notices');
  res.render('admin/notices/form', { notice, error: null, currentPath: '/admin/notices' });
});

router.put('/notices/:id', requireAdmin, (req, res) => {
  const { title, content, category, date } = req.body;
  db.prepare('UPDATE notices SET title=?, content=?, category=?, date=? WHERE id=?').run(title, content || '', category || 'notice', date || '', req.params.id);
  res.redirect('/admin/notices');
});

router.delete('/notices/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.redirect('/admin/notices');
});

// ── Events CRUD ──────────────────────────────────────────────────────────────
router.get('/events', requireAdmin, (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  res.render('admin/events/list', { events, currentPath: '/admin/events' });
});

router.get('/events/new', requireAdmin, (req, res) => {
  res.render('admin/events/form', { event: null, error: null, currentPath: '/admin/events' });
});

router.post('/events', requireAdmin, (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  if (!title) return res.render('admin/events/form', { event: req.body, error: 'শিরোনাম আবশ্যক', currentPath: '/admin/events' });
  db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0);
  res.redirect('/admin/events');
});

router.get('/events/:id/edit', requireAdmin, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.redirect('/admin/events');
  res.render('admin/events/form', { event, error: null, currentPath: '/admin/events' });
});

router.put('/events/:id', requireAdmin, (req, res) => {
  const { title, description, date, end_date, location, image_url, featured } = req.body;
  db.prepare('UPDATE events SET title=?, description=?, date=?, end_date=?, location=?, image_url=?, featured=? WHERE id=?').run(title, description || '', date || '', end_date || '', location || '', image_url || '', featured ? 1 : 0, req.params.id);
  res.redirect('/admin/events');
});

router.delete('/events/:id', requireAdmin, (req, res) => {
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

// ── Gallery CRUD ─────────────────────────────────────────────────────────────
router.get('/gallery', requireAdmin, (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.render('admin/gallery/list', { items, currentPath: '/admin/gallery' });
});

router.get('/gallery/new', requireAdmin, (req, res) => {
  res.render('admin/gallery/form', { item: null, error: null, currentPath: '/admin/gallery' });
});

router.post('/gallery', requireAdmin, (req, res) => {
  const { title, image_url, caption, event_date } = req.body;
  if (!image_url) return res.render('admin/gallery/form', { item: req.body, error: 'ছবির URL আবশ্যক', currentPath: '/admin/gallery' });
  db.prepare('INSERT INTO gallery (title, image_url, caption, event_date) VALUES (?, ?, ?, ?)').run(title || '', image_url, caption || '', event_date || '');
  res.redirect('/admin/gallery');
});

router.get('/gallery/:id/edit', requireAdmin, (req, res) => {
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/gallery');
  res.render('admin/gallery/form', { item, error: null, currentPath: '/admin/gallery' });
});

router.put('/gallery/:id', requireAdmin, (req, res) => {
  const { title, image_url, caption, event_date } = req.body;
  db.prepare('UPDATE gallery SET title=?, image_url=?, caption=?, event_date=? WHERE id=?').run(title || '', image_url, caption || '', event_date || '', req.params.id);
  res.redirect('/admin/gallery');
});

router.delete('/gallery/:id', requireAdmin, (req, res) => {
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

module.exports = router;
