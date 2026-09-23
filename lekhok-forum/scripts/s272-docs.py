#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s272-docs.py — session272 ডকুমেন্টেশন ×৩:
  ① PROJECT.md — §২৭২ সেকশন (§২৭১-র ঠিক আগে সন্নিবেশ)
  ② PLANS.md — session272-নোট (session271-নোট-এর আগে)
  ③ worklog.md — Task ID 112 রেকর্ড (Task ID 111-এর আগে)
idempotent: মার্কার-উপস্থিত হলে SKIP।
"""
import io, sys

def skip_or_run(path, marker, insert_before, block, label):
    src = io.open(path, encoding='utf-8').read()
    if marker in src:
        print('SKIP: %s ইতিমধ্যে-উপস্থিত' % label)
        return
    if insert_before not in src:
        print('FATAL: %s অ্যাঙ্কর-অনুপস্থিত: %r' % (label, insert_before[:50])); sys.exit(1)
    src = src.replace(insert_before, block + insert_before, 1)
    io.open(path, 'w', encoding='utf-8').write(src)
    print('OK: %s সন্নিবেশিত' % label)

# ── ① PROJECT.md §২৭২ ──
S272_PROJECT = """## §২৭২ (session272 — cron 403679: কনটেন্ট রিভিশন হিস্ট্রি তাৎক্ষণিক-ফিল্টার ch272 + রিভিশন-ডিলিট-ফিচার + marker-seed-নেট-শূন্য-চুক্তি) — s272 ৭২/৭২ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`dbbfba3` (session271, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); স্টেল-সামারি-সংশোধন ×৩৮ (সামারি Task43/'commit-হয়নি'/device-flow/'১৮-ট্রিগার-ব্যাকলগ' যুগ — সব-ভুল; ACTIVE-LOCK Task111/session271-ই-সত্য)। রাউন্ড-শুরু QA: s271 ৫৮/৫৮ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session271-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — content-history সারফেস)।

**[Mandatory-ফিচার] রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার (ch272):** /admin/content/history (admin/views/admin/content-history.ejs — requireAdmin, key-অনুসন্ধিত-ভিউয়ার — নো-কী = খালি-সারফেস-ই-স্বাভাবিক) — সারি-সারফেস tr data-ch-row (forEach-(r, chI272)) + দ্বিভাষিক data-kw (#id-একক-প্রোব + রিভিশন revision + সংস্করণ version + সময় time + saved_at + ব্যবহারকারী user + saved_by + পুরনো-মান oldvalue value-slice-220-whitespace-নরমালাইজড + ফেরত restore + মুছুন delete) + ফিল্টার-স্ট্রিপ (chFilter272/chClear272/chCount272/kbd-hint — always-rendered card-বাইরে, নো-কী-সারফেসেও) + কাউন্ট-চিপ + শূন্য-অবস্থা (chZero272 data-ch-empty — card-পরে always-rendered) + 'f'-ফোকাস (একক-স্ট্রিপ) + field-গার্ড + Escape-ক্লিয়ার+ব্লার + __chQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত); key-select/restore-ফর্ম/thead/subtitle/empty-ব্রাঞ্চ/sidebar অক্ষুণ্ণ।

**[Mandatory-ফিচার] রিভিশন-ডিলিট (নতুন-রাউট):** POST /admin/content/history/delete (requireAdmin — SELECT-rev → DELETE → TA42.audit 'revision-delete'/'content_revisions' → redirect ?key=&saved=1) + প্রতি-সারি delete-ফর্ম (btn-danger + fa-trash + ch-del272, restore-ফর্মের-পাশে ch-act272 flex-জোড়া; th-প্রস্থ ১১০→১৩২px) — sidebar-csrf-ইনজেক্টর-আচ্ছাদিত (meta[name=csrf-token] + form-prepend-hidden — main.js-প্যাটার্ন, curl-স্তরে x-csrf-token-হেডার); হিস্ট্রি-পরিচর্যা-ক্ষমতা (ব্যবহারকারী অপ্রয়োজনীয় পুরনো-সংস্করণ মুছবে) + সুইটের delete-ই২ই-পথ।

**[Mandatory-স্টাইল]:** ch272-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-ch-row][hidden] !important) — প্যাচ-পোস্ট-অ্যাসার্ট + suite-containsF দ্বি-প্রমাণ।

