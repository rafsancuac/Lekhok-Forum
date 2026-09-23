#!/usr/bin/env python3
# s287-docs.py — session287 ডক-আপডেট (PROJECT §২৮৭ + PLANS session287-নোট + repo worklog Task-127)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮৭ (§২৮৬-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮৭ (session287' in pj:
    print('skip-①: PROJECT §২৮৭ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮৬ (session286'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮৭ (session287 — cron 403679: দিন-গ্রিডে কী-বোর্ড-নেভিগেশন ep287 — ৭-কলাম-রোভিং + disabled-স্কিপ + Enter-জাম্পে-ফোকাস-ফেরত) — s287 ৫৯/৫৯ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`0ab3ac3` (session286-ep286, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-স্পট home/epaper/health-200 + agent-browser-প্রোড ep286-ক্যানারি (প্যানেল-খোলায় আর্ম active=focused=৮-সেপ্টেম্বর + Home=৮/End=৮/wrap=৮ — একমাত্র-সেপ্টেম্বর-enabled-প্রোড-সত্য + Escape-ফোকাস-ফেরত epCalMonth) — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session286-শীর্ষ-প্রস্তাব গ্রহণ: **দিন-গ্রিডে কী-বোর্ড-নেভিগেশন**)।

**[Mandatory-ফিচার] দিন-গ্রিডে কী-বোর্ড-নেভিগেশন (ep287):** epCalGrid-দিন-গ্রিডে (৭-কলাম) **←→=±1, ↑=−7, ↓=+7 রোভিং** (wrap + **disabled-স্কিপ-লুপ** — ভবিষ্যৎ-দিন-লাফ; **মাস-সীমা-স্কিপ = সীমা-অতিক্রম-নয় — wrap-এ-সীমা-লাফ**, ep286-চুক্তি; সব-দিন-disabled-মাসে নো-অপ tries≥len-গার্ড) + **Home=প্রথম-enabled, End=শেষ-enabled** (DOM-শেষ-নয়) + **Enter/Space-সক্রিয়** (preventDefault + active-দিন-ক্লিক — grid-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার, calJump-জাম্প-লজিক-ডুপ্লিকেট-নিষিদ্ধ) + **জাম্পে-ফোকাস-ফেরত is-sel-দিন** (calJump-এর-সিঙ্ক্রোনাস-calRender-পুনঃরেন্ডার-পরে গ্রিডেই — ep286-র-মতো setTimeout/capture-পতাকা-অপ্রয়োজনীয়); **বুট/রি-রেন্ডারে সফট-আর্ম** (is-sel→is-today→প্রথম-enabled-অগ্রাধিকার; **calRender-র‍্যাপার** — calRender-বডি-অস্পৃশ্য; স্টেপারে ফোকাস-চুরি-শূন্য) + **রোভিং-ট্যাবইনডেক্স** (active=0, enabled-বাকি=−1; disabled-বাটন-স্পর্শ-শূন্য) + **is-act-শ্রেণি** + **সম্পূর্ণ-ভবিষ্যৎ-মাসে নো-ট্যাবয়েবল-সঠিক** (সব-disabled → z=0 — বৈধ a11y; ফেরত-এলে soft-arm পুনঃ-আর্ম); roving-কী = **ISO-string data-d** (ep286-র data-m-সংখ্যা-নয়); **__ep287QA হুক ×৮** (active/focused/move/set/arm/days/enabled/tabbed)।

**[Mandatory-স্টাইল]:** epaper.css ep287-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — `.ep-cal-day.is-act` টিন্ট (brand-border + green-tint + brand-text), `.ep-cal-day.is-act.has::after` ডট-সংরক্ষণ, `.ep-cal-day.is-act.is-sel` সলিড-সংরক্ষণ+আউটলাইন (armed-নির্বাচিত-দিন-দৃশ্যমানতা), `.ep-cal-day:focus-visible` রিং, **মোবাইল-সংকোচন 640px** (গ্রিড-gap 1px + min-height/ফন্ট-কমপ্যাক্ট), reduced-motion-গার্ড; ep280-286-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s287-calday-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২৮ + রেন্ডার্ড ×৩ + E2E ×১৮: বুট-আর্ম-ডায়নামিক (সর্বশেষ-তারিখ-বুট — active=২০২৬-০৯-১৫-is-sel) + set()-ফোকাস-চেইন + is-act ×১ + **রোভিং-ট্যাবইনডেক্স (z=1/m=enabled−1/n=৩০/disabled=৭/disabled-স্পর্শ=০)** + **Home-অ্যাংকর** → →/↓(+7)/↑(−7)-নেভ (eval-গণিত-প্রত্যাশা — domcount-probe-চুক্তি) + **End-শেষ-enabled (২০২৬-০৯-২৩)** + **→-wrap+skip (End→সেপ্টে-০১ — ভবিষ্যৎ-দিন-লাফ)** + ←-wrap+skip + Enter-জাম্প (is-sel-স্থানান্তর + ফোকাস-ফেরত গ্রিডেই) + **স্টেপার-সফট-আর্ম (ফোকাস-চুরি-শূন্য)** + **সম্পূর্ণ-ভবিষ্যৎ-মাস-চুক্তি (enabled=০ → z=0)** + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **নতুন সিড-হেল্পার scripts/s287-seedday.js** (২০২৬-০৯-১৫ ×১ — hasPayload-গ্যারান্টি (s283-গোটচা) + সেপ্টেম্বর-গ্রিড; নেট-শূন্য PRE=০→FINAL=০; s284/s286-মার্কার-অস্পৃশ্য) + **পূর্ণ-রিগ্রেশন s260-s287 (২৯-সুইট সব-গ্রিন — রানার scripts/s287-regression.sh)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন; প্যাচ: scripts/s287-patch.py (idempotent ×২, ×২-এডিট, পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×২ (PLANS session287):** ① **স্টেপার-দিক-গোটচা** — epCalPrev=calM++ (সেপ্টেম্বর→অক্টোবর = **সম্পূর্ণ-ভবিষ্যৎ-মাস** → সব-disabled → সফট-আর্ম বৈধভাবেই শূন্য → প্রথম-রানে সফট-আর্ম-মিথ্যা-ফেল); প্রোব-সংশোধন: আর্ম-যোগ্য-মাসে epCalNext (calM--) + ভবিষ্যৎ-মাস-প্রোবে **দ্বি-ক্লিক-গণনা** (আগস্ট-থেকে অক্টোবর = epCalPrev ×২) ② **সম্পূর্ণ-ভবিষ্যৎ-মাস-নো-ট্যাবয়েবল-চুক্তি** — সব-disabled-মাসে z=0 + is-act=০ **বৈধ** (নো-ইন্টারঅ্যাক্টিভ-দিন → ট্যাব-স্কিপ-সঠিক; ফেরত-এলে soft-arm পুনঃ-আর্ম) — সুইটে ব্রাউজার-তারিখ-নির্ভর দৃশ্যে skip-চুক্তি।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮৭ সন্নিবেশিত')

# ── ② PLANS.md session287-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session287-নোট' in pl:
    print('skip-②: PLANS session287-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session286-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session287-নোট (cron 403679 — দিন-গ্রিডে কী-বোর্ড-নেভিগেশন ep287)
- **স্টেপার-দিক-গোটচা (নতুন — সুইট-ক্যালিব্রেশন):** epaper-স্টেপার-নাম-দিক-উল্টো — `epCalPrev=calM++` (অগ্রবর্তী-মাস), `epCalNext=calM--` (পশ্চাদ্‌গামী-মাস); সফট-আর্ম-প্রোব epCalPrev-এ দিলে সেপ্টেম্বর→অক্টোবর = **সম্পূর্ণ-ভবিষ্যৎ-মাস** (সব-দিন-disabled) → সফট-আর্ম বৈধভাবেই শূন্য (z=0/is-act=০) → প্রথম-রানে মিথ্যা-ফেল; **প্রোব-সংশোধন: আর্ম-যোগ্য-মাসে epCalNext** + ভবিষ্যৎ-মাস-প্রোবে **দ্বি-ক্লিক** (আগস্ট-থেকে অক্টোবর = epCalPrev ×২ — মাঝপথে সেপ্টেম্বর)। ভবিষ্যৎ-ক্যালেন্ডার-সুইটে স্টেপার-দিক-সচেতন-হোন।
- **সম্পূর্ণ-ভবিষ্যৎ-মাস-নো-ট্যাবয়েবল-চুক্তি (নতুন a11y-চুক্তি):** সব-দিন-disabled-মাসে roving কিছুই-আর্ম-করে-না (ep287Active='', z=0, is-act=০) — **বৈধ** (নো-ইন্টারঅ্যাক্টিভ-দিন → ট্যাব-স্কিপ-সঠিক; পূর্ববর্তী-নেটিভ-আচরণেও disabled-বাটন-অ্যাক্সেসযোগ্য-নয়) — ফেরত-এলে soft-arm স্বয়ংক্রিয়-পুনঃ-আর্ম (is-sel→is-today→প্রথম-enabled); সুইটে ব্রাউজার-তারিখ-নির্ভর দৃশ্যে assert-নয় skip-চুক্তি।
- **ep287-স্থাপত্য-চুক্তি:** **calRender-র‍্যাপার-প্রথম** (ep287CalRenderBase — calRender-বডি-অস্পৃশ্য; ঘোষণা-আর-ডাক-এক-নাম — s285-নাম-মিল-রীতি; calJump/স্টেপার/বুট-সব-calRender-ডাক soft-arm-দেখে — late-bound); keydown elCalGrid-স্তরেই (ep283Open-গার্ড-বিহীন — দিন-গ্রিড-সর্বদা-দৃশ্যমান); Enter/Space → t.click() → grid-click-handler → calJump (**জাম্প-লজিক-ডুপ্লিকেট-নিষিদ্ধ**); **জাম্পে-ফোকাস-ফেরত keydown-branch-এই** — calJump-এর calRender সিঙ্ক্রোনাস → পুনঃরেন্ডার-পরে is-sel-দিন-ফোকাস (ep286-র setTimeout/capture-পতাকা-এখানে-অপ্রয়োজনীয় — প্যানেল-বন্ধ-নেই); roving-কী **ISO-string data-d** (data-m-সংখ্যা-নয় — disabled/অস্তিত্বহীন-দিন-নিরাপদ); __ep287QA ×৮ (active/focused/move/set/arm/**days/enabled/tabbed** — গণনা-হুক-বিস্তার)।
- **সিড-হেল্পার-তৃতীয় (s287-seedday):** **একক-মার্কার** (S287TESTA → ২০২৬-০৯-১৫, source qa-s287) — দিন-গ্রিড-নেভ **enabled-চালিত, data-নয়** (has-ডট-শুধু-দৃশ্য) → বহু-মার্কার-দরকার-নেই; দু-দায়িত্ব-এক-মার্কারে: hasPayload-গেট (s283-গোটচা — রিডার-মার্কআপ payload-অবস্থায়-ই) + বুট-মাস-নিশ্চিতি; নেট-শূন্য PRE=০→FINAL=০; s284/s286-মার্কার-অস্পৃশ্য।
- **পরের-এজেন্ট: session288 থেকে (worklog Task ID 128)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session287 + session286 + session285 + session284 + উভয়-session280-নোট পড়ুন; বাকি-প্রস্তাব: ep282-প্যানেলে aria-activedescendant-বিস্তার, LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), **ক্যালেন্ডার-কার্ডে aria-live/is-sel-ঘোষণা (ep287-পরবর্তী a11y-স্তর)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session287-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-127 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 127 (session287' in wl:
    print('skip-③: repo-worklog Task-127 ইতোমধ্যে')
else:
    ENTRY = '''

---
Task ID: 127 (session287 — cron 403679; দিন-গ্রিডে কী-বোর্ড-নেভিগেশন ep287)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609240048)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`0ab3ac3` (session286-ep286), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-স্পট home/epaper/health-200 + agent-browser-প্রোড ep286-ক্যানারি (প্যানেল-খোলায় আর্ম active=focused=৮-সেপ্টেম্বর + Home=৮/End=৮/wrap=৮ — একমাত্র-সেপ্টেম্বর-enabled + Escape-ফোকাস-ফেরত epCalMonth) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session286-শীর্ষ-প্রস্তাব গ্রহণ: **দিন-গ্রিডে কী-বোর্ড-নেভিগেশন**)

## এ-রাউন্ডে সম্পন্ন (session287)
- **[Mandatory-ফিচার] ep287:** epCalGrid-দিন-গ্রিডে (৭-কলাম) **←→=±1, ↑=−7, ↓=+7-রোভিং (wrap + disabled-স্কিপ-লুপ — ভবিষ্যৎ-দিন-লাফ; সব-disabled-নো-অপ tries≥len-গার্ড; মাস-সীমা-স্কিপ = সীমা-অতিক্রম-নয় — wrap-এ-সীমা-লাফ)** + **Home/End-enabled** + **Enter/Space-সক্রিয়** (grid-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার — calJump-ডুপ্লিকেট-নিষিদ্ধ) + **জাম্পে-ফোকাস-ফেরত is-sel-দিন** (সিঙ্ক্রোনাস-calRender-পুনঃরেন্ডার-পরে — পতাকা-বিহীন-সরল) + **বুট/রি-রেন্ডার-সফট-আর্ম (is-sel→is-today→প্রথম-enabled — calRender-র‍্যাপার)** + **রোভিং-ট্যাবইনডেক্স (disabled-স্পর্শ-শূন্য)** + is-act-শ্রেণি + **সম্পূর্ণ-ভবিষ্যৎ-মাসে z=0-বৈধ** + **__ep287QA হুক ×৮**; roving-কী = ISO-string data-d
- **[Mandatory-স্টাইল]:** ep287-ব্লক হেক্স-শূন্য টোকেন-শুধু — is-act-টিন্ট + is-act.has-ডট-সংরক্ষণ + **is-act.is-sel-সলিড-সংরক্ষণ+আউটলাইন** + focus-visible-রিং + **মোবাইল-সংকোচন 640px (gap 1px + কমপ্যাক্ট)** + reduced-motion-গার্ড
- **টেস্ট:** নতুন tests/s287-calday-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক (SKIP=০)** + **নতুন সিড-হেল্পার scripts/s287-seedday.js** (২০২৬-০৯-১৫ ×১ — hasPayload + বুট-মাস-গ্যারান্টি; নেট-শূন্য PRE=০→FINAL=০) + **পূর্ণ-রিগ্রেশন s260-s287 (২৯-সুইট সব-গ্রিন — রানার scripts/s287-regression.sh)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন
- **গোটচা ×২ (PLANS session287):** ① **স্টেপার-দিক-উল্টো** — epCalPrev=calM++ (অক্টোবর = সম্পূর্ণ-ভবিষ্যৎ → সফট-আর্ম-বৈধ-শূন্য-মিথ্যা-ফেল) → প্রোব epCalNext + ভবিষ্যৎ-মাস-প্রোবে দ্বি-ক্লিক ② **সম্পূর্ণ-ভবিষ্যৎ-মাসে z=0-বৈধ** (নো-ট্যাবয়েবল-সঠিক; ফেরত-এলে soft-arm পুনঃ-আর্ম)
- **পাইপলাইন:** প্যাচ scripts/s287-patch.py (idempotent ×২, ×২-এডিট, পোস্ট-অ্যাসার্ট+হেক্স-শূন্য-অ্যাসার্ট) + feature-commit + ডক ×৩ (PROJECT §২৮৭ + PLANS session287 + repo-worklog Task-127; s287-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু) + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep287-লাইভ-যাচাই** + স্ক্রিনশট download/s287-prod-*.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session288 লেবেল (worklog Task ID 128)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান; PLANS session287 + session286 + session285 + session284 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: ep282-প্যানেলে aria-activedescendant-বিস্তার, LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), **ক্যালেন্ডার-কার্ডে aria-live/is-sel-ঘোষণা (ep287-পরবর্তী a11y-স্তর)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session287-ep287); working-tree ক্লিন'''
    wl = wl.rstrip('\n') + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-127 সংযোজিত')

print('ডক-আপডেট সম্পন্ন (idempotent ×২-প্রস্তুত)')
