#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s268-docs.py — session268 ডক-আপডেট ×৩ (PROJECT §২৬৮ + PLANS session268 + repo-worklog তিন-খণ্ড)
চুক্তি: idempotent-সংরক্ষণ (মার্কার-থাকলে SKIP), অ্যাঙ্কর-অদ্বিতীয়তা-FATAL, বাইট-অ্যাসার্ট-পোস্ট।"""
import sys

APP = __file__.rsplit('/scripts/', 1)[0]

def fatal(m):
    print('FATAL: ' + m)
    sys.exit(1)

# ── ১) PROJECT.md — §২৬৮ সন্নিবেশ (§২৬৭-এর-আগে) ──
P = APP + '/PROJECT.md'
proj = open(P, encoding='utf-8').read()
SEC268 = """## §২৬৮ (session268 — cron 403679: মডারেটর ব্যবস্থাপনা তাৎক্ষণিক-ফিল্টার mo268 — tk267-প্যাটার্ন-মিরর + রিড-ওনলি-সারফেস-পূর্বগণনা-চুক্তি) — s268 ৫৬/৫৬ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`cf082c0` (session267/Task107, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); রাউন্ড-শুরু QA: s267 ৫৯/৫৯ + prod-spot (home/health/admin-login ২০০×৩) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session267-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — moderators সারফেস)।

**[Mandatory-ফিচার] মডারেটর ব্যবস্থাপনা তাৎক্ষণিক-ফিল্টার (mo268):** /admin/moderators (admin/views/admin/moderators.ejs) — সারি-সারফেস (users-টেবিল tr, forEach-(u, idx)-এর idx — **staff-সহ-সর্বজনীন**: রুট-কোয়েরিতে users=সব-ইউজার (role DESC, full_name ASC) → এক-সারফেসে-ই কর্মী+ইউজার-কভারেজ) `data-mo-row` + দ্বিভাষিক `data-kw` (#আইডি + ইউজার user + full_name + @username + username + রোল (অ্যাডমিন admin/মডারেটর moderator/ইউজার user) + স্ট্যাটাস (সক্রিয় active/নিষিদ্ধ banned/অপেক্ষমাণ pending) + যোগদান-তারিখ + যোগদান joined) + ফিল্টার-স্ট্রিপ (moFilter268 + moClear268 + moCount268 + mo-kbd-hint — **always-rendered**, empty-শাখার-বাইরে) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স (moZero268 data-mo-empty) + 'f'-ফোকাস (field-গার্ড: INPUT/TEXTAREA/SELECT/contentEditable) + Escape-ক্লিয়ার+ব্লার + **__moQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত)**; person-card কর্মী-তালিকা / role-ফর্ম / scopes-ফর্ম / scope-toggle / header-চিপ ×২ / section-head / empty-state-full / status-select / count-pill / sidebar সম্পূর্ণ অক্ষুণ্ণ।

**[Mandatory-স্টাইল] mo268-ব্লক হেক্স-শূন্য টোকেন-শুধু:** color-mix ফোকাস-রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + **hidden-গার্ড ×৩ সঠিক-বাইট** (`.mo-count-chip[hidden]` / `.mo-zero[hidden]` / `tr[data-mo-row][hidden]` !important — tr-সারফেস-গার্ড-প্রথম session267-বিস্তার) — প্যাচ-পোস্ট-অ্যাসার্ট + suite-containsF দ্বি-প্রমাণ।

**টেস্ট:** নতুন tests/s268-mofilter-suite.sh **৫৬/৫৬ ×২-ধারাবাহিক** (কাঠামো ×২০ + স্টাইল ×৯ + আচরণ ×১৬ রিয়েল-ব্রাউজার — নির্ধারক-প্রোব ×৩ রেন্ডার্ড-HTML-পূর্বগণনা ('@qa113user'-ইউজারনেম-একক / 'মডারেটর moderator'-রোল / 'সক্রিয় active'-স্ট্যাটাস ৬৩/৬৩) মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden (৬৩/৬৩ tr-গার্ড-প্রমাণ) + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + **ফিল্ড-গার্ড-প্রোব (select[name=status]-থেকে 'f')** + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) + পূর্ণ-রিগ্রেশন s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/৫৩ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs)।

**[রিড-ওনলি-সারফেস-চুক্তি] (নতুন-বিস্তার — adf264-পূর্বগণনা-প্রথার স্থায়ী-রূপ):** ইউজার-তালিকা মিউটেশন-অযোগ্য (create-user অ্যাডমিন-ফর্ম-নেই) → সিড-পথ-অনুপস্থি; প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা (৬৩-সারফেস, ইউজারনেম-অনন্যতা-অ্যাসার্টসহ) + সুইটে মিউটেশন-POST-শূন্য (লগইন-ব্যতীত) + **নেট-DB-রাইট-শূন্য-প্রমাণ (সারফেস ৬৩ → ৬৩)** — ক্র্যাশ-সুরক্ষিত, রেট-লিমিট-মুক্ত, প্যারালাল-রাউন্ড-নিরাপদ।

