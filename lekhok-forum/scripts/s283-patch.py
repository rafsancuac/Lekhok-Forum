#!/usr/bin/env python3
# s283-patch.py — session283 (cron 403679): ক্যালেন্ডারে মাস-তালিকা-শর্টকাট ep283
# চুক্তি: idempotent (.ep283-মার্কার-গার্ড ×৪-এডিট) + প্রি/পোস্ট-অ্যাসার্ট
# এডিট-তালিকা:
#   ① epaper.ejs — ep-cal-month span → button (aria-haspopup/expanded — ক্লিকেবল-ট্রিগার)
#   ② epaper.ejs — ep-cal-grid-পরে ইন-কার্ড মাস-প্যানেল মার্কআপ (বছর-স্টেপার + ১২-মাস-গ্রিড)
#   ③ epaper.ejs — session283 মডিউল (avail-ম্যাপ + রেন্ডার + খোলা/বন্ধ + জাম্প + __ep283QA)
#   ④ epaper.css — ep283 ব্লক (হেক্স-শূন্য টোকেন-শুধু)
import sys, os, re

APP = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(APP)
EJS = os.path.join(APP, 'views', 'user', 'epaper.ejs')
CSS = os.path.join(APP, 'public', 'assets', 'css', 'epaper.css')

for f in (EJS, CSS):
    if not os.path.isfile(f):
        print('FATAL: missing file', f); sys.exit(1)

ej = open(EJS, encoding='utf-8').read()
cs = open(CSS, encoding='utf-8').read()
changed = 0

# ── ① মাস-লেবেল span → button ──
OLD_MONTH = '<span class="ep-cal-month" id="epCalMonth">—</span>'
NEW_MONTH = '<button type="button" class="ep-cal-month" id="epCalMonth" aria-haspopup="true" aria-expanded="false" title="মাস-তালিকা খুলুন">—</button>'
if NEW_MONTH in ej:
    print('skip-①: মাস-বাটন ইতোমধ্যে')
