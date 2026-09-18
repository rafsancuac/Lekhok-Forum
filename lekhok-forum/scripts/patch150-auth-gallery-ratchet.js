/* session150 — auth/gallery/calls/bookmarks.css tokens-র্যাচেট (patch139/144-রীতির ধারাবাহিকতা — ওয়েভ-৫)
   নিয়ম: exact-value var()-ম্যাপ — ভিজ্যুয়াল-পরিবর্তন-শূন্য।
   টোকেন-সংজ্ঞা শুধু tokens.css-এ (guard চুক্তি); ৪-ফাইলে শুধু var(--lf-*) রেফারেন্স।
   বাউন্ডারি: প্রতি-হেক্স কেস-ইনসেনসিটিভ + (?![0-9a-fA-F]) — প্রেফিক্স-কলিশন-শূন্য।
   নতুন-টোকেন ×৩৩: সব নাম tokens.css-এ defs-count=১ যাচাইকৃত (session143-রীতি:
   ভিন্ন-মানের কাছাকাছি-শেডে -N-সাফিক্স — call-danger-soft ×৪, wa-পরিবার, navy-deep-3)।
   বিশেষ: calls.css-এর লোকাল --lc-... ও legacy --bg-... সংজ্ঞাগুলোর VALUE-ও var(--lf-*)-এ
   পয়েন্ট করানো হয় (definition-মান-ই হেক্স ছিল); var()-ফলব্যাক-লিটারালও ম্যাপড।
   রান: node scripts/patch150-auth-gallery-ratchet.js --apply   (প্রমাণ-মোড: --apply ছাড়া) */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const FILES = ['auth.css', 'gallery.css', 'calls.css', 'bookmarks.css'];

/* ── নতুন-টোকেন ×৩৩ (hex-lowercase → lf-নাম-সাফিক্স) ── */
const NEW_TOKENS = {
  /* স্লেট/নিউট্রাল (auth+gallery+bookmarks — ডার্ক-হেডিং ইঙ্ক ×২০) */
  '#1e293b': 'slate-800',
  '#fafafa': 'neutral-50',
  '#eceff4': 'gray-ice',             /* auth static-select ট্র্যাক-বিজি */
  '#1e3a8a': 'blue-900',             /* auth legacy --brand-light */
  /* লাল/এমারেল্ড TW-র‍্যাম্প সম্পূরণ */
  '#ef4444': 'red-500',              /* gallery uploader-বিপদ ×৪ */
  '#34d399': 'emerald-400',          /* gal-stat আইকন ×৪ */
  '#064e3b': 'emerald-900',          /* bookmarks ডার্ক-গ্রিন গ্র্যাডিয়েন্ট-শেষ */
  /* সবুজ-কাস্টম (auth placeholder/টিন্ট + bookmarks গ্লাস) */
  '#04251c': 'green-950',
  '#d1e7dc': 'green-soft',
  '#7fa893': 'green-muted',
  '#5fa98c': 'green-muted-2',
  '#7e9c8e': 'green-placeholder',    /* auth input ::placeholder */
  '#eafaf1': 'green-tint',           /* auth গ্র্যাডিয়েন্ট-শেষ */
  '#f0fdf4': 'green-50',             /* mfa-resend-note */
  /* কল-বিপদ র‍্যাম্প (calls.css — Instagram-লাল পরিবার) */
  '#e4405f': 'call-danger',          /* --lc-danger সংজ্ঞা + ফলব্যাক ×৩ */
  '#ff5b78': 'call-danger-strong',   /* lc-ctl--end hover */
  '#ff8fa6': 'call-danger-soft',     /* ctl.is-off + quality-bad */
  '#ff8da1': 'call-danger-soft-2',   /* perm-title + cancel-btn */
  '#ff8fa9': 'call-danger-soft-3',   /* retrybar-end */
  '#ffd9df': 'call-danger-soft-4',   /* toast-err */
  /* WhatsApp-ডার্ক পরিবার (calls.css) */
  '#0b141a': 'wa-bg-deep',
  '#111b21': 'wa-panel',             /* --lc-surface সংজ্ঞা */
  '#1f2c34': 'wa-panel-2',           /* --lc-input পরিবার */
  '#2a3942': 'wa-bubble',            /* lc-ctl hover */
  '#e9edef': 'wa-text',              /* --lc-text সংজ্ঞা */
  '#8696a0': 'wa-muted',             /* --lc-text2 সংজ্ঞা */
  '#10181d': 'wa-video-bg',
  '#0b1117': 'wa-thumb-bg',
  '#0f1c14': 'wa-stage',             /* ডার্ক-সবুজ-কালো স্টেজ ×২ */
  '#04231a': 'call-green-ink',       /* retry-বাটন টেক্সট */
  /* নেভি/কল-নেভি */
  '#0b1528': 'call-navy-top',        /* minbar গ্র্যাডিয়েন্ট-শুরু */
  '#132238': 'call-navy-bottom',     /* minbar গ্র্যাডিয়েন্ট-শেষ */
  '#131b2f': 'navy-deep-3'           /* auth legacy --bg-secondary (navy-deep-2 #0B1121 ভিন্ন-মান) */
};

