#!/usr/bin/env python3
# s296chip-docs.py — session296b ডক ×৩ (idempotent — মার্কার-গার্ড-প্রথম)
# ① PROJECT.md: §২৯৬-খ এন্ট্রি (সমান্তরাল-§২৯৬(ep296)-ব্লক-পূর্বে)
# ② PLANS.md: session296b-নোট (সমান্তরাল-session296-নোট-ব্লক-পূর্বে)
# ③ worklog.md (রিপো): Task ID 136b এন্ট্রি (ফাইল-শেষে append)
import io, sys, os

APP = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.dirname(APP))
PROJECT = 'PROJECT.md'
PLANS = 'PLANS.md'
WORKLOG = 'worklog.md'

S296_PROJECT = '''## §২৯৬-খ (session296b — cron 403679: ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296 — dcf293-সম্প্রসারণ; সমান্তরাল-ep296-লেবেল-রেসে ২৯৬b-রিলেবেল) — s296-chipfacet ৬০/৬০ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`4687808` (session295-ep295, clean-tree); প্রোড-যাচাই Vercel-API-তে **READY @ 4687808** (= main-HEAD — শূন্য-ড্রিফট; lekhok-forum.vercel.app home-200 + epaper-200 + admin-গেট-307 + /health-404-বেসলাইন + ep295-মার্কার-লাইভ ×৩২); লোকাল-সার্ভার হেলদি → **agent-browser QA**: ডিফল্ট-সেশনে /epaper-নেভিগেশনে টুল-স্তরের `SyntaxError@2467` পর্যবেক্ষণ — তিন-স্তর-বিচ্ছিন্নতায় **প্রজেক্ট-বাগ-নয় প্রমাণিত** (① পেজ-window-error-হুক-শূন্য ② সব-ইনলাইন-JS V8-parse-পরিষ্কার — local+prod+home তিনটিই ③ প্রতি-epaper-নেভিগেশনে +১ url:null) → টুল-রানটাইম-নয়েজ হিসেবে ডক; বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন (কভারেজ-স্ক্যান-প্রথা):** PLANS session295-তালিকার প্রথম-প্রার্থী **daily-স্ট্যাটিক-চিপ→ক্লিকেবল-ফ্যাসেট** — স্ক্যানে প্রমাণিত: list.ejs-চিপ-সারি (৬২-৭৪-লাইন) স্ট্যাটিক-span (role/handler-শূন্য), dcf293-ফানেল (#dcfType293 + change→dcfApply293) বিদ্যমান → একক-ফানেল-বিস্তার-সুযোগ।

**[Mandatory-ফিচার] dcf296:** daily/list.ejs — ① **চিপবার মার্কআপ** (`#dcfChipbar296` role=group + aria-label; সব-চিপ `data-dcf-chip296 data-dcf-type296=""` role=button + tabindex=0 + **aria-pressed=true-SSR**; ধরন-চিপ aria-pressed=false-SSR — ভিজ্যুয়াল-বিষয়বস্তু-প্যারিটি অটুট: icon+label+count) ② **একক-ফানেল-ফায়ার** — চিপ-ক্লিকে `#dcfType293`-মান-সেট + `dispatchEvent(new Event('change'))` (বিদ্যমান dcfApply293-পুনঃব্যবহার — নতুন-ফিল্টার-লজিক-শূন্য; session294-পিল-প্যাটার্ন-উত্তরাধিকার) ③ **aria-pressed-স্টেট-মেশিন দুই-দিক** — sync = `dcfApply293`-তে guarded হুক (`window.__dcfChipSync296` — clear/Escape/manual-select/চিপ **সব-পথ** dcfApply293-দিয়ে-যায় → sync-অসম্ভব-মিস) ④ **Enter/Space-কীবোর্ড** (preventDefault + ফায়ার — role=button-চুক্তি) ⑤ **__dcf296QA হুক** (chips/pressed/pressedType/type/clickAt/sync — চিপ-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি) ⑥ no-regression ×১১ (dcf293-স্ট্রিপ ×৬ + bulk-bar + chip-accent + idden]-গার্ড ×২ + সারি-hidden)।

**[Mandatory-স্টাইল]:** inline-স্টাইল session296-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — amber-পরিবার (dcf293-থিম-সম্মত): `[data-dcf-chip296]` cursor+transition:none+user-select + হোভার (color-mix-বর্ডার + amber-soft-পটভূমি + amber-deep-টেক্সট) + `:active` scale(.97) + **focus-visible-রিং** (outline ২px amber-deep offset-২px) + **সক্রিয়-অবস্থা** `[aria-pressed="true"]` (amber-deep-পটভূমি + var(--lf-white)-টেক্সট + color-mix-ছায়া) + reduced-motion-গার্ড + 640px-সংকোচন (৫px ১০px + .78rem)।

**টেস্ট:** নতুন tests/s296-chipfacet-suite.sh **৬০/৬০ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×২৩ — মার্কআপ ×৪ + ওয়্যারিং ×৫ + স্টাইল-ব্লক ×৭ + no-reg ×১০ + EJS-compile; SSR ×৪ — **প্রত্যাশা-গণনা রেন্ডার্ড-HTML-থেকে**: সারি-ইউনিক 'data-dcf-row data-kw=' + চিপ-ইউনিক-জোড় 'data-dcf-chip296 data-dcf-type296=' + quiz-সারি + quiz+খসড়া-লাইন-যুগল; E2E ×১৭ — বুট-হুক + quiz-চিপ→type/count/pressed-স্থানান্তর + কাউন্ট-চিপ-দৃশ্যমান + **ফোকাস-চুরি-শূন্য (দৃশ্যমান-কন্ট্রোল-প্রোব — session295-গোটচা-প্রয়োগ)** + Enter/Space + **বিপরীত-সিঙ্ক (select→চিপ)** + **clear-পথ-সিঙ্ক (dcfApply293-হুক-প্রমাণ)** + সব-চিপ-রিসেট + AND-কম্বো (quiz+মার্কার-কীওয়ার্ড=$QZM + quiz+খসড়া→শূন্য-অবস্থা) + Escape-পথ-সিঙ্ক + ফ্রেশ-লোড + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) — সিড-নেট-শূন্য (s293-seeddaily পুনঃব্যবহার — কিল→সিড→বুট) + **পূর্ণ-রিগ্রেশন s260-s296 (৩৮-সুইট সব-গ্রিন — রানার scripts/s296-regression.sh; চাঙ্ক ১৩+৭+৪+৪+৪+৪+২ — runner-wedge-গোটচা-পরে ছোট-চাঙ্ক)** + role-policy **২৬০/২৬০** + guard:design + audit:views (১২২ ejs)-গ্রিন; প্যাচ: scripts/s296-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, নেমস্পেস-গার্ড ×৫, অ্যাঙ্কর-এককতা-FATAL, ইউনিক-সম্পূর্ণ-লাইন-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + no-reg ×১১)।

**গোটচা ×৩ (PLANS session296):** ① **বাশ-ডিসপ্লে-[h-ম্যানগলিং** — cat -A/grep-আউটপুটে `[h`-ক্রম প্রদর্শন-স্তরে-খাওয়া (od -c সত্য-বাইট) → বাইট-ক্রিটিক্যাল-অ্যাঙ্কর সর্বদা od/Read-থেকে-কপি, ম্যানগল্ড-প্রদর্শন-থেকে-নয় ② **eval-নেস্টেড-কোট + grep -o-ফ্র্যাগমেন্ট** — bash-সিঙ্গেল-কোট-eval-এ JS-স্ট্রিং-নেস্টেড-কোট ভাঙে → আনকোটেড-CSS-অ্যাট্রি-সিলেক্টর ([data-x=quiz]); grep -o-ফ্র্যাগমেন্ট-পাইপে প্রেক্ষাপট-হারায় → সারি-grep ③ **রিগ্রেশন-রানার-ওয়েজ** — টুল-টাইমআউট-কিল-মধ্য-সুইটে ডেমন-অপারেশন-অনাথ → পরবর্তী-চাঙ্ক-ধীর/ক্ষণস্থায়ী-ফেল (s281 ৩৮/১ → তাৎক্ষণিক-পুনঃরান ৩৯/০-সবুজ) → ছোট-চাঙ্ক (≤৪) + ডেমন-হেলথ-প্রোব + ক্ষণস্থায়ী-ফেল-পুনঃরান-প্রোটোকল।

'''

