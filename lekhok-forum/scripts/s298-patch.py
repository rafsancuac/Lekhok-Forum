#!/usr/bin/env python3
# s298-patch.py — session298: sections.ejs + home-leadership.ejs তাৎক্ষণিক-ফিল্টার lsf298 (session297-প্রস্তাব)
# চুক্তি: মার্কার-গার্ড-প্রথম + idempotent ×N (per-file skip) + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট
# ডিজাইন: cej294-রানটাইম-ইনডেক্স-প্যাটার্ন — প্রতি-apply-এ DOM-পুনঃস্ক্যান (sections: AJAX-re-render/আন্ডু-পরেও-নির্ভুল;
#         leadership: ইন-প্লেস-এডিটে লাইভ-টেক্সট-সমৃদ্ধি) + MutationObserver(childList+characterData-শুধু —
#         attribute-ওয়াচ-শূন্য → নিজের-hidden-লেখায়-লুপ-ঝুঁকি-শূন্য) + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-stopPropagation +
#         Enter-প্রথম-মিল-জাম্প (scroll+flash — ফোকাস-চুরি-শূন্য) + __lsf298QA হুক (রো-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি)
# [Mandatory-স্টাইল]: lsf298-স্টাইল-ব্লক হেক্স-শূন্য টোকেন-শুধু (brandgreen-পরিবার; cej294-মিরর) + স্ট্রিপ-হোভার +
#         ফোকাস-রিং (color-mix) + flash-outline + hidden-গার্ড !important + 640px-সংকোচন + reduced-motion-গার্ড
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PART = APP + '/admin/views/admin/partials/sections-list.ejs'
SECT = APP + '/admin/views/admin/sections.ejs'
LEAD = APP + '/admin/views/admin/home-leadership.ejs'
MARK = 'lsf298'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

def sub1(v, name, anchor, repl):
    if v.count(anchor) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, v.count(anchor)))
    return v.replace(anchor, repl, 1)

# ═══════════ শেয়ার্ড-ব্লক (দুই-সারফেস সমান-গঠন; flavor-মাত্র ভিন্ন) ═══════════

def strip_block(zero_txt, ph, aria, unit):
    return (
'  <!-- session298: lsf298 তাৎক্ষণিক-ফিল্টার (mo268/sb269/dcf293/cej294-পরিবার; form-বহির্ভূত; রানটাইম-ইনডেক্স) -->\n'
'  <div class="lsf298-instant" id="lsfStrip298">\n'
'    <i class="fas fa-filter lsf298-ico" aria-hidden="true"></i>\n'
'    <input type="text" id="lsfInput298" class="lsf298-input" placeholder="' + ph + '" aria-label="' + aria + '" autocomplete="off">\n'
'    <button type="button" id="lsfClear298" class="lsf298-clear" hidden aria-label="ফিল্টার পরিষ্কার"><i class="fas fa-xmark"></i></button>\n'
'    <span class="lsf298-count-chip" id="lsfCount298" hidden><i class="fas fa-list-ul" aria-hidden="true"></i> <span id="lsfCountTxt298">০ / ০</span></span>\n'
'    <span class="lsf298-kbd-hint"><kbd>F</kbd> খুঁজুন · <kbd>Enter</kbd> প্রথম-মিল · <kbd>Esc</kbd> পরিষ্কার</span>\n'
'  </div>\n'
'  <div class="lsf298-zero" id="lsfZero298" hidden><i class="fas fa-magnifying-glass-minus" aria-hidden="true"></i> ' + zero_txt + '</div>\n')

def style_block(row_cls):
    return (
'    /* session298 — lsf298 তাৎক্ষণিক-ফিল্টার স্টাইল (cej294-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */\n'
'    .lsf298-instant { position: relative; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); transition: border-color .15s, box-shadow .15s; }\n'
'    .lsf298-instant:hover { border-color: color-mix(in srgb, var(--lf-brandgreen-deep) 35%, transparent); box-shadow: 0 2px 10px color-mix(in srgb, var(--lf-slate) 8%, transparent); }\n'
'    .lsf298-ico { color: var(--lf-brandgreen-deep); opacity: .75; }\n'
'    .lsf298-input { flex: 1 1 240px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }\n'
'    .lsf298-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen-deep) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen-deep) 15%, transparent); }\n'
'    .lsf298-clear { border: 0; background: transparent; color: var(--lf-brandgreen-deep); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: background .12s, transform .12s; }\n'
'    .lsf298-clear:hover { background: var(--lf-brandgreen-soft); }\n'
'    .lsf298-clear:active { transform: scale(.96); }\n'
'    .lsf298-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft); }\n'
'    .lsf298-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }\n'
'    .lsf298-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen-deep) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }\n'
'    .lsf298-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen-deep) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }\n'
'    .lsf298-count-chip[hidden], .lsf298-zero[hidden], .lsf298-clear[hidden] { display: none; }\n'
'    ' + row_cls + '[hidden] { display: none !important; }\n'
'    ' + row_cls + '.lsf298-flash { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }\n'
'    @media (prefers-reduced-motion: reduce) { .lsf298-clear:active { transform: none; } .lsf298-instant { transition: none; } }\n'
'    @media (max-width: 640px) { .lsf298-kbd-hint { display: none; } .lsf298-instant { padding: 9px 11px; } }\n')

