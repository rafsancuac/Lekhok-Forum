#!/usr/bin/env python3
# s288-patch.py — session288 (cron 403679): ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন ep288
# চুক্তি: idempotent (মার্কার-গার্ড ×৪-এডিট) + পোস্ট-অ্যাসার্ট + বাইট-সত্য-উৎস
# এডিট-তালিকা:
#   ① epaper.ejs — স্টেপার-aria-label আচরণ-মিল-সংশোধন (epCalPrev=calM++ → "পরের মাস";
#                   epCalNext=calM-- → "আগের মাস" — লেবেল-বনাম-আচরণ-বৈপরীত্য-বাগ-ফিক্স)
#   ② epaper.ejs — aria-live লাইভ-রিজিয়ন-মার্কআপ (epCalGrid-পরে: role=status + aria-live=polite)
#   ③ epaper.ejs — session288 মডিউল (ep288Say/ep288DayLabel/ep288SyncAria + engaged-গেট +
#                   ep287SetActive-র‍্যাপার (দিন-ঘোষণা) + calRender-র‍্যাপার (aria-সিঙ্ক + মাস-ঘোষণা) + __ep288QA)
#   ④ epaper.css — ep288 ব্লক (হেক্স-শূন্য টোকেন-শুধু: sr-only লাইভ-রিজিয়ন + aria-current-দৃশ্যমান-রিং)
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

# ── ① স্টেপার-aria-label আচরণ-মিল-সংশোধন (লেবেল=আচরণ — SR-ব্যবহারকারী-সত্য) ──
LBL_PREV_OLD = '<button type="button" class="ep-cal-btn" id="epCalPrev" aria-label="আগের মাস">'
LBL_PREV_NEW = '<button type="button" class="ep-cal-btn" id="epCalPrev" aria-label="পরের মাস">'
LBL_NEXT_OLD = '<button type="button" class="ep-cal-btn" id="epCalNext" aria-label="পরের মাস">'
LBL_NEXT_NEW = '<button type="button" class="ep-cal-btn" id="epCalNext" aria-label="আগের মাস">'
if LBL_PREV_NEW in ej and LBL_NEXT_NEW in ej:
    print('skip-①: স্টেপার-aria-label ইতোমধ্যে সংশোধিত')
else:
    assert ej.count(LBL_PREV_OLD) == 1, 'epCalPrev-label ×%d' % ej.count(LBL_PREV_OLD)
    assert ej.count(LBL_NEXT_OLD) == 1, 'epCalNext-label ×%d' % ej.count(LBL_NEXT_OLD)
    ej = ej.replace(LBL_PREV_OLD, LBL_PREV_NEW, 1).replace(LBL_NEXT_OLD, LBL_NEXT_NEW, 1)
    changed += 1
    print('ok-①: স্টেপার-aria-label আচরণ-মিল-সংশোধিত')

# ── ② aria-live লাইভ-রিজিয়ন-মার্কআপ ──
GRID_ANCHOR = '<div class="ep-cal-grid" id="epCalGrid"></div>'
LIVE_MARK = '<div class="ep-cal-grid" id="epCalGrid"></div>\n        <span class="ep-cal-live" id="epCalLive" role="status" aria-live="polite"></span>'
if 'id="epCalLive"' in ej:
    assert 'aria-live="polite"' in ej, 'লাইভ-রিজিয়ন-আংশিক'
    print('skip-②: লাইভ-রিজিয়ন-মার্কআপ ইতোমধ্যে')
else:
    assert ej.count(GRID_ANCHOR) == 1, 'GRID_ANCHOR ×%d' % ej.count(GRID_ANCHOR)
    ej = ej.replace(GRID_ANCHOR, LIVE_MARK, 1)
    changed += 1
    print('ok-②: লাইভ-রিজিয়ন-মার্কআপ স্থাপিত')

