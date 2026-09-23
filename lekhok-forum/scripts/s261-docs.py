#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s261-docs.py — session261 (Task ID 101) ডক ×৩: PROJECT §২৬১ + PLANS session261-নোট + repo worklog Task-101 এন্ট্রি"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SEC260_HDR = '## §২৬০ (session260 — cron 403679'

S261_PROJECT = """## §২৬১ (session261 — cron 403679: রিসোর্স তাৎক্ষণিক-ফিল্টার re261 + ক্যাটাগরি-চিপ-সারি-সমৃদ্ধি) — s261 ৫০/৫০ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`bfce6c5` (session260/Task100, clean-tree); GH /user→200 (gh-token + gh-token-v3 দুটোই); live-200; স্টেল-সামারি-সংশোধন ×২৭ (সামারি Task43/'commit-হয়নি'/device-flow/'token-ভ্যালিড-নয়' যুগ — সব-ভুল; ACTIVE-LOCK Task100/session260-ই-সত্য; device-flow-অবসর পুনঃপ্রমাণিত)। রাউন্ড-শুরু QA: s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session260-বাকি-প্রস্তাব গ্রহণ: resources-সারফেস ফিল্টার-প্যাক)।

**[Mandatory-ফিচার] রিসোর্স তাৎক্ষণিক-ফিল্টার (re261):** /moderator/resources — `data-re-row`-সারি-সূচক (.mr-res-row) + `data-kw` (#আইডি+শিরোনাম+ধরন-লেবেল+ধরন-সংক্ষেপ+ক্যাটাগরি-লেবেল+ক্যাটাগরি-কী+ট্যাগ+লেখক+ফাইল-আকার+সময়সীমা+সিরিজ+পর্ব-ক্রম+আপলোডকারী+লিংক-URL) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + clear-বাটন + **__reQA হুক (total/count/apply/clear)**; mrForm/টাইপ-পিকার (mrTypeInput)/বাল্ক-ইমপোর্ট (rsxBulkBtn)/প্রতি-সারি-মুছুন-ফর্ম/এডিট-লিংক সম্পূর্ণ অক্ষুণ্ণ; hidden-গার্ড ×৩ (session256-শিক্ষা প্রি-অ্যাপ্লাইড)।

**[Mandatory-ফিচার-সংযোগ] ক্যাটাগরি-চিপ:** প্রতি-সারিতে `.re-cat-chip` (৯-ক্যাটাগরি-ম্যাপ — guide/document/report/form/anthology/reference/scholarship/writing-tips/general → বাংলা-লেবেল; অজানা-কী-তে raw-key-ফলব্যাক) — no259 .no-cat-chip-চুক্তি-মিরর; ভিজ্যুয়াল-সমৃদ্ধি + ফিল্টারেবল-ক্ষেত্র একসাথে (ক্যাটাগরি-লেবেল+কী দুটোই data-kw-তে)।

**[Mandatory-স্টাইল]:** re261 ব্লক **হেক্স-শূন্য টোকেন-শুধু** (guard-র্যাচেট-নিরাপদ) — ফোকাস-রিং color-mix brandgreen-tint + dashed kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন (kbd/chip-none) + re-zero টোকেন-বক্স + সারি/চিপ/শূন্য-বক্স hidden-গার্ড-ত্রয়ী।

**সিড/পরিষ্কারক-চুক্তি-বর্ধন (link-ক্লাস-আবিষ্কার):** রিসোর্স-ফর্ম multipart হলেও **res_type=link-সিড urlencoded-POST-এই চলে** (multer নন-মাল্টিপার্ট-পাসথ্রু — body._csrf-পথ সরাসরি প্রযোজ্য; x-csrf-token-হেডার অপ্রয়োজনীয়) — marker 'qa261resource' + tags 'qa261tag' + author 'qa261author' + link_url; পরিষ্কারক POST /resources/:id/delete → trashed=<tid> → /admin/trash/bulk-purge (s260-চুক্তি পুনঃব্যবহার; স্বয়ং-নিরাময়ী idempotent)। id-আবিষ্কার-অ্যাঙ্কর: RS='<div class="mr-res-row"' + /resources/<id>/delete-gsub (bulk_ids-অ্যাঙ্করের resources-ভ্যারিয়েন্ট — রো-চেকবক্স-বিহীন তালিকা)।

**টেস্ট:** নতুন tests/s261-resfilter-suite.sh **৫০/৫০ ×২-ধারাবাহিক** (কাঠামো ×১৫ + স্টাইল ×১০ + আচরণ ×১৩ রিয়েল-ব্রাউজার + সিড ×৪ + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + পরিষ্কারক ×২) + role-policy **২৬০/২৬০** + s260 **৫২/৫২** + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs) + EJS-compile-প্রমাণ + স্ক্রিনশট ×২ কমিটেড।

**গোটচা ×১ (PLANS session261):** urlencoded-সিড-পথ-multer-পাসথ্রু (ফাইল-ঐচ্ছিক-রুটে multipart-এনক্রিপশন-বাধ্যতামূলক-নয় — s258-মাল্টিপার্ট-হেডার-চুক্তির সীমানা স্পষ্ট: শুধুই-ফাইল-অবশ্যক রুটে প্রযোজ্য)। **পরের-এজেন্ট: session262 (Task ID 102)** — PLANS session261-নোট অবশ্যই-পড়ুন; push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার-ভ্যারিয়েন্ট, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""

S261_PLANS = """## session261-নোট (cron 403679 — রিসোর্স তাৎক্ষণিক-ফিল্টার re261)
- **urlencoded-সিড-পথ (link-ক্লাস-সীমানা-স্পষ্টকরণ):** withUpload(মাল্টার)-রুটেও **ফাইল-ঐচ্ছিক হলে urlencoded-POST-ই যথেষ্ট** — multer নন-মাল্টিপার্ট-কনটেন্ট-টাইপে নীরবে next() করে (req.file undefined), body._csrf গ্লোবাল-urlencoded-পার্সারে-পার্সড থাকায় সরাসরি পাস। s258-এর x-csrf-token-হেডার-চুক্তি শুধুই **ফাইল-সহ multipart বাধ্যতামূলক** রুটে (press)। ভবিষ্যৎ-সিডে রুট-প্রকৃতি আগে যাচাই করুন: `req.file`-ঐচ্ছিক → urlencoded; `req.file`-অবশ্যক → multipart+হেডার।
- **re261-সারফেস-চুক্তি:** হুক **__reQA** (total/count/apply/clear); সারি = `.mr-res-row[data-re-row]`; data-kw = #আইডি+শিরোনাম+ধরন-লেবেল/সংক্ষেপ+ক্যাটাগরি-লেবেল/কী+ট্যাগ+লেখক+আকার+সময়সীমা+সিরিজ+পর্ব-ক্রম+আপলোডকারী+লিংক-URL (১৪-ক্ষেত্র — moderator-প্যানেলে-সর্বাধিক); hidden-গার্ড ×৩; mrForm/টাইপ-পিকার/বাল্ক-মোডাল/মুছুন-ফর্ম/এডিট-লিংক অক্ষুণ্ণ; id-আবিষ্কার RS-অ্যাঙ্কর = `'<div class="mr-res-row"'` + `/resources/<id>/delete`-gsub (চেকবক্স-বিহীন-তালিকার ভ্যারিয়েন্ট — bulk_ids-অ্যাঙ্কর-প্যাটার্নের বিস্তার)।
- **ক্যাটাগরি-চিপ-ম্যাপ-প্যাটার্ন:** রো-লুপের-আগে এক-বার RE_CAT_261 ম্যাপ (৯-ক্যাটাগরি) + অজানা-কী-raw-ফলব্যাক — no259-একক-লেবেল-ম্যাপের সম্প্রসারণ; লেবেল+কী-দুটোই data-kw-তে দ্বি-ভাষা-প্রোব-সাপোর্ট।
- **পরের-এজেন্ট: session262 থেকে (worklog Task ID 102)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার-ভ্যারিয়েন্ট (au251-admin-ভিউ-বনাম moderator-users-মড-ভিউ-পার্থক্য আগে ম্যাপ করুন), multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

