#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s266-docs.py — session266 (Task ID 106) ডক ×৩ আপডেট (skip-if-present idempotent):
  ① PROJECT.md — §২৬৬ এন্ট্রি (§২৬৫-এর আগে, newest-first)
  ② PLANS.md — session266-নোট (session265-নোট-এর আগে)
  ③ worklog.md (repo) — Task 106 এন্ট্রি (ফাইল-শেষে append)
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(p):
    with io.open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ── ① PROJECT.md §২৬৬ ──
P = os.path.join(ROOT, 'PROJECT.md')
src = read(P)
if '§২৬৬ (session266' in src:
    print('SKIP: PROJECT.md §২৬৬ পূর্ব-উপস্থিত')
else:
    sec = """## §২৬৬ (session266 — cron 403679: যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার ms266 — ac265-প্যাটার্ন-মিরর + প্রোডাকশন-ফ্লো-সিড-চুক্তি-পুনপ্রয়োগ) — s266 ৫৯/৫৯ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`e7ec051` (session265/Task105, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s265 ৫৭/৫৭ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session265-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — messages সারফেস)।

**[Mandatory-ফিচার] যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার (ms266):** /admin/messages (admin/views/admin/messages.ejs) — বার্তা-কার্ড-সারফেস (div.msg105-card) `data-ms-row` (forEach-(m, idx)-এর idx) + দ্বিভাষিক `data-kw` (#আইডি + বার্তা/message + নাম + ইমেইল + mail + বিষয় + বডি-১৪০-স্লাইস-স্পেস-নরমাল + তারিখ + অবস্থা (অপঠিত unread/পঠিত read) + আর্কাইভ archived + নোট note উত্তর reply) + ফিল্টার-স্ট্রিপ (msFilter266 + msClear266 + msCount266 + ms-kbd-hint) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স (msZero266 data-ms-empty) + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__msQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত)**; স্ট্যাট-স্ট্রিপ ×৪ / ফিল্টার-পিল ×৪ / q-সার্চ / pagination / bulk-bar (delete/unarchive/archive/read) / data-bulk-all / প্রতি-কার্ড read+unread+archive+unarchive+delete ফর্ম / প্রিন্ট (msgPrint108) / উত্তর-নোট (mn-*109) / কম্পোজ-মোডাল / sidebar সম্পূর্ণ অক্ষুণ্ণ; 'inbox-empty105' নো-ডেটা-বক্স ইচ্ছাকৃত-বাদ (সারফেস-নয়)।

**[Mandatory-স্টাইল] ms266-ব্লক হেক্স-শূন্য টোকেন-শুধু:** color-mix ফোকাস-রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + **hidden-গার্ড ×৩ সঠিক-বাইট** (`.ms-count-chip[hidden]` / `.ms-zero[hidden]` / `.msg105-card[data-ms-row][hidden]` !important — **msg105-card author display:flex → গার্ড-বাধ্যতমূলক (session256-শ্রেণি)** — প্যাচ-পোস্ট-অ্যাসার্ট (count==3) + suite-containsF দ্বি-প্রমাণ)।

**টেস্ট:** নতুন tests/s266-msfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক** (কাঠামো ×২১ + স্টাইল ×৯ + আচরণ ×১৬ রিয়েল-ব্রাউজার — নির্ধারক-প্রোব ×৩ ('qa266msg-3917'-একক-সিড / ' mail '-ইমেইল / 'অপঠিত unread'-স্ট্যাটাস) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden + clear-পুনরুদ্ধার + চিপ-text/display-none + 'f'-ফোকাস + **ফিল্ড-গার্ড-প্রোব (input[name=q]-সার্চ-থেকে 'f')** + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + **নেট-DB-রাইট-শূন্য প্রমাণ (BASE → BASE)**) + পূর্ণ-রিগ্রেশন s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/৫৩ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন + EJS-রেন্ডার-প্রমাণ দুই-ধারা (sample ৩-সারফেস ৫৪,৩২২-বাইট + empty ০-সারফেস — scripts/s266-render-proof.js)।

**[সিড-চুক্তি-পুনপ্রয়োগ] প্রোডাকশন-ফ্লো-সিড (s254/s257-চুক্তি):** ইনবক্স-শূন্য QA-DB-তে পাবলিক **POST /api/contact** (CSRF-শূন্য-পাবলিক-ফর্ম; রেট-লিমিট ৫/১০মি — ×২-রান-সুরক্ষিত) দ্বারা মার্কার-সিড ('qa266msg-3917' — নাম+বিষয়+বার্তা-ত্রয়ী) → ব্রাউজার-প্রোব বাস্তব-ডেটায়; **স্বয়ং-নিরাময়ী ক্লিনার:** POST /admin/messages/:id/delete → `trashed=<tid>` → POST /admin/trash/bulk-purge → মার্কার-শূন্য + নেট-রাইট-শূন্য (সারফেস ০ → ০); ক্র্যাশ-নিরাপদ idempotent (মার্কার-পূর্ব-বিদ্যমান হলে পুনঃব্যবহার, স্পর্শ-নিষিদ্ধ)।

**গোটচা (PLANS session266):** ① **bulk-unarchive সার্ভার-শর্তসাপেক্ষ** (filter105=archived-তে-ই রেন্ডার) — রেন্ডার-প্রুফের preserved-তালিকায় শর্তসাপেক্ষ-বাটন পৃথক-প্রত্যাশায় (full ১৪/১৪ + static ৪/৪ — অন্যথায় মিথ্যা-ফেল) ② **তালিকা-পৃষ্ঠার URL-গ্রেপ-অ্যাঙ্কর দ্বি-সতর্কতা** — '/admin/messages' উপসর্গ '/admin/messages/export'-এও-মেলে → সুইটে অ্যাঙ্করড `/admin/messages/?$` বাধ্যতমূলক (s264-গোটচা-প্রথা-বিস্তার)।

**প্যাচ:** scripts/s266-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, পুনঃরান SKIP-প্রমাণ, admin.css `.ms-`-সংঘর্ষ-FATAL-গার্ড, সংরক্ষণ ×১৫ অ্যাসার্ট) + scripts/s266-render-proof.js + ডক ×৩ (PROJECT §২৬৬ + PLANS session266 + এ-এন্ট্রি)।

"""
    anchor = '## §২৬৫ (session265'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PROJECT.md §২৬৬ সন্নিবেশিত')

