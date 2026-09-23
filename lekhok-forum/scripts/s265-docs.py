#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s265-docs.py — session265 (Task ID 105) ডক ×৩ আপডেট (skip-if-present idempotent):
  ① PROJECT.md — §২৬৫ এন্ট্রি (§২৬৪-এর আগে, newest-first)
  ② PLANS.md — session265-নোট (session264-নোট-এর আগে)
  ③ worklog.md (repo) — Task 105 এন্ট্রি (ফাইল-শেষে append)
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(p):
    with io.open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ── ① PROJECT.md §২৬৫ ──
P = os.path.join(ROOT, 'PROJECT.md')
src = read(P)
if '§২৬৫ (session265' in src:
    print('SKIP: PROJECT.md §২৬৫ পূর্ব-উপস্থিত')
else:
    sec = """## §২৬৫ (session265 — cron 403679: অ্যাডমিন কমপ্লেইন্স-রিভিউ-ডেস্ক তাৎক্ষণিক-ফিল্টার ac265 — adf264-প্যাটার্ন-মিরর) — s265 ৫৭/৫৭ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`5b14313` (session264/Task104, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪ — canonical ক্লোনে session264-কোড); রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s264 ৫৬/৫৬ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session264-বাকি-প্রস্তাব গ্রহণ: লেগেসি-সুইট অ্যাঙ্করড-চেক-স্ক্যান + admin-অভিযোগ-সারফেস)।

**[Mandatory-ফিচার] অ্যাডমিন কমপ্লেইন্স তাৎক্ষণিক-ফিল্টার (ac265):** /admin/complaints (admin/views/admin/complaints.ejs) — অভিযোগ-কার্ড-সারফেস (div.card) `data-ac-row` (forEach-(c,i)-ইনডেক্স) + দ্বিভাষিক `data-kw` (#আইডি + অভিযোগ/complaint + বিষয় + জমাদানকারী-নাম + @ইউজারনেম + /profile/পাথ + স্ট্যাটাস-বাংলা/কী (new/in_review/resolved/dismissed + review/done/closed) + তারিখ + বডি-১৪০-স্লাইস-স্পেস-নরমাল + সংযুক্তি-ফাইলনাম + attachment + অভ্যন্তরীণ-নোট) + ফিল্টার-স্ট্রিপ (acFilter265 + acClear265 + acCount265 + ac-kbd-hint) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স (acZero265 data-ac-empty) + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__acQA হুক (total/count/apply/clear — সারফেস-শূন্যে-ও-সংজ্ঞায়িত, session265-উন্নতি — adf264-এর early-return-বিহীন)**; স্ট্যাটাস-ট্যাব ×৫ / data-bulk-all / bulkBar / প্রতি-কার্ড PUT+DELETE ফর্ম / paperclip-সংযুক্তি / sidebar সম্পূর্ণ অক্ষুণ্ণ; নো-ডেটার 'card empty' ইচ্ছাকৃত-বাদ (সেটি নো-ডেটা-বক্স, সারফেস-সারি নয়)।

**[Mandatory-স্টাইল] ac265-ব্লক হেক্স-শূন্য টোকেন-শুধু:** color-mix(in srgb, var(--lf-brandgreen) …) ফোকাস-রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন (kbd-none) + **hidden-গার্ড ×৩ সঠিক-বাইট** (`.ac-count-chip[hidden]` / `.ac-zero[hidden]` / `.card[data-ac-row][hidden]` !important — প্যাচ-পোস্ট-অ্যাসার্ট (count==3) + suite-containsF দ্বি-প্রমাণ)।

**টেস্ট:** নতুন tests/s265-acfilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক** (কাঠামো ×২২ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার — নির্ধারক-প্রোব ×৪ ('অভিযোগ complaint'-সর্বজনীন / '#আইডি'-একক / 'নতুন new'-স্ট্যাটাস / '/profile/'-লিংক) রেন্ডার্ড-HTML-পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden + clear-পুনরুদ্ধার + চিপ-text/display-none + 'f'-ফোকাস bubbles:true + **ফিল্ড-গার্ড-প্রোব** (select[name=status]-থেকে 'f' → ফোকাস-চুরি-শূন্য — PUT-ফর্মযুক্ত-পেজে বাধ্যতমূলক-প্রমাণ) + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি সারফেস ১→১) + পূর্ণ-রিগ্রেশন s264 ৫৬/৫৬ + s263 ৫৩/৫৩ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন + EJS-রেন্ডার-প্রমাণ দুই-ধারা (sample ২-সারফেস ৩৯,৩৪১-বাইট + empty ০-সারফেস static-preserved ৪/৪ — scripts/s265-render-proof.js)।

**[সংহত] লেগেসি-সুইট অ্যাঙ্করড-চেক-স্ক্যান (session264-বাকি-প্রস্তাব):** scripts/s265-anchor-scan.py — tests/*.sh-এর URL-grep-স্ক্যান (অ্যাঙ্কর-শূন্য পেজ-পাথ যা login-পেজের উপসর্গ) → ১-ঝুঁকি (s263:৯৮ `grep -q '/moderator'`) → `grep -qE '/moderator/?$'`-সংহত (অ্যাঙ্করড-চেক-প্রথা-বিস্তার; রিগ্রেশন-গ্রিন)।

**গোটচা (PLANS session265):** ① **টুল-ডিসপ্লে-আর্টিফ্যাক্ট-পুনঃপ্রমাণ (s256-গোটচা ×২)** — টুল-আউটপুটে `[h`-ক্ষয় (`[hidden]`→`]idden]`-রূপে দৃশ্যমান); এ-রাউন্ডে রিপো-ব্যাপী ১০৩-'ভাঙা'-অনুমান **মিথ্যা-অ্যালার্ম** প্রমাণিত (পাইথন-স্তরের অগ্রবর্তী-ক্যারেক্টার-বিশ্লেষণ: ২২৮/২২৮ বৈধ `[hidden]`) — **ডিসপ্লে-স্তরের-উপর-ভিত্তি-করে রিপো-ব্যাপী ফিক্স নিষিদ্ধ; od -c/পাইথন-অ্যাসার্ট-ই-সত্য-উৎস** ② **empty-state দ্বৈত-শূন্য-বক্স** — 'card empty' (নো-ডেটা) বনাম acZero265 (ফিল্টার-নো-ম্যাচ) ভিন্ন-ভূমিকা; উভয়-সমলয়-রেন্ডার বৈধ।

**প্যাচ:** scripts/s265-patch.py (skip-if-present idempotent — ৫-সম্পাদনা, পুনঃরান SKIP-প্রমাণ, admin.css `.ac-`-সংঘর্ষ-FATAL-গার্ড) + scripts/s265-render-proof.js + scripts/s265-anchor-scan.py + ডক ×৩ (PROJECT §২৬৫ + PLANS session265 + এ-এন্ট্রি)।

"""
    anchor = '## §২৬৪ (session264'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PROJECT.md §২৬৫ সন্নিবেশিত')

