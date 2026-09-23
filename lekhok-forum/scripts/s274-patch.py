#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s274-patch.py — session274: সুপার-অ্যাডমিন তালিকা (/admin/super/admins) তাৎক্ষণিক-ফিল্টার sa274
su273/ch272-প্যাটার্ন-মিরর + **কার্ড-ভিত্তিক-সারফেস বিশেষায়ণ** (tr-নয় — div[data-sa-row])।

চুক্তি:
- skip-if-present idempotent (saFilter274 প্রাক-উপস্থিত → SKIP exit 0)
- in-memory-সম্পাদনা → সম্পূর্ণ-অ্যাসার্ট → তার-পরে write (প্যাচ-নিরাপত্তা-চুক্তি)
- FATAL-গার্ড: নেমস্পেস (.sa274-regex + data-sa-row + __saQA), অ্যাঙ্কর-অনন্যতা
- PRESERVE-মানচিত্র: aScopes প্রি৩→পোস্ট৪, isSelf অপরিবর্তিত ×৫, js-confirm প্রি৫→পোস্ট৫,
  addEventListener প্রি১→পোস্ট৫, SUPER_AREAS ×২ অপরিবর্তিত
- হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (sa274-স্টাইল-ব্লক) + সঠিক-বাইট ×৩ hidden-গার্ড
"""
import re, sys

VIEW = 'admin/views/admin/super/admins.ejs'
view = open(VIEW, encoding='utf-8').read()
orig_len = len(view)

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

if 'saFilter274' in view:
    print('SKIP: saFilter274 পূর্ব-উপস্থিত — idempotent রান, কোনো-পরিবর্তন-নেই')
    sys.exit(0)

def count(s, needle): return s.count(needle)

# ── FATAL-গার্ড: নেমস্পেস-শূন্যতা ──
if re.search(r'\.sa274-[a-z]', view): fatal('view-এ .sa274- প্রি-উপস্থিত')
for tok in ('data-sa-row', '__saQA', 'saZero274'):
    if tok in view: fatal(f'view-এ {tok} প্রি-উপস্থিত')

# ── PRESERVE-পূর্ব-গণনা ──
pre = {
    'ascopes': count(view, 'aScopes'),
    'isself': count(view, 'isSelf'),
    'jsconfirm': count(view, 'js-confirm'),
    'ael': count(view, '.addEventListener('),
    'superareas': count(view, 'SUPER_AREAS.forEach'),
    'card': count(view, 'card super-admin-card'),
    'foreach': count(view, 'admins.forEach(a => {'),
    'addform': count(view, 'action="/admin/super/admins/add"'),
    'removeform': count(view, '/remove"'),
    'bodyclose': count(view, '</body>'),
    'newadmin': count(view, '<%# ── নতুন অ্যাডমিন যুক্ত ── %>'),
}
for k in ('foreach', 'card', 'bodyclose', 'newadmin', 'addform'):
    if pre[k] != 1: fatal(f"অ্যাঙ্কর {k} অনন্য-নয় (n={pre[k]})")
if pre['removeform'] != 1: fatal(f"remove-ফর্ম-অ্যাঙ্কর অনন্য-নয় (n={pre['removeform']})")

# ══════════════════════════════════════════════════════════════════════════════
# E1 — সূচক + kw গণনা (scriptlet বিস্তার)
# ══════════════════════════════════════════════════════════════════════════════
KW_ANCHOR = """       const aScopes = (a.scopes && (() => { try { const x = JSON.parse(a.scopes); return Array.isArray(x) ? x : null; } catch (_) { return null; } })()) || null;
  %>"""
KW_NEW = """       const aScopes = (a.scopes && (() => { try { const x = JSON.parse(a.scopes); return Array.isArray(x) ? x : null; } catch (_) { return null; } })()) || null;
       /* session274 — sa274 দ্বিভাষিক data-kw (রোল/লক/2FA/স্কোপ-মান-অ্যালায়াসসহ — হোয়াইটস্পেস-নরমালাইজড) */
       const saKw274 = [
         '#' + a.id,
         'অ্যাডমিন admin',
         '@' + a.username,
         'নাম name', String(a.display_name || a.username || '').replace(/\\s+/g, ' '),
         'রোল role', a.role === 'superadmin' ? 'সুপার-এডমিন superadmin' : 'এডমিন admin',
         a.locked ? 'লকড locked' : 'আনলকড unlocked',
         a.totp_enabled ? '2FA totp দুই-স্তর' : '',
         aScopes ? 'স্কোপ scope ' + aScopes.join(' ') : 'স্কোপ scope সীমাহীন unlimited',
         'যুক্ত added ' + String(a.created_at || '').slice(0, 10)
       ].filter(Boolean).join(' ');
  %>"""
if count(view, KW_ANCHOR) != 1: fatal('KW_ANCHOR অনন্য-নয়')
view = view.replace(KW_ANCHOR, KW_NEW, 1)
view = view.replace('admins.forEach(a => {', 'admins.forEach((a, saI274) => {', 1)

# ══════════════════════════════════════════════════════════════════════════════
# E2 — কার্ড-সারফেস অ্যাট্রিবিউট
# ══════════════════════════════════════════════════════════════════════════════
CARD_ANCHOR = """<div class="card super-admin-card <%= a.locked ? 'is-locked' : '' %>">"""
CARD_NEW = """<div class="card super-admin-card <%= a.locked ? 'is-locked' : '' %>" data-sa-row="<%= saI274 %>" data-kw="<%= saKw274 %>">"""
if count(view, CARD_ANCHOR) != 1: fatal('CARD_ANCHOR অনন্য-নয়')
view = view.replace(CARD_ANCHOR, CARD_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E3 — ফিল্টার-স্ট্রিপ (অ্যাডমিন-অ্যাকাউন্ট section-head-এর-আগে; always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
STRIP_ANCHOR = '''  <div class="section-head"><h2>অ্যাডমিন অ্যাকাউন্ট</h2></div>'''
STRIP = '''  <%# ── session274 — sa274 তাৎক্ষণিক-ফিল্টার (su273/ch272-প্যাটার্ন-মিরর, একক-স্ট্রিপ, কার্ড-সারফেস) ── %>
  <div class="sa274-instant" id="saInstant274">
    <i class="fas fa-filter sa274-ico" aria-hidden="true"></i>
    <input type="text" id="saFilter274" class="sa274-input" placeholder="তাৎক্ষণিক ফিল্টার — রোল / নাম / স্কোপ / লক / 2FA" autocomplete="off" aria-label="অ্যাডমিন-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="saClear274" class="sa274-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="sa274-count-chip" id="saCount274" hidden></span>
    <span class="sa274-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>

''' + STRIP_ANCHOR
view = view.replace(STRIP_ANCHOR, STRIP, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E4 — শূন্য-অবস্থা (cards-loop-সমাপ্তির-পরে, নতুন-অ্যাডমিন section-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
ZERO = '''  <div class="sa274-zero" id="saZero274" data-sa-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো অ্যাডমিন মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>

  <%# ── নতুন অ্যাডমিন যুক্ত ── %>'''
view = view.replace('<%# ── নতুন অ্যাডমিন যুক্ত ── %>', ZERO, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E5 — script + style (</body>-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
BLOCK = '''<script>
  (function () {
    /* session274 — sa274 তাৎক্ষণিক-ফিল্টার (su273/ch272-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __saQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; কার্ড-ভিত্তিক: div[data-sa-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-sa-row]'));
    var input = document.getElementById('saFilter274');
    var clearBtn = document.getElementById('saClear274');
    var countChip = document.getElementById('saCount274');
    var zeroBox = document.getElementById('saZero274');
    if (!input) { return; }
    var total = rows.length;
    function saApply274() {
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
    function saClearFn274() {
      input.value = '';
      saApply274();
      input.blur();
    }
    input.addEventListener('input', saApply274);
    if (clearBtn) { clearBtn.addEventListener('click', saClearFn274); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); saClearFn274(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__saQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: saApply274,
      clear: saClearFn274
    };
  })();
</script>
<style>
    /* session274 — sa274 তাৎক্ষণিক-ফিল্টার স্টাইল (su273-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .sa274-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .sa274-ico { color: var(--lf-brandgreen); opacity: .75; }
    .sa274-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .sa274-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .sa274-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .sa274-clear:hover { background: var(--lf-brandgreen-soft); }
    .sa274-clear:active { transform: scale(.96); }
    .sa274-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .sa274-count-chip[hidden] { display: none; }
    .sa274-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .sa274-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .sa274-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .sa274-zero[hidden] { display: none; }
    [data-sa-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .sa274-clear:active { transform: none; } }
    @media (max-width: 640px) { .sa274-kbd-hint { display: none; } .sa274-instant { padding: 9px 11px; } }
  </style>
</body>'''
if count(view, '</body>') != 1: fatal('</body> অনন্য-নয়')
view = view.replace('</body>', BLOCK, 1)

# ══════════════════════════════════════════════════════════════════════════════
# পোস্ট-অ্যাসার্ট (write-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
post = {
    'ascopes': count(view, 'aScopes'),
    'isself': count(view, 'isSelf'),
    'jsconfirm': count(view, 'js-confirm'),
    'ael': count(view, '.addEventListener('),
    'superareas': count(view, 'SUPER_AREAS.forEach'),
    'card': count(view, 'card super-admin-card'),
    'strip': count(view, 'id="saInstant274"'),
    'filter': count(view, 'id="saFilter274"'),
    'clear': count(view, 'id="saClear274"'),
    'chip': count(view, 'id="saCount274"'),
    'zero': count(view, 'id="saZero274"'),
    'hook': count(view, 'window.__saQA'),
    'saapply': count(view, 'saApply274'),
    'saclearfn': count(view, 'saClearFn274'),
    'dsarow': count(view, 'data-sa-row="'),
    'dakw': count(view, 'data-kw="'),
}
asserts = [
    ('data-sa-row == data-kw (টেমপ্লেট-স্তর ×১)', post['dsarow'] == 1 and post['dakw'] == 1, f"{post['dsarow']}/{post['dakw']}"),
    ('aScopes প্রি৫→পোস্ট৭ (kw-জোড়া)', post['ascopes'] == pre['ascopes'] + 2, f"{pre['ascopes']}→{post['ascopes']}"),
    ('isSelf অপরিবর্তিত', post['isself'] == pre['isself'], str(post['isself'])),
    ('js-confirm অপরিবর্তিত', post['jsconfirm'] == pre['jsconfirm'], str(post['jsconfirm'])),
    ('SUPER_AREAS ×২ অপরিবর্তিত', post['superareas'] == pre['superareas'], str(post['superareas'])),
    ('card অ্যাঙ্কর অপরিবর্তিত', post['card'] == pre['card'], str(post['card'])),
    ('addEventListener প্রি১→পোস্ট৫', post['ael'] == pre['ael'] + 4, f"{pre['ael']}→{post['ael']}"),
    ('স্ট্রিপ-উপাদান ×১', post['strip'] == 1 and post['filter'] == 1 and post['clear'] == 1 and post['chip'] == 1 and post['zero'] == 1, 'strip-elems'),
    ('__saQA হুক ×১', post['hook'] == 1, str(post['hook'])),
    ('saApply274 ×৪ (def+৩-রেফ)', post['saapply'] == 4, str(post['saapply'])),
    ('saClearFn274 ×৪ (def+৩-রেফ)', post['saclearfn'] == 4, str(post['saclearfn'])),
]
for name, cond, detail in asserts:
    if not cond: fatal(f'পোস্ট-অ্যাসার্ট ব্যর্থ: {name} ({detail})')

# হেক্স-শূন্য (sa274-স্টাইল-ব্লক)
m = re.search(r'/\* session274 — sa274 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', view, re.S)
if not m: fatal('স্টাইল-ব্লক-নিষ্কাশন ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', m.group(0))
if hexes: fatal(f'স্টাইল-ব্লকে হেক্স-রং: {hexes[:5]}')

# সঠিক-বাইট ×৩ hidden-গার্ড
for guard in ('.sa274-count-chip[hidden] { display: none; }',
              '.sa274-zero[hidden] { display: none; }',
              '[data-sa-row][hidden] { display: none !important; }'):
    if guard not in view: fatal(f'hidden-গার্ড-বাইট অনুপস্থিত: {guard}')

# zero-box-আইকন-সংঘর্ষ
if count(view, 'fa-filter-circle-xmark') != 1: fatal('zero-box-আইকন-দ্বৈত (s271-গোটচা)')
if count(view, 'fa-filter ') != 1: fatal('fa-filter-দ্বৈত')

open(VIEW, 'w', encoding='utf-8').write(view)
print(f'PATCHED: {VIEW} ({orig_len} → {len(view)} বাইট)')
print('  data-sa-row/kw সারফেস-যুক্ত + সঠিক-বাইট ×৩ + হেক্স-শূন্য + PRESERVE-মানচিত্র-গ্রিন')
