/**
 * helpers/claim-service.js — কেন্দ্রীভূত ক্লেইম/রেজিস্ট্রেশন-অনুমোদন ব্যবসায়িক লেয়ার
 * (টাস্ক: SECURITY, §16) — "Do not duplicate business logic. Create a centralized
 * claim service."
 *
 * একটাই সোর্স-অফ-ট্রুথ: ACCOUNT_CLAIM_REQUIRES_ADMIN_APPROVAL কনফিগ এখানেই পড়া হয়।
 *   • false (default) → ক্লেইম নাম-মিলিয়ে সাথেসাথে link+activate হয় (অডিট-রেকর্ডসহ)
 *   • true            → PENDING_REVIEW, অ্যাডমিন approve/reject করতে হয়
 *
 * নিরাপত্তা: member_id = authoritative lookup (নাম সেকেন্ডারি চেক); ক্লায়েন্ট থেকে
 * name/role/user_id কখনো বিশ্বাস করা হয় না; bcrypt; ডুপ্লিকেট গার্ড; টাইমস্ট্যাম্প।
 */
const bcrypt = require('bcryptjs');
const db = require('../db');
const security = require('./security-config');

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const alpha = (s) => norm(s).replace(/[^a-z0-9\u0980-\u09ff]/g, '');
function nameMatches(submitted, stored) {
  const a = alpha(submitted), b = alpha(stored);
  if (!a || !b) return false;
  if (a === b) return true;
  return (a.length > 3 && b.length > 3) && (a.includes(b) || b.includes(a));
}

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

// ক্লেইম কি অ্যাডমিন অনুমোদন দাবি করে? (কেন্দ্রীভূত)
async function isApprovalRequired() {
  return security.isAdminApprovalRequired();
}

