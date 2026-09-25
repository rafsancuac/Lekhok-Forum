#!/usr/bin/env python3
# s338-docs.py — session338 ডক-ত্রয়ী (PROJECT §৩৩৮ + PLANS session338-নোট + repo-worklog Task 175)
# Idempotent ×২-চুক্তি (s337-রীতি): idempotency-চেক-স্ট্রিং = সন্নিবেশ-পাঠ-থেকেই-উদ্ধৃত।
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

PROJECT_338 = """## §৩৩৮ (session338 — cron 403679: hr338 রেজিস্ট্রি-হিন্ট-রিড-API getHints + ডিফ-প্রিভিউ diffHints + sfs338 ডিফ-পেন্ডিং-kbd-টোন) — s338 ৪৭/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr338 — রেজিস্ট্রি-হিন্ট-রিড-API (PLANS session337-নোটের প্রস্তাব-②-প্রথম-বিকল্প — session336-নোটের-৩য়-বিকল্প-উত্তরাধিকার):** admin/home-reorder.ejs (hr337-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) — **q333h.getHints()** (রিড-কেবল): রেজিস্ট্রি-RAW-মানচিত্র-কপি ({কী: [2]-RAW — {fmt}-অরেজলভড — setHints-ইনপুট-বিন্যাসে — **রাউন্ড-ট্রিপ-চুক্তি**: getHints()→সম্পাদনা→setHints = রাউন্ড-ট্রিপ) — **প্রতি-কলে-নতুন-অবজেক্ট** (লাইভ-রেজিস্ট্রি-রেফারেন্স-প্রকাশ-নিষিদ্ধ — বাহ্যিক-মিউটেশন-সুরক্ষা-e2e-প্রমাণিত); **q333h.diffHints(intended)**: ব্যাচ-পূর্ব-ডিফ-প্রিভিউ — intended vs রেজিস্ট্রি-RAW → **{changed, same, missed, total}** (changed = RAW-ভিন্ন, same = RAW-অভিন্ন, missed = রেজিস্ট্রি-অনুপস্থিত — setHint335-উত্তরাধিকার); অবৈধ-ইনপুট (null/অবজেক্ট-নয়/অ্যারে) = {missed:১} + diff:invalid-last; hasOwnProperty-রক্ষা-for-in; **শ্রেণি-গেট (sfs338)**: changed>০-তে kbd-লাইনে hr338-diff-শ্রেণি + changed=০-তে অপসারণ + **সফল-পাবলিক-setHints-প্রয়োগে (applied>০) অপসারণ** (intent-পূর্ণ — **hr337-চেইন-উপরে-hr338-চেইন** — স্থায়ীকরণ-উত্তরাধিকার-অটুট); **রিড-কেবল-চুক্তি**: রেজিস্ট্রি/লাইন/স্টোরেজ-মিউটেশন-শূন্য (শ্রেণি-গেট = DOM-শ্রেণি-কেবল); tip317-null-নিরাপদ; ওভারলে-সারি-গণনা-অস্পৃশ্য; `__hrAria338QA {gets, diffs, changed, missed, last, get(), diff(), line(), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত; s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট।

**[Mandatory-স্টাইল] sfs338 — ডিফ-পেন্ডিং-kbd-টোন (admin-ইনলাইন):** home-reorder.ejs ইনলাইন-<style> session338-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral — **cascade-অবস্থান session337-ব্লক-পরে** — দ্বি-শ্রেণি-সহাবস্থানে diff-প্রাধান্য-চুক্তি) — `.hr317-tip .hr324-kbd.hr338-diff` অতি-গভীর-ব্র্যান্ড-টোন **৩০%** (color-mix — var(--lf-brand-primary)) + **সর্বোচ্চ-গাঢ়-টেক্সট rgba(6,95,70,0.97)**: kbd-র‍্যাম্প **৮→১৫→২২→৩০** (sfs335-বেস + sfs336-ব্যাচ + sfs337-restored-উপরে-ধাপ — র‍্যাম্প-সহাবস্থান-অসম্পৃক্ত) — pending-intent-সংকেত (ব্যাচ-পূর্ব-ডিফ-প্রিভিউ-সনাক্তযোগ্যতা); **কেবল-রঙ (background-color + color)** — geometry-অস্পৃশ্য; সর্ব-ব্যান্ড (media-query-শূন্য); transition-শূন্য; MO=৪-অটুট; style.css = session338/337-শূন্য (admin-CSS-চুক্তি-প্রমাণ)।

**টেস্ট:** নতুন tests/s338-suite.sh **৪৭/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×১৭ + SSR ×৩ + hr338-ই২ই ×১৪ — হুক + **getHints-কপি-সুরক্ষা** {MUTATED-বাহ্যিক-মিউটেশন-অস্পৃশ্য} + ডিফ-গেট-অন-α=0.30 + ডিফ-গেট-অফ-α=0.08 + মিশ্র-ডিফ-miss + অবৈধ-ইনপুট-জুটি + **রাউন্ড-ট্রিপ** {getHints→সম্পাদনা→diff→setHints{applied:৮}→গেট-অফ+batched-১৫%+RAW-আপডেট+স্থায়ীকরণ} + রাউন্ড-ট্রিপ-স্বয়ংসমতা {diff(getHints()) = সর্ব-same} + reload-পরে-hr337-অটুট + ত্রি-রাজ্য-ক্যাসকেড-প্রাধান্য {restored+diff → ৩০%-জয়ী} + প্রয়োগ-পরবর্তী-ক্যাসকেড-অবনমন {restored-২২%-ফেরত} + ওভারলে-৮-সারি + সর্ব-হুক-ত্রুটি-শূন্য; sfs338-মোবাইল ×৩ — ৩৯০px ০.০৮→০.৩০→প্রয়োগে-০.১৫-ব্যাচ-গেট; পরিষ্কারণ-চুক্তি + নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s337 ৫০ + s336 ৪৪ + s335 ৪১ + s334 ৫৭ + s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 ৪৩ + s307 ৫৫ + s306 ৫০ (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।

**গোটচা ×১ (নতুন — PLANS session338):** ① **ব্যাচ-প্রয়োগ-টোন-উত্তরাধিকার** — setHints-প্রয়োগ-পরবর্তী কbd-টোন = hr338-গেট-অফ **+ hr336-batched-গেট-অন (১৫%)** — fresh-রাজ্যে বেস-০.০৮-প্রত্যাশা ×১-ব্যর্থতা (মোবাইল-MA-assert) → সংশোধন = ব্যাচ-পথে-ব্যাচ-শ্রেণি-সমন্বয়-প্রত্যাশা (উত্তরাধিকার ×৫-অটুট: প্রতি-reload-recipe + শ্রেণি-বিলম্ব + কাউন্টার-ডেল্টা + admin-style.css-অলোড + immutable-ক্যাশ + মোবাইল-রেসিপি)।

**প্রোড-স্পট (session337-প্রস্তাব-①-যাচাই — রাউন্ড-আরম্ভেই):** vercel home-200 + **session334-মার্কার ×২-লাইভ (style.css)** + epaper-200 + প্রোড-অ্যাডমিন = ৩০৭-রিডাইরেক্ট (cred-gated — session337-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত) = **5dc601c-ডিপ্লয়-প্রমাণ**।

"""

