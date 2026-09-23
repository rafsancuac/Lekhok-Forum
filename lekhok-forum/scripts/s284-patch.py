#!/usr/bin/env python3
# s284-patch.py — session284 (cron 403679): মাস-প্যানেলে বছর-তালিকা-শর্টকাট ep284
# চুক্তি: idempotent (মার্কার-গার্ড ×৪-এডিট) + প্রি/পোস্ট-অ্যাসার্ট + বাইট-সত্য-উৎস (ডিসপ্লে-আর্টিফ্যাক্ট-প্রতিরোধ)
# এডিট-তালিকা:
#   ① epaper.ejs — ep-cal-mylabel span → button (aria-haspopup/expanded — বছর-তালিকা-ট্রিগার)
#   ② epaper.ejs — ep-cal-myear-পরে ইন-প্যানেল বছর-তালিকা-স্ট্রিপ মার্কআপ (epCalYList)
#   ③ epaper.ejs — session284 মডিউল (years-তালিকা + রেন্ডার + খোলা/বন্ধ + বছর-জাম্প + র‍্যাপার-সিঙ্ক + __ep284QA)
#   ④ epaper.css — ep284 ব্লক (হেক্স-শূন্য টোকেন-শুধু)
import sys, os

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

# ── ① বছর-লেবেল span → button ──
OLD_LBL = '<span class="ep-cal-mylabel" id="epCalMY">—</span>'
NEW_LBL = '<button type="button" class="ep-cal-mylabel" id="epCalMY" aria-haspopup="true" aria-expanded="false" title="বছর-তালিকা খুলুন">—</button>'
if NEW_LBL in ej:
    print('skip-①: বছর-লেবেল-বাটন ইতোমধ্যে')
