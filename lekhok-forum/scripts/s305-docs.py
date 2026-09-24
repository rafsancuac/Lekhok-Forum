#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s305-docs.py — session305 ডক-ত্রয় (PROJECT §৩০৫ + PLANS session305-নোট + repo worklog Task 145)
# চুক্তি: ইডেমপোটেন্ট ×২ (মার্কার-স্কিপ) + @@HID@@-প্লেসহোল্ডার (লেখনী-স্তর -ক্ষয়-এড়ানো)
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
HID = '[' + 'h' + 'idden]'

PROJECT_TITLE = '## §৩০৫ (session305 — cron 403679: cf305 complaints checked-pinned পোর্ট — চুক্তি-সর্বসার্থকতা সম্পূর্ণ) — s305 ৪২/৪২ ×৩ (২৪ সেপ্টেম্বর ২০২৬)'

PROJECT_BODY = '''
**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`91c6518` (session304, clean-tree, BEHIND=০)। **কভারেজ-ম্যাট্রিক্স-অডিট (নতুন-পদ্ধতি):** সর্ব-moderator-ভিউতে `bulk_ids × QA-হুক × pinned`-গণনা → **complaints (mc254) = শেষ-বাকি pre-contract bulk+filter-সারফেস** (`hit = !v || kw-match` + সারি-bulk_ids + bulkBar + bulk-all) — session304-মূল্যায়ন প্রস্তাব-নির্ধারিত ত্রি-সারফেসে সীমাবদ্ধ ছিল; ম্যাট্রিক্স-অডিটে ধরা-পড়ে। **গোটচা-শিক্ষা:** প্রাথমিক grep `__[a-z]+QA` ডিজিট-যুক্ত হুক-নাম (`__dqf302QA`) মিস করে daily-form-কে ফিল্টার-শূন্য ভাবায় → সংশোধিত `__[A-Za-z0-9]+QA`-পুনঃ-অডিটে daily-form পূর্ব-সজ্জিত-প্রমাণ (dqf302 — session302; আলাদা-কাজ-শূন্য)। agent-browser QA-বেসলাইন: সার্ভার-জীবিত + complaints 200।

**[Mandatory-ফিচার] cf305 — mc254-ইঞ্জিনে checked-pinned চুক্তি পোর্ট (pr303-মিরর — পরিবার-সম্পূর্ণতা):** `hit = pinned || !v || kw-match` + `mcPinned254()` গণক + document-level change-ডেলিগেশন (`input[name="bulk_ids"],[data-bulk-all]` — sidebar initBulkBar target-sync-পরবর্তী বাবল-ক্রম; hidden-ids-সিঙ্ক-প্রমাণ) + boot-apply-init + **Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — স্ট্যাটাস-আপডেট/ডিলিট-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম)** + ফ্ল্যাশ ৯০০ms (`mc-flash305`) + `__mcQA` হুক-বর্ধিত (surface/**pinned** — legacy total/count/apply/clear-অক্ষুণ্ণ) + apply/input-গার্ড (রো-শূন্যে-ও-হুক-নিরাপদ) + কাউন্ট-চিপ ASCII (mc254-চুক্তি-সংরক্ষণ)। **ফলাফল: checked-pinned চুক্তি এখন সর্ব-bulk+filter-সারফেসে (৭-সারফেস: pr258/dqf302/re261-family + no259/ev260/mm255/mc254) — অদৃশ্য-সারি-বাল্ক-ঝুঁকি কাঠামোগতভাবে শূন্য।**

**[Mandatory-স্টাইল]:** complaints **session305-ব্লক** (হেক্স-শূন্য টোকেন-শুধু) — pinned-সারি-অ্যাফোর্ডেন্স (`:has(input[name="bulk_ids"]:checked)` @supports-গেটেড: inset-brandgreen-প্রান্ত + soft-টিন্ট + বিষয়-গাঢ়) + Enter-ফ্ল্যাশ-আউটলাইন + চেকবক্স focus-visible-রিং + পিন/আনপিন-ট্রানজিশন (reduced-motion-গার্ড) + 640px (প্রান্ত 3px→2px)।

**টেস্ট:** নতুন tests/s305-suite.sh **৪২/৪২ ×৩-ধারাবাহিক** (কাঠামো ×১২ + হেক্স-শূন্য + SSR ×৪ + **E2E-cf305 ×১৭** — boot-apply-init + hidden-ids-সিঙ্ক + গার্বেজে-ও-পিনড + pinned-CSS-প্রয়োগ + আনচেক-মুক্তি + bulk-all→সর্ব-পিন+হিডেন-শূন্য + Enter-চেকবক্স-ফোকাস+ফ্ল্যাশ-নির্মোচন + hScroll + স্ক্রিনশট ×২ + দ্বি-লোড-এরর-শূন্য + পরিষ্কারক **bulk-delete→ট্র্যাহ→bulk-purge নেট-শূন্য ×৩-অ্যাসার্ট**); সিড-নতুন-পথ: **প্রোডাকশন dmca-report POST** (testadmin — `submitted_by` JOIN-সামঞ্জস্য; ৬০-মিনিট-ডুপ-গার্ড-সহনশীল — পুনঃরানে marker-পুনঃব্যবহার); রিগ্রেশন: **s254 ৩৬/৩৬** (mc254-legacy-অক্ষুণ্ণ) + **s304 ৭৪/৭৪** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s305-patch.py (idempotent ×N — পূর্ণ-প্যাটার্ন-অ্যাঙ্কর + পোস্ট-অ্যাসার্ট + IIFE-শেষ-লাইন-প্রমাণ + @@HID@@-গণনা + হেক্স-শূন্য + EJS-compile)।

**প্রোড-স্পট:** home-200 + epaper-200 (webhook-ডিপ্লয়-জীবিত); **s304/cf305-হুক-প্রোড-যাচাই অসম্পূর্ণ** — prod-এ testadmin/demo123-লগইন-ব্যর্থ (200-স্থগিত — প্রোড-ডেমো-ক্রেড-অনুপস্থিতি); auth-gated-ভিউ-হুক-যাচাই = **প্রোড-ক্রেড-ধারী-এজেন্টের-কার্য** (গেটেড)।

**গোটচা ×২ (PLANS session305):** ① **grep-রেজেক্স-অঙ্ক-অন্ধতা** — `__[a-z]+QA`-জাতীয় প্যাটার্ন ডিজিট-যুক্ত হুক (`__dqf302QA`) বাদ-দেয় → মিথ্যা-অনুপস্থিতি-সিদ্ধান্ত; হুক-অনুসন্ধানে `__[A-Za-z0-9]+QA`-বাধ্যতমূলক ② **প্রস্তাব-স্কোপ-সীমা** — পূর্ব-রাউন্ডের প্রস্তাব-তালিকা সম্পূর্ণ-কভারেজ-প্রমাণ নয়; পরিবার-সম্পূর্ণতা-দাবিতে সর্ব-ভিউ-ম্যাট্রিক্স-অডিট-বাধ্যতমূলক।

**পরের-এজেন্ট: session306 (Task ID 146)** — PLANS session305+304+303 পড়ুন; fetch + push-আগে re-fetch+rebase + রিবেজ-পরবর্তী guard:design + PNG-চার্ন-রিভার্ট; বাকি-প্রস্তাব: page-count-ব্যাজ (গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), প্রোড-ক্রেড-থাকলে s304/cf305-হুক-প্রোড-যাচাই, নতুন-ফিল্টার-সারফেসে checked-pinned-চেকলিস্ট-প্রয়োগ।
'''

