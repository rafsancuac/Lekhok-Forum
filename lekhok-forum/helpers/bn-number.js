'use strict';
/* helpers/bn-number.js — সেশন ১৪৭: সাইট-ওয়াইড বাংলা-সংখ্যা চুক্তি (কাউন্টার-ভাষা-বৈষম্য-স্থায়ী-সংস্কার)
 *
 * সমস্যা: পোস্ট-ফুটারের একই কাউন্টার-বারে একপাশে বাংলা অন্যপাশে ইংরেজি অঙ্ক দেখাত —
 *   · PostFooterActions.ejs সার্ভার-রেন্ডার: `<%= commentCount %>` কাঁচা ইংরেজি অঙ্ক
 *   · main.js রিঅ্যাকশন-ইঞ্জিন: `.rs-count` আপডেটও কাঁচা ইংরেজি (`textContent=o>0?o:""`)
 *   · comment-tools.js মন্তব্য-কাউন্টার: bnNum() — বাংলা (সেশন ১২)
 *   · আর ভিউ-ভেদে ছড়ানো অ্যাড-হক ল্যাম্বডা: bn99/bn102/bn110/bn140/_bn120/bnNum139…
 *     (একই এক-লাইনার প্রতি-ফাইলে কপি — কোনো single-source নেই)
 *
 * চুক্তি (এখন থেকে সাইট-ওয়াইড একটাই):
 *   ১. সার্ভার: helpers/bn-number.js → toBnNumber() — app.locals.toBn হিসেবে সব EJS-ভিউতে
 *   ২. ক্লায়েন্ট: layout.ejs-এ window.toBnNumber ইনলাইন-কপি (নেটওয়ার্ক-কস্ট-শূন্য,
 *      bn-date-র ৩-কপি-রীতির মতোই) — main.js/comment-tools.js এর উপর ডেলিগেট করে
 *   ৩. নতুন কোডে আর কখনো লোকাল `০১২৩৪৫৬৭৮৯'-ল্যাম্বডা লেখা নিষিদ্ধ — toBn/window.toBnNumber
 *
 * পার্স-ব্যাক (বাংলা→ইংরেজি) দরকার হলে (যেমন comment-tools optParseBn) সেটি পড়ার-জায়গার
 * নিজস্ব দায়িত্ব — এই হেল্পার শুধু প্রদর্শন-রূপান্তর দেয়।
 */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/**
 * যেকোনো সংখ্যা/স্ট্রিং-এর ইংরেজি ডিজিট (0-9) → প্রমিত বাংলা ডিজিট (০-৯)।
 * উদাহরণ: toBnNumber(51) → '৫১', toBnNumber(0) → '০',
 *         toBnNumber(null/undefined/'') → '০', toBnNumber('১২abc3') → '১২abc৩'
 * অ-ডিজিট অক্ষর অপরিবর্তিত থাকে; NaN/'NaN' → '০' (রেন্ডার-নিরাপদ)।
 */
function toBnNumber(num) {
  if (num === undefined || num === null || num === '') return '০';
  var s = String(num);
  if (s.trim() === '' || s.trim() === 'NaN') return '০';
  return s.replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
}

module.exports = { toBnNumber, BN_DIGITS };
