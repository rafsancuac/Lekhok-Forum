/* ─────────────────────────────────────────────────────────────────────────────
 * লেখক ফোরাম — সেশন ১৫৩ (ইউজার-স্পেক A-to-Z): FB-স্টাইল রিচ-কম্পোজার ইঞ্জিন
 * (সেশন-১০০ বক্স-কম্পোজারের সম্পূর্ণ-প্রতিস্থাপন — ট্রিগার-ওয়্যারিং চুক্তি অক্ষুণ্ণ)
 *
 * ① ওপেন/ক্লোজ (backdrop-ক্লিক + Esc + X) + ফোকাস-ট্র্যাপ + স্ক্রল-লক
 * ② দুই-ভিউ: MAIN কম্পোজার ↔ MORE স্লাইড-ইন সাব-মেনু (থ্রি-ডট/ডক-ক্লিক; ব্যাক-বাটন)
 * ③ বর্ডারহীন contentEditable ক্যানভাস (ইনপুট-বক্স নেই) + MS-অফিস-বেসিক
 *    ফরম্যাটিং (formatBlock h2/h3, bold/italic/underline/strike, ul/ol,
 *    justify L/C/R, removeFormat) + queryCommandState-ভিত্তিক অ্যাকটিভ-স্টেট
 * ④ পেস্ট = প্লেইন-টেক্সট (কম্পোজার-কনটেন্ট পরিষ্কার রাখা)
 * ⑤ 'Aa' গ্রেডিয়েন্ট-প্যালেট (fbg1..fbg8) — মিডিয়া-উপস্থিতিতে অটো-বন্ধ (FB-চুক্তি)
 * ⑥ মিডিয়া: পিকার + ফুল-মোডাল ড্র্যাগ-ড্রপ → POST /upload-media (ছবি/ভিডিও/অডিও;
 *    ক্লায়েন্ট-প্রি-ভ্যালিডেশন: মাইম + সাইজ-ক্যাপ image 8MB/video 64MB/audio 16MB)
 *    → কোলাজ-প্রিভিউ (ফিড-লেআউটের মিনি-মিরর ১/২/৩/৪/৫+ ও +N) + per-রিমুভ
 * ⑦ অডিয়েন্স (PUBLIC/FRIENDS/ONLY_ME) + অনুভূতি-চিপ + চেক-ইন + লাইফ-ইভেন্ট
 * ⑧ খসড়া-অটোসেভ (localStorage `lfCpm153:<uid>` — ৪০০ms ডিবাউন্স) + রিস্টোর-নোট
 * ⑨ সাবমিট: JSON POST /api/posts/compose → /articles/:id-তে নেভিগেশন;
 *    Ctrl+Enter শর্টকাট; ব্যর্থতায় ইনলাইন-এরর (কনটেন্ট-লস শূন্য)
 * ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var modal = document.getElementById('composerModal');
  if (!modal) return;

  var form = document.getElementById('composerForm');
  var titleEl = document.getElementById('fbmTitle');
  var backBtn = document.getElementById('fbmBack');
  var closeBtn = document.getElementById('composerClose');
  var viewMain = document.getElementById('fbmViewMain');
  var viewMore = document.getElementById('fbmViewMore');
  var editor = document.getElementById('fbmEditor');
  var canvas = document.getElementById('fbmCanvas');
  var audienceSel = document.getElementById('fbmAudience');
  var feelingChip = document.getElementById('fbmFeelingChip');
  var feelingChipTxt = feelingChip ? feelingChip.querySelector('span') : null;
  var locChip = document.getElementById('fbmLocChip');
  var locChipTxt = locChip ? locChip.querySelector('span') : null;
  var restoreNote = document.getElementById('fbmRestoreNote');
  var discardBtn = document.getElementById('fbmDraftDiscard');
  var palette = document.getElementById('fbmPalette');
  var aaToggle = document.getElementById('fbmAaToggle');
  var dotsRow = document.getElementById('fbmDots');
  var bgReset = document.getElementById('fbmBgReset');
  var mediaBox = document.getElementById('fbmMedia');
  var dropTip = document.getElementById('fbmDropTip');
  var fileIn = document.getElementById('fbmFile');
  var errEl = document.getElementById('fbmError');
  var postBtn = document.getElementById('cpmPostBtn');
  var countEl = document.getElementById('fbmCharCount');
  var draftNote = document.getElementById('fbmDraftNote');
  var locInput = document.getElementById('fbmLocInput');

  var addMediaBtn = document.getElementById('fbmAddMedia');
  var feelQuick = document.getElementById('fbmFeelingQuick');
  var locQuick = document.getElementById('fbmLocQuick');
  var moreBtn = document.getElementById('fbmMore');
  var moreMediaBtn = document.getElementById('fbmMoreMedia');
  var moreVoiceBtn = document.getElementById('fbmMoreVoice');
  var feelGrid = document.getElementById('fbmFeelGrid');
  var locSetBtn = document.getElementById('fbmLocSet');
  var moreClearBtn = document.getElementById('fbmMoreClear');

  var openBtns = [document.getElementById('composerOpen')].concat(
    Array.prototype.slice.call(document.querySelectorAll('.js-composer-open'))
  );

  var CAPS = { image: 8 * 1024 * 1024, video: 64 * 1024 * 1024, audio: 16 * 1024 * 1024 };
  var CAP_LABEL = { image: '৮ MB', video: '৬৪ MB', audio: '১৬ MB' };
  var MAX_MEDIA = 12;

  var bgKey = null;            // 'fbg1'..'fbg8' | null
  var media = [];              // [{url, type}]
  var uploading = false;
  var submitting = false;
  var draftTimer = null;
  var draftRestored = false;
  var lastFocused = null;

  function bn(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
  function uid() {
    var b = document.body;
    return (b && (b.getAttribute('data-uid') || b.getAttribute('data-auth'))) || 'anon';
  }
  function draftKey() { return 'lfCpm153:' + uid(); }
  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }
  function plainText() {
    return (editor.innerText || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
  }
  function hasContent() {
    return !!(plainText() || media.length || bgKey);
  }
  function showErr(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.hidden = !msg;
  }
  function setType(v) {
    if (draftNote) draftNote.hidden = v !== 'draft';
    if (postBtn) postBtn.disabled = (v === 'busy');
  }

  /* ── ① ওপেন/ক্লোজ + ফোকাস-ট্র্যাপ ─────────────────────────────────────── */
  function isOpen() { return !modal.hidden; }
  function open() {
    if (isOpen()) return;
    modal.hidden = false;
    document.documentElement.classList.add('cpm-open');
    lastFocused = document.activeElement;
    showErr('');
    restoreDraft();
    refreshState();
    setTimeout(function () { try { editor.focus(); } catch (e) {} }, 60);
    document.addEventListener('keydown', onKeydown, true);
  }
  function close(force) {
    if (!isOpen()) return;
    if (!force && hasContent() && !submitting) {
      var ok = window.confirm('লেখা অসম্পূর্ণ — খসড়া সংরক্ষিত আছে। পোস্ট-বাক্স বন্ধ করবেন?');
      if (!ok) return;
    }
    saveDraft(true);
    modal.hidden = true;
    document.documentElement.classList.remove('cpm-open');
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
  }
  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (!viewMore.hidden) { showView('MAIN'); e.preventDefault(); e.stopPropagation(); return; }
      if (dotsRow && !dotsRow.hidden) { dotsRow.hidden = true; syncAa(); e.preventDefault(); return; }
      close();
    }
    /* ফোকাস-ট্র্যাপ */
    if (e.key === 'Tab' && isOpen()) {
      var focusables = modal.querySelectorAll('button:not([hidden]):not([disabled]), input:not([hidden]):not([type="file"]), select, [contenteditable="true"], a[href]');
      var list = Array.prototype.filter.call(focusables, function (el) { return el.offsetParent !== null; });
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  }
  modal.addEventListener('mousedown', function (e) { if (e.target === modal) close(); });
  if (closeBtn) closeBtn.addEventListener('click', function () { close(); });
  openBtns.forEach(function (b) { if (b) b.addEventListener('click', open); });

  /* ── ② ভিউ-সুইচ (MAIN ↔ MORE স্লাইড) ───────────────────────────────────── */
  function showView(v) {
    var more = v === 'MORE';
    if (viewMore) viewMore.hidden = !more;
    if (viewMain) viewMain.hidden = more;
    if (backBtn) backBtn.hidden = !more;
    if (titleEl) titleEl.textContent = more ? 'পোস্টে যুক্ত করুন' : 'পোস্ট তৈরি করুন';
    if (!more && locInput) locInput.value = '';
  }
  if (backBtn) backBtn.addEventListener('click', function () { showView('MAIN'); });
  if (moreBtn) moreBtn.addEventListener('click', function () { showView('MORE'); });
  if (feelQuick) feelQuick.addEventListener('click', function () { showView('MORE'); });
  if (locQuick) locQuick.addEventListener('click', function () { showView('MORE'); setTimeout(function () { if (locInput) locInput.focus(); }, 120); });
  if (moreMediaBtn) moreMediaBtn.addEventListener('click', function () { fileIn && fileIn.click(); });
  if (moreVoiceBtn) moreVoiceBtn.addEventListener('click', function () { pickFiles('audio'); });

  /* ── ③ ফরম্যাটিং-টুলবার (execCommand + অ্যাকটিভ-স্টেট) ──────────────────── */
  function exec(cmd, val) {
    editor.focus();
    try { document.execCommand(cmd, false, val || null); } catch (e) {}
    syncToolbar();
    scheduleDraft();
  }
  function syncToolbar() {
    var tools = modal.querySelectorAll('.fbm-tool153[data-cmd]');
    Array.prototype.forEach.call(tools, function (btn) {
      var cmd = btn.getAttribute('data-cmd');
      var on = false;
      try { on = document.queryCommandState(cmd); } catch (e) {}
      btn.classList.toggle('is-active', !!on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var blocks = modal.querySelectorAll('.fbm-tool153[data-block]');
    var cur = '';
    try { cur = String(document.queryCommandValue('formatBlock') || '').toLowerCase().replace(/[<>]/g, ''); } catch (e) {}
    Array.prototype.forEach.call(blocks, function (btn) {
      var on = btn.getAttribute('data-block') === cur;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  Array.prototype.forEach.call(modal.querySelectorAll('.fbm-tool153[data-cmd]'), function (btn) {
    btn.addEventListener('mousedown', function (e) { e.preventDefault(); }); // সিলেকশন-হারানো বন্ধ
    btn.addEventListener('click', function () { exec(btn.getAttribute('data-cmd')); });
  });
  Array.prototype.forEach.call(modal.querySelectorAll('.fbm-tool153[data-block]'), function (btn) {
    btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
    btn.addEventListener('click', function () {
      var tag = btn.getAttribute('data-block');
      var cur = '';
      try { cur = String(document.queryCommandValue('formatBlock') || '').toLowerCase().replace(/[<>]/g, ''); } catch (e) {}
      exec('formatBlock', cur === tag ? '<p>' : '<' + tag + '>');
    });
  });
  document.addEventListener('selectionchange', function () {
    if (isOpen()) syncToolbar();
  });

  /* পেস্ট = প্লেইন-টেক্সট (রিচ-জাবার নয়) */
  editor.addEventListener('paste', function (e) {
    if (e.clipboardData && e.clipboardData.getData) {
      e.preventDefault();
      var txt = e.clipboardData.getData('text/plain') || '';
      try { document.execCommand('insertText', false, txt); } catch (err) {
        editor.appendChild(document.createTextNode(txt));
      }
      scheduleDraft();
    }
  });
  editor.addEventListener('input', function () { refreshState(); scheduleDraft(); });
  editor.addEventListener('keyup', syncToolbar);
  editor.addEventListener('mouseup', syncToolbar);

  /* ── ⑤ 'Aa' গ্রেডিয়েন্ট-প্যালেট ─────────────────────────────────────────── */
  function syncAa() {
    if (!palette) return;
    palette.hidden = !!media.length;               // মিডিয়া থাকলে পটভূমি বন্ধ (FB-চুক্তি)
    Array.prototype.forEach.call(modal.querySelectorAll('.fbm-dot153'), function (d) {
      d.classList.toggle('is-active', d.getAttribute('data-bg') === bgKey);
    });
    if (aaToggle) {
      aaToggle.classList.toggle('is-active', !!bgKey);
      aaToggle.setAttribute('aria-expanded', dotsRow && !dotsRow.hidden ? 'true' : 'false');
    }
    canvas.classList.toggle('has-bg', !!bgKey);
    if (bgKey) canvas.setAttribute('data-bgkey', bgKey); else canvas.removeAttribute('data-bgkey');
  }
  if (aaToggle) aaToggle.addEventListener('click', function () { if (dotsRow) dotsRow.hidden = !dotsRow.hidden; syncAa(); });
  Array.prototype.forEach.call(modal.querySelectorAll('.fbm-dot153'), function (d) {
    d.addEventListener('click', function () { bgKey = d.getAttribute('data-bg'); syncAa(); scheduleDraft(); });
  });
  if (bgReset) bgReset.addEventListener('click', function () { bgKey = null; syncAa(); scheduleDraft(); });

  /* ── ⑥ মিডিয়া-আপলোড + কোলাজ-প্রিভিউ ────────────────────────────────────── */
  function fileKind(f) {
    if (!f) return null;
    if (/^image\//.test(f.type)) return 'image';
    if (/^video\//.test(f.type)) return 'video';
    if (/^audio\//.test(f.type)) return 'audio';
    return null;
  }
  function pickFiles(kindFilter) {
    if (!fileIn) return;
    if (kindFilter === 'audio') fileIn.setAttribute('accept', 'audio/*');
    else fileIn.setAttribute('accept', 'image/*,video/*,audio/*');
    fileIn.click();
  }
  if (addMediaBtn) addMediaBtn.addEventListener('click', function () { pickFiles(); });
  if (fileIn) fileIn.addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    uploadFiles(files);
  });

  /* ফুল-মোডাল ড্র্যাগ-ড্রপ (সেশন-১০০-রীতি অব্যাহত) */
  ['dragenter', 'dragover'].forEach(function (ev) {
    modal.addEventListener(ev, function (e) { e.preventDefault(); if (dropTip) dropTip.hidden = false; });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    modal.addEventListener(ev, function (e) {
      e.preventDefault();
      if (ev === 'drop') {
        var files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
        uploadFiles(files);
      }
      if (dropTip) dropTip.hidden = true;
    });
  });

  function uploadFiles(files) {
    if (!files || !files.length) return;
    var room = MAX_MEDIA - media.length;
    if (room <= 0) { showErr('সর্বোচ্চ ' + bn(MAX_MEDIA) + ' টি মিডিয়া যোগ করা যায়'); return; }
    if (files.length > room) { files = files.slice(0, room); showErr('প্রথম ' + bn(room) + ' টি নেওয়া হলো (সীমা ' + bn(MAX_MEDIA) + ')'); }
    for (var i = 0; i < files.length; i++) {
      var k = fileKind(files[i]);
      if (!k) { showErr('অসমর্থিত ফাইল: ' + (files[i].name || 'অজানা')); return; }
      if (files[i].size > CAPS[k]) { showErr('"' + files[i].name + '" ' + (k === 'image' ? 'ছবি' : k === 'video' ? 'ভিডিও' : 'অডিও') + '-সীমা ছাড়িয়েছে (' + CAP_LABEL[k] + ')'); return; }
    }
    uploading = true; showErr(''); setType('busy'); renderMedia();
    var fd = new FormData();
    files.forEach(function (f) { fd.append('files', f); });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload-media', true);
    xhr.setRequestHeader('x-csrf-token', csrf());
    xhr.onload = function () {
      uploading = false; setType('idle');
      var r = {};
      try { r = JSON.parse(xhr.responseText); } catch (e) { r = { ok: false }; }
      if (xhr.status === 401) { window.location.href = '/login'; return; }
      if (r.ok && Array.isArray(r.media)) {
        r.media.forEach(function (m) {
          if (media.length < MAX_MEDIA) media.push({ url: String(m.url || ''), type: String(m.type || 'image') });
        });
        bgKey = null;                     // মিডিয়া এলেই পটভূমি অটো-বন্ধ (স্পেক-চুক্তি)
        renderMedia(); syncAa(); refreshState(); scheduleDraft();
      } else {
        showErr(r.error || 'আপলোড ব্যর্থ — আবার চেষ্টা করুন');
        renderMedia();
      }
    };
    xhr.onerror = function () { uploading = false; setType('idle'); showErr('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); renderMedia(); };
    xhr.send(fd);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function mediaCell(m, idx, cls, extra) {
    var cell = el('div', 'fbm-cell153 ' + (cls || ''));
    if (m.type === 'video') cell.appendChild(el('video', '', '<source src="' + m.url + '">'));
    else if (m.type === 'audio') {
      var au = el('div', 'fbm-cell-audio153', '<i class="fas fa-music" aria-hidden="true"></i><span>অডিও ' + bn(idx + 1) + '</span>');
      cell.appendChild(au);
    } else {
      var im = document.createElement('img');
      im.src = m.url; im.alt = 'মিডিয়া ' + (idx + 1); im.loading = 'lazy'; im.decoding = 'async';
      cell.appendChild(im);
    }
    if (extra) cell.appendChild(extra);
    var x = el('button', 'fbm-cell-x153', '<i class="fas fa-times" aria-hidden="true"></i>');
    x.type = 'button';
    x.setAttribute('aria-label', 'মিডিয়া ' + (idx + 1) + ' সরান');
    x.title = 'সরান';
    x.addEventListener('click', function () { media.splice(idx, 1); if (!media.length) bgKey = bgKey; renderMedia(); syncAa(); refreshState(); scheduleDraft(); });
    cell.appendChild(x);
    return cell;
  }

  /* কোলাজ-প্রিভিউ — ফিড-লেআউটের মিনি-মিরর (১ ফুল / ২ গ্রিড / ৩-৪ লিড+স্তূপ / ৫+ → +N) */
  function renderMedia() {
    if (!mediaBox) return;
    mediaBox.innerHTML = '';
    mediaBox.className = 'fbm-media153';
    if (!media.length) { mediaBox.hidden = true; return; }
    mediaBox.hidden = false;
    var n = media.length;
    mediaBox.classList.add('fbm-media-n' + Math.min(n, 5));
    var wrap = el('div', 'fbm-grid153 fbm-grid-n' + Math.min(n, 5));
    var vis = n >= 5 ? 4 : n;
    media.slice(0, vis).forEach(function (m, i) {
      var cls = 'fbm-lead153';
      var plus = null;
      if (n >= 5 && i === vis - 1) {
        var rest = n - vis;
        plus = el('div', 'fbm-plus153', '<span><i class="fas fa-plus" aria-hidden="true"></i> ' + bn(rest) + '</span>');
        plus.setAttribute('aria-label', 'আরও ' + rest + ' টি মিডিয়া');
      }
      wrap.appendChild(mediaCell(m, i, cls, plus));
    });
    mediaBox.appendChild(wrap);
  }

  /* ── ⑦ অনুভূতি / চেক-ইন / ক্লিয়ার ──────────────────────────────────────── */
  var feeling = null, location = null;
  function syncCtx() {
    if (feelingChip) { feelingChip.hidden = !feeling; if (feelingChipTxt) feelingChipTxt.textContent = feeling || ''; }
    if (locChip) { locChip.hidden = !location; if (locChipTxt) locChipTxt.textContent = location || ''; }
  }
  if (feelGrid) feelGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.fbm-feel-chip153');
    if (!b) return;
    feeling = (feeling === b.getAttribute('data-feel')) ? null : b.getAttribute('data-feel');
    Array.prototype.forEach.call(feelGrid.querySelectorAll('.fbm-feel-chip153'), function (c) {
      c.classList.toggle('is-active', c === b && !!feeling);
    });
    syncCtx(); showView('MAIN'); refreshState(); scheduleDraft();
  });
  if (locSetBtn) locSetBtn.addEventListener('click', function () {
    var v = locInput ? locInput.value.trim() : '';
    if (!v) { if (locInput) locInput.focus(); return; }
    location = v.slice(0, 80);
    syncCtx(); showView('MAIN'); refreshState(); scheduleDraft();
  });
  if (locInput) locInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (locSetBtn) locSetBtn.click(); } });
  if (feelingChip) feelingChip.querySelector('.fbm-ctx-x153').addEventListener('click', function () { feeling = null; syncCtx(); refreshState(); scheduleDraft(); });
  if (locChip) locChip.querySelector('.fbm-ctx-x153').addEventListener('click', function () { location = null; syncCtx(); refreshState(); scheduleDraft(); });
  if (moreClearBtn) moreClearBtn.addEventListener('click', function () {
    media = []; feeling = null; location = null; bgKey = null;
    renderMedia(); syncAa(); syncCtx(); showView('MAIN'); refreshState(); scheduleDraft();
  });

  /* ── ⑧ খসড়া-অটোসেভ (lfCpm153) ─────────────────────────────────────────── */
  function draftPayload() {
    return JSON.stringify({
      html: editor.innerHTML, bg: bgKey, feeling: feeling, location: location,
      audience: audienceSel ? audienceSel.value : 'PUBLIC',
      media: media, at: Date.now()
    });
  }
  function saveDraft(silent) {
    if (!hasContent()) { try { localStorage.removeItem(draftKey()); } catch (e) {} return; }
    try { localStorage.setItem(draftKey(), draftPayload()); if (!silent) { setType('draft'); setTimeout(function () { setType('idle'); }, 1600); } } catch (e) {}
  }
  function scheduleDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () { saveDraft(false); }, 400);
  }
  function restoreDraft() {
    draftRestored = false;
    if (restoreNote) restoreNote.hidden = true;
    var raw = null;
    try { raw = localStorage.getItem(draftKey()); } catch (e) {}
    if (!raw) return;
    var d = null;
    try { d = JSON.parse(raw); } catch (e) {}
    if (!d || (!d.html && !(d.media || []).length && !d.bg)) return;
    editor.innerHTML = String(d.html || '');
    bgKey = d.bg || null;
    feeling = d.feeling || null; location = d.location || null;
    if (audienceSel && d.audience) audienceSel.value = d.audience;
    media = Array.isArray(d.media) ? d.media.slice(0, MAX_MEDIA) : [];
    draftRestored = true;
    renderMedia(); syncAa(); syncCtx();
    if (restoreNote) restoreNote.hidden = false;
  }
  if (discardBtn) discardBtn.addEventListener('click', function () {
    try { localStorage.removeItem(draftKey()); } catch (e) {}
    editor.innerHTML = ''; bgKey = null; feeling = null; location = null; media = [];
    if (audienceSel) audienceSel.value = 'PUBLIC';
    draftRestored = false;
    if (restoreNote) restoreNote.hidden = true;
    renderMedia(); syncAa(); syncCtx(); refreshState();
  });

  window.addEventListener('beforeunload', function (e) {
    if (isOpen() && hasContent() && !submitting) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ── ⑨ স্টেট + সাবমিট ───────────────────────────────────────────────────── */
  function refreshState() {
    var t = plainText();
    var ready = !!(t || media.length);
    if (postBtn) postBtn.disabled = !ready || uploading || submitting;
    if (countEl) countEl.textContent = bn(t.length) + ' অক্ষর';
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting || uploading) return;
    var t = plainText();
    if (!t && !media.length) { showErr('কিছু লিখুন বা মিডিয়া যোগ করুন'); return; }
    submitting = true; setType('busy'); showErr('');
    fetch('/api/posts/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
      credentials: 'same-origin',
      body: JSON.stringify({
        content: editor.innerHTML,
        background_color: bgKey,
        feeling: feeling,
        location: location,
        audience: audienceSel ? audienceSel.value : 'PUBLIC',
        media: media
      })
    }).then(function (r) {
      if (r.status === 401) { window.location.href = '/login'; throw new Error('login'); }
      return r.json().catch(function () { return { ok: false }; });
    }).then(function (r) {
      if (r && r.ok && r.url) {
        try { localStorage.removeItem(draftKey()); } catch (e) {}
        submitting = false;
        window.location.href = r.url;
      } else {
        submitting = false; setType('idle');
        showErr((r && r.error) || 'পোস্ট সংরক্ষণ ব্যর্থ — আবার চেষ্টা করুন');
      }
    }).catch(function (err) {
      if (String(err && err.message) === 'login') return;
      submitting = false; setType('idle');
      showErr('নেটওয়ার্ক সমস্যা — ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন');
    });
  });

  /* সিঙ্ক-ইনিশিয়াল */
  syncAa(); syncCtx(); renderMedia(); refreshState();
})();
