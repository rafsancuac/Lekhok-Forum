/* ── সেশন ১৪৪: মেনশন-অটোকমপ্লিট সর্বত্র (textarea[data-mention] সারফেস) ──────────────
 * কমেন্ট-কম্পোজারের (.cc-input + comment-tools.js) @মেনশন-চুক্তির মিরর —
 * কিন্তু সে-ইঞ্জিন .cc-bubble-নির্ভর; /qa-ইনলাইন-কম্পোজারের মতো খালি-সারফেসের
 * জন্য এই হালকা-স্বাধীন-বাইন্ডার। চুক্তি-সমতা:
 *   • একই API (/api/users/search) + একই ড্রপডাউন-মার্কআপ (.cc-mention/.ccm-item)
 *   • একই কীবোর্ড-রীতি (↑↓ সিলেক্ট, Enter/Tab ইনসার্ট, Esc বন্ধ — 180ms ডিবাউন্স)
 *   • ইনসার্ট-পরে input-ইভেন্ট-ডিসপ্যাচ (কাউন্টার/ড্রাফট-ইঞ্জিন স্বয়ংক্রিয়-সিঙ্ক)
 * নিয়ম: .cc-input স্কিপ (তার নিজস্ব-ইঞ্জিন আছে — ডাবল-ড্রপডাউন-নিষিদ্ধ);
 * dropdown .cc-mention CSS (style.css: absolute, bottom:calc(100%+6px)) —
 * textarea-কে .mention-wrap144 (position:relative)-এ জড়িয়ে অ্যাংকর-করা হয়। */
(function () {
  'use strict';

  var MENTION_RE = /@([a-zA-Z0-9_\u0980-\u09FF]*)$/;
  var DEBOUNCE_MS = 180;
  var cache = {}; // q → users[]
  var timer = null;

  function findMention(ta) {
    var upto = ta.value.slice(0, ta.selectionStart);
    var m = upto.match(MENTION_RE);
    return m ? { q: m[1], at: upto.length - m[0].length } : null;
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ddOf(ta) { return ta.parentNode.querySelector('.cc-mention'); }

  function close(ta) {
    var dd = ddOf(ta);
    if (dd) { dd.hidden = true; dd.innerHTML = ''; }
    delete ta.dataset.mentionActive144;
  }

  function show(ta, q) {
    var dd = ddOf(ta);
    if (!dd) return;
    ta.dataset.mentionActive144 = '1';
    dd.innerHTML = '<div class="ccm-loading"><i class="fas fa-spinner fa-spin"></i></div>';
    dd.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () {
      var key = q.toLowerCase();
      if (cache[key]) { renderList(ta, q, cache[key]); return; }
      fetch('/api/users/search?q=' + encodeURIComponent(q))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var users = (j && j.users) || [];
          cache[key] = users;
          if (ta.dataset.mentionActive144 === '1') renderList(ta, q, users);
        })
        .catch(function () { close(ta); });
    }, DEBOUNCE_MS);
  }

  function renderList(ta, q, users) {
    var dd = ddOf(ta);
    if (!dd || ta.dataset.mentionActive144 !== '1') return;
    var me = findMention(ta);
    if (!me || me.q !== q) { dd.hidden = true; return; } // কোয়েরি বদলে গেছে
    if (!users.length) { dd.hidden = true; dd.innerHTML = ''; return; }
    dd.innerHTML = users.map(function (u) {
      return '<button type="button" class="ccm-item" data-uname="' + esc(u.username) + '" data-dname="' + esc(u.full_name) + '">' +
        '<img class="ccm-av" src="' + esc(u.avatar_url || ('/avatar/' + u.id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
        '<span class="ccm-txt"><strong>' + esc(u.full_name) + '</strong><small>@' + esc(u.username) + (u.designation ? ' · ' + esc(u.designation) : '') + '</small></span>' +
        '</button>';
    }).join('');
    dd.hidden = false;
  }

  function insert(ta, username) {
    var me = findMention(ta);
    if (!me) return;
    var start = ta.selectionStart;
    var before = ta.value.slice(0, me.at) + '@' + username + ' ';
    ta.value = before + ta.value.slice(start);
    ta.selectionStart = ta.selectionEnd = before.length;
    ta.focus();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    close(ta);
  }

  function bind(ta) {
    if (ta.dataset.mentionBound144) return; // ডাবল-বাইন্ড-নিষিদ্ধ
    ta.dataset.mentionBound144 = '1';
    /* র‍্যাপার — .cc-mention (absolute, bottom:100%+6px) অ্যাংকর; একবারই */
    var p = ta.parentNode;
    if (!p.classList || !p.classList.contains('mention-wrap144')) {
      var wrap = document.createElement('span');
      wrap.className = 'mention-wrap144';
      p.insertBefore(wrap, ta);
      wrap.appendChild(ta);
      var dd = document.createElement('div');
      dd.className = 'cc-mention';
      dd.setAttribute('role', 'listbox');
      dd.setAttribute('aria-label', 'মেনশন-সাজেশন');
      dd.hidden = true;
      wrap.appendChild(dd);
    }

    ta.addEventListener('input', function () {
      var me = findMention(ta);
      if (me) show(ta, me.q);
      else close(ta);
    });

    /* টার্গেট-ফেজে শোনা — Esc-এ stopPropagation (কম্পোজার-প্যানেলের collapse
     * হ্যান্ডলার ড্রপডাউন-খোলা অবস্থায় ফায়ার করবে না), Enter/Tab-এ newline-বাধা */
    ta.addEventListener('keydown', function (e) {
      var dd = ddOf(ta);
      if (!dd || dd.hidden || !dd.children.length) return;
      var items = Array.prototype.slice.call(dd.querySelectorAll('.ccm-item'));
      var idx = items.indexOf(dd.querySelector('.ccm-item.active'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        if (idx < 0) idx = 0;
        items.forEach(function (it, i) { it.classList.toggle('active', i === idx); });
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        var pick = items[Math.max(idx, 0)];
        if (pick) insert(ta, pick.getAttribute('data-uname'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // ড্রপডাউন-বন্ধ = প্যানেল-কলাপ্স নয় (এক-চাপ-এক-কাজ)
        close(ta);
      }
    });

    /* ক্লিক-বাইরে-বন্ধ + আইটেম-পিক (document-এ একবার — প্রতি-টার্গেট);
     * কমেন্ট-সারফেসের (.cc-bubble) ccm-item-এও এ-লিসেনার চলে —
     * myWrap-গার্ডে সেগুলো নিরীহ (crash-শূন্য; সে-ইঞ্জিনের নিজস্ব-হ্যান্ডলার বহমান) */
    document.addEventListener('click', function (e) {
      var myWrap = ta.closest('.mention-wrap144');
      if (!myWrap) return;
      var ccm = e.target.closest('.ccm-item');
      if (ccm && myWrap.contains(ccm)) {
        e.preventDefault();
        insert(ta, ccm.getAttribute('data-uname'));
        return;
      }
      if (!myWrap.contains(e.target)) close(ta);
    });
  }

  function scan() {
    var list = document.querySelectorAll('textarea[data-mention]');
    Array.prototype.forEach.call(list, function (ta) {
      if (!ta.classList.contains('cc-input')) bind(ta);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
})();
