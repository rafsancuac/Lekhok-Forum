#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s274-sandbox-worklog.py — my-project worklog.md আপডেট (Task ID 114 + ACTIVE-LOCK-অগ্রগতি, idempotent)"""
import io, sys

P = '/home/z/my-project/worklog.md'
src = io.open(P, encoding='utf-8').read()

if 'Task ID: 114 (session274 — cron 403679; সুপার-অ্যাডমিন' in src:
    print('SKIP: Task 114 ইতিমধ্যে-উপস্থিত')
    sys.exit(0)

def rep(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n:
        print('FATAL: %s — %r গণনা=%d (প্রত্যাশা=%d)' % (label, old[:60], c, n)); sys.exit(1)
    src = src.replace(old, new, n)
    print('OK:', label)

# ── ACTIVE-LOCK হেড ──
rep('## ⚡ ACTIVE-LOCK (Task ID 113 — worklog-ক্রম max+1; রিপো-লেবেল **session273** — ✅ পুশড 5cfb514 — keeper-401248-PII-পার্জ-force-push-rebased-সহ)',
    '## ⚡ ACTIVE-LOCK (Task ID 114 — worklog-ক্রম max+1; রিপো-লেবেল **session274** — ✅ পুশড 0d0c7bd — keeper-worklog+session206-rebased-সহ)',
    'ACTIVE-LOCK-হেড')

# ── auth লাইন ──
rep('এ-রাউন্ডে push-সফল `7e0b0b3..5cfb514` — feature `3e8ee76` + worklog `5cfb514` (fetch-প্রমাণ: keeper-401248-PII-পার্জ force-push 706-কমিট-রিরাইট + epaper-bot-session273 — `rebase --onto origin/main 2482b76` সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে)',
    'এ-রাউন্ডে push-সফল `a94a6d4..0d0c7bd` — feature `4528a66` + worklog `6fe61a6` (fetch-প্রমাণ: keeper-401248-worklog + session206-গঠনতন্ত্র-ফিচার সন্নিবেশিত — সাধারণ-rebase সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে)',
    'auth-push-hash')
rep('**5cfb514-READY** — dpl_3RFJXKXnvTZhVrCkRKfpVxaDXWRN, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307',
    '**0d0c7bd-READY** — dpl_Fgc6PAssZqKJ8YM1mrugZ4SGoY9w, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307 + admins-gate-307',
    'auth-vercel')

# ── স্টেল-সামারি ×৩৯ → ×৪০ ──
rep('⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৩৯)',
    '⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৪০)',
    'staleness')

# ── নতুন-গোটচা বুলেট + রিপো-অবস্থা ──
rep('- **রিপো-অবস্থা:** origin/main = **`5cfb514`** (session273, ২৩-সেপ্টেম্বর)',
    '- **⚠️ কার্ড-সারফেস-গার্ড-চুক্তি (নতুন — session274):** টেবিল-বিহীন কার্ড-তালিকায় hidden-গার্ড **[data-x-row][hidden]**-অ্যাট্রিবিউট-সিলেক্টর (element-অজ্ঞেয়); রোল-বিভাজক-প্রোব সর্বদা পূর্ণ-জোড়া (\'রোল role এডমিন admin\' — ল্যাটিন-একক-\'admin\' superadmin-এ-ও-মেলে); id-বিহীন-ইনপুট-ফিল্ড-গার্ড = activeElement.name-যাচাই; **সম্পূর্ণ-CRUD-সারফেসে marker-seed-নেট-শূন্য-ই২ই** (add→remove-জোড়া, Location-প্রমাণ, isSelf-কার্ড-বাদ — data-kw-#N-ই-আইডি-উৎস)।\n'
    '- **রিপো-অবস্থা:** origin/main = **`0d0c7bd`** (session274, ২৩-সেপ্টেম্বর)',
    'repo-state')

# ── পরের-এজেন্ট লাইন ──
rep('**পরের-এজেন্ট: session274 (Task ID 114)** — PLANS session273-নোট অবশ্যই-পড়ুন (নেমস্পেস-ভার্সন-সাফিক্স + মান-টোকেন-দ্বিভাষিক + bare-id-অনন্যতা + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব + requireSuperAdmin-ভিউয়ার admin/admin123)',
    '**পরের-এজেন্ট: session275 (Task ID 115)** — PLANS session274-নোট অবশ্যই-পড়ুন (কার্ড-সারফেস-গার্ড + প্রোব-বিচ্ছিন্নতা + id-বিহীন-গার্ড + marker-seed-ই২ই + সিবলিং-সারফেস-নির্বাচন super/dashboard.ejs)',
    'next-agent')

# ── Task 114 রেকর্ড সন্নিবেশ (Task 113-র-আগে) ──
NEW_TASK = """---
Task ID: 114 (session274 — cron 403679; সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার sa274 + কার্ড-সারফেস-বিশেষায়ণ + marker-seed-নেট-শূন্য-ই২ই) — push `0d0c7bd`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`1e0ec8c` (session273/Task113 + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪০:** পুরাতন-যুগ-দাবি — সব-ভুল; ACTIVE-LOCK/রিপো-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s273 ৫৭/৫৭ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (সিবলিং-সারফেস নির্বাচন: super/admins — requireSuperAdmin-গার্ড-ভাগী; পূর্ণ-CRUD-রুট-বিদ্যমান)

## এ-রাউন্ডে সম্পন্ন (session274)
- **[Mandatory-ফিচার] সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার (sa274):** /admin/super/admins — **কার্ড-ভিত্তিক-সারফেস (ফ্যামিলির-প্রথম tr-বিহীন):** div[data-sa-row] + দ্বিভাষিক data-kw (#id + অ্যাডমিন admin + @username + নাম name + রোল role মান-অ্যালায়াসসহ + লকড locked/আনলকড unlocked + 2FA totp + স্কোপ scope কী-তালিকা/সীমাহীন unlimited + যুক্ত added — aScopes-ভিউ-ভেরিয়েবল-পুনঃব্যবহার) + ফিল্টার-স্ট্রিপ (saFilter274/saClear274/saCount274/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (saZero274 data-sa-empty) + 'f'-ফোকাস + field-গার্ড + Escape + __saQA হুক; নতুন-অ্যাডমিন-ফর্ম/স্কোপ-ম্যাক/js-confirm/সেলফ-নোট অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** sa274-ব্লক হেক্স-শূন্য টোকেন-শুধু + hidden-গার্ড ×৩ সঠিক-বাইট ([data-sa-row][hidden] !important — অ্যাট্রিবিউট-সিলেক্টর)
- **marker-seed-নেট-শূন্য-ই২ই (s272-চুক্তি-সম্প্রসারণ):** POST add ×২ (Location saved=admin_add — কার্ড ১→৩) → POST remove ×২ (Location saved=admin_remove) → ids PRE == FINAL (data-kw-#N-নিষ্কাশন — isSelf-কার্ড-বাদেও-সম্পূর্ণ) + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে; role=admin-ই-সিড (self/last-super-গার্ড-এড়ানো)
- **গোটচা ×৩ ডক-কৃত (PLANS session274):** ① কার্ড-সারফেস-গার্ড (অ্যাট্রিবিউট-সিলেক্টর element-অজ্ঞেয়) ② রোল-প্রোব-বিচ্ছিন্নতা ('রোল role এডমিন admin'-পূর্ণ-জোড়া — ল্যাটিন-একক-'admin' superadmin-এ-ও-মেলে) ③ id-বিহীন-ইনপুট-ফিল্ড-গার্ড (activeElement.name); প্লাস প্যাচ-স্তর aScopes-প্রি৫→পোস্ট৭-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি)
- **টেস্ট:** নতুন tests/s274-safilter-suite.sh **৬১/৬১ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×১৭ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৫ পূর্বগণনা-মিল (bare-id '#3' একক / super-রোল ১/৩ / admin-রোল ২/৩ / 'QA-274' নাম ২/৩ / সর্বজনীন ৩/৩) + নো-ম্যাচ→শূন্য + সব-কার্ড-hidden + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড input[name=username] + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য-ই২ই) + পূর্ণ-রিগ্রেশন s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s274-patch.py (idempotent ×২, .sa274--নেমস্পেস-গার্ড, PRESERVE-মানচিত্র, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৩) + ডক ×৩ (PROJECT §২৭৪ + PLANS session274 + repo-worklog Task-114) → পুরাতন-PNG-চার্ন-রিভার্ট → secret-scan-ক্লিন → fetch (keeper+session206-সন্নিবেশ) → **rebase → push `a94a6d4..0d0c7bd`** → Vercel **READY @ 0d0c7bd** (dpl_Fgc6PAss… — BUILDING-গোটচা-মেনে READY-র-পরে-প্রোব) → প্রোড-স্পট home-200 + health-200 + admin-গেট-307 + super-gate-307 + admins-gate-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **প্যারালাল-রাউন্ড-সচেতনতা-বর্ধিত:** keeper-worklog + session206-ফিচার-সহ সমান্তরাল-ক্রিয়াকলাপ-চলমান — push-পূর্ব fetch+rebase-প্রথা (force-push-পুনরাবৃত্তি-হলে `--onto`)
- পরের-এজেন্ট: **session275 লেবেল (worklog Task ID 115)**; PLANS session274-নোট অবশ্যই-পড়ুন (কার্ড-সারফেস-গার্ড + প্রোব-বিচ্ছিন্নতা + id-বিহীন-গার্ড + marker-seed-ই২ই + সিবলিং-নির্বাচন super/dashboard.ejs); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: admin-প্যানেল-সাব-তালিকা (notices/events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড), super/dashboard.ejs (সিবলিং), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = `0d0c7bd` (session274-sa274); working-tree ক্লিন

"""
rep('---\nTask ID: 113 (session273 — cron 403679; সুপার-ইউজার', NEW_TASK + '---\nTask ID: 113 (session273 — cron 403679; সুপার-ইউজার', 'Task-114-রেকর্ড')

io.open(P, 'w', encoding='utf-8').write(src)
print('SANDBOX-WORKLOG-DONE')
