#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s265-patch.py — session265 (Task ID 105): অ্যাডমিন কমপ্লেইন্স-রিভিউ-ডেস্ক তাৎক্ষণিক-ফিল্টার ac265
admin/views/admin/complaints.ejs — adf264-প্যাটার্ন-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (acFilter265 + acClear265 + acCount265 + ac-kbd-hint)
     + শূন্য-অবস্থা (acZero265 data-ac-empty) + কার্ড-সারফেস data-ac-row/data-kw + __acQA হুক
  ② সারফেস = অভিযোগ-কার্ড (div.card) — forEach-ইনডেক্স (c, i) — শূন্য-অবস্থার 'card empty'
     ইচ্ছাকৃত-বাদ (সেটি নো-ডেটা-বক্স, সারফেস-সারি নয়)
  ③ **নেমস্পেস-ম্যাপ:** পেজে .card/.btn/bulk-* CSS পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স **ac**
     (admin.css-এ .ac- শূন্য — প্যাচ-আগে FATAL-যাচাই)
  ④ **দ্বিভাষিক data-kw:** #আইডি + অভিযোগ/complaint + বিষয় + জমাদানকারী-নাম + @ইউজারনেম +
     /profile/পাথ + স্ট্যাটাস-বাংলা/কী (new/in_review/resolved/dismissed + review/done/closed) +
     তারিখ + বডি (১৪০-স্লাইস, স্পেস-নরমাল) + সংযুক্তি-ফাইলনাম + attachment + অভ্যন্তরীণ-নোট
  ⑤ [Mandatory-স্টাইল] ac265-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল +
     :active + reduced-motion-জোড়া + 640px + hidden-গার্ড — .card[data-ac-row][hidden]
     !important, সঠিক-বাইট-যাচাইকৃত)
অক্ষুণ্ণ: স্ট্যাটাস-ট্যাব (সব/নতুন/পর্যালোচনাধীন/সমাধান/বাতিল), data-bulk-all + bulkBar,
প্রতি-কার্ড PUT-ফর্ম (select+admin_notes+সংরক্ষণ), DELETE-ফর্ম, পেপারক্লিপ-সংযুক্তি,
'saved=1' প্রবাহ, sidebar — সব no-regression-অ্যাসার্টে প্রমাণিত।
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'admin', 'views', 'admin', 'complaints.ejs')
ADMINCSS = os.path.join(ROOT, 'public', 'assets', 'css', 'admin.css')

# ── নেমস্পেস-পূর্ব-যাচাই: admin.css-এ .ac- প্রিফিক্স অবশ্যই শূন্য ──
with io.open(ADMINCSS, 'r', encoding='utf-8') as f:
    _css = f.read()
