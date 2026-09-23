#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s267-patch.py — session267 (Task ID 107): মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার tk267
admin/views/admin/tasks.ejs — ms266-প্যাটার্ন-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (tkFilter267 + tkClear267 + tkCount267 + kbd-hint)
     + শূন্য-অবস্থা (tkZero267 data-tk-empty) + সারি-সারফেস tr[data-tk-row]/data-kw + __tkQA হুক
     (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — session265-উন্নতি)
  ② সারফেস = <tr> (forEach-(t, idx)-এর idx) — 'empty-state-full' নো-ডেটা-বক্স অক্ষুণ্ণ (সারফেস-নয়)
  ③ **নেমস্পেস-ম্যাপ:** .tk- প্রিফিক্স admin.css-এ শূন্য — প্যাচ-আগে FATAL-যাচাই
  ④ **দ্বিভাষিক data-kw:** #আইডি + টাস্ক task + শিরোনাম + বিবরণ (১২০-স্লাইস, স্পেস-নরমাল) +
     assignee_name + মডারেটর moderator + অগ্রাধিকার (জরুরি urgent/উচ্চ high/সাধারণ normal) +
     স্ট্যাটাস (বাকি pending/চলমান in_progress/সম্পন্ন done) + due_date + ডেডলাইন deadline
  ⑤ [Mandatory-স্টাইল] tk267-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active
     + reduced-motion-জোড়া + 640px + hidden-গার্ড — tr[data-tk-row][hidden] !important সঠিক-বাইট)
অক্ষুণ্ণ: নতুন-টাস্ক-ফর্ম (title/assignee_id/priority/due_date/description), q42-সার্চ, pagination
(page42/pages42), bulk-bar + data-bulk-all ×২, প্রতি-সারি status-select ফর্ম (/status) + delete ফর্ম,
empty-state-full, admin-topbar, sidebar — সব no-regression-অ্যাসার্টে প্রমাণিত।
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'admin', 'views', 'admin', 'tasks.ejs')

# ── নেমস্পেস-পূর্ব-যাচাই: admin.css-এ .tk- প্রিফিক্স অবশ্যই শূন্য ──
ADMINCSS = os.path.join(ROOT, 'public', 'assets', 'css', 'admin.css')
with io.open(ADMINCSS, 'r', encoding='utf-8') as f:
    _css = f.read()
if re.search(r'\.tk-', _css):
    sys.exit('FATAL: admin.css-এ .tk- প্রিফিক্স পূর্ব-দখলকৃত — নেমস্পেস-সংঘর্ষ')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'tkFilter267' in src:
    print('SKIP: tk267 পূর্ব-উপস্থিত (idempotent)')
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
    /* session267 — মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার (tk267 — হেক্স-শূন্য টোকেন-শুধু; ms266-প্যাটার্ন-মিরর) */
    .tk-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .tk-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .tk-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .tk-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .tk-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .tk-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .tk-instant-clear:active { transform: scale(.96); }
    .tk-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .tk-count-chip[hidden] { display: none; }
    .tk-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .tk-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .tk-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .tk-zero[hidden] { display: none; }
    tr[data-tk-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .tk-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .tk-kbd-hint { display: none; } .tk-instant { padding: 9px 11px; } }
  </style>
</head>"""

rep("""  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
</head>""",
    """  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
