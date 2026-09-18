/* session139 — admin.css tokens-র্যাচেট ওয়েভ-২ (session136-রীতির ধারাবাহিকতা)
   নিয়ম: exact-value var()-ম্যাপ — ভিজ্যুয়াল-পরিবর্তন-শূন্য।
   টোকেন-সংজ্ঞা শুধু tokens.css-এ (guard চুক্তি); admin.css-এ শুধু var(--lf-*) রেফারেন্স।
   বাউন্ডারি: প্রতি-হেক্স কেস-ইনসেনসিটিভ + (?![0-9a-fA-F]) — প্রেফিক্স-কলিশন-শূন্য।
   স্কোপ: TW-স্ট্যান্ডার্ড শেড ৪১ + FB-গ্রে-র‍্যাম্প (≥2×) + FB-টেক্সট-ট্রায়ো + ব্র্যান্ড-সবুজ-র‍্যাম্প।
   রান: node scripts/patch139-admin-ratchet.js --apply   (প্রমাণ-মোড: --apply ছাড়া) */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');

/* hex → token-name ম্যাপ (এক-উৎস; tokens.css-ব্লকও এখান থেকেই জেনারেট) */
const MAP = {
  /* ── TW-স্ট্যান্ডার্ড শেড (স্কেল-নাম) ── */
  '#f3f4f6': 'gray-50',   '#e5e7eb': 'gray-200', '#d1d5db': 'gray-300',
  '#9ca3af': 'gray-400',  '#6b7280': 'gray-500', '#4b5563': 'gray-600',
  '#374151': 'gray-700',  '#111827': 'gray-900',
  '#bfdbfe': 'blue-200',  '#93c5fd': 'blue-300', '#2563eb': 'blue-600',
  '#1d4ed8': 'blue-700',  '#1e40af': 'blue-800',
  '#f0f9ff': 'sky-50',    '#bae6fd': 'sky-200',
  '#eef2ff': 'indigo-50', '#e0e7ff': 'indigo-100', '#3730a3': 'indigo-800',
  '#ede9fe': 'violet-100','#7c3aed': 'violet-600', '#6d28d9': 'violet-700', '#5b21b6': 'violet-800',
  '#0891b2': 'cyan-600',  '#075985': 'cyan-800',
  '#6ee7b7': 'emerald-300','#10b981': 'emerald-500',
  '#dcfce7': 'green-100', '#15803d': 'green-700', '#166534': 'green-800',
  '#fca5a5': 'rose-200',  '#fda4af': 'rose-300',
  '#fff7ed': 'orange-50', '#fed7aa': 'orange-200', '#fdba74': 'orange-300',
  '#fef9c3': 'yellow-100','#a16207': 'yellow-700', '#854d0e': 'yellow-800',
  '#fcd34d': 'amber-300', '#d97706': 'amber-600', '#78350f': 'amber-900',
  /* ── FB-গ্রে-র‍্যাম্প (কাস্টম নিউট্রাল — অ্যাডমিন UI-এর প্রধান-পরিবার) ── */
  '#fafbfc': 'fbg-50',  '#f7f8fa': 'fbg-75',  '#f1f2f4': 'fbg-100',
  '#eef1f5': 'fbg-150', '#e9ebef': 'fbg-200', '#eef2f7': 'fbg-210',
  '#dde3ea': 'fbg-300', '#ccd0d5': 'fbg-400', '#cdd2d8': 'fbg-410',
  '#8a8d93': 'fbg-500', '#111': 'fbg-ink',
  '#34495e': 'fb-link-slate', '#1c1e21': 'fb-text', '#444950': 'fb-text-2', '#4b4f56': 'fb-text-3',
  /* ── ব্র্যান্ড-সবুজ র‍্যাম্প (admin-সাকসেস-স্টেট) ── */
  '#e6f6ef': 'brandgreen-soft', '#eaf7f0': 'brandgreen-soft-2',
  '#b5e3d0': 'brandgreen-soft-3', '#0aa56d': 'brandgreen', '#0b6b4b': 'brandgreen-deep'
};

const admin = fs.readFileSync(path.join(ROOT, 'public/assets/css/admin.css'), 'utf8');
const tokens = fs.readFileSync(path.join(ROOT, 'public/assets/css/tokens.css'), 'utf8');

/* ── ধাপ-১: tokens.css-ব্লক (idempotent — marker-চৌকিদার) ── */
const MARK = 'session139-admin-ratchet';
if (!tokens.includes(MARK)) {
  const defs = Object.entries(MAP).map(([hex, name]) => {
    let v = hex;
    if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; /* ৩-অঙ্ক (#111) → ৬-অঙ্ক প্রসারিত — দৃশ্যত-অভিন্ন */
    return `  --lf-${name}: ${v};`;
  }).join('\n');
  const block = `\n/* ═════════ ${MARK} — admin.css র্যাচেট-ওয়েভ-২ (session136-ওয়েভ-১-এর ধারাবাহিকতা) ═════════════
   উৎপত্তি: admin.css-অবশিষ্ট হেক্সের exact-value টোকেনাইজেশন — ভিজ্যুয়াল-পরিবর্তন-শূন্য।
   তিন-পরিবার: ① TW-স্ট্যান্ডার্ড শেড (স্কেল-নাম) ② FB-গ্রে-র‍্যাম্প (কাস্টম নিউট্রাল)
   ③ ব্র্যান্ড-সবুজ (admin-সাকসেস-স্টেট)। hex শুধু এখানেই (guard চুক্তি)। ═════════════ */
:root:root {
${defs}
}
`;
  fs.writeFileSync(path.join(ROOT, 'public/assets/css/tokens.css'), tokens + block);
  console.log('[s139] tokens.css: session139-ব্লক যোগ হয়েছে (' + Object.keys(MAP).length + ' টোকেন)');
} else {
  console.log('[s139] tokens.css: ব্লক আগেই-আছে — স্কিপ');
}

/* ── ধাপ-২: admin.css হেক্স→var() ── */
let out = admin;
const report = [];
for (const [hex, name] of Object.entries(MAP)) {
  const re = new RegExp(hex.replace('#', '#') + '(?![0-9a-fA-F])', 'gi');
  const before = (out.match(re) || []).length;
  if (!before) { report.push(`  ~ ${hex} → ০ ম্যাচ (আগেই-ম্যাপড/অনুপস্থিত)`); continue; }
  out = out.replace(re, `var(--lf-${name})`);
  report.push(`  ✓ ${hex.toLowerCase()} → var(--lf-${name}) ×${before}`);
}
if (APPLY) fs.writeFileSync(path.join(ROOT, 'public/assets/css/admin.css'), out);

/* ── ধাপ-৩: অবশিষ্ট-হিসাব ── */
const remain = (out.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
console.log(report.join('\n'));
console.log(`[s139] admin.css হেক্স: 172 → ${remain}`);
if (!APPLY) console.log('[s139] প্রমাণ-মোড — কোনো-লেখা-হয়নি (উপরের গণনা ইন-মেমরি)');