elif OLD_LBL not in ej:
    print('FATAL: OLD_LBL অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_LBL)
    assert n == 1, 'OLD_LBL ×%d' % n
    ej = ej.replace(OLD_LBL, NEW_LBL, 1)
    changed += 1
    print('ok-①: বছর-লেবেল-বাটন স্থাপিত')

# ── ② বছর-তালিকা-স্ট্রিপ মার্কআপ ──
OLD_GRIDROW = '          </div>\n          <div class="ep-cal-mgrid" id="epCalMGrid" role="listbox" aria-label="মাস নির্বাচন"></div>\n'
NEW_GRIDROW = (
    '          </div>\n'
    '          <div class="ep-cal-ylist" id="epCalYList" role="listbox" aria-label="বছর নির্বাচন" hidden></div>\n'
    '          <div class="ep-cal-mgrid" id="epCalMGrid" role="listbox" aria-label="মাস নির্বাচন"></div>\n'
)
if 'id="epCalYList"' in ej:
    assert 'ep-cal-ylist' in ej, 'ylist-আংশিক'
    print('skip-②: বছর-তালিকা-স্ট্রিপ ইতোমধ্যে')
elif OLD_GRIDROW not in ej:
    print('FATAL: OLD_GRIDROW অ্যাঙ্কর-অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(OLD_GRIDROW)
    assert n == 1, 'OLD_GRIDROW ×%d' % n
    ej = ej.replace(OLD_GRIDROW, NEW_GRIDROW, 1)
    changed += 1
    print('ok-②: বছর-তালিকা-স্ট্রিপ স্থাপিত')

# ── ③ session284 মডিউল ──
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
MODULE = '''  /* ═══════════ session284 (cron 403679): মাস-প্যানেলে বছর-তালিকা-শর্টকাট (ep284) ═══════════
     বছর-লেবেল-ক্লিকে ইন-প্যানেল বছর-তালিকা-স্ট্রিপ (avail-উদ্ভূত — তথ্য-আছে-বছর-ই);
     বছর-ক্লিকে স্টেপার-জাম্প (ep283Year-সেট + ep283Render-পুনঃরেন্ডার — ±১-পুনরাবৃত্তি-শূন্য);
     প্যানেল-খোলা/বন্ধে স্ট্রিপ-সিঙ্ক (র‍্যাপার-স্তরে — ep283-ফাংশন-বডি-অস্পৃশ্য); __ep284QA হুক। */
  var elCalYList = document.getElementById('epCalYList');
  var ep284YOpen = false, ep284Last = '', ep284YearsN = 0;
  function ep284YearsList() {
    return Object.keys(ep283Avail()).map(Number).sort(function (a, b) { return b - a; });
  }
  function ep284Render() {
    if (!elCalYList) return;
    var ys = ep284YearsList();
    ep284YearsN = ys.length;
    var frag = '';
    for (var i = 0; i < ys.length; i++) {
      var y = ys[i], cur = (y === ep283Year);
      frag += '<button type="button" class="ep-cal-y' + (cur ? ' is-cur' : '') +
        '" data-y="' + y + '" role="option" aria-selected="' + (cur ? 'true' : 'false') + '">' + bnDigits(y) + '</button>';
    }
    elCalYList.innerHTML = frag;
  }
  function ep284OpenList() {
    if (!elCalYList || ep284YOpen) return;
    ep284YOpen = true;
    ep284Render();
    elCalYList.hidden = false;
    if (elCalMY) { elCalMY.setAttribute('aria-expanded', 'true'); elCalMY.classList.add('is-open'); }
  }
  function ep284CloseList() {
    if (!elCalYList || !ep284YOpen) return;
    ep284YOpen = false;
    elCalYList.hidden = true;
    if (elCalMY) { elCalMY.setAttribute('aria-expanded', 'false'); elCalMY.classList.remove('is-open'); }
  }
  if (elCalMY) elCalMY.addEventListener('click', function () { ep284YOpen ? ep284CloseList() : ep284OpenList(); });
  if (elCalYList) elCalYList.addEventListener('click', function (e) {
    var b = e.target.closest('.ep-cal-y'); if (!b) return;
    ep283Year = +b.getAttribute('data-y');
    ep284Last = String(ep283Year);
    ep283Render();
    ep284CloseList();
  });
  /* প্যানেল-খোলা/বন্ধ + রেন্ডার-সিঙ্ক — র‍্যাপার-স্তর (ep283OpenPanel/ep283ClosePanel/ep283Render-বডি-অস্পৃশ্য;
     ফাংশন-ডিক্লারেশন-বাইন্ডিং late-bound — পূর্ব-বাউন্ড হ্যান্ডলার-ও র‍্যাপার-ই দেখে) */
  var ep283OpenPanelBase = ep283OpenPanel;
  ep283OpenPanel = function () { ep283OpenPanelBase(); ep284CloseList(); };
  var ep283ClosePanelBase = ep283ClosePanel;
  ep283ClosePanel = function () { ep283ClosePanelBase(); ep284CloseList(); };
  var ep283RenderBase = ep283Render;
  ep283Render = function () { ep283RenderBase(); if (ep284YOpen) ep284Render(); };
  /* session284 QA-হুক (__ep284QA — সারফেস-নেমস্পেস-রীতি; বছর-তালিকা-প্রমাণ) */
  window.__ep284QA = {
    isOpen: function () { return ep284YOpen; },
    years: function () { return ep284YearsN; },
    year: function () { return ep283Year; },
    jumped: function () { return ep284Last; },
    open: function () { ep284OpenList(); },
    close: function () { ep284CloseList(); },
    render: function () { ep284Render(); }
  };

'''
if 'window.__ep284QA' in ej:
    assert '__ep284QA' in ej and 'ep284YOpen' in ej, 'মডিউল-আংশিক'
    print('skip-③: ep284-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    ej = ej.replace(JS_ANCHOR, MODULE + JS_ANCHOR, 1)
    changed += 1
    print('ok-③: ep284-মডিউল স্থাপিত')

# ── ④ epaper.css ep284 ব্লক (হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session284 — মাস-প্যানেলে বছর-তালিকা-শর্টকাট (ep284 — হেক্স-শূন্য টোকেন-শুধু;
       বছর-লেবেল-ট্রিগার + বছর-চিপ-স্ট্রিপ + এক-ক্লিক-বছর-জাম্প) ═══ */
.ep-cal-mylabel { border: none; background: transparent; cursor: pointer; border-radius: 7px; padding: 3px 8px; transition: background .15s ease, color .15s ease; }
.ep-cal-mylabel:hover, .ep-cal-mylabel.is-open { background: var(--lf-green-tint); }
.ep-cal-mylabel:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 1px; }
.ep-cal-ylist { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; border-top: 1px dashed var(--lf-ui-border-strong); margin-top: 2px; padding-top: 8px; margin-bottom: 8px; animation: ep-cal-y-in .16s ease; }
@keyframes ep-cal-y-in { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
.ep-cal-y { border: 1px solid var(--lf-ui-border-strong); border-radius: 7px; background: transparent; color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .68rem; font-weight: 700; padding: 5px 10px; cursor: pointer; transition: background .12s ease, color .12s ease, border-color .12s ease; }
.ep-cal-y:hover { background: var(--lf-green-tint); border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-cal-y:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }
.ep-cal-y.is-cur { background: var(--lf-brand-primary); border-color: var(--lf-brand-primary); color: var(--lf-white); font-weight: 800; }
@media (max-width: 640px) { .ep-cal-ylist { gap: 3px; } .ep-cal-y { padding: 4px 8px; font-size: .64rem; } }
@media (prefers-reduced-motion: reduce) { .ep-cal-ylist { animation: none; } .ep-cal-mylabel, .ep-cal-y { transition: none; } }
'''
if 'session284 — মাস-প্যানেলে বছর-তালিকা-শর্টকাট' in cs:
    assert '.ep-cal-ylist' in cs and '.ep-cal-y.is-cur' in cs, 'css-আংশিক'
    print('skip-④: ep284-সিএসএস-ব্লক ইতোমধ্যে')
else:
    cs = cs.rstrip('\n') + '\n' + CSS_BLOCK
    changed += 1
    print('ok-④: ep284-সিএসএস-ব্লক স্থাপিত')

# ── পোস্ট-অ্যাসার্ট (বাইট-সত্য-উৎস) ──
for tok in ('id="epCalYList"', 'ep-cal-ylist', 'window.__ep284QA',
            'function ep284YearsList', 'function ep284Render',
            'ep283OpenPanelBase', 'ep283ClosePanelBase', 'ep283RenderBase',
            'aria-haspopup="true" aria-expanded="false" title="বছর-তালিকা খুলুন"'):
    assert tok in ej, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (ejs): ' + tok
for tok in ('.ep-cal-ylist', '.ep-cal-y.is-cur', '@keyframes ep-cal-y-in',
            '.ep-cal-mylabel:focus-visible', 'prefers-reduced-motion'):
    assert tok in cs, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (css): ' + tok
import re
HEXTAIL = re.search(r'session284 — মাস-প্যানেলে বছর-তালিকা-শর্টকাট.*', cs, re.S).group(0)
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', HEXTAIL))
assert HEXN == 0, 'ep284-ব্লকে হেক্স %d' % HEXN

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('সম্পন্ন: %d-এডিট প্রয়োগ (idempotent-নিশ্চিত — পুনঃরানে skip ×৪)' % changed)
else:
    print('সম্পন্ন: শূন্য-এডিট (idempotent ×২-প্রমাণ — সব-skip)')
