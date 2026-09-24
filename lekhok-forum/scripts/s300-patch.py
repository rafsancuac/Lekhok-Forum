#!/usr/bin/env python3
# s300-patch.py — session300: ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep300 (আর্কাইভ-পিল/তালিকা-সারফেস; PLANS session299-প্রস্তাব)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N + নেমস্পেস-গার্ড +
#         অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট (ইউনিক-সম্পূর্ণ-লাইন — শেয়ার্ড-প্যাটার্ন-গণনা-নিষিদ্ধ
#         session295-গোটচা; h-bracket-ক্ষয়-বাইট-যাচাই — session298/299-গোটচা; CSS-ব্লক হেক্স-শূন্য)
# ডিজাইন: ① একক-ফানেল epk300Prefetch300 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড + link[rel=prefetch]-ইনজেকশন
#         ② ট্রিগার — পিল (mouseenter/focusin — per-node, সার্ভার-রেন্ডারড) + তালিকা-আইটেম (mouseover/focusin
#            ডেলিগেশন — renderList-পুনঃরেন্ডার-নিরাপদ)
#         ③ উষ্ণ-সংকেত — warmed-has-মিরর (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা — স্টেল-ক্লাস-শূন্য; s299-মিরর-ধর্ম)
#         ④ __epk300QA হুক papers-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি — early-return-এর-আগে)
#         ⑤ বুট/apply-প্রিফেচ-নিষিদ্ধ — ইচ্ছা-গেট-ধর্ম (ep299-সুপারসেট)
#         [Mandatory-স্টাইল]: epaper.css session300-ব্লক — উষ্ণ-পিল অ্যাকসেন্ট-রিং (:not(.is-active)-সংঘর্ষ-শূন্য) +
#         উষ্ণ-আইটেম সফট-প্রান্ত (:not(.is-on)::before) + 640px-সংকোচন + রিডিউসড-মোশন; press-ফর্ম আপলোড-ক্ষেত্র
#         dashed-affordance + focus-within-রিং (token-only, বিদ্যমান-ফাইল-ইনপুট-স্টাইল-শূন্য → সংঘর্ষ-অসম্ভব)
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/user/epaper.ejs'
EP  = APP + '/public/assets/css/epaper.css'
PRS = APP + '/views/user/moderator-press.ejs'
SEC = APP + '/admin/views/admin/sections.ejs'
MARK = 'session300'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ═══════════ ফাইল-১: epaper.ejs (ইঞ্জিন) ═══════════
v = rd(EJS)
EJS_DONE = ('epk300Prefetch300' in v)

