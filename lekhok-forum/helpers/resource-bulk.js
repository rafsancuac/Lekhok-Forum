'use strict';
/* ═══ সেশন ১১৬: রিসোর্স বাল্ক-ইমপোর্ট (CSV) — helpers/resource-bulk.js ═══
 * সংকলন/সিরিজ-গ্রুপিং-সহ এক-কলামী কিংবা পূর্ণ-কলামী CSV থেকে একাধিক রিসোর্স
 * এক-ক্লিকে ইমপোর্ট। ব্যবহার: অ্যাডমিন POST /admin/resources/bulk + মডারেটর
 * POST /moderator/resources/bulk (দুটোই staff-গেটেড; JSON {csv} বডি + X-CSRF-Token)।
 *
 * CSV চুক্তি (হেডার-রো বাধ্যতামূলক, কলাম-ক্রম যেকোনো):
 *   title, res_type, category, file_url, link_url, description, tags,
 *   author, series, series_order, thumbnail_url, duration, file_size
 * হেডার বাংলা-এলিয়াসও চলে (শিরোনাম/ধরন/ক্যাটাগরি/…)। res_type এলিয়াস:
 *   pdf|পিডিএফ · audio|অডিও · video|ভিডিও · image|ছবি · doc|ডক|word · link|লিংক
 * ক্যাটাগরি এলিয়াস → slug (গাইড→guide, সংকলন→anthology, …); অজানা হলে
 * ছোট-হাতের-ড্যাশ-কেস করে নেওয়া হয় (≤40)।
 *
 * সিরিজ-গ্রুপিং: একই series নামের রো-গুলো এক সিরিজে যায়; series_order ফাঁকা
 * হলে ব্যাচের ভেতরে স্বয়ংক্রিয় ক্রম (১..) বসে।
 *
 * সীমা: প্রতি-ব্যাচ ≤200 ডেটা-রো; title বাধ্যতামূলক (≤200); res_type হোয়াইটলিস্ট;
 * link-টাইপে link_url বাধ্যতামূলক, ফাইল-টাইপে file_url/link_url যেকোনো একটি;
 * URL হোয়াইটলিস্ট ^https?:// অথবা সাইট-পাথ ^/ (session-101 স্যানিটাইজ-চুক্তি)।
 *
 * সেশন ১২৯ — সার্ভার-সাইড ফাইল-সংগ্রহ: ঐচ্ছিক `fetch`/`সংগ্রহ` কলাম (1/true/yes/হ্যাঁ)
 * + file_url-এ পূর্ণ http(s)-URL হলে সার্ভার ফাইলটি নিজেই নামিয়ে নেয় (SSRF-গার্ডসহ —
 * helpers/url-fetch.js: প্রাইভেট-IP/পোর্ট/স্কিম-ব্লক + DNS-যাচাই + ≤৩-হপ + ১০সে + ২৫MB)।
 * সফল হলে file_url সাইট-পথে বদলে যায় + file_size আসল-বাইট; ব্যর্থ হলে সেই-রো
 * এরর (নীরবে রিমোট-URL রাখা হয় না)। ব্যাচে সর্বোচ্চ ২৫টি সংগ্রহ (request-timeout-গার্ড)।
 */

const MAX_ROWS = 200;
const MAX_FETCHES = 25;

const TYPE_ALIASES = {
  'pdf': 'pdf', 'পিডিএফ': 'pdf', 'পিডিএ': 'pdf',
  'audio': 'audio', 'অডিও': 'audio',
  'video': 'video', 'ভিডিও': 'video',
  'image': 'image', 'ছবি': 'image', 'ইমেজ': 'image',
  'doc': 'doc', 'ডক': 'doc', 'ডকুমেন্ট': 'doc', 'word': 'doc', 'ওয়ার্ড': 'doc',
  'link': 'link', 'লিংক': 'link', 'url': 'link', 'ইউআরএল': 'link'
};

const CATEGORY_ALIASES = {
  'guide': 'guide', 'গাইড': 'guide', 'গাইডবুক': 'guide',
  'document': 'document', 'ডকুমেন্ট': 'document',
  'report': 'report', 'প্রতিবেদন': 'report',
  'form': 'form', 'ফর্ম': 'form',
  'anthology': 'anthology', 'সংকলন': 'anthology',
  'reference': 'reference', 'রেফারেন্স': 'reference',
  'scholarship': 'scholarship', 'ফেলোশিপ': 'scholarship',
  'writing-tips': 'writing-tips', 'লেখালেখির টিপস': 'writing-tips', 'টিপস': 'writing-tips',
  'general': 'general', 'সাধারণ': 'general'
};