// ── processClaim — ক্লেইম জমা দেওয়ার একমাত্র এন্ট্রি-পয়েন্ট ──────────────────
// প্যারাম: { memberId, name, email, phone, password, department, session }
// রিটার্ন: { ok:true, pending:boolean, message } | { ok:false, error, httpStatus? }
async function processClaim(input) {
  const memberId = String(input.memberId || '').trim().toUpperCase();
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const phone = String(input.phone || '').trim();
  const password = String(input.password || '');
  const confirm = String(input.confirmPassword || '');

  if (!memberId || !name) return { ok: false, httpStatus: 400, error: 'নাম ও মেম্বার আইডি আবশ্যক' };
  if (!/^MEM-\d{5}$/.test(memberId)) return { ok: false, httpStatus: 400, error: 'মেম্বার আইডি ফরম্যাট ভুল' };
  if (!email) return { ok: false, httpStatus: 400, error: 'ইমেইল আবশ্যক' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, httpStatus: 400, error: 'ইমেইল ঠিকানা সঠিক নয়' };
  if (password.length < 6) return { ok: false, httpStatus: 400, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' };
  if (password !== confirm) return { ok: false, httpStatus: 400, error: 'পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না' };

  const m = await db.prepare('SELECT * FROM members WHERE UPPER(member_id) = ?').get(memberId);
  if (!m) return { ok: false, httpStatus: 404, error: 'মেম্বার আইডি পাওয়া যায়নি' };
  if (!nameMatches(name, m.name)) return { ok: false, httpStatus: 400, error: 'নাম মিলছে না — প্রোফাইলটি আপনার কিনা নিশ্চিত হন' };
  if (m.user_id) return { ok: false, httpStatus: 409, error: 'এই প্রোফাইলটি ইতিমধ্যে সক্রিয় করা হয়েছে। অনুগ্রহ করে লগইন করুন অথবা পাসওয়ার্ড রিসেট ব্যবহার করুন।' };

  const dupEmail = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (dupEmail) return { ok: false, httpStatus: 409, error: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে' };

  const existingPending = await db.prepare("SELECT id FROM account_claims WHERE member_profile_id = ? AND claim_status = 'pending'").get(m.id);
  if (existingPending) return { ok: false, httpStatus: 409, error: 'এই প্রোফাইলের জন্য ইতিমধ্যে একটি আবেদন পর্যালোচনায় আছে' };

  const approvalRequired = await isApprovalRequired();
  const hash = await bcrypt.hash(password, 10);
  const username = await uniqueUsername(email.split('@')[0]);
  const submitted_data = JSON.stringify({
    name, email, phone,
    department: input.department || m.department || '',
    session: input.session || m.term_year || '',
    bio: input.bio || ''
  });

  // ব্যবহারকারী অ্যাকাউন্ট: approval না লাগলে active, লাগলে pending
  const status = approvalRequired ? 'pending' : 'active';
  const u = await db.prepare(
    "INSERT INTO users (username, password_hash, full_name, email, phone, status, role) VALUES (?, ?, ?, ?, ?, ?, 'user')"
  ).run(username, hash, m.name, email || null, phone || null);

  if (approvalRequired) {
    await db.prepare(
      "INSERT INTO account_claims (member_profile_id, submitted_user_id, kind, claim_status, submitted_data) VALUES (?, ?, 'claim', 'pending', ?)"
    ).run(m.id, u.lastInsertRowid, submitted_data);
    return { ok: true, pending: true, message: 'আপনার আবেদন জমা হয়েছে এবং যাচাইয়ের অপেক্ষায় আছে।' };
  }

  // approval বন্ধ → সাথেসাথে link + activate (অডিটের জন্য approved ক্লেইম-রেকর্ড)
  await db.prepare(
    "UPDATE members SET user_id = ?, account_status = 'active', claimed_at = datetime('now','localtime'), verified_at = datetime('now','localtime') WHERE id = ?"
  ).run(u.lastInsertRowid, m.id);
  await db.prepare(
    "INSERT INTO account_claims (member_profile_id, submitted_user_id, kind, claim_status, submitted_data, reviewed_at, reviewed_by, admin_notes) VALUES (?, ?, 'claim', 'approved', ?, datetime('now','localtime'), NULL, 'auto-approved (অ্যাডমিন অনুমোদন বন্ধ)')"
  ).run(m.id, u.lastInsertRowid, submitted_data);

  // অডিট লগ (পাসওয়ার্ড কখনো নয়)
  try {
    await db.logActivity({ user_id: u.lastInsertRowid, username, role: 'user', action: 'claim', target: 'members', detail: memberId + ' auto-linked' });
  } catch (e) {}

  return { ok: true, pending: false, message: 'আপনার অ্যাকাউন্ট সক্রিয় হয়েছে — এখন লগইন করুন।' };
}

// ── অ্যাডমিন অ্যাকশন (approve/reject) — একক উৎস ───────────────────────────────
async function approveClaim(claimId, reviewer) {
  const claim = await db.prepare('SELECT * FROM account_claims WHERE id = ?').get(claimId);
  if (!claim) return { ok: false, error: 'ক্লেইম পাওয়া যায়নি' };
  const member = await db.prepare('SELECT * FROM members WHERE id = ?').get(claim.member_profile_id);
  if (!member) return { ok: false, error: 'মেম্বার প্রোফাইল পাওয়া যায়নি' };
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(claim.submitted_user_id);

  if (user) await db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(user.id);
  await db.prepare(
    "UPDATE members SET user_id = COALESCE(user_id, ?), account_status = 'active', claimed_at = COALESCE(claimed_at, datetime('now','localtime')), verified_at = datetime('now','localtime') WHERE id = ?"
  ).run(claim.submitted_user_id, member.id);
  await db.prepare(
    "UPDATE account_claims SET claim_status = 'approved', reviewed_at = datetime('now','localtime'), reviewed_by = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?"
  ).run(reviewer, claim.admin_notes ?? null, claim.id);
  return { ok: true };
}

async function rejectClaim(claimId, reviewer, notes) {
  const claim = await db.prepare('SELECT * FROM account_claims WHERE id = ?').get(claimId);
  if (!claim) return { ok: false, error: 'ক্লেইম পাওয়া যায়নি' };
  await db.prepare(
    "UPDATE account_claims SET claim_status = 'rejected', reviewed_at = datetime('now','localtime'), reviewed_by = ?, admin_notes = ? WHERE id = ?"
  ).run(reviewer, notes || null, claim.id);
  if (claim.kind !== 'registration') {
    await db.prepare("UPDATE members SET account_status = 'unclaimed' WHERE id = ? AND account_status != 'active'").run(claim.member_profile_id);
  }
  return { ok: true };
}

async function requestMoreInfo(claimId, reviewer, notes) {
  const claim = await db.prepare('SELECT * FROM account_claims WHERE id = ?').get(claimId);
  if (!claim) return { ok: false, error: 'ক্লেইম পাওয়া যায়নি' };
  await db.prepare(
    "UPDATE account_claims SET claim_status = 'more_info', reviewed_at = datetime('now','localtime'), reviewed_by = ?, admin_notes = ? WHERE id = ?"
  ).run(reviewer, notes || null, claim.id);
  return { ok: true };
}

module.exports = {
  nameMatches,
  isApprovalRequired,
  processClaim,
  approveClaim,
  rejectClaim,
  requestMoreInfo,
};
