/* ═══ সেশন ১০৫: FB-স্টাইল রিঅ্যাক্টরস-মডাল ("কে কোন প্রতিক্রিয়া দিয়েছে") ═══
   ইউজার-স্পেসিফিকেশন (FB-হুবহু):
   · পোস্টের মেট্রিক-রোতে বামের ওভারল্যাপিং ইমোজি/কাউন্টে ক্লিক → এই মডাল খোলে
   · উপরে [সব] [👍] [❤️] [😂]… ফিল্টার-ট্যাব (শুধু কাউন্ট>০ গুলো)
   · তালিকা: অ্যাভাটার (কোণে রিঅ্যাকশন-ব্যাজ) + নাম (+পেন-নাম চিপ)
   · নাম/প্রোফাইল-বাটনে ক্লিকে সরাসরি /profile/:username
   ডেটা: GET /api/reactions/:type/:id/reactors (পাবলিক — সেশন ১০৫)
   সংঘর্ষ-নোট: main.js-এর lf:reactupdate-শৃঙ্খল ও hold+slide প্যালেট অক্ষত —
   এই ফাইল শুধু .reaction-summary[data-reactors-for]-ক্লিক শোনে (delegation)। */
(function () {
  'use strict';
  if (window.LekhokReactors) return; // ডাবল-ইনক্লুড-গার্ড
  window.LekhokReactors = true;

  var META = {
    like:  { emoji: '👍', label: 'লাইক' },
    love:  { emoji: '❤️', label: 'ভালোবাসা' },
    care:  { emoji: '🤗', label: 'কেয়ার' },
    haha:  { emoji: '😂', label: 'হাহা' },
    wow:   { emoji: '😮', label: 'বিস্ময়' },
    sad:   { emoji: '😢', label: 'দুঃখ' },
    angry: { emoji: '😡', label: 'রাগ' }
  };
  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }

  var backdrop, tabsEl, listEl, emptyEl, loadingEl, allCountEl;
  var current = { type: 'post', id: null, data: null, tab: 'ALL', reqSeq: 0 };

  function q(sel) { return document.querySelector(sel); }

  function cacheEls() {
    backdrop = q('#rxModal');
    if (!backdrop) return false;
    tabsEl = q('#rxTabs');
    listEl = q('#rxList');
    emptyEl = q('#rxEmpty');
    loadingEl = q('#rxLoading');
    allCountEl = q('#rxTabAllCount');
    return true;
  }

  function openModal() {
    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var closeBtn = q('#rxClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    current.tab = 'ALL';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function avatarSrc(u) {
    return u.avatar_url || '/avatar/' + encodeURIComponent(u.id);
  }

  function displayName(u) {
    return u.pen_name || u.name || ('ইউজার-' + u.id);
  }

  function renderTabs() {
    var data = current.data || [];
    var counts = {};
    data.forEach(function (u) {
      var k = u.reaction || 'like';
      counts[k] = (counts[k] || 0) + 1;
    });
    var html = '<button type="button" class="rxm-tab is-active" data-rx-tab="ALL" role="tab" aria-selected="true">সব <span class="rxm-tabcount">' + bn(data.length) + '</span></button>';
    Object.keys(META).forEach(function (k) {
      if (!counts[k]) return;
      html += '<button type="button" class="rxm-tab" data-rx-tab="' + k + '" role="tab" aria-selected="false" title="' + META[k].label + '">' +
        '<span class="rxm-tabemoji">' + META[k].emoji + '</span> <span class="rxm-tabcount">' + bn(counts[k]) + '</span></button>';
    });
    tabsEl.innerHTML = html;
  }

  function renderList() {
    var data = current.data || [];
    var tab = current.tab;
    var rows = tab === 'ALL' ? data : data.filter(function (u) { return (u.reaction || 'like') === tab; });
    if (!data.length) {
      emptyEl.hidden = false;
      listEl.innerHTML = '';
      return;
    }
    emptyEl.hidden = true;
    if (!rows.length) {
      listEl.innerHTML = '<li class="rxm-none">এই ফিল্টারে কেউ নেই।</li>';
      return;
    }
    var html = '';
    rows.forEach(function (u) {
      var uname = u.username || ('user-' + u.id);
      var href = '/profile/' + encodeURIComponent(uname);
      var em = (META[u.reaction || 'like'] || META.like).emoji;
      var lbl = (META[u.reaction || 'like'] || META.like).label;
      html += '<li class="rxm-row">' +
        '<a class="rxm-user" href="' + esc(href) + '">' +
          '<span class="rxm-avwrap">' +
            '<img class="rxm-av" loading="lazy" decoding="async" src="' + esc(avatarSrc(u)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
            '<span class="rxm-badge" title="' + esc(lbl) + '">' + em + '</span>' +
          '</span>' +
          '<span class="rxm-meta">' +
            '<strong class="rxm-name">' + esc(displayName(u)) + '</strong>' +
            (u.pen_name && u.name ? '<span class="rxm-sub">' + esc(u.name) + '</span>' : '') +
            '<span class="rxm-hint">প্রোফাইল দেখতে ক্লিক করুন</span>' +
          '</span>' +
        '</a>' +
        '<a class="rxm-profilebtn" href="' + esc(href) + '">প্রোফাইল</a>' +
      '</li>';
    });
    listEl.innerHTML = html;
  }

  function paint() {
    renderTabs();
    renderList();
    if (allCountEl) allCountEl.textContent = bn((current.data || []).length);
  }

  function load(type, id) {
    var seq = ++current.reqSeq;
    loadingEl.hidden = false;
    emptyEl.hidden = true;
    listEl.innerHTML = '';
    tabsEl.innerHTML = '<button type="button" class="rxm-tab is-active" data-rx-tab="ALL" role="tab" aria-selected="true">সব</button>';
    fetch('/api/reactions/' + type + '/' + id + '/reactors', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) {
        if (seq !== current.reqSeq) return; // পুরনো-রিকোয়েস্ট বাদ
        loadingEl.hidden = true;
        current.data = (j && j.reactors) || [];
        paint();
      })
      .catch(function () {
        if (seq !== current.reqSeq) return;
        loadingEl.hidden = true;
        current.data = [];
        emptyEl.hidden = false;
        emptyEl.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i><p>প্রতিক্রিয়া লোড করা যায়নি — আবার চেষ্টা করুন।</p>';
      });
  }

  function openFor(type, id) {
    if (!cacheEls()) return;
    current.type = type || 'post';
    current.id = id;
    current.tab = 'ALL';
    current.data = current.type === (window.__rxLastType) && current.id === (window.__rxLastId) ? current.data : null;
    // সর্বদা ফ্রেশ-ফেচ (রিঅ্যাকশন লাইভ বদলায়) — তবে আগের-ডেটা দিয়েই তাৎক্ষণিক পেইন্ট
    if (current.data) paint();
    openModal();
    load(current.type, current.id);
    window.__rxLastType = current.type;
    window.__rxLastId = current.id;
  }

  // ── ইভেন্ট-ডেলিগেশন ────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.reaction-summary[data-reactors-for]');
    if (trigger) {
      e.preventDefault();
      openFor(trigger.getAttribute('data-reactors-type') || 'post', trigger.getAttribute('data-reactors-for'));
      return;
    }
    if (!backdrop && !q('#rxModal')) return;
    var tab = e.target.closest('[data-rx-tab]');
    if (tab && tabsEl && tabsEl.contains(tab)) {
      current.tab = tab.getAttribute('data-rx-tab') || 'ALL';
      tabsEl.querySelectorAll('.rxm-tab').forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderList();
      return;
    }
    if (e.target.closest('#rxClose')) { closeModal(); return; }
    if (backdrop && backdrop.classList.contains('is-open') && e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (backdrop && backdrop.classList.contains('is-open')) closeModal();
  });

  // পেজ-নেভিগেশনে body-overflow রিসেট-গার্ড (bfcache ফলব্যাক)
  window.addEventListener('pagehide', function () { document.body.style.overflow = ''; });
})();
