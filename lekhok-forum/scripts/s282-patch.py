#!/usr/bin/env python3
# s282-patch.py — session282 (cron 403679): পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন ep282
# চুক্তি: idempotent (.ep282-মার্কার-গার্ড ×৩-এডিট) + প্রি/পোস্ট-অ্যাসার্ট + বাইট-সেফ
# এডিট-তালিকা:
#   ① epaper.ejs — ep-ps-wrap ব্লকে কম্বো-ট্রিগার + সার্চ-প্যানেল মার্কআপ (নেটিভ select অক্ষুণ্ণ)
#   ② epaper.ejs — syncPaperSelect-এ ps282SyncLabel() হুক (hoisted-ঘোষণা — বুট-পূর্ব-কল-নিরাপদ)
#   ③ epaper.ejs — মূল-IIFE-শেষে session282 কম্বো-মডিউল + __ep282QA হুক
#   ④ epaper.css — ep282 ব্লক (হেক্স-শূন্য টোকেন-শুধু)
import sys, os, re

APP = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(APP)  # lekhok-forum app root
EJS = os.path.join(APP, 'views', 'user', 'epaper.ejs')
CSS = os.path.join(APP, 'public', 'assets', 'css', 'epaper.css')

for f in (EJS, CSS):
    if not os.path.isfile(f):
        print('FATAL: missing file', f); sys.exit(1)

ej = open(EJS, encoding='utf-8').read()
cs = open(CSS, encoding='utf-8').read()
changed = 0

# ── ① কম্বো-মার্কআপ ──
OLD_HTML = (
    '        <div class="ep-ps-wrap">\n'
    '          <i class="fas fa-building-columns ep-ps-ico" aria-hidden="true"></i>\n'
    '          <select class="ep-paper-select" id="epPaperSelect" aria-label="পত্রিকা নির্বাচন"></select>\n'
    '        </div>'
)
NEW_HTML = (
    '        <div class="ep-ps-wrap" id="epPs282">\n'
    '          <i class="fas fa-building-columns ep-ps-ico" aria-hidden="true"></i>\n'
    '          <select class="ep-paper-select" id="epPaperSelect" aria-label="পত্রিকা নির্বাচন"></select>\n'
    '          <button type="button" class="ep-ps-combo" id="epPs282Btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="epPs282Opts" aria-label="পত্রিকা নির্বাচন — খুঁজে বেছে নিন">\n'
    '            <span class="ep-ps-combo-label is-empty" id="epPs282Label">পত্রিকা…</span>\n'
    '            <i class="fas fa-chevron-down ep-ps-combo-chev" aria-hidden="true"></i>\n'
    '          </button>\n'
    '          <div class="ep-ps-panel" id="epPs282Panel" hidden>\n'
    '            <div class="ep-ps-search">\n'
    '              <i class="fas fa-magnifying-glass" aria-hidden="true"></i>\n'
    '              <input type="search" id="epPs282Search" placeholder="নাম লিখে খুঁজুন…" aria-label="পত্রিকার নামে খুঁজুন" autocomplete="off" />\n'
    '              <button type="button" class="ep-ps-sclear" id="epPs282Clear" aria-label="খোঁজা মুছুন" hidden><i class="fas fa-xmark" aria-hidden="true"></i></button>\n'
    '            </div>\n'
    '            <div class="ep-ps-opts" id="epPs282Opts" role="listbox" aria-label="পত্রিকার তালিকা"></div>\n'
    '            <div class="ep-ps-empty" id="epPs282Empty" hidden role="status">কোনো পত্রিকা মেলেনি</div>\n'
    '          </div>\n'
    '        </div>'
)
if 'id="epPs282Btn"' in ej:
    assert 'id="epPs282Panel"' in ej and 'id="epPs282Opts"' in ej, 'ep282-মার্কআপ-আংশিক-অবস্থা'
    print('skip-①: কম্বো-মার্কআপ ইতোমধ্যে')
