#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s262-docs.py — session262 (Task ID 102) ডক ×৩: PROJECT §২৬২ + PLANS session262-নোট + repo worklog Task-102 এন্ট্রি"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SEC261_HDR = '## §২৬১ (session261 — cron 403679'

S262_PROJECT = """## §২৬২ (session262 — cron 403679: ইউজার তাৎক্ষণিক-ফিল্টার muf262 — au251-এর moderator-স্কোপড-ভ্যারিয়েন্ট) — s262 ৪৮/৪৮ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`8b30ad7` (session261/Task101, clean-tree); GH /user→200; স্থায়ী-সার্ভার-জীবিত; রাউন্ড-শুরু QA: s261 ৫০/৫০ + role-policy ২৬০/২৬০ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session261-বাকি-প্রস্তাব গ্রহণ: moderator-users-স্কোপড-ফিল্টার-ভ্যারিয়েন্ট)।

**[Mandatory-ফিচার] ইউজার তাৎক্ষণিক-ফিল্টার (muf262 — স্কোপড-ভ্যারিয়েন্ট):** /moderator/users — `tr[data-muf-row]`-সারি-সূচক + `data-kw` (#আইডি+@ইউজারনেম+ইউজারনেম+পূর্ণ-নাম+রোল-বাংলা-লেবেল+রোল-ইংরেজি-কী+স্ট্যাটাস-বাংলা-লেবেল+স্ট্যাটাস-ইংরেজি-কী+যোগদান-তারিখ+শেষ-লগইন) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + clear-বাটন + **__mufQA হুক (total/count/apply/clear)**; mu-search (GET DB-সার্চ — সম্পূরক-স্তর), mu-stats চিপ, data-mu-confirm নিষেধ-ফর্ম, mu-reason details, ঊর্ধ্বতন-লক (mu-lock), তদারকি-ফিড (mu-feed), স্মরণী — সম্পূর্ণ অক্ষুণ্ণ; hidden-গার্ড ×৩। **স্কোপ-বাউন্ডারি:** au251-admin-ভিউ-এর kw-এ email ছিল — moderator-ভিউ email দেখে না → **kw-তে email ইচ্ছাকৃত-বাদ** (সুইটে email-স্বাক্ষর-শূন্য-অ্যাসার্ট)।

**নেমস্পেস-সংঘর্ষ-বিতাড়ন (নতুন-গোটচা শ্রেণি):** এ-পেজের `.mu-*` CSS (session90-পেজ-স্তর) পূর্ব-দখলকৃত — ফিল্টার-প্রিফিক্স **muf** (মডারেটর-ইউজার-ফিল্টার) নেমস্পেস-পৃথক; সুইটে `.muf-instant`-নেমস্পেস-পৃথকতা-অ্যাসার্ট।

**[Mandatory-স্টাইল]:** muf262 ব্লক **হেক্স-শূন্য টোকেন-শুধু** (guard-র্যাচেট-নিরাপদ) — ফোকাস-রিং color-mix brandgreen-tint + dashed kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন (kbd-none) + muf-zero টোকেন-বক্স + সারি/চিপ/শূন্য-বক্স hidden-গার্ড-ত্রয়ী।

**সিড-শূন্য-চুক্তি-বর্ধন (ডেটা-নির্ভর-প্রোব):** রিড-ওনলি-UI (DB-রাইট-শূন্য — s251/s256-নীতি) — বাস্তব-ডেটাই-সত্য: প্রোব-পূর্বে রেন্ডার্ড-HTML-থেকেই প্রতিটি শব্দ-প্রোবের **প্রত্যাশিত-মিল-পূর্বগণনা** (ACTIVEN/BANNEDN/ADMINN), ব্রাউজার-কাউন্টের-সাথে **সঠিক-মিল-অ্যাসার্ট**; ডেটায়-অনুপস্থিত-শ্রেণি (এ-রাউন্ডে নিষিদ্ধ-ইউজার-শূন্য) → **শর্তসাপেক্ষ-স্কিপ** (মিথ্যা-ফেল-বিতাড়ন — s251-কোল্ড-স্টার্ট-পাঠ প্রয়োগ); '@testadmin' একক-মিল-পূর্বশর্ত-অ্যাসার্ট।

**টেস্ট:** নতুন tests/s262-mufilter-suite.sh **৪৮/৪৮ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো ×১৬ + স্টাইল ×১০ + আচরণ ×১২ + পূর্বশর্ত ×৪ রিয়েল-ব্রাউজার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি-নিশ্চয়তা) + role-policy **২৬০/২৬০** + s261 **৫০/৫০** + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs) + EJS-compile-প্রমাণ + স্ক্রিনশট ×২ কমিটেড।

**গোটচা ×২ (PLANS session262):** ① মিথ্যা-ডেটা-নির্ভর-ফেল (রেঞ্জ-অ্যাসার্ট `[1..total]` ডেটায়-শ্রেণি-শূন্য-হলে ০-ফেরত দেয় — পূর্বগণনা-সঠিক-মিল + শর্তসাপেক্ষ-স্কিপই-পথ) ② পেজ-স্তর-CSS-প্রিফিক্স-সংঘর্ষ (mu/muf — নতুন-ফিল্টার-যোগের-আগে পেজের-বিদ্যমান-নেমস্পেস-ম্যাপ করুন)। **পরের-এজেন্ট: session263 (Task ID 103)** — PLANS session262-নোট অবশ্যই-পড়ুন; push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই), moderator-dashboard-সারফেস-ফিল্টার, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""

S262_PLANS = """## session262-নোট (cron 403679 — ইউজার তাৎক্ষণিক-ফিল্টার muf262 — স্কোপড-ভ্যারিয়েন্ট)
- **স্কোপড-ভ্যারিয়েন্ট-ম্যাপিং (au251 বনাম muf262):** admin /admin/users kw = username+full_name+**email**+role+status (ইংরেজি-কী-শুধু, লোয়ারকেস-সার্ভার-স্তর); moderator /moderator/users kw = #আইডি+@ইউজারনেম+ইউজারনেম+পূর্ণ-নাম+রোল-বাংলা+রোল-কী+স্ট্যাটাস-বাংলা+স্ট্যাটাস-কী+যোগদান+শেষ-লগইন — **email-বাদ (মডারেটর-স্কোপ-রেডলাইন: ভিউ-ই-ইমেইল-দেখে-না)** + যোগদান/লগইন-তারিখ-সংযোজন; দ্বি-ভাষা-kw (বাংলা-লেবেল+ইংরেজি-কী — ব্যবহারকারী-যে-ভাষাতেই-লিখুক-মেলে)।
- **ডেটা-নির্ভর-প্রোব-চুক্তি (নতুন, পুনঃব্যবহারযোগ্য):** সিড-শূন্য-সুইটে শব্দ-প্রোবের প্রত্যাশা **রেন্ডার্ড-HTML-পূর্বগণনা** থেকে নিন (grep data-kw → ACTIVEN/BANNEDN/ADMINN) → ব্রাউজার-কাউন্ট সঠিক-মিল; গণনা-০ হলে শ্রেণিটি বাস্তব-ডেটায়-অনুপস্থিত → **skip** (রেঞ্জ-অ্যাসার্ট `[1..total]` ভুল — ০-ফেল-করে; s262-প্রথম-রানে ধরা-পড়া)। '@username'-প্রোব (একক-মিল-পূর্বশর্ত) সব-সময়-নির্ধারক।
- **নেমস্পেস-ম্যাপ-প্রথা:** নতুন-ফিল্টার-প্রিফিক্স বাছাইয়ের-আগে টার্গেট-পেজের-বিদ্যমান CSS-নেমস্পেস ম্যাপ করুন (moderator-users-এ .mu-* = session90-পেজ-CSS → ফিল্টার = muf); প্যাটার্ন: <feature-দুই-অক্ষর>+f বা <feature><n> — সংঘর্ষ-হলে অতিরিক্ত-অক্ষর (mr-res-row-এর re-মতো)।
- **muf262-সারফেস-চুক্তি:** হুক **__mufQA** (total/count/apply/clear); সারি = `tr[data-muf-row]` (প্রথম tr-ভিত্তিক-ফিল্টার — hidden-গার্ড `tr[data-muf-row][hidden]{display:none!important}`); data-kw-এক্সট্র্যাকশন = `grep -o 'data-kw="[^"]*"'`; mu-search/mu-stats/ban-ফর্ম/মু-ফিড অক্ষুণ্ণ।
- **পরের-এজেন্ট: session263 থেকে (worklog Task ID 103)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তির ব্রাউজার-পথ-প্রমাণ), moderator-dashboard-সারফেস-ফিল্টার (muf262-প্যাটার্ন-মিরর), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

