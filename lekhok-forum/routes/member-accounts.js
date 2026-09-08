// ── টাস্ক ১৪: মেম্বার অ্যাকাউন্ট ক্লেইম / প্রোফাইল অ্যাক্টিভেশন / নিবন্ধন ─────
// ইউনিফাইড এন্ট্রি ফ্লো: Find My ID (name + member_id) → claim → PENDING_REVIEW।
// নিরাপত্তা: member_id = identifier (সিক্রেট নয়); name = secondary check;
// ক্লেইম সবসময় অ্যাডমিন অনুমোদন ছাড়া active হয় না।
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// ── সিম্পল ইন-মেমোরি রেট-লিমিট (find/claim ব্রুট-ফোর্স গার্ড) ────────────────
const _hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (_hits.get(key) || []).filter(t => now - t < windowMs);
  _hits.set(key, arr);
  return arr.length >= max;
}
function hit(key) { const now = Date.now(); const arr = (_hits.get(key) || []).filter(t => now - t < 3600000); arr.push(now); _hits.set(key, arr); }

// ── নাম স্বাভাবিককরণ (name-match — Section 4/17) ─────────────────────────────
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const alpha = (s) => norm(s).replace(/[^a-z0-9\u0980-\u09ff]/g, '');
function nameMatches(submitted, stored) {
  const a = alpha(submitted), b = alpha(stored);
  if (!a || !b) return false;
  if (a === b) return true;
  // সামান্য বানান/স্পেস পার্থক্য (Section: minor spelling variations)
  return (a.length > 3 && b.length > 3) && (a.includes(b) || b.includes(a));
}

// ইউনিক username তৈরি (email লোকাল-পার্ট → ফলব্যাক সিকোয়েন্স)
async function uniqueUsername(base) {
  const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
  let u = clean(base);
  if (!u) u = 'm' + Date.now().toString(36);
  let candidate = u, i = 2;
  while (await db.prepare('SELECT id FROM users WHERE username = ?').get(candidate)) {
    candidate = u + '_' + (i++);
  }
  return candidate;
}

// ── সুরক্ষিত পাবলিক প্রোফাইল কার্ড (Section 5) — private ফিল্ড কখনো নয় ───────
function publicMember(m) {
  if (!m) return null;
  return {
    memberId: m.member_id,
    name: m.name,
    category: m.member_type,
    position: m.role || m.designation || '',
    department: m.department || '',
    session: m.term_year || '',
    photo: m.image_url || ''
  };
}

const CATEGORY_LABEL = { central: 'কার্যনির্বাহী কমিটি', advisory: 'উপদেষ্টা পরিষদ', permanent: 'স্থায়ী পরিষদ', general: 'সাধারণ সদস্য' };

// ── Claim ফর্ম (GET) — শুধু safe/public ফিল্ড দেখায় ─────────────────────────
router.get('/claim', async (req, res) => {
  const memberId = String(req.query.memberId || '').trim().toUpperCase();
  const m = memberId ? await db.prepare("SELECT * FROM members WHERE UPPER(member_id) = ?").get(memberId) : null;
  if (!m) return res.redirect('/login');
  const alreadyClaimed = !!m.user_id;
  res.render('user/claim', {
    member: publicMember(m),
    categoryLabel: CATEGORY_LABEL[m.member_type] || m.member_type,
    alreadyClaimed,
    currentPath: '/claim'
  });
});

// ── Find My ID (Section 4) ──────────────────────────────────────────────────
// member_id = authoritative key; name = secondary integrity check (Section 27).
router.post('/api/member-accounts/find', async (req, res) => {
  const key = (req.ip || '') + '|find';
  if (limited(key, 30, 60 * 1000)) return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন' });
  hit(key);
  const memberId = String((req.body && req.body.memberId) || '').trim().toUpperCase();
  const name = String((req.body && req.body.name) || '').trim();
  if (!memberId) return res.status(400).json({ ok: false, error: 'মেম্বার আইডি দিন' });
  const m = await db.prepare("SELECT * FROM members WHERE UPPER(member_id) = ?").get(memberId);
  if (!m) {
    return res.json({ ok: true, found: false, error: 'এই মেম্বার আইডির জন্য কোনো প্রি-ক্রিয়েটেড প্রোফাইল পাওয়া যায়নি।' });
  }
  const matches = name ? nameMatches(name, m.name) : false;
  if (name && !matches) {
    return res.json({ ok: true, found: true, nameMatches: false, error: 'মেম্বার আইডি পাওয়া গেছে কিন্তু নাম মিলছে না — আবার চেষ্টা করুন বা এডমিনের সাথে যোগাযোগ করুন।' });
  }
  const alreadyClaimed = !!m.user_id;
  const pending = await db.prepare("SELECT id FROM account_claims WHERE member_profile_id = ? AND claim_status = 'pending'").get(m.id);
  let status = alreadyClaimed ? 'claimed' : (pending ? 'pending' : (m.account_status || 'unclaimed'));
  res.json({
    ok: true, found: true, nameMatches: true,
    status,
    alreadyClaimed,
    member: publicMember(m),
    categoryLabel: CATEGORY_LABEL[m.member_type] || m.member_type
  });
});