S261_WORKLOG = """## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`bfce6c5` (session260/Task100, clean-tree) — স্টেল-সামারি-সংশোধন ×২৭ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল)। GH /user→200 (দুই-টোকেনই-ভ্যালিড); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর।

## এ-রাউন্ডে সম্পন্ন (session261)
- **রাউন্ড-আরম্ভ-যাচাই:** s260 ৫২/৫২ প্রথম-রানে + role-policy ২৬০/২৬০ + guard:design + audit:views — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session260-বাকি-প্রস্তাব: resources-ফিল্টার-প্যাক)।
- **[Mandatory-ফিচার] রিসোর্স তাৎক্ষণিক-ফিল্টার (re261):** /moderator/resources — data-re-row + data-kw (১৪-ক্ষেত্র) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + clear + **__reQA হুক**; mrForm/টাইপ-পিকার/বাল্ক-ইমপোর্ট/মুছুন-ফর্ম/এডিট-লিংক অক্ষুণ্ণ; hidden-গার্ড ×৩; **[Mandatory-ফিচার-সংযোগ] .re-cat-chip** (৯-ক্যাটাগরি-ম্যাপ প্রতি-সারি-পিল)।
- **[Mandatory-স্টাইল]:** re261-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড-ত্রয়ী)।
- **সিড-চুক্তি-বর্ধন:** res_type=link-সিড urlencoded-POST (multer-নন-মাল্টিপার্ট-পাসথ্রু — body._csrf-পথ; x-csrf-token-অপ্রয়োজনীয়) + পরিষ্কারক /resources/:id/delete→ট্র্যাহ→bulk-purge (#১৭৩-প্রমাণ অবশিষ্ট=০)।
- **টেস্ট:** নতুন tests/s261-resfilter-suite.sh **৫০/৫০ ×২-ধারাবাহিক** (কাঠামো×১৫+স্টাইল×১০+আচরণ×১৩ রিয়েল-ব্রাউজার + সিড×৪ + 390px + স্ক্রিনশট×২ + পরিষ্কারক) + role-policy **২৬০/২৬০** + s260 ৫২/৫২ + guard/audit-গ্রিন + EJS-compile-প্রমাণ
- প্যাচ: scripts/s261-patch.py (skip-if-present idempotent) + ডক ×৩ (PROJECT §২৬১ + PLANS session261 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session262 লেবেল (worklog Task ID 102)**; PLANS session261-নোট অবশ্যই-পড়ুন (urlencoded-link-ক্লাস-সীমানা + RS-অ্যাঙ্কর-ভ্যারিয়েন্ট); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার-ভ্যারিয়েন্ট, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
"""

def insert_before(path, anchor, text, label):
    with io.open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    if '§২৬১' in src and 're261' in src:
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
insert_before(p, SEC260_HDR, S261_PROJECT, 'PROJECT §২৬১')

p = os.path.join(ROOT, 'PLANS.md')
append(p, S261_PLANS, 'PLANS session261-নোট', '## session261-নোট')

p = os.path.join(ROOT, 'worklog.md')
append(p, S261_WORKLOG, 'repo-worklog Task-101', 'এ-রাউন্ডে সম্পন্ন (session261)')
