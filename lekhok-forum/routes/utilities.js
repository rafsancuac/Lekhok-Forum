'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   routes/utilities.js — সেবাসমূহ ও আর্কাইভ (সেশন ১৫৭, ইউজার-স্পেক)
   ───────────────────────────────────────────────────────────────────────────
   helpers/dir-launcher.js-এর UTIL_SECTIONS-এর ৮ আইটেমের বাস্তব-পেজ (404-শূন্য
   চুক্তি) — কদাচিৎ ব্যবহৃত সহায়ক ও প্রশাসনিক ফিচার:

     ভাষা ও সম্পাদনা সরঞ্জাম
       GET /tools/spell-checker    — প্রমিত বানান পরীক্ষক (ক্লায়েন্ট-সাইড, ৪৫+ নিয়ম)
       GET /tools/font-converter   — সংখ্যা/যতিচিহ্ন/উদ্ধৃতি রূপান্তর (ক্লায়েন্ট-সাইড)
     প্রশাসনিক ও সদস্য সনদ
       GET  /me/certificate        — ডিজিটাল সদস্য সনদ (DB-চালিত, প্রিন্ট-রেডি) [লগইন]
       GET  /support/dmca-report   — কপিরাইট/চৌর্যবৃত্তি অভিযোগ ফর্ম (লগইনে POST →
                                      complaints টেবিল — সেশন ৩৫-রীতি: ডুপ-গার্ড)
     সংগ্রহশালা ও গবেষণা
       GET /archive                — ঐতিহাসিক আর্কাইভ (posts-বছর-ভিত্তিক গ্রুপিং, DB)
       GET /peer-review            — ব্লাইন্ড পিয়ার-রিভিউ প্যানেল (সাম্প্রতিক পাণ্ডুলিপি, DB)
     প্রাতিষ্ঠানিক সংযোগ
       GET /sponsorship            — বিজ্ঞাপন ও স্পন্সরশিপ নীতিমালা (স্ট্যাটিক)
       GET /shortcuts              — কীবোর্ড শর্টকাটস + লাইভ কি-টেস্টার (স্ট্যাটিক)

   ভিউ: views/user/utilities/*.ejs + public/assets/css/utilities.css
   চুক্তি: রেজিস্ট্রি-নাম (dir-launcher.js) ও এই রুট-পাথ হুবহু মিলবে —
   ড্রিফট-অসম্ভব (notifGroups-রীতি)।
   ═══════════════════════════════════════════════════════════════════════════ */
const express = require('express');
const router = express.Router();
const db = require('../db');

/* ── লগইন-গার্ড (routes/dashboard.js-ensureAuth হুবহু-মিরর) ── */
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

