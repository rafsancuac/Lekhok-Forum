#!/usr/bin/env python3
# s298-docs.py — session298 ডকুমেন্টেশন (PROJECT.md §২৯৮ + PLANS session298-নোট + worklog Task-138)
# চুক্তি: মার্কার-গার্ড-প্রথম (idempotent ×N — Task-137-র ডুপ্লিকেট-বুলেট-গোটচা পুনরাবৃত্তি-নিষিদ্ধ) + অ্যাঙ্কর-এককতা-FATAL
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

SEC298 = '''## §২৯৮ (session298 — cron 403679: sections + home-leadership তাৎক্ষণিক-ফিল্টার lsf298 — cej294-রানটাইম-ইনডেক্স-প্যাটার্ন) — s298-lsfilt ১০১/১০১ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`28efb8a` (session297-ep297, clean-tree, BEHIND=০); QA-বেসলাইন: login-303 + /admin/sections-200 (১৫ রো) + /admin/home-leadership-200 (৫৬ স্লট-কার্ড-লাইন) + agent-browser-ওয়ার্মআপ (fresh-daemon-গোটচা-প্রয়োগ) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন:** PLANS session297-প্রথম-প্রার্থী **home-leadership.ejs/sections.ejs-ফিল্টার** (কভারেজ-স্ক্যান: উভয়-সারফেসে তাৎক্ষণিক-ফিল্টার-শূন্য প্রমাণিত; cej294-রানটাইম-ইনডেক্স-প্যাটার্ন-পুনঃব্যবহার)।

**[Mandatory-ফিচার] lsf298 তাৎক়িণিক-ফিল্টার (দুই-সারফেস):** ① **sections.ejs + partials/sections-list.ejs** — স্ট্রিপ (ইনপুট + ক্লিয়ার + কাউন্ট-চিপ + kbd-hint + শূন্য-অবস্থা — form-বহির্ভূত, include-এর-আগে — re-render-ডুপ্লিকেশন-শূন্য: partial-এ স্ট্রিপ-অনুপস্থিত-প্রমাণ) + প্রতি-রো `data-lsf-row298="1" data-kw` (দ্বিভাষিক: #আইডি+#sort+লেবেল+title/subtitle/body/icon/extra — সাদা-স্পেস-নরমালাইজড (session270-গোটচা-প্রয়োগ) + দৃশ্যমান/লুকানো visible/hidden) + অ্যাড-ফর্ম `data-lsf-skip298` ② **home-leadership.ejs** — একই-স্ট্রিপ (forEach-এর-আগে) + বেস-স্লট/এক্সট্রা-কার্ড data-kw (slot.key+ট্যাগ+নাম+পদবি+কার্যবর্ষ+বাণী+অবস্থা) + addtile skip ③ **রানটাইম-ইনডেক্স (cej294-ধর্ম)** — প্রতি-apply-এ DOM-পুনঃস্ক্যান → sections-এ AJAX-re-render/আন্ডু-পরেও নির্ভুল; leadership-এ **লাইভ-টেক্সট-সমৃদ্ধি** (name/role/bani/tag/visLabel — ইন-প্লেস-এডিট-পরে data-kw-স্টেলনেস-প্রতিরোধ) ④ **MutationObserver (childList+characterData-শুধু — attribute-ওয়াচ-শূন্য → নিজের-hidden-লেখায়-লুপ-ঝুঁকি-শূন্য)** + countTxt change-guard (characterData-মিউটেশন-স্টর্ম-প্রতিরোধ) → re-render/ইন-প্লেস-এডিটে স্বয়ং-পুনঃ-apply ⑤ 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-stopPropagation + Enter-প্রথম-মিল-জাম্প (scroll+flash — ফোকাস-চুরি-শূন্য) + বাংলা-কাউন্ট-চিপ (bn298) + `__lsf298QA` হুক (surface/rows/matches/total/active/firstMatch/apply/clear/jumpFirst — **রো-শূন্যে-ও-সংজ্ঞায়িত** — পরিবার-চুক্তি)।

**[Mandatory-স্টাইল]:** উভয়-পেজে **session298-ব্লক** (হেক্স-শূন্য টোকেন-শুধু; cej294-brandgreen-পরিবার-মিরর) — স্ট্রিপ-হোভার-বর্ডার-ডিপেন + color-mix-ফোকাস-রিং (৪৫% ring ১৫% halo) + ক্লিয়ার-বাটন :active scale(.96) + flash-outline (jumpFirst — color-mix(--lf-brandgreen) ৫৫%) + **hidden-গার্ড !important** (`.sec-item[hidden]` / `.hl-slot[hidden]` — লেখক-স্টাইল-চাপা-পড়া-প্রতিরোধ) + 640px-সংকোচন (kbd-hint-বিলোপ) + reduced-motion-গার্ড।

**টেস্ট:** নতুন tests/s298-lsfilt-suite.sh **১০১/১০১ ×৩-ধারাবাহিক (SKIP=০)** — কাঠামো ×৪২ (স্ট্রিপ ×৫ ×২-সারফেস + হুক ×৯ + MO+change-guard + স্টাইল ×৭ ×২ — হেক্স-শূন্য + hidden-গার্ড + ক্রম-অ্যাসার্ট ×২ + partial-রো-kw ×৪ + no-reg ×৮) + SSR ×৮ (প্রত্যাশা-গণনা `data-lsf-row298="1" data-kw="` মার্কআপ-ইউনিক-জোড়; partial=১-স্ট্রিপ-শূন্যতা-প্রমাণ; maxId/slot-key-ডিটারমিনিস্টিক-প্রোব) + E2E ×২১ (sections: #maxId-একক-মিল + 'আইটেম'-সর্ব-মিল + শূন্য-অবস্থা + clear + Escape + 'f' + ফিল্ড-গার্ড (details.open-প্রি-ওপেন — session295-গোটচা) + **রানটাইম-রি-ইনডেক্স** (client-side data-kw বদল → apply → মিল — DB-লেখা-শূন্য) + jumpFirst-flash; leadership: স্লট-কী-একক-মিল + 'অতিরিক্ত'=extras-গণনা + **MO-স্বয়ং-পুনঃ-apply** (textContent-বদল → মিল=১ ম্যানুয়াল-apply-শূন্য — লাইভ-টেক্সট-প্রমাণ) + hScroll-শূন্য ×২ + স্ক্রিনশট ×৪) — **রিড-ওনলি-সুইট (POST-শূন্য/সিড-শূন্য — সর্ব-ইন্টারঅ্যাকশন client-side DOM)**; রিগ্রেশন: s294-cejump ৫৮/৫৮ + lf64-leadership-e2e ৩০/৩০ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s298-patch.py (idempotent ×৩, মার্কার-গার্ড-প্রথম, নেমস্পেস-গার্ড, অ্যাঙ্কর-এককতা-FATAL, পোস্ট-অ্যাসার্ট + হেক্স-শূন্য)।

**গোটচা ×৪ (PLANS session298):** ① **lsf-row298-মার্কার-অসংগতি** — 'lsf298' contiguous `data-lsf-row298`-এ অনুপস্থিত (lsf-row298) → per-file মার্কার ভিন্ন হতে-হবে (s298-রান-১-গোটচা) ② **Write-টুল-স্তরের [h-ক্ষয়** — সুইট-ফাইলের নিজের বাইটে `[hidden]`→`dden]` (টুল-ডিসপ্লে-আর্টিফ্যাক্ট এখন লেখন-পথেও) → পাইথন-বাইট-প্রতিস্থাপন-সংশোধন; od/python-যাচাই-বাধ্যতমূলক ③ **bn298-চিপ-বনাম-ASCII-প্রত্যাশা** — চিপ বাংলা-সংখ্যা (১৫) কিন্তু `${ROWS_SEC}` ASCII (15) → সুইটে bn()-কনভার্টার (tr বাইট-ভিত্তিক — multibyte-এ ভাঙে — pure-bash-চর-লুপ) ④ **live298-সাধারণ-ভেরিয়েবল-বিভাজন** — sections/leadership দুই-JS-এক-জেনারেটর — খালি live_expr-এ live298-অঘোষিত-রেফারেন্স → apply-ReferenceError (রান-১: M0/চিপ-০-০-স্থির) — ঘোষণা-বেসে-সরানো।

'''

