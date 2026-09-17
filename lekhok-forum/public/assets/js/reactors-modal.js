/* ═══ সেশন ১০৫: FB-স্টাইল রিঅ্যাক্টরস-মডাল ("কে কোন প্রতিক্রিয়া দিয়েছে") ═══
   ইউজার-স্পেসিফিকেশন (FB-হুবহু):
   · পোস্টের মেট্রিক-রোতে বামের ওভারল্যাপিং ইমোজি/কাউন্টে ক্লিক → এই মডাল খোলে
   · উপরে [সব] [👍] [❤️] [😂]… ফিল্টার-ট্যাব (শুধু কাউন্ট>০ গুলো)
   · তালিকা: অ্যাভাটার (কোণে রিঅ্যাকশন-ব্যাজ) + নাম (+পেন-নাম চিপ)
   · নাম/প্রোফাইল-বাটনে ক্লিকে সরাসরি /profile/:username
   ডেটা: GET /api/reactions/:type/:id/reactors (পাবলিক — সেশন ১০৫)
   সংঘর্ষ-নোট: main.js-এর lf:reactupdate-শৃঙ্খল ও hold+slide প্যালেট অক্ষত —
   এই ফাইল শুধু .reaction-summary[data-reactors-for]-ক্লিক শোনে (delegation)।
   ═══ সেশন ১১০: Facepile-অ্যাভাটার-মোড (ইউজার-স্পেসিফিকেশন) ═══
   · ভিউ-মোড সুইচার: 👥 ফেসপাইল গ্রিড / 📋 বিস্তারিত তালিকা (localStorage
     'rxm110view'-এ মনে থাকে; ডিফল্ট ফেসপাইল)
   · ফেসপাইল: প্রতি-সেল = অ্যাভাটার + কোণে মিনি রিঅ্যাকশন-ব্যাজ + প্রথম-নাম;
     হোভারে কালো ফ্লোটিং-কার্ডে পূর্ণ-নাম + ছদ্মনাম (CSS :hover — JS-নিরপেক্ষ)
   · ট্যাব-ফিল্টার উভয় মোডেই কাজ করে; Escape/backdrop-বন্ধ অক্ষত */
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
  var VIEW_KEY = 'rxm110view';

  var backdrop, tabsEl, listEl, emptyEl, loadingEl, allCountEl, faceEl, modeSeg;
  var current = { type: 'post', id: null, data: null, tab: 'ALL', reqSeq: 0, mode: 'facepile' };

  function q(sel) { return document.querySelector(sel); }

  function storedMode() {
    try { var v = localStorage.getItem(VIEW_KEY); return v === 'list' ? 'list' : 'facepile'; } catch (e) { return 'facepile'; }
  }
  function saveMode(m) { try { localStorage.setItem(VIEW_KEY, m); } catch (e) { /* প্রাইভেট-মোড নিরীহ */ } }

  function cacheEls() {
    backdrop = q('#rxModal');
    if (!backdrop) return false;
    tabsEl = q('#rxTabs');
    listEl = q('#rxList');
    emptyEl = q('#rxEmpty');
    loadingEl = q('#rxLoading');
    allCountEl = q('#rxTabAllCount');
    faceEl = q('#rxFacepile');
    modeSeg = q('#rxModeSeg');
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

  function firstName(u) {
    var d = displayName(u);
    return d.split(' ')[0] || d;
  }

  function reactionOf(u) { return META[u.reaction || 'like'] || META.like; }

  function rowsFor(tab) {
    var data = current.data || [];
    return tab === 'ALL' ? data : data.filter(function (u) { return (u.reaction || 'like') === tab; });
  }

  function renderTabs() {
    var data = current.data || [];
    var counts = {};
    data.forEach(function (u) {
      var k = u.reaction || 'like';
      counts[k] = (counts[k] || 0) + 1;
    });
    var html = '<button type="button" class="rxm-tab is-active" data-rx_tab="ALL" role="tab" aria-selected="true">সব <span class="rxm-tabcount">' + bn(data.length) + '</span></button>';
    Object.keys(META).forEach(function (k) {
      if (!counts[k]) return;
      html += '<button type="button" class="rxm-tab" data-rx_tab="' + k + '" role="tab" aria-selected="false" title="' + META[k].label + '">' +
        '<span class="rxm-tabemoji">' + META[k].emoji + '</span> <span class="rxm-tabcount">' + bn(counts[k]) + '</span></button>';
    });
    tabsEl.innerHTML = html;
  }

  /* ── সেশন ১১০: ফেসপাইল-গ্রিড ── */
  function renderFacepile() {
    var rows = rowsFor(current.tab);
    if (!rows.length) {
      faceEl.hidden = true;
      faceEl.innerHTML = '';
      return;
    }
    var html = '';
    rows.forEach(function (u) {
      var uname = u.username || ('user-' + u.id);
      var href = '/profile/' + encodeURIComponent(uname);
      var em = reactionOf(u).emoji;
      var lbl = reactionOf(u).label;
      var sub = (u.pen_name && u.name) ? u.pen_name : '';
      html += '<a class="rxm-fcell" href="' + esc(href) + '" tabindex="0">' +
        '<span class="rxm-favwrap">' +
          '<img class="rxm-fav" loading="lazy" decoding="async" src="' + esc(avatarSrc(u)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
          '<span class="rxm-fbadge" title="' + esc(lbl) + '">' + em + '</span>' +
        '</span>' +
        '<span class="rxm-fname">' + esc(firstName(u)) + '</span>' +
        '<span class="rxm-ftip" role="tooltip"><strong>' + esc(displayName(u)) + '</strong>' +
          (sub ? '<em>' + esc(sub) + '</em>' : '') +
        '</span>' +
      '</a>';
    });
    faceEl.innerHTML = html;
    faceEl.hidden = false;
  }

  function renderList() {
    var rows = rowsFor(current.tab);
    if (!rows.length) {
      listEl.innerHTML = '';
      return;
    }
    var html = '';
    rows.forEach(function (u) {
      var uname = u.username || ('user-' + u.id);
      var href = '/profile/' + encodeURIComponent(uname);
      var em = reactionOf(u).emoji;
      var lbl = reactionOf(u).label;
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

  function paintMode() {
    var isFace = current.mode === 'facepile';
    if (modeSeg) {
      modeSeg.querySelectorAll('.rxm-modebtn').forEach(function (b) {
        var on = (b.getAttribute('data-rx_mode') || '') === current.mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (faceEl) { faceEl.hidden = !isFace; }
    listEl.hidden = isFace;
    if (isFace) { renderFacepile(); listEl.innerHTML = ''; }
    else { faceEl.innerHTML = ''; renderList(); }
  }

  function paint() {
    var data = current.data || [];
    renderTabs();
    if (!data.length) {
      if (faceEl) { faceEl.hidden = true; faceEl.innerHTML = ''; }
      listEl.innerHTML = '';
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      paintMode();
    }
    if (allCountEl) allCountEl.textContent = bn(data.length);
  }

  function setMode(m, persist) {
    current.mode = (m === 'list') ? 'list' : 'facepile';
    if (persist) saveMode(current.mode);
    if (current.data && (current.data || []).length) paintMode();
  }

  function load(type, id) {
    var seq = ++current.reqSeq;
    loadingEl.hidden = false;
    emptyEl.hidden = true;
    listEl.innerHTML = '';
    if (faceEl) { faceEl.hidden = true; faceEl.innerHTML = ''; }
    tabsEl.innerHTML = '<button type="button" class="rxm-tab is-active" data-rx_tab="ALL" role="tab" aria-selected="true">সব</button>';
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
    current.mode = storedMode(); // সেশন ১১০: মোড প্রতি-ওপেনে মনে-রাখা-পছন্দ থেকে
    paintMode();
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
    // সেশন ১১২-মার্জ: নতুন ক্যানোনিকাল কনট্র্যাক্ট (session108-খ PostFooterActions —
    // data-rx-open/data-rx-id)। তাদের lf-rxm মডাল (#reactorsModal) যে-পেজে আছে
    // (dashboard/profile/me) সেখানে তারাই হ্যান্ডল করে (comment-tools.js) — আমরা
    // স্থগিত; বাকি পেজে (article/qa…) আমাদের গ্লোবাল মডাল-ই ফেসপাইল দেখায়।
    var trig2 = e.target.closest('[data-rx-open][data-rx-id]');
    if (trig2 && !document.getElementById('reactorsModal')) {
      e.preventDefault();
      openFor(trig2.getAttribute('data-rx-open') || 'post', trig2.getAttribute('data-rx-id'));
      return;
    }
    if (!backdrop && !q('#rxModal')) return;
    var modeBtn = e.target.closest('[data-rx_mode]');
    if (modeBtn && modeSeg && modeSeg.contains(modeBtn)) {
      setMode(modeBtn.getAttribute('data-rx_mode'), true);
      return;
    }
    var tab = e.target.closest('[data-rx_tab]');
    if (tab && tabsEl && tabsEl.contains(tab)) {
      current.tab = tab.getAttribute('data-rx_tab') || 'ALL';
      tabsEl.querySelectorAll('.rxm-tab').forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if ((current.data || []).length) paintMode();
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
