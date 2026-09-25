#!/usr/bin/env python3
# s337-docs.py — session337 ডক-ত্রয়ী (PROJECT §৩৩৭ + PLANS session337-নোট + repo-worklog Task 174)
# Idempotent ×২-চুক্তি (s336-রীতি): idempotency-চেক-স্ট্রিং = সন্নিবেশ-পাঠ-থেকেই-উদ্ধৃত।
import io, os, sys

ROOT = os.environ.get('LEKHOK_ROOT', '/home/z/lekhok-forum/lekhok-forum')
APP = os.path.join(ROOT, 'lekhok-forum')
PROJ = os.path.join(APP, 'PROJECT.md')
PLANS = os.path.join(APP, 'PLANS.md')
WLOG = os.path.join(ROOT, 'worklog.md')

def load(p):
    with io.open(p, encoding='utf-8') as f: return f.read()

def save(p, s):
    with io.open(p, 'w', encoding='utf-8') as f: f.write(s)

def insert_once(path, text, anchor, before=True, name=''):
    s = load(path)
    probe = text.strip().splitlines()[0]
    if probe in s:
        print(f"  skip {name} (already-applied)")
        return 0
    if anchor not in s:
        print(f"  FAIL {name} (anchor-missing)")
        sys.exit(1)
    s = s.replace(anchor, (text + anchor) if before else (anchor + text), 1)
    save(path, s)
    print(f"  ok   {name}")
    return 1