# ── ② PLANS.md session265-নোট ──
P = os.path.join(ROOT, 'PLANS.md')
src = read(P)
if '## session265-নোট' in src:
    print('SKIP: PLANS.md session265-নোট পূর্ব-উপস্থিত')
else:
    sec = """## session265-নোট (cron 403679 — অ্যাডমিন কমপ্লেইন্স তাৎক্ষণিক-ফিল্টার ac265)
- **টুল-ডিসপ্লে-আর্টিফ্যাক্ট পুনঃপ্রমাণ (s256-গোটচা ×২ — সর্বোচ্চ-গুরুত্ব):** টুল-আউটপুট (Bash-প্রদর্শন) `[h`-ক্ষয় করে — `[hidden]` দেখায় `]idden]`-রূপে। এ-রাউন্ডে `src.count('idden]')`-স্ক্যান ১০৩-'ভাঙা'-দেখালেও অগ্রবর্তী-ক্যারেক্টার-বিশ্লেষণ প্রমাণ করল ২২৮/২২৮-ই বৈধ `[hidden]` (সংখ্যা-গণনা `idden]`-সাবস্ট্রিং বৈধ-রূপের-ভিতরেও-মেলে!)। **সত্য-উৎস = od -c / পাইথন-অ্যাসার্ট / grep -F-বাইট-ম্যাচ; ডিসপ্লে-স্তরের-উপর-ভিত্তি-করে রিপো-ব্যাপী ফিক্স করলে উল্টো-ক্ষতি।** ভবিষ্যৎ-এজেন্ট: 'ভাঙা-সিলেক্টর'-দেখলে প্রথমে পাইথন-স্তরে বাইট-যাচাই, তারপর-সিদ্ধান্ত।
- **empty-state দ্বৈত-শূন্য-বক্স-চুক্তি:** তালিকা-পেজে 'card empty' (নো-ডেটা, `complaints.length===0`-শাখা) বনাম ফিল্টার-শূন্য-অবস্থা (acZero265, `data-ac-empty`) — ভিন্ন-ভূমিকা; সারফেস-সারিতে নো-ডেটা-বক্স দেবেন-না; দুই-ধারা-রেন্ডার-প্রুফে (sample+empty) static-preserved-পৃথক-প্রত্যাশা (৭/৭ বনাম ৪/৪)।
- **__acQA হুক শূন্য-সারফেসে-ও-সংজ্ঞায়িত (session265-উন্নতি):** adf264-শৈলী early-return (`!rows.length → return`) বাদ — `if (!input) return`-ই-যথেষ্ট; ফলে নো-ডেটা-পেজেও `typeof __acQA === 'object'` + 'f'/Escape কার্যকর; সুইট-নির্ধারকতা-বাড়ে (ডেটা-নির্ভর-SKIP-হ্রাস)। ভবিষ্যৎ-ফিল্টার-প্যাচে-মিরর-করুন।
- **ফিল্ড-গার্ড-প্রোব-বিস্তার:** PUT-ফর্মযুক্ত পেজে (select/input এমবেডেড) কেবল body-dispatch-'f' নয় — **প্রকৃত-এলিমেন্ট-থেকে dispatch করে ফোকাস-চুরি-শূন্য-প্রমাণ বাধ্যতমূলক** (`select.focus(); select.dispatchEvent(keydown-f); activeElement === select`)।
- **অ্যাঙ্করড-চেক-স্ক্যান-প্রথা প্রতিষ্ঠিত:** scripts/s265-anchor-scan.py — নতুন-সুইটে URL-grep-অ্যাঙ্কর (`'/admin/complaints/?$'`-রূপ) বাধ্যতমূলক; স্ক্যান-রান-সহজ (১-ঝুঁকি s263:৯৮-সংহত)।
- **পরের-এজেন্ট: session266 থেকে (worklog Task ID 106)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তি), অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (messages/moderators/subscribers/tasks/activity/audit-প্রার্থী), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
    anchor = '## session264-নোট'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PLANS.md session265-নোট সন্নিবেশিত')

# ── ③ repo worklog.md Task 105 append ──
P = os.path.join(ROOT, 'worklog.md')
src = read(P)
if 'Task ID: 105 (session265' in src:
    print('SKIP: repo-worklog Task 105 পূর্ব-উপস্থিত')
else:
    sec = """
