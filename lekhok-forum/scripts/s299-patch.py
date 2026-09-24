#!/usr/bin/env python3
# s299-patch.py — session299: ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ (ep299 — PLANS session298-প্রস্তাব)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N + নেমস্পেস-গার্ড +
#         অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট (ইউনিক-সম্পূর্ণ-লাইন — শেয়ার্ড-প্যাটার্ন-গণনা-নিষিদ্ধ
#         session295-গোটচা; [h-ক্ষয়-বাইট-যাচাই — session298-গোটচা; CSS-ব্লক হেক্স-শূন্য + no-regression)
# ডিজাইন: ① একক-ফানেল epk299Prefetch299 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড + link[rel=prefetch]-ইনজেকশন
#         ② ট্রিগার ×৩-শ্রেণি — নির্বাচন (ফিল্ম-ক্লিক — মোবাইল-পথ) + হোভার/ফোকাস (front-sheet) + CTA-হোভার
#         ③ উষ্ণ-সংকেত-মিরর — applyPaper-এ warmed-হিসেব-সামঞ্জস্য (স্টেল-ক্লাস-শূন্য)
#         ④ __epk299QA হুক papers-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি — early-return-এর-আগে)
#         [Mandatory-স্টাইল]: CSS session299-ব্লক — উষ্ণ-হোভার-বাটন অ্যাকসেন্ট-রিং (color-mix) +
#         ফিল্ম-বাটন focus-visible-রিং + হোভার-বাটন-ট্রানজিশন-সম্প্রসারণ + 640px-সংকোচন + রিডিউসড-মোশন
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/partials/home/today.ejs'
CSS = APP + '/public/assets/css/style.css'
MARK = 'session299'

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
EJS_DONE = MARK in v
if EJS_DONE:
    print('EJS-SKIP: মার্কার-উপস্থিত (idempotent — CSS-ধাপে-চলমান)')

if not EJS_DONE:
# ── নেমস্পেস-গার্ড (প্যাচ-FATAL — 299-প্রিফিক্স পূর্ব-শূন্য) ──
    for NS in ('epk299', '__epk299QA', 'epk299Prefetch299', 'epk299-warm', 'epk299Hover299'):
        if NS in v:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)
    
    # ── অ্যাঙ্কর-অ্যাসার্ট (Read-টুল-বাইট; সব ইউনিক) ──
    A1 = ('    sync: epk297Sync297\n'
          '  };\n'
          '  if (!papers.length) return;\n')
    A2 = '  var current = 0, timer = null, paused = false;\n'
    A3 = ('  btns.forEach(function (b) {\n'
          "    b.addEventListener('click', function () {\n"
          "      var i = parseInt(b.getAttribute('data-epk-i'), 10);\n"
          '      if (!isNaN(i)) { applyPaper(i); resetTimer(); }\n'
          '    });\n'
          '  });\n')
    A4 = ('    current = i;\n'
          '  }\n')
    for name, a in [('A1', A1), ('A2', A2), ('A3', A3), ('A4', A4)]:
        if v.count(a) != 1:
            die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, v.count(a)))

# ── এডিট-১: প্রিফেচ-স্টেট + QA-হুক (papers-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি; early-return-এর-আগে) ──
E1 = ('    sync: epk297Sync297\n'
      '  };\n'
      '\n'
      "  /* session299: ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ-স্টেট + QA-হুক (papers-শূন্যে-ও __epk299QA সংজ্ঞায়িত —\n"
      '     পরিবার-চুক্তি; PLANS session298-প্রস্তাব: শিট-ক্লিকে প্রথম-পাতা-রিডার-ডিপ-লিংক-প্রিফেচ — নেভিগেশন-তাৎক্ষণিক) */\n'
      "  var epk299Count = 0, epk299Warmed = {}, epk299Last = '';\n"
      '  window.__epk299QA = {\n'
      '    prefetched: function () { return epk299Count; },\n'
      '    has: function (u) { return !!epk299Warmed[u]; },\n'
      '    last: function () { return epk299Last; },\n'
      '    links: function () { try { return document.querySelectorAll(\'link[rel="prefetch"][data-epk299]\').length; } catch (e299) { return 0; } }\n'
      '  };\n'
      '  if (!papers.length) return;\n')