def js_block(surface, rowsel, unit, firstmatch_expr, live_expr, comment):
    return (
'<script>\n'
'(function () {\n'
"  'use strict';\n"
'  /* session298 — lsf298 তাৎক্ষণিক-ফিল্টার (' + surface + '-সারফেস; ' + comment + ' পরিবার: mo268/sb269/dcf293/cej294;\n'
'     MutationObserver (childList+characterData-শুধু — attribute-ওয়াচ-শূন্য → নিজের-hidden-লেখায়-লুপ-ঝুঁকি-শূন্য);\n'
'     countTxt-লেখা change-guarded (characterData-মিউটেশন-স্টর্ম-প্রতিরোধ)) */\n'
'  if (window.__lsf298wired) return; window.__lsf298wired = true;\n'
"  var input = document.getElementById('lsfInput298');\n"
"  var clearBtn = document.getElementById('lsfClear298');\n"
"  var countChip = document.getElementById('lsfCount298');\n"
"  var countTxt = document.getElementById('lsfCountTxt298');\n"
"  var zeroBox = document.getElementById('lsfZero298');\n"
'  if (!input) return;\n'
"  var bn298 = function (n) { return String(n).replace(/\\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); };\n"
"  var norm298 = function (s) { return (s || '').replace(/\\s+/g, ' ').trim().toLowerCase(); };\n"
'  var last298 = [], total298 = 0;\n'
'  function lsfActive298() { return !!(input.value || \'\').trim(); }\n'
"  function rows298() { return Array.prototype.slice.call(document.querySelectorAll('" + rowsel + "')); }\n"
'  function lsfApply298() {\n'
'    var q = norm298(input.value);\n'
'    var act = lsfActive298();\n'
'    var all = rows298();\n'
'    total298 = all.length;\n'
'    last298 = [];\n'
'    all.forEach(function (el) {\n'
'      var kw = el.getAttribute(\'data-kw\') || \'\';\n'
'      var live298 = \'\';' + live_expr + '\n'
'      var hit = !q || norm298(kw + live298).indexOf(q) !== -1;\n'
'      if (hit) { last298.push(el); el.setAttribute(\'data-lsf-hit298\', \'1\'); } else { el.removeAttribute(\'data-lsf-hit298\'); }\n'
'      if (act && !hit) { if (!el.hasAttribute(\'hidden\')) el.setAttribute(\'hidden\', \'\'); }\n'
'      else { if (el.hasAttribute(\'hidden\')) el.removeAttribute(\'hidden\'); }\n'
'    });\n'
'    if (countChip) { countChip.hidden = !act; }\n'
'    if (act && countTxt) { var nt = bn298(last298.length) + \' মিল · \' + bn298(total298) + \' ' + unit + '\'; if (countTxt.textContent !== nt) countTxt.textContent = nt; }\n'
'    if (clearBtn) { clearBtn.hidden = !act; }\n'
'    if (zeroBox) { zeroBox.hidden = !(act && last298.length === 0); }\n'
'    return last298.length;\n'
'  }\n'
'  function lsfClear298() { input.value = \'\'; lsfApply298(); try { input.blur(); } catch (e) {} }\n'
'  function lsfJumpFirst298() {\n'
'    if (!last298.length) return 0;\n'
'    var el = last298[0];\n'
'    try { el.scrollIntoView({ block: \'center\' }); } catch (e) {}\n'
'    el.classList.add(\'lsf298-flash\');\n'
'    setTimeout(function () { el.classList.remove(\'lsf298-flash\'); }, 1600);\n'
'    return 1;\n'
'  }\n'
"  input.addEventListener('input', lsfApply298);\n"
"  input.addEventListener('keydown', function (ev) {\n"
"    if (ev.key === 'Escape') { ev.stopPropagation(); lsfClear298(); }\n"
"    if (ev.key === 'Enter') { ev.preventDefault(); lsfJumpFirst298(); }\n"
'  });\n'
"  if (clearBtn) { clearBtn.addEventListener('click', lsfClear298); }\n"
"  document.addEventListener('keydown', function (ev) {\n"
"    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }\n"
'    var t = ev.target;\n'
"    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }\n"
'    ev.preventDefault();\n'
'    input.focus();\n'
'    input.select();\n'
'  });\n'
'  var lsfTimer298 = null;\n'
"  var host298 = document.querySelector('.admin-main');\n"
'  if (host298 && window.MutationObserver) {\n'
'    new MutationObserver(function () {\n'
'      if (lsfTimer298) return;\n'
'      lsfTimer298 = setTimeout(function () { lsfTimer298 = null; if (lsfActive298()) lsfApply298(); }, 140);\n'
"    }).observe(host298, { childList: true, subtree: true, characterData: true });\n"
'  }\n'
'  window.__lsf298QA = {\n'
"    surface: '" + surface + "',\n"
'    rows: function () { return rows298().length; },\n'
'    matches: function () { return last298.length; },\n'
'    total: function () { return total298; },\n'
'    active: lsfActive298,\n'
'    firstMatch: function () { return last298.length ? (' + firstmatch_expr + ') : null; },\n'
'    apply: lsfApply298,\n'
'    clear: lsfClear298,\n'
'    jumpFirst: lsfJumpFirst298\n'
'  };\n'
'})();\n'
'</script>\n')