/* ── বিদ্যমান-টোকেন-ম্যাপ (নির্বাচিত-ক্যানোনিকাল নাম — প্রতিটি মান tokens.css-এ defs≥১ যাচাইকৃত) ── */
const EXISTING_MAP = {
  '#ffffff': 'white', '#fff': 'white',
  '#059669': 'ok',
  '#047857': 'ok-deep',
  '#64748b': 'slate',
  '#e2e8f0': 'slate-soft-3',
  '#10b981': 'emerald-500',
  '#0b1121': 'navy-deep-2',
  '#94a3b8': 'slate-soft-5',
  '#475569': 'slate-mid',
  '#f8fafc': 'slate-soft',
  '#f87171': 'danger-mid-2',
  '#cbd5e1': 'slate-soft-4',
  '#fbbf24': 'amber-fire',
  '#b91c1c': 'danger-deep',
  '#b45309': 'soon-amber',
  '#f0fdf7': 'read-tint',
  '#e6f7ef': 'read-tint-deep',
  '#fca5a5': 'rose-200',
  '#6ee7b7': 'emerald-300',
  '#dc2626': 'danger',
  '#334155': 'slate-deep',
  '#f59e0b': 'amber-bright',
  '#65676b': 'text-secondary',
  '#0a1f44': 'navy',
  '#fef2f2': 'danger-soft',
  '#ecfdf5': 'ok-soft',
  '#fcd34d': 'amber-300',
  '#a7f3d0': 'ok-soft-2',
  '#fffbeb': 'amber-soft',
  '#fde68a': 'amber-soft-3',
  '#92400e': 'amber-deep',
  '#e4e6eb': 'ui-border',
  '#f2f2f2': 'fb-hover-2',
  '#050505': 'text-primary',
  '#31a24c': 'fb-green',
  '#eff6ff': 'info-soft-7',
  '#f1f5f9': 'slate-soft-2'
};
const MAP = { ...EXISTING_MAP, ...NEW_TOKENS };

const read = (f) => fs.readFileSync(path.join(ROOT, 'public/assets/css', f), 'utf8');
const tokens0 = read('tokens.css');

/* ── অগ্র-অ্যাসার্শন: নতুন-নামগুলো tokens.css-এ আগে-নেই (collision-শূন্য) ── */
const preCollisions = Object.values(NEW_TOKENS).filter((n) => new RegExp('--lf-' + n + '\\s*:').test(tokens0));
if (preCollisions.length) { console.error('✗ নাম-সংঘর্ষ:', preCollisions.join(', ')); process.exit(1); }

/* ── ধাপ-১: tokens.css-ব্লক (idempotent — marker-চৌকিদার; শুধু --apply-এ লেখা —
   প্রমাণ-মোডে ফাইল-লেখা-শূন্য, patch139-শিক্ষার সংশোধন) ── */
