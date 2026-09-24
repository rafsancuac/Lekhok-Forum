#!/usr/bin/env python3
# s297-docs.py — session297 ডক ×৩ (idempotent — মার্কার-গার্ড-প্রথম)
# ① PROJECT.md: §২৯৭ এন্ট্রি (§২৯৬-খ-ব্লক-পূর্বে — newest-first)
# ② PLANS.md: session297-নোট (session296b-নোট-ব্লক-পূর্বে)
# ③ worklog.md (রিপো): Task ID 137 এন্ট্রি (ফাইল-শেষে append)
import io, sys, os

APP = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.dirname(APP))
PROJECT = 'PROJECT.md'
PLANS = 'PLANS.md'
WORKLOG = 'worklog.md'

S297_PROJECT = '''## §২৯৭ (session297 — cron 403679: ভিউপোর্ট-সচেতন কিয়স্ক অটো-স্লাইড ep297 + ফিল্ম/CTA প্রিমিয়াম-পলিশ) — s297-vpkiosk ৫১/৫১ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`08924af` (session296b-dcf296, clean-tree, BEHIND=০); প্রোড-স্পট lekhok-forum.vercel.app home-200 + epaper-200 + admin-daily-গেট-307 + ep296-মার্কার-লাইভ ×৩ (kiosk + hover-CTA + stat-row) + agent-browser-বুটে `__epk297QA`-অনুপস্থিতি-যাচাই (ep297-পূর্ব-সঠিক) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন (কভারেজ-স্ক্যান-প্রথা):** PLANS session296-তালিকা থেকে **kiosk-অটো-স্লাইডে ভিউপোর্ট-IntersectionObserver-পজ** (আসল-শূন্য-সারফেস — today.ejs-স্ক্যানে IntersectionObserver=০ প্রমাণিত) + **ফিল্ম-গ্রিড ৫-কলাম-বিকল্প**; page-count-ব্যাজ **আবার-বাতিল** (ep292-যাচাই-পুনঃপ্রয়োগ: page_count-কলাম-নেই — গেটেড)।

**[Mandatory-ফিচার] ep297 ভিউপোর্ট-সচেতন অটো-স্লাইড:** views/partials/home/today.ejs কিয়স্ক-ইঞ্জিন — ① **IntersectionObserver (threshold .12)** `today-epaper`-উপরে — অদৃশ্য-সেকশনে **টাইমার-সম্পূর্ণ-বন্ধ** (clearInterval — শুধু-গেট-নয়; টিক+DOM-লেখা+ফ্লিপ+চেইন-ইমেজ-লোড-সব-স্থগিত — CPU-সাশ্রয়) ② **visibilitychange** — লুকানো-ট্যাবে বন্ধ ③ **tick-গেট** `!paused && epk297InView && epk297TabVisible` (paused-পুরনো-পথের-সাথে-সহাবস্থান) ④ **পুনঃ-দৃশ্যমানে পুনঃ-সূচনা** (epk297Sync297 — একক-সেটল-ফানেল; startTimer-গার্ড-পুনঃব্যবহার) ⑤ **IO-অসমর্থিতে গ্রেসফুল-ডিগ্রেডেশন** (epk297InView=true-পূর্বস্থ + try/catch — আচরণ-অপরিবর্তিত) ⑥ **__epk297QA হুক** (inView/tabVisible/ioOn/timerOn/tickN/current/tick/sync — **papers-শূন্যে-ও-সংজ্ঞায়িত** — early-return-ক্রম-অ্যাসার্ট-সহ; পরিবার-চুক্তি) ⑦ no-regression ×১২ (wired-গার্ড + ৩.৫সে-লিটারাল + setImg296/applyPaper + __epk292QA + চেইন-shift + stale-error-গার্ড + mouseenter-পজ + stat-row + applyPaper(0)-বুট)।

**[Mandatory-স্টাইল]:** style.css **session297-ব্লক** (ক্যাসকেড-শেষে, হেক্স-শূন্য টোকেন-শুধু) — ① **ফিল্ম-গ্রিড ৫-কলাম @≥1440px** (s296-র 1280×৪-কলাম-চুক্তি **অক্ষুণ্ণ** — 1440-চৌকাঠ-নির্বাচনের-কারণ: epkwide-সুইট 1280-ভিউপোর্টে cols:4-অ্যাসার্ট করে) ② ফিল্ম-বাটন হোভার-লিফট (translateY -১px + rgba-ছায়া — ফাইল-প্রচলিত-রীতি) + :active scale(.98) ③ **নির্বাচিত-বাটন অ্যাকসেন্ট-রিং** (color-mix + var(--epkAcc291, var(--lf-brand-primary)) — per-paper-ভেরিয়েবল-উত্তরাধিকার) ④ মিনি-থাম্ব হোভার-পলিশ (rotate -১.৪° + scale ১.০৫; transition-সুপারসেট — পূর্বস্থ-box-shadow-transition-হারানো-নেই) ⑤ CTA হোভার-লিফট + ছায়া ⑥ reduced-motion-গার্ড (transition:none + transform:none)।

**টেস্ট:** নতুন tests/s297-vpkiosk-suite.sh **৫১/৫১ ×৩-ধারাবাহিক (SKIP=১-মোশন-প্রোব-বহির্ভূত)** (কাঠামো ×২৭ — ইঞ্জিন-মার্কার ×৯ + হুক-ক্রম-অ্যাসার্ট + no-reg ×৫ + CSS ×৯ + EJS-compile; SSR ×৫ — স্ক্রিপ্ট-মার্কার + **ফিল্ম-বাটন=papers-JSON-গণনা** (session292-চুক্তি — DB-অন্য-সারি-উপস্থিতিতেও নির্ধারক); E2E ×১৭ — হুক/ioOn + মোশন-প্রোব + **দৃশ্যমানে inView+টাইমার-চালু** + **অটো-অ্যাডভান্স** (৩.৫সে-টিক — current-অগ্রগতি) + tickN-বৃদ্ধি + **অদৃশ্যে inView=false + টাইমার-বন্ধ** + **পুনঃ-দৃশ্যমানে পুনঃ-সূচনা** + ম্যানুয়াল-tick + ৫-কলাম@1440 + ৪-কলাম@1280 (s296-চুক্তি) + 390-hScroll-শূন্য + স্ক্রিনশট ×২) — সিড-নেট-শূন্য (**প্রি-ক্লিন→সিড** — পুরনো-মার্কার-অবশেষ-বিলোপ); **পূর্ণ-রিগ্রেশন s260-s297 ৪০-সুইট সব-গ্রিন** (scripts/s297-regression.sh — চাঙ্ক ১+৬+৬+৬+৬+৬+৩; রানার-ওয়েজ-প্রোটোকল-প্রয়োগ: ৫৯০সে-টুল-ক্যাপ-কিল → daemon-pkill-রিসেট → ক্ষণস্থায়ী-ফেল-তাৎক্ষণিক-পুনঃরান) + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s297-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, নেমস্পেস-গার্ড ×৪, অ্যাঙ্কর-এককতা-FATAL, হুক-ক্রম-পোস্ট-অ্যাসার্ট + CSS-হেক্স-শূন্য + no-reg ×১২); **রক্ষণাবেক্ষণ:** s296-chipfacet-suite.sh-এ open-রিট্রাই+url-যাচাই + opaqueredirect-0-গ্রহণ + কুকি-সেটল-পোল (fresh-daemon-wedge + fetch-স্পেক-গোটচা — **৬২/৬২ ×২** পুনঃ-প্রমাণিত)।

**গোটচা ×৫ (PLANS session297):** ① fresh-daemon-first-open-wedge ② opaqueredirect-status-0 (fetch redirect:manual — Chrome-স্পেক) ③ fetch-লগইন-কুকি-সেটল-রেস ④ ৫-কলাম-চৌকাঠ-নির্বাচন (পূর্ব-সুইট-ভিউপোর্ট-অ্যাসার্ট-সংঘর্ষ-বর্জন) ⑤ প্রি-ক্লিন→সিড-নির্ধারকতা — বিস্তারিত PLANS।

'''

