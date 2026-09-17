/**
 * helpers/otp.js — ইমেইল-ওটিপি ইঞ্জিন (সেশন ১১৫: মাল্টি-মেথড 2FA)
 *
 * ফ্রি-টিয়ার দর্শন (ইউজার-স্পেক: TOTP + Email OTP = $0):
 *   • কোড জেনারেশন — Node-এর built-in crypto (কোনো প্যাকেজ নেই)
 *   • ডেলিভারি — Resend REST API (fetch-based; RESEND_API_KEY না থাকলে
 *     কনসোল-ফলব্যাক → ডেভ/স্যান্ডবক্সে ব্যর্থ হয় না, প্রোডাকশনে কি বসালেই লাইভ)
 *   • সংরক্ষণ — two_factor_tokens টেবিল (মেয়াদ ৫ মিনিট, attempts-গার্ড)
 *   • রেট-লিমিট — প্রতি ইউজারে ৪৫সে-এ ১টির বেশি ইস্যু নয় (SMS-spamming-ধাঁচের
 *     ব্যালেন্স-ক্ষয় + ইনবক্স-স্প্যাম দুটোই আটকায়)
 */

const crypto = require('crypto');
const db = require('../db');

const OTP_TTL_MS = 5 * 60 * 1000;      // ৫ মিনিট (স্পেক-অনুযায়ী)
const RESEND_COOLDOWN_MS = 45 * 1000;  // পরপর ইস্যুর ন্যূনতম ব্যবধান
const MAX_ATTEMPTS = 6;                // একটি টোকেনে সর্বোচ্চ ভুল-চেষ্টা

// প্রসেস-লোকাল কুলডাউন-ম্যাপ (uid → lastIssueTs) — সার্ভার-রিস্টার্টে রিসেট হলেও নিরাপদ
const lastIssue = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function maskEmail(email) {
  const e = String(email || '');
  const at = e.indexOf('@');
  if (at <= 0) return e;
  const local = e.slice(0, at);
  const dom = e.slice(at);
  const head = local.slice(0, Math.min(2, local.length));
  return head + '•••' + dom;
}

/**
 * কোড ইস্যু করুন (পুরনো টোকেন বাতিল করে নতুনটি সংরক্ষণ)।
 * @returns {{ok:true, code:string, expiresAt:number, cooldown:number} | {ok:false, retryAfter:number}}
 */
function issueOtp(uid, method = 'email') {
  const prev = lastIssue.get(uid) || 0;
  const since = Date.now() - prev;
  if (since < RESEND_COOLDOWN_MS) {
    return { ok: false, retryAfter: Math.ceil((RESEND_COOLDOWN_MS - since) / 1000) };
  }
  lastIssue.set(uid, Date.now());

  const code = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;
  try {
    db.prepare('DELETE FROM two_factor_tokens WHERE user_id = ? AND method = ?').run(uid, method);
    db.prepare('INSERT INTO two_factor_tokens (user_id, code, method, expires_at, attempts) VALUES (?, ?, ?, ?, 0)')
      .run(uid, code, method, expiresAt);
  } catch (e) {
    console.error('[otp] issue persist error:', e.message);
    return { ok: false, retryAfter: 0 };
  }
  return { ok: true, code, expiresAt, cooldown: RESEND_COOLDOWN_MS };
}

/**
 * কোড যাচাই — মেয়াদ + attempts-গার্ড; সফল হলে টোকেন বিলোপ (একবারই ব্যবহার)।
 * @returns {{ok:true} | {ok:false, reason:'missing'|'expired'|'locked'|'mismatch', retryAfter?:number}}
 */
function verifyOtp(uid, code, method = 'email') {
  const c = String(code || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(c)) return { ok: false, reason: 'mismatch' };
  let row = null;
  try {
    row = db.prepare('SELECT id, code, expires_at, attempts FROM two_factor_tokens WHERE user_id = ? AND method = ? ORDER BY id DESC LIMIT 1')
      .get(uid, method);
  } catch (e) {
    console.error('[otp] verify read error:', e.message);
    return { ok: false, reason: 'missing' };
  }
  if (!row) return { ok: false, reason: 'missing' };
  if (Number(row.expires_at) <= Date.now()) return { ok: false, reason: 'expired' };
  if (Number(row.attempts || 0) >= MAX_ATTEMPTS) return { ok: false, reason: 'locked' };

  if (String(row.code) !== c) {
    try { db.prepare('UPDATE two_factor_tokens SET attempts = attempts + 1 WHERE id = ?').run(row.id); } catch (e) {}
    const left = MAX_ATTEMPTS - (Number(row.attempts || 0) + 1);
    return { ok: false, reason: 'mismatch', retryAfter: left };
  }
  try { db.prepare('DELETE FROM two_factor_tokens WHERE id = ?').run(row.id); } catch (e) {}
  return { ok: true };
}

