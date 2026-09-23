#!/usr/bin/env python3
# s291-docs.py — session291 ডক-আপডেট (PROJECT §২৯১ + PLANS session291-নোট + repo worklog Task-131)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৯১ (§২৯০-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৯১ (session291' in pj:
    print('skip-①: PROJECT §২৯১ ইতোমধ্যে')
else:
    ANCHOR = '## §২৯০ (session290'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৯১ (session291 — cron 403679: LOWMEM-রেল-থাম্ব-আগাম-ক্যাপ + অলস-IO-পথ ep291 — RAIL_PRE_MAX-গেট + IntersectionObserver-দৃশ্যমানতা-রেন্ডার + ক্যাশ-হিট-ক্যাপের-উপরে) — s291 ৫০/৫০ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`4bc2268` (session290-ep290, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + admin-gate-৩০৭ + ep290-বুট expSearch=false+ad=শূন্য + ep288-labeled=৩০/৩০ + aria-current + ক্যারেট-রেন্ডারড; console-ত্রুটি-শূন্য) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session290-শীর্ষ-প্রস্তাব গ্রহণ: **LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ**)।

**[Mandatory-ফিচার] রেল-থাম্ব-আগাম-ক্যাপ + অলস-IO-পথ (ep291):** s281-রেল-ক্যাশ-এর-শীর্ষে — eager-রেন্ডার-লুপ সব-পাতায় চলত (বড়-সংখ্যায় LOWMEM-খোলায় CPU/মেমরি-চাপ) — এ-রাউন্ডে: **RAIL_PRE_MAX = LOWMEM ? 6 : 0** (০=ক্যাপ-শূন্য; LOWMEM-এ প্রথম ৬-পাতা আগাম); **ক্যাপ-গেট eager-লুপে ক্যাশ-হিট-ব্লকের-পরে** (হিট-পথ ক্যাপের-উপরে — তাৎক্ষণিক); **ep291Queue** (is-lazy-শ্রেণি + IntersectionObserver root=elRail rootMargin-৮০px + ফায়ারে-unobserve একক-পেইন্ট + no-IO-ব্রাউজারে সরাসরি-পেইন্ট-ফলব্যাক) + **ep291Paint** (টোকেন-গার্ড tok===railTok সুইচে-বাতিল + ক্যাশ-হিট-তাৎক্ষণিক + রেন্ডার-সফলে dataURL-সংরক্ষণ — s281-চুক্তি-মিরর); **eager-বডি-অস্পৃশ্য-রীতি** (s281-রেন্ডার-লজিক অপরিবর্তিত — গেট+অলস-পথ র‍্যাপার-স্তরে); **__ep291QA হুক ×৭** (preMax/setPreMax(ন,reset-আর্গ=ক্যাশ-বিসর্জন)/lazy/eager/pending/canvases/imgs — setPreMax-রিরেন্ডার alive-এন্ট্রি-পুনঃব্যবহারে)।

