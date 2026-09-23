#!/usr/bin/env python3
# s258-docs.py — session258 ডক-ত্রয়ী (PROJECT §২৫৮ + PLANS session258-নোট + worklog Task 98)
# চুক্তি: idempotent (marker-সন্ধান → skip) + নির্দিষ্ট-অ্যাঙ্কর-সন্নিবেশ
import sys, io, os

BASE = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum"

def read(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def write(p, s):
    with io.open(p, "w", encoding="utf-8") as f:
        f.write(s)

# ── ১. PROJECT.md — §২৫৮ §২৫৭-হেডিং-এর-ঠিক-আগে ──
proj = os.path.join(BASE, "PROJECT.md")
src = read(proj)
if "## §২৫৮" not in src:
    block = """## §২৫৮ (session258 — cron 403679: পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার pr258 + multipart-CSRF-হেডার-চুক্তি) — s258 ৪৬/৪৬ + ৪৮/৪৮ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`b4957bd` (session257-worklog, clean-tree); স্টেল-সামারি-সংশোধন ×২৪ (সামারি Task43/'commit-হয়নি'/device-flow/'১২-ট্রিগার' যুগ — সব-ভুল; ACTIVE-LOCK Task97/session257-ই-সত্য; push-যুগ প্রমাণ `684a434`)। প্রোড-স্পট agent-browser: home/press/login 200×৩ + console-পরিষ্কার (main.js build-log শুধু)। বাগ-শূন্য → ফিচার-রাউন্ড (session257-বাকি-প্রস্তাব গ্রহণ: press-সারফেস)।

**[Mandatory-ফিচার] পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার (pr258):** /moderator/press (views/user/moderator-press.ejs) — tr257/cu256-চুক্তি-মিরর: `data-pr-row`-সারি-সূচক (details.clip-row) + `data-kw` (#আইডি + শিরোনাম + পত্রিকা + প্রকাশ-তারিখ + অবস্থা-শব্দ দৃশ্যমান/লুকানো + ক্রম + ছবি-URL — ছোট-হাতের) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-কী ফোকাস (field-গার্ড + modifier-বাদ) + Escape ক্লিয়ার+ব্লার + clear-বাটন + **__prQA হুক (total/count/apply/clear)**; bulk-bar (bulk-delete/bulk-toggle) + data-bulk-all + multipart যোগ-ফর্ম + clip-count + sf-section সম্পাদনা সম্পূর্ণ অক্ষুণ্ণ; hidden-গার্ড ×৩ (`.clip-row[data-pr-row][hidden]` + `.pr-count-chip[hidden]` + `.pr-zero[hidden]` — session256-শিক্ষা প্রি-অ্যাপ্লাইড)।

**[Mandatory-স্টাইল]:** pr258 ব্লক **হেক্স-শূন্য টোকেন-শুধু** (guard-র্যাচেট-নিরাপদ) — ফোকাস-রিং color-mix brandgreen-tint + kbd-পিল (dashed affordance) + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন (kbd-none) + pr-zero টোকেন-বক্স।

**টেস্ট:** নতুন tests/s258-pressfilter-suite.sh **৪৬/৪৬ (SKIP=১) + ৪৮/৪৮ (SKIP=০) ×২-ধারাবাহিক** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×১২ রিয়েল-ব্রাউজার — **multipart-POST প্রোডাকশন-প্রবাহ-সিড** ('qa258press' + image_url-পথ) + মার্কার-১-মিল + চিপ-টেক্সট + স্ট্যাটাস-শব্দ-প্রোব 'দৃশ্যমান' + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + পরিষ্কারক delete→ট্র্যাশ→bulk-purge স্বয়ং-নিরাময়ী #১৩০-প্রমাণ) + role-policy **২৬০/২৬০** + s257-স্লাইস **৪৩/৪৩** + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs)।

**গোটচা ×২ (PLANS session258):** **multipart-CSRF-হেডার** — CSRF-মিডলওয়্যার urlencoded/multipart-বডি-পার্স-পূর্বে চলে; multipart-POST-এ body._csrf-খালি → **`x-csrf-token`-হেডারই-পথ** (curl -F _csrf-অপর্যাপ্ত; `/?csrf=1`-রিডাইরেক্ট = লক্ষণ; urlencoded-POST-এ body._csrf-স্বাভাবিক-কারণ parser-মিডলওয়্যার-আগে) · **HTML-id-আবিষ্কার-সংকোচন** — প্রথম-সারি-ক্ষেত্রে RS='</details>'-রেকর্ডে যোগ-ফর্মের `value="0"` (sort_order) আগে-মিলে id=0-ফ্যান্টম → `name="bulk_ids" value="[0-9]+"`-অ্যাঙ্কর + gsub-ডিজিট-এক্সট্র্যাকশন (mawk-নিরাপদ)।

"""
    anchor = "## §২৫৭ (session257"
    i = src.find(anchor)
    if i < 0:
        print("FAIL: PROJECT §২৫৭-অ্যাঙ্কর-অনুপস্থিত"); sys.exit(1)
    src = src[:i] + block + src[i:]
    write(proj, src)
    print("OK: PROJECT §২৫৮ সন্নিবেশিত")
else:
    print("SKIP: PROJECT §২৫৮ পূর্ব-বিদ্যমান")

# ── ২. PLANS.md — টেইলে session258-নোট ──
plans = os.path.join(BASE, "PLANS.md")
src = read(plans)
if "session258-নোট" not in src:
    note = """
## session258-নোট (cron 403679 — পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার pr258)
- **multipart-CSRF-হেডার-শ্রেণি (নতুন, সিস্টেমিক):** CSRF-মিডলওয়্যার (server.js) `req.body._csrf` পড়ে **urlencoded/multipart-বডি-পার্স-পূর্বে** — urlencoded-POST-এ body পার্সড (express.urlencoded আগে চলে) কিন্তু multipart-এ multer/withUpload-রুট-অভ্যন্তরে → body._csrf-মিডলওয়্যারে-শূন্য → ব্লক (`/?csrf=1`)। **সমাধান: `x-csrf-token`-হেডার** (মিডলওয়্যারের ২য়-উৎস) — curl `-H "x-csrf-token: $TOK"`; ব্রাউজার-ফর্মে বাস্তবে কাজ করে কী-ভাবে সেটা যাচাই-বাকি (সম্ভবত main.js fetch-হেডার)। ফল: multipart-সিড-সুইট এখন সম্ভব (press-ক্লাস আপলোড-সারফেস)।
- **HTML-id-আবিষ্কার-অ্যাঙ্কর-শ্রেণি:** RS='</details>'/RS='<tr'-রেকর্ড-স্প্লিটে রেকর্ড-ব্যাপ্তি = পূর্ববর্তী-সমাপ্তি→বর্তমান-সমাপ্তি — প্রথম-সারি-ক্ষেত্রে ফাইল-শুরুও-রেকর্ডে (যোগ-ফর্মের `value="0"` sort_order id=0-ফ্যান্টম-করে)। সঠিক: সারি-অনন্য-অ্যাঙ্কর (`name="bulk_ids" value="[0-9]+"`) + `gsub(/[^0-9]/,"",s)`-এক্সট্র্যাকশন — s257-এর value="-সাধারণ-প্যাটার্ন প্রথম-সারিতে-ভঙ্গুর।
- **pr258-সারফেস-চুক্তি:** হুক **__prQA** (total/count/apply/clear); সারি-গণনা = `class="clip-row" data-pr-row="[0-9]*"` (details-সারফেস — tr-টেবিল-নয়); data-kw = #আইডি+শিরোনাম+পত্রিকা+তারিখ+অবস্থা-শব্দ+ক্রম+ছবি-URL; hidden-গার্ড ×৩ (সারি details + চিপ + শূন্য-বক্স); bulk-bar/multipart-যোগ-ফর্ম/sf-section অক্ষুণ্ণ; সিড = multipart-POST (image_url-পথ — ফাইল-অবশ্যক-নয়) + পরিষ্কারক delete→trashed=<tid>→/admin/trash/bulk-purge (s257-চুক্তি-পুনঃব্যবহার)।
- **পরের-এজেন্ট: session259 থেকে (worklog Task ID 99)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: moderator-notices/sections-সারফেস ফিল্টার-প্যাক (pr258-প্যাটার্ন-মিরর), s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""
    write(plans, src.rstrip("\n") + "\n" + note.lstrip("\n"))
    print("OK: PLANS session258-নোট যুক্ত")
else:
    print("SKIP: PLANS session258-নোট পূর্ব-বিদ্যমান")

# ── ৩. worklog.md — Task ID 98 এন্ট্রি ──
wl = os.path.join(BASE, "worklog.md")
src = read(wl)
if "Task ID: 98" not in src:
    entry = """
---
Task ID: 98
Agent: Main cron agent (session258 — cron 403679)
Task: প্রথমে অবস্থা-যাচাই + agent-browser QA → বাগ-শূন্য প্রমাণে ফিচার-রাউন্ড: পত্রিকা-কাটিং (/moderator/press) তাৎক্ষণিক-ফিল্টার pr258 (session257-বাকি-প্রস্তাব গ্রহণ) + [Mandatory] স্টাইল + সুইট + ডক + push

## এ-রাউন্ডে সম্পন্ন (session258)
- **রাউন্ড-আরম্ভ-যাচাই:** স্টেল-সামারি-সংশোধন ×২৪ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল; worklog ACTIVE-LOCK Task97/session257 `684a434`-ই-সত্য)। HEAD=origin=`b4957bd` clean-tree; প্রোড-স্পট agent-browser 200×৩ + console-পরিষ্কার
- **[Mandatory-ফিচার] পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার (pr258):** /moderator/press — data-pr-row + data-kw (#আইডি+শিরোনাম+পত্রিকা+তারিখ+অবস্থা-শব্দ+ক্রম+ছবি-URL) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape + clear + **__prQA হুক**; bulk-bar/multipart-যোগ-ফর্ম/clip-count/sf-section অক্ষুণ্ণ; hidden-গার্ড ×৩ (session256-শিক্ষা প্রি-অ্যাপ্লাইড)
- **[Mandatory-স্টাইল]:** pr258-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px)
- **সিড-চুক্তি-বর্ধন (multipart-ক্লাস):** মার্কার-কাটিং multipart-POST ('qa258press' — image_url-পথ, ফাইল-অবশ্যক-নয়) + **x-csrf-token-হেডার** (multipart-CSRF-গোটচা — body._csrf-মিডলওয়্যারে-শূন্য) → পরিষ্কারক delete→ট্র্যাহ→bulk-purge (s257-চুক্তি-পুনঃব্যবহার; #১৩০-প্রমাণ অবশিষ্ট=০)
- **টেস্ট:** নতুন tests/s258-pressfilter-suite.sh **৪৬/৪৬ + ৪৮/৪৮ ×২-ধারাবাহিক** (কাঠামো×১৫+স্টাইল×৯+আচরণ×১২ রিয়েল-ব্রাউজার + 390px-hScroll-শূন্য + স্ক্রিনশট×২) + role-policy **২৬০/২৬০** + s257-স্লাইস **৪৩/৪৩** + guard:design + audit:views গ্রিন + EJS-compile-প্রমাণ
- **গোটচা ×২ ডক-কৃত (PLANS session258):** multipart-CSRF-হেডার (x-csrf-token-ই-পথ) · HTML-id-আবিষ্কার-অ্যাঙ্কর (bulk_ids-অ্যাঙ্কর + gsub — যোগ-ফর্ম value="0"-ফ্যান্টম-বিতাড়ন)
- প্যাচ: scripts/s258-patch.py (skip-if-present + ইনভেন্টরি) + ডক ×৩ (PROJECT §২৫৮ + PLANS session258 + এ-এন্ট্রি) → fetch+rebase (সংঘর্ষ-শূন্য) → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session259 লেবেল (worklog Task ID 99)**; PLANS session258-নোট অবশ্যই-পড়ুন (multipart-CSRF-হেডার + id-অ্যাঙ্কর-শ্রেণি); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: moderator-notices/sections-সারফেস ফিল্টার-প্যাক (pr258-প্যাটার্ন-মিরর), s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
"""
    write(wl, src.rstrip("\n") + "\n" + entry)
    print("OK: worklog Task ID 98 যুক্ত")
else:
    print("SKIP: worklog Task ID 98 পূর্ব-বিদ্যমান")
