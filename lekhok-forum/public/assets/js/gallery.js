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
  /* ১০৪: load-more ইঞ্জিন-হুক — সেকশন ২.ক-তে অ্যাসাইন হয়; applyFilter-এর
     প্রতি-রানের শেষে ভিজিবল-কাউন্ট জানিয়ে দেয় (শূন্য-ফলাফলে অটো-লোড-চেইন) */
  var galAutoLoad = null;

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
    if (galAutoLoad) galAutoLoad(visibleCount, q);
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

  /* ═══ ২.ক load-more ইঞ্জিন (সেশন ১০৪ — >১০০ ছবির প্রস্তুতি) ═══
     • সেন্টিনেল-ভিউ (IntersectionObserver, ৬০০px-আগে) + ফলব্যাক-বাটন → /gallery/more?page=N
     • append-এর পরে: __galMarkSkeletons + applyFilter (সক্রিয়-ফিল্টার/সার্চ নতুন-কার্ডেও)
     • শূন্য-ফলাফলে অটো-লোড: ফিল্টার/সার্চ সক্রিয় অবস্থায় মিল-শূন্য হলে পরের-পেজ
       স্বয়ংক্রিয় (চেইনে — মিল পাওয়া বা শেষ-পেজ পর্যন্ত); সার্ভার-গার্ড ≤৫০ পেজ */
  var galMore = document.getElementById('galMore');
  if (galMore && masonry) {
    var galSpinner = document.getElementById('galMoreSpinner');
    var galBtn = document.getElementById('galMoreBtn');
    var galHint = document.getElementById('galMoreHint');
    var galEmptyLoadMore = document.getElementById('galEmptyLoadMore');
    var galPage = parseInt(galMore.getAttribute('data-page') || '1', 10) || 1;
    var galTotal = parseInt(galMore.getAttribute('data-total') || '0', 10) || 0;
    var galBusy = false, galDone = false;

    function galFinish() {
      galDone = true;
      galMore.classList.add('gal-more--done');
      if (galSpinner) galSpinner.hidden = true;
      if (galBtn) {
        galBtn.disabled = true;
        galBtn.innerHTML = 'সব ছবি দেখানো হয়েছে <i class="fas fa-check-circle"></i>';
      }
      if (galHint) galHint.textContent = 'প্রদর্শিত ' + bn(galTotal) + ' / মোট ' + bn(galTotal) + ' ছবি';
    }

    function galLoadNext() {
      if (galBusy || galDone) return Promise.resolve(false);
      galBusy = true;
      if (galSpinner) galSpinner.hidden = false;
      if (galBtn) galBtn.hidden = true;
      var next = galPage + 1;
      return fetch('/gallery/more?page=' + next, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.ok || !data.html) { galFinish(); return false; }
          masonry.insertAdjacentHTML('beforeend', data.html);
          galPage = data.page || next;
          galTotal = data.total || galTotal;
          if (window.__galMarkSkeletons) window.__galMarkSkeletons(masonry);
          if (galHint && !galDone) galHint.textContent = 'প্রদর্শিত ' + bn(data.shown) + ' / মোট ' + bn(galTotal) + ' ছবি';
          if (!data.hasMore) { galFinish(); return false; }
          return true;
        })
        .catch(function () { galFinish(); return false; })
        .then(function (progressed) {
          galBusy = false;
          if (galSpinner) galSpinner.hidden = true;
          if (!galDone && galBtn) galBtn.hidden = false;
          /* applyFilter এখানেই — galBusy=false-এর পরে, নইলে অটো-লোড-হুক
             busy-গার্ডে আটকে চেইন ভেঙে যায় (মিল-শূন্য হলে পরের-পেজ) */
          applyFilter();
          return progressed;
        });
    }

    /* অটো-লোড-চেইন: ফিল্টার/সার্চ-সক্রিয় + মিল-শূন্য + আরও-ছবি-বাকি → পরের-পেজ */
    galAutoLoad = function (visibleCount, q) {
      if (galEmptyLoadMore) galEmptyLoadMore.hidden = !(galDone === false && visibleCount === 0);
      if (galDone || galBusy) return;
      var filtered = activeCat !== 'all' || q;
      if (filtered && visibleCount === 0) galLoadNext(); /* applyFilter-পুনঃরানে চেইন এগিয়ে যায় */
    };

    if (galBtn) galBtn.addEventListener('click', galLoadNext);
    if (galEmptyLoadMore) galEmptyLoadMore.addEventListener('click', galLoadNext);
    if ('IntersectionObserver' in window) {
      var galSentinel = document.createElement('div');
      galSentinel.className = 'gal-more__sentinel';
      galSentinel.setAttribute('aria-hidden', 'true');
      galMore.parentNode.insertBefore(galSentinel, galMore);
      var galIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting && !galDone) galLoadNext(); });
      }, { rootMargin: '600px 0px' });
      galIO.observe(galSentinel);
    }
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
    // থাম্বনেইল-স্ট্রিপ (সেশন ৯৮) — ওপেনে বিল্ড, নেভিগেটে মার্ক
    if (lb.classList.contains('open')) {
      if (window.__galBuildThumbs && !stripBuilt) { window.__galBuildThumbs(photos, idx); stripBuilt = true; }
      else if (window.__galMarkThumb) window.__galMarkThumb(idx);
    }
  }
  var stripBuilt = false;

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
    stripBuilt = false; /* নতুন সংগ্রহ — থাম্বনেইল পুনর্নির্মাণ */
    render();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.__galBuildThumbs) { window.__galBuildThumbs(photos, idx); stripBuilt = true; }
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
  /* থাম্বনেইল-ক্লিক জাম্প (সেশন ৯৮) */
  window.__galGoTo = function (i) {
    if (i < 0 || i >= photos.length) return;
    idx = i;
    render();
  };

  /* ১০৪: ইভেন্ট-ডেলিগেশন — /gallery/more থেকে append-হওয়া কার্ডের অ্যাংকরেও
     লাইটবক্স কাজ করে (আগের লোড-টাইম-বাইন্ডিংয়ে নতুন-কার্ড ক্লিকে কাঁচা-ছবিতে
     নেভিগেট করত — পেজিনেশন-ব্রেকিং বাগ); ডকুমেন্ট-লেভেলে একবারই বাঁধাই। */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-lightbox]') : null;
    if (!a) return;
    e.preventDefault();
    open(a);
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

