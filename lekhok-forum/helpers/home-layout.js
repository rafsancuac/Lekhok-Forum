// সেশন ১৯৩: হোমপেজ লেআউট রেজিস্ট্রি — সেকশন-ক্রম, ভেতরের-কার্ডের ক্রম ও
// ফিড-স্লাইডার ক্রম অ্যাডমিন প্যানেল (/admin/home-reorder) থেকে নিয়ন্ত্রণযোগ্য।
//
// স্টোরেজ (settings টেবিল, key/value):
//   • home_section_order  → JSON [{"key":"HERO","enabled":true}, ...]  (পূর্ণ-তালিকা)
//   • home_member_order   → JSON {"FOUNDERS":[id..],"FOUNDING_ADVISORS":[..],
//                                "CURRENT_PAIR":[..],"CURRENT_ADVISORS":[..]}
//   • home_feed_order     → JSON ["quiz","thisday","epaper","best"]
//
// নীতি: সেভ-করা তালিকার বাইরের/নতুন কী সবসময় রেজিস্ট্রি-ক্রমে শেষে যোগ হয় —
// ভবিষ্যৎ সেকশন যোগ হলেও পেজ কখনো ভাঙবে না (present-beats-default)।
'use strict';

// ── ১. হোমপেজের মূল সেকশন-রেজিস্ট্রি (lekhok-home.ejs-এর partials-এর সাথে জোড়া) ──
const HOME_SECTIONS = [
  { key: 'HERO',                 label: 'টপ হিরো ব্যানার ও স্লোগান',                icon: 'fa-star',        partial: 'hero' },
  { key: 'TODAY',                label: 'আজকের কন্টেন্ট (আজ বিশেষ কী আছে?)',       icon: 'fa-sun',         partial: 'today' },
  { key: 'QUIZ_CHALLENGE',       label: 'আজকের কুইজ চ্যালেঞ্জ (ইন্টারঅ্যাক্টিভ)',    icon: 'fa-bolt',        partial: 'quiz' },
  { key: 'MISSION',              label: 'লক্ষ্য ও উদ্দেশ্য (ফিচার গ্রিড)',           icon: 'fa-bullseye',    partial: 'mission' },
  { key: 'LEADERSHIP_FOUNDING',  label: 'নেতৃত্বের ধারা (প্রতিষ্ঠাতা পরিষদ)',        icon: 'fa-landmark',    partial: 'leadership-founding' },
  { key: 'LEADERSHIP_CURRENT',   label: 'বর্তমান নেতৃত্ব',                          icon: 'fa-user-tie',    partial: 'leadership-current' },
  { key: 'FAQ',                  label: 'সাধারণ জিজ্ঞাসা (FAQ)',                    icon: 'fa-comments',    partial: 'faq' },
  { key: 'USER_FEED',            label: 'সোশ্যাল ফিড / ইউজার ফিড',                  icon: 'fa-stream',      partial: 'feed' },
  { key: 'NOTICES',              label: 'সাম্প্রতিক বিজ্ঞপ্তি',                      icon: 'fa-bullhorn',    partial: 'notices' },
  { key: 'ARTICLES',             label: 'লেখকদের কালি (সাম্প্রতিক লেখা)',           icon: 'fa-pen-nib',     partial: 'articles' }
];

// ── ২. ইউজার-ফিড শোকেসের স্লাইড-রেজিস্ট্রি (feed.ejs-এর স্ট্যাটিক ৪ স্লাইডের ডেটা-ভার্সন) ──
const FEED_SLIDES = [
  { key: 'quiz',    icon: 'fa-brain',        title: 'আজকের কুইজ',        sub: 'প্রতিদিন নতুন প্রশ্ন, মেধা যাচাই করুন', href: '/quiz' },
  { key: 'thisday', icon: 'fa-calendar-day', title: 'এই দিনে ইতিহাসে',   sub: 'আজকের দিনের তাৎপর্য জেনে নিন', href: '/on-this-day' },
  { key: 'epaper',  icon: 'fa-newspaper',    title: 'আজকের ই-পেপার',     sub: 'সাহিত্য ও মতামত পাতার নির্বাচন', href: '/epaper' },
  { key: 'best',    icon: 'fa-crown',        title: 'মাসিক সেরা লেখক',   sub: 'এই মাসের শ্রেষ্ঠ লেখক কে, দেখুন', href: '/best-writer' }
];

// ── ৩. নেতৃত্ব-গ্রুপ কী-সংজ্ঞা (home_member_order-এর চাবি) ──
const MEMBER_GROUP_KEYS = ['FOUNDERS', 'FOUNDING_ADVISORS', 'CURRENT_PAIR', 'CURRENT_ADVISORS'];

