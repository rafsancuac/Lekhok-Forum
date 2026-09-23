#!/usr/bin/env python3
# s290-docs.py — session290 ডক-আপডেট (PROJECT §২৯০ + PLANS session290-নোট + repo worklog Task-130)
# চুক্তি: idempotent (মার্কার-গার্ড) + অ্যাঙ্কর-প্রি-অ্যাসার্ট
import os, sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJECT = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WORKLOG = os.path.join(APP, 'worklog.md')

# ── ① PROJECT.md §২৯০ (§২৮৯-এর-আগে সন্নিবেশ) ──
pj = open(PROJECT, encoding='utf-8').read()
if '## §২৯০ (session290' in pj:
    print('skip-①: PROJECT §২৯০ ইতোমধ্যে')
else:
    ANCHOR = '## §২৮৯ (session289'
    assert ANCHOR in pj, 'PROJECT-অ্যাঙ্কর-অনুপস্থিত'
    ENTRY = '''## §২৯০ (session290 — cron 403679: কম্বোতে aria-activedescendant ep290 — ep282-প্যানেলে SR-অ্যাক্টিভ-অপশন-ঘোষণা + Home/End + is-act-দৃশ্যমান-দ্বৈত) — s290 ৪৭/৪৭ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`666594a` (session289-ep289, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: প্রোড-ক্যানারি সবুজ (home/epaper ২০০ + ep289-বুট-নীরব + ep288-labeled=৩০/৩০ + ক্যারেট-রেন্ডারড) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session289-শীর্ষ-প্রস্তাব গ্রহণ: **ep282-প্যানেলে aria-activedescendant-বিস্তার**)।

**[Mandatory-ফিচার] কম্বোতে aria-activedescendant (ep290):** ep282-কম্বো-প্যানেলে ↑↓-নেভ এতদূর **ভিজ্যুয়াল-শুধু** (is-act-ক্লাস; অপশনে-আইডি-নেই, activedescendant-নেই) — এ-রাউন্ডে: **সেটআপে elPsSearch-এ role=combobox + aria-autocomplete=list + aria-controls=epPs282Opts + aria-expanded=false** (APG-কম্বো); **রেন্ডার-র‍্যাপারে** দৃশ্যমান-অপশনে **স্থিতিশীল-আইডি** (epPsOpt290-<i> — প্রতি-রেন্ডারে-পুনঃনির্ধারণ); **অ্যাক্টিভেট-র‍্যাপারে aria-activedescendant-সিঙ্ক** — **দ্বৈত-মালিক** (elPsSearch — DOM-ফোকাস-ধারক, SR-যা-পড়ে + elPsBtn — aria-controls-মালিক, ARIA-১.১-সেম্যান্টিক্স-অক্ষুণ্ণ); **খোলা/বন্ধ-র‍্যাপারে aria-expanded-সিঙ্ক (সার্চ-ইনপুটে)** + বন্ধে activedescendant-**পরিষ্কারণ**; **Home/End** (প্যানেল-খোলা + অপশন-উপস্থিত → প্রথম/শেষ — APG-কম্বো-প্যাটার্ন; preventDefault-সহ); বডি-অস্পৃশ্য (ps282Render/ps282Activate/ps282OpenPanel/ps282Close-বডি-অপরিবর্তিত — র‍্যাপার-স্তর ×৪); **__ep290QA হুক ×৫** (ad/adSearch/ids/activeId/expSearch)।

**[Mandatory-স্টাইল]:** epaper.css ep290-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — **is-act = অ্যাক্টিভ-ডিসেনডেন্ট-দৃশ্যমান-দ্বৈত** (`.ep-ps-opt.is-act` inset-৩px-brand-বার + font-weight-৮০০ — SR-অ্যাক্টিভ-অপশনের দৃশ্যমান-চিহ্ন; hover-টিন্ট-অতিরিক্ত) + reduced-motion-অক্ষুণ্ণ; ep280-289-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s290-comboad-suite.sh **৪৭/৪৭ ×২-ধারাবাহিক (SKIP=০)** (সোর্স ×২০ + রেন্ডার্ড ×৩ + E2E ×১৩: **বুট-স্টেট** (expSearch=false + ad=শূন্য) + **খোলা-সিঙ্ক** (expSearch=true + আইডি==visible + ad==adSearch==activeId দ্বৈত-মালিক) + ↓/↑-নেভ-ad-সিঙ্ক (এক-অপশনে wrap-ইন-প্লেস-চুক্তি) + **End/Home-শেষ/প্রথম-অপশন** + **সার্চ-ফিল্টারে-আইডি-পুনঃসিঙ্ক** + **Enter-নির্বাচন-বন্ধ-পরিষ্কারণ** (picked + ad/adS=শূন্য + expSearch=false) + ep282-অক্ষুণ্ণ (label-সিঙ্ক) + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য) + **সিড-হেল্পার-পুনঃব্যবহার (s281-seedpaper — নেট-শূন্য PRE=০→FINAL=০)** + **পূর্ণ-রিগ্রেশন s260-s290 (৩২-সুইট সব-গ্রিন — রানার scripts/s290-regression.sh; মোট-৩২-অ্যাসার্ট + নিজের-নাম-অ্যাসার্ট; চাঙ্ক-নির্বাহ — ব্যাকগ্রাউন্ড-জব-গোটচা-প্রতিকার)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন; প্যাচ: scripts/s290-patch.py (idempotent ×৩, ×২-এডিট, পোস্ট-অ্যাসার্ট + হেক্স-শূন্য-অ্যাসার্ট)।

**গোটচা ×৩ (PLANS session290):** ① **অ্যাঙ্কর-যা-রিপ্লেসমেন্টে-নিলীন** — JS-অ্যাঙ্কর `…};\\n})();` নিজেই রিপ্লেস-ব্লকে-অন্তর্ভুক্ত → রান-২-এ অ্যাঙ্কর-অনুপস্থিত → **skip-মার্কার-গার্ড অ্যাঙ্কর-অ্যাসার্টের-আগেই** (s289-প্যাটার্ন; উল্টো-ক্রমে রান-১-সফল-হলেও রান-২-ক্র্যাশ — idempotency-ভাঙে) ② **tr '-0-9'-ব্যাড-অপশন** — সেটের-শুরুতে-ড্যাশ = অপশন-পার্স; `tr -dc '0-9'`-ই (নেগেটিভ-দরকার-হলে আলাদা-নোক-আউট) ③ **এক-অপশনে wrap-ইন-প্লেস-চুক্তি** — এক-মার্কার-সিডে ↓/↑ wrap করে একই-ইনডেক্সে — স্থানান্তর-অ্যাসার্ট-অসম্ভব; অ্যাসার্ট = প্রতি-অ্যাক্টিভেট-কলে-ad-সিঙ্ক + End/Home + ফিল্টার-পুনঃসিঙ্ক।

'''
    pj = pj.replace(ANCHOR, ENTRY + ANCHOR, 1)
    open(PROJECT, 'w', encoding='utf-8').write(pj)
    print('ok-①: PROJECT §২৯০ সন্নিবেশিত')

