#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s304-docs.py — session304 ডক-ত্রয় (PROJECT §৩০৪ + PLANS session304-নোট + repo worklog Task 144)
# চুক্তি: ইডেমপোটেন্ট ×২ (মার্কার-স্কিপ) + @@HID@@-প্লেসহোল্ডার (লেখনী-স্তর -ক্ষয়-এড়ানো — s298/303-গোটচা)
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
HID = '[' + 'h' + 'idden]'

PROJECT_TITLE = '## §৩০৪ (session304 — cron 403679: checked-pinned পোর্ট-প্যাক no304/ev304/mm304 — ত্রি-সারফেস অদৃশ্য-সারি-ঝুঁকি-নির্মূল) — s304 ৭৪/৭৪ ×৩ (২৪ সেপ্টেম্বর ২০২৬)'

PROJECT_BODY = '''
**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`9da3ff0` (session303-worklog, clean-tree, BEHIND=০); agent-browser QA-বেসলাইনে **প্রকৃত-ঝুঁকি-লাইভ-প্রমাণ** — /moderator/notices-এ চেক-করা-সারিতে গার্বেজ-কুয়েরি প্রয়োগ → `{checked:true, rowHidden:true, bulkCount:১}` (events-এ পুনঃ-প্রমাণ) — session259/260/255-ইঞ্জিন ত্রিটিই pre-contract-প্রজন্ম (`hit = !q || kw-match`) কিন্তু সারফেসে bulk_ids+bulk-delete/toggle বিদ্যমান → **চেক-করা-সারি ফিল্টারে-লুকিয়ে bulk-delete-এ-নীরব-মুছে-ফেলার বাস্তব-ঝুঁকি ত্রি-সারফেসে** (members-এ পরোক্ষ — shared `mod-member-row` partial-এ চেকবক্স)। **মিথ্যা-অ্যালার্ম-শিক্ষা:** members.ejs পড়তে-গিয়ে ডিসপ্লেতে `:not(idden])`-সদৃশ প্রদর্শিত → od -c বাইট-যাচাই → **ফাইল-অক্ষত (`:not(@@HID@@)`) — ডিসপ্লে-পাইপলাইনের `@@HID@@`-সিকোয়েন্স-ক্ষয়** (session298/303-গোটচা পুনঃ-প্রমাণ; এ-রাউন্ডে একটি মিথ্যা-বাগ-তদন্ত-ব্যয় রোধ-করা-গেল — Read/Grep-আউটপুটের `@@HID@@`-সন্দেহে od-বাইট-যাচাই-বাধ্যতমূলক)। **প্রস্তাব-নির্বাচন:** PLANS session303-প্রস্তাবের প্রথম-প্রার্থী — moderator-notices/events/members **checked-pinned পোর্ট-প্যাক** (মূল্যায়ন-প্রোটোকল: bulk-checkbox-বিদ্যমানতা → ঝুঁকি-গ্রেড → পোর্ট-ক্রম — ত্রি-সারফেসই HIGH)।

**[Mandatory-ফিচার] পোর্ট-প্যাক (pr303-প্যাটার্ন-মিরর — প্রতি-সারফেস-নেমস্পেস):** ① **no304** (moderator-notices.ejs — no259-ইঞ্জিন-আপগ্রেড): `hit = pinned || !q || kw-match` + `noPinned259()` গণক + document-level change-ডেলিগেশন (`input[name="bulk_ids"],[data-bulk-all]` — sidebar initBulkBar target-sync-এর-পরে বাবল-ক্রমে) + boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম) + ফ্ল্যাশ ৯০০ms (`no-flash304`) + `__noQA` হুক-বর্ধিত (surface/total/pinned/count/apply/clear — **রো-শূন্যে-ও-সংজ্ঞায়িত**, early-return-হুক-পরে-সরিয়ে) + কাউন্ট-চিপ ASCII (no259-চুক্তি-সংরক্ষণ) ② **ev304** (moderator-events.ejs — ev260-আপগ্রেড): অভিন্ন-শেপ evPinned260/ev-flash304/`__evQA` ③ **mm304** (moderator-members.ejs — mm255-আপগ্রেড): অভিন্ন-শেপ mmPinned255/mm-flash304 + **সেকশন-অটো-হাইড পিন-সচেতন** (পিনড-সারি দৃশ্যমান-ই → পিনড-সারি-বিশিষ্ট `[data-mm-sec]` কার্ড-ও দৃশ্যমান-থাকে — পিন-অর্থহীন-হওয়া-রোধ; সেকশন-কোয়েরি `:not(@@HID@@)`-অক্ষুণ্ণ) + `__mmQA`-বর্ধিত (pinned-সদস্য-সহ — legacy total/count/secs/apply/clear-অক্ষুণ্ণ)।

**[Mandatory-স্টাইল]:** ত্রি-ভিউতে **session304-ব্লক** (হেক্স-শূন্য টোকেন-শুধু) — pinned-সারি-অ্যাফোর্ডেন্স (`:has(input[name="bulk_ids"]:checked)` @supports-গেটেড: inset-brandgreen-প্রান্ত + soft-টিন্ট + শিরোনাম-গাঢ়) + Enter-ফ্ল্যাশ-আউটলাইন + চেকবক্স focus-visible-রিং + পিন/আনপিন-মসৃণ-ট্রানজিশন (reduced-motion-গার্ড-সহ) + 640px-সংকোচন (প্রান্ত 3px→2px) — পিন-অবস্থা ফিল্টার-চলাকালীন দৃশ্যমান-সংকেত।

**টেস্ট:** নতুন tests/s304-suite.sh **৭৪/৭৪ ×৩-ধারাবাহিক** (কাঠামো ×২২ + হেক্স-শূন্য ×৩-ব্লক + SSR ×৯ + **E2E-no304 ×১৭** — boot-apply-init + hidden-ids-সিঙ্ক + গার্বেজে-ও-পিনড + pinned-CSS-প্রয়োগ + আনচেক-মুক্তি + bulk-all→সর্ব-পিন+হিডেন-শূন্য + Enter-চেকবক্স-ফোকাস+ফ্ল্যাশ-নির্মোচন + hScroll + স্ক্রিনশট ×২ + **E2E-ev304 ×৩** + **E2E-mm304 ×৪** — পিনড-সারি+সেকশন-স্থায়ী + মুক্তি-পরবর্তী-সেকশন-পুনঃপ্রতিষ্ঠা + ত্রি-পৃষ্ঠা-দ্বি-লোড-এরর-শূন্য + পরিষ্কারক delete→ট্র্যাহ→bulk-purge **নেট-শূন্য ×৩-অ্যাসার্ট**); রিগ্রেশন: s255 **৩৯/৩৯** (mm255-অক্ষুণ্ণ) + s260 **৫২/৫২** (ev260-অক্ষুণ্ণ) + s303 **৭৫/০/২** (pr303-অক্ষুণ্ণ) + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s304-patch.py (idempotent ×N — অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + IIFE-সমাপ্তি-প্রমাণ + @@HID@@-গণনা + হেক্স-শূন্য + EJS-compile ×৩)।

**গোটচা ×৩ (PLANS session304):** ① **ডিসপ্লে-স্তর `@@HID@@`-ক্ষয় = মিথ্যা-বাগ-রিপোর্ট** — od -c বাইট-প্রমাণ-ব্যতীত ফিক্স-নিষিদ্ধ (এ-রাউন্ডে members-তদন্তে প্রমাণিত — ফাইল-অক্ষত) ② **অ্যাসার্ট-নিজস্ব-বাগ-শ্রেণি:** HID-গণনায় অতিরিক্ত-`]`-সংযোজন (HID-ই ক্লোজিং-বহন-করে → সর্বদা-০) + IIFE-ব্রেস-কাউন্ট মার্কার-মধ্যস্থ-হলে ভুল-শূন্য-বিন্দু — **সেগমেন্ট-শেষ-লাইন `})();`-সমতা-রীতি** ③ **অ্যাঙ্কর-সংঘর্ষ:** সংক্ষিপ্ত-বাংলা-অ্যাঙ্কর একাধিক-কমেন্টে-মিলে (members: স্ট্রিপ-কমেন্ট + JS-কমেন্ট — count=2-FATAL-এ ধরা-পড়ে) → পূর্ণ-প্যাটার্ন-অ্যাঙ্কর-বাধ্যতমূলক।

**পরের-এজেন্ট: session305 (Task ID 145)** — PLANS session304+303+302 পড়ুন; fetch + push-আগে re-fetch+rebase + রিবেজ-পরবর্তী guard:design + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; বাকি-প্রস্তাব: page-count-ব্যাজ (গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), নতুন-ফিল্টার-সারফেস-যোগ-হলে checked-pinned-চেকলিস্ট-প্রয়োগ।
'''