PLANS_NOTE = '''## session305-নোট (cron 403679 — cf305 complaints checked-pinned পোর্ট — পরিবার-সম্পূর্ণতা)
- **grep-রেজেক্স-অঙ্ক-অন্ধতা-গোটচা (নতুন-শ্রেণি):** `__[a-z]+QA`-জাতীয় হুক-অনুসন্ধান-প্যাটার্ন ডিজিট-যুক্ত নামস্পেস (`__dqf302QA`, `__epk300QA`) **মিস করে** → সারফেস-কে ফিল্টার-শূন্য ভুল-শ্রেণিবদ্ধ (এ-রাউন্ডে daily-form-প্রাথমিক-মূল্যায়নে ঘটে; সংশোধিত `__[A-Za-z0-9]+QA`-পুনঃ-অডিটে পূর্ব-সজ্জিত-প্রমাণ — অপ্রয়োজনীয়-কাজ-রোধ)। **চুক্তি: হুক/নেমস্পেস-অনুসন্ধানে অঙ্ক-অন্তর্ভুক্ত-ক্যারেক্টার-ক্লাস-বাধ্যতমূলক।**
- **কভারেজ-ম্যাট্রিক্স-অডিট-চুক্তি (পরিবার-সম্পূর্ণতা-প্রমাণ):** "সব-সারফেস-কভারড"-দাবির পূর্বে সর্ব-ভিউ-ফাইলে `bulk_ids-উপস্থিতি × QA-হুক × pinned-শাখা`-ত্রি-কলাম-গণনা-বাধ্যতমূলক (এ-রাউন্ডে complaints-প্রকৃত-গ্যাপ-আবিষ্কৃত — session304-প্রস্তাব-স্কোপ ত্রি-সারফেসে সীমাবদ্ধ ছিল); ভবিষ্যৎ-নতুন-লিস্ট-ভিউ-যোগেও এ-ম্যাট্রিক্স-পুনঃ-চালনা।
- **প্রোড-হুক-যাচাই-গেট:** prod (lekhok-forum.vercel.app)-এ testadmin/demo123-লগইন-ব্যর্থ (200-স্থগিত) — **auth-gated-ভিউ-এর prod-হুক-যাচাই প্রোড-ক্রেড-ধারী-এজেন্টের-কার্য**; ক্রেড-শূন্য-স্যান্ডবক্সে পাবলিক-স্পট-ই-সীমা (home/epaper-200) — লগইন-চেষ্টা ×১-এ-সীমাবদ্ধ (prod-রেট-লিমিট-সম্মান)।
- **dmca-report-সিড-পথ (complaints-সারফেসের জন্য):** complaints-এর কোনো-মডারেটর-তৈরি-রুট-নেই — প্রোডাকশন-সিড = লগইন-ইউজারের `/support/dmca-report` POST (workTitle-এ মার্কার → subject-এ প্রবাহিত → data-kw); ৬০-মিনিট-ডুপ-গার্ড পুনঃরানে-ও-নিরাপদ (marker-আবিষ্কার-প্রথম, POST-পরে); পরিষ্কারক = সেই-সারফেসের নিজ-বাল্ক-পথেই (bulk-delete → ট্র্যাহ → /admin/trash/bulk-purge) — **ফিচার-যাচাই-ই পরিষ্কারক-পথ-প্রমাণ**।
- **পরের-এজেন্ট: session306 থেকে (worklog Task ID 146)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session305 + session304 + session303 পড়ুন; বাকি-প্রস্তাব: page-count-ব্যাজ (গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), প্রোড-ক্রেড-থাকলে s304/cf305-হুক-প্রোড-যাচাই, নতুন-ফিল্টার-সারফেসে checked-pinned-চেকলিস্ট + ম্যাট্রিক্স-অডিট-প্রয়োগ।

'''

