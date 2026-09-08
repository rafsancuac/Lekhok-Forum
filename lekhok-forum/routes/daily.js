const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

async function getDailyFor(type, date = today()) {
  return await db.prepare("SELECT * FROM daily_content WHERE content_type = ? AND scheduled_date = ? AND published = 1 ORDER BY created_at DESC LIMIT 1").get(type, date);
}

async function getDailyAll(type, limit = 20) {
  return await db.prepare("SELECT * FROM daily_content WHERE content_type = ? AND published = 1 ORDER BY scheduled_date DESC, created_at DESC LIMIT ?").all(type, limit);
}

// ── Quiz ─────────────────────────────────────────────────────────────────────
router.get('/quiz', async (req, res) => {
  const today = await getDailyFor('quiz');
  const archive = await getDailyAll('quiz', 30);
  res.render('user/quiz', { today, archive, currentPath: '/quiz' });
});

// ── On This Day ──────────────────────────────────────────────────────────────
router.get('/on-this-day', async (req, res) => {
  const today = await getDailyFor('this_day');
  const archive = await getDailyAll('this_day', 30);
  res.render('user/on-this-day', { today, archive, currentPath: '/on-this-day' });
});

// ── E-Paper ──────────────────────────────────────────────────────────────────
router.get('/epaper', async (req, res) => {
  const today = await getDailyFor('epaper');
  const archive = await getDailyAll('epaper', 30);
  res.render('user/epaper', { today, archive, currentPath: '/epaper' });
});

// ── Activities ───────────────────────────────────────────────────────────────
router.get('/activities', async (req, res) => {
  const items = await getDailyAll('activity', 50);
  res.render('user/activities', { items, currentPath: '/activities' });
});

// ── Best Writer (featured posts) ────────────────────────────────────────────
router.get('/best-writer', async (req, res) => {
  const featured = await db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender, u.designation
                              FROM posts p JOIN users u ON p.author_id = u.id
                              WHERE p.featured = 1 AND p.status = 'published'
                              ORDER BY p.published_at DESC`).all();
  res.render('user/best-writer', { featured, currentPath: '/best-writer' });
});

// ── Achievements ─────────────────────────────────────────────────────────────
router.get('/achievements', async (req, res) => {
  const items = await db.prepare('SELECT * FROM achievements ORDER BY year DESC, sort_order').all();
  res.render('user/achievements', { items, currentPath: '/achievements' });
});

// ── Constitution ─────────────────────────────────────────────────────────────
router.get('/constitution', async (req, res) => {
  const sections = await db.prepare('SELECT * FROM constitution ORDER BY sort_order, id').all();
  res.render('user/constitution', { sections, currentPath: '/constitution' });
});

// ── Past Leaders ─────────────────────────────────────────────────────────────
router.get('/committee/past', async (req, res) => {
  const presidents = await db.prepare(`
    SELECT p.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
           u.full_name AS user_full_name, u.designation AS user_designation
    FROM past_leaders p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.role = 'president' ORDER BY p.term_start DESC
  `).all();
  const secretaries = await db.prepare(`
    SELECT p.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
           u.full_name AS user_full_name, u.designation AS user_designation
    FROM past_leaders p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.role = 'general_secretary' ORDER BY p.term_start DESC
  `).all();
  res.render('user/past-leaders', { presidents, secretaries, currentPath: '/committee/past' });
});

// ── Advisory Board ───────────────────────────────────────────────────────────
// পাবলিক উপদেষ্টা পরিষদ পেজ — কার্যবর্ষ ফিল্টার (কমিটি পেজের হুবহু সার্ভার-সাইড
// ?year= লজিক)। একই ব্যক্তি একাধিক বছরে থাকলেও এখানে প্রতিটি বছর আলাদা সারি।
router.get('/committee/advisory', async (req, res) => {
  const bnTerm = (s) => parseInt(String(s || '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)), 10) || 0;
  // প্রতি বছরের উপদেষ্টা সংখ্যা (শুধু advisory)
  const yearRows = await db.prepare(
    "SELECT term_year, COUNT(*) AS c FROM members WHERE member_type = 'advisory' AND term_year IS NOT NULL GROUP BY term_year"
  ).all();
  const countByYear = {};
  yearRows.forEach(r => { countByYear[r.term_year] = r.c; });

  const CANONICAL_YEARS = ['২০২৪-২৫', '২০২৩-২৪', '২০২২-২৩', '২০২১-২২', '২০২০-২১'];
  const years = [...new Set([...Object.keys(countByYear), ...CANONICAL_YEARS.filter(y => countByYear[y])])]
    .sort((a, b) => bnTerm(b) - bnTerm(a));

  // Default: সর্বশেষ (সর্বোচ্চ) যে বছরে উপদেষ্টা আছে
  const latestWithData = Object.keys(countByYear).sort((a, b) => bnTerm(b) - bnTerm(a))[0];
  const selectedYear = req.query.year && years.includes(req.query.year)
    ? req.query.year
    : (latestWithData || years[0] || null);

  const advisory = selectedYear
    ? await db.prepare(`
        SELECT m.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
               u.full_name AS user_full_name, u.designation AS user_designation
        FROM members m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.member_type = 'advisory' AND m.term_year = ? ORDER BY m.sort_order
      `).all(selectedYear)
    : [];

  res.render('lekhok-advisory', {
    layout: 'layout',
    pageTitle: 'উপদেষ্টা পরিষদ',
    currentPath: '/committee/advisory',
    advisory,
    years,
    countByYear,
    selectedYear
  });
});

// ── Birthdays ────────────────────────────────────────────────────────────────
router.get('/birthdays', async (req, res) => {
  const todayDate = new Date();
  const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
  const dd = String(todayDate.getDate()).padStart(2, '0');
  const todayList = await db.prepare(`SELECT id, username, full_name, avatar_url, gender, birth_date FROM users
                                WHERE show_birth = 1 AND status = 'active'
                                AND substr(birth_date, 6, 5) = ?`).all(`${mm}-${dd}`);
  // Upcoming this week
  const upcoming = await db.prepare(`SELECT id, username, full_name, avatar_url, gender, birth_date FROM users
                               WHERE show_birth = 1 AND status = 'active'
                               AND substr(birth_date, 6, 5) != ?
                               ORDER BY substr(birth_date, 6, 5) ASC LIMIT 20`).all(`${mm}-${dd}`);
  res.render('user/birthdays', { todayList, upcoming, currentPath: '/birthdays' });
});

// ── Notifications page ──────────────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const items = await db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.session.user.id);
  await db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.session.user.id);
  res.render('user/notifications', { items, currentPath: '/notifications' });
});

module.exports = router;
