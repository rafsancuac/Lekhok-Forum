#!/usr/bin/env python3
# s284-docs.py — session284 ডক-আপডেট (PROJECT §২৮৪ + PLANS session284-নোট + repo worklog Task-124)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮৪ (§২৮৩-এর-আগে সন্নিবেশ — নতুন-প্রথম-চুক্তি) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮৪ (session284' in pj:
    print('skip-①: PROJECT §২৮৪ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮৩ (session283'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮৪ (session284 — cron 403679: মাস-প্যানেলে বছর-তালিকা-শর্টকাট ep284 — বছর-চিপ-স্ট্রিপ + এক-ক্লিক-বছর-জাম্প) — s284 ৪৮/৪৮ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`fe69e53` (session283-ep283, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০ — সমান্তরাল-রাউন্ড-শূন্য); রাউন্ড-শুরু QA: প্রোড-স্পট (home/health/epaper-200) + agent-browser-প্রোড ep283-প্যানেল-হুক-যাচাই (open→isOpen/year/has) — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session283-শীর্ষ-প্রস্তাব গ্রহণ: **মাস-প্যানেলে বছর-তালিকা-শর্টকাট/বহু-বছর-জাম্প**)।

**[Mandatory-ফিচার] বছর-তালিকা-শর্টকাট (ep284):** বছর-লেবেল (`.ep-cal-mylabel`) span→**button**-রূপান্তর (aria-haspopup + aria-expanded + title) — ক্লিকে **মাস-প্যানেলের-ভেতরে ইন-প্যানেল বছর-তালিকা-স্ট্রিপ** (`ep-cal-ylist` — epCalMPanel-সন্তান, ভাসমান-নয়): `ep283Avail()`-উদ্ভূত **তথ্য-আছে-বছর-ই চিপ** (অবতরণ-ক্রম; `.is-cur`-ফিল = স্টেপার-বর্তমান-বছর); **বছর-চিপ-ক্লিকে স্টেপার-জাম্প** = ep283Year-সেট + `ep283Render()`-পুনঃরেন্ডার + স্ট্রিপ-বন্ধ (দূর-বছরে ±১-পুনরাবৃত্তি-শূন্য); **স্টেপার-চলাকালে স্ট্রিপ-is-cur-পুনঃসিঙ্ক** (ep283Render-র‍্যাপার-স্তর — ep283-ফাংশন-বডি-অস্পৃশ্য; late-bound-বাইন্ডিং-এ পূর্ব-বাউন্ড হ্যান্ডলার-ও র‍্যাপার-দেখে); প্যানেল-খোলা/বন্ধে স্ট্রিপ-সিঙ্ক-রিসেট (ep283OpenPanel/ep283ClosePanel-র‍্যাপার); Escape-এ পূর্ণ-বন্ধ (ep283-সেমান্টিক-অক্ষুণ্ণ — s283-রিগ্রেশন-নিরাপদ); aria-পূর্ণ (listbox/option/aria-selected); **__ep284QA হুক ×৭** (isOpen/years/year/jumped/open/close/render)।

