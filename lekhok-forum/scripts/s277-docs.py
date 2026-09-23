#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s277-docs.py — session277 ডক-আপডেট ×৩ (PROJECT §২৭৭ + PLANS session277-নোট + repo-worklog Task-117)
# চুক্তি: অ্যাঙ্কর-অনন্যতা-প্রি-অ্যাসার্ট; skip-if-present idempotent
import io, sys

def patch(path, anchor, block, prepend=True, presence=None):
    src = io.open(path, encoding="utf-8").read()
    probe = presence if presence is not None else block.strip().splitlines()[0]
    if probe in src:
        print("SKIP: already in", path)
        return
    if anchor == "":
        src = src.rstrip("\n") + "\n\n" + block
        io.open(path, "w", encoding="utf-8").write(src)
        print("OK (append):", path)
        return
    assert src.count(anchor) == 1, "anchor not unique in %s: %r" % (path, anchor[:60])
    new = src.replace(anchor, block + anchor) if prepend else src.replace(anchor, anchor + block)
    io.open(path, "w", encoding="utf-8").write(new)
    print("OK:", path)

PROJECT_SECTION = '''## §২৭৭ (session277 — cron 403679: অ্যাডমিন ইভেন্ট তাৎক্ষণিক-ফিল্টার ev277 + while-read-প্রোব-সংশোধনী) — s277 ৬৬/৬৬ ×২ (২৩ সেপ্টেম্বর ২০২৬)

- **[Mandatory-ফিচার] /admin/events তাৎক্ষণিক-ফিল্টার (ev277):** admin-ভার্সন-ইভেন্ট-তালিকা (moderator-ভার্সন s260-সুইটেড) — সারি-সারফেস tr data-ev-row (forEach-(e, evI277)) + দ্বিভাষিক data-kw (#id + ইভেন্ট event + শিরোনাম title + তারিখ date + স্থান location — হোয়াইটস্পেস-নরমালাইজড ×৩ + featured-মান-অ্যালায়াস (বিশেষ featured/সাধারণ normal — s273-মান-চুক্তি) + সম্পাদনা edit + মুছুন delete) + ফিল্টার-স্ট্রিপ (evFilter277/evClear277/evCount277/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (evZero277 data-ev-empty) + 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) + ফিল্ড-গার্ড + Escape + __evQA হুক (total/count/apply/clear); bulk-bar/data-bulk-all/data-bulk-msg ×৩/bulk-toggle ×২/empty-শাখা/display-cells/sidebar অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** ev277-ব্লক হেক্স-শূন্য টোকেন-শুধু (brandgreen-পরিবার — color-mix ফোকাস-রিং 45% + dashed kbd-পিল 55% + zero-বক্স 35% + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-ev-row][hidden] !important)
- **রিড-ওনলি-চুক্তি (mo268-অনুলিপি — broadcast-গোটচা-প্রয়োগ):** POST /admin/events broadcastToAll করে (auto-notify — routes.js কমেন্ট-সহ) → marker-seed-নেট-শূন্য-ই২ই-নিষিদ্ধ (s274-ব্যতিক্রম/s276-চুক্তি) → সিড-শূন্য + রেন্ডার্ড-HTML-পূর্বগণনা + মিউটেশন-POST-শূন্য → নেট-DB-রাইট-শূন্য-প্রমাণ (সারি ৪→৪) + প্রোব-অবশেষ-শূন্য
- **গোটচা ×২ ডক-কৃত (PLANS session277):** ① fa-filter ⊂ fa-filter-circle-xmark-সাবস্ট্রিং-অ্যাসার্ট (s275-গোটচার প্যাচ-স্তর-পুনঃপ্রমাণ — in-memory-ধরা, ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি) ② while-read-সেগমেন্ট-প্রোব (for-loop word-splitting মাল্টি-ওয়ার্ড-শিরোনাম/স্থান ভাঙে — প্রথম-রানে শিরোনাম-প্রোব SKIP; while IFS= read -r-সংশোধনীতে পূর্ণ-সেগমেন্ট 'আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন'/'অনলাইন (জুম)' একক-প্রোব)
- **টেস্ট:** নতুন tests/s277-evfilter-suite.sh **৬৬/৬৬ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৯ + স্টাইল ×৯ + আচরণ ×২৪ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৪ (#4 একক / পূর্ণ-শিরোনাম / তারিখ '২০২৬-০২-১৫' / স্থান 'অনলাইন (জুম)') + featured/normal-অ্যালায়াস ২/৪-জোড়া + সর্বজনীন-টোকেন ×৩ + নো-ম্যাচ→শূন্য + computed-display:none-গার্ড-প্রমাণ + শূন্য-বক্স-বিপরীত-প্রমাণ + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস (cancelable:true) + ফিল্ড-গার্ড input[name=bulk_ids]-থেকে + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s276 ৫৯/৫৯ + s275 ৮২/৮২ + s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs)
- **প্যাচ:** scripts/s277-patch.py (skip-if-present idempotent ×২ — SKIP-পুনঃরান-প্রমাণ, .ev277--নেমস্পেস-গার্ড ×৩-ফাইল, আইকন-প্রি-গার্ড ×৩ সাবস্ট্রিং-সচেতন, প্রি/পোস্ট-সংরক্ষণ-অ্যাসার্ট ×২২, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৩) + ডক ×৩ (PROJECT §২৭৭ + PLANS session277 + repo-worklog Task-117)

'''

