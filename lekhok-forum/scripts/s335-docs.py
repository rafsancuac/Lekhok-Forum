#!/usr/bin/env python3
# s335-docs.py — session335 ডক-ত্রয়ী (PROJECT §৩৩৫ + PLANS session335-নোট + repo-worklog Task 172)
# Idempotent ×২-চুক্তি (s333-গোটচা-③): idempotency-চেক-স্ট্রিং = সন্নিবেশ-পাঠ-থেকেই-উদ্ধৃত।
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

PROJECT_335 = """## §৩৩৫ (session335 — cron 403679: hr335 রেজিস্ট্রি-হিন্ট-সম্পাদনা-API setHint + sfs335 kbd-লাইন-ব্র্যান্ড-টোন) — s335 ৪১/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr335 — রেজিস্ট্রি-হিন্ট-সম্পাদনা-API (PLANS session334-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প):** admin/home-reorder.ejs (hr334-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) — **q333h.setHint(k, h)**: register-পরিবার-সম্প্রসারণ — এক-কল-হিন্ট-সম্পাদনা (hr334-চুক্তি-প্রসারিত) — রেজিস্ট্রি-রো-[2]-মিউটেশন + kbd-লাইন-লাইভ-সিঙ্ক (দ্বি-সাইট — নিবন্ধন-দ্বি-সাইট-রীতির সম্পাদনা-প্রতিপাদ্য); **লাইন-সিঙ্ক-ত্রি-পথ**: ①পুরাতন-উপস্থিত+নতুন-উপস্থিত = split-join-সর্ব-উপস্থিতি in-place-পুনঃলেখন (s333-গোটচা-②-রীতি — rewrites-গণনা) ②পুরাতন-শূন্য+নতুন-উপস্থিত = appendHint334-প্রতিনিধি (অ্যাপেন্ড-পথ — q334h.appends-সহ-গণনা) ③নতুন-শূন্য = ' · '+পুরাতন-অপসারণ (ক্লিয়ার-পথ); **{fmt}-টেমপ্লেট-সমর্থিত** (hintOf334-কল-টাইম-রেজলভ — মোড-সচেতন-অটুট); চক্র-পরবর্তী kbdLine334()-পুনঃনির্মাণ = রেজিস্ট্রি-থেকে-স্বয়ংক্রিয়-স্থায়িত্ব (live==line()-চুক্তি-সংরক্ষণ); ওভারলে-বর্ণনা-[1]-অস্পৃশ্য + ওভারলে-পুনঃনির্মাণ-শূন্য (mkLi330-হিন্ট-অরেন্ডার-প্রমাণ); অজানা-কী = false + misses-গণনা; s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; `__hrAria335QA {sets, misses, rewrites, appends, last, set(), hintOf(), line(), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত; s334/s333-হুক-সহাবস্থান-অটুট।

**[Mandatory-স্টাইল] sfs335 — kbd-লাইন-ব্র্যান্ড-টোন (admin-ইনলাইন):** home-reorder.ejs ইনলাইন-<style> session335-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral) — `.hr317-tip .hr324-kbd` বেস-ব্র্যান্ড-টোন ৮% (color-mix — var(--lf-brand-primary) — tokens.css-লোডেড): হিন্ট-লাইন-সনাক্তযোগ্যতা (ত্রি-মোড-চক্রেও-স্থায়ী — hr335-setHint-পুনঃলেখনেও-অটুট — textContent-সম্পাদনা-শৈলী-অসম্পৃক্ত); **কেবল-রঙ (background-color)** — geometry/প্যাডিং/বর্ডার-অস্পৃশ্য — বক্স-মডেল-অটুট; সর্ব-ব্যান্ড (media-query-শূন্য — ডেস্ক+মোবাইল-এক-মান); α=০.০৮ (পূর্ব-র‍্যাম্প ১৮/২৪/২৮/৩৪/৪২/৫০%-সহাবস্থান-অসম্পৃক্ত); transition-শূন্য (s315-নিরাপদ); MO=৪-অটুট। **গোটচা-③-সংশোধন**: প্রথম-প্রয়োগ style.css-এ-ছিল → e2e-ব্যর্থতা → **admin-পৃষ্ঠা style.css-লোড-করে-না** (fonts/tokens/admin/premium + EJS-ইনলাইন-<style>-ই-লোড) → প্যাচ-পর্বেই style.css-রোলব্যাক + ইনলাইন-স্থানান্তর (সুইটে রোলব্যাক-প্রমাণ-assert)।

**টেস্ট:** নতুন tests/s335-suite.sh **৪১/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×১৫ — setHint-API + ত্রি-পথ + কাউন্টার-চতুষ্টয় + মোড়ক-গঠন-অটুট ×২ + node --check + ইনলাইন-ব্লক হেক্স-শূন্য/মার্কার ×২/টোন-৮%/layout-neutral + style.css-রোলব্যাক-প্রমাণ + MO=৪; SSR ×৩; hr335-ই২ই ×১২ — হুক + অজানা-কী-miss + ডেস্ক-টোন α=0.08 (ফরম্যাট-নিরপেক্ষ-পার্স) + প্রি-সেট live==line + in-place-পুনঃলেখন + {fmt}-সেট + ক্লিয়ার-পথ + অ্যাপেন্ড-পথ (rows ৮→৯) + চক্র-পরবর্তী-স্থায়িত্ব + ওভারলে-৯-সারি + সর্ব-হুক-ত্রুটি-শূন্য; sfs335-মোবাইল ×২ — ৩৯০px-টোন α=0.08; নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s334 ৫৭ + s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 + s307 + s306 ৫০ (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।

**প্রোড-স্পট (session334-প্রস্তাব-①-যাচাই — রাউন্ড-আরম্ভেই):** vercel home-200 + **session334-মার্কার ×২ + keynav-৩৪%-রুল ×২-লাইভ (style.css)** + epaper-200 = **b9f5e86-ডিপ্লয়-প্রমাণ**; প্রোড-অ্যাডমিন = প্রকৃত-অ্যাকাউন্ট-গেট (অপরিবর্তিত)।

"""

