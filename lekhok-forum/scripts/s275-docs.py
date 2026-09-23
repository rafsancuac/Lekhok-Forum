#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s275-docs.py — session275 ডক ×৩: PROJECT.md §২৭৫ + PLANS.md session275-নোট + repo worklog.md Task-115
প্রতিটি সম্পাদনা অ্যাঙ্কর-গণনা-যাচাইসহ (idempotent — পুনঃরানে SKIP)।
"""
import io, sys

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def rep(src, old, new, label, n=1):
    c = src.count(old)
    if c != n:
        fatal(f'{label} — অ্যাঙ্কর-গণনা={c} (প্রত্যাশা={n})')
    print('OK:', label)
    return src.replace(old, new, n)

def skip_if(marker, path):
    s = io.open(path, encoding='utf-8').read()
    if marker in s:
        print(f'SKIP: {path} — {marker[:40]} পূর্ব-উপস্থিত')
        return None
    return s

# ════════════════ PROJECT.md §২৭৫ ════════════════
P = 'PROJECT.md'
src = skip_if('## §২৭৫ (session275', P)
if src is not None:
    SEC = """## §২৭৫ (session275 — cron 403679: সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার sd275+se275 + li-সারফেস-বিস্তার + দ্বৈত-স্ট্রিপ 'f'-একক-মালিকানা) — s275 ৮২/৮২ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`0da017a` (session274 + টুল-কমিট, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); স্টেল-সামারি-সংশোধন ×৪১ (সামারি Task43/'commit-হয়নি'/device-flow-যুগ — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য)। রাউন্ড-শুরু QA: s274 ৬১/৬১ + role-policy ২৬০/২৬০ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (session274-সিবলিং-নির্বাচন গৃহীত: super/dashboard.ejs — requireSuperAdmin-সিবলিং; **দ্বৈত-তালিকা-সারফেস → দ্বৈত-স্ট্রিপ (s269-চুক্তি-প্রথম-প্রয়োগ-একই-রাউন্ডে-দুই-নতুন-স্ট্রিপ)**)।

