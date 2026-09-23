#!/usr/bin/env python3
# s256-docs.py — session256 ডক ×৩ (PROJECT §২৫৬ + PLANS session256-নোট; repo-worklog Task 96 পরে-আলাদা-হ্যাশসহ)
import io, sys

A = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum"

# ── ১. PROJECT.md — §২৫৬ সন্নিবেশ (§২৫৫-এর-আগে, নতুনতম-প্রথম) ──
p_proj = A + "/PROJECT.md"
with io.open(p_proj, encoding="utf-8") as f: proj = f.read()
if "§২৫৬" in proj:
    print("SKIP: PROJECT §২৫৬ already present")
else:
    sec256 = """## §২৫৬ (session256 — cron 403679: লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার cu256 + [hidden]-ডিসপ্লে-ওভাররাইড বাগ-ফিক্স) — s256 ৩৮/৩৮ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`d2abbf7` (session255, clean-tree); GH /user→200; live-200; স্টেল-সামারি-সংশোধন ×২২ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল; ACTIVE-LOCK-ই-সত্য)। রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s255 ৩৯/৩৯ + s254 ৩৬/৩৬ + s253 ৩৫/৩৫ + s251 ৩১/৩১ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (session255-বাকি-প্রস্তাব গ্রহণ: curation-ফিল্টার-প্যাক)।

**[Mandatory-ফিচার] লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার (cu256):** /moderator/curation-এ সার্ভার-রাউন্ড-ট্রিপ-হীন ক্লায়েন্ট-সাইড সংকীর্ণ (mm255/mc254-চুক্তি-মিরর) — `data-cu-row`-সারি-সূচক + `data-kw` (শিরোনাম + অনুচ্ছেদ + লেখক-নাম + @ইউজারনেম + ধরন-লেবেল + অবস্থা-শব্দ হোম/প্রচ্ছদ/সেরা-লেখক/লুকানো/তালিকায়-বাদ/সোশ্যাল) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-কী ফোকাস (field-গার্ড + modifier-বাদ) + Escape ক্লিয়ার+ব্লার + clear-বাটন + **__cuQA হুক (total/count/apply/clear)**; GET-সার্চ + kindchips + quick-নির্বাচন/খালি + curList সম্পূর্ণ অক্ষুণ্ণ; hidden-গার্ড (`.cur-item[data-cu-row][hidden] { display:none !important }`)।

**[Mandatory-স্টাইল]:** cu256 ব্লক **হেক্স-শূন্য টোকেন-শুধু** (guard-র্যাচেট-নিরাপদ) — ফোকাস-রিং color-mix brandgreen-tint + kbd-পিল (dashed affordance) + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন (kbd-none) + cu-zero টোকেন-বক্স।

**বাগ-ফিক্স (ভিজ্যুয়াল-QA-আবিষ্কৃত):** `.cu-count-chip{display:inline-flex}` UA-`[hidden]{display:none}`-কে ওভাররাইড করত — স্ক্রিনশটে খালি-ইনপুটে স্টেল "০ / ১২" চিপ ধরা পড়েছে → `.cu-count-chip[hidden] { display: none; }` গার্ড + সুইটে clear-পরবর্তী computed-display-অ্যাসার্ট।

**টেস্ট:** নতুন tests/s256-cufilter-suite.sh **৩৮/৩৮ ×২-ধারাবাহিক** (কাঠামো ×১৩ + স্টাইল ×৮ + আচরণ ×১২ রিয়েল-ব্রাউজার — ১২-বাস্তব-সারি সিড-শূন্য + @ইউজারনেম-প্রোব + 390px-hScroll-শূন্য + স্ক্রিনশট ×২) + role-policy ২৬০/২৬০ + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs)।

**গোটচা (PLANS session256):** KeyboardEvent-bubbles-false (synthetic dispatch-এ document-লিসেনার-বিহীন; s255-এর 'f'-অ্যাসার্ট অবশিষ্ট-ফোকাস-মিথ্যা-পাস ছিল) · [hidden]-display-ওভাররাইড (display-set-এলিমেন্টে hidden-অকার্যকর — গার্ড-জোড়া বাধ্যতমূলক) · grep-regex-এ `[hidden]`-ক্যারেক্টার-ক্লাস (containsF-ই-সত্য)।

"""
    anchor = "## §২৫৫"
    i = proj.index(anchor)
    proj = proj[:i] + sec256 + proj[i:]
    with io.open(p_proj, "w", encoding="utf-8") as f: f.write(proj)
    print("PROJECT §২৫৬ সন্নিবেশিত")

