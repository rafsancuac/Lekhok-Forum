#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s276-docs.py — session276 ডক ×৩: PROJECT.md §২৭৬ + PLANS.md session276-নোট + repo worklog.md Task-116
প্রতিটি সম্পাদনা অ্যাঙ্কর-গণনা-যাচাইসহ (idempotent — পুনঃরানে SKIP)।
"""
import io, sys

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def rep(src, old, new, label, n=1):
    c = src.count(old)
    if c != n:
        fatal(f'{label} — অ্যাঙ্কর-গণনা={c} (প্রত্যাশা={n})')
    print('OK:', label)
    return src.replace(old, new, n)

def skip_if(marker, path):
    s = io.open(path, encoding='utf-8').read()
    if marker in s:
        print(f'SKIP: {path} — {marker[:40]} পূর্ব-উপস্থিত')
        return None
    return s

# ════════════════ PROJECT.md §২৭৬ ════════════════
P = 'PROJECT.md'
src = skip_if('## §২৭৬ (session276', P)
if src is not None:
    SEC = """## §২৭৬ (session276 — cron 403679: অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার an276 + epaper hex-ratchet-বাগ-ফিক্স + broadcast-সাইড-এফেক্ট-সচেতন-চুক্তি) — s276 ৫৯/৫৯ ×২ + epaperfix (২৩ সেপ্টেম্বর ২০২৬)

**রাউন্ড-আরম্ভ-যাচাই:** HEAD=origin=`99db47c` (session275-জোড়া + টুল-কমিট, clean-tree); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); স্টেল-সামারি-সংশোধন ×৪২। রাউন্ড-শুরু QA: s275 ৮২/৮২ — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড। **সারফেস-নির্বাচন-বিবর্তন:** PLANS session275-প্রস্তাবিত সিবলিং (super/settings.ejs + support-settings.ejs) পরিদর্শনে **ফর্ম/সার্চ-পৃষ্ঠা — তালিকা-সারফেস-নেই** → ফিল্টার-পরিবারের-অনুপযুক্ত; বিকল্প-গ্রহণ: session274-বাকি-প্রস্তাব **admin-সাব-তালিকা-ধারাবাহিকতা** — মডারেটর-সংস্করণ no259-সুইটেড (views/user/moderator-notices.ejs), admin-ভার্সন (admin/views/admin/notices/list.ejs) অফিল্টারড → **an276 নির্বাচিত**।

