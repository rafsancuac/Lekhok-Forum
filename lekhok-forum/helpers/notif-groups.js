/* ── সেশন ১৪৪: বিজ্ঞপ্তি-গ্রুপ-রেজিস্ট্রি (single-source) ─────────────────────
 * আগে G117/gKeyOf117 views/user/notifications.ejs-এর ভেতরেই সংজ্ঞায়িত ছিল;
 * session-১২১-র ঐচ্ছিক-বকেয়া "নোটিফ-ড্রপডাউন ?type= কুইক-লিংক" নেওয়ায় হেডারের
 * ড্রপডাউনেও একই কী/লেবেল দরকার — তাই রেজিস্ট্রি helpers-এ তোলা হলো (app.locals.notifGroups)।
 *
 * চুক্তি (পরের-এজেন্টের জন্য):
 *   • key      = /notifications?type=<key> ডিপ-লিংক-মান — routes/pages.js-এর
 *                server-side প্রি-ফিল্টার-হোয়াইটলিস্টের সাথে অবশ্যই সমলয় থাকতে হবে।
 *   • types    = কোনো-কোনো notification.type এই-গ্রুপে পড়বে ('other' = বাকি-সব, types: [])।
 *   • label/icon = presentation-শুধু (বাংলা-লেবেল + fa-আইকন)।
 *   • 'other' সবসময় শেষ-ঘরে — gKeyOf117-এর ফলব্যাক-ইনডেক্স এর উপর নির্ভরশীল।
 */
'use strict';

const G117 = [
  { key: 'mention',  label: 'ম্যানশন',         icon: 'fa-at',       types: ['mention'] },
  { key: 'reply',    label: 'উত্তর ও মন্তব্য', icon: 'fa-comments', types: ['reply', 'comment', 'answer_accepted'] },
  { key: 'reaction', label: 'প্রতিক্রিয়া',      icon: 'fa-heart',    types: ['like', 'reaction'] },
  { key: 'message',  label: 'বার্তা ও কল',    icon: 'fa-envelope', types: ['message', 'call'] },
  { key: 'follow',   label: 'অনুসরণ',         icon: 'fa-user-plus', types: ['follow'] },
  /* 'other' = বাকি-সব (moderation/complaint/birthday/system/...) */
  { key: 'other',    label: 'অন্যান্য',         icon: 'fa-bell',     types: [] }
];

function gKeyOf117(t) {
  return (G117.find(g => g.types.indexOf(t) !== -1) || G117[G117.length - 1]).key;
}

module.exports = { G117, gKeyOf117 };