**[Mandatory-স্টাইল]:** epaper.css ep284-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — বছর-লেবেল-ট্রিগার button-রিসেট (border/background-শূন্য + হোভার-টিন্ট + is-open-অবস্থা + focus-visible-ring), স্ট্রিপ flex-wrap-চিপ-গ্রিড + dashed-বিভাজক + entrance-অ্যানিমেশন `ep-cal-y-in`, চিপ (bordered + হোভার-টিন্ট + is-cur-ফিল + focus-ring) + মোবাইল-সংকোচন (640px) + reduced-motion-গার্ড; ep280/281/282/283-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s284-calyear-suite.sh **৪৮/৪৮ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২১ + রেন্ডার্ড ×৩ + E2E ×১৮: হুক-সজ্জা + cursor:pointer + প্যানেল-পূর্বশর্ত + **স্ট্রিপ-প্রারম্ভিক-বন্ধ (প্যানেল-খোলায়-রিসেট-র‍্যাপার-প্রমাণ)** + বছর-লেবেল-ক্লিকে খোলা (isOpen+hidden+aria) + চিপ-গণনা==hook.years()≥২ (গণনা-ভিত্তিক) + is-cur ×১ + অ-বর্তমান-চিপ-শনাক্ত + **বছর-ক্লিকে স্টেপার-জাম্প (২০২৬→২০২৫ + স্ট্রিপ-বন্ধ + jumped)** + মাস-গ্রিড-পুনঃরেন্ডার (has/disabled-গণনা) + মাস-ক্লিকে এক-ক্লিক-জাম্প (jumped==elDateInput + ২০২৫-বছরে) + পুনঃ-খোলায় স্ট্রিপ-বন্ধ + বছর-calY-রিসেট + **স্টেপার-চলাকালে is-cur-পুনঃসিঙ্ক (র‍্যাপার-প্রমাণ — ডেটা-বিহীন-বছরে চিপ-শূন্য-সঠিক)** + Escape-পূর্ণ-বন্ধ + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **বহু-বছর-মার্কার-সিড/ক্লিন নেট-শূন্য** (নতুন scripts/s284-seedyear.js — স্থির-তারিখ যুগল ২০২৬-০৩-১৫ + ২০২৫-১১-২০; PRE=০→FINAL=০) + পূর্ণ-রিগ্রেশন s260-s283 (২৫-সুইট) + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs); প্যাচ: scripts/s284-patch.py (idempotent ×২, ×৪-এডিট, পোস্ট-অ্যাসার্ট + ব্লক-হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×২ (PLANS session284):** ① **grep-প্যাটার্নে ট্রেলিং-স্পেস-শূন্য-মিল** — `epCalMY ` (স্পেস-সহ) রেন্ডার্ড-HTML-এ মেলে-না (`id="epCalMY"` — কোট-পরে-স্পেস) → অ্যাট্রিবিউট-বাউন্ডারি-সচেতন-প্যাটার্ন `epCalMY"`-ই-সঠিক (epCalMYPrev/epCalMYNext-সাবস্ট্রিং-ও-বাদ) ② **ডেটা-বিহীন-বছরে is-cur-চিপ-অনুপস্থিত-সঠিক** — স্টেপারে ডেটা-শূন্য-বছরে (২০২৪) গেলে স্ট্রিপে চিপ-ই-নেই (avail-উদ্ভূত-তালিকায় নেই) → is-cur-অ্যাসার্ট মিথ্যা-ফেল; সুইট-চুক্তি: Prev→Next-ফেরত-যাত্রায় (ডেটা-আছে-বছরে) is-cur==hook.year()-যাচাই।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮৪ সন্নিবেশিত')

# ── ② PLANS.md session284-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session284-নোট' in pl:
    print('skip-②: PLANS session284-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session283-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session284-নোট (cron 403679 — মাস-প্যানেলে বছর-তালিকা-শর্টকাট ep284)
- **grep-অ্যাট্রিবিউট-বাউন্ডারি-গোটচা (নতুন):** রেন্ডার্ড-HTML-অ্যাসার্টে `epCalMY ` (ট্রেলিং-স্পেস) **কখনো-মেলে-না** — `id="epCalMY"`-এ MY-এর-পরে কোট, স্পেস-নয়; সঠিক-প্যাটার্ন `epCalMY"` (কোট-সহ) — পাশাপাশি epCalMYPrev/epCalMYNext-সাবস্ট্রিং-ও-বাদ (s282-fa-filter-পরিবারের HTML-সমতুল্য); প্রথম-রানে ×১-মিথ্যা-ফেল-সংশোধিত।
- **ডেটা-বিহীন-বছরে-is-cur-গোটচা (নতুন):** বছর-স্ট্রিপ = avail-উদ্ভূত (তথ্য-আছে-বছর-ই) — স্টেপারে ডেটা-শূন্য-বছরে গেলে স্ট্রিপে ও-বছরের চিপ-ই-নেই → `is-cur`-অ্যাসার্ট মিথ্যা-ফেল (ফিচার-বাগ-নয় — ডিজাইন-সত্য); সুইট-চুক্তি: Prev→Next-ফেরত-যাত্রায় is-cur==hook.year() (ডেটা-আছে-বছরে); ভবিষ্যতে স্টেপার-সিঙ্ক-অ্যাসার্টে avail-বহির্ভূত-বছর-সচেতন-হোন।
- **ep284-স্থাপত্য-চুক্তি:** স্ট্রিপ = epCalMPanel-সন্তান (ভাসমান-নয়); ep283-ফাংশন-বডি-অস্পৃশ্য — **র‍্যাপার-স্তর** (ep283OpenPanel/ep283ClosePanel/ep283Render-পুনঃঅ্যাসাইন; ফাংশন-ডিক্লারেশন late-bound — পূর্ব-বাউন্ড হ্যান্ডলার-ও র‍্যাপার-দেখে; base-capture-ক্রম-নিরাপদ); জাম্প = ep283Year-সেট + ep283Render + স্ট্রিপ-বন্ধ (মাস-ক্লিকে জাম্প ep283-র-ই-পুনঃব্যবহার — ডুপ্লিকেট-নিষিদ্ধ); Escape-সেমান্টিক-অপরিবর্তিত (ep283-পূর্ণ-বন্ধ — s283-রিগ্রেশন-নিরাপদ); __ep284QA ×৭।
- **বহু-বছর-সিড-হেল্পার (পুনঃব্যবহারযোগ্য):** scripts/s284-seedyear.js — স্থির-তারিখ যুগল (2026-03-15 + 2025-11-20; drive_file_id S284TESTA/S284TESTB + source qa-s284) — বছর-তালিকায় ≥২-বছর-গ্যারান্টি; ব্যবহার-পূর্বে kill8094-বাধ্যতমূলক (s279-flush-গোটচা); বহু-বছর-নির্ভর-যে-কোনো-সুইটে সরাসরি-ব্যবহার্য।
- **পরের-এজেন্ট: session285 থেকে (worklog Task ID 125)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু — নতুন-untracked-PNG-বাদ-দিয়ে, xargs-atomic-ব্যর্থতা-গোটচা); বাকি-প্রস্তাব: LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, ep284-স্ট্রিপে কী-বোর্ড-নেভিগেশন (↑↓/Home/End — ep282-র-ই-প্যাটার্ন), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session284-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-124 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 124 (session284' in wl:
    print('skip-③: repo-worklog Task-124 ইতোমধ্যে')
else:
    ENTRY = '''

---
Task ID: 124 (session284 — cron 403679; মাস-প্যানেলে বছর-তালিকা-শর্টকাট ep284)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609232303)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`fe69e53` (session283-ep283), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০ — সমান্তরাল-রাউন্ড-শূন্য)
- QA: প্রোড-স্পট home/health/epaper-200 + agent-browser-প্রোড ep283-প্যানেল-হুক-যাচাই (open→isOpen/year/has সব-সঠিক) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session283-শীর্ষ-প্রস্তাব গ্রহণ: বছর-তালিকা-শর্টকাট)

## এ-রাউন্ডে সম্পন্ন (session284)
- **[Mandatory-ফিচার] ep284:** বছর-লেবেল (ep-cal-mylabel) span→button — ক্লিকে মাস-প্যানেলের-ভেতরে **ইন-প্যানেল বছর-তালিকা-স্ট্রিপ** (epCalYList — avail-উদ্ভূত তথ্য-আছে-বছর-ই, অবতরণ-ক্রম, is-cur-ফিল); **বছর-চিপ-ক্লিকে স্টেপার-জাম্প** (ep283Year-সেট + ep283Render + স্ট্রিপ-বন্ধ — দূর-বছরে ±১-পুনরাবৃত্তি-শূন্য) + **স্টেপার-চলাকালে is-cur-পুনঃসিঙ্ক** (ep283Render-র‍্যাপার-স্তর — ep283-বডি-অস্পৃশ্য, late-bound) + প্যানেল-খোলা/বন্ধে স্ট্রিপ-রিসেট (Open/Close-র‍্যাপার) + Escape-পূর্ণ-বন্ধ-সেমান্টিক-অক্ষুণ্ণ + aria-পূর্ণ + __ep284QA ×৭
- **[Mandatory-স্টাইল]:** ep284-ব্লক হেক্স-শূন্য টোকেন-শুধু — লেবেল-ট্রিগার-রিসেট+হোভার-টিন্ট+is-open+focus-ring, স্ট্রিপ flex-wrap+dashed-বিভাজক+এন্ট্রি-অ্যানিমেশন ep-cal-y-in, চিপ bordered+হোভার+is-cur-ফিল, মোবাইল-সংকোচন 640px, reduced-motion-গার্ড
- **টেস্ট:** নতুন tests/s284-calyear-suite.sh **৪৮/৪৮ ×২-ধারাবাহিক (SKIP=০)** + **বহু-বছর-মার্কার-সিড/ক্লিন নেট-শূন্য** (নতুন scripts/s284-seedyear.js — স্থির-তারিখ ২০২৬-০৩-১৫+২০২৫-১১-২০; PRE=০→FINAL=০) + **পূর্ণ-রিগ্রেশন s260-s283 (২৫-সুইট সব-গ্রিন)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন (১২২ ejs)
- **গোটচা ×২ (PLANS session284):** ① **grep-অ্যাট্রিবিউট-বাউন্ডারি** — রেন্ডার্ড-HTML-এ `epCalMY ` (স্পেস) মেলে-না — `epCalMY"` (কোট)-ই-সঠিক + epCalMYPrev/Next-সাবস্ট্রিং-বাদ ② **ডেটা-বিহীন-বছরে is-cur-চিপ-অনুপস্থিত-সঠিক** — স্টেপারে ডেটা-শূন্য-বছরে চিপ-ই-নেই (avail-উদ্ভূত) → Prev→Next-ফেরত-যাত্রায়-অ্যাসার্ট
- **পাইপলাইন:** প্যাচ scripts/s284-patch.py (idempotent ×২, ×৪-এডিট) + feature-commit + ডক ×৩ (PROJECT §২৮৪ + PLANS session284 + repo-worklog Task-124; s284-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু) + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep284-লাইভ-যাচাই** + স্ক্রিনশট download/s284-prod-*.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session285 লেবেল (worklog Task ID 125)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান; PLANS session284 + session283 + session282 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, **ep284-স্ট্রিপে কী-বোর্ড-নেভিগেশন (↑↓/Home/End — ep282-র-ই-প্যাটার্ন)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session284-ep284); working-tree ক্লিন
'''
    wl = wl.rstrip('\n') + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-124 সংযোজিত')

print('ডক-আপডেট সম্পন্ন (idempotent ×২-প্রস্তুত)')
