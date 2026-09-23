#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s273-patch.py — session273: super-users (ইউজার তথ্য ও পাসওয়ার্ড সাপোর্ট) তাৎক্ষণিক-ফিল্টার su273
কনটেন্ট-রিভিশন-হিস্ট্রি ch272-প্যাটার্ন-মিরর (au270/av271-পরিবার)।

চুক্তি:
- skip-if-present idempotent (suFilter273 প্রাক-উপস্থিতি → SKIP exit 0)
- in-memory-সম্পাদনা → সম্পূর্ণ-অ্যাসার্ট → তার-পরে write (প্যাচ-নিরাপত্তা-চুক্তি)
- FATAL-গার্ড: নেমস্পেস (.su273-regex + data-su-row + __suQA), অ্যাঙ্কর-অনন্যতা, টোকেন ×৭
- PRESERVE-মানচিত্র (সম্পাদনা-প্রভাব-পূর্ব-গণনা): searchable ×১, applyFilter ×৪, us-gen ×২,
  ROLE_LABEL প্রি২→পোস্ট৩, STATUS_LABEL প্রি২→পোস্ট৩, must_change_password প্রি২→পোস্ট৩,
  totp_enabled প্রি১→পোস্ট২, addEventListener প্রি৫→পোস্ট৯
- হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (su273-স্টাইল-ব্লক)
- সঠিক-বাইট ×৩ hidden-গার্ড (grep -F-স্তর: tr[data-su-row][hidden] !important ইত্যাদি)
"""
import re, sys

VIEW = 'admin/views/admin/super/users.ejs'
TOKENS = 'public/assets/css/tokens.css'
ADMINCSS = 'public/assets/css/admin.css'

view = open(VIEW, encoding='utf-8').read()
orig_view = view

# ── skip-if-present (idempotent) ──────────────────────────────────────────────
if 'suFilter273' in view:
    print('SKIP: suFilter273 পূর্ব-উপস্থিত — idempotent রান, কোনো-পরিবর্তন-নেই')
    sys.exit(0)

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

# ── FATAL-গার্ড: নেমস্পেস-শূন্যতা ────────────────────────────────────────────
if re.search(r'\.su273-[a-z]', view): fatal('view-এ .su273- প্রি-উপস্থিত')
if re.search(r'\.su273-[a-z]', open(ADMINCSS, encoding='utf-8').read()): fatal('admin.css-এ .su273- প্রি-উপস্থিত')
for tok in ('data-su-row', '__suQA', 'suZero273'):
    if tok in view: fatal(f'view-এ {tok} প্রি-উপস্থিত')

# ── FATAL-গার্ড: টোকেন ×৭ ────────────────────────────────────────────────────
tcss = open(TOKENS, encoding='utf-8').read()
for t in ('--lf-fb-border', '--lf-white', '--lf-brandgreen', '--lf-brandgreen-soft',
          '--lf-brandgreen-soft-2', '--lf-brandgreen-deep', '--lf-slate'):
    if t + ':' not in tcss: fatal(f'tokens.css-এ {t} অনুপস্থিত')

# ── PRESERVE-পূর্ব-গণনা ───────────────────────────────────────────────────────
def count(s, needle): return s.count(needle)
pre = {
    'searchable': count(view, 'data-search="<%= searchable %>"'),
    'applyFilter': count(view, 'applyFilter'),
    'usgen': count(view, 'us-gen'),
    'rolelabel': count(view, 'ROLE_LABEL'),
    'statuslabel': count(view, 'STATUS_LABEL'),
    'mcp': count(view, 'must_change_password'),
    'totp': count(view, 'totp_enabled'),
    'ael': count(view, '.addEventListener('),
    'ustable': count(view, '<div class="us-table-wrap">'),
    'foreach': count(view, 'users.forEach(u => {'),
    'ge300': count(view, '<% if (users.length >= 300) { %>'),
    'bodyclose': count(view, '</body>'),
    'datasearch': count(view, 'data-search="'),
}
if pre['searchable'] != 1: fatal(f"searchable-অ্যাঙ্কর-অনন্যতা ব্যর্থ (n={pre['searchable']})")
if pre['foreach'] != 1: fatal(f"foreach-অ্যাঙ্কর-অনন্যতা ব্যর্থ (n={pre['foreach']})")
if pre['ustable'] != 1: fatal(f"us-table-wrap-অ্যাঙ্কর ব্যর্থ (n={pre['ustable']})")
if pre['ge300'] != 1: fatal(f"ge300-অ্যাঙ্কর ব্যর্থ (n={pre['ge300']})")
if pre['bodyclose'] != 1: fatal(f"bodyclose-অ্যাঙ্কর ব্যর্থ (n={pre['bodyclose']})")
if pre['datasearch'] != 1: fatal(f"data-search-গণনা ব্যর্থ (n={pre['datasearch']}) — kw-কভারেজ-তুলনা-অসম্ভব")

# ══════════════════════════════════════════════════════════════════════════════
# E1 — ফিল্টার-স্ট্রিপ (us-table-wrap-এর-আগে; always-rendered, card-বাইরে)
# ══════════════════════════════════════════════════════════════════════════════
STRIP = '''  <%# ── session273 — su273 তাৎক্ষণিক-ফিল্টার (au270/av271/ch272-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা) ── %>
  <div class="su273-instant" id="suInstant273">
    <i class="fas fa-filter su273-ico" aria-hidden="true"></i>
    <input type="text" id="suFilter273" class="su273-input" placeholder="তাৎক্ষণিক ফিল্টার — রোল / স্ট্যাটাস / নাম / ইমেইল / 2FA" autocomplete="off" aria-label="ইউজার-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="suClear273" class="su273-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="su273-count-chip" id="suCount273" hidden></span>
    <span class="su273-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>

  <div class="us-table-wrap">'''
view = view.replace('<div class="us-table-wrap">', STRIP, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E2 — forEach-সূচক
# ══════════════════════════════════════════════════════════════════════════════
view = view.replace('users.forEach(u => {', 'users.forEach((u, suI273) => {', 1)

# ══════════════════════════════════════════════════════════════════════════════
# E3 — data-kw গণনা (searchable-ব্লক-বিস্তার) + tr-সারফেস-অ্যাট্রিবিউট
# ══════════════════════════════════════════════════════════════════════════════
KW_ANCHOR = """            const searchable = [u.id, u.username, u.full_name, u.pen_name, u.email, u.phone, u.member_id]
              .filter(Boolean).join(' ').toLowerCase();
          %>"""
KW_NEW = """            const searchable = [u.id, u.username, u.full_name, u.pen_name, u.email, u.phone, u.member_id]
              .filter(Boolean).join(' ').toLowerCase();
            /* session273 — su273 দ্বিভাষিক data-kw (রোল/স্ট্যাটাস/টেম্পো/2FA/ইমেইল/ফোন/মেম্বার — হোয়াইটস্পেস-নরমালাইজড) */
            const suKw273 = [
              '#' + u.id,
              'ইউজার user',
              '@' + u.username,
              'নাম name', String(u.full_name || u.username || '').replace(/\\s+/g, ' '),
              u.pen_name ? 'কলমী penname ' + String(u.pen_name).replace(/\\s+/g, ' ') : '',
              'রোল role', ROLE_LABEL[u.role] || u.role,
              'স্ট্যাটাস status', STATUS_LABEL[u.status] || u.status,
              u.must_change_password ? 'টেম্পোরারি-সক্রিয় temporary অস্থায়ী' : 'স্বাভাবিক normal',
              u.totp_enabled ? '2FA totp দুই-স্তর' : '',
              u.email ? 'ইমেইল email ' + String(u.email).replace(/\\s+/g, ' ') : '',
              u.phone ? 'ফোন phone ' + String(u.phone).replace(/\\s+/g, ' ') : '',
              u.member_id ? 'মেম্বার member ' + u.member_id : ''
            ].filter(Boolean).join(' ');
          %>"""
if count(view, KW_ANCHOR) != 1: fatal('KW_ANCHOR অনন্য-নয়')
view = view.replace(KW_ANCHOR, KW_NEW, 1)

TR_ANCHOR = """<tr class="us-row <%= u.must_change_password ? 'us-row-temp' : '' %>" data-search="<%= searchable %>" data-uid="<%= u.id %>">"""
TR_NEW = """<tr class="us-row <%= u.must_change_password ? 'us-row-temp' : '' %>" data-search="<%= searchable %>" data-uid="<%= u.id %>" data-su-row="<%= suI273 %>" data-kw="<%= suKw273 %>">"""
if count(view, TR_ANCHOR) != 1: fatal('TR_ANCHOR অনন্য-নয়')
view = view.replace(TR_ANCHOR, TR_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E4 — শূন্য-অবস্থা (us-table-wrap-এর-পরে, ge300-অ্যাঙ্করের-আগে; always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
ZERO = '''  <div class="su273-zero" id="suZero273" data-su-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো ব্যবহারকারী মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>

  <% if (users.length >= 300) { %>'''
view = view.replace('<% if (users.length >= 300) { %>', ZERO, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E5 — script + style (</body>-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
BLOCK = '''<script>
  (function () {
    /* session273 — su273 তাৎক্ষণিক-ফিল্টার (au270/av271/ch272-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __suQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; বিদ্যমান us-সার্চ-ফিল্টার-অক্ষুণ্ণ — দুই-স্বাধীন-ডাইমেনশন) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-su-row]'));
    var input = document.getElementById('suFilter273');
    var clearBtn = document.getElementById('suClear273');
    var countChip = document.getElementById('suCount273');
    var zeroBox = document.getElementById('suZero273');
    if (!input) { return; }
    var total = rows.length;
    function suApply273() {
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
    function suClearFn273() {
      input.value = '';
      suApply273();
      input.blur();
    }
    input.addEventListener('input', suApply273);
    if (clearBtn) { clearBtn.addEventListener('click', suClearFn273); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); suClearFn273(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__suQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: suApply273,
      clear: suClearFn273
    };
  })();
</script>
<style>
    /* session273 — su273 তাৎক্ষণিক-ফিল্টার স্টাইল (au270-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .su273-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .su273-ico { color: var(--lf-brandgreen); opacity: .75; }
    .su273-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .su273-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .su273-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .su273-clear:hover { background: var(--lf-brandgreen-soft); }
    .su273-clear:active { transform: scale(.96); }
    .su273-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .su273-count-chip[hidden] { display: none; }
    .su273-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .su273-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .su273-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .su273-zero[hidden] { display: none; }
    tr[data-su-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .su273-clear:active { transform: none; } }
    @media (max-width: 640px) { .su273-kbd-hint { display: none; } .su273-instant { padding: 9px 11px; } }
  </style>
</body>'''
if count(view, '</body>') != 1: fatal('</body> অনন্য-নয়')
view = view.replace('</body>', BLOCK, 1)

# ══════════════════════════════════════════════════════════════════════════════
# পোস্ট-অ্যাসার্ট (write-এর-আগে — প্যাচ-নিরাপত্তা-চুক্তি)
# ══════════════════════════════════════════════════════════════════════════════
post = {
    'datasearch': count(view, 'data-search="'),
    'dasurow': count(view, 'data-su-row="'),
    'dakw': count(view, 'data-kw="'),
    'applyFilter': count(view, 'applyFilter'),
    'usgen': count(view, 'us-gen'),
    'rolelabel': count(view, 'ROLE_LABEL'),
    'statuslabel': count(view, 'STATUS_LABEL'),
    'mcp': count(view, 'must_change_password'),
    'totp': count(view, 'totp_enabled'),
    'ael': count(view, '.addEventListener('),
    'strip': count(view, 'id="suInstant273"'),
    'filter': count(view, 'id="suFilter273"'),
    'clear': count(view, 'id="suClear273"'),
    'chip': count(view, 'id="suCount273"'),
    'zero': count(view, 'id="suZero273"'),
    'hook': count(view, 'window.__suQA'),
    'suapply': count(view, 'suApply273'),
    'suclearfn': count(view, 'suClearFn273'),
}
exp = dict(pre)
exp.update({'datasearch': pre['datasearch'], 'strip': 1, 'filter': 1, 'clear': 1, 'chip': 1, 'zero': 1, 'hook': 1})
asserts = [
    ('data-su-row == data-search', post['dasurow'] == post['datasearch'], f"{post['dasurow']} vs {post['datasearch']}"),
    ('data-kw == data-search', post['dakw'] == post['datasearch'], f"{post['dakw']} vs {post['datasearch']}"),
    ('applyFilter অপরিবর্তিত', post['applyFilter'] == pre['applyFilter'], str(post['applyFilter'])),
    ('us-gen অপরিবর্তিত', post['usgen'] == pre['usgen'], str(post['usgen'])),
    ('ROLE_LABEL প্রি২→পোস্ট৩', post['rolelabel'] == pre['rolelabel'] + 1, f"{pre['rolelabel']}→{post['rolelabel']}"),
    ('STATUS_LABEL প্রি২→পোস্ট৩', post['statuslabel'] == pre['statuslabel'] + 1, f"{pre['statuslabel']}→{post['statuslabel']}"),
    ('must_change_password প্রি২→পোস্ট৩', post['mcp'] == pre['mcp'] + 1, f"{pre['mcp']}→{post['mcp']}"),
    ('totp_enabled প্রি১→পোস্ট২', post['totp'] == pre['totp'] + 1, f"{pre['totp']}→{post['totp']}"),
    ('addEventListener প্রি৫→পোস্ট৯', post['ael'] == pre['ael'] + 4, f"{pre['ael']}→{post['ael']}"),
    ('স্ট্রিপ-উপাদান ×১', post['strip'] == 1 and post['filter'] == 1 and post['clear'] == 1 and post['chip'] == 1 and post['zero'] == 1, 'strip-elems'),
    ('__suQA হুক ×১', post['hook'] == 1, str(post['hook'])),
    ('suApply273 ×৪ (def+৩-রেফ)', post['suapply'] == 4, str(post['suapply'])),
    ('suClearFn273 ×৪ (def+৩-রেফ)', post['suclearfn'] == 4, str(post['suclearfn'])),
]
for name, cond, detail in asserts:
    if not cond: fatal(f'পোস্ট-অ্যাসার্ট ব্যর্থ: {name} ({detail})')

# হেক্স-শূন্য (su273-স্টাইল-ব্লক)
m = re.search(r'/\* session273 — su273 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', view, re.S)
if not m: fatal('স্টাইল-ব্লক-নিষ্কাশন ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', m.group(0))
if hexes: fatal(f'স্টাইল-ব্লকে হেক্স-রং: {hexes[:5]}')

# সঠিক-বাইট ×৩ hidden-গার্ড (grep -F-সমতুল্য)
for guard in ('.su273-count-chip[hidden] { display: none; }',
              '.su273-zero[hidden] { display: none; }',
              'tr[data-su-row][hidden] { display: none !important; }'):
    if guard not in view: fatal(f'hidden-গার্ড-বাইট অনুপস্থিত: {guard}')

# zero-box-আইকন-সংঘর্ষ (fa-filter-circle-xmark পৃষ্ঠায় একক)
if count(view, 'fa-filter-circle-xmark') != 1: fatal('zero-box-আইকন-দ্বৈত (s271-গোটচা)')
if count(view, 'fa-filter ') != 1: fatal('fa-filter-দ্বৈত')

# write (শুধু-সব-অ্যাসার্ট-গ্রিন-হলে)
open(VIEW, 'w', encoding='utf-8').write(view)
print(f'PATCHED: {VIEW} ({len(orig_view)} → {len(view)} বাইট)')
print(f"  data-su-row/kw = {post['dasurow']} সারফেস")
print('  সঠিক-বাইট ×৩ + হেক্স-শূন্য + PRESERVE-মানচিত্র-গ্রিন')
