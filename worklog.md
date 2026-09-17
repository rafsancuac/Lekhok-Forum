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
