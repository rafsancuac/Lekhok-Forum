/* ═══════════════════════════════════════════════════════════════════════════
   routes/legal.js — আইনি-পেজ (session168 — Google OAuth consent-screen-স্পেক)
   ───────────────────────────────────────────────────────────────────────────
   GET /terms    — ব্যবহারের শর্তাবলি (দ্বিভাষিক: বাংলা + English-summary)
   GET /privacy  — প্রাইভেসি পলিসি (দ্বিভাষিক; Google Drive Limited-Use-স্বীকারোক্তি)

   পাবলিক (লগইন-বিহীন) — Google consent-screen Branding-ফর্মের
   "Application privacy policy link" ও "Terms of service link" এই-URL-ই পাবে:
     https://lekhok-forum.vercel.app/privacy
     https://lekhok-forum.vercel.app/terms
   ভিউ: views/legal/*.ejs — partials/header স্টাইল + utilities.css-শেল
   (.utl-wrap/.utl-hero/.utl-card পুনঃব্যবহার — নতুন CSS শূন্য, টোকেন-শুধু)।
   ═══════════════════════════════════════════════════════════════════════════ */
const express = require('express');
const router = express.Router();

const LEGAL_META = {
  terms: {
    title: 'ব্যবহারের শর্তাবলি',
    desc: 'লেখক ফোরাম ব্যবহারের শর্তাবলি — অ্যাকাউন্ট, কনটেন্ট-নীতি, স্বত্ব ও দায়সীমা।',
    icon: 'fa-file-contract', tok: 'var(--lf-dlx-violet)',
    crumbs: 'আইনি ও নীতিমালা',
  },
  privacy: {
    title: 'প্রাইভেসি পলিসি',
    desc: 'কী তথ্য সংগ্রহ হয়, কীভাবে ব্যবহৃত হয় এবং কীভাবে আপনি নিয়ন্ত্রণ রাখেন।',
    icon: 'fa-user-shield', tok: 'var(--lf-brand-primary)',
    crumbs: 'আইনি ও নীতিমালা',
  },
};

router.get('/terms', (req, res) => {
  res.render('legal/terms', { meta: LEGAL_META.terms, currentPath: '/terms' });
});

router.get('/privacy', (req, res) => {
  res.render('legal/privacy', { meta: LEGAL_META.privacy, currentPath: '/privacy' });
});

module.exports = router;
