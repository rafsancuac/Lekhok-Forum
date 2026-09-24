#!/usr/bin/env python3
# s297-patch.py — session297: ভিউপোর্ট-সচেতন কিয়স্ক অটো-স্লাইড (ep297 — session296-প্রস্তাব)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N + পোস্ট-অ্যাসার্ট
#         (ইউনিক-সম্পূর্ণ-লাইন — শেয়ার্ড-প্যাটার্ন-সর্ব-ফাইল-গণনা-নিষিদ্ধ (session295-গোটচা);
#         অ্যাঙ্কর Read-টুল-থেকে (বাইট-নিরাপদ — session296b-গোটচা); CSS-ব্লক হেক্স-শূন্য + no-regression)
# ডিজাইন: ① IntersectionObserver (threshold .12) — today-epaper অদৃশ্যে টাইমার-সম্পূর্ণ-বন্ধ (CPU-সাশ্রয়)
#         ② visibilitychange — লুকানো-ট্যাবে বন্ধ ③ tick-গেট (inView && tabVisible && !paused)
#         ④ __epk297QA হুক papers-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি) ⑤ IO-অসমর্থিতে আচরণ-অপরিবর্তিত
#         [Mandatory-স্টাইল]: CSS session297-ব্লক — 1440px-৫-কলাম (s296-র 1280-চুক্তি অক্ষুণ্ণ) + ফিল্ম/CTA-পলিশ
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/partials/home/today.ejs'
CSS = APP + '/public/assets/css/style.css'
MARK = 'session297'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ═══════════ ফাইল-১: today.ejs (ইঞ্জিন) ═══════════
v = rd(EJS)
if MARK in v:
    print('PATCH-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)

# ── নেমস্পেস-গার্ড (প্যাচ-FATAL — 297-প্রিফিক্স পূর্ব-শূন্য) ──
for NS in ('epk297', '__epk297QA', 'epk297Sync297', 'epk297InView'):
    if NS in v:
        die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)

# ── অ্যাঙ্কর-অ্যাসার্ট (Read-টুল-বাইট; সব ইউনিক) ──
A1 = ('  var papers = <%- teJson291 %>;\n'
      '  if (!papers.length) return;\n')
A2 = ('    timer = setInterval(function () {\n'
      '      if (!paused) applyPaper((current + 1) % papers.length);\n'
      '    }, 3500);\n')
A3 = ("  kiosk.addEventListener('focusout', function (e) {\n"
      '    if (!kiosk.contains(e.relatedTarget)) paused = false;\n'
      '  });\n')
for name, a in [('A1', A1), ('A2', A2), ('A3', A3)]:
    if v.count(a) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, v.count(a)))

# ── এডিট-১: স্টেট-ভের্স + QA-হুক (papers-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি) ──
E1 = ('  var papers = <%- teJson291 %>;\n'
      '\n'
      "  /* session297: ভিউপোর্ট-সচেতন অটো-স্লাইড-স্টেট + QA-হুক (papers-শূন্যে-ও __epk297QA সংজ্ঞায়িত —\n"
      '     পরিবার-চুক্তি; session296-প্রস্তাব: অদৃশ্য-সেকশনে/লুকানো-ট্যাবে ইঞ্জিন-স্থগিত — CPU-সাশ্রয়) */\n'
      '  var epk297InView = true, epk297TabVisible = true, epk297TickN = 0, epk297IO = null;\n'
      '  window.__epk297QA = {\n'
      '    inView: function () { return epk297InView; },\n'
      '    tabVisible: function () { return epk297TabVisible; },\n'
      '    ioOn: function () { return !!epk297IO; },\n'
      '    timerOn: function () { return !!timer; },\n'
      '    tickN: function () { return epk297TickN; },\n'
      '    current: function () { return papers.length ? current : -1; },\n'
      '    tick: function () { if (papers.length) { applyPaper((current + 1) % papers.length); return true; } return false; },\n'
      '    sync: epk297Sync297\n'
      '  };\n'
      '  if (!papers.length) return;\n')
v = v.replace(A1, E1, 1)

# ── এডিট-২: tick-গেট (inView + tabVisible + !paused — কাউন্টার-সহ) ──
E2 = ('    timer = setInterval(function () {\n'
      '      if (!paused && epk297InView && epk297TabVisible) { epk297TickN++; applyPaper((current + 1) % papers.length); }\n'
      '    }, 3500);\n')
v = v.replace(A2, E2, 1)

