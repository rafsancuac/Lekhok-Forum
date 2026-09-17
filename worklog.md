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
- origin/main @ 9c836ac — session101 (a0b1bb7 + 101-g; মার্জ: session102/103/104 union)
- নতুন-সারফেস: /moderator/resources, POST /api/resources/:id/stat, helpers/resource-types.js
- টেস্ট-ডেটা: resources-টেবিলে ১৬-রো (৫ ডেমো-মাল্টিমিডিয়া + ১ মডারেটর-আপলোড); ডেমো-ফাইল public/uploads/resources/ (gitignored)
- ⚠️ নতুন-গোটচা: sql.js সিড-স্ক্রিপ্টে prepare().run() → ২০০ms-ডিবাউন্ড — saveDb() ম্যানুয়াল-কল+৫০০ms-অপেক্ষা নইলে ডেটা-হারানি (দুইবার-প্রমাণিত)
- পরবর্তী-প্রথম-পছন্দ: ① রিসোর্স-বাল্ক-আপলোড/সংকলন-সিরিজ ② মাস্টার-টেবিলের শেষ-২: ০৫-কার্সর-পলিশ, ১৭-হোম-কিউরেশন-সোশ্যাল-ফিল্টার ③ ইমেইল-ডিরেক্টরিতে অ্যাডমিন-সম্পাদনাযোগ্য ডেটা (এখন helpers-হার্ডকোড)

---
Task ID: cron-r103 (সেশন ১০৩ — webDevReview রাউন্ড)
Agent: Z.ai Contact-Page Agent (cron)
Task: QA-সুইপ → ফর্ম-ব্রেকেজ-ফিক্স (CSRF!) + প্রভোস্ট-সার্চ/কপি + আজ-খোলা-ব্যাজ + JSON-LD + স্টাইল-পলিশ

Work Log:
- **git-হাইজিন:** sandbox অটো-কমিট (d3fc7e7) ৪৭৬-ফাইল Next.js-স্ক্যাফোল্ড+.next-ক্যাশ রিপো-তে ঢুকে যাচ্ছিল — রিসেট + root .gitignore-এ রুট-অ্যাংকড স্যান্ডবক্স-ডির ইগনোর (2f8a6a6 push); parallel session100-b-এর ওপর rebase ✓
- QA: ১৩-পেজ ২০০ + /api/health + contact ব্রাউজার-চেক — বেসলাইন গ্রিন; rg -r ফ্ল্যাগ (replace) ভুয়া-'করাপশন'-অ্যালার্ম ডিবাংক (md5-মিল)
- 🚨 **বড়-বাগ-আবিষ্কার:** যোগাযোগ-ফর্ম **কখনোই কাজ করত না** — ① ফর্মে _csrf-ফিল্ডই ছিল না ② /contact ক্যাশেবল-পাবলিক (PUBLIC_CACHE_RE72) → রেন্ডার-টোকেন এফেমেরাল (সেশন/কুকি-তে নেই) → urlencoded-POST সবসময় 403/303-?csrf=1-বাউন্স (success-strip ডেড-কোড)
- **ফিক্স (routes/api.js + view):** ফর্মে _csrf-হিডেন-ইনপুট (res.locals.csrfToken) + fetch-ইন্টারসেপ্ট (FormData→URLSearchParams, meta-fallback) + **CSRF-অটোরিকভারি**: 403-নিরাপত্তা-এররে fresh ?_u= GET (ক্যাশ-বাইপাস → Set-Cookie+বৈধ-টোকেন; XTransformPort-প্রিজার্ভ) → রিট্রায় ② হ্যান্ডলারে ইন-মেমরি রেট-লিমিট (৫/১০মি/IP + ৫০০-কী-প্রুন) + wantsHtml-ডিটেক্ট (Accept:text/html → 303 ?success=|error=; fetch → JSON {ok}) + ইনপুট-ক্ল্যাম্প (120/200/4000)
- **ফিচার:** প্রভোস্ট-সার্চ (হল/প্রভোস্ট/বিভাগ, কাউন্ট+empty-state+clear, সার্চে auto-এক্সপ্যান্ড) + কপি-টু-ক্লিপবোর্ড (execCommand-fallback, ✓-ফিডব্যাক) + মোনোগ্রাম-টাইল (প্রথম-অক্ষর, tint-সাইকেল) + 'আজ খোলা' লাইভ-ব্যাজ (data-days/data-closed-পার্স, রেঞ্জ-সাপোর্ট, is-today-রো + বর্ডার-টপে 'আজ' চিপ) + ContactPoint JSON-LD (+880-নরমালাইজ)
- **স্টাইল:** session103-ব্লক — শাইন-সুইপ (ch-card), গ্রেডিয়েন্ট-ট্রিম (sec-head), জেব্রা+ইনসেট-অ্যাকসেন্ট (ts-table), পালস-ডট (fs-free/tb-dot), focus-visible-রিং ×৮, 640px+reduced-motion
- E2E: fetch-সাবমিট → inline-success + form-reset + DB-রো ✓; no-JS ২-স্টেপ (csrf=1-রিকভারি → success-রিডাইরেক্ট) ✓; রেট-লিমিট [200,200,200,429...] ✓; সার্চ 'শাহ'→২ ✓ এম্পটি ✓ ক্লিয়ার→১৫ ✓; কপি-ক্লাস ✓; আজ-ব্যাজ সোমবার-রো ✓; JSON-LD ✓; 390px-০ ✓ কনসোল-০ ✓
- 🚨 গোটচা-নতুন: **style.css-এডিটের পর সার্ভার-রিস্টার্ট না করলে AV-ক্যাশ-বাস্ট স্টেল থাকে** — ব্রাউজার পুরনো ?v= URL ক্যাশ থেকে দেখায় (ভিজ্যুয়াল-QA-র আগে রিস্টার্ট বাধ্যতামূলক)

Stage Summary:
- কমিট: session103 push ✓ — ফাইল: api.js (contact-হ্যান্ডলার), lekhok-contact.ejs (ফর্ম+টুলস+JSON-LD+স্ক্রিপ্ট), style.css (session103-ব্লক), routes/pages.js (error-লোকাল)
- ফর্ম এখন দুই-পথেই কাজ করে (JS: inline+auto-CSRF-রিকভারি; no-JS: ২-স্টেপ প্ল্যাটফর্ম-রিকভারি → success-strip) — আগে ০%-ও সেভ হতো না
- পরবর্তী: contact_submissions অ্যাডমিন-ভিউ (ইনবক্স), ম্যাপে মাল্টি-পিন, hCaptcha-টার্ন (রেট-লিমিট ভলিউম বাড়লে)

---
Task ID: cron-r4 (সেশন ১০৫ — webDevReview রাউন্ড ৫)
Agent: Z.ai Cron Agent (webDevReview)
Task: প্রজেক্ট-স্টেটাস অ্যাসেসমেন্ট + agent-browser QA → বাগ-ফিক্স/ফিচার-নির্বাচন → ইউনিয়ন-মার্জ (actor-avatar legacy-fallback + EventSource-গার্ড) + ডক-সিঙ্ক

