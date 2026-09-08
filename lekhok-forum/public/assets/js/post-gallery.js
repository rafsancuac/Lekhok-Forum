/* ─────────────────────────────────────────────────────────────────────────────
 * লেকহক ফোরাম — পোস্ট মাল্টি-ইমেজ গ্যালারি (টাস্ক ১৩, পর্ব ৪, অংশ ক)
 *
 *  • .pg-gallery        → একটি পোস্টের একাধিক ছবি (main + thumbnail strip)
 *  • data-post-lightbox → লাইটবক্স গ্রুপ (এক পোস্টের ছবিগুলো একসাথে নেভিগেট)
 *  • ক্লিক করলে shared lightbox (layout.ejs-এ #pgLightbox) খোলে, prev/next/Esc।
 *
 * বিদ্যমান /gallery পেজের নিজস্ব data-lightbox লাইটবক্সের সাথে কোনো সংঘাত নেই —
 * এখানে আলাদা data-post-lightbox অ্যাট্রিবিউট ব্যবহার করা হয়েছে।
 * ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function ensureLightbox() {
    if (document.getElementById('pgLightbox')) return document.getElementById('pgLightbox');
    var lb = document.createElement('div');
    lb.className = 'lightbox gallery-popup';
    lb.id = 'pgLightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button class="lightbox-close popup-close" data-pg-close aria-label="বন্ধ করুন" title="বন্ধ করুন (Esc)"><i class="fas fa-times"></i></button>' +
      '<div class="popup-content"><div class="popup-image-wrap">' +
      '<img loading="lazy" decoding="async" data-pg-img src="" alt="" /></div>' +
      '<div class="popup-details"><div class="popup-caption" data-pg-caption></div></div></div>' +
      '<div class="lightbox-nav">' +
      '<button data-pg-prev aria-label="আগের ছবি"><i class="fas fa-chevron-left"></i></button>' +
      '<span data-pg-counter></span>' +
      '<button data-pg-next aria-label="পরের ছবি"><i class="fas fa-chevron-right"></i></button>' +
      '</div>';
    document.body.appendChild(lb);
    return lb;
  }

  function init() {
    var galleries = document.querySelectorAll('.pg-gallery');
    if (!galleries.length) return;

    // Thumbnail click → swap main image
    galleries.forEach(function (g) {
      var mainImg = g.querySelector('.pg-main-img');
      var thumbs = g.querySelectorAll('.pg-thumbs img');
      if (!mainImg) return;
      thumbs.forEach(function (t) {
        t.addEventListener('click', function () {
          if (!mainImg) return;
          mainImg.src = t.getAttribute('data-full') || t.src;
          mainImg.dataset.index = t.dataset.index;
          g.querySelectorAll('.pg-thumbs img').forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active');
        });
      });
    });

    // Lightbox (delegated)
    var lb, imgEl, capEl, counterEl;
    var group = [];
    var idx = 0;

    function open(e) {
      var trigger = e.target.closest('[data-post-lightbox]');
      if (!trigger) return;
      var g = trigger.closest('.pg-gallery') || trigger;
      var items = g.querySelectorAll('img[data-full], .pg-main-img');
      // unique + ordered list of full URLs (admin-set order)
      var seen = [];
      group = [];
      var startIdx = 0;
      items.forEach(function (im) {
        var src = im.getAttribute('data-full') || (im.dataset.index !== undefined ? im.src : im.getAttribute('src'));
        if (!src || seen.indexOf(src) !== -1) return;
        seen.push(src);
        group.push(src);
      });
      if (!group.length) return;
      // ক্লিক করা থাম্বনেইলের index থেকে লাইটবক্স খুলি (না থাকলে প্রথম ছবি)
      var clicked = e.target.closest('img[data-full]');
      if (clicked && clicked.dataset.index !== undefined) {
        startIdx = parseInt(clicked.dataset.index, 10) || 0;
        if (startIdx >= group.length) startIdx = 0;
      }
      lb = ensureLightbox();
      imgEl = lb.querySelector('[data-pg-img]');
      capEl = lb.querySelector('[data-pg-caption]');
      counterEl = lb.querySelector('[data-pg-counter]');
      idx = startIdx;
      show(startIdx);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      e.preventDefault();
    }

    function show(i) {
      if (i < 0) i = group.length - 1;
      if (i >= group.length) i = 0;
      idx = i;
      imgEl.src = group[i];
      if (counterEl) counterEl.textContent = (i + 1) + ' / ' + group.length;
      if (capEl) capEl.textContent = '';
    }
    function close() {
      if (!lb) return;
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (imgEl) imgEl.src = '';
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-post-lightbox]')) open(e);
      else if (e.target.closest('[data-pg-close]') || (lb && e.target === lb)) close();
      else if (e.target.closest('[data-pg-prev]')) show(idx - 1);
      else if (e.target.closest('[data-pg-next]')) show(idx + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
