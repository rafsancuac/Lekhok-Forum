#!/usr/bin/env python3
# s302-docs.py — session302 ডকুমেন্টেশন (PROJECT.md §৩০২ + PLANS session302-নোট + worklog Task-142)
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

SEC302 = '''## §৩০২ (session302 — cron 403679: dqf302 daily-ফিল্টার checked-pinned চুক্তি + ep302 মাস-প্যানেল-প্রিফেচ quiet-window) — s302 ৬৫/৬৫ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`b262ade` (session301-qabugfix, clean-tree, BEHIND=০); QA-বেসলাইন: home/epaper-200 + daily/:type-গেট-302→200 — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন:** PLANS session301-প্রস্তাবের প্রথম-দুই-প্রার্থী — ① moderator-daily-form ফিল্টার (checked-hidden-সুরক্ষা-চুক্তি-পূর্বক) ② ep283-মাস-প্যানেল-প্রিফেচ; best-writer-admin-প্রতিরূপ **যাচাইকৃত-অনুপস্থিত** (admin-দিকে best-writer-রুট-নেই — grep-প্রমাণ; skip); page-count-ব্যাজ **আবার-বাতিল** (গেটেড ×৫)।

**[Mandatory-ফিচার] ① dqf302 /moderator/daily/:type তাৎক্ষণিক-ফিল্টার (৪-প্রকার quiz/this_day/activity/epaper — একই-ভিউ):** bwf301/re261-চুক্তি-মিরর — স্ট্রিপ (ইনপুট/ক্লিয়ার/বাংলা-কাউন্ট-চিপ/kbd-hint/শূন্য-অবস্থা — bulk-form-বহির্ভূত) + রো-মার্ক `data-dqf-row302="<id>" data-kw` (দ্বিভাষিক: #id/শিরোনাম/তারিখ/ধরন/interactive|static) + রানটাইম-ইনডেক্স + 'f'-ফোকাস + Escape + Enter-firstMatch (প্রাথমিক-অ্যাঙ্কর = **bulk-checkbox** — delete-বাটন-ফোকাস-বিপজ্জনক-ডিজাইন-সিদ্ধান্ত) + boot-apply-init + `__dqf302QA` হুক ×৯ (surface/rows/matches/total/active/**pinned**/firstMatch/apply/clear); **checked-pinned চুক্তি (নতুন-পরিবার-স্তর):** চেক-করা bulk_ids-চেকবক্সের সারি ফিল্টারে-ও-দৃশ্যমান (`hit = pinned || !q || kw-match`) → bulk-delete **কখনো অদৃশ্য-সারি-মুছে-না**; document-level change-ডেলিগেশন (`input[name="bulk_ids"],[data-bulk-all]`) → sidebar.ejs-বাল্ক-স্ক্রিপ্টের সাথে-সহাবস্থান: bulk-all-এর target-level sync আগে-চলে (বাবল-ক্রম) → আমাদের apply সর্বদা-সর্বশেষ-অবস্থায় — **bulk-all → সর্ব-পিন → হিডেন-সারি-শূন্য** (সুইট-প্রমাণিত)। **② ep302 মাস-প্যানেল-কোষ-ইচ্ছা-প্রিফেচ (PLANS session301-প্রস্তাব):** elCalMGrid-ডেলিগেশন (mouseover/focusin — ep283Render-পুনঃরেন্ডার-নিরাপদ) + `.ep-cal-m.has`+disabled-গেট + **ep283-ক্লিক-কনভেনশন-মিরর** (YYYY-MM-প্রিফিক্স → byDate-কী-সর্ট-প্রথম = ঐ-মাসের প্রথম-সংরক্ষিত-দিন → arr[0] = সর্বশেষ-পত্রিকা) + reason 'mon'/'mon-focus' + উষ্ণ-মিরর + `__epk300QA.months`-গেটার; **quiet-window (নতুন-ধর্ম-সুরক্ষা):** panel-open → ep286Arm → স্বয়ংক্রিয় b.focus() = **ইচ্ছা-নয়** → ep283OpenPanel-wrapper-এ sync-quiet-জানালা (ep290-wrapper-প্যাটার্ন-মিরর) — arm-ফোকাস-প্রিফেচ-নিষিদ্ধ, ব্যবহারকারীর Tab-ফোকাস (পরের-টাস্ক) = ইচ্ছা — ep299-ধর্ম-ধারাবাহিকতা রক্ষা।

**[Mandatory-স্টাইল]:** epaper.css **session302-ব্লক** (ক্যাসকেড-শেষে হেক্স-শূন্য) — উষ্ণ-মাস-কোষ রিং+টিন্ট (**:not(.is-cur)-সংঘর্ষ-বিচ্ছিন্ন**) + মাস-কোষ-ট্রানজিশন + 640px-সংকোচন + reduced-motion; moderator-daily-form.ejs **dqf302-স্টাইল-ব্লক** (bwf301-মিরর — hover-ডিপেন + color-mix-ফোকাস-রিং ৪৫%/১৫% + clear :active scale(.96) + flash-outline + hidden-গার্ড !important + 640px + reduced-motion — brandgreen-পরিবার)।

**টেস্ট:** নতুন tests/s302-suite.sh **৬৫/৬৫ ×৩-ধারাবাহিক** (কাঠামো ×২৬ + SSR ×৫ + E2E-dqf ×২২ — হুক-total==SSR-সারি১০ + একক-মিল#id + বাংলা-চিপ + **checked-pinned ×৪** (চেক→গার্বেজেও-দৃশ্যমান/আনচেক→পিন-মুক্ত/bulk-all→সর্ব-পিন+হিডেন-শূন্য/আন-অল→পিন-শূন্য) + Enter-checkbox-ফোকাস+ফ্ল্যাশ + hScroll + স্ক্রিনশট ×২ + E2E-ep302 ×১১ — বুট-শূন্য + **quiet-window** + hover-reason=mon + ডিডুপ + months-মিরর + পুনঃরেন্ডার-বিলোপ/পুনঃ-প্রতিষ্ঠা + E2E-রিগ্রেশন ×২ — দ্বি-লোড-এরর-শূন্য + bwf301-সহাবস্থান); রিগ্রেশন: s301 ৬৯/৬৯ + s300-multipart ৪৭/৪৭ + s300-epref ৬৫/৬৫ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s302-patch.py (idempotent ×N — ৩-ফাইল মার্কার-স্কিপ + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL ×৬ + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-compile)।

**গোটচা ×৪ (PLANS session302):** ① **panel-open arm-focus = লুকানো-ইচ্ছা-ট্রিগার** — ep286Arm-এর b.focus() focusin-জাত-ইচ্ছা-জেনারেট-করে (প্যানেল-খোলায় অটো-প্রিফেচ — ধর্ম-ভঙ্গ); সমাধান = wrapper-এ sync-quiet-জানালা (live-প্রোবে ধরা-পড়ে: last='mon-focus' প্রথম-হোভার-পূর্বেই) ② **target-level vs document-level লিসনার-ক্রম** — bulk-all-প্রোগ্রাম্যাটিক-চেক sync চালায়; আমাদের document-ডেলিগেশন বাবল-ক্রমে পরে-চলে → সর্বশেষ-অবস্থা-গ্যারান্টি — চুক্তি-নির্ভরতা ডকুমেন্টেড ③ **মাস-প্যানেল বুটে-শূন্য** — epCalMGrid ep283Render-পর্যন্ত খালি → ডেলিগেশন-বাধ্যতমূলক + E2E-তে panel-open-প্রথম ④ **epCalMGrid-স্কোপ** — elCalMGrid/elCalMY/ep283Year বিদ্যমান-IIFE-স্কোপে (bracedep-১) — নতুন-ফানেল-সেখানেই বসাতে-হয়।

'''