S296_PLANS = '''## session296b-নোট (cron 403679 — ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296; সমান্তরাল-ep296-লেবেল-রেসে ২৯৬b-রিলেবেল)
- **বাশ-ডিসপ্লে-[h-ম্যানগলিং (নতুন — বাইট-অ্যাসার্ট-শ্রেণি):** cat -A/grep/সেড-আউটপুটে `[h`-ক্রম প্রদর্শন-স্তরে খাওয়া যায় (`chip[hidden]` → `chipidden]`-দৃশ্যমান) — ফাইল-বাইট-অক্ষত (od -c-প্রমাণিত) → **বাইট-ক্রিটিক্যাল-অ্যাঙ্কর/অ্যাসার্ট সর্বদা od -c বা Read-টুল-থেকে**, ম্যানগল্ড-বাশ-প্রদর্শন-থেকে-কখনো-নয়; প্যাচ-লেখক-দুই-স্তরে-ভুল-করার-প্রমাণ-রাউন্ড (no-reg-অ্যাঙ্কর + সুইট-hidden-গার্ড-অ্যাসার্ট-দুটিই)।
- **eval-নেস্টেড-কোট-নিষিদ্ধ + grep -o-ফ্র্যাগমেন্ট-প্রেক্ষাপট-হারানো (নতুন — সুইট-শ্রেণি):** bash-সিঙ্গেল-কোট-eval-আর্গুমেন্টে JS-স্ট্রিং-ভিতরের-কোট এস্কেপ-শৃঙ্খল-ভাঙে (`\\"` → JS-এ `\\`+`"` — সিলেক্টর-ভাঙা) → **আনকোটেড-CSS-অ্যাট্রি-সিলেক্টর** (`[data-dcf-type296=quiz]` — আইডেন্টিফায়ার-মানে-বৈধ) বা প্রথম-ম্যাচ-নির্বাচন; **grep -o ফ্র্যাগমেন্ট-আউটপুট পাইপের-পরবর্তী-প্রেক্ষাপট-grep-শূন্য-করে** (সারি-কনটেক্সট-হারায়) → সারি-স্তর-grep (`grep -F attr | grep -cF other-attr`)।
- **রিগ্রেশন-রানার-ওয়েজ-প্রোটোকল (নতুন — রানার-শ্রেণি):** টুল-কল-টাইমআউট-কিল মধ্য-সুইটে agent-browser-অপারেশন-অনাথ-রেখে-যায় → পরবর্তী-রানের-সুইট-ক্রমে ধীর/ক্ষণস্থায়ী-ফেল (s281: ৩৮/১ → তাৎক্ষণিক-পুনঃরান ৩৯/০-সবুজ — কোড-অপরিবর্তিত) → **চাঙ্ক ≤৪-সুইট** + চাঙ্ক-মাঝে ডেমন-হেলথ-প্রোব (`timeout 8 agent-browser console --clear`) + **ক্ষণস্থায়ী-ফেল = তাৎক্ষণিক-একক-পুনঃরান-আগে, RCA-পরে** (ডেটা-বীজ-অবস্থা-নির্ধারক — রেন্ডার্ড-HTML-প্রত্যাশা-মডেল-ই-রক্ষাকর্তা)।
- **dcf296-সারফেস-চুক্তি:** হুক **__dcf296QA** (chips/pressed/pressedType/type/clickAt/sync — চিপ-শূন্যে-ও-সংজ্ঞায়িত); ফায়ার = **dcfType293-মান-সেট + change-dispatch** (dcfApply293-একক-ফানেল — নতুন-ফিল্টার-লজিক-শূন্য); sync = **dcfApply293-ভিতরে-guarded-হুক** (`__dcfChipSync296` — clear/Escape/manual-সব-পথ-কভার; বিপরীত-দিকও select→চিপ) — ভবিষ্যৎ-প্রিসেট-সারফেস-এ-চুক্তিই-অনুসরণ করবে।
- **পরের-এজেন্ট: session297 থেকে (worklog Task ID 137)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tracked-M-শুধু); PLANS session296 + session295 + session294 + session293 পড়ুন; বাকি-প্রস্তাব: **home-leadership.ejs/sections.ejs-ফিল্টার** (cej294-রানটাইম-ইনডেক্স-প্যাটার্ন — sections-এ sec-item-তালিকা, home-leadership-এ slot-কার্ড), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

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


insert_before(PROJECT, '## §২৯৬ (session296 — ইউজার-স্পেক: হোম ই-পেপার প্রশস্ত-প্রিমিয়াম কিয়স্ক ep296', S296_PROJECT, '## §২৯৬-খ (session296b')
insert_before(PLANS, '## session296-নোট (ইউজার-স্পেক — হোম ই-পেপার প্রশস্ত-প্রিমিয়াম কিয়স্ক ep296)', S296_PLANS, '## session296b-নোট')

S296_WORKLOG = '''## Task ID 136b / session296b (cron 403679 — ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296; সমান্তরাল-ep296-লেবেল-রেসে ২৯৬b-রিলেবেল)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`4687808` (session295-ep295) — স্থিতিশীল; প্রোড Vercel READY @ 4687808 (= main, শূন্য-ড্রিফট) + ep295-মার্কার-লাইভ ×৩২; agent-browser QA-তে টুল-স্তরের SyntaxError-নয়েজ তিন-স্তর-বিচ্ছিন্নতায় প্রজেক্ট-বাগ-নয়-প্রমাণিত (window-হুক-শূন্য + V8-parse-পরিষ্কার ×৩-পেজ + প্রতি-epaper-নেভ +১); PLANS session295-প্রথম-প্রস্তাব গ্রহণ (কভারেজ-স্ক্যান-প্রথায় স্ট্যাটিক-চিপ-প্রমাণিত)।
- **পরিবর্তন:** daily/list.ejs — চিপবার dcfChipbar296 (role=group) + সব/ধরন-চিপ ক্লিকেবল (data-dcf-chip296 + data-dcf-type296 + role=button + tabindex + aria-pressed-SSR) + একক-ফানেল-ফায়ার (dcfType293-সেট + change-dispatch → dcfApply293-পুনঃব্যবহার — নতুন-লজিক-শূন্য) + dcfApply293-ভিতরে guarded sync-হুক (__dcfChipSync296 — সব-পথ-কভার) + Enter/Space-কীবোর্ড + __dcf296QA হুক ×৬ (চিপ-শূন্যে-ও-সংজ্ঞায়িত) + স্টাইল session296-ব্লক হেক্স-শূন্য (amber-পরিবার + aria-pressed-সক্রিয়-অবস্থা + focus-visible-রিং + reduced-motion + 640px); no-reg ×১১।
- **যাচাই:** tests/s296-chipfacet-suite.sh **৬০/৬০ ×২ (SKIP=০)** — কাঠামো ×২৩ (EJS-compile-সহ) + SSR ×৪ (রেন্ডার্ড-HTML-প্রত্যাশা: সারি ৪৩/চিপ ৫/quiz ১১ — অন্য-সারি-উপস্থিতিতেও নির্ধারক) + E2E ×১৭ (pressed-স্থানান্তর দুই-দিক + clear/Escape-পথ-সিঙ্ক + ফোকাস-চুরি-শূন্য + AND-কম্বো + শূন্য-অবস্থা + hScroll-শূন্য + স্ক্রিনশট ×২); পূর্ণ-রিগ্রেশন **s260-s296 ৩৮-সুইট সব-গ্রিন** (scripts/s296-regression.sh; ছোট-চাঙ্ক ১৩+৭+৪+৪+৪+৪+২ — s281-ক্ষণস্থায়ী-ফেল→পুনঃরান ৩৯/০) + role-policy ২৬০/২৬০ + guard:design + audit:views (১২২ ejs); প্যাচ s296-patch.py idempotent ×২।
- **গোটচা ×৩:** বাশ-ডিসপ্লে-[h-ম্যানগলিং (od -c-সত্য-বাইট — অ্যাঙ্কর-সোর্স-শৃঙ্খলা) · eval-নেস্টেড-কোট-নিষিদ্ধ (আনকোটেড-অ্যাট্রি-সিলেক্টর) + grep -o-ফ্র্যাগমেন্ট-প্রেক্ষাপট-হারানো (সারি-grep) · রিগ্রেশন-রানার-ওয়েজ-প্রোটোকল (ছোট-চাঙ্ক + ডেমন-প্রোব + ক্ষণস্থায়ী-ফেল-পুনঃরান) — বিস্তারিত PLANS session296b।
- **পরের-এজেন্ট: session297 (Task ID 137)** — PLANS session296-নোট পড়ুন; push-আগে fetch+rebase; প্রস্তাব: home-leadership/sections-ফিল্টার (cej294-প্যাটার্ন), multipart-ই২ই (press-ফর্ম), page-count-ব্যাজ (গেটেড), body+21px-overflow-তদন্ত, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''

insert_before(WORKLOG, '', S296_WORKLOG, 'Task ID 136b / session296b', append_tail=True)
print('══ s296-docs: সম্পন্ন ══')
