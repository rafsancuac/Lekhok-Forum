const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Home ─────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const recentNotices = db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 3').all();
  const centralMembers = db.prepare("SELECT * FROM members WHERE member_type = 'central' ORDER BY sort_order LIMIT 4").all();
  res.render('lekhok-home', {
    layout: 'layout',
    pageTitle: 'হোম',
    currentPath: '/',
    recentNotices,
    centralMembers
  });
});

// ── About ────────────────────────────────────────────────────────────────────
router.get('/about', (req, res) => {
  res.render('lekhok-about', {
    layout: 'layout',
    pageTitle: 'পরিচিতি',
    currentPath: '/about'
  });
});

// ── Committee ────────────────────────────────────────────────────────────────
router.get('/committee', (req, res) => {
  const central = db.prepare("SELECT * FROM members WHERE member_type = 'central' ORDER BY sort_order").all();
  const branch  = db.prepare("SELECT * FROM members WHERE member_type = 'branch'  ORDER BY sort_order").all();
  res.render('lekhok-committee', {
    layout: 'layout',
    pageTitle: 'সংগঠন',
    currentPath: '/committee',
    central,
    branch
  });
});

// ── Notices ──────────────────────────────────────────────────────────────────
router.get('/notices', (req, res) => {
  const category = req.query.category || 'all';
  let notices;
  if (category === 'all') {
    notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  } else {
    notices = db.prepare('SELECT * FROM notices WHERE category = ? ORDER BY id DESC').all(category);
  }
  res.render('lekhok-notices', {
    layout: 'layout',
    pageTitle: 'বিজ্ঞপ্তি',
    currentPath: '/notices',
    notices,
    activeCategory: category
  });
});

// ── Contact ──────────────────────────────────────────────────────────────────
router.get('/contact', (req, res) => {
  res.render('lekhok-contact', {
    layout: 'layout',
    pageTitle: 'যোগাযোগ',
    currentPath: '/contact',
    success: req.query.success || null
  });
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = db.prepare('SELECT * FROM events WHERE date >= ? ORDER BY date ASC').all(today);
  const past     = db.prepare('SELECT * FROM events WHERE date <  ? ORDER BY date DESC').all(today);
  res.render('lekhok-events', {
    layout: 'layout',
    pageTitle: 'ইভেন্ট',
    currentPath: '/events',
    upcoming,
    past
  });
});

// ── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.render('lekhok-gallery', {
    layout: 'layout',
    pageTitle: 'গ্যালারি',
    currentPath: '/gallery',
    items
  });
});

// ── Resources ────────────────────────────────────────────────────────────────
router.get('/resources', (req, res) => {
  const category = req.query.category || 'all';
  let resources;
  if (category === 'all') {
    resources = db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  } else {
    resources = db.prepare('SELECT * FROM resources WHERE category = ? ORDER BY id DESC').all(category);
  }
  const categories = db.prepare('SELECT DISTINCT category FROM resources').all();
  res.render('lekhok-resources', {
    layout: 'layout',
    pageTitle: 'রিসোর্স',
    currentPath: '/resources',
    resources,
    categories,
    activeCategory: category
  });
});

// ── Team ─────────────────────────────────────────────────────────────────────
router.get('/team', (req, res) => {
  const central = db.prepare("SELECT * FROM members WHERE member_type = 'central' ORDER BY sort_order").all();
  const branch  = db.prepare("SELECT * FROM members WHERE member_type = 'branch'  ORDER BY sort_order").all();
  res.render('lekhok-team', {
    layout: 'layout',
    pageTitle: 'টিম',
    currentPath: '/team',
    central,
    branch
  });
});

module.exports = router;