# ── ② PLANS.md session290-নোট ──
pl = open(PLANS, encoding='utf-8').read()
if '## session290-নোট' in pl:
    print('skip-②: PLANS session290-নোট ইতোমধ্যে')
else:
    ANCHOR2 = '## session289-নোট'
    assert ANCHOR2 in pl, 'PLANS-অ্যাঙ্কর-অনুপস্থিত'
    NOTE = '''## session290-নোট (cron 403679 — কম্বোতে aria-activedescendant ep290)
- **অ্যাঙ্কর-যা-রিপ্লেসমেন্টে-নিলীন-গোটচা (নতুন — প্যাচ-স্ক্রিপ্ট-শ্রেণি):** JS-অ্যাঙ্কর `options:…\\n  };\\n})();` — রিপ্লেসমেন্ট-ব্লক নিজেই এ-অ্যাঙ্কর-টেক্সট-নিলীন-করে (নতুন-ব্লকের-ভিতরে `};` থাকলেও মূল-ক্রম-ভাঙে) → **রান-২-এ অ্যাঙ্কর-অ্যাসার্ট-ক্র্যাশ যদি skip-গার্ড পরে-আসে**; s289-প্যাচে গার্ড-আগে-ছিল-বলে-রক্ষা, s290-এ উল্টো-ক্রমে-লিখে-ফেলেছিলাম (রান-১-সফল, রান-২-ক্র্যাশ — ধরা-পড়ে সংশোধন ×৩-রান-প্রমাণ); **প্রতিকার: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে; অ্যাঙ্কর-বাছাইয়ে রিপ্লেসমেন্ট-নিলীন-বিশ্লেষণ-পূর্বক**।
- **activedescendant-দ্বৈত-মালিক-চুক্তি (নতুন a11y-চুক্তি):** aria-activedescendant **ফোকাস-ধারক-এলিমেন্টের** উপর SR-পড়ে — ep282-তে DOM-ফোকাস নেভিগেশনে থাকে **সার্চ-ইনপুটে** (বাটনে-নয়) → elPsSearch-এ role=combobox + aria-activedescendant + aria-expanded + aria-controls (APG-১.২) **এবং** elPsBtn-এও (ARIA-১.১-ট্রিগার-সেম্যান্টিক্স-অক্ষুণ্ণ) — দ্বৈত-স্থাপন-নিরাপদ (অপশন-শূন্যে/বন্ধে-উভয়-থেকে-অপসারণ); ভবিষ্যৎ-কম্বো-সারফেসে এ-চুক্তি-অনুলিপি।
- **স্থিতিশীল-আইডি-রেন্ডার-র‍্যাপার-প্রথা:** টেমপ্লেট-স্ট্রিং-সম্পাদনা (ps282Render-বডি) নয় — **রেন্ডার-র‍্যাপারে পোস্ট-প্রসেস** (`if (!vis[i].id) vis[i].id = 'epPsOpt290-' + i`) + ep290AdId-তে-অন-ডিমান্ড-ফলব্যাক (অ্যাক্টিভেট-আগে-ঘটলেও-আইডি-নিশ্চিত); ফিল্টার-রি-রেন্ডারে আইডি-পুনঃসারিবদ্ধ — aria-রেফারেন্স-সর্বদা-জীবন্ত-DOM-নির্দেশ।
- **এক-অপশনে wrap-ইন-প্লেস-চুক্তি (টেস্ট-গোটচা):** এক-মার্কার-সিডে (s281-seedpaper ×১) ↓/↑ wrap করে **একই-ইনডেক্সে** (i>=length→0 লুপ) — স্থানান্তর-অ্যাসার্ট (activeId!=পূর্বে) মিথ্যা-ফেল; অ্যাসার্ট-বিন্যাস = **প্রতি-অ্যাক্টিভেট-কলে ad-সিঙ্ক-প্রমাণ** (র‍্যাপার-প্রতি-কল) + End/Home-বাউন্ড + ফিল্টার-পুনঃসিঙ্ক; বহু-অপশন-স্থানান্তর-প্রমাণ চাইলে বহু-মার্কার-সিড-হেল্পার-দরকার (নতুন-হেল্পার > অ্যাসার্ট-লোভ)।
- **tr-সেট-ড্যাশ-গোটচা (পুনঃপ্রমাণিত):** `tr -dc '-0-9'` → সেটের-শুরুর-ড্যাশ অপশন-পার্স-হয় (`invalid option`) — `tr -dc '0-9'`-ই লিখুন; নেগেটিভ-মান-দরকার হলে গ্রেপ-নোক-আউট-আলাদা।
- **পরের-এজেন্ট: session291 থেকে (worklog Task ID 131)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু; **-C "$ROOT"-থেকে**); PLANS session290 + session289 + session288 + session287 + উভয়-session280-নোট পড়ুন; বাকি-প্রস্তাব: LOWMEM-ডিভাইসে রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল (ep282)-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
    pl = pl.replace(ANCHOR2, NOTE + ANCHOR2, 1)
    open(PLANS, 'w', encoding='utf-8').write(pl)
    print('ok-②: PLANS session290-নোট সন্নিবেশিত')

# ── ③ repo worklog.md — টেইলে Task-130 সংযোজন ──
wl = open(WORKLOG, encoding='utf-8').read()
if 'Task ID: 130 (session290' in wl:
    print('skip-③: repo-worklog Task-130 ইতোমধ্যে')
else:
    ENTRY = '''
