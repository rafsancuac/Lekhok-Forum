#!/usr/bin/env python3
# s295-docs.py — session295 ডক ×৩ (idempotent — মার্কার-গার্ড-প্রথম)
# ① PROJECT.md: §২৯৫ এন্ট্রি (প্রথম §২৯৪-এর আগে — newest-first অঞ্চল)
# ② PLANS.md: session295-নোট (প্রথম session294-নোট-এর আগে)
# ③ worklog.md (রিপো): Task ID 135 এন্ট্রি (ফাইল-শেষে append)
import io, sys, os

APP = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.dirname(APP))
PROJECT = 'PROJECT.md'
PLANS = 'PLANS.md'
WORKLOG = 'worklog.md'

S295_PROJECT = '''## §২৯৫ (session295 — cron 403679: ই-পেপার কুইক-সুইচ স্ট্রিপ মিনি-থাম্ব + ←/→ কীবোর্ড-নেভ ep295 — ep294-স্ট্রিপ-বিস্তার) — s295 ৩১/৩১ ×২ (২৪ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`9997114` (session294-dual, clean-tree); রাউন্ড-শুরু QA: লোকাল-সার্ভার হেলদি + epaper-পেলোড-শূন্য-ঘাটতি স্বীকৃত → s280-সিডার সার্ভার-বন্ধে-চালিত (৫-সারি) → s294-strip ১৯/১৯/০ পূর্ণ-সবুজ-বেসলাইন — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **প্রস্তাব-নির্বাচন (পূর্ব-সেশন-প্রস্তাব-পুনঃস্কোপিং):** PLANS session294-তালিকার ①+② (প্রতি-পিল মিনি-থাম্ব + ←/→ কীবোর্ড-নেভ) — ①-এর epaperThumbByName291-পুনঃব্যবহার-শর্ত স্কিমা-যাচাইয়ে **উত্তরাধিকার-সিদ্ধান্ত**: /epaper-সারফেসে payload-প্রতি-সারিতেই নিজস্ব থাম্বনেইল-চেইন (thumbs: টেলিগ্রাম-প্রক্সি→ড্রাইভ) আছে → **row-native data > নাম-ম্যাপ** (মিসম্যাচ-অসম্ভব-কনস্ট্রাকশন; নাম-ম্যাপ = home-রিডার-সারফেস-সীমাবদ্ধ) — কারণসহ PLANS-এ লিপিবদ্ধ।

**[Mandatory-ফিচার] ep295:** epaper.ejs-এ দ্বৈত-সংযোজন — ① **প্রতি-পিল মিনি-থাম্ব**: কন্ডিশনাল-স্প্যান (`p.thumbs && p.thumbs.length` — শূন্য-চেইনে স্প্যান-ই-নেই = টেক্সট-অনলি-পূর্বাবস্থা) + aria-hidden (নাম-ই-SR) + img-id-শূন্য (duplicate-id-নিরাপদ) + loading=lazy/decoding=async + **capture-ফেজ-এরর-লিসনার** (error non-bubbling → স্ট্রিপে capture-ফেজে শোনা; লোড-ব্যর্থতায় স্প্যান hidden — ভাঙা-ছবি-কখনো-নয়; ep292-প্যাটার্ন-মিরর) ② **←/→ কীবোর্ড-নেভ**: স্ট্রিপ-স্কোপড keydown (বাইন্ডিং-স্কোপই-ফিল্ড-গার্ড — স্ট্রিপ-বহির্ভূত-ফোকাসে-হস্তক্ষেপ-শূন্য) + ফোকাস-পিলে-থাকলে ±১-mod-n-wrap (ArrowRight/ArrowLeft) + **next.focus()+next.click()** = নেটিভ-সিলেক্টর change-চেইন-পুনঃব্যবহার (একক-ফানেল — date-aware সর্বশেষ-সংখ্যা-ফলব্যাক ফ্রি; PLANS session294-পিল-পুনঃব্যবহার-প্যাটার্ন-অনুসরণ) + preventDefault-স্ক্রল-গার্ড + **__epStrip295QA হুক** (pills/thumbs/thumbsHidden/imgs/keynav — সারফেস-শূন্যে-ও-সংজ্ঞায়িত)।

**[Mandatory-স্টাইল]:** epaper.css session295-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — .ep-strip294-thumb ২২×৩০ (var(--radius-sm) + var(--lf-ui-border)-বর্ডার + var(--lf-brandgreen-soft-3)-পটভূমি + object-fit-cover + shrink-0) + সক্রিয়-পিল-থাম্ব-অ্যাকসেন্ট (border-color var(--lf-white) + color-mix-in-srgb-রিং) + **hidden-গার্ড বাইট-সঠিক** (.ep-strip294-thumb[hidden] display:none !important — display:inline-flex-ওভাররাইড-প্রতিরোধ) + **focus-visible-রিং** (outline ২px var(--lf-brand-primary) offset-২px — কীবোর্ড-নেভ-সামন্বয়; সক্রিয়-পিলে var(--lf-white)) + reduced-motion-সম্মান + 640px-সংকোচন ১৮×২৪; ep294-ব্লক-অক্ষুণ্ণ।

**টেস্ট:** নতুন tests/s295-stripkeys-suite.sh **৩১/৩১ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১২ — মার্কআপ/লিসনার-জুড়/wrap-লাইন/হুক/CSS-ব্লক/hidden-গার্ড-বাইট/focus-visible/হেক্স-শূন্য-বিস্তার/no-reg ×৪; SSR ×৩ — **প্রত্যাশা-গণনা data-papers-JSON-থেকে নাম-ডিডুপ-মডেল**; E2E ×১৩ — বুট-হুক p/t/i=SSR + লুকানো≤থাম্ব-চুক্তি + ArrowRight/ArrowLeft/wrap সমতা-বুলিয়ান-প্যাটার্ন + ফিল্ড-গার্ড (#epPs282Btn) + error-capture + ফ্রেশ-লোড + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) — সিড-নেট-শূন্য + **পূর্ণ-রিগ্রেশন s260-s295 (৩৭-সুইট সব-গ্রিন — রানার scripts/s295-regression.sh; চাঙ্ক ১৩+১২+১২)** + role-policy **২৬০/২৬০** + guard:design + audit:views (৯২ ejs)-গ্রিন; প্যাচ: scripts/s295-stripkeys-patch.py (idempotent ×২, মার্কার-গার্ড-প্রথম, অ্যাঙ্কর-এককতা-FATAL, ইউনিক-লাইন-অ্যাসার্ট, বাইট-ক্রম button→thumb→dot, পোস্ট-অ্যাসার্ট+hidden-গার্ড-বাইট+হেক্স-শূন্য+no-reg ×৭+EJS-compile)।

**গোটচা ×৩ (PLANS session295):** ① **নাম-ডিডুপ-প্রত্যাশা-মডেল** — payload-দৈর্ঘ্য ≠ স্ট্রিপ-পিল-সংখ্যা (s280-সিডে ৫-সারি→৪-পিল) → প্রত্যাশা-গণনায় নাম-ডিডুপ (প্রথম-উপস্থিতি=সর্বশেষ-সংখ্যা) ② **display:none-সিলেক্ট-ফোকাস-অক্ষম** — s282-কম্বো-যুগে #epPaperSelect display:none → focus() নীরব-ব্যর্থ → ফিল্ড-গার্ড-প্রোবে দৃশ্যমান-কন্ট্রোল (#epPs282Btn) ③ **fake-fid-সর্বলুকানো-বুট** — s280-FAKE-ফিডে সর্ব-থাম্ব-লোড-ব্যর্থ = সঠিক-ফলব্যাক → h≤t-চুক্তি + error-capture-এ w.hidden=false-দৃশ্যমান-করে-dispatch (DOM-স্থানীয়, DB-অস্পৃশ্য)।

'''