PLANS_NOTE = '''## session304-নোট (cron 403679 — checked-pinned পোর্ট-প্যাক no304/ev304/mm304)
- **ডিসপ্লে-স্তর `@@HID@@`-ক্ষয়-নির্ণয়-চুক্তি (নতুন-শ্রেণি — QA-ব্যয়-রোধ):** Read/Grep-আউটপুটে `[hidden]`-জাতীয় টোকেন `idden]`-রূপে **দৃশ্যমান হতে-পারে** (ফাইল-অক্ষত-থাকলেও) — সন্দেহে প্রথম-কাজ `od -c`-বাইট-যাচাই; **ফাইল-অক্ষত-প্রমাণ-ব্যতীত ফিক্স-নিষিদ্ধ** (session303-এর od-যাচাই-শিক্ষার প্রয়োগ-ক্ষেত্র-বিস্তার — কোড-রিভিউ-পথেও)। সুইট-লেখনীতে `@@HID@@`-আক্ষরিক-রোধ-কৌশল: `'[' + 'h' + 'idden]'`-সংযোজন-গঠন (s298-রীতি)।
- **অ্যাসার্ট-নিজস্ব-বাগ-চুক্তি:** (ক) HID-সহ-সাবস্ট্রিং-গণনায় HID-ই ক্লোজিং-`]`-বহন-করে — বহির্মুখী-`]`-যোগ = সর্বদা-০-মিল (খ) IIFE-আহ্বান-যাচাইয়ে মার্কার যদি IIFE-**মধ্যস্থ** হয়, ব্রেস-কাউন্ট-শূন্য-বিন্দু ভুল-অবস্থানে-পৌঁছায় (আরম্ভ-ডেপথ≠০) — নির্ভরযোগ্য-বিকল্প: মার্কার→`</script>`-সেগমেন্টের **শেষ-অপসারিত-লাইন == `})();`** (স্ট্রিপ-সমতা)।
- **অ্যাঙ্কর-সংঘর্ষ-চুক্তি:** সংক্ষিপ্ত-বাংলা-অ্যাঙ্কর (`── session255:`-জাতীয়) একই-ফাইলের CSS/EJS-কমেন্টেও-মিলতে-পারে (members-এ count=2 — FATAL-এ ধরা-পড়ে, নীরব-ভুল-সেগমেন্ট-রিপ্লেস-হতো-না) → **পূর্ণ-প্যাটার্ন-অ্যাঙ্কর-বাধ্যতমূলক**; FATAL-শ্রেণির মূল্য = প্রমাণিত-আবার।
- **পোর্ট-প্যাক-চুক্তি (checked-pinned পরিবার-সম্প্রসারণ):** একাধিক-সারফেসে এক-ইঞ্জিন-প্যাটার্ন পোর্ট = প্রতি-সারফেস-নেমস্পেস (no304/ev304/mm304) + প্রতি-সারফেস-ফ্ল্যাশ-ক্লাস + সারফেস-নিজস্ব-চিপ-স্কিম-সংরক্ষণ (no/ev=ASCII, mm-ও ASCII) + **grouped-list-বিশেষ-নিয়ম** — সেকশন-অটো-হাইড পিন-সচেতন-করা-বাধ্যতমূলক (পিনড-সারি-বিশিষ্ট সেকশন hidden হলে পিন-গার্ড-অর্থহীন); হুক-বর্ধন = শুধু-যোগ (legacy-সদস্য-অক্ষুণ্ণ — s255/s260-রিগ্রেশন-সবুজ-প্রমাণ)।
- **E2E-ত্রি-মার্কার-সিড-চুক্তি (পুনঃ-প্রয়োগ+রিফ্যাক্টর):** qa304notice/qa304event/qa304member প্রোডাকশন-POST (idempotent — পূর্ব-বিদ্যমানে-পুনঃব্যবহার) + clean_one() রিফ্যাক্টর (প্রতি-আহ্বানে-তাজা-CSRF) + শেষে delete→ট্র্যাহ→bulk-purge **নেট-শূন্য ×৩-অ্যাসার্ট** (ত্রি-পৃষ্ঠা-grep)।
- **পরের-এজেন্ট: session305 থেকে (worklog Task ID 145)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session304 + session303 + session302 পড়ুন; বাকি-প্রস্তাব: page-count-ব্যাজ (গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), নতুন-ফিল্টার-সারফেসে checked-pinned-চেকলিস্ট-প্রয়োগ।

'''

