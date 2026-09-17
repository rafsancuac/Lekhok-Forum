/* সেশন ১১২: 'পড়া চালিয়ে যান' — ড্যাশবোর্ড সাইডবার-উইজেট
 * ─────────────────────────────────────────────────────────
 *  • article-reading.js প্রতিটি লেখার স্ক্রল-অগ্রগতি localStorage 'lf_read_pos'-এ
 *    রাখে (r=অনুপাত, t=টাইমস্ট্যাম্প, সেশন-১১২ থেকে ti=টাইটেল, u=পাথ)।
 *  • এই স্ক্রিপ্ট সেই ম্যাপ থেকে সর্বশেষ ৩টি অসমাপ্ত লেখার তালিকা বানায় —
 *    শূন্য-API, শূন্য-সার্ভার-লোড, শুধু এই ব্রাউজারের নিজস্ব ডেটা।
 *  • খালি তালিকা → কার্ড আঁকাই হয় না (ইউজারের কমপ্যাক্ট-এসথেটিক: ফাঁকা-বড়-কার্ড নয়)।
 *  • প্রতি-সারি ×-বাটনে তালিকা-থেকে-সরানো যায়; লিঙ্কে গেলে article-পেজের
 *    'যেখান থেকে ছেড়েছিলাম' ব্যানার অবস্থান-ফিরিয়ে দেয় (session ৬৩)।
 */
(function () {
  'use strict';

  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var mount = document.getElementById('crxMount');
  if (!mount) return;

  var KEY = 'lf_read_pos';
  function readMap() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeMap(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* প্রাইভেট-মোড */ }
  }

  function entries() {
    var m = readMap(), arr = [];
    Object.keys(m).forEach(function (id) {
      var it = m[id];
      /* ti/u-বিহীন পুরনো-এন্ট্রি (সেশন-১১২-এর আগের) বাদ — টাইটেল ছাড়া সারি আঁকা যায় না */
      if (it && it.ti && it.u && it.r > 0.05 && it.r < 0.95) {
        arr.push({ id: id, r: +it.r || 0, t: +it.t || 0, ti: String(it.ti), u: String(it.u) });
      }
    });
    arr.sort(function (a, b) { return b.t - a.t; });
    return arr.slice(0, 3);
  }

  function render() {
    var list = entries();
    if (!list.length) { mount.innerHTML = ''; mount.hidden = true; return; }
    var h = '<div class="side-card card crx-card" aria-label="পড়া চালিয়ে যান">'
      + '<h4><i class="fas fa-book-reader" style="color:var(--accent)"></i> পড়া চালিয়ে যান</h4>'
      + '<div class="crx-list">';
    list.forEach(function (it) {
      var p = Math.max(1, Math.min(99, Math.round(it.r * 100)));
      h += '<div class="crx-row">'
        + '<a class="crx-link" href="' + esc(it.u) + '" title="' + esc(it.ti) + '">'
        + '<span class="crx-title">' + esc(it.ti) + '</span>'
        + '<span class="crx-bar"><span class="crx-bar-fill" style="width:' + p + '%"></span></span>'
        + '<span class="crx-meta"><i class="far fa-clock" aria-hidden="true"></i> ' + bn(p) + '% পড়া হয়েছে</span>'
        + '</a>'
        + '<button type="button" class="crx-x" data-crx-id="' + esc(it.id) + '"'
        + ' aria-label="তালিকা থেকে সরান" title="তালিকা থেকে সরান">&times;</button>'
        + '</div>';
    });
    h += '</div></div>';
    mount.innerHTML = h;
    mount.hidden = false;
  }

  /* ×-ক্লিকে তালিকা-থেকে-সরান (ডেলিগেট — রি-রেন্ডার-সেফ) */
  document.addEventListener('click', function (e) {
    var x = e.target.closest && e.target.closest('.crx-x');
    if (!x) return;
    e.preventDefault();
    var m = readMap();
    delete m[x.getAttribute('data-crx-id')];
    writeMap(m);
    render();
  });

  render();
})();
