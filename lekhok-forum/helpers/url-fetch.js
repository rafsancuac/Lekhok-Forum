'use strict';
/* ═══ সেশন ১২৯: URL-থেকে-ফাইল সার্ভার-সাইড সংগ্রহ (SSRF-গার্ডসহ) ═══
 * CSV বাল্ক-ইমপোর্টের `fetch`/`সংগ্রহ` কলামের ইঞ্জিন — রিমোট http(s) ফাইল সার্ভারে
 * নামিয়ে লোকাল-আপলোড-চুক্তিতেই সংরক্ষণ (local: public/uploads/attachments/,
 * Vercel-Blob: attachments/ কী), ফেরতে সাইট-পথ + আসল-সাইজ।
 *
 * SSRF-গার্ড (সব-স্তর):
 *   ১. শুধু http/https স্কিম; পোর্ট শুধু ৮০/৪৪৩ (স্কিম-ডিফল্ট) — custom-পোর্ট ব্লক
 *   ২. DNS-রেজলভ (all:true) → প্রতিটি রেজলভড-অ্যাড্রেস যাচাই — একটিও প্রাইভেট
 *      হলে ব্লক (DNS-rebind প্রতিরোধ); hostname নিজেই IP-লিটারাল হলে সরাসরি যাচাই
 *   ৩. প্রাইভেট-রেঞ্জ: 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16 (link-local),
 *      100.64/10 (CGNAT), 0/8, 224/4+ (multicast/reserved), ::1, ::, fc00::/7,
 *      fe80::/10, ff00::/8, ::ffff:-ম্যাপড-v4
 *   ৪. রিডাইরেক্ট ≤৩ হপ — প্রতি-হপে পুনঃ-যাচাই (scheme+port+DNS)
 *   ৫. টাইমআউট ১০সে (AbortController) + সাইজ-ক্যাপ ২৫MB (স্ট্রিম-অ্যাবর্ট)
 *   ৬. এক্সটেনশন-হোয়াইটলিস্ট (URL-পাথ থেকে; না-মিললে Content-Type-ম্যাপ)
 * ব্যবহার: helpers/resource-bulk.js bulkImport() — fetch ব্যর্থ = রো-এরর
 * (নীরবে রিমোট-URL রাখা হয় না — ব্যবহারকারীর অভিপ্রায় স্পষ্ট)।
 */

const dns   = require('dns').promises;
const fs    = require('fs');
const path  = require('path');
const crypto = require('crypto');

const FETCH_TIMEOUT_MS = 10 * 1000;
const MAX_BYTES        = 25 * 1024 * 1024;   // 25 MB — আপলোড-middleware-এর attachments-ক্যাপের সাথে সামঞ্জস্য
const MAX_REDIRECTS    = 3;

// অনুমোদিত এক্সটেনশন (resource-DOC_EXT + audio/video পরিবার — session-92/101 চুক্তি)
const EXT_WHITELIST = /\.(pdf|doc|docx|xls|xlsx|zip|txt|jpe?g|png|gif|webp|webm|ogg|oga|mp3|m4a|wav|aac|opus|mp4)$/i;

// Content-Type → এক্সটেনশন ফলব্যাক-ম্যাপ (URL-এ এক্সটেনশন না থাকলে)
const CT_EXT = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/zip': '.zip', 'application/x-zip-compressed': '.zip',
  'text/plain': '.txt',
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
  'audio/mpeg': '.mp3', 'audio/mp4': '.m4a', 'audio/x-m4a': '.m4a', 'audio/wav': '.wav',
  'audio/x-wav': '.wav', 'audio/aac': '.aac', 'audio/ogg': '.ogg', 'audio/opus': '.opus',
  'video/mp4': '.mp4', 'video/webm': '.webm'
};

