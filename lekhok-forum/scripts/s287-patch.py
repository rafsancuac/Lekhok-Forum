#!/usr/bin/env python3
# s287-patch.py — session287 (cron 403679): দিন-গ্রিডে কী-বোর্ড-নেভিগেশন ep287
# চুক্তি: idempotent (মার্কার-গার্ড ×২-এডিট) + পোস্ট-অ্যাসার্ট + বাইট-সত্য-উৎস
# এডিট-তালিকা:
#   ① epaper.ejs — session287 মডিউল (৭-কলাম-গ্রিড-রোভিং ↑=-7/↓=+7/←→=±1 + wrap + disabled-স্কিপ —
#                   ভবিষ্যৎ-দিন-লাফ; মাস-সীমা-স্কিপ = সীমা-অতিক্রম-নয় — wrap-এ-সীমা-লাফ (ep286-চুক্তি);
#                   Home/End-enabled + Enter/Space-সক্রিয় (grid-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার — calJump-ডুপ্লিকেট-নিষিদ্ধ)
#                   + জাম্পে-ফোকাস-ফেরত is-sel-দিন + বুট/রি-রেন্ডার-সফট-আর্ম (is-sel→is-today→প্রথম-enabled;
#                   calRender-র‍্যাপার — calRender-বডি-অস্পৃশ্য) + __ep287QA)
#   ② epaper.css — ep287 ব্লক (হেক্স-শূন্য টোকেন-শুধু: is-act-টিন্ট + is-act.is-sel-সংরক্ষণ + focus-visible +
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

