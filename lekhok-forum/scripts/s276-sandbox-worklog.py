#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s276-sandbox-worklog.py — my-project worklog.md আপডেট (Task ID 116 + ACTIVE-LOCK-অগ্রগতি, idempotent)"""
import io, sys

P = '/home/z/my-project/worklog.md'
src = io.open(P, encoding='utf-8').read()

if 'Task ID: 116 (session276 — cron 403679; অ্যাডমিন বিজ্ঞপ্তি' in src:
    print('SKIP: Task 116 ইতিমধ্যে-উপস্থিত')
    sys.exit(0)

def rep(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n:
        print('FATAL: %s — %r গণনা=%d (প্রত্যাশা=%d)' % (label, old[:60], c, n)); sys.exit(1)
    src = src.replace(old, new, n)
    print('OK:', label)

# ── ACTIVE-LOCK হেড ──
rep('## ⚡ ACTIVE-LOCK (Task ID 115 — worklog-ক্রম max+1; রিপো-লেবেল **session275** — ✅ পুশড 746e087 — session226-epaper-parallel-rebased-সহ)',
    '## ⚡ ACTIVE-LOCK (Task ID 116 — worklog-ক্রম max+1; রিপো-লেবেল **session276** — ✅ পুশড f8915ee — constitution-v2-parallel-rebased-সহ)',
    'ACTIVE-LOCK-হেড')

# ── auth লাইন ──
rep('এ-রাউন্ডে push-সফল `a89cf8d..746e087` — feature `fc7ad06` + worklog `746e087` (fetch-প্রমাণ: session-226-epaper-dual-view সাধারণ-অগ্রগতি 0da017a→a89cf8d — সাধারণ-rebase সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে + পুশ-পূর্ব s275-পুনঃযাচাই ৮২/৮২)',
    'এ-রাউন্ডে push-সফল `60315d3..f8915ee` — fix `db10ddb` + feature `1bc3626` + worklog `f8915ee` (fetch-প্রমাণ: constitution-v2-দ্বৈত-কমিট 0cce6a2+60315d3 সাধারণ-অগ্রগতি — সংঘর্ষ-শূন্য ৩-কমিট-রিপ্লে + **রিবেজ-পরবর্তি guard:design-পুনঃরান-গ্রিন + s276-পুনঃযাচাই ৫৯/৫৯**)',
    'auth-push-hash')
rep('**746e087-READY** — dpl_CkuKsyUDgGFXF9rUkcWjWwJetprS, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307',
    '**f8915ee-READY/PROMOTED** — dpl_yhtLsD2hMW5jCJwftfA8A2z98qif, meta.githubCommitSha-প্রমাণিত; **webhook-miss-গোটচা: git-push-ওয়েবহুক-মিস (১০মি+-নীরব) → API-manual-deploy (v13 POST gitSource)**; প্রোড live-200 + health-200 + admin-গেট-307 + notices-গেট-307 + super-gate-307',
    'auth-vercel')

# ── স্টেল-সামারি ×৪১ → ×৪২ ──
rep('⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৪১)',
    '⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৪২)',
    'staleness')

# ── নতুন-গোটচা বুলেট + রিপো-অবস্থা-হ্যাশ ──
rep('- **রিপো-অবস্থা:** origin/main = **`746e087`** (session275, ২৩-সেপ্টেম্বর)',
    '- **⚠️ broadcast-সাইড-এফেক্ট + parallel-গার্ড-মিস + webhook-miss-চুক্তি (নতুন — session276):** CRUD-থাকলেও create-রুট broadcastToAll/newsletter-queue করলে marker-seed-ই২ই-নিষিদ্ধ → mo268-রিড-ওনলি-ই-সঠিক (seed-বাছাইের-আগে create-রুট-সাইড-এফেক্ট-ম্যাপ); **রিবেজ-পরবর্তি guard:design-পুনঃরান-বাধ্যতমূলক** (s226-কমিটে epaper.css হেক্স ৪৭ ratchet-ভাঙা রাউন্ড-শুরু-গার্ডে-মিস-হয়েছিল — epaperfix দ্বারা ৪৭→০ সংশোধিত); git-push-ওয়েবহুক-মিসে API-manual-deploy (`POST /v13/deployments` gitSource) — PROMOTED-প্রমাণসহ।\n'
    '- **রিপো-অবস্থা:** origin/main = **`f8915ee`** (session276, ২৩-সেপ্টেম্বর)',
    'repo-state')

# ── পরের-এজেন্ট লাইন ──
rep('**পরের-এজেন্ট: session276 (Task ID 116)** — PLANS session275-নোট অবশ্যই-পড়ুন (li-সারফেস-গার্ড + দ্বৈত-স্ট্রিপ-চুক্তি + আইকন ×১-প্রতি-নতুন + রিড-ওনলি-ড্যাশবোর্ড-সীমা + সিবলিং-সারফেস-নির্বাচন super/settings.ejs)',
    '**পরের-এজেন্ট: session277 (Task ID 117)** — PLANS session276-নোট অবশ্যই-পড়ুন (broadcast-চুক্তি + s269-রেন্ডার্ড-গণনা-পুনঃপ্রমাণ + parallel-গার্ড-মিস + webhook-miss + সারফেস-নির্বাচনে-প্রথমে-ভিউ-পরিদর্শন — admin-সাব-তালিকা-অবশিষ্ট events/gallery/members/resources)',
    'next-agent')

# ── Task 116 রেকর্ড সন্নিবেশ (Task 115-র-আগে) ──
NEW_TASK = """---
Task ID: 116 (session276 — cron 403679; অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার an276 + epaper hex-ratchet-বাগ-ফিক্স + broadcast-সচেতন-চুক্তি) — push `f8915ee`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`99db47c` (session275/Task115-জোড়া + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪২:** পুরাতন-যুগ-দাবি — সব-ভুল; ACTIVE-LOCK/রিপো-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s275 ৮২/৮২ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (সারফেস-নির্বাচন-বিবর্তন: প্রস্তাবিত-সিবলিং super/settings.ejs + support-settings.ejs পরিদর্শনে **ফর্ম/সার্চ-পৃষ্ঠা-প্রমাণ — তালিকা-নেই** → admin-notices-তালিকা নির্বাচন)

## এ-রাউন্ডে সম্পন্ন (session276)
- **[বাগ-ফিক্স] epaper.css hex-ratchet-সংশোধন (s226-অবদান — রাউন্ড-মাঝে-আবিষ্কৃত):** guard:design-১-লঙ্ঘন (epaper.css হেক্স ০→৪৭, baseline ০ — parallel session-226-কমিটে); **মূল-কারণ: ৫টি lf-টোকেন (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow) tokens.css-এ-ই-অনুপস্থিত — ইনলাইন-ফলব্যাক-লোড-বেয়ারিং ছিল**; ফিক্স: tokens.css-টোকেন ×৬ সংযোজন (--lf-ink→fb-ink, --lf-ink-mute→text-tertiary, --lf-ink-soft #4B4C4F, --lf-accent-soft→accent-soft, --lf-accent-glow→accent-glow, --lf-gold-badge #E8A700) + হেক্স-ফলব্যাক-স্ট্রিপ ×৪৩ + rgba-ফলব্যাক-স্ট্রিপ ×৮ + কাঁচা-হেক্স→টোকেন ×৪ → **৪৭→০** (baseline-অক্ষুণ্ণ); computed-প্যারিটি (is-active bg rgb(0,106,78)/color rgb(255,255,255)); epaper ২০০; idempotent ×২; var-গণনা-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত)
- **[Mandatory-ফিচার] অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার (an276):** /admin/notices — tr[data-an-row] + দ্বিভাষিক data-kw (#id+বিজ্ঞপ্তি notice+শিরোনাম title+ক্যাটাগরি category+তারিখ date — নরমালাইজড ×৩) + ফিল্টার-স্ট্রিপ (anFilter276/anClear276/anCount276/kbd-hint — always-rendered) + চিপ + শূন্য-অবস্থা (anZero276) + 'f'-ফোকাস (একক-স্ট্রিপ) + ফিল্ড-গার্ড (bulk_ids-checkbox) + Escape + __anQA হুক — পৃষ্ঠায়-প্রথম <script> (addEventListener ০→৪); bulk-bar/CRUD-রুট অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** an276-amber-পরিবার হেক্স-শূন্য টোকেন-শুধু + hidden-গার্ড ×৩ সঠিক-বাইট (tr[data-an-row][hidden] !important)
- **রিড-ওনলি-নেট-শূন্য-চুক্তি (mo268 — broadcast-সচেতন):** POST /admin/notices broadcastToAll + newsletter-queue করে → marker-seed-নিষিদ্ধ; নেট-প্রমাণ সারি ৬→৬ + প্রোব-অবশেষ-শূন্য
- **গোটচা ×৩+২ ডক-কৃত (PLANS session276):** ① broadcast-সাইড-এফেক্ট-চুক্তি (seed-বাছাইের-আগে create-রুট-সাইড-এফেক্ট-ম্যাপ) ② s269-গোটচা-পুনঃপ্রমাণ (sidebar-included bulk-JS-ref — data-bulk-all রেন্ডার্ড ×৩/data-bulk-msg ×৫ — সঠিক-প্যাটার্ন-অ্যাসার্ট) ③ parallel-রাউন্ড-গার্ড-মিস (রিবেজ-পরবর্তি guard:design-পুনঃরান) ④ webhook-miss (API-manual-deploy v13 POST gitSource — PROMOTED-প্রমাণ) ⑤ forEach-অ্যাসার্ট-প্রথম-রানে-ধরা (rows.forEach +১ — in-memory-ফেল)
- **টেস্ট:** নতুন tests/s276-anfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক (SKIP=০)** + রিবেজ-পরবর্তি-পুনঃযাচাই ৫৯/৫৯ (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×২২ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৫ (bare-id '#6'/শিরোনাম-একক 'নতুন'/press ২/৬/event ১/৬/সর্বজনীন ৬/৬+চিপ) + নো-ম্যাচ→শূন্য + computed-display:none + শূন্য-বক্স-বিপরীত-প্রমাণ + clear-পুনরুদ্ধার + চিপ-ত্রয়ী + 'f'-ফোকাস + ফিল্ড-গার্ড + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s275 ৮২/৮২ + s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design-গ্রিন-পুনঃপ্রমাণ + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s276-patch.py + scripts/s276-epaperfix.py (উভয় idempotent ×২) + ডক ×৩ (PROJECT §২৭৬ + PLANS session276 + repo-worklog Task-116) → secret-scan-ক্লিন → fetch (constitution-v2-দ্বৈত-কমিট) → **rebase → রিবেজ-পরবর্তি guard+suite-পুনঃযাচাই → push `60315d3..f8915ee`** → **webhook-miss → API-manual-deploy → READY/PROMOTED @ f8915ee** (dpl_yhtLsD2h…) → প্রোড-স্পট live-200 + health-200 + admin-307 + notices-307 + super-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session277 লেবেল (worklog Task ID 117)**; PLANS session276-নোট অবশ্যই-পড়ুন (broadcast-চুক্তি + রেন্ডার্ড-গণনা-পুনঃপ্রমাণ + parallel-গার্ড-মিস + webhook-miss + সারফেস-নির্বাচনে-প্রথমে-ভিউ-পরিদর্শন); push-আগে fetch+rebase + রিবেজ-পরবর্তি guard:design-পুনঃরান
- বাকি-প্রস্তাব: admin-সাব-তালিকা-অবশিষ্ট (events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড; notices-সম্পন্ন an276), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = `f8915ee` (session276-জোড়া: fix + feature + worklog); working-tree ক্লিন

"""
rep('---\nTask ID: 115 (session275 — cron 403679; সুপার-এডমিন ড্যাশবোর্ড', NEW_TASK + '---\nTask ID: 115 (session275 — cron 403679; সুপার-এডমিন ড্যাশবোর্ড', 'Task-116-রেকর্ড')

io.open(P, 'w', encoding='utf-8').write(src)
print('SANDBOX-WORKLOG-DONE')