PLANS_SECTION = '''## session277-নোট (cron 403679 — অ্যাডমিন ইভেন্ট তাৎক্ষণিক-ফিল্টার ev277 + while-read-প্রোব-সংশোধনী)
- **for-loop word-splitting গোটচা (নতুন):** মাল্টি-ওয়ার্ড-সেগমেন্ট-প্রোব-নির্বাচনে `for t in $(...)` শব্দ-ভাঙে — 'আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন'-জাতীয় পূর্ণ-শিরোনাম/স্থান ফ্র্যাগমেন্টে-ভেঙে অনন্যতা-চেক ০-মেলে → প্রোব-নির্বাচন-শূন্য → SKIP (প্রথম-রানে ৬৪/২)। সংশোধনী: **while IFS= read -r + process-substitution** — পূর্ণ-সেগমেন্ট এক-স্ট্রিং-ক্যান্ডিডেট (৬৬/৬৬ ×২)। ভবিষ্যৎ-সুইটে মাল্টি-ওয়ার্ড-প্রোব-নির্বাচনে while-read-ই-প্রথা।
- **fa-filter ⊂ fa-filter-circle-xmark (প্যাচ-স্তর-অ্যাসার্ট-গোটচা-পুনঃপ্রমাণ):** প্যাচ-পোস্ট-অ্যাসার্টে আইকন-গণনা সাবস্ট্রিং-সচেতন হতে-হবে — 'fa-filter'-গণনা fa-filter-circle-xmark-ও-গোনে (×২-মিথ্যা-ফেল) → বাউন্ডারি-সচেতন-প্যাটার্ন ('fas fa-filter ev277-ico')। in-memory-ধরা, ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ (s271-গোটচা-পরিবার)।
- **broadcast-চুক্তি-পুনঃপ্রয়োগ (s276-পুনঃপ্রমাণ):** POST /admin/events broadcastToAll (auto-notify) — admin-সাব-তালিকা-পরিবারে সিড-পথ-বাছাইের-আগে create-রুটের সাইড-এফেক্ট-ম্যাপ-বাধ্যতমূলক (grep broadcastToAll/notifySubscribers/mailer); ব্রডকাস্ট-করলে mo268-রিড-ওনলি-পূর্বগণনা-ই-সঠিক (নেট-রাইট-শূন্য-প্রমাণ = সারি PRE == FINAL)।
- **সারফেস-নির্বাচন-অবস্থা:** admin-সাব-তালিকা অবশিষ্ট (gallery/members/resources-list — admin-ভার্সন-অফিল্টারড; notices an276-সম্পন্ন, events ev277-সম্পন্ন), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- **পরের-এজেন্ট: session278 থেকে (worklog Task ID 118)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়! — force-push-পার্জ-পুনরাবৃত্তি-সম্ভব: `git rebase --onto origin/main <pre-base> main`) + **রিবেজ-পরবর্তী guard:design-পুনঃরান**।

'''

