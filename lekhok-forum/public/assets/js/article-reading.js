/* সেশন ৬৩: পড়ার-অভিজ্ঞতা (article reading experience)
 * • রিডিং-টাইম চিপ সার্ভার থেকে আসে (≈ N মিনিট পড়া)
 * • ফন্ট-সাইজ কন্ট্রোল (A−/A+) — localStorage-এ সংরক্ষিত, প্রতি লেখায় মনে রাখে
 *   (বাংলা লম্বা লেখা মোবাইলে বড় করে পড়ার চাহিদা প্রবল — a11y-সহায়ক)
 * • লেখার-পেশি অগ্রগতি — ভার্টিক্যাল ট্র্যাক + % পিল (article-body-ভিত্তিক)
 * • অবশিষ্ট পড়ার সময়: "আর ~২ মিনিট" — স্ক্রল-স্টেটে লাইভ আপডেট
 * • রিজিউম-রিডিং: পড়ার অবস্থান (স্ক্রল-রেশিও) localStorage-এ; পরের বার এসে
 *   "যেখান থেকে ছেড়েছিলাম" ব্যানার দেখায় → এক ক্লিকে ফিরে যায়
 */
(function () {
  'use strict';

  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }

  var card = document.getElementById('articleCard');
  var body = document.querySelector('.article-body');
  if (!card || !body) return;

  var postId = card.getAttribute('data-post-id');
  var totalMin = parseInt(card.getAttribute('data-read-min'), 10) || 1;

  /* ── ১) ফন্ট-সাইজ কন্ট্রোল ── */
  var FONT_KEY = 'lf_art_font';
  var STEPS = [1, 1.12, 1.26, 1.42];          /* বেসের গুণিতক — বাংলা ফন্টে স্বাভাবিক ধাপ */
  var stepIdx = 0;
  try {
    var saved = parseInt(localStorage.getItem(FONT_KEY) || '0', 10);
    if (saved >= 0 && saved < STEPS.length) stepIdx = saved;
  } catch (e) { /* প্রাইভেট-মোড */ }

  function applyFont() {
    body.style.fontSize = (1.05 * STEPS[stepIdx]).toFixed(3) + 'rem';
    var p = document.getElementById('rtPlus');
    var m = document.getElementById('rtMinus');
    if (p) p.disabled = stepIdx >= STEPS.length - 1;
    if (m) m.disabled = stepIdx <= 0;
    try { localStorage.setItem(FONT_KEY, String(stepIdx)); } catch (e) {}
  }
  var plusBtn = document.getElementById('rtPlus');
  var minusBtn = document.getElementById('rtMinus');
  if (plusBtn) plusBtn.addEventListener('click', function () { if (stepIdx < STEPS.length - 1) { stepIdx++; applyFont(); } });
  if (minusBtn) minusBtn.addEventListener('click', function () { if (stepIdx > 0) { stepIdx--; applyFont(); } });
  applyFont();

  /* ── ২) অগ্রগতি + অবশিষ্ট সময় ── */
  var fill = document.getElementById('rtFill');
  var pct = document.getElementById('rtPct');
  var time = document.getElementById('rtTime');
  var raf = false;
  var lastPct = -1;

  function onScroll() {
    if (raf) return;
    raf = true;
    requestAnimationFrame(function () {
      raf = false;
      var rect = body.getBoundingClientRect();
      var vh = window.innerHeight;
      /* শুরু: বডির শীর্ষ ভিউপোর্টে; শেষ: বডির নিচ ভিউপোর্টের শেষে */
      var total = rect.height + vh * 0.5;
      var done = Math.min(Math.max(vh - rect.top, 0), total);
      var ratio = rect.height > 0 ? Math.min(1, done / total) : 1;
      var p = Math.round(ratio * 100);
      if (p !== lastPct) {
        lastPct = p;
        if (fill) fill.style.height = p + '%';
        if (pct) pct.textContent = bn(p) + '%';
        if (time) {
          var remMin = Math.max(0, Math.ceil(totalMin * (1 - ratio)));
          if (totalMin >= 2 && ratio < 1) {
            time.hidden = false;
            time.innerHTML = '<i class="far fa-clock"></i> আর ~' + bn(remMin) + ' মিনিট';
          } else if (ratio >= 1) {
            /* শেষ হলে উৎসাহ-বার্তা */
            time.hidden = false;
            time.innerHTML = '<i class="fas fa-circle-check"></i> শেষ!';
          } else {
            time.hidden = true;
          }
        }
        savePos(ratio);
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── ৩) রিজিউম-রিডিং (অবস্থান সংরক্ষণ + ব্যানার) ── */
  var POS_KEY = 'lf_read_pos';
  function readPosMap() {
    try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  var saveT = null;
  function savePos(ratio) {
    if (saveT) return;
    saveT = setTimeout(function () {
      saveT = null;
      try {
        var map = readPosMap();
        var prev = map[postId];
        /* প্রায়-শেষ (৯৫%+) হলে সংরক্ষণ বাদ — পরের বার নতুন করে শুরু */
        if (ratio < 0.95 && ratio > 0.05) {
          if (!prev || Math.abs((prev.r || 0) - ratio) > 0.02) {
            map[postId] = { r: +ratio.toFixed(3), t: Date.now() };
            /* শুধু সর্বশেষ ৩০টি লেখা মনে রাখি */
            var keys = Object.keys(map);
            if (keys.length > 30) keys.sort(function (a, b) { return (map[a].t || 0) - (map[b].t || 0); }).slice(0, keys.length - 30).forEach(function (k) { delete map[k]; });
            localStorage.setItem(POS_KEY, JSON.stringify(map));
          }
        } else if (ratio >= 0.95 && prev) {
          delete map[postId];
          localStorage.setItem(POS_KEY, JSON.stringify(map));
        }
      } catch (e) { /* স্টোরেজ না-থাকলে চুপচাপ */ }
    }, 600);
  }

  (function offerResume() {
    var banner = document.getElementById('readResume');
    if (!banner) return;
    var prev = readPosMap()[postId];
    if (!prev || !prev.r || prev.r <= 0.12 || prev.r >= 0.95) return;
    var p = Math.round(prev.r * 100);
    banner.hidden = false;
    banner.innerHTML =
      '<i class="fas fa-bookmark"></i>' +
      '<span>আপনি আগে <strong>' + bn(p) + '%</strong> পড়েছিলেন</span>' +
      '<button type="button" class="rr-go" id="rrGo"><i class="fas fa-location-arrow"></i> যেখান থেকে ছেড়েছিলাম</button>' +
      '<button type="button" class="rr-skip" id="rrSkip" aria-label="বন্ধ করুন">&times;</button>';
    var go = document.getElementById('rrGo');
    var skip = document.getElementById('rrSkip');
    var reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (go) go.addEventListener('click', function () {
      banner.hidden = true;
      var target = body.getBoundingClientRect().top + window.scrollY - 90 + (body.offsetHeight * prev.r);
      target = Math.max(0, target);
      if (reduceMotion) window.scrollTo(0, target);
      else window.scrollTo({ top: target, behavior: 'smooth' });
    });
    if (skip) skip.addEventListener('click', function () {
      banner.hidden = true;
      try { var map = readPosMap(); delete map[postId]; localStorage.setItem(POS_KEY, JSON.stringify(map)); } catch (e) {}
    });
    /* ১২ সেকেন্ড পর নিজে-নিজে সরে যায় — জিদ করে না থাকে */
    setTimeout(function () { banner.hidden = true; }, 12000);
  })();
})();
