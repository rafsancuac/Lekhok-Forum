#!/usr/bin/env python3
# s289-patch.py — session289 প্যাচ (মাস-প্যানেল খোলা/বন্ধ ঘোষণা ep289 + ডিসক্লোজার-ক্যারেট-স্টাইল)
# চুক্তি: idempotent (মার্কার-গার্ড) ×২ + প্রি/পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট (CSS-ব্লক)
import re, sys

EJS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/epaper.ejs'
CSS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/public/assets/css/epaper.css'

# ── ① epaper.ejs — ep289 JS-ব্লক (ep288-হুক-ব্লকের-পরে, বার-তারিখ-ব্লকের-আগে) ──
ejstxt = open(EJS, encoding='utf-8').read()
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
assert ejstxt.count(JS_ANCHOR) == 1, 'JS-অ্যাঙ্কর-%d-বার' % ejstxt.count(JS_ANCHOR)
if 'window.__ep289QA' in ejstxt:
    print('skip-①: ep289 JS-ব্লক ইতোমধ্যে')
else:
    JSBLOCK = '''  /* ═══════════ session289 (cron 403679): মাস-প্যানেল খোলা/বন্ধ ঘোষণা (ep289) ═══════════
     ep288-লাইভ-রিজিয়নে প্যানেল/বছর-তালিকা-অবস্থা-ঘোষণা (খোলা: বছর+তথ্য-গণনা-সহ; বন্ধ: সংক্ষিপ্ত);
     engaged-গেট-বিস্তার — প্যানেল-অভ্যন্তরীণ-প্রথম-ইনপুটেও সক্রিয় (প্রোড-প্রমাণিত ঘাটতি:
     বছর-লেবেল-ক্লিকে engaged=false থেকে যেত); aria-expanded-সিঙ্ক-পুনঃপ্রমাণ (রেন্ডার্ড);
     র‍্যাপার-স্তর ×৪ (ep283Open/ClosePanel + ep284Open/CloseList-বডি-অস্পৃশ্য — late-bound-চেইন-শেষে);
     ঘোষণা-উৎস-একক: ep288Say-পুনঃব্যবহার (ep289Say-বৃত্ত-মাত্র — ডুপ্লিকেট-নিষিদ্ধ); __ep289QA হুক। */
  var ep289Last = '';
  function ep289Say(msg) { ep289Last = String(msg || ''); ep288Say(ep289Last); }
  /* engaged-গেট-বিস্তার — কার্ড-ক্যাপচার-ফেজ (টার্গেট-লিসনারের-আগেই-সক্রিয় — at-target-রেজিস্ট্রেশন-ক্রম-গোটচা:
     ep283-টগল-লিসনার-আগে-রেজিস্টার্ড → ওপেন-র‍্যাপার-চেকের-সময় ep288-এর-টার্গেট-লিসনার-এখনো-চলে-নাই;
     কার্ড-ক্যাপচার = মাস-ট্রিগার + প্যানেল-অভ্যন্তর + স্টেপার + দিন-গ্রিড-সব-প্রথম-ইনপুটেই-ঢাকে) */
  var ep289Card = elCalMPanel ? elCalMPanel.closest('.ep-cal280') : null;
  if (ep289Card) {
    ep289Card.addEventListener('click', function () { ep288Engaged = true; }, true);
    ep289Card.addEventListener('keydown', function () { ep288Engaged = true; }, true);
  }
  /* র‍্যাপার ×৪ — খোলা/বন্ধে ঘোষণা (engaged-গেট: প্রোগ্রাম্যাটিক/বুট-নীরব — s288-চুক্তি) */
  var ep289OpenPanelBase = ep283OpenPanel;
  ep283OpenPanel = function () {
    ep289OpenPanelBase();
    if (ep288Engaged && ep283Open) ep289Say('মাস-তালিকা খোলা — ' + bnDigits(ep283Year) + ', তথ্য-আছে ' + bnDigits(ep283HasN) + ' মাস');
  };
  var ep289ClosePanelBase = ep283ClosePanel;
  ep283ClosePanel = function () {
    var was = ep283Open;
    ep289ClosePanelBase();
    if (ep288Engaged && was) ep289Say('মাস-তালিকা বন্ধ');
  };
  var ep289OpenListBase = ep284OpenList;
  ep284OpenList = function () {
    ep289OpenListBase();
    if (ep288Engaged && ep284YOpen) ep289Say('বছর-তালিকা খোলা — ' + bnDigits(ep284YearsN) + ' বছর');
  };
  var ep289CloseListBase = ep284CloseList;
  ep284CloseList = function () {
    var was = ep284YOpen;
    ep289CloseListBase();
    if (ep288Engaged && was) ep289Say('বছর-তালিকা বন্ধ');
  };
  /* session289 QA-হুক (__ep289QA — সারফেস-নেমস্পেস-রীতি; প্যানেল-ঘোষণা-প্রমাণ) */
  window.__ep289QA = {
    last: function () { return ep289Last; },
    engaged: function () { return ep288Engaged; },
    expM: function () { return elCalMonth ? elCalMonth.getAttribute('aria-expanded') : null; },
    expY: function () { return elCalMY ? elCalMY.getAttribute('aria-expanded') : null; },
    open: function () { return ep283Open; },
    yopen: function () { return ep284YOpen; }
  };

'''
    ejstxt = ejstxt.replace(JS_ANCHOR, JSBLOCK + JS_ANCHOR, 1)
    open(EJS, 'w', encoding='utf-8').write(ejstxt)
    print('ok-①: ep289 JS-ব্লক সন্নিবেশিত')

