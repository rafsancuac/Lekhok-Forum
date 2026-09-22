/**
 * helpers/content-view-helpers.js — ভিউ-হেল্পার ফ্যাক্টরি (সেশন ৩৩)
 * ═══════════════════════════════════════════════════════════════════════════
 * server.js-এ একবার require হয়ে প্রতি-রিকোয়েস্ট settings ম্যাপের সাথে বাঁধা হয়:
 *
 *   const { C, Cbr } = require('./helpers/content-view-helpers')(contentRegistry);
 *   res.locals.C   = (key) => C(key, settings);
 *   res.locals.Cbr = (key) => Cbr(key, settings);
 *
 * C(key, settings):
 *   1. settings['content_' + key] সেভ-হওয়া (রো-আছে) → অ্যাডমিনের লেখা মান
 *      (সেশন ২৩০: **ফাঁকা-সেভও সম্মানিত** — অ্যাডমিনে মুছলে সাইটেও মুছবে, WYSIWYG;
 *       আগে "ফাঁকা = ডিফল্ট-ফেরত" আচরণে অ্যাডমিনের মুছা কার্যবর্ষ/টেক্সট প্রতিদান
 *       ফিরে আসত — হোম-নেতৃত্বের '২০২০-২১ কার্যবর্ষ' বাগের মূল-কারণ)
 *   2. কখনো-সেভ-না-হওয়া কী (fresh install) → রেজিস্ট্রির DEFAULTS[key]
 *   3. অজানা key → '' (ভিউ কখনো ক্র্যাশ করবে না)
 *
 * Cbr = C + HTML-escape + \n → <br/>  (multiline textarea ফিল্ডের জন্য;
 *       কলার <%- Cbr(...) %> দিয়ে রেন্ডার করে — escape এখানেই হয়ে যায়)
 * ═══════════════════════════════════════════════════════════════════════════
 */
module.exports = function makeContentHelpers(registry) {
  const DEFAULTS = (registry && registry.DEFAULTS) || {};

  function C(key, settings) {
    const s = settings || {};
    const v = s['content_' + key];
    // সেশন ২৩০ (WYSIWYG-ফিক্স): রো সেভ-হলেই অ্যাডমিনের মান — ফাঁকা হলেও।
    // null/undefined (রো-নেই) হলেই কেবল ডিফল্ট-ফলব্যাক।
    if (v !== undefined && v !== null) return String(v);
    return (key in DEFAULTS) ? DEFAULTS[key] : '';
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function Cbr(key, settings) {
    return esc(C(key, settings)).replace(/\r?\n/g, '<br/>');
  }

  return { C, Cbr };
};