PROJECT_337 = """## §৩৩৭ (session337 — cron 403679: hr337 রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ sessionStorage-replay + sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন) — s337 ৫০/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr337 — রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ (PLANS session336-নোটের প্রস্তাব-②-প্রথম-বিকল্প):** admin/home-reorder.ejs (hr336-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) — **q333h.setHint/setHints-পাবলিক-API-চেইন-মোড়ক** (regOrig334-চেইন-রীতি): সফল-প্রয়োগের-পরে **persist337()** — রেজিস্ট্রি-স্ন্যাপশট (সর্ব-রো [0]→[2] — অ-শূন্য-হিন্ট-কেবল — **{fmt}-RAW-অরেজলভড-সংরক্ষণ** — পুনঃপ্রয়োগে-কল-টাইম-মোড-রেজলভ) sessionStorage `'hr337-hints'`-এ JSON-রূপে; শূন্য-মানচিত্রে removeItem (clean-state — clears-গণনা); **replay337()**: invalid-JSON/অ্যারে/অবজেক্ট-নয় = {} নিরাপদ-পাঠ — প্রতি-কী-তে setHint335-প্রতিনিধি (ত্রি-পথ-উত্তরাধিকার — rewrites/appends/misses-গণনা-স্বয়ংক্রিয়); **IIFE-সমাপ্তি-স্বয়ংক্রিয়-পুনঃপ্রয়োগ** (এক-বার — reload-পরবর্তী-সেট/ব্যাচ-হিন্ট-পুনঃপ্রয়োগ); sessionStorage-অনুপলব্ধ = নীরব-ব্যর্থতা (err-ক্যাপচার); **শ্রেণি-বিলম্ব-চুক্তি**: replay-সময়ে tip317=null → pending-পতাকা → **appendHint334-মোড়ক** (regOrig334-চেইন-রীতি — hr334-এক-উৎস-অ্যাপেন্ডার-উত্তরাধিকার) টিপ-নির্মাণে hr337-restored-শ্রেণি-প্রয়োগ (auto-replay-ডেটা-অটুট + টোন-টিপ-প্রস্তুতে-লাইভ — অ্যাপেন্ড-আচরণ/গণনা-অস্পৃশ্য); **স্ন্যাপশট-অর্থবিদ্যা**: persist = সর্ব-রেজিস্ট্রি-হিন্ট — reload-পরে অ-সংরক্ষিত-কী = স্ট্যাটিক-ডিফল্ট-ফেরত; QA-হুক-প্রতিনিধি (q335h.set/q336h.setHints) = স্থায়ীকরণ-বাইপাস-চুক্তি (পাবলিক-API-কেবল); ওভারলে-সারি-গণনা-অস্পৃশ্য; s324-স্ট্যাটিক-বেস-লাইন fresh-render-চুক্তি; `__hrAria337QA {saves, restores, misses, clears, pending, last, save(), load(), map(), clearStore(), hintOf(), line(), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত; s336/s335/s334/s333-হুক-সহাবস্থান-অটুট।

**[Mandatory-স্টাইল] sfs337 — পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন (admin-ইনলাইন):** home-reorder.ejs ইনলাইন-<style> session337-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral — **cascade-অবস্থান session336-ব্লক-পরে** — দ্বি-শ্রেণি-সহাবস্থানে restored-প্রাধান্য-চুক্তি) — `.hr317-tip .hr324-kbd.hr337-restored` গভীরতর-ব্র্যান্ড-টোন **২২%** (color-mix — var(--lf-brand-primary)) + **অতি-গাঢ়-টেক্সট rgba(6,95,70,0.95)**: kbd-র‍্যাম্প ৮→১৫→২২ (sfs335-বেস-৮% + sfs336-ব্যাচ-১৫%-এর-উপরে-ধাপ — র‍্যাম্প-সহাবস্থান-অসম্পৃক্ত); **কেবল-রঙ (background-color + color)** — geometry/প্যাডিং/বর্ডার-অস্পৃশ্য — বক্স-মডেল-অটুট; সর্ব-ব্যান্ড (media-query-শূন্য); transition-শূন্য; MO=৪-অটুট; style.css = session337/336-শূন্য (admin-CSS-চুক্তি-প্রমাণ)।

**টেস্ট:** নতুন tests/s337-suite.sh **৫০/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×১৬ + SSR ×৩ + hr337-ই২ই ×১৫ — হুক + বেস-টোন-০.০৮ + পাবলিক-setHint-স্থায়ীকরণ + reload-পুনঃপ্রয়োগ {hintOf + শ্রেণি + টোন-০.২২ + restores=১ + fresh-saves=০} + পাবলিক-ব্যাচ-RAW-স্ন্যাপশট + reload-ব্যাচ-পুনঃপ্রয়োগ {{fmt}-কল-টাইম-রেজলভ + literal-শূন্য} + শূন্য-মান-মানচিত্র-বিলোপ + স্থায়ী-ক্লিয়ার-অর্থবিদ্যা {ডিফল্ট-ফেরত} + দ্বি-শ্রেণি-ক্যাসকেড-প্রাধান্য {al=০.২২} + invalid-JSON-নিরাপদ + clearStore-ফ্রেশ + ওভারলে-৮-সারি + সর্ব-হুক-ত্রুটি-শূন্য; sfs337-মোবাইল ×২ — ৩৯০px ০.০৮→০.২২; পরিষ্কারণ-চুক্তি + নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s336 ৪৪ + s335 ৪১ + s334 ৫৭ + s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 ৪৩ + s307 ৫৫ + s306 ৫০ (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।

**গোটচা ×২ (নতুন — PLANS session337):** ① **প্রতি-reload-recipe-পুনঃপ্রয়োগ** — tip317 = ডাইনামিক-নির্মাণ (IIFE-সময়ে null) — reload-পরে টিপ-অনুপস্থিত — s337-প্রথম-রানে no-kbd ×বহু — **স্থায়ীকরণ-সুইটে reload-প্রতিবারে s334-গোটচা-①-রেসিপি (নির্বাচন + দ্বি-কপি + blur+focus) পুনঃপ্রয়োগ-বাধ্যতামূলক** (rld()-সহায়ক-রীতি) ② **শ্রেণি-বিলম্ব-চুক্তি** — auto-replay-IIFE-সময়ে tip317=null → সরাসরি-শ্রেণি-অসম্ভব → pending-পতাকা + appendHint334-মোড়ক (এক-উৎস-অ্যাপেন্ডার-উত্তরাধিকার) = টিপ-নির্মাণ-পথে-প্রয়োগ (উত্তরাধিকার-গোটচা ×৪-অটুট: কাউন্টার-ডেল্টা-assert + admin-style.css-অলোড + immutable-ক্যাশ + মোবাইল-রেসিপি)।

**প্রোড-স্পট (session336-প্রস্তাব-①-যাচাই — রাউন্ড-আরম্ভেই):** vercel home-200 + **session334-মার্কার ×২-লাইভ (style.css)** + epaper-200 + প্রোড-অ্যাডমিন = ৩০৭-রিডাইরেক্ট (cred-gated — session336-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত) = **a1d8c0c-ডিপ্লয়-প্রমাণ**।

"""

