/* premium.js — সেশন ৫৮: প্রিমিয়াম-ইন্টারঅ্যাকশন লেয়ার (নির্ভরতা-মুক্ত, ES5-নিরাপদ)
   ─────────────────────────────────────────────────────────────────────────
   ১) <html>-এ .prm-js মার্ক — CSS-এর লুকানো-স্টেট শুধু JS-চালু থাকলেই প্রযোজ্য
      (JS লোড-ফেইলে কনটেন্ট কখনো অদৃশ্য থাকবে না)।
   ২) স্ক্রল-রিভিল: ফিড/প্যানেলের কার্ড IntersectionObserver-এ স্ট্যাগার-রিভিল।
   ৩) চওড়া টেবিল → অটো হরাইজন্টাল-স্ক্রল র‍্যাপ (মোবাইল-বান্ধব)।
   ৪) বাটন রিপল-প্রেস (টাচ+মাউস) — হালকা, GPU-বান্ধব।
   ৫) প্রতি ইন্টারফেসে লোড হয়: পাবলিক footer.ejs + অ্যাডমিন সাইডবার + অথ-পেজ।
   */
(function () {
  'use strict';
  if (window.__prm58) return;
  window.__prm58 = 1;

  var doc = document;
  var docEl = doc.documentElement;
  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  docEl.classList.add('prm-js');

  /* ১) স্ক্রল-রিভিল — শুধু ফিড/লিস্ট-কনটেন্টে (নিজেদের .card সম্ভাব্য সাইডবার-স্ট্যাকে নয়)।
        প্রথম ভিউপোর্টে থাকা এলিমেন্ট সাথে সাথেই দৃশ্যমান হয়। */
  function revealInit() {
    if (REDUCED || !('IntersectionObserver' in window)) return;
    var scope = doc.querySelector('.dash-main') || doc.querySelector('.admin-main') || doc.querySelector('.main-content') || doc.body;
    if (!scope) return;
    var cards = scope.querySelectorAll('.card, .feed-card, .post-card, .dash-composer');
    var list = [];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.closest('.settings-shell')) continue;          // সেটিংস-ট্যাব প্যান — CSS-অ্যানিমেশনই থাক
      if (c.querySelector && c.closest('.modal, .dropdown, [hidden]')) continue;
      var r = c.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.92) list.push(c); // নিচের এলিমেন্টগুলোই রিভিল পাবে
    }
    if (!list.length) return;
    for (var j = 0; j < list.length; j++) list[j].classList.add('prm-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, k) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add('prm-in'); }, Math.min(k * 60, 240));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    list.forEach(function (el) { io.observe(el); });
    /* সেফটি-নেট: যেকোনো কারণে ২ সেকেন্ডেও রিভিল না হলে সব দৃশ্যমান করে দিই */
    setTimeout(function () {
      list.forEach(function (el) { el.classList.add('prm-in'); });
    }, 2000);
  }

  /* ২) চওড়া টেবিল → স্ক্রল-র‍্যাপ (মোবাইল লেআউট ভাঙা রোধ) */
  function wrapTables() {
    try {
      var tables = doc.querySelectorAll('.admin-main table, .settings-shell table');
      for (var i = 0; i < tables.length; i++) {
        var t = tables[i];
        if (t.parentElement && t.parentElement.classList && t.parentElement.classList.contains('prm-tbl-scroll')) continue;
        if (t.scrollWidth <= t.clientWidth && t.offsetWidth < window.innerWidth - 40) continue;
        var wrap = doc.createElement('div');
        wrap.className = 'prm-tbl-scroll';
        wrap.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:inherit;';
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      }
    } catch (e) {}
  }
  function tableCss() {
    try {
      var s = doc.getElementById('prmTblCss');
      if (!s) {
        s = doc.createElement('style'); s.id = 'prmTblCss';
        s.textContent = '.prm-tbl-scroll::-webkit-scrollbar{height:6px}.prm-tbl-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}';
        doc.head.appendChild(s);
      }
    } catch (e) {}
  }

  /* ৩) বাটন প্রেস-রিপল (হালকা স্কেল, ::after-মুক্ত — ক্লাস নয়, শুধু CSS-এর উপর ভরসা) */
  function rippleInit() {
    if (REDUCED) return;
    doc.addEventListener('pointerdown', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.btn, .btn-primary, .btn-login, .btn-secondary') : null;
      if (!b) return;
      b.style.transition = 'transform .1s ease';
      b.style.transform = 'scale(.975)';
      var done = function () {
        b.style.transition = 'transform .18s ease';
        b.style.transform = '';
        setTimeout(function () { b.style.transition = ''; }, 200);
      };
      doc.addEventListener('pointerup', done, { once: true });
      doc.addEventListener('pointercancel', done, { once: true });
    }, { passive: true });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { tableCss(); revealInit(); wrapTables(); });
  } else {
    tableCss(); revealInit(); wrapTables();
  }
  window.addEventListener('load', wrapTables);
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(wrapTables, 260);
  });

  rippleInit();
})();
