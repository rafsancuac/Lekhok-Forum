/**
 * helpers/resource-types.js — সেশন ১০১
 * ═══════════════════════════════════════════════════════════════════════════
 * রিসোর্স টাইপ-মেটা: ব্যাজ-লেবেল, আইকন, রঙ-টোকেন (অ্যাডমিন/মডারেটর ফর্ম +
 * পাবলিক /resources কার্ড — এক সোর্স-অব-ট্রুথ)। legacy file_type (document/
 * video/link) → res_type নরমালাইজ-হেল্পারও এখানে।
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RES_TYPES = {
  pdf:   { label: 'পিডিএফ ফাইল',      short: 'PDF',      icon: 'fa-file-pdf',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  audio: { label: 'অডিও লেকচার',      short: 'অডিও',     icon: 'fa-headphones', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  video: { label: 'ভিডিও ক্লাস',      short: 'ভিডিও',    icon: 'fa-circle-play', color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  image: { label: 'ছবি / ইনফোগ্রাফিক', short: 'ছবি',      icon: 'fa-file-image', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  doc:   { label: 'ডকুমেন্ট (ওয়ার্ড/এক্সেল)', short: 'ডক', icon: 'fa-file-word', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  link:  { label: 'ড্রাইভ / লিংক',    short: 'লিংক',     icon: 'fa-link',       color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
};

/** legacy file_type (document|video|link|pdf|…) + res_type থেকে ক্যানোনিক্যাল টাইপ */
function normalizeResType(row) {
  // সেশন ১০০-খ: res_type='link' ডিফল্টে আটকে-থাকা লেগেসি রো হিল করি — file_type-এ
  // অর্থবহ টাইপ (pdf/audio/…) থাকলে সেটাই প্রাধান্য পায় (বুট-ব্যাকফিল db.js-এও আছে)।
  const ft = String((row && row.file_type) || '').toLowerCase();
  const legacyMap = { document: 'doc' };
  const ftCanon = RES_TYPES[ft] ? ft : (legacyMap[ft] || null);
  const rt = String((row && row.res_type) || '').toLowerCase();
  if (rt && RES_TYPES[rt] && rt !== 'link') return rt;        // res_type-এ অর্থবহ টাইপ
  if (ftCanon) return ftCanon;                                 // লেগেসি file_type হিল
  if (rt && RES_TYPES[rt]) return rt;                          // দুটোই link হলে link
  return 'link';
}

/** YouTube URL হলে embed-ঠিকানা (ভিডিও-মোডালে iframe) */
function videoEmbedUrl(url) {
  const u = String(url || '');
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return 'https://www.youtube.com/embed/' + m[1];
  if (/vimeo\.com\/(\d+)/.test(u)) return 'https://player.vimeo.com/video/' + u.match(/vimeo\.com\/(\d+)/)[1];
  return null;
}

/** আপলোড-ফাইল (multer) থেকে res_type অটো-ডিটেক্ট — অ্যাডমিন+মডারেটর রুট শেয়ার করে */
function detectResType(file) {
  const mime = String((file && file.mimetype) || '').split(';')[0].trim();
  const ext  = (require('path').extname((file && file.originalname) || '') || '').toLowerCase().replace('.', '');
  if (/^image\//.test(mime)) return 'image';
  if (/^audio\//.test(mime)) return 'audio';
  if (/^video\//.test(mime)) return 'video';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (/^(docx?|xlsx?|pptx?|txt|zip)$/.test(ext) || /word|excel|presentation|plain/.test(mime)) return 'doc';
  return 'link';
}

/** বাইট → হিউম্যান-রিডেবল ("15.4 MB") */
function humanFileSize(bytes) {
  if (bytes === undefined || bytes === null || bytes === '') return null;
  const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = Number(bytes) || 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? String(n) : n.toFixed(1) + ' ' + units[i]);
}

module.exports = { RES_TYPES, normalizeResType, videoEmbedUrl, detectResType, humanFileSize };
