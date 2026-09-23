#!/usr/bin/env python3
# s290-patch.py — session290 প্যাচ (ep282-কম্বোতে aria-activedescendant + Home/End + is-act-দৃশ্যমান-দ্বৈত)
# চুক্তি: idempotent (মার্কার-গার্ড) ×২ + প্রি/পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট (CSS-ব্লক)
import re, sys

EJS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/epaper.ejs'
CSS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/public/assets/css/epaper.css'

# ── ① epaper.ejs — ep290 JS-ব্লক (ep282-হুক-ব্লকের-পরে, IIFE-বন্ধের-আগে) ──
ejstxt = open(EJS, encoding='utf-8').read()
if 'window.__ep290QA' in ejstxt:
    print('skip-①: ep290 JS-ব্লক ইতোমধ্যে')
else:
    JS_ANCHOR = """    options: function () { return elPaperSel ? elPaperSel.options.length : 0; }
  };
})();"""
    assert ejstxt.count(JS_ANCHOR) == 1, 'JS-অ্যাঙ্কর-%d-বার' % ejstxt.count(JS_ANCHOR)
    JSBLOCK = """    options: function () { return elPaperSel ? elPaperSel.options.length : 0; }
  };

  /* ═══════════ session290 (cron 403679): কম্বোতে aria-activedescendant + Home/End (ep290) ═══════════
     ep282-কম্বো-প্যানেলে ↑↓-নেভ এতদূর ভিজ্যুয়াল-শুধু (is-act-ক্লাস; অপশনে-আইডি-নেই, activedescendant-নেই);
     এ-ব্লক: সেটআপে elPsSearch-এ role=combobox + aria-autocomplete=list + aria-controls (APG-কম্বো);
     রেন্ডার-র‍্যাপারে দৃশ্যমান-অপশনে স্থিতিশীল-আইডি (epPsOpt290-<i>) + অ্যাক্টিভেট-র‍্যাপারে
     aria-activedescendant-সিঙ্ক (elPsSearch — DOM-ফোকাস-ধারক + elPsBtn — aria-controls-মালিক)
     + খোলা/বন্ধ-র‍্যাপারে aria-expanded-সিঙ্ক (সার্চ-ইনপুটে) + বন্ধে activedescendant-পরিষ্কারণ
     + Home/End (প্যানেল-খোলা + অপশন-উপস্থিত → প্রথম/শেষ — APG-কম্বো-প্যাটার্ন);
     বডি-অস্পৃশ্য (ps282Render/ps282Activate/ps282OpenPanel/ps282Close-বডি-অপরিবর্তিত); __ep290QA হুক। */
  if (elPsSearch) {
    elPsSearch.setAttribute('role', 'combobox');
    elPsSearch.setAttribute('aria-autocomplete', 'list');
    elPsSearch.setAttribute('aria-controls', 'epPs282Opts');
    elPsSearch.setAttribute('aria-expanded', 'false');
  }
  function ep290AdId() {
    var vis = ps282Vis();
    var b = (ep282Active >= 0 && vis[ep282Active]) ? vis[ep282Active] : null;
    if (!b) return '';
    if (!b.id) b.id = 'epPsOpt290-' + ep282Active;
    return b.id;
  }
  function ep290SyncAD() {
    var id = ep290AdId();
    if (elPsBtn) { if (id) elPsBtn.setAttribute('aria-activedescendant', id); else elPsBtn.removeAttribute('aria-activedescendant'); }
    if (elPsSearch) { if (id) elPsSearch.setAttribute('aria-activedescendant', id); else elPsSearch.removeAttribute('aria-activedescendant'); }
  }
  var ep290RenderBase = ps282Render;
  ps282Render = function () {
    ep290RenderBase();
    var vis = ps282Vis();
    for (var i = 0; i < vis.length; i++) { if (!vis[i].id) vis[i].id = 'epPsOpt290-' + i; }
    ep290SyncAD();
  };
  var ep290ActivateBase = ps282Activate;
  ps282Activate = function (i, silent) { ep290ActivateBase(i, silent); ep290SyncAD(); };
  var ep290OpenBase = ps282OpenPanel;
  ps282OpenPanel = function () {
    ep290OpenBase();
    if (elPsSearch && ep282Open) elPsSearch.setAttribute('aria-expanded', 'true');
  };
  var ep290CloseBase = ps282Close;
  ps282Close = function () {
    ep290CloseBase();
    if (elPsSearch) { elPsSearch.setAttribute('aria-expanded', 'false'); elPsSearch.removeAttribute('aria-activedescendant'); }
    if (elPsBtn) elPsBtn.removeAttribute('aria-activedescendant');
  };
  if (elPsSearch) elPsSearch.addEventListener('keydown', function (e) {
    if (!ep282Open || ep282VisibleN < 1) return;
    if (e.key === 'Home') { e.preventDefault(); ps282Activate(0); }
    else if (e.key === 'End') { e.preventDefault(); ps282Activate(ps282Vis().length - 1); }
  });
  /* session290 QA-হুক (__ep290QA — সারফেস-নেমস্পেস-রীতি; activedescendant-প্রমাণ) */
  window.__ep290QA = {
    ad: function () { return elPsBtn ? (elPsBtn.getAttribute('aria-activedescendant') || '') : ''; },
    adSearch: function () { return elPsSearch ? (elPsSearch.getAttribute('aria-activedescendant') || '') : ''; },
    ids: function () { return ps282Vis().filter(function (b) { return !!b.id; }).length; },
    activeId: function () { var vis = ps282Vis(); var b = (ep282Active >= 0 && vis[ep282Active]) ? vis[ep282Active] : null; return b ? (b.id || '') : ''; },
    expSearch: function () { return elPsSearch ? (elPsSearch.getAttribute('aria-expanded') || '') : ''; }
  };
})();"""
    ejstxt = ejstxt.replace(JS_ANCHOR, JSBLOCK, 1)
    open(EJS, 'w', encoding='utf-8').write(ejstxt)
    print('ok-①: ep290 JS-ব্লক সন্নিবেশিত')