if not EJS_DONE: v = v.replace(A1, E1, 1)

# ── এডিট-২: একক-ফানেল (ডিডুপ + গার্ড + ইনজেকশন + উষ্ণ-সংকেত) ──
E2 = ('  var current = 0, timer = null, paused = false;\n'
      '\n'
      "  /* session299: একক-ফানেল epk299Prefetch299 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড +\n"
      "     link[rel=prefetch]-ইনজেকশন (ব্রাউজার-লো-প্রায়োরিটি-ক্যাশ-ওয়ার্ম) + উষ্ণ-সংকেত;\n"
      '     সব-ট্রিগার (hover/focus/select/cta) এ-ফানেলেই (session296b-একক-ফানেল-প্রথা) */\n'
      '  function epk299Prefetch299(url, reason299) {\n'
      '    if (!url || epk299Warmed[url]) return false;\n'
      '    var cn299 = navigator.connection || navigator.mozConnection || navigator.webkitConnection;\n'
      '    if (navigator.onLine === false || (cn299 && cn299.saveData)) return false;\n'
      "    epk299Warmed[url] = String(reason299 || 'intent');\n"
      "    epk299Count++; epk299Last = String(reason299 || 'intent');\n"
      '    try {\n'
      "      var l299 = document.createElement('link');\n"
      "      l299.rel = 'prefetch';\n"
      "      l299.as = 'document';\n"
      '      l299.href = url;\n'
      "      l299.setAttribute('data-epk299', '1');\n"
      '      document.head.appendChild(l299);\n'
      '    } catch (e299) {}\n'
      "    if (front) front.classList.add('epk299-warm');\n"
      '    return true;\n'
      '  }\n')
if not EJS_DONE: v = v.replace(A2, E2, 1)

# ── এডিট-৩: ফিল্ম-ক্লিকে নির্বাচন-ট্রিগার + হোভার/ফোকাস/CTA-ট্রিগার ──
E3 = ('  btns.forEach(function (b) {\n'
      "    b.addEventListener('click', function () {\n"
      "      var i = parseInt(b.getAttribute('data-epk-i'), 10);\n"
      "      /* session299: নির্বাচন-ইচ্ছা (মোবাইল-পথ সহ) — নির্বাচিত-পত্রিকার রিডার-ডিপ-লিংক প্রিফেচ */\n"
      '      if (!isNaN(i) && papers[i]) { applyPaper(i); resetTimer(); epk299Prefetch299(papers[i].href, \'select\'); }\n'
      '    });\n'
      '  });\n'
      '\n'
      "  /* session299: হোভার/ফোকাস-ইচ্ছা (ডেস্কটপ) + CTA-হোভার — সব-একক-ফানেলে; mouseenter-নন-বাবলিং তবু\n"
      '     টার্গেট-লিসনারে ডিসপ্যাচে স্বাভাবিক-প্রজ্বলিত (সুইট-প্রমাণ-পথ) */\n'
      '  function epk299Hover299() { if (papers[current]) epk299Prefetch299(papers[current].href, \'hover\'); }\n'
      "  front.addEventListener('mouseenter', epk299Hover299);\n"
      "  front.addEventListener('focusin', epk299Hover299);\n"
      "  if (cta) cta.addEventListener('mouseenter', function () { if (papers[current]) epk299Prefetch299(papers[current].href, 'cta'); });\n")
if not EJS_DONE: v = v.replace(A3, E3, 1)

# ── এডিট-৪: applyPaper-উষ্ণ-সংকেত-মিরর (অপ্রিফেচড-পত্রিকায় ক্লাস-বিলোপ — স্টেল-শূন্য) ──
E4 = ("    if (epk299Warmed[p.href]) { front.classList.add('epk299-warm'); } else { front.classList.remove('epk299-warm'); } /* session299: উষ্ণ-সংকেত-মিরর */\n"
      '    current = i;\n'
      '  }\n')
