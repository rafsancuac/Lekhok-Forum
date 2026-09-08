/**
 * helpers/totp.js — TOTP (RFC 6238) / MFA — ডিপেন্ডেন্সি-ফ্রি
 *
 * Node-এর built-in crypto দিয়ে HMAC-SHA1 ভিত্তিক TOTP (Google Authenticator /
 * Authy / 1Password প্রভৃতি অ্যাপের সাথে সামঞ্জস্যপূর্ণ)। কোনো বহিরাগত সার্ভিস
 * বা প্যাকেজ লাগে না (টাকা/ডোমেইন ছাড়াই কাজ করে)।
 *
 * নিরাপত্তা: সিক্রেট base32; যাচাই ±১ স্টেপ উইন্ডোতে হয় (clock skew সহনশীল)।
 */

const crypto = require('crypto');

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf) {
  let bits = 0, value = 0, out = '';
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  str = String(str || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (let i = 0; i < str.length; i++) {
    value = (value << 5) | B32.indexOf(str[i]);
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

// HOTP core: HMAC-SHA1(secret, 8-byte big-endian counter) → 6 digits
function hotp(secret, counter) {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, '0');
}

function generateSecret(bytes = 20) {
  return base32Encode(crypto.randomBytes(bytes));
}

function currentTotp(secret, step = 30) {
  return hotp(secret, Math.floor(Date.now() / 1000 / step));
}

function verifyTotp(secret, code, { step = 30, window = 1 } = {}) {
  code = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let i = -window; i <= window; i++) {
    if (hotp(secret, counter + i) === code) return true;
  }
  return false;
}

function otpauthUri(secret, label, issuer = 'লেখক ফোরাম') {
  const enc = encodeURIComponent;
  return `otpauth://totp/${enc(issuer)}:${enc(label)}?secret=${secret}&issuer=${enc(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// ── ব্যাকআপ কোড (রিকভারি) — প্লেইনটেক্সট জেনারেট হয়, হ্যাশ করে সংরক্ষণ করা হয় ──
function generateBackupCodes(count = 10) {
  const plain = [];
  for (let i = 0; i < count; i++) {
    plain.push(crypto.randomBytes(4).toString('hex').toUpperCase()); // 8 hex chars
  }
  return plain;
}
function hashBackupCodes(codes) {
  return codes.map(c => crypto.createHash('sha256').update(c).digest('hex'));
}
// একটি দেওয়া কোড ব্যাকআপ-লিস্টে মেলে কিনা; মিললে সেই হ্যাশ বাদ দিয়ে ফেরত
function consumeBackupCode(code, hashedCodes) {
  const h = crypto.createHash('sha256').update(String(code || '').trim().toUpperCase()).digest('hex');
  const idx = (hashedCodes || []).indexOf(h);
  if (idx === -1) return { ok: false, remaining: hashedCodes };
  const remaining = hashedCodes.slice();
  remaining.splice(idx, 1);
  return { ok: true, remaining };
}

module.exports = {
  generateSecret,
  currentTotp,
  verifyTotp,
  otpauthUri,
  generateBackupCodes,
  hashBackupCodes,
  consumeBackupCode,
};