**[Mandatory-ফিচার] সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার (sd275+se275):** /admin/super (admin/views/admin/super/dashboard.ejs — requireSuperAdmin) — **sd275 = তদারকি-স্কোপধারী মডারেটর তালিকা:** li[data-sd-row] + দ্বিভাষিক data-kw (#id + মডারেটর moderator + @username + নাম name + তদারকি oversight user_mgmt স্কোপ scope + শেষ লগইন last — whitespace-নরমালাইজড) + ফিল্টার-স্ট্রিপ (sdFilter275/sdClear275/sdCount275/kbd-hint — ov-box-h4-এর-পরে, conditional-বাইরে always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (sdZero275 data-sd-empty — else-শাখার-পরে); **se275 = অ্যাডমিন অ্যাকাউন্ট সারসংক্ষেপ:** li[data-se-row] + দ্বিভাষিক data-kw (#id + অ্যাডমিন admin + @username + নাম name + রোল role মান-অ্যালায়াসসহ (সুপার-এডমিন superadmin/এডমিন admin) + লকড locked/আনলকড unlocked + শেষ লগইন last) + ফিল্টার-স্ট্রিপ (seFilter275/seClear275/seCount275 — card-title-এর-পরে always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (seZero275 data-se-empty — </ul>-এর-পরে); **'f'-ফোকাস একক-মালিকানা (s269-চুক্তি):** page-listener শুধু sd275-এ, se275 স্বাধীন (input/Escape/clear); field-গার্ড-প্রোব = seFilter275 (id-বিহীন-ইনপুট — activeElement.id-যাচাই, s274-.name-চুক্তির id-বিস্তার); __sdQA/__seQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত); Escape ×২-স্বাধীন; সাইট-স্ট্যাটাস/মেইনটেন্যান্স-ফর্ম/stat-box ×৮/ov-chain/ov-revoke/data-ov-confirm/লগ-দুই-কলাম অক্ষুণ্ণ।

**[Mandatory-স্টাইল]:** sd275-ব্লক ভায়োলেট-পরিবার (var(--lf-violet-600/-deep/-soft/-soft-2)) + se275-ব্লক ব্লু-পরিবার (var(--lf-blue-600/-800/-soft/-soft-2)) — উভয় হেক্স-শূন্য টোকেন-শুধু (color-mix ফোকাস-রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + **hidden-গার্ড ×৫ সঠিক-বাইট — [data-sd-row][hidden],[data-se-row][hidden] { display:none !important } — li-সারফেসেও অ্যাট্রিবিউট-সিলেক্টর (s274-কার্ড-চুক্তির li-বিস্তার; ov-list/recent-list-র display:flex অতিক্রমকারী)**)।

**প্যাচ:** scripts/s275-patch.py (skip-if-present idempotent — SKIP-পুনঃরান-প্রমাণ; দ্বি-নেমস্পেস-গার্ড .sd275-/.se275- + আইকন-প্রি-উপস্থিতি-গার্ড ×৫; অ্যাঙ্কর ×৭-অনন্যতা; PRESERVE-মানচিত্র (forEach প্রি৬→পোস্ট৮, addEventListener প্রি১→পোস্ট৮, aria-label +৪-**প্রথম-রানে +২-মিথ্যা-অ্যাসার্ট-ধরা — in-memory-ফেল, ফাইল-অলিখিত, প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ**; data-ov-confirm/stat-box ×৮/ov-empty ×২ অপরিবর্তিত), **প্রতিটি-নতুন-আইকন ×১-অ্যাসার্ট (s271-গোটচা-বিস্তার — দুই-স্ট্রিপে আইকন-পুনঃব্যবহার-এড়ানো: sd=fa-filter, se=fa-magnifying-glass, sd-clear=fa-times, se-clear=fa-xmark, sd-zero=fa-filter-circle-xmark, se-zero=fa-circle-xmark)**, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট + সঠিক-বাইট ×৫) + ডক ×৩।

**টেস্ট:** নতুন tests/s275-sdfilter-suite.sh **৮২/৮২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১২ + আচরণ ×৩১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৬ (sd bare-id '#52' একক + sd '@moderator' একক + 'তদারকি oversight' সর্বজনীন ২/২ + se '@admin' একক + 'সুপার-এডমিন superadmin' ১/১ + se bare-id '#1') + নো-ম্যাচ→শূন্য ×২ + **computed-display:none-গার্ড-প্রমাণ (ov-list-flex-অতিক্রম — hidden-attr-গণনার-চেয়ে-শক্তিশালী) + শূন্য-বক্স-বিপরীত-প্রমাণ** + clear-পুনরুদ্ধার ×২ + চিপ-text/hidden/display-none + 'f'-ফোকাস-একক-মালিকানা + **fokus-দ্বন্দ্ব-শূন্য (se-ফোকাসড-নয়)** + ফিল্ড-গার্ড (seFilter275-থেকে 'f' → চুরি-শূন্য) + Escape ×২-স্বাধীন + **দ্বৈত-সহ-অস্তিত্ব (se-সক্রিয়ে __sdQA অপরিবর্তিত) + স্কোপ-বিচ্ছিন্নতা (se-নো-ম্যাচে sd-শূন্য-বক্স অপ্রভাবিত)** + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + **রিড-ওনলি-নেট-শূন্য (mo268-চুক্তি): মিউটেশন-POST-শূন্য (লগইন-ব্যতীত) → sd ২→২ + se ১→১ + প্রোব-অবশেষ-শূন্য**) + পূর্ণ-রিগ্রেশন s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট ×১৫ (session269-প্রথা) + anchor-scan ০-ঝুঁকি।

**গোটচা ×৩ ডক-কৃত (PLANS session275):** ① li-সারফেস-গার্ড ([data-x-row][hidden]-অ্যাট্রিবিউট-সিলেক্টর + computed-display-অ্যাসার্ট) ② দ্বৈত-স্ট্রিপ-এক-রাউন্ডে ('f'-একক-মালিকানা + দ্বিতীয়-ইনপুট-ই-ফিল্ড-গার্ড-প্রোব + aria-label +৪) ③ আইকন ×১-প্রতি-নতুন (দুই-স্ট্রিপে আইকন-বৈচিত্র্য-বাধ্যতমূলক)।

"""
    src = rep(src, '## §২৭৪ (session274 — cron 403679', SEC + '## §২৭৪ (session274 — cron 403679', 'PROJECT §২৭৫-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ PLANS.md session275-নোট ════════════════
P = 'PLANS.md'
src = skip_if('## session275-নোট', P)
if src is not None:
    NOTE = """## session275-নোট (cron 403679 — সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার sd275+se275 + li-সারফেস-বিস্তার)