/* ═══ ৫. ইমেজ-লোড স্কেলেটন (সেশন ৯৮) — লোড-শেষে শিমার-বন্ধ ═══ */
(function () {
  /* ১০৪: root-প্যারাম — /gallery/more থেকে append-হওয়া কার্ডেও পুনঃবাঁধাই;
     window.__galMarkSkeletons(document.getElementById('galMasonry')) দিয়ে হুক */
  window.__galMarkSkeletons = function (root) {
    var scope = root && root.querySelectorAll ? root : document;
    var imgs = scope.querySelectorAll('.gal-card__link img, .gal-album__cover, .gal-recent__photo img');
    imgs.forEach(function (img) {
      if (img.dataset.galSkeleton === '1') return; /* আইডি-ইমপোটেন্ট */
      img.dataset.galSkeleton = '1';
      var mark = function () { img.classList.add('is-loaded'); };
      if (img.complete && img.naturalWidth > 0) mark();
      else img.addEventListener('load', mark);
      img.addEventListener('error', mark); /* ভাঙা-ছবিতেও শিমার আটকে থাকবে না */
    });
  };
  window.__galMarkSkeletons(document);
})();

/* ═══ ৬. লাইটবক্স থাম্বনেইল-স্ট্রিপ (সেশন ৯৮) ═══ */
(function () {
  var lb = document.getElementById('lightbox');
  var strip = document.getElementById('lbThumbs');
  if (!lb || !strip) return;
  var imgs = [];

  window.__galBuildThumbs = function (photos, activeIdx) {
    strip.innerHTML = '';
    imgs = [];
    if (!photos || photos.length < 2) { strip.hidden = true; return; }
    strip.hidden = false;
    photos.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gal-lb__thumb' + (i === activeIdx ? ' is-active' : '');
      b.setAttribute('aria-label', 'ছবি ' + (i + 1));
      var im = document.createElement('img');
      im.src = p.src; im.alt = ''; im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', function () {
        if (window.__galGoTo) window.__galGoTo(i);
      });
      strip.appendChild(b);
      imgs.push(b);
    });
  };
  window.__galMarkThumb = function (activeIdx) {
    imgs.forEach(function (b, i) {
      b.classList.toggle('is-active', i === activeIdx);
      if (i === activeIdx && b.scrollIntoView) {
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });
  };
})();

