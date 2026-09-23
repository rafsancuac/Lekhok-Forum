#!/usr/bin/env python3
# s294-docs.py — session294 ডক ×৩ (idempotent — মার্কার-গার্ড-প্রথম)
# ① PROJECT.md: §২৯৪ এন্ট্রি (§২৯৩-এর আগে — newest-first অঞ্চল)
# ② PLANS.md: session294-নোট (session293-নোট-এর আগে)
# ③ worklog.md (রিপো): Task ID 134 এন্ট্রি (ফাইল-শেষে append)
import io, sys

PROJECT = 'PROJECT.md'
PLANS = 'PLANS.md'
WORKLOG = 'worklog.md'

S294_PROJECT = '''## §২৯৪ (session294 — cron 403679: কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294 — /admin/content ট্যাব-প্যানেল-সারফেসে ফিল্ড-সার্চ + ক্রস-পেজ-জাম্প) — s294 ৫৮/৫৮ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`3cafeef` (session293-dcf293, clean-tree); **ফিচার-কোড-লেখার-আগেই-fetch** (BEHIND=০); রাউন্ড-শুরু QA: লোকাল-সার্ভার হেলদি + প্রোড-স্পট সবুজ (home-200 + health-200) + /admin/content ব্রাউজার-স্মোক (T14/P14/F266/G45, active=home, ত্রুটি-শূন্য) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন (পূর্ব-সেশন-প্রস্তাব-পুনঃস্কোপিং):** PLANS session293-তালিকার **content.ejs/home-leadership.ejs/sections.ejs-ফিল্টার-প্রার্থী** — grep-স্ক্যানে তিনটিই `data-*-row`/`__*QA`-শূন্য নিশ্চিত; content.ejs বিশ্লেষণে **ট্যাব-প্যানেল-সম্পাদক** (১৪-পেজ-ট্যাব / ৪৫-গ্রুপ / ২৬৬-ফিল্ড — তালিকা-টেবিল-নয়) → স্বাভাবিক-ফিল্টার = **ফিল্ড-সার্চ-ও-জাম্প** (কোন-পেজের-কোন-গ্রুপে-কোন-লেখা — ক্লিক-থ্রু-ব্যথা) — পরিবারের ২৩তম-সারফেস (প্রথম অ-তালিকা-সারফেস)।

**[Mandatory-ফিচার] cej294 (mo268/sb269/dcf293-পরিবার-সম্প্রসারণ):** content.ejs-এ **তাৎক্ষণিক-জাম্প-স্ট্রিপ** (`#cejStrip294` — কীওয়ার্ড-ইনপুট `#cejJump294` + clear + কাউন্ট-চিপ (বাংলা-সংখ্যা 'X ফিল্ড · Y পেজ') + kbd-হিন্ট F/Enter/Esc + ম্যাচ-লিস্ট `#cejList294` টপ-৮ + শূন্য-অবস্থা `#cejZero294`) — **রানটাইম-ইনডেক্স** (মার্কআপ-স্পর্শ-শূন্য: .ce-tab→pageLabel, .ce-panel×.ce-group×.ce-field→{label+value+group+page+hint} নরমালাইজড-kw); **ম্যাচ-লিস্ট টপ-৮** (createElement+textContent — মান-ইনজেকশন-নিরাপদ; সারি = পেজ-পিল + গ্রুপ + লেবেল + মান-স্নিপেট, ক্লিকে-জাম্প); **Enter/জাম্প** (firstMatch → ট্যাব-অ্যাক্টিভেট (বিদ্যমান showPage-লিসনার-পুনঃব্যবহার — কোর-JS-অস্পৃশ্য) + scrollIntoView-center + ফোকাস + cej294-flash-রিং ১.৬সে); **সক্রিয়-হাইড** (মিল-শূন্য .ce-field/.ce-group [hidden] — !important-গার্ড); শূন্য-অবস্থা; **'f'-ফোকাস-ফিল্ড-গার্ড** + Escape-stopPropagation + Enter-preventDefault (স্ট্রিপ form-বহির্ভূত — ক্রম-অ্যাসার্ট-প্রমাণিত); **__cej294QA হুক ×৮** (fields/pages/matches/pagesHit/activePage/firstMatch/apply/clear/jumpFirst — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) + __cej294wired-গার্ড; no-regression ×৯ (contentForm/ceActivePage/showPage/ce-edit-btn/ceSavebar/ceDirtyCount/uploadImage/sidebar/ce-group-status-অক্ষুণ্ণ)।

**[Mandatory-স্টাইল]:** inline `<style>` ব্লক **হেক্স-শূন্য টোকেন-শুধু** — .cej294-instant-স্ট্রিপ (var(--lf-fb-border)-বর্ডার + var(--lf-white)) + **brandgreen-টোকেন-পরিবার** (var(--lf-brandgreen-deep)/var(--lf-brandgreen-soft) — নিরপেক্ষ-সম্পাদক-থিম; dcf293-amber-বিকল্পের-রীতি-অনুসরণ) + color-mix-ফোকাস-রিং (২-স্তর) + kbd-পিল (dashed color-mix) + ম্যাচ-লিস্ট-ড্রপডাউন (absolute + color-mix-ছায়া + max-height-320px-স্ক্রল + 999px-পেজ-পিল) + **idden]-গার্ড বাইট-সঠিক** (চিপ/শূন্য/ক্লিয়ার/লিস্ট display:none + `.ce-field[hidden]`/`.ce-group[hidden]` !important) + cej294-flash-রিং (color-mix) + reduced-motion + 640px-সংকোচন (kbd-হিন্ট+m-val-লুকানো)।

**টেস্ট:** নতুন tests/s294-cejump-suite.sh **৫৮/৫৮ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২৭ + স্টাইল ×৮ + no-reg ×৯ + ক্রম-অ্যাসার্ট; SSR ×৬: লগইন admin/admin123 + অ্যাঙ্করড-চেক contentForm-মার্কারে (লগইন-পেজ-বর্জন) + **প্রত্যাশা-গণনা রেন্ডার্ড-HTML থেকে** (F=২৬৬/P=১৪/G=৪৫ — `class="ce-field ce-t-` মার্কআপ-ইউনিক-প্যাটার্ন); E2E ×১৩: বুট-হুক F266P14 + কীওয়ার্ড→M১+হাইড২৬৫ (F-M=হাইড-নির্ধারক) + লিস্ট-সারি=টপ-৮-চুক্তি + clear→২৬৬-পুনরুদ্ধার + **ইউনিক-লেবেল-ক্রস-পেজ-জাম্প (TO=firstMatch-পেজ + ফ্ল্যাশ-রিং)** + শূন্য-অবস্থা '০ ফিল্ড · ০ পেজ' + Escape + 'f'-ফোকাস + **ফিল্ড-গার্ড (TEXTAREA-ফোকাস-অটুট)** + ফ্রেশ-লোড + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) — **রিড-ওনলি-সারফেস: সিড/ক্লিন-শূন্য** + **পূর্ণ-রিগ্রেশন s260-s294 (৩৬-সুইট সব-গ্রিন — রানার scripts/s294-regression.sh; চাঙ্ক ১২+১২+১২)** + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)-গ্রিন; প্যাচ: scripts/s294-cejump-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, অ্যাঙ্কর-এককতা-FATAL, পোস্ট-অ্যাসার্ট+idden]-বাইট+হেক্স-শূন্য+no-reg ×৯+ক্রম)।

**গোটচা ×২ (PLANS session294):** ① **সোর্স-টেমপ্লেট-বনাম-রেন্ডার্ড-গণনা** — প্যাচ-পোস্ট-অ্যাসার্টে রেন্ডার্ড-সংখ্যা (২৬৬) সোর্স-স্ক্যানে চাইলে ব্যর্থ (EJS-টেমপ্লেট-লাইন ১-বার) → **সোর্স-অ্যাসার্ট=টেমপ্লেট-লাইন-গণনা, রেন্ডার্ড-অ্যাসার্ট=সুইট-স্তর** ② **জাম্প-গন্তব্য-অনুমান-নিষিদ্ধ** — অ-সক্রিয়-ট্যাবের-প্রথম-লেবেল-সার্চে firstMatch অন্য-পেজে-পড়তে-পারে (ক্রস-লেবেল-মিল) → অ্যাসার্ট **TO=firstMatch().page** (অনুমিত-ট্যাব-নয়) + ইউনিক-লেবেল-নির্ধারকতা (সর্ব-সারফেসে-একক-উপস্থিতি)।

'''

