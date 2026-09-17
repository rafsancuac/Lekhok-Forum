const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ── /img/cover/:seed/:w?/:h? — deterministic local cover art (SVG) ──────────
//
// সেশন ৭৩ (GSC "Googlebot blocked by robots.txt" ফিক্স):
// picsum.photos-এর নিজস্ব robots.txt Googlebot-কে Disallow: / করে রাখে, তাই
// তাদের সার্ভারের কভার-ইমেজ Google-এর রেন্ডারড স্ক্রিনশটে কখনোই আসত না।
// সমাধান: সাইটের নিজের ডোমেইনেই ডিটারমিনিস্টিক SVG কভার-আর্ট জেনারেট করা —
//   • একই seed → চিরকাল একই ডিজাইন (ক্যাশ-ফ্রেন্ডলি, immutable)
//   • রেসপন্স ~২-৩KB, কোনো এক্সটার্নাল-রাউন্ডট্রিপ নেই (পেজও দ্রুত হলো)
//   • হালকা থিমের সাথে মানানসই প্যালেট (emerald/teal/amber/rose/violet…)
//   • প্যাটার্ন: সফট গ্রেডিয়েন্ট + বোকেহ সার্কেল + ওপেন-বুক গ্লিফ (সাহিত্য-মোটিফ)
//
// নোট: og:image-তে SVG সোশ্যাল ক্রলাররা সাপোর্ট করে না — তাই রুট-লেয়ারে
// (social.js) /img/cover/ প্রিফিক্স হলে og-default.png-এ ফলব্যাক করা হয়েছে।

// FNV-1a — ছোট, দ্রুত, স্ট্যাবল হ্যাশ
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}

// ডিটারমিনিস্টিক PRNG (mulberry32) — একই seed-এ সবসময় একই জ্যামিতি
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// হালকা-থিম প্যালেট — [bgTop, bgBottom, accent, accentSoft, ink]
const PALETTES = [
  { name: 'emerald', bgTop: '#f0fdf7', bgBottom: '#d1fae5', accent: '#059669', accentSoft: '#a7f3d0', ink: '#065f46' },
  { name: 'teal',    bgTop: '#f0fdfa', bgBottom: '#ccfbf1', accent: '#0d9488', accentSoft: '#99f6e4', ink: '#115e59' },
  { name: 'amber',   bgTop: '#fffbeb', bgBottom: '#fef3c7', accent: '#d97706', accentSoft: '#fde68a', ink: '#92400e' },
  { name: 'rose',    bgTop: '#fff1f2', bgBottom: '#ffe4e6', accent: '#e11d48', accentSoft: '#fecdd3', ink: '#9f1239' },
  { name: 'violet',  bgTop: '#f5f3ff', bgBottom: '#ede9fe', accent: '#7c3aed', accentSoft: '#ddd6fe', ink: '#5b21b6' },
  { name: 'copper',  bgTop: '#fdf8f3', bgBottom: '#fae5d3', accent: '#c2571b', accentSoft: '#fbd8b4', ink: '#8a3e0e' },
  { name: 'moss',    bgTop: '#f7faf0', bgBottom: '#e6f2d3', accent: '#58851f', accentSoft: '#d3eaa1', ink: '#3f5c12' },
  { name: 'coral',   bgTop: '#fff7f2', bgBottom: '#ffe8dc', accent: '#ea6a28', accentSoft: '#fed7aa', ink: '#9a3d0f' },
];

const xmlEsc = (s) => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));

