#!/usr/bin/env python3
# s286-patch.py — session286 (cron 403679): মাস-গ্রিডে কী-বোর্ড-নেভিগেশন ep286
# চুক্তি: idempotent (মার্কার-গার্ড ×২-এডিট) + পোস্ট-অ্যাসার্ট + বাইট-সত্য-উৎস
# এডিট-তালিকা:
#   ① epaper.ejs — session286 মডিউল (৪-কলাম-গ্রিড-রোভিং ↑=-4/↓=+4/←→=±1 + skip-disabled-wrap +
#                   Home/End-enabled + Enter/Space-সক্রিয় + খোলায়-আর্ম (is-cur→has→প্রথম-enabled) +
#                   রি-রেন্ডার-সফট-আর্ম + বন্ধে-রিসেট + Escape-ফোকাস-ফেরত (capture-পতাকা) +
#                   জাম্পে-ফোকাস-ফেরত epCalMonth + __ep286QA)
#   ② epaper.css — ep286 ব্লক (হেক্স-শূন্য টোকেন-শুধু: is-act-টিন্ট + is-cur-আউটলাইন +
#                   মোবাইল-সংকোচন 640px + reduced-motion-গার্ড)
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

# ── ① session286 মডিউল ──
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
MODULE = '''  /* ═══════════ session286 (cron 403679): মাস-গ্রিডে কী-বোর্ড-নেভিগেশন (ep286) ═══════════
     ৪-কলাম-গ্রিড-রোভিং: ←→=±1, ↑=-4, ↓=+4 (wrap + disabled-স্কিপ — ডেটা-শূন্য-মাস-লাফ);
     Home=প্রথম-enabled, End=শেষ-enabled, Enter/Space-সক্রিয় (ep283-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার);
     খোলায় আর্ম (is-cur→has→প্রথম-enabled-অগ্রাধিকার) + রোভিং-ট্যাবইনডেক্স + is-act-শ্রেণি;
     রি-রেন্ডারে সফট-আর্ম (ফোকাস-চুরি-শূন্য) + বন্ধে active-রিসেট + Escape-ফোকাস-ফেরত epCalMonth
     (capture-পতাকা — outside-click-বন্ধে-ফোকাস-চুরি-শূন্য) + জাম্পে-ফোকাস-ফেরত; __ep286QA হুক। */
  var ep286Active = -1, ep286EscPending = false;
  function ep286Btns() { return elCalMGrid ? [].slice.call(elCalMGrid.querySelectorAll('.ep-cal-m')) : []; }
  function ep286SetActive(m, doFocus) {
    var bs = ep286Btns();
    ep286Active = (typeof m === 'number' && m >= 0) ? m : -1;
    bs.forEach(function (b) {
      var on = (!b.disabled && +b.getAttribute('data-m') === ep286Active);
      b.classList.toggle('is-act', on);
      if (on) { b.setAttribute('tabindex', '0'); if (doFocus) { try { b.focus(); } catch (e) {} } }
      else if (!b.disabled) { b.setAttribute('tabindex', '-1'); }
    });
  }
  function ep286Pick(sel) { if (!elCalMGrid) return -1; var el = elCalMGrid.querySelector(sel); return el ? +el.getAttribute('data-m') : -1; }
  function ep286Arm() {
    var y = ep286Pick('.ep-cal-m.is-cur:not(:disabled)');
    if (y < 0) y = ep286Pick('.ep-cal-m.has:not(:disabled)');
    if (y < 0) y = ep286Pick('.ep-cal-m:not(:disabled)');
    ep286SetActive(y, true);
  }
  function ep286ArmSoft() {
    var act = elCalMGrid ? elCalMGrid.querySelector('.ep-cal-m[data-m="' + ep286Active + '"]:not(:disabled)') : null;
    var y = act ? ep286Active : ep286Pick('.ep-cal-m.is-cur:not(:disabled)');
    if (y < 0) y = ep286Pick('.ep-cal-m.has:not(:disabled)');
    if (y < 0) y = ep286Pick('.ep-cal-m:not(:disabled)');
    ep286SetActive(y, false);
  }
  function ep286Move(step) {
    var bs = ep286Btns();
    if (!bs.length) return;
    var idx = -1, i;
    for (i = 0; i < bs.length; i++) { if (+bs[i].getAttribute('data-m') === ep286Active) { idx = i; break; } }
    if (idx < 0) { ep286Arm(); return; }
    var n = (idx + step + 12) % 12, tries = 0;
    while (tries < 12 && bs[n] && bs[n].disabled) { n = (n + (step > 0 ? 1 : -1) + 12) % 12; tries++; }
    if (tries >= 12 || !bs[n] || bs[n].disabled) return;
    ep286SetActive(+bs[n].getAttribute('data-m'), true);
  }
  if (elCalMGrid) elCalMGrid.addEventListener('keydown', function (e) {
    if (!ep283Open) return;
    var k = e.key;
    if (k === 'ArrowRight') { e.preventDefault(); ep286Move(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); ep286Move(-1); }
    else if (k === 'ArrowDown') { e.preventDefault(); ep286Move(4); }
    else if (k === 'ArrowUp') { e.preventDefault(); ep286Move(-4); }
    else if (k === 'Home') { e.preventDefault(); var f0 = elCalMGrid.querySelector('.ep-cal-m:not(:disabled)'); if (f0) ep286SetActive(+f0.getAttribute('data-m'), true); }
    else if (k === 'End') {
      e.preventDefault();
      var all = ep286Btns(), fN = null, i;
      for (i = all.length - 1; i >= 0; i--) { if (!all[i].disabled) { fN = all[i]; break; } }
      if (fN) ep286SetActive(+fN.getAttribute('data-m'), true);
    }
    else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      var t = e.target && e.target.closest ? e.target.closest('.ep-cal-m') : null;
      if (t && !t.disabled) t.click();
    }
  });
  /* জাম্পে-ফোকাস-ফেরত: মাস-ক্লিক (ep283-হ্যান্ডলার) প্যানেল-বন্ধ-করে → ট্রিগার epCalMonth-এ ফেরত
     (disabled-মাস-ক্লিকে প্যানেল-খোলা-ই → ফোকাস-স্পর্শ-শূন্য) */
  if (elCalMGrid) elCalMGrid.addEventListener('click', function () {
    if (!ep283Open && elCalMonth) { try { elCalMonth.focus(); } catch (e) {} }
  });
  /* Escape-ফোকাস-ফেরত: capture-ফেজে পতাকা (ep283-বাবল-হ্যান্ডলার-বন্ধের-আগে) → close-র‍্যাপারে ফোকাস;
     outside-click-বন্ধে পতাকা-অসত্য → ফোকাস-চুরি-শূন্য; setTimeout-এ পতাকা-পরিষ্কার */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ep283Open) {
      ep286EscPending = true;
      setTimeout(function () { ep286EscPending = false; }, 0);
    }
  }, true);
  /* প্যানেল-খোলায়-আর্ম + রি-রেন্ডারে-সফট-আর্ম + বন্ধে-রিসেট/Escape-ফোকাস — র‍্যাপার-স্তর
     (ep283/ep284/ep285-বডি-অস্পৃশ্য; ঘোষণা-আর-ডাক-এক-নাম — s285-নাম-মিল-গোটচা) */
  var ep286OpenPanelBase = ep283OpenPanel;
  ep283OpenPanel = function () { ep286OpenPanelBase(); if (ep283Open) ep286Arm(); };
  var ep286RenderBase = ep283Render;
  ep283Render = function () { ep286RenderBase(); if (ep283Open) ep286ArmSoft(); };
  var ep286ClosePanelBase = ep283ClosePanel;
  ep283ClosePanel = function () {
    ep286ClosePanelBase();
    if (ep286EscPending && elCalMonth) { try { elCalMonth.focus(); } catch (e) {} }
    ep286Active = -1;
  };
  /* session286 QA-হুক (__ep286QA — সারফেস-নেমস্পেস-রীতি; গ্রিড-কী-বোর্ড-প্রমাণ) */
  window.__ep286QA = {
    active: function () { return ep286Active; },
    focused: function () { var a = document.activeElement; return a && a.classList && a.classList.contains('ep-cal-m') ? +a.getAttribute('data-m') : -1; },
    move: function (s) { ep286Move(s); },
    set: function (m) { ep286SetActive(m, true); },
    arm: function () { ep286Arm(); }
  };

'''
if 'window.__ep286QA' in ej:
    assert '__ep286QA' in ej and 'ep286Active' in ej and 'ep286OpenPanelBase' in ej, 'মডিউল-আংশিক'
    print('skip-①: ep286-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    ej = ej.replace(JS_ANCHOR, MODULE + JS_ANCHOR, 1)
    changed += 1
    print('ok-①: ep286-মডিউল স্থাপিত')

# ── ② epaper.css ep286 ব্লক (হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session286 — মাস-গ্রিডে কী-বোর্ড-নেভিগেশন (ep286 — হেক্স-শূন্য টোকেন-শুধু;
       ৪-কলাম-গ্রিড-রোভিং + is-act-টিন্ট + মোবাইল-সংকোচন) ═══ */