v = rd(PROJ)
if '## §২৯৮' in v:
    print('PROJECT.md: §২৯৮-মার্কার-উপস্থিত (skip)')
else:
    A = '## §২৯৭ (session297 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC298 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §২৯৮ সন্নিবেশিত')

NOTE298 = '''## session298-নোট (cron 403679 — sections+home-leadership তাৎক্ষণিক-ফিল্টার lsf298)
- **lsf298-সারফেস-চুক্তি:** স্ট্রিপ = `#lsfStrip298` (ইনপুট/ক্লিয়ার/চিপ/শূন্য — form-বহির্ভূত) + রো-মার্ক = `data-lsf-row298="1" data-kw="…"` (দ্বিভাষিক-সাদা-স্পেস-নরমালাইজড) + skip = `data-lsf-skip298` (অ্যাড-ফর্ম/addtile) + হুক `__lsf298QA` (surface/rows/matches/total/active/firstMatch/apply/clear/jumpFirst — রো-শূন্যে-ও)। **রানটাইম-ইনডেক্স-প্রথা:** index apply-সময়ে DOM-থেকে — ভবিষ্যৎ-ফিল্টার-সারফেসেও re-render/ইন-প্লেস-এডিট-নিরাপত্তার-জন্য এ-ধর্ম রাখুন; leadership-লাইভ-টেক্সট-সমৃদ্ধি (data-role=name/role/bani/tag/visLabel) data-kw-স্টেলনেস-কভার করে। **MutationObserver-চুক্তি:** childList+characterData-শুধু (attribute-ওয়াচ করলে নিজের hidden/data-lsf-hit298-লেখায় লুপ); countTxt change-guard বাধ্যতমূলক (characterData-স্টর্ম)।
- **গোটচা-১ lsf-row298-মার্কার:** 'lsf298' contiguous string-টি `data-lsf-row298`-এ নেই (lsf-row298) → per-file idempotency-মার্কার নির্বাচনে সাবস্ট্রিং-যাচাই করুন (s298-patch.py — partial মার্কার = data-lsf-row298)।
- **গোটচা-২ Write-টুল-স্তরের [h-ক্ষয় (নতুন-শ্রেণি):** সুইট-লেখনীতে `[hidden]` → ফাইল-বাইটে `dden]` (পূর্বে শুধু-ডিসপ্লে-আর্টিফ্যাক্ট ধরা-পড়ত; এ-রাউন্ডে Write-স্তরেও প্রমাণিত) → লেখার-পরে python-এ `v.count('[hidden]')`-যাচাই; সংশোধন = python-বাইট-প্রতিস্থাপন (Edit-পুনঃ-লেখনী পুনঃ-ক্ষয়-ঝুঁকি); eval-SyntaxError-খালি-আউটপুট = এ-জাতীয় ভাঙা-সিলেক্টরের লক্ষণ।
- **গোটচা-৩ bn298-চিপ-বনাম-ASCII:** QA-হুক-চিপ bn298-বাংলা-সংখ্যা (১৫) — bash `${VAR}`-এক্সপানশন ASCII (15) → grep-অমিল; সুইটে pure-bash bn()-কনভার্টার (tr/sed-y multibyte-এ অবিশ্বস্ত)।
- **গোটচা-৪ শেয়ার্ড-জেনারেটর-ভেরিয়েবল:** এক-জেনারেটর-দুই-সারফেস JS-এ surface-নির্ভর ভেরিয়েবল (live298) খালি-শাখায়ও ঘোষণা-বেসে রাখুন — নইলে অঘোষিত-রেফারেন্স → listener-থ্রো → M0/চিপ-স্থির (রান-১-লক্ষণ: dispatch-পরবর্তী সব-অ্যাসার্ট-ফেল কিন্তু hook-জীবিত)।
- **পরের-এজেন্ট: session299 থেকে (worklog Task ID 139)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session298 + session297 + session296b পড়ুন; বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে; ep292+ep297+ep298-ত্রি-বার-বাতিল-প্রমাণ), পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, kiosk-শিট-ক্লিকে প্রথম-পাতা-রিডার-ডিপ-লিংক-প্রিফেচ, sections-ফিল্টার moderator-দিক (moderatorView BASE-ভিন্ন — lsf298-ইতিমধ্যে-সমর্থিত কিন্তু moderator-সুইট-যাচাই-বাকি), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session298-নোট' in v:
    print('PLANS.md: session298-নোট-উপস্থিত (skip)')
else:
    A = '## session297-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE298 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session298-নোট সন্নিবেশিত')

WENTRY = '''## Task ID 138 / session298 (cron 403679 — sections + home-leadership তাৎক্ষণিক-ফিল্টার lsf298)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`28efb8a` (session297-ep297) — স্থিতিশীল, বাগ-শূন্য; QA-বেসলাইন login-303 + sections-200 + home-leadership-200; PLANS session297-প্রথম-প্রার্থী-গ্রহণ (উভয়-অ্যাডমিন-সারফেসে তাৎক্ষণিক-ফিল্টার-শূন্য — কভারেজ-স্ক্যান-প্রমাণিত)।
- **পরিবর্তন:** sections.ejs + partials/sections-list.ejs + home-leadership.ejs — lsf298 তাৎক্ষণিক-ফিল্টার: স্ট্রিপ (ইনপুট/ক্লিয়ার/কাউন্ট-চিপ/kbd-hint/শূন্য-অবস্থা) + রো-data-kw (দ্বিভাষিক-নরমালাইজড — #id/sort/লেবেল/সামগ্রী/অবস্থা) + skip-মার্ক (অ্যাড-ফর্ম/addtile) + **রানটাইম-ইনডেক্স** (প্রতি-apply-এ DOM-পুনঃস্ক্যান — AJAX-re-render/আন্ডু-নিরাপদ) + leadership-লাইভ-টেক্সট-সমৃদ্ধি (ইন-প্লেস-এডিট-স্টেলনেস-প্রতিরোধ) + MutationObserver (childList+characterData-শুধু + countTxt change-guard — লুপ-ঝুঁকি-শূন্য) + 'f'-ফোকাস-গার্ড + Escape-stopProp + Enter-jumpFirst (scroll+flash) + __lsf298QA হুক (রো-শূন্যে-ও); [Mandatory-স্টাইল] session298-ব্লক হেক্স-শূন্য (brandgreen-মিরর — হোভার/ফোকাস-রিং/flash-outline/hidden-গার্ড !important/640px/reduced-motion)।
- **যাচাই:** tests/s298-lsfilt-suite.sh **১০১/১০১ ×৩** (কাঠামো ×৪২ + SSR ×৮ + E2E ×২১ — #maxId-একক-মিল + MO-স্বয়ং-পুনঃ-apply + রানটাইম-রি-ইনডেক্স + hScroll-শূন্য ×২ + স্ক্রিনশট ×৪ — **রিড-ওনলি: POST/সিড-শূন্য**); রিগ্রেশন s294-cejump ৫৮/৫৮ + lf64-leadership-e2e ৩০/৩০ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ s298-patch.py idempotent ×৩; PNG-চার্ন-শূন্য (download/ gitignored — tests/*.png-অস্পৃশ্ত)।
- **গোটচা ×৪:** lsf-row298-মার্কার-অসংগতি (contiguous-'lsf298'-নেই — per-file-মার্কার-সতর্কতা) · **Write-টুল-স্তরের [h-ক্ষয়** ([hidden]→dden] — পাইথন-বাইট-সংশোধন; লেখন-পরবর্তী বাইট-যাচাই-বাধ্যতমূলক) · bn298-চিপ-বনাম-ASCII-প্রত্যাশা (pure-bash bn() — tr-multibyte-অবিশ্বস্ত) · শেয়ার্ড-জেনারেটর-ভেরিয়েবল (live298-খালি-শাখায়ও-ঘোষণা) — বিস্তারিত PLANS session298।
- **পরের-এজেন্ট: session299 (Task ID 139)** — PLANS session298-নোট পড়ুন; push-আগে fetch+rebase; প্রস্তাব: multipart-ই২ই (press-ফর্ম), page-count-ব্যাজ (গেটেড), body+21px-overflow-তদন্ত, kiosk-রিডার-ডিপ-লিংক-প্রিফেচ, moderator-দিক-ফিল্টার-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''
v = rd(WLOG)
if '## Task ID 138 / session298' in v:
    print('worklog.md: Task-138-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-138-এন্ট্রি সংযোজিত')

print('DOCS-OK s298')
