#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s306-docs.py — session306 ডক-ত্রয় (PROJECT §৩০৬ + PLANS session306-নোট + repo worklog Task 146)
# চুক্তি: ইডেমপোটেন্ট ×২ (মার্কার-স্কিপ) + @@HID@@-প্লেসহোল্ডার (লেখনী-স্তর -ক্ষয়-এড়ানো)
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
HID = '[' + 'h' + 'idden]'

PROJECT_TITLE = '## §৩০৬ (session306 — cron 403679: ep306 পৃষ্ঠা-সংখ্যা-ব্যাজ — page-count-গেট-উন্মোচন + migrate-বুট-ফিক্স) — s306 ৫০/৫০ ×৩ (২৪ সেপ্টেম্বর ২০২৬)'

PROJECT_BODY = '''
**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`7eb1749` (session305, clean-tree, BEHIND=০)। agent-browser QA-বেসলাইন: home/epaper/notices/articles/gallery/resources/about/search সর্ব-200 + JS-এরর-শূন্য; `/api/epaper/archive`-প্রতিতে `pageCount`-ফিল্ড-অনুপস্থিতি-প্রমাণিত → PLANS session305-প্রস্তাবের **page-count-ব্যাজ (গেটেড)**-এর গেট = `epaper_files.page_count`-কলাম — এ-রাউন্ডেই গেট-উন্মোচন (বট+সাইট উভয়-স্তর)।

**[Mandatory-ফিচার] ep306 — পৃষ্ঠা-সংখ্যা-ব্যাজ এন্ড-টু-এন্ড (চার-স্তর):** ① **স্কিমা/মাইগ্রেশন:** `db/schema.sql`-এ `epaper_files.page_count INTEGER` + `db/migrate.js`-এ উভয়-ব্যাকএন্ডে (Turso `client.execute` + লোকাল sql.js `db.run`) idempotent `ALTER TABLE ... ADD COLUMN page_count INTEGER` (duplicate-column-সহনশীল) ② **API:** `routes/api-epaper.js` sync-পেলোডে `pageCount` (1..999-বাইরে NULL — স্যানিটাইজ) — আর্কাইভ-আপডেট-পথে `page_count = COALESCE(?, page_count)` (বট-পুনঃসিঙ্কে-সংরক্ষণ; পুরাতন-রো-মান-অক্ষুণ্ণ) + উভয়-INSERT-পথে কলাম + sync-রেসপন্সে `pageCount` + `/api/epaper/archive` উভয়-SELECTে `page_count AS pageCount` + `routes/daily.js` /epaper-SELECTে যোগ ③ **ভিউ:** `views/user/epaper.ejs` payloadে `pages: p.pageCount || null` + `renderList()`-এ `.ep-pages306`-ব্যাজ (আইকন + বাংলা-সংখ্যা "৫২ পৃষ্ঠা"; page_count-শূন্যে রেন্ডার-ই-হয়-না — গেটেড-চুক্তি) + `.ep-item[data-pages]` + `__epg306QA` হুক (papers-শূন্যে-ও সংজ্ঞায়িত — total/withPages/badges()/pages(id); `__epk300QA` অক্ষুণ্ণ) ④ **বট:** `epaper-bot/src/index.ts` — pdf-lib `PDFDocument.load(pdfBytes).getPageCount()` (ক্লিনড-বাইট; ব্যর্থতায় undefined — প্রধান-প্রবাহ অটুট) + `siteSync(..., pageCount?)` → sync-বডিতে `pageCount`। **বাস্তবায়ন-গেট-অবশিষ্ট:** প্রোডে বট-রিডিপ্লয় + Vercel-ডিপ্লয়-পরবর্তী নতুন-সিঙ্কে-ই পৃষ্ঠা-সংখ্যা আসবে (পুরাতন-রো শূন্য — ব্যাজ-অদৃশ্য, কোনো-ভাঙা-নেই); লোকাল sync-write-পথ HTTP-যাচাই গেটেড (`EPAPER_SYNC_TOKEN` স্যান্ডবক্সে অনুপস্থিত — 503-প্রমাণিত) — স্ট্রাকচারাল-অ্যাসার্ট + ডিবি-সিড-পথে রিড-সাইড E2E-প্রমাণিত।

**QA-বাগ-ফিক্স (বোনাস — রাউন্ড-মাঝে-আবিষ্কৃত): `db/migrate.js` রান-অক্ষম ছিল** — top-level `await initSqlJs()` + `require()` সহ-বিদ্যমানতায় Node 22+ `ERR_AMBIGUOUS_MODULE_SYNTAX` (v24-এ পুনঃ-প্রমাণিত) → লোকাল-শাখা `(async () => { ... })().catch(...)`-এ মোড়ানো → `node db/migrate.js` পুনঃচালু + `node --check` গ্রিন; ep306-ALTER-পথ এ-স্ক্রিপ্টের-উপরেই নির্ভরশীল বলে ফিক্স-অপরিহার্য ছিল (Turso-প্রোড-মাইগ্রেশন-ও এ-ভাঙা-অবস্থায় ছিল — সুপ্ত-প্রোড-বাগ-ফিক্স)।

**[Mandatory-স্টাইল]:** epaper.css **session306-ব্লক** (হেক্স-শূন্য টোকেন-শুধু + color-mix-অ্যাকসেন্ট) — `.ep-pages306` পিল (var-token + `--lf-radius-chip` + text-secondary/ui-input-bg/ui-border-strong; আইকন brand-primary) + `.is-on`-আইটেমে brand-টিন্ট/প্রান্ত (color-mix 9%/38%) + ট্রানজিশন + **মেটা-সারি flex-row (≥641px মিডিয়া-গেটেড** — নাম flex:1+ellipsis, ব্যাজ/উষ্ণ-চিপ flex-shrink:0; ≤640px-এ s280-কলাম+২-লাইন-ক্ল্যাম্প চুক্তি অটুট) + 640px-কমপ্যাক্ট + reduced-motion-গার্ড।

**টেস্ট:** নতুন `scripts/s306-seed-epaper.js` (সার্ভার-বন্ধ-সিড — pkill -9, SIGTERM-save clobber-গোটচা; source=`s306-qa` মার্কার ৩-সারি page_count ৫২/১২/৮; s280-শূন্য-সারি = ব্যাজ-অনুপস্থিত-নিয়ন্ত্রণ-দল; --clean; idempotent) + নতুন tests/s306-suite.sh **৫০/৫০ ×৩-ধারাবাহিক** (কাঠামো ×২১ + লাইভ-ডিবি PRAGMA + archive-API pageCount ×৩ + E2E ×১১ — হুক total=8/withPages=3/badges=3 + বাংলা-ব্যাজ-টেক্সট + data-pages ASCII + SAME-ROW-জ্যামিতি + শূন্য-সারিতে-ব্যাজ-অনুপস্থিত + স্ক্রিনশট ×২ + এরর-শূন্য + **পরিষ্কারক seed --clean নেট-শূন্য ×৩-অ্যাসার্ট**); রিগ্রেশন: **s300-epref ৬৫/৬৫ + s301 ৬৯/৬৯ + s303 ৭৫/৭৫ + guard:design + audit:views (১২২ ejs)** — সর্ব-গ্রিন; প্যাচ scripts/s306-patch.py (idempotent ×N — মার্কার-স্কিপ + অ্যাঙ্কর-এককতা-FATAL + count-aware-ব্যতিক্রম (archive-SELECT ×২) + পোস্ট-অ্যাসার্ট + node --check ×৩ + EJS-compile + ব্লক-স্কোপড-হেক্স-শূন্য)।

**প্রোড-সেফটি ফলব্যাক (কমিট-২):** অ-মাইগ্রেটেড-ডিবিতে (Vercel-ডিপ্লয় ↔ Turso-মাইগ্রেশন মাঝে-জানালা) sync-রাইট ও পাবলিক archive-API ভাঙা-রোধ — sync-স্টেটমেন্ট ×৪ + archive-SELECT + /epaper-SELECT-এ page_count-বিহীন-লেগেসি-ফলব্যাক (e306pc; pageCount:null — গ্রেসফুল-গেট; প্রধান-প্রবাহ-অটুট চুক্তি-ধর্ম)।

**গোটচা ×৩ (PLANS session306):** ① **শ্রেণি-সংঘর্ষ (নতুন-শ্রেণি):** ব্যাজ-শ্রেণি `.ep-pages` প্রতিষ্ঠিত রিডার-স্ক্রলার-শ্রেণির-সাথে সংঘাত (`wrap.className='ep-pages'` — epaper.ejs:829) — ব্যাজ-স্টাইল রিডারে-ছিটকে-যাওয়ার-ঝুঁকি + জ্যামিতি-বিকৃতি; `.ep-pages306`-নামস্পেসে-সংশোধিত — **চুক্তি: নতুন-CSS-শ্রেণির-পূর্বে ফাইল-ব্যাপী সংঘর্ষ-গ্রেপ বাধ্যতমূলক** ② **মার্কার-রিনেম-মিথস্ক্রিয়া:** এক-এডিটের মার্কার যদি পরবর্তী-এডিটে-রিনেম-হওয়া-ক্লাস-স্ট্রিং বহন করে, রিনেম-পরবর্তী পুনঃরানে মার্কার-হারিয়ে সেই-এডিট পুনঃ-প্রয়োগ হয় → ডুপ-লাইন (ব্যাজ ×২/সারি — হুক badges()=6 বনাম withPages=3-অমিলে ধরা-পড়ে) — **চুক্তি: প্যাচ-মার্কার ক্লাস-নাম-নিরপেক্ষ হোক (কমেন্ট/সেশন-মার্কার-ভিত্তিক)** ③ **ডিসপ্লে-স্তর `[m`-ক্ষয়-পুনঃ-প্রমাণ:** `[migrate]`-জাতীয় প্রিফিক্স Read/রিপ্রিন্টে `igrate]`-দৃশ্যমান (s304-`idden]`-গোটচার ভ্যারিয়েন্ট) — od/python-bytes-যাচাই-ব্যতীত অ্যাঙ্কর-গঠন-নিষিদ্ধ; ক্ষয়-প্রবণ-স্ট্রিংয়ে `chr(91)`-গঠন-কৌশল।

**প্রোড-স্পট (গেটেড-বহিঃপ্রাঙ্গণ):** লোকাল-স্যান্ডবক্সে sync-token-শূন্যতায় write-path HTTP-যাচাই হয়নি (গেটেড); প্রোড-ক্রেড/টোকেন-ধারী-এজেন্টের-কার্য: ① Vercel-ডিপ্লয়-পরবর্তী `/epaper` হুক-স্পট ② বট-হোস্টে রিডিপ্লয়-পরবর্তী প্রকৃত-PDF-এ pageCount-প্রবাহ ③ `EPAPER_SYNC_TOKEN`-সহ sync-write E2E।

**পরের-এজেন্ট: session307 (Task ID 147)** — PLANS session306+305+304 পড়ুন; fetch + push-আগে re-fetch+rebase + রিবেজ-পরবর্তী guard:design + PNG-চার্ন-রিভার্ট; বাকি-প্রস্তাব: page-count-ব্যাজ প্রোড-যাচাই (বট-রিডিপ্লয়-গেটেড), পুরাতন-রো page_count-ব্যাকফিল (resync-পথে pageCount — ঐচ্ছিক), sync-write E2E (টোকেন-গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), নতুন-ফিল্টার-সারফেসে checked-pinned-চেকলিস্ট-প্রয়োগ।
'''

