#!/usr/bin/env python3
# s303-docs.py — session303 ডকুমেন্টেশন (PROJECT.md §৩০৩ + PLANS session303-নোট + worklog Task-143)
# চুক্তি: মার্কার-গার্ড-প্রথম (idempotent ×N) + অ্যাঙ্কর-এককতা-FATAL
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJ = APP + '/PROJECT.md'
PLANS = APP + '/PLANS.md'
WLOG = APP + '/worklog.md'

def die(m):
    print('DOCS-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

SEC303 = '''## §৩০৩ (session303 — cron 403679: pr303 press checked-pinned চুক্তি-পোর্ট + ep303 বছর-তালিকা-প্রিফেচ) — s303 ৭৫/৭৫ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`394a439` (session302-pinnedfilter, clean-tree, BEHIND=০); QA-বেসলাইন: home/epaper-200 ×৩-লোড-এরর-শূন্য + ep283/ep284/epk300-হুক-জীবিত + মাস-প্যানেল-কার্যক্ষম (১২-কোষ) — স্থিতিশীল → ফিচার-রাউন্ড। **সন্দেহ-তদন্ত (মিথ্যা-অ্যালার্ম-শিক্ষা):** টার্মিনাল-ডিসপ্লেতে epaper.ejs-এ `m[y]o]`-জাতীয় ব্র্যাকেট-ক্ষয়-সদৃশ প্রদর্শিত → কোডপয়েন্ট-স্তরে যাচাই (`0x5b 0x6d 0x6f 0x5d` = `[mo]` অক্ষত) + node --check + লাইভ-ফাংশনাল-প্রোব → **ফাইল-অক্ষত; ক্ষয় = ডিসপ্লে-পাইপলাইন-আর্টিফ্যাক্ট** (session298-গোটচার পুনঃ-প্রমাণ — সিদ্ধান্তের-আগে python-বাইট-যাচাই-বাধ্যতমূলক)। **প্রস্তাব-নির্বাচন:** PLANS session302-প্রস্তাবের প্রথম-দুই-প্রার্থী — ① moderator-press checked-pinned-পুনঃ-যাচাই → যাচাইয়ে **প্রকৃত-গ্যাপ-আবিষ্কৃত**: pr258-ইঞ্জিন pre-contract-প্রজন্ম (`hit = !q || kw-match` — pinned-শাখা-নেই) কিন্তু সারফেসে bulk_ids+bulk-all+bulk-delete/publish/hide বিদ্যমান → **চেক-করা-সারি ফিল্টারে-লুকিয়ে bulk-delete-এ-নীরব-মুছে-ফেলার বাস্তব-ঝুঁকি** (dqf302-যুগে-সংজ্ঞায়িত-ঝুঁকির ঠিক-সেই-রূপ) → যাচাই-প্রস্তাব বাগ-ফিক্স+চুক্তি-পোর্টে রূপান্তর ② epCalYList-বছর-কোষ-প্রিফেচ।

**[Mandatory-ফিচার] ① pr303 — pr258-ইঞ্জিনে checked-pinned চুক্তি-পোর্ট (dqf302-মিরর):** `hit = pinned || !q || kw-match` + `prPinned258()` গণক + document-level change-ডেলিগেশন (`input[name="bulk_ids"],[data-bulk-all]`) → admin-sidebar initBulkBar-এর target-level sync-এর-পরে বাবল-ক্রমে apply (s302-সহাবস্থান-চুক্তি; hidden-ids-সিঙ্ক-সহ) + boot-apply-init + **Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম)** + ফ্ল্যাশ ৯০০ms + `__prQA` হুক ×১০ (surface/rows/matches/total/active/pinned/firstMatch + legacy count/apply/clear — **রো-শূন্যে-ও-সংজ্ঞায়িত** — early-return-হুক-পরে-সরিয়ে) + কাউন্ট-চিপ ASCII-অঙ্ক (**s258-চুক্তি** — dqf302-র bn-ডিজিট-থেকে ইচ্ছাকৃত-বিচ্যুতি, ডক-কৃত)। **② ep303 — epCalYList বছর-তালিকা-কোষ-ইচ্ছা-প্রিফেচ (PLANS session302-প্রস্তাব):** elCalYList-ডেলিগেশন (mouseover/focusin — ep284Render-পুনঃরেন্ডার-নিরাপদ) + `.ep-cal-y`-গেট (avail-উদ্ভূত — তথ্য-আছে-বছর-ই; disabled-অপ্রাসঙ্গিক) + **recency-first মিরর** (বছর-কোষের সরাসরি-কাগদ-গন্তব্য-নেই — ক্লিক→মাস-গ্রিড; তাই YYYY-প্রিফিক্স-কী **DESC-প্রথম = ঐ-বছরের সর্বশেষ-সংখ্যা** → arr[0] — s300-কনভেনশন; ep302-র ASC-ক্লিক-মিরর-থেকে ডক-কৃত-বিচ্যুতি) + reason 'year'/'year-focus' + উষ্ণ-মিরর warmed-has + `__epk300QA.years`-গেটার + **quiet-window (ep302-ধর্ম-মিরর):** list-open → ep285Arm → স্বয়ংক্রিয় focus() = ইচ্ছা-নয় → ep284OpenList-র **সর্ব-বাইরের-র‍্যাপারে** (ep289-পরবর্তী) sync-quiet-জানালা — arm-ফোকাস-প্রিফেচ-নিষিদ্ধ। **③ sections (lsf298) চুক্তি-যাচাই:** admin/sections.ejs-এ bulk_ids-চেকবক্স **অনুপস্থিত-প্রমাণিত** (markup-প্যাটার্ন `name="bulk_ids" value=` শূন্য — sidebar-script-এর selector-রেফারেন্স false-positive বর্জন) → চুক্তি N/A — গঠনগত-নিরাপত্তা (SSR-অ্যাসার্ট-সহ)।

**[Mandatory-স্টাইল]:** epaper.css **session303-ব্লক** (হেক্স-শূন্য টোকেন-শুধু) — উষ্ণ-বছর-কোষ রিং+টিন্ট (`.ep-cal-y.epk300-warm:not(.is-cur)` — session302-সুপারসেট) + বছর-কোষ-ট্রানজিশন + 640px-সংকোচন + reduced-motion; moderator-press.ejs **session303-ব্লক** — pinned-সারি-অ্যাফোর্ডেন্স (`:has(input[name="bulk_ids"]:checked)` — inset-ব্র্যান্ডগ্রিন-প্রান্ত + টিন্ট; @supports-গেটেড — অসমর্থিত-ব্রাউজারে-নীরব) + Enter-ফ্ল্যাশ-আউটলাইন — পিন-অবস্থা ফিল্টার-চলাকালীন দৃশ্যমান-সংকেত।

**টেস্ট:** নতুন tests/s303-suite.sh **৭৫/৭৫ ×৩-ধারাবাহিক** (কাঠামো ×১৯ + হেক্স-শূন্য ×২-ব্লক + SSR ×৯ — sections-N/A-প্রমাণ-সহ + **E2E-pr303 ×২৪** — প্রোডাকশন-ফ্লো-সিড qa303press (multipart-POST — s258-নীতি) + boot-apply-init + মার্কার-কুয়েরি-১-মিল + ASCII-চিপ + **চেক→pinned=১ + hidden-ids-সিঙ্ক + গার্বেজে-ও-পিনড + পিনড-দৃশ্যমান + pinned-CSS-প্রয়োগ + আনচেক→পিন-মুক্ত + bulk-all→সর্ব-পিন+হিডেন-শূন্য + আন-অল→শূন্য** + Enter-চেকবক্স-ফোকাস+ফ্ল্যাশ-নির্মোচন + hScroll + স্ক্রিনশট ×২ + **E2E-ep303 ×১১** — years-গেটার + বুট-শূন্য + **quiet-window** + hover-reason=year (একক-eval dispatch+read) + ডিডুপ + years-মিরর + পুনঃরেন্ডার-বিলোপ/পুনঃ-প্রতিষ্ঠা + পরিষ্কারক delete→ট্র্যাশ→bulk-purge-নেট-শূন্য ×৩-অ্যাসার্ট + E2E-রিগ্রেশন ×১ — দ্বি-লোড-এরর-শূন্য); রিগ্রেশন: s258 + s283 + s284 + s285 + s298 + s300-multipart + s300-epref + s301 + s302 — **সর্ব-গ্রিন** + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s303-patch.py (idempotent ×N — ৩-ফাইল মার্কার-স্কিপ + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-compile ×২)।

**গোটচা ×৪ (PLANS session303):** ① **Write/Edit-স্তরে IIFE-final-`()`-ক্ষয় (নতুন-ক্ষয়-শ্রেণি)** — সুইটের দীর্ঘ eval-স্নিপেটে `})()` → `})` (আহ্বান-ক্ষয়) → অ-আহূত-ফাংশন-অবজেক্ট → **agent-browser eval ফাংশন-অবজেক্টকে `{}` সিরিয়ালাইজ করে** (ডেমন-ঝাঁকুনি-নয় — নির্ধারক!); নির্ণয়: od -c র-ডাম্প + ফাইল-নিষ্কাশন-বনাম-পুনঃটাইপ-বাইট-diff; প্রতিষেধক: লেখন-পরবর্তে সব-eval-স্নিপেটের `})()`-সমাপ্তি python-অ্যাসার্ট ② **eval-`{}` = অ-আহূত-IIFE/অবজেক্ট-সিরিয়ালাইজেশন** (নতুন-নির্ণয়-চুক্তি) — `{}` দেখলে প্রথমে স্নিপেট-আহ্বান-যাচাই, ডেমন-সন্দেহ-পরে ③ **data-pr-row = সারি-ইনডেক্স নন-আইডি** — kw-তে `#<real-id>` আছে; কুয়েরি-নির্ধারক = মার্কার-সাবস্ট্রিং (qa303press); bulk hidden-ids-সিঙ্ক-অ্যাসার্টে checkbox-এর নিজ-value-র সাথে তুলনা (ইনডেক্স-দিয়ে-নয়) ④ **sections-bulk_ids-grep false-positive** — sidebar.ejs-অন্তর্ভুক্তির script-selector-রেফারেন্স মিলে-যায় → markup-প্রমাণে `name="bulk_ids" value=`-প্যাটার্ন-বাধ্যতমূলক।

'''

v = rd(PROJ)
if '## §৩০৩' in v:
    print('PROJECT.md: §৩০৩-মার্কার-উপস্থিত (skip)')
else:
    A = '## §৩০২ (session302 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC303 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §৩০৩ সন্নিবেশিত')

