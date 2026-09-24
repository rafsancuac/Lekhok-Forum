#!/usr/bin/env python3
# s300-docs.py — session300 ডকুমেন্টেশন (PROJECT.md §৩০০ + PLANS session300-নোট + worklog Task-140)
# চুক্তি: মার্কার-গার্ড-প্রথম (idempotent ×N — ডুপ্লিকেট-এন্ট্রি-গোটচা পুনরাবৃত্তি-নিষিদ্ধ) + অ্যাঙ্কর-এককতা-FATAL
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
PROJ = APP + '/PROJECT.md'
PLANS = APP + '/PLANS.md'
WLOG = APP + '/worklog.md'

def die(m):
    print('DOCS-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

SEC300 = '''## §৩০০ (session300 — cron 403679: press multipart-ব্রাউজার-ই২ই + moderator-দিক lsf298-যাচাই + আর্কাইভ-পিল প্রিফেচ ep300) — s300-multipart ৪৭/৪৭ ×৩ + s300-epref ৬৫/৬৫ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`ad981a8` (session299-eppref, clean-tree, BEHIND=০); QA-বেসলাইন: s299-eppref ৬৩/৬৩ গ্রিন (এজেন্ট-ব্রাউজার-পূর্ব-যাচাই) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন:** PLANS session299-প্রস্তাবের **প্রথম-দুই-প্রার্থী এক-রাউন্ডেই** — ① multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড) ② moderator-দিক sections-ফিল্টার-যাচাই; সাথে তৃতীয়-প্রস্তাব **epaper-আর্কাইভ-পিলে prefetch-কভারেজ-সম্প্রসারণ (ep300)** — session299-এর ইচ্ছা-গেট-ধর্মের সরাসরি-ধারাবাহিকতা।

**[Mandatory-ফিচার] ① s300-multipart সুইট (ব্রাউজার-পথে প্রকৃত-ফাইল-আপলোড):** agent-browser `upload`-কমান্ডে রিয়েল-PNG (বৈধ-বাইনারি ১×১) → input[name=image]-বাইন্ড (files.length=১ + নাম-মিল) → ফর্ম-সাবমিট → `?posted=১`-রিডাইরেক্ট + error=শূন্য → মার্কার-রো-রেন্ডার → কভার `/uploads/press/<ts>-s300-upload.png`-পথ + **HTTP-200:image/png + বাইট-অ-শূন্য** — s258-হেডার-চুক্তির (curl -F) সেই-অযাচাইকৃত-ব্রাউজার-পথটি পূর্ণ-প্রমাণিত; স্বয়ং-নিরাময়ী-ক্লিন (delete→ট্র্যাশ→bulk-purge — মার্কার-শূন্য নেট-শূন্য)। **② moderator-দিক lsf298-যাচাই + QA-হার্ডেনিং-ফিক্স:** /moderator/sections = admin/sections-ভিউ-উত্তরাধিকার (moderatorView:true + BASE:/moderator) — স্ট্রিপ/রো-মার্ক/হুক/BASE-অ্যাকশন-প্রমাণ + input(#id)-প্রোবে সাবস্ট্রিং-প্রত্যাশা-মিল + clear-পুনঃপ্রদর্শন; **রান-১-এ প্রকৃত-ফিক্স-প্রয়োজন ধরা-পড়ে:** lsf298-ইঞ্জিন boot-এ lsfApply298() কখনো-চালায়-না → `__lsf298QA.total()` প্রথম-apply-পর্যন্ত ০ (রো-১৫-থাকলেও) — **boot-apply-init ফিক্স** (init-apply; act=false → দৃশ্যমান-প্রভাব-শূন্য; s298 ১০১/১০১-পুনঃপ্রমাণ)। **③ ep300 প্রিফেচ-সম্প্রসারণ (epaper.ejs):** একক-ফানেল `epk300Prefetch300` (ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড + link[rel=prefetch][data-epk300]-ইনজেকশন) + ইচ্ছা-ট্রিগার — আর্কাইভ-পিল mouseenter/focusin (per-node — সার্ভার-রেন্ডারড) + তালিকা-আইটেম mouseover/focusin (ডেলিগেশন — renderList-পুনঃরেন্ডার-নিরাপদ) + নাম-মিল → date-DESC-প্রথম-প্রার্থী = সর্বশেষ-সংখ্যার ডিপ-লিংক `/epaper?file=<id>` + উষ্ণ-মিরর warmed-has-ভিত্তিক (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা — স্টেল-শূন্য) + বুট/apply-প্রিফেচ-নিষিদ্ধ (ইচ্ছা-গেট-ধর্ম) + `__epk300QA` হুক (prefetched/has/last/links/pills — papers-শূন্যে-ও — early-return-এর-আগে)।

**[Mandatory-স্টাইল]:** epaper.css **session300-ব্লক** (ক্যাসকেড-শেষে, হেক্স-শূন্য টোকেন-শুধু) — ① উষ্ণ-পিল অ্যাকসেন্ট-রিং (color-mix(--lf-brand-primary) ৪০% + brightness — **:not(.is-active)-সংঘর্ষ-বিচ্ছিন্ন**) ② উষ্ণ-আইটেম সফট-প্রান্ত (::before ৪৫%-mix — **:not(.is-on)-বিচ্ছিন্ন**) ③ পিল-ট্রানজিশন-সম্প্রসারণ (box-shadow/filter .22s — s294-সুপারসেট) ④ 640px-সংকোচন ⑤ reduced-motion-গার্ড; সাথে moderator-press.ejs **আপলোড-ক্ষেত্র প্রবেশ-পলিশ** (dashed-affordance + hover-টিন্ট + focus-visible/focus-within-রিং — brandgreen-পরিবার, হেক্স-শূন্য; বিদ্যমান-ফাইল-ইনপুট-স্টাইল-শূন্য → সংঘর্ষ-অসম্ভব)।

**টেস্ট:** নতুন tests/s300-multipart-suite.sh **৪৭/৪৭ ×৩-ধারাবাহিক** (কাঠামো ×৯ + E2E-আপলোড ×১২ + স্বয়ং-নিরাময়ী-ক্লিন ×৪ + moderator-sections ×১৫ + hScroll + স্ক্রিনশট ×২) + নতুন tests/s300-epref-suite.sh **৬৫/৬৫ ×৩-ধারাবাহিক** (কাঠামো ×২৪ + SSR ×৭ — মার্কআপ-স্তরে উষ্ণ-ক্লাস/prefetch-লিংক-অনুপস্থিত (স্ক্রিপ্ট-বর্জন) + E2E ×২৩ — বুট-শূন্য-প্রিফেচ + পিল-হোভার/ফোকাস + আইটেম-হোভার/ফোকাস + ডিডুপ + তারিখ-সুইচে না-উষ্ণ-আইডি-নির্মাণ + renderList-পুনঃরেন্ডারে উষ্ণ-পুনঃ-প্রতিষ্ঠা + hScroll-শূন্য + স্ক্রিনশট ×২); রিগ্রেশন: s298-lsfilt **১০১/১০১** (sections.ejs-স্পর্শকারী-ফিক্স-পরবর্তী-পুনঃপ্রমাণ) + s299-eppref ৬৩/৬৩ + s297-vpkiosk ৫১/৫১ + s296-epkwide ৫২/৫২ + s294-cejump ৫৮/৫৮ (পুনঃরান-প্রমাণ — ডেমন-ঝাঁকুনি-শ্রেণি) + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s300-patch.py (idempotent ×N — ৪-ফাইল মার্কার-স্কিপ + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL + ব্লক-স্কোপড-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-compile + pure-JS-syntax)।

**গোটচা ×৪ (PLANS session300):** ① **form-action runtime-CSRF-সাফিক্স** — ব্রাউজার-DOM-এ form action `?_csrf=…`-সাফিক্সপ্রাপ্ত (SSR-সোর্স নয়) → ক্লিক-সেলেক্টরে অ্যাট্রিবিউট-সাম্য-নিষিদ্ধ, প্রিফিক্স-ম্যাচ (`form[action^="/moderator/press"]`) ② **lsf298 apply()-আর্গুমেন্ট-শূন্য** — হুক-apply বর্তমান-input-মান প্রয়োগ করে (আর্গুমেন্ট নয়) → native-setter + input-event-পূর্বক; খালি-প্রশ্ন = সর্ব-মিল (matches==total — C0-প্রত্যাশা-ভুল) ③ **বুট-তারিখ-আইটেম = পিল-সর্বশেষ-সংখ্যা-মিল** — পূর্ব-উষ্ণ → ডিডুপে গণনা-স্থির (সঠিক-ইঞ্জিন-আচরণ, ভুল-প্রত্যাশা) → তারিখ-সুইচে না-উষ্ণ-আইডি ④ **EJS-টেমপ্লেট new Function-নিষিদ্ধ** — `<%= %>`-যুক্ত-স্ক্রিপ্ট plain-JS-নয় → ejs.compile + '<%'-শূন্য-স্ক্রিপ্টে-সীমাবদ্ধ syntax-যাচাই।

'''

v = rd(PROJ)
if '## §৩০০' in v:
    print('PROJECT.md: §৩০০-মার্কার-উপস্থিত (skip)')
else:
    A = '## §২৯৯ (session299 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC300 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §৩০০ সন্নিবেশিত')

