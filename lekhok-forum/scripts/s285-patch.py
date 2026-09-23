#!/usr/bin/env python3
# s285-patch.py — session285 (cron 403679): বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন ep285
# চুক্তি: idempotent (মার্কার-গার্ড ×২-এডিট) + পোস্ট-অ্যাসার্ট + বাইট-সত্য-উৎস
# এডিট-তালিকা:
#   ① epaper.ejs — session285 মডিউল (রোভিং-ট্যাবইনডেক্স + ↑↓←→-wrap + Home/End + Enter/Space +
#                   প্রারম্ভিক-ফোকাস (ep284OpenList-র‍্যাপার) + জাম্পে ফোকাস-ফেরত + রি-রেন্ডার-সফট-আর্ম + __ep285QA)
#   ② epaper.css — ep285 ব্লক (হেক্স-শূন্য টোকেন-শুধু)
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

# ── ① session285 মডিউল ──
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
MODULE = '''  /* ═══════════ session285 (cron 403679): বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন (ep285) ═══════════
     ↑↓←→-চিপ-রোভিং (DOM-ক্রমে wrap) + Home/End + Enter/Space-সক্রিয় (ep282-কম্বো-প্যাটার্ন);
     is-cur-চিপে প্রারম্ভিক-ফোকাস + রোভিং-ট্যাবইনডেক্স (active=0 বাকি=-1) + is-act-শ্রেণি;
     জাম্পে ফোকাস-ফেরত বছর-লেবেলে; রি-রেন্ডারে সফট-আর্ম (ফোকাস-চুরি-শূন্য); __ep285QA হুক। */
  var ep285Active = 0;
  function ep285Chips() { return elCalYList ? [].slice.call(elCalYList.querySelectorAll('.ep-cal-y')) : []; }
  function ep285SetActive(y, doFocus) {
    var chips = ep285Chips();
    ep285Active = y || 0;
    chips.forEach(function (b) {
      var on = (+b.getAttribute('data-y') === ep285Active);
      b.classList.toggle('is-act', on);
      b.setAttribute('tabindex', on ? '0' : '-1');
      if (on && doFocus) { try { b.focus(); } catch (e) {} }
    });
  }
  function ep285Pick(fallback) {
    var chips = ep285Chips();
    if (!chips.length) return 0;
    var el = fallback && elCalYList.querySelector(fallback);
    return +(el || chips[0]).getAttribute('data-y');
  }
  function ep285Arm() { var y = ep285Pick('.ep-cal-y.is-cur'); if (y) ep285SetActive(y, true); }
  function ep285ArmSoft() { var act = ep285Active && elCalYList.querySelector('.ep-cal-y[data-y="' + ep285Active + '"]'); var y = act ? ep285Active : ep285Pick('.ep-cal-y.is-cur'); if (y) ep285SetActive(y, false); }
  function ep285Move(step) {
    var chips = ep285Chips();
    if (!chips.length) return;
    var idx = 0;
    for (var i = 0; i < chips.length; i++) { if (+chips[i].getAttribute('data-y') === ep285Active) { idx = i; break; } }
    var n = (idx + step) % chips.length; if (n < 0) n += chips.length;
    ep285SetActive(+chips[n].getAttribute('data-y'), true);
  }
  if (elCalYList) elCalYList.addEventListener('keydown', function (e) {
    if (!ep284YOpen) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); ep285Move(1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); ep285Move(-1); }
    else if (k === 'Home') { e.preventDefault(); var c0 = ep285Chips(); if (c0.length) ep285SetActive(+c0[0].getAttribute('data-y'), true); }
    else if (k === 'End') { e.preventDefault(); var cN = ep285Chips(); if (cN.length) ep285SetActive(+cN[cN.length - 1].getAttribute('data-y'), true); }
    else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      var t = e.target && e.target.closest ? e.target.closest('.ep-cal-y') : null;
      if (t) t.click();
    }
  });
  /* জাম্পে ফোকাস-ফেরত (চিপ-ক্লিকের-পরে স্ট্রিপ-বন্ধ → বছর-লেবেলে) + চিপ-ক্লিক-বাবল-গার্ড:
     capture-ফেজে ফ্ল্যাগ — ep284Render-র ylist-innerHTML-রিবিল্ড বাবল-মাঝপথে ক্লিক-টার্গেট-ডিট্যাচ করে →
     document-outside-click-এ card.contains(detached)=false → প্যানেল-মিথ্যা-বন্ধ (s284-ল্যাটেন্ট-গোটচা);
     চিপ-ক্লিকে রিবিল্ড-স্কিপ (স্ট্রিপ-যে-কোনো-অবস্থায়-বন্ধ-ই; পরের-খোলায় ফ্রেশ-রেন্ডার) */
  var ep285InChip = false;
  if (elCalYList) elCalYList.addEventListener('click', function () { ep285InChip = true; }, true);
  if (elCalYList) elCalYList.addEventListener('click', function () {
    ep285InChip = false;
    if (!ep284YOpen && elCalMY) { try { elCalMY.focus(); } catch (e) {} }
  });
  /* স্ট্রিপ-খোলায় প্রারম্ভিক-ফোকাস + রি-রেন্ডারে সফট-আর্ম + বন্ধে active-রিসেট — র‍্যাপার-স্তর (ep284-বডি-অস্পৃশ্য) */
  var ep284OpenListBase = ep284OpenList;
  ep284OpenList = function () { ep285InChip = false; ep284OpenListBase(); ep285Arm(); };
  var ep284RenderBase = ep284Render;
  ep284Render = function () { if (ep285InChip) return; ep284RenderBase(); if (ep284YOpen) ep285ArmSoft(); };
  var ep284CloseListBase = ep284CloseList;
  ep284CloseList = function () { ep284CloseListBase(); ep285Active = 0; };
  /* session285 QA-হুক (__ep285QA — সারফেস-নেমস্পেস-রীতি; কী-বোর্ড-প্রমাণ) */
  window.__ep285QA = {
    active: function () { return ep285Active; },
    focused: function () { var a = document.activeElement; return a && a.classList && a.classList.contains('ep-cal-y') ? +a.getAttribute('data-y') : 0; },
    move: function (s) { ep285Move(s); },
    set: function (y) { ep285SetActive(y, true); },
    arm: function () { ep285Arm(); }
  };

'''
if 'window.__ep285QA' in ej:
    assert '__ep285QA' in ej and 'ep285Active' in ej and 'ep284OpenListBase' in ej, 'মডিউল-আংশিক'
    print('skip-①: ep285-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    ej = ej.replace(JS_ANCHOR, MODULE + JS_ANCHOR, 1)
    changed += 1
    print('ok-①: ep285-মডিউল স্থাপিত')

# ── ② epaper.css ep285 ব্লক (হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session285 — বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন (ep285 — হেক্স-শূন্য টোকেন-শুধু;
       রোভিং-ট্যাবইনডেক্স + is-act-টিন্ট + ফোকাস-চেইন) ═══ */
