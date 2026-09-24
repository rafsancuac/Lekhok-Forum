#!/usr/bin/env python3
# s301-docs.py — session301 ডকুমেন্টেশন (PROJECT.md §৩০১ + PLANS session301-নোট + worklog Task-141)
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

SEC301 = '''## §৩০১ (session301 — cron 403679: QA-বাগ-ফিক্স poster-onerror + ep301 ক্যালেন্ডার-সেল-প্রিফেচ + bwf301 best-writer ফিল্টার + ofx301 টপবার-ক্লিপ ফিক্স) — s301 ৬৯/৬৯ ×৩ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`23b93fc` (session300-multipart, clean-tree, BEHIND=০); agent-browser QA-তে **প্রকৃত-বাগ ধরা-পড়ে** → বাগ-ফিক্স-অগ্রাধিকার-রাউন্ড। **QA-বাগ (প্রকৃত-উৎস-তদন্ত-পূর্বক):** /epaper **দ্বিতীয়-লোডে** `SyntaxError: Invalid or unexpected token` (url:null, document-line 2533, col 28) — CDP `Debugger.getScriptSource`-এ ভাঙা-স্ক্রিপ্ট = **`this.style.display='none` (২৪-বাইট, ক্লোজিং-কোট-ক্ষয়)**; রুট = views/user/epaper.ejs:766-এ `onerror="this.style.display=\\'none\\""` — JS-স্ট্রিং-এ `\\"` হবার কথা `\\'` (এমিটেড attr-মান অন্তর্ভুক্ত-কোট-হারায় → HTML-পার্সার পরবর্তী-কোটে-attr-বন্ধ → V8-কম্পাইল-সিনট্যাক্স-এরর + ভাঙা-পোস্টার অদৃশ্য-হয়-না); ট্রিগার-শর্ত = ২য়-লোডে p.thumbs-উপস্থিতি → posterHtml-এমিট। **ফিক্স:** `\\'none\\'` — দ্বি-লোড এরর-শূন্য প্রমাণ।

**[Mandatory-ফিচার] ① ep301 ক্যালেন্ডার-দিন-সেল-ইচ্ছা-প্রিফেচ (PLANS session300-প্রস্তাব):** epk300-ফানেল-পুনঃব্যবহার — `elCalGrid`-ডেলিগেশন (mouseover+focusin — **calRender-পুনঃরেন্ডার-নিরাপদ**); শুধু `.ep-cal-day.has` (সংরক্ষিত-সংখ্যা-আছে দিন — ভবিষ্যৎ/শূন্য-দিন প্রিফেচ-শূন্য); **byDate[iso] = প্রতি-তারিখে-অ্যারে** → arr[0] (date-DESC-প্রথম = সর্বশেষ-সংখ্যা — s300-কনভেনশন); বুট/calJump-প্রিফেচ-নিষিদ্ধ (ইচ্ছা-গেট-ধর্ম) + উষ্ণ-মিরর warmed-has-ভিত্তিক + `__epk300QA.cells`-গেটার-সম্প্রসারণ। **② bwf301 /moderator/best-writer তাৎক্ষণিক-ফিল্টার (moderator-সারফেস-ফিল্টার-প্যাকের অবশিষ্ট-সারফেস):** lsf298/re261-চুক্তি-মিরর — স্ট্রিপ (ইনপুট/ক্লিয়ার/কাউন্ট-চিপ-বাংলা-অঙ্ক/kbd-hint/শূন্য-অবস্থা — form-বহির্ভূত) + রো-মার্ক `data-bwf-row301="<id>" data-kw` (দ্বিভাষিক: #id/শিরোনাম/লেখক/@username/অবস্থা) + **রানটাইম-ইনডেক্স** (per-apply DOM-পুনঃস্ক্যান) + 'f'-ফোকাস + Escape + **Enter-firstMatch-ফোকাস+ফ্ল্যাশ** (৯০০ms-নির্মোচন) + boot-apply-init (session300-শিক্ষা) + `__bwf301QA` হুক ×৮ (surface/rows/matches/total/active/firstMatch/apply/clear — রো-শূন্যে-ও)। **③ ofx301 টপবার মোবাইল-ক্লিপ ফিক্স (PLANS session294-তদন্ত-প্রস্তাব-পূর্ণ):** body+21px-উৎস-নির্মূল — রুট = 992-MQ-র `.topbar-nav{display:none}` **ক্যাসকেড-পরবর্তী top-level `.topbar-nav{display:inline-flex}` (notif-যুগ, offset ~৫৬ক) + `.topbar-right .nav-login{display:inline-flex}` (0,2,0 — offset ~৮৭ক) পুনঃঘোষণায় বাসি** → মোবাইলে লগইন/রেজিস্ট্রেশন-অ্যাঙ্কর দৃশ্যমান থেকে `.menu-toggle` ২১px ডানে-ছাঁটা (body{overflow-x:clip}-নীরব); ফিক্স = ক্যাসকেড-শেষে `.topbar-right a.topbar-nav{display:none}` (**0,2,1-স্পেসিফিকিটি** — MQ-পুনঃপ্রতিষ্ঠা); অথ-লিংক মোবাইল-সাইডবারে .mobile-cta-তে বিদ্যমান (হারানো-ক্ষমতা-শূন্য); যাচাই: bOver ৩১→০ + btnRight ৪১১→৩৬৬≤৩৯০। page-count-ব্যাজ **আবার-বাতিল** (গেটেড ×৪-প্রমাণ — page_count-কলাম-এখনো-অনুপস্থিত); moderator-navigation **বাদ-ডকুমেন্টেড** (JS-এডিটর-সারফেস — সারি-তালিকা-নয়); moderator-daily-form **স্থগিত** (bulk-চেকবক্স-হিডেন-ঝুঁকি — পরের-রাউন্ড-প্রার্থী সুরক্ষা-চুক্তিসহ)।

**[Mandatory-স্টাইল]:** epaper.css **session301-ব্লক** (ক্যাসকেড-শেষে হেক্স-শূন্য) — উষ্ণ-ক্যালেন্ডার-সেল রিং+টিন্ট (**:not(.is-sel)-সংঘর্ষ-বিচ্ছিন্ন**) + সেল-ট্রানজিশন-সম্প্রসারণ + `epk301PosterIn` লোডিং-পোস্টার প্রবেশ-ফেড (onerror-ফিক্স-পরবর্তী দৃশ্যমানতা) + 640px-সংকোচন + reduced-motion-গার্ড; moderator-best-writer.ejs **bwf301-স্টাইল-ব্লক** (re261-মিরর: hover-বর্ডার-ডিপেন + color-mix-ফোকাস-রিং ৪৫%/১৫% + clear :active scale(.96) + flash-outline + hidden-গার্ড !important + 640px + reduced-motion — brandgreen-পরিবার, হেক্স-শূন্য); style.css **ofx301-ব্লক** (MQ-পুনঃপ্রতিষ্ঠা — ডেস্কটপ-অস্পৃশ্য)।

**টেস্ট:** নতুন tests/s301-suite.sh **৬৯/৬৯ ×৩-ধারাবাহিক** (কাঠামো ×২৭ + SSR ×৪ + E2E-bwf ×২৩ — হুক-total-বুট-সত্য=SSR-সারি২৮ + একক-মিল#id + বাংলা-চিপ + গার্বেজ-শূন্য-অবস্থা + Escape/'f'/Enter-ফ্ল্যাশ-নির্মোচন + hScroll + স্ক্রিনশট ×২ + E2E-ep301 ×১১ — বুট-শূন্য + হোভার-reason=cal + ডিডুপ + warm-মিরর + না-has-শূন্য + focusin + পুনঃরেন্ডার-বিলোপ/পুনঃ-প্রতিষ্ঠা + E2E-রিগ্রেশন ×২ — **দ্বি-লোড এরর-শূন্য** + E2E-ofx301 ×৪ — bOver-শূন্য/অ্যাঙ্কর-লুকানো/toggle-পূর্ণ-দৃশ্যমান/ডেস্কটপ-অক্ষুণ্ণ); রিগ্রেশন: s300-multipart ৪৭/৪৭ + s300-epref ৬৫/৬৫ + s298-lsfilt ১০১/১০১ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs); প্যাচ scripts/s301-patch.py (idempotent ×N — ৪-ফাইল মার্কার-স্কিপ + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-compile)।

**গোটচা ×৪ (PLANS session301):** ① **byDate[iso]=অ্যারে** — প্রতি-তারিখে-বহু-পত্রিকা → arr[0]-নির্বাচন-বাধ্যতমূলক (object-ধরে-নিলে নীরব-নন-ফায়ার — রান-১-এ ধরা-পড়ে) ② **getComputedStyle-জয়ী উচ্চ-স্পেসিফিকিটি-লুকানো** — offset-স্ক্যান-শুধু-যথেষ্ট-নয়: (0,2,0)-যুক্ত-দেরত্বশীল-রুল বেস-(0,1,0)-ও ক্যাসকেড-শেষ-ওভাররাইড-হারায় → জয়ী-রুল-নির্ণয়ে CSSOM-অ্যাসার্ট + স্পেসিফিকিটি-গণনা ③ **agent-browser নীরব-ব্যর্থ-open-পুনঃপ্রমাণ** — ব্যাটারি-মাঝে about:blank-স্থগিত → bopen-এ ডেমন-রিসাইকেল-ফলব্যাক (রান-২/৩-এর একক-ফেল = এ-শ্রেণি) ④ **eval-এ MouseEvent-dispatch = বাবলিং-স্পষ্ট** — `new MouseEvent('mouseover',{bubbles:true})` — bubbles-শূন্যে ডেলিগেশন-নীরব-ব্যর্থ।

'''

