#!/usr/bin/env python3
# s334-docs.py — session334 ডক-ত্রয়ী (PROJECT §৩৩৪ + PLANS session334-নোট + repo-worklog Task 171)
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

PROJECT_334 = """## §৩৩৪ (session334 — cron 403679: hr334 kbd-হিন্ট-এক-উৎস smarty-সমাপ্তি + sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি) — s334 ৫৭/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr334 — kbd-হিন্ট-এক-উৎস (PLANS session333-নোটের প্রস্তাব-②-প্রথম-বিকল্প):** admin/home-reorder.ejs — **রেজিস্ট্রি-তৃতীয়-উপাদান**: ovRows330-প্রতি-সারির [2] = kbd-হিন্ট-পাঠ ('E = স্ট্রিপ কপি' রীতি ×৮ — F-সারি **'{fmt}'-টেমপ্লেট** = মোড-সচেতন); **hintOf334** (রেজিস্ট্রি-কী-লুকআপ — {fmt}-কল-টাইম split-join-সর্ব-উপস্থিতি — s333-গোটচা-②-রীতি) + **appendHint334** (এক-উৎস-অ্যাপেন্ডার — .hr324-kbd-লুকআপ + indexOf-ডুপ-রক্ষা + appends/dupSkips-গণনা) + **kbdLine334** (রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-লাইন — উপসর্গ + সারি-ক্রম E→D→X→F→P→C→S→?); **সর্ব-১০-অ্যাপেন্ড-সাইট পুনঃনির্দেশিত** (s325-X + s326-F + s327-P×২ + s328-C×২ + s329-S×২ + s330-?×২ — মোড়ক-চেইন-গঠন-অস্পৃশ্য — হার্ডকোডেড-অ্যাপেন্ড-অবশেষ-শূন্য ×৬); **cycleFmt326-পুনঃলেখন-সাইট = kbdLine334()** (in-place-ন্যূনতম-সম্পাদনা — hr331-রীতি — সর্ব-হিন্ট-সমৃদ্ধ-এক-উৎস — P-হারানো-বিরোধ-সমাপ্ত); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য (fresh-render-চুক্তি); **নিবন্ধন-দ্বি-সাইট**: q333h.register-মোড়ক (regOrig334 — চেইন-রীতি) — register(k, d, h)-তৃতীয়-ঐচ্ছিক-প্যারামিটার h-সহ নিবন্ধনে ওভারলে-সারি + kbd-হিন্ট-উভয়-স্বয়ংক্রিয় (smarty-সমাপ্তি); h-বিহীন = পুরাতন-আচরণ-অটুট (s333-সুইট-সামঞ্জস্য); `__hrAria334QA {appends, dupSkips, dualRegs, last, hintOf(), append(), line(), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত।

**[Mandatory-স্টাইল] sfs334 — মোবাইল-ব্যাজ-গেট-প্যারিটি:** style.css session334-ব্লক (**কেবল-সংযোজন** — হেক্স-শূন্য — layout-neutral) — মোবাইল-ব্যান্ডে (≤৬৪০px) ব্যাজ-বর্ডার ট্যাপ-গেটে ৩৪%-নরম (s326 — ইচ্ছাকৃত), কিন্তু keynav-গেট বেস-৪২%-এই-থাকে (s318 — **গেট-অসমতা — parity-নীতি-ব্যতিক্রম**); এ-ব্লকে keynav-গেটেও ৩৪% — **ট্যাপ×keynav-উভয়-গেট-সম-মান (parity-নীতি-সমাপ্তি)** — ট্যাপ-রুল-অস্পৃশ্য; কেবল-≤৬৪০px (s326-ব্যান্ড-সমতা — ডেস্ক s318-বেস + s332-চিপ-সহাবস্থান-৫০%-অটুট); কেবল-রঙ (border-color) — ব্যাজ-geometry/গাটার/পটভূমি-অস্পৃশ্য; MO-গণনা=৪-অটুট।

**টেস্ট:** নতুন tests/s334-suite.sh **৫৭/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×১৮ — রেজিস্ট্রি-হিন্ট ×৮ + {fmt} + ত্রয়ী-এক-উৎস + split-join + register-মোড়ক + সাইট ×১০ + অবশেষ-শূন্য ×৬ + kbdLine334-সাইট + বেস-লাইন ×১ + মোড়ক-ঘোষণা ×৭ + QA-হুক + node --check + CSS-ব্লক হেক্স-শূন্য/মার্কার ×২/keynav-৩৪%/layout-neutral + ট্যাপ-রুল-অটুট + MO=৪; SSR ×৪ — সার্ভেড-CSS-মার্কার ×২-লাইভ; sfs334-ই২ই ×৯ — ৩৯০px-keynav α=0.34 + ট্যাপ α=0.34 + **ট্যাপ×keynav-সমতা** + bdiff=false (s333-সামঞ্জস্য) + ৩৬০=৩৯০-ব্যান্ড + ডেস্ক α=0.5 (s332-জুটি) ≠মোবাইল + hScroll-শূন্য + স্ক্রিনশট; hr334-ই২ই ×১৬ — হুক + hintOf-লুকআপ + fresh-render সর্ব-৮-ক্রমত + **live-kbd==kbdLine334()** + F-চক্র P/C/S/?-অবিচ্ছিন্ন + চক্র-পরবর্তী-সমতা + dupSkips≥৪ + json-{fmt}-রেজলভ + register-দ্বি-সাইট (rows=৯ + kbd-হিন্ট + dualRegs=১) + ডুপ-false + h-বিহীন-পুরাতন-আচরণ + ওভারলে-১০-সারি + সর্ব-হুক-ত্রুটি-শূন্য; মোবাইল ×৩; নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 ৪৩ + s307 ৫৫ + s306 ৫০ (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।

**গোটচা ×২ ডক-কৃত (PLANS session334):** ① **tip-প্রদর্শন-ট্রিগার** — .hr-aria-copy-ক্লিক = কপি-কেবল (ইতিহাস-রেকর্ড) — **টিপ = mouseover/focusin-ট্রিগার** (tipShow317) — এজেন্ট-ক্লিকে tip-অনুপস্থিত (appends=০ ×১-প্রমাণিত) — সুইট-রেসিপি: দ্বি-কপি + blur+focus (s333-রীতি-পুনঃনিশ্চিত) — **চুক্তি: kbd/tip-assert-পূর্বে focusin-ট্রিগার বাধ্যতামূলক** ② **computed-রঙ-ফরম্যাট-বিবর্তন** — আধুনিক-Chrome borderColor = `color(srgb r g b / α)` (rgba()-পুরাতন-ফরম্যাট-নয়) — α-পার্স = ট্রেলিং-সংখ্যা-রেজেক্স (split-comma-ব্যর্থ ×২-প্রমাণিত) — **চুক্তি: computed-রঙ-assert = ফরম্যাট-নিরপেক্ষ-পার্স + স্ট্রিং-সমতা-তুলনা (s330-রীতি)**। অপারেশনাল-নোট: MOBN-গণনা = `grep -c 'new MutationObserver' feed.ejs` (s333-পদ্ধতি — class-অনুমান-ভুল)।

**প্রোড-স্পট (session333-প্রস্তাব-①-যাচাই — রাউন্ড-আরম্ভেই):** vercel home-200 + **session333-মার্কার ×২ + sfs333 ×২-লাইভ (style.css)** + epaper-200 = **32e8ada-ডিপ্লয়-প্রমাণ**; প্রোড-অ্যাডমিন = প্রকৃত-অ্যাকাউন্ট-গেট (অপরিবর্তিত)।

"""

