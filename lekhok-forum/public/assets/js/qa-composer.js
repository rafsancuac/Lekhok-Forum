/* ── সেশন ১৪০: /qa ইনলাইন-কম্পোজার-ইঞ্জিন ───────────────────────────────────────────────
 * নতুন-প্রশ্ন এখন /qa-তেই: optimistic-কার্ড তাৎক্ষণিক → POST /api/qa/new (JSON) →
 * সার্ভার-রেন্ডার্ড canonical-HTML (shared/qa/QaListItem.ejs) swap।
 * রীতি: session124-CommentItem-ক্যানোনিকাল-ইনসার্ট + session126-paintList-শিক্ষা
 * (নিজস্ব-পেইন্ট কখনো ক্যানোনিকাল-শেল মুছে নয় — এখানে fresh-swap-ই পথ)।
 * গেস্টে স্ব-নিষ্ক্রিয় (body[data-auth]); ড্রাফট localStorage (qacDraft140) — রিলোডেও বাঁচে।
 * ফিল্টার-সচেতন: ?filter=accepted-তে তালিকা-মিউটেশন নয় → সাফল্যে /qa/:id-নেভিগেশন
 * (stale-কাউন্টার-শিক্ষা: ফিল্টার-অখণ্ডতা > তাৎক্ষণিক-প্রদর্শন)।
 * সেশন ১৪১: বিস্তারিত-ফিল্ডে রিচ-এডিটর (LekhokRichEditor — {preview:false}; চোখ-বাটনে
 * অপট-ইন প্রিভিউ) — মাউন্ট DOMContentLoaded-এ, ইঞ্জিন-অনুপস্থিতে সাদামাটা-textarea-ই থাকে
 * (প্রগ্রেসিভ-এনহ্যান্সমেন্ট); সার্ভার renderBody-চুক্তি (session80) ফরম্যাট-রেন্ডার করে। */
