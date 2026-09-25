#!/usr/bin/env python3
# s341-docs.py — session341 ডক-ত্রয়ী (PROJECT §৩৪১ + PLANS session341-নোট + repo-worklog Task 178)
# Idempotent ×২-চুক্তি (s340-রীতি): idempotency-চেক-স্ট্রিং = সন্নিবেশ-পাঠ-থেকেই-উদ্ধৃত।
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

PROJECT_341 = """## §৩৪১ (session341 — cron 403679: hr341 getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই + sfs341 স্টাইল) — s341 ৩৩/০/০ ×২ (২৫ সেপ্টেম্বর ২০২৬)

**[Mandatory-ফিচার] hr341 — getHints-মোড-সচেতন-সম্প্রসারণ + মোড-নির্বাচক-রপ্তাই (PLANS session340-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প — hr340-চুক্তি-প্রসারিত):** admin/home-reorder.ejs (hr340-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) — **getHints(mode-string)** (getHintsOrig341-চেইন-রীতি): **q333h.getHints('rich'|'key'|'json') = নির্দিষ্ট-মোডে-রেজলভড-মানচিত্র** (MODES341-ত্রি-মোড-রেজিস্ট্রি-মিরর — RAW-স্ন্যাপশট-উপরে {fmt}→fmtLabel331(modeStr)-কল-টাইম-প্রতিস্থাপন — **mode326-অস্পৃশ্য** — mode326='rich'-তেও getHints('json')-F='JSON' — রিড-পবিত্রতা); getHints() মিথ্যা-মোড়ানো = RAW (অপরিবর্তিত — s338-অটুট); getHints(true) = বর্তমান-মোডে-রেজলভড (অপরিবর্তিত — hr340-অটুট); **getHints(mode326) ≡ getHints(true) দ্বি-পথ-সমতা** (গভীর-সমতা-প্রমাণিত); অবৈধ-স্ট্রিং-মোড = RAW-ফেরত + getm:invalid-মার্কার (diffHints/setHints-অবৈধ-ইনপুট-রীতি — শূন্য-অনুমান); প্রতি-কলে-নতুন-অবজেক্ট (hr338-কপি-সুরক্ষা-উত্তরাধিকার); রেজলভড-মানচিত্র = পাঠ-কেবল-স্ন্যাপশট (setHints-ইনপুট-নয় — hr340-ডক-কৃত-অর্থবিদ্যা-উত্তরাধিকার); এক-উৎস-কাউন্টার-নোট: মোড-নির্দিষ্ট-পথের RAW-স্ন্যাপশট = hr340-raws-স্বাভাবিক-বৃদ্ধি (getHintsOrig341-নো-আর্গ-পথ — raw() QA-হুক-বাইপাস-ডক-কৃত-অটুট); **.hr341-msel + .hr341-mbtn মোড-নির্বাচক-রপ্তাই** (স্বতন্ত্র-শ্রেণি-জুটি — s326-.hr326-fmt-রীতি — **s324-.hr324-btn-গণনা-চুক্তি-অটুট** — querySelectorAll('.hr324-btn')=২): স্বতন্ত্র-বার .hr324-bar.hr341-bar (hr340-বার-রীতি — hr339/hr340-বারে-সংযোজন-নিষিদ্ধ-উত্তরাধিকার); নির্মাণ = trOrig341-চেইন (hr340-পরে); গেট = **বার-পরিবার-দৃশ্যমানতা** (hist317.length ≥১ ∨ storeN339() ≥১ — শূন্য-অবস্থায় নীরব — hr324-দর্শন); ডুপ-রক্ষা + পরিবার-শূন্যে-নিজস্ব-বার-সিঙ্ক-অপসারণ (**ensureMsel341 এক-উৎস** — **চতুর্মোড়ক-জীবন্ত-সিঙ্ক**: trOrig341-চেইন + persist337-মোড়ক + q337h.clearStore-মোড়ক + **cycleFmt326-মোড়ক (fmtOrig341-চেইন — মোড-বদলে-নির্বাচক-ডিফল্ট-তাৎক্ষণিক-রি-সেট + fmt-sync-মার্কার — cf332-রীতি)** — regOrig334-চেইন-রীতি — রি-রেন্ডার-বিহীন — ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪); নির্বাচক-অপশন ×৩ = fmtLabel331-লেবেল (সমৃদ্ধ/কেবল-কী/JSON — নির্মাণ-কালে বর্তমান-মোড-ডিফল্ট) + change-এ aria-বদল; বাটন-কপি = q333h.getHints(নির্বাচিত-মোড) → JSON.stringify(…, null, 2) — **রেকর্ড-বিহীন** (copyHist324-রীতি — copyAria316-বর্জন-ইচ্ছাকৃত — ইতিহাস-গণনা-দূষণ-শূন্য): navigator.clipboard.writeText-সরাসরি + fallbackCopy316-ফলব্যাক + টোস্ট ('মোড-নির্দিষ্ট হিন্ট-মানচিত্র কপি হয়েছে (N-কী — বিন্যাস: X)') + .hr341-done-ফ্ল্যাশ (১.২s); কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339/hr340-উত্তরাধিকার — ওভারলে-৮-সারি-স্থায়িত্ব); চুক্তি: ovRows330/registry/kbd-লাইন/storage-অস্পৃশ্য; hr338-diff/hr337-restored/hr336-batched/hr339-/hr340-শ্রেণি-বার-অস্পৃশ্য (একক-দায়িত্ব); `__hrAria341QA {getm, invalids, copies, last, msel(), mbtn(), bar(), modeResolved(m), err}` — সারি-শূন্যে-ও-সংজ্ঞায়িত; s340/s339/s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট।

**[Mandatory-স্টাইল] sfs341 — মোড-নির্বাচক-রপ্তাই-স্টাইল (admin-ইনলাইন):** home-reorder.ejs ইনলাইন-<style> session341-ব্লক (কেবল-সংযোজন — হেক্স-শূন্য rgba-only — **cascade-অবস্থান session340-ব্লক-পরে**) — .hr341-msel/.hr341-mbtn **বেগুনি-মোড-রপ্তাই-টোন** (rgba(109,40,217)-পরিবার — নীল-রিড/সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-পরিবার-বিভাজন-বৃদ্ধি — মোড-সচেতন-সংকেত); .hr341-mbtn dashed-বর্ডার (বিন্যাস-নির্বাচক-রীতি-উত্তরাধিকার) + .hr341-msel solid-বর্ডার (native-select-সম্মত); hover/focus-visible-জুটি + :active scale(0.97) + .hr341-done-ফ্ল্যাশ-অবস্থা rgba(124,58,237)-পরিবার; prefers-reduced-motion + 640px-কম্প্যাক্ট (0.52rem); নতুন-উপাদান-স্টাইল-কেবল (বিদ্যমান-উপাদান-অস্পৃশ্য); সর্ব-ব্যান্ড; MO=৪-অটুট; style.css = session341/340/339-শূন্য (admin-CSS-চুক্তি-প্রমাণ) + session334 ×২-অটুট।

**টেস্ট:** নতুন tests/s341-suite.sh **৩৩/০/০ ×২-ধারাবাহিক** (পরিবেশ ×৩ + কাঠামো ×৮ {রেফারেন্স ×২৮ + node --check + হেক্স-শূন্য + মার্কার ×২ + cascade + style.css-চুক্তি + শ্রেণি-রেফারেন্স + MODES341-এক-সংজ্ঞা} + SSR ×৩ + hr341-ই২ই ×১২ — হুক-সহাবস্থান + মোড-নির্দিষ্ট-রেজলিউশন {getHints('json')-F='JSON' mode326='rich'-তেও + RAW-অটুট + এক-উৎস-কাউন্টার raws=২/getr=১} + দ্বি-পথ-সমতা {getHints(mode326)≡getHints(true)} + প্রতি-কলে-নতুন-অবজেক্ট + অবৈধ-মোড-স্ট্রিং {RAW + getm:invalid + invalids=১} + পরিবার-গেট-দর্শন + জীবন্ত-সিঙ্ক-অন {অপশন ×৩ + বর্তমান-মোড-ডিফল্ট + hr339/hr340-সহাবস্থান} + জীবন্ত-সিঙ্ক-অফ {নিজস্ব-বার-সম্পূর্ণ-অপসারণ + hr340-বার-সমতা} + নির্মাণ-পথ+পবিত্রতা + মোড-নির্বাচক-রপ্তাই-কপি {json-নির্বাচন → ক্লিপবোর্ড F='JSON' + সমৃদ্ধ-বিহীন — mode326='rich'-সত্ত্বেও + copies=১ + .hr341-done + ইতিহাস-গণনা-অপরিবর্তিত — রেকর্ড-বিহীন-প্রমাণ} + fmt-sync-জীবন্ত-সিঙ্ক {.hr326-fmt-ক্লিকে নির্বাচক-রি-সেট rich→key} + সর্ব-হুক-ত্রুটি-শূন্য; sfs341-মোবাইল ×২; পরিষ্কারণ-চুক্তি {hr337-hints + hr326-fmt + hr321-hist} + নেট-শূন্য)। **রিগ্রেশন সর্ব-গ্রিন:** s340 ২৯ + s339 ৪৮ (s338–s306-পূর্ব-রাউন্ডে-সর্ব-গ্রিন — সহাবস্থান-অস্পৃশ্য-চুক্তি) + guard:design + audit:views (১২৩ ejs)। প্যাচ scripts/s341-patch.py idempotent ×২ (২-ধাপ — JS+CSS উভয়ে-ইনলাইন)।

**গোটচা ×২ (নতুন):** ① **nested-ternary-eval-সিনট্যাক্স** — সুইট-eval-এ `s?A?B:''`-রূপ = outer-false-ব্রাঞ্চ-অনুপস্থিত → agent-browser-eval-নীরব-ব্যর্থ (empty-stdout — LSY/FSYNC ×২-ব্যর্থতা → `s?s.value:''`-সরলীকরণ — কোড-বাগ-নয়); ② **এক-উৎস-কাউন্টার-অর্থবিদ্যা** — মোড-নির্দিষ্ট-পথের RAW-স্ন্যাপশট = getHintsOrig341()-নো-আর্গ → hr340-raws-বৃদ্ধি (raw() = QA-হুক-বাইপাস-ডক-কৃত — raws=২/getr=১-প্রত্যাশা-সংশোধন — assert-ত্রুটি-কোড-বাগ-নয়)। উত্তরাধিকার-গোটচা ×৮-অটুট (সুইট-রেসিপি-ক্রম + স্টোর-স্ন্যাপশট + ব্যাচ-টোন + শ্রেণি-বিলম্ব + কাউন্টার-ডেল্টা + admin-style.css-অলোড + immutable-ক্যাশ + মোবাইল-রেসিপি)। ডক-ত্রয়ী: PROJECT §৩৪১ + PLANS session341-নোট + repo-worklog Task 178 (s341-docs.py idempotent ×২)।

"""