- **li-সারফেস-গার্ড-চুক্তি (নতুন — s274-কার্ড-চুক্তির ul/li-বিস্তার):** ul/li-তালিকায়ও hidden-গার্ড **[data-sd-row][hidden], [data-se-row][hidden] { display:none !important }** — অ্যাট্রিবিউট-সিলেক্টরই-সর্বজনীন (ov-list li/recent-list li-র display:flex নিয়ম লুকানো-অ্যাট্রিবিউটকে-অতিক্রম-করে — !important-ছাড়া-অদৃশ্য-হতো-না); **সুইটে computed-display:none-অ্যাসার্ট = গার্ড-প্রমাণের সর্বোচ্চ-স্তর** (hidden-attr-গণনা শুধু JS-অবস্থা দেখায়, CSS-প্রয়োগ-প্রমাণ-দেয়-না) + শূন্য-বক্স-বিপরীত-প্রমাণ (নো-ম্যাচে zero-বক্স display≠none — গার্ড-ওভাররিচ-দ্বৈত-দিক)।
- **দ্বৈত-স্ট্রিপ-এক-রাউন্ডে-একই-পৃষ্ঠায় (s269-চুক্তির পূর্ণ-প্রয়োগ):** 'f'-page-listener শুধু-প্রথম (sd275); দ্বিতীয় (se275) স্বাধীন; **fokus-দ্বন্দ্ব-শূন্য-অ্যাসার্ট বাধ্যতমূলক** ('f' → sdFilter275 ফোকাসড + seFilter275 নয়); **ফিল্ড-গার্ড-প্রোব হিসেবেই দ্বিতীয়-স্ট্রিপের-ইনপুট ব্যবহারযোগ্য** (সারফেসে অন্য-নাম্বার-ইনপুট-না-থাকলে — id-বিহীন হলে activeElement.id-যাচাই, s274-এর activeElement.name-চুক্তির id-সমতুল্য); দ্বৈত-সহ-অস্তিত্ব-অ্যাসার্ট (se-সক্রিয়ে __sdQA.count() অপরিবর্তিত) + স্কোপ-বিচ্ছিন্নতা-অ্যাসার্ট (se-নো-ম্যাচে sd-শূন্য-বক্স hidden-ই-থাকে)।
- **আইকন ×১-প্রতি-নতুন-প্রতি-পৃষ্ঠা (s271-শূন্য-বক্স-গোটচার স্ট্রিপ-বিস্তার):** একই-রাউন্ডে-দুই-স্ট্রিপ হলে প্রতিটি-নতুন-আইকন পৃষ্ঠায় ×১ — দ্বৈত-স্ট্রিপে আইকন-পুনঃব্যবহার-এড়ানো (sd-ico=fa-filter, se-ico=fa-magnifying-glass, sd-clear=fa-times, se-clear=fa-xmark, sd-zero=fa-filter-circle-xmark, se-zero=fa-circle-xmark — প্রতিটি প্যাচে ×১-পোস্ট-অ্যাসার্ট; fa-filter-মোট ×২ = 'fa-filter ' ×১ + 'fa-filter-circle-xmark' ×১ — সাবস্ট্রিং-সচেতন-অ্যাসার্ট)।
- **রিড-ওনলি-ড্যাশবোর্ড-পূর্বগণনা-সীমা:** ড্যাশবোর্ডের activity/audit-তালিকা লগইনে-ড্রিফট-করে (s271-লাইভ-সারফেস) — কিন্তু এ-রাউন্ডের ফিল্টার-সারফেস (mods/admins-তালিকা) লগইনে-সারি-সেট-অপরিবর্তিত → curl-পূর্বগণনা-নিরাপদ; **ভবিষ্যৎ dashboard-এর activity/audit-তালিকা ফিল্টার-করলে domcount-চুক্তি (s271) বাধ্যতমূলক** (curl-পূর্বগণনা-ব্যর্থ-হবে)।
- **aria-label-গণনা-গোটচা (দ্বৈত-স্ট্রিপ):** স্ট্রিপ-প্রতি input+clear aria-label ×২ → দ্বৈত = +৪ (s274-একক-স্ট্রিপ +২-অনুমান প্রথম-রানে-মিথ্যা-ফেল — in-memory-ধরা, ফাইল-অলিখিত); PRESERVE-অ্যাসার্ট-লেখার-আগে স্ট্রিপ-গণনা × উপাদান-গণনা-ম্যাপ-বাধ্যতমূলক।
- **সিবলিং-সারফেস-নির্বাচন অব্যাহত:** super/settings.ejs, super/support-settings.ejs পরবর্তী-প্রার্থী (requireSuperAdmin-গার্ড-ভাগী); admin-সাব-তালিকা (notices/events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
- **পরের-এজেন্ট: session276 থেকে (worklog Task ID 116)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়! — force-push-পার্জ-পুনরাবৃত্তি-সম্ভব: `git rebase --onto origin/main <pre-base> main`)।

"""
    src = rep(src, '## session274-নোট (cron 403679', NOTE + '## session274-নোট (cron 403679', 'PLANS session275-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ repo worklog.md Task-115 ════════════════
P = 'worklog.md'
src = skip_if('Task ID: 115 (session275', P)
if src is not None:
    TASK = """---