# ── ③ session288 মডিউল ──
JS_ANCHOR = '  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */'
MODULE = '''  /* ═══════════ session288 (cron 403679): ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন (ep288) ═══════════
     aria-live (polite/role=status) লাইভ-রিজিয়নে বাংলা-ঘোষণা: রোভিং-নেভে দিন (আজ/নির্বাচিত/
     সংরক্ষিত-সাফিক্স), স্টেপার/মাস-জাম্পে মাস-ঘোষণা; **বুট-নীরব (engaged-গেট — প্রথম
     ব্যবহারকারী-ইনপুটেই সক্রিয় — লোডে-ঘোষণা-কোলাহল-শূন্য)**; দিন-বাটনে aria-label (বাংলা-তারিখ +
     অবস্থা-সাফিক্স) + is-sel-দিনে aria-current="date"; স্টেপার-aria-label আচরণ-মিল-সংশোধন
     (epCalPrev=calM++ → "পরের মাস"; epCalNext=calM-- → "আগের মাস"); র‍্যাপার-স্তর
     (ep287SetActive/calRender-বডি-অস্পৃশ্য; ঘোষণা-আর-ডাক-এক-নাম — s285-নাম-মিল-গোটচা); __ep288QA হুক। */
  var ep288Last = '', ep288Engaged = false, ep288LastMY = '';
  var elCalLive = document.getElementById('epCalLive');
  function ep288Say(msg) {
    ep288Last = String(msg || '');
    if (elCalLive) { try { elCalLive.textContent = ep288Last; } catch (e) {} }
  }
  function ep288DayLabel(d, b) {
    var s = bnShort279(d);
    if (!b) return s;
    if (b.classList.contains('is-today')) s += ' (আজ)';
    if (b.classList.contains('is-sel')) s += ' (নির্বাচিত)';
    else if (b.classList.contains('has')) s += ' — সংরক্ষিত সংখ্যা আছে';
    return s;
  }
  function ep288SyncAria() {
    if (!elCalGrid) return;
    elCalGrid.querySelectorAll('.ep-cal-day').forEach(function (b) {
      var d = b.getAttribute('data-d') || '';
      b.setAttribute('aria-label', ep288DayLabel(d, b));
      if (b.classList.contains('is-sel')) b.setAttribute('aria-current', 'date');
      else b.removeAttribute('aria-current');
    });
  }
  /* engaged-গেট: গ্রিড-কীবোর্ড/স্টেপার/মাস-ট্রিগার-ইনপুটেই সক্রিয় — বুট/প্রোগ্রাম্যাটিক-আর্ম-নীরব */
  if (elCalGrid) elCalGrid.addEventListener('keydown', function () { ep288Engaged = true; }, true);
  if (elCalPrev) elCalPrev.addEventListener('click', function () { ep288Engaged = true; });
  if (elCalNext) elCalNext.addEventListener('click', function () { ep288Engaged = true; });
  if (elCalMonth) elCalMonth.addEventListener('click', function () { ep288Engaged = true; });
  /* ep287SetActive-র‍্যাপার — রোভিং/জাম্প/আর্ম-পরে দিন-ঘোষণা (engaged-গেট; ep287-বডি-অস্পৃশ্য) */
  var ep288SetActiveBase = ep287SetActive;
  ep287SetActive = function (d, doFocus) {
    ep288SetActiveBase(d, doFocus);
    if (ep288Engaged && ep287Active) {
      var b = elCalGrid ? elCalGrid.querySelector('.ep-cal-day[data-d="' + ep287Active + '"]') : null;
      ep288Say(ep288DayLabel(ep287Active, b));
    }
  };
  /* calRender-র‍্যাপার — aria-সিঙ্ক (aria-label + aria-current) + মাস-পরিবর্তনে মাস-ঘোষণা
     (ep287-র‍্যাপার-চেইনের-পরে — মাস-ঘোষণা দিন-ঘোষণা-ওভাররাইট করে; engaged-গেট) */
  var ep288CalRenderBase = calRender;
  calRender = function () {
    var my = calY + '-' + calM;
    ep288CalRenderBase();
    ep288SyncAria();
    if (ep288Engaged && my !== ep288LastMY) {
      ep288Say('মাস: ' + bnMonths279[calM] + ' ' + bnDigits(calY));
    }
    ep288LastMY = calY + '-' + calM;
  };
  /* session288 QA-হুক (__ep288QA — সারফেস-নেমস্পেস-রীতি; লাইভ-রিজিয়ন-প্রমাণ) */
  window.__ep288QA = {
    last: function () { return ep288Last; },
    say: function (m) { ep288Say(m); },
    engaged: function () { return ep288Engaged; },
    label: function (d) { var b = elCalGrid ? elCalGrid.querySelector('.ep-cal-day[data-d="' + d + '"]') : null; return ep288DayLabel(d, b); },
    current: function () { var b = elCalGrid ? elCalGrid.querySelector('.ep-cal-day[aria-current="date"]') : null; return b ? (b.getAttribute('data-d') || '') : ''; },
    labeled: function () { return elCalGrid ? elCalGrid.querySelectorAll('.ep-cal-day[aria-label]').length : 0; }
  };

'''
if 'window.__ep288QA' in ej:
    assert '__ep288QA' in ej and 'ep288Last' in ej and 'ep288SetActiveBase' in ej and 'ep288CalRenderBase' in ej, 'মডিউল-আংশিক'
    print('skip-③: ep288-মডিউল ইতোমধ্যে')