# ── ② PLANS.md session266-নোট ──
P = os.path.join(ROOT, 'PLANS.md')
src = read(P)
if '## session266-নোট' in src:
    print('SKIP: PLANS.md session266-নোট পূর্ব-উপস্থিত')
else:
    sec = """## session266-নোট (cron 403679 — যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার ms266)
- **শর্তসাপেক্ষ-বাটন-রেন্ডার-গোটচা (নতুন):** রেন্ডার-প্রুফের preserved-কী-তালিকায় সার্ভার-শর্তসাপেক্ষ-বাটন (এ-পেজে bulk-unarchive — কেবল filter105=archived-এ) পৃথক-প্রত্যাশায় রাখুন (full-list থেকে বাদ + static-list ছোট) — নয়তো সব-সময় মিথ্যা-ফেল। নতুন-সারফেস-প্রুফের-আগে রুটের শর্তসাপেক্ষ-মার্কআপ স্ক্যান করুন (`<% if` ভিতরের বাটন)।
- **তালিকা-পৃষ্ঠার সাব-পাথ-সংঘর্ষ-অ্যাঙ্কর (session264-গোটচা-বিস্তার):** '/admin/messages' উপসর্গ '/admin/messages/export'-এও-মেলে — সুইট-URL-চেকে অ্যাঙ্করড `/admin/messages/?$` বাধ্যতমূলক; ভবিষ্যৎ-তালিকা-সারফেসেও (resources/notices/events-অ্যাডমিন-ভ্যারিয়েন্ট) সাব-পাথ (export/new/:id) স্ক্যান-পূর্বক-অ্যাঙ্কর।
- **প্রোডাকশন-ফ্লো-সিড-চুক্তি-পুনপ্রয়োগ (s254/s257 → s266):** খালি-টেবিল সারফেসে পাবলিক-ফর্ম-POST (CSRF-শূন্য) দিয়ে মার্কার-সিড + মার্কার-আইডি নির্ণয় → delete→trashed=<tid>→trash/bulk-purge ক্লিনার → নেট-রাইট-শূন্য প্রমাণ (BASE→BASE); ক্র্যাশ-নিরাপদ: মার্কার-পূর্ব-বিদ্যমান হলে পুনঃব্যবহার (স্পর্শ-নিষিদ্ধ); রেট-লিমিট-বাউন্ডেড এন্ডপয়েন্টে ×২-রান-নিরাপদ (৫/১০মি)।
- **display:flex-গার্ড-প্রমাণ-প্রথা (session256-শ্রেণি-স্থায়ী):** author-display:flex ক্লাসে (এ-রাউন্ডে .msg105-card) সব-hidden-অ্যাসার্টই গার্ড-কার্যকারিতার প্রমাণ — নতুন-ফিল্টার-প্যাচে গার্ড-লাইন + সব-hidden-অ্যাসার্ট জোড়া-হিসেবে।
- **পরের-এজেন্ট: session267 থেকে (worklog Task ID 107)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (moderators/subscribers/tasks/activity/audit — ms266/ac265-প্যাটার্ন-মিরর), multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
    anchor = '## session265-নোট'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PLANS.md session266-নোট সন্নিবেশিত')

# ── ③ repo worklog.md Task 106 append ──
P = os.path.join(ROOT, 'worklog.md')
src = read(P)
if 'Task ID: 106 (session266' in src:
    print('SKIP: repo-worklog Task 106 পূর্ব-উপস্থিত')
else:
    sec = """
