/**
 * helpers/home-leadership.js — হোম-পেজের "নেতৃত্বের ধারা" ও "বর্তমান নেতৃত্ব"
 * সেকশনের ৮টি স্লটের একক-সোর্স কম্পিউটার (সেশন ৫৫)।
 * ═══════════════════════════════════════════════════════════════════════════
 * হোম-রুট (routes/pages.js) যে হুবহু কুয়েরি ও ফলব্যাক-নিয়মে ৮ পাতা বাছে,
 * অ্যাডমিন "হোম নেতৃত্ব" প্যানেলও হুবহু সেটাই দেখায় — ফলে প্যানেলে যা এডিট
 * করা হয়, সাইটে ঠিক তাই আসবে (ড্রিফট-বিহীন)।
 *
 * স্লট-ম্যাপ (হোম-ভিউ lekhok-home.ejs অনুযায়ী):
 *   নেতৃত্বের ধারা   → founder_president, founder_general_secretary
 *                    (member_type='founder', sort_order)
 *                    founding_advisor_1/2 (member_type='advisory',
 *                    term_year ASC = প্রাচীনতম ২)
 *   বর্তমান নেতৃত্ব → current_president, current_general_secretary
 *                    (member_type='central', সর্বশেষ term_year, পদ
 *                    'সভাপতি'/'সাধারণ সম্পাদক'; কম-পড়লে sort_order-ফলব্যাক)
 *                    current_advisor_1/2 (member_type='advisory',
 *                    term_year DESC = নবীনতম ২)
 *
 * বাণী-প্রাধিকার (হোম-ভিউ সেশন ৪৯): members.message → members.bio →
 *   ফলব্যাক-বাণী (settings 'content_home_statement_<key>' → খালি হলে
 *   data/leaderStatements.js ডিফল্ট)।
 */

const LEADER_STATEMENTS = require('../data/leaderStatements');

/* routes/pages.js-এর MEMBER_JOIN-এর হুবহু কপি — এক-জায়গায় রাখতে এখানেও */
const MEMBER_JOIN = `
  SELECT m.*, u.username AS user_username, u.avatar_url AS user_avatar_url,
         u.full_name AS user_full_name, u.designation AS user_designation
  FROM members m
  LEFT JOIN users u ON u.id = m.user_id
`;

/* স্লট-মেটাডেটা — অ্যাডমিন-প্যানেল ও ভিউ দুটোই এটা ব্যবহার করে */
const SLOT_META = [
  { key: 'founder_president',        section: 'legacy',  title: 'প্রতিষ্ঠাতা সভাপতি',        roleKey: 'home_role_founder_president' },
  { key: 'founder_general_secretary',section: 'legacy',  title: 'প্রতিষ্ঠাতা সাধারণ সম্পাদক', roleKey: 'home_role_founder_gs' },
  { key: 'founding_advisor_1',       section: 'legacy',  title: 'প্রতিষ্ঠাকালীন উপদেষ্টা ১',  roleKey: 'home_role_founding_advisor1' },
  { key: 'founding_advisor_2',       section: 'legacy',  title: 'প্রতিষ্ঠাকালীন উপদেষ্টা ২',  roleKey: 'home_role_founding_advisor2' },
  { key: 'current_president',        section: 'current', title: 'বর্তমান সভাপতি',           roleKey: 'home_role_current_president' },
  { key: 'current_general_secretary',section: 'current', title: 'বর্তমান সাধারণ সম্পাদক',    roleKey: 'home_role_current_gs' },
  { key: 'current_advisor_1',        section: 'current', title: 'বর্তমান উপদেষ্টা ১',        roleKey: 'home_role_current_advisor1' },
  { key: 'current_advisor_2',        section: 'current', title: 'বর্তমান উপদেষ্টা ২',        roleKey: 'home_role_current_advisor2' }
];

/* বাংলা-সংখ্যা বাছাইকারী — routes/pages.js-এর bnLead-এর হুবহু প্রতিরূপ */
function bnLead(s) {
  return parseInt(String(s || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)), 10) || 0;
}

/**
 * fetchHomeLeadershipRows(db) — হোম-রুটের হুবহু ৪টি মেম্বার-কুয়েরি চালায়।
 * রিটার্ন: { founders, foundingAdvisors, currentAdvisors, currentLeaders, latestTerm }
 */