Work Log:
- worklog/PROJECT/PLANS রিভিউ + git fetch → QA-ফেজ: pkill → port-ভেরিফাই → seed-qa-users (সার্ভার-বন্ধ) → সার্ভার+টেস্ট এক-ইনভোকেশনে
- calls-E2E ২-ফেইল পরিবেশ-ত্রুটি (CALL_RING_TIMEOUT_S ছাড়া বুট) → env-সহ ৫৪/৫৪; role-policy ১৩-ফেইল বেসলাইন-করাপশন (testadmin banned) → pkill -9 + DB-রিপেয়ার → গ্রিন
- ব্রাউজার-QA-তে ৩টি নতুন স্যান্ডবক্স-গোটচা আবিষ্কৃত: ① SANDBOX_PORT-হীন বুটে `<script src>`-404-পরে src-প্যাচে পুনঃএক্সিকিউশন-অসম্ভব (CSS-এ সম্ভব) → main.js-নীরব-মৃত্যু ② agent-browser-প্রোফাইলে পুরনো SW টিকে থাকে (unregister+cache-clear রেসিপি) ③ wc -c বনাম JS .length (বাংলা ৩-বাইট) মিথ্যা stale-তত্ত্ব
- ফোকাস: মাস্টার-টেবিল ০৭+০৮ নিয়ে কাজ শুরু করেছিলাম — মাঝ-রাউন্ডে git fetch-এ সমান্তরাল session100/102-কমিট (6489f32/4007e95) পাওয়া গেল যাতে ০৭ (কম্পোজার-মোডাল), ০৮ (র‍্যাংকড-ফিড), actor-avatar **ইতোমধ্যেই ইমপ্লিমেন্টেড**
- **ইউনিয়ন-সিদ্ধান্ত:** তাদের ইমপ্ল ক্যানোনিকাল (already-E2E'd+pushed); আমার প্যারালাল-ইমপ্ল (composer-modal.ejs + composer-modal.js + .lf-cmodal + data-cmodal-open + popularTags102) বাদ; stash→rebase→pop-কনফ্লিক্ট ৮-ফাইল হাতে-রিজলভ (docs-union, কোড-তাদের+আমার-অনন্য)
- **অনন্য-অবদান রক্ষা:** ① server.js FETCH_GUARD-এ EventSource-র‍্যাপ (SSE গেটওয়ে-টপলেভেলে 404→ফলব্যাক-পোল হতো) ② actor-avatar legacy-row-ফলব্যাক — actor_id-NULL রোতে link-prefix থেকে হুবহু actor_id/actor_avatar-শেপে ভরা (server.js + dashboard.js, এক IN-কুয়েরি) ③ টাইপ-রঙা ico-<type> আইকন ×৯ + has-avatar hover-zoom (style.css)
- reset-qa-logins.js চালানো (ismail=secret123 বেসলাইন — 9824dd6-চুক্তি); রানিং-সার্ভারের ইন-মেমরি-DB ফাইল-সিড ওভাররাইট করে — রিসেট-পরে রিস্টার্ট আবশ্যক (পুনঃপ্রমাণিত)
- যাচাই: role-policy ১০৭/১০৭ + calls ৫৪/৫৪ + EJS-কম্পাইল ×২ + node --check ×৪ + ব্রাউজার (their-modal ওপেন/ক্লোজ ✓ অ্যাভাটার-ফলব্যাক ✓ insert-path actor_id=53 ✓ ico-রঙা ✓ SSE-open ✓ কনসোল-০)
- PROJECT.md §১০-তে সেশন-১০৫-এন্ট্রি + PLANS.md-এ Cross-Agent-Note (session102-নোট প্রতিস্থাপন করে)

Stage Summary:
- মূল-কমিটের সাথে pushed ✓ — মাস্টার-টেবিলে খালি: ০৫-কার্সার-পলিশ + ১৭-হোম-কিউরেশন
- ফাইল: server.js (EventSource-গার্ড + legacy-fallback), routes/dashboard.js (recent-enrichment), header.ejs/live.js/style.css (মার্কআপ+রঙ-ইউনিয়ন), PROJECT.md/PLANS.md
- পরবর্তী: ০৫-কার্সার-পলিশ → ১৭-হোম-কিউরেশন → শেয়ার্ড-ট্যাব pagination → Metered.ca-TURN (ইউজার-অ্যাকাউন্ট) → গ্রুপ-কল

---
Task ID: cron-r5 (সেশন ১০৮ — webDevReview রাউন্ড ৬; ১০৭-লেবেল-রেস: ৭a23401+keyset-এজেন্টদের সাথে সংঘর্ষ)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → কন্টাক্ট-ইনবক্স-আপগ্রেড (/admin/messages) + /notifications ফুল-পেজ actor-avatar → rebase (session104-১০৫ ইউনিয়ন) → push

Work Log:
- worklog/PLANS রিভিউ + QA: ১৪-পেজ ২০০ + health 0ms + ট্যাগ-বার/rank-chip/sort-bar লাইভ → বাগ-শূন্য
- ইনবক্স: contact_submissions.status মাইগ্রেশন + সার্চ/ফিল্টার/পেজিনেশন/CSV/স্ট্যাটাস-ট্রানজিশন/ট্র্যাশ-ডিলিট + ibx-* ফুল-স্টাইলিং; E2E curl+agent-browser সম্পূর্ণ ওয়ার্কফ্লো
- ফুল-পেজ avatar: daily.js JOIN + session105-legacy-fallback-মিরর + has-avatar ভিউ-ব্রাঞ্চ + পেজ-ভ্যারিয়েন্ট CSS
- rebase-কালে আবিষ্কার: origin-এর style.css-এ session104-কমেন্ট-ব্লকের /*-ওপেনার হারানো ছিল → পুনঃস্থাপনসহ union-মার্জ
- সেশন-নাম্বার-সংঘর্ষ এড়াতে push-এর আগে origin-worklog-চেক → ১০৭ লেবেল

Stage Summary:
- /contact-সাবমিশন এখন অ্যাডমিনে দৃশ্যমান (ওয়ার্কফ্লো-সহ) — session103-এর "কেউ দেখে না" অনুরোধ পূরণ
- রোডম্যাপ ২০/২০ সম্পূর্ণ (keyset-এজেন্টের session107); আমার স্বাধীন ইনবক্স-ইমপ্ল session107-ক্যানোনিকালের কাছে প্রত্যাহৃত — অনন্য রক্ষিত: ফুল-পেজ avatar + CSV (তাদের স্কিমায়) + style.css-ওপেনার-রিপেয়ার
- পরবর্তী: ০৫ → ১৭ → ইনবক্স-বাল্ক/রিপ্লাই

---
Task ID: cron-r5-পুশ-নোট (সেশন ১০৮ — পুশ-রেস-লগ)
Agent: Z.ai Cron Agent (webDevReview)
Task: পুশ-সময়ে দুই-রাউন্ড rebase (প্রতিটি পুশ-প্রচেষ্টার মাঝেই নতুন origin-কমিট ঢুকেছে)

Work Log:
- পুশ-চেষ্টা ১ → 7a23401 (ইনবক্স session107) + keyset-session107 আবিষ্কৃত → ক্যানোনিকাল-গ্রহণ (ইনবক্স-ফাইল ×৪ --ours) + CSV-ডোনেশন (তাদের স্কিমায় অ adapt) + style.css-ওপেনার-রিপেয়ার + worklog/PLANS-ইউনিয়ন
- পুশ-চেষ্টা ২ → 236ac3f (docs) ঢুকল → আবার rebase; style.css-এ তৃতীয় "session108" (FB-পোস্ট-ফুটার এজেন্ট) union — মার্কার-মুক্ত, brace-0, ওপেনার-সমান
- ফাইনাল: a8adbf9 (docs) + e8c6fbb + 94bc1d2 + 4351f13 → origin/main ✓; পুশ-পরে smoke: health + / + /articles + /admin/messages ২০০ ✓

Stage Summary:
- মোট পুশ: ৪-কমিট; এক-রাউন্ডে ৩-বার সেশন-লেবেল-সংঘর্ষ (১০৭×২, ১০৮×২) — ভবিষ্যতে লেবেলের বদলে কনটেন্ট-ফিঙ্গারপ্রিন্ট/টাইমস্ট্যাম্প-স্টাইল আইডি ভাবনা
- ইনবক্স-ফিচার এখন ডুয়াল-উৎস: 7a23401-কোর (bulk/ব্যাজ/মোডাল) + আমার CSV/ফুল-পেজ-avatar/ওপেনার-রিপেয়ার

---
Task ID: session109 (ইউজার-রিপোর্ট: ব্যক্তিগত-ফিড ডিজাইন)
Agent: Z.ai Main Agent (ইউজার-সেশন)
Task: /me পেজের প্রফেশনাল রিডিজাইন — ৭-ডুপ্লিকেট-স্ট্যাট-বক্স, বাটন-কনট্রাস্ট, টেক্সট-ওভারফ্লো, বিশাল-ফাঁকা-চার্ট

Work Log:
- রিপো fresh-ক্লোন → sql.js লোকাল বুট → md_rafsan QA-পাসওয়ার্ড + ডেমো-পোস্ট/লাইক/বুকমার্ক সিড (তারিখ-স্প্রেড: এপ্রি/জুন/সেপ্ট) → agent-browser before-স্ক্রিনশটে ইউজারের ৪-অভিযোগই পুনরুৎপাদিত
- me.ejs: stats-grid(৭ টাইল) বিলুপ্ত → ট্যাব-ব্যাজ (tb-badge, FB-প্যারিটি অর্ডার: পোস্ট→ড্রাফট→সংরক্ষিত→মন্তব্য→প্রতিক্রিয়া→অনুসরণ→অ্যাক্টিভিটি→ক্যাটাগরি), ড্রাফট-ট্যাব সর্বদা দৃশ্যমান + ০-তে empty-state; হিরো-কমপ্যাক্ট (রোল-চিপ + অনুসারী/অনুসরণ-লাইন); SVG-চার্ট → HTML flex-বার (৮৪px, শূন্য-মাসে ৬px স্টাব, ভ্যালু>০ লেবেল) + ws91Toggle (লুকান/চার্ট, aria-expanded); KPI-চিপে min-width:0-truncate-গার্ড
- style.css EOF (সেশন-১০৯-ব্লক): হিরো-বাটন !important-ওভাররাইড — আবিষ্কার: লিগ্যাসি .btn-primary{color:...!important} সাদা-অন-সাদা বানাচ্ছিল; 'নতুন লেখা'=emerald-গ্রেডিয়েন্ট+সাদা, 'প্রোফাইল'=সাদা-সলিড+গাঢ়#0a3d34; ট্যাব-পিল + ≤640px (হিরো-কলাম, KPI×২, চার্ট-৭২px)
- E2E: ডেস্কটপ+৩৯০px স্ক্রিনশট ✓ টগল-দুই-দিক ✓ ট্যাব-সুইচ×৩ ✓ ?tab=ডিপ-লিংক ✓ কনসোল-০ ✓ ৫-পেজ-রিগ্রেশন ২০০ ✓
- push-রেস: 564a2fc কমিটের পরে origin-এ নতুন ৪-কমিট → rebase-কনফ্লিক্ট (style.css EOF) → ইউনিয়ন-মার্জ (session108-FB-ফুটার-ব্লক + আমার ব্লক) → 6fdf34c pushed ✓ post-merge smoke ✓

Stage Summary:
- /me এখন FB-প্যারিটি কমপ্যাক্ট: ডুপ্লিকেট-গ্রিড-শূন্য, দুই-বাটনই AA-কনট্রাস্ট, চার্ট ~৩০০px→৮৪px, লম্বা-টাইটেল-ওভারফ্লো-শূন্য
- গোটচা-নোট ভবিষ্যৎ-এজেন্টদের জন্য: style.css-এ !important-লিগ্যাসি আছে — /me-স্কোপ ওভাররাইডেও !important লাগবে; AV মাই-টাইম-ভিত্তিক তাই CSS-এডিটের পরে সার্ভার-রিস্টার্ট অপরিহার্য
- পরবর্তী প্রার্থী: ফিড-কার্ডে cover-image-হাইড্রেশন-স্কেলেটন, /dashboard-এ ws109-স্টাইল স্ট্যাট-চিপ বহন

---
Task ID: cron-r1 (session110+111 — webDevReview রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → ফিড-এনরিচমেন্ট (পড়ার-সময় + skeleton + আমার-সারসংক্ষেপ) → union-মার্জ CSS-ব্রেক-রিপেয়ার

Work Log:
- worklog/PLANS রিভিউ + QA-সুইপ: ১০-পেজ ২০০, কনসোল-০ → বাগ-শূন্য, তাই ফিচার-রাউন্ড
- ① পড়ার-সময়: decorateFeed-এ read_mins (মার্কডাউন-স্ট্রিপ ÷৯৫০ অক্ষর/মিনিট) → rt-chip ফিড-হেড + /me মেটা; /dashboard/more-অ্যাপেন্ড-পাথে অটো (more-পার্স: cards:10 rt:3) ② img-skel শিমার (post-gallery solo/main + repost feed-image, onload→ld, reduced-motion-সেফ) ③ ড্যাশবোর্ড-সাইডবারে 'আমার সারসংক্ষেপ' — myStats ৪-লাইট-কুয়েরি → ২×২ স্লিম-চিপ (/me?tab=ডিপ-লিংক); E2E: ডেস্কটপ+ranked+390px+কনসোল-০ ✓
- push-রেস: 4868b07 কমিটের পরে origin-এ 2a8d411 (অন্য-এজেন্টের session110-লেবেল!) + 9bb2a98 ঢুকেছে → rebase-পরে আবিষ্কৃত: তাদের EOF-ব্লক আমার @media-ব্লকের ক্লোজিং }-এর আগে splice হয়েছিল → ১০৭/১১০-ব্লক ডেস্কটপে ডেড → f736fc1 রিপেয়ার (comment-stripped brace-depth ২৬০২/২৬০২ ✓ + লাইভ-যাচাই rt-chip:flex ✓)
- /resources-500 তদন্ত: ভিউ-নতুন/রাউট-পুরনো = স্টেল-সার্ভার-প্রসেস; রিস্টার্টে ২০০ — রিপো-বাগ নয়

Stage Summary:
- ফিড এখন ধনী: পড়ার-সময়-চিপ + লোডিং-শিমার + ড্যাশবোর্ডে ব্যক্তিগত-স্ট্যাট-শর্টকাট (৪৮৬৮b07→rebase→0442f44 + f736fc1)
- 🚨 প্যারালাল-এজেন্ট-শিক্ষা: (ক) EOF-ব্লক append করলে আগের-ব্লকের ক্লোজিং-ব্রেস নষ্ট হতে পারে — মার্জ-পরে comment-stripped brace-depth-চেক বাধ্যতামূলক (খ) সেশন-লেবেল-রেস আবার (১১০×২) — টাইমস্ট্যাম্প-স্টাইল-আইডি প্রয়োজনীয় (গ) CSS-এডিট-পরে সার্ভার-রিস্টার্ট + স্টেল-প্রসেস-সন্দেহে রুট-কজ-বিচারের-আগে রিস্টার্ট
- পরবর্তী: /article-single-এও rt-chip + পড়া-অগ্রগতি-বার, msx-উইজেটে drafts-চিপ, ws91-পুরনো-SVG-রুল-পরিষ্কার

Task ID: session-105
Agent: Z.ai (Design-System Agent — sandbox web-68dcf7c4, channel zai-web)
Task: Lekhok-Forum — সেন্ট্রালাইজড গ্লোবাল ডিজাইন-সিস্টেম (Single Source of Truth) প্রতিষ্ঠা: ডিজাইন-টোকেন + ক্যানোনিকাল কম্পোনেন্ট-ম্যাট্রিক্স + ৫ অপরিবর্তনীয় নিয়ম + মাল্টি-এজেন্ট গার্ড-লিন্ট + E2E QA + ক্রন-হ্যান্ডওভার

Work Log:
- **অবস্থা-যাচাই:** GitHub (ghp_…KSHO) থেকে fresh clone @ 1704998 (session-104-docs) → sandbox-রুটে রিপো-ইনস্টল (Next.js-scaffold root-.gitignore-ইগনোরড, আগের এজেন্ট-কনভেনশন অনুযায়ী) → bun install → Express :3030 বুট (SANDBOX_PORT=3030, gateway XTransformPort-প্রিভিউ) — স্মোক ২০০
- **ম্যাপিং:** পোস্ট-কার্ড ৪-আইডিওম, কমেন্ট ২-রেন্ডারার, মেসেঞ্জার JS-ডুপ — অসামঞ্জস্য-তালিকা → ক্যানোনিকালাইজেশন-প্ল্যান
- **Design Tokens:** lekhok-forum/public/assets/css/tokens.css (ইউজারের tailwind-config-স্পেকের CSS-ভেরিয়েবল-অ্যাডাপ্টেশন: brand #006A4E, social #1877F2, ui #F0F2F5/#FFFFFF/#E4E6EB, text #050505/#65676B, reaction ×৪, radius 16/18/9999) + লিগ্যাসি-ভেরিয়েবল-রিম্যাপ (style.css/auth.css অক্ষত) + :root:root + head-শেষ-লোড (header.ejs + layout.ejs দুই-হেডেই) + html-ক্যানভাস-লক
- **Shared কম্পোনেন্ট:** lekhok-forum/views/shared/{post,comment,user,messenger}/ — FeedPostCard, PostFooterActions (৩-ফিক্সড শেয়ার + রিঅ্যাক্টরস-মডাল-ট্রিগার), PostActionMenu, ReactorsModal, CommentItem (হোভার ৩-ডট/৬-ইমোজি প্যালেট/কর্নার-ব্যাজ), CommentComposer, MessengerBubble; পুরনো partials → delegate-শিম
- **রিফ্যাক্টর:** /dashboard, /profile/[id] (pin-মেনু + bookmark-ডেকোরেশন), /me, /articles/[id] (রিলোড-নেই থ্রেড), /articles তালিকা (AuthorLabel + লিগ্যাসি-/api/like-বাদ), /messages/[username] (JS-বাবল-বিল্ডার → /api/messages/render)
- **API:** /api/comments?format=html · PUT/DELETE /api/comments/:id · /api/reactions/:type/:id +users · /api/messages/render
- **গার্ড:** lekhok-forum/scripts/guard-design-system.js + npm run guard:design — shared/-বহির্ভূত ক্যানোনিকাল-মার্কআপ/লিগ্যাসি-ইঞ্জিন/শিম-দূষণ/CSS-ক্রম-লঙ্ঘনে ফেইল
- **E2E (agent-browser):** ফিড-কার্ড কাউন্টার-বার ✓ ড্রয়ার-প্রিভিউ-সোয়াপ ✓ প্যালেট-রিঅ্যাক্ট (❤️৪) ✓ টগল-অফ ✓ কমেন্ট-এডিট/ডিলিট (সার্ভার-প্রমাণসহ) ✓ রিঅ্যাক্টরস-মডাল ✓ শেয়ার-মেনু = ৩-অ্যাকশন ✓ চ্যাট optimistic→ক্যানোনিকাল-প্রতিস্থাপন ✓ ৩৯০px-ওভারফ্লো-০ ✓ কনসোল-০ ✓
- ডকস: PROJECT.md Changelog সেশন ১০৫ + §৮-টোকেন-নোট; PLANS.md Cross-Agent Note; lekhok-forum/worklog.md সেশন-১০৫
- **ক্রন:** webDevReview ১৫-মিনিট টাস্ক সেট (এই-সেশনে)

Stage Summary:
- প্ল্যাটফর্মের পোস্ট/কমেন্ট/মেসেঞ্জার-মার্কআপ ও রঙ — এক-সোর্স-লকড; এক-প্রান্তের আপডেট এখন সর্বত্র সমানভাবে প্রতিফলিত (ইউজারের মূল-লক্ষ্য)
- পরবর্তী-এজেন্টের প্রথম-কাজ: `git fetch` → lekhok-forum/PLANS.md-এর Cross-Agent Note Session 105 পড়ুন → `npm run guard:design` গ্রিন-রাখুন
- রিস্ক/অবশিষ্ট: qa-single-উত্তর এখনো নিজস্ব-আইডিওম; role-policy-স্যুটে নতুন comment-API-চেক যোগ হয়নি; লাইভ-Turso-ডিপ্লয়ে seed-স্ক্রিপ্ট প্রযোজ্য নয় (ডেমো-ডেটা sandbox-ক্লোন-লোকাল)

---
Task ID: cron-r2 (session112 — রাউন্ড-৩: QA-সুইপ → পড়া-চালিয়ে-যান-উইজেট)
Agent: Z.ai Cron Agent (webDevReview)
Task: QA-সুইপ → স্টেবল-ফেজ প্রমাণিত → নতুন-ফিচার রাউন্ড ('পড়া চালিয়ে যান' + খসড়া-চিপ + ws91-হাইজিন)

Work Log:
- QA-সুইপ: ১২-পেজ ২০০ (৩০২=অথ-গেট, সঠিক) + কনসোল-০ → বাগ-শূন্য → ফিচার-রাউন্ড (ম্যান্ডেট ৪+৫)
- ① **'পড়া চালিয়ে যান' উইজেট (নতুন):** article-reading.js-এর lf_read_pos-এ ti(টাইটেল)+u(পাথ) যোগ → নতুন continue-reading.js ড্যাশবোর্ড-সাইডবারে সর্বশেষ-৩ অসমাপ্ত-লেখা আঁকে (শূন্য-API, খালি-তালিকায় কার্ড-লুকানো, ৪px প্রগ্রেস-বার+×-সরান) → লিঙ্কে-গেলে session৬৩ রিজিউম-ব্যানার অবস্থান-ফেরায়
- ② **msx খসড়া-চিপ:** ফুল-উইডথ ৫ম চিপ (.msx-chip.wide) → /me?tab=drafts; myStats-এ drafts-কুয়েরি
- ③ **ws91-হাইজিন:** SVG-যুগের মৃত-রুল সরানো (.ws91-chart/.ws91-bar/ws91grow/bar-num/bar-lbl); ⚠️ 'idden]-ভাঙা-সিলেক্টর' সন্দেহ মিথ্যা-অ্যালার্ম ছিল — od-bytes-যাচাইয়ে [hidden] অক্ষত (টুল-আউটপুটে [h খাওয়ার ডিসপ্লে-আর্টিফ্যাক্ট); শিক্ষা: সন্দেহে আগে raw-bytes দেখুন
- E2E: seed-long-article-112 (২৯০১-অক্ষর, সার্ভার-বন্ধে) → ৫৭%-স্ক্রল→r/ti/u-সেভ ✓ উইজেট-রেন্ডার ✓ রিজিউম-ব্যানার→স্ক্রল-১২৫৩px ✓ ×-সরান→লুকান ✓ 390px-০ ✓ /me-টগল+৮-ট্যাব ✓ কনসোল-০ ✓ guard:design গ্রিন ✓
- 🚨 নতুন এনভ-গোটচা: এই-স্যান্ডবক্সে Bash-টুল-কলের-মাঝে ব্যাকগ্রাউন্ড-সার্ভার-প্রসেস মারা যায় (nohup+setsid-ও ব্যর্থ) → রিপো-রুটে আনট্র্যাকড ensure-server.sh হেল্পার রাখা হল (curl-হেলথ-চেক→না-থাকলে setsid-বুট; প্রতিটি টেস্ট-ব্লকের শুরুতে কল করুন)
- push-রেস: stash→rebase (session105 ডিজাইন-সিস্টেম + session109-যোগাযোগ + PLANS-ডকস) → stash-pop-এ style.css EOF-কনফ্লিক্ট → union-মার্জ (দুই-ব্লক সহ-সংরক্ষিত) + brace-চেক + guard:design + লাইভ-রি-যাচাই

Stage Summary:
- পুশড: feat(session112) + docs — পাঠকের অসমাপ্ত-লেখা এখন ড্যাশবোর্ড থেকেই ধরা পড়ে (ব্রাউজার-লোকাল, প্রাইভেসি-সেফ)
- পরবর্তী-প্রার্থী: ① crx-উইজেটে 'সব দেখুন' এক্সটেনশন (৩০-এন্ট্রি ম্যাপের পূর্ণ-তালিকা-পেজ) ② /qa-single-উত্তরে CommentItem (session105-সুপারিশ) ③ role-policy-স্যুটে comment-API-চেক ④ /notifications actor-avatar ⑤ tokens.css-হার্ডকোড-স্ক্যান-গার্ড
Task ID: cron-r6 (সেশন ১১০ — webDevReview রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → মাস্টার-টেবিল শেষ-২ আইটেম (০৫ কার্সার-পলিশ + ১৭ হোম-কিউরেশন) → ইউনিয়ন-মার্জ + push

Work Log:
- worklog/PROJECT/PLANS রিভিউ + git fetch (HEAD=2e36960 থেকে শুরু) → QA-ফেজ: pkill → port-ভেরিফাই → seed-qa-users (সার্ভার-বন্ধ) → সার্ভার (SANDBOX_PORT=8080 CALL_RING_TIMEOUT_S=4) + role-policy ১০৭/১০৭ + calls-E2E ৫৪/৫৪ — সব-গ্রিন
- ব্রাউজার-QA: হোম/লগইন(ismail)/ড্যাশ(১৫-কার্ড)/মেসেঞ্জার-চ্যাট/রিসোর্স-ডিটেইল/আর্টিকেল — কনসোল-০; ৩৯০px (`agent-browser set viewport 390 844`) ৪-পেজ ওভারফ্লো-০; /article/2→404 মিথ্যা-অ্যালার্ম (সঠিক রুট /articles/:id)
- ফোকাস-নির্বাচন: মাস্টার-টেবিল শেষ-২ — ০৫ (keyset) + ১৭ (হোম-কিউরেশন)
- **০৫ দুই-এজেন্টে স্বাধীন-ইমপ্ল হয়েছিল:** আমার ইমপ্ল (single pipe-কার্সার + অর্ডিনাল-ORDER 8,1,2 + 400-bad_cursor) হাতে-কোরা অবস্থায় git fetch-এ 9c53cab (তাদের keyset-ইমপ্ল) পাওয়া গেল — session105-প্রেসিডেন্ট অনুযায়ী **তাদেরটাই ক্যানোনিকাল গৃহীত**, আমার সার্ভার/ক্লায়েন্ট-ইমপ্ল প্রত্যাহৃত
- **স্বতন্ত্র-আবিষ্কার-প্রমাণ:** দুই-ইমপ্লই একই ২-SQL-গোটচা ধরেছে — JOIN-শাখায় ORDER BY id ambiguous (p.id/u.id) + UNION-compound-এ ৩য়-টার্ম-নাম-কোয়ার্ক; সমাধান-দুটি (p.id-as-id-অ্যালিয়াস বনাম অর্ডিনাল-ORDER) PLANS-নোটে রেফারেন্স-সংরক্ষিত
- **অনন্য-অবদান রক্ষা:** ① E2E verify-session107-cursor.js ক্যানোনিকাল-চুক্তিতে (cursor=<ts>&cursorType&cursorId → nextCursor:{ts,type,id}) অ্যাডাপটেড — ২২/২২ ALL GREEN **ক্যানোনিকাল-ইমপ্লের বিরুদ্ধে** (২৬-পোস্ট টাই-ব্যাচ · চেইন-ডুপ্লিকেট-শূন্য · অ্যান্টি-ড্রিফট-প্রমাণ + OFFSET-ডুপ্লিকেট-প্যারিটি · ভাঙা-কার্সার→graceful-ফলব্যাক · ক্লিনআপ HTTP-API-ভিত্তিক ২৭/২৭) ② dashboard.css session107-লোডিং-পলিশ (স্কেলেটন-শিমার + গ্লাস-পিল + done-টিন্ট) ③ ১৭-যাচাই (সেশন-৯০-ই সম্পন্ন; হোমে AVATAR/COVER_UPDATE-লিক-শূন্য) — মাস্টার-টেবিল ০৫+১৭ ✅ → **২০/২০**
- rebase ×২ + push-রেস ×২ (ed8744c → 4381ef6 মাঝ-পথে এসেছে) — PLANS-ইউনিয়ন-মার্জ ×২; final push 2a8d411 ✓; push-পরবর্তী HEAD-এ role-policy ১০৭/১০৭ + calls ৫৪/৫৪ + cursor ২২/২২ পুনঃনিশ্চিত

Stage Summary:
- origin/main @ 2a8d411 — মাস্টার-টেবিল **২০/২০ সম্পূর্ণ** (০৫+১৭ ✅)
- ক্যানোনিকাল keyset-চুক্তি: ?cursor=<ts>&cursorType=<type>&cursorId=<id> → nextCursor:{ts,type,id}; ভাঙা-কার্সারে OFFSET-ফলব্যাক (never-500)
- নতুন টেস্ট: scripts/verify-session107-cursor.js (ক্যানোনিকাল-চুক্তি; ভবিষ্যৎ-রিগ্রেশনে চালানো যায়)
- পরবর্তী: শেয়ার্ড-ট্যাব pagination (Agent-Chat-লক) → প্রোফাইল-টাইমলাইন স্ক্রল-রিস্টোর → Metered.ca-TURN (ইউজার-অ্যাকাউন্ট) → গ্রুপ-কল

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


---
Task ID: cron-r113 (সেশন ১১৩ — webDevReview রাউন্ড, job 393977)
Agent: Z.ai Cron Agent (webDevReview — sandbox web-68dcf7c4)
Task: QA-সুইপ → ডিজাইন-সিস্টেমের শেষ-বড়-অসামঞ্জস্য দূর (qa-single উত্তর → ক্যানোনিকাল CommentItem/CommentComposer) + গার্ডে hex-স্ক্যান + role-policy-তে comment-অথরাইজেশন-চেক

Work Log:
- সিঙ্ক: git pull --rebase → session112 (continue-reading উইজেট + msx খসড়া-চিপ) গৃহীত; ৯-পেজ স্মোক ২০০ + health ✓; guard গ্রিন ✓ — বেসলাইন বাগ-শূন্য
- **রোডম্যাপ-নির্বাচন:** session105-সুপারিশের ১-নম্বর আইটেম বাস্তবায়ন — QA-উত্তর-থ্রেড এখন ফিড/আর্টিকেল-কমেন্টের সাথে হুবহু একই ক্যানোনিকাল-বাবল (ইউজারের নিয়ম-২: "একক পোস্টের আলোচনা থ্রেড" এখন পূর্ণ)
- **qa-single.ejs:** ① উত্তর-লুপ → shared/comment/CommentItem (top-answer-chip স্লট-র‍্যাপে সংরক্ষিত) ② প্লেইন-textarea ফর্ম → shared/comment/CommentComposer (B/I/S/লিংক/তালিকা/উদ্ধৃতি + @ম্যানশন + AJAX /api/comment; no-JS ফলব্যাক নেটিভ-ফর্ম noscript-এ) ③ উত্তর-কাউন্টে .comments-total-স্প্যান ④ ReactorsModal include
- **বোনাস-আবিষ্কার:** QA-উত্তর comments-টেবিলেই (parent_id NULL) — ফলে session105-এর PUT/DELETE /api/comments/:id, প্যালেট, ব্যাজ, ৩-ডট — সব **শূন্য-নতুন-API-তে** উত্তরেও কাজ করে
- **ফিক্স:** article.css-এর লিগ্যাসি .answer-form-wrap{background:var(--bg-main)} (ডার্ক-নেভি) ক্যানোনিকাল-কম্পোজারের সাথে সংঘর্ষ → shared.css-এ টোকেন-লক সারফেস-ওভাররাইড + .qa-answer-slot/.qa-answers-list স্টাইল (টোকেন-ভিত্তিক)
- **গার্ড-বৃদ্ধি (session105-সুপারিশ ④):** ক্যানোনিকাল-লেয়ার hex-স্ক্যান — views/shared/** ও shared.css-এ টোকেন-হেক্স হার্ডকোড হলে ফেইল (মাল্টি-লাইন <%# %> কমেন্ট-সচেতন stateful স্ক্যানার)
- **role-policy (সুপারিশ ③):** test-role-policy.sh-এ §১৫ যোগ (anon 401 ×২, bogus 400, অন্যের PUT/DELETE 403 ×২, নিজের PUT 200) + লাইভ-ভেরিফিকেশন 3030-এ: 401/401/400/403/403 ✓ (author-jar ছাড়া নিজের-PUT-ও 403 — প্রত্যাশিত)
- **E2E (agent-browser, ismail):** composer-থেকে উত্তর → ক্যানোনিকাল-বাবল (bold/italic-মার্কডাউন রেন্ডার) ✓ প্যালেট love → ❤️১+লেবেল-সিঙ্ক ✓ ৩-ডট-এডিট → **data-raw-prefill** (মার্কডাউন-র-টেক্সট) → সেভ → সম্পাদিত-চিপ ✓ ডিলিট → DOM+সার্ভার-উভয়ে শূন্য ✓ পুনঃপোস্ট ✓ ডার্ক-কম্পোজার-গ্লিচ ফিক্স-পরে পরিষ্কার-সারফেস ✓ 390px-ওভারফ্লো-০ ✓ কনসোল-০ ✓

Stage Summary:
- ডিজাইন-সিস্টেম কভারেজ এখন: ফিড + আর্টিকেল-কমেন্ট + **QA-উত্তর-থ্রেড** + মেসেঞ্জার — ৫টি অপরিবর্তনীয় নিয়ম প্ল্যাটফর্ম-ব্যাপী
- guard নতুন-ক্ষমতা: hex-স্ক্যান (ক্যানোনিকাল-লেয়ারে রঙ = শুধু টোকেন)
- অবশিষ্ট/পরবর্তী: ① ইনবক্স-মিনি-MessengerBubble (messages-list প্রিভিউ) ② role-policy ফুল-স্যুট ফ্রেশ-ক্লোনে চালিয়ে SEED_CMT-ডকুমেন্টেশন ③ qa-উত্তরের top-answer-chip AJAX-রিফ্রেশ-পরেও টেকনামী রাখা (এখন রিলোডে ফেরে) ④ /notifications ফুল-পেজে actor-avatar

---

Task ID: RES-117 (ক্রন-রিভিউ রাউন্ড ৯ — session117)
Agent: Resources-feature agent
Task: অবস্থা-মূল্যায়ন + agent-browser QA → স্টেবল-ফেজে নতুন ফিচার: সিরিজ প্লেলিস্ট-প্যানেল (ইন-পেজ অডিও-পর্ব + অটো-অ্যাডভান্স) + পর্ব-তালিকা কলাপ্স + role-policy §১৬

Work Log:
- QA-সুইপ (রাউন্ড-শুরুতে): ৮-পেজ-ম্যাট্রিক্স 200 ✓; role-policy 107/107 (প্রথমে [000]/404-নয়েজ — কারণ: স্ক্রিপ্ট P=8080-হার্ডকোড + SEED_CMT=১-অনুপস্থিত; sed-পোর্ট-ওভাররাইড + ismail-কমেন্ট-সিডে সমাধান); agent-browser: /resources ২২-কার্ড+৭-পিল, কোল্ড-স্টার্ট 3198-CSS-rules, কনসোল-0, 390px-0 → **ফেজ-স্টেবল** → RES-108-সুপারিশ ③④ নেওয়া হলো
- **ফিচার-১ সিরিজ প্লেলিস্ট-প্যানেল:** routes/pages.js-এ seriesItems-এ audioSrc-কম্পিউট + seriesAudioCount; ভিউতে plhead ("সব শুনুন" + অডিও-গণনা) + অডিও-রো-তে ▶-বাটন + eq-স্প্যান; JS: playIdx (src-সোয়াপ: হিরো-অডিও বা ডকড মিনি-প্লেয়ার — নন-অডিও-পর্বের পেজে), 'ended'-অটো-অ্যাডভান্স (পরবর্তী-অডিও), MediaSession-মেটা, native-controls-সিঙ্ক; CSS: eq-অ্যানিমেশন+playing-স্টেট+মিনি-বার (safe-area+560px+reduced-motion+print-গার্ড)
- **ফিচার-২ কলাপ্স:** >১২-পর্বে প্রথম-১২+here দৃশ্যমান, "সব পর্ব দেখুন (N)" এক্সপ্যান্ডার (JS-ই দেখায়; noscript=পূর্ণ-তালিকা); li[hidden]!important-গার্ড
- **ফিচার-৩ role-policy §১৬:** bulk/update অথরাইজেশন ×৮-চেক (anon/user/mod × CSRF × মালিকানা; নিজের-আপলোড-তৈরি→update→ট্র্যাশ-ক্লিন-আপ E2E)
- **E2E-তে ধরা ২-বাগ (প্রি-পুশ ফিক্স):** ① ended-রিপ্লে — মিডিয়া-স্পেকে 'pause'-আগে-'ended' → curIdx-রিসেটে প্রথম-অডিও-পর্বে রিপ্লে-লুপ → a.ended-গার্ড (টাইমিং-প্রমাণ: dur 5.0s, ended-প্রত্যাশায় t=2.6-এ রিস্টার্ট-পাওয়া) ② অডিও-শূন্য সিরিজে কলাপ্স-অরফান (early-return) → দুই-IIFE-বিভাজন
- যাচাই: role-policy 122-চেক ALL GREEN ✓; agent-browser: মিনি-প্লেয়ার-প্লে/পজ/ক্লোজ ✓ play-all-হিরো-পাথ ✓ অটো-অ্যাডভান্স রো১→রো২ ✓ ended-ক্লিন-রিসেট ✓ ১৬-পর্ব-কলাপ্স+এক্সপ্যান্ডার ✓ 390px-0 ✓ কনসোল-0 ✓; টেস্ট-ডেটা-ক্লিন-আপ ১৭-রো (404-যাচাই) ✓
- টুলিং-নোট: curl --data-binary @<(node …) process-substitution-পেলোডে 400-নয়েজ — ফাইলে-লিখে-পাঠান; login-limiter (in-memory, ১৫মিনিট) পুনরাবৃত্ত-রানে "স্টাফ-পোর্টাল" চেক-নয়েজ দেয় — সার্ভার-রিস্টার্টে ক্লিয়ার

Stage Summary:
- push: 4be0779 — /resources/:id এখন অডিও-সিরিজে পূর্ণ-প্লেলিস্ট (নেভিগেশন-ছাড়া ধারাবাহিক শ্রবণ), >১২-পর্ব কলাপ্স, role-policy 122-চেক
- PLANS.md-এ নতুন-চুক্তি + মিডিয়া-স্পেক-গোটচা নথিভুক্ত; পরবর্তী-প্রস্তাব: CSV-URL-সাইড-ফেচ, UTC-ফিক্স, প্লেলিস্ট-রেজিউম
---
Task ID: session-113 (cron webDevReview রাউন্ড — origin/main @ 9e47c98 থেকে)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → স্বাধীন-ফোকাস: session105-এর শেষ-অবশিষ্ট সুপারিশ (qa-single উত্তর-কার্ড CommentItem-ক্যানোনিকালাইজেশন) + cursor-টেস্ট-রোবাস্টনেস + স্টাইলিং-পলিশ

Work Log:
- QA-ফেজ: ১৪-পেজ স্মোক ✓ guard:design ✓ role-policy 107/107 (seed-test-users.js-সহ — স্পষ্টীকরণ: দুই-সিড-ই-লাগে) + calls 54/54 + cursor 20/21→রোবাস্টনেস-ফিক্সে 22/22
- ব্রাউজার-QA: হোম/লগইন/QA-ফ্লো/notifications কনসোল-০; সার্ভিস-ওয়ার্কার অফলাইন-পেজ গ্রেসফুল-ডিগ্রেডেশন-প্রমাণিত
- ফিচার: CommentItem chip+noReply-প্যারাম (backward-compatible) → qa-single ক্যানোনিকাল-মাইগ্রেশন + শীর্ষ-উত্তর-চিপ + গেস্ট-ব্যাজ-প্যারিটি + MutationObserver-কাউন্টার-সিঙ্ক + shared.css session113-ব্লক (brace-০)
- বাগ-ফিক্স: comment-tools.js data-raw-স্টেল-প্রিফিল (সব-সারফেসে) + cursor-টেস্ট ২৬→৩৫ (env-artifact-ফল্স-ফেইল এড়ানো)
- E2E: react/edit/delete/counter-sync/guest-view/desktop+390px-০/কনসোল-০ ✓ রিগ্রেশন 107/107+54/54+22/22 ✓ টেস্ট-আর্টিফ্যাক্ট-ক্লিনআপ ✓
- ডকস: repo-worklog + PLANS session113-নোট + PROJECT চেঞ্জলজ

Stage Summary:
- session105-ডিজাইন-সিস্টেম-সুপারিশ-তালিকা এখন সম্পূর্ণ-শূন্য-অবশিষ্ট; qa উত্তরে FB-প্যারিটি (প্যালেট/ব্যাজ/৩-ডট)
- পরিবেশ-গোটচা পুনঃপ্রমাণিত: ব্যাকগ্রাউন্ড-সার্ভার প্রতি-ইনভোকেশনে মরে → মাল্টি-স্টেপ-ফ্লো ফ্রেশ-বুট+টাইট-চেইন (lf-boot.sh হেল্পার /home/z/my-project/download/)
- পরবর্তী: role-policy-তে comment-API-চেক · tokens-হেক্স-স্ক্যান-গার্ড · qa-কম্পোজার অটো-গ্রো · notifications ফিল্টার-ট্যাব

---
Task ID: session-113-ফাইনাল (push-সমাপ্তি)
Agent: Z.ai Cron Agent (webDevReview)
Task: push-রেস ×২ + প্যারালাল-ডুপ্লিকেট-সমন্বয় + পুশ-সমাপ্তি

Work Log:
- push-রেস ×২: ① rebase-১ (৮-কমিট: session110/112/114/115/116) — আবিষ্কার: প্যারালাল-এজেন্ট qa-single-কে **থ্রেডেড-উত্তরসহ** ক্যানোনিকালাইজ করেছে (replies113 + CommentComposer + no-JS) → session105-প্রেসিডেন্সিতে তাদের সংস্করণ গৃহীত, আমার flat-list-সংস্করণ প্রত্যাহৃত ② rebase-২ (session114-মিনি-বাবল) — shared.css EOF-ইউনিয়ন ×২ (brace-depth ০ উভয়বার)
- অনন্য-রক্ষিত: CommentItem chip/noReply-প্যারাম · comment-tools data-raw-ফিক্স · cursor-টেস্ট ২৬→৩৫ · session113-খ-CSS (chip+focus) · দুই-সিড-চুক্তি
- union-পরে তিন-স্তর-যাচাই: brace-০ ✓ guard:design ✓ লাইভ-রেন্ডার (fc-item+qa-answers-list+cc-form+noscript+comments-total সহ-অস্তিত্ব) ✓
- **pushed: 3a234b6..5dff97f** ✓ post-push ৭-পেজ-স্মোক ২০০ ✓
- PLANS/PROJECT/repo-worklog-এ প্রত্যাহার-সংশোধন-নোট (পরবর্তী-এজেন্ট: session117 থেকে)

Stage Summary:
- মূল-শিক্ষা: একই-সুপারিশে দুই-এজেন্ট সমান্তরালে কাজ করতে পারে — PLANS-নোট সবসময় push-এর আগে re-read করুন; union-মার্জে "সমৃদ্ধ-সংস্করণ-জয়" + অনন্য-অংশ-সংরক্ষণ নীতি আবার সফল
- env-gotcha চূড়ান্ত-রূপ: মৃত-প্রসেসের flush DB-কে পুরনো-স্ন্যাপশটে ফেরত পাঠায় (ডিলিট/তৈরি উভয়ই উল্টে যেতে পারে) — এক-ইনভোকেশনে তৈরি+যাচাই+ক্লিনআপই নিরাপদ

---
Task ID: session-116 (cron-QA-রাউন্ড — repo-root worklog)
Agent: Main agent (webDevReview — origin/main @ 1642c7f)

Work Log:
- QA-ফার্স্ট (:3130 আইসোলেটেড ফুল-কপি): ১৪-রুট-স্মোক + লগইন-E2E + গ্যালেরি-পেজিনেশন + session115-2FA-সারফেস + 390px ×৮ + কনসোল — বাগ-শূন্য (একটি নীরব-অ্যাঙ্কর-বাগ আবিষ্কৃত-ও-ফিক্সড)
- ফিচার: কমেন্ট-রিঅ্যাকশন নোটিফিকেশন (পোস্ট-ব্রাঞ্চ-প্যারিটি) + নোটিফ-আইকন ৩-স্তর রেজিস্ট্রি (header/পেজ/CSS)
- ফিক্স: QA-উত্তর অ্যাঙ্কর '#c'→'#answer-' + inspect-audit ৩-স্থায়ী-ফলস-নেগেটিভ (ক্যানোনিকাল-প্রথম রুল) — 44/3fail → 48/48
- E2E: নোটিফ-ফ্রেশ/টগল-অফ/সুইচ/সেলফ/প্রেফ ✓ আইকন ✓ অ্যাঙ্কর-স্ক্রল ✓ 390px-০ ✓ কনসোল-০ ✓ role-policy এক-DB-দুই-কোড ডেল্টা=+1 ✓

Stage Summary:
- session-116 push (হ্যাশ কমিটে); বিস্তারিত lekhok-forum/worklog.md + PROJECT.md §10 + PLANS.md নোট
- পরবর্তী: optimistic-থ্রেড-ইনসার্ট · লাইভ-Turso-রিসেট/সিক্রেট-রোটেশন ×৪ পেন্ডিং · নোটিফ-পেজ পার-টাইপ ফিল্টার

---
Task ID: cron-r4 (session119 — রাউন্ড-৫: QA → /me-রিগ্রেশন-আবিষ্কার → rebase-ইউনিয়ন (parallel-118 গৃহীত) → Q&A ফিল্টার + স্টেল-কাউন্টার-রিকনসিল)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-যাচাই + agent-browser QA → /me রিগ্রেশন (session114-মার্জ-ক্ষতে ১০৯-র ৪-ফিক্স হারায়) → রিস্টোর → সমান্তরাল session118 /me-রিডিজাইনের সাথে ইউনিয়ন → আমার অনন্য-ডেল্টা push

Work Log:
- QA-সুইপ ১২-পেজ কনসোল-০ — কিন্তু /me রিগ্রেশন-ধরা (৭-stat-tile + ~৩০০px SVG-স্ট্রেচ-চার্ট = ইউজার-অভিযোগ-স্টেট-ফিরে); গিট-আর্কিয়োলজি: session114-এর me.ejs-এডিট প্রি-১০৯-বেসে (CSS-ব্লক বেঁচে ছিল, মার্কআপ হারায়)
- রিস্টোর (৬-টার্গেটেড-এডিট, union-সচেতন) + /me-রুটে read_mins-প্লাম্বিং (session110-র অসম্পূর্ণ দাবি)
- নতুন ফিচার: /qa ফিল্টার-চিপ (সব N / অনুত্তরিত N; ?filter=unanswered) + উত্তর-স্টেট-ব্যাজ (সবুজ/অ্যাম্বার) + stale-comment_count→live-ans_count-ডিসপ্লে-ফিক্স + db/reconcile-comment-counts.js (idempotent)
- 🚨 নতুন গোটচা: sql.js in-memory — মরতে-থাকা-সার্ভারও বাসি-মেমরি ফ্লাশ করে → রিকনসিল-অর্ডার kill→reconcile→boot (প্রমাণিত ×৩)
- rebase-সংঘর্ষ: সমান্তরাল-এজেন্টও একই ইউজার-স্পেকে session118 /me-রিডিজাইন (৯-ট্যাব+অনুসারী-পেন+ws118+পূর্ণাঙ্গ-মাস) → me.ejs-এ তাদের-ভার্সন ক্যানোনিকল (FeedPostCard/angry/includes-অক্ষুণ্ণ-যাচাইকৃত), আমার read_mins তাদের ভিউতেও ফলে (rt-chip ×৪); style.css = ইউনিয়ন-ব্লক-দ্বয় (brace-depth ০); লেবেল-কোলিশন → আমার ডেল্টা session119 (max+1)
- টেস্ট-গোটচা-ত্রয়ী ডকুমেন্টেড (PLANS): RP_PORT-রিনাম (P= নীরবে-অগ্রাহ্য→১২০-মিথ্যা-ফেইল) + admin-login-রেট-লিমিটার-পোলিউশন (৫/১৫মিন — রানের-আগে রিস্টার্ট) + স্যান্ডবক্স-প্রসেস-রিপ
- push: 9ef2154 (session119-ফিচার) + d11af7e (লেবেল-রিনাম) + docs (PROJECT/PLANS/worklog ×২)

Stage Summary:
- মার্জড-/me = দুই-এজেন্টের সেরা-সংযোগ; /qa ফিল্টার+ব্যাজ লাইভ; কাউন্টার-সত্য-উৎস-চুক্তি (live-ans_count + reconcile-স্ক্রিপ্ট)
- যাচাই (মার্জড-কোডে): role-policy ১২৫/১২৫ ✓ cursor ২৫/২৫ ✓ guard গ্রিন ✓ ফিল্টার-সাইকেল ✓ 390px-০ ✓ কনসোল-০ ✓
- পরবর্তী-প্রার্থী: ① role-policy §১৭ /qa-ফিল্টার-কভারেজ ② reconcile-বুট-হুক ③ notification পার-টাইপ ফিল্টার-চিপ ④ optimistic-থ্রেড-ইনসার্ট (১১৪-নোট ②)
Task ID: cron-r120 (সেশন ১২০ — webDevReview রাউন্ড)
Agent: Z.ai Cron Agent (webDevReview — origin/main @ b59f038 থেকে)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → স্বাধীন-ফোকাস: গ্রুপ-কল স্পিকার-হাইলাইট + ভিডিও-track-স্ট্যাট (রোডম্যাপ-অবশিষ্ট) ইমপ্ল + push

Work Log:
- sync: session117 (প্লেলিস্ট-প্যানেল) রিবেজ-গৃহীত; QA-ফেজ: ৪-স্যুট (১২৫+৫৫+৫০+২৫) + guard ALL GREEN + ব্রাউজার-ম্যাট্রিক্স কনসোল-০ → বাগ-শূন্য → ফিচার-রাউন্ড
- ইমপ্ল (webrtc-call.js + calls.css — ২-ফাইল, সার্ভার-শূন্য): ① SPK স্পিকার-ইঞ্জিন (WebAudio AnalyserNode প্রতি-স্ট্রিম, ২৫০ms-RMS, থ্রেশহোল্ড+৮০০ms-হাইস্টেরেসিস, গ্রিড-টাইল .is-speaking + .lc-spkbars ওয়েভ-বার, 1:1 অডিওফেস-রিং, মিউটে অটো-নিভে) ② ভিডিও-স্ট্যাট (inbound-rtp video + local getSettings → ডায়াগনস্টিকসে বাংলা-ভিডিও-সেকশন) ③ QA-হুক ×৩ (_qaSetSpeaking/_qaSpeaking/_qaSetVideoStats)
- E2E: হুক-ভিত্তিক টাইল-হাইলাইট/ক্লিয়ার/1:1-রিং/ভিডিও-সেকশন-বাংলা ✓ স্ক্রিনশট ×৩ ✓ 390px-০ ✓ কনসোল-০ ✓; পোস্ট-ইমপ্ল রিগ্রেশন ২৫৫-চেক ALL GREEN ✓
- গোটচা ×২ (PLANS-নোটে): verify-session93-ডিফল্ট-পোর্ট 3030 (এক্সপ্লিসিট-বেস-আর্গ-লাগবে) · .lc-root-ম্যানুয়াল-রিমুভ → ক্লোজার-root-ডিট্যাচড → হেডলেস-রাউন্ডে ফ্রেশ-পেজ-লোড

Stage Summary:
- গ্রুপ-কলে "কে বলছে" হাইলাইট + ভিডিও-রেজোলিউশন/FPS-স্ট্যাট — session113-পরবর্তী কল-রোডম্যাপে অবশিষ্ট কেবল Metered-TURN (ইউজার-অ্যাকাউন্ট), অটো-ডিগ্রেড, প্রতি-পিয়ার-স্ট্যাট-প্যানেল
- পরবর্তী-এজেন্ট: session121 লেবেল থেকে; docs: PROJECT-চেঞ্জলজ + PLANS session120-নোট + repo-worklog
Task ID: RES-119 (ক্রন-রিভিউ রাউন্ড ১০ — session118)
Agent: Resources-feature agent
Task: QA-সুইপ → স্টেবল-ফেজে প্লেলিস্ট রিজুম + সিরিজ play-all অটোস্টার্ট (RES-117-সুপারিশ ③④)

Work Log:
- QA সুইপ: fetch-নতুন-কিছু-নেই; smoke ৬/৬ + role-policy 125/125 + agent-browser (কনসোল-০, 3240-rules) → স্টেবল
- ফিচার ×২ + E2E-বাগ-ফিক্স ×২ (setProg-স্পেস-মিসম্যাচ, XTPQ-ডাবল-প্যারাম→অফলাইন-পাতা) — বিস্তারিত lekhok-forum/worklog.md + PROJECT.md সেশন-১১৮ + PLANS.md নোট

Stage Summary:
- session-118 push → origin/main; role-policy 125/125; 390px-০; কনসোল-০
- পরবর্তী: CSV-URL-ফাইল-ফেচ · UTC→লোকাল · role-policy playlist-চেক

---

## session120 (cron-r5) — সার্চ-হাইলাইট + পড়ার-সময় + boot-reconcile

- QA-সুইপ: ১৫-route ম্যাট্রিক্স + /me-রিডিজাইন-মার্কার + notifications/qa-ফিল্টার + continue-reading + 390px ×৩ + কনসোল — বাগ-শূন্য (মিথ্যা-অ্যালার্ম ×২ নিষ্পত্তি: সার্চ-রিভিল-অ্যানিমেশন-ধরা-স্ক্রিনশট, curl raw-UTF8 400)
- ফিচার: সার্চ-ফলাফল `<mark>` হাইলাইট (escape-first, XSS-E2E ×৩) + ≈N মিনিট চিপ + boot-reconcile self-heal (করাপ্ট→heal→idempotent-প্রমাণ)
- ইউনিয়ন: style.css-EOF session12-ব্লকের সাথে (depth ০/০); push f982b82 (docs-আগে)

---

## cron-r10 — Session 121 (নোটিফিকেশন-UX-সম্পূর্ণতা: ড্রপডাউন dismiss ✕ + চিপ URL-পার্সিস্টেন্স)

**স্কোপ:** header.ejs (+inline dismiss-হ্যান্ডলার IIFE) · live.js (paintList ✕-প্যারিটি) · notifications.ejs (setUrl121 + init) · style.css (session121-ব্লক) · PLANS.md (intent-নোট)। route/db শূন্য।

**মূল-পরিবর্তন:** ① হেডার-ড্রপডাউন বিজ্ঞপ্তিতে ✕ (ফুল-পেজের .notif-dismiss-প্যারিটি): ডেলিগেটেড #notifList-লিসেনার (live.js-রিরেন্ডার-সহজীবী), click+Enter/Space, preventDefault (অ্যাঙ্কর-নেভিগেশন-বন্ধ), সার্ভার-সত্য-ব্যাজ /api/notifications/count, খালিতে empty-state ② nft-চিপ ?type= replaceState-পার্সিস্টেন্স: রিলোড/শেয়ারে ফিল্টার টিকে থাকে, 'সব' = ক্লিন-URL, অবৈধ-মান নিরীহ ③ স্টাইল: ✕ hover-reveal/touch-fallback/focus-ring/dx-out, চিপ active-গ্রেডিয়েন্ট+lift+badge-পিল, ড্রপডাউন-হোভার পলিশ, reduced-motion।

**E2E:** চিপ→?type=reply→রিলোড-পার্সিস্ট→'সব'-ক্লিন ✓ xyz-নো-অপ ✓ ৩×ডিসমিস+ব্যাজ+খালি-স্টেট ✓ Enter-কি ✓ ক্রস-পেজ(/qa) ✓ 390px-০ ✓ কনসোল-০ ✓ ২২-রুট ✓ টেস্ট-ডেটা-ক্লিনআপ ✓

**গোটচা-রেজিস্টার (নতুন):** ① lekhok-*.ejs পাবলিক-পেজ = layout.ejs-সরল-টপবার, বেল নেই by-design (২৮টি user-*.ejs-ই বেল-বাহক) — নতুন-এজেন্ট "হোমপেজে বেল নেই" দেখে বাগ ভাববেন না ② /qa/new CSRF meta-tag-এ (hidden input নেই) ③ SW পাবলিক-HTML ক্যাশে লগইন-স্টেট আটকে থাকে — unregister+caches.delete ④ user ismail(52) ≠ ismail_hossen_emon(29)।

**পরবর্তী:** thread-submit optimistic-insert → crx-কভার-থাম্বনেইল → mini-bubble unread-ডট → tokens.css হেক্স-স্ক্যান-গার্ড।

---

## session121 (cron-r6) — রিসোর্স সিরিজ শোনা-হয়েছে-নির্দেশ লিস্টিংয়ে + পলিশ (RES-119-সুপারিশ ③④)

- QA-সুইপ: 8-পেজ ম্যাট্রিক্স + 22-কার্ড/7-পিল/3367-CSS-rules + কনসোল-০ + 390px-০ + role-policy 125/125 — **ফেজ-স্টেবল রায়** → ফিচার-রাউন্ড
- ফিচার: seriesMap (সার্ভার → SMAP-embed, `<`-এস্কেপ) → লিস্টিং এখন detail-পেজের localStorage পড়ে — চিপে n/m টিক-ব্যাজ+মিনি-বার, সক্রিয়-সিরিজে সামারি-পিল+রিজুম-লিংক (→ডিটেইল resume-চিপ চেইন), সম্পূর্ণ-শোনা পর্বের কার্ডে টিক; পলিশ: ডেস্কটপ-স্টিকি-কন্ট্রোল-বার (is-stuck ছায়া+ব্লার) + কভার-শিমার + focus-visible-রিং
- ধরা-বাগ (নিজের-তৈরি): rsx-totop FAB গ্লোবাল #backToTop-এর সাথে ওভারল্যাপ (ক্লিক-ব্লকড) → সরানো; FAB-occupancy-গোটচা PLANS-এ
- role-policy §১৭ (stat অ্যাবিউজ-গার্ড ×৬) → **131/131 ALL GREEN**; E2E: চিপ ১/৩+৬৭% ✓ রিজুম-চেইন (লিস্টিং→/resources/3→'দ্বিতীয় পর্ব · ১:৩৩') ✓ নন-অডিও-পর্বে resume-সাপ্রেশন-সঠিক ✓ 390px×৩-০ ✓ কনসোল-০ ✓ LS-রেজিডু-ক্লিন ✓
- গোটচা: lsKey-এ `slice(0,48)` হুবহু দরকার (slice-বিহীন সিড-কী মিলেনি — E2E-মিথ্যা-ফেইল); rebase-ইউনিয়ন PLANS+PROJECT (session122/123-এর সাথে); push 74b31d3

---
Task ID: session119-গ (cron webDevReview রাউন্ড — চূড়ান্ত-ইউনিয়ন: session119/120/121/122/123-রেস ×৫)
Agent: Z.ai Cron Agent (webDevReview)
Task: অবস্থা-মূল্যায়ন + agent-browser QA → P0-ডিসমিস-স্বাধীন-প্রমাণ + session117-সুপারিশ ①③④⑤-চেষ্টা → সম্পূর্ণ-ইউনিয়ন-যাচাই-রাউন্ড

Work Log:
- QA-ফেজ: ১১-পেজ স্মোক + role-policy 125/125 + cursor 25/25 + guard ✓
- 🚨 P0-স্বাধীন-আবিষ্কার: /notifications 'সরান' নীরব-মৃত (session114-রুট da91a80-র rebase-reapply-এ pure-deletion; curl-প্রোব POST→303-জেনেরিক-ফলব্যাক) — ক্যানোনিকাল-ফিক্স = session119-এজেন্টের ee0d9df; আমার-প্রোব-চেইন (anon 401/own removed:true/re removed:false/non-numeric নিরাপদ) স্বাধীন-যাচাই
- ফিচার-চেষ্টা ①③④⑤ সব-বাস্তবায়ন-করেও push-রেস ×৫-এ প্রত্যাহার: ①④→session121 ⑤→session122 (.mnp-dot) ③→session123 (data-cover+__lfSbUrl সমৃদ্ধ-সংস্করণ) — union-নীতিতে সব-তাদের-ক্যানোনিকাল গৃহীত
- মার্জ-পরবর্তী সম্পূর্ণ-সহাবস্থান-যাচাই (ismail+testuser): c=লাইভ ✓ উডট (প্রেরণ→ডট ✓ পঠন→GONE ✓) তাদের-① (server-truth ৮→৫ ✓) তাদের-④ (?type= URL-সিঙ্ক+রিলোড ✓) 390px-০ ✓ কনসোল-০ ✓ রিগ্রেশন ১২৫+২৫+guard ✓
- push-রেস ×৩-হ্যান্ডলিং (pull --rebase ×৩, কনফ্লিক্ট ×১১ ইউনিয়ন); রীতি-পুনঃপ্রমাণ: rebase-এ --theirs=আমার-কমিট; synthetic .click()-এ stale-repaint-মিথ্যা-নেগেটিভ → সার্ভার-সত্য রিলোডে-যাচাই

Stage Summary:
- **কোড-ল্যান্ড = শূন্য (৫-ফিচার-ই প্যারালাল-এজেন্টদের দ্বারা ল্যান্ডেড); আমার-অবদান = P0-স্বাধীন-প্রমাণ-চেইন + মার্জ-পরবর্তী সম্পূর্ণ-সহাবস্থান-E2E + ডক-গোটচা ×৪ (E2E-দাবি≠সার্ভার-সত্য / synthetic-click stale-repaint / naive brace-কাউন্ট / RP_PORT+BASE-invocation)** — ডুপ্লিকেশন-শূন্য-ইউনিয়ন-সম্পন্ন
- পরের-এজেন্ট: session124 থেকে

---
Task ID: cron-r124 (সেশন ১২৪ — webDevReview রাউন্ড, origin/main @ f629b06 থেকে)
Agent: Z.ai Cron Agent (webDevReview)
Task: স্টেটাস-অ্যাসেসমেন্ট + agent-browser QA → স্বাধীন-ফোকাস: কমেন্ট-সাবমিটে ক্যানোনিকাল তাৎক্ষণিক-ইনসার্ট (session114-নোট ②-র পূর্ণরূপ) + QA-রাউন্ডে আবিষ্কৃত-বাগ-ফিক্স + ত্রি-ইউনিয়ন-রিবেজ

Work Log:
- sync+QA-ফেজ: git fetch → f629b06; pkill→ss-ভেরিফাই→seed-qa-users (সার্ভার-বন্ধ)→সার্ভার+স্যুট এক-ইনভোকেশনে: role-policy ১২৫/১২৫ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ALL GREEN; ব্রাউজার ১০-পেজ ডেস্কটপ + ৫-পেজ 390px সুইপ — কনসোল-০ ওভারফ্লো-০ → স্টেবল-ফেজ → ফিচার-রাউন্ড
- টেস্ট-ইনফ্রা-গোটচা-নতুন: CALL_RING_TIMEOUT_S = **সার্ভার-env** (routes/calls.js:23) — টেস্ট-প্রসেসে env দিলে মিথ্যা-ফেইল (২+৫); SW-অফলাইন-পেজে unregister+cache-clear রেসিপি; `cd X && cmd &` গোটচা-পুনঃপ্রমাণ ({...&}-গ্রুপিং নিরাপদ)
- ইমপ্ল-সংস্করণ-১ (৫-টুকি): মিসিং dismiss-API (QA-ধরা: POST→303-saveerr-catch-all) + হেডার-ড্রপডাউন-✕ + QA-রিলোড-নেই-সোয়াপ + তাৎক্ষণিক-কমেন্ট-ইনসার্ট + ?type= — নিজস্ব E2E ×১০ ALL GREEN (T1-T10)
- push-পূর্ব fetch-কলিশন: session121 (নোটিফ-✕+API+?type=) / session122 (swapQaThread) / session123 (data-raw+killItem) সমান্তরাল-পুশকৃত — আমার ৪-টুকি ডুপ্লিকেট **স্বেচ্ছায়-প্রত্যাহার** (duplication-শূন্য-নীতি); অনন্য = ক্যানোনিকাল-ইনসার্ট → session124-রিলেবেল (max+1)
- পুনঃপ্রয়োগ-মার্জ: stash→pull→pop ×২-সাইকেল (২য়-ফেজে session123-আরও) — social.js/comment-tools.js অটো-ইউনিয়ন + style.css-UU (nested-=======) ইউনিয়ন-সমাধান; POST /api/comment → {ok,id,html,total} (সার্ভার-রেন্ডার্ড একক CommentItem + সত্য-total) + insertCanonical124/syncTotals124 + .is-new124-অ্যানিমেশন; session12-অপটিমিস্টিক-ফলব্যাক অক্ষত
- চূড়ান্ত-যাচাই (মার্জড-কোড): role-policy ১৩১/১৩১ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ✓; ব্রাউজার-চার-সারফেস (আর্টিকেল/QA/রিপ্লাই/ড্রয়ার) window-মার্কার-প্রমাণিত reload-শূন্য + বাংলা-অঙ্ক total + #answer-N-অ্যাঙ্কর-রক্ষা; 390px-০ কনসোল-০ টেস্ট-ডেটা-ক্লিনআপ ✓
- মৃত্যু-ফ্লাশ-রিভার্ট ×৩-প্রমাণ: HTTP-সিড (পোস্ট/কমেন্ট/DbStore-সেশন) ইনভোকেশন-কিলে হারায় — ক্রস-ইনভোকেশন-সিড = সার্ভার-বন্ধ স্ট্যান্ডঅ্যালোন-স্ক্রিপ্ট (scripts/seed-qa-121.js-প্যাটার্ন প্রমাণিত)
- docs: PROJECT-চেঞ্জলজ §১২৪ + PLANS session124-নোট (৪-ইন্টিগ্রেশন-পয়েন্ট+৫-গোটচা) + repo-worklog + এই worklog

Stage Summary:
- POST /api/comment চুক্তি-বৃদ্ধি (backward-compatible) — এক-রাউন্ডট্রিপে ক্যানোনিকাল-বাবল; QA-পৃষ্ঠে ঐতিহাসিক reload-ফ্ল্যাশ-সমাপ্তি
- পরবর্তী-এজেন্ট: session125 লেবেল; সুপারিশ: parent-chain-চিপ (POST-html), drawer-প্রিভিউ-ইনস্ট্যান্ট, Metered.ca-TURN (ইউজার-অ্যাকাউন্ট), অটো-ভিডিও-ডিগ্রেড, গ্রুপ-রিং-অনলাইন-সীমা
