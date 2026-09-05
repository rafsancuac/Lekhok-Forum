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
  // Leadership: 2 current (president + GS) + 2 founders + 4 advisors
  // সর্বশেষ কার্যবর্ষের (সর্বোচ্চ term_year) সভাপতি ও সাধারণ সম্পাদক দেখাই
  const homeTermYears = (await db.prepare(
    "SELECT DISTINCT term_year FROM members WHERE member_type = 'central' AND term_year IS NOT NULL"
  ).all()).map(r => r.term_year).sort((a, b) => bnLead(b) - bnLead(a));
  const latestTerm = homeTermYears[0] || null;
  const currentLeaders = latestTerm
    ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order LIMIT 2").all(latestTerm)
    : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' ORDER BY m.sort_order LIMIT 2").all();
  const founders = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder' ORDER BY m.sort_order LIMIT 2").all();
  // Founding advisors (earliest term_year or sort_order)
  const foundingAdvisors = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year ASC, m.sort_order ASC LIMIT 2").all();
  const advisors = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.sort_order LIMIT 4").all();
  // Fallback: if no founders seeded, use earliest past leaders (first president + first GS)
  let foundersFinal = founders;
  if (!founders.length) {
    const pastPres = await db.prepare("SELECT * FROM past_leaders WHERE role='president' ORDER BY term_start ASC LIMIT 1").all();
    const pastGS = await db.prepare("SELECT * FROM past_leaders WHERE role='general_secretary' ORDER BY term_start ASC LIMIT 1").all();
    foundersFinal = [...pastPres, ...pastGS];
  }

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

  // Recent Q&A for home page folding section
  const recentQA = await db.prepare("SELECT p.id, p.title, p.body, p.created_at, u.full_name as author_name, u.username as author_username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.type = 'question' AND p.status = 'published' ORDER BY p.created_at DESC LIMIT 5").all();
  // Fetch top answer for each question
  for (const q of recentQA) {
    try {
      q.topAnswer = await db.prepare("SELECT c.body, u.full_name as author_name FROM comments c JOIN users u ON c.author_id = u.id WHERE c.post_id = ? ORDER BY c.like_count DESC, c.created_at ASC LIMIT 1").get(q.id);
    } catch(e) { q.topAnswer = null; }
  }

  res.render('lekhok-home', {
    layout: 'layout',
    pageTitle: 'হোম',
    currentPath: '/',
    recentNotices,
    currentLeaders,
    founders: foundersFinal,
    foundingAdvisors,
    advisors,
    recentQA,
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
// Bengali-digit term sorting helper: '২০২৪-২৫' → 2024
const bnLead = (s) => parseInt(String(s || '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)), 10) || 0;

router.get('/committee', async (req, res) => {
  // Term counts per year (central committee only)
  const yearRows = await db.prepare(
    "SELECT term_year, COUNT(*) AS c FROM members WHERE member_type = 'central' AND term_year IS NOT NULL GROUP BY term_year"
  ).all();
  const countByYear = {};
  yearRows.forEach(r => { countByYear[r.term_year] = r.c; });

  // Official history ২০২০-২১ → ২৪-২৫ (১৯-২০ কার্যবর্ষ ছিল না) + admin-added terms.
  // Chips শুধু সেই বর্ষগুলোই, যেগুলোতে আসলে কমিটি আছে।
  const CANONICAL_YEARS = ['২০২৪-২৫', '২০২৩-২৪', '২০২২-২৩', '২০২১-২২', '২০২০-২১'];
  const years = [...new Set([...Object.keys(countByYear), ...CANONICAL_YEARS.filter(y => countByYear[y])])]
    .sort((a, b) => bnLead(b) - bnLead(a));
  // প্রতিটি কার্যবর্ষের অফিসিয়াল গঠন/পুনর্গঠন তারিখ (প্রেস বিজ্ঞপ্তি অনুযায়ী)
  const TERM_NOTES = {
    '২০২৪-২৫': 'গঠিত ২৩ জানুয়ারি ২০২৫',
    '২০২৩-২৪': 'গঠিত ৩ সেপ্টেম্বর ২০২৩',
    '২০২২-২৩': 'গঠিত ১৭ আগস্ট ২০২২',
    '২০২১-২২': 'গঠিত ১২ আগস্ট ২০২১ • পুনর্গঠিত ২০ মার্চ ২০২২',
    '২০২০-২১': 'গঠিত ১ মার্চ ২০২১'
  };

  // Default: the LATEST term that actually has a committee.
  const latestWithData = Object.keys(countByYear).sort((a, b) => bnLead(b) - bnLead(a))[0];
  const selectedYear = req.query.year && years.includes(req.query.year)
    ? req.query.year
    : (latestWithData || years[0] || null);
  const termNote = selectedYear ? (TERM_NOTES[selectedYear] || null) : null;

  const central = selectedYear
    ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order").all(selectedYear)
    : [];
  // উপদেষ্টা পরিষদ এখন আলাদা পাবলিক পেজে: /committee/advisory
  res.render('lekhok-committee', {
    layout: 'layout',
    pageTitle: 'কার্যনির্বাহী কমিটি',
    currentPath: '/committee',
    central,
    years,
    countByYear,
    selectedYear,
    termNote
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

// ── Email list page ──────────────────────────────────────────────────────────
router.get('/resources/emails', async (req, res) => {
  res.render('lekhok-emails', {
    layout: 'layout',
    pageTitle: 'পত্রিকার ইমেইল তালিকা',
    currentPath: '/resources/emails'
  });
});

// ── Team ─────────────────────────────────────────────────────────────────────
router.get('/team', async (req, res) => {
  // টিম পেজে সর্বশেষ কার্যবর্ষের কমিটি দেখাই (পুরো ইতিহাস /committee-তে)
  const teamTermYears = (await db.prepare(
    "SELECT DISTINCT term_year FROM members WHERE member_type = 'central' AND term_year IS NOT NULL"
  ).all()).map(r => r.term_year).sort((a, b) => bnLead(b) - bnLead(a));
  const centralTerm = teamTermYears[0] || null;
  const central  = centralTerm
    ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order").all(centralTerm)
    : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' ORDER BY m.sort_order").all();
  const advisory = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.sort_order").all();
  const founders = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder'  ORDER BY m.sort_order").all();
  const branch   = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'branch'   ORDER BY m.sort_order").all();
  res.render('lekhok-team', {
    layout: 'layout',
    pageTitle: 'টিম',
    currentPath: '/team',
    central, advisory, founders, branch, centralTerm
  });
});

// ── Single notice page (so notice cards from home/notices page link works) ──
router.get('/notices/:id(\\d+)', async (req, res) => {
  const notice = await db.prepare('SELECT * FROM notices WHERE id = ?').get(parseInt(req.params.id, 10));
  if (!notice) {
    return res.status(404).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
  }
  const _n = String(notice.content || '').replace(/\s+/g, ' ').trim();
  const metaDesc = _n ? (_n.length > 197 ? _n.slice(0, 197) + '…' : _n) : null;
  res.render('lekhok-notice-detail', {
    layout: 'layout',
    pageTitle: notice.title || 'বিজ্ঞপ্তি',
    currentPath: '/notices',
    canonicalPath: `/notices/${notice.id}`,
    notice,
    metaDesc,
    ogType: 'article',
    authorName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম'
  });
});

// ── Newsletter unsubscribe (link in every notification email) ────────────────
// Asks for the email via a tiny form on the same URL (privacy-safe: a mailed
// link alone cannot silently unsubscribe someone else's address).
router.get('/newsletter/unsubscribe', async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  let done = false, notFound = false;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    const r = await db.prepare('UPDATE newsletter_subscribers SET is_active = 0, unsubscribed_at = datetime(\'now\') WHERE email = ? AND is_active = 1').run(email);
    const changes = (r && (r.changes != null ? r.changes : r.rowsAffected)) || 0;
    if (changes > 0) done = true;
    else notFound = true;
  }
  const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>সাবস্ক্রিপশন বাতিল</title></head>
<body style="margin:0;font-family:'Noto Sans Bengali','Hind Siliguri',Arial,sans-serif;background:#f4f6f8;">
<div style="max-width:480px;margin:60px auto;background:#fff;border-radius:12px;padding:36px 30px;text-align:center;box-shadow:0 4px 18px rgba(0,0,0,.06);">
  <div style="font-size:34px;">${done ? '✅' : '📬'}</div>
  <h1 style="font-size:20px;color:#1a2233;margin:10px 0 8px;">${done ? 'সাবস্ক্রিপশন বাতিল হয়েছে' : 'সাবস্ক্রিপশন বাতিল করুন'}</h1>
  ${done
    ? `<p style="color:#6b7280;font-size:14px;line-height:1.8;">আপনার ইমেইল (${email}) নোটিফিকেশন তালিকা থেকে সরিয়ে নেওয়া হয়েছে।<br/>ভবিষ্যতে আবার যুক্ত হতে চাইলে ওয়েবসাইটের ফুটার থেকে সাবস্ক্রাইব করতে পারেন।</p>`
    : notFound
      ? `<p style="color:#6b7280;font-size:14px;line-height:1.8;">এই ইমেইলটি আমাদের সাবস্ক্রাইবার তালিকায় পাওয়া যায়নি অথবা আগেই বাতিল হয়েছে।</p>`
      : `<p style="color:#6b7280;font-size:14px;line-height:1.8;">নোটিফিকেশন বন্ধ করতে আপনার সাবস্ক্রাইব করা ইমেইল ঠিকানা লিখুন।</p>
         <form method="get" action="/newsletter/unsubscribe" style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
           <input type="email" name="email" required placeholder="আপনার ইমেইল" style="flex:1;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
           <button type="submit" style="padding:10px 18px;background:#059669;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">বাতিল করুন</button>
         </form>`}
  <p style="margin-top:22px;"><a href="/" style="color:#059669;font-size:13.5px;text-decoration:none;">← মূল সাইটে ফিরে যান</a></p>
</div>
</body></html>`;
  res.status(done ? 200 : (notFound ? 404 : 200)).send(html);
});

module.exports = router;

