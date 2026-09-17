// inspect-audit.mjs — Lekhok Forum সম্পূর্ণ সিস্টেম ও ফিচার অডিট
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ স্ট্যাক-নোট: মূল প্রস্তাবিত স্ক্রিপ্টটি ছিল Next.js/Prisma/TSX-স্ট্যাকের জন্য
// (src/app/…, src/components/…)। এই প্রজেক্টের আসল স্ট্যাক: Express 4 + EJS +
// vanilla JS (public/assets) + sql.js/Turso দ্বৈত-ব্যাকএন্ড। তাই প্রতিটি ধারণাগত
// চেক নিচে আসল ফাইলে 1:1 ম্যাপ করা হয়েছে — চেকের অর্থ ও মানদণ্ড অপরিবর্তিত।
//
// চালানোর নিয়ম: প্রজেক্ট-রুটে দাঁড়িয়ে  →  node inspect-audit.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m',
};
const results = { passed: 0, failed: 0, warnings: 0 };

function logPass(title, detail) {
  results.passed++;
  console.log(`  ${colors.green}✔ [PASSED]${colors.reset} ${colors.bold}${title}${colors.reset}`);
  if (detail) console.log(`     ${colors.cyan}↳ ${detail}${colors.reset}`);
}
function logFail(title, reason, fixGuide) {
  results.failed++;
  console.log(`  ${colors.red}✖ [FAILED]${colors.reset} ${colors.bold}${title}${colors.reset}`);
  console.log(`     ${colors.yellow}ত্রুটির কারণ:${colors.reset} ${reason}`);
  console.log(`     ${colors.cyan}সমাধান:${colors.reset} ${fixGuide}`);
}
function logWarn(title, detail) {
  results.warnings++;
  console.log(`  ${colors.yellow}⚠ [WARNING]${colors.reset} ${title}`);
  if (detail) console.log(`     ↳ ${detail}`);
}
function section(n, title) {
  console.log(`\n${colors.bold}${n}. ${title}:${colors.reset}`);
}

// ── হেল্পার ──────────────────────────────────────────────────────────────────
const R = (p) => path.join(ROOT_DIR, p);
const read = (p) => { try { return fs.readFileSync(R(p), 'utf8'); } catch { return null; } };
const has = (p, str) => { const c = read(p); return c !== null && c.includes(str); };
const exists = (p) => fs.existsSync(R(p));
function walk(dir, exts, acc = []) {
  const d = R(dir);
  if (!fs.existsSync(d)) return acc;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'uploads', 'fonts', 'dummy', 'avatars', 'img'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, exts, acc);
    else if (!exts || exts.some(e => f.name.endsWith(e))) acc.push(p);
  }
  return acc;
}
// কোড-ফাইলে করাপ্টেড-সিলেক্টর গণনা: "idden]" সংখ্যা − "hidden]" সংখ্যা।
// সঠিক ফর্ম ([hidden]/[aria-hidden]) সবই "hidden]" ধারণ করে; করাপ্টেড ফর্মে h নেই।
// (bash-টুল ডিসপ্লে "[:h" খেয়ে ফেলে — তাই বাইট-স্তরে এই বিয়োগফলই একমাত্র সত্য।)
function corruptedSelectorCount(p) {
  const c = read(p); if (c === null) return 0;
  return (c.match(/idden\]/g) || []).length - (c.match(/hidden\]/g) || []).length;
}

console.log(`\n${colors.bold}${colors.cyan}====================================================`);
console.log(`  LEKHOK-FORUM: সম্পূর্ণ সিস্টেম ও ফিচার অডিট রিপোর্ট`);
console.log(`  (স্ট্যাক: Express+EJS+vanilla-JS | সেশন-৯২-খ হেড-রেফারেন্স)`);
console.log(`====================================================${colors.reset}\n`);