async function fetchHomeLeadershipRows(db) {
  const [founders, foundingAdvisors, currentAdvisors, termYearRows] = await Promise.all([
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'founder' ORDER BY m.sort_order LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year ASC, m.sort_order ASC LIMIT 2").all(),
    db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'advisory' ORDER BY m.term_year DESC, m.sort_order DESC LIMIT 2").all(),
    db.prepare("SELECT DISTINCT term_year FROM members WHERE member_type = 'central' AND term_year IS NOT NULL").all(),
  ]);

  const homeTermYears = termYearRows.map((r) => r.term_year).sort((a, b) => bnLead(b) - bnLead(a));
  const latestTerm = homeTermYears[0] || null;

  // বর্তমান নেতৃত্ব — হোম-রুটের হুবহু ৩-ধাপ ফলব্যাক
  let currentLeaders = latestTerm
    ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? AND m.role IN ('সভাপতি','সাধারণ সম্পাদক') ORDER BY CASE m.role WHEN 'সভাপতি' THEN 0 ELSE 1 END, m.sort_order LIMIT 2").all(latestTerm)
    : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.role IN ('সভাপতি','সাধারণ সম্পাদক') ORDER BY m.sort_order LIMIT 2").all();
  if (!currentLeaders || currentLeaders.length < 2) {
    currentLeaders = latestTerm
      ? await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' AND m.term_year = ? ORDER BY m.sort_order LIMIT 2").all(latestTerm)
      : await db.prepare(MEMBER_JOIN + " WHERE m.member_type = 'central' ORDER BY m.sort_order LIMIT 2").all();
  }

  return { founders, foundingAdvisors, currentAdvisors, currentLeaders, latestTerm };
}

/**
 * buildHomeLeadershipSlots(rows, statementOf) — ৪-সেট-রো → ৮ স্লট-অ্যারে।
 * statementOf(slotKey) → ওই স্লটের ফলব্যাক-বাণী (settings-ওভাররাইড মিলিয়ে)।
 */
function buildHomeLeadershipSlots(rows, statementOf) {
  const { founders, foundingAdvisors, currentAdvisors, currentLeaders } = rows;
  const pairs = {
    founder_president:         [founders, 0],
    founder_general_secretary: [founders, 1],
    founding_advisor_1:        [foundingAdvisors, 0],
    founding_advisor_2:        [foundingAdvisors, 1],
    current_president:         [currentLeaders, 0],
    current_general_secretary: [currentLeaders, 1],
    current_advisor_1:         [currentAdvisors, 0],
    current_advisor_2:         [currentAdvisors, 1]
  };
  return SLOT_META.map((meta) => {
    const [set, idx] = pairs[meta.key] || [[], 0];
    return { ...meta, member: (set && set[idx]) || null, statement: statementOf ? statementOf(meta.key) : (LEADER_STATEMENTS[meta.key] || '') };
  });
}

/**
 * displayOf(m, statement) — সেশন ৬২: একটি joined member-row থেকে কার্ডের
 * প্রদর্শন-মানগুলো (নাম/ছবি/পদবি/কার্যবর্ষ-লেখা/বাণী/উৎস) হিসাব করে।
 * ভিউ (home-leadership.ejs) ও সেভ-API (admin/routes.js POST /home-leadership/slot)
 * দুই জায়গাতেই এক-ই নিয়ম চলে — API-জবাবে এই মানগুলো ফিরিয়ে দিলে ফ্রন্টএন্ড
 * পেজ-রিলোড ছাড়াই কার্ড ইন-প্লেস আপডেট করতে পারে (drift-বিহীন)।
 */
function displayOf(m, statement) {
  if (!m) {
    return { name: '', img: '/assets/img/avatar-placeholder.svg?v=2', role: '', termText: '', bani: statement || '', src: 'ফলব্যাক-বাণী', linked: false };
  }
  const displayName = m.user_full_name || m.name;
  const displayImg  = m.user_avatar_url || m.image_url || '/assets/img/avatar-placeholder.svg?v=2';
  const shownBani   = (m.message && String(m.message).trim()) ? String(m.message)
                    : ((m.bio && String(m.bio).trim()) ? String(m.bio) : (statement || ''));
  const baniSource  = (m.message && String(m.message).trim()) ? 'বাণী ফিল্ড'
                    : ((m.bio && String(m.bio).trim()) ? 'বায়ো' : 'ফলব্যাক-বাণী');
  const termText    = (m.term_year ? '(' + m.term_year + ')' : '') + (m.user_id ? ' · লিংকড অ্যাকাউন্ট' : '');
  return { name: displayName || '', img: displayImg, role: m.role || '', termText: termText.trim(), bani: shownBani || '', src: baniSource, linked: !!m.user_id };
}

module.exports = { MEMBER_JOIN, SLOT_META, LEADER_STATEMENTS, bnLead, fetchHomeLeadershipRows, buildHomeLeadershipSlots, displayOf };