# ── ② epaper.css — ep290 is-act-দৃশ্যমান-দ্বৈত-ব্লক (ep289-ব্লকের-পরে — ফাইল-শেষ) ──
csstxt = open(CSS, encoding='utf-8').read()
CSS_ANCHOR = '@media (prefers-reduced-motion: reduce) { .ep-cal-month::after, .ep-cal-mylabel::after { transition: none; } }'
assert csstxt.count(CSS_ANCHOR) == 1, 'CSS-অ্যাঙ্কর-%d-বার' % csstxt.count(CSS_ANCHOR)
if 'session290 — কম্বো aria-activedescendant' in csstxt:
    print('skip-②: ep290 CSS-ব্লক ইতোমধ্যে')
else:
    CSSBLOCK = '''

/* ═══ session290 — কম্বো aria-activedescendant (ep290 — হেক্স-শূন্য টোকেন-শুধু;
       is-act = অ্যাক্টিভ-ডিসেনডেন্ট-দৃশ্যমান-দ্বৈত: ইনসেট-বার + ওজন — SR-অ্যাক্টিভ-অপশন-চিহ্ন) ═══ */
.ep-ps-opt.is-act { box-shadow: inset 3px 0 0 var(--lf-brand-primary); font-weight: 800; }
@media (prefers-reduced-motion: reduce) { .ep-ps-opt.is-act { transition: none; } }'''
    csstxt = csstxt.replace(CSS_ANCHOR, CSS_ANCHOR + CSSBLOCK, 1)
    open(CSS, 'w', encoding='utf-8').write(csstxt)
    print('ok-②: ep290 CSS-ব্লক সন্নিবেশিত')

# ── ③ পোস্ট-অ্যাসার্ট (উভয়-ফাইল পুনঃপাঠ) ──
ejstxt = open(EJS, encoding='utf-8').read()
csstxt = open(CSS, encoding='utf-8').read()
for m in ['window.__ep290QA', "function ep290AdId", "function ep290SyncAD",
          'ep290RenderBase', 'ep290ActivateBase', 'ep290OpenBase', 'ep290CloseBase',
          "elPsSearch.setAttribute('role', 'combobox')", "elPsSearch.setAttribute('aria-autocomplete', 'list')",
          "elPsSearch.setAttribute('aria-controls', 'epPs282Opts')",
          "elPsSearch.setAttribute('aria-expanded', 'false')",
          "elPsBtn.setAttribute('aria-activedescendant', id)",
          "elPsSearch.setAttribute('aria-activedescendant', id)",
          "e.key === 'Home'", "e.key === 'End'", "epPsOpt290-"]:
    assert m in ejstxt, 'EJS-পোস্ট-অ্যাসার্ট-অনুপস্থিত: %s' % m
assert ejstxt.count('window.__ep290QA') == 1, '__ep290QA-ডুপ্লিকেট'
assert 'window.__ep282QA' in ejstxt and 'window.__ep289QA' in ejstxt, 'ep282/289-ভাঙা'
B290 = csstxt.split('session290 — কম্বো aria-activedescendant', 1)[1]
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B290))
assert HEXN == 0, 'ep290-CSS-ব্লকে-হেক্স-%d' % HEXN
for m in ['.ep-ps-opt.is-act { box-shadow: inset 3px 0 0 var(--lf-brand-primary); font-weight: 800; }',
          'prefers-reduced-motion']:
    assert m in csstxt, 'CSS-পোস্ট-অ্যাসার্ট-অনুপস্থিত: %s' % m
print('পোস্ট-অ্যাসার্ট-গ্রিন (JS ×১৫ + CSS হেক্স-শূন্য + CSS ×২)')
print('s290-patch সম্পন্ন (idempotent ×২-প্রস্তুত)')
