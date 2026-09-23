#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s274-docs.py — session274 ডক ×৩: PROJECT.md §২৭৪ + PLANS.md session274-নোট + repo worklog.md Task-114
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

# ════════════════ PROJECT.md §২৭৪ ════════════════
P = 'PROJECT.md'
src = skip_if('## §২৭৪ (session274', P)
if src is not None:
    SEC = """## §২৭৪ (session274 — cron 403679: সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার sa274 + কার্ড-সারফেস-বিশেষায়ণ + marker-seed-নেট-শূন্য-ই২ই) — s274 ৬১/৬১ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`1e0ec8c` (session273 + টুল-কমিট, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); স্টেল-সামারি-সংশোধন ×৪০। রাউন্ড-শুরু QA: s273 ৫৭/৫৭ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — super/admins সারফেস নির্বাচন: su273-এর requireSuperAdmin-সিবলিং; ব্যতিক্রমী-সুবিধা — পূর্ণ-CRUD-রুট বিদ্যমান (add/remove/lock/unlock) → marker-seed-নেট-শূন্য-ই২ই সম্ভব)।

**[Mandatory-ফিচার] সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার (sa274):** /admin/super/admins (admin/views/admin/super/admins.ejs — requireSuperAdmin, admin_users-তালিকা) — **কার্ড-ভিত্তিক-সারফেস-বিশেষায়ণ (ফ্যামিলির-প্রথম tr-বিহীন):** সারি-সারফেস div[data-sa-row] (super-admin-card-এ) + দ্বিভাষিক data-kw (#id + অ্যাডমিন admin + @username + নাম name + রোল role মান-অ্যালায়াসসহ (সুপার-এডমিন superadmin/এডমিন admin) + লকড locked/আনলকড unlocked + 2FA totp + স্কোপ scope কী-তালিকা/সীমাহীন unlimited + যুক্ত added — whitespace-নরমালাইজড; **aScopes-বিদ্যমান-ভিউ-ভেরিয়েবল-পুনঃব্যবহার**) + ফিল্টার-স্ট্রিপ (saFilter274/saClear274/saCount274/kbd-hint — always-rendered section-head-এর-আগে) + কাউন্ট-চিপ + শূন্য-অবস্থা (saZero274 data-sa-empty — cards-loop-পরে) + 'f'-ফোকাস (একক-স্ট্রিপ) + field-গার্ড + Escape + __saQA হুক; নতুন-অ্যাডমিন-ফর্ম/স্কোপ-ম্যাক/js-confirm/সেলফ-নোট/remove-রুট অক্ষুণ্ণ।

**[Mandatory-স্টাইল]:** sa274-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — **[data-sa-row][hidden] !important — অ্যাট্রিবিউট-সিলেক্টর (element-অজ্ঞেয়)**)।

**প্যাচ:** scripts/s274-patch.py (skip-if-present idempotent — SKIP-পুনঃরান-প্রমাণ, .sa274--নেমস্পেস-গার্ড, অ্যাঙ্কর ×৬-অনন্যতা, PRESERVE-মানচিত্র (aScopes প্রি৫→পোস্ট৭-প্রথম-রানে-ধরা — ফাইল-অলিখিত; isSelf/js-confirm/SUPER_AREAS/card অপরিবর্তিত; addEventListener প্রি১→পোস্ট৫), হেক্স-শূন্য-পোস্ট-অ্যাসার্ট + সঠিক-বাইট ×৩) + ডক ×৩।

**টেস্ট:** নতুন tests/s274-safilter-suite.sh **৬১/৬১ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×১৭ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৫ (bare-id '#3' একক / 'সুপার-এডমিন superadmin' ১/৩ / 'রোল role এডমিন admin' ২/৩ **superadmin-অবিচ্ছিন্ন-প্রমাণ** / 'QA-274' নাম ২/৩ / 'অ্যাডমিন admin' সর্বজনীন) + নো-ম্যাচ→শূন্য + সব-কার্ড-hidden + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব input[name=username]-থেকে (id-বিহীন-ইনপুট — activeElement.name-যাচাই) + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + **marker-seed-নেট-শূন্য-ই২ই: POST add ×২ (Location saved=admin_add-প্রমাণ, কার্ড ১→৩) → POST remove ×২ (Location saved=admin_remove) → ids PRE == FINAL + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে**) + পূর্ণ-রিগ্রেশন s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি।

**গোটচা ×৩ ডক-কৃত (PLANS session274):** ① কার্ড-সারফেস-গার্ড (tr[data-x-row]-নয় — [data-x-row][hidden] অ্যাট্রিবিউট-সিলেক্টর element-অজ্ঞেয়) ② **'এডমিন admin' ⊄ 'সুপার-এডমিন superadmin'-প্রোব-বিচ্ছিন্নতা** (বাংলা-অক্ষর-ভিন্ন — অ্যাডমিন-এ-এ-নেই; superadmin-এক-শব্দ — 'admin'-সাবস্ট্রিং-থাকলেও পূর্ববর্তী-স্পেস-জোড়া-মেলে-না) ③ id-বিহীন-ইনপুট-ফিল্ড-গার্ড (activeElement.name-যাচাই — id-assert-অসম্ভব)।

"""
    src = rep(src, '## §২৭৩ (session273 — cron 403679', SEC + '## §২৭৩ (session273 — cron 403679', 'PROJECT §২৭৪-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ PLANS.md session274-নোট ════════════════
P = 'PLANS.md'
src = skip_if('## session274-নোট', P)
if src is not None:
    NOTE = """## session274-নোট (cron 403679 — সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার sa274 + কার্ড-সারফেস + marker-seed-নেট-শূন্য-ই২ই)
- **কার্ড-সারফেস-গার্ড-চুক্তি (নতুন — ফ্যামিলির-প্রথম tr-বিহীন সারফেস):** টেবিল-বিহীন কার্ড-তালিকায় (super/admins) hidden-গার্ড **[data-sa-row][hidden] { display:none !important }** — অ্যাট্রিবিউট-সিলেক্টর element-ট্যাগ-অজ্ঞেয় (div/section/সব-কাজে); `tr[data-x-row]`-ছাড়া-ও প্যাটার্ন-অক্ষত — ভবিষ্যৎ-কার্ড/তালিকা-সারফেসে এ-রূপই অনুলিপি।
- **প্রোব-বিচ্ছিন্নতা-গোটচা (বাংলা-লেবেল-জোড়া):** 'এডমিন admin'-প্রোব 'সুপার-এডমিন superadmin'-কার্ড-মেলে-না (অ্যা→এ-অক্ষর-ভিন্ন + 'superadmin'-এক-শব্দ — শেষের-'admin'-সাবস্ট্রিং থাকলেও পূর্ববর্তী-স্পেস-জোড়া মেলে-না) — কিন্তু **ল্যাটিন-একক-প্রোব ('admin') হলে দুই-রোলেই-মেলে** — রোল-বিভাজক-প্রোব সর্বদা 'রোল role এডমিন admin'-পূর্ণ-জোড়া; সুইটে দ্বি-রোল-প্রোব (super=১, admin=২) দ্বি-প্রমাণ।
- **id-বিহীন-ইনপুট-ফিল্ড-গার্ড:** প্রোব-উৎস-ইনপুটের id-না-থাকলে (নতুন-অ্যাডমিন-ফর্মের input[name=username]) activeElement-assert **.name-দিয়ে** (id-দিয়ে-নয়); প্যাটার্ন-অ্যাট্রিবিউট-যুক্ত-ইনপুট-ও-গার্ডেড (browser-এ focus+dispatch — pattern-required-বাধা-নেই)।
- **marker-seed-নেট-শূন্য-ই২ই (s272-চুক্তির সম্প্রসারণ — সম্পূর্ণ-CRUD-সারফেস):** add/remove-জোড়া-রুট-থাকলে seed=POST add ×২ (Location saved=admin_add-প্রমাণ) → ক্লিনার=POST :id/remove ×২ (Location saved=admin_remove) → **ids PRE == FINAL (data-kw-#N-নিষ্কাশন — isSelf-কার্ডে remove-ফর্ম-নেই তাই remove-form-অ্যাকশন-থেকে-নয়)** + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (পুরাতন-qa274-মার্কার থাকলে আগে-সরানো); superadmin-সিড-নিষিদ্ধ (শেষ-সুপার-অ্যাডমিন-গার্ড + self-remove-গার্ড — role=admin-ই-সিড)।
- **সিবলিং-সারফেস-নির্বাচন:** এক-রাউন্ড-পরপর একই-গার্ডের (requireSuperAdmin) সিবলিং-সারফেস (super/users → super/admins) = সুইট-কাঠামো/লগইন/csrf-চুক্তি-পুনঃব্যবহাযোগ্য — দ্রুততম-ফিচার-পথ; পরের-সিবলিং: super/dashboard.ejs (forEach ×৬), super/settings.ejs, super/support-settings.ejs।
- **পরের-এজেন্ট: session275 থেকে (worklog Task ID 115)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়! — force-push-পার্জ-পুনরাবৃত্তি-সম্ভব: `git rebase --onto origin/main <pre-base> main`); বাকি-প্রস্তাব: admin-প্যানেল-সাব-তালিকা-সারফেস (notices/events/gallery/members/resources-list — admin-ভার্সন-এখনো-অফিল্টারড; moderator-সংস্করণ-সুইটেড s260-২৬১), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
    src = rep(src, '## session273-নোট (cron 403679', NOTE + '## session273-নোট (cron 403679', 'PLANS session274-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ repo worklog.md Task-114 ════════════════
P = 'worklog.md'
src = skip_if('Task ID: 114 (session274', P)
if src is not None:
    TASK = """---
Task ID: 114 (session274 — cron 403679; সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার sa274 + কার্ড-সারফেস-বিশেষায়ণ + marker-seed-নেট-শূন্য-ই২ই)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`1e0ec8c` (session273/Task113 + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪০:** কনটেক্সট-সামারির-পুরাতন-যুগ-দাবি (Task43/'commit-হয়নি'/device-flow/ব্যাকলগ) — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s273 ৫৭/৫৭ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (সিবলিং-সারফেস-নির্বাচন: super/admins — su273-এর requireSuperAdmin-গার্ড-ভাগী; পূর্ণ-CRUD-রুট-বিদ্যমান)

## এ-রাউন্ডে সম্পন্ন (session274)
- **[Mandatory-ফিচার] সুপার-অ্যাডমিন তালিকা তাৎক্ষণিক-ফিল্টার (sa274):** /admin/super/admins — **কার্ড-ভিত্তিক-সারফেস (ফ্যামিলির-প্রথম tr-বিহীন):** div[data-sa-row] + দ্বিভাষিক data-kw (#id + অ্যাডমিন admin + @username + নাম name + রোল role মান-অ্যালায়াসসহ + লকড locked/আনলকড unlocked + 2FA totp + স্কোপ scope কী-তালিকা/সীমাহীন unlimited + যুক্ত added — aScopes-ভিউ-ভেরিয়েবল-পুনঃব্যবহার) + ফিল্টার-স্ট্রিপ (saFilter274/saClear274/saCount274/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (saZero274 data-sa-empty) + 'f'-ফোকাস + field-গার্ড + Escape + __saQA হুক; নতুন-অ্যাডমিন-ফর্ম/স্কোপ-ম্যাক/js-confirm/সেলফ-নোট অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** sa274-ব্লক হেক্স-শূন্য টোকেন-শুধু + hidden-গার্ড ×৩ সঠিক-বাইট (**[data-sa-row][hidden] !important — অ্যাট্রিবিউট-সিলেক্টর**)
- **marker-seed-নেট-শূন্য-ই২ই (s272-চুক্তি-সম্প্রসারণ):** POST add ×২ (Location saved=admin_add) → POST remove ×২ (Location saved=admin_remove) → ids PRE == FINAL (data-kw-#N-নিষ্কাশন) + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে; role=admin-ই-সিড (self/last-super-গার্ড-এড়ানো)
- **গোটচা ×৩ ডক-কৃত (PLANS session274):** ① কার্ড-সারফেস-গার্ড (অ্যাট্রিবিউট-সিলেক্টর element-অজ্ঞেয়) ② রোল-প্রোব-বিচ্ছিন্নতা ('রোল role এডমিন admin'-পূর্ণ-জোড়া — ল্যাটিন-একক-'admin'-প্রোব superadmin-এ-ও-মেলে) ③ id-বিহীন-ইনপুট-ফিল্ড-গার্ড (activeElement.name-যাচাই); প্লাস প্যাচ-স্তর aScopes-প্রি৫→পোস্ট৭-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত)
- **টেস্ট:** নতুন tests/s274-safilter-suite.sh **৬১/৬১ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×১৭ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৫ পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য + সব-কার্ড-hidden + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড input[name=username] (activeElement.name) + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য-ই২ই) + পূর্ণ-রিগ্রেশন s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s274-patch.py (idempotent ×২, .sa274--নেমস্পেস-গার্ড, PRESERVE-মানচিত্র, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৩) + ডক ×৩ (PROJECT §২৭৪ + PLANS session274 + worklog) → পুরাতন-PNG-চার্ন-রিভার্ট (session269-প্রথা) → secret-scan-ক্লিন → fetch (origin-অনড়) → push → Vercel READY → প্রোড-স্পট

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session275 লেবেল (worklog Task ID 115)**; PLANS session274-নোট অবশ্যই-পড়ুন (কার্ড-সারফেস-গার্ড + প্রোব-বিচ্ছিন্নতা + id-বিহীন-গার্ড + marker-seed-ই২ই + সিবলিং-নির্বাচন); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়! force-push-পার্জ-পুনরাবৃত্তি-সম্ভব — `--onto`-rebase-প্রথা)
- বাকি-প্রস্তাব: admin-প্যানেল-সাব-তালিকা (notices/events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড), super/dashboard.ejs (সিবলিং), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session274-জোড়া: feature + worklog); working-tree ক্লিন

"""
    src = src.rstrip() + '\n' + TASK
    io.open(P, 'w', encoding='utf-8').write(src)
    print('OK: worklog Task-114-সংযোজন')

print('DOCS-DONE')