const MARK = 'session150-auth-gallery-calls-bookmarks-ratchet';
if (APPLY && !tokens0.includes(MARK)) {
  const defs = Object.entries(NEW_TOKENS).map(([hex, name]) => {
    let v = hex;
    if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return '  --lf-' + name + ': ' + v.toUpperCase() + ';';
  }).join('\n');
  const block = '\n/* ═════════ ' + MARK + ' — auth/gallery/calls/bookmarks.css র্যাচেট-ওয়েভ-৫ (patch139/144-রীতি) ═════════════\n'
    + '   উৎপত্তি: ৪-ফাইল-অবশিষ্ট হেক্সের exact-value টোকেনাইজেশন — ভিজ্যুয়াল-পরিবর্তন-শূন্য।\n'
    + '   নামকরণ-সততা (session143-রীতি): call-danger-soft ×৪ + wa-পরিবার + navy-deep-3\n'
    + '   (navy-deep-2 #0B1121 ভিন্ন-মান); per-নাম defs=১ যাচাইকৃত। ═════════════ */\n'
    + ':root:root {\n' + defs + '\n}\n';
  fs.writeFileSync(path.join(ROOT, 'public/assets/css/tokens.css'), tokens0 + block);
  console.log('[s150] tokens.css: session150-ব্লক যোগ (' + Object.keys(NEW_TOKENS).length + ' টোকেন)');
} else if (APPLY) {
  console.log('[s150] tokens.css: ব্লক আগেই-আছে — স্কিপ');
} else {
  console.log('[s150] প্রমাণ-মোড: tokens.css-লেখা-শূন্য');
}

/* ── ধাপ-২: ৪-ফাইল হেক্স→var() ── */
const baselinePath = path.join(__dirname, 'tokens-hex-baseline.json');
for (const f of FILES) {
  const src = read(f);
  let out = src;
  const report = [];
  for (const [hex, name] of Object.entries(MAP)) {
    const re = new RegExp(hex.replace('#', '#') + '(?![0-9a-fA-F])', 'gi');
    const n = (out.match(re) || []).length;
    if (!n) continue;
    out = out.replace(re, 'var(--lf-' + name + ')');
    report.push('  ✓ ' + hex + ' → var(--lf-' + name + ') ×' + n);
  }
  const before = (src.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
  const remain = (out.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
  console.log('[s150] ' + f + ': ' + before + ' → ' + remain + ' হেক্স');
  console.log(report.join('\n'));
  if (remain > 0) {
    const leftovers = (out.match(/#[0-9a-fA-F]{3,8}\b/g) || []);
    console.error('  ✗ অম্যাপড-অবশিষ্ট:', [...new Set(leftovers)].join(', '));
  }
  if (APPLY && remain === 0) fs.writeFileSync(path.join(ROOT, 'public/assets/css', f), out);
}

/* ── ধাপ-৩: baseline-র্যাচেট-লক (--apply-এ ৪-ফাইল → ০) ── */
if (APPLY) {
  const base = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  for (const f of FILES) base[f] = 0;
  fs.writeFileSync(baselinePath, JSON.stringify(base, null, 2) + '\n');
  console.log('[s150] tokens-hex-baseline.json: ' + FILES.join('/') + ' → 0 (র্যাচেট-লক)');
}

/* ── ধাপ-৪: per-নাম defs=১ যাচাই (--apply-পরে) ── */
if (APPLY) {
  const tokens1 = read('tokens.css');
  const bad = Object.values(NEW_TOKENS).filter((n) => {
    return (tokens1.match(new RegExp('--lf-' + n + '\\s*:', 'g')) || []).length !== 1;
  });
  if (bad.length) { console.error('✗ defs≠১:', bad.join(', ')); process.exit(1); }
  console.log('[s150] per-নাম defs=১ ×' + Object.keys(NEW_TOKENS).length + ' ✓');
}
if (!APPLY) console.log('[s150] প্রমাণ-মোড — কোনো-লেখা-হয়নি (উপরের গণনা ইন-মেমরি)');