# ── ① session287 মডিউল ──
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
MODULE = '''  /* ═══════════ session287 (cron 403679): দিন-গ্রিডে কী-বোর্ড-নেভিগেশন (ep287) ═══════════
     ৭-কলাম-গ্রিড-রোভিং: ←→=±1, ↑=-7, ↓=+7 (wrap + disabled-স্কিপ — ভবিষ্যৎ-দিন-লাফ;
     মাস-সীমা-স্কিপ = সীমা-অতিক্রম-নয় — wrap-এ-সীমা-লাফ, ep286-চুক্তি);
     Home=প্রথম-enabled, End=শেষ-enabled, Enter/Space-সক্রিয় (grid-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার —
     calJump-জাম্প-লজিক-ডুপ্লিকেট-নিষিদ্ধ) + জাম্পে-ফোকাস-ফেরত is-sel-দিন (calRender-পুনঃরেন্ডার-পরে);
     বুট/রি-রেন্ডারে সফট-আর্ম (is-sel→is-today→প্রথম-enabled-অগ্রাধিকার; ফোকাস-চুরি-শূন্য) +
     রোভিং-ট্যাবইনডেক্স (active=0, enabled-বাকি=−1; disabled-বাটন-স্পর্শ-শূন্য) + is-act-শ্রেণি;
     calRender-র‍্যাপার (calRender-বডি-অস্পৃশ্য; ঘোষণা-আর-ডাক-এক-নাম — s285-নাম-মিল-গোটচা); __ep287QA হুক। */
  var ep287Active = '';
  function ep287Btns() { return elCalGrid ? [].slice.call(elCalGrid.querySelectorAll('.ep-cal-day')) : []; }
  function ep287SetActive(d, doFocus) {
    var bs = ep287Btns();
    ep287Active = (typeof d === 'string' && d) ? d : '';
    bs.forEach(function (b) {
      var on = (!b.disabled && b.getAttribute('data-d') === ep287Active);
      b.classList.toggle('is-act', on);
      if (on) { b.setAttribute('tabindex', '0'); if (doFocus) { try { b.focus(); } catch (e) {} } }
      else if (!b.disabled) { b.setAttribute('tabindex', '-1'); }
    });
  }
  function ep287Pick(sel) { if (!elCalGrid) return ''; var el = elCalGrid.querySelector(sel); return el ? (el.getAttribute('data-d') || '') : ''; }
  function ep287Arm() {
    var d = ep287Pick('.ep-cal-day.is-sel:not(:disabled)');
    if (!d) d = ep287Pick('.ep-cal-day.is-today:not(:disabled)');
    if (!d) d = ep287Pick('.ep-cal-day:not(:disabled)');
    ep287SetActive(d, true);
  }
  function ep287ArmSoft() {
    var el = elCalGrid ? elCalGrid.querySelector('.ep-cal-day[data-d="' + ep287Active + '"]:not(:disabled)') : null;
    var d = el ? ep287Active : ep287Pick('.ep-cal-day.is-sel:not(:disabled)');
    if (!d) d = ep287Pick('.ep-cal-day.is-today:not(:disabled)');
    if (!d) d = ep287Pick('.ep-cal-day:not(:disabled)');
    ep287SetActive(d, false);
  }
  function ep287Move(step) {
    var bs = ep287Btns();
    if (!bs.length) return;
    var idx = -1, i;
    for (i = 0; i < bs.length; i++) { if (bs[i].getAttribute('data-d') === ep287Active) { idx = i; break; } }
    if (idx < 0) { ep287Arm(); return; }
    var n = (idx + step + bs.length) % bs.length, tries = 0;
    while (tries < bs.length && bs[n] && bs[n].disabled) { n = (n + (step > 0 ? 1 : -1) + bs.length) % bs.length; tries++; }
    if (tries >= bs.length || !bs[n] || bs[n].disabled) return;
    ep287SetActive(bs[n].getAttribute('data-d'), true);
  }
  if (elCalGrid) elCalGrid.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight') { e.preventDefault(); ep287Move(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); ep287Move(-1); }
    else if (k === 'ArrowDown') { e.preventDefault(); ep287Move(7); }
    else if (k === 'ArrowUp') { e.preventDefault(); ep287Move(-7); }
    else if (k === 'Home') { e.preventDefault(); var f0 = elCalGrid.querySelector('.ep-cal-day:not(:disabled)'); if (f0) ep287SetActive(f0.getAttribute('data-d'), true); }
    else if (k === 'End') {
      e.preventDefault();
      var all = ep287Btns(), fN = null, i;
      for (i = all.length - 1; i >= 0; i--) { if (!all[i].disabled) { fN = all[i]; break; } }
      if (fN) ep287SetActive(fN.getAttribute('data-d'), true);
    }
    else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      var t = e.target && e.target.closest ? e.target.closest('.ep-cal-day') : null;
      if (t && !t.disabled) {
        t.click();
        var back = elCalGrid.querySelector('.ep-cal-day.is-sel:not(:disabled)') || elCalGrid.querySelector('.ep-cal-day[data-d="' + ep287Active + '"]:not(:disabled)');
        if (back) { try { back.focus(); } catch (e2) {} }
      }
    }
  });
  /* বুট/রি-রেন্ডারে-সফট-আর্ম — র‍্যাপার-স্তর (calRender-বডি-অস্পৃশ্য; ঘোষণা-আর-ডাক-এক-নাম);
     calRender-প্রথম-ডাকই বুট-আর্ম (tabindex=0 — Tab-কী-দ্বারা গ্রিডে-পৌঁছ) */
  var ep287CalRenderBase = calRender;
  calRender = function () { ep287CalRenderBase(); ep287ArmSoft(); };
  /* session287 QA-হুক (__ep287QA — সারফেস-নেমস্পেস-রীতি; দিন-গ্রিড-কী-বোর্ড-প্রমাণ) */
  window.__ep287QA = {
    active: function () { return ep287Active; },
    focused: function () { var a = document.activeElement; return a && a.classList && a.classList.contains('ep-cal-day') ? (a.getAttribute('data-d') || '') : ''; },
    move: function (s) { ep287Move(s); },
    set: function (d) { ep287SetActive(String(d || ''), true); },
    arm: function () { ep287Arm(); },
    days: function () { return ep287Btns().length; },
    enabled: function () { return ep287Btns().filter(function (b) { return !b.disabled; }).length; },
    tabbed: function () { return ep287Btns().filter(function (b) { return b.getAttribute('tabindex') === '0'; }).length; }
  };

'''
if 'window.__ep287QA' in ej:
    assert '__ep287QA' in ej and 'ep287Active' in ej and 'ep287CalRenderBase' in ej, 'মডিউল-আংশিক'
    print('skip-①: ep287-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    ej = ej.replace(JS_ANCHOR, MODULE + JS_ANCHOR, 1)
    changed += 1
    print('ok-①: ep287-মডিউল স্থাপিত')

# ── ② epaper.css ep287 ব্লক (হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session287 — দিন-গ্রিডে কী-বোর্ড-নেভিগেশন (ep287 — হেক্স-শূন্য টোকেন-শুধু;
       ৭-কলাম-গ্রিড-রোভিং + is-act-টিন্ট + মোবাইল-সংকোচন) ═══ */
