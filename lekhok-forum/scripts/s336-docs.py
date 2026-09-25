#!/usr/bin/env python3
# s336-docs.py — session336 ডক-ত্রয়ী (PROJECT §৩৩৬ + PLANS session336-নোট + repo-worklog Task 173)
# Idempotent ×২-চুক্তি (s335-গোটচা-③): idempotency-চেক-স্ট্রিং = সন্নিবেশ-পাঠ-থেকেই-উদ্ধৃত।
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

PROJECT_336 = """## §৩৩৬ (session336 — cron 403679: hr336 রেজিস্ট্রি-হিন্ট-ব্যাচ-API setHints(map) + sfs336 ব্যাচ-kbd-ফিডব্যাক-টোন) — s336 ৪৪/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr336 — রেজিস্ট্রি-হিন্ট-ব্যাচ-API (PLANS session335-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প):** admin/home-reorder.ejs (hr335-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) — **q333h.setHints(map)**: register-পরিবার-সম্প্রসারণ — এক-কল-বহু-কী-হিন্ট-সম্পাদনা (hr335-চুক্তি-প্রসারিত) — hasOwnProperty-রক্ষা-for-in (পুরাতন-রীতি — প্রোটোটাইপ-কী-বর্জন) — **প্রতি-কী-তে setHint335-প্রতিনিধি** (লাইন-সিঙ্ক-ত্রি-পথ-উত্তরাধিকার — rewrites/appends/misses-গণনা-স্বয়ংক্রিয়); **ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys}** রিটার্ন; অবৈধ-ইনপুট (null/অবজেক্ট-নয়) = {applied:০, missed:১, total:০} + batch:invalid-last; শূন্য-মান-কী = ক্লিয়ার-পথ (hr335-সম্মত); **{fmt}-টেমপ্লেট-সমর্থিত** (hintOf334-কল-টাইম-রেজলভ); **live==line()-চুক্তি-সংরক্ষণ** (প্রতি-সেটে-লাইভ-সিঙ্ক — ব্যাচ-শেষেও line()==kbdLine334()); সফল-ব্যাচে (applied≥১) kbd-লাইনে hr336-batched-শ্রেণি (sfs336-ফিডব্যাক-গেট — একক-set()-পথে-অযুক্ত — s335-আচরণ-অটুট); ওভারলে-সারি-গণনা-অস্পৃশ্য (ব্যাচ = হিন্ট-কেবল-সম্পাদনা); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; `__hrAria336QA {batches, applied, missed, keys, last, setHints(), set(), hintOf(), line(), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত; s335/s334/s333-হুক-সহাবস্থান-অটুট।

**[Mandatory-স্টাইল] sfs336 — ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন (admin-ইনলাইন):** home-reorder.ejs ইনলাইন-<style> session336-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral — s335-গোটচা-①-চুক্তি-স্থান: admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই) — `.hr317-tip .hr324-kbd.hr336-batched` গভীর-ব্র্যান্ড-টোন **১৫%** (color-mix — var(--lf-brand-primary)) + **গাঢ়-টেক্সট rgba(6,95,70,0.92)**: ব্যাচ-প্রয়োগ-সনাক্তযোগ্যতা (sfs335-বেস-৮%-এর-উপরে-ধাপ — র‍্যাম্প-সহাবস্থান-অসম্পৃক্ত — ত্রি-মোড-চক্রে-স্থায়ী — textContent-পুনঃলেখনে-শ্রেণি-অটুট); **কেবল-রঙ (background-color + color)** — geometry/প্যাডিং/বর্ডার-অস্পৃশ্য — বক্স-মডেল-অটুট; সর্ব-ব্যান্ড (media-query-শূন্য — ডেস্ক+মোবাইল-এক-মান); transition-শূন্য (s315-নিরাপদ); MO=৪-অটুট; style.css = session336-শূন্য (admin-CSS-চুক্তি-প্রমাণ)।

**টেস্ট:** নতুন tests/s336-suite.sh **৪৪/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×১৬ — setHints-API + hasOwnProperty-রক্ষা + প্রতিনিধি + সারসংক্ষেপ + অবৈধ-ইনপুট-গার্ড + ফিডব্যাক-শ্রেণি + হুক-সহাবস্থান + মোড়ক-গঠন-অটুট + node --check + ইনলাইন-ব্লক হেক্স-শূন্য/মার্কার ×২/টোন-১৫%+টেক্সট/layout-neutral + style.css-চুক্তি + MO=৪; SSR ×৩; hr336-ই২ই ×১৪ — হুক + অবৈধ-ইনপুট + ব্যাচ-পূর্ব-টোন α=0.08+শ্রেণি-শূন্য + প্রি-ব্যাচ live==line + মিশ্র-ব্যাচ {applied:২, missed:১, total:৩} + ফিডব্যাক-টোন α=0.15+টেক্সট ০.৯২+শ্রেণি + শূন্য-মান-ক্লিয়ার + অ্যাপেন্ড-পথ-ডেল্টা (rows ৮→৯) + চক্র-পরবর্তী-স্থায়িত্ব + ওভারলে-৯-সারি + কাউন্টার-সঞ্চয় {batches:৩, applied:৪, missed:২, keys:৫} + সর্ব-হুক-ত্রুটি-শূন্য; sfs336-মোবাইল ×২ — ৩৯০px ব্যাচ-পূর্ব ০.০৮→পরবর্তী ০.১৫; নেট-শূন্য ×৪)। রিগ্রেশন সর্ব-গ্রিন: s335 ৪১ + s334 ৫৭ + s333 ৫৪ + s332 ৫৮ + s331 ৫৮ + s330 ৫৫ + s329 ৬৪ + s328 ৫৫ + s327 ৬১ + s326 ৬১ + s325 ৬৩ + s324 ৫৯ + s323 ৬২ + s322 ৬৯ + s321 ৬১ + s320 ৭২ + s319 ৭৭ + s318 ৭৪ + s317 ৬৮ + s316 ৫৫ + s315 ৭১ + s314 ৬৭ + s313 ৬৩ + s312 ৫৫ + s311 + s307 + s306 (app-dir-cwd) + guard:design + audit:views (১২৩ ejs)।

**প্রোড-স্পট (session335-প্রস্তাব-①-যাচাই — রাউন্ড-আরম্ভেই):** vercel home-200 + **session334-মার্কার ×২-লাইভ (style.css)** + epaper-200 + প্রোড-অ্যাডমিন = ৩০৭-রিডাইরেক্ট (cred-gated — session335-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত) = **85c5dd3-ডিপ্লয়-প্রমাণ**।

"""

