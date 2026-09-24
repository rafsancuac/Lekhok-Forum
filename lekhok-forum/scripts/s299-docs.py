#!/usr/bin/env python3
# s299-docs.py — session299 ডকুমেন্টেশন (PROJECT.md §২৯৯ + PLANS session299-নোট + worklog Task-139)
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

SEC299 = '''## §২৯৯ (session299 — cron 403679: ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep299) — s299-eppref ৬৩/৬৩ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`05c8dbc` (session298-lsf298, clean-tree, BEHIND=০); QA-বেসলাইন: guard:design + audit:views (১২২ ejs) গ্রিন + s297-vpkiosk ৫১/৫১ (এজেন্ট-ব্রাউজার-পূর্ব-যাচাই) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন:** PLANS session298-প্রার্থী-তালিকা থেকে **kiosk-শিট ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ** (page-count-ব্যাজ গেটেড-বাতিল-প্রথা ×৩; multipart-ই২ই ও moderator-যাচাই পরবর্তী-রাউন্ডের-জন্য স্থগিত — কারণসহ PLANS session299-নোটে)।

**[Mandatory-ফিচার] ep299 প্রিফেচ-ইঞ্জিন (today.ejs):** ① **একক-ফানেল `epk299Prefetch299(url, reason)`** — ডিডুপ-ম্যাপ (epk299Warmed) + অফলাইন-গার্ড (navigator.onLine) + **saveData-গার্ড** (connection.saveData — মিটার্ড-সংযোগে বন্ধ) + `link[rel=prefetch][as=document][data-epk299]`-হেড-ইনজেকশন (ব্রাউজার-লো-প্রায়োরিটি-ক্যাশ-ওয়ার্ম — কোনো-জোর-করা-ফেচ নয়) ② **ইচ্ছা-ট্রিগার ×৪** — নির্বাচন (ফিল্ম-বাটন-ক্লিক — মোবাইল-পথ) + হোভার (front-sheet mouseenter) + ফোকাস (focusin) + CTA-হোভার — সব-একক-ফানেলে ③ **বুট-প্রিফেচ-নিষিদ্ধ** — applyPaper-নিজে-কখনো প্রিফেচ-করে-না (ইচ্ছা-গেট — ব্যান্ডউইথ-সাশ্রয়; অটো-স্লাইডেও নয়) ④ **উষ্ণ-সংকেত-মিরর** — applyPaper-এ warmed-হিসেবে-সামঞ্জস্য (epk299-warm-ক্লাস যোগ/বিলোপ — স্টেল-ক্লাস-শূন্য) ⑤ `__epk299QA` হুক (prefetched/has/last/links — **papers-শূন্যে-ও-সংজ্ঞায়িত** — early-return-এর-আগে — পরিবার-চুক্তি)।

**[Mandatory-স্টাইল]:** style.css **session299-ব্লক** (ক্যাসকেড-শেষে, হেক্স-শূন্য টোকেন-শুধু) — ① উষ্ণ-হোভার-বাটন অ্যাকসেন্ট-রিং (box-shadow color-mix(--epkAcc291) ৫৫% + brightness ১.০৬ — transform-অস্পৃশ্য) ② উষ্ণ-শিট-প্রান্ত অ্যাকসেন্ট-ফেড (s291-সলিড-সুপারসেট — গ্র্যাডিয়েন্ট) ③ ফিল্ম-বাটন/হোভার-বাটন ট্রানজিশন-পলিশ ④ 640px-সংকোচন (টাচে উষ্ণ-সংকেত-শান্ত) ⑤ reduced-motion-গার্ড।

**টেস্ট:** নতুন tests/s299-eppref-suite.sh **৬৩/৬৩ ×৩-ধারাবাহিক (SKIP=১)** — কাঠামো ×২৯ (হুক/ফানেল/গার্ড/ইনজেকশন/ট্রিগার ×৪/মিরর + হুক-ক্রম + স্টাইল ×৬ + হেক্স-শূন্য + no-reg ×৭ + EJS-compile) + SSR ×৬ (হুক/ফানেল/kiosk-DOM + **মার্কআপ-স্তরে উষ্ণ-ক্লাস/prefetch-লিংক-অনুপস্থিত** — ইনলাইন-স্ক্রিপ্ট-বর্জিত যাচাই + ফিল্ম-বাটন=papers-JSON-মিল) + E2E ×২২ (বুট-শূন্য-প্রিফেচ + বুট-কোল্ড + hover→prefetch/has/কারণ/উষ্ণ/লিংক + ডিডুপ ×২ (পুনঃ-হোভার + CTA-একই-URL) + select→aria-selected/কারণ + tick→অপ্রিফেচডে-কোল্ড+শূন্য-বৃদ্ধি + পুনঃ-hover→নতুন-প্রিফেচ+উষ্ণ-পুনঃ-প্রতিষ্ঠা + 390-hScroll-শূন্য + স্ক্রিনশট ×২) — **ইঞ্জিন-ফ্রিজ-প্রথা** (section-mouseenter → paused=true — অটো-স্লাইড-রেস-শূন্য নির্ধারকতা) + মার্কার-ক্লিন নেট-শূন্য; রিগ্রেশন: s292-filmthumb ৪৬/৪৬ + s296-epkwide ৫২/৫২ + s296-chipfacet ৬২/৬২ + s297-vpkiosk ৫১/৫১ + s294-cejump ৫৮/৫৮ (পুনঃরান-প্রমাণ — প্রথম-রানের ১-ফেল ডেমন-ঝাঁকুনি-শ্রেণি) + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s299-patch.py (idempotent ×৩ — per-file মার্কার-স্কিপ + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-compile)।

**গোটচা ×৩ (PLANS session299):** ① **SSR-ইনলাইন-স্ক্রিপ্ট-দূষণ** — ইঞ্জিন-স্ক্রিপ্ট-নিজেই SSR-HTML-এ থাকায় স্ট্রিপ-লেভেল 'epk299-warm'/rel="prefetch"-গ্রেপ মিথ্যা-ফেল → মার্কআপ-যাচাই = স্ক্রিপ্ট-বর্জন-রেজেক্স-পূর্বক (রান-১: ২-ফেল) ② **grep -F-এ ব্যাকস্ল্যাশ-এস্কেপ-নিষিদ্ধ** — containsF-প্যাটার্নে \\[ লিখলে -F-আক্ষরিক-ব্যাকস্ল্যাশ-মিল-ব্যর্থ ③ **hbracket-ক্ষয়-পুনঃ-প্রমাণিত** — Write-স্তরে h-bracket-সিকোয়েন্স-ক্ষয় (s298-গোটচা-২-পুনঃপ্রমাণ) → লেখনী-বস্তায় h-bracket-আক্ষরিক-এড়িয়ে + python-বাইট-যাচাই।

'''

