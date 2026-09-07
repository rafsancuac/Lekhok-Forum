/* সেশন ৩৮ — অ্যাডমিন/মডারেটর প্যানেল: ছবির URL-ইনপুটের পাশে ফাইল-আপলোড বাটন।
   sidebar.ejs থেকে কেন্দ্রীয়ভাবে লোড হয় — কোনো ফর্ম আলাদা করে ছুঁতে হয় না। */
(function () {
  'use strict';
  var NAME_RE = /(image|img|photo|cover|avatar|picture|poster|thumbnail)|(_url|_img)$/i;
  function init() {
    var inputs = document.querySelectorAll('.admin-main input[type="text"], .admin-main input[type="url"], .admin-main input:not([type])');
    Array.prototype.forEach.call(inputs, function (inp) {
      var name = inp.getAttribute('name') || '';
      if (!NAME_RE.test(name)) return;
      if (inp.dataset.urlUpload) return;
      inp.dataset.urlUpload = '1';
      var wrap = document.createElement('span');
      wrap.className = 'urlup-wrap';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'urlup-btn';
      btn.title = 'কম্পিউটার থেকে ছবি আপলোড করুন';
      btn.innerHTML = '<i class="fas fa-upload"></i>';
      var file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      file.hidden = true;
      btn.addEventListener('click', function () { file.click(); });
      file.addEventListener('change', function () {
        if (!file.files || !file.files[0]) return;
        var fd = new FormData();
        fd.append('image', file.files[0]);
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        var csrfMeta42 = document.querySelector('meta[name="csrf-token"]');
        fetch('/admin/upload-image', { method: 'POST', body: fd, headers: { 'Accept': 'application/json', 'X-CSRF-Token': csrfMeta42 ? csrfMeta42.content : '' } })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.ok) {
              inp.value = d.url;
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.style.borderColor = '#059669';
              setTimeout(function () { inp.style.borderColor = ''; }, 1500);
            } else {
              alert((d && d.error) || 'আপলোড ব্যর্থ');
            }
          })
          .catch(function () { alert('আপলোড ব্যর্থ — নেটওয়ার্ক সমস্যা'); })
          .finally(function () {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-upload"></i>';
            file.value = '';
          });
      });
      inp.parentNode.insertBefore(wrap, inp.nextSibling);
      wrap.appendChild(btn);
      wrap.appendChild(file);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
