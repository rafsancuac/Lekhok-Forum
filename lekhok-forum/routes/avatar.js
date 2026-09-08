const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');

/* ── Session 61: আগে ৩০২-রিডাইরেক্ট দিতাম — সেটা দুই সমস্যা করত:
   ১) CSP `upgrade-insecure-requests` থাকলে http-পেজ থেকে রিডাইরেক্ট-টার্গেট
      https-এ আপগ্রেড হয়ে যায় (লোকাল http ডেভ/QA-তে সব অবতার-ইমেজ ভাঙে)।
   ২) প্রতিটি অবতারে একটি বাড়তি রাউন্ড-ট্রিপ।
   এখন ফাইল ইনলাইন পাঠাই (gender-SVG ও /uploads ফাইল); শুধু বাইরের
   এবসোলিউট URL (Vercel Blob ইত্যাদি) রিডাইরেক্ট করি। ── */

const PUBLIC_ROOT = path.join(__dirname, '..', 'public');

// শর্ট ক্যাশ: অবতার বদলালে দ্রুত সব জায়গায় দেখা যায় (ইউজার-রিপোর্ট অনুযায়ী)
router.get('/:userId', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.set('Vary', 'Accept');
  try {
    const user = await db
      .prepare('SELECT gender, avatar_url FROM users WHERE id = ?')
      .get(req.params.userId);

    if (!user) return sendGenderSvg(res, 'neutral');

    if (user.avatar_url) {
      const u = String(user.avatar_url);
      // এবসোলিউট URL (http/https) → রিডাইরেক্টই ঠিক (CDN/blob)
      if (/^https?:\/\//i.test(u)) return res.redirect(u);
      // লোকাল পাথ → ইনলাইন ফাইল
      return sendLocalFile(res, u);
    }

    const gender = user.gender || 'other';
    return sendGenderSvg(res, gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'neutral');
  } catch (e) {
    // ডিবি-ত্রুটিতেও অন্তত neutral অবতার দিই — প্রোফাইল-ছবি কখনো ফাঁকা না থাকুক
    try { return sendGenderSvg(res, 'neutral'); } catch (_) { /* নিচের fallback */ }
    return res.status(404).end();
  }
});

function sendGenderSvg(res, kind) {
  const file = path.join(PUBLIC_ROOT, 'assets', 'avatars', kind + '.svg');
  if (fs.existsSync(file)) {
    res.set('Content-Type', 'image/svg+xml; charset=utf-8');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.send(fs.readFileSync(file));
  }
  // খুবই ব্যতিক্রমী ফলব্যাক: ফাইল না পেলে redirect (পুরনো আচরণ)
  return res.redirect('/assets/avatars/neutral.svg?v=2');
}

function sendLocalFile(res, urlPath) {
  // কোয়েরি-স্ট্রিং/হ্যাশ বাদ দিয়ে শুধু পাথ নিই
  const clean = String(urlPath).split('?')[0].split('#')[0];
  // শুধু /uploads/… ও /assets/… অনুমোদিত — পাথ-ট্রাভার্সাল বন্ধ
  const rel = clean.startsWith('/') ? clean.slice(1) : clean;
  if (!/^(uploads|assets)\//.test(rel)) return sendGenderSvg(res, 'neutral');
  const file = path.join(PUBLIC_ROOT, rel);
  // রিজলভ-করা পাথ পাবলিক-রুটের ভেতরে কি না — দ্বিগুণ নিশ্চিত
  if (!path.resolve(file).startsWith(PUBLIC_ROOT)) return sendGenderSvg(res, 'neutral');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return sendGenderSvg(res, 'neutral');

  const ext = path.extname(file).toLowerCase();
  const mime = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' }[ext] || 'application/octet-stream';
  res.set('Content-Type', mime);
  return res.sendFile(file);
}

module.exports = router;
