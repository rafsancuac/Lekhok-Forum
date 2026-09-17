/* ─────────────────────────────────────────────────────────────────────────────
 * লেখক ফোরাম — সেশন ১০০ (রোডম্যাপ-০৭ 🔴): FB-স্টাইল কম্পোজার-মোডাল ইঞ্জিন
 *
 * ① ওপেন/ক্লোজ (backdrop-ক্লিক + Esc + X) + ফোকাস-ট্র্যাপ
 * ② খসড়া-অটোসেভ (localStorage `lfCpm100:<uid>` — ৪০০ms ডিবাউন্স) + ওপেনে রিস্টোর
 * ③ খসড়া-গার্ড: কনটেন্ট-থাকা-অবস্থায় ক্লোস = confirm; beforeunload গার্ড
 * ④ অটো-গ্রো টেক্সটএরিয়া + বাংলা ক্যারেক্টার-কাউন্টার
 * ⑤ ছবি: ফাইল-পিকার + ফুল-মোডাল ড্র্যাগ-ড্রপ (ওভারলে-টিপ) → POST /upload-images
 *    → স্ট্রিপ-প্রিভিউ + per-রিমুভ → hidden images JSON (article-form-এর চুক্তি-মতো)
 * ⑥ সাবমিট: fetch POST /articles/new (redirect follow → আর্টিকেল-পেজে নেভিগেশন);
 *    ব্যর্থতায় নেটিভ form.submit() ফলব্যাক (সার্ভারের এরর-পেজ দেখায়)
 * ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var modal = document.getElementById('composerModal');
  if (!modal) return;

  var dialog = modal.querySelector('.cpm-dialog');
  var form = document.getElementById('composerForm');
  var titleIn = document.getElementById('cpmTitleInput');
  var bodyIn = document.getElementById('cpmBody');
  var tagsIn = document.getElementById('cpmTags');
  var imagesIn = document.getElementById('cpmImagesInput');
  var strip = document.getElementById('cpmStrip');
  var dropTip = document.getElementById('cpmDropTip');
  var fileIn = document.getElementById('cpmFile');
  var addImgBtn = document.getElementById('cpmAddImg');
  var openBtns = [document.getElementById('composerOpen')].concat(
    Array.prototype.slice.call(document.querySelectorAll('.js-composer-open'))
  );
  var closeBtn = document.getElementById('composerClose');
  var restoreNote = document.getElementById('cpmRestoreNote');
  var discardBtn = document.getElementById('cpmDraftDiscard');
  var postBtn = document.getElementById('cpmPostBtn');
  var countEl = document.getElementById('cpmCharCount');
  var errEl = document.getElementById('cpmError');
  var draftNote = document.getElementById('cpmDraftNote');

  var imgs = [];
  var uploading = false;
  var submitting = false;
  var draftTimer = null;
  var lastFocused = null;

  function bn(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
  function uid() {
    var b = document.body;
    return (b && (b.getAttribute('data-uid') || b.getAttribute('data-auth'))) || 'anon';
  }
  function draftKey() { return 'lfCpm100:' + uid(); }
  function hasContent() {
    return !!(titleIn.value.trim() || bodyIn.value.trim() || tagsIn.value.trim() || imgs.length);
  }

  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }

  function refreshState() {
    var ready = titleIn.value.trim() && bodyIn.value.trim();
    postBtn.disabled = !ready || uploading || submitting;
    countEl.textContent = bn(bodyIn.value.length) + ' অক্ষর';
    countEl.classList.toggle('warn', bodyIn.value.length > 2800);
  }

  function renderStrip() {
    strip.innerHTML = '';
    if (!imgs.length) { strip.hidden = true; return; }
    strip.hidden = false;
    imgs.forEach(function (u, idx) {
      var cell = document.createElement('div');
      cell.className = 'cpm-cell';
      var im = document.createElement('img');
      im.src = u; im.alt = 'ছবি ' + (idx + 1); im.loading = 'lazy'; im.decoding = 'async';
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'cpm-cell-x';
      x.setAttribute('aria-label', 'ছবি ' + (idx + 1) + ' সরান'); x.title = 'সরান';
      x.innerHTML = '<i class="fas fa-times"></i>';
      x.addEventListener('click', function () {
        imgs.splice(idx, 1);
        imagesIn.value = JSON.stringify(imgs);
        renderStrip(); saveDraft(); refreshState();
      });
      cell.appendChild(im); cell.appendChild(x);
      strip.appendChild(cell);
    });
  }

  function setError(msg) {
    if (!msg) { errEl.hidden = true; errEl.textContent = ''; return; }
    errEl.hidden = false; errEl.textContent = msg;
  }

  // ── খসড়া ────────────────────────────────────────────────────────────────
  function saveDraft(silent) {
    try {
      if (!hasContent()) { localStorage.removeItem(draftKey()); if (draftNote) draftNote.hidden = true; return; }
      localStorage.setItem(draftKey(), JSON.stringify({ t: titleIn.value, b: bodyIn.value, g: tagsIn.value, i: imgs }));
      if (draftNote && !silent) {
        draftNote.hidden = false;
        draftNote.classList.remove('flash');
        void draftNote.offsetWidth; // reflow — অ্যানিমেশন পুনঃচালু
        draftNote.classList.add('flash');
      }
    } catch (_) {}
  }
  function restoreDraft() {
    try {
      var raw = localStorage.getItem(draftKey());
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (!d || (!d.t && !d.b && !d.i)) return false;
      titleIn.value = d.t || '';
      bodyIn.value = d.b || '';
      tagsIn.value = d.g || '';
      imgs = Array.isArray(d.i) ? d.i : [];
      imagesIn.value = JSON.stringify(imgs);
      renderStrip();
      return true;
    } catch (_) { return false; }
  }
  function clearDraft() {
    try { localStorage.removeItem(draftKey()); } catch (_) {}
    if (draftNote) draftNote.hidden = true;
    if (restoreNote) restoreNote.hidden = true;
  }
  function discardDraft() {
    titleIn.value = ''; bodyIn.value = ''; tagsIn.value = '';
    imgs = [];
    imagesIn.value = '[]';
    renderStrip();
    clearDraft();
    refreshState(); autoGrow();
    titleIn.focus();
  }
  if (discardBtn) discardBtn.addEventListener('click', discardDraft);

  // ── ওপেন/ক্লোস ────────────────────────────────────────────────────────────
  var wasDraftRestored = false;
  function openModal() {
    lastFocused = document.activeElement;
    wasDraftRestored = restoreDraft();
    if (restoreNote) restoreNote.hidden = !wasDraftRestored;
    modal.hidden = false;
    document.documentElement.classList.add('cpm-open');
    refreshState();
    setTimeout(function () { titleIn.focus(); }, 60);
  }
  function closeModal(force) {
    if (submitting) return;
    if (!force && hasContent()) {
      if (!window.confirm('খসড়া সংরক্ষিত থাকবে — মোডাল বন্ধ করবেন?\n(পরে আবার খুললে খসড়া ফিরে পাবেন)')) return;
      saveDraft(true);
    }
    modal.hidden = true;
    document.documentElement.classList.remove('cpm-open');
    setError(null);
    if (restoreNote) restoreNote.hidden = true;
    if (lastFocused && lastFocused.focus) try { lastFocused.focus(); } catch (_) {}
  }

  openBtns.forEach(function (b) { if (b) b.addEventListener('click', openModal); });
  closeBtn.addEventListener('click', function () { closeModal(false); });
  modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeModal(false); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(false); return; }
    if (e.key === 'Tab') { // সহজ ফোকাস-ট্র্যাপ
      var f = dialog.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
      var list = Array.prototype.filter.call(f, function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('beforeunload', function (e) {
    if (!modal.hidden && hasContent() && !submitting) { e.preventDefault(); e.returnValue = ''; }
  });

  // ── অটো-গ্রো + কাউন্টার + খসড়া-ডিবাউন্স ────────────────────────────────
  function autoGrow() {
    bodyIn.style.height = 'auto';
    bodyIn.style.height = Math.min(bodyIn.scrollHeight, 320) + 'px';
  }
  bodyIn.addEventListener('input', function () { autoGrow(); refreshState(); scheduleDraft(); });
  titleIn.addEventListener('input', function () { refreshState(); scheduleDraft(); });
  tagsIn.addEventListener('input', function () { scheduleDraft(); });
  function scheduleDraft() {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(function () { saveDraft(false); }, 400);
  }

  // ── ছবি: পিকার + ড্র্যাগ-ড্রপ ─────────────────────────────────────────────
  addImgBtn.addEventListener('click', function () { fileIn.click(); });
  fileIn.addEventListener('change', function () {
    if (fileIn.files && fileIn.files.length) uploadFiles(fileIn.files);
    fileIn.value = ''; // একই ফাইল পুনঃবাছাইয়েও change চলে
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    dialog.addEventListener(ev, function (e) {
      if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') === -1) return;
      e.preventDefault();
      dialog.classList.add('cpm-drag');
      dropTip.hidden = false;
    });
  });
  ['dragleave', 'dragend'].forEach(function (ev) {
    dialog.addEventListener(ev, function (e) {
      if (e.target !== dialog && dialog.contains(e.relatedTarget)) return;
      dialog.classList.remove('cpm-drag');
      dropTip.hidden = true;
    });
  });
  dialog.addEventListener('drop', function (e) {
    e.preventDefault();
    dialog.classList.remove('cpm-drag');
    dropTip.hidden = true;
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      var files = Array.prototype.filter.call(e.dataTransfer.files, function (f) {
        return /^image\//.test(f.type);
      });
      if (files.length) uploadFiles(files);
      else setError('শুধু ছবি ফাইল ড্রপ করা যাবে');
    }
  });

  function uploadFiles(fileList) {
    if (uploading) return;
    if (imgs.length >= 6) { setError('সর্বোচ্চ ৬টি ছবি যোগ করা যায়'); return; }
    var room = 6 - imgs.length;
    var files = Array.prototype.slice.call(fileList, 0, room);
    if (!files.length) return;
    setError(null);
    uploading = true;
    postBtn.disabled = true;
    var fd = new FormData();
    files.forEach(function (f) { fd.append('images', f); });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload-images', true);
    xhr.setRequestHeader('x-csrf-token', csrf());
    xhr.onload = function () {
      uploading = false; refreshState();
      var r = {};
      try { r = JSON.parse(xhr.responseText); } catch (_) { r = { ok: false }; }
      if (r.ok && r.urls && r.urls.length) {
        imgs = imgs.concat(r.urls);
        imagesIn.value = JSON.stringify(imgs);
        renderStrip(); saveDraft(false);
      } else {
        setError(r.error || 'আপলোড ব্যর্থ — আবার চেষ্টা করুন');
      }
    };
    xhr.onerror = function () { uploading = false; refreshState(); setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); };
    xhr.send(fd);
  }

  // ── সাবমিট ────────────────────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setError(null);
    if (!titleIn.value.trim() || !bodyIn.value.trim()) {
      setError('শিরোনাম ও বিষয়বস্তু দুটোই দিন');
      return;
    }
    if (submitting || uploading) return;
    submitting = true;
    postBtn.disabled = true;
    postBtn.innerHTML = 'পোস্ট হচ্ছে… <i class="fas fa-circle-notch fa-spin"></i>';
    // সেশন ১০০-হটফিক্স ×২: redirect-free JSON সাবমিট — headless-ব্রাউজারে
    // POST→303-follow "Failed to fetch" (E2E-প্রমাণিত; /upload-images-JSON-পাথ
    // ঠিক)। /api/articles/quick একই চুক্তি, রেসপন্স {ok, url} → client-নেভিগেশন।
    // নেটিভ ফলব্যাক: JS-বিহীন ব্রাউজারে ফর্ম action=/articles/new-ই চলে।
    fetch('/api/articles/quick', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'x-csrf-token': csrf(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleIn.value.trim(),
        body: bodyIn.value,
        tags: tagsIn.value.trim(),
        images: imgs
      })
    })
      .then(function (res) { return res.json().catch(function () { return { ok: false }; }); })
      .then(function (r) {
        if (r && r.ok && r.url) {
          clearDraft();
          window.location.href = r.url;
          return;
        }
        submitting = false;
        postBtn.disabled = false;
        postBtn.innerHTML = 'পোস্ট করুন <i class="fas fa-paper-plane"></i>';
        setError((r && r.error) || 'পোস্ট ব্যর্থ — আবার চেষ্টা করুন');
      })
      .catch(function () {
        submitting = false;
        postBtn.disabled = false;
        postBtn.innerHTML = 'পোস্ট করুন <i class="fas fa-paper-plane"></i>';
        setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন');
      });
  });

  refreshState();
  autoGrow();
})();
