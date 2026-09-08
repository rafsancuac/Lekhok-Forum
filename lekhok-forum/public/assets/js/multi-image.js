/* ─────────────────────────────────────────────────────────────────────────────
 * লেকহক ফোরাম — মাল্টি-ইমেজ আপলোড উইজেট (টাস্ক ১৩, পর্ব ৪, অংশ ক)
 *
 * একটি কন্টেইনারে একাধিক ছবি: multi-select + drag&drop + preview + reorder
 * + ব্যক্তিগত রিমুভ। নির্বাচিত/আপলোড করা ছবির URL-গুলো ক্রম অনুযায়ী একটি
 * hidden input-এ JSON অ্যারে হিসেবে বসে (ফর্ম সাবমিটে সার্ভারে যায়)।
 *
 * ব্যবহার:
 *   <div class="mi-widget" data-field="images" data-value='["url1","url2"]'></div>
 *   <input type="hidden" name="images" id="images-input" value='["url1","url2"]'>
 *   <script>LekhokMultiImage.init(document.querySelectorAll('.mi-widget'));</script>
 * ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }

  function uploadFiles(files, cb, url) {
    var fd = new FormData();
    for (var i = 0; i < files.length; i++) fd.append('images', files[i]);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url || '/admin/upload-images', true);
    xhr.setRequestHeader('x-csrf-token', csrf());
    xhr.onload = function () {
      var r = {};
      try { r = JSON.parse(xhr.responseText); } catch (e) { r = { ok: false, error: 'সার্ভার রেসপন্স ভুল' }; }
      cb(r.ok ? (r.urls || []) : null, r.error || 'আপলোড ব্যর্থ');
    };
    xhr.onerror = function () { cb(null, 'নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); };
    xhr.send(fd);
  }

  function build(widget) {
    var field = widget.getAttribute('data-field') || 'images';
    var uploadUrl = widget.getAttribute('data-upload-url') || '/admin/upload-images';
    var input = widget.querySelector('input[name="' + field + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = field;
      widget.appendChild(input);
    }
    var urls = [];
    try { urls = JSON.parse(input.value || '[]'); } catch (e) { urls = []; }
    if (!Array.isArray(urls)) urls = [];

    widget.innerHTML = '';
    widget.appendChild(input); // hidden input stays in the DOM (value submitted on save)
    widget.classList.add('mi-ready');

    var drop = document.createElement('div');
    drop.className = 'mi-drop';
    drop.innerHTML = '<i class="fas fa-images"></i><span>ছবি টেনে এনে ছাড়ুন অথবা</span>' +
      '<button type="button" class="mi-add">ছবি বাছাই করুন</button>' +
      '<small>JPG/PNG/WebP/GIF — একসাথে একাধিক</small>';
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    widget.appendChild(drop);
    widget.appendChild(fileInput);

    var grid = document.createElement('div');
    grid.className = 'mi-grid';
    widget.appendChild(grid);

    var status = document.createElement('div');
    status.className = 'mi-status';
    widget.appendChild(status);

    function sync() {
      input.value = JSON.stringify(urls);
    }
    function render() {
      grid.innerHTML = '';
      urls.forEach(function (url, idx) {
        var item = document.createElement('div');
        item.className = 'mi-item';
        item.draggable = true;
        item.dataset.idx = idx;
        var img = document.createElement('img');
        img.src = url;
        img.alt = 'ছবি ' + (idx + 1);
        img.loading = 'lazy';
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'mi-rm';
        rm.innerHTML = '<i class="fas fa-times"></i>';
        rm.title = 'রিমুভ';
        rm.addEventListener('click', function () {
          urls.splice(idx, 1);
          render(); sync();
        });
        var order = document.createElement('span');
        order.className = 'mi-order';
        order.textContent = idx + 1;
        item.appendChild(img);
        item.appendChild(order);
        item.appendChild(rm);
        grid.appendChild(item);
      });
      sync();
    }

    // Drag-to-reorder
    var dragIdx = null;
    grid.addEventListener('dragstart', function (e) {
      var it = e.target.closest('.mi-item');
      if (!it) return;
      dragIdx = parseInt(it.dataset.idx, 10);
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    grid.addEventListener('dragover', function (e) { e.preventDefault(); });
    grid.addEventListener('drop', function (e) {
      e.preventDefault();
      var it = e.target.closest('.mi-item');
      if (!it || dragIdx === null) return;
      var to = parseInt(it.dataset.idx, 10);
      if (dragIdx === to) return;
      var moved = urls.splice(dragIdx, 1)[0];
      urls.splice(to, 0, moved);
      dragIdx = null;
      render();
    });
    grid.addEventListener('dragend', function () {
      var d = grid.querySelector('.dragging');
      if (d) d.classList.remove('dragging');
      dragIdx = null;
    });

    function handleFiles(files) {
      var imgs = Array.prototype.filter.call(files, function (f) { return f.type.indexOf('image/') === 0; });
      if (!imgs.length) { status.className = 'mi-status err'; status.textContent = 'শুধু ছবি ফাইল দিন'; return; }
      status.className = 'mi-status busy'; status.textContent = 'আপলোড হচ্ছে… (' + imgs.length + 'টি)';
      uploadFiles(imgs, function (newUrls, err) {
        if (!newUrls) { status.className = 'mi-status err'; status.textContent = err || 'আপলোড ব্যর্থ'; return; }
        urls = urls.concat(newUrls);
        status.className = 'mi-status ok'; status.textContent = newUrls.length + 'টি ছবি যোগ হয়েছে ✓';
        render();
        setTimeout(function () { status.className = 'mi-status'; status.textContent = ''; }, 2500);
      }, uploadUrl);
    }

    drop.addEventListener('click', function (e) {
      if (e.target.closest('.mi-add')) { fileInput.click(); return; }
      fileInput.click();
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files.length) handleFiles(fileInput.files);
      fileInput.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('mi-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('mi-over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });

    render();
  }

  window.LekhokMultiImage = {
    init: function (els) {
      (els || document.querySelectorAll('.mi-widget')).forEach
        ? Array.prototype.forEach.call((els || document.querySelectorAll('.mi-widget')), build)
        : build(els || document.querySelector('.mi-widget'));
    }
  };
})();
