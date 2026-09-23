#!/usr/bin/env python3
# s283-docs.py — session283 ডক-আপডেট (PROJECT §২৮৩ + PLANS session283-নোট + repo worklog Task-123)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮৩ (§২৮২-এর-আগে সন্নিবেশ — নতুন-প্রথম-চুক্তি) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮৩ (session283' in pj:
    print('skip-①: PROJECT §২৮৩ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮২ (session282'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮৩ (session283 — cron 403679: ক্যালেন্ডারে মাস-তালিকা-শর্টকাট ep283 — ইন-কার্ড ডিসক্লোজার + এক-ক্লিক-জাম্প) — s283 ৪৯/৪৯ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`4912094` (session282-ep282, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০ — সমান্তরাল-রাউন্ড-শূন্য); রাউন্ড-শুরু QA: প্রোড-স্পট (home/health/epaper-200) + স্থানীয় s282 ক্যানারি — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session282-শীর্ষ-প্রস্তাব গ্রহণ: **ক্যালেন্ডারে মাস-তালিকা-শর্টকাট**)।

**[Mandatory-ফিচার] মাস-তালিকা-শর্টকাট (ep283):** মাস-লেবেল (`.ep-cal-month`) span→**button**-রূপান্তর (aria-haspopup + aria-expanded) — ক্লিকে **ইন-কার্ড ডিসক্লোজার-প্যানেল** (`ep-cal-mpanel` — ep-grid-ভেতরে, z-index/ওভারফ্লো-ঝুঁকি-শূন্য, মোবাইল-নিরাপদ): **বছর-স্টেপার** (‹২০২৬› — ep-cal-btn-পুনঃব্যবহার) + **১২-মাস-গ্রিড** (৪-কলাম; `byDate`-উদ্ভূত avail-ম্যাপ — তথ্য-আছে-মাসে `.has`-ডট, শূন্য-মাস `disabled`, বর্তমান-মাস `.is-cur`-ফিল); **মাস-ক্লিকে এক-ক্লিক-জাম্প** = সেই-মাসের প্রথম-সংরক্ষিত-দিনে `calJump` (দূর-মাসে prev/next-পুনরাবৃত্তি-শূন্য; প্যানেল-আপনি-বন্ধ); **Escape/বাইরে-ক্লিকে-বন্ধ** (ep-cal280-contains-গার্ড); পুনঃ-খোলায় বছর calY-সিঙ্ক-রিসেট; calJump/calRender/ক্যালেন্ডার-বুট-চুক্তি অক্ষুণ্ণ (ওভারলে-স্তর); aria-পূর্ণ (listbox/option/aria-selected); **__ep283QA হুক ×৭** (isOpen/year/has/jumped/open/close/render)।

**[Mandatory-স্টাইল]:** epaper.css ep283-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — মাস-বাটন-রিসেট (border/background-শূন্য + হোভার-টিন্ট + focus-ring + is-open-অবস্থা), প্যানেল dashed-বিভাজক + entrance-অ্যানিমেশন `ep-cal-m-in`, স্টেপার-সারি + বছর-লেবেল (brand + min-width), মাস-কোষ (has-ডট ::after + is-cur-ফিল + disabled-ম্লান + focus-visible-ring) + reduced-motion-গার্ড; ep280/281/282-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s283-calmonth-suite.sh **৪৯/৪৯ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২১ + রেন্ডার্ড ×৩ + E2E ×১৯: প্যানেল-খোলা-সম্পূর্ণ-অবস্থা (isOpen+hidden+aria) + বছর-লেবেল-বুট-সিঙ্ক + ১২-গ্রিড + has/disabled-গণনা-সামঞ্জস্য + is-cur ×১ + স্টেপার −১/+২ + পুনঃ-খোলায়-calY-রিসেট + **এক-ক্লিক-জাম্প (jumped==elDateInput.value + is-sel-দিন + প্যানেল-বন্ধ)** + Escape-aria-ফেরত + বাইরে-ক্লিকে-বন্ধ + cursor:pointer + প্যানেল-খোলা-স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + মার্কার-সিড/ক্লিন নেট-শূন্য (s281-হেল্পার; PRE=০→FINAL=০) + পূর্ণ-রিগ্রেশন s260-s282 (২৪-সুইট) + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন; প্যাচ: scripts/s283-patch.py (idempotent ×২, ×৪-এডিট, প্রি/পোস্ট-অ্যাসার্ট ×৩৩-টোকেন)।

