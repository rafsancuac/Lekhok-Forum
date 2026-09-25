/* ═══════════════════════════════════════════════════════════════════════════
   সোশ্যাল ফিড মোশন সিন v3 — টাইমলাইন ইঞ্জিন + ১৫টি দৃশ্যের জীবন্ত চক্র
   কোনো লাইব্রেরি নেই · rAF-ভিত্তিক ক্লক (pause / speed / replay / device সাপোর্টেড)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.getElementById('lfmoScene');
  if (!root || root.dataset.lfmoInit) return;
  root.dataset.lfmoInit = '1';

  var $  = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════ ১. কনটেন্ট (এখানেই কাস্টমাইজ করুন) ══════════════ */
  var CFG = {
    postText:    'বিকেলের আলোয় লিখলাম নতুন কবিতা — “নদীর ওপারে যেতে চাই”। সবার মতামত চাই। ✍️',
    commentText: 'দারুণ হয়েছে ভাই! পরের পর্বের অপেক্ষায় রইলাম। 👏',
    chatText:    'আপনার নতুন কবিতাটা পড়লাম — অসাধারণ হয়েছে! 🌸',
    searchQuery: 'কবিতা',
    stories: [
      { name: 'মিতু আক্তার',   time: '২ ঘণ্টা আগে', av: 'mitu',    sign: '— মিতু আক্তার',   quote: 'নদীর ওপারে যেতে চাই — শব্দের সেতু বানাই।' },
      { name: 'সাদিয়া ইসলাম', time: '৪ ঘণ্টা আগে', av: 'sadia',   sign: '— সাদিয়া ইসলাম', quote: 'চা-কাপের বাষ্পে লেখা হয় সবচেয়ে সৎ কবিতা।' },
      { name: 'কৌশিক আহমেদ',  time: 'আজ সকাল',     av: 'koushik', sign: '— কৌশিক আহমেদ',  quote: 'শাটল, বারান্দা আর অলস দুপুর — তিনটিই কবিতা।' }
    ],
    toast: {
      notif:    ['সাদিয়া ইসলাম আপনার পোস্টে ❤️ করেছেন', '২ মিনিট আগে • মন্তব্য দেখুন'],
      share:    ['ফেসবুকে শেয়ার সম্পন্ন হয়েছে', 'আপনার পোস্টে এখন ৬টি শেয়ার'],
      saved:    ['পোস্টটি সংরক্ষিত হয়েছে', 'প্রোফাইলের “সেভড” তালিকায় পাবেন'],
      verified: ['প্রোফাইল যাচাই সম্পন্ন ✓', 'এখন আপনি যাচাইকৃত লেখক'],
      refresh:  ['নতুন ৩টি পোস্ট এসেছে', 'টেনে ছেড়ে দিন — আপডেট হয়েছে']
    },
    device: { w: 203, h: 440, ratio: 2.168 },     /* iPhone 15 Pro: 393×852pt */
    typing: { post: 26, comment: 32, chat: 36, search: 110 },
    sceneNames: ['ফিড', 'পুল-রিফ্রেশ', 'স্টোরি', 'পোস্ট প্রকাশ', 'ডাবল-ট্যাপ ও রিঅ্যাকশন',
                 'কমেন্ট', 'পোল ভোট', 'শেয়ার ও সেভ', 'নোটিফিকেশন সেন্টার', 'মেসেঞ্জার ও ভয়েস',
                 'অডিও কল', 'ভিডিও কল', 'রিডিং ও ডার্ক মোড', 'প্রোফাইল ভেরিফিকেশন', 'লাইভ সার্চ',
                 'লিডারবোর্ড ও ব্যাজ']
  };

  /* ══════════════════════ ২. অ্যাভাটার (ভেক্টর SVG) ════════════════════════ */
  var AV = {
    aziz:    { name:'আজিজ ওয়েসি',    letter:'আ',  bg:'#E8F5E9', shirt:'#006A4E', skin:'#F3C9A3', hair:'#1F2937' },
    sadia:   { name:'সাদিয়া ইসলাম',  letter:'সা',  bg:'#FDF2F8', shirt:'#BE185D', skin:'#F7D0AE', hair:'#111827' },
    mitu:    { name:'মিতু আক্তার',    letter:'মি',  bg:'#EEF2FF', shirt:'#4338CA', skin:'#F5CBA7', hair:'#0B1220' },
    koushik: { name:'কৌশিক আহমেদ',   letter:'কৌ', bg:'#ECFEFF', shirt:'#0E7490', skin:'#EFC39C', hair:'#111827' },
    ata:     { name:'আতা',            letter:'আ',  bg:'#FFF7ED', shirt:'#C2410C', skin:'#F3C9A3', hair:'#1F2937' },
    karishma:{ name:'করিশমা',        letter:'ক',  bg:'#EAF3FF', shirt:'#1877F2', skin:'#F8D3B0', hair:'#0F172A' },
    monem:   { name:'মোনেম শাওন',     letter:'মো', bg:'#F5F3FF', shirt:'#6D28D9', skin:'#F1C7A0', hair:'#111827' },
    babulu:  { name:'শাহরিয়ার বাবলু',letter:'বা', bg:'#F0FDF4', shirt:'#047857', skin:'#F3C9A3', hair:'#1F2937' },
    rafsan:  { name:'Md. রাফসান',     letter:'রা', bg:'#FEF2F2', shirt:'#B91C1C', skin:'#F6CEA8', hair:'#111827' }
  };
  /* নাম থেকে প্রাথমিক অক্ষর (সাইট-শৈলীর লেটার-অ্যাভাটারের জন্য) */
  function letterOf(name) {
    var t = String(name || '').replace(/^(Md\.|মোঃ|মো\.)\s*/, '').trim();
    if (!t) return 'ল';
    var i = t.search(/[\u0980-\u09FF]/);            /* বাংলা অক্ষর */
    if (i === 0) return t.length > 1 && 'িীুূেৈোৌ'.indexOf(t[1]) >= 0 ? t.slice(0,2) : t[0];
    return t[0];
  }
  function avatarSVG(key) {
    var c = AV[key] || AV.aziz;
    return '<svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="20" fill="' + c.bg + '"/>' +
      '<path d="M20 30.5c5.2 0 9.2 2.6 9.2 5.2H10.8c0-2.6 4-5.2 9.2-5.2z" fill="' + c.shirt + '"/>' +
      '<ellipse cx="20" cy="18" rx="7.8" ry="8.8" fill="' + c.skin + '"/>' +
      '<path d="M12.4 16.2c.4-5 3.6-7.6 7.6-7.6s7.2 2.6 7.6 7.6c-1.9-2.6-4.4-3.6-7.6-3.6s-5.7 1-7.6 3.6z" fill="' + c.hair + '"/>' +
      '<circle cx="17.2" cy="18.4" r="1.4" fill="#1e293b"/><circle cx="22.8" cy="18.4" r="1.4" fill="#1e293b"/>' +
      '<path d="M18.4 22.2c1 .8 2.2.8 3.2 0" stroke="#B4724B" stroke-width="1" stroke-linecap="round" fill="none"/>' +
      '</svg>';
  }
  /* অ্যাভাটার রেন্ডার — ডিফল্ট: সাইট-শৈলীর লেটার-অ্যাভাটার; data-avatar="face" দিলে ভেক্টর মুখ */
  function paintAvatar(el, key, name) {
    var a = AV[key];
    if ((root.getAttribute('data-avatar') || 'letter') === 'face' && a) {
      el.classList.add('lfmo-av--face'); el.classList.remove('lfmo-av--letter');
      el.innerHTML = avatarSVG(key || 'aziz');
      return;
    }
    el.classList.add('lfmo-av--letter'); el.classList.remove('lfmo-av--face');
    el.textContent = (a && a.letter) || letterOf(name);
  }
  $$('[data-av]').forEach(function (el) { paintAvatar(el, el.getAttribute('data-av')); });

  /* ভয়েস-নোটের ওয়েভফর্ম */
  (function () {
    var wave = $('#lfsWave'); if (!wave) return;
    for (var i = 0; i < 16; i++) {
      var b = document.createElement('i');
      b.style.animationDelay = (i * 0.07).toFixed(2) + 's';
      b.style.height = (24 + Math.round(Math.random() * 70)) + '%';
      wave.appendChild(b);
    }
  })();

  /* ══════════════════════ ৩. হেল্পার ═════════════════════════════════════ */
  var BN = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
  function bn(v) { return String(v).replace(/[0-9]/g, function (d) { return BN[d]; }); }
  function sel(x) { return typeof x === 'string' ? $(x) : x; }
  function txt(x, s) { var e = sel(x); if (e) e.textContent = s; }
  function html(x, s) { var e = sel(x); if (e) e.innerHTML = s; }
  function on(x, c) { var e = sel(x); if (e) e.classList.add(c); }
  function off(x, c) { var e = sel(x); if (e) e.classList.remove(c); }
  function screenRect() { return ($('#lfsScreen') || root).getBoundingClientRect(); }

  function moveCursor(x) {
    var el = sel(x), cur = $('#lfsCursor');
    if (!el || !cur) return;
    var a = el.getBoundingClientRect(), b = screenRect();
    cur.style.transform = 'translate3d(' +
      (a.left - b.left + a.width / 2).toFixed(1) + 'px,' +
      (a.top - b.top + a.height * 0.62).toFixed(1) + 'px,0)';
    cur.classList.add('on');
  }
  function tapOn(x, fn, delay) {
    if (E.fast) { if (typeof fn === 'function') fn(); return; }
    moveCursor(x);
    var cur = $('#lfsCursor');
    setTimeout(function () {
      if (cur) { cur.classList.remove('tap'); void cur.offsetWidth; cur.classList.add('tap'); }
      if (typeof fn === 'function') fn();
    }, delay == null ? 230 : delay);
  }
  function holdOn(x, fn, holdMs) {
    if (E.fast) { if (typeof fn === 'function') fn(); return; }
    var el = sel(x);
    moveCursor(el);
    if (el) el.classList.add('is-pressed');
    setTimeout(function () {
      var cur = $('#lfsCursor');
      if (cur) { cur.classList.remove('tap'); void cur.offsetWidth; cur.classList.add('tap'); }
      if (el) el.classList.remove('is-pressed');
      if (typeof fn === 'function') fn();
    }, holdMs || 440);
  }
  function feedScroll(px) { var s = $('#lfsFeedScroll'); if (s) s.style.transform = 'translateY(-' + px + 'px)'; }

  function popHearts(count, x, y, big) {
    if (E.fast) return;                       /* seek/স্ক্রাবিং-এ কণা নয় — আটকে থাকা হার্ট এড়াতে */
    var box = $('#lfsHearts'); if (!box) return;
    for (var i = 0; i < (count || 3); i++) {
      (function (i) {
        var h = document.createElement('span');
        h.className = 'lfmo-heart';
        if (big) h.style.fontSize = '17px';
        h.textContent = ['❤️', '💚', '💛', '🧡'][i % 4];
        h.style.left = (x + i * 11 - 16) + 'px';
        h.style.top = (y - i * 4) + 'px';
        h.style.animationDelay = (i * 90) + 'ms';
        box.appendChild(h);
        setTimeout(function () { h.remove(); }, 1700 + i * 90);
      })(i);
    }
  }
  function heartsFrom(x) {
    var el = sel(x), b = screenRect(), r = el ? el.getBoundingClientRect() : null;
    popHearts(4, r ? r.left - b.left + r.width / 2 : 110, r ? r.top - b.top : 240);
  }
  /* ইন-স্ক্রিন লাইভ-লাইন (সাইটের sfs307-live-এর বোন) — ভাসমান কোনো বার নেই */
  function live(text) { txt('#lfsLiveText', text); }
  /* ফিল্টার-চিপ (সাইট-ড্যাশবোর্ডের "সব/লেখা/প্রশ্নোত্তর/জনপ্রিয়" চিপের মতো) */
  function filterOn(name) {
    $$('.lfmo-fchip').forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-f') === name); });
  }
  function toast(kind) {
    var d = CFG.toast[kind]; if (!d) return;
    txt('#lfsToastText', d[0]); txt('#lfsToastSub', d[1]); on(root, 'is-toast');
  }
  function toastOff() { off(root, 'is-toast'); }
  function ringBell() { var b = $('#lfsBell'); if (b) { b.classList.remove('is-shake'); void b.offsetWidth; b.classList.add('is-shake'); } }

  /* ── সাইট-থিম অনুসরণ: html[data-theme="dark"] / html.dark / prefers-color-scheme ── */
  function siteDark() {
    /* লাইট-ফার্স্ট: ডিফল্টে সাদা থিমই চলে। শুধু সাইট নিজে ডার্ক হলে
       (`data-theme="dark"` / `.dark`) বা `data-theme-lock="dark"` দিলে ডার্ক হয়।
       OS-এর ডার্ক প্রেফারেন্স আর নিজে থেকে ডার্ক করায় না। */
    var h = document.documentElement;
    if (root.hasAttribute('data-theme-lock')) return root.getAttribute('data-theme-lock') === 'dark';
    return h.getAttribute('data-theme') === 'dark' || h.classList.contains('dark') || h.classList.contains('dark-theme');
  }
  function applySiteTheme() { if (siteDark()) on(root, 'is-dark'); }
  try {
    var themeObs = new MutationObserver(function () {
      root.classList.toggle('is-dark', siteDark());        /* সাইট থিম বদলালে সিনও বদলায় */
    });
    themeObs.observe(document.documentElement, { attributes:true, attributeFilter:['class','data-theme'] });
  } catch (e) {}

  var typers = [], counters = [];
  function typeInto(x, text, perChar, done) {
    var el = sel(x); if (!el) return;
    if (E.fast) { el.textContent = text; if (done) done(); return; }
    el.textContent = '';
    typers.push({ el: el, text: text, per: perChar, i: 0, acc: 0, done: done || null, finished: false });
  }
  function countUp(x, max, perTick, fmt) {
    if (E.fast) { txt(x, fmt ? fmt(max) : bn(max)); return; }
    counters.push({ sel: x, n: 0, max: max, per: perTick, acc: 0, fmt: fmt || null });
  }


  /* ══════════════════════ ১খ. আসল ডেটা-বাইন্ডিং (ঐচ্ছিক) ══════════════════
     `#lfmo-data` JSON ব্লক বা window.LFMO_DATA থাকলে সিন সাইটের আসল পোস্ট দেখায়।
     না থাকলে ডেমো-কনটেন্ট চলতে থাকে — কিছুই ভাঙে না। */
  function readData() {
    var raw = null, el = document.getElementById('lfmo-data');
    if (el && el.textContent.trim().length > 4) raw = el.textContent;
    else if (window.LFMO_DATA) return window.LFMO_DATA;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function postEls() { return $$('[data-post]').sort(function (a, b) {
    return (a.getAttribute('data-post') | 0) - (b.getAttribute('data-post') | 0); }); }

  function applyData(d) {
    if (!d) return;
    if (d.live != null) live('ফিডে এখন বাস্তব পোস্ট · ' + bn(d.live));
    if (d.me) {
      if (d.me.name) { txt('#lfsExpName', d.me.name); var av = $('#lfsAppbarAvatar'); if (av) av.textContent = letterOf(d.me.name); }
    }
    var posts = (d.posts || []).filter(function (p) { return p && p.text; });
    if (!posts.length) return;
    var els = postEls();
    els.forEach(function (el, i) {
      var p = posts[i];
      if (!p) { el.style.display = 'none'; return; }
      var nameEl = el.querySelector('.lfmo-p-name');
      var subEl  = el.querySelector('.lfmo-p-sub');
      var textEl = el.querySelector('.lfmo-p-text');
      var avEl   = el.querySelector('.lfmo-av');
      if (nameEl && p.name) nameEl.textContent = p.name;
      if (subEl && (p.handle || p.time)) {
        subEl.innerHTML = (p.handle ? p.handle + ' · ' : '') + (p.time || '') + (p.badge ? ' • <b>' + p.badge + '</b>' : '');
      }
      if (textEl && p.text) textEl.textContent = p.text;
      if (avEl) paintAvatar(avEl, null, p.name);
      var likesEl = el.querySelector('#lfsLikeCount');
      if (likesEl && p.likes != null) txt(likesEl, bn(p.likes));
      var cEl = el.querySelector('#lfsCommentCount'); if (cEl && p.comments != null) txt(cEl, bn(p.comments));
      var sEl = el.querySelector('#lfsShareCount'); if (sEl && p.shares != null) txt(sEl, bn(p.shares));
      var vEl = el.querySelector('#lfsViewCount'); if (vEl && p.views != null) txt(vEl, bn(p.views));
    });
    if (CFG.livePostText !== false && posts[0]) CFG.postText = posts[0].text;
  }
  var DATA = readData();
  if (DATA) applyData(DATA);

  /* ══════════════════════ ১গ. স্ক্রল-সিঙ্ক (ঐচ্ছিক) ════════════════════════
     `data-sync="scroll"` দিলে পেজ-স্ক্রলই সিনের টাইমলাইন চালায় (auto-play বন্ধ)। */
  var SCROLL_SYNC = false, syncRaf = 0, lastP = -1;
  function scrollSyncOn() { return (root.getAttribute('data-sync') || '') === 'scroll'; }
  function syncHost() { return root.closest('[data-lfmo-sync]') || root.closest('section') || root.parentElement || root; }
  function onScroll() {
    if (!SCROLL_SYNC) return;
    if (syncRaf) return;
    syncRaf = requestAnimationFrame(function () {
      syncRaf = 0;
      var r = syncHost().getBoundingClientRect(), vh = window.innerHeight;
      var span = (r.height + vh) || 1;
      var p = Math.max(0, Math.min(1, (vh - r.top) / span));
      if (Math.abs(p - lastP) < 0.005) return;
      lastP = p;
      E.fast = true;
      window.LFMotion.seek(p * E.total);
      E.fast = false;
    });
  }
  function enableScrollSync(on_) {
    SCROLL_SYNC = !!on_;
    if (SCROLL_SYNC) {
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', onScroll, { passive:true });
      onScroll();
    } else {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  /* ══════════════════════ ৪. ক্লক ইঞ্জিন ═════════════════════════════════ */
  var E = {
    events: [], elapsed: 0, total: 0, speed: 1, playing: false, paused: false, scene: -1, fast: false,
    onTick: null, onScene: null, raf: 0, prev: 0,
    at: function (t, fn, scene) { this.events.push({ t: t, fn: fn, s: scene == null ? -1 : scene, done: false }); return this; },
    step: function (dt) {
      this.elapsed += dt;
      for (var i = 0; i < this.events.length; i++) {
        var e = this.events[i];
        if (!e.done && this.elapsed >= e.t) {
          e.done = true;
          if (e.s >= 0 && e.s !== this.scene) {
            this.scene = e.s;
            if (typeof this.onScene === 'function') this.onScene(e.s, CFG.sceneNames[e.s] || '');
          }
          try { e.fn(); } catch (err) { /* একটি ধাপ ব্যর্থ হলেও সিন চলবে */ }
        }
      }
      for (var j = 0; j < typers.length; j++) {
        var ty = typers[j];
        if (ty.finished) continue;
        ty.acc += dt;
        while (ty.acc >= ty.per && ty.i < ty.text.length) { ty.acc -= ty.per; ty.i++; ty.el.textContent = ty.text.slice(0, ty.i); }
        if (ty.i >= ty.text.length) { ty.finished = true; if (ty.done) ty.done(); }
      }
      for (var k = 0; k < counters.length; k++) {
        var c = counters[k];
        if (c.n >= c.max) continue;
        c.acc += dt;
        while (c.acc >= c.per && c.n < c.max) { c.acc -= c.per; c.n++; txt(c.sel, c.fmt ? c.fmt(c.n) : bn(c.n)); }
      }
      if (this.onTick) this.onTick(Math.min(this.elapsed / Math.max(this.total, 1), 1));
      if (this.elapsed > this.total + 1500) build();       /* ♻️ অসীম লুপ */
    }
  };
  function tick(ts) {
    if (!E.prev) E.prev = ts;
    var dt = Math.min(ts - E.prev, 70);
    E.prev = ts;
    if (E.playing && !E.paused) E.step(dt * E.speed);
    E.raf = requestAnimationFrame(tick);
  }
  E.raf = requestAnimationFrame(tick);

  /* ══════════════════════ ৫. রিসেট ══════════════════════════════════════ */
  var STATE = ['is-composing','is-ready','is-publishing','is-published','is-picker','is-liked','is-shared',
    'is-saved','is-chat','is-calling','is-incall','is-video','is-story','is-reading','is-comment-sheet',
    'is-share-sheet','is-profile','is-toast','is-verified','is-following','is-notifs','is-search',
    'is-refreshing','is-refreshed','is-bigheart','is-dark'];

  function reset() {
    STATE.forEach(function (c) { root.classList.remove(c); });
    on(root, 'is-in');

    txt('#lfsComposeText', ''); txt('#lfsNewPostText', '');
    html('#lfsSubTime', 'এইমাত্র • <b>সৃজনশীল কবিতা</b>');
    txt('#lfsLikeCount', '১২৪'); txt('#lfsCommentCount', '১৮'); txt('#lfsShareCount', '৫'); txt('#lfsViewCount', '১.২হা');
    txt('#lfsCommentTitle', 'মন্তব্য (১৮)'); txt('#lfsCommentNewText', ''); txt('#lfsCommentInput', 'একটি মন্তব্য লিখুন…');
    off('#lfsCommentNew', 'is-on'); off('#lfsCommentSend', 'is-on');
    txt('#lfsReactIcon', '🤍'); txt('#lfsReactLabel', 'লাইক'); txt('#lfsShareLabel', 'শেয়ার'); txt('#lfsSaveIcon', '🔖');
    $$('.lfmo-pick').forEach(function (p) { p.classList.remove('is-chosen'); });
    off('#lfsShareFb', 'is-picked');

    txt('#lfsNotifBadge', '৩'); off('#lfsBell', 'is-shake');
    $$('.lfmo-notif').forEach(function (n) { n.classList.remove('is-read'); });
    txt('#lfsToastText', 'নতুন নোটিফিকেশন'); txt('#lfsToastSub', 'এখনই দেখুন');

    txt('#lfsSearchInput', ''); txt('#lfsSearchCount', 'ফলাফল খোঁজা হচ্ছে…');
    $$('.lfmo-sresult').forEach(function (r) { r.classList.remove('is-on'); });

    txt('#lfsIncomingText', ''); off('#lfsIncomingMsg', 'is-on'); off('#lfsReplyMsg', 'is-on');
    off('#lfsVoiceMsg', 'is-on'); off('#lfsVoiceMsg', 'is-playing'); txt('#lfsVoiceTime', '০:০০');
    off('#lfsChatDots', 'is-on'); off('#lfsSysMsg', 'is-on'); txt('#lfsReplyTicks', '✓✓');

    txt('#lfsCallStatus', 'ইনকামিং অডিও কল…'); txt('#lfsCallTimer', '০:০০');
    off('#lfsCallMute', 'is-off'); off('#lfsCallSpeaker', 'is-off');
    txt('#lfsVideoTimer', '০:০৩');

    txt('#lfsSheetBadge', '<b>সদস্য</b>'); txt('#lfsSheetName', 'আজিজ ওয়েসি');
    txt('#lfsXpVal', '৭৮%'); var xf = $('#lfsXpFill'); if (xf) xf.style.width = '78%';
    txt('#lfsStatPosts', '৪২'); txt('#lfsStatFollowers', '১২৪০'); txt('#lfsStatReacts', '৩২৮০');
    txt('#lfsFollowBtn', '＋ অনুসরণ করুন');

    txt('#lfsPollTotal', '৮৯'); txt('#lfsReaderProg', ''); var rp = $('#lfsReaderProg'); if (rp) rp.style.width = '0%';
    $$('.lfmo-poll-opt').forEach(function (o) {
      o.classList.remove('is-filled'); o.classList.remove('is-chosen');
      o.style.removeProperty('--pct');
    });
    $$('.lfmo-rtool').forEach(function (t) { t.classList.remove('is-on'); });
    $$('.lfmo-fchip').forEach(function (c) { c.classList.remove('is-tap'); });
    $$('.lfmo-ptab').forEach(function (t) { t.classList.remove('is-on'); }); var pt0 = $('.lfmo-ptab[data-pt="posts"]'); if (pt0) pt0.classList.add('is-on');
    var boosted = $('#lfsPollPost'); if (boosted) boosted.classList.remove('is-boost');

    feedScroll(0);
    var hearts = $('#lfsHearts'); if (hearts) hearts.innerHTML = '';
    var cur = $('#lfsCursor'); if (cur) cur.classList.remove('on');
    live('ফিডে এখন বাস্তব পোস্ট · ৮'); filterOn('fresh');
    $$('.lfmo-seg').forEach(function (s) { s.classList.remove('is-live'); s.classList.remove('is-done'); });
    var trend = $('#lfsTrendRing'); if (trend) trend.classList.remove('is-active');

    typers.length = 0; counters.length = 0;
    applySiteTheme();                     /* লুপ শুরুতে সাইট-থিম মেনে চলে */
  }

  /* ══════════════════════ ৬. স্টোরি হেল্পার ══════════════════════════════ */
  function liveSeg(i) {
    var segs = $$('.lfmo-seg');
    segs.forEach(function (s, k) { s.classList.remove('is-live'); if (k < i) s.classList.add('is-done'); });
    if (segs[i]) { segs[i].classList.add('is-live'); void segs[i].offsetWidth; }
  }
  function showStory(i) {
    var st = CFG.stories[i] || CFG.stories[0];
    txt('#lfsStoryName', st.name); txt('#lfsStoryTime', st.time);
    txt('#lfsStoryText', st.quote); txt('#lfsStorySign', st.sign);
    var av = $('#lfsStoryAv');
    if (av) { av.setAttribute('data-av', st.av); av.innerHTML = avatarSVG(st.av); }
  }

  /* ══════════════════════ ৭. টাইমলাইন (১৫ দৃশ্য ≈ ৬৯ সেকেন্ড) ════════════ */
  function build() {
    E.events = []; E.elapsed = 0; E.prev = 0; E.scene = -1;
    reset();

    /* ── ০. ফিড ── */

    E.at(700, function () { feedScroll(0); }, 0);

    /* ── ০খ. ফিল্টার চিপ: "জনপ্রিয়" ── */
    E.at(600, function () {
      var chip = $('.lfmo-fchip[data-f="popular"]');
      tapOn(chip, function () {
        filterOn('popular');
        live('জনপ্রিয় অনুযায়ী সাজানো • 👁 ১.২হা');
        var post = $('#lfsPollPost'); if (post) post.classList.add('is-boost');
      }, 200);
    }, 0);
    E.at(1900, function () { var post = $('#lfsPollPost'); if (post) post.classList.remove('is-boost'); }, 0);

    /* ── ১. পুল-টু-রিফ্রেশ → নতুন পোস্ট ── */
    E.at(1000, function () { on(root, 'is-refreshing'); feedScroll(14); }, 1);
    E.at(2400, function () {
      on(root, 'is-refreshed'); txt('#lfsRefreshText', '৩টি নতুন পোস্ট');
      live('৩টি নতুন পোস্ট আপডেট হয়েছে'); toast('refresh');
    }, 1);
    E.at(3600, function () { off(root, 'is-refreshing'); off(root, 'is-refreshed'); toastOff(); }, 1);
    E.at(4200, function () { off(root, 'is-refreshing'); feedScroll(22); }, 1);

    /* ── ২. স্টোরি ── */
    E.at(5400, function () {
      on('#lfsTrendRing', 'is-active');
      tapOn('#lfsStoryTap', function () { on(root, 'is-story'); showStory(0); liveSeg(0); });
    }, 2);
    E.at(7500, function () { liveSeg(1); showStory(1); }, 2);
    E.at(9600, function () { liveSeg(2); showStory(2); }, 2);
    E.at(10000, function () { off(root, 'is-story'); tapOn('#lfsStoryClose', null, 60); }, 2);

    /* ── ৩. পোস্ট লেখা ও প্রকাশ ── */
    E.at(10300, function () { tapOn('#lfsCompPill', function () { on(root, 'is-composing'); }); }, 3);
    E.at(11000, function () { typeInto('#lfsComposeText', CFG.postText, CFG.typing.post, function () { on(root, 'is-ready'); }); }, 3);
    E.at(13200, function () { tapOn('#lfsPublishBtn', function () { on(root, 'is-publishing'); }); }, 3);
    E.at(13850, function () {
      off(root, 'is-composing'); off(root, 'is-publishing'); on(root, 'is-published');
      txt('#lfsNewPostText', CFG.postText); feedScroll(50);
    }, 3);

    /* ── ৪. ডাবল-ট্যাপ হার্ট + রিঅ্যাকশন পিকার ── */
    E.at(16600, function () {
      var el = $('#lfsNewPost'), a = el ? el.getBoundingClientRect() : null, b = screenRect();
      if (a) popHearts(6, a.left - b.left + a.width / 2, a.top - b.top + a.height * 0.55, true);
      on('#lfsNewPost', 'is-liked'); txt('#lfsReactIcon', '❤️'); txt('#lfsLikeCount', '১২৫');
      on(root, 'is-bigheart'); setTimeout(function () { off(root, 'is-bigheart'); }, 1150);
    }, 4);
    E.at(17800, function () { holdOn('#lfsReactBtn', function () { on(root, 'is-picker'); }, 460); }, 4);
    E.at(18600, function () {
      var pick = $('.lfmo-pick[data-r="love"]');
      tapOn(pick, function () {
        if (pick) pick.classList.add('is-chosen');
        off(root, 'is-picker'); on(root, 'is-liked');
        txt('#lfsLikeCount', '১২৬'); heartsFrom('#lfsReactBtn'); live('❤️ ১২৬টি লাইক • 👁 ১.৩হা ভিউ');
      }, 280);
    }, 4);
    E.at(20000, function () { live('ফিডে এখন বাস্তব পোস্ট · ৮'); }, 4);

    /* ── ৫. কমেন্ট ── */
    E.at(20900, function () { tapOn('#lfsCommentBtn', function () { on(root, 'is-comment-sheet'); }); }, 5);
    E.at(21600, function () {
      txt('#lfsCommentInput', '');
      typeInto('#lfsCommentInput', CFG.commentText, CFG.typing.comment, function () { on('#lfsCommentSend', 'is-on'); });
    }, 5);
    E.at(24000, function () {
      tapOn('#lfsCommentSend', function () {
        off('#lfsCommentSend', 'is-on');
        txt('#lfsCommentNewText', CFG.commentText); on('#lfsCommentNew', 'is-on');
        txt('#lfsCommentCount', '১৯'); txt('#lfsCommentTitle', 'মন্তব্য (১৯)');
      }, 220);
    }, 5);
    E.at(25100, function () { off(root, 'is-comment-sheet'); }, 5);

    /* ── ৬. পোল ভোট ── */
    E.at(25600, function () { feedScroll(86); }, 6);
    E.at(26200, function () {
      var opt0 = $('.lfmo-poll-opt[data-opt="0"]'), opt1 = $('.lfmo-poll-opt[data-opt="1"]');
      if (opt0) { opt0.style.setProperty('--pct', '38%'); opt0.classList.add('is-filled'); }
      if (opt1) { opt1.style.setProperty('--pct', '62%'); }
      tapOn(opt1, function () {
        if (opt1) { opt1.classList.add('is-filled'); opt1.classList.add('is-chosen'); }
        txt('#lfsPollTotal', '৯০');
      }, 420);
    }, 6);

    /* ── ৭. শেয়ার ও সেভ ── */
    E.at(28900, function () { tapOn('#lfsShareBtn', function () { on(root, 'is-share-sheet'); }); }, 7);
    E.at(29800, function () {
      tapOn('#lfsShareFb', function () {
        on('#lfsShareFb', 'is-picked'); on(root, 'is-shared');
        txt('#lfsShareCount', '৬'); txt('#lfsShareLabel', 'শেয়ার্ড ✓'); toast('share');
      }, 300);
    }, 7);
    E.at(31300, function () { off(root, 'is-share-sheet'); }, 7);
    E.at(31900, function () { toastOff(); }, 7);
    E.at(32500, function () { tapOn('#lfsSaveBtn', function () { on(root, 'is-saved'); toast('saved'); }, 240); }, 7);
    E.at(33800, function () { toastOff(); }, 7);

    /* ── ৮. নোটিফিকেশন সেন্টার ── */
    E.at(34600, function () {
      tapOn('#lfsBell', function () {
        ringBell(); txt('#lfsNotifBadge', '৯৯+'); on(root, 'is-notifs'); toast('notif');
      }, 260);
    }, 8);
    E.at(36200, function () { tapOn('.lfmo-notif', function () { on('.lfmo-notif', 'is-read'); }, 220); }, 8);
    E.at(37400, function () { off(root, 'is-notifs'); off(root, 'is-toast'); }, 8);

    /* ── ৯. মেসেঞ্জার + ভয়েস নোট ── */
    E.at(38300, function () { tapOn('#lfsChatBtn', function () { on(root, 'is-chat'); }, 260); }, 9);
    E.at(39400, function () { on('#lfsChatDots', 'is-on'); }, 9);
    E.at(40100, function () {
      off('#lfsChatDots', 'is-on'); on('#lfsIncomingMsg', 'is-on');
      typeInto('#lfsIncomingText', CFG.chatText, CFG.typing.chat);
    }, 9);
    E.at(42400, function () { on('#lfsReplyMsg', 'is-on'); }, 9);
    E.at(43000, function () {
      on('#lfsVoiceMsg', 'is-on'); on('#lfsVoiceMsg', 'is-playing');
      countUp('#lfsVoiceTime', 12, 120, function (n) { return '০:' + (n < 10 ? '০' + bn(n) : bn(n)); });
    }, 9);

    /* ── ১০. ইনকামিং অডিও কল ── */
    E.at(44400, function () { tapOn('#lfsChatCall', function () { on(root, 'is-calling'); }, 260); }, 10);
    E.at(46100, function () {
      tapOn('#lfsCallAccept', function () {
        off(root, 'is-calling'); on(root, 'is-incall');
        txt('#lfsCallStatus', 'সংযুক্ত • সাদিয়া ইসলাম');
        countUp('#lfsCallTimer', 9, 900, function (n) { return '০:০' + bn(n); });
      }, 320);
    }, 10);
    E.at(47400, function () {
      tapOn('#lfsCallMute', function () { on('#lfsCallMute', 'is-off'); }, 220);
      setTimeout(function () { tapOn('#lfsCallSpeaker', function () { on('#lfsCallSpeaker', 'is-off'); }, 200); }, 650);
    }, 10);
    E.at(48700, function () {
      tapOn('#lfsCallEnd', function () {
        off(root, 'is-incall'); on('#lfsSysMsg', 'is-on'); txt('#lfsSysMsg', '☎️ কল শেষ • ০:০৯');
      }, 280);
    }, 10);

    /* ── ১১. ভিডিও কল (PiP) ── */
    E.at(49600, function () {
      tapOn('#lfsVideoCallBtn', function () { on(root, 'is-video'); txt('#lfsVideoTimer', '০:০০'); }, 280);
      countUp('#lfsVideoTimer', 6, 500, function (n) { return '০:০' + bn(n); });
    }, 11);
    E.at(51400, function () {
      tapOn('#lfsVideoEnd', function () {
        off(root, 'is-video'); txt('#lfsSysMsg', '🎥 ভিডিও কল শেষ • ০:০৬');
      }, 260);
    }, 11);

    /* ── ১১খ. মেসেঞ্জার বন্ধ → ফিডে ফেরা ── */
    E.at(52000, function () { off(root, 'is-chat'); txt('#lfsSysMsg', ''); }, 11);

    /* ── ১২. রিডিং মোড + ডার্ক মোড ── */
    E.at(52600, function () {
      tapOn('#lfsNewPostMedia', function () {
        on(root, 'is-reading');
        var rp = $('#lfsReaderProg'); if (rp) { rp.style.transition = 'width 4.4s linear'; rp.style.width = '100%'; }
      }, 280);
    }, 12);
    E.at(54800, function () { tapOn('.lfmo-rtool', function () { on(root, 'is-dark'); on('.lfmo-rtool', 'is-on'); live('🌙 ডার্ক মোড'); }, 240); }, 12);
    E.at(56800, function () {
      off(root, 'is-reading');
      var rp = $('#lfsReaderProg'); if (rp) { rp.style.transition = 'none'; rp.style.width = '0%'; }
    }, 12);
    E.at(57600, function () { tapOn('#lfsThemeBtn', function () { off(root, 'is-dark'); live('লাইট থিমে ফিরে এসেছে'); }, 220); }, 12);

    /* ── ১৩. প্রোফাইল ভেরিফিকেশন ── */
    E.at(58600, function () { tapOn('#lfsAppbarAvatar', function () { on(root, 'is-profile'); }, 260); }, 13);
    E.at(59900, function () {
      on(root, 'is-verified'); html('#lfsSheetBadge', '<b>যাচাইকৃত লেখক ✓</b>');
      txt('#lfsXpVal', '৮৫%'); var xf = $('#lfsXpFill'); if (xf) xf.style.width = '85%';
      txt('#lfsStatPosts', '৪৩'); txt('#lfsStatFollowers', '১২৪৭'); txt('#lfsStatReacts', '৩৩০৫');
    }, 13);
    E.at(61400, function () { tapOn('#lfsFollowBtn', function () { on(root, 'is-following'); txt('#lfsFollowBtn', '✓ অনুসরণ করছেন'); }, 260); }, 13);
    E.at(62400, function () { toast('verified'); }, 13);
    E.at(63200, function () { off(root, 'is-profile'); }, 13);
    E.at(63800, function () { toastOff(); }, 13);

    /* ── ১৪. লাইভ সার্চ ── */
    E.at(64500, function () { tapOn('#lfsSearchBtn', function () { on(root, 'is-search'); }, 240); }, 14);
    E.at(65200, function () {
      typeInto('#lfsSearchInput', CFG.searchQuery, CFG.typing.search, function () {
        txt('#lfsSearchCount', '৩টি ফলাফল পাওয়া গেছে');
        $$('.lfmo-sresult').forEach(function (r, i) { setTimeout(function () { on(r, 'is-on'); }, i * 160); });
      });
    }, 14);
    E.at(68200, function () { tapOn('#lfsSearchInput', function () { off(root, 'is-search'); }, 200); }, 14);

    /* ── ১৫. লিডারবোর্ড ও ব্যাজ (সর্বশেষ) ── */
    E.at(69400, function () { filterOn('fresh'); tapOn('#lfsAppbarAvatar', function () { on(root, 'is-profile'); }, 240); }, 15);
    E.at(70400, function () { live('🏆 সেরা লেখক: আপনি ৫ নম্বরে'); tapOn('#lfsLeaderLink', function () { off(root, 'is-profile'); on(root, 'is-leader'); }, 260); }, 15);
    E.at(71800, function () { tapOn('.lfmo-lb-me', function () { on('#lfsLeaderCta', 'is-on'); }, 240); }, 15);
    E.at(72800, function () { off(root, 'is-leader'); off(root, 'is-profile'); live('ফিডে এখন বাস্তব পোস্ট · ৮'); }, 15);

    E.total = 73600;   /* ← লুপের দৈর্ঘ্য (ms) */
  }

  /* ══════════════════════ ৮. ফ্রেম-ফিট (উচ্চতা নিশ্চিতকরণ) ═══════════════ */
  function fit() {
    var cs = window.getComputedStyle(root);
    var devH  = parseFloat(cs.getPropertyValue('--dev-h')) || 440;
    var pad   = parseFloat(cs.getPropertyValue('--dev-frame-pad')) || 5;
    var glass = parseFloat(cs.getPropertyValue('--dev-glass-pad')) || 1.5;
    var sceneW = parseFloat(cs.getPropertyValue('--lfmo-scene-w')) || 312;

    var phoneH = devH + 2 * (pad + glass);         /* ফোনের মোট উচ্চতা (বেজেল সহ) */
    var sceneH = phoneH + 10;                      /* সিন বক্স = ফোন + ১০px */
    root.style.setProperty('--lfmo-scene-h', sceneH + 'px');

    /* ফ্রেম খোঁজা: সাইটে `.sfs292-card`, পুরোনো ডেমোতে `.feed-showcase`,
       না পেলে সেকশন। কখনোই সিনের নিজের মোড়ক (wrapper) ব্যবহার করা হয় না —
       তাতে উচ্চতা মাপা দুষ্টচক্রে পড়ে ফোন অকারণে ছোট হয়ে যেত। */
    var frameEl = root.closest('.feed-showcase') || root.closest('.sfs292-card') ||
                  root.closest('#user-feed') || root.closest('section');
    var fh = 0, fw = 0;
    if (frameEl && frameEl !== document.body) { fh = frameEl.clientHeight; fw = frameEl.clientWidth; }

    /* নিজের মোড়কের উচ্চতা ফ্রেম হিসেবে ধরা হয় না (feedback-loop গার্ড) */
    var hostH = root.parentElement ? root.parentElement.clientHeight : 0;
    if (fh && Math.abs(fh - hostH) < 12) fh = 0;

    /* ফ্রেমের উচ্চতা না পাওয়া গেলে ৫২০px ধরা হয়; ফোন কখনোই ফ্রেমের চেয়ে বড় হবে না */
    var capH = fh && fh > 340 ? fh - 44 : 520;
    capH = Math.min(capH, 640);
    var capW = (fw && fw > 200 ? fw : (root.parentElement ? root.parentElement.clientWidth : 360)) - 16;

    var s = Math.min(1, capH / sceneH, capW / sceneW);
    s = Math.max(0.55, Math.round(s * 1000) / 1000);

    root.style.setProperty('--lfmo-scale', s);
    root.style.height = Math.round(sceneH * s) + 'px';
    root.setAttribute('data-lfmo-scale', s);
    root.setAttribute('data-lfmo-phone-h', Math.round(phoneH * s));
    root.setAttribute('data-lfmo-frame-h', Math.round(fh || 460));
  }

  var fitTimer = null;
  function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 120); }
  window.addEventListener('resize', scheduleFit, { passive: true });
  window.addEventListener('orientationchange', scheduleFit, { passive: true });
  if (window.ResizeObserver) {
    try {
      var frameRO = root.closest('.feed-showcase') || root.parentElement;
      if (frameRO) new ResizeObserver(scheduleFit).observe(frameRO);
    } catch (e) {}
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit).catch(function () {});
  window.addEventListener('load', scheduleFit);
  setTimeout(fit, 30); setTimeout(fit, 400); setTimeout(fit, 1400);

  /* ══════════════════════ ৯. পাবলিক API (LFMotion) ═══════════════════════ */
  var DEVICES = ['iphone15pro', 'galaxy-s24-ultra', 'pixel-8-pro'];
  window.LFMotion = {
    play:      function () { E.playing = true; E.paused = false; return this; },
    pause:     function () { E.paused = true; return this; },
    toggle:    function () { E.paused ? this.play() : this.pause(); return this; },
    replay:    function () { build(); E.playing = true; E.paused = false; E.prev = 0; return this; },
    setSpeed:  function (v) { E.speed = Math.min(Math.max(Number(v) || 1, 0.25), 4); return this; },
    duration:  function () { return E.total; },
    isPlaying: function () { return E.playing && !E.paused; },
    progress:  function () { return Math.min(E.elapsed / Math.max(E.total, 1), 1); },
    time:      function () { return E.elapsed; },
    /* নির্দিষ্ট সময়ে লাফ: 0…1 (progress) অথবা ms — আগের সব ধাপ একবারে চালানো হয় */
    seek:      function (target) {
      var t = Number(target) || 0;
      if (t <= 1) t = t * E.total;
      t = Math.max(0, Math.min(t, E.total));
      reset();
      E.elapsed = 0; E.prev = 0; E.scene = -1; E.fast = true;
      E.events.forEach(function (e) { e.done = false; });
      E.events.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (e) {
        if (e.t > t) return;
        e.done = true;
        if (e.s >= 0 && e.s !== E.scene) {
          E.scene = e.s;
          if (typeof E.onScene === 'function') E.onScene(e.s, CFG.sceneNames[e.s] || '');
        }
        try { e.fn(); } catch (err) {}
      });
      E.elapsed = t; E.fast = false;
      typers.length = 0; counters.length = 0;
      return this;
    },
    sceneNames: CFG.sceneNames,
    /* ডিভাইস প্রিসেট: 'iphone15pro' | 'galaxy-s24-ultra' | 'pixel-8-pro' */
    setDevice: function (name) {
      if (DEVICES.indexOf(name) < 0) return this;
      root.setAttribute('data-device', name); fit(); return this;
    },
    getDevice: function () { return root.getAttribute('data-device'); },
    devices: DEVICES,
    /* সাইটের আসল পোস্ট বসান (JSON) */
    setData:   function (d) { applyData(d); return this; },
    getData:   function () { return DATA; },
    /* স্ক্রল-সিঙ্ক: LFMotion.scrollSync(true) → পেজ-স্ক্রলই টাইমলাইন চালায় */
    scrollSync: function (on_) { enableScrollSync(on_ !== false); if (on_ !== false) E.playing = false; return this; },
    isScrollSync: function () { return SCROLL_SYNC; },
    /* অ্যাভাটার শৈলী: 'letter' (ডিফল্ট, সাইট-শৈলী) | 'face' */
    setAvatar: function (mode) {
      root.setAttribute('data-avatar', mode === 'face' ? 'face' : 'letter');
      $$('[data-av]').forEach(function (el) { paintAvatar(el, el.getAttribute('data-av')); });
      return this;
    },
    /* থিম: 'light' (ডিফল্ট) | 'dark' — সাইট-থিম লক করে */
    setTheme: function (t) { root.setAttribute('data-theme-lock', t === 'dark' ? 'dark' : 'light'); root.classList.toggle('is-dark', t === 'dark'); return this; },
    getTheme: function () { return root.classList.contains('is-dark') ? 'dark' : 'light'; },
    /* লেআউট: 'right' (ডিফল্ট) | 'center' | 'left' */
    setAlign: function (a) {
      if (['right', 'center', 'left'].indexOf(a) < 0) return this;
      root.setAttribute('data-align', a); fit(); return this;
    },
    getAlign: function () { return root.getAttribute('data-align'); },
    set onTick(fn) { E.onTick = fn; },
    get onTick() { return E.onTick; },
    set onScene(fn) { E.onScene = fn; },
    get onScene() { return E.onScene; }
  };


  /* ══════════════════════ ৯খ. পুরোনো ফ্লোটিং বার/পিল সরানো ═══════════════
     `#user-feed`-এর ভেতরে পুরোনো ৩টি পিল (.sfs292-chip-*), কুইক-পিল ও পুরোনো
     স্ট্যাটিক ফোন থাকলে সিন চালু হওয়ার সাথে সাথেই সরিয়ে দেয় —
     home.ejs পরিষ্কার না করলেও ভাসমান বার আর দেখা যাবে না।
     (বন্ধ করতে চাইলে: <div id="lfmoScene" data-keep-legacy>) */
  function purgeLegacy() {
    if (root.hasAttribute('data-keep-legacy')) return 0;
    var host = root.closest('#user-feed') || root.closest('.sfs292-card') || root.closest('section') || root.parentElement;
    if (!host) return 0;
    var n = 0;
    var sel = '.sfs292-chip, .sfs292-chip-a, .sfs292-chip-b, .sfs292-chip-c, ' +
              '.fs-quick-pills, .fs-quick-access, .fs-float-pill, .fs-side-label, [data-lfmo-legacy]';
    host.querySelectorAll(sel).forEach(function (el) { el.remove(); n++; });
    /* পুরোনো স্ট্যাটিক ফোন (নতুন সিনের বাইরে থাকলে) */
    host.querySelectorAll('.sfs292-phone').forEach(function (el) {
      if (!el.contains(root)) { el.remove(); n++; }
    });
    return n;
  }
  function purgeAndCount() {
    var n = purgeLegacy();
    if (n) root.setAttribute('data-lfmo-purged', String((parseInt(root.getAttribute('data-lfmo-purged'), 10) || 0) + n));
    return n;
  }
  purgeAndCount();
  /* দেরিতে রেন্ডার হওয়া পুরোনো উপাদান ধরতেও আরও দুবার */
  setTimeout(purgeAndCount, 700); setTimeout(purgeAndCount, 2000);

  /* ══════════════════════ ১০. ইনিশিয়ালাইজ ═══════════════════════════════ */
  build();
  if (scrollSyncOn()) enableScrollSync(true);

  if (reduced) {
    on(root, 'is-in'); on(root, 'is-published'); on(root, 'is-liked'); on(root, 'is-verified');
    txt('#lfsNewPostText', CFG.postText);
    txt('#lfsReactIcon', '❤️'); txt('#lfsLikeCount', '১২৫');
    html('#lfsSheetBadge', '<b>যাচাইকৃত লেখক ✓</b>');
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (!E.paused) E.playing = true; }
        else { E.playing = false; }
      });
    }, { threshold: 0.15 });
    io.observe(root);
    window.addEventListener('visibilitychange', function () { E.playing = !document.hidden; });
  } else {
    E.playing = true;
  }
})();