**[marker-seed-নেট-শূন্য-চুক্তি (নতুন — s267-ক্র্যাশ-ক্লিনার-চুক্তির বিস্তার)]:** content_revisions-এ ব্যবহারযোগ্য-ডিলিট-API-নেই-ছিল → এ-রাউন্ডের delete-ফিচার-ই সুইটের ক্লিনার: সিড = POST /admin/content (multipart -F, x-csrf-token-হেডার) ×২ (old→new — save#1 হয় rev(X0) দেয় (X0-নন-নাল-হলে) নয় শূন্য (X0-নাল); save#2 অবিশ্বযোগ্যভাবে rev(old) দেয়) → টেস্ট-উইন্ডো → settings-পুনরুদ্ধার = restore(BASE_REV) (X0-সঠিক-ফেরত; BASE_REV-শূন্য-হলে save('') — ডিফল্ট-রেন্ডার-সমতুল্য) → revisions-পুনরুদ্ধার = নতুন-ids-সব delete-ই২ই → **নেট-শূন্য-প্রমাণ (ids PRE == FINAL) + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (s267-প্রথা)**।

**টেস্ট:** নতুন tests/s272-chfilter-suite.sh **৭২/৭২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১১ + আচরণ ×২১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৭ — নির্ধারক-প্রোব ×৪ ('#rev'-id-একক / marker-value / testadmin-actor / 'রিভিশন revision'-সর্বজনীন) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড-প্রমাণ + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব (select[name=key]-থেকে-f) + Escape-ব্লার + **নো-কী-সারফেসে হুক-জীবিত + 'f'-কার্যকর (ac265-শূন্য-সারফেস-চুক্তি-প্রমাণ)** + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + delete-ই২ই ২/২ + restore-ই২ই + নেট-শূন্য-প্রমাণ) + পূর্ণ-রিগ্রেশন s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি।

**গোটচা ×৩ ডক-কৃত (PLANS session272):** ① ensure-server-লাইভ-প্রসেস-রি-লোড-শূন্য (kill-ব্যতীত নতুন-রাউট লোড-হয়-না — unmatched-POST → /?saveerr=1-গোটচা; delete-কে ৩০২/৩৩০-সফল-ভাবা-মিথ্যা-পাস — Location-চেক-বাধ্যতমূলক) ② লগইন-পরবর্তী-GET /admin/login রিডাইরেক্ট-করে (মেটা-টোকেন-শূন্য → x-csrf-token-শূন্য → ?csrf=1 — টোকেন-উৎস সর্বদা প্রথম-লগইন-GET-ই) ③ rev_id-প্রতি-সারি ×২ (restore+delete-ফর্ম — id-নিষ্কাশনে sort -u বাধ্যতমূলক)।

**প্যাচ:** scripts/s272-patch.py (skip-if-present idempotent — ৭-সম্পাদনা (view ×৬ + routes ×১), SKIP-পুনঃরান-প্রমাণ, .ch--নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (view+admin.css+tokens.css — সিলেক্টর-বাউন্ড regex — attach-ch-সাবস্ট্রিং-মিথ্যা-পজিটিভ-নিরাপদ) + টোকেন-উপস্থিতি-গার্ড ×৭, সংরক্ষণ-প্রি/পোস্ট ×১৩+×১৬ অ্যাসার্ট (rows.forEach-JS-ফ্যান্টম ×২ + content_revisions-audit-ফ্যান্টম ×১২ — ফার্স্ট-রান-FATAL-দ্বি-প্রমাণ), সঠিক-বাইট ×৭ + হেক্স-শূন্য-পোস্ট-অ্যাসার্ট) + ডক ×২ (PROJECT §২৭২ + PLANS session272)।

