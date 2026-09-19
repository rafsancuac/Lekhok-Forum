// ── routes/api-epaper.js — ই-পেপার অটোমেশন সিঙ্ক API (session170-সম্প্রসারিত) ──
// POST /api/epaper/sync    — Bearer EPAPER_SYNC_TOKEN-সুরক্ষিত; daily_content (featured) UPSERT
//                            + epaper_files আর্কাইভে মার্জ (প্রতি-তারিখে-একাধিক-পত্রিকা সমর্থিত)
// POST /api/epaper/cleanup — Bearer-সুরক্ষিত; ডামি/ফেক-লিংক (example.com ইত্যাদি) রো পরিষ্কার
// GET  /api/epaper/papers  — পাবলিক JSON তালিকা (featured daily_content)
// GET  /api/epaper/archive — পাবলিক JSON আর্কাইভ (epaper_files — টু-প্যানেল-পেজ/অ্যাপ-ইন্টিগ্রেশন)
const express = require('express');
const router = express.Router();
const db = require('../db');

const EPAPER_TYPE = 'epaper';

/** Asia/Dhaka-তে 'YYYY-MM-DD' — বট/সাইট একই তারিখ-অঞ্চল ব্যবহার করে (ঢাকা-নীতি) */
function dhakaDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
  return parts; // en-CA → YYYY-MM-DD
}

function cleanDate(raw) {
  const s = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // বাংলা/দুদক-ফরম্যাট টলারেন্স — অমিলে আজকের ঢাকা-তারিখ
  return dhakaDate();
}

/** ড্রাইভ-/view/-লিংক থেকে fileId বের করা — থাম্বনেইল/রিডার-এমবেডে লাগবে */
function extractDriveId(url) {
  const m = String(url || '').match(/drive\.google\.com\/(?:file\/d\/|id=|uc\?export=download&id=)([\w-]{10,})/);
  return m ? m[1] : null;
}

/** ইন্টারফেস থেকে অটোমেশন-ফুটার (অটো-সংগ্রহ: @…) মুছে দেওয়া — বট-পাশেও বাদ, এখানে ডাবল-গার্ড */
function cleanBody(b) {
  return String(b || '')
    .replace(/\s*[(（]\s*অটো-সংগ্রহ[^)）]*[)）]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── POST /api/epaper/sync ────────────────────────────────────────────────────
router.post('/sync', async (req, res) => {
  try {
    const token = process.env.EPAPER_SYNC_TOKEN || '';
    if (!token) return res.status(503).json({ ok: false, error: 'EPAPER_SYNC_TOKEN কনফিগার করা হয়নি' });
    const auth = String(req.headers.authorization || '');
    if (auth !== `Bearer ${token}`) {
      return res.status(401).json({ ok: false, error: 'অননুমোদিত — Bearer টোকেন অমিল' });
    }

    const { date, title, body, fileUrl, source, paperName, fileId, thumbId } = req.body || {};
    const fUrl = String(fileUrl || '').trim();
    if (!/^https:\/\//.test(fUrl)) {
      return res.status(400).json({ ok: false, error: 'fileUrl প্রয়োজন (https গুগল-ড্রাইভ লিংক)' });
    }
    const d = cleanDate(date);
    const paper = String(paperName || title || 'দৈনিক পত্রিকা').slice(0, 120);
    const t = String(title || `📰 ${paper}`).slice(0, 240);
    const b = cleanBody(body).slice(0, 2000);
    const src = String(source || 'epaper-bot').slice(0, 80);
    const driveId = String(fileId || extractDriveId(fUrl) || '').slice(0, 64) || null;
    const thumbIdStr = String(thumbId || '').slice(0, 64) || null;

    // ① আর্কাইভ (epaper_files) — (তারিখ + ড্রাইভ-ফাইল) দিয়ে মার্জ; প্রতি-দিনে-একাধিক-পত্রিকা
    let archiveId = null;
    if (driveId) {
      const dup = await db.prepare(
        "SELECT id FROM epaper_files WHERE scheduled_date = ? AND drive_file_id = ? ORDER BY id DESC LIMIT 1"
      ).get(d, driveId);
      if (dup && dup.id) {
        await db.prepare(
          "UPDATE epaper_files SET paper_name = ?, file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
        ).run(paper, fUrl, thumbIdStr, dup.id);
        archiveId = dup.id;
      } else {
        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, driveId, thumbIdStr, src);
        archiveId = r.lastInsertRowid || r.insertId || null;
      }
    } else {
      // ড্রাইভ-ID-হীন লিংক — নাম+তারিখ দিয়ে মার্জ (ফলব্যাক)
      const dup = await db.prepare(
        "SELECT id FROM epaper_files WHERE scheduled_date = ? AND paper_name = ? ORDER BY id DESC LIMIT 1"
      ).get(d, paper);
      if (dup && dup.id) {
        await db.prepare("UPDATE epaper_files SET file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, thumbIdStr, dup.id);
        archiveId = dup.id;
      } else {
        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, NULL, ?, ?, 1)"
        ).run(d, paper, fUrl, thumbIdStr, src);
        archiveId = r.lastInsertRowid || r.insertId || null;
      }
    }

    // ② ফিচার্ড (daily_content) — হোম-উইজেট/legacy-চুক্তি: একই তারিখে আপডেট, নইলে ইনসার্ট
    const existing = await db.prepare(
      "SELECT id FROM daily_content WHERE content_type = ? AND scheduled_date = ? ORDER BY id DESC LIMIT 1"
    ).get(EPAPER_TYPE, d);

    let id;
    if (existing && existing.id) {
      await db.prepare(
        "UPDATE daily_content SET title = ?, body = ?, link_url = ?, published = 1 WHERE id = ?"
      ).run(t, b, fUrl, existing.id);
      id = existing.id;
    } else {
      const r = await db.prepare(
        "INSERT INTO daily_content (content_type, title, body, link_url, scheduled_date, published) VALUES (?, ?, ?, ?, ?, 1)"
      ).run(EPAPER_TYPE, t, b, fUrl, d);
      id = r.lastInsertRowid || r.insertId || null;
    }
    return res.json({ ok: true, id, archiveId, date: d, paper, mode: existing && existing.id ? 'updated' : 'inserted', source: src });
  } catch (err) {
    console.error('epaper sync error:', err);
    return res.status(500).json({ ok: false, error: 'সিঙ্ক ব্যর্থ' });
  }
});