# ── এডিট-৩: IO + visibilitychange-ওয়্যারিং (সেকশন-অদৃশ্যে টাইমার-সম্পূর্ণ-বন্ধ; দৃশ্যমানতায় পুনঃ-সূচনা) ──
E3 = (A3
      + '\n'
      '  /* session297: ভিউপোর্ট-সচেতন অটো-স্লাইড — IO (threshold .12) + visibilitychange দু-স্তরে\n'
      '     ইঞ্জিন-স্থগিত (অদৃশ্য-সেকশনে টাইমার-সম্পূর্ণ-বন্ধ — CPU-সাশ্রয়); দৃশ্যমানতায় পুনঃ-সূচনা।\n'
      '     IO-অসমর্থিত-ব্রাউজারে epk297InView=true-পূর্বস্থ — আচরণ-অপরিবর্তিত (গ্রেসফুল-ডিগ্রেডেশন)। */\n'
      '  function epk297Sync297() {\n'
      '    if (!papers.length) return;\n'
      '    var run297 = epk297InView && epk297TabVisible;\n'
      '    if (run297 && !timer) startTimer();\n'
      '    else if (!run297 && timer) { clearInterval(timer); timer = null; }\n'
      '  }\n'
      '  try {\n'
      "    if ('IntersectionObserver' in window) {\n"
      '      epk297IO = new IntersectionObserver(function (entries297) {\n'
      '        var en297 = entries297 && entries297[0];\n'
      '        epk297InView = !!(en297 && en297.isIntersecting);\n'
      '        epk297Sync297();\n'
      '      }, { threshold: 0.12 });\n'
      '      epk297IO.observe(section);\n'
      '    }\n'
      "  } catch (e297) { epk297IO = null; epk297InView = true; }\n"
      "  document.addEventListener('visibilitychange', function () {\n"
      '    epk297TabVisible = !(document.hidden === true);\n'
      '    epk297Sync297();\n'
      '  });\n')
v = v.replace(A3, E3, 1)

wr(EJS, v)

# ── পোস্ট-অ্যাসার্ট (today.ejs — ইউনিক-সম্পূর্ণ-লাইন) ──
v2 = rd(EJS)
def need1(s, what):
    if v2.count(s) != 1:
        die('পোস্ট-%s-কাউন্ট=%d (১-প্রত্যাশিত)' % (what, v2.count(s)))

need1('  var epk297InView = true, epk297TabVisible = true, epk297TickN = 0, epk297IO = null;\n', 'স্টেট-ভের্স-লাইন')
need1('  window.__epk297QA = {\n', 'QA-হুক')
need1('      if (!paused && epk297InView && epk297TabVisible) { epk297TickN++; applyPaper((current + 1) % papers.length); }\n', 'tick-গেট-লাইন')
need1('  function epk297Sync297() {\n', 'sync-ফাংশন')
need1('      epk297IO.observe(section);\n', 'IO-observe')
need1("  document.addEventListener('visibilitychange', function () {\n", 'visibilitychange')
need1('      }, { threshold: 0.12 });\n', 'threshold')
# ক্রম-যাচাই: হুক papers-এর-পরে-কিন্তু early-return-এর-আগে (পরিবার-চুক্তি — শূন্যে-ও-সংজ্ঞায়িত)
if v2.find('window.__epk297QA = {') > v2.find('if (!papers.length) return;'):
    die('হুক-early-return-এর-পরে-চলে-গেছে (ক্রম-ভঙ্গ)')
# no-regression অ্যাঙ্কর (অক্ষুণ্ণ — s291/s292/s296-চুক্তি)
for NR in ('if (window.__epk291wired) return;', '}, 3500);', 'window.__epk292QA = {',
           'function setImg296(p) {', 'function applyPaper(i) {', 'applyPaper(0);',
           'startTimer();', "img.addEventListener('load', showImg296);", 'chain.shift();',
           "section.addEventListener('mouseenter', function () { paused = true; });",
           'if (!chain.length || img.getAttribute(\'src\') !== chain[0]) return;',
           '<div class="te-stats296" role="list"'):
    if NR not in v2:
        die('no-reg-অ্যাঙ্কর-অনুপস্থিত: %s' % NR[:60])

# ═══════════ ফাইল-২: style.css (session297-ব্লক) ═══════════
c = rd(CSS)
if 'EOF সেশন ২৯৭' in c:
    die('CSS-ব্লক-পূর্ব-উপস্থিত (EJS-প্রয়োগ-পরে CSS-ব্যর্থ — অসামঞ্জস্য)')