LIVE_SECT = ''
LIVE_LEAD = (
' var nEl = el.querySelector(\'[data-role="name"]\');'
' var rEl = el.querySelector(\'[data-role="role"]\');'
' var bEl = el.querySelector(\'[data-role="bani"]\');'
' var tEl = el.querySelector(\'.hl-slot-tag\');'
' var vEl = el.querySelector(\'[data-role="visLabel"]\');'
' if (nEl) live298 += \' \' + nEl.textContent;'
' if (rEl) live298 += \' \' + rEl.textContent;'
' if (bEl) live298 += \' \' + bEl.textContent;'
' if (tEl) live298 += \' \' + tEl.textContent;'
' if (vEl) live298 += \' \' + vEl.textContent;'
)

JS_SECT = js_block('sections', '.sec-item[data-sec-id][data-lsf-row298]', 'আইটেম',
                   "last298[0].getAttribute('data-sec-id') || ''", LIVE_SECT,
                   'রানটাইম-ইনডেক্স: প্রতি-apply-এ DOM-পুনঃস্ক্যান → AJAX-re-render/আন্ডু-পরেও নির্ভুল —')
JS_LEAD = js_block('leadership', '.hl-slot[data-lsf-row298]', 'কার্ড',
                   "last298[0].getAttribute('data-slot') || last298[0].getAttribute('data-extra') || ''", LIVE_LEAD,
                   'ইন-প্লেস-এডিট-সচেতন: data-kw + লাইভ-টেক্সট (name/role/bani/tag/visLabel) সমৃদ্ধ-মিল —')

STRIP_SECT = strip_block('কোনো আইটেম মেলে-না — অন্য কীওয়ার্ড দিন',
                         'আইটেম খুঁজুন — শিরোনাম / বিবরণ / #আইডি…',
                         'সেকশন আইটেম ফিল্টার করুন', 'আইটেম')
STRIP_LEAD = strip_block('কোনো কার্ড মেলে-না — অন্য কীওয়ার্ড দিন',
                         'কার্ড খুঁজুন — নাম / পদবি / বাণী / স্লট-কী…',
                         'নেতৃত্ব-কার্ড ফিল্টার করুন', 'কার্ড')