**গোটচা ×২ (PLANS session283):** ① **hasPayload-শর্তসাপেক্ষ-রেন্ডার** — epaper.ejs `<% if (hasPayload) %>` পুরো ep-grid-রিডার-ব্লক মোড়ানো: **PRE=০-তে curl-রেন্ডারে ep-grid/ep-cal280/ep-ctlbar মার্কআপ সম্পূর্ণ-অনুপস্থিত** (শুধু JS + dir-ভিউ) → curl-মার্কআপ-অ্যাসার্ট অবশ্যই payload-অবস্থায় (সিড-পরে) — s283-ধাপ-২.৭-চুক্তি; s280-s282-সুইটগুলোর মার্কআপ-অ্যাসার্ট আসলে payload-অবস্থাতেই চলত (প্রমাণিত-সুইট-ক্রম) ② **প্রক্সি-HTML-ক্যাশ** — cache-buster-শূন্য curl fresh-reboot-পরেও পুরাতন-পাতা সার্ভ করে (প্রতিবাদ-প্রমাণ: buster-যুক্ত curl-এই নতুন-মার্কআপ) → **সব-স্যুট-curl-এ `?nc=$RANDOM`-বাধ্যতমূলক** (CSS-nocache-relink-ছাড়া-HTML-ও)।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮৩ সন্নিবেশিত')

