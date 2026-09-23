#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s270-patch.py — session270: অডিট লগ (/admin/audit) তাৎক্ষণিক-ফিল্টার au270 —
mo268-প্যাটার্ন-মিরর, **রিড-ওনলি-সারফেস** (মিউটেশন-শূন্য পৃষ্ঠা — precount-চুক্তি)।

চুক্তি (PLANS session269-নোট থেকে):
  ① skip-if-present idempotent — পুনঃরানে SKIP-প্রমাণ
  ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (.au-/data-au-row/__auQA — view + admin.css/tokens.css)
  ③ প্রতি-সম্পাদনা re.subn(count=1) + n==1-অ্যাসার্ট
  ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (table-wrap ×১, export.csv ×১, q/action/from/to ×১…)
  ⑤ hidden-গার্ড সঠিক-বাইট-অ্যাসার্ট ('[hidden]' — ডিসপ্লে-আর্টিফ্যাক্ট-নিরপেক্ষ)
  ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক)
"""
import re, sys, io

PATH = 'admin/views/admin/audit.ejs'
src = io.open(PATH, encoding='utf-8').read()

def fatal(msg):
    print('FATAL: ' + msg); sys.exit(1)

# ── ① skip-if-present (idempotent) ──
if 'auFilter270' in src:
    print('SKIP: s270-প্যাচ ইতিমধ্যে-উপস্থিত (auFilter270) — পুনঃপ্রয়োগ-নিষিদ্ধ (idempotent)')
    sys.exit(0)

# ── ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড ──
COLLISION_TOKENS = ['au-instant', 'data-au-row', 'data-au-empty', '__auQA',
                    'auFilter270', 'auClear270', 'auCount270', 'auZero270',
                    'auI270', 'auApply270', 'auClearFn270', 'auInstant270']
for tok in COLLISION_TOKENS:
    if tok in src:
        fatal('নেমস্পেস-সংঘর্ষ: %r ইতিমধ্যে-উপস্থিত (view-স্তর)' % tok)
css = ''
try:
    css = io.open('public/assets/css/admin.css', encoding='utf-8').read()
except IOError:
    pass
tokens_css = ''
try:
    tokens_css = io.open('public/assets/css/tokens.css', encoding='utf-8').read()
except IOError:
    pass
for tok in ['.au-instant', '.au-count-chip', '.au-zero', '.au-kbd-hint']:
    if tok in css or tok in tokens_css:
        fatal('নেমস্পেস-সংঘর্ষ: %r admin.css/tokens.css-এ-উপস্থিত' % tok)
for tok in ['--lf-brandgreen', '--lf-slate', '--lf-white', '--lf-fb-border',
            '--lf-brandgreen-soft', '--lf-brandgreen-soft-2', '--lf-brandgreen-deep']:
    if tok not in (css + tokens_css):
        fatal('টোকেন-অনুপস্থিত: %r' % tok)

# প্রি-সংরক্ষণ-গণনা (প্যাচ-পরে অপরিবর্তিত হতে হবে)
PRESERVE = {'style="padding:0;overflow:hidden;"': 1, 'table-wrap': 1,
            'export.csv': 1, 'name="q"': 1, 'name="action"': 1,
            'name="from"': 1, 'name="to"': 1, '<table class="table">': 1,
            'class="empty"': 1, 'subtitle': 1, 'currentPath': 0}
PRESERVE.pop('currentPath', None)
for m, n in PRESERVE.items():
    c = src.count(m)
    if c != n:
        fatal('প্রি-সংরক্ষণ-গণনা-বেমান: %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))

edits_done = []

def sub1(old, new, label):
    global src
    pat = re.escape(old)
    new_src, n = re.subn(pat, new.replace('\\', '\\\\'), src, count=1)
    if n != 1:
        fatal('অ্যাঙ্কর-মিল-ব্যর্থ (%s) — n=%d' % (label, n))
    src = new_src
    edits_done.append(label)

# ── E1: সারি-সারফেস (data-au-row + data-kw — #আইডি একক-প্রোব-উৎস) ──
OLD1 = """        <% rows.forEach(r => { %>
        <tr>
          <td><%= r.created_at %></td>"""
NEW1 = """        <% rows.forEach((r, auI270) => { %>
        <tr data-au-row="<%= auI270 %>" data-kw="#<%= r.id %> অডিট audit এন্ট্রি entry সময় time <%= r.created_at || '' %> ব্যবহারকারী user actor <%= r.actor_name || '' %> অ্যাকশন action <%= r.action %> টেবিল table <%= r.table_name || '' %> আইটেম item <%= r.item_id || '' %> বিস্তারিত detail <%= String(r.detail || '').replace(/\\s+/g, ' ') %>">
          <td><%= r.created_at %></td>"""
sub1(OLD1, NEW1, 'E1-au-row')

# ── E2: au270 ফিল্টার-স্ট্রিপ (admin-header-পরে, card-পূর্বে — always-rendered) ──
OLD2 = """  </div>

  <div class="card" style="padding:0;overflow:hidden;">"""
NEW2 = """  </div>
  <div class="au-instant" id="auInstant270">
    <i class="fas fa-filter au-instant-ico" aria-hidden="true"></i>
    <input type="text" id="auFilter270" class="au-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — ব্যবহারকারী / অ্যাকশন / টেবিল / বিবরণ" autocomplete="off" aria-label="অডিট-লগ তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="auClear270" class="au-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="au-count-chip" id="auCount270" hidden></span>
    <span class="au-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>

  <div class="card" style="padding:0;overflow:hidden;">"""
sub1(OLD2, NEW2, 'E2-au-strip')

# ── E3: au শূন্য-অবস্থা (card-পরে — always-rendered) ──
OLD3 = """  </div>
</div>
</body>
</html>"""
NEW3 = """  </div>
  <div class="au-zero" id="auZero270" data-au-empty hidden>
    <i class="fas fa-file-shield" aria-hidden="true"></i>
    <span>কোনো অডিট এন্ট্রি মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
</body>
</html>"""
sub1(OLD3, NEW3, 'E3-au-zero')

# ── E4: JS + স্টাইল-ব্লক (</body>-পূর্বে) ──
OLD4 = """</div>
</body>
</html>"""
JS = """<script>
  (function () {
    /* session270 — au270 তাৎক্ষণিক-ফিল্টার (mo268-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __auQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-au-row]'));
    var input = document.getElementById('auFilter270');
    var clearBtn = document.getElementById('auClear270');
    var countChip = document.getElementById('auCount270');
    var zeroBox = document.getElementById('auZero270');
    if (!input) { return; }
    var total = rows.length;
    function auApply270() {
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
    function auClearFn270() {
      input.value = '';
      auApply270();
      input.blur();
    }
    input.addEventListener('input', auApply270);
    if (clearBtn) { clearBtn.addEventListener('click', auClearFn270); }
    input.addEventListener('keydown', function (au) {
      if (au.key === 'Escape') { au.stopPropagation(); auClearFn270(); }
    });
    document.addEventListener('keydown', function (au) {
      if (au.key !== 'f' || au.altKey || au.ctrlKey || au.metaKey) { return; }
      var t = au.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      au.preventDefault();
      input.focus();
      input.select();
    });
    window.__auQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: auApply270,
      clear: auClearFn270
    };
  })();
</script>
<style>
    /* session270 — au270 তাৎক্ষণিক-ফিল্টার স্টাইল (mo268-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .au-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .au-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .au-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .au-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .au-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .au-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .au-instant-clear:active { transform: scale(.96); }
    .au-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .au-count-chip[hidden] { display: none; }
    .au-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .au-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .au-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .au-zero[hidden] { display: none; }
    tr[data-au-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .au-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .au-kbd-hint { display: none; } .au-instant { padding: 9px 11px; } }
  </style>
</body>
</html>"""
sub1(OLD4, JS, 'E4-js-style')

# ── ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (প্যাচ-পরে অপরিবর্তিত) ──
for m, n in PRESERVE.items():
    c = src.count(m)
    if c != n:
        fatal('পোস্ট-সংরক্ষণ-গণনা-বেমান: %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))

# ── ⑤ সঠিক-বাইট-অ্যাসার্ট ──
BYTE_ASSERTS = [
    'tr[data-au-row][hidden] { display: none !important; }',
    '.au-count-chip[hidden] { display: none; }',
    '.au-zero[hidden] { display: none; }',
    'data-au-row="<%= auI270 %>"',
    "au.key !== 'f'",
]
for b in BYTE_ASSERTS:
    if b not in src:
        fatal('সঠিক-বাইট-অ্যাসার্ট-ব্যর্থ: %r অনুপস্থিত' % b[:60])

# ── ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক) ──
mstyle = re.search(r'/\* session270 — au270 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', src, re.S)
if not mstyle:
    fatal('স্টাইল-ব্লক-নির্ণয়-ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', mstyle.group(0))
if hexes:
    fatal('নতুন-স্টাইল-ব্লকে হেক্স-শনাক্ত: %r' % hexes[:5])

io.open(PATH, 'w', encoding='utf-8').write(src)
print('OK: s270-প্যাচ প্রয়োগ — সম্পাদনা %d: %s' % (len(edits_done), ', '.join(edits_done)))
print('সংরক্ষণ-মার্কার ×%d গণনা-অক্ষুণ্ণ + সঠিক-বাইট ×%d + হেক্স-শূন্য-প্রমাণিত' % (len(PRESERVE), len(BYTE_ASSERTS)))
