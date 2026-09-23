#!/usr/bin/env python3
# s292-docs.py — session292 ডক-আপডেট (PROJECT §২৯২ + PLANS session292-নোট + repo worklog Task-132)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৯২ (§২৯১-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৯২ (session292' in pj:
    print('skip-①: PROJECT §২৯২ ইতোমধ্যে')
else:
    ANCHOR = '## §২৯১ (session291'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৯২ (session292 — cron 403679: ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ ep292 — SSR-শর্তসাপেক্ষ-থাম্ব-স্প্যান + capture-ফেজ-error-ফলব্যাক) — s292 ৪৬/৪৬ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`b784f2a` (session291-ep291, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + epk291-wired + ফিল্ম-বাটন ৬ + অটো-স্লাইড (idx-অগ্রগতি) + console-ত্রুটি-শূন্য + 390px-hScroll-শূন্য; front-img-ফলব্যাক-সাময়িক-অবস্থা = নথিভুক্ত-চুক্তি) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন:** PLANS session291-শীর্ষ-প্রস্তাব "কিয়স্কে প্রতি-পেপার page-count-ব্যাজ" **শর্তসাপেক্ষ** (epaper_files.page_count থাকলে) — স্কিমা-যাচাইয়ে **কলাম-অনুপস্থিত** (epaper_files: id/scheduled_date/paper_name/file_url/drive_file_id/drive_thumb_id/source/published/created_at) → প্রস্তাব-বাদ; **পরবর্তী-প্রস্তাব গৃহীত: ফিল্মস্ট্রিপে মিনি-থাম্ব-প্রিভিউ** (epaperThumbByName291-সোর্স-পুনঃব্যবহার — নতুন-ডেটা-স্তর-শূন্য)।

**[Mandatory-ফিচার] ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ (ep292):** epk291-ফিল্ম-বাটনে নাম-মিলে-আসা থাম্বের ক্ষুদ্র-প্রিভিউ — **SSR-শর্তসাপেক্ষ-স্প্যান** (`<% if (p.thumb) { %>` — no-JS-এও সঠিক; মিল-নেই-পত্রিকায় স্প্যান-ই-নেই — টেক্সট-অনলি-পূর্বাবস্থা); **capture-ফেজ-error-লিসনার** film-কনটেইনারে (error non-bubbling → পূর্বপুরুষে-capture; লোড-ব্যর্থতায় থাম্ব-স্প্যান hidden — টেক্সট-অনলি-ফলব্যাক, ভাঙা-ছবি-কখনো-নয় — epk291-নীতি-উত্তরাধিকার); **__epk292QA হুক ×৩** (total/hidden/imgs); aria-hidden-থাম্ব (নাম-টেক্সট-ই-SR-যথেষ্ট); img-এ id-শূন্য (audit:views duplicate-id-নিরাপদ); **epk291-বডি-অস্পৃশ্য-রীতি** (applyPaper/startTimer/hover-পজ/ফ্রন্ট-ফলব্যাক-অপরিবর্তিত — থাম্ব-স্প্যান+লিসনার+হুক র‍্যাপার-স্তরে)।