S294_PLANS = '''## session294-নোট (cron 403679 — কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294)
- **সোর্স-টেমপ্লেট-বনাম-রেন্ডার্ড-গণনা-গোটচা (নতুন — প্যাচ-অ্যাসার্ট-শ্রেণি):** প্যাচ-স্ক্রিপ্টের পোস্ট-অ্যাসার্টে **রেন্ডার্ড-DOM-সংখ্যা** (২৬৬-ফিল্ড) সোর্স-ফাইল-স্ক্যানে চাওয়া যায়-না — EJS-টেমপ্লেটে `class="ce-field ce-t-<%= f.type %>"` এক-লাইনে-একবার (রেন্ডারে ২৬৬) → প্রথম-রানে FATAL-মিথ্যা-ফেল; **প্রতিকার: সোর্স-অ্যাসার্ট = টেমপ্লেট-লাইন-গণনা (১), রেন্ডার্ড-অ্যাসার্ট = সুইট-স্তর (রেন্ডার্ড-HTML-grep)** — দুই-স্তর-বিভাজন-চুক্তি।
- **জাম্প-গন্তব্য-অনুমান-নিষিদ্ধ-চুক্তি (নতুন — ক্রস-পেজ-জাম্প-টেস্ট-শ্রেণি):** অ-সক্রিয়-ট্যাবের-প্রথম-লেবেল-সার্চে **firstMatch অন্য-পেজে-পড়তে-পারে** (লেবেল/মান-ক্রস-মিল — রান-স্মোকে ধরা-পড়ে: TO=home ≠ নির্বাচিত-ট্যাব) → জাম্প-অ্যাসার্ট **সর্বদা TO=firstMatch().page**; নির্ধারক-প্রোব = **সর্ব-সারফেসে-একক-উপস্থিতি-লেবেল** (seen-count রানটাইম-গণনা → uniq-ফিল্টার → শূন্য-হলে NOUNIQ-স্কিপ)।
- **cej294-সারফেস-চুক্তি:** হুক **__cej294QA ×৮** (fields/pages/matches/pagesHit/activePage/firstMatch/apply/clear/jumpFirst); ইনডেক্স = **রানটাইম-DOM-নির্মিত** (মার্কআপ-স্পর্শ-শূন্য — .ce-tab/.ce-panel/.ce-group/.ce-field-স্ক্যান) → সারফেস-কাঠামো-বদলে-ইনডেক্স-স্বয়ংক্রিয়-মানিয়ে-নেয়; ম্যাচ-লিস্ট = **createElement+textContent** (DB-মান-ইনজেকশন-নিরাপদ — innerHTML-নিষিদ্ধ); জাম্প = ট্যাব-.click()-পুনঃব্যবহার (বিদ্যমান showPage-লিসনার — কোর-JS-অস্পৃশ্য no-reg ×৯); স্ট্রিপ **form-বহির্ভূত** (Enter-সাবমিট-নিরাপদ — প্যাচে বাইট-অফসেট-ক্রম-অ্যাসার্ট)।
- **রিড-ওনলি-সারফেস-সুইট-চুক্তি:** সম্পাদক-সারফেসে সিড/ক্লিন-শূন্য (POST-শূন্য — broadcast-ঝুঁকি-শূন্য) → সুইট-ধাপ-৪ = চূড়ান্ত-বুট-মাত্র; প্রত্যাশা-সংখ্যা (F/P/G) রেন্ডার্ড-HTML থেকে — ডেটা-অনুপস্থিতিতে-ও-নির্ধারক।
- **পরের-এজেন্ট: session295 থেকে (worklog Task ID 135)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session294 + session293 + session292 + session291 পড়ুন; বাকি-প্রস্তাব: **home-leadership.ejs/sections.ejs-ফিল্টার-প্রার্থী** (cej294-রানটাইম-ইনডেক্স-প্যাটার্ন-পুনঃব্যবহারযোগ্য — sections-এ sec-item-তালিকা, home-leadership-এ slot-কার্ড), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড), LOWMEM-ক্যাপ-টিউনিং, ফিল্মস্ট্রিপ-স্ন্যাপ-পলিশ, daily-স্ট্যাটিক-চিপ→ক্লিকেবল-ফ্যাসেট (dcf293-সম্প্রসারণ), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''

def insert_before(path, anchor, block, marker):
    src = io.open(path, 'r', encoding='utf-8').read()
    if marker in src:
        print('skip:', path, '(মার্কার-উপস্থিত)')
        return
    if src.count(anchor) != 1:
        print('FATAL:', path, 'অ্যাঙ্কর-অস্পষ্ট count=', src.count(anchor)); sys.exit(1)
    src = src.replace(anchor, block + anchor, 1)
    io.open(path, 'w', encoding='utf-8').write(src)
    print('ok:', path, 'সন্নিবেশ')

def append_entry(path, block, marker):
    src = io.open(path, 'r', encoding='utf-8').read()
    if marker in src:
        print('skip:', path, '(মার্কার-উপস্থিত)')
        return
    if not src.endswith('\n'):
        src += '\n'
    io.open(path, 'w', encoding='utf-8').write(src + block)
    print('ok:', path, 'append')

S294_WORKLOG = '''---
Task ID: 134 (session294 — cron 403679; কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294) — push `3cafeef..HEAD` (feature + docs)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9-2ac03411, trace 202609240519)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- রাউন্ড-শুরু HEAD=origin=`3cafeef` (session293-dcf293), working-tree ক্লিন; **ফিচার-কোড-লেখার-আগেই fetch** (BEHIND=০)
- QA: লোকাল-সার্ভার হেলদি + প্রোড-স্পট সবুজ (home-200 + health-200) + /admin/content ব্রাউজার-স্মোক (T14/P14/F266/G45, active=home) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড
- **প্রস্তাব-পুনঃস্কোপিং:** session293-প্রস্তাব-প্রার্থী content.ejs/home-leadership.ejs/sections.ejs — তিনটিই ফিল্টার-শূন্য নিশ্চিত; content.ejs = **ট্যাব-প্যানেল-সম্পাদক** (১৪-পেজ / ৪৫-গ্রুপ / ২৬৬-ফিল্ড) → ফিল্ড-সার্চ-ও-জাম্প (পরিবারের ২৩তম-সারফেস, প্রথম অ-তালিকা-সারফেস)