v = rd(PROJ)
if '## §৩০১' in v:
    print('PROJECT.md: §৩০১-মার্কার-উপস্থিত (skip)')
else:
    A = '## §৩০০ (session300 — cron 403679'
    if v.count(A) != 1:
        die('PROJECT-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, SEC301 + A, 1)
    wr(PROJ, v)
    print('PROJECT.md: §৩০১ সন্নিবেশিত')

NOTE301 = '''## session301-নোট (cron 403679 — QA-বাগ-ফিক্স poster-onerror + ep301 ক্যালেন্ডার-সেল + bwf301 best-writer ফিল্টার + ofx301 টপবার-ক্লিপ)
- **CDP-ভাঙা-স্ক্রিপ্ট-নির্ণয়-চুক্তি (নতুন — QA-শ্রেণি):** agent-browser `errors --json`-এ url:null + line/col-মাত্র দিলে **CDP `Debugger.enable` + `Debugger.getScriptSource(scriptId)`** — ভাঙা-স্ক্রিপ্ট-বস্তু সরাসরি (এ-রাউন্ডে ২৪-বাইট `this.style.display='none` — ক্লোজিং-কোট-ক্ষয়); errors-তালিকা **ক্রমসঞ্চিত** (console --clear মুছে-না) → পৃষ্ঠা-প্রতি-ডেল্টা-পার্থক্য-বাধ্যতমূলক।
- **JS-স্ট্রিং-থেকে-HTML-attr-কোট-চুক্তি:** JS single-quoted-স্ট্রিং-এ HTML-attr লিখলে attr-বন্ধ = `\\"` (JS-এ literal-`"`) — কিন্তু attr-মানের **অন্তর্ভুক্ত-কোট = `\\'`**; `onerror="...display=\\'none\\""` লিখলে এমিট = `display='none` + অতিরিক্ত-`"` → attr-মান-অন্তর্ভুক্ত-কোট-হারায় → V8-কম্পাইল-সিনট্যাক্স-এরর (নীরব — element-handler-এরর window-error-হিসেবে)। innerHTML-পথে SSR-grep-অদৃশ্য (runtime-এমিট) → **এরর-মনিটর-ই-প্রথম-সেন্টিনেল**।
- **ep301-সারফেস-চুক্তি (ep300-ধর্ম-সম্প্রসারণ):** ট্রিগার = elCalGrid-**ডেলিগেশন** (mouseover/focusin — calRender-পুনঃরেন্ডার-নিরাপদ); গেট = `.ep-cal-day.has`-ক্লাস + **`byDate[iso]` = প্রতি-তারিখে-অ্যারে → arr[0]** (date-DESC-সর্বশেষ — object-ধরে-নিলে নীরব-নন-ফায়ার); বুট/calJump-প্রিফেচ-নিষিদ্ধ; উষ্ণ-মিরর warmed-has + `__epk300QA.cells`-গেটার।
- **ofx301-ক্যাসকেড-চুক্তি:** পুরনো-MQ-নিয়ম **ক্যাসকেড-পরবর্তী top-level পুনঃঘোষণায় বাসি** হয় (এমনকি (0,1,0)-বনাম-(0,1,0)-পরে-জয়ী) — এবং **উচ্চ-স্পেসিফিকিটি (0,2,0) রুল অদৃশ্য-জয়ী থাকে** → ফিক্স = ক্যাসকেড-শেষে MQ-পুনঃপ্রতিষ্ঠা **জয়ী-রুলের-স্পেসিফিকিটি+১-গঠনে** (`.topbar-right a.topbar-nav` = 0,2,1); নির্ণয়-কৌশল: getComputedStyle-বনাম-CSSOM-নিয়ম-তালিকা (parent-conditionText-সহ) — অমিল = লুকানো-জয়ী-রুল-অনুসন্ধান।
- **bwf301-সারফেস-চুক্তি (lsf298/re261-মিরর):** স্ট্রিপ form-বহির্ভূত (surface=বন্ডিং-পয়েন্ট — রো-অনুসন্ধান surface.parentNode-স্কোপড); রো-মার্ক data-bwf-row301=id + data-kw (দ্বিভাষিক — ASCII-গ্রেপ-সুরক্ষা); রানটাইম-ইনডেক্স + boot-apply-init + বাংলা-চিপ (pure-JS bn301 — সুইটে pure-bash bn()-মিল) + Enter-firstMatch-ফোকাস+ফ্ল্যাশ (৯০০ms)। **moderator-ফিল্টার-প্যাক-অবস্থা:** re261/mdf263/muf262/lsf298/cej294-পরিবারে bwf301-যোগ; navigation-বাদ (JS-এডিটর — তালিকা-নয়); daily-form-স্থগিত (bulk-চেকবক্স-হিডেন-ঝুঁকি — গ্রহণকালে checked-hidden-সুরক্ষা-চুক্তি-সংজ্ঞায়িত-করুন)।
- **গোটচা-agent-browser-পুনঃপ্রমাণ:** নীরব-ব্যর্থ-open (about:blank-স্থগিত) ব্যাটারি-মাঝে-ও (রান-২/৩-এর একক-ফেল) → bopen-এ **ডেমন-রিসাইকেল-ফলব্যাক** (close --all → পুনঃ-রিট্রাই) সুইট-অন্তর্ভুক্ত; eval-এ dispatch = `bubbles:true`-স্পষ্ট-বাধ্যতমূলক (ডেলিগেশন-পথ)।
- **পরের-এজেন্ট: session302 থেকে (worklog Task ID 142)।** ফিচার-কোড-লেখার-আগেই fetch + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট; PLANS session301 + session300 + session299 পড়ুন; বাকি-প্রস্তাব: moderator-daily-form ফিল্টার (checked-hidden-সুরক্ষা-চুক্তি-পূর্বক), moderator-best-writer **admin-দিক প্রতিরূপ** (যদি-থাকে — bwf301-মিরর), ep301-প্রিফেচ-কভারেজ (ep283-মাস-প্যানেল-মাস-গ্রিডে), page-count-ব্যাজ (গেটেড ×৪), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

'''
v = rd(PLANS)
if '## session301-নোট' in v:
    print('PLANS.md: session301-নোট-উপস্থিত (skip)')
else:
    A = '## session300-নোট (cron 403679'
    if v.count(A) != 1:
        die('PLANS-অ্যাঙ্কর-কাউন্ট=%d' % v.count(A))
    v = v.replace(A, NOTE301 + A, 1)
    wr(PLANS, v)
    print('PLANS.md: session301-নোট সন্নিবেশিত')

WENTRY = '''## Task ID 141 / session301 (cron 403679 — QA-বাগ-ফিক্স poster-onerror + ep301 + bwf301 + ofx301)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`23b93fc` (session300-multipart) — স্থিতিশীল, clean; agent-browser QA-তে প্রকৃত-বাগ (epaper দ্বিতীয়-লোডে SyntaxError) → বাগ-ফিক্স-অগ্রাধিকার + PLANS session300-প্রস্তাবের বাস্তবায়নযোগ্য-সেট (ক্যালেন্ডার-সেল-প্রিফেচ + moderator-ফিল্টার-প্যাকের অবশিষ্ট + overflow-তদন্ত)।
- **পরিবর্তন:** views/user/epaper.ejs (**poster-onerror কোট-ক্ষয়-ফিক্স** — CDP-getScriptSource-নির্ণয়: ২৪-বাইট ভাঙা-স্ক্রিপ্ট; ep301 ক্যালেন্ডার-সেল-ডেলিগেশন — byDate-অ্যারে-arr[0] + has-গেট + উষ্ণ-মিরর; __epk300QA.cells-গেটার) + views/user/moderator-best-writer.ejs (bwf301 স্ট্রিপ+রো-মার্ক+রানটাইম-ইনডেক্স-ইঞ্জিন+boot-apply-init+Enter-flash+__bwf301QA ×৮ + স্টাইল-ব্লক) + public/assets/css/style.css (ofx301 ক্যাসকেড-শেষ MQ — .topbar-right a.topbar-nav 0,2,1) + public/assets/css/epaper.css (session301-ব্লক — উষ্ণ-সেল-রিং + epk301PosterIn + গার্ড) + scripts/s301-patch.py (idempotent ×N ৪-ফাইল) + tests/s301-suite.sh (নতুন — bopen-ডেমন-রিসাইকেল-ফলব্যাক-সহ)।
- **যাচাই:** s301 **৬৯/৬৯ ×৩-ধারাবাহিক** (কাঠামো ২৭ + SSR ৪ + E2E ৩৬ — দ্বি-লোড-এরর-শূন্য-প্রমাণসহ); রিগ্রেশন s300-multipart ৪৭/৪৭ + s300-epref ৬৫/৬৫ + s298-lsfilt ১০১/১০১ + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)।
- **গোটচা ×৪:** byDate[iso]=অ্যারে (arr[0]-বাধ্যতমূলক — নীরব-নন-ফায়ার) · getComputedStyle-জয়ী (0,2,0)-লুকানো-রুল (CSSOM-তালিকা + স্পেসিফিকিটি+১-ফিক্স) · নীরব-ব্যর্থ-open (ডেমন-রিসাইকেল-ফলব্যাক) · eval-dispatch bubbles:true-স্পষ্ট — বিস্তারিত PLANS session301।
- **পরের-এজেন্ট: session302 (Task ID 142)** — PLANS session301-নোট পড়ুন; daily-form-ফিল্টার (checked-hidden-চুক্তি) + ep283-মাস-প্যানেল-প্রিফেচ; push-আগে fetch+rebase; Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''
v = rd(WLOG)
if '## Task ID 141 / session301' in v:
    print('worklog.md: Task-141-উপস্থিত (skip)')
else:
    if not v.endswith('\n'):
        v += '\n'
    wr(WLOG, v + WENTRY)
    print('worklog.md: Task-141-এন্ট্রি সংযোজিত')

print('DOCS-OK s301')