/* ── শেয়ার্ড প্রো-হিরো ডেটা (প্রতিটি ভিউতে একই কাঠামো) ── */
const TOOL_META = {
  'spell-checker': {
    title: 'প্রমিত বানান পরীক্ষক ও অভিধান',
    desc: 'বাংলা একাডেমি প্রমিত বানান যাচাই ও সমার্থক শব্দভাণ্ডার',
    icon: 'fa-spell-check', tok: 'var(--lf-dlx-cyan)',
    crumbs: 'ভাষা ও সম্পাদনা সরঞ্জাম'
  },
  'font-converter': {
    title: 'ইউনিকোড ও ফন্ট কনভার্টার',
    desc: 'বিজয়-যুগের টেক্সট পরিষ্কার, সংখ্যা ও যতিচিহ্ন রূপান্তর টুল',
    icon: 'fa-arrow-right-arrow-left', tok: 'var(--lf-social-blue)',
    crumbs: 'ভাষা ও সম্পাদনা সরঞ্জাম'
  },
  'certificate': {
    title: 'সদস্যপদ সনদ ও আইডি কার্ড',
    desc: 'ডিজিটাল সদস্য সনদ ও প্রেস পাস প্রিন্ট/ডাউনলোড',
    icon: 'fa-id-card', tok: 'var(--lf-dlx-gold)',
    crumbs: 'প্রশাসনিক ও সদস্য সনদ'
  },
  'dmca-report': {
    title: 'পাণ্ডুলিপি কপিরাইট ও চৌর্যবৃত্তি রিপোর্ট',
    desc: 'লেখাচুরির বিরুদ্ধে আনুষ্ঠানিকভাবে অভিযোগ দাখিল',
    icon: 'fa-scale-balanced', tok: 'var(--lf-reaction-angry)',
    crumbs: 'প্রশাসনিক ও সদস্য সনদ'
  },
  'archive': {
    title: 'ঐতিহাসিক আর্কাইভ',
    desc: 'বিগত বছরের পুরোনো সংখ্যা, প্রকাশনা ও বিরল লেখা',
    icon: 'fa-box-archive', tok: 'var(--lf-dlx-amber)',
    crumbs: 'সংগ্রহশালা ও গবেষণা'
  },
  'peer-review': {
    title: 'ব্লাইন্ড পিয়ার-রিভিউ প্যানেল',
    desc: 'জ্যেষ্ঠ লেখকদের নিরপেক্ষ পাণ্ডুলিপি যাচাই ব্যবস্থা',
    icon: 'fa-user-secret', tok: 'var(--lf-dlx-violet)',
    crumbs: 'সংগ্রহশালা ও গবেষণা'
  },
  'sponsorship': {
    title: 'বিজ্ঞাপন ও স্পন্সরশিপ নীতিমালা',
    desc: 'ফোরামের সাহিত্য প্রকাশনায় বিজ্ঞাপন ও অর্থায়ন গাইড',
    icon: 'fa-briefcase', tok: 'var(--lf-dlx-pink)',
    crumbs: 'প্রাতিষ্ঠানিক সংযোগ'
  },
  'shortcuts': {
    title: 'কীবোর্ড শর্টকাটস ও টাইপিং চিটশিট',
    desc: 'দ্রুত টাইপিং ও ন্যাভিগেশনের সম্পূর্ণ গাইড',
    icon: 'fa-keyboard', tok: 'var(--lf-dlx-slate)',
    crumbs: 'প্রাতিষ্ঠানিক সংযোগ'
  }
};

/* ═══════════════ ১. প্রমিত বানান পরীক্ষক ═══════════════ */
router.get('/tools/spell-checker', (req, res) => {
  res.render('user/utilities/spell-checker', {
    meta: TOOL_META['spell-checker'],
    currentPath: '/tools/spell-checker'
  });
});

/* ═══════════════ ২. ইউনিকোড ও ফন্ট কনভার্টার ═══════════════ */
router.get('/tools/font-converter', (req, res) => {
  res.render('user/utilities/font-converter', {
    meta: TOOL_META['font-converter'],
    currentPath: '/tools/font-converter'
  });
});

/* ═══════════════ ৩. সদস্যপদ সনদ (লগইন-গেটেড, DB-চালিত) ═══════════════ */
router.get('/me/certificate', ensureAuth, async (req, res) => {
  const u = req.session.user;
  const row = await db.prepare(
    `SELECT id, full_name, username, designation, created_at,
            (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND status = 'published') AS post_count
       FROM users u WHERE id = ? LIMIT 1`
  ).get(u.id);
  res.render('user/utilities/certificate', {
    meta: TOOL_META['certificate'],
    member: row || u,
    currentPath: '/me/certificate'
  });
});

/* ═══════════════ ৪. কপিরাইট/চৌর্যবৃত্তি রিপোর্ট ═══════════════ */
router.get('/support/dmca-report', (req, res) => {
  res.render('user/utilities/dmca-report', {
    meta: TOOL_META['dmca-report'],
    user: req.session.user || null,
    ok: req.query.ok === '1', dup: req.query.dup === '1', err: req.query.err || null,
    currentPath: '/support/dmca-report'
  });
});

// POST — লগইন-বাধ্যতামূলক; complaints-টেবিলে সংরক্ষণ (subject-প্রিফিক্স
// '[কপিরাইট]' দিয়ে স্টাফ-ইনবক্সে শনাক্তযোগ্য); সেশন ৩৫-রীতি: ৬০-মিনিট ডুপ-গার্ড।
router.post('/support/dmca-report', ensureAuth, async (req, res) => {
  const { workTitle, workLink, infringeLink, details } = req.body || {};
  if (!workTitle || !infringeLink) {
    return res.redirect('/support/dmca-report?err=' + encodeURIComponent('মূল লেখার শিরোনাম ও চৌর্যবৃত্ত-লিংক দুটিই বাধ্যতামূলক।'));
  }
  const subject = '[কপিরাইট] ' + String(workTitle).slice(0, 120);
  const body = [
    'মূল লেখা: ' + workTitle,
    workLink ? 'মূল লেখার লিংক: ' + workLink : null,
    'চৌর্যবৃত্ত-লিংক: ' + infringeLink,
    details ? 'বিবরণ: ' + details : null
  ].filter(Boolean).join('\n');
  const dup = await db.prepare(
    "SELECT id FROM complaints WHERE submitted_by = ? AND subject = ? AND created_at >= datetime('now','-60 minutes') LIMIT 1"
  ).get(req.session.user.id, subject);
  if (dup) return res.redirect('/support/dmca-report?dup=1');
  await db.prepare('INSERT INTO complaints (submitted_by, subject, body) VALUES (?, ?, ?)')
    .run(req.session.user.id, subject, body);
  return res.redirect('/support/dmca-report?ok=1');
});