elif OLD_HTML not in ej:
    print('FATAL: OLD_HTML অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_HTML)
    assert n == 1, 'OLD_HTML ×%d — অনন্যতা-লঙ্ঘন' % n
    ej = ej.replace(OLD_HTML, NEW_HTML, 1)
    changed += 1
    print('ok-①: কম্বো-মার্কআপ স্থাপিত')

# ── ② syncPaperSelect-লেবেল-সিঙ্ক ──
OLD_SYNC = (
    '  function syncPaperSelect(p) {\n'
    '    if (!elPaperSel) return;\n'
    '    if (elPaperSel.value !== p.name) elPaperSel.value = p.name;\n'
    '  }'
)
NEW_SYNC = (
    '  function syncPaperSelect(p) {\n'
    '    if (!elPaperSel) return;\n'
    '    if (elPaperSel.value !== p.name) elPaperSel.value = p.name;\n'
    '    ps282SyncLabel(); // session282: কম্বো-ট্রিগার-লেবেল সিঙ্ক (hoisted-ঘোষণা — বুট-পূর্ব-কল-নিরাপদ)\n'
    '  }'
)
if 'ps282SyncLabel(); // session282' in ej:
    assert NEW_SYNC in ej, 'sync-আংশিক-অবস্থা'
    print('skip-②: syncPaperSelect-হুক ইতোমধ্যে')
elif OLD_SYNC not in ej:
    print('FATAL: OLD_SYNC অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_SYNC)
    assert n == 1, 'OLD_SYNC ×%d' % n
    ej = ej.replace(OLD_SYNC, NEW_SYNC, 1)
    changed += 1
    print('ok-②: syncPaperSelect-হুক স্থাপিত')

# ── ③ কম্বো-মডিউল (মূল-IIFE-শেষে) ──
JS_ANCHOR = '  calRender();\n})();\n</script>'
if 'window.__ep282QA' in ej:
    assert '__ep282QA' in ej and 'ep282Open' in ej, 'মডিউল-আংশিক-অবস্থা'
    print('skip-③: কম্বো-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    MODULE = (
        '  calRender();\n'
        '\n'
        '  /* ═══════════ session282 (cron 403679): পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন (ep282) ═══════════\n'
        '     নেটিভ #epPaperSelect = একক-উৎস (পূর্ব-জারি change-লজিক অক্ষুণ্ণ — ওভারলে-স্তর মাত্র);\n'
        '     কম্বো-ট্রিগার + সার্চ-প্যানেল (optgroup-হেডারসহ) + কী-বোর্ড (↑↓ নেভ, Enter-নির্বাচন, Escape-বন্ধ)\n'
        '     + বাইরে-ক্লিকে-বন্ধ; no-JS ফলব্যাকে নেটিভ select-ই থাকে (ep282-armed JS-যোগিত)। */\n'
        '  var elPsWrap = document.getElementById(\'epPs282\');\n'
        '  var elPsBtn = document.getElementById(\'epPs282Btn\');\n'
        '  var elPsLabel = document.getElementById(\'epPs282Label\');\n'
        '  var elPsPanel = document.getElementById(\'epPs282Panel\');\n'
        '  var elPsSearch = document.getElementById(\'epPs282Search\');\n'
        '  var elPsClear = document.getElementById(\'epPs282Clear\');\n'
        '  var elPsOpts = document.getElementById(\'epPs282Opts\');\n'
        '  var elPsEmpty = document.getElementById(\'epPs282Empty\');\n'
        '  var ep282Open = false, ep282Q = \'\', ep282Active = -1, ep282Picked = \'\', ep282VisibleN = 0;\n'
        '  function ps282Norm(s) { return String(s || \'\').toLowerCase().replace(/\\s+/g, \' \').trim(); }\n'
        '  function ps282SyncLabel() {\n'
        '    if (!elPsLabel || !elPaperSel) return;\n'
        '    var v = elPaperSel.value;\n'
        '    elPsLabel.textContent = v ? v : \'পত্রিকা…\';\n'
        '    elPsLabel.classList.toggle(\'is-empty\', !v);\n'
        '  }\n'
        '  function ps282Vis() { return elPsOpts ? Array.prototype.slice.call(elPsOpts.querySelectorAll(\'.ep-ps-opt\')) : []; }\n'
        '  function ps282Activate(i, silent) {\n'
        '    var vis = ps282Vis();\n'
        '    if (!vis.length) { ep282Active = -1; return; }\n'
        '    if (i < 0) i = vis.length - 1;\n'
        '    if (i >= vis.length) i = 0;\n'
        '    vis.forEach(function (b, j) { b.classList.toggle(\'is-act\', j === i); });\n'
        '    ep282Active = i;\n'
        '    if (!silent && vis[i].scrollIntoView) { try { vis[i].scrollIntoView({ block: \'nearest\' }); } catch (e) {} }\n'
        '  }\n'
        '  function ps282Render() {\n'
        '    if (!elPsOpts || !elPaperSel) return;\n'
        '    var q = ps282Norm(ep282Q), frag = \'\', n = 0, cur = elPaperSel.value, lastGrp = null;\n'
        '    var opts = elPaperSel.options;\n'
        '    for (var i = 0; i < opts.length; i++) {\n'
        '      var o = opts[i];\n'
        '      var og = o.parentNode && o.parentNode.tagName === \'OPTGROUP\' ? o.parentNode : null;\n'
        '      if (og) {\n'
        '        var g = og.getAttribute(\'label\') || \'\';\n'
        '        if (g !== lastGrp) { lastGrp = g; frag += \'<div class="ep-ps-grp">\' + g + \'</div>\'; }\n'
        '      }\n'
        '      var hit = !q || ps282Norm(o.value).indexOf(q) !== -1 || ps282Norm(o.textContent).indexOf(q) !== -1;\n'
        '      if (!hit) continue;\n'
        '      var sel = o.value === cur;\n'
        '      frag += \'<button type="button" class="ep-ps-opt\' + (sel ? \' is-sel\' : \'\') + \'" role="option" data-v="\' +\n'
        '        o.value.replace(/"/g, \'&quot;\') + \'" aria-selected="\' + (sel ? \'true\' : \'false\') + \'">\' + o.textContent + \'</button>\';\n'
        '      n++;\n'
        '    }\n'
        '    elPsOpts.innerHTML = frag;\n'
        '    ep282VisibleN = n;\n'
        '    ep282Active = -1;\n'
        '    if (elPsEmpty) elPsEmpty.hidden = n > 0;\n'
        '    if (elPsOpts) elPsOpts.hidden = n === 0;\n'
        '    ps282Activate(0, true);\n'
        '  }\n'
        '  function ps282OpenPanel() {\n'
        '    if (!elPsPanel || ep282Open) return;\n'
        '    ep282Open = true; ep282Q = \'\';\n'
        '    if (elPsSearch) elPsSearch.value = \'\';\n'
        '    if (elPsClear) elPsClear.hidden = true;\n'
        '    elPsPanel.hidden = false;\n'
        '    if (elPsBtn) { elPsBtn.setAttribute(\'aria-expanded\', \'true\'); elPsBtn.classList.add(\'is-open\'); }\n'
        '    ps282Render();\n'
        '    if (elPsSearch) { try { elPsSearch.focus(); } catch (e) {} }\n'
        '  }\n'
        '  function ps282Close() {\n'
        '    if (!elPsPanel || !ep282Open) return;\n'
        '    ep282Open = false;\n'
        '    elPsPanel.hidden = true;\n'
        '    if (elPsBtn) { elPsBtn.setAttribute(\'aria-expanded\', \'false\'); elPsBtn.classList.remove(\'is-open\'); }\n'
        '  }\n'
        '  function ps282Pick(name) {\n'
        '    if (!name || !elPaperSel) return;\n'
        '    ep282Picked = name;\n'
        '    if (elPaperSel.value !== name) elPaperSel.value = name;\n'
        '    try { elPaperSel.dispatchEvent(new Event(\'change\')); } catch (e) {}\n'
        '    ps282SyncLabel();\n'
        '    ps282Close();\n'
        '  }\n'
        '  if (elPsBtn) elPsBtn.addEventListener(\'click\', function () { ep282Open ? ps282Close() : ps282OpenPanel(); });\n'
        '  if (elPsSearch) elPsSearch.addEventListener(\'input\', function () {\n'
        '    ep282Q = elPsSearch.value;\n'
        '    if (elPsClear) elPsClear.hidden = !ep282Q;\n'
        '    ps282Render();\n'
        '  });\n'
        '  if (elPsSearch) elPsSearch.addEventListener(\'keydown\', function (e) {\n'
        '    if (e.key === \'ArrowDown\') { e.preventDefault(); ps282Activate(ep282Active + 1); }\n'
        '    else if (e.key === \'ArrowUp\') { e.preventDefault(); ps282Activate(ep282Active - 1); }\n'
        '    else if (e.key === \'Enter\') {\n'
        '      e.preventDefault();\n'
        '      var vis = ps282Vis();\n'
        '      if (ep282Active >= 0 && vis[ep282Active]) ps282Pick(vis[ep282Active].getAttribute(\'data-v\'));\n'
        '    } else if (e.key === \'Escape\') { e.preventDefault(); ps282Close(); }\n'
        '  });\n'
        '  if (elPsClear) elPsClear.addEventListener(\'click\', function () {\n'
        '    ep282Q = \'\';\n'
        '    if (elPsSearch) { elPsSearch.value = \'\'; try { elPsSearch.focus(); } catch (e) {} }\n'
        '    if (elPsClear) elPsClear.hidden = true;\n'
        '    ps282Render();\n'
        '  });\n'
        '  if (elPsOpts) elPsOpts.addEventListener(\'click\', function (e) {\n'
        '    var b = e.target.closest(\'.ep-ps-opt\'); if (!b) return;\n'
        '    ps282Pick(b.getAttribute(\'data-v\'));\n'
        '  });\n'
        '  document.addEventListener(\'click\', function (e) {\n'
        '    if (!ep282Open || !elPsWrap) return;\n'
        '    if (elPsWrap.contains(e.target)) return;\n'
        '    ps282Close();\n'
        '  });\n'
        '  if (elPaperSel) elPaperSel.addEventListener(\'change\', ps282SyncLabel);\n'
        '  if (elPsWrap) elPsWrap.classList.add(\'ep282-armed\');\n'
        '  ps282SyncLabel();\n'
        '  /* session282 QA-হুক (__ep282QA — সারফেস-নেমস্পেস-রীতি; কম্বো-প্রমাণ) */\n'
        '  window.__ep282QA = {\n'
        '    isOpen: function () { return ep282Open; },\n'
        '    visible: function () { return ep282VisibleN; },\n'
        '    query: function () { return ep282Q; },\n'
        '    picked: function () { return ep282Picked; },\n'
        '    active: function () { return ep282Active; },\n'
        '    open: function () { ps282OpenPanel(); },\n'
        '    close: function () { ps282Close(); },\n'
        '    render: function () { ps282Render(); },\n'
        '    pick: function (i) { var v = ps282Vis()[i]; if (v) ps282Pick(v.getAttribute(\'data-v\')); },\n'
        '    label: function () { return elPsLabel ? elPsLabel.textContent : \'\'; },\n'
        '    options: function () { return elPaperSel ? elPaperSel.options.length : 0; }\n'
        '  };\n'
        '})();\n'
        '</script>'
    )
    ej = ej.replace(JS_ANCHOR, MODULE, 1)
    changed += 1
    print('ok-③: কম্বো-মডিউল স্থাপিত')

# ── ④ epaper.css ep282-ব্লক ──
CSS_BLOCK = (
    '\n/* ═══ session282 — পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন (ep282 — হেক্স-শূন্য টোকেন-শুধু;\n'
    '       নেটিভ-select-ওভারলে কম্বো: ট্রিগার + সার্চ-প্যানেল + কী-বোর্ড-নেভিগেশন; no-JS ফলব্যাক) ═══ */\n'
    '.ep-ps-combo { display: none; align-items: center; gap: 8px; min-width: 0; max-width: 240px; height: 34px; padding: 0 12px 0 28px; border: 2px solid var(--lf-brand-primary); border-radius: 9px; background: var(--lf-ui-surface); color: var(--lf-brand-primary); font-family: var(--font-heading); font-size: .8rem; font-weight: 800; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: background .15s ease, box-shadow .15s ease, border-color .15s ease; }\n'
    '.ep-ps-combo:hover { background: var(--lf-green-tint); box-shadow: 0 2px 6px rgba(0,0,0,.12); }\n'
    '.ep-ps-combo:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 2px; }\n'
    '.ep-ps-combo.is-open { background: var(--lf-green-tint); border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,.12); }\n'
    '.ep-ps-combo-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n'
    '.ep-ps-combo-label.is-empty { color: var(--lf-text-tertiary); font-weight: 700; }\n'
    '.ep-ps-combo-chev { flex: 0 0 auto; font-size: .62rem; transition: transform .18s ease; opacity: .8; }\n'
    '.ep-ps-combo.is-open .ep-ps-combo-chev { transform: rotate(180deg); }\n'
    '.ep-ps-wrap.ep282-armed .ep-paper-select { display: none; }\n'
    '.ep-ps-wrap.ep282-armed .ep-ps-combo { display: inline-flex; }\n'
    '.ep-ps-panel { position: absolute; top: calc(100% + 6px); left: 0; z-index: 70; width: max-content; min-width: 268px; max-width: min(340px, calc(100vw - 28px)); background: var(--lf-ui-surface); border: 1px solid var(--lf-ui-border-strong); border-radius: 12px; box-shadow: 0 14px 34px rgba(0,0,0,.16); overflow: hidden; animation: ep-ps-in .16s ease; }\n'
    '@keyframes ep-ps-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }\n'
    '.ep-ps-search { display: flex; align-items: center; gap: 7px; padding: 9px 10px; border-bottom: 1px solid var(--lf-ui-border); background: var(--lf-green-tint); }\n'
    '.ep-ps-search i { color: var(--lf-brand-primary); font-size: .74rem; }\n'
    '.ep-ps-search input { flex: 1 1 auto; min-width: 0; height: 30px; border: 1px solid var(--lf-ui-border-strong); border-radius: 8px; background: var(--lf-ui-surface); color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .76rem; font-weight: 700; padding: 0 9px; }\n'
    '.ep-ps-search input::placeholder { color: var(--lf-text-tertiary); font-weight: 700; }\n'
    '.ep-ps-search input:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 1px; }\n'
    '.ep-ps-sclear { width: 24px; height: 24px; flex: 0 0 auto; border: none; background: transparent; color: var(--lf-text-tertiary); border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background .15s ease, color .15s ease; }\n'
    '.ep-ps-sclear:hover { background: var(--lf-ui-surface); color: var(--lf-brand-primary); }\n'
    '.ep-ps-opts { max-height: 46vh; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 2px; }\n'
    '.ep-ps-opts::-webkit-scrollbar { width: 8px; }\n'
    '.ep-ps-opts::-webkit-scrollbar-thumb { background: var(--lf-ui-border-strong); border-radius: 8px; }\n'
    '.ep-ps-grp { font-family: var(--font-heading); font-size: .6rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--lf-text-tertiary); padding: 7px 8px 3px; }\n'
    '.ep-ps-opt { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 7px 9px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .78rem; font-weight: 700; cursor: pointer; transition: background .12s ease, color .12s ease; }\n'
    '.ep-ps-opt:hover, .ep-ps-opt.is-act { background: var(--lf-green-tint); color: var(--lf-brand-primary); }\n'
    '.ep-ps-opt:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }\n'
    '.ep-ps-opt.is-sel { color: var(--lf-brand-primary); font-weight: 800; }\n'
    '.ep-ps-opt.is-sel::after { content: \'\\2713\'; font-size: .7rem; font-weight: 900; }\n'
    '.ep-ps-empty { padding: 14px 12px; font-family: var(--font-heading); font-size: .74rem; font-weight: 700; color: var(--lf-text-tertiary); text-align: center; }\n'
    '@media (max-width: 600px) { .ep-ps-combo { max-width: 150px; font-size: .74rem; } .ep-ps-panel { min-width: 236px; } }\n'
    '@media (prefers-reduced-motion: reduce) { .ep-ps-panel { animation: none; } .ep-ps-combo-chev { transition: none; } .ep-ps-opt, .ep-ps-sclear, .ep-ps-combo { transition: none; } }\n'
)
if 'ep282-armed .ep-ps-combo' in cs:
    assert 'session282 — পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন' in cs, 'css-আংশিক-অবস্থা'
    print('skip-④: css ep282-ব্লক ইতোমধ্যে')
else:
    if not cs.endswith('\n'):
        cs += '\n'
    cs += CSS_BLOCK
    changed += 1
    print('ok-④: css ep282-ব্লক স্থাপিত')

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('WROTE: %d-এডিট' % changed)
else:
    print('NOOP: সব-স্কিপ (idempotent ×২-প্রমাণ)')

# ── পোস্ট-অ্যাসার্ট ──
ej2 = open(EJS, encoding='utf-8').read()
cs2 = open(CSS, encoding='utf-8').read()
need_ejs = ['id="epPs282Btn"', 'id="epPs282Panel"', 'id="epPs282Search"', 'id="epPs282Opts"', 'id="epPs282Empty"',
            'ep282-armed', 'window.__ep282QA', 'ps282SyncLabel(); // session282', "ps282Pick(b.getAttribute",
            'isOpen: function', 'visible: function', 'picked: function', 'active: function', 'open: function',
            'close: function', 'render: function', 'pick: function', 'label: function', 'options: function',
            "dispatchEvent(new Event('change'))", 'ps282Norm', 'ps282Activate', 'ps282OpenPanel', 'ps282Close']
missing = [t for t in need_ejs if t not in ej2]
assert not missing, 'পোস্ট-অ্যাসার্ট-EJS-অনুপস্থিত: %r' % missing
B282 = cs2.split('═══ session282 — পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন', 1)[1]
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B282))
assert HEXN == 0, 'ep282-ব্লকে হেক্স %d' % HEXN
need_css = ['.ep-ps-combo', 'ep282-armed .ep-paper-select', 'ep282-armed .ep-ps-combo', '.ep-ps-opts',
            'prefers-reduced-motion', '@keyframes ep-ps-in', '.ep-ps-opt.is-sel::after', '.ep-ps-empty']
missing_c = [t for t in need_css if t not in B282]
assert not missing_c, 'পোস্ট-অ্যাসার্ট-CSS-অনুপস্থিত: %r' % missing_c
print('POST-ASSERT: সব-গ্রিন (EJS %d-টোকেন + CSS হেক্স-০)' % len(need_ejs))