// ── Claim Account (Section 6) ────────────────────────────────────────────────
router.post('/api/member-accounts/claim', async (req, res) => {
  const key = (req.ip || '') + '|claim';
  if (limited(key, 10, 15 * 60 * 1000)) return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা হয়েছে — ১৫ মিনিট পর আবার চেষ্টা করুন' });
  hit(key);
  try {
    const b = req.body || {};
    const memberId = String(b.memberId || '').trim().toUpperCase();
    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim();
    const phone = String(b.phone || '').trim();
    const password = String(b.password || '');
    const confirm = String(b.confirmPassword || '');

    if (!memberId || !name) return res.status(400).json({ ok: false, error: 'নাম ও মেম্বার আইডি আবশ্যক' });
    if (!email) return res.status(400).json({ ok: false, error: 'ইমেইল আবশ্যক' });
    if (password.length < 6) return res.status(400).json({ ok: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' });
    if (password !== confirm) return res.status(400).json({ ok: false, error: 'পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না' });

    const m = await db.prepare("SELECT * FROM members WHERE UPPER(member_id) = ?").get(memberId);
    if (!m) return res.status(404).json({ ok: false, error: 'মেম্বার আইডি পাওয়া যায়নি' });
    if (!nameMatches(name, m.name)) return res.status(400).json({ ok: false, error: 'নাম মিলছে না — প্রোফাইলটি আপনার কিনা নিশ্চিত হন' });
    if (m.user_id) return res.status(409).json({ ok: false, error: 'এই প্রোফাইলটি ইতিমধ্যে সক্রিয় করা হয়েছে। অনুগ্রহ করে লগইন করুন অথবা পাসওয়ার্ড রিসেট ব্যবহার করুন।' });

    // Duplicate email গার্ড (Section 25/edge 12)
    const dupEmail = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (dupEmail) return res.status(409).json({ ok: false, error: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে' });

    // একই Member ID-তে একাধিক পেন্ডিং ক্লেইম রোধ (Section 16)
    const existingPending = await db.prepare("SELECT id FROM account_claims WHERE member_profile_id = ? AND claim_status = 'pending'").get(m.id);
    if (existingPending) return res.status(409).json({ ok: false, error: 'এই প্রোফাইলের জন্য ইতিমধ্যে একটি আবেদন পর্যালোচনায় আছে' });

    const hash = await bcrypt.hash(password, 10);
    const username = await uniqueUsername(email.split('@')[0]);
    const submitted_data = JSON.stringify({
      name, email, phone,
      department: b.department || m.department || '',
      session: b.session || m.term_year || '',
      bio: b.bio || ''
    });
    const u = await db.prepare(
      "INSERT INTO users (username, password_hash, full_name, email, phone, status, role) VALUES (?, ?, ?, ?, ?, 'pending', 'user')"
    ).run(username, hash, m.name, email || null, phone || null);
    await db.prepare(
      "INSERT INTO account_claims (member_profile_id, submitted_user_id, kind, claim_status, submitted_data) VALUES (?, ?, 'claim', 'pending', ?)"
    ).run(m.id, u.lastInsertRowid, submitted_data);

    res.json({ ok: true, pending: true, message: 'আপনার আবেদন জমা হয়েছে এবং যাচাইয়ের অপেক্ষায় আছে।' });
  } catch (e) {
    console.error('[member-accounts] claim error:', e.message);
    res.status(500).json({ ok: false, error: 'ক্লেইম জমা দেওয়া যায়নি — আবার চেষ্টা করুন' });
  }
});

module.exports = router;