// ── POST /api/epaper/cleanup — ডামি-ডাটা পরিষ্কার (session170/session176) ──────
// ① ফেক-লিংক (example.com ইত্যাদি, ড্রাইভ-বিহীন) daily_content-epaper রো মুছে দেয়;
// ② ঐচ্ছিক body.removeDriveIds = [driveFileId,...] — নির্দিষ্ট ড্রাইভ-ফাইলের
//    আর্কাইভ-রো + মিলে-যাওয়া featured-রো টার্গেটেড-অপসারণ (বিজ্ঞপ্তি/ডুপ্লিকেট-জাংক)।
// আসল ড্রাইভ-রো অটুট থাকে। Bearer EPAPER_SYNC_TOKEN আবশ্যক।
router.post('/cleanup', async (req, res) => {
  try {
    const token = process.env.EPAPER_SYNC_TOKEN || '';
    if (!token) return res.status(503).json({ ok: false, error: 'EPAPER_SYNC_TOKEN কনফিগার করা হয়নি' });
    const auth = String(req.headers.authorization || '');
    if (auth !== `Bearer ${token}`) {
      return res.status(401).json({ ok: false, error: 'অননুমোদিত — Bearer টোকেন অমিল' });
    }
    const del1 = await db.prepare(
      "DELETE FROM daily_content WHERE content_type = ? AND (link_url IS NULL OR link_url = '' OR link_url NOT LIKE '%drive.google.com%')"
    ).run(EPAPER_TYPE);
    const del2 = await db.prepare(
      "DELETE FROM epaper_files WHERE file_url IS NULL OR file_url = '' OR file_url NOT LIKE '%drive.google.com%'"
    ).run();
    const removedFeatured = (del1.changes ?? del1.affected_rows ?? 0);
    const removedArchive = (del2.changes ?? del2.affected_rows ?? 0);

    // ② টার্গেটেড-অপসারণ (session176): নির্দিষ্ট drive-ফাইল-আইডির রো
    const removeIds = Array.isArray(req.body && req.body.removeDriveIds)
      ? req.body.removeDriveIds.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 100)
      : [];
    let removedTargeted = 0;
    for (const rid of removeIds) {
      const r1 = await db.prepare("DELETE FROM epaper_files WHERE drive_file_id = ?").run(rid);
      const r2 = await db.prepare(
        "DELETE FROM daily_content WHERE content_type = ? AND link_url LIKE ?"
      ).run(EPAPER_TYPE, `%${rid}%`);
      removedTargeted += ((r1.changes ?? r1.affected_rows ?? 0) + (r2.changes ?? r2.affected_rows ?? 0));
    }
    return res.json({ ok: true, removedFeatured, removedArchive, removedTargeted });
  } catch (err) {
    console.error('epaper cleanup error:', err);
    return res.status(500).json({ ok: false, error: 'ক্লিনআপ ব্যর্থ' });
  }
});