# ═══════════ ফাইল-১: partials/sections-list.ejs (রো-কীওয়ার্ড) ═══════════
# (মার্কার = data-lsf-row298 — 'lsf298' contiguous partial-এ অনুপস্থিত; s298-রান-১-গোটচা)
v = rd(PART)
if 'data-lsf-row298' not in v:
    for NS in ('data-lsf-row298', 'data-lsf-skip298', '__lsf298QA'):
        if NS in v:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (partial-গার্ড)' % NS)
    A_ROW = '  <details class="sec-item" draggable="true" data-sec-id="<%= r.id %>">'
    E_ROW = ('  <details class="sec-item" draggable="true" data-sec-id="<%= r.id %>" data-lsf-row298="1" '
             'data-kw="<%= \'#\' + r.id + \' #\' + r.sort_order + \' \' + String(r.title||\'\').replace(/\\s+/g,\' \') '
             '+ \' \' + String(r.subtitle||\'\').replace(/\\s+/g,\' \') + \' \' + String(r.body||\'\').replace(/\\s+/g,\' \') '
             '+ \' \' + String(r.icon||\'\').replace(/\\s+/g,\' \') + \' \' + String(r.extra||\'\').replace(/\\s+/g,\' \') '
             '+ \' \' + (r.is_active ? \'দৃশ্যমান visible\' : \'লুকানো hidden\') + \' আইটেম item row\' %>">')
    A_ADD = '  <details class="sec-item" style="border-style:dashed;">'
    v = sub1(v, 'partial-রো', A_ROW, E_ROW)
    v = sub1(v, 'partial-অ্যাড', A_ADD, '  <details class="sec-item" style="border-style:dashed;" data-lsf-skip298="1">')
    wr(PART, v)
    print('partial: প্যাচড')
else:
    print('partial: মার্কার-উপস্থিত (skip)')

# ═══════════ ফাইল-২: sections.ejs (স্ট্রিপ + স্টাইল + JS) ═══════════
v = rd(SECT)
if MARK not in v:
    A_INC = "  <%- include('partials/sections-list', { rows: rows, active: active, SECTIONS: SECTIONS, BASE: (typeof moderatorView !== 'undefined' && moderatorView) ? '/moderator' : '/admin' }) %>"
    v = sub1(v, 'sections-include', A_INC, STRIP_SECT + '\n' + A_INC)
    A_STY = '  </style>\n</head>'
    v = sub1(v, 'sections-স্টাইল', A_STY, style_block('.sec-item') + '  </style>\n</head>')
    A_JS = '})();\n</script>\n</body>\n</html>'
    v = sub1(v, 'sections-JS', A_JS, '})();\n</script>\n' + JS_SECT + '</body>\n</html>')
    wr(SECT, v)
    print('sections.ejs: প্যাচড')
else:
    print('sections.ejs: মার্কার-উপস্থিত (skip)')

# ═══════════ ফাইল-৩: home-leadership.ejs (data-kw ×২ + স্ট্রিপ + স্টাইল + JS) ═══════════
v = rd(LEAD)
if MARK not in v:
    A_SLOT = """      <div class="hl-slot<%= hiddenSlots.includes(slot.key) ? ' vis-hidden' : '' %>" id="slot-<%= slot.key %>" data-slot="<%= slot.key %>">"""
    E_SLOT = """      <div class="hl-slot<%= hiddenSlots.includes(slot.key) ? ' vis-hidden' : '' %>" id="slot-<%= slot.key %>" data-slot="<%= slot.key %>" data-lsf-row298="1" data-kw="<%= slot.key + ' ' + String(slot.title||'').replace(/\\s+/g,' ') + ' ' + (hiddenSlots.includes(slot.key) ? 'লুকানো hidden' : 'দৃশ্যমান visible') + ' স্লট slot কার্ড card ' + String(displayName||'').replace(/\\s+/g,' ') + ' ' + String(m ? (m.role||'') : '').replace(/\\s+/g,' ') + ' ' + String(m ? (m.term_year||'') : '').replace(/\\s+/g,' ') + ' ' + String(shownBani||'').replace(/\\s+/g,' ').slice(0,300) %>">"""
    A_X = """      <div class="hl-slot<%= xActive ? '' : ' vis-hidden' %>" id="extra-<%= x.id %>" data-extra="<%= x.id %>">"""
    E_X = """      <div class="hl-slot<%= xActive ? '' : ' vis-hidden' %>" id="extra-<%= x.id %>" data-extra="<%= x.id %>" data-lsf-row298="1" data-kw="<%= 'অতিরিক্ত উপদেষ্টা extra advisor স্লট slot কার্ড card ' + (xActive ? 'দৃশ্যমান visible' : 'লুকানো hidden') + ' #' + x.id + ' ' + String(xName||'').replace(/\\s+/g,' ') + ' ' + String(x.role||'').replace(/\\s+/g,' ') + ' ' + String(x.term_year||'').replace(/\\s+/g,' ') + ' ' + String(xBani||'').replace(/\\s+/g,' ').slice(0,300) %>">"""
    A_TILE = """      <div class="hl-addtile" data-addtile data-group="<%= sec %>">"""
    E_TILE = """      <div class="hl-addtile" data-addtile data-group="<%= sec %>" data-lsf-skip298="1">"""
    A_FOR = "  <% ['legacy', 'current'].forEach(sec => { const secSlots = slots.filter(s => s.section === sec); %>"
    v = sub1(v, 'leadership-বেস-স্লট', A_SLOT, E_SLOT)
    v = sub1(v, 'leadership-এক্সট্রা', A_X, E_X)
    v = sub1(v, 'leadership-অ্যাডটাইল', A_TILE, E_TILE)
    v = sub1(v, 'leadership-স্ট্রিপ', A_FOR, STRIP_LEAD + '\n' + A_FOR)
    A_STY = '  </style>\n</head>'
    v = sub1(v, 'leadership-স্টাইল', A_STY, style_block('.hl-slot') + '  </style>\n</head>')
    A_JS = '})();\n</script>\n</body>\n</html>'
    v = sub1(v, 'leadership-JS', A_JS, '})();\n</script>\n' + JS_LEAD + '</body>\n</html>')
    wr(LEAD, v)
    print('home-leadership.ejs: প্যাচড')
