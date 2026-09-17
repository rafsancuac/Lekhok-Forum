/* ═══════════════════════════════════════════════════════════════════════
   লেখক ফোরাম — চিত্রশালা ইন্টারঅ্যাকশন (gallery.js) · সেশন ৯৭
   ─────────────────────────────────────────────────────────────────────
   ① ডুয়াল-ভিউ টগল (মেসনারি ছবি ↔ অ্যালবাম) — localStorage-স্মৃতি
   ② ক্যাটাগরি পিল-ফিল্টার + লাইভ সার্চ (শিরোনাম/ক্যাপশন/ক্যাটাগরি/ফটোগ্রাফার)
   ③ অ্যালবাম-কার্ড ক্লিক → ওই ক্যাটাগরি-ফিল্টারসহ ছবি-ভিউতে জাম্প
   ④ লাইটবক্স: কীবোর্ড (Esc/←/→/Z) + টাচ-সোয়াইপ + জুম-টগল + ডাউনলোড +
      শেয়ার (Web-Share API, ফলব্যাক: ক্লিপবোর্ড) + বাংলা-সংখ্যা কাউন্টার +
      লোডিং-স্পিনার + মেটাডেটা-বার
   ডিপেন্ডেন্সি-শূন্য (ভ্যানিলা) — IIFE-স্কোপড, গ্লোবাল লিক-শূন্য
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var masonry = document.getElementById('galMasonry');
  var photosView = document.getElementById('galPhotosView');
  var albumsView = document.getElementById('galAlbumsView');
  var emptyBox = document.getElementById('galEmpty');
  var searchInput = document.getElementById('galSearch');
  var searchClear = document.getElementById('galSearchClear');
  var VIEW_KEY = 'lekhokGalleryView';

  /* ── বাংলা-সংখ্যা হেল্পার ── */
  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }

  /* ═══ ১. ডুয়াল-ভিউ টগল ═══ */
  var btnPhotos = document.getElementById('viewPhotosBtn');
  var btnAlbums = document.getElementById('viewAlbumsBtn');

  function setView(mode, persist) {
    var photos = mode !== 'albums';
    if (btnPhotos && btnAlbums) {
      btnPhotos.classList.toggle('is-active', photos);
      btnAlbums.classList.toggle('is-active', !photos);
      btnPhotos.setAttribute('aria-selected', photos ? 'true' : 'false');
      btnAlbums.setAttribute('aria-selected', photos ? 'false' : 'true');
    }
    if (photosView) photosView.hidden = !photos;
    if (albumsView) albumsView.hidden = photos;
    if (persist !== false) { try { localStorage.setItem(VIEW_KEY, photos ? 'photos' : 'albums'); } catch (e) { /* নীরব */ } }
  }
  if (btnPhotos) btnPhotos.addEventListener('click', function () { setView('photos'); });
  if (btnAlbums) btnAlbums.addEventListener('click', function () { setView('albums'); });
  // আগের পছন্দ পুনরুদ্ধার (ডিফল্ট: ছবিসমূহ)
  try {
    var saved = localStorage.getItem(VIEW_KEY);
    if (saved === 'albums' && albumsView) setView('albums', false);
  } catch (e) { /* নীরব */ }

  /* ═══ ২. ক্যাটাগরি ফিল্টার + লাইভ সার্চ ═══ */
  var activeCat = 'all';
  var pills = document.querySelectorAll('.gal-pill');

  function applyFilter() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchClear) searchClear.hidden = !q;
    var visibleCount = 0;
    if (masonry) {
      var cards = masonry.querySelectorAll('.gal-card');
      cards.forEach(function (card) {
        var catOk = activeCat === 'all' || card.dataset.cat === activeCat;
        var qOk = !q || (card.dataset.search || '').indexOf(q) !== -1;
        var show = catOk && qOk;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
    }
    if (emptyBox) emptyBox.hidden = visibleCount !== 0;
    pills.forEach(function (p) { p.classList.toggle('is-active', p.dataset.cat === activeCat); });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      activeCat = pill.dataset.cat || 'all';
      applyFilter();
    });
  });
  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Escape') { searchInput.value = ''; applyFilter(); } });
  }
  if (searchClear) {
    searchClear.addEventListener('click', function () { searchInput.value = ''; applyFilter(); searchInput.focus(); });
  }
  var resetBtn = document.getElementById('galReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      activeCat = 'all';
      if (searchInput) searchInput.value = '';
      applyFilter();
      setView('photos');
    });
  }

  /* ═══ ৩. অ্যালবাম-কার্ড → ছবি-ভিউ জাম্প ═══ */
  document.querySelectorAll('.gal-album__open').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCat = btn.dataset.gotoCat || 'all';
      setView('photos');
      applyFilter();
      var target = document.getElementById('galPhotosView');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ═══ ৪. লাইটবক্স ═══ */
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var lbImg = document.getElementById('lightboxImg');
  var lbCat = document.getElementById('lbCat');
  var lbCap = document.getElementById('lightboxCaption');
  var lbMeta = document.getElementById('lbMeta');
  var lbCounter = document.getElementById('lbCounter');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbClose = document.getElementById('lightboxClose');
  var lbZoomBtn = document.getElementById('lbZoom');
  var lbDownload = document.getElementById('lbDownload');
  var lbShare = document.getElementById('lbShare');
  var lbSpinner = lb.querySelector('.gal-lb__spinner') ? lb : null;

  var photos = [];
  var idx = 0;
  var lastFocus = null;

  function collectVisible() {
    photos = [];
    document.querySelectorAll('[data-lightbox]').forEach(function (a) {
      if (a.offsetParent === null) return; // hidden (অন্য ভিউ/ফিল্টার)
      photos.push({
        src: a.getAttribute('href'),
        title: a.dataset.title || '',
        caption: a.dataset.caption || '',
        catlabel: a.dataset.catlabel || '',
        date: a.dataset.date || '',
        photographer: a.dataset.photographer || ''
      });
    });
  }

  function render() {
    var p = photos[idx];
    if (!p) return;
    if (lbSpinner) lb.classList.add('is-loading');
    lbImg.classList.remove('is-zoomed');
    lbImg.src = p.src;
    lbImg.alt = p.caption || p.title || 'গ্যালারির ছবি';
    lbCat.textContent = p.catlabel || '';
    lbCap.textContent = p.caption || p.title || '';
    var metaHtml = '';
    if (p.date) metaHtml += '<span><i class="far fa-calendar"></i> ' + escapeHtml(p.date) + '</span>';
    if (p.photographer) metaHtml += '<span><i class="fas fa-camera-retro"></i> ' + escapeHtml(p.photographer) + '</span>';
    lbMeta.innerHTML = metaHtml;
    lbCounter.textContent = bn(idx + 1) + ' / ' + bn(photos.length);
    if (lbDownload) lbDownload.setAttribute('href', p.src);
    // নেভিগেশন-বাটন দৃশ্যমালতা (একক-ছবিতে লুকানো)
    if (lbPrev) lbPrev.hidden = photos.length < 2;
    if (lbNext) lbNext.hidden = photos.length < 2;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function open(startEl) {
    collectVisible();
    if (!photos.length) return;
    var src = startEl.getAttribute('href');
    var found = photos.findIndex(function (p) { return p.src === src; });
    idx = found >= 0 ? found : 0;
    lastFocus = document.activeElement;
    render();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function go(step) {
    if (photos.length < 2) return;
    idx = (idx + step + photos.length) % photos.length;
    render();
  }

  document.querySelectorAll('[data-lightbox]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      open(a);
    });
  });

  if (lbClose) lbClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); go(1); });

  // জুম — ছবিতে ক্লিক বা Z-কী
  function toggleZoom() { if (lbImg) lbImg.classList.toggle('is-zoomed'); }
  if (lbImg) lbImg.addEventListener('click', toggleZoom);
  if (lbZoomBtn) lbZoomBtn.addEventListener('click', toggleZoom);

  // শেয়ার — Web-Share API, ফলব্যাক ক্লিপবোর্ড
  if (lbShare) {
    lbShare.addEventListener('click', function () {
      var p = photos[idx];
      if (!p) return;
      var url = p.src ? new URL(p.src, location.href).href : location.href;
      if (navigator.share) {
        navigator.share({ title: p.caption || 'লেখক ফোরাম — চিত্রশালা', url: url }).catch(function () { /* বাতিল-নীরব */ });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          lbShare.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(function () { lbShare.innerHTML = '<i class="fas fa-share-nodes"></i>'; }, 1400);
        }).catch(function () { /* নীরব */ });
      }
    });
  }

  // কীবোর্ড শর্টকাট
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'z' || e.key === 'Z') toggleZoom();
  });

  // টাচ-সোয়াইপ (মোবাইল)
  var touchX = null, touchY = null;
  lb.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? -1 : 1);
    touchX = touchY = null;
  }, { passive: true });

  // প্রি-লোড সমাপ্তি-সনাক্ত (স্পিনার বন্ধ)
  if (lbImg) {
    lbImg.addEventListener('load', function () { lb.classList.remove('is-loading'); });
    lbImg.addEventListener('error', function () { lb.classList.remove('is-loading'); });
  }

  /* প্রাথমিক ফিল্টার-স্টেট (ভিউ-পুনরুদ্ধারের পরেও কার্ড-সামঞ্জস্য) */
  applyFilter();
})();