// ── GET /api/epaper/papers?limit=30&date=YYYY-MM-DD ─────────────────────────
router.get('/papers', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '30'), 10) || 30, 1), 100);
    const d = req.query.date ? cleanDate(req.query.date) : null;
    const rows = d
      ? await db.prepare("SELECT id, title, body, link_url AS fileUrl, scheduled_date AS date, created_at FROM daily_content WHERE content_type = ? AND scheduled_date = ? AND published = 1 ORDER BY id DESC").all(EPAPER_TYPE, d)
      : await db.prepare("SELECT id, title, body, link_url AS fileUrl, scheduled_date AS date, created_at FROM daily_content WHERE content_type = ? AND published = 1 ORDER BY scheduled_date DESC, id DESC LIMIT ?").all(EPAPER_TYPE, limit);
    return res.json({ ok: true, count: rows.length, papers: rows });
  } catch (err) {
    console.error('epaper list error:', err);
    return res.status(500).json({ ok: false, error: 'তালিকা ব্যর্থ' });
  }
});

// ── GET /api/epaper/archive?limit=300&date=YYYY-MM-DD — পাবলিক আর্কাইভ ───────
router.get('/archive', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '300'), 10) || 300, 1), 1000);
    const d = req.query.date ? cleanDate(req.query.date) : null;
    const rows = d
      ? await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, source, created_at FROM epaper_files WHERE published = 1 AND scheduled_date = ? ORDER BY id ASC").all(d)
      : await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, source, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT ?").all(limit);
    return res.json({ ok: true, count: rows.length, papers: rows });
  } catch (err) {
    console.error('epaper archive error:', err);
    return res.status(500).json({ ok: false, error: 'আর্কাইভ ব্যর্থ' });
  }
});

// ── GET /api/epaper/file/:fid — ক্লিন-পিডিএফ-প্রক্সি (session175) ────────────
// ড্রাইভ থেকে বাইট → চ্যানেল-প্রমো-লেয়ার ক্লিন (helpers/pdf-cleaner) → ডিস্ক-ক্যাশে
// → স্ট্রিম। একই fileId-তে রিপ্লেস-হলেও ক্লিন-কনটেন্ট অপরিবর্তিত থাকে বলে ক্যাশ-নিরাপদ।
// ক্লিন-ব্যর্থতায় মূল-বাইটই যায় (প্রধান-প্রবাহ অটুট)।
const fs = require('fs');
const os = require('os');
const path = require('path');
const { cleanEpaperPdf, coverPromoThumbBytes } = require('../helpers/pdf-cleaner');

const EPDF_CACHE_DIR = path.join(os.tmpdir(), 'epdf-cache');
const EPDF_MAX_BYTES = 150 * 1024 * 1024; // এর-বেশি হলে ক্লিন-ছাড়া সরাসরি সার্ভ
const epdfInflight = new Map(); // একই-ফাইলে স্ট্যাম্পেড-ডাউনলোড-রোধ

function epaperFidValid(fid) {
  return /^[A-Za-z0-9_-]{10,64}$/.test(String(fid || ''));
}