/* প্রাইভেট/রিজার্ভড-IP যাচাই — v4, v6, v4-ম্যাপড-v6, জোন-স্ট্রিপসহ */
function isPrivateIp(ip) {
  if (!ip) return true;
  const v = String(ip).toLowerCase().split('%')[0]; // জোন-ইনডেক্স স্ট্রিপ (fe80::1%eth0)
  let m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
  if (m) {
    const a = +m[1], b = +m[2];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;            // link-local
    if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16/12
    if (a === 192 && b === 168) return true;            // 192.168/16
    if (a === 100 && b >= 64 && b <= 127) return true;  // CGNAT
    if (a >= 224) return true;                          // multicast + reserved
    return false;
  }
  if (v === '::' || v === '::1') return true;
  const mapped = /^::ffff:((?:\d{1,3}\.){3}\d{1,3})$/.exec(v);
  if (mapped) return isPrivateIp(mapped[1]);
  if (/^f[cd]/.test(v))  return true;                   // fc00::/7 unique-local
  if (/^fe[89ab]/.test(v)) return true;                 // fe80::/10 link-local
  if (/^ff/.test(v)) return true;                       // multicast
  return false;
}

/* হোস্ট যাচাই — IP-লিটারাল হলে সরাসরি, নইলে DNS-রেজলভ (সব-অ্যাড্রেস) */
async function assertHostPublic(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(h)) {          // IPv4-লিটারাল
    if (isPrivateIp(h)) return false;
    return true;
  }
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (h.includes(':')) return !isPrivateIp(h);        // IPv6-লিটারাল
  let addrs;
  try {
    addrs = await dns.lookup(h, { all: true, verbatim: true });
  } catch (e) {
    return false;                                      // রেজলভ-ব্যর্থ = অনুমোদন-নেই
  }
  if (!addrs || !addrs.length) return false;
  return addrs.every(a => !isPrivateIp(a.address));    // একটিও প্রাইভেট → ব্লক
}

/* URL-স্তর যাচাই (স্কিম + পোর্ট + হোস্ট-DNS) — প্রতি-রিডাইরেক্ট-হপে পুনঃব্যবহৃত */
async function assertUrlPublic(u) {
  if (!/^https?:$/.test(u.protocol)) return 'শুধু http/https URL অনুমোদিত';
  const port = u.port ? Number(u.port) : (u.protocol === 'https:' ? 443 : 80);
  if (port !== 80 && port !== 443) return 'শুধু স্কিম-ডিফল্ট পোর্ট (৮০/৪৪৩) অনুমোদিত';
  const ok = await assertHostPublic(u.hostname);
  if (!ok) return 'প্রাইভেট/অপ্রকাশ্য হোস্ট ব্লক করা হয়েছে (SSRF-গার্ড)';
  return null;
}

/* ফাইল-নাম — টাইমস্ট্যাম্প + র‍্যান্ডম (আপলোড-চুক্তির মতোই; রিমোট-নাম বিশ্বাস-নয়) */
function makeFetchedName(ext) {
  const rand = crypto.randomBytes(4).toString('hex');
  return `${Date.now()}-fetched-${rand}${ext}`;
}

function pickExt(u, contentType) {
  const fromUrl = EXT_WHITELIST.exec(pathnameExt(u.pathname || ''));
  if (fromUrl) return fromUrl[0].toLowerCase();
  const ct = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (CT_EXT[ct]) return CT_EXT[ct];
  return null;
}
function pathnameExt(p) {
  const seg = String(p || '').split('/').pop() || '';
  const mm = /\.(pdf|docx?|xlsx?|zip|txt|jpe?g|png|gif|webp|webm|ogg|oga|mp3|m4a|wav|aac|opus|mp4)$/i.exec(seg);
  return mm ? ('.' + mm[1]) : '';
}

/**
 * fetchToFile(urlStr) → {ok:true, url, filename, bytes, size, ext, mime}
 *                     | {ok:false, error}
 * সফল হলে ফাইলটি লোকাল disk (public/uploads/attachments/) বা Blob-এ গেছে;
 * ফেরত-url সাইট-পথ (/uploads/attachments/…) — resources.file_url-এ সরাসরি বসে।
 */