S262_WORKLOG = """## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`8b30ad7` (session261/Task101, clean-tree) — স্টেল-সামারি-সংশোধন ×২৮ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল)। GH /user→200; স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর।

## এ-রাউন্ডে সম্পন্ন (session262)
- **রাউন্ড-আরম্ভ-যাচাই:** s261 ৫০/৫০ প্রথম-রানে + role-policy ২৬০/২৬০ + guard:design + audit:views — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session261-বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার)।
- **[Mandatory-ফিচার] ইউজার তাৎক্ষণিক-ফিল্টার (muf262):** /moderator/users — tr[data-muf-row] + দ্বি-ভাষা data-kw (#আইডি+@ইউজারনেম+নাম+রোল-বাংলা/কী+স্ট্যাটাস-বাংলা/কী+যোগদান+শেষ-লগইন — **email-বাদ = স্কোপ-রেডলাইন**) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + clear + **__mufQA হুক**; mu-search/mu-stats/ban-ফর্ম/মু-লক/মু-ফিড অক্ষুণ্ণ; hidden-গার্ড ×৩; **নেমস্পেস-বিতাড়ন:** .mu-* (session90) দখলকৃত → muf-প্রিফিক্স।
- **[Mandatory-স্টাইল]:** muf262-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড-ত্রয়ী)।
- **সিড-শূন্য-চুক্তি-বর্ধন:** ডেটা-নির্ভর-প্রোব (রেন্ডার্ড-HTML-পূর্বগণনা ACTIVEN/BANNEDN/ADMINN → সঠিক-মিল-অ্যাসার্ট; শ্রেণি-শূন্য → শর্তসাপেক্ষ-স্কিপ — মিথ্যা-ফেল-বিতাড়ন) + রিড-ওনলি-নিশ্চয়তা (সারি 63→63)।
- **টেস্ট:** নতুন tests/s262-mufilter-suite.sh **৪৮/৪৮ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো×১৬+স্টাইল×১০+আচরণ×১২ রিয়েল-ব্রাউজার + 390px + স্ক্রিনশট×২) + role-policy **২৬০/২৬০** + s261 ৫০/৫০ + guard/audit-গ্রিন + EJS-compile-প্রমাণ
- প্যাচ: scripts/s262-patch.py (skip-if-present idempotent) + ডক ×৩ (PROJECT §২৬২ + PLANS session262 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session263 লেবেল (worklog Task ID 103)**; PLANS session262-নোট অবশ্যই-পড়ুন (ডেটা-নির্ভর-প্রোব-চুক্তি + নেমস্পেস-ম্যাপ-প্রথা); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই, moderator-dashboard-সারফেস-ফিল্টার, Turso/প্রোড-পোর্ট
"""

def insert_before(path, anchor, text, label, marker):
    with io.open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    if marker in src:
        print(f'SKIP: {label} পূর্ব-উপস্থিত')
        return
    idx = src.find(anchor)
    if idx < 0:
        sys.exit(f'FATAL: {label}-অ্যাঙ্কর পাওয়া যায়নি')
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(src[:idx] + text + src[idx:])
    print(f'OK: {label} সন্নিবেশিত')

def append(path, text, label, marker):
    with io.open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    if marker in src:
        print(f'SKIP: {label} পূর্ব-উপস্থিত')
        return
    with io.open(path, 'a', encoding='utf-8') as f:
        f.write('\n' + text)
    print(f'OK: {label} সংযোজিত')

p = os.path.join(ROOT, 'PROJECT.md')
insert_before(p, SEC261_HDR, S262_PROJECT, 'PROJECT §২৬২', '§২৬২ (session262')

p = os.path.join(ROOT, 'PLANS.md')
append(p, S262_PLANS, 'PLANS session262-নোট', '## session262-নোট')

p = os.path.join(ROOT, 'worklog.md')
append(p, S262_WORKLOG, 'repo-worklog Task-102', 'এ-রাউন্ডে সম্পন্ন (session262)')