async function fetchDriveBytes(fid) {
  const urls = [
    `https://drive.usercontent.google.com/download?id=${fid}&export=download`,
    `https://drive.google.com/uc?export=download&id=${fid}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(90000) });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      // HTML-কনফার্ম-পেজ/এরর-রোধ: PDF হলে %PDF-দিয়ে শুরু
      if (buf.length > 1024 && buf.slice(0, 5).toString('latin1') === '%PDF-') return buf;
    } catch (e) { /* পরের-উৎস */ }
  }
  return null;
}

router.get('/file/:fid', async (req, res) => {
  const fid = String(req.params.fid || '');
  if (!epaperFidValid(fid)) return res.status(400).json({ ok: false, error: 'অবৈধ ফাইল-আইডি' });
  const headers = {
    'Content-Type': 'application/pdf',
    'Cache-Control': 'public, max-age=21600',
    'Content-Disposition': `inline; filename="epaper-${fid.slice(0, 10)}.pdf"`,
  };
  try {
    fs.mkdirSync(EPDF_CACHE_DIR, { recursive: true });
    const cachePath = path.join(EPDF_CACHE_DIR, `${fid}.pdf`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 1024) {
      headers['X-Epaper-Cache'] = 'hit';
      res.set(headers);
      return res.end(fs.readFileSync(cachePath));
    }
    let job = epdfInflight.get('pdf:' + fid);
    if (!job) {
      job = (async () => {
        const raw = await fetchDriveBytes(fid);
        if (!raw) throw new Error('ড্রাইভ-ডাউনলোড ব্যর্থ');
        if (raw.length > EPDF_MAX_BYTES) return { buf: raw, clean: 'skipped-large' };
        let out = raw, info = 'raw';
        try {
          const r = await cleanEpaperPdf(raw);
          if (r.changed) {
            out = r.buffer;
            info = `clean(s${r.streams},a${r.annots},t${r.tailBlocks},i${r.imagesCovered})`;
          } else info = r.error ? `raw-err:${String(r.error).slice(0, 60)}` : 'no-promo';
        } catch (e) { info = 'raw-err:' + (e && e.message ? String(e.message).slice(0, 60) : '?'); }
        try { fs.writeFileSync(cachePath, out); } catch (e) { /* ক্যাশ-ঐচ্ছিক */ }
        return { buf: out, clean: info };
      })().finally(() => epdfInflight.delete('pdf:' + fid));
      epdfInflight.set('pdf:' + fid, job);
    }
    const { buf, clean } = await job;
    headers['X-Epaper-Cache'] = 'miss';
    headers['X-Epaper-Clean'] = clean;
    headers['Content-Length'] = String(buf.length);
    res.set(headers);
    return res.end(buf);
  } catch (err) {
    console.error('epaper file-proxy error:', fid, err && err.message);
    return res.status(502).json({ ok: false, error: 'পিডিএফ আনা যায়নি' });
  }
});

// ── GET /api/epaper/thumb/:fid — পরিষ্কার-থাম্বনেইল-প্রক্সি (session175) ──────
// থাম্ব-JPEG-এও ব্যানার-ব্যান্ড বেক-করা থাকে — একই সবুজ-ব্যান্ড-কভার চালিয়ে সার্ভ।
router.get('/thumb/:fid', async (req, res) => {
  const fid = String(req.params.fid || '');
  if (!epaperFidValid(fid)) return res.status(400).json({ ok: false, error: 'অবৈধ ফাইল-আইডি' });
  const headers = { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=21600' };
  try {
    fs.mkdirSync(EPDF_CACHE_DIR, { recursive: true });
    const cachePath = path.join(EPDF_CACHE_DIR, `t-${fid}.jpg`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 512) {
      headers['X-Epaper-Cache'] = 'hit';
      res.set(headers);
      return res.end(fs.readFileSync(cachePath));
    }
    let job = epdfInflight.get('thumb:' + fid);
    if (!job) {
      job = (async () => {
        const raw = await fetchDriveBytes(fid);
        if (!raw) throw new Error('ড্রাইভ-ডাউনলোড ব্যর্থ');
        let out = null, info = 'raw';
        try {
          out = await coverPromoThumbBytes(raw); // JPEG-কভার অথবা PDF-পাতা-১-ইমেজ-এক্সট্র্যাক্ট+কভার
          info = out ? 'clean' : 'no-image';
        } catch (e) { info = 'err:' + (e && e.message ? String(e.message).slice(0, 60) : '?'); }
        if (!out || !out.length) throw new Error('থাম্ব-প্রস্তুত ব্যর্থ (' + info + ')');
        try { fs.writeFileSync(cachePath, out); } catch (e) { /* ক্যাশ-ঐচ্ছিক */ }
        return { buf: out, info };
      })().finally(() => epdfInflight.delete('thumb:' + fid));
      epdfInflight.set('thumb:' + fid, job);
    }
    const { buf } = await job;
    headers['X-Epaper-Cache'] = 'miss';
    headers['Content-Length'] = String(buf.length);
    res.set(headers);
    return res.end(buf);
  } catch (err) {
    console.error('epaper thumb-proxy error:', fid, err && err.message);
    return res.status(502).json({ ok: false, error: 'থাম্বনেইল আনা যায়নি' });
  }
});

module.exports = router;
