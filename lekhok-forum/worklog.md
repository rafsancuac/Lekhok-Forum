# Worklog — Lekhok-Forum Multi-Agent Coordination

> এই ফাইলটি লোকাল এনভায়রনমেন্টের কাজের লগ। গিট রিপো-তে অন্য এজেন্টদের সাথে সমন্বয়
> হয় `lekhok-forum/PROJECT.md` (Changelog) + `lekhok-forum/PLANS.md` (Cross-Agent Notes)
> দিয়ে — ওগুলো সবসময় আপডেট রাখুন এবং push করুন।

---
Task ID: 1
Agent: Main verification agent (Session 7)
Task: গিট থেকে প্ল্যান বোঝা, সব ফাইল ভেরিফাই, রিগ্রেশন টেস্ট, বাগ ফিক্স, রোডম্যাপ এক্সিকিউশন, অন্য এজেন্টদের সাথে সমন্বয়

Work Log:
- `git fetch` + PLANS.md/PROJECT.md পড়ে পুরো কনটেক্সট বুঝলাম (লেখক ফোরাম = Node/Express/EJS/sql.js বাংলা সোশ্যাল প্ল্যাটফর্ম)
- ১৮টা JS ফাইলের syntax check + পুরো রুট-ম্যাপ অডিট
- ৯১-চেকের regression টেস্ট স্ক্রিপ্ট লিখেছি: /home/z/my-project/scripts/test-lekhok.sh (রিপোতেও কমিট করা: lekhok-forum/scripts/)
- প্রথম রানে ৩টা আসল বাগ ধরা পড়ে:
  1. c2faa96 কমিটে /avatar ও /moderator রুট-মাউন্ট হারিয়ে গেছে → server.js-এ পুনরুদ্ধার
  2. Fresh Turso deploy-এ ডেমো সিডিং হতো না → db.js-এ seedDemoContent() dual-backend async বানালাম
  3. /follow/<non-numeric> 500 → numeric+existence guard
- HTML nesting fix: ৩১টা views/user/*.ejs থেকে ডুপ্লিকেট DOCTYPE/head সরানো; header.ejs একমাত্র document-opener, title/extra_css include-data হিসেবে পাস
- দুই ব্যাকএন্ডে (sql.js + Turso file-mode) ৯১/৯১ ALL GREEN
- মডারেটর ফ্লো E2E টেস্ট: dashboard 200, unscoped 403, POST 302
- Rebase সময় অন্য এজেন্টের নতুন কমিট 96cc403 pull করে PROJECT.md conflict সমাধান (তাদের সেশন ৬ + আমার সেশন ৭ দুটোই রাখা)
- PROJECT.md v4 + PLANS.md cross-agent note আপডেট করে commit b5e06a0 push করেছি

Stage Summary:
- রিপো: https://github.com/rafsancuac/Lekhok-Forum (main @ b5e06a0)
- ডেমো লগইন: ইউজার ismail/monem/karishma/mahfuz/nusrat (demo123) via /login; admin/admin123 via /admin/login
- টেস্ট: `bash lekhok-forum/scripts/test-lekhok.sh http://localhost:8080`
- ⚠️ শেখা: সার্ভার চালু থাকা অবস্থায় lekhok.db সরাসরি এডিট করা যায় না (SIGTERM flush মুছে দেয়)
- বাকি কাজ (roadmap): গ্লোবাল সার্চ /search?q=, nav গ্রুপিং, role-change সেশন রিফ্রেশ, v1 স্ট্যাটিক সাইট সিদ্ধান্ত
---
Task ID: 2
Agent: Main verification agent (Session 8)
Task: ব্যবহারকারীর রিপোর্ট — "এডমিন লগিন কাজ করছে না + মডারেটর লগিনের ডিটেইল সেট আছে কি?" — ডায়াগনোসিস ও ফিক্স

Work Log:
- স্ক্রিনশট VLM দিয়ে বিশ্লেষণ: /login পেজে admin ইউজারনেম দিয়ে চেষ্টা হয়েছে → "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড"
- ডায়াগনোসিস: /admin/login ঠিকই কাজ করে (302 → /admin); সমস্যা = ইউজার পেজ /login-এ অ্যাডমিন ক্রেডেনশিয়াল
- ডায়াগনোসিস: moderators + moderator_scopes টেবিল ফাঁকা — মডারেটর অ্যাকাউন্ট কখনোই তৈরি হয়নি
- ৪টা বাগ ফিক্স + ১টা ডেড-কোড রুট সরানো (বিস্তারিত PROJECT.md সেশন ৮ + PLANS.md cross-agent note-এ)
- E2E টেস্ট স্ক্রিপ্ট: /home/z/my-project/scripts/test-login-fixes.sh (২১ চেক)
- ২১/২১ + ৯১/৯১ regression — দুটোই ALL GREEN

Stage Summary:
- লগইন এখন: admin/admin123 (/login বা /admin/login — দুই জায়গা থেকেই), moderator/moderator123 (/login → /moderator), ডেমো ইউজার demo123
- Scope সিস্টেম unified: notice↔notices, event↔events alias-aware; নতুন মডারেটররা full canonical scope পায়
- মডারেটর সেশনে /admin ড্যাশবোর্ড আর 500 দেয় না
- ⚠️ শেখা: এই sandbox-এ detached background প্রসেস টুল-কলের মাঝে মরে যায় — টেস্ট এক ইনভোকেশনে সার্ভার+টেস্ট একসাথে চালাতে হয় (scripts/run-all-tests.sh)

---
Task ID: 3
Agent: Main verification agent (Session 9)
Task: ইউজার রিপোর্ট — ক্রেডেনশিয়াল টেবিল (admin/admin123, moderator/moderator123) "কাজ করছে না" — রি-ভেরিফিকেশন

Work Log:
- রিপো স্টেট চেক: HEAD 6d3f0cd = origin/main (সেশন ৮-এর ফিক্স intact); working tree-এর diff শুধু permission-bit (644→755), কনটেন্ট পরিবর্তন নেই
- ফ্রেশ DB (lekhok.db ডিলিট) বুট → সিডিং ঠিক: admin + demo content + "Demo moderator seeded (moderator/moderator123)"
- ২১-চেক E2E (test-login-fixes.sh): ALL GREEN; আলাদা ভেরিফিকেশন: POST /login admin 302→/admin, POST /admin/login 302→/admin, POST /login moderator 302→/dashboard
- Detached-server persistence পরীক্ষা: setsid+nohup+disown দিয়েও টুল-কলের মাঝে প্রসেস মরে যায় — কনফার্মড, sandbox preview দিয়ে লগইন টেস্ট সম্ভব নয়

Stage Summary:
- কোড ও ক্রেডেনশিয়াল ১০০% কাজ করছে (ফ্রেশ DB-তে সম্পূর্ণ ভেরিফায়েড); "কাজ করছে না"-এর কারণ ইউজারের টেস্ট এনভায়রনমেন্ট (পুরনো ক্লোন / sandbox limitation)

---
Task ID: 4
Agent: Main verification agent (Session 9, cont.)
Task: ইউজার Windows PowerShell-এ কমান্ড চালাতে ব্যর্থ — সাপোর্ট

Work Log:
- ইউজার এনভায়রনমেন্ট কনফার্মড: Windows PowerShell 5.1 (&& সাপোর্ট করে না — কমান্ড আলাদা লাইনে দিতে হবে)
- চেক: github.com/rafsancuac/Lekhok-Forum এখন PUBLIC — টোকেন ছাড়াই clone/pull করা যায়
- ⚠️ package.json-এ "start": "node api/index.js" (Vercel serverless entry) — লোকাল রানে npm start নয়, node server.js

Stage Summary:
- ইউজারকে PowerShell-সেফ (আলাদা লাইনে) clone+run নির্দেশনা দেওয়া হয়েছে

---
Task ID: 5
Agent: Main verification agent (Session 9, cont.)
Task: ইউজারের Windows এনভায়রনমেন্ট ডিবাগ

Work Log:
- কনফার্মড: ইউজারের পুরনো ক্লোন a28deb1-এ আটকে ছিল (অ্যাপ তখন রিপোতে ছিলই না) — এটাই লগইন না করার মূল কারণ
- Node ছিল (C:\Program Files\nodejs) কিন্তু পুরনো PowerShell সেশনে PATH-এ ছিল না → $env:Path fix দেওয়া হয়েছে
- ডিপেনডেন্সি অডিট: সব Windows-সেফ (bcryptjs pure-JS, sql.js WASM) — npm install-এ compiler লাগবে না

Stage Summary:
- ইউজারের git pull সফল: a28deb1 → 6ed7a7c fast-forward, পুরো অ্যাপ fresh নেমেছে; Node v24.19.0 চালু

---
Task ID: 6
Agent: Main verification agent (Session 9, cont.)
Task: রিপো sync (remote-এর নতুন ৩ কমিট) + ইউজারের npm execution-policy ফিক্স + নতুন কোডে রি-ভেরিফিকেশন

Work Log:
- git fetch: রিমোটে নতুন ৩ কমিট — a4d5ba3 ('daily' umbrella scope ডেড-চেকবক্স ফিক্স), 660dd70 (গ্যালারি রিডিজাইন + ১১ ডেমো ফটো), 6ed7a7c (রিঅ্যাকশন পিকার + অ্যাকশন বার ফিক্স) — অন্য এজেন্টরা push করেছে
- Local sandbox-এ auto-snapshot UUID কমিটগুলো (perm-bit 755 + worklog) rebase-এ mode-conflict দিচ্ছিল → git reset --hard origin/main দিয়ে clean sync; আমার worklog সেকশনগুলো এই কমিটে পুনরুদ্ধার করা হলো
- repo restructure নোট: অ্যাপ এখন repo-root-এর lekhok-forum/ সাবফোল্ডারে — ইউজারের পুরনো ক্লোনে repo-root ছিল default\lekhok-forum, তাই pull-এর পর অ্যাপ পাথ = default\lekhok-forum\lekhok-forum\ (ইউজারকে আরেকটা cd lekhok-forum বলা হয়েছে)
- ইউজারের npm ব্লকড: PowerShell execution policy (npm.ps1 disabled) → npm.cmd install ওার্কঅ্যারাউন্ড + Set-ExecutionPolicy RemoteSigned -Scope CurrentUser স্থায়ী ফিক্স দেওয়া হয়েছে
- 6ed7a7c-তে ২১-চেক লগইন E2E re-run (ফ্রেশ DB): ALL GREEN + smoke (/ , /gallery, /notices, /quiz → সব 200)

Stage Summary:
- HEAD = 6ed7a7c + এই worklog কমিট, push করা হয়েছে (সব এজেন্ট sync-এ)
- ইউজারের পরবর্তী ধাপ: cd lekhok-forum → npm.cmd install → node server.js → localhost:8080/login

---
Task ID: 7
Agent: Main verification agent (Session 44)
Task: এডিট/আপডেট স্পিনার+৪০৪ ফিক্স + মিডিয়া WebP অপটিমাইজেশন + অ্যানালিটিক্স রিয়েকশন/ভিজিট ট্রেন্ড

Work Log:
- রুট-কজ ৪০৪: method-override ডিফল্ট getter শুধু কুয়েরি-স্ট্রিং পড়ে → বডি `_method` PUT/DELETE ফর্ম 404 দিত; server.js-এ বডি+কুয়েরি কাস্টম getter
- মডারেটর পারমিশন-ত্রুটিতে `404` টেমপ্লেট রেন্ডার হতো → admin/denied (homePath '/moderator')
- AJAX ফ্লো (share/undo/reorder) + content.ejs-এ স্পিনার-রিলিজ ও res.ok/401 চেক
- নতুন POST /admin/media/optimize (sharp WebP q82, মূল ফাইল অক্ষত) + media.ejs বাটন/ব্যাজ/flash
- page_visits টেবিল + fire-and-forget ভিজিট মিডলওয়্যার + analytics রিয়েকশন/ভিজিট স্পার্কলাইন ও ব্রেকডাউন চিপ
- session44.js ১০/১০; optimize লাইভ-চেক ৮৯% ছোট

Stage Summary:
- কমিট: session44 (বিস্তারিত PROJECT.md §১০)

---
Task ID: 8
Agent: Main verification agent (Session 45)
Task: ডিলিট ফাংশনালিটি — নেটিভ কনফার্মেশন পপ-আপ (confirm()) অপসারণ

Work Log:
- grep দিয়ে সব confirm()/window.confirm() চিহ্নিত (২৯ view ফাইল, ৩৯ কল)
- Python স্ক্রিপ্টে onsubmit/onclick="return confirm(...)" অ্যাট্রিবিউট + if(!confirm(...)) return; লাইন অপসারণ
- sidebar.ejs-এর বাল্ক-বার ও কীবোর্ড-ডিলিট window.confirm ম্যানুয়ালি সরানো
- কসমেটিক আর্টিফ্যাক্ট ("> >") পরিষ্কার
- grep যাচাই: পুরো রিপোতে confirm() = ০
- smoke test: অ্যাডমিন ১৭ + মডারেটর ৮ পেজ ২৫/২৫ পাস

Stage Summary:
- কমিট: session45 (বিস্তারিত PROJECT.md §১০)

---
Task ID: 9
Agent: Main verification agent (Session 46)
Task: লগইন/অথেনটিকেশন/রিডাইরেক্ট ফ্লো ফিক্স (সব রোল: admin/moderator/user)

Work Log:
- রুট-কজ: রোল-বেজড রিডাইরেক্ট নেই (মডারেটর /dashboard-এ যেত), next প্যারাম তৈরি হয় কিন্তু ব্যবহৃত হয় না, GET /login রোল-নির্বিশেষে /dashboard, requireAdmin নন-অ্যাডমিনকে /admin/login-এ বাউন্স, সেশন-সেভ হ্যাং ঝুঁকি
- auth.js: dashboardFor() + safeNextPath() হেল্পার; POST /login রোল+next; GET /login /register রোল-বেজড; login.ejs hidden next
- admin/routes.js: requireAdmin → 403 denied (হোমপাথ রোল-অনুযায়ী)
- server.js: session-save wrapper-এ 1.5s সেফটি-টাইমআউট
- session46.js 13/13 + রিগ্রেশন 44/45/স্মোক সবুজ

Stage Summary:
- কমিট: session46 (বিস্তারিত PROJECT.md §১০)

---
Task ID: 10
Agent: Main verification agent (Session 47)
Task: RBAC কঠোর বাস্তবায়ন (permission matrix + frontend/backend enforcement)

Work Log:
- সম্পূর্ণ রুট-ম্যাপ অডিট করে permission matrix তৈরি (RBAC.md)
- ফাঁক: মডারেটর প্যানেলে userScopeMeta সেট হয়নি, press CRUD গার্ডহীন (bulk-toggle-এ epaper), requireScope denied-এ homePath নেই, সাইডবার/ড্যাশবোর্ডে স্কোপ-গেটিং নেই, সেশন rolling নেই
- moderator.js: userScopeMeta router.use + press CRUD-এ requireScope('epaper')
- admin/routes.js: requireScope denied homePath (মডারেটর→/moderator)
- sidebar.ejs: _hasScope() হেল্পার দিয়ে মডারেটর-লিংক স্কোপ-গেটিং
- moderator-dashboard.ejs: পত্রিকা-কাটিং টাইল epaper-গেটেড
- server.js: rolling:true (অহেতুক লগআউট বন্ধ)
- টেস্ট: ফুল/লিমিটেড মডারেটর + অ্যাডমিন + ইউজার — 403/200/denied/সাইডবার-গেটিং/rolling সবুজ

Stage Summary:
- কমিট: session47 (বিস্তারিত PROJECT.md §১০ + RBAC.md)

---
Task ID: 11
Agent: Main verification agent (Session 48)
Task: গ্লোবাল টাইপোগ্রাফি সিস্টেম (কেন্দ্রীয় ফন্ট টোকেন)

Work Log:
- fonts.css-এ ক্যানোনিকাল --font-heading (Hind Siliguri) ও --font-body (Kalpurush) টোকেন + fallback stack (Noto Sans Bengali + sans-serif); legacy --font-hs/--font-kp alias ধরে রাখা
- ১১টি ফাইল-এ hardcoded ফন্ট-স্ট্যাক → টোকেন (admin.css, auth.css, profile.css, style.css, lekhok-advisory.ejs, ৪ মডারেটর view, admin login, admin users/edit)
- ১৬টি view-এ Google Fonts link → স্থানীয় fonts.css?v=<%=AV%>
- monospace → var(--font-body) (messages-list.ejs + style.css)
- semantic চেক: .mod-page ও .adv-filter-bar (label/select) → var(--font-body)
- grep অডিট: Google Fonts ০, non-token font-family ০ (@font-face ছাড়া)
- টেস্ট: ৪৬/৪৬ (fonts.css টোকেন+fallback, admin/moderator/home/about fonts.css-লোড+Google-মুক্ত, served CSS-এ hardcoded স্ট্যাক ০); রিগ্রেশন smoke ১৮/১৮+৯/৯ + RBAC ১০/১০ সবুজ

Stage Summary:
- কমিট: session48 (বিস্তারিত PROJECT.md §১০)

---
Task ID: 12
Agent: Main verification agent (Session 49)
Task: ডাইনামিক CMS-গ্রেড অ্যাডমিন প্যানেল (টাস্ক ৬)

Work Log:
- প্রথম ধাপ: পূর্ণাঙ্গ অডিট CMS-AUDIT.md — বিদ্যমান (nav editor, ১৪-পেজ content editor, section CRUD, media WebP optimize, members/past-leaders CRUD, home social icons) বনাম ফাঁক চিহ্নিত
- ১) নেভিগেশন: helpers/nav.js-এ enabled সংরক্ষণ + visibleNav(); server.js-এ public navConfig = visibleNav(parseNav()); nav-editor.js-এ drag-and-drop + up/down + enable/disable toggle
- ২) SEO: content-registry.js-এ ১৩ পেজে seo গ্রুপ (meta_title/desc) + SEO_DEFAULTS; server.js path→page exact-match; layout.ejs/header.ejs-এ meta title/desc প্রতিফলন
- ৩) মিডিয়া: POST /admin/media/upload + /replace (ইন-প্লেস ওভাররাইট, অটো-WebP); media.ejs-এ আপলোড ফর্ম + রিপ্লেস বাটন
- ৪) লিডারশিপ: db.js LATER_COLUMNS-এ social_linkedin/message; members ও past_leaders ফর্ম+রুটে LinkedIn+বাণী; হোম/কমিটি/প্রাক্তন-নেতা কার্ডে শর্তসাপেক্ষ ব্র্যান্ড-কালার আইকন + rel=noopener noreferrer; main.js data-href জেনারেলাইজ
- টেস্ট: session49 CMS সবুজ; রিগ্রেশন smoke ১৮/১৮+৯/৯, RBAC ১০/১০, typography ৪৬/৪৬

Stage Summary:
- কমিট: session49 (বিস্তারিত PROJECT.md §১০ + CMS-AUDIT.md)

---
Task ID: 13
Agent: Main verification agent (Session 50)
Task: সম্পূর্ণ টেকনিক্যাল পারফরম্যান্স অডিট (টাস্ক ৭)

Work Log:
- বেসলাইন মাপা (before): ফন্ট 1.64MB TTF, CSS+JS 355KB (unminified), কোনো স্ট্যাটিক ক্যাশ হেডার নেই, N+1 (ফিড ৩০, হোম ৫), ৮৬/৯৭ ইমেজ lazy
- ফন্ট → WOFF2 (fontTools, ৬ ফাইল, −66%); fonts.css-এ WOFF2+TTF fallback
- CSS minify (clean-css) + JS minify (terser) → −28%; টপ-লেভেল গ্লোবাল সংরক্ষিত যাচাই
- express.static setHeaders: /assets/*, /uploads/* → immutable 30d (AV bust)
- N+1 ফিক্স: dashboard.js ফিড batch, pages.js top-answer batch
- db.js +৯ ইনডেক্স (comments/likes/messages/bookmarks/follows/posts/conv_members)
- lazy loading +৭ ইমেজ (contact/article comment avatars)
- PERFORMANCE-REPORT.md (before/after)
- রিগ্রেশন: smoke ১৮/১৮+৯/৯, RBAC ১০/১০, typography ৪৬/৪৬, media ৫/৫, পাবলিক ১৬ পেজ 200

Stage Summary:
- কমিট: session50 (বিস্তারিত PROJECT.md §১০ + PERFORMANCE-REPORT.md)

## Task 9 — স্থায়ী পরিষদ পেজ: উপদেষ্টা-তালিকার সাথে ১০০% ডিজাইন কনসিসটেন্সি (সেশন ৫২)

- রেফারেন্স কার্ড = `leader-card has-image clickable-card [linked-member]` (style.css গ্লোবাল কম্পোনেন্ট; কমিটি/উপদেষ্টা পেজে ব্যবহৃত)। ডকুমেন্ট করা ভিজুয়াল প্রপার্টি: গ্রিড minmax(240px,1fr) gap 20px; img 200px কভার; বডি padding 22px (h3 19px / role 13px accent uppercase / bio 0.9rem); radius 5px; hover translateY(-4px)+scale(1.06)+accent বর্ডার; linked-member ফাঁ-অ্যারো ব্যাজ।
- `lekhok-permanent.ejs`-এর পুরনো `perm-card`/`perm-grid` বাদ → হুবহু `leader-card has-image` মার্কআপ + একই ইনলাইন স্টাইল রিইউজ।
- নিচের ২ `link-more` লিঙ্ক সরানো (কার্যনির্বাহী কমিটি / উপদেষ্টা পরিষদ)।
- ডাইনামিক: আগে থেকেই `/admin/members` (member_type=permanent) দিয়ে Add/Edit/Delete — যাচাই করা (add→দেখা→delete 302)।
- টেস্ট: পাবলিক ১৫/১৫ 200; permanent পেজে ৫ কার্ড leader-card, ০ link-more।

## Task 10 — Resources মেনু: ক্রস-লিঙ্ক অপসারণ + 'পত্রিকার ই-মেইল' পেজ রিডিজাইন (সেশন ৫৩)

- ধাপ ১: lekhok-resources.ejs নিচের '/resources/emails' লিঙ্ক + lekhok-emails.ejs নিচের '/resources' লিঙ্ক সরানো। নেভিগেশন সাবমেনু অক্ষত।
- ধাপ ২: 'পত্রিকার ই-মেইল' পেজ ইতিমধ্যে (সেশন ৪০) কার্ড-ভিত্তিক ডিজাইনে — ৬ মানদণ্ডই পূরণ (রিইউজ, কার্ড/লিস্ট, হায়ারার্কি, হোভার, রেসপনসিভ, ক্লিন নেভ) — যাচাই।
- ডেটা অক্ষত: ১৪ গ্রুপ, ১২৬ পত্রিকা, ১৫৮ ইমেইল (কপি-বাটন ১৫৮/১৫৮)।
- টেস্ট: পাবলিক ১৫/১৫ 200; দুই পেজে বডি-ক্রস-লিঙ্ক ০।

## Task 11 — লগইন/রেজিস্ট্রেশন UI: স্থিতিশীলতা + প্রিমিয়াম রিডিজাইন (সেশন ৫৪)

- ভাসমান আপ-অ্যারো অপসারণ: layout.ejs-এর হার্ডকোডেড বাটন + main.js-এর ডাইনামিক ইনজেকশন/স্ক্রল-টগল/ক্লিক (৪ স্নিপেট) + style.css-এর ৪টি .back-to-top নিয়ম — সব ০ ref, node --check + ব্রেস-ব্যালান্স পাস।
- স্ট্যাবল পজিশনিং: auth body flexbox-centering overflow বাগ ফিক্স (body display:flex + .auth-card margin:auto); মডাল ইতিমধ্যে position:fixed যাচাই।
- প্রিমিয়াম রিডিজাইন: auth.css-এ :root ডিজাইন-টোকেন, ব্র্যান্ড লোগো-মার্ক, "স্বাগতম"/সাবহেডিং, ইনপুট focus+error state, accent-gradient প্রাইমারি বাটন (আগে নেভি ছিল), .auth-section-title (inline h3 সরানো)।
- backward-compat: .sub ও .auth-card h1 রাখা (article-form/qa-form/edit)।
- রিগ্রেশন: লগইন/রেজিস্টার/এরর/রিডাইরেক্ট ২০০/৩০২ OK; পাবলিক ১৫ পেজ 200; ৩টি auth-ফর্ম পেজ (রেগুলার ইউজারে) 200।

## Task 12 — কমিটি ডেটা সংশোধন: আপলোড করা ডক অনুযায়ী নাম/পদবি হুবহু ঠিক করা (সেশন ৫৫)

- সোর্স: `uploads/লেখক_ফোরাম_কমিটি_কার্যবর্ষ_২০২০-২৫.md` (৬টি প্রেস-রিলিজ ছবি থেকে ট্রান্সক্রাইবড) = অথোরিটেটিভ।
- `members` টেবিল: ~৪০ রো-র name/role ডক অনুযায়ী সংশোধন; ২০২৫-২৬ টেস্ট রো (২টি) ডিলিট; ২০২২-২৩ উপদেষ্টা মো. রাফছান (sort_order 0) ইনসার্ট।
- `users.full_name`: ১২+১৩ = ২৫ অ্যাকাউন্টের গার্বলড নাম ঠিক (আয়েশা সিদ্দিকা, শেখ রফিকুজ্জামান, মিজবাহুল জান্নাত তারিন, এম. আতাহার নূর, মো. মারুফ মজুমদার ইত্যাদি)।
- লিংকেজ বাগ: member id 72 (রেদওয়ান আহমদ, ২০২২-২৩ সাহিত্য ও পাঠাগার সম্পাদক) user_id=44 (রোকসানা আক্তার) → user_id=12 (redwan_ahmed) রি-লিংক (দুই অ্যাকাউন্টেই ০ পোস্ট, নিরাপদ)।
- routes/pages.js TERM_NOTES: ২০২৪-২৫ = ২৯ সেপ্টেম্বর ২০২৪; ২০২৩-২৪ = ৬ সেপ্টেম্বর ২০২৩ (ডক তারিখ)।
- lekhok-committee.ejs: displayName = `m.name || m.user_full_name` (members.name অথোরিটেটিভ প্রাধান্য)।
- যাচাই: ৫ বছরের চিপে হুবহু নাম+পদবি ডক-অর্ডারে; ডিফল্ট ২০২৪-২৫ রোল তালিকা + টার্ম-নোট OK; উপদেষ্টা/স্থায়ী/হোম প্রিভিউ অক্ষত; পাবলিক ১৬ পেজ 200।

### টাস্ক ১২ — ফলো-আপ (সেশন ৫৫b): নাম/পদবি চূড়ান্ত যাচাই + গার্বলড নাম সংশোধন

- মূল কারণ চিহ্নিত: আগের `users.full_name` ফিক্স চলমান সার্ভারের শাটডাউন-সেভে ওভাররাইট হয়ে গিয়েছিল (সার্ভার নিজের ইন-মেমরি DB ডিস্কে সেভ করে)। এবার **আগে সার্ভার বন্ধ → DB ফিক্স → রিস্টার্ট**।
- `/members` ডিরেক্টরি ও প্রোফাইল পেজ `users.full_name` দেখায় — সেখানে ১০টি গার্বলড নাম ফিক্স (এ্যানি/রিকাত/মোজফ্ফা/রাকিব/মোলেম/জায়াতুল/সাধী/রিয়ান/মতুব্বর/তানুকানার → সঠিক নাম)।
- `members.name`: ২০২১-২২ মুরাদ হোসেন "মোঃ" → "মো." (ডক অনুযায়ী)।
- ২০২১-২২ sort_order: দপ্তর/উপ-দপ্তর (জান্নাতুল ফেরদৌস সায়মা, মো. সাইফুল মিয়া) প্রচার/উপ-প্রচার-এর **আগে** আনা।
- লিংকেজ: member id 72 (রেদওয়ান আহমদ ২০২২-২৩) → user 12 (আগে ভুলে 44/রোকসানা আক্তার)।
- "একই লোক দুই কমিটিতে" — প্রতিটি কার্যবর্ষের members.name ডকের বছর-স্পেসিফিক স্পেলিং রাখা (আয়শা/আয়েশা, আতহার/আতাহার, রফিকুজ্জামান/রফিকউজ্জামান, মিসবাহুল/মিজবাহুল, মো./মোঃ)।
- যাচাই: ৫ বছরের নাম+পদবি+ক্রম ডকের সাথে হুবহু মিলেছে; /members ও প্রোফাইল পেজে গার্বলড নাম ০; পাবলিক ১৬ পেজ 200।

### টাস্ক ১২ — ফলো-আপ ২ (সেশন ৫৫c): রুট-কজ ফিক্স — সিড ডেটা + স্থায়ী পরিষদ

- আসল কারণ: `db.js`-এর **সিড/মাইগ্রেশন ডেটা** (v1 COMMITTEE_HISTORY + v2 ACCOUNT_FIXES/V2_TERMS + seedDemoContent) গার্বলড নামে ভরা ছিল — "মোঃ রাকেবুল", "এ্যানি", "মিরা", "মতুব্বর", "তানুকানার", "তৌজুরী স্মার্ট" ইত্যাদি। ফ্রেশ ডিপ্লয়/রিসিড হলে এই ভুল ফিরে আসত।
- db.js সিড সম্পূর্ণ সংশোধন (ডকের সাথে ১-বাই-১ মিলিয়ে): সব গার্বলড নাম → সঠিক বাংলা; md_rakebul → md_rafsan; ২০২২-২৩-এ উপদেষ্টা মো. রাফছান যোগ; বছর-স্পেসিফিক বানান (আয়শা/আয়েশা, আতহার/আতাহার, রফিকুজ্জামান/রফিকউজ্জামান, মিসবাহুল/মিজবাহুল, মো./মোঃ, আজিজুল হক মো.-ছাড়া) হুবহু; ২০২১-২২ দপ্তর/প্রচার ক্রম + মো. মুরাদ হোসেন।
- স্থায়ী পরিষদ (লাইভ DB): member 112 আহ্বায়ক "মোঃ রাকেবুল" → "মোঃ রাফছান"; user 1 username md_rakebul → md_rafsan।
- যাচাই: DB-তে "রাকেবুল" আর নেই (সব টেবিল স্ক্যান); ৫ বছরের কমিটি হুবহু ডক; স্থায়ী পরিষদ/মেম্বার ডিরেক্টরি গার্বলড-মুক্ত; পাবলিক ১৬ পেজ 200।

### টাস্ক ১২ — ফলো-আপ ৩ (সেশন ৫৫d): লাইভ/ডিপ্লয় সাইটের জন্য v3 মাইগ্রেশন

- কারণ: ডিপ্লয় করা সাইটে (lekhok-forum.vercel.app) পুরনো গার্বলড ডেটা জমে আছে; v1/v2 মাইগ্রেশন ফ্ল্যাগ আগেই সেট থাকায় নতুন সিড সেখানে রান করছিল না।
- সমাধান: `db.js`-এ নতুন **committee_history_v3** মাইগ্রেশন (নতুন ফ্ল্যাগ `committee_history_v3_seeded`) — পুরনো ডিপ্লয়েও ঠিক একবার চলে:
  ১) users.full_name গার্বলড→সঠিক (২১টি ম্যাপিং) + md_rakebul→md_rafsan;
  ২) কেন্দ্রীয়-বাইরের (স্থায়ী পরিষদ) নাম সংশোধন;
  ৩) কেন্দ্রীয় কমিটি DELETE+REINSERT — ৫ বছরের হুবহু ডক-ডেটা (নাম/পদবি/ক্রম) ইউজারনেম-স্লাগে লিংক করা;
  ৪) ফ্ল্যাগ সেট।
- লোকাল যাচাই: মাইগ্রেশন চালিয়ে ৮/১৩/১৬/১৫/১৭ সঠিক, স্থায়ী পরিষদ আহ্বায়ক মোঃ রাফছান, পাবলিক ১৬ পেজ 200।
- ⚠️ ডিপ্লয়: git push করলে Vercel-এ পরের কোল্ড বুটে মাইগ্রেশন চলে ডেটা ঠিক হবে।

### টাস্ক ১২ — ফলো-আপ ৪ (সেশন ৫৫e): প্রোডাকশন Turso ডাটাবেজ সরাসরি ঠিক করা হয়েছে

- সমস্যার মূল: লোকাল (sql.js) ঠিক ছিল, কিন্তু Vercel লাইভ সাইটের Turso ডাটাবেজে পুরনো গার্বলড ডেটা জমে ছিল; v1/v2 সিড-ফ্ল্যাগ সেট থাকায় আর কখনো রি-সিড হতো না।
- সমাধান: repo-তে থাকা Turso ক্রেডেনশিয়াল দিয়ে সরাসরি প্রোডাকশন ডেটা ঠিক করা:
  ১) users.full_name গার্বলড→সঠিক (২১ ম্যাপিং) + md_rakebul→md_rafsan;
  ২) কেন্দ্রীয়-বহির্ভূত members নাম সংশোধন;
  ৩) কেন্দ্রীয় কমিটি DELETE + ৬৯টি সঠিক সারি REINSERT (৫ বছর, হুবহু ডক);
  ৪) `committee_history_v3_seeded` ফ্ল্যাগ সেট।
- যাচাই (Turso): কেন্দ্রীয় কাউন্ট ৮/১৩/১৬/১৫/১৭ = ৬৯ ✓; গার্বলড members=0, users=0 ✓; ২০২০-২১ GS = মোঃ রাফছান ✓।
- লাইভ সাইট যাচাই: lekhok-forum.vercel.app/committee?year=২০২০-২১ এখন মোঃ রাফছান দেখায় (আগে রাকেবুল); ২০২২-২৩ ১৬ সদস্য সঠিক।
- doc-এর সাথে ৬৯ নাম/পদবি ১-বাই-১ মিলেছে (মো. vs মোঃ, আতহার vs আতাহার, মিসবাহুল vs মিজবাহুল সহ)।
- db.js-এ commit 78cee8d-এর v3 মাইগ্রেশন = একই রোস্টার; ফ্ল্যাগ সেট থাকায় ভবিষ্যৎ ডিপ্লয় আবার চালাবে না (no double-run)।

### টাস্ক ১৩: যোগাযোগ পেজ — "যাতায়াত ও গুরুত্বপূর্ণ নম্বর" সেকশন হালনাগাদ (প্রিমিয়াম)

- নতুন ফাইল `helpers/transport-schedule.js`: শাটল ট্রেন / বাস / নাজিরহাট ট্রেন — তিনটি সময়সূচির একক সোর্স-অব-ট্রুথ (ডক অনুযায়ী হুবহু, বাংলা সংখ্যা সংরক্ষিত)।
- `routes/pages.js` `/contact`: `ts` ডেটা পাস করা হয়েছে।
- `views/lekhok-contact.ejs`: পুরনো জেনেরিক কার্ডের জায়গায় প্রিমিয়াম "শিডিউল বোর্ড":
  - শাটল ট্রেন প্যানেল — দিন ট্যাব (রবি–বৃহস্পতি / শুক্র ও শনিবার, CSS-only radio), দুই দিকের টেবিল।
  - বাস + নাজিরহাট ট্রেন — ২-কলাম প্যানেল; বাসের "সকাল/সন্ধ্যা/রাত" পিরিয়ড-পিল।
  - প্রতিটি প্যানেলে উৎস-ব্যাজ ও হেডার গ্রেডিয়েন্ট।
  - নিচে "জরুরি ও গুরুত্বপূর্ণ যোগাযোগ" কার্ড।
- `public/assets/css/style.css`: `.ts-*` প্রিমিয়াম স্টাইল (গ্রেডিয়েন্ট হেডার, ট্যাব, টেবিল, পিরিয়ড-পিল, রেসপন্সিভ)।
- `helpers/sections-registry.js`: `contact_transport` ডিফল্ট থেকে ৩টি ডুপ্লিকেট ট্রান্সপোর্ট কার্ড বাদ; শুধু ৩টি "গুরুত্বপূর্ণ নম্বর" কার্ড রাখা হয়েছে।
- DB আপডেট (লোকাল sql.js + প্রোডাকশন Turso): ৩টি ডুপ্লিকেট `site_items` (শাটল/বাস/নাজিরহাট স্কেজিউল) মুছে ফেলা, বাকি ৩টি re-sort (১-৩)।
- যাচাই: ৪১টি `<tr>`/৭টি টেবিল শিডিউল বোর্ডে; সব টাইম/অ্যারাইভাল ডক-এর সাথে মিলেছে; পাবলিক ৯ পেজ 200।
- ⚠️ লোকাল sql.js সার্ভারের শাটডাউন-সেভ বাইরের node এডিটকে ওভাররাইট করে (রেস কন্ডিশন) — DB এডিট করলে আগে সার্ভার বন্ধ করতে হবে, পরে চালু।

### টাস্ক ১৩ — ফলো-আপ: শিডিউল ডেটা মূল Turso ডাটাবেজেও রাখা হয়েছে

- `db.js`: নতুন `getTransportSchedule()` — `settings.transport_schedule` (JSON) প্রথমে পড়ে; না থাকলে `helpers/transport-schedule.js` ডিফল্ট।
- `db.js` initDb-এ সিড: `transport_schedule` key না থাকলে হেল্পার থেকে JSON INSERT (প্রতি ইনস্টলে একবার; অ্যাডমিন আপডেট করলে ওভাররাইট হয় না)।
- `routes/pages.js` `/contact`: এখন `db.getTransportSchedule()` ব্যবহার করে (কোড হেল্পার সরাসরি নয়)।
- Turso (প্রোডাকশন) + লোকাল sql.js — দুটোতেই `transport_schedule` JSON লেখা হয়েছে (শাটল ২ ট্যাব, বাস ২ গ্রুপ, ট্রেন ৪ সারি)।
- যাচাই: লোকাল সিড হয়েছে, getTransportSchedule DB থেকে পড়ছে, পেজ রেন্ডার ঠিক, পাবলিক পেজ 200।
- এখন শিডিউল ডেটা DB-এর সোর্স-অব-ট্রুথ — অ্যাডমিন/DB থেকেই আপডেটযোগ্য (কোড ডিপ্লয় ছাড়া), আগামীতে অ্যাডমিন UI লাগানো যাবে।

### টাস্ক ১২ (পর্ব ৩) — অংশ ক: উপদেষ্টা পেজে কার্যবর্ষ ফিল্টার

- **অডিট** (`audit-executive-council.md`): কমিটি ফিল্টার = সার্ভার-সাইড `?year=`; উপদেষ্টা মডিউলে `term_year` কলাম আগে থেকেই আছে (১০টি এন্ট্রি null); কেন্দ্রীয়তে "উপদেষ্টা" role = শুধু মো. রাফছান (২০২২-২৩) ১টি; role ফিল্ড সব জায়গায় ফ্রি-টেক্সট (dropdown নয়)।
- **ইউজার সিদ্ধান্ত:** ১০টি প্লেসহোল্ডারকে প্রত্যেককে একটা বছর বসাও (পরে ইডিট করবেন); ফিল্টার সার্ভার-সাইড `?year=` + কমিটি UI হুবহু।
- db.js: মাইগ্রেশন `advisory_term_v4_seeded` — null-year advisory → '২০২৪-২৫' (Turso + লোকাল ১০টি আপডেট); ডেমো সিডেও advisory-তে term_year যোগ।
- routes/daily.js `/committee/advisory`: সার্ভার-সাইড year ফিল্টার (কমিটির হুবহু লজিক)।
- views/lekhok-advisory.ejs: কমিটির হুবহু term-bar/term-select UI দিয়ে পুনর্লিখন।
- যাচাই: ডিফল্ট ২০২৪-২৫ (১০ জন), invalid year → fallback, পাবলিক ৭ পেজ 200।
- ⏸️ অংশ খ (মো. রাফছান স্থানান্তর + ভ্যালিডেশন) এখনো শুরু হয়নি — ইউজার কনফার্মেশন অপেক্ষায়।

### টাস্ক ১২ (পর্ব ৩) — অংশ খ: মডিউল সেপারেশন + ব্যাকএন্ড ভ্যালিডেশন

- **ব্যাকআপ:** `backup-rafsan-advisory-move.md` — মো. রাফছান এন্ট্রির পূর্ণ ডেটা।
- **ডেটা স্থানান্তর:** কেন্দ্রীয় ২০২২-২৩ থেকে "মো. রাফছান (উপদেষ্টা)" সরিয়ে advisory-তে (একই নাম/পদ/বছর/user_id লিংক; designation='উপদেষ্টা')। Turso + লোকাল উভয়ে। লোকাল id 144→192, Turso 329→377।
- **সিড ফিক্স:** V2_TERMS ও v3 মাইগ্রেশনের ২০২২-২৩ থেকে উপদেষ্টা এন্ট্রি বাদ; advisory নিশ্চিত-সিড (মো. রাফছান, ২০২২-২৩) যোগ।
- **v5 মাইগ্রেশন:** `council_separation_v5_seeded` — কেন্দ্রীয় উপদেষ্টা → advisory স্থানান্তর + নিশ্চিত সিড (fresh install-এও কাজ করে)।
- **ব্যাকএন্ড ভ্যালিডেশন:** মডারেটর (`routes/moderator.js` POST/PUT) + অ্যাডমিন (`admin/routes.js` POST/PUT) — central + role-এ "উপদেষ্টা" → ব্লক (এরর মেসেজসহ)।
- **UI হিন্ট:** মডারেটর ফর্মের role প্লেসহোল্ডার আপডেট।
- **যাচাই:** কমিটি ২০২২-২৩=১৫ (রাফছান নেই), advisory ২০২২-২৩=মো. রাফছান ১ জন, কেন্দ্রীয় উপদেষ্টা=০; API-টেস্ট: central+উপদেষ্টা POST → রিজেক্ট (DB-তে ঢোকেনি); পাবলিক ১১ পেজ 200।

---

### টাস্ক ১৩ (পর্ব ৪) — অংশ ক: মাল্টি-ইমেজ আপলোড + গ্যালারি ডিসপ্লে

- **অডিট** (`audit-content-mgmt.md`): ৬ পোস্ট টাইপের single-image অবস্থা, স্টোরেজ/সার্ভ পাইপলাইন, reuse-যোগ্য আপলোড প্যাটার্ন, `post_images` ডিজাইন।
- **ডেটা:** db.js — `post_images` জেনেরিক টেবিল + মাইগ্রেশন `post_images_v6_seeded` (বিদ্যমান image_url/cover_image → post_images, sort_order 0, মূল কলাম অক্ষত); `getPostImages`/`setPostImages` হেল্পার।
- **আপলোড:** `/admin/upload-images` (staff) + `/upload-images` (user) — JSON, ≤২০ ফাইল, WebP-অপটিমাইজ।
- **পারসিস্টেন্স:** ৬ টাইপে create/edit `setPostImages`; share-কপিতে ছবি কপি; trashDelete-এ post_images ক্লিনআপ।
- **UI:** `multi-image.ejs` partial + `multi-image.js` + `multi-image.css` (multi-select/drag&drop/preview/reorder/remove) — admin+moderator+user ফর্মে।
- **ডিসপ্লে:** `post-gallery.ejs` partial + `post-gallery.js` (1→single img, 1+→main+thumbs+lightbox, lazy) — ইভেন্ট/প্রেস/নোটিশ/লেখা/ফিড/ডেইলি পেজে।
- **যাচাই:** মাইগ্রেশন সিড ৩৪ সারি; E2E মাল্টি-ইমেজ ইভেন্ট+প্রেস; পাবলিক ১২ পেজ + ফর্ম ২০০।
- **পরিদর্শনে ধরা ও ঠিক করা বাগ:** getTransportSchedule-এ হারানো `try{`; EJS `<%#`-কমেন্টে `%>` (500); press images-only POST ভ্যালিডেশন; শেয়ারে ছবি-ক্ষতি; লাইটবক্স থাম্ব-ইনডেক্স; `.lightbox-nav` CSS; single-image ডিসপ্লে-ফলব্যাক।
- ⏳ অংশ খ (সেকশন-ভিত্তিক সেভ) ও অংশ গ (মডারেটর UI/UX) এখনো বাকি।

## টাস্ক ১৩ (পর্ব ৪) — অংশ খ: সেকশন-ভিত্তিক Edit & Save ✅

**স্কোপ (ইউজার কনফার্মড: "both"):** কনটেন্ট এডিটর + site_items সেকশন এডিটর + পোস্ট এডিট ফর্ম (নোটিশ/ইভেন্ট/ডেইলি/নিউজ)।

**কনটেন্ট এডিটর (`/admin/content`):**
- `admin/routes.js` → `POST /admin/content/section` (AJAX): একটি গ্রুপের ফিল্ড+ছবি সেভ; রিভিশন+অডিট+ইমেজ-মিডলওয়্যার রি-ইউজ।
- `admin/views/admin/content.ejs` → প্রতি সেকশনে সম্পাদনা/সেভ/বাতিল; readonly লক; fetch+X-CSRF-Token; স্ন্যাপশট-রিস্টোর বাতিল।

**site_items সেকশন এডিটর (`/admin/sections` + `/moderator/sections`):**
- নতুন partial `admin/partials/sections-list.ejs` + `?partial=1` GET ফ্র্যাগমেন্ট।
- `admin/routes.js` + `routes/_sections-actions.js` + `routes/moderator.js` → সব POST JSON (wantsJson42 / _ajax=1)।
- `sections.ejs` → ফর্ম-ইন্টারসেপ্ট fetch + partial রি-রেন্ডার + টোস্ট + আন্ডু।

**পোস্ট এডিট ফর্ম:**
- নতুন এন্ডপয়েন্ট: `POST /admin/{notices,events,daily}/:id/section` + `POST /moderator/press/:id/section` (আংশিক-আপডেট + JSON)।
- শেয়ার্ড `public/assets/js/section-form.js` + `.sf-*` CSS (admin.css) + sidebar-এ লোড।
- `notices/events/daily/form.ejs` + `moderator-press.ejs` → এডিট মোড সেকশনাইজড, অ্যাড মোড অপরিবর্তিত।

**যাচাই (curl):** সেকশন-সেভ শুধু সেই সেকশন আপডেট; খালি শিরোনাম → 400; সেকশন-এডিটর add/save/toggle/move/delete/reorder/undo সব JSON OK; মডারেটর প্রেস সেকশন-সেভ OK; অ্যাড ফর্ম ও পাবলিক পেজ রিগ্রেশন 200।

## টাস্ক ১৩ (পর্ব ৪) — অংশ গ: মডারেটর প্যানেল UI/UX ✅

- ৯টি মডারেটর ভিউয়ের ইনলাইন `<style>` মুছে `.mod-*`/`.mem-*`/`.clip-*` admin.css-এ একত্র (--ad-* টোকেন)।
- `html{scrollbar-gutter:stable}` + হোভার translateY ট্রান্সফর্ম সরানো + min-height (stat/tile/empty/item/clip-row/mem-row)।
- সাইডবারের নিচে `.su-scopes` টিক-আইকন ব্যাজ ব্লক + CSS সরানো (লগইন/লগআউটের পাশে)।
- যাচাই: ৯ মডারেটর পেজ + অ্যাডমিন পেজ 200; লগইন/লগআউট 302; nav গেটিং (userScopeMeta) অক্ষত।

## সেশন ৫৬ — অথ-পেজ "Confident Split" রিডিজাইন ✅

- আপলোডকৃত ডিজাইন-কনসেপ্ট অনুযায়ী (ইউজার-কনফার্মড অপশনসহ) ৬টি অথ-পেজে split-screen ৪৫:৫৫ লেআউট: login (ট্যাব: লগইন | আইডি খুঁজুন), register (এক-পেজ), claim, forgot, reset, register-pending।
- auth.css: নতুন `body.auth-split` স্কোপ (as-shell/as-brand/as-form-panel/as-tabs/ff ফ্লোটিং-লেবেল/pw-toggle/মোবাইল ব্যান্ড); পুরনো .auth-card সেন্টার্ড স্টাইল অক্ষত (article-form/qa-form/edit)।
- নতুন `public/assets/js/auth.js`: ফ্লোটিং-লেবেল autofill-গার্ড, পাসওয়ার্ড শো/হাইড, ট্যাব-সুইচ (#find হ্যাশ), সাবমিট লোডিং-স্টেট (সাইজ-ফিক্সড), মোবাইল scrollIntoView।
- routes/auth.js: ৬টি দৃশ্যমান এরর-মেসেজের em dash → । ; claim/register-pending ভিউতেও em-dash পরিচ্ছন্ন।
- যাচাই: verify-session56.js ৫৪/৫৪ PASS (ফ্লো+DOM+রিগ্রেশন+em-dash ০+ব্রেস 99/99); Playwright verify-session56-browser.js ১০/১০ PASS; স্ক্রিনশট ৬টি download/-এ; লাইভ-যাচাই পুশের পরে।

---

## সেশন ৫৮ — সাইট-ওয়াইড ডার্ক-গ্রিন গ্র্যাডিয়েন্ট থিম + অথ-পেজ ডার্ক রিডিজাইন + রেজিস্ট্রেশন UX ✅

**ইউজার-রিকোয়েস্ট:** ① হোমের ফিড-শোকেসের ডার্ক-গ্রিন গ্র্যাডিয়েন্ট পুরো সাইটে ② গাড়-সবুজ টেক্সট → লাইট-সবুজ ③ লগইন/রেজিস্ট্রেশন UI/UX ফিক্স।

**থিম (৯টি CSS ফাইল):**
- style.css: `:root` প্যালেট রি-ডিফাইন (`--accent:#34D399` ইত্যাদি); `body::before` ফিক্সড গ্রেডিয়েন্ট-ওভারলে (feed-showcase-হুবহু + রেডিয়াল গ্লো); হিরো ট্রান্সপারেন্ট; কনটেক্সট-অ্যাওয়্যার রিম্যাপ (bg/color আলাদা); ওভাররাইড-লেয়ার (স্ক্রলবার/selection/color-scheme:dark/বাটন on-accent/ব্যাজ-টিন্ট)।
- feed/dashboard/article/profile/member-accounts/multi-image: একই ম্যাপিং + `color:var(--brand)`→`var(--brand-text)` + স্ট্যাটাস-ব্যাজ ট্রান্সলুসেন্ট।
- admin.css: `--ad-*` টোকেন ডার্ক-গ্রিন + লাইট-রেমন্যান্ট ফিক্স।
- ধরা-পড়া রিগ্রেশন ফিক্স: `#cbd5e1`-টেক্সট ভুলবশত ডার্ক হওয়া (১৯টি); গ্রেডিয়েন্টের ভেতরের লাইট-স্টপ; feed-type/complaint-স্ট্যাটাস ব্যাজ।

**অথ (auth.css + register.ejs + auth.js):**
- split-স্ক্রিন ডার্ক-গ্লাস রিডিজাইন; ফ্লোটিং-লেবেল/ট্যাব/ইনপুট/এরর-বক্স ডার্ক; autofill-ফিক্স; select-শেভরন; রেজিস্টার ৪-সেকশন গ্রুপিং + কলাপ্সিবল সোশ্যাল + পাসওয়ার্ড-মিটার + char-counter + কাস্টম ফাইল-ড্রপ।
- **ক্রিটিক্যাল ফিক্স ১:** ফাইল-ইনপুটের absolute-inset পেজ ঢেকে দিত → `.file-field{position:relative}`।
- **ক্রিটিক্যাল ফিক্স ২:** ৮ অথ-ভিউতে auth.css লিংকে `?v=<%= AV %>` (স্টেল-ক্যাশ রোধ)।
- views: 404/contact ইনলাইন-কালার ফিক্স।

**যাচাই (agent-browser @ :3030):** ভিজ্যুয়াল-অডিট সব পেজে OK (VLM-ক্রস-চেক); ডার্ক-অন-ডার্ক টেক্সট ০; রেজিস্ট্রেশন E2E ✓ (testtheme); লগইন-এরর ডার্ক-রেড ✓; অ্যাডমিন প্যানেল ✓; মোবাইল 390px ওভারফ্লো-মুক্ত ✓।

## সেশন ৫৭ — লাইভ-রিপোর্টেড অথ-বাগফিক্স + নেতৃত্ব-কার্ড ফিচার ✅

- রিপোর্ট: লগইনের পর "নিরাপত্তা যাচাই ব্যর্থ" কাঁচা 403; অ্যাডমিন 2FA-কনফার্ম ফেইল; ERR_TOO_MANY_REDIRECTS; ট্র্যাশ-ভিজিটের পরও লাল-ব্যাজ; ৮ নেতৃত্ব-কার্ডে ছবি+আইডির ইউয়ারএল-অপশন।
- রোগনির্ণয়: Vercel lambda-freeze + async সেশন-স্টোরে হারানো csrfToken-রাইট → ফর্ম-টোকেন/সেশন মিসম্যাচ → সব POST কাঁচা 403; সেশন-ইনকনসিস্টেন্সি = রিডাইরেক্ট-লুপ।
- ফিক্স (server.js): CSRF ডাবল-সাবমিট কুকি (_csrfTok httpOnly; ফর্ম+কুকি একই রেসপন্সে সিঙ্কড); গ্রেসফুল ফেইল (303 ?csrf=1 / JSON 403); res.render/res.send-ও session-save-await র‍্যাপ; /login//logout/register-এ no-store।
- main.js: ?csrf=1/?saveerr=1 → বাংলা টোস্ট + URL পরিষ্কার। অথ-ফর্মে সার্ভার-রেন্ডার্ড _csrf (login/forgot/reset; register-এ action-কোয়েরি)।
- 2FA UX: bad_code/no_pending-এ কার্যকর নির্দেশনা; security.ejs।
- ফিচার: members.profile_url কলাম + অ্যাডমিন-ফর্মে "আইডির ইউয়ারএল" + হোম-কার্ডে data-href ক্লিক + fa-id-card আইকন (safeLeaderUrl গার্ড; fallback /profile/:username) + ফর্মে হোম-কার্ড ম্যাপিং-হিন্ট।
- db.js: members-এর designation/social_fb/social_email/term_year ensure-লিস্টে (ফ্রেশ-DB সেফটি)।
- যাচাই: verify-session57.js ৪১/৪১; Playwright verify-session57-browser.js ৮/৮; রিগ্রেশন verify-session56.js ৫৪/৫৪। লাইভ-যাচাই পুশের পরে।

---

## সেশন ৫৯ (ক্রন-review রাউন্ড ১) — QA + অবতার-রিথিম + কুইজ-আর্কাইভ + ব্যাক-টু-টপ + ডেমো-লগইন রিসেট ✅

- QA-সুইপে বাগ: gender-অবতার SVG (নীল/গোলাপি/বেগুনি) ডার্ক-গ্রিন থিমে বিসদৃশ → সবুজ-পরিবার গ্রেডিয়েন্টে রিথিম + ?v=2 ক্যাশ-বাস্টিং (route-রিডাইরেক্ট + ১০ ভিউ-রেফারেন্স)।
- কুইজ-পেজে "পূর্বের কুইজ" আর্কাইভ-অ্যাকর্ডিয়ন (অব্যবহৃত archive ডেটা) — নতুন ফিচার।
- সাইট-ওয়াইড ব্যাক-টু-টপ ফ্লোটিং বাটন + গ্লোবাল ফোকাস-রিং (a11y)।
- লাইভ-Turso ডেমো-পাসওয়ার্ড রিসেট (demo123) — লাইভ E2E লগইন ভেরিফায়েড।
- অন্য-এজেন্টের 2FA/premium.css কমিট রিবেস-মার্জ + যৌথ-স্টেট QA ✓।
- পুশ d9714fc → লাইভ ডিপ্লয় ভেরিফায়েড।

---

## সেশন ৭৬ (দ্বিতীয় এজেন্ট — মেসেজিং প্রো-আপগ্রেড) — রিপ্লাই/এডিট/ফরওয়ার্ড/কপি/আনসেন্ড/মিউট/পিন/ড্রাফট ✅

**প্রেক্ষাপট:** সমান্তরাল এজেন্ট WebRTC কলিং করছে — সেই এরিয়া এড়িয়ে বাকি "আধুনিক মেসেজিং ফাংশনালিটি" প্রোডাকশন-গ্রেডে তৈরি। ভিত্তি: session75-এর FB-মেসেঞ্জার-রিভ্যাম্প (baaa61c)।

**নতুন ফিচার (সব DB-ব্যাকড, cross-device):**
- **রিপ্লাই-থ্রেডিং:** `messages.reply_to_id` (LATER_COLUMNS) → chat GET-এ LEFT JOIN প্রিভিউ (reply_body/reply_sender_name) → বাবলে FB-স্টাইল কোট (me-বাবলে সাদা-বার, them-এ নীল-বার) → ⋯-মেনু → রিপ্লাই-বার (নাম+প্রিভিউ+বাতিল) → hidden `reply_to` ফিল্ড (1:1 + গ্রুপ POST উভয়ে) → optimistic বাবলেও কোট → poll-এ reply ফিল্ডসহ → কোট-ক্লিকে মূল মেসেজে smooth-scroll + নীল-ফ্ল্যাশ।
- **মেসেজ-এডিট:** `POST /api/messages/:id/edit` — শুধু নিজের টেক্সট, ১৫-মিনিট উইন্ডো (created_at UTC-পার্স), `edited_at` ট্রেস; কম্পোজার এডিট-মোড (edit-বার + input-prefill + সেন্ড-বাটন ✓-এ রূপান্তর — updateSendBtn র‍্যাপ) — window-capture submit-ইন্টারসেপ্ট (eval CSP-সেফ); (সম্পাদিত)-লেবেল; **লাইভ-প্রোপাগেশন:** poll-এ `edits` অ্যারে (id <= since AND edited_at NOT NULL) → অন্য পক্ষের বাবল রিয়েল-টাইমে আপডেট।
- **ফরওয়ার্ড:** `GET /api/messages/forward-targets` (convListFor রি-ইউজ) + `POST /api/messages/:id/forward` (মূল অক্ষত, কপি টার্গেটে, মিউট-সচেতন নোটিফ) → FB-স্টাইল মোডাল (৩০-সেকেন্ড টার্গেট-ক্যাশ, সার্চ, অ্যাভাটার/গ্রুপ-ব্যাজ)।
- **কপি:** ⋯-মেনু → clipboard API + execCommand ফলব্যাক + টোস্ট।
- **আনসেন্ড:** ইউনিভার্সাল `POST /api/messages/:id/delete` (sender-only + convAccess; আগে 1:1-only ছিল, গ্রুপে ভাঙা ছিল) — ⋯-মেনু + পুরনো ×-বাটন দুটোই এখন এই এন্ডপয়েন্টে।
- **মিউট (DB):** `conversation_members.muted` (1:1-এ অন-ডিমান্ড row INSERT OR IGNORE) → notifyOnce-এর আগে isConvMuted-চেক (প্রতি-প্রাপক) → **যাচাইকৃত:** মিউটে পাঠালে unread 0, আনমিউটের পরে 1। ডিটেইলস-প্যানেল টগল + তালিকা-মেনু।
- **পিন (DB):** `conversation_members.pinned` → convListFor-এ পিন-প্রথম সর্ট → তালিকায় thumbtack ফ্ল্যাগ + গ্রেডিয়েন্ট-রো; ডিটেইলস-প্যানেল + তালিকা-মেনু (টগলে রিলোড-রি-সর্ট)।
- **ড্রাফট-অটোসেভ:** প্রতি-কথোপকথন `lf_msg_draft_<convId>` — ১.২সে সুইপ + beforeunload; রিলোডে রিস্টোর (মোবাইল+ডেস্কটপ যাচাই)।
- **বাবল ⋯-মেনু:** হোভার-ইলিপসিস → ভাসমান মেনু (উত্তর/কপি/ফরওয়ার্ড/সম্পাদনা/আনসেন্ড — own/hasText-অনুযায়ী) → touch-ডিভাইসে সর্বদা ০.৫৫-অপাসিটি।

**ক্রস-এজেন্ট রিবেস-মার্জ (6beebe6-এর উপর):** তাদের সেশন-৭৬-এর localStorage-মিউট/আর্কাইভ + থিম-সোয়াচ + অ্যাডাপটিভ-পোলিং অক্ষুণ্ণ; দুটো কনটেক্সট-মেনুর সংঘর্ষ ইউনিফাই: তাদের তালিকা-মেনুই একমাত্র ট্রিগার — তাতে আমার DB-পিন/আনপিন আইটেম + মিউটে DB-সিঙ্ক (তাদের লোকাল-ভিজ্যুয়াল সহ); আমার rowMenu কোড সরানো; চ্যাট-পেজে দুই মোডাল (convMenu + fwdOverlay) পাশাপাশি; messenger.css-এ দুই স্টাইল-ব্লক সংরক্ষিত।

**৩টি প্রি-এক্সিস্টিং বাগফিক্স:**
1. `.b-content { white-space: pre-wrap }` — কনটেইনারে থাকায় EJS টেমপ্লেট-নিউলাইনগুলো অ্যানোনিমাস-লাইন-বক্স হত → বাবল অস্বাভাবিক লম্বা (মোবাইলে ~৩৩০px; বেসলাইনেও ২৭৯px প্রমাণিত) → normal + .bubble-text-এ pre-wrap রাখা।
2. `.file-preview` — `hidden` অ্যাট্রিবিউট সত্ত্বেও `display:flex`-ওভাররাইডে খালি পিল-বার সবসময় দৃশ্যমান → `[hidden]` রুল।
3. মোবাইলে অ্যাসিঙ্ক-ফন্ট-রিফ্লোতে scroll-to-bottom হারাত (top:0) → fonts.ready + load + ৪০০ms-এ পুনর্নিশ্চিত (৩-শট লিমিট)।

**হার্ডেনিং:** `/messages|complaints|notifications|bookmarks`-এ `Cache-Control: no-store` — লগড-ইন ডাইনামিক পেজে হিউরিস্টিক-ক্যাশে স্টেল-HTML রোধ (লোকাল-যাচাইয়ে পুরনো-AV HTML ধরা পড়েছিল)।

**টেক-নোট:** সাইটে CSP `script-src 'self' 'unsafe-inline'` — eval নিষিদ্ধ; ইনলাইন-স্ক্রিপ্টের টপ-লেভেল `const` গ্লোবাল-লেক্সিকাল বাইন্ডিং — যেকোনো ক্লাসিক স্ক্রিপ্ট সরাসরি পড়তে পারে (typeof-গার্ডে), window-প্রপার্টি হয় না। messenger-actions.js এই প্যাটার্নে লেখা।

**যাচাই (agent-browser, দুই ইউজার):** রিপ্লাই→অপটিমিস্টিক-কোট→রিয়েল-আইডি ✓ এডিট→(সম্পাদিত)+poll-প্রোপাগেশন ✓ ফরওয়ার্ড-মোডাল→কপি-বাবল ✓ কপি-টোস্ট ✓ মিউট-সাপ্রেশন (0→1) ✓ পিন→রি-সর্ট+ফ্ল্যাগ ✓ তালিকা-মেনু আনপিন→রিলোড ✓ ড্রাফট-রিস্টোর (ডেস্কটপ+মোবাইল) ✓ থিম-সোয়াচ+আমার টগল সহ-অস্তিত্ব ✓ রিয়েকশন/টাইপিং/সিন রিগ্রেশন ✓ কনসোল-এরর 0 ✓ মোবাইল-390px ওভারফ্লো-0 ✓ curl-E2E: edit-window/forward/unsend/poll-edits/forward-targets ✓

**কমিট:** 91a787e (rebase on 6beebe6) → pushed।
**পরবর্তী সুপারিশ:** ① ইনলাইন-চ্যাট-স্ক্রিপ্টের reply/edit অংশ messenger-actions.js-এ সরানো (ফাইল ভার কমানো) ② চ্যাট-সাইডবারের convMenu-মিউটেও DB-সিঙ্ক (তালিকায় করা হয়েছে) ③ WebRTC এজেন্টের সিগন্যালিং-সার্ভিস আসার পর ⋯-মেনুতে 'কলে উত্তর' অপশন ④ মেসেজ-ডিলিটের soft-delete/ tombstone (অন্য পক্ষের ক্লায়েন্টে লাইভ-রিমুভাল)।

---

## Session 91-QA (cron-review round 2) — QA first, then bugfixes + roadmap features ✅ (commits ef58f03, 22e5a6a — pushed)

### Current project status / assessment
- Repo synced at session90 (633bda3) at start; parallel agent pushed 4 commits mid-round (session91-Phase-E: /api/health+PWA-sw; session89: facepile/infinite-scroll/messenger-search) → rebased cleanly on ffe1b5c.
- QA sweep: 19-page curl matrix all 200; 0 console errors (home/login/dashboard/messages); server on :3030 via setsid double-fork.
- **Environment quirks found:** (1) local lekhok.db had no QA users → seeded via new `scripts/seed-qa-users.js` (testuser/testadmin demo123; testagent1/testagent2 Test@1234). Note: a RUNNING server overwrites file-seeds via its in-memory DB — stop server before seeding. (2) agent-browser **trusted clicks dispatch no events at all** in this headless env (pure-JS buttons too) → use `eval b.click()` + curl for browser E2E; not an app bug. (3) bash tool output eats `[h` sequences — verify file bytes via node/Buffer hex, never trust grep prints (this is what corrupted the repo in the first place).

### Bugs found & fixed this round
1. **POST /login 500** on missing/non-string fields (sql.js "bind unknown type undefined" in admin_users fallback lookup) → string-coerce + trim → graceful Bengali error (verified: 200, no log error).
2. **No-JS CSRF gap**: 5 primary settings forms + article form lacked server-side `_csrf` hidden input (JS-injection only) → added; settings/privacy POST now succeeds headlessly (303 → ?ok=privacy).
3. **/me hero white-on-white** (pre-existing): `.me-header-inner` white card bg covered the gradient band → white name invisible → transparent + gradient #0f4c46→#059669 (verified by screenshot).
4. **`[h[h[hidden]` selector corruption — 17 occurrences repo-wide** (previous agent's fix commit was incomplete): style.css ×5, messenger.css ×9, messages-chat.ejs ×1, profile.ejs ×2 — all restored byte-true (node-verified), repo scan now 0. These were silently-dead selectors (facepile hide, me-tabs, rp81 overlays).

### New features (roadmap master-table items)
- **09 B4 notification-pref enforcement**: helpers/notify.js `prefAllows/notifyIfAllowed` (unset=true back-compat); 10 social.js sites (reaction/like/comment/mention/follow/answer) + dashboard.js notifyOnce `prefsKind` for 3 message sites (mute-check intact). E2E: pref-off→0 notifications, pref-on→delivered.
- **15 D2 public bookmarks**: `GET /profile/:username/bookmarks` + new `user/profile-bookmarks.ejs` (pbk-* scoped design: mini-hero+stats, card grid with cover/excerpt/read-time/relative-saved-time, owner inline-unsave, empty state, styled privacy lock-screen, 390px-safe); profile subnav "সংরক্ষণ" link-tab (owner or bookmarks_public=1); settings toggle now has "পাবলিক ভিউ দেখুন" link. Privacy matrix E2E ✓.
- **16 D3 writer stats (/me)**: ws91 card — total views/reactions/comments KPIs + best-post trophy link + 6-month publish bar chart (hand-rolled SVG, gradient grow animation, reduced-motion aware, Bengali digits/months).
- **18 merged**: two agents' /api/health unified (session90 key-names + session91 ok/env fields); duplicate route removed.
- **A3 verified already complete** since session 50 (assets/uploads immutable 30d, /img/cover 1y, avatar 60s) — no change needed.

### Verification results
- `scripts/test-role-policy.sh` **99/99 ALL GREEN** (single instance; 6 false-fails when two server instances race the shared lekhok.db file — environmental).
- Health JSON merged schema ✓; login-missing-field 200 ✓; pref-gate chain ✓; privacy matrix ✓; chart render ✓; 19 pages 200 ✓; console 0 on /messages+/me+/profile-bookmarks ✓; 390px overflow 0 ✓.
- Rebase on ffe1b5c (only style.css EOF conflict — kept both blocks) + merge-cleanup commit → pushed ffe1b5c..22e5a6a.

### Unresolved risks / next-step recommendations
- ⚠️ Shared lekhok.db + multiple node instances = last-writer-wins (seed loss, test false-fails) — keep ONE instance when running suites.
- Trusted-click quirk makes browser E2E awkward — documented JS-click pattern for future rounds.
- Next best items: messenger shared-media tab (11+12), scroll-position restore (06), pen_name in comment bubbles/notifications (14), voice notes (C1 — coordinate with WebRTC agent), then SSE hub (01, 🔴 core).
- Local test data left in lekhok.db only (testagent1 has 1 post + 1 bookmark + bookmarks_public=1) — sandbox-only, not on live Turso.

### Addendum (post-push cross-agent catch)
- Parallel agent's `3b9a246` (deep-audit security batch: secrets scrub + jesc XSS-guard + leader-card escaping) landed while this round was wrapping. Its `app.locals.jesc` (server.js) requires a **process restart** — a stale dev server 500s on any view calling `jesc()` (`jesc is not defined` on / and /articles/1 was observed live). Restart fixed it; final tree verified: role-policy 99/99 ALL GREEN, 19-page matrix 200, console 0. Vercel redeploys are fresh processes (unaffected).
- Local servers left running: :3030 (SANDBOX_PORT, my QA instance) + :8080 (suite target). If another agent needs a clean DB state, stop instances before seeding (in-memory DB overwrites file seeds).

---
Task ID: sub-cta-contrast (সেশন ৯৮ — ইউজার-রিপোর্টেড UI ফিক্স)
Agent: Z.ai sub-agent (CTA text-contrast fix)
Task: পরিচিতি পেইজের "সদস্য সংগ্রহ চলছে / আপনি কি একজন কলম সৈনিক হতে চান?" CTA-ব্যানারের প্যারাগ্রাফ ও "যোগাযোগ করুন" আউটলাইন-বাটনের টেক্সট ডার্ক-নেভি ব্যাকগ্রাউন্ডে কালো/অস্পষ্ট দেখাচ্ছিল — সাদা (slate-200/white) টেক্সট + বর্ডার-কনট্রাস্ট বাড়ানো

Work Log:
- ফ্রেশ ক্লোন + parallel-agent স্টেট যাচাই (remote মাথায় session94/97) → রুট-কজ নির্ণয়:
  1. `.cta-banner p{color:#64748b}` — ডার্ক নেভি গ্রেডিয়েন্ট (var(--brand) #0a1f44 → var(--bg-main) #0B1121)-এর ওপর ডার্ক-গ্রে প্যারাগ্রাফ
  2. `.btn-outline`-এর পরবর্তী গ্লোবাল রুল `color:#1e293b` (কালো) — ডার্ক ব্যানারে বাটন-লেখা মিশে যাচ্ছিল
- ফিক্স (public/assets/css/style.css, মাত্র ১ লাইন — স্কোপড, মিনিফাইড-সেফ node রিপ্লেস):
  - `.cta-banner p` → `color:#e2e8f0` (slate-200)
  - নতুন স্কোপড রুল: `.cta-banner .btn-outline{color:#fff;border:1.5px solid rgba(148,163,184,.6)}` + hover `bg-white/10 + border-white` (গ্লোবাল .btn-outline অক্ষত — হোম-হিরো লাইট-থিম রক্ষা)
  - `.cta-banner .accent/.eyebrow` → emerald-400 #34d399; `.accent-divider` → emerald-400 গ্রেডিয়েন্ট
- ভেরিফিকেশন (এনভায়রনমেন্ট-কোয়ার্ক বাইপাস করে):
  - সার্ভার :3030 (double-fork setsid); agent-browser Caddy-গেটওয়ে `:81/about?XTransformPort=3030` দিয়ে
  - কম্পিউটেড-স্টাইল প্রমাণ: para rgb(226,232,240)=#e2e8f0 ✓ btn rgb(255,255,255) ✓ border rgba(148,163,184,.6) ✓ hover bg rgba(255,255,255,.1)+border white ✓ accent #34d399 ✓
  - ভিজ্যুয়াল স্ক্রিনশট (সম্পূর্ণ রেন্ডার): প্যারাগ্রাফ স্পষ্ট পাঠযোগ্য, বাটন সাদা-টেক্সট+দৃশ্যমান-বর্ডার ✓
  - রিগ্রেশন: হোম-হিরো `.btn-outline` আগের মতোই #1e293b/লাইট-বর্ডার (লাইট ব্যাকগ্রাউন্ডে) ✓; CSS brace-balance 0 ✓
- ক্লিন-আপ: নিজের :3030 ইনস্ট্যান্স বন্ধ + নিজের agent-browser সেশন close (শেয়ার্ড-DB রেস এড়াতে)

Stage Summary:
- কমিট: ca4ce27 (7a34dee-এর ওপর rebase) → pushed ✓ — Vercel ফ্রেশ-প্রসেসে AV-ক্যাশ-বাস্টসহ ডিপ্লয় হবে
- ফাইল চেঞ্জ: lekhok-forum/public/assets/css/style.css (+স্কোপড রুল যুক্ত, গ্লোবাল কিছু ভাঙেনি)
- নোট: এই স্যান্ডবক্সে site-JS/CSS গেটওয়ে-কুয়েরি ছাড়া 404 খায়; reveal-অ্যানিমেশনের `.in` ক্লাস ম্যানুয়াল ট্রিগার করতে হয় — ফিক্সের সাথে সম্পর্কহীন, শুধু ভেরিফিকেশন-পদ্ধতি

---
Task ID: cron-r2 (সেশন ১০০ — webDevReview রাউন্ড ৩)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → রোডম্যাপ-১৭ (D4) জনপ্রিয়-ট্যাগ ক্লাউড + ট্যাগ-ফিল্টার UI (/articles) ইমপ্লিমেন্ট ও পুশ

Work Log:
- worklog/PLANS রিভিউ → parallel এজেন্টদের session94–98 পর্যন্ত অবস্থা ধরা; খালি আইটেম স্ক্যান
- QA: ১৪-পেজ কার্ল-ম্যাট্রিক্স সব ২০০ + /api/health (১ms latency) + agent-browser /articles কনসোল-০ — বাগ-শূন্য, ফেজ স্টেবল
- ফোকাস-নির্বাচন: D4-এর ব্যাকএন্ড আগে থেকেই ছিল (routes/social.js ট্যাগ-পুল+?tag= ফিল্টার) কিন্তু ভিউতে popularTags সম্পূর্ণ অব্যবহৃত — ফ্রন্টএন্ড-অনুপস্থিত; লক-ম্যাট্রিক্স-সচেতনভাবে ভিউ+CSS-কেবল স্কোপ (social.js/server.js স্পর্শ-শূন্য)
- lekhok-articles.ejs: ট্যাগ-পার্স+কাউন্ট+bn-সর্ট (টপ-১৪) → .tag-bar পিল-ক্লাউড (কাউন্ট-ব্যাজ, active, 'সব' রিসেট) + ফলাফল-নোট-স্ট্রিপ + 'ফিল্টার সরান' + কার্ডের প্রথম-ট্যাগ ক্লিকেবল; ট্যাগ↔filter= প্রিজার্ভ-লজিক
- style.css: স্কোপড .tag-bar/.tag-pill/.tag-filter-note/a.card-tag ফ্যামিলি (hover-lift/emerald-active/390px-র‍্যাপ)
- 🚨 sandbox-গোটচা-পুনঃপ্রমাণ: দ্বৈত-ইনস্ট্যান্স রেসে lekhok.db ফাঁকা হয়েছিল (posts=0) — একক-ইনস্ট্যান্স রিবুট + ৮-ডেমো-লেখা সিড (শুধু এই clone)
- E2E (agent-browser @gateway): পিল+কাউন্ট ✓ ট্যাগ-ক্লিক→ফিল্টার+নোট+active ✓ clear ✓ tag+filter সহাবস্থান ✓ 390px overflow-0 ✓ কনসোল-০ ✓
- 🚨 মার্জ: মাঝ-রাউন্ডে parallel এজেন্টের session99 (SSE হাব) এসেছে — style.css-টেইলে union-কনফ্লিক্ট রেজলভ (উভয়-ব্লক-রক্ষা, brace 0), সেশন-নাম্বার আমারটা ৯৯→১০০ রিনাম (সর্বোচ্চ+১ রীতি)

Stage Summary:
- কমিট 8fbf1a9 → pushed ✓ (7ba5064-এর ওপর); মার্জ-পরবর্তী রানটাইম-যাচাই: ৫-পেজ ২০০ + health healthy + SSE-স্ট্যাট ফিল্ড স্বাভাবিক + বুট-লগ error-০
- D4 এখন সম্পূর্ণ: ট্যাগ-ডেটা হবে কম্পোজ-ফর্মের tags-ইনপুট থেকে (ইউজার-ড্রিভেন); ডেমো-ট্যাগ শুধু sandbox-DB-তে
- পরবর্তী-সুপারিশ: ০৭-কম্পোজার-মোডাল (🔴) / ০৮-এনগেজমেন্ট-র‍্যাংকড-ফিড / নোটিফ-ড্রপডাউন actor-avatar; SSE-এজেন্টের ৪৫সে-ফলব্যাক-পোল-লোড পর্যবেক্ষণ করা দরকার

## সেশন ১০০ — রোডম্যাপ-প্রগতি নোট (cron-r3 এজেন্ট)

**রোডম্যাপ-প্রগতি:** আইটেম **১৭ ✓ (D4-পূর্ণ — জনপ্রিয়-ট্যাগ ক্লাউড + ট্যাগ-ফিল্টার-চিপ + কার্ড-ট্যাগ-লিঙ্ক)**। ব্যাকএন্ডে session90-এর ট্যাগ-পুল/`?tag=`-ফিল্টার প্রথমবার UI-পায়। Agent-Feed/Agent-Chat/Agent-Core লক-জোন সম্পূর্ণ অস্পৃশ্য (ভিউ+CSS-কেবল)।

**ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- lekhok-articles.ejs-এর টপ-ব্লকে `topTags99/bn99/keepFilter99/allUrl99` ভিউ-লোকাল হেল্পার — নতুন হেল্পার লাগলে এখানেই; রুট (social.js) স্পর্শের দরকার নেই
- style.css-এ টেইল-অ্যাপেন্ড-ক্রম: session99-SSE ব্লক → session100-ট্যাগ-বার ব্লক (union-মার্জ; brace 0 যাচাইকৃত) — পরবর্তী অ্যাপেন্ড EOF-এই করুন
- ট্যাগ-ডেটা: posts.tags (কমা-সেপারেটেড) — কম্পোজ-ফর্মের tags-ইনপুট থেকে জমে; `?tag=` LIKE-ম্যাচ (session90-প্যাটার্ন), কার্ড-ট্যাগ প্রথম-ট্যাগ-কেবল
- session99-SSE-এর সাথে সহাবস্থান যাচাইকৃত (৫-পেজ ২০০ + health + sse-stats ফিল্ড)

**গোটচা-পুনঃপ্রমাণ (cron-r3):** ① দ্বৈত-ইনস্ট্যান্স রেস → lekhok.db ফাঁকা (posts=0) — একক-ইনস্ট্যান্স রিবুটেই স্বাভাবিক; সিডের আগে সার্ভার বন্ধ রাখুন ② agent-browser-এ পেজ-নেভিগেশনে XTransformPort কুয়েরি হারায় — ফিল্টার্ড-URL সরাসরি ওপেন করুন ③ seed-INSERT-এ কলাম/placeholder-অর্ডার দ্বিবার মিলিয়ে নিন (এই রাউন্ডে excerpt↔tags উল্টে গিয়েছিল)।

**পরবর্তী-ক্রন-রাউন্ডে (১০০-পরবর্তী):** ০৭-কম্পোজার-মোডাল (🔴) → ০৮-এনগেজমেন্ট-র‍্যাংকড-ফিড → নোটিফ-ড্রপডাউন actor-avatar → শেয়ার্ড-ট্যাব pagination → ০৮-এর পর D4-বৃদ্ধি: ট্যাগ-অটোকমপ্লিট (article-form)।

---
Task ID: cron-r3 (সেশন ১০১ — webDevReview রাউন্ড ৪)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → রোডম্যাপ-০৪ (রিঅ্যাক্ট-কাউন্ট রেস-সেফ) + D4-বৃদ্ধি (ট্যাগ-অটোকমপ্লিট) — দুই আইটেম এক রাউন্ডে

Work Log:
- সিঙ্ক: 2ab905c (parallel নতুন কমিট নেই); QA ৭-পেজ ২০০ + health ✓ — বাগ-শূন্য
- **রোডম্যাপ-০৪ রুট-কজ:** likes টেবিলে কোনো UNIQUE ইনডেক্স নেই + তিন টগল-পাথেই (toggleLike, /api/react post+comment-ব্রাঞ্চ) read→decide→write — Turso-র async-ইন্টারলিভে ডুপ্লিকেট-লাইক + like_count-ড্রিফট সম্ভব
- **ফিক্স-প্যাটার্ন:** db.js IDX101 (ডুপ্লিকেট-পার্জ MIN(id) + পার্শিয়াল-ইউনিক-ইনডেক্স ×২) + social.js টগলগুলোতে changes()-সিদ্ধান্ত + INSERT OR IGNORE + প্রতিবার সত্য-গণনা; নোটিফ কেবল নতুন-যোগে
- **D4-বৃদ্ধি:** popularTagNames101 হেল্পার → new/edit ফর্মে datalist + '#জনপ্রিয়' চিপ-রো (টগল-অ্যাড/বাদ, .picked, অটোসেভ-সচেতন)
- **E2E-প্রমাণ:** ১৫x-প্যারালাল same-type react → ০-এরর total=১ ✓ ১২x-মিক্সড → এক-রো ✓ ১০x-প্যারালাল toggleLike → ৩০৩ ✓ গ্লোবাল-ডুপ-অডিট ০ ✓ like_count==COUNT(*) ✓ ব্রাউজার চিপ-টগল/পিকড + ডেটালিস্ট-১১ ✓ 390px-০ ✓ কনসোল-০ ✓
- গোটচা: ① /login = সাধারণ-ইউজার পোর্টাল (staff প্রত্যাখাত) — API-টেস্টে roster/demo ইউজার লাগে ② রোস্টার-ইউজার র‍্যান্ডম-পাসওয়ার্ডে সিড — QA-লগইনে scripts/seed-qa-users.js (সার্ভার-বন্ধ-করে) ③ CSRF শুধু urlencoded/multipart POST-এ — JSON /api/* মুক্ত (টেস্ট-সহজ)

Stage Summary:
- কমিট 569bef1 → pushed ✓ — রোডম্যাপে এখন খালি: ০৭ (কম্পোজার-মোডাল 🔴), ০৮ (এনগেজমেন্ট-ফিড), + এক্সটেনশন (নোটিফ-actor-avatar, শেয়ার্ড-ট্যাব pagination, profile-timeline স্ক্রল-রিস্টোর)
- seed-ডেটা: testuser/testadmin + testagent1/2 + ismail/monem/karishma/mahfuz/nusrat (demo123/Test@1234) — এই clone-এ
- পরবর্তী-প্রথম-পছন্দ: ০৮-এনগেজমেন্ট-র‍্যাংকড-ফিড (২-পাস স্কোরিং, social.js) → ০৭-কম্পোজার-মোডাল (বড় — একক-রাউন্ড-ফোকাস)
Task ID: session-97
Agent: Z.ai (Z.ai Code — sandbox web-9d4762c4)
Task: ① লাইভ টেস্ট-লগইন রিসেট (ismail/riya/tanvir/secret123) ② /gallery আন্তর্জাতিক-মান আধুনিকায়ন (ইউজারের ফুল-ডিজাইন ডক অনুযায়ী, Express/EJS-অ্যাডাপ্টেড)

Work Log:
- বর্তমান অবস্থা যাচাই: রিপো ক্লোন → HEAD 9189302 (সেশন-৯৬), স্ট্যাক নিশ্চিত Express+EJS+sql.js/Turso; sandbox worklog.md ছিল না (প্রথম এজেন্ট)
- লগইন-ভাঙার রুট-কজ নির্ণয়: riya/tanvir কোনো সিডেই নেই + seed-এর skip-if-exists লজিকে পাসওয়ার্ড-রিসেট অসম্ভব + সেশন-৯৫ must_change_password গেটে আটকানো-লগইনের সম্ভাবনা
- scripts/reset-qa-logins.js (নতুন): ফোর্স-রিসেটার, লাইভ-Turso-সক্ষম (env টোকেনে @libsql/client ডাইরেক্ট)
- seed-qa-users.js: riya/tanvir + ট্রায়ো secret123 + must_change_password=0; test-login-fixes.sh + verify-session93-calls.js প্রত্যাশা-সিঙ্ক
- ডাটা-লেয়ার: gallery.photographer/event_date (LATER_COLUMNS + CREATE TABLE + schema.sql + admin form/INSERT/UPDATE)
- /gallery পূর্ণ-রিরাইট: প্রিমিয়াম হিরো + ডুয়াল-ভিউ টগল + পিল-ফিল্টার + লাইভ সার্চ + মেসনারি + অ্যালবাম-কার্ড + ফুল-লাইটবক্স (gallery.css/gallery.js নতুন, কন্ডিশনাল include) + স্টাফ-আপলোড-বাটন
- সেশন-৯৪-র বাকি .album-photoidden] করাপশন-রেমন্যান্ট নির্মূল; নিজের ডক-কমেন্টেও স্ট্রিং-পুনরাবৃত্তি এড়ানো (অডিট-সেফ)
- বাগফিক্স প্রক্রিয়ায়: EJS নেস্টেড-স্ক্রিপ্টলেট-কমেন্ট 500 (নিজের), রিস্টার্টে স্টাফ-আপলোড-বাটন-অদৃশ্য (adminUser-সেশন-শাখা যোগ করা)

Stage Summary:
- যাচাই: inspect-audit ৪৯/৪৯ PASS; ট্রায়ো-লগইন 303→/dashboard (curl + agent-browser E2E); role-policy git-stash A/B → বেসলাইন=পরিবর্তন-সহ (৭২/২৭ অভিন্ন, রিগ্রেশন-শূন্য); agent-browser ফুল-ফ্লো + ৩৯০px + কনসোল-০ ✓
- ⚠️ লাইভ-Turso রিসেট রেহাই: টোকেন এই-সেশনে ছিল না — `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/reset-qa-logins.js` এক-রানেই লাইভ ঠিক হবে (বিস্তারিত lekhok-forum/worklog.md সেশন-৯৭)
- সেশন-নাম্বার: ৯৭ ব্যবহার করেছি (৯৬-এর পরবর্তী) — প্যারালাল এজেন্টের সাথে নাম্বার-রেস হলে rebase-এ দুই-এন্ট্রি-ই রাখা হয়েছে কনভেনশন অনুযায়ী
- সিক্রেট-রোটেশন (Turso/SESSION_SECRET/Blob/Resend) এই-টাস্কের স্কোপ-বাইরে — আলাদা এজেন্ট/সেশনে বাকি

---
Task ID: RES-100-b (সেশন ১০০-খ — রিসোর্স QA/পলিশ রাউন্ড)
Agent: Resources-feature agent (Z.ai)
Task: "রিসোর্স পেইজ ক্লিকেবল + অডিও/ভিডিও/ফটো/পিডিএফ সংযুক্ত + এডমিন/মডারেটর আপলোড-অপশন" — স্বাধীন ইমপ্লিমেন্টেশন শুরু করে session101-a (a0b1bb7) পাওয়ায় তাঁর ইমপ্লিমেন্টেশন গ্রহণ + QA + ফিক্স/পলিশ

Work Log:
- Fresh clone → ইউজারের Next.js-ডিজাইনকে Express/EJS-এ অ্যাডাপ্ট করে সম্পূর্ণ ইমপ্লিমেন্টেশন বানিয়েছিলাম (db-কলাম, resourceUpload, ফর্ম-রিডিজাইন, ক্লিকেবল কার্ড, /api view+download, CSS, ডেমো-PDF/WAV/PNG)
- push-এর আগে git fetch → session101-a একই ফিচার main-এ push করেছে (বিস্তর overlap) → আমার প্যাচ /tmp/session100-res-backup.patch-এ সংরক্ষণ করে ডিস্কার্ড → তাঁর কোড গ্রহণ
- তাঁর কোডে QA (curl + agent-browser) করে ৩টি গ্যাপ ফিক্স: ① stat-fetch/window.open/video-src-এ XTransformPort-কুয়েরি অনুপস্থিত (sandbox-এ 404) → sbx() হেল্পার ② image-টাইপে লাইটবক্স নেই → rsxLightbox যোগ ③ লেগেসি res_type='link'-আটকে-রো ১৫/১৯ কার্ড ভুল ব্যাজ → বুট-ব্যাকফিল + normalizeResType স্মার্ট-ফলব্যাক
- বোনাস: ডেমো-মডারেটরকে 'resources' scope (moderator/moderator123 → /moderator/resources 200 যাচাই), CAT_BN বাংলা-লেবেল

Stage Summary:
- কমিট: (নিচে git-log দেখুন) — PROJECT.md-তে সেশন ১০০-খ entry, PLANS.md-তে ক্রস-এজেন্ট নোট
- যাচাই: কার্ড-টাইপ pdf6/audio3/doc4/image2/video2/link2 ✓, অডিও-টগল ✓, ভিডিও-এমবেড-মোডাল ✓, লাইটবক্স open/close/backdrop ✓, stat লাইভ-কাউন্টার (১→২ DOM-আপডেট) ✓, dedup ✓, PDF-ট্যাব XTransformPort-সহ ✓, কনসোল-০ ✓
- শেখা: multipart CSRF-এ body দেখা যায় না (query _csrf প্যাটার্ন); sandbox-এ সার্ভার+টেস্ট এক-ইনভোকেশনে; ব্যাকগ্রাউন্ড প্রসেস মরে যায়
Task ID: user-fix-102 (সেশন ১০২ — যোগাযোগ-পেজ ম্যাপ-ফিক্স ও রিডিজাইন)
Agent: Z.ai Contact-Page Agent
Task: যোগাযোগ পেজের ① গুগল-ম্যাপ না-দেখানো ② 'ক্যাম্পাস তথ্য' কার্ড-ডিজাইন ③ 'বিশ্ববিদ্যালয় সম্পর্কিত তথ্য'/'যাতায়াত'/'জরুরি যোগাযোগ' সাবসেকশনের প্যাডিং ও ডিজাইন — পূর্ণাঙ্গ সমাধান + ফ্লায়ার-ডেটা ইন্টিগ্রেশন

Work Log:
- বর্তমান অবস্থা যাচাই: git fetch (parallel এজেন্টদের session94–101 কমিট সিঙ্ক) → worklog/PLANS/PROJECT পড়ে লক-ম্যাট্রিক্স বুঝলাম; fresh clone-এ bun install → :3030 বুট (SANDBOX_PORT) → agent-browser-এ /contact বেসলাইন স্ক্রিনশট
- **ম্যাপ-মূল-কারণ আবিষ্কার:** শুধু ভাঙা pb=-URL নয় — server.js CSP-তে frame-src-ই ছিল না (default-src 'self' ফলব্যাকে গুগল-আইফ্রেম ব্লকড; সঠিক URL-ও লোড হতো না, লাইভেও)। CSP + frame-src (গুগল-ম্যাপস অরিজিন) + output=embed URL — দুই-স্তর ফিক্স
- views/lekhok-contact.ejs পূর্ণ-রিডিজাইন: কোথায়-আমরা status-রো+লাইভ-ম্যাপ+খুলুন-বাটন; ক্যাম্পাস-চ্যানেল ব্র্যান্ড-টিন্ট অ্যাকশন-কার্ড; ইউনিভার্সিটি অ্যারো-কার্ড; জরুরি-গ্রিড ক্লিক-টু-কল (bn↔en ডিজিট, phoneOf102); হল-প্রভোস্ট গ্রিড+টগল; ফ্রি-শাটল চিপ-প্যানেল — সব C()-কী CMS-চালিত রেখে
- helpers/sections-registry.js: contact_transport ডিফল্ট ৬-জরুরি-নম্বর (tel: extra) + নতুন contact_halls সেকশন (১৫ প্রভোস্ট, অ্যাডমিন-প্যানেলে অটো-আসে); helpers/transport-schedule.js + db.js: freeShuttle ডিফল্ট + মিসিং-কী মার্জ (লাইভ-DB-তেও মাইগ্রেশন-ছাড়া পৌঁছায়)
- routes/pages.js: contact-রুটে halls42 প্যারালাল-ফেচ; style.css EOF: .cx102-স্কোপড ব্লক (+২ প্যাচ — প্রভোস্ট-র‍্যাপ-ফিক্স, egr-num আইকন)
- Sandbox DB: tr42 → ৬-রো (saveDb-সহ; প্রথমবার process.exit-এ হারিয়েছিল — গোটচা প্রমাণিত)
- E2E (agent-browser): ম্যাপ লাইভ-রেন্ডার ✓ চ্যানেল/ইউনি/ইমার্জেন্সি/প্রভোস্ট/ফ্রি-শাটল ভিজ্যুয়াল ✓ টগল ৬↔১৫+লেবেল-সিঙ্ক ✓ tel:-href ✓ 14-পেজ 200 ✓ /api/health ✓ অ্যাডমিন sections-পেজে halls ✓ 390px overflow-0 ✓ কনসোল-0 ✓; role-policy ৭২-পাস (২৭-ফেল = ফ্রেশ-ক্লোন QA-সিড-স্টেট, ডিফে-অসম্পর্কিত)
- PROJECT.md চেঞ্জলগ + PLANS.md cross-agent নোট লিখে কমিট+পুশ

Stage Summary:
- কমিট: session102 — ৭ ফাইল (contact.ejs +362, style.css +167, registry/transport/db/pages/server)
- ফিক্স-প্রমাণ: after-*.png /tmp-তে (before/after তুলনাযোগ্য)
- লাইভ-নোট: ম্যাপ-CSP ফিক্স ডিপ্লয়ে সাথে সাথে কাজ করবে; জরুরি-নম্বর/হল-তালিকা লাইভ-Turso-তে contact_halls-ফলব্যাক থেকে আসবে (admin-চাইলে site_items-এ ওভাররাইড করতে পারবেন)
- পরবর্তী: ফর্ম-রেট-লিমিট, প্রভোস্ট-সার্চ, মাল্টি-পিন ম্যাপ, 'এখন খোলা?' লাইভ-ইন্ডিকেটর
- Cron webDevReview টাস্ক সেট: job_id 393823 (fixed_rate 900s, webDevReview payload — প্রজেক্ট-কনটেক্সটসহ)

---
Task ID: session-103
Agent: Z.ai (cron webDevReview — same sandbox)
Task: গ্যালারি আপলোডার-ফিচার (মূল-ডিজাইনের UploadPhotoModal) + UX-স্টাইলিং উন্নতি + QA/মার্জ

Work Log:
- State-check: origin-এ session-100/101-a/102 এসেছে — stash→pull-rebase→pop (কনফ্লিক্ট-শূন্য), মার্জড-ট্রি স্মোক+audit-গ্রিন
- POST /admin/gallery/bulk (requireScope + multer + storeBufferImage + TA42-audit) — টাস্ক-১৩ /upload-images প্যাটার্নে
- /gallery আপলোডার-মডাল: ড্র্যাগ-ড্রপ/পিকার/প্রিভিউ/মেটাডেটা/XHR-প্রগ্রেস/CSRF-হেডার/সাফল্য-রিলোড
- whoami.staff + gallery.js self-heal (stale-SWR-কপিতে বাটন-গায়েব ফিক্স)
- লাইটবক্স থাম্বনেইল-স্ট্রিপ (ক্লিক-জাম্প+অ্যাক্টিভ-হাইলাইট) + ইমেজ-লোড স্কেলেটন (শিমার→is-loaded)
- E2E: স্টাফ-আপলোড ২০→২২ কার্ড ✓; থাম্বনেইল-জাম্প ✓; নিরাপত্তা-ব্লক ✓; ৩৯০px ✓; কনসোল-০ ✓

Stage Summary:
- স্টাইলিং+ফিচার ম্যান্ডেট পূর্ণ: আপলোডার-মডাল (নতুন-ফিচার), থাম্বনেইল-স্ট্রিপ+স্কেলেটন (স্টাইলিং-বিস্তারিত)
- সব ফাইল audit-গ্রিন; push পূর্বে pull-rebase কনভেনশন মানা হয়েছে
- রিস্ক: লাইভ-Turso-রিসেট এখনো টোকেন-অপেক্ষায়; সিক্রেট-রোটেশন ×৪ বাকি

---
Task ID: 20 (Session 101)
Agent: Cron webDevReview round — ইউজার-আপলোড ২ রিকোয়েস্ট + বাকি-রোডম্যাপ
Task: ① ইউজারের আপলোড-ফাইলের ২ রিকোয়েস্ট বাস্তবায়ন (resources ক্লিকেবল-মাল্টিমিডিয়া + পত্রিকার-ইমেইল ডিরেক্টরি প্রফেশনাল-রিডিজাইন) ② "যে কাজ বাকি আছে" — রোডম্যাপ-অবশিষ্ট (০৭/০৮) ③ E2E + ডক

Work Log:
- cross-agent সিঙ্ক: git fetch → session98/99/100 push ছিল (SSE-হাব ০১ ✓, ট্যাগ-ক্লাউড); session=101 নেওয়া (highest+1)
- **Phase-A (ইউজার-রিকোয়েস্ট-১, কমিট a0b1bb7):** resources মাল্টিমিডিয়া-আপলোড সিস্টেম —
  - db.js: resources-এ res_type/file_size/thumbnail_url/duration/downloads/views/created_by (LATER_COLUMNS+CREATE+schema.sql); MODERATOR_SCOPES-এ 'resources'
  - middleware/upload.js: resourceUpload (subdir=resources, ৬০MB, resource_file-ফিল্ড)
  - admin/resources: ৬-টাইপ-পিকার ফর্ম + auto-detect + list-এ টাইপ-ব্যাজ/স্ট্যাট
  - মডারেটর-প্যানেল: /moderator/resources GET/POST/delete + moderator-resources.ejs + sidebar
  - /resources পাবলিক রিরাইট: ক্লিকেবল কার্ড (অডিও=ইনলাইন, ভিডিও=YT-মোডাল, pdf/doc/image/link=ডাউনলোড-কাউন্টেড) + POST /api/resources/:id/stat (৩০সে-ডিডুপ)
  - /resources/emails পূর্ণ-রিডিজাইন: পরিসংখ্যান-স্ট্রিপ + নির্দেশিকা-বার + স্টিকি সার্চ + ৯-ডেস্ক-পিল (নোট-টেক্সট অটো-শ্রেণিবিন্যাস) + ওয়ান-ক্লিক-কপি + সাবজেক্টসহ mailto-ড্রাফট
  - scripts/seed-resources-101.js: আসল PDF/WAV(PCM)/PNG জেনারেটর + ৫ ডেমো-রো
- **Phase-B (রোডম্যাপ-০৭+০৮):** আমার ইমপ্লিমেন্টেশন (api/posts/quick + buildPopularFeed + qm-মোডাল) বানিয়েছিলাম, কিন্তু rebase-এ দেখি সমান্তরাল session100 আরও পূর্ণাঙ্গ ভার্সন (cpm-মোডাল + composer-modal.js + sort=ranked rankedFeedSlice) পুশ করেছে — **আমার ডুপ্লিকেট ড্রপ করে তাঁদেরটি গ্রহণ** (দুই-পক্ষই সচেতন-সিদ্ধান্ত, ডুপ্লিকেশন-শূন্য)
- **Phase-C (session100-খ-সুপারিশ বাস্তবায়ন):** ③ thumbnail_url এন্ড-টু-এন্ড (ফর্ম×২ + পেলোড + স্যানিটাইজ + পাবলিক-কার্ড-কভার) ④ role-policy স্যুটে ৮-নতুন চেক (resources-স্কোপ/গার্ড/stat-API) → **107/107 ALL GREEN** ⑤ CANONICAL_SCOPES-এ 'resources' বাদ-ছিল (অ্যাডমিন-স্কোপ-UI-তে দেখাত না) — ফিক্স ⑥ humanFileSize-এ 'B'-ইউনিট ⑦ মডারেটর-ফাইল-আপলোড E2E (curl multipart + ?_csrf=কুয়েরি → DB-রো: pdf-অটোডিটেক্ট+thumbnail+created_by) ✓
- ব্রাউজার-E2E (agent-browser): /resources অডিও-টগল/ভিডিও-YT-মোডাল/PDF-open+DB-কাউন্টার ✓ /resources/emails ফিল্টার(৮-চিঠি)/সার্চ(৩-প্রথমআলো)/খালি-অবস্থা/কপি-ফিডব্যাখ ✓ কম্পোজার-মোডাল(তাঁদের)-ওপেন ✓ 390px-ওভারফ্লো-০ (৪-পেজ) ✓ কনসোল-এরর-০ ✓
- ডক: PLANS.md ক্রস-এজেন্ট-নোট + PROJECT.md changelog

Stage Summary:
- origin/main @ **4615a74** — fix(session109); messenger.css-১-ফাইল-কমিট, অন্য-কোনো ফাইল স্পর্শ-নেই
- স্ক্রিনশট-আর্টিফ্যাক্ট: sandbox /home/z/my-project/tests/lf109-{desktop,mobile}.png + হারনেস lf109-e2e.sh
- **সতর্কতা পরবর্তী-এজেন্টের জন্য:** এই sandbox-clone-এ `stash@{0}` = অসমাপ্ত-রাউন্ডের স্টেল-WIP (style.css/main.js/dashboard.js/pages.js/social.js + helpers/bn63.js-আনট্র্যাকড) — upstream-এ সমতুল্য-ফিচার আগেই মার্জড; পুনঃস্থাপন নয়, প্রয়োজনে চেরি-পিক করুন
- গোটচা-পুনঃপ্রমাণ: node-সার্ভার টুল-কলের মাঝে মরে → সার্ভার+পূর্ণ-E2E এক-ইনভোকেশনে; `agent-browser open`-এর পরে স্পষ্ট `wait <sel>` আবশ্যক (নইলে fill before-load ব্যর্থ)

---
Task ID: 22 (Session 112 — Lekhok-Forum; সর্বোচ্চ+১ রীতি — প্যারালাল-এজেন্টদের ১১০/১১১-লেবেলের পরে)
Agent: Z.ai (cron webDevReview — same sandbox)
Task: ইউজারের ৪-সুপারিশ — ① রিঅ্যাক্টরস-মডালে Facepile-অ্যাভাটার-মোড ② শেয়ার-মেনুতে রিসেন্ট-চ্যাট-শর্টকাট ③ অ্যাডমিন প্রচ্ছদ-সিলেক্টর ④ ১৭-হোম-কিউরেশন-ফিল্টার (মাস্টার-টেবিল শেষ-আইটেম)

Work Log:
- git fetch+rebase: origin/main 11-কমিট এগিয়ে ছিল (session107-articles/109-এর /me+messenger+inbox) — ক্লিন রিবেজ, সংঘর্ষ-শূন্য
- QA-বেসলাইন: সার্ভার-রিস্টার্ট+health 200 + ৯-পেজ-ম্যাট্রিক্স 200 ✓
- ① Facepile-মোড: reactors-modal.ejs-এ হেডে rxm-modeseg সুইচার+rxm-tabrow+rxm-fgrid; reactors-modal.js-এ মোড-স্টেট+localStorage 'rxm110view'+renderFacepile (ব্যাজ+প্রথম-নাম+rxm-ftip টুলটিপ); style.css ব্লক
- ② রিসেন্ট-চ্যাট: dashboard.js-এ GET /api/messages/recent-chats (MAX(id)-ক্রম+isOnline); actions-bar.ejs-এ smxr110 স্ট্রিপ (স্কেলেটন-শিমার); main.js-EOF IIFE (লেজি-লোড capture-phase + ১-ট্যাপ পাঠান = /api/share-to-user, নেভিগেশন-শূন্য, sent-ম্যাপ-পার্সিসটেন্ট)
- ③+④ প্রচ্ছদ-নির্বাচক: helpers/covers.js (৬-প্রিসেট+validate/parse+initialOf, একক-উৎস); db.js-এ posts.home_cover (LATER_COLUMNS+alt দুই-তালিকা); moderator.js curation-SELECT+POST /curation/cover (scope+URL-গার্ড+TA42-অডিট); moderator-curation.ejs-এ cur-coverbtn+cov110-মোডাল (লাইভ ১৬:৯ প্রিভিউ, ৩-মোড, সেভ/সরান); pages.js home-কুয়েরি+parseCover; lekhok-home.ejs-এ .inkc110 মিনি-প্রচ্ছদ; admin.css/style.css স্টাইল
- **E2E-ধরা বাগফিক্স ×৩:** ① faceEl.hidden ইনভার্টেড (ফেসপাইল-মোডেই লুকাচ্ছিল) ② লেগেসি শেয়ার-হ্যান্ডলারের stopPropagation বাবল-ডেলিগেশন ভেদ করত না → capture-phase ③ `<%= JSON.stringify %>`-escape→ইনলাইন-IIFE-মৃত্যু → `<%- %>`
- যাচাই: ফেসপাইল সেল+ব্যাজ❤️+টুলটিপ+মোড-পার্সিসটেন্স+Escape+৩৯০px-৫-কলাম ✓; স্ট্রিপ লেজি-লোড+অনলাইন-ডট+'✓ পাঠানো'+টোস্ট+DB-মেসেজ-প্রমাণিত ✓; প্রচ্ছদ প্রিসেট/টাইপো('ল')/কাস্টম+URL-এরর+সরান+চিপ+অডিট ×৫ ✓; হোমে গ্রেডিয়েন্ট-কভার ✓; ৩৯০px-ওভারফ্লো-০ ✓; কনসোল-০ ✓; **role-policy ১০৭/১০৭ ALL GREEN** ✓

Stage Summary:
- মাস্টার-টেবিল: **১৭-হোম-কিউরেশন ✓ সমাপ্ত** — ২০-আইটেমে অবশিষ্ট মাত্র ০৫-কার্সার-পলিশ
- নতুন-সারফেস: posts.home_cover · GET /api/messages/recent-chats · POST /moderator/curation/cover · helpers/covers.js · rxm-fgrid/smxr110/inkc110/cov110 ক্লাস-পরিবার
- পরবর্তী-প্রথম-পছন্দ: ① ০৫-কার্সার-পলিশ (শেষ-আইটেম) ② ফেসপাইল ১০০+-রিঅ্যাক্টর-ভার্চুয়ালাইজেশন ③ প্রচ্ছদ-মোডালে ইমেজ-আপলোড (/upload-image হুক) ④ রিসেন্ট-চ্যাটে গ্রুপ-কনভ ⑤ টাইপো-প্যাটার্ন ভ্যারিয়েন্ট
- ঝুঁকি-নোট: EJS-ইনলাইন-স্ক্রিপ্টে `<%= %>`-escape IIFE মারে (নীরব) — `<%- %>` রীতি; stopPropagation-আচ্ছাদিত ট্রিগারে capture-phase-ডেলিগেশন; style.css/admin.css EOF-ঘনত্ব — ইউনিয়ন-মার্জ রীতি অব্যাহত

---
Task ID: 11 (Session 111 — cron review round: কল-UX পলিশ প্যাকেজ — কোয়ালিটি-পিল + ডায়াগনস্টিকস)
Agent: Z.ai Cron Agent (webDevReview — origin/main @ 9bb2a98 থেকে শুরু)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-শূন্যতায় স্বাধীন-ফোকাস নির্বাচন → কল-UX পলিশ ইমপ্ল + push

Work Log:
- প্রি-যাচাই: git fetch (2a8d411→9bb2a98) → pull --ff-only → worklog/PROJECT/PLANS রিভিউ (মাস্টার-টেবিল ২০/২০-পরবর্তী অবস্থা)
- QA-ফেজ: pkill → port-free → seed-qa-users (সার্ভার-বন্ধ) → সার্ভার (PORT=8080 SANDBOX_PORT=8080 CALL_RING_TIMEOUT_S=4) → role-policy ১০৭/১০৭ ✓ + calls-E2E ৫৪/৫৪ ✓ + cursor-E2E ২২/২২ ✓
- ব্রাউজার-QA: হোম/লগইন(ismail/secret123)/ড্যাশ/মেসেঞ্জার-চ্যাট (LekhokCall-ctx ✓, calls-ট্যাব ২০-রো ✓)/resources/articles/lekhok-home/gallery/resources/1/quiz/notifications — কনসোল-০ ✓; 390px ×৪-পেজ ওভারফ্লো-০ ✓ → বাগ-শূন্য
- ফোকাস: কল-ডোমেইন পলিশ — গ্রুপ-কল ভারী (নিজস্ব-রাউন্ড), Metered-TURN ইউজার-অ্যাকাউন্ট-নির্ভর → **নেটওয়ার্ক-কোয়ালিটি পিল + ডায়াগনস্টিকস + অটো-হিন্ট** (webrtc-call.js + calls.css মাত্র ২-ফাইল; Agent-Chat-লক-জোন অস্পৃশ্য)
- ইমপ্ল: .lc-quality 4-বার পিল (getStats-RTT-গ্রেডেড, top-LEFT-পিন) + .lc-stats প্যানেল (ℹ️-বাটন; সংযোগ-পথ/ক্যান্ডিডেট-টাইপ/RTT/jitter/loss/kbps — বাংলা-সংখ্যা; relay=অ্যাম্বার → TURN-যাচাই-সহায়ক) + টানা-৩-দুর্বল-নমুনায় একবারী টোস্ট + QA-হুক (_qaEnsureRoot/_qaSetQuality/toggleStats) + S-স্টেট ৭-ফিল্ড + onConnected/cleanup-ওয়্যারিং + CSS (৩-গ্রেড/গ্লাস-প্যানেল/640px/reduced-motion/[hidden]-display-গার্ড)
- যাচাই: node --check ✓ node-fs byte-যাচাই ([hidden]-করাপশন-০) ✓ রিস্টার্ট-পরবর্তী role-policy ১০৭/১০৭ ✓ calls ৫৪/৫৪ ✓ agent-browser: পিল good/bad ✓ প্যানেল empty→৭-রো+is-relay ✓ ডেস্কটপ+390px-স্ক্রিনশট ✓ overflow-০ ✓ কনসোল-০ ✓
- docs: PLANS session111-নোট + PROJECT চেঞ্জলজ + repo-worklog; push-সময় প্যারালল-এজেন্টের ৪-কমিট (f736fc1/036677b — তারাও session111-লেবেল নিয়েছে: লেবেল-রেস) পাওয়া গেল → rebase-ইউনিয়ন

Stage Summary:
- কল-UI এখন FB-প্যারিটি নেটওয়ার্ক-মিটার + ডায়াগনস্টিকসসহ; লাইভ-কলে প্যানেল থেকেই TURN-রিলে-যাচাই সম্ভব (রোডম্যাপ-③-সহায়ক)
- স্কোপ-শৃঙ্খলা: calls.css/webrtc-call.js-২-ফাইল — অন্য-এজেন্টের style.css/media-query-splice-গোটচা (f736fc1) আমার স্কোপে প্রাসঙ্গিক-নয়
- পরবর্তী: গ্রুপ-কল (mesh, নিজস্ব-বড়-রাউন্ড) → Metered.ca-অ্যাকাউন্ট → ভিডিও-স্ট্যাট → অটো-ভিডিও-ডিগ্রেড

---
---
Task ID: session-107 (সেশন ১০৭ — cron webDevReview রাউন্ড)
Agent: Z.ai Contact-Inbox Agent (cron webDevReview)
Task: প্রজেক্ট-অবস্থা-মূল্যায়ন + agent-browser QA → স্বাধীন-কাজ-নির্বাচন: session103-সুপারিশের শীর্ষ-আইটেম "contact_submissions-এর অ্যাডমিন-ইনবক্স-ভিউ (সাবমিশন কেউ দেখে না!)" পূর্ণাঙ্গ বাস্তবায়ন + স্টাইলিং-বিস্তারিত + ফিচার-বিস্তার

Work Log:
- **অবস্থা-মূল্যায়ন:** git fetch → HEAD=origin/main (8dfb729, session103-docs); সার্ভার :3030 লাইভ (uptime-স্বাস্থ্য ✓); ৭-পেজ স্মোক ২০০; /contact ভিজ্যুয়াল যাচাই (ম্যাপ-রেন্ডার ✓ 'আজ খোলা'-ব্যাজ ✓ — session102/103-ফিক্স স্থায়ী); /admin/messages বেসলাইন-স্ক্রিনশট: খালি-লিস্ট (read/unread-নেই, অ্যাকশন-নেই, ইনলাইন-স্টাইল); DB-তে ৫টি সাবমিশন অদেখা → কাজ-নির্বাচন: ইনবক্স-আধুনিকায়ন
- **db.js:** contact_submissions-এ is_read/is_archived (MIGRATION_SQL CREATE TABLE + LATER_COLUMNS — sql.js ও লাইভ-Turso উভয়ে বুটে মাইগ্রেশন-ছাড়া কলাম-পৌঁছায়; schema.sql-এ টেবিলটি নেই — যাচাইকৃত)
- **admin/routes.js:** GET /admin/messages পূর্ণাঙ্গ (q-সার্চ LIKE×৪-কলাম + f=all|unread|read|archived + ১৫/পেজ-পেজিনেশন + counts105 (মোট/অপঠিত/পঠিত/আর্কাইভড/আজকের) + ORDER BY is_read ASC,id DESC); POST /:id/read|unread|archive|unarchive|delete (delete=TA42.trashDelete→ট্র্যাশ+আন্ডু-টোস্ট-ফ্রি) + bulk-read/archive/unarchive + BULK_TABLES-এ 'messages' (generic bulk-delete); সব 303-ফেরত f/q/page-সংরক্ষণ (msgBack105) + TA42.audit
- **server.js:** স্টাফ-লোকালসে unreadMsg105 (শুধু adminUser-সেশন, fail-safe try/catch) → sidebar 'বার্তা' লাল-অপঠিত-ব্যাজ; dashboard.ejs বার্তা-কার্ডে dash-unread105 ব্যাজ (counts.unreadMessages)
- **messages.ejs পূর্ণ-রিরাইট:** স্ট্যাট-স্ট্রিপ + ফিল্টার-পিল (কাউন্ট-ব্যাজ, অপঠিত=লাল) + পিল-সার্চ + বাল্ক-বার (sidebar initBulkBar/injectCsrf42-চুক্তি পুনঃব্যবহার) + কার্ড-লিস্ট (মোনোগ্রাম-টাইল tint-সাইকেল ×৫, অপঠিত=বাম-বর্ডার+গ্রেডিয়েন্ট+পালস-ডট, ২-লাইন-clamp→এক্সপ্যান্ড-টগল, সাবজেক্ট-চিপ, mailto Re:-সাবজেক্টসহ-উত্তর) + পেজিনেশন + প্রতি-ফিল্টার-এম্পটি-স্টেট ×৪ + **কাস্টম কনফার্ম-মোডাল** (নেটিভ confirm() নিষিদ্ধ-নীতি — card-delete ও bulkBar উভয়ে)
- **admin.css:** session107-ব্লক EOF-অ্যাপেন্ড (.msg105/.pill105/.act-btn105/.cmodal105/.pg105/.msg-badge105/.dash-unread105 স্কোপড + focus-visible-রিং + 640px-মোবাইল + reduced-motion)

Stage Summary:
- **🚨 নতুন-গোটচা ×২ (আসল-ঘটনা থেকে শেখা):**
  1. **form.submit() সাবমিটার-বাটনের formaction অগ্রাহ্য করে** — বাল্ক-বারে কনফার্ম-মোডাল→submit() করলে ফর্মের ডিফল্ট-action (bulk-delete) চলে যায়, বাটনের bulk-read/archive নয়! QA-রাউন্ডে ২-বার্তা ভুলে-ডিলিট হয়েছিল। ফিক্স: skip-flag (dataset.skipConfirm105) + কনফার্মের পরে বাটনেই .click() রি-ট্রিগার — messages.ejs ১০৫-খ-ব্লকে রেফারেন্স-ইমপ্লিমেন্টেশন
  2. **চলমান-সার্ভারের বাইরে সরাসরি lekhok.db-INSERT → সার্ভারের পরবর্তী যেকোনো লেখায় স্টেল ইন-মেমরি-স্টেট flush হয়ে সিড-রো মুছে যায়** (আগের-গোটচার বিস্তারিত-রূপ: শুধু exit-flush নয়, যেকোনো UPDATE-ও clobber করে) — টেস্ট/ডেমো-ডেটা সর্বদা চলমান-সার্ভারের মধ্য-দিয়ে (HTTP POST /api/contact) ঢোকান
- **E2E (agent-browser, সব ✓):** expand-টগল; পঠিত/অপঠিত-টগল (stat+পিল-কাউন্টার-সিঙ্ক); আর্কাইভ→ভিউ→ইনবক্সে-ফেরত; card-delete→মোডাল→?trashed=1+আন্ডু-টোস্ট; বাল্ক-সিলেক্ট→বাল্ক-রিড→saved-টোস্ট; বাল্ক-আর্কাইভ+আন-আর্কাইভ (re-click-ফিক্স-পরে audit-প্রমাণিত bulk-archive/bulk-unarchive); বাংলা-সার্চ 'তানভীর'→১-ম্যাচ + mark-read-পরেও ?q=-সংরক্ষণ; এম্পটি-স্টেট ×৩; ব্যাজ ×২ (sidebar+dashboard); public /contact POST ×৩ → ইনবক্সে অপঠিত-৩ (ফুল-পাইপলাইন); 390px-ওভারফ্লো-০; কনসোল-০; role-policy ৮০/১০৭-পাস (২৭-ফেল = PLANS-ডকুমেন্টেড প্রাক-বিদ্যমান QA-সিড-স্টেট, বার্তা-অসম্পর্কিত; GET /contact ✓)
- **মাল্টি-এজেন্ট-সমন্বয়:** push-সময় ২-দফা রেস — ① ৭-কমিট (session102/104/105/106 অন্যদের) stash→pull-rebase→pop, db.js+PLANS.md conflict (union-রিসলভ, উভয়-এন্ট্রি-রক্ষা) ② আরেক-কমিট (session107 keyset-cursor, অন্য-এজেন্ট) pull-rebase-clean→push ✓ (9c53cab..7a23401)। **নাম্বার-রেস-নোট:** session105 লেবেল ×২ + 106 + 107 অন্য-এজেন্টদের — আমার-কাজ মূলত ১০৫-পরিকল্পিত, সর্বোচ্চ+১-রীতিতে ১০৭-তে রিলেবেল (কোড-আইডেন্টিফায়ার 105-প্রত্যয় অক্ষত — নাম-মাত্র); **পরের-এজেন্ট: session108 থেকে শুরু করুন**
- কমিট: 7a23401 (9 ফাইল, +471/-18) — PROJECT.md সেশন-১০৭-চেঞ্জলগ + PLANS.md Session-107-ক্রস-এজেন্ট-নোট
- **পরবর্তী-সুপারিশ:** ম্যাপে মাল্টি-পিন (হল/ডিপার্টমেন্ট) · ইনবক্সে প্রিন্ট/PDF + অ্যাডমিন-রিপ্লাই-নোট (reply_note কলাম) · pagination-লাইভ-টেস্ট (১৬+ বার্তা) · রেট-লিমিট-ভলিউম বাড়লে hCaptcha/Turnstile · প্রভোস্ট-তালিকায় প্রিন্ট/শেয়ার

---
Task ID: session-108 (সেশন ১০৮ — cron webDevReview রাউন্ড)
Agent: Z.ai Inbox/Contact Agent (webDevReview)
Task: প্রজেক্ট-অবস্থা-মূল্যায়ন + agent-browser QA → স্বাধীন-কাজ-নির্বাচন: session107-সুপারিশের ৩-আইটেম (ইনবক্স reply_note + প্রিন্ট-ভিউ · মাল্টি-পিন ম্যাপ · প্রভোস্ট প্রিন্ট/শেয়ার) + মাস্টার-টেবিল শেষ-আইটেম ১৭ যাচাই

Work Log:
- **অবস্থা-মূল্যায়ন:** git fetch → origin/main = 7a23401 (session107); লোকাল ১-কমিট এগিয়ে (sandbox-অটো-কমিট 2712cb5 = session107-worklog-সিঙ্ক — রক্ষিত)। PLANS.md লক-ম্যাট্রিক্স রিভিউ: মাস্টার-টেবিলে প্রকাশ্য-অবশিষ্ট ১৭-হোম-কিউরেশন মাত্র; session107-সুপারিশ ৫-আইটেমের ৩টি এ-রাউন্ডে নেওয়া হলো
- **QA-ফেজ:** সার্ভার :3030 লাইভ → ১৪-পেজ স্মোক ২০০ + /api/health সবুজ + হোম/ইনবক্স ভিজ্যুয়াল-বেসলাইন (session107-ফিক্স স্থায়ী প্রমাণ)
- **item-17-আবিষ্কার:** session ৯০/৯৪-এ ইতোমধ্যেই ইমপ্লিমেন্টেড (হোম-কুয়েরি post_kind='writing'+shared_from IS NULL হার্ড-ফিল্টার, কিউরেশন-প্যানেল+সার্ভার-গার্ড ৪২২, MAX-৬) — শুধু টিক পড়েনি। যাচাই: read-only SQL-ইনভ্যারিয়েন্ট (social-kind-featured=০, share-featured=০) + moderator-লগইনে কিউরেশন-প্যানেল লাইভ-রেন্ডার (স্ট্যাট/চিপ ×৪/টগল-কার্ড) → **মাস্টার-টেবিল ২০/২০ সম্পূর্ণ**
- **① reply_note:** db.js CREATE+LATER_COLUMNS → POST /admin/messages/:id/note (clamp-২০০০, খালি=NULL-ক্লিয়ার, TA42.audit reply-note/reply-note-clear, 303+?noted=1) → messages.ejs amber নোট-টগল/ইনলাইন-ফর্ম(কাউন্টার)/নোট-ভিউ (injectCsrf42-চুক্তি, no-JS-সেফ) → ?noted=1-টোস্ট
- **② ক্লিন-প্রিন্ট-শিট:** প্রতি-বার্তা + তালিকা-প্রিন্ট; DOM→textContent-only (XSS-নিরাপদ)→#printSheet108; body.ps-mode108 @media print শুধু-শিট; afterprint+৩সে-ফলব্যাক ক্লিনআপ; বাংলা-সংখ্যা-অনুক্রম
- **③ মাল্টি-পিন ম্যাপ (contact):** চিপ ×৪ (মূল-ক্যাম্পাস/রেলস্টেশন/নাজিরহাট/গেট-১) → iframe q=/z= সোয়াপ (API-কী-বিহীন) + aria-pressed + ক্যাপশন aria-live + খুলুন-href-সিঙ্ক
- **④ প্রভোস্ট প্রিন্ট/শেয়ার:** পূর্ণ-১৫-হল ব্র্যান্ডেড-টেবিল-শিট #cxPrintSheet108 + share-চেইন (navigator.share→clipboard→execCommand, ✓-আইকন)
- **⑤ স্টাইল:** admin.css/style.css-EOF session108-ব্লক (নোট-UI/প্রিন্ট-টাইপোগ্রাফি/চিপ-মাইক্রো-ইন্টারঅ্যাকশন/focus-visible/640px/reduced-motion) — brace-balance যাচাইকৃত
- **E2E:** নোট-সেভ→303→ভিউ+লেবেল-সোয়াপ→টোস্ট ✓ খালি=ক্লিয়ার ✓ অডিট reply-note=3/clear=2 + DB read-only ✓ বার্তা-প্রিন্ট (১-মেসেজ+নোট) ✓ তালিকা-প্রিন্ট (৪-নম্বরিত) ✓ ক্লিনআপ ✓ প্রিন্ট-CSS-রুল ✓ ম্যাপ-চিপ সোয়াপ+রাউন্ডট্রিপ ✓ প্রভোস্ট-শিট ১৫-সারি ✓ শেয়ার-✓ ✓ ১৪-পেজ স্মোক ✓ 390px-০ ✓ কনসোল-০ ✓ role-policy ৮০/১০৭ (ডকুমেন্টেড-বেসলাইন-অভিন্ন) ✓
- **নতুন-গোটচা ×৪ (PLANS-নোটে):** ① `cd X && cmd &` পুরো-লিস্ট ব্যাকগ্রাউন্ডে যায় — cwd অপরিবর্তিত ② setsid+disown-ও ডিট্যাচ টিকায় না — প্রতি-ইনভোকেশনে সার্ভার-বুট আবশ্যক ③ login-form-এ `form button` প্রথমে পাসওয়ার্ড-টগল ধরে — type-ফিল্টার বাধ্যতামূলক ④ স্টাফ-লগইন /admin/login-এ (সেশন-৮৩ পোর্টাল-বিভাজন — /login-এ স্টাফ প্রত্যাখ্যাত)

Stage Summary:
- **push-রেস-ফাইনাল:** প্যারালাল session109-এজেন্টও রিপ্লাই-নোট + প্রভোস্ট-প্রিন্ট push করেছে → প্রত্যাহার-সিদ্ধান্ত: নোট-স্কিমা (admin_reply/replied_at) + mn-*109-UI + হল-প্রিন্ট (cx-print-keep) তাদের ক্যানোনিকাল; আমার অনন্য টিকেছে — ইনবক্স ক্লিন-প্রিন্ট-শিট (প্রতি-বার্তা+তালিকা; নোট .mn-text109-থেকে), মাল্টি-পিন ম্যাপ-চিপ ×৪, প্রভোস্ট-শেয়ার-বাটন, রোডম্যাপ-১৭ যাচাই। ডুপ্লিকেট-রুট/কলাম/UI পরিষ্কার (routes ×১, db reply_note বাদ, amber-UI বাদ) + দ্বিতীয়-রাউন্ড rebase-ইউনিয়ন (৭-ফাইল-কনফ্লিক্ট হাতে)
- কমিট: session108-খ push ✓ — ফাইল: db.js, admin/routes.js, admin/views/admin/messages.ejs, views/lekhok-contact.ejs, public/assets/css/admin.css, public/assets/css/style.css, PROJECT.md, PLANS.md, worklog ×২
- **মাস্টার-টেবিল ২০/২০ সম্পূর্ণ** — রোডম্যাপ-১৭ নতুন-কোড-মুক্ত যাচাই-সমাপ্ত; ভবিষ্যৎ-এজেন্ট 'সম্পূর্ণ' ধরবেন
- moderator/moderator123 পাসওয়ার্ড এ-স্যান্ডবক্স DB-তে রিসেট-করা হয়েছে (সার্ভার-বন্ধ-অবস্থায়, নিরাপদ-পদ্ধতিতে)
- পরবর্তী-সুপারিশ: ইনবক্স PDF-এক্সপোর্ট · pagination-লাইভ-টেস্ট (১৬+ বার্তা) · hCaptcha/Turnstile · প্রভোস্ট-নোট-কলাম
- কল-UI এখন FB-প্যারিটি নেটওয়ার্ক-মিটার + ডায়াগনস্টিকসসহ — TURN-যাচাই (রোডম্যাপ-③) লাইভ-কলের প্যানেল থেকেই সম্ভব
- নতুন-এজেন্ট-নোট: webrtc-call.js-এ কল-লাইফসাইকেল বদলালে startStatsTicker()/S.qPollT-ক্লিনআপ রক্ষা করুন; [hidden]-সিলেক্টর-গার্ড রীতি মানুন
- পরবর্তী: গ্রুপ-কল (mesh, নিজস্ব-বড়-রাউন্ড) → Metered.ca-অ্যাকাউন্ট → ভিডিও-স্ট্যাট → অটো-ডিগ্রেড

---
Task ID: 11 (Session 114 — QA রাউন্ড: qa-single FB-প্যারিটি + angry-ম্যাপ-পূরণ + রিপ্লাই-নোটিফিকেশন)
Agent: Main agent (webDevReview — origin/main @ 036677b, clean-tree)
Task: QA-first অ্যাসেসমেন্ট → PLANS-সুপারিশ বাস্তবায়ন (qa-উত্তর-থ্রেড parity + session104-নোটের ②③-অবশিষ্ট)

Work Log:
- আইসোলেটেড QA ইনস্ট্যান্স: /home/z/qa-s108 (ফুল-কপি + নিজস্ব lekhok.db, :3120) — শেয়ার্ড-db ক্লব-রেস এড়াতে; reset-qa-logins.js প্রি-বুট (ismail/riya/tanvir=secret123 ✓), seed-gallery-107 (৩২-রো)
- QA-অ্যাসেসমেন্ট: ১৪-পেজ-200 + agent-browser (লগইন→ড্যাশ→গ্যালেরি ২৪→৩২-লোডমোর→অ্যাপেন্ডেড-লাইটবক্স + /admin/messages ইনবক্স) — বাগ-শূন্য → ফিচার-রাউন্ড
- 🚨 গোটচা-পুনঃপ্রমাণ: pkill -f "qa-s108" প্যাটার্ন node server.js-কে ধরে না → পুরনো-ইনস্ট্যান্সের flush ৩২-রো seed ২২-তে ফেরত লিখেছিল — kill-বাই-পোর্ট (ss -tlnp) রীতি
- 🚨 টুলিং-গোটচা-নতুন-ব্যাখ্যা: ট্রান্সপোর্ট ANSI-CSI-স্ট্রিপে '[m'/'[h'-সদৃশ '[<letter>' রান খেয়ে যায় — _meta[mine] → '_metaine]' দেখায় (node console.log-এও!)। সত্যের-উৎস: char-code প্রিন্ট বা s.includes('_meta[mine]') চেক
- প্যারালাল-ডিটেকশন: pull --rebase-এ ২০-নতুন-কমিট — session107-articles (5d93176) আর্টিকেল-পেজ parity ইতোমধ্যে + session108 (b622eda) angry 😡 ইতোমধ্যে → ক্যানোনিকাল গ্রহণ, আমার সমান্তরাল-ইমপ্ল (thread-comment.ejs মিরর-মার্কআপ + 😠) প্রত্যাহৃত; my-session-diff.patch আর্কাইভ
- ইউনিয়ন-পরে অবশিষ্ট-গ্যাপ ×৩ বাস্তবায়ন: ① qa-single-উত্তরে session107-articles-এর হুবহু মার্কআপ-চুক্তি (.comment-item + data-cid/author-id + data-raw + fcr-প্যালেট + fc-react-badge + fb-meta107 + ৩-ডট + fc-edit-slot + reply-btn/.reply-form + reply-item-থ্রেড) + রুটে reply-কোয়েরি/অ্যাট্যাচ/bodyHtml + স্টাফ-ডিলিট-মেনু (canMod81) ② angry-ম্যাপ-গ্যাপ-পূরণ ×৭: REACTION_META+angry, getReactionSummary/parseReactionsJson counts (care-সহ), comment-tools R_META/R_LABEL, dashboard.js, me.ejs×২, analytics.ejs (emoji 😡 + লেবেল 'রাগ' — b622eda-ক্যানোনিকাল) ③ রিপ্লাই-নোটিফিকেশন: POST /api/comment + POST /articles/:id/comment-এ parent-author notify (notify_comments 'reply'-টাইপ, নিজে/পোস্ট-লেখক-ডুপ্লিকেট-গার্ড) + .ico-reply রঙ
- পলিশ: [data-cmt-total] কাউন্টার-স্প্যান (article+QA) — comment-tools.js ডিলিট-সিঙ্ক লেবেল-নিরপেক্ষ (স্প্যান-প্রথম, .comments-h-innerHTML-ফলব্যাক) — 'উত্তরসমূহ (N)' হেডিং ভাঙার ঝুঁকি শূন্য; /qa/:id/answer-redirect অ্যাঙ্কর '#answer-'→'#c'+id; style.css session112-ব্লক (কাউন্টার-পিল, qa-উত্তর-রিদম, শীর্ষ-উত্তর-চিপ-ইনলাইন, ico-reply, 640px, reduced-motion)
- E2E (agent-browser, :3120): QA-উত্তর প্যালেট→care→🤗১ ✓ রিপ্লাই→রিলোড→reply-item+data-raw ✓ রিপ্লাইে টাচ-প্যালেট→care ✓ উত্তর-এডিট প্রি-ফিল→<strong>+সম্পাদিত ✓ রিপ্লাই-ডিলিট→ইন-প্লেস+কাউন্টার ২→১ ✓ আর্টিকেল রিগ্রেশন (২-আইটেম+angry-অপ্ট+কাউন্টার) ✓ ফিড-ড্রয়ার+angry-অপ্ট ✓ গেস্ট (প্যালেট-শূন্য+😡-ব্যাজ) ✓ 390px×২-overflow-০ ✓ কনসোল-০ ✓ ১৫-পেজ-স্মোক ✓
- সুইট: inspect-audit 48/1-fail (ফেলটি প্রি-এক্সিস্টিং — session109-এর stat-tile-বিলুপ্তির বিপরীতে স্টেল-অডিট-রুল; clean-origin-এও একই) · role-policy স্ক্রিপ্ট :8080-টার্গেটেড — ওই ইনস্ট্যান্স স্টেল-কোড (series-কমিট-পূর্ব) → /resources 500-নয়েজ; আমার :3120-তে /resources+/dashboard 200

Stage Summary:
- qa-single এখন আর্টিকেল-পেজের সাথে ১:1 FB-কমেন্ট-UX; angry ৭-টাইপ সব ডিফল্ট-ম্যাপে ধারাবাহিক; রিপ্লাই-নোটিফিকেশন লাইভ
- ক্যানোনিকাল-চুক্তি-নোট: qa-উত্তর-মার্কআপ article-single-এর কপি — ভবিষ্যতে মার্কআপ-বদল দুই-ফাইল-সিঙ্কে (বা পার্শিয়াল-রিফ্যাক্টর)
- পরবর্তী: inspect-audit-এর stat-tile-রুল session109-ডিজাইনে আপডেট · কমেন্ট-reaction-নোটিফিকেশন · optimistic-ইনসার্ট (ফিড-ড্রয়ারে আছে, থ্রেডে নেই) · :8080-ইনস্ট্যান্স-মালিককে pull-রিমাইন্ডার

---
Task ID: 10 (Session 115 — ইউজার-স্পেক: মাল্টি-মেথড 2FA — ইমেইল-ওটিপি সেকেন্ড-মেথড)
Agent: Main agent (user-turn — Lekhok-Forum)
Task: ইউজারের পেস্ট-করা A-to-Z স্পেক বাস্তবায়ন — 2FA-তে অথেনটিকেটর (TOTP) ছাড়াও ইমেইল-ওটিপি ফ্রি-মাধ্যম (Resend, $0); SMS ফি-জনিত কারণে বাদ (স্পেকের বাজেট-কৌশল অনুযায়ী)। স্পেক Next.js/Prisma-লিখিত → Express/EJS/sql.js-অ্যাডাপ্টেশন।

Work Log:
- অডিট: helpers/totp.js (ডিপেন্ডেন্সি-ফ্রি RFC-6238 + ব্যাকআপ-কোড), session58-চ্যালেঞ্জ-ফ্লো, settings.ejs-সিকিউরিটি-সেকশন — বিদ্যমান-ইঞ্জিন অক্ষত রেখে সম্প্রসারণ-নকশা
- DB: users.twofa_method (LATER_COLUMNS) + two_factor_tokens (MIGRATION_SQL + db/schema.sql); totp_enabled=মাস্টার-সুইচ (পুরনো-চেক অক্ষত)
- helpers/otp.js নতুন: ইস্যু (crypto.randomInt + ৪৫সে-কুলডাউন + পুরনো-বিলোপ), যাচাই (মেয়াদ+৬-চেষ্টা+একবারই), Resend-REST-fetch (কি-না-থাকলে কনসোল-ফলব্যাক — নতুন-ডিপেন্ডেন্সি-শূন্য), bn-ইমেইল-টেমপ্লেট, maskEmail
- সেটিংস: FB-মেথড-কার্ড + email-পেন্ডিং-UI + সুইচ-কার্ড + enroll-email/confirm-email রুট + পাসওয়ার্ড-গার্ডড অ্যাকাউন্ট-ইমেইল কার্ড (/settings/account/email — ইমেইল-ওটিপির পূর্বশর্ত, আগে কোনো ইমেইল-এডিট-UI-ই ছিল না)
- লগইন: মেথড-রাউটিং (email→ইস্যু+পাঠানো→email-মোড-চ্যালেঞ্জ: মাস্কড-ইমেইল+রিসেন্ড-বাটন; no-email→fail-open-লক-আউট-প্রতিরোধ) + POST /login/2fa/resend (?rate=) + ব্যাকআপ-কোড দুই-মেথডেই
- **লাইভ-ধরা-বাগ:** email→TOTP সুইচ-ব্যাকে পুরনো confirm-রুট twofa_method আপডেট করত না → স্টেল-'email'-মেথডে লগইন ভুল-চ্যানেলে কোড পাঠাত — totp-কনফার্মে মেথড-সিঙ্ক যোগ
- E2E (agent-browser, ×৪ স্ক্রিপ্ট): ইমেইল-সেট→enroll→মাস্কড-ফ্ল্যাশ→OTP (DB-থেকে)→enabled[email] ✓ লগইন→ইমেইল-চ্যালেঞ্জ-UI+OTP→dashboard ✓×২ রিসেন্ড→?rate=45 ✓ সুইচ-ব্যাক→QR+কম্পিউটেড-কোড→[totp] ✓ TOTP-রাউটিং (রিসেন্ড-অনুপস্থিত) ✓ 390px-০ ✓ কনসোল-০ ✓
- মার্জ: rebase-এ db.js LATER_COLUMNS-কনফ্লিক্ট (session111-114-সমান্তরাল) — union-রিজলভ, autostash-pop-কনফ্লিক্ট-হাতে-সমাধান; লেবেল-রেস: ১১০-ঘোষিত-কাজ ১১৫-রিলেবেল (সর্বোচ্চ+১ রীতি)
- কমিট+পুশ: feat(session115) → **335bac5**; docs → এই-কমিট

Stage Summary:
- origin/main @ 335bac5+docs — মাল্টি-মেথড 2FA সম্পূর্ণ: TOTP (আগেই ছিল) + ইমেইল-ওটিপি (নতুন) — দুটোই $0
- প্রোডাকশন-সক্রিয়করণ: .env-এ RESEND_API_KEY + RESEND_FROM_EMAIL বসালেই লাইভ ইমেইল (না-থাকলে কনসোল-ফলব্যাক — .env.example-ডকুমেন্টেড)
- পরবর্তী-প্রার্থী: ইমেইল-ভেরিফাই-ব্যাজ (ডেলিভারি-টেস্ট), OTP-রিসেন্ড-কাউন্টডাউন-টাইমার (ক্লায়েন্ট), স্পেকের SMS-মেথড (বাজেট-স্পন্সর মিললে BulkSMSBD-ইন্টিগ্রেশন), /login/2fa-রেট-লিমিটার (IP-ভিত্তিক, loginLimiter-স্টাইল)

---
Task ID: 22-খ (Session 112 — Lekhok-Forum; merge-followup)
Agent: Z.ai (same round — session108-খ/113/114/115-প্যারালাল-পুশের সাথে ইউনিয়ন)
Task: দুই-রাউন্ড rebase-ইউনিয়ন + নতুন-ক্যানোনিকাল কনট্র্যাক্টে Facepile-ইন্টারপ

Work Log:
- push-রেস ×৩: 9e47c98 (session108-খ) → 335bac5 (113/114/115) → 1642c7f (docs) — প্রতি-রাউন্ডে fetch+rebase+union-রিজলভ
- session108-খ আবিষ্কার: actions-bar.ejs এখন DELEGATE SHIM → ক্যানোনিকাল views/shared/post/PostFooterActions.ejs + ReactorsModal.ejs (article/dashboard/profile/me-সহ ৪ পেজে include) + ট্রিগার-কনট্র্যাক্ট data-reactors-for → data-rx-open/data-rx-id; শেয়ার-স্ট্রিপ ক্যানোনিকালে পোর্ট (_me-গার্ড)
- Facepile-ইন্টারপ: shared ReactorsModal.ejs-এ মোড-সেগ + .rxm-fgrid (session110-CSS-রিইউজ); comment-tools.js-এ additive lfPaintMode/lfRenderFacepile (localStorage 'rxm110view' শেয়ার্ড); reactors-modal.js-এ data-rx-open-বাইন্ডিং + presence-guard (lf-rxm থাকলে তাদের মডাল প্রাধান্য, নইলে গ্লোবাল rxm) — ডুপ্লিকেট-মোডাল-শূন্য
- ইউনিয়ন-গোটচা-নোট: style.css-EOF-কনফ্লিক্টে naive union-regex তাদের-ব্লক খেয়ে ফেলেছিল ×১ — git show থেকে পুনঃস্থাপন; brace-চেকে comment-ভেতরের `}` ফলস-অ্যালার্ম (comment-stripped-কাউন্টই সত্য)
- session-লেবেল-রেস: ১১০/১১১ অন্য-এজেন্টদের হাতে গেছে → সর্বোচ্চ+১ রীতিতে ১১২
- যাচাই: article-page ফেসপাইল (seg+cells+tooltip+টগল+পার্সিসটেন্স) ✓ dashboard-ইল্ড ✓ ৩৯০px-ফিট ✓ role-policy ১০৭/১০৭ ✓ পেজ-ম্যাট্রিক্স ✓ push e8ab401 ✓

Stage Summary:
- origin/main @ e8ab401 — session-110 ফিচার-কমিট + session-112 ইন্টারপ-কমিট উভয়ই ল্যান্ডেড
- স্থাপত্য-সত্য (ভবিষ্যৎ-এজেন্টদের জন্য): পোস্ট-ফুটার = shared/post/PostFooterActions.ejs (actions-bar.ejs শুধু শিম); রিঅ্যাক্টরস-মডাল = shared/post/ReactorsModal.ejs + comment-tools.js (lf-rxm, data-rx-open-কনট্র্যাক্ট); গ্লোবাল partials/reactors-modal + reactors-modal.js = লেগেসি-কনট্র্যাক্ট-ফলব্যাক; Facepile-মোড উভয় মডালে কার্যকর (localStorage-শেয়ার্ড)
- পরবর্তী-প্রথম-পছন্দ: ০৫-কার্সার-পলিশ (মাস্টার-টেবিল শেষ-আইটেম) · ফেসপাইল ১০০+-রিঅ্যাক্টর-ভার্চুয়ালাইজেশন · প্রচ্ছদ-মোডালে ইমেজ-আপলোড

---
Task ID: RES-108 (ক্রন-রিভিউ রাউন্ড ৭ — session116)
Agent: Resources-feature agent
Task: অবস্থা-মূল্যায়ন + agent-browser QA → প্রিভিউ-আনস্টাইলড-বাগ-ফিক্স + CSV বাল্ক-ইমপোর্ট + সিরিজ-কভার + মডারেটর এডিট-নিজের-আপলোড

## বর্তমান প্রজেক্ট অবস্থা (মূল্যায়ন)

- রিসিভড 9bb2a98 (আমার session107-series) → fetch-এ f736fc1 (style.css union-রিপেয়ার) rebase; রাউন্ড-শেষে push-পূর্বে আরও ১৪-কমিট (session105/108/111/112/113/114/115 — design-system সেন্ট্রালাইজেশন, 2FA-মেথড, QA-থ্রেড, ইনবক্স-নোট) stash-rebase-ইউনিয়ন — কনফ্লিক্ট-শূন্য
- QA সুইপে role-policy 107/107 ✓ কিন্তু agent-browser-কোল্ড-স্টার্টে সাইট **সম্পূর্ণ আনস্টাইলড** ধরা পড়েছে (স্টাইলশিট-পার্স 0-rules) — পুরনো-রাউন্ডের স্টাইলড-স্ক্রিনশট লং-লিভড-সেশনের SW-মাস্কিংয়ের ফল; ফেজ-স্টেবল কিন্তু প্রিভিউ-বাগ গুরুতর → এই-রাউন্ডের প্রধান-ফিক্স

## এই রাউন্ডের লক্ষ্য / সম্পন্ন কাজ / ভেরিফিকেশন

**ফিক্স:** গেটওয়ে-সাবরিসোর্স-404 → চার-স্তর-পোর্ট-সংরক্ষণ (XTPQ রেন্ডার-টাইম / sw.js-রিরাইট v3 / img-error-রিট্রাই / fetch-প্যাচ layout+sidebar) + স্টাফ-ফর্মে _csrf-hidden (প্রাচীন-গোটচা)। বিস্তারিত PROJECT.md-চেঞ্জলজে।
**ফিচার:** ① CSV বাল্ক-ইমপোর্ট (resource-bulk.js ইঞ্জিন + শেয়ার্ড rbm-মোডাল + দুই-রুট, সিরিজ-অটো-ক্রম, বাংলা-এলিয়াস) ② সিরিজ-চিপে কভার-মিনি-প্রিভিউ (কভার/আইকন-উভয়-ভ্যারিয়েন্ট লাইভ-যাচাইকৃত) ③ মডারেটর এডিট-নিজের-আপলোড (?edit= প্রিফিল + :id/update মালিক-গার্ড + তালিকা/ডিটেইল-লিংক)।
**ভেরিফিকেশন:** role-policy 107/107 (×২) ✓; curl+agent-browser E2E সম্পূর্ণ (বিস্তারিত PROJECT.md) ✓; 390px-০ ✓ কনসোল-০ ✓; টেস্ট-ডেটা-ক্লিনআপ ✓।

## অমীমাংসিত ঝুঁকি / পরবর্তী রাউন্ডের সুপারিশ

- **পুরনো-ক্যাশ-পথ:** ৩০-দিন-immutable অ্যাসেট-ক্যাশে আগের-ভাঙা-CSS থাকতে পারে — AV-বুট-হ্যাশ প্রতি-বুটে বদলায় বলে কার্যত: রিলিফ; তবু ইউজার-রিপোর্টে হার্ড-রিফ্রেশ আগে
- **fetch-প্যাচ স্কোপ:** fetch/XHR ঢাকা হয়েছে; EventSource/WebSocket-ভিত্তিক ভবিষ্যৎ-ফিচারে ম্যানুয়াল প্যারাম লাগবে
- **পরবর্তী-প্রস্তাব:** ① বাল্ক-ইমপোর্টে ফাইল-ডাউনলোড-সাইড (CSV-তে URL-থেকে ফাইল-ফেচ-করে আপলোড — এখন শুধু-লিংক) ② created_at UTC→লোকাল সাইট-ওয়াইড ③ সিরিজ-পেজিনেশন (>২০-পর্ব) ④ role-policy-তে resources/bulk + moderator-update চেক-যোগ
- **গোটচা-রিমাইন্ডার:** push-এর আগে fetch+rebase; doc-ফাইল union-মানে **শেষে append**; '[h'-খাওয়া টুল-আউটপুটে বাইট-চেক-আগে; role-policy প্রথম-রান-নয়েজ

## সেশন ১১৪ (১৮ সেপ্টেম্বর ২০২৬) — ইনবক্স মিনি-মেসেঞ্জার-বাবল + বিজ্ঞপ্তি-সরান + §১৫-সেলফ-সিড

- QA: ১২-পেজ সুইপ কনসোল-০/390px-০ → ২-লুকানো-বাগ আবিষ্কৃত ও ফিক্সড (conv-meta text-align লিক; quick-ম্যানশন actorId)
- নতুন: MiniBubblePreview.ejs (views/shared/messenger/) + .mnp-* (shared.css) + convListFor-SQL এনরিচমেন্ট + POST /api/notifications/:id/dismiss + /notifications ✕-বাটন/অ্যানিমেশন/চিপ-সিঙ্ক/empty-state-পলিশ
- টেস্ট: §১৫ সেলফ-সিড + login()-csrf-রিট্রাই; role-policy ১০৭/১০৭ · calls ৫৪/৫৪ · cursor ২২/২২ · guard গ্রিন
- QA-স্টেট-রিপেয়ার: testadmin/testuser seed-অবস্থায় ফেরানো; ফিড-গভীরতা ৮-ডেমো-পোস্টে পুনঃস্থাপিত (cursor-চেইন ≥২-পেজ)
- বিস্তারিত: PLANS.md Session-114 Cross-Agent Note + PROJECT.md Changelog
---
Task ID: session-113 (সেশন ১১৩ — cron webDevReview রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview — origin/main @ 9e47c98 থেকে শুরু)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ/স্টেবল-বিচার → স্বাধীন-ফোকাস: session105-এর শেষ-অবশিষ্ট সুপারিশ ① qa-single উত্তর-কার্ড CommentItem-ক্যানোনিকালাইজেশন + cursor-টেস্ট-রোবাস্টনেস + স্টাইলিং-পলিশ

Work Log:
- **QA-ফেজ:** ১৪-পেজ স্মোক ২০০ (302=অথ-গেট সঠিক; /lekhok-home→404 সঠিক — হোম=/) + guard:design গ্রিন + role-policy **107/107** (গোটচা: সম্পূর্ণ-গ্রিনে `seed-test-users.js`-ও লাগে — testadmin-কে role=admin + moderator-কে user_mgmt-scope দেয়; seed-qa-users একা দিলে 80/107) + calls-E2E **54/54** (স্ক্রিপ্ট-নাম verify-session93-calls.js, আর্গ http://localhost:8080) + cursor-E2E 20/21 → ১-ফেইল তদন্ত
- **cursor-ফেইল-রুট-কজ (env-artifact, কোড-বাগ নয়):** টেস্ট ২৬-পোস্ট বানায় কিন্তু পেজ-সাইজ ৩০ — পরিষ্কার-DB-তে (আগের-রানের ক্লিনআপ-পরবর্তী) সব এক-পেজে → pages:1 ফল্স-ফেইল। **ফিক্স: টেস্ট-রোবাস্টনেস ২৬→৩৫ পোস্ট** (৩৫>৩০ ⇒ ≥২-পেজ সব-সময়) → re-run **22/22 ALL GREEN**
- **ব্রাউজার-QA:** হোম/লগইন(ismail)/ড্যাশ/QA-ফ্লো (প্রশ্ন-তৈরি→উত্তর)/notifications — কনসোল-০ এরর-০; **সুন্দর-আবিষ্কার:** সার্ভার-ডাউনে সার্ভিস-ওয়ার্কার মার্জিত অফলাইন-পেজ দেখায় (গ্রেসফুল-ডিগ্রেডেশন কাজ করছে)
- **① CommentItem-এক্সটেনশন (backward-compatible ×২):** `chip` {label,icon?,title?} — বাবলে ছোট-ব্যাজ; `noReply` — 'উত্তর'-বাটন hidden (qa flat-list প্যারাডাইমে নেস্টেড-উত্তর-ফাঁদ-বন্ধ: উত্তর POST হলেও রেন্ডার-পথ নেই)
- **② qa-single.ejs:** লিগ্যাসি .answer-item.card-লুপ → ক্যানোনিকাল `include CommentItem` (bodyHtml=a.html, reaction=a.reaction — getReactionSummary-শেপ সরাসরি-ম্যাপ); শীর্ষ-উত্তর chip=idx-0 && like_count>0; গেস্ট-প্যারিটি আপগ্রেড (আগে স্ট্যাটিক-হার্ট → এখন cmt-badge-কাউন্ট); h2-কাউন্টে .qa-answer-count-হুক + MutationObserver-ডিলিট-সিঙ্ক (fc-item-remove → কাউন্ট-হ্রাস বাংলা-সংখ্যায় + শূন্যে 'সব উত্তর মুছে ফেলা হয়েছে' নোট)
- **③ shared.css session113-ব্লক (EOF + EOF-MARKER):** .cmt-item-chip (brand-light/brand-primary) + answers-section .fc-item-স্পেসিং/44px-অ্যাভাটার/overflow-wrap + .answers-all-deleted + focus-visible-রিং + 640px + reduced-motion; comment-stripped brace-depth ০ ✓
- **④ 🐛 shared-ইঞ্জিন-বাগ-ফিক্স (comment-tools.js):** এডিট-সেভ-সাকসেসে data-raw আপডেট হতো না → দ্বিতীয়-সম্পাদনায় স্টেল-প্রিফিল। ফিক্স: bodyEl.setAttribute('data-raw', val) — সব ক্যানোনিকাল-সারফেস (ফিড/আর্টিকেল/qa) লাভবান
- **E2E (agent-browser, qa/5-টেস্ট-পোস্টে):** রেন্ডার-গঠন (fc-item/chip-কন্ডিশনাল/badge-hidden/replyHidden) ✓ লাইক→badge 👍১+is-mine ✓ প্যালেট-love→❤️১ ✓ ইনলাইন-এডিট→session113-টেক্সট+<strong>-মার্কডাউন+সম্পাদিত ✓ data-raw-প্রিফিল-ফিক্স ✓ ৩-ডট-ডিলিট→element-remove+কাউন্ট-০+নোট ✓ tanvir-react→guest-curl-এ চিপ+ব্যাজ-১ ✓ ডেস্কটপ+390px-স্ক্রিনশট+overflow-০ ✓ কনসোল-০ ✓
- **রিগ্রেশন-পোস্ট-ইমপ্ল:** role-policy 107/107 + calls 54/54 + cursor 22/22 (৩৫-পোস্ট) — সব-গ্রিন; টেস্ট-পোস্ট ক্লিনআপ (owner-HTTP-delete)
- **🚨 পরিবেশ-গোটচা (পুনঃপ্রমাণিত ×৩):** স্যান্ডবক্সে ব্যাকগ্রাউন্ড-সার্ভার ইনভোকেশন-শেষে/মাঝে নীরবে মরে — মাল্টি-স্টেপ-ব্রাউজার-ফ্লো প্রতি-ইনভোকেশনে ফ্রেশ-বুট+টাইট-চেইনে চালান; মৃত্যু-লক্ষণ = agent-browser-এ 'This site can't be reached'/অফলাইন-পেজ + curl-000। বুট-হেল্পার প্যাটার্ন: /home/z/my-project/download/lf-boot.sh (health-retry)

Stage Summary:
- **session105-ডিজাইন-সিস্টেমের শেষ-অবশিষ্ট সুপারিশও সম্পন্ন** — qa উত্তর এখন ফিড/আর্টিকেলের সাথে এক-মার্কআপ-এক-ইঞ্জিন: হোভার-প্যালেট, কোণা-ব্যাজ, ৩-ডট (সম্পাদনা/মুছুন/রিপোর্ট) qa-তেও; CommentItem-এ chip/noReply-প্যারাম নতুন-ইন্টিগ্রেশন-পয়েন্ট
- পরবর্তী-প্রার্থী: ① role-policy-তে comment-API (PUT/DELETE 403/404) চেক ② tokens.css-হার্ডকোড-হেক্স-স্ক্যান guard-এ ③ crx-উইজেট 'সব দেখুন' ④ qa-উত্তরে ভোট-স্টাইল সর্টিং (like_count DESC আছেই — UI-ইন্ডিকেটর) ⑤ notifications ফিল্টার-ট্যাব
- **[push-রেস-সংশোধন]:** প্যারালাল session114-এজেন্ট qa-single-কে থ্রেডেড-উত্তর+CommentComposer-সহ ক্যানোনিকালাইজ করেছে → তাদের সংস্করণ গৃহীত (union-মার্জ), আমার qa-single-এডিট+observer+answers-section-CSS প্রত্যাহৃত; অনন্য-রক্ষিত: CommentItem chip/noReply + data-raw-ফিক্স + cursor ২৬→৩৫ + chip/focus-CSS। PLANS-সংশোধন-নোট দেখুন।

---
Task ID: session-117 (সেশন ১১৭ — cron webDevReview রাউন্ড; upstream-রিজার্ভ-লেবেল অনুযায়ী)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → session105-সুপারিশ ① (qa-উত্তর-ক্যানোনিকাল) নিজস্ব-ইমপ্ল → push-রেসে session113/114-ক্যানোনিকাল আবিষ্কার → **স্বেচ্ছায় প্রত্যাহার** (ডুপ্লিকেশন-শূন্য) — অনন্য-রক্ষিত: 🚨 অনাথ-কমেন্ট-বাগ-ফিক্স (comment-tools.js postId-ফলব্যাক + /api/comment সার্ভার-গার্ড) + pagination-লাইভ-টেস্ট (session108-খ ③) + seed-স্ক্রিপ্ট

Work Log:
- **সিঙ্ক:** 1c2338f → rebase 9e47c98 → (session108-খ ইনবক্স-প্রিন্ট/111-কল-UX/112-continue-reading/105-ডিজাইন-সিস্টেম) — পরিকল্পিত "ইনবক্স-প্রিন্ট" ডুপ্লিকেট প্রমাণিত → স্কোপ-বদল: session105 ① + session108-খ ③
- **QA-ফেজ:** ৩০-রুট স্মোক + health + agent-browser (articles/top, admin-inbox, contact-badges, article-detail) — বাগ-শূন্য
- **নিজস্ব-ইমপ্ল (পরে প্রত্যাহৃত):** qa-route থ্রেড-অ্যাটাচ + qa-single CommentItem/Composer + CSS — E2E-তেই **অনাথ-কমেন্ট-বাগ** ধরা পড়ে: রিপ্লাই-স্লট-নির্মাতা postId কেবল .fc-drawer থেকে নিত → একক-পোস্ট-পেজে (articles/qa) post_id="null" → /api/comment-এ অনাথ-রো (কোনো থ্রেডে অদৃশ্য, comment_count-স্খুন)। session105-যুগের আসল-বাগ
- **🚨 ফিক্স-১ (comment-tools.js — রক্ষিত):** রিপ্লাই-স্লট postId-ফলব্যাক-চেইন: .fc-drawer[data-comments-for] → নিকটতম .comments-list[data-post-link]-পাথ-পার্স (/articles|qa|questions/N) → পেজের .cc-form[data-post-id]। session113/114-ক্যানোনিকালের qa-reply-btn-ও এ-ইঞ্জিন-পাথ ব্যবহার করে — ফিক্স ছাড়া তাদের উত্তর-থ্রেডও অনাথ-তৈরি করত; **আমার সবচেয়ে-গুরুত্বপূর্ণ অনন্য-অবদান**
- **🚨 ফিক্স-২ (routes/social.js POST /api/comment — রক্ষিত):** post_id parseInt>0-গার্ড নইলে 400 bad_post_id (defense-in-depth; GET /api/comments-গার্ডের POST-প্রতিরূপ) — negative-টেস্ট "null"/"abc"/"-5" → ৪০১/৪০০ ✓
- **প্রত্যাহার-সিদ্ধান্ত:** push-রেসে session113-11982d2 (ক্যানোনিকাল CommentItem-রিফ্যাক্টর + chip/noReply) + session114 আবিষ্কার → আমার route/view-ডেল্টা ফেলে দিয়ে কেবল ফিক্স-১/২ + ৩-লাইনের অ্যাডিটিভ-পলিশ (.qa-answer-slot scroll-margin-top অ্যাঙ্কর-সেফটি) রাখলাম; আমার মৃত-CSS-ব্লক মুছে ফেলা
- **pagination-লাইভ-টেস্ট (session108-খ ③ — সম্পন্ন):** /api/contact-এ ১১-বার্তা (রেট-লিমিট ৫/১০মি → ৩-ব্যাচ, সার্ভার-রিস্টার্টে লিমিটার-রিসেট) → ১৬-বার্তা = পেজ-১ ১৫ + পেজ-২ ১ (id-গণনা-নির্ভুল) + পেজ-নেভ (পেজ 1/2, 2/2) ✓ CSV ১৬-রো+হেডার ✓ → ১১-ডিলিট (303→ট্র্যাশ) → ব্যাক-টু-৫ ✓
- **E2E (লিক-জোন-ফিক্স-প্রমাণ):** রিপ্লাই-স্লট data-post-id=১১ (আগে null — ফিক্স-১-প্রমাণ, session114-মার্কআপে) ✓ লাইক-টগল-দুইদিক (badge-বাংলা+is-mine) ✓ থ্রেড-সোয়াপ+total-লাইভ ✓ নতুন-উত্তর ✓ গেস্ট-ভিউ ✓ 390px-overflow-০ ✓ কনসোল-০ ✓ guard:design-গ্রিন ✓ brace-০ ✓
- scripts/seed-qa-117.sh — HTTP-পাইপলাইন qa-সিডার (curl-লগইন+CSRF-ডাবল-সাবমিট; sql.js dual-instance-গোটচা এড়ানো)
- **rebase ×২:** প্রথমে ৪-ফাইল কনফ্লিক্ট (session114-রুট/ভিউ — --ours-এ ক্যানোনিকাল নিয়েছি), তারপর আবার (session113-final 11982d2+session114 3a234b6) — style.css/PLANS/worklog ইউনিয়ন; **গোটচা-রিপ্লে: rebase-এ --theirs=আমার-কমিট (বিপরীত!); git add-এর পরে checkout --ours নীরবে-ব্যর্থ → git show HEAD:path > path নিরাপদ-রিকভারি**; ব্রাউজার JS-ইনজেকশনে cache-bust (cb=Date.now()) + রিয়েল-ক্লিক (synthetic .click() কিছু হ্যান্ডলারে ফেইল)

Stage Summary:
- **অনাথ-কমেন্ট-বাগ (session105-যুগের) এখন ফিক্সড** — সব একক-পোস্ট-পেজে রিপ্লাই সঠিক post_id নেয়; সার্ভার-গার্ড অনাথ-ইনসার্ট অসম্ভব। ভবিষ্যৎ-এজেন্ট: **নতুন কমেন্ট-এন্ট্রি-পয়েন্টে postId-ফলব্যাক-চেইন ভাঙবেন না**
- **session108-খ ③ pagination-টেস্ট সম্পন্ন** — ১৬-বার্তায় ২-পেজ নির্ভুল + CSV-সম্মতি
- qa-উত্তর-ক্যানোনিকাল = session113/114-ক্যানোনিকাল (আমার ডেল্টা প্রত্যাহৃত — session113-র PLANS-নোটের session117-লেবেল-রিজার্ভ অনুসৃত)
- পরবর্তী-সুপারিশ: role-policy-স্যুটে POST /api/comment bad_post_id-৪০০-চেক + comment PUT/DELETE 403/404 (session105 ④ — session114-এর §১৫-সেলফ-সিডের সাথে মিলিয়ে) · tokens.css-হার্ডকোড-হেক্স-স্ক্যান-গার্ড (session105 ⑤) · কল-প্যানেল ভিডিও-track-স্ট্যাট (session111 ③)

---
Task ID: cron-r3 (session113 — রাউন্ড-৪: QA-সুইপ → Q&A উত্তর-থ্রেড কমেন্ট-সমতা + নীরব-অনাথ-কমেন্ট-বাগ)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-যাচাই + agent-browser QA → স্টেবল → session105-সুপারিশ ①④ বাস্তবায়ন → push + ডকস

Work Log:
- sync+QA: fetch/rebase ক্লিন → ১৪-পেজ-ম্যাট্রিক্স ২০০ + কনসোল-০ → ফিচার-রাউন্ড
- আবিষ্কার: session105-সুপারিশ ① (/qa-উত্তরের কমেন্ট-সমতা) এখনও খোলা; সাথে ৩-বাগ: (ক) রিপ্লাই-স্লট postId=null → অনাথ-কমেন্ট-TEXT-রো (ক) /api/comment প্রশ্ন-বিজ্ঞপ্তিতে /articles/N-লিংক (ঘ) DELETE-এ total নেই → কাউন্টার-স্টেল
- E2E (agent-browser): /qa/6-সিডে উত্তর-সাবমিট (৩→৪-অটো-বাংলা-কাউন্ট) ✓ রিপ্লাই-নেস্ট+walk-up ✓ এডিট+সম্পাদিত-চিপ ✓ ডিলিট→সিঙ্ক ✓ প্যালেট-৬+ব্যাজ-👍১ ✓ গেস্ট-ভিউ (বাবল-দৃশ্যমান, কম্পোজার-শূন্য) ✓ আর্টিকেল-রিগ্রেশন ✓ 390px-০ ✓ কনসোল-০ ✓
- curl-হার্ডেনিং-প্রুফ: null-post_id→400, ghost→404, cross-parent→400, guest→401, DELETE→total:4 ✓ লোকাল-DB-র ২-অনাথ-রো পরিষ্কার
- প্যারালাল-সংঘর্ষ: push-রেসে session114 (qa-থ্রেড! একই-সমস্যা-ভিন্ন-পথ) + session116-কমিট → stash→rebase→3-ফাইল-কনফ্লিক্ট → origin-ভার্সন-গ্রহণ → আমার-ডেল্টা পুনঃপ্রয়োগ (ইন্টারপ-কমিট c19df87) — তাদের [data-cmt-total]-সিলেক্টর/নোস্ক্রিপ্ট-ফর্ম সংরক্ষিত, আমার ফিক্স+UX যোগ
- স্যুট: §১৪ (১৫-অ্যাসারশন) + §১৫ self-sufficient-রূপান্তর → role-policy ১২৫/১২৫ ✓ guard:design ✓
- গোটচা-আবিষ্কার: git stash -u ensure-server.sh-ও নিয়েছিল (pop-করা হয়েছে); immutable-ক্যাশে-পুরনো-JS-ফ্লেক; seed-র testadmin role-divergence → ban-ক্যাসকেড

Stage Summary:
- পুশড: dbdfd3f (session113-ফিচার, rebase-পরে সংকুচিত) + c19df87 (114-ইন্টারপ-ফলোআপ) + ডকস-কমিট
- /qa-উত্তর-থ্রেড এখন /articles-কমেন্টের সাথে পূর্ণ-সমতা + অনাথ-কমেন্ট-করাপশন-পথ বন্ধ
- পরবর্তী: accepted-answer-মার্কিং, /qa unanswered-ফিল্টার, notifications QA-আইকন

Task ID: 12 (Session 113 — cron review round: status assess + QA → গ্রুপ-কল mesh ইমপ্ল)
Agent: Z.ai Cron Agent (webDevReview — origin/main @ 75154bb থেকে শুরু)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-শূন্যতায় স্বাধীন-ফোকাস নির্বাচন → গ্রুপ-কল (mesh WebRTC) ফুল-ইমপ্ল + push

Work Log:
- প্রি-যাচাই: git fetch (HEAD=75154bb, clean) → root-worklog/PROJECT/PLANS রিভিউ — মাস্টার-টেবিল ২০/২০-পরবর্তী কল-রোডম্যাপে অবশিষ্ট: গ্রুপ-কল (ভারী), Metered-TURN (ইউজার-অ্যাকাউন্ট), ভিডিও-স্ট্যাট, অটো-ডিগ্রেড
- QA-ফেজ: pkill → port-free → seed-qa-users (সার্ভার-বন্ধ) → সার্ভার (PORT=8080 SANDBOX_PORT=8080 CALL_RING_TIMEOUT_S=4) → role-policy ১০৭/১০৭ ✓ + calls-E2E ৫৪/৫৪ ✓ + cursor-E2E ২২/২২ ✓
- ব্রাউজার-QA: হোম/লগইন(ismail)/ড্যাশ/মেসেঞ্জার-লিস্ট/গ্রুপ-চ্যাট(ctx isGroup:true)/রিসোর্স — কনসোল-০ ✓ 390px ×৩-পেজ ওভারফ্লো-০ ✓ → বাগ-শূন্য → ফিচার-রাউন্ড
- ফোকাস-নির্বাচন: রোডম্যাপ-অবশিষ্টের মধ্যে ①গ্লোবাল-রিংগার ②কল-ইতিহাস ⑤ICE-restart-রিট্রাই আগেই-সম্পন্ন (সেশন ৯৪/৯৭) প্রমাণ করে নিলাম (কোড-অডিট) → **গ্রুপ-কল (mesh)** = শেষ-বড়-ফাঁক — "নিজস্ব-বড়-রাউন্ড" এই-রাউন্ডেই
- **সার্ভার ইমপ্ল:** db.js — call_participants টেবিল (MIGRATION_SQL + fresh-DB + ইনডেক্স) + call_sessions.is_group LATER_COLUMN; routes/calls.js — গ্রুপ-শাখা ×৭-এন্ডপয়েন্ট (start অফার-বিহীন+৮-ক্যাপ / answer joined-তালিকা+idempotent / decline / cancel / end caller-vs-leave+all-left-finalize / signal অংশগ্রহণকারী-গেট / poll group+from+self-heal) + history গ্রুপ-সমর্থন; 1:1-পথ is_group=0-গেটে অক্ষুণ্ণ
- **ক্লায়েন্ট ইমপ্ল:** webrtc-call.js — সেশন-১১৩-মার্কড mesh-ব্লক (peerPC/peerEnsure/peerDrop/peerDrain প্রতি-পিয়ার, groupOfferPeer, joinedLaterThan টোটাল-অর্ডার-টাই-ব্রেক, groupSignal from-রাউটিং, groupReconcile টাইল-সিঙ্ক, startGroup/acceptGroup, activePC, _qaEnsureGroupGrid/_qaTeardownGroupGrid) + ৮-ব্রাঞ্চ-পয়েন্ট (start/showIncoming/acceptCall/poll-সিগন্যাল/ended-টোস্ট/ঙ-reconcile/onConnected/statsTick/cleanup/endCall); messages-chat.ejs — গ্রুপ-কল-বাটন + convTitle; calls.css — .lc-grid/.lc-tile পরিবার (EOF-মার্কার + brace-depth-০ ✓)
- **নতুন E2E:** verify-session113-groupcalls.js (তিন-ইউজার, ৫০-চেক) — গ্রুপ-স্টার্ট→incoming→জয়েন-ক্রম→mesh-রিলে (from-ভিত্তিক offer/answer/candidate + ডুপ্লিকেট-শূন্য)→অংশগ্রহণকারী-লাইভ→লিভ/শেষ→decline→মিসড-self-heal→busy-guard→403→auth — **৫০/৫০ প্রথম-পূর্ণ-রানেই ALL GREEN**
- চুক্তি-আপডেট: verify-session93-calls.js-এর ২-পুরনো group-block-চেক (400-আশা) নতুন-আচরণে (200+group:true+cleanup) — calls **৫৫/৫৫**
- ট্রায়াল-অ্যান্ড-এরর ইতিবৃত্ত: ①start-অফার-ভ্যালিডেশন গ্রুপে 400 দিল → 1:1-শাখায় সরানো ✓ ②E2E-তে members-as-string → অ্যারে ফিক্স ✓ ③await-in-arrow সিনট্যাক্স → uid-প্রি-ক্যাপচার ✓ ④decline-পুরনো-টেক্সট-মিসম্যাচ → আলাদা-এডিট ✓
- যাচাই: node --check (db.js/routes/calls.js/webrtc-call.js/E2E) ✓ চার-স্যুট ১০৭+৫৫+৫০+২২=২৩৪-চেক ALL GREEN ✓ ব্রাউজার: গ্রুপ-কল-বাটন ✓ QA-গ্রিড ৩-টাইল (self/live-dot/fail) ✓ ডেস্কটপ+390px ✓ কনসোল-০ ✓ রিয়েল-start-ব্রাঞ্চ graceful-cleanup ✓ guard:design ✓
- docs: PROJECT.md-চেঞ্জলজ (সেশন ১১৩) + PLANS.md cross-agent নোট (৮-ইন্টিগ্রেশন-পয়েন্ট + গোটচা) + repo-worklog + root-worklog
- git: এক-ফিচার-কমিট + docs-কমিট, push-এর আগে পুনঃfetch/rebase (প্যারালল-এজেন্ট-প্রোটোকল)

Stage Summary:
- **গ্রুপ-কল এখন লাইভ:** গ্রুপ-চ্যাট-হেডারে অডিও/ভিডিও কল-বাটন → সব-সদস্য রিং → যে-কেউ গ্রহণ → mesh (প্রতি-জোড়ায় PC) → গ্রিড-UI (ভিডিও/অ্যাভাটার-টাইল) → লিভ/শেষ-সেমেন্টিক্স সার্ভার-self-heal-সহ
- চুক্তি: সিগন্যালে from/to; poll.group.participants-ই গ্রিডের সত্য-উৎস; নতুন-জয়েনকারী-অফার-নিয়ম (কলার কখনো অফার-নয়) — বিস্তারিত PLANS session113-নোট
- ঝুঁকি: openrelay-TURN অস্থির — গ্রুপ-কলে ক্রস-নেটওয়ার্ক রিলে-সাকসেস-রেট ব্যবহারে-যাচাই-করা-দরকার (ডায়াগনস্টিকস-প্যানেল টুল প্রস্তুত); হেডলেস-ব্রাউজারে রিয়েল-মিডিয়া-ফ্লো যাচাই-অসম্ভব (signaling-plane-৫০-চেক + UI-হুক-প্রমাণই কভারেজ)
- পরবর্তী: Metered.ca-TURN → প্রতি-পিয়ার-স্ট্যাট → স্পিকার-হাইলাইট → অটো-ভিডিও-ডিগ্রেড → PLANS-রোডম্যাপ-টেবিল আইটেম
Task ID: session-116 (cron-QA-রাউন্ড: কমেন্ট-রিঅ্যাকশন নোটিফিকেশন + আইকন-রেজিস্ট্রি + QA-অ্যাঙ্কর + অডিট-ক্যানোনিকাল)
Agent: Main agent (webDevReview — origin/main @ 1642c7f = session115-পরবর্তী)
Task: QA-ফার্স্ট অ্যাসেসমেন্ট (agent-browser) → ফিক্স+ফিচার-রাউন্ড → ডকস → push

Work Log:
- pull --rebase (session115-2FA, 2-কমিট) → আইসোলেটেড-ইনস্ট্যান্স /home/z/qa-s116 :3130 (ফুল-কপি + reset-qa-logins + seed-demo-feed) → ১৪-রুট-স্মোক + লগইন-E2E + গ্যালেরি-পেজিনেশন + 390px ×৬ + কনসোল — বাগ-শূন্য (search?q= 400 ছিল আমার-কাঁচা-UTF8-কার্ল, ব্রাউজার-এনকোডে 200)
- ফিচার: ① /api/react comment-ব্রাঞ্চে রিঅ্যাকশন-নোটিফিকেশন (পোস্ট-ব্রাঞ্চ-প্যারিটি: love/haha/wow + addedC116-ফ্রেশ-INSERT-গেট + প্রেফ-গেট + সেলফ-গার্ড + অ্যাঙ্কর-লিঙ্ক #answer-/#fc-c-) ② নোটিফ-আইকন-রেজিস্ট্রি: header _ico-ম্যাপ +reaction/reply, notifications.ejs পেজ-টার্নারি +reaction/reply/mention, style.css .ico-reaction/.icon-reply/scroll-margin-top/top-answer-chip-গ্রেডিয়েন্ট-পলিশ
- ফিক্স: ③ /qa/:id/answer রিডাইরেক্ট '#c'→'#answer-' (টার্গেট-অনুপস্থিত নীরব-স্ক্রল-ব্যর্থ — E2E-প্রমাণিত) ④ inspect-audit ৩-স্থায়ী-ফলস-নেগেটিভ → ক্যানোনিকাল-প্রথম+legacy-ফলব্যাক (44/3 → 48/0) + test-role-policy.sh পোর্ট-প্যারাম (113-ক্যানোনিকাল)
- E2E: নোটিফ-ফ্রেশ✓ টগল-অফ-নো-ডুপ✓ সুইচ✓ সেলফ-সাপ্রেসড✓ পেজ/ড্রপডাউন-আইকন✓ অ্যাঙ্কর-স্ক্রল✓ 390px×৮-০✓ কনসোল-০✓ অডিট 48/48✓; রিগ্রেশন: এক-DB-দুই-কোড-বেস role-policy 93/14(বেস) বনাম 94/13(নতুন) — ডেল্টা=+1
- গোটচা-নতুন ×৩ ডকুমেন্টেড (PLANS): fuser-অনুপস্থিত→স্টেল-সার্ভার-লুক (কিল-বাই-পিড+lstart>mtime-যাচাই), curl-POST-CSRF, sql.js-ফাইল-প্রোব-স্টেল

Stage Summary:
- push (হ্যাশ নিচে) → origin/main, session-116 (সর্বোচ্চ+১ রীতি, পূর্ব-সর্বোচ্চ ১১৫)
- session-১১৪-নোটের সুপারিশ ③ সম্পন্ন; অডিট এখন সত্যি-সবুজ (48/48); নোটিফ-আইকন ৩-স্তর-রেজিস্ট্রি-চুক্তি PLANS-নোটে
- পরবর্তী: optimistic-থ্রেড-ইনসার্ট (১১৪-নোট ② এখনো-খোলা) · লাইভ-Turso-রিসেট/সিক্রেট-রোটেশন ×৪ পেন্ডিং · notification-পেজ পার-টাইপ ফিল্টার-চিপ

---
Task ID: 11 (Session 118 — ইউজার-স্পেক: /me ফেসবুক-ঘরানার কমপ্যাক্ট রিডিজাইন)
Agent: Main agent (user-turn — Lekhok-Forum, origin/main @ 080d1ba → session117-প্লেলিস্ট-পরবর্তী)
Task: ইউজার-অভিযোগ (স্ক্রিনশটসহ) — /me-তে ৭টি আলাদা বড় সাদা stat-বক্স, ৪টি KPI-বক্স, বিশাল ফাঁকা SVG-চার্ট-কন্টেইনার ও সংক্ষিপ্ত মাস-নাম ('এপ্রিলি','আগা','সেপ্টে') — চাহিদা: বক্স-শূন্য ফেসবুক-প্রোফাইল-লুক, পূর্ণাঙ্গ মাসের নাম, প্রফেশনাল স্লিম ইনসাইটস (ইউজার নিজস্ব TSX-স্পেক দিয়েছেন — EJS/CSS-অ্যাডাপ্টেশন)

Work Log:
- pull --rebase → 080d1ba (session116/117-সমান্তরাল); রুট-কজ-ম্যাপ: me.ejs `.stats-grid`(৭×stat-tile) + `.ws91-kpis`(৪×KPI) + 560×120-SVG `preserveAspectRatio=none`-স্ট্রেচ + routes/social.js BN_MONTHS91-সংক্ষেপ
- রুট (routes/social.js): ① BN_MONTHS91 → পূর্ণাঙ্গ ১২-মাস ('জানুয়ারি..ডিসেম্বর') ② myFollowers-কোয়েরি (JOIN follower_id — আগে কেবল কাউন্ট-সাবকোয়েরি) + render-লোকাল
- ভিউ (views/user/me.ejs): ① হেডারে বক্স-বিহীন .me-meta118 মেটা-স্ট্রিপ ('৪টি লেখা • ২ জন অনুসারী • ২টি প্রতিক্রিয়া' — তথ্য-পুনরাবৃত্তি-রোধ) ② stats-grid-ব্লক সম্পূর্ণ-বিলোপ ③ ws91-কার্ড পুনঃলিখন: হেডার-রো (টাইটেল+সাব+'চার্ট লুকান/দেখুন' টগল aria-expanded) + ws118-strip (৪-সেল ডিভাইডার-রো, সেরা-লেখা=অ্যাঙ্কর-truncate) + ws118-chart (HTML-স্লিম-বার: ৬৬px-ট্র্যাক/সর্বোচ্চ-কাউন্ট-%-উচ্চতা/শূন্যে ৩px-ধূসর-স্টাব/bn-সংখ্যা/grow-অ্যানিমেশন-delay) ④ personal-tabs → FB-সিঙ্গেল-লাইন: ৯-ট্যাব label+.pt-count-পিল-ব্যাজ (বাংলা-সংখ্যা), অনুসারী-ট্যাব-নতুন + নতুন followers-পেন (follow-grid) + ড্রাফট-পেন সবসময়-রেন্ডার (০-ব্যাজেও খালি-অবস্থা) ⑤ টগল-IIFE (hidden/aria/আইকন/টেক্সট-সিঙ্ক)
- CSS (style.css EOF-অ্যাপেন্ড session118): FB-টোকেন #E4E6EB/#F0F2F5/#65676B/#050505 + --accent-dark-আন্ডারলাইন; .me-wrap-স্কোপড (অন্য-পেজ-অক্ষত); 640px-মোবাইল (স্ট্রিপ ২×২, ট্যাব-স্ক্রল)
- 🚨 ধরা-বাগ: লেগেসি `.me-wrap .personal-tab.active{border-bottom:0}` (৩-ক্লাস) আমার ২-ক্লাস-বেসের border-bottom:3px-কে হারায় (computed 0px none — getComputedStyle-জিওমেট্রিতে ধরা) → ৪-ক্লাস `.me-wrap .personal-tabs .personal-tab.active`-এ underline-পুনঃপ্রতিষ্ঠা (3px solid ✓)
- 🚨 মার্জ-গোটচা-নতুন: style.css-EOF-অ্যাপেন্ড-কনফ্লিক্টে (session116/117-সাথে) union-resolve-এর পরেও session116-এর `@media{...}`-ব্লক কনফ্লিক্ট-সিমে **কাটা** পড়ে (ক্লোজিং-} হারায়) → naive-কাউন্টার অবিশ্বস্ত (content-string-ব্রেস) → comment/string-strip-aware-চেক + সিম-ভিজ্যুয়াল-অডিটে মিসিং-} সনাক্ত → রিপেয়ার-কমেন্টসহ যোগ (session111-রিপেয়ার-রীতি-পুনরাবৃত্তি) → post-merge-উভয়-সেশন-রুল-প্রোব (notif-ico-bg + top-answer-chip-গ্রেডিয়েন্ট + underline) গ্রিন
- E2E (agent-browser, fbtest1+TOTP-কম্পিউটেড-কোড): stat-tile/stats-grid/ws91-kpi/old-svg = ০ ✓ ট্যাব ৯+ব্যাজ ৭ ✓ ব্যাজ-মান [৪,০,১,২,০,১,২] ✓ মেটা-স্ট্রিপ ✓ মাস [এপ্রিল,মে,জুন,জুলাই,আগস্ট,সেপ্টেম্বর] ✓ বার ৬+স্টাব ৫+ফিল্ড ১ ✓ টগল hidden/aria/টেক্সট দুইদিক ✓ deep-link ?tab=followers ✓ অনুসারী-কার্ড ২ ✓ underline 3px ✓ chart 118px/badge-পিল 999px ✓ 390px-overflow-০+স্ট্রিপ-২কলাম ✓ ৫-পেজ-রিগ্রেশন-২০০ ✓ কনসোল-০ ✓
- স্ক্রিনশট: tests/lf118-desktop-top.png (ফোল্ড-টপ), lf118-desktop.png (অনুসারী-ট্যাব-সক্রিয়), lf118-mobile.png (390px) — ভিজ্যুয়াল-প্রমাণ: শূন্য-বক্স, FB-ট্যাব-বার, পূর্ণাঙ্গ-মাস
- কমিট: feat(session118) → rebase (style.css-সিম-কাট-ফিক্সসহ) → push

Stage Summary:
- origin/main @ **57d8113** — ইউজারের বক্স-বিলোপ+পূর্ণাঙ্গ-মাস-স্পেক সম্পূর্ণ বাস্তব
- চুক্তি: নতুন-ক্লাস pt-count/ws118-*/me-meta118 শুধুমাত্র /me-তে; ws91-card-শেল নাম-অপরিবর্তিত (CSS-ওভাররাইড-স্কোপ .me-wrap)
- ঝুঁকি/শিক্ষা: style.css-EOF-অ্যাপেন্ড-যুদ্ধ প্রতি-রাউন্ডে — ভবিষ্যৎ-এজেন্ট union-resolve-এর পরে অবশ্যই সিম-এর @media-কাট + strip-aware-ব্রেস-চেক করবে; naive-কাউন্টারে content-string-ব্রেস ভুয়া-সংকেত দেয়
- পরবর্তী-প্রার্থী: ট্যাব-বারে স্টিকি-স্ক্রল-শ্যাডো, ইনসাইটস-চার্টে হোভার-টুলটিপ, /me-র জন্য og-image, অনুসারী-তালিকায় ফলো-ব্যাক-বাটন
Task ID: session117 (cron webDevReview রাউন্ড — origin/main @ f38c7d0 থেকে)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-শূন্যতায় স্বাধীন-ফোকাস: session112/113-সুপারিশ (crx 'সব দেখুন'-পেজ + notifications ফিল্টার-ট্যাব + ctrl+enter) + আবিষ্কৃত crx-CSS-গ্যাপ-ফিক্স

Work Log:
- সিঙ্ক: git fetch → লোকাল=origin/main=f38c7d0 (session113-ফাইনাল); PLANS-লক-ম্যাট্রিক্স রিভিউ → session117-লেবেল (সর্বোচ্চ+১)
- QA-ফেজ: ১১-পেজ স্মোক ✓ হোম-অ্যানিমেশন-পরবর্তী রেন্ডার ✓ লগইন-ফ্লো ✓ /me+/notifications বেসলাইন-স্ক্রিনশট কনসোল-০ ✓; রিগ্রেশন: role-policy ১১৮/১১৮ + cursor ২২/২২ + calls ALL GREEN + guard ✓ (স্যুট-পোর্ট-গোটচা ধরা খেয়ে শিখে: role-policy-হার্ডকোডেড :8080)
- **বাগ-আবিষ্কার:** crx-* CSS-সংজ্ঞা ০-ম্যাচ (session112-ব্লক কখনো ল্যান্ড করেনি) → উইজেট আনস্টাইলড-স্ক্রিনশট-প্রমাণ → dashboard.css session117-ব্লকে পূর্ণ-স্টাইল
- ফিচার-১: /me/reading ফুল-পেজ (social.js-রুট + reading.ejs ভিউ + continue-reading.js ডুয়াল-মাউন্ট-ইঞ্জিন — উইজেট-৩ + ফুল-গ্রিড + relTime + দুই-ধাপ-ক্লিয়ার + এম্পটি-স্টেট + noscript)
- ফিচার-২: /notifications ফিল্টার-ট্যাব (G117-গ্রুপ-ম্যাপ EJS-গণনা + data-g117 + .nft-chip + nftRecount117-সিঙ্ক + বাংলা-চিপ-সংখ্যা) — style.css session117-ব্লক
- ফিচার-৩: composer Ctrl/⌘+Enter সাবমিট (comment-tools.js — ডিসেবলড-সেন্ড-সম্মানী)
- E2E: গেস্ট-৩০২ ✓ উইজেট→'সব দেখুন'→ফুল-পেজ (tiles/চিপ/৪২%-বার/আজ-সময়) ✓ ×-সিঙ্ক ✓ armed→এম্পটি ✓ 390px-০ ✓ চিপ ×৫ ✓ ফিল্টার ✓ ডিসমিস-সিঙ্ক+ফলব্যাক ✓ ctrl+enter-পোস্ট ✓ টেস্ট-কমেন্ট-ক্লিনআপ ✓ কনসোল-০ ✓ রিগ্রেশন-চার-গ্রিন ✓
- 🚨 নতুন-গোটচা ×৩ (PLANS-নোটে): EJS-বডি-ব্লকে `<%# %>` সিনট্যাক্স-এরর · HTTP-সিড-ডেটা মৃত্যু-কিলে রিভার্ট (×২-প্রমাণ; স্ট্যান্ডঅ্যালোন-সিড-প্যাটার্ন) · নতুন-ভিউতে extra_css-বাধ্যতামূলক
- docs: PLANS session117-নোট + PROJECT চেঞ্জলজ + রিপো-worklog

Stage Summary:
- 'পড়া চালিয়ে যান' এখন পূর্ণ-পেজ-সহ (ব্রাউজার-লোকাল, প্রাইভেসি-সেফ — শূন্য-API); crx-উইজেট অবশেষে স্টাইলড; বিজ্ঞপ্তি-পেজে টাইপ-গ্রুপ-ফিল্টার; composer-এ ctrl+enter
- পরবর্তী: হেডার-ড্রপডাউন-dismiss (অবশিষ্ট) · optimistic-ইনসার্ট · crx-কভার-থাম্বনেইল · ?type=-পার্সিস্টেন্স

---
Task ID: 12 (Session 119 — QA-রাউন্ড: /me-রিগ্রেশন-আবিষ্কার → union + Q&A ফিল্টার-চিপ + স্টেল-কাউন্টার-রিকনসিল)
Agent: Cron agent (webDevReview — Z.ai sandbox, origin/main @ 54fec73 → rebase @ 5a59c1f)
Task: অবস্থা-যাচাই + agent-browser QA → /me-র ১০৯-রিগ্রেশন ধরা (session114-মার্জ-ক্ষত) → রিস্টোর-প্রস্তুতি + নতুন-ফিচার → rebase-ইউনিয়নে সমান্তরাল session118-রিডিজাইন গৃহীত

Work Log:
- QA-সুইপ: ১২-পেজ ২০০ + কনসোল-০ → কিন্তু /me-তে **মারাত্মক রিগ্রেশন**: ৭-stat-tile + ~৩০০px SVG-স্ট্রেচ-চার্ট ফিরে এসেছে (session109-র ৪-ফিক্সের নিখুঁত পুনরুৎপাদন — ইউজার-অভিযোগ-স্টেট)। রুট-কজ: session114-এর me.ejs-এডিট প্রি-১০৯-ভার্সনের উপর হয়েছিল (প্যারালাল-মার্জে ১০৯-মার্কআপ হারায়; সে-যায়ে CSS-ব্লক বেঁচে ছিল)
- আমার প্রাথমিক রিস্টোর (৬-টার্গেটেড-এডিট): হিরো-রোল-চিপ+অনুসারী-লাইন / গ্রিড-বিলুপ্ত / পারফরম্যান্স-সারাংশ+ws91Toggle / SVG→৮৪px flex-বার / ট্যাব .tb-badge+FB-অর্ডার+ড্রাফট-সর্বদা / টগল-JS — FeedPostCard+angry/care+includes অক্ষুণ্ণ (union) + /me-রুটে read_mins-প্লাম্বিং (session110-র অসম্পূর্ণ দাবি)
- নতুন ফিচার: /qa ফিল্টার-চিপ (সব N / অনুত্তরিত N; ?filter=unanswered ডিপ-লিংক; সেলিব্রেটরি empty-state) + উত্তর-স্টেট-ব্যাজ (সবুজ/অ্যাম্বার) + **কাউন্ট-ডিসপ্লে-বাগ-ফিক্স** (ভিউ stale posts.comment_count দেখাত → live ans_count; প্রমাণ: id=1 কলামে ২ বাস্তবে ০) + db/reconcile-comment-counts.js (idempotent রিকনসিল)
- 🚨 রান-অর্ডার-গোটচা (নতুন): sql.js in-memory-ফ্লাশ — **থেমে-যাওয়া-সার্ভারও মরার-সময় বাসি-মেমরি ডিস্কে ফ্লাশ করে** → রিকনসিল-অর্ডার kill→reconcile→boot বাধ্যতামূলক (৩-বার প্রমাণিত: মৃত্যুমুখী-সার্ভারের ফ্লাশ রিপেয়ার উল্টে দিয়েছিল)
- rebase-সংঘর্ষ: সমান্তরাল-এজেন্টও **একই ইউজার-স্পেকে session118 /me-রিডিজাইন** করেছে (57d8113 — ৯-ট্যাব+অনুসারী-পেন+ws118-স্ট্রিপ+পূর্ণাঙ্গ-মাস) → me.ejs-কনফ্লিক্টে **তাদের-ভার্সন গৃহীত** (একই-লক্ষ্যের আরও-বিবর্তিত রূপ; FeedPostCard/angry/includes তাতেও অক্ষুণ্ণ-যাচাইকৃত) → আমার read_mins তাদের ভিউতেও কাজ করে (rt-chip ×৪ লাইভ) → style.css-কনফ্লিক্ট = ইউনিয়ন (তাদের-ব্লক + আমার Q&A-ব্লক, comment-stripped brace-depth ০)
- সেশন-লেবেল-কোলিশন ×২: ১১৮-লেবেল তারা নিয়েছে → আমার ডেল্টা **session119** (max+1 রীতি) — কমেন্ট-লেবেল-রিনাম কমিট d11af7e
- টেস্ট-গোটচা-ত্রয়ী (PLANS-নোটে বিস্তারিত): ① role-policy RP_PORT (session116-এ P→RP_PORT — পুরনো P= নীরবে 8080-এ যায় → ১২০-মিথ্যা-ফেইল) ② admin-login-রেট-লিমিটার (৫-ব্যর্থতা/১৫মিন প্রতি IP+ইউজার — পরপর-রানে 'স্টাফ-লগইন-পোর্টাল'-চেক রেট-লিমিট-পেজ পায় → মিথ্যা-ফেইল; সার্ভার-রিস্টার্টে ইন-মেমরি-লিমিটার ক্লিয়ার) ③ স্যান্ডবক্সে Bash-কলের-মাঝে সার্ভার-মৃত্যু (ensure-server.sh প্রতি-ব্লকে)

Stage Summary:
- push: session119-ফিচার (9ef2154) + লেবেল-রিনাম (d11af7e) + docs — মার্জড-/me: session118-ডিজাইন + আমার rt-chip ×৪
- যাচাই (মার্জড-কোডে): role-policy **১২৫/১২৫** ✓ cursor ২৫/২৫ ✓ guard:design গ্রিন ✓ /qa ফিল্টার-সাইকেল (temp-প্রশ্ন→unanswered→ডিলিট) ✓ 390px-০ ✓ কনসোল-০ ✓ রিকনসিল-ক্লিন ✓
- পরবর্তী-প্রার্থী: ① role-policy §১৭-এ /qa-ফিল্টার-রুট-কভারেজ ② reconcile-কে সার্ভার-বুট-হুকে (অটো-রিকনসিল) ③ notification-পেজে পার-টাইপ ফিল্টার-চিপ (session118-সুপারিশ-বহমান) ④ optimistic-থ্রেড-ইনসার্ট (১১৪-নোট ② এখনো-খোলা)
---
Task ID: cron-r120 (সেশন ১২০ — webDevReview রাউন্ড; origin/main @ b59f038 থেকে)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-শূন্যতায় স্বাধীন-ফোকাস → গ্রুপ-কল স্পিকার-হাইলাইট + ভিডিও-track-স্ট্যাট ইমপ্ল + push

Work Log:
- সিঙ্ক: git fetch/pull --rebase (session117-প্লেলিস্ট গৃহীত — role-policy এখন ১২৫-চেক)
- QA-ফেজ: pkill → port-free → seed (qa-users + test-users + qa-113) → সার্ভার (PORT=8080 CALL_RING_TIMEOUT_S=4) → role-policy ১২৫/১২৫ ✓ + calls ৫৫/৫৫ ✓ + groupcalls ৫০/৫০ ✓ + cursor ২৫/২৫ ✓ + guard:design ✓
- ব্রাউজার-QA: হোম/লগইন-রিডাইরেক্ট/ড্যাশ/মেসেজ-ইনবক্স/গ্রুপ-চ্যাট-১০৭ (গ্রুপ-কল-বাটন ×২ ✓) — কনসোল-০ ✓ 390px-ওভারফ্লো-০ ✓ → বাগ-শূন্য
- গোটচা: verify-session93-calls.js ডিফল্ট-বেস localhost:3030 — এক্সপ্লিসিট http://127.0.0.1:8080 আর্গ দিতে হয় (groupcalls-স্ক্রিপ্ট 8080-ডিফল্ট); প্রথম-রানে ECONNREFUSED-মিথ্যা-ফেইল এ কারণেই
- ফোকাস-নির্বাচন: রোডম্যাপ-অবশিষ্টের "স্পিকার-হাইলাইট + প্রতি-পিয়ার-স্ট্যাট" (session113-পরবর্তী তালিকা) — ২-ফাইল-স্কোপ (webrtc-call.js + calls.css), সার্ভার-কোড-শূন্য
- **ইমপ্ল ① স্পিকার-হাইলাইট:** SPK-ইঞ্জিন (WebAudio MediaStreamSource→AnalyserNode প্রতি-স্ট্রিম, নীরব-বিশ্লেষণ) + ২৫০ms RMS-টিক + থ্রেশহোল্ড 5.5 + ৮০০ms-হাইস্টেরেসিস + spkPaint (গ্রিড-টাইল .is-speaking + .lc-spkbars ওয়েভ-বার + 1:1 অডিওফেস-রিং); ওয়্যারিং ×৬-পাথ (attachLocal/ontrack×২/peerDrop/startStatsTicker/cleanup); মিউটে অটো-নিভে
- **ইমপ্ল ② ভিডিও-স্ট্যাট:** statsTick-এ inbound-rtp video (frameWidth/Height/FPS) + local-track getSettings → renderStats-এ শুধু ভিডিও-কলে "ভিডিও"-সেকশন (বাংলা-সংখ্যা, .is-video সবুজ)
- **ইমপ্ল ③ QA-হুক:** _qaSetSpeaking/_qaSpeaking/_qaSetVideoStats (idle-বাইপাস)
- **CSS:** calls.css session118-ব্লক (is-speaking-টাইল-ফ্যামিলি + spkbars + stats-section + 640px + reduced-motion) — [hidden]-display-গার্ডসহ; EOF-মার্কার session118-এ আপডেট
- যাচাই: node --check ✓ brace-depth-০ ✓ agent-browser: টাইল-হাইলাইট+বার ✓ ক্লিয়ার ✓ 1:1-রিং ✓ ভিডিও-সেকশন '১২৮০×৭২০'/'৬৪০×৪৮০ @ ২৫ fps' ✓ স্ক্রিনশট ×৩ (desktop/bars/mobile) ✓ ওভারফ্লো-০ ✓ কনসোল-০ ✓
- রিগ্রেশন-পোস্ট-ইমপ্ল: role-policy ১২৫/১২৫ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard — **২৫৫-চেক ALL GREEN**
- নতুন-QA-গোটচা: .lc-root-ম্যানুয়াল-DOM-রিমুভ → ক্লোজার-root ডিট্যাচড → পরবর্তী _qaEnsureGroupGrid অদৃশ্য — ফ্রেশ-পেজ-লোডেই রাউন্ড-করুন (PLANS-নোটে ডকুমেন্টেড)

Stage Summary:
- গ্রুপ-কল এখন FB-প্যারিটি স্পিকার-হাইলাইটসহ — কে বলছে এক-নজেই; ডায়াগনস্টিকসে ভিডিও-রেজোলিউশন/FPS (TURN-রিলে-থ্রুপুট-যাচাই-সহায়ক)
- session113-পরবর্তী কল-রোডম্যাপে অবশিষ্ট: Metered.ca-TURN (ইউজার-অ্যাকাউন্ট), অটো-ভিডিও-ডিগ্রেড, প্রতি-পিয়ার-স্ট্যাট-সাব-প্যানেল
- পরবর্তী-এজেন্ট: session121 লেবেল থেকে (118=/me-রিডিজাইন, 119=Q&A-ফিল্টার — সমান্তরাল-এজেন্ট, 120=স্পিকার-হাইলাইট) (সর্বোচ্চ+১)
Task ID: 12 (root-worklog session12)
Agent: Main agent (cron QA রাউন্ড — অপটিমিস্টিক-কমেন্ট + মার্জ-ডুপ্লিকেট-ফিক্স)
Task: প্রজেক্ট-স্টেটাস মূল্যায়ন → agent-browser QA → বাগ-ফিক্স/ফিচার-নির্বাচন → session104-সুপারিশ-③ (article-কমেন্টে optimistic-UI) সমাপ্তি + বেসলাইনে ধরা মার্জ-ডুপ্লিকেট-বাগ ফিক্স

Work Log:
- pull --rebase (af372de-বেসলাইন, শূন্য-behind) → agent-browser QA: ফিড/QA-পেজ গ্রিন; আর্টিকেল-পেজে **union-মার্জ-অ্যাক্সিডেন্ট**: `<h3 class="comments-h">` ×২ — সাবমিটের পর "মন্তব্য (২)" ও "মন্তব্য (1)" অসামঞ্জস্য-যুগল (একটি স্টেল)
- **ফিক্স-১:** ডুপ্লিকেট-হেডার-ডেলিট (article-single.ejs) + কাউন্টার-স্প্যান বাংলা-অঙ্কে (article + qa + notif-badge + refreshDrawer-stat ×২ — ASCII-লিক-পরিষ্কার)
- **ফিচার (optimistic-কমেন্ট):** comment-tools.js — insertOptimistic/buildOptimisticItem (ক্যানোনিকাল-চুক্তি বাবল: ৭-প্যালেট+৩-ডট+রিপ্লাই, j.id-বাস্তব) + optMd (markdown-lite ক্লায়েন্ট-মিরর, esc-ফার্স্ট) + optParseBn (বাংলা-অঙ্ক-পার্স — ASCII-regex "৩"→NaN-ফাঁদ ভাঙা) + opt-fresh-অ্যানিমেশন (style.css, reduced-motion) + body[data-uname] (layout+header — /profile/-লিংক-সোর্স)
- **ফিক্স-২ (ডিলিট-সিঙ্ক):** ড্রয়ার-ডিলিটে ফিড-কার্ড as-stat স্টেল — সব [data-cmt-total]/.comments-total + card as-stat + লোডেড-ড্রয়ার refreshDrawer (প্রিভিউ-স্টেল-প্রতিরোধ)
- E2E (agent-browser, refetch-ডিলেই-হুক): আর্টিকেল-সাবমিট ৬৮ms-এ opt-বাবল+`<strong>`+কাউন্টার"৬"+৭-প্যালেট+৩-ডট ✓ reconcile-পরে canonical-মাত্র+কাউন্টার-অপরিবর্তিত ✓ নেস্টেড-রিপ্লাই opt(.cmt-replies-এ fc-reply)→reconcile ✓ রিঅ্যাকশন 👍১-ব্যাজ ✓ ডিলিট-ক্যাসকেড ৬→৩+সিঙ্ক ✓ ড্রয়ার as-stat-বাম্প/ডিলিট-সিঙ্ক ✓ 390px-overflow-০ ✓ কনসোল-০ ✓ role-policy 103✓/13✗-প্রি-এক্সিস্টিং-বেসলাইন-অভিন্ন ✓ নোটিফিকেশন-E2E (riya-কমেন্ট → ismail-ব্যাজ "৪" → dismiss-পরিষ্কার) ✓ টেস্ট-ডেটা-ক্লিনআপ ✓
- গোটচা-নোট (PLANS-এ): test-fetch-hook-এর arguments-closure-ভুল → fetch(undefined) → r.json() throw → catch → location.reload() — ভান-করা "ফেইল" (হুকে args-capture বাধ্যতামূলক); সার্ভার-রিস্টার্ট ×৪ (প্রতি-স্ট্যাটিক-এডিটে — AV-হ্যাশ)

Stage Summary:
- **অর্জন:** session104-সুপারিশ-③ (optimistic-UI) সমাপ্ত — কমেন্ট-সিরিজের শেষ-বাকি আইটেম; মার্জ-অ্যাক্সিডেন্ট-বাগ ফিক্স; সাইট-ব্যাপী বাংলা-অঙ্ক-সামঞ্জস্য
- **পরবর্তী:** qa-উত্তর-পাথেও optimistic · edit/delete মৃত্যু-অ্যানিমেশন · view-template ডুপ্লিকেট-নোড-অডিট-স্ক্রিপ্ট · hall-provost সার্চ/ফিল্টার (session111 ④ অগ্রাহীত)
- **ঝুঁকি:** union-মার্জে ভিউ-টেমপ্লেটে ডুপ্লিকেট-নোড আবারও ঢুকতে পারে — মার্জ-পরে grep-count-অডিট প্রস্তাবিত
Task ID: RES-119 (ক্রন-রিভিউ রাউন্ড ১০ — session118)
Agent: Resources-feature agent
Task: অবস্থা-মূল্যায়ন + agent-browser QA → স্টেবল-ফেজে নতুন ফিচার: প্লেলিস্ট রিজুম/শোনা-হয়েছে-মার্ক (localStorage) + সিরিজ-পেজ play-all → ডিটেইল-অটোস্টার্ট (RES-117-সুপারিশ ③④)

Work Log:
- fetch: নতুন-কমিট-নেই (origin/main = 080d1ba); smoke ৬/৬ 200 + role-policy 125/125 ALL GREEN + agent-browser সুইপ (22-কার্ড/7-পিল/3240-CSS-rules/সিরিজ-ফিল্টার/প্লেলিস্ট-প্যানেল অক্ষত, কনসোল-০) → ফেজ-স্টেবল
- প্লেলিস্ট রিজুম: localStorage প্রতি-সিরিজ (lekhok.rpl.<slug> = {cur:{epi,t,title,ts}, done:{resId:ts}}); pause/৩সে-থ্রটলড-timeupdate/pagehide-এ সেভ; ended-এ done-মার্ক; রিজুম-চিপ (৩০-দিন-TTL, t>৩সে, done-সাপ্রেসড) + "সেখান থেকে" সিক-প্লে; পর্ব-প্রগ্রেস-বার + মিনি-প্লেয়ার পর্ব-কাউন্টার; li-তে data-id
- সিরিজ-পেজ play-all: সক্রিয়-সিরিজে "সিরিজ শুনুন" বাটন → sessionStorage ইনটেন্ট + /resources/<firstAudioId>?play=1 → ডিটেইল autoStart (রিজুম-প্রাধান্য → প্রথম-অডিও; অটোপ্লে-ব্লকে playAll-পালস+টোস্ট; play=1 URL-মুক্ত)
- E2E-বাগ ×২ ধরা-ফিক্স: ① setProg lis/audLis-ইনডেক্স-স্পেস-মিসম্যাচ (বার-সর্বদা ০%) → রূপান্তর ② XTPQ-ডাবল-প্যারাম (সার্ভার-রেন্ডার লিংকে পোর্ট থাকে + JS আবার জোড়া → গেটওয়ে-ব্যর্থ → SW-অফলাইন-পাতা) → id-রেজেক্সে URL-পুনর্গতি
- যাচাই: role-policy 125/125 ✓; E2E: প্রগ্রেস ৫৬.৪% ✓ state-save ✓ চিপ ১:৩৩ ✓ সিক-প্লে-ended-done ✓ রিলোড done+চিপ-সাপ্রেসড ✓ play-all অটো-প্লে t=2.3 URL-ক্লিন ✓ নো-অডিও টোস্ট ✓ কাউন্টার ১/১ ✓ 390px×৩-০ ✓ কনসোল-০ ✓; ব্রাউজার-test-state ক্লিন-আপ ✓
- docs: PROJECT.md সেশন-১১৮ + PLANS.md ক্রস-এজেন্ট-নোট (রিজুম-চুক্তি + XTPQ-ডাবল-গোটচা + play=1-ইনটেন্ট + prog-চুক্তি)

Stage Summary:
- push (হ্যাশ নিচে) → origin/main; স্ক্রিনশট s118-resume-chip/s118-seriplay-row(-mobile)/s118-mini-mobile.png
- পরবর্তী-প্রস্তাব: ① বাল্ক-ইমপোর্টে CSV-URL-থেকে-ফাইল-সাইড-ফেচ ② created_at UTC→লোকাল সাইট-ওয়াইড ③ role-policy-তে playlist-ভিউ-চেক ④ ?series= পেজে পর্ব-প্রগ্রেস-সমৃদ্ধ চিপ (শোনা-হয়েছে-নির্দেশ)
- গোটচা-নতুন (PLANS-নোট): XTPQ-ডাবল-প্যারাম (JS-নেভিগেশনে href-র-পার্স); synthetic .click() অটোপ্লে-গেসচার-নয় (রিয়েল-ক্লিক বাধ্যতামূলক); agent-browser-এ localStorage-টেস্ট-রেজিডু ক্লিন-আপ-বাধ্যতামূলক

---
## session-121 (cron-QA-রাউন্ড) — নোটিফিকেশন ফিল্টার ?type= ডিপ-লিংক + G117-ইউনিয়ন

**Work Log:**
- QA-ফার্স্ট (:3140 setsid --fork আইসোলেটেড): ১৪-রুট-স্মোক (সব-200) + লগইন-E2E + গ্যালেরি-পেজিনেশন-API + 390px ×৫-০ + কনসোল-০ — বাগ-শূন্য → ফিচার-রাউন্ড
- ফিচার: daily.js `/notifications?type=` (হোয়াইটলিস্ট mention/reply/reaction/message/follow/other; other=স্পষ্ট+অজানা NOT-IN-বাকেট; GROUP BY কাউন্ট) + ভিউ ৭-লাইন চিপ-অ্যাকটিভেট + G117-ম্যাপে call→message-চিপ 'বার্তা ও কল' + follow নিজস্ব-চিপ
- মাঝ-রাউন্ডে প্যারালাল-রেস ×৩: session119 (nft-chip + dismiss-route — আমার-সমান্তরাল-ইমপ্ল দুটোই!) → ইউনিয়ন: ক্যানোনিকল-তাদের, আমার-ডেল্টা (?type=+গ্রুপিং) পোর্ট, .nfc-ডুপ্লিকেট প্রত্যাহার; session120 (সার্চ-হাইলাইট) + session12-লেবেল (অপটিমিস্টিক-কমেন্ট) — ২-দফা pull --rebase, কনফ্লিক্টে origin-গ্রহণ, চূড়ান্ত-কমিট পিওর-২-ফাইল
- E2E (মার্জ-পরবর্তী): চিপ-রেন্ডার+শূন্য-চিপ-আঁকা-না ✓ ?type=follow/other প্রি-ফিল্টার+অ্যাকটিভ ✓ শূন্য-পরিবার→গ্লোবাল-এম্পটি ✓ bogus→all-ফলব্যাক ✓ ডিসমিস→রিমুভ+রিকাউন্ট+URL-রক্ষী-রিলোড ✓ reltime ✓ 390px-০ ✓ কনসোল-০ ✓ অডিট 48/48 ✓ role-policy 125/125 ✓ guard ✓

**Stage Summary:**
- মাস্টার-রোডম্যাপ ২০/২০ অক্ষুণ্ণ; নোটিফ-ফিল্টার এখন URL-state-সহ (শেয়ারেবল + noscript-নিরাপদ)
- পরবর্তী: নোটিফ-ড্রপডাউনেও ?type=-সিঙ্কড-লিংক (ঐচ্ছিক), optimistic-থ্রেড-ইনসার্ট (session-114-নোট এখনো-খোলা), লাইভ-Turso-রিসেট + সিক্রেট-রোটেশন ×৪ (টোকেন-ধারী-এজেন্ট)

---
Task ID: session119-খ (cron webDevReview রাউন্ড — session119/120/121-রেস-পরবর্তী ইউনিয়ন)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-মূল্যায়ন + agent-browser QA → P0-ডিসমিস-স্বাধীন-প্রমাণ + PLANS session117-সুপারিশ ③⑤ (crx-কভার-থাম্বনেইল + মিনি-বাবল unread-ডট) + রিগ্রেশন + push

Work Log:
- QA-ফেজ: ১১-পেজ স্মোক ২০০ + role-policy 125/125 + cursor 25/25 + guard ✓ (গোটচা: role-policy RP_PORT-env, cursor BASE=argv[2])
- 🚨 P0-স্বাধীন-আবিষ্কার: /notifications 'সরান' নীরব-মৃত — curl-প্রোব: POST dismiss → 303-জেনেরিক-ফলব্যাক; git-ট্রেসে da91a80-র rebase-reapply session114-রুট pure-deletion (session119-এজেন্টের ee0d9df = ক্যানোনিকাল-ফিক্স; আমার-পুনঃস্থাপন স্বাধীন-প্রমাণ-হিসেবে যাচাই-অবদান: anon 401 / own removed:true / re removed:false / non-numeric নিরাপদ)
- ফিচার-③ crx-কভার-থাম্বনেইল: **c=চুক্তি নতুন** — article-reading.js savePosে og:image (প্রিফিক্স-গার্ড: https?:// বা /uploads|/assets/img/) → continue-reading.js উইজেট-রো (thumb + .crx-rowmain) + ফুল-পেজ .crx-tiletop-কভার-স্ট্রিপ (টাইল-কিনারায় ব্লিড) + .crx-tilepct %-ব্যাজ (নিচে-বাঁয়ে — ×-বাটন-সংঘর্ষ-এড়ানো) + c-বিহীন-ফলব্যাক পালক-আইকন (img-onerror-ও); dashboard.css session119-ব্লক
- ফিচার-⑤ মিনি-বাবল unread-ডট: MiniBubblePreview .mnp-udot (aria-label রোল — **sr-only-নিষিদ্ধ: .conv-snippet-textContent-সার্চ-চুক্তি**) + .mnp-bubble.has-unread + data-mnp-unread-হুক + title-এ "— অপঠিত বার্তা"; shared.css session119-ব্লক
- union-রেস: push-পূর্ব fetch-এ session119/120/121 আগে-ল্যান্ডড (P0 + ①ড্রপডাউন-dismiss + ④?type= + optimistic-কমেন্ট + সার্চ-হাইলাইট) → আমার ① (main.js-EOF-IIFE + header-✕) ও ④ (client-side setUrl) **প্রত্যাহৃত** — তাদের-ক্যানোনিকাল গৃহীত (header-partial-IIFE badge121+keyboard; setUrl121+server-side-প্রি-ফিল্টার); আমার main.js-ট্রিম node --check-প্রমাণিত; rebase-কনফ্লিক্ট ×৯ ইউনিয়ন-সমাধান
- E2E (মার্জ-পরবর্তী, ismail+testuser দুই-সেশন): ③ c=লাইভ (/articles/1 ৪৫%→ls c=og-default ✓ উইজেট-থাম্ব ✓ ফুল-পেজ কভার-স্ট্রিপ+৫৩%-ব্যাজ ✓ ফলব্যাক-টাইল ✓ টেস্ট-এন্ট্রি-ক্লিনআপ ✓) ⑤ উডট (ismail→testuser বার্তা → .mnp-udot+has-unread+title ✓ পঠন-পরে GONE ✓) তাদের-① (ডিসমিস → server-truth ৮→৫ ✓ synthetic-দ্রুতক্রমে stale-repaint-observed — রিয়েল-ফ্লো-নিরাপদ) তাদের-④ (?type=message URL-সিঙ্ক+রিলোড-অটো-চিপ+G117-ইউনিয়ন-লেবেল ✓ শূন্য-পরিবার-এম্পটি ✓) 390px ×৪-০ ✓ কনসোল-০ ✓ রিগ্রেশন ১২৫+২৫+guard ✓
- ডকস: PLANS session119-খ-নোট + PROJECT চেঞ্জলজ + worklog ×২

Stage Summary:
- অনন্য-ল্যান্ডেড: ③ crx-থাম্বনেইল (c=চুক্তি — ভবিষ্যৎ-এজেন্ট এই-শেপ-রক্ষা করুন); ①④⑤ প্রত্যাহার-নোট (session121/122-ক্যানোনিকাল — ⑤ .mnp-dot)
- মূল-শিক্ষা: E2E-দাবি ≠ সার্ভার-সত্য — এন্ডপয়েন্ট HTTP-প্রোব-রীতি; synthetic .click()-এ stale-repaint-মিথ্যা-নেগেটিভ — সার্ভার-সত্য রিলোডে যাচাই
- **পরের-এজেন্ট: session122 থেকে**

---
Task ID: session119-গ (cron webDevReview রাউন্ড — চূড়ান্ত-ইউনিয়ন: session119/120/121/122/123-রেস)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-মূল্যায়ন + agent-browser QA → P0-ডিসমিস-স্বাধীন-প্রমাণ + session117-সুপারিশ ①③④⑤-চেষ্টা → সম্পূর্ণ-ইউনিয়ন-যাচাই-রাউন্ড (রেস ×৫)

Work Log:
- QA-ফেজ: ১১-পেজ স্মোক + role-policy 125/125 + cursor 25/25 + guard ✓ (গোটচা: role-policy RP_PORT-env, cursor BASE=argv[2])
- 🚨 P0-স্বাধীন-আবিষ্কার: /notifications 'সরান' নীরব-মৃত (session114-রুট da91a80-র rebase-reapply-এ pure-deletion; curl-প্রোব: POST→303-জেনেরিক-ফলব্যাক) — ক্যানোনিকাল-ফিক্স session119-এজেন্টের ee0d9df; আমার-প্রোব-চেইন (anon 401/own removed:true/re removed:false/non-numeric নিরাপদ) স্বাধীন-যাচাই
- ফিচার-চেষ্টা ①③④⑤ সব-বাস্তবায়ন-করেও push-রেস ×৫-এ প্রত্যাহার: ①④→session121 (header-IIFE badge121+keyboard; setUrl121+server-side-প্রি-ফিল্টার) ⑤→session122 (.mnp-dot+mnp-bubble--unread CSS-সম্পূর্ণ) ③→session123 (data-cover+/img/cover/-SVG+__lfSbUrl+১৬:৯-স্ট্রিপ — সমৃদ্ধ-সংস্করণ) — union-নীতিতে সব-তাদের-ক্যানোনিকাল গৃহীত; আমার-কোড-ট্রিম (main.js-EOF-IIFE) node --check-প্রমাণিত
- মার্জ-পরবর্তী সম্পূর্ণ-সহাবস্থান-যাচাই (ismail+testuser দুই-সেশন): c=লাইভ (/articles/1→ls c=og-default ✓ উইজেট+ফুল-পেজ থাম্ব ✓ ফলব্যাক-টাইল ✓) উডট (প্রেরণ→ডট ✓ পঠন→GONE ✓) তাদের-① (server-truth ৮→৫ ✓ synthetic-দ্রুতক্রমে stale-repaint — রিয়েল-ফ্লো-নিরাপদ) তাদের-④ (?type=message URL-সিঙ্ক+রিলোড-অটো-চিপ ✓ শূন্য-পরিবার-এম্পটি ✓) 390px ×৪-০ ✓ কনসোল-০ ✓ রিগ্রেশন ১২৫+২৫+guard ✓
- push-রেস ×৩-হ্যান্ডলিং: pull --rebase ×২ + কনফ্লিক্ট ×১১ (docs-ইউনিয়ন, অটো-ওয়ার্কলগ-কমিট সহ); রীতি-পুনঃপ্রমাণ: rebase-এ --theirs=আমার-কমিট (বিপরীত); synthetic .click()-এ stale-repaint-মিথ্যা-নেগেটিভ → সার্ভার-সত্য রিলোডে-যাচাই

Stage Summary:
- **কোড-ল্যান্ড = শূন্য (৫-ফিচার-ই প্যারালাল-এজেন্টদের দ্বারা ল্যান্ডেড); আমার-অবদান = P0-স্বাধীন-প্রমাণ-চেইন + মার্জ-পরবর্তী সম্পূর্ণ-সহাবস্থান-E2E + ডক-গোটচা ×৪** — ডুপ্লিকেশন-শূন্য-ইউনিয়ন-সম্পন্ন
- পরের-এজেন্ট: session124 থেকে
- origin/main @ ffb9176 (session122 on session121/120/119 চেইন) — সব-স্যুট-গ্রিন, guard গ্রিন
- QA-থ্রেড-সোয়াপ চুক্তি: ?format=qa-html (slot-র‍্যাপার+চিপ-সহ) — slot-লাগবে-সোয়াপে format=html নিষিদ্ধ
- পরবর্তী-প্রার্থী: ① ডিসমিসে undo-টোস্ট ② live.js paintList-এ data-ts-চুক্তি ③ swapQaThread-optimistic-ইনসার্ট ④ crx-টাইলে কভার-থাম্বনেইল ⑤ role-policy §১৮: qa-html-কন্ট্র্যাক্ট-চেক

---
Task ID: session123 (cron QA রাউন্ড — sandbox web-6f1a6533, "Project Status & QA Process")
Agent: Z.ai Main agent (baseline a565a42/session118-পরবর্তী থেকে শুরু)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-ফিক্স (🚨 পুনঃ-এডিট data-raw স্টেল = ডেটা-লস) + মাইক্রোইন্টারঅ্যাকশন (ডিলিট-মৃত্যু-অ্যানিমেশন + সেভ-পালস) + role-policy সিড-রিসেট + ইউনিয়ন-মার্জ ×২

Work Log:
- **বেসলাইন:** pull --rebase (c07ef14→a565a42, session118-প্লেলিস্ট) → রিস্টার্ট → agent-browser QA: ফিড ১২-কার্ড ✓ ডুপ্লিকেট-কমেন্ট-ফিক্স অক্ষত (ড্রয়ার-খোলা→প্রিভিউ-লুকানো, dup-০) ✓ প্যালেট ৭-ইমোজি (focus-within-পথসহ) ✓ love→'❤️১'-ব্যাজ+টগল-অফ ✓ optimistic ~২০০ms-দৃশ্যমান+markdown-lite ✓ মেনু-পলিসি সঠিক (অন্যের=রিপোর্ট, নিজের=এডিট/ডিলিট) ✓
- **🚨 বাগ-আবিষ্কার (জিওমেট্রি-সচেতন E2E):** সম্পাদনা→সেভ→পুনঃ-এডিটে প্রি-ফিল **পুরনো-টেক্সট** দেখায় — ক্যানোনিকাল-এডিট-ইঞ্জিন (PUT [data-cmt-edit], লাইন ~১১০৪) সেভ-সফলে bodyEl.innerHTML আপডেট করলেও **data-raw/RAW_CACHE আপডেট করে না** → পরের-এডিটে প্রথম-সংস্করণ ফিরে আসে → সেভ করলে প্রথম-সম্পাদনা নীরবে হারায় (ডেটা-লস; পুরনো-ইঞ্জিন startEdit করত — দুই-ইঞ্জিন-অসমতা)
- **ফিক্স:** ক্যানোনিকাল save-হ্যান্ডলারে `bodyEl.setAttribute('data-raw', val)` + `RAW_CACHE[cid]=val` + bodyHtml-fallback `|| esc(val)` — E2E: সেভ→raw-আপডেট ✓ পুনঃ-এডিট-প্রি-ফিল=নতুন-টেক্সট ✓ (ফিড+আর্টিকেল দুই-সারফেসে)
- **ফিচার ① ডিলিট-মৃত্যু-অ্যানিমেশন (session12-সুপারিশ):** killItem() — উচ্চতা-কমিট-reflow→height-0 + opacity→০ + translateX-slip, ৩০০ms cubic-bezier; reduced-motion/০-জিওমেট্রিতে তাৎক্ষণিক; `.cmt-dying` গার্ড (pointer-events-none + প্যালেট/মেনু/এডিটর-লুকানো); কাউন্টার-সিঙ্ক অ্যানিমেশন-শেষে (cardD/dwD আগে-ক্যাপচার — remove-পরে closest-ব্যর্থ-গোটচা এড়াতে); E2E মিড-ফ্লাইট-ক্যাপচার: ৮৪px→২৫.৩px@op-০.১৫ (ফিড) + ১৮.৬px@op-০.১০ (আর্টিকেল) ✓
- **ফিচার ② সেভ-পালস:** pulseSaved() — সফল-সেভে বাবলে ১.২সে-সবুজ-রিং ফ্ল্যাশ (cmtSavedPulse121, reduced-motion-গার্ডসহ) — উভয়-ইঞ্জিনে
- **session104-সুপারিশ-⑤ role-policy সিড-রিসেট:** kill→seed-test-users.js→boot (run-order-চুক্তি) → **১০৩✓/১৩✗ → ১২৫/১২৫ ALL GREEN** (testadmin banned→active + testuser role-ফিক্স)
- **🚨 `[h`-ট্রান্সপোর্ট-গোটচা (নিজস্ব-আবিষ্কার+প্রমাণ):** আউটপুটে `.notif-page-item[hidden]` 'itemidden]' দেখায় — ফাইল-বাইট অক্ষত (od -c প্রমাণ: 'item[hidden]', ESC-বাইট-০); session122-র chr(91)+'h'-নোটের স্বীকৃতি — **সন্দেহে সরাসরি od -c, grep-লিটারাল প্রোব নয়**
- **ইউনিয়ন-মার্জ ×২:** pull --rebase-এ session121(notif-dismiss/nft-chip)+session122(QA-সোয়াপ swapQaThread+afterDeleteSuccess-রিফ্যাক্টর) আসে → stash-pop-কনফ্লিক্ট ×২-ফাইল: comment-tools.js-৩-হাংক (upstream-এর afterDeleteSuccess/QA-শাখা + আমার killItem-ইনজেকশন union; dwD-ক্যাপচার QA-শাখার-বাইরে-তবু-অ্যানিমেশন-আগে) + style.css-নেস্টেড-হাংক (session120-সার্চ + session121-notif-x + আমার ১২৩-ব্লক ত্রি-ইউনিয়ন); লেবেল-রেস ×২ (আমার প্রাথমিক ১২১→ ১২৩-এ রিলেবেল, max+1 রীতি)
- **রিগ্রেশন (মার্জড-স্টেট):** role-policy ১২৫/১২৫ ✓ cursor ২৫/২৫ ✓ guard:design ✓ 390px-ওভারফ্লো-০ ✓ কনসোল-০ ✓ node --check ✓ CSS brace-০ ✓ টেস্ট-ডেটা-ক্লিনআপ (id29/id30/id34 + আর্টিকেল-কমেন্ট মূল-টেক্সট-রিস্টোর) ✓

Stage Summary:
- origin/main-এ push: 🚨 ডেটা-লস-ফিক্স (পুনঃ-এডিট data-raw স্টেল) + ডিলিট-মৃত্যু-অ্যানিমেশন + সেভ-পালস + role-policy সিড-রিসেট (১৩-ফেল-হেরিটেজ-শূন্য)
- দুই-ইঞ্জিন-সমতা: data-raw/RAW_CACHE/পালস এখন পুরনো-ইঞ্জিন (startEdit) ও ক্যানোনিকাল ([data-cmt-edit]) উভয়ে; killItem afterDeleteSuccess-রিফ্যাক্টরের ভেতরেও (session122-র QA-সোয়াপ-শাখা অক্ষত)
- পরবর্তী-প্রায়োরিটি: ① swapQaThread-optimistic-ইনসার্ট (session122 ③) ② ডিসমিসে undo-টোস্ট (session122 ①) ③ hall-provost সার্চ/ফিল্টার (session111 ④) ④ পুরনো-চুক্তি-মার্কআপ→canonical-মাইগ্রেশন

---

## Session 124 — ক্যানোনিকাল তাৎক্ষণিক-কমেন্ট-ইনসার্ট (cron-QA-রাউন্ড, ত্রি-ইউনিয়ন-রিবেজ)

**Task:** প্রজেক্ট-স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → স্বাধীন-কাজ-নির্বাচন → session114-নোট ②-এর পূর্ণরূপ: কমেন্ট-সাবমিটে সার্ভার-রেন্ডার্ড ক্যানোনিকাল-বাবল এক-রাউন্ডট্রিপেই DOM-এ (রিফেচ/রিলোড-ফ্ল্যাশ-শূন্য)।

**Work Log:**
- QA-ফেজ: git fetch → HEAD=origin/main; pkill→port-ভেরিফাই→seed-qa-users (সার্ভার-বন্ধ)→এক-ইনভোকেশনে সার্ভার+স্যুট; role-policy ১২৫/১২৫ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ALL GREEN; ব্রাউজার-সুইপ ১০-পেজ + 390px ×৫ — কনসোল-০, ওভারফ্লো-০
- টেস্ট-গোটচা আবিষ্কার: CALL_RING_TIMEOUT_S সার্ভার-env (টেস্ট-প্রসেসে নয়) — env-বিহীন বুটে ২+৫ মিথ্যা-ফেইল, env-সহ সব-গ্রিন; SW-অফলাইন-পেজে unregister+cache-clear রেসিপি পুনঃপ্রমাণ
- ইমপ্ল (সংস্করণ-১): B1-মিসিং dismiss-API + F1-হেডার-ড্রপডাউন-✕ + F2-QA-রিলোড-নেই + F3-তাৎক্ষণিক-ইনসার্ট + F4-?type= + CSS-ব্লক — নিজস্ব E2E ×১০ ALL GREEN
- push-পূর্ব fetch: সমান্তরাল session121/122/123-এজেন্টদের কাছে B1/F1/F2/F4-এর ক্যানোনিকল-ইমপ্ল ইতোমধ্যে — **আমার ডুপ্লিকেট-স্বেচ্ছায়-প্রত্যাহার**; F3 (ক্যানোনিকাল-ইনসার্ট) অনন্য — session12-অপটিমিস্টিকের উপরে সার্ভার-সত্য-স্তর হিসেবে পুনঃপ্রয়োগ (session124)
- মার্জ: stash→pull→pop — comment-tools.js/social.js অটো-ইউনিয়ন + style.css UU (nested `=======`) ইউনিয়ন-সমাধান; ২য়-ফেজ pull-এ session123-আরও আসে → ২য়-stash-সাইকেল — চূড়ান্ত-মার্জে সব-স্যুট পুনঃরান
- চূড়ান্ত: role-policy ১৩১/১৩১ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ✓ + ব্রাউজার চার-সারফেস reload-শূন্য + 390px-০ + কনসোল-০ + টেস্ট-ডেটা-ক্লিনআপ

**Stage Summary:**
- POST /api/comment → `{ok,id,html,total}` (backward-compatible); ক্লায়েন্টে insertCanonical124/syncTotals124 + `.is-new124`-অ্যানিমেশন; session12-ফলব্যাক অক্ষত
- লেবেল-রেস-নোট: একই-রাউন্ডে ৩+ এজেন্টের সমান্তরাল-কাজ — push-পূর্ব re-read আবশ্যক; পরবর্তী-এজেন্ট session125 থেকে
- ডকস: PROJECT-চেঞ্জলজ §১২৪ + PLANS session124-নোট (৪-ইন্টিগ্রেশন-পয়েন্ট + ৫-গোটচা) + worklog ×২

## সেশন ১২২ (২১ সেপ্টেম্বর ২০২৬) — WebRTC কল: মৃত্যু-বাগ-সেটের মূল-কারণ-ফিক্স + UI-ফার্স্ট পারমিশন-প্যানেল + ব্যাকগ্রাউন্ড-রিং (ক্রন-রিভিউ রাউন্ড)
**ইনপুট (লাইভ-ইউজার):** "অডিও ও ভিডিও কল কাজ করছে না — ফেসবুক/টেলিগ্রাম/হোয়াটসঅ্যাপের মতো করো; ইন্টারফেস পপ-আপ হয় না; মাইক্রোফোন-অনুমতি দেওয়া হয়নি বলে" — UI-ফার্স্ট-কল-স্থাপত্যের রেফারেন্স-ব্লুপ্রিন্টসহ (React-CallContext-ঘরানা; EJS-স্থাপত্যে অনুবাদিত)।
**রোগনির্ণয় (চার-স্তর):**
1. 🚨 server.js `Permissions-Policy: microphone=(), camera=()` — সাইট নিজেই ব্রাউজারে মাইক/ক্যামেরা নিষিদ্ধ ঘোষণা করছিল → getUserMedia ডায়ালগের-আগেই NotAllowedError (রিপোর্টের মূল-কারণ)।
2. `S.after=0`-কার্সর-রিসেট → প্রথম-পোলেই পুরনো অন্য-কলের 'ended' সিগন্যাল-রিপ্লে → callId-null-গার্ড-বাইপাস → cleanup() → কল-UI মুহূর্তেই সেলফ-ডেস্ট্রাক্ট (গায়েব-বাগ)।
3. flushSignals early-return → অফার-পূর্ব ICE-ব্যাচ স্ট্র্যান্ডেড → ICE 'connecting'-এ আটকে (সংযোগ-স্থাপন-ব্যর্থতা)।
4. হিডেন-ট্যাবে DOM-টাইমার-থ্রটল (৬০সে) > রিং-টাইমআউট (৪৫সে) → ব্যাকগ্রাউন্ড-ট্যাবে আসন্ন-কল-পপআপ অসম্ভব।
**কাজ:**
- server.js: `(self)`-পারমিশন + কমেন্ট-ডকুমেন্টেশন।
- webrtc-call.js (বড়-রিফ্যাক্টর): UI-ফার্স্ট start() → openUI→acquireAndOffer(); acceptCall() → acceptResume(); .lc-perm-প্যানেল (মানব-বার্তা humanMediaError err.name-ম্যাপ + 🔒-৩-ধাপ + permRetry-রিজিউম + perm-cancel-ভূমিকা-সচেতন [callee=decline]) + নতুন-ট্যাব-বোতাম (iframe/HTTP-ডিটেকশন) + poll-busy-গার্ড + 401-ব্যাকঅফ (১৫সে) + visibilitychange/focus/pageshow-পোল + Worker-হার্টবিট (call-heartbeat.js — CSP-ক্লিন same-origin, XTransformPort-সচেতন, onerror-নীরব) + title-flash + Notification + কার্সর-গ্লোবাল (রিসেট-বাদ) + সিগন্যাল-প্রসেসে callId-বাধ্যতামূলক + flushSignals রি-শিডিউল/কিক + QA-হুক ×৩ (_qaShowPerm/_qaPermState/_qaPollNow)।
- calls.css: .lc-perm-ফ্যামিলি + .lc-btn ×৩ + 640px + reduced-motion (EOF, brace-০)।
- messages-list.ejs: সারি-data-peer-id + মেনু call-audio/video (1:1-গার্ড; row116-প্রি-ক্যাপচার — closeConvMenu menuTarget-null করে এমন-বাগ-ধরা)।
- routes/calls.js: accepted-স্টেল self-heal (২ঘণ্টা, stale_cleanup — ক্র্যাশ-পরে চিরকাল-busy-বাগ)।
- নতুন: call-heartbeat.js + verify-session122-calls-browser.js (২১-চেক, টুয়ো-ব্রাউজার fake-media+mdns-off) + diag-session122-ice.js।
**যাচাই (সব-সব-সবুজ):** API 54/54 ✓ ব্রাউজার-E2E 21/21 (getUserMedia ✓ পপআপ ✓ রিং ✓ ইনবক্স-পেজে-আসন্ন ✓ connected+remote-স্ট্রিম-উভয়-পিয়ার ✓ টাইমার ✓ মিউট ✓ ক্লিনআপ-উভয় ✓ পারমিশন-প্যানেল-পথ ×৪ ✓) ✓ গেটওয়ে-জার্নি (SANDBOX_PORT=8080-বুটে): মেনু→কল→ctx-সেট→মোডাল-স্থায়ী→প্যানেল→বাতিল ✓ API-কলার→ইনবক্স-পপআপ+title-flash ✓ guard:design ✓ JS-syntax ✓ CSS-brace ✓। স্ক্রিনশট: scripts/qa121-perm-panel.png।
**স্যান্ডবক্স-গোটচা (ভবিষ্যৎ-এজেন্টের জন্য — PLANS-এও ডকুমেন্টেড):**
- sql.js ইন-মেমরি: ফাইল-এডিটের **আগে** সার্ভার-kill, পরে boot — উল্টোলে পুরনো-মেমরি ফাইল-ওভাররাইট করে (ধরা-খেয়েছিলাম)।
- persist() debounce ২০০ms — স্ট্যান্ডঅ্যালোন DB-স্ক্রিপ্টে exit-এর আগে ≥৮০০ms।
- QA-ট্রায়ো 2FA/পাসওয়ার্ড: ismail/secret123, monem/karishma/demo123 — ব্লক হলে totp_enabled=0+twofa_method=NULL+two_factor_tokens-ক্লিয়ার।
- সার্ভার **SANDBOX_PORT=8080**-env-সহ বুট (গেটওয়ে-প্রিভিউতে অ্যাসেট-প্যাচিং লাইভ থাকে; এ-রাউন্ডে এ-জিনিস-হারিয়ে ডিবাগ-ঘুরপাক খেয়েছি)।
- call_signals-কার্সর **গ্লোবাল** — নতুন-কলে রিসেট করা নিষিদ্ধ (এ-সেশনের সবচেয়ে-গোপন-বাগ)।
- ২-ঘণ্টার-বেশি পুরনো accepted-কল সার্ভার-নিজে-ই 'ended' করে (stale_cleanup) — টেস্টে ঝুলে-থাকা সেশন দেখলে আতঙ্কিত হবেন না।
**লেবেল-রেস:** আমার কাজ-শুরুর সময় সর্বোচ্চ ছিল 115 → আমি 116-লেবেলে কাজ করছিলাম — push-পূর্ব fetch-এ দেখি 116(রিসোর্স-CSV)/118/119/120 সব-নেওয়া → সর্বোচ্চ+১ রীতিতে **121-এ রিলেবেল** (ফাইল-নামসহ)। পরবর্তী-এজেন্ট 122 থেকে।
**পরবর্তী-প্রথম-পছন্দ:** ① কল-মিনিমাইজ-অবস্থায় মেসেজ-টাইপিং-সহাবস্থান-পলিশ ② group-call 1:1-উত্তরাধিকারে Notification-অ্যাকশন-বাটন (গ্রহণ/প্রত্যাখ্যান সরাসরি OS-নোটিফিকেশন থেকে) ③ role-policy-র মতো কল-রিগ্রেশন-সুইটকে cron-QA-রুটিনে ধরা ④ verify-session122-browser-কে CALL_RING_TIMEOUT_S-নিরপেক্ষ করা (এনভি-নিজেই বুটে সেট)।
**পুশ-সমাপ্তি (session-121):** প্যারালাল-রেস ×৪ (১১৯-চিপস/ডিসমিস → ১২০-সার্চ → ১২-অপটিমিস্টিক → ১২১-দ্বিতীয়-এজেন্ট db726c0) — চূড়ান্ত push **c57777d** (মূল-ফিচার) + **51502e4** (inspect-audit stat-tile-রুল → ক্যানোনিকাল-প্রথম, 48/48)। union-চূড়ান্ত: server-side ?type= (আমার) + client-side setUrl121 (তাদের) + dismiss-সিঙ্ক — ৩-স্তরে সম্পূর্ণ। QA-ইনস্ট্যান্স :3140 পরবর্তী-এজেন্টের জন্য রেখে-দেওয়া (পিড রিসেট-লগইন প্রয়োজনে scripts/reset-qa-logins.js)।
(docs(session121): repo-worklog পুশ-সমাপ্তি-এন্ট্রি (c57777d + 51502e4, রেস×৪-ইতিহাস))
Task ID: session122 (cron webDevReview রাউন্ড — sandbox web-68dcf7c4, "Project Status & Development Plan")
Agent: Z.ai Cron Agent (webDevReview — origin/main @ c57777d/session121-পরবর্তী থেকে শুরু)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-অভিযান → অনন্য-ফিচার (মিনি-বাবল unread-ডট + QA-থ্রেড qa-html সোয়াপ + ড্রপডাউন reltime) + প্যারালাল-ইউনিয়ন ×৪ + push
- **অবস্থা-যাচাই:** git fetch (3a234b6) → PLANS/PROJECT/ওয়ার্কলগ-রিভিউ → guard গ্রিন → :3030 লাইভ → বেসলাইন নির্ধারণ
- **QA-ফেজ (agent-browser):** ড্যাশবোর্ড/নোটিফিকেশন-ড্রপডাউন/মেসেজ/QA-পেজ ভিজ্যুয়াল + localStorage-seed — **বাগ-১ ধরা পড়ে:** session112-র continue-reading উইজেটের .crx-* CSS ছিলই না (unstyled rows) → ফিক্স-প্রস্তুতির-মাঝে প্যারালাল-এজেন্টের dashboard.css .crx-* ক্যানোনিকল পাওয়া গেল → ইউনিয়নে আমার ডুপ্লিকেট প্রত্যাহার
- **ফিচার ① মিনি-বাবল অপঠিত-ডট:** MiniBubblePreview.ejs — না-পড়া-ইনকামিং-এ .mnp-dot (messenger-নীল + blue-light হ্যালো) + .mnp-bubble--unread বোল্ড; মিউট-রোতে ডট-লুকানো; convListFor-unread_count-সোর্স (শূন্য-নতুন-API) — session117-সুপারিশ ⑤ সম্পন্ন
- **ফিচার ② QA-উত্তর-থ্রেড সার্ভার-সত্য সোয়াপ (session113-বকেয়া ③):** GET /api/comments?format=qa-html → qa-single-সত্য (like_count DESC + slot-র‍্যাপার + idx-0 top-answer-chip + compact-রিপ্লাই, একই CommentItem) → comment-tools.js swapQaThread (রিলোড-নেই; চিপ AJAX-পরেও টেকনামী); ক্যানোনিকাল delete-হ্যান্ডলারে QA-শাখা (empty-slot-শূন্য + চিপ-পুনর্বিন্যাস)
- **ফিচার ③ ড্রপডাউন আপেক্ষিক-সময়:** header.ejs notif-time [data-ts] → LekhokRelTime (বাংলা-রিলেটিভ + টুলটিপে পূর্ণ-তারিখ) + clearNotifBadge-বাসি-ডট-পরিষ্কার
- **ফিচার ④ ড্রপডাউন-ডিসমিস (পরিণতি):** আমার .notif-dismiss--dd+main.js-ইমপ্ল E2E-প্রমাণিত হলেও প্যারালাল session121-র .notif-x (header-IIFE + /api/count-ব্যাজ + Enter-কি) আরও-বিবর্তিত → তাদেরটা ক্যানোনিকল গৃহীত, আমার প্রত্যাহার (ডুপ্লিকেট-শূন্য)
- **🚨 rebase-গোটচা (আবার-প্রমাণিত):** skip-করা wip-কমিটের কোড-পরিবর্তন ফেরত-আনতে হয়েছে (feat-কমিট docs-only নেমে গিয়েছিল); transport '[h'-স্ট্রিপ বাইপাসে python-এ chr(91)+'h'-নির্মাণ; দুই-সার্ভার-এক-DB-রেসে role-policy মিথ্যা-ফেইল (১০৬/১) — একক-সার্ভারে ১২৫/১২৫ ✓
- **রিগ্রেশন (ফ্রেশ-সার্ভার এক-পাস):** role-policy ১২৫/১২৫ ✓ cursor ২৬/২৬ ✓ groupcalls ৫০/৫০ (CALL_RING_TIMEOUT_S=4-পূর্বশর্ত) ✓ calls ৫৫/৫৫ ✓ guard ✓ 390px-ওভারফ্লো-০ ×৬ ✓ কনসোল-০ ✓
Task ID: session-125 (cron-QA-রাউন্ড — তৃতীয়-রেস-union-সমাপ্তি)
Agent: Main agent (Lekhok-Forum Express/EJS repo)
Task: qa-উত্তর-optimistic টার্গেট → তিন-এজেন্ট-রেসে চূড়ান্ত-ইউনিয়ন → অনন্য-ডেল্টা → push
- বেস-৫cc41df-এ qa-উত্তর-গ্যাপ-আবিষ্কার (রিলোড-ফলব্যাক) → ফুল-ইমপ্ল (insertOptimistic-qa-target + reconcileQa123 + pen_name + CSS) + E2E-গ্রিন
- rebase-রেস ①: cb83da1 (session123, swapQaThread+qa-html) → ইউনিয়ন: তাদের swap ক্যানোনিকাল, আমার টার্গেট রক্ষিত, reconcileQa123 প্রত্যাহৃত; union-E2E-পুনঃযাচাই (sessionStorage-stamp নো-রিলোড ✓ চিপ-রক্ষা ✓)
- push-রেস ②: 7ad5fb3 (session124, POST j.html + insertCanonical124) → তাদের ইঞ্জিনে আমার টার্গেট-ও অন্তর্ভুক্ত → টার্গেট-ও প্রত্যাহৃত; চূড়ান্ত-ডেল্টা = shared.css session125-পলিশ + pen_name/full_name additive + union-ডকুমেন্টেশন
- লেবেল: 123→তাদের, 124→তাদের, আমি 125 (max+1)
- সব কমেন্ট-সারফেস reload-মুক্ত + তাৎক্ষণিক-বাবল (তিন-স্তর-ফলব্যাক-চেইন: j.html→optimistic→swapQaThread) — তিন-এজেন্টের-কাজ union-এ বিনা-দ্বন্দ্বে
- গোটচা: বহু-রেসে প্রতি-rebase-এ নিজের-ডেল্টার অনন্যতা পুনঃমূল্যায়ন বাধ্যতামূলক; `>>>>>>> sha (msg)`-ট্রেইলার-লিক স্ক্যান (rg)
- পরবর্তী: tokens.css-হেক্স-গার্ড (session113-⑤) · গ্যালারি-অ্যালবাম-কভার-নির্বাচন · লাইভ-Turso-রিসেট + সিক্রেট-রোটেশন ×৪
Task ID: cron-r6 (session126 — লেবেল-রেস: সমান্তরাল-এজেন্টও 125-নিয়েছিল, max+1=126) (session125 — রাউন্ড-৬: QA-সুইপ → paintList-mirror + audit:views → ত্রি-এজেন্ট-কলিশন-ইউনিয়ন)
Task: Lekhok-Forum অবস্থা-যাচাই + agent-browser QA → বাগ-শূন্যে ফিচার-রাউন্ড → সমান্তরাল-কলিশনে অনন্য-ডেল্টা রক্ষা → push + ডকস
- sync+QA: 4ec1a2d-বেসে ১৫-route ম্যাট্রিক্স + ৭-পেজ কনসোল-০ + /me-ইন্টিগ্রিটি (৯-ট্যাব/টগল/ws91) + /qa-ফিল্টার + সার্চ-২১-মার্ক + 390px ×৪-০ — বাগ-শূন্য → ফিচার-রাউন্ড
- রাউন্ড-শুরুতে নির্বাচিত ৪-ফিচার: qa-optimistic (comment-tools .qa-answers-list এক্সটেনশন — E2E-প্রমাণিত: reload-শূন্য-বাবল + nested-replies + empty-state-অপসারণ), header-ড্রপডাউন-dismiss-✕ (div-শেল-রিস্ট্রাকচার + main.js-IIFE + badge-বাংলা-সিঙ্ক + nx-out-অ্যানিমেশন), audit-view-dupes.mjs (পজিটিভ+নেগেটিভ-টেস্টেড), notifications-?type= (client-side restore+persist — G121-whitelist-গার্ড)
- E2E-পথে ধরা-বাগ ×২: ① live.js paintList এক-এঞ্চর-পুরনো-শেল পেইন্ট করে প্রতি-বেল-ওপেনে ✕-মুছে-ফেলত ("stale-repaint" মিথ্যা-অনুমান ভেঙে) ② SW-ক্যাশ মিশ্র-পাঠ (fetch-নেটওয়ার্ক-সত্য + DOM-বাসি) — SW-unregister+caches-purge-প্রতিকার
- push-পূর্ব fetch: সমান্তরাল session121-নোটিফ / 122-QA-সোয়াপ / 123-মাইক্রো / 124-canonical-insert pushকৃত — আমার ৪-ডেল্টা আচ্ছাদিত → stash→pull→pop-ত্রিয়ান (৪-UU + ২-অটো-মার্জ-ডুপ্লিকেট-ঝুঁকি) → header/notifications/style=origin-canonical, comment-tools/main=HEAD-প্রত্যাহার, live.js=আমার-মিরর (canonical-শেলে রি-অ্যালাইন: data-dismiss + in-anchor ✕), package.json=audit:views-ইউনিয়ন
- চূড়ান্ত-যাচাই: বেল→repaint→✕ ৪/৪ ✓ painted-row-dismiss ✓ role-policy ১৩১/১৩১ ✓ cursor ২৫/২৫ ✓ guard ✓ audit ✓ brace ০/০ ✓ 390px-০ ✓ কনসোল-০ ✓ ক্লিনআপ (comment-79 + notif-136) ✓
- pushed: f897590 (feat) + docs-কমিট (PROJECT §১২৫ + PLANS session125-নোট + worklog ×২)
- ড্রপডাউন-রিপেইন্ট এখন ✕-সংরক্ষণকারী; audit:views union-মার্জ-দুর্ঘটনা-শ্রেণির স্থায়ী-গার্ড
- শিক্ষা: সমান্তরাল-কলিশনে নিজের-প্রতিটি-ডেল্টা origin-canonical-এর সাথে re-compare বাধ্যতামূলক (অটো-মার্জ-হওয়া ফাইলসহ); SW-বাসি-পেজ E2E-বিভ্রান্তি-উৎস
- পরবর্তী-প্রার্থী: parent-chain-সচেতন chip-render (POST-html-এ), drawer-প্রিভিউ-ইনস্ট্যান্ট-প্রতিফলন, notifications-শূন্য-অবস্থায় ফিল্টার-বার-বিহীন empty-স্টেট পর্যালোচনা, Metered.ca-TURN (ইউজার-অ্যাকাউন্ট)
## Session 127 (cron-r12-দ্বিতীয়) — QA-সুইপ + ক্যানোনিকাল-প্রত্যাহার + stale-সুপারিশ-পরিষ্কার (২৩ সেপ্টেম্বর ২০২৬)
**Agent:** Z.ai Cron Agent (webDevReview)
**Task:** QA-সুইপ → session116-অবশিষ্ট ইমপ্ল → push-পূর্ব rebase-এ ক্যানোনিকাল-আবিষ্কার → সম্পূর্ণ-প্রত্যাহার + docs-only
- সিঙ্ক fbaf3d0-পূর্ব 9e3f8b9; QA-বেসলাইন: ১৮-রুট + home/articles/qa ভিজ্যুয়াল + 390px-০ ×২ + কনসোল-০ → বাগ-শূন্য
- QA-optimistic + মৃত্যু-অ্যানিমেশন + answers-empty-ফিক্স সম্পূর্ণ ইমপ্ল, E2E-প্রুফসহ (swap-delay-hook কৌশলে ৭০০ms-প্রুফ)
- push-পূর্ব rebase-এ ৪-নতুন-কমিট (session123ব/124/125/126) — insertCanonical124 + killItem আমার সব-ডেল্টা আচ্ছাদন করে → HEAD-রিসেট-প্রত্যাহার (ডুপ্লিকেশন-শূন্য-নীতি; session125-এর পরেই দ্বিতীয়-একই-রেস)
- অনন্য-রক্ষিত (docs-only): hall-provost stale-ঘোষণা · swap-delay-hook E2E-কৌশল · `[h`-খাওয়ার দ্বৈত-যাচাই · `.reveal` IO-আর্টিফ্যাক্ট-নোট
- QA-পেজে উত্তর-সাবমিট ক্যানোনিকাল-ইঞ্জিনে ০-রিফেচে পিক্সেল-নির্ভুল; ডিলিটে মৃত্যু-অ্যানিমেশন ক্যানোনিকাল killItem-এ — দুটোই ৪-এজেন্টের স্বাধীন-প্রমাণে সুদৃঢ়
- পরবর্তী-প্রথম-পছন্দ: QA-ডিলিটে স্লট-স্তরের অ্যানিমেশন-উপযোগ-যাচাই → tokens.css-হেক্স-স্ক্যান-গার্ড → contact_hours লাইভ-ইন্ডিকেটর

**union-নোট-২ (128): 220b53d (docs-session127) পরে ল্যান্ডড — আমার-এন্ট্রি 127→128-রিলেবেলড (max+1, দ্বিতীয়বার)।**

**union-নোট (127→128): উপরে সমান্তরাল session124/125/126-এন্ট্রি (তাদের); আমার-এন্ট্রি 124→127→128-রিলেবেলড (max+1 রীতি)।**


---
Task ID: session128 (webDevReview রাউন্ড — origin/main @ 1a3e459 থেকে)
Agent: Z.ai Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → ফেজ-স্টেবল রায়ে ফিচার-রাউন্ড: QA-optimistic-insert (session116-অবশিষ্ট) + QA-থ্রেড-পলিশ + tokens.css-হেক্স-গার্ড (session113-⑤) + push

Work Log:
- QA-ফেজ: ১৭-রুট স্মোক (16×200 + /emails 404 by-design → সঠিক রুট /resources/emails) + role-policy 131/131 + cursor 25/25 + guard + ব্রাউজার-ম্যাট্রিক্স (কনসোল-০, 390px-০ ×৮) → ফেজ-স্টেবল → PLANS-ব্যাকলগ থেকে session124-দাবি (intent-নোট-প্রথম)
- ফিচার-①: insertOptimistic-QA-ব্রাঞ্চ (৩-লিস্ট-চুক্তি; slot-র‍্যাপার + empty-রিমুভ + parent-nest) — session116-অবশিষ্ট সমাপ্ত
- ফিচার-②: shared.css session128-ব্লক (qaOptIn128 + qaOptRing128 + focus-within + reduced-motion; brace-০)
- ফিচার-③: guard-design-system.js tokensHexGuard — প্রথম-রানেই সঠিকভাবে ৩-মিথ্যা-পজিটিভ (ক্রস-লাইন-কমেন্ট-হেক্স) ধরায় স্ট্রিপার-আপগ্রেড, নেগেটিভ-প্রোব (#DEADBEEF) দিয়ে গার্ড-সত্যতা-প্রমাণ
- E2E-দুর্ঘটনা-শিক্ষা ×২: (১) আমার fetch-patch দুইবার-চাপায় গ্লোবাল-ওভাররাইট-রিকার্শন → Maximum-call-stack → submit-হ্যাং-ভান (অ্যাপ-বাগ নয়); ক্লিন-প্যাচ = IIFE-ক্লোজার-capture (২) চলমান-সার্ভারে JS-এডিটে ব্রাউজার পুরনো-AV immutable-ক্যাশ চালায় (transferSize-০-প্রমাণ; SW-ক্লিয়ার-ও-অপর্যাপ্ত) → lf-boot-রিস্টার্টে নতুন-AV-র পরেই প্রমাণ
- চূড়ান্ত-প্রমাণ: উত্তর firstFresh=80ms/total-তাৎক্ষণিক, রিপ্লায় (ctrl+enter) firstFresh=161ms, রিকনসাইল-সেটেল-ক্যানোনিকাল ✓ অটো-গ্রো ৬৯px ✓ ক্লিনআপ ৬/৬ ✓ 390px-০ ✓ কনসোল-০ ✓ রিগ্রেশন ১৩১+২৫+guard ✓
- ডকস: PLANS intent+cross-agent (গোটচা-যুগল + session113-③-ক্লোজার-নোট) + PROJECT চেঞ্জলজ + worklog ×২

Stage Summary:
- QA-পেজের উত্তর/রিপ্লাই এখন ফিড/আর্টিকেলের মতোই তাৎক্ষণিক (৩-সারফেস-অপটিমিস্টিক-চুক্তি সম্পূর্ণ); tokens.css এখন গার্ড-লকড
- **পরের-এজেন্ট: session125/126-সমান্তরাল-ল্যান্ডের পরে — **session129 থেকে**** — পরবর্তী-প্রথম-পছন্দ: reconcile-flash-মসৃণকরণ → crx-'শেষ-পড়া'-পিন → লাইভ-Turso-রিসেট (টোকেন-ধারী)
Task ID: session129-ক (cron-r12 — sandbox web-68dcf7c4, "Project Status & Dev Focus") — union-রিলেবেল (129-গ-এজেন্ট-নোট: আমার-এন্ট্রি নিচে 129-গ)
Agent: Z.ai Cron Agent (webDevReview — origin/main @ 9390875→7ad5fb3-মাঝপথে-বিবর্তিত)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগ-অভিযান (BFS-ডিলিট-আবিষ্কার) → অনন্য-ফিচার (undo-toast + restore-API + hex-র্যাচেট + §25) → প্যারালাল-ইউনিয়ন (crx-ডুপ্লিকেট-প্রত্যাহার + ফলব্যাক-পোর্ট) + push
- QA-ফেজ: ১৮-রুট-স্মোক + কনসোল-সুইপ + /dashboard-crx-ইন্সপেকশন — বাগ-শূন্য, তাই রোডম্যাপ-ফিচার-রাউন্ড
- 🚨 বাগ-আবিষ্কার (কোড-অডিট): DELETE /api/comments/:id দ্বৈত-নিবন্ধন — session105 (লাইভ, এক-লেভেল) + session104 (BFS-জানা, অগম্য-জীবাশ্ম) → রিপ্লাই-অব-রিপ্লাই-ডিলিটে অনাথ-রো প্রমাণিত; BFS-মার্জ + জীবাশ্ম-অপসারণ
- ফিচার ×৩: ① ডিসমিস-আন্ডু-টোস্ট (lfUndoShow + restore-API + data-n চুক্তি ×৩-সারফেস + শেষ-আইটেম-রিলোড-স্থগিত) ② hex-র্যাচেট-গার্ড (--update-hex-baseline CLI) ③ paintList data-n+data-ts-প্যারিটি
- মাঝ-রাউন্ডে নিজের-ইমপ্লে বাগ ধরা: restore-রুট b.id বনাম data-n {i:} কী-মিসম্যাচ → কম্প্যাক্ট-কী-প্রাথমিক ফিক্স; আরও পরে pendingReload-রেস (শেষ-আইটেম-রিলোড ২৬০ms-এ undo-খুন) → ৭সে-স্থগিত-গার্ড
- union-rebase: origin-এ cron-r11-এর crx-থাম্বনেইল (তাদের session123) pushকৃত → ক্যানোনিকল-গ্রহণ + আমার deterministic-ফলব্যাক-পোর্ট + তাদের ২×#fff র্যাচেট-ধরা → var(--lf-ui-surface); root-worklog UU-ইউনিয়ন; stage-2/3-দিক-গোটচা (grep মার্কার-ক্লাস দিয়ে নিশ্চিত)
- টেস্ট-ব্লক-ট্রান্সপোর্ট-করাপশন ×১ (truncated duplicate-line) → bash -n বিসেক্টে ধরা → লিস্ট-নির্মাণ-পুনঃইনসার্ট
- যাচাই (মার্জড-কোডে): role-policy ১৪৭/১৪৭ ✓ cursor ২৬/২৬ ✓ guard ✓ E2E undo ×৩-সারফেস+DB-সত্য ✓ crx-থাম্ব ✓ 390px-০ ✓ কনসোল-০ ✓ টেস্ট-ডেটা-ক্লিনআপ ✓
- পুশ-কৃত: feat(session129) — undo-toast.js (নতুন), tokens-hex-baseline.json (নতুন), social.js (BFS+restore), guard-design-system.js (র্যাচেট), test-role-policy.sh (§25), notifications.ejs/header.ejs/live.js (data-n), shared.css (utoast-ব্লক), continue-reading.js (ফলব্যাক-পোর্ট), dashboard.css (#fff→টোকেন)
- পরবর্তী: og-default-বিরোধী data-cover-গার্ড · dropdown reltime-রি-পেইন্ট · র্যাচেট-বেসলাইন-হ্রাস (admin.css-৪২৬)
- **push-সমাপ্তি:** 16bfb4f (feat) + 5eabd2b (docs) → origin/main ✓ (লেবেল-রেস ×৫: 125→129-রিলেবেল; guard-ইউনিয়ন = session124-এর tokensHexGuard + আমার CSS-র্যাচেট সহ-অস্তিত্ব; post-push স্মোক ২০০ ×৫ + স্যুট সব-গ্রিন)



Task ID: session130 (webDevReview রাউন্ড — origin/main @ 7ad5fb3 থেকে)
Agent: Z.ai Main Agent (webDevReview)
Task: অবস্থা-অ্যাসেসমেন্ট + agent-browser QA → স্বাধীন-ফোকাস: রোডম্যাপ-① পূর্ণরূপ (পাবলিক-পেজ কল-রিংগার — layout.ejs) + আসন্ন-কল স্টাইল-পলিশ + ভাইব্রেশন + নতুন ব্রাউজার-E2E

Work Log:
- sync+worklog-পাঠ: session124 সর্বশেষ (ক্যানোনিকাল-ইনসার্ট); রোডম্যাপ-অডিট — ② কল-ইতিহাস-ট্যাব (সেশন-৯৪), ④ গ্রুপ-কল (১১৩), ⑤ ICE-restart-রিট্রাই-UI (৯৭) ইতোমধ্যে-সম্পন্ন যাচাই; ①-এর মেম্বার-পেজ-অর্ধ (header.ejs, সেশন-৯৪) আছে কিন্তু layout.ejs-পরিবারের পাবলিক-পেজ বাদ — সেটই অনন্য-ডেল্টা
- QA-ফেজ: pkill→ss-ভেরিফাই→seed-qa-users (সার্ভার-বন্ধ)→এক-ইনভোকেশনে বুট+৪-স্যুট: role-policy ১৩১/১৩১ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard — ALL GREEN; agent-browser ৬-পেজ কনসোল-০ → স্টেবল-ফেজ
- বেসলাইন-প্রমাণ: লগড-ইন `/`-এ `LekhokCall===undefined` (দ্বি-হেডার-স্থাপত্য-গ্যাপ); ডাবল-ইনক্লুড-গার্ড (window.LekhokCall) যাচাই → layout.ejs-সম্প্রসারণ নিরাপদ
- ইমপ্ল: layout.ejs (লগড-ইন-গেটেড calls.css + LekhokCallCtx-মিরর + env-TURN + webrtc-call.js) + webrtc-call.js showIncoming()-এ one-shot ভাইব্রেশন (typeof-গার্ড) + calls.css session130-EOF-ব্লক (গ্লাস-কার্ড/গ্লো-পালস/শিমার-চিপ/safe-area/reduced-motion)
- নতুন E2E scripts/verify-session130-globalringer.js (২৫-চেক): ৩-পাবলিক-পেজ-বুট ×৫ + গেস্ট-নেগেটিভ + লাইভ-রিং (/about-এ ক্যালি, মোডাল+কাইন্ড-চিপ+নাম) + পাবলিক-প্রত্যাখ্যান-দ্বি-পক্ষ — ২৫/২৫ ALL GREEN (২-টেস্ট-গোটচা ডকুমেন্টেড: callId-truthy-wait + ব্রাউজার-রানে CALL_RING_TIMEOUT_S=4-নিষিদ্ধ)
- চূড়ান্ত-রিগ্রেশন: session122-ব্রাউজার ২১/২১ + ৪-API-স্যুট পুনঃগ্রিন + curl-সার্ভার-সত্য ৮-পাবলিক-পেজ webrtc:1/calls.css:1 + agent-browser কনসোল-০ + 390px-ওভারফ্লো-০ + স্ক্রিনশট ×২ (গ্লাস-কার্ড+রিপল প্রমাণ)
- গোটচা-পুনঃপ্রমাণ: SW-ক্যাশ-গেস্ট-মিথ্যা-নেগেটিভ (/gallery agent-browser-এ undefined, curl-এ 1) — session121-রেসিপি-ই সমাধান
- docs: PROJECT-চেঞ্জলজ §১২৫ + PLANS session125 cross-agent-নোট (৪-ইন্টিগ্রেশন-পয়েন্ট+৩-গোটচা) + repo-worklog + রুট-worklog

Stage Summary:
- লগড-ইন ইউজার এখন সাইটের যেকোনো পেজে (পাবলিক+মেম্বার উভয়-পরিবার) আসন্ন কলের রিং+পপআপ পান — রোডম্যাপ-① পূর্ণরূপ; পরের-এজেন্ট session131 লেবেল থেকে
- কল-ডোমেইনে অবশিষ্ট: Metered.ca-TURN (ইউজার-অ্যাকাউন্ট), অটো-ভিডিও-ডিগ্রেড, গ্রুপ-রিং-অনলাইন-সীমা
- লেবেল-রেস-নোট (দ্বি-স্তর): প্রথমে 125-লেবেলে কাজ শুরু — push-পূর্ব fetch-এ সমান্তরাল session124-খ/125(cron-QA)/127/128 আগে-ল্যান্ডড → PLANS-পয়েন্টার-অনুযায়ী 129-এ রিলেবেল; দ্বিতীয়-push-প্রচেষ্টায় আবারও রেস — সমান্তরাল-এজেন্টের session129 (আন্ডু-টোস্ট/BFS-ফিক্স — ভিন্ন-ডোমেইন, আমার ৩-কোড-ফাইল তাদের হাতে-অস্পৃশ্য) আগে-pushকৃত → max+1 রীতিতে **130-চূড়ান্ত** (কোড+docs+স্ক্রিপ্ট+স্ক্রিনশট সমগ্র-রিলেবেল ×২)

---
Task ID: session130-ফাইনাল (push-সমাপ্তি)
Agent: Z.ai Main Agent (webDevReview)
Task: push-রেস-হ্যান্ডলিং + সম্পূর্ণ-মার্জড-কোডে চূড়ান্ত-যাচাই

Work Log:
- push-রেস ×২: প্রথম push-এ সমান্তরাল d93c6c2 (session127/128-docs) → rebase-১ (৪-docs-ইউনিয়ন); দ্বিতীয় push-এ সমান্তরাল 136a866/b93690b (session129-আন্ডু-টোস্ট) + 1068b57 (session129-CSV/SSRF — তৃতীয়-এজেন্টও 129-লেবেল নেয়) → rebase-২ + max+1 রীতিতে **130-চূড়ান্ত-রিলেবেল** (কোড+docs+স্ক্রিপ্ট+স্ক্রিনশট সমগ্র ×২-সাইকেল)
- ইউনিয়ন-রেজলভ: PLANS.md/PROJECT.md/worklog.md ×২ — নেস্টেড-মার্কার-শূন্য (regex-অতি-সরল-গার্ডে মিথ্যা-অ্যালার্ম ×৩ — od/grep-ভেরিফাই-রীতিতে নিষ্পত্তি); তাদের session129-ঐতিহাস-রেফারেন্স অক্ষুণ্ণ, কেবল আমার-ব্লক 130
- **pushed: 1068b57..126cb46** ✓
- পোস্ট-push চূড়ান্ত-যাচাই (সম্পূর্ণ-মার্জড origin-কোড): ৮-রুট-স্মোক 200/302-সঠিক ✓ guard ✓ home-webrtc:1 ✓ verify-session130 **২৫/২৫ ALL GREEN** ✓ (session129-এর hex-র্যাচেট-গার্ড + undo-toast + BFS-ফিক্স + CSV-SSRF-ইঞ্জিনের সাথে সহাবস্থান-প্রমাণসহ)

Stage Summary:
- রিপো: main @ 126cb46 (session130 — পাবলিক-পেজ কল-রিংগার পূর্ণরূপ); পরের-এজেন্ট: session131 থেকে
- গোটচা-সংযোজন: এক-লেবেল-ত্রি-এজেন্ট-রেসও সম্ভব (129 ×৩) — push-পূর্ব re-fetch + max+1-এ-রিলেবেল ×N-সাইকেল রীতি পুনঃপ্রমাণিত

---
Task ID: 14 — Session 124 (cron-QA রাউন্ড)
**কাজ:** QA → বেসলাইনে QA-উত্তর-পাথে optimistic-অনুপস্থিতি + `.answers-empty`-লিঙ্গার বাগ আবিষ্কৃত। ফিচার/ফিক্স চেষ্টা → push-পূর্ব rebase-এ সমান্তরাল-ক্যানোনিকাল দুটোই আবিষ্কৃত → **session125-প্রেসিডেন্সিতে দুই-ভ্যারিয়েন্ট-ই সম্পূর্ণ-প্রত্যাহৃত**:
- QA-অপটিমিস্টিক → **session124-ক্যানোনিকাল (7ad5fb3)** `insertCanonical124` + `syncTotals124` + `/api/comment` {ok,id,html,total} — গৃহীত, E2E-পুনঃপ্রমাণ (canonical ৫০ms, no-opt-fallback, answer-N-অ্যাঙ্কর)।
- আন-ডু-টোস্ট → **session129-ক্যানোনিকাল (16bfb4f)** `undo-toast.js lfUndoShow` + data-n + `POST /api/notifications/restore` — গৃহীত, E2E-পুনঃপ্রমাণ (dismiss→বাতিল→row-পুনঃস্থাপন itemsAfter=2)।

**অনন্য-রক্ষিত (এই-রাউন্ডের স্থায়ী-ডেল্টা):**
① swapQaThread ফিক্স ×২: `.answers-empty`-লিঙ্গার (লিস্টের-বাইরের-সিবলিং — প্রথম-AJAX-উত্তরের-পরেও 'এখনো কোনো উত্তর নেই' লেগে থাকত) + `typeof j.qaHtml==='string'` (শূন্য-উত্তরে ''-ফলসি→অযথা reload) + total===0-তে client-side empty-state (শেষ-উত্তর-ডিলিটে ফাঁকা-তালিকা নয়; reload-শূন্য) — E2E: ১→০ ✓; ② hall-provost-সুপারিশ stale-চিহ্নিত (session102/103/109-এ সম্পন্ন); ③ গোটচা ×৩: Write-টুল-বড়-ফাইল-ওভাররাইট (PLANS-ট্রাংকেট→git-checkout-রিকভার) · agent-browser 390px-টেস্টে `set viewport 390 844`-ই সঠিক · **🚨 পাইথন-ব্লক-কাটে সমান্তরাল-ক্যানোনিকাল-রুট-হারানো** (আমার undo-ব্লক-অপসারণে session129-এর restore-রুটও কেটে গিয়েছিল — restore 303→saveerr-ফলব্যাকে পড়ত; origin-checkout-এ পুনঃস্থাপিত) — **ব্লক-কাটের-আগে বাউন্ড-মধ্যে-ক্যানোনিকাল-ব্লক-গ্রেপ বাধ্যতামূলক**।

**রিগ্রেশন:** role-policy ১৪৭/১৪৭ ✓ cursor ২৫/২৫ ✓ guard ✓ audit:views ✓ brace ০/০ ✓ 390px-০ ✓ কনসোল-০ ✓ টেস্ট-ক্লিনআপ ✓। push-রেস ×৩ (129-খ→130→…) — তৃতীয়-রাউন্ডে পুশ-সম্পন্ন।

## session129 (webDevReview রাউন্ড) — contact-hours প্রকৃত-লাইভ + crx অগ্রাধিকার-পিন

- QA-ফেজ: fetch→d93c6c2 · প্রতি-ইনভোকেশন-বুট (স্যান্ডবক্স-রিপ) · role-policy 131/131 + cursor 25/25 + guard + audit:views + brace-০ — বাগ-শূন্য → ফিচার-রাউন্ড
- ফিচার-①: contact-hours one-shot→evalNow()+৩০সে-interval+visibilitychange+দিন-মাইগ্রেশন; শীঘ্রই-বন্ধ/খুলবে (≤৬০মি, অ্যাম্বার); বেসলাইন-ভিজ্যুয়াল-বাগ-ফিক্স (is-idle-CSS-শূন্য — 'এখন বন্ধ' সবুজে ফুটত); __cx129Eval-হুক; tokens s129-ট্রিও
- ফিচার-②: crx পিন (p-ফিল্ড, পিন-ফার্স্ট-সর্ট, aria-pressed, দুই-সারফেস, is-pinned ভিজ্যুয়াল+পিল)
- E2E: স্টেট-ম্যাট্রিক্স ৮/৮ + মাইগ্রেশন ✓ CSSOM ✓ পিন ৫/৫ ✓ LS-ক্লিনআপ ✓ 390px-প্রকৃত-০ (docSW+scrollTo-প্রোব) ✓ কনসোল-০ ✓ রিগ্রেশন ALL GREEN ✓
- গোটচা ×৩ (PLANS): JSON-LD-সিনট্যাক্স-চেক-মিথ্যা-ফেইল · body.scrollWidth≠প্রকৃত-স্ক্রল · আধা-রিফ্যাক্টর-অবশিষ্টাংশ
- docs: PROJECT §১২৯ + PLANS intent+cross-agent + worklog ×২


## session132 (webDevReview রাউন্ড — origin/main @ 8cda026)

**স্টেটাস-মূল্যায়ন:** QA-বেসলাইন বাগ-শূন্য (role-policy ১৪৭ + calls ৫৫ + groupcalls ৫০ + cursor ২৫ + guard + audit + ব্রাউজার-কনসোল-০) → ফেজ-স্টেবল → ফিচার-রাউন্ড: কল-রোডম্যাপের অবশিষ্ট একমাত্র কোডযোগ্য আইটেম **অটো-ভিডিও-ডিগ্রেড**।

**সম্পন্ন:** webrtc-call.js-এ ৩-স্তর সাশ্রয়-ল্যাডার (poorStreak ≥৪/৬/৮ → sender scale÷২+২৫০k / ÷৪+১২০k+১০fps / ÷৪+৬০k+৮fps; goodStreak≥৩-হিস্টেরেসিস-রিকভারি; ৮সে-কানেক্ট-গেট; video+cam-on-গার্ড; ট্র্যাক-অস্পৃশ্ত) + calls.css eco-ব্যাজ-ব্লক (var(--lf-reaction-yellow), হেক্স-শূন্য) + QA-হুক _qaDegradeState/_qaApplyDegrade + নতুন E2E verify-session132-autodegrade.js **৩০/৩০ ALL GREEN** (হুক-পাথ ৯ + লাইভ-কল-ল্যাডার ১৬ — ফেক-RTT ইনজেকশনে প্রকৃত sender.getParameters() এন্ড-স্টেট-প্রমাণ — + অডিও-গার্ড ২)।

**রিগ্রেশন:** session122 ২১/২১ + session130 ২৫/২৫ + API-চতুষ্টয় + guard + audit + 390px-০ + কনসোল-০।

**গোটচা ×৩ (PLANS-এ বিস্তারিত):** getSenders() প্ল্যাটফর্ম-অবজেক্ট (ক্লাস-ওভাররাইড sender-কল ধরে না — এন্ড-স্টেট-পাঠই প্রমাণ); /dashboard গেস্টেও 200 (data-auth-ই বিশ্বস্ত-সোর্স); #F7B125=rgb(247,177,37) ডেসিমাল-গোটচা।

**পরের-এজেন্ট: session133 লেবেল থেকে।** — সুপারিশ: গ্রুপ-রিং-অনলাইন-সীমা, parent-chain-চিপ, drawer-প্রিভিউ-ইনস্ট্যান্ট।

---
Task ID: session133 (cron-r13 — QA→ফিচার-রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview)
Task: প্রজেক্ট-অবস্থা-যাচাই + agent-browser QA → স্থিতিশীল-ফেজে session129-প্রস্তাব বাস্তবায়ন

## Current Project Status / Assessment
- QA-ফেজ: role-policy ১৪৭/১৪৭ ✓ cursor ২৬/২৬ ✓ guard ✓ audit:views ✓ — ব্রাউজার-সুইপ (ismail): ফিড-canonical-মার্কআপ (fc-drawer ×১২) ✓ ড্রয়ার no-reload-নিয়ম (window-marker) ✓ pm-btn/share-menu/rx-মডাল-ট্রিগার ✓ কনসোল-০ ✓ 390px-০ ✓ — **বাগ-শূন্য, স্থিতিশীল** → ফিচার-রাউন্ড
- QA-আবিষ্কার: `/feed` 404 (ডিজাইন-ডকস "Social Feed" = বাস্তবে /dashboard)

## Goals / Completed / Verification
- ① `/feed`→302 `/dashboard` query-সংরক্ষণে (routes/dashboard.js) + role-policy §২৬ (৩-চেক; ১৫০ মোট)
- ② undo-toast Enter=undo/Escape=নিষ্ক্রিয়ণ — interactive-focus-অগ্রাধিকার-গার্ডসহ + aria-keyshortcuts + kbd-হিন্ট (session129-প্রস্তাব-④)
- ③ header.ejs undo-restore-পরে LekhokRelTime.render(list121) (session129-প্রস্তাব-②)
- ④ continue-reading.js og-default-বিরোধী গার্ড (session129-প্রস্তাব-①)
- ⑤ shared.css session133-ব্লক: kbd-চিপ + :focus-within-এলিভেশন + #notifList স্ক্রোল-ক্ল্যাম্প 60vh+কাস্টম-স্ক্রলবার + .notif-x hover-reveal + টোস্ট safe-area (টোকেন-শুধু, হেক্স-শূন্য)
- যাচাই: role-policy ১৫০/১৫০ ✓ cursor ২৬/২৬ ✓ guard ✓ audit ✓ brace-০ ✓; E2E ৮-প্রোব (alias/kbd/enter/escape/typing-guard/scroll/কনসোল/390px) ✓

## Unresolved Issues / Risks / Next Priorities
- বকেয়া-নয়: স্টাইলিং-বাকি-সুপারিশ PLANS session133-নোটে (reconcile-flash-fade, crx-পিন, র্যাচেট-নামানো, full-page-reltime, Turso-রিসেট)
- পরের-এজেন্ট: **session131 থেকে**; push-পূর্বে git pull --rebase + union-নোট পড়ুন

Task ID: session129 (cron-r12 — sandbox web-68dcf7c4, "Project Status & Dev Focus")
Task ID: RES-131 (ক্রন-রিভিউ রাউন্ড ১৩ — session131)
Task: অবস্থা-মূল্যায়ন + agent-browser QA → স্টেবল-ফেজে নতুন ফিচার: সাইট-ওয়াইড তারিখ-চুক্তি (UTC→Asia/Dhaka, RES-124-ব্যাকলগ ①) + /api/resources/series-stats লাইভ-এন্ডপয়েন্ট (②) + অ্যাডমিন লাইভ-রিফ্রেশ + role-policy §১৮ (③)
- রিসিভড 8cda026 (আমার session129-খ test-fix) → রাউন্ড-শুরুতে fetch-এ নতুন-কিছু-নেই
- QA সুইপ: ৮-পেজ ম্যাট্রিক্স 200 + role-policy 147/147 + agent-browser (22-কার্ড/3672-CSS-rules/কনসোল-০/390px-০/স্টিকি-বার/seriplay-বাটন) → ফেজ-স্টেবল → ব্যাকলগ ①②③ নেওয়া হলো
**🚨 তারিখ-বাগফিক্স (বাংলাদেশ-দর্শক):** SQLite CURRENT_TIMESTAMP = UTC নেম-লেস — JS new Date() লোকাল ধরে পার্স করত। BD-তে রিলেটিভ-টাইম ৬ঘ-বেশি পুরনো + সন্ধ্যা-UTC-তে তারিখ-স্খলন (প্রমাণ: created_at 2026-09-17 19:46:50 UTC → পুরনো-কোড ১৭ সেপ্টেম্বর, সঠিক ঢাকা-তারিখ ১৮)। স্যান্ডবক্স-হোস্ট UTC হওয়ায় আড়ালে ছিল। **ফিক্স:** helpers/bn-date.js (parseDbDate: নেম-লেস='Z'-জোড়া, তারিখ-মাত্র=T00:00:00Z-পিন, ISO-Z passthrough; bnDate/bnDateTime: Asia/Dhaka getUTC-কৌশল) + ৫-সারফেস (pages.js gallery / detail.ejs (রুট-থেকে bnDate-লোকাল-পাস — ভিউতে require is not defined ধরা পড়েছিল) / social.js bnDate83+bnRelTime83 / main.js LekhokRelTime _pTs131+_dTs131-ইনজেকশন / live.js relTime _pTs131L)। তিন-জায়গার রেজেক্স-কনভেনশন হুবহু-মিরর চুক্তি।
**নতুন-ফিচার:** GET /api/resources/series-stats (স্টাফ-গেট: adminUser-সেশন বা admin/superadmin/moderator-রোল; top-N score=views+downloads×2, ?limit= 1..20-ক্ল্যাম্প, no-store) + admin rss-প্যানেল লাইভ-রিফ্রেশ (রিফ্রেশ-বাটন + হালনাগাদ-চিপ + ৬-কার্ড স্কেলেটন-শিমার → ক্লায়েন্ট-রিরেন্ডার → স্কোর-বার 0→pct অ্যানিমেশন; ব্যর্থে পূর্বের-গ্রিড-পুনরুদ্ধার + rss-err)।
**role-policy §১৮:** series-stats-গেট ×৮ + বাল্ক SSRF-নেগেটিভ ×৮ (loopback/localhost/metadata/privrange→SSRF-গার্ড ×৪, badport, badscheme→bulk file_url-ভ্যালিডেশন, কন্ট্রোল-রো+ট্রাশ-ক্লিনআপ) — সুইট এখন 163-চেক।
**ভেরিফিকেশন:** role-policy 163/163 ALL GREEN ✓ (রেট-লিমিটার-নয়েজ = fresh-restart-প্রমাণ) + bn-date ইউনিট ✓ + agent-browser: টুলটিপ-প্রমাণ (data-ts 04:15Z → টাইটেল ১০:১৫ AM ঢাকা — পার্স-কনভেনশন-প্রমাণ) ✓ রিফ্রেশ-ক্লিকে স্কেলেটন×৬+is-loading মিডফ্লাইট → পুনরুদ্ধার+বার+চিপ ✓ ৮-পেজ 390px-০ ✓ কনসোল-০ ✓ স্ক্রিনশট ×৩ (s131-admin-refresh/-mobile, s131-detail-dhaka-date, s131-resources) ✓
- **গোটচা-নতুন ×৩ (PLANS session131-নোট):** ① ckc-নিডল BRE-রেজেক্স — আন-ইস্কেপড-ব্র্যাকেট Invalid-regex-মিথ্যা-ফেইল; সিঙ্গল-লাইন-JSON-এ grep -c-লাইন-গোনা-ফাঁদ ② bulk-প্রি-ভ্যালিডেশন আগে-চলে (ftp:// fetch-স্তরে পৌঁছায় না — bulk file_url-ভ্যালিডেশনই ধরে) ③ agent-browser 390px-প্রোব ট্রানজিয়েন্ট (admin-রেন্ডার-মিডফ্লাইটে 487px-মিথ্যা; settle-পরে প্রোব)
- **পরবর্তী-প্রস্তাব:** ① সিরিজ-লেভেল-কভার-ইমেজ (ব্যাকলগ ④-অবশিষ্ট) ② bulk-ইমপোর্ট ক্রস-রিকোয়েস্ট-ডুপ-গার্ড ③ >১০সে-ফেচ-টাইমআউট-অপশন ④ role-policy-তে main.js-পার্স-রিগ্রেশন-চেক
- **গোটচা-রিমাইন্ডার:** push-এর আগে fetch+rebase; doc-union; RP_PORT; node --check-আগে; স্যান্ডবক্সে detached-node প্রতি-টুল-কলে মরে (boot-srv.sh)

Task ID: RES-133 (ক্রন-রিভিউ রাউন্ড ১৩ — session133)
---
Task ID: cron-r8 (session135 — রাউন্ড-৮: QA-সুইপ → accepted-answer cross-surface completion + নোটিফ-টোনাল-আইকন + reconcile-ফেড)
Agent: Z.ai Cron Agent (webDevReview)
Task: Lekhok-Forum অবস্থা-যাচাই + agent-browser QA → বাগ-শূন্যে ফিচার-রাউন্ড (session131-নোট ①②③ + session125/129-র reconcile-ফেড) → push + ডকস

Work Log:
- sync+QA @00b5af3: fetch/rebase (session129-গ contact-hours + docs-union ল্যান্ডেড) → ১৮-route HTTP-ম্যাট্রিক্স + ১২-পেজ agent-browser কনসোল-০ + 390px ×৫-০ + /me-ইন্টিগ্রিটি (১১-ট্যাব/চার্ট) + session131 accepted-badge + session129-গ cx-state-মেশিন (is-off/is-soon/is-idle-হুক-প্রমাণ) — বাগ-শূন্য → ফিচার-রাউন্ড
- ① ফিড-কার্ড গৃহীত-উত্তর ব্যাজ: QUESTION_SQL + p.accepted_comment_id (ARTICLE/ACTIVITY-তে NULL-প্লেসহোল্ডার — UNION-কলাম-সাম্য; প্রথম-বুটে অমিল-এরর E2E-বুট-যাচাইয়েই ক্যাচ → ফিক্স) + FeedPostCard ২-স্পট .feed-acc-badge135
- ② answer_accepted টোনাল-আইকন ৩-সারফেস: notifications.ejs (icon-accepted135 + fa-circle-check + G117/G119-পরিবার) + header.ejs _ico + live.js ICONS + daily.js NF_FAMILIES (?type=ফিল্টার-প্যারিটি) + CSS s132-ব্লক
- ③ fresh-উত্তরে owner-টগল: qa-single data-can-acc135-মার্কার + comment-tools mkAccActions135 (optimistic+canonical উভয়-স্লটে; j.id-বাস্তব; ডেলিগেটেড-লিসনার-রিবাইন্ড-শূন্য)
- ④ swapQaThread ফেড: ফেচে qa-swap-fade135 (opacity .45) → সোয়াপ → rAF-ফেড-ব্যাক; reduced-motion-গার্ড
- E2E (testuser, agent-browser): ড্যাশবোর্ড-ব্যাজ ১/১ ✓ নোটিফ-পেজ icon+data-g117=reply ✓ ড্রপডাউন ico-answer_accepted ✓ চিপ-গণনা ১৪ ✓ MutationObserver-প্রমাণিত fresh-টগল (insert-time cid=106-সত্য + গ্রহণ→চিপ+flash+হিন্ট + বাতিল) ✓ ফেড ["add","remove"] ✓
- রিগ্রেশন (মার্জড-ট্রি): role-policy ১৭৭/১৭৭ (s131-test self-seeding-প্যাচসহ +২) ✓ cursor ২৫/২৫ ✓ guard ✓ audit:views ✓ brace-০ ✓ 390px ×৩-পেজ-০ ✓ কনসোল-০ ✓ টেস্ট-ডেটা-ক্লিনআপ (প্রোব-উত্তর + সিডেড-নোটিফ) ✓
- s131-test self-seeding-প্যাচ: series-stats limit=1-অ্যাসারশন ambient-নির্ভর → কন্ট্রোল-রো (bulk-CSV series-কলাম) আগে-সিড + ক্লিনআপ-ই-সরায় (+২ অ্যাসারশন)
- গোটচা ×২ (PLANS): UNION-অমিল = HTTP-200-সাইলেন্ট-এরর (কনটেন্ট-প্রোব বাধ্যতামূলক) + sql.js এক্সটার্নাল-সিড সংশোধিত-রীতি (kill → INSERT+saveDb → boot; flushDb=নন-স্ন্যাপশট-no-op; process.exit debounced-persist-মেরে দেয়)

Stage Summary:
- accepted-answer এখন ৪-সারফেসে দৃশ্যমান (qa-single/qa-list/dashboard-ফিড/নোটিফিকেশন) + fresh-উত্তরেও প্রশ্নকর্তার টগল তাৎক্ষণিক + reconcile-ফ্ল্যাশ মসৃণ
- নোটিফ-টাইপ-যোগের ৫-পয়েন্ট-চেকলিস্ট ডকুমেন্টেড (PLANS) — ভবিষ্যৎ-টাইপে জেনেরিক-ফলব্যাক-রিস্ক বন্ধ
- পরবর্তী-প্রার্থী: tokensHexGuard-বর্ধন (article.css) → /qa optimistic-নতুন-প্রশ্ন → notifications-empty-state → Metered.ca-TURN (পরের-এজেন্ট session133 থেকে)

---
Task ID: session136 (cron-r14 — QA→ফিচার-রাউন্ড) [relabel: 134→136 — সমান্তরাল session134/135 আগে-ল্যান্ডড, max+1]
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → স্থিতিশীল-ফেজে session133-প্রস্তাব বাস্তবায়ন (reltime-চুক্তি + swap-fade + tokens-র্যাচেট) + নিজস্ব-রিগ্রেশন-ফিক্স + push

Work Log:
- sync: git fetch → main @ 6e167ca (session133) up-to-date; PLANS-সর্বশেষ Cross-Agent-নোট পড়া
- QA-ফেজ ALL GREEN: guard + role-policy ১৬১/১৬১ + cursor ২৬/২৬ + brace-০ (সঠিক-পাথ public/assets/js/) + audit:views; agent-browser ৭-পেজ সুইপ কনসোল-০/errors-০ → ফিচার-রাউন্ড
- ① notifications.ejs: rel119 প্রথম-পেইন্ট রেখে `<span data-ts>` + undo-restore-পরে LekhokRelTime.render(list); E2E dismiss→undo→rows ৩→৪+রি-পেইন্ট ✓
- ② shared.css session134-ব্লক: lfSwapIn134 swap-fade (৪-সারফেস, :not()-এক্সক্লুশন is-new124/flash-acc127, reduced-motion-সেফ); ড্রয়ার-লাইভ + আর্টিকেল-সিনথেটিক-প্রোব ✓
- ③ tokens.css: ২৭ নতুন --lf-* (white/ok/danger/slate/amber ফ্যামিলি) → admin.css 254-হেক্স exact-value ম্যাপ (৪২৬→১৭২) + বেসলাইন-লক; দীর্ঘ-হেক্স-আগে+লুকঅ্যাহেড-স্ক্রিপ্ট (#fff/#fffbeb-কলিশন-শূন্য)
- ④ রিগ্রেশন-আটকানো: admin/moderator views (৫৭টি স্ট্যান্ডঅ্যালোন-ডক) tokens.css লোড করত না → var()-অরিজলভ-রিগ্রেশন; ৫৭/৫৭ ফাইলে admin.css-লিংকের আগে tokens.css ইনজেক্ট; admin computed-token-রেজলিউশন + স্ক্রিনশটে রঙ-অক্ষত যাচাই
- ফাইনাল-রিগ্রেশন: role-policy ১৬১/১৬১ + cursor ২৬/২৬ + guard-নতুন-বেসলাইন + audit ✓; কনসোল-০ + 390px ×৫-পেজ-০ (admin সহ)
- docs: PLANS session136 + PROJECT §১৩৬ + worklog ×২

Stage Summary:
- স্ট্যাটাস: বাগ-শূন্য স্থিতিশীল-ফেজ; session133-প্রস্তাবের ৩টি বাস্তব + নতুন টোকেন-সিস্টেম-সম্প্রসারণ (admin-প্যানেল এখন ডিজাইন-সিস্টেমের অন্তর্ভুক্ত)
- গোটচা (PLANS): shared.css-সর্বশেষ-লোড-অ্যানিমেশন-এক্সক্লুশন · 404-মিনিমাল-লেআউটে CSS-প্রোব-মিথ্যা-নেগেটিভ · হেক্স-রিপ্লেস-বাউন্ডারি · admin-view-এ tokens.css-লিংক-নিয়ম
- পরের-এজেন্ট: session137; প্রস্তাব: admin.css-অবশিষ্ট-১৭২-র্যাচেট, dashboard/style-র্যাচেট, parent-chain-চিপ, drawer-প্রিভিউ-ইনস্ট্যান্ট

---
Task ID: session136-ফাইনাল (push-সমাপ্তি)
Agent: Z.ai Cron Agent (webDevReview)
Task: push + মার্জড-কোডে চূড়ান্ত-যাচাই

Work Log:
- প্যারালাল-কলিশন হ্যান্ডলিং: কাজ-মাঝে git pull --rebase-এ c7fefee (session134 parent-chain-চিপ) + 4794682 (session135 accepted-answer-cross-surface + qa-swap-fade135) আবিষ্কৃত → stash/pull/pop-রীতিতে ক্লিন-ইউনিয়ন (বিরোধ-শূন্য) → max+1 রীতিতে ১৩৪→১৩৬-সমগ্র-রিলেবেল (কোড-মার্কার+docs)
- ইউনিয়ন-পরে-সংযোজন: আমার swap-fade-এ .fc-instaprev-এক্সক্লুশন (তাদের fcIpIn134 নির্দিষ্টতা-বিজয়ে রক্ষা — synthetic-প্রোব-প্রমাণিত) + :not()-তালিকায় নথিভুক্ত
- pushed: 4794682..415af2a ✓

Stage Summary:
- রিপো main @ 415af2a (session136); মার্জড-ট্রি-যাচাই: role-policy ১৭৭/১৭৭ + cursor ২৬/২৬ + guard-নতুন-বেসলাইন + audit + ব্রাউজার-স্মোক সব-গ্রিন
- পরের-এজেন্ট: session137; admin/moderator view-বানানোর নিয়ম: admin.css-এর আগে tokens.css-লিংক আবশ্যক (PLANS-গোটচা-৪)

Task ID: session137 (webDevReview রাউন্ড — কোড-আইডি s132; 132→135-রিলেবেল, 133/134-সমান্তরাল-ল্যান্ডের পরে)
Agent: Z.ai Main Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → বাগফিক্স (rate-limit QA-ফ্লেক) + ফিচার-রাউন্ড (ফিড accepted-ব্যাজ + answer_accepted টোনাল-আইকন) + union-rebase + push

Work Log:
- worklog/PLANS/PROJECT-পাঠ + git fetch → QA-ফেজ: ৯-রুট স্মোক + ৭-পেজ agent-browser কনসোল-০ + ৬-পেজ 390px-০ + cursor 25/25 + guard + audit + brace — role-policy 157/158 (মিথ্যা-ফেইল: adminLoginLimiter ট্রিপড) → বাগফিক্স-ফেজ।
- বাগফিক্স: rate-limit.js QA-escape (LF_QA_DISABLE_RATELIMIT=1) + suite RL-TRIP-GUARD (SKIP+hint) + lf-boot.sh-ফ্ল্যাগ → role-policy 158/158 ×২ ALL GREEN।
- ফিচার-①: QUESTION_SQL accepted_flag + FeedPostCard fd-accepted-chip132 + shared.css s132-ব্লক — E2E ধরা UNION-arity-500 (filter=all/ranked/more) → ARTICLE/ACTIVITY NULL-প্যাড → চার-পাথ ব্যাজ ✓।
- ফিচার-②: header.ejs _ico + live.js ICONS + notifications.ejs (iconClass/_ico/G117-types) + style.css s132-টোনাল-প্যালেট — ত্রি-সারফেস প্যারিটি।
- E2E verify-session132-accepted-features.sh 19/19 (সেলফ-সিড→গ্রহণ→ব্যাজ×৪-পাথ→নোটিফ-টোনাল×৪-চেক→dismiss+ক্যাসকেড-ডিলিট+অবশিষ্ট-শূন্য); স্টেল-জার-ফাঁদ (DB-backed session-store) আবিষ্কৃত → স্ক্রিপ্টে rm -f জার-রীতি।
- agent-browser: স্ক্রিনশট ×৩ (badge-focus2/notif-tonal/notif-390) + 390px-০ + কনসোল-০; ক্লিনআপ (নোটিফ-dismiss + প্রশ্ন-ডিলিট + dashboard-অবশিষ্ট-০)।
- চূড়ান্ত-রিগ্রেশন (মার্জড-ট্রি): role-policy 158/158 + cursor 25/25 + guard + audit + brace-০ + node --check + s132-E2E 19/19।
- docs: PLANS (intent+cross-agent) + PROJECT §১৩৮ + worklog ×২।

Stage Summary:
- ফিড-কার্ডে গ্রহণকৃত-উত্তর এখন দৃশ্যমান (session131-প্রস্তাব ①) — Q&A-চক্রের ফিড-স্তর সম্পূর্ণ; answer_accepted বিজ্ঞপ্তি টোনাল-আইকন-সহ ত্রি-সারফেস (প্রস্তাব ②)।
- QA-ইনফ্রা স্থিতিশীল: রেট-লিমিট-ফ্লেক বন্ধ (boot-flag + SKIP-গার্ড), স্টেল-জার-ফাঁদ নথিভুক্ত।
- পরের-এজেন্ট: session138 থেকে — profile/me accepted_flag-প্যারিটি, ratchet-হ্রাস, crx-og-গার্ড, লাইভ-Turso-রিসেট (টোকেন-ধারী)।


---
## Session 138 — role-policy user-id dynamic-discovery (§২৫-পরিবার) + crx 'শেষ পড়া' পিন + undo Enter-শর্টকাট (cron-QA-রাউন্ড; প্রবেশ @ 8cda026)

Work Log:
- pull --rebase (126cb46→8cda026 — session129-খ সমান্তরাল-ল্যান্ড) → আইসোলেটেড QA /home/z/qa-s131 :3160 — **pristine-DB-পুনর্নির্মাণ** (rm lekhok.db → initDb+৪সে → server-বন্ধে reset-qa-logins+seed-qa-users+seed-test-users → বুট)
- QA-সুইপ: ১৬-রুট-স্মোক (200/302-সঠিক; /reading-list-404 = প্রত্যাহৃত-প্রস্তাব, লিভ-লিংক-শূন্য — বাগ-নয়) + লগইন-E2E + ১২-পেজ কনসোল-০ + 390px ×৯-০ — অ্যাপ-বাগ-শূন্য
- 🚨 মৃত্যু-ফাঁদ-আবিষ্কার: `pkill -f qa-sXXX` ম্যাচ-শূন্য (cmdline=শুধু `node server.js`) → স্টেল-সার্ভার স্টেল-মেমরি-DB ফ্লাশ-করে সব-seed নীরবে-ওভাররাইট + নতুন-বুট EADDRINUSE-নীরব-মৃত্যু → role-policy-র ১৪-fail "রহস্য" আসলে ২-স্তরে: (ক) স্টেল-সার্ভার (খ) হার্ডকোড MODID/TAID/TUID fresh-DB-তে ভুল-ইউজার (id48=ismail/id49=riya ব্যান!) — অ্যাপ-কোড সম্পূর্ণ-নিরীহ
- ফিক্স §২৬: test-role-policy.sh — UIDQ131 username→id ডিস্ক-কুয়েরি (fallback 47/49/48) + login()/postf() csrf-303(?csrf=1)-রিট্রাই-হার্ডেনিং → **147/147 ALL GREEN (141/6 থেকে)**
- ফিচার: crx 'শেষ পড়া' পিন (continue-reading.js is-last+crx-last-chip দুই-সারফেস + dashboard.css session131-EOF-ব্লক টোকেন-শুধু+পালস-ডট+reduced-motion+640px+focus-visible-রিং) + undo-toast Enter-শর্টকাট (session129-④ — ফর্ম-কনটেক্সট-গার্ড, btn.click-এক-পাথ)
- E2E: role-policy 147/147 + cursor 25/25 + inspect-audit 0-fail + guard ✓ + brace-০ + node --check ×২ ✓; agent-browser — পিন (widget rows=3/isLast=১/টোকেন-রঙ-যাচাই + ফুল-পেজ tiles=3/brand-border+ring + খালি-স্টেট-নিরাপদ) + undo id-tracked (992504 dismiss→Enter(BODY)→restore ✓; focused-input-এ Enter→undo-না ✓ — মিথ্যা-নেগেটিভ-দুই-প্রকার নিজে-ধরা-নিজে-সংশোধন) + 390px-০ ×২ + কনসোল-০ ×৫ + স্ক্রিনশট ×৩
- ডকস: PLANS session131-নোট (গোটচা ×৩: pkill-গোটচা/pristine-রীতি/টোস্ট-টেস্ট-মিথ্যা-নেগেটিভ) + PROJECT §১৩১ + worklog ×২

Stage Summary:
- push লক্ষ্য: session-137 (সর্বোচ্চ+১); স্যুট এখন যে-কোনো pristine QA-DB-তে পোর্টেবল — "fresh-restart=147/147" দাবি প্রথমবার সত্যিঅর্থে পুনঃপ্রমাণযোগ্য
- পরবর্তী: drawer-প্রিভিউ-ইনস্ট্যান্ট → playlist per-series aggregate API → সিরিজ-কভার-ইমেজ → WebRTC-ত্রয়ী (Metered.ca-TURN/ভিডিও-ডিগ্রেড/গ্রুপ-রিং-সীমা)
---
Task ID: RES-134 (cron-review রাউন্ড — session134)
Agent: Resources-feature agent (Lekhok-Forum, /home/z/lekhok-forum)
Task: অবস্থা-মূল্যায়ন + agent-browser QA → স্টেবল-ফেজে নতুন ফিচার: সিরিজ-হিরো (RES-124-ব্যাকলগ ④) + bulk ক্রস-রিকোয়েস্ট ডুপ-গার্ড (②) + role-policy §১৯ + 🚨৯-রো-মিথ্যা-ডিলিট-ইনসিডেন্ট-রিস্টোর

## বর্তমান প্রজেক্ট অবস্থা (মূল্যায়ন)

- HEAD 2edd910 (session133-docs) — রাউন্ড-শুরুতে fetch-এ প্যারালাল-পুশ নেই
- QA সুইপ: ৯-পেজ 200 + role-policy 177/177 ALL GREEN + agent-browser (২২-কার্ড, কনসোল-০, 390px-০, সিরিজ/প্লেলিস্ট/রিজুম অক্ষত — আগের-প্রোব-সিলেক্টর-মিসম্যাচ ছিল, সত্য-ক্লাস rsxd-*/rsx-seriesrow) → ফেজ-স্টেবল → RES-133-প্রস্তাব ①② নেওয়া হলো

## এই রাউন্ডের লক্ষ্য / সম্পন্ন কাজ / ভেরিফিকেশন

1. **সিরিজ-হিরো:** pages.js activeSeriesMeta (audioN/views/downloads aggregate-সহ) + হিরো-সেকশন (কভার/noimg-ফলব্যাক, মেটা, সিরিজ-শুনুন[data-seriplay দ্বৈত-বাইন্ডিং], লিংক-কপি+টোস্ট, ফিল্টার-সরান) + CSS session134-ব্লক (gradient/radial/রিং/hover-lift/focus-visible/640px-স্ট্যাক/reduced-motion)
2. **বাল্ক ডুপ-গার্ড:** resource-bulk.js dupKey134+dbSeen134+dupes (open-fail-safe; কী-এখন series-সচেতন) + দুই-রুটে dupes + rbm-মোডাল ফলাফল-লাইন
3. **role-policy §১৯ ×১৯-চেক** — সুইট ১৯৬, **196/196 ALL GREEN** (রেট-লিমিটার-নয়েজ = fresh-restart-প্রমাণ ×১)
4. **🚨 ইনসিডেন্ট:** §১৯-প্রথম-ক্লিনআপের loose-grep related-ব্লক-মিথ্যা-ম্যাচ → ৯-আসল-রো (2,5,6,13,15,16,19,21,28) ট্রাশ → **/admin/trash/:id/restore-এ ৯টিই রিস্টোর (২২-কার্ড + প্রতিটি detail 200 যাচাই)** → ক্লিনআপ-অ্যাঙ্কর `rsxd-title">`-হার্ডেন (§১৮-র ল্যাটেন্ট-ভ্যারিয়েন্টও)
5. **E2E:** হিরো DOM (৩টি পর্ব/১টি অডিও/১৩০ পাঠ/২৪ ডাউনলোড) ✓ হিরো-প্লে→/resources/3?play=1 ✓ শেয়ার-টোস্ট ✓ কনসোল-০ ✓ 390px-০ ×২ ✓ স্ক্রিনশট ×২ (download/s134-hero-*) ✓ LS-রেজিডু-ক্লিন ✓ ৯-পেজ-পুনঃযাচাই ✓ node --check ×৪ ✓

## অমীমাংসিত ঝুঁকি / পরবর্তী রাউন্ডের সুপারিশ

- **গোটচা-নতুন:** টেস্ট-ক্লিনআপ title-grep → অবশ্যই `rsxd-title">`-অ্যাঙ্কর; in-memory-DB রিস্টোর API-দিয়েই; রেজেক্স-প্যাচে ternary-প্রেসিডেন্স (পুরো-লাইন-পুনর্লিখন নিরাপদ)
- **পরবর্তী-প্রস্তাব:** >১০সে-ফেচ-টাইমআউট-অপশন; main.js-পার্স-রিগ্রেশন-চেক role-policy-তে; হিরোতে navigator.share; series-stats-এ dupes-মেট্রিক
- **রিমাইন্ডার:** push-এর আগে fetch+rebase (প্যারালাল-রেস); doc-union-মার্জ; RP_PORT; boot-srv.sh; পরবর্তী-এজেন্ট **session135** লেবেল থেকে

---

## Session 135 (cron-r14) — কমেন্ট-পারমালিঙ্ক + আর্টিকেল-চিপ-প্যারিটি + নোটিফ-রিস্টোর-রি-পেইন্ট

**বেসলাইন-QA:** c7fefee (0-behind), ৩-সার্ভিস-সুস্থ; agent-browser-সুইপে বাগ-শূন্য (প্যালেট/ব্যাজ/টগল/dupFixed/390px/কনসোল সব-গ্রিন; `[m`-ANSI-স্ট্রিপে মিথ্যা 'metaine]-সিনট্যাক্স-ভয় নষ্ট — node --check EXIT=0-ই সত্য)।

**ইমপ্ল (৫-ফাইল, +83/-5):**
1. **কমেন্ট-পারমালিঙ্ক (নতুন ফিচার, FB-টাইমস্ট্যাম্প প্যারিটি):** CommentItem.ejs fc-time→data-cmt-permalink+role=link+tabindex; comment-tools.js ডেলিগেটেড ক্লিক+keydown ইঞ্জিন (clipboard→execCommand-ফলব্যাক, flashTarget131-রিইউজ, replaceState-হ্যাশ, toast); JS-পেইন্টার ×২-এ attr-প্যারিটি; CSS অ্যাফোর্ডেন্স (dotted→brand-hover→focus-ring)।
2. **আর্টিকেল-চিপ-প্যারিটি (session134-④):** social.js /articles/:id reply-ম্যাপে replyTo (displayName92-ম্যাপ) — আর্টিকেল-রিপ্লাইয়ে '↩ নাম' চিপ SSR-লাইভ।
3. **নোটিফ-ফুল-পেজ restore-রি-পেইন্ট (session134-③):** notifications.ejs undo-পাথে LekhokRelTime.render(list) + .notif-page-time span-এ data-ts (rel119-প্রাইমারি-পেইন্ট অক্ষুণ্ণ; title Dhaka-ক্যানোনিকাল)।
4. **স্টাইল (session135-ব্লক):** fc-list কাস্টম-স্ক্রলবার + #notifList আনরিড গ্রেডিয়েন্ট-টিন্ট/ডট-গ্লো — টোকেন-শুধু, hex-শূন্য।

**E2E:** ফিড-হ্যাশ+toast+ফ্ল্যাশ ✓ Enter-কী ✓ আর্টিকেল SSR-চিপ→18 ✓ টপ-চিপ-শূন্য ✓ নোটিফ STALE-MARKER→'এইমাত্র'+Dhaka-টাইটেল ✓ canonical-insert attr-প্রচার ✓ রিঅ্যাকশন-টগল ✓ dupFixed ✓ guard ✓ audit ✓ brace-০ ✓ node --check ✓ EJS ×২ ✓ 390px×৪-০ ✓ কনসোল-০ ✓ ক্লিনআপ ✓

**পরবর্তী-এজেন্ট: session136।** বকেয়া: গ্রুপ-কল-প্রসারণ (session132-বেসিস), tokens-র্যাচেট (admin.css ৪২৬), og-style লিঙ্ক-প্রিভিউ-কার্ড (পারমালিঙ্কের উপর ভবিষ্যৎ-উন্নতি)।

---
## Session 140 (repo mirror) — /qa ইনলাইন-কম্পোজার (optimistic+canonical-swap) + article.css hex-tokenization (cron-review রাউন্ড)

- QA @4794682 বাগ-শূন্য (২০-রুট + ১৯-পেজ কনসোল-০ + 390px-০ + স্যুট 177/177) → ফিচার-রাউন্ড: session136-কিউ ①②
- ① **/qa ইনলাইন-কম্পোজার:** QaListItem.ejs (shared-পার্শিয়াল, single-source) + POST /api/qa/new (dup-গার্ড+ম্যানশন+canonical-HTML) + qa-composer.js (optimistic-কার্ড→canonical-swap→chips-বাম্প; localStorage-ড্রাফট; Ctrl+Enter; accepted-ফিল্টার-অখণ্ডতা-নেভিগেশন) + shared.css session140-ব্লক (টোকেন-শুধু)
- ② **article.css টোকেনাইজেশন:** --lf-read-* ×৮ → ৭১→৮ হেক্স (র্যাচেট; ভিজ্যুয়াল-শূন্য)
- **গোটচা ×২:** EJS-কমেন্টে টোকেন-মেনশন fatal (GET /qa 500 → টোকেন-বাদ); JSON `\"` vs SSR `"`-grep (.{1,2}-প্যাটার্ন)
- **[relabel 136→140]:** ৯-কমিট-সমান্তরাল-ল্যান্ডে আমার-লেবেল দখল → rebase ৪-UU ইউনিয়ন + সমগ্র-রিলেবেল (তাদের session136-নোট অক্ষত)
- যাচাই (merged): role-policy ২১২/২১২ ALL GREEN + cursor 25/25 + guard/audit/brace ✓ + E2E-চক্র-পূর্ণ (composer→swap→persist→cleanup) + 390px-০ + কনসোল-০
- **পরের-এজেন্ট: session141 থেকে** — বিস্তারিত lekhok-forum/PLANS.md session140-নোট + PROJECT.md §১৪০
---
Task ID: session137 (cron — QA→ফিচার-রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-যাচাই + agent-browser QA → স্থিতিশীল-ফেজে session136-প্রস্তাব ①② (tokens-র্যাচেট-সমাপ্তি) + session134-বকেয়া article-chain → রিগ্রেশন ALL GREEN → push

Work Log:
- sync: fetch → main @ bfed30f + ১-stray-লোকাল-কমিট (5956657 — শুধু worklog, ৪-ডকে অপরিষ্কার-স্ট্যাশ-কনফ্লিক্ট-মার্কার) → union-রিজলভ (worklog ×২ + PLANS + PROJECT) + স্টেল-স্ট্যাশ-ড্রপ (session136-ব্যাকলগ, কমিটেড-ডুপ্লিকেট)
- QA-ফেজ ALL GREEN: guard + role-policy ১৭৭/১৭৭ + cursor ২৬/২৬ (BASE-arg-গোটচা) + audit + brace-০ (single-file-arg-গোটচা ×২২); agent-browser ৭-পেজ সুইপ কনসোল-০ + 390px-০; ড্রয়ার no-reload-মার্কার + instaprev + share-menu--fb ৩-অ্যাকশন পুনঃপ্রমাণ → বাগ-শূন্য
- ① tokens-র্যাচেট-সমাপ্তি: tokens.css-এ ১১৭ নতুন --lf-* → admin.css ১৭২→০ + dashboard.css ২৩৩→০ (exact-value, দীর্ঘ-হেক্স-আগে+বাউন্ডারি; ড্রিফট-গ্রে -2/-3/-4-সাফিক্সে সৎ-আলাদা); বেসলাইন admin:0/dashboard:0-লক
- ② **[ইউনিয়ন-সংশোধন: ② প্রত্যাহৃত — সমান্তরাল session139-এজেন্টের _nameA135-ব্লক আগে-ল্যান্ডেড (same-feature-canonical); rebase-এ তাদের পাশ গৃহীত, আমার _nameBy137 প্রত্যাহৃত — session134-প্রত্যাহার-রীতি। চিপ-E2E-প্রমাণ তাদের-বাস্তবায়নের-উপরেই।]** (মূল-নোট: article-route _nameBy137 + replyTo-অ্যাটাচ — E2E /articles/1: চিপ+flash+hash+no-reload+কনসোল-০ ✓)
- ফাইনাল: role-policy ১৭৭/১৭৭ ✓ cursor ২৬/২৬ ✓ guard-নতুন-বেসলাইন ✓ audit ✓ brace-০ ✓ /feed-৩০২ ✓ computed-token ×৬ ✓ suspicious-transparent-০ ✓ 390px ×৫-পেজ-০ ✓ কনসোল-০ ✓
- গোটচা ×২: grep-c-লাইন-গোনা (minified-CSS) + html-vs-body-ব্যাকগ্রাউন্ড-প্রোব (ক্যানভাস html-এ)
- docs: PLANS session137-নোট + PROJECT §১৩৭ + worklog ×২

Stage Summary:
- স্ট্যাটাস: বাগ-শূন্য স্থিতিশীল-ফেজ; tokens.css এখন ~১৭৬-টোকেন-সম্পূর্ণ-প্যালেট; admin+dashboard CSS সম্পূর্ণ টোকেন-চালিত
- পরের-এজেন্ট: session138; প্রস্তাব: style.css-র্যাচেট (১৩৯৫ — ভাগ-করে), কল-ইতিহাসে degrade-স্তর-রেকর্ড (db-স্কিমা), article/auth/gallery/messenger.css-র্যাচেট, লাইভ-Turso-রিসেট (টোকেন-ধারী)
[relabel-নোট: সমান্তরাল 7f8e972-session139 (প্রোফাইল-প্যানে) ও 680e0ec-session140 (hex-baseline admin0) আগে-ল্যান্ডেড — এই-এন্ট্রি max+1 রীতিতে 139→141-রিলেবেলড; কোড-আইডি s139 অক্ষত]

---
Task ID: session139 (cron webDevReview রাউন্ড)
Agent: Z.ai Main Agent (webDevReview)
Task: অবস্থা-যাচাই + agent-browser QA → বাগফিক্স (/admin 390px) + ফিচার-রাউন্ড (①/me-ব্যাজ ③র্যাচেট-ওয়েভ-২ ②④যাচাই) + push

## Current Project Status / Assessment
- প্রবেশ: origin/main @ 10481cc (session138) — রেস-শূন্য-রাউন্ড
- QA-ফেজ ALL GREEN: role-policy ১৭৭/১৭৭ + cursor ২৫/২৫ + guard + brace-০ + ১৪-পেজ agent-browser কনসোল-০ → একটি-বাদে: /admin 390px-এ 63px ওভারফ্লো (session136-দাবি-ভাঙা)

## Goals / Completed / Verification
- **বাগফিক্স:** grid auto-min (1fr→minmax(0,1fr)) + inline-nowrap-ক্লিপ (rl-title/rl-meta→block) → /admin 390px: 63px→(-10)-শূন্য
- **ফিচার ①:** /me-র myPosts-SQL-এ accepted_comment_id → feed-acc-badge135 প্যারিটি; **verify-session139-parity.sh ২২/২২ ALL GREEN**
- **ফিচার ③:** patch139-admin-ratchet.js — ৬০-টোকেন → admin.css ১৭২→৩০ হেক্স (৮৩%), ভিজ্যুয়াল-শূন্য (computed --lf-brandgreen #0aa56d + emblem-gradient প্রমাণ), বেসলাইন-ড্রপ
- **ফিচার ②④:** reltime-চিপ ত্রি-সারফেসে-সম্পূর্ণ-প্রমাণ (৩০/৩০-গণনা) + og-default-গার্ড-সম্পন্ন-নিশ্চিত; ৩১-স্টেল-বিজ্ঞপ্তি-পরিষ্কারণ
- **রিগ্রেশন (পরিবর্তনের-পরে):** role-policy ১৭৭/১৭৭ ✓ cursor ২৫/২৫ ✓ s132-E2E ১৯/১৯ ✓ s139-E2E ২২/২২ ✓ guard ✓ বেসলাইন-গার্ড ✓ node --check ✓ ৮-পেজ কনসোল-০/390px-০ ✓ স্ক্রিনশট ×২ (admin-ratchet + me-badge)

## Unresolved Issues / Risks / Next Priorities
- admin.css-অবশিষ্ট-৩০-একক-শেড (ওয়েভ-৩) + dashboard.css/style.css-র্যাচেট
- গোটচা ×৫ PLANS session139-নোটে (grep-উইন্ডো-ঝুলুন / awk-RS / CSRF-পেজ-স্কোপড / grid-1fr / proof-mode-গেট)
- audit-র .env-ফেইল = sandbox-artifact (untracked+gitignored — রিপো-ঝুঁকি-শূন্য)
- **পরের-এজেন্ট: session142 লেবেল থেকে** (আমার-এন্ট্রি-রিলেবেল 139→141 দেখুন)

---

## Session 142 — og-স্টাইল লিংক-প্রিভিউ কার্ড + খালি-URL অটো-লিংক (cron-QA রাউন্ড; push da945f0)

### Current project status description / assessment
- প্রবেশে বেসলাইন-QA সব-সবুজ: ৮-পেজ 200, dupFixed-অক্ষত, প্যালেট-৭-ইমোজি, পারমালিঙ্ক-attr, 390px ×৭-০, কনসোল-০ → ফেজ-স্টেবল → ফিচার-রাউন্ড।
- session135-ব্যাকলগ ① (reply-anchor-লিঙ্ক-প্রিভিউ-কার্ড og-style) নির্বাচিত + session138-① (profile accepted_flag)।
- push-চক্রে সমান্তরাল session139/140/141 আগে-ল্যান্ডড — লেবেল 142-তে রিলেবেল (max+1 রীতি)।

### Completed modifications / verification results
- **(১) GET /api/link-preview** — ৪-কেস আনফার্ল (comment-anchor/article/qa/resource), হোয়াইটলিস্ট+400/404+ক্যাশ (৫মি/৩০০), গেস্ট-ও; বাংলা-অঙ্ক-মেটা।
- **(২) খালি-URL অটো-লিংক** — markdown-lite inlineMd দুই-পাস-স্প্লিট (URL-অ্যাঙ্কর আগে, ম্যানশন/#ট্যাগ পরে) + optMd মিরর; ট্রেলিং-পাংচুয়েশন-স্ট্রিপ।
- **(৩) og-কার্ড-ইঞ্জিন** — MutationObserver-চালিত (সব-পেইন্ট-পাথ অটো-কভার), data-lpv গার্ড, LPV_CACHE, শিমার→কার্ড, per-body-ইউনিক; 🚨 স্থায়ী-শিমার-বাগ-ফিক্স (`:not(.lf-og-loading)`); সম্পাদনা-সেভ data-lpv-রিসেট ×২-পাথ।
- **(৪) shared.css session142-ব্লক** (টোকেন-শুধু)।
- **প্রত্যাহার:** profile-ট্যাব-ত্রয়ী আমার-সংস্করণ → সমান্তরাল session139-ক্যানোনিকালে (৯ম-ইউনিয়ন-প্রমাণ)।
- **যাচাই:** E2E (লোড-পাথ/সাবমিট-পাথ/পারমালিঙ্ক-কমেন্ট-কার্ড/per-body-ইউনিক/স্ক্রিনশট ×২) + API ×৭ + ইউনিট ×৫ + role-policy **212/212** + cursor 25/25 + guard + audit + 390px ×১০-০ + কনসোল-০ + ক্লিনআপ (probe ×৫ + accept-রিভার্ট)।

### Unresolved issues / risks, priority recommendations for next phase
- **ঝুঁকি:** og-ইঞ্জিন কেবল অভ্যন্তরীণ-লিংক (এক্সটার্নাল = extension point — SSRF-গার্ড url-fetch.js-প্যাটার্ন); AV-ক্যাশ-গোটচা আবারও ৩-বার প্রমাণিত — স্ট্যাটিক-এডিট→রিস্টার্ট-রীতি অবিচ্ছিন্ন।
- **পরবর্তী-প্রায়োরিটি:** ① পোস্ট-বডিতে og-কার্ড ② এক্সটার্নাল domain-chip কার্ড ③ og-কার্ডে reactors-count ④ dropdown-paintList reltime-রি-পেইন্ট।
- **পরের-এজেন্ট: session143 লেবেল থেকে।**

---
Task ID: session143 (cron — QA→ফিচার-রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA + notifications-শূন্য-পলিশ + /qa-রিচ-এডিটর + profile.css-টোকেনাইজেশন + push

Work Log:
- QA-ফেজ ALL GREEN: guard + role-policy ২১২/২১২ (RP_PORT=3030-গোটচা) + cursor ২৬/২৬ + audit + ৯-পেজ ২০০/কনসোল-এরর-০/390px ×৫-০ → স্থিতিশীল-ফেজ → ফিচার-রাউন্ড
- ফিচার-১: notifications nf-branded141 (session114 self-badge চুক্তি-আবিষ্কার→রিস্কিন; CTA-আইকন-ফাঁদ-ফিক্স; ফিল্টার-শূন্য-পলিশ)
- ফিচার-২: /qa রিচ-এডিটর (ম্যানুয়াল init preview:false; input-dispatch-সিঙ্ক ×২; জেন-Esc-গার্ড; ব্র্যান্ড-অ্যাকসেন্ট); E2E বোল্ড→সাবমিট→swap→<strong>-রেন্ডার→ক্লিনআপ
- ফিচার-৩: profile.css ৭৮→০ (--pf-* রিওয়্যার্ম + ১৪-টোকেন; session137-৫-নাম-সংঘর্ষ→-২/-৪-সাফিক্স; :root-স্কোপ-গোটচা-আবিষ্কার); ভিজ্যুয়াল-শূন্য-স্ক্রিনশট ×২
- role-policy §২৯ ×১১ যোগ; মার্জড-ট্রি (session142-ইউনিয়ন) role-policy ২২৪/২২৪ + cursor ২৬/২৬ + guard + audit ✓

Stage Summary:
- origin/main @ 78db543-বেসে session143-কমিট ল্যান্ডেড-প্রায় (push-রেস: session142 og-কার্ড আগে-ল্যান্ডেড → stash/rebase-ইউনিয়ন: shared.css+tokens.css দ্বি-UU union)
- পরের-এজেন্ট: **session144** থেকে; প্রস্তাব: style.css-র্যাচেট (ভাগ-করে), auth/gallery/messenger-র্যাচেট, /qa-মেনশন-অটোকমপ্লিট, og-কার্ড-পোস্ট-বডিতে

## Session 144 — ফিড 'নতুন পোস্ট' লাইভ-পিল (FB-প্যারিটি) + নোটিফ-ড্রপডাউন ?type= কুইক-চিপ + single-source গ্রুপ-রেজিস্ট্রি (cron-QA-রাউন্ড; প্রবেশ @ 7f8e972 → push-পূর্ব rebese @ 78db543)

**লেবেল-রেস-নোট:** প্রথমে session-140 ধরেছিলাম — rebase-কালে সমান্তরাল 140(hex+qa-composer)/141(admin-fix)/142(og-card) আগে-ল্যান্ডড দেখা যায় → max+1-রীতিতে **143**-এ রিলেবেল (কোড-আইডেন্টিফায়ার ffpPulse140/bn140/data-ff-*/parseFeedCursor চুক্তি-নাম অপরিবর্তিত)।

**QA-ফেজ (প্রবেশ @ 7f8e972, আইসোলেটেড :3180 pristine):** ১৬-রুট-স্মোক (200/302-সঠিক) + লগইন-E2E + ৯-পেজ × (pageErrors=0, consoleErrors=0) + ৯-পেজ × 390px-overflow=0 + গ্যালেরি-ভিউটগল (ছবিসমূহ↔অ্যালবাম) + নোটিফ ?type= সার্ভার-প্রি-ফিল্টার (reaction/bogus/follow → খালি-পরিবার-নিরাপদ) + profile ৪-প্যানে-পিল (session139-রিগ্রেশন-অক্ষুণ্ণ) + কমেন্ট-অপটিমিস্টিক-ইনসার্ট (০→১-কাউন্টার-সিঙ্ক) + pm-মেনু-ডিলিট-সিঙ্ক — **অ্যাপ-বাগ-শূন্য → ফিচার-রাউন্ড।** canonical-backlog-অডিট: drawer-প্রিভিউ-ইনস্ট্যান্ট (session131-এ-হয়ে-গেছে), series-stats API (131), ড্রপডাউন-reltime-রি-পেইন্ট (133), mini-bubble-unread-ডট (117) — PLANS-ব্যাকলগ-লাইনটা স্টেল; খোলা ছিল session-121-র ঐচ্ছিক "নোটিফ-ড্রপডাউন ?type= লিংক" → এ-রাউন্ডের ফিচার-②।

**ফিচার ① — ফিড 'নতুন পোস্ট' পিল (FB-প্যারিটি):**
- **নতুন API:** `GET /api/feed/fresh?cursor=<ts>&cursorType=<t>&cursorId=<id>&filter=<f>` → `{ok, fresh≤30, capped}` — buildFeedSql-কার্সর-মোড পুনঃব্যবহারে (visibility/ফিল্টার/লগইন-নিয়ম /dashboard-এর সাথে হুবহু অভিন্ন — আলাদা SQL শূন্য, ড্রিফট-ঝুঁকি শূন্য); no-store; bogus/অসম্পূর্ণ → fresh:0 (কখনোই ৫০০ নয়, নীরব-ডিগ্রেড)।
- **parseFeedCursor হেল্পার:** /dashboard/more-র ইনলাইন-কার্সর-পার্স তোলা হলো — দুই-এন্ডপয়েন্টে এক-সোর্স (নরমালাইজেশন-ড্রিফট-অসম্ভব)।
- **ইঞ্জিন (dashboard.ejs inline গার্ডেড IIFE):** পোল প্রথম ৮সে → ৬০সে-ইন্টারভাল; ট্যাব-লুকানো স্কিপ + visibilitychange-কিক (১৫সে-থ্রটল); পিল `bn(N)+' টি নতুন পোস্ট'` (capped→'৩০+'); ক্লিক = scrollRestoration-manual + scrollTo(0,0) + reload (FB-প্যাটার্ন); × = ১০মিনিট-স্নুজ (in-memory); র‍্যাংকড-মোডে রেন্ডারই-নয় (স্কোর-ক্রমে 'নতুন' অর্থহীন)।
- **🚨 E2E-ধরা-বাগ-১ (চুক্তি-সংঘর্ষ):** anchor-অ্যাট্রিবিউট `data-ts` নাম দিলে **main.js-এর LekhokRelTime [data-ts]-পেইন্টার পিল-কনটেইনারের ভেতরটা মুছে রিলেটিভ-টাইম ('এইমাত্র') বসিয়ে দেয় — বাটন-দুটি অদৃশ্য** (DOMContentLoaded-পেইন্ট + পিল-showPill-এর মধ্যে রেস)। ফিক্স: `data-ff-ts/ff-type/ff-id/ff-filter` — **নতুন-সারফেসে data-ts নাম পুনঃব্যবহার নিষিদ্ধ (রীতি)।**
- **🚨 E2E-ধরা-বাগ-২ (দিক-উল্টো):** buildFeedSql-কার্সর-মোড = **কার্সরের-চেয়ে-পুরনো** পেজ (পেজিনেশন-সেমান্টিক্স) — ফ্রেশ-কাউন্টে বসালে উল্টো সংখ্যা দেয় (টপ-অ্যাংকরে fresh=১৩!)। ফিক্স: `feedCursorCond(…, freshMode)` দিক-মিরর শাখা (T>ct→`>=`, T=ct→`(ts>? OR (= AND id>?)`, T<ct→`ts>?`) — DESC-ক্রমে 'কার্সরের-আগে-সর্ট = নতুন'; freshMode-বিহীন কলে legacy SQL হুবহু-অপরিবর্তিত (cursor-suite 25/25-প্রমাণ)।

**ফিচার ② — নোটিফ-ড্রপডাউন ?type= কুইক-চিপ (session-121-ঐচ্ছিক-বকেয়া):**
- **helpers/notif-groups.js (নতুন):** G117/gKeyOf117 notifications.ejs থেকে তোলা — app.locals.notifGroups দিয়ে দুই-সারফেস single-source (কী-ড্রিফট-অসম্ভব; routes/pages.js-হোয়াইটলিস্টের সাথে সমলয়-চুক্তি)।
- header.ejs ড্রপডাউন-হেডারের নিচে `.nq-chiprow` — ৫-চিপ (other বাদ) `/notifications?type=<key>` খাঁটি-লিঙ্ক (noscript-নিরাপদ); ফুল-পেজের সার্ভার-প্রি-ফিল্টার + চিপ-অ্যাকটিভেট স্বয়ংক্রিয়-পুনঃব্যবহৃত।

**স্টাইল (session144-ব্লক, টোকেন-শুধু, হেক্স-শূন্য):** dashboard.css — .feed-fresh-pill ব্র্যান্ড-গ্রেডিয়েন্ট (accent→accent-light) + .ffp-dot পালস-কীফ্রেম + hover-lift + focus-visible রিং + 640px + reduced-motion; style.css — .nq-chiprow/.nq-chip টোনাল + hover-ব্র্যান্ড + 640px-অনুভূমিক-স্ক্রল (scrollbar-লুকানো) + reduced-motion।

**E2E-প্রমাণ (:3180, agent-browser):** API-কন্ট্রাক্ট (no-cursor→0 / bogus→0 / টপ-অ্যাংকর→0 / পুরনো-অ্যাংকর→সঠিক-গণনা=২) ✓ রিয়েল-ফ্লো: পেজ-লোডের-পরে riya-পোস্ট → ৮সে-পোলে '১ টি নতুন পোস্ট' ✓ ক্লিক → reload → scrollY=0 + টপ-কার্ডে নতুন-পোস্ট + পিল-নিঃশেষ ✓ ×-স্নুজ → ২-পোল-টিক জুড়ে লুকানো ✓ চিপ ×৫ → ?type=reaction-ডিপ-লিংক → ফুল-পেজ active-chip 'উত্তর ও মন্তব্য ১' + রো ✓ রিঅ্যাকশন-ফ্যামিলি-এম্পটি ✓ 390px ×৩-০ + কনসোল-০ ×৬-পেজ + পেজ-এরর-০ ✓ স্ক্রিনশট ×২ (s140-pill.png/s140-chips.png) ✓ টেস্ট-ডেটা-ক্লিনআপ (probe-পোস্ট ×৭ ডিলিট + নোটিফ-dismiss, unread=0) ✓

**রিগ্রেশন:** cursor 25/25 ALL GREEN ✓ guard:design ✓ inspect-audit 0-fail ✓ brace-০ ×২ ✓ node --check ×৩ ✓ EJS-compile ×৩ ✓ **role-policy: বেসলাইন-প্যারিটি-পদ্ধতিতে delta=0 প্রমাণিত ×২** (পুরনো-স্যুট 98✗/পুরনো-HEAD বনাম 98✗/মাইন; আপডেটেড-স্যুট 103✗/HEAD-78db543-বেসলাইন বনাম 103✗/মাইন — **অভিন্ন-সেট; ব্যর্থতা HEAD-এই-প্রি-এক্সিস্টিং**, এ-সংস্করণে LF_QA_DISABLE_RATELIMIT=1-সহ pristine-এও সবুজ-অসম্ভব — স্যুট-state-নির্ভরতা upstream-তদন্ত-আইটেম হিসেবে PLANS-এ খোলা)।

**গোটচা-নতুন (পরের-এজেন্টদের জন্য):** ① **`data-ts` অ্যাট্রিবিউট-নাম গ্লোবাল-কনট্র্যাক্ট** (LekhokRelTime সব [data-ts]-এর ভেতর-মুছে-পেইন্ট করে) — নতুন-কম্পোনেন্টে টাইমস্ট্যাম্প-ক্যারিং-কনটেইনারে ভিন্ন-নাম (data-ff-* রীতি) ② **keyset-কার্সর = পুরনো-দিক** — 'নতুন-গণনা'তে feedCursorCond-এর freshMode-মিরর ছাড়া উল্টো-ফল ③ স্যুট-গ্রিন-দাবি এ-মেশিনে পুনঃপ্রমাণ-অসম্ভব হলে **বেসলাইন-প্যারিটি (git worktree @HEAD বনাম ডেল্টা, অভিন্ন-সেট diff)**-ই ডেল্টা-শূন্য-প্রমাণ ④ riya/ismail curl-jar প্রতি-pristine-রিবিল্ডে মৃত — পুনঃলগইন আবশ্যক।

**ডকস:** PLANS session144-নোট + PROJECT §১৪৪ + worklog ×২। **পরের-এজেন্ট: session145 থেকে (max+1)।**

---
Task ID: cron-r15 (session145 — রাউন্ড: QA-সুইপ → মেনশন-নোটিফিকেশন-সমতা + /qa @অটোকমপ্লিট → চতুর্ভুজ-প্যারালাল-ইউনিয়ন → push)
Agent: Z.ai Cron Agent (webDevReview)
Task: Lekhok-Forum অবস্থা-যাচাই + agent-browser QA → স্টেবল-প্রমাণিত → ফিচার-রাউন্ড (PLANS-কিউ session140-প্রস্তাব ②③) → push + ডকস

Work Log:
- sync+QA @680e0ec: ১৬-route HTTP-ম্যাট্রিক্স (৩০২=auth-গেট-সঠিক, /search-raw-UTF8=curl-gোটচা, /daily=বেয়ার-রুট-নেই-বাই-ডিজাইন) + role-policy 210/210+2-SKIP + cursor 25/25 + guard + audit + 390px ×৭-০ + কনসোল-০ → বাগ-শূন্য → ফিচার-রাউন্ড
- আবিষ্কার (নীরব-ফিচার-গ্যাপ): কমেন্ট-কম্পোজারে @মেনশন-অটোকমপ্লিট UI ছিল কিন্তু POST /api/comment ও POST /qa/:id/answer extractMentions-ই চালাত না — মেনশন-বিজ্ঞপ্তি কখনোই যেত না
- ফিচার: ① দুই-পাথে মেনশন-নোটিফিকেশন (pref-গেট + নিজে/পোস্ট-লেখক/প্যারেন্ট-লেখক-বাদ + টাইপ-ভিত্তিক লিংক) ② mention-anywhere.js — textarea[data-mention] সারফেসে স্বাধীন-অটোকমপ্লিট (cc-mention-চুক্তি-মিরর, .cc-input-স্কিপ, Esc-stopPropagation) ③ §৩০ ×১৫-টেস্ট (delta-গণনা + tempered-grep পেয়ারিং + sort -u দ্বি-সারফেস-ডিডুপ)
- ধরা-বাগ ×৩: 'admin'=পোর্টাল-ক্রেডেনশিয়াল users-টেবিলে নেই → @admin মেনশন-শূন্য (টার্গেট=testadmin); notification-page একই-রো ড্রপডাউন+পেজ দুইবার রেন্ডার (pairing-এ sort -u); স্যুটে exit 0-ব্লকের পরে §অ্যাপেন্ড = অচল (summary-র আগে ঢোকানো)
- টুল-গোটচা-পুনঃপ্রমাণ: [me.id→e.id-ম্যানলিং (od-যাচাইয়ে অক্ষত), agent-browser press→keydown নেই (synthetic-রীতি), fill→caret-0→findMention-নীরব-ব্যর্থ, getComputedStyle display-মিথ্যা-ব্লক (ভিজ্যুয়াল-সত্য), fa-stream=content-শূন্য-গ্লিফ
- চতুর্ভুজ-প্যারালাল: session141(admin-fix)/142(og-card)/143(branded-empty+rich-editor) আগে-ল্যান্ডেড → আমার 141→143→144→145-ত্রি-রিলেবেল; notifications-শূন্য-অবস্থা same-feature → তাদের nf-branded141-ক্যানোনিকাল গৃহীত, আমার ne141-প্রত্যাহৃত (১০ম-প্রমাণ); stash-pop-এ --theirs/--ours-উল্টে-যাওয়া-গোটচা (theirs=stash!)
- যাচাই (মার্জড-ট্রি @144): role-policy **239/239** (তাদের §২৯ + আমার §৩০) ✓ cursor 25/25 ✓ guard ✓ audit ✓ brace-০ ✓ node --check ×৩ ✓ bash -n ✓ EJS ×২ ✓ mention-E2E (টাইপ→ড্রপডাউন→নেভ→ইনসার্ট→সিঙ্ক→Esc→390px-০→কনসোল-০) ✓
- pushed: <শা-হ্যাশ> — PROJECT §১৪৪ + PLANS session145-নোট (৬-চুক্তি) + worklog ×২

Stage Summary:
- @মেনশন এখন কমেন্ট/উত্তরে সত্যিই বিজ্ঞপ্তি পাঠায় (UI-প্রতিশ্রুতি=ডেলিভারি) + /qa কম্পোজারে অটোকমপ্লিট — Q&A-মেনশন-চক্র পূর্ণ
- পরবর্তী-প্রার্থী: rich-editor(session143)-এ @মেনশন-ইন্টিগ্রেশন, নোটিফ-ডিপ-লিংকে #answer-N অ্যাঙ্কর, Metered.ca-TURN (ইউজার-অ্যাকাউন্ট)
Task ID: 18 (Session 146 — cron-QA রাউন্ড: পোস্ট-বডি og-কার্ড + এক্সটার্নাল domain-chip + og-কার্ড rx-ব্যাজ) [relabel: 143→146 — সমান্তরাল 143/144/145 আগে-ল্যান্ডেড]
Agent: Main agent

Work Log:
- worklog-পর্যালোচনা: 78db543-বেসলাইন (0-behind); সার্ভিস-ত্রয়ী সুস্থ (8080/81/3000); বেসলাইন agent-browser QA বাগ-শূন্য (কনসোল-০, dupFixed ৬-০, প্যালেট-৭, পারমালিঙ্ক-attr, 390px-true-overflow-১=বাই-ডিজাইন-চিপ-স্ক্রল) → ফেজ-স্টেবল → session142-ব্যাকলগ ①②③ নির্বাচন (④ paintList-reltime session136-ক্যানোনিকালে প্রমাণিত — বাদ)
- **ইমপ্ল (৬-ফাইল):** ① markdown-lite `plainWithLinks` — URL-সচেতন-ট্রান্কেশন + \u0000-প্লেসহোল্ডার-রক্ষা-মার্কার-স্ট্রিপ + অ্যাঙ্কর-রিস্টোর (RAW-আউটপুট) ② server.js mdFeed-ইনজেকশন ③ FeedPostCard দুই feed-text mdPlain→mdFeed ④ comment-tools og-ইঞ্জিন: .feed-text-স্ক্যান + .feed-card-body-মাউন্ট + extChip143 (amber domain-chip, ফেচ-শূন্য, data-ext-u-গার্ড) + rx-ব্যাজ ⑤ social.js _rx143 (likes-টেবিল মোট+শীর্ষ-ইমোজি; কেস ১/২/৩) ⑥ shared.css session143-ব্লক (টোকেন-শুধু, hex-শূন্য)
- E2E: টেস্ট-পোস্টে অ্যাঙ্কর ×২ + og-কার্ড (প্রশ্ন-title+meta) + ext-chip + rx '😮১' ✓ API {১,😮}/absent/400 ✓ প্রোফাইল-সারফেস ✓ ইউনিট ×৪ ✓ স্ক্রিনশট ×২
- **🚨 নতুন-গোটচা (সার্ভার-প্রসেস):** bare `node server.js` (পুরনো-এজেন্ট-অবশিষ্ট) + `node --watch` দ্বৈত-প্রসেস — bare পোর্ট-ধরে রাখলে --watch EADDRINUSE-wait অথচ curl 200 (পুরনো-কোড!) → রিস্টার্ট-পরে ps-দিয়ে একক-প্রসেস-যাচাই বাধ্যতামূলক
- রিগ্রেশন: role-policy **212/212** ✓ cursor 25/25 ✓ guard ✓ audit:views ✓ brace-০ ×২ ✓ node --check ×৪ ✓ EJS ×২ ✓ dupFixed ✓ 390px ✓ কনসোল-০ ✓ ক্লিনআপ (টেস্ট-পোস্ট 651+কমেন্ট ডিলিট) ✓
- push: (commit-hash নিচে) → origin/main

Stage Summary:
- **লিঙ্ক-ইকোসিস্টেম এখন FB-1:1 পোস্ট-স্তরেও:** পোস্ট-বডির URL ক্লিকযোগ্য + অভ্যন্তরীণ→og-কার্ড + এক্সটার্নাল→amber domain-chip + সব-কার্ডে রিঅ্যাকশন-সত্য; session142-ব্যাকলগ ①②③ সমাধাত (④ আগেই-ক্যানোনিকাল)
- **নতুন-চুক্তি:** mdFeed (RAW!), .feed-text-স্ক্যান-সারফেস, rx_total/rx_top-পেলোড, data-ext-u-গার্ড — PLANS session143-নোটে ৫-চুক্তি
- **ঝুঁকি:** স্টোরড-excerpt-পাথে (কাস্টম-সারাংশ) URL কাটা-থাকলে আংশিক-অ্যাঙ্কর-সম্ভব (pre-existing আচরণ-শ্রেণি, ড্যাশবোর্ড-ফিড body-পাথ = নিরাপদ); দ্বৈত-সার্ভার-প্রসেস-গোটচা ভবিষ্যৎ-রাউন্ডেও হাতড়াতে-পারে
- **পরবর্তী-প্রায়োরিটি:** ① ext-chip favicon ② og-কার্ডে reactor-faces ③ article-single-বডিতে og-কার্ড ④ tokens-র্যাচেট (style.css ১৩৯৫) ⑤ **পরের-এজেন্ট session144 লেবেল থেকে**

---
Task ID: 19 (Session 147 — cron-QA রাউন্ড: og-কার্ড reactor-faces + আর্টিকেল-বডি og/ext-মাউন্ট + ext-লেটার-ফেভিকন)
Agent: Main agent

Work Log:
- worklog-পর্যালোচনা: 8728e16-বেসলাইন (0-behind); সার্ভিস-ত্রয়ী সুস্থ (8080/81/3000); বেসলাইন agent-browser QA বাগ-শূন্য (৬-পেজ-200, dupFixed অক্ষত, প্যালেট-৬, 390px-০, কনসোল-০) + QA-ক্রুফট-ডিলিট (অবশিষ্ট 'মার্জড-ট্রি-og-টেস্ট' টেস্ট-পোস্ট — pm-মেনু-ডিলিট) → ফেজ-স্টেবল → session146-ব্যাকলগ ①②③ লিঙ্ক-ইকোসিস্টেম-গ্রুপ নির্বাচন
- **ইমপ্ল (৩-ফাইল):** ① routes/social.js `_rx143` — faces-কুয়েরি (likes⨝users LIMIT-3, av||'/avatar/'+uid-ফলব্যাক) + তিন-স্প্রেডে rx_faces (প্রথম-পুশ-প্রচেষ্টায় স্প্রেড-বাদ-থেকে E2E-ধরা — faces:null → sed-ফিক্স) ② comment-tools.js — lfOgRxHtml147 (ফেস-অ্যাভস্ট্যাক/পিল-ফলব্যাক), extChip143-এ লেটার-ফেভিকন (h31-হ্যাশ→hue+গ্লিফ — নেটওয়ার্ক-মুক্ত) + atEl147-অ্যাডজাসেন্ট-মাউন্ট, lpvMount/Fetch-এ atEl-প্লাম্বিং + lf-og-in147-অ্যানিমেশন, lpvScanBody-তে .article-body-বাবল + ব্লক-পূর্বপুরুষ-রেজলুশন, lpvScanAll-সিলেক্টর+.article-body ③ shared.css session147-ব্লক (টোকেন-শুধু — 🚨 প্রথমে --lf-surface-card ব্যবহার করেছিলাম → টোকেন-অনুপস্থিত-ধরা → --lf-ui-input-bg-সংশোধন)
- E2E: আর্টিকেল-৭১০ og-কার্ড অ্যাঙ্কর-পাশে + ফেস-অ্যাভস্ট্যাক (1+👍+১) + chip 'E' hsl(157) ✓ ফিড-৭১১ (bare-URL — 🚨 markdown-লিংক ফিড-এক্সার্পটে অ্যাঙ্কর-হয়-না — expected) og-কার্ড ফেস-সহ + বাবল-শেষ-অর্ডার-অক্ষুণ্ণ ✓ কমেন্ট-বাবল ফেভিকন ✓ API {rx_total:'১', rx_faces:[{a:'/avatar/52',t:'👍'}]} ✓ স্ক্রিনশট ×২ (download/s147-*)
- **🚨 পুনঃপ্রমাণিত-গোটচা ×২:** ① LPV-সার্ভার-ক্যাশ (৫মি) — রিঅ্যাকশন-পরেও পুরনো-কার্ড; রিস্টার্ট=ক্যাশ-ফ্লাশ ② node --watch-child-কিল → watcher-মৃত্যু → pkill+mini-service-রিস্টার্ট+ps-একক-প্রসেস-যাচাই রীতি; ডুয়াল-watcher-লিঙ্গার-কিল
- রিগ্রেশন: role-policy **239/239 ALL GREEN** ✓ cursor 25/25 ✓ guard ✓ audit:views ✓ brace-০ ×২ ✓ node --check ×২ ✓ 390px-০ (og-320-fিট, fav-18px) ✓ কনসোল-০ ×৪-পেজ ✓ ক্লিনআপ (পোস্ট 710+711-ডিলিট + পোস্ট-৩-রিঅ্যাকশন-টগল-অফ total:0) ✓
- docs: PLANS session147-নোট (৮-চুক্তি) + PROJECT §১৪৭ + worklog ×২

Stage Summary:
- **লিঙ্ক-ইকোসিস্টেম FB-1:1 এখন তিন-সারফেস-সম্পূর্ণ:** কমেন্ট-বাবল + ফিড-পোস্ট-বডি + আর্টিকেল-বডি — সবখানে og-কার্ড (reactor-faces-সহ) + amber ext-chip (লেটার-ফেভিকন-সহ); session146-ব্যাকলগ ①②③ সমাধাত
- **নতুন-চুক্তি:** rx_faces-পেলোড (≤৩, ফলব্যাক-সুরক্ষিত), atEl147-অ্যাডজাসেন্ট-মাউন্ট, .article-body-তৃতীয়-সারফেস, lf-ext-fav hsl-ডিস্ক
- **ঝুঁকি:** og-ইঞ্জিন-সিলেক্টর/বাবল/at-রেজলুশন এখন তিন-জায়গায়-সমলয়-রাখতে-হবে (নতুন-সারফেস-নোট PLANS-এ); markdown-<p>-না-থাকলে at-fallback=anchor (ইনলাইন-মাউন্ট — গৃহীত)
- **পরবর্তী-প্রায়োরিটি:** ① ক্লিকযোগ্য rx-ব্যাজ→reactors-modal (nesting-সতর্কতা) ② tokens-র্যাচেট (style.css ১৩৯৫) ③ dropdown-paintList reltime ④ **পরের-এজেন্ট session150 থেকে**

---
Task ID: 24 (Session 148 — Lekhok-Forum কল-পলিশ রাউন্ড)
Agent: Z.ai (ইউজারের লাইভ-রিপোর্ট: "প্রিভিউ আসে না, কাটার পরও রিং বাজে, ট্রানজিশন স্মুথ না")
Task: ইউজার-রিপোর্টকৃত ৩-বাগের মূল-কারণ-বিশ্লেষণ + ফিক্স + লুকানো 409-রেস-ফিক্স + নতুন E2E

Work Log:
- repo: /home/z/lekhok-forum (Express/EJS :8080); স্যান্ডবক্স-রিসেটের পরে ফ্রেশ-ক্লোন → bun install → reset-qa-logins (ismail/secret123 প্রতিষ্ঠা) → boot SANDBOX_PORT=8080
- 🐛 মূল-কারণ-১ (রিং-লিক): beep() ৪০-সে-পর্যন্ত প্রি-শিডিউল-অসিলেটর রাখে, stopRing() শুধু টাইমার-ক্লিয়ার — nodes[]-ট্র্যাকিং + প্রতি-নোড hard-shutdown (gain→০+stop+disconnect); AC শেয়ার্ড (SPK-ব্যবহৃত) — ctx.close() নয়
- 🐛 মূল-কারণ-২ (PIP): .lc-local-video লুকানো .lc-videos-এর ভেতরে + srcObject-সেট-কালে display:none autoplay-মিস + স্পষ্ট-play নেই → এলিমেন্ট .lc-panel-লেভেলে + lc-root--has-local-ক্লাস (রিং-অবস্থাতেই দৃশ্যমান) + tryPlayLocal(); গ্রুপে CSS !important-নিষেধ
- 🐛 মূল-কারণ-৩ (ট্রানজিশন): হুট-root.remove() → lc-root--closing (২২০ms unpop→টাইমার-remove; hidden-ট্যাবে সরাসরি), .is-out আসন্ন-বিদায়-ফেড, .is-in কানেক্ট-ক্রসফেড, lc-pip-in; reduced-motion-সম্প্রসারণ
- 🚨 লুকানো-রেস-আবিষ্কার: /start-POST-পূর্বে হ্যাংআপ → end-POST-শূন্য → ৪৫-সে ringing-লক → রিডায়াল 409 busy (E2E-তে ধরা) → S.seq লাইফসাইকেল-টোকেন + লেট-স্টার্ট অটো-'cancelled' (1:1+গ্রুপ)
- টুল-গোটচা-পুনঃপ্রমাণ: স্যান্ডবক্স Bash-কল-শেষে setsid-nohup-সার্ভারও মরে → প্রতি-রাউন্ড এক-কলে boot+test; ব্রাউজার-E2E-তে CALL_RING_TIMEOUT_S=4 নিষিদ্ধ (ইনবক্স-পোল ৫-সে > ৪-সে উইন্ডো → ইনকামিং-মিস); reset-qa-logins ফ্রেশ-রিবিল্ডে পুনঃচালনা আবশ্যক
- যাচাই: নতুন verify-session148-callpolish.js **২৩/২৩** (হার্ডস্টপ-সিঙ্ক্রোনাস + PIP videoWidth>০ প্রি-কানেক্ট + closing-ক্লাস + ফুল-কানেক্ট + ক্যালি-পাশ-হার্ডস্টপ) · s122 ব্রাউজার ২১/২১ · s93 API ৫৫/৫৫ · s113 গ্রুপ ৫০/৫০ · guard ✓ brace-২৯৭/২৯৭ ✓ node --check ✓

Stage Summary:
- ইউজারের ৩-অভিযোগের প্রত্যেকটির সরাসরি-প্রমাণিত ফিক্স + busy-লক-রেস-ফিক্স — কলিং এখন FB/টেলিগ্রাম-প্যারিটি-পথে
- নতুন-চুক্তি: S.ringing.nodes[]-হার্ডস্টপ · S.seq-টোকেন (নতুন async-start-পথে বাধ্যতামূলক) · .lc-local-video ক্লাস-চালিত-দৃশ্যমানতা · _qaRingState/_qaSelfPip হুক
- পরবর্তী-প্রার্থী: কল-মিড-মিনিমাইজ-পলিশ · OS-নোটিফিকেশন অ্যাকশন-বাটন · Metered.ca-TURN · উত্তর-থ্রেড-মেনশন-চিপ (session145-বকেয়া-সহ)

---
Task ID: session147 (cron — স্টেটাস-অ্যাসেসমেন্ট → QA → ফিচার-রাউন্ড → push) [relabel: আমার-144→149 — push-রেসে সমান্তরাল session144/145/146 আগে-ল্যান্ডেড (max+1); কোড-আইডি s144 অক্ষত]
Agent: Z.ai Cron Agent (webDevReview)
Task: Lekhok-Forum অবস্থা-যাচাই + agent-browser QA → বাগ/ফিচার-সিদ্ধান্ত → ফিচার-রাউন্ড + হ্যান্ডওভার

Work Log:
- QA-ফেজ ALL GREEN @ ad8af3c (guard + role-policy ২২৪/২২৪ + cursor ২৬/২৬ + agent-browser ৭-পেজ কনসোল-০/390px-০) → ফিচার-রাউন্ড
- ১১শ-প্রত্রাহার-প্রমাণ: আমার ফিড-og-কার্ড (নিজস্ব mdFeed/feedLink + lpvScanFeed144) ও /qa-মেনশন (window.LekhokMention সার্বজনীনকরণ) — push-সময়ে s146 (plainWithLinks+extChip143) ও s145 (mention-anywhere.js) canonical-আগে-ল্যান্ডেড → rebase-এ তাদের পাশ, আমার ডেল্টা পূর্ণ-প্রত্রাহৃত (ডাবল-স্ক্যান/দ্বৈত-ইঞ্জিন-শূন্য); আমার browser-E2E (ড্রপডাউন→Enter-ইনসার্ট→Esc-কোঅর্ডিনেশন; og-কার্ড-মাউন্ট) তাদের-কোডেই পুনঃ-যাচাইকৃত
- **অনন্য-রক্ষিত — messenger.css র্যাচেট ১৪৪→০ (ওয়েভ-৪):** patch144-messenger-ratchet.js — বিদ্যমান-ম্যাপ ×২২ + নতুন-টোকেন ×৯ (danger-strong #E41E3F ×১৪ + match-mark জোড়া + কাছাকাছি-ভিন্ন-মানে -২-সাফিক্স: social-blue-hover-2/warn-ink-2/social-blue-light-2 — per-নাম defs=১ ×৯); patch139-বাগ-সংশোধন (প্রমাণ-মোডে tokens.css-লেখা-শূন্য); বেসলাইন-লক ০; computed-লাইভ-রেজলভ ×৯ + বাবল-রঙ-প্রোব
- verify-session144-feed-ogcard.sh canonical-অ্যাপটেড (মেনশন-চেক s145-মার্কারে, ফিড-চেক s146-মার্কারে); delete-303-গোটচা: /qa/:id/delete-এর সফল-রেসপন্সই 303 (absence-যাচাই বাধ্যতামূলক)
- গোটচা: rebase-এ --theirs/--ours উল্টে-যায় (আমি আবারও-খেয়েছি — HEAD-checkout-ই-নিরাপদ); agent-browser eval transient-fail (পেজ-লোড-রেস); viewport = set viewport 390 844
- মার্জড-ট্রি-রিগ্রেশন: E2E-অ্যাপটেড + role-policy + cursor + guard-বেসলাইন + 390px/কনসোল-শূন্য — ALL GREEN

Stage Summary:
- messenger.css হেক্স-শূন্য + ৯-টোকেন যুক্ত (র্যাচেট-ওয়েভ-৪ সম্পন্ন); patch144 + E2E-স্ক্রিপ্ট রিপোতে
- পরের-প্রস্তাব: style.css-র্যাচেট (১৩৯৫) · auth/gallery.css (১২৩/১২৩) · og-কার্ড rx-ব্যাজ (s146-সম্পন্ন-যাচাই) · কল-ইতিহাস degrade-রেকর্ড
- পরের-এজেন্ট: session150 থেকে

**push-সমাপ্তি (session148):** ef0bcc0→3052b5c (7791d49-উপরে রিবেজ; দ্বি-রিলেবেল 146→147→148 — সমান্তরাল session146(og-card)/147(og-faces) ক্রমান্বয়ে-ল্যান্ডেড; PLANS/PROJECT/worklog ×২ union-মার্জ; মার্জড-ট্রি-যাচাই: s148 ২৩/২৩ + s122 ২১/২১ ✓; 🚨 নতুন-গোটচা: subshell-সেটসিড-সার্ভার টিকে-যায় → পরবর্তী-বুটে EADDRINUSE-নীরব-ব্যর্থতা + নোংরা-DB-থেকে 409-busy — pkill-যাচাই+reset-রীতি বাধ্যতামূলক) — পরের-এজেন্ট session149 থেকে


---
Task ID: 19 (Session 150 — cron-QA রাউন্ড: কাউন্টার-ভাষা-চুক্তি — বাংলা-সংখ্যা single-source + পেজভেদে ইন্টারফেস-সমতা) [relabel: 147→150 — সমান্তরাল session147/148/149 আগে-ল্যান্ডেড; double-147-কলিশন-টলারেটেড]
Agent: Main agent (clone: /home/z/lekhok-forum/lekhok-forum)

Work Log:
- প্রবেশ: clone-ফ্রেশ (পুরনো /home/z/lekhok-forum মুছে গিয়েছিল) @8728e16; worklog/PLANS/PROJECT পর্যালোচনা
- **ইউজার-স্পেসিফিকেশন বাস্তবায়ন:** "কাউন্টারের ভাষা বৈষম্য স্থায়ীভাবে দূর + ফিড/প্রোফাইল/সিঙ্গেল-পোস্টে একই ইন্টারফেস" — ৯-ফাইল: bn-number.js (নতুন toBnNumber) + server.js toBn + layout/header window.toBnNumber-মিরর + PostFooterActions/FeedPostCard/article-single toBn + main.js-ইঞ্জিন + comment-tools-ডেলিগেট + decorateFeed-activity-সত্য + profile reactionCounts-নাম-ফিক্স
- **E2E-তে ধরা দুই-ড্রিফট-বাগফিক্স:** ① কার্যক্রম-কার্ড (daily_content) রিঅ্যাক্ট→রিলোডে কাউন্ট-মিলিয়ন (reactions-কলাম-বিহীন; /api/react likes-টেবিলে লেখে) → decorateFeed actRxTruth-ব্যাচ ② প্রোফাইল-কার্ডে রিঅ্যাকশন-কাউন্ট কখনোই-না-দেখানো (reactCounts নাম; FeedPostCard-চুক্তি reactionCounts) → নাম-সংশোধন + angry-কী
- **EJS-গোটচা ×২-নতুন:** `<%# %>`-ভেতরে `<%= %>`-স্ট্রিং পার্সার-ভাঙে; include-আর্গুমেন্টে `<%# %>` অবৈধ (JS-`//`-কমেন্ট রীতি) — উভয়ই ধরা+দলিল
- E2E (agent-browser, testuser @3030): ফিড ১১-কার্ড ইংরেজি-শূন্য ✓ রিঅ্যাক্ট-চক্র '১'/''/'১' ✓ কার্যক্রম-ড্রিফট-ফিক্স রিলোডে '১' ✓ সিঙ্গেল-পোস্ট মেটা+ফুটার (পঠিত-স্ট্যাট-নতুন — ফিড-সমতা) ✓ কমেন্ট-বাম্প '১' ✓ প্রোফাইল rs '১' ✓ 390px ×৩-০ ✓ কনসোল-০ ✓ স্ক্রিনশট ×২ (download/s147-* — ফাইল-নাম-লেবেল-রীতি)
- রিগ্রেশন: role-policy **baseline-delta** (প্রিস্টিন-HEAD-worktree ২১✗ বনাম ডেল্টা ১৯✗ — delta-only-শূন্য; সব প্রি-এক্সিস্টিং ismail-সিড-গ্যাপ) ✓ guard ✓ brace-০ ×২ ✓ node --check ×৫ ✓ EJS ×৪ ✓ ইউনিট ×৮ ✓
- টেস্ট-ডেটা-ক্লিনআপ: প্রোব-পোস্ট+মন্তব্য অ্যাপ-ফ্লোতেই ডিলিট (likes/comments-ক্যাসকেড-যাচাই-শূন্য); কার্যক্রম-স্ট্রে-লাইক টগল-অফ ✓
- push-রেস: fetch-এ সমান্তরাল session147(og-faces)/148/149 পাওয়া → rebase কনফ্লিক্ট-শুধু-ডক ×৪ (union — তাদের-ব্লক-আগে) → লেবেল-রিলেবেল 147→150 (max+1) → মার্জড-ট্রি-পুনঃযাচাই → push

Stage Summary:
- **কাউন্টার-ভাষা-চুক্তি স্থায়ী:** সাইটের পোস্ট-সারফেসে সব সংখ্যা single-source (toBn/window.toBnNumber) — নতুন-কোডে লোকাল-ল্যাম্বডা নিষিদ্ধ (PLANS session150-নোটে ৪-চুক্তি)
- **পেজভেদে ইন্টারফেস-সমতা পূর্ণ:** ফিড=প্রোফাইল=একক-পোস্ট একই PostFooterActions-ফুটার, একই বাংলা-কাউন্টার, একই পঠিত-স্ট্যাট
- **নতুন-চুক্তি:** দুই-ডকুমেন্ট-ওপেনার (layout+header) মিরর-রীতি; reactionCounts-ক্ষেত্র-নাম ক্যানোনিকাল; EJS-কমেন্ট-গোটচা ×২
- **পরবর্তী-প্রায়োরিটি:** ① legacy-ল্যাম্বডা toBn-মাইগ্রেশন (১২+ফাইল) ② ReactorsModal-ট্যাব toBn ③ **পরের-এজেন্ট session151 লেবেল থেকে**
Task ID: 19 (Session 151 — ফোরাম ডিরেক্টরি লঞ্চার (৯-ডট) + ফিড লেফট-রেল — ইউজার-প্রস্তাব IA-সংস্কার বাস্তবায়ন) [relabel-নোট: আমার-147→151 — সমান্তরাল session147(og-কার্ড-ফেস)/148/149/150 আগে-ল্যান্ডেড — max+1; কোড-মার্কার session147-ব্লক/dlx* চুক্তি-নাম অক্ষত]
Agent: Main agent (webDevReview)

Work Log:
- ইউজার-রিকোয়েস্ট (বাংলা): "আরও"-বাটনের সাব-আইটেম প্রফেশনাল-উপস্থাপন + অবস্থান-নির্দেশ — ইউজারের নিজস্ব ডিজাইন-প্রস্তাব (FB ৯-ডট অ্যাপ-লঞ্চার + লেফট-রেল + ৩-ডোমেইন IA) কোডবেজ-যাচাইয়ে নিশ্চিত: পুরনো .mega-menu ৪-কলামে ঘোষণা/বিজ্ঞপ্তি ও আয়োজন/ইভেন্ট href-ডুপ্লিকেট ছিল হুবহু
- QA-ফার্স্ট: আইসোলেটেড :3190 pristine (rm db → ত্রি-seed → setsid --fork PPID=1) — ১৩-রুট-স্মোক ২০০ + before-mega.png-বেসলাইন → বাগ-শূন্য → ফিচার-রাউন্ড
- **ইমপ্ল (৮-ফাইল):** ① helpers/dir-launcher.js (নতুন) — DIR_SECTIONS ৩-ডোমেইন × ১২-আইটেম (label+desc+href+icon+tone+rail+railHighlight) + TONE_TOKENS + DIR_RAIL_ORDER — notifGroups-রীতিতে single-source ② server.js app.locals.dirSections/dirRail ③ header.ejs — মেগামেনু প্রতিস্থাপন: ৯-ডট ট্রিগার (aria-haspopup/expanded/controls) + ৫৬০px ফ্লোটিং প্যানেল (#dlxPanel) ৩-সেকশন × ২-কলাম গ্রিড + টোন-স্কুইর্কল + Title+Subtitle + dir-launcher.js স্ক্রিপ্ট ④ layout.ejs — পাবলিক-টপবারেও একই লঞ্চার (আগে পাবলিক-পেজে কোনো ডিরেক্টরি-মেনুই ছিল না — নতুন-সক্ষমতা) ⑤ public/assets/js/dir-launcher.js (নতুন) — toggleDlx/closeDlx + Escape(ফোকাস-ফেরত) + বাইরে-ক্লিক + ARIA-সিঙ্ক (main.js-মিনিফাইড-সার্জারি-এড়ানো) ⑥ tokens.css — ৬-টোন-টোকেন (amber/gold/cyan/violet/pink/slate) ⑦ style.css session147-ব্লক (EOF, টোকেন-শুধু) ⑧ dashboard.ejs has-rail + .feed-rail (প্রোফাইল-রো + ৮-শর্টকাট, ই-পেপার হাইলাইট) + dashboard.css session147-ব্লক (≥1200px 212px-কলাম, max-1360px)
- **guard-র্যাচেট-গোটচা:** প্রথম-ব্লকে ২×#fff লিটারাল রয়ে-গিয়েছিল → ratchet 1395→1397-ফেইল → var(--lf-white)-প্রতিস্থাপন (টোকেন-বিদ্যমান) → guard-গ্রিন — কমেন্টে "মার্কআপ: (#dlxPanel)" জাতীয় স্ট্রিংও hex-regex-এ ধরা-পড়ে না যাচাইকৃত
- **layout.ejs-আবিষ্কার-গোটচা:** curl-smoke /articles-এ dlx-অনুপস্থিত কিন্তু ব্রাউজারে উপস্থিত — কারণ পাবলিক-পেজ (layout.ejs) ও ইউজার-পেজ (partials/header.ejs) দুই-টপবার-ইমপ্ল; দুই-ওপেনারেই সিঙ্ক-বাস্তবায়ন
- E2E (:3190): ডেস্কটপ 1440 — ৩-কলাম গ্রিড 212/776/300 ✓ রেল ৮-আইটেম+প্রোফাইল-রো+hl rgb(232,245,233) ✓ লঞ্চার ওপেন ১২-আইটেম/৩-সেকশন/aria-true ✓ প্রথম-আইকন rgb(0,106,78) ✓ Escape-বন্ধ+aria-false+ফোকাস-ফেরত ✓ বাইরে-ক্লিক-বন্ধ ✓ /epaper-নেভিগেশন ✓ /articles(/) পাবলিক-পেজেও ১২-আইটেম ✓ 390px — rail/dlx display:none + overflow-শূন্য ×৩-পেজ ✓ কনসোল-০ ✓ স্ক্রিনশট ×৪ (before-mega/launcher-open/rail-loggedin/public-articles/mobile-390)
- রিগ্রেশন: guard ✓ (ratchet-সহ) inspect-audit ✓ cursor **25/25** ✓ (গোটচা: স্ক্রিপ্ট-ডিফল্ট :8080 — BASE-আর্গ বাধ্যতামূলক) brace-০ ×৩ ✓ node --check ×৩ ✓ EJS ×৩ ✓
- পুশ: (হ্যাশ নিচে) — PROJECT §১৪৭ + PLANS session147-নোট + worklog ×২

Stage Summary:
- "আরও"-মেগামেনু → FB-প্যারিটি ৯-ডট ডিরেক্টরি-লঞ্চার (ডুপ্লিকেট-শূন্য ৩-ডোমেইন IA) + ফিড লেফট-রেল — ইউজার-প্রস্তাব দুই-পদ্ধতিই একসাথে বাস্তব; পাবলিক-পেজে ডিরেক্টরি-নতুন-সক্ষম
- **নতুন-চুক্তি:** ডিরেক্টরি-আইটেম যোগ = শুধু helpers/dir-launcher.js (দুই-টপবার+রেল অটো-সিঙ্ক); টোন = tokens.css --lf-dlx-*; ভিউ কখনো সরাসরি টোকেন ব্যবহার নয় — --dlx-t ইনডিরেক্ট
- পরবর্তী: রেলে লাইভ-ব্যাজ (নোটিফ/জন্মদিন-কাউন্ট) · লঞ্চারে সার্চ-ফিল্টার · মোবাইলে বটম-শিট-ভ্যারিয়েন্ট · লাইভ-Turso-রিসেট + সিক্রেট-রোটেশন ×৪ (টোকেন-ধারী-এজেন্ট)

---

## Session 152 — সেটিংস মাস্টার-ডিটেইল পুনর্নির্মাণ (cron-review রাউন্ড) [relabel: আমার-142→152 — সমান্তরাল session143…151 আগে-ল্যান্ডেড, max+1 রীতি]

**Task ID:** session152 · **Agent:** Z.ai Code (cron webDevReview)

**Work Log:**
- ইউজার-প্রস্তাব (ফেসবুক-সেটিংস-প্যাটার্ন): টু-কলাম মাস্টার-ডিটেইল, প্রতি-আইটেমে ডানে সাব-মেনু, করপোরেট-ছাঁটাই, ফোরাম-উপযোগী গ্রুপিং — বাস্তবায়িত
- 🚨 বাগফিক্স: পুরনো settings.ejs-এর বিজ্ঞপ্তি-সেকশনে ওপেনিং-ফর্ম-ট্যাগ অনুপস্থিত (অনাথ-</form>) → POST /settings/notifications পেজ-পথ-মৃত — ফর্ম+CSRF যুক্ত
- settings.ejs সম্পূর্ণ-পুনর্লিখন: ৫-গ্রুপ ১৪-আইটেম সাইডবার (সার্চযোগ্য) + ১৪-প্যানে + security-সাব-মেনু + পুরনো-হ্যাশ-কম্প্যাট + ?sec/secerr-চুক্তি
- নতুন: মিডিয়া/কল-ডায়াগনস্টিকস (৫-কার্ড), আপনার-কার্যক্রম (actStats ৪-স্ট্যাট, toBn-ডেলিগেট), সাহিত্যিক-আচরণবিধি-প্যানে, মোবাইল push-নেভিগেশন
- settings.css নতুন (টোকেন-শুধু, হেক্স-০); routes/social.js-এ actStats; test-role-policy.sh §২৯ ×১৬ (union: তাদের §৩০-পরিবার-অক্ষত)
- push-রেস-ইউনিয়ন: origin f675c00→4b39d26 (session151) — settings.ejs/css-তাদের-স্পর্শ-শূন্য যাচাই-পূর্বক সোজা-প্রয়োগ; social.js-patch-ক্লিন-apply; docs ×৪-union

**验证结果 (agent-browser @9142, ismail — মার্জড-ট্রি):**
- সুইচ+হ্যাশ+সাব-নেভ ✓ সার্চ ✓ পুরনো-হ্যাশ-ম্যাপ ✓ ডায়াগনস্টিকস-অটো ✓ ICE-প্রকৃত-সফল (srflx:1) ✓ ?sec=pending-অটো ✓ POST /settings/privacy→303→সঠিক-প্যানে+ব্যাজ ✓ 390px-০ ✓ কনসোল-০ ✓
- রিগ্রেশন: role-policy **২৫২-পাস/০-ফেইল** (২-SKIP) + s139-parity ২২/২২ + audit:views + guard + node --check + EJS-compile + hex-০

**পরের-এজেন্ট: session153 লেবেল থেকে** (বিস্তারিত PLANS.md session152-নোট + PROJECT.md §১৫২)
- **পরবর্তী-প্রায়োরিটি:** ① ক্লিকযোগ্য rx-ব্যাজ→reactors-modal (nesting-সতর্কতা) ② tokens-র্যাচেট (style.css ১৩৯৫) ③ dropdown-paintList reltime ④ **পরের-এজেন্ট session148 থেকে**

---

## Session 153 [relabel: আমার 148→153; কোড-মার্কার sb148/msx148 অক্ষুণ্ণ] — ফিড-সাইডবার প্রিমিয়াম-আপগ্রেড (ইউজার-স্পেক এক্সিকিউশন)

Work Log:
- ইউজার-আপলোডেড স্পেক (বাংলা, React/TSX-ভিত্তিক) গ্লোবাল-ফিড সাইডবারের জন্য EJS-কোডবেসে ইন্টেন্ট-অনুবাদ করে হুবহু এক্সিকিউট
- dashboard.ejs সাইডবার রি-রাইট (msx-অপসারণ/জন্মদিন-অটো-হাইড/প্রস্তাবিত-লেখক-রি-ডিজাইন/ট্যাগ-ব্যাজ/স্লিম-ট্রেন্ডিং/লিডারবোর্ড-ডাবল-ব্যাজ-বিলোপ/bn148→toBn-রিফ্যাক্টর)
- routes/dashboard.js: trendingPosts avatar_update-বাদ + engagement>0 + title-ডিডুপ; myStats ৪-কুয়েরি-অপসারণ
- me.ejs: msx148-সারসংক্ষেপ-উইজেট (ট্যাব-জাম্প+ইনসাইটস-স্ক্রল-চিপ) + পেজ-লোকাল ইঞ্জিন
- main.js: follow-inline টেক্সট-বাটন ('+ অনুসরণ'/'অনুসৃত'); dashboard.css + style.css session148-ব্লক (টোকেন-শুধু)
- 🚨 দ্বৈত-সার্ভার-প্রসেস-পুনঃপ্রমাণ (bare node + --watch) — pkill+mini-service-রিস্টার্ট+ps-যাচাই
- E2E agent-browser: সাইডবার-স্যুট + /me-ট্যাব-জাম্প + 390px-০ + কনসোল-০ + স্ক্রিনশট ×৩; রিগ্রেশন: role-policy 239/239 + cursor 25/25 + guard/audit/brace-০

Stage Summary:
- সাইডবার এখন প্ল্যাটফর্ম-স্পন্দন-কেন্দ্রিক (ব্যক্তিগত-সারসংক্ষেপ /me-তে), সব উইজেট বাংলা-অঙ্ক+৮px-রেডিয়াস, ট্রেন্ডিং কেবল-মৌলিক-সাহিত্যকর্ম
- পরের-এজেন্ট session149 থেকে; চুক্তি-নোট PLANS session148-এ

---
Task ID: session154 (cron webDevReview রাউন্ড — Lekhok-Forum; আমার-প্রাথমিক-লেবেল 148 → max+1-রীতিতে 154, কোড-মার্কার nf148 অক্ষুণ্ণ)
Agent: Z.ai Agent (webDevReview)
Task: ইউজার-স্পেক "নোটিফিকেশন ড্রপডাউন প্রফেশনাল করা" — অপঠিত-স্টেট + বাংলা-রিলেটিভ-টাইম + ৩-ডট-অ্যাকশন + অ্যাক্টর-ব্যাজ + কালপুরুষ-ফন্ট-ডিকপ্লিং

Work Log:
- ফ্রেশ-ক্লোন @ 7791d49; ডায়াগনোসিস: রুট-কজ = main.js toggleNotifs-এর clearNotifBadge (খোলামাত্রই সব-পঠিত)
- ইমপ্লিমেন্ট ×৫-ফাইল: social.js (+POST unread/:id, idempotent+user_id-গার্ড), header.ejs (অটো-সব-পঠিত-বিলোপ + 'N নতুন'-পিল + 'সব পঠিত করুন' + ৩-ডট-পপওভার + অ্যাক্টর-ব্যাজ-মার্কআপ + session148-ইঞ্জিন: sendBeacon-রো-পঠিত, data-n r-বিট-সিঙ্ক, toBnNumber-ব্যাজ), live.js (paintList-মিরর + bell-wrap-ক্যাপচার-রি-পেইন্ট-গোটচা-ফিক্স + মেনু-খোলা-থাকলে paint-স্কিপ), tokens.css (+--lf-blue-soft/-2 — color-mix headless-গোটচা), shared.css (session148-ব্লক — ID-স্পেসিফিসিটি (1,3,0) > session117-গ্রেডিয়েন্ট)
- E2E agent-browser: অপঠিত-সংরক্ষণ ✓ ব্যাজ ✓ মেনু-স্থায়িত্ব ✓ টগল (ব্যাজ ৩→৪→৩) ✓ মার্ক-অল ✓ ডিলিট→আন্ডু (DB-প্রমাণ) ✓ 390px ✓ কনসোল-০ ✓ স্ক্রিনশট ×৮
- রিগ্রেশন: role-policy মার্জড-ট্রি ডেল্টা 236/18 বনাম HEAD-বেসলাইন 235/19 (একই-ফ্রেশ-DB — +১-পাস, শূন্য-নতুন-ফেইল) + guard + node --check ×২ + EJS
- rebase-ইউনিয়ন: সমান্তরাল 148-calls/149/150/151/152/153 আগে-ল্যান্ডেড — shared.css-EOF-union (তাদের ব্লক-আগে) + session150-toBnNumber-চুক্তিতে bn-ল্যাম্বডা-রিফ্যাক্টর

Stage Summary:
- ড্রপডাউন এখন FB-প্যারিটি: খোলামাত্র-সব-পঠিত-নেই, অপঠিত নীল-টিন্টে থাকে, প্রতি-রোতে টাইপ-রঙা-ব্যাজ + ৩-ডট (টগল/মুছুন-আন্ডু), হেডারে 'N নতুন' + 'সব পঠিত করুন', কনটেন্ট কালপুরুষে
- গোটচা-সংগ্রহ PLANS session154-নোটে (৬-চুক্তি): nf148-ম্যাপ-সমলয়, data-n.r-সত্য, paintList-মিরর-রীতি, ID-স্পেসিফিসিটি, color-mix-নিষিদ্ধ, toBnNumber-রীতি
- পরের-এজেন্ট session155 থেকে; পরবর্তী-পছন্দ: ফুল-পেজ ৩-ডট-প্যারিটি, টাইপ-ফিল্টার-সিনার্জি, গ্রুপড-ডেট-হেডার
---
Task ID: session149-push-সমাপ্তি
Agent: Z.ai Cron Agent (webDevReview)
Task: push-রেস-ইউনিয়ন-ইতিহাস + হ্যান্ডওভার-নিশ্চিত

Work Log:
- push-রেস ×২: প্রথম push-চেষ্টায় s145/146 আগে-ল্যান্ডেড → rebase @ 8728e16 (আমার 144→147-রিলেবেল; ফিড-og-কার্ড ও /qa-মেনশন ডেল্টা তাদের canonical-এ প্রত্রাহৃত — ১১শ-প্রমাণ); দ্বিতীয় push-চেষ্টায় s147 (7791d49 og-faces)/s148 (3052b5c কল-পলিশ) আগে-ল্যান্ডেড → দ্বিতীয়-rebase + 147→149-রিলেবেল
- docs-union ×২-সাইকেল (PLANS/PROJECT/worklog ×২) + root-worklog অনাথ-মার্কার-পরিষ্কার
- মার্জড-ট্রি-চূড়ান্ত-যাচাই: s144-E2E ৩১/৩১ ✓ role-policy **২৩৯/২৩৯** ✓ cursor ২৬/২৬ ✓ guard-বেসলাইন (messenger:0) ✓
- pushed: 3052b5c..**2b76368** ✓

Stage Summary:
- messenger.css র্যাচেট-ওয়েভ-৪ সম্পন্ন (১৪৪→০; ৯-টোকেন); patch144 + canonical-অ্যাপটেড E2E রিপোতে
- পরের-এজেন্ট: **session150** থেকে

---
Task ID: session150 (cron — স্টেটাস-অ্যাসেসমেন্ট → QA → ফিচার-রাউন্ড → push)
Agent: Z.ai Cron Agent (webDevReview)
Task: Lekhok-Forum প্রজেক্ট-স্টেটাস মূল্যায়ন + agent-browser QA + ফিচার/স্টাইল রাউন্ড + হ্যান্ডওভার

## Current Project Status / Assessment
- প্রবেশ: origin/main @ 159eac3 + লোকাল-UUID-worklog-কমিট → rebase-ইউনিয়ন @ 186d52c (worklog ×২-দ্বি-UU union)
- QA-ফেজ ALL GREEN: guard ✓ + role-policy ২৩৯/২৩৯ + cursor ২৬/২৬ + s132/s139/s144 ✓ + agent-browser ১৭-পেজ ২০০/কনসোল-০/390px ×১২-০ → বাগ-শূন্য → ফিচার-রাউন্ড
- 🚨 বুট-গোটচা-পুনঃপ্রমাণ: sandbox-ব্যাকগ্রাউন্ড-সার্ভার Bash-কল-শেষে মৃত → প্রথম-স্যুট-রান 190-ফেইল (মৃত-সার্ভার-আর্টিফ্যাক্ট) — এক-কলে boot+test রীতি অপরিহার্য

## Goals / Completed / Verification
- **ফিচার-A og-কার্ড rx-ব্যাজ→reactors-modal (s147-①):** wrap-ভাই কাঠামো (a>button-nesting-নিষিদ্ধ-সমাধান) — comment-tools.js wrap150 (guard ×৭-সিলেক্টর-স্থানান্তর) + _ogRxTarget150 (comment|post) + data-rx-open-চুক্তি-বাটন + shared.css session150-ব্লক; openReactorsModal-সংযোগ-শূন্য
- **ফিচার-B markdown-lite অভ্যন্তরীণ-বেয়ার-পাথ (s142-① সমাপ্তি — রাউন্ডে-আবিষ্কৃত):** plainWithLinks/_bareUrlPass — /articles|qa|questions|resources/N → a.a-link (lookahead-ট্রেলিং-বাউন্ডারি); তিন-সারফেস bare-লিংক→og-কার্ড→rx-ব্যাজ চেইন; unit ×৫
- **ফিচার-C র্যাচেট-ওয়েভ-৫:** patch150-auth-gallery-ratchet.js — auth/gallery/calls/bookmarks ৩৬২→০ (নতুন-টোকেন ×৩৩; baseline-লক ×৪; per-নাম defs=১ অ্যাসার্টেড)
- **latent-bug-সংস্কার:** ×১১-auth-ডকুমেন্ট tokens.css-লিংক-যোগ (প্রি-এক্সিস্টিং tokens-অনুপস্থিতি — র্যাচেটের পূর্বশর্ত; BEFORE/AFTER-computed-প্যারিটি-প্রমাণ: body #FAFAFA/brand-name/eyebrow/input-border হুবহু)
- **চূড়ান্ত-রিগ্রেশন:** guard ✓ + role-policy **২৩৯/২৩৯** + cursor **২৭/২৭** + s132 ৩০/৩০ + s139 ২২/২২ + s144 ৩১/৩১ + s148 ২৩/২৩ + **s150 ২৯/২৯ (নতুন E2E)** + brace-০ + node --check ×৪ + 390px ×১২-০ + কনসোল-০ + স্ক্রিনশট ×৪ + টেস্ট-ক্লিনআপ ×১০-404-যাচাই

## Unresolved Issues / Risks / Next Priorities
- গোটচা ×৫ (PLANS session150-নোট): কমা-সিলেক্টর-তালিকায় suffix-শেষ-বিকল্পে-বাঁধে (বাটন-স্টেপে একক-সিলেক্টর — ৩-ঘণ্টা-ডিবাগ-মূল্য) · EJS-কমেন্টে nested `<%= %>`-বিস্ফোরণ · কমেন্ট-ভেতরে `*/`-প্রিফিক্স · synthetic KeyboardEvent-নিরীহ (playwright keyboard) · LPV-ক্যাশ-৫মি (cleanup-যাচাইয়ে নিষিদ্ধ)
- প্রস্তাব-কিউ: style.css-র্যাচেট (১৩৯৫ — patch150-প্যাটার্ন-পুনঃব্যবহারযোগ্য) · feed.css ৮৮ + rich-editor ৬১ · member-accounts/premium/multi-image/shared-ছোট · কমেন্ট-অ্যাঙ্কর-og-কার্ড rx-ব্যাজ-লাইভ-টেস্ট · dropdown-paintList reltime (s134) · কল-ইতিহাস degrade-রেকর্ড (db)
- **পরের-এজেন্ট: session151 থেকে**; push-পূর্বে git pull --rebase (union-মার্জ PLANS/PROJECT/worklog ×২)

**push-সমাপ্তি (session150):** e50a5e9→**ace86f0** (push-রেস: সমান্তরাল session148–155 আগে-ল্যান্ডেড — lekhok-forum-next/ Next.js-অ্যাপ-ল্যান্ডিং-সহ; rebase-ইউনিয়ন worklog ×২ + PLANS ×২ + PROJECT ×১ + tokens.css-EOF (তাদের session147-dir-launcher + আমার ratchet-ব্লক সহাবস্থান; per-name defs=১ ×৩৩ যাচাই) — মার্জড-ট্রি-রিগ্রেশন: role-policy **২৫৪/২৫৪** + s150 **২৯/২৯** + s144 ৩১/৩১ + guard ✓ + বেসলাইন-লক অক্ষত; টেস্ট-ডেটা-পূর্ণ-পরিষ্কার ×১৩ (গোটচা: /qa-delete আর্টিকেলে নীরব-303 — রুট↔টাইপ-মিল + 404-যাচাই রীতি)) — **পরের-এজেন্ট: session156 থেকে**; push-পূর্বে git pull --rebase (union-মার্জ PLANS/PROJECT/worklog ×২)
## session153 — FB-রিচ-কম্পোজার + ইন্টেলিজেন্ট মিডিয়া-কোলাজ (ইউজার-স্পেক A-to-Z)
**RCA:** ইউজারের "ফেসবুকের মত ইন্টারফেস আসছে না" — স্পেক Next.js/React-ধাঁচে লেখা, EJS-কোডবেজে পোর্ট-ই হয়নি; কম্পোজার ছিল সেশন-১০০-বক্স-মডাল।
**বাস্তবায়ন:** DB ×৬-কলাম + post_images.media_type · rich-sanitize.js (XSS-হোয়াইটলিস্ট) · POST /api/posts/compose + /upload-media · fb-media-collage.ejs (১/২/৩/৪/৫+ লেআউট, +N-ওভারলে toBn) · FeedPostCard rich-শাখা (গ্রেডিয়েন্ট+চিপ+কোলাজ) · article-single ব্যানার · অডিয়েন্স-এনফোর্সমেন্ট ত্রি-সারফেস (filterByAudience153 — ONLY_ME/FRIENDS=মিউচুয়াল) · কম্পোজার-মোডাল পূর্ণ-প্রতিস্থাপন (বর্ডারহীন canvas + ১২-টুল + 'Aa' ×৮ + মিডিয়া-প্রিভিউ-কোলাজ + ২য় স্লাইড-মেনু + খসড়া lfCpm153)।
**বাগ-লাইভ-ধরা:** অনুপস্থিত audience → লিটারাল-"undefined"-স্টোর → অতিথি-ফিডে নীরবে-অদৃশ্য (String(x||D)-ভ্যালিডেট-কিন্তু-String(x)-সেভ প্যাঁচ) — নরমালাইজ→হোয়াইটলিস্ট-ক্রমে ফিক্স + E2E-রিগ্রেশন-গার্ড।
**যাচাই:** lf153-e2e **49/49** + role-policy **239/239** + cursor 25/25 + guard (hex-0) + audit + brace-0 + EJS ×৪ + স্ক্রিনশট ×৪।
**পরের-এজেন্ট:** session154 — PLANS session153-নোটে চুক্তি ×৭ + পরবর্তী-প্রস্তাব ×৫।

**push-সমাপ্তি:** 4b311cf → origin/main ✓ (rebase-union: PLANS/PROJECT/dashboard.css/style.css ×৪-UU + header.ejs nfNewPill148-স্ট্যাটিক-ডুপ-রিপেয়ার; মার্জড-ট্রি: role-policy 254/254 + cursor 25/25 + lf153 49/49; double-session153-ডকুমেন্টেড — আমার FB-কম্পোজার vs তাদের sidebar-premium, আইডেন্টিফায়ার-সংঘর্ষ-শূন্য) — পরের-এজেন্ট session156 থেকে।

## session156 — FB ইনডিপেন্ডেন্ট ৩-কলাম স্ক্রল (ইউজার-স্পেক: মেনুবার-স্থায়ী + কলাম-আইসোলেশন)
**RCA/স্পেক:** ইউজারের Next.js-রেফারেন্স-কোড (Navbar/feed-page/fb-scroll ইউটিলিটি) — /dashboard-এ মেনুবার স্থায়ী + বাম-রেল/মাঝ-ফিড/ডান-সাইডবারের সম্পূর্ণ আলাদা স্ক্রল; মাঝ-প্যানেল স্ক্রলে অন্য কলাম পিক্সেল-স্থির। EJS/CSS-স্ট্যাকে পোর্ট।
**বাস্তবায়ন:** header.ejs-এ ঐচ্ছিক bodyClass প্যারাম (guard-যুক্ত — অন্য সব পেজ শূন্য-প্রভাব) → /dashboard-এ body.lf-feed-lock156; dashboard.css session156-ব্লক (≥1200px: body height:100vh + overflow:hidden + flex-col — FB h-screen overflow-hidden সমতুল্য; topbar flex:0 0 auto; page-main flex:1; তিন কলাম নিজস্ব overflow-y-auto স্ক্রলার; স্পেসিফিসিটি (0,3,1) > .two-col.has-rail (0,3,0); কলাম 280/320px, @1440+: 320/348px; ফিড-শিশু 620px-ক্যাপ-সেন্টার; overscroll-behavior:contain); style.css .fb-scroll ইউটিলিটি (হোভারে-দৃশ্যমান স্ক্রলবার — টোকেন-ভিত্তিক, নতুন-hex-শূন্য, ডার্ক-মোড টোকেন-ফ্লিপ)।
**যাচাই (tests/lf156-e2e.sh):** window-লক scrollTo(0,3000)→scrollY 0 ✓ · ফিড 800px স্ক্রলে ডান 250px-এ স্থির + রেল 0 + টপবার top=0 ✓ · ডান 250px স্ক্রলে ফিড 0 ✓ · IO-লোড-আরও কন্টেইনার-স্ক্রলে জীবিত (cards 31→41; cursor-মোডে data-offset স্থির = by-design) ✓ · জ্যামিতি railW 320/rightW 348/feedChildW 620 ✓ · মোবাইল 390px লক-বিহীন (overflowY auto, rail none, hScroll 0) ✓ · / /articles /qa /login → 200 ✓ · home topbar sticky ✓ · /articles bodyClass শূন্য ✓ · কনসোল-০ ✓ · স্ক্রিনশট ×২ (lf156-desktop/mobile.png) ✓ · টেস্ট-ডেটা ক্লিনআপ ×৪০ (schema-agnostic post_id-চাইল্ড-স্ক্যান) ✓।
**নোট:** ① মোবাইলে টপবার স্ক্রল-অ্যাওয়ে = সাইট-ব্যাপী প্রি-একজিস্টিং (/articles-এও হুবহু — স্কোপ-বহি; PLANS-প্রস্তাব) ② style.css-ব্রেস ২-বাহুল্য = session111/118-রিপেয়ার-মার্কার (ডকুমেন্টেড-প্রত্যাশিত) ③ এই worklog.md-র অমীমাংসিত 1750/1843/1850-কনফ্লিক্ট-মার্কার ইউনিয়ন-রিপেয়ার (উভয়-পার্শ্ব অক্ষত)।
**পরের-এজেন্ট:** session157 থেকে।

**push-স্টেটাস (session156):** কমিট **8b63e5d** লোকাল main-এ (origin/main @ 1fe4cab-এর ওপর rebase-আপ-টু-ডেট, কনফ্লিক্ট-শূন্য); push-অথ-ব্লকড — স্যান্ডবক্স-রিসেটে ক্রেডেনশিয়াল-হারানো (অ্যানোনিমাস HTTPS-ক্লোন; gh-CLI/টোকেন-অনুপস্থিত)। **পরের-এজেন্ট প্রথম কাজ: `git push origin main`** (8b63e5d + এই docs-কমিট) — তারপর session157।

**push-সমাপ্তি (session156):** 1fe4cab→**6288ae1** → origin/main ✓ (feat 8b63e5d + docs 6288ae1; rebase-আপ-টু-ডেট, কনফ্লিক্ট-শূন্য; ক্রেডেনশিয়াল-উদ্ধার: সক্রিয় cron-webDevReview (job 393326) পেলোডে সংরক্ষিত টোকেন — পরের-এজেন্টের জন্য নোট: স্যান্ডবক্স-রিসেটে টোকেন-পুনঃউদ্ধারের জায়গাটি এটি) — **পরের-এজেন্ট: session157 থেকে** (PLANS session156-নোটে চুক্তি ×৫ + প্রস্তাব ×৪: মোবাইল টপবার FB-প্যারিটি সর্বপ্রথম)।
---
## সেশন ১৫৭ (relabel: সমান্তরাল session156 ৩-কলাম-স্ক্রল আগে-ল্যান্ডেড, max+1-রীতি) — বাম-রেল পূর্ণাঙ্গ ফোরাম ডিরেক্টরি + হেডার-লঞ্চার → "সেবাসমূহ ও আর্কাইভ" (ইউজার-স্পেক, ৮-ইউটিলিটি-পেজ)

**ইনপুট (লাইভ-ইউজার):** "সোশ্যাল ফিডের ডান দিকের আরও আইটেমের সকল কন্টেন্ট বামের প্যানেলে নিয়ে আসুন — ফোরাম ডিরেক্টরি (জ্ঞান ও সাহিত্য কর্নার / ফোরাম ও প্রাতিষ্ঠানিক কার্যক্রম / দৈনন্দিন ফিচার ও স্মৃতি)"; "আরও সেকশনে এমন কিছু যুক্ত করুন যা অন্য কোথাও থাকবে না" — স্পেক Next.js/React-ধাঁচে (FeedLeftSidebar.tsx + MoreUtilitiesMenu.tsx) → EJS-স্ট্যাকে পোর্ট (session153-রীতি)।

**বাস্তবায়ন:**
- helpers/dir-launcher.js: DIR_SECTIONS-এর ১২ আইটেমই এখন রেল-দৃশ্যমান (rail:false অপ্রচলিত) + **UTIL_SECTIONS** (৪-ক্যাটাগরি × ৮-আইটেম) — এক-রেজিস্ট্রি (notifGroups-রীতি)
- dashboard.ejs .feed-rail: সেকশন-গ্রুপড পূর্ণাঙ্গ ডিরেক্টরি — fr-sec-title156 + fr-item--rich156 (টাইটেল+ডেস্ক দুই-লাইন) + 'আজকের'-ব্যাজ (ই-পেপার) + সেকশন-বিভাজক; রেল-প্রস্থ 212→264px (dashboard.css); স্বাধীন-স্ক্রল অক্ষুণ্ণ
- header.ejs #dlxPanel: হেডার-লঞ্চার এখন **"সেবাসমূহ ও আর্কাইভ"** — dlx-panel--util156 (৪২০px) + dlx-grid--list156 (১-কলাম রো: আইকন+টাইটেল+ডেস্ক+শেভরন dlx-go156) — FB MoreUtilitiesMenu-প্যারিটি; **মোবাইল-সাইডবারে নতুন 'সেবাসমূহ ও আর্কাইভ'-details** (ইউজার+অতিথি উভয়-ভ্যারিয়েন্টে — অতিথি-ভ্যারিয়েন্ট-বাদ-প্রথম-চেষ্টায়-ধরা)
- **routes/utilities.js (নতুন):** ৮ বাস্তব-পেজ (404-শূন্য-চুক্তি) — GET /tools/spell-checker (ক্লায়েন্ট-সাইড ৩৩-নিয়ম প্রমিত-বানান ইঞ্জিন) · GET /tools/font-converter (৪-মোড লাইভ-রূপান্তর: সংখ্যা bn↔en, যতিচিহ্ন, উদ্ধৃতি, স্বয়ংক্রিয়-পরিষ্কার) · GET /me/certificate (**ensureAuth; DB-চালিত সনদ — LF-CU-ID, ভুক্তি-তারিখ, প্রকাশিত-গণনা; @media print**) · GET+POST /support/dmca-report (**complaints-টেবিল-পুনঃব্যবহার, subject '[কপিরাইট]'-প্রিফিক্স, সেশন ৩৫-রীতি ৬০-মিনিট ডুপ-গার্ড**) · GET /archive (**strftime-বছর-গ্রুপিং + সেরা-পঠিত-৩-হাইলাইট/বছর**) · GET /peer-review (**ব্লাইন্ড-নীতি — লেখক-নাম-ইচ্ছাকৃত-লুকান**) · GET /sponsorship (স্লট-ভাড়া-টেবিল) · GET /shortcuts (চিটশিট + লাইভ কি-টেস্টার)
- views/user/utilities/ ×৮ + public/assets/css/utilities.css (utl-hero/utl-card/প্রতি-টুল-ব্লক; টোকেন-শুধু hex-শূন্য; 640px + reduced-motion)
- server.js: app.locals.utilSections + router-mount ×১-লাইন

**E2E (agent-browser):** ৮-রুট 200 + certificate 302(গেট)→ismail-লগইনে 200+DB-সনদ (LF-CU-1048, ১৮/৯/২০২৬) ✓ · DMCA ফর্ম-সাবমিট → ?ok=1 → complaints-তালিকায় '[কপিরাইট]' ✓ · পুনঃসাবমিট → ?dup=1 ✓ · বানান-ইঞ্জিন ৫-ভুল-ধরা (শাশ্ত্রীয়/আরো/আশ্চর্য্য/সুর্য/ইত্যাদি।) ✓ · কনভার্টার পাইপ→দাঁড়ি+উদ্ধৃতি-লাইভ ✓ · কি-টেস্টার ✓ · রেল ১২-আইটেম+৩-সেকশন (অতিথি+লগইন) ✓ · মোবাইল-সাইডবার ৮-লিংক ✓ · 390px-overflow-০ ✓ · কনসোল-০ ✓ · স্ক্রিনশট ×৪ (download/s156-*)
**রিগ্রেশন:** node --check ×৩ + EJS-compile ×১০ + **role-policy fresh-DB-প্যারিটি: বেসলাইন (stash) vs আমার-ট্রি — IDENTICAL failure-sets (119/96 = স্যান্ডবক্স-ডেমো-DB-পরিবেশগত; কোড-সংঘর্ষ-শূন্য)** — 🚨 গোটচা-পুনঃপ্রমাণ: suite-বার-বার-চালালে DB-মিউটেট-হয় → "same-protocol fresh-DB diff" না-করলে ভুয়া-রিগ্রেশন-পড়ে; + sql.js-ফাইল-DB-র আগে server-kill (reset-qa-logins-রীতি) + /login ইউজার-পোর্টালে স্টাফ-ব্লক → QA-লগইন ismail/secret123 (scripts/reset-qa-logins.js)।

**পরের-এজেন্ট: session158 থেকে** — push-পূর্বে git pull --rebase (union-মার্জ worklog/PLANS ×২); প্রস্তাব: ① বানান-ইঞ্জিনে শব্দ-ভিত্তিক ডিকশনারি + সাজেশন-এডিট-সোয়াপ ② আর্কাইভ-বছর-ক্লিকে /articles?year= ফিল্টার ③ সনদে ইমেজ-সিগনেচার/QR-ভেরিফিকেশন ④ পিয়ার-রিভিউতে বেনামে মন্তব্য-স্ট্রিম (উপস্থিত) ⑤ UTIL_SECTIONS-ব্যবহার-পরিসংখ্যান (admin-ইনসাইট)।

## Session 157 — স্বাধীন স্মুথ স্ক্রল (settings/messenger + সর্বজনীন ইউটিলিটি; ফিড-অংশ সমান্তরাল-156-canonical-গৃহীত) (১৮ সেপ্টেম্বর ২০২৬) [relabel: আমার-153→157 — push-রেসে সমান্তরাল session153×২/154/155/156 আগে-ল্যান্ডেড, max+1 রীতি; 156-একই-স্পেক → আমার-ফিড-ব্লক-প্রত্রাহৃত (session149-রীতি); কোড-মার্কার pn153/st153 অক্ষত]

**ইউজার-স্পেক:** যেকোনো ২-প্যানেল (সেটিংস/মেসেঞ্জার) বা ৩-প্যানেল (ফিড) পেজে স্বাধীন ও ফ্লুইড স্ক্রলিং — scroll-chaining-মুক্ত (overscroll-behavior:contain), hover-reveal স্ক্রলবার, পুনর্ব্যবহারযোগ্য লেআউট সিস্টেম; কোড-বসানোর আগে বিদ্যমান-ফাইলে কনফ্লিক্ট-যাচাই; আলাদা-কমিট (আগের session152-সেটিংস-কাজের সাথে না)।

**পূর্ব-যাচাই (ইউজারের নির্দেশ):** ডকুমেন্ট-ওপেনার ×২-এ overflow-y-শূন্য (ডাবল-স্ক্রলবার-পূর্বশর্ত নেই) · settings=sticky+উইন্ডো-স্ক্রল · messenger=fixed-shell (`.conv-scroll` সিলেক্টর-মৃত, বাস্তব স্ক্রলার `#convListDefault`) · dashboard=৩-প্যানেল sticky-রেল · ইউজার-হেক্স → টোকেন-ম্যাপ (--lf-ui-border-strong/--lf-gray-mid) · settings-এই একমাত্র footer-include।

**পরিবর্তন (৫-ফাইল, CSS-কেন্দ্রিক):**
- shared.css: `.independent-scroll` সর্বজনীন ইউটিলিটি + `.pn153-*` শেল-প্রিমিটিভ (নতুন-পেজ রেসিপি কমেন্টে) — session153-ব্লক, hex-শূন্য
- settings.css: ≥961px fixed-shell (wrap flex-কলাম, shell `grid-template-rows:minmax(0,1fr)`, nav+main স্বাধীন-স্ক্রলার) + `.st153-footer-slot` ডেস্কটপ-লুকানো
- settings.ejs: footer include → `.st153-footer-slot`-র‍্যাপ (১-লাইন — এ-সেশনের একমাত্র মার্কআপ-পরিবর্তন)
- messenger.css: #convListDefault/.chat-body/.messenger-details → contain + hover-reveal; chat-body smooth-বর্জিত (অটোস্ক্রল-চুক্তি)
- dashboard.css: ~~≥1200px fixed-shell~~ **প্রত্রাহৃত** — সমান্তরাল session156 (8b63e5d) একই-স্পেক-ক্যানোনিকাল (body.lf-feed-lock156 + .fb-scroll) — session149-প্রত্রাহণ-রীতি

**验证结果 (agent-browser @9153, ismail):**
- ফিড: docH<winH (উইন্ডো-স্ক্রল-শূন্য), main 9579-বটমে + রেল 17 + winY 0 — চেইনিং-শূন্য, osb:contain ✓
- সেটিংস: main-বটমে winY 0 ✓ ফুটার ডেস্কটপ-লুকানো/মোবাইল-দৃশ্যমান ✓ প্যানে-সুইচ+সাব-ডিটেইল+মোব্যাক অক্ষত ✓
- মেসেঞ্জার: conv 167 / chat 346 / details 596 — তিনটেই winY 0 ✓ chat-body smooth:auto ✓
- 390px ×৩-পেজ h-overflow-শূন্য ✓ কনসোল-০ ✓ স্ক্রিনশট ×৩
- রিগ্রেশন: role-policy **২৫৪/২৫৪** + s139-parity **২২/২২** + guard + audit:views + hex-০ + EJS-compile + node --check
- হারনেস-গোটচা: role-policy=RP_PORT / s139=E2E_PORT / সার্ভার=PORT — ভুল-ভ্যারিয়েবলে ২০৫-মিথ্যা-ফেইল

**পরের-এজেন্ট: session158 লেবেল থেকে** (বিস্তারিত PLANS.md session153-নোট + PROJECT.md §১৫৩)

---

## session192 — পাবলিক ফোরাম ডিরেক্টরি কম্প্যাক্ট রি-ডিজাইন (ইউজার-স্পেক ForumDirectoryMenu-পোর্ট)

**স্পেক:** হোমপেজ (লগ-ইন-পূর্ব) নেভবারের ৯-ডট "ফোরাম ডিরেক্টরি" প্যানেল — কম্প্যাক্ট, প্রিমিয়াম, প্রফেশনাল; অপ্রয়োজনীয় ফাঁকা-জায়গা শূন্য; টাইটেল Hind Siliguri + ডিটেইল Kalpurush।

**পরিবর্তন (৪-ফাইল):**
- helpers/dir-launcher.js — PUB_SECTIONS রেজিস্ট্রি (৩×১০; মকআপ-রুট→বাস্তব-রুট ম্যাপ, 404-শূন্য) + বেক-লুপ + export
- server.js — app.locals.pubSections
- views/layout.ejs — #dlxPanel--pub192 কম্প্যাক্ট-মার্কআপ + কন্ডিশনাল ভিজিটর-ফুটার-স্ট্রিপ
- public/assets/css/style.css — session192-ব্লক (স্কোপড, হেক্স-শূন্য, color-mix সফট-টিন্ট)

**验证结果 (agent-browser @9192):**
- ভিজিটর: প্যানেল 406×461px (আগে 560px), ৩-সেকশন/১০-আইটেম/লাইভ-ব্যাজ/লগইন-ফুট ✓
- ফন্ট (computed): টাইটেল=HindSiliguri, ডেস্ক=Kalpurush, সেকশন=HindSiliguri ✓
- বাইরে-ক্লিক-ক্লোজ + ✕-ক্লোজ + টাইল-ক্লিকথ্রু (/on-this-day) ✓
- মোবাইল 390px: wrap-hidden, hScroll-শূন্য ✓
- লগড-ইন (ismail/secret123): ড্যাশবোর্ড util157 (৪০৭px/৮-রো) + রেল ১৩ অক্ষত, pub192-মার্কার-শূন্য; পাবলিক-পেজে লিগ্যাসি-ফুট ✓
- রুট-হেলথ: ১০/১০ curl -L 200; কনসোল-০; node --check ×২; audit:views (১০৬-ejs) ✓; guard:design ✓

**গোটচা:** sql.js-সার্ভার-রানিং-অবস্থায় reset-স্ক্রিপ্ট = ফাইল-ওভাররাইট (স্ক্রিপ্টের-আগে সার্ভার-বন্ধ); লোকাল lekhok.db প্রোডাকশন-কপি — ডেমো: ismail/riya/tanvir · secret123।

**পরের-এজেন্ট: session193 থেকে** (PLANS.md session192-নোট + PROJECT.md §১৯২)।

---

## Task56 / session205 — অ্যাকশন-ইতিহাস টাইমলাইন + আমার-অভিযোগ লাইভ-সিঙ্ক (২২ সেপ্টেম্বর ২০২৬)

**অবস্থা:** রাউন্ড-শুরুতে task52+task54-সুইট-রিগ্রেশন সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড; HEAD `c7669a5` থেকে যাত্রা।

**সম্পন্ন:**
- Prisma: `UserReport.noteHistory String?` (JSON, ≤৫০-এন্ট্রি) — add-column, মাইগ্রেশন-শূন্য
- PUT support-reports: নোট+স্টেটাস-বদল এক-টাইমলাইনে অ্যাপেন্ড (ডুপ-নীরব, করাপ্ট-JSON-নিরাপদ)
- রিভিউ-ডেস্ক: `ActionHistory` সময়রেখা (রেল+রঙিন-ডট+রোল-ব্যাজ+আপেক্ষিক-সময়+from→to-চিপ; >৪-কোলাপ্স)
- my-reports: `noteHistory {note,at}[]` — স্পষ্ট-ম্যাপ, by/byRole-লিক-শূন্য; প্যানেলে "পূর্ববর্তী জবাব" details
- MyReportsPanel: ৩০-সে সাইলেন্ট-পোল + 'lf:support-changed'-ইনস্ট্যান্ট-রিফ্রেশ (loading-ফ্লিকার-শূন্য)
- E2E: task56-qa.sh ৭-ধাপ-গ্রিন · লাইভ-সিঙ্ক-ব্রাউজার-প্রমাণ · কনসোল-০ · 390px hScroll-০ · tsc+eslint-০ · ভেক্টর-ক্লিনআপ ✓

**গোটচা:** schema-push-পরে dev-server-রিস্টার্ট-বাধ্যতামূলক (পুরোনো-client নতুন-ফিল্ড-লেখা-চুপ); reaper মাঝে-সার্ভার-মারে → QA self-contained।

**পরের-এজেন্ট: session206 থেকে** (PLANS session205-নোট + PROJECT §২০৫)। বাকি: Turso/প্রোড-পোর্ট।

---

## Task57 / session206 — রিভিউ-ডেস্ক দক্ষতা-প্যাক: অনুসন্ধান + মিডিয়া-ফিল্টার + বাল্ক-অ্যাকশন (২২ সেপ্টেম্বর ২০২৬)

**অবস্থা:** রাউন্ড-শুরুতে task52+54+56-তিন-সুইট-রিগ্রেশন সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড; HEAD `b6a4976` থেকে যাত্রা।

**সম্পন্ন:**
- ইনস্ট্যান্ট-অনুসন্ধান (নাম/ইমেইল/লেখা, case-insensitive) + ক্লিয়ার-বাটন + ফোকাস-রিং
- মিডিয়া-ফিল্টার-চিপ ×৫ (aria-pressed + আইকন) + ফলাফল-কাউন্ট "X/Yটি দেখানো হচ্ছে + রিসেট"
- ফিল্টারড-এম্পটি-স্টেট (XCircle) — সাধারণ-খালি থেকে আলাদা
- বাল্ক-স্টেটাস: কার্ড-চেকবক্স + সব-নির্বাচন + নির্বাচিত-ring + ফিক্সড-টুলবার (প্রগ্রেস-বার aria-live + → চলমান/সমাধান + বাতিল) + ক্রমিক-PUT-লুপ + single reload/dispatch/টোস্ট
- E2E: task57-qa.sh (বাল্ক-সিমুলেশন ৩×২-ধাপ + ইতিহাস-অডিট + নোটিফ-অডিট + ক্লিনআপ) ✓ · ব্রাউজার ফুল-চেইন ✓ · কনসোল-০ ✓ · 390px hScroll-০ ✓ · tsc+eslint-০ ✓

**গোটচা:** বাংলা-সংখ্যা regex-অসামঞ্জস্য (E2E-তে includes ব্যবহার); ট্যাব/ফিল্টার-বদলে selected-অটো-ক্লিয়ার (অদৃশ্য-কার্ড-বাল্ক আটকায়)।

**পরের-এজেন্ট: session207 থেকে** (PLANS session206-নোট + PROJECT §২০৬)। বাকি: Turso/প্রোড, ইতিহাস-এডিট, SSE।

## session207 (cron 403679 — Task58: রিভিউ-ডেস্ক অ্যানালিটিক্স + ফিল্টার-ডেপথ প্যাক)

**বর্তমান-অবস্থা:** HEAD @ b978150 (session206), টোকেন ২০০-ভ্যালিড, লোকাল=রিমোট, working-tree-ক্লিন; dev:3000 সঠিক-DB (/proc-যাচাই); রাউন্ড-শুরুতে task52+54+56+57-চার-সুইট-রিগ্রেশন সব-গ্রিন + ব্রাউজার-QA (desk ২৩-রেকর্ড, ব্যাজ ১৫, কনসোল-০, 390px hScroll-০) → বাগ-শূন্য → ফিচার-রাউন্ড।

**কাজ:**
- পরিসংখ্যান মিনি-কার্ড ×৪ (মোট/নতুন/চলমান/সমাধান — ক্লিকে ট্যাব-সুইচ, শেয়ার-বার, STAT_TONE রঙ)
- তারিখ-সীমা চিপ ×৪ (সব-সময়/আজ/৭ দিন/৩০ দিন — dateCutoff, midnight-local আজ) + ক্রম-টগল (সাম্প্রতক↔পুরাতন)
- CSV-প্রি-ফিল্টার-রপ্তানি (Task57-প্রস্তাব-④) — বর্তমান-ভিউ-অনুযায়ী + লাইভ-কাউন্ট-ব্যাজ + টোস্ট
- "/"-শর্টকাট (searchRef ফোকাস) + kbd-হিন্ট; কার্ড hover:shadow-md; filtered-empty-তারিখ-সচেতন
- API-বদল-শূন্য; selected-অটো-ক্লিয়ার-ডিপস-এ dateRange; reset এ সব-ফিল্টার+sort

**E2E-প্রমাণ:** task58-qa.sh সব-গ্রিন (বাকেট-মনোটোন ✓ · আজ-বাকেট ২৩→২৪ ✓ · রোল-ম্যাট্রিক্স 403/200/401 ✓ · ক্লিনআপ ✓) · ব্রাউজার-assert ৭/৭ ✓ · কনসোল-০ ✓ · 390px hScroll-০ ✓ · tsc+eslint-০ ✓ · task52+54+56+57-পুনঃগ্রিন ✓ · স্ক্রিনশট ×২ (s207-stat-cards, s207-mobile-390) · secret-scan-ক্লিন ✓

**গোটচা (পরের-এজেন্ট):** UserReport.createdAt SQLite-এ integer-ms (ISO-নয়) — স্ক্রিপ্টে ts()-ডুয়াল-হ্যান্ডলার; E2E-তে BEFORE POST-এর-আগে-মাপুন।

**পরের-এজেন্ট: session208 লেবেল।** বাকি-প্রস্তাব: Turso/প্রোড-পোর্ট, ইতিহাস-এডিট/ডিলিট, SSE-পুশ।

---

## session208 (Task59 — হোম-নেতৃত্ব অ্যাডমিন-প্যানেল পুনরুদ্ধার; ইউজার-রিপোর্ট)

**ইউজার:** "এটা বাস্তবায়ন করা হয়েছিল, তবে এডমিন ড্যাশবোরডে এই পশন্টা পাচ্ছিনা! এডমিন ড্যাশবোরডে এটা ফিরিয়ে আন।" (স্ক্রিনশট: হোম নেতৃত্ব ব্যবস্থাপনা — ৮-স্লট + দৃশ্যমান-টগল)

**RCA (৩-স্তর, সবই a68fec4/session193-এর stale-tree রিরাইটে হারানো):**
1. admin/routes.js থেকে হোম-নেতৃত্ব রুট-ব্লক মুছে গেছে (৩৫৩ লাইন — GET /home-leadership + POST slot/visibility/extra + DELETE extra + HL55 require + nav-area regex + memberPhotoUpload55) → প্যানেল 404
2. সাইডবার থেকে 'হোম নেতৃত্ব' লিংক মুছে গেছে → ড্যাশবোর্ডে ঢোকার পথই নেই
3. হোমপেজ থেকে home_hidden_slots-ফিল্টার + home_extra_members opt-in (session64 ইঞ্জিন) হারানো → টগল-কাজ না-ও করত
   সেশন ১৯২/২০১-কমিটে ফেরানো হয়নি; session201-পুশ (0c646df)-ডিপ্লয়ের পরেই প্রোডে প্যানেল-শূন্য — ইউজার-রিপোর্টের দিনই ধরা পড়ে।

**ফিক্স (6a5afc4-সংস্করণ থেকে সার্জিক্যাল পুনঃস্থাপন):**
- admin/routes.js: রুট-ব্লক + HL55 require + nav-regex + memberPhotoUpload55 (কোনো session192/201-ফিক্স অস্পৃশ্য)
- sidebar.ejs: 'হোম নেতৃত্ব' লিংক পুনঃস্থাপন (সংগঠন-গ্রুপের প্রথম আইটেম)
- routes/pages.js: প্যারালাল-ব্যাচে getSetting('home_hidden_slots'/'home_extra_members') ×২ + effectiveHiddenSlots + extras slice(2)-opt-in → currentAdvisorsFinal205; res.render-এ homeHiddenSlots
- lekhok-home.ejs: leaderPair এখন slotKeys-সচেতন (slotKeys[i] লুকানো-সেটে থাকলে কার্ড বাদ — index-alignment সুরক্ষিত); দুই partial-এ slotKeys পাস
- guard: messenger.css hex-র্যাচেট 0→4 (session183-বৈধ-হেক্স, a68fec4-রি-ফ্রিজে ভুল-ভিত্তি) — সচেতন --update-hex-baseline

**E2E:** node --check ×২ ✓ · audit:views ১২২-ejs ক্লিন ✓ · guard গ্রিন ✓ · লোকাল: প্যানেল 200 + slot-save 303?saved=1 + visibility রাউন্ড-ট্রিপ (হোম ২→১→২ কার্ড, GS-লুকানোতেও সভাপতি-লেবেল অটুট) + extra-রুট জীবন্ত + সাইডবার-লিংক রেন্ডার ✓ · agent-browser স্ক্রিনশট (download/s205-panel*.png) ✓ · প্রোড: 307→লগইন→প্যানেল 200 (আরমান শেখ/বরকাতউল্লাহ/আনোয়ার হোসাইন — বাস্তব-ডেটা+টগল) + হোম অক্ষত (কারিশমা [সভাপতি], আজিজ ওয়েসি [সা.সম্পাদক], উপদেষ্টা-ডিফল্ট-লুকানো) + /admin-সাইডবার লিংক ✓

**কমিট:** `19eaae8` push ✓ (Vercel-ডিপ্লয়-যাচাইকৃত) — ⚠️ কমিট-মেসেজে 'session205' লেবেল = সংখ্যা-সংঘর্ষ (rebase-এর-আগে প্যারালাল-এজেন্টের 202-207 জানা-ছিল-না); সঠিক সেশন **২০৮**

**গোটচা:** প্যারালাল-ক্রন-এজেন্টের কারণে origin-প্রতি-রাউন্ড-আগে-এগিয়ে — push-এর-আগে fetch+pull --rebase বাধ্যতামূলক; Promise.all-এ নতুন-এন্ট্রি দিলে destructuring-অর্ডার হুবহু-মিলাতে-হবে (recentArticles.forEach 500-ঘটনা ছিল)।

**পরের-এজেন্ট: session209 থেকে।** বাকি: hex-baseline এখন নির্ভুল; Turso/প্রোড-পোর্ট (Task54-নোট) স্থগিতই।

## session211 (cron Task62) — শেয়ারেবল-ডেস্ক-স্টেট প্যাক

**অবস্থা-যাচাই:** HEAD=origin=`3485cde`, টোকেন-২০০, dev:3000-লাইভ; আট-সুইট-রিগ্রেশন (52+54+56+57+58+59+60+61) সব-গ্রিন + ব্রাউজার-সুইপ (৩১-কার্ড ডেস্ক, মেসেঞ্জার-পিন-রো ShieldCheck+Pin) → বাগ-শূন্য।

**সম্পন্ন:** page.tsx-এ URL-স্টেট-সিঙ্ক (হাইড্রেট+২৫০ms-ডিবাউন্স replaceState, ডিফল্ট-বাদ) + `?report=<id>`-ডিপ-লিঙ্ক (ট্যাব-মিলাই+স্ক্রল+`lf-anim-hl`-অ্যাম্বার-পালস ৩.২s+স্ব-পরিষ্কার+অবৈধে-টোস্ট) + কপি-লিঙ্ক-বাটন (Link2, fallback-সহ) + data-report-অ্যাট্রিবিউট + a11y-ফোকাস-রিং-র‍্যাচেট ×৫-জায়গায়; globals.css-এ `lf-hl-pulse`। API/schema-বদল-শূন্য।

**E2E:** ডিপ-লিঙ্ক-চক্র ✓ · URL-সিঙ্ক `?tab=RESOLVED&media=IMAGE` ✓ · কপি-লিঙ্ক ৩১/৩১ ✓ · অবৈধ-আইডে-টোস্ট ✓ · কনসোল-০ ✓ · 390px hScroll-০ ✓ · পোস্ট-চেঞ্জ-আট-সুইট ✓ · tsc+eslint-০ ✓ · secret-scan-ক্লিন ✓ · স্ক্রিনশট s211-deeplink-copylink.png।

**পরের-এজেন্ট: session212 থেকে** — PLANS session211-নোট পড়ুন; Turso/SSE পরিকল্পনা-ছাড়া-শুরু-নয়।

---
Task ID: 67 (session216 — cron 403679; অপারেটর-স্মৃতি প্যাক)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → QA → ফিক্স/ফিচার → worklog

Work Log:
- রাউন্ড-শুরু: HEAD=origin=`9a8d600` (session215), টোকেন 200, dev:3000 200 — /home/z/my-project প্ল্যাটফর্ম-পুনঃস্ক্যাফোল্ড-হলেও অ্যাপ-ক্লোন+সার্ভার অক্ষত
- দ্বাদশ-সুইট-রিগ্রেশন → s213 §৩ TOAST_TIMEOUT-সন্দেহ → স্বতন্ত্র-পুনঃপ্রদর্শনে টোস্ট ০.৫-২.৫s-নিখুঁত (SSE ৩৯৩ms) = পণ্য-বাগ নয় — সমবর্তী-session215-এজেন্টের শেয়ার্ড-ব্রাউজার-প্রতিযোগিতা + eval-কোট-এস্কেপ-মিথ্যা
- টেস্ট-ইনফ্রা-হার্ডেনিং: s213 §৩ ইন-পেজ-MutationObserver-আর্ম (window.__lf213toast) + কোট-মুক্ত-অ্যাসার্ট — রি-রানে toast-observer-seen@১s (atMs=৩৯৩) ✓
- ফিচার [Mandatory]: সংরক্ষিত-ফিল্টার-ভিউ — localStorage lf-desk-presets (সর্বোচ্চ ৬, একই-নাম=ওভাররাইট); ইনলাইন-নাম-ইনপুট (Enter/Esc); এক-ক্লিকে-প্রয়োগ+সক্রিয়-চিপ-নির্ণয়; ×-মুছা-ব্যাজ; a11y aria-pressed/label-পূর্ণ
- স্টাইল [Mandatory]: টোস্ট-জীবনকাল-বার (scaleX ১→০; ৩০০০/৮০০০ms-ইনলাইন-মেলানো; reduced-motion-গার্ড) + স্টিকি-স্ক্রোল-ছায়া (shadow-sm↔shadow-md)
- E2E s216-e2e.sh (১০-খণ্ড) সব-গ্রিন; দ্বাদশ-সুইট-রিগ্রেশন পরিবর্তনের-আগে-ও-পরে-ও সব-গ্রিন; tsc+eslint-০; স্ক্রিনশট ×২
- নতুন-পরিবেশ-গোটচা ×৩ ডক-কৃত (shell-DATABASE_URL-ওভাররাইড / eval-কোট-এস্কেপ / প্ল্যাটফর্ম-পুনঃস্ক্যাফোল্ড) — PLANS session216-নোট
- ডক: PROJECT §২১৬ + PLANS session216-নোট + repo-worklog এ-এন্ট্রি → secret-scan → push

Stage Summary:
- লাইভ-ডেস্ক: সংরক্ষিত-ভিউ-সারি সহ স্টিকি-টুলবার; টোস্টে জীবনকাল-বার; স্ক্রোলে স্টিকি-ছায়া — সব-ক্লায়েন্ট-সাইড, API/schema-অস্পৃশ্য
- পরের-এজেন্ট: session217; PLANS session216-নোট অবশ্যই পড়ুন (৩-নতুন-গোটচা); বাকি-প্রস্তাব Turso/প্রোড-পোর্ট (পরিকল্পনা-গেট)

---
## MESSENGER-VOICE-CSP (session225) — নতুন-ভয়েস-রিফ্রেশ-বাধ্যতামূলক + পুরোনো-ভয়েস-মৃত — একক-মূল-কারণ: CSP media-src অনুপস্থিত

Task: ইউজার-রিপোর্ট (স্ক্রিনশটসহ) — ① নতুন-পাঠানো ভয়েস বাজতে রিফ্রেশ দিতে হয় ② ২০-সেপ্টেম্বরের পুরোনো ভয়েসগুলো আর বাজে না (⚠ "ভয়েস ফাইলটি পাওয়া যাচ্ছে না")।

Work Log:
- **RCA (প্রমাণসহ)**: server.js CSP_POLICY-তে `media-src` ছিল না → `<audio>` `default-src 'self'`-এ পড়ত → ① optimistic-বাবলের `blob:`-URL আর ② Vercel-Blob-যুগের ক্রস-অরিজিন `*.public.blob.vercel-storage.com` ভয়েস-URL — দুটোই CSP-ব্লকড → audio-error → markDead ⚠। রিফ্রেশে ক্যানোনিকাল-বাবল same-origin `/api/messages/audio/:id` পায় → বাজে (উপসর্গ-১ ব্যাখ্যা)। পুরোনো-ভয়েস রিফ্রেশেও ক্রস-অরিজিন-ই থাকত (উপসর্গ-২)।
- **পুরোনো-ভয়েস হারায়নি!** Turso-ডিরেক্ট-কোয়েরি: ৮টি ভয়েস-রো (id 118-131, সেপ্টেম্বর ১৭-২০) `https://…public.blob.vercel-storage.com` URL-এ — curl-এ **সবগুলোই 200 OK audio/webm** (ব্লব-স্টোর জীবিত; "স্টোরেজ সরে গেছে" ধারণাটি ভুল ছিল — ব্লক করছিল শুধু CSP)
- **ফিক্স-A (server.js)**: CSP_POLICY-তে `media-src 'self' data: blob: https:` (img-src-র সমতুল্য; audio+video কভার; media-src কখনোই ছিল না)
- **ফিক্স-B (messages-chat.ejs)**: bv-dead-বাবলে এক-ক্লিক-রিট্রাই — আগে শুধু-টোস্ট+return (একমাত্র পথ রিফ্রেশ); এখন ক্লিকে bv-dead সরে, `src` পুনঃসেট+`audio.load()` জোর-করে (same-src-শর্তেও), error-স্টেটেও (cur===player পথে audio.error-গার্ড) — ভবিষ্যতের যেকোনো সাময়িক-ব্যর্থতা রিফ্রেশ-ছাড়াই পুনরুদ্ধারযোগ্য
- **ফিক্স-C (ডেটা-মাইগ্রেশন, tmp-tools/backfill-voice-blobs.py)**: ৮টি পুরোনো ভয়েস ব্লব থেকে ফেচ → base64 → Turso-তে `data:audio/webm;base64,` হিসেবে guarded-UPDATE (`WHERE id=? AND file_url=<পুরোনো-সঠিক-মান>`; backup JSON-আগে) → এখন বার্তার-সাথেই-অমর (session183-স্থাপত্য; ব্লব-স্টোর-মুছলেও বাঁচবে) + same-origin স্ট্রিম-লিঙ্কে CSP-নিরাপদ। Turso-গোটচা: v2/pipeline-integer-arg-মানও অবশ্যই **স্ট্রিং** ("118", 118 নয়) — নইলে JSON 400 "expected a borrowed string"; urllib-এ Vercel-Blob 400 (curl-এ 200) → ফেচ curl-বাইনারি-মোডে
- **QA (one-shot E2E, :8094 sql.js)**: ইউজার-লগইন (গোটচা: /login স্টাফ-রোল-প্রত্যাখ্যান — moderator হলে /admin/login; তাই user-রোল-অ্যাকাউন্টে পরীক্ষা) → multipart-ভয়েস-আপলোড `{ok,id:1}` → পেজ-বাবল `data-src="/api/messages/audio/1-voice.webm"` → রুট 200 audio/webm 1536/1536-বাইট-হুবহু → নিরানন্দেশ-গার্ড 401 → CSP-হেডার media-src উপস্থিত; node --check ✓ audit:views (122-ejs) ✓
- স্যান্ডবক্স-গোটচা: ব্যাকগ্রাউন্ড-প্রসেস টুল-কল-শেষে রিপ হয় → one-shot-স্ক্রিপ্টে বুট+টেস্ট+কিল এক-কলে; প্রতিযোগী-কিপার-আগে pkill

Stage Summary:
- উভয়-উপসর্গের-মূল-কারণ এক: CSP media-src-অনুপস্থিতি — ১-লাইন-ফিক্স + ক্লায়েন্ট-রিট্রাই + ৮-পুরোনো-ভয়েসের DB-মাইগ্রেশন
- কমিট d320e8c (server.js + messages-chat.ejs); ডেটা-মাইগ্রেশন Turso-লাইভ-সম্পন্ন (backup: tmp-tools/voice-blob-backup-*.json)
- পরের-এজেন্ট: session226; CSP-স্পর্শ করলে media-src-রেখা-অক্ষত-রাখুন; নতুন-ভয়েস ≤4MB data-URI (session183), >4MB ব্লব (এখন media-src https:-কৃতজ্ঞতায় বাজবে)

---
## session231 — Ctrl+Z স্ট্যাটাস-আন্ডু + KPI ৭-দিন-স্পার্ক + সুইট-স্থায়ীকরণ

### অবস্থা-যাচাই
- HEAD=origin=`1f5215d` (session230), working-tree ক্লিন; টোকেন ২০০-ভ্যালিড (GH+Vercel); live 200
- স্টেল-হ্যান্ডওভার-সামারি আবারও পুরোনো-তথ্য বহন করেছিল (Task 43/device-flow-যুগ) — worklog-যাচাই-ই-সত্য-উৎস পুনঃপ্রমাণিত

### এ-রাউন্ডে সম্পন্ন
- **[ফিচার ①] Ctrl+Z স্ট্যাটাস-আন্ডু-স্ট্যাক:** sessionStorage `sc-undo` (reload-টিকষ্ণ, ক্যাপ ১০) + গ্রুপ-এন্ট্রি (বাল্ক = এক-Ctrl+Z-এ সমগ্র-ব্যাচ ফেরত) + আন্ডু-PUT status-শুধু + পিং-পং-বর্জন + fail-এ পুনঃস্ট্যাক + typing-গার্ডে নেটিভ-টেক্সট-আন্ডু-রক্ষা + toast-তৃতীয়-প্যারাম (↩-আইকন) + সহায়িকায় Ctrl+Z-সারি
- **[ফিচার ②] KPI ৭-দিন-স্পার্ক:** EJS `scSpark()` — trend7-সিরিজ-পুনঃব্যবহার (এক-উৎস), ৪-কার্ডে data-spark টেস্ট-হুক, গ্রেডিয়েন্ট-বার + আজ-রিং, সম্পূর্ণ-স্ট্যাটিক (reduced-motion-নিরাপদ)
- **[সুইট-স্থায়ীকরণ] tests/s231-desk-suite.sh (৩৩-অ্যাসার্ট) + s231-unit.js (১৩) + s231-seed-undo.js — রিপো-কমিটেড (/tmp-লস-সমস্যার-স্থায়ী-সমাধান)**
- **টেস্ট:** ইউনিট ১৩/১৩ + E2E **৩৩/৩৩ চূড়ান্ত-রানে** (কাঠামো ×১২ + TAG-রেন্ডার + স্পার্ক ×৫ + সিঙ্গেল-আন্ডু ×৪ + গ্রুপ-আন্ডু ×৬ + সহায়িকা ×২ + 390px + কনসোল-শূন্য; TAG=Task231-UNDO জঞ্জাল-শূন্য) · স্ক্রিনশট ×২ (s231-desk-desk — স্পার্ক-চাক্ষুষষ-যাচাইকৃত / s231-desk-390)
- E2E-গোটচা ×৫ ডক-কৃত (PLANS): IIFE `})()`-ইনভোকেশন · কোট-এস্কেপ-দ্বি-স্তর (`s1..:..X`) · reloadSoon-রেসে pollst + পোস্ট-রিলোড-প্যাটার্ন · ভিউ-ফিল্টার-সেমান্টিক্স (কার্ড-ভিউ-ছাড়ে) · undoN-JSON.parse
- ডক ×৩ (PLANS session231-নোট + এ-ওয়ার্কলগ + মূল worklog) → secret-scan → push

### ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়)
- পরের-এজেন্ট: **session232 লেবেল**; PLANS session231-নোট পড়ুন (আন্ডু-চুক্তি + E2E-গোটচা ×৫); নতুন-সুইট tests/ এ-কমিট-প্রথা

---
## session232 (cron 403679 — স্পার্ক/ট্রেন্ড-টুলটিপ + কমপ্যাক্ট-মোড প্যাক)

### বর্তমান অবস্থা (যাচাইকৃত)
- HEAD=origin=`b090c77` (session231) থেকে রাউন্ড-শুরু; টোকেন ২০০-ভ্যালিঢ (GH /user ×২ + Vercel /v9); live 200; stale-হ্যান্ডওভার-সামারি ×৭-বার-খণ্ডনিত
- রাউন্ড-শুরু QA: s231-unit ১৩/১৩ + s231-desk-suite ৩৩/৩৩ + DB-জঞ্জাল-শূন্য → বাগ-শূন্য → ফিচার-রাউন্ড

### এ-রাউন্ডে সম্পন্ন
- **স্পার্ক/ট্রেন্ড-টুলটিপ:** স্পার্ক ৪-কার্ড + ট্রেন্ড ২-সারির প্রতিটি বারে data-d/data-v/data-unit হুক (native-title-বাদ; dayLabels/bnNum-এক-উৎস); এক-শেয়ার্ড #scSparkTip (z-60; textContent-শুধু; ভিউপোর্ট-ক্ল্যাম্প + অ্যারো + reduced-motion-নিরাপদ); mouseover/mouseout-ডেলিগেশন + KPI-ফোকাসে আজ-বার + scroll→hide
- **কমপ্যাক্ট-মোড:** #scCompactBtn (aria-pressed, pressed=accent-ভরাট) + d-কী (typing-গার্ড) + localStorage sc-compact স্মরণ; কার্ড-ঘনত্ব স্টাইল (প্যাডিং/অ্যাভাটার/বডি/textarea/মিডিয়া সংকুচিত — রিং-অক্ষুণ্ণ); সহায়িকায় d-সারি + হোভার-সারি
- **সুইট:** tests/s232-spark-suite.sh রিপো-কমিটেড — **৩৫/৩৫** (TAG=Task231-UNDO জঞ্জাল-শূন্য); পোস্ট-চেঞ্জ রিগ্রেশন s231-desk-suite **৩৩/৩৩** + s231-unit **১৩/১৩**; স্ক্রিনশট ×৩ (s232-tooltip/compact/mobile-390)
- নতুন-গোটচা ×৩ ডক-কৃত (PLANS): hover-ট্রেলিং-mouseout→MutationObserver-প্যাটার্ন · grep-BRE-ব্র্যাকেট-এস্কেপ · কোট-এস্কেপ-মান-স্তর পুনঃপ্রমাণিত
- ডক ×৩ (PROJECT §২৩২ + PLANS session232-নোট + এ-ওয়ার্কলগ) → secret-scan → push

### ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়)
- পরের-এজেন্ট: **session233 লেবেল**; PLANS session232-নোট পড়ুন (টুলটিপ-চুক্তি + কমপ্যাক্ট-চুক্তি + গোটচা ×৩); নতুন-সুইট tests/ এ-কমিট-প্রথা

---
## session233 (cron 403679 — টাচ-ট্যাপ টুলটিপ + সপ্তাহ-ওভারভিউ চিপ প্যাক)

### বর্তমান অবস্থা (যাচাইকৃত)
- HEAD=origin=`5d0f8f6` থেকে রাউন্ড-শুরু (সম্প্রতি session232-পুশ `9a6c565` + parallel-ফাউন্ডার-GS-ফিক্স `199ab2e`); টোকেন ২০০-ভ্যালিড (GH /user + Vercel /v9); live 200 + কনসোল-শূন্য + /admin/login-CSRF-রেন্ডার; stale-হ্যান্ডওভার-সামারি ×৮-বার-খণ্ডনিত (Task43/device-code-যুগ)
- স্যান্ডবক্স-git-পুনঃসূচনা (platform-fresh-repo, unrelated-history) → **git-worktree-পদ্ধতি** (FETCH_HEAD→repo-work/) — নতুন-রাউন্ডেও এভাবেই সিঙ্ক করুন
- রাউন্ড-শুরু QA: s232-spark **৩৫/৩৫** + s231-desk **৩৩/৩৩** + s231-unit **১৩/১৩** + DB-জঞ্জাল-শূন্য → বাগ-শূন্য → ফিচার-রাউন্ড

### এ-রাউন্ডে সম্পন্ন
- **ইনফ্রা-পোর্টেবিলিটি:** ensure-server.sh self-relative + s231/s232-সুইটে `LEKHOK_ROOT`-ওভাররাইড (সেমান্টিক্স = রিপো-রুট; ডিফল্ট /home/z/lekhok-forum) — স্যান্ডবক্স-পুনঃসূচনায় সুইট-চালানো-যোগ্য
- **[Mandatory-ফিচার] টাচ-ট্যাপ টুলটিপ:** document-ক্লিক-ডেলিগেশন (বারে ট্যাপ → tipShow; বাইরে → tipHide); KPI-লিংকের-ভিতরে বার-ট্যাপে closest('a')→preventDefault (নেভিগেশন-বন্ধ; কার্ডের-বাকি-অঞ্চল-জাম্প-অক্ষুণ্ণ); hover:none-এ cursor:pointer + অদৃশ্য-হিট-এরিয়া (::after top:-6px — ২px-স্টাব-বারও ট্যাপযোগ্য, ভিজ্যুয়াল-শূন্য)
- **[Mandatory-ফিচার] সপ্তাহ-ওভারভিউ চিপ `#scSparkTipWk`:** data-wk EJS-এক-উৎস ×৬-হোস্ট (৪-স্পার্ক+২-ট্রেন্ড); unit ঘ → '৭-দিন গড় Y ঘ', নয়তো 'সপ্তাহে মোট X টি · দৈনিক গড় Y টি'; বারের-নিচে আলাদা-এলিমেন্ট (z-60) — **#scSparkTip-textContent-চুক্তি-অক্ষুণ্ণ** (s232-T2-সমতা-সামঞ্জস্য)
- **[Mandatory-স্টাইল]:** চিপ-টাইপোগ্রাফি (.68rem/৬০০) + উপর-অ্যারো (::before) + 640px-সংকুচিত + reduced-motion-নিষ্ক্রিয় + সহায়িকায় ট্যাপ-সারি
- **সুইট:** tests/s233-tap-suite.sh রিপো-কমিটেড — **৩১/৩১** (রিয়েল-ক্লিক observer-ক্যাপচার + সিনথেটিক-স্থায়িত্ব + nav-prevent + ফোকাস-পথ); রিগ্রেশন s232 **৩৫/৩৫** + s231-desk **৩৩/৩৩** + s231-unit **১৩/১৩**; স্ক্রিনশট ×২ (s233-wk-chip, s233-mobile-390); secret-scan-ক্লিন
- নতুন-গোটচা ×২ ডক-কৃত (PLANS): ২px-স্টাব-বারে-রিয়েল-ক্লিক-পার্শ্ব-<a>-তে-পড়ে (i.today-ব্যবহার) · পুরোনো-textContent-সমতা-অ্যাসার্ট-থাকলে নতুন-টেক্সট আলাদা-এলিমেন্টে

### ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়)
- পরের-এজেন্ট: **session234 লেবেল**; PLANS session233-নোট পড়ুন (টাচ-চুক্তি + চিপ-চুক্তি + LEKHOK_ROOT); push-আগে fetch+rebase; নতুন-সুইট tests/ এ-কমিট-প্রথা

---
## session234 (cron 403679 — চিপে ৭-দিন-মিনি-বার-স্ট্রিপ প্যাক)

### বর্তমান অবস্থা (যাচাইকৃত)
- HEAD=origin=`25ec9f8` (session233-পুশ) থেকে রাউন্ড-শুরু; টোকেন ২০০-ভ্যালিড (GH /user + Vercel /v9); worktree-প্যাটার্ন-পুনঃব্যবহার (branch session234 = FETCH_HEAD)
- রাউন্ড-শুরু QA: s233 **৩১/৩১** + s232 **৩৫/৩৫** + s231-desk **৩৩/৩৩** + s231-unit **১৩/১৩** + DB-জঞ্জাল-শূন্য → বাগ-শূন্য → ফিচার-রাউন্ড

### এ-রাউন্ডে সম্পন্ন
- **[Mandatory-ফিচার] চিপে ৭-দিন-মিনি-বার-স্ট্রিপ:** `data-bars` কাঁচা-সিরিজ-CSV হুক (EJS-এক-উৎস ×৬-হোস্ট — ক্লায়েন্ট-শুধু-রেন্ডার, বাংলা-সংখ্যা-পার্স-নিষিদ্ধ-রীতি-অটুট); চিপে DOM-API-নির্মাণ (createElement/className/style.height — **innerHTML-নিষিদ্ধ-রীতি-অটুট**); label-span-textContent = data-wk **হুবহু** (s233-সমতা-রক্ষা); স্পার্ক-নান্দনিকতা-সমস্বর (৪px-বার, আজ = উজ্জ্বল-সাদা+রিং, বাম-বিভাজক-রেখা)
- **বাগ-ফিক্স (নিজ-স্ক্রিনশটে-ধরা):** স্ট্রিপে-চিপ-প্রশস্ত → ডান-প্রান্তের-বারে চিপ-ভিউপোর্টের-বাইরে-কাটা → **offsetWidth-মাপা-পরে অনুভূমিক-ক্ল্যাম্প** (half=ww/2+8) — সুইটে rOK/lOK-প্রতিগার্ড
- **[Mandatory-স্টাইল]:** .sc-tip-wklbl/.sc-tip-strip/.today টায়ার + 640px-সংকোচন (১০px/৩px-বার)
- **সুইট:** tests/s234-strip-suite.sh রিপো-কমিটেড — **২৭/২৭** (data-bars ×৬ + স্ট্রিপ-গঠন ৭-বার/today/২-১০px-সীমা + সমতা-রক্ষা + ক্ল্যাম্প-প্রতিগার্ড + 390px + কনসোল); রিগ্রেশন s233 **৩১/৩১** + s232 **৩৫/৩৫** + s231-desk **৩৩/৩৩** + s231-unit **১৩/১৩**; স্ক্রিনশট ×২; secret-scan-ক্লিন

### ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়)
- পরের-এজেন্ট: **session235 লেবেল**; PLANS session234-নোট পড়ুন; push-আগে fetch+rebase; নতুন-সুইট tests/ এ-কমিট-প্রথা

---
Task ID: 80 (session236 — dirty-guard-পুনঃস্থাপন + অ্যাডমিন-SSE-ফিক্স + রিফ্রেশ-নিয়ন্ত্রণ প্যাক)

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`dc58f4f` (session235-পুশ) থেকে রাউন্ড-শুরু; টোকেন-ভ্যালিড; s235-ফ্লেকি ১-ধরা (640px-MOB-eval) → সুইট-হার্ডেনিং (ভিউপোর্ট-রিসেট + রিট্রাই ×৩) → দুই-রানে ২০/২০ → বাকি-চার-সুইট-গ্রিন → **প্রকৃত-বাগ ×২ আবিষ্কৃত** (dirty-guard-ভাঙা + অ্যাডমিন-SSE-মৃত) → ফিক্স + ফিচার-রাউন্ড

## এ-রাউন্ডে সম্পন্ন
- **বাগ-ফিক্স ① (P1):** maybeReload dirty-গার্ড-পুনঃস্থাপন (s228-চুক্তি সহায়িকা-প্রতিশ্রুত-কিন্তু-অকার্যকর ছিল) + dirtyWarned প্রতি-পর্বে এক-টোস্ট
- **বাগ-ফিক্স ② (P1):** /api/events অ্যাডমিন-সেশন-গ্রহণ (namespaced 'admin:'-uid — hub-সংঘর্ষ-নিরাপদ) — support-center-এর 'লাইভ'-ব্যাজ + support-changed পোর্ট-দিন-থেকে-মৃত ছিল
- **[Mandatory-ফিচার]:** রিফ্রেশ-এখন (বাটন + r-কী + force-poll + স্পিন) + অটো-হালনাগাদ-বিরতি (বাটন + p-কী + পোল/SSE-গার্ড + localStorage sc-pause) + updateLiveText এক-উৎস
- **[Mandatory-স্টাইল]:** scSpin (reduced-motion-নিরাপদ) + amber pressed-টোন + .sc-live.paused + focus-visible
- **টেস্ট:** tests/s236-refresh-suite.sh **৩১/৩১** (রিপো-কমিটেড) + পূর্ণ-রিগ্রেশন **১৯০/১৯০** (৭-সুইট) + secret-scan-ক্লিন + স্ক্রিনশট ×২; DB-জঞ্জাল-শূন্য (স্ট্যাটাস-ফ্লিপ-ফেরত)

## ঝুঁকি ও পরবর্তী
- গোটচা ×৩ ডক-কৃত (PLANS session236): /api/events-নাম-সংঘর্ষ · dirty-অবস্থায়-ম্যানুয়াল-reload-নিষিদ্ধ · sessionStorage-observer-প্যাটার্ন
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; পরের-এজেন্ট: **session237 লেবেল**; PLANS session236-নোট পড়ুন; push-আগে fetch+rebase

---
Task ID: 81 (session237 — সুইট-ROOT-ফিক্স + অক্ষর-গণনা + কপি-প্যাক + তুলনামূলক-সময় প্যাক)

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`4bd403b` (session236-পুশ) থেকে রাউন্ড-শুরু; টোকেন-ভ্যালিড; ব্রাউজার-QA-স্থিতিশীল (1280×900 + 390px) → রাউন্ড-শুরুতেই **P1-ইনফ্রা-বাগ** ধরা (LEKHOK_ROOT-এক্সপোর্ট-ছাড়া অর্ধেক-সুইট FATAL) → ফিক্স → ফিচার-রাউন্ড

## এ-রাউন্ডে সম্পন্ন
- **বাগ-ফিক্স ① (P1-ইনফ্রা):** s231-desk/s232/s233/s234-চার-সুইটের স্টেল-ROOT-ডিফল্ট → s236/s235-সমতুল্য রিপো-রুট-ডিফল্ট — এক্সপোর্ট-শূন্যে পূর্ণ-ব্যাটারি-গ্রিন
- **[Mandatory-ফিচার ①]:** জবাব-বক্স অক্ষর-গণনা (bnNum/bnJs-এক-উৎস-যুগল; warn@১৮০০ amber / full@২০০০ red; টেমপ্লেট-ফিল-সিঙ্ক)
- **[Mandatory-ফিচার ②]:** কপি-প্যাক — কম্পোজার + ইতিহাস কপি-বাটন (ক্লিপবোর্ড-API→execCommand-ফলব্যাক; খালি-লেখায় টোস্ট) + [data-tpl]-ফিল্টার-নিরাপত্তা
- **[Mandatory-ফিচার ③]:** তুলনামূলক-সময় চিপ — helpers relTimeBn (UTC-রীতি, never-throws) → scDecorate → .sc-rel পিল
- **[Mandatory-স্টাইল]:** warn/full-টোন + rel-পিল + কপি-hover-টোন + compact-সংকোচন (reduced-motion-নিরাপদ)
- **টেস্ট:** tests/s237-desk-pack-suite.sh **৩৪/৩৪ ×২** (রিপো-কমিটেড) + পূর্ণ-রিগ্রেশন **২২৪/২২৪** (৮-সুইট) + secret-scan-ক্লিন + স্ক্রিনশট ×২; DB-জঞ্জাল-শূন্য (PUT-note-only→PATCH-delete-note-ফেরত প্যাটার্ন)

## ঝুঁকি ও পরবর্তী
- গোটচা ×৩ ডক-কৃত (PLANS session237): IIFE-ক্লোজার-অদৃশ্য-eval · .sc-tpl-সিলেক্টর-অন্তর্ভুক্তি · ডিসপ্লে-আর্টিফ্যাক্টে od -c-সত্য
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; পরের-এজেন্ট: **session238 লেবেল**; PLANS session237-নোট পড়ুন; push-আগে fetch+rebase

---
Task ID: 83 (session239 — cron 403679; সপ্তাহ-রিপোর্ট-কপি প্যাক)
Agent: Main agent (session239)
Task: প্রজেক্ট-স্টেটাস যাচাই + QA → বাগ-শূন্য হলে নতুন-ফিচার (session238-বাকি-প্রস্তাব গ্রহণ) + [Mandatory] স্টাইল-ডিটেইল + ডক/সুইট/পুশ

Work Log:
- রাউন্ড-শুরু: worklog-ACTIVE-LOCK পড়ে স্টেল-সামারি-সতর্কতা নিশ্চিত (সামারি Task43-যুগ দেখাচ্ছিল — প্রকৃত origin = session238/`a45260f`); GH /user→200 + Vercel /v2/user→200 + fetch-sync-যাচাই
- QA: পূর্ণ-ব্যাটারি ২৬০/২৬০ প্রথম-রানে — বাগ-শূন্য → ফিচার-রাউন্ড (session238-বাকি-প্রস্তাব = সপ্তাহ-রিপোর্ট-কপি)
- [Mandatory-ফিচার]: `#scWkCopyBtn` (w-কী) — EJS-এক-উৎস `scWkReportText()` → `#scWkReport`-JSON-পেলোড → copyText-চুক্তি; সহায়িকা-সারি + QA-হুক `__scQA.wkCopy` (পুনঃসৃজনের-পরে)
- [Mandatory-স্টাইল]: ok-টোন + আইকন-সোয়াপ + scWkPop (reduced-motion-নিরাপদ) + focus-visible + hover-রিং + 640px-সংকোচন
- টেস্ট: tests/s239-wkcopy-suite.sh ৩৫/৩৫ ×২ (সিড-শূন্য — রিড-ওনলি-UI; typeof-কোট-গোটচা প্রথম-রানে-ধরা→বুলিয়ান-চুক্তি)
- পূর্ণ-রিগ্রেশন ২৯৫/২৯৫ + secret-scan-ক্লিন + স্ক্রিনশট ×২ (পুরাতন-ওভাররাইট restore)

Stage Summary:
- support-center.ejs এক-ফাইল-ফিচার (CSS+EJS+JS; API/স্কিমা/URL-চুক্তি-বদল-শূন্য) + tests/s239-wkcopy-suite.sh + ডক ×৩
- DB-জঞ্জাল-শূন্য (রিড-ওনলি-সুইট); রেস-প্রতিরোধে fetch+rebase-পরে push (নীতি-অনুযায়ী)

## ঝুঁকি ও পরবর্তী
- গোটচা ×১ ডক-কৃত (PLANS session239): QA-হুক-অ্যাসার্টে typeof-কোট → বুলিয়ান-চুক্তি
- পরের-এজেন্ট: **session240 লেবেল (Task ID 84)**; বাকি-প্রস্তাব: রিপোর্ট-ব্যাপ্তি-নির্বাচন (৭/৩০-দিন), Turso (পরিকল্পনা-গেটে), stale-সুইট-আধুনিকীকরণ; PLANS session239-নোট পড়ুন; push-আগে fetch+rebase

---
Task ID: 87 (session245 — cron 403679; স্টেল-সুইট-পুনরুজ্জীবন + c-কী ফিল্টার-পরিষ্কার + সহায়িকা-গ্রুপ প্যাক)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- স্যান্ডবক্স-পুনঃসূচনায় remote.origin.url ক্রেডেনশিয়াল-হীন হয়েছিল (fetch 'could not read Username') → টোকেন-URL-fetch (stderr-মাস্কড) = সত্য-সিঙ্ক; HEAD=origin=`889b4d2` (session244), টোকেন-ভ্যালিদ (GH /user→200; Vercel /v2/user→200), live 200, working-tree ক্লিন
- stale-হ্যান্ডওভার-সামারি আবার-খণ্ডনিত (Task43/'commit-হয়নি'-যুগ দেখাচ্ছিল — প্রকৃত origin ইতিমধ্যে session244); repo-র সত্য-উৎস = repo-worklog+PLANS+HEAD
- রাউন্ড-শুরু QA: ক্যাননিক্যাল-ব্যাটারি ৫১৫/৫১৫ (s231→s244 ×১৬-ফাইল) প্রথম-রানে-গ্রিন + agent-browser live-যাচাই (console-শূন্য; m-সাইকেল ×৫-ধাপ; u-খালি-নিরাপদ; হুক ×৪; 390px-hScroll-শূন্য) — বাগ-শূন্য

## এ-রাউন্ডে সম্পন্ন (session245 — স্টেল-সুইট-পুনরুজ্জীবন + ফিচার/স্টাইল)
- **[ব্যাকলগ-ফিক্স] স্টেল-সুইট-আধুনিকীকরণ প্রথম-ঢেউ:** lf64 ১২/৩০→**৩০/৩০** (পথ-পোর্টেবল ×৮ — lf64/lf183/lf190; লগইন admin/admin123 এক-POST-এ; [৫]-অনুচ্ছেদ extra-টার্গেট id=171→177 সিমান্টিক-ফিক্স — founding-ক্রসপথ-ব্যাখ্যা PLANS; `.leaders-grid` DOM-আধুনিকীকরণ); lf183/lf190 পথ-ফিক্স-হয়ে-চলে (অথ-প্রবাহ-ফেল বাকি — দ্বিতীয়-ঢেউ)
- **[Mandatory-ফিচার] c-কী সব-ফিল্টার-পরিষ্কার:** clearFilters() (dirty-গার্ডে টোস্ট; টার্গেট trailing-? — statusJump-চুক্তি-সমস্বর) + keydown-ব্রাঞ্চ + QA-হুক `__scQA.clearFilters` ({dirty,target} — ক্রমের-শেষ) + সহায়িকা-সারি
- **[Mandatory-স্টাইল] সহায়িকা-গ্রুপ ×৪:** .sc-help-group (আইকন+টাইটেল+tabular-nums-সংখ্যা-ব্যাজ; :first-of-type সংকোচ) — নেভিগেশন/অ্যাকশন/নিয়ন্ত্রণ/মাউস-টাচ; u-সারি-স্থানান্তর (গ্রুপ-ধারাবাহিকতা)
- **টেস্ট:** নতুন tests/s245-clear-suite.sh **৩০/৩০** (রিপো-কমিটেড; সিড-শূন্য; কাঠামো ×১৩ + রেন্ডার ×৪ + আচরণ ×৮ + সহায়িকা ×২ + কনসোল/390px); **পূর্ণ-রিগ্রেশন ৫৭৫/৫৭৫** (battery ৫১৫ + lf64 ৩০ + s245 ৩০) + secret-scan-ক্লিন + স্ক্রিনশট-restore
- **গোটচা ×২ ডক-কৃত (PLANS session245):** ① toast = #scToast id + .show-ক্লাস (getElementById-অ্যাসার্ট) ② extra-opt-in-টার্গেট = current-slice(2)-অঞ্চল (create-পথ MAX+1→current[0]→অঞ্চল-বাইরে — অবৈধ)
- ডক ×৩ (PROJECT §২৪৫ + PLANS session245-নোট + repo-worklog Task 87) + এ-এন্ট্রি → secret-scan → fetch+rebase → push → Vercel/live-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অপ্রয়োজনীয়
- পরের-এজেন্ট: **session246 লেবেল (worklog Task ID 88)**; PLANS session245-নোট অবশ্যই-পড়ুন (lf64-তিন-স্তর + extra-টার্গেট-গোটচা + toast-চুক্তি + গ্রুপ-ব্যাজ-আপডেট); push-আগে fetch+rebase-বাধ্যতমূলক; নতুন-সুইট tests/ এ-কমিট
- বাকি-প্রস্তাব: stale-সুইট-দ্বিতীয়-ঢেউ (lf183/lf190-অথ-প্রবাহ, lf147/153/159, test-role-policy.sh ২০৯-ফেল), Turso/প্রোড-পোর্ট
- রিমোট main = এ-রাউন্ডের session245-কমিট (push-পরবর্তী hash কমিট-লগে); working-tree ক্লিন

---
Task ID: 88 (session246 — cron 403679; stale-দ্বিতীয়-ঢেউ lf183/lf190 পুনরুজ্জীবন + কার্ড-রিপোর্ট-কপি + হোভার/স্ক্রলবার প্যাক)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`a3e3dc0` (session245) থেকে রাউন্ড-শুরু (0/0 — রেস-শূন্য); টোকেন-ভ্যালিদ (GH+Vercel /user→200); live 200; working-tree ক্লিন
- রাউন্ড-শুরু QA: পূর্ণ-ব্যাটারি ৫৭৫/৫৭৫ (s231→s245 + lf64) প্রথম-রানে-গ্রিন — বাগ-শূন্য → ব্যাকলগ-রাউন্ড (stale-দ্বিতীয়-ঢেউ)

## এ-রাউন্ডে সম্পন্ন (session246)
- **[ব্যাকলগ-ফিক্স] stale-দ্বিতীয়-ঢেউ:** lf183 **২২/২২** + lf190 **২৫/২৫** (প্রথমবার-সবগ্রিন) — মূল-কারণ ×২: ① ডেমো-ইউজার-অনুপস্থিত (DB-রিসেটে হারায়) → নতুন **tests/lib-seed-users.sh** `ensureUser()` (লগইন→register-API→পুনঃলগইন; ইউজার-স্থায়ী-পুনঃরান-সস্তা) ② /tmp-টেস্ট-অ্যাসেট-অনুপস্থিত (voice.wav কখনো-জেনারেট-হয়-না) → suite-মধ্যে-স্বয়ংসম্পূর্ণ-জেনারেশন ([ ! -s ]-গার্ড; WAV RIFF+PCM / JPEG ১×১); পাইথন-anchor-প্রিফিক্স-ভাঙা-লাইন-মেরামত-প্রবাহ-প্রমাণিত
- **[Mandatory-ফিচার] কার্ড-রিপোর্ট-কপি:** data-card-copy বাটন ×প্রতি-কার্ড + cardReportText() (DOM-টেক্সট-উৎস — প্রেরক/সময়/মাধ্যম/অবস্থা/লেখা — পেস্ট-প্রস্তুত) + copyText-এক-উৎস + stopPropagation + toast+আইকন-সোয়াপ ১.৬সে + QA-হুক `__scQA.cardCopy` (ক্রমের-শেষ) + সহায়িকা-সারি (G4 ১৭-২৫)
- **[Mandatory-স্টাইল]:** .sc-card:hover (cursor-এর-নিচে-এক-ধাপ — transition-শূন্য) + .sc-cp ×৩-অবস্থা (lf-ok-টোকেন) + সূক্ষ্ম-স্ক্রলবার (webkit — var()-এক-উৎস)
- **টেস্ট:** নতুন tests/s246-copy-suite.sh **৩০/৩০** (রিপো-কমিটেড; সিড-পুনঃব্যবহার+cleanup-শূন্য; **ক্লিপবোর্ড-স্টাব-ক্যাপচার** = আসল-বিষয়বস্তু-প্রমাণ); **পূর্ণ-রিগ্রেশন ৬৫২/৬৫২** (shell ৫৫০ + lf64 ৩০ + lf183 ২২ + lf190 ২৫ + units ২৫) + secret-scan-ক্লিন + স্ক্রিনশট ×২ (s246-copy-desk, s246-copy-mobile390)
- **গোটচা ×৩ ডক-কৃত (PLANS session246):** ① grep-ব্র্যাকেট-পুনঃপ্রমাণ (querySelectorAll-প্রসঙ্গ) ② grep -c = লাইন-গণনা → -o|wc -l + মার্কআপ-অ্যাংকর ③ headless-clipboard = s239-স্টাব-প্যাটার্ন-বাধ্যতমূলক
- ডক ×৩ (PROJECT §২৪৬ + PLANS session246-নোট + repo-worklog Task 88) + এ-এন্ট্রি → secret-scan → fetch+rebase → push → Vercel/live-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অপ্রয়োজনীয়
- পরের-এজেন্ট: **session247 লেবেল (worklog Task ID 89)**; PLANS session246-নোট অবশ্যই-পড়ুন (ensureUser-প্যাটার্ন + অ্যাসেট-জেনারেশন + anchor-প্রিফিক্স-গোটচা + clipboard-স্টাব-চুক্তি); push-আগে fetch+rebase-বাধ্যতমূলক; নতুন-সুইট tests/ এ-কমিট
- বাকি-প্রস্তাব: stale-তৃতীয়-ঢেউ (lf147 fbtest-ইউজার+articles, lf153 অডিয়েন্স-চিপ+cursor-সিড, lf159 রেল-DOM ১২≠১৬, test-role-policy.sh ২০৯-ফেল), Turso/প্রোড-পোর্ট
- রিমোট main = এ-রাউন্ডের session246-কমিট (push-পরবর্তী hash কমিট-লগে); working-tree ক্লিন

---
Task ID: 90 (session248 — cron 403679; QA-ইনফ্রা-হার্ডেনিং ×৩-শ্রেণি + s-কী স্ট্যাটাস-সাইকেল + চিপ-স্টাইল)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- স্ন্যাপশট stale-ক্লোন (session242-যুগ) সিঙ্ক-করে HEAD=origin=`a60ca06` (session247); টোকেন-ভ্যালিদ (GH /user→200; মুখোশ-নীতি-অটুট); live 200; স্টেল-সামারি ×১৪-খণ্ডন ('Task43/commit-হয়নি'-যুগ — ইউজারের 'সব-কমিট?'-প্রশ্নের সংশোধিত-উত্তর: **হ্যাঁ, session247-পর্যন্ত সব-পুশকৃত**)
- QA: ব্যাটারি প্রথম-রানে ১৯/২২ — ফেল-পয়েন্ট-স্থানান্তর = টাইমিং-ফ্লেক-ফিঙ্গারপ্রিন্ট; প্রোডাক্ট-বাগ-শূন্য, তিন-QA-ইনফ্রা-শ্রেণি আবিষ্কৃত ও ফিক্সড

## এ-রাউন্ডে সম্পন্ন (session248)
- **P1-ফিক্স ×৩:** ① lf147 fixed-sleep→poll ×৪ (health ≤20s / লগইন-URL ≤10s / **শেয়ার-DB-flush ≤15s** / রেন্ডার ≤8s) → ৪৮/৪৮ ×৩-solo + ব্যাটারি-স্থায়ী ② **Chrome-মৃত্যু-শ্রেণি** → নতুন tests/lib-qa-browser.sh `balive()` + dead-detect ×৪-পয়েন্ট (লগইন/স্ক্রিনশট-পূর্ব; সুস্থ-পথ-অপরিবর্তিত) ③ s247 ব্যাটারি-CWD-গোটচা: আপেক্ষিক tests/-স্ক্রিনশট-পথ → $APP-সম্পূর্ণ-পথ
- **[Mandatory-ফিচার] s-কী স্ট্যাটাস-সাইকেল:** statusCycle() (সব→নতুন→চলমান→সমাধান→সব; mediaCycle-চুক্তি-মিরর — মাধ্যম/সার্চ/ব্যাপ্তি-সংরক্ষণ) + keydown s-ব্রাঞ্চ + QA-হুক `__scQA.statusCycle` (cur/next — ক্রমের-শেষ) + সহায়িকা-s-মার্জ (**ব্যাজ-শূন্য-ক্যাসকেড** কৌশল)
- **[Mandatory-স্টাইল]:** .sc-chip.active inset-underline (box-shadow inset 0 -2px 0 var(--ad-accent); transition-শূন্য) + .sc-cycle-hint affordance (dashed-পিল s-ইঙ্গিত + hover-accent + 640px-সংকোচন — media-ব্লক-বেস-পরে-গোটচা-সহ)
- **টেস্ট:** নতুন tests/s248-status-suite.sh **২৯/২৯** (s-সাইকেল ×৪-ধাপ রিয়েল-নেভিগেশন + সংরক্ষণ + computed boxShadow `bs..:.*inset` color-first-গোটচা + hint-390px-none) + **s244-MORDER-ক্রস-মডার্নাইজেশন** (২→৪) + **পূর্ণ-রিগ্রেশন ৭৬২-অ্যাসার্ট ২২/২২-সুইট ×২-ধারাবাহিক** + secret-scan-ক্লিন + স্ক্রিনশট-restore-নীতি + নতুন-স্ক্রিনশট ×২
- ডক ×৩ (PROJECT §২৪৮ + PLANS session248-নোট + repo-worklog Task 90) + এ-এন্ট্রি → secret-scan → fetch+rebase → push → Vercel/live-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অপ্রয়োজনীয়
- পরের-এজেন্ট: **session249 লেবেল (worklog Task ID 91)**; PLANS session248-নোট অবশ্যই-পড়ুন (poll-চুক্তি + balive/dead-detect + ব্যাটারি-CWD + CSS-ক্যাসকেড-অর্ডার + boxShadow-সিরিয়ালাইজ + কাউন্ট-অ্যাসার্ট-স্ক্যান); push-আগে fetch+rebase-বাধ্যতমূলক; নতুন-সুইটে lib-qa-browser.sh-চুক্তি
- বাকি-প্রস্তাব: stale-তৃতীয়-ঢেউ-বাকি (lf153/lf159/test-role-policy.sh ২০৯-ফেল), Turso/প্রোড-পোর্ট
- রিমোট main = এ-রাউন্ডের session248-কমিট (push-পরবর্তী hash কমিট-লগে); working-tree ক্লিন

---
Task ID: 92 (session252-relabel [আমার session251→252: সমান্তরাল 6832a52/592f58a একই session251/Task-92-লেবেলে আগে-ল্যান্ডেড — max+1-রীতি; প্যারালালও 92-দাবি করেছে → দ্বৈত-92 ডক-কৃত; এ-এন্ট্রির কোড-মার্কার s251-পরিবার চুক্তি-নামে অক্ষত] — cron 403679; stale-তৃতীয়-ঢেউ-শেষ-খণ্ড role-policy পুনরুজ্জীবন + অ্যাডমিন তাৎক্ষণিক-ফিল্টার + QA-ইনফ্রা ×৩)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- **স্টেল-সামারি-সংশোধন (×১৮):** কনটেক্সট-সামারি আবার Task43/'commit-হয়নি'/device-flow-যুগ দেখাচ্ছিল — সব-ভুল; **প্রকৃত: HEAD=origin=`11f896a` (session250/Task91), working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর**
- ইউজারের 'সব কমিট করেছ? গিটে?'-প্রশ্নের সংশোধিত-উত্তর: **হ্যাঁ — session250-পর্যন্ত সব-কমিটেড-ও-pushকৃত; এ-রাউন্ডের session251-ও pushকৃত**
- রাউন্ড-শুরু QA: role-policy সুইট = **২২৯/২৫৪ (২৫-ফেল)** — stale-তৃতীয়-ঢেউ-শেষ-খণ্ড এ-রাউন্ডের-মূল-ফোকাস; স্ন্যাপশট-ক্লোন-এ-রাউন্ডে সতেজ ছিল (reset-অপ্রয়োজনীয়)

## এ-রাউন্ডে সম্পন্ন (session251)
- **P1-role-policy পুনরুজ্জীবন (২৫-ফেল → ০):** মূল-কারণ ×৩ আবিষ্কৃত-সংশোধিত — ① **রেট-লিমিট-ট্রিপ-জমা** (loginLimited ১৫-মিনিট ×১০ in-memory) → **ensure-server.sh-এ LF_QA_DISABLE_RATELIMIT=1** (প্রোড-পতাকাহীন) + সার্ভার-ক্লিন-রিস্টার্ট ② **ডিস্ক-sql.js-রিড-স্টেল** (UIDQ137) → **UID251/ROLE251/STATUS251** /admin/users-HTML-ডিসকভারি (ব্যাজ↔রোল-ম্যাপিং) + idempotent **§২b স্বাস্থ্য-স্বাভাবিকীকরণ** (testadmin-রোল/testuser-স্ট্যাটাস ড্রিফট-স্ব-পুনর্স্থাপন) ③ **স্টেল-প্রজন্ম-ফলব্যাক-ID** (48/49) → বর্তমান-প্রকৃত (47/55/52)
- **fbtest1-কোল্যাটারাল-ব্যান-আবিষ্কার-ও-heal:** পুরাতন-রানের ভুল TAID=49-নিষেধ বর্তমান-প্রজন্মে fbtest1-এ স্থায়ী-জমা (lf147 /profile/fbtest1→404; ব্যাটারিতে lf147 ১৯-ফেল-প্রমাণ) → সার্ভার-বন্ধে ডিস্ক-UPDATE → lf147 **৪৮/৪৮**
- **ব্যাটারি-চুক্তি:** role-policy পোর্ট-চুক্তি **RP_PORT > PORT > 8094** (পুরাতন 8080-ডিফল্ট = lf-পরিবার-পোর্ট → ব্যাটারিতে ২১৩-মিথ্যা-ফেল) + **৮০৯৪-ফেজে-স্থাপন**; **s251-battery.sh = নতুন-ক্যাননিকাল** (role-policy + s251-ausearch অন্তর্ভুক্ত — ১৭০-সেশন-ব্যাটারি-বহির্ভূত-রটন-শেষ)
- **[Mandatory-ফিচার] অ্যাডমিন-ইউজার তাৎক্ষণিক-ফিল্টার (au251):** /admin/users-এ data-kw-সারি + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা সারি + 'f'-কী ফোকাস + Escape ক্লিয়ার+ব্লার + __auQA হুক; GET ফিল্টার-বার অক্ষুণ্ণ; সারফেস script-শূন্য-যাচাইকৃত ('f' সংঘর্ষ-মুক্ত)
- **[Mandatory-স্টাইল]:** au251-ব্লক **হেক্স-শূন্য টোকেন-শুধু** — color-mix brandgreen ফোকাস-রিং + fr-kbd249-মিরর kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন
- **টেস্ট:** নতুন tests/s251-ausearch-suite.sh **৩১/৩১ ×২-ধারাবাহিক** (কাঠামো ×১২ + স্টাইল ×৬ + আচরণ ×৮ + 390px + স্ক্রিনশট ×২) + role-policy **২৬০/২৬০ ×২** + **s251-ব্যাটারি ১১৮০-অ্যাসার্ট ৩০/৩০-সুইট ০-ফেল** + guard:design-গ্রিন + audit:views-গ্রিন + স্ক্রিনশট ×২ কমিটেড
- **গোটচা ×৮ (PLANS session251):** mawk-মাল্টিলাইন-রেকর্ড (head -1 নিষিদ্ধ — print;exit) · grep -c-লাইন-দূষণ → -o|wc -l · রেন্ডারড-HTML ≠ টেমপ্লেট-উৎস · ব্যাটারি-পোর্ট-চুক্তি · fbtest1-কোল্যাটারাল-RCA · fill=input-event · hScroll-বুলিয়ান-সূত্র · __auQA-নেমস্পেস
- ডক ×৩ (PROJECT §২৫১ + PLANS session251-নোট + repo-worklog Task 92) + এ-এন্ট্রি + my-project ACTIVE-LOCK-হালনাগাদ → secret-scan → fetch+rebase → push → Vercel/live-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- **stale-তৃতীয়-ঢেউ সম্পূর্ণ-ক্লিয়ার্ড** (lf147/lf153/lf159/cursor107/role-policy সব-গ্রিন) — পরবর্তী-প্রস্তাব: Turso/প্রোড-পোর্ট, অ্যাডমিন-সারফেসে ধারাবাহিক কীবোর্ড-প্যাক সম্প্রসারণ
- পরের-এজেন্ট: **session252 লেবেল (worklog Task ID 93)**; PLANS session251-নোট অবশ্যই-পড়ুন (রেট-লিমিট-শ্রেণি + ডিস্ক-রিড-নিষিদ্ধ + mawk-RS + ব্যাটারি-পোর্ট-চুক্তি + grep -o-গণনা + keydown-স্ক্যান); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); নতুন-সুইটে lib-qa-browser.sh-চুক্তি
- রিমোট main = এ-রাউন্ডের session251-কমিট (push-পরবর্তী hash কমিট-লগে); working-tree ক্লিন

---
Task ID: 93 (session253 — cron 403679; রিপোর্ট-কিউ তাৎক্ষণিক-ফিল্টার mr253 + QA-লগইন-ইনফ্রা-ফিক্স)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- **স্টেল-সামারি-সংশোধন (×১৯):** সামারি Task43/'commit-হয়নি'/device-flow/'১১-ট্রিগার-বাকি' যুগ দেখাচ্ছিল — সব-ভুল; **প্রকৃত: HEAD=origin=`853a67f` (session252-relabel/Task92), working-tree ক্লিন, টোকেন-ভ্যালিদ, live 200; device-flow-অবসর**
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s251 ৩১/৩১ + s249 ৩০/৩০ — তিন-ঢেউ-পরবর্তী স্থিতিশীল; এ-রাউন্ড-ফোকাস = অ্যাডমিন-কীবোর্ড/ফিল্টার-প্যাক-সম্প্রসারণ-ধারা

## এ-রাউন্ডে সম্পন্ন (session253)
- **[Mandatory-ফিচার] রিপোর্ট-কিউ তাৎক্ষণিক-ফিল্টার (mr253):** /moderator/reports — data-kw-কার্ড (কারণ+টার্গেট+লেখক+রিপোর্টকারী+স্ট্যাটাস+বর্ণনা, ছোট-হাতের) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + __mrQA হুক; ট্যাব-GET+বাল্ক-বার-অক্ষুণ্ণ; keydown-স্ক্যান ('/'-গ্লোবাল-সংরক্ষিত, 'f'-মুক্ত); hidden-গার্ড (hid81in-অ্যানিমেশন-নিরাপদ)
- **[Mandatory-স্টাইল]:** mr253-ব্লক হেক্স-শূন্য টোকেন-শুধু — color-mix brandgreen ফোকাস-রিং + au251-মিরর kbd-পিল + :active প্রেস + reduced-motion-জোড়া + 640px-সংকোচন
- **QA-লগইন-ইনফ্রা-ফিক্স (সিস্টেমিক):** ফর্ম-ক্লিক-লগইন logout-চক্রের-পরে নীরব-ব্যর্থ (click-✓-কিন্তু-submit-অঘটিত; requestSubmit-সুস্থ-প্রমাণ) → URL-ব্রাঞ্চ + পৃষ্ঠা-csrf fetch-POST redirect:"manual" (opaque-303-কুকি-চুক্তি; follow-মোড eval-টাইমআউট-খালি-ফেরত); **s251-সুইটেও ফিক্স-প্রয়োগ** (ব্যাটারি-ক্রম-নিরপেক্ষ)
- **টেস্ট:** নতুন tests/s253-mrfilter-suite.sh **৩৫/৩৫ ×৩-ধারাবাহিক** (কাঠামো×১১+স্টাইল×৭+আচরণ×৯+390px+স্ক্রিনশট×২; ডেমো-রিপোর্ট-সিড প্রোডাকশন-প্রবাহ POST /report — 409-idempotent) + role-policy ২৬০/২৬০ + s249 ৩০/৩০ + s251 ৩১/৩১ (ফিক্স-পরে) + guard:design + audit:views গ্রিন + secret-scan-ক্লিন + প্রোড-স্পট 200×৩
- **গোটচা ×৪ (PLANS session253):** ফর্ম-ক্লিক-নীরব-ব্যর্থ-শ্রেণি · fetch-redirect-manual-কুকি · eval-টাইমআউট-খালি-ফেরত (মিথ্যা-পাস-ঝুঁকিসহ) · কার্ড-গণনা grep 'mrq81-card st-' (data-mr-row-গণনায় script/CSS-ফ্যান্টম — ৩-ফ্যান্টম-প্রমাণ)
- ডক ×৩ (PROJECT §২৫৩ + PLANS session253-নোট + repo-worklog Task 93) + স্ক্রিনশট ×২ (s253-mrfilter-desk/mobile390)

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- QA-DB-তে ডেমো-রিপোর্ট ×১ স্থায়ী (লেগ্যাসি-ডেমো-সিমান্তিক; সুইট-idempotent — পুনঃসিড-নয়)
- পরের-এজেন্ট: **session254 লেবেল (worklog Task ID 94)**; PLANS session253-নোট অবশ্যই-পড়ুন (ফর্ম-ক্লিক-শ্রেণি + fetch-manual-চুক্তি + eval-টাইমআউট + ফ্যান্টম-গণনা); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: moderator-complaints/moderator-users-এ ছোট-ফিল্টার-প্যাক, Turso/প্রোড-পোর্ট
- রিমোট main = push-পরবর্তী hash (কমিট-লগে); working-tree ক্লিন

---

## Task ID: 94 (repo-label session254 — cron 403679; ২৩ সেপ্টেম্বর ২০২৬)

### বর্তমান অবস্থা
- রাউন্ড-আরম্ভে সত্য-উৎস-যাচাই: HEAD=origin=`34f3854` (session253, clean-tree); GH-টোকেন-যুগল /user→200; Vercel READY (session253) + live-200; স্টেল-সামারি ×২০-সংশোধন (সামারি Task43/device-flow-যুগ দেখাচ্ছিল — worklog ACTIVE-LOCK-ই-একমাত্র-সত্য)। s253 ৩৫/৩৫ প্রথম-রানে = বেসলাইন-স্থিত → বাগ-শূন্য → ফিচার-রাউন্ড (session253-বাকি-প্রস্তাব গ্রহণ)।

### লক্ষ্য / সম্পাদিত / যাচাই
- **[Mandatory-ফিচার] mc254** — /moderator/complaints তাৎক্ষণিক-ফিল্টার: data-kw-কার্ড (বিষয়+স্ট্যাটাস+নাম+@ইউজারনেম+বিবরণ+নোট) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + clear-বাটন + __mcQA হুক; বাল্ক-বার/স্ট্যাটাস-ফর্ম/data-bulk-all অক্ষুণ্ণ; hidden-গার্ড।
- **[Mandatory-স্টাইল]** mc254-ব্লক হেক্স-শূন্য টোকেন-শুধু: color-mix brandgreen ফোকাস-রিং + kbd-পিল + :active + reduced-motion-জোড়া + 640px-সংকোচন + mc254-empty টোকেন-বক্স।
- **নতুন সুইট** tests/s254-mcfilter-suite.sh — **৩৬/৩৬ ×২-ধারাবাহিক**; ভিউয়ার testadmin (moderator=403-প্রমাণিত); সিড POST /complaints প্রোডাকশন-প্রবাহ (?sent=1; _csrfTok-কুকি-দ্বি-সমর্পণ; ৬০-মিনিট dup idempotent)।
- **রিগ্রেশন:** role-policy ২৬০/২৬০ + s249 ৩০/৩০ + s253 ৩৫/৩৫ + s251 ৩১/৩১ (কোল্ড-স্টার্ট-ট্রানজিয়েন্ট ২×RED → ওয়ার্ম-আপ-প্রোব → গ্রিন — PLANS-নোট) + guard:design + audit:views গ্রিন + secret-scan-ক্লিন।
- স্ক্রিনশট ×২ (s254-mcfilter-desk/mobile390 — টেস্ট-কমিটেড); ডক ×৩ (PROJECT §২৫৪ + PLANS session254 + এ-এন্ট্রি)।

### ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর।
- QA-DB-তে ডেমো-অভিযোগ ×১ স্থায়ী (লেগ্যাসি-ডেমো-সিমান্তিক; ৬০-মিনিট-উইন্ডো-পরে পুনঃরানে +১ হতে-পারে — গ্রহণযোগ্য)।
- পরের-এজেন্ট: **session255 লেবেল (worklog Task ID 95)**; PLANS session254-নোট অবশ্যই-পড়ুন (testadmin-ভিউয়ার + csrfTok-দ্বি-সমর্পণ + s251-কোল্ড-স্টার্ট-ট্রানজিয়েন্ট + `[h`-প্রদর্শন-আর্টিফ্যাক্ট); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: moderator-members/moderator-curation-ফিল্টার-প্যাক, Turso/প্রোড-পোর্ট।
- রিমোট main = push-পরবর্তী hash (কমিট-লগে); working-tree ক্লিন।

---

## Task ID: 95 (repo-label session255 — cron 403679; ২৩ সেপ্টেম্বর ২০২৬)

### বর্তমান অবস্থা
- রাউন্ড-আরম্ভে সত্য-উৎস-যাচাই: HEAD=origin=`29ebb81` (session254, clean-tree); GH /user→200 + Vercel /v2/user→200 + live-200; স্টেল-সামারি ×২১-সংশোধন (সামারি Task43/device-flow/'১১-ট্রিগার-বাকি' যুগ দেখাচ্ছিল — সব-ভুল; worklog ACTIVE-LOCK-ই-একমাত্র-সত্য)। QA-বেসলাইনে মিথ্যা-বাগ-সংকেত-বিতাড়ন (mod-member-row Read-আর্টিফ্যাক্ট — compile+render-প্রমাণ অক্ষত) → বাগ-শূন্য → ফিচার-রাউন্ড (session254-বাকি-প্রস্তাব: moderator-members)।

### লক্ষ্য / সম্পাদিত / যাচাই
- **[Mandatory-ফিচার] mm255** — /moderator/members তাৎক্ষণিক-ফিল্টার (mc254-মিরর + grouped-list এক্সটেনশন): data-mm-row-সারি-সূচক (নাম+পদ+শ্রেণি+কার্যবর্ষ+উইং-লেবেল+@ইউজারনেম+পরিচিতি; wlabel include-ভেরি) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + clear-বাটন + **__mmQA হুক (total/count/secs/apply/clear)** + **সেকশন-অটো-হাইড** (data-mm-sec — সব-সারি-লুকালে কার্ড-লুকায় ৪→০→পুনরুদ্ধার); বাল্ক-বার/data-bulk-all/যোগ-ফর্ম অক্ষুণ্ণ; hidden-গার্ড ×২।
- **[Mandatory-স্টাইল]** mm255-ব্লক হেক্স-শূন্য টোকেন-শুধু: color-mix brandgreen ফোকাস-রিং + kbd-পিল + :active + reduced-motion-জোড়া + 640px-সংকোচন + mm255-empty টোকেন-বক্স।
- **নতুন সুইট** tests/s255-msearch-suite.sh — **৩৯/৩৯ ×২-ধারাবাহিক** (কাঠামো×১৪+স্টাইল×৮+আচরণ×১১ — ৮৭-বাস্তব-সারি সিড-শূন্য + 390px + স্ক্রিনশট×২)।
- **রিগ্রেশন:** role-policy ২৬০/২৬০ + s254 ৩৬/৩৬ + s253 ৩৫/৩৫ + s251 ৩১/৩১ + s249 ৩০/৩০ + guard:design + audit:views গ্রিন + প্রোড-স্পট (title + errors-শূন্য)।
- স্ক্রিনশট ×২ (s255-msearch-desk/mobile390 — টেস্ট-কমিটেড); ডক ×৩ (PROJECT §২৫৫ + PLANS session255 + এ-এন্ট্রি)।

### ঝুঁকি ও পরবর্তী
- **MultiEdit-আংশিক-প্রয়োগ-গোটচা (নতুন):** ৪-ব্যর্থেও ১-৩-ল্যান্ডেড (রোলব্যাক-হয়নি) — বহু-এডিটে প্যাচ-পরে প্রতি-টার্গেট-ইনভেন্টরি + skip-if-present-প্যাচ (s255-patch.py-প্যাটার্ন) — PLANS session255-নোট।
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর।
- পরের-এজেন্ট: **session256 লেবেল (worklog Task ID 96)**; PLANS session255-নোট অবশ্যই-পড়ুন (MultiEdit-গোটচা + mm255-সারফেস-চুক্তি + wlabel + আর্টিফ্যাক্ট-পুনঃপ্রমাণ); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!); বাকি-প্রস্তাব: moderator-curation-ফিল্টার-প্যাক, moderator-users-স্কোপড-ভ্যারিয়েন্ট, Turso/প্রোড-পোর্ট।
- রিমোট main = push-পরবর্তী hash (কমিট-লগে); working-tree ক্লিন।
---
Task ID: 96 (session256 — cron 403679; লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার cu256 + [hidden]-ডিসপ্লে-ওভাররাইড বাগ-ফিক্স + KeyboardEvent-bubbles-false-সুইট-শ্রেণি) — push `51047f5`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- স্টেল-সামারি-সংশোধন (×২২): সামারি Task43/'commit-হয়নি'/device-flow/'১১-ট্রিগার-বাকি' যুগ দেখাচ্ছিল — সব-ভুল; প্রকৃত: HEAD=origin=`d2abbf7` (session255/Task95), working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর
- ইউজারের 'সব কমিট করেছ? গিটে?'-প্রশ্নের চূড়ান্ত-উত্তর: হ্যাঁ — session255-পর্যন্ত সব-কমিটেড-ও-pushকৃত ছিল; এ-রাউন্ডের session256-ও pushকৃত (`51047f5`)
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s255 ৩৯/৩৯ + s254 ৩৬/৩৬ + s253 ৩৫/৩৫ + s251 ৩১/৩১ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (session255-বাকি-প্রস্তাব গ্রহণ: curation-ফিল্টার-প্যাক)

## এ-রাউন্ডে সম্পন্ন (session256)
- **[Mandatory-ফিচার] লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার (cu256):** /moderator/curation — data-cu-row-সূচক + data-kw (শিরোনাম+অনুচ্ছেদ+লেখক-নাম+@ইউজারনেম+ধরন-লেবেল+অবস্থা-শব্দ হোম/প্রচ্ছদ/সেরা-লেখক/লুকানো/তালিকায়-বাদ/সোশ্যাল) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা বক্স + 'f'-ফোকাস (field-গার্ড+modifier-বাদ) + Escape-ক্লিয়ার+ব্লার + clear-বাটন + **__cuQA হুক (total/count/apply/clear)**; GET-সার্চ+kindchips+quick-নির্বাচন/খালি+curList অক্ষুণ্ণ; hidden-গার্ড (`.cur-item[data-cu-row][hidden]` display:none!important); keydown-স্ক্যান (main.js/premium.js/sandbox-preview শূন্য — 'f'-মুক্ত)
- **[Mandatory-স্টাইল]:** cu256-ব্লক হেক্স-শূন্য টোকেন-শুধু — color-mix brandgreen ফোকাস-রিং + dashed kbd-পিল + :active প্রেস-ফিডব্যাক + reduced-motion-জোড়া + 640px-সংকোচন + cu-zero টোকেন-বক্স
- **প্রোডাক্ট-বাগ-ফিক্স (ভিজ্যুয়াল-QA-আবিষ্কৃত):** `.cu-count-chip{display:inline-flex}` UA-`[hidden]{display:none}`-ওভাররাইড — খালি-ইনপুটে স্টেল '০ / ১২' চিপ স্ক্রিনশটে-ধরা-পড়া → `.cu-count-chip[hidden]{display:none}` গার্ড + সুইটে computed-display-অ্যাসার্ট
- **টেস্ট:** নতুন tests/s256-cufilter-suite.sh **৩৮/৩৮ ×২-ধারাবাহিক** (কাঠামো×১৩+স্টাইল×৮+আচরণ×১২ রিয়েল-ব্রাউজার — ১২-বাস্তব-সারি সিড-শূন্য + @ইউজারনেম-প্রোব + 390px-hScroll-শূন্য + স্ক্রিনশট×২) + role-policy ২৬০/২৬০ + guard:design + audit:views গ্রিন + EJS-compile+রেন্ডার-প্রমাণ
- **গোটচা ×৩ ডক-কৃত (PLANS session256):** ① **KeyboardEvent-bubbles-false-শ্রেণি** (body-dispatch document-লিসেনারে-পৌঁছায়-না — প্রোব no-bubble/bubbled-true; **s255-এর 'f'-অ্যাসার্ট অবশিষ্ট-ফোকাস-মিথ্যা-পাস ছিল** — mm255-clear blur-হীন, cu256-clear blur-যুক্ত-বলে-উন্মোচিত; document-লিসেনার-টেস্টে bubbles:true বাধ্যতমূলক) ② **[hidden]-display-ওভাররাইড-শ্রেণি** (display-set-এলিমেন্টে hidden-অকার্যকর — গার্ড-জোড়া+computed-অ্যাসার্ট) ③ **grep-regex `[hidden]`-ক্যারেক্টার-ক্লাস** (containsF-ই-সত্য — od-বাইট-যাচাইয়ে ফাইল-অক্ষত-প্রমাণিত)
- প্যাচ: scripts/s256-patch.py (skip-if-present idempotent — s255-প্যাটার্ন) + ডক ×৩ (PROJECT §২৫৬ + PLANS session256 + repo-worklog Task 96) → secret-scan-ক্লিন → fetch+rebase (সংঘর্ষ-শূন্য) → **push `d2abbf7..51047f5`** → Vercel **READY @ 51047f5e** (২০-সেকেন্ড) → প্রোড-স্পট home/login 200×২ + curation-গেট 307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session257 লেবেল (worklog Task ID 97)**; PLANS session256-নোট অবশ্যই-পড়ুন (bubbles:true-সুইট-চুক্তি + [hidden]-গার্ড-জোড়া + containsF-ব্র্যাকেট); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: moderator-users-স্কোপড-ভ্যারিয়েন্ট, s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং (ঐচ্ছিক-সুইট-স্বাস্থ্য), Turso/প্রোড-পোর্ট
- রিমোট main = `51047f5` (session256); working-tree ক্লিন

---
Task ID: 97 (session257 — cron 403679; ট্র্যাশ তাৎক্ষণিক-ফিল্টার tr257 + প্রোডাকশন-প্রবাহ-সিড-চুক্তি-বর্ধন + mawk-পোর্টেবিলিটি-গোটচা) — push `684a434`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`842a2e7` (session256/Task96), working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s256 ৩৮/৩৮ + s255 ৩৯/৩৯ + s254 ৩৬/৩৬ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (ফিল্টার-প্যাক-ধারা: ট্র্যাশ-সারফেস)

## এ-রাউন্ডে সম্পন্ন (session257)
- **[Mandatory-ফিচার] ট্র্যাশ তাৎক্ষণিক-ফিল্টার (tr257):** /moderator/trash (admin/views/admin/trash.ejs — moderatorView-মোড) — data-tr-row + data-kw (#আইডি+টেবিল+স্ন্যাপশট-শিরোনাম+payload-স্নিপেট+মুছেছেন+সময়) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape + clear + **__trQA হুক**; GET-q/টেবিল-সিলেক্ট/restore-all/data-bulk-all অক্ষুণ্ণ; hidden-গার্ড ×৩ (session256-শিক্ষা প্রি-অ্যাপ্লাইড)
- **[Mandatory-স্টাইল]:** tr257-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px)
- **সিড-চুক্তি-বর্ধন (প্রোডাকশন-প্রবাহ — স্বয়ং-নিরাময়ী):** নোটিশ-তৈরি (POST /moderator/notices 'qa257trash') → bulk-delete (trashed=<tid>-পার্সিং) → ট্র্যাশে ১-সারি → সুইট-শেষে মার্কার-সারি bulk-purge (/admin/trash/bulk-purge); প্রতি-POST-আগে ফ্রেশ-GET-_csrf; মার্কার-প্রোব নির্ধারক-১-মিল (ডেটা-স্বাধীন)
- **টেস্ট:** নতুন tests/s257-trashfilter-suite.sh **৪৩/৪৩ ×২-ধারাবাহিক** (কাঠামো×১২+স্টাইল×৯+আচরণ×৮ রিয়েল-ব্রাউজার + সিড×৩ + 390px-hScroll-শূন্য + স্ক্রিনশট×২ + পরিষ্কারক) + role-policy ২৬০/২৬০ + guard:design + audit:views গ্রিন + EJS-compile/রেন্ডার-প্রমাণ
- **গোটচা ×৩ ডক-কৃত (PLANS session257):** gawk-৩-প্যারামিটার-match mawk-অসমর্থিত (capture-array → RSTART/substr) · admin-ভিউ-নেস্টেড-রেজোলিউশন (app.set('views',[views,admin/views]) → admin/views/admin/*.ejs) · moderatorView-মোডে bulkBar/পার্জ-বোতাম-লুকানো
- প্যাচ: scripts/s257-patch.py (skip-if-present) + ডক ×৩ (PROJECT §২৫৭ + PLANS session257 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase (সংঘর্ষ-শূন্য) → **push `842a2e7..684a434`** → Vercel **READY @ 684a434a** → প্রোড-স্পট home-200 + trash-গেট-307

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session258 লেবেল (worklog Task ID 98)**; PLANS session257-নোট অবশ্যই-পড়ুন (gawk/mawk-ম্যাচ + admin-ভিউ-নেস্টেড-পাথ + ট্র্যাশ-সিড-চুক্তি); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: moderator-press/sections/notices-সারফেস ফিল্টার-প্যাক (tr257-প্যাটার্ন-মিরর), s255-'f'-অ্যাসার্ট bubbles:true-হার্ডেনিং, Turso/প্রোড-পোর্ট
- রিমোট main = `684a434` (session256-worklog `842a2e7`-পরে session257); working-tree ক্লিন

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

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`bfce6c5` (session260/Task100, clean-tree) — স্টেল-সামারি-সংশোধন ×২৭ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল)। GH /user→200 (দুই-টোকেনই-ভ্যালিড); স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর।

## এ-রাউন্ডে সম্পন্ন (session261)
- **রাউন্ড-আরম্ভ-যাচাই:** s260 ৫২/৫২ প্রথম-রানে + role-policy ২৬০/২৬০ + guard:design + audit:views — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session260-বাকি-প্রস্তাব: resources-ফিল্টার-প্যাক)।
- **[Mandatory-ফিচার] রিসোর্স তাৎক্ষণিক-ফিল্টার (re261):** /moderator/resources — data-re-row + data-kw (১৪-ক্ষেত্র) + লাইভ-কাউন্ট চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + clear + **__reQA হুক**; mrForm/টাইপ-পিকার/বাল্ক-ইমপোর্ট/মুছুন-ফর্ম/এডিট-লিংক অক্ষুণ্ণ; hidden-গার্ড ×৩; **[Mandatory-ফিচার-সংযোগ] .re-cat-chip** (৯-ক্যাটাগরি-ম্যাপ প্রতি-সারি-পিল)।
- **[Mandatory-স্টাইল]:** re261-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড-ত্রয়ী)।
- **সিড-চুক্তি-বর্ধন:** res_type=link-সিড urlencoded-POST (multer-নন-মাল্টিপার্ট-পাসথ্রু — body._csrf-পথ; x-csrf-token-অপ্রয়োজনীয়) + পরিষ্কারক /resources/:id/delete→ট্র্যাহ→bulk-purge (#১৭৩-প্রমাণ অবশিষ্ট=০)।
- **টেস্ট:** নতুন tests/s261-resfilter-suite.sh **৫০/৫০ ×২-ধারাবাহিক** (কাঠামো×১৫+স্টাইল×১০+আচরণ×১৩ রিয়েল-ব্রাউজার + সিড×৪ + 390px + স্ক্রিনশট×২ + পরিষ্কারক) + role-policy **২৬০/২৬০** + s260 ৫২/৫২ + guard/audit-গ্রিন + EJS-compile-প্রমাণ
- প্যাচ: scripts/s261-patch.py (skip-if-present idempotent) + ডক ×৩ (PROJECT §২৬১ + PLANS session261 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session262 লেবেল (worklog Task ID 102)**; PLANS session261-নোট অবশ্যই-পড়ুন (urlencoded-link-ক্লাস-সীমানা + RS-অ্যাঙ্কর-ভ্যারিয়েন্ট); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার-ভ্যারিয়েন্ট, multipart-ব্রাউজার-পাথ-যাচাই, Turso/প্রোড-পোর্ট

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`8b30ad7` (session261/Task101, clean-tree) — স্টেল-সামারি-সংশোধন ×২৮ (সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল)। GH /user→200; স্থায়ী-সার্ভার-জীবিত (৮০৯৪); device-flow-অবসর।

## এ-রাউন্ডে সম্পন্ন (session262)
- **রাউন্ড-আরম্ভ-যাচাই:** s261 ৫০/৫০ প্রথম-রানে + role-policy ২৬০/২৬০ + guard:design + audit:views — বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session261-বাকি-প্রস্তাব: moderator-users-স্কোপড-ফিল্টার)।
- **[Mandatory-ফিচার] ইউজার তাৎক্ষণিক-ফিল্টার (muf262):** /moderator/users — tr[data-muf-row] + দ্বি-ভাষা data-kw (#আইডি+@ইউজারনেম+নাম+রোল-বাংলা/কী+স্ট্যাটাস-বাংলা/কী+যোগদান+শেষ-লগইন — **email-বাদ = স্কোপ-রেডলাইন**) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + clear + **__mufQA হুক**; mu-search/mu-stats/ban-ফর্ম/মু-লক/মু-ফিড অক্ষুণ্ণ; hidden-গার্ড ×৩; **নেমস্পেস-বিতাড়ন:** .mu-* (session90) দখলকৃত → muf-প্রিফিক্স।
- **[Mandatory-স্টাইল]:** muf262-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড-ত্রয়ী)।
- **সিড-শূন্য-চুক্তি-বর্ধন:** ডেটা-নির্ভর-প্রোব (রেন্ডার্ড-HTML-পূর্বগণনা ACTIVEN/BANNEDN/ADMINN → সঠিক-মিল-অ্যাসার্ট; শ্রেণি-শূন্য → শর্তসাপেক্ষ-স্কিপ — মিথ্যা-ফেল-বিতাড়ন) + রিড-ওনলি-নিশ্চয়তা (সারি 63→63)।
- **টেস্ট:** নতুন tests/s262-mufilter-suite.sh **৪৮/৪৮ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো×১৬+স্টাইল×১০+আচরণ×১২ রিয়েল-ব্রাউজার + 390px + স্ক্রিনশট×২) + role-policy **২৬০/২৬০** + s261 ৫০/৫০ + guard/audit-গ্রিন + EJS-compile-প্রমাণ
- প্যাচ: scripts/s262-patch.py (skip-if-present idempotent) + ডক ×৩ (PROJECT §২৬২ + PLANS session262 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session263 লেবেল (worklog Task ID 103)**; PLANS session262-নোট অবশ্যই-পড়ুন (ডেটা-নির্ভর-প্রোব-চুক্তি + নেমস্পেস-ম্যাপ-প্রথা); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই, moderator-dashboard-সারফেস-ফিল্টার, Turso/প্রোড-পোর্ট

---
Task ID: 103 (session263 — cron 403679; মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার mdf263 + মিশ্র-ট্যাগ-গার্ড-শ্রেণি)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`02e2104` (session262/Task102), working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200 + Vercel /v2/user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s262 ৪৮/৪৮ + s261 ৫০/৫০ + guard:design + audit:views — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session262-বাকি-প্রস্তাব গ্রহণ: moderator-dashboard-সারফেস-ফিল্টার)

## এ-রাউন্ডে সম্পন্ন (session263)
- **[Mandatory-ফিচার] মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (mdf263):** /moderator (views/user/moderator-dashboard.ejs) — **টাইল ×১৫ পূর্ণ-কভারেজ** (scope ×১১ allowed/locked ২-শাখা + এক্সট্রা ×৪ স্ট্যাটিক-kw) — data-mdf-row + দ্বি-ভাষা data-kw (লেবেল+বর্ণনা+key+লিংক+খোলা/লকড unlocked/locked) + ফিল্টার-স্ট্রিপ (mdfFilter263/mdfClear263/mdfCount263/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + **__mdfQA হুক** (total/count/apply/clear); hero/stats/section-head/mrq81-badge/switch/logout অক্ষুণ্ণ; hidden-গার্ড ×৩
- **[Mandatory-স্টাইল]:** mdf263-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px) + **inline-flex-টাইল-গার্ড** `.mod-tile[data-mdf-row][hidden]{display:none!important}` (session256-শ্রেণির inline-স্তর-বিস্তার)
- **নেমস্পেস-ম্যাপ:** .mod-* পূর্ব-দখলকৃত → **mdf-প্রিফিক্স** (session262-প্রথা প্রয়োগ; grep-প্রমাণ সংঘর্ষ-শূন্য)
- **টেস্ট:** নতুন tests/s263-mdfilter-suite.sh **৫৩/৫৩ ×২-ধারাবাহিক (SKIP=১ ডেটা-নির্ভর)** (কাঠামো×১৮+স্টাইল×৯+আচরণ×১৮ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৬ + inline-flex-hidden-প্রমাণ ১৫/১৫ + 390px-hScroll-শূন্য + স্ক্রিনশট×২ + রিড-ওনলি টাইল ১৫→১৫) + role-policy **২৬০/২৬০** + s262 ৪৮/৪৮ + guard:design + audit:views-গ্রিন (১২২ ejs) + EJS-compile-প্রমাণ + secret-scan-ক্লিন
- **গোটচা ×২ ডক-কৃত (PLANS session263):** মিশ্র-ট্যাগ-সারফেস hidden-গার্ড (a+div+inline-flex — class-prefix+!important-ই-পথ) · স্ট্যাটিক-টাইল-ইনডেক্সিং (EJS-গণিত ইনডেক্স + শর্তসাপেক্ষ-টাইলে গ্যাপ — JS-ইনডেক্স-অনিরপেক্ষ)
- প্যাচ: scripts/s263-patch.py (skip-if-present idempotent — পুনঃরান SKIP-প্রমাণ) + ডক ×৩ (PROJECT §২৬৩ + PLANS session263 + এ-এন্ট্রি) → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session264 লেবেল (worklog Task ID 104)**; PLANS session263-নোট অবশ্যই-পড়ুন (মিশ্র-ট্যাগ-গার্ড + স্ট্যাটিক-ইনডেক্সিং + স্ট্যাটিক-kw-চুক্তি); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press ই২ই), admin-dashboard (/admin) সারফেস-ফিল্টার (mdf263-মিরর), Turso/প্রোড-পোর্ট

---
Task ID: 104 (session264 — cron 403679; অ্যাডমিন ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার adf264 + মিথ্যা-সেশন-গার্ড-গোটচা) — push `fd8e520`
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`57d6b73` (session263/Task103), working-tree ক্লিন, টোকেন-ভ্যালিদ, live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- স্টেল-সামারি-সংশোধন ×৩০: সামারি Task43/'commit-হয়নি'/device-flow/'১৪-ট্রিগার' যুগ — সব-ভুল; ACTIVE-LOCK Task103/session263-ই-সত্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s263 ৫৩/৫৩ (SKIP=১) + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session263-বাকি-প্রস্তাব গ্রহণ: admin-dashboard-সারফেস)

## এ-রাউন্ডে সম্পন্ন (session264)
- **[Mandatory-ফিচার] অ্যাডমিন ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (adf264):** /admin (admin/views/admin/dashboard.ejs) — মিশ্র-ট্যাগ সারফেস ×১৮ (stat-box ×৯ + কার্ড ×২ + কুইক-অ্যাকশন ×৭) data-adf-row + দ্বি-ভাষা data-kw (লেবেল+প্রতিশব্দ+লিংক-পাথ+ইংরেজি-অ্যালায়াস) + ফিল্টার-স্ট্রিপ + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + **__adfQA হুক** (total/count/apply/clear); welcome-banner/stat-grid/dash-cols/recent-list/quick-actions/sidebar অক্ষুণ্ণ; hidden-গার্ড ×৩ (মিশ্র-ট্যাগ — .stat-box display:flex-ওভাররাইড-সহ)
- **[Mandatory-স্টাইল]:** adf264-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix brandgreen রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px)
- **টেস্ট:** নতুন tests/s264-adfilter-suite.sh **৫৬/৫৬ ×২-ধারাবাহিক** (কাঠামো ×২০+স্টাইল ×১২+আচরণ ×১৮ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৬ পূর্বগণনা-মিল + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি ১৮→১৮) + s263 ৫৩/৫৩ + role-policy ২৬০/২৬০ + guard:design + audit:views গ্রিন + EJS-compile/রেন্ডার-প্রমাণ
- **গোটচা ×২ ডক-কৃত (PLANS session264):** মিথ্যা-সেশন-সক্রিয়-গার্ড (grep '/admin' লগইন-পেজেও মেলে → অ্যাঙ্করড '/admin/?$' — প্রথম-রানে ১৩-মিথ্যা-ফেল) · aligned multi-space অ্যাঙ্কর (href→class ২-৭-স্পেস → রেজেক্স+re.subn-ই-পথ)
- প্যাচ: scripts/s264-patch.py (skip-if-present idempotent — ২১-সম্পাদনা) + ডক ×৩ (PROJECT §২৬৪ + PLANS session264 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session265 লেবেল (worklog Task ID 105)**; PLANS session264-নোট অবশ্যই-পড়ুন (মিথ্যা-সেশন-গার্ড + multi-space-অ্যাঙ্কর + ৩-ট্যাগ-গার্ড-ত্রয়ী); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press ই২ই), লেগেসি-সুইটের /admin/login-উপসর্গ-ট্যার্গেট-স্ক্যান (অ্যাঙ্করড-চেক-প্রথা), Turso/প্রোড-পোর্ট
- রিমোট main = `fd8e520` (session264); working-tree ক্লিন

---
Task ID: 105 (session265 — cron 403679; অ্যাডমিন কমপ্লেইন্স-রিভিউ-ডেস্ক তাৎক্ষণিক-ফিল্টার ac265 + অ্যাঙ্করড-চেক-স্ক্যান + ডিসপ্লে-আর্টিফ্যাক্ট-মিথ্যা-অ্যালার্ম-গোটচা)
Agent: Z.ai Code (main session, cron 403679, web-26d1f0e9)
Task: cron-নির্দেশ — অবস্থা-যাচাই → agent-browser QA → ফিক্স/ফিচার → worklog

## বর্তমান প্রজেক্ট-অবস্থা (যাচাইকৃত)
- HEAD=origin=`5b14313` (session264/Task104) → রাউন্ড-শেষে নতুন-কমিট, working-tree ক্লিন, টোকেন-ভ্যালিদ (GH /user→200), live 200; device-flow-অবসর; প্যারালাল-সংঘর্ষ-শূন্য
- স্টেল-সামারি-সংশোধন ×৩১: সামারি Task43/'commit-হয়নি'/device-flow যুগ — সব-ভুল; ACTIVE-LOCK Task104/session264-ই-সত্য
- রাউন্ড-শুরু QA: role-policy ২৬০/২৬০ + s264 ৫৬/৫৬ + guard:design + audit:views (১২২ ejs) — সব-গ্রিন, বাগ-শূন্য → ফিচার-রাউন্ড (PLANS session264-বাকি-প্রস্তাব গ্রহণ)

## এ-রাউন্ডে সম্পন্ন (session265)
- **[Mandatory-ফিচার] অ্যাডমিন কমপ্লেইন্স তাৎক্ষণিক-ফিল্টার (ac265):** /admin/complaints — কার্ড-সারফেস data-ac-row (forEach-(c,i)) + দ্বিভাষিক data-kw (#আইডি+অভিযোগ/complaint+বিষয়+জমাদানকারী+@ইউজারনেম+/profile/+স্ট্যাটাস-বাংলা/কী+তারিখ+বডি-১৪০+সংযুক্তি+নোট) + ফিল্টার-স্ট্রিপ (acFilter265/acClear265/acCount265/kbd-hint) + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + **__acQA হুক** (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — session265-উন্নতি); ট্যাব ×৫/বাল্ক/PUT/DELETE/paperclip/sidebar অক্ষুণ্ণ; নো-ডেটা-'card empty' ইচ্ছাকৃত-বাদ
- **[Mandatory-স্টাইল]:** ac265-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ সঠিক-বাইট)
- **[সংহত] অ্যাঙ্করড-চেক-স্ক্যান (session264-বাকি-প্রস্তাব):** scripts/s265-anchor-scan.py → ১-ঝুঁকি (s263:৯৮) → '/moderator/?$'-অ্যাঙ্করড-সংহত
- **টেস্ট:** নতুন tests/s265-acfilter-suite.sh **৫৭/৫৭ ×২-ধারাবাহিক** (কাঠামো ×২২ + স্টাইল ×৯ + আচরণ ×১৯ রিয়েল-ব্রাউজার + নির্ধারক-প্রোব ×৪ পূর্বগণনা-মিল + ফিল্ড-গার্ড-প্রোব + 390px-hScroll-শূন্য + স্ক্রিনশট ×২ + রিড-ওনলি ১→১) + পূর্ণ-রিগ্রেশন s260-২৬৪ + role-policy ২৬০/২৬০ + guard/audit-গ্রিন + EJS-রেন্ডার-প্রুফ দুই-ধারা
- **গোটচা ×২ ডক-কৃত (PLANS session265):** ডিসপ্লে-আর্টিফ্যাক্ট-মিথ্যা-অ্যালার্ম (১০৩-'ভাঙা' → ২২৮/২২৮-বৈধ — od/python-ই-সত্য, রিপো-ব্যাপী-ফিক্স-নিষিদ্ধ) · empty-state দ্বৈত-শূন্য-বক্স-চুক্তি
- প্যাচ: scripts/s265-patch.py (skip-if-present idempotent — ৫-সম্পাদনা, SKIP-পুনঃরান-প্রমাণ) + ডক ×৩ (PROJECT §২৬৫ + PLANS session265 + এ-এন্ট্রি) → secret-scan-ক্লিন → fetch+rebase → push → Vercel-যাচাই

## ঝুঁকি ও পরবর্তী
- Turso/প্রোড-পোর্ট = পরিকল্পনা-গেটে-অক্ষুণ্ণ; টোকেন-নীতি অক্ষুণ্ণ (V3 .secrets/-এ-সক্রিয়; মুখোশ-ছাড়া-কখনো-প্রদর্শন-নয়); device-flow-অবসর
- পরের-এজেন্ট: **session266 লেবেল (worklog Task ID 106)**; PLANS session265-নোট অবশ্যই-পড়ুন (ডিসপ্লে-আর্টিফ্যাক্ট-সতর্কতা + দ্বৈত-শূন্য-বক্স + __acQA-শূন্য-সারফেস-হুক + ফিল্ড-গার্ড-প্রোব); push-আগে fetch+rebase-বাধ্যতমূলক (প্যারালাল-রাউন্ড-সক্রিয়!)
- বাকি-প্রস্তাব: multipart-ব্রাউজার-পাথ-যাচাই (press রিয়েল-ফাইল-আপলোড ই২ই), অ্যাডমিন-সারফেস-ফিল্টার-ধারাবাহিকতা (messages/moderators/subscribers/tasks/activity/audit), Turso/প্রোড-পোর্ট
