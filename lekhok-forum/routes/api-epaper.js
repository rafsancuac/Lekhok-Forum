// ── routes/api-epaper.js — ই-পেপার অটোমেশন সিঙ্ক API (session166-পুনর্নির্মিত; হারানো session164-এর চুক্তি-সমতুল্য) ──
// POST /api/epaper/sync  — Bearer EPAPER_SYNC_TOKEN-সুরক্ষিত; বট দৈনিক পত্রিকার PDF (গুগল-ড্রাইভ লিংক) দিয়ে daily_content-এ UPSERT করে
// GET  /api/epaper/papers — পাবলিক JSON তালিকা (থার্ড-পার্টি/মোবাইল-অ্যাপ ইন্টিগ্রেশনের জন্য)
// চুক্তি: daily_content টেবিল পুনঃব্যবহৃত (content_type='epaper', scheduled_date=তারিখ, link_url=ড্রাইভ-PDF) — /epaper-পেজ শূন্য-পরিবর্তনে রেন্ডার করে
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

// ── POST /api/epaper/sync ────────────────────────────────────────────────────
router.post('/sync', async (req, res) => {
  try {
    const token = process.env.EPAPER_SYNC_TOKEN || '';
    if (!token) return res.status(503).json({ ok: false, error: 'EPAPER_SYNC_TOKEN কনফিগার করা হয়নি' });
    const auth = String(req.headers.authorization || '');
    if (auth !== `Bearer ${token}`) {
      return res.status(401).json({ ok: false, error: 'অননুমোদিত — Bearer টোকেন অমিল' });
    }

    const { date, title, body, fileUrl, source } = req.body || {};
    const fUrl = String(fileUrl || '').trim();
    if (!/^https:\/\//.test(fUrl)) {
      return res.status(400).json({ ok: false, error: 'fileUrl প্রয়োজন (https গুগল-ড্রাইভ লিংক)' });
    }
    const d = cleanDate(date);
    const t = String(title || 'দৈনিক পত্রিকা').slice(0, 240);
    const b = String(body || '').slice(0, 2000);
    const src = String(source || 'epaper-bot').slice(0, 80);

    // লেজার-ডুপ্লিকেট-প্রতিরোধ: একই তারিখে আপডেট, নইলে ইনসার্ট
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
    return res.json({ ok: true, id, date: d, mode: existing && existing.id ? 'updated' : 'inserted', source: src });
  } catch (err) {
    console.error('epaper sync error:', err);
    return res.status(500).json({ ok: false, error: 'সিঙ্ক ব্যর্থ' });
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

module.exports = router;
