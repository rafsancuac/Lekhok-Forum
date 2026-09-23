#!/usr/bin/env python3
# s285-docs.py — session285 ডক-আপডেট (PROJECT §২৮৫ + PLANS session285-নোট + repo worklog Task-125)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮৫ (§২৮৪-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮৫ (session285' in pj:
    print('skip-①: PROJECT §২৮৫ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮৪ (session284'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮৫ (session285 — cron 403679: বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন ep285 — রোভিং-ট্যাবইনডেক্স + ফোকাস-চেইন + বাবল-ডিট্যাচ-গার্ড) — s285 ৪৯/৪৯ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`cfcf198` (session284-ep284, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-স্পট (home/health/epaper-200) + agent-browser-প্রোড ep284-স্ট্রিপ-ক্যানারি (strip=true, chips=১, is-cur=১) — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session284-শীর্ষ-প্রস্তাব গ্রহণ: **বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন**)।

**[Mandatory-ফিচার] কী-বোর্ড-নেভিগেশন (ep285):** ep284-বছর-স্ট্রিপে **↑↓←→-চিপ-রোভিং** (DOM-ক্রমে wrap — ঋণাত্মক-মডিউলো-সংশোধন) + **Home/End** (প্রথম/শেষ-চিপ) + **Enter/Space-সক্রিয়** (preventDefault + active-chip-ক্লিক — ep282-কম্বো-প্যাটার্ন); **is-cur-চিপে প্রারম্ভিক-ফোকাস** (স্ট্রিপ-খোলায় ep284OpenList-র‍্যাপার → ep285Arm); **রোভিং-ট্যাবইনডেক্স** (active=0, বাকি=-1) + **is-act-শ্রেণি**; **জাম্পে ফোকাস-ফেরত** বছর-লেবেলে (elCalMY.focus — focus-chain অটুট); **রি-রেন্ডারে সফট-আর্ম** (ep284Render-র‍্যাপার — is-act-সংরক্ষণ, ফোকাস-চুরি-শূন্য); বন্ধে active-রিসেট; **__ep285QA হুক ×৫** (active/focused/move/set/arm); ep283/ep284-ফাংশন-বডি-অস্পৃশ্য (র‍্যাপার-স্তরেই সম্পূর্ণ)।

**[Mandatory-স্টাইল]:** epaper.css ep285-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — `.ep-cal-y.is-act` টিন্ট (brand-border + green-tint + brand-text), `.ep-cal-y.is-act.is-cur` আউটলাইন (ফিলের-উপর-বৃত্ত-নিশ্চিত), reduced-motion-গার্ড; ep280-284-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s285-calkey-suite.sh **৪৯/৪৯ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×১৮ + রেন্ডার্ড ×২ + E2E ×১৭: খোলায় is-cur-চিপে প্রারম্ভিক-ফোকাস (focused==active==year) + is-act ×১ + **রোভিং-ট্যাবইনডেক্স (z=1/m=n−1/n≥২ — গণনা-ভিত্তিক)** + ↓-পরের-চিপ (ফোকাস-অনুসরণ) + ↓-wrap + ↑-wrap + Home/End + **Enter-জাম্প (year আপডেট + স্ট্রিপ-বন্ধ + প্যানেল-খোলা-অটুট + ফোকাস-ফেরত epCalMY)** + পুনঃ-খোলায় is-cur-আর্ম + **রি-রেন্ডার-সফট-আর্ম (স্টেপার-ফোকাস-অটুট + is-act-সংরক্ষিত)** + Escape-পূর্ণ-বন্ধ + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **প্রি-ক্লিন-প্রথা** (কিল→ক্লিন→বুট — স্টেল-মার্কার-মুক্ত PRE-বেসলাইন; s284-seedyear পুনঃব্যবহার) + পূর্ণ-রিগ্রেশন s260-s284 (২৬-সুইট) + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs); প্যাচ: scripts/s285-patch.py (idempotent ×২, ×২-এডিট, পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×৩ (PLANS session285):** ① **wrapper-ভেরিয়েবল-নাম-মিল-গোটচা** — র‍্যাপার-বেস `var ep284RenderListBase` ঘোষণা করে wrapper-বডিতে `ep284RenderBase` ডাকলে **ReferenceError নীরবে-রেন্ডার-চেইন-মৃত** (স্ট্রিপ-খোলা-হয় কিন্তু চিপ-শূন্য; হুক-আছে-বলে-মিথ্যা-সুস্থ-দৃশ্য) — নাম-সাম্য-অ্যাসার্ট-বাধ্যতমূলক ② **ylist-innerHTML-রিবিল্ড-বাবল-ডিট্যাচ-গোটচা (s284-ল্যাটেন্ট — এ-রাউন্ডে-ধরা)** — চিপ-ক্লিক-বাবলের-মাঝপথে ep284Render-র ylist-রিবিল্ড (ep283Render-র‍্যাপার-চেইন) **ক্লিক-টার্গেট-ডিট্যাচ** করে → document-outside-click-এ `card.contains(detached)=false` → **প্যানেল-মিথ্যা-বন্ধ** (focus-বডি-ফেরত-সহ; s284-সুইট এ-অবস্থা-অ্যাসার্ট-করে-নি-বলে-অলক্ষিত) → **capture-ফেজ-ফ্ল্যাগ (ep285InChip) + চিপ-ক্লিকে রিবিল্ড-স্কিপ** (স্ট্রিপ-যে-কোনো-অবস্থায়-বন্ধ-ই — পরের-খোলায় ফ্রেশ-রেন্ডার) ③ **tr -d '\"'-পরে sed-প্যাটার্ন-কোট-শূন্য** — eval-JSON `tr -d '\"\\\\'`-এর-পরে স্ট্রিং-এ কোট-থাকে-না → sed-এ `\"z\":`-প্যাটার্ন মেলে-না → `z:`-কোট-বিহীন-প্যাটার্ন-ই (s282-used-value-গোটচা-পরিবার)।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮৫ সন্নিবেশিত')

# ── ② PLANS.md session285-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session285-নোট' in pl:
    print('skip-②: PLANS session285-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session284-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session285-নোট (cron 403679 — বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন ep285)
- **wrapper-ভেরিয়েবল-নাম-মিল-গোটচা (নতুন):** র‍্যাপার-প্যাটার্নে বেস-ক্যাপচার `var XBase = X;` আর wrapper-বডির ডাক `XBase()` — **নাম-এক-অক্ষর-ভিন্ন হলে ReferenceError** (ep284RenderListBase ঘোষণা + ep284RenderBase ডাক — প্রথম-রানে ×১); লক্ষণ: স্ট্রিপ-খোলা-হয় (হুক-সব-সজ্জিত) কিন্তু চিপ-শূন্য + is-act/tabindex-শূন্য — **try{fn}catch(e){message}-eval-ই-শনাক্তকারী**; ভবিষ্যৎ-র‍্যাপারে ঘোষণা-আর-ডাক-এক-নাম + পোস্ট-অ্যাসার্টে উভয়-নাম-উপস্থিতি-যাচাই।
- **ylist-innerHTML-রিবিল্ড-বাবল-ডিট্যাচ-গোটচা (নতুন — s284-ল্যাটেন্ট, এ-রাউন্ডে-ধরা — সবচেয়ে-গুরুত্বপূর্ণ):** চিপ-ক্লিক-বাবলের-মাঝপথে ep284Render-র ylist-innerHTML-রিবিল্ড (ep283Render-র‍্যাপার-চেইনে) **ক্লিক-টার্গেট-চিপ-ডিট্যাচ** করে → event-বাবল document-এ পৌঁছে `card.contains(detached-target)=false` → **ep283-outside-click-প্যানেল-মিথ্যা-বন্ধ** (focus-বডি-ফেরত-সহ); s284-সুইট-এ-অবস্থা-অ্যাসার্ট-করে-নি-বলে-অলক্ষিত-ছিল; **সমাধান: capture-ফেজ-ফ্ল্যাগ (ep285InChip — ylist-এ capture-click-এ true, refocus-bubble-এ false) + ep284Render-র‍্যাপারে চিপ-ক্লিকে রিবিল্ড-স্কিপ** (স্ট্রিপ-তবু-বন্ধ-ই — পরের-খোলায় ফ্রেশ-রেন্ডার-ই); **শিক্ষা: innerHTML-রিবিল্ড যে-কোনো-ancestor-এর-ক্লিক-বাবল-চলাকালে-নিষিদ্ধ যদি document-স্তরের contains-গার্ড-থাকে** — প্রতিরোধ: MutationObserver/capture-ফ্ল্যাগ + contains-অ্যাসার্ট-সুইটে-বাধ্যতমূলক।
- **MutationObserver-সিঙ্ক্রোনাস-পাঠ-গোটচা (নতুন):** observer-callback **microtask** — eval-এর-এক-ব্লকে observe→mutation→JSON.stringify(log) করলে log-সর্বদা-শূন্য (callback-আন-ফায়ার্ড) → ডিবাগে **সিঙ্ক্রোনাস-প্রমাণ = সরাসরি-state-পাঠ (hidden/className) + try-catch-eval**, observer-শুধু-অ্যাসিঙ্ক-ট্রেসে।
- **stale-মার্কার-PRE-দূষণ-গোটচা (পুনঃপ্রমাণিত):** আগের-ডিবাগ-রাউন্ডের সিড-মার্কার DB-তে-থাকলে PRE-গণনা দূষিত (PRE=২ → ক্লিন-পরে FINAL=০ → নেট-শূন্য-মিথ্যা-ফেল) → **সুইট-শুরুতেই কিল→প্রি-ক্লিন→বুট-প্রথা** (কিল-পূর্বক-নয় — flush-গোটচা-ক্রম!); s284-সুইটেও-ভবিষ্যতে-প্রযোজ্য।
- **tr -d '\"'-পরে sed-কোট-শূন্য-প্যাটার্ন (পুনঃস্মরণ):** eval-JSON-আউটপুট `tr -d '"\\'`-করলে কোট-মুছে-যায় → sed-প্যাটার্নে `\"z\":`-জাতীয় কোট-সহ-কী কখনো-মেলে-না → `z:`-কোট-বিহীন।
- **ep285-স্থাপত্য-চুক্তি:** সম্পূর্ণ-র‍্যাপার-স্তর (ep283OpenList/ep284Render/ep284CloseList — ep283/ep284-বডি-অস্পৃশ্য); রোভিং-ট্যাবইনডেক্স (is-act চিপ tabindex=0, বাকি -1); keydown ylist-স্তরেই (ডকুমেন্ট-স্তর-দূষণ-শূন্য); Enter/Space → active-chip-ক্লিক (জাম্প-লজিক-ডুপ্লিকেট-নিষিদ্ধ — ep284-হ্যান্ডলার-ই); ফোকাস-চেইন: খোলায় is-cur-চিপ → জাম্পে epCalMY; __ep285QA ×৫।
- **পরের-এজেন্ট: session286 থেকে (worklog Task ID 126)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); বাকি-প্রস্তাব: LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, **ep284-মাস-গ্রিডেও কী-বোর্ড-নেভিগেশন (ep285-র-ই-প্যাটার্ন — ↑↓←→ ৪-কলাম-গ্রিড-রোভিং)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session285-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-125 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 125 (session285' in wl:
    print('skip-③: repo-worklog Task-125 ইতোমধ্যে')
else:
    ENTRY = '''

---
Task ID: 125 (session285 — cron 403679; বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন ep285)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609232333)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`cfcf198` (session284-ep284), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-স্পট home/health/epaper-200 + agent-browser-প্রোড ep284-স্ট্রিপ-ক্যানারি (strip=true, chips=১, is-cur=১, ep285=undefined-প্রত্যাশিত) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session284-শীর্ষ-প্রস্তাব গ্রহণ: **বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন**)

## এ-রাউন্ডে সম্পন্ন (session285)
- **[Mandatory-ফিচার] ep285:** ep284-বছর-স্ট্রিপে **↑↓←→-চিপ-রোভিং (wrap)** + **Home/End** + **Enter/Space-সক্রিয়** (active-chip-ক্লিক — জাম্প-লজিক-পুনঃব্যবহার); **is-cur-চিপে প্রারম্ভিক-ফোকাস** (খোলায়-আর্ম) + **রোভিং-ট্যাবইনডেক্স** (active=0, বাকি=-1) + **is-act-শ্রেণি**; **জাম্পে ফোকাস-ফেরত epCalMY-তে**; **রি-রেন্ডারে সফট-আর্ম** (ফোকাস-চুরি-শূন্য); বন্ধে active-রিসেট; **__ep285QA হুক ×৫**; সম্পূর্ণ-র‍্যাপার-স্তর (ep283/ep284-বডি-অস্পৃশ্য)
- **[Mandatory-স্টাইল]:** ep285-ব্লক হেক্স-শূন্য টোকেন-শুধু — is-act-টিন্ট (brand-border+green-tint+brand-text) + is-act.is-cur-আউটলাইন + reduced-motion-গার্ড
- **টেস্ট:** নতুন tests/s285-calkey-suite.sh **৪৯/৪৯ ×২-ধারাবাহিক (SKIP=০)** + প্রি-ক্লিন-প্রথা (কিল→ক্লিন→বুট — স্টেল-মার্কার-মুক্ত PRE) + পূর্ণ-রিগ্রেশন s260-s284 (২৬-সুইট সব-গ্রিন) + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন (১২২ ejs)
- **গোটচা ×৩ (PLANS session285):** ① **wrapper-ভেরিয়েবল-নাম-মিল** — ep284RenderListBase-ঘোষণা/ep284RenderBase-ডাক-ভিন্ননাম → ReferenceError-নীরব-রেন্ডার-চেইন-মৃত (চিপ-শূন্য + হুক-সুস্থ-মিথ্যা-দৃশ্য; try-catch-eval-ই-শনাক্তকারী) ② **ylist-রিবিল্ড-বাবল-ডিট্যাচ (s284-ল্যাটেন্ট)** — চিপ-ক্লিক-বাবলের-মাঝে ylist-innerHTML-রিবিল্ড → contains(detached)=false → প্যানেল-মিথ্যা-বন্ধ → capture-ফ্ল্যাগ (ep285InChip) + চিপ-ক্লিকে রিবিল্ড-স্কিপ ③ **tr-d-কোট-পরে sed-কোট-শূন্য-প্যাটার্ন** — `\"z\":`-কখনো-মেলে-না → `z:`-ই
- **পাইপলাইন:** প্যাচ scripts/s285-patch.py (idempotent ×২, ×২-এডিট) + feature-commit + ডক ×৩ (PROJECT §২৮৫ + PLANS session285 + repo-worklog Task-125; s285-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু) + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep285-লাইভ-যাচাই (প্রোড single-year-এ ফোকাস/roving-প্রমাণ)** + স্ক্রিনশট download/s285-prod-*.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session286 লেবেল (worklog Task ID 126)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান; PLANS session285 + session284 + session283 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, **ep284-মাস-গ্রিডেও কী-বোর্ড-নেভিগেশন (ep285-র-ই-প্যাটার্ন — ৪-কলাম-গ্রিড-রোভিং)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session285-ep285); working-tree ক্লিন'''
    wl = wl.rstrip('\n') + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-125 সংযোজিত')

print('ডক-আপডেট সম্পন্ন (idempotent ×২-প্রস্তুত)')
