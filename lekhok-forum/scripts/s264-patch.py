#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s264-patch.py — session264 (Task ID 104): অ্যাডমিন ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার adf264
admin/views/admin/dashboard.ejs — mdf263-প্যাটার্ন-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (adfFilter264 + adfClear264 + adfCount264 + adf-kbd-hint)
     + শূন্য-অবস্থা (adfZero264 data-adf-empty) + সারফেস data-adf-row/data-kw + __adfQA হুক
  ② **পূর্ণ-সারফেস-কভারেজ (মিশ্র-ট্যাগ ×৩-শ্রেণি):** stat-box ×৯ (scope-টাইল — সব <a>) +
     কার্ড ×২ (সাম্প্রতিক কনটেন্ট / সাম্প্রতিক বার্তা-অভিযোগ — <div>) + কুইক-অ্যাকশন বাটন ×৭
     (৩-টি admin-শর্তসাপেক্ষ — নন-অ্যাডমিনে ইনডেক্স-গ্যাপ অনুমোদিত, JS-ইনডেক্স-নিরপেক্ষ) =
     admin-ভিউয়ারে ১৮-সারফেস স্ট্রাকচারাল-ধ্রুব
  ③ **নেমস্পেস-ম্যাপ:** পেজের .stat-*/.dash-*/.card/.btn CSS পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স
     **adf** (সংঘর্ষ-মুক্ত যাচাইকৃত — grep শূন্য)
  ④ **দ্বি-ভাষা data-kw:** লেবেল+প্রতিশব্দ+লিংক-পাথ+ইংরেজি-অ্যালায়াস — ব্যবহারকারী যে-ভাষাতেই-লিখুক মেলে
  ⑤ [Mandatory-স্টাইল] adf264-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active
     + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ — .stat-box display:flex-ওভাররাইড-গার্ডসহ,
     session256-শিক্ষা)