if EJS_DONE:
    print('EJS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    # ── নেমস্পেস-গার্ড (প্যাচ-FATAL — 300-প্রিফিক্স পূর্ব-শূন্য) ──
    for NS in ('epk300', '__epk300QA', 'epk300-warm', 'ep300Count'):
        if NS in v:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)

    # ── অ্যাঙ্কর-১ (হুক-ব্লক — early-return-এর-ঠিক-আগে) ──
    A1 = ('  var activeId = null;\n'
          '  if (!papers.length || !elList) return;\n')
    if v.count(A1) != 1:
        die('অ্যাঙ্কর-১-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A1))
    B1 = (
"  var activeId = null;\n"
"  /* session300: ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ-স্টেট + QA-হুক (papers-শূন্যে-ও __epk300QA সংজ্ঞায়িত —\n"
"     পরিবার-চুক্তি; PLANS session299-প্রস্তাব: আর্কাইভ-পিল/তালিকা-ইচ্ছায় /epaper?file=<id> প্রিফেচ — ক্যাশ-ওয়ার্ম) */\n"
"  var ep300Count = 0, epk300Warmed = {}, ep300Last = '';\n"
"  window.__epk300QA = {\n"
"    prefetched: function () { return ep300Count; },\n"
"    has: function (u) { return !!epk300Warmed[u]; },\n"
"    last: function () { return ep300Last; },\n"
"    links: function () { try { return document.querySelectorAll('link[rel=\"prefetch\"][data-epk300]').length; } catch (e300) { return 0; } },\n"
"    pills: function () { try { return document.querySelectorAll('.ep-strip294-pill').length; } catch (e300) { return 0; } }\n"
"  };\n"
"  if (!papers.length || !elList) return;\n")
    v = v.replace(A1, B1, 1)

    # ── অ্যাঙ্কর-২ (ফানেল+ট্রিগার-ব্লক — ইঞ্জিন-IIFE-সমাপ্তির-আগে) ──
    A2 = ("    expSearch: function () { return elPsSearch ? (elPsSearch.getAttribute('aria-expanded') || '') : ''; }\n"
          "  };\n"
          "})();\n")
    if v.count(A2) != 1:
        die('অ্যাঙ্কর-২-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A2))
    B2 = (
"    expSearch: function () { return elPsSearch ? (elPsSearch.getAttribute('aria-expanded') || '') : ''; }\n"
"  };\n"
"\n"
"  /* session300: একক-ফানেল epk300Prefetch300 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড +\n"
"     link[rel=prefetch]-ইনজেকশন (ব্রাউজার-লো-প্রায়োরিটি-ক্যাশ-ওয়ার্ম); বুট/apply-প্রিফেচ-নিষিদ্ধ —\n"
"     ইচ্ছা-গেট-ধর্ম (ep299-সুপারসেট); সব-ট্রিগার এ-ফানেলেই (একক-ফানেল-প্রথা) */\n"
"  function epk300Prefetch300(url, reason300) {\n"
"    if (!url || epk300Warmed[url]) return false;\n"
"    var cn300 = navigator.connection || navigator.mozConnection || navigator.webkitConnection;\n"
"    if (navigator.onLine === false || (cn300 && cn300.saveData)) return false;\n"
"    epk300Warmed[url] = String(reason300 || 'intent');\n"
"    ep300Count++; ep300Last = String(reason300 || 'intent');\n"
"    try {\n"
"      var l300 = document.createElement('link');\n"
"      l300.rel = 'prefetch';\n"
"      l300.as = 'document';\n"
"      l300.href = url;\n"
"      l300.setAttribute('data-epk300', '1');\n"
"      document.head.appendChild(l300);\n"
"    } catch (e300) {}\n"
"    return true;\n"
"  }\n"
"  function epk300Url300(id300) { return '/epaper?file=' + encodeURIComponent(String(id300)); }\n"
"\n"
"  /* session300: পিল-ইচ্ছা (mouseenter-নন-বাবলিং → per-node লিসনার; সার্ভার-রেন্ডারড-স্ট্যাটিক;\n"
"     papers date-DESC-ক্রম → নাম-মিলের প্রথম-প্রার্থী = সর্বশেষ-সংখ্যা) + উষ্ণ-মিরর (warmed-has-ভিত্তিক —\n"
"     পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা, স্টেল-শূন্য) */\n"
"  document.querySelectorAll('.ep-strip294-pill').forEach(function (pill300) {\n"
"    var fire300 = function (reason300) {\n"
"      var name300 = pill300.getAttribute('data-ep-strip294') || '';\n"
"      var p300 = null;\n"
"      for (var pi300 = 0; pi300 < papers.length; pi300++) { if (String(papers[pi300].name) === name300) { p300 = papers[pi300]; break; } }\n"
"      if (!p300) return;\n"
"      var u300 = epk300Url300(p300.id);\n"
"      epk300Prefetch300(u300, reason300);\n"
"      pill300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');\n"
"    };\n"
"    pill300.addEventListener('mouseenter', function () { fire300('pill'); });\n"
"    pill300.addEventListener('focusin', function () { fire300('pill-focus'); });\n"
"  });\n"
"\n"
"  /* session300: তালিকা-আইটেম-ইচ্ছা — ডেলিগেশন (mouseover-বাবলিং + focusin) — renderList-পুনঃরেন্ডার-নিরাপদ */\n"
"  elList.addEventListener('mouseover', function (e300) {\n"
"    var it300 = e300.target && e300.target.closest ? e300.target.closest('.ep-item') : null;\n"
"    if (it300 && it300.getAttribute('data-id')) {\n"
"      var u300 = epk300Url300(it300.getAttribute('data-id'));\n"
"      epk300Prefetch300(u300, 'item');\n"
"      it300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');\n"
"    }\n"
"  });\n"
"  elList.addEventListener('focusin', function (e300) {\n"
"    var it300 = e300.target && e300.target.closest ? e300.target.closest('.ep-item') : null;\n"
"    if (it300 && it300.getAttribute('data-id')) {\n"
"      var u300 = epk300Url300(it300.getAttribute('data-id'));\n"
"      epk300Prefetch300(u300, 'item-focus');\n"
"      it300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');\n"
"    }\n"
"  });\n"
"})();\n")
    v = v.replace(A2, B2, 1)
    wr(EJS, v)
    print('EJS-PATCHED')

# ── EJS-পোস্ট-অ্যাসার্ট (বাইট-স্তর — h-bracket-ক্ষয়-প্রমাণসহ) ──
v = rd(EJS)
for NS, N in (('epk300Prefetch300', 5), ('window.__epk300QA', 1), ('__epk300QA', 2),
              ('data-epk300', 2), ('epk300-warm', 3), ("'pill-focus'", 1), ("'item-focus'", 1)):
    C = v.count(NS)
    if C != N:
        die('EJS-পোস্ট-অ্যাসার্ট %s (প্রত্যাশা %d, পাওয়া %d)' % (NS, N, C))
if v.count("link[rel=\"prefetch\"][data-epk300]") != 1:
    die('EJS-পোস্ট-অ্যাসার্ট prefetch-সেলেক্টর (h-bracket-ক্ষয়-সন্দেহ)')
print('EJS-POST-ASSERT-OK (prefetched=has=last+links+2 × ep300Count-অসামঞ্জস্য-শূন্য)')

# ═══════════ ফাইল-২: epaper.css (session300-ব্লক) ═══════════
v = rd(EP)
EP_DONE = ('session300' in v)
if EP_DONE:
    print('CSS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    if 'epk300-warm' in v:
        die('CSS-নেমস্পেস-epk300-warm-পূর্ব-উপস্থিত (গার্ড)')
    # অ্যাঙ্কর: ফাইল-সমাপ্তি (session295-ব্লকের শেষ-লাইন — ইউনিক)
    A3 = "@media (prefers-reduced-motion: reduce) { .ep-strip294-pill:focus-visible { outline-offset: 0; } }\n"
    if v.count(A3) != 1:
        die('CSS-অ্যাঙ্কর-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A3))
    B3 = A3 + (
"\n"
"/* ═══ session300 — ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep300 (আর্কাইভ-পিল/তালিকা-উষ্ণ-সংকেত; PLANS session299-প্রস্তাব)\n"
"   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + color-mix-অ্যাকসেন্ট + :not()-সংঘর্ষ-বিচ্ছিন্নতা (is-active/is-on-অস্পৃশ্য)\n"
"   + 640px-সংকোচন + reduced-motion-সম্মান ═══ */\n"
"/* ① উষ্ণ-পিল — প্রিফেচড-পত্রিকার দ্রুত-সুইচ-পিল প্রস্তুত-অবস্থা (অ্যাকসেন্ট-রিং + উজ্জ্বলতা — transform-অস্পৃশ্য) */\n"
".ep-strip294-pill.epk300-warm:not(.is-active) {\n"
"  border-color: var(--lf-brand-primary);\n"
"  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);\n"
"  filter: brightness(1.05);\n"
"}\n"
".ep-strip294-pill.epk300-warm:not(.is-active) .ep-strip294-dot { background: var(--lf-brand-primary); }\n"
"/* ② উষ্ণ-তালিকা-আইটেম — প্রিফেচড-আইটেমের বাম-প্রান্তে সফট-অ্যাকসেন্ট-বার (is-on-সলিড-বার-অস্পৃশ্য) */\n"
".ep-item.epk300-warm:not(.is-on)::before {\n"
"  content: '';\n"
"  position: absolute;\n"
"  left: 0;\n"
"  top: 8px;\n"
"  bottom: 8px;\n"
"  width: 3px;\n"
"  border-radius: 0 3px 3px 0;\n"
"  background: color-mix(in srgb, var(--lf-brand-primary) 45%, transparent);\n"
"}\n"
".ep-item.epk300-warm:not(.is-on) .ep-item-name { color: var(--lf-brand-primary); }\n"
"/* ③ পিল ট্রানজিশন-সম্প্রসারণ (উষ্ণ-সংকেত-মসৃণ — s294-ট্রানজিশন-সুপারসেট) */\n"
".ep-strip294-pill { transition: color .15s ease, border-color .15s ease, background .15s ease, transform .15s ease, box-shadow .22s ease, filter .22s ease; }\n"
"/* ④ 640px-সংকোচন (টাচ-সারফেসে উষ্ণ-সংকেত-শান্ত) */\n"
"@media (max-width: 640px) {\n"
"  .ep-strip294-pill.epk300-warm:not(.is-active) { filter: none; box-shadow: 0 0 0 1px color-mix(in srgb, var(--lf-brand-primary) 35%, transparent); }\n"
"}\n"
"/* ⑤ রিডিউসড-মোশন গার্ড */\n"
"@media (prefers-reduced-motion: reduce) {\n"
"  .ep-strip294-pill, .ep-strip294-pill.epk300-warm { transition: none; }\n"
"}\n")
    wr(EP, v.replace(A3, B3, 1))
    print('CSS-PATCHED')

# ── CSS-পোস্ট-অ্যাসার্ট (ব্লক-স্কোপড — শেয়ার্ড-প্যাটার্ন-গণনা-নিষিদ্ধ session295-গোটচা; ব্লক=ফাইল-সমাপ্তি) ──
v = rd(EP)
BLK = v[v.index('/* ═══ session300'):]
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}\b', BLK))
if HEXN != 0:
    die('CSS-ব্লকে %d হেক্স (র্যাচেট-ঝুঁকি)' % HEXN)
for SEL, N in (('.ep-strip294-pill.epk300-warm:not(.is-active)', 3),
               ('.ep-item.epk300-warm:not(.is-on)', 2),
               ('color-mix(in srgb, var(--lf-brand-primary) 40%, transparent)', 1),
               ('prefers-reduced-motion', 1)):
    if BLK.count(SEL) != N:
        die('CSS-পোস্ট-অ্যাসার্ট %s (প্রত্যাশা %d, পাওয়া %d)' % (SEL, N, BLK.count(SEL)))
print('CSS-POST-ASSERT-OK (হেক্স-শূন্য + :not()-বিচ্ছিন্নতা)')

# ═══════════ ফাইল-৩: moderator-press.ejs (আপলোড-ক্ষেত্র প্রবেশ-পলিশ) ═══════════
v = rd(PRS)
P_DONE = ('session300' in v)
if P_DONE:
    print('PRESS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    if 'input[type="file"]' in v:
        die('PRESS-নেমস্পেস-ফাইল-ইনপুট-স্টাইল-পূর্ব-উপস্থিত (গার্ড)')
    A4 = "@media (max-width: 640px) { .pr-kbd-hint { display: none; } .pr-instant { padding: 9px 11px; } }\n</style>\n"
    if v.count(A4) != 1:
        die('PRESS-অ্যাঙ্কর-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A4))
    B4 = (
"@media (max-width: 640px) { .pr-kbd-hint { display: none; } .pr-instant { padding: 9px 11px; } }\n"
"/* session300 — আপলোড-ক্ষেত্র প্রবেশ-পলিশ (হেক্স-শূন্য টোকেন-শুধু; বিদ্যমান-ফাইল-ইনপুট-স্টাইল-শূন্য → সংঘর্ষ-অসম্ভব):\n"
"   dashed-affordance (আপলোড-সামর্থ্য-দৃশ্যমান) + hover-টিন্ট + focus-visible/focus-within-রিং + reduced-motion */\n"
".clip-field-wide input[type=\"file\"] { width: 100%; padding: .42rem .6rem; border: 1.5px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 10px; background: var(--lf-white); color: var(--lf-slate); cursor: pointer; transition: border-color .15s ease, background .15s ease; }\n"
".clip-field-wide input[type=\"file\"]:hover { border-color: var(--lf-brandgreen); background: var(--lf-brandgreen-soft); }\n"
".clip-field-wide input[type=\"file\"]:focus-visible { outline: 2px solid var(--lf-brandgreen); outline-offset: 2px; }\n"
".clip-field-wide:focus-within { border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }\n"
"@media (prefers-reduced-motion: reduce) { .clip-field-wide input[type=\"file\"] { transition: none; } }\n"
"</style>\n")
    wr(PRS, v.replace(A4, B4, 1))
    print('PRESS-PATCHED')

# ── PRESS-পোস্ট-অ্যাসার্ট (ব্লক-স্কোপড) ──
v = rd(PRS)
BLK = v[v.index('/* session300'):]
BLK = BLK[:BLK.index('</style>')]
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}\b', BLK))
if HEXN != 0:
    die('PRESS-ব্লকে %d হেক্স' % HEXN)
for SEL, N in (('input[type="file"]', 4), ('focus-within', 2), ('prefers-reduced-motion', 1)):
    if BLK.count(SEL) != N:
        die('PRESS-পোস্ট-অ্যাসার্ট %s (প্রত্যাশা %d, পাওয়া %d)' % (SEL, N, BLK.count(SEL)))
print('PRESS-POST-ASSERT-OK (হেক্স-শূন্য + affordance-বাইট)')

# ═══════════ ফাইল-৪: sections.ejs (lsf298 boot-apply-init — QA-হার্ডেনিং ফিক্স) ═══════════
# ফিক্স-প্রেক্ষাপট (moderator-দিক s300-সুইট-রান-১-প্রমাণ): lsf298-ইঞ্জিন boot-এ lsfApply298() কখনো-চালায়-না →
# __lsf298QA.total() প্রথম-apply-পর্যন্ত ০ (রো-১৫-থাকলেও) — হুক-চুক্তি "রো-শূন্যে-ও-সংজ্ঞায়িত"-এর সাথে
# total-বুট-সত্যতা-অসামঞ্জস্য। ফিক্স: boot-এ একবার init-apply (act=false → চিপ/শূন্য-বক্স-অদৃশ্য —
# দৃশ্যমান-প্রভাব-শূন্য; rows/hit-অ্যাট্রি-বুট-স্থাপিত — MutationObserver/আচরণ-অস্পৃশ্য)।
v = rd(SEC)
S_DONE = ('boot-apply-init' in v)
if S_DONE:
    print('SECTIONS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    if v.count('session300') != 0:
        die('SECTIONS-নেমস্পেস-session300-পূর্ব-উপস্থিত (গার্ড)')
    A5 = ('  var lsfTimer298 = null;\n'
          '  var host298 = document.querySelector(\'.admin-main\');\n')
    if v.count(A5) != 1:
        die('SECTIONS-অ্যাঙ্কর-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A5))
    B5 = (
"  /* session300: boot-apply-init — হুক-total বুট-সত্য (rows-মিল); act=false → দৃশ্যমান-প্রভাব-শূন্য */\n"
"  lsfApply298();\n"
"  var lsfTimer298 = null;\n"
"  var host298 = document.querySelector('.admin-main');\n")
    wr(SEC, v.replace(A5, B5, 1))
    print('SECTIONS-PATCHED')

# ── SECTIONS-পোস্ট-অ্যাসার্ট ──
v = rd(SEC)
if v.count('lsfApply298();') != 3:  # বুট-ইনিট(নতুন) + lsfClear298-অভ্যন্তর + MO-রিঅ্যাপ্লাই (input-listener = রেফারেন্স-কল-নয়)
    die('SECTIONS-পোস্ট-অ্যাসার্ট lsfApply298-কল-গণনা (পাওয়া %d)' % v.count('lsfApply298();'))
HL2 = v.find('lsfApply298();')
RL2 = v.find("window.__lsf298QA = {")
if not (0 < HL2 < RL2):
    die('SECTIONS-পোস্ট-অ্যাসার্ট init-হুক-ক্রম')
print('SECTIONS-POST-ASSERT-OK (boot-init-বাইট)')

print('S300-PATCH-OK')