/* ═══ ৭. ইন-পেজ ড্র্যাগ-ড্রপ মাল্টি-ফটো আপলোডার (সেশন ৯৮ — স্টাফ-অনলি) ═══ */
(function () {
  'use strict';
  var modal = document.getElementById('galUploader');
  if (!modal) return; /* স্টাফ-নন পেজে মার্কআপ-ই নেই */

  var openBtn = document.getElementById('galUploadBtn');
  var closeBtn = document.getElementById('galUplClose');
  var drop = document.getElementById('galUplDrop');
  var input = document.getElementById('galUplInput');
  var previews = document.getElementById('galUplPreviews');
  var submitBtn = document.getElementById('galUplSubmit');
  var result = document.getElementById('galUplResult');
  var progress = document.getElementById('galUplProgress');
  var bar = document.getElementById('galUplBar');
  var fTitle = document.getElementById('galUplTitle');
  var fCat = document.getElementById('galUplCat');
  var fPhotog = document.getElementById('galUplPhotog');
  var fDate = document.getElementById('galUplDate');
  var fCaption = document.getElementById('galUplCaption');

  var MAX_FILES = 12, MAX_BYTES = 8 * 1024 * 1024;
  var files = []; /* { file, url (objectURL), name } */
  var uploading = false;

  function showModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
  }
  function hideModal() {
    if (uploading) return; /* আপলোড-চলাকালীন বন্ধ নয় */
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', showModal);
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) hideModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open') && !uploading) hideModal();
  });

  function addFiles(list) {
    var rejected = [];
    Array.prototype.forEach.call(list, function (f) {
      if (files.length >= MAX_FILES) { rejected.push(f.name + ' (সীমা ' + MAX_FILES + ')'); return; }
      if (!/^image\//.test(f.type || '')) { rejected.push(f.name + ' (ছবি নয়)'); return; }
      if (f.size > MAX_BYTES) { rejected.push(f.name + ' (৮MB+)'); return; }
      files.push({ file: f, url: URL.createObjectURL(f), name: f.name });
    });
    renderPreviews();
    if (rejected.length) setResult('বাদ: ' + rejected.slice(0, 3).join(', ') + (rejected.length > 3 ? '…' : ''), true);
    else setResult('');
  }
  function renderPreviews() {
    previews.innerHTML = '';
    files.forEach(function (it, i) {
      var d = document.createElement('div');
      d.className = 'gal-upl__pv';
      var im = document.createElement('img');
      im.src = it.url; im.alt = '';
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'gal-upl__pv-x';
      x.innerHTML = '<i class="fas fa-xmark"></i>';
      x.setAttribute('aria-label', it.name + ' বাদ দিন');
      x.addEventListener('click', function () {
        URL.revokeObjectURL(it.url);
        files.splice(i, 1);
        renderPreviews(); setResult('');
      });
      var nm = document.createElement('span');
      nm.className = 'gal-upl__pv-name';
      nm.textContent = it.name;
      d.appendChild(im); d.appendChild(x); d.appendChild(nm);
      previews.appendChild(d);
    });
    if (submitBtn) submitBtn.disabled = files.length === 0 || uploading;
  }
  function setResult(msg, isErr) {
    if (!result) return;
    result.textContent = msg || '';
    result.classList.toggle('is-err', !!isErr);
  }

  if (drop) {
    drop.addEventListener('click', function () { if (input) input.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (input) input.click(); } });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-drag'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }
  if (input) input.addEventListener('change', function () {
    if (input.files) addFiles(input.files);
    input.value = '';
  });

  if (submitBtn) submitBtn.addEventListener('click', function () {
    if (uploading || !files.length) return;
    var tokMeta = document.querySelector('meta[name="csrf-token"]');
    var tok = tokMeta ? tokMeta.content : '';
    if (!tok) { setResult('নিরাপত্তা-টোকেন পাওয়া যায়নি — পেজ রিফ্রেশ করুন', true); return; }

    var fd = new FormData();
    files.forEach(function (it) { fd.append('images', it.file, it.file.name); });
    if (fTitle && fTitle.value.trim()) fd.append('title', fTitle.value.trim());
    if (fCat) fd.append('category', fCat.value);
    if (fPhotog && fPhotog.value.trim()) fd.append('photographer', fPhotog.value.trim());
    if (fDate && fDate.value.trim()) fd.append('event_date', fDate.value.trim());
    if (fCaption && fCaption.value.trim()) fd.append('caption', fCaption.value.trim());

    uploading = true;
    submitBtn.disabled = true;
    if (progress) progress.hidden = false;
    if (bar) bar.style.width = '0%';
    setResult('আপলোড চলছে…');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/gallery/bulk');
    xhr.setRequestHeader('X-CSRF-Token', tok);
    xhr.setRequestHeader('Accept', 'application/json');
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable && bar) bar.style.width = Math.round((e.loaded / e.total) * 100) + '%';
      });
    }
    xhr.addEventListener('load', function () {
      uploading = false;
      if (progress) progress.hidden = true;
      var data = null;
      try { data = JSON.parse(xhr.responseText); } catch (e) { /* নীরব */ }
      if (xhr.status === 200 && data && data.ok) {
        setResult('✓ ' + data.added + 'টি ছবি সফলভাবে যোগ হয়েছে — পেজ রিফ্রেশ হচ্ছে…', false);
        files.forEach(function (it) { URL.revokeObjectURL(it.url); });
        var sep = location.search ? '&' : '?';
        setTimeout(function () { location.href = location.pathname + sep + '_u=' + Date.now() + '#galPhotosView'; }, 900);
      } else {
        setResult('✗ ' + ((data && data.error) || 'আপলোড ব্যর্থ (' + xhr.status + ')'), true);
        if (submitBtn) submitBtn.disabled = files.length === 0;
      }
    });
    xhr.addEventListener('error', function () {
      uploading = false;
      if (progress) progress.hidden = true;
      setResult('✗ নেটওয়ার্ক-সমস্যা — আবার চেষ্টা করুন', true);
      if (submitBtn) submitBtn.disabled = files.length === 0;
    });
    xhr.send(fd);
  });
})();

/* ═══ ৮. স্টাফ-সেলফ-হিল (সেশন ৯৮) — stale-ক্যাশ (SWR) কপিতে আপলোড-বাটন
       গায়েব থাকলে whoami.staff প্রমাণ হলে এক-বার ?_u= রিফ্রেশ (session-72
       auth-sync প্যাটার্ন; লুপ-গার্ড: ?_u= থাকলে আর রিফ্রেশ নয়) ═══ */
(function () {
  if (document.getElementById('galUploadBtn')) return; /* বাটন আছে — স্বাস্থ্যকর কপি */
  if (/[?&]_u=/.test(location.search)) return;         /* রিফ্রেশ-পরেও নেই → সত্যিই নন-স্টাফ */
  try {
    fetch('/api/whoami', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.staff) {
          location.replace(location.pathname + '?_u=' + Date.now());
        }
      })
      .catch(function () { /* নীরব */ });
  } catch (e) { /* নীরব */ }
})();