v = rd(PROJ)
if '## §২৯৯' in v:
    print('PROJECT.md: §২৯৯-মার্কার-উপস্থিত (skip)')
else:
    A = '## §২৯৮ (session298 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC299 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §২৯৯ সন্নিবেশিত')

NOTE299 = '''## session299-নোট (cron 403679 — ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep299)
- **ep299-সারফেস-চুক্তি:** একক-ফানেল `epk299Prefetch299(url, reason)` (ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড + link[rel=prefetch][data-epk299]-ইনজেকশন) + ইচ্ছা-ট্রিগার ×৪ (select=ফিল্ম-ক্লিক / hover=front-mouseenter / focus=focusin / cta) + **applyPaper-প্রিফেচ-নিষিদ্ধ** (বুট/অটো-স্লাইডে প্রিফেচ-শূন্য — ইচ্ছা-গেট-ধর্ম; ভবিষ্যৎ-প্রিফেচ-সারফেস এ-ধর্ম রাখবে) + উষ্ণ-মিরর (applyPaper-এ epk299-warm যোগ/বিলোপ) + হুক `__epk299QA` (prefetched/has/last/links — papers-শূন্যে-ও, early-return-এর-আগে)।
- **গোটচা-১ SSR-ইনলাইন-স্ক্রিপ্ট-দূষণ:** আংশিক-ভিউয়ের ইনলাইন-ইঞ্জিন-স্ক্রিপ্ট SSR-HTML-এ-ই রেন্ডার-হয় → পূর্ণ-পৃষ্ঠা-গ্রেপে স্ক্রিপ্ট-লিটারাল ('epk299-warm', rel="prefetch") মিথ্যা-মিল → "SSR-মার্কআপ-শূন্যতা"-যাচাই **স্ক্রিপ্ট-বর্জন-রেজেক্স পূর্বক** (`re.sub(r'<script.*?</script>','',...,flags=re.S)`) — HTML-grep-ওভারকাউন্ট-গোটচার (session293) নতুন-ভ্যারিয়েন্ট।
- **গোটচা-২ grep -F-এস্কেপ:** containsF (grep -qF) আক্ষরিক-স্ট্রিং — প্যাটার্নে \\[ লিখলে ব্যাকস্ল্যাশ-সহ-মিল-খোঁজে → ব্যর্থ; ব্র্যাকেট-যুক্ত-সেলেক্টর-অ্যাসার্টে ব্যাকস্ল্যাশ-শূন্য-আক্ষরিক লিখুন।
- **গোটচা-৩ hbracket-ক্ষয়-পুনঃ-প্রমাণ (s298-গোটচা-২-ধারাবাহিকতা):** সুইট/প্যাচ-লেখনীতে h-bracket-সিকোয়েন্স Write-স্তরে-ই ক্ষয় → লেখনী-বস্তায় আক্ষরিক-সিকোয়েন্স-এড়িয়ে (বিকল্প-শব্দ) + লেখন-পরবর্তী python-বাইট-যাচাই; সংশোধন python-বাইট-প্রতিস্থাপনে।
- **প্রস্তাব-পুনঃস্কোপিং (session299 — কারণসহ):** page-count-ব্যাজ **আবার-বাতিল** (গেটেড ×৩-পূর্ব-প্রমাণ — page_count-কলাম-এখনো-অনুপস্থিত); multipart-ব্রাউজার-পাথ-ই২ই ও moderator-দিক lsf298-যাচাই **পরবর্তী-রাউন্ডের-জন্য স্থগিত** (এ-রাউন্ডের সময়-বাজেট প্রিফেচ-ইঞ্জিন+সুইটে; কোনো-প্রযুক্তিগত-বাধা-নেই) — পরের-এজেন্টের **প্রথম-দুই-প্রার্থী**।
- **পরের-এজেন্ট: session300 থেকে (worklog Task ID 140)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session299 + session298 + session297 পড়ুন; বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি; **প্রথম-প্রার্থী**), moderator-দিক sections-ফিল্টার-যাচাই (**দ্বিতীয়**), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, kiosk-শিট-রিডার-ডিপ-লিংকে **prefetch-কভারেজ-সম্প্রসারণ** (epaper-আর্কাইভ-পিলে), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session299-নোট' in v:
    print('PLANS.md: session299-নোট-উপস্থিত (skip)')
else:
    A = '## session298-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE299 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session299-নোট সন্নিবেশিত')

WENTRY = '''## Task ID 139 / session299 (cron 403679 — ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep299)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`05c8dbc` (session298-lsf298) — স্থিতিশীল, বাগ-শূন্য; QA-বেসলাইন guard:design + audit:views + s297-vpkiosk ৫১/৫১ (এজেন্ট-ব্রাউজার); PLANS session298-প্রার্থী-তালিকা থেকে kiosk-রিডার-ডিপ-লিংক-প্রিফেচ-গ্রহণ (page-count-ব্যাজ গেটেড ×৩ — আবার-বাতিল; multipart/moderator-যাচাই সময়-বাজেটে স্থগিত — কারণসহ PLANS session299)।
- **পরিবর্তন:** views/partials/home/today.ejs + public/assets/css/style.css — ep299 প্রিফেচ-ইঞ্জিন: একক-ফানেল epk299Prefetch299 (ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড + link[rel=prefetch][data-epk299]-হেড-ইনজেকশন) + ইচ্ছা-ট্রিগার ×৪ (select/hover/focus/cta) + applyPaper-প্রিফেচ-নিষিদ্ধ (বুট/অটো-স্লাইডে শূন্য — ব্যান্ডউইথ-ধর্ম) + উষ্ণ-সংকেত-মিরর (epk299-warm যোগ/বিলোপ — স্টেল-শূন্য) + __epk299QA হুক (papers-শূন্যে-ও); [Mandatory-স্টাইল] session299-ব্লক হেক্স-শূন্য (উষ্ণ-হোভার-বাটন color-mix-অ্যাকসেন্ট-রিং + উষ্ণ-শিট-প্রান্ত-ফেড + 640px-সংকোচন + reduced-motion)।
- **যাচাই:** tests/s299-eppref-suite.sh **৬৩/৬৩ ×৩** (কাঠামো ×২৯ + SSR ×৬ — মার্কআপ-স্তরে উষ্ণ-ক্লাস/prefetch-লিংক-অনুপস্থিত (স্ক্রিপ্ট-বর্জন) + E2E ×২২ — বুট-শূন্য-প্রিফেচ + hover/select/cta-কারণ + ডিডুপ ×২ + tick→কোল্ড+শূন্য-বৃদ্ধি + পুনঃ-hover→প্রিফেচ + hScroll-শূন্য + স্ক্রিনশট ×২ — ইঞ্জিন-ফ্রিজ-প্রথা + কিল→সিড→বুট→ক্লিন নেট-শূন্য); রিগ্রেশন s292-filmthumb ৪৬/৪৬ + s296-epkwide ৫২/৫২ + s296-chipfacet ৬২/৬২ + s297-vpkiosk ৫১/৫১ + s294-cejump ৫৮/৫৮ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ s299-patch.py idempotent ×৩ (per-file মার্কার + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL)।
- **গোটচা ×৩:** SSR-ইনলাইন-স্ক্রিপ্ট-দূষণ (স্ক্রিপ্ট-লিটারাল-মিথ্যা-মিল — স্ক্রিপ্ট-বর্জন-রেজেক্স-পূর্বক মার্কআপ-যাচাই) · grep -F-এ ব্যাকস্ল্যাশ-এস্কেপ-নিষিদ্ধ (আক্ষরিক-মিল) · hbracket-ক্ষয়-পুনঃ-প্রমাণ (লেখনী-বস্তা-এড়াও + python-বাইট-যাচাই) — বিস্তারিত PLANS session299।
- **পরের-এজেন্ট: session300 (Task ID 140)** — PLANS session299-নোট পড়ুন; প্রথম-প্রার্থী multipart-ই২ই (press-ফর্ম), দ্বিতীয় moderator-দিক sections-ফিল্টার-যাচাই; push-আগে fetch+rebase; Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''
v = rd(WLOG)
if '## Task ID 139 / session299' in v:
    print('worklog.md: Task-139-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-139-এন্ট্রি সংযোজিত')

print('DOCS-OK s299')