# ── ② PLANS.md session283-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session283-নোট' in pl:
    print('skip-②: PLANS session283-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session282-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session283-নোট (cron 403679 — ক্যালেন্ডারে মাস-তালিকা-শর্টকাট ep283)
- **hasPayload-শর্তসাপেক্ষ-রেন্ডার-গোটচা (নতুন — সবচেয়ে-গুরুত্বপূর্ণ):** epaper.ejs-এ `<% if (hasPayload) %>` **পুরো ৩-প্যানেল-রিডার-ব্লক মোড়ানো** (ep-grid + ep-ctlbar + রেল + ভিউয়ার + ক্যালেন্ডার-কার্ড) — **epaper_files-শূন্য (PRE=০) অবস্থায় curl-রেন্ডারে এ-মার্কআপ সম্পূর্ণ-অনুপস্থিত** (শুধু JS-মডিউল + dir-ভিউ) — মার্কআপ-অ্যাসার্ট মিথ্যা-ব্যর্থ করে (এ-রাউন্ডে ×২-মিথ্যা-ফেল); **সুইট-চুক্তি: রিডার-মার্কআপ-অ্যাসার্ট অবশ্যই payload-অবস্থায় (মার্কার-সিড-পরে) চালান** (s283-ধাপ-২.৭); ব্রাউজার-E2E কিন্তু সিড-পরের-পাতায় চলে-বলে সবসময়-সবুজ — curl-অ্যাসার্টেই-ফাঁকি।
- **প্রক্সি-HTML-ক্যাশ-গোটচা (নতুন):** cache-buster-শূন্য curl **fresh-reboot-পরেও** পুরাতন-কম্পাইল-পাতা সার্ভ করে (stale-view-cache-এর-প্রক্সি-স্তর-সমতুল্য; প্রতিবাদ-প্রমাণ: `?nc=$RANDOM`-যুক্ত curl-এই নতুন-মার্কআপ দেখায়) → **স্যুটের সব-HTML-curl-এ বাস্টার-বাধ্যতমূলক** (CSS-nocache-relink-প্রথার HTML-সমতুল্য); s282-প্রথার fresh-reboot অক্ষুণ্ণ-কিন্তু-অপর্যাপ্ত।
- **অ্যাসার্ট-লজিক-গোটচা (পুনঃস্মরণ):** সেট-সাম্য-অ্যাসার্ট **গণনা-ভিত্তিক** হোক (`querySelectorAll(...).length===hook()`), null-ভিত্তিক নয় (`querySelector(...)===null` শুধু has=০-দৃশ্যে-সত্য — has≥১-এ মিথ্যা-ফেল); s283-প্রথম-রানে ×১-মিথ্যা-ফেল-সংশোধিত।
- **ep283-স্থাপত্য-চুক্তি:** ক্যালেন্ডার-কার্ডের-ভেতরে ডিসক্লোজার-প্যানেল (ভাসমান-প্যানেল-নয় — z-index/ওভারফ্লো/মোবাইল-ঝুঁকি-শূন্য); জাম্প = মাসের-প্রথম-সংরক্ষিত-দিনে calJump (ক্যালেন্ডার-বুট/ renderList-চুক্তি-পুনঃব্যবহার — ডুপ্লিকেট-জাম্প-লজিক-নিষিদ্ধ); ep282-কম্বো + ep281-ক্যাশ + ep280-৩-প্যানেল অক্ষুণ্ণ; __ep283QA ×৭।
- **পরের-এজেন্ট: session284 থেকে (worklog Task ID 124)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; বাকি-প্রস্তাব: LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, ep283-প্যানেলে বছর-তালিকা-শর্টকাট (বহু-বছর-জাম্প), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session283-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-123 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 123 (session283' in wl:
    print('skip-③: repo-worklog Task-123 ইতোমধ্যে')
else:
    ENTRY3 = '''
---
Task ID: 123 (session283 — cron 403679; ক্যালেন্ডারে মাস-তালিকা-শর্টকাট ep283) — push (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609232227)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

Work Log:
- রাউন্ড-শুরু-যাচাই: HEAD=origin=`4912094` (session282-ep282), working-tree ক্লিন; ফিচার-কোড-লেখার-আগেই fetch (BEHIND=০); PLANS session282+session281+উভয়-session280-নোট পঠিত
- রাউন্ড-শুরু QA: প্রোড-স্পট 200-ত্রয় + s282 ক্যানারি — বাগ-শূন্য → ফিচার-রাউন্ড (session282-শীর্ষ-প্রস্তাব গ্রহণ)
- **[Mandatory-ফিচার]** ep283 মাস-তালিকা-শর্টকাট (ইন-কার্ড ডিসক্লোজার: বছর-স্টেপার + ১২-মাস-গ্রিড + has-ডট + এক-ক্লিক-জাম্প + Escape/বাইরে-ক্লিক + aria + __ep283QA ×৭) + **[Mandatory-স্টাইল]** ep283-ব্লক হেক্স-শূন্য (বিস্তারিত PROJECT §২৮৩)
- **টেস্ট:** নতুন tests/s283-calmonth-suite.sh **৪৯/৪৯ ×২-ধারাবাহিক (SKIP=০)** + মার্কার-সিড/ক্লিন নেট-শূন্য + পূর্ণ-রিগ্রেশন s260-s282 (২৪-সুইট) + role-policy ২৬০/২৬০ + guard/audit-গ্রিন
- **গোটচা ×২:** hasPayload-শর্তসাপেক্ষ-রেন্ডার (PRE=০-এ রিডার-মার্কআপ-সম্পূর্ণ-অনুপস্থিত — অ্যাসার্ট payload-অবস্থায়) + প্রক্সি-HTML-ক্যাশ (curl-এ ?nc=$RANDOM-বাধ্যতমূলক)
- প্যাচ: scripts/s283-patch.py (idempotent ×২) + ডক ×৩ (PROJECT §২৮৩ + PLANS session283 + repo-worklog Task-123; s283-docs.py)
- PNG-চার্ন-রিভার্ট (১৭-ফাইল — রিগ্রেশন-পুনঃরান-জাত; s283-PNG ×২ ইনটেনশনাল) + secret-scan-ক্লিন + push-পূর্ব পুনঃ-fetch

Stage Summary:
- **[Mandatory-ফিচার]** ep283 মাস-তালিকা-শর্টকাট — দূর-মাসে এক-ক্লিক-জাম্প (prev/next-পুনরাবৃত্তি-শূন্য); ক্যালেন্ডার-চুক্তি অক্ষুণ্ণ
- **[Mandatory-স্টাইল]** ep283-ব্লক হেক্স-শূন্য (ডিসক্লোজার + ডট + is-cur-ফিল + অ্যানিমেশন + reduced-motion)
- পরের-এজেন্ট: **session284 লেবেল (worklog Task ID 124)**; PLANS session283-নোট অবশ্যই-পড়ুন (hasPayload-চুক্তি + প্রক্সি-ক্যাশ-বাস্টার + গণনা-ভিত্তিক-অ্যাসার্ট); **ফিচার-কোড-লেখার-আগেই fetch**; push-আগে পুনঃ-fetch+rebase-বাধ্যতমূলক
- রিমোট main = push-পরবর্তী HEAD (session283-ep283); working-tree ক্লিন
'''
    if not wl.endswith('\n'):
        wl += '\n'
    wl += ENTRY3
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-123 সংযোজিত')

print('DOCS-DONE')
