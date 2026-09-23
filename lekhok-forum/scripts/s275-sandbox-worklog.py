#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s275-sandbox-worklog.py — my-project worklog.md আপডেট (Task ID 115 + ACTIVE-LOCK-অগ্রগতি, idempotent)"""
import io, sys

P = '/home/z/my-project/worklog.md'
src = io.open(P, encoding='utf-8').read()

if 'Task ID: 115 (session275 — cron 403679; সুপার-এডমিন ড্যাশবোর্ড' in src:
    print('SKIP: Task 115 ইতিমধ্যে-উপস্থিত')
    sys.exit(0)

def rep(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n:
        print('FATAL: %s — %r গণনা=%d (প্রত্যাশা=%d)' % (label, old[:60], c, n)); sys.exit(1)
    src = src.replace(old, new, n)
    print('OK:', label)

# ── ACTIVE-LOCK হেড ──
rep('## ⚡ ACTIVE-LOCK (Task ID 114 — worklog-ক্রম max+1; রিপো-লেবেল **session274** — ✅ পুশড 0d0c7bd — keeper-worklog+session206-rebased-সহ)',
    '## ⚡ ACTIVE-LOCK (Task ID 115 — worklog-ক্রম max+1; রিপো-লেবেল **session275** — ✅ পুশড 746e087 — session226-epaper-parallel-rebased-সহ)',
    'ACTIVE-LOCK-হেড')

# ── auth লাইন ──
rep('এ-রাউন্ডে push-সফল `a94a6d4..0d0c7bd` — feature `4528a66` + worklog `6fe61a6` (fetch-প্রমাণ: keeper-401248-worklog + session206-গঠনতন্ত্র-ফিচার সন্নিবেশিত — সাধারণ-rebase সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে)',
    'এ-রাউন্ডে push-সফল `a89cf8d..746e087` — feature `fc7ad06` + worklog `746e087` (fetch-প্রমাণ: session-226-epaper-dual-view সাধারণ-অগ্রগতি 0da017a→a89cf8d — সাধারণ-rebase সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে + পুশ-পূর্ব s275-পুনঃযাচাই ৮২/৮২)',
    'auth-push-hash')
rep('**0d0c7bd-READY** — dpl_Fgc6PAssZqKJ8YM1mrugZ4SGoY9w, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307 + admins-gate-307',
    '**746e087-READY** — dpl_CkuKsyUDgGFXF9rUkcWjWwJetprS, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307',
    'auth-vercel')

# ── স্টেল-সামারি ×৪০ → ×৪১ ──
rep('⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৪০)',
    '⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৪১)',
    'staleness')

# ── নতুন-গোটচা বুলেট + রিপো-অবস্থা-হ্যাশ ──
rep('- **রিপো-অবস্থা:** origin/main = **`0d0c7bd`** (session274, ২৩-সেপ্টেম্বর)',
    '- **⚠️ li-সারফেস-গার্ড + দ্বৈত-স্ট্রিপ-এক-রাউন্ডে-চুক্তি (নতুন — session275):** ul/li-তালিকায় hidden-গার্ড **[data-x-row][hidden]**-অ্যাট্রিবিউট-সিলেক্টর (!important — ov-list/recent-list-র display:flex অতিক্রমকারী); সুইটে computed-display:none-অ্যাসার্ট = গার্ড-প্রমাণের সর্বোচ্চ-স্তর; **দ্বৈত-স্ট্রিপ এক-রাউন্ডে:** \'f\'-page-listener শুধু-প্রথম (sd275), দ্বিতীয় (se275) স্বাধীন + দ্বিতীয়-ইনপুট-ই-ফিল্ড-গার্ড-প্রোব (id-বিহীন → activeElement.id); **আইকন ×১-প্রতি-নতুন-প্রতি-পৃষ্ঠা** (দুই-স্ট্রিপে আইকন-বৈচিত্র্য-বাধ্যতমূলক); aria-label-গণনা = স্ট্রিপ × উপাদান (দ্বৈতে +৪); রিড-ওনলি-ড্যাশবোর্ডে curl-পূর্বগণনা শুধু-অলাইভ-তালিকা-না-হলে (activity/audit-ফিল্টারে domcount s271-চুক্তি বাধ্যতমূলক হবে)।\n'
    '- **রিপো-অবস্থা:** origin/main = **`746e087`** (session275, ২৩-সেপ্টেম্বর)',
    'repo-state')

# ── পরের-এজেন্ট লাইন ──
rep('**পরের-এজেন্ট: session275 (Task ID 115)** — PLANS session274-নোট অবশ্যই-পড়ুন (কার্ড-সারফেস-গার্ড + প্রোব-বিচ্ছিন্নতা + id-বিহীন-গার্ড + marker-seed-ই২ই + সিবলিং-সারফেস-নির্বাচন super/dashboard.ejs)',
    '**পরের-এজেন্ট: session276 (Task ID 116)** — PLANS session275-নোট অবশ্যই-পড়ুন (li-সারফেস-গার্ড + দ্বৈত-স্ট্রিপ-চুক্তি + আইকন ×১-প্রতি-নতুন + রিড-ওনলি-ড্যাশবোর্ড-সীমা + সিবলিং-সারফেস-নির্বাচন super/settings.ejs)',
    'next-agent')

# ── Task 115 রেকর্ড সন্নিবেশ (Task 114-র-আগে) ──
NEW_TASK = """---
Task ID: 115 (session275 — cron 403679; সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার sd275+se275 + li-সারফেস-বিস্তার + রিড-ওনলি-নেট-শূন্য) — push `746e087`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`0da017a` (session274/Task114 + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪১:** পুরাতন-যুগ-দাবি (Task43/'commit-হয়নি'/device-flow/'২০-ট্রিগার-ব্যাকলগ') — সব-ভুল; ACTIVE-LOCK/রিপো-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s274 ৬১/৬১ (SKIP=০) + role-policy ২৬০/২৬০ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (session274-সিবলিং-নির্বাচন গৃহীত: super/dashboard.ejs — দ্বৈত-তালিকা-সারফেস → দ্বৈত-স্ট্রিপ)

## এ-রাউন্ডে সম্পন্ন (session275)
- **[Mandatory-ফিচার] সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার (sd275+se275):** /admin/super — **sd275 = তদারকি-স্কোপধারী মডারেটর তালিকা** (li[data-sd-row] + দ্বিভাষিক data-kw (#id+মডারেটর moderator+@username+নাম name+তদারকি oversight user_mgmt+শেষ লগইন — নরমালাইজড) + স্ট্রিপ (sdFilter275/sdClear275/sdCount275/kbd-hint — conditional-বাইরে always-rendered) + চিপ + শূন্য-অবস্থা sdZero275); **se275 = অ্যাডমিন অ্যাকাউন্ট সারসংক্ষেপ** (li[data-se-row] + data-kw (#id+অ্যাডমিন admin+@username+নাম name+রোল role মান-অ্যালায়াস (সুপার-এডমিন superadmin/এডমিন admin)+লকড locked/আনলকড unlocked+শেষ লগইন) + স্ট্রিপ + চিপ + শূন্য-অবস্থা seZero275); **'f'-একক-মালিকানা (s269)** — page-listener শুধু sd275; ফিল্ড-গার্ড-প্রোব = seFilter275 (id-বিহীন — activeElement.id); __sdQA/__seQA হুক; Escape ×২-স্বাধীন; সাইট-স্ট্যাটাস/মেইনটেন্যান্স-ফর্ম/stat-box ×৮/ov-chain/লগ-দুই-কলাম অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** sd275-ভায়োলেট-পরিবার (var(--lf-violet-600/-deep/-soft/-soft-2)) + se275-ব্লু-পরিবার (var(--lf-blue-600/-800/-soft/-soft-2)) — উভয় হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion + 640px) + hidden-গার্ড ×৫ সঠিক-বাইট (**[data-sd-row][hidden],[data-se-row][hidden] { display:none !important } — li-সারফেসে-ও অ্যাট্রিবিউট-সিলেক্টর**)
- **রিড-ওনলি-নেট-শূন্য-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-প্রমাণ sd ২→২ + se ১→১ (ids PRE == FINAL) + প্রোব-অবশেষ-শূন্য
- **গোটচা ×৩ ডক-কৃত (PLANS session275):** ① li-গার্ড ([data-x-row][hidden] + computed-display:none-অ্যাসার্ট — গার্ড-প্রমাণের সর্বোচ্চ-স্তর + শূন্য-বক্স-বিপরীত-প্রমাণ) ② দ্বৈত-স্ট্রিপ-এক-রাউন্ডে ('f'-একক-মালিকানা + fokus-দ্বন্দ্ব-শূন্য + দ্বিতীয়-ইনপুট-ই-ফিল্ড-গার্ড-প্রোব + aria-label +৪-**প্রথম-রানে +২-মিথ্যা-অ্যাসার্ট-ধরা — in-memory-ফেল, ফাইল-অলিখিত, প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ**) ③ আইকন ×১-প্রতি-নতুন (দুই-স্ট্রিপে আইকন-বৈচিত্র্য: fa-filter/fa-magnifying-glass/fa-times/fa-xmark/fa-filter-circle-xmark/fa-circle-xmark — প্রতিটি ×১-অ্যাসার্ট)
- **টেস্ট:** নতুন tests/s275-sdfilter-suite.sh **৮২/৮২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১২ + আচরণ ×৩১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৬ (sd '#52' একক + sd '@moderator' একক + 'তদারকি oversight' ২/২ + se '@admin' একক + 'সুপার-এডমিন superadmin' ১/১ + se '#1') + নো-ম্যাচ→শূন্য ×২ + computed-display:none-গার্ড-প্রমাণ + শূন্য-বক্স-বিপরীত-প্রমাণ + clear-পুনরুদ্ধার ×২ + চিপ-ত্রয়ী + 'f'-একক-মালিকানা + fokus-দ্বন্দ্ব-শূন্য + ফিল্ড-গার্ড + Escape ×২ + দ্বৈত-সহ-অস্তিত্ব + স্কোপ-বিচ্ছিন্নতা + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট ×১৫ + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s275-patch.py (idempotent ×২, দ্বি-নেমস্পেস-গার্ড, আইকন-প্রি-গার্ড ×৫, PRESERVE-মানচিত্র (forEach ৬→৮, addEventListener ১→৮, aria-label +৪), হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৫) + ডক ×৩ (PROJECT §২৭৫ + PLANS session275 + repo-worklog Task-115) → পুরাতন-PNG-চার্ন-রিভার্ট → secret-scan-ক্লিন → fetch (**session-226-parallel-অগ্রগতি 0da017a→a89cf8d আবিষ্কৃত**) → **rebase → push `a89cf8d..746e087`** → পুশ-পূর্ব s275-পুনঃযাচাই ৮২/৮২ → Vercel **READY @ 746e087** (dpl_CkuKsyUD… — READY-র-পরেই-প্রোব) → প্রোড-স্পট home-200 + health-200 + admin-গেট-307 + super-gate-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **প্যারালাল-রাউন্ড-আবার-প্রমাণিত:** session-226 (epaper dual view) push-চলাকালীন-অগ্রগতি — push-পূর্ব fetch+rebase-প্রথা আবার-কার্যকর (সাধারণ-advance — `--onto`-প্রয়োজন-হয়নি)
- পরের-এজেন্ট: **session276 লেবেল (worklog Task ID 116)**; PLANS session275-নোট অবশ্যই-পড়ুন (li-গার্ড + দ্বৈত-স্ট্রিপ-চুক্তি + আইকন ×১ + রিড-ওনলি-সীমা + aria-label-গণনা + সিবলিং-নির্বাচন super/settings.ejs); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: super/settings.ejs + super/support-settings.ejs (সিবলিং), admin-সাব-তালিকা (notices/events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = `746e087` (session275-sd275+se275); working-tree ক্লিন

"""
rep('---\nTask ID: 114 (session274 — cron 403679; সুপার-অ্যাডমিন', NEW_TASK + '---\nTask ID: 114 (session274 — cron 403679; সুপার-অ্যাডমিন', 'Task-115-রেকর্ড')

io.open(P, 'w', encoding='utf-8').write(src)
print('SANDBOX-WORKLOG-DONE')