**[বাগ-ফিক্স — সর্বোচ্চ-অগ্রাধিকার] epaper.css hex-ratchet-লঙ্ঘন-সংশোধন (s226-অবদান):** guard:design-রাউন্ড-মাঝে ১-লঙ্ঘন আবিষ্কৃত (parallel session-226 epaper.css হেক্স ০→৪৭; ratchet-baseline ০) — **মূল-কারণ: ৫টি lf-টোকেন (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow) tokens.css-এ-ই-অনুপস্থিত ছিল — ইনলাইন-ফলব্যাক-নির্ভর (লোড-বেয়ারিং!)**। ফিক্স (baseline-bump-নয় — ডিজাইন-সিস্টেম-সঠিক পথ): tokens.css-এ অনুপস্থিত-টোকেন ×৬ সংযোজন (--lf-ink→var(--lf-fb-ink)-অ্যালায়াস, --lf-ink-mute→var(--lf-text-tertiary)-অ্যালায়াস, --lf-ink-soft: #4B4C4F, --lf-accent-soft→var(--accent-soft)-অ্যালায়াস, --lf-accent-glow→var(--accent-glow)-অ্যালায়াস, --lf-gold-badge: #E8A700) + epaper.css হেক্স-ফলব্যাক-স্ট্রিপ ×৪৩ + rgba-ফলব্যাক-স্ট্রিপ ×৮ + কাঁচা-হেক্স→টোকেন ×৪ → **হেক্স-গণনা ৪৭→০** (baseline-অক্ষুণ্ণ); computed-প্যারিটি-প্রমাণ (is-active bg rgb(0,106,78) + color rgb(255,255,255) — ফলব্যাক-ই-মান হুবহু-টোকেনে); epaper-পৃষ্ঠা ২০০; idempotent ×২; প্যাচ: scripts/s276-epaperfix.py (প্যাচ-নিরাপত্তা-চুক্তি: var-গণনা-অ্যাসার্ট-প্রথম-রানে-ধরা — ফাইল-অলিখিত)। **গোটচা:** parallel-রাউন্ড-কমিট guard-মিস-করে-যেতে-পারে (রাউন্ড-শুরু-গার্ড-রান-পুশ-আগে-আর-এ-বার-বাধ্যতমূলক)।

**[Mandatory-ফিচার] অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার (an276):** /admin/notices (admin/views/admin/notices/list.ejs — requireScope('notices')) — tr[data-an-row] + দ্বিভাষিক data-kw (#id + বিজ্ঞপ্তি notice + শিরোনাম title + ক্যাটাগরি category + তারিখ date — whitespace-নরমালাইজড ×৩) + ফিল্টার-স্ট্রিপ (anFilter276/anClear276/anCount276/kbd-hint — bulk-bar-এর-পরে, empty-শাখার-বাইরে always-rendered) + কাউন্ট-চিপ + শূন্য-অবস্থা (anZero276 data-an-empty — if/else-বন্ধের-পরে) + 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) + field-গার্ড (bulk_ids-checkbox-প্রোব — INPUT-গার্ড) + Escape + __anQA হুক; **পৃষ্ঠায়-প্রথম <script> সংযোজন** (addEventListener ০→৪); bulk-bar/data-bulk-all/data-bulk-msg ×৩/edit-delete-রুট অক্ষুণ্ণ।

**[Mandatory-স্টাইল]:** an276-ব্লক amber-পরিবার (var(--lf-amber-600/-ink/-soft/-soft-2)) হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active-প্রেস + reduced-motion + 640px) + hidden-গার্ড ×৩ সঠিক-বাইট (tr[data-an-row][hidden] !important)।

**প্যাচ:** scripts/s276-patch.py (skip-if-present idempotent ×২ — .an276--নেমস্পেস-গার্ড + আইকন-প্রি-গার্ড ×৩; অ্যাঙ্কর ×৫-অনন্যতা; PRESERVE-মানচিত্র (bulk-bar/data-bulk-all/data-bulk-msg ×৩/forEach ১→২/edit-delete-অপরিবর্তিত; **forEach ১→২-অ্যাসার্ট-প্রথম-রানে-ধরা — rows.forEach-ভুলে-যাওয়া — in-memory-ফেল, ফাইল-অলিখিত**), হেক্স-শূন্য-পোস্ট-অ্যাসার্ট + সঠিক-বাইট ×৩) + ডক ×৩।

**টেস্ট:** নতুন tests/s276-anfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×২২ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৫ (bare-id '#6' একক / শিরোনাম-একক 'নতুন' / 'ক্যাটাগরি category press' ২/৬ / 'event' ১/৬ / সর্বজনীন 'বিজ্ঞপ্তি notice' ৬/৬ + চিপ-টেক্সট) + নো-ম্যাচ→শূন্য + সব-সারি hidden + **computed-display:none + শূন্য-বক্স-বিপরীত-প্রমাণ** + clear-পুনরুদ্ধার + চিপ-text/hidden/display-none + 'f'-ফোকাস + ফিল্ড-গার্ড bulk_ids-checkbox + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + **রিড-ওনলি-নেট-শূন্য (mo268): সারি ৬→৬ + প্রোব-অবশেষ-শূন্য**) + পূর্ণ-রিগ্রেশন s275 ৮২/৮২ + s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design-গ্রিন-পুনঃপ্রমাণ + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট + anchor-scan ০-ঝুঁকি।

**গোটচা ×৩ ডক-কৃত (PLANS session276):** ① broadcast-সাইড-এফেক্ট-চুক্তি (POST /admin/notices broadcastToAll + newsletter-queue করে — marker-seed-ই২ই-নিষিদ্ধ, mo268-ই-সঠিক — s274-চুক্তির সুস্পষ্ট-ব্যতিক্রম-মানচিত্র) ② s269-গোটচা-পুনঃপ্রমাণ (data-bulk-all রেন্ডার্ড ×৩ = checkbox×১ + sidebar-included bulk-JS-ref ×২; data-bulk-msg রেন্ডার্ড ×৫ = বাটন×৩ + ref×২ — সঠিক-প্যাটার্নে-অ্যাসার্ট: 'data-bulk-all aria-label' / 'data-bulk-msg="' ) ③ parallel-রাউন্ড-গার্ড-মিস (রাউন্ড-শুরু-গার্ড-রান-শেষে-আর-এ-বার-বাধ্যতমূলক)।