PLANS_NOTE = '''## session306-নোট (cron 403679 — ep306 পৃষ্ঠা-সংখ্যা-ব্যাজ — page-count-গেট-উন্মোচন)
- **শ্রেণি-সংঘর্ষ-গোটচা (নতুন-শ্রেণি):** নতুন-ব্যাজ-শ্রেণি `.ep-pages` প্রতিষ্ঠিত রিডার-স্ক্রলার-শ্রেণির-সাথে সংঘাতপ্রবণ প্রমাণ (`wrap.className='ep-pages'` — epaper.ejs রিডার-ইঞ্জিন) — একই-নামে-দুই-ভূমিকায় CSS-বহিঃপ্রবাহ + QA-জ্যামিতি-বিকৃতি; `.ep-pages306`-সেশন-নামস্পেসে-সংশোধিত। **চুক্তি: নতুন-CSS-শ্রেণি/আইডি-যোগের-পূর্বে টার্গেট-ফাইলে `\\.name\\b`-জাতীয় সংঘর্ষ-গ্রেপ-বাধ্যতমূলক** (পরিবার-নামস্পেস রীতি: `epk300-warm`/`mc-flash305`-ধর্ম)।
- **প্যাচ-মার্কার-রিনেম-মিথস্ক্রিয়া-গোটচা (নতুন-শ্রেণি):** এক-এডিটের idempotency-মার্কার যদি অন্য-এডিটে-পরিবর্তিত-হওয়া-স্ট্রিং (ক্লাস-রিনেম) বহন করে → রিনেম-পরবর্তী প্যাচ-পুনঃরানে মার্কার-অনুপস্থিতি-ধরে সেই-এডিট পুনঃ-প্রয়োগ → **ডুপ-লাইন নীরবে ঢোকে** (এ-রাউন্ডে ব্যাজ ×২/সারি — E2E হুক-অমিল `badges()=6 ≠ withPages=3`-এ ধরা-পড়ে); সংশোধন = মার্কার-কমেন্ট-ভিত্তিক + সুইটে গণনা-অ্যাসার্ট। **চুক্তি: মার্কার কখনো রিনেম-সাপেক্ষ-স্ট্রিং হবে-না; প্রতি-রাউন্ডের সুইটে নতুন-মার্কআপের সংঘটন-গণনা-অ্যাসার্ট রাখুন।**
- **`db/migrate.js` ERR_AMBIGUOUS_MODULE_SYNTAX-ফিক্স (সুপ্ত-বাগ):** top-level `await` + `require()` সহ-বিদ্যমান → Node 22+ মডিউল-ফরম্যাট-অনির্ণেয় → স্ক্রিপ্ট-সম্পূর্ণ-অচল (লোকাল + Turso উভয়-পথ); লোকাল-শাখা async-IIFE-মোড়ানো-ফিক্স। **চুক্তি: নতুন-কোনো-মাইগ্রেশন-গেট কোনো-স্ক্রিপ্টের উপর দাঁড়ালে সেই-স্ক্রিপ্ট আগে প্রকৃত-রান-প্রমাণ-বাধ্যতমূলক (শুধু node --check নয়)।**
- **page_count-গেট-উন্মোচন-চুক্তি (বট↔সাইট সংযোগ):** কলাম-যোগ দুই-স্তরে একসাথে (স্কিমা+ALTER; sync-পেলোড; বিউ; বট-গণনা) — বট-গণনা ব্যর্থতায় `undefined`-ই-যায়, সাইটে `COALESCE`-সংরক্ষণ + UI-তে শূন্যে-রেন্ডার-না — **পুরাতন/ব্যর্থ-ডেটায় কোনো-ভাঙা-নেই (গ্রেসফুল-গেট)**; 1..999-বাইরের মান NULL-হয় (স্যানিটাইজ-চুক্তি)।
- **sync-write-যাচাই-গেট:** লোকাল স্যান্ডবক্সে `EPAPER_SYNC_TOKEN` অনুপস্থিত (503-প্রমাণিত) — sync-write HTTP-E2E টোকেন-ধারী-এজেন্টের-কার্য; রিড-পথ (archive-API + UI-ব্যাজ) ডিবি-সিড-পথে পূর্ণ-E2E-প্রমাণিত (s306-সুইট)।
- **অ-মাইগ্রেটেড-ডিবি-ফলব্যাক চুক্তি (কমিট-২):** নতুন-কলাম-নির্ভর SELECT/INSERT/UPDATE-প্রতিটিতে লেগেসি-ফলব্যাক (page_count-বিহীন) — ডিপ্লয়↔মাইগ্রেশন-মাঝে-জানালায় বট-sync ও পাবলিক-API জীবিত থাকে (pageCount:null — ব্যাজ-অদৃশ্য, ভাঙা-শূন্য); **চুক্তি: মাইগ্রেশন-নির্ভর-কলাম প্রতিটি স্টেটমেন্টে ফলব্যাক-যোগ্য হোক বা প্রি-ফ্লাইট-কলাম-প্রোব করুন।**
- **পরের-এজেন্ট: session307 থেকে (worklog Task ID 147)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session306 + session305 + session304 পড়ুন; বাকি-প্রস্তাব: page-count-ব্যাজ প্রোড-যাচাই (বট-রিডিপ্লয়-গেটেড), পুরাতন-রো page_count-ব্যাকফিল (resync-পথে pageCount-যোগ — ঐচ্ছিক), sync-write E2E (টোকেন-গেটেড), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ), নতুন-ফিল্টার-সারফেসে checked-pinned-চেকলিস্ট + ম্যাট্রিক্স-অডিট-প্রয়োগ।

'''