.ep-cal-day.is-act { border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); background: var(--lf-green-tint); }
.ep-cal-day.is-act.has::after { background: var(--lf-brand-primary); }
.ep-cal-day.is-act.is-sel { background: var(--lf-brand-primary); border-color: var(--lf-brand-primary); color: var(--lf-white); outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }
.ep-cal-day.is-act.is-sel::after { background: var(--lf-white); }
.ep-cal-day:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: -2px; }
@media (max-width: 640px) { .ep-cal-grid { gap: 1px; } .ep-cal-day { min-height: 25px; font-size: .64rem; } }
@media (prefers-reduced-motion: reduce) { .ep-cal-day.is-act { transition: none; } }
'''
if 'session287 — দিন-গ্রিডে কী-বোর্ড-নেভিগেশন' in cs:
    assert '.ep-cal-day.is-act' in cs, 'css-আংশিক'
    print('skip-②: ep287-সিএসএস-ব্লক ইতোমধ্যে')
else:
    cs = cs.rstrip('\n') + '\n' + CSS_BLOCK
    changed += 1
    print('ok-②: ep287-সিএসএস-ব্লক স্থাপিত')

# ── পোস্ট-অ্যাসার্ট (বাইট-সত্য-উৎস) ──
for tok in ('window.__ep287QA', 'function ep287SetActive', 'function ep287Move', 'function ep287Arm',
            'function ep287ArmSoft', "k === 'ArrowRight'", "k === 'ArrowDown'", "k === 'ArrowUp'",
            "k === 'Home'", "k === 'End'", "k === 'Enter' || k === ' '",
            "b.setAttribute('tabindex'", "classList.toggle('is-act'",
            'ep287CalRenderBase', 'ep287Btns', 'ep287Pick',
            '.ep-cal-day.is-sel:not(:disabled)', '.ep-cal-day.is-today:not(:disabled)',
            'window.__ep286QA', 'window.__ep285QA', 'window.__ep284QA', 'window.__ep283QA'):
    assert tok in ej, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (ejs): ' + tok
for tok in ('.ep-cal-day.is-act', '.ep-cal-day.is-act.is-sel', '.ep-cal-day:focus-visible',
            'prefers-reduced-motion', 'max-width: 640px'):
    assert tok in cs, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (css): ' + tok
HEXTAIL = re.search(r'session287 — দিন-গ্রিডে কী-বোর্ড-নেভিগেশন.*', cs, re.S).group(0)
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', HEXTAIL))
assert HEXN == 0, 'ep287-ব্লকে হেক্স %d' % HEXN

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('সম্পন্ন: %d-এডিট প্রয়োগ (idempotent-নিশ্চিত — পুনঃরানে skip ×২)' % changed)
else:
    print('সম্পন্ন: শূন্য-এডিট (idempotent ×২-প্রমাণ — সব-skip)')