PLANS_337 = """
## Session 337 — hr337 রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ sessionStorage-replay + sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন (Task ID 174 — ২৫ সেপ্টেম্বর ২০২৬)

- **প্রয়োগ (session336-নোটের প্রস্তাব-②-প্রথম-বিকল্প):** ① **প্রোড-স্পট** (রাউন্ড-আরম্ভেই): vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭ (cred-gated — session336-মার্কার-পাবলিক-শূন্য-প্রত্যাশিত) = a1d8c0c-ডিপ্লয়-প্রমাণ ② **hr337** (admin/home-reorder.ejs — hr336-IIFE-অভ্যন্তরে-সম্প্রসারণ): q333h.setHint/setHints-পাবলিক-API-চেইন-মোড়ক (regOrig334-রীতি) → persist337() — রেজিস্ট্রি-স্ন্যাপশট sessionStorage 'hr337-hints'-এ ({fmt}-RAW — শূন্য-মানচিত্রে removeItem); replay337() — invalid-JSON-নিরাপদ — প্রতি-কী-তে setHint335-প্রতিনিধি; IIFE-সমাপ্তি-স্বয়ংক্রিয়-পুনঃপ্রয়োগ; শ্রেণি-বিলম্ব-চুক্তি (tip317-null → pending → appendHint334-মোড়কে-টিপ-নির্মাণে-প্রয়োগ); স্ন্যাপশট-অর্থবিদ্যা (অ-সংরক্ষিত-কী = ডিফল্ট-ফেরত); QA-হুক-প্রতিনিধি-বাইপাস; __hrAria337QA {saves, restores, misses, clears, pending, last, save(), load(), map(), clearStore(), hintOf(), line(), err} ③ **sfs337** (home-reorder.ejs ইনলাইন-<style> session337-ব্লক — cascade-অবস্থান session336-পরে): .hr324-kbd.hr337-restored গভীরতর-টোন ২২% + অতি-গাঢ়-টেক্সট ০.৯৫ (kbd-র‍্যাম্প ৮→১৫→২২ — color-mix+rgba — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট) ④ **[Mandatory-স্টাইল]** ব্লক হেক্স-শূন্য + layout-neutral-assert।
- **টেস্ট:** নতুন tests/s337-suite.sh **৫০/০/০ ×২-ধারাবাহিক** + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s336→s306 ২৮-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ scripts/s337-patch.py idempotent ×২ (২-ধাপ — JS+CSS উভয়ে-ইনলাইন)। **পরিষ্কারণ-চুক্তি (নতুন):** সুইট-শেষে hr337-hints-পরিষ্কারণ + যাচাই (পরবর্তী-সুইটে-ফ্রেশ-লোড — রিগ্রেশন-সহাবস্থান — s336-ফ্রেশ-টোন-assert-রক্ষা)।
- **গোটচা ×২ (নতুন):** ① **প্রতি-reload-recipe-পুনঃপ্রয়োগ** — tip317-ডাইনামিক-নির্মাণ — reload-পরে টিপ-অনুপস্থিত (no-kbd) — reload-প্রতিবারে s334-গোটচা-①-রেসিপি-পুনঃপ্রয়োগ-বাধ্যতামূলক (rld-সহায়ক) ② **শ্রেণি-বিলম্ব-চুক্তি** — auto-replay-IIFE-সময়ে tip317=null → pending-পতাকা + appendHint334-মোড়ক (regOrig334-চেইন-রীতি — এক-উৎস-অ্যাপেন্ডার) = টিপ-নির্মাণে-শ্রেণি-প্রয়োগ (ডেটা-স্থায়িত্ব-আলাদা — টোন-টিপ-প্রস্তুতে-লাইভ)। উত্তরাধিকার ×৪-অটুট (কাউন্টার-ডেল্টা + admin-style.css-অলোড + immutable-ক্যাশ + মোবাইল-রেসিপি)।
- **session336-নোটের প্রস্তাব-①-পূর্ণ** (sfs336/hr336-প্রোড-স্পট — cred-gated-রীতি-যাচাই) + **csv-চতুর্থ-মোড = অপ্রয়োগিত-অপরিবর্তিত** (সুইট-বিবর্তন-ব্যয়-উচ্চ) + **setHints-রিপোর্টার (getHints()) = অপ্রয়োগিত** (৩য়-বিকল্প — পরবর্তী-রাউন্ডের-জন্য-মুক্ত) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪); রাউন্ড-আরম্ভে রিমোট-ব্রাঞ্চ-নোটিশ (`feat/feed-motion-scene-premium` — তাদের-ওয়ার্কস্পেস — অস্পৃশ্য)।
- **পরের-এজেন্ট: session338 (Task ID 175)।** বাকি-প্রস্তাব: ① sfs337/hr337-প্রোড-স্পট (HTTP-পাঠ — প্রোড-অ্যাডমিন-ক্রেড-গেটেড-রীতি — session337-ইনলাইন-মার্কার = admin-HTML-অনুপস্থিত-পাবলিক-পাঠে — ফিড-সাইড-মার্কার-শূন্য-ই-প্রত্যাশিত) ② hr338 (admin): setHints-রিপোর্টার (getHints()-রিড-API — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ — session336-নোটের-৩য়-বিকল্প) অথবা হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন (q337h.clearStore-UI-প্রকাশ — hr337-চুক্তি-প্রসারিত) অথবা ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) ③ sfs338 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_174 = """
## Task 174 — session337: hr337 রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ sessionStorage-replay + sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251304`); রাউন্ড-আরম্ভে HEAD=origin=`a1d8c0c` (session336), clean-tree, BEHIND=০; agent-browser-QA বেসলাইন সবুজ (s336-সুইট ৪৪/০/০) + **প্রোড-স্পট** (vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated = a1d8c0c-ডিপ্লয়-প্রমাণ — PLANS session336-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session336-নোটের **প্রস্তাব-②-প্রথম-বিকল্প গ্রহণ** (হিন্ট-স্থায়ীকরণ — sessionStorage-replay; setHints-রিপোর্টার = পরবর্তী-রাউন্ডের-জন্য-মুক্ত; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr337 (admin/home-reorder.ejs — hr336-IIFE-অভ্যন্তরে):** q333h.setHint/setHints-পাবলিক-API-চেইন-মোড়ক → persist337() — রেজিস্ট্রি-স্ন্যাপশট ({fmt}-RAW — শূন্য-মানচিত্রে removeItem) sessionStorage 'hr337-hints'-এ; replay337() — invalid-JSON-নিরাপদ — প্রতি-কী-তে setHint335-প্রতিনিধি; IIFE-সমাপ্তি-স্বয়ংক্রিয়-পুনঃপ্রয়োগ (reload-পরবর্তী-হিন্ট-পুনঃপ্রয়োগ); শ্রেণি-বিলম্ব-চুক্তি (tip317-null → pending → appendHint334-মোড়কে-টিপ-নির্মাণে-প্রয়োগ); স্ন্যাপশট-অর্থবিদ্যা + QA-হুক-প্রতিনিধি-বাইপাস; __hrAria337QA {saves, restores, misses, clears, pending, last, save(), load(), map(), clearStore(), hintOf(), line(), err}।
- **[Mandatory-স্টাইল] sfs337 (home-reorder.ejs ইনলাইন-<style> session337-ব্লক — cascade-অবস্থান session336-পরে):** .hr317-tip .hr324-kbd.hr337-restored গভীরতর-ব্র্যান্ড-টোন ২২% + অতি-গাঢ়-টেক্সট rgba(6,95,70,0.95) (kbd-র‍্যাম্প ৮→১৫→২২ — color-mix — হেক্স-শূন্য — কেবল-রঙ — layout-neutral — সর্ব-ব্যান্ড-এক-মান — transition-শূন্য — MO=৪-অটুট); style.css = session337/336-শূন্য (admin-CSS-চুক্তি)।
- **টেস্ট:** tests/s337-suite.sh ৫০/০/০ ×২-ধারাবাহিক + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s336→s306 ২৮-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ s337-patch.py idempotent ×২ (২-ধাপ)। পরিষ্কারণ-চুক্তি (নতুন): সুইট-শেষে hr337-hints-পরিষ্কারণ + যাচাই (পরবর্তী-সুইট-ফ্রেশ-লোড-রক্ষা)। গোটচা ×২ নতুন ডক-কৃত (PLANS session337): ① প্রতি-reload-recipe-পুনঃপ্রয়োগ (tip317-ডাইনামিক — reload-পরে no-kbd — rld-সহায়ক-রীতি) ② শ্রেণি-বিলম্ব-চুক্তি (pending + appendHint334-মোড়ক — টিপ-নির্মাণে-প্রয়োগ); উত্তরাধিকার-গোটচা ×৪-অটুট।
- **ডক-ত্রয়ী:** PROJECT §৩৩৭ + PLANS session337-নোট + repo-worklog Task 174 (s337-docs.py idempotent ×২)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_337, '## §৩৩৬ (session336', before=True, name='PROJECT-§৩৩৭')
    s = load(PLANS)
    probe = PLANS_337.strip().splitlines()[0]
    if probe not in s:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_337)
        print("  ok   PLANS-session337 (append)")
        n += 1
    else:
        print("  skip PLANS-session337 (already-applied)")
    s = load(WLOG)
    probe = WLOG_174.strip().splitlines()[0]
    if probe not in s:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_174)
        print("  ok   WLOG-Task174 (append)")
        n += 1
    else:
        print("  skip WLOG-Task174 (already-applied)")
    print(f"s337-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
