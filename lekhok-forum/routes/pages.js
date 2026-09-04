const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Home ─────────────────────────────────────────────────────────────────────
// Member query with LEFT JOIN so any member linked to a user account inherits
// the user's avatar, full name, and profile link.  Used everywhere members are
// rendered on the public site.
const MEMBER_JOIN = `
  SELECT m.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
         u.full_name AS user_full_name, u.designation AS user_designation
  FROM members m
  LEFT JOIN users u ON u.id = m.user_id
`;

router.get('/', async (req, res) => {
  const recentNotices = await db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 3').all();
  const centralMembers = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' ORDER BY m.sort_order LIMIT 4").all();

  // Today's daily content — split by content_type for the home page cards
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const todayRows = await db.prepare(
    "SELECT * FROM daily_content WHERE scheduled_date = ? AND published = 1 ORDER BY id"
  ).all(today);
  const todayByType = {
    quiz:        todayRows.find(r => r.content_type === 'quiz')        || null,
    this_day:    todayRows.find(r => r.content_type === 'this_day')    || null,
    activity:    todayRows.find(r => r.content_type === 'activity')    || null,
    epaper:      todayRows.find(r => r.content_type === 'epaper')      || null,
    best_writer: todayRows.find(r => r.content_type === 'best_writer') || null
  };
  const hasToday = Object.values(todayByType).some(v => v);

  res.render('lekhok-home', {
    layout: 'layout',
    pageTitle: 'হোম',
    currentPath: '/',
    recentNotices,
    centralMembers,
    todayByType,
    hasToday
  });
});

// ── About ────────────────────────────────────────────────────────────────────
router.get('/about', async (req, res) => {
  res.render('lekhok-about', {
    layout: 'layout',
    pageTitle: 'পরিচিতি',
    currentPath: '/about'
  });
});

// ── Committee ────────────────────────────────────────────────────────────────
router.get('/committee', async (req, res) => {
  // Year filter — term_year column added via ensure-year-column.js
  const yearRows = await db.prepare("SELECT DISTINCT term_year FROM members WHERE term_year IS NOT NULL ORDER BY term_year DESC").all();
  const years = yearRows.map(r => r.term_year).filter(Boolean);
  const selectedYear = req.query.year && years.includes(req.query.year) ? req.query.year : (years[0] || '২০২৫-২০২৬');
  // LEFT JOIN users so members linked to a user account show that user's
  // avatar/username (and become clickable to their profile).
  const central = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order").all(selectedYear);
  res.render('lekhok-committee', {
    layout: 'layout',
    pageTitle: 'সংগঠন',
    currentPath: '/committee',
    central,
    years,
    selectedYear
  });
});

// ── Notices ──────────────────────────────────────────────────────────────────
router.get('/notices', async (req, res) => {
  const category = req.query.category || 'all';
  let notices;
  if (category === 'all') {
    notices = await db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  } else {
    notices = await db.prepare('SELECT * FROM notices WHERE category = ? ORDER BY id DESC').all(category);
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
router.get('/contact', async (req, res) => {
  res.render('lekhok-contact', {
    layout: 'layout',
    pageTitle: 'যোগাযোগ',
    currentPath: '/contact',
    success: req.query.success || null
  });
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = await db.prepare('SELECT * FROM events WHERE date >= ? ORDER BY date ASC').all(today);
  const past     = await db.prepare('SELECT * FROM events WHERE date <  ? ORDER BY date DESC').all(today);
  res.render('lekhok-events', {
    layout: 'layout',
    pageTitle: 'ইভেন্ট',
    currentPath: '/events',
    upcoming,
    past
  });
});

// ── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req, res) => {
  const all = await db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  const getSetting = (k) => {
    try { return (db.prepare('SELECT value FROM settings WHERE key = ?').get(k) || {}).value; } catch(e) { return null; }
  };
  // Group by category to render as albums
  const albums = {};
  const categoryLabels = {
    general: 'সাধারণ',
    event: 'ইভেন্ট',
    events: 'ইভেন্ট',
    seminar: 'সেমিনার',
    seminars: 'সেমিনার',
    workshop: 'কর্মশালা',
    workshops: 'কর্মশালা',
    cultural: 'সাংস্কৃতিক',
    sports: 'ক্রীড়া',
    achievement: 'অর্জন',
    achievements: 'অর্জন',
    awards: 'পুরস্কার',
    award: 'পুরস্কার',
    meeting: 'সভা',
    meetings: 'সভা',
    press: 'প্রেস ও মিডিয়া',
    media: 'প্রেস ও মিডিয়া',
    others: 'অন্যান্য'
  };
  for (const g of all) {
    const cat = g.category || 'general';
    if (!albums[cat]) albums[cat] = [];
    albums[cat].push(g);
  }
  res.render('lekhok-gallery', {
    layout: 'layout',
    pageTitle: 'গ্যালারি',
    currentPath: '/gallery',
    items: all,
    albums,
    categoryLabels,
    getSetting
  });
});

// ── Resources ────────────────────────────────────────────────────────────────
router.get('/resources', async (req, res) => {
  const category = req.query.category || 'all';
  let resources;
  if (category === 'all') {
    resources = await db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  } else {
    resources = await db.prepare('SELECT * FROM resources WHERE category = ? ORDER BY id DESC').all(category);
  }
  const categories = await db.prepare('SELECT DISTINCT category FROM resources').all();
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
router.get('/team', async (req, res) => {
  const central  = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central'  ORDER BY m.sort_order").all();
  const advisory = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.sort_order").all();
  const founders = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder'  ORDER BY m.sort_order").all();
  const branch   = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'branch'   ORDER BY m.sort_order").all();
  res.render('lekhok-team', {
    layout: 'layout',
    pageTitle: 'টিম',
    currentPath: '/team',
    central, advisory, founders, branch
  });
});

// ── Single notice page (so notice cards from home/notices page link works) ──
router.get('/notices/:id(\\d+)', async (req, res) => {
  const notice = await db.prepare('SELECT * FROM notices WHERE id = ?').get(parseInt(req.params.id, 10));
  if (!notice) {
    return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  }
  res.render('lekhok-notice-detail', {
    layout: 'layout',
    pageTitle: notice.title || 'বিজ্ঞপ্তি',
    currentPath: '/notices',
    notice
  });
});

module.exports = router;