WORKLOG_SECTION = '''---
Task ID: 117 (session277 — cron 403679; অ্যাডমিন ইভেন্ট তাৎক্ষণিক-ফিল্টার ev277 + while-read-প্রোব-সংশোধনী)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`75a0688` (session276/Task116 + টুল-কমিট), working-tree ক্লিন (PNG-চার্ন-রিভার্ট-পূর্বে), টোকেন-ভ্যালিদ (/home/z/my-project/.secrets/gh-token — 200), স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- রাউন্ড-শুরু QA: s276 ৫৯/৫৯ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session276-বাকি-প্রস্তাব গ্রহণ: admin-সাব-তালিকা — events সারফেস; requireScope('events') → admin/admin123 ভিউয়ার, s231-প্রথা)

## এ-রাউন্ডে সম্পন্ন (session277)
- **[Mandatory-ফিচার] অ্যাডমিন ইভেন্ট তাৎক্ষণিক-ফিল্টার (ev277):** /admin/events (admin/views/admin/events/list.ejs — moderator-ভার্সন s260-সুইটেড; admin-ভার্সন-অফিল্টারড-ছিল) — সারি-সারফেস tr data-ev-row (forEach-(e, evI277)) + দ্বিভাষিক data-kw (#id + ইভেন্ট event + শিরোনাম title + তারিখ date + স্থান location — হোয়াইটস্পেস-নরমালাইজড ×৩ + featured-মান-অ্যালায়াস (বিশেষ featured/সাধারণ normal — s273-চুক্তি) + সম্পাদনা edit + মুছুন delete) + ফিল্টার-স্ট্রিপ (evFilter277/evClear277/evCount277/kbd-hint — always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (evZero277 data-ev-empty) + 'f'-ফোকাস (একক-স্ট্রিপ) + ফিল্ড-গার্ড (bulk_ids-checkbox) + Escape + __evQA হুক; bulk-bar/data-bulk-all/data-bulk-msg ×৩/bulk-toggle ×২/empty-শাখা/sidebar অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** ev277-ব্লক হেক্স-শূন্য টোকেন-শুধু (brandgreen-পরিবার — color-mix রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-ev-row]idden] !important)
- **রিড-ওনলি-চুক্তি (mo268-অনুলিপি):** POST /admin/events broadcastToAll করে (auto-notify) → marker-seed-নেট-শূন্য-ই২ই-নিষিদ্ধ (s276-চুক্তি-পুনঃপ্রয়োগ) → সিড-শূন্য + রেন্ডার্ড-HTML-পূর্বগণনা + মিউটেশন-POST-শূন্য → নেট-DB-রাইট-শূন্য-প্রমাণ (সারি ৪→৪) + প্রোব-অবশেষ-শূন্য
- **গোটচা ×২ ডক-কৃত (PLANS session277):** ① fa-filter ⊂ fa-filter-circle-xmark-সাবস্ট্রিং-অ্যাসার্ট (in-memory-ধরা, ফাইল-অলিখিত — প্যাচ-নিরাপত্তা-চুক্তি-পুনঃপ্রমাণ) ② while-read-সেগমেন্ট-প্রোব (for-loop word-splitting মাল্টি-ওয়ার্ড-প্রোব ভাঙে — প্রথম-রানে শিরোনাম-প্রোব SKIP ৬৪/২; while IFS= read -r-সংশোধনীতে পূর্ণ-সেগমেন্ট-প্রোব ৬৬/৬৬ ×২)
- **টেস্ট:** নতুন tests/s277-evfilter-suite.sh **৬৬/৬৬ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৯ + স্টাইল ×৯ + আচরণ ×২৪ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৪ (#4 একক / পূর্ণ-শিরোনাম 'আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন' / তারিখ '২০২৬-০২-১৫' / স্থান 'অনলাইন (জুম)') + featured/normal-অ্যালায়াস ২/৪-জোড়া + সর্বজনীন-টোকেন ×৩ + নো-ম্যাচ→শূন্য + computed-display:none + শূন্য-বক্স-বিপরীত + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s276 ৫৯/৫৯ + s275 ৮২/৮২ + s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs)
- প্যাচ: scripts/s277-patch.py (idempotent ×২, .ev277--নেমস্পেস-গার্ড ×৩-ফাইল, আইকন-প্রি-গার্ড সাবস্ট্রিং-সচেতন, প্রি/পোস্ট-অ্যাসার্ট ×২২, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৩) + ডক ×৩ (PROJECT §২৭৭ + PLANS session277 + repo-worklog Task-117) → fetch → push → Vercel-যাচাই (webhook-miss-গোটচা-সচেতন — API-manual-deploy-ফলব্যাক)

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **প্যারালাল-রাউন্ড-সচেতনতা:** push-পূর্ব fetch+rebase-প্রথা (force-push-পার্জ-পুনরাবৃত্তি-হলে `--onto`); রিবেজ-পরবর্তী guard:design-পুনঃরান (s276-গোটচা)
- পরের-এজেন্ট: **session278 লেবেল (worklog Task ID 118)**; PLANS session277-নোট অবশ্যই-পড়ুন (while-read-প্রোব-প্রথা + সাবস্ট্রিং-অ্যাসার্ট + broadcast-ম্যাপ + সিবলিং-নির্বাচন gallery/members/resources-list); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: admin-সাব-তালিকা-অবশিষ্ট (gallery/members/resources-list — admin-ভার্সন-অফিল্টারড), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session277-ev277); working-tree ক্লিন

'''

patch("PROJECT.md", "## §২৭৬ (session276", PROJECT_SECTION)
patch("PLANS.md", "## session276-নোট (cron 403679", PLANS_SECTION)
patch("worklog.md", "", WORKLOG_SECTION, presence="Task ID: 117 ")
print("docs-done")