.ep-cal-y.is-act { border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); background: var(--lf-green-tint); }
.ep-cal-y.is-act.is-cur { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .ep-cal-y.is-act { transition: none; } }
'''
if 'session285 — বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন' in cs:
    assert '.ep-cal-y.is-act' in cs, 'css-আংশিক'
    print('skip-②: ep285-সিএসএস-ব্লক ইতোমধ্যে')
else:
    cs = cs.rstrip('\n') + '\n' + CSS_BLOCK
    changed += 1
    print('ok-②: ep285-সিএসএস-ব্লক স্থাপিত')

# ── পোস্ট-অ্যাসার্ট (বাইট-সত্য-উৎস) ──
for tok in ('window.__ep285QA', 'function ep285SetActive', 'function ep285Move', 'function ep285Arm',
            "k === 'ArrowDown'", "k === 'Home'", "k === 'End'", "k === 'Enter' || k === ' '",
            "b.setAttribute('tabindex'", 'ep284OpenListBase', 'ep284RenderBase', 'ep284CloseListBase',
            'ep285InChip', "addEventListener('click', function () { ep285InChip = true; }, true)",
            "classList.toggle('is-act'"):
    assert tok in ej, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (ejs): ' + tok
for tok in ('.ep-cal-y.is-act', '.ep-cal-y.is-act.is-cur', 'prefers-reduced-motion'):
    assert tok in cs, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (css): ' + tok
HEXTAIL = re.search(r'session285 — বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন.*', cs, re.S).group(0)
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', HEXTAIL))
assert HEXN == 0, 'ep285-ব্লকে হেক্স %d' % HEXN

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('সম্পন্ন: %d-এডিট প্রয়োগ (idempotent-নিশ্চিত — পুনঃরানে skip ×২)' % changed)
else:
    print('সম্পন্ন: শূন্য-এডিট (idempotent ×২-প্রমাণ — সব-skip)')