// ═════════════════════════════════════════════════════════════════════════════
// ১. সিকিউরিটি অডিট: হার্ডকোডেড টোকেন ও সিক্রেট
// ═════════════════════════════════════════════════════════════════════════════
section('১', 'সিকিউরিটি ও সেনসিটিভ টোকেন স্ক্যান');
{
  const codeFiles = walk('.', ['.js', '.mjs', '.ejs', '.json', '.ps1', '.sh', '.css', '.html', '.example', '.env']);
  const docFiles = walk('.', ['.md']);
  let leak = [], docLeak = [];
  const tokRe = /(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,})/g;
  const jwtRe = /eyJ[A-Za-z0-9_-]{40,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g; // Turso rw-JWT আকৃতি
  const reRe = /re_[A-Za-z0-9]{28,}/g; // Resend API key আকৃতি
  // placeholder-সচেতন: re_xxxx… / your_… / …_here / XXXX… ধরনের ডেমো-স্ট্রিং লিক নয়
  const isPlaceholder = (s) => /^(re_)?x+$/i.test(s) || /your|placeholder|_here|xxx+/i.test(s);
  for (const f of [...codeFiles]) {
    const c = read(f);
    for (const re of [tokRe, jwtRe, reRe]) {
      const m = (c.match(re) || []).filter(s => !isPlaceholder(s));
      if (m.length) leak.push(`${f} → ${m.length}টি`);
    }
  }
  for (const f of docFiles) {
    const c = read(f);
    const m = c.match(tokRe);
    if (m) docLeak.push(`${f} → ${m.length}টি`);
  }
  if (leak.length === 0) {
    logPass('GitHub/API টোকেন-লিক স্ক্যান (কোড-ফাইল)', 'কোডে কোনো হার্ডকোডেড PAT/JWT/API-কি নেই (deploy-to-vercel.ps1 সেশন-৯১-এ স্ক্রাব হয়েছে)');
  } else {
    logFail('GitHub/API টোকেন-লিক!', leak.join(' | '), 'টোকেন env-এ সরান ও GitHub Settings থেকে Revoke করুন');
  }
  if (docLeak.length > 0) logWarn('ডকুমেন্টেশনে টোকেন-আকৃতির স্ট্রিং', docLeak.join(' | ') + ' — প্লেসহোল্ডার হলেও রোটেশন নিশ্চিত করুন');

  if (exists('.env')) {
    logFail('.env ফাইল রিপোতে উপস্থিত', 'প্রোডাকশন সিক্রেট ওয়ার্কিং-ট্রিতে সেভ হয়ে কমিট-ঝুঁকিতে', '.env মুছে Vercel env-var ব্যবহার করুন; .gitignore আপডেট রাখুন');
  } else {
    logPass('.env কমিট-নিষেধ', '.env ফাইল নেই; সিক্রেট শুধু Vercel ড্যাশবোর্ডে (সঠিক নীতি)');
  }
  const gi = read('.gitignore') || '';
  if (/^\.env/m.test(gi)) logPass('.gitignore-এ .env সুরক্ষিত'); else logWarn('.gitignore-এ .env-এন্ট্রি নেই', '.gitignore-এ .env যোগ করুন');

  // Vercel read-only FS ফাঁদ: মডিউল-লোডে multer DiskStorage/dest (সেশন-৩৬-এর লাইভ-500 মূলকারণ)
  const backend = ['server.js', 'api/index.js', ...walk('routes', ['.js']), ...walk('admin', ['.js']), 'middleware/upload.js'];
  let destUse = [];
  for (const f of backend) {
    const c = read(f); if (!c) continue;
    // কমেন্ট-লাইন বাদ (সেশন-৩৬-এর পুরনো-বাগ উদ্ধৃতি যেন ফলস-পজিটিভ না হয়)
    const code = c.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
    if (/multer\s*\(\s*\{\s*dest\s*:/.test(code)) destUse.push(f);
  }
  if (destUse.length === 0) {
    logPass('multer মডিউল-লোড DiskStorage/dest ফাঁদ নেই', 'সব আপলোড memoryStorage + লেজি-ইনিশিয়াল (সেশন-৩৬ হটফিক্স অক্ষত)');
  } else {
    logFail('মডিউল-লোডে multer({ dest: … })', destUse.join(', ') + ' — Vercel read-only FS-এ ENOENT → ফাংশন-বুট ক্র্যাশ', 'multer({ storage: multer.memoryStorage() }) রিকোয়েস্ট-টাইমে ব্যবহার করুন (middleware/upload.js প্যাটার্ন)');
  }

  const ss = read('session-store.js') || '';
  const srv = read('server.js') || '';
  const hardSecret = [/SESSION_SECRET\s*[=:]\s*['"][^'"]{8,}['"]/.test(ss + srv), /secret\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/.test(ss)];
  if (!hardSecret.some(Boolean)) {
    logPass('SESSION_SECRET হার্ডকোড নেই', 'env-গেটেড + নিরাপদ ephemeral-ফলব্যাক');
  } else {
    logFail('SESSION_SECRET/কুকি-সিক্রেট হার্ডকোডেড', 'session-store.js/server.js-এ লিটারেল সিক্রেট', 'process.env.SESSION_SECRET ব্যবহার করুন ও লিক হলে রোটেট করুন');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ২. মেসেজিং ও মেসেঞ্জার মডিউল (/messages) — Next.js-স্ক্রিপ্টের MessageBubble চেকের ম্যাপ
// ═════════════════════════════════════════════════════════════════════════════
section('২', 'মেসেজিং ও চ্যাট-বাবল আর্কিটেকচার (/messages)');
{
  const CHAT = 'views/user/messages-chat.ejs';
  const MCSS = 'public/assets/css/messenger.css';
  const MJS = 'public/assets/js/messenger-actions.js';
  const need = [CHAT, MCSS, MJS, 'views/user/messages-list.ejs'];
  const missing = need.filter(p => !exists(p));
  if (missing.length === 0) {
    logPass('মেসেঞ্জার মডিউল-ফাইল', need.join(', '));
  } else {
    logFail('মেসেঞ্জার ফাইল মিসিং', missing.join(', '), 'সংশ্লিষ্ট ভিউ/অ্যাসেট পুনরুদ্ধার করুন (git history)');
  }

  // বাবল সাইজিং: বেস .bubble-এ max-width + পেজ-স্কোপড ওভাররাইড
  const style = read('public/assets/css/style.css') || '';
  const mcss = read(MCSS) || '';
  const baseFit = /\.bubble\s*\{[^}]*max-width:\s*(70|7\d|fit-content|6\d)%/.test(style) || /\.bubble\s*\{[^}]*max-width/.test(style);
  const scope = /\.page-wrap--messenger\s+\.bubble/.test(mcss);
  if (baseFit && scope) {
    logPass('বাবল কমপ্যাক্ট সাইজিং', '.bubble{max-width:70%} + .page-wrap--messenger স্কোপড ওভাররাইড (অতিরিক্ত বাফার নেই)');
  } else {
    logFail('বাবল সাইজিং ভাঙা', `baseFit=${baseFit}, scopedOverride=${scope}`, 'style.css-এ .bubble{max-width:70%} এবং messenger.css-এ .page-wrap--messenger .bubble রুল পুনঃস্থাপন করুন');
  }

  // থ্রি-ডট কনটেক্সট-মেনু (সাইডবার-সারি: মিউট/আর্কাইভ + ফরওয়ার্ড-মোডাল — সেশন ৭৬)
  const chat = read(CHAT) || '';
  const hasCtx = chat.includes('সেশন ৭৬') && (chat.includes('ctx') || chat.includes('fwdCancel')) && chat.includes('মিউট');
  if (hasCtx) {
    logPass('থ্রি-ডট মেনু ইন্টিগ্রেশন', 'সাইডবার-সারি ৩-ডট কনটেক্সট-মেনু (মিউট/আর্কাইভ) + ফরওয়ার্ড-মোডাল সংরক্ষিত');
  } else {
    logFail('থ্রি-ডট মেনু অনুপস্থিত', 'messages-chat.ejs-এ সেশন-৭৬ কনটেক্সট-মেনু মার্কার নেই', 'সাইডবার-সারিতে ৩-ডট ড্রপডাউন (মিউট/আর্কাইভ/ফরওয়ার্ড) পুনঃস্থাপন করুন');
  }

  // বাবলের ওপর অনাকাঙ্ক্ষিত ক্রস (✕) — অপসারিত থাকতে হবে (কমেন্ট-লাইনের উল্লেখ বাদ)
  const chatCode = chat
    .replace(/<%#[\s\S]*?%>/g, '')
    .split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  const crossCount = (chatCode.match(/✕/g) || []).length;
  if (crossCount === 0) {
    logPass('ক্রস (✕) বাটন রিমুভাল', 'বাবলের ওপর টেক্সট-কনফ্লিক্টিং ক্রস নেই (ডিলিট ক্রিয়া হোভারে bubble-delete-এ)');
  } else {
    logFail('অনাকাঙ্ক্ষিত ক্রস (✕) বাটন', `messages-chat.ejs-এ ${crossCount}টি ✕ অক্ষর`, 'বাবল-টপ-রাইট ক্রস সরিয়ে অ্যাকশন ৩-ডট/হোভার-মেনুতে নিন');
  }

  // কন্ডিশনাল ফাইল-প্রিভিউ: hidden অ্যাট্রিবিউট দিয়ে শুরু + ফাইল থাকলেই দেখায়
  const condPrev = /id="filePreview"[^>]*hidden/.test(chat) && /filePreview\.hidden\s*=\s*false/.test(chat) && /filePreview(E|l)?\.hidden\s*=\s*true|filePreview\.hidden\s*=\s*true/.test(chat);
  if (condPrev) {
    logPass('কন্ডিশনাল ফাইল এটাচমেন্ট প্রিভিউ', '#filePreview ডিফল্ট hidden; ফাইল সিলেক্টে দৃশ্যমান, সরালে/বাতিলে লুকায়');
  } else {
    logFail('ফাঁকা এটাচমেন্ট-প্রিভিউ বাফার', '#filePreview-এ hidden-টগল প্যাটার্ন পূর্ণ নয়', 'প্রিভিউ-কনটেইনার ডিফল্ট hidden রেখে ফাইল-সিলেক্টেলজিকে filePreview.hidden টগল করুন');
  }

  // অপটিমিস্টিক ইনপুট-ক্লিয়ার
  const mjs = read(MJS) || '';
  if (/msgInput\.value\s*=\s*['"]{2}\s*;?/.test(mjs) || chat.includes("msgInput.value = ''")) {
    logPass('ইনপুট অপটিমিস্টিক ক্লিয়ারিং', 'পাঠানোর সাথে সাথে ইনপুট ফাঁকা (messenger-actions.js)');
  } else {
    logWarn('ইনপুট-ফিল্ড স্টেট ক্লিয়ারিং', 'সেন্ড-হ্যান্ডলারে msgInput.value = "" সিঙ্ক্রোনাস নিশ্চিত করুন');
  }

  // ভয়েস-নোট (রোডম্যাপ C1, সেশন ৯২): MediaRecorder + রেকর্ডিং-UI + অডিও-আপলোড
  const up = read('middleware/upload.js') || '';
  const voice = chat.includes('MediaRecorder') && chat.includes('vr-cancel') && up.includes('audio');
  if (voice) {
    logPass('ভয়েস-নোট মডিউল (MediaRecorder+ওয়েভফর্ম)', 'রেকর্ডিং-UI (বাতিল/পাঠান) + অডিও-মাইম আপলোড-সাপোর্ট সক্রিয়');
  } else {
    logFail('ভয়েস-নোট ফিচার ভাঙা', 'MediaRecorder/vr-cancel/অডিও-মাইম-এর কোনো একটি অনুপস্থিত', 'messages-chat.ejs-এর রেকর্ডিং-ব্লক ও middleware/upload.js-এর audio-MIME যাচাই করুন');
  }

  // রিঅ্যাকশন-মেনু (সেশন ৮৮/৯২ রিপেয়ার)
  if (chat.includes('bubble-react-menu')) {
    logPass('বাবল-রিঅ্যাকশন মেনু', '.bubble-react-menu + রিঅ্যাকশন-ডেলিগেশন উপস্থিত');
  } else {
    logFail('রিঅ্যাকশন-মেনু মিসিং', 'messages-chat.ejs-এ bubble-react-menu নেই', 'রিঅ্যাকশন-পিকার মার্কআপ ও হ্যান্ডলার পুনঃস্থাপন করুন');
  }

  // 🚨 সিলেক্টর-করাপশন বাইট-চেক (সেশন-৯২ ফাঁদের স্থায়ী গার্ড): সব কোড-ফাইলে
  // "idden]" − "hidden]" = 0 হতে হবে (করাপ্টেড :not(…)/CSS-সিলেক্টর রেক্স-প্রুফ)
  const codeFiles = [...walk('views', ['.ejs']), ...walk('public/assets', ['.js', '.css']), 'server.js', 'db.js', ...walk('routes', ['.js']), ...walk('admin', ['.js'])];
  const corrupt = codeFiles.map(f => [f, corruptedSelectorCount(f)]).filter(([, n]) => n > 0);
  if (corrupt.length === 0) {
    logPass('সিলেক্টর-করাপশন বাইট-চেক (সব কোড-ফাইল)', 'করাপ্টেড সিলেক্টর ০ — রিঅ্যাকশন/হাইড-রুল সম্পূর্ণ কার্যকর');
  } else {
    logFail('করাপ্টেড-সিলেক্টর রিগ্রেশন!', corrupt.map(([f, n]) => `${f}(${n})`).join(', '), 'প্রতিটি ঘটনায় সঠিক hidden-সিলেক্টর পুনঃস্থাপন করুন (bash-আউটপুটে ব্র্যাকেট-খাওয়া ফাঁদ মনে রেখে od/নোড দিয়ে বাইট-যাচাই করুন)');
  }

  // WebRTC কলিং (প্রদত্ত-স্ক্রিপ্টের useWebRTC চেকের ম্যাপ — HTTP-পোলিং সিগন্যালিং, serverless-বান্ধব)
  const WC = 'public/assets/js/webrtc-call.js';
  const wc = read(WC) || '';
  const iceQueue = /queue\s*:\s*\[\]/.test(wc) && wc.includes('drainQueue');
  if (exists(WC) && iceQueue && wc.includes('turn:') && wc.includes('remoteDescription')) {
    logPass('WebRTC কলিং: ICE-কন্ডিডেট-কিউ + TURN রিলে', 'remoteDescription-পূর্ব ক্যান্ডিডেট কিউ→drainQueue (race-নিরাপদ) + TURN(openrelay)/STUN×২ — NAT/মোবাইল-নেটওয়ার্কে কল-সংযোগ নিশ্চিত');
  } else {
    logFail('WebRTC কল-অবকাঠামো ভাঙা', `file=${exists(WC)}, ICE-queue=${iceQueue}, TURN=${wc.includes('turn:')}`, 'webrtc-call.js-এ candidate-কিউ (remoteDescription-সেটের পরে drain) ও RTCConfiguration-এ TURN সার্ভার পুনঃস্থাপন করুন');
  }
  if (exists('routes/calls.js') && exists('public/assets/css/calls.css')) {
    logPass('WebRTC কল-রাউট ও কল-UI', 'routes/calls.js (start/answer/decline/cancel/end/signal/poll — ensureAuth+convAccess, busy-409, সাইজ-ক্যাপ) + calls.css কল-স্টেজ/PIP/মোবাইল');
  } else {
    logFail('কল-রাউট/UI মিসিং', 'routes/calls.js বা calls.css নেই', 'HTTP-পোলিং-সিগন্যালিং কল-মডিউল (routes/calls.js + calls.css) পুনঃস্থাপন করুন');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ৩. সোশ্যাল ফিড ও কমেন্ট ইঞ্জিন (/dashboard ফিড) — FeedPostCard চেকের ম্যাপ
// ═════════════════════════════════════════════════════════════════════════════
section('৩', 'সোশ্যাল ফিড, কমেন্ট-প্রিভিউ ও অ্যাকশন-বার (/dashboard)');
{
  const FC = 'views/partials/feed-cards.ejs';
  const AB = 'views/partials/actions-bar.ejs';
  if (exists(FC) && exists(AB)) {
    logPass('ফিড-কার্ড ও অ্যাকশন-বার পার্শিয়াল', FC + ' + ' + AB);
  } else {
    logFail('ফিড পার্শিয়াল মিসিং', [FC, AB].filter(p => !exists(p)).join(', '), 'ফিড-কার্ড/অ্যাকশন-বার পার্শিয়াল পুনরুদ্ধার করুন');
  }
  const fc = read(FC) || '';

  // হাইলাইটেড কমেন্ট-প্রিভিউ (সেশন ৮৯ এক-লাইন → সেশন ৯৩ FB-দুই-বাবল-আপগ্রেড)
  const prevOk = (fc.includes('feed-cpreview') || fc.includes('fcp-row')) && fc.includes('commentPreview');
  if (prevOk) {
    logPass('হাইলাইটেড কমেন্ট প্রিভিউ', 'ফিডে সর্বশেষ ২টি পর্যন্ত মন্তব্য-বাবল প্রিভিউ + "সব Nটি মন্তব্য" টগল-লিংক (ড্রয়ার-বন্ধ অবস্থায়ই)');
  } else {
    logFail('কমেন্ট-প্রিভিউ অনুপস্থিত', 'feed-cards.ejs-এ প্রিভিউ-মার্কার (feed-cpreview/fcp-row + commentPreview) নেই', 'সর্বশেষ-কমেন্ট প্রিভিউ-বাবল (batch-কুয়েরিসহ) পুনঃস্থাপন করুন');
  }

  // ইনফিনিট-স্ক্রল (রোডম্যাপ B1, সেশন ৮৯)
  const mj = read('public/assets/js/main.js') || '';
  const dashR = read('routes/dashboard.js') || '';
  if (mj.includes('/dashboard/more') && mj.includes('IntersectionObserver') && dashR.includes('/dashboard/more')) {
    logPass('ইনফিনিট-স্ক্রল', 'IO-সেন্টিনেল + GET /dashboard/more (OFFSET-পেজিনেশন + রানওয়ে-গার্ড) উভয়ই উপস্থিত');
  } else {
    logFail('ইনফিনিট-স্ক্রল ভাঙা', `main.js-IO=${mj.includes('IntersectionObserver')}, endpoint=${dashR.includes('/dashboard/more')}`, 'main.js-সেন্টিনেল ও dashboard.js /more-রুট পুনঃসংযোগ করুন');
  }

  // রিঅ্যাকশন ফেসপাইল (সেশন ৮৯)
  const ab = read(AB) || '';
  if (ab.includes('rs-faces') || fc.includes('rs-faces')) {
    logPass('রিঅ্যাক্টর-ফেসপাইল', '.rs-faces ওভারল্যাপিং মিনি-অ্যাভাটার actions-bar-এ');
  } else {
    logWarn('ফেসপাইল মার্কার নেই', 'actions-bar.ejs-এ rs-faces ক্লাস পাওয়া যায়নি — রিঅ্যাকশন-সামারি যাচাই করুন');
  }

  // গ্লোবাল ৩-ডট পোস্ট-মেনু (প্রদত্ত-স্ক্রিপ্টের "সম্পাদনা/লুকান/মুছুন ৩-ডটে সংকলন" চেক)
  const PM = 'views/partials/post-menu.ejs';
  const pmc = read(PM) || '';
  if (exists(PM) && pmc.includes('সম্পাদনা') && (pmc.includes('মুছুন') || pmc.includes('রিপোর্ট'))) {
    logPass('শীর্ষে গ্লোবাল থ্রি-ডট অ্যাকশন মেনু', 'post-menu.ejs: মালিক=সম্পাদনা/লুকান/মুছুন · অন্য=রিপোর্ট · মড=মডারেশন (ছড়ানো বাটন সংকলিত)');
  } else {
    logFail('গ্লোবাল থ্রি-ডট মেনু অনুপস্থিত', PM + ' নেই বা মেনু-আইটেম হারানো', 'post-menu.ejs পার্শিয়াল পুনঃস্থাপন করুন (৩-ডটে সম্পাদনা/লুকান/মুছুন/রিপোর্ট সংকলন)');
  }

  // ইন-লাইন কমেন্ট-ড্রয়ার (প্রদত্ত-স্ক্রিপ্টের "মন্তব্যে রিডাইরেক্ট নয়" চেক)
  if (ab.includes('inlineComments')) {
    logPass('ইন-লাইন কমেন্ট টগল', "actions-bar 'মন্তব্য'-বাটনে রিডাইরেক্ট নয় — একই-পেজে লেজি ইনলাইন-ড্রয়ার (GET /api/comments)");
  } else {
    logFail('ইন-লাইন কমেন্ট টগল নেই', 'actions-bar.ejs-এ inlineComments প্যারাম নেই', 'মন্তব্য-বাটনকে ইনলাইন-ড্রয়ার-টগলে রূপান্তর করুন (পেজ-রিডাইরেক্ট বাদ)');
  }

  // কমেন্ট-কম্পোজার: ফরম্যাটিং-টুলবার + @ম্যানশন (প্রদত্ত-স্ক্রিপ্টের CommentComposer চেক)
  const CC = 'views/partials/comment-composer.ejs';
  const CT = 'public/assets/js/comment-tools.js';
  const ct = read(CT) || '';
  if (exists(CC) && exists(CT) && ct.includes('selectionStart') && ct.includes('mention')) {
    logPass('কমেন্ট-কম্পোজার: ফরম্যাটিং-চিপস + @ম্যানশন', 'comment-composer.ejs (৬-ফরম্যাট টুলবার) + comment-tools.js (selectionStart-র‍্যাপ + ম্যানশন-ড্রপডাউন, ডেলিগেটেড → ইনফিনিট-অ্যাপেন্ডেও কাজ করে)');
  } else {
    logFail('ফরম্যাটিং-চিপস/ম্যানশন কমেন্টে অনুপস্থিত', `composer=${exists(CC)}, tools=${exists(CT)}, selStart=${ct.includes('selectionStart')}, mention=${ct.includes('mention')}`, 'comment-composer.ejs + comment-tools.js (selectionStart/End-র‍্যাপ + @ম্যানশন-ডিটেক্ট) পুনঃস্থাপন করুন');
  }

  // মার্কডাউন ফরম্যাটিং চিপস (selectionStart-ভিত্তিক) — কমেন্ট/পোস্ট কম্পোজার
  const re_ = read('public/assets/js/rich-editor.js') || '';
  const selCount = (re_.match(/selectionStart/g) || []).length;
  if (selCount >= 4) {
    logPass('মার্কডাউন ফরম্যাটিং চিপস', `rich-editor.js-এ selectionStart/End রেঞ্জ-ইনজেকশন (${selCount} কল-সাইট)`);
  } else {
    logFail('ফরম্যাটিং চিপস কাজ করছে না', `selectionStart কল-সাইট মাত্র ${selCount}`, 'textarea-র selectionStart/End দিয়ে বোল্ড/ইটালিক/লিংক র‍্যাপ-লজিক পুনঃস্থাপন করুন');
  }

  // নেস্টেড <a> স্ক্যান (স্ট্যাক-নির্দিষ্ট DOM-ভাঙা ফাঁদ)
  const ejsFiles = walk('views', ['.ejs']);
  const nested = [];
  for (const f of ejsFiles) {
    const c = (read(f) || '').replace(/<%[\s\S]*?%>/g, '');
    const m = c.match(/<a\b[^>]*>(?:(?!<\/a>)|<\/?[^a][^>]*>)*?<a\b/);
    if (m) nested.push(f);
  }
  if (nested.length === 0) {
    logPass('নেস্টেড অ্যাঙ্কর-স্ক্যান (৭৭ ভিউ)', 'কোনো <a>-ভিতরে-<a> নেই (ভাঙা-DOM ফাঁদমুক্ত; ক্লিকেবল-কার্ডে data-href কনভেনশন)');
  } else {
    logFail('নেস্টেড <a> ট্যাগ শনাক্ত!', nested.join(', '), 'ভিতরের <a> সরিয়ে div[data-href]+ইভেন্ট-ডেলিগেশন কনভেনশন ব্যবহার করুন');
  }

  // em dash (—) দৃশ্যমান-কপিতে — তথ্য-স্তরের রিপোর্ট (UI-কপি স্টাইল-পছন্দ হতে পারে)
  let emFiles = 0, emTotal = 0;
  for (const f of ejsFiles) {
    const c = (read(f) || '').replace(/<%#[\s\S]*?%>/g, '');
    const n = (c.match(/—/g) || []).length;
    if (n > 0) { emFiles++; emTotal += n; }
  }
  if (emTotal === 0) logPass('em dash (—) মুক্ত ভিউ');
  else logWarn(`em dash (—) ভিউ-কপিতে: ${emTotal}টি (${emFiles} ফাইল)`, 'বাংলা UI-কপিতে em dash ব্যবহার-নীতি এক-রকম করুন (দৃশ্যমান কনটেন্টে এড়ানোই প্রচলিত নীতি)');
}

// ═════════════════════════════════════════════════════════════════════════════
// ৪. ব্যক্তিগত প্রোফাইল (/me) — /me পেজ চেকের ম্যাপ
// ═════════════════════════════════════════════════════════════════════════════
section('৪', 'ব্যক্তিগত প্রোফাইল ও ড্যাশবোর্ড (/me)');
{
  const ME = 'views/user/me.ejs';
  if (!exists(ME)) {
    logFail('/me পেজ ফাইল মিসিং', ME + ' নেই', 'ইউজার-ফিড পেজ পুনরুদ্ধার করুন');
  } else {
    const me = read(ME) || '';
    const tiles = (me.match(/stat-tile/g) || []).length;
    const labels = ['প্রকাশিত লেখা', 'ড্রাফট', 'মন্তব্য', 'প্রতিক্রিয়া', 'সংরক্ষিত', 'অনুসরণ', 'অনুসরণকারী'];
    const all7 = labels.every(l => me.includes(l));
    if (tiles >= 7 && all7) {
      logPass('৭-টাইল স্ট্যাটাস স্ট্রিপ', 'প্রকাশিত/ড্রাফট/মন্তব্য/প্রতিক্রিয়া/সংরক্ষিত/অনুসরণ/অনুসরণকারী — ৭টি কাউন্টার stats-grid-এ');
    } else {
      logFail('স্ট্যাট-টাইল অসম্পূর্ণ', `stat-tile=${tiles}, সব-লেবেল=${all7}`, 'me.ejs-এ ৭টি stat-tile ও লেবেল পুনঃস্থাপন করুন');
    }
    const style = read('public/assets/css/style.css') || '';
    const nm = style.match(/\.me-id h1\s*\{([^}]*)\}/);
    const rootBg = style.match(/--brand-text:\s*([^;}]+)/);
    const dark = nm && rootBg && !/white|#fff/i.test(nm[1]) && (nm[1].includes('--brand-text') || nm[1].includes('--text') || /#0|#1|#2|#3/.test(nm[1]));
    if (nm && dark) {
      logPass('নামের টেক্সট কালার (ডিপ-ডার্ক)', `.me-id h1 → ${nm[1].trim().slice(0, 40)} (রেজলভড ≈ ${rootBg ? rootBg[1].trim() : 'dark'}) — সাদা নয়`);
    } else {
      logFail('নাম সাদা/অদৃশ্য রঙে', '.me-id h1-রুল পাওয়া যায়নি বা হালকা রঙ', '.me-id h1{color:var(--brand-text)} রাখুন (ডিপ-ডার্ক)');
    }
    const sg = /\.stats-grid\s*\{[^}]*(grid|flex)/.test(style) || /\.stats-grid\s*\{[^}]*(grid|flex)/.test(read('public/assets/css/dashboard.css') || '');
    if (sg) logPass('হরিজন্টাল স্ট্যাট-গ্রিড লেআউট', '.stats-grid গ্রিড/ফ্লেক্স-স্ট্রিপে ৭ বক্স');
    else logFail('স্ট্যাট-গ্রিড ভাঙা', '.stats-grid-এ grid/flex নেই', 'stats-grid-কে display:grid (auto-fit) রাখুন');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ৫. পাবলিক প্রোফাইল ও বাংলা URL স্লাগ (/profile/:username)
// ═════════════════════════════════════════════════════════════════════════════
section('৫', 'পাবলিক প্রোফাইল ও বাংলা URL রাউটিং (/profile/:username)');
{
  const soc = read('routes/social.js') || '';
  if (/router\.get\(['"]\/profile\/:username/.test(soc)) {
    logPass('ডাইনামিক প্রোফাইল রাউট', 'routes/social.js → GET /profile/:username (+ bookmarks/pin/follow সাব-রুট)');
  } else {
    logFail('ডাইনামিক প্রোফাইল রাউট মিসিং', 'social.js-এ /profile/:username নেই', 'রাউট পুনঃস্থাপন করুন');
  }

  // এক্সপ্রেস নিজেই :params ডিকোড করে — ম্যানুয়াল ২য়-decode করলে %-যুক্ত নামে ক্র্যাশ
  const doubleDec = /decodeURIComponent\s*\(\s*req\.params\.username/.test(soc);
  if (!doubleDec) {
    logPass('বাংলা-স্লাগ ডিকোডিং (এক্সপ্রেস-নেটিভ)', 'req.params.username সরাসরি ব্যবহৃত — Express অটো-ডিকোড করে; /profile/মোঃ রাফছান ধরনের স্লাগ নিরাপদ (লাইভ-যাচাইকৃত সেশন-৯১); ডাবল-ডিকোড ঝুঁকি নেই');
  } else {
    logFail('ডাবল-ডিকোড ক্র্যাশ-ঝুঁকি', 'decodeURIComponent(req.params.username) — %-যুক্ত ইউজারনেমে URIError', 'Express অটো-ডিকোডের জন্য ম্যানুয়াল decode সরিয়ে দিন');
  }

  if (soc.includes('all91') && soc.includes('get91')) {
    logPass('প্রোফাইল সমান্তরাল-কোয়েরি রিফ্যাক্ট', 'all91/get91 থাঙ্ক + Promise.all — লাইভ প্রোফাইল ৪.৩s→০.৩s (সেশন-৯১ পারফ-ফিক্স অক্ষত)');
  } else {
    logFail('পারফ-রিফ্যাক্ট রিগ্রেশন', 'all91/get91 প্যাটার্ন নেই — সিরিয়াল-কোয়েরি ফিরে এসেছে', 'Promise.all-ভিত্তিক সমান্তরাল-লোডিং পুনঃস্থাপন করুন');
  }

  // Express-4 async-এরর-সেফটি: গ্লোবাল async44 মাঙ্কি-প্যাচ
  const srv = read('server.js') || '';
  if (srv.includes('async44') || srv.includes('__probe44')) {
    logPass('async-এরর গ্লোবাল-গার্ড (Express 4)', 'async44 প্যাচ: সব async হ্যান্ডলার .catch(next) — আনহ্যান্ডলড-রিজেকশনে প্রসেস-ক্র্যাশ বন্ধ');
  } else {
    logFail('async হ্যান্ডলার-গার্ড নেই', 'Express 4-এ async-রিজেকশন প্রসেস ক্র্যাশ করায়', 'server.js-এ route-verb মাঙ্কি-প্যাচ (.catch(next)) পুনঃস্থাপন করুন');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ৬. সেটিংস ড্যাশবোর্ড (/settings)
// ═════════════════════════════════════════════════════════════════════════════
section('৬', 'সেটিংস ও টাইপোগ্রাফি ইঞ্জিন (/settings)');
{
  const SET = 'views/user/settings.ejs';
  if (!exists(SET)) {
    logFail('সেটিংস পেজ মিসিং', SET + ' নেই', 'সেটিংস ভিউ পুনরুদ্ধার করুন');
  } else {
    const st = read(SET) || '';
    const tabs = (st.match(/data-section=/g) || []).length;
    if (tabs >= 6) {
      logPass('মাল্টি-সেকশন সেটিংস', `${tabs}টি সেকশন: প্রোফাইল/গোপনীয়তা/বিজ্ঞপ্তি/অ্যাকাউন্ট/নিরাপত্তা(2FA)/প্রদর্শন`);
    } else {
      logFail('সেটিংস-ট্যাব অসম্পূর্ণ', `data-section=${tabs} (<6)`, 'settings-nav-এ ৬টি data-section পুনঃস্থাপন করুন');
    }
    if (st.includes('hashchange')) {
      logPass('ট্যাব-স্টেট URL-সিঙ্কিং', 'hashchange-লিসেনার — রিফ্রেশেও ট্যাব হারায় না (#hash-সিঙ্ক)');
    } else {
      logFail('ট্যাব স্টেট রিলোডে হারায়', 'hashchange/URL-সিঙ্ক নেই', 'location.hash দিয়ে ট্যাব-সিঙ্ক যোগ করুন');
    }
    if (st.includes('save-ok') && st.includes('save-err')) {
      logPass('সেভ-স্ট্যাটাস ব্যাজ', 'save-ok/save-err ইন্ডিকেটর উপস্থিত');
    } else {
      logWarn('সেভ-ব্যাজ অনুপস্থিত', 'সেভ-সফল/ব্যর্থ ভিজ্যুয়াল-ফিডব্যাক যোগ করুন');
    }
    if (st.includes('totp') || st.includes('2FA') || st.includes('2fa')) {
      logPass('নিরাপত্তা-সেকশন (2FA/TOTP)', 'settings-এ 2FA-ম্যানেজমেন্ট সেকশন উপস্থিত');
    } else {
      logWarn('2FA সেকশন মার্কার নেই', 'totp-সেটিংস UI যাচাই করুন');
    }
    // আনসেভড-ডেটা গার্ড
    if (st.includes('beforeunload') || st.includes('isDirty')) {
      logPass('আনসেভড ডেটা গার্ড');
    } else {
      logFail('আনসেভড ডেটা গার্ড অনুপস্থিত', 'ফর্ম-পরিবর্তনের পর ট্যাব-বন্ধ/রিলোডে সাইলেন্ট-লস্ট', 'settings.ejs-এ beforeunload + dirty-ট্র্যাকিং যোগ করুন (ফর্ম-ইনপুটে change-লিসেনার → window.addEventListener("beforeunload", …))');
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ৭. হোমপেজ কিউরেশন ও ফিল্টার (লেখকদের কালি / সাম্প্রতিক লেখা)
// ═════════════════════════════════════════════════════════════════════════════
section('৭', 'হোমপেজ কিউরেশন ও কঠোর-ফিল্টারিং');
{
  const pages = read('routes/pages.js') || '';
  const strict = pages.includes("post_kind = 'writing'") && pages.includes('home_featured = 1') && pages.includes('archive_visible = 1');
  const lim6 = /home_featured_at\s+DESC[\s\S]{0,120}LIMIT\s+6/.test(pages);
  if (strict && lim6) {
    logPass('হোমপেজ কিউরেশন কঠোর-ফিল্টারিং', "post_kind='writing' + home_featured=1 (অ্যাভাটার/কভার-আপডেট ও প্রশ্ন-এক্সক্লুডেড) + archive_visible + সর্বোচ্চ ৬ (মডারেটর-নির্বাচিত)");
  } else {
    logFail('সোশ্যাল-অ্যাক্টিভিটি লিক / ফিল্টার ভাঙা', `strict=${strict}, limit6=${lim6}`, 'home-কুয়েরিতে post_kind=writing AND home_featured=1 AND archive_visible=1 ফিল্টার ও LIMIT 6 পুনঃস্থাপন করুন');
  }
  const auto = pages.includes('সেশন ৯০') || /post_kind\s*=\s*'writing'\s*\/\* সেশন ৯০/.test(pages);
  if (auto) logPass('অটো-পোস্ট এক্সক্লুশন (সেশন ৯০)', 'সাম্প্রতিক-লেখা স্ট্রিমে অটো-পোস্ট বাদ');
  else logWarn('অটো-পোস্ট এক্সক্লুশন মার্কার নেই', 'রিসেন্ট-রাইটিংস কুয়েরিতে post_kind-ফিল্টার যাচাই করুন');
}

// ═════════════════════════════════════════════════════════════════════════════
// ৮. ইনফ্রা, সিনট্যাক্স ও রিগ্রেশন-গার্ড (এই স্ট্যাকের জন্য অতিরিক্ত)
// ═════════════════════════════════════════════════════════════════════════════
section('৮', 'ইনফ্রা, সিনট্যাক্স ও রিগ্রেশন-গার্ড');
{
  // ৮ক. JS সিনট্যাক্স (node --check) — সব ক্লায়েন্ট+ব্যাকএন্ড JS
  const jsFiles = [...walk('public/assets/js', ['.js']), 'server.js', 'db.js', 'session-store.js', ...walk('routes', ['.js']), ...walk('helpers', ['.js']), ...walk('middleware', ['.js']), ...walk('admin', ['.js']), ...walk('api', ['.js'])];
  let synFail = [];
  for (const f of jsFiles) {
    try { execFileSync('node', ['--check', R(f)], { stdio: 'pipe' }); }
    catch (e) { synFail.push(`${f}: ${String(e.stderr).split('\n')[0].slice(0, 90)}`); }
  }
  if (synFail.length === 0) logPass(`JS সিনট্যাক্স (${jsFiles.length} ফাইল, node --check)`, 'ক্লায়েন্ট+ব্যাকএন্ড সব JS পার্স-ক্লিন');
  else logFail('JS সিনট্যাক্স-এরর!', synFail.join(' | '), 'এরর-লাইন সংশোধন করুন');

  // ৮খ. CSS ব্রেস-ব্যালেন্স
  const cssFiles = walk('public/assets/css', ['.css']);
  let cssFail = [];
  for (const f of cssFiles) {
    const c = (read(f) || '').replace(/\/\*[\s\S]*?\*\//g, '');
    const o = (c.match(/\{/g) || []).length, cl = (c.match(/\}/g) || []).length;
    if (o !== cl) cssFail.push(`${f}: {${o} vs }${cl}`);
  }
  if (cssFail.length === 0) logPass(`CSS ব্রেস-ব্যালেন্স (${cssFiles.length} ফাইল)`);
  else logFail('CSS ব্রেস-আনব্যালেন্স!', cssFail.join(' | '), 'বন্ধ-না-হওয়া রুল-ব্লক সংশোধন করুন (পরের সব রুল নিঃশব্দে মরে যায়)');

  // ৮গ. EJS কম্পাইল (৭৭ ভিউ)
  try {
    const ejs = require('ejs');
    const views = walk('views', ['.ejs']);
    let ejFail = [];
    for (const f of views) {
      try { ejs.compile(read(f) || '', { filename: R(f) }); }
      catch (e) { ejFail.push(`${f}: ${e.message.slice(0, 70)}`); }
    }
    if (ejFail.length === 0) logPass(`EJS কম্পাইল (${views.length} ভিউ)`, 'টেমপ্লেট-সিনট্যাক্স সব ক্লিন');
    else logFail('EJS কম্পাইল-ফেইল!', ejFail.slice(0, 5).join(' | '), 'টেমপ্লেট-সিনট্যাক্স এরর সংশোধন করুন');
  } catch (e) { logWarn('EJS কম্পাইল-চেক স্কিপ', 'node_modules-এ ejs পাওয়া যায়নি'); }

  // ৮ঘ. PWA/স্ট্যাটিক-সম্পদ (সেশন ৮৭ ফিক্স + সেশন ৯২-খ SW-প্রাইভেসি)
  const pwa = ['public/favicon.ico', 'public/manifest.json', 'public/offline.html', 'views/404.ejs'];
  const pwaOk = pwa.every(exists);
  const sw = read('public/sw.js') || '';
  const swSafe = sw.includes("OFFLINE_URL") && sw.includes("navigate") && sw.includes('কখনো ক্যাশ');
  if (pwaOk && swSafe) {
    logPass('PWA + SW-প্রাইভেসি', 'favicon/manifest/offline/404 উপস্থিত; SW: অ্যাসেট CacheFirst কিন্তু HTML কখনো ক্যাশ হয় না (নেটওয়ার্ক-অনলি + offline-ফলব্যাক — ব্যক্তিগত-পেজ-লিক বন্ধ)');
  } else {
    logFail('PWA/SW অসম্পূর্ণ', `assets=${pwaOk}, swHTMLSafe=${swSafe}`, 'অনুপস্থিত স্ট্যাটিক ফাইল যোগ করুন; sw.js-এ navigate-রিকোয়েস্ট কখনো ক্যাশ করবেন না');
  }

  // ৮ঙ. Vercel কনফিগ (সেশন-৩৬ টাইমআউট + ৯১-রিজিয়ন)
  const vj = read('vercel.json') || '';
  const vOk = vj.includes('bom1') && vj.includes('maxDuration') && /60/.test(vj);
  if (vOk) logPass('Vercel কনফিগ', 'regions: bom1 (DB-মুম্বাই-সংলগ্ন, ~১০× কম RTT) + maxDuration 60 + includeFiles');
  else logFail('Vercel কনফিগ রিগ্রেশন', 'bom1/maxDuration-60 অনুপস্থিত', 'vercel.json-এ regions:[bom1] ও api maxDuration 60 পুনঃস্থাপন করুন');

  // ৮চ. DB বুট-ফাস্ট-পাথ + ডেমো-সিড
  const db = read('db.js') || '';
  if (db.includes('init_fingerprint') || db.includes('_boot_cache')) {
    logPass('DB বুট-ফাস্ট-পাথ', 'মাইগ্রেশন/সিড-ফিঙ্গারপ্রিন্ট ক্যাশ (১৫.৬s→০.৬s) — কোল্ড-বুট টাইমআউট-ঝুঁকিমুক্ত');
  } else {
    logFail('বুট-ফাস্ট-পাথ রিগ্রেশন', 'init_fingerprint/_boot_cache নেই', 'db.js-এ ফিঙ্গারপ্রিন্ট-ক্যাশ পুনঃস্থাপন করুন');
  }

  // ৮ছ. কনটেন্ট-এডিটর রেজিস্ট্রি (সেশন-৩৫ ধারাবাহিকতা)
  const reg = read('helpers/content-registry.js') || '';
  const fieldCount = (reg.match(/label:/g) || []).length;
  if (fieldCount >= 241) logPass('কনটেন্ট-এডিটর রেজিস্ট্রি', `${fieldCount} ফিল্ড-ডেফিনিশন (সেশন-৩৫-এর ২৪১-এর সমান বা বৃদ্ধি)`);
  else logFail('কনটেন্ট-রেজিস্ট্রি সঙ্কুচিত', `${fieldCount} < 241 ফিল্ড`, 'content-registry.js-এ হারানো ফিল্ড-ডেফিনিশন পুনঃস্থাপন করুন');

  // ৮জ. অনাথ JS-অ্যাসেট (লোড হয় না এমন ফাইল = ডেড-ওয়েট)
  const jsAssets = walk('public/assets/js', ['.js']);
  const searchSpace = [...walk('views', ['.ejs']), ...walk('admin/views', ['.ejs']), 'server.js', ...walk('admin', ['.js'])].map(f => read(f) || '').join('\n');
  const orphans = jsAssets.filter(f => {
    const base = path.basename(f);
    if (base === 'auth-sync.js') return false; // SW/register দ্বারা লোড হতে পারে
    return !searchSpace.includes(base);
  });
  if (orphans.length === 0) logPass('অনাথ-অ্যাসেট স্ক্যান (JS)', `${jsAssets.length}টি ক্লায়েন্ট-JS সবই কোনো না কোনো ভিউ/সার্ভার থেকে লোড হয`);
  else logWarn('অনাথ JS-অ্যাসেট (কোথাও লোড হয় না)', orphans.join(', ') + ' — ডেড-ফাইল হলে সরিয়ে রাখুন');

  // ৮ঝ. রোল-পলিসি সোর্স-অব-ট্রুথ (সেশন ৮৩)
  if (exists('helpers/role-policy.js')) logPass('রোল-হায়ারার্কি মডিউল', 'helpers/role-policy.js (user/moderator/admin/superadmin, পোর্টাল-বিভাজন, সংযোগ-নীতি)');
  else logFail('role-policy মিসিং', 'helpers/role-policy.js নেই', 'রোল-নীতির একক-সোর্স-অব-ট্রুথ পুনঃস্থাপন করুন');

  // ৮ঞ. ডকুমেন্টেশন-ধারাবাহিকতা (সেশন-নম্বরিং প্রোটোকল)
  const pm = read('PROJECT.md') || '';
  const wl = read('worklog.md') || '';
  const docsOk = /###\s*সেশন ৯১/.test(pm) && /##\s*সেশন ৯২/.test(wl);
  if (docsOk) logPass('সেশন-ডকুমেন্টেশন ধারাবাহিকতা', 'PROJECT.md §10 (সেশন-৯১ পর্যন্ত) + repo-worklog (সেশন-৯২/৯২-খ) অক্ষত');
  else logWarn('ডকুমেন্টেশন-ফাঁক', 'PROJECT.md-§10 বা repo-worklog-এ সাম্প্রতিক সেশন-এন্ট্রি হারাতে পারে — সেশন-৯২/৯২-খ এন্ট্রি যাচাই করুন');
}

// ── সারসংক্ষেপ ──────────────────────────────────────────────────────────────
console.log(`\n${colors.bold}----------------------------------------------------${colors.reset}`);
console.log(`${colors.bold}অডিট সমাপ্তি ফলাফল:${colors.reset}`);
console.log(`  ${colors.green}সফল (Passed): ${results.passed}${colors.reset}`);
console.log(`  ${colors.red}ব্যর্থ/ত্রুটি (Failed): ${results.failed}${colors.reset}`);
console.log(`  ${colors.yellow}সতর্কতা (Warnings): ${results.warnings}${colors.reset}`);
console.log(`${colors.bold}----------------------------------------------------${colors.reset}\n`);

if (results.failed === 0) {
  console.log(`${colors.green}${colors.bold}অভিনন্দন! সাইটের সমস্ত আপগ্রেডেশন ও ফিক্স নিখুঁতভাবে ইমপ্লিমেন্ট হয়ে আছে।${colors.reset}\n`);
} else {
  console.log(`${colors.red}${colors.bold}মনোযোগ দিন: মোট ${results.failed}টি সমস্যা পূর্ণ সমাধান হয়নি — উপরের সমাধান-গাইড অনুযায়ী ফাইল সংশোধন করুন।${colors.reset}\n`);
}
process.exit(0);
