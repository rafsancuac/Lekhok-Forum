#!/usr/bin/env python3
# s293-docs.py — session293 ডক-আপডেট (PROJECT §২৯৩ + PLANS session293-নোট + repo worklog Task-133)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৯৩ (§২৯২-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৯৩ (session293' in pj:
    print('skip-①: PROJECT §২৯৩ ইতোমধ্যে')
else:
    ANCHOR = '## §২৯২ (session292'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৯৩ (session293 — cron 403679: ডেইলি কনটেন্ট তাৎক্ষণিক-ফিল্টার dcf293 — /admin/daily তালিকা-সারফেসে দ্বৈত-ফ্যাসেট (কীওয়ার্ড + ধরন + স্ট্যাটাস — সব-শর্ত AND)) — s293 ৫৪/৫৪ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`9af3898` (session292-ep292, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + ep292-লাইভ __epk292QA (H0T5) + ফিল্ম-বাটন ৬/থাম্ব ৫ + ep291-হুক + console-ত্রুটি-শূন্য + 390px-hScroll-শূন্য) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন (পূর্ব-সেশন-প্রস্তাব-পুনঃস্কোপিং):** PLANS session292-তালিকার admin-সারফেস-ফিল্টার-প্রার্থীগুলোর **প্রথমে-কভারেজ-স্ক্যান** — trash (`__trQA`), content-history (s272-chfilter), users (`__auQA`), support-center (`__scQA` + ৩৫-filter-mention) **ইতোমধ্যে-ফিল্টার্ড**; security.ejs = ৭৬-লাইনের 2FA-স্ট্যাটাস-কার্ড-পেজ (তালিকা-সারফেস-নয় — ফিল্টার-অপ্রাসঙ্গিক) → **আসল-শূন্য-সারফেস স্ক্যানে চূড়ান্ত: /admin/daily তালিকা** (৪৩-সারি-টেবিল, শূন্য-ফিল্টার, স্ট্যাটিক-ধরন-চিপ-শুধু-প্রদর্শনী) — পরিবারের ২২তম-সারফেস।

**[Mandatory-ফিচার] dcf293 (mo268/sb269-পরিবার-সম্প্রসারণ):** daily/list.ejs-এ **তাৎক্ষণিক-ফিল্টার-স্ট্রিপ** (কীওয়ার্ড-ইনপুট + **ধরন-সিলেক্ট** (DAILY_TYPES-ড্রিভেন ৫-ধরন) + **স্ট্যাটাস-সিলেক্ট** (প্রকাশিত/খসড়া) + clear-বাটন + কাউন্ট-চিপ (বাংলা-সংখ্যা 'X / Y') + kbd-হিন্ট) — **সারি-বৈশিষ্ট্য-চতুষ্টয়** (`tr[data-dcf-row]` + `data-kw` (dcfKw293-সহায়ক: শিরোনাম+বডি+ধরন-লেবেল+তারিখ, ১৪০-অক্ষর-ক্যাপ) + `data-dcf-type` + `data-dcf-pub`); সব-শর্ত **AND**; শূন্য-অবস্থা-বক্স; **'f'-ফোকাস-ফিল্ড-গার্ড** (INPUT/TEXTAREA/SELECT/contentEditable-থেকে-চুরি-নিষিদ্ধ) + Escape-পরিষ্কার (stopPropagation); **__dcf293QA হুক ×৪** (total/count/apply/clear — সারফেস-শূন্যে-ও-সংজ্ঞায়িত, স্ট্রিপ-দুই-শাখার-আগে-রেন্ডার) + __dcf293wired-গার্ড; no-regression (bulk-bar/bulk-publish/data-bulk-all/count-pill/sidebar/DAILY_TYPES-চিপ-অক্ষুণ্ণ)।

**[Mandatory-স্টাইল]:** inline `<style>` ব্লক **হেক্স-শূন্য টোকেন-শুধু** — .dcf-instant-স্ট্রিপ (var(--lf-fb-border)-বর্ডার + var(--lf-white)) + **amber-টোকেন-পরিবার** (var(--lf-amber-deep)/var(--lf-amber-soft) — 'সূর্য'-থিম-মিল; পরিবারের brandgreen-রীতির-বিকল্প-প্রমাণ) + input/select-মিলিত-পটভূমি + color-mix-ফোকাস-রিং (৩-স্তর) + kbd-পিল (dashed color-mix) + **[hidden]-গার্ড বাইট-সঠিক** (চিপ/শূন্য/ক্লিয়ার display:none + `tr[data-dcf-row][hidden]` !important) + reduced-motion + 640px-সংকোচন (kbd-হিন্ট-লুকানো)।