**প্যাচ:** scripts/s268-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ, admin.css/tokens.css `.mo-`-সংঘর্ষ-FATAL-গার্ড + টোকেন-উপস্থিতি-গার্ড, সংরক্ষণ ×৮ অ্যাসার্ট — প্রথম-রানে users-tr-মার্কার-মিথ্যা-ফেল → `<tr`-প্রিফিক্স-সংশোধন) + ডক ×৩ (PROJECT §২৬৮ + PLANS session268 + এ-এন্ট্রি)।

"""
ANCH = '## §২৬৭ (session267'
if '§২৬৮ (session268' in proj:
    print('SKIP-PROJECT: §২৬৮ পূর্ব-উপস্থিত')
elif proj.count(ANCH) != 1:
    fatal('PROJECT §২৬৭-অ্যাঙ্কর অদ্বিতীয়')
else:
    proj = proj.replace(ANCH, SEC268 + ANCH, 1)
    open(P, 'w', encoding='utf-8').write(proj)
    print('OK-PROJECT: §২৬৮ সন্নিবেশিত')

# ── ২) PLANS.md — session268-নোট (session267-নোট-এর-আগে) ──
L = APP + '/PLANS.md'
plans = open(L, encoding='utf-8').read()
NOTE = """## session268-নোট (cron 403679 — মডারেটর ব্যবস্থাপনা তাৎক্ষণিক-ফিল্টার mo268)
- **রিড-ওনলি-সারফেস-পূর্বগণনা-চুক্তি (নতুন):** সারফেস-মিউটেশন-অযোগ্য হলে (ইউজার-তালিকা — create-ফর্ম-নেই) সিড-পথ-বাদ; প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা (adf264-প্রথার স্থায়ী-রূপ): ইউজারনেম-একক-প্রোব (data-kw-থেকে `@username`-নিষ্কাশন + অনন্যতা-অ্যাসার্ট) + রোল/স্ট্যাটাস-অ্যালায়াস-প্রোব-গণনা; সুইটে মিউটেশন-POST-শূন্য (লগইন-ব্যতীত) → নেট-রাইট-শূন্য-প্রমাণ সারফেস-গণনা-মিল (৬৩→৬৩)। ভবিষ্যৎ-রিড-ওনলি-সারফেসে (audit/activity/subscribers-লগ) এ-চুক্তি-অনুলিপি।
- **EJS-শর্তসাপেক্ষ-শাখা-সোর্স-অ্যাসার্ট:** empty-শাখার মার্কার (empty-state-full) রেন্ডার্ড-HTML-এ থাকে-না (ডেটা-নন-এম্পটি-হলে) — রেন্ডার্ড-পৃষ্ঠায় always-rendered-স্ট্রিপ ('mo-instant') + **সোর্স-স্তরে** EJS-ফাইল-গ্রেপ দ্বি-অ্যাসার্ট (s267-এর label-vs-pattern-প্রথার স্পষ্টীকরণ)।
- **সংরক্ষণ-মার্কার-নির্বাচন-গোটচা:** সারি-সারফেস-সম্পাদনা-যে-মার্কার-বদলায় (`<tr>` → `<tr data-...>`) সে-মার্কার সংরক্ষণ-অ্যাসার্টে রাবেন-না — `<tr`-প্রিফিক্স-রূপে (প্যাচ-প্রথম-রানে মিথ্যা-ফেল → সংশোধন; অ্যাসার্ট-লিখনের-আগে সম্পাদনা-প্রভাব-মানচিত্র)।
- **tr-গার্ড-জোড়া পুনঃপ্রমাণিত (session267-বিস্তার):** টেবিল-সারি-সারফেসে `tr[data-mo-row][hidden] { display:none !important }` + নো-ম্যাচে সব-hidden-অ্যাসার্ট (৬৩/৬৩) = গার্ড-কার্যকারিতা-প্রমাণ; স্ট্রিপ always-rendered (empty-শাখার-বাইরে) → __moQA সারফেস-শূন্যে-ও-সংজ্ঞায়িত।
- **পরের-এজেন্ট: session269 থেকে (worklog Task ID 109)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (audit/subscribers — ms266/ac265/tk267/mo268-প্যাটার্ন-মিরর; subscribers দ্বৈত-টেবিল (subs+logs) — স্কোপ-সিদ্ধান্ত-পূর্বক; audit = রিড-ওনলি-পূর্বগণনা-চুক্তি-প্রযোজ্য), multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
ANCH2 = '## session267-নোট'
if '## session268-নোট' in plans:
    print('SKIP-PLANS: session268-নোট পূর্ব-উপস্থিত')
elif plans.count(ANCH2) != 1:
    fatal('PLANS session267-অ্যাঙ্কর অদ্বিতীয়')
else:
    plans = plans.replace(ANCH2, NOTE + ANCH2, 1)
    open(L, 'w', encoding='utf-8').write(plans)
    print('OK-PLANS: session268-নোট সন্নিবেশিত')