অক্ষুণ্ণ: welcome-banner/stat-grid/dash-cols/recent-list/badge-soft/dash-unread105/section-head/
quick-actions লিংক-href/sidebar — সব no-regression-অ্যাসার্টে প্রমাণিত।
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'admin', 'views', 'admin', 'dashboard.ejs')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'adfFilter264' in src:
    print('SKIP: adf264 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

def rep(anchor, replacement, label):
    global src
    if anchor not in src:
        sys.exit('FATAL: অ্যাঙ্কর পাওয়া যায়নি — ' + label)
    src = src.replace(anchor, replacement, 1)
    APPLIED.append(label)

def rep_re(pattern, replacement, label):
    global src
    new, n = re.subn(pattern, replacement, src, count=1)
    if n != 1:
        sys.exit('FATAL: রেজেক্স-অ্যাঙ্কর মেলেনি — ' + label)
    src = new
    APPLIED.append(label)

# ── ① ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (welcome-banner-এর ঠিক-পরে, stat-grid-এর-আগে) ──
A1 = """      <span class="wb-emoji">✒️</span>
    </div>

    <div class="stat-grid">
"""
B1 = """      <span class="wb-emoji">✒️</span>
    </div>

    <div class="adf-instant" id="adfInstant264">
      <i class="fas fa-filter adf-instant-ico" aria-hidden="true"></i>
      <input type="text" id="adfFilter264" class="adf-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — স্ট্যাট / কার্ড / কুইক-অ্যাকশন" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="adfClear264" class="adf-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="adf-count-chip" id="adfCount264" hidden></span>
      <span class="adf-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="adf-zero" id="adfZero264" data-adf-empty hidden>
      <i class="fas fa-th-large" aria-hidden="true"></i>
      <span>কোনো সারফেস মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>

    <div class="stat-grid">
"""
rep(A1, B1, '① ফিল্টার-স্ট্রিপ+শূন্য-অবস্থা')

# ── ② stat-box ×৯ — data-adf-row/data-kw (দ্বি-ভাষা) ──
# গোটচা: ফাইলে aligned multi-space (href→class মাঝে) — হোয়াইটস্পেস-নমনীয় রেজেক্সই-পথ
STATS = [
    ('/admin/users', 'stat-box v-blue', 'fa-users-cog', 'counts.users', 'সক্রিয় ইউজার',
     'ইউজার ব্যবস্থাপনা সক্রিয় অ্যাকাউন্ট /admin/users users accounts', '0'),
    ('/admin/notices', 'stat-box v-green', 'fa-bell', 'counts.notices', 'বিজ্ঞপ্তি',
     'বিজ্ঞপ্তি নোটিশ ঘোষণা সংবাদ /admin/notices notices announcement', '1'),
    ('/admin/events', 'stat-box v-gold', 'fa-calendar', 'counts.events', 'ইভেন্ট',
     'ইভেন্ট অনুষ্ঠান ক্যালেন্ডার /admin/events events calendar', '2'),
    ('/admin/members', 'stat-box v-navy', 'fa-users', 'counts.members', 'সদস্য',
     'সদস্য কমিটি কার্যনির্বাহী উপদেষ্টা /admin/members members committee', '3'),
    ('/admin/gallery', 'stat-box v-violet', 'fa-images', 'counts.gallery', 'গ্যালারি',
     'গ্যালারি ছবি অ্যালবাম ফটো /admin/gallery gallery photos', '4'),
    ('/admin/daily', 'stat-box v-cyan', 'fa-sun', 'counts.daily', 'ডেইলি কনটেন্ট',
     'ডেইলি কনটেন্ট দৈনিক আজকের /admin/daily daily content', '5'),
    ('/admin/resources', 'stat-box v-amber', 'fa-book', 'counts.resources', 'রিসোর্স',
     'রিসোর্স ডাউনলোড সামগ্রী বই /admin/resources resources downloads', '6'),
    ('/admin/messages', 'stat-box v-green', 'fa-envelope', 'counts.messages', 'বার্তা',
     'বার্তা যোগাযোগ ইনবক্স অপঠিত /admin/messages messages inbox', '7'),
    ('/admin/complaints', 'stat-box v-rose', 'fa-flag', 'counts.complaints', 'নতুন অভিযোগ',
     'অভিযোগ রিপোর্ট নতুন ফ্ল্যাগ /admin/complaints complaints reports', '8'),
]
for href, cls, ico, cnt, label, kw, idx in STATS:
    pat = '(<a href="%s"\\s+class="%s")>' % (re.escape(href), re.escape(cls))
    rpl = r'\1 data-adf-row="%s" data-kw="%s">' % (idx, kw)
    rep_re(pat, rpl, '② stat-box[%s] %s' % (idx, href))

# ── ③ কার্ড ×২ — data-adf-row/data-kw (স্ট্যাটিক-kw) ──
A3a = """      <div class="card">
        <h3 class="card-title"><i class="fas fa-bolt"></i> সাম্প্রতিক কনটেন্ট</h3>"""
B3a = """      <div class="card" data-adf-row="9" data-kw="সাম্প্রতিক কনটেন্ট লেখা বিজ্ঞপ্তি ইভেন্ট প্রকাশিত recent content">
        <h3 class="card-title"><i class="fas fa-bolt"></i> সাম্প্রতিক কনটেন্ট</h3>"""
rep(A3a, B3a, '③ কার্ড recent-content')

A3b = """      <div class="card">
        <h3 class="card-title"><i class="fas fa-inbox"></i> সাম্প্রতিক বার্তা ও অভিযোগ</h3>"""
B3b = """      <div class="card" data-adf-row="10" data-kw="সাম্প্রতিক বার্তা অভিযোগ নতুন সদস্য ইনবক্স recent messages complaints">
        <h3 class="card-title"><i class="fas fa-inbox"></i> সাম্প্রতিক বার্তা ও অভিযোগ</h3>"""
rep(A3b, B3b, '③ কার্ড recent-messages')

# ── ④ কুইক-অ্যাকশন বাটন ×৭ — data-adf-row/data-kw ──
QAS = [
    ('/admin/content', 'btn btn-gold', 'fa-pen-square', 'কনটেন্ট সম্পাদক',
     'কনটেন্ট সম্পাদক এডিটর লেখা /admin/content content editor', '11'),
    ('/admin/notices/new', 'btn btn-primary', 'fa-plus', 'নতুন বিজ্ঞপ্তি',
     'নতুন বিজ্ঞপ্তি তৈরি যোগ /admin/notices/new new notice create', '12'),
    ('/admin/events/new', 'btn', 'fa-plus', 'নতুন ইভেন্ট',
     'নতুন ইভেন্ট তৈরি যোগ /admin/events/new new event create', '13'),
    ('/admin/gallery/new', 'btn', 'fa-plus', 'নতুন ছবি',
     'নতুন ছবি আপলোড গ্যালারি /admin/gallery/new new photo upload', '14'),
    ('/admin/daily/new', 'btn', 'fa-plus', 'ডেইলি কনটেন্ট',
     'নতুন ডেইলি কনটেন্ট তৈরি /admin/daily/new new daily', '15'),
    ('/admin/members/new', 'btn', 'fa-plus', 'নতুন সদস্য',
     'নতুন সদস্য যোগ কমিটি /admin/members/new new member create', '16'),
    ('/admin/subscribers', 'btn', 'fa-paper-plane', 'নিউজলেটার',
     'নিউজলেটার সাবস্ক্রাইবার ইমেইল প্রেরণ /admin/subscribers newsletter subscribers', '17'),
]
for href, cls, ico, label, kw, idx in QAS:
    pat = '(<a href="%s"\\s+class="%s")>' % (re.escape(href), re.escape(cls))
    rpl = r'\1 data-adf-row="%s" data-kw="%s">' % (idx, kw)
    rep_re(pat, rpl, '④ কুইক-অ্যাকশন[%s] %s' % (idx, href))

# ── ⑤ [Mandatory-স্টাইল] adf264-ব্লক (হেক্স-শূন্য টোকেন-শুধু) — </head>-এর-আগে ──
A5 = """  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
</head>"""
B5 = """  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
  <style>
    /* session264 — অ্যাডমিন ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (adf264 — হেক্স-শূন্য টোকেন-শুধু; mdf263-প্যাটার্ন-মিরর) */
    .adf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .adf-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .adf-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .adf-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .adf-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .adf-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .adf-instant-clear:active { transform: scale(.96); }
    .adf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .adf-count-chip[hidden] { display: none; }
    .adf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .adf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .adf-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .adf-zero[hidden] { display: none; }
    .stat-box[data-adf-row][hidden] { display: none !important; }
    .card[data-adf-row][hidden] { display: none !important; }
    .quick-actions .btn[data-adf-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .adf-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .adf-kbd-hint { display: none; } .adf-instant { padding: 9px 11px; } }
  </style>
</head>"""
rep(A5, B5, '⑤ স্টাইল-ব্লক adf264')

# ── ⑥ JS-ব্লক + __adfQA হুক — </body>-এর-আগে ──
A6 = """    </div>
  </div>
</body>
</html>"""
B6 = """    </div>
  </div>

  <script>
  (function () {
    /* session264 — adf264 তাৎক্ষণিক-ফিল্টার (mdf263-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __adfQA) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-adf-row]'));
    var input = document.getElementById('adfFilter264');
    var clearBtn = document.getElementById('adfClear264');
    var countChip = document.getElementById('adfCount264');
    var zeroBox = document.getElementById('adfZero264');
    if (!input || !rows.length) { return; }
    var total = rows.length;
    function adfApply264() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var kw = (row.getAttribute('data-kw') || '').toLowerCase();
        var hit = !q || kw.indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) { shown++; }
      });
      if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = shown + ' / ' + total; } }
      if (clearBtn) { clearBtn.hidden = !q; }
      if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
    }
    function adfClear264() {
      input.value = '';
      adfApply264();
      input.blur();
    }
    input.addEventListener('input', adfApply264);
    if (clearBtn) { clearBtn.addEventListener('click', adfClear264); }
    input.addEventListener('keydown', function (ad) {
      if (ad.key === 'Escape') { ad.stopPropagation(); adfClear264(); }
    });
    document.addEventListener('keydown', function (ad) {
      if (ad.key !== 'f' || ad.altKey || ad.ctrlKey || ad.metaKey) { return; }
      var t = ad.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ad.preventDefault();
      input.focus();
      input.select();
    });
    window.__adfQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: adfApply264,
      clear: adfClear264
    };
  })();
  </script>
</body>
</html>"""
rep(A6, B6, '⑥ JS-ব্লক + __adfQA হুক')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

print('OK — %d সম্পাদনা:' % len(APPLIED))
for a in APPLIED:
    print('  •', a)