""" + STYLE_BLOCK,
    'স্টাইল-ব্লক (head)')

# ── ② ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (card-title-এর </h3>-এর পরে, empty-check-এর আগে) ──
STRIP = """      </h3>

      <div class="tk-instant" id="tkInstant267">
        <i class="fas fa-filter tk-instant-ico" aria-hidden="true"></i>
        <input type="text" id="tkFilter267" class="tk-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — টাস্ক / মডারেটর / অগ্রাধিকার / স্ট্যাটাস" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
        <button type="button" id="tkClear267" class="tk-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
        <span class="tk-count-chip" id="tkCount267" hidden></span>
        <span class="tk-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
      </div>
      <div class="tk-zero" id="tkZero267" data-tk-empty hidden>
        <i class="fas fa-clipboard-list" aria-hidden="true"></i>
        <span>কোনো টাস্ক মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
      </div>

      <% if (tasks && tasks.length) { %>"""

rep("""      </h3>
      <% if (tasks && tasks.length) { %>""",
    STRIP,
    'ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা')

# ── ③ সারি-সারফেস (forEach idx + data-tk-row + দ্বিভাষিক data-kw) ──
KW = ('data-kw="#<%= t.id %> টাস্ক task <%= t.title %> '
      '<%= ((t.description || \'\') + \' \').replace(/\\s+/g, \' \').trim().slice(0, 120) %> '
      '<%= t.assignee_name || \'অনাবণ্ডিত unassigned\' %> মডারেটর moderator '
      '<%= t.priority === \'urgent\' ? \'জরুরি urgent\' : t.priority === \'high\' ? \'উচ্চ high\' : \'সাধারণ normal\' %> '
      '<%= t.status === \'pending\' ? \'বাকি pending\' : t.status === \'in_progress\' ? \'চলমান in_progress\' : \'সম্পন্ন done\' %> '
      '<%= t.due_date || \'\' %> ডেডলাইন deadline"')

rep("""            <% tasks.forEach(t => { %>
              <tr>""",
    """            <% tasks.forEach((t, idx) => { %>
              <tr data-tk-row="<%= idx %>" """ + KW + """>""",
    'সারি-সারফেস (data-tk-row + data-kw)')

# ── ④ স্ক্রিপ্ট-ব্লক (__tkQA হুকসহ — </body>-এর আগে) ──
SCRIPT = """<script>
  (function () {
    /* session267 — tk267 তাৎক্ষণিক-ফিল্টার (ms266-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __tkQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-tk-row]'));
    var input = document.getElementById('tkFilter267');
    var clearBtn = document.getElementById('tkClear267');
    var countChip = document.getElementById('tkCount267');
    var zeroBox = document.getElementById('tkZero267');
    if (!input) { return; }
    var total = rows.length;
    function tkApply267() {
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
    function tkClear267() {
      input.value = '';
      tkApply267();
      input.blur();
    }
    input.addEventListener('input', tkApply267);
    if (clearBtn) { clearBtn.addEventListener('click', tkClear267); }
    input.addEventListener('keydown', function (tk) {
      if (tk.key === 'Escape') { tk.stopPropagation(); tkClear267(); }
    });
    document.addEventListener('keydown', function (tk) {
      if (tk.key !== 'f' || tk.altKey || tk.ctrlKey || tk.metaKey) { return; }
      var t = tk.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      tk.preventDefault();
      input.focus();
      input.select();
    });
    window.__tkQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: tkApply267,
      clear: tkClear267
    };
  })();
</script>
</body>"""

rep("""</div>
</body>
</html>""",
    """</div>
""" + SCRIPT + """
</html>""",
    'স্ক্রিপ্ট-ব্লক (__tkQA)')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

# ── পোস্ট-যাচাই (বাইট-স্তর) ──
rows_n = src.count('data-tk-row=')
kw_n = src.count('data-kw=')
hidden_n = src.count('[hidden]')
assert rows_n == 1, 'data-tk-row অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত, পাওয়া গেল ' + str(rows_n)
assert kw_n == 1, 'data-kw অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত'
assert hidden_n == 3, '[hidden] বাইট-যাচাই ব্যর্থ (৩টি গার্ড প্রত্যাশিত: চিপ+শূন্য+সারি), পাওয়া ' + str(hidden_n)
assert 'tr[data-tk-row][hidden] { display: none !important; }' in src, 'সারি-hidden-গার্ড সঠিক-বাইট অনুপস্থিত'
assert src.count('__tkQA') >= 1, '__tkQA হুক অনুপস্থিত'
assert '.tk-instant {' in src, 'tk267 স্টাইল-ব্লক অনুপস্থিত'
hex_in_style = re.findall(r'#[0-9a-fA-F]{3,8}\b', src.split('<style>')[1].split('</style>')[0])
assert not hex_in_style, 'স্টাইল-ব্লকে হেক্স-লিটারাল আবিষ্কৃত: ' + repr(hex_in_style[:5])
# সংরক্ষণ-যাচাই: নতুন-টাস্ক-ফর্ম/বাল্ক/সার্চ/পেজিনেশন/স্ট্যাটাস/ডিলিট অক্ষুণ্ণ
for keep in ['name="title"', 'name="assignee_id"', 'name="priority"', 'name="due_date"',
             'name="description"', 'name="q"', 'data-bulk-all', 'bulk-bar', 'id="bulkBar"',
             '/status', '/delete', 'empty-state-full', 'admin-topbar', 'moderators.forEach',
             'bulk-delete', 'page42']:
    assert keep in src, 'সংরক্ষণ-ব্যর্থ: ' + keep

print('OK: tk267 প্যাচ-প্রয়োগ —', len(APPLIED), 'সম্পাদনা:')
for a in APPLIED:
    print('  •', a)
print('পোস্ট-যাচাই: [hidden]×' + str(hidden_n) + ' ✓, হেক্স-শূন্য ✓, __tkQA ✓, সংরক্ষণ ×১৫ ✓')
