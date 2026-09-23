#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s272-sandbox-worklog.py — my-project worklog.md আপডেট (Task ID 112 + ACTIVE-LOCK-অগ্রগতি)"""
import io, sys

P = '/home/z/my-project/worklog.md'
src = io.open(P, encoding='utf-8').read()

if 'Task ID: 112 (session272 — cron 403679; রিভিশন-হিস্ট্রি' in src:
    print('SKIP: Task 112 ইতিমধ্যে-উপস্থিত')
    sys.exit(0)

def rep(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n:
        print('FATAL: %s — %r গণনা=%d (প্রত্যাশা=%d)' % (label, old[:50], c, n)); sys.exit(1)
    src = src.replace(old, new, n)
    print('OK:', label)

# ── ACTIVE-LOCK হেড ──
rep('## ⚡ ACTIVE-LOCK (Task ID 111 — worklog-ক্রম max+1; রিপো-লেবেল **session271** — ✅ পুশড dbbfba3)',
    '## ⚡ ACTIVE-LOCK (Task ID 112 — worklog-ক্রম max+1; রিপো-লেবেল **session272** — ✅ পুশড 4aa7331 — সমান্তরাল keeper-401248-rebased-সহ)',
    'ACTIVE-LOCK-হেড')

# ── auth লাইন ──
rep('এ-রাউন্ডে push-সফল `bd283e8..dbbfba3` — feature `bdec9b4` + worklog `dbbfba3`',
    'এ-রাউন্ডে push-সফল `0f9eeed..4aa7331` — feature `5673635` + worklog `4aa7331` (fetch-প্রমাণ: সমান্তরাল keeper-401248-অডিট-রাউন্ড `032b13e..0f9eeed` সন্নিবেশিত — ফাইল-সেট-বিচ্ছিন্ন, সংঘর্ষ-শূন্য rebase)',
    'auth-push-hash')
rep('**dbbfba3-READY** — dpl_9jBfh… + dpl_HQXNR…',
    '**4aa7331-READY** — dpl_71meRV8yVYSzx9LomEg2GeC8y7Lq',
    'auth-vercel')

# ── স্টেল-সামারি ×৩৭ → ×৩৮ (ACTIVE-LOCK-অংশে) ──
rep('⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৩৭)',
    '⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৩৮)',
    'staleness')

# ── Task 112 রেকর্ড সন্নিবেশ (Task 111-র আগে) ──
NEW_TASK = """---
Task ID: 112 (session272 — cron 403679; রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার ch272 + রিভিশন-ডিলিট-ফিচার + marker-seed-নেট-শূন্য-চুক্তি) — push `4aa7331`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`dbbfba3` (session271/Task111) → রাউন্ড-শেষে **rebase-সহ push `0f9eeed..4aa7331`** (feature `5673635` + worklog `4aa7331`), working-tree ক্লিন, টোকেন-ভ্যালিদ, Vercel READY @ 4aa7331 (dpl_71meRV… — BUILDING-গোটচা-মেনে READY-র-পরে-প্রোব), প্রোড live-200 + health-200 + admin-গেট-307 + content-history-গেট-307; device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৩৮:** এ-রাউন্ডের কনটেক্সট-সামারি আবার 'Task43-হারানো/device-flow-মেয়াদোত্তীর্ণ/১৮-ট্রিগার-ব্যাকলগ' দেখিয়েছিল — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য
- **সমান্তরাল-রাউন্ড-সংঘর্ষ-ব্যবস্থাপনা (প্রথম-বাস্তব-ঘটনা):** push-পূর্ব fetch-এ origin অগ্রগতি `dbbfba3..0f9eeed` ধরা পড়ে (keeper-401248-অডিট-রাউন্ড — sitemap/301/PII-ফিক্স, নিজেকেও 'session272'-বলেছে) → **fetch+rebase-বাধ্যতমূলক-প্রথা-কার্যকর** — ফাইল-সেট-বিচ্ছিন্ন হওয়ায় সংঘর্ষ-শূন্য rebase; worklog-এ দুই-রেকর্ড-সহ-অস্তিত্ব (keeper-401248 + আমার Task 112) — শিরোনাম-কনটেন্ট-দ্বারা-বিচ্ছিন্ন
- রাউন্ড-শুরু QA: s271 ৫৮/৫৮ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session271-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — content-history সারফেস; requireAdmin → testadmin-ভিউয়ার)

## এ-রাউন্ডে সম্পন্ন (session272)
- **[Mandatory-ফিচার] রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার (ch272):** /admin/content/history (admin/views/admin/content-history.ejs — key-অনুসন্ধিত-ভিউয়ার; নো-কী = খালি-সারফেস-ই-স্বাভাবিক) — সারি-সারফেস tr data-ch-row (forEach-(r, chI272)) + দ্বিভাষিক data-kw (#id-একক-প্রোব + রিভিশন revision + সংস্করণ version + সময় time + saved_at + ব্যবহারকারী user + saved_by + পুরনো-মান oldvalue slice-220-whitespace-নরমালাইজড + ফেরত restore + মুছুন delete) + ফিল্টার-স্ট্রিপ (chFilter272/chClear272/chCount272/kbd-hint — always-rendered card-বাইরে, নো-কী-সারফেসেও) + কাউন্ট-চিপ + শূন্য-অবস্থা (chZero272 data-ch-empty) + 'f'-ফোকাস (একক-স্ট্রিপ) + field-গার্ড + Escape-ক্লিয়ার+ব্লার + __chQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — **নো-কী-সারফেসে হুক+'f'-জীবিত সুইট-প্রমাণ**); key-select/restore-ফর্ম/thead/subtitle/empty-ব্রাঞ্চ/sidebar অক্ষুণ্ণ
- **[Mandatory-ফিচার] রিভিশন-ডিলিট (নতুন-রাউট):** POST /admin/content/history/delete (requireAdmin → SELECT → DELETE → TA42.audit 'revision-delete'/'content_revisions' → redirect ?key=&saved=1) + প্রতি-সারি delete-ফর্ম (btn-danger + fa-trash + ch-del272 — restore-ফর্মের-পাশে ch-act272 flex-জোড়া; th-প্রস্থ ১১০→১৩২px); sidebar-csrf-ইনজেক্টর-আচ্ছাদিত (meta[name=csrf-token] + form-prepend-hidden — main.js-প্যাটার্ন; curl-স্তরে x-csrf-token-হেডার); **হিস্ট্রি-পরিচর্যা-ক্ষমতা** (ব্যবহারকারী অপ্রয়োজনীয় পুরনো-সংস্করণ মুছবে) + সুইটের delete-ই২ই-পথ
- **[Mandatory-স্টাইল]:** ch272-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-ch-row][hidden] !important) — প্যাচ-পোস্ট-অ্যাসার্ট + suite-containsF দ্বি-প্রমাণ
- **[marker-seed-নেট-শূন্য-চুক্তি (নতুন)]:** content_revisions-এ ব্যবহারযোগ্য-ডিলিট-API-নেই-ছিল → **নতুন delete-ফিচার-ই-সুইট-ক্লিনার**: seed = POST /admin/content (multipart -F + x-csrf-token-হেডার) ×২ (old→new; save#1 = rev(X0) X0-নন-নাল-হলে; save#2 = rev(old) অবিশ্বযোগ্যভাবে) → টেস্ট-উইন্ডো → settings-পুনরুদ্ধার = restore(BASE_REV) (X0-সঠিক-ফেরত; BASE_REV-শূন্য-হলে save('') — ডিফল্ট-রেন্ডার-সমতুল্য) → revisions-পুনরুদ্ধার = নতুন-ids-সব delete-ই২ই → **নেট-শূন্য-প্রমাণ (ids PRE == FINAL — ০→০ দ্বি-প্রমাণিত) + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (s267-প্রথা)**
- **গোটচা ×৩ ডক-কৃত (PLANS session272):** ① **ensure-server-লাইভ-প্রসেস-রি-লোড-শূন্য** (routes.js-সম্পাদনার-পরে kill-ব্যতীত নতুন-রাউট-লোড-হয়-না → unmatched-POST → 404-handler `/?saveerr=1` **303-রূপে** — HTTP-কোড-শুধু-চেক মিথ্যা-পাস; **Location-হেডার-যাচাই বাধ্যতমূলক** (`saved=1` সফল; `saveerr=1`/`csrf=1`/`error=1` ব্যর্থ — সব-ই 303); প্রথম-রানে delete-"সফল"-কিন্তু-DB-অস্পৃষ্ট ২-ফেল → kill+রিস্টার্ট → ফিক্স → ৭২/৭২) ② **লগইন-পরবর্তী GET /admin/login রিডাইরেক্ট** (মেটা-টোকেন-শূন্য → x-csrf-token-শূন্য → ?csrf=1 — টোকেন-উৎস সর্বদা প্রথম-লগইন-GET-ই) ③ rev_id-প্রতি-সারি ×২ (restore+delete-ফর্ম — id-নিষ্কাশনে sort -u বাধ্যতমূলক); প্লাস প্যাচ-স্তর PRESERVE-ফ্যান্টম-দ্বি-গোটচা (rows.forEach JS-ফ্যান্টম ×২ + content_revisions-audit-ফ্যান্টম ×১২ — FATAL-প্রথম-রানে-ধরা, ফাইল-অলিখিত — প্যাচ-সুরক্ষা-চুক্তি-পুনঃপ্রমাণিত)
- **টেস্ট:** নতুন tests/s272-chfilter-suite.sh **৭২/৭২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১১ + আচরণ ×২১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৭ — নির্ধারক-প্রোব ×৪ ('#rev'-id-একক / marker-value / testadmin-actor / 'রিভিশন revision'-সর্বজনীন) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড-প্রমাণ + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস (cancelable:true) + **ফিল্ড-গার্ড-প্রোব select[name=key]-থেকে-f** + Escape-ব্লার + **নো-কী-সারফেসে হুক-জীবিত + 'f'-কার্যকর (ac265-শূন্য-সারফেস-চুক্তি-প্রমাণ)** + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + delete-ই২ই ২/২ + restore-ই২ই + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s272-patch.py (skip-if-present idempotent — ৭-সম্পাদনা view ×৬ + routes ×১, SKIP-পুনঃরান-প্রমাণ, .ch--নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (**সিলেক্টর-বাউন্ড regex** `\\.ch-[a-z]` — attach-ch-সাবস্ট্রিং-২২-মিথ্যা-পজিটিভ-নিরাপদ) + টোকেন-গার্ড ×৭, সংরক্ষণ প্রি/পোস্ট ×১৩+×১৬ অ্যাসার্ট, সঠিক-বাইট ×৭ + হেক্স-শূন্য-পোস্ট-অ্যাসার্ট) + ডক ×২ (PROJECT §২৭২ + PLANS session272) → পুরাতন-PNG-চার্ন-রিভার্ট ×৯ (session269-প্রথা) → secret-scan-ক্লিন → fetch (origin-অগ্রগতি-সনাক্ত) → **rebase → push `0f9eeed..4aa7331`** → Vercel **READY @ 4aa7331** (dpl_71meRV… — QUEUED→READY-পোলিং, BUILDING-গোটচা-মেনে READY-র-পরে-প্রোব) → প্রোড-স্পট home-200 + health-200 + admin-গেট-307 + content-history-গেট-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **সমান্তরাল-রাউন্ড-সচেতনতা-বর্ধিত:** keeper-401248-জাতীয় এক্সটার্নাল-অডিট-রাউন্ড-ও cron-চক্রে-প্রবেশ করতে-পারে — push-পূর্ব fetch+rebase + **লেবেল-সংঘর্ষে (দুই-রাউন্ড-এক-নাম-দাবি) শিরোনাম-কনটেন্ট-দ্বারা-বিচ্ছিন্ন + রিলে-নোট** (session105 ×২-প্রথার পুনরাবৃত্তি)
- পরের-এজেন্ট: **session273 লেবেল (worklog Task ID 113)**; PLANS session272-নোট অবশ্যই-পড়ুন (ensure-server-রি-লোড-গোটচা + Location-যাচাই + csrf-টোকেন-উৎস + marker-seed-নেট-শূন্য-চুক্তি + PRESERVE-ফ্যান্টম); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (security.ejs-স্কোপ-ম্যাপ-পূর্বক; super-users-প্রার্থী; trash-দ্বিতীয়-পাস), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
- রিমোট main = `4aa7331` (session272-ch272 — keeper-401248-সহ); working-tree ক্লিন

"""
anchor = '---\nTask ID: 111 (session271 — cron 403679; অ্যাক্টিভিটি লগ তাৎক্ষণিক-ফিল্টার av271) — push `dbbfba3`'
c = src.count(anchor)
if c != 1:
    print('FATAL: Task-111-অ্যাঙ্কর গণনা=%d' % c); sys.exit(1)
src = src.replace(anchor, NEW_TASK + anchor, 1)
print('OK: Task-112-রেকর্ড-সন্নিবেশিত')

io.open(P, 'w', encoding='utf-8').write(src)
print('SANDBOX-WORKLOG-DONE')
