#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s276-patch.py — session276: অ্যাডমিন বিজ্ঞপ্তি তালিকা (/admin/notices) তাৎক্ষণিক-ফিল্টার an276
s275/s274-প্যাটার্ন-মিরর + **admin-সাব-তালিকা-ধারাবাহিকতা** (moderator-সংস্করণ no259-সুইটেড; admin-ভার্সন-অফিল্টারড)।

চুক্তি:
- skip-if-present idempotent (anFilter276 প্রাক-উপস্থিত → SKIP exit 0)
- in-memory-সম্পাদনা → সম্পূর্ণ-অ্যাসার্ট → তার-পরে write (প্যাচ-নিরাপত্তা-চুক্তি)
- FATAL-গার্ড: নেমস্পেস (.an276- regex + data-an-row + __anQA + আইকন-প্রি-উপস্থিতি)
- PRESERVE-মানচিত্র: bulk-bar ×১, data-bulk-all ×১, data-bulk-msg ×৩, forEach ×১ (সিগনেচার-পরিবর্তন-মাত্র),
  aria-label ২→৪, addEventListener ০→৪ (পৃষ্ঠায়-প্রথম <script>)
- হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (an276-স্টাইল-ব্লক — amber-পরিবার) + সঠিক-বাইট ×৩ hidden-গার্ড
"""
import re, sys

VIEW = 'admin/views/admin/notices/list.ejs'
view = open(VIEW, encoding='utf-8').read()
orig_len = len(view)

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def count(s, needle): return s.count(needle)

if 'anFilter276' in view:
    print('SKIP: anFilter276 পূর্ব-উপস্থিত — idempotent রান, কোনো-পরিবর্তন-নেই')
    sys.exit(0)

# ── FATAL-গার্ড: নেমস্পেস-শূন্যতা + আইকন-প্রি-উপস্থিতি ──
if re.search(r'\.an276-[a-z]', view): fatal('view-এ .an276- প্রি-উপস্থিত')
for tok in ('data-an-row', '__anQA', 'anZero276', 'anInstant276'):
    if tok in view: fatal(f'view-এ {tok} প্রি-উপস্থিত')
for ico in ('fa-filter', 'fa-times', 'fa-xmark'):
    if ico in view: fatal(f'আইকন {ico} প্রি-উপস্থিত (সংঘর্ষ-ঝুঁকি)')

# ── PRESERVE-পূর্ব-গণনা ──
pre = {
    'bulkbar': count(view, 'bulk-bar'),
    'bulkall': count(view, 'data-bulk-all'),
    'bulkmsg': count(view, 'data-bulk-msg'),
    'foreach': count(view, 'forEach'),
    'ael': count(view, '.addEventListener('),
    'arialabel': count(view, 'aria-label'),
    'fatimes': count(view, 'fa-times'),
    'script': count(view, '<script'),
    'empty': count(view, 'notices.length === 0'),
    'rowforeach': count(view, 'notices.forEach(n => {'),
    'bodyclose': count(view, '</body>'),
    'bulkform': count(view, 'action="/admin/notices/bulk-delete"'),
    'editlinks': count(view, '/edit"'),
    'deleterows': count(view, '_method=DELETE'),
}
for k in ('rowforeach', 'bodyclose', 'empty', 'bulkall'):
    if pre[k] != 1: fatal(f"অ্যাঙ্কর {k} অনন্য-নয় (n={pre[k]})")
if pre['bulkbar'] != 1: fatal(f"bulk-bar ×১ প্রত্যাশিত, পাওয়া {pre['bulkbar']}")
if pre['bulkmsg'] != 3: fatal(f"data-bulk-msg ×৩ প্রত্যাশিত, পাওয়া {pre['bulkmsg']}")
if pre['script'] != 0: fatal(f"পৃষ্ঠায় প্রি-script ×০ প্রত্যাশিত, পাওয়া {pre['script']}")
if pre['ael'] != 0: fatal(f"পৃষ্ঠায় প্রি-addEventListener ×০ প্রত্যাশিত, পাওয়া {pre['ael']}")

# ══════════════════════════════════════════════════════════════════════════════
# E1 — সূচক + kw গণনা + সারি-অ্যাট্রিবিউট
# ══════════════════════════════════════════════════════════════════════════════
ROW_ANCHOR = """      <% notices.forEach(n => { %>
        <tr>"""
ROW_NEW = """      <% notices.forEach((n, anI276) => { %>
        <%# session276 — an276 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড) %>
        <% const anKw276 = [
             '#' + n.id,
             'বিজ্ঞপ্তি notice',
             'শিরোনাম title', String(n.title || '').replace(/\\s+/g, ' '),
             'ক্যাটাগরি category', String(n.category || '').replace(/\\s+/g, ' '),
             'তারিখ date', String(n.date || '').replace(/\\s+/g, ' ')
           ].filter(Boolean).join(' '); %>
        <tr data-an-row="<%= anI276 %>" data-kw="<%= anKw276 %>">"""
if count(view, ROW_ANCHOR) != 1: fatal('ROW_ANCHOR অনন্য-নয়')
view = view.replace(ROW_ANCHOR, ROW_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E2 — ফিল্টার-স্ট্রিপ (bulk-bar-এর-পরে; conditional-বাইরে — always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
STRIP_ANCHOR = """  </form>
  <% if (notices.length === 0) { %>"""
STRIP_NEW = """  </form>
  <%# ── session276 — an276 তাৎক্ষণিক-ফিল্টার (s275/s274-প্যাটার্ন-মিরর; একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা) ── %>
  <div class="an276-instant" id="anInstant276">
    <i class="fas fa-filter an276-ico" aria-hidden="true"></i>
    <input type="text" id="anFilter276" class="an276-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ক্যাটাগরি / তারিখ" autocomplete="off" aria-label="বিজ্ঞপ্তি-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="anClear276" class="an276-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="an276-count-chip" id="anCount276" hidden></span>
    <span class="an276-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (notices.length === 0) { %>"""
if count(view, STRIP_ANCHOR) != 1: fatal('STRIP_ANCHOR অনন্য-নয়')
view = view.replace(STRIP_ANCHOR, STRIP_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E3 — শূন্য-অবস্থা + script + style (if/else-বন্ধের-পরে; </body>-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
TAIL_ANCHOR = """  <% } %>
</div>
</body>"""
TAIL_NEW = """  <% } %>
  <div class="an276-zero" id="anZero276" data-an-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো বিজ্ঞপ্তি মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
<script>
  (function () {
    /* session276 — an276 তাৎক্ষণিক-ফিল্টার (s275/s274-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __anQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; tr-সারফেস: tr[data-an-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-an-row]'));
    var input = document.getElementById('anFilter276');
    var clearBtn = document.getElementById('anClear276');
    var countChip = document.getElementById('anCount276');
    var zeroBox = document.getElementById('anZero276');
    if (!input) { return; }
    var total = rows.length;
    function anApply276() {
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
    function anClearFn276() {
      input.value = '';
      anApply276();
      input.blur();
    }
    input.addEventListener('input', anApply276);
    if (clearBtn) { clearBtn.addEventListener('click', anClearFn276); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); anClearFn276(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__anQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: anApply276,
      clear: anClearFn276
    };
  })();
</script>
<style>
    /* session276 — an276 তাৎক্ষণিক-ফিল্টার স্টাইল (s275-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; amber-পরিবার) */
    .an276-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .an276-ico { color: var(--lf-amber-600); opacity: .75; }
    .an276-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-amber-soft); transition: none; }
    .an276-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-amber-600) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-amber-600) 15%, transparent); }
    .an276-clear { border: 0; background: transparent; color: var(--lf-amber-600); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .an276-clear:hover { background: var(--lf-amber-soft); }
    .an276-clear:active { transform: scale(.96); }
    .an276-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-amber-ink); background: var(--lf-amber-soft-2); }
    .an276-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .an276-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-amber-600) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-amber-ink); background: var(--lf-white); }
    .an276-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-amber-600) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-amber-soft); }
    .an276-count-chip[hidden] { display: none; }
    .an276-zero[hidden] { display: none; }
    tr[data-an-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .an276-clear:active { transform: none; } }
    @media (max-width: 640px) { .an276-kbd-hint { display: none; } .an276-instant { padding: 9px 11px; } }
  </style>
</body>"""
if count(view, TAIL_ANCHOR) != 1: fatal('TAIL_ANCHOR অনন্য-নয়')
view = view.replace(TAIL_ANCHOR, TAIL_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# পোস্ট-অ্যাসার্ট (write-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
post = {
    'bulkbar': count(view, 'bulk-bar'),
    'bulkall': count(view, 'data-bulk-all'),
    'bulkmsg': count(view, 'data-bulk-msg'),
    'foreach': count(view, 'forEach'),
    'ael': count(view, '.addEventListener('),
    'arialabel': count(view, 'aria-label'),
    'fatimes': count(view, 'fa-times'),
    'faxmark': count(view, 'fa-xmark'),
    'fafilter': count(view, 'fa-filter'),
    'fafilterspace': count(view, 'fa-filter '),
    'fafcx': count(view, 'fa-filter-circle-xmark'),
    'script': count(view, '<script'),
    'empty': count(view, 'notices.length === 0'),
    'rowforeach': count(view, 'notices.forEach((n, anI276) => {'),
    'bulkform': count(view, 'action="/admin/notices/bulk-delete"'),
    'editlinks': count(view, '/edit"'),
    'deleterows': count(view, '_method=DELETE'),
    'ani': count(view, 'id="anInstant276"'), 'anf': count(view, 'id="anFilter276"'),
    'anc': count(view, 'id="anClear276"'), 'ancc': count(view, 'id="anCount276"'),
    'anz': count(view, 'id="anZero276"'),
    'hook': count(view, 'window.__anQA'),
    'anapply': count(view, 'anApply276'), 'anclearfn': count(view, 'anClearFn276'),
    'danrow': count(view, 'data-an-row="'), 'dakw': count(view, 'data-kw="'),
}
asserts = [
    ('data-an-row == data-kw (টেমপ্লেট ×১)', post['danrow'] == 1 and post['dakw'] == 1, f"{post['danrow']}/{post['dakw']}"),
    ('bulk-bar/data-bulk-all/data-bulk-msg/bulk-form অপরিবর্তিত', post['bulkbar'] == pre['bulkbar'] and post['bulkall'] == pre['bulkall'] and post['bulkmsg'] == pre['bulkmsg'] and post['bulkform'] == pre['bulkform'], f"{post['bulkbar']}/{post['bulkall']}/{post['bulkmsg']}/{post['bulkform']}"),
    ('edit/delete-রুট অপরিবর্তিত', post['editlinks'] == pre['editlinks'] and post['deleterows'] == pre['deleterows'], f"{post['editlinks']}/{post['deleterows']}"),
    ('forEach ১→২ (rows.forEach +১) + empty-শাখা অপরিবর্তিত', post['foreach'] == pre['foreach'] + 1 and post['rowforeach'] == 1 and post['empty'] == pre['empty'], f"{post['foreach']}/{post['rowforeach']}/{post['empty']}"),
    ('addEventListener ০→৪ (পৃষ্ঠায়-প্রথম script)', post['ael'] == pre['ael'] + 4, f"{pre['ael']}→{post['ael']}"),
    ('aria-label +২ (input+clear)', post['arialabel'] == pre['arialabel'] + 2, f"{pre['arialabel']}→{post['arialabel']}"),
    ('আইকন ×১-প্রতি-নতুন', post['fatimes'] == pre['fatimes'] + 1 and post['faxmark'] == 0 and post['fafilterspace'] == 1 and post['fafcx'] == 1 and post['fafilter'] == 2, f"ft={post['fatimes']} fx={post['faxmark']} ff={post['fafilter']} ffcx={post['fafcx']}"),
    ('<script> ০→১', post['script'] == pre['script'] + 1, f"{pre['script']}→{post['script']}"),
    ('স্ট্রিপ-উপাদান ×১-প্রতি-আইডি', post['ani'] == 1 and post['anf'] == 1 and post['anc'] == 1 and post['ancc'] == 1 and post['anz'] == 1, 'strip-elems'),
    ('__anQA হুক ×১', post['hook'] == 1, str(post['hook'])),
    ('anApply276 ×৪ (def+৩-রেফ) + anClearFn276 ×৪', post['anapply'] == 4 and post['anclearfn'] == 4, f"{post['anapply']}/{post['anclearfn']}"),
]
for name, cond, detail in asserts:
    if not cond: fatal(f'পোস্ট-অ্যাসার্ট ব্যর্থ: {name} ({detail})')

# হেক্স-শূন্য (an276-স্টাইল-ব্লক)
m = re.search(r'/\* session276 — an276 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', view, re.S)
if not m: fatal('স্টাইল-ব্লক-নিষ্কাশন ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', m.group(0))
if hexes: fatal(f'স্টাইল-ব্লকে হেক্স-রং: {hexes[:5]}')

# সঠিক-বাইট ×৩ hidden-গার্ড
for guard in ('.an276-count-chip[hidden] { display: none; }',
              '.an276-zero[hidden] { display: none; }',
              'tr[data-an-row][hidden] { display: none !important; }'):
    if guard not in view: fatal(f'hidden-গার্ড-বাইট অনুপস্থিত: {guard}')

open(VIEW, 'w', encoding='utf-8').write(view)
print(f'PATCHED: {VIEW} ({orig_len} → {len(view)} বাইট)')
print('  an276 সারফেস-যুক্ত + সঠিক-বাইট ×৩ + হেক্স-শূন্য + PRESERVE-মানচিত্র-গ্রিন')
