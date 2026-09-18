/* ── সেশন ৯৯ (রোডম্যাপ-আইটেম ০১): লাইভ-পুশ ক্লায়েন্ট (SSE) ─────────────────────────
 * EventSource('/api/events') → দুই ইভেন্ট:
 *   'notification' → বেল-ব্যাজ ইনক্রিমেন্ট + FB-টোস্ট + ড্রপডাউন-খোলা থাকলে লাইভ-রিফ্রেশ
 *   'message'      → ওই কথোপকথন-পেজ খোলা থাকলে তাৎক্ষণিক poll-কিক (lfMsgSSEKick)
 *                    + ট্যাব-লুকানো অবস্থায় টাইটেল-কাউন্টার '(২) লেখক ফোরাম'
 * ফলব্যাক: EventSource বারবার ফেইল করলে (প্রক্সি-সংযত পরিবেশ) ৪৫সে-ব্যাজ-পোল।
 * সত্যের-উৎস আগের মতোই সার্ভার-রেন্ডার + পোলিং-ইঞ্জিন — এটা শুধু লেটেন্সি কমায়। */
(function () {
  'use strict';
  var body = document.body;
  var myUid = body ? body.getAttribute('data-uid') : null;
  if (!myUid || typeof window.EventSource !== 'function') return;

  /* ডায়গনস্টিক হ্যান্ডেল — E2E যাচাই window.lfSSEState.events পড়ে */
  var state = { ok: false, events: 0, lastAt: 0, fails: 0, fallback: false };
  window.lfSSEState = state;
  /* E2E-ডায়গনস্টিক: সর্বশেষ ১০ ইভেন্টের টাইপ-লগ */
  var evLog = [];
  window.lfSSELog = evLog;
  function logEv(t) { evLog.push({ t: t, at: Date.now() }); if (evLog.length > 10) evLog.shift(); }

  var baseTitle = document.title;
  var hiddenUnread = 0;
  var badgeCount = null; /* null = সার্ভার-রেন্ডারড মান এখনো অজানা */

  /* ── বেল-ব্যাজ ─────────────────────────────────────────────────────────── */
  function bnNum(n) {
    return String(n).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; });
  }
  function setBadge(n) {
    badgeCount = Math.max(0, n);
    var b = document.getElementById('notifBadge');
    var btn = document.querySelector('.notif-bell-btn');
    if (badgeCount > 0) {
      if (!b && btn) {
        b = document.createElement('span');
        b.className = 'notif-badge';
        b.id = 'notifBadge';
        btn.appendChild(b);
      }
      if (b) {
        b.textContent = badgeCount > 9 ? '৯+' : bnNum(badgeCount);
        /* সেশন ৯৪: নতুন-ব্যাজ-পপ (প্রতি-আপডেটে রিস্টার্ট) */
        b.classList.remove('badge-pop');
        void b.offsetWidth;
        b.classList.add('badge-pop');
      }
    } else if (b) {
      b.remove();
    }
    return badgeCount;
  }
  function bumpBadge(delta) { setBadge((badgeCount === null ? 0 : badgeCount) + delta); }

  function pulseBell() {
    var wrap = document.getElementById('notifBell');
    if (!wrap) return;
    wrap.classList.remove('notif-ping');
    /* reflow ছাড়া পরপর-ইভেন্টে অ্যানিমেশন রিস্টার্ট হয় না */
    void wrap.offsetWidth;
    wrap.classList.add('notif-ping');
  }

  /* ── ড্রপডাউন লাইভ-রিফ্রেশ (সার্ভার-মার্কআপের হুবহু শেপ) ──────────────────── */
  var ICONS = { message: 'fa-comment-dots', like: 'fa-thumbs-up', react: 'fa-heart', comment: 'fa-comment', share: 'fa-share', follow: 'fa-user-plus', complaint: 'fa-flag', notice: 'fa-bullhorn', mention: 'fa-at', answer: 'fa-question-circle', answer_accepted: 'fa-circle-check', call: 'fa-phone-slash' }; /* সেশন ৯৭-মার্জ: call-টাইপ → মিসড-কল-আইকন (header.ejs _ico-এর সাথে সিঙ্কড) */
  /* সেশন ১৩১: UTC-সচেতন DB-টাইমস্ট্যাম্প পার্স (main.js _pTs131-এর মিরর — PLANS-চুক্তি: স্কিমা-বদলে দুই-জায়গাই) */
  function _pTs131L(s) {
    s = String(s == null ? '' : s).trim();
    if (!s) return NaN;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00Z').getTime();
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) return new Date(s.replace(' ', 'T') + 'Z').getTime();
    var d = new Date(s); return d.getTime();
  }

  function relTime(raw) {
    if (!raw) return '';
    var t = _pTs131L(raw); /* সেশন ১৩১: DB-নেম-লেস = UTC ('Z'-জোড়া) — ক্লায়েন্ট-লোকাল-মিসপার্স-ফিক্স */
    if (isNaN(t)) return String(raw);
    var min = Math.floor((Date.now() - t) / 60000);
    if (min < 1) return 'এইমাত্র';
    if (min < 60) return bnNum(min) + ' মিনিট আগে';
    var hr = Math.floor(min / 60);
    if (hr < 24) return bnNum(hr) + ' ঘণ্টা আগে';
    var day = Math.floor(hr / 24);
    if (day === 1) return 'গতকাল';
    if (day < 7) return bnNum(day) + ' দিন আগে';
    return String(raw).slice(0, 10);
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function paintList(items) {
    var box = document.getElementById('notifList');
    if (!box) return;
    if (!items || !items.length) {
      box.innerHTML = '<div class="notif-empty"><i class="far fa-bell"></i><p>কোনো বিজ্ঞপ্তি নেই</p></div>';
      return;
    }
    box.innerHTML = items.map(function (n) {
      var ico = ICONS[n.type] || 'fa-bell';
      /* সেশন ১০২-ইউনিয়ন: actor-avatar — actor_id (JOIN + legacy link-fallback) থাকলে
         ৪০px-বৃত্তে ছবি (img onerror → has-avatar ক্লাস সরে → আইকন আবার দৃশ্যমান);
         নইলে টাইপ-রঙা .ico-<type> আইকন-সার্কল — header.ejs-সার্ভার-মার্কআপের সাথে অভিন্ন */
      var icoHtml = n.actor_id
        ? '<span class="notif-ico has-avatar"><img class="notif-avatar" src="' + esc(n.actor_avatar || ('/avatar/' + n.actor_id)) + '" alt="" loading="lazy" onerror="this.parentNode.classList.remove(\'has-avatar\');this.remove()"><i class="fas ' + ico + ' nf-b148 nf-b148-' + esc(n.type) + '"></i></span>'
        : '<span class="notif-ico ico-' + esc(n.type) + '"><i class="fas ' + ico + '"></i></span>';
      /* সেশন ১২৫: paintList-মিরর — header.ejs-canonical-শেলের (সেশন ১২১) হুবহু প্রতিরূপ।
         আগের পেইন্ট এক-এঞ্চর-মার্কআপে ফেরত যেত — প্রতি-বেল-ওপেন রিফ্রেশে ডিসমিস-✕
         মুছে যেত (E2E-ধরা-বাগ: "stale-repaint" ছিল আসলে এই মার্কআপ-ড্রিফট)।
         ✕-আচরণ header.ejs-এর ডেলিগেটেড list121-লিসেনারে — পেইন্টেড-রোতেও স্বয়ংক্রিয়। */
      return '<a href="' + esc(n.link || '/notifications') + '" class="notif-item ' + (n.is_read ? '' : 'unread') + '"'
        /* সেশন ১২৫: data-n restore-পেলোড — header.ejs-ক্যানোনিকাল-শেলের data-n-চুক্তির মিরর
           (ড্রপডাউন-ডিসমিস-টোস্টের 'বাতিল করুন' AJAX-রেন্ডার-আইটেমেও কাজ করে) */
        + ' data-n="' + esc(JSON.stringify({ i: n.id, t: n.type, ti: n.title || '', b: n.body || '', l: n.link || '', r: n.is_read ? 1 : 0, ts: n.created_at || '' })) + '">' +
        icoHtml +
        '<span class="notif-text">' +
        '<span class="notif-body">' + esc(n.body) + '</span>' +
        /* সেশন ১২৫: data-ts-চুক্তি — LekhokRelTime AJAX-রিরেন্ডার-আইটেমেও প্রযোজ্য (header.ejs-প্যারিটি) */
        '<span class="notif-time" data-ts="' + esc(n.created_at || '') + '">' + esc(relTime(n.created_at)) + '</span>' +
        (n.type === 'call' ? '<span class="notif-missed" title="মিসড কল"><i class="fas fa-phone-slash"></i> মিসড কল</span>' : '') + /* সেশন ৯৭-মার্জ: মিসড-কল-চিপ (সার্ভার-রেন্ডারড ড্রপডাউনের সাথে অভিন্ন) */
        '</span>' +
        (n.is_read ? '' : '<span class="notif-dot" title="অপঠিত"></span>') +
        /* সেশন ১৪৮: ✕ → ৩-ডট কুইক-অ্যাকশন (header.ejs-ক্যানোনিকাল-শেলের হুবহু প্রতিরূপ —
           পেইন্টেড-রোতেও অ্যাক্টর-ব্যাজ + পঠিত↔অপঠিত টগল + মুছুন; ডেলিগেটেড nf148-ইঞ্জিন
           স্বয়ংক্রিয়-প্রযোজ্য) */
        '<span class="nf-act148">' +
        '<button type="button" class="nf-dots148" data-nf-dots148 aria-haspopup="true" aria-expanded="false" aria-label="বিজ্ঞপ্তির বিকল্প" title="বিকল্প"><i class="fas fa-ellipsis-v" aria-hidden="true"></i></button>' +
        '<span class="nf-menu148" role="menu" hidden>' +
        '<button type="button" class="nf-mi148" role="menuitem" data-nf-read148="' + esc(n.id) + '"><i class="far ' + (n.is_read ? 'fa-envelope' : 'fa-check-circle') + '" aria-hidden="true"></i><span data-nf-rlabel148>' + (n.is_read ? 'অপঠিত হিসেবে চিহ্নিত করুন' : 'পঠিত হিসেবে চিহ্নিত করুন') + '</span></button>' +
        '<button type="button" class="nf-mi148 nf-mi-danger148" role="menuitem" data-nf-del148="' + esc(n.id) + '"><i class="far fa-trash-alt" aria-hidden="true"></i><span>বিজ্ঞপ্তিটি মুছুন</span></button>' +
        '</span>' +
        '</span>' +
        '</a>';
    }).join('');
  }
  var refreshBusy = false;
  function refreshDropdown() {
    if (refreshBusy || !document.getElementById('notifList')) return;
    refreshBusy = true;
    fetch('/api/notifications/recent', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ok) {
          /* সেশন ১৪৮: কুইক-অ্যাকশন-মেনু খোলা থাকলে DOM-repaint স্কিপ (ব্যাজ-আপডেট চলবেই) —
             খোলা-মেনু-ধ্বংস রোধ (FB-আচরণ: ইন্টারঅ্যাকশন-চলাকালে তালিকা-চার্ন নেই) */
          var boxNow = document.getElementById('notifList');
          var menuOpen148 = boxNow && !!boxNow.querySelector('.nf-act148.open');
          if (!menuOpen148) paintList(d.items);
          setBadge(d.unread);
        }
      })
      .catch(function () {})
      .finally(function () { refreshBusy = false; });
  }
  /* ড্রপডাউন খোলার মুহূর্তে ফ্রেশ-ডেটা — সেশন ১৪৮-গোটচা: আগে wrap-ক্যাপচারে wrap-এর ভেতরের
     যে-কোনো ক্লিকেই (৩-ডট/মেনু-আইটেম সহ) ৮০ms-পরে repaint হতো → খোলা কুইক-অ্যাকশন-মেনু
     ধ্বংস হয়ে যেত (E2E-ধরা)। এখন কেবল bell-বাটনের নিজের ক্লিকেই রিফ্রেশ। */
  var bell = document.getElementById('notifBell');
  if (bell) bell.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.notif-bell-btn')) return;
    setTimeout(refreshDropdown, 80);
  }, true);

  /* ── টাইটেল-কাউন্টার (FB-প্যাটার্ন: ট্যাব-লুকানো অবস্থায় '(২) লেখক ফোরাম') ───── */
  function resetTitle() {
    hiddenUnread = 0;
    if (document.title !== baseTitle) document.title = baseTitle;
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') resetTitle();
  });
  window.addEventListener('focus', resetTitle);

  /* ── ইভেন্ট-হ্যান্ডলার ────────────────────────────────────────────────────── */
  function onNotification(d) {
    logEv("notification"); state.events++; state.lastAt = Date.now();
    bumpBadge(1);
    pulseBell();
    if (d && d.body && typeof window.showToast === 'function') {
      window.showToast(d.body, 'info');
    }
    var dd = document.getElementById('notifDropdown');
    if (dd && dd.classList.contains('open')) refreshDropdown();
    document.dispatchEvent(new CustomEvent('lf:sse-notification', { detail: d }));
  }
  function onMessage(d) {
    logEv("message"); state.events++; state.lastAt = Date.now();
    /* ১) এই কথোপকথন-পেজ খোলা থাকলে → তাৎক্ষণিক poll-কিক (append/seen/সব-লজিক পোলেই) */
    if (typeof window.lfMsgSSEKick === 'function' &&
        String(window.lfMsgConvId || '') === String(d && d.conv_id)) {
      try { window.lfMsgSSEKick(); } catch (_) {}
    }
    /* ২) ট্যাব-লুকানো → টাইটেল-কাউন্টার */
    if (document.visibilityState !== 'visible' || !document.hasFocus()) {
      hiddenUnread++;
      document.title = '(' + bnNum(hiddenUnread) + ') ' + baseTitle;
    }
    /* ৩) অন্য-ইঞ্জিন (মেসেঞ্জার-লিস্ট ইত্যাদি) শুনতে পারে */
    try { document.dispatchEvent(new CustomEvent('lf:sse-message', { detail: d })); } catch (_) {}
  }

  /* ── সংযোগ + ফলব্যাক ────────────────────────────────────────────────────── */
  var es = null, fallbackTimer = null;
  function startFallback() {
    if (fallbackTimer || state.fallback) return;
    state.fallback = true;
    fallbackTimer = setInterval(function () {
      fetch('/api/notifications/count', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && typeof d.unread === 'number') setBadge(d.unread); })
        .catch(function () {});
    }, 45000);
  }
  function connect() {
    try { es = new EventSource('/api/events'); } catch (_) { startFallback(); return; }
    es.onopen = function () { state.ok = true; state.fails = 0; };
    es.onerror = function () {
      state.ok = false; state.fails++;
      /* EventSource নিজে auto-reconnect করে; ৩+ ফেইলে ব্যাজ-ফলব্যাক-পোল চালু */
      if (state.fails >= 3) startFallback();
    };
    es.addEventListener('notification', function (e) {
      try { onNotification(JSON.parse(e.data)); } catch (_) {}
    });
    es.addEventListener('message', function (e) {
      try { onMessage(JSON.parse(e.data)); } catch (_) {}
    });
  }
  connect();
})();