NOTE300 = '''## session300-নোট (cron 403679 — press multipart-ই২ই + moderator-দিক lsf298-যাচাই + আর্কাইভ-পিল প্রিফেচ ep300)
- **multipart-ব্রাউজার-পাথ-চুক্তি (s258-হেডার-চুক্তির ব্রাউজার-অর্ধ):** agent-browser `upload <sel> <file>` → eval-এ files.length/নাম-যাচাই (files-বিষয়বস্তু-পাঠযোগ্য-নয়) → সাবমিট → ?posted=১ → কভার `/uploads/press/`-HTTP-200-ছবি; ফর্ম-action-এ runtime-CSRF-সাফিক্স (`?_csrf=…` — main.js-স্তরে) → সেলেক্টর **প্রিফিক্স-ম্যাচ-বাধ্যতমূলক**; রিয়েল-PNG = base64 ১×১ (/tmp — রিপো-বহির্ভূত); স্বয়ং-নিরাময়ী-ক্লিন delete→ট্র্যাশ→bulk-purge।
- **moderator-দিক sections-চুক্তি:** /moderator/sections = admin/sections-ভিউ-পুনঃব্যবহার (moderatorView:true, BASE:/moderator) — lsf298-মার্কআপ-উত্তরাধিকার-স্বয়ংক্রিয়; হুক-চুক্তি: `rows()`/`total()` (boot-সত্য — session300 boot-apply-init-ফিক্স-পরবর্তী) / `matches()` (count()-নামে-মেথড-নেই!) / apply-আর্গুমেন্ট-শূন্য (input-মান-প্রয়োগ) → native-setter + input-event; খালি-প্রশ্ন = সর্ব-মিল (matches==total); প্রোব = `#<id>` (data-kw-থেকে python-নির্যাস — বাংলা-শব্দ-শেল-উদ্ধৃতি-ঝুঁকি-শূন্য) + প্রত্যাশা = সাবস্ট্রিং-গণনা (id-প্রিফিক্স-ক্রস-মিল অন্তর্ভুক্ত — ইঞ্জিন-সেমান্টিক্স-মিরর)।
- **ep300-সারফেস-চুক্তি (ep299-ধর্ম-সম্প্রসারণ):** একক-ফানেল `epk300Prefetch300(url, reason)` + ট্রিগার — পিল mouseenter/focusin (per-node; সার্ভার-রেন্ডারড-স্ট্যাটিক) + আইটেম mouseover/focusin (**ডেলিগেশন — renderList-পুনঃরেন্ডার-নিরাপদ**) + নাম-মিল → date-DESC-প্রথম-প্রার্থী = সর্বশেষ-সংখ্যা + উষ্ণ-মিরর warmed-has-ভিত্তিক (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা) + বুট/apply-প্রিফেচ-নিষিদ্ধ + হুক `__epk300QA` (prefetched/has/last/links/pills — papers-শূন্যে-ও)। **গোটচা:** বুট-তারিখের শীর্ষ-আইটেম = পিলের সর্বশেষ-সংখ্যা-মিল → পূর্ব-উষ্ণ → আইটেম-ট্রিগার-যাচাইয়ে তারিখ-সুইচ-পূর্বক (না-উষ্ণ-আইডি নিশ্চিত)।
- **lsf298 boot-apply-init ফিক্স (QA-হার্ডেনিং — রান-১-এ ধরা-পড়া):** ইঞ্জিন boot-এ lsfApply298() চালাত-না → `total()` প্রথম-apply-পর্যন্ত ০ — হুক-চুক্তি "রো-শূন্যে-ও-সংজ্ঞায়িত"-এর সাথে total-বুট-সত্যতা-অসামঞ্জস্য; ফিক্স = init-apply (act=false → দৃশ্যমান-প্রভাব-শূন্য); s298 ১০১/১০১-পুনঃপ্রমাণ। শিক্ষা: **moderator-দিকের প্রতিটি উত্তরাধিকারী-সারফেসের নিজস্ব E2E-বাধ্যতমূলক** (মার্কআপ-উত্তরাধিকার ≠ আচরণ-প্রমাণ)।
- **গোটচা-EJS:** EJS-টেমপ্লেটের ইনলাইন-স্ক্রিপ্ট `new Function`-নিষিদ্ধ (`<%= %>`-মিশ্রিত) → ejs.compile + '<%'-শূন্য-স্ক্রিপ্টে-সীমাবদ্ধ syntax-যাচাই; Write-স্তরে h-bracket-ক্ষয়-ধারাবাহিকতা (s298/299) → python-বাইট-যাচাই-বাধ্যতমূলক।
- **পরের-এজেন্ট: session301 থেকে (worklog Task ID 141)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session300 + session299 + session298 পড়ুন; বাকি-প্রস্তাব: পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে page_count-কলাম-যোগ-হলে), moderator-resources/moderator-dashboard-সারফেস-ফিল্টার-প্যাক (re261/mdf263-প্যাটার্ন-মিরর — যদি-এখনো-অবাস্তব), ep300-প্রিফেচ-কভারেজ-আরও-সম্প্রসারণ (ক্যালেন্ডার-দিন-সেল), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session300-নোট' in v:
    print('PLANS.md: session300-নোট-উপস্থিত (skip)')
else:
    A = '## session299-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE300 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session300-নোট সন্নিবেশিত')

WENTRY = '''## Task ID 140 / session300 (cron 403679 — press multipart-ই২ই + moderator-দিক lsf298-যাচাই + ep300)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`ad981a8` (session299-eppref) — স্থিতিশীল, বাগ-শূন্য; QA-বেসলাইন s299 ৬৩/৬৩ (এজেন্ট-ব্রাউজার); PLANS session299-প্রস্তাবের প্রথম-দুই-প্রার্থী এক-রাউন্ডে গ্রহণ (multipart-ব্রাউজার-ই২ই + moderator-দিক sections-যাচাই) + তৃতীয়-প্রস্তাব epaper-আর্কাইভ-পিলে প্রিফেচ-সম্প্রসারণ (ep300)।
- **পরিবর্তন:** tests/s300-multipart-suite.sh (নতুন — ব্রাউজার-পথে রিয়েল-ফাইল-আপলোড ই২ই + স্বয়ং-নিরাময়ী-ক্লিন) + tests/s300-epref-suite.sh (নতুন — ep300-ইঞ্জিন কাঠামো/SSR/E2E) + views/user/epaper.ejs (ep300 একক-ফানেল + ট্রিগার ×৪ + উষ্ণ-মিরর + __epk300QA হুক) + public/assets/css/epaper.css (session300-ব্লক — উষ্ণ-পিল-রিং/উষ্ণ-আইটেম-প্রান্ত :not()-বিচ্ছিন্ন + 640px + reduced-motion, হেক্স-শূন্য) + views/user/moderator-press.ejs (আপলোড-ক্ষেত্র dashed-affordance + focus-within-রিং, হেক্স-শূন্য) + admin/views/admin/sections.ejs (**lsf298 boot-apply-init ফিক্স** — হুক-total বুট-সত্য; রান-১-এ moderator-দিকে ধরা-পড়া প্রকৃত-গ্যাপ) + scripts/s300-patch.py (idempotent ×N — ৪-ফাইল)।
- **যাচাই:** s300-multipart **৪৭/৪৭ ×৩** + s300-epref **৬৫/৬৫ ×৩**; রিগ্রেশন s298-lsfilt **১০১/১০১** (ফিক্স-পরবর্তী) + s299 ৬৩/৬৩ + s297 ৫১/৫১ + s296 ৫২/৫২ + s294 ৫৮/৫৮ (পুনঃরান) + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)।
- **গোটচা ×৪:** form-action runtime-CSRF-সাফিক্স (প্রিফিক্স-সেলেক্টর-বাধ্যতমূলক) · lsf298 apply()-আর্গুমেন্ট-শূন্য (input-event-পূর্বক; খালি-প্রশ্ন = সর্ব-মিল) · বুট-তারিখ-আইটেম = পিল-সর্বশেষ-সংখ্যা-মিল (তারিখ-সুইচ-পূর্বক) · EJS-টেমপ্লেট new Function-নিষিদ্ধ (ejs.compile + '<%'-শূন্য-সীমাবদ্ধ) — বিস্তারিত PLANS session300।
- **পরের-এজেন্ট: session301 (Task ID 141)** — PLANS session300-নোট পড়ুন; overflow-তদন্ত + page-count-ব্যাজ (গেটেড); push-আগে fetch+rebase; Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''
v = rd(WLOG)
if '## Task ID 140 / session300' in v:
    print('worklog.md: Task-140-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-140-এন্ট্রি সংযোজিত')

print('DOCS-OK s300')
