const express = require('express');
const router = express.Router();
const db = require('../db');
// হোম নেতৃত্ব সেকশনের ৮ পাতার বক্তব্য (৫০-১০০ শব্দ) — স্লট-ভিত্তিক,
// members.bio ফাঁকা হলে ভিউ এটি ব্যবহার করে (সেশন ২৯)
const leaderStatements = require('../data/leaderStatements');
const bnDate131 = require('../helpers/bn-date'); // সেশন ১৩১: সাইট-ওয়াইড তারিখ-চুক্তি
// সেশন ২৯১: হোম ই-পেপার কিয়স্কের থাম্বনেইল-সোর্স — data/newspaperLinks-ই একক-সত্য-উৎস
// (session-227-এর চতুঃস্তর-লক: নাম ↔ URL-ডোমেইন ↔ manifest# ↔ sha256)। নাম-মিল-ছাড়া
// কোনো থাম্ব যাবে না — মিসম্যাচ-অসম্ভব (নিচে epaperThumbByName291)।
const epd226Newspapers291 = require('../data/newspaperLinks');
// সেশন ১৯৩: হোমপেজ লেআউট রেজিস্ট্রি — সেকশন/কার্ড/স্লাইড ক্রম অ্যাডমিন-নিয়ন্ত্রিত
// (/admin/home-reorder প্যানেল সেভ করে settings-এ; এখানে পড়ে ভিউতে পাস হয়)
const homeLayout = require('../helpers/home-layout');
// সেশন ১১০: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ (একক-উৎস — moderator.js-এর COVERS110-এরই মিরর)
const COVERS110 = require('../helpers/covers');
// সেশন ২০৫ (পুনরুদ্ধার, মূল সেশন ৫৫/৬৩/৬৪): হোম-স্লট ভিজিবিলিটি + অতিরিক্ত-উপদেষ্টা —
// a68fec4(session193)-এর stale-tree রিরাইটে হোম-রেন্ডার থেকে home_hidden_slots-ফিল্টার
// ও home_extra_members opt-in হারিয়ে গিয়েছিল (অ্যাডমিন /admin/home-leadership-এর
// দৃশ্যমান-টগল হোমপেজে প্রয়োগ হত না)। স্লট-কী অভিন্ন SLOT_META-উৎস।
const HL205 = require('../helpers/home-leadership');

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
  // সেশন ২৩৩: ঢাকা-ক্যালেন্ডার-তারিখ (en-CA Asia/Dhaka) — /epaper-পাতার todayIso-চুক্তির
  // হুবহু প্রতিরূপ; epaper_files.scheduled_date বট-এই ফরম্যাটে লেখে
  const dhakaToday233 = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  // সেশন ৭২ (GSC ইনডেক্সিং-ফিক্স — ক্রল-স্পিড): আগে ~১২টি সিরিয়াল await ছিল;
  // Turso-তে প্রতিটি await = ১টি নেটওয়ার্ক রাউন্ড-ট্রিপ → ওয়ার্ম TTFB-ই ৩-৭ সেকেন্ড,
  // যা Googlebot-এর ক্রল-রেট কমিয়ে দিত (GSC: "Discovered – currently not indexed")।
  // এখন স্বাধীন কুয়েরিগুলো এক প্যারালাল ব্যাচে ছোড়া হয়।
  const [recentNotices, homeTermYearRows, founders, foundingAdvisors, currentAdvisors, advisors, todayRows, hiddenSlotsRaw205, extraMembersRaw205, recentArticles, faqItems42, sectionOrderRaw193, memberOrderRaw193, feedOrderRaw193, epaperTodayRows233, epaperLatestRows233, epaperStatsRow296, epkSlideRows310] = await Promise.all([
    db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 3').all(),
    db.prepare("SELECT DISTINCT term_year FROM members WHERE member_type = 'central' AND term_year IS NOT NULL").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder' ORDER BY m.sort_order LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year ASC, m.sort_order ASC LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year DESC, m.sort_order DESC LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.sort_order LIMIT 4").all(),
    db.prepare("SELECT * FROM daily_content WHERE scheduled_date = ? AND published = 1 ORDER BY id").all(new Date().toISOString().slice(0, 10)),
    // সেশন ২০৫: স্লট-ভিজিবিলিটি + অতিরিক্ত-উপদেষ্টা opt-in (প্যারালাল-ব্যাচে — রাউন্ডট্রিপ সাশ্রয়)
    db.getSetting('home_hidden_slots'),
    db.getSetting('home_extra_members'),
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
    // সেশন ১৯৩: অ্যাডমিন-সংরক্ষিত হোমপেজ লেআউট (ক্রম/সক্রিয়তা) — তিনটেই ক্যাশড
    // getSettingsAll-পাইপে settings টেবিল থেকে (getSetting সস্তা)
    db.getSetting('home_section_order'),
    db.getSetting('home_member_order'),
    db.getSetting('home_feed_order'),
    // সেশন ২৩৩: 'আজকের ই-পেপার' প্রিমিয়াম ব্যান্ড — আজকের (ঢাকা-তারিখ) বট-সিঙ্কড সংখ্যা +
    // ফলব্যাকের জন্য সর্বশেষ সিঙ্কড-দিন (দুটোই প্যারালাল-ব্যাচে — অতিরিক্ত-রাউন্ডট্রিপ শূন্য)।
    // সেশন ২৯৬: LIMIT 6→14 (প্রশস্ত কিয়স্কে শীর্ষ-পত্রিকাগুলোর পূর্ণ-সারি); ফলব্যাক-কুয়েরি
    // এখন MAX(scheduled_date)-সাবকুয়েরিতে সম্পূর্ণ-সর্বশেষ-দিন (আগে দুই-দিন-মিশ্রণ-সম্ভব ছিল)
    db.prepare("SELECT id, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, scheduled_date AS paperDate FROM epaper_files WHERE published = 1 AND scheduled_date = ? ORDER BY id ASC LIMIT 14").all(dhakaToday233),
    db.prepare("SELECT id, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, scheduled_date AS paperDate FROM epaper_files WHERE published = 1 AND scheduled_date = (SELECT MAX(scheduled_date) FROM epaper_files WHERE published = 1) ORDER BY id ASC LIMIT 14").all(),
    // সেশন ২৯৬: বাম-কলাম স্ট্যাট-রো (রিয়েল আর্কাইভ-পরিসংখ্যান — একই প্যারালাল-ব্যাচ)
    db.prepare("SELECT COUNT(*) AS totalIssues, COUNT(DISTINCT paper_name) AS totalPapers FROM epaper_files WHERE published = 1").get(),
    // সেশন ৩১০: হোম ফুল-কভার স্লাইডার — অ্যাডমিন-নিয়ন্ত্রিত দৃশ্যমান স্লাইড (ক্রমানুসারে;
    // /admin/home-epaper ড্যাশবোর্ড থেকে নিয়ন্ত্রিত — টেবিল না-থাকলেও হোম-ক্র্যাশ-শূন্য)
    db.prepare('SELECT id, name, slug, thumb, color, link, "order" FROM home_epaper_slides WHERE isActive = 1 ORDER BY "order" ASC, id ASC').all(),
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

  // ── সেশন ৩০৭ (sfs307): ফোন-মকআপ বাস্তব-ফিড-হাইড্রেশন (SSR-নিরাপদ — প্রধান-প্রবাহ-অটুট) ──
  // লগইন-বিহীন পাবলিক-পোস্ট: status='published' + audience='PUBLIC' + শেয়ার-কপি বাদ (shared_from)
  // + লেখক active। substr(body,400) — লিন-কোয়েরি। ব্যর্থতায় (অ-মাইগ্রেটেড ডিবি/কলাম-অনুপস্থি)
  // খালি-ই থাকুক — ভিউ ডেমো-ফলব্যাকে রেন্ডার করবে (s306b-গ্রেসফুল-গেট-ধর্ম)।
  let sfsRealPosts307 = [];
  try {
    sfsRealPosts307 = await db.prepare(`SELECT p.id, p.excerpt, substr(p.body, 1, 400) AS body, p.cover_image, p.like_count, p.comment_count, p.view_count, p.published_at,
       u.full_name, u.pen_name, u.username
  FROM posts p JOIN users u ON u.id = p.author_id
 WHERE p.status = 'published' AND p.audience = 'PUBLIC' AND p.shared_from IS NULL
   AND u.status = 'active'
 ORDER BY p.published_at DESC, p.id DESC LIMIT 8`).all();
  } catch (e307) { sfsRealPosts307 = []; }

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

  // ── সেশন ১৯৩: অ্যাডমিন-নির্ধারিত ক্রম প্রয়োগ ──
  // ① সেকশন-ক্রম (home_section_order) → ভিউ ordered partials লুপে রেন্ডার করে
  const homeSections193 = homeLayout.resolveOrder(sectionOrderRaw193);
  // ② নেতৃত্ব-কার্ডের ভেতরের ক্রম (home_member_order) — গ্রুপ-ভিত্তিক ম্যাপ;
  //    applyMemberOrder স্টেবল — সেভ-করা তালিকায় না-থাকা সদস্য আগের ক্রমে শেষে
  const moMap193 = homeLayout.sanitizeMemberOrderMap(
    (() => { try { return JSON.parse(memberOrderRaw193 || '{}'); } catch (e) { return {}; } })()
  );
  const foundersOrdered193      = homeLayout.applyMemberOrder(foundersFinal, moMap193.FOUNDERS);
  const foundingAdvisors193     = homeLayout.applyMemberOrder(foundingAdvisors, moMap193.FOUNDING_ADVISORS);
  const currentLeaders193       = homeLayout.applyMemberOrder(currentLeaders, moMap193.CURRENT_PAIR);
  const currentAdvisors193      = homeLayout.applyMemberOrder(currentAdvisors, moMap193.CURRENT_ADVISORS);
  // ── সেশন ২০৫: স্লট-ভিজিবিলিটি সেট (ভিউ leaderPair-এ slotKeys-ভিত্তিক ফিল্টার হয়) ──
  // settings অনুপস্থিত হলে effectiveHiddenSlots ডিফল্ট current_advisor_1/2 লুকায়
  // (উপদেষ্টা নিয়োগ না-দেওয়া পর্যন্ত — মূল সেশন ৬৪-এর নিয়ম)।
  let hiddenSlots205 = HL205.DEFAULT_HIDDEN_SLOTS.slice();
  try { hiddenSlots205 = HL205.effectiveHiddenSlots(hiddenSlotsRaw205); } catch (e) { /* ডিফল্টই থাকুক */ }
  // অতিরিক্ত-উপদেষ্টা (মূল সেশন ৬৪): নবীনতম-কার্যবর্ষের তৃতীয়+ সদস্য — শুধু
  // home_extra_members (opt-in CSV)-এ থাকলেই হোমপেজে যোগ হয়।
  let currentExtras205 = [];
  try {
    const extraIds205 = HL205.parseCsvList(extraMembersRaw205).map(Number);
    if (extraIds205.length) {
      const groups205 = await HL205.fetchAdvisoryGroups(db);
      currentExtras205 = (groups205.current || []).slice(2).filter(m => extraIds205.includes(Number(m.id)));
    }
  } catch (e) { /* ব্যর্থ হলে শুধু ৮-স্লটই থাকবে */ }
  const currentAdvisorsFinal205 = [...currentAdvisors193, ...currentExtras205];
  // ③ ইউজার-ফিড স্লাইডারের ক্রম (home_feed_order)
  const feedSlides193 = homeLayout.orderFeedSlides(feedOrderRaw193);
  // ④ 'আজকের কন্টেন্ট' ব্যান্ডের ⚡ এক নজরে স্লাইড — আজকের বাস্তব daily_content
  //    থেকে (আগের today-grid কার্ডেরই ডেটা; কুইজ-চ্যালেঞ্জ ব্যান্ড সক্রিয় থাকলে
  //    ডুপ্লিকেশন এড়াতে কুইজ-স্লাইড বাদ — আগের today-grid-এর সেইম চুক্তি)
  const todaySlides193 = [];
  const tnCut193 = (t) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 110);
  if (todayByType.this_day) todaySlides193.push({ key: 'this_day', icon: 'fa-calendar-day', title: 'এই দিনে ইতিহাসে', sub: tnCut193(todayByType.this_day.title), href: '/on-this-day' });
  if (todayByType.quiz && !quizChallenge) todaySlides193.push({ key: 'quiz', icon: 'fa-question-circle', title: 'আজকের কুইজ', sub: tnCut193(todayByType.quiz.title), href: '/quiz' });
  if (todayByType.activity) todaySlides193.push({ key: 'activity', icon: 'fa-running', title: 'আজকের কার্যক্রম', sub: tnCut193(todayByType.activity.title), href: '/activities' });
  if (todayByType.epaper) todaySlides193.push({ key: 'epaper', icon: 'fa-newspaper', title: 'আজকের ই-পেপার', sub: tnCut193(todayByType.epaper.title), href: todayByType.epaper.link_url || todayByType.epaper.file_url || '/epaper' });
  if (todayByType.best_writer) todaySlides193.push({ key: 'best_writer', icon: 'fa-crown', title: 'সেরা লেখক', sub: tnCut193(todayByType.best_writer.title), href: todayByType.best_writer.link_url || '/best-writer' });

  // ── সেশন ২৩৩: 'আজকের ই-পেপার' প্রিমিয়াম ব্যান্ডের ডেটা (today.ejs পুনর্লিখন) ──
  // আজকের বট-সিঙ্কড ফাইল না-থাকলে সর্বশেষ সিঙ্কড-দিন দেখাই ("সংস্করণ আসন্ন"-অবস্থা) —
  // deep-link: /epaper?file=<id> (epaper-অ্যাপের session233-boot-hook সরাসরি খোলে)
  const epaperToday233 = Array.isArray(epaperTodayRows233) ? epaperTodayRows233 : [];
  const epaperLatest233 = epaperToday233.length ? epaperToday233 : (Array.isArray(epaperLatestRows233) ? epaperLatestRows233 : []);
  const epaperLatestDateBn233 = (epaperLatest233.length && epaperLatest233[0].paperDate) ? bnDate131.bnDate(epaperLatest233[0].paperDate) : '';
  const todayBn233 = bnDate131.bnDate(dhakaToday233);

  // ── সেশন ২৯১: হোম ই-পেপার ৩ডি কিয়স্ক — নাম-ভিত্তিক থাম্বনেইল (মিসম্যাচ-অসম্ভব) ──
  // ইউজার-নীতি (session-278-প্রতিরূপ): "এক ই-পেপারের থাম্বনিল অন্য ইপেপারে যেন না যায়"।
  // সুতরাং: ① স্বাভাবিকীকরণ = trim + বহু-স্পেস সংকোচন মাত্র (কোনো অস্পষ্ট-মিল নয়)
  // ② স্টেপ-১ সম্পূর্ণ-নাম-মিল; ③ স্টেপ-২: কেবল অগ্র-"দৈনিক "/"দ্য "-স্ট্রিপ-পুনঃপ্রচেষ্টা
  //   (বট paper_name-এ অগ্র-দৈনিক-যোগ করে — "দৈনিক কালবেলা" → "কালবেলা");
  // ④ স্ট্রিপ-পরে একাধিক লিংক-এন্ট্রি মিললে = অস্পষ্ট → থাম্ব-শূন্য (fallback-মাস্টহেড);
  // ⑤ কোনো-মিল-নেই → থাম্ব-শূন্য। ফলে প্রতিটি থাম্ব তার নিজ-নামের পত্রিকায়ই যায়।
  const epThumbMap291 = new Map();
  epd226Newspapers291.forEach(function (n) {
    const key291 = String(n.name || '').trim().replace(/\s+/g, ' ');
    if (key291 && !epThumbMap291.has(key291)) epThumbMap291.set(key291, n.thumb || '');
  });
  function epaperThumbByName291(rawName) {
    const nm291 = String(rawName || '').trim().replace(/\s+/g, ' ');
    if (!nm291) return '';
    if (epThumbMap291.has(nm291)) return epThumbMap291.get(nm291) || '';
    const stripped291 = nm291.replace(/^(?:দৈনিক|দ্য)\s+/u, '');
    if (stripped291 && stripped291 !== nm291) {
      // অস্পষ্টতা-গার্ড: স্ট্রিপ-নামে একাধিক-এন্ট্রি মিললে থাম্ব-শূন্য (ভুল-পত্রিকা-প্রতিরোধ)
      const hits291 = epd226Newspapers291.filter(function (n) {
        return String(n.name || '').trim().replace(/\s+/g, ' ') === stripped291;
      });
      if (hits291.length === 1) return hits291[0].thumb || '';
    }
    return '';
  }
  epaperLatest233.forEach(function (p) { p.thumb = epaperThumbByName291(p.paperName); });

  // ── সেশন ২৯৬: প্রথম-পাতা-থাম্ব-চেইন (ইউজার-স্পেক — "সম্পূর্ণ প্রথম পাতা দেখা যায়") ──
  // newspaperLinks-থাম্ব আসলে ৫০০×১৯৬ লোগো-ব্যানার — সম্পূর্ণ প্রথম পাতা নয়। আসল প্রথম-পাতা
  // প্রতিটি epaper_files-সারির নিজের drive_thumb_id/drive_file_id-এ (বট-আপলোড) — সারির-নিজ-সম্পদ
  // বলে নাম-মিসম্যাচ-প্রশ্নই-ওঠে-না (session278-নীতি-আরও-কঠোরভাবে-মানা)। /epaper-পাতার
  // session175-চুক্তিরই প্রতিরূপ: /api/epaper/thumb/:fid প্রক্সি (ব্যানার-কভার-ক্লিনার + PDF-পাতা-১)।
  // ফলব্যাচ-চেইন: প্রক্সি(fileId) → প্রক্সি(thumbId) → lh3(thumbId) → drive-thumbnail(fileId) → লোগো-ব্যানার(p.thumb) → টেক্সট-মাস্টহেড।
  // সেশন ২৯৬-পলিশ (প্রোড-প্রমাণ): প্রোডে drive_thumb_id-প্রক্সি ৫/৫ ৫০২ (thumb-আইডি-নিজেই-অকেজো)
  // → fileId-প্রক্সি (PDF-পাতা-১) প্রথমে — প্রমাণিত-কর্মী-পথে এক-হপে সম্পূর্ণ পাতা; thumbId-পরে
  // (বট-ভবিষ্যৎ-ফিক্সে স্বয়ং-কাজে-ফেরে), শেষে lh3/drive-কাঁচা-ফলব্যাক।
  epaperLatest233.forEach(function (p) {
    const t296 = String(p.thumbId || ''), f296 = String(p.fileId || '');
    const chain296 = [];
    if (f296) chain296.push('/api/epaper/thumb/' + encodeURIComponent(f296) + '?v=4');
    if (t296) chain296.push('/api/epaper/thumb/' + encodeURIComponent(t296) + '?v=4');
    if (t296) chain296.push('https://lh3.googleusercontent.com/d/' + encodeURIComponent(t296) + '=s800');
    if (f296) chain296.push('https://drive.google.com/thumbnail?id=' + encodeURIComponent(f296) + '&sz=w800');
    if (chain296.length) p.thumbs = chain296;
  });

  // ── সেশন ২৯৬: জনপ্রিয়-পত্রিকা প্রাধিকার-ক্রম (ইউজার-স্পেক) ──
  // ইউজার-চাহিদা: প্রথম আলো, যুগান্তর, সমকাল, কালের কণ্ঠ, ইত্তেফাক, আমার দেশ, মানবকণ্ঠ —
  // এই শীর্ষ-পত্রিকাগুলো কিয়স্কের সামনের-সারিতে। নাম-মিল epaperThumbByName291-এরই রীতি:
  // বট paper_name-এর অগ্র-"দৈনিক "/"দ্য " স্ট্রিপ-করে মিল; র‍্যাংক-বহির্ভূত পত্রিকা
  // স্থিতিশীল-ক্রমে (id ASC) পরে থাকে — ভুল-মিল-অসম্ভব (কেবল সম্পূর্ণ-নাম)।
  // ── সেশন ২৯৬-পলিশ: নাম-ডিডুপ — প্রতি-পত্রিকার সর্বশেষ-সারি (বট-পুনঃআপলোডে ডুপ-সারি
  // ফিল্ম-স্লট-নষ্ট করে; session295 /epaper-স্ট্রিপ-চুক্তিরই হোম-সাইড সামঞ্জস্য)।
  // কী = স্বাভাবিকীকৃত-নাম (অগ্র-দৈনিক/দ্য-স্ট্রিপ); বৃহত্তর-id = সর্বশেষ-আপলোড জয়ী।
  const epNameBest296 = new Map();
  epaperLatest233.forEach(function (p) {
    const nm296 = String(p.paperName || '').trim().replace(/\s+/g, ' ');
    const key296 = nm296.replace(/^(?:দৈনিক|দ্য)\s+/u, '') || nm296;
    const prev296 = epNameBest296.get(key296);
    if (!prev296 || p.id > prev296.id) epNameBest296.set(key296, p);
  });
  const epDeduped296 = Array.from(epNameBest296.values());
  epaperLatest233.length = 0;
  Array.prototype.push.apply(epaperLatest233, epDeduped296);
  const epPopularRank296 = ['প্রথম আলো', 'যুগান্তর', 'সমকাল', 'কালের কণ্ঠ', 'ইত্তেফাক', 'আমার দেশ', 'মানবকণ্ঠ'];
  function epPopularIndex296(rawName) {
    const nm296 = String(rawName || '').trim().replace(/\s+/g, ' ');
    const st296 = nm296.replace(/^(?:দৈনিক|দ্য)\s+/u, '');
    const iFull296 = epPopularRank296.indexOf(nm296);
    return iFull296 !== -1 ? iFull296 : epPopularRank296.indexOf(st296);
  }
  epaperLatest233.sort(function (a, b) {
    const ia296 = epPopularIndex296(a.paperName), ib296 = epPopularIndex296(b.paperName);
    if (ia296 !== -1 && ib296 !== -1) return ia296 - ib296;
    if (ia296 !== -1) return -1;
    if (ib296 !== -1) return 1;
    return a.id - b.id;
  });

  // ── সেশন ৩১০: ফুল-কভার স্লাইডার-সারি — অ্যাডমিন-কনফিগারেশন + নাম-মিল-প্রথম-পাতা-চেইন ──
  // ইউজার-স্পেক: কার্ডে শুধু প্রচ্ছদ (কোনো নাম-হেডার নেই, কোনো ছোট-কার্ড নেই), ৪ সেকেন্ডে
  // অটো-স্লাইড। প্রতি-স্লাইডের ইমেজ-চেইন (মিসম্যাচ-অসম্ভব — session291/296-নীতিরই সম্প্রসারণ):
  //   ① অ্যাডমিন-নির্ধারিত thumb (চূড়ান্ত — override) → ② নাম-মিল epaper_files-চেইন
  //   (epNameBest296-ম্যাপ: fileId-প্রক্সি → thumbId-প্রক্সি → lh3 → drive) → ③ মাস্টহেড-ফলব্যাক।
  // টেবিল-অনুপস্থিত/খালি হলে স্লাইড-সারি খালি → ভিউ লাইভ-ফিল্মস্ট্রিপ-ডেটাতেই গ্রেসফুল-ফলব্যাক।
  const epkSlides310 = (Array.isArray(epkSlideRows310) ? epkSlideRows310 : []).map(function (s310) {
    const nm310 = String(s310.name || '').trim().replace(/\s+/g, ' ');
    const st310 = nm310.replace(/^(?:দৈনিক|দ্য)\s+/u, '');
    const row310 = epNameBest296.get(st310) || epNameBest296.get(nm310) || null;
    const adminThumb310 = String(s310.thumb || '').trim();
    const chain310 = adminThumb310 ? [adminThumb310] : ((row310 && row310.thumbs) ? row310.thumbs.slice() : []);
    return {
      id: s310.id,
      name: nm310,
      slug: s310.slug || '',
      color: s310.color || '#006A4E',
      href: s310.link || (row310 ? ('/epaper?file=' + encodeURIComponent(row310.id)) : '/epaper?paper=' + encodeURIComponent(nm310)),
      thumb: chain310[0] || '',
      thumbs: chain310
    };
  }).filter(function (s310) { return !!s310.name; });

  res.render('lekhok-home', { faqItems42,
    layout: 'layout',
    pageTitle: 'হোম',
    currentPath: '/',
    recentNotices,
    currentLeaders: currentLeaders193,
    leaderStatements,
    founders: foundersOrdered193,
    foundingAdvisors: foundingAdvisors193,
    currentAdvisors: currentAdvisorsFinal205,
    homeHiddenSlots: hiddenSlots205,
    advisors,
    recentArticles,
    homeCurated,
    todayByType,
    todaySlides: todaySlides193,
    feedSlides: feedSlides193,
    sfsRealPosts: sfsRealPosts307, // সেশন ৩০৭: ফোন-ফিড বাস্তব-পোস্ট (খালি = ডেমো-ফলব্যাক)
    homeSections: homeSections193,
    hasToday,
    quizChallenge,
    // সেশন ২৩৩: আজকের ই-পেপার ব্যান্ড (সেশন ২৯৬: উভয়-সারিতেই ফিল্মস্ট্রিপ-ক্যাপ ৮ — র‍্যাংক-বাছাইয়ের পরে)
    epaperToday: epaperToday233.slice(0, 8),
    epaperLatest: epaperLatest233.slice(0, 8),
    epaperHasToday: epaperToday233.length > 0,
    epaperLatestDateBn: epaperLatestDateBn233,
    todayBn: todayBn233,
    // সেশন ২৯৬: বাম-কলাম স্ট্যাট-রো
    epaperStats296: { papers: epaperToday233.length, totalPapers: (epaperStatsRow296 && epaperStatsRow296.totalPapers) || 0, totalIssues: (epaperStatsRow296 && epaperStatsRow296.totalIssues) || 0 },
    // সেশন ৩১০: ফুল-কভার অটো-স্লাইডার (অ্যাডমিন-নিয়ন্ত্রিত সারি — খালি হলে ভিউ লাইভ-ফলব্যাক)
    epaperSlides310: epkSlides310
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
