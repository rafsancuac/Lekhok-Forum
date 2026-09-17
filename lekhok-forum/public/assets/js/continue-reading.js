/* সেশন ১১২+১১৭+১২৩: 'পড়া চালিয়ে যান' — ড্যাশবোর্ড-উইজেট + ফুল-পেজ ইঞ্জিন
 * ─────────────────────────────────────────────────────────────────────
 *  • article-reading.js প্রতিটি লেখার স্ক্রল-অগ্রগতি localStorage 'lf_read_pos'-এ
 *    রাখে (r=অনুপাত, t=টাইমস্ট্যাম্প, সেশন-১১২ থেকে ti=টাইটেল, u=পাথ,
 *    সেশন-১২৩ থেকে c=কভার-URL — ঐচ্ছিক, পুরনো-এন্ট্রিতে নেই → আইকন-ফলব্যাক)।
 *  • উইজেট (dashboard-সাইডবার #crxMount): সর্বশেষ ৩টি অসমাপ্ত লেখা — শূন্য-API,
 *    শূন্য-সার্ভার-লোড, শুধু এই ব্রাউজারের নিজস্ব ডেটা; হেডারে 'সব দেখুন' লিঙ্ক।
 *  • ফুল-পেজ (/me/reading #crxFullMount — সেশন ১১৭): সব-এন্ট্রি টাইল-গ্রিড,
 *    আপেক্ষিক-সময়, 'সব সরান' দুই-ধাপ-বাটন (নেটিভ confirm() নীতি-নিষিদ্ধ),
 *    খালি-অবস্থা, মোট-চিপ; সেশন-১২৩ থেকে টাইল-টপে ১৬:৯ কভার-স্ট্রিপ।
 *  • প্রতি-সারি ×-বাটনে তালিকা-থেকে-সরানো যায়; লিঙ্কে গেলে article-পেজের
 *    'যেখান থেকে ছেড়েছিলাম' ব্যানার অবস্থান-ফিরিয়ে দেয় (session ৬৩)।
 */