**টেস্ট:** নতুন tests/s293-dcfilter-suite.sh **৫৪/৫৪ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২৬ + no-reg ×৫ + স্টাইল ×৮; SSR ×৯: **DB-সরাসরি-মার্কার-সিড ×৩** (s293-seeddaily — quiz/প্রকাশিত + activity/খসড়া + this_day/প্রকাশিত; **POST-নিষিদ্ধ: published=1-এ broadcastToAll-বিজ্ঞপ্তি — s274/s277-চুক্তি**) + লগইন admin/admin123 (s277-প্রমাণিত scope-gated ভিউয়ার) + অ্যাঙ্করড-চেক '/admin/daily/?$' + **প্রত্যাশা-গণনা রেন্ডার্ড-HTML থেকে**; E2E ×১৪: বুট-হুক (T=C=৪৩) + কীওয়ার্ড 'qa293'→৩+চিপ + clear→৪৩+চিপ-লুকানো + ধরন=quiz→১১ + **quiz+খসড়া (AND)→০+শূন্য-অবস্থা** + স্ট্যাটাস→১+শূন্য-লুকানো + Escape→পরিষ্কার + **'f'-ফোকাস** + **ফিল্ড-গার্ড (SELECT-ফোকাস-অটুট)** + ফ্রেশ-লোড + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) + সিড-নেট-শূন্য (CLEAN-OK deleted=৩) + **পূর্ণ-রিগ্রেশন s260-s293 (৩৫-সুইট সব-গ্রিন — রানার scripts/s293-regression.sh; চাঙ্ক ১২+১২+১১)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)-গ্রিন; প্যাচ: scripts/s293-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, dcf-নেমস্পেস-পূর্ব-শূন্য-FATAL-গার্ড, পোস্ট-অ্যাসার্ট + [hidden]-বাইট + হেক্স-শূন্য + no-regression)।

**গোটচা ×৪ (PLANS session293):** ① **eval-টপ-লেভেল-return = SyntaxError** — agent-browser eval-এ ফাংশন-বাইরে `return` বৈধ-নয় → খালি-ফেরত (poll তবু-কাজ করে — &&/IIFE-রীতি) → **সর্বদা IIFE-র‍্যাপ** ② **HTML-grep-সিলেক্টর-লিটারাল-ওভারকাউন্ট** — 'data-dcf-row' একাই grep = সারি+CSS+JS-লিটারাল (৪৫ = ৪৩+২) → **সারি-ইউনিক-যুগল-প্যাটার্ন** ('data-dcf-row data-kw=') ③ **dispatch-ফোকাস-মিথ্যা-ধারণা** — keydown-dispatch ফোকাস-স্থানান্তর-করে-না → ফিল্ড-গার্ড-অ্যাসার্টে আগে **স্পষ্য-focus()** তারপর-অপরিবর্তিত-অ্যাসার্ট (E7-এর-ফোকাস-উত্তরাধিকার-ভুল-ধরা) ④ **broadcast-সিড-নিষেধ** — POST /admin/daily published=1 সব-ইউজারে-নোটিফিকেশন (s274/s277-চুক্তি) → DB-সরাসরি-সিড।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৯৩ সন্নিবেশিত')