S297_PLANS = '''## session297-নোট (cron 403679 — ভিউপোর্ট-সচেতন কিয়স্ক ep297 + ফিল্ম/CTA পলিশ + chipfacet-রক্ষণাবেক্ষণ)
- **fresh-daemon-first-open-wedge (নতুন — ডেমন-শ্রেণি):** agent-browser-ডেমন pkill-রিসেটের-পরে **প্রথম open** নীরবে-আটকাতে-পারে (পরের-সব-get-url/eval ৩০সে+ ঝুলে-যায় — probe1/probe2-দুটিই timeout) → রিসেট-পরে **হালকা-পেজ-ওয়ার্মআপ** (/health) বা **open-রিট্রাই+url-যাচাই-লুপ** (s296-epkwide-রীতি) বাধ্যতমূলক; wedge-প্রোটোকল-যুগে (টুল-টাইমআউট-কিল) daemon-পুনঃসূচনা নিয়মিত-ঘটনা → বেয়ার-open-নির্ভর-পুরনো-সুইট এখন-ঝুঁকিপূর্ণ (chipfacet-লগইন-ধরা-পড়েছে)।
- **opaqueredirect-status-0 (নতুন — fetch-স্পেক-শ্রেণি):** `fetch(x,{redirect:"manual"})` **সর্বদা status-0** রিটার্ন করে রিডাইরেক্টে (opaqueredirect ফিল্টার্ড-রেসপন্স — same-origin-হলেও; Chrome-প্রমাণিত) → ৩০২-প্রত্যাশা-করা-eval-অ্যাসার্ট কখনো-পাস-হয়-না **fresh-কুকি-জারে**; chipfacet-এর পূর্ব-পাস = **ALR-শাখা (warm-daemon-পূর্ব-লগইনড-কুকি)** — সুইট-লেখার-সময়-অদৃশ্য-পরিবেশ-নির্ভরতা → status-0 = "রিডাইরেক্ট-ঘটেছে"-প্রমাণ হিসেবে-গ্রহণ + ALR-শাখা-রক্ষা (তিন-শাখা: 30[23] / 0 / ALR)।
- **fetch-লগইন-কুকি-সেটল-রেস (নতুন — রেস-শ্রেণি):** fetch-লগইনের promise-রিজলভ **Set-Cookie-প্রক্রিয়াকরণের-আগে-হতে-পারে** (opaqueredirect-ফিল্টার-পথ) → সঙ্গে-সঙ্গে-open = অ-লগইনড-বাউন্স (/admin/daily → /admin) → **authed-probe-সেটল-পোল** (`fetch("/admin/daily",{redirect:"manual"})` → authed=200 / unauth=0 — 200-না-হওয়া-পর্যন্ত) বাধ্যতমূলক; লক্ষণীয়: বাউন্স-পরবর্তী-দ্বিতীয়-open-সফল (কুকি-তখন-সেটল) → শুধু-প্রথম-open-ফেল — রেস-নির্ণায়ক-লক্ষণ।
- **৫-কলাম-চৌকাঠ-নির্বাচন (পরিকল্পনা-শ্রেণি):** নতুন-রেসপন্সিভ-ব্রেকপয়েন্ট = **পূর্ব-সুইটের ভিউপোর্ট-অ্যাসার্ট-স্ক্যান-পরেই** — s296-epkwide 1280×900-এ `cols:4`-অ্যাসার্ট করে → ৫-কলাম **1440px-চৌকাঠে** (1280-অক্ষুণ্ণ); CSS-লিটারাল-অ্যাসার্টও (`repeat(4, minmax(0, 1fr))`) ফাইলে-অক্ষত-থাকে (নতুন-ব্লক ক্যাসকেড-শেষে — override-ক্রম-সুইট-প্রমাণিত)।
- **ep297-সারফেস-চুক্তি:** হুক **__epk297QA** (inView/tabVisible/ioOn/timerOn/tickN/current/tick/sync — papers-শূন্যে-ও-সংজ্ঞায়িত, early-return-এর-আগে — ক্রম-অ্যাসার্ট-সুইটে)। পজ = **IO(threshold .12) + visibilitychange দু-স্তর** — অদৃশ্যে **clearInterval-সম্পূর্ণ** (গেটেড-টিক-নয়); পুনঃ-সূচনা = **epk297Sync297-একক-ফানেল** (startTimer-গার্ড-পুনঃব্যবহার); IO-অসমর্থিতে আচরণ-অপরিবর্তিত (inView=true-পূর্বস্থ + catch)। ভবিষ্যৎ-অটো-স্লাইড-সারফেস এ-চুক্তিই-অনুসরণ করবে।
- **প্রি-ক্লিন→সিড-নির্ধারকতা (পুনঃপ্রমাণিত):** হোম-সুইটে seed-পূর্বে **নিজ-পরিবার-প্রি-ক্লিন** (s296+s292-clean) → অবশেষ-সারি-বিলোপ; তবু DB-র **non-মার্কার-বাস্তব-সারি** থাকতে-পারে → ফিল্ম-বাটন-সংখ্যা-অ্যাসার্ট **রেন্ডার্ড papers-JSON-গণনা-থেকে** (session292-চুক্তির-পুনঃপ্রয়োগ — স্থির-সংখ্যা-নয়)।
- **পরের-এজেন্ট: session298 থেকে (worklog Task ID 138)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session297 + session296b + session296 + session295 পড়ুন; বাকি-প্রস্তাব: **home-leadership.ejs/sections.ejs-ফিল্টার** (cej294-রানটাইম-ইনডেক্স-প্যাটার্ন — sections-এ sec-item-তালিকা, home-leadership-এ slot-কার্ড), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে; ep292+ep297-দুইবার-বাতিল-প্রমাণ), পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, kiosk-শিট-ক্লিকে প্রথম-পাতা-রিডার-ডিপ-লিংক-প্রিফেচ, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''

def insert_before(path, anchor, block, marker, append_tail=False):
    src = io.open(path, 'r', encoding='utf-8').read()
    if marker in src:
        print('skip:', path, '(মার্কার-উপস্থিত)')
        return
    if append_tail:
        src = src.rstrip('\n') + '\n\n' + block
        io.open(path, 'w', encoding='utf-8').write(src)
        print('ok:', path, '(append)')
        return
    if src.count(anchor) != 1:
        print('FATAL:', path, 'অ্যাঙ্কর-এককতা-ভঙ্গ count=', src.count(anchor))
        sys.exit(1)
    src = src.replace(anchor, block + anchor, 1)
    io.open(path, 'w', encoding='utf-8').write(src)
    print('ok:', path, '(insert-before)')


insert_before(PROJECT, '## §২৯৬-খ (session296b — cron 403679: ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296', S297_PROJECT, '## §২৯৭ (session297')
insert_before(PLANS, '## session296b-নোট (cron 403679 — ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296', S297_PLANS, '## session297-নোট')

S297_WORKLOG = '''## Task ID 137 / session297 (cron 403679 — ভিউপোর্ট-সচেতন কিয়স্ক অটো-স্লাইড ep297 + ফিল্ম/CTA প্রিমিয়াম-পলিশ)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`08924af` (session296b-dcf296) — স্থিতিশীল; প্রোড-স্পট home/epaper-200 + admin-গেট-307 + ep296-মার্কার-লাইভ ×৩; PLANS session296-প্রস্তাব-গ্রহণ (কভারেজ-স্ক্যান: IntersectionObserver=০ — আসল-শূন্য-সারফেস); page-count-ব্যাজ পুনঃ-বাতিল (গেটেড — কলাম-নেই)।
- **পরিবর্তন:** today.ejs কিয়স্ক-ইঞ্জিন — IO(threshold .12) + visibilitychange দু-স্তরে অদৃশ্য/লুকানো-ট্যাবে **টাইমার-সম্পূর্ণ-বন্ধ** (CPU-সাশ্রয়) + পুনঃ-দৃশ্যমানে epk297Sync297-একক-ফানেল-পুনঃ-সূচনা + tick-গেট (inView+tabVisible+!paused) + IO-অসমর্থিতে গ্রেসফুল-ডিগ্রেডেশন + __epk297QA হুক ×৮ (papers-শূন্যে-ও-সংজ্ঞায়িত); style.css session297-ব্লক হেক্স-শূন্য — ফিল্ম-গ্রিড **৫-কলাম@1440** (s296-র 1280-চুক্তি অক্ষুণ্ণ) + ফিল্ম-বাটন হোভার-লিফট/:active + নির্বাচিত-অ্যাকসেন্ট-রিং (--epkAcc291) + মিনি-থাম্ব হোভার-পলিশ + CTA-লিফট + reduced-motion-গার্ড; no-reg ×১২। **রক্ষণাবেক্ষণ:** s296-chipfacet-suite — open-রিট্রাই+url-যাচাই + opaqueredirect-0-গ্রহণ + কুকি-সেটল-পোল (fresh-daemon-wedge + fetch-স্পেক — ৬২/৬২ ×২ পুনঃ-প্রমাণিত)।
- **যাচাই:** tests/s297-vpkiosk-suite.sh **৫১/৫১ ×৩** (কাঠামো ×২৭ + SSR ×৫ — papers-JSON-গণনা + E2E ×১৭ — inView-পজ→টাইমার-বন্ধ + রিজিউম + অটো-অ্যাডভান্স + tickN + ৫-কলাম@1440 + ৪-কলাম@1280 + hScroll-শূন্য + স্ক্রিনশট ×২); **পূর্ণ-রিগ্রেশন s260-s297 ৪০-সুইট সব-গ্রিন** (s297-regression.sh; ৫৯০সে-টুল-ক্যাপ-কিল ×২ → daemon-pkill-রিসেট → s260-৯মিনিট-ঝুলন্ত→১৪সে-সবুজ — কোড-অপরিবর্তিত) + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ s297-patch.py idempotent ×২।
- **গোটচা ×৫:** fresh-daemon-first-open-wedge (রিসেট-পরে প্রথম-open নীরব-আটকে — ওয়ার্মআপ/রিট্রাই) · opaqueredirect-status-0 (fetch redirect:manual → status-0 — ৩০২-প্রত্যাশা-ভাঙে; ALR-warm-শাখার-অদৃশ্য-নির্ভরতা-উন্মোচিত) · fetch-লগইন-কুকি-সেটল-রেস (authed-probe-পোল) · ৫-কলাম-চৌকাঠ=1440 (পূর্ব-সুইট-ভিউপোর্ট-অ্যাসার্ট-সংঘর্ষ-বর্জন) · প্রি-ক্লিন→সিড + papers-JSON-গণনা-নির্ধারকতা — বিস্তারিত PLANS session297।
- **পরের-এজেন্ট: session298 (Task ID 138)** — PLANS session297-নোট পড়ুন; push-আগে fetch+rebase; প্রস্তাব: home-leadership/sections-ফিল্টার (cej294-প্যাটার্ন), multipart-ই২ই (press-ফর্ম), page-count-ব্যাজ (গেটেড), body+21px-overflow-তদন্ত, kiosk-রিডার-ডিপ-লিংক-প্রিফেচ, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''

insert_before(WORKLOG, '', S297_WORKLOG, 'Task ID 137 / session297', append_tail=True)
print('══ s297-docs: সম্পন্ন ══')