"""
    src = rep(src, '## §২৭৫ (session275 — cron 403679', SEC + '## §২৭৫ (session275 — cron 403679', 'PROJECT §২৭৬-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ PLANS.md session276-নোট ════════════════
P = 'PLANS.md'
src = skip_if('## session276-নোট', P)
if src is not None:
    NOTE = """## session276-নোট (cron 403679 — অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার an276 + epaper hex-ratchet-বাগ-ফিক্স)
- **broadcast-সাইড-এফেক্ট-চুক্তি (নতুন — s274-marker-seed-চুক্তির সুস্পষ্ট-ব্যতিক্রম):** CRUD-থাকলেও **create-রুট ব্রডকাস্ট-করলে marker-seed-নেট-শূন্য-ই২ই নিষিদ্ধ** — POST /admin/notices broadcastToAll (সব-ইউজারে notification-row) + mailer.notifySubscribers (newsletter-queue) করে; ক্লিনার-ডিলিট-ও-ব্রডকাস্ট-অবশিষ্ট-মুছে-না → **mo268-রিড-ওনলি-পূর্বগণনা-ই-সঠিক চুক্তি**। ভবিষ্যৎ-সারফেসে-সিড-পথ-বাছাইের-আগে create-রুটের-সাইড-এফেক্ট-ম্যাপ-বাধ্যতমূলক (grep broadcastToAll/notifySubscribers/mailer)।
- **s269-রেন্ডার্ড-গণনা-গোটচা-পুনঃপ্রমাণ (sidebar-included shared-JS):** data-bulk-all রেন্ডার্ড ×৩ (checkbox ×১ + sidebar-included bulk-JS querySelectorAll-ref ×২), data-bulk-msg রেন্ডার্ড ×৫ (বাটন ×৩ + ref ×২) — **সঠিক-প্যাটার্ন-অ্যাসার্ট:** 'data-bulk-all aria-label' (checkbox-only) / 'data-bulk-msg="' (বাটন-only); প্রথম-রানে ×১/×৩-অ্যাসার্ট ×২-মিথ্যা-ফেল — রেন্ডার্ড-পৃষ্ঠায়-গণনা-করে-প্যাটার্ন-সংশোধন।
- **parallel-রাউন্ড-গার্ড-মিস-গোটচা (নতুন):** s226-কমিট রাউন্ড-মাঝে-রিবেজ-হয়ে-ঢুকেছিল — রাউন্ড-শুরুর guard:design-রান সে-কমিট-আগে-হওয়ায় লঙ্ঘন-মিস (epaper.css হেক্স ৪৭, baseline ০) — **push-পূর্ব-শেষ-guard:design-রান বাধ্যতমূলক** (রিবেজ-পরবর্তী-ট্রি-তে); epaperfix-প্রমাণ: ফলব্যাক-নির্ভর-টোকেন-অনুপস্থিতি (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow tokens.css-এ-নেই — ইনলাইন-ফলব্যাক-লোড-বেয়ারিং ছিল) → টোকেন-সংযোজন ×৬ + ফলব্যাক-স্ট্রিপ + কাঁচা-হেক্স→টোকেন = ratchet ৪৭→০ baseline-অক্ষুণ্ণ, computed-প্যারিটি-প্রমাণসহ।
- **অ্যাসার্ট-লেখার-আগে-সম্পাদনা-প্রভাব-মানচিত্র (পুনঃপ্রমাণ ×২):** প্যাচে forEach-অ্যাসার্ট rows.forEach-বৃদ্ধি-ভুলে-গিয়েছিল (১→২ প্রত্যাশা-না-করে ×১-অ্যাসার্ট — প্রথম-রানে-ধরা, ফাইল-অলিখিত); epaperfix-এ raw-hex→token রূপান্তর var()-গণনা-বাড়ায় (+৪ — প্রথম-রানে-ধরা) — **in-memory-অ্যাসার্ট-চুক্তি দুই-রাউন্ডে-ই-কার্যকর প্রমাণিত**।
- **সারফেস-নির্বাচন-বিবর্তন:** PLANS-প্রস্তাব-সারফেস পরিদর্শনে-অনুপযুক্ত-প্রমাণ-হতে-পারে (super/settings.ejs + support-settings.ejs = ফর্ম/সার্চ-পৃষ্ঠা — তালিকা-নেই) — পরের-এজেন্ট প্রস্তাব-পড়ে **প্রথমে-ভিউ-পরিদর্শন-করুন**; বিকল্প: admin-সাব-তালিকা-অবশিষ্ট (events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড; notices-সম্পন্ন an276), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট (গেটে-অক্ষুণ্ণ)।
- **পরের-এজেন্ট: session277 থেকে (worklog Task ID 117)।** push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!) + **রিবেজ-পরবর্তী guard:design-পুনঃরান**।