WORKLOG_ENTRY = '''---
Task ID: 145
Agent: Cron agent loop (session305 — Job 403679, trace 202609241454)
Task: cf305 complaints checked-pinned পোর্ট (পরিবার-সম্পূর্ণতা) + [Mandatory] স্টাইল/ফিচার + সর্ব-রিগ্রেশন + ডক-ত্রয়

Work Log:
- worklog/PLANS/PROJECT পড়ে অবস্থা-যাচাই: HEAD=origin=91c6518 (session304-pushed, clean-tree, BEHIND=০)
- **কভারেজ-ম্যাট্রিক্স-অডিট** (bulk × QA × pinned সর্ব-moderator-ভিউ): complaints (mc254) = শেষ-বাকি pre-contract bulk+filter-সারফেস; grep-অঙ্ক-অন্ধতা-গোটচা ধরা-পড়ে (daily-form প্রকৃতে dqf302-সজ্জিত — session302)
- scripts/s305-patch.py: cf305 পোর্ট (hit=pinned||match + mcPinned254 + change-ডেলিগেশন + boot-apply + Enter-চেকবক্স-অ্যাঙ্কর — স্ট্যাটাস-আপডেট-বাটন-নিষিদ্ধ + ফ্ল্যাশ ৯০০ms + __mcQA-বর্ধিত + apply/input-গার্ড) + session305 CSS (pinned-অ্যাফোর্ডেন্স + focus-visible-রিং + ট্রানজিশন + reduced-motion + 640px — হেক্স-শূন্য)
- tests/s305-suite.sh **৪২/৪২ ×৩-ধারাবাহিক** — নতুন-সিড-পথ: প্রোডাকশন dmca-report POST (ডুপ-গার্ড-সহনশীল); পরিষ্কারক bulk-delete→ট্র্যাহ→purge নেট-শূন্য ×৩-অ্যাসার্ট
- রিগ্রেশন: s254 ৩৬/৩৬ + s304 ৭৪/৭৪ + guard:design + audit:views (১২২ ejs) — সর্ব-গ্রিন
- প্রোড-স্পট: home-200 + epaper-200; s304/cf305-হুক-প্রোড-যাচাই অসম্পূর্ণ (prod-ক্রেড-অনুপস্থি — গেটেড, PLANS-নোট)
- ডক-ত্রয়: PROJECT §৩০৫ + PLANS session305-নোট + repo worklog Task 145 (s305-docs.py idempotent ×২)

Stage Summary:
- **checked-pinned চুক্তি-সর্বসার্থকতা:** সর্ব-bulk+filter-সারফেস কভারড (৭-সারফেস) — অদৃশ্য-সারি-বাল্ক-ঝুঁকি কাঠামোগতভাবে শূন্য
- প্যাচ/সুইট: scripts/s305-patch.py + tests/s305-suite.sh (৪২-চেক); নতুন-চুক্তি ×২ (grep-অঙ্ক-অন্ধতা + ম্যাট্রিক্স-অডিট) PLANS-এ
- ডক: PROJECT §৩০৫ + PLANS session305 + worklog Task 145; পরের-এজেন্ট session306 (Task ID 146)
'''

