#!/usr/bin/env python3
# s286-docs.py — session286 ডক-আপডেট (PROJECT §২৮৬ + PLANS session286-নোট + repo worklog Task-126)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮৬ (§২৮৫-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮৬ (session286' in pj:
    print('skip-①: PROJECT §২৮৬ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮৫ (session285'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮৬ (session286 — cron 403679: মাস-গ্রিডে কী-বোর্ড-নেভিগেশন ep286 — ৪-কলাম-রোভিং + disabled-স্কিপ + Escape-ফোকাস-ফেরত) — s286 ৫৬/৫৬ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`5cc4eb0` (session285-ep285, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-স্পট home/epaper-200 + agent-browser-প্রোড ep285-ক্যানারি (প্যানেল→স্ট্রিপ-খোলায় আর্ম: active=focused=২০২৬ + tabindex=0 + End→Enter-জাম্প: jumped=২০২৬ + স্ট্রিপ-বন্ধ + ফোকাস-ফেরত epCalMY) — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session285-শীর্ষ-প্রস্তাব গ্রহণ: **মাস-গ্রিডে কী-বোর্ড-নেভিগেশন**)।

**[Mandatory-ফিচার] মাস-গ্রিডে কী-বোর্ড-নেভিগেশন (ep286):** ep283-মাস-গ্রিডে (epCalMGrid — ৪-কলাম × ৩-সারি) **←→=±1, ↑=−4, ↓=+4 রোভিং** (wrap + **disabled-স্কিপ-লুপ** — ডেটা-শূন্য-মাস-লাফ; সব-মাস-disabled-হলে নো-অপ tries≥১২-গার্ড) + **Home=প্রথম-enabled, End=শেষ-enabled** (DOM-শেষ-নয়) + **Enter/Space-সক্রিয়** (preventDefault + active-মাস-ক্লিক — ep283-হ্যান্ডলার-পুনঃব্যবহার, জাম্প-লজিক-ডুপ্লিকেট-নিষিদ্ধ); **খোলায়-আর্ম** (is-cur→has→প্রথম-enabled-অগ্রাধিকার — disabled-is-cur-স্বয়ংক্রিয়-স্কিপ) + **রোভিং-ট্যাবইনডেক্স** (active=0, enabled-বাকি=−1; disabled-বাটন-স্পর্শ-শূন্য) + **is-act-শ্রেণি**; **রি-রেন্ডারে সফট-আর্ম** (ep283Render-র‍্যাপার — স্টেপারে is-act-সংরক্ষণ, ফোকাস-চুরি-শূন্য); বন্ধে active-রিসেট; **Escape-ফোকাস-ফেরত epCalMonth** (capture-পতাকা ep286EscPending — outside-click-বন্ধে-ফোকাস-চুরি-শূন্য) + **জাম্পে-ফোকাস-ফেরত** (মাস-ক্লিকে প্যানেল-বন্ধ → ট্রিগারে ফেরত); **__ep286QA হুক ×৫** (active/focused/move/set/arm); ep283/ep284/ep285-ফাংশন-বডি-অস্পৃশ্য (র‍্যাপার-স্তর ×৩ — Open/Render/Close)।

**[Mandatory-স্টাইল]:** epaper.css ep286-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — `.ep-cal-m.is-act` টিন্ট (brand-border + green-tint + brand-text), `.ep-cal-m.is-act.has::after` ডট-সংরক্ষণ, `.ep-cal-m.is-act.is-cur` আউটলাইন, **মোবাইল-সংকোচন 640px** (গ্রিড-gap 2px + প্যাডিং/ফন্ট-কমপ্যাক্ট), reduced-motion-গার্ড; ep280-285-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s286-calgrid-suite.sh **৫৬/৫৬ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২৬ + রেন্ডার্ড ×৩ + E2E ×১৭: খোলায়-আর্ম is-cur-অগ্রাধিকারে (focused==active + enabled+has/is-cur — **পেজ-সর্বশেষ-সংরক্ষিত-তারিখে-বুট-প্রমাণ**) + is-act ×১ + **রোভিং-ট্যাবইনডেক্স (z=1/m=enabled−1/n=12/disabled=৪)** + **Home-অ্যাংকর** (নিশ্চিত-ভিত্তি) + →-ফেব্রুয়ারি + ↓-জুন (+4-গ্রিড-সারি) + ↑-ফেরত + **End-আগস্ট (শেষ-enabled)** + **↓-wrap+skip (আগস্ট→ডিসেম্বর-disabled→জানু)** + **←-wrap+skip (জানু→আগস্ট)** + Enter-জাম্প (প্রথম-সংরক্ষিত-দিন ২০২৬-০১-১০ + প্যানেল-বন্ধ + ফোকাস-ফেরত epCalMonth) + Escape-বন্ধ+ফোকাস-ফেরত + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **নতুন সিড-হেল্পার scripts/s286-seedmonths.js** (২০২৬-জানু..আগস্ট ×৮ — ৪-কলাম-গ্রিডের প্রথম-দু-সারি পূর্ণ-enabled, সেপ্টেম্বর..ডিসেম্বর disabled-নির্ধারণসই; নেট-শূন্য PRE=০→FINAL=০; s284-মার্কার-অস্পৃশ্য) + **পূর্ণ-রিগ্রেশন s260-s286 (২৮-সুইট সব-গ্রিন — রানার scripts/s286-regression.sh)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন (১২২ ejs); প্যাচ: scripts/s286-patch.py (idempotent ×২, ×২-এডিট, পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×৩ (PLANS session286):** ① **is-cur-সর্বশেষ-তারিখ-বুট-গোটচা** — epaper-পেজ তারিখ-পিকার সর্বশেষ-সংরক্ষিত-তারিখে বুট-করে → ক্যালেন্ডার-দৃশ্য-মাস = ও-মাস → সিড-হলে is-cur=enabled → আর্ম **has-প্রথম-নয়, is-cur-ই** (আগস্ট) — সুইট-অ্যাসার্ট স্থির-সূচক-নয় **ডায়নামিক-চুক্তিতে** (focused==active + enabled+has/is-cur) + নেভ-ক্রম **Home-অ্যাংকর-পূর্বক** ② **disabled-রোভিং-স্পর্শ-শূন্য-গোটচা** — roving tabindex শুধু enabled-বাটনে (disabled-বাটন-নেটিভ-আনট্যাবয়েবল — স্পর্শের-দরকার-নেই) → গণনা-অ্যাসার্ট m=enabled−1 (n−1 নয়) ③ **রানার-সারাংশ-দ্বি-ফরম্যাট-গোটচা** — সুইট-সারাংশ দু-রীতি (`PASS=…/ALL GREEN` ও `সারসংক্ষেপ: PASS=…` — s280-ep3p-পরিবার) → রানার-গ্রেপ উভয়-গ্রহণী (`FAIL=0`-সারাংশ-মিল) — মিথ্যা-ফেল-বর্জন।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮৬ সন্নিবেশিত')

# ── ② PLANS.md session286-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session286-নোট' in pl:
    print('skip-②: PLANS session286-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session285-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session286-নোট (cron 403679 — মাস-গ্রিডে কী-বোর্ড-নেভিগেশন ep286)
- **is-cur-সর্বশেষ-তারিখ-বুট-গোটচা (নতুন — সুইট-ক্যালিব্রেশন):** epaper-পেজ তারিখ-পিকার **সর্বশেষ-সংরক্ষিত-তারিখে** বুট-করে → ক্যালেন্ডার-দৃশ্য-মাস (calY/calM) = ও-মাস → ও-মাসে ডেটা-থাকলে is-cur=enabled → **আর্ম is-cur-ই (has-প্রথম-নয়)** — প্রথম-রানে জানু-প্রত্যাশা ×৩-মিথ্যা-ফেল; **সুইট-চুক্তি: আর্ম-অ্যাসার্ট ডায়নামিক** (focused==active + is-act-বাটন enabled+has/is-cur) + নেভ-ক্রম **Home-অ্যাংকর-পূর্বক** (নিশ্চিত জানু-ভিত্তি); ভবিষ্যতে ক্যালেন্ডার-সুইটে পেজ-বুট-মাস-সচেতন-হোন।
- **disabled-রোভিং-স্পর্শ-শূন্য-গোটচা (নতুন):** ep286-রোভিং tabindex শুধু **enabled**-বাটনে সেট (active=0, enabled-বাকি=−1); disabled-বাটন **নেটিভ-আনট্যাবয়েবল — tabindex-স্পর্শ-শূন্য** → গণনা-অ্যাসার্ট **m=enabled−1** (s285-র m=n−1-চুক্তি এখানে-প্রযোজ্য-নয়); এ-চুক্তিতে skip-লুপ (tries≥১২ — সব-disabled-বছরে নো-অপ)।
- **রানার-সারাংশ-দ্বি-ফরম্যাট-গোটচা (নতুন):** সুইট-সারাংশ দু-রীতি — বেশিরভাগ `PASS=… + ALL GREEN` টেইল, কিন্তু s280-ep3p-পরিবার `সারসংক্ষেপ: PASS=…` (ALL-GREEN-লাইন-বিহীন) → রানার-গ্রেপ-শুধু-ALL-GREEN-হলে **মিথ্যা-ফেল** (প্রথম-রানে ×১ — সরাসরি-রানে PASS=৬২ প্রমাণিত); scripts/s286-regression.sh উভয়-গ্রহণী (`FAIL=0`-মিল) — ভবিষ্যৎ-রানারেও-প্রযোজ্য।
- **ep286-স্থাপত্য-চুক্তি:** র‍্যাপার-স্তর ×৩ (ep283OpenPanel→আর্ম; ep283Render→সফট-আর্ম; ep283ClosePanel→Escape-ফোকাস + রিসেট — ep283/ep284/ep285-বডি-অস্পৃশ্য; **ঘোষণা-আর-ডাক-এক-নাম** — s285-নাম-মিল-গোটচা-রীতি); keydown গ্রিড-স্তরেই; Enter/Space → active-মাস-ক্লিক (ep283-হ্যান্ডলার-পুনঃব্যবহার); **Escape-ফোকাস capture-পতাকায়** (document-capture-keydown → ep283-বাবল-বন্ধের-আগে পতাকা → close-র‍্যাপারে ফোকাস → setTimeout-পরিষ্কার — outside-click-বন্ধে পতাকা-অসত্য, ফোকাস-চুরি-শূন্য); ফোকাস-চেইন: খোলায় is-cur/has-প্রথম-মাস → জাম্পে/Escape-এ epCalMonth; __ep286QA ×৫।
- **সিড-হেল্পার-দ্বিতীয় (পুনঃব্যবহারযোগ্য):** scripts/s286-seedmonths.js — ২০২৬-জানু..আগস্ট ×৮ (S286TEST0..7, source qa-s286) — ৪-কলাম-গ্রিডের প্রথম-দু-সারি পূর্ণ-enabled + শেষ-সারি পূর্ণ-disabled (skip/wrap/Home/End-অ্যাসার্ট নির্ধারণসই); s284-seedyear-সহ-সহাবস্থান (মার্কার-স্পর্শ-শূন্য); বহু-মাস-নির্ভর-যে-কোনো-সুইটে সরাসরি-ব্যবহার্য।
- **পরের-এজেন্ট: session287 থেকে (worklog Task ID 127)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session286 + session285 + session284 + উভয়-session280-নোট পড়ুন; বাকি-প্রস্তাব: LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, **দিন-গ্রিডে (epCalGrid) কী-বোর্ড-নেভিগেশন (ep286-র-ই-প্যাটার্ন — ৭-কলাম-রোভিং + মাস-সীমা-স্কিপ)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session286-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-126 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 126 (session286' in wl:
    print('skip-③: repo-worklog Task-126 ইতোমধ্যে')
else:
    ENTRY = '''

---
Task ID: 126 (session286 — cron 403679; মাস-গ্রিডে কী-বোর্ড-নেভিগেশন ep286)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609240011)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`5cc4eb0` (session285-ep285), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-স্পট home/epaper-200 + agent-browser-প্রোড ep285-ক্যানারি (প্যানেল→স্ট্রিপ-খোলায় আর্ম active=focused=২০২৬ + tabindex=০ + End→Enter-জাম্প + ফোকাস-ফেরত epCalMY) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session285-শীর্ষ-প্রস্তাব গ্রহণ: **মাস-গ্রিডে কী-বোর্ড-নেভিগেশন**)

## এ-রাউন্ডে সম্পন্ন (session286)
- **[Mandatory-ফিচার] ep286:** ep283-মাস-গ্রিডে (৪-কলাম × ৩-সারি) **←→=±1, ↑=−4, ↓=+4-রোভিং (wrap + disabled-স্কিপ-লুপ — সব-disabled-নো-অপ tries≥১২-গার্ড)** + **Home/End-enabled** + **Enter/Space-সক্রিয়** (ep283-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার); **খোলায়-আর্ম (is-cur→has→প্রথম-enabled)** + **রোভিং-ট্যাবইনডেক্স (disabled-স্পর্শ-শূন্য)** + is-act-শ্রেণি + **রি-রেন্ডার-সফট-আর্ম** + বন্ধে-রিসেট + **Escape-ফোকাস-ফেরত epCalMonth (capture-পতাকা — outside-click-ফোকাস-চুরি-শূন্য)** + জাম্পে-ফোকাস-ফেরত + **__ep286QA হুক ×৫**; র‍্যাপার-স্তর ×৩ (ep283/ep284/ep285-বডি-অস্পৃশ্য)
- **[Mandatory-স্টাইল]:** ep286-ব্লক হেক্স-শূন্য টোকেন-শুধু — is-act-টিন্ট + is-act.has-ডট-সংরক্ষণ + is-act.is-cur-আউটলাইন + **মোবাইল-সংকোচন 640px (gap 2px + কমপ্যাক্ট)** + reduced-motion-গার্ড
- **টেস্ট:** নতুন tests/s286-calgrid-suite.sh **৫৬/৫৬ ×২-ধারাবাহিক (SKIP=০)** + **নতুন সিড-হেল্পার s286-seedmonths.js** (২০২৬-জানু..আগস্ট ×৮ — নেট-শূন্য PRE=০→FINAL=০) + **পূর্ণ-রিগ্রেশন s260-s286 (২৮-সুইট সব-গ্রিন — রানার s286-regression.sh)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন (১২২ ejs)
- **গোটচা ×৩ (PLANS session286):** ① **is-cur-সর্বশেষ-তারিখ-বুট** — পেজ সর্বশেষ-সংরক্ষিত-তারিখে-বুট → is-cur=আগস্ট-enabled → আর্ম has-প্রথম-নয় → সুইট-অ্যাসার্ট-ডায়নামিক + Home-অ্যাংকর-চুক্তি ② **disabled-রোভিং-স্পর্শ-শূন্য** — tabindex শুধু-enabled-বাটনে → m=enabled−1 (s285-র m=n−1-এখানে-প্রযোজ্য-নয়) ③ **রানার-সারাংশ-দ্বি-ফরম্যাট** — `ALL GREEN`-বিহীন `সারসংক্ষেপ: PASS=`-পরিবার (s280-ep3p) → রানার-উভয়-গ্রহণী
- **পাইপলাইন:** প্যাচ scripts/s286-patch.py (idempotent ×২, ×২-এডিট) + feature-commit `a8e23f2` + ডক ×৩ (PROJECT §২৮৬ + PLANS session286 + repo-worklog Task-126; s286-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু) + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep286-লাইভ-যাচাই (প্রোডে আর্ম + Home→Enter-জাম্প + Escape-ফোকাস-ফেরত)** + স্ক্রিনশট download/s286-prod-*.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session287 লেবেল (worklog Task ID 127)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান; PLANS session286 + session285 + session284 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, **দিন-গ্রিডে (epCalGrid) কী-বোর্ড-নেভিগেশন (ep286-র-ই-প্যাটার্ন — ৭-কলাম-রোভিং + মাস-সীমা-স্কিপ)**, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session286-ep286); working-tree ক্লিন'''
    wl = wl.rstrip('\n') + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-126 সংযোজিত')

print('ডক-আপডেট সম্পন্ন (idempotent ×২-প্রস্তুত)')