NOTE303 = '''## session303-নোট (cron 403679 — pr303 press checked-pinned পোর্ট + ep303 বছর-তালিকা-প্রিফেচ)
- **IIFE-আহ্বান-ক্ষয়-গোটচা (নতুন-শ্রেণি — সর্বাধিক-গুরুত্বপূর্ণ):** Write/Edit-স্তরে দীর্ঘ eval-স্নিপেটের `})()` সমাপ্তি `})`-তে ক্ষয় হতে পারে → অ-আহূত-ফাংশন-অবজেক্ট রিটার্ন → **agent-browser eval `{}` প্রিন্ট করে** (নির্ধারক-প্রতি-রানে — ডেমন-ঝাঁকুনি-শ্রেণির **নয়**; পুনঃরানে-সারে-এমন-ধোঁকা নিষিদ্ধ); নির্ণয়-পথ: eval-আউটপুট od -c ডাম্প → ফাইল-থেকে-নিষ্কাশন বনাম হাতে-টাইপ-সংস্করণ বাইট-diff → নিষ্কাশিত-সংস্করণে `()`-অনুপস্থিতি; প্রতিষেধক: সুইট/প্যাচ-লেখন-পরবর্তী python-অ্যাসার্ট — প্রতিটি `(function(){...` স্নিপেটের সমাপ্তি `})()` (brace-matching-স্ক্যান — s303-docs-প্যাটার্ন)।
- **eval-`{}`-নির্ণয়-চুক্তি (পরিবার-নতুন):** agent-browser eval-এর `{}` = ফাংশন-অবজেক্ট/অবজেক্ট-রিটার্নের সিরিয়ালাইজেশন — স্নিপেট-আহ্বান-যাচাই **প্রথম**, daemon-restart-সন্দেহ **পরে**; আর-ডাম্পে `{}$` = খালি-অবজেক্ট (string-র‍্যাপার-শূন্য) — string-রিটার্ন হলে `"..."$` হওয়ার-কথা।
- **checked-pinned-পোর্ট-চুক্তি (pr303 — dqf302-মিরর):** pre-contract-ফিল্টার-ইঞ্জিন (`hit = !q || kw-match`) + bulk-checkbox-সারফেস = **অদৃশ্য-সারি-মুছে-ফেলার বাস্তব-ঝুঁকি** — যাচাই-প্রস্তাব ঝুঁকি-প্রমাণে-ফিরলে পোর্টে-রূপান্তরিত-হয়; পোর্ট-চেকলিস্ট: hit-শাখা + pinned()-গণক + document-level change-ডেলিগেশন (sidebar target-sync-এর-পরে বাবল-ক্রমে) + boot-apply-init + Enter-firstMatch-চেকবক্স-অ্যাঙ্কর + হুকে pinned() + **রো-শূন্যে-ও-হুক** (early-return-এর-আগে-হুক-সরানো); চিপ-অঙ্ক-স্কিম = সারফেস-নিজস্ব-চুক্তি (press=s258-ASCII — bn-মিরর-নিষিদ্ধ)।
- **ep303-সারফেস-চুক্তি (ep301/302-ধর্ম-সম্প্রসারণ):** elCalYList-ডেলিগেশন + `.ep-cal-y`-গেট (avail-উদ্ভূত — disabled-গেট-অপ্রাসঙ্গিক) + **recency-first মিরর** (বছর-কোষে সরাসরি-কাগদ-গন্তব্য-নেই → YYYY-প্রিফিক্স DESC-প্রথম = বছরের-সর্বশেষ-সংখ্যা → arr[0]; ep302-র ASC-ক্লিক-মিরর-থেকে সচেতন-বিচ্যুতি — কারণ-ডক-কৃত) + reason year/year-focus + উষ্ণ-মিরর + `__epk300QA.years`; **quiet-window-র‍্যাপার-ক্রম:** ep284OpenList-এর সর্ব-বাইরের-র‍্যাপার (ep289-এর-পরে সংজ্ঞায়িত) ধরতে-হয় — নতুন-র‍্যাপার-সবসময়-ফাইলের-শেষ-ব্লকে (পরবর্তী-সেশনের র‍্যাপার আমাদের-ও মুড়বে)।
- **sections-N/A-প্রমাণ-চুক্তি:** bulk-ছাড়া-সারফেসে চুক্তি-গঠনগত-অর্থে-সন্তুষ্ট — প্রমাণ = SSR-মার্কআপে `name="bulk_ids" value=`-শূন্য (bare-`bulk_ids`-grep sidebar-script-রেফারেন্সে false-positive — প্যাটার্ন-বাধ্যতমূলক); ভবিষ্যৎ-ফিল্টার-সারফেসে bulk-যোগ-হলে পোর্ট-চেকলিস্ট-পূর্বক।
- **E2E-সিড-চুক্তি (পুনঃ-প্রয়োগ):** press-সারি-শূন্য-বাস্তবতায় প্রোডাকশন-ফ্লো-সিড (multipart-POST qa303press + image_url-পথ) + শেষে delete→ট্র্যাশ→/admin/trash/bulk-purge-নেট-শূন্য ×৩-অ্যাসার্ট (s258-নীতি — dup-গার্ড-সহ পুনঃরান-idempotent)।
- **পরের-এজেন্ট: session304 থেকে (worklog Task ID 144)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session303 + session302 + session301 পড়ুন; বাকি-প্রস্তাব: moderator-notices/events/members-সারফেসে **checked-pinned-পোর্ট-প্যাক** (মূল্যায়ন: bulk-checkbox-বিদ্যমানতা → ঝুঁকি-গ্রেড → পোর্ট-ক্রম — pr258-প্যাটার্ন-মিরর), page-count-ব্যাজ (গেটেড ×৫), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session303-নোট' in v:
    print('PLANS.md: session303-নোট-উপস্থিত (skip)')
else:
    A = '## session302-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE303 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session303-নোট সন্নিবেশিত')

WENTRY = '''---
Task ID: 143
Agent: Cron agent loop (session303 — Job 403679, trace 202609241319)
Task: QA-প্রথম রাউন্ড — press checked-pinned গ্যাপ-ফিক্স (pr303) + ep303 বছর-তালিকা-প্রিফেচ + [Mandatory] স্টাইল/ফিচার + সর্ব-রিগ্রেশন

