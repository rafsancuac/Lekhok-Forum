/**
 * helpers/security-config.js — কেন্দ্রীভূত সিকিউরিটি কনফিগারেশন (টাস্ক: SECURITY, §86)
 *
 * সব সিকিউরিটি-সংবেদনশীল সুইচ এক জায়গায়। মান তিন স্তর থেকে আসে (অগ্রাধিকার ক্রমে):
 *   1. environment variable (SECURITY_<KEY>)
 *   2. settings টেবিল (db.getSetting — অ্যাডমিন প্যানেল থেকে পরিবর্তনযোগ্য)
 *   3. SECURITY_CONFIG ডিফল্ট
 *
 * fail-closed নীতি: কোনো সুইচ পড়া ব্যর্থ হলে ডিফল্ট (সবচেয়ে নিরাপদ) মান ফেরত।
 * কনফিগ-সিক্রেট কখনো ক্লায়েন্টে যায় না — শুধু boolean flags চাইলে readSecurityFlags()।
 */
const db = require('../db');

const SECURITY_CONFIG = {
  // টাস্কের মূল বিজনেস-রুল: ক্লেইমের জন্য অ্যাডমিন অনুমোদন (বর্তমানে বন্ধ)
  ACCOUNT_CLAIM_REQUIRES_ADMIN_APPROVAL: false,
  // নতুন সেলফ-রেজিস্ট্রেশনে অ্যাডমিন অনুমোদন (default: তাৎক্ষণিক active)
  REQUIRE_REGISTRATION_APPROVAL: false,
  // অ্যাডমিন/সুপার-অ্যাডমিনের জন্য MFA
  REQUIRE_MFA_FOR_ADMIN: true,
  REQUIRE_MFA_FOR_SUPER_ADMIN: true,
  LOGIN_RATE_LIMIT_ENABLED: true,
  CLAIM_RATE_LIMIT_ENABLED: true,
  FILE_UPLOAD_VALIDATION_ENABLED: true,
  AUDIT_LOGGING_ENABLED: true,
  DEBUG_MODE: false,
};

// settings কী ↔ কনফিগ কী ম্যাপিং (অ্যাডমিন প্যানেল টগলগুলোর জন্য)
const SETTING_KEYS = {
  ACCOUNT_CLAIM_REQUIRES_ADMIN_APPROVAL: 'account_claim_requires_admin_approval',
  REQUIRE_REGISTRATION_APPROVAL: 'require_registration_approval',
  REQUIRE_MFA_FOR_ADMIN: 'require_mfa_for_admin',
  REQUIRE_MFA_FOR_SUPER_ADMIN: 'require_mfa_for_super_admin',
};

function envKey(key) { return 'SECURITY_' + key; }

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (v == null) return null;   // "পাওয়া যায়নি" — ডিফল্ট নেব
  const s = String(v).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on', 'enabled'].includes(s)) return true;
  if (['0', 'false', 'no', 'off', 'disabled', ''].includes(s)) return false;
  return null;
}

// একটি কনফিগ কী পড়ুন — env → settings → default (fail-closed)
async function getSecurityValue(key) {
  // 1) environment variable
  const env = process.env[envKey(key)];
  if (env !== undefined && env !== '') {
    const b = toBool(env);
    if (b !== null) return b;
  }
  // 2) settings টেবিল
  try {
    const sk = SETTING_KEYS[key];
    if (sk) {
      const v = await db.getSetting(sk);
      const b = toBool(v);
      if (b !== null) return b;
    }
  } catch (e) { /* settings টেবিল নেই — ডিফল্টে যাই */ }
  // 3) default (fail-closed: ডিফল্টই সবচেয়ে নিরাপদ মান)
  return !!SECURITY_CONFIG[key];
}

// পুরো ফ্ল্যাগ-সেট (boolean) — ক্লায়েন্টে পাঠানো নিরাপদ (সিক্রেট নেই)
async function readSecurityFlags() {
  const out = {};
  for (const k of Object.keys(SECURITY_CONFIG)) {
    out[k] = await getSecurityValue(k);
  }
  return out;
}

// ── উচ্চ-স্তরের হেল্পার (ব্যবসায়িক লেয়ারে ব্যবহৃত) ──────────────────────────
async function isAdminApprovalRequired() {
  return getSecurityValue('ACCOUNT_CLAIM_REQUIRES_ADMIN_APPROVAL');
}
async function isRegistrationApprovalRequired() {
  return getSecurityValue('REQUIRE_REGISTRATION_APPROVAL');
}
async function isMfaRequiredForAdmin() {
  return getSecurityValue('REQUIRE_MFA_FOR_ADMIN');
}
async function isAuditEnabled() {
  return getSecurityValue('AUDIT_LOGGING_ENABLED');
}
function isDebugMode() {
  return !!(process.env.NODE_ENV === 'production' ? false : process.env.DEBUG === '1');
}

module.exports = {
  SECURITY_CONFIG,
  SETTING_KEYS,
  getSecurityValue,
  readSecurityFlags,
  isAdminApprovalRequired,
  isRegistrationApprovalRequired,
  isMfaRequiredForAdmin,
  isAuditEnabled,
  isDebugMode,
};
