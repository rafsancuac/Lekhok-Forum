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

/* ── সেশন ১১৩: ক্যানোনিকাল-লেয়ার হেক্স-স্ক্যান ─────────────────────────────────
   views/shared/** ও shared.css-এ হার্ডকোড-হেক্স-রঙ নিষিদ্ধ — শুধু var(--lf-*)।
   অনুমোদিত ব্যতিক্রম: rgba(শ্যাডো/ওভারলে) ও ডকুমেন্টেশন-কমেন্ট। */
const TOKEN_HEX = /#(?:006A4E|00523C|E8F5E9|1877F2|166FE5|EAF3FF|0084FF|F0F2F5|FFFFFF|E4E6EB|CED0D4|050505|65676B|8A8D91|FA3E3E|F7B125|E9710F)\b/gi;
const SHARED_CSS = path.join(ROOT, 'public', 'assets', 'css', 'shared.css');
function scanHex(file, label) {
  const src = fs.readFileSync(file, 'utf8');
  const rawLines = src.split('\n');
  // মাল্টি-লাইন EJS-কমেন্ট (<%# … %>) ব্ল্যাঙ্ক-করা — লাইন-নম্বর অক্ষত রেখে
  let inEjsComment = false;
  const lines = rawLines.map(line => {
    let out = '';
    let rest = line;
    while (rest.length) {
      if (!inEjsComment) {
        const open = rest.indexOf('<%#');
        if (open === -1) { out += rest; rest = ''; }
        else { out += rest.slice(0, open); rest = rest.slice(open + 3); inEjsComment = true; }
      } else {
        const close = rest.indexOf('%>');
        if (close === -1) { rest = ''; }
        else { rest = rest.slice(close + 2); inEjsComment = false; }
      }
    }
    return out.replace(/\/\*[\s\S]*?\*\//g, '');
  });
  lines.forEach((line, idx) => {
    TOKEN_HEX.lastIndex = 0;
    if (!TOKEN_HEX.test(line)) return;
    console.error(`✗ ${label}:${idx + 1}: হার্ডকোড-হেক্স "${rawLines[idx].trim().slice(0, 90)}" — var(--lf-*) ব্যবহার করুন`);
    fail++;
  });
}
(function hexScan() {
  function walkShared(dir, out) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walkShared(p, out);
      else if (p.endsWith('.ejs')) out.push(p);
    }
    return out;
  }
  walkShared(path.join(VIEWS, 'shared'), []).forEach(file => scanHex(file, path.relative(VIEWS, file)));
  scanHex(SHARED_CSS, 'public/assets/css/shared.css');
})();

/* ── সেশন ১২৪: tokens.css-হেক্স-স্ক্যান-গার্ড (session113-⑤ সমাপ্তি) ──────────
   চুক্তি: tokens.css = Single Source of Truth — এখানে হেক্স-লিটারাল কেবল
   `--lf-*` টোকেন-সংজ্ঞা-লাইনে অনুমোদিত। সিলেক্টর-বডি/লিগ্যাসি-রিম্যাপ-লাইনে
   হেক্স লিখলে গার্ড ফেইল — tokens.css যেন নতুন-রঙের ব্যাকডোর না হয়। */
