/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ৮০: রিচ-এডিটর — লেখা-ফর্মের জন্য টুলবার + লাইভ-প্রিভিউ + জেন-মোড
   ─────────────────────────────────────────────────────────────────────────
   ব্যবহার: <textarea data-rich-editor></textarea> — অথবা ম্যানুয়ালি
            LekhokRichEditor.init(el, { preview: true, split: true })

   নকশা-নীতি:
   ১. প্রগ্রেসিভ — JS ব্যর্থ হলে খালি textarea-ই থাকে, ফর্ম কাজ করে।
   ২. প্রিভিউ-মিরর — সার্ভার-রেন্ডারারের (helpers/markdown-lite.js) হুবহু
      ক্লায়েন্ট-কপি: এস্কেপ-ফার্স্ট, তাই প্রিভিউ-পেনেও XSS নেই।
   ৩. কম্প্যাটিবল — সব ইনসার্শন 'input' ইভেন্ট ছাড়ে, তাই ফর্মের আগের
      স্ট্যাটস-বার / খসড়া-অটোসেভ / ক্যারেক্টার-কাউন্টার নিজে থেকেই চলে।
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── মার্কডাউন-লাইট v2 মিরর (সার্ভার helpers/markdown-lite.js-এর কপি) ── */
  function escH(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function inlineMd(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/\[([^\]]+)\]\(\s*((?:https?:\/\/|\/)[^\s)"]+)\s*\)/g,
        '<a href="$2" class="a-link" target="_blank" rel="noopener nofollow">$1</a>')
      .replace(/@([a-zA-Z0-9_]+)/g, '<a class="mention" href="/profile/$1">@$1</a>')
      .replace(/#([\u0980-\u09FFa-zA-Z0-9_]+)/g, '<a class="tag" href="/articles?tag=$1">#$1</a>');
  }
  function renderPreview(raw) {
    var lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
    var out = [], para = [], listMode = null, quoteBuf = null;
    function flushPara() { if (para.length) { out.push(para.map(function (l) { return inlineMd(escH(l)); }).join('<br>')); para = []; } }
    function closeList() { if (listMode) { out.push('</' + listMode + '>'); listMode = null; } }
    function closeQuote() { if (quoteBuf) { out.push(quoteBuf.join('<br>') + '</blockquote>'); quoteBuf = null; } }
    function closeAll() { flushPara(); closeList(); closeQuote(); }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], m;
      if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { closeAll(); out.push('<hr class="a-hr">'); continue; }
      m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
      if (m) {
        closeAll();
        out.push('<h' + m[1].length + ' class="a-heading a-h' + m[1].length + '">' + escH(m[2].trim()) + '</h' + m[1].length + '>');
        continue;
      }
      m = line.match(/^>\s?(.*)$/);
      if (m) { flushPara(); closeList(); if (!quoteBuf) { out.push('<blockquote class="a-quote">'); quoteBuf = []; } quoteBuf.push(inlineMd(escH(m[1]))); continue; }
      m = line.match(/^[-*]\s+(.+)$/);
      if (m) { flushPara(); closeQuote(); if (listMode !== 'ul') { closeList(); out.push('<ul class="a-ul">'); listMode = 'ul'; } out.push('<li>' + inlineMd(escH(m[1])) + '</li>'); continue; }
      m = line.match(/^(\d+|[\u09E6-\u09EF])[.)]\s+(.+)$/);
      if (m) { flushPara(); closeQuote(); if (listMode !== 'ol') { closeList(); out.push('<ol class="a-ol">'); listMode = 'ol'; } out.push('<li>' + inlineMd(escH(m[2])) + '</li>'); continue; }
      closeList(); closeQuote(); para.push(line);
    }
    closeAll();
    return out.join('\n');
  }

  /* ── সহায়ক ── */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function btn(icon, label, title, extraCls) {
    var b = el('button', 're-tb-btn' + (extraCls ? ' ' + extraCls : ''), icon);
    b.type = 'button';
    b.setAttribute('title', title);
    b.setAttribute('aria-label', title);
    b.dataset.reTip = label || '';
    return b;
  }
  /* সিলেকশন-সংরক্ষিৎ র‍্যাপ — রেখে দেওয়ার পর ভেতরের টেক্সটই সিলেক্টেড থাকে
     (আগের wrap() কার্সর হারিয়ে ফেলত — টগল/এডিট করা যেত না) */
  function wrapSel(ta, before, after) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e);
    ta.setRangeText(before + sel + after, s, e, 'end');
    ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    ta.focus();
    fireInput(ta);
  }
  /* লাইন-ব্লক প্রিফিক্স (তালিকা/উদ্ধৃতি) — সিলেকশনের প্রতিটি লাইনের আগে;
     আগে থেকে প্রিফিক্স থাকলে টগল-করে সরায় */
  function prefixLines(ta, prefix, toggleOff) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    var ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    var le = ta.value.indexOf('\n', e); if (le === -1) le = ta.value.length;
    var block = ta.value.slice(ls, le);
    var lines = block.split('\n');
    var allHave = lines.every(function (l) { return !l.trim() || l.startsWith(prefix); });
    var out = lines.map(function (l) {
      if (!l.trim()) return l;
      if (allHave && toggleOff) return l.slice(prefix.length);
      return prefix + l.replace(/^(?:#{2,3}\s+|[-*]\s+|(?:\d+|[\u09E6-\u09EF])[.)]\s+|>\s?)/, '');
    }).join('\n');
    ta.setRangeText(out, ls, le, 'end');
    ta.setSelectionRange(ls, ls + out.length);
    ta.focus();
    fireInput(ta);
  }
  /* হেডিং-টগল (সেশন ৬৫-এর headingWrap-এর উন্নত — ইনপুট-ইভেন্ট + সিলেকশন) */
  function headingToggle(ta, prefix) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    if (s !== e) { wrapSel(ta, '\n' + prefix, '\n'); return; }
    var ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    var le = ta.value.indexOf('\n', s); if (le === -1) le = ta.value.length;
    var line = ta.value.slice(ls, le);
    var m = line.match(/^(#{2,3})\s+/);
    var next;
    if (m && m[1] === prefix.trim()) next = line.replace(/^#{2,3}\s+/, '');
    else if (m) next = prefix + line.replace(/^#{2,3}\s+/, '');
    else next = prefix + line;
    ta.setRangeText(next, ls, le, 'end');
    ta.setSelectionRange(ls + (next === line.replace(/^#{2,3}\s+/, '') ? 0 : prefix.length), ls + next.length);
    ta.focus();
    fireInput(ta);
  }
  /* ফরম্যাট-মুছুন — সিলেকশন/পুরো বডি থেকে মার্কডাউন-চিহ্ন সরায় */
  function stripFormat(ta) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) { s = 0; e = ta.value.length; }
    var chunk = ta.value.slice(s, e);
    var cleaned = chunk
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/\[([^\]]+)\]\(\s*(?:https?:\/\/|\/)[^\s)"]+\s*\)/g, '$1')
      .replace(/^(#{2,3})\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/^(?:\d+|[\u09E6-\u09EF])[.)]\s+/gm, '')
      .replace(/^>\s?/gm, '');
    ta.setRangeText(cleaned, s, e, 'select');
    ta.focus();
    fireInput(ta);
  }
  function fireInput(ta) { ta.dispatchEvent(new Event('input', { bubbles: true })); }

  /* ── লিংক-ডায়ালগ (prompt() নয় — টেক্সট+URL দুটোই, Esc/ব্যাকড্রপ-বন্ধ) ── */
  function openLinkDialog(ta) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    var selText = ta.value.slice(s, e);
    var backdrop = el('div', 're-dialog-backdrop');
    var dlg = el('div', 're-dialog');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'লিংক যোগ করুন');
    dlg.innerHTML =
      '<div class="re-dialog-head"><i class="fas fa-link"></i> লিংক যোগ করুন</div>' +
      '<div class="re-dialog-body">' +
      '<div><label for="reLinkText">লিংক-টেক্সট</label>' +
      '<input id="reLinkText" type="text" placeholder="যেমন: আমাদের ফেসবুক পেজ" value=""></div>' +
      '<div><label for="reLinkUrl">URL (https://… বা /…)</label>' +
      '<input id="reLinkUrl" type="text" inputmode="url" placeholder="https://example.com"></div>' +
      '</div>' +
      '<div class="re-dialog-foot">' +
      '<button type="button" class="re-dlg-cancel">বাতিল</button>' +
      '<button type="button" class="re-dlg-ok"><i class="fas fa-check"></i> যোগ করুন</button>' +
      '</div>';
    backdrop.appendChild(dlg);
    document.body.appendChild(backdrop);
    var txtIn = dlg.querySelector('#reLinkText');
    var urlIn = dlg.querySelector('#reLinkUrl');
    txtIn.value = selText || '';
    function close() { backdrop.remove(); ta.focus(); }
    function submit() {
      var t = txtIn.value.trim();
      var u = urlIn.value.trim();
      if (!t || !u) { (u ? txtIn : urlIn).focus(); return; }
      if (!/^(https?:\/\/|\/)/i.test(u)) u = 'https://' + u;
      ta.focus();
      ta.setSelectionRange(s, e);
      /* নির্ভুল লিংক-ইনসার্ট: সিলেকশন → [টেক্সট](URL), টেক্সট সিলেক্টেড */
      ta.setRangeText('[' + t + '](' + u + ')', s, e, 'end');
      ta.setSelectionRange(s + 1, s + 1 + t.length);
      fireInput(ta);
      close();
    }
    dlg.querySelector('.re-dlg-cancel').addEventListener('click', close);
    dlg.querySelector('.re-dlg-ok').addEventListener('click', submit);
    backdrop.addEventListener('mousedown', function (ev) { if (ev.target === backdrop) close(); });
    dlg.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); close(); }
      if (ev.key === 'Enter') { ev.preventDefault(); submit(); }
    });
    txtIn.focus();
  }

  /* ═══ মূল init ═══ */
  function init(ta, cfg) {
    if (!ta || ta.dataset.reReady === '1' || ta.tagName !== 'TEXTAREA') return null;
    ta.dataset.reReady = '1';
    cfg = cfg || {};
    var isDesktop = window.matchMedia('(min-width: 1100px)').matches;

    /* DOM: re-root > toolbar + canvas(edit | preview) */
    var root = el('div', 're-root');
    ta.parentNode.insertBefore(root, ta);

    var toolbar = el('div', 're-toolbar');
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'ফরম্যাটিং টুলবার');

    var canvas = el('div', 're-canvas');
    var editWrap = el('div', 're-edit');
    var preview = el('div', 're-preview');
    preview.innerHTML =
      '<div class="re-preview-head"><span class="re-live-dot"></span><i class="fas fa-eye"></i>' +
      'প্রিভিউ — যেমনটা পাঠক দেখবেন<span class="re-live-tag">লাইভ</span></div>' +
      '<div class="re-preview-body" tabindex="0"></div>';
    var previewBody = preview.querySelector('.re-preview-body');

    ta.classList.add('re-ta');
    editWrap.appendChild(ta);
    canvas.appendChild(editWrap);
    canvas.appendChild(preview);
    root.appendChild(toolbar);
    root.appendChild(canvas);

    /* ── টুলবার-বাটন ── */
    function group() { return el('div', 're-tb-group'); }
    function sep() { return el('span', 're-tb-sep'); }

    var g1 = group();
    var bB = btn('<b>B</b>', 'বোল্ড', 'বোল্ড (Ctrl+B)');
    bB.addEventListener('click', function () { wrapSel(ta, '**', '**'); });
    var bI = btn('<span class="tt-i">I</span>', 'ইটালিক', 'ইটালিক (Ctrl+I)');
    bI.addEventListener('click', function () { wrapSel(ta, '_', '_'); });
    var bS = btn('<span class="tt-s">S</span>', 'কাটা', 'কাটা-লেখা (~~টেক্সট~~)');
    bS.addEventListener('click', function () { wrapSel(ta, '~~', '~~'); });
    g1.appendChild(bB); g1.appendChild(bI); g1.appendChild(bS);

    var g2 = group();
    var bH2 = btn('<span class="tt-h2">শিরোনাম</span>', '', 'বড় শিরোনাম (##)');
    bH2.addEventListener('click', function () { headingToggle(ta, '## '); });
    var bH3 = btn('<span class="tt-h3">উপশিরোনাম</span>', '', 'উপশিরোনাম (###)');
    bH3.addEventListener('click', function () { headingToggle(ta, '### '); });
    g2.appendChild(bH2); g2.appendChild(bH3);

    var g3 = group();
    var bUl = btn('<i class="fas fa-list-ul"></i>', 'তালিকা', 'বুলেট তালিকা');
    bUl.addEventListener('click', function () { prefixLines(ta, '- ', true); });
    var bOl = btn('<i class="fas fa-list-ol"></i>', 'সংখ্যা', 'সংখ্যা-তালিকা');
    bOl.addEventListener('click', function () { prefixLines(ta, '১. ', true); });
    var bQ = btn('<i class="fas fa-quote-right"></i>', 'উদ্ধৃতি', 'উদ্ধৃতি-ব্লক (>)');
    bQ.addEventListener('click', function () { prefixLines(ta, '> ', true); });
    g3.appendChild(bUl); g3.appendChild(bOl); g3.appendChild(bQ);

    var g4 = group();
    var bL = btn('<i class="fas fa-link"></i>', 'লিংক', 'লিংক যোগ করুন (Ctrl+K)');
    bL.addEventListener('click', function () { openLinkDialog(ta); });
    var bTag = btn('<i class="fas fa-hashtag"></i>', 'ট্যাগ', 'ট্যাগ (#)');
    bTag.addEventListener('click', function () { wrapSel(ta, ' #', ''); });
    var bM = btn('<i class="fas fa-at"></i>', 'ম্যানশন', 'ম্যানশন (@)');
    bM.addEventListener('click', function () { wrapSel(ta, ' @', ''); });
    var bHr = btn('<i class="fas fa-minus"></i>', 'বিভাজক', 'অনুভূমিক বিভাজক (---)');
    bHr.addEventListener('click', function () { wrapSel(ta, '\n\n---\n\n', ''); });
    g4.appendChild(bL); g4.appendChild(bTag); g4.appendChild(bM); g4.appendChild(bHr);

    var g5 = group();
    var bClr = btn('<i class="fas fa-eraser"></i>', 'ফরম্যাট-মুছুন', 'সিলেকশন থেকে ফরম্যাটিং সরান');
    bClr.addEventListener('click', function () { stripFormat(ta); });
    g5.appendChild(bClr);

    var g6 = group();
    var bPv = btn('<i class="fas fa-eye"></i>', 'প্রিভিউ', 'লাইভ-প্রিভিউ দেখান/লুকান', 're-tb-preview');
    var bZen = btn('<i class="fas fa-expand"></i>', 'জেন', 'ফোকাসড ফুলস্ক্রিন-মোড', 're-tb-zen');
    g6.appendChild(bPv); g6.appendChild(bZen);

    toolbar.appendChild(g1); toolbar.appendChild(sep());
    toolbar.appendChild(g2); toolbar.appendChild(sep());
    toolbar.appendChild(g3); toolbar.appendChild(sep());
    toolbar.appendChild(g4); toolbar.appendChild(sep());
    toolbar.appendChild(g5); toolbar.appendChild(sep());
    toolbar.appendChild(g6);
    toolbar.appendChild(el('span', 're-tb-hint', '<kbd>Ctrl</kbd>+<kbd>B</kbd> বোল্ড · <kbd>Ctrl</kbd>+<kbd>I</kbd> ইটালিক · <kbd>Ctrl</kbd>+<kbd>K</kbd> লিংক'));

    /* ── প্রিভিউ ── */
    var pvTimer = null;
    function renderPv() {
      var v = ta.value;
      if (!v.trim()) {
        previewBody.classList.add('re-empty');
        previewBody.innerHTML = '<div class="re-empty-inner"><i class="fas fa-feather-pointed"></i>লিখতে শুরু করুন — এখানে লাইভ-প্রিভিউ দেখা যাবে</div>';
        return;
      }
      previewBody.classList.remove('re-empty');
      previewBody.innerHTML = renderPreview(v);
    }
    ta.addEventListener('input', function () {
      clearTimeout(pvTimer);
      pvTimer = setTimeout(renderPv, 130);
    });

    function setPreview(on) {
      root.classList.toggle('re-preview-on', on);
      bPv.classList.toggle('is-on', on);
      bPv.querySelector('i').className = on ? 'fas fa-eye-slash' : 'fas fa-eye';
      bPv.setAttribute('title', on ? 'প্রিভিউ লুকান' : 'লাইভ-প্রিভিউ দেখান/লুকান');
      if (on) renderPv();
    }
    bPv.addEventListener('click', function () { setPreview(!root.classList.contains('re-preview-on')); });

    /* ডেস্কটপে ডিফল্ট সাইড-বাই-সাইড প্রিভিউ (cfg.preview === false হলে বন্ধ) */
    var mq = window.matchMedia('(min-width: 1100px)');
    function applySplit() {
      var want = root.classList.contains('re-preview-on') && mq.matches;
      root.classList.toggle('re-split', want);
    }
    mq.addEventListener ? mq.addEventListener('change', applySplit) : (mq.addListener && mq.addListener(applySplit));
    var origToggle = setPreview;
    setPreview = function (on) { origToggle(on); applySplit(); };
    if (cfg.preview !== false && isDesktop) { setPreview(true); } else { applySplit(); }

    /* একমুখী স্ক্রল-সিঙ্ক (এডিট → প্রিভিউ, rAF-থ্রটলড) */
    var syncTick = false;
    ta.addEventListener('scroll', function () {
      if (!root.classList.contains('re-preview-on') || syncTick) return;
      syncTick = true;
      requestAnimationFrame(function () {
        var ratio = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight);
        previewBody.scrollTop = ratio * (previewBody.scrollHeight - previewBody.clientHeight);
        syncTick = false;
      });
    });

    /* ── জেন-মোড ── */
    var escHint = null;
    function setZen(on) {
      root.classList.toggle('re-zen', on);
      bZen.classList.toggle('is-on', on);
      bZen.querySelector('i').className = on ? 'fas fa-compress' : 'fas fa-expand';
      bZen.setAttribute('title', on ? 'জেন-মোড বন্ধ করুন' : 'ফোকাসড ফুলস্ক্রিন-মোড');
      if (on) {
        escHint = el('div', 're-zen-esc', 'বের হতে <kbd>Esc</kbd> চাপুন');
        document.body.appendChild(escHint);
        document.body.style.overflow = 'hidden';
      } else {
        if (escHint) { escHint.remove(); escHint = null; }
        document.body.style.overflow = '';
      }
      applySplit();
    }
    bZen.addEventListener('click', function () { setZen(!root.classList.contains('re-zen')); });

    /* ── কীবোর্ড-শর্টকাট ── */
    ta.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey)) {
        if (ev.key === 'Escape' && root.classList.contains('re-zen')) { ev.preventDefault(); setZen(false); }
        return;
      }
      var k = ev.key.toLowerCase();
      if (k === 'b') { ev.preventDefault(); wrapSel(ta, '**', '**'); }
      else if (k === 'i') { ev.preventDefault(); wrapSel(ta, '_', '_'); }
      else if (k === 'k') { ev.preventDefault(); openLinkDialog(ta); }
      else if (k === 's') { ev.preventDefault(); wrapSel(ta, '~~', '~~'); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && root.classList.contains('re-zen')) setZen(false);
    });

    renderPv();
    return {
      root: root, ta: ta, setPreview: function (on) { setPreview(on); }, setZen: setZen,
      renderPreview: renderPreview
    };
  }

  /* অটো-ইনিট: data-rich-editor অ্যাট্রিবিউটের textarea */
  function autoInit() {
    var nodes = document.querySelectorAll('textarea[data-rich-editor]');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  window.LekhokRichEditor = { init: init, renderPreview: renderPreview };
})();