async function fetchToFile(urlStr) {
  const raw = String(urlStr || '').trim();
  if (!raw) return { ok: false, error: 'URL খালি' };
  if (raw.length > 600) return { ok: false, error: 'URL অতি-দীর্ঘ' };

  let u;
  try { u = new URL(raw); } catch (e) { return { ok: false, error: 'URL পার্স-ব্যর্থ' }; }

  // হপ-০: প্রাথমিক যাচাই
  let guard = await assertUrlPublic(u);
  if (guard) return { ok: false, error: guard };

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    let current = u;
    let res;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: ac.signal,
        headers: { 'User-Agent': 'LekhokForum-ResourceFetch/1.0', 'Accept': '*/*' }
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        if (hop === MAX_REDIRECTS) return { ok: false, error: 'অতিরিক্ত রিডাইরেক্ট (>৩)' };
        const loc = res.headers.get('location');
        if (!loc) return { ok: false, error: 'রিডাইরেক্ট-লোকেশন নেই' };
        let next;
        try { next = new URL(loc, current); } catch (e) { return { ok: false, error: 'অবৈধ রিডাইরেক্ট-URL' }; }
        guard = await assertUrlPublic(next);           // প্রতি-হপে পুনঃ-যাচাই
        if (guard) return { ok: false, error: guard };
        current = next;
        continue;
      }
      break;
    }
    if (!res.ok) return { ok: false, error: 'সার্ভার ' + res.status + ' ফেরত দিয়েছে' };

    const ext = pickExt(current, res.headers.get('content-type'));
    if (!ext) return { ok: false, error: 'অনুমোদিত ফাইল-ধরন নয় (এক্সটেনশন/Content-Type অজানা)' };

    // সাইজ-ক্যাপসহ স্ট্রিম-পাঠ (Content-Length-আগাম-চেক + চলন্ত-অবস্থায় অ্যাবর্ট)
    const cl = Number(res.headers.get('content-length') || 0);
    if (cl > MAX_BYTES) return { ok: false, error: 'ফাইল সীমার (২৫MB) বেশি' };

    const chunks = [];
    let total = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BYTES) {
        try { await reader.cancel(); } catch (e) {}
        return { ok: false, error: 'ফাইল সীমার (২৫MB) বেশি' };
      }
      chunks.push(value);
    }
    if (!total) return { ok: false, error: 'খালি ফাইল' };
    const buf = Buffer.concat(chunks);

    const filename = makeFetchedName(ext);
    const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (USE_BLOB) {
      const { put } = require('@vercel/blob');
      const { url } = await put('attachments/' + filename, buf, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return { ok: true, url, filename, bytes: total, ext, mime: res.headers.get('content-type') || '' };
    }
    const destDir = path.join(__dirname, '..', 'public', 'uploads', 'attachments');
    try {
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(path.join(destDir, filename), buf);
    } catch (e) {
      return { ok: false, error: 'সংরক্ষণ-ব্যর্থ (স্টোরেজ কনফিগার নেই)' };
    }
    return { ok: true, url: '/uploads/attachments/' + filename, filename, bytes: total, ext, mime: res.headers.get('content-type') || '' };
  } catch (e) {
    const msg = e && e.name === 'AbortError' ? 'সময়-সীমা (১০ সেকেন্ড) অতিক্রান্ত' : String((e && e.message) || e).slice(0, 80);
    return { ok: false, error: 'সংগ্রহ-ব্যর্থ: ' + msg };
  } finally {
    clearTimeout(timer);
  }
}

/* বাইট → মানব-পাঠ্য (routes/moderator.js humanFileSizeMod101-এর হুবহু প্রতিরূপ) */
function humanFileSize(bytes) {
  if (bytes === undefined || bytes === null || bytes === '') return null;
  const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = Number(bytes) || 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? n + ' B' : n.toFixed(1) + ' ' + units[i]);
}

module.exports = { fetchToFile, isPrivateIp, assertHostPublic, assertUrlPublic, humanFileSize, EXT_WHITELIST, MAX_BYTES };