(function tokensHexGuard() {
  const TOKENS_CSS = path.join(ROOT, 'public', 'assets', 'css', 'tokens.css');
  const HEX_ANY = /#[0-9a-fA-F]{3,8}\b/g;
  const raw124 = fs.readFileSync(TOKENS_CSS, 'utf8').split('\n');
  // ক্রস-লাইন /* */-কমেন্ট-সচেতন স্ট্রিপার — লাইন-নম্বর অক্ষত রেখে
  let inBlock124 = false;
  const lines124 = raw124.map(line => {
    let out = '';
    let rest = line;
    while (rest.length) {
      if (!inBlock124) {
        const open = rest.indexOf('/*');
        if (open === -1) { out += rest; rest = ''; }
        else {
          const close = rest.indexOf('*/', open + 2);
          if (close !== -1) { out += rest.slice(0, open); rest = rest.slice(close + 2); }
          else { out += rest.slice(0, open); rest = ''; inBlock124 = true; }
        }
      } else {
        const close = rest.indexOf('*/');
        if (close === -1) { rest = ''; }
        else { rest = rest.slice(close + 2); inBlock124 = false; }
      }
    }
    return out;
  });
  lines124.forEach((clean, idx) => {
    HEX_ANY.lastIndex = 0;
    if (!HEX_ANY.test(clean)) return;
    if (!/^\s*--lf-[a-z0-9-]+\s*:/.test(clean)) {
      console.error(`✗ public/assets/css/tokens.css:${idx + 1}: হেক্স কেবল --lf-* টোকেন-সংজ্ঞায় অনুমোদিত — "${raw124[idx].trim().slice(0, 90)}"`);
      fail++;
    }
  });
})();

/* ── সেশন ১২৫: tokens-হেক্স-র্যাচেট (session113-⑤-এর CSS-লেয়ার; session124-এর tokensHexGuard-এর পরিপূরক) ───────────────────────
   পুরো CSS-লেয়ারে হার্ডকোড-হেক্স বয়স্ক (legacy ~২.৮ হাজার) — এক-দিনে নিষিদ্ধ করা
   অবাস্তব। র্যাচেট-নীতি: per-ফাইল হেক্স-গণনা tokens-hex-baseline.json-এ ফ্রিজ —
   নতুন কোডে হেক্স **বাড়লে গার্ড ফেইল**; কমলে/সমান থাকলে গ্রিন। ধীরে-ধীরে রিফ্যাক্টরে
   baseline নেমে আসবে। tokens.css নিজে (সত্য-উৎস) স্ক্যান-বহির্ভূত।
   CLI: node scripts/guard-design-system.js --update-hex-baseline  → নতুন baseline লেখে */
const CSS_DIR = path.join(ROOT, 'public', 'assets', 'css');
const HEX_BASELINE = path.join(__dirname, 'tokens-hex-baseline.json');
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
function hexCounts() {
  const counts = {};
  for (const f of fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css'))) {
    if (f === 'tokens.css') continue; /* সত্য-উৎস — এখানেই হেক্সের বৈধ-ঘর */
    const src = fs.readFileSync(path.join(CSS_DIR, f), 'utf8');
    counts[f] = (src.match(HEX_RE) || []).length;
  }
  return counts;
}
if (process.argv.includes('--update-hex-baseline')) {
  fs.writeFileSync(HEX_BASELINE, JSON.stringify(hexCounts(), null, 2) + '\n');
  console.log('[guard] tokens-hex-baseline.json আপডেট ✓ (র্যাচেট-নতুন-ভিত্তি)');
} else if (fs.existsSync(HEX_BASELINE)) {
  const _base123 = JSON.parse(fs.readFileSync(HEX_BASELINE, 'utf8'));
  const _cur123 = hexCounts();
  for (const f of Object.keys(_cur123)) {
    const b = Object.prototype.hasOwnProperty.call(_base123, f) ? _base123[f] : 0;
    if (_cur123[f] > b) {
      console.error(`✗ tokens-hex-র্যাচেট: ${f} হেক্স-সংখ্যা ${b} → ${_cur123[f]} বেড়েছে — var(--lf-*) ব্যবহার করুন (হ্রাস করুন, বা সচেতন-হলে --update-hex-baseline)`);
      fail++;
    }
  }
}

if (fail) {
  console.error(`\n[guard] ${fail}টি লঙ্ঘন — ডিজাইন-সিস্টেম ভাঙা (বিস্তারিত: lekhok-forum/PLANS.md "ডিজাইন-সিস্টেম" নোট)`);
  process.exit(1);
}
console.log('[guard] ডিজাইন-সিস্টেম গার্ড গ্রিন ✓ — সব পোস্ট/কমেন্ট/মেসেঞ্জার-মার্কআপ ক্যানোনিকাল (views/shared/)');