**[Mandatory-স্টাইল]:** style.css **ep292-ব্লক হেক্স-শূন্য টোকেন-শুধু** — .epk291-film-thumb (৩০×৪০px + var(--lf-ui-border)-বর্ডার + var(--radius-sm)-রেডিয়াস + var(--lf-amber-soft)-পটভূমি + মৃদু-শ্যাডো) + থাম্ব-img object-fit-cover + **নির্বাচিত-অ্যাকসেন্ট-বর্ডার** (.epk291-film-btn[aria-selected="true"] .epk291-film-thumb → var(--epkAcc291)-বর্ডার — প্রতি-পত্রিকা-অ্যাকসেন্ট-প্যালেটের-সাথে-সিঙ্ক) + gap-৩px-ওভাররাইড + 480px-মোবাইল-সংকোচন (২৬×৩৪px) + reduced-motion-transition-শূন্য; ep291-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s292-filmthumb-suite.sh **৪৬/৪৬ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×১৯: মার্কআপ/লিসনার/হুক/ডক + epk291-অক্ষুণ্ণ ×৪ + ep292-CSS হেক্স-শূন্য-ব্লক-যাচাই ×৬; SSR ×৯: **মার্কার-সিড-দ্বৈত-সারি** (s292-seedhome — 'প্রথম আলো' মিল→থাম্ব + 's292-অমিল-পত্রিকা' অমিল→টেক্সট-শাখা) + **JSON-প্রত্যাশা-গণনা** (রেন্ডার্ড-HTML papers-JSON থেকে মোট/থাম্ব-যুক্ত — অন্য-সারি-উপস্থিতিতেও নির্ধারক) + SSR-স্প্যান==প্রত্যাশা + বাটন==মোট; E2E ×১২: বুট-হুক (hidden=০ total=WITH) + সব-img naturalWidth>০ + **error-dispatch→fallback** (synthetic Event('error') → capture-লিসনার → hidden=১ + স্প্যান-বৈশিষ্ট্য-প্রমাণ) + ফ্রেশ-লোড-পুনঃপ্রতিষ্ঠা (stale-পেজ-গোটচা) + **ক্লিক-সিঙ্ক same-eval sync-read** (aria-selected + ফ্রন্ট-নাম + CTA — অটো-স্লাইডার-রেস-গোটচা-প্রয়োগ) + aria-live-জীবিত + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) + **সিড-হেল্পার scripts/s292-seedhome.js (নেট-শূন্য — কিল→সিড→বুট→ক্লিন ক্রম)** + **পূর্ণ-রিগ্রেশন s260-s292 (৩৪-সুইট সব-গ্রিন — রানার scripts/s292-regression.sh; চাঙ্ক ১২+১১+১১ — CHUNK_FROM/CHUNK_TO)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)-গ্রিন; প্যাচ: scripts/s292-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, পোস্ট-অ্যাসার্ট + epk291-বডি-অক্ষুণ্ণ + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×২ (PLANS session292):** ① **bash-ভেরিয়েবল-নাম-সীমা** — `set -u`-তে `"OK$WITHof$WITH"`-এ bash দীর্ঘতম-ASCII-নাম `WITHof` ধরে → unbound-variable-ক্র্যাশ; অক্ষর-সন্নিহিত-ভেরিয়েবলে **সর্বদা `${WITH}`-ব্রেস** (বাংলা-অক্ষর-সন্নিহিত `$PAPERSন`-ও খালি-প্রসারিত — শব্দাংশ-বিকৃতি) ② **page_count-প্রস্তাব-শর্ত-যাচাই** — প্রস্তাবের "থাকলে"-শর্ত আগে-স্কিমা-যাচাই বাধ্যতমূলক (কলাম-অনুপস্থিতে বিকল্প-প্রস্তাবে-স্থানান্তর — স্কিমা-অনুমান-করলে অলীক-কলাম-নির্ভর-ফিচার-হতো)।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৯২ সন্নিবেশিত')