# ── ৩) repo-worklog.md — তিন-খণ্ড ব্লক অ্যাপেন্ড ──
W = APP + '/worklog.md'
wl = open(W, encoding='utf-8').read()
BLOCK = """## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin/main=`cf082c0` (session267/Task107 — fetch-প্রমাণিত, working-tree ক্লিন); স্থায়ী-সার্ভার জীবিত (৮০৯৪, health-healthy); Vercel-প্রোড লাইভ (home/health/admin-login ২০০×৩); রাউন্ড-শুরু QA: s267 ৫৯/৫৯ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড

## এ-রাউন্ডে সম্পন্ন (session268 — Task ID 108)
- **[Mandatory-ফিচার] mo268:** /admin/moderators তাৎক্ষণিক-ফিল্টার — tr[data-mo-row] users-টেবিল-সারফেস (staff-সহ-সর্বজনীন — রুট-কোয়েরিতে users=সব-ইউজার) + দ্বিভাষিক data-kw (#আইডি/ইউজার user/নাম/@username/রোল-জোড়/স্ট্যাটাস-জোড়/যোগদান-তারিখ/joined) + স্ট্রিপ (moFilter268/moClear268/moCount268/kbd-hint — always-rendered) + শূন্য-অবস্থা (moZero268 data-mo-empty) + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-ক্লিয়ার+ব্লার + __moQA হুক (সারফেস-শূন্যে-ও); no-regression: person-card/role/scopes/scope-toggle/header-চিপ/section-head/empty-state-full/status-select/count-pill/sidebar অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** mo268-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-mo-row][hidden] !important — tr-সারফেস-গার্ড-প্রথম)
- **[রিড-ওনলি-চুক্তি]:** ইউজার-তালিকা মিউটেশন-অযোগ্য → সিড-বাদ; প্রোব-পূর্বগণনা (রেন্ডার্ড-HTML: '@qa113user'-একক / 'মডারেটর moderator'-রোল / 'সক্রিয় active' ৬৩/৬৩) + মিউটেশন-POST-শূন্য → নেট-রাইট-শূন্য-প্রমাণ (৬৩→৬৩)
- **টেস্ট:** নতুন tests/s268-mofilter-suite.sh ৫৬/৫৬ ×২-ধারাবাহিক (কাঠামো ×২০ + স্টাইল ×৯ + আচরণ ×১৬ রিয়েল-ব্রাউজার + ফিল্ড-গার্ড-প্রোব select[name=status] + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড) + পূর্ণ-রিগ্রেশন s260-২৬৭ (৫২/৫০/৪৮/৫৩/৫৬/৫৭/৫৯/৫৯ সব-গ্রিন) + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs)
- **গোটচা ×৩ ডক-কৃত (PLANS session268):** রিড-ওনলি-পূর্বগণনা-চুক্তি (সিড-অনুপস্থি-সারফেস) · EJS-শর্তসাপেক্ষ-শাখা রেন্ডার্ড-HTML-এ-নেই → স্ট্রিপ+সোর্স-দ্বি-অ্যাসার্ট · সংরক্ষণ-মার্কার সম্পাদনা-প্রভাব-সচেতন (`<tr`-প্রিফিক্স)
- প্যাচ: scripts/s268-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ, `.mo-`-সংঘর্ষ+টোকেন-উপস্থিতি-FATAL-গার্ড, সংরক্ষণ ×৮) + ডক ×৩ (PROJECT §২৬৮ + PLANS session268 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session269 লেবেল (worklog Task ID 109)**; PLANS session268-নোট অবশ্যই-পড়ুন (রিড-ওনলি-পূর্বগণনা-চুক্তি + EJS-শাখা-সোর্স-অ্যাসার্ট + সংরক্ষণ-মার্কার-গোটচা + tr-গার্ড-জোড়া); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (audit/subscribers — mo268-প্যাটার্ন-মিরর; audit=রিড-ওনলি-পূর্বগণনা-প্রযোজ্য; subscribers দ্বৈত-টেবিল — স্কোপ-সিদ্ধান্ত-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session268-জোড়া: feature + worklog); working-tree ক্লিন
"""
if 'session268 — Task ID 108' in wl:
    print('SKIP-WORKLOG: session268-ব্লক পূর্ব-উপস্থিত')
else:
    if not wl.endswith('\n'):
        wl += '\n'
    wl += BLOCK
    open(W, 'w', encoding='utf-8').write(wl)
    print('OK-WORKLOG: তিন-খণ্ড ব্লক অ্যাপেন্ডেড')

# ── পোস্ট-অ্যাসার্ট ──
for f, needles in (
    (P, ['§২৬৮ (session268', 'mo268']),
    (L, ['## session268-নোট', 'রিড-ওনলি-সারফেস-পূর্বগণনা-চুক্তি']),
    (W, ['session268 — Task ID 108', '__moQA']),
):
    c = open(f, encoding='utf-8').read()
    for n in needles:
        if n not in c:
            fatal('পোস্ট-অ্যাসার্ট-ব্যর্থ ' + f.rsplit('/', 1)[-1] + ': ' + n)
print('OK: ডক ×৩ সম্পন্ন + পোস্ট-অ্যাসার্ট গ্রিন')