PLANS_338 = """
## Session 338 — hr338 রেজিস্ট্রি-হিন্ট-রিড-API getHints + ডিফ-প্রিভিউ diffHints + sfs338 ডিফ-পেন্ডিং-kbd-টোন (Task ID 175 — ২৫ সেপ্টেম্বর ২০২৬)

- **প্রয়োগ (session337-নোটের প্রস্তাব-②-প্রথম-বিকল্প — session336-নোটের-৩য়-বিকল্প-উত্তরাধিকার):** ① **প্রোড-স্পট** (রাউন্ড-আরম্ভেই): vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭ (cred-gated) = 5dc601c-ডিপ্লয়-প্রমাণ ② **hr338** (admin/home-reorder.ejs — hr337-IIFE-অভ্যন্তরে-সম্প্রসারণ): q333h.getHints() — RAW-মানচিত্র-কপি (রাউন্ড-ট্রিপ-চুক্তি — প্রতি-কলে-নতুন-অবজেক্ট — কপি-সুরক্ষা-e2e-প্রমাণিত); q333h.diffHints(intended) — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ {changed, same, missed, total} — অবৈধ-ইনপুট = diff:invalid; শ্রেণি-গেট: changed>০-সংযোজন + changed=০-অপসারণ + সফল-setHints-প্রয়োগে-অপসারণ (hr337-চেইন-উপরে-hr338-চেইন); রিড-কেবল-চুক্তি; __hrAria338QA {gets, diffs, changed, missed, last, get(), diff(), line(), err} ③ **sfs338** (home-reorder.ejs ইনলাইন-<style> session338-ব্লক — cascade-অবস্থান session337-পরে): .hr324-kbd.hr338-diff অতি-গভীর-টোন ৩০% + সর্বোচ্চ-গাঢ়-টেক্সট ০.৯৭ (kbd-র‍্যাম্প ৮→১৫→২২→৩০ — color-mix+rgba — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট) ④ **[Mandatory-স্টাইল]** ব্লক হেক্স-শূন্য + layout-neutral-assert।
- **টেস্ট:** নতুন tests/s338-suite.sh **৪৭/০/০ ×২-ধারাবাহিক** + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s337→s306 ২৯-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ scripts/s338-patch.py idempotent ×২ (২-ধাপ — JS+CSS উভয়ে-ইনলাইন)। পরিষ্কারণ-চুক্তি-অটুট (সুইট-শেষে hr337-hints-পরিষ্কারণ + যাচাই)।
- **গোটচা ×১ (নতুন):** ① **ব্যাচ-প্রয়োগ-টোন-উত্তরাধিকার** — setHints-প্রয়োগ-পরবর্তী kbd-টোন = hr338-গেট-অফ + hr336-batched-গেট-অন (১৫%) — fresh-বেস-০.০৮-প্রত্যাশা ×১-ব্যর্থতা → ব্যাচ-শ্রেণি-সমন্বয়-প্রত্যাশায়-সংশোধন। উত্তরাধিকার ×৬-অটুট (প্রতি-reload-recipe + শ্রেণি-বিলম্ব + কাউন্টার-ডেল্টা + admin-style.css-অলোড + immutable-ক্যাশ + মোবাইল-রেসিপি)।
- **session337-নোটের প্রস্তাব-①-পূর্ণ** (sfs337/hr337-প্রোড-স্পট) + **হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন = অপ্রয়োগিত** (২য়-বিকল্প — পরবর্তী-রাউন্ডের-জন্য-মুক্ত) + **csv-চতুর্থ-মোড = অপ্রয়োগিত-অপরিবর্তিত** (সুইট-বিবর্তন-ব্যয়-উচ্চ) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪); রাউন্ড-আরম্ভে রিমোট-ব্রাঞ্চ-নোটিশ (`feat/feed-motion-scene-premium` — তাদের-ওয়ার্কস্পেস — অস্পৃশ্য)।
- **পরের-এজেন্ট: session339 (Task ID 176)।** বাকি-প্রস্তাব: ① sfs338/hr338-প্রোড-স্পট (HTTP-পাঠ — প্রোড-অ্যাডমিন-ক্রেড-গেটেড-রীতি — session338-ইনলাইন-মার্কার = admin-HTML-অনুপস্থিত-পাবলিক-পাঠে — ফিড-সাইড-মার্কার-শূন্য-ই-প্রত্যাশিত) ② hr339 (admin): **হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন** (q337h.clearStore-UI-প্রকাশ — hr324-বার-পরিবারে-নতুন-বাটন — hr337-চুক্তি-প্রসারিত) অথবা **getHints-মোড-সচেতন-বিকল্প** (getHints(true) = {fmt}-রেজলভড-মানচিত্র — hr338-চুক্তি-প্রসারিত) অথবা ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) ③ sfs339 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_175 = """
## Task 175 — session338: hr338 রেজিস্ট্রি-হিন্ট-রিড-API getHints + ডিফ-প্রিভিউ diffHints + sfs338 ডিফ-পেন্ডিং-kbd-টোন (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251352`); রাউন্ড-আরম্ভে HEAD=origin=`5dc601c` (session337), clean-tree, BEHIND=০; agent-browser-QA বেসলাইন সবুজ (s337-সুইট ৫০/০/০) + **প্রোড-স্পট** (vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated = 5dc601c-ডিপ্লয়-প্রমাণ — PLANS session337-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session337-নোটের **প্রস্তাব-②-প্রথম-বিকল্প গ্রহণ** (রিড-API — getHints+diffHints; ক্লিয়ার-বাটন = পরবর্তী-রাউন্ডের-জন্য-মুক্ত; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr338 (admin/home-reorder.ejs — hr337-IIFE-অভ্যন্তরে):** q333h.getHints() — রেজিস্ট্রি-RAW-মানচিত্র-কপি (রাউন্ড-ট্রিপ-চুক্তি — প্রতি-কলে-নতুন-অবজেক্ট — কপি-সুরক্ষা-e2e-প্রমাণিত); q333h.diffHints(intended) — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ {changed, same, missed, total} — অবৈধ-ইনপুট = diff:invalid; শ্রেণি-গেট (changed>০-অন + changed=০/সফল-setHints-প্রয়োগে-অফ — hr337-চেইন-উপরে-hr338-চেইন); রিড-কেবল-চুক্তি (রেজিস্ট্রি/লাইন/স্টোরেজ-মিউটেশন-শূন্য); __hrAria338QA {gets, diffs, changed, missed, last, get(), diff(), line(), err}।
- **[Mandatory-স্টাইল] sfs338 (home-reorder.ejs ইনলাইন-<style> session338-ব্লক — cascade-অবস্থান session337-পরে):** .hr317-tip .hr324-kbd.hr338-diff অতি-গভীর-ব্র্যান্ড-টোন ৩০% + সর্বোচ্চ-গাঢ়-টেক্সট rgba(6,95,70,0.97) (kbd-র‍্যাম্প ৮→১৫→২২→৩০ — color-mix — হেক্স-শূন্য — কেবল-রঙ — layout-neutral — সর্ব-ব্যান্ড-এক-মান — transition-শূন্য — MO=৪-অটুট); style.css = session338/337-শূন্য (admin-CSS-চুক্তি)।
- **টেস্ট:** tests/s338-suite.sh ৪৭/০/০ ×২-ধারাবাহিক + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s337→s306 ২৯-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ s338-patch.py idempotent ×২ (২-ধাপ)। গোটচা ×১ নতুন ডক-কৃত (PLANS session338): ব্যাচ-প্রয়োগ-টোন-উত্তরাধিকার (setHints-পরবর্তী = গেট-অফ + hr336-batched-১৫%-অন — fresh-বেস-প্রত্যাশা-নিষিদ্ধ); উত্তরাধিকার-গোটচা ×৬-অটুট।
- **ডক-ত্রয়ী:** PROJECT §৩৩৮ + PLANS session338-নোট + repo-worklog Task 175 (s338-docs.py idempotent ×২)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_338, '## §৩৩৭ (session337', before=True, name='PROJECT-§৩৩৮')
    s = load(PLANS)
    probe = PLANS_338.strip().splitlines()[0]
    if probe not in s:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_338)
        print("  ok   PLANS-session338 (append)")
        n += 1
    else:
        print("  skip PLANS-session338 (already-applied)")
    s = load(WLOG)
    probe = WLOG_175.strip().splitlines()[0]
    if probe not in s:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_175)
        print("  ok   WLOG-Task175 (append)")
        n += 1
    else:
        print("  skip WLOG-Task175 (already-applied)")
    print(f"s338-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
