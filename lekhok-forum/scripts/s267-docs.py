#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s267-docs.py — session267 (Task ID 107) ডক ×৩ আপডেট (skip-if-present idempotent):
  ① PROJECT.md — §২৬৭ এন্ট্রি (§২৬৬-এর আগে, newest-first)
  ② PLANS.md — session267-নোট (session266-নোট-এর আগে)
  ③ worklog.md (repo) — Task 107 এন্ট্রি (ফাইল-শেষে append)
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(p):
    with io.open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ── ① PROJECT.md §২৬৭ ──
P = os.path.join(ROOT, 'PROJECT.md')
src = read(P)
if '§২৬৭ (session267' in src:
    print('SKIP: PROJECT.md §২৬৭ পূর্ব-উপস্থিত')
else:
    sec = """## §২৬৭ (session267 — cron 403679: মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার tk267 — ms266-প্যাটার্ন-মিরর + অ্যাডমিন-ফর্ম-সিড-চুক্তি-বিস্তার) — s267 ৫৯/৫৯ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`48170d6` (session266/Task106, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s266 ৫৯/৫৯ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session266-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — tasks সারফেস)।

**[Mandatory-ফিচার] মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার (tk267):** /admin/tasks (admin/views/admin/tasks.ejs) — সারি-সারফেস (tr, forEach-(t, idx)-এর idx) `data-tk-row` + দ্বিভাষিক `data-kw` (#আইডি + টাস্ক task + শিরোনাম + বিবরণ-১২০-স্লাইস-স্পেস-নরমাল + assignee_name + অনাবণ্ডিত unassigned + মডারেটর moderator + অগ্রাধিকার (জরুরি urgent/উচ্চ high/সাধারণ normal) + স্ট্যাটাস (বাকি pending/চলমান in_progress/সম্পন্ন done) + due_date + ডেডলাইন deadline) + ফিল্টার-স্ট্রিপ (tkFilter267 + tkClear267 + tkCount267 + tk-kbd-hint) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স (tkZero267 data-tk-empty) + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__tkQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত)**; নতুন-টাস্ক-ফর্ম ×৫ / q42-সার্চ / pagination (page42) / bulk-bar / data-bulk-all ×২ / প্রতি-সারি status-select ফর্ম (/status) + delete ফর্ম / empty-state-full / admin-topbar / sidebar সম্পূর্ণ অক্ষুণ্ণ।

**[Mandatory-স্টাইল] tk267-ব্লক হেক্স-শূন্য টোকেন-শুধু:** color-mix ফোকাস-রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + **hidden-গার্ড ×৩ সঠিক-বাইট** (`.tk-count-chip[hidden]` / `.tk-zero[hidden]` / `tr[data-tk-row][hidden]` !important — **tr-সারফেসে-গার্ড-প্রথম (UA display:table-row → সারি-hidden-গার্ড !important — display:flex-শ্রেণির টেবিল-প্রতিরূপ)** — প্যাচ-পোস্ট-অ্যাসার্ট (count==3) + suite-containsF দ্বি-প্রমাণ)।

**টেস্ট:** নতুন tests/s267-tkfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক** (কাঠামো ×২২ + স্টাইল ×৯ + আচরণ ×১৭ রিয়েল-ব্রাউজার — নির্ধারক-প্রোব ×৩ ('qa267task-3917'-একক-সিড / 'জরুরি urgent'-অগ্রাধিকার / 'বাকি pending'-স্ট্যাটাস) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden (tr-গার্ড-প্রমাণ) + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + **ফিল্ড-গার্ড-প্রোব (input[name=q]-সার্চ-থেকে 'f')** + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + **নেট-DB-রাইট-শূন্য প্রমাণ (BASE → BASE)**) + পূর্ণ-রিগ্রেশন s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/৫৩ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs)।

**[সিড-চুক্তি-বিস্তার] অ্যাডমিন-ফর্ম-প্রোডাকশন-ফ্লো-সিড (s254/s257/s266 → s267):** খালি-টেবিল সারফেসে **requireAdmin-ফর্ম-POST** (POST /admin/tasks — CSRF-meta পৃষ্ঠা-থেকে, testadmin/demo123) দ্বারা মার্কার-সিড ('qa267task-3917' — শিরোনাম+বিবরণ-যুগল, priority=urgent) → ব্রাউজার-প্রোব বাস্তব-ডেটায়; **স্বয়ং-নিরাময়ী ক্লিনার:** POST /admin/tasks/:id/delete (soft) → `trashed=<tid>` → POST /admin/trash/bulk-purge (ids=) → মার্কার-শূন্য + নেট-রাইট-শূন্য (সারফেস BASE → BASE); **ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে:** মার্কার-সারি >১ হলে প্রথমে সব-মার্কার-সারি clean → পরে পুনঃব্যবহার/সিড (idempotent)।

**গোটচা (PLANS session267):** ① **eval-JSON-কোট-এস্কেপ-গ্রেপ** — agent-browser eval-এ JSON.stringify-আউটপুটে `\\\"`-এস্কেপ; সুইট-গ্রেপে অবশ্যই এস্কেপ-সহনশীল প্যাটার্ন (`h..:false`) — সরাসরি `'\"h\":false'` গ্রেপ মিথ্যা-ফেল (s267-প্রথম-রানে ১-মিথ্যা-ফেল — s266-প্যাটার্ন-অনুলিপিতে বিচ্যুতি) ② **tr-সারফেস hidden-গার্ড** — কার্ড-div (display:flex-author) ছাড়াও টেবিল-সারিতে UA display:table-row; সারি-লুকানোর গার্ড `tr[data-tk-row][hidden] { display:none !important }` বাধ্যতমূলক ③ **admin-form-সিড CSRF-meta** — requireAdmin POST-এ CSRF পৃষ্ঠার meta csrf-token থেকে (login-page-flow নয়)।

**প্যাচ:** scripts/s267-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, পুনঃরান SKIP-প্রমাণ, admin.css `.tk-`-সংঘর্ষ-FATAL-গার্ড, সংরক্ষণ ×১৫ অ্যাসার্ট) + ডক ×৩ (PROJECT §২৬৭ + PLANS session267 + এ-এন্ট্রি)।

"""
    anchor = '## §২৬৬ (session266'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PROJECT.md §২৬৭ সন্নিবেশিত')

