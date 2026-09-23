#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s269-patch.py — session269: নিউজলেটার সাবস্ক্রাইবার (/admin/subscribers) দ্বৈত-সারফেস
তাৎক্ষণিক-ফিল্টার sb269 (subs টেবিল) + sl269 (logs টেবিল) — mo268-প্যাটার্ন-মিরর।

চুক্তি (PLANS session268-নোট থেকে):
  ① skip-if-present idempotent — পুনঃরানে SKIP-প্রমাণ
  ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (.sb-/.sl-/data-sb-row/data-sl-row/__sbQA/__slQA — প্যাচ-আগে শূন্য হতে হবে)
  ③ প্রতি-সম্পাদনা re.subn(count=1) + n==1-অ্যাসার্ট (অ্যাঙ্কর-অনন্যতা)
  ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (stat-box ×৪, data-bulk-all ×২, card empty ×২ …)
  ⑤ hidden-গার্ড সঠিক-বাইট-অ্যাসার্ট ('[hidden]' — ডিসপ্লে-আর্টিফ্যাক্ট-নিরপেক্ষ পাইথন-স্তর)
"""
import re, sys, io

PATH = 'admin/views/admin/subscribers.ejs'
src = io.open(PATH, encoding='utf-8').read()

def fatal(msg):
    print('FATAL: ' + msg); sys.exit(1)

# ── ① skip-if-present (idempotent) ──
if 'sbFilter269' in src or 'slFilter269' in src:
    print('SKIP: s269-প্যাচ ইতিমধ্যে-উপস্থিত (sbFilter269/slFilter269) — পুনঃপ্রয়োগ-নিষিদ্ধ (idempotent)')
    sys.exit(0)

# ── ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড ──
COLLISION_TOKENS = ['sb-instant', 'sl-instant', 'data-sb-row', 'data-sl-row',
                    'data-sb-empty', 'data-sl-empty', '__sbQA', '__slQA',
                    'sbFilter269', 'slFilter269', 'sbI269', 'slI269',
                    'sbApply269', 'slApply269', 'sbInstant269', 'slInstant269']
for tok in COLLISION_TOKENS:
    if tok in src:
        fatal('নেমস্পেস-সংঘর্ষ: %r ইতিমধ্যে-উপস্থিত (view-স্তর)' % tok)
try:
    css = io.open('public/assets/css/admin.css', encoding='utf-8').read()
except IOError:
    css = ''
for tok in ['.sb-instant', '.sl-instant', '.sb-count-chip', '.sl-count-chip', '.sb-zero', '.sl-zero']:
    if tok in css:
        fatal('নেমস্পেস-সংঘর্ষ: %r admin.css-এ-উপস্থিত' % tok)

# টোকেন-উপস্থিতি-গার্ড (স্টাইল-ব্লক-নির্ভর টোকেনগুলো টোকেন-ফাইলে আছে কি না)
tokens_css = ''
try:
    tokens_css = io.open('public/assets/css/tokens.css', encoding='utf-8').read()
except IOError:
    pass
_all_css = css + tokens_css
for tok in ['--lf-brandgreen', '--lf-slate', '--lf-white', '--lf-fb-border',
            '--lf-brandgreen-soft', '--lf-brandgreen-soft-2', '--lf-brandgreen-deep']:
    if tok not in _all_css:
        fatal('টোকেন-অনুপস্থিত: %r (tokens.css/admin.css)' % tok)

# প্রি-সংরক্ষণ-গণনা (প্যাচ-পরে অপরিবর্তিত হতে হবে)
PRESERVE = {'stat-box': 4, 'data-bulk-all': 2, 'id="bulkBar"': 1, 'card empty': 2,
            '/toggle"': 1, '/delete"': 1, '/retry/': 1,
            '/admin/subscribers/export"': 1, 'name="q"': 1}
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

# ── E1: subs সারি-সারফেস (data-sb-row + data-kw) ──
OLD1 = """      <% subs.forEach(s => { %>
        <tr>
          <td style="width:34px;">"""
NEW1 = """      <% subs.forEach((s, sbI269) => { %>
        <tr data-sb-row="<%= sbI269 %>" data-kw="#<%= s.id %> সাবস্ক্রাইবার subscriber ইমেইল email <%= s.email %> <%= s.name || '' %> <%= s.created_at || '' %> সাবস্ক্রিপশন subscribed <%= s.is_active ? 'সক্রিয় active' : 'বাতিল inactive বন্ধ off' %>">
          <td style="width:34px;">"""
sub1(OLD1, NEW1, 'E1-subs-row')

# ── E2: logs সারি-সারফেস (data-sl-row + data-kw) ──
OLD2 = """      <% logs.forEach(l => { %>
        <tr>
          <td><strong><%= l.title %></strong></td>"""
NEW2 = """      <% logs.forEach((l, slI269) => { %>
        <tr data-sl-row="<%= slI269 %>" data-kw="#<%= l.id %> রেকর্ড log নোটিফিকেশন notification <%= l.title %> <%= l.kind === 'notice' ? 'বিজ্ঞপ্তি notice' : 'লেখা post' %> <%= l.author_name || '' %> <%= l.created_at || '' %> <%= l.subscriber_count %> প্রাপক recipient <%= (l.sent_count + l.failed_count) < l.subscriber_count ? 'কিউতে queued আবার-পাঠান retry' : 'পাঠানো-সম্পন্ন done' %>">
          <td><strong><%= l.title %></strong></td>"""
sub1(OLD2, NEW2, 'E2-logs-row')

# ── E3: sb269 ফিল্টার-স্ট্রিপ (সাবস্ক্রাইবার-তালিকা-হেডার-পরে, if/else-পূর্বে — always-rendered) ──
OLD3 = """  <% if (subs.length === 0) { %>
    <div class="card empty">এখনো কোনো সাবস্ক্রাইবার নেই"""
NEW3 = """  <div class="sb-instant" id="sbInstant269">
    <i class="fas fa-filter sb-instant-ico" aria-hidden="true"></i>
    <input type="text" id="sbFilter269" class="sb-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — ইমেইল / নাম / অবস্থা" autocomplete="off" aria-label="সাবস্ক্রাইবার তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="sbClear269" class="sb-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="sb-count-chip" id="sbCount269" hidden></span>
    <span class="sb-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (subs.length === 0) { %>
    <div class="card empty">এখনো কোনো সাবস্ক্রাইবার নেই"""
sub1(OLD3, NEW3, 'E3-sb-strip')

# ── E4: sb শূন্য-অবস্থা + sl269 স্ট্রিপ (লগ-হেডার-চারপাশ — always-rendered) ──
OLD4 = """  <% } %>

  <div class="admin-header" style="margin-top:28px;">
    <h2 style="font-size:1.15rem;">ইমেইল নোটিফিকেশন রেকর্ড</h2>
  </div>
  <% if (logs.length === 0) { %>"""
NEW4 = """  <% } %>
  <div class="sb-zero" id="sbZero269" data-sb-empty hidden>
    <i class="fas fa-users" aria-hidden="true"></i>
    <span>কোনো সাবস্ক্রাইবার মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>

  <div class="admin-header" style="margin-top:28px;">
    <h2 style="font-size:1.15rem;">ইমেইল নোটিফিকেশন রেকর্ড</h2>
  </div>
  <div class="sl-instant" id="slInstant269">
    <i class="fas fa-filter sl-instant-ico" aria-hidden="true"></i>
    <input type="text" id="slFilter269" class="sl-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ধরন / প্রেরক / অবস্থা" autocomplete="off" aria-label="নোটিফিকেশন-রেকর্ড তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="slClear269" class="sl-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="sl-count-chip" id="slCount269" hidden></span>
    <span class="sl-kbd-hint" aria-hidden="true"><kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (logs.length === 0) { %>"""
sub1(OLD4, NEW4, 'E4-sb-zero+sl-strip')

# ── E5: sl শূন্য-অবস্থা (লগ if/else-পরে — always-rendered) ──
OLD5 = """  <% } %>
</div>
</body>
</html>"""
NEW5 = """  <% } %>
  <div class="sl-zero" id="slZero269" data-sl-empty hidden>
    <i class="fas fa-paper-plane" aria-hidden="true"></i>
    <span>কোনো নোটিফিকেশন রেকর্ড মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
</body>
</html>"""
sub1(OLD5, NEW5, 'E5-sl-zero')

# ── E6: JS + স্টাইল-ব্লক (</body>-পূর্বে) ──
OLD6 = """</div>
</body>
</html>"""
JS = """<script>
  (function () {
    /* session269 — sb269 তাৎক্ষণিক-ফিল্টার (mo268-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __sbQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-sb-row]'));
    var input = document.getElementById('sbFilter269');
    var clearBtn = document.getElementById('sbClear269');
    var countChip = document.getElementById('sbCount269');
    var zeroBox = document.getElementById('sbZero269');
    if (!input) { return; }
    var total = rows.length;
    function sbApply269() {
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
    function sbClear269() {
      input.value = '';
      sbApply269();
      input.blur();
    }
    input.addEventListener('input', sbApply269);
    if (clearBtn) { clearBtn.addEventListener('click', sbClear269); }
    input.addEventListener('keydown', function (sb) {
      if (sb.key === 'Escape') { sb.stopPropagation(); sbClear269(); }
    });
    document.addEventListener('keydown', function (sb) {
      if (sb.key !== 'f' || sb.altKey || sb.ctrlKey || sb.metaKey) { return; }
      var t = sb.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      sb.preventDefault();
      input.focus();
      input.select();
    });
    window.__sbQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: sbApply269,
      clear: sbClear269
    };
  })();
  (function () {
    /* session269 — sl269 তাৎক্ষণিক-ফিল্টার (দ্বৈত-সারফেস-দ্বিতীয়: 'f'-ফোকাস একক-মালিকানা sb269-এ — ফোকাস-দ্বন্দ্ব-নিষিদ্ধ; sl269 = input/Escape/clear স্বাধীন + __slQA সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-sl-row]'));
    var input = document.getElementById('slFilter269');
    var clearBtn = document.getElementById('slClear269');
    var countChip = document.getElementById('slCount269');
    var zeroBox = document.getElementById('slZero269');
    if (!input) { return; }
    var total = rows.length;
    function slApply269() {
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
    function slClear269() {
      input.value = '';
      slApply269();
      input.blur();
    }
    input.addEventListener('input', slApply269);
    if (clearBtn) { clearBtn.addEventListener('click', slClear269); }
    input.addEventListener('keydown', function (sl) {
      if (sl.key === 'Escape') { sl.stopPropagation(); slClear269(); }
    });
    window.__slQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: slApply269,
      clear: slClear269
    };
  })();
</script>
<style>
    /* session269 — sb269/sl269 তাৎক্ষণিক-ফিল্টার স্টাইল (mo268-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .sb-instant, .sl-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .sb-instant-ico, .sl-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .sb-instant-input, .sl-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .sb-instant-input:focus, .sl-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .sb-instant-clear, .sl-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .sb-instant-clear:hover, .sl-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .sb-instant-clear:active, .sl-instant-clear:active { transform: scale(.96); }
    .sb-count-chip, .sl-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .sb-count-chip[hidden], .sl-count-chip[hidden] { display: none; }
    .sb-kbd-hint, .sl-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .sb-kbd-hint kbd, .sl-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .sb-zero, .sl-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .sb-zero[hidden], .sl-zero[hidden] { display: none; }
    tr[data-sb-row][hidden], tr[data-sl-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .sb-instant-clear:active, .sl-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .sb-kbd-hint, .sl-kbd-hint { display: none; } .sb-instant, .sl-instant { padding: 9px 11px; } }
  </style>
</body>
</html>"""
sub1(OLD6, JS, 'E6-js-style')

# ── ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (প্যাচ-পরে অপরিবর্তিত) ──
for m, n in PRESERVE.items():
    c = src.count(m)
    if c != n:
        fatal('পোস্ট-সংরক্ষণ-গণনা-বেমান: %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))

# ── ⑤ সঠিক-বাইট-অ্যাসার্ট (hidden-গার্ড — ডিসপ্লে-আর্টিফ্যাক্ট-নিরপেক্ষ) ──
BYTE_ASSERTS = [
    'tr[data-sb-row][hidden], tr[data-sl-row][hidden] { display: none !important; }',
    '.sb-count-chip[hidden], .sl-count-chip[hidden] { display: none; }',
    '.sb-zero[hidden], .sl-zero[hidden] { display: none; }',
    'data-sb-row="<%= sbI269 %>"',
    'data-sl-row="<%= slI269 %>"',
    "sb.key !== 'f'",
]
for b in BYTE_ASSERTS:
    if b not in src:
        fatal('সঠিক-বাইট-অ্যাসার্ট-ব্যর্থ: %r অনুপস্থিত' % b[:60])

# হেক্স-শূন্য-প্রি-অ্যাসার্ট (নতুন-স্টাইল-ব্লক)
mstyle = re.search(r'/\* session269 — sb269/sl269 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', src, re.S)
if not mstyle:
    fatal('স্টাইল-ব্লক-নির্ণয়-ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', mstyle.group(0))
# color-mix-স্ট্রিং-এ '#'-নেই; kbd ইত্যাদি টোকেন-শুধু — কোনো-হেক্স-থাকা-উচিত-নয়
if hexes:
    fatal('নতুন-স্টাইল-ব্লকে হেক্স-শনাক্ত: %r' % hexes[:5])

io.open(PATH, 'w', encoding='utf-8').write(src)
print('OK: s269-প্যাচ প্রয়োগ — সম্পাদনা %d: %s' % (len(edits_done), ', '.join(edits_done)))
print('সংরক্ষণ-মার্কার ×%d গণনা-অক্ষুণ্ণ + সঠিক-বাইট ×%d + হেক্স-শূন্য-প্রমাণিত' % (len(PRESERVE), len(BYTE_ASSERTS)))
