#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s271-patch.py — session271: অ্যাক্টিভিটি লগ (/admin/activity) তাৎক্ষণিক-ফিল্টার av271 —
mo268/au270-প্যাটার্ন-মিরর, **রিড-ওনলি-সারফেস** (মিউটেশন-শূন্য পৃষ্ঠা — precount-চুক্তি)।

চুক্তি (PLANS session270-নোট থেকে):
  ① skip-if-present idempotent — পুনঃরানে SKIP-প্রমাণ
  ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (.av-/data-av-row/__avQA — view + admin.css/tokens.css)
  ③ প্রতি-সম্পাদনা re.subn(count=1) + n==1-অ্যাসার্ট
  ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (table ×১, empty ×১, chip-danger ×২, chip-accent ×৩…)
  ⑤ hidden-গার্ড সঠিক-বাইট-অ্যাসার্ট ('[hidden]' — ডিসপ্লে-আর্টিফ্যাক্ট-নিরপেক্ষ)
  ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক)
"""
import re, sys, io

PATH = 'admin/views/admin/activity.ejs'
src = io.open(PATH, encoding='utf-8').read()

def fatal(msg):
    print('FATAL: ' + msg); sys.exit(1)

# ── ① skip-if-present (idempotent) ──
if 'avFilter271' in src:
    print('SKIP: s271-প্যাচ ইতিমধ্যে-উপস্থিত (avFilter271) — পুনঃপ্রয়োগ-নিষিদ্ধ (idempotent)')
    sys.exit(0)

# ── ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড ──
COLLISION_TOKENS = ['av-instant', 'data-av-row', 'data-av-empty', '__avQA',
                    'avFilter271', 'avClear271', 'avCount271', 'avZero271',
                    'avI271', 'avApply271', 'avClearFn271', 'avInstant271']
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
for tok in ['.av-instant', '.av-count-chip', '.av-zero', '.av-kbd-hint']:
    if tok in css or tok in tokens_css:
        fatal('নেমস্পেস-সংঘর্ষ: %r admin.css/tokens.css-এ-উপস্থিত' % tok)
for tok in ['--lf-brandgreen', '--lf-slate', '--lf-white', '--lf-fb-border',
            '--lf-brandgreen-soft', '--lf-brandgreen-soft-2', '--lf-brandgreen-deep']:
    if tok not in (css + tokens_css):
        fatal('টোকেন-অনুপস্থিত: %r' % tok)

# প্রি-সংরক্ষণ-গণনা (প্যাচ-পরে অপরিবর্তিত হতে হবে)
PRESERVE = {'style="padding:0;overflow:hidden;"': 1, '<table class="table">': 1,
            'class="empty"': 1, 'subtitle': 1, 'fa-clock-rotate-left': 1,
            'chip-danger': 2, 'chip-accent': 3, 'white-space:nowrap': 1}
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

# ── E1: সারি-সারফেস (data-av-row + data-kw — #আইডি একক-প্রোব-উৎস) ──
OLD1 = """        <% rows.forEach(r => { %>
        <tr>
          <td style="white-space:nowrap;color:#65676b;font-size:.86rem;"><%= r.created_at %></td>"""
NEW1 = """        <% rows.forEach((r, avI271) => { %>
        <tr data-av-row="<%= avI271 %>" data-kw="#<%= r.id %> অ্যাক্টিভিটি activity এন্ট্রি entry সময় time <%= r.created_at || '' %> ব্যবহারকারী user <%= r.username || '' %> রোল role <%= r.role === 'admin' ? 'অ্যাডমিন admin' : 'মডারেটর moderator' %> অ্যাকশন action <%= r.action %> টার্গেট target <%= r.target || '' %> বিস্তারিত detail <%= String(r.detail || '').replace(/\\s+/g, ' ') %>">
          <td style="white-space:nowrap;color:#65676b;font-size:.86rem;"><%= r.created_at %></td>"""
sub1(OLD1, NEW1, 'E1-av-row')

# ── E2: av271 ফিল্টার-স্ট্রিপ (admin-header-পরে, card-পূর্বে — always-rendered) ──
OLD2 = """  </div>

  <div class="card" style="padding:0;overflow:hidden;">"""
NEW2 = """  </div>
  <div class="av-instant" id="avInstant271">
    <i class="fas fa-filter av-instant-ico" aria-hidden="true"></i>
    <input type="text" id="avFilter271" class="av-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — ব্যবহারকারী / অ্যাকশন / টার্গেট / বিবরণ" autocomplete="off" aria-label="অ্যাক্টিভিটি-লগ তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="avClear271" class="av-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="av-count-chip" id="avCount271" hidden></span>
    <span class="av-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>

  <div class="card" style="padding:0;overflow:hidden;">"""
sub1(OLD2, NEW2, 'E2-av-strip')

# ── E3: av শূন্য-অবস্থা (card-পরে — always-rendered) ──
OLD3 = """  </div>
</div>
</body>
</html>"""
NEW3 = """  </div>
  <div class="av-zero" id="avZero271" data-av-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো অ্যাক্টিভিটি এন্ট্রি মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
</body>
</html>"""
sub1(OLD3, NEW3, 'E3-av-zero')

# ── E4: JS + স্টাইল-ব্লক (</body>-পূর্বে) ──
OLD4 = """</div>
</body>
</html>"""
JS = """<script>
  (function () {
    /* session271 — av271 তাৎক্ষণিক-ফিল্টার (mo268-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __avQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-av-row]'));
    var input = document.getElementById('avFilter271');
    var clearBtn = document.getElementById('avClear271');
    var countChip = document.getElementById('avCount271');
    var zeroBox = document.getElementById('avZero271');
    if (!input) { return; }
    var total = rows.length;
    function avApply271() {
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
    function avClearFn271() {
      input.value = '';
      avApply271();
      input.blur();
    }
    input.addEventListener('input', avApply271);
    if (clearBtn) { clearBtn.addEventListener('click', avClearFn271); }
    input.addEventListener('keydown', function (av) {
      if (av.key === 'Escape') { av.stopPropagation(); avClearFn271(); }
    });
    document.addEventListener('keydown', function (av) {
      if (av.key !== 'f' || av.altKey || av.ctrlKey || av.metaKey) { return; }
      var t = av.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      av.preventDefault();
      input.focus();
      input.select();
    });
    window.__avQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: avApply271,
      clear: avClearFn271
    };
  })();
</script>
<style>
    /* session271 — av271 তাৎক্ষণিক-ফিল্টার স্টাইল (mo268-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .av-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .av-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .av-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .av-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .av-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .av-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .av-instant-clear:active { transform: scale(.96); }
    .av-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .av-count-chip[hidden] { display: none; }
    .av-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .av-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .av-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .av-zero[hidden] { display: none; }
    tr[data-av-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .av-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .av-kbd-hint { display: none; } .av-instant { padding: 9px 11px; } }
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
    'tr[data-av-row][hidden] { display: none !important; }',
    '.av-count-chip[hidden] { display: none; }',
    '.av-zero[hidden] { display: none; }',
    'data-av-row="<%= avI271 %>"',
    "av.key !== 'f'",
]
for b in BYTE_ASSERTS:
    if b not in src:
        fatal('সঠিক-বাইট-অ্যাসার্ট-ব্যর্থ: %r অনুপস্থিত' % b[:60])

# ── ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক) ──
mstyle = re.search(r'/\* session271 — av271 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', src, re.S)
if not mstyle:
    fatal('স্টাইল-ব্লক-নির্ণয়-ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', mstyle.group(0))
if hexes:
    fatal('নতুন-স্টাইল-ব্লকে হেক্স-শনাক্ত: %r' % hexes[:5])

io.open(PATH, 'w', encoding='utf-8').write(src)
print('OK: s271-প্যাচ প্রয়োগ — সম্পাদনা %d: %s' % (len(edits_done), ', '.join(edits_done)))
print('সংরক্ষণ-মার্কার ×%d গণনা-অক্ষুণ্ণ + সঠিক-বাইট ×%d + হেক্স-শূন্য-প্রমাণিত' % (len(PRESERVE), len(BYTE_ASSERTS)))