.ep-cal-m.is-act { border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); background: var(--lf-green-tint); }
.ep-cal-m.is-act.has::after { background: var(--lf-brand-primary); }
.ep-cal-m.is-act.is-cur { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }
@media (max-width: 640px) { .ep-cal-mgrid { gap: 2px; } .ep-cal-m { padding: 6px 0 7px; font-size: .6rem; } }
@media (prefers-reduced-motion: reduce) { .ep-cal-m.is-act { transition: none; } }
'''
if 'session286 — মাস-গ্রিডে কী-বোর্ড-নেভিগেশন' in cs:
    assert '.ep-cal-m.is-act' in cs, 'css-আংশিক'
    print('skip-②: ep286-সিএসএস-ব্লক ইতোমধ্যে')
else:
    cs = cs.rstrip('\n') + '\n' + CSS_BLOCK
    changed += 1
    print('ok-②: ep286-সিএসএস-ব্লক স্থাপিত')

# ── পোস্ট-অ্যাসার্ট (বাইট-সত্য-উৎস) ──
for tok in ('window.__ep286QA', 'function ep286SetActive', 'function ep286Move', 'function ep286Arm',
            "k === 'ArrowRight'", "k === 'ArrowDown'", "k === 'Home'", "k === 'End'",
            "k === 'Enter' || k === ' '", "b.setAttribute('tabindex'", "classList.toggle('is-act'",
            'ep286OpenPanelBase', 'ep286RenderBase', 'ep286ClosePanelBase', 'ep286EscPending',
            '.ep-cal-m.is-cur:not(:disabled)', "elCalMonth.focus()", 'ep286InChipNotUsed' ):
    if tok == 'ep286InChipNotUsed':
        continue
    assert tok in ej, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (ejs): ' + tok
for tok in ('.ep-cal-m.is-act', '.ep-cal-m.is-act.is-cur', 'prefers-reduced-motion', 'max-width: 640px'):
    assert tok in cs, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (css): ' + tok
HEXTAIL = re.search(r'session286 — মাস-গ্রিডে কী-বোর্ড-নেভিগেশন.*', cs, re.S).group(0)
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', HEXTAIL))
assert HEXN == 0, 'ep286-ব্লকে হেক্স %d' % HEXN

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('সম্পন্ন: %d-এডিট প্রয়োগ (idempotent-নিশ্চিত — পুনঃরানে skip ×২)' % changed)
else:
    print('সম্পন্ন: শূন্য-এডিট (idempotent ×২-প্রমাণ — সব-skip)')
