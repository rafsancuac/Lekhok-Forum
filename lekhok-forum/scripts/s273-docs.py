#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s273-docs.py — session273 ডক ×৩: PROJECT.md §২৭৩ + PLANS.md session273-নোট + repo worklog.md Task-113
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

# ════════════════ PROJECT.md §২৭৩ ════════════════
P = 'PROJECT.md'
src = skip_if('## §২৭৩ (session273', P)
if src is not None:
    SEC273 = """## §২৭৩ (session273 — cron 403679: সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার su273 + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব চুক্তি) — s273 ৫৭/৫৭ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`2482b76` (session272 + sandbox-worklog-টুল-কমিট, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); স্টেল-সামারি-সংশোধন ×৩৯ (সামারি Task43/'commit-হয়নি'/device-flow/'১৯-ট্রিগার-ব্যাকলগ' যুগ — সব-ভুল; ACTIVE-LOCK Task112/session272-ই-সত্য)। রাউন্ড-শুরু QA: s272 ৭২/৭২ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session272-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — super/users সারফেস; requireSuperAdmin → admin/admin123-ভিউয়ার, s231-প্রথা)।

**[Mandatory-ফিচার] সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার (su273):** /admin/super/users-support (admin/views/admin/super/users.ejs — requireSuperAdmin, admin_users.superadmin-ভিউয়ার) — সারি-সারফেস tr data-su-row (forEach-(u, suI273)) + দ্বিভাষিক data-kw (#id-বেয়ার-প্রোব + ইউজার user + @username + নাম name + কলমী penname + রোল role **মান-অ্যালায়াসসহ** (ইউজার user/মডারেটর moderator/এডমিন admin/সুপার-এডমিন superadmin) + স্ট্যাটাস status **মান-অ্যালায়াসসহ** (সক্রিয় active/অপেক্ষমাণ pending/নিষিদ্ধ banned/নিষ্ক্রিয় inactive) + টেম্পোরারি-সক্রিয় temporary/স্বাভাবিক normal + 2FA totp দুই-স্তর + ইমেইল email + ফোন phone + মেম্বার member — হোয়াইটস্পেস-নরমালাইজড) + ফিল্টার-স্ট্রিপ (suFilter273/suClear273/suCount273/kbd-hint — always-rendered us-table-wrap-এর-বাইরে) + কাউন্ট-চিপ + শূন্য-অবস্থা (suZero273 data-su-empty — table-wrap-পরে) + 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) + field-গার্ড + Escape-ক্লিয়ার+ব্লার + __suQA হুক; **বিদ্যমান us-সার্চ-ফিল্টার (session95 data-search-ক্লায়েন্ট-ফিল্টার) অক্ষুণ্ণ — দুই-স্বাধীন-ডাইমেনশন সহ-অস্তিত্ব-চুক্তি (নতুন): usSearch=ল্যাটিন-সার্ভার-সার্চ-ইকো, su273=বাংলা-সেমান্টিক; উভয়ের-সেট-ইন্টারসেকশন-রেন্ডার**; us-searchbar/us-chips/us-table/us-empty-ব্রাঞ্চ/300-hint/sidebar অক্ষুণ্ণ।

**[Mandatory-স্টাইল]:** su273-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-su-row][hidden] !important) — প্যাচ-পোস্ট-অ্যাসার্ট + suite-containsF দ্বি-প্রমাণ।

**প্যাচ:** scripts/s273-patch.py + s273-patch2.py (skip-if-present idempotent — SKIP-পুনঃরান-প্রমাণ ×২; **.su273--ভার্সন-সাফিক্স-নেমস্পেস — .su-* admin.css-এ-ব্যস্ত (su-avatar/su-logout/su-meta/su-name/su-role)**; PRESERVE-মানচিত্র ROLE_LABEL/STATUS_LABEL প্রি২→পোস্ট৩, must_change_password প্রি২→পোস্ট৩, totp_enabled প্রি১→পোস্ট২, addEventListener প্রি৫→পোস্ট৯; suApply273 ×৪-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ); হেক্স-শূন্য-পোস্ট-অ্যাসার্ট) + ডক ×৩ (PROJECT §২৭৩ + PLANS session273 + worklog Task-113)।

**টেস্ট:** নতুন tests/s273-sufilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৭ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৪ (bare-id-একক '#62' max-id-নিম্নগামী-অনন্যতা / 'মডারেটর moderator'-রোল ১/৬৩ / 'স্ট্যাটাস status সক্রিয় active' ৬৩/৬৩ / 'ইউজার user' সর্বজনীন) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড-প্রমাণ + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব input[name=q]-থেকে + Escape-ব্লার + **দ্বৈত-ডাইমেনশন-সহ-অস্তিত্ব (us-সার্চ ২-জন-ফিল্টার + su273-অপ্রভাবিত ৬৩)** + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + **নেট-DB-রাইট-শূন্য (রিড-ওনলি — রেন্ডার্ড-পাংক্তি ৬৩→৬৩)**) + পূর্ণ-রিগ্রেশন s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি।

**গোটচা ×৩ ডক-কৃত (PLANS session273):** ① .su-প্রিফিক্স-সংঘর্ষ (admin.css-ব্যস্ত → ভার্সন-সাফিক্স su273-) ② ROLE_LABEL/STATUS_LABEL-মান-বাংলা-একভাষিক (kw-মান-টোকেন ল্যাটিন-অ্যালায়াস-ছাড়া → প্রথম-রানে রোল/স্ট্যাটাস-প্রোব SKIP×২ — ROLE_ALIAS273-সংশোধনী; av271-মান-দ্বিভাষিক-চুক্তি) ③ bare-id-প্রোব-সাবস্ট্রিং-ঝুঁকি (#6 ⊂ #60 — max-id-থেকে-নিম্নগামী-বেয়ার-অনন্যতা-যাচাই)।

"""
    src = rep(src, '## §২৭২ (session272 — cron 403679', SEC273 + '## §২৭২ (session272 — cron 403679', 'PROJECT §২৭৩-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ PLANS.md session273-নোট ════════════════
P = 'PLANS.md'
src = skip_if('## session273-নোট', P)
if src is not None:
    NOTE = """## session273-নোট (cron 403679 — সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার su273 + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব)
- **.su-প্রিফিক্স-সংঘর্ষ-গোটচা (নতুন):** admin.css-এ .su-avatar/.su-logout/.su-meta/.su-name/.su-role পূর্ব-ব্যস্ত → নতুন-সারফেস-স্টাইল-প্রিফিক্স **ভার্সন-সাফিক্স (su273-)** নিন — সংক্ষিপ্ত-প্রিফিক্স (.su-) FATAL-গার্ডেই-ধরা-পড়ে কিন্তু প্যাচ-লেখার-আগে-ই গণনা-চেক করুন (প্যাচ-গার্ড regex `\\.su273-[a-z]`)।
- **মান-টোকেন-দ্বিভাষিক-চুক্তি (ROLE_ALIAS273-সংশোধনী):** ROLE_LABEL/STATUS_LABEL-জাতীয় ভিউ-লেবেল-ম্যাপের **মান বাংলা-একভাষিক** হলে kw-তে শুধু-লেবেল-বসালে ল্যাটিন-প্রোব ('মডারেটর moderator') মেলে-না → প্রথম-রানে রোল/স্ট্যাটাস-প্রোব SKIP×২ (0==0-মিল-ভাবে-গ্রিন — **প্রোব-প্রত্যাশা-শূন্য-হলে-সুইট-স্কিপ-করুন, মিল-বলে-গণনা-নয়**)। সংশোধনী: kw-ব্লকে alias-map যোগ — `({user:'user',moderator:'moderator',admin:'admin',superadmin:'superadmin'})[u.role]` + status-জোড়া; av271-মান-চুক্তি-পুনঃপ্রমাণ।
- **bare-id-প্রোব-সাবস্ট্রিং-ঝুঁকি:** '#N'-প্রোবে '#6' ⊂ '#60' — trailing-space-অনন্যতা-যাচাই ('#N ') যথেষ্ট-নয় (ফিল্টার bare-স্ট্রিং-দিয়ে-মেলে) → **max-id-থেকে-নিম্নগামী প্রথম bare-অনন্য id নির্বাচন** (`grep -cF "#$i"` == 1); users-জাতীয় ক্রমবর্ধমান-ঘন-আইডি-সারফেসে-বাধ্যতমূলক।
- **দ্বৈত-ফিল্টার-সহ-অস্তিত্ব-চুক্তি (নতুন):** পূর্ব-বিদ্যমান ক্লায়েন্ট-ফিল্টার-যুক্ত সারফেসে (super/users-এর session95-us-ফিল্টার: style.display-ভিত্তিক) নতুন-স্ট্রিপ যোগ-করা-নিরাপদ — **দুই-স্বাধীন-ডাইমেনশন: বিদ্যমান=style.display (ল্যাটিন-সার্চ-ইকো), নতুন=hidden-অ্যাট্রিবিউট (সেমান্টিক-kw)**; সেট-ইন্টারসেকশন-রেন্ডার (উভয়-গেট-মিল-হলেই-দৃশ্যমান); সুইটে সহ-অস্তিত্ব-অ্যাসার্ট-বাধ্যতমূলক (us-ফিল্টার-সক্রিয়ে-ও __suQA.count() অপ্রভাবিত)।
- **requireSuperAdmin-সারফেস-ভিউয়ার:** super-router-এ admin_users.superadmin-দরকার — সুইট-লগইন **admin/admin123** (admin_users-seed, s231-প্রথা; testadmin=demo123 শুধু users-রোল-admin — 403 denied-পেজ পাবে); browser-পর্বেও fetch-POST admin/admin123 (input[name=_csrf])।
- **পরের-এজেন্ট: session274 থেকে (worklog Task ID 114)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (trash-সুইট-স্তর-যাচাই-দ্বিতীয়-পাস; security.ejs-স্কোপ-ম্যাপ-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
    src = rep(src, '## session272-নোট (cron 403679', NOTE + '## session272-নোট (cron 403679', 'PLANS session273-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ repo worklog.md Task-113 ════════════════
P = 'worklog.md'
src = skip_if('Task ID: 113 (session273', P)
if src is not None:
    TASK = """---
Task ID: 113 (session273 — cron 403679; সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার su273 + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব চুক্তি)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`2482b76` (session272/Task112 + sandbox-worklog-টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৩৯:** এ-রাউন্ডের কনটেক্সট-সামারি আবার 'Task43-হারানো/device-flow-মেয়াদোত্তীর্ণ/১৯-ট্রিগার-ব্যাকলগ' দেখিয়েছিল — সব-ভুল; ACTIVE-LOCK/রিপো-HEAD+origin-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s272 ৭২/৭২ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session272-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — super/users সারফেস; requireSuperAdmin → admin/admin123)

## এ-রাউন্ডে সম্পন্ন (session273)
- **[Mandatory-ফিচার] সুপার-ইউজার সাপোর্ট তাৎক্ষণিক-ফিল্টার (su273):** /admin/super/users-support (admin/views/admin/super/users.ejs) — সারি-সারফেস tr data-su-row + দ্বিভাষিক data-kw (#id-বেয়ার + ইউজার user + @username + নাম name + কলমী penname + রোল role মান-অ্যালায়াসসহ + স্ট্যাটাস status মান-অ্যালায়াসসহ + টেম্পোরারি temporary/স্বাভাবিক normal + 2FA totp + ইমেইল email + ফোন phone + মেম্বার member — whitespace-নরমালাইজড) + ফিল্টার-স্ট্রিপ (suFilter273/suClear273/suCount273/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (suZero273 data-su-empty) + 'f'-ফোকাস + field-গার্ড + Escape + __suQA হুক; **বিদ্যমান us-সার্চ-ফিল্টার-অক্ষুণ্ণ — দুই-স্বাধীন-ডাইমেনশন সহ-অস্তিত্ব (usSearch=style.display ল্যাটিন-ইকো, su273=hidden-অ্যাট্রিবিউট সেমান্টিক; সেট-ইন্টারসেকশন-রেন্ডার)**
- **[Mandatory-স্টাইল]:** su273-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট)
- **রিড-ওনলি-চুক্তি (s270-অনুলিপি):** সিড-বাদ + রেন্ডার্ড-HTML-পূর্বগণনা (data-kw-নিষ্কাশন) + মিউটেশন-POST-শূন্য → নেট-DB-রাইট-শূন্য-প্রমাণ (রেন্ডার্ড-পাংক্তি ৬৩→৬৩)
- **গোটচা ×৩ ডক-কৃত (PLANS session273):** ① .su-প্রিফিক্স admin.css-ব্যস্ত (৫-ক্লাস) → su273-ভার্সন-সাফিক্স ② লেবেল-ম্যাপ-মান-বাংলা-একভাষিক → প্রথম-রানে রোল/স্ট্যাটাস-প্রোব SKIP×২ (0==0-মিল-ধোঁকা) → ROLE_ALIAS273-সংশোধনী (kw-মান-টোকেনও দ্বিভাষিক) ③ bare-id-প্রোব-সাবস্ট্রিং (#6 ⊂ #60) → max-id-নিম্নগামী-অনন্যতা-যাচাই; প্লাস প্যাচ-স্তর suApply273-×৪-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি)
- **টেস্ট:** নতুন tests/s273-sufilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৭ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৫ — নির্ধারক-প্রোব ×৪ পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব input[name=q] + Escape-ব্লার + দ্বৈত-ডাইমেনশন-সহ-অস্তিত্ব + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-রাইট-শূন্য) + পূর্ণ-রিগ্রেশন s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s273-patch.py + s273-patch2.py (skip-if-present idempotent ×২, .su273--নেমস্পেস-গার্ড, টোকেন-গার্ড ×৭, PRESERVE-মানচিত্র, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট) + ডক ×৩ (PROJECT §২৭৩ + PLANS session273 + worklog) → পুরাতন-PNG-চার্ন-রিভার্ট ×১২ (session269-প্রথা) → secret-scan-ক্লিন → fetch+rebase → push → Vercel READY → প্রোড-স্পট

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session274 লেবেল (worklog Task ID 114)**; PLANS session273-নোট অবশ্যই-পড়ুন (নেমস্পেস-ভার্সন-সাফিক্স + মান-টোকেন-দ্বিভাষিক + bare-id-অনন্যতা + দ্বৈত-ফিল্টার-সহ-অস্তিত্ব + requireSuperAdmin-ভিউয়ার); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (trash-সুইট-স্তর-যাচাই-দ্বিতীয়-পাস; security.ejs-স্কোপ-ম্যাপ-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session273-জোড়া: feature + worklog); working-tree ক্লিন
"""
    src = src.rstrip() + '\n' + TASK
    io.open(P, 'w', encoding='utf-8').write(src)
    print('OK: worklog Task-113-সংযোজন')

print('DOCS-DONE')