function buildCoverSvg(seed, w, h) {
  const hash = fnv1a(seed);
  const pal = PALETTES[hash % PALETTES.length];
  const rnd = mulberry32(hash ^ 0x9e3779b9);

  const s = Math.min(w, h);                       // স্কেল-রেফারেন্স
  const diag = Math.sqrt(w * w + h * h);

  // বোকেহ সার্কেল — ৫টা, বীট-ডিস্ট্রিবিউশনে ছড়ানো
  const circles = [];
  for (let i = 0; i < 5; i++) {
    const cx = Math.round(rnd() * w);
    const cy = Math.round(rnd() * h);
    const r = Math.round(s * (0.10 + rnd() * 0.22));
    const op = (0.18 + rnd() * 0.30).toFixed(2);
    const fill = rnd() < 0.55 ? pal.accentSoft : pal.accent;
    circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`);
  }

  // পাতলা রিং-আর্ক (কবিতার ছন্দের মতো কেন্দ্রীয় বৃত্ত)
  const ringCx = Math.round(w * (0.72 + rnd() * 0.12));
  const ringCy = Math.round(h * (0.30 + rnd() * 0.15));
  const ringR = Math.round(s * 0.30);
  const arcs =
    `<circle cx="${ringCx}" cy="${ringCy}" r="${ringR}" fill="none" stroke="${pal.accent}" stroke-opacity="0.16" stroke-width="${Math.max(1, Math.round(s * 0.008))}"/>` +
    `<circle cx="${ringCx}" cy="${ringCy}" r="${Math.round(ringR * 0.72)}" fill="none" stroke="${pal.accent}" stroke-opacity="0.10" stroke-width="${Math.max(1, Math.round(s * 0.006))}"/>`;

  // ঝিকিমিকি ডট
  const dots = [];
  for (let i = 0; i < 6; i++) {
    dots.push(`<circle cx="${Math.round(rnd() * w)}" cy="${Math.round(rnd() * h)}" r="${Math.max(1, Math.round(s * 0.006))}" fill="${pal.accent}" opacity="${(0.25 + rnd() * 0.35).toFixed(2)}"/>`);
  }

  // ওপেন-বুক গ্লিফ — কেন্দ্র-বাম-ঘেঁষে, ফন্ট-নিরপেক্ষ পিওর পাথ
  const bk = s * 0.30;                            // বুক-স্কেল
  const bx = Math.round(w * 0.26);
  const by = Math.round(h * 0.58);
  const p1 = (bk * 0.42).toFixed(1), p2 = (bk * 0.75).toFixed(1);
  const book =
    `<g transform="translate(${bx} ${by})" fill="none" stroke="${pal.ink}" stroke-opacity="0.20" stroke-width="${Math.max(1.4, (bk * 0.045)).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="M0 ${(-bk * 0.30).toFixed(1)} C ${(-p1)} ${(-bk * 0.48).toFixed(1)} ${(-p2)} ${(-bk * 0.48).toFixed(1)} ${(-bk * 0.80).toFixed(1)} ${(-bk * 0.30).toFixed(1)} L ${(-bk * 0.80).toFixed(1)} ${(bk * 0.22).toFixed(1)} C ${(-p2)} ${(bk * 0.05).toFixed(1)} ${(-p1)} ${(bk * 0.05).toFixed(1)} 0 ${(bk * 0.34).toFixed(1)} Z" fill="${pal.accent}" fill-opacity="0.10"/>` +
    `<path d="M0 ${(-bk * 0.30).toFixed(1)} C ${p1} ${(-bk * 0.48).toFixed(1)} ${p2} ${(-bk * 0.48).toFixed(1)} ${(bk * 0.80).toFixed(1)} ${(-bk * 0.30).toFixed(1)} L ${(bk * 0.80).toFixed(1)} ${(bk * 0.22).toFixed(1)} C ${p2} ${(bk * 0.05).toFixed(1)} ${p1} ${(bk * 0.05).toFixed(1)} 0 ${(bk * 0.34).toFixed(1)} Z" fill="${pal.accent}" fill-opacity="0.10"/>` +
    `<path d="M0 ${(-bk * 0.30).toFixed(1)} L 0 ${(bk * 0.34).toFixed(1)}"/>` +
    `</g>`;

  // নিচের অ্যাকসেন্ট-স্ট্রিপ (বইয়ের মেরুদণ্ডের মতো)
  const strip =
    `<rect x="0" y="${h - Math.max(3, Math.round(s * 0.022))}" width="${w}" height="${Math.max(3, Math.round(s * 0.022))}" fill="${pal.accent}" opacity="0.85"/>`;

  const gid = 'g' + (hash % 100000).toString(36);
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="কভার আর্ট">` +
    `<title>লেখক ফোরাম — কভার আর্ট (${xmlEsc(seed)})</title>` +
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${pal.bgTop}"/><stop offset="1" stop-color="${pal.bgBottom}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#${gid})"/>` +
    circles.join('') + arcs + dots.join('') + book + strip +
    `</svg>`;
}

router.get('/:seed/:w?/:h?', (req, res) => {
  const seedRaw = String(req.params.seed || '');
  // seed স্যানিটাইজ — [A-Za-z0-9._-], সর্বোচ্চ ৬৪ অক্ষর
  const seed = (seedRaw.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 64)) || 'default';

  const clamp = (v, dflt) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return dflt;
    return Math.min(1600, Math.max(40, n));
  };
  const w = clamp(req.params.w, 800);
  const h = clamp(req.params.h, 400);

  const etag = '"cover-' + crypto.createHash('sha1').update(`${seed}:${w}x${h}`).digest('hex').slice(0, 20) + '"';
  if (req.get('if-none-match') === etag) return res.status(304).end();

  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  // s-maxage → Vercel Edge CDN-ক্যাশ (immutable কনটেন্ট, একই seed = একই আর্ট)
  res.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.set('ETag', etag);
  res.send(buildCoverSvg(seed, w, h));
});

module.exports = router;