# ── ② PLANS.md session293-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session293-নোট' in pl:
    print('skip-②: PLANS session293-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session292-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session293-নোট (cron 403679 — ডেইলি কনটেন্ট তাৎক্ষণিক-ফিল্টার dcf293)
- **প্রস্তাব-পুনঃস্কোপিং-স্ক্যান-প্রথা (নতুন):** পূর্ব-সেশন-প্রস্তাব-তালিকা কোড-লেখার-আগে **কভারেজ-স্ক্যান** বাধ্যতমূলক — admin-সারফেস-ফিল্টার-প্রস্তাবের ৩-প্রার্থীর ২টিই ইতোমধ্যে-ফিল্টার্ড ছিল (trash `__trQA`, content-history s272), security.ejs তালিকা-সারফেস-ই-নয় (2FA-কার্ড-পেজ) → grep-স্ক্যানে (data-*-row/__*QA/filter-mentions × লাইন-সংখ্যা × <table) **আসল-শূন্য-সারফেস** (daily তালিকা) চিহ্নিত; ভবিষ্যতে প্রস্তাব-তালিকা = **প্রার্থী-তালিকা-মাত্র**, যাচাই-পূর্বক-নির্বাচন।
- **eval-টপ-লেভেল-return-গোটচা (সুইট-শ্রেণি — else-বিহীন-ternary-র-ভাই):** agent-browser eval-এ ফাংশন-বাইরে `return X` **বৈধ-JS-নয়** (eval-কনটেক্সট-সীমা) → SyntaxError → stdout-খালি; poll-এক্সপ্রেশন তবু-কাজ করে (&&-রীতি/IIFE) → পার্থক্য-বোঝা-কঠিন (run-১-এ ৮-অ্যাসার্ট-একসাথে-খালি) → **সর্বদা IIFE-র‍্যাপ** `(function(){...;return X})()`।
- **HTML-grep-সিলেক্টর-লিটারাল-ওভারকাউন্ট-গোটচা:** রেন্ডার্ড-HTML-এ `grep -o 'data-x-row'` = সারি-উপস্থিতি + **CSS-সিলেক্টর + JS-querySelectorAll-লিটারালও** (৪৩-সারি → ৪৫-হিট) → প্রত্যাশা-গণনায় **সারি-ইউনিক-যুগল-প্যাটার্ন** (`data-dcf-row data-kw=` — কেবল-মার্কআপে) বা নিষ্কাশন-স্কোপ-সীমিতকরণ।
- **dispatch-ফোকাস-গোটচা:** `el.dispatchEvent(new KeyboardEvent(...))` ফোকাস-স্থানান্তর-করে-না (শুধু-ইভেন্ট) — ফিল্ড-গার্ড-অ্যাসার্টে আগে **স্পষ্ট-focus()** তারপর activeElement-অপরিবর্তিত-অ্যাসার্ট; পূর্ব-পদক্ষেপের-ফোকাস-উত্তরাধিকার (E7→E8) মিথ্যা-ফেল-ধরায়।
- **broadcast-সিড-নিষেধ-পুনঃপ্রমাণ:** POST /admin/daily (published=1) সব-ইউজারে-নোটিফিকেশন (routes.js dailyTypeMeta-স্ট্রিপ) — s274/s277-চুক্তির-প্রয়োগ → মার্কার-সিড **DB-সরাসরি** (s293-seeddaily; published=০/১-দুই-শাখাই-নীরব); নতুন-তালিকা-সারফেস-সুইটে রাউট-স্তরে-বিজ্ঞপ্তি-আছে-কিনা আগে-যাচাই।
- **পরের-এজেন্ট: session294 থেকে (worklog Task ID 134)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session293 + session292 + session291 + session290 পড়ুন; বাকি-প্রস্তাব: **content.ejs/home-leadership.ejs/sections.ejs-ফিল্টার-প্রার্থী** (আসল-শূন্য — স্ক্যান-প্রমাণিত), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), LOWMEM-ক্যাপ-মান-টিউনিং (রেল-স্ক্রল-টেলিমেট্রি), ফিল্মস্ট্রিপ-হরাইজন্টাল-স্ন্যাপ-পলিশ, daily-তালিকার স্ট্যাটিক-ধরন-চিপকে ক্লিকেবল-ফ্যাসেটে-রূপান্তর (dcf293-সম্প্রসারণ), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session293-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-133 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 133 (session293' in wl:
    print('skip-③: repo-worklog Task-133 ইতোমধ্যে')
else:
    ENTRY = '''
---
Task ID: 133 (session293 — cron 403679; ডেইলি কনটেন্ট তাৎক্ষণিক-ফিল্টার dcf293) — push `9af3898..HEAD` (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9-2ac03411, trace 202609240449)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`9af3898` (session292-ep292), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + ep292-লাইভ (H0T5) + ফিল্ম-বাটন ৬/থাম্ব ৫ + ep291-হুক + console-শূন্য + 390px-NOHS) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড
- **প্রস্তাব-পুনঃস্কোপিং:** পূর্ব-প্রস্তাব-প্রার্থীদের কভারেজ-স্ক্যানে trash/content-history/users/support-center ইতোমধ্যে-ফিল্টার্ড, security.ejs তালিকা-সারফেস-নয় → **আসল-শূন্য /admin/daily তালিকা** (৪৩-সারি, স্ট্যাটিক-চিপ-মাত্র) — পরিবারের ২২তম-সারফেস

## এ-রাউন্ডে সম্পন্ন (session293)
- **[Mandatory-ফিচার] dcf293:** /admin/daily **তাৎক্ষণিক-ফিল্টার** — কীওয়ার্ড + **ধরন-সিলেক্ট (DAILY_TYPES-ড্রিভেন)** + **স্ট্যাটাস-সিলেক্ট** (দ্বৈত-ফ্যাসেট AND) + clear + কাউন্ট-চিপ (বাংলা-সংখ্যা) + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape; সারি-বৈশিষ্ট্য-চতুষ্টয় (data-dcf-row/data-kw-১৪০-ক্যাপ/data-dcf-type/data-dcf-pub); **__dcf293QA হুক ×৪** (সারফেস-শূন্যে-ও-সংজ্ঞায়িত); no-regression ×৬-স্ট্রিং-অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** inline-স্টাইল-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — **amber-পরিবার** (sun-থিম) + color-mix-ফোকাস-রিং + kbd-পিল + **[hidden]-গার্ড বাইট-সঠিক** + reduced-motion + 640px-সংকোচন
- **টেস্ট:** নতুন tests/s293-dcfilter-suite.sh **৫৪/৫৪ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২৬ + স্টাইল ×৮ + SSR ×৯ — **DB-সিড ×৩ (broadcast-নিষেধ: POST-পথ-বর্জন)** + প্রত্যাশা-রেন্ডার্ড-HTML-থেকে; E2E ×১৪ — বুট-হুক T=C=৪৩ + কীওয়ার্ড→৩ + ধরন→১১ + **AND→০+শূন্য-অবস্থা** + স্ট্যাটাস→১ + Escape + 'f'-ফোকাস + **ফিল্ড-গার্ড** + ফ্রেশ-লোড + 390px + স্ক্রিনশট ×২) + সিড-নেট-শূন্য (deleted=৩) + **পূর্ণ-রিগ্রেশন s260-s293 (৩৫-সুইট সব-গ্রিন — s293-regression.sh; চাঙ্ক ১২+১২+১১)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)
- **গোটচা ×৪ (PLANS session293):** ① **eval-টপ-লেভেল-return=SyntaxError** — ফাংশন-বাইরে-return খালি-ফেরত; সর্বদা IIFE ② **HTML-grep-সিলেক্টর-লিটারাল-ওভারকাউন্ট** — CSS/JS-লিটারালও গোনা (৪৫=৪৩+২) → সারি-ইউনিক-যুগল-প্যাটার্ন ③ **dispatch-ফোকাস-মিথ্যা-ধারণা** — dispatch ফোকাস-স্থানান্তর-নয় → আগে-স্পষ্ট-focus() ④ **broadcast-সিড-নিষেধ** — published=1-POST সব-ইউজারে-বিজ্ঞপ্তি → DB-সরাসরি-সিড
- **পাইপলাইন:** প্যাচ scripts/s293-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, dcf-নেমস্পেস-FATAL-গার্ড, পোস্ট-অ্যাসার্ট+[hidden]-বাইট+হেক্স-শূন্য+no-reg) + সিড-হেল্পার s293-seeddaily.js + feature-commit (git commit -F-পথ) + ডক ×৩ (s293-docs.py idempotent) + docs-commit + PNG-চার্ন-রিভার্ট + secret-scan-ক্লিন + fetch + **push** → Vercel READY → প্রোড-স্পট + লগইন-প্রোড-যাচাই (__dcf293QA-লাইভ) + স্ক্রিনশট download/s293-prod-dcf.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session294 লেবেল (worklog Task ID 134)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + **দীর্ঘ-রান চাঙ্কে-ই** + কমিট-মেসেজ -F-পথ + **eval-এ IIFE-র‍্যাপ**; PLANS session293 + session292 + session291 + session290 পড়ুন
- বাকি-প্রস্তাব: content.ejs/home-leadership.ejs/sections.ejs-ফিল্টার-প্রার্থী (আসল-শূন্য — স্ক্যান-প্রমাণিত), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), LOWMEM-ক্যাপ-টিউনিং, ফিল্মস্ট্রিপ-স্ন্যাপ-পলিশ, daily-স্ট্যাটিক-চিপ→ক্লিকেবল-ফ্যাসেট (dcf293-সম্প্রসারণ), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)'''
    wl = wl.rstrip() + '\n' + ENTRY + '\n'
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-133 সংযোজিত')

print('DOCS-OK')