WORKLOG_ENTRY = '''---
Task ID: 144
Agent: Cron agent loop (session304 — Job 403679, trace 202609241419)
Task: checked-pinned পোর্ট-প্যাক (no304/ev304/mm304) + [Mandatory] স্টাইল/ফিচার + সর্ব-রিগ্রেশন + ডক-ত্রয়

Work Log:
- worklog/PLANS/PROJECT পড়ে অবস্থা-যাচাই: HEAD=origin=9da3ff0 (session303-pushed, clean-tree, BEHIND=০)
- agent-browser QA: ত্রি-পৃষ্ঠা 200 + **ঝুঁকি-লাইভ-প্রমাণ** (notices: checked+গার্বেজ-কুয়েরি → rowHidden=true + bulkCount=১; events-এ পুনঃ-প্রমাণ) → session303-প্রস্তাবের পোর্ট-প্যাক-নির্বাচন
- **মিথ্যা-বাগ-তদন্ত:** members.ejs-প্রদর্শিত `:not(idden])`-সদৃশ → od -c → **ফাইল-অক্ষত — ডিসপ্লে-স্তর `@@HID@@`-ক্ষয়** (ফিক্স-নিষিদ্ধ; PLANS-এ নতুন-চুক্তি)
- scripts/s304-patch.py: ত্রি-সারফেস ইঞ্জিন-আপগ্রেড (hit=pinned||match + গণক + change-ডেলিগেশন + boot-apply + Enter-চেকবক্স-অ্যাঙ্কর + ফ্ল্যাশ ৯০০ms + হুক-বর্ধিত রো-শূন্যে-ও) + session304 CSS ×৩ (প্রান্ত+টিন্ট+শিরোনাম-গাঢ় @supports-গেটেড + focus-visible-রিং + ট্রানজিশন + reduced-motion + 640px — হেক্স-শূন্য); mm304-বিশেষ: সেকশন-অটো-হাইড পিন-সচেতন
- প্যাচ-গোটচা ×৩-ডক-কৃত: ডিসপ্লে-ক্ষয়-মিথ্যা-বাগ · HID-গণনা-অতিরিক্ত-`]`/IIFE-ব্রেস-কাউন্ট (শেষ-লাইন-`)();`-রীতিতে-সমাধান) · সংক্ষিপ্ত-অ্যাঙ্কর-সংঘর্ষ (count=2-FATAL → পূর্ণ-প্যাটার্ন)
- tests/s304-suite.sh **৭৪/৭৪ ×৩-ধারাবাহিক** (কাঠামো ×২২ + SSR ×৯ + E2E-no ×১৭ + ev ×৩ + mm ×৪ + এরর-শূন্য ×৩ + নেট-শূন্য পরিষ্কারক ×৩-অ্যাসার্ট)
- রিগ্রেশন: s255 ৩৯/৩৯ + s260 ৫২/৫২ + s303 ৭৫/০/২ + guard:design + audit:views (১২২ ejs) — সর্ব-গ্রিন
- ডক-ত্রয়: PROJECT §৩০৪ + PLANS session304-নোট + repo worklog Task 144 (s304-docs.py idempotent ×২)

Stage Summary:
- ঝুঁকি-নির্মূল: checked-pinned চুক্তি এখন ৬-সারফেস-পরিবারে (pr258/dqf302/re261/lsf298 + **no259/ev260/mm255**)
- প্যাচ/সুইট: scripts/s304-patch.py (idempotent ×N) + tests/s304-suite.sh (৭৪-চেক)
- ডক: PROJECT §৩০৪ + PLANS session304 (গোটচা ×৩) + worklog Task 144; পরের-এজেন্ট session305 (Task ID 145)
'''

