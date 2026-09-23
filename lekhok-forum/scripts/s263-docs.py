#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s263-docs.py — session263 (Task ID 103) ডক ×৩: PROJECT §২৬৩ + PLANS session263-নোট + repo worklog Task-103 এন্ট্রি"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SEC262_HDR = '## §২৬২ (session262 — cron 403679'

S263_PROJECT = """## §২৬৩ (session263 — cron 403679: মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার mdf263 — muf262-প্যাটার্ন-মিরর) — s263 ৫৩/৫৩ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`02e2104` (session262/Task102, clean-tree); GH /user→200 + Vercel /v2/user→200; স্থায়ী-সার্ভার-জীবিত (৮০৯৪); রাউন্ড-শুরু QA: s262 ৪৮/৪৮ + s261 ৫০/৫০ + role-policy ২৬০/২৬০ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session262-বাকি-প্রস্তাব গ্রহণ: moderator-dashboard-সারফেস-ফিল্টার)।

**[Mandatory-ফিচার] মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (mdf263):** /moderator (views/user/moderator-dashboard.ejs) — **পূর্ণ-সারফেস-কভারেজ: টাইল ×১৫** = scope-টাইল ×১১ (mod-grid — allowed `<a>` + locked `<div class="mod-tile locked">` ২-শাখায়ই data-mdf-row/data-kw) + এক্সট্রা-টাইল ×৪ (রিপোর্ট-কিউ/মেনু-ব্যবস্থাপনা/কমিটি-সদস্য/পত্রিকা-কাটিং — দ্বিতীয়-গ্রিড, স্ট্যাটিক দ্বি-ভাষা kw); `data-kw` = লেবেল+বর্ণনা+scope-key+লিংক-পাথ+অবস্থা-শব্দ (খোলা/অনুমোদিত unlocked/allowed/open বনাম লকড/অনুমতি-নেই locked/denied) + ফিল্টার-স্ট্রিপ (mdfFilter263 + mdfClear263 + mdfCount263 + mdf-kbd-hint) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স (mdfZero263 data-mdf-empty) + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__mdfQA হুক (total/count/apply/clear)**; hero/stats/section-head/scope-count/mrq81-dash-badge/switch/logout/info-note সম্পূর্ণ অক্ষুণ্ণ।

**নেমস্পেস-ম্যাপ (session262-প্রথা প্রয়োগ):** পেজের `.mod-*` CSS পূর্ব-দখলকৃত (mod-hero/mod-tile/mod-grid/...) — ফিল্টার-প্রিফিক্স **mdf** (মডারেটর-ড্যাশবোর্ড-ফিল্টার) নেমস্পেস-পৃথক (সংঘর্ষ-মুক্ত যাচাইকৃত — grep-প্রমাণ শূন্য); সুইটে `.mdf-instant`-নেমস্পেস-পৃথকতা-অ্যাসার্ট।

**[Mandatory-স্টাইল]:** mdf263 ব্লক **হেক্স-শূন্য টোকেন-শুধু** (guard-র্যাচেট-নিরাপদ) — ফোকাস-রিং color-mix brandgreen-tint + dashed kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন (kbd-none) + mdf-zero টোকেন-বক্স + hidden-গার্ড-ত্রয়ী — **টাইল-গার্ড `.mod-tile[data-mdf-row][hidden]{display:none!important}` বিশেষ-গুরুত্বপূর্ণ** (এক্সট্রা-টাইলে inline `style="display:flex"` আছে — author-!important-ই inline-ওভাররাইড-পথ, session256-শ্রেণি)।

**সিড-শূন্য-চুক্তি (রিড-ওনলি-সারফেস):** ড্যাশবোর্ড DB-রাইট-শূন্য UI — টাইল-কাঠামোই-নির্ধারক (admin-ভিউয়ারে ১১-scope + ৪-এক্সট্রা = **১৫-টাইল স্ট্রাকচারাল-ধ্রুব**); প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা (QUIZN/REPORTN/MENUN/EVENTN/PRESSN/UNLOCKN/LOCKN — muf262-ডেটা-নির্ভর-প্রোব-চুক্তি); 'লকড'-প্রোব admin-ভিউয়ারে ০ → শর্তসাপেক্ষ-স্কিপ (মিথ্যা-ফেল-বিতাড়ন); রিড-ওনলি-নিশ্চয়তা (টাইল ১৫→১৫)।

**টেস্ট:** নতুন tests/s263-mdfilter-suite.sh **৫৩/৫৩ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো ×১৮ + স্টাইল ×৯ + আচরণ ×১৮ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৬ ('কুইজ'/'রিপোর্ট'/'মেনু'/'ইভেন্ট'/'/moderator/press'/'unlocked') + inline-flex-hidden-গার্ড-প্রমাণ (নো-ম্যাচে ১৫/১৫ hidden) + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি-নিশ্চয়তা) + role-policy **২৬০/২৬০** + s262 **৪৮/৪৮** + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs) + EJS-compile-প্রমাণ + স্ক্রিনশট ×২ কমিটেড।

**গোটচা ×২ (PLANS session263):** ① **মিশ্র-ট্যাগ-সারফেস hidden-গার্ড** (`<a>`+`<div>` মিশ্র + inline-display:flex — tr-প্যাটার্নের সাধারণ `[data-x][hidden]` যথেষ্ট নয়; class-prefix+!important-ই-পথ) ② **স্ট্যাটিক-টাইল-ইনডেক্সিং** (এক্সট্রা-টাইলের data-mdf-row = `<%= scopes.length %>+n` — EJS-গণিত-ইনডেক্স, scope-লুপ-ইনডেক্সের ধারাবাহিকতা; press-টাইল-শর্তসাপেক্ষ → ইনডেক্স-গ্যাপ-সম্ভব, JS-অনিরপেক্ষ)। **পরের-এজেন্ট: session264 (Task ID 104)** — PLANS session263-নোট অবশ্যই-পড়ুন; push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই), admin-dashboard (/admin — session105-ভিউ) সারফেস-ফিল্টার, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

"""

