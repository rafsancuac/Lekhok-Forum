/* session144 — messenger.css tokens-র্যাচেট (patch139/patch136-রীতির ধারাবাহিকতা)
   নিয়ম: exact-value var()-ম্যাপ — ভিজ্যুয়াল-পরিবর্তন-শূন্য।
   টোকেন-সংজ্ঞা শুধু tokens.css-এ (guard চুক্তি); messenger.css-এ শুধু var(--lf-*) রেফারেন্স।
   বাউন্ডারি: প্রতি-হেক্স কেস-ইনসেনসিটিভ + (?![0-9a-fA-F]) — প্রেফিক্স-কলিশন-শূন্য
   (#fff-প্রিফিক্স #ffffff-কে ধরে না — lookahead)।
   নতুন-টোকেন ×৯: সব নাম tokens.css-এ defs-count=১ যাচাইকৃত (session143-গোটচা:
   warn-ink ভিন্ন-মানে-আগে-আছে → warn-ink-২-সাফিক্স; social-blue-hover ভিন্ন-মান → -২)।
   রান: node scripts/patch144-messenger-ratchet.js --apply   (প্রমাণ-মোড: --apply ছাড়া) */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');

/* hex(lowercase) → token-name (নতুন×৯ + বিদ্যমান-ম্যাপ — এক-উৎস; tokens.css-ব্লকও এখান থেকেই জেনারেট) */
const NEW_TOKENS = {
  '#e41e3f': 'danger-strong',        /* মেসেঞ্জার danger/জরুরি-অ্যাকশন লাল (×১৪) */
  '#fbe1e5': 'danger-strong-soft',   /* danger-strong-এর সফট হোভার-পট */
  '#166fe0': 'social-blue-hover-2',  /* accent-বাটন hover — social-blue-hover(#166FE5)-এর সৎ-আলাদা শেড */
  '#664d03': 'warn-ink-2',           /* mark-টেক্সট — warn-ink(#856404) ভিন্ন-মান → -২-সাফিক্স */
  '#fff7e6': 'warn-tint',            /* edit-bar অ্যাম্বার-টিন্ট */
  '#ffe58f': 'match-mark',           /* বাবল-টেক্সট ম্যাচ-হাইলাইট */
  '#ff9c6e': 'match-mark-active',    /* সক্রিয়-ম্যাচ কমলা */
  '#e3f0ff': 'social-blue-light-2',  /* outgoing-বাবলের হালকা-নীল টেক্সট (social-blue-light #EAF3FF ভিন্ন-মান) */
  '#e7f0fd': 'social-blue-tint'      /* unread-pulse/আইকন-পট নীল-টিন্ট */
};
const EXISTING_MAP = {
  '#ffffff': 'ui-surface', '#fff': 'ui-surface',
  '#65676b': 'text-secondary',
  '#1877f2': 'social-blue',
  '#050505': 'text-primary',
  '#e4e6eb': 'ui-border',
  '#f0f2f5': 'ui-canvas',
  '#31a24c': 'fb-green',
  '#0084ff': 'social-messenger',
  '#f2f2f2': 'fb-hover-2',
  '#eaf3ff': 'social-blue-light',
  '#ced0d4': 'ui-border-strong',
  '#b45309': 'soon-amber',
  '#166fe5': 'social-blue-hover',
  '#f7f8fa': 'fb-field',
  '#fff3cd': 'warn-soft',
  '#7c3aed': 'violet',
  '#fee2e2': 'danger-soft-2',
  '#b91c1c': 'danger-deep',
  '#94a3b8': 'slate-soft-5',
  '#bcc0c4': 'fb-placeholder',
  '#d8dadf': 'ad-line-2',
  '#444950': 'fb-text-2'
};
const MAP = { ...EXISTING_MAP, ...NEW_TOKENS };

const msgr = fs.readFileSync(path.join(ROOT, 'public/assets/css/messenger.css'), 'utf8');
const tokens = fs.readFileSync(path.join(ROOT, 'public/assets/css/tokens.css'), 'utf8');

/* ── ধাপ-১: tokens.css-ব্লক (idempotent — marker-চৌকিদার; শুধু --apply-এ লেখা —
   প্রমাণ-মোডে ফাইল-লেখা-শূন্য, patch139-শিক্ষার সংশোধন) ── */
const MARK = 'session144-messenger-ratchet';
if (APPLY && !tokens.includes(MARK)) {
  const defs = Object.entries(NEW_TOKENS).map(([hex, name]) => {
    let v = hex;
    if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return `  --lf-${name}: ${v.toUpperCase()};`;
  }).join('\n');
  const block = `\n/* ═════════ ${MARK} — messenger.css র্যাচেট (patch139-রীতি) ═════════════
   উৎপত্তি: messenger.css-অবশিষ্ট হেক্সের exact-value টোকেনাইজেশন — ভিজ্যুয়াল-পরিবর্তন-শূন্য।
   নামকরণ-সততা (session143-গোটচা-রীতি): ভিন্ন-মানের কাছাকাছি-শেডে -২-সাফিক্স
   (social-blue-hover-2, warn-ink-2, social-blue-light-2); per-নাম defs=১ যাচাইকৃত। ═════════════ */
:root:root {
${defs}
}
`;
  fs.writeFileSync(path.join(ROOT, 'public/assets/css/tokens.css'), tokens + block);
  console.log('[s144] tokens.css: session144-ব্লক যোগ হয়েছে (' + Object.keys(NEW_TOKENS).length + ' টোকেন)');
} else {
  console.log('[s144] tokens.css: ব্লক আগেই-আছে — স্কিপ');
}

/* ── ধাপ-২: messenger.css হেক্স→var() ── */
let out = msgr;
const report = [];
for (const [hex, name] of Object.entries(MAP)) {
  const re = new RegExp(hex.replace('#', '#') + '(?![0-9a-fA-F])', 'gi');
  const before = (out.match(re) || []).length;
  if (!before) { report.push(`  ~ ${hex} → ০ ম্যাচ (আগেই-ম্যাপড/অনুপস্থিত)`); continue; }
  out = out.replace(re, `var(--lf-${name})`);
  report.push(`  ✓ ${hex.toLowerCase()} → var(--lf-${name}) ×${before}`);
}
if (APPLY) fs.writeFileSync(path.join(ROOT, 'public/assets/css/messenger.css'), out);

/* ── ধাপ-৩: অবশিষ্ট-হিসাব ── */
const remain = (out.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
console.log(report.join('\n'));
console.log(`[s144] messenger.css হেক্স: ${(msgr.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length} → ${remain}`);
if (!APPLY) console.log('[s144] প্রমাণ-মোড — কোনো-লেখা-হয়নি (উপরের গণনা ইন-মেমরি)');