const HEADER_ALIASES = {
  'title': 'title', 'শিরোনাম': 'title', 'নাম': 'title',
  'res_type': 'res_type', 'type': 'res_type', 'ধরন': 'res_type', 'ফাইলের ধরন': 'res_type',
  'category': 'category', 'ক্যাটাগরি': 'category', 'বিভাগ': 'category',
  'file_url': 'file_url', 'ফাইল-লিংক': 'file_url', 'ফাইল লিংক': 'file_url', 'ফাইল': 'file_url',
  'link_url': 'link_url', 'লিংক': 'link_url', 'url': 'link_url',
  'description': 'description', 'content': 'description', 'বিবরণ': 'description', 'বর্ণনা': 'description',
  'tags': 'tags', 'ট্যাগ': 'tags',
  'author': 'author', 'লেখক': 'author', 'প্রকাশক': 'author',
  'series': 'series', 'সিরিজ': 'series', 'সংকলন': 'series_series',
  'series_order': 'series_order', 'পর্ব': 'series_order', 'পর্ব-ক্রম': 'series_order', 'ক্রম': 'series_order',
  'thumbnail_url': 'thumbnail_url', 'কভার': 'thumbnail_url', 'থাম্বনেইল': 'thumbnail_url', 'থাম্বনেইল-ইউআরএল': 'thumbnail_url',
  'duration': 'duration', 'সময়': 'duration', 'সময়সীমা': 'duration',
  'file_size': 'file_size', 'সাইজ': 'file_size', 'আকার': 'file_size',
  'fetch': 'fetch', 'সংগ্রহ': 'fetch', 'ফাইল-সংগ্রহ': 'fetch', 'ফাইল সংগ্রহ': 'fetch', 'নামাও': 'fetch'
};

/* সংগ্রহ-কলাম truthy — 1/true/yes/y/on/হ্যাঁ/সংগ্রহ */
function isTruthyFetch(v) {
  return /^(1|true|yes|y|on|হ্যাঁ|সংগ্রহ)$/i.test(String(v || '').trim());
}

/* RFC4180-lite: ডাবল-কোট (""=escaped quote), কমা, CRLF/LF — বাংলা-ইউনিকোড নিরাপদ। */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  const s = String(text || '').replace(/^\uFEFF/, ''); // BOM-শিম
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

function cleanUrl(v) {
  const t = String(v || '').trim();
  if (!t) return null;
  return /^(https?:\/\/.+|\/)/i.test(t) ? t.slice(0, 600) : undefined; // undefined = অবৈধ
}

/* হেডার-রো → কলাম-ম্যাপ; ফেরত {map, unknown[]} */
function headerMap(cells) {
  const map = {};
  cells.forEach((raw, i) => {
    const key = HEADER_ALIASES[String(raw || '').trim().toLowerCase()];
    if (key === 'series_series') key = 'series'; // 'সংকলন' দ্ব্যর্থবোধ — হেডারে সিরিজ-ই ধরি
    if (key) map[key] = i;
  });
  return map;
}

/* এক-রো ভ্যালিডেশন → {ok:true, r} | {ok:false, error} ; seriesCount = ব্যাচ-লোকাল অটো-ক্রম */
function normalizeRow(obj, seriesAutoOrder) {
  const title = String(obj.title || '').trim();
  if (!title) return { ok: false, error: 'শিরোনাম খালি' };
  if (title.length > 200) return { ok: false, error: 'শিরোনাম ২০০-অক্ষরের বেশি' };

  const rawType = String(obj.res_type || '').trim().toLowerCase() || 'link';
  const res_type = TYPE_ALIASES[rawType] || TYPE_ALIASES[String(obj.res_type || '').trim()];
  if (!res_type) return { ok: false, error: 'অজানা ধরন: ' + String(obj.res_type || '').slice(0, 20) };

  let file_url = null, link_url = null;
  if (obj.file_url != null && String(obj.file_url).trim()) {
    file_url = cleanUrl(obj.file_url);
    if (file_url === undefined) return { ok: false, error: 'file_url অবৈধ (http(s):// বা / দিয়ে শুরু হতে হবে)' };
  }
  if (obj.link_url != null && String(obj.link_url).trim()) {
    link_url = cleanUrl(obj.link_url);
    if (link_url === undefined) return { ok: false, error: 'link_url অবৈধ (http(s):// বা / দিয়ে শুরু হতে হবে)' };
  }
  if (res_type === 'link' && !link_url) return { ok: false, error: 'লিংক-ধরনে link_url বাধ্যতামূলক' };
  if (res_type !== 'link' && !file_url && !link_url) return { ok: false, error: 'ফাইল-ধরনে file_url বা link_url একটি লাগবেই' };

  let category = String(obj.category || '').trim();
  if (!category) category = 'general';
  const catLower = category.toLowerCase();
  category = CATEGORY_ALIASES[catLower] || CATEGORY_ALIASES[category] ||
    (catLower.replace(/\s+/g, '-').replace(/[^a-z0-9\u0980-\u09FF-]/g, '').slice(0, 40) || 'general');

  const series = String(obj.series || '').trim().slice(0, 80) || null;
  let series_order = null;
  const soRaw = parseInt(obj.series_order, 10);
  if (Number.isFinite(soRaw) && soRaw >= 1 && soRaw <= 999) series_order = soRaw;
  else if (series && seriesAutoOrder && seriesAutoOrder[series] != null) series_order = seriesAutoOrder[series];

  const thumb = String(obj.thumbnail_url || '').trim();
  const thumbnail_url = thumb ? (cleanUrl(thumb) || null) : null;

  return {
    ok: true,
    r: {
      title,
      content: String(obj.description || '').trim().slice(0, 3000) || '',
      category,
      author: String(obj.author || '').trim().slice(0, 120) || '',
      tags: String(obj.tags || '').trim().slice(0, 200) || '',
      res_type,
      file_url,
      link_url,
      file_size: String(obj.file_size || '').trim().slice(0, 20) || null,
      duration: String(obj.duration || '').trim().slice(0, 20) || null,
      thumbnail_url,
      series,
      series_order,
      fetch: isTruthyFetch(obj.fetch) && !!file_url && /^https?:\/\//i.test(file_url)
    }
  };
}