function safeParse(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

// সেভ-করা raw value (settings থেকে) → পূর্ণ-অর্ডার্ড সেকশন-তালিকা
// [{key,label,icon,partial,enabled}] — অবৈধ/নতুন কী রেজিস্ট্রি-ক্রমে ফলব্যাক।
function resolveOrder(raw) {
  const meta = new Map(HOME_SECTIONS.map(s => [s.key, s]));
  const out = [];
  const seen = new Set();
  const arr = Array.isArray(safeParse(raw)) ? safeParse(raw) : [];
  for (const item of arr) {
    if (!item) continue;
    const key = typeof item === 'string' ? item : item.key;
    if (!meta.has(key) || seen.has(key)) continue;
    const m = meta.get(key);
    out.push({ key: m.key, label: m.label, icon: m.icon, partial: m.partial, enabled: (typeof item === 'object' && item.enabled === false) ? false : true });
    seen.add(key);
  }
  for (const m of HOME_SECTIONS) {
    if (!seen.has(m.key)) out.push({ key: m.key, label: m.label, icon: m.icon, partial: m.partial, enabled: true });
  }
  return out;
}

// অ্যাডমিন-পোস্ট থেকে আসা অ্যারে স্যানিটাইজ — রেজিস্ট্রির বাইরের কী বাদ, ডুপ বাদ,
// সব রেজিস্ট্রি-কী ঢুকছে কি না নিশ্চিত (না থাকলে শেষে enabled:true যোগ)।
function sanitizeOrderPayload(arr) {
  if (!Array.isArray(arr)) return null;
  const meta = new Map(HOME_SECTIONS.map(s => [s.key, s]));
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    if (!item) continue;
    const key = typeof item === 'string' ? item : item.key;
    if (!meta.has(key) || seen.has(key)) continue;
    const enabled = (typeof item === 'object' && item.enabled === false) ? false : true;
    out.push({ key, enabled });
    seen.add(key);
  }
  for (const m of HOME_SECTIONS) {
    if (!seen.has(m.key)) out.push({ key: m.key, enabled: true });
  }
  return out;
}

// মেম্বার-অর্ডার ম্যাপ স্যানিটাইজ → {FOUNDERS:['12',..], ...} (স্ট্রিং-আইডি)
function sanitizeMemberOrderMap(obj) {
  const src = (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
  const out = {};
  for (const g of MEMBER_GROUP_KEYS) {
    const list = Array.isArray(src[g]) ? src[g] : [];
    const seen = new Set();
    out[g] = list.map(v => String(v)).filter(v => /^\d+$/.test(v) && !seen.has(v) && seen.add(v));
  }
  return out;
}

// একটি গ্রুপ-তালিকাকে সেভ-করা ক্রমে সাজানো (স্টেবল — অজানা আইডি শেষে আগের ক্রমে)
function applyMemberOrder(list, orderArr) {
  if (!Array.isArray(list) || !Array.isArray(orderArr) || !orderArr.length) return list;
  const pos = new Map();
  orderArr.forEach((id, i) => { const k = String(id); if (!pos.has(k)) pos.set(k, i); });
  return list.slice().sort((a, b) => {
    const pa = pos.has(String(a.id)) ? pos.get(String(a.id)) : Number.MAX_SAFE_INTEGER;
    const pb = pos.has(String(b.id)) ? pos.get(String(b.id)) : Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });
}

// ফিড-স্লাইড ক্রম: সেভ-করা key-তালিকা আগে, বাকিরা রেজিস্ট্রি-ক্রমে
function orderFeedSlides(orderArr) {
  const meta = new Map(FEED_SLIDES.map(s => [s.key, s]));
  const out = [];
  const seen = new Set();
  const arr = Array.isArray(safeParse(orderArr)) ? safeParse(orderArr) : (Array.isArray(orderArr) ? orderArr : []);
  for (const k of arr) {
    if (typeof k === 'string' && meta.has(k) && !seen.has(k)) { out.push(meta.get(k)); seen.add(k); }
  }
  for (const s of FEED_SLIDES) if (!seen.has(s.key)) out.push(s);
  return out;
}

// পোস্ট থেকে আসা feed key-তালিকা স্যানিটাইজ
function sanitizeKeyList(arr, validKeys) {
  if (!Array.isArray(arr)) return null;
  const valid = new Set(validKeys);
  const out = [];
  const seen = new Set();
  for (const k of arr) {
    if (typeof k === 'string' && valid.has(k) && !seen.has(k)) { out.push(k); seen.add(k); }
  }
  return out;
}

module.exports = {
  HOME_SECTIONS,
  FEED_SLIDES,
  MEMBER_GROUP_KEYS,
  resolveOrder,
  sanitizeOrderPayload,
  sanitizeMemberOrderMap,
  sanitizeKeyList,
  applyMemberOrder,
  orderFeedSlides
};
