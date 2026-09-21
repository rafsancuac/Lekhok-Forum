/**
 * nav-editor-autosave.js — সেশন ১৯৩ (মেনু-হাইড পার্মানেন্ট-ফিক্স, ফিক্স-D)
 * ─────────────────────────────────────────────────────────────────────────────
 * সমস্যা: মেনু-এডিটরে চোখ (👁) আইকনে ক্লিক = শুধু ক্লায়েন্ট-স্টেট — ব্যবহারকারী
 * ভাবে সাথে সাথেই সেভ হয়ে গেছে, অথচ আসলে "সংরক্ষণ করুন" বোতাম না-চাপলে
 * nav_json DB-তে যায়ই না → হোমপেজে আইটেম দেখাতেই থাকে।
 *
 * সমাধান: এই স্ক্রিপ্ট nv-toggle / nc-toggle ক্লিককে মুড়ে (wrap) ফেলে —
 * পেজের নিজস্ব হ্যান্ডলার DOM-স্টেট আপডেট করার পর বর্তমান nav_json নিয়ে
 * সিরিয়াল-কিউ-তে fetch-POST (/moderator/navigation বা যে-মাউন্টে পেজ আছে)
 * পাঠায়। CSRF = double-submit (Session 57): meta[name=csrf-token] →
 * fallback cookie `_csrfTok`; হেডার x-csrf-token + বডি _csrf দুই-ভাবেই যায়।
 *
 * টোস্ট: সবুজ = "সংরক্ষিত", লাল = ব্যর্থ → ম্যানুয়াল "সংরক্ষণ করুন"-বোতামে
 * গ্রেসফুল-ফলব্যাক (পুরনো ফর্ম-সাবমিট পথ অক্ষত)।
 *
 * মাউন্ট (দুই ভিউতেই, </body>-র আগে):
 *   <script src="/assets/js/nav-editor-autosave.js?v=1" defer></script>
 * নোট: defer + IIFE — পেজের নিজস্ব এডিটর-JS-এর *পরে* বাইন্ড হয়, তাই
 * bubble-phase-এ আমরা সর্বশেষ চলি (তখন JSON-ফিল্ড সর্বশেষ স্টেটে)।
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.fetch) return;
  if (window.__navEditorAutosave193) return; // ডাবল-মাউন্ট গার্ড
  window.__navEditorAutosave193 = true;

  // শুধু মেনু-এডিটর পেজেই সক্রিয় হওয়ার কথা; তবু সস্তা প্রোব: JSON-ফিল্ড না
  // থাকলে স্ক্রিপ্ট নিঃশব্দে নিষ্ক্রিয় (অন্য পেজে শূন্য-ওভারহেড)।
  function findJsonField() {
    return (
      document.querySelector('textarea[name="nav_json"]') ||
      document.querySelector('input[name="nav_json"]') ||
      document.getElementById('navJson') ||
      document.getElementById('navJsonInput') ||
      null
    );
  }

  function readCsrfToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    if (meta && meta.getAttribute('content')) return meta.getAttribute('content');
    // Session 57 double-submit fallback: `_csrfTok` কুকি
    var m = document.cookie.match(/(?:^|;\s*)_csrfTok=([^;]+)/);
    if (m) {
      try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; }
    }
    return null;
  }

  // ── টোস্ট (aria-live; সবুজ = সফল, লাল = ব্যর্থ) ────────────────────────────
  var toastHost = null;
  function toast(msg, ok) {
    try {
      if (!toastHost || !toastHost.isConnected) {
        toastHost = document.createElement('div');
        toastHost.setAttribute('aria-live', 'polite');
        toastHost.setAttribute('style',
          'position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;' +
          'flex-direction:column;gap:8px;pointer-events:none;');
        document.body.appendChild(toastHost);
      }
      var t = document.createElement('div');
      t.setAttribute('role', 'status');
      t.textContent = msg;
      t.setAttribute('style',
        'font-family:inherit;font-size:13px;line-height:1.4;padding:10px 14px;' +
        'border-radius:10px;color:#fff;max-width:320px;box-shadow:0 6px 18px rgba(0,0,0,.25);' +
        'background:' + (ok ? '#006A4E' : '#b91c1c') + ';opacity:0;transform:translateY(6px);' +
        'transition:opacity .18s ease,transform .18s ease;');
      toastHost.appendChild(t);
      requestAnimationFrame(function () {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
      });
      setTimeout(function () {
        t.style.opacity = '0';
        t.style.transform = 'translateY(6px)';
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
      }, ok ? 3200 : 4200);
    } catch (_) { /* টোস্ট-ব্যর্থতা কখনো সেভ-পথ ভাঙবে না */ }
  }

  // ── সিরিয়াল-কিউ: টগল দ্রুত-দ্রুত ক্লিক করলেও রাইটগুলো কখনো বিঁধবে না ─────────
  var queue = Promise.resolve();
  var pending = 0;

  function enqueueSave(reason) {
    pending += 1;
    queue = queue
      .then(function () { return saveNow(reason); })
      .catch(function () { /* saveNow নিজেই টোস্ট দেয় */ })
      .then(function () { pending = Math.max(0, pending - 1); });
  }

  // ফিক্স-D সংশোধন (প্রয়োগ-পর্যায়ে পাওয়া): nav-editor.js শুধুমাত্র ফর্ম-সাবমিটে
  // (beforeSubmit) JSON-ফিল্ডে ডেটা লেখে — টগলের পরে ফিল্ড খালি থাকে। তাই
  // সেভের আগে আমরা নিজেরাই NavEditor-স্টেট → লুকানো-ফিল্ডে সিঙ্ক করি
  // (beforeSubmit-এর হুবহু লজিক; reset-পেন্ডিং হলে ফর্ম-পথেই ছাড়ি)।
  function syncFromEditor() {
    try {
      var ed = window.NavEditor;
      if (!ed || typeof ed.syncFromDOM !== 'function' || ed.reset) return;
      ed.syncFromDOM();
      if (Array.isArray(ed.data)) {
        var f = findJsonField();
        if (f) f.value = JSON.stringify(ed.data);
      }
    } catch (_) { /* সিঙ্ক-ব্যর্থতায় খালি-ফিল্ড পথ (নীরব) */ }
  }

  function saveNow(reason) {
    var field = findJsonField();
    if (!field) return Promise.resolve(); // এডিটর-বিহীন পেজ
    if (!(field.value || '').trim()) syncFromEditor(); // টগল-পরবর্তী ফিল্ড-খালি → এডিটর-স্টেট থেকে বানাও
    var raw = (field.value || '').trim();
    var payload;
    if (!raw) {
      // ফর্ম-স্টেট থেকে JSON না-বানানো পেজ → ম্যানুয়াল-সেভ-ই পথ (নীরব)
      return Promise.resolve();
    }
    try {
      payload = JSON.stringify(JSON.parse(raw)); // নরমালাইজ + ভ্যালিডেশন-প্রোব
    } catch (_) {
      toast('✗ মেনু-JSON এখনো সম্পূর্ণ হয়নি — অনুগ্রহ করে "সংরক্ষণ করুন" বোতাম ব্যবহার করুন', false);
      return Promise.resolve();
    }
    var tok = readCsrfToken();
    if (!tok) {
      toast('✗ সংরক্ষণ ব্যর্থ (CSRF) — পেজ রিলোড করে আবার চেষ্টা করুন', false);
      return Promise.resolve();
    }
    var body = 'nav_json=' + encodeURIComponent(payload) + '&_csrf=' + encodeURIComponent(tok);
    return fetch(location.pathname, {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'x-csrf-token': tok
      },
      body: body
    }).then(function (res) {
      if (res && res.ok) {
        toast('✓ মেনু-পরিবর্তন সংরক্ষিত হয়েছে — সাইটে সাথে সাথে প্রযোজ্য', true);
      } else {
        toast('✗ সংরক্ষণ ব্যর্থ (' + (res ? res.status : 'নেটওয়ার্ক') + ') — অনুগ্রহ করে "সংরক্ষণ করুন" বোতাম ব্যবহার করুন', false);
      }
    }).catch(function () {
      toast('✗ সংরক্ষণ ব্যর্থ — অনুগ্রহ করে "সংরক্ষণ করুন" বোতাম ব্যবহার করুন', false);
    });
  }

  // ── ক্লিক-মোড়ক: পেজের নিজস্ব হ্যান্ডলারের পরে (bubble + setTimeout 0) চলি ──
  var TOGGLE_SEL = '.nv-toggle, .nc-toggle, [data-nv-toggle], [data-nc-toggle]';
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(TOGGLE_SEL) : null;
    if (!el) return;
    if (!findJsonField()) return;          // এডিটর-বিহীন পেজ → শূন্য-কাজ
    // পেজ-JS-কে স্টেট/JSON আপডেট করতে দাও, তারপর সেভ-কিউতে ঢোকো
    setTimeout(function () { enqueueSave('toggle'); }, 0);
  }, false);

  // লোড-প্রোব (নীরব): এডিটর-পেজ শনাক্ত হলে কনসোলে মার্ক — ডিবাগ-সহায়ক
  if (findJsonField()) {
    try { console.info('[nav-autosave] সক্রিয় — চোখ-টগলে অটো-সেভ চালু'); } catch (_) {}
  }
})();