# ── ② PLANS.md session267-নোট ──
P = os.path.join(ROOT, 'PLANS.md')
src = read(P)
if '## session267-নোট' in src:
    print('SKIP: PLANS.md session267-নোট পূর্ব-উপস্থিত')
else:
    sec = """## session267-নোট (cron 403679 — মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার tk267)
- **eval-JSON-কোট-এস্কেপ-গ্রেপ-গোটচা (নতুন):** agent-browser eval-এ `JSON.stringify({...})`-আউটপুট টুল-আউটপুটে `\\\"h\\\":false`-রূপে এস্কেপড — সুইট-গ্রেপ অবশ্যই এস্কেপ-সহনশীল (`h..:false`-জাতীয়); সরাসরি-কোট-প্যাটার্ন মিথ্যা-ফেল করে (s267-প্রথম-রান ১-ফেল → ফিক্স → ৫৯/৫৯)। অন্য-সুইট-থেকে-প্যাটার্ন-অনুলিপির-সময় গ্রেপ-প্যাটার্ন-ও-মিরর-করুন, নতুন-করে-লিখবেন-না।
- **tr-সারফেস hidden-গার্ড (display:flex-গার্ড-প্রথার টেবিল-বিস্তার):** টেবিল-সারি-সারফেসে (tasks — `tr[data-tk-row]`) UA display:table-row; hidden-গার্ড `tr[data-tk-row][hidden] { display: none !important; }` বাধ্যতমূলক — নয়তো সারি-লুকানো-অ্যাসার্ট/আচরণ বিকল। ভবিষ্যৎ-টেবিল-সারফেসে (subscribers/logs/audit/activity-টেবিল) এ-জোড়া (গার্ড-লাইন + সব-hidden-অ্যাসার্ট) অনুলিপি-বাধ্য।
- **অ্যাডমিন-ফর্ম-সিড-চুক্তি-বিস্তার (s266-পাবলিক-ফর্ম → s267-admin-ফর্ম):** খালি-টেবিল অ্যাডমিন-সারফেসে requireAdmin-ফর্ম-POST-ও সিড-পথ (CSRF পৃষ্ঠা-meta থেকে); ক্লিনার soft-delete→trashed=<tid>→bulk-purge; **ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে** (মার্কার-সারি >১ → সব-clean → পরে সিড/পুনঃব্যবহার) — নয়তো একক-প্রোব-প্রত্যাশা (১-মিল) ভাঙে।
- **display:flex-গার্ড-প্রমাণ-প্রথা (স্থায়ী):** সব-hidden-অ্যাসার্টই গার্ড-কার্যকারিতার প্রমাণ — এ-রাউন্ডে tr-গার্ডে ১/১-hidden প্রমাণিত।
- **পরের-এজেন্ট: session268 থেকে (worklog Task ID 108)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (moderators/subscribers/activity/audit — ms266/ac265/tk267-প্যাটার্ন-মিরর; subscribers-এ দ্বৈত-টেবিল (subs+logs) — স্কোপ-সিদ্ধান্ত-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
    anchor = '## session266-নোট'
    i = src.index(anchor)
    src = src[:i] + sec + src[i:]
    write(P, src)
    print('OK: PLANS.md session267-নোট সন্নিবেশিত')

# ── ③ repo worklog.md Task 107 append ──
P = os.path.join(ROOT, 'worklog.md')
src = read(P)
if 'Task ID: 107 (session267' in src:
    print('SKIP: repo-worklog Task 107 পূর্ব-উপস্থিত')
else:
    sec = """