/** ইস্যু-কুলডাউনের বাকি সেকেন্ড (রেসপন্স-মেসেজে দেখানোর জন্য) */
function cooldownLeft(uid) {
  const prev = lastIssue.get(uid) || 0;
  const left = RESEND_COOLDOWN_MS - (Date.now() - prev);
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

/**
 * ইমেইল পাঠানো — Resend REST (fetch; কোনো npm-ডিপেন্ডেন্সি নেই)।
 * RESEND_API_KEY না থাকলে কনসোল-ফলব্যাক (ডেভ-মোড) — কল ব্যর্থ হয় না।
 * @returns {Promise<{ok:boolean, dev?:boolean, error?:string}>}
 */
async function sendMail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'লেখক ফোরাম <onboarding@resend.dev>';
  if (!key) {
    console.log('\n════════════════════════════════════════════════');
    console.log(`[2FA-EMAIL] DEV-FALLBACK (RESEND_API_KEY নেই)`);
    console.log(`[2FA-EMAIL] to: ${to}`);
    console.log(`[2FA-EMAIL] subject: ${subject}`);
    console.log(`[2FA-EMAIL] body(html) length: ${String(html || '').length}`);
    console.log('════════════════════════════════════════════════\n');
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[2FA-EMAIL] resend api error:', res.status, t.slice(0, 200));
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error('[2FA-EMAIL] resend fetch error:', e.message);
    return { ok: false, error: 'resend_network' };
  }
}

/** 2FA অ্যাক্টিভেশন/লগইন-চ্যালেঞ্জের ব্র্যান্ডেড ইমেইল-বডি */
function otpEmailHtml(code, purpose) {
  const title = purpose === 'login' ? 'লগইন ভেরিফিকেশন কোড' : '২-ফ্যাক্টর অ্যাক্টিভেশন কোড';
  return `
  <div style="font-family:'Segoe UI',sans-serif;background:#f0f4f1;padding:28px 12px;">
    <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #E4E6EB;border-radius:14px;overflow:hidden;">
      <div style="background:#052B1F;padding:18px 24px;">
        <span style="color:#6EE7B7;font-size:17px;font-weight:700;">✒ লেখক ফোরাম</span>
        <span style="color:#a7f3d0;font-size:11.5px;display:block;margin-top:2px;">চট্টগ্রাম বিশ্ববিদ্যালয়</span>
      </div>
      <div style="padding:26px 24px;">
        <h2 style="margin:0 0 10px;color:#052B1F;font-size:18px;">${title}</h2>
        <p style="margin:0 0 16px;color:#374151;font-size:13.5px;line-height:1.6;">
          আপনার অ্যাকাউন্টের নিরাপত্তা-কোড নিচে। কাউকে এই কোড <b>দেখাবেন না</b> —
          লেখক ফোরামের কোনো স্টাফ কখনোই এই কোড চাইবে না।
        </p>
        <div style="text-align:center;background:#F0FDF4;border:1px dashed #6EE7B7;border-radius:10px;padding:14px 8px;">
          <span style="font-size:30px;font-weight:800;letter-spacing:8px;color:#047857;">${code}</span>
        </div>
        <p style="margin:14px 0 0;color:#6B7280;font-size:12px;line-height:1.55;">
          এই কোডের মেয়াদ <b>৫ মিনিট</b>। আপনি নিজে চাননি হলে এই ইমেইল এড়িয়ে যান —
          অ্যাকাউন্টে কোনো পরিবর্তন হবে না।
        </p>
      </div>
      <div style="padding:12px 24px;background:#F9FAFB;border-top:1px solid #E4E6EB;">
        <span style="color:#9CA3AF;font-size:11px;">© ${new Date().getFullYear()} লেখক ফোরাম — স্বয়ংক্রিয় বার্তা, উত্তর দেবেন না।</span>
      </div>
    </div>
  </div>`;
}

module.exports = {
  generateOtp,
  issueOtp,
  verifyOtp,
  cooldownLeft,
  sendMail,
  otpEmailHtml,
  maskEmail,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
};