(function () {
  'use strict';
  var root = document.getElementById('qaComposer140');
  if (!root || !document.body || document.body.getAttribute('data-auth') !== '1') return;

  var trigger = document.getElementById('qacTrigger140');
  var panel = document.getElementById('qacPanel140');
  var title = document.getElementById('qacTitle140');
  var body = document.getElementById('qacBody140');
  var submitBtn = document.getElementById('qacSubmit140');
  var cancelBtn = document.getElementById('qacCancel140');
  var hint = document.getElementById('qacHint140');
  var titleCount = document.getElementById('qacTitleCount140');
  var bodyCount = document.getElementById('qacBodyCount140');
  var list = document.querySelector('.qa-list');
  if (!trigger || !panel || !title || !body || !submitBtn || !list) return;

  var busy = false;
  var DRAFT_KEY = 'qacDraft140';
  var MAX_TITLE = 200, MAX_BODY = 5000, WARN_BODY = 4500;

  function toBn(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); }
  function setHint(msg, isErr) {
    if (!hint) return;
    hint.textContent = msg || '';
    hint.classList.toggle('is-err', !!isErr);
  }
  function expand() {
    if (busy) return;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    setHint('');
    title.focus();
  }
  function collapse() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
  }
  function updateCounts() {
    if (titleCount) titleCount.textContent = toBn(title.value.length);
    if (bodyCount) bodyCount.textContent = toBn(body.value.length);
    if (bodyCount) {
      var fc = bodyCount.parentElement;
      fc.classList.toggle('is-warn', body.value.length > WARN_BODY && body.value.length <= MAX_BODY);
      fc.classList.toggle('is-error', body.value.length > MAX_BODY);
    }
    submitBtn.disabled = busy || !title.value.trim() || !body.value.trim();
  }
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ t: title.value, b: body.value })); } catch (e) {}
  }
  function restoreDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (d && (d.t || d.b)) { title.value = d.t || ''; body.value = d.b || ''; if (d.t || d.b) expand(); }
    } catch (e) {}
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  /* optimistic-কার্ড — QaListItem-মার্কআপের ক্লায়েন্ট-মিরর (swap-পূর্ব <১-রাউন্টট্রিপ জীবনকাল) */
  function buildOptimistic() {
    var d = document.body.dataset || {};
    var el = document.createElement('div');
    el.className = 'qa-item qa-optimistic140';
    el.setAttribute('data-qa-opt', '1');
    el.innerHTML =
      '<div class="qa-votes"><span class="vote-count">০</span><small><i class="far fa-thumbs-up"></i>প্রাসঙ্গিক</small></div>' +
      '<div class="qa-content">' +
        '<a href="/qa" class="qa-title"></a>' +
        '<p class="qa-excerpt"></p>' +
        '<div class="qa-meta">' +
          '<span class="qa-ans-badge is-unanswered"><i class="fas fa-hourglass-half" aria-hidden="true"></i> অনুত্তরিত</span>' +
          '<img loading="lazy" decoding="async" src="' + (d.avatar || '/avatar/' + (d.uid || '')) + '" class="mini-avatar" alt="">' +
          '<span class="qa-author"></span>' +
          '<span>&middot;</span>' +
          '<span><i class="far fa-comment"></i> ০ উত্তর</span>' +
          '<span>&middot;</span>' +
          '<span data-ts="' + new Date().toISOString() + '"><i class="far fa-clock"></i> এইমাত্র</span>' +
        '</div>' +
      '</div>';
    el.querySelector('.qa-title').textContent = title.value.trim();
    el.querySelector('.qa-excerpt').textContent = body.value.trim();
    el.querySelector('.qa-author').textContent = d.name || '';
    return el;
  }
  function currentFilter() {
    try { return new URLSearchParams(location.search).get('filter'); } catch (e) { return null; }
  }
  function bumpChips() {
    var chips = document.querySelectorAll('.qa-filter-bar .qf-count');
    if (chips.length >= 2) {
      [chips[0], chips[1]].forEach(function (c) {
        var cur = parseInt((c.textContent || '০').replace(/[০-৯]/g, function (b) { return '০১২৩৪৫৬৭৮৯'.indexOf(b); }), 10) || 0;
        var next = cur + 1;
        c.textContent = toBn(next);
        c.classList.add('has');
      });
    }
  }
  function removeEmptyState() {
    var es = list.querySelector('.empty-state-full');
    if (es) { es.remove(); return true; }
    return false;
  }
  function restoreEmptyState(node) { if (node && !list.querySelector('.qa-item')) list.appendChild(node); }

  function fail(removedEmpty, emptyNode, msg) {
    busy = false;
    submitBtn.disabled = false;
    var opt = list.querySelector('[data-qa-opt]');
    if (opt) opt.remove();
    if (removedEmpty) restoreEmptyState(emptyNode);
    setHint(msg || 'প্রকাশ ব্যর্থ — আবার চেষ্টা করুন', true);
  }
  function succeed(id, html) {
    clearDraft();
    busy = false;
    var opt = list.querySelector('[data-qa-opt]');
    var filter = currentFilter();
    if (filter === 'accepted') {
      /* গ্রহণকৃত-ফিল্টার-অখণ্ডতা: তালিকায় না-ঢুকিয়ে নতুন-প্রশ্নেই নেভিগেট */
      location.href = '/qa/' + id;
      return;
    }
    if (opt && html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var canon = tmp.firstElementChild;
      if (canon) {
        canon.classList.add('qa-canonical-in140');
        opt.replaceWith(canon);
      } else if (opt) {
        var link = opt.querySelector('.qa-title'); if (link) link.setAttribute('href', '/qa/' + id);
        opt.setAttribute('data-qa-id', String(id));
      }
    } else if (opt) {
      var link2 = opt.querySelector('.qa-title'); if (link2) link2.setAttribute('href', '/qa/' + id);
      opt.setAttribute('data-qa-id', String(id));
    }
    bumpChips();
    title.value = ''; body.value = '';
    /* সেশন ১৪১: ক্লিয়ার-পরে input-dispatch — ইঞ্জিন-প্রিভিউ (খোলা থাকলে) + কাউন্টার +
       ড্রাফট সিঙ্ক; প্রোগ্রাম্যাটিক-সেটে input-ইভেন্ট হয় না → স্টেল-প্রিভিউ-প্রতিরোধ */
    body.dispatchEvent(new Event('input', { bubbles: true }));
    updateCounts();
    collapse();
    setHint('প্রশ্ন প্রকাশিত ✓');
    setHint('');
  }

  trigger.addEventListener('click', expand);
  trigger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expand(); }
  });
  if (cancelBtn) cancelBtn.addEventListener('click', function () { collapse(); });
  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      /* সেশন ১৪১: জেন-মোড সক্রিয় হলে ইঞ্জিন নিজেই Esc-হ্যান্ডল করে — এখানে কল্যাপ্স
         দমন (নইলে এক-Escape-এ জেন+প্যানেল দুটোই বন্ধ হয়ে যায়) */
      if (body.closest && body.closest('.re-root.re-zen')) { e.stopPropagation(); return; }
      e.stopPropagation(); collapse();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); panel.requestSubmit ? panel.requestSubmit() : submit(); }
  });
  [title, body].forEach(function (f) {
    f.addEventListener('input', function () { updateCounts(); saveDraft(); });
  });

  panel.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var t = title.value.trim(), b = body.value.trim();
    if (!t || !b) { setHint('শিরোনাম ও প্রশ্ন দুটোই লিখুন', true); return; }
    if (t.length > MAX_TITLE) { setHint('শিরোনাম ২০০ অক্ষরের মধ্যে রাখুন', true); return; }
    if (b.length > MAX_BODY) { setHint('বিস্তারিত ৫০০০ অক্ষরের মধ্যে রাখুন', true); return; }
    busy = true;
    submitBtn.disabled = true;
    setHint('প্রকাশ হচ্ছে…');
    var filter = currentFilter();
    var removedEmpty = false, emptyNode = null;
    if (filter !== 'accepted') {
      removedEmpty = removeEmptyState();
      if (removedEmpty) { emptyNode = document.createElement('div'); emptyNode.className = 'empty-state-full'; emptyNode.innerHTML = '<i class="fas fa-question-circle"></i><p>কোনো প্রশ্ন করা হয়নি।</p>'; }
      var opt = buildOptimistic();
      list.insertBefore(opt, list.firstChild);
    }
    fetch('/api/qa/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t, body: b })
    }).then(function (r) {
      if (r.status === 401) return fail(removedEmpty, emptyNode, 'লগইন-মেয়াদ শেষ — পেজ রিলোড করুন');
      return r.json().then(function (j) {
        if (!r.ok || !j.ok) return fail(removedEmpty, emptyNode, (j && j.message) || 'প্রকাশ ব্যর্থ — আবার চেষ্টা করুন');
        if (j.duplicate) {
          var o = list.querySelector('[data-qa-opt]');
          if (o) o.remove();
          if (removedEmpty) restoreEmptyState(emptyNode);
          clearDraft();
          location.href = '/qa/' + j.id;
          return;
        }
        succeed(j.id, j.html);
      });
    }).catch(function () { fail(removedEmpty, emptyNode); });
  });

  restoreDraft();
  updateCounts();

  /* ── সেশন ১৪১: রিচ-এডিটর-মাউন্ট (ড্রাফট-রিস্টোরের পরে — প্রিভিউ সঠিক-ভ্যালুতে শুরু) ──
     data-rich-editor অ্যাট্রিবিউট ইচ্ছাকৃতভাবে দেওয়া হয়নি — ইঞ্জিন auto-init-এর ডিফল্ট-cfg
     (ডেস্কটপে স্প্লিট-প্রিভিউ) কম্পোজার-প্যানেলে ভারী; ম্যানুয়াল {preview:false} দেয়
     টুলবার-সহ শান্ত ডিফল্ট (চোখ-বাটনে অপট-ইন প্রিভিউ)। */
  function mountEditor() {
    if (!window.LekhokRichEditor || typeof window.LekhokRichEditor.init !== 'function') return;
    var inst = window.LekhokRichEditor.init(body, { preview: false });
    if (inst && body.value) {
      /* ড্রাফট-রিস্টোর-পরবর্তী সিঙ্ক (প্রোগ্রাম্যাটিক-সেটে input হয় না) */
      body.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountEditor);
  else mountEditor();
})();
