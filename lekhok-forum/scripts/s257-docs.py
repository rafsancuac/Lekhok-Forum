#!/usr/bin/env python3
# s257-docs.py — session257 ডক ×২ (PROJECT §২৫৭ + PLANS session257-নোট; repo-worklog Task 97 push-পরে-হ্যাশসহ)
import io

A = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum"

# ── ১. PROJECT.md — §২৫৭ সন্নিবেশ (§২৫৬-এর-আগে) ──
p_proj = A + "/PROJECT.md"
with io.open(p_proj, encoding="utf-8") as f: proj = f.read()
if "§২৫৭" in proj:
    print("SKIP: PROJECT §২৫৭ present")
else:
    sec = """## §২৫৭ (session257 — cron 403679: ট্র্যাশ তাৎক্ষণিক-ফিল্টার tr257 + প্রোডাকশন-প্রবাহ-সিড-চুক্তি) — s257 ৪৩/৪৩ ×২ (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`842a2e7` (session256, clean-tree); GH /user→200; live-200; স্টেল-সামারি-শূন্য (ACTIVE-LOCK-সরাসরি-গৃহীত)। রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s256 ৩৮/৩৮ + s255 ৩৯/৩৯ + s254 ৩৬/৩৬ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (ফিল্টার-প্যাক-ধারা অব্যাহত: ট্র্যাশ-সারফেস)।

**[Mandatory-ফিচার] ট্র্যাশ তাৎক্ষণিক-ফিল্টার (tr257):** /moderator/trash (admin/views/admin/trash.ejs — moderatorView-মোড) — `data-tr-row`-সারি-সূচক + `data-kw` (#আইডি + টেবিল + স্ন্যাপশট-শিরোনাম + payload-স্নিপেট ৪০০-ক + মুছেছেন + সময়) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-কী ফোকাস (field-গার্ড + modifier-বাদ) + Escape ক্লিয়ার+ব্লার + clear-বাটন + **__trQA হুক (total/count/apply/clear)**; GET-q-সার্চ + টেবিল-সিলেক্ট + restore-all + data-bulk-all অক্ষুণ্ণ; hidden-গার্ড ×৩ (`.table tr[data-tr-row][hidden]` + `.tr-count-chip[hidden]` + `.tr-zero[hidden]` — session256-শিক্ষা প্রি-অ্যাপ্লাইড)।

**[Mandatory-স্টাইল]:** tr257 ব্লক **হেক্স-শূন্য টোকেন-শুধু** — color-mix brandgreen ফোকাস-রিং + dashed kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন + tr-zero টোকেন-বক্স।

**সিড-চুক্তি (প্রোডাকশন-প্রবাহ — s254-নীতি-বর্ধন):** ট্র্যাশ-মার্কার-শূন্য-হলে **নোটিশ-তৈরি (POST /moderator/notices 'qa257trash') → bulk-delete → ট্র্যাশে ১-সারি** (redirect `trashed=<tid>`-পার্সিং; প্রতি-POST-আগে ফ্রেশ-GET-_csrf); সুইট-শেষে **মার্কার-সারি bulk-purge** (/admin/trash/bulk-purge — testadmin=admin) → QA-DB-নিরাময়; ব্যর্থ-রানের-অবশিষ্ট-মার্কার-সারি পরের-রানে পুনঃ-ব্যবহৃত-ও-পরিষ্কার (স্বয়ং-নিরাময়ী idempotent); মার্কার-প্রোব 'qa257trash' → **নির্ধারক-১-মিল** (ডেটা-স্বাধীন অ্যাসার্ট)।

**টেস্ট:** নতুন tests/s257-trashfilter-suite.sh **৪৩/৪৩ ×২-ধারাবাহিক** (কাঠামো ×১২ + স্টাইল ×৯ + আচরণ ×৮ রিয়েল-ব্রাউজার + সিড ×৩ + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + পরিষ্কারক) + role-policy ২৬০/২৬০ + guard:design-গ্রিন + audit:views-গ্রিন (১২২ ejs)।

**গোটচা (PLANS session257):** gawk-৩-প্যারামিটার-match মawk-অসমর্থিত (capture-array → RSTART/substr-বিকল্প) · admin-ভিউ-রেজোলিউশন `app.set('views', [views, admin/views])` নেস্টেড-প্যাটার্ন (admin/views/admin/*.ejs) · moderatorView-মোডে bulkBar/পার্জ-বোতাম-লুকানো (অ্যাসার্ট-বাদ)।

"""
    anchor = "## §২৫৬"
    i = proj.index(anchor)
    proj = proj[:i] + sec + proj[i:]
    with io.open(p_proj, "w", encoding="utf-8") as f: f.write(proj)
    print("PROJECT §২৫৭ সন্নিবেশিত")