PLANS_334 = """
## Session 334 — hr334 kbd-হিন্ট-এক-উৎস (smarty-সমাপ্তি) + sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি (Task ID 171 — ২৫ সেপ্টেম্বর ২০২৬)

- **প্রয়োগ (session333-নোটের প্রস্তাব-②-প্রথম-বিকল্প):** ① **প্রোড-স্পট** (রাউন্ড-আরম্ভেই): vercel home-200 + session333-মার্কার ×২ + sfs333 ×২-লাইভ + epaper-200 = 32e8ada-ডিপ্লয়-প্রমাণ ② **hr334a** (admin/home-reorder.ejs): kbd-হিন্ট-এক-উৎস — ovRows330-রেজিস্ট্রি-তৃতীয়-উপাদান ([2] = kbd-হিন্ট — F='{fmt}'-মোড-সচেতন-টেমপ্লেট); hintOf334-লুকআপ ({fmt}-split-join-সর্ব-উপস্থিতি) + appendHint334-এক-উৎস-অ্যাপেন্ডার (গার্ড+গণনা-অন্তর্নির্মিত) + kbdLine334-রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-লাইন (ক্রম E→D→X→F→P→C→S→? — পুরাতন-চেইন-ক্রম-সমতা); **সর্ব-১০-অ্যাপেন্ড-সাইট পুনঃনির্দেশ** (s325/s326/s327×২/s328×২/s329×২/s330×২ — মোড়ক-চেইন-গঠন-অস্পৃশ্য — হার্ডকোডেড-অবশেষ-শূন্য ×৬) + cycleFmt326-পুনঃলেখন-সাইট = kbdLine334() (in-place-ন্যূনতম — hr331-রীতি — P-হারানো-বিরোধ-সমাপ্ত); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; **q333h.register-মোড়ক (regOrig334 — চেইন-রীতি)** — register(k, d, h)-তৃতীয়-ঐচ্ছিক-প্যারামিটার h-সহ নিবন্ধনে ওভারলে-সারি + kbd-হিন্ট-উভয়-স্বয়ংক্রিয় (smarty-সমাপ্তি); h-বিহীন = পুরাতন-আচরণ-অটুট (s333-সুইট-সামঞ্জস্য); __hrAria334QA {appends, dupSkips, dualRegs, last, hintOf(), append(), line(), err} ③ **sfs334** (style.css session334-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral): মোবাইল-ব্যাজ-গেট-প্যারিটি — ≤৬৪০px keynav-গেটেও ব্যাজ-বর্ডার ৩৪% (s326-ট্যাপ-সমতা — parity-নীতি-সমাপ্তি — ট্যাপ-রুল-অস্পৃশ্য); কেবল-রঙ (border-color); ডেস্ক-অটুট (s318-বেস + s332-জুটি-৫০%); MO=৪-অটুট ④ **[Mandatory-স্টাইল]** ব্লক হেক্স-শূন্য + layout-neutral-assert।
- **টেস্ট:** নতুন tests/s334-suite.sh **৫৭/০/০ ×২-ধারাবাহিক** + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s333→s306 ২৫-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ scripts/s334-patch.py idempotent ×২ (১৪-ধাপ)।
- **গোটচা ×২:** ① tip-প্রদর্শন = mouseover/focusin-ট্রিগার (ক্লিক = কপি-কেবল — ইতিহাস-রেকর্ড) — kbd-assert-পূর্বে দ্বি-কপি + blur+focus-রেসিপি বাধ্যতামূলক (s333-রীতি-পুনঃনিশ্চিত) ② computed-রঙ = `color(srgb … / α)`-নতুন-ফরম্যাট (rgba()-নয়) — α-পার্স = ট্রেলিং-সংখ্যা-রেজেক্স; assert = ফরম্যাট-নিরপেক্ষ + স্ট্রিং-সমতা (s330-রীতি)। **অপারেশনাল:** MOBN = `grep -c 'new MutationObserver' feed.ejs` (s333-পদ্ধতি)।
- **session333-নোটের প্রস্তাব-①-পূর্ণ** (sfs333/hr333-প্রোড-স্পট) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**; csv-চতুর্থ-মোড = অপ্রয়োগিত (সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন-রীতি)।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪)।
- **পরের-এজেন্ট: session335 (Task ID 172)।** বাকি-প্রস্তাব: ① sfs334/hr334-প্রোড-স্পট (HTTP-পাঠ — session334-CSS-মার্কার (keynav-৩৪% ×২); hr334-প্রোড-অ্যাডমিন ক্রেড-গেটেড) ② hr335 (admin): ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (ত্রি-মোড-চক্র-সম্প্রসারণ — fmtLabel331 + strip324-মোড়ক-রীতি — সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) অথবা রেজিস্ট্রি-হিন্ট-সম্পাদনা-API (register-পরিবার-সম্প্রসারণ — setHint(k, h) — দ্বি-সাইট-সিঙ্ক-সহ) ③ sfs335 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_171 = """
## Task 171 — session334: hr334 kbd-হিন্ট-এক-উৎস smarty-সমাপ্তি + sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251037`); রাউন্ড-আরম্ভে HEAD=origin=`32e8ada` (session333), clean-tree, BEHIND=০; agent-browser-QA বেসলাইন সবুজ (s333-সুইট ৫৪/০/০) + **প্রোড-স্পট** (vercel home-200 + session333-মার্কার ×২ + sfs333 ×২-লাইভ + epaper-200 = 32e8ada-ডিপ্লয়-প্রমাণ — PLANS session333-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session333-নোটের **প্রস্তাব-②-প্রথম-বিকল্প গ্রহণ** (kbd-হিন্ট-এক-উৎস — smarty-সমাপ্তি; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr334 (admin/home-reorder.ejs):** kbd-হিন্ট-এক-উৎস — ovRows330-রেজিস্ট্রি-তৃতীয়-উপাদান ([2] = kbd-হিন্ট ×৮ — F='{fmt}'-টেমপ্লেট); hintOf334 + appendHint334 (এক-উৎস-অ্যাপেন্ডার — গার্ড+গণনা) + kbdLine334 (রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-লাইন); সর্ব-১০-অ্যাপেন্ড-সাইট পুনঃনির্দেশ (মোড়ক-চেইন-গঠন-অস্পৃশ্য — অবশেষ-শূন্য ×৬) + cycleFmt326-পুনঃলেখন = kbdLine334() (in-place — P-হারানো-বিরোধ-সমাপ্ত); s324-বেস-লাইন-অস্পৃশ্য; q333h.register-মোড়ক (regOrig334) — register(k, d, h)-দ্বি-সাইট-স্বয়ংক্রিয় (smarty-সমাপ্তি — h-বিহীন = পুরাতন-আচরণ); __hrAria334QA {appends, dupSkips, dualRegs, last, hintOf(), append(), line(), err}।
- **[Mandatory-স্টাইল] sfs334:** style.css session334-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral) — মোবাইল-ব্যাজ-গেট-প্যারিটি: ≤৬৪০px keynav-গেটেও ব্যাজ-বর্ডার ৩৪% (s326-ট্যাপ-সমতা — parity-নীতি-সমাপ্তি); কেবল-রঙ; ডেস্ক-অটুট (s318-বেস + s332-জুটি); MO=৪-অটুট।
- **টেস্ট:** নতুন tests/s334-suite.sh **৫৭/০/০ ×২-ধারাবাহিক** (কাঠামো ×১৮ + SSR ×৪ + sfs334-ই২ই ×৯ — keynav/ট্যাপ α=0.34 + গেট-সমতা + bdiff=false + ৩৬০=৩৯০ + ডেস্ক α=0.5≠মোবাইল + hScroll-শূন্য; hr334-ই২ই ×১৬ — সর্ব-৮-ক্রমত + live-kbd==kbdLine334() + F-চক্র-অবিচ্ছিন্ন + dupSkips≥৪ + json-{fmt} + register-দ্বি-সাইট + ওভারলে-১০-সারি; মোবাইল ×৩; নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 ৪৩ + s307 ৫৫ + s306 ৫০ (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।
- **গোটচা ×২:** ① tip-প্রদর্শন = mouseover/focusin-ট্রিগার (ক্লিক = কপি-কেবল) — kbd-assert-পূর্বে দ্বি-কপি + blur+focus-রেসিপি (appends=০ ×১-প্রমাণিত) ② computed-রঙ = `color(srgb … / α)`-নতুন-ফরম্যাট — α-পার্স = ট্রেলিং-সংখ্যা-রেজেক্স (split-comma-ব্যর্থ ×২)। MOBN = MutationObserver-গণনা।
- **প্যাচ/ডক:** scripts/s334-patch.py (idempotent ×২ — ১৪-ধাপ: EJS ×১৩ + style.css ×১) + s334-docs.py (এ-ফাইল-ত্রয়ী); PLANS session334-নোটে session335-প্রস্তাব ×৪ (প্রোড-স্পট + csv-চতুর্থ-মোড/হিন্ট-সম্পাদনা-API + গাটার-গবেষণা + bot-সিঙ্ক-গেটেড)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_334, '## §৩৩৩ (session333', before=True, name='PROJECT-§৩৩৪')
    n += insert_once(PLANS, PLANS_334, '', before=False, name='PLANS-session334')
    # PLANS: append at end (no anchor) — special-case
    s = load(PLANS)
    probe = PLANS_334.strip().splitlines()[0]
    if probe not in s:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_334)
        print("  ok   PLANS-session334 (append)")
        n += 1
    n += insert_once(WLOG, WLOG_171, '', before=False, name='WLOG-Task171')
    s = load(WLOG)
    probe = WLOG_171.strip().splitlines()[0]
    if probe not in s:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_171)
        print("  ok   WLOG-Task171 (append)")
        n += 1
    print(f"s334-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
