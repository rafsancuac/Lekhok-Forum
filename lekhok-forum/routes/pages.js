const express = require('express');
const router = express.Router();
const db = require('../db');
// হোম নেতৃত্ব সেকশনের ৮ পাতার বক্তব্য (৫০-১০০ শব্দ) — স্লট-ভিত্তিক,
// members.bio ফাঁকা হলে ভিউ এটি ব্যবহার করে (সেশন ২৯)
const leaderStatements = require('../data/leaderStatements');
const bnDate131 = require('../helpers/bn-date'); // সেশন ১৩১: সাইট-ওয়াইড তারিখ-চুক্তি
// সেশন ১১০: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ (একক-উৎস — moderator.js-এর COVERS110-এরই মিরর)
const COVERS110 = require('../helpers/covers');

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
  // সেশন ৭২ (GSC ইনডেক্সিং-ফিক্স — ক্রল-স্পিড): আগে ~১২টি সিরিয়াল await ছিল;
  // Turso-তে প্রতিটি await = ১টি নেটওয়ার্ক রাউন্ড-ট্রিপ → ওয়ার্ম TTFB-ই ৩-৭ সেকেন্ড,
  // যা Googlebot-এর ক্রল-রেট কমিয়ে দিত (GSC: "Discovered – currently not indexed")।
  // এখন স্বাধীন কুয়েরিগুলো এক প্যারালাল ব্যাচে ছোড়া হয়।
  const [recentNotices, homeTermYearRows, founders, foundingAdvisors, currentAdvisors, advisors, todayRows, recentArticles, faqItems42] = await Promise.all([
    db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 3').all(),
    db.prepare("SELECT DISTINCT term_year FROM members WHERE member_type = 'central' AND term_year IS NOT NULL").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder' ORDER BY m.sort_order LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year ASC, m.sort_order ASC LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year DESC, m.sort_order DESC LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.sort_order LIMIT 4").all(),
    db.prepare("SELECT * FROM daily_content WHERE scheduled_date = ? AND published = 1 ORDER BY id").all(new Date().toISOString().slice(0, 10)),
    // সেশন ৯০ (হোম-কিউরেশন): 'লেখকদের কালি / সাম্প্রতিক লেখা' এখন পুরোপুরি
    // মডারেটর/এডমিন-নির্বাচিত (home_featured, সর্বোচ্চ ৬)। কঠোর-ফিল্টার:
    // • post_kind='writing' — অ্যাভাটার/কভার-আপডেট + প্রশ্নের মতো সোশ্যাল-
    //   অ্যাক্টিভিটি কখনোই ঢুকতে পারবে না
    // • shared_from IS NULL (সেশন ৯৪) — শেয়ার-কপি কঠোরভাবে বাদ; কেবল
    //   মূল লেখকের অরিজিনাল পোস্টই এই সারিতে আসবে
    // • archive-নির্বাচনের ক্রম featured_at DESC (সদ্য-নির্বাচিত আগে)
    // নির্বাচন না থাকলে ফলব্যাক-কুয়েরি নিচে (homeCurated=false সহ)।
    db.prepare(`SELECT p.id, p.title, p.excerpt, p.home_cover, u.full_name AS author_name, u.username AS author_username
                  FROM posts p JOIN users u ON p.author_id = u.id
                 WHERE p.type = 'article' AND p.status = 'published'
                   AND p.post_kind = 'writing' AND p.home_featured = 1
                   AND p.shared_from IS NULL
                 ORDER BY p.home_featured_at DESC, p.published_at DESC LIMIT 6`).all(),
    db.getSectionItems('home_faq'),
  ]);
  // সেশন ৯০: ফলব্যাক — এডমিন/মডারেটর এখনো কিছু বাছাই না করলে সেকশন ফাঁকা
  // না রেখে সর্বশেষ ৬টি খাঁটি writing (avatar/cover/প্রশ্ন কঠোরভাবে বাদ)
  // দেখানো হয়; homeCurated-ব্যাজ ভিউতে 'সম্পাদক-নির্বাচিত' বনাম 'সর্বশেষ'
  // পার্থক্য দেখায়। সেশন ৯৪: শেয়ার-কপিও কঠোরভাবে বাদ (shared_from IS NULL)।
  let homeCurated = recentArticles.length > 0;
  if (!recentArticles.length) {
    recentArticles.push(...await db.prepare(`SELECT p.id, p.title, p.excerpt, p.home_cover, u.full_name AS author_name, u.username AS author_username
                  FROM posts p JOIN users u ON p.author_id = u.id
                 WHERE p.type = 'article' AND p.status = 'published'
                   AND p.post_kind = 'writing' AND p.archive_visible = 1
                   AND p.shared_from IS NULL
                 ORDER BY p.published_at DESC LIMIT 6`).all());
  }
  // সেশন ১১০: প্রতি-রো শৈল্পিক প্রচ্ছদ পার্স (posts.home_cover JSON →
  // {type:'preset'|'typo', grad, initial} | {type:'custom', url}; করাপ্ট/অনুপস্থিত → null)
  recentArticles.forEach(a => {
    const c110 = COVERS110.parseCover(a.home_cover);
    a.cover = c110 ? { type: c110.type, grad: c110.grad || '', url: c110.url || '', initial: c110.type === 'typo' ? COVERS110.initialOf(a.title) : '' } : null;
  });

  // Leadership: 2 current (president + GS) + 2 founders + 4 advisors
  // সর্বশেষ কার্যবর্ষের (সর্বোচ্চ term_year) সভাপতি ও সাধারণ সম্পাদক দেখাই
  const homeTermYears = homeTermYearRows.map(r => r.term_year).sort((a, b) => bnLead(b) - bnLead(a));
  const latestTerm = homeTermYears[0] || null;
  // বর্তমান নেতৃত্ব = সর্বশেষ কার্যবর্ষের সভাপতি + সাধারণ সম্পাদক (সহ-সভাপতি নয় —
  // সেশন ২৯: ব্যবহারকারীর স্পেক অনুযায়ী ২য় পাতা হবে সাধারণ সম্পাদক)।
  // যেন সব কার্যবর্ষে এই দুই পদ না-ও থাকতে পারে, তাই ফলব্যাক রাখা হলো
  // পুরনো sort_order-ভিত্তিক স্লাইসে।
  let currentLeaders = latestTerm
    ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? AND m.role IN ('সভাপতি','সাধারণ সম্পাদক') ORDER BY CASE m.role WHEN 'সভাপতি' THEN 0 ELSE 1 END, m.sort_order LIMIT 2").all(latestTerm)
    : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.role IN ('সভাপতি','সাধারণ সম্পাদক') ORDER BY m.sort_order LIMIT 2").all();
  if (!currentLeaders || currentLeaders.length < 2) {
    currentLeaders = latestTerm
      ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order LIMIT 2").all(latestTerm)
      : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' ORDER BY m.sort_order LIMIT 2").all();
  }
  // Fallback: if no founders seeded, use earliest past leaders (first president + first GS)
  let foundersFinal = founders;
  if (!founders.length) {
    const [pastPres, pastGS] = await Promise.all([
      db.prepare("SELECT * FROM past_leaders WHERE role='president' ORDER BY term_start ASC LIMIT 1").all(),
      db.prepare("SELECT * FROM past_leaders WHERE role='general_secretary' ORDER BY term_start ASC LIMIT 1").all(),
    ]);
    foundersFinal = [...pastPres, ...pastGS];
  }

  // Today's daily content — split by content_type for the home page cards
  const todayByType = {
    quiz:        todayRows.find(r => r.content_type === 'quiz')        || null,
    this_day:    todayRows.find(r => r.content_type === 'this_day')    || null,
    activity:    todayRows.find(r => r.content_type === 'activity')    || null,
    epaper:      todayRows.find(r => r.content_type === 'epaper')      || null,
    best_writer: todayRows.find(r => r.content_type === 'best_writer') || null
  };
  // সেশন ৭২: প্রতি-রো ইমেজ-অ্যাটাচ সিরিয়াল লুপ → প্যারালাল
  await Promise.all(todayRows.map(async r => {
    r.images = (await db.getPostImages('daily', r.id)).map(i => i.image_url);
    if (!r.images.length && r.image_url) r.images = [r.image_url];
  }));
  const hasToday = Object.values(todayByType).some(v => v);

  // ── সেশন ৭৯: হোমপেজ কুইজ-চ্যালেঞ্জ (ইন্টারঅ্যাক্টিভ প্রমো-ব্যান্ড) ──
  // ডেটা: আজকের কুইজের অপশন (answer ভিউতে কখনো যাবে না — যাচাই শুধু
  // POST /quiz/check-এ), লগইন-ইউজারের আজকের চূড়ান্ত উত্তর + সামগ্রিক
  // স্ট্যাট/স্ট্রিক, টপ-৩ লিডার, আজকের অংশগ্রহণকারী-সংখ্যা।
  let quizChallenge = null;
  const quizToday = todayByType.quiz;
  if (quizToday) {
    try {
      let qcOptions = null;
      try {
        const arr = JSON.parse(quizToday.options || '[]');
        if (Array.isArray(arr) && arr.length >= 2 && arr.length <= 6) qcOptions = arr.map(String);
      } catch (e) { /* খারাপ JSON — ইন্টারঅ্যাক্টিভ কার্ড বাদ, স্ট্যাটিক থাকবে */ }
      const hasAnswer = quizToday.answer !== null && quizToday.answer !== undefined;
      if (qcOptions && hasAnswer) {
        const uid = req.session.user ? req.session.user.id : null;
        const [myRow, myRowsAsc, qcLeaders, qcParts] = await Promise.all([
          uid
            ? db.prepare('SELECT choice, correct FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?').get(uid, quizToday.id)
            : Promise.resolve(null),
          uid
            ? db.prepare('SELECT correct FROM quiz_attempts WHERE user_id = ? ORDER BY answered_at ASC').all(uid)
            : Promise.resolve([]),
          db.prepare(`SELECT u.id, u.username, u.full_name, u.avatar_url,
                SUM(a.correct) AS correct_n, COUNT(*) AS answered
              FROM quiz_attempts a JOIN users u ON u.id = a.user_id
              WHERE u.status = 'active'
              GROUP BY u.id ORDER BY correct_n DESC, answered ASC LIMIT 3`).all(),
          db.prepare('SELECT COUNT(*) AS n FROM quiz_attempts WHERE quiz_id = ?').get(quizToday.id)
        ]);
        let qcStreak = 0;
        for (let i = myRowsAsc.length - 1; i >= 0; i--) {
          if (myRowsAsc[i].correct) qcStreak++; else break;
        }
        quizChallenge = {
          id: quizToday.id,
          title: quizToday.title,
          body: quizToday.body || '',
          options: qcOptions,
          myAttempt: myRow ? { choice: myRow.choice, correct: !!myRow.correct } : null,
          myStats: uid ? { answered: myRowsAsc.length, correct: myRowsAsc.filter(r => r.correct).length, streak: qcStreak } : null,
          leaders: qcLeaders || [],
          participants: (qcParts && qcParts.n) || 0
        };
      }
    } catch (e) { /* কুইজ-চ্যালেঞ্জ ডেটা-ব্যর্থ → সেকশন লুকানো থাকবে */ }
  }

  res.render('lekhok-home', { faqItems42,
    layout: 'layout',
    pageTitle: 'হোম',
    currentPath: '/',
    recentNotices,
    currentLeaders,
    leaderStatements,
    founders: foundersFinal,
    foundingAdvisors,
    currentAdvisors,
    advisors,
    recentArticles,
    homeCurated,
    todayByType,
    hasToday,
    quizChallenge
  });
});