ANCHOR_CSS = '/* ═══════════ EOF সেশন ২৯৬ (session296 প্রশস্ত কিয়স্ক) ═══════════ */'
if c.count(ANCHOR_CSS) != 1:
    die('CSS-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % c.count(ANCHOR_CSS))

BLOCK = ANCHOR_CSS + '''

/* ═══════════ সেশন ২৯৭ (session297 — ভিউপোর্ট-সচেতন কিয়স্ক ep297 + ফিল্ম/CTA প্রিমিয়াম-পলিশ) ═══════════ */
/* ① ফিল্ম-গ্রিড ৫-কলাম — ≥1440px (s296-র 1280-চৌকাঠে ৪-কলাম-চুক্তি অক্ষুণ্ণ; ৮-বাটনে প্রশস্ত-ভারসাম্য) */
@media (min-width: 1440px) {
  .epk291-film { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
/* ② ফিল্ম-বাটন পলিশ — হোভার-লিফট + সফট-ছায়া + :active-স্কেল */
.epk291-film-btn { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.epk291-film-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 9px rgba(0, 0, 0, 0.14); }
.epk291-film-btn:active { transform: translateY(0) scale(.98); }
/* ③ নির্বাচিত-বাটন — অ্যাকসেন্ট-রিং (per-paper --epkAcc291 — s291-ভেরিয়েবল-উত্তরাধিকার) */
.epk291-film-btn[aria-selected="true"] { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22), 0 0 0 1px color-mix(in srgb, var(--epkAcc291, var(--lf-brand-primary)) 24%, transparent); }
/* ④ মিনি-থাম্ব পলিশ — হোভারে হালকা-ঘোরানো + বৃদ্ধি (নির্বাচিত-অবস্থার লিফটের সাথে-সামঞ্জস্য) */
.epk291-film-thumb { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
.epk291-film-btn:hover .epk291-film-thumb { transform: rotate(-1.4deg) scale(1.05); }
/* ⑤ প্রবেশ-CTA পলিশ — হোভার-লিফট + ছায়া */
#teKioskCta291 { transition: transform .16s ease, box-shadow .16s ease; }
#teKioskCta291:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
/* ⑥ রিডিউসড-মোশন গার্ড */
@media (prefers-reduced-motion: reduce) {
  .epk291-film-btn, .epk291-film-thumb, #teKioskCta291 { transition: none; }
  .epk291-film-btn:hover, .epk291-film-btn:active, .epk291-film-btn:hover .epk291-film-thumb, #teKioskCta291:hover { transform: none; }
}
/* ═══════════ EOF সেশন ২৯৭ ═══════════ */
'''
c = c.replace(ANCHOR_CSS, BLOCK, 1)
wr(CSS, c)

# ── পোস্ট-অ্যাসার্ট (style.css) ──
c2 = rd(CSS)
if c2.count('repeat(4, minmax(0, 1fr));') != 1:
    die('s296-৪-কলাম-লিটারাল-কাউন্ট=%d (১-প্রত্যাশিত — অক্ষুণ্ণ)' % c2.count('repeat(4, minmax(0, 1fr));'))
if c2.count('repeat(5, minmax(0, 1fr));') != 1:
    die('৫-কলাম-লিটারাল-কাউন্ট=%d (১-প্রত্যাশিত)' % c2.count('repeat(5, minmax(0, 1fr));'))
if 'EOF সেশন ২৯৭' not in c2:
    die('EOF-২৯৭-মার্কার-অনুপস্থিত')
# সেশন-২৯৭-ব্লক-স্কোপড হেক্স-শূন্য
i0 = c2.find('সেশন ২৯৭ (session297')
i1 = c2.find('EOF সেশন ২৯৭', i0)
if i0 == -1 or i1 == -1:
    die('CSS-২৯৭-ব্লক-বাউন্ডারি-অনুপস্থিত')
BLK = c2[i0:i1]
HEXN = re.findall(r'#[0-9a-fA-F]{3,8}', BLK)
if HEXN:
    die('CSS-ব্লকে-হেক্স: %s' % HEXN[:3])
for TOK in ('@media (min-width: 1440px)', 'prefers-reduced-motion', 'var(--lf-brand-primary)', 'color-mix(in srgb'):
    if TOK not in BLK:
        die('CSS-টোকেন-অনুপস্থিত: %s' % TOK)

print('PATCH-OK: session297 ভিউপোর্ট-সচেতন কিয়স্ক + পলিশ প্রয়োগ (ep297)')
