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

// টাস্ক ১৩ (পর্ব ৪, অংশ ক): প্রতিটি daily আইটেমে post_images যোগ (ক্রম অনুযায়ী)
async function attachImages(items) {
  const list = Array.isArray(items) ? items : (items ? [items] : []);
  for (const it of list) {
    if (it) {
      it.images = (await db.getPostImages('daily', it.id)).map(i => i.image_url);
      if (!it.images.length && it.image_url) it.images = [it.image_url];
    }
  }
  return items;
}

// ── Quiz ─────────────────────────────────────────────────────────────────────
// সেশন ৬০: ইন্টারঅ্যাক্টিভ কুইজ — options JSON পার্স করে ভিউতে পাঠানো হয়, কিন্তু
// `answer` কখনো ভিউতে যায় না (view-source চিটিং আটকাতে); যাচাই হয়
// POST /quiz/check-এ সার্ভার-সাইড।
function withQuizOptions(item) {
  if (!item) return item;
  const out = Object.assign({}, item);
  out.options = null;
  if (item.options) {
    try {
      const arr = JSON.parse(item.options);
      if (Array.isArray(arr) && arr.length >= 2) out.options = arr.map(String);
    } catch (e) { /* খারাপ JSON — স্ট্যাটিক ফলব্যাক */ }
  }
  delete out.answer;
  return out;
}

// সেশন ৬২: কুইজ-স্কোর সার্ভার-পার্সিস্টেন্স হেল্পার —
// লগইন-ইউজারের চেষ্টাগুলো (quiz_id → {choice, correct}) + স্ট্যাট।
// UNIQUE(user_id, quiz_id) — প্রথম উত্তরই চূড়ান্ত; স্ট্রিক = সর্বশেষ ধারাবাহিক সঠিক।
function quizStreakFrom(rowsAsc) {
  let s = 0;
  for (let i = rowsAsc.length - 1; i >= 0; i--) {
    if (rowsAsc[i].correct) s++; else break;
  }
  return s;
}

async function myQuizState(userId) {
  const rows = await db.prepare(
    'SELECT quiz_id, choice, correct, answered_at FROM quiz_attempts WHERE user_id = ? ORDER BY answered_at ASC'
  ).all(userId);
  const map = {};
  rows.forEach(r => { map[r.quiz_id] = { choice: r.choice, correct: !!r.correct, ts: r.answered_at }; });
  const answered = rows.length;
  const correctN = rows.filter(r => r.correct).length;
  return { map, answered, correct: correctN, streak: quizStreakFrom(rows) };
}