/* মূল ইমপোর্ট — ফেরত {total, inserted, skipped, dupes, fetched, errors[]} */
/* সেশন ১৩৪: ডুপ-কী — title+series+file_url+link_url (trim+lowercase নরমালাইজড)।
 * ক্রস-রিকোয়েস্ট ডুপ-গার্ডের চুক্তি: একই CSV দ্বিতীয়বার দিলে নতুন রো তৈরি হয় না। */
function dupKey134(t, series, fu, lu) {
  return [String(t || '').trim().toLowerCase(), String(series || '').trim().toLowerCase(),
          String(fu || '').trim().toLowerCase(), String(lu || '').trim().toLowerCase()].join('\u0000');
}

async function bulkImport(csvText, createdBy, db) {
  const rows = parseCsv(csvText);
  if (!rows.length) return { total: 0, inserted: 0, skipped: 0, dupes: 0, errors: [{ line: 1, error: 'CSV খালি' }] };
  const map = headerMap(rows[0]);
  if (map.title == null) return { total: 0, inserted: 0, skipped: 0, dupes: 0, errors: [{ line: 1, error: 'হেডার-রোতে "title" (বা "শিরোনাম") কলাম নেই' }] };

  const dataRows = rows.slice(1).filter(cells => cells.some(c => String(c || '').trim() !== ''));
  if (dataRows.length > MAX_ROWS) dataRows.length = MAX_ROWS;

  const seriesAutoOrder = {}; // ব্যাচ-লোকাল অটো-ক্রম
  const seen = new Set();     // ব্যাচ-ডুপ্লিকেট (title+file_url)
  let inserted = 0, skipped = 0, dupes = 0, fetched = 0, fetchTries = 0;
  const errors = [];
  const urlFetch129 = require('./url-fetch'); // ধীর-লোড — ইউনিট-টেস্টে স্টাব-বান্ধব
  /* সেশন ১৩৪: ক্রস-রিকোয়েস্ট ডুপ-গার্ড — ডাটাবেসে আগে-থেকে-থাকা সব রো-র ডুপ-কী প্রিলোড;
   * একই CSV দ্বিতীয়বার ইমপোর্টে dupes কাউন্টারে জানিয়ে স্কিপ (ডুপ্লিকেট-রো তৈরি নয়)।
   * গার্ড-কোয়েরি ব্যর্থ হলে ইমপোর্ট-বাধা নয় (open-fail-safe — পুরনো আচরণেই চলবে)। */
  const dbSeen134 = new Set();
  try {
    (await db.prepare('SELECT title, series, file_url, link_url FROM resources').all()).forEach(function (x) {
      dbSeen134.add(dupKey134(x.title, x.series, x.file_url, x.link_url));
    });
  } catch (e134) { /* নীরব — গার্ড-ছাড়া চলবে */ }

  for (let i = 0; i < dataRows.length; i++) {
    const lineNo = i + 2; // হেডার-পরের লাইন-নম্বর
    const cells = dataRows[i];
    const obj = {};
    Object.keys(map).forEach(k => { obj[k] = cells[map[k]]; });

    const res = normalizeRow(obj, seriesAutoOrder);
    if (!res.ok) {
      errors.push({ line: lineNo, title: String(obj.title || '').slice(0, 60), error: res.error });
      continue;
    }
    const r = res.r;
    const key = dupKey134(r.title, r.series, r.file_url, r.link_url);
    if (seen.has(key)) { skipped++; continue; }
    if (dbSeen134.has(key)) { dupes++; continue; } // সেশন ১৩৪: ডাটাবেসে আগেই আছে
    seen.add(key);
    if (r.series && r.series_order == null) {
      seriesAutoOrder[r.series] = (seriesAutoOrder[r.series] || 0) + 1;
      r.series_order = seriesAutoOrder[r.series];
    }
    /* সেশন ১২৯: সার্ভার-সাইড ফাইল-সংগ্রহ (fetch/সংগ্রহ কলাম) — SSRF-গার্ডসহ ডাউনলোড;
       সফলে সাইট-পথ + আসল-সাইজ, ব্যর্থে রো-এরর (রিমোট-URL নীরবে রাখা হয় না) */
    if (r.fetch) {
      if (fetchTries >= MAX_FETCHES) {
        errors.push({ line: lineNo, title: r.title, error: 'ব্যাচে সংগ্রহ-সীমা (২৫) শেষ — পরের ব্যাচে আনুন' });
        continue;
      }
      fetchTries++;
      const fr = await urlFetch129.fetchToFile(r.file_url);
      if (!fr.ok) {
        errors.push({ line: lineNo, title: r.title, error: fr.error });
        continue;
      }
      r.file_url = fr.url;
      r.file_size = urlFetch129.humanFileSize(fr.bytes) || r.file_size;
      fetched++;
    }
    try {
      await db.prepare(
        'INSERT INTO resources (title, content, category, author, tags, file_url, link_url, file_type, res_type, file_size, duration, created_by, thumbnail_url, series, series_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        r.title, r.content, r.category, r.author || createdBy || '', r.tags,
        r.file_url, r.link_url, r.res_type, r.res_type, r.file_size, r.duration,
        createdBy || null, r.thumbnail_url, r.series, r.series_order
      );
      dbSeen134.add(key); // সেশন ১৩৪: এই-ব্যাচে ঢোকানো কী-ও গার্ডে যোগ (একই-রিকোয়েস্টে পুনরাবৃত্তি-রক্ষা)
      inserted++;
    } catch (e) {
      errors.push({ line: lineNo, title: r.title, error: 'ডেটাবেস-ত্রুটি: ' + String(e.message || e).slice(0, 80) });
    }
  }
  return { total: dataRows.length, inserted, skipped, dupes, fetched, errors: errors.slice(0, 40) };
}

