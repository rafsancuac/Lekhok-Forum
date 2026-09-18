'use strict';
/* helpers/bn-date.js — সেশন ১৩১: সাইট-ওয়াইড তারিখ-চুক্তি (RES-124-ব্যাকলগ ①)
 *
 * সমস্যা: SQLite CURRENT_TIMESTAMP = UTC নেম-লেস স্ট্রিং ("YYYY-MM-DD HH:MM:SS")।
 *   JS `new Date(নেম-লেস)` এটাকে **লোকাল** ধরে পার্স করে — বাংলাদেশ (UTC+6)
 *   ব্রাউজারে সব রিলেটিভ-টাইম ৬ ঘণ্টা বেশি পুরনো দেখায় এবং সন্ধ্যার UTC-সময়ে
 *   তারিখ একদিন পিছিয়ে যায়। স্যান্ডবক্স-হোস্ট UTC হওয়ায় বাগ আড়ালে থাকত।
 *   আগে ৩-রকম অসামঞ্জস্যপূর্ণ কনভেনশন ছিল:
 *     • social.js bnDate83 — পার্স-as-UTC কিন্তু প্রদর্শন getUTC (ঢাকা-পিছিয়ে ৬ঘ)
 *     • pages.js gallery + resource-detail — পার্স-as-হোস্ট-লোকাল (প্রোডাকশনে ভুল)
 *     • main.js/live.js ক্লায়েন্ট — পার্স-as-ক্লায়েন্ট-লোকাল (বাংলাদেশে ভুল)
 *
 * চুক্তি (এখন থেকে সাইট-ওয়াইড একটাই):
 *   ১. পার্স: DB-নেম-লেস "YYYY-MM-DD[ T]HH:MM(:SS)" = সর্বদা UTC ('Z' জুড়ে পার্স)
 *      তারিখ-মাত্র "YYYY-MM-DD" = ক্যালেন্ডার-তারিখ (event_date) — T00:00:00Z পিন
 *      টাইমজোন-বহনকারী (Z/±hh:mm) বা অন্য-ফরম্যাট = new Date সরাসরি
 *   ২. প্রদর্শন: Asia/Dhaka (UTC+6, DST-বিহীন) — getUTC-* কৌশল (Intl-নিরপেক্ষ)
 *
 * ব্যবহার-নোট (PLANS-চুক্তি): স্কিমা-বদল হলে এই-হেল্পার + main.js/_pTs +
 * live.js/_pTs — তিন-জায়গাই একসাথে আপডেট (ক্লায়েন্টে ছোট ইনলাইন-কপি, নেটওয়ার্ক-কস্ট-শূন্য)।
 */

// Asia/Dhaka = UTC+6 (Bangladesh Standard Time — DST নেই)
const SITE_TZ_OFF_MIN = 360;

const NAIVE_RE   = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;
const DATEONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** DB-স্ট্রিং → Date | null (উপরের চুক্তি-১ অনুযায়ী) */
function parseDbDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (DATEONLY_RE.test(s)) return new Date(s + 'T00:00:00Z');
  if (NAIVE_RE.test(s))    return new Date(s.replace(' ', 'T') + 'Z');
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** epoch-ms → Date | null */
function parseDbMs(ms) {
  const n = Number(ms);
  return Number.isFinite(n) && n > 0 ? new Date(n) : null;
}

/** Date → Asia/Dhaka ওয়াল-ক্লক অংশ (getUTC-* কৌশল) */
function dhakaParts(d) {
  const t = new Date(d.getTime() + SITE_TZ_OFF_MIN * 60000);
  return {
    y: t.getUTCFullYear(), mo: t.getUTCMonth(), day: t.getUTCDate(),
    h: t.getUTCHours(), mi: t.getUTCMinutes(), s: t.getUTCSeconds()
  };
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

/** ইংরেজি-অঙ্ক → বাংলা-অঙ্ক (স্ট্রিং-সাধারণ) */
function bnNum(v) {
  return String(v).replace(/\d/g, (c) => BN_DIGITS[+c] || c);
}

function pad2(n) { return String(n).padStart(2, '0'); }

/** "১৭ সেপ্টেম্বর, ২০২৬" — Asia/Dhaka ক্যালেন্ডার-তারিখ (অক্ষত-রূপ: resource-detail/gallery) */
function bnDate(raw) {
  const d = raw instanceof Date ? raw : parseDbDate(raw);
  if (!d || isNaN(d.getTime())) return '';
  const p = dhakaParts(d);
  return bnNum(p.day) + ' ' + BN_MONTHS[p.mo] + ', ' + bnNum(p.y);
}

/** "১৭ সেপ্টেম্বর, ২০২৬ · ১০:১৫" — টুলটিপ/অ্যাডমিন-প্যানেলের জন্য সময়-সহ */
function bnDateTime(raw) {
  const d = raw instanceof Date ? raw : parseDbDate(raw);
  if (!d || isNaN(d.getTime())) return '';
  const p = dhakaParts(d);
  return bnNum(p.day) + ' ' + BN_MONTHS[p.mo] + ', ' + bnNum(p.y) + ' · ' + bnNum(pad2(p.h)) + ':' + bnNum(pad2(p.mi));
}

module.exports = {
  SITE_TZ_OFF_MIN,
  parseDbDate, parseDbMs, dhakaParts,
  bnNum, BN_DIGITS, BN_MONTHS,
  bnDate, bnDateTime
};