if not EJS_DONE: v = v.replace(A4, E4, 1)

# ── পোস্ট-অ্যাসার্ট (ইউনিক-সম্পূর্ণ-লাইন) ──
PA = [
    '  window.__epk299QA = {\n',
    '  function epk299Prefetch299(url, reason299) {\n',
    "    if (!url || epk299Warmed[url]) return false;\n",
    '    if (navigator.onLine === false || (cn299 && cn299.saveData)) return false;\n',
    "      l299.setAttribute('data-epk299', '1');\n",
    '  function epk299Hover299() { if (papers[current]) epk299Prefetch299(papers[current].href, \'hover\'); }\n',
    "  front.addEventListener('focusin', epk299Hover299);\n",
    "    if (epk299Warmed[p.href]) { front.classList.add('epk299-warm'); } else { front.classList.remove('epk299-warm'); } /* session299: উষ্ণ-সংকেত-মিরর */\n",
]
for a in PA:
    if not EJS_DONE and v.count(a) != 1:
        die('পোস্ট-অ্যাসার্ট-কাউন্ট=%d — প্যাটার্ন: %s' % (v.count(a), a.strip()[:60]))
# হুক early-return-এর-আগে (পরিবার-চুক্তি)
HL = v.find('window.__epk299QA = {')
RL = v.find('if (!papers.length) return;')
if HL < 0 or RL < 0 or HL > RL:
    die('হুক-ক্রম (H=%d R=%d — early-return-এর-আগে-প্রত্যাশিত)' % (HL, RL))

if not EJS_DONE:
    wr(EJS, v)
    print('today.ejs-প্যাচ-সম্পন্ন')
# hbracket-ক্ষয়-বাইট-যাচাই (session298-গোটচা-২) — সেগমেন্ট-অক্ষত (আক্ষরিক h-bracket এড়িয়ে)
if not EJS_DONE:
    for seg in ('[rel="prefetch"]', '[data-epk299]'):
        if seg not in v:
            die('hbracket-ক্ষয়-সন্দেহ — সেগমেন্ট-অনুপস্থিত: %s' % seg)

