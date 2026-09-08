/* ─────────────────────────────────────────────────────────────────────────────
 * লেখক ফোরাম — সেকশন-ভিত্তিক ফর্ম (টাস্ক ১৩, পর্ব ৪, অংশ খ)
 *
 * যেকোনো এডিট-ফর্মকে লজিক্যাল সেকশনে ভাগ করে প্রতি-সেকশন আলাদা AJAX সেভ।
 * একটি ফর্মের সেকশন = `.sf-section[data-save-url]`। লকড অবস্থায় ফিল্ড readonly;
 * "সম্পাদনা" চাপলে শুধু সেই সেকশন আনলক হয়, সেভ করলে শুধু সেই সেকশনের এন্ডপয়েন্টে
 * ডেটা যায় (পুরো পেজ রিলোড হয় না)।
 *
 * মার্কআপ:
 *   <div class="sf-section" data-save-url="/admin/notices/5/section">
 *     <div class="sf-head">
 *       <h3>মূল তথ্য <span class="sf-count">৩</span></h3>
 *       <div class="sf-actions">
 *         <span class="sf-status"></span>
 *         <button type="button" class="btn btn-sm sf-edit">সম্পাদনা</button>
 *         <button type="button" class="btn btn-sm btn-primary sf-save" hidden>সেভ</button>
 *         <button type="button" class="btn btn-sm sf-cancel" hidden>বাতিল</button>
 *       </div>
 *     </div>
 *     ...ফিল্ডসমূহ (readonly/disabled)...
 *   </div>
 * ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var EDITABLE = 'input[type=text], input[type=url], input[type=date], input[type=number], textarea, select';

  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }

  function init(scope) {
    scope = scope || document;
    var sections = scope.querySelectorAll ? scope.querySelectorAll('.sf-section[data-save-url]') : [];
    Array.prototype.forEach.call(sections, function (sec) {
      if (sec.dataset.sfInit) return;
      sec.dataset.sfInit = '1';

      var editBtn = sec.querySelector('.sf-edit');
      var saveBtn = sec.querySelector('.sf-save');
      var cancelBtn = sec.querySelector('.sf-cancel');
      var status = sec.querySelector('.sf-status');
      var url = sec.getAttribute('data-save-url');
      var snapshot = null;

      function setStatus(html, cls) {
        if (!status) return;
        status.className = 'sf-status' + (cls ? ' ' + cls : '');
        status.innerHTML = html || '';
      }

      function enter() {
        snapshot = [];
        sec.querySelectorAll(EDITABLE).forEach(function (el) { snapshot.push({ el: el, val: el.value }); });
        sec.querySelectorAll('.mi-widget').forEach(function (w) {
          var inp = w.querySelector('input[name="images"]');
          snapshot.push({ w: w, json: inp ? inp.value : '[]' });
        });
        sec.classList.add('sf-editing');
        sec.querySelectorAll(EDITABLE).forEach(function (el) { el.removeAttribute('readonly'); el.disabled = false; });
        sec.querySelectorAll('input[type=checkbox]').forEach(function (el) { el.disabled = false; });
        if (editBtn) editBtn.hidden = true;
        if (saveBtn) saveBtn.hidden = false;
        if (cancelBtn) cancelBtn.hidden = false;
        setStatus('', '');
        var f = sec.querySelector('input[type=text], textarea, select');
        if (f) { try { f.focus(); } catch (e) {} }
      }

      function exit() {
        sec.classList.remove('sf-editing');
        sec.querySelectorAll(EDITABLE).forEach(function (el) { el.setAttribute('readonly', ''); if (el.tagName === 'SELECT') el.disabled = true; });
        sec.querySelectorAll('input[type=checkbox]').forEach(function (el) { el.disabled = true; });
        if (editBtn) editBtn.hidden = false;
        if (saveBtn) saveBtn.hidden = true;
        if (cancelBtn) cancelBtn.hidden = true;
      }

      function cancel() {
        (snapshot || []).forEach(function (s) {
          if (s.el) s.el.value = s.val;
          if (s.w) {
            var inp = s.w.querySelector('input[name="images"]');
            if (inp) inp.value = s.json;
            if (window.LekhokMultiImage) window.LekhokMultiImage.init(s.w);
          }
        });
        exit();
        setStatus('', '');
      }

      function save() {
        var payload = {};
        sec.querySelectorAll(EDITABLE).forEach(function (el) { if (el.name) payload[el.name] = el.value; });
        sec.querySelectorAll('input[type=checkbox]').forEach(function (el) { if (el.name) payload[el.name] = el.checked ? '1' : ''; });
        sec.querySelectorAll('.mi-widget input[name="images"]').forEach(function (el) {
          var arr = [];
          try { arr = JSON.parse(el.value || '[]'); } catch (e) { arr = []; }
          if (!Array.isArray(arr)) arr = [];
          payload.images = arr;
        });
        if (!saveBtn) return;
        saveBtn.disabled = true;
        var old = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> সেভ হচ্ছে...';
        setStatus('', '');
        fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-Token': csrf() } })
          .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'অপ্রত্যাশিত রেসপন্স' }; }); })
          .then(function (d) {
            if (!d || !d.ok) throw new Error((d && d.error) || 'সংরক্ষণ ব্যর্থ');
            exit();
            setStatus('<i class="fas fa-check-circle"></i> সংরক্ষিত হয়েছে', 'ok');
            setTimeout(function () { setStatus('', ''); }, 3200);
          })
          .catch(function (e) {
            setStatus('<i class="fas fa-exclamation-triangle"></i> ' + (e.message || 'সংরক্ষণ ব্যর্থ'), 'err');
          })
          .finally(function () { saveBtn.disabled = false; saveBtn.innerHTML = old; });
      }

      if (editBtn) editBtn.addEventListener('click', enter);
      if (cancelBtn) cancelBtn.addEventListener('click', cancel);
      if (saveBtn) saveBtn.addEventListener('click', save);
    });
  }

  window.LekhokSectionForm = { init: init };
  document.addEventListener('DOMContentLoaded', function () { init(); });
})();
