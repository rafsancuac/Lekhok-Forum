#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   guard-design-system.js — ডিজাইন-সিস্টেম গার্ড (সেশন ১০৫)
   ──────────────────────────────────────────────────────────────────────────
   রুল: পোস্ট-কার্ড/কমেন্ট/রিঅ্যাকশন/শেয়ার/মেসেঞ্জার-বাবলের মার্কআপ কেবল
   views/shared/ থেকে রেন্ডার হবে। যেকোনো ভিউতে ম্যানুয়ালি লাইক-বাটন,
   কমেন্ট-বক্স, ৩-ডট-মেনু বা শেয়ার-মেনু লিখলে এই গার্ড ফেইল করবে।

   চালানো: node scripts/guard-design-system.js   (বা npm run guard:design)
   CI/ক্রন-এজেন্ট: প্রতি QA-রাউন্ডে এই স্ক্রিপ্ট গ্রিন না-হলে ডিপ্লয়/কমিট নয়।
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VIEWS = path.join(ROOT, 'views');

/* ক্যানোনিকাল প্যাটার্ন — শুধু views/shared/** এ (এবং compat-শিম allowlist-এ) থাকতে পারে */
const CANONICAL_MARKUP = [
  { re: /class="[^"]*\breaction-picker\b/, label: 'রিঅ্যাকশন-পিকার (PostFooterActions)' },
  { re: /class="[^"]*\bshare-menu\b/, label: 'শেয়ার-মেনু (PostFooterActions — ৩ ফিক্সড অ্যাকশন)' },
  { re: /class="[^"]*\breaction-summary\b/, label: 'কাউন্টার-বার (PostFooterActions)' },
  { re: /class="[^"]*\bbubble-actions\b/, label: 'মেসেঞ্জার অ্যাকশন-রেল (MessengerBubble)' },
  { re: /class="[^"]*\bbubble-react-menu\b/, label: 'মেসেঞ্জার রিঅ্যাক্ট-প্যালেট (MessengerBubble)' },
  { re: /class="[^"]*\bcmt-palette\b/, label: 'কমেন্ট হোভার-প্যালেট (CommentItem)' },
  { re: /class="[^"]*\bcmt-badge\b/, label: 'কমেন্ট কর্নার-ব্যাজ (CommentItem)' },
  { re: /data-cmt-(edit|delete|react)=/, label: 'কমেন্ট এডিট/ডিলিট/রিঅ্যাক্ট-হুক (CommentItem)' },
  { re: /data-rx-open=/, label: 'রিঅ্যাক্টরস-মডাল ট্রিগার (PostFooterActions)' }
];

/* যেকোনো ভিউতে নিষিদ্ধ — লিগ্যাসি ম্যানুয়াল-ইমপ্লিমেন্টেশন প্যাটার্ন */
const FORBIDDEN_ANYWHERE = [
  { re: /togglePost3Dot/, label: 'togglePost3Dot() — পুরনো inline ৩-ডট ইঞ্জিন (PostActionMenu ব্যবহার করুন)' },
  { re: /post-3dot-wrap|post-3dot-menu/, label: 'post-3dot-wrap/menu — পুরনো ম্যানুয়াল ৩-ডট (PostActionMenu)' },
  { re: /onclick="sharePost\(/, label: 'onclick sharePost() — পুরনো ম্যানুয়াল শেয়ার (PostFooterActions)' }
];

/* কম-স্ট্রিক্ট allowlist: delegate-শিমগুলো (মার্কআপ নেই, শুধু include-ফরওয়ার্ড) */
const SHIM_ALLOWLIST = new Set([
  'partials/actions-bar.ejs',
  'partials/post-menu.ejs',
  'partials/comment-composer.ejs',
  'partials/feed-cards.ejs',
  'partials/chat-bubbles.ejs'
]);

function walk(dir, out) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith('.ejs')) out.push(p);
  }
  return out;
}

let fail = 0;
const files = walk(VIEWS, []);
for (const file of files) {
  const rel = path.relative(VIEWS, file).split(path.sep).join('/');
  const src = fs.readFileSync(file, 'utf8');
  const isCanonical = rel.startsWith('shared/');
  const isShim = SHIM_ALLOWLIST.has(rel);

  for (const { re, label } of CANONICAL_MARKUP) {
    if (re.test(src) && !isCanonical && !isShim) {
      console.error(`✗ ${rel}: ক্যানোনিকাল-বহির্ভূত "${label}" — শুধু views/shared/ থেকে include করুন`);
      fail++;
    }
  }
  for (const { re, label } of FORBIDDEN_ANYWHERE) {
    if (re.test(src)) {
      console.error(`✗ ${rel}: নিষিদ্ধ "${label}"`);
      fail++;
    }
  }
  if (isShim) {
    // শিমে আসল মার্কআপ ফিরে এলে ধরে ফেলা (single-source ভাঙা প্রতিরোধ)
    const html = src.replace(/<%[\s\S]*?%>/g, '');
    if (html.trim().length > 40) {
      console.error(`✗ ${rel}: delegate-শিমে আসল-মার্কআপ ফিরে এসেছে — ক্যানোনিকালে সরান`);
      fail++;
    }
  }
}

/* header.ejs + layout.ejs চুক্তি: tokens.css সর্বশেষ লোড (href-ভিত্তিক — কমেন্ট-টেক্সট নয়) */
function checkHeadOrder(file) {
  const src = fs.readFileSync(file, 'utf8');
  const iShared = src.indexOf('href="/assets/css/shared.css');
  const iTokens = src.indexOf('href="/assets/css/tokens.css');
  const iHeadEnd = src.indexOf('</head>');
  if (!(iShared > -1 && iTokens > iShared && iHeadEnd > iTokens)) {
    console.error(`✗ ${path.relative(ROOT, file)}: shared.css + tokens.css head-শেষে এই ক্রমে থাকতে হবে (tokens সর্বশেষ)`);
    fail++;
  }
}
checkHeadOrder(path.join(VIEWS, 'partials', 'header.ejs'));
checkHeadOrder(path.join(VIEWS, 'layout.ejs'));

if (fail) {
  console.error(`\n[guard] ${fail}টি লঙ্ঘন — ডিজাইন-সিস্টেম ভাঙা (বিস্তারিত: lekhok-forum/PLANS.md "ডিজাইন-সিস্টেম" নোট)`);
  process.exit(1);
}
console.log('[guard] ডিজাইন-সিস্টেম গার্ড গ্রিন ✓ — সব পোস্ট/কমেন্ট/মেসেঞ্জার-মার্কআপ ক্যানোনিকাল (views/shared/)');