S263_PLANS = """## session263-নোট (cron 403679 — মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার mdf263)
- **মিশ্র-ট্যাগ-সারফেস-গার্ড-শ্রেণি (নতুন):** ড্যাশবোর্ডের টাইল = `<a>` (scope-allowed + এক্সট্রা) + `<div class="mod-tile locked">` (scope-locked) মিশ্র — আর এক্সট্রা-টাইলে inline `style="display:flex"` → UA-`[hidden]`-ওভাররাইড-চিন্তা (session256-শ্রেণি) এখানে **inline-স্তরেও** আসে। সমাধান: গার্ড **`.mod-tile[data-mdf-row][hidden] { display: none !important; }`** — author-!important inline-সহ-সব-স্তর-জয়ী; সুইটে নো-ম্যাচে hidden-গণনা ১৫/১৫-অ্যাসার্ট = প্রমাণ।
- **স্ট্যাটিক-টাইল-ইনডেক্সিং-প্যাটার্ন:** scope-লুপে `forEach((s, mdfI263) =>` + এক্সট্রা-টাইলে `data-mdf-row="<%= scopes.length + n %>"` (EJS-গণিত) — এক-নম্বরিং-স্পেস; press-টাইল শর্তসাপেক্ষ (`myScopes.includes('epaper') || admin`) → non-admin-এ ইনডেক্স-গ্যাপ — **JS-ইনডেক্স-মানের-ওপর-নির্ভর-নয়** (querySelectorAll-ক্রম-ই-সত্য), সুইটেও গ্যাপ-নিরপেক্ষ।
- **স্ট্যাটিক-kw-চুক্তি:** স্কোপ-টাইলের kw EJS-ভেরিয়েবলে (mdfKw263 — label+desc+key+link+অবস্থা-শব্দ); এক্সট্রা-টাইলের kw স্ট্যাটিক-স্ট্রিং (লেবেল+desc+লিংক+ইংরেজি-অ্যালায়াস) — ২-শ্রেণিই দ্বি-ভাষা; লিংক-পাথ kw-তে রাখায় URL-ভিত্তিক-প্রোব ('/moderator/press') সম্ভব (নির্ধারক)।
- **mdf263-সারফেস-চুক্তি:** হুক **__mdfQA** (total/count/apply/clear); সারি = `[data-mdf-row]` (মিশ্র-ট্যাগ — ট্যাগ-স্ট্রিপ-নয়); টাইল-গণনা = `grep -o 'data-mdf-row="[0-9]*"'`; admin-ভিউয়ার = ১৫-টাইল-স্ট্রাকচারাল-ধ্রুব (১১-scope + ৪-এক্সট্রা); no-regression = hero/stats/scope-count/mrq81-badge/switch/logout-অ্যাসার্ট।
- **পরের-এজেন্ট: session264 থেকে (worklog Task ID 104)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press-ফর্ম রিয়েল-ফাইল-আপলোড ই২ই — s258-হেডার-চুক্তির ব্রাউজার-পথ-প্রমাণ), admin-dashboard (/admin — admin/views/admin/dashboard.ejs, ১১০-লাইন) সারফেস-ফিল্টার (mdf263-প্যাটার্ন-মিরর), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

S263_WORKLOG = """---
Task ID: 103 (session263 — cron 403679; মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার mdf263 + মিশ্র-ট্যাগ-গার্ড-শ্রেণি)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`02e2104` (session262/Task102), working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200 + Vercel /v2/user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session262-বাকি-প্রস্তাব গ্রহণ: moderator-dashboard-সারফেস-ফিল্টার)