## এ-রাউন্ডে সম্পন্ন (session294)
- **[Mandatory-ফিচার] cej294:** /admin/content **তাৎক্ষণিক-জাম্প** — কীওয়ার্ড-ইনপুট (লেবেল+মান+গ্রুপ+পেজ+হিন্ট-মিল; রানটাইম-DOM-ইনডেক্স — মার্কআপ-স্পর্শ-শূন্য) + **ম্যাচ-লিস্ট টপ-৮** (createElement+textContent — ইনজেকশন-নিরাপদ) + **Enter/ক্লিক-জাম্প** (ট্যাব-অ্যাক্টিভেট + scrollIntoView + ফোকাস + ফ্ল্যাশ-রিং) + সক্রিয়-হাইড (ce-field/ce-group [hidden]) + কাউন্ট-চিপ (বাংলা 'X ফিল্ড · Y পেজ') + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + স্ট্রিপ-form-বহির্ভূত (Enter-সাবমিট-নিরাপদ); **__cej294QA হুক ×৮**; no-regression ×৯-অ্যাঙ্কর-অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** inline-স্টাইল-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — **brandgreen-পরিবার** + color-mix-ফোকাস-রিং + লিস্ট-ড্রপডাউন (color-mix-ছায়া + 320px-স্ক্রল) + kbd-পিল + **idden]-গার্ড বাইট-সঠিক** (ফিল্ড+গ্রুপ !important) + ফ্ল্যাশ-রিং + reduced-motion + 640px-সংকোচন
- **টেস্ট:** নতুন tests/s294-cejump-suite.sh **৫৮/৫৮ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২৭ + স্টাইল ×৮ + no-reg ×৯ + ক্রম + SSR ×৬ — প্রত্যাশা-রেন্ডার্ড-HTML-থেকে F266/P14/G45; E2E ×১৩ — বুট-হুক + কীওয়ার্ড→হাইড-নির্ধারক + লিস্ট-টপ-৮ + clear→২৬৬ + **ইউনিক-লেবেল-ক্রস-পেজ-জাম্প (TO=firstMatch + ফ্ল্যাশ)** + শূন্য-অবস্থা-বাংলা-চিপ + Escape + 'f'-ফোকাস + **ফিল্ড-গার্ড (TEXTAREA)** + ফ্রেশ-লোড + 390px + স্ক্রিনশট ×২) — **রিড-ওনলি: সিড/ক্লিন-শূন্য** + **পূর্ণ-রিগ্রেশন s260-s294 (৩৬-সুইট সব-গ্রিন — s294-regression.sh; চাঙ্ক ১২+১২+১২)** + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)
- **গোটচা ×২ (PLANS session294):** ① **সোর্স-টেমপ্লেট-বনাম-রেন্ডার্ড-গণনা** — প্যাচ-অ্যাসার্টে রেন্ডার্ড-২৬৬ সোর্স-স্ক্যানে মিথ্যা-ফেল (টেমপ্লেট-লাইন ১-বার) → দুই-স্তর-বিভাজন ② **জাম্প-গন্তব্য-অনুমান-নিষিদ্ধ** — firstMatch অন্য-পেজে-পড়তে-পারে → অ্যাসার্ট TO=firstMatch().page + ইউনিক-লেবেল-নির্ধারকতা
- **পাইপলাইন:** প্যাচ scripts/s294-cejump-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, অ্যাঙ্কর-এককতা-FATAL, পোস্ট-অ্যাসার্ট+idden]-বাইট+হেক্স-শূন্য+no-reg ×৯+ক্রম) + feature-commit (git commit -F-পথ) + ডক ×৩ (s294-docs.py idempotent) + docs-commit + PNG-চার্ন-রিভার্ট + secret-scan-ক্লিন + fetch + **push** → Vercel READY → প্রোড-স্পট + স্ক্রিনশট download/s294-prod-baseline.png

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session295 লেবেল (worklog Task ID 135)**; **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + দীর্ঘ-রান চাঙ্কে-ই + কমিট-মেসেজ -F-পথ + **eval-এ IIFE-র‍্যাপ** + **অক্ষর-সন্নিহিত-ভেরিয়েবলে ${}-ব্রেস**; PLANS session294 + session293 + session292 + session291 পড়ুন
- বাকি-প্রস্তাব: home-leadership.ejs/sections.ejs-ফিল্টার (cej294-রানটাইম-ইনডেক্স-প্যাটার্ন-পুনঃব্যবহারযোগ্য), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), LOWMEM-ক্যাপ-টিউনিং, ফিল্মস্ট্রিপ-স্ন্যাপ-পলিশ, daily-স্ট্যাটিক-চিপ→ক্লিকেবল-ফ্যাসেট (dcf293-সম্প্রসারণ), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)
'''

insert_before(PROJECT, '## §২৯৩ (session293', S294_PROJECT, '## §২৯৪ (session294')
insert_before(PLANS, '## session293-নোট (cron 403679 — ডেইলি কনটেন্ট তাৎক্ষণিক-ফিল্টার dcf293)', S294_PLANS, '## session294-নোট (cron 403679')
append_entry(WORKLOG, S294_WORKLOG, 'Task ID: 134 (session294')
print('DOCS-OK')
