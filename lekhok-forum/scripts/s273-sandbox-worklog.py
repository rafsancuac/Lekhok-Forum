#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s273-sandbox-worklog.py — my-project worklog.md আপডেট (Task ID 113 + ACTIVE-LOCK-অগ্রগতি, idempotent)"""
import io, sys

P = '/home/z/my-project/worklog.md'
src = io.open(P, encoding='utf-8').read()

if 'Task ID: 113 (session273 — cron 403679; সুপার-ইউজার' in src:
    print('SKIP: Task 113 ইতিমধ্যে-উপস্থিত')
    sys.exit(0)

def rep(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n:
        print('FATAL: %s — %r গণনা=%d (প্রত্যাশা=%d)' % (label, old[:60], c, n)); sys.exit(1)
    src = src.replace(old, new, n)
    print('OK:', label)

# ── ACTIVE-LOCK হেড ──
rep('## ⚡ ACTIVE-LOCK (Task ID 112 — worklog-ক্রম max+1; রিপো-লেবেল **session272** — ✅ পুশড 4aa7331 — সমান্তরাল keeper-401248-rebased-সহ)',
    '## ⚡ ACTIVE-LOCK (Task ID 113 — worklog-ক্রম max+1; রিপো-লেবেল **session273** — ✅ পুশড 5cfb514 — keeper-401248-PII-পার্জ-force-push-rebased-সহ)',
    'ACTIVE-LOCK-হেড')

# ── auth লাইন ──
rep('এ-রাউন্ডে push-সফল `0f9eeed..4aa7331` — feature `5673635` + worklog `4aa7331` (fetch-প্রমাণ: সমান্তরাল keeper-401248-অডিট-রাউন্ড `032b13e..0f9eeed` সন্নিবেশিত — ফাইল-সেট-বিচ্ছিন্ন, সংঘর্ষ-শূন্য rebase)',
    'এ-রাউন্ডে push-সফল `7e0b0b3..5cfb514` — feature `3e8ee76` + worklog `5cfb514` (fetch-প্রমাণ: keeper-401248-PII-পার্জ force-push 706-কমিট-রিরাইট + epaper-bot-session273 — `rebase --onto origin/main 2482b76` সংঘর্ষ-শূন্য ২-কমিট-রিপ্লে)',
    'auth-push-hash')
rep('**4aa7331-READY** — dpl_71meRV8yVYSzx9LomEg2GeC8y7Lq, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + activity-গেট-307',
    '**5cfb514-READY** — dpl_3RFJXKXnvTZhVrCkRKfpVxaDXWRN, meta.githubCommitSha-প্রমাণিত; প্রোড live-200 + health-200 + admin-গেট-307 + super-gate-307',
    'auth-vercel')

# ── স্টেল-সামারি ×৩৮ → ×৩৯ ──
rep('⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৩৮)',
    '⚠️ স্টেল-সামারি-সতর্কতা (আবার-প্রমাণিত ×৩৯)',
    'staleness')

# ── নতুন-গোটচা বুলেট (লাইভ-সারফেস-চার্ন-বুলেটের-পরে) ──
rep('- **রিপো-অবস্থা:** origin/main = **`dbbfba3`** (session271, ২৩-সেপ্টেম্বর)',
    '- **⚠️ force-push-পার্জ-গোটচা (নতুন — session273):** প্যারালাল keeper-রাউন্ডের filter-repo-PII-পার্জে origin/main **706-কমিট-রিরাইট force-push** হয় (ahead ১৭৮/behind ১৭৯-বিভাজন) → সাধারণ `git pull`-rebase-নয় — **`git rebase --onto origin/main <pre-rewrite-base> main`**-ই-সঠিক (শুধু-নিজের-পোস্ট-বেস-কমিট-রিপ্লে; এ-রাউন্ডে ২-কমিট সংঘর্ষ-শূন্য); push-পূর্ব fetch-অবশ্যম্ভাবী পুনঃপ্রমাণিত; লেবেল-সংঘর্ষ (epaper-session273-ও Task-113-দাবি) = শিরোনাম-কনটেন্ট-দ্বারা-বিচ্ছিন্ন\n'
    '- **⚠️ নেমস্পেস-প্রি-ব্যস্ত-গোটচা (নতুন — session273):** সংক্ষিপ্ত-প্রিফিক্স (.su-) বহু-পুরাতন-ক্লাসে-ব্যস্ত-থাকতে-পারে (admin.css su-avatar/su-logout/su-meta/su-name/su-role) — নতুন-সারফেস **ভার্সন-সাফিক্স-প্রিফিক্স (su273-)**-ই-নিরাপদ; kw-লেবেল-ম্যাপের **মান** বাংলা-একভাষিক হলে ল্যাটিন-অ্যালায়াস-যোগ-বাধ্যতমূলক (ROLE_ALIAS273 — ব্যতীত প্রোব SKIP×২ 0==0-ধোঁকা); bare-id-প্রোবে \'#6\'⊂\'#60\'-সাবস্ট্রিং → max-id-নিম্নগামী-অনন্যতা-যাচাই; বিদ্যমান-client-ফিল্টার-সারফেসে নতুন-স্ট্রিপ = দুই-স্বাধীন-ডাইমেনশন (style.display ∩ hidden) — সহ-অস্তিত্ব-অ্যাসার্ট-বাধ্যতমূলক।\n'
    '- **রিপো-অবস্থা:** origin/main = **`5cfb514`** (session273, ২৩-সেপ্টেম্বর)',
    'repo-state')

# ── গোটচা/পরের-এজেন্ট লাইন ──
rep('**পরের-এজেন্ট: session272 (Task ID 112)** — PLANS session271-নোট অবশ্যই-পড়ুন',
    '**পরের-এজেন্ট: session274 (Task ID 114)** — PLANS session273-নোট অবশ্যই-পড়ুন (নেমস্পেস-ভার্সন-সাফিক্স + মান-টোকেন-দ্বিভাষিক + bare-id-অনন্যতা + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব + requireSuperAdmin-ভিউয়ার admin/admin123)',
    'next-agent')

# ── Task 113 রেকর্ড সন্নিবেশ (Task 112-র-আগে) ──
NEW_TASK = """---
Task ID: 113 (session273 — cron 403679; সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার su273 + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব চুক্তি) — push `5cfb514`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`2482b76` (session272/Task112 + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৩৯:** এ-রাউন্ডের কনটেক্সট-সামারি আবার 'Task43-হারানো/device-flow-মেয়াদোত্তীর্ণ/১৯-ট্রিগার-ব্যাকলগ' দেখিয়েছিল — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য
- **force-push-পার্জ-সংঘর্ষ (দ্বিতীয়-প্রকৃতি):** push-পূর্ব fetch-এ origin 706-কমিট-রিরাইট force-push ধরা-পড়ে (keeper-401248-PII-পার্জ + epaper-bot-session273) → `git rebase --onto origin/main 2482b76 main` — ২-কমিট সংঘর্ষ-শূন্য রিপ্লে → push `7e0b0b3..5cfb514`
- রাউন্ড-শুরু QA: s272 ৭২/৭২ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session272-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — super/users সারফেস; requireSuperAdmin → admin/admin123, s231-প্রথা)

## এ-রাউন্ডে সম্পন্ন (session273)
- **[Mandatory-ফিচার] সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার (su273):** /admin/super/users-support (admin/views/admin/super/users.ejs) — সারি-সারফেস tr data-su-row (forEach-(u, suI273)) + দ্বিভাষিক data-kw (#id-বেয়ার + ইউজার user + @username + নাম name + কলমী penname + রোল role মান-অ্যালায়াসসহ (ইউজার user/মডারেটর moderator/এডমিন admin/সুপার-এডমিন superadmin) + স্ট্যাটাস status মান-অ্যালায়াসসহ (সক্রিয় active/অপেক্ষমাণ pending/নিষিদ্ধ banned/নিষ্ক্রিয় inactive) + টেম্পোরারি-সক্রিয় temporary/স্বাভাবিক normal + 2FA totp দুই-স্তর + ইমেইল email + ফোন phone + মেম্বার member — whitespace-নরমালাইজড) + ফিল্টার-স্ট্রিপ (suFilter273/suClear273/suCount273/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (suZero273 data-su-empty) + 'f'-ফোকাস (একক-স্ট্রিপ) + field-গার্ড + Escape + __suQA হুক; **বিদ্যমান us-সার্চ-ফিল্টার-অক্ষুণ্ণ — দুই-স্বাধীন-ডাইমেনশন সহ-অস্তিত্ব-চুক্তি (নতুন): usSearch=style.display-ল্যাটিন-ইকো, su273=hidden-সেমান্টিক; সেট-ইন্টারসেকশন-রেন্ডার**
- **[Mandatory-স্টাইল]:** su273-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-su-row][hidden] !important)
- **রিড-ওনলি-চুক্তি (s270-অনুলিপি):** সিড-বাদ + রেন্ডার্ড-HTML-পূর্বগণনা (data-kw-নিষ্কাশন) + মিউটেশন-POST-শূন্য → নেট-DB-রাইট-শূন্য-প্রমাণ (রেন্ডার্ড-পাংক্তি ৬৩→৬৩)
- **গোটচা ×৩ ডক-কৃত (PLANS session273):** ① .su-প্রিফিক্স admin.css-ব্যস্ত (৫-ক্লাস) → su273-ভার্সন-সাফিক্স-নেমস্পেস ② লেবেল-ম্যাপ-মান-বাংলা-একভাষিক → প্রথম-রানে রোল/স্ট্যাটাস-প্রোব SKIP×২ (0==0-মিল-ধোঁকা) → ROLE_ALIAS273-সংশোধনী (kw-মান-টোকেনও দ্বিভাষিক — av271-চুক্তি) ③ bare-id-প্রোব-সাবস্ট্রিং (#6 ⊂ #60) → max-id-নিম্নগামী-বেয়ার-অনন্যতা-যাচাই; প্লাস প্যাচ-স্তর suApply273-×৪-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ)
- **টেস্ট:** নতুন tests/s273-sufilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৭ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৪ পূর্বগণনা-মিল (bare-id '#62' একক / 'মডারেটর moderator' ১/৬৩ / 'স্ট্যাটাস status সক্রিয় active' ৬৩/৬৩ / 'ইউজার user' সর্বজনীন) + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব input[name=q]-থেকে + Escape-ব্লার + দ্বৈত-ডাইমেনশন-সহ-অস্তিত্ব (us-সার্চ ২-জন + su273-অপ্রভাবিত ৬৩) + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-রাইট-শূন্য) + পূর্ণ-রিগ্রেশন s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s273-patch.py + s273-patch2.py (skip-if-present idempotent ×২ — SKIP-পুনঃরান-প্রমাণ, .su273--নেমস্পেস-গার্ড + টোকেন-গার্ড ×৭ + PRESERVE-মানচিত্র (ROLE_LABEL/STATUS_LABEL প্রি২→পোস্ট৩, must_change_password প্রি২→পোস্ট৩, totp_enabled প্রি১→পোস্ট২, addEventListener প্রি৫→পোস্ট৯) + হেক্স-শূন্য-পোস্ট-অ্যাসার্ট + সঠিক-বাইট ×৩) + ডক ×৩ (PROJECT §২৭৩ + PLANS session273 + repo-worklog Task-113) → পুরাতন-PNG-চার্ন-রিভার্ট ×১২ (session269-প্রথা) → secret-scan-ক্লিন → fetch (force-push-সনাক্ত) → **--onto-rebase → push `7e0b0b3..5cfb514`** → Vercel **READY @ 5cfb514** (dpl_3RFJXKX… — BUILDING-গোটচা-মেনে READY-র-পরে-প্রোব) → প্রোড-স্পট home-200 + health-200 + admin-গেট-307 + super-gate-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **প্যারালাল-রাউন্ড-সচেতনতা-বর্ধিত:** force-push-পার্জ + epaper-bot-রাউন্ড-সহ সমান্তরাল-ক্রিয়াকলাপ-চলমান — push-পূর্ব fetch+`--onto`-rebase-প্রথা; লেবেল-সংঘর্ষে শিরোনাম-কনটেন্ট-বিভাজন + রিলে-নোট
- পরের-এজেন্ট: **session274 লেবেল (worklog Task ID 114)**; PLANS session273-নোট অবশ্যই-পড়ুন (নেমস্পেস-ভার্সন-সাফিক্স + মান-টোকেন-দ্বিভাষিক + bare-id-অনন্যতা + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব + requireSuperAdmin-ভিউয়ার); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (trash-সুইট-স্তর-যাচাই-দ্বিতীয়-পাস; security.ejs-স্কোপ-ম্যাপ-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
- রিমোট main = `5cfb514` (session273-su273 — keeper-PII-পার্জ + epaper-সহ); working-tree ক্লিন

"""
rep('---\nTask ID: 112 (session272 — cron 403679; রিভিশন-হিস্ট্রি', NEW_TASK + '---\nTask ID: 112 (session272 — cron 403679; রিভিশন-হিস্ট্রি', 'Task-113-রেকর্ড')

io.open(P, 'w', encoding='utf-8').write(src)
print('SANDBOX-WORKLOG-DONE')
