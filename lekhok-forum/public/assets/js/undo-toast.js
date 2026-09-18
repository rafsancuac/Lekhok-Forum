/* সেশন ১২৩: ডিসমিস-আন্ডু টোস্ট — FB-প্যারিটি "বিজ্ঞপ্তি সরানো হয়েছে · বাতিল করুন"
 * ─────────────────────────────────────────────────────────────────────────
 *  ব্যবহার: window.lfUndoShow({ message, onUndo, ms })
 *    • সিঙ্গেলটন — নতুন show আগেরটিকে বাতিল করে (স্ট্যাক-জমে না)।
 *    • onUndo একবারই চলে; undo-পরে টোস্ট সঙ্গে-সঙ্গে dx-out।
 *    • auto-hide ms (ডিফল্ট ৭০০০); প্রগ্রেস-বার অবশিষ্ট-সময় দেখায়।
 *    • a11y: role="status" aria-live="polite" + focus-টোকেন-বাটন + Escape=বাতিল-নয়
 *      (টোস্ট-নিষ্ক্রিয়ণ মানেই undo-নয় — FB-আচরণ)।
 *    • session133: কীবোর্ড-শর্টকাট — Enter=undo (টোস্টের undo-বাটনে সরাসরি),
 *      Escape=টোস্ট-নিষ্ক্রিয়ণ (undo-নয় — উপরের নিয়মই)। ইনপুট/টেক্সটএরিয়া/contenteditable-এ
 *      টাইপ করার সময় শর্টকাট নীরব (typing-guard); aria-keyshortcuts চুক্তি।
 *  মার্কআপ/স্টাইল: .lf-utoast-* (style.css session123-ব্লক) — টোকেন-শুধু (var(--lf-*))।
 *  হোস্ট: header.ejs (প্রতি user-পেজ) — ড্রপডাউন-ডিসমিস ও /notifications ফুল-পেজ দুটোই এটাই ব্যবহার করে।
 */
(function () {
  'use strict';
  if (window.lfUndoShow) return; /* ডাবল-লোড-গার্ড */

  var el = null, bar = null, timer = null, undoFn = null, busy = false;

  function destroy() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null; bar = null; undoFn = null; busy = false;
  }

  function hide(done) {
    if (!el) return;
    var node = el;
    if (timer) { clearTimeout(timer); timer = null; }
    node.classList.remove('lf-utoast-in');
    node.classList.add('lf-utoast-out');
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
      if (el === node) { el = null; bar = null; undoFn = null; busy = false; }
      if (done) done();
    }, 200);
  }

  window.lfUndoShow = function (opts) {
    opts = opts || {};
    if (el) destroy();
    busy = false;
    undoFn = typeof opts.onUndo === 'function' ? opts.onUndo : null;
    var ms = (typeof opts.ms === 'number' && opts.ms > 500) ? opts.ms : 7000;

    el = document.createElement('div');
    el.className = 'lf-utoast lf-utoast-in';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    var msg = document.createElement('span');
    msg.className = 'lf-utoast-msg';
    msg.textContent = String(opts.message || 'বিজ্ঞপ্তি সরানো হয়েছে');
    el.appendChild(msg);
    if (undoFn) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lf-utoast-undo';
      /* session133: কীবোর্ড-শর্টকাট চুক্তি + ভিজ্যুয়াল kbd-হিন্ট (স্টাইল session133-ব্লক) */
      btn.setAttribute('aria-keyshortcuts', 'Enter');
      btn.innerHTML = 'বাতিল করুন <kbd class="lf-utoast-kbd" aria-hidden="true">↵ Enter</kbd>';
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (busy) return;
        busy = true;
        btn.classList.add('is-busy');
        btn.disabled = true;
        var fn = undoFn;
        if (bar) bar.style.display = 'none';
        if (timer) { clearTimeout(timer); timer = null; }
        try { fn(function after() { hide(); }); } catch (err) { hide(); }
      });
      el.appendChild(btn);
    }
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'lf-utoast-x';
    x.setAttribute('aria-label', 'বন্ধ করুন');
    x.setAttribute('aria-keyshortcuts', 'Escape');
    x.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
    x.addEventListener('click', function (e) { e.preventDefault(); hide(); });
    el.appendChild(x);

    bar = document.createElement('span');
    bar.className = 'lf-utoast-bar';
    el.appendChild(bar);

    document.body.appendChild(el);
    /* প্রগ্রেস-বারের transition-duration = টোস্ট-আয়ু (ms) — বার-শেষ = টোস্ট-শেষ */
    if (bar) bar.style.transition = 'transform ' + ms + 'ms linear';
    timer = setTimeout(function () { hide(); }, ms);
    /* প্রগ্রেস-বার অ্যানিমেশন (CSS transition — reduced-motion-এ স্থির) */
    requestAnimationFrame(function () { if (bar) bar.style.transform = 'scaleX(0)'; });
  };

  /* ── session133: গ্লোবাল কীবোর্ড-শর্টকাট (একবার বাউন্ড) ──────────────────────────
   * Enter = undo-বাটন ক্লিক (টোস্ট-খোলা থাকলে); Escape = টোস্ট নিষ্ক্রিয় (undo-নয়)।
   * টাইপিং-গার্ড: ইনপুট/textarea/contenteditable-এ ফোকাস থাকলে পাত্তা দেয় না —
   * মেসেজ-কম্পোজারে Enter-চাপলে টোস্ট-undo ফায়ার করবে না। টোস্টের নিজের বাটনে
   * ফোকাস থাকলে নেটিভ-ক্লিকই যথেষ্ট (busy-গার্ড ডাবল-ফায়ার আটকায়)। */
  document.addEventListener('keydown', function (e) {
    if (!el || busy) return;
    var ae = document.activeElement;
    var inToast = ae && el.contains(ae);
    if (e.key === 'Enter') {
      if (inToast) return; /* নেটিভ বাটন-ক্লিক নিজেই চলে */
      /* টাইপিং-গার্ড + ফোকাস-অগ্রাধিকার: যেকোনো interactive-এলিমেন্টে (লিংক/বাটন/ইনপুট)
         ফোকাস থাকলে নেটিভ-অ্যাক্টিভেশনই জেতে — টোস্ট-শর্টকাট শুধু "ফ্রি" ফোকাসে চলে */
      if (ae && ae !== document.body && ae.closest && ae.closest('a, button, input, select, textarea, [contenteditable="true"], [role="button"], [tabindex]:not([tabindex="-1"])')) return;
      if (!undoFn) return;
      var btn = el.querySelector('.lf-utoast-undo');
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
    } else if (e.key === 'Escape') {
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      e.preventDefault();
      hide();
    }
  }, true);
})();