// ── About ────────────────────────────────────────────────────────────────────
router.get('/about', async (req, res) => {
  // পত্রিকায় আমাদের নিউজ — পরিচিতি পেজে সর্বোচ্চ ৪টি, বাকিগুলো /press-এ
  let pressClippings = [];
  try {
    pressClippings = await db.prepare(
      'SELECT * FROM press_clippings WHERE is_active = 1 ORDER BY sort_order ASC, id DESC LIMIT 8'
    ).all();
  } catch (e) { pressClippings = []; }
  // সেশন ৭২: প্রেস-ক্লিপিং ইমেজ N+1 → প্যারালাল
  await Promise.all(pressClippings.map(async c => { c.images = (await db.getPostImages('news', c.id)).map(i => i.image_url); if (!c.images.length && c.image_url) c.images = [c.image_url]; }));
  // সদস্য হওয়ার শর্তাবলি ধাপ-কার্ড (সেশন ৫১: এখন DB-চালিত — Add/Edit/Delete/Reorder)
  const condSteps = await db.getSectionItems('conditions_steps');
  res.render('lekhok-about', {
    layout: 'layout',
    pageTitle: 'পরিচিতি',
    currentPath: '/about',
    pressClippings,
    condSteps
  });
});

// ── Press clippings — পত্রিকায় আমাদের নিউজ (সম্পূর্ণ তালিকা) ─────────────────
router.get('/press', async (req, res) => {
  let clippings = [];
  try {
    clippings = await db.prepare(
      'SELECT * FROM press_clippings WHERE is_active = 1 ORDER BY sort_order ASC, id DESC'
    ).all();
  } catch (e) { clippings = []; }
  await Promise.all(clippings.map(async c => { c.images = (await db.getPostImages('news', c.id)).map(i => i.image_url); if (!c.images.length && c.image_url) c.images = [c.image_url]; }));
  res.render('lekhok-press', {
    layout: 'layout',
    pageTitle: 'পত্রিকায় আমাদের নিউজ',
    currentPath: '/press',
    clippings
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
    '২০২৪-২৫': 'গঠিত ২৯ সেপ্টেম্বর ২০২৪',
    '২০২৩-২৪': 'গঠিত ৬ সেপ্টেম্বর ২০২৩',
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

// ── স্থায়ী পরিষদ (সেশন ৪০) — user-linked ফটো কার্ড ─────────────────────────
router.get('/committee/permanent', async (req, res) => {
  const rows = await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'permanent' ORDER BY m.sort_order, m.id").all();
  res.render('lekhok-permanent', {
    layout: 'layout',
    pageTitle: 'স্থায়ী পরিষদ',
    currentPath: '/committee/permanent',
    permanent: rows
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
  // সেশন ৭২: প্রতি-নোটিশ ইমেজ N+1 সিরিয়াল → প্যারালাল (GSC-তে /notices 'Discovered' ছিল —
  // ২০+ নোটিশ = ২০+ সিরিয়াল Turso রাউন্ড-ট্রিপ ক্রল-স্পিড কমাত)
  await Promise.all(notices.map(async n => { n.images = (await db.getPostImages('notice', n.id)).map(i => i.image_url); }));
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
  // সেশন ৭২: যোগাযোগ-পেজের ৪টি স্বাধীন কুয়েরি প্যারালাল
  // সেশন ১০২: halls42 (আবাসিক হল প্রভোস্ট) — DB খালি হলে sections-registry ডিফল্ট
  const [ch42, uni42, tr42, ts, halls42] = await Promise.all([
    db.getSectionItems('contact_channels'),
    db.getSectionItems('contact_university'),
    db.getSectionItems('contact_transport'),
    db.getTransportSchedule(),
    db.getSectionItems('contact_halls'),
  ]);
  res.render('lekhok-contact', { ch42, uni42, tr42, ts, halls42,
    layout: 'layout',
    pageTitle: 'যোগাযোগ',
    currentPath: '/contact',
    success: req.query.success || null,
    error: req.query.error || null
  });
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const [upcoming, past] = await Promise.all([
    db.prepare('SELECT * FROM events WHERE date >= ? ORDER BY date ASC').all(today),
    db.prepare('SELECT * FROM events WHERE date <  ? ORDER BY date DESC').all(today),
  ]);
  // টাস্ক ১৩ (পর্ব ৪, অংশ ক): প্রতিটি ইভেন্টে post_images যোগ (ক্রম অনুযায়ী)
  // সেশন ৭২: সিরিয়াল লুপ → প্যারালাল
  const _evImg = async (e) => { e.images = (await db.getPostImages('event', e.id)).map(i => i.image_url); if (!e.images.length && e.image_url) e.images = [e.image_url]; };
  await Promise.all([...upcoming, ...past].map(_evImg));
  res.render('lekhok-events', {
    layout: 'layout',
    pageTitle: 'ইভেন্ট',
    currentPath: '/events',
    upcoming,
    past
  });
});

// ── Gallery ──────────────────────────────────────────────────────────────────────
// সেশন ১০৪: চিত্রশালা পেজিনেশন — >১০০ ছবির প্রস্তুতি (session-103 সুপারিশ)।
// পেজ-১ = সর্বশেষ ২৪টি সার্ভার-রেন্ডার; বাকিগুলো /gallery/more (নিচে) থেকে
// ইনফিনিট-স্ক্রল/বাটনে append। অ্যালবাম/রিসেন্ট-স্ট্রিপ সম্পূর্ণ-ডেটা (ছোট-সেট)।
const GALLERY_PER_PAGE = 24;

// সেশন-৯৭-এর এনরিচমেন্ট (ক্যাটাগরি-লেবেল + বাংলা-প্রদর্শন-তারিখ) — /gallery ও
// /gallery/more উভয়ের শেয়ার্ড হেল্পার (১০৪ — ডুপ্লিকেট-লজিক এড়াতে টেনে আনা)
const GALLERY_LABELS = {
  general: 'সাধারণ', event: 'ইভেন্ট', events: 'ইভেন্ট', seminar: 'সেমিনার', seminars: 'সেমিনার',
  workshop: 'কর্মশালা', workshops: 'কর্মশালা', cultural: 'সাংস্কৃতিক', sports: 'ক্রীড়া',
  achievement: 'অর্জন', achievements: 'অর্জন', awards: 'পুরস্কার', award: 'পুরস্কার',
  meeting: 'সভা', meetings: 'সভা', press: 'প্রেস ও মিডিয়া', media: 'প্রেস ও মিডিয়া', others: 'অন্যান্য'
};
function enrichGalleryRows(rows) {
  // সেশন ৯৭: প্রদর্শন-তারিখ — event_date না থাকলে created_at-কে বাংলা-ফরম্যাটে ফলব্যাক
  // সেশন ১৩১: bnDate → helpers/bn-date (DB-নেম-লেস = UTC পার্স + Asia/Dhaka প্রদর্শন) —
  //   পুরনো new Date(d) হোস্ট-লোকাল পার্স করত (প্রোডাকশন-বাংলাদেশে ৬ঘ-ভুল + তারিখ-স্খলন)
  for (const g of rows) {
    g.catLabel = GALLERY_LABELS[g.category || 'general'] || g.category || 'সাধারণ';
    g.displayDate = (g.event_date && String(g.event_date).trim()) || bnDate131.bnDate(g.created_at);
  }
  return rows;
}

router.get('/gallery', async (req, res) => {
  const all = await db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  const getSetting = (k) => {
    try { return (db.prepare('SELECT value FROM settings WHERE key = ?').get(k) || {}).value; } catch(e) { return null; }
  };
  // Group by category to render as albums
  const albums = {};
  enrichGalleryRows(all);
  for (const g of all) {
    const cat = g.category || 'general';
    if (!albums[cat]) albums[cat] = [];
    albums[cat].push(g);
  }
  // সেশন ৭৬: সাম্প্রতিক সংযোজন-স্ট্রিপ (সর্বশেষ ১০টি ছবি, id DESC এমনই নতুন-প্রথম)
  const recent = all.slice(0, 10);
  // সেশন ১০৪: পেজিনেশন — পেজ-১ স্লাইস + মেটা (মেসনারি-ভিউয়ের কার্ড; অ্যালবাম সম্পূর্ণ)
  // ?all=1 → সম্পূর্ণ-রেন্ডার (JS-বিহীন ফলব্যাক + প্রিন্ট/SEO-বান্ধব)
  const showAll = req.query.all === '1';
  const items = showAll ? all : all.slice(0, GALLERY_PER_PAGE);
  const hasMoreItems = !showAll && all.length > GALLERY_PER_PAGE;
  // ── সেশন ১০৮: অ্যালবাম-প্রচ্ছদ কাস্টম-নির্বাচন ──
  // settings key 'galcover:<cat>' = gallery-রো-এর id (স্টাফ POST /admin/gallery/cover
  // থেকে সেট হয়)। ভ্যালিড-না-হলে (রো-মুছে-গেলে) নীরবে list[0]-ফলব্যাক।
  const coverByCat = {};
  const getCoverStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  for (const cat of Object.keys(albums)) {
    try {
      const row = getCoverStmt.get('galcover:' + cat);
      if (row && row.value) {
        const cid = parseInt(row.value, 10);
        if (albums[cat].some(g => g.id === cid)) coverByCat[cat] = cid;
      }
    } catch (e) { /* settings-টেবিল না-থাকলে ফলব্যাক-কভার */ }
  }
  res.render('lekhok-gallery', {
    layout: 'layout',
    pageTitle: 'গ্যালারি',
    currentPath: '/gallery',
    items,
    itemsTotal: all.length,
    itemsShown: items.length,
    hasMoreItems,
    perPage: GALLERY_PER_PAGE,
    albums,
    recent,
    categoryLabels: GALLERY_LABELS,
    coverByCat,
    getSetting
  });
});

// সেশন ১০৪: চিত্রশালা load-more — ?page=N (N≥২) → পরবর্তী ২৪-কার্ডের HTML ফ্র্যাগমেন্ট।
// পাবলিক (গ্যালারি পাবলিক); পেজ-সীমা গার্ড (≤৫০ পেজ = ১২০০ ছবি — রানওয়ে-সুরক্ষা)।
router.get('/gallery/more', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 0;
    if (page < 2 || page > 50) return res.json({ ok: true, html: '', hasMore: false, page, total: 0 });
    const all = await db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
    const start = (page - 1) * GALLERY_PER_PAGE;
    const slice = enrichGalleryRows(all.slice(start, start + GALLERY_PER_PAGE));
    // সেশন ১০৮: অ্যাপেন্ড-হওয়া কার্ডেও স্টাফ-প্রচ্ছদ-পিকার — adminUser-সেশন (session-83 পোর্টাল-বিভাজন)
    const au = req.session && req.session.adminUser;
    const isStaff = !!(au && /admin|moderator/i.test(au.role || ''));
    res.render('partials/gallery-cards', { items: slice, isStaff }, function (err, html) {
      if (err) return res.status(500).json({ ok: false, error: 'render' });
      const hasMore = start + GALLERY_PER_PAGE < all.length;
      res.json({ ok: true, html, hasMore, page, shown: start + slice.length, total: all.length });
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server' });
  }
});

// ── Resources ─────────────────────────────────────────────────────────────
// সেশন ১০১: ক্লিকেবল মাল্টিমিডিয়া-কার্ড — res_type নরমালাইজ + স্টাফ-গেট (অ্যাডমিন/
// মডারেটর এই পেজ থেকেই আপলোড-প্যানেলে যাবে) + হিউম্যান-বাংলা-কাউন্টার।
router.get('/resources', async (req, res) => {
  const RT = require('../helpers/resource-types');
  const category = req.query.category || 'all';
  let resources;
  if (category === 'all') {
    resources = await db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  } else {
    resources = await db.prepare('SELECT * FROM resources WHERE category = ? ORDER BY id DESC').all(category);
  }
  // ভিউ-রেন্ডারে ধরণ-নরমালাইজড রো দরকার (res_type ফাঁক হলে legacy file_type থেকে)
  resources = resources.map(r => Object.assign({}, r, { res_type: RT.normalizeResType(r) }));
  // সেশন ১০৫: ইউনিফাইড শেয়ারেবল-ফিল্টার — ?type=&q=&sort= এখন URL-স্টেট; সার্ভার
  // হোয়াইটলিস্ট-ভ্যালিডেট করে ভিউতে বসায় (JS প্রথম-পেইন্টেই ফিল্টার-স্টেট হাইড্রেট করে,
  // ক্লায়েন্টে বদলালে history.replaceState-এ URL সিঙ্ক হয় — লিংক শেয়ার-সমীহ)।
  const RSX_TYPE_RE = /^(all|pdf|audio|video|image|doc|link)$/;
  const RSX_SORT_RE = /^(new|popular|title)$/;
  const initialType = RSX_TYPE_RE.test(String(req.query.type || '')) ? String(req.query.type) : 'all';
  const initialSort = RSX_SORT_RE.test(String(req.query.sort || '')) ? String(req.query.sort) : 'new';
  const initialQ = String(req.query.q || '').slice(0, 120);
  // সেশন ১০৭: সিরিজ-ফিল্টার (?series=) — সার্ভার-সাইড (ক্যাটাগরির মতোই); নাম ≤৮০
  // ক্যারেক্টার হোয়াইটলিস্ট; শূন্য/অনুপস্থিত = সব। শেয়ারেবল-URL-স্টেট।
  const initialSeries = String(req.query.series || '').trim().slice(0, 80);
  if (initialSeries) {
    resources = resources.filter(r => (r.series || '').trim() === initialSeries);
  }
  const categories = await db.prepare('SELECT DISTINCT category FROM resources').all();
  // সেশন ১০৭: সিরিজ-তালিকা + প্রতি-সিরিজে রিসোর্স-সংখ্যা (চিপ-রো-তে ব্যবহৃত)
  // সেশন ১১৬: প্রতি-সিরিজে কভার-থাম্ব — পর্ব-ক্রম-অনুসারে প্রথম থাম্বনেইল-যুক্ত
  // পর্বের thumbnail_url (চিপে ২৮px মিনি-প্রিভিউ; থাম্বনেইল-শূন্য সিরিজে icon-ফলব্যাক)
  const seriesList = (await db.prepare(
    `SELECT s.series, s.n,
            (SELECT r2.thumbnail_url FROM resources r2
              WHERE TRIM(COALESCE(r2.series,'')) = s.series AND TRIM(COALESCE(r2.thumbnail_url,'')) != ''
              ORDER BY COALESCE(r2.series_order, 1000000), r2.id LIMIT 1) AS cover
       FROM (SELECT TRIM(series) AS series, COUNT(*) AS n FROM resources
              WHERE series IS NOT NULL AND TRIM(series) != '' GROUP BY TRIM(series)) s
      ORDER BY s.series COLLATE NOCASE`
  ).all()).map(x => ({ series: String(x.series).trim(), n: x.n, cover: x.cover || null }));
  // সেশন ১২১: সিরিজ প্রগ্রেস-ম্যাপ — {সিরিজ: [resId,…]} পর্ব-ক্রমে (detail-পেজের
  // localStorage done-সেটের সাথে মিলিয়ে লিস্টিংয়ে চিপে n/m ব্যাজ + কার্ডে শোনা-হয়েছে-টিক;
  // অবস্থা ক্লায়েন্টেই থাকে — সার্ভার শুধু id-ম্যাপ দেয়, প্রাইভেসি-নিরপেক্ষ)
  const seriesMap = {};
  (await db.prepare(
    `SELECT TRIM(series) AS series, id FROM resources
      WHERE series IS NOT NULL AND TRIM(series) != ''
      ORDER BY COALESCE(series_order, 1000000), id`
  ).all()).forEach(x => {
    const k = String(x.series).trim();
    (seriesMap[k] = seriesMap[k] || []).push(x.id);
  });
  const u = req.session && req.session.user;
  const isStaff = !!(u && (u.role === 'admin' || u.role === 'moderator' || u.role === 'superadmin'));
  /* সেশন ১৩৪: সিরিজ-হিরো — সক্রিয় ?series= হলে হিরো-ব্যানারের মেটা (কভার/পর্ব-সংখ্যা/
     অডিও-সংখ্যা/মোট-পাঠ+ডাউনলোড)। seriesList-এর কভার-সাবকোয়েরি পুনঃব্যবহার + এক-aggregate। */
  let activeSeriesMeta = null;
  if (initialSeries) {
    const sm134 = seriesList.find(s => s.series === initialSeries);
    if (sm134) {
      const agg = await db.prepare(
        `SELECT SUM(CASE WHEN res_type='audio' THEN 1 ELSE 0 END) AS audioN,
                SUM(COALESCE(views,0)) AS views, SUM(COALESCE(downloads,0)) AS dls
           FROM resources WHERE TRIM(COALESCE(series,'')) = ?`
      ).get(initialSeries);
      activeSeriesMeta = {
        series: sm134.series, n: sm134.n, cover: sm134.cover,
        audioN: (agg && agg.audioN) || 0,
        views: (agg && agg.views) || 0,
        downloads: (agg && agg.dls) || 0
      };
    }
  }
  res.render('lekhok-resources', {
    layout: 'layout',
    pageTitle: 'রিসোর্স',
    currentPath: '/resources',
    resources,
    categories,
    activeCategory: category,
    isStaff,
    RES_TYPE_META: RT,
    videoEmbedUrl: RT.videoEmbedUrl,
    initialType, initialSort, initialQ,
    initialSeries, seriesList, seriesMap, activeSeriesMeta
  });
});

// ── Resource detail (সেশন ১০৫) ────────────────────────────────────────────
// ?r=<id> ডিপ-লিংকের পূর্ণ-পেজ রূপ: /resources/<id> — প্রিভিউ-হিরো + পূর্ণ-বিবরণ +
// সম্পর্কিত-রিসোর্স। হোয়াইটলিস্ট: শুধু সংখ্যা-id (emails-রুট আগেই ম্যাচ হয়, কনফ্লিক্ট-শূন্য)।
router.get('/resources/:id(\\d+)', async (req, res) => {
  const RT = require('../helpers/resource-types');
  const id = parseInt(req.params.id, 10);
  const row = id ? await db.prepare('SELECT * FROM resources WHERE id = ?').get(id) : null;
  if (!row) {
    return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  }
  const r = Object.assign({}, row, { res_type: RT.normalizeResType(row) });
  // সম্পর্কিত: এক-ক্যাটাগরি আগে (জনপ্রিয়তা-অর্ডার), কম পড়লে এক-টাইপ দিয়ে পূরণ
  let related = await db.prepare(
    'SELECT * FROM resources WHERE COALESCE(category, \'\') = ? AND id != ? ORDER BY COALESCE(views,0) DESC, id DESC LIMIT 6'
  ).all(String(r.category || ''), id);
  if (related.length < 4) {
    const extra = await db.prepare(
      'SELECT * FROM resources WHERE res_type = ? AND COALESCE(category,\'\') != ? AND id != ? ORDER BY id DESC LIMIT ?'
    ).all(r.res_type, String(r.category || ''), id, 6 - related.length);
    related = related.concat(extra);
  }
  related = related.map(x => Object.assign({}, x, { res_type: RT.normalizeResType(x) }));
  // সেশন ১০৭: সিরিজ-নেভিগেটর — এই রিসোর্সের সিরিজ-থাকলে পর্ব-তালিকা (order→id ক্রমে),
  // আগের/পরের পর্ব + অবস্থান (পর্ব N/মোট M)। সিরিজ-শূন্য হলে পুরো ব্লক রেন্ডার-ই হয় না।
  let seriesItems = null, seriesPrev = null, seriesNext = null, seriesPos = 0, seriesAudioCount = 0;
  const seriesName = String(r.series || '').trim();
  if (seriesName) {
    seriesItems = (await db.prepare(
      "SELECT id, title, res_type, series_order, thumbnail_url, link_url, file_url FROM resources WHERE TRIM(COALESCE(series,'')) = ? ORDER BY COALESCE(series_order, 1000000), id"
    ).all(seriesName)).map(x => {
      const t = RT.normalizeResType(x);
      // সেশন ১১৭: প্লেলিস্ট — অডিও-পর্বের ইন-পেজ-প্লেব্যাক-সোর্স (hero-audio/মিনি-প্লেয়ার শেয়ার্ড)
      const audioSrc = (t === 'audio' && (x.file_url || x.link_url)) ? (x.file_url || x.link_url) : null;
      return Object.assign({}, x, { res_type: t, audioSrc });
    });
    seriesAudioCount = seriesItems.filter(x => x.audioSrc).length;
    const pos = seriesItems.findIndex(x => x.id === r.id);
    seriesPos = pos + 1;
    if (pos > 0) seriesPrev = seriesItems[pos - 1];
    if (pos > -1 && pos < seriesItems.length - 1) seriesNext = seriesItems[pos + 1];
  }
  const descHtml = require('../helpers/markdown-lite').renderBody(r.content || r.description || '', { toc: false });
  const u = req.session && req.session.user;
  const isStaff = !!(u && (u.role === 'admin' || u.role === 'moderator' || u.role === 'superadmin'));
  res.render('lekhok-resource-detail', {
    layout: 'layout',
    pageTitle: r.title || 'রিসোর্স',
    currentPath: '/resources',
    r, related, descHtml, isStaff,
    bnDate: bnDate131.bnDate, /* সেশন ১৩১: ভিউতে require-নেই — হেল্পার-লোকাল হিসেবে পাস */
    staffRole: isStaff ? u.role : null,
    staffName: isStaff ? (u.username || '') : '',
    seriesName, seriesItems, seriesPrev, seriesNext, seriesPos, seriesAudioCount,
    RES_TYPE_META: RT,
    videoEmbedUrl: RT.videoEmbedUrl
  });
});

// ── Email list page ──────────────────────────────────────────────────────────
router.get('/resources/emails', async (req, res) => {
  res.render('lekhok-emails', {
    layout: 'layout',
    pageTitle: 'পত্রিকার ইমেইল',
    currentPath: '/resources/emails',
    paperEmails: require('../helpers/paper-emails')
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
    return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  }
  notice.images = (await db.getPostImages('notice', notice.id)).map(i => i.image_url);
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
    authorName: 'লেখক ফোরাম'
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


// ── Global search results page (/search?q=) — session33 (§১২ gap) ───────────
// Header dropdown-এ Enter / "সব ফলাফল" লিংক এখানে আসে। আগে কোনো ফুল-পেজ সার্চ
// ছিল না — শুধু ছোট API ড্রপডাউন ছিল।
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const results = { articles: [], questions: [], users: [], notices: [], dailies: [] };
  let total = 0;
  if (q.length >= 2) {
    const like = '%' + q + '%';
    try {
      results.articles = await db.prepare(`
        SELECT p.id, p.title, p.excerpt, p.category, p.like_count, p.comment_count,
               p.body, /* session120: পড়ার-সময় গণনার জন্য */
               u.full_name AS author_name
        FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.type = 'article' AND p.status = 'published'
          AND p.post_kind = 'writing'  /* সেশন ৯০: অটো-পোস্ট বাদ */
          AND p.shared_from IS NULL    /* সেশন ৯৪: শেয়ার-কপি বাদ — কেবল অরিজিনাল */
          AND (p.title LIKE ? OR p.body LIKE ?)
        ORDER BY p.published_at DESC LIMIT 20
      `).all(like, like);
      /* session120: ফলাফল-কার্ডে ≈N মিনিট চিপ — decorateFeed-এর ৯৫০-অক্ষর/মিনিট
         কনভেনশনের হুবহু প্রতিরূপ (dashboard.js:298); গণনার পরে body ফেলে দেওয়া হয় */
      results.articles.forEach(a => {
        const plain = String(a.body || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/[#*_>`~\[\]()!]/g, '')
          .replace(/\s+/g, ' ').trim();
        a.read_mins = Math.max(1, Math.round(plain.length / 950) || 1);
        delete a.body;
      });
      results.questions = await db.prepare(`
        SELECT p.id, p.title, p.body AS excerpt, u.full_name AS author_name
        FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.type = 'question' AND p.status = 'published'
          AND (p.title LIKE ? OR p.body LIKE ?)
        ORDER BY p.created_at DESC LIMIT 15
      `).all(like, like);
      results.users = await db.prepare(`
        SELECT id, username, full_name, avatar_url, designation
        FROM users WHERE status = 'active'
          AND (username LIKE ? OR full_name LIKE ? OR IFNULL(bio, '') LIKE ?)
        ORDER BY full_name LIMIT 15
      `).all(like, like, like);
      results.notices = await db.prepare(`
        SELECT id, title, content, date FROM notices
        WHERE title LIKE ? OR IFNULL(content, '') LIKE ?
        ORDER BY id DESC LIMIT 10
      `).all(like, like);
      results.dailies = await db.prepare(`
        SELECT id, content_type, title, body FROM daily_content
        WHERE published = 1 AND (IFNULL(title, '') LIKE ? OR IFNULL(body, '') LIKE ?)
        ORDER BY id DESC LIMIT 10
      `).all(like, like);
    } catch (e) { /* খালি ফলাফল দেখানো হবে */ }
    total = Object.values(results).reduce((a, r) => a + r.length, 0);
  }
  res.render('lekhok-search', {
    layout: 'layout',
    pageTitle: q ? ('সার্চ: ' + q) : 'সার্চ',
    metaDesc: q ? `"${q}" — লেখক ফোরামে সার্চ ফলাফল` : 'লেখা, প্রশ্ন, সদস্য ও বিজ্ঞপ্তি খুঁজুন',
    currentPath: '/search',
    q,
    results,
    total
  });
});