# ── ② epaper.css — ep289 ডিসক্লোজার-ক্যারেট-ব্লক (session288-ব্লকের-পরে) ──
csstxt = open(CSS, encoding='utf-8').read()
CSS_ANCHOR = '.ep-cal-day[aria-current="date"] { outline: 2px solid var(--lf-white); outline-offset: -3px; }'
assert csstxt.count(CSS_ANCHOR) == 1, 'CSS-অ্যাঙ্কর-%d-বার' % csstxt.count(CSS_ANCHOR)
if 'session289 — মাস-প্যানেল খোলা/বন্ধ ঘোষণা' in csstxt:
    print('skip-②: ep289 CSS-ব্লক ইতোমধ্যে')
else:
    CSSBLOCK = '''

/* ═══ session289 — মাস-প্যানেল খোলা/বন্ধ ঘোষণা (ep289 — হেক্স-শূন্য টোকেন-শুধু;
       ডিসক্লোজার-ক্যারেট (▼ — খোলা-অবস্থায় ১৮০°-রোটেশন — aria-expanded-দৃশ্যমান-দ্বৈত)) ═══ */
.ep-cal-month::after, .ep-cal-mylabel::after { content: '\\25BE'; font-size: .55rem; margin-left: 4px; display: inline-block; transition: transform .18s ease, color .18s ease; color: var(--lf-text-tertiary); }
.ep-cal-month.is-open::after, .ep-cal-mylabel.is-open::after { transform: rotate(180deg); color: var(--lf-brand-primary); }
@media (prefers-reduced-motion: reduce) { .ep-cal-month::after, .ep-cal-mylabel::after { transition: none; } }'''
    csstxt = csstxt.replace(CSS_ANCHOR, CSS_ANCHOR + CSSBLOCK, 1)
    open(CSS, 'w', encoding='utf-8').write(csstxt)
    print('ok-②: ep289 CSS-ক্যারেট-ব্লক সন্নিবেশিত')

# ── ③ পোস্ট-অ্যাসার্ট (উভয়-ফাইল পুনঃপাঠ) ──
ejstxt = open(EJS, encoding='utf-8').read()
csstxt = open(CSS, encoding='utf-8').read()
for m in ['window.__ep289QA', 'function ep289Say', 'ep289OpenPanelBase', 'ep289ClosePanelBase',
          'ep289OpenListBase', 'ep289CloseListBase', "ep289Say('মাস-তালিকা খোলা — '",
          "ep289Say('মাস-তালিকা বন্ধ')", "ep289Say('বছর-তালিকা খোলা — '",
          "ep289Say('বছর-তালিকা বন্ধ')", "ep289Card.addEventListener('click', function () { ep288Engaged = true; }, true)"]:
    assert m in ejstxt, 'EJS-পোস্ট-অ্যাসার্ট-অনুপস্থিত: %s' % m
assert ejstxt.count('window.__ep289QA') == 1, '__ep289QA-ডুপ্লিকেট'
assert 'window.__ep288QA' in ejstxt and 'window.__ep287QA' in ejstxt, 'ep287/288-ভাঙা'
B289 = csstxt.split('session289 — মাস-প্যানেল খোলা/বন্ধ ঘোষণা', 1)[1]
B289 = B289.split('═══ */', 1)[1].split('/* ═══', 1)[0] if '/* ═══' in B289 else B289
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B289))
assert HEXN == 0, 'ep289-CSS-ব্লকে-হেক্স-%d' % HEXN
for m in [".ep-cal-month::after, .ep-cal-mylabel::after", "content: '\\25BE'",
          '.ep-cal-month.is-open::after', 'rotate(180deg)', 'prefers-reduced-motion']:
    assert m in csstxt, 'CSS-পোস্ট-অ্যাসার্ট-অনুপস্থিত: %s' % m
print('পোস্ট-অ্যাসার্ট-গ্রিন (JS ×১১ + CSS হেক্স-শূন্য ×১ + CSS ×৫)')
print('s289-patch সম্পন্ন (idempotent ×২-প্রস্তুত)')