# ── ২. PLANS.md — session256-নোট সংযোজন (টেইলে) ──
p_plans = A + "/PLANS.md"
with io.open(p_plans, encoding="utf-8") as f: plans = f.read()
if "session256-নোট" in plans:
    print("SKIP: PLANS session256-নোট already present")
else:
    plans += """
## session256-নোট (cron 403679 — লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার cu256)
- **KeyboardEvent-bubbles-false-শ্রেণি (নতুন, সুইট-মিথ্যা-পাস):** `document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f"}))` — bubbles-ডিফল্ট-false → body-টার্গেট-ইভেন্ট document-বাবল-লিসেনারে **পৌঁছায়-না** (প্রোব-প্রমাণ no-bubble/bubbled-true)। s255-এর 'f'-ফোকাস-অ্যাসার্ট আসলে **অবশিষ্ট-ফোকাস-মিথ্যা-পাস** ছিল — mm255-এর clear() blur-করে-না, আগের fill-এর ফোকাস-ই অ্যাসার্ট-মিলিয়ে-দেয়; cu256-এর clear() কনভেনশন-মতো blur-করায় শ্রেণিটি ধরা-পড়ে। **সুইট-প্যাচ:** document-লিসেনার-টেস্টে `{bubbles:true}` বাধ্যতমূলক; পুরাতন-সুইটের 'f'-অ্যাসার্ট এ-শ্রেণিতে — বিশ্বাস-করার-আগে clear-পথ blur-আচরণ যাচাই করুন।
- **[hidden]-display-ওভাররাইড-শ্রেণি (নতুন, প্রোডাক্ট-বাগ):** author-CSS `display:inline-flex/flex` UA-`[hidden]{display:none}`-কে হারায় — hidden-অ্যাট্রিবিউট নীরবে-অকার্যকর, স্টেল-কাউন্ট-চিপ খালি-অবস্থায়-ও-দৃশ্যমান। **স্ক্রিনশট-মানব-চোখে-দেখাই-ধরেছে** (সুইট-অ্যাসার্ট মিস করেছিল) → নিয়ম: display-set-প্রতিটি hidden-ব্যবহারকারী-এলিমেন্টে `.x[hidden]{display:none}` গার্ড-জোড়া + সুইটে clear-পরে getComputedStyle-display-অ্যাসার্ট।
- **grep-regex `[hidden]`-ক্যারেক্টার-ক্লাস-শ্রেণি (পুনঃপ্রমাণিত):** contains (BRE)-এ `[hidden]` = h/i/d/e/n-ক্লাস — লিটারাল-ম্যাচ-অসম্ভব; ব্র্যাকেট-যুক্ত-প্যাটার্নে **containsF বাধ্যতমূলক** (এ-রাউন্ডে ১-মিথ্যা-ফেল; od-বাইট-যাচাইয়ে ফাইল-অক্ষত-প্রমাণিত — বাগ-ছিল সুইটের assert-ফাংশনে, ফাইলে-নয়)।
- **cu256-সারফেস-চুক্তি:** হুক **__cuQA** (total/count/apply/clear); সারি-গণনা = `data-cu-row="[0-9]*"` (CSS-গার্ড `]`-শেষ + JS-কোট-স্ট্রিং — ফ্যান্টম-মুক্ত); GET-সার্চ/kindchips/quick ×২/curList no-regression-অ্যাসার্ট; ভিউয়ার testadmin/demo123 (s254-চুক্তি); QA-DB-তে ১২-সারি (সিড-শূন্য); 'f'-keydown-স্ক্যান = মুক্ত (main.js/premium.js/sandbox-preview keydown-শূন্য-প্রমাণিত)।
- **পরের-এজেন্ট: session257 থেকে (worklog Task ID 97)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: moderator-users-স্কোপড-ভ্যারিয়েন্ট, s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং (ঐচ্ছিক-সুইট-স্বাস্থ্য), Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""
    with io.open(p_plans, "w", encoding="utf-8") as f: f.write(plans)
    print("PLANS session256-নোট সংযোজিত")

print("docs-a done")