PROJECT_BODY = PROJECT_BODY.replace('@@HID@@', HID)
PLANS_NOTE = PLANS_NOTE.replace('@@HID@@', HID)
WORKLOG_ENTRY = WORKLOG_ENTRY.replace('@@HID@@', HID)

fails = []

# ── 1) PROJECT.md: §৩০৪-সন্নিবেশ (§৩০৩-র পূর্বে) ──
p = APP + '/PROJECT.md'
t = open(p, encoding='utf-8').read()
if '## §৩০৪' in t:
    print('SKIP PROJECT §৩০৪ (পূর্ব-বিদ্যমান)')
else:
    anchor = '## §৩০৩'
    if t.count(anchor) != 1:
        fails.append('PROJECT: §৩০৩-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PROJECT_TITLE + '\n' + PROJECT_BODY + '\n' + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PROJECT §৩০৪')

# ── 2) PLANS.md: session304-নোট (session303-নোট-এর পূর্বে) ──
p = APP + '/PLANS.md'
t = open(p, encoding='utf-8').read()
if '## session304-নোট' in t:
    print('SKIP PLANS session304 (পূর্ব-বিদ্যমান)')
else:
    anchor = '## session303-নোট'
    if t.count(anchor) != 1:
        fails.append('PLANS: session303-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PLANS_NOTE + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PLANS session304-নোট')

# ── 3) repo worklog.md: Task 144 সংযোজন (ফাইল-শেষে) ──
p = APP + '/worklog.md'
t = open(p, encoding='utf-8').read()
if 'Task ID: 144' in t:
    print('SKIP worklog Task 144 (পূর্ব-বিদ্যমান)')
else:
    if not t.endswith('\n'):
        t += '\n'
    t2 = t + WORKLOG_ENTRY
    open(p, 'w', encoding='utf-8').write(t2)
    print('APPLIED worklog Task 144')

if fails:
    print('FAILS: ' + '; '.join(fails))
    sys.exit(1)
print('S304-DOCS-GREEN')
