/**
 * helpers/rate-limit.js — পুনঃব্যবহারযোগ্য রেট-লিমিট (টাস্ক: SECURITY, §48)
 *
 * ইন-মেমোরি স্লাইডিং-উইন্ডো। key = prefix + identifier (IP / username / email)।
 * serverless-এ প্রতি-ইনস্ট্যান্স (গ্লোবাল নয়) — অবকাঠামো-স্তরের রেট-লিমিট (CDN/WAF)
 * প্রোডাকশনে যুক্ত করা উচিত; এটি অ্যাপ্লিকেশন-লেয়ার ডিফেন্স।
 */

const _hits = new Map();

// মেমোরি-ক্লিনআপ (ম্যাপ বড় হয়ে গেলে পুরনো এন্ট্রি ফেলে দিই)
let _lastClean = Date.now();
function _clean() {
  const now = Date.now();
  if (now - _lastClean < 5 * 60 * 1000) return;   // প্রতি ৫ মিনিটে একবার
  _lastClean = now;
  for (const [k, arr] of _hits) {
    const fresh = arr.filter(([t]) => now - t < 3600 * 1000);
    if (fresh.length) _hits.set(k, fresh);
    else _hits.delete(k);
  }
}

function makeLimiter({ max, windowMs }) {
  return {
    // সীমা পেরিয়েছে কিনা (প্রয়োগের আগে চেক)
    isLimited(key) {
      _clean();
      const now = Date.now();
      const arr = (_hits.get(key) || []).filter(([t]) => now - t < windowMs);
      return arr.length >= max;
    },
    // একটি হিট রেকর্ড
    hit(key) {
      const now = Date.now();
      const arr = (_hits.get(key) || []).filter(([t]) => now - t < windowMs);
      arr.push([now]);
      _hits.set(key, arr);
    },
    // বাকি কতটুকু (ঐচ্ছিক)
    remaining(key) {
      const now = Date.now();
      const arr = (_hits.get(key) || []).filter(([t]) => now - t < windowMs);
      return Math.max(0, max - arr.length);
    },
    // সফল হলে রিসেট (যেমন সফল লগইনে কাউন্টার মুছা)
    reset(key) { _hits.delete(key); },
  };
}

// ── সাধারণ ব্যবহৃত লিমিটার ────────────────────────────────────────────────────
// লগইন: IP+identifier প্রতি ১৫ মিনিটে ১০ ব্যর্থ চেষ্টা
const loginLimiter = makeLimiter({ max: 10, windowMs: 15 * 60 * 1000 });
// অ্যাডমিন লগইন: আরও কঠোর — IP+username প্রতি ১৫ মিনিটে ৫
const adminLoginLimiter = makeLimiter({ max: 5, windowMs: 15 * 60 * 1000 });
// ফরগট-পাসওয়ার্ড: IP প্রতি ঘণ্টায় ৫
const forgotLimiter = makeLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
// রেজিস্টার: IP প্রতি ঘণ্টায় ৫
const registerLimiter = makeLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

function clientIp(req) {
  return (req.ip || (req.connection && req.connection.remoteAddress) || 'x');
}

module.exports = {
  makeLimiter,
  loginLimiter,
  adminLoginLimiter,
  forgotLimiter,
  registerLimiter,
  clientIp,
};
