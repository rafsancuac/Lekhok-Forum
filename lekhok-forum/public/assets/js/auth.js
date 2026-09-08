/* লেখক ফোরাম — সেশন ৫৬: "Confident Split" অথ-পেজ ইন্টারঅ্যাকশন
   (ফ্লোটিং-লেবেল autofill গার্ড | পাসওয়ার্ড টগল | ট্যাব-সুইচ | সাবমিট লোডিং-স্টেট)
   নির্ভরতা-মুক্ত, ES5-নিরাপদ। শুধু body.auth-split পেজে লোড হয়। */
(function () {
  'use strict';
  var doc = document;

  /* ১) ফ্লোটিং-লেবেল autofill গার্ড:
     :placeholder-shown সাধারণত কাজ করে, কিন্তু কিছু ব্রাউজারের autofill-এ
     স্টাইল আপডেট দেরিতে হয়। লোড+ইনপুট+চেঞ্জে .is-filled ব্যাকআপ ক্লাস। */
  function syncFilled() {
    var inputs = doc.querySelectorAll('.ff input');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.value) { inp.classList.add('is-filled'); }
      else { inp.classList.remove('is-filled'); }
    }
  }
  doc.addEventListener('input', syncFilled);
  doc.addEventListener('change', syncFilled);
  setTimeout(syncFilled, 250);
  setTimeout(syncFilled, 1200);
  window.addEventListener('pageshow', syncFilled);

  /* ২) পাসওয়ার্ড শো/হাইড (ডেলিগেটেড) */
  doc.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.pw-toggle') : null;
    if (!btn) return;
    var wrap = btn.closest('.ff');
    var inp = wrap ? wrap.querySelector('input') : null;
    if (!inp) return;
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান');
    var icon = btn.querySelector('i');
    if (icon) {
      icon.className = show ? 'far fa-eye-slash' : 'far fa-eye';
    }
    try { inp.focus({ preventScroll: true }); } catch (err) { inp.focus(); }
  });

  /* ৩) ট্যাব-সুইচ: [data-tab="x"] → #tabpanel-x */
  function activateTab(name) {
    if (!name) return;
    var tabs = doc.querySelectorAll('.as-tab');
    var hit = false;
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === name;
      tabs[i].classList.toggle('is-active', on);
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) hit = true;
    }
    if (!hit) return;
    var panels = doc.querySelectorAll('.as-tabpanel');
    for (var j = 0; j < panels.length; j++) {
      panels[j].classList.toggle('is-active', panels[j].id === 'tabpanel-' + name);
    }
    syncFilled();
  }
  doc.addEventListener('click', function (e) {
    var tab = e.target.closest ? e.target.closest('.as-tab') : null;
    if (!tab) return;
    activateTab(tab.getAttribute('data-tab'));
  });
  if (location.hash === '#find') { activateTab('find'); }
  else if (location.hash === '#login') { activateTab('login'); }

  /* ৪) সার্ভার-রেন্ডার্ড ফর্মে লোডিং-স্টেট (সাবমিট চলতে দেয়, সাইজ ফিক্সড) */
  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.matches || !form.matches('.as-loading-form')) return;
    var btn = form.querySelector('button[type="submit"]');
    if (!btn || btn.disabled) return;
    btn.classList.add('is-busy');
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অপেক্ষা করুন...';
  });
  doc.addEventListener('invalid', function (e) {  /* ব্রাউজার ভ্যালিডেশনে ব্লক হলে রিসেট */
    var form = e.target.closest ? e.target.closest('.as-loading-form') : null;
    if (!form) return;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.classList.remove('is-busy');
      btn.removeAttribute('aria-busy');
      var label = form.getAttribute('data-submit-label');
      btn.innerHTML = label || btn.innerHTML;
    }
  }, true);

  /* ৫) কীবোর্ড-ওপেনে ইনপুট যেন ঢাকা না পড়ে (মোবাইল) */
  doc.addEventListener('focusin', function (e) {
    var inp = e.target;
    if (inp && inp.tagName === 'INPUT' && inp.scrollIntoView && window.innerWidth < 768) {
      setTimeout(function () {
        try { inp.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (err) { }
      }, 240);
    }
  });
})();