PROJECT_BODY = PROJECT_BODY.replace('@@HID@@', HID)
PLANS_NOTE = PLANS_NOTE.replace('@@HID@@', HID)
WORKLOG_ENTRY = WORKLOG_ENTRY.replace('@@HID@@', HID)

fails = []

# ── 1) PROJECT.md: §৩০৫-সন্নিবেশ (§৩০৪-র পূর্বে) ──
p = APP + '/PROJECT.md'
t = open(p, encoding='utf-8').read()
if '## §৩০৫' in t:
    print('SKIP PROJECT §৩০৫ (পূর্ব-বিদ্যমান)')
else:
    anchor = '## §৩০৪'
    if t.count(anchor) != 1:
        fails.append('PROJECT: §৩০৪-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PROJECT_TITLE + '\n' + PROJECT_BODY + '\n' + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PROJECT §৩০৫')

# ── 2) PLANS.md: session305-নোট (session304-নোট-এর পূর্বে) ──
p = APP + '/PLANS.md'
t = open(p, encoding='utf-8').read()
if '## session305-নোট' in t:
    print('SKIP PLANS session305 (পূর্ব-বিদ্যমান)')
else:
    anchor = '## session304-নোট'
    if t.count(anchor) != 1:
        fails.append('PLANS: session304-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PLANS_NOTE + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PLANS session305-নোট')

# ── 3) repo worklog.md: Task 145 সংযোজন (ফাইল-শেষে) ──
p = APP + '/worklog.md'
t = open(p, encoding='utf-8').read()
if 'Task ID: 145' in t:
    print('SKIP worklog Task 145 (পূর্ব-বিদ্যমান)')
else:
    if not t.endswith('\n'):
        t += '\n'
    t2 = t + WORKLOG_ENTRY
    open(p, 'w', encoding='utf-8').write(t2)
    print('APPLIED worklog Task 145')

if fails:
    print('FAILS: ' + '; '.join(fails))
    sys.exit(1)
print('S305-DOCS-GREEN')