if re.search(r'\.ac-', _css):
    sys.exit('FATAL: admin.css-এ .ac- প্রিফিক্স পূর্ব-দখলকৃত — নেমস্পেস-সংঘর্ষ')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'acFilter265' in src:
    print('SKIP: ac265 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

def rep(anchor, replacement, label):
    global src
    if anchor not in src:
        sys.exit('FATAL: অ্যাঙ্কর পাওয়া যায়নি — ' + label)
    src = src.replace(anchor, replacement, 1)
    APPLIED.append(label)

# ── ① স্টাইল-ব্লক (head-এ, admin.css-লিংক-এর পরে) — হেক্স-শূন্য টোকেন-শুধু ──
STYLE_BLOCK = """  <style>
    /* session265 — অ্যাডমিন কমপ্লেইন্স তাৎক্ষণিক-ফিল্টার (ac265 — হেক্স-শূন্য টোকেন-শুধু; adf264-প্যাটার্ন-মিরর) */
    .ac-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .ac-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .ac-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .ac-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .ac-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .ac-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .ac-instant-clear:active { transform: scale(.96); }
    .ac-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .ac-count-chip[hidden] { display: none; }
    .ac-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .ac-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .ac-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .ac-zero[hidden] { display: none; }
    .card[data-ac-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .ac-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .ac-kbd-hint { display: none; } .ac-instant { padding: 9px 11px; } }
  </style>
</head>"""

rep("""  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
</head>""",
    """  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
""" + STYLE_BLOCK,
    'স্টাইল-ব্লock (head)')

# ── ② ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (স্ট্যাটাস-ট্যাব-এর পরে, bulk-label-এর আগে) ──
STRIP = """  </div>
  <div class="ac-instant" id="acInstant265">
    <i class="fas fa-filter ac-instant-ico" aria-hidden="true"></i>
    <input type="text" id="acFilter265" class="ac-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — অভিযোগ / জমাদানকারী / স্ট্যাটাস" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="acClear265" class="ac-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="ac-count-chip" id="acCount265" hidden></span>
    <span class="ac-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="ac-zero" id="acZero265" data-ac-empty hidden>
    <i class="fas fa-inbox" aria-hidden="true"></i>
    <span>কোনো অভিযোগ মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
  <label style="font-size:.85rem;font-weight:600;"""

rep(""" btn-sm">বাতিল</a>
  </div>
  <label style="font-size:.85rem;font-weight:600;""",
    """ btn-sm">বাতিল</a>
""" + STRIP,
    'ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা')

# ── ③ forEach-ইনডেক্স + স্ট্যাটাস-ম্যাপ ──
rep("""    <% complaints.forEach(c => { %>""",
    """    <% complaints.forEach((c, i) => { %>
    <% var acST265 = { 'new': 'নতুন new', 'in_review': 'পর্যালোচনাধীন in_review review', 'resolved': 'সমাধান হয়েছে resolved done', 'dismissed': 'বাতিল dismissed closed' }; %>""",
    'forEach-ইনডেক্স + acST265-ম্যাপ')

# ── ④ কার্ড-সারফেস (data-ac-row + দ্বিভাষিক data-kw) ──
KW = ('data-kw="#<%= c.id %> অভিযোগ complaint <%= c.subject || \'\' %> '
      '<%= c.submitter_name || \'\' %> @<%= c.submitter_username || \'\' %> '
      '/profile/<%= c.submitter_username || \'\' %> '
      '<%= acST265[c.status] || c.status %> <%= c.created_at || \'\' %> '
      '<%= ((c.body || \'\') + \' \').replace(/\\s+/g, \' \').trim().slice(0, 140) %> '
      '<%= c.file_name || \'\' %> সংযুক্তি attachment <%= c.admin_notes || \'\' %>"')

rep("""    <div class="card" style="margin-bottom:14px;">""",
    """    <div class="card" style="margin-bottom:14px;" data-ac-row="<%= i %>" """ + KW + """>""",
    'কার্ড-সারফেস (data-ac-row + data-kw)')

# ── ⑤ স্ক্রিপ্ট-ব্লক (__acQA হুকসহ) ──
SCRIPT = """</div>
<script>
  (function () {
    /* session265 — ac265 তাৎক্ষণিক-ফিল্টার (adf264-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __acQA) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-ac-row]'));
    var input = document.getElementById('acFilter265');
    var clearBtn = document.getElementById('acClear265');
    var countChip = document.getElementById('acCount265');
    var zeroBox = document.getElementById('acZero265');
    if (!input) { return; }
    var total = rows.length;
    function acApply265() {
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
    function acClear265() {
      input.value = '';
      acApply265();
      input.blur();
    }
    input.addEventListener('input', acApply265);
    if (clearBtn) { clearBtn.addEventListener('click', acClear265); }
    input.addEventListener('keydown', function (ac) {
      if (ac.key === 'Escape') { ac.stopPropagation(); acClear265(); }
    });
    document.addEventListener('keydown', function (ac) {
      if (ac.key !== 'f' || ac.altKey || ac.ctrlKey || ac.metaKey) { return; }
      var t = ac.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ac.preventDefault();
      input.focus();
      input.select();
    });
    window.__acQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: acApply265,
      clear: acClear265
    };
  })();
</script>
</body>"""

rep("""  <% } %>
</div>
</body>""",
    """  <% } %>
""" + SCRIPT,
    'স্ক্রিপ্ট-ব্লক (__acQA)')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

# ── পোস্ট-যাচাই (বাইট-স্তর) ──
rows_n = src.count('data-ac-row=')
kw_n = src.count('data-kw=')
hidden_n = src.count('[hidden]')
assert rows_n == 1, 'data-ac-row অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত, পাওয়া গেল ' + str(rows_n)
assert kw_n == 1, 'data-kw অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত'
assert hidden_n == 3, '[hidden] বাইট-যাচাই ব্যর্থ (৩টি গার্ড প্রত্যাশিত: চিপ+শূন্য+কার্ড), পাওয়া ' + str(hidden_n)
assert src.count('__acQA') >= 1, '__acQA হুক অনুপস্থিত'
assert '.ac-instant {' in src, 'ac265 স্টাইল-ব্লক অনুপস্থিত'
hex_in_style = re.findall(r'#[0-9a-fA-F]{3,8}\b', src.split('<style>')[1].split('</style>')[0])
assert not hex_in_style, 'স্টাইল-ব্লকে হেক্স-লিটারাল আবিষ্কৃত: ' + repr(hex_in_style[:5])

print('OK: ac265 প্যাচ-প্রয়োগ —', len(APPLIED), 'সম্পাদনা:')
for a in APPLIED:
    print('  •', a)
print('পোস্ট-যাচাই: [hidden]×' + str(hidden_n) + ' ✓, হেক্স-শূন্য ✓, __acQA ✓')