**[Mandatory-স্টাইল]:** epaper.css ep291-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — **is-lazy-শান্ত-প্লেসহোল্ডার** (`.ep-rail-item.is-lazy .ep-rail-thumb.is-pending` dashed-বর্ডার + ধীর-শিমার animation-duration ২.২s + opacity .৫৫ — ক্যাপ-কিউ-অবস্থার দৃশ্যমান-চিহ্ন, কম-অ্যানিমেশন-ব্যয়) + reduced-motion-অক্ষুণ্ণ; ep280-290-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s291-railcap-suite.sh **৫০/৫০ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×১৯ + রেন্ডার্ড ×১ + E2E ×১৯: **বুট LOWMEM-বাস্তব** (QA-ব্রাউজার deviceMemory=৪ → বুটেই ক্যাপ-৬ সক্রিয়: eager=৬ + canvas=৬ + pending=৩ — ক্যাপ-ধারণের নির্ধারক-প্রমাণ) + **setPreMax(6,true)** eager ৬→১২ আপেক্ষিক (শাখা-গেট ঠিক-৬-এ থামা) + is-lazy×৩ + pending=৩ + img-শূন্য + **স্ক্রলে থাম্ব ৭→৮→৯ রেন্ডার** (lazy ০→৩ + canvas-মোট ৯ + pending-শূন্য — IO-দৃশ্যমানতা-পৃথকতা) + **ক্যাশ-হিট-ক্যাপের-উপরে** (ক্যাপ-১-তেও img×৯ তাৎক্ষণিক + canvas-শূন্য + eager-অপরিবর্তিত) + **পুনঃ-ভিজিট restored+৯** (s281-পথ-অক্ষুণ্ণ) + রেল-ক্লিকে পাতা-৯-জাম্প (poll+দৃঢ়-fallback) + setPreMax(0)-রিসেট + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **৯-পাতা-PDF হেল্পার (scripts/s291-genpdf.js — LOWMEM-ডিফল্ট-৬-এর-উপরে)** + **সিড-হেল্পার-পুনঃব্যবহার (s281-seedpaper — নেট-শূন্য PRE=০→FINAL=০)** + **পূর্ণ-রিগ্রেশন s260-s291 (৩৩-সুইট সব-গ্রিন — রানার scripts/s291-regression.sh; ৩৩-অ্যাসার্ট + নিজের-নাম-অ্যাসার্ট; চাঙ্ক-নির্বাহ ১২+১১+১০ — CHUNK_FROM/CHUNK_TO)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)-গ্রিন; প্যাচ: scripts/s291-patch.py (+patch2 eager-কাউন্টার +patch3 pending-সেলেক্টর-সংশোধন) (idempotent ×২-করে, মার্কার-গার্ড-প্রথম, পোস্ট-অ্যাসার্ট + s281-স্ট্রিং-অক্ষুণ্ণ + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×৪ (PLANS session291):** ① **else-বিহীন-ternary = SyntaxError** — poll-এক্সপ্রেশনে `cond ? expr` (else-ছাড়া) বৈধ-নয় → agent-browser খালি-ফেরত (stderr-দমিত) — s281-এর `cond && expr`-রীতিই-সঠিক ② **pending-সেলেক্টর শূন্য-সত্য** — is-pending শ্রেণি .ep-rail-item-এ নয়, ভিতরের .ep-rail-thumb স্প্যানে — item-সেলেক্টর সর্বদা-০-গণনা (অ্যাসার্ট-বাতিল-বলে-মনে-হয়) → thumb-সেলেক্টর (patch3) ③ **QA-ব্রাউজার deviceMemory=৪ = বাস্তব-LOWMEM** — বুটেই ক্যাপ-৬-সক্রিয় → বুট-অ্যাসার্ট ডিফল্ট-ক্যাপ-সচেতন (preMax-শর্তাধীন) — সুবিধা: LOWMEM-পথ সরাসরি-ই২ই-প্রমাণিত ④ **stale-পেজ-পুনঃব্যবহার + open-রেস** — একই-URL open পুরনো-পেজ-রাখে (stale-ক্যাপ/কাউন্টার/alive) → **ইউনিক-কোয়েরি-open (fresh-load)** + তালিকা-রেন্ডার-প্রোব (ক্লিক-পূর্ব-গেট); eager/lazy-কাউন্টার cumulative → **আপেক্ষিক-অ্যাসার্ট** (পূর্ব-মান-ধরে)।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৯১ সন্নিবেশিত')

# ── ② PLANS.md session291-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session291-নোট' in pl:
    print('skip-②: PLANS session291-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session290-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session291-নোট (cron 403679 — LOWMEM-রেল-থাম্ব-আগাম-ক্যাপ + অলস-IO-পথ ep291)
- **else-বিহীন-ternary-SyntaxError-গোটচা (নতুন — সুইট-শ্রেণি):** agent-browser eval-এ `cond ? expr` (else-ছাড়া ternary) **বৈধ-JS-নয়** → SyntaxError → stdout-খালি (2>/dev/null-এ দমিত) → poll অনির্দিষ্ট-ব্যর্থ; s281-এর `cond && expr`-রীতি (precedence: && নিচু → সম্পূর্ণ-স্ট্রিং-কোয়েসন) ই-সঠিক-প্যাটার্ন — ভবিষ্যৎ-সুইটে ternary-একদম-নয়।
- **is-pending-সেলেক্টর-গোটচা (শূন্য-সত্য-অ্যাসার্ট):** রেল-থাম্বে is-pending শ্রেণি থাকে **.ep-rail-thumb স্প্যানে** (b.innerHTML '<span class="ep-rail-thumb is-pending">'), .ep-rail-item বাটনে নয় — `querySelectorAll('.ep-rail-item.is-pending')` সর্বদা-০ (assert-ব্যর্থ-হওয়ার-বদলে শূন্য-সত্য-পাস!) → হুক-গণনায় সেলেক্টর-মালিকানা DOM-গঠন-মিলিয়ে-যাচাই বাধ্যতমূলক (patch3-সংশোধন)।
- **QA-ব্রাউজার LOWMEM-বাস্তব-প্রমাণ:** এ-পরিবেশের headless-Chrome **navigator.deviceMemory=৪** → LOWMEM=true → ep291-বুটেই ক্যাপ-৬-সক্রিয় — **বুট-অ্যাসার্ট ডিফল্ট-ক্যাপ-সচেতন হওয়া-বাধ্যতমূলক** (preMax-শর্তাধীন EXPBOOT=PM0>0?PM0:৯); সুবিধা: LOWMEM-অলস-পথ আর-সিমুলেশন-লাগে-না (বুট-ই-প্রমাণ); setPreMax-হুক তবু-রাখা (ক্যাপ-মান-ব্যায়াম + ক্যাশ-বিসর্জন-আর্গ)।
- **stale-পেজ-পুনঃব্যবহার + কাউন্টার-cumulative-চুক্তি (সুইট-নির্ধারকতা):** একই-URL open পুরনো-পেজ-রাখতে-পারে (stale-ক্যাপ/কাউন্টার/alive-ক্যাশ) → **ইউনিক-কোয়েরি-open** (`?qa=$(date +%s)$RANDOM`) + তালিকা-রেন্ডার-প্রোব (ক্লিক-পূর্ব); eager/lazy কাউন্টার **cumulative** (রি-রেন্ডারে গুটিয়ে-যায়-না) → অ্যাসার্ট-সর্বদা-আপেক্ষিক (পূর্ব-মান+ডেল্টা); is-lazy শ্রেণি **স্থায়ী-মার্কার** (paint-এর-পরেও-থাকে) — কিউ-হয়েছিল-প্রমাণের-নির্ধারক-সাক্ষী; is-on-স্মুথ-স্ক্রল-স্টল → poll + **দৃঢ়-scrollIntoView-fallback**।
- **ep291-স্থাপত্য-চুক্তি:** eager-বডি-অস্পৃশ্য (s281-লজিক-অক্ষুণ্ণ — গেট+অলস-পথ র‍্যাপার-স্তরে); ক্যাশ-হিট-গেটের-**আগে** (হিট-ক্যাপের-উপরে); IO-root=elRail rootMargin-৮০px + ফায়ারে-unobserve (একক-পেইন্ট) + no-IO-ফলব্যাক; paint-এ tok-গার্ড + dataURL-সংরক্ষণ s281-চুক্তি-মিরর; প্যাচ-ত্রয়ী প্রথা (patch=মূল + patch2/patch3=অনুপূরক — প্রত্যেকটি নিজস্ব-মার্কার-গার্ড idempotent)।
- **পরের-এজেন্ট: session292 থেকে (worklog Task ID 132)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু; -C "$ROOT"-থেকে); PLANS session291 + session290 + session289 + session288 + উভয়-session280-নোট পড়ুন; বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল (ep282)-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, LOWMEM-ক্যাপ-মান-টিউনিং (রেল-স্ক্রল-টেলিমেট্রি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session291-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-131 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 131 (session291' in wl:
    print('skip-③: repo-worklog Task-131 ইতোমধ্যে')
else:
    ENTRY = '''
---
Task ID: 131 (session291 — cron 403679; LOWMEM-রেল-থাম্ব-আগাম-ক্যাপ + অলস-IO-পথ ep291) — push `4bc2268..HEAD` (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609240319)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`4bc2268` (session290-ep290), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + ep290-বুট expSearch=false+ad=শূন্য + ep288-labeled=৩০/৩০ + aria-current) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session290-শীর্ষ-প্রস্তাব গ্রহণ: **LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ**)

## এ-রাউন্ডে সম্পন্ন (session291)
- **[Mandatory-ফিচার] ep291:** রেল-থাম্ব **RAIL_PRE_MAX = LOWMEM?৬:০ আগাম-ক্যাপ** + **IntersectionObserver-অলস-পথ** — eager-লুপে ক্যাপ-গেট (ক্যাশ-হিট-পরে — হিট-ক্যাপের-উপরে); ep291Queue (is-lazy + IO root=elRail rootMargin-৮০px + unobserve-একক-পেইন্ট + no-IO-ফলব্যাক) + ep291Paint (tok-গার্ড + s281-ক্যাশ-চুক্তি-মিরর); eager-বডি-অস্পৃশ্য; **__ep291QA হুক ×৭** (preMax/setPreMax(ন,reset)/lazy/eager/pending/canvases/imgs)
- **[Mandatory-স্টাইল]:** ep291-ব্লক হেক্স-শূন্য টোকেন-শুধু — **is-lazy-শান্ত-প্লেসহোল্ডার** (dashed + ধীর-শিমার ২.২s + opacity .৫৫) + reduced-motion-অক্ষুণ্ণ
- **টেস্ট:** নতুন tests/s291-railcap-suite.sh **৫০/৫০ ×২-ধারাবাহিক (SKIP=০)** (বুট-LOWMEM-বাস্তব eager=৬+canvas=৬+pending=৩ + setPreMax(6,true)-eager+৬ + is-lazy×৩ + স্ক্রলে lazy ০→৩ + canvas-মোট ৯ + হিট-পথ-ক্যাপের-উপরে img×৯/canvas-শূন্য/eager-অপরিবর্তিত + পুনঃ-ভিজিট restored+৯ + রেল-ক্লিক পাতা-৯ poll+fallback + স্ক্রিনশট ×২) + **৯-পাতা-s291-genpdf.js** + সিড-পুনঃব্যবহার (নেট-শূন্য PRE=০→FINAL=০) + **পূর্ণ-রিগ্রেশন s260-s291 (৩৩-সুইট সব-গ্রিন — s291-regression.sh; চাঙ্ক ১২+১১+১০)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)
- **গোটচা ×৪ (PLANS session291):** ① **else-বিহীন-ternary=SyntaxError** — poll-এ খালি-ফেরত; `cond && expr`-রীতি-ই ② **is-pending .ep-rail-thumb স্প্যানে** — item-সেলেক্টর শূন্য-সত্য-অ্যাসার্ট (patch3) ③ **QA-ব্রাউজার deviceMemory=৪ = বাস্তব-LOWMEM** — বুট-অ্যাসার্ট preMax-শর্তাধীন; LOWMEM-পথ সরাসরি-ই২ই-প্রমাণিত ④ **stale-পেজ-পুনঃব্যবহার** — ইউনিক-কোয়েরি-open + তালিকা-প্রোব; কাউন্টার-cumulative → আপেক্ষিক-অ্যাসার্ট; is-lazy=স্থায়ী-কিউ-সাক্ষী
- **পাইপলাইন:** প্যাচ scripts/s291-patch.py (+patch2 eager-কাউন্টার +patch3 pending-সেলেক্টর) (idempotent ×২-করে, মার্কার-গার্ড-প্রথম, পোস্ট-অ্যাসার্ট+s281-স্ট্রিং-অক্ষুণ্ণ+হেক্স-শূন্য) + feature-commit (১১-ফাইল; git commit -F-পথ) + ডক ×৩ (PROJECT §২৯১ + PLANS session291 + repo-worklog Task-131; s291-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু; -C "$ROOT") + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep291-লাইভ-যাচাই** + স্ক্রিনশট download/s291-prod-railcap.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session292 লেবেল (worklog Task ID 132)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + **দীর্ঘ-রান চাঙ্কে-ই** + কমিট-মেসেজ -F-পথ; PLANS session291 + session290 + session289 + session288 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল (ep282)-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, LOWMEM-ক্যাপ-মান-টিউনিং (রেল-স্ক্রল-টেলিমেট্রি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session291-ep291); working-tree ক্লিন
'''
    wl = wl.rstrip('\n') + '\n' + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-131 সংযোজিত')

print('DOCS-OK ×৩')