/* নমুনা CSV (টেমপ্লেট-ডাউনলোড বাটন ও UI-হেল্পটেক্সট এক-উৎসে) */
/* নমুনা CSV (টেমপ্লেট-ডাউনলোড বাটন ও UI-হেল্পটেক্সট এক-উৎসে) —
   শেষ-কলাম `সংগ্রহ` (session-129): হ্যাঁ দিলে সার্ভার ফাইলটি নিজেই নামায় (SSRF-গার্ডসহ) */
const SAMPLE_CSV = [
  'title,res_type,category,file_url,link_url,description,tags,author,series,series_order,সংগ্রহ',
  'বাংলা বানান রীতি নির্দেশিকা,পিডিএফ,গাইড,https://example.com/banan.pdf,,ধর্মীয় ও প্রাতিষ্ঠানিক বানানের সহজ-নির্দেশিকা,"বানান, নির্দেশিকা",রাফসান,নবীন লেখক কর্মশালা,1,হ্যাঁ',
  'প্রবন্ধ-লেখার মৌলিক কাঠামো,ডক,লেখালেখির টিপস,https://example.com/probondho.docx,,প্রবন্ধের কাঠামো ও উপস্থাপনা,"প্রবন্ধ, কাঠামো",,নবীন লেখক কর্মশালা,2,',
  'কবিতা আবৃত্তি নিয়ে আলোচনা,ভিডিও,ভিডিও ক্লাস,,https://youtu.be/dQw4w9WgXcQ,আবৃত্তি-টিপস ও উদাহরণ,"আবৃত্তি, কবিতা",,,,',
  'লেখক ফোরাম ওয়েবসাইট,লিংক,special,,https://lekhok-forum.example,অফিসিয়াল সাইট,লিংক,,,,'
].join('\r\n');

module.exports = { parseCsv, headerMap, normalizeRow, bulkImport, SAMPLE_CSV, MAX_ROWS };