---
Task ID: 106 (session266 — cron 403679; যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার ms266 + প্রোডাকশন-ফ্লো-সিড-চুক্তি-পুনপ্রয়োগ + শর্তসাপেক্ষ-বাটন-গোটচা)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`e7ec051` (session265/Task105) → রাউন্ড-শেষে নতুন-কমিট, working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s265 ৫৭/৫৭ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session265-বাকি-প্রস্তাব গ্রহণ)

## এ-রাউন্ডে সম্পন্ন (session266)
- **[Mandatory-ফিচার] যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার (ms266):** /admin/messages — কার্ড-সারফেস data-ms-row + দ্বিভাষিক data-kw (#আইডি+বার্তা/message+নাম+ইমেইল+mail+বিষয়+বডি-১৪০+তারিখ+অপঠিত unread/পঠিত read+আর্কাইভ archived+নোট note) + ফিল্টার-স্ট্রিপ (msFilter266/msClear266/msCount266/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + **__msQA হুক** (সারফেস-শূন্যে-ও-সংজ্ঞায়িত); স্ট্যাট-স্ট্রিপ/পিল ×৪/সার্চ/পেজিনেশন/বাল্ক ×৪/প্রতি-কার্ড-ফর্ম ×৫/প্রিন্ট/নোট-সিস্টেম/মোডাল অক্ষুণ্ণ; hidden-গার্ড ×৩ (display:flex-ওভাররাইডসহ)
- **[Mandatory-স্টাইল]:** ms266-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px)
- **[সিড-চুক্তি-পুনপ্রয়োগ]:** পাবলিক POST /api/contact-সিড (মার্কার 'qa266msg-3917') + delete→trashed→trash/bulk-purge স্বয়ং-নিরাময়ী ক্লিনার → **নেট-DB-রাইট-শূন্য প্রমাণ (BASE → BASE)** — ব্রাউজার-প্রোব বাস্তব-ডেটায়
- **টেস্ট:** নতুন tests/s266-msfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক** (কাঠামো ×২১ + স্টাইল ×৯ + আচরণ ×১৬ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৩ পূর্বগণনা-মিল + ফিল্ড-গার্ড-প্রোব input[name=q] + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড) + পূর্ণ-রিগ্রেশন s260-২৬৫ + role-policy ২৬০/২৬০ + guard/audit-গ্রিন + EJS-রেন্ডার-প্রুফ দুই-ধারা (sample ৩-সারফেস + empty — scripts/s266-render-proof.js)
- **গোটচা ×২ ডক-কৃত (PLANS session266):** bulk-unarchive সার্ভার-শর্তসাপেক্ষ (রেন্ডার-প্রুফের পৃথক-প্রত্যাশা) · '/admin/messages'-উপসর্গ '/admin/messages/export'-সংঘর্ষ (অ্যাঙ্করড '/admin/messages/?$' — session264-গোটচা-বিস্তার)
- প্যাচ: scripts/s266-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ, `.ms-`-সংঘর্ষ-FATAL-গার্ড, সংরক্ষণ ×১৫) + ডক ×৩ (PROJECT §২৬৬ + PLANS session266 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session267 লেবেল (worklog Task ID 107)**; PLANS session266-নোট অবশ্যই-পড়ুন (শর্তসাপেক্ষ-বাটন-গোটচা + export-সাব-পাথ-অ্যাঙ্কর + প্রোডাকশন-ফ্লো-সিড-চুক্তি); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (moderators/subscribers/tasks/activity/audit — ms266/ac265-প্যাটার্ন-মিরর), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
"""
    src = src.rstrip() + '\n' + sec
    write(P, src)
    print('OK: repo-worklog Task 106 সংযুক্ত')

print('DOCS ×৩ সম্পন্ন')