"""
    src = rep(src, '## session275-নোট (cron 403679', NOTE + '## session275-নোট (cron 403679', 'PLANS session276-সন্নিবেশ')
    io.open(P, 'w', encoding='utf-8').write(src)

# ════════════════ repo worklog.md Task-116 ════════════════
P = 'worklog.md'
src = skip_if('Task ID: 116 (session276', P)
if src is not None:
    TASK = """---
Task ID: 116 (session276 — cron 403679; অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার an276 + epaper hex-ratchet-বাগ-ফিক্স + broadcast-সচেতন-চুক্তি)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD(রাউন্ড-শুরু)=origin=`99db47c` (session275/Task115-জোড়া + টুল-কমিট), working-tree ক্লিন, টোকেন-ভ্যালিদ, স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর
- **স্টেল-সামারি-সংশোধন ×৪২:** পুরাতন-যুগ-দাবি — সব-ভুল; ACTIVE-LOCK/রিপো-প্রমাণে-ই-সত্য
- রাউন্ড-শুরু QA: s275 ৮২/৮২ (SKIP=০) — বাগ-শূন্য, স্থিতিশীল → ফিচার-রাউন্ড (সারফেস-নির্বাচন-বিবর্তন: প্রস্তাবিত-সিবলিং পরিদর্শনে ফর্ম-পৃষ্ঠা-প্রমাণ → admin-notices-তালিকা নির্বাচন)