else:
    print('home-leadership.ejs: মার্কার-উপস্থিত (skip)')

# ═══════════ পোস্ট-অ্যাসার্ট (ইউনিক-সম্পূর্ণ-লাইন + হেক্স-শূন্য + no-regression) ═══════════
def post(name, path, need, forbid):
    v = rd(path)
    for pat in need:
        if pat not in v:
            die('%s-পোস্ট: প্যাটার্ন-অনুপস্থিত: %s' % (name, pat))
    for pat in forbid:
        if pat in v:
            die('%s-পোস্ট: নিষিদ্ধ-প্যাটার্ন-উপস্থিত: %s' % (name, pat))

for name, path in (('sections', SECT), ('leadership', LEAD)):
    v = rd(path)
    m = re.search(r'/\* session298 — lsf298 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', v, re.S)
    if not m:
        die('%s-স্টাইল-ব্লক-অনুপস্থিত' % name)
    blk = m.group(0)
    hx = re.findall(r'#[0-9a-fA-F]{3,8}', blk)
    if hx:
        die('%s-স্টাইল-ব্লকে হেক্স ×%d: %s' % (name, len(hx), ','.join(hx[:4])))
    if blk.count('color-mix(in srgb, var(--lf-brandgreen-deep)') < 2:
        die('%s-স্টাইল: ফোকাস-রিং/হোভার color-mix-অনুপস্থিত' % name)

post('partial', PART,
     ['data-lsf-row298="1" data-kw=', 'data-lsf-skip298="1"', 'দৃশ্যমান visible', 'লুকানো hidden'],
     ['lsfStrip298', '__lsf298QA'])
post('sections', SECT,
     ['id="lsfStrip298"', 'id="lsfInput298"', 'id="lsfClear298"', 'id="lsfCount298"', 'id="lsfCountTxt298"',
      'id="lsfZero298"', 'window.__lsf298QA', "surface: 'sections'", 'lsf298-flash',
      "if (window.__lsf298wired) return; window.__lsf298wired = true;",
      "if (ev.key === 'Escape') { ev.stopPropagation(); lsfClear298(); }",
      "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)",
      '.sec-item[data-sec-id][data-lsf-row298]',
      'childList: true, subtree: true, characterData: true',
      'countTxt.textContent !== nt',
      "include('partials/sections-list'", 'reRenderList', 'bindForms', 'bindDrag', 'sec-tabs'],
     ['surface: \'leadership\''])
post('leadership', LEAD,
     ['id="lsfStrip298"', 'window.__lsf298QA', "surface: 'leadership'", 'lsf298-flash',
      "if (window.__lsf298wired) return; window.__lsf298wired = true;",
      '.hl-slot[data-lsf-row298]',
      'data-lsf-skip298="1"',
      'data-role="visLabel"',
      'childList: true, subtree: true, characterData: true',
      "wireCard", "data-vis", "hl-addtile", "home-leadership/visibility"],
     ["surface: 'sections'", 'data-sec-id'])

print('PATCH-OK s298 (partial + sections.ejs + home-leadership.ejs; পোস্ট-অ্যাসার্ট-গ্রিন)')