PLANS_341 = """
## session341-নোট (cron 403679 — hr341 getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই + sfs341 স্টাইল)
- **মোড-নির্দিষ্ট-getHints-চুক্তি (hr341):** q333h.getHints('rich'|'key'|'json') = নির্দিষ্ট-মোডে-রেজলভড-মানচিত্র (MODES341-রেজিস্ট্রি-মিরর — RAW-স্ন্যাপশট-উপরে {fmt}→fmtLabel331(modeStr)-কল-টাইম — **mode326-অস্পৃশ্য** — রিড-পবিত্রতা); getHints()=RAW-অটুট (s338-রাউন্ড-ট্রিপ); getHints(true)=বর্তমান-মোডে-রেজলভড-অটুট (hr340); **getHints(mode326)≡getHints(true) দ্বি-পথ-সমতা-প্রমাণিত**; অবৈধ-স্ট্রিং-মোড = RAW + getm:invalid (শূন্য-অনুমান — diffHints/setHints-রীতি); প্রতি-কলে-নতুন-অবজেক্ট; রেজলভড-মানচিত্র setHints-ইনপুট-নয় (hr340-ডবল-রেজলিউশন-নিষেধ-উত্তরাধিকার); এক-উৎস-কাউন্টার-নোট: মোড-পথের RAW-স্ন্যাপশট = hr340-raws-স্বাভাবিক-বৃদ্ধি (raw() = QA-হুক-বাইপাস-অটুট)।
- **স্বতন্ত্র-বার-চুক্তি-বৃদ্ধি (hr341):** .hr341-msel/.hr341-mbtn = সর্বদা-নিজস্ব-বার .hr324-bar.hr341-bar — hr339/hr340-বারে-সংযোজন-নিষিদ্ধ-উত্তরাধিকার; গেট = বার-পরিবার-দৃশ্যমানতা (hist≥১ ∨ store≥১); **চতুর্মোড়ক-জীবন্ত-সিঙ্ক** (trOrig341 + persist337 + q337h.clearStore + **cycleFmt326-মোড়ক fmt-sync** — cf332-রীতি — মোড-বদলে-নির্বাচক-ডিফল্ট-তাৎক্ষণিক-রি-সেট — sync:on/off + fmt-sync-মার্কার); নির্মাণ-কালে-বর্তমান-মোড-ডিফল্ট + change-এ aria-বদল।
- **রেকর্ড-বিহীন-কপি-চুক্তি-উত্তরাধিকার (hr341):** .hr341-mbtn-কপি = copyHist324-রীতি (clipboard-সরাসরি + fallbackCopy316 + নিজস্ব-টোস্ট + .hr341-done-ফ্ল্যাশ) — copyAria316-বর্জন-ইচ্ছাকৃত (ইতিহাস-গণনা-দূষণ-শূন্য-প্রমাণিত); কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — ওভারলে-৮-সারি-স্থায়িত্ব)।
- **session340-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প-পূর্ণ** (getHints-মোড-স্ট্রিং-সম্প্রসারণ) + ①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন (vercel home-200 + session334-মার্কার ×২-লাইভ-style.css-এ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated + session340-মার্কার-পাবলিক-পাঠে-শূন্য = d9089a4-ডিপ্লয়-প্রমাণ) + **register-'W'-সম্পূর্ণ-কীবোর্ড-parity = অপ্রয়োগিত** (১ম-বিকল্প — ওভারলে-গণনা-সুইট-বিবর্তন-জুটি-ব্যয় — এখনো-মুক্ত) + **csv-চতুর্থ-মোড = অপ্রয়োগিত-অপরিবর্তিত** (সুইট-বিবর্তন-ব্যয়-উচ্চ) + **③ ব্যাজ-প্রস্থ-সচেতন-গাটার = স্থায়ী-স্থগিত-অপরিবর্তিত** + **④ bot-সিঙ্ক/Turso = গেটে-অক্ষুণ্ণ**।
- **সুইট-গোটচা ×২ (নতুন — PLANS-ডক-কৃত):** ① nested-ternary-eval-সিনট্যাক্স (`s?A?B:''` = outer-false-ব্রাঞ্চ-অনুপস্থিত → eval-নীরব-ব্যর্থ → `s?s.value:''`-সরলীকরণ — কোড-বাগ-নয়) ② এক-উৎস-কাউন্টার-অর্থবিদ্যা (মোড-পথ-RAW-স্ন্যাপশট = hr340-raws-বৃদ্ধি — raw() = QA-হুক-বাইপাস — assert-প্রত্যাশা-সংশোধন)।
- **মাল্টি-এজেন্ট-চুক্তি-অব্যাহত:** প্রতি-পুশের-আগে fetch+BEHIND-যাচাই + সংঘর্ষে pull --rebase + লেবেল-সংঘর্ষে কনটেন্ট-লেবেল (sfs/hr/epk) + তাদের-অঞ্চল (epk/today.ejs/feed-motion-scene) অস্পৃশ্য + পঞ্চম-MO-চুক্তি (MO=৪); রাউন্ড-আরম্ভে রিমোট-ব্রাঞ্চ-নোটিশ (`feat/feed-motion-scene-premium` — তাদের-ওয়ার্কস্পেস — অস্পৃশ্য)।
- **পরের-এজেন্ট: session342 (Task ID 179)।** বাকি-প্রস্তাব: ① sfs341/hr341-প্রোড-স্পট (HTTP-পাঠ — প্রোড-অ্যাডমিন-ক্রেড-গেটেড-রীতি — session341-ইনলাইন-মার্কার = admin-HTML-অনুপস্থিত-পাবলিক-পাঠে — ফিড-সাইড-মার্কার-শূন্য-ই-প্রত্যাশিত) ② hr342 (admin): **register-'W'-সম্পূর্ণ-কীবোর্ড-parity** (hr339-ক্লিয়ার-বাটন-নথিভুক্তকরণ — ovRows330-৮→৯ + ওভারলে-গণনা-সুইট-বিবর্তন-জুটি — মূল্যায়ন-পূর্বক) অথবা **getHints-মাল্টি-মোড-ব্যাচ** (getHints(['json','rich']) = বহু-মোড-মানচিত্র-জুটি — hr341-চুক্তি-প্রসারিত) অথবা ইতিহাস-রপ্তাই 'csv'-চতুর্থ-মোড (সুইট-বিবর্তন-ব্যয়-উচ্চ — সতর্ক-মূল্যায়ন) ③ sfs342 (feed): ব্যাজ-প্রস্থ-সচেতন-গাটার-গবেষণা (স্থায়ী-স্থগিত) ④ bot-সিঙ্ক + Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""

WLOG_178 = """
## Task 178 — session341: hr341 getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই + sfs341 স্টাইল (২৫ সেপ্টেম্বর ২০২৬)
- **রাউন্ড:** cron 403679 (trace `…202609251612`); রাউন্ড-আরম্ভে HEAD=origin=`d9089a4` (session340), clean-tree, BEHIND=০/AHEAD=০; agent-browser-QA বেসলাইন সবুজ (local home/epaper-200 + admin-গেট 302-লোকেশন + s340-সুইট ২৯/০/০) + **প্রোড-স্পট** (vercel home-200 + session334-মার্কার ×২-লাইভ-style.css-এ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated + session340-মার্কার-পাবলিক-পাঠে-শূন্য = d9089a4-ডিপ্লয়-প্রমাণ — PLANS session340-প্রস্তাব-①-যাচাই-সম্পন্ন)। বাগ-শূন্য-স্থিতিশীল → PLANS session340-নোটের **প্রস্তাব-②-দ্বিতীয়-বিকল্প গ্রহণ** (getHints-মোড-স্ট্রিং-সম্প্রসারণ; register-'W'-parity = অপ্রয়োগিত-মুক্ত {ওভারলে-গণনা-সুইট-বিবর্তন-জুটি-ব্যয়}; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)।
- **[Mandatory-ফিচার] hr341 (admin/home-reorder.ejs — hr340-IIFE-অভ্যন্তরে):** getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন (getHintsOrig341-চেইন + MODES341-রেজিস্ট্রি-মিরর — RAW-স্ন্যাপশট-উপরে {fmt}→fmtLabel331(modeStr) — mode326-অস্পৃশ্য — অবৈধ-মোড = RAW + getm:invalid — দ্বি-পথ-সমতা getHints(mode326)≡getHints(true)) + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই (স্বতন্ত্র-শ্রেণি-জুটি/বার — পরিবার-গেট — **চতুর্মোড়ক-জীবন্ত-সিঙ্ক** ensureMsel341-এক-উৎস {trOrig341 + persist337 + clearStore + cycleFmt326 fmt-sync} — রেকর্ড-বিহীন-কপি + .hr341-done-ফ্ল্যাশ); s324-.hr324-btn-গণনা-চুক্তি-অটুট + ovRows330-৮-সারি-অটুট + কীবোর্ড-parity-ইচ্ছাকৃত-অনুপস্থিত; __hrAria341QA {getm, invalids, copies, last, msel(), mbtn(), bar(), modeResolved(m), err}।
- **[Mandatory-স্টাইল] sfs341 (home-reorder.ejs ইনলাইন-<style> session341-ব্লক — cascade-অবস্থান session340-পরে):** .hr341-msel/.hr341-mbtn বেগুনি-মোড-রপ্তাই-টোন rgba(109,40,217)-পরিবার (নীল-রিড/সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-বিভাজন-বৃদ্ধি) + mbtn-dashed/msel-solid + hover/focus-visible + :active-scale + .hr341-done-ফ্ল্যাশ + reduced-motion + 640px-কম্প্যাক্ট; হেক্স-শূন্য rgba-only; নতুন-উপাদান-স্টাইল (বিদ্যমান-অস্পৃশ্য); সর্ব-ব্যান্ড; MO=৪-অটুট; style.css = session341/340/339-শূন্য।
- **টেস্ট:** নতুন tests/s341-suite.sh **৩৩/০/০ ×২-ধারাবাহিক** (কাঠামো ×৮ + SSR ×৩ + hr341-ই২ই ×১২ + মোবাইল ×২ + পরিষ্কারণ-চুক্তি + নেট-শূন্য)। রিগ্রেশন: s340 ২৯/০/০ + s339 ৪৮/০/০ (s338–s306 পূর্ব-রাউন্ডে-সর্ব-গ্রিন — সহাবস্থান-অস্পৃশ্য-চুক্তি)।
- **গোটচা ×২:** nested-ternary-eval-সিনট্যাক্স (LSY/FSYNC ×২-ব্যর্থতা → `s?s.value:''`-সরলীকরণ — কোড-বাগ-নয়) + এক-উৎস-কাউন্টার-অর্থবিদ্যা (মোড-পথ-RAW-স্ন্যাপশট = hr340-raws-বৃদ্ধি — raw() = QA-হুক-বাইপাস — প্রত্যাশা-সংশোধন)। উত্তরাধিকার-গোটচা ×৮-অটুট।
- **প্যাচ/ডক:** scripts/s341-patch.py (idempotent ×২ — ২-ধাপ — JS+CSS উভয়ে-ইনলাইন) + s341-docs.py (এ-ফাইল-ত্রয়ী); PLANS session341-নোটে session342-প্রস্তাব ×৪ (প্রোড-স্পট + register-'W'-parity/getHints-মাল্টি-মোড-ব্যাচ/csv-চতুর্থ-মোড + গাটার-গবেষণা + bot-সিঙ্ক-গেটেড)।
"""

def main():
    n = 0
    n += insert_once(PROJ, PROJECT_341, '## §৩৪০ (session340', before=True, name='PROJECT-§৩৪১')
    s = load(PLANS)
    probe = PLANS_341.strip().splitlines()[0]
    if probe in s:
        print("  skip PLANS-session341 (already-applied)")
    else:
        save(PLANS, s.rstrip('\n') + '\n' + PLANS_341)
        print("  ok   PLANS-session341 (append)")
        n += 1
    s = load(WLOG)
    probe = WLOG_178.strip().splitlines()[0]
    if probe in s:
        print("  skip WLOG-Task178 (already-applied)")
    else:
        save(WLOG, s.rstrip('\n') + '\n' + WLOG_178)
        print("  ok   WLOG-Task178 (append)")
        n += 1
    print(f"s341-docs: {n} সন্নিবেশ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