elif OLD_MONTH not in ej:
    print('FATAL: OLD_MONTH অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_MONTH)
    assert n == 1, 'OLD_MONTH ×%d' % n
    ej = ej.replace(OLD_MONTH, NEW_MONTH, 1)
    changed += 1
    print('ok-①: মাস-বাটন স্থাপিত')

# ── ② মাস-প্যানেল মার্কআপ ──
OLD_GRID = '        <div class="ep-cal-grid" id="epCalGrid"></div>\n'
NEW_GRID = (
    '        <div class="ep-cal-grid" id="epCalGrid"></div>\n'
    '        <div class="ep-cal-mpanel" id="epCalMPanel" hidden>\n'
    '          <div class="ep-cal-myear">\n'
    '            <button type="button" class="ep-cal-btn" id="epCalMYPrev" aria-label="আগের বছর"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>\n'
    '            <span class="ep-cal-mylabel" id="epCalMY">—</span>\n'
    '            <button type="button" class="ep-cal-btn" id="epCalMYNext" aria-label="পরের বছর"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>\n'
    '          </div>\n'
    '          <div class="ep-cal-mgrid" id="epCalMGrid" role="listbox" aria-label="মাস নির্বাচন"></div>\n'
    '        </div>\n'
)
if 'id="epCalMPanel"' in ej:
    assert 'id="epCalMGrid"' in ej and 'id="epCalMY"' in ej, 'মাস-প্যানেল-আংশিক'
    print('skip-②: মাস-প্যানেল ইতোমধ্যে')
elif OLD_GRID not in ej:
    print('FATAL: OLD_GRID অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_GRID)
    assert n == 1, 'OLD_GRID ×%d' % n
    ej = ej.replace(OLD_GRID, NEW_GRID, 1)
    changed += 1
    print('ok-②: মাস-প্যানেল স্থাপিত')

# ── ③ session283 মডিউল ──
JS_ANCHOR = (
    "  if (elCalNext) elCalNext.addEventListener('click', function () { calM--; if (calM < 0) { calM = 11; calY--; } calRender(); });\n"
    "\n"
    "  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */"
)
if 'window.__ep283QA' in ej:
    assert '__ep283QA' in ej and 'ep283Open' in ej, 'মডিউল-আংশিক'
    print('skip-③: ep283-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    MODULE = (
        "  if (elCalNext) elCalNext.addEventListener('click', function () { calM--; if (calM < 0) { calM = 11; calY--; } calRender(); });\n"
        "\n"
        "  /* ═══════════ session283 (cron 403679): ক্যালেন্ডারে মাস-তালিকা-শর্টকাট (ep283) ═══════════\n"
        "     মাস-লেবেল-ক্লিকে ইন-কার্ড ডিসক্লোজার-প্যানেল: বছর-স্টেপার + ১২-মাস-গ্রিড (তথ্য-আছে-মাস-ডট);\n"
        "     মাস-ক্লিকে সেই-মাসের প্রথম-সংরক্ষিত-দিনে calJump (দূর-মাসে এক-ক্লিক — prev/next-পুনরাবৃত্তি-শূন্য);\n"
        "     Escape/বাইরে-ক্লিকে-বন্ধ; ক্যালেন্ডার-বুট-চুক্তি অক্ষুণ্ণ; __ep283QA হুক। */\n"
        "  var elCalMPanel = document.getElementById('epCalMPanel');\n"
        "  var elCalMY = document.getElementById('epCalMY');\n"
        "  var elCalMYPrev = document.getElementById('epCalMYPrev');\n"
        "  var elCalMYNext = document.getElementById('epCalMYNext');\n"
        "  var elCalMGrid = document.getElementById('epCalMGrid');\n"
        "  var ep283Open = false, ep283Year = 0, ep283Last = '', ep283HasN = 0;\n"
        "  function ep283Avail() {\n"
        "    var m = {};\n"
        "    Object.keys(byDate).forEach(function (iso) {\n"
        "      var p = /^(\\d{4})-(\\d{2})/.exec(iso); if (!p) return;\n"
        "      var y = +p[1], mo = +p[2] - 1;\n"
        "      if (!m[y]) m[y] = {};\n"
        "      m[y][mo] = true;\n"
        "    });\n"
        "    return m;\n"
        "  }\n"
        "  function ep283Render() {\n"
        "    if (!elCalMGrid || !elCalMY) return;\n"
        "    var av = ep283Avail();\n"
        "    if (!ep283Year) ep283Year = calY || new Date().getFullYear();\n"
        "    elCalMY.textContent = bnDigits(ep283Year);\n"
        "    var frag = '', has = 0;\n"
        "    for (var mo = 0; mo < 12; mo++) {\n"
        "      var ok = !!(av[ep283Year] && av[ep283Year][mo]);\n"
        "      if (ok) has++;\n"
        "      var cur = (ep283Year === calY && mo === calM);\n"
        "      frag += '<button type=\"button\" class=\"ep-cal-m' + (ok ? ' has' : '') + (cur ? ' is-cur' : '') +\n"
        "        '\" data-m=\"' + mo + '\" role=\"option\"' + (ok ? '' : ' disabled') +\n"
        "        ' aria-selected=\"' + (cur ? 'true' : 'false') + '\">' + bnMonths279[mo].slice(0, 2) + '</button>';\n"
        "    }\n"
        "    elCalMGrid.innerHTML = frag;\n"
        "    ep283HasN = has;\n"
        "  }\n"
        "  function ep283OpenPanel() {\n"
        "    if (!elCalMPanel || ep283Open) return;\n"
        "    ep283Open = true;\n"
        "    ep283Year = calY;\n"
        "    ep283Render();\n"
        "    elCalMPanel.hidden = false;\n"
        "    if (elCalMonth) { elCalMonth.setAttribute('aria-expanded', 'true'); elCalMonth.classList.add('is-open'); }\n"
        "  }\n"
        "  function ep283ClosePanel() {\n"
        "    if (!elCalMPanel || !ep283Open) return;\n"
        "    ep283Open = false;\n"
        "    elCalMPanel.hidden = true;\n"
        "    if (elCalMonth) { elCalMonth.setAttribute('aria-expanded', 'false'); elCalMonth.classList.remove('is-open'); }\n"
        "  }\n"
        "  if (elCalMonth) elCalMonth.addEventListener('click', function () { ep283Open ? ep283ClosePanel() : ep283OpenPanel(); });\n"
        "  if (elCalMYPrev) elCalMYPrev.addEventListener('click', function () { ep283Year--; ep283Render(); });\n"
        "  if (elCalMYNext) elCalMYNext.addEventListener('click', function () { ep283Year++; ep283Render(); });\n"
        "  if (elCalMGrid) elCalMGrid.addEventListener('click', function (e) {\n"
        "    var b = e.target.closest('.ep-cal-m'); if (!b || b.disabled) return;\n"
        "    var mo = +b.getAttribute('data-m');\n"
        "    var pre = ep283Year + '-' + ('0' + (mo + 1)).slice(-2) + '-';\n"
        "    var first = Object.keys(byDate).filter(function (iso) { return String(iso).indexOf(pre) === 0; }).sort()[0];\n"
        "    if (!first) return;\n"
        "    ep283Last = first;\n"
        "    ep283ClosePanel();\n"
        "    calJump(first);\n"
        "  });\n"
        "  document.addEventListener('click', function (e) {\n"
        "    if (!ep283Open) return;\n"
        "    var card = elCalMPanel ? elCalMPanel.closest('.ep-cal280') : null;\n"
        "    if (card && card.contains(e.target)) return;\n"
        "    ep283ClosePanel();\n"
        "  });\n"
        "  document.addEventListener('keydown', function (e) {\n"
        "    if (e.key === 'Escape' && ep283Open) { e.preventDefault(); ep283ClosePanel(); }\n"
        "  });\n"
        "  /* session283 QA-হুক (__ep283QA — সারফেস-নেমস্পেস-রীতি; মাস-প্যানেল-প্রমাণ) */\n"
        "  window.__ep283QA = {\n"
        "    isOpen: function () { return ep283Open; },\n"
        "    year: function () { return ep283Year; },\n"
        "    has: function () { return ep283HasN; },\n"
        "    jumped: function () { return ep283Last; },\n"
        "    open: function () { ep283OpenPanel(); },\n"
        "    close: function () { ep283ClosePanel(); },\n"
        "    render: function () { ep283Render(); }\n"
        "  };\n"
        "\n"
        "  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */"
    )
    ej = ej.replace(JS_ANCHOR, MODULE, 1)
    changed += 1
    print('ok-③: ep283-মডিউল স্থাপিত')

# ── ④ epaper.css ep283-ব্লক ──
CSS_BLOCK = (
    '\n/* ═══ session283 — ক্যালেন্ডারে মাস-তালিকা-শর্টকাট (ep283 — হেক্স-শূন্য টোকেন-শুধু;\n'
    '       ইন-কার্ড ডিসক্লোজার: বছর-স্টেপার + ১২-মাস-গ্রিড + তথ্য-ডট + এক-ক্লিক-জাম্প) ═══ */\n'
    '.ep-cal-month { border: none; background: transparent; cursor: pointer; border-radius: 7px; padding: 3px 6px; transition: background .15s ease, color .15s ease; }\n'
    '.ep-cal-month:hover, .ep-cal-month.is-open { background: var(--lf-green-tint); color: var(--lf-brand-primary); }\n'
    '.ep-cal-month:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 1px; }\n'
    '.ep-cal-mpanel { border-top: 1px dashed var(--lf-ui-border-strong); margin-top: 9px; padding-top: 9px; animation: ep-cal-m-in .16s ease; }\n'
    '@keyframes ep-cal-m-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }\n'
    '.ep-cal-myear { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 7px; }\n'
    '.ep-cal-mylabel { font-family: var(--font-heading); font-size: .78rem; font-weight: 800; color: var(--lf-brand-primary); min-width: 64px; text-align: center; }\n'
    '.ep-cal-mgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }\n'
    '.ep-cal-m { position: relative; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .62rem; font-weight: 700; padding: 7px 0 8px; cursor: pointer; transition: background .12s ease, color .12s ease, border-color .12s ease; }\n'
    '.ep-cal-m:hover:not(:disabled) { background: var(--lf-green-tint); border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }\n'
    '.ep-cal-m:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }\n'
    '.ep-cal-m:disabled { opacity: .32; cursor: default; }\n'
    '.ep-cal-m.has::after { content: \'\'; position: absolute; left: 50%; bottom: 2px; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--lf-brand-primary); }\n'
    '.ep-cal-m.is-cur { background: var(--lf-brand-primary); border-color: var(--lf-brand-primary); color: var(--lf-white); font-weight: 800; }\n'
    '.ep-cal-m.is-cur::after { background: var(--lf-white); }\n'
    '@media (prefers-reduced-motion: reduce) { .ep-cal-mpanel { animation: none; } .ep-cal-month, .ep-cal-m { transition: none; } }\n'
)
if 'ep283 — হেক্স-শূন্য' in cs and '.ep-cal-mpanel' in cs:
    print('skip-④: css ep283-ব্লক ইতোমধ্যে')
else:
    if not cs.endswith('\n'):
        cs += '\n'
    cs += CSS_BLOCK
    changed += 1
    print('ok-④: css ep283-ব্লক স্থাপিত')

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('WROTE: %d-এডিট' % changed)
else:
    print('NOOP: সব-স্কিপ (idempotent ×২-প্রমাণ)')

# ── পোস্ট-অ্যাসার্ট ──
ej2 = open(EJS, encoding='utf-8').read()
cs2 = open(CSS, encoding='utf-8').read()
need_ejs = ['class="ep-cal-month" id="epCalMonth"', 'aria-haspopup="true"', 'id="epCalMPanel" hidden',
            'id="epCalMYPrev"', 'id="epCalMY"', 'id="epCalMYNext"', 'id="epCalMGrid"',
            'window.__ep283QA', 'ep283Open', 'ep283Avail', 'ep283Render', 'ep283OpenPanel', 'ep283ClosePanel',
            "e.key === 'Escape' && ep283Open", "ep283ClosePanel();\n    calJump(first);",
            'isOpen: function', 'year: function', 'has: function', 'jumped: function',
            "elCalMonth.setAttribute('aria-expanded', 'true')", "elCalMonth.setAttribute('aria-expanded', 'false')",
            "indexOf(pre) === 0", 'bnMonths279[mo].slice(0, 2)']
missing = [t for t in need_ejs if t not in ej2]
assert not missing, 'পোস্ট-অ্যাসার্ট-EJS-অনুপস্থিত: %r' % missing
B283 = cs2.split('═══ session283 — ক্যালেন্ডারে মাস-তালিকা-শর্টকাট', 1)[1]
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B283))
assert HEXN == 0, 'ep283-ব্লকে হেক্স %d' % HEXN
need_css = ['.ep-cal-month', '.ep-cal-mpanel', '.ep-cal-myear', '.ep-cal-mylabel', '.ep-cal-mgrid',
            '.ep-cal-m', '.ep-cal-m.has::after', '.ep-cal-m.is-cur', 'prefers-reduced-motion', '@keyframes ep-cal-m-in']
missing_c = [t for t in need_css if t not in B283]
assert not missing_c, 'পোস্ট-অ্যাসার্ট-CSS-অনুপস্থিত: %r' % missing_c
print('POST-ASSERT: সব-গ্রিন (EJS %d-টোকেন + CSS হেক্স-০)' % len(need_ejs))