Work Log:
- worklog/PLANS/ACTIVE-LOCK পাঠ → session303-চুক্তি নিশ্চিত; HEAD=origin=394a439 clean BEHIND=০
- agent-browser QA: epaper ×৩-লোড এরর-শূন্য + হুক-জীবিত; ব্র্যাকেট-ক্ষয়-সন্দেহ → কোডপয়েন্ট-যাচাইয়ে মিথ্যা-অ্যালার্ম প্রমাণ (ডিসপ্লে-আর্টিফ্যাক্ট)
- pr303: pr258-ইঞ্জিনে checked-pinned পোর্ট (বাস্তব-ঝুঁকি-ফিক্স) + Enter-firstMatch + হুক ×১০ + pinned-CSS
- ep303: elCalYList ডেলিগেশন-প্রিফেচ + recency-first মিরর + quiet-window + years-গেটার + CSS
- sections: bulk_ids-চেকবক্স-অনুপস্থিত-প্রমাণ (চুক্তি N/A — SSR-অ্যাসার্ট)
- s303-suite ৭৫/৭৫ ×৩ (IIFE-() -ক্ষয়-গোটচা আবিষ্কার-সহ — নতুন-নির্ণয়-চুক্তি ডক-কৃত)
- রিগ্রেশন সর্ব-গ্রিন + role-policy ২৬০/২৬০ + guard:design + audit:views

Stage Summary:
- commit দুই-খণ্ডে (feature + docs) push; নেট-শূন্য-সিড প্রমাণিত; পরের-এজেন্ট: session304 (Task ID 144)
'''

v = rd(WLOG)
if '## Task ID 143 / session303' in v or 'Task ID: 143' in v:
    print('worklog.md: Task-143-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-143-এন্ট্রি সংযোজিত')

print('DOCS-OK s303')