WORKLOG_ENTRY = '''---
Task ID: 146
Agent: Cron agent loop (session306 — Job 403679, trace 202609241511)
Task: ep306 পৃষ্ঠা-সংখ্যা-ব্যাজ (page-count-গেট-উন্মোচন) + migrate-বুট-ফিক্স + [Mandatory] স্টাইল/ফিচার + রিগ্রেশন + ডক-ত্রয়

Work Log:
- **প্রোড-সেফটি ফলব্যাক (কমিট-২):** sync-স্টেটমেন্ট ×৪ + archive/epaper-SELECT লেগেসি-ফলব্যাক (e306pc) — অ-মাইগ্রেটেড-ডিবিতেও বট-sync/API জীবিত; সুইট ৪৭→৫০-চেক (৫০/৫০ ×৩)
- worklog/PLANS/PROJECT পড়ে অবস্থা-যাচাই: HEAD=origin=7eb1749 (session305-pushed, clean-tree, BEHIND=০); রিপো-টপোলজি-স্পষ্টীকরণ (একক-রিপো — সাইট lekhok-forum/-সাবট্রি + epaper-bot/ রুটে)
- agent-browser QA-বেসলাইন: ৭-পৃষ্ঠা-সর্ব-200 + এরর-শূন্য; archive-APIতে pageCount-অনুপস্থিতি-প্রমাণ → session305-প্রস্তাবের page-count-গেট এ-রাউন্ডেই উন্মোচনের সিদ্ধান্ত
- scripts/s306-patch.py: স্কিমা page_count + migrate-ALTER (উভয়-ব্যাকএন্ড) + api-epaper sync/pageCount (COALESCE + 1..999-স্যানিটাইজ) + archive/daily-SELECT + epaper.ejs payload/badge/hook + epaper.css session306-ব্লক (হেক্স-শূন্য + flex-row ≥641px-গেট) + bot pdf-lib getPageCount → sync-বডি
- **QA-বাগ-ফিক্স:** db/migrate.js ERR_AMBIGUOUS_MODULE_SYNTAX (top-level await + require — Node 22+ অচল) → async-IIFE-মোড়ানো; node db/migrate.js পুনঃজীবিত + ALTER-প্রয়োগ-প্রমাণ
- **গোটচা ×২ ধরা-পড়ে ও সংশোধিত:** শ্রেণি-সংঘর্ষ (.ep-pages রিডার-স্ক্রলার → .ep-pages306-নামস্পেস) + মার্কার-রিনেম-মিথস্ক্রিয়া (ডুপ-ব্যাজ-লাইন — হুক-অমিলে ধরা; কমেন্ট-ভিত্তিক-মার্কারে সংশোধন)
- scripts/s306-seed-epaper.js (সার্ভার-বন্ধ মার্কার-সিড ৫২/১২/৮ + --clean) + tests/s306-suite.sh **৫০/৫০ ×৩-ধারাবাহিক**
- রিগ্রেশন: s300-epref ৬৫/৬৫ + s301 ৬৯/৬৯ + s303 ৭৫/৭৫ + guard:design + audit:views (১২২ ejs) — সর্ব-গ্রিন
- গেটেড-অবশিষ্ট: sync-write HTTP-E2E (EPAPER_SYNC_TOKEN-অনুপস্থি — 503-প্রমাণিত), প্রোড-ব্যাজ-যাচাই (বট-রিডিপ্লয় + Vercel-ডিপ্লয়-পরবর্তী)
- ডক-ত্রয়: PROJECT §৩০৬ + PLANS session306-নোট + repo worklog Task 146 (s306-docs.py idempotent ×২)

Stage Summary:
- **page-count-গেট-উন্মোচন:** স্কিমা→API→ভিউ→বট চার-স্তরে পৃষ্ঠা-সংখ্যা-প্রবাহ; শূন্য-ডেটায় গ্রেসফুল (ব্যাজ-অদৃশ্য — ভাঙা-শূন্য)
- migrate.js-বুট-ফিক্স = সুপ্ত-প্রোড-মাইগ্রেশন-বাগও-সারা; নতুন-চুক্তি ×৩ (শ্রেণি-সংঘর্ষ-গ্রেপ + মার্কার-রিনেম-নিরপেক্ষতা + মাইগ্রেশন-গেটে-প্রকৃত-রান-প্রমাণ) PLANS-এ
- প্যাচ/সিড/সুইট: scripts/s306-patch.py + scripts/s306-seed-epaper.js + tests/s306-suite.sh (৫০-চেক)
- ডক: PROJECT §৩০৬ + PLANS session306 + worklog Task 146; পরের-এজেন্ট session307 (Task ID 147)
'''