# ── ২. PLANS.md — session257-নোট (টেইলে) ──
p_plans = A + "/PLANS.md"
with io.open(p_plans, encoding="utf-8") as f: plans = f.read()
if "session257-নোট" in plans:
    print("SKIP: PLANS session257-নোট present")
else:
    plans += """
## session257-নোট (cron 403679 — ট্র্যাশ তাৎক্ষণিক-ফিল্টার tr257)
- **gawk-৩-প্যারামিটার-match-শ্রেণি (নতুন, পোর্টেবিলিটি):** `match($0, /re/, arr)` (capture-array) **mawk-অসমর্থিত** — সুইট প্রথম-রানেই সাইলেন্ট-শূন্য-ফেরত-ঝুঁকি; সঠিক: mawk-নিরাপদ `match($0, /re/)` + RSTART/RLENGTH + substr (এ-রাউন্ডে CTID-এক্সট্র্যাকশন এ-ভাবেই-লেখা; mawk-RS-মাল্টি-লাইন-গোটচা-সহ {print;exit}-অভ্যাস)।
- **admin-ভিউ-নেস্টেড-রেজোলিউশন (আবিষ্কার):** `app.set('views', [views, admin/views])` — `res.render('admin/trash')` প্রকৃতে **admin/views/admin/trash.ejs** (admin/views/admin/ নেস্টেড); admin-সারফেস-প্যাচের-আগে find দিয়ে প্রকৃত-পাথ নিশ্চিত করুন (views/-এ-হাতড়ানো-বৃথা)।
- **প্রোডাকশন-প্রবাহ-সিড-চুক্তি-বর্ধন (ট্র্যাশ-ক্লাস):** ট্র্যাশ-তালিকা-সারফেস প্রকৃতির সুইটে সফট-ডিলিট-ই-সিড — নোটিশ-তৈরি (POST /moderator/notices + ফ্রেশ-GET-_csrf-প্রতি-POST-এ) → bulk-delete (redirect `trashed=<tid>`-পার্সিং) → সুইট-শেষে মার্কার-সারি **bulk-purge** (/admin/trash/bulk-purge ids= — testadmin=admin, moderatorView-মোড-সত্ত্বেও admin-এন্ডপয়েন্ট-প্রবেশযোগ্য); মার্কার-কীওয়ার্ড ('qa257trash') data-kw-তে-থাকায় প্রোব-নির্ধারক (ডেটা-স্বাধীন-১-মিল); HTML-id-ডিসকভারি = awk RS='</div>' + marker-record + value="N" (mawk-নিরাপদ)।
- **tr257-সারফেস-চুক্তি:** হুক **__trQA** (total/count/apply/clear); সারি-গণনা = `data-tr-row="[0-9]*"`; সারফেস script-শূন্য (একমাত্র আমাদের IIFE — 'f' সংঘর্ষ-মুক্ত, '/'-গ্লোবাল-হ্যান্ডলারও-শূন্য); hidden-গার্ড ×৩ প্রি-অ্যাপ্লাইড (চিপ+শূন্য-বক্স [hidden]-জোড়া — session256-শিক্ষা); moderatorView-মোডে bulkBar/purge-বোতাম-লুকানো — no-regression-অ্যাসার্ট restore-all/data-bulk-all-কেন্দ্রিক।
- **পরের-এজেন্ট: session258 থেকে (worklog Task ID 98)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়); বাকি-প্রস্তাব: moderator-press/sections/notice-সারফেস ফিল্টার-প্যাক (tr257-প্যাটার্ন-মিরর), s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
"""
    with io.open(p_plans, "w", encoding="utf-8") as f: f.write(plans)
    print("PLANS session257-নোট সংযোজিত")

print("docs-a done")