---
Task ID: 130 (session290 — cron 403679; কম্বোতে aria-activedescendant ep290) — push `666594a..HEAD` (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9, trace 202609240253)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`666594a` (session289-ep289), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: প্রোড-ক্যানারি সবুজ (home/epaper ২০০ + ep289-বুট-নীরব + ep288-labeled=৩০/৩০ + ক্যারেট-রেন্ডারড) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (PLANS session289-শীর্ষ-প্রস্তাব গ্রহণ: **ep282-প্যানেলে aria-activedescendant-বিস্তার**)

## এ-রাউন্ডে সম্পন্ন (session290)
- **[Mandatory-ফিচার] ep290:** ep282-কম্বো-প্যানেলে **aria-activedescendant-সিঙ্ক** — সেটআপে elPsSearch-এ role=combobox + aria-autocomplete=list + aria-controls + aria-expanded=false (APG); **রেন্ডার-র‍্যাপারে স্থিতিশীল-আইডি** (epPsOpt290-<i> — প্রতি-রেন্ডারে-পুনঃনির্ধারণ); **অ্যাক্টিভেট-র‍্যাপারে দ্বৈত-মালিক-সিঙ্ক** (elPsSearch — DOM-ফোকাস-ধারক + elPsBtn — aria-controls-মালিক); খোলা/বন্ধ-র‍্যাপারে aria-expanded-সিঙ্ক + বন্ধে পরিষ্কারণ; **Home/End** (প্যানেল-খোলা + অপশন-উপস্থিত → প্রথম/শেষ — APG); বডি-অস্পৃশ্য (র‍্যাপার ×৪) + **__ep290QA হুক ×৫** (ad/adSearch/ids/activeId/expSearch)
- **[Mandatory-স্টাইল]:** ep290-ব্লক হেক্স-শূন্য টোকেন-শুধু — **is-act = অ্যাক্টিভ-ডিসেনডেন্ট-দৃশ্যমান-দ্বৈত** (inset-৩px-brand-বার + weight-৮০০) + reduced-motion-অক্ষুণ্ণ
- **টেস্ট:** নতুন tests/s290-comboad-suite.sh **৪৭/৪৭ ×২-ধারাবাহিক (SKIP=০)** (বুট-স্টেট + খোলা-সিঙ্ক-দ্বৈত-মালিক + ↓/↑-ad-সিঙ্ক + End/Home-বাউন্ড + ফিল্টারে-আইডি-পুনঃসিঙ্ক + Enter-নির্বাচন-বন্ধ-পরিষ্কারণ + ep282-অক্ষুণ্ণ + স্ক্রিনশট ×২) + **সিড-হেল্পার-পুনঃব্যবহার (s281-seedpaper — নেট-শূন্য PRE=০→FINAL=০)** + **পূর্ণ-রিগ্রেশন s260-s290 (৩২-সুইট সব-গ্রিন — রানার s290-regression.sh; চাঙ্ক-নির্বাহ)** + role-policy **২৬০/২৬০** + guard:design + audit:views-গ্রিন
- **গোটচা ×৩ (PLANS session290):** ① **অ্যাঙ্কর-যা-রিপ্লেসমেন্টে-নিলীন** — অ্যাঙ্কর `…};\\n})();` রিপ্লেস-ব্লকে-নিলীন → রান-২-অ্যাঙ্কর-অ্যাসার্ট-ক্র্যাশ; **মার্কার-গার্ড-সর্বদা-অ্যাঙ্কর-অ্যাসার্টের-আগে** ② **tr '-0-9'-ব্যাড-অপশন** — সেট-ড্যাশ = অপশন-পার্স; '0-9'-ই ③ **এক-অপশনে wrap-ইন-প্লেস** — স্থানান্তর-অ্যাসার্ট-অসম্ভব; অ্যাসার্ট = প্রতি-কলে-ad-সিঙ্ক + End/Home + ফিল্টার-পুনঃসিঙ্ক
- **পাইপলাইন:** প্যাচ scripts/s290-patch.py (idempotent ×৩, ×২-এডিট, পোস্ট-অ্যাসার্ট+হেক্স-শূন্য-অ্যাসার্ট) + feature-commit (৮-ফাইল; git commit -F-পথ) + ডক ×৩ (PROJECT §২৯০ + PLANS session290 + repo-worklog Task-130; s290-docs.py idempotent ×২) + docs-commit + PNG-চার্ন-রিভার্ট (tracked-M-শুধু; -C "$ROOT") + secret-scan-ক্লিন + fetch (BEHIND=০) + **push** → Vercel READY → প্রোড-স্পট + **ep290-লাইভ-যাচাই** + স্ক্রিনশট download/s290-prod-*.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session291 লেবেল (worklog Task ID 131)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + **দীর্ঘ-রান চাঙ্কে-ই** + কমিট-মেসেজ -F-পথ; PLANS session290 + session289 + session288 + session287 + উভয়-session280-নোট পড়ুন
- বাকি-প্রস্তাব: LOWMEM-রেল-থাম্ব-প্রি-রেন্ডার-ক্যাপ, multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), admin-সারফেস-ফিল্টার-অ-তালিকা-প্রার্থী (security.ejs স্কোপ-ম্যাপ-পূর্বক; trash-admin-ভ্যারিয়েন্ট; content-history সুইট-স্তর), কম্বো-প্যানেল-অপশনে aria-selected-সার্চ-সিঙ্ক-পুনঃযাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
- রিমোট main = push-পরবর্তী HEAD (session290-ep290); working-tree ক্লিন'''
    wl = wl.rstrip('\n') + ENTRY
    open(WORKLOG, 'w', encoding='utf-8').write(wl)
    print('ok-③: repo-worklog Task-130 সংযোজিত')

print('ডক-আপডেট সম্পন্ন (idempotent ×২-প্রস্তুত)')