## এ-রাউন্ডে সম্পন্ন (session276)
- **[বাগ-ফিক্স] epaper.css hex-ratchet-সংশোধন (s226-অবদান — রাউন্ড-মাঝে-আবিষ্কৃত):** tokens.css-এ-অনুপস্থিত lf-টোকেন ×৬ সংযোজন (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow/-gold-badge) + হেক্স-ফলব্যাক-স্ট্রিপ ×৪৩ + rgba-ফলব্যাক-স্ট্রিপ ×৮ + কাঁচা-হেক্স→টোকেন ×৪ → হেক্স ৪৭→০ (baseline ০ ✓); computed-প্যারিটি (is-active bg rgb(0,106,78)/color rgb(255,255,255)); epaper ২০০; idempotent ×২; var-গণনা-অ্যাসার্ট-প্রথম-রানে-ধরা (ফাইল-অলিখিত)
- **[Mandatory-ফিচার] অ্যাডমিন বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার (an276):** /admin/notices — tr[data-an-row] + দ্বিভাষিক data-kw (#id+বিজ্ঞপ্তি notice+শিরোনাম title+ক্যাটাগরি category+তারিখ date — নরমালাইজড ×৩) + ফিল্টার-স্ট্রিপ (anFilter276/anClear276/anCount276/kbd-hint — always-rendered) + চিপ + শূন্য-অবস্থা (anZero276) + 'f'-ফোকাস (একক-স্ট্রিপ) + ফিল্ড-গার্ড (bulk_ids-checkbox) + Escape + __anQA হুক; পৃষ্ঠায়-প্রথম <script>; bulk-bar/data-bulk-all/data-bulk-msg ×৩/CRUD-রুট অক্ষুণ্ণ
- **[Mandatory-স্টাইল]:** an276-amber-পরিবার হেক্স-শূন্য টোকেন-শুধু + hidden-গার্ড ×৩ সঠিক-বাইট (tr[data-an-row][hidden] !important)
- **রিড-ওনলি-নেট-শূন্য-চুক্তি (mo268 — broadcast-সাইড-এফেক্ট-সচেতন):** POST /admin/notices broadcastToAll + newsletter-queue করে → marker-seed-নিষিদ্ধ → সিড-শূন্য-রিড-ওনলি; নেট-প্রমাণ সারি ৬→৬ + প্রোব-অবশেষ-শূন্য
- **গোটচা ×৩ ডক-কৃত (PLANS session276):** ① broadcast-সাইড-এফেক্ট-চুক্তি (seed-বাছাইের-আগে create-রুট-সাইড-এফেক্ট-ম্যাপ) ② s269-গোটচা-পুনঃপ্রমাণ (sidebar-included bulk-JS-ref — data-bulk-all রেন্ডার্ড ×৩/data-bulk-msg ×৫ — সঠিক-প্যাটার্ন-অ্যাসার্ট) ③ parallel-রাউন্ড-গার্ড-মিস (রিবেজ-পরবর্তী guard:design-পুনঃরান-বাধ্যতমূলক); প্লাস forEach-অ্যাসার্ট-প্রথম-রানে-ধরা (rows.forEach +১ — in-memory-ফেল)
- **টেস্ট:** নতুন tests/s276-anfilter-suite.sh **৫৯/৫৯ ×২-ধারাবাহিক (SKIP=০)** (কাঠামো ×১৫ + স্টাইল ×৯ + আচরণ ×২২ রিয়েল-ব্রাউজার + পূর্বশর্ত ×৮ — নির্ধারক-প্রোব ×৫ + ক্যাটাগরি-বৈচিত্র্য (press ২/৬ + event ১/৬ + notice ৩/৬) + নো-ম্যাচ→শূন্য + computed-display:none + শূন্য-বক্স-বিপরীত-প্রমাণ + clear-পুনরুদ্ধার + চিপ-ত্রয়ী + 'f'-ফোকাস + ফিল্ড-গার্ড + Escape-ব্লার + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ কমিটেড + নেট-শূন্য) + পূর্ণ-রিগ্রেশন s275 ৮২/৮২ + s274 ৬১/৬১ + s273 ৫৭/৫৭ + s272 ৭২/৭২ + s271 ৫৮/৫৮ + s270 ৬১/৬১ + s269 ৭৭/০/২ + s268 ৫৬/৫৬ + s267 ৫৯/৫৯ + s266 ৫৯/৫৯ + s265 ৫৭/৫৭ + s264 ৫৬/৫৬ + s263 ৫৩/০/১ + s262 ৪৮/০/১ + s261 ৫০/৫০ + s260 ৫২/৫২ + role-policy ২৬০/২৬০ + guard:design-গ্রিন-পুনঃপ্রমাণ + audit:views-গ্রিন (১২২ ejs) + পুরাতন-PNG-চার্ন-রিভার্ট + anchor-scan ০-ঝুঁকি
- প্যাচ: scripts/s276-patch.py (idempotent ×২, .an276--নেমস্পেস-গার্ড, আইকন-প্রি-গার্ড ×৩, PRESERVE-মানচিত্র, হেক্স-শূন্য-পোস্ট-অ্যাসার্ট, সঠিক-বাইট ×৩) + scripts/s276-epaperfix.py (idempotent ×২) + ডক ×৩ (PROJECT §২৭৬ + PLANS session276 + repo-worklog Task-116) → secret-scan-ক্লিন → fetch → push → Vercel READY → প্রোড-স্পট

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session277 লেবেল (worklog Task ID 117)**; PLANS session276-নোট অবশ্যই-পড়ুন (broadcast-চুক্তি + s269-গোটচা-পুনঃপ্রমাণ + parallel-গার্ড-মিস + সারফেস-নির্বাচনে-প্রথমে-ভিউ-পরিদর্শন); push-আগে fetch+rebase + **রিবেজ-পরবর্তী guard:design-পুনঃরান**
- বাকি-প্রস্তাব: admin-সাব-তালিকা-অবশিষ্ট (events/gallery/members/resources-list — admin-ভার্সন-অফিল্টারড; notices-সম্পন্ন), security.ejs-স্কোপ-ম্যাপ-পূর্বক, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী HEAD (session276-জোড়া: fix + feature + worklog); working-tree ক্লিন

"""
    src = src.rstrip() + '\n' + TASK
    io.open(P, 'w', encoding='utf-8').write(src)
    print('OK: worklog Task-116-সংযোজন')

print('DOCS-DONE')