// লিডারবোর্ড — সর্বাধিক সঠিক-উত্তরদাতা টপ ১০ (৫+ উত্তর দেওয়া যাদের)।
async function quizLeaderboard(limit = 10) {
  const rows = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, u.gender,
           COUNT(*) AS answered, SUM(a.correct) AS correct_n
    FROM quiz_attempts a JOIN users u ON u.id = a.user_id
    WHERE u.status = 'active'
    GROUP BY u.id ORDER BY correct_n DESC, answered ASC LIMIT ?
  `).all(limit);
  // প্রতি ইউজারের স্ট্রিক আলাদা কোয়েরি-তে (গ্রুপ-বাই করা সারি-ক্রম পাওয়া যায় না)
  for (const r of rows) {
    try {
      const mine = await db.prepare(
        'SELECT correct FROM quiz_attempts WHERE user_id = ? ORDER BY answered_at ASC'
      ).all(r.id);
      r.streak = quizStreakFrom(mine);
    } catch (e) { r.streak = 0; }
  }
  return rows;
}

router.get('/quiz', async (req, res) => {
  const today = await getDailyFor('quiz');
  const archive = await getDailyAll('quiz', 30);
  await attachImages([today, ...archive]);
  const todayId = today ? today.id : null;

  // সেশন ৬২: লগইন-ইউজারের সার্ভার-স্কোর + লিডারবোর্ড
  let mine = null;
  if (req.session.user) {
    try { mine = await myQuizState(req.session.user.id); } catch (e) { mine = null; }
  }
  let board = null;
  try { board = await quizLeaderboard(10); } catch (e) { board = null; }

  res.render('user/quiz', {
    today: withQuizOptions(today),
    archive: (archive || []).filter(a => a && a.id !== todayId).map(withQuizOptions),
    mine, board,
    currentPath: '/quiz'
  });
});

// সেশন ৬০: কুইজ-উত্তর সার্ভার-সাইড যাচাই (JSON POST — স্টেটলেস রিড-চেক,
// CSRF-মিডলওয়্যার urlencoded/multipart গার্ড করে বলে JSON পাথ উপযুক্ত)।
// `answer` ভিউতে পাঠানো হয় না (view-source চিটিং আটকাতে) — যাচাই এখানেই।
router.post('/quiz/check', async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    const choice = parseInt(req.body && req.body.choice, 10);
    if (!Number.isInteger(id) || !Number.isInteger(choice)) {
      return res.json({ ok: false, error: 'bad_request' });
    }
    const row = await db.prepare("SELECT id, options, answer, body FROM daily_content WHERE id = ? AND content_type = 'quiz' AND published = 1").get(id);
    if (!row || !row.options) return res.json({ ok: false, error: 'not_found' });
    let options;
    try { options = JSON.parse(row.options); } catch (e) { return res.json({ ok: false, error: 'not_found' }); }
    if (!Array.isArray(options) || choice < 0 || choice >= options.length) {
      return res.json({ ok: false, error: 'bad_choice' });
    }
    const hasAnswer = row.answer !== null && row.answer !== undefined;
    const correct = hasAnswer && choice === row.answer;

    // সেশন ৬২: লগইন-ইউজারের উত্তর DB-তে রেকর্ড — প্রথম উত্তরই চূড়ান্ত
    // (INSERT OR IGNORE → UNIQUE(user_id, quiz_id) দ্বিতীয় রেকর্ড বাতিল)।
    // `recorded` = এই রেসপন্সে নতুন রেকর্ড হয়েছে কি না; `final` = ইউজারের
    // আগের (চূড়ান্ত) উত্তর — ক্লায়েন্ট লোকাল-স্টোরেজ মার্জ করতে ব্যবহার করে।
    let recorded = false, final = null;
    if (req.session.user && hasAnswer) {
      try {
        const r = await db.prepare(
          'INSERT OR IGNORE INTO quiz_attempts (user_id, quiz_id, choice, correct) VALUES (?, ?, ?, ?)'
        ).run(req.session.user.id, id, choice, correct ? 1 : 0);
        recorded = !!(r.changes || r.rowsAffected);
        const prev = await db.prepare(
          'SELECT choice, correct FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?'
        ).get(req.session.user.id, id);
        if (prev) final = { choice: prev.choice, correct: !!prev.correct };
      } catch (e) { /* রেকর্ড-ব্যর্থ হলেও উত্তর-যাচাই দেওয়া হবে */ }
    }

    return res.json({
      ok: true,
      correct: !!correct,
      answer: hasAnswer ? row.answer : null,
      correctText: hasAnswer ? String(options[row.answer] || '') : '',
      body: row.body || '',
      recorded: recorded,
      final: final
    });
  } catch (e) {
    console.error('[quiz] /quiz/check error:', e.message);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// ── On This Day ──────────────────────────────────────────────────────────────
router.get('/on-this-day', async (req, res) => {
  const today = await getDailyFor('this_day');
  const archive = await getDailyAll('this_day', 30);
  await attachImages([today, ...archive]);
  res.render('user/on-this-day', { today, archive, currentPath: '/on-this-day' });
});

// ── E-Paper ──────────────────────────────────────────────────────────────────
router.get('/epaper', async (req, res) => {
  const today = await getDailyFor('epaper');
  const archive = await getDailyAll('epaper', 30);
  await attachImages([today, ...archive]);
  res.render('user/epaper', { today, archive, currentPath: '/epaper' });
});

// ── Activities ───────────────────────────────────────────────────────────────
router.get('/activities', async (req, res) => {
  const items = await getDailyAll('activity', 50);
  await attachImages(items);
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