S295_PLANS = '''## session295-নোট (cron 403679 — স্ট্রিপ মিনি-থাম্ব + কীবোর্ড-নেভ ep295)
- **প্রস্তাব-পুনঃস্কোপিং (session294-প্রস্তাব-①):** epaperThumbByName291-পুনঃব্যবহার-প্রস্তাব **বাতিল — কারণসহ**: /epaper-সারফেসে payload-প্রতি-সারিতেই নিজস্ব thumbs-চেইন আছে (টেলিগ্রাম-প্রক্সি→ড্রাইভ — সারি-নিজস্ব-ডেটা) → row-native উৎস নাম-ম্যাপ-অপেক্ষা কড়া (মিসম্যাচ-অসম্ভব-কনস্ট্রাকশন); নাম-ম্যাপ = home-রিডার-সারফেস-সীমাবদ্ধ (epk291/ep292)। ভবিষ্যৎ-থাম্ব-সারফেসে প্রথমে যাচাই: **সারি-নিজস্ব-থাম্ব-আছে-কি?**
- **নাম-ডিডুপ-প্রত্যাশা-মডেল (নতুন — প্রত্যাশা-গণনা-শ্রেণি):** ep294-স্ট্রিপ = নাম-ডিডুপ (প্রথম-উপস্থিতি — DESC-বাছাই-পূর্ব → সর্বশেষ-সংখ্যা) → **payload-দৈর্ঘ্য ≠ পিল-সংখ্যা** (s280-সিডে ৫-সারি→৪-পিল — প্রথম-রানে ধরা-পড়ে) → data-papers-JSON-প্রত্যাশা-গণনায় নাম-ডিডুপ-মডেল বাধ্যতমূলক; পিল-প্রতি-গুণাবলী (thumbs ইত্যাদি) ও ডিডুপ-রক্ষিত-সারি-থেকেই।
- **display:none-সিলেক্ট-ফোকাস-অক্ষম (নতুন — ফিল্ড-গার্ড-প্রোব-শ্রেণি):** s282-কম্বো-যুগে #epPaperSelect display:none → .focus() নীরব-ব্যর্থ (activeElement-অপরিবর্তিত) → 'ফোকাস-চুরি-শূন্য'-প্রোবে **দৃশ্যমান-কন্ট্রোল** ব্যবহার (#epPs282Btn — স্ট্রিপ-বহির্ভূত); মূল্য-দর্শন: dispatch-ফোকাস-গোটচার (session293) সম্প্রসারণ — ফোকাস-অক্ষম-উপাদানে-প্রোব = মিথ্যা-ফেল।
- **fake-fid-সর্বলুকানো-বুট-চুক্তি (নতুন — থাম্ব-সুইট-শ্রেণি):** s280-সিড-ফিড FAKE (বৈধ-ফরম্যাট-অবৈধ-আইডি) → সর্ব-থাম্ব-লোড-ব্যর্থ → h=t স্বাভাবিক (ভাঙা-ছবি-কখনো-নয়-নীতির সঠিক-ফল) → boot-অ্যাসার্ট **h≤t** (h=০ নয়); error-capture-প্রমাণে w.hidden=false-দৃশ্যমান-করে-synthetic-dispatch (DOM-স্থানীয়-মিউটেশন, DB-অস্পৃশ্য, ফ্রেশ-লোডে-স্বয়ং-পুনঃপ্রতিষ্ঠা)।
- **শেয়ার্ড-প্যাটার্ন-সর্ব-ফাইল-গণনা-নিষিদ্ধ (পুনঃপ্রমাণিত):** প্যাচ-অ্যাসার্টে 'ArrowRight'-জাতীয় শেয়ার্ড-প্যাটার্ন সর্ব-ফাইল-গণনা FATAL-মিথ্যা-ফেল (s285-calkey-পূর্ব-উপস্থিতি) → **ইউনিক-সম্পূর্ণ-লাইন** অ্যাসার্ট (গার্ড-লাইন + wrap-লাইন) — session293-এর HTML-grep-ওভারকাউন্ট-পরিবারের সোর্স-স্তর-ভাই।
- **ep295-সারফেস-চুক্তি:** হুক **__epStrip295QA** (pills/thumbs/thumbsHidden/imgs/keynav — সারফেস-শূন্যে-ও-সংজ্ঞায়িত); কীবোর্ড-সক্রিয়করণ = **next.click()-পুনঃব্যবহার** (নেটিভ-সিলেক্টর change-চেইন — একক-ফানেল; নতুন-সুইচ-পথ syncPaperSelect-দিয়ে-গেলে স্ট্রিপ-স্বয়ং-সঠিক — session294-চুক্তির-উত্তরাধিকার); এরর-লিসনার = **capture-ফেজ** (non-bubbling-error — ep292-নীতি); hidden-গার্ড = display:inline-flex-সেটার-সাথে-বাধ্যতমূলক-জোড়।
- **পরের-এজেন্ট: session296 থেকে (worklog Task ID 136)।** **ফিচার-কোড-লেখার-আগেই fetch** + push-আগে পুনঃ-fetch+rebase + রিবেজ-পরবর্তী guard:design-পুনঃরান + রাউন্ড-শেষে PNG-চার্ন-রিভার্ট (tests/*.png tracked-M-শুধু); PLANS session295 + session294 + session293 + session292 + session291 পড়ুন; বাকি-প্রস্তাব: **daily-স্ট্যাটিক-চিপ→ক্লিকেবল-ফ্যাসেট** (dcf293-সম্প্রসারণ — /admin/daily টাইপ-চিপ ক্লিকে ফিল্টার-প্রি-সেট), home-leadership.ejs/sections.ejs-ফিল্টার (cej294-রানটাইম-ইনডেক্স-প্যাটার্ন), multipart-ব্রাউজার-পাথ-ই২ই (press-ফর্ম রিয়েল-ফাইল-আপলোড — s258-হেডার-চুক্তি), page-count-ব্যাজ (গেটেড — epaper-bot-স্তরে কলাম-যোগ-হলে), পৃষ্ঠা-স্তর body+21px-overflow-উৎস-তদন্ত, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।

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


insert_before(PROJECT, '## §২৯৪ (session294 — cron 403679: কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294', S295_PROJECT, '## §২৯৫ (session295')
insert_before(PLANS, '## session294-নোট (cron 403679 — কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294)', S295_PLANS, '## session295-নোট')

S295_WORKLOG = '''## Task ID 135 / session295 (cron 403679 — ই-পেপার স্ট্রিপ মিনি-থাম্ব + ←/→ কীবোর্ড-নেভ ep295)