elif JS_ANCHOR not in ej:
    print('FATAL: JS_ANCHOR অনুপস্থিত'); sys.exit(1)
else:
    n = ej.count(JS_ANCHOR)
    assert n == 1, 'JS_ANCHOR ×%d' % n
    ej = ej.replace(JS_ANCHOR, MODULE + JS_ANCHOR, 1)
    changed += 1
    print('ok-③: ep288-মডিউল স্থাপিত')

# ── ④ epaper.css ep288 ব্লক (হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session288 — ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন (ep288 — হেক্স-শূন্য টোকেন-শুধু;
       aria-live-স্ক্রিন-রিডার-লাইভ-রিজিয়ন (sr-only) + aria-current-দৃশ্যমান-রিং) ═══ */
.ep-cal-live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }
.ep-cal-day[aria-current="date"] { outline: 2px solid var(--lf-white); outline-offset: -3px; }
'''
if 'session288 — ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন' in cs:
    assert '.ep-cal-live' in cs, 'css-আংশিক'
    print('skip-④: ep288-সিএসএস-ব্লক ইতোমধ্যে')
else:
    cs = cs.rstrip('\n') + '\n' + CSS_BLOCK
    changed += 1
    print('ok-④: ep288-সিএসএস-ব্লক স্থাপিত')

# ── পোস্ট-অ্যাসার্ট (বাইট-সত্য-উৎস) ──
for tok in ('window.__ep288QA', 'function ep288Say', 'function ep288DayLabel', 'function ep288SyncAria',
            'ep288SetActiveBase', 'ep288CalRenderBase', 'ep288Engaged = true',
            'id="epCalLive"', 'role="status"', 'aria-live="polite"',
            'id="epCalPrev" aria-label="পরের মাস"', 'id="epCalNext" aria-label="আগের মাস"',
            "b.setAttribute('aria-label'", "'aria-current', 'date'",
            'window.__ep287QA', 'window.__ep286QA', 'window.__ep285QA', 'window.__ep284QA', 'window.__ep283QA'):
    assert tok in ej, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (ejs): ' + tok
for tok in ('.ep-cal-live', '.ep-cal-day[aria-current="date"]', 'clip-path: inset(50%)'):
    assert tok in cs, 'পোস্ট-অ্যাসার্ট-ব্যর্থ (css): ' + tok
HEXTAIL = re.search(r'session288 — ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন.*', cs, re.S).group(0)
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', HEXTAIL))
assert HEXN == 0, 'ep288-ব্লকে হেক্স %d' % HEXN

if changed:
    open(EJS, 'w', encoding='utf-8').write(ej)
    open(CSS, 'w', encoding='utf-8').write(cs)
    print('সম্পন্ন: %d-এডিট প্রয়োগ (idempotent-নিশ্চিত — পুনঃরানে skip ×৪)' % changed)
else:
    print('সম্পন্ন: শূন্য-এডিট (idempotent ×২-প্রমাণ — সব-skip)')