v = rd(PROJ)
if '## §৩০২' in v:
    print('PROJECT.md: §৩০২-মার্কার-উপস্থিত (skip)')
else:
    A = '## §৩০১ (session301 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC302 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §৩০২ সন্নিবেশিত')

NOTE302 = '''## session302-নোট (cron 403679 — dqf302 checked-pinned ফিল্টার + ep302 মাস-প্যানেল-প্রিফেচ quiet-window)
- **checked-pinned চুক্তি (ফিল্টার×bulk-সহাবস্থান — নতুন-পরিবার-স্তর):** bulk_ids-চেকবক্স-যুক্ত সারি-তালিকায় ফিল্টার লাগালে `hit = checkbox.checked || !q || kw-match` — **চেক-করা-সারি কখনো-লুকায়-না** → bulk-delete-এর hidden-row-মুছে-ফেলা-ঝুঁকি-গঠনগতভাবে-শূন্য; bulk-all-পথও-কভার (সব-চেক → সর্ব-পিন → ফিল্টার-নিষ্ক্রিয় — স্ব-সামঞ্জস্য); ভবিষ্যৎ-ফিল্টার-সারফেসে bulk-checkbox-থাকলে এ-চুক্তিই-মানুন।
- **target-level/document-level লিসনার-ক্রম-চুক্তি:** sidebar.ejs-বাল্ক-স্ক্রিপ্ট target-স্তরে sync চালায় (hidden-ids-অ্যাপেন্ড + count); ফিল্টার-ইঞ্জিন document-স্তরে change-ডেলিগেশন করে → বাবল-ক্রমে target-আগে, document-পরে → apply সর্বদা-সর্বশেষ-চেক-অবস্থা-দেখে। নতুন-কোনো-চেক-সচেতন-ফিল্টারে এ-ক্রম-নির্ভরতা মাথায়-রাখুন (sidebar-script-অর্ডার-বদলালে পুনঃ-যাচাই)।
- **quiet-window চুক্তি (panel-open arm-focus-সাপ্রেস — ep299-ধর্ম-সম্প্রসারণ):** কোনো-ওপেনার/রেন্ডারার স্বয়ংক্রিয়ভাবে focus() করলে (ep286Arm-প্যাটার্ন) focusin-জাত-ইচ্ছা-ট্রিগার **মিথ্যা-ফায়ার** করে → wrapper-প্যাটার্নে (ep290-রীতি) sync-quiet-জানালা: `openPanel = function(){ quiet=true; base(); quiet=false; }` — জানালার-ভেতরের ফোকাস = অটোমেশন (ইচ্ছা-নয়), বাইরের = ব্যবহারকারী (ইচ্ছা); E2E-প্রোব: panel-open-পরবর্তী prefetched()==0-অ্যাসার্ট-বাধ্যতমূলক।
- **ep302-সারফেস-চুক্তি (ep301-ধর্ম-সম্প্রসারণ):** elCalMGrid-ডেলিগেশন (ep283Render/ArmSoft-পুনঃরেন্ডার-নিরাপদ) + `.ep-cal-m.has`+disabled-গেট + **ক্লিক-কনভেনশন-মিরর** (YYYY-MM-প্রিফিক্স → byDate-কী-সর্ট-প্রথম → arr[0]) — মাস-কোষ-প্রিফেচ = ক্লিক-গন্তব্যের-পূর্ব-উষ্ণতা (একই-গণনা-দুই-স্থানে-নকল-নয় — একই-এক্সপ্রেশন-মিরর) + reason 'mon'/'mon-focus' + `__epk300QA.months`।
- **dqf302-সারফেস-চুক্তি:** হুক ×৯ — `pinned()` নতুন-সদস্য (চেক-করা-সারি-গণনা — পিন-চুক্তির-প্রমাণ-হুক); Enter-firstMatch-অ্যাঙ্কর = bulk-checkbox (delete/submit-বাটন-ফোকাস = দুর্ঘটনাজনিত-অ্যাকশন-ঝুঁকি — পরিবারে নতুন-নিয়ম: **বিপজ্জনক-অ্যাকশন-বাটন কখনো firstMatch-ফোকাস-গন্তব্য নয়**)।
- **best-writer-admin-যাচাই:** admin-দিক best-writer-রুট **অনুপস্থিত-প্রমাণিত** (routes-grep) — moderator-only সারফেস; ভবিষ্যৎ-প্রস্তাব-তালিকা-থেকে বাদ।
- **পরের-এজেন্ট: session303 থেকে (worklog Task ID 143)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session302 + session301 + session300 পড়ুন; বাকি-প্রস্তাব: moderator-press/sections-এ **checked-pinned-পুনঃ-যাচাই** (pr258/lsf298-সারফেসে bulk-checkbox-সহ-ফিল্টার — চুক্তি-মেনে-চলে-কিনা E2E), ep283-বছর-তালিকা-কোষে-প্রিফেচ (epCalYList), page-count-ব্যাজ (গেটেড ×৫), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session302-নোট' in v:
    print('PLANS.md: session302-নোট-উপস্থিত (skip)')
else:
    A = '## session301-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE302 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session302-নোট সন্নিবেশিত')

WENTRY = '''## Task ID 142 / session302 (cron 403679 — dqf302 checked-pinned ফিল্টার + ep302 মাস-প্যানেল-প্রিফেচ)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`b262ade` (session301) — স্থিতিশীল, বাগ-শূন্য; PLANS session301-প্রস্তাবের প্রথম-দুই-প্রার্থী গ্রহণ (daily-form-ফিল্টার checked-pinned-চুক্তিতে + মাস-প্যানেল-প্রিফেচ); best-writer-admin যাচাইকৃত-অনুপস্থিত।
- **পরিবর্তন:** views/user/moderator-daily-form.ejs (dqf302 স্ট্রিপ+রো-মার্ক ×১০/প্রকার+checked-pinned-ইঞ্জিন+change-ডেলিগেশন+__dqf302QA ×৯+স্টাইল-ব্লক) + views/user/epaper.ejs (ep302 মাস-কোষ-ডেলিগেশন + ep283-ক্লিক-কনভেনশন-মিরর + ep283OpenPanel-quiet-wrapper + __epk300QA.months) + public/assets/css/epaper.css (session302-ব্লক — উষ্ণ-মাস-কোষ) + scripts/s302-patch.py (idempotent ×N — ৩-ফাইল, অ্যাঙ্কর ×৬)।
- **যাচাই:** s302 **৬৫/৬৫ ×৩-ধারাবাহিক** (checked-pinned ×৪ + quiet-window + reason=mon + ডিডুপ + months-মিরর + hScroll + স্ক্রিনশট ×২); রিগ্রেশন s301 **৬৯/৬৯** + s300-multipart ৪৭/৪৭ + s300-epref ৬৫/৬৫ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)।
- **গোটচা ×৪:** panel-open arm-focus = লুকানো-ইচ্ছা-ট্রিগার (wrapper-quiet-সমাধান) · target/document-লিসনার-ক্রম (বাবল-গ্যারান্টি) · মাস-প্যানেল বুটে-শূন্য (ডেলিগেশন-বাধ্যতমূলক) · elCalMGrid-স্কোপ (IIFE-ভিতরেই) — বিস্তারিত PLANS session302।
- **পরের-এজেন্ট: session303 (Task ID 143)** — PLANS session302-নোট পড়ুন; checked-pinned-পুনঃ-যাচাই (pr258/lsf298) + epCalYList-প্রিফেচ; push-আগে fetch+rebase; Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''
v = rd(WLOG)
if '## Task ID 142 / session302' in v:
    print('worklog.md: Task-142-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-142-এন্ট্রি সংযোজিত')

print('DOCS-OK s302')