PLANS_335 = """
## Session 335 — hr335 রেজিস্ট্রি-হিন্ট-সম্পাদনা-API setHint + sfs335 kbd-লাইন-ব্র্যান্ড-টোন (Task ID 172 — ২৫ সেপ্টেম্বর ২০২৬)

- **প্রয়োগ (session334-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প):** ① **প্রোড-স্পট** (রাউন্ড-আরম্ভেই): vercel home-200 + session334-মার্কার ×২ + keynav-৩৪%-রুল ×২-লাইভ + epaper-200 = b9f5e86-ডিপ্লয়-প্রমাণ ② **hr335** (admin/home-reorder.ejs — hr334-IIFE-অভ্যন্তরে-সম্প্রসারণ): q333h.setHint(k, h) — register-পরিবার-সম্প্রসারণ — রেজিস্ট্রি-রো-[2]-মিউটেশন + kbd-লাইন-লাইভ-সিঙ্ক (দ্বি-সাইট); লাইন-সিঙ্ক-ত্রি-পথ (split-join-পুনঃলেখন / appendHint334-প্রতিনিধি / ক্লিয়ার-অপসারণ); {fmt}-টেমপ্লেট-সমর্থিত; ওভারলে-[1]-অস্পৃশ্য + পুনঃনির্মাণ-শূন্য; অজানা-কী = false + misses; live==line()-চুক্তি-সংরক্ষণ (চক্র-পরবর্তী kbdLine334()-স্থায়িত্ব); __hrAria335QA {sets, misses, rewrites, appends, last, set(), hintOf(), line(), err} ③ **sfs335** (home-reorder.ejs ইনলাইন-<style> session335-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral): .hr317-tip .hr324-kbd বেস-ব্র্যান্ড-টোন ৮% (color-mix — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট) ④ **[Mandatory-স্টাইল]** ব্লক হেক্স-শূন্য + layout-neutral-assert।
- **টেস্ট:** নতুন tests/s335-suite.sh **৪১/০/০ ×২-ধারাবাহিক** + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s334→s306 ২৬-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ scripts/s335-patch.py idempotent ×২ (৩-ধাপ — P2 = style.css-রোলব্যাক-সহ)।
- **গোটচা ×৩:** ① **admin-পৃষ্ঠা style.css-লোড-করে-না** — admin-হেড = fonts/tokens/admin/premium + EJS-ইনলাইন-<style>; .hr324-kbd-বেস-রুল = ইনলাইন (line ~117) — **চুক্তি: admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই** (style.css = ফিড-সাইড-কেবল) — sfs335-প্রথম-প্রয়োগ style.css-এ-নিষ্ক্রিয়-ই-ছিল (e2e-প্রমাণ) → প্যাচ-পর্বেই-রোলব্যাক+ইনলাইন-স্থানান্তর — ফিড-সাইড-assert = style.css-এ session335-শূন্য-প্রমাণ ② **immutable-CSS-ক্যাশ-ট্র্যাপ** — express-static `Cache-Control: max-age=2592000, immutable` — এজেন্ট-ব্রাউজার-সেশনে পুরাতন-CSS-মেমরি-ক্যাশ-নেভিগেশন-জুড়ে-টিকে (fetch(cache:'reload') = disk-cache-আপডেট-কেবল — মেমরি-ক্যাশ-অক্ষুণ্ণ) — **চুক্তি: ফিড-সাইড-নতুন-CSS-assert = ব্রাউজার-পুনঃআরম্ভ অথবা link-href-ভার্সনিং অথবা HTML-রাইডেন-স্টাইল-পছন্দ** ③ **admin-মোবাইল-ই২ই-রেসিপি** — মোবাইল-ভিউপোর্টে-সুইট-পদক্ষেপ-বিভাজনে রাজ্য-পুনঃনির্মাণ-অপরিহার্য: fresh-load-এ USER_FEED-নির্বাচন-পুনরাবৃত্তি + দ্বি-কপি + blur+focus (s334-গোটচা-①-সম্প্রসারিত) — নইলে `.hr-aria-copy`-অনুপস্থিত (selection-নির্ভর-রেন্ডার)। **অপারেশনাল:** style.css brace-delta = পূর্ব-বিদ্যমান (HEAD 3717/3719 — ব্রাউজার-সহনশীল — অস্পৃশ্য-রীতি)।
- **session334-নোটের প্রস্তাব-①-পূর্ণ** (sfs334/hr334-প্রোড-স্পট) + **csv-চতুর্থ-মোড = অপ্রয়োগিত-অপরিবর্তিত** (সুইট-বিবর্তন-ব্যয়-উচ্চ) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪); রাউন্ড-আরম্ভে নতুন-রিমোট-ব্রাঞ্চ-নোটিশ (`feat/feed-motion-scene-premium` — তাদের-ওয়ার্কস্পেস — অস্পৃশ্য)।
- **পরের-এজেন্ট: session336 (Task ID 173)।** বাকি-প্রস্তাব: ① sfs335/hr335-প্রোড-স্পট (HTTP-পাঠ — প্রোড-অ্যাডমিন-ক্রেড-গেটেড-রীতি — ইনলাইন-<style>-মার্কার = admin-HTML-অনুপস্থিত-পাবলিক-পাঠে — ফিড-সাইড-মার্কার-শূন্য-ই-প্রত্যাশিত) ② hr336 (admin): ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (ত্রি-মোড-চক্র-সম্প্রসারণ — fmtLabel331 + strip324-মোড়ক-রীতি — সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) অথবা **setHint-ব্যাচ-API** (setHints(.map)-এক-কল-বহু-কী — hr335-চুক্তি-প্রসারিত) অথবা রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ (sessionStorage-hr335-persist — reload-পরবর্তী-সেট-হিন্ট-পুনঃপ্রয়োগ) ③ sfs336 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_172 = """
## Task 172 — session335: hr335 রেজিস্ট্রি-হিন্ট-সম্পাদনা-API setHint + sfs335 kbd-লাইন-ব্র্যান্ড-টোন (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251137`); রাউন্ড-আরম্ভে HEAD=origin=`b9f5e86` (session334), clean-tree, BEHIND=০; agent-browser-QA বেসলাইন সবুজ (s334-সুইট ৫৭/০/০) + **প্রোড-স্পট** (vercel home-200 + session334-মার্কার ×২ + keynav-৩৪%-রুল ×২-লাইভ + epaper-200 = b9f5e86-ডিপ্লয়-প্রমাণ — PLANS session334-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session334-নোটের **প্রস্তাব-②-দ্বিতীয়-বিকল্প গ্রহণ** (রেজিস্ট্রি-হিন্ট-সম্পাদনা-API — setHint; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr335 (admin/home-reorder.ejs — hr334-IIFE-অভ্যন্তরে):** q333h.setHint(k, h) — register-পরিবার-সম্প্রসারণ — রেজিস্ট্রি-রো-[2]-মিউটেশন + kbd-লাইন-লাইভ-সিঙ্ক (দ্বি-সাইট); লাইন-সিঙ্ক-ত্রি-পথ (in-place-split-join / appendHint334-প্রতিনিধি / ক্লিয়ার-অপসারণ); {fmt}-টেমপ্লেট-সমর্থিত; ওভারলে-[1]-অস্পৃশ্য + পুনঃনির্মাণ-শূন্য; live==line()-চুক্তি-সংরক্ষণ; __hrAria335QA {sets, misses, rewrites, appends, last, set(), hintOf(), line(), err}।
- **[Mandatory-স্টাইল] sfs335 (home-reorder.ejs ইনলাইন-<style>):** .hr317-tip .hr324-kbd বেস-ব্র্যান্ড-টোন ৮% (color-mix — হেক্স-শূন্য — কেবল-রঙ — সর্ব-ব্যান্ড — MO=৪-অটুট)। **গোটচা-③-সংশোধন:** প্রথম-প্রয়োগ style.css-এ → e2e-ব্যর্থ → admin-পৃষ্ঠা style.css-লোড-করে-না-প্রমাণ → রোলব্যাক + ইনলাইন-স্থানান্তর (সুইট-assert-সহ)।
- **টেস্ট:** tests/s335-suite.sh ৪১/০/০ ×২ + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s334→s306 ২৬-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ s335-patch.py idempotent ×২ (৩-ধাপ)। গোটচা ×৩ ডক-কৃত (PLANS session335): admin-style.css-অলোড + immutable-ক্যাশ-ট্র্যাপ + মোবাইল-ই২ই-রেসিপি (selection-পুনরাবৃত্তি)।
- **ডক-ত্রয়ী:** PROJECT §৩৩৫ + PLANS session335-নোট + repo-worklog Task 172 (s335-docs.py idempotent ×২)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_335, '## §৩৩৪ (session334', before=True, name='PROJECT-§৩৩৫')
    s = load(PLANS)
    probe = PLANS_335.strip().splitlines()[0]
    if probe not in s:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_335)
        print("  ok   PLANS-session335 (append)")
        n += 1
    else:
        print("  skip PLANS-session335 (already-applied)")
    s = load(WLOG)
    probe = WLOG_172.strip().splitlines()[0]
    if probe not in s:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_172)
        print("  ok   WLOG-Task172 (append)")
        n += 1
    else:
        print("  skip WLOG-Task172 (already-applied)")
    print(f"s335-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