/* ═══════════════ ৫. ঐতিহাসিক আর্কাইভ (DB-বছর-গ্রুপিং) ═══════════════ */
router.get('/archive', async (req, res) => {
  const rows = await db.prepare(
    `SELECT strftime('%Y', COALESCE(p.published_at, p.created_at)) AS yr,
            COUNT(*) AS total,
            SUM(CASE WHEN p.type = 'article' THEN 1 ELSE 0 END) AS articles,
            SUM(CASE WHEN p.type = 'question' THEN 1 ELSE 0 END) AS questions,
            SUM(COALESCE(p.view_count, 0)) AS views
       FROM posts p
      WHERE p.status = 'published' AND p.shared_from IS NULL
      GROUP BY yr ORDER BY yr DESC`
  ).all();
  const yearGroups = rows.filter(r => r.yr);
  const oldest = yearGroups[yearGroups.length - 1] || null;
  const newest = yearGroups[0] || null;
  /* প্রতিটি বছরের সেরা-পঠিত ৩টি লেখা (আর্কাইভ-ঝলক) */
  const highlights = {};
  await Promise.all(yearGroups.slice(0, 6).map(async (g) => {
    highlights[g.yr] = await db.prepare(
      `SELECT p.id, p.title, p.type, p.view_count, u.full_name, u.username
         FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.status = 'published' AND p.shared_from IS NULL
          AND strftime('%Y', COALESCE(p.published_at, p.created_at)) = ?
        ORDER BY p.view_count DESC LIMIT 3`
    ).all(g.yr);
  }));
  res.render('user/utilities/archive', {
    meta: TOOL_META['archive'],
    yearGroups, highlights, oldest, newest,
    currentPath: '/archive'
  });
});

/* ═══════════════ ৬. ব্লাইন্ড পিয়ার-রিভিউ প্যানেল ═══════════════ */
router.get('/peer-review', async (req, res) => {
  /* রিভিউ-যোগ্য সাম্প্রতিক পাণ্ডুলিপি — লেখকের নাম প্যানেলে ইচ্ছাকৃত লুকানো
     (ব্লাইন্ড-নীতি): শুধু শিরোনাম+ক্যাটাগরি+তারিখ দেখানো হয়। */
  const manuscripts = await db.prepare(
    `SELECT p.id, p.title, p.category, p.excerpt, p.created_at, p.view_count,
            LENGTH(IFNULL(p.body,'')) AS body_len
       FROM posts p
      WHERE p.status = 'published' AND p.type = 'article' AND p.shared_from IS NULL
      ORDER BY p.created_at DESC LIMIT 12`
  ).all();
  const reviewedCount = await db.prepare(
    `SELECT COUNT(*) AS n FROM posts
      WHERE status = 'published' AND type = 'article' AND comment_count > 0`
  ).get();
  res.render('user/utilities/peer-review', {
    meta: TOOL_META['peer-review'],
    manuscripts,
    reviewedCount: reviewedCount ? reviewedCount.n : 0,
    currentPath: '/peer-review'
  });
});

/* ═══════════════ ৭. বিজ্ঞাপন ও স্পন্সরশিপ নীতিমালা ═══════════════ */
router.get('/sponsorship', (req, res) => {
  res.render('user/utilities/sponsorship', {
    meta: TOOL_META['sponsorship'],
    currentPath: '/sponsorship'
  });
});

/* ═══════════════ ৮. কীবোর্ড শর্টকাটস চিটশিট ═══════════════ */
router.get('/shortcuts', (req, res) => {
  res.render('user/utilities/shortcuts', {
    meta: TOOL_META['shortcuts'],
    currentPath: '/shortcuts'
  });
});

module.exports = router;
