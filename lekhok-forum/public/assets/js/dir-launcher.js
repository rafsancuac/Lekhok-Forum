/* ═══════════════════════════════════════════════════════════════════════════
   dir-launcher.js — ফোরাম ডিরেক্টরি লঞ্চার ইঞ্জিন (সেশন ১৪৭)
   ───────────────────────────────────────────────────────────────────────────
   ৯-ডট ট্রিগার (header.ejs #dlxTrigger) ⇄ প্যানেল (#dlxPanel) টগল + ARIA +
   Escape + বাইরে-ক্লিক-বন্ধ। main.js-এর toggleMega/closeMega-চুক্তির আদলে
   গ্লোবাল নাম (toggleDlx/closeDlx) — ইনলাইন onclick-নির্ভর মার্কআপ-সামঞ্জস্য।

   নোট: পুরনো মেগামেনু-প্রতিস্থাপনের পর main.js-এর toggleMega/closeMega অবশিষ্ট
   (মৃত-কোড, নিরীহ) — মিনিফাইড main.js-সার্জারি-ঝুঁকি এড়ানো হয়েছে।
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var wrap = document.getElementById('dlxWrap');
  var btn = document.getElementById('dlxTrigger');
  var panel = document.getElementById('dlxPanel');
  if (!wrap || !btn || !panel) return;

  function isOpen() { return panel.classList.contains('open'); }

  window.toggleDlx = function (e) {
    if (e) e.stopPropagation();
    var open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  window.closeDlx = function () {
    if (!isOpen()) return;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };

  /* বাইরে-ক্লিক-বন্ধ (ট্রিগারের stopPropagation-এর কারণে টগল-রেস-শূন্য) */
  document.addEventListener('click', function (e) {
    if (isOpen() && !wrap.contains(e.target)) window.closeDlx();
  });

  /* Escape-বন্ধ + ফোকাস-ফেরত (কিবোর্ড-অ্যাক্সেসিবিলিটি) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (isOpen()) {
      e.stopPropagation();
      window.closeDlx();
      try { btn.focus(); } catch (_) {}
    }
  });

  /* প্যানেল-ভেতরে Tab-চক্র প্যানেল-বন্ধ করবে না (closeDlx শুধু ইচ্ছাকৃত-অ্যাকশনে) */
})();