# ── ② PLANS.md session292-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session292-নোট' in pl:
    print('skip-②: PLANS session292-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session291-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session292-নোট (cron 403679 — ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ ep292)
- **প্রস্তাব-শর্ত-যাচাই-প্রথা (নতুন):** পূর্ব-সেশন-প্রস্তাবে **শর্তসাপেক্ষ-শব্দ** ("থাকলে") থাকলে কোড-লেখার-আগেই স্কিমা/ডেটা-যাচাই বাধ্যতমূলক — ep292-রাউন্ডে page_count-প্রস্তাব স্কিমা-যাচাইয়ে বাতিল (কলাম-নেই) → তালিকার-পরবর্তী-প্রস্তাবে স্থানান্তর; ভবিষ্যতে শর্ত-ব্যর্থ হলে **কেন-বাতিল** PLANS-এ লিখে-রাখুন (পুনঃ-প্রস্তাব-পুনরাবৃত্তি-প্রতিরোধ)।
- **bash-ভেরিয়েবল-নাম-সীমা (সুইট-শ্রেণি-গোটচা):** `set -u`-স্ক্রিপ্টে `"$A$Bof$A"`-রকম যুগলে bash **দীর্ঘতম-বৈধ-ASCII-নাম** পার্স করে (`WITHof` — unbound-variable-ক্র্যাশ; বাংলা-অক্ষর-সন্নিহিতে খালি-প্রসারণ) → অক্ষর-সন্নিহিত-ভেরিয়েবলে **সর্বদা `${VAR}`-ব্রেস-রীতি** — ভবিষ্যৎ-সব-সুইটে-প্রযোজ্য।
- **ep292-থাম্ব-চুক্তি:** ফিল্ম-থাম্ব = **SSR-শর্তসাপেক্ষ-স্প্যান** (p.thumb-শূন্যে স্প্যান-ই-রেন্ডার-হয়-না — mockcols-স্টাইল-CSS-ফলব্যাক-নয়, মার্কআপ-অনুপস্থিতি); error-ফলব্যাক = **capture-ফেজ-লিসনার** film-কনটেইনারে (error non-bubbling; synthetic dispatchEvent তবু পূর্বপুরুষ-capture-ট্রিগার করে — সুইটে সরাসরি-প্রমাণযোগ্য); aria-hidden (নাম-ই-SR); img-id-শূন্য (duplicate-id-নিরাপদ); epk291-বডি-অস্পৃশ্য (applyPaper-অপরিবর্তিত — র‍্যাপার-স্তর-রীতি-সাফল্য)।
- **s292-seedhome-দ্বৈত-সারি-চুক্তি:** হোম-কিয়স্ক-সুইটে মিল+অমিল **দুই-শাখা-একসাথে-সিড** ('প্রথম আলো' → থাম্ব; 's292-অমিল-পত্রিকা' → টেক্সট-ফলব্যাক); প্রত্যাশা-গণনা **রেন্ডার্ড-HTML papers-JSON থেকে** (DB-অন্য-সারি-উপস্থিতিতেও নির্ধারক — grep-স্থির-সংখ্যা-নয়); ক্লিন-যাচাই deleted=২-অ্যাসার্ট।
- **পরের-এজেন্ট: session293 থেকে (worklog Task ID 133)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু; -C "$ROOT"-থেকে); PLANS session292 + session291 + session290 + session289 পড়ুন; বাকি-প্রস্তাব: **page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে page_count-কলাম-যোগ-হলে)**, multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল (ep282)-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, LOWMEM-ক্যাপ-মান-টিউনিং (রেল-স্ক্রল-টেলিমেট্রি), ফিল্মস্ট্রিপ-হরাইজন্টাল-স্ক্রল-স্ন্যাপ-পলিশ, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session292-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-132 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 132 (session292' in wl:
    print('skip-③: repo-worklog Task-132 ইতোমধ্যে')
else:
    ENTRY = '''
---
Task ID: 132 (session292 — cron 403679; ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ ep292) — push `b784f2a..HEAD` (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9-2ac03411, trace 202609240419)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`b784f2a` (session291-ep291), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-ক্যানারি সবুজ (home/health ২০০ + epk291-wired + ফিল্ম-বাটন ৬ + অটো-স্লাইড-অগ্রগতি + console-শূন্য + 390px-hScroll-শূন্য) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড; **page_count-প্রস্তাব স্কিমা-যাচাইয়ে বাতিল (কলাম-অনুপস্থিত) → ফিল্মস্ট্রিপ-মিনি-থাম্ব গৃহীত**
- স্টেল-সামারি-খণ্ডন: সেশন-সামারি Task43-'commit-হয়নি'-device-flow-যুগ দেখায় — ACTIVE-LOCK + রিপো-HEAD-প্রমাণে অগ্রাহ্য

## এ-রাউন্ডে সম্পন্ন (session292)
- **[Mandatory-ফিচার] ep292:** ফিল্মস্ট্রিপ বাটনে **নাম-মিলে-থাম্ব-মিনি-প্রিভিউ** — SSR-শর্তসাপেক্ষ-স্প্যান (`if (p.thumb)` — no-JS-সঠিক; অমিলে স্প্যান-ই-নেই) + **capture-ফেজ-error-লিসনার** (film-কনটেইনারে; লোড-ব্যর্থতায় স্প্যান hidden — টেক্সট-অনলি-ফলব্যাক, ভাঙা-ছবি-কখনো-নয়) + **__epk292QA হুক ×৩** (total/hidden/imgs); aria-hidden + img-id-শূন্য; epk291-বডি-অস্পৃশ্য
- **[Mandatory-স্টাইল]:** ep292-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — থাম্ব ৩০×৪০ (টোকেন-বর্ডার/রেডিয়াস/পটভূমি) + object-fit-cover + **নির্বাচিত-অ্যাকসেন্ট-বর্ডার** (--epkAcc291) + 480px-সংকোচন ২৬×৩৪ + reduced-motion-অক্ষুণ্ণ
- **টেস্ট:** নতুন tests/s292-filmthumb-suite.sh **৪৬/৪৬ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×১৯ + epk291-অক্ষুণ্ণ ×৪ + CSS-ব্লক ×৬; SSR ×৯ — s292-seedhome দ্বৈত-সারি মিল+অমিল + JSON-প্রত্যাশা-গণনা; E2E ×১২ — বুট-হুক + img-লোড + error-dispatch→hidden + ফ্রেশ-লোড + ক্লিক-সিঙ্ক same-eval + live + 390px + স্ক্রিনশট ×২) + সিড নেট-শূন্য (deleted=২) + **পূর্ণ-রিগ্রেশন s260-s292 (৩৪-সুইট সব-গ্রিন — s292-regression.sh; চাঙ্ক ১২+১১+১১)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)
- **গোটচা ×২ (PLANS session292):** ① **bash-ভেরিয়েবল-নাম-সীমা** — `$WITHof$WITH`-এ `WITHof`-unbound-ক্র্যাশ (set -u) → অক্ষর-সন্নিহিতে `${VAR}`-ব্রেস-রীতি (বাংলা-সন্নিহিত `$PAPERSন`-খালি-প্রসারণ-ও) ② **প্রস্তাব-শর্ত-যাচাই** — "থাকলে"-শর্ত আগে-স্কিমা-যাচাই; ব্যর্থে কারণসহ PLANS-এ লিপিবদ্ধ
- **পাইপলাইন:** প্যাচ scripts/s292-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, পোস্ট-অ্যাসার্ট+epk291-অক্ষুণ্ণ+হেক্স-শূন্য) + সিড-হেল্পার scripts/s292-seedhome.js + feature-commit (git commit -F-পথ) + ডক ×৩ (s292-docs.py idempotent) + docs-commit + PNG-চার্ন-রিভার্ট + secret-scan-ক্লিন + fetch + **push** → Vercel READY → প্রোড-স্পট + **ep292-লাইভ-যাচাই (__epk292QA হুক + থাম্ব-স্প্যান)** + স্ক্রিনশট download/s292-prod-filmthumb.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session293 লেবেল (worklog Task ID 133)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + **দীর্ঘ-রান চাঙ্কে-ই** + কমিট-মেসেজ -F-পথ + **অক্ষর-সন্নিহিত-ভেরিয়েবলে ${}-ব্রেস**; PLANS session292 + session291 + session290 + session289 পড়ুন
- বাকি-প্রস্তাব: page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল (ep282)-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, LOWMEM-ক্যাপ-মান-টিউনিং, ফিল্মস্ট্রিপ-স্ন্যাপ-পলিশ, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
'''
    wl = wl.rstrip() + '\n' + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-132 সংযোজিত')

print('DOCS-OK')
