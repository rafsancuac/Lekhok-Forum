#!/usr/bin/env python3
# s282-docs.py — session282 ডক-আপডেট (PROJECT §২৮২ + PLANS session282-নোট + repo worklog Task-122)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

REPO = '/home/z/lekhok-forum/lekhok-forum'
APP = os.path.join(REPO, 'lekhok-forum')
FEAT = 'dabbc2a'  # placeholder-overwrite-নিচে git-থেকে-সেট-হয়

PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৮২ (§২৮১-এর-আগে সন্নিবেশ — নতুন-প্রথম-চুক্তি) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৮২ (session282' in pj:
    print('skip-①: PROJECT §২৮২ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮১ (session281'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৮২ (session282 — cron 403679: পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন ep282 — নেটিভ-select-ওভারলে কম্বো) — s282 ৫৩/৫৩ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`cf2c653` (session281-ep281, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch-প্রথা-প্রথম-প্রয়োগ** (session281-শিক্ষা — BEHIND=০, সমান্তরাল-রাউন্ড-শূন্য); টোকেন-যুগল .secrets-সক্রিয়; রাউন্ড-শুরু QA: প্রোড-স্পট (home-200 + health-healthy + /epaper-200 + ep281-মার্কার-উপস্থিত) + স্থানীয় s281 **৩৯/৩৯**-ক্যানারি — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session281-শীর্ষ-প্রস্তাব গ্রহণ: **পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন**)।

**[Mandatory-ফিচার] সার্চযোগ্য-পত্রিকা-সিলেক্টর (ep282):** নেটিভ `#epPaperSelect` = **একক-উৎস অক্ষুণ্ণ** (change-লজিক + optgroup-গ্রুপিং + syncPaperSelect-সব-পুনঃব্যবহৃত — সুইচ-লজিক-ডুপ্লিকেট-শূন্য); ওভারলে-কম্বো: ট্রিগার-বাটন (`.ep-ps-combo` — লেবেল + chevron + aria-haspopup/expanded/controls) + সার্চ-প্যানেল (`.ep-ps-panel` — ম্যাগনিফায়ার + ইনপুট + ক্লিয়ার-বাটন + optgroup-হেডারসহ অপশন-লিস্টবক্স + খালি-অবস্থা); **সার্চ** = নরমালাইজড-সাবস্ট্রিং (lower + multi-space-কোল্যাপস; value+textContent দ্বৈত-মিল); **কী-বোর্ড**: ↑↓ র‍্যাপ-নেভিগেশন (is-act) + Enter-নির্বাচন + Escape-বন্ধ + খোলার-সাথে-সার্চ-অটো-ফোকাস; **বাইরে-ক্লিকে-বন্ধ** (contains-গার্ড); **নির্বাচন-পথ** = select.value-সেট + **change-পুনঃপ্রেরণ** (পূর্ব-জারি তারিখ-সচেতন-সুইচ-লজিক-ই-চলে) + লেবেল-সিঙ্ক (**syncPaperSelect-হুক** — hoisted-ঘোষণা, বুট-পূর্ব-কল-নিরাপদ) + selectedIndex-সামঞ্জস্য; **armed-শ্রেণি JS-যোগিত** (no-JS ফলব্যাকে নেটিভ select-ই দৃশ্যমান-ব্যবহারযোগ্য); aria-পূর্ণ (role=option/listbox + aria-selected + is-sel-চিহ্ন); **__ep282QA হুক ×১১-ফিল্ড** (isOpen/visible/query/picked/active/open/close/render/pick/label/options)।

**[Mandatory-স্টাইল]:** epaper.css ep282-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — কম্বো-ট্রিগার (hover-tint + focus-ring + is-open-বটম-কোণ-সংকোচ + chevron-রোটেট), প্যানেল (entrance-animation `ep-ps-in` + গভীর-ছায়া + স্ক্রলবার-স্টাইল + সার্চ-স্ট্রিপ green-tint), সারি (is-act/is-sel + ✓-after + focus-visible-ring), খালি-অবস্থা, মোবাইল-সংকোচন (max-600px) + reduced-motion-গার্ড; guard-র্যাচেট-নিরাপদ।

**টেস্ট:** নতুন tests/s282-epsearch-suite.sh **৫৩/৫৩ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২২ + রেন্ডার্ড ×৪ + E2E agent-browser ×২১: armed-শ্রেণি + **computed-টগল (কম্বো flex + select none)** + ট্রিগার-ক্লিকে প্যানেল-খোলা (isOpen + hidden=false + aria-expanded=true + সার্চ-ফোকাসড) + সারি-গণনা-সামঞ্জস্য (rows=visible=options) + গ্রুপ-হেডার + অমিল-কোয়েরিতে শূন্য-সারি + খালি-অবস্থা + ক্লিয়ার-বাটন-সাইকেল + ArrowUp-র‍্যাপ-নেভিগেশন + Enter-নির্বাচন (value==picked + লেবেল-সিঙ্ক + বন্ধ) + সারি-ক্লিক-দ্বিতীয়-পথ + selectedIndex-সামঞ্জস্য + বাইরে-ক্লিকে-বন্ধ + Escape-বন্ধ-aria-ফেরত + **প্যানেল-খোলা-স্ক্রিনশট ×২** + 390px-hScroll-শূন্য) + **মার্কার-সিড/ক্লিন নেট-শূন্য** (s281-হেল্পার-পুনঃব্যবহার; papers PRE=০→FINAL=০) + পূর্ণ-রিগ্রেশন s260-s281 (২৩-সুইট) + role-policy + guard:design + audit:views-গ্রিন + EJS-compile-প্রমাণ; প্যাচ: scripts/s282-patch.py (idempotent ×২-প্রমাণ, ×৪-এডিট, প্রি/পোস্ট-অ্যাসার্ট ×২৮-টোকেন)।

**গোটচা ×৩ (PLANS session282):** ① **stale-view-cache** — প্যাচ-পরবর্তী পুরাতন-প্রসেস পুরাতন-কম্পাইল-টেমপ্লেট-ই সার্ভ করে (production view-cache) → স্যুটের রেন্ডার্ড-মার্কআপ-অ্যাসার্ট মিথ্যা-ব্যর্থ → **স্যুট-শুরুতেই kill→ensure-server fresh-reboot-প্রথা** ② **used-value blockification** — flex-কনটেইনার-সন্তানের `display:inline-flex` getComputedStyle-এ `flex` রিটার্ন করে (`.ep-zbtn`-ও-একই — ctlbar-পরিবার-সর্বত্র) → computed-অ্যাসার্টে inline-flex-প্রত্যাশা-নিষিদ্ধ, used-value (`flex:none`)-ই-সঠিক ③ **containsF-চুক্তি** — ফাংশনটি কনটেন্ট-স্ট্রিং নেয়; ফাইল-পাথ-পাঠালে পাথ-স্ট্রিং-ই echo হয় (সাইলেন্ট-মিথ্যা-ব্যর্থতা) → `PAGEC=$(cat "$PAGE")`-চুক্তি।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৮২ সন্নিবেশিত')

# ── ② PLANS.md session282-নোট (session281-নোট-এর-আগে) ──
pl = open(PLANS, encoding='utf-8').read()
if '## session282-নোট' in pl:
    print('skip-②: PLANS session282-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session281-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session282-নোট (cron 403679 — পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন ep282)
- **stale-view-cache-গোটচা (নতুন):** প্যাচ-প্রয়োগের-পরেও চলমান-সার্ভার-প্রসেস পুরাতন-কম্পাইল-টেমপ্লেট-ই সার্ভ করে (production view-cache প্রসেস-মেমরিতে) — curl-রেন্ডার্ড-মার্কআপ-অ্যাসার্ট মিথ্যা-ব্যর্থ করে (এ-রাউন্ডে aria-expanded-মিথ্যা-ফেল ×১); **স্যুট-শুরুতেই kill→ensure-server fresh-reboot-প্রথা** (s282-ধাপ-২-প্রয়োগ-প্রমাণ); fresh-reboot-এর-পরে-ও seed-ফলব্যাক-রিবুট-অক্ষুণ্ণ।
- **used-value-blockification-গোটচা (নতুন):** flex-কনটেইনার-সন্তানের `display:inline-flex` getComputedStyle-এ `flex` রিটার্ন করে (used value; `.ep-zbtn`-ও-`flex` — epaper-ctlbar-পরিবারে সর্বত্র) — **computed-display-অ্যাসার্টে inline-flex-প্রত্যাশা-নিষিদ্ধ**; CSSOM-স্ক্যান (styleSheets-লুপ — matching-rules-এ-display) দিয়ে বিজয়ী-রুল-প্রমাণের-কৌশল ব্যবহার্য।
- **containsF-চুক্তি-পুনঃস্মরণ:** ফাংশনটি কনটেন্ট-স্ট্রিং নেয় — ফাইল-পাথ পাঠালে পাথ-স্ট্রিং-ই echo হয়ে grep-মিথ্যা-ব্যর্থ (সাইলেন্ট); স্যুটে `PAGEC=$(cat "$PAGE")`-প্রথা (s282-প্রয়োগ)।
- **ep282-স্থাপত্য-চুক্তি:** নেটিভ select = একক-উৎস — কম্বো **ওভারলে-মাত্র**; নির্বাচন = value-সেট + change-পুনঃপ্রেরণ (সুইচ-লজিক-ডুপ্লিকেট-নিষিদ্ধ); লেবেল-সিঙ্ক = syncPaperSelect-হুক (hoisted-ঘোষণা — বুট-পূর্ব-কল-নিরাপদ); armed-শ্রেণি JS-যোগিত (no-JS ফলব্যাকে নেটিভ select-ই); ep281-ক্যাশ-স্থাপত্য + ep280-৩-প্যানেল অক্ষুণ্ণ; __ep282QA ×১১-ফিল্ড।
- **পরের-এজেন্ট: session283 থেকে (worklog Task ID 123)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; বাকি-প্রস্তাব: **ক্যালেন্ডারে মাস-তালিকা-শর্টকাট**, LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই, admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), ep282-প্যানেলে aria-activedescendant-বিস্তার, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session282-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-122 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 122 (session282' in wl:
    print('skip-③: repo-worklog Task-122 ইতোমধ্যে')
else:
    ENTRY3 = '''
---
Task ID: 122 (session282 — cron 403679; পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন ep282) — push (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609232133)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

Work Log:
- রাউন্ড-শুরু-যাচাই: HEAD=origin=`cf2c653` (session281-ep281), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (session281-প্রথা-প্রথম-প্রয়োগ — BEHIND=০); উভয়-session280-নোট + session281-নোট পঠিত
- **স্টেল-সামারি-সংশোধন ×৪৫:** কনটেক্সট-সামারি Task43/device-flow-যুগ-দাবি পুনরায়-অস্বীকৃত; ACTIVE-LOCK + HEAD=origin-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: প্রোড-স্পট (home-200 + health-healthy + /epaper-200 + ep281-মার্কার) + স্থানীয় s281 ৩৯/৩৯-ক্যানারি — বাগ-শূন্য → ফিচার-রাউন্ড (session281-শীর্ষ-প্রস্তাব গ্রহণ)
- **[Mandatory-ফিচার]** ep282 সার্চযোগ্য-পত্রিকা-সিলেক্টর — নেটিভ-select-ওভারলে কম্বো (একক-উৎস-অক্ষুণ্ণ; change-পুনঃপ্রেরণ; armed-ফলব্যাক; aria-পূর্ণ; __ep282QA ×১১) + **[Mandatory-স্টাইল]** ep282-ব্লক হেক্স-শূন্য টোকেন-শুধু (বিস্তারিত PROJECT §২৮২)
- **টেস্ট:** নতুন tests/s282-epsearch-suite.sh **৫৩/৫৩ ×২-ধারাবাহিক (SKIP=০)** + মার্কার-সিড/ক্লিন নেট-শূন্য (PRE=০→FINAL=০) + পূর্ণ-রিগ্রেশন s260-s281 (২৩-সুইট) + role-policy + guard/audit-গ্রিন
- **গোটচা ×৩:** stale-view-cache (স্যুট-শুরুতে fresh-reboot-প্রথা) + used-value-blockification (computed inline-flex→flex) + containsF-কনটেন্ট-চুক্তি (পাথ-নয়)
- প্যাচ: scripts/s282-patch.py (idempotent ×২-প্রমাণ) + ডক ×৩ (PROJECT §২৮২ + PLANS session282 + repo-worklog Task-122)
- PNG-চার্ন-রিভার্ট (স্যুট-PNG ×২-ইনটেনশনাল-কমিটেড — s281-প্রথা) + secret-scan-ক্লিন + push-পূর্ব পুনঃ-fetch

Stage Summary:
- **[Mandatory-ফিচার]** ep282 কম্বো-সিলেক্টর (ট্রিগার + সার্চ-প্যানেল + কী-বোর্ড + বাইরে-ক্লিক) — নেটিভ select একক-উৎস, সুইচ-লজিক-ডুপ্লিকেট-শূন্য
- **[Mandatory-স্টাইল]** ep282-ব্লক হেক্স-শূন্য (এন্ট্রি-অ্যানিমেশন + is-act/is-sel + স্ক্রলবার + মোবাইল + reduced-motion)
- পরের-এজেন্ট: **session283 লেবেল (worklog Task ID 123)**; PLANS session282-নোট অবশ্যই-পড়ুন (stale-view-cache fresh-reboot-প্রথা + blockification + containsF-চুক্তি); **ফিচার-কোড-লেখার-আগেই fetch**; push-আগে পুনঃ-fetch+rebase-বাধ্যতমূলক
- রিমোট main = push-পরবর্তী HEAD (session282-ep282); working-tree ক্লিন
'''
    if not wl.endswith('\n'):
        wl += '\n'
    wl += ENTRY3
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-122 সংযোজিত')

print('DOCS-DONE')