(function () {
  'use strict';

  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var widgetMount = document.getElementById('crxMount');
  var fullMount = document.getElementById('crxFullMount');
  if (!widgetMount && !fullMount) return;

  var KEY = 'lf_read_pos';
  function readMap() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeMap(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* প্রাইভেট-মোড */ }
  }

  function allEntries() {
    var m = readMap(), arr = [];
    Object.keys(m).forEach(function (id) {
      var it = m[id];
      /* ti/u-বিহীন পুরনো-এন্ট্রি (সেশন-১১২-এর আগের) বাদ — টাইটেল ছাড়া সারি আঁকা যায় না */
      if (it && it.ti && it.u && it.r > 0.05 && it.r < 0.95) {
        arr.push({ id: id, r: +it.r || 0, t: +it.t || 0, ti: String(it.ti), u: String(it.u), c: String(it.c || '') });
      }
    });
    arr.sort(function (a, b) { return b.t - a.t; });
    return arr;
  }

  /* সেশন ১১৭: আপেক্ষিক-সময় (বাংলা) — আজ/গতকাল/n দিন আগে/তারিখ */
  function relTime(t) {
    var d = new Date(t), now = new Date();
    var start = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var diff = Math.round((start(now) - start(d)) / 86400000);
    var hm = bn(d.getHours()) + ':' + bn(('0' + d.getMinutes()).slice(-2));
    if (diff <= 0) return 'আজ ' + hm;
    if (diff === 1) return 'গতকাল ' + hm;
    if (diff < 7) return bn(diff) + ' দিন আগে';
    try { return d.toLocaleDateString('bn-BD'); } catch (e) { return bn((d.getMonth() + 1)) + '/' + bn(d.getDate()); }
  }

  function pct(r) { return Math.max(1, Math.min(99, Math.round(r * 100))); }

  /* ── সেশন ১২৩: কভার-থাম্বনেইল ──
   * c-URL প্রোডাকশনে যেমন-আছে তেমন ব্যবহৃত; স্যান্ডবক্স-গেটওয়েতে (server.js
   * fetch-guard) window.__lfSbUrl হেল্পার পাথ-অ্যাবসোলিউট URL-এ XTransformPort
   * বসিয়ে দেয় (না-দিলে গেটওয়ে Next.js-এ 404)। প্রোডাকশনে __lfSbUrl undefined →
   * নো-অপ। আইকন সবসময় img-এর নিচে থাকে — লোড-ব্যর্থতায় onerror নিজেই সরে যায়। */
  function coverUrl(u) {
    try { if (typeof window.__lfSbUrl === 'function') u = window.__lfSbUrl(String(u)); } catch (e) { /* অক্ষত */ }
    return String(u);
  }
  function thumbImg(c) {
    if (!c) return '';
    return '<img src="' + esc(coverUrl(c)) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">';
  }

  /* ── ড্যাশবোর্ড-উইজেট (সর্বশেষ ৩) ── */
  function renderWidget() {
    if (!widgetMount) return;
    var list = allEntries().slice(0, 3);
    if (!list.length) { widgetMount.innerHTML = ''; widgetMount.hidden = true; return; }
    var total = allEntries().length;
    var h = '<div class="side-card card crx-card" aria-label="পড়া চালিয়ে যান">'
      + '<h4><i class="fas fa-book-reader" style="color:var(--accent)"></i> পড়া চালিয়ে যান'
      /* সেশন ১১৭: 'সব দেখুন' — ফুল-পেজে পূর্ণ-তালিকা (মোট-কাউন্টসহ) */
      + '<a class="crx-all" href="/me/reading" title="পূর্ণ-তালিকা দেখুন">সব দেখুন'
      + (total > 3 ? ' <b class="crx-all-n">' + bn(total) + '</b>' : '')
      + '<i class="fas fa-angle-right crx-all-arr" aria-hidden="true"></i></a></h4>'
      + '<div class="crx-list">';
    list.forEach(function (it) {
      var p = pct(it.r);
      h += '<div class="crx-row">'
        + '<a class="crx-link" href="' + esc(it.u) + '" title="' + esc(it.ti) + '">'
        + '<span class="crx-rowtop">'
        + '<span class="crx-thumb" aria-hidden="true">' + thumbImg(it.c) + '<i class="fas fa-feather-alt"></i></span>'
        + '<span class="crx-title">' + esc(it.ti) + '</span>'
        + '</span>'
        + '<span class="crx-bar"><span class="crx-bar-fill" style="width:' + p + '%"></span></span>'
        + '<span class="crx-meta"><i class="far fa-clock" aria-hidden="true"></i> ' + bn(p) + '% পড়া হয়েছে</span>'
        + '</a>'
        + '<button type="button" class="crx-x" data-crx-id="' + esc(it.id) + '"'
        + ' aria-label="তালিকা থেকে সরান" title="তালিকা থেকে সরান">&times;</button>'
        + '</div>';
    });
    h += '</div></div>';
    widgetMount.innerHTML = h;
    widgetMount.hidden = false;
  }

  /* ── ফুল-পেজ (সেশন ১১৭): সব-এন্ট্রি টাইল-গ্রিড ── */
  function renderFull() {
    if (!fullMount) return;
    var emptyEl = document.getElementById('crxEmpty');
    var chip = document.getElementById('crxTotalChip');
    var clearBtn = document.getElementById('crxClearAll');
    var list = allEntries();

    if (chip) {
      if (list.length) { chip.textContent = bn(list.length) + ' টি চলমান'; chip.hidden = false; }
      else { chip.hidden = true; }
    }
    if (clearBtn) clearBtn.hidden = list.length === 0;
    if (emptyEl) emptyEl.hidden = list.length > 0;

    if (!list.length) {
      fullMount.innerHTML = '';
      fullMount.hidden = true;
      disarmClear();
      return;
    }
    var h = '';
    list.forEach(function (it) {
      var p = pct(it.r);
      h += '<div class="crx-tile' + (it.c ? ' has-cover' : '') + '" data-crx-tile="' + esc(it.id) + '">'
        + '<a class="crx-link" href="' + esc(it.u) + '" title="' + esc(it.ti) + '">'
        + '<span class="crx-tilecover" aria-hidden="true">' + thumbImg(it.c) + '<i class="fas fa-feather-alt"></i></span>'
        + '<span class="crx-title">' + esc(it.ti) + '</span>'
        + '<span class="crx-bar"><span class="crx-bar-fill" style="width:' + p + '%"></span></span>'
        + '<span class="crx-tile-meta"><b>' + bn(p) + '%</b>'
        + '<span class="crx-tile-day"><i class="far fa-clock" aria-hidden="true"></i> ' + relTime(it.t) + '</span></span>'
        + '</a>'
        + '<button type="button" class="crx-x" data-crx-id="' + esc(it.id) + '"'
        + ' aria-label="তালিকা থেকে সরান" title="তালিকা থেকে সরান">&times;</button>'
        + '</div>';
    });
    fullMount.innerHTML = h;
    fullMount.hidden = false;
  }

  /* 'সব সরান' দুই-ধাপ (নেটিভ-কনফার্ম-নীতি): ১ম-চাপে armed → ৩-সে-পর নিজে-থেমে যায় */
  var clearTimer = null;
  function disarmClear() {
    var btn = document.getElementById('crxClearAll');
    if (!btn) return;
    btn.classList.remove('armed');
    btn.innerHTML = '<i class="fas fa-broom" aria-hidden="true"></i> সব সরান';
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = null; }
  }
  function onClearClick() {
    var btn = document.getElementById('crxClearAll');
    if (!btn || btn.hidden) return;
    if (!btn.classList.contains('armed')) {
      btn.classList.add('armed');
      btn.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> নিশ্চিত? আবার চাপুন';
      clearTimer = setTimeout(disarmClear, 3000);
      return;
    }
    disarmClear();
    writeMap({});
    renderAll();
  }

  function renderAll() { renderWidget(); renderFull(); }

  /* ×-ক্লিকে তালিকা-থেকে-সরান (ডেলিগেট — দুই-সারফেস, রি-রেন্ডার-সেফ) */
  document.addEventListener('click', function (e) {
    var x = e.target.closest && e.target.closest('.crx-x');
    if (x) {
      e.preventDefault();
      var m = readMap();
      delete m[x.getAttribute('data-crx-id')];
      writeMap(m);
      renderAll();
      return;
    }
    var c = e.target.closest && e.target.closest('#crxClearAll');
    if (c) { e.preventDefault(); onClearClick(); }
  });

  renderAll();
})();