Task ID: 115 (session275 — cron 403679; সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার sd275+se275 + li-সারফেস-বিস্তার + রিড-ওনলি-নেট-শূন্য)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`0da017a` (session274/Task114 + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪১:** কনটেক্সট-সামারির-পুরাতন-যুগ-দাবি (Task43/'commit-হয়নি'/device-flow/'২০-ট্রিগার-ব্যাকলগ') — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s274 ৬১/৬১ (SKIP=০) + role-policy ২৬০/২৬০ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (session274-সিবলিং-নির্বাচন গৃহীত: super/dashboard.ejs)

## এ-রাউন্ডে সম্পন্ন (session275)
- **[Mandatory-ফিচার] সুপার-এডমিন ড্যাশবোর্ড দ্বৈত তাৎক্ষণিক-ফিল্টার (sd275+se275):** /admin/super — **sd275 = তদারকি-স্কোপধারী মডারেটর তালিকা** (li[data-sd-row] + দ্বিভাষিক data-kw (#id+মডারেটর moderator+@username+নাম name+তদারকি oversight user_mgmt+শেষ লগইন — নরমালাইজড) + স্ট্রিপ (sdFilter275/sdClear275/sdCount275/kbd-hint — always-rendered) + চিপ + শূন্য-অবস্থা sdZero275); **se275 = অ্যাডমিন অ্যাকাউন্ট সারসংক্ষেপ** (li[data-se-row] + data-kw (#id+অ্যাডমিন admin+@username+নাম name+রোল role অ্যালায়াস+লকড locked/আনলকড unlocked+শেষ লগইন) + স্ট্রিপ + চিপ + শূন্য-অবস্থা seZero275); **'f'-একক-মালিকানা (s269)** — listener শুধু sd275; __sdQA/__seQA হুক; Escape ×২-স্বাধীন; সাইট-স্ট্যাটাস/মেইনটেন্যান্স-ফর্ম/stat-box ×৮/ov-chain/লগ-দুই-কলাম অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** sd275-ভায়োলেট-পরিবার + se275-ব্লু-পরিবার — উভয় হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion + 640px) + hidden-গার্ড ×৫ সঠিক-বাইট (**[data-sd-row][hidden],[data-se-row][hidden] !important — li-সারফেসে-ও অ্যাট্রিবিউট-সিলেক্টর**)
- **রিড-ওনলি-নেট-শূন্য-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-প্রমাণ sd ২→২ + se ১→১ (ids PRE == FINAL) + প্রোব-অবশেষ-শূন্য
- **গোটচা ×৩ ডক-কৃত (PLANS session275):** ① li-গার্ড + computed-display-প্রমাণ ② দ্বৈত-স্ট্রিপ-এক-রাউন্ডে ('f'-একক-মালিকানা + দ্বিতীয়-ইনপুট-ই-ফিল্ড-গার্ড-প্রোব + aria-label +৪-প্রথম-রানে-ধরা — in-memory-ফেল, ফাইল-অলিখিত) ③ আইকন ×১-প্রতি-নতুন (দুই-স্ট্রিপে আইকন-বৈচিত্র্য)
- **টেস্ট:** নতুন tests/s275-sdfilter-suite.sh **৮২/৮২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১২ + আচরণ ×৩১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৬ পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য ×২ + computed-display:none-গার্ড-প্রমাণ + শূন্য-বক্স-বিপরীত-প্রমাণ + clear-পুনরুদ্ধার ×২ + চিপ-ত্রয়ী + 'f'-একক-মালিকানা + fokus-দ্বন্দ্ব-শূন্য + ফিল্ড-গার্ড + Escape ×২ + দ্বৈত-সহ-অস্তিত্ব + স্কোপ-বিচ্ছিন্নতা + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট ×১৫ + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s275-patch.py (idempotent ×২, দ্বি-নেমস্পেস-গার্ড, আইকন-প্রি-গার্ড ×৫, PRESERVE-মানচিত্র, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৫) + ডক ×৩ (PROJECT §২৭৫ + PLANS session275 + worklog) → secret-scan-ক্লিন → fetch (origin-অনড়) → push → Vercel READY → প্রোড-স্পট

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session276 লেবেল (worklog Task ID 116)**; PLANS session275-নোট অবশ্যই-পড়ুন (li-গার্ড + দ্বৈত-স্ট্রিপ-চুক্তি + আইকন ×১ + রিড-ওনলি-সীমা + aria-label-গণনা + সিবলিং-নির্বাচন); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: super/settings.ejs + super/support-settings.ejs (সিবলিং), admin-সাব-তালিকা (notices/events/gallery/members/resources-list), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session275-জোড়া: feature + worklog); working-tree ক্লিন

"""
    src = src.rstrip() + '\n' + TASK
    io.open(P, 'w', encoding='utf-8').write(src)
    print('OK: worklog Task-115-সংযোজন')

print('DOCS-DONE')