---
Task ID: 107 (session267 — cron 403679; মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার tk267 + অ্যাডমিন-ফর্ম-সিড-চুক্তি-বিস্তার + tr-গার্ড-প্রথা)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`48170d6` (session266/Task106) → রাউন্ড-শেষে নতুন-কমিট, working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s266 ৫৯/৫৯ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session266-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — tasks সারফেস)

## এ-রাউন্ডে সম্পন্ন (session267)
- **[Mandatory-ফিচার] মডারেটর টাস্ক তাৎক্ষণিক-ফিল্টার (tk267):** /admin/tasks — সারি-সারফেস tr data-tk-row (forEach-(t,idx)) + দ্বিভাষিক data-kw (#আইডি+টাস্ক task+শিরোনাম+বিবরণ-১২০+assignee_name+অনাবণ্ডিত unassigned+মডারেটর moderator+অগ্রাধিকার জরুরি urgent/উচ্চ high/সাধারণ normal+স্ট্যাটাস বাকি pending/চলমান in_progress/সম্পন্ন done+due_date+ডেডলাইন deadline) + ফিল্টার-স্ট্রিপ (tkFilter267/tkClear267/tkCount267/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__tkQA হুক** (সারফেস-শূন্যে-ও-সংজ্ঞায়িত); নতুন-টাস্ক-ফর্ম ×৫/q42-সার্চ/পেজিনেশন/বাল্ক-bar/data-bulk-all ×২/প্রতি-সারি status-select+delete ফর্ম/empty-state-full/topbar/sidebar অক্ষুণ্ণ; hidden-গার্ড ×৩
- **[Mandatory-স্টাইল]:** tk267-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ — **tr[data-tk-row][hidden] !important — tr-সারফেস-গার্ড-প্রথম (UA table-row — display:flex-শ্রেণির টেবিল-প্রতিরূপ)**
- **[সিড-চুক্তি-বিস্তার] (s254/s257/s266 → s267):** requireAdmin-ফর্ম-POST /admin/tasks-সিড (মার্কার 'qa267task-3917'; CSRF-meta-পৃষ্ঠা-থেকে) + soft-delete→trashed=<tid>→trash/bulk-purge স্বয়ং-নিরাময়ী ক্লিনার + **ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (মার্কার >১ → সব-clean)** → **নেট-DB-রাইট-শূন্য প্রমাণ (সারফেস ০ → ০, মার্কার-শূন্য)** — ব্রাউজার-প্রোব বাস্তব-ডেটায়
- **টেস্ট:** নতুন tests/s267-tkfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক** (কাঠামো ×২২ + স্টাইল ×৯ + আচরণ ×১৭ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৩ ('qa267task-3917'-একক/'জরুরি urgent'-অগ্রাধিকার/'বাকি pending'-স্ট্যাটাস) পূর্বগণনা-মিল + ফিল্ড-গার্ড-প্রোব input[name=q] + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড) + পূর্ণ-রিগ্রেশন s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/৫৩ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন
- **গোটচা ×৩ ডক-কৃত (PLANS session267):** eval-JSON-কোট-এস্কেপ-গ্রেপ (`\\\"`-এস্কেপ → এস্কেপ-সহনশীল `h..:false` — প্রথম-রানে ১-মিথ্যা-ফেল) · tr-সারফেস hidden-গার্ড (UA table-row → !important-গার্ড-জোড়া) · admin-form-সিড CSRF-meta-পৃষ্ঠা-থেকে + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে
- প্যাচ: scripts/s267-patch.py (skip-if-present idempotent — ৪-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ, admin.css `.tk-`-সংঘর্ষ-FATAL-গার্ড, সংরক্ষণ ×১৫ অ্যাসার্ট) + ডক ×৩ (PROJECT §২৬৭ + PLANS session267 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session268 লেবেল (worklog Task ID 108)**; PLANS session267-নোট অবশ্যই-পড়ুন (eval-JSON-এস্কেপ-গ্রেপ + tr-গার্ড-জোড়া + admin-form-সিড-চুক্তি + ক্র্যাশ-অবশেষ-ক্লিনার); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (moderators/subscribers/activity/audit — ms266/ac265/tk267-প্যাটার্ন-মিরর; subscribers দ্বৈত-টেবিল — স্কোপ-সিদ্ধান্ত-পূর্বক), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
"""
    src = src.rstrip() + '\n' + sec
    write(P, src)
    print('OK: repo-worklog Task 107 সংযুক্ত')

print('DOCS ×৩ সম্পন্ন')