"""
skip_or_run('PROJECT.md', '## §২৭২', '## §২৭১', S272_PROJECT, 'PROJECT §২৭২')

# ── ② PLANS.md session272-নোট ──
S272_PLANS = """## session272-নোট (cron 403679 — রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার ch272 + রিভিশন-ডিলিট + marker-seed-নেট-শূন্য)
- **ensure-server-লাইভ-প্রসেস রি-লোড-শূন্য (নতুন-গোটচা — সর্বোচ্চ-গুরুত্ব):** ensure-server.sh লাইভ-সার্ভার-দেখলে exit 0 (রিস্টার্ট-নয়) — routes.js-সম্পাদনার-পরেও পুরনো-প্রসেস-ই চলে → নতুন-রাউট unmatched → 404-handler POST-কে `/?saveerr=1`-এ ফেরত পাঠায় (302/303-রূপে!) → **HTTP-কোড-শুধু-চেক মিথ্যা-পাস** (delete "সফল" কিন্তু DB-অস্পৃষ্ট)। সমাধান: routes/db-স্কিমা-পরিবর্তনের-পরে **kill-নির্দিষ্ট-প্রসেস → ensure-server**; সুইটে mutation-POST-এর-পরে **Location-হেডার-যাচাই বাধ্যতমূলক** (`saved=1` = রাউন্ট-সফল; `saveerr=1`/`csrf=1`/`error=1` = বিভিন্ন-ব্যর্থতা — সব-ই 303-রূপে-আসে)।
- **লগইন-পরবর্তী GET /admin/login রিডাইরেক্ট (csrf-টোকেন-উৎস-গোটচা):** লগইন-সেশনে GET /admin/login → লগইন-পেজ-নয় (রিডাইরেক্ট) → meta-টোকেন-শূন্য → x-csrf-token-হেডার-শূন্য → csrf57-ব্লক (?csrf=1)। **টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (jar-তৈরির-সময়)** — পরে-সব-POST সেই-একই-টোকেন (session.csrfToken-স্থিতিশীল); টোকেন-রি-নিষ্কাশন-প্রয়োজনে /admin/content/history-জাতীয় **অন্য-অ্যাডমিন-পেজের meta** নিন, login-নয়।
- **marker-seed-নেট-শূন্য-চুক্তি (নতুন — revision-জাতীয় ডিলিট-বিহীন-টেবিলের সমাধান):** content_revisions-এ আগে কোনো delete-API-নেই → seed-পথ-অবরুদ্ধ ছিল; **নতুন-মিউটেশন-ফিচার-ই ক্লিনার-হিসেবে ব্যবহারযোগ্য** (delete-ফিচার → সুইট-ক্লিনার)। seed = POST /admin/content (multipart -F + x-csrf-token-হেডার — s258/s269-গোটচা) ×২: save#1(old-marker) → rev(X0) দেয়-শুধু X0-নন-নাল-হলে (BASE_REV-ডেটা-নির্ভর); save#2(new-marker) → rev(old-marker) **অবিশ্বযোগ্যভাবে** (old≠new)। settings-পুনরুদ্ধার: BASE_REV-থাকলে restore (X0-সঠিক), নইলে save('') (X0-নাল → ডিফল্ট-রেন্ডার-সমতুল্য — settings-এন্ট্রি-রেসিডু কিন্তু রেন্ডার-সমতুল্য); revisions-পুনরুদ্ধার: সব-নতুন-id delete → **ids PRE == FINAL প্রমাণ**। ভবিষ্যৎ-মিউটেশন-বিহীন-সারফেসে (super-users/content-নোট) এ-চুক্তি-অনুলিপি।
- **rev_id-প্রতি-সারি ×২ (restore+delete-ফর্ম):** সারফেসে `name="rev_id" value="N"` ×২/সারি — id-নিষ্কাশনে `sort -u` বাধ্যতমূলক, নইলে id-তালিকা-দ্বিগুণ (প্রি/পোস্ট-তুলনা-ভাঙে)।
- **data-kw-তে value-slice-whitespace-নরমালাইজ (au270-detail-চুক্তি-পুনঃপ্রমাণ):** `<%= String(r.value || '').slice(0, 220).replace(/\\s+/g, ' ') %>` — প্রদর্শিত-td-নয়-শুধু-kw; প্যাচ-পাইথনে `/\\\\s+/g`-এস্কেপ (NEW-স্ট্রিং-এ `\\\\s` = লিটারাল)।
- **PRESERVE-ফ্যান্টম-গণনা (প্যাচ-গার্ড-গোটচা ×২):** JS-hook-যুক্ত প্যাচে সোর্স-গণনা বদলায় — `rows.forEach` (EJS ১ + JS-hook ১ = ২), `content_revisions` (প্রি ৯ + SELECT ১ + DELETE ১ + audit-টেবিল-নাম ১ = ১২) — **প্রথম-রানে FATAL-ধরা (প্যাচ-সুরক্ষা-চুক্তি-প্রমাণিত); অ্যাসার্ট-লেখার-আগে সম্পাদনা-প্রভাব-মানচিত্র**।
- **.ch-প্রিফিক্স-সংঘর্ষ-পরীক্ষা সিলেক্টর-বাউন্ড:** admin.css-এ 'ch-'-সাবস্ট্রিং ২২টি (attach-ch-ইত্যাদি বৈধ) — প্যাচ-গার্ডে regex `\\.ch-[a-z]`-ই-সত্য (সাবস্ট্রিং-FATAL-মিথ্যা-পজিটিভ-বর্জন)।
- **ch272-সারফেস-চুক্তি:** হুক **__chQA** (total/count/apply/clear); সারি = `tr[data-ch-row]`; hidden-গার্ড `tr[data-ch-row][hidden] { display:none !important }`; স্ট্রিপ+শূন্য-অবস্থা always-rendered (**নো-কী-সারফেস = খালি-ই-স্বাভাবিক** — key-অনুসন্ধিত-ভিউয়ার; নো-কী-পৃষ্ঠাতেও হুক+'f'-জীবিত — সুইটে পৃথক-অ্যাসার্ট); একক-স্ট্রিপ → 'f'-মালিকানা-নির্দ্বিধা; ফিল্ড-গার্ড-প্রোব select[name=key]-থেকে (au270-প্রথা)।
- **পরের-এজেন্ট: session273 থেকে (worklog Task ID 113)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (security.ejs-স্কোপ-ম্যাপ-পূর্বক; super-users-প্রার্থী; trash-দ্বিতীয়-পাস), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""
skip_or_run('PLANS.md', '## session272-নোট', '## session271-নোট', S272_PLANS, 'PLANS session272-নোট')