- **অবস্থা/লক্ষ্য:** HEAD=origin=`9997114` (session294-dual) — স্থিতিশীল; PLANS session294-প্রস্তাব ①+② গ্রহণ (প্রতি-পিল মিনি-থাম্ব + কীবোর্ড-নেভ); ①-পুনঃস্কোপিং: epaperThumbByName291-বাদ → **row-native payload.thumbs** (মিসম্যাচ-অসম্ভব — কারণসহ PLANS-এ)।
- **পরিবর্তন:** epaper.ejs — কন্ডিশনাল-থাম্ব-স্প্যান (aria-hidden + img-id-শূন্য + lazy) + capture-ফেজ-এরর-লিসনার (ভাঙা-ছবি-কখনো-নয় — ep292-মিরর) + স্ট্রিপ-স্কোপড keydown ←/→ (±১-mod-n-wrap; next.focus()+next.click() = change-চেইন-একক-ফানেল; বহির্ভূত-ফোকাসে-হস্তক্ষেপ-শূন্য) + __epStrip295QA হুক ×৫; epaper.css session295-ব্লক — হেক্স-শূন্য টোকেন-শুধু (thumb ২২×৩০ → ৬৪০px-এ ১৮×২৪ + সক্রিয়-অ্যাকসেন্ট color-mix + hidden-গার্ড !important + focus-visible-রিং + reduced-motion)।
- **যাচাই:** tests/s295-stripkeys-suite.sh **৩১/৩১ ×২ (SKIP=০)** — কাঠামো ×১২ + SSR ×৩ (data-papers-JSON নাম-ডিডুপ-মডেল: ৫-সারি→৪-পিল) + E2E ×১৩ (ArrowRight/Left/wrap + ফিল্ড-গার্ড #epPs282Btn + error-capture + ফ্রেশ-লোড + hScroll-শূন্য + স্ক্রিনশট ×২); পূর্ণ-রিগ্রেশন **s260-s295 ৩৭-সুইট সব-গ্রিন** (scripts/s295-regression.sh; চাঙ্ক ১৩+১২+১২) + role-policy ২৬০/২৬০ + guard:design + audit:views (৯২ ejs); প্যাচ s295-stripkeys-patch.py idempotent ×২।
- **গোটচা ×৩:** নাম-ডিডুপ-প্রত্যাশা-মডেল (payload-দৈর্ঘ্য≠পিল) · display:none-সিলেক্ট-ফোকাস-অক্ষম (দৃশ্যমান-কন্ট্রোল-প্রোব) · fake-fid-সর্বলুকানো-বুট (h≤t; দৃশ্যমান-করে-dispatch) — বিস্তারিত PLANS session295।
- **পরের-এজেন্ট: session296 (Task ID 136)** — PLANS session295-নোট পড়ুন; push-আগে fetch+rebase; প্রস্তাব: daily-চিপ→ক্লিকেবল-ফ্যাসেট (dcf293-সম্প্রসারণ), home-leadership/sections-ফিল্টার, multipart-ই২ই, page-count-ব্যাজ (গেটেড), body+21px-overflow-তদন্ত, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
'''

insert_before(WORKLOG, '', S295_WORKLOG, 'Task ID 135 / session295', append_tail=True)
print('══ s295-docs: সম্পন্ন ══')
