// ── টাস্ক ১৪: মেম্বার অ্যাকাউন্ট ক্লেইম / প্রোফাইল অ্যাক্টিভেশন / নিবন্ধন ─────
// ইউনিফাইড এন্ট্রি ফ্লো: Find My ID (name + member_id) → claim → PENDING_REVIEW।
// নিরাপত্তা: member_id = identifier (সিক্রেট নয়); name = secondary check;
// ক্লেইম সবসময় অ্যাডমিন অনুমোদন ছাড়া active হয় না।
const express = require('express');
const router = express.Router();
const db = require('../db');
const claimService = require('../helpers/claim-service');
const { makeLimiter, clientIp } = require('../helpers/rate-limit');

// ── রেট-লিমিট (find/claim ব্রুট-ফোর্স গার্ড) — কেন্দ্রীভূত লিমিটার ────────────
const findLimiter = makeLimiter({ max: 30, windowMs: 60 * 1000 });
const claimLimiter = makeLimiter({ max: 10, windowMs: 15 * 60 * 1000 });
const nameMatches = claimService.nameMatches;

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
  const key = clientIp(req) + '|find';
  if (findLimiter.isLimited(key)) return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন' });
  findLimiter.hit(key);
  const memberId = String((req.body && req.body.memberId) || '').trim().toUpperCase();
  const name = String((req.body && req.body.name) || '').trim();
  if (!memberId) return res.status(400).json({ ok: false, error: 'মেম্বার আইডি দিন' });
  if (!/^MEM-\d{5}$/.test(memberId)) return res.json({ ok: true, found: false, error: 'এই মেম্বার আইডির জন্য কোনো প্রি-ক্রিয়েটেড প্রোফাইল পাওয়া যায়নি।' });
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

// ── Claim Account (Section 6) — ব্যবসায়িক লজিক claim-service-এ কেন্দ্রীভূত ────
router.post('/api/member-accounts/claim', async (req, res) => {
  const key = clientIp(req) + '|claim';
  if (claimLimiter.isLimited(key)) return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা হয়েছে — ১৫ মিনিট পর আবার চেষ্টা করুন' });
  claimLimiter.hit(key);
  try {
    const b = req.body || {};
    const result = await claimService.processClaim({
      memberId: b.memberId, name: b.name, email: b.email, phone: b.phone,
      password: b.password, confirmPassword: b.confirmPassword,
      department: b.department, session: b.session, bio: b.bio
    });
    if (!result.ok) {
      return res.status(result.httpStatus || 400).json({ ok: false, error: result.error });
    }
    res.json({ ok: true, pending: !!result.pending, message: result.message });
  } catch (e) {
    console.error('[member-accounts] claim error:', e.message);
    res.status(500).json({ ok: false, error: 'ক্লেইম জমা দেওয়া যায়নি — আবার চেষ্টা করুন' });
  }
});

module.exports = router;