# ── ③ worklog.md Task 112 ──
S272_WL = """---
Task ID: 112 (session272 — cron 403679; রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার ch272 + রিভিশন-ডিলিট-ফিচার + marker-seed-নেট-শূন্য) — feature pending-push
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`dbbfba3` (session271/Task111) → রাউন্ড-শেষে push `dbbfba3..এই-রাউন্ড` (feature + worklog), working-tree ক্লিন, টোকেন-ভ্যালিদ, Vercel READY, প্রোড live-200 + health-200 + admin-গেট-307; device-flow-অবসর; fetch-প্রমাণ origin-অনড় (প্যারালাল-সংঘর্ষ-শূন্য)
- স্টেল-সামারি-সংশোধন ×৩৮: এ-রাউন্ডের কনটেক্সট-সামারি আবার 'Task43-হারানো/device-flow-মেয়াদোত্তীর্ণ/১৮-ট্রিগার-ব্যাকলগ' দেখিয়েছিল — সব-ভুল; ACTIVE-LOCK/রিপো-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s271 ৫৮/৫৮ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session271-বাকি-প্রস্তাব গ্রহণ: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা — content-history সারফেস; requireAdmin — testadmin-ভিউয়ার)

## এ-রাউন্ডে সম্পন্ন (session272)
- **[Mandatory-ফিচার] রিভিশন-হিস্ট্রি তাৎক্ষণিক-ফিল্টার (ch272):** /admin/content/history — সারি-সারফেস tr data-ch-row (forEach-(r, chI272)) + দ্বিভাষিক data-kw (#id-একক-প্রোব + রিভিশন revision + সংস্করণ version + সময় time + saved_at + ব্যবহারকারী user + saved_by + পুরনো-মান oldvalue value-slice-220-whitespace-নরমালাইজড + ফেরত restore + মুছুন delete) + ফিল্টার-স্ট্রিপ (chFilter272/chClear272/chCount272/kbd-hint — always-rendered card-বাইরে) + কাউন্ট-চিপ + শূন্য-অবস্থা (chZero272 data-ch-empty) + 'f'-ফোকাস (একক-স্ট্রিপ) + field-গার্ড + Escape + **__chQA হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — নো-কী-সারফেসেও জীবিত)**; key-select/restore-ফর্ম/thead/subtitle/empty-ব্রাঞ্চ/sidebar অক্ষুণ্ণ
- **[Mandatory-ফিচার] রিভিশন-ডিলিট (নতুন-রাউট):** POST /admin/content/history/delete (requireAdmin → DELETE → audit 'revision-delete' → redirect ?key=&saved=1) + প্রতি-সারি delete-ফর্ম (btn-danger+fa-trash, restore-পাশে ch-act272 flex-জোড়া + th-প্রস্থ ১১০→১৩২px); sidebar-csrf-ইনজেক্টর-আচ্ছাদিত (meta+form-prepend — restore-ফর্ম-প্যাটার্ন-মিরর); হিস্ট্রি-পরিচর্যা-ক্ষমতা (ব্যবহারকারী পুরনো-সংস্করণ মুছবে) + সুইটের delete-ই২ই-পথ
- **[Mandatory-স্টাইল]:** ch272-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড ×৩ সঠিক-বাইট — tr[data-ch-row][hidden] !important) — প্যাচ-পোস্ট-অ্যাসার্ট + suite-containsF দ্বি-প্রমাণ
- **[marker-seed-নেট-শূন্য-চুক্তি] (নতুন):** content_revisions-এ delete-API-নেই-ছিল → নতুন delete-ফিচার-ই-ক্লিনার: seed = POST /admin/content (multipart -F + x-csrf-token) ×২ (old→new; save#1 = rev(X0) X0-নন-নাল-হলে; save#2 = rev(old) অবিশ্বযোগ্য) → টেস্ট-উইন্ডো → restore(BASE_REV)/save('') settings-পুনরুদ্ধার → নতুন-ids-সব delete → **নেট-শূন্য-প্রমাণ (ids PRE == FINAL ০→০ প্রমাণিত) + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (s267-প্রথা)**
- **টেস্ট:** নতুন tests/s272-chfilter-suite.sh **৭২/৭২ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২০ + স্টাইল ×১১ + আচরণ ×২১ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৭ — নির্ধারক-প্রোব ×৪ ('#rev'-id-একক / marker-value / testadmin / 'রিভিশন revision'-সর্বজনীন) পূর্বগণনা-মিল + নো-ম্যাচ→শূন্য-অবস্থা + সব-hidden tr-গার্ড + clear-পুনরুদ্ধার + চিপ-ত্রয়ী + 'f'-ফোকাস + **ফিল্ড-গার্ড select[name=key]-থেকে** + Escape-ব্লার + **নো-কী-সারফেসে হুক+'f'-জীবিত (ac265-চুক্তি-প্রমাণ)** + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + delete-ই২ই + restore-ই২ই + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design + audit:views-গ্রিন (১২২ ejs) + anchor-scan ০-ঝুঁকি
- **গোটচা ×৩ ডক-কৃত (PLANS session272):** ① **ensure-server-লাইভ-প্রসেস-রি-লোড-শূন্য** (routes-সম্পাদনার-পরে kill-ব্যতীত নতুন-রাউট-লোড-হয়-না → unmatched-POST → /?saveerr=1-কে 303-রূপে; **Location-যাচাই-বাধ্যতমূলক** — HTTP-কোড-শুধু-চেক মিথ্যা-পাস; প্রথম-রানে delete-ই২ই-"সফল"-কিন্তু-DB-অস্পৃষ্ট-২-ফেল → kill+রিস্টার্ট → ফিক্স) ② **লগইন-পরবর্তী GET /admin/login রিডাইরেক্ট** (মেটা-টোকেন-শূন্য → ?csrf=1 — টোকেন-উৎস প্রথম-লগইন-GET-ই) ③ rev_id-প্রতি-সারি ×২ (sort -u বাধ্যতমূলক); প্লাস প্যাচ-স্তর PRESERVE-ফ্যান্টম-দ্বি-গোটচা (rows.forEach JS-ফ্যান্টম ×২ + content_revisions-audit-ফ্যান্টম ×১২ — FATAL-প্রথম-রানে-ধরা, ফাইল-অলিখিত — প্যাচ-সুরক্ষা-চুক্তি-পুনঃপ্রমাণিত)
- প্যাচ: scripts/s272-patch.py (skip-if-present idempotent — ৭-সম্পাদনা (view ×৬ + routes ×১), SKIP-পুনঃরান-প্রমাণ, .ch--সংঘর্ষ-FATAL-গার্ড (সিলেক্টর-বাউন্ড regex — attach-ch-মিথ্যা-পজিটিভ-নিরাপদ) + টোকেন-গার্ড ×৭, সংরক্ষণ প্রি/পোস্ট ×১৩+×১৬, সঠিক-বাইট ×৭ + হেক্স-শূন্য) + ডক ×২ (PROJECT §২৭২ + PLANS session272) → পুরাতন-PNG-চার্ন-রিভার্ট ×৯ (session269-প্রথা) → secret-নীতি-অক্ষুণ্ণ → fetch (origin-যাচাই) → push (fetch+rebase-পূর্বক) → Vercel READY-প্রতীক্ষা (BUILDING-গোটচা-মেনে READY-র-পরে-প্রোব) → প্রোড-স্পট home-200 + health-200 + admin-গেট-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session273 লেবেল (worklog Task ID 113)**; PLANS session272-নোট অবশ্যই-পড়ুন (ensure-server-রি-লোড-গোটচা + Location-যাচাই + csrf-টোকেন-উৎস + marker-seed-নেট-শূন্য-চুক্তি + PRESERVE-ফ্যান্টম); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (security.ejs-স্কোপ-ম্যাপ-পূর্বক; super-users-প্রার্থী; trash-দ্বিতীয়-পাস), multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), Turso/প্রোড-পোর্ট
- রিমোট main = এ-রাউন্ড-শেষে-আপডেট (session272); working-tree ক্লিন

"""
skip_or_run('worklog.md', 'Task ID: 112 (session272', 'Task ID: 111 (session271', S272_WL, 'worklog Task 112')

print('DOCS-DONE: s272 ×৩')