PROJECT_BODY = PROJECT_BODY.replace('@@HID@@', HID)
PLANS_NOTE = PLANS_NOTE.replace('@@HID@@', HID)
WORKLOG_ENTRY = WORKLOG_ENTRY.replace('@@HID@@', HID)

fails = []

# ── 1) PROJECT.md: §৩০৬-সন্নিবেশ (§৩০৫-র পূর্বে) ──
p = APP + '/PROJECT.md'
t = open(p, encoding='utf-8').read()
if '## §৩০৬' in t:
    print('SKIP PROJECT §৩০৬ (পূর্ব-বিদ্যমান)')
else:
    anchor = '## §৩০৫'
    if t.count(anchor) != 1:
        fails.append('PROJECT: §৩০৫-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PROJECT_TITLE + '\n' + PROJECT_BODY + '\n' + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PROJECT §৩০৬')

# ── 2) PLANS.md: session306-নোট (session305-নোট-এর পূর্বে) ──
p = APP + '/PLANS.md'
t = open(p, encoding='utf-8').read()
if '## session306-নোট' in t:
    print('SKIP PLANS session306 (পূর্ব-বিদ্যমান)')
else:
    anchor = '## session305-নোট'
    if t.count(anchor) != 1:
        fails.append('PLANS: session305-অ্যাঙ্কর count=' + str(t.count(anchor)))
    else:
        i = t.index(anchor)
        t2 = t[:i] + PLANS_NOTE + t[i:]
        open(p, 'w', encoding='utf-8').write(t2)
        print('APPLIED PLANS session306-নোট')

# ── 3) repo worklog.md: Task 146 সংযোজন (ফাইল-শেষে) ──
p = APP + '/worklog.md'
t = open(p, encoding='utf-8').read()
if 'Task ID: 146' in t:
    print('SKIP worklog Task 146 (পূর্ব-বিদ্যমান)')
else:
    if not t.endswith('\n'):
        t += '\n'
    t2 = t + WORKLOG_ENTRY
    open(p, 'w', encoding='utf-8').write(t2)
    print('APPLIED worklog Task 146')

if fails:
    print('FAILS: ' + '; '.join(fails))
    sys.exit(1)
print('S306-DOCS-GREEN')