PLANS_336 = """
## Session 336 — hr336 রেজিস্ট্রি-হিন্ট-ব্যাচ-API setHints(map) + sfs336 ব্যাচ-kbd-ফিডব্যাক-টোন (Task ID 173 — ২৫ সেপ্টেম্বর ২০২৬)

- **প্রয়োগ (session335-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প):** ① **প্রোড-স্পট** (রাউন্ড-আরম্ভেই): vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭ (cred-gated — session335-মার্কার-পাবলিক-শূন্য-প্রত্যাশিত) = 85c5dd3-ডিপ্লয়-প্রমাণ ② **hr336** (admin/home-reorder.ejs — hr335-IIFE-অভ্যন্তরে-সম্প্রসারণ): q333h.setHints(map) — এক-কল-বহু-কী — hasOwnProperty-রক্ষা-for-in — প্রতি-কী-তে setHint335-প্রতিনিধি (ত্রি-পথ-উত্তরাধিকার — গণনা-স্বয়ংক্রিয়); ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys}; অবৈধ-ইনপুট = batch:invalid; শূন্য-মান = ক্লিয়ার-পথ; {fmt}-সমর্থিত; live==line()-সংরক্ষণ; সফল-ব্যাচে hr336-batched-শ্রেণি (একক-set()-পথে-অযুক্ত); __hrAria336QA {batches, applied, missed, keys, last, setHints(), set(), hintOf(), line(), err} ③ **sfs336** (home-reorder.ejs ইনলাইন-<style> session336-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral): .hr324-kbd.hr336-batched গভীর-টোন ১৫% + গাঢ়-টেক্সট ০.৯২ (color-mix+rgba — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট) ④ **[Mandatory-স্টাইল]** ব্লক হেক্স-শূন্য + layout-neutral-assert।
- **টেস্ট:** নতুন tests/s336-suite.sh **৪৪/০/০ ×২-ধারাবাহিক** + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s335→s306 ২৭-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ scripts/s336-patch.py idempotent ×২ (২-ধাপ — JS+CSS উভয়ে-ইনলাইন — গোটচা-①-চুক্তি-অনুসরণ)।
- **গোটচা ×১ (নতুন) + উত্তরাধিকার ×৩:** ① **কাউন্টার-ডেল্টা-assert-চুক্তি (নতুন)** — q334h.appends প্রাথমিক-kbd-লাইন-নির্মাণেও-গণনা-হয় (৮-সারি-বেস ≈ ৬-অ্যাপেন্ড) — সুইট-assert = পরম-মান-নয় **প্রদক্ষেপ-পূর্ব-স্ন্যাপশট-ডেল্টা** (a0-স্ন্যাপশট → ব্যাচ → a334-a0==১) — s336-প্রথম-রানে ×১-ব্যর্থতা → ডেল্টা-পাঠে-সংশোধন ② admin-পৃষ্ঠা-style.css-অলোড (s335-চুক্তি-অটুট — sfs336 = ইনলাইন-ই — style.css session336-শূন্য-assert) ③ immutable-ক্যাশ-ট্র্যাপ (s335-অটুট) ④ admin-মোবাইল-ই২ই-রেসিপি (s335-অটুট — fresh-load-নির্বাচন-পুনরাবৃত্তি + দ্বি-কপি + blur+focus)।
- **session335-নোটের প্রস্তাব-①-পূর্ণ** (sfs335/hr335-প্রোড-স্পট — cred-gated-রীতি-যাচাই) + **csv-চতুর্থ-মোড = অপ্রয়োগিত-অপরিবর্তিত** (সুইট-বিবর্তন-ব্যয়-উচ্চ) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪); রাউন্ড-আরম্ভে রিমোট-ব্রাঞ্চ-নোটিশ (`feat/feed-motion-scene-premium` — তাদের-ওয়ার্কস্পেস — অস্পৃশ্য)।
- **পরের-এজেন্ট: session337 (Task ID 174)।** বাকি-প্রস্তাব: ① sfs336/hr336-প্রোড-স্পট (HTTP-পাঠ — প্রোড-অ্যাডমিন-ক্রেড-গেটেড-রীতি — session336-ইনলাইন-মার্কার = admin-HTML-অনুপস্থিত-পাবলিক-পাঠে — ফিড-সাইড-মার্কার-শূন্য-ই-প্রত্যাশিত) ② hr337 (admin): রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ (sessionStorage-hr336-persist — reload-পরবর্তী-সেট/ব্যাচ-হিন্ট-পুনঃপ্রয়োগ — hr336-চুক্তি-প্রসারিত) অথবা ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) অথবা setHints-রিপোর্টার (getHints()-রিড-API — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ) ③ sfs337 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_173 = """
## Task 173 — session336: hr336 রেজিস্ট্রি-হিন্ট-ব্যাচ-API setHints(map) + sfs336 ব্যাচ-kbd-ফিডব্যাক-টোন (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251223`); রাউন্ড-আরম্ভে HEAD=origin=`85c5dd3` (session335), clean-tree, BEHIND=০; agent-browser-QA বেসলাইন সবুজ (s335-সুইট ৪১/০/০) + **প্রোড-স্পট** (vercel home-200 + session334-মার্কার ×২-লাইভ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated = 85c5dd3-ডিপ্লয়-প্রমাণ — PLANS session335-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session335-নোটের **প্রস্তাব-②-দ্বিতীয়-বিকল্প গ্রহণ** (হিন্ট-ব্যাচ-API — setHints(map); csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr336 (admin/home-reorder.ejs — hr335-IIFE-অভ্যন্তরে):** q333h.setHints(map) — এক-কল-বহু-কী-হিন্ট-সম্পাদনা — hasOwnProperty-রক্ষা-for-in — প্রতি-কী-তে setHint335-প্রতিনিধি (লাইন-সিঙ্ক-ত্রি-পথ-উত্তরাধিকার); ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys}; অবৈধ-ইনপুট = batch:invalid; শূন্য-মান = ক্লিয়ার-পথ; {fmt}-সমর্থিত; live==line()-সংরক্ষণ; সফল-ব্যাচে hr336-batched-শ্রেণি; __hrAria336QA {batches, applied, missed, keys, last, setHints(), set(), hintOf(), line(), err}।
- **[Mandatory-স্টাইল] sfs336 (home-reorder.ejs ইনলাইন-<style> session336-ব্লক):** .hr317-tip .hr324-kbd.hr336-batched গভীর-ব্র্যান্ড-টোন ১৫% + গাঢ়-টেক্সট rgba(6,95,70,0.92) (color-mix — হেক্স-শূন্য — কেবল-রঙ — layout-neutral — সর্ব-ব্যান্ড-এক-মান — transition-শূন্য — MO=৪-অটুট); style.css = session336-শূন্য (admin-CSS-চুক্তি)।
- **টেস্ট:** tests/s336-suite.sh ৪৪/০/০ ×২-ধারাবাহিক + সম্পূর্ণ-রিগ্রেশন সর্ব-গ্রিন (s335→s306 ২৭-সুইট + guard:design + audit:views ১২৩ ejs)। প্যাচ s336-patch.py idempotent ×২ (২-ধাপ)। গোটচা ×১ নতুন ডক-কৃত (PLANS session336): কাউন্টার-ডেল্টা-assert-চুক্তি (q334h.appends = প্রাথমিক-লাইন-নির্মাণেও-গণনা — পরম-assert-নিষিদ্ধ — স্ন্যাপশট-ডেল্টা-বাধ্যতামূলক); উত্তরাধিকার-গোটচা ×৩-অটুট।
- **ডক-ত্রয়ী:** PROJECT §৩৩৬ + PLANS session336-নোট + repo-worklog Task 173 (s336-docs.py idempotent ×২)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_336, '## §৩৩৫ (session335', before=True, name='PROJECT-§৩৩৬')
    s = load(PLANS)
    probe = PLANS_336.strip().splitlines()[0]
    if probe not in s:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_336)
        print("  ok   PLANS-session336 (append)")
        n += 1
    else:
        print("  skip PLANS-session336 (already-applied)")
    s = load(WLOG)
    probe = WLOG_173.strip().splitlines()[0]
    if probe not in s:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_173)
        print("  ok   WLOG-Task173 (append)")
        n += 1
    else:
        print("  skip WLOG-Task173 (already-applied)")
    print(f"s336-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
