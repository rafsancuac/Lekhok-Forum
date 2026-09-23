#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s268-patch.py — session268 [Task ID 108] /admin/moderators তাৎক্ষণিক-ফিল্টার mo268
(tk267-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড +
Escape + __moQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত)
চুক্তি:
  ① skip-if-present idempotent (moFilter268 থাকলে SKIP — পুনঃরান-নিরাপদ)
  ② প্রি-চেক FATAL-গার্ড: .mo- প্রিফিক্স admin.css/tokens.css-এ শূন্য + টোকেন-উপস্থিতি
  ③ হেক্স-শূন্য টোকেন-শুধু স্টাইল-ব্লক (color-mix রিং + dashed kbd-পিল + :active +
     reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ সঠিক-বাইট — tr-সারফেস-গার্ড-প্রথম)
  ④ সংরক্ষণ-অ্যাসার্ট: প্যাচ-পূর্ব/পরে no-regression-মার্কার-গণনা অপরিবর্তিত
  ⑤ সত্য-উৎস = পাইথন-বাইট-অ্যাসার্ট (টুল-ডিসপ্লে [h-ক্ষয় উপেক্ষ্য)
"""
import re
import sys

APP = __file__.rsplit('/scripts/', 1)[0]
VIEW = APP + '/admin/views/admin/moderators.ejs'
ADMIN_CSS = APP + '/public/assets/css/admin.css'
TOKENS_CSS = APP + '/public/assets/css/tokens.css'

def fatal(msg):
    print('FATAL: ' + msg)
    sys.exit(1)

src = open(VIEW, encoding='utf-8').read()

# ── ① skip-if-present ──
if 'moFilter268' in src:
    print('SKIP: mo268 পূর্ব-উপস্থিত (idempotent পুনঃরান — কোনো-সম্পাদনা-নয়)')
    sys.exit(0)

# ── ② প্রি-চেক FATAL-গার্ড ──
for cssf in (ADMIN_CSS, TOKENS_CSS):
    css = open(cssf, encoding='utf-8').read()
    if '.mo-' in css:
        fatal('.mo- প্রিফিক্স-সংঘর্ষ সনাক্ত ' + cssf.rsplit('/', 1)[-1])
for tok in ('--lf-brandgreen', '--lf-brandgreen-soft', '--lf-brandgreen-soft-2',
            '--lf-brandgreen-deep', '--lf-fb-border', '--lf-white', '--lf-slate'):
    if tok not in open(TOKENS_CSS, encoding='utf-8').read():
        fatal('টোকেন-অনুপস্থিত: ' + tok)

# সংরক্ষণ-বেসলাইন (প্যাচ-পূর্ব)
BASE = {
    'person-card': src.count('person-card'),
    'role-form': src.count('/role'),
    'scopes-form': src.count('/scopes'),
    'scope-toggle': src.count('scope-toggle'),
    'sidebar': src.count("include('./partials/sidebar')"),
    'section-head': src.count('section-head'),
    'empty-state-full': src.count('empty-state-full'),
    'users-tr': src.count('<tr'),
}

# ── সম্পাদনা-১: <style> ব্লক (</head>-এর-আগে) ──
STYLE = """  <style>
    /* session268 — mo268 তাৎক্ষণিক-ফিল্টার স্টাইল (tk267-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .mo-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .mo-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .mo-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .mo-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .mo-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .mo-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .mo-instant-clear:active { transform: scale(.96); }
    .mo-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .mo-count-chip[hidden] { display: none; }
    .mo-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .mo-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .mo-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .mo-zero[hidden] { display: none; }
    tr[data-mo-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .mo-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .mo-kbd-hint { display: none; } .mo-instant { padding: 9px 11px; } }
  </style>
</head>"""

ANCHOR_HEAD = '  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />\n</head>'
if src.count(ANCHOR_HEAD) != 1:
    fatal('head-অ্যাঙ্কর অদ্বিতীয়-নয় (' + str(src.count(ANCHOR_HEAD)) + ')')
# head-লাইন + newline + STYLE(যার শেষে </head> আছে)
out = src.replace(ANCHOR_HEAD,
    '  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />\n' + STYLE, 1)
if out == src:
    fatal('সম্পাদনা-১ প্রয়োগ-ব্যর্থ')
src = out

# ── সম্পাদনা-২: ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (section-head-এর-পরে, if/else-এর-আগে) ──
ANCHOR_SEC = """  <div class="section-head">
    <h2>সব ইউজার</h2>
    <span class="count-pill"><%= users.length %></span>
  </div>
  <% if (users.length === 0) { %>"""
STRIP = """  <div class="section-head">
    <h2>সব ইউজার</h2>
    <span class="count-pill"><%= users.length %></span>
  </div>

  <div class="mo-instant" id="moInstant268">
    <i class="fas fa-filter mo-instant-ico" aria-hidden="true"></i>
    <input type="text" id="moFilter268" class="mo-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / ইউজারনেম / রোল / স্ট্যাটাস" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="moClear268" class="mo-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="mo-count-chip" id="moCount268" hidden></span>
    <span class="mo-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="mo-zero" id="moZero268" data-mo-empty hidden>
    <i class="fas fa-users" aria-hidden="true"></i>
    <span>কোনো ইউজার মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>

  <% if (users.length === 0) { %>"""
if src.count(ANCHOR_SEC) != 1:
    fatal('section-head-অ্যাঙ্কর অদ্বিতীয়-নয় (' + str(src.count(ANCHOR_SEC)) + ')')
src = src.replace(ANCHOR_SEC, STRIP, 1)

# ── সম্পাদনা-৩: সারি-সারফেস data-mo-row + দ্বিভাষিক data-kw ──
ANCHOR_ROW = """      <% users.forEach(u => { %>
        <tr>"""
ROW_NEW = """      <% users.forEach((u, idx) => { %>
        <tr data-mo-row="<%= idx %>" data-kw="#<%= u.id %> ইউজার user <%= u.full_name %> @<%= u.username %> <%= u.username %> <%= u.role === 'admin' ? 'অ্যাডমিন admin' : u.role === 'moderator' ? 'মডারেটর moderator' : 'ইউজার user' %> <%= u.status === 'active' ? 'সক্রিয় active' : u.status === 'banned' ? 'নিষিদ্ধ banned' : 'অপেক্ষমাণ pending' %> <%= (u.created_at || '').split(' ')[0] %> যোগদান joined">"""
if src.count(ANCHOR_ROW) != 1:
    fatal('সারি-অ্যাঙ্কর অদ্বিতীয়-নয় (' + str(src.count(ANCHOR_ROW)) + ')')
src = src.replace(ANCHOR_ROW, ROW_NEW, 1)

# ── সম্পাদনা-৪: স্ক্রিপ্ট (</body>-এর-আগে) ──
SCRIPT = """<script>
  (function () {
    /* session268 — mo268 তাৎক্ষণিক-ফিল্টার (tk267-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __moQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-mo-row]'));
    var input = document.getElementById('moFilter268');
    var clearBtn = document.getElementById('moClear268');
    var countChip = document.getElementById('moCount268');
    var zeroBox = document.getElementById('moZero268');
    if (!input) { return; }
    var total = rows.length;
    function moApply268() {
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
    function moClear268() {
      input.value = '';
      moApply268();
      input.blur();
    }
    input.addEventListener('input', moApply268);
    if (clearBtn) { clearBtn.addEventListener('click', moClear268); }
    input.addEventListener('keydown', function (mo) {
      if (mo.key === 'Escape') { mo.stopPropagation(); moClear268(); }
    });
    document.addEventListener('keydown', function (mo) {
      if (mo.key !== 'f' || mo.altKey || mo.ctrlKey || mo.metaKey) { return; }
      var t = mo.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      mo.preventDefault();
      input.focus();
      input.select();
    });
    window.__moQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: moApply268,
      clear: moClear268
    };
  })();
</script>
</body>"""
if src.count('</body>') != 1:
    fatal('</body> অদ্বিতীয়-নয়')
src = src.replace('</body>', SCRIPT, 1)

# ── ⑤ সংরক্ষণ-অ্যাসার্ট (no-regression গণনা অপরিবর্তিত) ──
AFTER = {
    'person-card': src.count('person-card'),
    'role-form': src.count('/role'),
    'scopes-form': src.count('/scopes'),
    'scope-toggle': src.count('scope-toggle'),
    'sidebar': src.count("include('./partials/sidebar')"),
    'section-head': src.count('section-head'),
    'empty-state-full': src.count('empty-state-full'),
    'users-tr': src.count('<tr'),
}
for k, v in BASE.items():
    if AFTER[k] != v:
        fatal('সংরক্ষণ-ভাঙা: ' + k + ' ' + str(v) + '→' + str(AFTER[k]))

# বাইট-সত্য-যাচাই (ডিসপ্লে-আর্টিফ্যাক্ট-প্রতিরোধী)
for needle in ('.mo-count-chip[hidden] { display: none; }',
               '.mo-zero[hidden] { display: none; }',
               'tr[data-mo-row][hidden] { display: none !important; }',
               'id="moFilter268"', 'id="moClear268"', 'id="moCount268"',
               'id="moZero268"', 'data-mo-empty', '__moQA', 'data-mo-row='):
    if src.count(needle) < 1:
        fatal('বাইট-অ্যাসার্ট-ব্যর্থ: ' + needle)
if src.count(']idden]') != 0:
    fatal('ভাঙা-বাইট ]idden] সনাক্ত')

open(VIEW, 'w', encoding='utf-8').write(src)
print('OK: mo268 প্রয়োগ-সম্পন্ন — ৪-সম্পাদনা, সংরক্ষণ', str(len(BASE)), 'মার্কার, বাইট-অ্যাসার্ট গ্রিন')