## এ-রাউন্ডে সম্পন্ন (session263)
- **[Mandatory-ফিচার] মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (mdf263):** /moderator (views/user/moderator-dashboard.ejs) — **টাইল ×১৫ পূর্ণ-কভারেজ** (scope ×১১ allowed/locked ২-শাখা + এক্সট্রা ×৪ স্ট্যাটিক-kw) — data-mdf-row + দ্বি-ভাষা data-kw (লেবেল+বর্ণনা+key+লিংক+খোলা/লকড unlocked/locked) + ফিল্টার-স্ট্রিপ (mdfFilter263/mdfClear263/mdfCount263/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__mdfQA হুক** (total/count/apply/clear); hero/stats/section-head/mrq81-badge/switch/logout অক্ষুণ্ণ; hidden-গার্ড ×৩
- **[Mandatory-স্টাইল]:** mdf263-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px) + **inline-flex-টাইল-গার্ড** `.mod-tile[data-mdf-row][hidden]{display:none!important}` (session256-শ্রেণির inline-স্তর-বিস্তার)
- **নেমস্পেস-ম্যাপ:** .mod-* পূর্ব-দখলকৃত → **mdf-প্রিফিক্স** (session262-প্রথা প্রয়োগ; grep-প্রমাণ সংঘর্ষ-শূন্য)
- **টেস্ট:** নতুন tests/s263-mdfilter-suite.sh **৫৩/৫৩ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো×১৮+স্টাইল×৯+আচরণ×১৮ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৬ + inline-flex-hidden-প্রমাণ ১৫/১৫ + 390px-hScroll-শূন্য + স্ক্রিনশট×২ + রিড-ওনলি টাইল ১৫→১৫) + role-policy **২৬০/২৬০** + s262 ৪৮/৪৮ + guard:design + audit:views-গ্রিন (১২২ ejs) + EJS-compile-প্রমাণ + secret-scan-ক্লিন
- **গোটচা ×২ ডক-কৃত (PLANS session263):** মিশ্র-ট্যাগ-সারফেস hidden-গার্ড (a+div+inline-flex — class-prefix+!important-ই-পথ) · স্ট্যাটিক-টাইল-ইনডেক্সিং (EJS-গণিত ইনডেক্স + শর্তসাপেক্ষ-টাইলে গ্যাপ — JS-ইনডেক্স-অনিরপেক্ষ)
- প্যাচ: scripts/s263-patch.py (skip-if-present idempotent — পুনঃরান SKIP-প্রমাণ) + ডক ×৩ (PROJECT §২৬৩ + PLANS session263 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session264 লেবেল (worklog Task ID 104)**; PLANS session263-নোট অবশ্যই-পড়ুন (মিশ্র-ট্যাগ-গার্ড + স্ট্যাটিক-ইনডেক্সিং + স্ট্যাটিক-kw-চুক্তি); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press ই২ই), admin-dashboard (/admin) সারফেস-ফিল্টার (mdf263-মিরর), Turso/প্রোড-পোর্ট
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
insert_before(p, SEC262_HDR, S263_PROJECT, 'PROJECT §২৬৩', '§২৬৩ (session263')

p = os.path.join(ROOT, 'PLANS.md')
append(p, S263_PLANS, 'PLANS session263-নোট', '## session263-নোট')

p = os.path.join(ROOT, 'worklog.md')
append(p, S263_WORKLOG, 'repo-worklog Task-103', 'Task ID: 103 (session263')