# ═══════════ ফাইল-২: style.css (CSS session299-ব্লক) ═══════════
c = rd(CSS)
if MARK in c:
    print('CSS-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)
if 'epk299' in c:
    die('CSS-নেমস্পেস-epk299-পূর্ব-উপস্থিত (গার্ড)')

CEOF = '/* ═══════════ EOF সেশন ২৯৭ ═══════════ */\n'
if c.count(CEOF) != 1:
    die('CSS-EOF297-অ্যাঙ্কর-কাউন্ট=%d' % c.count(CEOF))

BLOCK = (
    '\n'
    '/* ═══════════ সেশন ২৯৯ (session299 — ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep299 + প্রবেশ-পলিশ) ═══════════ */\n'
    '/* ① উষ্ণ-সংকেত — প্রিফেচড-পত্রিকার হোভার-বাটন প্রস্তুত-অবস্থা (অ্যাকসেন্ট-রিং + উজ্জ্বলতা — transform-অস্পৃশ্য) */\n'
    '.epk291-front.epk299-warm .epk291-hoverbtn296 {\n'
    '  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.30), 0 0 0 2px color-mix(in srgb, var(--epkAcc291, var(--lf-brand-primary)) 55%, transparent);\n'
    '  filter: brightness(1.06);\n'
    '}\n'
    '.epk291-front.epk299-warm .epk291-hover296 {\n'
    '  background: linear-gradient(to top, rgba(15, 23, 42, 0.52) 0%, rgba(15, 23, 42, 0.10) 55%);\n'
    '}\n'
    '/* ② উষ্ণ-শিট-প্রান্ত — প্রিফেচড-পত্রিকার ধারে অ্যাকসেন্ট-ফেড (সলিড→স্বচ্ছ — উষ্ণতার দৃশ্য-সংকেত; s291-সলিড-সুপারসেট) */\n'
    '.epk291-front.epk299-warm .epk291-edge {\n'
    '  background: linear-gradient(to bottom, color-mix(in srgb, var(--epkAcc291, var(--lf-brand-primary)) 65%, transparent), color-mix(in srgb, var(--epkAcc291, var(--lf-brand-primary)) 18%, transparent));\n'
    '}\n'
    '/* ③ হোভার-বাটন ট্রানজিশন-সম্প্রসারণ (উষ্ণ-সংকেত-মসৃণ — s296-ট্রানজিশন-সুপারসেট) */\n'
    '.epk291-hoverbtn296 { transition: transform .22s ease, box-shadow .22s ease, filter .22s ease; }\n'
    '/* ④ 640px-সংকোচন (টাচ-সারফেসে উষ্ণ-সংকেত-শান্ত) */\n'
    '@media (max-width: 640px) {\n'
    '  .epk291-front.epk299-warm .epk291-hoverbtn296 { filter: none; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.30); }\n'
    '}\n'
    '/* ⑤ রিডিউসড-মোশন গার্ড */\n'
    '@media (prefers-reduced-motion: reduce) {\n'
    '  .epk291-hoverbtn296, .epk291-front.epk299-warm .epk291-hoverbtn296 { transition: none; }\n'
    '}\n'
    '/* ═══════════ EOF সেশন ২৯৯ ═══════════ */\n'
)
c = c.replace(CEOF, CEOF + BLOCK, 1)

# ── CSS-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য (ব্লক-বিস্তারে) ──
for a in (
    '.epk291-front.epk299-warm .epk291-hoverbtn296 {\n',
    '.epk291-front.epk299-warm .epk291-edge {\n',
    '.epk291-hoverbtn296 { transition: transform .22s ease, box-shadow .22s ease, filter .22s ease; }\n',
    '/* ═══════════ EOF সেশন ২৯৯ ═══════════ */\n',
):
    if c.count(a) != 1:
        die('CSS-পোস্ট-অ্যাসার্ট-কাউন্ট=%d — প্যাটার্ন: %s' % (c.count(a), a.strip()[:60]))
B0 = c.find('/* ═══════════ সেশন ২৯৯')
B1 = c.find('/* ═══════════ EOF সেশন ২৯৯ ═══════════ */')
if B0 < 0 or B1 < 0 or B1 <= B0:
    die('CSS-ব্লক-বিস্তার-নির্ণয়-ব্যর্থ')
BLK299 = c[B0:B1]
HEX = re.findall(r'#[0-9a-fA-F]{3,8}\b', BLK299)
if HEX:
    die('CSS-ব্লক-হেক্স-উপস্থিত (নিষিদ্ধ): %s' % HEX[:4])
# no-reg: পূর্ব-সেশন-মার্কার অক্ষুণ্ণ
for K in ('EOF সেশন ২৯৭', 'EOF সেশন ২৯৬', '__epk297QA'):
    pass  # CSS-ফাইলে জেএস-হুক-নেই — নিচের তালিকা-ভিত্তিক
if 'EOF সেশন ২৯৭' not in c or 'EOF সেশন ২৯৬' not in c:
    die('no-reg-ব্যর্থ (পূর্ব-EOF-মার্কার-অনুপস্থিত)')
wr(CSS, c)
print('style.css-প্যাচ-সম্পন্ন')

# ═══════════ EJS-compile-যাচাই ═══════════
import subprocess
R = subprocess.run(['node', '-e',
    "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('%s','utf8'),{filename:'today.ejs'});console.log('COMPILE-OK');" % EJS],
    cwd=APP, capture_output=True, text=True)
if 'COMPILE-OK' not in R.stdout:
    die('EJS-compile-ব্যর্থ: %s' % R.stderr[:200])
print('PATCH-OK session299 (ep299 — প্রিফেচ + স্টাইল-ব্লক)')