---
Task ID: 105 (session265 — cron 403679; অ্যাডমিন কমপ্লেইন্স-রিভিউ-ডেস্ক তাৎক্ষণিক-ফিল্টার ac265 + অ্যাঙ্করড-চেক-স্ক্যান + ডিসপ্লে-আর্টিফ্যাক্ট-মিথ্যা-অ্যালার্ম-গোটচা)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`5b14313` (session264/Task104) → রাউন্ড-শেষে নতুন-কমিট, working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- স্টেল-সামারি-সংশোধন ×৩১: সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল; ACTIVE-LOCK Task104/session264-ই-সত্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s264 ৫৬/৫৬ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session264-বাকি-প্রস্তাব গ্রহণ)

## এ-রাউন্ডে সম্পন্ন (session265)
- **[Mandatory-ফিচার] অ্যাডমিন কমপ্লেইন্স তাৎক্ষণিক-ফিল্টার (ac265):** /admin/complaints — কার্ড-সারফেস data-ac-row (forEach-(c,i)) + দ্বিভাষিক data-kw (#আইডি+অভিযোগ/complaint+বিষয়+জমাদানকারী+@ইউজারনেম+/profile/+স্ট্যাটাস-বাংলা/কী+তারিখ+বডি-১৪০+সংযুক্তি+নোট) + ফিল্টার-স্ট্রিপ (acFilter265/acClear265/acCount265/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + **__acQA হুক** (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — session265-উন্নতি); ট্যাব ×৫/বাল্ক/PUT/DELETE/paperclip/sidebar অক্ষুণ্ণ; নো-ডেটা-'card empty' ইচ্ছাকৃত-বাদ
- **[Mandatory-স্টাইল]:** ac265-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ সঠিক-বাইট)
- **[সংহত] অ্যাঙ্করড-চেক-স্ক্যান (session264-বাকি-প্রস্তাব):** scripts/s265-anchor-scan.py → ১-ঝুঁকি (s263:৯৮) → '/moderator/?$'-অ্যাঙ্করড-সংহত
- **টেস্ট:** নতুন tests/s265-acfilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক** (কাঠামো ×২২ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৪ পূর্বগণনা-মিল + ফিল্ড-গার্ড-প্রোব + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি ১→১) + পূর্ণ-রিগ্রেশন s260-২৬৪ + role-policy ২৬০/২৬০ + guard/audit-গ্রিন + EJS-রেন্ডার-প্রুফ দুই-ধারা
- **গোটচা ×২ ডক-কৃত (PLANS session265):** ডিসপ্লে-আর্টিফ্যাক্ট-মিথ্যা-অ্যালার্ম (১০৩-'ভাঙা' → ২২৮/২২৮-বৈধ — od/python-ই-সত্য, রিপো-ব্যাপী-ফিক্স-নিষিদ্ধ) · empty-state দ্বৈত-শূন্য-বক্স-চুক্তি
- প্যাচ: scripts/s265-patch.py (skip-if-present idempotent — ৫-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ) + ডক ×৩ (PROJECT §২৬৫ + PLANS session265 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session266 লেবেল (worklog Task ID 106)**; PLANS session265-নোট অবশ্যই-পড়ুন (ডিসপ্লে-আর্টিফ্যাক্ট-সতর্কতা + দ্বৈত-শূন্য-বক্স + __acQA-শূন্য-সারফেস-হুক + ফিল্ড-গার্ড-প্রোব); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (messages/moderators/subscribers/tasks/activity/audit), Turso/প্রোড-পোর্ট
"""
    src = src.rstrip() + '\n' + sec
    write(P, src)
    print('OK: repo-worklog Task 105 সংযুক্ত')

print('DOCS ×৩ সম্পন্ন')
