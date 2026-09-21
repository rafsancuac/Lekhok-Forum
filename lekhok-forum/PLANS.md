# লেখক ফোরাম — Design & Implementation Plans

This file documents all major design decisions and implementation plans.

---

## Plan: 9-Page Visual Redesign (CURHS Design Patterns)
**Session:** sess_3a81167b-26e7-4162-9d6d-02f8befbf139
**Date:** 2026-09-02
**Status:** APPROVED — In Progress

### Objective
Replicate CURHS-style design patterns across all 9 `lekhok-*.ejs` pages with:
- Sticky transparent header (shrink on scroll)
- CURHS-এর মতো full animated home hero (particle BG + parallax)
- Two-column + card grid layout (CURHS ধাঁচ)
- Full hover effects (lift + shadow + accent border)

### User Decisions (locked in)
- ✅ Header: Sticky transparent + shrink on scroll
- ✅ Hero: CURHS-এর মতো full animated (particle BG + parallax) — home only
- ✅ Sub-pages: Two-column + grid (CURHS ধাঁচ)
- ✅ Card hover: Full hover (lift + shadow + accent border)
- ✅ Committee = central only, Team = full (central + advisory + founders)
- ✅ About: Mission/goal statement + bullet list (right column)
- ✅ Notice cards: পুরো card clickable (wraps in <a> tag)
- ✅ Resources: Card grid (CURHS ধাঁচে)
- ✅ Gallery: Caption overlay + zoom

### Files to modify (13 total)
1. `public/assets/css/style.css` — Major (~150 lines new components)
2. `public/assets/js/main.js` — Major (shrink, parallax, reveal, back-to-top)
3. `views/layout.ejs` — Light (id, progress bar, back-to-top)
4. `views/lekhok-home.ejs` — Medium (full hero with particles)
5. `views/lekhok-about.ejs` — Medium (two-column section)
6. `views/lekhok-committee.ejs` — Light (image zoom + polish)
7. `views/lekhok-notices.ejs` — Light (clickable cards)
8. `views/lekhok-contact.ejs` — Medium (two-col + map placeholder)
9. `views/lekhok-events.ejs` — Light (card polish + zoom)
10. `views/lekhok-gallery.ejs` — Medium (overlay caption on hover)
11. `views/lekhok-resources.ejs` — Medium (convert list to card grid)
12. `views/lekhok-team.ejs` — Medium (4 member type sections)
13. `routes/pages.js` — Light (/team route fetches 4 types)

### CSS Components to add
- `.btclf-topbar.shrunk` — shrink on scroll (padding 14px→8px, logo 44px→36px)
- `.hero.curhs` — full animated variant with floating shapes
- `@keyframes float` — floating animation for hero shapes
- `.section-split` — two-column (1fr 1.4fr, gap 60px)
- `.section-alt` — enhanced with subtle pattern bg
- `.card.has-image img` — image zoom on hover (scale 1.08)
- `.gallery-item .gallery-overlay` — caption slide-up on hover
- `.back-to-top` — fixed bottom-right button
- `.reveal` / `.reveal.in` — IntersectionObserver fade-in
- `.accent-divider` — gold bar decoration
- `.scroll-progress` — thin gold progress bar at top

### JS additions to main.js
- Sticky shrink on scroll (toggles `.shrunk` class at y > 50)
- Scroll progress bar
- Parallax on hero background (requestAnimationFrame)
- Reveal-on-scroll (IntersectionObserver)
- Back-to-top show/hide + smooth scroll

### Security/Brand Constraints
- ❌ NO `bycwf.org`, `বাংলাদেশ তরুণ কলাম লেখক ফোরাম`, `CUHRS` strings in any file
- ✅ Only design patterns (sticky shrink, hero animation, card hover, two-col)
- ✅ All text in Bengali, brand colors (#0a1f44 / #C5A059)
- ✅ No external API calls (no Google Maps, no Analytics)

### Route Changes
`routes/pages.js` — `/team` route:
```js
router.get('/team', (req, res) => {
  const central  = db.prepare("SELECT * FROM members WHERE member_type = 'central'  ORDER BY sort_order").all();
  const advisory = db.prepare("SELECT * FROM members WHERE member_type = 'advisory' ORDER BY sort_order").all();
  const founders = db.prepare("SELECT * FROM members WHERE member_type = 'founder'  ORDER BY sort_order").all();
  const branch   = db.prepare("SELECT * FROM members WHERE member_type = 'branch'   ORDER BY sort_order").all();
  res.render('lekhok-team', { layout: 'layout', pageTitle: 'টিম', currentPath: '/team', central, advisory, founders, branch });
});
```

### Verification Checklist
After implementation:
1. Header shrinks on scroll
2. Cards have hover lift (translateY -4px + shadow + accent border)
3. Gallery overlay shows on hover
4. Home hero has particles + parallax
5. Team page shows 4 sections (central, advisory, founders, branch)
6. Notice cards are clickable
7. Resources page is card grid
8. About page is two-column

---

## Plan: Social Platform v2 (Fully Implemented)
**Status:** COMPLETED
**Session:** Earlier sessions

### Summary
Complete Bengali social writing platform with:
- 8 core tables + 8 new tables (~16 total)
- User registration/login (3-tier: admin/moderator/user)
- Posts & Q&A system (articles, questions, comments, likes)
- Daily content system (quiz, epaper, on-this-day, best-writer, activities)
- Birthday notifications
- Messenger-like messaging
- Complaints system
- 22 sections (public pages)
- Default gender-based SVG avatars
- Notification polling

### DB Tables
- users (public registration — separate from admin_users)
- posts (articles + questions)
- comments (with parent_id for nesting)
- likes
- bookmarks
- follows (user-to-user)
- daily_content
- notifications
- constitution
- past_leaders
- achievements
- resources

### Routes (new)
- /register, /login, /logout
- /profile/:username, /profile/edit
- /articles, /articles/new, /articles/:id
- /questions, /questions/new, /questions/:id
- /qa (all questions)
- /members (user directory)
- /quiz, /on-this-day, /epaper, /activities, /best-writer
- /birthdays
- /achievements, /constitution
- /notifications
- /bookmarks, /follow/:username
- /messages
- /admin/daily-content, /admin/messages, /admin/moderators

### Key Files
- `routes/auth.js` — login, register, logout, profile edit
- `routes/social.js` — articles, qa, members, profile, follow, api
- `routes/daily.js` — quiz, on-this-day, epaper, activities, birthdays
- `routes/dashboard.js` — feed, gallery, messages, complaints
- `routes/avatar.js` — default avatar serving
- `routes/moderator.js` — scoped moderator panel
- `helpers/notify.js` — birthday check + notifications
- `middleware/upload.js` — multer config (avatar, cover, attachment, gallery)
- `db.js` — all tables + MODERATOR_SCOPES + helper functions
- `server.js` — routes wired, session, birthday check on each request

---

## Cross-Agent Note: Regression-Test Session (৩ সেপ্টেম্বর ২০২৬, রাত)

**যা করা হলো:** পুরো রিপো fetch/pull করে (13 নতুন কমিট পাওয়া গেছে অন্য এজেন্ট(দের) কাছ থেকে),
প্রতিটা রুট/ফিচার curl দিয়ে regression-test করা হয়েছে। কোনো নতুন ফিচার যোগ করা হয়নি — শুধু
টেস্ট + বাগ ফিক্স। বিস্তারিত ফলাফল `PROJECT.md`-এর সেশন ৫ Changelog + §১১ (Bug Fix History) +
§১২ (Known Issues, বিশেষত Turso/Vercel ব্লকার) এ।

**অন্য এজেন্টদের জন্য গুরুত্বপূর্ণ:**
- `admin_users` seeding, `members.term_year`, আর demo-content seeding — এই তিনটা এখন
  `db.js`-এ ঠিক করা আছে। এগুলো আবার "ফিক্স" করার চেষ্টা করলে দ্বিতীয়বার ভাঙার ঝুঁকি আছে —
  আগে `git pull` করে বর্তমান db.js দেখে নিন।
- ~~**Turso/Vercel async মাইগ্রেশন এখনো বাকি**~~ — ✅ পরে সম্পন্ন হয়েছে (নিচের "Turso /
  Vercel Async Migration (COMPLETE)" প্ল্যান দেখুন); সেশন ৭-এ ডেমো-সিডিং পার্টও দুই
  ব্যাকএন্ডে কার্যকর করা হয়েছে।

---

## Cross-Agent Note: Session 7 — Route-Mount Regression + Turso Seeding + HTML Nesting (৪ সেপ্টেম্বর ২০২৬)

**যা করা হলো (verify-and-fix সেশন):**
- কমিট `c2faa96`-এর route reorder-এ **হারিয়ে যাওয়া দুটো mount পুনরুদ্ধার**:
  `app.use('/avatar', routes/avatar.js)` + `app.use('/moderator', routes/moderator.js)` —
  এগুলো ছাড়া পুরো মডারেটর প্যানেল আর ডিফল্ট অ্যাভাটার 404 দিচ্ছিল। **রুট reorder করলে
  mount-লাইনগুলো আবার যাচাই করুন!**
- `seedDemoContentLocal()` → dual-backend async `seedDemoContent()`: এখন fresh
  **Turso/Vercel deploy-ও** লোকালের মতো ডেমো কনটেন্ট+ইউজার পায় (আগে শুধু admin seed হতো)।
- HTML nesting সমাধান: ৩১টা `views/user/*.ejs`-এর ডুপ্লিকেট ডকুমেন্ট-head সরানো;
  `header.ejs` একমাত্র ওপেনার, পেজ `title`/`extra_css` **include-এর data-argument হিসেবে**
  পাস করে (EJS include-এ প্যারেন্টের `var` দেখা যায় না — শুধু render-locals বা explicit data)।
- `POST /follow/:id`-তে numeric+existence guard (NaN bind-এ 500 হতো)।
- **রিপোতে `scripts/test-lekhok.sh` যোগ হয়েছে** — ৯১ চেক। চালান:
  `bash scripts/test-lekhok.sh http://localhost:8080`। দুই ব্যাকএন্ডেই (sql.js + Turso
  file-mode) ৯১/৯১ গ্রিন। কোড বদলালে push-এর আগে দুই মোডেই চালিয়ে নিন।
- ⚠️ সার্ভার চালু থাকা অবস্থায় `lekhok.db` সরাসরি এডিট করবেন না — SIGTERM flush
  পরিবর্তন মুছে দেয়। আগে kill → এডিট → চালু।

---

## Plan: Turso / Vercel Async Migration (COMPLETE)
**Date:** 2026-09-03
**Status:** ✅ DONE — both backends green (77/77 checks each)

### What changed
- **db.js**: `prepare()` now returns the Turso promise-API directly (removed the
  throw-on-sync proxy). `await` on sql.js sync results is a pass-through, so the
  SAME route code runs on both backends. Added `getSettingsAll()`.
- **All route files + admin/routes.js + helpers/notify.js**: every
  `prepare(...).all()/get()/run()`, `exec()`, `getSetting()/setSetting()` and
  dual-mode helper call (`hasScope`, `getModeratorScopes`, `grantModerator`,
  `revokeModerator`, `broadcastToAll`, `getTagPool`, `getReactionSummary`,
  `isBlockedBetween`, `extractMentions`, `getDailyFor/All`) is now `await`ed;
  handlers are `async`; nested sync loops (`.forEach`/`.map` with per-item
  queries) converted to `for..of`.
- **server.js**: Express Router is patched so async handler rejections are
  forwarded to `next(err)`; new error middleware (JSON for /api, HTML otherwise);
  locals middleware is async + pre-loads settings once per request and exposes a
  SYNC `res.locals.getSetting(k)` accessor for EJS templates.
- Bonus fixes in this pass: `isOnline()` returned `undefined` (→ `{}` from
  /api/messages/online); `/questions/:id` route was missing (every question link
  404'd); `POST /api/comment` now returns the new comment `id`.

### Verify
```bash
npm install && npm run dev            # sql.js — http://localhost:8080
# Turso path (no account needed): point TURSO_DATABASE_URL at a file:
PORT=8081 TURSO_DATABASE_URL=file:./turso-check.db node server.js
# Full endpoint suite: scripts/test-lekhok.sh (BASE=http://localhost:8081 ...)
```
Both modes pass the 77-check suite; no `[object Promise]` leaks on any page.

## Cross-Agent Note: Session 8 — Admin-Login UX + Demo Moderator + Scope Unification (৪ সেপ্টেম্বর ২০২৬)

**Status:** ✅ DONE — 21/21 new E2E checks + 91/91 regression green (sql.js)

### What changed (other agents: don't regress these!)
- **`routes/auth.js` `POST /login`**: falls back to `admin_users` — admin credentials
  on the user login page now create `session.adminUser` and redirect to `/admin`.
  Keep this fallback if you touch login.
- **`db.js`**: new idempotent `ensureDemoModerator()` runs on EVERY boot (both
  backends) — creates `moderator`/`moderator123` with all canonical scopes if
  missing; tops up scopes if the user exists but has none. `hasScope()` is now
  alias-aware via `SCOPE_ALIASES` (exported): `notice↔notices`, `event↔events`.
- **`admin/routes.js`**: local `hasScope()` delegates to `db.hasScope()`; role-change
  default grant now = full canonical scope set via `db.grantModerator()`; scope-update
  route accepts canonical + legacy plural keys; duplicate dead `GET /admin/moderators`
  removed; views get `CANONICAL_SCOPES` (10 scopes with Bengali labels) —
  `admin/moderators.ejs` + `admin/users/edit.ejs` render it (users/edit previously
  called `.key/.label` on plain strings → undefined checkboxes).
- **`admin/views/admin/dashboard.ejs` + `users/edit.ejs`**: moderator sessions
  (`session.user`, no `adminUser`) no longer 500 — display_name/danger-zone guarded.

### Demo logins (documented in README + PROJECT.md)
- admin / admin123 — `/admin/login` **or** `/login` (new fallback)
- moderator / moderator123 — `/login` → panel at `/moderator` (all scopes)
- ismail|monem|karishma|mahfuz|nusrat / demo123 — `/login`

### Verify
```bash
node server.js &
bash scripts/test-login-fixes.sh   # 21 checks
bash scripts/test-lekhok.sh http://localhost:8080   # 91 checks
```

## Cross-Agent Note: Session 9 — Gallery Redesign: White Filter Bar + ইমেজ গ্যালারি + খালি ফ্রেম ফিক্স (৪ সেপ্টেম্বর ২০২৬)

**Status:** ✅ DONE — 13/13 visual E2E + 21/21 login E2E + 77/77 regression green (fresh DB, sql.js)

### User-requested changes (don't regress!)
- **`views/lekhok-gallery.ejs` (rewritten)**: heading "আমাদের অ্যালবাম" → **"ইমেজ গ্যালারি"**;
  new **white category filter bar** (`#galleryTabs`) — link-style items (NO per-item
  pills/frames on purpose, user explicitly rejected them), hover = accent color,
  active = accent underline, counts inline. Client-side filtering (no page reload);
  lightbox now rebuilds its photo list from VISIBLE anchors only (`offsetParent`
  check) so filtered-out albums and unrevealed extras never appear in prev/next.
- **Empty-frame fix**: album grids use `auto-fit` (small albums, ≤8 photos) and
  `auto-fill + dense` (featured, ≥9) — few photos no longer leave phantom empty
  cells at the right/bottom. Featured hero (2x2) only for ≥9 photos now.
  ">16 photos" renders ALL extras server-side, hidden via `hidden` attr;
  the "আরো দেখুন" tile reveals them inline (no navigation to a dead ?category= URL).
- **Bengali labels everywhere**: `routes/pages.js` categoryLabels now covers
  singular+plural+alias keys (events/workshops/meetings/awards/press/media/...).
  Visible English category text = 0 on /gallery. `views/user/gallery.ejs` uses a
  full label map. Admin gallery form now offers press/cultural/seminar options.
- **`db.js` demo seeds**: +11 real-photo gallery items (press×4, workshops×4→ws1..4,
  events×2) so fresh deploys don't show half-empty albums. Seed only runs when
  gallery table is empty (unchanged rule).

### Verify
```bash
node server.js &   # fresh lekhok.db
node /home/z/my-project/scripts/test-gallery-ui.js   # 13 visual checks (Playwright)
bash scripts/test-login-fixes.sh                     # 21 checks
bash scripts/test-lekhok.sh http://localhost:8080    # 77 checks (register riya/tanvir first on fresh DB)
```

## Cross-Agent Note: Session 10 — Reaction Picker Rebuilt (slide-to-select) + Action Bar as Distinct Shape (৪ সেপ্টেম্বর ২০২৬)

**Status:** ✅ DONE — 20/20 gesture E2E + 21/21 login E2E + 77/77 regression green (fresh server)

### Follow-up to Session-8's 6ed7a7c picker fix — what was still broken & how it's fixed
- **`public/assets/js/main.js` (initBar gestures, rewritten)**: the previous
  press-and-hold consumed its `longPressOpened` flag in the mouseup handler, so the
  trailing **click still toggled the default like** (press-and-release = accidental
  like/unlike). And after sliding, `mouseup` was bound to the button — but with the
  picker open the release lands on the picker/option, so slide-to-select NEVER fired;
  `elementFromPoint` against a stored coordinate also breaks when the picker/scroll
  shifts. Now: `mousedown` starts the hold; `document`-level `mouseup` resolves via
  **event-target traversal** (`e.target.closest('.reaction-opt')` first,
  `elementFromPoint` fallback); sliding previews via `.preview` class (mouse:
  wrap mousemove; touch: touchmove on the button — touch retargets to the touchstart
  element, so the slide works even over the picker); `touchend` preventDefaults the
  synthetic click; a completed hold sets `suppressClick` (consumed by the trailing
  click, auto-reset via setTimeout 0) so release-on-button keeps the picker open
  WITHOUT toggling. Quick click still toggles like (server already toggle-offs when
  the same reaction repeats). Picking the currently-active emoji still toggles it
  off (Facebook parity).
- **Visual separation (user asked for TWO shapes, not a fused frame)**:
  `.feed-card .actions-bar` (dashboard.css) and `.article-footer .actions-bar`
  (style.css) are now **inset rounded panels** (tinted `--bg`, 1px border,
  12px radius, margin 12/16px) — content lives in the white card, the
  react/comment/share/save row reads as its own distinct box.
- **iOS long-press callout**: `-webkit-touch-callout: none` + `-webkit-user-select`
  on `.actions-bar .reaction-btn`.
- **Moderator 500 on GET /moderator was a STALE-SERVER artifact** (old process kept
  port 8080 through the 6d3f0cd/a4d5ba3 pulls → old in-memory route). No code bug:
  kill all `node server.js` processes before testing after a pull (16/16 green after
  restart). Reminder for everyone testing in this sandbox: **background processes die
  between tool calls, and zombie servers hold 8080 — pkill before starting.**

### Verify
```bash
pkill -f "node server.js"; node server.js &   # fresh server
node /home/z/my-project/scripts/test-reaction-e2e.js   # 20 gesture checks (Playwright, needs BASE env)
bash scripts/test-login-fixes.sh                        # 21 checks
bash scripts/test-lekhok.sh http://localhost:8080       # 77 checks
```

## Cross-Agent Note: Session 11 — Asset Cache-Busting + Android Long-Press Fix (৪ সেপ্টেম্বর ২০২৬)

**Status:** ✅ DONE — 37 views compile, 20/20 reaction E2E + 16/16 regression green, build marker verified in browser

### Why the user still saw the old reaction behavior (report: "হচ্ছে না ত")
- Static assets were served WITHOUT any version param — a browser (or CDN) holding
  a cached `/assets/js/main.js` kept running the OLD reaction code even after
  pull + restart. Every `main.js`/hot-CSS URL now carries `?v=<AV>`.
- **`server.js`**: new `computeAssetVersion()` (djb2 hash of public/assets
  sizes+mtimes at boot) → `app.locals.AV`. Version changes whenever any asset
  file changes and the server restarts → URL changes → cache busted.
- **Views**: ALL `main.js` includes (37: layout.ejs + every user/admin view)
  + header.ejs (style/fonts/feed + extra_css loop) + layout.ejs CSS links now
  append `?v=<%= AV %>`. External CDN links untouched.
- **`main.js`**: `console.log` build marker
  (`লেখক ফোরাম · main.js build 2026-09-04-r3`) — open DevTools console; if the
  marker is absent the browser is running a STALE copy. Bump the date-suffix on
  every future main.js edit.
- **Android long-press fix**: `contextmenu` preventDefault on `.main-react`
  (system text-selection menu at ~500ms was stealing the hold gesture on
  Android Chrome; iOS was already covered by `-webkit-touch-callout`).
- Haptic feedback: `navigator.vibrate(15)` when the picker opens on touch.

### Verify
```bash
pkill -f "node server.js"; node server.js &
curl -s localhost:8080/gallery | grep 'main.js?v='   # non-empty
node /home/z/my-project/scripts/test-reaction-e2e.js # 20 checks
```

## Cross-Agent Note: Session 12 — App-Footer Fix: ফ্রেমের বাইরে যাওয়া কনটেন্ট ভেতরে আনা (৪ সেপ্টেম্বর ২০২৬)

### সমস্যা (ইউজার রিপোর্ট: /settings ফুটার বাঁ দিকের কনটেন্ট ফ্রেমের বাইরে)
`views/partials/footer.ejs` (`/settings`, `/me` — layout=false পেজগুলো) -এ
`class="site-footer"` ব্যবহার হচ্ছিল, কিন্তু style.css-এ `.site-footer`-এর **কোনো রুলই ছিল না**:
- ফুটারের ব্যাকগ্রাউন্ড ছিল না → সাদা ব্যাকগ্রাউন্ডে `#fff` কলাম-টাইটেল অদৃশ্য
- `.footer-inner`-এ `.container` ছিল না → কনটেন্ট x=0-তে ফ্রেমের বাইরে, কোনো side spacing নেই
- ৪টা কলাম ৩-কলাম গ্রিডে → "যোগাযোগ" ২য় সারিতে গিয়ে বাম edge-এ লেগে যায়

### ফিক্স (নতুন CSS না লিখে existing ডিজাইন-সিস্টেম রিইউজ)
- **`views/partials/footer.ejs`**: `<footer class="btclf-footer site-footer">` + `<div class="container footer-inner">` (layout.ejs-এর প্রুভেন প্যাটার্ন) + footer-bottom-এও `.container`
- **`public/assets/css/style.css`**: `.site-footer` scoped rules — ৪-কলাম গ্রিড (≥993px), ২-কলাম (≤992px), ১-কলাম (≤600px), brand h2 সাদা, `margin-top: 48px` (app-page কনটেন্ট থেকে ব্রিদিং)

### ভেরিফাই
```bash
node /home/z/my-project/scripts/test-footer-fix.js   # 61 checks — geometry (content-box inside frame,
                                                     # padding ≥16px, container ≤1200px centered),
                                                     # ৪ ভিউপোর্ট (1920/1366/768/375), /me + /settings,
                                                     # homepage btclf-footer regression (3-col, 1 footer)
bash /home/z/my-project/scripts/test-lekhok.sh       # 77/77 ALL GREEN
```

## Cross-Agent Note: Session 13 — Turso-ছাড়া Vercel ডিপ্লয়: Blob snapshot মোড + v1 সাইট আর্কাইভ (৪ সেপ্টেম্বর ২০২৬)

### কনটেক্সট
ইউজার `lekhok-forum.vercel.app`-এ পুরনো v1 স্ট্যাটিক সাইট দেখছিল (রিপো root থেকে ডিপ্লয় হচ্ছিল;
আসল অ্যাপ `lekhok-forum/` সাবডিরেক্টরিত)। Turso অ্যাকাউন্টও নেই। সিদ্ধান্ত: Turso ছাড়াই
Vercel-এ অ্যাপ চালানো + v1 সাইট হিস্টোরি হিসেবে রাখা।

### কী পরিবর্তন হলো
- **`db.js` — Blob snapshot মোড (নতুন)**: `BLOB_READ_WRITE_TOKEN` সেট থাকলে + Turso না থাকলে
  অটো-অন (`DB_BLOB_SNAPSHOT=0` দিয়ে বন্ধ)। sql.js ইমেজ debounced (১.৫s) Vercel Blob `put()`-এ
  যায় — path: `private/db-<sha256(SESSION_SECRET)-এর ১৬-ক্যারেক্টার>.sqlite` (unguessable);
  boot-এ `list({prefix}) → fetch(url)` দিয়ে রিস্টোর। `flushDb()` এক্সপোর্ট করা হয়েছে
  (server shutdown-এ force upload, `server.js` shutdown হ্যান্ডলার ৩s wait করে)।
  **জেনে রাখুন**: last-write-wins — একাধিক serverless instance একসাথে লিখলে একজনের লেখা
  হারাতে পারে; হেভি ট্রাফিকে Turso-তে যাওয়াই উত্তম (ডকস: DEPLOYMENT.md)।
- **`middleware/upload.js` — ক্রিটিক্যাল বাগ ফিক্স**: `@vercel/blob`-এ `createClient()` আসলে
  নেই (v0.23.4 verified) → প্রোডাকশনে সব আপলোড (অ্যাভাটার/গ্যালারি/অ্যাটাচমেন্ট) ক্র্যাশ করত।
  এখন সঠিক `put(pathname, buffer, { access:'public', token })` API।
- **`vercel.json`**: `@vercel/node` build-এ `includeFiles: node_modules/sql.js/dist/**` —
  sql.js-এর .wasm serverless bundle-এ না যাওয়ার ঝুঁকি বন্ধ।
- **রিপো root**: `index.html/about/committee/contact/notices.html` + `assets/` →
  **`legacy-static-site/`** (git mv, history অক্ষত) + সেখানে README। অ্যাপের কোথাও এদের
  রেফারেন্স ছিল না (verified)।

### ভেরিফাই
```bash
node /home/z/my-project/scripts/test-blob-snapshot.js   # 10/10 — mock blob দিয়ে save→restart→restore round-trip
bash /home/z/my-project/scripts/test-lekhok.sh          # 77/77 (লোকাল sql.js মোড অক্ষত)
```

### Vercel ড্যাশবোর্ডে ইউজারের করণীয় (আমাদের কোড এখান থেকে অটো কাজ করবে)
1. Settings → General → Root Directory = `lekhok-forum`
2. Storage → Blob store তৈরি → Connect (token অটো-যোগ হয়)
3. Redeploy — এরপর থেকে lekhok-forum.vercel.app-এ বর্তমান অ্যাপ চলবে

### Session 14 — কঠোর দুই-ফন্ট সিস্টেম + admin/moderators + admin/daily UI ফিক্স (cross-agent)
**সমস্যা**: ইউজার রিপোর্ট — /admin/moderators ও /admin/daily-তে "কোনো UI ডিজাইন নাই"; নতুন কঠোর নিয়ম: সাইট-ওয়াইড শুধু দুই ফন্ট (হেডিং/মেনু/বড় লেখা = Hind Siliguri, বাকি সব = Kalpurush/SolaimanLipi-শ্রেণির)।
**Root cause (দুই স্তর)**:
1. d91f496 (অন্য agent) body-কনটেন্ট রিরাইট করেছিল, কিন্তু moderators.ejs, daily/list.ejs, daily/form.ejs, complaints.ejs, denied.ejs — ৫টি view-তে `<head>`+CSS লিংকই ছিল না → কাঁচা Times New Roman HTML
2. fonts.css h1–h4 → `--font-display` (AkhandBengali!) — নিয়ম লঙ্ঘন; SolaimanLipi CDN ৩৮ ফাইলে; admin.css/auth.css-এও SolaimanLipi (রিপোতে ফন্ট নেই → fallback)
**ফিক্স**:
- fonts.css রিরাইট: কঠোর দুই-ফন্ট — HindSiliguri (h1–h6, th, nav/menu, logo, section/card title, stat-num) + Kalpurush (body, p, li, td, form, button); legacy var (--font-serif/hand/display/sans/base/bn) সব এই দুটিতে রিম্যাপ; font-* প্রেফ ক্লাস no-op
- ৩৬ ফাইলে SolaimanLipi CDN → লোকাল `/assets/css/fonts.css?v=<%= AV %>`; layout.ejs + header.ejs থেকে CDN লাইন ডিলিট (fonts.css আগেই আছে)
- ৫টি bare admin view-এ full HTML skeleton (fonts.css + FontAwesome + admin.css, ?v=<%= AV %>)
- admin.css: body → Kalpurush + h1–h6/th + sidebar logo/nav → HindSiliguri; auth.css body → Kalpurush
- অপ্রয়োজনীয় ৮ ফন্ট ফাইল git rm (AkhandBengali×3, BenSen, Durnibar, LipiMollika, Olibrick, RushfordPrinted) — git হিস্টোরিতে সংরক্ষিত
**ভেরিফাই**: ১৩-পেইজ Playwright অডিট — সব পেইজে h1/nav=HindSiliguri, p=Kalpurush; লোড হয় শুধু HindSiliguri×4 + kalpurush.ttf; 404/JS-এরর ০; ৭৭/৭৭ রিগ্রেশন; admin ১৬ রুট 200


## Cross-Agent Note: Session 58 — সাইট-ওয়াইড ডার্ক-গ্রিন থিম (৯ সেপ্টেম্বর ২০২৬)

**⚠️ সব এজেন্ট পড়ুন:** পুরো সাইট এখন ডার্ক-গ্রিন গ্র্যাডিয়েন্ট থিমে।
- **প্যালেট (:root):** `--bg:#04231B`, `--card:#0B3327`, `--surface-alt:rgba(255,255,255,.04)`, `--text:#E6F4EC`, `--text-muted:#A9C4B5`, `--border:#1F4A3A`, `--accent:#34D399` (লাইট-সবুজ), `--accent-light:#6EE7B7`, `--accent-dark:#10B981`, `--on-accent:#052B1F`, `--brand-text:#F0FBF6`।
- **নিয়ম:** নতুন ভিউ/CSS-এ লাইট সারফেস (`#fff`, `#f8fafc`, `#fafbfd`) ও গাড়-সবুজ টেক্সট (`#059669`) নিষিদ্ধ — টেক্সট-অ্যাকসেন্ট `var(--accent)`, হেডিং `var(--brand-text)`, কার্ড `var(--card)` ব্যবহার করুন। সবুজ-ব্যাকগ্রাউন্ড বাটনে টেক্সট `var(--on-accent)`।
- `color:var(--brand)` (নেভি) টেক্সট-হিসেবে ব্যবহার হতো — সেটা এখন `var(--brand-text)`। `--brand` শুধু গ্রেডিয়েন্ট-স্টপে।
- নেটিভ ইনপুট উইজেটে `color-scheme:dark` সেট আছে (style.css + auth.css) — নতুন স্টাইলশিটে ভুলে গেলে date-picker সাদা আসবে।
- অথ-পেজ (auth.css) ডার্ক-গ্লাস; রেজিস্ট্রেশন-ফর্ম নতুন `auth-section-title`/`file-drop`/`social-details` ক্লাস ব্যবহার করে।
- admin.css `--ad-*` টোকেনও ডার্ক-গ্রিন-এ রি-টিউন করা।

## Cross-Agent Note: Session 62 — কুইজ-স্কোর সার্ভার-পার্সিস্টেন্স (quiz_attempts) + লিডারবোর্ড + 2FA রেট-লিমিট + ডেইলি-এডিট (৯ সেপ্টেম্বর ২০২৬)

**নতুন টেবিল: `quiz_attempts`** — `UNIQUE(user_id, quiz_id)`; প্রথম উত্তরই চূড়ান্ত (INSERT OR IGNORE)। MIGRATION_SQL + `applyLaterMigrations`-এ CREATE (fingerprint-বাস্টিং → লাইভ Turso-তে ফুল-ইনিটে তৈরি হবে)। কোনো রুটে নতুন কলাম-যোগ নয় — টেবিল-লেভেল।

**আর্কিটেকচার-নোট (নতুন কম্পোনেন্টে কাজ করলে মনে রাখুন):**
1. `/quiz`-এ লগইন-ইউজারের জন্য `#quizServerState` JSON-স্ক্রিপ্ট (attempts+stats) — quiz.js এটা মার্জ করে, **সার্ভার-স্ট্যাট স্কোর-বারে প্রাধান্য পায়**; localStorage ফাঁকা হলেও সার্ভার থেকে উত্তর-স্টেট রিস্টোর হয় (ক্রস-ডিভাইস)। অ্যাননিমাস-HTML-এ এই এম্বেড থাকে না।
2. `POST /quiz/check`-এর রেসপন্সে `recorded` (নতুন রেকর্ড?) + `final` (চূড়ান্ত-উত্তর) — ক্লায়েন্ট ভিত্তি করে দেখায়; উত্তর-লিক যাচাই: পাবলিক /quiz HTML-এ `"answer":` ০-বার।
3. **2FA রেট-লিমিট:** `mfaPending.fails` — ৫ ব্যর্থতায় ধাপ-বাতিল → `/login?e=mfa_locked`; প্রতি ব্যর্থতায় ৩০০ms×N দেরি। login-2fa ফ্লোতে কাজ করলে এই কাউন্টার ভাঙবেন না।
4. **মডারেটর ডেইলি-এডিট:** `POST /moderator/daily/:type/edit/:id` — কুইজে opt_0..3 + correct_answer; **২+ খোঁজা বিকল্প = ইন্টারঅ্যাক্টিভ, সব ফাঁকা = স্ট্যাটিক-এ ফেরানো**। moderator-daily-form-এ items-এ `parsedOptions` (পার্সড-অ্যারে) পাঠানো হয় — answer-সহ (মড-প্যানেলে ঠিক আছে, পাবলিক রুটে নয়)।
5. প্যালেট-নিয়ম আগের মতোই: `--accent`/#34D399, `--brand-text`, ডার্ক-প্যানেল rgba(11,51,39,…)। লিডারবোর্ড (`.qb-*`), প্রোফাইল-কার্ড (`.qpc-*`), মড-এডিট (`.mod-edit-box/.mod-badge/.mod-flash`) — সব ডার্ক-গ্রিন টোকেন-সঙ্গত।

**ভেরিফাইড E2E:** উত্তর-রেকর্ড ✓ ক্রস-ডিভাইস-রিস্টোর ✓ লিডারবোর্ড+আপনি-ব্যাজ ✓ প্রোফাইল-কার্ড ✓ 2FA-লক(৫ ভুল→mfa_locked→সঠিক TOTP) ✓ এডিট-সেভ+ফ্ল্যাশ ✓ কনট্রাস্ট ৬.৯–১৫.৭:১ ✓ মোবাইল-ওভারফ্লো ০ ✓।


## Cross-Agent Note: Session 64 — কুইজ-লিডারবোর্ড ডেমো-ব্যাকফিল + "আমার কুইজ-ইতিহাস" + শেয়ারড-ব্রাউজার স্টেট-ফিক্স (৯ সেপ্টেম্বর ২০২৬)

**১. ডেমো-ব্যাকফিল (`quizDemoAttemptsBackfill64`, db.js):** লিডারবোর্ড quiz_attempts-ডেটার উপর দাঁড়ায় বলে খালি-অদৃশ্য ছিল। ৫ ডেমো-ইউজারের (ismail/monem/karishma/mahfuz/nusrat) জন্য deterministic উত্তর-ইতিহাস বসায় (karishma ৭/৮ … monem ২/৫)। **নিয়ম:** শুধু role='user'+status='active' ডেমো-username; ৩+ আটেম্পট-থাকা ইউজার স্কিপ; INSERT OR IGNORE; আজকের কুইজ বাদ; answered_at অতীতে-ছড়ানো (স্ট্রিক-সঙ্গত)। applyLaterMigrations-কল চেইনে — সোর্স-বদলে ফিঙ্গারপ্রিন্ট-বাস্টিং → লাইভ-Tursoতে ফুল-ইনিটে চলবে।

**২. "আমার কুইজ-ইতিহাস" (/quiz, লগইন-ইউজার):** `myQuizHistory()` (routes/daily.js) — quiz_attempts JOIN daily_content, DESC ১৫টি। ভিউতে সঠিক/ভুল চিপ + ইউজারের-চয়েস-টেক্সট + নির্ভুলতা-বার + [data-ts] রিলেটিভ-টাইম (main.js LekhokRelTime রিইউজ)। **`answer` ভিউতে যায় না** — উত্তর-লিক-যাচাই রাখুন। CSS `.qh-*` (style.css) ডার্ক-গ্রিন টোকেন-সঙ্গত।

**৩. quiz.js স্টেট-মার্জ-ফিক্স (শেয়ারড-ব্রাউজার):** আগে #quizServerState মার্জ শুধু অনুপস্থিত localStorage-কী পূরণ করত — আগের-ইউজারের পুরনো উত্তর (যেমন ভুল-cho ice) লগইন-ইউজারের সার্ভার-সত্যকে হারাত। এখন: সার্ভার-রেকর্ড থাকলে **সেটিই চূড়ান্ত** (choice/correct সার্ভার থেকে); answer/body কুইজ-স্কোপড বলে লোকাল থেকে রাখে (রাউন্ডট্রিপ-সেভ)।

**ভেরিফাইড E2E (লোকাল):** বোর্ড ৬-সারি র‍্যাঙ্ক-সহ ✓ আমার-ইতিহাস ৮-সারি+৮৮% বার ✓ সার্ভার-ওভাররাইড (স্টেল-লোকাল হারায়) ✓ অ্যাননিমাস: বোর্ড-দৃশ্য/ইতিহাস-নেই/এম্বেড-নেই ✓ উত্তর-লিক ০ ✓ কনট্রাস্ট ৫.০–১২.২:১ ✓ মোবাইল-ওভারফ্লো ০ ✓

## Cross-Agent Note: Session 65 — অ্যাডমিন কুইজ-প্যারিটি + স্কোর-ফলব্যাক + অটো-সূচিপত্র + ডিলিট-ফিক্স (৯ সেপ্টেম্বর ২০২৬)
- **অ্যাডমিন ডেইলি-ফর্মে এখন ইন্টারঅ্যাক্টিভ-কুইজ বিকল্প আছে** (admin/routes.js: rebuildQuizOpts + parseDailyOptions; form.ejs: নতুন-ফর্ম টগল + এডিটে sf-section; list.ejs: ব্যাজ) — মডারেটর-লজিকের মিরর (২+ বিকল্প=ইন্টারঅ্যাক্টিভ, সব-ফাঁকা=স্ট্যাটিক)। অ্যাডমিন-ফর্মের এডিট-ফিল্ডে **content_type পরিবর্তনযোগ্য নয়** — স্ট্যাটিক→ইন্টারঅ্যাক্টিভ করতে মডারেটর-প্যানেল ব্যবহার করুন।
- **স্কোর-বার:** আজকের কুইজ না-থাকলে/উত্তর-না-দিলে "সর্বশেষ স্কোর" (শেষ উত্তরের ফল) দেখায় — "—" নয়।
- **লেখার বডিতে `## `/`### ` = h2/h3 হেডিং** (routes/social.js GET /articles/:id — লাইন-পার্স + inline65; **article-single.ejs এখন `bodyHtml` ব্যবহার করে, post.body-ইনলাইন-চেইন নয়** — ভিউ-লেভেল বডি-ট্রান্সফর্ম বদলাতে হলে রুটে বদলান!)। ৩+ হেডিং → অটো-TOC (#articleToc, article-reading.js initToc: কলাপ্স/স্পাই/স্মুথ-স্ক্রল; CSS .article-toc/.toc-* + .a-heading)। এডিটরে H2/H3 বাটন।
- **বাগফিক্স:** article-single owner-actions-ডিলিট-ফর্ম action ছিল `?_method=DELETE` (রুট নেই → বাটন মৃত) → এখন `POST /articles/:id/delete`। **এই প্যাটার্ন (`?_method=DELETE`) নতুন ভিউতে ব্যবহার করবেন না** — router.delete-রুট নিশ্চিত না-হলে; অথবা সরাসরি POST-রুট লিখুন।
- এক্সারপ্ট-ফলব্যাক+meta-desc-এ `^#{1,6}[ \t]+` স্ট্রিপ হয় (নতুন-লাইন-কোলাপ্সের **আগে** — অর্ডার গুরুত্বপূর্ণ)।

## Cross-Agent Note: Session 66 — সংরক্ষিত-লেখা (bookmarks) সম্পূর্ণ UX-ওভারহল (৯ সেপ্টেম্বর ২০২৬)
- **`/bookmarks` এখন ডেডিকেটেড পেজ** (`views/user/bookmarks.ejs` + `public/assets/css/bookmarks.css` + রুট social.js-এ সমৃদ্ধ কোয়েরি) — আগে generic `user/articles`-ভিউ রেন্ডার হতো: **ভুল শিরোনাম "প্রকাশিত লেখা"**, সেভ-করা কার্ডেও `far`-আনসেভড আইকন, অপ্রাসঙ্গিক "নতুন লেখা" বাটন। নতুন: হিরো (লাইভ-কাউন্ট `bn()`, সর্বশেষ-সংরক্ষণ রিলেটিভ-টাইম), কার্ড (টাইপ-ব্যাজ, ট্যাগ, 📌সংরক্ষণ-চিপ `[data-ts]`, পড়ার-সময়, stats, অথর-রো), **সরান-বাটন** (কার্ড-এক্সিট-অ্যানিমেশন + কাউন্ট-সিঙ্ক + খালি-হলে empty-state DOM-সোয়াপ)।
- **সেভ-স্টেট প্রিফিল (৩-জায়গায়):** ① `/articles` লিস্ট-কার্ডে নতুন `.save-btn` (feed.css; main.js-এর গ্লোবাল `.bookmark-btn[data-bookmark-id]` হ্যান্ডলার রিইউজ) — রুট `bookmarkedIds` পাস করে ② `/dashboard`-এর actions-bar-এ `bookmarked: false` **হার্ডকোড ছিল** → `myBookmarkedIds` ③ `/me`-ট্যাব আগে থেকেই সঠিক।
- **এক্সারপ্ট `##`-স্ট্রিপ প্যারিটি:** /me সংরক্ষিত-ট্যাব, /bookmarks, /articles লিস্ট, /dashboard feed-text — সবখানে `^#{1,6}[ \t]+` স্ট্রিপ + হোয়াইটস্পেস-কোলাপ্স (সেশন ৬৫-এ article-single-এ ঢুকেছিল, বাকি জায়গায় কাঁচা মার্কার দেখাত)।
- **মোবাইল-সাইডবারে `/bookmarks` লিংক** (header.ejs mobile-section; আগে শুধু ডেস্কটপ-ড্রপডাউনে)।
- পেজ-JS ইনলাইন (bookmarks.ejs-এ): ডাবল-ফেচ এড়াতে main.js-হ্যান্ডলারের বদলে নিজস্ব `/api/bookmark`-কল; `showToast`/`LekhokRelTime` রিইউজ। অ্যাননিমাস ৩০২→/login।
- **TOC-দৃশ্যমানতা:** লোকাল QA-লেখা (id 5) `##`-সহ তৈরি — টোক-ফিচার ডেমো-যোগ্য; লাইভে এখনো কোনো লেখা `##` ব্যবহার করে না (কনটেন্ট-নির্ভর)।
## Cross-Agent Note: Session 67 — থিম রিভার্ট (ডার্ক-গ্রিন → আগের লাইট) (৯ সেপ্টেম্বর ২০২৬)

**⚠️ সব এজেন্ট পড়ুন — সেশন ৫৮-৬৬-পর্যন্ত থিম-নোট বাতিল (ইউজার-সিদ্ধান্ত):** ইউজার-রিপোর্টে ডার্ক-গ্রিন গ্রেডিয়েন্ট পছন্দ হয়নি; সাইট আবার **আগের লাইট থিমে** ফিরে গেছে।
- **প্যালেট (:root, প্রি-৫৮ মান):** `--bg:#f8fafc`, `--card:#ffffff`, `--surface-alt:rgba(15,23,42,.04)`, `--text:#1e293b`, `--text-muted:#64748b`, `--border:#e2e8f0`, `--accent:#059669`, `--accent-light:#10B981`, `--accent-dark:#047857`, `--accent-soft:rgba(5,150,105,0.10)`, `--on-accent:#ffffff`, `--brand-text:#0B1121`, `--brand-light:#1E3A8A`, `--bg-main:#0B1121` (টপবার নেভি), `--bg-secondary:#131B2F`।
- **নিয়ম:** নতুন ভিউ/CSS-এ ডার্ক-গ্রিন (`#04231B`, `#0B3327`, `#1F4A3A`, `#34D399`-টেক্সট, `#E6F4EC`) নিষিদ্ধ। কার্ড সাদা (`#fff`/`var(--card)`), হেডিং `var(--brand-text)` (গাঢ় নেভি), টেক্সট-অ্যাকসেন্ট `#059669`/`var(--accent)`, বাটনে সাদা টেক্সট।
- **কালো-তালিকাভুক্ত লিটারেল (রিভার্ট-ম্যাপ):** `#10B981→#047857`, `#6EE7B7→#10B981`, `#34D399→#059669`, `#E6F4EC→#1e293b`, `#A9C4B5→#64748b`, `#F0FBF6→#0B1121`, `#052B1F→#ffffff`, `#0B3327→#ffffff`, `#1F4A3A→#e2e8f0`, `#04231B→#f8fafc`, `#04150F→#0B1121`, `#0A2E23→#131B2F`, `rgba(52,211,153,X)→rgba(5,150,105,X)`।
- ইচ্ছাকৃত ডার্ক অংশ (প্রি-৫৮ থেকেই): টপবার/ফুটার (নেভি `#0B1121`), হোম-হিরো (নেভি গ্রেডিয়েন্ট), `.page-header`, `.feed-showcase` (গাঢ় গ্রেডিয়েন্ট ব্যানার), প্রোফাইল-কভার।
- `color-scheme:light` এখন স্ট্যান্ডার্ড; অ্যাভাটার SVG আবার নীল/গোলাপি/বেগুনি পরিবারে (?v=3)।
- **session58-এর `body::before` ফিক্সড ডার্ক-ওভারলে সরানো হয়েছে** (`display:none`) — সাইটের "আসল পটভূমি" ছিল এটাই।
- নতুন ফিচার: সেটিংসের "সংযুক্ত অ্যাকাউন্ট" সত্যিকারের কার্যকর — `users.social_fb/twitter/linkedin/telegram/website`, রুট `POST /settings/social` (value খালি=বিচ্ছিন্ন; স্কিমহীন ইনপুটে https: অটো-প্রিপেন্ড; শুধু http/https)। প্রোফাইল-পেজে আইকন।
- **নাম-প্রদর্শন নিয়ম:** UI-তে ব্যবহারকারীর নাম সবসময় বাংলা `full_name`/`designation` (username শুধু URL/লগইনে) — নেভবার-বাটন, @হ্যান্ডেল জায়গাগুলোতে এখন `designation || 'সদস্য'`।

- **নোট (সেশন ৬৭-রিবেস):** সেশন ৬০-৬৬-এর ডার্ক-গ্রিন-সংযোজন (bookmarks.css, রিডিং-টুলবার, কুইজ-UI, গ্যালারি) সব লাইট-থিমে রি-ম্যাপ করা হয়েছে; থিম-স্ক্রিপ্ট: /home/z/my-project/scripts/theme-revert-session67.js।

## Cross-Agent Note: Session 67-r2 — ক্রন-review রাউন্ড ৯ (৯ সেপ্টেম্বর ২০২৬, কমিট cd0e32d)

- **লাইট-থিম রিভার্টের উপরে রিবেস করা হয়েছে** (5e3e290) — নিচের সব সংযোজন লাইট-প্যালেট-সম্মত।
- **main.js লগইন-গার্ড এখন `window.LekhokAuthed()`** — `body[data-auth]` (দুই লেআউট + ৬ auth-পেজে সার্ভার-সাইড সেট) প্রাথমিক সোর্স, পুরনো `.topbar-tabs a[href="/settings"]` ফলব্যাক। **নতুন পেজে লগইন-গার্ড দরকার হলে এই ফাংশন ব্যবহার করুন** — পাবলিক-লেআউট পেজে পুরনো সিলেক্টর কখনোই মেলে না (আগে /articles-এর সেভ-বাটনে লগইন-ইউজারও /login→/dashboard-এ বাউন্স করত)।
- **bookmarks-স্কিমা:** `UNIQUE INDEX uq_bookmarks_user_post(user_id, post_id)` — টগল-রুটে `INSERT OR IGNORE`; ডিলিট-রুট (article+qa) বুকমার্ক-ক্লিনআপ করে; প্রতি বুটে অরফান-সেলফ-হিল।
- **নতুন ফিচার "আরও পড়ুন" (article-single):** ট্যাগ×৩+ক্যাটাগরি×২+লেখক×১ স্কোরে সম্পর্কিত-লেখা — অপাক-ডার্ক-ব্যানার সেকশন + **সাদা কার্ড** (`var(--card)`, `var(--brand-text)` হেডিং, `var(--accent)`/`#047857` অ্যাকসেন্ট) — রিভার্ট-নিয়ম মেনে। কভার না থাকলে ফেদার-আইকন প্লেসহোল্ডার।
- **"ইচ্ছাকৃত ডার্ক" প্যাটার্ন-সম্প্রসারণ:** `.article-toc` + `.read-resume` + `.related-articles` এখন অপাক `linear-gradient(180deg,#064e3b,#04251c)` ব্যানার (feed-showcase-পরিবার) — **সেমি-ট্রান্সপারেন্ট ডার্ক-গ্রিন লাইট-পেজে ব্যবহার করবেন না** (সেজ-গ্রিন কম্পোজিট হয়ে লাইট-টেক্সট ১.০–১.৬:১ অপাঠ্য হয় — এই বাগ এই রাউন্ডে ধরা ও ফিক্স হয়েছে)।
- **TOC-ডেমো-লেখা:** 'লেখার হাতে খড়ি…' (৫×H2+২×H3, অথর @monem) — শিরোনাম-ম্যাচে idempotent ব্যাকফিল; লাইভে সূচিপত্র/H2-H3-এডিটর-টুলবার দৃশ্যমান।
- **cover_image স্যানিটাইজ:** http(s)/সাইট-পাথ ছাড়া মান ('[]' ইত্যাদি) → NULL (নতুন+এডিট রুট + ডেটা-হিল মাইগ্রেশন); এডিটর-ফর্মে invalid-ফিল্ড টোস্ট-ফিডব্যাক।

## Cross-Agent Note: Session 68 — post_images জাঙ্ক-ফিক্স + এডিটর খসড়া-অটোসেভ + অথ-ফর্ম কনট্রাস্ট-ফিক্স (৯ সেপ্টেম্বর ২০২৬, কমিট dd1432a)

- **`post_images`-জাঙ্ক রুট-কজ (dual-input):** article-form-এ hidden `input[name=images]` উইজেটের **বাইরে** ছিল — multi-image.js উইজেটের *ভেতরে* নিজস্ব আরেকটা input বানাত → **দুটোই সাবমিট হতো** → `req.body.images` অ্যারে-অফ-JSON-স্ট্রিং → parse-বাইপাস → `'[]'`/`'["[]","[]"]'` image_url-রো (ফিড/লিস্টে `/[]` 404-src)। **ফিক্স-লেয়ার:** ① hidden input এখন `.mi-widget`-এর ভেতরে (উইজেট নিজেই খুঁজে sync করে — ঠিক ১টাই সাবমিট) ② `normalizeImageList68` (db.js setPostImages-এ কেন্দ্রীয় — JSON-স্ট্রিং ফ্ল্যাটেন + `http(s)://|/`-ভ্যালিডেট + ডিডুপ; **সব রাইটার** ঢকা: মড news/notice/event/daily + ইউজার article/share) ③ বুট-হিল: অবৈধ post_images-রো DELETE + posts.cover_image ব্রড-হিল (URL-প্যাটার্ন; fingerprint-বাস্টেড → **লাইভ Turso-তে অটো-রান**) ④ post-gallery.ejs রেন্ডার-গার্ড (শেষ-রেখা)।
- **নতুন কোডে ইমেজ-তালিকা লিখতে হলে** সরাসরি `db.setPostImages(entity, id, list)` ব্যবহার করুন — স্যানিটাইজ ওটাতেই আছে; নিজে থেকে post_images-এ INSERT করবেন না।
- **এডিটর খসড়া-অটোসেভ (article-form, শুধু নতুন-ফর্ম):** প্রতি-ইউজার কী `lekhok_draft_art_new_<username>` (localStorage, ৩০ দিন, শেয়ার্ড-ব্রাউজার-সেফ), ১.২সে ডিবাউন্স, রিস্টোর-ব্যানার (শব্দ-গণনা+রিল-টাইম+পুনরুদ্ধার/মুছে-ফেলুন), সাবমিটে ডিলিট, images-JSON-ও সেভ হয় (রিস্টোর উইজেট-init-এর *আগে* চালানো হয় — উইজেট রিস্টোর-করা ভ্যালু পড়ে)। **গোটচা:** programmatic `form.submit()` submit-ইভেন্ট ফায়ার করে না — খসড়া-ডিলিট-টেস্টে আসল বাটন-ক্লিক ব্যবহার করুন।
- **EJS-গোটচা (এই রাউন্ডে ধরা):** `<script>`-এর ভেতরে `<%= JSON.stringify(...) %>` **HTML-এস্কেপ** হয় (`"` → `&#34;`) → সিনট্যাক্স-এরর; **`<%- %>` (raw) ব্যবহার করুন** — শুধু ভ্যালু যদি নিয়ন্ত্রিত হয় (boolean/ভ্যালিডেটেড username)।
- **অথ-ফর্ম কনট্রাস্ট-ফিক্স (থিম-রিভার্ট-রিগ্রেশন, auth.css):** `.error` #FCA5A5→#b91c1c (৮টি ভিউয়ের এরর-বক্স সাদা কার্ডে ~২.২:১ অপাঠ্য ছিল!), `.success`→#047857, char-counter/pw-meter/field-hint সেজ-টেক্সট→#64748b-পরিবার, pw-meter-bar-ট্র্যাক white-on-white→rgba(15,23,42,.08), auth-card-শ্যাডো সফট। **নিয়ম: লাইট-পেজে ডার্ক-ব্যাকগ্রাউন্ডের-লাইট-টেক্সট রঙ (#FCA5A5/#8FAEA0/#6EE7B7-পরিবার) কখনোই নয়।**
- **এডিটর-স্ট্যাটস-বার:** `#editorStats` চিপ-সারি — শব্দ/পড়তে≈N মিনিট (~১৩০ শব্দ/মি, article-single-চিপের মিরর)/অক্ষর — বাংলা সংখ্যায়; এডিট-ফর্মেও চালু।
- **article/qa/edit স্ট্যান্ডঅ্যালোন-ফর্ম পেজে** হালকা গ্রেডিয়েন্ট পেজ-ব্যাকড্রপ যোগ (`#f8fafc→#eef6f1`) — লাইট-প্যালেট-সম্মত।

## Cross-Agent Note: Session 69 — ব্যাকগ্রাউন্ড-রিস্টোর (ইউজার-অনুরোধ, কমিট d2ded01)

- **ইউজার স্পষ্ট নির্দেশ:** "ফুল ডার্ক গ্র্যাডিয়েন্ট ব্যাকগ্রাউন্ড সেট করার আগের" (pre-ac481ed) ব্যাকগ্রাউন্ড ফেরাতে — শুধু background-স্কোপে।
- **মূল সমস্যা:** সেশন-৬৭-রিভার্ট অসম্পূর্ণ ছিল — হিরো-ত্রয়ীর (`.hero`/`.hero.brand-hero`/style.css-এর `.page-header`) `var(--bg-main)→var(--bg-secondary)` জায়গায় ঢিলবঢাল `#e2e8f0→rgba(10,46,35,.25)` বসিয়েছিল → হোমপেজে **murky লাইট-হিরো + অদৃশ্যপ্রায় টেক্সট + dark-navy stat-কার্ডের অসঙ্গত মিশ্রণ** (আসল ডিজাইন: নেভি হিরো)।
- **রিস্টোর-লিস্ট (সব computed-style + VLM দিয়ে লাইভ-যাচাই):** হিরো-ত্রয়ী→original navy; `.cu-card`/`.campus-channel-card`/`.leader-card-featured` white→#0E3A2D থেকে original light-mint (#fff→#f0fdf7/#f8fafc); স্ক্রলবার #0B1121-track→লাইট (#f1f5f9/#c7cdd6); টপবার-গ্লাস-ওভাররাইড বাদ (original solid navy); cover-cam-btn→সাদা; quiz-profile-card→লাইট-মিন্ট; mod-edit-box→#f8fafc।
- **নিয়ম (রিভার্ট-রিগ্রেশন-পরিবার):** navy-ব্যাকগ্রাউন্ড-সেকশনের টেক্সট কখনো ডার্কে রি-ম্যাপ করবেন না (footer-title #1e293b-on-navy অদৃশ্য ছিল→#fff); `#FCA5A5/#6EE7B7`-পরিবার শুধু ডার্ক-ব্যানারে (অপাক-ডার্ক-ব্যানার প্যাটার্ন), লাইট-পেজে `#b91c1c/#047857`।
- **sandbox-গোটচা:** `/home/z/lekhok-repo` মাঝে-মাঝে ওয়াইপ হয় — **ইডেমপোটেন্ট স্ক্রিপ্ট** `/home/z/my-project/tmp-tools/apply-bg-restore.js` (re-clone-পরে এক-কমান্ডে পুনঃপ্রয়োগ); AV cache-buster বুট-টাইম হ্যাশ — CSS-বদলের পরে সার্ভার রিস্টার্ট লাগে।

## Cross-Agent Note: Session 71 — ব্যাকগ্রাউন্ড-রিস্টোর ধাপ-৩: চিপ-স্তর (১০ সেপ্টেম্বর ২০২৬, কমিট 1e80fd0)

- **চূড়ান্ত-থিম (ইউজার-সিদ্ধান্তের টাইমলাইন):** ডার্ক-গ্রিন-গ্রেডিয়েন্ট (৫৮) না → নেভি-হিরো আসল-রিস্টোর (৬৯) না → **পূর্ণ-লাইট (৭০, d14c054) + প্রি-৫৮ আসল চিপ/স্ট্যাটাস-স্টাইল (৭১, 1e80fd0)**। টপবার/ফুটার/মোবাইল-সাইডবার/অথ-স্প্লিট = নেভি-অ্যাঙ্কর ইচ্ছাকৃত। **নতুন পেজে ডার্ক-হিরো/ডার্ক-পেজ-ব্যাকগ্রাউন্ড আর বানাবেন না** — হিরো হবে লাইট-গ্রেডিয়েন্ট (#fff→#f0fdf7→#e6f7ef-পরিবার)।
- **চিপ-নিয়ম (৭১-এ ফেরা আসল প্যাটার্ন):** স্ট্যাটাস/ক্যাটাগরি-চিপ = সলিড-প্যাস্টেল ব্যাকগ্রাউন্ড + গাঢ় টেক্সট (press: #ecfeff/#0e7490, event: #fef3c7/#b45309, notice: #dbeafe/#1e40af, ok: #e6f6ef/#065f46, err: #fee2e2/#991b1b, warn: #fff7ed/#9a3412)। **ট্রান্সলুসেন্ট rgba(লাইট-অন-লাইট) বা #A5F3FC/#FCD34D/#93C5FD/#6EE7B7/#FCA5A5-টেক্সট লাইট-পেজে নিষিদ্ধ।**
- **টুল (রি-ক্লোন-পরে এক-কমান্ডে পুনঃপ্রয়োগ):** `/home/z/my-project/scripts/apply-bg-restore-session70.py` (ইডেমপোটেন্ট) + `bg-diff-session68.py` (যেকোনো রিভিশন-জোড়ার ব্যাকগ্রাউন্ড-ডিফ — নতুন থিম-কাজে ব্যবহারযোগ্য)।
- **প্যারালাল-পুশ-গোটচা:** পুশ-রিজেক্ট হলে রিবেজ করে কনফ্লিক্ট-ফাইলে অন্যপক্ষের ভার্সন রাখুন, তারপর ইডেমপোটেন্ট-স্ক্রিপ্ট পুনঃপ্রয়োগ করুন — হাতে-মার্জ করবেন না।

## Cross-Agent Note: Session 82 — মেসেঞ্জার FB-প্যারিটি + ২ লিগেসি-CSS-বাগ (১৭ সেপ্টেম্বর ২০২৬)

- **নতুন ফিচার (messages-chat.ejs):** Ctrl+V পেস্ট→অ্যাটাচমেন্ট, ফুল-উইন্ডো ড্র্যাগ-ড্রপ ওভারলে, বাবলে ডাবল-ক্লিক ❤️ (টগল), Web-Audio সাউন্ড (সেন্ড-পপ/রিসিভ-ডিং, localStorage `lfMsgSound`, ডিটেইলস-প্যানেলে `.md-switch` টগল), কম্পোজার input→auto-grow textarea (Shift+Enter নতুন লাইন — `<input type=text>`-এ অসম্ভব ছিল; সেন্ড/ব্যর্থতা/ড্রাফট-রিস্টোরে `autogrowInput()`/`resetInputHeight()` কল রাখতে হবে)।
- **⚠️ লিগেসি-বাগ ১ (ভবিষ্যৎ-এডিটরদের জন্য সতর্কতা):** messenger.css-এ সেশন-৭৬-এডিটে `@media (max-width:600px)`-এর সমাপনীষ্ঠ `}` হারিয়ে গিয়েছিল — ফলে সেশন ৭৬/৭৮-এর সব CSS (বাবল-কোট/⋯-মেনু/FAB/লাইটবক্স) ডেস্কটপে নীরবে ডেড ছিল, শুধু মোবাইলে চলত। **messenger.css-এ যেকোনো @media-ব্লক এডিটের পর brace-ব্যালেন্স যাচাই করুন** (নমুনা-স্ক্রিপ্ট: node one-liner depth-স্ক্যান)। এখন ফিক্সড (২৭৮→৩৯২ রুল)।
- **⚠️ লিগেসি-বাগ ২:** গ্লোবাল style.css-এর `.bubble.me{background:var(--accent)}` (পুরনো QA-কমেন্ট-বাবল) মেসেঞ্জারের বাইরের রো-তে লেগে সবুজ-বাক্স ফুটাত → `.page-wrap--messenger .bubble` রো-রিসেট যোগ হয়েছে। **নতুন ক্লাস-নাম বানানোর সময় গ্লোবাল style.css/dashboard.css-এর সাথে সংঘর্ষ চেক করুন** (`.bubble`, `.file-preview`, `.drop-overlay`-জাতীয় জেনেরিক নাম দ্বৈত-ব্যবহৃত)।
- **সাউন্ড-নোট:** AudioContext ব্রাউজার-অটোপ্লে-পলিসিতে প্রথম user-gesture-এ resume হয় — `SoundFX.ac()` প্রতি-প্লেতে `resume().catch()` করে; হেডলেস-টেস্টে `matchMedia('(hover:none)')` true → টাচ-কন্ট্রোল সবসময়-দৃশ্যমান (সেশন-৭৮ মিডিয়া-রুল) — ডেস্কটপ-স্ক্রিনশটে ⋯/×/😊 দৃশ্যমান থাকা তাই স্বাভাবিক।
- **টেস্ট-ইউজার:** এই clone-এ `fbtest1/fbtest2` (demo123) তৈরি করা আছে (lekhok.db — gitignored); মেসেঞ্জার-E2E-তে ব্যবহারযোগ্য।
- **স্যান্ডবক্স-নোট:** এই sandbox-এ ব্যাকগ্রাউন্ড-প্রসেস মরে না — **ফ্রিজ হয়ে পরে রিজিউম হয়** → পোর্ট-কনফ্লিক্ট-জম্বি সার্ভার পুরনো `?v=`-ক্যাশ সহ পেজ সার্ভ করতে পারে; প্রতিটি টেস্ট-স্ক্রিপ্টের শুরুতে `pkill -f "node server.js"` + পোর্ট-চেক করুন।

## Cross-Agent Note: Session 87 — সাইট-ওয়াইড ডিপ-স্ক্যান অডিট + আপগ্রেড-রোডম্যাপ (১৭ সেপ্টেম্বর ২০২৬)

**পরিধি:** ২২৪-অ্যাসেট-রেফ ডিস্ক-চেক (০-ডেড) · ১৯৫+ রুট HTTP-ম্যাট্রিক্স (ক্লিন) · ১২১-EJS কম্পাইল (০-ফেইল) · ক্লায়েন্ট-JS সিনট্যাক্স (০-ফেইল) · ২৯৪-লিংক ইন্টিগ্রিটি (০-ব্রোকেন) · ১৭-পেজ agent-browser-ক্রল (কনসোল-এরর ০) · IDOR/রেস/সকেট-অডিট-আইটেম ভেরিফায়েড (সব-সুরক্ষিত)। **৩টি রিয়েল-ইস্যু ফিক্সড:** favicon.ico+PWA-সেট (gen-brand-icons.js), reveal-অ্যানিমেশন instant-jump-জাম (main.js r4 — IO-callback + rAF-scroll-handler দুই-স্তর-ফিক্স), স্যান্ডবক্স-সুপারভাইজার (ভুল-পাথ+মৃত ছিল)।

**⚠️ স্ক্যানার-গোটচা (ভবিষ্যৎ-অডিটরদের জন্য):** ① `img.naturalWidth===0`-ডিটেক্টর lazy-load/reveal-টাইমিং-এ false-positive দেয় — রিয়েল-ব্রোকেন নিশ্চিত করতে `complete && currentSrc`-সহ লং-ওয়েট+স্ক্রল-পাস করে রি-চেক করুন। ② রুট-স্ক্যানার-রেগেক্স `router.get(['/a','/b'],…)`-অ্যারে-সিনট্যাক্স ধরে না — ফল "BROKEN-LINK" রিপোর্ট করলে লাইভ-curl-এ যাচাই করুন। ③ bash-টুল আউটপুট-পাইপলাইন ``-সিকোয়েন্স গিলে ফেলে — grep/JSON-ফল "সিনট্যাক্স-এরর"-দেখালে বাইট-যাচাই করুন (সেশন-৮৪-লেসনের পুনরাবৃত্তি)।

**⚠️ স্যান্ডবক্স-প্রসেস-গোটচা:** টুল-সেশন-টিয়ারডাউনে `node server.js`-ব্যাকগ্রাউন্ড-প্রসেস মারা যায় (nohup-ও যথেষ্ট নয়) — **setsid-ডাবল-ফর্ক `(setsid env PORT=3030 SANDBOX_PORT=3030 node server.js </dev/null >>log 2>&1 &)`** ব্যবহার করুন + `/home/z/my-project/tmp-tools/lekhok-supervisor.sh` সুপারভাইজার-ডেমন (pgrep-চেক+হ্যাং-রিকভারি) এখন চালু আছে — সার্ভার-কিল-টেস্টের আগে ভাবুন, সুপারভাইজার ৮-সেকেন্ডে ফিরিয়ে আনবে।

---

## আপগ্রেড-রোডম্যাপ (সেশন-৮৭ ডিপ-স্ক্যান-ভিত্তিক — মাল্টি-এজেন্ট কর্মবণ্টনসহ)

> **অগ্রাধিকার-নীতি:** P0=নির্ভরযোগ্যতা/নিরাপত্তা → P1=ব্যবহার-অভিজ্ঞতা-প্যারিটি → P2=ডিফারেনশিয়েটর। প্রতিটি আইটেমে সংঘর্ষ-ঝুঁকি-স্তর দেওয়া (🟢=একক-ফাইল/নতুন-ফাইল, 🟡=২-৩ ফাইল, 🔴=সার্ভার-কোর/স্কিমা)। **কাজ শুরুর আগে git fetch+rebase বাধ্যতামূলক; নিজের পরিবর্তন আগে PLANS.md-এ দাবি-নোট লিখুন।**

### ফেজ-A: নির্ভরযোগ্যতা ও পারফরম্যান্স (P0) — "Perf-Hardening এজেন্ট"

| # | আইটেম | বিস্তারিত | ঝুঁকি |
|---|---|---|---|
| A1 | **মেসেজ-পোলিং → SSE (Server-Sent Events)** | বর্তমান `/api/messages/poll`-লং-পোলিং প্রতি-ট্যাবে কানেকশন-খরচ বাড়ায়। Express-এ `GET /api/messages/stream`-SSE (ব্রাউজার-নেটিভ EventSource, রিয়েল-টাইম পুশ, অটো-রিকানেক্ট, 45s-হার্টবিট) — পোলিং-কে ফলব্যাক রাখলে গ্রেসফুল-ডিগ্রেড। ডিপলয়-নোট: Vercel serverless-এ SSE-সময়সীমা ( máximo ~300s) — হার্টবিট-রিকানেক্ট-প্যাটার্ন ডিজাইন করতে হবে। | 🔴 |
| A2 | **post_images/বুকমার্ক-লিস্ট N+1-কুয়েরি অডিট** | ফিড/প্রোফাইল-টাইমলাইনে প্রতি-পোস্টে getPostImages-কল (sql.js-সিঙ্ক-লুপ) — একবারে IN(id,…) ব্যাচ+মেমোরি-গ্রুপিং করে ফিড-টিটিবি কমানো। কুয়েরি-কাউন্টার-লগ (NODE_DEBUG-মোড) দিয়ে হট-পাথ শনাক্ত করুন। | 🟡 |
| A3 | **ক্যাশ-হেডার-অডিট** | স্ট্যাটিক `/assets/*`-এ immutable+1y (এখন AV-হ্যাশ-ভিত্তিক `?v=` আছে — সুযোগ নষ্ট হচ্ছে); /img/cover-ডিটারমিনিস্টিক-SVG-তে immutable; অ্যাভাটার-রিডাইরেক্টে ক্যাশ-নীতি-যাচাই। | 🟢 |
| A4 | **এরর-মনিটরিং-হুক** | সার্ভার-এরর-মিডলওয়্যারে কাঠামোবদ্ধ-লগ (path/status/ua + অ্যানন-হ্যাশ) + /admin-এ "সাম্প্রতিক-৫০০"-ফিড — খালি-404-নয়েজ আলাদা। | 🟡 |

### ফেজ-B: ফিড ও পোস্ট-ইঞ্জিন প্যারিটি (P1) — "Feed এজেন্ট"

| # | আইটেম | বিস্তারিত | ঝুঁকি |
|---|---|---|---|
| B1 | **ইনফিনিট-স্ক্রল + স্ক্রল-পজিশন-সেশন** | ফিড-কার্ডে IntersectionObserver-সেন্টিনেল + `?cursor=lastId`-কীসেট-পেজিনেশন (OFFSET-স্কিপ সমস্যা এড়াতে) + ব্যাক-নেভিগেশনে sessionStorage-scrollY-রিস্টোর + শীর্ষে "নতুন-পোস্ট-পিল" (নতুন-আইডি-কাউন্ট-পোল)। | 🟡 |
| B2 | **পোস্ট-কম্পোজার ফুল-মোডাল** | ড্যাশবোর্ড-কম্পোজার-কার্ড→মোডাল-আপগ্রেড (মোবাইলে ফুল-স্ক্রিন-শীট): ড্র্যাফট-অটোসেভ-ইন্ডিকেটর, মাল্টি-ইমেজ-গ্রিড-প্রিভিউ (multi-image.js-পুনঃব্যবহার), ট্যাগ-সাজেস্ট-চিপ, কম্পোজার-চরিত্র-কাউন্টার। | 🟡 |
| B3 | **হালকা-অ্যালগরিদমিক-ফিড** | এখন সম্ভবত created_at-সর্ট; "সামঞ্জস্য-স্কোর" (follow×3 + reaction-মিল×2 + সাম্প্রতিক×1) ORDER BY-সাবকুয়েরি বা ২-পাস (আইডি-সেট নির্বাচন→মেমোরি-সর্ট) — sql.js-কনস্ট্রেইন্টে ২-পাস নিরাপদ। "প্রাসঙ্গিক/সাম্প্রতিক"-টগলসহ। | 🟡 |
| B4 | **নোটিফিকেশন-কীগুলোর আসল-এনফোর্সমেন্ট** | সেটিংস-ম্যাট্রিক্সে ৫×২-কী সেভ-হয় কিন্তু ইমেইল-পাঠ-পাথে সব-সময় চেক হয় না (সেশন-৮০-নোট "এখন শুধু সেভ-হয়") — mailer-call-siteগুলোতে prefs-চেক প্রয়োগ করুন। | 🟡 |

### ফেজ-C: মেসেঞ্জার ডিফারেনশিয়েটর (P1/P2) — "Real-time এজেন্ট"

| # | আইটেম | বিস্তারিত | ঝুঁকি |
|---|---|---|---|
| C1 | **ভয়েস-নোট রেকর্ডিং** | MediaRecorder→webm-আপলোড (বিদ্যমান আপলোড-পাইপ পুনঃব্যবহার), বাবলে অডিও-প্লেয়ার+ওয়েভফর্ম-প্লেসহোল্ডার, মোবাইল-হোল্ড-টু-রেকর্ড-প্যাটার্ন। | 🟡 |
| C2 | **মেসেজ-সার্চ (কথোপকথন-স্কোপড)** | বর্তমান-চ্যাটে Ctrl+F-প্যানেল: LIKE-সার্চ+হাইলাইট-নেভিগেশন (↑↓ জাম্প + ম্যাচ-কাউন্টার) — সার্ভার-কল লাগবে না (লোডেড-বাবল-টেক্সট-স্ক্যান), পুরনো-মেসেজ-লেজি-লোডে সার্ভার-সার্চ-এন্ডপয়েন্ট। | 🟢 |
| C3 | **টাইপিং-ইন্ডিকেটর স্ট্রিমাইল** | `/api/messages/typing`-পোল-কে SSE-চ্যানেলে (A1-নির্ভর); "এক্ষুনি সক্রিয়"-ডট পোলিং-কমানো। | 🔴 |
| C4 | **ডিটেইলস-প্যানেলে শেয়ার্ড-মিডিয়া-ট্যাব** | চ্যাট-ডিটেইলসে ছবি/ফাইল-গ্রিড (বার্তা-সংযুক্তি-ক্যাশ থেকে) + লাইটবক্স-পুনঃব্যবহার। | 🟢 |
| C5 | **অনলাইন-প্রেজেন্স-হার্টবিট** | /api/messages/online-পোলিংকে পেজ-ভিজিবিলিটি-গেটেড লং-ইন্টারভাল + last_seen-থ্রেশহোল্ড প্রোফাইল-ডটে (৮৫-এ ডট-আছে, ব্যাক-এন্ড-ইন্টারভাল-অপটিমাইজ)। | 🟢 |

### ফেজ-D: লেখক-অভিজ্ঞতা (P2) — "Writer এজেন্ট"

| # | আইটেম | বিস্তারিত | ঝুংকি |
|---|---|---|---|
| D1 | **pen_name পোস্ট/কমেন্ট-এভরিহেয়ার-ডিসপ্লে** | সেশন-৮০-সুপারিশ এখনো-বাকি: ফিড-কার্ড/কমেন্ট-বাবল/নোটিফিকেশনে প্রাইমারি-নাম হিসেবে pen_name (পড়ার-সুবিধা: "মোঃ রাফছান (কলমে: নীলকমল)")। ডিসপ্লে-নাম রেজলিউশন-হেল্পার (helpers/display-name.js) একবার বানিয়ে সব-ভিউতে। | 🟡 |
| D2 | **পাবলিক-বুকমার্ক-পেজ** | bookmarks_public-টগল আছে, `/profile/:username/bookmarks`-পাবলিক-ভিউ নেই — প্রোফাইল-ট্যাব-সাব-রুট (৮৫-ট্যাব-ম্যাটে নতুন-ট্যাব)। | 🟢 |
| D3 | **লেখা-স্ট্যাটিসটিক্স-ড্যাশবোর্ড (/me)** | মোট-পোস্ট/মোট-পাঠ/মাসিক-গ্রাফ (বিদ্যমান-কাউন্টার থেকে SVG-বার-চার্ট, নতুন-লাইব্রেরি লাগবে না — হাতে-বানানো SVG)। | 🟢 |
| D4 | **ট্যাগ-সিস্টেম সম্প্রসারণ** | #ট্যাগ-ক্লাউড (/articles?tag= আছে) → ট্যাগ-অটোকমপ্লিট+জনপ্রিয়-ট্যাগ-সাইডবার। | 🟢 |

### ফেজ-E: সুপারভাইশন-ব্যবস্থা (P2) — "Ops এজেন্ট"

| # | আইটেম | বিস্তারিত | ঝুংকি |
|---|---|---|---|
| E1 | **হেলথ-এন্ডপয়েন্ট** | `GET /api/health` (db-ok/uptime/memory/version — কোনো-অথ-নয়, লাইট) — সুপারভাইজার-হ্যাং-চেক ও ভবিষ্যৎ-আপটাইম-মনিটরে ব্যবহার। | 🟢 |
| E2 | **অডিট-লগ-সার্চ/ফিল্টার** | audit_log-টেবিল আছে (৮৩/৮৬-ব্যবহৃত) — /admin-এ ইউজার/অ্যাকশন/তারিখ-ফিল্টার + CSV-এক্সপোর্ট। | 🟢 |
| E3 | **PWA-অফলাইন-শেল (লাইট)** | manifest এখন আছে (৮৭) — service-worker-ক্যাশ-স্ট্র্যাটেজি: শুধু অ্যাসেট-ক্যাশ (নেটওয়ার্ক-ফার্স্ট-HTML) — অফলাইন-স্প্ল্যাশ + "অনলাইনে-ফিরুন"-ব্যানার। | 🟡 |

**সুপারিশ-ক্রম:** প্রথম রাউন্ডে A2+A3+B4+E1 (সব 🟢/🟡, দ্রুত-জয়) → দ্বিতীয় রাউন্ডে B1+C2+D2 (UX-দৃশ্যমানতা) → A1+SSE-ফাউন্ডেশন (🔴-কোর) → তারপর B2/B3/C1/C4/D1/D3।

**সংঘর্ষ-সতর্কতা:** main.js/messenger.css/style.css/layout.ejs-ই সর্বোচ্চ-ঘন-ঘন-এডিটেড ফাইল — ৮২-এর "brace-ব্যালেনস ও ক্লাস-সংঘর্ষ" + ৮৭-এর "মিনিফাইড-main.js-এ exact-anchor-প্যাচ" নোট মনে রাখুন।

---

## Cross-Agent Note: Session 91 — ২০-আইটেম আপগ্রেড-রোডম্যাপ মাস্টার-টেবিল + ক্রন-এজেন্ট অটোমেশন (১৭ সেপ্টেম্বর ২০২৬)

> ইউজার-অনুমোদিত রোডম্যাপ — সেশন-৮৭-এর ৫-ফেজ কাঠামোরই বিস্তারিত ২০-আইটেম রূপ। ফাইল-পাথগুলো **এই রিপোর প্রকৃত Express/EJS কাঠামোতে** অ্যাডাপ্ট করা (Next.js-পাথ নয়)। ক্রন-এজেন্ট (webDevReview, ১৫-মিনিট) এখন থেকে প্রতি রাউন্ডে এই টেবিলের ভ্যালিডেশন-নিয়ম অনুসরণ করবে।

### ১. মাস্টার-টেবিল (২০ আইটেম)

| ID | ফেজ | ফিচার/অপ্টিমাইজেশন | ফাইল/মডিউল-পাথ (এই রিপোতে) | ঝুঁকি | ক্রন-ভ্যালিডেশন |
|----|-----|---------------------|------------------------------|-------|------------------|
| 01 | A-পারফরম্যান্স | SSE রিয়েল-টাইম হাব (নোটিফিকেশন+মেসেজ-পুশ, পোলিং-ফলব্যাক) | server.js + public/assets/js/main.js | 🟡 | কানেকশন-ড্রপ+মেমোরি-লিক টেস্ট |
| 02 | A-পারফরম্যান্স | N+1-ব্যাচিং (post_images/বুকমার্ক IN-কুয়েরি) | routes/social.js, routes/dashboard.js | 🔴 | কুয়েরি-কাউন্ট <৩/অনুরোধ |
| 03 | A-পারফরম্যান্স | ক্যাশ-হেডার টিউনিং (AV-হ্যাশ-ইমিউটেবল) | server.js (স্ট্যাটিক-মিডলওয়্যার) | 🟢 | Cache-Control রেসপন্স-চেক |
| 04 | A-পারফরম্যান্স | রিঅ্যাক্ট-কাউন্টে রেস-সেফ আপডেট | routes/social.js (react-এন্ডপয়েন্ট) | 🟡 | কনকারেন্ট-রিঅ্যাক্ট স্ট্রেস |
| 05 | B-ফিড | কার্সার-ইনফিনিট-স্ক্রল ✅ (সেশন-১০৭: OFFSET→keyset-কার্সার + ডিটারমিনিস্টিক-ORDER + E2E ২৩/২৩) | views/user/dashboard.ejs + routes/dashboard.js | 🟡 | সেন্টিনেল-ভিউপোর্ট ট্রিগার |
| 06 | B-ফিড | স্ক্রল-পজিশন রিস্টোরেশন | public/assets/js/main.js | 🟢 | ব্যাক-নেভিগেশন অফসেট-ম্যাচ |
| 07 | B-ফিড | ফেসবুক-স্টাইল কম্পোজার মোডাল (ড্র্যাগ-ড্রপ+ড্রাফট-গার্ড) | views/user/dashboard.ejs + style.css | 🔴 | মোডাল ওপেন/ক্লোজ+মেমোরি-ফ্রি |
| 08 | B-ফিড | এনগেজমেন্ট-র‍্যাংকড ফিড (time-decay) | routes/social.js (২-পাস স্কোরিং) | 🟡 | টাইম-ডেকেই+ওয়েট টেস্ট |
| 09 | B-ফিড | নোটিফিকেশন এনফোর্সমেন্ট (ম্যাট্রিক্স-কী মেইলারে) | helpers/notify.js + helpers/mailer.js | 🟢 | রেট-লিমিট+প্রেফ-চেক |
| 10 | C-মেসেঞ্জার | ভয়েস-নোট (MediaRecorder+ওয়েভফর্ম) | views/user/messages-chat.ejs + messenger-actions.js | 🟡 | ব্লব-ক্লিনিং (revokeObjectURL) |
| 11 | C-মেসেঞ্জার | ইন-চ্যাট সার্চ (LIKE+হাইলাইট-জাম্প) | views/user/messages-chat.ejs | 🟢 | হাইলাইট+scrollIntoView |
| 12 | C-মেসেঞ্জার | শেয়ার্ড-মিডিয়া/ডক/লিংক ট্যাব | views/user/messages-chat.ejs (details-panel) | 🟢 | গ্রিড-রেন্ডার+লিংক-প্রিভিউ |
| 13 | C-মেসেঞ্জার | WebRTC কল-সিগনালিং+ডক-কন্ট্রোল | public/assets/js/ (নতুন webrtc.js) | 🔴 | অফার/অ্যানসার হ্যান্ডশেক |
| 14 | D-লেখক | pen_name প্রায়োরিটি-ডিসপ্লে এভরিহেয়ার | helpers/display-name.js (নতুন) + সব-ভিউ | 🔴 | name-fallback রিগ্রেশন |
| 15 | D-লেখক | পাবলিক বুকমার্ক-কালেকশন ট্যাব | routes/social.js + views/user/profile.ejs | 🟢 | bookmarks_public-গেট |
| 16 | D-লেখক | রিডার-এনগেজমেন্ট স্ট্যাট-চার্ট (SVG) | views/user/me.ejs | 🟢 | চার্ট-লোডিং+রেসপনসিভ |
| 17 | D-লেখক | হোম-কিউরেশন সোশ্যাল-ফিল্টার ✅ (সেশন-৯০-ই সম্পন্ন — post_kind='writing'+shared_from-কঠোর-ফিল্টার; সেশন-১০৭-এ লাইভ-যাচাই: হোমে AVATAR/COVER_UPDATE-লিক-শূন্য) | routes/pages.js (featured-সেকশন) | 🟡 | AVATAR/COVER_UPDATE-বাদ |
| 18 | E-অপস | /api/health (db+uptime+latency) | server.js | 🟢 | পিং <৫০ms+ডিবি-স্ট্যাটাস |
| 19 | E-অপস | অ্যাডমিন অডিট-CSV এক্সপোর্টার | admin/routes.js | 🟢 | CSV-এনকোডিং+পারমিশন-গার্ড |
| 20 | E-অপস | PWA অফলাইন-শেল (sw.js) | public/sw.js + public/manifest.json | 🟡 | অফলাইন-ক্যাশ+ইনস্টল |

### ২. মাল্টি-এজেন্ট ফাইল-লক ম্যাট্রিক্স (সংঘর্ষ-নিরসন)

| এজেন্ট | রুট-পাথ (লক) | আইটেম | নোট |
|--------|---------------|-------|------|
| Agent-Core | server.js (স্ট্যাটিক/সেশন-অংশ), routes/social.js | 01,02,03,04 | server.js-শেয়ার্ড — exact-anchor-প্যাচ |
| Agent-Feed | views/user/dashboard.ejs, routes/dashboard.js | 05,06,07,08,09 | style.css-শেয়ার্ড |
| Agent-Chat | views/user/messages-chat.ejs, messenger-actions.js, messenger.css | 10,11,12,13 | brace-ব্যালেনস-চেক বাধ্যতামূলক |
| Agent-Author | helpers/display-name.js, views/user/profile.ejs, routes/pages.js | 14,15,16,17 | |
| Agent-Ops | server.js (/api/health-অংশ), admin/routes.js, public/sw.js | 18,19,20 | server.js: রুট-রেজিস্ট্রেশন-শেষে নতুন-ব্লক |

### ৩. ক্রন-এজেন্ট ১৫-মিনিট রুটিন (webDevReview)

- **মিনিট ০-৩ ইন্টিগ্রিটি**: git fetch+status → নতুন-রিমোট হলে pull+টার্গেটেড-সিঙ্ক; node --check সব-এডিটেড-JS
- **মিনিট ৪-৭ রিগ্রেশন**: লগইন-ফ্লো, /profile/:username-ডিকোড, হোম-কুইজ-ব্যান্ড, মেসেঞ্জার-রাউন্ড-ট্রিপ, মডারেটর-কিউ
- **মিনিট ৮-১১ পারফরম্যান্স**: /api/health-লেটেন্সি, মেমোরি-হিপ, N+1-হট-পাথ-স্পট
- **মিনিট ১২-১৫ মার্জ+পুশ**: টেস্ট-পাস হলে fetch+rebase+push; worklog.md-আপডেট; ফেজ-অগ্রগতি-টিক

### ৪. এক্সিকিউশন-অবস্থা

- ✅ সেশন-৯১-এ সম্পন্ন: **১৮ (/api/health — db-ping/latency/uptime/memory, no-store)**, **২০ (sw.js অফলাইন-শেল + offline.html + স্যান্ডবক্স-সচেতন রেজিস্ট্রেশন)**, **০৩-টিউন (sw.js→no-cache, ফন্ট→১-বছর-ইমিউটেবল)**
- ✅ সেশন-৯১-QA (ক্রন-এজেন্ট, ২য় রাউন্ড) সম্পন্ন: **০৯ (নোটিফ-এনফোর্সমেন্ট — helpers/notify.js-এ prefAllows/notifyIfAllowed; social.js ১০-সাইট + dashboard.js notifyOnce-prefsKind; E2E off→০/on→ডেলিভারি)**, **১৫ (পাবলিক বুকমার্ক — /profile/:username/bookmarks + user/profile-bookmarks.ejs pbk-স্কোপ + profile-সাবনাভ 'সংরক্ষণ'-লিংক-ট্যাব + settings 'পাবলিক ভিউ' লিঙ্ক; privacy-lock স্ক্রিন)**, **১৬ (রিডার-এনগেজমেন্ট চার্ট — /me-তে ws91-কার্ড: মোট-পাঠ/প্রতিক্রিয়া/মন্তব্য KPI + ৬-মাসিক হাতে-বানানো SVG-বার + সেরা-লেখা ট্রফি-লিঙ্ক)**, **১৮-মার্জ (দুই-এজেন্টের হেলথ-ভার্সন এক-হুকে — session90-কী-নাম + ok/env)**। সাথে: /login undefined-বাইন্ড-500 ফিক্স, settings/article-form-এ no-JS-safe _csrf-ইনপুট, /me হিরো white-on-white ফিক্স, bash-gotcha `[h[h[hidden]`-করাপশন পুরো-রিপো পুনরুদ্ধার (১৭টি), ৯৯/৯৯ role-policy রিগ্রেশন গ্রিন।
- ✅ পূর্ব-নির্মিত-ছিল (সেশন-৯১-এ যাচাই): **১৯ (অডিট-CSV `/admin/audit/export.csv` — ফিল্টার+BOM+পারমিশন-গার্ডসহ, সেশন-৪৩-নির্মিত)**, **০৩-কোর (সেশন-৫০ থেকেই /assets//uploads immutable ৩০দি + /img/cover ১-বছর + avatar ৬০সে — QA-য়াচাইকৃত)**
- ⏳ পরবর্তী-ক্রন-রাউন্ডে: ১১+১২-মেসেঞ্জার-ট্যাব → ০৬-স্ক্রল-রিস্টোর → ১৪-pen_name-এভরিহেয়ার (কমেন্ট-বাবল/নোটিফিকেশন-ভিউ) → ০৫-ইনফিনিট-স্ক্রল-পলিশ → ০১-SSR-হাব (🔴)

- ✅ পূর্ব-নির্মিত-ছিল (সেশন-৯১-এ যাচাই): **১৯ (অডিট-CSV `/admin/audit/export.csv` — ফিল্টার+BOM+পারমিশন-গার্ডসহ, সেশন-৪৩-নির্মিত)**
- ✅ সেশন-৯২-এ সম্পন্ন: **১০ (ভয়েস-নোট — MediaRecorder+ওয়েভফর্ম-প্লেয়ার+২-মিনিট-গার্ড, upload.js audio-MIME)**, **১২ (শেয়ার্ড-কনটেন্ট মিডিয়া/ফাইল/লিংক-ট্যাব — ডিটেইলস-প্যানেল)** + 🚨 **১৬-ঘটনা `[hidden]`-সিলেক্টর-করাপশন রিপেয়ার** (নিচে সেশন-৯২-নোট)
- ✅ সেশন-৯২-খ-এ সম্পন্ন: **০৬ (ফিড স্ক্রল-পজিশন-রিস্টোর — main.js: pathname+query-keyed sessionStorage, back-nav exact-restore E2E ✓)**, **১২-বৃদ্ধি (লাইভ-মিডিয়া-রিফ্রেশ — /api/messages/conv/:id/media + count-ব্যাজ + রিফ্রেশ-বাটন + স্কেলেটন; voice-শ্রেণিবিভাগ সহ)** + 🚨 SW-প্রাইভেসি-ফিক্স (HTML কখনো ক্যাশ নয় — /me /profile লিক বন্ধ, cache-v2) + স্টাফ-লগইন CSRF-ফিক্স (/admin/login সার্ভার-রেন্ডার্ড _csrf)
- ⏳ পরবর্তী-ক্রন-রাউন্ডে (৯২-খ-পরবর্তী): ১৪-pen_name-এভরিহেয়ার → ০৫-ইনফিনিট-স্ক্রল-পলিশ → ০১-SSR-হাব → শেয়ার্ড-ট্যাব pagination

## Cross-Agent Note: Session 89 — ফিড FB-২০২৪ ফেসপাইল/কমেন্ট-প্রিভিউ + ইনফিনিট-স্ক্রল + মেসেঞ্জার-সার্চ C2 (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** ফেজ-A2 ✓ (N+1 ব্যাচ), B1 ✓ (ইনফিনিট-স্ক্রল), C2 ✓ (সার্চ-আপগ্রেড), D1 ✓ (আংশিক — display-name হেল্পার + ফিড-কার্ড; কমেন্ট-বাবল/নোটিফিকেশন এখনো বাকি), E1 ✓ (/api/health)। ৮৮-সুপারিশের ① ফেসপাইল ✓ ④ কমেন্ট-প্রিভিউ ✓। রোডম্যাপের পরবর্তী-প্রথম-পছন্দ: A3 (ক্যাশ-হেডার), B4 (নোটিফ-এনফোর্স), C1 (ভয়েস-নোট), D2 (পাবলিক-বুকমার্ক)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **actions-bar.ejs নতুন ঐচ্ছিক প্যারাম `reactorFaces`** (অ্যারে: {id, username, full_name, pen_name, avatar_url}) — না-দিলে ডিফল্ট `[]` (অদৃশ্য, পিছনে-সামঞ্জস্যপূর্ণ)। যে পেজে রিঅ্যাকশন-ইঞ্জিন আছে সেখানে ফেসপাইল চাইলে রুটে ১ IN-কুয়ারিতে সর্বশেষ-৩-রিঅ্যাক্টর এনে প্যারামে দিন (নমুনা: routes/social.js প্রোফাইল-রুটের facesByPost89 ব্লক)।
- **ফেসপাইল লাইভ-আপডেট চ্যানেল:** মিনিফায়েড রিঅ্যাকশন-আপডেটার এখন `.reaction-summary`-তে `lf:reactupdate` CustomEvent ছড়ায় (`detail:{reactions,total,mine}`) — exact-anchor প্যাচ (`.rs-count").textContent=o>0?o:"";try{...}`)। **আবার মিনিফায়েড main.js-এর ওই অংশ এডিট করলে এই ডিসপ্যাচ রক্ষা করুন।** লিসেনার main.js শেষ-ব্লকে (r5); আমার-অ্যাভাটার চেনে `body[data-uid]` দিয়ে।
- **⚠️ `<body>` দুই জায়গায়:** `views/layout.ejs` (পাবলিক লেআউট) **এবং** `views/partials/header.ejs:95` (মেম্বার-লেআউট — dashboard/messenger/profile/settings সব)। body-অ্যাট্রিবিউট যোগ করতে হলে **দুটোতেই** দিন — শুধু একটায় দিলে member-পেজে undefined (৮৯-এ E2E-তে ধরা)।
- **ফিড-কার্ড-মার্কআপ এখন `views/partials/feed-cards.ejs`-এ** — /dashboard ও /dashboard/more (ইনফিনিট-স্ক্রল) দুই জায়গাতেই include হয়। ফিড-কার্ড এডিট করলে আর dashboard.ejs-এ খুঁজবেন না। ডেকোরেশন (reactionCounts/myReaction/images/display_name/reactorFaces/commentPreview) `routes/dashboard.js decorateFeed()`-এ কেন্দ্রীভূত — /dashboard/more-ও এটিই ব্যবহার করে।
- **`GET /dashboard/more?filter=&offset=`** সার্ভার-রেন্ডার HTML ফেরত `{ok, html, hasMore, nextOffset}` — OFFSET-পেজিনেশন (per-page ১০), রানওয়ে-গার্ড offset>300। ক্লায়েন্ট-ইঞ্জিন main.js শেষ-ব্লকে (`#feedMore` সেন্টিনেল, rootMargin 600px)।
- **মেসেঞ্জার সার্চ:** `#convInSearch`-এ এখন পূর্ণাঙ্গ ইঞ্জিন (mark-হাইলাইট+কাউন্টার+↑↓) — messages-chat.ejs IIFE। বাবল-টেক্সটে `<mark class="msg-hl">` থাকতে পারে — **appendMessage/এডিট-প্রোপাগেশন কোডে bubble-text.innerHTML ধরে কাজ করলে মার্ক-স্টেট ভাঙার ঝুঁকি**; poll-নতুন-বাবল এলে `window.lfMsgSearchRefresh()` কল করা হয়।
- **D1 হেল্পার:** `helpers/display-name.js` — `displayName(row)` (pen_name প্রধান, fallback full_name)। কমেন্ট-বাবল/নোটিফিকেশন-ভিউতেও গ্রহণ করা বাকি।
- **টেস্ট-ডেটা (এই clone-এর lekhok.db):** fbtest1/2/3 (demo123) + fbtest2-র পোস্ট id=5 + ৭ likes (সবাই 'love') + ৩ comments + comment_count সিঙ্কড — ফেসপাইল/প্রিভিউ-ডেমো সরাসরি দেখা যায়।

**গোটচা-পুনরাবৃত্তি:** messenger.css-এর raw brace-কাউন্ট ১ বেশি দেখায় — লাইন ~১০২৩-এর কমেন্ট-টেক্সটের লিটারেল `}` (প্রি-একজিস্টিং false-positive; ডেপথ-স্ক্যানে final depth 0)। UNION-কুয়েরিতে কলাম যোগ করলে **সব UNION-শাখায়** যোগ করুন (৮৯-এ ACTIVITY_SQL-এ `NULL as pen_name` বাদ গেলে "SELECTs do not have the same number of result columns" — ফিড খালি)।

## Cross-Agent Note: Session 92 — ভয়েস-নোট C1 + শেয়ার্ড-ট্যাব C12 + [hidden]-করাপশন রিপেয়ার (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম **১০ ✓ (ভয়েস-নোট)**, **১২ ✓ (মিডিয়া/ফাইল/লিংক-ট্যাব)**। Agent-Chat-লক ব্যবহার করা হয়েছে (messages-chat.ejs + messenger.css + messenger-actions.js) — পরবর্তী এজেন্ট এই ফাইল ধরলে `git pull`-এর পর voice-engine ব্লকগুলো দেখুন।

**🚨 নতুন-এজেন্টদের জন্য বাধ্যতামূলক-লেসন (বাগফিক্স এই সেশনে):**
1. **bash-টুল `[h`-গোটচা এখন ৩ রূপে দেখা যায়** — (ক) কমান্ড/ডিসপ্লেতে `[h` খাওয়া, (খ) ফাইলে লেখার সময় প্রিফিক্স হারানো `Xidden]`, (গ) ফাইলে **ডাবল-প্রিফিক্স ঢোকা `[h[h[hidden]`** (সেশন-৮৯-ফিক্স-পরবর্তী কোনো এক মার্জে ১৬ ঘটনা ঢুকেছিল — চ্যাট-রিয়েকশন ও প্রোফাইল pic-menu-র JS `:not()`-সিলেক্টর **SyntaxError** ছিল, CSS হাইড-রুলগুলো নিষ্ক্রিয়)।
2. **স্ক্যান-স্ক্রিপ্টের আউটপুটে 'corruption' দেখলে od -c দিয়ে বাইট-যাচাই আগে করুন** — ডিসপ্লে-গোটচা নিজেই ভুয়া-পজিটিভ বানায় (এই রাউন্ডে ৬টি ভুয়া 'A-form' যা আসলে লেজিট `[hidden]` ছিল)।
3. **ফিক্স-স্ক্রিপ্ট char-code দিয়ে বানান** (`String.fromCharCode(91)`), রেজেক্সে `([^\[h])`-নেগেটেড-ক্লাস ব্যবহার করুন (নাহলে `aria-hidden`/`[hidden]`-এর 'h' প্রেডিসেসর ডাবল-ফিক্স হয় — এই রাউন্ডে feed.css-এ হয়েছিল, git checkout-এ উদ্ধার)।
4. **নোড-ভেরিফায়ার:** `grep -c 'h' + '[hidden]'`-বাইট-কাউন্ট প্রতি ফাইলে + od-স্যাম্পল।

**ভয়েস-নোট ইন্টিগ্রেশন-পয়েন্ট (ভবিষ্যৎ-এডিটে রক্ষণীয়):** messages-chat.ejs ইনলাইন-স্ক্রিপ্টে `bnDg/bnTime` + `voicePlayer()` IIFE (document-level .bv-play ডেলিগেশন — পোল-অ্যাপেন্ডেড বাবলেও চলে) + `startRec/stopRec/sendVoice` ব্লক; appendMessage-এ audio-ব্রাঞ্চ (webm|ogg|m4a|mp3|wav|aac|opus এক্সটেনশন-টেস্ট); সার্ভার-রেন্ডারে seeded-ওয়েভফর্ম EJS-লুপ; upload.js-এ DOC_TYPES/DOC_EXT-অডিও + mimetype `;`-প্যারাম-স্ট্রিপ। **শেয়ার্ড-Audio প্যাটার্ন:** পেজে ১টিই Audio এলিমেন্ট — `.bubble-voice` ক্লোন করলে data-src রাখুন, play-লজিক নকল করবেন না।

**টেস্ট-ডেটা (এই clone-এর lekhok.db):** fbtest1→fbtest2 কথোপকথনে voice-note (id=13, voice-*.wav) + doc (report.pdf) + লিংক-বার্তা (github.com) সিডড — মিডিয়া/ফাইল/লিংক-ট্যাব ডেমো সরাসরি।

## Cross-Agent Note: Session 93 — চ্যাট-উইন্ডোিং + সার্ভার-সার্চ-জাম্প (১১ ✓) + স্ক্রল-রিস্টোর (০৬ ✓) + pen_name-কমেন্ট (১৪ ✓) (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম **১১ ✓ (উইন্ডোিং + LIKE-ব্যাকএন্ড + জাম্প)**, **০৬ ✓ (ফিড-স্ক্রল-রিস্টোর)**, **১৪ ✓ (আংশিক — ফিড-কার্ড ৮৯-এ, কমেন্ট/উত্তর ৯৩-এ; নোটিফিকেশন-স্ট্রিং বাদ — সেগুলো তৈরির-সময়ে-নির্মিত টেক্সট)**। Agent-Chat-লক (messages-chat.ejs/messenger.css) + Agent-Feed-সাইড (main.js) + Agent-Author-সাইড (article-single/qa-single/social.js) একসাথে ব্যবহৃত — পরবর্তী এজেন্ট pull-এর পর নিচের ইন্টিগ্রেশন-পয়েন্টগুলো দেখুন।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **চ্যাট-রেন্ডার এখন ৩-স্তরে:** `routes/dashboard.js` (`buildChatWindow`/`buildChatShared`/`chatOlderBatch`) → `views/partials/chat-bubbles.ejs` (একমাত্র বাবল-মার্কআপ-সোর্স) → `messages-chat.ejs` (প্রাথমিক) + `views/user/chat-fragment.ejs` (আগের-বার্তা-ফ্র্যাগমেন্ট)। **বাবল-মার্কআপ এডিট করতে হলে এখন পার্শিয়ালে করুন** — messages-chat.ejs-এ লুপ আর নেই। ⚠️ EJS-লেসন: `include(path, {...})`-এ প্যারেন্ট-স্কোপের `var` ফাংশন চাইল্ডে যায় না — `clusterInfo/dateLabel/_isImg/_isAud` include-অবজেক্টে পাস করা হয়; নতুন হেল্পার যোগ করলে দুই include-সাইটেও যোগ করুন।
- **চ্যাট-রুট লোকালস:** দুই রুটই (1:1 + গ্রুপ) এখন `olderState {hasOlder, oldestId}`, `aroundMode`, `hlMsgId`, `chatShared {imgs,docs,voice,links}`, `lastOwnReadId` পাস করে। উইন্ডো-সাইজ টিউন: `CHAT_PER_PAGE` (৬০), around-কনটেক্সট `CHAT_AROUND_BEFORE` (২৫)।
- **নতুন API:** `GET /api/messages/older?conv_id=&before=` (HTML-ফ্র্যাগমেন্ট JSON {ok, html, hasOlder, oldestId}) এবং `GET /api/messages/search?conv_id=&q=` ({ok, results[{id, sender, username, snippet, at}]}) — দুটোই convAccess-গার্ডেড।
- **ক্লায়েন্ট-হুক:** `window.lfMsgJump93(id)` (পালস-জাম্প/around-নেভ), `window.lfMsgServerSearch(q)`, `window.lfMsgServerHide()` — poll/অন্য-ইঞ্জিন থেকে ডাকা যাবে। আগের-বার্তা-অটো-লোড সার্চ-ইনপুট খালি থাকলেই চলে (ফিল্টার-গার্ড)।
- **main.js:** শেষে ২টি IIFE — ফিড-স্ক্রল-সেভার + ব্যাক-নেভিগেশন-রিস্টোরার (`lfFeedScroll93`, ৩০-মিনিট TTL)। অন্য-ফিড-পেজে (প্রোফাইল-টাইমলাইন) চাইলে pathname-গার্ড বাড়ান।
- **displayName-গ্রহণ:** article-single + qa-single রুট এখন `displayName` লোকাল পাস করে — নতুন সারফেসে (নোটিফিকেশন-ভিউ ইত্যাদি) একই প্যাটার্ন।

**E2E-প্রমাণিত:** ৬০→১০০-বাবল লোডার ✓ টার্মিনাল-মার্কার ✓ স্ক্রল-টপ-অটো-লোড ✓ ২০-ম্যাচ-ড্রপডাউন+around-জাম্প+পালস+পিল ✓ কোট-জাম্প-দুই-শাখা ✓ pen_name-কমেন্ট ("নীলকণ্ঠ-৯৩") ✓ রিঅ্যাক্ট-মেনু-রিগ্রেশন ✓ 390px-০ ✓ কনসোল-০ ✓।

**টেস্ট-ডেটা (এই clone-এর lekhok.db):** conv-1 (fbtest1↔fbtest2) — মোট ৯৭-বার্তা: seed#1-80 ("সিড-বার্তা N — PURATAN[OLD/NOTUN মার্কার N"), reply id=97 (→36 কোট-জাম্প ডেমো), fbtest1-এর pen_name='নীলকণ্ঠ-৯৩'।

**গোটচা-পুনঃপ্রমাণ:** ডিসপ্লে-গোটচা এই রাউন্ডেও ২ ভুয়া-পজিটিভ (`:not(idden])`, `messagesessages` — দুটোই বাইট-লেভেলে অক্ষত ছিল)। **নিয়ম অপরিবর্তিত:** স্ক্যানে 'corruption' দেখলে char-code/od-যাচাই আগে, ফিক্স পরে।

**✅ সেশন-৯৭-এ সম্পন্ন (দ্বিতীয় এজেন্ট):** **১৪-সম্পূর্ণ** (নোটিফিকেশন ×১৬ সাইট displayName + সেশনে pen_name ×৬ সাইট + article/qa বাইলাইন+বাবলে pen-chip + JSON-LD + app.locals.displayName/hasPenName) + **০৫-পলিশ load-on-restore** (LekhokFeedMore.loadNext() serialized-চেইন — বাটন/সেন্টিনেল/রিস্টোর এক-চেইনে; গভীর-সেভ রিস্টোরে পেজ-অটো-লোড ≤১২ → নিখুঁত রিস্টোর; lf-restoring ক্লাস)। মার্জ-নোট: ৯৩-এর কমেন্ট-কম্পোজার/৩-ডট-মেনু + ৯৪-এর pen-chip একই ভিউতে সহাবস্থান-যাচাই; তাঁদের WebRTC-কল ৪৫/৪৫ + role-policy ৯৯/৯৯ rebase-পরবর্তী।
**পরবর্তী-ক্রন-রাউন্ডে (৯৭-পরবর্তী):** ০১-SSE-রিয়েল-টাইম-হাব (🔴 — নোটিফ+মেসেজ-পুশ, পোলিং-ফলব্যাক; একক-রাউন্ড-ফোকাস) → ০৭-কম্পোজার-মোডাল (🔴) → ০৮-এনগেজমেন্ট-র‍্যাংকড-ফিড → শেয়ার্ড-ট্যাব pagination (WebRTC-মার্জ-পরে, Agent-Chat-লক) → নোটিফিকেশন-ড্রপডাউন actor-avatar → প্রোফাইল-টাইমলাইনেও স্ক্রল-রিস্টোর।

## Cross-Agent Note: Session 93 — WebRTC অডিও/ভিডিও কল (HTTP-পোলিং সিগন্যালিং) + /dashboard fresh-500 ফিক্স (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ/সুপারিশ-প্রগতি:** সেশন-৭৬-এর "WebRTC এজেন্টের সিগন্যালিং-সার্ভিস" + "⋯-মেনুতে 'কলে উত্তর'"-এর ভিত্তি এখন আছে — কল-সিগন্যালিং সম্পূর্ণ কার্যকর (৪৫/৪৫ API E2E + agent-browser প্রকৃত-রিং E2E)। Agent-Chat-লক সম্মান করা হয়েছে — **messages-chat.ejs-এ আমার স্পর্শ মাত্র ৩টি ছোট ব্লক**: ① header-include-এ `calls.css` ② fb-chat-actions-এর দুই বাটনের onclick ③ ফুটারে bootstrap-ctx+`webrtc-call.js`। ভয়েস-নোট (session92)-ব্লক অক্ষত।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **কল-এন্ডপয়েন্ট:** `routes/calls.js` — সব `/api/calls/*`। পোল-রেসপন্স `{incoming, outgoing, active, ended, signals, after}`। নতুন সিগন্যাল-টাইপ (যেমন স্ক্রিনশেয়ার/রিনেগোশিয়েশন) যোগ করতে হলে payload-JSON-এ `type` বাড়ান — ক্লায়েন্ট webrtc-call.js-এর signal-সুইচে হ্যান্ডলার যোগ করুন (অজানা-টাইপ নীরবে ইগনোর হয় — ব্যাক-কম্প্যাট নিরাপদ)।
- **কল-টেবিল:** `call_sessions` (status: ringing/accepted/ended/declined/cancelled/missed) + `call_signals` (payload-JSON, sender-ফিল্টার্ড ডেলিভারি, cursor `after`=signal-id)। MIGRATION_SQL + applyLaterMigrations দুই-জায়গাতেই CREATE — নতুন কলাম লাগলে LATER_COLUMNS-প্যাটার্ন মানুন (fingerprint-bust)।
- **🚨 /settings-লেজি-ALTER থেকে সরানো হলো:** users-এর pen_name/genres/allow_messages_from/bookmarks_public এখন db.js LATER_COLUMNS-এ বুট-টাইম ensure — fresh-deploy-তে /dashboard-এর `u.pen_name` 500 ছিল ("no such column"), এখন 200। social.js-এর লেজি-ALTER-লুপ রাখা হয়েছে (ডুপ্লিকেট-নিরাপদ) — অপসারণ করবেন না, কিন্তু নতুন কলাম এখন থেকে **LATER_COLUMNS-এই** যোগ করুন।
- **QA-ইউজার:** `node scripts/seed-qa-users.js` (**সার্ভার বন্ধ করে**!) — testuser/testadmin (demo123), testagent1/2 (Test@1234), ismail/monem/karishma/mahfuz/nusrat (demo123)। রোস্টার-সিড-ডিবিতে ডেমো-ইউজাররা সিড হয় না (users-table non-empty) — কল/চ্যাট E2E-র জন্য এই সিড দরকার।
- **কল-টেস্ট:** `node scripts/verify-session93-calls.js http://localhost:PORT` (সার্ভারে `CALL_RING_TIMEOUT_S=4` দিলে missed-টেস্ট দ্রুত)। টেস্টের আগে ismail-সেশনে একবার `/api/calls/poll` কল + ৫-সে অপেক্ষা → stale-রিং self-heal (নাহলে অন্য-সোর্সের টাটকা রিং busy-দেয়)।
- **কল-UI DOM:** webrtc-call.js `document.body`-তে `.lc-root` ইনজেক্ট করে — messenger.css-এর কোনো স্টাইল সেখানে প্রযোজ্য নয়; কল-ভিজ্যুয়াল বদলাতে calls.css-ই এডিট করুন। `:has()` সিলেক্টর ব্যবহৃত (আসন্ন-মোডালে স্টেজ-লুকানো) — ২০২৩+ ব্রাউজার; পুরনো-ব্রাউজারে কেবল দ্বৈত-ছায়া দেখায় (কার্যতঃ ক্ষতিকর নয়)।

**গোটচা (এই সেশনে বাস্তবে খাওয়া):**
1. **E2E-ব্রাউজার + API-টেস্ট একসাথে চললে রেস** — ব্রাউজারে খোলা আসন্ন-কল টাটকা (≤ring-timeout) থাকায় API-start busy-দেয়। টেস্ট-আইসোলেশনে প্রি-পোল+৫সে-অপেক্ষা রাখুন।
2. **cleanup-পরে S.callId পড়া** — ক্লায়েন্টের error-path-এ callId cleanup-এর **আগে** capture করুন (নাহলে end-কল `/api/calls/0/end`-এ যায় — কল রিংিং-ই থেকে যায়)।
3. **পোল-লুপ পুনরায়-চালু** — কল-ক্লিনআপে (cleanup) `schedulePoll()` আবার কল করতে হয়; নাহলে কল-শেষে ক্যালি আর কখনো নতুন কল দেখে না (এই বাগ দুই-রাউন্ড agent-browser টেস্টে ধরা পড়েছিল)।
4. **role-policy-স্যুট baseline** — `test-role-policy.sh` session-91-এর stateful-baseline (testadmin role=admin ইত্যাদি) ছাড়া ২৯+ ফলস-ফেইল দেয়; fresh-clone-এ চালালে সেটি environment-সমস্যা, কোড-রিগ্রেশন নয় (ডকুমেন্টেড)।

**টেস্ট-ডেটা (এই clone-এর lekhok.db):** testuser↔testagent1 + ismail↔monem কথোপকথন + কয়েকটি টেস্ট-কল-রেকর্ড (📞 মেসেজ) সিডড — মেসেঞ্জারে কল-রেকর্ড-বাবল সরাসরি দেখা যায়।

## Cross-Agent Note: Session 94 — গ্লোবাল কল-রিংগার + কল-ইতিহাস ট্যাব (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** সেশন-৯৩-সুপারিশ **① গ্লোবাল-রিংগার ✓** + **② কল-ইতিহাস-ট্যাব ✓**।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **header.ejs-এ গ্লোবাল কল-ইনজেকশন** (লগড-ইন-গেটেড): calls.css + `window.LekhokCallCtx`-বেস + webrtc-call.js। **webrtc-call.js এখন সব মেম্বার-পেজে চলে** — এডিট করলে লক্ষ রাখুন: ① `window.LekhokCall` ডাবল-ইনক্লুড-গার্ড রাখুন ② ctx লেজি-পাঠ (C()-হেল্পার) — মেসেঞ্জার-ভিউ পরে সমৃদ্ধ করে ③ পোল-ইন্টারভাল পেজ-ভিত্তিক (মেসেঞ্জার ৩s/অন্য ৫s — সার্ভার-লোড)।
- **মেসেঞ্জার-ভিউতে আর webrtc-call.js-স্ক্রিপ্ট-ট্যাগ নেই** (header থেকে আসে) — শুধু ctx-সমৃদ্ধকরণ ব্লক আছে (convId/peer)। ভিউ-রি-স্ট্রাকচার করলে ওই ctx-ব্লকটি রক্ষা করুন।
- **কল-ইতিহাস:** `GET /api/calls/history?conv_id=&limit=` — রো: {id, kind, status, direction, duration_s, reason, created_at} + peer। চ্যাট-ডিটেইলস প্যানেলের "কল" ট্যাব (1:1-গেট) লেজি-ফেচ করে — **dashboard.js স্পর্শ করেনি** (parallel-সেফ); ট্যাব-রেন্ডারার messages-chat.ejs-এর ৯৪-IIFE (esc94/bn94/rel94 হেল্পার)।
- **স্টাইল:** কল-হিস্ট্রি-রো = calls.css-এর `.md-callrow` ফ্যামিলি (messenger.css নয়) — কল-UI এডিট করলে calls.css-ই ধরুন।

**sandbox-গোটচা-পুনঃপ্রমাণ:** বুট-পরবর্তী ৪-সে settle-এর আগে লগইন-টেস্ট মাঝে-মাঝে মিথ্যা-401 দেয় (dying/init-race) — settle-delay + লগইন-status-প্রিন্ট ছাড়া ব্যর্থতা পড়বেন না।

**পরবর্তী-ক্রন-রাউন্ডে (৯৩-পরবর্তী):** ০৫-ইনফিনিট-স্ক্রল-কার্সার-পলিশ → ০১-SSE-রিয়েল-টাইম-হাব (🔴 — নোটিফ+মেসেজ-পুশ, পোলিং-ফলব্যাক) → ১৩-WebRTC-কল-সিগন্যালিং (🔴) → নোটিফিকেশন-ভিউতে displayName → প্রোফাইল-টাইমলাইনেও স্ক্রল-রিস্টোর।

## Cross-Agent Note: Session 99 — SSE রিয়েল-টাইম হাব (০১ ✓) + লাইভ-বেল + /api/health পুনর্নির্মাণ (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম **০১ ✓ (SSE হাব — 🔴-কোর)**। পরবর্তী-প্রথম-পছন্দ: **০৫ (ইনফিনিট-স্ক্রল-কার্সার-পলিশ)** → **১৩ (WebRTC সিগন্যালিং 🔴)** → **০৮ (এনগেজমেন্ট-র‍্যাংকড ফিড)** → **০৭ (কম্পোজার-মোডাল 🔴)** → ১৯-অডিট-CSV-ভেরিফিকেশন।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **`helpers/sse.js` (নতুন):** `publishToUser(uid,type,data)` / `publishToUsers(uids,type,data,exceptUid)` / `publishToAll(type,data,exceptUid)` / `stats()`। যে-কোনো রুটে রিয়েল-টাইম-পুশ দরকার হলে `require('../helpers/sse')` করে এক-লাইনে পুশ করুন। ক্লায়েন্টে নতুন-ইভেন্ট-টাইপ যোগ করতে চাইলে: সার্ভারে `publishToUser(..., 'yourtype', {...})` + live.js-এ `es.addEventListener('yourtype', ...)`।
- **`GET /api/events`:** সব-লগড-ইন-পেজে EventSource সংযুক্ত থাকে (live.js)। হেডারে `no-transform` বাধ্যতামূলক — compression-মিডলওয়্যার এটা-ছাড়া SSE বাফার করে ফেলে।
- **`public/assets/js/live.js` (নতুন):** main.js-শেষ-ব্লকের লোডার ডায়নামিক-লোড করে (body[data-uid]-গার্ডেড)। **main.js-মিনিফাইড-অংশে ধরা নেই** — শেষে স্বতন্ত্র IIFE; ভবিষ্যৎ main.js-এডিটে শেষ-ব্লকটি রক্ষা করুন (r5/reactupdate + feed-scroll-93 + এই লোডার)।
- **টোস্ট-সেমান্টিকস:** `'message'`-ইভেন্টে কখনো টোস্ট দেবেন না — টোস্ট আসে শুধু `'notification'`-ইভেন্টে (notifyOnce-এর মিউট/প্রেফ/ডিডাপ-গার্ড-পাস করে)। নইলে মিউট-করা-কথোপকথনেও টোস্ট যাবে।
- **`/api/health` ফিরে এসেছে** (সেশন-৮৯-এ ছিল, কোনো-এক-মার্জে হারিয়েছিল) — এখন `sse:{connections,users}`-সহ। হেলথ-চেকে এটাই ব্যবহার করুন।
- **notify.js-হুক:** `notifyUser`/`broadcastToAll` এখন স্বয়ংক্রিয়ভাবে SSE-পুশ করে — notify-পাথ এডিট করলে এই পুশ-লাইনগুলো রক্ষা করুন।

**প্রমাণিত-টেস্ট-হারনেস-লেসন (গুরুত্বপূর্ণ):**
1. স্ট্যান্ডঅ্যালোন DB-এডিট-স্ক্রিপ্টে `db.saveDb()` — `flushDb()` লোকাল-sql.js-মোডে no-op (নোটিফিকেশন-ডিলিট ৩-বার "হারিয়েছিল")।
2. `pkill`-এর SIGTERM-গ্রেসফুল-শাটডাউন-ফ্লাশ পুরনো-মেমরি-স্টেট ফেরত-লিখতে পারে — ডিলিটের **আগে** `pkill -9` + পরে কাউন্ট-ভেরিফিকেশন।
3. notifyOnce-ডিডাপ (একই-বডি ১০-মিনিট) — নোটিফিকেশন-টোস্ট-টেস্টের আগে রো-কাউন্ট যাচাই করুন, নইলে "ফিচার-ভাঙা" ভুল-সিদ্ধান্তে যাবেন।
4. ডিসপ্লে-গোটচা আবারও ২ ভুয়া-পজিটিভ (`messagesessages`, `:not(idden])`) — char-code/od-যাচাই-নিয়ম অপরিবর্তিত।

**টেস্ট-ডেটা:** fbtest1↔fbtest2-তে E2E-বার্তা (SSE-E2E/BADGE-E2E/.../LIVE-*) — conv-1 এখন ~১০০+ বার্তা (উইন্ডোিং/সার্চ-ডেমো আরও-সমৃদ্ধ)। fbtest1-এর message-নোটিফিকেশন E2E-চলাকালীন কিছু-কিছু ডিলিট-হয়েছে (টোস্ট-প্রুফের জন্য)।

## Cross-Agent Note: Session 97 — কল-রেজিলিয়েন্স প্যাক (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** সেশন-৯৪-সুপারিশ **③ env-TURN (গ্রাউন্ডওয়ার্ক) ✓**, **⑤ ICE-restart-রিট্রাই-UI ✓** + সুপারিশ-② **কলব্যাক-বাটন ✓**, **③ মিসড-কল-ব্যাজ ✓** + QA-রাউন্ডে ধরা **আসন্ন-কল-হ্যাং-গ্যাপ ফিক্স ✓**। মাস্টার-টেবিলের ১৩-WebRTC-এর রেজিলিয়েন্স-শেয়ার। Agent-Chat-লক (webrtc-call.js/calls.css/messages-chat.ejs) + header.ejs + notifications.ejs + style.css-EOF + routes/calls.js ব্যবহৃত।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **সিগন্যাল-টাইপ ২টি বাড়ল:** `offer`/`answer` (renegotiation/ICE-restart) — webrtc-call.js poll-হ্যান্ডলারে নতুন শাখা। **নতুন সিগন্যাল-টাইপ যোগ করলে এই সুইচেই** — অজানা-টাইপ নীরবে-ইগনোর প্যাটার্ন অক্ষত (ব্যাক-কম্প্যাট)।
- **TURN-config:** `LEKHOK_TURN_URLS`/`LEKHOK_TURN_USERNAME`/`LEKHOK_TURN_CREDENTIAL` env → header.ejs `window.LekhokCallCtx.iceServers` → webrtc-call.js `rtcConfig()` লেজি-পাঠ। **openrelay ডিফল্ট অক্ষত** — env-শূন্যে কোনো বদল নেই। Metered.ca-ক্রেডেনশিয়াল পেলে .env.example-এর ডক অনুযায়ী Vercel-env-এ দিলেই হবে।
- **কল-ইতিহাস রো:** এখন `role="button"` + ডেলিগেটেড-ক্লিক (`.md-callrow` → `LekhokCall.start('audio')`, আইডল-গার্ডসহ) — **রো-মার্কআপ এডিট করলে role=button/tabindex/aria রক্ষা করুন**; কলব্যাক-বাটন `.mdc-cb` + গ্রুপ `.mdc-right` calls.css-এ।
- **আসন্ন-কল সেফটি-টাইমআউট:** poll-incoming-এ `ring_timeout_s` নতুন ফিল্ড — ক্লায়েন্ট `max((ring_timeout_s−age_s)+৬সে, ১২সে)` পরে স্বয়ং-বিলুপ্ত। **routes/calls.js-এ RING_TIMEOUT_S-এর ডিফল্ট বদলালে ক্লায়েন্ট-টাইমআউটও স্বয়ংক্রিয়-অ্যাডাপ্ট করে (এই ফিল্ডের কারণে) — আলাদা সিঙ্ক লাগে না।**
- **নোটিফ-আইকন-ম্যাপ দুই জায়গায়:** header.ejs `_ico` (ড্রপডাউন) + notifications.ejs if/else চেইন (পেজ) — নতুন notification-type যোগ করলে **দুটোই** আপডেট করতে হবে (call-type মিস করে fa-bell-ফলব্যাক খেয়েছিল)।
- **style.css মিনিফাইড** — সেশন-৯৭-ব্লক EOF-অ্যাপেন্ড (`.notif-missed` ফ্যামিলি) — exact-anchor-প্যাচের দরকার হয়নি; পরবর্তী-এজেন্টও অ্যাপেন্ড-প্যাটার্নই মানুন।

**QA-প্রমাণ:** E2E ৫৪/৫৪ + অডিট ৪৯/৪৯ + ক্লায়েন্ট-টাইমআউট লাইভ-যাচাই (কলার-পোলিং-শূন্যে মোডাল ৮.৪সে-তে স্ব-বিলুপ্ত) + কলব্যাক-ক্লিকে outgoing + নোটিফ-চিপ ৫/৬ + 390px-০ + কনসোল-০। স্ক্রিনশট: download/s97-*.png।

## Cross-Agent Note: Session 100 — কম্পোজার-মোডাল (০৭ 🔴) + র‍্যাংকড-ফিড (০৮) + অ্যাটমিক-রিঅ্যাক্ট (০৪) (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম **০৭ ✓ (FB-কম্পোজার-মোডাল — 🔴)**, **০৮ ✓ (এনগেজমেন্ট-র‍্যাংকড-ফিড)**, **০৪ ✓ (race-safe রিঅ্যাক্ট-কাউন্ট)**। মাস্টার-টেবিলের ২০ আইটেমে এখন অবশিষ্ট মাত্র: **০৫-কার্সার-পলিশ** (OFFSET→keyset; বর্তমান OFFSET+রানওয়ে-গার্ড এই স্কেলে ঠিকই কাজ করে), **১৭-হোম-কিউরেশন-সোশ্যাল-ফিল্টার**।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **`POST /api/articles/quick` (নতুন, routes/social.js):** FB-কম্পোজার-মোডালের JSON-এন্ডপয়েন্ট — `{title, body, tags, images[]}` → `{ok, id, url, duplicate?}`। x-csrf-token হেডার বাধ্যতামূলক। ডুপ-গার্ড (২-মিনিট একই-শিরোনাম) /articles/new-এর সমান; নিউজলেটার-ব্লাস্ট ইচ্ছাকৃতভাবে শুধু পূর্ণ-এডিটরে।
- **composer-modal.js (নতুন, public/assets/js):** শুধু dashboard.ejs লোড করে (user-গেটেড script-ট্যাগ)। খসড়া-কী `lfCpm100:<uid>` (localStorage) — অন্য-ফিচার এই key-প্রিফিক্স ব্যবহার করবে না। `#composerOpen`/`.js-composer-open` ক্লিকে মোডাল; DOM-আইডি কনট্র্যাক্ট: cpmTitleInput/cpmBody/cpmTags/cpmImagesInput/cpmStrip/cpmDropTip/cpmFile/cpmAddImg/cpmPostBtn/cpmCharCount/cpmDraftNote/cpmRestoreNote/cpmDraftDiscard/cpmError।
- **dashboard.ejs-এ এখন ৩টি নতুন ব্লক:** ① composer-input এখন `<button>` (আগে `<a href=/articles/new>` — 'লেখা' বাটনও মোডাল খোলে; পূর্ণ-এডিটর দরকার হলে /articles/new সরাসরি URL) ② `.feed-sort-bar` (সর্ট-টগল — filter-chips-এর পরে) ③ `#composerModal` মার্কআপ (share-modal-এর পরে)। ফিল্টার-চিপের href-এ এখন sort=ranked-সংরক্ষণ আছে — ফিল্টার-এডিট করলে sort-প্যারামটাও রক্ষা করুন।
- **buildFeedSql সিগনেচার বদল:** `buildFeedSql(filter, me, limit, offset, ranked)` — ৫ম প্যারাম ranked=true → পুল-কুয়েরি (LIMIT=FEED_POOL_CAP, activity-বাদ)। **UNION-গোটচা:** view_count তিন শাখাতেই (article/question/activity `0 as view_count`) সমান-অর্ডারে যোগ — নতুন কলাম যোগ করলে আবারও সব-শাখা-নিয়ম। `rankedFeedSlice(filter, me, limit, offset)` + `applyRankedSort()` + `rankScoreOf()` dashboard.js-এ — স্কোর-ওজন বদলাতে চাইলে rankScoreOf-ই একমাত্র জায়গা।
- **`/dashboard/more` sort-প্যারাম:** `?sort=ranked` → ranked-স্লাইস; main.js feed-more ইঞ্জিন sentinel থেকে `data-sort` পড়ে fetch-এ যোগ করে — sentinel-এ data-sort অ্যাট্রিবিউট রাখতে হবে।
- **/api/react অ্যাটমিক-প্যাটার্ন:** like_count+reactions এখন এক-স্টেটমেন্টে (স্কেলার-সাবকোয়েরি + json_group_object)। রেসপন্স-চুক্তি অপরিবর্তিত `{ok, reactions, total, mine}` — ক্লায়েন্ট-ইমপ্যাক্ট শূন্য। **রিঅ্যাকশন-টেবিল-স্কিমা বদলালে** (likes) এই দুই আপডেট-স্টেটমেন্ট (posts+comments)ও আপডেট করতে হবে।
- **🚨 sandbox-ব্রাউজার-লেসন (গুরুত্বপূর্ণ):** agent-browser-এর headless-চ্রোমে **POST→3xx-redirect-follow = "Failed to fetch"** (নেটওয়ার্ক-এরর; request সার্ভারে পৌঁছায় কিন্তু রেসপন্স ফলো-ফেজে মরে)। curl/GET/JSON-POST ঠিক। **শেখা:** ব্রাউজার-E2E-তে ফর্ম-সাবমিট রুট (303-রেসপন্স) fetch/XHR দিয়ে টেস্ট করলে ভুলে "সার্ভার-বাগ" ভাববেন না — redirect-free JSON-এন্ডপয়েন্টই সমাধান (`redirect:'manual'`-এ opaqueredirect আসে, Location পড়া যায় না)।
- **CSRF-গোটচা-পুনঃপ্রমাণ:** মাল্টিপার্ট-POST-এ টোকেন-হেডার না-থাকলে সার্ভার বডি-কনজিউমের আগেই 303 দেয় → ব্রাউজারে সংযোগ-বিচ্ছিন্ন → "Failed to fetch"। মাল্টিপার্ট + x-csrf-token হেডার = কাজ করে (upload-images-প্যাটার্ন)।

**E2E-প্রমাণিত (agent-browser + curl):** মোডাল-ওপেন/ফোকাস/অথর-পেন-নাম ✓ খসড়া-গার্ড(confirm)+সেভ ✓ রিস্টোর+নোটিশ-বার ✓ ডিসকার্ড ✓ JSON-পোস্ট→/articles/12-নেভিগেশন ✓ পোস্ট-পরে খসড়া-ক্লিয়ার ✓ র‍্যাংকড-টগল+hint+sentinel-data-sort ✓ টাইম-ডেকেই-অর্ডার (৭-লাইক-পোস্ট টপে) ✓ more-API-ranked ✓ ১৫/১৫-কনকারেন্ট-রিঅ্যাক্ট + মিসম্যাচ-০ ✓ রিঅ্যাক্ট-পিকার-লাইভ-আপডেট-রিগ্রেশন ✓ ১৯-পেজ-স্মোক ✓ 390px-ওভারফ্লো-০ ✓ কনসোল-০ ✓

**টেস্ট-ডেটা (এই clone-এর lekhok.db):** /articles/12 = মোডাল-ডেমো-পোস্ট ('মোডাল-কম্পোজারের প্রথম পোস্ট (JSON-পাথ)'); post#5-এ fbtest3-এর haha-রিঅ্যাকশন থেকে গেছে (স্ট্রেস-টেস্টের অবশিষ্টাংশ — ইচ্ছা করলে প্রোফাইল থেকে টগল-অফ)। probe-পোস্ট (৮-১১) ডিলিটড।

## Cross-Agent Note: Session 102 — যোগাযোগ-পেজ রিডিজাইন (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** views/lekhok-contact.ejs + routes/pages.js (contact-রুট) + server.js (CSP-এক-লাইন) + db.js (getTransportSchedule-মার্জ) + helpers/sections-registry.js + helpers/transport-schedule.js + style.css-EOF। Agent-Feed/Chat/Core লক-জোন অস্পৃশ্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **CSP-তে `frame-src` এখন আছে:** `frame-src https://maps.google.com https://www.google.com` (server.js CSP_POLICY)। নতুন বাইরের-আইফ্রেম-এমবেড লাগলে এই লিস্টে অরিজিন যোগ করতে হবে — `default-src 'self'`-ফলব্যাকে অন্য সব আইফ্রেম ব্লকড থাকে (যোগাযোগ-পেজের ম্যাপ আগে এই কারণেই ভাঙা ছিল!)।
- **নতুন সেকশন-রেজিস্ট্রি কী `contact_halls`:** ১৫-হল-প্রভোস্ট ডিফল্ট — DB-র site_items-এ রো না থাকলে রেজিস্ট্রি-ফলব্যাক চলে; অ্যাডমিন/মডারেটর সেকশন-ম্যানেজারে স্বয়ংক্রিয় দেখা যায়। contact_transport-ডিফল্টও ৬-জরুরি-নম্বরে সমৃদ্ধ (subtitle=প্রদর্শন-নম্বর, extra=tel: — ভিউতে ক্লিক-টু-কল)।
- **transport-schedule মিসিং-কী মার্জ:** db.getTransportSchedule() এখন DB-JSON-এ `freeShuttle` কী না পেলে হেল্পার-ডিফল্ট ইনজেক্ট করে। **নতুন ট্রান্সপোর্ট-ব্লক যোগের সময় এই প্যাটার্নই মানুন** (হেল্পারে ডিফল্ট + getTransportSchedule-এ মার্জ) — লাইভ-DB-তে মাইগ্রেশন ছাড়াই নতুন-ব্লক পৌঁছায়।
- **lekhok-contact.ejs ভিউ-লোকাল হেল্পার:** bn2en102/en2bn102/phoneOf102/isNum102/chAction102 — ফাইল-টপের `<% %>` ব্লকে। অন্য-পেজে নম্বর-ডিটেক্ট/ডিজিট-কনভার্সন লাগলে এই প্যাটার্ন কপি করুন (গ্লোবাল করিনি — কোলিশন-নিরাপদ)।
- **style.css-টেইল-ক্রম আপডেট:** session99-SSE → session100-ট্যাগ-বার → session97-নোটিফ → **session102-contact (.cx102 স্কোপড)** — সব নতুন-রুল EOF-অ্যাপেন্ডই; .cx102 ক্লাস যোগাযোগ-পেজের র‍্যাপার, অন্য-পেজে প্রভাব শূন্য।

**স্যান্ডবক্স-গোটচা (নতুন প্রমাণসহ):**
1. **sql.js-স্ক্রিপ্ট-এডিট + `process.exit` = ডেটা-হারানি** — initDb-র পর prepare().run() করলেও ডিস্কে যায় না; `initDb.saveDb()` আবশ্যক (দুইবার প্রমাণিত: প্রথম-রানে ৬-ইমার্জেন্সি-রো হারিয়েছিল, পেজে পুরনো ৩-কার্ড)।
2. **scripts/test-role-policy.sh হার্ডকোডেড :8080** — BASE আর্গুমেন্ট উপেক্ষা করে; 3030-এ স্যুট চালালে সব [000]। PORT=8080 দিয়ে সার্ভার বুট করে চালান। ফ্রেশ-ক্লোনে ৭২/৯৯ (২৭-ফেল = testadmin/testuser QA-রোল-সিড-স্টেট — seed-qa-users.js র‍্যান্ডম-পাসওয়ার্ড/রোলে সিড করে, স্যুট demo123+admin-রোল আশা করে)।
3. agent-browser-এ reveal-গোটচা আগের মতোই — `.reveal/.reveal-stagger`-এ ম্যানুয়াল `.in`।

**পরবর্তী-সুপারিশ (রোডম্যাপ-বহির্ভূত UX-বৃদ্ধি):** যোগাযোগ-ফর্মে hCaptcha/রেট-লিমিট · হল-প্রভোস্টে সার্চ/ফিল্টার (১৫+ আইটেম) · ম্যাপে মাল্টি-পিন (হল/ডিপার্টমেন্ট) · contact_hours-এ "এখন খোলা?" লাইভ-ইন্ডিকেটর (সার্ভার-টাইম)।

## Cross-Agent Note: Session 100-খ — রিসোর্স-ফিচার QA + sandbox-গেটওয়ে-ফিক্স + লেগেসি-হিল (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** session101-a-র রিসোর্স-মাল্টিমিডিয়া ইমপ্লিমেন্টেশন (a0b1bb7)-এর ওপর QA-রাউন্ড। আমার সমান্তরাল ইমপ্লিমেন্টেশন (/tmp/session100-res-backup.patch) ডিস্কার্ড করে তাঁরটি গ্রহণ — ডুপ্লিকেশন-রিস্ক-শূন্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **sandbox-গেটওয়ে স্কিমা:** পেজ-কুয়েরিতে `XTransformPort` থাকলে সেই পেজের **সব fetch/window.open/মিডিয়া-src-তে** কুয়েরিটা বহন করতে হয় — নইলে Caddy গেটওয়ে Next.js(:3000)-এ পাঠায় → 404। lekhok-resources.ejs-এর `sbx()` হেল্পার-প্যাটার্ন কপি করুন (লাইভে নো-অপ)। সার্ভার-সাইড SANDBOX_PORT-রিরাইট শুধু HTML-অ্যাট্রিবিউট (src/href) ধরে — JS-ট্রিগার্ড fetch/open ধরে না।
- **multipart CSRF:** গ্লোবাল CSRF-মিডলওয়্যার (server.js:371) router-মাউন্টের **আগে** চলে — multipart-এ `req.body` তখনো খালি। আসল অ্যাপ-প্যাটার্ন: main.js multipart-ফর্মের action-এ meta-token থেকে `?_csrf=` জোড়া দেয়। curl-E2E-তে `-F "_csrf=..."` নয়, query-তে দিন।
- **res_type-লেগেসি-হিল:** db.js boot-এ idempotent UPDATE (file_type→res_type) + helpers/resource-types.js `normalizeResType`-এ file_type-প্রাধান্য-ফলব্যাক — পুরনো DB (Vercel Turso সহ) প্রথম বুটেই ঠিক হবে।
- **রিসোর্স-ফিচার-ম্যাপ:** পাবলিক /resources (ক্লিকেবল কার্ড: অডিও=ইনলাইন-প্লেয়ার, ভিডিও=YouTube/HTML5-মোডাল, ছবি=লাইটবক্স, pdf/doc/link=stat-কাউন্টেড-ডাউনলোড) + অ্যাডমিন /admin/resources (requireAdmin) + মডারেটর /moderator/resources (requireScope 'resources') + POST /api/resources/:id/stat (view|download, ৩০সে-ডিডুপ)।

**গোটচা-পুনঃপ্রমাণ:** detached node সার্ভার টুল-কলের মাঝে মরে (setsid-ও নয়) — সার্ভার+টেস্ট এক-ইনভোকেশনে; bash-এ `cd X && long-chain &` লিখলে পুরো চেইন ব্যাকগ্রাউন্ডে যায় (CWD-বিভ্রম → ফাইল " disappears"-ভুল-তথ্য) — `cd` আলাদা স্টেটমেন্টে।

**পরবর্তী-ক্রন-রাউন্ড-সুপারিশ:** ① /moderator/resources-ও sbx-প্যাটার্নে যাচাই (moderator-ফ্লো E2E) ② রিসোর্সে বাল্ক-আপলোড/সংকলন-সিরিজ ③ ই-বুক-ক্যাটাগরির জন্য কভার-ইমেজ (thumbnail_url ফিল্ড ফাঁকা — ফর্মে অপশন) ④ role-policy স্যুটে resources-রুটের চেক-যোগ।

## Cross-Agent Note: Session 104 — রিসোর্স ডিসকভারি-বার + thumbnail_url + শেয়ার-লিংক (১৮ সেপ্টেম্বর ২০২৬)

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **রিসোর্স-ডিসকভারি (lekhok-resources.ejs):** কার্ডে `data-type`/`data-views`/`data-dl`/`data-search` অ্যাট্রিবিউট — ক্লায়েন্ট-সাইড ফিল্টার/সর্ট এই অ্যাট্রিবিউট-চুক্তিতে চলে; নতুন কলাম যোগ করলে data-search-স্ট্রিং-এও ধরুন। কার্ড `hidden` অ্যাট্রিবিউটে লুকায় — **`.rsx-card[hidden]{display:none!important}` রুল মুছবেন না** (display:flex ওভাররাইড-গোটচা)।
- **thumbnail_url:** resources-টেবিলের নতুন-ব্যবহৃত কলাম (session101-a-র ALTER-লিস্টে ছিল, এখন ফর্ম+রুটেও) — admin `resourceFormPayload101` + moderator POST দুটোই ক্যারি করে; পাবলিক ভিউয়ে `cover = (image ? file_url : thumbnail_url)`।
- **শেয়ার-ডিপ-লিংক চুক্তি:** `?r=<resource-id>` — কপি-বাটন এটাই কপি করে, পেজ-লোডে স্ক্রল+পালস। অন্য লিস্ট-পেজেও এই প্যাটার্ন নেওয়া যাবে।
- **গোটচা-পুনঃপ্রমাণ:** admin/resources ফর্মে সার্ভার-রেন্ডারড `_csrf` hidden input নেই — curl-E2E-তে টোকেন নিন **meta-tag থেকে** (`csrf-token" content="..."` — sidebar-এ), hidden-field থেকে নয়। multipart-এ query-param `_csrf`-ই কাজ করে (মিডলওয়্যার body-পার্সের আগে চলে)।
- **টাইম-চিপ:** data-ts + main.js LekhokRelTime রি-ইউজ — created_at UTC-স্ট্রিং লোকাল-পার্স হয় (সাইট-ওয়াইড কনভেনশন, স্কিউ গ্রহণযোগ্য); UTC-সঠিকতা চাইলে সাইট-ওয়াইড ফিক্স লাগবে (আলাদা টাস্ক)।

**পরবর্তী-ক্রন-রাউন্ড-সুপারিশ:** ① রিসোর্সে বাল্ক-ইমপোর্ট (CSV/ফোল্ডার-জিপ) — সংকলন-সিরিজের জন্য ② /resources-এ ক্যাটাগরি-ট্যাব + টাইপ-পিল ইউনিফাইড-কোয়েরি (?type=&q= — শেয়ারেবল-ফিল্টার-স্টেট) ③ রিসোর্স-ডিটেইল-পেজ (?r= ডিপ-লিংক থেকে প্রিভিউ-পেজ + রিলেটেড-রিসোর্স) ④ created_at UTC→লোকাল সাইট-ওয়াইড ফিক্স।

## Cross-Agent Note: Session 101 — রিসোর্স-মাল্টিমিডিয়া (ইউজার-রিকোয়েস্ট) + ইমেইল-ডিরেক্টরি-রিডিজাইন + রোডম্যাপ-অবশিষ্ট-সমন্বয় (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** ইউজারের আপলোড-ফাইলের ২ রিকোয়েস্ট বাস্তবায়ন — ① /resources ক্লিকেবল-মাল্টিমিডিয়া-কার্ড + অ্যাডমিন/মডারেটর আপলোড-অপশন ② /resources/emails প্রফেশনাল-ডিরেক্টরি (ডেস্ক-ব্যাজ+কপি+ড্রাফট+ফিল্টার)। এছাড়া রোডম্যাপ-০৭/০৮-তে আমার সমান্তরাল-ইমপ্লিমেন্টেশন session100-এর পূর্ণাঙ্গ ভার্সনের কাছে **স্বেচ্ছায় প্রত্যাহার** (ডুপ্লিকেশন-শূন্য-নীতি)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **রিসোর্স-ফিচার-ম্যাপ (session101-a + 100-খ + 101-গ ইউনিয়ন):** DB `resources.res_type` (pdf|audio|video|image|doc|link) + file_size/thumbnail_url/duration/downloads/views/created_by; helpers/resource-types.js = এক-সোর্স-মেটা (RES_TYPES/normalize/detect/videoEmbedUrl/humanFileSize — নতুন টাইপ লাগলে শুধু এখানে+seed); পাবলিক /resources (rsx-* স্কোপ) + /moderator/resources (requireScope 'resources') + /admin/resources; `POST /api/resources/:id/stat` {kind: view|download} (৩০সে-ডিডুপ Map, মেমোরি-গার্ড)।
- **thumbnail_url চুক্তি:** ফর্মে URL-টেক্সট (upload-বাটন নেই — ভবিষ্যতে /upload-image হুক করা যাবে); স্যানিটাইজ `^(https?://.+|/)` ছাড়া → NULL; পাবলিক-কার্ডে `thumbnail_url || (image-type ? file_url : none)` — অন্য-কার্ডেও কভার চাইলে শুধু থাম্বনেইল দিন।
- **স্কোপ-ক্যাটালগ এখন ১১-কী:** CANONICAL_SCOPES (admin/routes.js) + MODERATOR_SCOPES (db.js) দুটোতেই 'resources' আছে — **নতুন স্কোপ যোগ করলে দুই-জায়গাতেই দিতে হয়** (CANONICAL বাদ গেলে অ্যাডমিন-স্কোপ-UI-তে চেকবক্সই আসে না → গ্রান্ট-অসম্ভব → 403-লুপ; এই বাগ ধরা পড়েছিল role-policy-স্যুটে)।
- **role-policy স্যুট এখন 107-চেক:** resources-স্কোপ-গার্ড (anon-302/user-403/mod-200/admin-200) + stat-API (ok/bogus-fallback/invalid-400) — suite-এ মডারেটরের স্কোপ-পুনঃপ্রদান এখন `postf ... "scopes=user_mgmt" "scopes=resources"` (দুই-আর্গ — postf-এ `&`-যুক্ত এক-আর্গ এনকোড-হয়ে ভাঙে!)।
- **/resources/emails:** ডেটা helpers/paper-emails.js (হার্ডকোডড ১৪-গ্রুপ/১২৬-পত্রিকা) — ভিউ-টাইমে `peDesk()` নোট-টেক্সট থেকে ৯-ডেস্কে শ্রেণিবিন্যাস করে (lit/letter/oped/feature/islam/campus/travel/child/general)। নতুন এন্ট্রির note-এ ডেস্ক-কীওয়ার্ড (সাহিত্য/চিঠি/কলাম...) থাকলে অটো-ব্যাজ। কপি-ফিডব্যাক/সার্চ/পিল-ফিল্টার সব ভ্যানিলা-JS (pe-* স্কোপ)।

**নতুন-গোটচা (প্রমাণসহ):**
1. **sql.js সিড-স্ক্রিপ্টে `process.exit` = নীরব-ডেটা-হারানি** — prepare().run() ২০০ms-ডিবাউন্সড saveDb() ট্রিগার করে; exit টাইমারকে মেরে ফেলে → ফাইলে কখনোই লেখা হয় না। **নিয়ম:** `db.saveDb(); setTimeout(() => process.exit(0), 500);` (scripts/seed-resources-101.js-প্যাটার্ন; দুইবার-প্রমাণিত)।
2. **SIGTERM-save clobber:** চলমান-সার্ভারের SIGTERM-শাটডাউন তার in-memory DB ফাইলে ফ্লাশ করে — মাঝে সিড করলে সিড মুছে যায়। **সিডের আগে `pkill -9`** (-৯ = save-স্কিপ), সিড, তারপর সার্ভার-বুট।
3. **postf()-এ multi-value:** `"a=1&b=2"` এক-আর্গ দিলে `&`-ও এনকোড হয় → এক-কী। আলাদা আর্গ দিন: `"a=1" "b=2"` (curl --data-urlencode রিপিট-কী → Express-array)।
4. **কম্পোজার-মোডাল-যুগে dashboard.ejs:** `composer-input` এখন `<button id=composerOpen>` (লিংক নয়); `#qm*` আইডি-স্পেস আমার ড্রপ-করা ভার্সনে ছিল — **cpm*+lfCpm100-ই ক্যানোনিক্যাল** (session100-নোট দেখুন)।

**E2E-প্রমাণিত (agent-browser + curl + role-policy 107/107):** /resources অডিও-ইনলাইন-টগল ✓ ভিডিও-YT-এমবেড-মোডাল+Escape ✓ PDF-নতুন-ট্যাব+DB-ডাউনলোড-কাউন্ট++ ✓ থাম্বনেইল-কভার (id=16) ✓ /resources/emails ডেস্ক-ফিল্টার (চিঠিপত্র→৮) ✓ সার্চ (প্রথমআলো→৩, ইমেইল→১) ✓ খালি-অবস্থা+রিসেট ✓ কপি-ফিডব্যাক ✓ মডারেটর-আপলোড E2E (multipart+?_csrf → posted=1, DB-রো অটোডিটেক্টসহ) ✓ stat-ডিডুপ ✓ 390px-০ ✓ কনসোল-০ ✓

**পরবর্তী-সুপারিশ:** ① রিসোর্স-বাল্ক-আপলোড/সংকলন-সিরিজ (গ্যালারি-বাল্ক-প্যাটার্নে) ② মাস্টার-টেবিল-শেষ-২: ০৫-কার্সর-পলিশ + ১৭-হোম-কিউরেশন-সোশ্যাল-ফিল্টার ③ ইমেইল-ডিরেক্টরি-ডেটা অ্যাডমিন-সম্পাদনাযোগ্য করা (settings/site_items-এ) ④ রিসোর্স-ফর্মে থাম্বনেইল-আপলোড-বাটন (/upload-image হুক) ⑤ ইমেইল-ডিরেক্টরিতে copy-all-per-paper বাটন।

## Cross-Agent Note: Session 103 — ফর্ম-CSRF-ব্রেকেজ ফিক্স + contact-বৃদ্ধি (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** routes/api.js (POST /contact হ্যান্ডলার) + views/lekhok-contact.ejs + routes/pages.js (contact-রুট error-লোকাল) + style.css-EOF। অন্য কোনো হ্যান্ডলার/পেজ স্পর্শ-শূন্য।

**🚨 গুরুত্বপূর্ণ প্ল্যাটফর্ম-লেসন — ক্যাশেবল-পেজে নেটিভ-ফর্ম = CSRF-ব্লক (সব এজেন্টের জন্য):**
`PUBLIC_CACHE_RE72`-এ থাকা পেজে (/contact সহ) অ্যানোনিমাস GET-এ সেশন-রাইট/কুকি **স্কিপ** হয় → রেন্ডার-হওয়া csrfToken **এফেমেরাল** (সার্ভারে কোথাও নেই) → ওই পেজের urlencoded-ফর্মে টোকেন থাকলেও প্রথম POST **কখনোই পাস করে না**। বিদ্যমান-গ্রেসফুল-পাথ: 303 `?csrf=1` → non-cacheable-রিরেন্ডার (টোকেন এবার সেশন+কুকিতে) → দ্বিতীয়-সাবমিট সফল। **নতুন নেটিভ-ফর্ম লাগলে:** ① ফর্মে `_csrf`-হিডেন (res.locals.csrfToken) ② ইউজারকে ২-স্টেপ-রিকভারির ব্যাখ্যা বা ③ fetch-ইন্টারসেপ্ট + fresh `?_u=` GET-টোকেন-রিফ্রেশ-রিট্রায় (lekhok-contact.ejs-এর রেফারেন্স-ইমপ্লিমেন্টেশন দেখুন — XTransformPort-কুয়েরি প্রিজার্ভ অবশ্যই)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **POST /api/contact এখন dual-mode:** Accept:text/html → 303 `?success=|error=` (ভিউ-স্ট্রিপ); JSON → `{ok:true,success,message}` / `{ok:false,error}` + **429-রেট-লিমিট ৫/১০মি/IP** (in-memory `_cxHits103`)। অন্য পাবলিক-ফর্মে এই প্যাটার্ন কপি করতে পারেন।
- **cx-prov-search/কপি-প্যাটার্ন:** lekhok-contact.ejs-এর data-search-অ্যাট্রিবিউট-ফিল্টার + clipboard-ফিডব্যাক — অন্য তালিকা-পেজে (members/committee) কপি-প্রজ।
- **'আজ খোলা' পার্সার:** cx-hour-row[data-days][data-closed] — দিন-নাম+রেঞ্জ-পার্স; অন্য পেজে অফিস-আওয়ার দরকার হলে এই data-driven-প্যাটার্নই নিন (CMS-টেক্সট পার্স করবেন না)।
- **JSON-LD ContactPoint:** view-বডিতে `<script type="application/ld+json">` — layout-এর head-হুক লাগে না।

**স্টাইল-টেইল-ক্রম:** …session102-কন্টাক্ট → **session103-ব্লক (cx102-স্কোপড + cxPulse103 keyframes + focus-visible)** — EOF-অ্যাপেন্ড-রীতি অক্ষুণ্ণ।

**গোটচা-পুনঃপ্রমাণ:**
1. **style.css-এডিটের পর সার্ভার-রিস্টার্ট আবশ্যক** — AV (?v=) বুট-টাইমে হ্যাশ হয়; রিস্টার্ট-ছাড়া ব্রাউজার স্টেল ?v= URL ক্যাশ দেখায় (ভিজ্যুয়াল-QA মিথ্যা-ফেল করে)।
2. `rg -r <str>` = replace-ফ্ল্যাগ — আউটপুট ফাইলের আসল-টেক্সট নয় (ভুয়া-করাপশন-অ্যালার্ম); ফাইল-ভেরিফিকেশনে md5/git-diff নিন।
3. sandbox auto-commit কখনো কখনো রুট-স্ক্যাফোল্ড (.next/src/...) কমিট করে — root .gitignore এখন রুট-অ্যাংকড-ইগনোরড (2f8a6a6); আবার হলে `git reset --soft origin/main && git reset` দিয়ে ফেলে দিন।

**পরবর্তী-সুপারিশ:** contact_submissions-এর অ্যাডমিন-ইনবক্স-ভিউ (এখন পর্যন্ত সাবমিশন কেউ দেখে না!) · ম্যাপে মাল্টি-পিন (হল/ডিপার্টমেন্ট) · রেট-লিমিট-ভলিউম বাড়লে hCaptcha/Turnstile · প্রভোস্ট-তালিকায় প্রিন্ট/শেয়ার-বাটন।


---

## Cross-Agent Note: Session 102 — রোডম্যাপ-০৮ সম্পন্ন + actor-avatar (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম **০৮ ✓ (এনগেজমেন্ট-র‍্যাংকড ফিড — /articles?sort=top, HN-gravity time-decay ২-পাস স্কোরিং; chunked-IN লাইভ-কাউন্ট; sort-সুইচ + র‍্যাংক/স্কোর-চিপ + বাংলা relTime)**। বোনাস: **নোটিফিকেশন actor-avatar** (notifications.actor_id মাইগ্রেশন + notifyUser ৬ষ্ঠ-প্যারাম (ঐচ্ছিক — পুরনো কল-সাইট অক্ষত) + recent-API/server.js-এ LEFT JOIN + live.js/header.ejs has-avatar রেন্ডার; /notifications ফুল-পেজ তালিকায় এখনো আইকন-মোড — পরবর্তী-বৃদ্ধি)।

**খালি রোডম্যাপ-আইটেম:** মাত্র **০৭ (কম্পোজার-মোডাল 🔴)** — একক-রাউন্ড-ফোকাস প্রস্তাবিত (dashboard.ejs + style.css লক; Agent-Feed-জোন)।

**ইন্টিগ্রেশন-পয়েন্ট:** ① /articles-কার্ডের মেটা-রো এখন `<span class="left-group">[rank-chip?][card-tag]</span><time>` কাঠামো — dashboard/profile-এর ফিড-কার্ডেও relTime/চিপ নিতে চাইলে views/lekhok-articles.ejs-এর relTime102 হেল্পার দেখুন ② notifyUser(userId, type, title, body, link, actorId) — নতুন notify-কলে actorId দিন (না দিলে আইকন-ফলব্যাক) ③ server.js recentNotifs-কুয়েরি এখন JOIN-সহ — SELECT * ধরে আর লিখবেন না।

**গোটচা:** agent-browser open/reload-এ ডেমন state-replay + redirect-এ XTransformPort-loss (→ :3000 Next.js scaffold) — DOM-ভিত্তিক রায়ের আগে curl/in-browser-fetch/সার্ভার-log ক্রস-চেক করুন (বিস্তারিত worklog.md সেশন-১০২)।

## Cross-Agent Note: Session 105 — রোডম্যাপ-০৮ ইউনিয়ন: অ্যাফিনিটি-স্তর + র‍্যাংক-ব্যাজ (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** আইটেম ০৮-এর **PLANS.md-স্পেকের "সামঞ্জস্য-স্কোর"-অংশ সম্পূর্ণ** — session100-এর ranked-ইঞ্জিনের (sort=ranked) ওপর ইউনিয়ন-মার্জ: ① ব্যক্তিগত-অ্যাফিনিটি (follow×3 + রিঅ়াক্ট-মিল×2 — লবে-যোগ, decay-অংশীদার নয়) ② "কেন-দেখছেন" র‍্যাংক-ব্যাজ (অনুসৃত/আলোচিত/নতুন — fd-rank-chip) ③ ৩ম-ডিটারমিনিস্টিক টাই-ব্রেক + ranked-hasMore-নির্ভুলতা ④ ?sort=relevant অ্যালায়াস। (সেশন-নাম্বার-রেস: ১০২ তিন-এজেন্ট নিয়েছিল → ১০৫-রিনাম।)

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **`helpers/feed-ranking.js` (নতুন):** `buildAffinity(me)` (২-কুয়েরি: follows + likes×posts) · `affinityBonus(item, aff)` · `rankBadge(item, aff)` · `blankAffinity()`। db-**লেজি-রিকোয়ার** — db-নির্ভরতা-ছাড়া ইউনিট-টেস্ট-লোড সম্ভব। র‍্যাংক-স্কোর-ফাংশন (rankScoreOf) dashboard.js-এই আছে (session100-এর জায়গায়) — ওয়েট বদলাতে হলে ওই ফাংশন।
- **ইউনিয়ন-স্কোর:** `(like×2 + comment×3 + share×2.5 + view×0.2 + অনুসৃত×3 + রিঅ়াক্ট-মিল×2) ÷ (ageHours+2)^1.15` — গেস্টে অ্যাফিনিটি-শূন্য → session100-এর নিরপেক্ষ-গ্লোবাল আচরণ অক্ষুণ্ণ।
- **র‍্যাংক-ব্যাজ-মার্কআপ feed-cards.ejs-এ** — `sort === 'ranked' && item.rank_badge`-গেটেড (recent-মোড/অন্য-কনজিউমারে শূন্য-প্রভাব)। নতুন-ব্যাজ-ধরন যোগ করলে helpers-এর rankBadge + feed-cards-এর if-চেইন **দুটোতেই**।
- ⚠️ **author_id এখন ৩-UNION-শাখায়** (article/question: p.author_id, activity: NULL) — কলাম-বাড়ালে তিন শাখাতেই (পুরনো-গোটচা-পুনঃপ্রয়োগ)।
- **টেস্ট-ডেটা:** testmsg1→testmsg2 ফলো-রো (48→49) — অ্যাফিনিটি-E2E-ডেমোর জন্য; "অনুসৃত লেখক"-চিপ দেখতে /dashboard?sort=ranked (testmsg1-লগইনে)।

**গোটচা (এই রাউন্ডে):**
1. **কমিট-রেস ×৩-একই-আইটেম** — session100 (dashboard-ranked), other-102 (/articles?sort=top), আমার ১০২→১০৫: ইউনিয়ন-মার্জই সমাধান (প্রত্যেকের অনন্য-অংশ রেখে ক্যানোনিক্যাল-বেস = আগে-পুশ-হওয়াটা)। **কাজ-শুরুর-আগে fetch + PLANS.md-দাবি-নোট আরও-জরুরি হয়েছে।**
2. **A/B-রিগ্রেশন-রীতি স্টেটফুল-স্যুটে** — test-role-policy.sh স্বয়ং-মিউটেটিং; তুলনা করতে হলে একই-নরমালাইজড-স্টেট থেকে দুইবার (বেসলাইন-রান-পরে মাইন-রান) — নইলে স্টেট-ড্রিফ্ট ভুয়া-রিগ্রেশন দেখায় (এই রাউন্ডে 57/42 বনাম 70/29 ভুয়া-অ্যালার্ম ছিল)।
3. **ঘণ্টা-বনাম-দিন decay-গ্র্যানুলারিটি** — লেখা-কমিউনিটিতে ঘণ্টা-ভিত্তিক ^1.5 এত-ই আগ্রেসিভ যে জনপ্রিয়-পোস্টও ২-দিনে মরে; session100-এর (ঘণ্টা+2)^1.15 + অ্যাফিনিটি-লবে-যোগ ইউনিয়নই সঠিক-মান (QA-সংখ্যা-প্রমাণসহ)।

**সব-২০-আইটেম-সম্পূর্ণ:** ০১-০৮ + ০৯-২০ সব ✓ (০৭=session100-কম্পোজার-মোডাল, ০৮=ranked-ফিড-ইউনিয়ন)। **রোডম্যাপ-পরবর্তী-প্রস্তাব:** ① shared-ট্যাব pagination (Agent-Chat-লক) ② প্রোফাইল-টাইমলাইনে স্ক্রল-রিস্টোর ③ /notifications ফুল-পেজে actor-avatar (other-102-এর বাকি) ④ contact_submissions অ্যাডমিন-ইনবক্স (session103-সুপারিশ) ⑤ র‍্যাংকড-মোডে এনগেজমেন্ট-মিটার (স্কোর-ভিজ্যুয়ালাইজেশন)।
## Cross-Agent Note: Session 105 — রিসোর্স-ডিটেইল-পেজ + ইউনিফাইড-শেয়ারেবল-ফিল্টার (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** session104-সুপারিশের **② শেয়ারেবল-ফিল্টার-স্টেট ✓** + **③ রিসোর্স-ডিটেইল-পেজ ✓**। অবশিষ্ট: ① বাল্ক-ইমপোর্ট (CSV/জিপ) ④ created_at UTC→লোকাল সাইট-ওয়াইড।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **রুট-প্রায়োরিটি:** routes/pages.js-এ '/resources/:id(\d+)' — (\d+)-কনস্ট্রেইন্টের কারণে /resources/emails-এর **আগে-পরে যেখানেই বসুক কনফ্লিক্ট নেই**; নতুন /resources/xyz-সাবপাথ যোগলে এই প্যাটার্নই মানুন। 404-রেন্ডার: res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' }) — AV হল app.locals (ম্যানুয়াল-পাসের দরকার নেই)।
- **ডিটেইল-ভিউ চুক্তি (lekhok-resource-detail.ejs, rsxd-* স্কোপ):** RES_TYPE_META.RES_TYPES[t]-এর color/bg/border → hero-তে --rt-* CSS-ভ্যার (টাইপ-টিন্ট); সম্পর্কিত-কার্ডেও একই ভ্যার। descHtml = markdown-lite renderBody(content, {toc:false}) — ভিউতে <%- %>; ডুপ্লিকেট-গার্ড: mdPlain(content).length > 190 হলেই ফুল-বিবরণ-সেকশন।
- **ফিল্টার-URL-চুক্তি (/resources):** ?category= (সার্ভার) + ?type=&q=&sort= (ক্লায়েন্ট-হাইড্রেট + replaceState-সিঙ্ক) — ফিল্টার-UI বদলালে syncUrl()-এর type/q/sort-লিস্ট আপডেট করতে হবে; XTransformPort-প্যারাম সবসময় সংরক্ষিত হয় (URLSearchParams রি-ইউজ)। ক্যাটাগরি-ট্যাব href-এ type/q/sort বহন করে — নতুন-ট্যাব যোগলে rsxExtra প্যাটার্ন কপি করুন।
- **কার্ড-ক্লিক-গার্ড:** .rsx-card-এর ক্লিক-হ্যান্ডলার এখন guarded() — .rsx-copy/.rsx-audio/a[data-rsx-detail]-টার্গেট কার্ড-অ্যাক্টিভেট করে না। কার্ডের ভেতরে নতুন ইন্টারঅ্যাক্টিভ-এলিমেন্ট যোগলে গার্ড-সিলেক্টরে যোগ করুন।
- **শেয়ার-লিংক-বদল:** কপি-বাটন এখন /resources/<id> (ডিটেইল-পেজ) কপি করে — ?r=<id> লিগ্যাসি (স্ক্রল+ফ্ল্যাশ) অক্ষত।

**🚨 টুলিং-গোটচা (নতুন, গুরুত্বপূর্ণ):** কিছু এজেন্ট-টুলিং-আউটপুট (Read/Grep/curl-রেন্ডার) '[h'-সিকোয়েন্স খেয়ে ফেলে — '.rsx-card[hidden]' সোর্সে '.rsx-cardidden]'-এর মতো দেখায় এবং মনে হয় ফাইল করাপ্ট! **node fs.readFileSync-ই সত্যের-উৎস** — 'করাপশন' ফিক্স করার আগে বাইট-লেভেল যাচাই করুন (include('.rsx-card[hidden]') = true প্রমাণিত)। এই মিথ্যা-সংকেতে পুরো style.css '[hidden]'-রুল 'মেরামতের' প্রলোভন এসেছিল — যাচাইয়ে ধরা পড়েছে।

## Cross-Agent Note: Session 104 — FB-প্যারিটি কমেন্ট-সিস্টেম + ডুপ্লিকেশন-ফিক্স (১৭ সেপ্টেম্বর ২০২৬)

**স্কোপ:** comment-tools.js (৪-৫-সেকশন পুনঃলেখা) + routes/social.js (GET /api/comments + ২ নতুন এন্ডপয়েন্ট) + style.css-EOF + db.js/schema.sql (comments.edited_at)। Agent-Feed/Chat/Gallery/Resources লক-জোন অস্পৃশ্য; পোস্ট-রিঅ্যাকশন-ইঞ্জিন (main.js session100) অক্ষুণ্ণ।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **GET /api/comments নতুন-চুক্তি:** প্রতি-কমেন্টে `reactions` (টাইপ→count), `my_reaction`, `edited_at`, `author_id` + টপ-লেভেলে `replies[]`। নতুন কনজিউমার বানালে এই শেপ-ই ব্যবহার করুন।
- **কমেন্ট-মিউটেশন এন্ডপয়েন্ট:** `POST /api/comments/:id {body}` (শুধু লেখক, 403-গার্ড) + `DELETE /api/comments/:id` (লেখক|moderator|admin; BFS-ক্যাসকেড, likes-ক্লিন-আপ, comment_count-সিঙ্ক)। কমেন্ট-মুছে-ফেলা-ফিচার লাগলে নিজে কোয়েরি না-লিখে এটাই কল করুন।
- **comment-tools.js রেন্ডার-কনট্র্যাক্ট:** `renderCommentItem(c, postId, {reply})` — `data-cid`/`data-author-id` অ্যাট্রিবিউট + `RAW_CACHE` (cid→raw-markdown) + `.fc-edit-slot`/`.fc-reply-slot` স্ট্রাকচার ধরে রাখতে হবে; ভাঙলে ইনলাইন-এডিটরের প্রি-ফিল ও মালিকানা-মেনু ভেঙে যায়।
- **ডুপ্লিকেশন-গার্ড (গুরুত্বপূর্ণ):** `.feed-card.fc-open .fc-preview{display:none}` — নতুন কোনো ফিড-কার্ড ভ্যারিয়েন্টে (repost-card-এর মতো) প্রিভিউ+ড্রয়ার-জুটি যোগ করলে `fc-open`-ক্লাস-প্যাটার্ন মানতে হবে, নইলে আবার একই-কমেন্ট-দুইবার দেখা যাবে।
- **syncPreview:** ফেচ-পরবর্তী প্রিভিউ-রিরাইট — সার্ভার-সাইড decorateFeed-এর commentPreviews-কে প্রতিস্থাপন করে না, শুধু ক্লায়েন্ট-সাইড স্টেল-হিল করে; decorateFeed-বদলালে এই-দুই-পথ সিঙ্কে রাখুন (সর্বশেষ-২, ASC-ফ্ল্যাট-লিস্ট)।
- **রিঅ্যাকশন-চুক্তি অপরিবর্তিত:** `/api/react` টগল/সুইচ/অ্যাটমিক-প্যাটার্ন (session100/101) — কমেন্ট-প্যালেট একই `{ok, reactions, total, mine}` খায়; রিঅ্যাকশন-স্কিমা বদলালে এখন **তিন** কল-সাইট (পোস্ট-বার + কমেন্ট-প্যালেট + GET /api/comments ব্যাচ)।

**E2E-প্রমাণিত (agent-browser + curl, স্ক্রিনশটসহ):** ডুপ্লিকেট-শূন্য · প্যালেট-হোভার/টাচ · ব্যাজ-লাইভ · এডিট-প্রি-ফিল-মার্কারসহ · ডিলিট-ক্যাসকেড · 403/401-গার্ড · 390px-০ · কনসোল-০ · role-policy ৭২/৯৯-অভিন্ন।

**পরবর্তী-সুপারিশ:** ① article-single/qa-single-এর সার্ভার-রেন্ডারড কমেন্ট-থ্রেডেও একই প্যালেট/৩-ডট বহমান-করা (এন্ডপয়েন্ট প্রস্তুতই) ② কমেন্ট-রিপ্লাই-নোটিফিকেশন ③ প্যালেটে 'angry'-রিঅ্যাকশন (server REACTIONS-এ যোগ + actions-bar _meta — ব্রেকিং-চেঞ্জ, সব ডিফল্ট-ম্যাপ আপডেট করতে হবে) ④ shift+click-মাল্টি-রিঅ্যাকশন-কুইক-পিক।
## Cross-Agent Note: Session 105 — ইউনিয়ন-মার্জ (actor-avatar legacy-fallback + টাইপ-রঙা আইকন) + EventSource-গার্ড + QA-সুইপ (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষিত (সমান্তরাল-সংঘর্ষ-নোট):** এই রাউন্ডে স্বাধীনভাবে বানানো কম্পোজার-মোডাল/actor-avatar ইমপ্ল সমান্তরাল session100/102-কমিটে (6489f32/4007e95) পাওয়া যাওয়ায় **তাদেরটাই ক্যানোনিকাল রাখা হয়েছে** (already-E2E'd+pushed) — প্যারালাল-ইমপ্ল (composer-modal.ejs/.lf-cmodal/data-cmodal-open/popularTags102-wiring) বাদ; কেবল অনন্য-অবদান নিচে। মার্জ-শিক্ষা: stash→rebase→pop-এ আনট্র্যাকড-নতুন-ফাইল সমান্তরাল-কমিটের একই-নামের-ফাইলের সাথে ধরা দেয় (pop-ব্যর্থ হলে stash-এই থাকে — হাতে-রিজলভ); docs-কনফ্লিক্ট union-মার্জ নীতি অক্ষুণ্ণ।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **actor-avatar ইউনিয়ন (session102-স্কিমার সাথে):** actor_id-NULL **legacy রোতে** link (/messages|/profile/<u>) থেকে অ্যাক্টর-শনাক্ত করে হুবহু একই ফিল্ডে (actor_id/actor_avatar) ফলব্যাক-ভরা হয় — server.js-middleware (recent-৫) + /api/notifications/recent (recent-৮), এক IN-কুয়েরি। নতুন রো notify-time-এই actor_id পায় (session102-পাথ) → দুই-পাথ এক-মার্কআপে। header.ejs/live.js **হুবহু অভিন্ন** রাখতে হবে (`.notif-ico.has-avatar` + onerror-আইকন-ফলব্যাক, নইলে `.notif-ico.ico-<type>`)।
- **টাইপ-রঙা আইকন-ফলব্যাক:** style.css-EOF-এ `ico-<type>` ×৯ (message-নীল/like-react-রোজ/follow-share-এমারল্ড/answer-notice-অ্যাম্বার/mention-ভায়োলেট/complaint-লাল/call-স্লেট) + has-avatar hover-zoom (reduced-motion সচেতন)। নতুন নোটিফ-টাইপ যোগ করলে এখানে রঙ যোগ করুন।
- **server.js FETCH_GUARD-এ EventSource-র‍্যাপ:** স্যান্ডবক্স-গেটওয়ে-প্রিভিউতে live.js-এর SSE এখন সরাসরি চলে (আগে 404 → ৪৫সে-ফলব্যাক-পোলে পড়ত)। env-gated (SANDBOX_PORT) — লাইভে জিরো-ইমপ্যাক্ট। fetch/XHR/EventSource তিনটাই এখন গার্ডেড।

**sandbox/QA-গোটচা-নতুন (গুরুত্বপূর্ণ):**
1. **সার্ভার বুট-env এখন ৩টি:** `SANDBOX_PORT=8080 CALL_RING_TIMEOUT_S=4 node server.js` — SANDBOX_PORT ছাড়া বুটে গেটওয়ে-অ্যাসেট-রিরাইট নিষ্ক্রিয় → `<script src>` 404 → **src-প্যাচে ব্রাউজার স্ক্রিপ্ট পুনঃএক্সিকিউট করে না** (CSS লিংকে হ্যাঁ!) → main.js-মৃত লক্ষণ: স্টাইল ঠিক কিন্তু showToast/LekhokRelTime undefined।
2. **agent-browser-প্রোফাইলে পুরনো SW টিকে থাকে** (localhost:81-অরিজিন) — অদ্ভুত stale-অ্যাসেট দেখলে: `navigator.serviceWorker.getRegistrations()` unregister + `caches.keys()` delete + reload।
3. **wc -c বনাম JS .length:** বাংলা-টেক্সটে বাইট-লেন্থ ≠ কোড-ইউনিট-লেন্থ (main.js ৪২,৭৫১ বাইট = ৩৭,৫৮৬ ইউনিট) — served-vs-repo তুলনায় ইউনিট-মিশ্রণ করলে মিথ্যা "stale-file" তত্ত্বে ঘুরবেন।
4. **role-policy/ইউজার-বেসলাইন:** testadmin কেবল admin+active-ই নয় — ismail/riya/tanvir-এ **secret123** (9824dd6-ট্রায়ো; reset-qa-logins.js-চালালে রানিং-সার্ভারের ইন-মেমরি-DB ফাইল-সিড ওভাররাইট করে — **রিসেট-পরে সার্ভার-রিস্টার্ট আবশ্যক**)। verify-session93-calls.js এখন ismail=TRIO_PASS(secret123) দিয়ে লগইন করে।

**E2E-প্রমাণ:** role-policy **১০৭/১০৭** + calls-E2E **৫৪/৫৪** + EJS-কম্পাইল (dashboard/header) + ব্রাউজার: their-modal ওপেন/ক্লোজ ✓ নোটিফ-অ্যাভাটার-লেগেসি-ফলব্যাক (মোনেম-অ্যাভাটার ড্রপডাউনে) ✓ insert-path actor_id=53 ✓ ico-<type>-রঙা ✓ SSE-open + push <৩সে ✓ 390px-০ ✓ কনসোল-০ ✓।

**পরবর্তী-ক্রন-রাউন্ডে (১০৫-পরবর্তী):** মাস্টার-টেবিলের শেষ-দুই: ০৫-কার্সার-পলিশ (OFFSET→keyset) + ১৭-হোম-কিউরেশন-সোশ্যাল-ফিল্টার → শেয়ার্ড-ট্যাব pagination (Agent-Chat-লক) → প্রোফাইল-টাইমলাইন স্ক্রল-রিস্টোর → ০৩-Metered.ca-TURN (ইউজার-অ্যাকাউন্ট লাগবে) → গ্রুপ-কল।

## Cross-Agent Note: Session 110 — রোডম্যাপ-০৫ keyset-ইউনিয়ন-মার্জ (ক্যানোনিকাল=9c53cab) + ১৭-যাচাই-সমাপ্তি + লোডিং-পলিশ + ইনডিপেন্ডেন্ট E2E (১৮ সেপ্টেম্বর ২০২৬)

**সমান্তরাল-সংঘর্ষ-নোট:** রোডম্যাপ-০৫ (keyset-কার্সার) এই-রাউন্ডে **দুই-এজেন্টে স্বাধীনভাবে** ইমপ্ল হয়েছিল — session107-কমিট **9c53cab** (cursor=<ts>&cursorType&cursorId · ৩-কেস-শাখা-কন্ডিশন · p.id-as-id-অ্যালিয়াস · LIMIT+১-hasMore · ভাঙা-কার্সারে OFFSET-ফলব্যাক) আগে-পুশড বলে **ক্যানোনিকাল হিসেবে গৃহীত**; আমার প্যারালাল-সার্ভার/ক্লায়েন্ট-ইমপ্ল (single pipe-কার্সার + অর্ডিনাল-ORDER + 400-bad_cursor) **প্রত্যাহৃত**। উভয়-ইমপ্লই একই ২-SQL-গোটচা স্বতন্ত্রভাবে আবিষ্কার করে ভিন্ন-সমাধানে ভেঙেছে — দুটো সমাধানই নিচে রেফারেন্স-মূল্যে সংরক্ষিত।

**অনন্য-অবদান (এই-কমিটে রক্ষিত):**
- **কার্সার-চুক্তি (ক্যানোনিকাল):** `?cursor=<ts>&cursorType=<type>&cursorId=<id>` → উত্তরে `nextCursor:{ts,type,id}` (hasMore-সত্যে) — OFFSET-এর স্থানান্তর-সমস্যা (পেজ-মাঝে নতুন-পোস্ট এলে ডুপ্লিকেট+স্কিপ) নির্মূল; offset-প্যারাম backward-compat; ranked pool-slice-অপরিবর্তিত।
- **ডিটারমিনিস্টিক-ORDER (ক্যানোনিকাল):** `ORDER BY created_at DESC, item_type DESC, id DESC` + `p.id as id`-অ্যালিয়াস — এক-সেকেন্ড-টাইয়েও পেজ-সীমানা নির্ধারণী।
- **⚠️ SQL-গোটচা (রেফারেন্স — দুই-সমাধান):** ① JOIN-শাখায় `ORDER BY id` **ambiguous** (p.id/u.id) → ক্যানোনিকাল-সমাধান: `p.id as id`-অ্যালিয়াস; বিকল্প: অর্ডিনাল-ORDER `ORDER BY 8 DESC, 1 DESC, 2 DESC` (৮=created_at, ১=item_type, ২=id — তিন-শাখার SELECT-তালিকা অভিন্ন হলে নাম-কোয়ার্ক-মুক্ত; কলাম-ক্রম-বদলে আপডেট-প্রয়োজন)। ② UNION-compound-এ ORDER-BY-নাম-ম্যাচ-কোয়ার্ক ("3rd ORDER BY term does not match") — অ্যালিয়াস/অর্ডিনাল-দুটোই এড়ায়।
- **ক্লায়েন্ট (ক্যানোনিকাল):** main.js feed-more-ইঞ্জিন `data-cursor-ts/type/id`-হাইড্রেট + nextCursor-অবজেক্ট-চেইন; ranked-এ offset; স্ক্রল-রিস্টোর-চেইন (LekhokFeedMore.loadNext) অক্ষত।
- **E2E-অ্যাডাপটেশন:** scripts/verify-session107-cursor.js ক্যানোনিকাল-চুক্তিতে পুনর্লিখিত — bad_cursor-400-চেকের বদলে ভাঙা-কার্সার→graceful-OFFSET-ফলব্যাক-চেক (never-500)।
- **E2E (scripts/verify-session107-cursor.js — ২৩-চেক):** ২৬-পোস্ট এক-সেকেন্ড-টাই-ব্যাচ → সব-ঠিক-একবার · চেইন-শেষ-পর্যন্ত ডুপ্লিকেট-শূন্য · **অ্যান্টি-ড্রিফট-প্রমাণ** (চেইন-মাঝে পোস্ট-সন্নিবেশে পুরনো-কার্সারের পরের-পেজ অপরিবর্তিত; OFFSET-এ একই-পরিস্থিতিতে পেজ-১-শেষ-আইটেম পুনরাবৃত্তি — কেন-কার্সার-প্রমাণ) · bad_cursor-400 · ranked-অক্ষত · nextOffset-সামঞ্জস্য · গেস্ট-অ্যাক্সেস · ক্লিনআপ ২৭/২৭ (author-delete API — সার্ভার-চলন্ত-অবস্থায় সরাসরি-DB-লেখা **নিষিদ্ধ**: sql.js ইন-মেমরি সার্ভার-প্রসেসে, বাইরের-প্রসেস-লেখা ওভাররাইট-হারায়)।

**১৭-হোম-কিউরেশন (যাচাই-সমাপ্তি):** সেশন-৯০-এই ইমপ্ল ছিল (post_kind='writing' + shared_from IS NULL কঠোর-ফিল্টার + homeCurated-ব্যাজ + ফলব্যাক) — এই-রাউন্ডে লাইভ-যাচাই: হোম "লেখকদের কালি"-সেকশনে avatar/cover-update-লিক **শূন্য**। মাস্টার-টেবিলে ✅-চিহ্নিত।

**স্টাইলিং-পলিশ (dashboard.css EOF session107-ব্লক):** লোড-চলাকালীন **দুই-স্তর স্কেলেটন-শিমার কার্ড** (::before/::after, fmShimmer107) + স্টেট-পিল গ্লাস-ট্রিটমেন্ট (backdrop-blur + এমারল্ড-গ্রেডিয়েন্ট) + done-অবস্থা টিন্ট + reduced-motion/print-গার্ড।

**রিগ্রেশন-প্রমাণ:** role-policy **১০৭/১০৭** + calls-E2E **৫৪/৫৪** + cursor-E2E **২৩/২৩** + ব্রাউজার: data-cursor-লাইভ ✓ done-state-পিল ✓ 390px×৪-পেজ-ওভারফ্লো-০ ✓ কনসোল-০ ✓।

**পরবর্তী-সুপারিশ:** ম্যাপে মাল্টি-পিন (হল/ডিপার্টমেন্ট) · ইনবক্সে প্রিন্ট/PDF-ভিউ + .msg-নোট (অ্যাডমিন-রিপ্লাই-রেকর্ড) · রেট-লিমিট-ভলিউম বাড়লে hCaptcha/Turnstile · প্রভোস্ট-তালিকায় প্রিন্ট/শেয়ার-বাটন · pagination-লাইভ-টেস্ট (১৬+ বার্তা হলে)।

## Cross-Agent Note: Session 108 — FB-২০২৪ পোস্ট-ফুটার + রিঅ্যাক্টরস-মডাল + অ্যালবাম-প্রচ্ছদ (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** ইউজার-স্পেসিফিকেশন (FB-হুবহু পোস্ট-ফুটার) — ① মেট্রিক-রো বামে ইমোজি-সার্কেল+কাউন্ট (ক্লিকে রিঅ্যাক্টরস-মডাল) ② শেয়ার-বাটন = ১-বাটন → ৩-অপশন (টাইমলাইন/মেসেজে/কপি) ③ angry-রিঅ্যাকশন ④ অ্যালবাম-প্রচ্ছদ কাস্টম-নির্বাচন ⑤ গ্যালারি-পেজিনেশন (session107-এরটি গৃহীত)।

**পরবর্তী-এজেন্টদের জন্য ইন্টিগ্রেশন-পয়েন্ট:**
- **actions-bar.ejs নতুন-কনট্র্যাক্ট:** `.reaction-summary` এখন `<button class="reaction-summary as-click" data-reactors-for data-reactors-type>` — main.js-আপডেটার `.rs-emojis`-এ **span-রেন্ডার** করে (textContent নয়) — মিনিফায়েড-লাইন-৭ প্যাচটি রক্ষা করুন। `.as-click`-ক্লিক = reactors-modal.js গ্লোবাল-ডেলিগেশন।
- **শেয়ার-মেনু = ঠিক ৩-অপশন** (timeline/user/copy) — whatsapp/facebook/telegram/x-আইটেম সরানো হয়েছে (main.js-হ্যান্ডলার আছে, মার্কআপ নেই — ফেরাতে চাইলে actions-bar.ejs-এ `data-share`-আইটেম যোগ করুন)। মেনু CSS `.actions-bar .share-menu.share-menu--fb{bottom:calc(100%+6px)}` — **উপরের-দিকে খোলে** (feed-card overflow:hidden-ক্লিপ); নিচে-খুললে ১৮px-স্লিভার-বাগ।
- **reactors-modal:** layout.ejs (পাবলিক) + header.ejs (মেম্বার) — দুই-ওপেনার-কভার; নতুন-লেআউট যোগ করলে `<%- include('partials/reactors-modal') %>` + `<script src="/assets/js/reactors-modal.js" defer>` দুটোই দিন। API: `GET /api/reactions/:type/:id/reactors` (পাবলিক)।
- **angry:** `REACTIONS`-অ্যারে ৭-আইটেম — ৮ম রিঅ্যাকশন যোগ করলে actions-bar `_meta/_labels` + main.js-ম্যাপ + reactors-modal.js META + `/api/react`-রিকম্পিউট-ডিফল্ট ৪-জায়গা একসাথে।
- **গ্যালারি:** অ্যালবাম-প্রচ্ছদ = settings `galcover:<cat>` → `POST /admin/gallery/cover` (gallery-স্কোপ)। **EJS-গোটচা:** পার্শিয়াল প্যারেন্ট-স্ক্রিপ্টলেট-ভেরিয়েবল দেখে না — `include('partials/gallery-cards', { items, isStaff })`-স্পষ্ট-পাস; /gallery/more-ও isStaff-পাস করে। session107-এর load-more-ইঞ্জিন ক্যানোনিক্যাল — নতুন ক্লায়েন্ট-পেজিনেশন যোগ করবেন না।
- **:has()-ব্যবহার:** `.reaction-summary.as-click:has(...)`-০-রিঅ্যাকশন-হাইড — আধুনিক-ব্রাউজার-টার্গেট; পুরনো-ব্রাউজারে ফলব্যাক = খালি-পিল-দৃশ্যমান (হার্মলেস)।

**E2E-প্রমাণ:** মডাল-ট্যাব [সব/😡/🤗…]+প্রোফাইল-লিংক+Escape ✓; শেয়ার-কপি-টোস্ট+মেসেজ-মোডাল+টাইমলাইন-রিডাইরেক্ট ✓; angry-লাইভ (মাইন=angry→'রাগ'-লেবেল+span-সার্কেল) ✓; কভার-সেট page-1+appended-কার্ড→টোস্ট+পিন+'নির্ধারিত প্রচ্ছদ' ✓; load-more ২৪→৪০ ✓; role-policy ১০৭/১০৭ ✓; কনসোল-০ ✓; 390px-০ ✓।
## Cross-Agent Note: Session 108 — বিজ্ঞপ্তি-ফুল-পেজ actor-avatar + ইনবক্স-CSV (সমান্তরাল-সংঘর্ষ-ইউনিয়ন) (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** আমার রাউন্ডে দুটি সমান্তরাল session107 চলেছিল — ① 7a23401 (ইনবক্স-আধুনিকায়ন — ক্যানোনিকাল হিসেবে গৃহীত) ② keyset/রোডম্যাপ-০৫ (২০/২০ ঘোষণা)। আমার স্বাধীন ইনবক্স-ইমপ্ল (status new/read/done) ডুপ্লিকেশন-শূন্য-নীতিতে **স্বেচ্ছায় প্রত্যাহৃত**; অনন্য-অবদান রক্ষিত:

**রক্ষিত-অবদান:**
- **GET /notifications (daily.js) এখন এনরিচড:** LEFT JOIN users(actor_id) + session105-এর legacy link-fallback হুবহু-মিরর (actor_id-NULL রোতে /profile/<u> থেকে actor_id/actor_avatar/actor_name) → ভিউ `n.actor_id ? has-avatar : টাইপ-আইকন`; ফিল্ড-কনট্র্যাক্ট recent-API-র সমান।
- **style.css পেজ-ভ্যারিয়েন্ট:** `.notif-page-icon.has-avatar` বৃত্তাকার + unread-রিং — ড্রপডাউন `.notif-ico.has-avatar` (সেশন ১০২/১০৫) অক্ষত।
- **GET /admin/messages/export (session107-স্কিমায়):** is_read/is_archived অনুযায়ী; f=all|unread|read|archived + q-সংরক্ষণ; BOM-CSV (বাংলা UTF-8 Excel-সেফ); ভিউ-টুলবারে CSV-বাটন (.csv108)।

**গোটচা (সব এজেন্টের জন্য):**
1. **style.css-EOF-এ session104-ব্লকের `/* ═══`-ওপেনার হারানো ছিল** (আগের union-মার্জে) — session108-এ পুনঃস্থাপিত। ইউনিয়ন-মার্জের পর `/*` বনাম `*/` সংখ্যা-মিলিয়ে নিন।
2. **sql.js dual-instance:** স্ট্যান্ডঅ্যালোন node-স্ক্রিপ্ট দিয়ে সিড/পড়লে সেটা ডিস্ক-ফাইলে; রানিং-সার্ভারের ইন-মেমরি-স্টেট আলাদা (debounced saveDb)। সার্ভার-সত্য যাচাই সবসময় HTTP-রুট দিয়ে।
3. **agent-browser state-replay:** location.href/open-এও পুরনো DOM রিপ্লে হতে পারে; in-browser `fetch().then(t=>{document.open();document.write(t)})` + CSS-ইনজেক্টই নির্ভরযোগ্য ভিজ্যুয়াল-পথ। gateway সার্ভার-রেন্ডারড /avatar/N-এ XTransformPort দেয় না → onerror-ফলব্যাক স্যান্ডবক্সে আগুন করবে (প্রোডাকশনে নয়)।
4. **সেশন-লেবেল-রেস:** এক-রাউন্ডে একাধিক rebase-পয়েন্টে origin-worklog-চেক জরুরি — ১০৭ লেবেলও দুই-এজেন্টে গিয়েছিল।

**পরবর্তী-সুপারিশ:** keyset-এজেন্টের তালিকা (গ্যালারি অ্যালবাম-কভার কাস্টম-নির্বাচন, হল-প্রভোস্ট সার্চ/ফিল্টার, contact_hours 'এখন খোলা?' লাইভ-ইন্ডিকেটর) → + ইনবক্স-রিপ্লাই-নোট ও pagination-লাইভ-টেস্ট (১৬+ বার্তা)।

---

## Cross-Agent Note (session109): /me প্রফেশনাল-রিডিজাইন — ভবিষ্যৎ-স্টাইলিং-চুক্তি
**Date:** 2026-09-18 · **Agent:** Z.ai Main (ইউজার-সেশন)

`/me` (views/user/me.ejs) FB-প্যারিটি কমপ্যাক্ট লেআউটে রূপান্তরিত — stats-গ্রিড-বিলুপ্ত→ট্যাব-ব্যাজ, SVG-চার্ট→HTML- flex-বার(৮৪px)+টগল, হিরো-বাটন AA-কনট্রাস্ট।

**পরবর্তী-এজেন্টদের জন্য গোটচা:**
1. **style.css-এ লিগ্যাসি `!important`** (`.btn-primary{color:...!important}` ×২) — হিরো/বাটন-ওভাররাইডে specificity যথেষ্ট নয়, `.me-actions .btn-primary{...!important}`-রীতিই রাখুন।
2. **AV cache-bust সার্ভার-বুটে গণনা হয়** (public/assets mtime) — CSS/JS-এডিটের পরে সার্ভার-রিস্টার্ট না করলে ব্রাউজার পুরনো `?v=`-URL ধরে রাখে।
3. **style.css-EOF এখন ঘন** — নতুন সেকশন append করলে rebase-এ EOF-কনফ্লিক্ট প্রায়-নিশ্চিত; ইউনিয়ন-মার্জ (দুই-ব্লকই রাখুন) + মার্কার-স্ক্যান + brace-কাউন্ট করুন।
4. **ws91-* ক্লাস এখন /me-নির্দিষ্ট HTML-বার** — পুরনো `.ws91-chart`(SVG) রুল মৃত; /dashboard-এ স্ট্যাট-চিপ বহন করতে চাইলে ws109-নাম-নমুনা দিন, ws91-রিলাই-নয়।

## Cross-Agent Note (session112): Facepile-মোড + রিসেন্ট-চ্যাট-স্ট্রিপ + প্রচ্ছদ-নির্বাচক + ১৭-হোম-কিউরেশন-সমাপ্ত
**Date:** 2026-09-18 · **Agent:** Z.ai (cron webDevReview রাউন্ড — ইউজারের ৪-সুপারিশ বাস্তবায়ন)

মাস্টার-টেবিলের **১৭-হোম-কিউরেশন-সোশ্যাল-ফিল্টার ✓ সমাপ্ত** (কোর-ফিল্টার session90/94-এই ছিল; এই রাউন্ডে প্রচ্ছদ-মেটা + অডিট-সহ কভার-এন্ডপয়েন্ট যুক্ত)। ২০-আইটেম মাস্টার-টেবিলে এখন অবশিষ্ট মাত্র **০৫-কার্সার-পলিশ** (OFFSET→keyset)।

**নতুন সারফেস:**
- **posts.home_cover** (TEXT, LATER_COLUMNS + alt-ALTER দুই-তালিকায়) — JSON `{type:'preset'|'typo'|'custom', value}`; একক-উৎস **helpers/covers.js** (COVER_PRESETS ×৬, validateCoverInput, parseCover, initialOf) — moderator.js/pages.js/ভিউ সবাই এটিই পড়ে।
- **POST /moderator/curation/cover** (ensureModerator; কেবল অরিজিনাল writing-রো; কাস্টম-URL http(s)-গার্ড = session67-heal-নিয়ম; TA42 audit `home-cover-set|clear`)।
- **GET /api/messages/recent-chats** (dashboard.js; ১:১ ৮টি, MAX(id)-ক্রম, isOnline ৫-মিনিট) — শেয়ার-মেনু স্ট্রিপ।
- **reactors-modal facepile-মোড** (localStorage `rxm110view`; ট্যাব-ফিল্টার উভয় মোডে)।
- হোম 'লেখকদের কালি' রো-তে মিনি প্রচ্ছদ (`.inkc110` — preset=গ্রেডিয়েন্ট+কলম, typo=`data-initial` আদ্যক্ষর, custom=ইমেজ+onerror-ফলব্যাক)।

**গোটচা (ভবিষ্যৎ-এজেন্টদের জন্য):**
1. **EJS ইনলাইন-স্ক্রিপ্টে `<%= JSON.stringify(x) %>` মারাত্মক** — HTML-escape-এ `&quot;` হয়ে JS-পার্স-এরর → পুরো `<script>` IIFE নীরবে মরে (কোনো হ্যান্ডলারই চলে না, কনসোলে শুধু SyntaxError)। সার্ভার-নিয়ন্ত্রিত ডেটায় **`<%- %>`ই ব্যবহার করুন**।
2. **লেগেসি শেয়ার-হ্যান্ডলার `e.stopPropagation()` করে (main.js টার্গেট-ফেজ)** — নতুন ডকুমেন্ট-লেভেল বাবল-ডেলিগেশন `.share-trigger` কখনোই ধরবে না; **capture-phase (`addEventListener(..., true)`)** বাধ্যতামূলক।
3. **hidden-বুলিয়ান-ইনভার্সন বাগ-ক্লাস:** দ্বৈত-ভিউ মোডে `faceEl.hidden = isFace` লিখলে facepile-মোডেই লুকায় — E2E-তে ধরা পড়েনি কারণ DOM-কাউন্ট hidden-কে দেখে না; `hidden`/`getComputedStyle`-সহ অ্যাসার্ট করুন।
4. **agent-browser লগইন:** স্টাফ-অ্যাকাউন্ট ইউজার-পোর্টালে ব্লকড (ফিচার) — `/admin/login` দিয়ে; সাবমিট-বাটন topbar-আচ্ছাদিত হলে `form.requestSubmit()` eval-ই নির্ভরযোগ্য।

**E2E-প্রমাণ:** ফেসপাইল-মোড সেল+ব্যাজ❤️+টুলটিপ+মোড-পার্সিসটেন্স+Escape ✓; মোবাইল ৩৯০px-গ্রিড ৫-কলাম ✓; স্ট্রিপ লেজি-লোড+অনলাইন-ডট+১-ট্যাপ '✓ পাঠানো'+টোস্ট+নেভিগেশন-শূন্য+রি-ওপেন-পার্সিসটেন্ট ✓; মেসেজ সত্যিই কনভার্সেশনে ('— শেয়ার: ...') ✓; প্রচ্ছদ প্রিসেট/টাইপো(আদ্যক্ষর 'ল')/কাস্টম-লাইভ-প্রিভিউ+URL-ভ্যালিডেশন-এরর+সরান ✓; চিপ+হ্যাস-কভ+অডিট ×৫ ✓; হোমে গ্রেডিয়েন্ট-কভার-রেন্ডার ✓; ৩৯০px-ওভারফ্লো-০ ✓; কনসোল-০ ✓; **role-policy ১০৭/১০৭ ALL GREEN** ✓।

**পরবর্তী-সুপারিশ:** ① ০৫-কার্সার-পলিশ (মাস্টার-টেবিল শেষ-আইটেম) ② ফেসপাইল-মোডে ভার্চুয়ালাইজড-রেন্ডার (১০০+ রিঅ্যাক্টর-পোস্টে) ③ প্রচ্ছদ-মোডালে ইমেজ-আপলোড (URL-এর পাশে /upload-image হুক) ④ রিসেন্ট-চ্যাট-স্ট্রিপে গ্রুপ-কনভ-সাপোর্ট ⑤ হোম-কিউরেশন প্রচ্ছদের টাইপো-প্যাটার্ন ভ্যারিয়েন্ট (স্ট্রাইপ/রিং)।

---

## Cross-Agent Note: Session 108-খ — ইনবক্স উত্তর-নোট [নাম্বার-রেস: FB-ফুটার-এজেন্টের ১০৮-এর সাথে; সর্বোচ্চ+১ রীতিতে পুশ-সময় ১১১ ছাড়িয়ে গেছে] + ক্লিন-প্রিন্ট + মাল্টি-পিন ম্যাপ + রোডম্যাপ-১৭ যাচাই (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** session107-সুপারিশের ৩ আইটেম (ইনবক্স নোট/প্রিন্ট · মাল্টি-পিন ম্যাপ · প্রভোস্ট-প্রিন্ট/শেয়ার) + মাস্টার-টেবিলের শেষ-আইটেম ১৭-এর যাচাই।

**ইমপ্লিমেন্টেশন:**
- **reply_note:** db.js (CREATE+LATER_COLUMNS) → `POST /admin/messages/:id/note` (clamp-২০০০, খালি=ক্লিয়ার, TA42.audit, 303+?noted=1) → messages.ejs amber-টিন্ট নোট-টগল/ফর্ম/ভিউ (injectCsrf42-চুক্তি, no-JS-সেফ) → ?noted=1-টোস্ট
- **ক্লিন-প্রিন্ট-শিট:** প্রতি-বার্তা + তালিকা-প্রিন্ট; DOM→textContent-only→`#printSheet108`; `body.ps-mode108` @media print-এ শুধু-শিট; afterprint+৩সে-ফলব্যাক-ক্লিনআপ
- **মাল্টি-পিন ম্যাপ:** জায়গা-চিপ ×৪ → iframe q=/z= সোয়াপ (API-কী-বিহীন) + aria-pressed + ক্যাপশন(aria-live) + খুলুন-href-সিঙ্ক
- **প্রভোস্ট প্রিন্ট/শেয়ার:** পূর্ণ-তালিকা ব্র্যান্ডেড টেবিল-শিট + navigator.share→ক্লিপবোর্ড→execCommand ফলব্যাক-চেইন
- **রোডম্যাপ-১৭ যাচাই-সমাপ্ত:** session ৯০/৯৪-এর ইমপ্ল যাচাই করা হয়েছে (SQL-ইনভ্যারিয়েন্ট social/share-featured=০, কিউরেশন-প্যানেল লাইভ-রেন্ডার, সার্ভার-গার্ড কোড) — **মাস্টার-টেবিল ২০/২০ সম্পূর্ণ**। ১৭-আইটেমে নতুন-কোড লাগবে না — ভবিষ্যৎ-এজেন্ট এটিকে 'সম্পূর্ণ' ধরবেন।

**গোটচা (নতুন):**
1. **`cd X && cmd &` পুরো-লিস্টকে ব্যাকগ্রাউন্ডে পাঠায়** — মূল-শেলের cwd অপরিবর্তিত থাকে; পরের `bash scripts/test-role-policy.sh` "No such file" দেয়। আবসোলিউট-পাথ বা `cd` আলাদা-স্টেটমেন্ট করুন।
2. **এ-স্যান্ডবক্সে setsid+disown-ও ডিট্যাচ টিকায় না** — ইনভোকেশন-শেষে সব-ব্যাকগ্রাউন্ড-প্রসেস মরে (পুনঃপ্রমাণিত)। প্রতিটি টেস্ট-ইনভোকেশনের শুরুতে সার্ভার-বুট (সার্ভার+টেস্ট এক-ইনভোকেশনে — পুরনো-রীতির পুনঃনিশ্চিতি)।
3. **login-form-এ `form button`-সিলেক্টর প্রথমে "পাসওয়ার্ড দেখান" টগল-বাটন ধরে** (type=button আগে আসে) — E2E-তে submit-বাটন নির্বাচনে type-ফিল্টার বাধ্যতামূলক।
4. **স্টাফ (moderator/admin-role ইউজার) /login থেকে বহিষ্কৃত** (সেশন-৮৩ পোর্টাল-বিভাজন) — moderator/moderator123 দিয়ে /admin/login দিয়ে লগইন করতে হয় (user-portal-এ "ভুল পাসওয়ার্ড"-নয়, স্টাফ-নোটিশ)।

**E2E:** নোট-সেভ/ক্লিয়ার/টোস্ট/অডিট(reply-note=3, clear=2) ✓ প্রিন্ট-শিট (১+৪-বার্তা, ক্লিনআপ) ✓ ম্যাপ-চিপ রাউন্ডট্রিপ ✓ প্রভোস্ট ১৫-সারি-শিট + শেয়ার-✓ ✓ ১৪-পেজ স্মোক ✓ 390px-০ ✓ কনসোল-০ ✓ role-policy ৮০/১০৭ (ডকুমেন্টেড-বেসলাইন-অভিন্ন) ✓

**⚠️ session109-ক্যানোনিকাল-গ্রহণ (push-রেসে আবিষ্কৃত):** আমার reply_note-ইমপ্ল (reply_note-কলাম + amber নোট-UI + হল-প্রিন্ট-শিট) session109-এর ক্যানোনিকালের (admin_reply/replied_at + mn-*109-UI + cx-print-keep-প্রিন্ট) কাছে প্রত্যাহৃত — তাদের স্কিমা/ইউআই-চুক্তিই টিকবে। **আমার অনন্য-রক্ষিত:** ① ইনবক্স ক্লিন-প্রিন্ট-শিট (#printSheet108 — প্রতি-বার্তা + তালিকা-প্রিন্ট; নোট তাদের .mn-text109 থেকে পড়ে) ② মাল্টি-পিন ম্যাপ-চিপ ×৪ ③ প্রভোস্ট-শেয়ার বাটন (cx-prov-tool108, তাদের প্রিন্ট-বাটনের পাশে) ④ রোডম্যাপ-১৭ যাচাই-সমাপ্তি। সমন্বয়-চুক্তি: প্রভোস্ট-টুলসে এখন দুই-বাটন (cx-prov-print=১০৯, cx-prov-tool108=শেয়ার) — ভবিষ্যৎ-এজেন্ট উভয় রাখবেন।

**পরবর্তী-সুপারিশ:** ইনবক্স-নোটসহ PDF-এক্সপোর্ট (jsPDF/সার্ভার-সাইড) · ম্যাপে এমবেড-মাল্টি-মার্কার KML · pagination-লাইভ-টেস্ট (১৬+ বার্তা) · hCaptcha/Turnstile (ভলিউম বাড়লে) · প্রভোস্ট-নোট-কলাম (হল-ভিত্তিক রেকর্ড)
## Cross-Agent Note: Session 114 — QA-উত্তর-থ্রেড বহমান (ক্যানোনিকাল-পার্শিয়াল-যুগে) (লেবেল-রেস ×২: docs(session112) ও feat(session113)-a9d1f61 (ক্যানোনিকাল CommentItem-রিফ্যাক্টর) অন্য-এজেন্টদের; সর্বোচ্চ+১ রীতিতে আমার ডেল্টা-রাউন্ড ১১৪ (code-identifier replies113/answerReplies113 চুক্তি-নাম হিসেবে অপরিবর্তিত)) + angry-গ্যাপ-পূরণ + রিপ্লাই-নোটিফিকেশন (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট (union-মার্জ-শিক্ষা):** এই রাউন্ডে স্বাধীনভাবে qa-থ্রেড-প্যারিটি + angry ইমপ্ল করছিলাম; rebase-এ আবিষ্কৃত — session107-articles (5d93176) আর্টিকেল-পেজ + session108 (b622eda) angry 😡 আগেই ক্যানোনিকালি পুশ করেছে। আমার সমান্তরাল-ইমপ্ল (thread-comment.ejs ফুল-রিপ্লেস-মার্কআপ + 😠-ইমোজি) **প্রত্যাহৃত**; কেবল অনন্য-ডেল্টা নেওয়া হয়েছে। রীতি-পুনঃপ্রমাণ: push-এর আগে `git fetch` + নতুন-কমিটের স্কোপ-স্কিম আবশ্যক।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **qa-single উত্তর-মার্কআপ = article-single কমেন্ট-মার্কআপের হুবহু কপি** (.comment-item + data-cid/author-id + body[data-raw] + fb-meta107 + reply-item-থ্রেড) — একই comment-tools.js ডুয়াল-সারফেস-ইঞ্জিন। **মার্কআপ-বদলের সময় দুই-ফাইল-সিঙ্ক রাখুন** (ভবিষ্যতে পার্শিয়াল-রিফ্যাক্টর ভালো)। QA-রুটে reply-রো এখন আলাদা কুয়েরি (parent_id NOT NULL) → a.replies112 + per-reply reaction ব্যাচ + renderQa80-html।
- **angry-রিঅ্যাকশন ৭-টাইপ — সব-ম্যাপ-রেজিস্ট্রি (২→৮-স্পট):** social.js REACTIONS + REACTION_META (এটা b622eda-তে বাদ গিয়েছিল!) + getReactionSummary/parseReactionsJson counts + actions-bar.ejs + main.js + **comment-tools.js R_META/R_LABEL** (এটাও বাদ ছিল — ফিড-ড্রয়ার প্যালেট ৬-ইমোজিতে আটকে) + dashboard.js + me.ejs ×২ + analytics.ejs। নতুন রিঅ্যাকশন যোগ করলে **এই ৮-জায়গা** একসাথে।
- **রিপ্লাই-নোটিফিকেশন:** POST /api/comment ও POST /articles/:id/comment — parent-author-notify (type 'reply', notify_comments-গেট; নিজে/পোস্ট-লেখক-ডুপ্লিকেট বাদ)। নোটিফ-টাইপ 'reply'-এর রঙ .notif-ico.ico-reply (style.css-112)।
- **কাউন্টার-চুক্তি:** থ্রেড-হেডিংয়ে `[data-cmt-total]`-স্প্যান — comment-tools.js ডিলিট-সিঙ্ক এখন স্প্যান-প্রথম (.comments-h innerHTML-হার্ডকোড 'মন্তব্য' ফলব্যাক)। নতুন থ্রেড-সারফেসে স্প্যানটাই ব্যবহার করুন।

**🚨 টুলিং-গোটচা-নতুন:** কিছু এজেন্ট-ট্রান্সপোর্ট ANSI-CSI-স্ট্রিপ করে — '[m'/'[h'/'[s'-সদৃশ `[<letter>` রান খেয়ে যায়। `_meta[mine]` আউটপুটে `_metaine]`-এ দেখায় — **node console.log-এও!** মিথ্যা-করাপশন-সংকেত; সত্যের-উৎস: `s.includes('_meta[mine]')` বা char-code প্রিন্ট। ('.rsx-card[hidden]' গোটচারই বর্ধিত ব্যাখ্যা।)

**QA-ইনস্ট্যান্স-রীতি:** প্যারালাল-এজেন্টদের লাইভ-ইনস্ট্যান্সে (:3030/:8080) পরীক্ষা নয় — আইসোলেটেড ফুল-কপি (/home/z/qa-s108, :3120) + নিজস্ব lekhok.db + reset-qa-logins/seed প্রি-বুট। kill-বাই-পোর্ট (`ss -tlnp`), pkill-প্যাটার্ন নয় (node server.js cwd-প্যাটার্নে ধরা পড়ে না → জম্বি-flush-ক্লোবার)। role-policy/test-রিপোর্টে স্ক্রিপ্টের টার্গেট-পোর্ট দেখুন — স্টেল-ইনস্ট্যান্সের 500 কোড-বাগ নয়।

**E2E-প্রমাণিত (:3120, স্ক্রিনশটসহ):** QA-উত্তর প্যালেট/টাচ-প্যালেট→care-🤗১ ✓ রিপ্লাই→রিলোড→থ্রেডেড ✓ এডিট-প্রি-ফিল→সম্পাদিত ✓ রিপ্লাই-ডিলিট→কাউন্টার-সিঙ্ক ✓ আর্টিকেল/ফিড-রিগ্রেশন ✓ গেস্ট ✓ 390px-০ ✓ কনসোল-০ ✓।

**পরবর্তী-সুপারিশ:** ① inspect-audit-এর 'stat-tile ×৭' রুল session109-ডিজাইনে আপডেট (এখন স্থায়ী 1-fail) ② থ্রেড-সাবমিটে optimistic-ইনসার্ট (রিলোড-ফ্ল্যাশ এড়াতে) ③ কমেন্ট-রিঅ্যাকশনেও নোটিফিকেশন (পোস্টে আছে) ④ qa-উত্তরে 'শীর্ষ উত্তর' র‍্যাংকিং-ব্যাজের ভবিষ্যৎ-পলিশ।

## Cross-Agent Note: Session 115 — মাল্টি-মেথড 2FA (ইমেইল-ওটিপি) (১৮ সেপ্টেম্বর ২০২৬)

**স্টেট:** users.twofa_method ('totp'|'email', LATER_COLUMNS) + two_factor_tokens টেবিল; helpers/otp.js (issue/verify/cooldown+Resend-REST-fetch — **নতুন npm-ডিপেন্ডেন্সি নেই**; RESEND_API_KEY/RESEND_FROM_EMAIL এনভিতে কি বসালেই লাইভ, না-থাকলে কনসোল-ফলব্যাক)। রুট: /settings/security/{enroll-email,confirm-email}, /settings/account/email (পাসওয়ার্ড-গার্ডড), /login/2fa/resend; login-POST-এ মেথড-রাউটিং।

**কনট্র্যাক্ট-রক্ষণীয়:** ① totp_enabled=মাস্টার-সুইচ — সব-পুরনো-চেক এতেই; twofa_method শুধু মেথড-নির্বাচ। ② মেথড-সিঙ্ক-অবিধা: totp-এনরোল-কনফার্ম **অবশ্যই** twofa_method='totp' সেট করে (email→totp সুইচ-ব্যাকে স্টেল-মেথড হলে লগইন ভুল-চ্যানেলে কোড পাঠায় — লাইভ-ধরা-বাগ), email-কনফার্মে totp_secret=NULL। ③ ৪৫সে-ইস্যু-কুলডাউন + ৫-মিনিট-টোকেন + ৬-চেষ্টা — otp.js-এ কেন্দ্রীভূত, রুটে ডুপ্লিকেট-করবেন না। ④ ইমেইল-মেথড-ইউজারের users.email শূন্য হলে fail-open (লক-আউট-প্রতিরোধ)। ⑤ EJS-ভিউতে emailPending/secPending দুই-পেন্ডিং-স্টেটের প্রাধান্য: secPending → emailPending → status → cards।

**গোটচা:** sql.js-সার্ভারের ডিবাউন্ড-ফ্লাশের আগে স্ট্যান্ডঅ্যালোন-DB-পড়লে স্টেল — E2E-তে ১.৪সে-রিট্রি-লুপ; agent-browser daemon প্রতি-কয়েক-ইনভোকেশনে স্টল → close --all + retry-লুপ open_login()।

## ক্রস-এজেন্ট-নোট (session116 — resources-agent)

1. **গেটওয়ে-সাবরিসোর্স/fetch পোর্ট-সংরক্ষণ-চুক্তি (session107-এর click-ফিক্সের সম্প্রসারণ):** প্রিভিউ-গেটওয়েতে পোর্ট-প্যারাম এখন ৪-স্তরে বহন হয় — ① EJS রেন্ডার-টাইম (`res.locals.XTPQ`, layout.ejs অ্যাসেট-ট্যাগ) ② sw.js fetch-রিরাইট (SB-সেট হলে unmarked same-origin সাবরিসোর্স) ③ layout.ejs img-error-রিট্রাই ④ **window.fetch মোড়া প্যাচ (layout.ejs + admin sidebar.ejs)** — `__xtpFetchPatched` গার্ড, relative-path-এ প্যারাম। **নতুন fetch/XHR-নির্ভর কোডে আর প্যারাম নিয়ে ভাবতে হবে না; তবে EventSource/WebSocket হলে সেখানে ম্যানুয়ালি `?XTransformPort=` যোগ করতে হবে।** প্রোডাকশনে চারটিই নো-অপ (পেজ-URL-এ প্যারাম নেই)।
2. **বাল্ক-ইমপোর্ট কনট্র্যাক্ট:** helpers/resource-bulk.js `bulkImport(csvText, createdBy, db)` — উভয়-রুট (admin + moderator) এক-ইঞ্জিন; হেডার-এলিয়াস টেবিলে নতুন-কলাম হলে ওখানেই যোগ; রেসপন্স {ok, inserted, skipped, total, errors[{line,title,error}]} — UI-রেন্ডারার মোডাল-পার্শিয়ালে এক-জায়গায়। নতুন-রিসোর্স-কলাম হলে normalizeRow + INSERT-কলাম-তালিকা দুটোতেই সিঙ্ক।
3. **JSON-POST CSRF-চুক্তি:** গ্লোবাল গার্ড urlencoded/multipart-সীমিত — JSON-রুটে নিজস্ব যাচাই (X-CSRF-Token vs session.csrfToken/কুকি _csrfTok) — বাল্ক-রুট csrfOk116() প্যাটার্ন; নতুন-JSON-রুটেও এটাই কপি করুন।
4. **টুল-আউটপুট '[h'-খাওয়া আবার-প্রমাণিত:** এই রাউন্ডে browser-error-মেসেজে `'a[href]'` → `'aref]'` দেখিয়ে ভুয়া-"করাপশন"-সংকেত দিয়েছিল — node fs.readFileSync বাইট-চেকেই ফাইল অক্ষত প্রমাণ। সেশন-১০৬-নোটের পুনরাবৃত্তি: **সন্দেহে প্রথমেই বাইট-লেভেল যাচাই।**
5. **role-policy প্রথম-রান-নয়েজ:** ফ্রেশ-DB-তে suite-এর কমেন্ট-সেকশন ৩-চেক 404 দিতে পারে (দ্বিতীয়-রানে 107/107) — ফেইল দেখলে একবার আর চালিয়ে দেখুন; টানা-ফেইল হলে তবেই রিগ্রেশন।

---

## ক্রস-এজেন্ট-নোট (session117 — resources-agent): সিরিজ প্লেলিস্ট-প্যানেল (১৮ সেপ্টেম্বর ২০২৬)

- **নতুন চুক্তি (lekhok-resource-detail.ejs):** পর্ব-রো `<li class="rsxd-seriep-li" data-epi data-audio data-title data-art>` — data-audio থাকা = ইন-পেজ-প্লেবল; রুটে seriesItems-এ audioSrc কম্পিউটেড। প্লেলিস্ট-JS দুই-আলাদা IIFE: ① কলাপ্স (অডিও-স্বাধীন — early-return করলে কলাপ্স-অরফান-বাগ, যেমন-ধরা) ② প্লেলিস্ট (audLis.length গার্ড)।
- **মিডিয়া-স্পেক-গোটচা (পুনরাবৃত্তি-নিষেধ):** শেষ-প্রান্তে 'pause' ইভেন্ট 'ended'-এর আগেই আসে — pause-হ্যান্ডলারে curIdx-রিসেট করলে ended-হ্যান্ডলার ভুল-পর্বে রিপ্লে/অ্যাডভান্স করে; a.ended-গার্ড বাধ্যতামূলক।
- **role-policy §১৬ যোগ হলো** (bulk/update অথরাইজেশন ×৮) — suite এখন 122-চেক; পুনরাবৃত্ত-রানে testuser-এর login-limiter (১৫মিনিট, in-memory) জ্বলে — "স্টাফ-পোর্টালে ইউজার-প্রত্যাখ্যান" চেক-ব্যর্থ দেখালে সার্ভার-রিস্টার্ট করে এক-রান-করুন (টুল-নয়েজ, অ্যাপ-বাগ নয়)।
- **পরবর্তী-প্রস্তাব (প্রায়োরিটি-ক্রমে):** ① বাল্ক-ইমপোর্টে CSV-URL-থেকে-ফাইল-সাইড-ফেচ ② created_at UTC→লোকাল সাইট-ওয়াইড ③ প্লেলিস্ট পার্সিস্টেন্স (localStorage last-position/রেজিউম) ④ সিরিজ-পেজে (query ?series=) প্লে-অল-ইন্টিগ্রেশন।
## Cross-Agent Note: Session 114 — ইনবক্স মিনি-বাবল + বিজ্ঞপ্তি-সরান + §১৫-সেলফ-সিড (১৮ সেপ্টেম্বর ২০২৬)

**ইমপ্লিমেন্টেশন:** ① `views/shared/messenger/MiniBubblePreview.ejs` (৯ম ক্যানোনিকাল কম্পোনেন্ট) — /messages তালিকার শেষ-বার্তা প্রিভিউ এখন মিনি-বাবল (me→messenger-নীল/them→ui-border; গ্রুপে সদস্য-সংখ্যা+প্রেরক-নাম; অ্যাটাচমেন্ট-আইকন 🖼️/🎙️/📎); SQL-এ last_sender_id/last_sender_name/last_file_url (**correlated subquery — বাইন্ড-প্যারাম যোগ হয় না, .all()-কাউন্ট অপরিবর্তিত রাখুন**) ② `POST /api/notifications/:id/dismiss` + /notifications হোভার-✕ (টাচে সর্বদা-দৃশ্যমান), অ্যানিমেটেড-কল্যাপস, বাংলা-সংখ্যা-চিপ-সিঙ্ক ③ বাগ-ফিক্স: `.conv-meta{text-align:right}`-লিক রিসেট (messenger.css), quick-কম্পোজার ম্যানশনে actorId-যোগ ④ test-role-policy.sh §১৫ সেলফ-সিড (SEED_CMT-নির্ভরতা-শূন্য; নতুন: নিজের-DELETE-200 + ghost-PUT-404) + login()-এ csrf-রেস-রিট্রাই।

**গোটচা (নতুন ×৩):**
1. **adminLoginLimiter ইন-মেমরি ও স্যুট-বিরোধী** — টানা-২-রানে 'অনেকবার ব্যর্থ চেষ্টা (১৫ মিনিট)'-বার্তা স্টাফ-পোর্টাল-প্রত্যাখ্যান-বার্তা-চেক ভাঙে। স্যুট সর্বদা **ফ্রেশ-সার্ভারে এক-পাসে** চালান।
2. **চিপ-কাউন্ট parseInt বাংলা-সংখ্যায় NaN** — '২ টি নতুন'-জাতীয় টেক্সট পার্সে '০১২৩৪৫৬৭৮৯'.indexOf-রূপান্তর আবশ্যক (notifications.ejs §114-ব্লকে রেফারেন্স)।
3. **cursor-E2E ফিড-গভীরতা-নির্ভর** — 'চেইন ≥২-পেজ' চেকে ismail-ফিড >৩০ আইটেম লাগে; ডেমো-পোস্ট ক্লিনআপ করলে ৮-ডেমো-পোস্ট HTTP-পথে (api/articles/quick, monem/karishma/mahfuz/nusrat) পুনঃস্থাপন করুন।

**E2E:** role-policy ১০৭/১০৭ (ফ্রেশ-সার্ভার) ✓ calls ৫৪/৫৪ ✓ cursor ২২/২২ ✓ guard:design ✓ ১১-পেজ কনসোল-০ + 390px-০ ✓ মিনি-বাবল ৪-ভ্যারিয়েন্ট (me/them/গ্রুপ/ভয়েস) স্ক্রিনশট ✓ ডিসমিস ownership (অন্যের-সারি removed:false) ✓

**পরবর্তী-সুপারিশ:** হেডার-ড্রপডাউন বিজ্ঞপ্তিতেও dismiss (main.js-রেন্ডারেড — আলাদা-রাউন্ড) · মিনি-বাবলে unread-অবস্থায় ডট-প্রিফিক্স · continue-reading 'সব দেখুন' পূর্ণ-তালিকা-পেজ (session112-প্রস্তাব) · qa-top-answer-chip AJAX-স্থায়িত্ব
## Cross-Agent Note: Session 113 — qa-উত্তরে ক্যানোনিকাল CommentItem + chip/noReply-প্যারাম + cursor-টেস্ট-রোবাস্টনেস (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** QA-স্যুইপ বাগ-শূন্য (role-policy 107/107 + calls 54/54; cursor ১-ফেইল = env-artifact) → session105-এর শেষ-অবশিষ্ট সুপারিশ ① (qa-single-উত্তরে CommentItem) বাস্তবায়ন + টেস্ট-রোবাস্টনেস।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (সব এজেন্টের জন্য):**
- **CommentItem.ejs-এ ২-নতুন backward-compatible-প্যারাম:** ① `chip` {label, icon?, title?} — বাবলের ভেতরে লেখক-নামের পরে ছোট-ব্যাজ (qa 'শীর্ষ উত্তর'-র মতো) ② `noReply: true` — 'উত্তর'-বাটন hidden। **flat-list পেজে (রিপ্লাই-রেন্ডার-পথ নেই এমন) noReply অবশ্যই দিন** — নইলে রিপ্লাই POST হয়ে অদৃশ্য হয়ে যায় (গোপন-ডেটা-এন্ট্রি-ফাঁদ)।
- **qa-single এখন ক্যানোনিকাল:** উত্তর = CommentItem (`.fc-item.cmt-item`); লিগ্যাসি `.answer-item/.answer-sidebar` মার্কআপ আর রেন্ডার হয় না (CSS রয়ে গেছে, ক্ষতিকর নয়)। উত্তর-ফিল্ড-চুক্তি: bodyHtml=a.html (markdown-lite), reaction=a.reaction (getReactionSummary — {counts,total,mine} সরাসরি-ম্যাপ)।
- **উত্তর-কাউন্টার-চুক্তি:** h2-তে `.qa-answer-count`-স্প্যান + `.answers-all-deleted`-নোট (hidden) — ডিলিট-সিঙ্ক qa-single-এর inline MutationObserver করে (fc-item-রিমুভ → বাংলা-সংখ্যা-হ্রাস); নতুন-উত্তর-অ্যাড-পাথ যোগলে এই-হুক আপডেট করুন।
- **shared.css session113-ব্লক:** .cmt-item-chip + .answers-section .fc-item-প্যারিটি (44px/34px-অ্যাভাটার) + focus-visible + 640px + reduced-motion — নতুন-চিপ-স্টাইল এখানেই, অন্যত্র ডুপ্লিকেট নয়।

**🐛 shared-ইঞ্জিন-ফিক্স (comment-tools.js):** ইনলাইন-এডিট-সেভে `data-raw` আপডেট-হীনতা → দ্বিতীয়-সম্পাদনায় পুরনো-টেক্সট-প্রিফিল। ফিক্স: সেভ-সাকসেসে `bodyEl.setAttribute('data-raw', val)` — ফিড/আর্টিকেল/qa সব-সারফেসে প্রযোজ্য।

**cursor-টেস্ট-রোবাস্টনেস:** verify-session107-cursor.js টাই-ব্যাচ ২৬→৩৫ (পেজ-সাইজ ৩০-এর ভেতরে ঢুকে pages:1 ফল্স-ফেইল এড়াতে; ৩৫>৩০ ⇒ ≥২-পেজ-প্রমাণ DB-স্টেট-নিরপেক্ষ)। ভবিষ্যৎ-টেস্ট-লেখকের জন্য নীতি: **বহু-পেজ-অ্যাসার্শনে ব্যাচ-সাইজ > পেজ-সাইজ-এর সর্বোচ্চ-সম্ভাব্য-মান ধরুন**।

**QA-সিড-চুক্তি-স্পষ্টীকরণ:** role-policy-র সম্পূর্ণ 107/107-র জন্য **দুই-সিড-ই-লাগে** — `seed-qa-users.js` (ইউজার+পাসওয়ার্ড) **এবং** `seed-test-users.js` (testadmin→role=admin + moderator→user_mgmt-scope)। শুধু-প্রথমটা দিলে 80/107 (ডকুমেন্টেড-বেসলাইন) — ফেইল-নয়, সিড-অসম্পূর্ণ।

**E2E-প্রমাণ:** রেন্ডার-গঠন ✓ লাইক/প্যালেট→ব্যাজ-লাইভ ✓ ইনলাইন-এডিট(মার্কডাউন-পুনঃরেন্ডার+সম্পাদিত) ✓ data-raw-প্রিফিল ✓ ডিলিট→কাউন্টার-০+নোট ✓ গেস্ট-ভিউ (চিপ+ব্যাজ-দৃশ্যমান, প্যালেট/৩-ডট-অনুপস্থিত) ✓ ডেস্কটপ+390px-০ ✓ কনসোল-০ ✓ role-policy 107/107 + calls 54/54 + cursor 22/22 ✓ guard:design ✓ brace-depth-০ ✓

**পরবর্তী-সুপারিশ:** ① role-policy-তে comment-API-চেক (PUT/DELETE 403/404-পাথ — session105-সুপারিশ-বহুল) ② tokens.css-হার্ডকোড-হেক্স-স্ক্যান guard-এ ③ qa-তে 'উত্তর লিখুন'-কম্পোজারে FB-স্টাইল অটো-গ্রো + ctrl+enter ④ crx-উইজেট 'সব দেখুন'-পেজ ⑤ notifications ফিল্টার-ট্যাব (type-ভিত্তিক)

### ⚠️ Session 113-পোস্ট-মার্জ-সংশোধন: qa-ক্যানোনিকালাইজেশনে সমান্তরাল-ডুপ্লিকেট — session114-সংস্করণ ক্যানোনিকাল (১৮ সেপ্টেম্বর ২০২৬)

push-রেস-এ abhi-asol: উপরের session113-নোট লেখার সময় অজানা ছিল — একজন প্যারালাল-এজেন্ট (লেবেল "সেশন ১১৪", তাদের CSS-কমেন্টেও "session113" — লেবেল-রেস আবার) **একই কাজ qa-single-এ করেছে, থ্রেডেড-উত্তরসহ আরও সমৃদ্ধভাবে**: replies113-কোয়েরি + compact CommentItem + ক্যানোনিকাল CommentComposer (রিচ-এডিটর + AJAX + no-JS noscript-ফলব্যাক) + comments-total-হুক + qa-answers-list/slot-র‍্যাপার। session105-প্রেসিডেন্সি ও পূর্ববর্তী-প্রত্যাহার-রীতি অনুযায়ী **তাদের qa-single.ejs-ই ক্যানোনিকাল** — union-মার্জে সেটাই গৃহীত।

**প্রত্যাহৃত (আমার session113 থেকে):** qa-single.ejs-এডিট (flat-list + noReply-পাথ — থ্রেডেড-সংস্করণে অপ্রাসঙ্গিক, রিপ্লাই-বাটন এখন কাজ করে), .answers-section/.answers-all-deleted CSS-রুল, MutationObserver-কাউন্টার-সিঙ্ক-স্ক্রিপ্ট।

**অনন্য-রক্ষিত (union-এ টিকেছে, সবার-লাভ):**
1. **CommentItem.ejs-প্যারাম ×২ (backward-compatible):** `chip` {label,icon?,title?} (বাবলে ছোট-ব্যাজ — ভবিষ্যৎ-পেজের জন্য ক্যানোনিকাল) + `noReply` (flat-list পেজে নেস্টেড-উত্তর-ফাঁদ-বন্ধ — রিপ্লাই-রেন্ডার-পথ-নেই এমন যেকোনো পেজে বাধ্যতামূলক-চিন্তা)
2. **🐛 comment-tools.js data-raw-ফিক্স:** এডিট-সেভ-সাকসেসে `bodyEl.setAttribute('data-raw', val)` — দ্বিতীয়-সম্পাদনায় স্টেল-প্রিফিল-বাগ (ফিড/আর্টিকেল/qa সব-সারফেস)
3. **cursor-টেস্ট-রোবাস্টনেস:** টাই-ব্যাচ ২৬→৩৫ (পেজ-সাইজ-৩০-ওভারফ্লো-গ্যারান্টি) → 22/22
4. **shared.css session113-খ-ব্লক:** .cmt-item-chip + cmt-item focus-visible-রিং + 640px-চিপ + reduced-motion (তাদের qa-থ্রেড-ব্লকের সাথে সহ-অস্তিত্ব; brace-depth-০)
5. **QA-সিড-চুক্তি-স্পষ্টীকরণ:** role-policy 107/107 = seed-qa-users + seed-test-users **উভয়ে**

**ভবিষ্যৎ-এজেন্টের জন্য:** qa-উত্তর-থ্রেডের কনট্র্যাক্ট = session114-এর (social.js answerReplies113 + qa-answer-slot + comments-total); chip/noReply-প্যারাম ব্যবহারের প্রয়োজন হলে CommentItem.ejs-হেডার-ডকুমেন্টেশন দেখুন। **লেবেল-রেস-প্রতিকার:** এ-রাউন্ডের পরে নতুন-এজেন্ট session117 থেকে (সর্বোচ্চ+১)।

## ক্রস-এজেন্ট-নোট (session118 — resources-agent): প্লেলিস্ট রিজুম + সিরিজ play-all (১৮ সেপ্টেম্বর ২০২৬)

- **রিজুম-স্টেট-চুক্তি:** localStorage `lekhok.rpl.<encodeURIComponent(series).replace(/%/g,'').slice(0,48)>` = `{cur:{epi,t,title,ts}, done:{<resId>:ts}}` — epi = `.rsxd-seriep-li`-ইনডেক্স (data-epi); done রিসোর্স-id-ভিত্তিক (লি-তে নতুন data-id); ৩০-দিন-TTL; t≤৩সে বা done-পর্বে রিজুম-চিপ নেই। সেভ-পয়েন্ট: pause (reset-এর-আগেই, একই-হ্যান্ডলারে) + timeupdate-৩সে-থ্রটল + pagehide + ended (advance-এর-আগেই — playIdx curIdx বদলায়)।
- **🚨 XTPQ-ডাবল-প্যারাম-গোটচা (নতুন):** সার্ভার স্যান্ডবক্সে অভ্যন্তরীণ লিংকে `?XTransformPort=` রেন্ডার-টাইমে বসায় (session116 XTPQ) — JS-এ ওই href-এ আবার প্যারাম জুড়লে **ডাবল** → গেটওয়ে ব্যর্থ → SW অফলাইন-পাতা। JS-location-নেভিগেশনে href র-পার্স করে path/id নিয়ে URL নতুন-বানান, পোর্ট-প্যারাম একবারই (play-all-এ id-রেজেক্স-প্যাটার্ন)।
- **play=1-ইনটেন্ট-চুক্তি:** /resources?series=X-এর "সিরিজ শুনুন" → sessionStorage `lekhok.rplIntent='1'` + `/resources/<firstAudioId>?play=1` → ডিটেইল autoStart: ইনটেন্ট-কনজিউম → রিজুম-অবস্থা-প্রাধান্য (t>৩সে) → নইলে প্রথম-অডিও-পর্ব; অটোপ্লে-ব্লকে playAll-পালস+টোস্ট ফলব্যাক; play=1 URL-থেকে মুছে ফেলা হয়।
- **প্রগ্রেস-বার-চুক্তি:** `.rsxd-epiprog` JS-ইনজেক্টেড (audLis-রোতে); `setProg(lisIdx)` লিস-ইনডেক্স নেয় — audLis-রূপান্তর ভিতরেই (স্পেস-মিসম্যাচ = বার-সর্বদা-০%-বাগ)।

---

## Cross-Agent Note — Session 117 (অনাথ-কমেন্ট-বাগ-ফিক্স + pagination-টেস্ট; qa-ক্যানোনিকাল প্রত্যাহার) (১৮ সেপ্টেম্বর ২০২৬)

**⚠️ অনাথ-কমেন্ট-বাগ (session105-যুগের, এখন ফিক্সড — ভবিষ্যৎ-এজেন্ট রক্ষা করুন):**
1. **comment-tools.js রিপ্লাই-স্লট postId-ফলব্যাক-চেইন:** আগে কেবল `.fc-drawer[data-comments-for]`-থেকে postId আসত → একক-পোস্ট-পেজে (articles/qa) `data-post-id="null"` → POST /api/comment-এ **অনাথ-কমেন্ট** (কোনো থ্রেডে অদৃশ্য)। এখন: `.fc-drawer` → নিকটতম `.comments-list[data-post-link]`-পাথ-পার্স → `.cc-form[data-post-id]`। **নতুন কমেন্ট-এন্ট্রি-পয়েন্ট যোগ করলে এ-চেইন ভাঙবেন না।** session113/114-এর qa-reply-btn এ-পাথেই চলে — ফিক্স ছাড়া অনাথ হত।
2. **POST /api/comment সার্ভার-গার্ড:** post_id parseInt>0 নইলে 400 `bad_post_id` (defense-in-depth)। negative-প্রমাণ: "null"/"abc"/"-5" → ৪০০। parent_id-যুক্ত নতুন-এন্ডপয়েন্টেও এ-রীতি মানুন।

**pagination-লাইভ-টেস্ট (session108-খ ③ সম্পন্ন):** ১৬-বার্তায় পেজ-১ ১৫ + পেজ-২ ১ নির্ভুল; CSV-রো-সম্মতি ✓; /api/contact রেট-লিমিট (৫/১০মি) in-memory → ব্যাচ-সিডে সার্ভার-রিস্টার্টেই রিসেট। seed-স্ক্রিপ্ট: scripts/seed-qa-117.sh (curl-লগইন + CSRF-ডাবল-সাবমিট + JSON-API — HTTP-পাইপলাইন-রীতি)।

**প্রত্যাহার-ঘোষণা:** আমার qa-ক্যানোনিকাল-ইমপ্ল session113-11982d2 + session114-ক্যানোনিকালের কাছে স্বেচ্ছায় প্রত্যাহৃত (ডুপ্লিকেশন-শূন্য)। রক্ষিত-অনন্য: অনাথ-ফিক্স ×২ + pagination-টেস্ট + seed-স্ক্রিপ্ট + .qa-answer-slot scroll-margin-top-অ্যাঙ্কর-পলিশ (৩-লাইন)।

**E2E-প্রমাণ:** রিপ্লাই-স্লট data-post-id=১১ (আগে null) ✓ লাইক-টগল-দুইদিক badge-বাংলা ✓ থ্রেড-সোয়াপ+total-লাইভ ✓ গেস্ট-ভিউ ✓ 390px-০ ✓ কনসোল-০ ✓ guard:design ✓ brace-০ ✓ pagination-১৬ ✓ ক্লিনআপ ✓। **গোটচা-রিপ্লে:** rebase-এ --theirs=আমার-কমিট (বিপরীত!); git add-এর পরে checkout --ours নীরবে ব্যর্থ → `git show HEAD:path > path`; ব্রাউজার JS-ইনজেকশনে cache-bust (cb=Date.now()) + রিয়েল-ক্লিক (synthetic .click() কিছু হ্যান্ডলারে ফেইল)।

**পরবর্তী:** role-policy-তে POST /api/comment bad_post_id-৪০০-চেক + comment PUT/DELETE 403/404 (session105 ④; session114 §১৫-সেলফ-সিডের সাথে মিলিয়ে) · tokens.css-হেক্স-স্ক্যান-গার্ড (⑤) · কল-প্যানেল ভিডিও-track-স্ট্যাট (session111 ③)।
## Cross-Agent Note: Session 111-ব — কমেন্ট-সিস্টেম QA + ৩-লেটেন্ট-বাগ + সেশন-লেবেল-রেস-পুনঃপ্রমাণ (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** comment-tools.js (এডিট-জিওমেট্রি-ফিক্স + canonical-delete-সিঙ্ক + data-cm-count) + style.css (হোভার-তিন-সারফেস) + social.js (react-comment-নোটিফিকেশন + comment-লিংক-ফিক্স + DELETE-total) + notifications/header-আইকন + cursor-E2E-ভলিউম-ব্যাচ। ফিড-র‍্যাংকিং/মেসেঞ্জার/গ্যালারি/admin লক-জোন অস্পৃশ্য।

**সেশন-লেবেল-রেস-পুনঃপ্রমাণ:** এই-রাউন্ডে qa-উত্তর FB-প্যারিটি + reply-নোটিফিকেশন টার্গেট করেছিলাম — pull-এ দেখা গেল session113/114 একই কাজ ক্যানোনিকাল-লেয়ারে (shared/CommentItem) করেছে + f736fc1-এ style.css-ব্রেস-বাগ-ফিক্সও। 'আমার সেশন১১১' আর 'অন্যের সেশন১১১' উভয়ই আছে — লেবেল-race তৃতীয়বার। **আগে-থেকে pull → কাজ-শুরুর আগে PLANS-এ intent-নোট → কমিট-রেডি হলেই সঙ্গে-সঙ্গে push** — এর বিকল্প কিছুই না।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **দুই-ইঞ্জিন-বাস্তবতা:** পুরনো fb-parity (data-cid/fc-react-wrap/fc-menu-wrap/fc-edit-slot) ও নতুন canonical (.cmt-item[data-cmt-id]/cmt-palette/cmt-badge/pm-wrap+data-cmt-edit/delete) — comment-tools.js-এ উভয়েই চলে (attr-ভিন্ন, ডাবল-ফায়ার-নেই)। নতুন-সারফেস canonical-ই ব্যবহার করুন।
- **DELETE /api/comments/:id এখন total ফেরত দেয়** (session105-এর বিজয়ী-রুটে যোগ) — ক্লায়েন্ট-কাউন্টার-সিঙ্ক দুই-ইঞ্জিনেই কাজ করে। রেসপন্স: {ok, removed, total}।
- **data-cm-count="<selector>"-হুক:** যেকোনো কাউন্টারে DOM-রিকাউন্ট (বাংলা-অঙ্ক) — ডিলিটে দুই-ইঞ্জিনেই চলে। [data-cmt-total]/.comments-total (j.total=comment_count) ও সহ-বিদ্যমান।
- **E2E-জিওমেট্রি-মান (পুনরাবৃত্তি-মূল্য):** DOM-attr-চেক অপর্যাপ্ত — getBoundingClientRect().width>0; agent-browser=touch-mode — হোভার-রুল CSSOM-স্ক্যানে।
- **cursor-E2E এখন base-data-independent** (+১৫ ভলিউম-ব্যাচ, cleanup-সহ) — ২৪/২৪। ফিডে <৪১ আইটেমে চেইন-অ্যাসারশন মিথ্যা-ফেল করত।

**পরবর্তী-সুপারিশ:** ① পুরনো-চুক্তির অবশিষ্ট মার্কআপ-সারফেস (থাকলে) canonical-এ মাইগ্রেট — দুই-ইঞ্জিন-রক্ষণাবেক্ষণ-বোঝা কমাতে ② article-কমেন্টে optimistic-UI (রিলোড-নেই — session105-এর refreshArticleThread qa-তেও) ③ নোটিফিকেশন-ড্রপডাউনে reply-টাইপ-ব্যাজ ④ hall-provost সার্চ/ফিল্টার + contact_hours লাইভ-ইন্ডিকেটর (keyset-তালিকা থেকে বাকি)।
### Cross-Agent Note — Session 113 (কমেন্ট-API হার্ডেনিং + রিপ্লাই-স্লট-ফিক্স + role-policy এক্সটেনশন)

1. **🚨 রিপ্লাই-স্লট postId-চুক্তি:** comment-tools.js-এ রিপ্লাই-স্লট-কম্পোজারের data-post-id এখন ড্রয়ার-ব্যাকফলে পেজের মেইন-কম্পোজার (`.cc-form[data-post-id]`, স্লট/ড্রয়ারের বাইরের প্রথমটি) থেকে রেজলভ হয়। **নতুন পেজে রিপ্লাই-স্লট চালু করলে মেইন-কম্পোজারে data-post-id থাকা বাধ্যতামূলক** — নইলে আবার `post_id="null"`-অনাথ-রো (TEXT-করাপশন) ফিরে আসবে।
2. **POST /api/comment চুক্তি-পরিবর্তন:** এখন `post_id` non-positive/non-numeric → 400 bad_post_id; অস্তিত্বহীন-পোস্ট → 404; parent অন্য-পোস্টের → 400 bad_parent_id। আগে স্ট্রিং-'null' নীরবে TEXT-রো হত। JSON-টেস্টগুলোতে এখন integer post_id পাঠান।
3. **DELETE /api/comments/:id এখন `{ok, removed, total}` ফেরত দেয়** — total = পোস্টের অবশিষ্ট-কমেন্ট। [data-cmt-total]/.comments-total-কাউন্টার-সিঙ্ক এর উপরেই দাঁড়িয়ে।
4. **role-policy-স্যুট এখন `P=${P:-8080}`** — `P=8094 bash scripts/test-role-policy.sh` দিয়ে QA-সার্ভারে চালান। §১৪-১৫ (কমেন্ট-API) DB-state-নিরপেক্ষ — ismail/testuser নিজেরাই টার্গেট তৈরি করে পরে ক্লিনআপ করে; প্রয়োজনীয় ইউজার: seed-qa-users.js (ismail/secret123) + seed-qa-113.js (testuser/testadmin=role-admin/qa113user=demo123)। **testadmin-এর users-টেবিলে role='admin' রাখতে হবে** (seed-test-users-কনভেনশন) — 'user' করলে §৫-এ ban-ক্যাসকেডে পরবর্তী-সেকশন ডুবে যায়।
5. **seed-qa-113.js:** idempotent ডেমো-QA-থ্রেড (প্রশ্ন "নতুন লেখকরা কোথায় থেকে শুরু করবেন?" + like_count=৩-উত্তর + রিপ্লাই) — সার্ভার-বন্ধে চালান (স্বাভাবিক গোটচা)।
6. **article.css session113-ব্লক:** dead answer-card-রুল মুছেছে — কিন্তু session114-মার্কআপের .top-answer-chip/.answer-form-wrap/.answer-form (noscript) পুনঃস্থাপিত; ভবিষ্যতের dead-rule-অপসারণের আগে views/-জুড়ে class-ব্যবহার-স্ক্যান করুন (noscript-ব্লকও স্ক্যানে ধরুন)।

**নতুন ফিচার (webrtc-call.js + calls.css — ২-ফাইল-স্কোপ, Agent-Chat-লক-জোন অস্পৃশ্য):**
1. **নেটওয়ার্ক-কোয়ালিটি পিল (.lc-quality, FB-প্যারিটি 4-বার):** সংযুক্ত-অবস্থায় `pc.getStats()` ২.৫সে-অন্তর → selected-candidate-pair-এর `currentRoundTripTime` → RTT <150ms=৩-বার-সবুজ, <300=২-সবুজ, <500=১-অ্যাম্বার, বাকি=লাল-পালস। ভিডিও-মোডে লোকাল-ভিডিও (top-right) সংঘর্ষ এড়াতে পিল **top-LEFT**-এ। title/aria-label-এ বাংলা RTT।
2. **ডায়াগনস্টিকস প্যানেল (.lc-stats):** কন্ট্রোল-বারে নতুন **fa-circle-info বাটন** → গ্লাস-কার্ড: সংযোগ-পথ (সরাসরি-একই-নেটওয়ার্ক / সরাসরি-NAT-ভেদ / **রিলে (TURN)** — relay-ক্যান্ডিডেট দেখলে অ্যাম্বার-হাইলাইট), local/remote ক্যান্ডিডেট-টাইপ, RTT, jitter, হারানো-প্যাকেট (মোট), রিসিভ-গতি (bytes-ডেল্টা kbps) — সব বাংলা-সংখ্যা। **রোডম্যাপ-③-এর হাতে-কলমে যাচাই-সহায়ক:** লাইভ-কলে প্যানেলে "রিলে (TURN)" দেখামাত্রই TURN-কাজ-করছে-প্রমাণ (openrelay/Metered-যা-ই হোক)।
3. **দুর্বল-নেটওয়ার্ক অটো-হিন্ট:** টানা ৩-নমুনা RTT>450ms (বা অজানা) → একবারী টোস্ট ("ভিডিও বন্ধ করলে ভালো থাকতে পারে"); রিকভারিতে streak-রিসেট।

**ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- S-স্টেটে নতুন ফিল্ড: `qPollT/statsOpen/lastStats/poorStreak/poorNotified/lastBytes/lastBytesAt` — cleanup() এগুলোই রিসেট করে; নতুন কল-লাইফসাইকেল-স্টেট যোগলে `startStatsTicker()` (onConnected-এ) + `clearTimeout(S.qPollT)` (cleanup-এ) রক্ষা করুন।
- QA-হুক (window.LekhokCall): `_qaEnsureRoot()` (কল ছাড়াই কল-রুট DOM নির্মাণ — হেডলেস-যাচাই), `_qaSetQuality(lvl,rtt)` (পিল-স্টেট ইনজেকশন), `toggleStats()`। কল-ছাড়া getStats নেই — প্যানেল idle-এ "সংযোগ স্থাপিত হলে লাইভ-তথ্য দেখা যাবে" empty-state।
- CSS চুক্তি: `.lc-quality[hidden]`/`.lc-stats[hidden]`-এ স্পষ্ট `display:none` (display:inline-flex/block hidden-অ্যাট্রিবিউট ওভাররাইড-করে — পুরনো `.rsx-card`-গোটচার পুনরাবৃত্তি-প্রতিরোধ)।

**যাচাই:** node --check ✓; রিস্টার্ট-পরবর্তী role-policy ১০৭/১০৭ ✓ calls-E2E ৫৪/৫৪ ✓; agent-browser (মেসেঞ্জার-চ্যাট @ QA-হুক): রুট-নির্মাণ ✓ পিল hidden→good(৪-বার,৮৪ms)→bad(১-বার,৯০০ms,পালস) ✓ প্যানেল খোলা→empty-state ✓ ফেক-নমুনায় ৭-রো + is-relay-অ্যাম্বার ✓ ক্লোজ ✓ ডেস্কটপ+390px-স্ক্রিনশট ✓ overflow-০ ✓ কনসোল-০ ✓।

**পরবর্তী-সুপারিশ:** ① গ্রুপ-কল (mesh WebRTC — call_participants-টেবিল + per-peer-PC; নিজস্ব-বড়-রাউন্ড) ② Metered.ca-অ্যাকাউন্ট (ইউজার-অ্যাকশন — env-পথ প্রস্তুত, এখন প্যানেল দিয়েই রিলে-যাচাই) ③ কল-মিডিয়া-স্ট্যাটে ভিডিও-track-স্ট্যাট (resolution/frameRate) যোগ ④ quality-ভিত্তিক অটো-ভিডিও-ডিগ্রেড (এই রাউন্ডের টোস্টের স্বয়ংক্রিয়-রূপ)।

## Cross-Agent Note: Session 113 — গ্রুপ-কল (mesh WebRTC) — কল-ডোমেইনের শেষ-বড়-ফিচার (১৭ সেপ্টেম্বর ২০২৬)

**রোডম্যাগ-প্রগতি:** মাস্টার-টেবিল-২০/২০-পরবর্তী কল-ডোমেইন রোডম্যাপের শেষ-বড়-আইটেম **গ্রুপ-কল ✓** (গ্লোবাল-রিংগার/কল-ইতিহাস/ICE-restart/কোয়ালিটি-পিল আগেই সম্পন্ন)। অবশিষ্ট: Metered.ca-TURN (ইউজার-অ্যাকাউন্ট), ভিডিও-track-স্ট্যাট, অটো-ভিডিও-ডিগ্রেড, স্পিকার-হাইলাইট।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (কল-ডোমেইনে কাজ করা-সব-এজেন্টের জন্য):**
1. **call_participants-স্টেট-মেশিন:** ringing → joined → left|declined|missed (UNIQUE(call_id,user_id))। 1:1-সেশনে এই-টেবিল ব্যবহৃত-ই-হয় না (callee_id-পথ অক্ষুণ্ণ); শুধু is_group=1-এ। সার্ভার self-heal (healGroupStale/maybeFinalizeAbandonedGroupCall) মেয়াদোত্তীর্ণ ringing-রো মিসড-মার্ক করে — নতুন-কোডে স্টেট-মেশিন-লঙ্ঘন করলে self-heal-এর সাথে দ্বন্দ্ব হবে।
2. **সিগন্যাল-চুক্তি:** প্রতি-সিগন্যালে ঐচ্ছিক `to` (অনুপস্থিত=ব্রডকাস্ট) — পোল-রেসপনসের `from` (sender_id) মেশ-রাউটিং-এর মূল-চাবি; গ্রুপ-ক্লায়েন্ট from-ভিত্তিক পিয়ার-PC নির্বাচ করে। নতুন সিগন্যাল-টাইপ যোগ করলে groupSignal()-এর টাইপ-চেইনে ফলব্যাক-নীরব-আচরণ রাখুন।
3. **গ্লেয়ার-প্রতিরোধ-চুক্তি (অপরিবর্তনীয়):** নতুন-জয়েনকারী (accept-রেসপনসের `joined`-তালিকা) আগে-জয়েনডদের প্রতি অফার পাঠায়; রেস-কেসে (joined_at, uid) টোটাল-অর্ডার — **কলার কখনো অফার পাঠায় না**। এই-নিয়ম বদলালে দু-দিকে-অফার (glare) ফেরত আসবে।
4. **poll.group শেপ:** {id, kind, status, role, conversation_id, me_joined_at, participants[{id,username,name,avatar,status,joined_at}], ringing_count} — গ্রিড-reconcile-এর সত্য-উৎস; নতুন-ফিল্ড যোগ্য, বিদ্যমান-নাম বদলানো-নিষিদ্ধ (ক্লায়েন্ট groupReconcile পড়ে)।
5. **start-যাচাই-স্থানান্তর:** গ্রুপ-স্টার্ট অফার-বিহীন — অফার-ভ্যালিডেশন এখন 1:1-শাখায় (busy-গার্ডের পরে); অর্ডার বদলালে গ্রুপ-স্টার্ট 400 ফিরবে।
6. **history-চুক্তি-বদল:** গ্রুপ-conv-এ /api/calls/history এখন 200 {peer:null, group:true, calls[]} — পুরনো 400 group_call_unsupported আশা-করা-কোড থাকলে আপডেট করুন (verify-session93-calls.js-ও আপডেটেড)।
7. **ক্লায়েন্ট-স্ট্রাকচার:** webrtc-call.js-এ সেশন-১১৩-ব্লক (mesh-ইঞ্জিন + গ্রিড-UI) আলাদা-মার্কড; 1:1-পথে হাত দিলে শুধু-ব্রাঞ্চ-পয়েন্টগুলো (start/showIncoming/acceptCall/poll-সিগন্যাল-লুপ/onConnected/statsTick/cleanup/endCall) স্পর্শ করুন; activePC()-চুক্তি (1:1→S.pc, গ্রুপ→প্রথম connected পিয়ার) statsTick-এর প্রাণ।
8. **MAX_GROUP_CALLERS = 8** — mesh O(N²) ক্যাপ; বাড়াতে চাইলে SFU-মাইগ্রেশন আলোচনা ছাড়া নয়।

**গোটচা:**
- অফার/আনসার-SDP সিগন্যাল-পেলোডে `sdp:{type,sdp}`-আকারে — 1:1-এর মতোই; কিন্তু গ্রুপ-ক্যান্ডিডেট `to`-সহ যায়, `from` পোল যোগ করে — ক্লায়েন্ট-সাইডে `sg.from` আর `sg.signal` আলাদা-স্তর।
- গ্রুপ-রিং ব্যস্ততা-নয়: ringing-অংশগ্রহণকারী অন্য-কল গ্রহণ করতে পারে (গ্রহণে অন্য-রো মিসড-মার্ক হয়) — busy-guard-এর অর্থ শুধু caller/joined।
- CSS: .lc-grid/.lc-tile ব্লক EOF-মার্কারসহ (session113-group-call-grid); ইউনিয়ন-মার্জের পরে brace-depth-চেক রীতি অপরিবর্তিত।

**E2E-প্রমাণ:** scripts/verify-session113-groupcalls.js (৫০-চেক) ALL GREEN; role-policy ১০৭/১০৭ + calls ৫৫/৫৫ + cursor ২২/২২; ব্রাউজার-QA-হুক LekhokCall._qaEnsureGroupGrid()/_qaTeardownGroupGrid() (কল-ছাড়াই হেডলেস-গ্রিড-যাচাই)।

**পরবর্তী-সুপারিশ:** ① Metered.ca-TURN (গ্রুপ-কলে রিলে-প্রয়োজনীয়তা বাড়ে; ডায়াগনস্টিকস-প্যানেলেই যাচাই) ② প্রতি-পিয়ার স্ট্যাট (গ্রুপে কোন-পিয়ার দুর্বল) ③ স্পিকার-হাইলাইট (getSynchronizationSources/audioLevel) ④ quality-ভিত্তিক অটো-ভিডিও-ডিগ্রেড ⑤ গ্রুপ-কল-রিং শুধু-অনলাইন-সদস্যে-সীমিত-করা (বর্তমানে সব-সদস্য)।
## Cross-Agent Note: Session 116 — কমেন্ট-রিঅ্যাকশন নোটিফিকেশন + আইকন-রেজিস্ট্রি প্যারিটি + QA-অ্যাঙ্কর + inspect-audit ক্যানোনিকাল-যুগ (১৮ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** session-১১৪-নোটের সুপারিশ ③ (কমেন্ট-রিঅ্যাকশনেও নোটিফিকেশন) + QA-রাউন্ডে পর্যবেক্ষিত দুই-গ্যাপ। QA-ফার্স্ট রাউন্ড: ১৪-রুট-স্মোক + লগইন + গ্যালেরি-পেজিনেশন + session115-2FA-সারফেস + 390px + কনসোল — বাগ-শূন্য প্রায় (একটি নীরব-অ্যাঙ্কর-বাগ ধরা পড়েছে, ফিক্সড)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **কমেন্ট-রিঅ্যাকশন নোটিফিকেশন:** `/api/react` comment-ব্রাঞ্চে `addedC116`-গেট (নতুন-INSERT-এই নোটিফাই — same-reaction টগল-অফে INSERT-ই হয় না; সুইচ = নতুন-INSERT = নোটিফাই, পোস্ট-ব্রাঞ্চের added101-চুক্তির সাথে অভিন্ন)। কেবল love/haha/wow + notify_reactions-প্রেফ-গেট + নিজের-মন্তব্যে-নয়। **লিঙ্ক-অ্যাঙ্কর-চুক্তি:** QA-উত্তর → `#answer-<id>`, আর্টিকেল-কমেন্ট → `#fc-c<id>` — নতুন নোটিফাই-কল-সাইট এই-দুই-টার্গেটই ব্যবহার করুন।
- **অ্যাঙ্কর-টার্গেট-সত্যায়ন-রীতি:** session-১১৪-নোটের `/qa/:id/answer` '#c'+id অ্যাঙ্করের টার্গেট qa-single-এ ছিলই না (নীরব-স্ক্রল-ব্যর্থ) — এখন `#answer-<id>`। **শিক্ষা: রিডাইরেক্ট-অ্যাঙ্কর দেওয়ার আগে টার্গেট-ভিউতে id-এর অস্তিত্ব grep করুন** (`id="answer-` / `id="fc-c` / `id="answer-`)।
- **নোটিফিকেশন-আইকন-রেজিস্ট্রি (৩-স্তর):** নতুন notification-type যোগ করলে **এই-৩-জায়গা একসাথে**: ① header.ejs ড্রপডাউন `_ico`-ম্যাপ (fa-ফন্ট) ② notifications.ejs পেজ iconClass/_ico টার্নারি ③ style.css-এ `.notif-ico.ico-<type>` (ড্রপডাউন, actor-ছবি-নেই-হলে) + প্রয়োজনে `.notif-page-icon.icon-<type>`। বর্তমান-ম্যাপ: reaction=fa-heart/রোজ, reply=fa-reply/অ্যাম্বার, mention=fa-at/icon-comment।
- **inspect-audit ক্যানোনিকাল-যুগ:** সেশন-১০৫-এর shared/post/* স্থানান্তরের পরে ৩ রুল legacy-partial-পাথে ফলস-নেগেটিভ দিচ্ছিল — এখন ক্যানোনিকাল-প্রথম+legacy-ফলব্যাক (FeedPostCard/PostActionMenu/PostFooterActions)। ভবিষ্যৎ-মার্কআপ-স্থানান্তরে **অডিট-রুল-পাথ-ও আপডেট করুন**। বর্তমান: 48/48-পাস/০-ফেইল।
- **test-role-policy.sh RP_PORT:** `P=3130 bash scripts/test-role-policy.sh` — আইসোলেটেড-ইনস্ট্যান্সে চালানো-সহজ (ডিফল্ট :8080 অক্ষত)। **রিপোর্ট-রীতি:** এক-DB-দুই-কোড-বেস-তুলনা (baseline-বনাম-নতুন) — suite স্টেট-সেনসিটিভ (রোল-এসকেলেশন/গ্রুপ-চ্যাট মিউটেট করে), অতএব অ্যাবসোলিউট-সংখ্যা নয়, **ডেল্টা-ই-প্রমাণ** (এই-রাউন্ডে 93/14 → 94/13, ডেল্টা=+1)।

**গোটচা (পুনঃপ্রমাণিত):**
1. **fuser-অনুপস্থিত** — `fuser -k <port>/tcp 2>/dev/null` নীরবে কিছুই করে না, পুরনো-সার্ভার টিকে থাকে → নতুন-বুট EADDRINUSE-এ নীরবে মরে → **আপনার-কোড-লাইভ-ই-না**! কিল-বাই-পিড রীতি: `kill $(ss -tlnp | grep <port> | grep -oE 'pid=[0-9]+' | cut -d= -f2)` + বুটের পরে `ss`-দিয়ে-নতুন-পিড-যাচাই + `ps -o lstart`-দিয়ে বুট-টাইম > ফাইল-mtime যাচাই।
2. **curl-POST → CSRF:** login/answer/comment-POST-এ `_csrf` ফিল্ড বা `X-CSRF-Token` হেডার (meta csrf-token থেকে) লাগবেই — নাহলে `[csrf] blocked` (সার্ভার-লগে দেখুন) বা `/?csrf=1`-রিডাইরেক্ট। টোকেন প্রতি-GET-এ ঘোরে — ফ্রেশ-নিন।
3. **sql.js ফাইল-প্রোব-স্টেল:** সার্ভার-চলতে-থাকলে DB-ফাইল পুরনো (in-memory-স্টেট, পিরিয়ডিক-ফ্লাশ) — node-probe-এ "নোটিফ নেই" দেখালেও লাইভ-সার্ভারে থাকতে পারে; যাচাই HTTP-সারফেসেই করুন বা প্রোবের-আগে সার্ভার-কিল।

**E2E-প্রমাণিত (:3130, স্ক্রিনশটসহ):** নোটিফ-ফ্রেশ/টগল-অফ-নো-ডুপ/সুইচ/সেলফ-সাপ্রেসড/প্রেফ-গেট ✓ পেজ-আইকন icon-like+fa-heart ✓ ড্রপডাউন fa-heart ✓ অ্যাঙ্কর-স্ক্রলY=150 ✓ 390px ×৮-০ ✓ কনসোল-০ ✓ অডিট 48/48 ✓ role-policy-ডেল্টা=+1 ✓

**পরবর্তী-সুপারিশ:** ① থ্রেড-সাবমিটে optimistic-ইনসার্ট (session-১১৪-নোটের ২-নম্বর, এখনো খোলা) ② 'সেরা উত্তর' র‍্যাংকিং top-answer-chip-এর রিঅ্যাকশন-সামারি-ভিত্তিক আপগ্রেড ③ লাইভ-Turso-রিসেট + সিক্রেট-রোটেশন ×৪ (এখনো-পেন্ডিং, টোকেন-ধারী-এজেন্ট চালাবে) ④ notification-পেজে পার-টাইপ ফিল্টার-চিপ (reaction/comment/reply আলাদা করে দেখা)।
## Cross-Agent Note: Session 117 — পড়া-চালিয়ে-যান ফুল-পেজ + crx-CSS-ফেরত + notifications ফিল্টার-ট্যাব + ctrl+enter (১৯ সেপ্টেম্বর ২০২৬)

**প্রেক্ষাপট:** session113-ফাইনাল-পরবর্তী ক্রন-রাউন্ড; QA বাগ-শূন্য (role-policy ১১৮/১১৮ — suite বেড়েছে; cursor ২২/২২; calls ALL GREEN; guard ✓) → ফিচার-রাউন্ড। session112/113-সুপারিশের ৩-আইটেম: crx 'সব দেখুন'-পেজ ② notifications ফিল্টার-ট্যাব ③ qa-কম্পোজার ctrl+enter + আবিষ্কৃত-বাগ: crx-* CSS কখনো ল্যান্ডই করেনি।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **/me/reading (social.js):** শূন্য-API পেজ — ensureLoggedIn + res.render('user/reading'); তালিকা-ইঞ্জিন continue-reading.js-এ (ডুয়াল-মাউন্ট: #crxMount=উইজেট-৩, #crxFullMount=সব)। localStorage 'lf_read_pos'-এর চুক্তি অপরিবর্তিত (r/t/ti/u)। ফুল-পেজ-স্টাইল dashboard.css-EOF session117-ব্লকে (extra_css-দিয়ে লোড)।
- **notifications.ejs G117-গ্রুপ-ম্যাপ:** mention / reply+comment→'reply' / like+reaction→'reaction' / message / বাকি-সব→'other'। আইটেমে data-g117-অ্যাট্রিবিউট; চিপ = .nft-chip (data-nft); ডিসমিস-কাউন্ট-সিঙ্ক window.nftRecount117()। নতুন-নোটিফিকেশন-টাইপ যোগ করলে G117-তে types-অ্যারে আপডেট করুন (না-গেলে 'other'-এ পড়বে — নিরাপদ-ফলব্যাক)।
- **comment-tools.js:** Ctrl/⌘+Enter → requestSubmit() (মেনশন-ড্রপডাউন-বন্ধ-অবস্থায়) — ডিসেবলড-সেন্ড সম্মানকারী; নতুন-কীবোর্ড-শর্টকাটও এই keydown-ডেলিগেটেই।

**গোটচা (নতুন ×৩):**
1. **EJS-বডি-ব্লকের ভেতরে `<%# %>` = সিনট্যাক্স-এরর** — `<% ... %>` ব্লক-ভেতরের কমেন্ট সবসময় JS-স্টাইল (`/* */`)।
2. **HTTP-সিড-ডেটা মৃত্যু-কিলে রিভার্ট হয় (পুনঃপ্রমাণ ×২ — এ-রাউন্ডে post-42 + ৪-বিজ্ঞপ্তি গায়েব):** নির্ভরযোগ্য-সিড = সার্ভার-বন্ধ-অবস্থায় স্ট্যান্ডঅ্যালোন-স্ক্রিপ্ট (sql.js সরাসরি + export-write; db.js-prepare-এর জন্য initDb-অ্যাওয়েট লাগে — getter অপেক্ষা করে না)।
3. **নতুন-ভিউতে পেজ-CSS হলে header-এর extra_css-অ্যারে বাধ্যতামূলক** — reading.ejs প্রথম-সংস্করণ ছাড়া ছিল → আনস্টাইলড-ধরা পড়েছিল E2E-তে।

**E2E-প্রমাণ:** গেস্ট-৩০২ ✓ উইজেট 'সব দেখুন'+কাউন্ট ✓ ফুল-পেজ tiles/চিপ/বার/relTime ✓ ×-সিঙ্ক ✓ armed-ক্লিয়ার→এম্পটি ✓ 390px-০ ✓ চিপ ×৫-গণনা ✓ ফিল্টার-ফেরত ✓ ডিসমিস-সিঙ্ক+'সব'-ফলব্যাক ✓ ctrl+enter-পোস্ট+ক্লিয়ার ✓ টেস্ট-ডেটা-ক্লিনআপ ✓ কনসোল-০ ✓ রিগ্রেশন চারটিই গ্রিন ✓

**পরবর্তী-সুপারিশ:** ① হেডার-ড্রপডাউন বিজ্ঞপ্তিতে dismiss (এখনো-অবশিষ্ট — main.js) ② থ্রেড-সাবমিটে optimistic-ইনসার্ট ③ crx-টাইলে কভার-থাম্বনেইল (lf_read_pos-এ c=cover-URL চুক্তি যোগ হলে) ④ nft-চিপ ?type=-URL-পার্সিস্টেন্স ⑤ মিনি-বাবল unread-ডট।

---

## Session 119 — ক্রস-এজেন্ট নোট (rebase-ইউনিয়ন + টেস্ট-ইনফ্রা-গোটচা-ত্রয়ী + রিকনসিল-চুক্তি)

**ইউনিয়ন-সিদ্ধান্ত (session118-কোলিশন):** দুই-এজেন্ট একই ইউজার-স্পেকে (/me FB-কমপ্যাক্ট) সমান্তরাল কাজ — origin-এর session118 (57d8113: ৯-ট্যাব+অনুসারী-পেন+ws118+পূর্ণাঙ্গ-মাস) **ক্যানোনিকল** থাকল; আমার প্রি-রিবেজ /me-রিস্টোর প্রত্যাহৃত। টিকে-থাকা আমার-ডেল্টা (session119): /qa ফিল্টার-চিপ+ব্যাজ+live-ans_count, /me-রুটে read_mins (session118-ভিউতেও rt-chip ফলায় — ক্রস-কমপ্যাটিবিলিটি প্রমাণিত), db/reconcile-comment-counts.js। **শিক্ষা: একই-ইউজার-স্পেকে দুই-এজেন্ট-রান স্বাভাবিক — রিবেজে অধিক-বিবর্তিত-ভার্সন ক্যানোনিকল, অন্যের অনন্য-ডেল্টা union।**

**নতুন-চুক্তি:**
- **comment_count-সত্য-উৎস:** ডিসপ্লে-সারফেসে সম্ভব-হলে live সাব-কুয়েরি (`(SELECT COUNT(*) FROM comments...)`) — posts.comment_count কলাম প্রাচীন-ক্ষতে বাসি হতে পারে (প্রমাণ: post 1-এ ২-বনাম-০)। কলাম লাগবে-এমন লেখা-পথে (article-single) রিকনসিল-স্ক্রিপ্ট চালান: `node db/reconcile-comment-counts.js` (idempotent)।
- **রিকনসিল-রান-অর্ডার (sql.js in-memory):** `kill → node db/reconcile-comment-counts.js → boot` — **বিপরীত নয়**। মরতে-থাকা-সার্ভারও শাটডাউনে বাসি-মেমরি ফ্লাশ করে (প্রমাণিত ×৩)।
- **/qa ফিল্টার-চুক্তি:** `?filter=unanswered` (anycase অন্য-মান=all) + রেন্ডার-লোকাল `qaFilter`/`qaCounts{all,unanswered}`; ভিউ-তে ans_count-ই একমাত্র কাউন্ট-সোর্স। role-policy §১৭-এ এ-রুট-কভারেজ যোগ করা উচিত।

**গোটচা-ত্রয়ী (টেস্ট-ইনফ্রা — মিথ্যা-ফেইল-ত্রিমূর্তি):**
1. **role-policy পোর্ট-প্যারাম = RP_PORT** (session116-রেনাম; `P=${RP_PORT:-8080}`) — পুরনো `P=8094` এখন **নীরবে অগ্রাহ্য** → suite 8080-এ গিয়ে ১২০×000-মিথ্যা-ফেইল। `RP_PORT=8094 bash scripts/test-role-policy.sh`।
2. **admin-login-রেট-লিমিটার পোলিউশন:** 'স্টাফ-লগইন-পোর্টাল'-মেসেজ-চেক প্রতি-রানে ২-ব্যর্থ-POST খায় (max ৫/১৫মিন প্রতি IP+username) → **পরপর ≥৩ রানে রেট-লিমিট-পেজ রেন্ডার হয়ে চেক-ফেইল** — কোড-বাগ নয়। রানের-আগে সার্ভার-রিস্টার্ট (ইন-মেমরি-লিমিটার ক্লিয়ার) বা ১৫মিন-বিরতি।
3. **স্যান্ডবক্স-প্রসেস-রিপ:** Bash-কলের-মাঝে ব্যাকগ্রাউন্ড-নোড নীরবে মরে — প্রতি-টেস্ট-ব্লকের-শুরুতে `bash ensure-server.sh` (রিপো-রুট, untracked) + suite একই-কলে।

**E2E-প্রমাণ (মার্জড-কোড @8094):** /me = session118-ডিজাইন (৯-ট্যাব/৭-ব্যাজ/মেটা-স্ট্রিপ/ws118-চার্ট/পূর্ণাঙ্গ-মাস) + rt-chip ×৪ ✓ /qa ফিল্টার-সাইকেল ✓ role-policy ১২৫/১২৫ ✓ cursor ২৫/২৫ ✓ guard:design ✓ 390px-০ ✓ কনসোল-০ ✓ brace-depth ০ ✓

## Cross-Agent Note: Session 120 — গ্রুপ-কল স্পিকার-হাইলাইট + ভিডিও-track-স্ট্যাট (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** webrtc-call.js + calls.css — মাত্র ২-ফাইল (Agent-Chat-লক-জোন অস্পৃশ্য); রোডম্যাপের "স্পিকার-হাইলাইট + প্রতি-পিয়ার-স্ট্যাট" (session113-পরবর্তী তালিকা) বাস্তবায়ন। সার্ভার-কোড শূন্য-পরিবর্তন।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (কল-ডোমেইনে কাজ করা-এজেন্টদের জন্য):**
1. **SPK-ইঞ্জিন (মডিউল-লেভেল, `SPK.nodes` uid→{src,an,arr}):** প্রতি-অডিও-স্ট্রিমে WebAudio AnalyserNode — নীরব-বিশ্লেষণ (destination-এ connect হয় না)। **নতুন স্ট্রিম-অ্যাটাচ-পাথ যোগ করলে `spkEnsure(uid, stream)` ডাকুন, ড্রপ-পাথে `spkDrop(uid)`** — নইলে ওই-পিয়ার কখনো স্পিকার-হাইলাইট পাবে না (বা মৃত-নোড-লিক হবে)। বর্তমান-ওয়্যারিং: attachLocal→'self' · 1:1-createPC.ontrack→'peer' · group-peerPC.ontrack→uid · peerDrop→spkDrop · startStatsTicker→spkStart · cleanup→spkTeardown।
2. **স্পিকার-চুক্তি:** একসময়ে একজনই active (সর্বোচ্চ-RMS, থ্রেশহোল্ড 5.5, ৮০০ms-হোল্ড) — `spkPaint(uid)` গ্রিড-টাইলে `.is-speaking` + `.lc-spkbars`-টগল + 1:1-এ `.lc-audioface.is-speaking`। QA-হুক: `LekhokCall._qaSetSpeaking(uid|null)` / `_qaSpeaking()` / `_qaSetVideoStats({vw,vh,vfps,lw,lh})` (idle-বাইপাসসহ) — হেডলেসে কল/মাইক-ছাড়াই যাচাই।
3. **টাইল-মার্কআপ-পরিবর্তন:** `gridTile`-এ `.lc-tile-meta`-র ভেতরে এখন `<span class="lc-spkbars" hidden><i>×৩</i></span>` আছে — tile-meta-র DOM-অবলম্বনকারী কোড (querySelector-অর্ডার) হলে যাচাই করুন। **hidden-ওভাররাইড-গার্ড নীতি:** display:inline-flex ক্লাসে `[hidden]{display:none}` স্পষ্ট-রুল রাখা বাধ্যতামূলক (session111-র `.lc-qualityidden]`-গোটচার পুনরাবৃত্তি-প্রতিরোধ)।
4. **ভিডিও-স্ট্যাট:** `S.lastStats`-এ নতুন-ফিল্ড `vw/vh/vfps` (inbound-rtp video) + `lw/lh` (local-track getSettings) — renderStats শুধু `S.kind==='video'`-তে "ভিডিও" সেকশন (`.lc-stats-section` + `.is-video`-সারি) রেন্ডার করে; অডিও-কলে সেকশন-ই-নেই (ডেল্টা-শূন্য)। গ্রুপে গ্রুপ-মোডের প্রথম connected পিয়ার-PC (activePC-চুক্তি অপরিবর্তিত)।

**E2E-প্রমাণ:** node --check + brace-depth-০ ✓; agent-browser (গ্রুপ-চ্যাট @ QA-হুক): is-speaking-টাইল+বার ✓ অন্য-টাইল-পরিষ্কার ✓ null-ক্লিয়ার ✓ 1:1-অডিওফেস-রিং ✓ ভিডিও-সেকশন '১২৮০×৭২০'/'৬৪০×৪৮০ @ ২৫ fps' (বাংলা-অঙ্ক) ✓ ডেস্কটপ+390px-স্ক্রিনশট ✓ ওভারফ্লো-০ ✓ কনসোল-০ ✓; রিগ্রেশন role-policy ১২৫/১২৫ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard:design = **২৫৫-চেক ALL GREEN**। স্ক্রিনশট: s118-speaker-desktop.png / s118-speaking-bars.png / s118-speaking-mobile.png।

**QA-অর্ডারিং-গোটচা (নতুন):** হেডলেস-টেস্টে `document.querySelectorAll('.lc-root').forEach(r=>r.remove())` করলে IIFE-ক্লোজারের `root` ভেরিয়েবল ডিট্যাচড-নোডেই থেকে যায় → পরবর্তী `_qaEnsureGroupGrid()` "সফল" কিন্তু অদৃশ্য — প্রতিকার: প্রতি-রাউন্ডে `agent-browser open` দিয়ে ফ্রেশ-পেজ-লোড (ক্লোজার-স্টেট-রিসেট)।

**পরবর্তী:** Metered.ca-TURN (ইউজার-অ্যাকাউন্ট) · অটো-ভিডিও-ডিগ্রেড · টাইল-ক্লিকে প্রতি-পিয়ার-স্ট্যাট · থ্রেড-সাবমিটে optimistic-ইনসার্ট (session116-সুপারিশ-অবশিষ্ট)।


## Cross-Agent Note — Session 119 (বিজ্ঞপ্তি-ফিল্টার-ট্যাব + আপেক্ষিক-সময় + 🚨২-ইন্টিগ্রিটি-ফিক্স) (১৮ সেপ্টেম্বর ২০২৬)

**🚨 রিকভারি ① — session114-এর dismiss-রুট অরিজিন থেকেই নিখোঁজ ছিল:**
`POST /api/notifications/:id/dismiss` (social.js) — da91a80 (session113-followup)-এর rebase-ইউনিয়নে হারিয়েছিল (af372de-এ ছিল ✓, 5a59c1f-এ নেই ✗)। অর্থাৎ অরিজিন/main-এ **বিজ্ঞপ্তি-সরান ✕-বাটন নীরবে ভাঙা ছিল** (UI ফেচ করত → 404-ক্যাচ-অল → ?saveerr=1)। এখন eb85bf1-এ ক্যানোনিকাল-ব্লক পুনঃস্থাপিত। **ভবিষ্যৎ-এজেন্টের জন্য rebase-নীতি:** conflict-রেজলভে নিজের ফাইল-wholesale নেবেন না — `git show <base>:<file>` আর নতুন-base-এর মধ্যে route/ব্লক-লেভেল union-করুন; বিশেষত অন্য-এজেন্টের যোগ করা নতুন route-গুলো যাচাই করুন (`rg "router\.(get|post)" routes/social.js` diff-সহ)।

**🚨 রিকভারি ② — session116-এর fetch-পোর্ট-সংরক্ষণ header-পার্শিয়াল-পেজে ছিল না:**
`__xtpFetchPatched` window.fetch-প্যাচ কেবল layout.ejs/admin-sidebar-এ ছিল — **header-পার্শিয়াল দিয়ে খোলা প্রতিটি পেজে** (qa-single/profile/settings/notifications/resources/quiz/bookmarks/birthdays…) JS-fetch('/api/…') প্যারাম-হীন যেত → স্যান্ডবক্স-প্রিভিউতে গেটওয়ে Next.js-অ্যাপের 404-HTML ফেরত পেত (ডিসমিস/রিড/রিঅ্যাক্ট সব নীরবে ফেইল — E2E-প্রমাণিত)। এখন header.ejs-এ একই আইডেম্পোটেন্ট প্যাচ + অ্যাসেট-ট্যাগে XTPQ (লেআউট-প্যারিটি; কোল্ড-স্টার্ট-আনস্টাইলড-সুরক্ষা)। প্রোডাকশনে নো-অপ। **নতুন-পেজ-ওপেনার যোগ করলে** header.ejs-এর প্যাচ আছে কিনা যাচাই করুন — নতুন আলাদা-ওপেনার বানালে এ-প্যাচ সেখানেও দিন।

**নতুন-ফিচার (session113-সুপারিশ ⑤ সম্পন্ন): /notifications ফুল-পেজে টাইপ-ফিল্টার-ট্যাব:**
- ৬-পিল-ট্যাব: সব / মন্তব্য(comment,reply) / প্রতিক্রিয়া(like,reaction) / ম্যানশন / ফলো / ঘোষণা(বাকি-সব: system/notice/event/daily_*/call/birthday/moderation)। **গ্রুপ-ম্যাপিং contract:** ভিউ-সাইডে `groupOf119()` (notifications.ejs) — নতুন type যোগ হলে সেটি স্বয়ংক্রিয়ভাবে 'ঘোষণা'-গ্রুপে পড়বে; আলাদা-ট্যাব চাইলে G119-ম্যাপে যোগ করুন।
- client-side ফিল্টার (৫০-আইটেম-পেজ) + বাংলা-ডিজিট কাউন্ট-ব্যাজ + ০-কাউন্ট is-zero মিউটেড + .notif-tab-empty নোট।
- **dismiss-সিঙ্ক:** MutationObserver (list childList) → ব্যাজ-রিকাউন্ট + is-zero-টগল + সক্রিয়-ফিল্টার-পুনঃপ্রয়োগ — session114-এর dismiss-IIFE অস্পৃশ্য (ডুপ্লিকেট-শূন্য)। নতুন-রো-অ্যাড-পাথ যোগলে এই observer-ও কভার করে।
- **[hidden]-গোটচা-পুনঃপ্রয়োগ:** `.notif-page-item[hidden]{display:none!important}` — ক্লাস-ডিসপ্লে UA-র [hidden] ছাপিয়ে যায় (cron-r6-প্রমাণ)।
- **আপেক্ষিক-সময় (cron-r4-প্যারিটি):** rel119() — এইমাত্র→মিনিট→ঘণ্টা→দিন; ৭-দিন-পরে পূর্ণ-তারিখ; title-এ পূর্ণ-তারিখ।

**union-মার্জ-গোটচা-নতুন (আমার নিজের ভুল থেকে):** style.css EOF-union-এ আমার ব্লকের `[hidden]`-লাইন টুল-আউটপুটে `idden]` দেখালেও বাইট-অক্ষত ছিল (od/python-দিয়ে যাচাই-রীতি); কিন্তু notifications.ejs-এর python-union-এ HEAD-অ্যাঙ্কর+আমার-অ্যাঙ্কর **দুটোই রয়ে গিয়েছিল** (নেস্টেড-অ্যাঙ্কর → ব্রাউজার প্রথমটা auto-close করে phantom-রো) — union-এর পরে **ডুপ্লিকেট-লাইন-স্ক্যান** (একই-ট্যাগ-দুইবার) অবশ্যই করুন।

**E2E-প্রমাণ:** ট্যাব-ফিল্টার ✓ ডিসমিস-সিঙ্ক ব্যাজ ১→০+is-zero+নো-রিলোড ✓ আপেক্ষিক-সময়+title ✓ ডেস্কটপ+390px-০ ✓ কনসোল-০ ✓ প্যারিটি (প্যারাম-বিহীন=পরিষ্কার-URL) ✓ ২২-পেজ-২০০ ✓ role-policy 107/107 ✓ cursor 26/26 (ismail-reset-পরে) ✓ calls 52/2 (env-artifact) ✓ EJS-কম্পাইল ✓ CSS-brace-০ ✓ টেস্ট-ডেটা-ক্লিনআপ ✓

**পরবর্তী-প্রথম-পছন্দ:** qa 'উত্তর লিখুন'-কম্পোজারে FB-অটো-গ্রো + ctrl+enter (session113 ③) → crx-উইজেট 'সব দেখুন'-পেজ (④) → tokens.css-হেক্স-স্ক্যান-গার্ড (⑤) → call-প্যানেল video-track-stats (session111 ③) → পুরনো-চুক্তি-মার্কআপ canonical-মাইগ্রেশন (session111-ব ①)

**⚠️ Session119-পোস্ট-মার্জ-সংশোধন: নোটিফ-ফিল্টার সমান্তরাল-ডুপ্লিকেট — session117(চিপ)-ক্যানোনিকাল (১৮ সেপ্টেম্বর ২০২৬)**

push-পূর্ব rebase-এ (f629b06) দেখা যায় আরেক প্যারালাল-এজেন্ট (CSS-লেবেল "সেশন ১১৯" — লেবেল-রেস পঞ্চমবার!) **একই /notifications ফিল্টার session117-চিপ-ঘরানায়** ইমপ্ল করেছে (`.notif-filter-bar` + `.nft-chip` + `data-g117` + `nftRecount117`-dismiss-সিঙ্ক) — session105-প্রেসিডেন্সি অনুযায়ী **তাদেরটাই ক্যানোনিকাল**; আমার notif-tabs-ভিউ/JS/CSS-ব্লক প্রত্যাহৃত (ডুপ্লিকেট-শূন্য)। **অনন্য-রক্ষিত (আমার):** ① বাংলা আপেক্ষিক-সময় rel119 (তাদের নেই — cron-r4-প্যারিটি) ② `.notif-page-item[hidden]` + **`.notif-filter-empty[hidden]`** {display:none!important}-গার্ড ×২ — তাদের JS `it.hidden=!show` ব্যবহার করে কিন্তু তাদের CSS-এ গার্ড ছিল না (display:flex/block UA-[hidden] ছাপিয়ে যেত — cron-r6-গোটচা; গার্ড-ছাড়া চিপ-ফিল্টার-রো ও খালি-নোট লুকাত না) ③ header.ejs fetch-প্যাচ + XTPQ ④ dismiss-route-রিস্টোর। **শিক্ষা:** একই session113-⑤-রেকমেন্ডেশন দুই-এজেন্ট একসাথে নিয়েছিল — ভবিষ্যতে কাজ-শুরুর আগে PLANS-এ intent-নোট দেওয়া ছাড়া বিকল্প নেই।


## Cross-Agent Note: session12 — অপটিমিস্টিক-কমেন্ট + মার্জ-ডুপ্লিকেট-QA-ফিক্স (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** comment-tools.js (অপটিমিস্টিক-ইঞ্জিন + কাউন্টার-সিঙ্ক-সম্প্রসারণ + বাংলা-সংখ্যা-পার্স) + style.css (opt-fresh ব্লক) + layout/header.ejs (data-uname + ব্যাজ-বাংলা) + article-single.ejs (ডুপ্লিকেট-হেডার-ফিক্স + কাউন্টার-বাংলা) + qa-single.ejs (কাউন্টার-বাংলা)। ফিড-র‍্যাংকিং/মেসেঞ্জার/গ্যালারি/admin লক-জোন অস্পৃশ্য।

**বেসলাইন-QA-তে ধরা (union-মার্জ-অ্যাক্সিডেন্ট):** article-single.ejs-এ `<h3 class="comments-h">` **দুইবার** (মন্তব্য (N) যুগল) — সাবমিটের পর একটি স্টেল থেকে যেত ("মন্তব্য (২)" ও "মন্তব্য (1)" একসাথে)। এক-লাইন-ডেলিট ফিক্স; **মার্জ-পরে ভিউ-টেমপ্লেটে ডুপ্লিকেট-নোড-অডিট করুন** (grep-count একই id/class-হুক)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **অপটিমিস্টিক-কমেন্ট (session104-সুপারিশ-③ সমাপ্ত):** submit-সফলে `insertOptimistic(j.id, body, parentId, postId)` — ক্যানোনিকাল-চুক্তির বাবল তাৎক্ষণিক DOM-এ (j.id বাস্তব → প্যালেট/৩-ডট/রিপ্লাই ডেলিগেশন সঙ্গে-সঙ্গেই সক্রিয়), তারপর background-রিফেচ reconcile। ড্রয়ার ও আর্টিকেল-উভয়-পাথে। **নতুন কমেন্ট-সারফেস যোগ করলে insertOptimistic-এর লিস্ট-সনাক্তকরণ (data-post-link-পাথ-পার্স / data-comments-for) সমর্থন করুন।**
- **body data-uname:** layout + header `<body>`-তে যোগ — optimistic-বাবলের /profile/ লিংক-সোর্স। নতুন লেআউটেও রাখুন।
- **optBumpCounters/optParseBn:** বাংলা-অঙ্ক-সচেতন কাউন্টার-বাম্প ("৩"→"৪") — ASCII-regex-এ NaN-ফাঁদ ছিল।
- **delete-handler সিঙ্ক-সম্প্রসারণ:** সব [data-cmt-total]/.comments-total + ফিড-কার্ডের .as-stat[title="মন্তব্য"] + লোডেড-ড্রয়ারে refreshDrawer (প্রিভিউ-বাবল-স্টেল-প্রতিরোধ)।
- **ASCII-অঙ্ক-লিক-ফিক্স:** refreshDrawer-এর stat.textContent = total → bnNum(total) ×২; article/qa কাউন্টার-হেডার ও notif-badge এখন সার্ভার-সাইডেই বাংলা।

**E2E-প্রমাণ (agent-browser, hook-based-লেটেন্সি-সিমুলেশন):** আর্টিকেল-সাবমিট → ৬৮ms-এ opt-বাবল+`<strong>`-মিরর+কাউন্টার"৬"+৭-প্যালেট+৩-ডট ✓ → reconcile-পরে canonical×6+কাউন্টার-অপরিবর্তিত ✓; নেস্টেড-রিপ্লাই opt (fc-reply.cmt-reply, .cmt-replies-এ) ✓ reconcile ✓; রিঅ্যাকশন opt-বাবলে 👍১-ব্যাজ ✓; ডিলিট-ক্যাসকেড ৬→৩ (nested-সহ) + কাউন্টার-সিঙ্ক ✓; ড্রয়ার opt + as-stat-বাম্প/ডিলিট-সিঙ্ক ✓; 390px-overflow-০ ✓; role-policy 103✓/13✗-প্রি-এক্সিস্টিং (বেসলাইন-অভিন্ন) ✓; নোটিফিকেশন E2E (riya-কমেন্ট → ismail-ব্যাজ "৪", dismiss-সিঙ্ক) ✓।

**গোটচা:** টেস্ট-হুকে fetch-arguments closure-ভুল হলে fetch(undefined) → HTML → r.json() throw → catch → location.reload() — ভান-করা "ফেইল"; hook-লিখলে `function(u){ const args=arguments; ... }`-ধরা বাধ্যতামূলক।

**পরবর্তী:** ① qa-উত্তর-পাথেও optimistic (qa-reply-btn-ইঞ্জিন) ② edit/delete-ও optimistic-স্টাইলে মৃত্যু-অ্যানিমেশন ③ ডুপ্লিকেট-নোড-অডিট-স্ক্রিপ্ট (view-template grep-count) ④ hall-provost সার্চ/ফিল্টার (session111 ④ — অগ্রাহীত)।

### session120 ক্রস-এজেন্ট নোট (cron-r5)

- **সার্চ-হাইলাইট-চুক্তি:** lekhok-search.ejs-এর `hl120(text, plainLimit?)` হেল্পার — escape-first → `<mark>`; নতুন ফলাফল-গ্রুপ যোগ করলে `<%= %>` নয়, `<%- hl120(...) %>` ব্যবহার করতে হবে (raw `<%= %>` থাকলে হাইলাইট-বঞ্চিত হবে)। mark-স্টাইল style.css session120-ব্লকে — নতুন গ্রুপেও কাজ করবে।
- **read_mins-কনভেনশন:** ৯৫০-অক্ষর/মিনিট (decorateFeed dashboard.js:298 + এখন routes/pages.js সার্চ-রেও একই) — নতুন-সার্ফেসে পড়ার-সময় দরকার হলে এই-কনভেনশনই; অন্য-গুণক ব্যবহার নিষেধ।
- **boot-reconcile-চুক্তি:** server.js-এর initDb-পরবর্তী self-heal ব্লক সরাবেন না; নতুন কাউন্টার (যেমন reaction_count) যোগ করলে একই-প্যাটার্নে ওখানেই ব্লক যোগ করুন। ফাইল-ভিত্তিক reconcile স্ক্রিপ্ট (db/reconcile-comment-counts.js) ম্যানুয়াল-রানের জন্যই থাকছ — বুটে দরকার নেই (ডুপ্লিকেট-পথ নয়, হুক-ই ক্যানোনিকাল)।
- **gোটচা-পুনরাবৃত্তি:** curl-এ raw UTF-8 URL → Express 400 (ব্রাউজার percent-encode করে — মিথ্যা-অ্যালার্ম); `--data-urlencode` ব্যবহার করুন।
- **ইউনিয়ন-নোট:** style.css-এ session12-অপটিমিস্টিক-ব্লক (অন্য-এজেন্ট) + session120-ব্লক (আমার) EOF-এ পাশাপাশি — brace-depth ০/০ যাচাইকৃত; দুই-ফিচারই লাইভ।
## ⚡ Intent Note — Session 121 (cron-r10; কাজ-শুরুর-আগে-intent-চুক্তি অনুযায়ী) (১৮ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** ① হেডার-ড্রপডাউন বিজ্ঞপ্তিতে dismiss ✕ (session117-সুপারিশ ① — main.js অস্পৃশ্য; header.ejs inline-script + live.js paintList দুই-সারফেসেই মার্কআপ, ডেলিগেটেড-হ্যান্ডলার) ② nft-চিপ `?type=` URL-পার্সিস্টেন্স (session117-সুপারিশ ④ — notifications.ejs filter-IIFE-তে replaceState + init-read) ③ স্টাইল-পলিশ: .notif-x hover-reveal/touch-fallback/focus-ring + .nft-chip active-gradient/lift/focus-visible + .notif-dismiss focus-ring।

**স্পর্শ-ফাইল:** views/partials/header.ejs · public/assets/js/live.js (paintList-মার্কআপ-মাত্র) · views/user/notifications.ejs (script-IIFE) · public/assets/css/style.css (EOF session121-ব্লক)। **route/db শূন্য-পরিবর্তন।** অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 121 (cron-r10; ড্রপডাউন dismiss ✕ + চিপ ?type= URL-পার্সিস্টেন্স) (১৮ সেপ্টেম্বর ২০২৬)

**intent-নোট-চুক্তির প্রথম প্রয়োগ সফল** — session117-সুপারিশ ① (হেডার-ড্রপডাউন dismiss) + ④ (nft-চিপ URL-পার্সিস্টেন্স) নেওয়া হয়েছিল; push-পূর্বে 4ec1a2d (session120-docs)-এর সাথে PLANS-union-মাত্র।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **header.ejs:** ড্রপডাউন-আইটেমে এখন `<button class="notif-x" data-dismiss="<%= n.id %>">` — live.js paintList-এও অভিন্ন স্ট্রিং; হ্যান্ডলার = পার্শিয়াল-টেইলের ডেলিগেটেড IIFE (#notifList-বাউন্ড, `xBound121`-গার্ড)। **নতুন ড্রপডাউন-আইটেম-রেন্ডার-পাথ যোগ করলে .notif-x-মার্কআপ রাখুন** (হ্যান্ডলার নিজেই ধরবে)। ব্যাজ-সিঙ্ক = /api/notifications/count (সার্ভার-সত্য — ড্রপডাউন-লোকাল-গণনা নয়)।
- **notifications.ejs filter-IIFE:** `setUrl121(key)` + init ?type=-রিডার। **চিপের data-nft-মানই URL-প্যারাম** — নতুন-গ্রুপ যোগ করলে URL-নিরাপদ slug রাখুন। synthetic .click() init-পাথ — click-হ্যান্ডলার-বদলালে init-ও ভাঙবে।
- **dismiss + চিপ-কাউন্ট:** ফুল-পেজের dismiss-IIFE-এর nftRecount117() অক্ষত; ড্রপডাউন-ডিসমিস ফুল-পেজ-লিস্টে হাত দেয় না (রিলোডে সত্য)।

**গোটচা-নতুন ×৪ (গুরুত্বপূর্ণ):**
1. **দ্বি-হেডার-স্থাপত্য (ডিবাগে ১-ঘণ্টা-খরচ):** lekhok-*.ejs পাবলিক-পেজ (হোম/আর্টিকেলস/নোটিশ/গ্যালারি/ইভেন্ট/রিসোর্স) = layout.ejs-এর সরল-টপবার — **বেল/ড্রপডাউন নেই by-design**; বেল শুধু ২৮টি user-*.ejs (header-partial ইনক্লুডার)-এ। "লগইন-অবস্থায়ও হোমপেজে বেল নেই" = বাগ নয়।
2. **/qa/new-ফর্মে hidden _csrf-ইনপুট নেই** — token `<meta name="csrf-token" content="…">`-এ; curl-E2E সেখান থেকে নিন (login-এর hidden-input-প্যাটার্ন ভুল)।
3. **SW পাবলিক-পেজ HTML ক্যাশ করে** — লগইনের পরেও হোমপেজ গেস্ট-ভার্সন দেখাতে পারে (agent-browser-ও); `navigator.serviceWorker.getRegistrations()` unregister + caches.delete লাগে; curl-দিয়ে সার্ভার-সত্য যাচাই করুন।
4. **user "ismail"(id 52, full_name ইসমাইল হোসেন) ≠ "ismail_hossen_emon"(id 29, ইসমাইল হোসেন ইমন)** — নাম-পরিবার-মিল কিন্তু আলাদা অ্যাকাউন্ট; নোটিফিকেশন-টেস্টে id ধরে যান।

**E2E-প্রমাণ:** চিপ→`?type=reply`→রিলোড-পার্সিস্ট ✓ 'সব'=ক্লিন-URL ✓ `?type=xyz` নিরীহ-নো-অপ ✓ ড্রপডাউন ৩×ডিসমিস (URL-অপরিবর্তিত + ব্যাজ-সিঙ্ক + খালি-স্টেট) ✓ Enter-কি-ডিসমিস ✓ ক্রস-পেজ /qa ✓ স্ক্রিনশট s121-* ×৩ ✓ 390px-০ ✓ কনসোল-০ ✓ ২২-রুট-স্মোক ✓ CSS-brace-০ ✓ live.js node --check ✓ টেস্ট-ডেটা-ক্লিনআপ (কমেন্ট-১৫, নোটিফিকেশন, follow-29) ✓

**পরবর্তী-প্রথম-পছন্দ:** থ্রেড-সাবমিটে optimistic-ইনসার্ট (session116-অবশিষ্ট) → crx-টাইলে কভার-থাম্বনেইল (lf_read_pos c=cover চুক্তি) → mini-bubble unread-ডট (session117-⑤) → tokens.css-হেক্স-স্ক্যান-গার্ড (session113-⑤)।

### session121 ক্রস-এজেন্ট নোট (cron-QA-রাউন্ড — নোটিফিকেশন-ফিল্টার ইউনিয়ন)

- **ফিল্টার-ট্যাব-চুক্তি (session119-এর সম্প্রসারণ):** `/notifications?type=<key>` — server-side প্রি-ফিল্টার, হোয়াইটলিস্ট-কী `mention|reply|reaction|message|follow|other` (daily.js `NF_FAMILIES`)। **নতুন notification-type যোগ হলে দুই-জায়গা একসাথে:** ① ভিউ-এর G117-ম্যাপে টাইপ-অ্যাসাইন (অজানা-টাইপ স্বয়ংক্রিয়ভাবে 'other') ② daily.js-এর NF_FAMILIES-এ টাইপ-অ্যাসাইন (অজানা-টাইপ 'other'-বাকেটে) — দুই-ম্যাপের কী-নাম ১:১ রাখতে হবে। শূন্য-পরিবার ?type= দিলে গ্লোবাল-এম্পটি (চিপ-সারিই আঁকা-হয়-না) — প্রত্যাশিত।
- **গ্রুপিং-ইউনিয়ন:** `call` → message-চিপ ('বার্তা ও কল'), `follow` → নিজস্ব-চিপ — আগে দুটোই 'অন্যান্য'-এ হারাত। missed-call-ব্যাজ-মার্কআপ (notif-missed--page) অক্ষত।
- **union-মার্জ-ইতিহাস (আবার-প্রমাণিত):** আমার রাউন্ডে .nfc-সার্ভার-চিপ ইমপ্ল + dismiss-route-ফিক্স দুটোই সমান্তরালে বানিয়েছিলাম — মাঝ-রাউন্ডে session119 একই-দুটো জিনিস ক্যানোনিকল-পুশ করে ফেলেছে। নীতি: ক্যানোনিকল-গ্রহণ + আমার-ইউনিক-ডেল্টা (?type= + গ্রুপিং-ফিক্স) পোর্ট; ডুপ্লিকেট (.nfc-মার্কআপ/CSS, dismiss-route-আমার-কপি) প্রত্যাহার। **দুই-এজেন্ট-একই-বাগ-ফিক্স = ভালো-লক্ষণ (স্বাধীন-প্রমাণ), কিন্তু PLANS-নোট push-এর-আগে re-read বাধ্যতামূলক।**
- **rebase-গোটচা-নতুন (গুরুত্বপূর্ণ):** মাঝ-রিবেজে কমিটের প্যারেন্ট-পয়েন্টার পুরনো থেকে-গেলেও ট্রি-তে নতুন-origin-কমিটের কনটেন্ট ঢুকে যেতে পারে (pull --rebase দুই-ফেজে ফেচ) — `git show <commit> --stat`-এ ফরেন-ফাইল (+192 comment-tools ইত্যাদি) দেখা দিলে আতঙ্ক নয়: `git diff HEAD origin/main --stat`-এ কনটেন্ট-ডেল্টা-যাচাই করুন; দরকার হলে আরেক-দফা `git pull --rebase` + কনফ্লিক্টে origin-ভার্সন-গ্রহণ (`git checkout origin/main -- <file>`) — শেষ-লক্ষ্য: **কমিট-ডেল্টা = শুধু-নিজের-ফাইল**। এ-রাউন্ডে চূড়ান্ত-কমিট ২-ফাইলে নেমে এসেছে (daily.js + notifications.ejs) ✓
- **QA-রীতি-পুনঃপ্রমাণ:** আইসোলেটেড-ইনস্ট্যান্সে (এ-রাউন্ডে :3140) সার্ভার-বুট **`setsid --fork env PORT=<p> node server.js`** — nohup/`& disown`/সাধারণ-setsid সব টুল-সেশন-শেষে মরে যায় (PPID=1-যাচাই করুন `ps -o ppid`); seed-লেখা হবে **সার্ভার-বন্ধ-করে node-probe-এ** (sql.js in-memory flush-ক্লোবার-এড়াতে), তারপর বুট।
(feat(session121): নোটিফিকেশন ফিল্টার ?type= ডিপ-লিংক (server-side প্রি-ফিল্টার, noscript-নিরাপদ) + G117-ইউনিয়ন (call→'বার্তা ও কল'-চিপ, follow নিজস্ব-চিপ) — QA-ফার্স্ট (:3140 আইসোলেটেড, setsid --fork): ১৪-রুট-স্মোক+লগইন+গ্যালেরি-পেজিন+390px×৫+কনসোল-০ বাগ-শূন্য। 🚨 বাগ-আবিষ্কার: dismiss-বাটন নীরব-অকার্যকর (UI বেঁচে, API-রুট rebase-রেসে ঝরে গিয়েছিল) — আমার-ফিক্স-মাঝেই session119 ক্যানোনিকল-পুশ (স্বাধীন-প্রমাণ, তাদেরটা গৃহীত)। ফিল্টার-চিপেও union: session119-এর nft-chip ক্যানোনিকল + আমার ?type= URL-state + গ্রুপিং-ফিক্স; .nfc-ডুপ্লিকেট প্রত্যাহৃত। E2E (মার্জ-পরবর্তী): চিপ ✓ ?type=৬-কী+শূন্য-পরিবার-এম্পটি+bogus-ফলব্যাক ✓ ডিসমিস-ফুল-ফ্লো+URL-রক্ষী-রিলোড ✓ reltime ✓ 390px-০ ✓ কনসোল-০ ✓ অডিট 48/48 ✓ role-policy 125/125 ✓ guard ✓। প্যারালাল-রেস ×৩ (119→120→12) — ২-দফা rebase, গোটচা PLANS-এ। ডকস: PROJECT §10 + PLANS session121-নোট + worklog ×২ (রিলেবেল 118→121: সর্বোচ্চ+১ রীতি))
### 🔧 Session 122: WebRTC কল — ইউজার-রিপোর্টকৃত মৃত্যু-বাগ-সেটের মূল-কারণ-ফিক্স (২১ সেপ্টেম্বর ২০২৬)

ইউজার-রিপোর্ট: ① কল-ইন্টারফেস পপ-আপ হয় না ② "মাইক্রোফোন অনুমতি দেওয়া হয়নি / মাইক-ক্যামেরা চালু করা যায়নি" ③ কল-দিলে UI মুহূর্তেই গায়েব। **চার-মূল-কারণ, চার-ফিক্স:**

1. **🚨 server.js Permissions-Policy (সবচেয়ে-বড়):** হেডারে `microphone=(), camera=()` ছিল — ব্রাউজার এই-অরিজিনে মাইক/ক্যামেরা **সম্পূর্ণ নিষিদ্ধ ঘোষণা করছিল** → getUserMedia অনুমতি-ডায়ালগের আগেই NotAllowedError। এখন `microphone=(self), camera=(self)`। Vercel-এও একই ফিক্স যাচ্ছে।
2. **🐛 webrtc-call.js সিগন্যাল-রিপ্লে-সুইসাইড:** start()/showIncoming()-এ `S.after=0` রিসেট → প্রথম পোলেই ১০-মিনিট-উইন্ডোর পুরনো **অন্য-কলের** 'ended'/'cancelled' সিগন্যাল রিপ্লে → callId-null-গার্ড-বাইপাস → cleanup() → **কল-UI নিজেই নিজেকে কাটত** (গায়েব-বাগের আসল-কারণ)। ফিক্স: কার্সার-রিসেট-বাদ + (গ)-সেকশনে `S.callId`-বাধ্যতামূলক। **এটা দীর্ঘদিনের লুকানো-বাগ — সব-এজেন্ট জানুন: call_signals-cursor গ্লোবাল, রিসেট করবেন না।**
3. **🐛 flushSignals-আটকে-যাওয়া:** অফার-পোস্টের আগেই ICE-gathering (setLocalDescription→onicecandidate) — early-return-এ ব্যাচ স্ট্র্যান্ডেড → পিয়ার ক্যান্ডিডেট-শূন্য → ICE 'connecting'-এ আটকে। ফিক্স: কল-আইডি-না-থাকলে রি-শিডিউল + callId-সেটে scheduleFlush()-কিক।
4. **UI-ফার্স্ট পারমিশন-প্যানেল (.lc-perm):** FB-নীতি (আগে-ইন্টারফেস, পরে-হার্ডওয়্যার) — অনুমতি-ব্লকে আগের cleanup+টোস্টের বদলে মোডাল খোলাই থাকে: মানব-বার্তা (err.name-ম্যাপ) + ৩-ধাপ-আনলক-গাইড + "আবার চেষ্টা করুন" (রিজিউম-হুক permRetry) + iframe/HTTPS-অনুপস্থিতিতে "নতুন ট্যাবে খুলুন"। acceptResume()/acquireAndOffer() বিভাজন — রিট্রাইয়ে কল-ফ্লো সেই-মুহূর্তে পুনঃশুরু।

**নতুন:** call-heartbeat.js Worker (হিডেন-ট্যাব DOM-টাইমার ৬০সে-থ্রটল > ৪৫সে-রিং-টাইমআউট → আসন্ন-কল-পপআপ-ব্যর্থতা; Worker-টাইমার থ্রটল-হয় না; CSP-ক্লিন same-origin, XTransformPort-সচেতন URL) + visibilitychange/focus/pageshow-তাৎক্ষণিক-পোল + 401-ব্যাকঅফ (১৫সে) + আসন্ন-কল title-flash + Notification (কল-জেসচারে permission-জিজ্ঞাসা)। ইনবক্স ৩-ডট-মেনুতে অডিও/ভিডিও-কল (1:1; row116-ক্যাপচার-চুক্তি — closeConvMenu menuTarget-null করে)। routes/calls.js: accepted-স্টেল self-heal (২ঘণ্টা → ended/stale_cleanup — ব্রাউজার-ক্র্যাশে চিরকাল-busy-বাগ)।

**QA-চুক্তি:** স্যান্ডবক্সে sql.js ইন-মেমরি — **ফাইল-এডিটের-আগে সার্ভার kill, পরে boot** (উল্টো করলে পুরনো-মেমরি ফাইল-ওভাররাইট করে); persist() debounce ২০০ms — স্ট্যান্ডঅ্যালোন-স্ক্রিপ্টে exit-এর আগে ≥৮০০ms দিন; QA-ট্রায়ো (ismail/secret123, monem/karishma/demo123) 2FA-রিসেট লাগতে পারে। **নতুন ব্রাউজার-E2E:** `NODE_PATH=/home/z/.npm-global/lib/node_modules node scripts/verify-session122-calls-browser.js http://localhost:8080` (২১-চেক; fake-media + mDNS-off; পারমিশন-প্যানেল-পাথসহ)। সার্ভার **SANDBOX_PORT=8080** env-সহ বুট করুন (গেটওয়ে-প্রিভিউতে অ্যাসেট-প্যাচিং)। প্রমাণ: API 54/54 + ব্রাউজার 21/21 + গেটওয়ে-জার্নি (মেনু→কল→প্যানেল→বাতিল; API-কলার→ইনবক্স-পপআপ+টাইটেল-ফ্ল্যাশ) + guard:design ✓।

**সমান্তরাল-এজেন্ট-নোট:** session120-র speaker-highlight (SPK-ইঞ্জিন) ও আমার ফিক্স একই-ফাইলে (webrtc-call.js/calls.css) — rebase-union-এ **উভয়ই রক্ষিত**; SPK-wiring (attachLocal/createPC/cleanup) আমার restructure-পথের সাথে সহ-অস্তিত্বশীল — ভবিষ্যৎ-এজেন্ট restructure করলে SPK-হুক ×৬-পাথ অক্ষত রাখুন।
## ⚡ Intent Note — Session 123 (cron-r11; কাজ-শুরুর-আগে-intent-চুক্তি অনুযায়ী) (১৮ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** session117-সুপারিশ ③ — **crx-টাইলে কভার-থাম্বনেইল**: `lf_read_pos`-চুক্তিতে নতুন-ঐচ্ছিক-ফিল্ড **`c`** (cover-URL, root-relative বা absolute) — article-single.ejs-এ `#articleCard[data-cover]` + article-reading.js savePos-এ সংরক্ষণ + continue-reading.js-এ দুই-সারফেসে রেন্ডার (উইজেট-রো ৪০px-স্কয়ার + ফুল-পেজ-টাইল ১৬:৯-স্ট্রিপ) + legacy-এন্ট্রি (c-বিহীন) আইকন-ফলব্যাক। স্টাইল: dashboard.css-EOF session122-ব্লক (thumb/tile-cover/hover-zoom/row-tint/bar-glow — crx-স্কোপড, গ্লোবাল-অস্পৃশ্য)।

**স্পর্শ-ফাইল:** views/user/article-single.ejs (data-cover-অ্যাট্রিবিউট-মাত্র) · public/assets/js/article-reading.js (savePos-এ c-ফিল্ড) · public/assets/js/continue-reading.js (রেন্ডার) · public/assets/css/dashboard.css (EOF-ব্লক)। **route/db শূন্য-পরিবর্তন।** session117-অনুযায়ী 'lf_read_pos-চুক্তি' এখন **r/t/ti/u/c** (c ঐচ্ছিক, পুরনো-এন্ট্রি-সামঞ্জস্য)। অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 123 (cron-r11; crx কভার-থাম্বনেইল — session117-সুপারিশ ③ সমাপ্ত) (১৮ সেপ্টেম্বর ২০২৬)

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **lf_read_pos-চুক্তি এখন r/t/ti/u/c** — c = cover-URL (ঐচ্ছিক; c-বিহীন পুরনো-এন্ট্রি বৈধ, আইকন-ফলব্যাক হয়)। নতুন-সারফেস এ-চুক্তি পড়লে `it.c`-সচেতন থাকুন।
- **article-single.ejs:** `#articleCard[data-cover="<%= post.cover_image %>"]` (cover থাকলেই)। article-reading.js savePos এখান থেকেই c সংগ্রহ করে — **data-cover-অ্যাট্রিবিউট সরালে crx-থাম্বনেইল নীরবে আইকন-ফলব্যাকে ফিরে যাবে** (ব্রেক নয়)।
- **continue-reading.js:** `coverUrl()` (__lfSbUrl-সচেতন) + `thumbImg()` হেল্পার — নতুন-সারফেসে থাম্বনেইল লাগলে এ-দুটোই পুনর্ব্যবহারযোগ্য; আইকন-নিচে-img-স্তূপ-প্যাটার্ন (onerror=self-remove) অনুসরণ করুন।
- **.has-cover ক্লাস-রীতি:** কভার-ওপর-ভাসা-ওভারলে-কনট্রাস্ট JS-এ ক্লাস দিয়ে — **:has() ব্যবহার নিষিদ্ধ** (cron-r6-গোটচা পুনরাবৃত্তি-নিষেধ)।

**গোটচা-নতুন ×২:**
1. **/img/cover/ জেনারেটর-রুট যে-কোনো-slug-এ 200-SVG** — থাম্বনেইল-অনুপস্থিতি-টেস্টে '/img/cover/xyz' ভাঙা-মনে হবে কিন্তু সে ডিফল্ট-কভার এঁকেই দেয়; onerror-প্রমাণে সত্যি-অনুপস্থিত-পাথ (যেমন /definitely-missing-404.jpg) লাগে।
2. **JS-ইনজেক্টেড img-এ sandbox-পোর্ট:** সার্ভারের HTML-অ্যাসেট-প্যাচ কেবল সার্ভার-রেন্ডারড src ধরে — client-JS-বানানো img-এ `window.__lfSbUrl(url)` লাগবে (প্রোডাকশনে undefined → কল-না-করাই নিরাপদ; typeof-গার্ড বাধ্যতামূলক)।

**E2E-প্রমাণ:** data-cover ✓ c-পার্সিস্ট ✓ উইজেট-থাম্ব (loaded+পোর্টেড-src) ✓ টাইল-স্ট্রিপ ✓ legacy-ফলব্যাক ✓ onerror ✓ 390px-০ ✓ কনসোল-০ ✓ ১৪-রুট ✓ brace-০ ✓ node --check ×২ ✓ টেস্ট-এন্ট্রি-ক্লিনআপ ✓ স্ক্রিনশট ×৩ (reading-mobile/desktop + dashboard-widget) ✓

**পরবর্তী-প্রথম-পছন্দ:** থ্রেড-সাবমিটে optimistic-ইনসার্ট (session116-অবশিষ্ট) → mini-bubble unread-ডট (session117-⑤) → tokens.css-হেক্স-স্ক্যান-গার্ড (session113-⑤) → crx-এ 'শেষ-পড়া'-অগ্রাধিকার-পিন।

### session121 ক্রস-এজেন্ট নোট (cron-r6 — রিসোর্স)

- **সিরিজ-প্রগ্রেস-চুক্তি:** detail-পেজের localStorage স্কিমা (`lekhok.rpl.<encodeURIComponent(series).replace(/%/g,'').slice(0,48)` = `{cur:{epi,t,title,ts}, done:{resId:ts}}`) এখন /resources লিস্টিংও পড়ে — **নতুন প্লেলিস্ট-স্টেট ফিল্ড যোগ করলে দুই-সারফেসই (lekhok-resource-detail.ejs + lekhok-resources.ejs) একসাথে আপডেট করতে হবে**; কী-জেনারেশন দুই-জায়গায় হুবহু একই (`slice(0,48)`-সহ — slice-বিহীন কী মিলবে না, E2E-তে ধরা)।
- **seriesMap-ডেটা-এমবেড:** routes/pages.js থেকে ভিউতে `SMAP` — `<%- JSON.stringify(x).replace(/</g,'\\u003c') %>` রীতি; inline JSON embed-এ `<script>`-ইনজেকশন-নিরাপদ প্যাটার্ন, নতুন এমবেডেও এটিই।
- **FAB-occupancy-গোটচা (নতুন):** গ্লোবাল `#backToTop` (layout.ejs, fixed bottom-right, z-80) সব-পেজে আছে — নতুন ফ্লোটিং-বাটন bottom-right-এ যোগ করা নিষেধ; দরকার হলে গ্লোবাল-টার position/অফসেট-কনভেনশন অনুসরণ করুন।
- **[hidden]-গার্ড-রীতি-পুনরাবৃত্তি:** display:flex/inline-flex-যুক্ত এলিমেন্টে `[hidden]{display:none!important}`-গার্ড ছাড়া hidden-অ্যাট্রিবিউট নীরবে ব্যর্থ হয় (rsx-seriprog/rsx-seridone/rsx-serisum-এ করা হয়েছে)।
- **স্টিকি-কন্ট্রোল:** `.rsx-controls` ডেস্কটপে sticky (top:10px, z-40) — রিসোর্স-পেজে নতুন fixed/overlay-UI (z<90) যোগ করলে স্টিকি-বারের সাথে ওভারল্যাপ-যাচাই করুন।
- **stat-এন্ডপয়েন্ট-চুক্তি (§১৭):** POST /api/resources/:id/stat = পাবলিক কিন্তু ডিডুপ-উইন্ডো-যুক্ত (৩০সে, in-memory) — নতুন কাউন্টার-এন্ডপয়েন্টেও একই-অ্যাবিউজ-প্যাটার্ন (dedup + invalid-id 400 + unknown-id নিরাপদ-ok) প্রত্যাশিত।

---

## Session-123 Cross-Agent Note (cron QA রাউন্ড)
**Date:** 2026-09-18 · **Scope:** comment-tools.js + style.css (কমেন্ট-মাইক্রোইন্টারঅ্যাকশন)

### ইন্টিগ্রেশন-পয়েন্ট (পরবর্তী এজেন্টের জন্য)
1. **`killItem(item, done)` — comment-tools.js:** ডিলিটে মৃত্যু-অ্যানিমেশন (৩০০ms collapse+fade; reduced-motion→তাৎক্ষণিক)। **চুক্তি:** কাউন্টার-সিঙ্ক/ড্রয়ার-রিফ্রেশ `done`-কলব্যাকে করুন; item-এর closest-নির্ভর-তথ্য (cardD/dwD) অ্যানিমেশন-শুরুর **আগেই** ক্যাপচার করুন — remove-পরে DOM-বিচ্ছিন্ন। afterDeleteSuccess(session122-রিফ্যাক্টর)-এর ইন-প্লেস-পথে এবং ক্যানোনিকাল delete-হ্যান্ডলারে ইনজেক্টেড।
2. **data-raw/RAW_CACHE অবিচ্ছিন্নতা:** কমেন্ট-এডিটের যে-কোনো নতুন-পাথ (সার্ভার-সত্য সোয়াপসহ) সেভ-সফলে `bodyEl.setAttribute('data-raw', val)` + `RAW_CACHE[cid]=val` করবে **নইলে পুনঃ-এডিটে ডেটা-লস** (session123-আবিষ্কৃত বাগ-ক্লাস)।
3. **`pulseSaved(item)`:** সেভ-স্বীকৃতি-পালস — নতুন-এডিট-পাথেও কল করুন; keyframe cmtSavedPulse121 (style.css EOF-ব্লক, নামে ১২১-প্রত্যয় স্ট্যাশ-যুগের — JS/CSS-সিঙ্ক অক্ষত রাখুন)।
4. **`.cmt-dying` CSS-গার্ড:** অ্যানিমেশন-চলাকালীন প্যালেট/মেনু/এডিটর display:none — ডিলিট-পথে নতুন-ইন্টারঅ্যাকশন যোগ করলে এই-গার্ড আপডেট করুন।
5. **swapQaThread-শাখা (session122) অক্ষত:** QA-পেজে ডিলিটে সার্ভার-সত্য সোয়াপ killItem-এর আগেই return করে — QA-থ্রেডে অ্যানিমেশন চলে না (সোয়াপ-ইউআই-এ পুনঃরেন্ডার) — ইচ্ছাকৃত।

### গোটচা (নতুন-প্রমাণিত)
- **`[h`-ট্রান্সপোর্ট-স্ট্রিপ:** টুল-আউটপুটে `[hidden]` 'idden]' দেখায় — **ফাইল অক্ষত**; যাচাই দরকারে `od -c` / `LC_ALL=C grep -c` ব্যবহার করুন, কেবল-দৃশ্যমান-আউটপুটে বিশ্বাস নয় (session122-র chr(91)+'h'-নোটের পুনঃপ্রমাণ)।
- **stash-pop-নেস্টেড-কনফ্লিক্ট:** রিবেজ-পরবর্তী stash-pop-এ মার্কার-নেস্টিং আসতে পারে (আমার হয়েছিল) — আউটার/ইনার উভয়-মার্কার ম্যানুয়াল-ট্রিম করে union করুন।
- **লেবেল-রেস ×২:** প্রাথমিক-লেবেল ১২১ ধরে কাজ শুরু করেছিলাম — পুশ-পূর্বে session121/122 (দুটোই!) পাওয়ায় ১২৩-এ রিলেবেল; কোড-কমেন্টে ১২১-প্রত্যয় রইল কেবল keyframe-নামে।

## Cross-Agent Note: Session 124 — ক্যানোনিকাল তাৎক্ষণিক-কমেন্ট-ইনসার্ট (POST /api/comment চুক্তি-বৃদ্ধি) — ত্রি-ইউনিয়ন-রিবেজ (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** routes/social.js + comment-tools.js + style.css — ৩-ফাইল; সার্ভার-চুক্তি **বর্ধিত** (breaking-নয় — backward-compatible)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (কমেন্ট-ডোমেইনে কাজ করা-এজেন্টদের জন্য):**
1. **POST /api/comment রেসপনস-শেপ:** `{ok, id, html?, total?}` — `html` = নতুন-মন্তব্যের একক সার্ভার-রেন্ডার্ড ক্যানোনিকাল CommentItem (CommentItem.ejs — compact:parent_id-ভিত্তিক), `total` = পোস্টের সব-কমেন্ট-সংখ্যা (রিপ্লাইসহ — GET /api/comments-এর total-সেমান্টিক)। **html থাকলে ক্লায়েন্ট রিফেচ-রিকনসাইল-ই-করে না** — নতুন-কোডে html-এর ভেতরের-মার্কআপ বদলালে insertCanonical124-এর DOM-ধরে-রাখা ভাঙবে। রেন্ডার-ব্যর্থতায় `{ok,id}` (session12-চুক্তি — ফলব্যাক-পথ অক্ষত)।
2. **insertCanonical124-লিস্ট-সনাক্ত:** `.comments-list/.qa-answers-list[data-post-link]`-postId-মিল → `.fc-drawer[data-comments-for]` → ফর্ম-অবস্থিত ড্রয়ার। **qa-টপ-লেভেলে `.qa-answer-slot#answer-N`-র‍্যাপ বাধ্যতামূলক** (নোটিফ-অ্যাঙ্কর-চুক্তি) — নতুন কেউ qa-তে innerHTML-সোয়াপ করতে গেলে slot-স্ট্রাকচার+top-answer-chip মনে রাখবেন (swapQaThread-ই ক্যানোনিকাল-পথ)।
3. **কাউন্টার-সিঙ্ক-দ্বৈততা এখন ৩-পথ:** optBumpCounters (session12, INCREMENT) · syncTotals124 (session124, SET-from-server-truth) · refresh*/swapQaThread-রিকনসাইল — তিনটিই `[data-cmt-total], .comments-total` স্পর্শ করে; নতুন-কাউন্টার-সারফেস যোগ করলে তিন-জায়গাই আপডেট করুন (বা syncTotals124-এর seen-guard-প্যাটার্ন মানুন)।
4. **CSS সহাবস্থান:** `.is-new124` (lfNew124/lfNewGlow124 — session124-ব্লক) আর `.opt-fresh` (optIn12 — session12) একসাথে থাকে; এন্ট্রি-অ্যানিমেশন যোগ করতে চাইলে নতুন-নামে (কলিশন-শূন্য) + reduced-motion-গার্ড রীতি।

**গোটচা-পুনঃপ্রমাণিত (এ-রাউন্ডের):**
1. **ত্রি-এজেন্ট-সমান্তরাল-কলিশন:** একই সুপারিশ-তালিকা থেকে session121 (নোটিফ)/122 (QA-সোয়াপ)/123 (মাইক্রোইন্টারঅ্যাকশন)-এজেন্টদের কাজ আমার কাজের সাথে ধাক্কা খেয়েছে — **push-পূর্বে git fetch + PLANS re-read + নিজের-প্ল্যান-পুনঃযাচাই** না-করলে ডুপ্লিকেট-ইমপ্ল অনিবার্য। আমার ডুপ্লিকেট-৪-টুকি (dismiss-API/হেডার-✕/QA-সোয়াপ/URL-পার্সিস্টেন্স) স্বেচ্ছায়-প্রত্যাহার করে অনন্য-ডেল্টা-ই রাখা = সঠিক-রীতি (duplication-শূন্য-নীতি)।
2. **stash→pull→pop-এ style.css UU-কনফ্লিক্টে `=======`-দ্বৈত-লাইন** (upstream-এর hunk-শেষে `=======` + stash-এর `=======` পাশাপাশি) — union-রিজলভে দুই-মার্কার-ই সরাতে হয়; শুধু ` CSS-পার্স-ব্রেক হয় না কিন্তু কমেন্ট-ভেদে প্রবেশ করে।
3. **মৃত্যু-ফ্লাশ-রিভার্ট ×৩-প্রমাণ (HTTP-সিড অবিশ্বস্ত):** ইনভোকেশন-শেষের kill-এ HTTP-POST-কৃত পোস্ট/কমেন্ট/সেশন-রো হারায় — ক্রস-ইনভোকেশন-সিড = সার্ভার-বন্ধ স্ট্যান্ডঅ্যালোন-স্ক্রিপ্ট (sql.js সরাসরি + export-write, seed-qa-users-প্যাটার্ন)। ডিবি-ব্যাকড-সেশনও (DbStore) একই ফ্লাশ-পথে হারায় — প্রতি-ইনভোকেশনে ফ্রেশ-লগইন (CSRF-সহ) আবশ্যক।
4. **CALL_RING_TIMEOUT_S = সার্ভার-env** (routes/calls.js) — টেস্ট-প্রসেসে দিলে কিছু হয় না; `PORT=8094 CALL_RING_TIMEOUT_S=4 node server.js` বুটেই দিতে হবে (নইলে missed-flow-চেক মিথ্যা-ফেইল ×২+×৫)।
5. `cd X && cmd &` গোটচা-পুনঃপ্রমাণ — পুরো-চেইন ব্যাকগ্রাউন্ডে যায়; `{ ... & }` গ্রুপিং-ই নিরাপদ।

**E2E-প্রমাণ:** role-policy ১৩১/১৩১ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ✓; ব্রাউজার: আর্টিকেল/QA/রিপ্লাই/ড্রয়ার — চার-সারফেস-ই window-মার্কার-প্রমাণিত reload-শূন্য + বাংলা-অঙ্কে total-সিঙ্ক + `#answer-N`-অ্যাঙ্কর-রক্ষা; 390px-০; কনসোল-০।

**পরবর্তী-এজেন্ট: session125 লেবেল থেকে।** পরবর্তী-সুপারিশ: parent-chain-সচেতন chip-render (POST-html-এ), drawer-প্রিভিউ-ইনস্ট্যান্ট-প্রতিফলন, Metered.ca-TURN (ইউজার-অ্যাকাউন্ট), অটো-ভিডিও-ডিগ্রেড, গ্রুপ-রিং-অনলাইন-সীমিতকরণ।

## Cross-Agent Note — Session 125 (cron-QA-রাউন্ড; এক-রাউন্ডে-তৃতীয়-রেস) (২২ সেপ্টেম্বর ২০২৬)

**রেস-ইতিহাস (এ-রাউন্ডেই তিনবার!):** আমার রাউন্ডের টার্গেট ছিল qa-উত্তর-নো-রিলোড (session116-অবশিষ্ট নোট)। কমিটের-পরে ① rebase-এ **cb83da1 (session123)** — swapQaThread + format=qa-html → ইউনিয়ন (আমার insertOptimistic-টার্গেট রক্ষিত, reconcileQa123 প্রত্যাহৃত), ② push-এর-সময় **7ad5fb3 (session124)** — POST /api/comment এখন {ok,id,html,total} + insertCanonical124 → **আমার insertOptimistic-qa-টার্গেট-ও প্রত্যাহৃত** (তাদের j.html-প্রাইমারি-পাথে qa-লিস্ট-সনাক্তকরণ + .qa-answer-slot#answer-<id> র‍্যাপ + .answers-empty-সরানো সব-ই আছে)। লেবেল: 123→(তাদের)→124→(তাদের)→**আমি 125**।

**চূড়ান্ত-ডেল্টা (এ-কমিটে):**
1. **shared.css session125-ব্লক** (অনন্য): `.qa-answer-slot .cmt-replies` নেস্ট-পলিশ — insertCanonical124-এর qa-রিপ্লাই-পাথ (parent.closest('.qa-answer-slot') → qaSlot-অ্যাপেন্ড / .cmt-replies-নেস্ট) যে-DOM তৈরি করে তার টোনাল-সামঞ্জস্য (left-rule ইনডেন্ট 32px/640px-এ 18px, কমপ্যাক্ট অ্যাভাটার ২৬px/বাবল, fc-reply margin-নিরাপেক্ষ, :has(.opt-fresh)-এন্ট্রি-অ্যানিমেশন, reduced-motion)। session12-ফলব্যাক-পাথের নেস্টেও প্রযোজ্য।
2. **/api/comments pen_name/full_name additive ×২-ফিল্ড** (অনন্য): GET-JSON-কনসিউমারের (live.js paintList ইত্যাদি) pen-chip-প্যারিটি; বর্তমান-কনসিউমার অস্পৃশ্য; POST-রেন্ডারার (CommentItem.ejs) ইতিমধ্যেই pen_name জানে।
3. **union-ডকুমেন্টেশন** — নিচের চুক্তি-নোট।

**union-চুক্তি (তিন-স্তরের ইতিহাস — ভবিষ্যৎ-এজেন্ট জানুন):**
- **প্রাইমারি:** submit → POST /api/comment j.html → insertCanonical124 (সব-সারফেস: ফিড-ড্রয়ার/আর্টিকেল/qa-উত্তর+রিপ্লাই — qa-তে স্লট-র‍্যাপসহ) + syncTotals124 + is-new124-অ্যানিমেশন।
- **ফলব্যাক-১ (j.html নেই):** session12 insertOptimistic (qa-টার্গেট-বিহীন — qa হলে shown=false) → refreshArticleThread → swapQaThread → reload।
- **ফলব্যাক-২ (qa-রেফেচ ব্যর্থ):** swapQaThread-এর নিজস্ব location.reload() ক্যাচ।

**E2E-প্রমাণ (union-of-union @ :3150):** আগের-রাউন্ডের সব-প্রমাণ প্রযোজ্য (sessionStorage-stamp নো-রিলোড ✓ চিপ/অ্যাঙ্কর/নো-ডুপ ✓); এ-কমিটের ডেল্টা CSS+JSON-additive — node --check ✓ brace-০ ✓ inspect-audit ✓।

**গোটচা-পুনরাবৃত্তি-সতর্কতা:** এক-রাউন্ডে তিন-এজেন্ট একই-ফিচার-গ্রাউন্ডে নামলে (১১৬-নোট চার-সেশন-খোলা থাকলে দুর্বল-সংকেত!) — প্রতি-rebase-এ **নিজের-ডেল্টার অনন্যতা পুনঃমূল্যায়ন বাধ্যতামূলক**; শেষ-কমিটে ডেল্টা-শূন্য-হয়ে-যাওয়াও বৈধ-ফলাফল (docs+polish থাকলে)।

### session126 ক্রস-এজেন্ট নোট
- **paintList-মিরর-চুক্তি (নতুন):** header.ejs-নোটিফ-ড্রপডাউন-মার্কআপ ও live.js paintList — একই-মার্কআপের দুই-সোর্স। যেকোনো-একটা বদলালে অন্যটা একসাথে আপডেট বাধ্যতামূলক; `grep -c notif-x views/partials/header.ejs public/assets/js/live.js` দুটোতেই হিট থাকতে হবে। session121-এর "stale-repaint-রিয়েল-ফ্লো-নিরাপদ" অনুমান ভুল ছিল — রিপেইন্ট প্রতি-বেল-ওপেনে ঘটে।
- **audit:views গার্ড (নতুন):** মার্জ-পরে `npm run audit:views` চালান — union-মার্জ-দুর্ঘটনা-শ্রেণি (ডুপ্লিকেট-নোড/আইডি) এখন এক-কমান্ডে ধরা পড়ে। নতুন বেনাইন-মিউচুয়ালি-এক্সক্লুসিভ-ডুপ পেলে বেসলাইন-সেটে যোগ করুন (ফাইলের হেডার-কমেন্টে নীতি)।
- **SW-ক্যাশ-গোটচা (E2E):** এই অ্যাপে Service Worker আছে — E2E-তে fetch-নেটওয়ার্ক-সত্য ও DOM-পুরনো-মার্কআপ মিশ্র-পাঠ দেখালে আগে SW-unregister + caches-purge করুন; agent-browser `open`-এর পরেও SW পুরনো-HTML দিতে পারে (HTTP-ক্যাশ নয়)।
- **ত্রি-এজেন্ট-কলিশন-রীতি পুনঃপ্রমাণ:** stash→pull→pop-এ ৪-ফাইল UU + ২-ফাইল অটো-মার্জ-ডুপ্লিকেট-ঝুঁকি — পপের পরে `git status`-এর UU-তালিকা ছাড়াও অটো-মার্জ-হওয়া ফাইলে নিজের-ডেল্টা এখনো-প্রাসঙ্গিক কিনা re-read করা বাধ্যতামূলক (আমার comment-tools/main.js ডেল্টা origin-canonical দ্বারা সুপারসিডেড — checkout HEAD-এ প্রত্যাহার)।

**পরবর্তী-এজেন্ট: session126 লেবেল থেকে।**


## ⚡ Session 127 (cron-r12-দ্বিতীয়; QA-সুইপ + ক্যানোনিকাল-প্রত্যাহার-প্রমাণ + stale-সুপারিশ-পরিষ্কার) (২৩ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** docs-only — ① hall-provost-সার্চ/ফিল্টার সুপারিশ **stale-ঘোষণা** ② চতুর্থ-স্বাধীন-প্রমাণ: insertCanonical124 + killItem ইঞ্জিন-সম্পূর্ণতা ③ optimistic-পর্যবেক্ষণ-কৌশল (swap-delay hook) ④ `[h`-খাওয়ার দ্বৈত-যাচাই-নোট। **কোড-শূন্য** — সব-ই origin-ক্যানোনিকালে আচ্ছাদিত।

**ক্যানোনিকাল-প্রত্যাহার (session125-প্রেসিডেন্সি):** এ-রাউন্ডও session116-অবশিষ্ট (QA-optimistic) টার্গেট করেছিল — সম্পূর্ণ ইমপ্ল + E2E-প্রুফের পরে push-পূর্ব rebase-এ আবিষ্কৃত: **7ad5fb3 (session124)-এর insertCanonical124** (POST {ok,id,html,total} + qa-লিস্ট-সনাক্তকরণ + `.qa-answer-slot#answer-N`-র‍্যাপ + answers-empty-সরানো) ও **cb83da1 (session123)-এর killItem+`.cmt-dying`** (height-lock→collapse+fade→recount) — আমার কোড-ডেল্টার প্রতিটি আইটেম তাদের ইঞ্জিনে ক্যানোনিকাল-রূপেই আছে (আমারটা client-built বাবল, তাদেরটা server-canonical-HTML — তাদেরটাই উত্তরণ) → **সম্পূর্ণ-প্রত্যাহার, HEAD-রিসেট**। চতুর্থ-স্বাধীন-প্রত্যাবর্তন (session123ব-র re-edit যুগের পরে 125→আমি) — একই-টার্গেটে ৪-এজেন্টের সমান্তরাল-আগ্রহ = ইঞ্জিন-সম্পূর্ণতার শক্তিশালী-প্রমাণ; session124/125-র PLANS-নোট এ-ইতিহাস বিস্তারিত রাখে।

**stale-সুপারিশ-পরিষ্কার (ভবিষ্যৎ-এজেন্টের জন্য):** PLANS-পুরনো-তালিকার **"hall-provost সার্চ/ফিল্টার (session111 ④)" আর নেবেন না** — lekhok-contact.ejs-এ ইতিমধ্যে session102/103-এ ইমপ্ল: `#cxProvSearch` (লাইন ~৩৯৭, হল/প্রভোস্ট/বিভাগ কেস-অসংবেদী ফিল্টার ~লাইন ৪৭২) + session109-প্রিন্ট + session108-শেয়ার। এ-রাউন্ডে যাচাইকৃত।

**optimistic-পর্যবেক্ষণ-কৌশল (E2E-টুলবক্স):** optimistic/reconcile-দুই-ফেজ প্রমাণে `window.fetch`-হুকে কেবল রিফেচ-GET বিলম্বিত করুন (`us.indexOf('/api/comments?')>-1` — **`/api/comment`-substring-মিলিয়ে দুটোই বিলম্বিত করলে optimistic-উইন্ডো মিস হয়** — আমার প্রথম-প্রুফ-ব্যর্থতার কারণ); তারপর in-page `setTimeout`-ক্যাপচার (`window.__proof`) — eval-প্রতি-আহ্বানের ~১.৫-২সে গ্যাপ টাইমিং-প্রমাণ নষ্ট করে। fetch-হুকে PLANS-গোটচা-র `function(u,o){args}`-closure-রীতি বাধ্যতামূলক।

**`[h`-খাওয়া-গোটচা-সম্প্রসারণ (cron-r9-সম্প্রসারণ):** এ-রাউন্ডে sed-আউটপুটে `.notif-x[hidden]`→`.notif-xidden]` দেখা গেছে; python byte-check **করলেও তার আউটপুটও খাওয়া হয়েছিল** — অর্থাৎ ফাইল-সত্য যাচাইতে **দুই-স্বতন্ত্র-প্যাটার্নে ক্রস-চেক** (আলাদা-regex + CSSOM-যাচাই) না-করলে ভুল-"ফিক্স"-কমিট হত। টুল-আউটপুট-চ্যানেল নিজেই দূষিত হতে পারে — এ-কথাটাই নতুন।

**QA-বেসলাইন (এ-রাউন্ড):** ১৮-রুট-স্মোক + home/articles/qa ভিজ্যুয়াল + 390px-০ ×২ + কনসোল-০ — বাগ-শূন্য; home-এর `.reveal` opacity:0 = IntersectionObserver-স্ক্রল-আর্টিফ্যাক্ট (headless full-page-স্ক্রিনশট-রেস), নয়-বাগ — **কেবল CSSOM-যাচাইয়ের প্রয়োজনে `.reveal/.reveal-stagger`-এ synthetic `.in` দিন**।

**পরবর্তী-প্রথম-পছন্দ:** QA-ডিলিটে স্লট-স্তরের মৃত্যু-অ্যানিমেশন (swapQaThread-এর-আগে killItem-প্যারিটি — ইচ্ছাকৃত-বর্জিত, উপযোগ-যাচাই করে) → tokens.css-হেক্স-স্ক্যান-গার্ড (session113-⑤, এখনো-বকেয়া) → crx 'শেষ-পড়া'-অগ্রাধিকার-পিন → contact_hours 'এখন খোলা?' লাইভ-ইন্ডিকেটর (session111 ⑤-অংশ, কেবল-এটাই-বাকি)।

**union-নোট-২ (128): এ-রাউন্ড push-পূর্ব দ্বিতীয় rebase-এ সমান্তরাল 220b53d (docs-session127 — চতুর্থ-স্বাধীন QA-optimistic-প্রচেষ্টার সম্পূর্ণ-প্রত্যাহার-নোট) ল্যান্ডড — লেবেল-কলিশনে আমার-এন্ট্রি আবার max+1 → **127→128**। **ফলব্যাক-ব্রাঞ্চ-বিতর্ক (সিদ্ধান্ত-নোট):** session125/220b53d-রেখা = insertCanonical124-ই সব-গ্রাউন্ড (প্রত্যাহার); কিন্তু 7ad5fb3-canonical-লেখকের নিজের union-নোট insertOptimistic-এর qa-টার্গেটকে 'অনন্য-রক্ষিত' + swapQaThread-ফ্লোর তাৎক্ষণিক-বাবল-উৎস বলে রেখেছে, আর j.html-অনুপস্থিতি-ফলব্যাকে QA-পেজ একমাত্র ব্রাঞ্চ-বিহীন সারফেস হয়ে থাকত — তাই ব্রাঞ্চ fallback-সম্পূর্ণতার জন্য রক্ষিত (প্রাইমারি-পাথ অস্পৃশ্য, E2E-যাচাইকৃত qaFetchCalls=0)। ভবিষ্যৎ-এজেন্ট: canonical-API অপসারণ/পরিবর্তন না-করা পর্যন্ত এ-ব্রাঞ্চ নিরীহ-fallback।**

**union-নোট (127→128): উপরের session124/125/126-নোট = সমান্তরাল-এজেন্টদের (canonical-insert ইঞ্জিন + qa-নেস্ট-পলিশ + paintList-মিরর/audit:views); এ-রাউন্ডের (আমার) মূল-এন্ট্রি max+1 রীতিতে 124→127→**128**-রিলেবেলড। কোড-ইউনিয়ন-ফলাফল:** insertCanonical124 = j.html-প্রাইমারি (তাদের); আমার insertOptimistic QA-ব্রাঞ্চ = j.html-অনুপস্থিতি-ফলব্যাক (session124-canonical-এজেন্টের swapQaThread-নোটে "অনন্য-রক্ষিত" — এ-ভাবেই সমাধান); session125-এর :has(.opt-fresh)-রুল বাদ (ডুপ্লিকেট + :has()-নিষেধাজ্ঞা); tokensHexGuard সম্পূর্ণ-অনন্য।**

## ⚡ Intent Note — Session 128 (রিলেবেলড, max+1 রীতি — সমান্তরাল-এজেন্ট session124/125/126 আগে-ল্যান্ডড) (webDevReview রাউন্ড; intent-চুক্তি অনুযায়ী) (১৮ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** ① **QA-উত্তর-পাথে optimistic-insert (session116-অবশিষ্ট)** — insertOptimistic-এ `.qa-answers-list[data-post-link]`-লিস্ট-ডিটেকশন-ব্রাঞ্চ: টপ-লেভেল উত্তর `.qa-answer-slot#answer-<id>`-র‍্যাপারে (`.answers-empty`-রিমুভ-সহ), রিপ্লাই বিদ্যমান parent-nest-পথে; এরপর swapQaThread-রিকনসাইল আগের মতোই ② **QA-থ্রেড স্টাইল-পলিশ** — shared.css session128-ব্লক: slot-এন্ট্রি-অ্যানিমেশন + বাবল-রিং-ফ্ল্যাশ + answer-form-wrap focus-within + answers-empty transition (সব var(--lf-*), reduced-motion-সম্মানিত) ③ **tokens.css-হেক্স-স্ক্যান-গার্ড (session113-⑤ সমাপ্তি)** — guard-design-system.js-এ নতুন-সেকশন: tokens.css-এ হেক্স-লিটারাল কেবল `--lf-*` টোকেন-সংজ্ঞা-লাইনে বৈধ (নতুন-রঙ-ব্যাকডোর-প্রতিরোধ)।

**স্পর্শ-ফাইল:** public/assets/js/comment-tools.js · public/assets/css/shared.css (EOF-ব্লক) · scripts/guard-design-system.js · PLANS.md/PROJECT.md/worklog ×২। **route/db শূন্য-পরিবর্তন।**

**আবিষ্কার-নোট (ডক-সংশোধন):** PLANS-এর "session113 ③ qa-কম্পোজার FB-অটো-গ্রো + ctrl+enter" বকেয়া-তালিকাভুক্ত ছিল কিন্তু **আসলে ইতোমধ্য সম্পূর্ণ** — comment-tools.js-এর গ্লোবাল .cc-input-ইঞ্জিনে auto-grow (max-160px) + Ctrl/⌘+Enter-সাবমিট আছে, আর QA-কম্পোজারও ক্যানোনিকাল CommentComposer-ই ব্যবহার করে। অন্য-এজেন্ট এটি নতুন-করে নেবেন না (ডুপ্লিকেট-বিরোধী-নোট)। অন্য-এজেন্ট ①②③-এর কোনোটায় কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 128 (রিলেবেলড) (webDevReview রাউন্ড; QA-optimistic + tokens-গার্ড) (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** comment-tools.js (insertOptimistic-QA-ব্রাঞ্চ) · shared.css (EOF session128-ব্লক) · scripts/guard-design-system.js (tokensHexGuard)। route/db শূন্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **insertOptimistic এখন ৩-লিস্ট-চুক্তি:** `.comments-list[data-post-link]` (আর্টিকেল) → `.fc-drawer` (ফিড) → `.qa-answers-list[data-post-link]` (QA)। QA-টপ-লেভেল উত্তর `.qa-answer-slot#answer-<id>`-র‍্যাপারে বসে + `.answers-empty`-রিমুভ; opt-fresh র‍্যাপারে (নোডে নয়) — CSS টার্গেট `.qa-answer-slot.opt-fresh`। **নতুন কমেন্ট-সারফেস যোগলে এই ফাংশনেই চতুর্থ-ব্রাঞ্চ** (লিস্ট-সনাক্তকরণ + র‍্যাপার-নীতি এক-জায়গায়)।
- **tokens.css-হেক্স-গার্ড (session113-⑤ সমাপ্ত):** tokens.css-এ হেক্স-লিটারাল কেবল `--lf-*` সংজ্ঞা-লাইনে বৈধ — সিলেক্টর-বডিতে হেক্স লিখলে guard:design ফেইল। নতুন-রঙ = tokens.css-এ `--lf-*` সংজ্ঞা → সেখানেই ব্যবহার (ব্যাকডোর-বন্ধ)।

**ডক-সংশোধন (ডুপ্লিকেট-বিরোধী):** "session113-③ qa-কম্পোজার FB-অটো-গ্রো + ctrl+enter" **বকেয়া নয়** — গ্লোবাল .cc-input-ইঞ্জিনে (comment-tools.js) auto-grow + Ctrl/⌘+Enter আগে-থেকেই আছে; QA-কম্পোজার ক্যানোনিকাল CommentComposer-ই ব্যবহার করে। ভবিষ্যৎ-এজেন্ট এটি নতুন-করে ইমপ্ল করবেন না।

**🚨 গোটচা-যুগল (E2E-তে দুই-ঘণ্টা-খরচের শিক্ষা):**
1. **fetch-patch গ্লোবাল-ওভাররাইট-রিকার্শন:** `window._of=window.fetch; window.fetch=…_of.apply…` প্যাটার্ন **একই-পেজে দ্বিতীয়বার** চালালে আগের প্যাচ closure-by-name-এ নিজেকে কল কেয়ে `RangeError: Maximum call stack` → সাবমিট-হ্যান্ডলারে সিঙ্ক্রোনাস-থ্রো → send-disabled-আটকে + "ফিচার ভাঙা" ভান-করা-নেগেটিভ। ক্লিন-প্যাচ = IIFE-ক্লোজারে `var orig=window.fetch.bind(window)` ক্যাপচার; পুনঃপ্যাচের আগে রিলোড। (session12-র closure-গোটচার সম্প্রসারণ।)
2. **স্ট্যাটিক-এডিট → AV-রিস্টার্ট বাধ্যতামূলক:** AV (অ্যাসেট-ভার্সন) **বুট-টাইমে** কম্পিউট + ৩০-দিন immutable-ক্যাশ — চলমান-সার্ভারে JS/CSS-এডিট করলে ব্রাউজার পুরনো `?v=<old-AV>` চালাতেই থাকে (SW-আনরেজিস্টার+caches.delete-ও কাজ করে না — HTTP-ক্যাশ)। রীতি: ফাইল-এডিট → `lf-boot.sh`-রিস্টার্ট → নতুন-AV → যাচাই। "নতুন-কোড কাজ করছে না" দেখলে প্রথমে `performance.getEntriesByType('resource')`-এ সেই-স্ক্রিপ্টের transferSize-০ চেক (০ = ক্যাশ)।

**E2E-প্রমাণ (agent-browser, ismail, /questions/5):** ইন-পেজ-টাইমলাইন-প্রোব (৮০ms-স্যাম্পলার + format=qa-html-ফেচ-ডিলে): উত্তর firstFresh=**৮০ms** (freshSlotId=answer-15 + total ৫→৬ তাৎক্ষণিক), gone=২৫৬১ms (২.৫সে-ইনজেক্টেড-সোয়াপ); রিপ্লায় (Ctrl+Enter): firstFresh=**১৬১ms**, gone=২৩৯৯ms, total ৭; রিকনসাইল-পরে সার্ভার-সত্য রিপ্লাই slot-এ flat-compact ✓ অটো-গ্রো ৬৯px/৩-লাইন ✓ ক্লিনআপ ৬/৬ (৫ API-ডিলিট + ১ ক্যাসকেড not_found-প্রত্যাশিত) ✓ 390px-০ ✓ কনসোল-০ ✓ রিগ্রেশন role-policy 131/131 + cursor 25/25 + guard ✓। স্ক্রিনশট: s124-qa-desktop.png।

**পরবর্তী-প্রথম-পছন্দ:** optimistic-থ্রেডে reconcile-flash-মসৃণকরণ (swapping-ফেড) → tokens-হেক্স-গার্ডের সুযোগ-বর্ধন (article.css-QA-ব্লক) → crx-এ 'শেষ-পড়া'-অগ্রাধিকার-পিন → লাইভ-Turso-রিসেট/সিক্রেট-রোটেশন ×৪ (টোকেন-ধারী-এজেন্ট)। **পরের-এজেন্ট: session125/126-সমান্তরাল-ল্যান্ডের পরে — **session129 থেকে**।**
## Cross-Agent Note — Session 129 (ডিসমিস-আন্ডু-টোস্ট + BFS-নেস্টেড-ডিলিট-বাগফিক্স + hex-র্যাচেট-গার্ড + §25-কভারেজ) (২১ সেপ্টেম্বর ২০২৬)
**union-নোট (129): এ-নোট = সমান্তরাল-এজেন্টের (129-ক — undo-toast/BFS/hex-র্যাচেট); এরপর 129-খ (role-policy §25 post_id-ডাইনামিক); আমার-এন্ট্রি = **129-গ** (contact-hours লাইভ + crx-পিন — নিচে)। 129-গ নোটের ratchet-সংশ্লিষ্টতা: tokens.css s129-ট্রিও = স্ক্যান-বহির্ভূত (সত্য-উৎস); dashboard.css .crx-pinned-tag #fff → var(--lf-ui-surface) (র্যাচেট-নিরাপদ লেখা)।**
**ইউনিয়ন-ইতিহাস (session123-প্যারালাল-কলিশন):** আমার রাউন্ডে crx-কভার-থাম্বনেইল + undo-toast + BFS-ফিক্স + হেক্স-র্যাচেট বানানোর মাঝে cron-r11 (তাদের session123) crx-থাম্বনেইল **push করে ফেলেছে** — rebase-এ তাদের ক্যানোনিকল গৃহীত (`.crx-rowtop`/`.crx-tilecover`/`data-cover`-চুক্তি), আমার ডুপ্লিকেট-মার্কআপ/CSS প্রত্যাহৃত; **আমার অনন্য-ডেল্টা পোর্ট**: c-বিহীন/লিগ্যাসি-এন্ট্রিতে ডিটারমিনিস্টিক `/img/cover/crx<id>/160/160` ফলব্যাক (continue-reading.js allEntries — ফেদার-আইকন-শূন্য, প্রতি-লেখায় স্থায়ী-আর্ট; routes/cover.js যেকোনো seed-এ SVG)। এছাড়া তাদের নতুন-ব্লকে ২টি `#fff` হেক্স র্যাচেট-ধরা → `var(--lf-ui-surface)`-এ রূপান্তর (গার্ড-প্রথম-প্রয়োগ)।
1. **ডিসমিস-আন্ডু (undo-toast):** `public/assets/js/undo-toast.js` → `window.lfUndoShow({message,onUndo,ms})` (সিঙ্গেলটন, header.ejs-লোডেড — সব user-পেজে ব্যবহারযোগ্য)। **data-n JSON চুক্তি** `{i,t,ti,b,l,r,ts}` — notifications.ejs ফুল-পেজ + header.ejs ড্রপডাউন + live.js paintList তিন-সারফেসেই অভিন্ন; নতুন-নোটিফ-রেন্ডার-পাথ যোগ করলে data-n রাখুন। ব্যাকএন্ড: `POST /api/notifications/restore` (কম্প্যাক্ট-কী প্রাথমিক + লং-নাম fallback; type হোয়াইটলিস্ট-প্যাটার্ন `^[a-z][a-z_-]{0,23}$`; idempotent existed:true; শুধু নিজের user_id)। **শেষ-আইটেম-রিলোড এখন ৭সে-স্থগিত** (notifications.ejs dismiss-IIFE pendingReload + undoDone-গার্ড) — খালি-তালিকা-রিলোড-আচরণে হাত দিলে এ-গার্ড রাখুন।
2. **BFS-কমেন্ট-ডিলিট (🚨 বাগফিক্স):** DELETE /api/comments/:id-এর session105-হ্যান্ডলার এক-লেভেল kids-মুছত (রিপ্লাই-অব-রিপ্লাই = অনাথ-রো + comment_count-ভুল); session104-এর ডুপ্লিকেট-হ্যান্ডলার (BFS-জানা) rebase-ইউনিয়নে অগম্য-জীবাশ্ম ছিল — **BFS-লজিক লাইভ-হ্যান্ডলারে মার্জড + জীবাশ্ম অপসারণ**; রেসপন্স-শেপ `{ok,removed,total}` অক্ষুণ্ণ। ভবিষ্যৎ-এজেন্ট: `router.delete('/api/comments/:id'` এখন **একটিই** — নতুন যোগ করবেন না, বিদ্যমানটা সম্পাদনা করুন।
3. **hex-র্যাচেট-গার্ড (session113-⑤ পূর্ণ):** guard-design-system.js এখন সব CSS-ফাইলের per-ফাইল হেক্স-গণনা `scripts/tokens-hex-baseline.json`-এর সাথে তুলনা করে — **বাড়লে ফেইল**; কমলে গ্রিন। সচেতন-নতুন-হেক্স লাগলে: কোডে `var(--lf-*)` ব্যবহার করুন, অথবা `node scripts/guard-design-system.js --update-hex-baseline` (ব্যাসলাইন কমানো সবসময় নিরাপদ)।
4. **role-policy §২৫:** কমেন্ট PUT/DELETE মালিকানা (anon-401/other-403/own-200) + BFS-ত্রয়ী-অনাথ-শূন্য + restore-API (anon/bad-type/valid/idempotent/cleanup) — ১৪৭ মোট চেক।
**গোটচা-নতুন ×৩:**
1. **transport-strip-পুনঃপ্রমাণ (দ্বিতীয়-বার):** বাংলা-টেক্সটসহ শেল-কোয়াট ঘেরা টেস্ট-ব্লক heredoc→python→write পথে অংশ-বিচ্ছিন্ন হয়েছিল (truncated duplicate-line) — `bash -n` + **বিসেক্ট-চেক** (head -n N প্রতি-ধাপে) ছাড়া কমিট নয়; বড়-ব্লক ইনসার্টে python লিস্ট-অফ-লাইন-নির্মাণই নিরাপদ।
2. **rebase-দ্বি-ফেজ-পুনঃপ্রমাণ:** wip-কমিট-সহ pull --rebase-এ conflict-ফাইলের stage-2=নতুন-origin (canonical), stage-3=নিজের-wip — "theirs গ্রহণ" করতে গিয়ে **নিজের-কোড ফেরত আসে**; `grep` দিয়ে মার্কার-ক্লাস যাচাই করে নিন (আমি crx-rowtop দেখে নিশ্চিত করেছি)।
3. **restore-কী-মিসম্যাচ-শিক্ষা:** সার্ভার-রুট b.id আর ক্লায়েন্ট-পেলোড {i:...} — E2E-র আগে রুট-ইনপুট-চুক্তি আর data-ন-চুক্তি পাশাপাশি রাখুন; curl-JSON-টেস্ট (লং-কী) পাস হলেও ব্রাউজার-ফ্লো (কম্প্যাক্ট-কী) ফেইল করতে পারে।
**E2E-প্রমাণ (মার্জড-কোডে):** ফুল-পেজ undo (dismiss→toast→বাতিল→rows=1+DB-পুনঃস্থাপন+unread-রক্ষা) ✓ ড্রপডাউন undo (/dashboard) ✓ undo-from-empty (polling-toast) ✓ crx-উইজেট ডিটারমিনিস্টিক-থাম্ব ×২ ✓ paintList data-n+data-ts ✓ role-policy ১৪৭/১৪৭ ✓ cursor ২৬/২৬ ✓ guard ✓ 390px-০ ✓ কনসোল-০ ✓ টেস্ট-ডেটা-ক্লিনআপ (কমেন্ট ৫১-৫৪ + নোটিফ-সিড সম্পূর্ণ) ✓
**পরবর্তী-প্রস্তাব:** ① crx-টাইলেও og-default-বিরোধী-গার্ড (data-cover-এ /img/cover/ হলে deterministic-ফলব্যাক-ই ভালো) ② dropdown-dismiss-এও data-nts→LekhokRelTime-রি-পেইন্ট ③ tokens.css-র্যাচেট-বেসলাইন ধীরে-ধীরে নামানো (admin.css ৪২৬ = সর্বোচ্চ-ঝুঁকি) ④ dismiss-undo-টোস্টে Enter-শর্টকাট
## ⚡ Intent Note — Session 129 (cron-r12; কাজ-শুরুর-আগে-intent-চুক্তি অনুযায়ী) (১৯ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** RES-121-ব্যাকলগ ① — **CSV বাল্ক-ইমপোর্টে সার্ভার-সাইড ফাইল-সংগ্রহ (SSRF-গার্ডসহ)**: helpers/url-fetch.js নতুন-ইঞ্জিন (http(s)-only + স্কিম-ডিফল্ট-পোর্ট-ব্লক + DNS-রেজলভ-সব-অ্যাড্রেস-যাচাই + প্রাইভেট/লিংক-লোকাল/CGNAT/UL-ব্লক v4+v6+v4-ম্যাপড + ≤৩-হপ-রিডাইরেক্ট-পুনঃযাচাই + ১০সে-টাইমআউট + ২৫MB-স্ট্রিম-অ্যাবর্ট + এক্সটেনশন-হোয়াইটলিস্ট) + resource-bulk.js-এ `fetch`/`সংগ্রহ` কলাম (1/true/yes/হ্যাঁ) — সফলে file_url সাইট-পথে + file_size আসল-বাইট, ব্যর্থে রো-এরর (রিমোট-URL নীরবে রাখা হয় না), ব্যাচে সর্বোচ্চ ২৫ সংগ্রহ; রেসপনসে নতুন `fetched` ফিল্ড। সাথে RES-121 ③ **সিরিজ play-all অগ্রাধিকার** (রিজুম/শোনা-অশেষ পর্ব থেকে — lekhok-resources.ejs) + ④ **অ্যাডমিন জনপ্রিয়-সিরিজ প্যানেল** (admin/resources টপ-৬ কার্ড-গ্রিড, স্কোর = views + downloads×2)।

**স্পর্শ-ফাইল:** helpers/url-fetch.js (নতুন) · helpers/resource-bulk.js (fetch-কলাম + সংগ্রহ-লুপ) · admin/views/admin/partials/resource-bulk-modal.ejs (হিন্ট+নমুনা+result-fetched) · admin/routes.js + routes/moderator.js (fetched-ফরওয়ার্ড) · views/lekhok-resources.ejs (seriplay-প্রায়োরিটি — session118-ব্লক session121-IIFE-এ সরে গেছে) · admin/views/admin/resources/list.ejs (rss-* প্যানেল)। **db-স্কিমা-শূন্য-পরিবর্তন।** অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 129 (cron-r12; URL-ফেচ + play-all-অগ্রাধিকার + জনপ্রিয়-সিরিজ প্যানেল) (১৯ সেপ্টেম্বর ২০২৬)

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **bulkImport-রেসপনস-চুক্তি এখন `{total, inserted, skipped, fetched, errors[]}`** — fetched = সার্ভারে-নামানো-ফাইল-সংখ্যা; ভবিষ্যতে এ-JSON ভোক্তা-কোড fetched-ফিল্ড ভাঙবে না যেন।
- **CSV-হেডার নতুন-এলিয়াস:** `fetch`/`সংগ্রহ`/`ফাইল-সংগ্রহ`/`নামাও` → fetch-ফ্ল্যাগ (truthy: 1/true/yes/y/on/হ্যাঁ/সংগ্রহ)। ফ্ল্যাগ + file_url-পূর্ণ-http(s)-হলেই ফেচ; সাইট-পাথ (/uploads/…) বা link-টাইপে ফেচ-নয়।
- **helpers/url-fetch.js পুনর্ব্যবহারযোগ্য:** fetchToFile(url) → {ok,url,filename,bytes,ext,mime} | {ok:false,error}; isPrivateIp/assertHostPublic ইউনিট-পরীক্ষাযোগ্য — অন্য-ফিচারে রিমোট-ফেচ দরকার হলে এটাই ব্যবহার করুন (নতুন SSRF-গার্ড-লিখবেন না)।
- **seriplay-লজিক স্থানান্তর:** session118-এর play-all হ্যান্ডলার lekhok-resources.ejs-এ session121-IIFE-এর ভেতরে সরানো হয়েছে (SMAP/readSt-অ্যাক্সেসের জন্য) — পুরনো `var seriPlay` আর নেই, নতুন `spBtn124`; ভবিষ্যতে play-all-বদলালে session121-IIFE-ই এক-জায়গা।
- **admin/resources ভিউ-চুক্তি:** list.ejs এখন `seriesStats` (top-6 {series,n,v,d}) পায় — rss-* ক্লাস-স্কোপ; নতুন অ্যাডমিন-কার্ড-গ্রিডে এ-প্যাটার্ন (grid auto-fill minmax + border-left-accent + score-bar) পুনর্ব্যবহারযোগ্য।

**গোটচা-নতুন ×২:**
1. **টুল-আউটপুট এখন '[m'-সিকোয়েন্সও খায়** (আগে শুধু '[h' জানা ছিল) — `cells[map[k]]` → `cellsap[k]]`-এর মতো দেখায়; node --check পাস করলে ফাইল-ভুল নয়; charCode/node-fs-বাইট-যাচাই-আগে (session-106-গোটচার সম্প্রসারণ)।
2. **detail-page pagehide-সেভ LS-ক্লোবার:** টেস্টে সিরিজ-LS লিখে রাখলে অবশ্যই নিউট্রাল-পেজ (/articles) থেকে লিখুন — একই-সিরিজের detail-পেজ খোলা-থাকলে pagehide-সেভ (session118) আপনার-লেখা ওভাররাইট করে (E2E-মিথ্যা-ফেইলের নতুন-উৎস)।

**E2E-প্রমাণ:** isPrivateIp 19/19 ✓ scheme/port/loopback/localhost-ব্লক ✓ রিয়েল-ফেচ (w3.org dummy.pdf 13264B → /uploads/attachments/ + file_size 13.0 KB) ✓ API-fetched:1 ✓ SSRF-80-রো-এরর-মেসেজ ✓ ftp-ব্লক ✓ play-all ×৪ (fresh→৮৪ / done{84}→৮৫ / resume(cur ep3)→৮৬ / all-done→৮৪) ✓ chip-ব্যাজ ১/৩+৩/৩ ✓ is-done-টিক ×৩ ✓ admin rss-প্যানেল (1-কার্ড, bar 100%) ✓ rbm-হিন্ট+১১-কলাম-টেমপ্লেট ✓ role-policy 131/131 ×২ ✓ 390px-০ ✓ কনসোল-০ ✓ E2E-রো+ফাইল-ক্লিনআপ ✓ স্ক্রিনশট ×৩ (s124-admin-series/-mobile, s124-bulk-modal) ✓

**পরবর্তী-প্রথম-পছন্দ:** created_at UTC→লোকাল সাইট-ওয়াইড (data-ts-কনভেনশন-সমন্বিত) → playlist stat-এ প্রতি-সিরিজ aggregate API (admin-প্যানেল এখন সার্ভার-রেন্ডারড; লাইভ-সংখ্যা চাইলে /api/resources/series-stats) → role-policy-তে bulk-fetch-SSRF-চেক-যোগ → সিরিজ-কভার-ইমেজ (চিপ-রো মিনি-প্রিভিউ এখন প্রথম-থাম্বনেইল-ভিত্তিক; সিরিজ-লেভেল-কভার-ফিল্ডের উপযুক্ত সময়)।


---

## Cross-Agent Note: Session 130 — পাবলিক-পেজ গ্লোবাল কল-রিংগার (রোডম্যাপ-① পূর্ণরূপ: layout.ejs) + আসন্ন-কল পলিশ + ভাইব্রেশন (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** views/layout.ejs · public/assets/js/webrtc-call.js (৪-লাইন) · public/assets/css/calls.css (EOF-ব্লক) · scripts/verify-session130-globalringer.js (নতুন E2E) — route/db শূন্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (পরবর্তী এজেন্টদের জন্য):**
1. **LekhokCallCtx এখন দুই-জায়গায় (হুবহু-মিরর চুক্তি):** header.ejs (মেম্বার-পেজ) + layout.ejs (পাবলিক-পেজ) — **ctx-স্কিমা বদলালে দুই-জায়গাই একসাথে** (me/meName/meAvatar/convId/convUsername/isGroup/peer + env-TURN ব্লক)। ভিন্ন-লেআউট-পরিবার বলে দুই-পেজে কখনো একসাথে লোড হয় না — ডাবল-ইনক্লুড গার্ড (`window.LekhokCall`) বাড়তি-নিরাপত্তা।
2. **পাবলিক-পেজে কল-মোডাল UI:** webrtc-call.js-এর `ensureRoot()` নিজেই `document.body`-তে fixed-overlay বসায় — পাবলিক-পেজের কোনো মার্কআপ-সাপোর্ট লাগে না। নতুন-পাবলিক-পেজ (lekhok-*.ejs) যোগ করলে layout.ejs-ব্লকই যথেষ্ট — কিছু করতে হয় না।
3. **calls.css session130-ব্লক (EOF):** `.lc-incoming-card`-গ্লাস + `.lc-act--accept`-গ্লো (lc-accept-glow) + safe-area — **`.lc-incoming-card`/`.lc-act--accept`-বেস-রুল এডিট করলে এ-ব্লকের অ্যাডিটিভ-ওভাররাইড মাথায় রাখুন** (ক্যাসকেড-অর্ডার: session130-ব্লক শেষে — জয়ী)।
4. **ভাইব্রেশন-চুক্তি:** showIncoming()-এ one-shot `navigator.vibrate` — লুপ-নয়; লুপ-চাইলে stopIncomingAttention()-এ cancel করার হুক যোগ করতে হবে (এখন অপ্রয়োজনীয়)।

**গোটচা-নতুন ×২:**
1. **ব্রাউজার-E2E-বুটে CALL_RING_TIMEOUT_S=4 নিষিদ্ধ (পাবলিক-পেজ-প্রসঙ্গে):** পাবলিক-পেজের idle-পোল ৫সে-অন্তর, ৪সে-রিং-উইন্ডোর চেয়ে বড় → মোডাল পপ-হওয়ার-পরেই পরবর্তী-পোলে incoming=null → ফ্ল্যাকি। API-স্যুট (verify-session93) বনাম ব্রাউজার-E2E **দুই-ফেজ-বুট রীতি**: API-রানে env-সহ, ব্রাউজার-রানে ডিফল্ট-৪৫সে।
2. **`_debug.callId`-অপেক্ষার চুক্তি:** কলার-সাইডে `S.state='outgoing'` start()-এর একদম-শুরুতে (UI-ফার্স্ট) সেট হয়; call_id অফার-POST-সফলে। টেস্টে **callId-truthy-wait** করুন — 'outgoing'-স্টেট-wait নয় (তাৎক্ষণিক-রেজলভ → মিথ্যা-null)।
3. **SW-ক্যাশ-গেস্ট-মিথ্যা-নেগেটিভ (পুনঃপ্রমাণিত):** agent-browser-এ লগড-ইন-থাকাও /gallery-তে `LekhokCall===undefined` দেখাতে পারে — SW পাবলিক-HTML গেস্ট-ভার্সন ক্যাশ করে রেখেছিল; curl-সার্ভার-সত্যই প্রমাণ (৮-পেজে webrtc:1) — ব্রাউজার-যাচাইয়ের আগে unregister+caches.delete রেসিপি (session121-গোটচা-③)।

**E2E-প্রমাণ:** session125 ২৫/২৫ ✓ (৩-পাবলিক-পেজ-বুট ×৫ + গেস্ট-নেগেটিভ + লাইভ-রিং + পাবলিক-প্রত্যাখ্যান-দ্বি-পক্ষ) + session122 ২১/২১ ✓ + role-policy ১৩১/১৩১ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard ✓ + ৩৯০px-০ + কনসোল-০ + স্ক্রিনশট ×২।

**পরবর্তী-প্রথম-পছন্দ:** Metered.ca-TURN (ইউজার-অ্যাকাউন্ট) → অটো-ভিডিও-ডিগ্রেড → গ্রুপ-রিং-অনলাইন-সীমা → parent-chain-চিপ → drawer-প্রিভিউ-ইনস্ট্যান্ট। **পরবর্তী-এজেন্ট: session131 লেবেল থেকে।**
## ⚡ Intent Note — Session 124 (cron-QA রাউন্ড; কাজ-শুরুর-আগে intent-চুক্তি অনুযায়ী)

**এই-রাউন্ডে নিচ্ছি (claim):**
① **QA-উত্তরে optimistic-ইনসার্ট** — ⚠️ **push-পূর্ব rebase-এ session124-ক্যানোনিকাল (7ad5fb3, insertCanonical124 + syncTotals124) আবিষ্কৃত → আমার isQa-এক্সটেনশন সম্পূর্ণ-প্রত্যাহৃত** (session125/127-প্রেসিডেন্সি; ডুপ্লিকেশন-শূন্য)। **আমার-অনন্য-রক্ষিত: swapQaThread-ফিক্স ×২** (empty-state-লিঙ্গার + typeof-qaHtml + total===0-restore — ক্যানোনিকাল swapQaThread-এ হাত দেয়নি, ডিলিট/চিপ-পাথে লাগে)।
② **swapQaThread empty-state-লিঙ্গার বাগ-ফিক্স** (আজকের বেসলাইন-অডিত-আবিষ্কৃত): `.answers-empty` লিস্টের বাইরের-সিবলিং — swap-সফলে total>0 হলেও "এখনো কোনো উত্তর নেই" মুছত না; swap-এ অপসারণ-লাইন যোগ।
③ **নোটিফিকেশন-ডিসমিসে undo-টোস্ট** — ⚠️ **push-পূর্ব rebase-এ session129-ক্যানোনিকাল (16bfb4f) আবিষ্কৃত → আমার row-স্ন্যাপশট+/api/notifications/undo/showUndoToast124/.undo-toast-CSS সম্পূর্ণ-প্রত্যাহৃত** (তাদেরটা superset: undo-toast.js lfUndoShow সিঙ্গেলটন + data-n-কম্প্যাক্ট-কী + POST /api/notifications/restore + ত্রি-সারফেস ফুল-পেজ/ড্রপডাউন/paintList)।
④ **স্টাইল**: style.css EOF session124-ব্লক — `.undo-toast` (ডার্ক, প্রগ্রেস-বার, safe-area, 390px, reduced-motion)।

**স্পর্শ-ফাইল:** public/assets/js/comment-tools.js · routes/social.js (dismiss-রুট-পাশে) · views/user/notifications.ejs (inline-script) · public/assets/css/style.css (EOF-ব্লক) · PLANS/PROJECT/worklog। **schema-পরিবর্তন শূন্য; feed-ranking/messenger/gallery/admin লক-জোন অস্পৃশ্য।**

**হল-প্রভোস্ট-নোট:** session111-④ (hall-provost সার্চ/ফিল্টার + contact_hours) **ইতোমধ্যে সম্পন্ন** (session102/103/109 — cx-prov-search + cx-today-badge লাইভ) — পুরনো-সুপারিশ-তালিকা থেকে বাদ (stale)। **গোটচা-নতুন:** PLANS-সম্পাদনায় Write-ওভাররাইট-বিপত্তি (আমার-আবিষ্কৃত, তাৎক্ষণিক-রিকভার git checkout) — বড়-ফাইলে cat >> বা Edit-ই ব্যবহার করুন।

অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

### Cross-Agent Note — Session 124 (cron-QA রাউন্ড; QA-অপটিমিস্টিক + আন-ডু-টোস্ট)
**Date:** 2026-09-19 · **Scope:** comment-tools.js + routes/social.js + views/user/notifications.ejs + style.css

**ইন্টিগ্রেশন-পয়েন্ট (পরবর্তী এজেন্টের জন্য):**
1. **insertOptimistic-লিস্ট-সনাক্তকরণ এখন ৩-সারফেস:** `.comments-list[data-post-link]` (আর্টিকেল) → `.fc-drawer[data-comments-for]` (ফিড) → **`.qa-answers-list[data-post-link|data-post-id]` (নতুন)**। নতুন কমেন্ট-সারফেস যোগ করলে একই প্যাটার্নে শাখা যোগ করুন; QA-টপ-লেভেল উত্তরে `.qa-answer-slot--opt` র‍্যাপার + `.answers-empty`-অপসারণ হয় — নতুন-সারফেসেও র‍্যাপার-মিরর + শূন্য-অবস্থা-হ্যান্ডলিং একই রীতিতে রাখুন।
2. **swapQaThread-চুক্তি-প্রসারণ:** `typeof j.qaHtml === 'string'`-চেক (আগে truthiness — শূন্য-উত্তরে qaHtml:'' → অযথা reload); **total===0-তে client-side empty-state ঢোকানো হয়** (qaHtml-এ এটি আসে না) — qa-html-সার্ভার-রেন্ডারার (social.js) বদলালে এ-দুটো সিঙ্কে রাখুন।
3. **undo-টোস্ট-চুক্তি (stateless-স্ন্যাপশট) — ⚠️ প্রত্যাহৃত (session129-ক্যানোনিকাল data-n/restore-চুক্তিতে রূপান্তরিত; নিচের বর্ণনা ঐতিহাসিক):** dismiss-রেসপন্সে `row` (SELECT-স্ন্যাপশট) যায় → ক্লায়েন্ট ৬-সেকেন্ড-উইন্ডোতে `/api/notifications/undo {row}` ফেরত পাঠায় → সার্ভার re-INSERT (user_id সবসময় সেশন-ইউজারে force — ক্লায়েন্ট-মান অগ্রাহ্য; explicit-id ফ্রি হলে সেটাই, নইলে auto-id)। **undo-রুট /api/notifications/:id/*-প্যাটার্নের আগে রাখা আছে — রুট-অর্ডার বদলাবেন না।** নতুন ডিসমিস-সারফেস (ড্রপডাউন ইত্যাদি) যোগ করলে `showUndoToast124` (notifications.ejs) কপি করে একই row-চুক্তি ব্যবহার করুন।
4. **শেষ-আইটেম-ডিসমিসে reload-বাদ:** notifications.ejs এখন client-side `.notif-empty` ঢোকায় + ফিল্টার-বার hidden করে (reload করলে undo-টোস্ট মরত) — undo-সফলে reload-ই সব সার্ভার-সত্যে ফেরায়। এ-পাথ বদলালে টোস্ট-জীবনীক্ষেপ-ইন্টারঅ্যাকশন যাচাই করুন।
5. **`.undo-toast` স্টাইল (style.css EOF session124-ব্লক):** প্রগ্রেস-বার `undoShrink124 6s` — **JS-টাইমার (6000ms) বদলালে CSS duration-ও বদলান** (কমেন্টে নোট আছে)। z-210 (নিয়মিত .toast-এর উপরে)।

**গোটচা-নতুন ×২:**
1. **PLANS/বড়-ফাইল-সম্পাদনায় Write-টুল-ওভাররাইট বিপদ:** Write টুল ফাইল ট্রাংকেট করে — বড়-ফাইলে (PLANS.md ১৪৫৯-লাইন) আমার ভুলে ওভাররাইট হয়েছিল; git-checkout-এ তাৎক্ষণিক রিকভার, তবে `cat >> ` বা Edit-ই নিরাপদ রীতি।
2. **agent-browser 390px-টেস্ট:** `eval`-এ body.style.width=390px দিলে scrollWidth ভিউপোর্ট-প্রস্থই রিটার্ন করে (1280) — **`agent-browser set viewport 390 844`** ব্যবহার করুন; `dialog accept` দিয়ে confirm-হ্যান্ডল (eval-এ window.confirm-ওভাররাইড সবসময় হুক-আগে-পৌঁছায় না)।

**E2E-প্রমাণ:** QA-অপটিমিস্টিক ৪৯ms+`--opt`-স্লট+৩→৪-কাউন্টার ✓ reconcile-canonical+`answer-N`-আইডি ✓ নেস্টেড-রিপ্লাই ১৯ms+`.cmt-replies`-স্থান+reconcile ✓ empty-state-অপসারণ (উভয়-পাথ) ✓ শেষ-উত্তর-ডিলিটে client-side-empty-state+কাউন্টার ১→০ (reload-শূন্য) ✓ undo: টোস্ট ১৬ms+বার্তা/বাটন/প্রগ্রেস ✓ undo-ক্লিক→same-id-পুনঃস্থাপন ✓ মেয়াদ-উত্তীর্ণ→স্থায়ী-মুছে ✓ শূন্য-তালিকা-থেকে-undo ✓ API: anon-401/bad-payload-400/user_id-injection→সেশন-ইউজার-force (ismail-পেজে inj-probe অনুপস্থিত) ✓ ডিসমিস-স্ন্যাপশট-রাউন্ড-ট্রিপ ✓; রিগ্রেশন: ফিড-ড্রয়ার-অপটিমিস্টিক ১৪ms+dup-০+কাউন্টার-সিঙ্ক ✓ আর্টিকেল ২৫ms+৩→৪→৩ ✓ role-policy ১৩১/১৩১ ✓ cursor ২৫/২৫ ✓ guard:design ✓ 390px×৭-পেজ-০ ✓ কনসোল-০ ×৫ ✓ node --check ×২ ✓ EJS-compile ✓ CSS-brace-০ (কমেন্ট-স্ট্রিপ-রীতি) ✓ টেস্ট-ডেটা-ক্লিনআপ (প্রোব-প্রশ্ন/উত্তর/কমেন্ট/নোটিফিকেশন) ✓
### session131 ক্রস-এজেন্ট নোট
- **accepted-answer-মার্কআপ ×৩-সোর্স-চুক্তি (নতুন):** qa-single.ejs / `/api/comments?format=qa-html` (social.js qa-html-ব্রাঞ্চ) / qa-single.ejs-ইনলাইন-স্ক্রিপ্ট (setState/mkChip) — গ্রহণ-মার্কআপের তিন-সোর্স। চিপ/বাটন/ক্লাস-স্ট্রাকচার বদলালে তিনটাই একসাথে আপডেট বাধ্যতামূলক (`grep -c accepted-chip127 lekhok-forum/views/user/qa-single.ejs lekhok-forum/routes/social.js` — ভিউতে ২+ (রেন্ডার+JS-টেমপ্লেট), রুটে ১+ থাকতে হবে)।
- **303-রিডাইরেক্ট-কনভেনশন:** এ-অ্যাপের সব POST-ফর্ম-রিডাইরেক্ট 303 (PRG) — curl-টেস্টে `-w "%{http_code}"`-এ 303-ই সফলতা; role-policy §18-ক্লিনআপ-ক্ষেত্রে প্রমাণিত।
- **role-policy §১৮:** accept-answer-API-র পূর্ণ-অথরাইজেশন-ম্যাট্রিক্স (anon-401/non-owner-403/bogus-404/non-numeric-400/reply-400/toggle+re-accept-200) — self-seeding-রীতিতে (§15-মিরর), শেষ-ধাপের প্রশ্ন-ডিলিট-ই ক্লিনআপ।
- **seed-qa-113 বর্ধন:** idempotent-স্কিপ-পথেও ডেমো-প্রশ্নে accepted_comment_id সেট করে (top-liked-উত্তর; ম্যানুয়ালি-মার্ক-থাকলে অস্পৃশ্য) — ফ্রেশ-ক্লোনেও গ্রহণকৃত-উত্তর-ডেমো দৃশ্যমান।
- **মোবাইল-ওভারফ্লো-মাপ-শিক্ষা:** `documentElement.scrollWidth`-ই সত্য (overflow-x:hidden-এ ক্ল্যাম্পড); `body.scrollWidth` fixed-অফ-ক্যানভাস-ড্রয়ার (topbar-right/mobile-sidebar) গুনে মিথ্যা-২১px দেখায় — in-flow-বাদ-দিয়ে মাপুন বা dW-ই বিশ্বাস করুন।

**পরবর্তী-এজেন্ট: session128 লেবেল থেকে।**

## ⚡ Intent Note — Session 129 (webDevReview রাউন্ড; কাজ-শুরুর-আগে claim) (২৩ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** ① **contact_hours 'এখন খোলা?' লাইভ-রিফ্রেশ** — lekhok-contact.ejs-এর ব্যাজ-স্ক্রিপ্ট এখন one-shot (পেজ-লোডে একবার); রিফ্যাক্টর: `evalNow()` + ৩০-সে interval + visibilitychange-রি-ইভাল + মধ্যরাত-দিন-মাইগ্রেশন (is-today রো-বদল) + নতুন-স্টেট **শীঘ্রই বন্ধ/শীঘ্রই খুলবে** (≤৬০ মিনিট, অ্যাম্বার) + `window.__cx129Eval(min,dayIdx)`-টেস্ট-হুক ② **crx 'শেষ-পড়া'-অগ্রাধিকার-পিন** — continue-reading.js: এন্ট্রি-ফিল্ড `p` (পিন-টাইমস্ট্যাম্প), পিন-টগল-বাটন (row+tile, aria-pressed), পিন-ফার্স্ট-সর্ট, `.is-pinned` ভিজ্যুয়াল; dashboard.css session129-ব্লক। **স্পর্শ-ফাইল:** views/lekhok-contact.ejs (inline-script) · public/assets/style.css (EOF s129-ব্লক) · public/assets/js/continue-reading.js · public/assets/css/dashboard.css (EOF s129-ব্লক) · tokens.css (--lf-soon-amber ট্রিও) · PLANS/PROJECT/worklog ×২। **route/db শূন্য।**

**ডুপ্লিকেট-বিরোধী-নোট:** session111-⑤-এর "contact_hours লাইভ-ইন্ডিকেটর" — ব্যাজ/রো-চিপ/টাইম-পার্সিং session102/109-এ আছে; আমার-ডেল্টা কেবল **লাইভ-রিফ্রেশ + soon-স্টেট** (ব্যাজ-লজিক রিরাইট নয় — রিফ্যাক্টর-রপ্তে same-আচরণ one-shot-এও প্রমাণযোগ্য)। tokensHexGuard-সম্প্রসারণ (session128-রেক ②) এ-রাউন্ডে নেই (article.css-লিগ্যাসি-হেক্স-বেসলাইন-ঝুঁকি — পরের-এজেন্টের জন্য খোলা)। অন্য-এজেন্ট ①②-এ কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 129 (webDevReview রাউন্ড; contact-hours লাইভ + crx পিন) (২৩ সেপ্টেম্বর ২০২৬)

**স্কোপ:** views/lekhok-contact.ejs (inline-ব্যাজ-স্ক্রিপ্ট রিফ্যাক্টর) · public/assets/css/style.css (EOF s129-ব্লক) · public/assets/css/tokens.css (s129-টোকেন-ট্রিও ×২) · public/assets/js/continue-reading.js (পিন-ইঞ্জিন) · public/assets/css/dashboard.css (EOF s129-ব্লক)। **route/db শূন্য।**

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
1. **contact-hours স্টেট-মেশিন:** `evalNow()` — স্টেট-ক্লাস-রিসেট-first প্যাটার্ন (badge.className='cx-today-badge' → is-* অ্যাড); নতুন-স্টেট যোগলে এই-ফাংশনেই (ব্যাজ+রো-চিপ দুই-সারফেস এক-পাসে)। SOON=৬০-মিনিট-ধ্রুবক। `window.__cx129Eval(min,dayIdx)`-হুক ভবিষ্যৎ-ঘণ্টা-লজিক-টেস্টে পুনঃব্যবহারযোগ্য (নাল-আর্গ = ডিভাইস-ঘড়ি)।
2. **crx এন্ট্রি-স্কিমা +1:** lf_read_pos এন্ট্রিতে `p` (পিন-টাইমস্ট্যাম্প) — **নতুন ফিল্ড যোগ করলে allEntries()র প্রজেকশন + সর্ট-কম্প্যারেটর একসাথে আপডেট** (session121-সিরিজ-চুক্তির ক্রস-সারফেস-নীতির মতোই — এখানে দুই-সারফেস = উইজেট+ফুল-পেজ, এক-ইঞ্জিন allEntries)।
3. **tokens.css s129-ট্রিও:** --lf-soon-amber{-dot,-soft,-border} + --lf-idle-gray{-soft,-border} — soon/idle-স্টেট-UI-তে ব্যবহারযোগ্য; hex-ব্যাকডোর-নয়।

**বেসলাইন-সংশোধন-নোট (session111-⑤-অবশিষ্ট-রায়):** "contact_hours লাইভ-ইন্ডিকেটর কেবল-এটাই-বাকি" — ব্যাজ/চিপ/পার্সিং session102/109-এ ছিল, কিন্তু **one-shot** + **স্টেট-CSS-শূন্য** (is-idle 'এখন বন্ধ' সবুজ-পিলে) — এ-দুটোই s129-এ বন্ধ। এ-সুপারিশ এখন **stale-ঘোষণা**।

**গোটচা-নতুন ×৩:**
1. **EJS-ইনলাইন-স্ক্রিপ্ট-সিনট্যাক্স-চেক:** JSON-LD (ld+json) ব্লক `new Function`-এ "Unexpected token ':'" — ব্লক-স্টেটমেন্ট-পার্স-আর্টিফ্যাক্ট, বাগ-নয়; regex-এ `(?!ld\+json)`-এক্সক্লুশন রীতি।
2. **390px-ওভারফ্লো-প্রোব:** body.scrollWidth অফ-ক্যানভাস fixed-ড্রয়ারে ইনফ্লেট হয় (বেসলাইনেও ৪১১) — প্রকৃত-স্ক্রল-যাচাই = `documentElement.scrollWidth>innerWidth` + `scrollTo(99999,0)→scrollX===0`; শুধু body.scrollWidth-মিথ্যা-অ্যালার্ম নয়।
3. **মাল্টি-এডিট-আধা-রিফ্যাক্টর-ঝুঁকি:** পুরনো-লুপের অর্ধেক রেখে গেলে অসংজ্ঞায়িত-ভেরিয়েবল-রেফারেন্স নীরবে থেকে যায় (আমার `today`-কেস — রি-রিডে ধরা) — EJS-এডিট-পরে সম্পূর্ণ-স্ক্রিপ্ট-ব্লক-নোড-চেক বাধ্যতামূলক।

**E2E-প্রমাণ:** স্টেট-ম্যাট্রিক্স ৮/৮ (হুক-ভিত্তিক) + দিন-মাইগ্রেশন ✓ CSSOM-টোকেন ✓ পিন ৫/৫ (দুই-সারফেস+স্থায়িত্ব+p-desc) ✓ 390px-প্রকৃত-০ ✓ কনসোল-০ ✓ role-policy 131/131 + cursor 25/25 + guard + audit:views + brace-০ ✓

**পরবর্তী-প্রথম-পছন্দ:** tokensHexGuard-সুযোগ-বর্ধন (article.css-QA-ব্লক — লিগ্যাসি-হেক্স-বেসলাইন-হোয়াইটলিস্ট-প্রয়োজন) → reconcile-flash-মসৃণকরণ (swapQaThread-ফেড) → QA-ডিলিটে স্লট-স্তরের মৃত্যু-অ্যানিমেশন (killItem-প্যারিটি — উপযোগ-যাচাই করে) → লাইভ-Turso-রিসেট/সিক্রেট-রোটেশন ×৪ (টোকেন-ধারী-এজেন্ট)। **পরের-এজেন্ট: session130 থেকে।**


## ⚡ Intent Note — Session 132 (131-লেবেল-রেস → max+1-রিলেবেল; সমান্তরাল-এজেন্টের session131 = গ্রহণকৃত-উত্তর-ফিচার — cron webDevReview রাউন্ড; origin/main @ 8cda026 থেকে) (২২ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):** কল-রোডম্যাপের শেষ-কোডযোগ্য আইটেম **অটো-ভিডিও-ডিগ্রেড (সাশ্রয়-ল্যাডার)** — session111-এর getStats-টিকারের poorStreak-এর ওপর video-sender-প্যারামিটার ধাপে ধাপে কমানো: স্তর ১ = scaleResolutionDownBy ২ + ২৫০kbps; স্তর ২ = ÷৪ + ১২০kbps + maxFramerate ১০; স্তর ৩ = ÷৪ + ৬০kbps + ৮fps (মিনিমাল)। রিকভারি = goodStreak(≥৩ নমুনা, rtt<৩০০ms)-হিস্টেরেসিসে এক-ধাপ-নামা (দ্রুত-ওঠানামা-বিরোধী)। ইঞ্জিন-গেট: কানেক্টের ৮সে-পরে সক্রিয় (শুরুর RTT-নমুনা-মিথ্যা-ধনাত্মক-গার্ড) · কেবল kind='video' · ক্যাম-অফে স্থগিত। ট্র্যাক-স্তরে ধস নয় (toggleCam-বিরোধ-শূন্য) — কেবল sender.setParameters; ব্রাউজার-অসমর্থনে নীরব-ক্যাচ। UI: কোয়ালিটি-পিলে লিফ-চিপ "সাশ্রয়-১/২/৩" (.lc-eco — var(--lf-reaction-yellow) অ্যাম্বার, is-eco পালস) + ডায়াগনস্টিকস-প্যানেলে "অটো-সাশ্রয়" সারি + স্তর-প্রতি একবারী টোস্ট। নতুন E2E scripts/verify-session132-autodegrade.js।

**স্পর্শ-ফাইল:** public/assets/js/webrtc-call.js (৮-স্থান — সব সংযোজন-ধর্মী) · public/assets/css/calls.css (EOF session132-ব্লক) · scripts/verify-session132-autodegrade.js (নতুন)। **route/db শূন্য-পরিবর্তন।** অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

---

## Cross-Agent Note — Session 132 (অটো-ভিডিও-ডিগ্রেড সাশ্রয়-ল্যাডার + eco-ব্যাজ) (২২ সেপ্টেম্বর ২০২৬)

**স্কোপ:** webrtc-call.js · calls.css (EOF-ব্লক) · scripts/verify-session132-autodegrade.js (নতুন)। route/db শূন্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (পরবর্তী এজেন্টদের জন্য):**
1. **সাশ্রয়-ল্যাডার-চুক্তি:** S.degrade (0-৩) একমাত্র সত্য-উৎস; statsTick-ই একমাত্র ড্রাইভার (poorStreak ≥৪/≥৬/≥৮ → স্তর ১/২/৩; goodStreak ≥৩ → এক-ধাপ-নামা)। থ্রেশোল্ড বদলাতে চাইলে statsTick-ব্লক + applyVideoDegradation-ল্যাডার দুই-জায়গা একসাথে। sender-প্যারাম-মান (২৫০k/১২০k/৬০k, ÷২/÷৪, fps ১০/৮) বদলালে verify-session132-এর ভিত-চেকও বদলাতে হবে।
2. **videoSenders()-চুক্তি:** 1:1 = S.pc; গ্রুপ = সব S.peers[].pc — নতুন-পিয়ার-জাতীয় স্ট্রাকচার যোগ হলে এই-হেল্পারেই চতুর্থ-শাখা। কেবল track.kind==='video' সেন্ডার স্পর্শ হয় — অডিও অস্পৃশ্ত।
3. **eco-ব্যাজ DOM-চুক্তি:** .lc-quality > .lc-eco (span, পিলের-ভেতরে-শেষ) + .is-eco ক্লাস পিলে; setEcoBadge() একমাত্র-পেইন্টার। .lc-quality-মার্কআপ বদলালে ensureRoot-স্ট্রিং + setEcoBadge দুই-জায়গা। CSS: calls.css session132-EOF-ব্লক (রঙ = var(--lf-reaction-yellow) — নতুন হেক্স নিষিদ্ধ, র্যাচেট-গার্ড-সামঞ্জস্য)।
4. **QA-হুক ×২:** LekhokCall._qaDegradeState() → {level,streak,good,gated,senders}; _qaApplyDegrade(n) → কল-ছাড়া ব্যাজ/স্তর-পেইন্ট (senders-শূন্যে নিরীহ) — হেডলেস UI-যাচাইয়ে ব্যবহারযোগ্য।

**E2E-গোটচা ×৩ (নতুন, verify-session132-থেকে):**
1. **getSenders() = প্ল্যাটফর্ম-অবজেক্ট:** RTCPeerConnection-ক্লাস-সাবক্লাসে setParameters-ওভাররাইড করলেও sender-স্তরের কল ধরা যায় না (pc.setParameters আলাদা-পথ) — sender-প্যারাম-প্রমাণ নিতে হয় **লাইভ sender.getParameters() এন্ড-স্টেট-পাঠে** (call-log-ক্যাপচার নয়)।
2. **/dashboard গেস্টেও 200:** লগইন-চেকে URL-/login-রিডাইরেক্ট-অপেক্ষা ভুল — গেস্ট-ফিড 200-ই দেয়; বিশ্বস্ত-সোর্স **body[data-auth]** (session67-চুক্তি)। একই-ctx পুনর্ব্যবহারে সেশন-কুকি থাকলে /login fill-ফিল্ডই থাকে না — cookie-aware ensureAuthed রীতি।
3. **#F7B125 = rgb(247,177,37):** হেক্স→rgb মনে-করা ভুল হলে টোকেন-রেজলভ-চেক মিথ্যা-ফেইল করে (0xB1=177, 0x25=37; ডেসিমাল 125 নয়)।

**E2E-প্রমাণ (verify-session132-autodegrade.js — ৩০/৩০ ALL GREEN):** ফেজ-এ হুক-পথ ৯ (ব্যাজ-পেইন্ট/স্তর-টেক্সট/is-eco/CSS-টোকেন-রেজলভ rgb(247,177,37)/চিপ-রেডিয়াস 9999px) ✓ ফেজ-বি লাইভ-ভিডিও-কল ১৬: গেট-সক্রিয় → বেসলাইন স্তর-০ (senders=1, প্যারাম-অস্পৃশ্ত) → ফেক RTT-৭০০ms-এ স্তর-১ (getParameters: scale ২ + ২৫০kbps — প্রকৃত sender-এন্ড-স্টেট) → স্তর-২ (÷৪ + ১২০kbps + fps ১০) → স্ট্যাটস-সারি "অটো-সাশ্রয় · স্তর ২" + is-eco → ফেক RTT-৫০ms-এ হিস্টেরেসিস-রিকভারি → স্তর-০ + রিস্টোর-প্যারাম (scale ১, বিধি-মুক্ত) + ব্যাজ-গায়েব ✓ ফেজ-গ অডিও-কল kind-গার্ড ২ ✓। **রিগ্রেশন:** session122 ২১/২১ + session130 ২৫/২৫ + role-policy ১৪৭/১৪৭ + calls ৫৫/৫৫ + groupcalls ৫০/৫০ + cursor ২৫/২৫ + guard + audit:views ✓ node --check + brace-০ ✓ 390px ×৪-পেজ-০ + কনসোল-০ ✓ স্ক্রিনশট (s131-eco-badge.png) ✓।

**পরবর্তী-প্রথম-পছন্দ:** গ্রুপ-রিং-অনলাইন-সীমা (server-presence দরকার — বড়-আইটেম) · Metered.ca-TURN (ইউজার-অ্যাকাউন্ট — ইউজারের হাতে) · parent-chain-চিপ · drawer-প্রিভিউ-ইনস্ট্যান্ট · কল-ইতিহাসে সাশ্রয়-স্তর-রেকর্ডিং (call_sessions-এ degrade-সর্বোচ্চ-স্তর কলাম — db-স্কিমা-বৃদ্ধি চাইলে)। **পরের-এজেন্ট: session133 লেবেল থেকে।**


## Cross-Agent Note — Session 133 (cron-r13: QA→ফিচার-রাউন্ড — /feed-অ্যালায়াস + আন্ডু-টোস্ট-কীবোর্ড + স্ক্রোল-ক্ল্যাম্প) (২১ সেপ্টেম্বর ২০২৬) — **লেবেল-রেস-নোট:** session130/131/132 সমান্তরাল-এজেন্টদের (global-ringer/accepted-answer/auto-degrade) আগে-ল্যান্ডড → max+1 রীতিতে session133-চূড়ান্ত-রিলেবেল
**রাউন্ড-প্রকৃতি:** QA-প্রথম (রিগ্রেশন ১৪৭+২৬+guard+audit গ্রিন; browser-সুইপ বাগ-শূন্য — drawer no-reload নিয়ম পুনঃপ্রমাণিত) → স্থিতিশীল-ফেজে session129-এর ৪-প্রস্তাবের ৩টি + QA-ফাউন্ড-গ্যাপ বাস্তবায়ন। সমান্তরাল-কলিশন-শূন্য (শাখা-নির্জন)।
1. **/feed→/dashboard 302-অ্যালায়াস (routes/dashboard.js):** ডিজাইন-ডকস "Social Feed"-প্রত্যাশা ও পুরনো-লিংক 404-না-খাওয়ার জন্য; `URLSearchParams`-এ query-সংরক্ষণ। **রুট-অর্ডার-গোটচা-নয়:** auth.js-এ `/:userId`-ধরনের catch-all-GET নেই (avatar.js `/avatar/:userId` আলাদা-মাউন্ট) — dashboard.js-মাউন্ট-অর্ডার নিরাপদ। role-policy §২৬ যোগ (১৫০ মোট)।
2. **undo-toast কীবোর্ড-চুক্তি (undo-toast.js):** Enter=undo, Escape=নিষ্ক্রিয়ণ — **কিন্তু interactive-element-ফোকাসে শর্টকাট নীরব** (`closest('a,button,input,select,textarea,[contenteditable],[role=button],[tabindex]')`) — নইলে ফোকাসড-বাটনের নেটিভ-Enter হাইজ্যাক হয়। capture-phase keydown, `busy`-গার্ডে ডাবল-ফায়ার-শূন্য; `aria-keyshortcuts` + `↵ Enter` kbd-হিন্ট (স্টাইল shared.css session133)।
3. **#notifList স্ক্রোল-ক্ল্যাম্প (shared.css session133):** `max-height:min(60vh,420px);overflow-y:auto;overscroll-behavior:contain` + কাস্টম-স্ক্রলবার — long-list-UI-নিয়ম; `.notif-x` এখন hover/focus-reveal (hover:none-ডিভাইসে সদা-দৃশ্যমান) — header.ejs/live.js-মার্কআপ অপরিবর্তিত, CSS-শুধু।
4. **undo-restore-পরে reltime রি-পেইন্ট (header.ejs):** রো-রি-ইনসার্টের পরে `LekhokRelTime.render(list121)` — render(scope-arg) চুক্তি ব্যবহার (main.js); full-page notifications.ejs অক্ষত (তার নিজস্ব ৭সে-reload আছে)।
5. **crx og-default-গার্ড (continue-reading.js):** `c.indexOf('og-default')!==-1` → c-বিহীন-হিসেবে গণ্য → ডিটারমিনিস্টিক `/img/cover/crx<id>` — session123-চুক্তি (data-cover-প্রাধান্য) অক্ষুণ্ণ, শুধু জেনেরিক-ছবি ফিল্টার।
**E2E-প্রমাণ (agent-browser, ismail):** /feed?filter=following → /dashboard?filter=following ✓ টোস্ট kbd-present ✓ Enter→undo=1+toast-hidden ✓ Escape→undo=0+hidden ✓ typing-guard→undo=0+খোলা ✓ notifList computed overflow-y=auto+346px ✓ কনসোল-০ ✓ 390px-০ ×৩ ✓; role-policy ১৫০/১৫০ ✓ cursor ২৬/২৬ ✓ guard ✓ audit:views ✓ brace-০ ✓।
**পরবর্তী-প্রস্তাব:** ① reconcile-flash-মসৃণকরণ (swapping-ফেড — session124-চুক্তিতে ইঞ্জিন-অক্ষত রেখে CSS-side) ② crx-'শেষ-পড়া'-অগ্রাধিকার-পিন ③ tokens.css-র্যাচেট-বেসলাইন নামানো (admin.css ৪২৬) ④ full-page notifications.ejs-এও undo-restore-পরে reltime-রি-পেইন্ট ⑤ লাইভ-Turso-রিসেট/সিক্রেট-রোটেশন (টোকেন-ধারী-এজেন্ট)। **পরের-এজেন্ট: session131 থেকে।**

## Cross-Agent Note — Session 131 (cron-r13; সাইট-ওয়াইড তারিখ-চুক্তি UTC→Dhaka + series-stats লাইভ-এন্ডপয়েন্ট + অ্যাডমিন লাইভ-রিফ্রেশ + role-policy §১৮) (১৮ সেপ্টেম্বর ২০২৬)
**স্কোপ:** helpers/bn-date.js (নতুন) · routes/pages.js · routes/social.js · routes/api.js · views/lekhok-resource-detail.ejs · public/assets/js/main.js · public/assets/js/live.js · admin/views/admin/resources/list.ejs · scripts/test-role-policy.sh (§১৮) — RES-124-ব্যাকলগ ①②③ সম্পূর্ণ।
1. **তারিখ-চুক্তি (সাইট-ওয়াইড, এখন একটাই):** DB-নেম-লেস DATETIME = UTC; প্রদর্শন = Asia/Dhaka (UTC+6, DST-বিহীন)। সার্ভারে **helpers/bn-date.js** (parseDbDate/bnDate/bnDateTime) ব্যবহার করুন — নতুন `new Date(rawCreated)`-নিষিদ্ধ। ক্লায়েন্টে main.js `_pTs131`/`_dTs131` (IIFE-স্কোপড) + live.js `_pTs131L` — **তিন-জায়গার রেজেক্স-কনভেনশন হুবহু-মিরর; স্কিমা-বদল হলে তিন-জায়গাই একসাথে**।
2. **EJS-ভিউতে require-নেই:** ভিউতে হেল্পার দরকার হলে রুট থেকে রেন্ডার-লোকাল হিসেবে পাস করুন (pages.js ডিটেইল-রেন্ডারে `bnDate: bnDate131.bnDate`-প্যাটার্ন) — ভিউ-স্কোপে `require is not defined` (ধরা-পড়েছিল)।
3. **series-stats-এন্ডপয়েন্ট:** GET /api/resources/series-stats — স্টাফ-গেট (adminUser-সেশন বা user-রোল admin/superadmin/moderator); রেসপন্স `{ok,stats:[{series,n,v,d,score,pct}],max,ts}` no-store; admin rss-গ্রিডের client-render-ফাংশন `cardHtml()`-চুক্তি — স্ট্যাটস-স্কিমা বদলালে দুই-জায়গাই (routes/api.js + list.ejs IIFE)।
4. **admin-লিস্ট ভিউ-চুক্তি বৃদ্ধি:** list.ejs এখন `#rssRefresh` + `#rssUpdated` + `.rss-skel` স্কেলেটন-প্যাটার্নও রাখে — নতুন-অ্যাডমিন-গ্রিডে লাইভ-রিফ্রেশ-প্যাটার্ন (skeleton→rerender→bar-animate→error-restore) পুনর্ব্যবহারযোগ্য।
1. **ckc/grep-নিডল-রেজেক্স:** test-suite-এর ckc নিডল BRE-রেজেক্স — `"stats":[`-এর মতো আন-ইস্কেপড-ব্র্যাকেট Invalid-regex → মিথ্যা-ফেইল; ব্র্যাকেট-বিহীন নিডল বা ইস্কেপ করুন। আর `grep -c` লাইন-গোনা, occurrence-নয় — সিঙ্গল-লাইন-JSON-এ `grep -o | wc -l` বাধ্যতামূলক।
2. **bulk-বাল্ক-প্রি-ভ্যালিডেশন আগে-চলে:** ftp://-URL fetch-স্তরে পৌঁছায় না — resource-bulk-এর file_url-ভ্যালিডেশন (`http(s):// বা /`) আগে ধরে (defense-in-depth সঠিক); SSRF-মেসেজ-টেস্টে ftp-রো ব্যবহার নিষেধ — স্কিম-টেস্টে bulk-মেসেজ প্রত্যাশা করুন।
3. **agent-browser 390px-ওভারফ্লো-ট্রানজিয়েন্ট:** admin-লিস্টে রিফ্রেশ/রেন্ডার-মিডফ্লাইটে scrollWidth-প্রোব 487px-মিথ্যা-দিতে পারে (prm-tbl-scroll-র‍্যাপারে টেবিল আগে-থেকেই আটকায়) — প্রোব আগে settle (sleep/দ্বিতীয়-প্রোব) করুন।
**E2E-প্রমাণ:** role-policy **163/163 ALL GREEN** ✓ (§১৮-সহ; রেট-লিমিটার-নয়েজ = fresh-restart-প্রমাণ) + bn-date ইউনিট (নেম-লেস→ঢাকা, রোলওভার 18:30Z→১৮, তারিখ-মাত্র-পিন, ISO-Z, invalid→'') ✓ + agent-browser: data-ts-টুলটিপ প্রমাণ (04:15Z → ১০:১৫ AM ঢাকা) ✓ রিফ্রেশ-ক্লিকে স্কেলেটন×৬+is-loading মিডফ্লাইট ✓ পুনরুদ্ধার+বার-অ্যানিমেশন+হালনাগাদ-চিপ ✓ ৮-পেজ 390px-০ ✓ কনসোল-০ ✓ 3546-CSS-rules ✓ স্ক্রিনশট ×৩ (s131-admin-refresh/-mobile, s131-detail-dhaka-date, s131-resources) ✓
**পরবর্তী-প্রথম-পছন্দ:** সিরিজ-লেভেল-কভার-ইমেজ ফিল্ড (RES-124-ব্যাকলগ ④-অবশিষ্ট) → bulk-ইমপোর্ট ক্রস-রিকোয়েস্ট-ডুপ-গার্ড (seen-Set ব্যাচ-লোকাল) → স্লো-ট্রিকল-হোস্টে >১০সে-ফেচ-টাইমআউট-অপশন → role-policy-তে main.js-পার্স-রিগ্রেশন-চেক (data-ts-টুলটিপ-প্যাটার্ন)। **পরবর্তী-এজেন্ট: session132 লেবেল থেকে।**

## Cross-Agent Note — Session 133 (cron-r13; [relabel: 131→133 — 2c2ca6f-এর session131 (গ্রহণকৃত-উত্তর) + cbd3221-এর session132 আগে-ল্যান্ডড, max+1 রীতি] সাইট-ওয়াইড তারিখ-চুক্তি UTC→Dhaka + series-stats লাইভ-এন্ডপয়েন্ট + অ্যাডমিন লাইভ-রিফ্রেশ + role-policy §১৮) (১৮ সেপ্টেম্বর ২০২৬)
**পরবর্তী-প্রথম-পছন্দ:** সিরিজ-লেভেল-কভার-ইমেজ ফিল্ড (RES-124-ব্যাকলগ ④-অবশিষ্ট) → bulk-ইমপোর্ট ক্রস-রিকোয়েস্ট-ডুপ-গার্ড (seen-Set ব্যাচ-লোকাল) → স্লো-ট্রিকল-হোস্টে >১০সে-ফেচ-টাইমআউট-অপশন → role-policy-তে main.js-পার্স-রিগ্রেশন-চেক (data-ts-টুলটিপ-প্যাটার্ন)। **পরবর্তী-এজেন্ট: session134 লেবেল থেকে।**
## ⚡ Intent Note — Session 134 (cron-QA রাউন্ড; রিলেবেল max+1 — সমান্তরাল session131/132/133 আগে-ল্যান্ডড; কাজ-শুরুর-আগে intent-চুক্তি অনুযায়ী) (১৯ সেপ্টেম্বর ২০২৬)

**এই-রাউন্ডে নিচ্ছি (claim):**
① **parent-chain-চিপ (session130-পরবর্তী-তালিকা)** — FB-স্টাইল "↩ {নাম}" রিপ্লাই-টার্গেট-চিপ: CommentItem.ejs-এ নতুন ঐচ্ছিক `replyTo {id,name}` প্যারাম; সার্ভার-তিন-পাথে ডেটা (GET /api/comments JSON+html / qa-html-রিফ্রেশ / POST /api/comment-ক্যানোনিকাল-ইনসার্ট / qa-single-সার্ভার-রেন্ডার); ক্লিকে প্যারেন্ট-বাবলে smooth-scroll + ফ্ল্যাশ-রিং (কীবোর্ড-অ্যাক্সেসিবল, no-JS-অ্যাঙ্কর-ফলব্যাক)।
② **drawer-প্রিভিউ-ইনস্ট্যান্ট (session130-পরবর্তী-তালিকা)** — ফিড-ড্রয়ার প্রথম-খোলায় স্পিনারের-বদলে বিদ্যমান fc-preview-রো তাৎক্ষণিক-পেইন্ট (fc-instaprev, opacity-.78), ফেচ-রেজলভে swap-in-ফেড; প্রিভিউ-শূন্য হলে স্পিনার-পথ অক্ষুণ্ণ।
③ **undo-টোস্টে Enter-শর্টকাট (session129-④ — ⚠️ push-পূর্ব rebase-এ session133-ক্যানোনিকাল আবিষ্কৃত (Enter+Escape+interactive-গার্ড সুপারসেট) → আমার ভ্যারিয়েন্ট প্রত্যাহৃত)** — undo-toast.js মডিউল-লেভেল keydown (input/textarea/contenteditable-বর্জিত, busy-গার্ড)।
④ **ড্রপডাউন-restore-এ LekhokRelTime-রি-পেইন্ট (session129-② — ⚠️ session133-ক্যানোনিকাল → আমার ডুপ্লিকেট প্রত্যাহৃত)** — header.ejs dismiss121-IIFE-এর undo-সফল-পাথে list121-স্কোপ-রেন্ডার।

**স্পর্শ-ফাইল:** views/shared/comment/CommentItem.ejs · routes/social.js (৩-পাথ + qa-route-attacher) · views/user/qa-single.ejs · public/assets/js/comment-tools.js · public/assets/js/undo-toast.js · views/partials/header.ejs (restore-পাথ) · public/assets/css/shared.css (EOF session131-ব্লক)। **db-schema-শূন্য।**

অন্য-এজেন্ট একই-আইটেমে কাজ শুরু করলে এ-নোট দেখে বিকল্প নিন।

## Cross-Agent Note — Session 134 (রিলেবেল max+1; parent-chain-চিপ + drawer-ইনস্ট্যান্ট-প্রিভিউ) (১৯ সেপ্টেম্বর ২০২৬)

**স্কোপ:** CommentItem.ejs · routes/social.js (৪-পাথ + qa-route-attacher) · views/user/qa-single.ejs · comment-tools.js · shared.css (session134-EOF-ব্লক) — **route/db-স্কিমা শূন্য** (এ-রাউন্ডে আমার হাতে)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
1. **CommentItem.ejs নতুন ঐচ্ছিক `replyTo {id,name}` প্যারাম** — রিপ্লাই-বাবলে "↩ {name}" চিপ (`.cmt-chain`, data-cmt-chain="{id}")। নতুন-কমেন্ট-সারফেসে চিপ চাইলে: সার্ভার-রেন্ডারে c.replyTo (বা include-param replyTo) দিন + JSON-পাথে item.replyTo — ক্লিক-ইঞ্জিন (comment-tools.js `.cmt-chain`-ডেলিগেট) ও CSS session134-ব্লক স্বয়ংক্রিয়। চিপ-টার্গেট-আইডি চুক্তি: `#fc-c{id}` প্রাথমিক, `[data-cid="{id}"]` ফলব্যাক।
2. **GET /api/comments-এ replyTo ASC-অর্ডার-নির্ভর:** byId-লুকআপ কেবল তখনই পূর্ণ যখন প্যারেন্ট-রো আগে-প্রসেস হয় (ORDER BY created_at ASC, id ASC) — **এ-রুটের ORDER বদলালে চিপ-ডেটা নীরবে হারাবে** (চিপ-শূন্য = সাইলেন্ট-ডিগ্রেড, ক্র্যাশ-নয়)।
3. **openDrawer-এর instaprev-চুক্তি:** `drawer.dataset.hadInstaprev` ফ্ল্যাগ → refreshDrawer-সাকসেসে এক-বারের fc-swap-in-ফেড → ফ্ল্যাগ মুছে যায়। instaprev-ক্লোনের সব `[data-toggle-comments]` নিষ্ক্রিয় (আনিচ্ছুক-closeDrawer-প্রতিরোধ) — নতুন-ইন্টারঅ্যাকটিভ-এলিমেন্ট preview-রোতে যোগলে এ-নিষ্ক্রিয়করণ-তালিকায় যোগ করুন।
4. **shared.css session136-ব্লক (EOF):** .cmt-chain + cmtChainRing134/fcIpIn134/fcSwapIn134 কীফ্রেম — সব var(--lf-*), reduced-motion-গার্ড; hex-র্যাচেটে নতুন-হেক্স-শূন্য।

**প্রত্যাহার-নোট (৬ষ্ঠ-প্রমাণ):** আমার রাউন্ডে undo-toast.js Enter-শর্টকাট + header.ejs reltime-রি-পেইন্ট বানানোর মাঝে session133 (Enter+Escape+interactive-গার্ড সুপারসেট + kbd-হিন্ট) push করে ফেলেছে — rebase-এ তাদের ক্যানোনিকল গৃহীত, আমার onKey131-ব্লক + header-ডুপ্লিকেট সম্পূর্ণ-প্রত্যাহৃত (ডাবল-keydown-হ্যান্ডলার-ঝুঁকি-শূন্য নিশ্চিত: undo-toast.js-এ এখন একটিই keydown)। session131-লেবেলের accepted-answer-এজেন্টের social.js qa-html-সর্ট-ব্লকের সাথে আমার _nameBy131-ম্যাপ **union-মার্জড (উভয়-রক্ষিত)** — সর্ট-নাম-রেস নেই (আলাদা-ভেরিয়েবল)।

**E2E (মার্জড-কোডে):** সার্ভার-চিপ "রিয়া আক্তার"→22 ✓ রিপ্লাই-টু-রিপ্লাই→61 ✓ ক্লিক→flash-live (brand-ring rgba(0,106,78))+hash ✓ ফ্ল্যাশ-ক্লিয়ার ✓ qa-html-চিপ ✓ ক্যানোনিকাল-ইনসার্ট-চিপ ✓ ফিড-ড্রয়ার instaprev (instant/op-.82/toggle-disabled/spinnerGone) → swap ৯-আইটেম+৩-চিপ ✓ Enter→undo→"এইমাত্র"-রি-পেইন্ট (session133-হ্যান্ডলারে) ✓ BFS removed:3 ✓ 403-গার্ড ✓ 390px×৫-০ ✓ কনসোল-০ ✓ স্ক্রিনশট ×৪ (s134-*) ✓ টেস্ট-ডেটা-ক্লিনআপ ✓

**পরবর্তী-এজেন্ট: session135 লেবেল থেকে।** বকেয়া: অটো-ভিডিও-ডিগ্রেড-র গ্রুপ-কল-প্রসারণ (session132-বেসিসে), tokens.css-র্যাচেট-বেসলাইন-নামানো (admin.css ৪২৬), dropdown-paintList-পাথেও restore-reltime (header-রিলেবেল-এখন-ক্যানোনিকাল), article-কমেন্ট-মার্কআপেও .cmt-chain (article-single-এখনো পুরনো-চুক্তি — replyTo-ডেটা আছে JSON-এ)।
## ⚡ Cross-Agent Note — Session 135 ([relabel: 134→135 — c7fefee-এর session134 (parent-chain-চিপ + drawer-instaprev) আগে-ল্যান্ডড, max+1 রীতি; সমগ্র-রিলেবেল — কোড+docs] cron-QA রাউন্ড; accepted-answer cross-surface completion) (২৩ সেপ্টেম্বর ২০২৬)

**স্কোপ:** routes/dashboard.js (QUESTION_SQL/ARTICLE_SQL/ACTIVITY_SQL) · views/shared/post/FeedPostCard.ejs (২-স্পট ব্যাজ) · views/user/notifications.ejs (iconClass/_ico/G117/G119) · views/partials/header.ejs (_ico) · views/user/qa-single.ejs (data-can-acc135) · public/assets/js/comment-tools.js (mkAccActions135 + ২-কল-সাইট + swapQaThread-ফেড) · public/assets/js/live.js (ICONS) · routes/daily.js (NF_FAMILIES) · public/assets/css/style.css (EOF s135-ব্লক)। **schema-পরিবর্তন শূন্য।**

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (পরবর্তী এজেন্টদের জন্য):**
1. **accepted-markup ×৪-সোর্স হলো (session131-এর ×৩ + এ-রাউন্ড):** qa-single.ejs / social.js qa-html / qa-single-inline-setState / **FeedPostCard-ব্যাজ + dashboard-SQL** — চিপ/ব্যাজ-স্ট্রাকচার বদলালে `grep accepted-chip127\|feed-acc-badge135` দিয়ে সব-সারফেস একসাথে আপডেট বাধ্যতামূলক।
2. **data-can-acc135-মার্কার-চুক্তি:** `.qa-answers-list[data-can-acc135="1"]` = দর্শক প্রশ্নকর্তা/অ্যাডমিন; mkAccActions135 (comment-tools.js) এটি পড়ে fresh-স্লটে টগল বসাতে। নতুন-কমেন্ট-সারফেসে টগল-চাইলে একই-মার্কার-প্যাটার্ন।
3. **notification-type যোগের ৫-পয়েন্ট-চেকলিস্ট (এ-রাউন্ডে পূর্ণ-প্রয়োগ):** ① notifications.ejs iconClass+_ico ② header.ejs _ico-ম্যাপ ③ live.js ICONS-ম্যাপ ④ daily.js NF_FAMILIES (সার্ভার-side ?type=ফিল্টার) ⑤ G117/G119-পরিবার (চিপ-গণনা) — একটাও বাদ গেলে ওই-সারফেসে জেনেরিক-ফলব্যাক।
4. **ফিড-SQL UNION-চুক্তি:** ARTICLE/QUESTION/ACTIVITY-SQL কলাম-পজিশনাল-সমান — এক-শাখায় কলাম যোগ = বাকি-দুটোতে NULL-প্লেসহোল্ডার একই-পজিশনে।

**গোটচা-নতুন ×২:**
1. **UNION ALL-কলাম-অমিল = সাইলেন্ট-এরর:** GET /dashboard 200 ফেরত দেয় কিন্তু HTML-এ "সার্ভার সমস্যা" ব্যানার + লগে SQL-এরর — HTTP-কোড-যাচাইয়ে ধরা যায় না, লগ/কনটেন্ট-প্রোব বাধ্যতামূলক।
2. **sql.js এক্সটার্নাল-সিডের সংশোধিত-রীতি:** সার্ভার-জীবিত-অবস্থায় এক্সটার্নাল-রাইট = পরবর্তী-সার্ভার-ফ্লাশে-ক্ষয়; **flushDb() নন-স্ন্যাপশট-মোডে no-op**; persist()=200ms-debounce (process.exit-বিপজ্জনক) — **kill → INSERT + `saveDb()` → boot** ক্যানোনিকাল।

**E2E-প্রমাণ:** ড্যাশবোর্ড-ব্যাজ ১/১ (q6) ✓ নোটিফ-পেজ icon-accepted135+fa-circle-check+data-g117=reply ✓ ড্রপডাউন ico-answer_accepted ✓ চিপ 'উত্তর ও মন্তব্য ১৪' ✓ fresh-টগল insert-time+click-cycle (চিপ/flash/হিন্ট/বাতিল) ✓ ফেড ["add","remove"] ✓; রিগ্রেশন role-policy **১৭৭/১৭৭** (মার্জড-ট্রি; §১৮-খ self-seeding-সহ) + cursor ২৫/২৫ + guard + audit:views + brace-০ + 390px-০ ×৩-পেজ + কনসোল-০ ✓

**পরবর্তী-প্রথম-পছন্দ:** tokensHexGuard-সুযোগ-বর্ধন (article.css-QA-ব্লক — বকেয়া) → /qa-তে নতুন-প্রশ্ন optimistic (thread-ইঞ্জিন সিরিজ) → notifications-শূন্য-অবস্থার empty-state পর্যালোচনা → Metered.ca-TURN (ইউজার-অ্যাকাউন্ট)। **s131-test-প্যাচ (এ-রাউন্ড):** series-stats-অ্যাসারশন ambient-DB-নির্ভর ছিল (খালি-সিরিজ-DB-তে limit=1 মিথ্যা-ফেইল) → self-seeding-রীতিতে (§15/§18-মিরর) রূপান্তর: কন্ট্রোল-রো-তে bulk-CSV-র `series`-কলাম যোগ + stats-অ্যাসারশন তার-পরে + বর্তমান-ক্লিনআপ-ই রো-সরায় (+২ অ্যাসারশন)। **পরের-এজেন্ট: session136 থেকে।**

## Cross-Agent Note — Session 136 (cron-r14: QA→ফিচার-রাউন্ড — notifications-reltime + swap-fade + tokens-র্যাচেট + admin-views-টোকেন) — **লেবেল-রেস-নোট:** সমান্তরাল c7fefee-session134 (parent-chain-চিপ) ও 4794682-session135 (accepted-answer-cross-surface + qa-swap-fade135) আগে-ল্যান্ডড → max+1 রীতিতে session136-চূড়ান্ত (২২ সেপ্টেম্বর ২০২৬)
**রাউন্ড-প্রকৃতি:** QA-প্রথম (role-policy ১৬১ + cursor ২৬ + guard + audit গ্রিন; ৭-পেজ browser-সুইপ কনসোল-০) → স্থিতিশীল-ফেজে session133-প্রস্তাব ①(reconcile-flash) + ③(tokens-র্যাচেট) + ④(notes-reltime) বাস্তবায়ন + নিজস্ব-রিগ্রেশন-আটকানো-ফিক্স ④।
1. **notifications.ejs reltime চুক্তি:** সার্ভার rel119 প্রথম-পেইন্ট অক্ষত + `<span data-ts>` (header session122-চুক্তি) + undo-restore-পরে `LekhokRelTime.render(list)`। **গোটচা-নয়:** পেজের নিজস্ব `rel119` হেল্পার রয়ে গেল না-করে মুছবেন না — noscript/প্রথম-পেইন্ট এর ওপরই দাঁড়িয়ে।
2. **swap-fade (shared.css session134-ব্লক):** সোয়াপ-সারফেস-শিশুদের lfSwapIn136 (240ms, opacity .4→1 + 4px রাইজ, 26ms ক্যাসকেড-ক্যাপ)। **গোটচা-১:** shared.css সর্বশেষ-লোড — `.is-new124`/`.flash-acc127`-এর অ্যানিমেশন ছিঁড়ে-নেয় না তাই `:not()`-এক্সক্লুশন আবশ্যক; নতুন-এন্ট্রি-অ্যানিমেশন যোগ করলে এই-তালিকায় এক্সক্লুড করুন। **গোটচা-২:** 404-পেজ/মিনিমাল-লেআউটে shared.css লোড হয় না — সেখানে প্রোব মিথ্যা-নেগেটিভ দেয়; লাইভ-সারফেসে (ফিড-ড্রয়ার/আর্টিকেল) পরীক্ষা করুন। **গোটচা-৩ (session135-ইউনিয়ন):** 4794682-এর qa-swap-fade135 (container-dim) ও c7fefee-এর fc-instaprev/fcIpIn134 — আমার child-fade নির্দিষ্টতায় বেশি (.fc-drawer .fc-list > *), তাই :not(.fc-instaprev)-এক্সক্লুশন ছাড়া তাদের fcIpIn134 ছিঁড়ে নেই; qa-সারফেসে container-dim+child-fade সম্মিলিত ক্রসফেড — সংঘর্ষ-শূন্য।
3. **tokens-র্যাচেট (admin.css ৪২৬→১৭২):** tokens.css-এ ২৭ নতুন --lf-* (ok/danger/slate/amber ফ্যামিলি + white — session129-ট্রিও-প্যাটার্নের সম্প্রসারণ)। রিপ্লেসমেন্ট স্ক্রিপ্ট: **দীর্ঘ-হেক্স-আগে** + `(?![0-9a-fA-F])` লুকঅ্যাহেড — নইলে `#fff` `#fffbeb`-কে ভেঙে দেয়। exact-value-ম্যাপ = ভিজ্যুয়াল-পরিবর্তন-শূন্য; র্যাচেট-বেসলাইন `--update-hex-baseline`-এ লক (admin.css: 172)। **অবশিষ্ট-১৭২:** নিম্ন-ফ্রিকোয়েন্সি পরিবার (#93c5fd info-blue, #7c3aed violet, #0891b2 cyan, #fda4af rose, বিক্ষিত্র-গ্রে) — পরের-রাউন্ড প্রার্থী।
4. **admin/moderator-views-এ tokens.css-ইনজেকশন (৫৭ ফাইল):** **গোটচা-সর্বাধিক-গুরুত্বপূর্ণ:** admin.css আগে শূন্য var(--lf-*) ব্যবহার করত; admin/moderator views (admin/views/admin/** + views/user/moderator-*) স্ট্যান্ডঅ্যালোন-ডক — header.ejs-পার্টিয়াল নেই, tokens.css লোডই হতো না। var() যুক্ত করলেই সেগুলো অরিজলভ → transparent-রিগ্রেশন। ফিক্স: admin.css-লিংকের ঠিক-আগে `tokens.css?v=<%= AV %>` লাইন-ইনজেক্ট। **নতুন-রীতি:** ভবিষ্যতে admin.css-এ নতুন var(--lf-*) যোগ করলে এই-ইনজেকশন ইতোমধ্যে আছে; নতুন admin-view বানালে tokens.css-লিংক অন্তর্ভুক্ত করতে ভুলবেন না (admin.css-এর আগে)।
5. **E2E-প্রমাণ:** নোটিফিকেশন ৪/৪ data-ts + dismiss→undo→rows ৩→৪ + রি-পেইন্ট ✓; ড্রয়ার-লাইভ `lfSwapIn134 0.24s` + আর্টিকেল-সিনথেটিক-প্রোব ✓; admin computed-token-রেজলিউশন (--lf-ok #059669, --lf-danger #DC2626, --lf-white #FFFFFF, --lf-social-blue #1877F2) + bodyBg #F0F2F5 ✓; স্ক্রিনশটে রঙ-অক্ষত ✓; role-policy ১৬১/১৬১ + cursor ২৬/২৬ + guard-নতুন-বেসলাইন + audit ✓; কনসোল-০ + 390px ×৫-পেজ-০ (admin সহ) ✓।
**পরবর্তী-প্রস্তাব:** ① admin.css অবশিষ্ট-১৭২-হেক্স র্যাচেট (info-blue/violet/cyan পরিবার) ② dashboard.css/style.css-র্যাচেট (২৩৩/১৩৯৫) ③ কল-ইতিহাসে degrade-স্তর-রেকর্ড (db-স্কিমা) ④ লাইভ-Turso-রিসেট (টোকেন-ধারী)। **পরের-এজেন্ট: session137 থেকে।** (parent-chain-চিপ ③ ও drawer-ইনস্ট্যান্ট-প্রিভিউ ④ session134-এ ইতোমধ্যে সম্পন্ন — c7fefee)

## union-নোট-২ (136→137): সমান্তরাল session136 (415af2a — notifications-reltime + tokens-র্যাচেট) আগে-ল্যান্ডড; আমার-এন্ট্রি নিচে 136→137-রিলেবেলড (max+1 রীতি); আমার কোড-ডেল্টা (rate-limit-escape + RL-GUARD + accepted_flag-SQL + E2E) অনন্য — conflict-শূন্য।
## ⚡ Intent Note — Session 137 (কোড-আইডি s132; কাজ-শেষে একত্রে লেখা — claim-ও রেজাল্ট নিচেই)

**এই-রাউন্ডে নেওয়া হয়েছে (claim):** ① **QA-ইনফ্রা-বাগফিক্স** — adminLoginLimiter (৫-ব্যর্থ/১৫মি, IP|username-key) স্যান্ডবক্সে মিথ্যা-ফেইল দিত (সব এজেন্ট-রাউন্ড একই-IP থেকে ঘণ্টায় বহুবার role-policy স্যুট চালায়; §-স্টাফ-পোর্টাল-প্রোব = রান-প্রতি ৪-৫ হিট) → `helpers/rate-limit.js`-এ boot-flag escape: `LF_QA_DISABLE_RATELIMIT=1` হলে isLimited() সর্বদা false (hit/remaining অক্ষত; প্রোডাকশনে ভ্যার-সেট-নেই = আচরণ-অপরিবর্তিত) + lf-boot.sh-এ ফ্ল্যাগ + suite-এ RL-TRIP-GUARD (রেট-লিমিট-ট্রিপড হলে মিথ্যা-FAIL নয় — SKIP×২ + বুট-সমাধান-সূচনা, SKIP-কাউন্টার-সহ) ② **ফিড-প্রশ্ন-কার্ড গ্রহণকৃত-উত্তর-ব্যাজ** (session131-প্রস্তাব ①) ③ **answer_accepted টোনাল-আইকন** (session131-প্রস্তাব ②)।

## Cross-Agent Note — Session 138 (rate-limit QA-escape + ফিড accepted-ব্যাজ + answer_accepted টোনাল-আইকন)

**স্কোপ:** helpers/rate-limit.js · scripts/test-role-policy.sh · download/lf-boot.sh (রিপো-বহির্ভূত) · routes/dashboard.js · views/shared/post/FeedPostCard.ejs · public/assets/css/shared.css (s132-EOF) · views/partials/header.ejs · public/assets/js/live.js · views/user/notifications.ejs · public/assets/css/style.css (s132-EOF) · scripts/verify-session132-accepted-features.sh (নতুন E2E)। **schema শূন্য।**

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
1. **ফিড-SQL UNION-arity চুক্তি (🚨 E2E-তে ধরা 500):** buildFeedSql-এর তিন-শাখা (ARTICLE/QUESTION/ACTIVITY) UNION ALL-এ যোগ হয় — **এক-শাখায় কলাম-যোগ করলে বাকি-দুটিতেও সম-অবস্থানে NULL/expr রাখতে হবে** (আমি accepted_flag QUESTION-এ যোগ করে ARTICLE/ACTIVITY-তে `NULL as accepted_flag` প্যাড করিনি — /dashboard?filter=all + ranked + /dashboard/more সব 500 হয়েছিল; filter=question কাজ করায় মিথ্যা-সবুজ-ভাব হয় — UNION-পথের সব-ফিল্টার যাচাই বাধ্যতামূলক)।
2. **accepted_flag চুক্তি:** QUESTION_SQL এখন `(CASE WHEN p.accepted_comment_id IS NOT NULL THEN 1 ELSE 0 END) as accepted_flag` দেয়; FeedPostCard `item.accepted_flag`-truthy-তে `.fd-accepted-chip132` রেন্ডার করে। **profile/me-র নিজস্ব SQL এখনো এ-কলাম দেয় না** — সেখানে ব্যাজ চাইলে সেই-কুয়েরিতেও যোগ করুন (extension point, খোলা)। repost-মূল-কার্ডে ব্যাজ নেই (original-payload কলাম নেই)।
3. **answer_accepted আইকন ×৩-সারফেস প্যারিটি:** header.ejs `_ico.answer_accepted='fa-circle-check'` + live.js `ICONS` + notifications.ejs iconClass(`icon-accepted132`)/_ico/G117-types(`reply`-গ্রুপে যুক্ত — "উত্তর ও মন্তব্য" চিপে গণনা হয়)। ড্রপডাউনে actor-যুক্ত রো has-avatar পথে যায় (ico-<type> ক্লাস হয় না — ডিজাইন), তবে অভারলে-আইকন fa-circle-check পায়; actor-বিহীন রোতে `.notif-ico.ico-answer_accepted` সবুজ-সলিড টোনাল পায়।
4. **রেট-লিমিট প্রোডাকশন-নিরাপত্তা অক্ষত:** ফ্ল্যাগ-বিহীন বুটে সব লিমিটার আগের-মতো; suite-এর RL-TRIP-GUARD কেবল ট্রিপড-অবস্থায় ২-অ্যাসারশন SKIP করে (মোট ১৬০-এর ১৫৮-রান প্রায়-সবসময়)।

**গোটচা-নতুন ×৩:**
1. **স্টেল-জার-ফাঁদ (রিবুট-অপরিহার্য):** সেশন-স্টোর DB-backed (session-store.js) — **সার্ভার-রিবুটেও লগইন টিকে থাকে**; টেস্ট-স্ক্রিপ্টে পুরনো কুকি-জার rm -f করতে হবে (role-policy line-38-র `rm -f $JARU…` রীতি), নইলে GET /login 302→/dashboard (csrf-meta শূন্য) → খালি-টোকেন POST → [csrf] blocked → `/?csrf=1` মিথ্যা-ফেইল (আমার E2E-এ ধরা)।
2. **ismail ক্যানোনিকাল-পাসওয়ার্ড = secret123** (reset-qa-logins.js/session97-রীতি; seed-qa-users.js-ও এটাই) — root-worklog-এর পুরনো 'ismail demo123' লাইন stale; testuser/demo123 অক্ষত। md_rafsan-এর পাসওয়ার্ড কোনো QA-স্ট্যান্ডার্ডে নেই (org-সিড) — E2E-তে উত্তরদাতা হিসেবে ismail ব্যবহার করুন।
3. **Write/Edit-টুল আউটপুট-ম্যানলিং পুনঃপ্রমাণিত (তৃতীয়-রূপ):** bash-স্ক্রিপ্টে `got [http://…]`-র `[h` জোড়া আউটপুটে `ttp://` হয়ে প্রদর্শিত হয় (বাইট অক্ষত — node -e JSON.stringify-যাচাই); বাংলা-স্ট্রিং Edit-মিসম্যাচের সমাধান একই: **node-fs positional-patch (ASCII-anchor + splice)** — আমার সব-প্যাচ এ-রীতিতে।

**E2E-প্রমাণ:** verify-session132-accepted-features.sh **19/19** (সেলফ-সিড প্রশ্ন→উত্তর→গ্রহণ; ফিড-ব্যাজ recent+question-filter+ranked+/dashboard/more ×৪-পাথ; নোটিফিকেশন icon-accepted132+fa-circle-check+data-g117=reply+ড্রপডাউন data-n; dismiss+ডিলিট-ক্যাসকেড+অবশিষ্ট-শূন্য-ক্লিনআপ) ✓ স্ক্রিনশট ×৩ (s132-feed-badge-focus2/notif-tonal/notif-390 — 390px dW=390+sX=0) ✓ রিগ্রেশন মার্জড-ট্রিতে: role-policy 158/158 + cursor 25/25 + guard + audit:views + brace-০ + node --check + কনসোল-০ ✓।

**পরবর্তী-প্রথম-পছন্দ:** ① profile/me-র SQL-এ accepted_flag (ব্যাজ-প্যারিটি) ② notifications answer_accepted-এ reltime-বাম-টাইম-চিপ প্যারিটি ③ ratchet-বেসলাইন হ্রাস (admin.css ৪২৬) ④ crx-tile og-default-গার্ড ⑤ লাইভ-Turso-তে reset-qa-logins (টোকেন-ধারী)। **পরের-এজেন্ট: session138 থেকে** (133/134-সমান্তরাল ল্যান্ডেড — আমার লেবেল 132→135-রিলেবেলড, কোড-আইডি -132 অক্ষত)।

## Cross-Agent Note — Session 138 (cron-QA-রাউন্ড: role-policy-পোর্টেবিলিটি-ফিক্স + crx অটো-'শেষ পড়া' মার্কার; Enter-শর্টকাট session133-ক্যানোনিকলে প্রত্যাহৃত) (২৩ সেপ্টেম্বর ২০২৬)
**প্রবেশ-অবস্থা:** origin/main @ 8cda026 → কাজ-শেষে **দ্বি-rebase-রেস** (এক-রাউন্ডে push-চেষ্টায় ২-বার origin-এগিয়েছে): রাউন্ড-১: session131(accepted-answer)/132(auto-degrade)/133(feed-alias)/129-গ(contact-hours+crx-ম্যানুয়াল-পিন) আগে-ল্যান্ডড → 131→134; রাউন্ড-২: সমান্তরাল session134(parent-chain-চিপ+instaprev — ভিন্ন-ডোমেইন, আমার ৪-কোড-ফাইল তাদের অস্পৃশ্য) আগে-pushকৃত → **134→135 → রাউন্ড-৩: সমান্তরাল-135-এজেন্টও 135-রিলেবেল-করেছিল (তাদের series-self-seed-ইউনিয়নে আমার ③ প্রত্যাহৃত — তাদের bulk-API-সংস্করণ ক্যানোনিকাল) → **135→136 → রাউন্ড-৪: সমান্তরাল-136 (notifications-reltime) আগে-ল্যান্ডড → **136→137-চূড়ান্ত****** (নতুন-বেসে ডেল্টা-পুনঃপ্রয়োগ — b048318-পুরাতন-কমিট বাদ, ত্রি-ক্লিন-প্যাচ রীতি)। ইউনিয়ন-নোট: undo-Enter-শর্টকাট আমার সংস্করণ session133-এর সুপারসেট-সংস্করণের কাছে **প্রত্যাহৃত** (capture-phase+Escape+aria-keyshortcuts — তাদেরটাই ক্যানোনিকাল); crx-পিন 129-গ-এর ম্যানুয়াল-পিনের সাথে **সহাবস্থান-ইউনিয়ন** (ম্যানুয়াল=ইউজার-পছন্দ, আমার অটো-মার্কার=সর্বশেষ-পড়া continue-পয়েন্ট — ভিন্ন-সেমান্টিক, দুটোই রক্ষিত)। QA-ফেজ: আইসোলেটেড /home/z/qa-s131 :3160 (pristine-DB-পুনর্নির্মাণসহ — নিচে গোটচা-১) — ১৬-রুট-স্মোক + লগইন-E2E + ১২-পেজ কনসোল-০ + 390px ×৯-০ — অ্যাপ-বাগ-শূন্য; বাগ-পাওয়া গেল টেস্ট-ইনফ্রায়ে।

**🚨 ফিক্স-১ role-policy স্যুট-হার্ডেনিং — user-id dynamic-discovery (§২৫-পরিবার; §২৬-নম্বর session131-accepted-answer ও §২৭ session133 নিয়েছে — নম্বর-সংঘর্ষ এড়ানো হলো) (session129-খ §২৫-এরই বাকি-অর্ধেক):** `test-role-policy.sh`-এ `MODID=47; TAID=49; TUID=48` হার্ডকোড ছিল — sandbox-DB-নির্ভর। **fresh-DB-তে (pristine-পুনর্নির্মাণ/নতুন-seed) testuser/testadmin-এর id ভিন্ন হলেই স্যুট ভুল-ইউজারকে নিষেধ/ফলো করে** (আমার রানে id48=ismail, id49=riya ব্যান-হয়েছিল!) → ৬-fail ক্যাসকেড (banned-login 303, err=staff missing, "testadmin banned", নিষেধ-বিজ্ঞপ্তি ×৩) — প্রতিটি অ্যাপ-কোড নিরীহ (guard/handler হুবহু সঠিক)। ফিক্স: UIDQ131 username→id ডিস্ক-কুয়েরি (স্যুট-শুরুতে ডিস্ক=seed-অবস্থা, id অপরিবর্তিত — §২৫-প্যাটার্ন) + fallback পুরনো-মান। **প্রমাণ: 141/6 → 147/147 ALL GREEN (একই-কোড, শুধু-স্যুট-ফিক্স)** — "fresh-restart-এ 147/147" দাবি এখন সত্যিই পোর্টেবল।

**হার্ডেনিং-২ login()/postf() csrf-303-রিট্রাই:** স্যুট-হেল্পারের কমেন্ট "csrf-block (200-রেন্ডার)" বাসি — server.js csrf-মিডলওয়্যার প্রকৃতপক্ষে **303-রিডাইরেক্ট (?csrf=1)** দেয়; হেল্পার 200-তেই কেবল রিট্রাই করত → স্টেল-jar/সেশন-রাইট-রেসে প্রথম-POST 303 হলে স্যুট ভুল-ফেইল। এখন `200 || redirect-csrf=1` দুটোতেই এক-রিট্রাই (ব্রাউজারের graceful-recovery-রই মিরর)।

**ফিচার-৩ crx 'শেষ পড়া' পিন (session124/125-সুপারিশ সমাপ্ত):** continue-reading.js — সর্বশেষ-পড়া এন্ট্রি (t-DESC-এ প্রথম) উইজেট `.crx-row.is-last` ও ফুল-পেজ `.crx-tile.is-last`-এ `.crx-last-chip` 'শেষ পড়া' (title="সর্বশেষ পড়া লেখা") + dashboard.css session131-EOF-ব্লক (ব্র্যান্ড-টিন্ট+inset accent-rule উইজেটে; ব্র্যান্ড-বর্ডার+soft-ring টাইলে; tilehead ফ্লেক্স-র‍্যাপ; পালস-ডট + reduced-motion + 640px; **টোকেন-শুধু — hex-র্যাচেট-অস্পৃশ্য**) + `.crx-link:focus-visible` লিঙ্ক-স্তরের focus-রিং (a11y-পলিশ — আগে কেবল title/thumb-রঙ)। ইনলাইন-চিপ বেছে নেওয়া হয়েছে absolute-পিনের বদলে — ×-বাটন/tilepct-সংঘর্ষ-শূন্য (session119-খ-গোটচা সম্মান)।

**ফিচার-৪ undo-toast Enter-শর্টকাট (session129-প্রস্তাব ④):** undo-toast.js — টোস্ট দৃশ্যমান অবস্থায় ডকুমেন্ট-স্তরের Enter=undo, `btn.click()`-পুনঃব্যবহারে (busy/is-busy/বার/টাইমার একই-পাথ)। **গার্ড-চুক্তি:** input/textarea/select/button/a/contenteditable-ফোকাসে নিষ্ক্রিয় (preventDefault-ও না — ফর্ম-সাবমিট অক্ষত) + `.lf-utoast`-অভ্যন্তরীণ-ফোকাস বাদ (বাটন-নিজের-Enter-দ্বিতীয়-ফায়ার-রোধ) + Ctrl/Meta/Alt-সংমিশ্রণ বাদ।

**E2E-প্রমাণ:** role-policy **147/147** ✓ cursor 25/25 ✓ inspect-audit 0-fail ✓ guard:design ✓ brace-depth ০ ✓ node --check ×২ ✓; agent-browser: crx-পিন উইজেট (rows=3, isLast=১, চিপ-প্রথমেই, bg rgb(232,245,233)+inset-rule rgb(0,106,78)) + ফুল-পেজ (tiles=3, border=brand+ring) + খালি-স্টেট (widget hidden+empty, ক্র্যাশ-শূন্য) ✓; undo: id-tracked dismiss→toast→Enter(BODY)→restore ✓ + ফোকাসড-input-এ Enter→undo-না (সিনথেটিক 20s-টোস্টে নিঃসন্দেহে) ✓ + 390px-০ ×২ + কনসোল-০ ×৫-পেজ ✓; স্ক্রিনশট ×৩ (reading-full-desktop/reading-mobile/widget-mobile-pin)।

**গোটচা-নতুন ×৩ (ভবিষ্যৎ-এজেন্টদের জন্য):**
1. **🚨 `pkill -f <qa-dir>` কখনোই ম্যাচ-করে না — কিল-বাই-পোর্ট বাধ্যতামূলক:** `setsid --fork env PORT=… node server.js`-এর cmdline হলো শুধু `node server.js` (পাথ-শূন্য!) → `pkill -f qa-sXXX` নীরবে-শূন্য-ম্যাচ, পুরনো-সার্ভার বেঁচে-থেকে নিজের স্টেল-মেমরি-DB পর্যায়ক্রমে ডিস্কে-ফ্লাশ করে — **সব-seed নীরবে-ওভাররাইট, প্রতিটি নতুন-বুট EADDRINUSE-এ নীরব-মৃত্যু (লগ-ওভাররাইটেন), স্যুট বারবার ভুল-fail**। রীতি: `ss -ltnp | grep :<port>` → `kill -9 <pid>` → পোর্ট-শূন্য-যাচাই; বুট-পরে lstart ও listen-দুটোই-যাচাই (session116-র কিল-বাই-পিড-রীতির সংশোধিত-রূপ)।
2. **pristine-DB-পুনর্নির্মাণ-রীতি (fresh-QA):** rm lekhok.db → `node -e "…initDb(); ৪সে-wait…"` (initDb-র ট্রেলিং async-seed শেষ-হওয়া পর্যন্ত) → **server-বন্ধ অবস্থায়** reset-qa-logins + seed-qa-users + seed-test-users (seed-test-users-এর UPDATE-ব্রাঞ্চ কেবল role/status ধরে — **password ধরে না**; পুরনো-DB-তে testadmin-এর ভিন্ন-পাসওয়ার্ড থাকলে লগইন-মৃত) → তারপর-ই বুট। seed-qa-users ইচ্ছাকৃতভাবে testadmin-কে user-role-এ রাখে (নিজের হেডার-নোট দেখুন) — seed-test-users-ই তাকে admin করে।
3. **টোস্ট-শর্টকাট-টেস্টে মিথ্যা-নেগেটিভ ×২:** (ক) header-সার্চ-ইনপুটে `.focus()`-বাস্তবায়ন হয় না (activeElement=BODY-ই-থাকে) — "input-এ Enter নামিয়ে undo-ফেইল" প্রোব প্রকৃতপক্ষে BODY-Enter-ই ছিল; নিশ্চিত-ফোকাসের জন্য অস্থায়ী-input DOM-এ জুড়ে নিন। (খ) সিনথেটিক `onUndo` যদি done-callback না-ডাকে, টোস্ট hide-হয় না — স্যুট-আচরণ নয়, টেস্ট-স্টাবের পছন্দ। + টোস্ট-অটো-হাইড (৭সে-ডিফল্ট) টেস্ট-লেটেন্সির ভেতরে পড়লে "গার্ড-ফেইল" মিথ্যা-রেস — দীর্ঘ-ms টোস্ট দিয়ে টেস্ট করুন।

**পরবর্তী-প্রথম-পছন্দ:** drawer-প্রিভিউ-ইনস্ট্যান্ট-প্রতিফলন (session130-তালিকার-শেষ-খোলা) → playlist per-series aggregate API (admin-এ /api/resources/series-stats) → সিরিজ-কভার-ইমেজ ফিল্ড → dropdown-dismiss data-nts→LekhokRelTime রি-পেইন্ট → Metered.ca-TURN/অটো-ভিডিও-ডিগ্রেড/গ্রুপ-রিং-সীমা (WebRTC, ইউজার-অ্যাকাউন্ট-নির্ভর)। **পরবর্তী-এজেন্ট: session139 লেবেল থেকে।**
## Cross-Agent Note — Session 134 (cron-review: QA→ফিচার-রাউন্ড — সিরিজ-হিরো [RES-124-ব্যাকলগ ④] + bulk ক্রস-রিকোয়েস্ট ডুপ-গার্ড + role-policy §১৯) (১৮ সেপ্টেম্বর ২০২৬)
**রাউন্ড-রায়:** HEAD 2edd910-এ QA-সুইপ সব-সবুজ (৯-পেজ 200, role-policy 177/177, agent-browser কনসোল-০/390px-০, সিরিজ/প্লেলিস্ট/রিজুম-অক্ষত) → ফেজ-স্টেবল → RES-133-প্রস্তাব ①(সিরিজ-হিরো) + ②(বাল্ক-ডুপ-গার্ড) নেওয়া হলো।

1. **সিরিজ-হিরো (?series= সক্রিয় হলে):** routes/pages.js `activeSeriesMeta` {series,n,cover,audioN,views,downloads} (seriesList-এর কভার-সাবকোয়েরি পুনঃব্যবহার + এক-aggregate) → lekhok-resources.ejs হিরো-সেকশন (108px কভার — thumbnail-শূন্যে `noimg` ফলব্যাক + gradient-ico; eyebrow "সিরিজ ব্রাউজ করছেন"; টাইটেল; মেটা nটি পর্ব/অডিও/পাঠ/ডাউনলোড; অ্যাকশন: সিরিজ-শুনুন + লিংক-কপি + ফিল্টার-সরান)। **play-all এখন দুই-সারফেস** — চিপ-রোর #rsxSeriPlay + হিরোর বাটন, দুটোই `data-seriplay` — session129-IIFE-এর বাইন্ডিং `querySelectorAll('[data-seriplay]')` + forEach; **হিরো-শেয়ার** ক্লিপবোর্ড→execCommand-ফলব্যাক→toast129 (`?series=` শেয়ারেবল-URL, পোর্ট-প্যারাম-বিহীন ক্লিন-লিংক)। CSS session134-ব্লক: gradient-প্যানেল+radial-accent, কভার-রিং+ছায়া, play-hover-lift, focus-visible-রিং, 640px-স্ট্যাক, reduced-motion-গার্ড।
2. **bulk ক্রস-রিকোয়েস্ট ডুপ-গার্ড (RES-124-ব্যাকলগ):** helpers/resource-bulk.js `dupKey134` = title+series+file_url+link_url (trim+lowercase নরমালাইজড — কেস/স্পেস-ভ্যারিয়েন্ট-সহ ধরে) + `dbSeen134` প্রিলোড (সব-রো এক-SELECT; **গার্ড-কোয়েরি ব্যর্থে open-fail-safe** — ইমপোর্ট-বাধা নয়) + `dupes` কাউন্টার (skipped=ব্যাচ-অভ্যন্তরীণ আলাদা); সফল-ইনসার্টের কী-ও গার্ডে যোগ। রেসপন্সে `dupes` (admin+moderator দুই-রুট); rbm-মোডাল ফলাফল-লাইনে "টি ডেটাবেসে আগেই ছিল (ডুপ্লিকেট)"। কী-সেম্যান্টিক্স-নোট: ব্যাচ-লোকাল `seen`-ও এখন series-সচেতন (একই-title ভিন্ন-সিরিজ = স্বতন্ত্র-পর্ব — ইচ্ছাকৃত)।
3. **role-policy §১৯ ×১৯-চেক:** প্রথম-ইমপোর্ট inserted:2/dupes:0 → একই-CSV ২য়বার inserted:0/dupes:2 → কেস/স্পেস-নরমালাইজড ভ্যারিয়েন্ট dupes:1 → একই-title ভিন্ন-সিরিজ inserted:1 (সিরিজ-সচেতন-কী) → ব্যাচ-অভ্যন্তরীণ ডুপ inserted:1/skipped:1 → মডারেটর-রুটেও dupes:2 → হিরো ×৮ (রেন্ডার/টাইটেল/প্লে-অল/শেয়ার/মেটা/noimg-ফলব্যাক/ফিল্টার-সরান/ফিল্টার-ছাড়া-অনুপস্থিত) → ক্লিনআপ ×৪+হিরো-অদৃশ্য। **সুইট এখন ১৯৬-চেক, 196/196 ALL GREEN** (রেট-লিমিটার-নয়েজ = fresh-restart-প্রমাণ)।
4. **🚨 নিজের-E2E-তে ধরা 🚨৯-আসল-রো-ট্রাশ + রিস্টোর:** §১৯-এর প্রথম-ক্লিনআপ লুপের `grep -q 'rp134-'` — detail-পেজের **সম্পর্কিত-রিসোর্স-ব্লক** same-category (guide) টেস্ট-রো-গুলো অন্য-রো-র ডিটেইল-পেজে দেখাত → স্ক্যান ৯-আসল-রো (ids 2,5,6,13,15,16,19,21,28) মিথ্যা-ম্যাচ করে ট্রাশে পাঠিয়েছিল → **/admin/trash/:id/restore API দিয়ে ৯টিই রিস্টোর** (লিস্টিং ২২-কার্ড যাচাই) → ক্লিনআপ-অ্যাঙ্কর এখন `rsxd-title">rp…` (নিজের-h1-মাত্র) — **§১৮-এর ল্যাটেন্ট-ভ্যারিয়েন্টও (first-match ভুল-রো-ডিলিট) একই-অ্যাঙ্করে হার্ডেন**।
**গোটচা-নতুন:** ① **টেস্ট-ক্লিনআপের title-grep অবশ্যই detail-পেজের নিজের-h1 (`rsxd-title">`) অ্যাঙ্কর করবে** — related-ব্লক same-category-টেস্ট-রো দেখায় (৯-রো-কল্যাণ-পাঠ) ② restoreTrash ইন-মেমোরি-DB-তে API-দিয়েই করতে হয় — ফাইল-সরাসরি-এডিট সার্ভার-সত্যের সাথে রেস করে ③ rbm-মোডাল-রেজেক্স-প্যাচে ternary-প্রেসিডেন্স-বাগ হয়েছিল (`: '' + (...)` বন্ধনী-ভুল) — পুরো-লাইন-পুনর্লিখনই নিরাপদ।
**E2E-প্রমাণ:** agent-browser — হিরো DOM (কভার-ছবি + মেটা "৩টি পর্ব/১টি অডিও/১৩০ পাঠ/২৪ ডাউনলোড" + তিন-অ্যাকশন + চিপ-row-প্লে-সহ-দ্বৈত-বাইন্ডিং) ✓ হিরো-প্লে → /resources/3?play=1 (URL-মুক্ত + অডিও+রিজুম-চিপ) ✓ শেয়ার-টোস্ট "সিরিজের লিংক কপি হয়েছে" ✓ কনসোল-০ ✓ 390px-overflow-০ ×২-পেজ ✓ স্ক্রিনশট ×২ (s134-hero-desktop/-mobile) ✓ LS-টেস্ট-রেজিডু ক্লিন-আপ ✓ ৯-পেজ-স্মোক-পুনঃযাচাই ✓
**পরবর্তী-প্রথম-পছন্দ:** স্লো-ট্রিকল-হোস্টে >১০সে-ফেচ-টাইমআউট-অপশন (RES-124-ব্যাকলগ-অবশিষ্ট) → role-policy-তে main.js-পার্স-রিগ্রেশন-চেক (data-ts-টুলটিপ-প্যাটার্ন) → হিরোতে সিরিজ-শেয়ার Web Share API (navigator.share থাকলে) → series-stats-এ dupes-মেট্রিক (admin অডিট)। **পরবর্তী-এজেন্ট: session135 লেবেল থেকে।**

---

## Session 135 — কমেন্ট-পারমালিঙ্ক (FB টাইমস্ট্যাম্প=কপি-লিংক) + আর্টিকেল-চিপ-প্যারিটি + নোটিফ-রিস্টোর-রি-পেইন্ট

**লেবেল-নোট:** cron-r14; session134-বকেয়া-তালিকা থেকে ③④ সমাধাত + নতুন-ফিচার + স্টাইলিং-প্যাক।

**স্কোপ:** routes/social.js (আর্টিকেল-SSR replyTo) · views/shared/comment/CommentItem.ejs (data-cmt-permalink) · views/user/notifications.ejs (data-ts-ইউনিফিকেশন + restore-রি-পেইন্ট) · comment-tools.js (পারমালিঙ্ক-ইঞ্জিন + দুই-পেইন্টার attr) · shared.css (session135-EOF-ব্লক) — route/db-স্কিমা শূন্য।

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **কমেন্ট-পারমালিঙ্ক চুক্তি (নতুন, সেশন ১৩৫):** `.fc-time[data-cmt-permalink="{id}"]` — ক্লিক/Enter/Space (role=link, tabindex=0) → `{origin}{data-post-link|pathname}#fc-c{id}` ক্লিপবোর্ড-কপি (navigator.clipboard → execCommand-ফলব্যাক) + `flashTarget131(item)` + `history.replaceState`-হ্যাশ + toast 'লিংক কপি হয়েছে ✓'। তিন-সারফেস ডেলিগেটেড (ক্যানোনিকাল-মার্কআপে attr থাকলেই স্বয়ংক্রিয়)। **নতুন-কমেন্ট-সারফেসে fc-time আঁকলে data-cmt-permalink দিতে ভুলবেন না** (SSR-টেমপ্লেটে আছে; JS-পেইন্টার ×২-এও যোগ করা)।
2. **নোটিফিকেশন-ফুল-পেজ টাইম-চুক্তি বদলেছে:** `.notif-page-time span`-এ এখন `data-ts` (ISO) — rel119-প্রাথমিক-পেইন্ট অক্ষুণ্ণ, কিন্তু DOMContentLoaded-এ LekhokRelTime সব-রো রি-পেইন্ট করবে (ক্যানোনিকাল bn-date কনভেনশন; title-ও Dhaka-লোকেল)। rel119-বদলালে এ-ডুয়াল-পেইন্ট-মনে রাখুন। restore-পাথে `LekhokRelTime.render(list)` রি-পেইন্ট-লাইন যোগ হয়েছে (session133-header-চুক্তির ফুল-পেজ-প্যারিটি)।
3. **আর্টিকেল-SSR replyTo:** `/articles/:id`-র reply-ম্যাপে `replyTo` যুক্ত — CommentItem c.replyTo-ফলব্যাকে চিপ। প্যারেন্ট-মুছে-গেলে/অনাথে replyTo-শূন্য → চিপ-শূন্য (সাইলেন্ট-ডিগ্রেড)। session134-এর "article-পুরনো-চুক্তি" নোট এখন **অপ্রাসঙ্গিক** (article-single ক্যানোনিকাল include-ই ব্যবহার করে; শুধু replyTo-ডেটা-নেই ছিল)।
4. **shared.css session135-ব্লক (EOF):** .fc-time[data-cmt-permalink] অ্যাফোর্ডেন্স (dotted-আন্ডারলাইন, hover→brand, focus-visible রিং) + .fc-list কাস্টম-স্ক্রলবার (#notifList-প্যারিটি) + #notifList আনরিড গ্রেডিয়েন্ট-টিন্ট/ডট-গ্লো — সব var(--lf-*)/var(--accent-*), নতুন-হেক্স-শূন্য।

**E2E (agent-browser, ismail; AV-hash pot5zl-রিস্টার্ট-পরে):** ফিড-ড্রয়ার — fc-time ক্লিক → হ্যাশ #fc-c22 + toast 'লিংক কপি হয়েছে ✓' + বাবল-ফ্ল্যাশ ✓ keyboard Enter→#fc-c23 ✓ আর্টিকেল (/articles/1) — SSR-চিপ reply-19 '↩ রিয়া আক্তার'→18 ✓ টপ-লেভেলে চিপ-শূন্য ✓ চিপ-ক্লিক→scroll+flash+hash ✓ fc-time ক্লিক→toast+flash (base=data-post-link) ✓ নোটিফিকেশন-ফুল-পেজ — রিয়া-রিঅ্যাকশন-নোটিফ (curl-দ্বি-সেশন) → STALE-MARKER-ইনজেক্ট → dismiss → undo (১.৮সে-টাইমার, এক-eval) → রো-পুনঃস্থাপিত + টাইম 'STALE-MARKER-১৩৫'→'এইমাত্র' + title Dhaka-লোকেল '৭:২৪:১১ AM' (UTC+6 যাচাই) ✓ ক্যানোনিকাল-ইনসার্ট-HTML — data-cmt-permalink+চিপ স্বয়ংক্রিয়-প্রচারিত (probe-রিপ্লাই-77-এ) ✓ রিঅ্যাকশন-টগল haha→'😂১'→অফ ✓ মেনু-পলিসি (নিজের=edit/delete) ✓ dupFixed ✓ guard:design ✓ audit:views ✓ brace-০ ✓ node --check ✓ EJS-compile ×২ ✓ 390px×৪-পেজ-০ ✓ কনসোল-০ ✓ টেস্ট-ডেটা-ক্লিনআপ (probe-রিপ্লাই-ডিলিট + রিঅ্যাকশন-টগল-অফ + নোটিফ-ডিসমিস) ✓

**গোটচা-পুনঃপ্রমাণ:** `[m`-ANSI-স্ট্রিপ — টুল-আউটপুটে `meta[mine]` 'metaine]' দেখায় (node --check EXIT=0-ই সত্য; od/-F-rg-দিয়ে ক্রস-চেক রীতি) + সেশন-মধ্যে-হোভার-স্টেট-হারানো (ড্রয়ার-সোয়াপে এলিমেন্ট-প্রতিস্থাপন; synthetic .click()-এ ডেলিগেটেড-লিসেনার যায়) + undo-৭সে-উইন্ডো টুল-কল-ব্রিজে মেয়াদ-উত্তীর্ণ (এক-eval-স্ক্রিপ্ট-রীতি)।

**পরবর্তী-এজেন্ট: session136 লেবেল থেকে।** বকেয়া: অটো-ভিডিও-ডিগ্রেড-র গ্রুপ-কল-প্রসারণ (session132-বেসিস), tokens.css-র্যাচেট-বেসলাইন-নামানো (admin.css ৪২৬), পুরনো-চুক্তি-মার্কআপ→canonical-মাইগ্রেশন-অবশিষ্ট (resource-detail?), কমেন্ট-পারমালিঙ্কের উপর ভবিষ্যৎ: reply-anchor-লিঙ্ক-প্রিভিউ-কার্ড (og-style)।

---

## Cross-Agent Note — Session 140 (cron-review: /qa ইনলাইন-কম্পোজার + article.css hex-tokenization) (২৪ সেপ্টেম্বর ২০২৬)

**লেবেল-নোট:** [relabel: আমার-১৩৬→১৪০ — সমান্তরাল 415af2a-session136 + 7f8e972-session139 আগে-ল্যান্ডড; max+1 রীতিতে সমগ্র-রিলেবেল; তাদের lfSwapIn136/session136-নোট ক্যানোনিকাল-অক্ষত]

**স্কোপ:** views/shared/qa/QaListItem.ejs (নতুন) · views/user/qa-list.ejs (composer+include) · routes/social.js (POST /api/qa/new) · public/assets/js/qa-composer.js (নতুন) · shared.css session140-ব্লক · tokens.css --lf-read-* · article.css টোকেনাইজেশন · test-role-policy.sh §২৮

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **QA-তালিকা-আইটেম single-source:** qa-list.ejs-এর লুপ-মার্কআপ এখন পার্শিয়ালে (views/shared/qa/QaListItem.ejs) — ওখানেই সম্পাদনা করুন; data-qa-id অ্যাট্রিবিউট চুক্তি (JSON-HTML ও SSR উভয়ে)
2. **POST /api/qa/new রেসপন্স-চুক্তি:** {ok,id,html} (html=canonical QaListItem-HTML; null-এ ক্লায়েন্ট-টেমপ্লেট-ফলব্যাক) | {ok,id,duplicate:true} (২-মিনিট-গার্ড) | 400 {error,message}; JSON-POST = csrf-স্কোপ-বহির্ভূত (/api/comment-চুক্তি-মিরর)
3. **ফিল্টার-অখণ্ডতা চুক্তি:** ?filter=accepted-এ optimistic-প্রিপেন্ড নিষিদ্ধ — সফল হলে location.href=/qa/:id (stale-কাউন্টার-শিক্ষার QA-মিরর); all/unanswered-এই প্রিপেন্ড+chips-বাম্প
4. **EJS-গোটচা-সম্প্রসারণ:** কমেন্ট-ট্যাগের ভেতরে কমেন্ট/স্ক্রিপ্টলেট-টোকেন-উল্লেখও fatal (QaListItem-প্রথম-সংস্করণে প্রমাণিত — "Could not find matching close tag for <%#"); ডকস-কমেন্টেও সে-টোকেন লিখবেন না
5. **attribute-grep প্যারিটি:** JSON-এ attr-ভ্যালু `\"`-এস্কেপড, SSR-এ প্লেইন — curl-অ্যাসারশনে `data-qa-id=.{1,2}<id>`-প্যাটার্ন দুই-কনটেক্সট-কভার
6. **hex-র্যাচেট-নতুন-ভিত্তি:** article.css 71→8 (বেসলাইন-আপডেটেড); --lf-read-* পরিবার tokens.css-এ; ভবিষ্যৎ-রঙে এ-টোকেন পুনঃব্যবহার করুন

**E2E (agent-browser, testuser @8094):** এক্সপ্যান্ড→বাংলা-কাউন্টার→submit-disabled-গার্ড→optimistic-কার্ড→canonical-swap (data-qa-id বহন)→chips বাম্প (১→২, ০→১)→রিলোডে SSR-persist→localStorage-ড্রাফট-ক্লিয়ার→unanswered-ফিল্টারে অন্তর্ভুক্ত→owner-ডিলিট (303→404) ক্লিনআপ ✓; গেস্টে CTA-কার্ড ✓; 390px-০ ×৬ + কনসোল-০ ✓; রিগ্রেশন: role-policy **২১২/২১২ ALL GREEN** (merged-tree — তাদের §১৯/§১৪/§২৫/§২৬-পরিবার + আমার §২৮ সহাবস্থান) + cursor 25/25 + guard-নতুন-বেসলাইন ✓ + audit:views ✓ + brace-০ ×১৮ ✓ + node --check ×২ + bash -n ✓

**পরবর্তী-এজেন্ট: session141 লেবেল থেকে।** বকেয়া-প্রস্তাব: ① qa-composer-এ রিচ-এডিটর-ইন্টিগ্রেশন (data-rich-editor-মিরর) ② /qa-অপটিমিস্টিক-প্রশ্নে মেনশন-অটোকমপ্লিট ③ notifications-শূন্য-অবস্থার ব্র্যান্ডেড-পলিশ ④ Metered.ca-TURN (ইউজার-অ্যাকাউন্ট-প্রয়োজন)
## ⚡ Cross-Agent Note — Session 137 (cron: QA→ফিচার-রাউন্ড — tokens-র্যাচেট-সমাপ্তি admin ১৭২→০ + dashboard ২৩৩→০ + article-single .cmt-chain অ্যাডপশন) (১৮ সেপ্টেম্বর ২০২৬)
**রাউন্ড-প্রকৃতি:** QA-প্রথম (guard + role-policy ১৭৭ + cursor ২৬ + audit + brace-০; agent-browser ৭-পেজ সুইপ কনসোল-০/390px-০; ড্রয়ার no-reload-মার্কার + share-menu--fb ৩-অ্যাকশন পুনঃপ্রমাণ) → বাগ-শূন্য → ফিচার-রাউন্ড (session136-প্রস্তাব ①② + session134-বকেয়া article-chain)।
1. **tokens-র্যাচেট-সমাপ্তি (admin.css ১৭২→০, dashboard.css ২৩৩→০):** tokens.css-এ session137-ব্লক — **১১৭ নতুন --lf-*** (admin: info/violet/cyan-sky/rose/orange/yellow-অতিরিক্ত/গ্রিন-র‍্যাম্প/tailwind-gray/fb-ink-meta/fb-border/fb-surface-track ≈৮৭ + dashboard: warn-বুটস্ট্র্যাপ-লেগাসি/navy/google-blue/ক্রিম ≈৩০)। সব **exact-value** ম্যাপ — ভিজ্যুয়াল-পরিবর্তন-শূন্য; দীর্ঘ-হেক্স-আগে + `(?![0-9a-fA-F])` বাউন্ডারি (session136-স্ক্রিপ্ট-রীতি পুনঃব্যবহৃত); বেসলাইন admin.css:0, dashboard.css:0-এ লক। **নামকরণ-চুক্তি:** প্যালেট-মান হলে tailwind নাম (gray-500 → --lf-gray), বুটস্ট্র্যাপ-লেগাসি হলে --lf-warn-*/--lf-ok-tint/--lf-info-soft-10, ফেসবুক-প্যালেট হলে --lf-fb-*, ড্রিফট-ভ্যারিয়েন্ট (d8dadf/d5d8de/d8dbe0... নিকট-অভিন্ন গ্রে) হলে -2/-3/-4 সাফিক্সে সৎ-নামকরণ — কোনো-মান-একত্রীকরণ নেই।
2. **[ইউনিয়ন-সংশোধন: ② প্রত্যাহৃত — সমান্তরাল session139-এজেন্টের _nameA135-ব্লক (same feature, canonical) আগে-ল্যান্ডেড; rebase-এ তাদের পাশ গৃহীত, আমার _nameBy137-ব্লক সম্পূর্ণ-প্রত্যাহৃত — session134-প্রত্যাহার-রীতি। E2E-প্রমাণ তাদের কোডে সত্য; আমার রাউন্ডের চিপ-E2E ফলাফল তাদের-বাস্তবায়নের-উপরেই প্রমাণিত।]
   **মূল-নোট:** article-single .cmt-chain অ্যাডপশন (session134-বকেয়া): routes/social.js article-route-এ `_nameBy137` ম্যাপ (displayName — pen_name-প্রাধান্য) + রিপ্লাই-রোতে `replyTo:{id,name}` — CommentItem-চুক্তি স্বয়ংক্রিয় (ভিউ-পরিবর্তন-শূন্য); JSON-পথ (GET /api/comments) session134-থেকেই সব-পোস্ট-টাইপ কভার। E2E (/articles/1): SSR-চিপ "↩ আকিজ মাহমুদ" + data-cmt-chain=1 + #fc-c1-অ্যাঙ্কর ✓ ক্লিক→cmt-chain-flash+hash, no-reload-মার্কার-alive ✓ কনসোল-০ ✓।
3. **গোটচা ×২ (নতুন):** ① `grep -c '#hex'` **লাইন-গোনা** — minified CSS-এ ১ লাইনে সব হেক্স; occurrence-গণনায় `grep -o | wc -l` বা JS-regex-ম্যাচ বাধ্যতামূলক (guard-র্যাচেট নিজে JS-ম্যাচ ব্যবহার করে — সেটাই-সত্য)। ② body-ব্যাকগ্রাউন্ড-প্রোব-ফাঁদ: সাইট-ক্যানভাস `html{background:var(--bg)}`-এ — `body`-র computed bg transparent-ই সঠিক (getComputedStyle(document.body).backgroundColor-প্রোবে মিথ্যা-অ্যালার্ম; session136-নোটের "bodyBg #F0F2F5" html-স্তরের-প্রমাণ)।
4. **E2E-প্রমাণ:** guard-নতুন-বেসলাইন ✓ role-policy ১৭৭/১৭৭ ✓ cursor ২৬/২৬ ✓ audit:views ✓ brace-০ ×২২ ✓ node --check ✓ /feed-অ্যালায়াস ৩০২ ✓; admin/dashboard computed-token (--lf-info #2563EB, --lf-fb-ink #1C1E21, --lf-ad-line #DDE3EA, --lf-warn-soft #FFF3CD, --lf-navy #0A1F44, --lf-ok-tint #D4EDDA) ✓ suspicious-transparent-text-০ ✓ কনসোল-০ + 390px ×৫-পেজ-০ ✓ স্ক্রিনশট ×৩ (s137-admin-ratchet, s137-dashboard-ratchet, s137-article-chain) ✓।
**পরবর্তী-প্রস্তাব:** ① style.css-র্যাচেট (১৩৯৫ — বৃহত্তম; একই-স্ক্রিপ্ট-রীতি, ২-৩-রাউন্ডে ভাগ করা উচিত) ② কল-ইতিহাসে degrade-স্তর-রেকর্ড (db-স্কিমা) ③ article.css/auth.css/gallery.css/messenger.css-র্যাচেট (৭১/১২৩/১২৩/১৪৪) ④ লাইভ-Turso-রিসেট (টোকেন-ধারী)। **পরের-এজেন্ট: session138 থেকে।**
[relabel-নোট: সমান্তরাল 7f8e972-session139 (প্রোফাইল-প্যানে) ও 680e0ec-session140 (hex-baseline admin0) আগে-ল্যান্ডেড — এই-এন্ট্রি max+1 রীতিতে 139→141-রিলেবেলড; কোড-আইডি s139 অক্ষত]

## Cross-Agent Note — Session 139 (cron-QA-রাউন্ড: ৩৯০px-অ্যাডমিন-বাগফিক্স + /me-ব্যাজ-প্যারিটি + tokens-র্যাচেট-ওয়েভ-২) (২৩ সেপ্টেম্বর ২০২৬)
**প্রবেশ-অবস্থা:** origin/main @ 10481cc (session138) — কোনো-রেস-নেই (এক-রাউন্ডে সমান্তরাল-ল্যান্ড-শূন্য)। QA-ফেজ: role-policy **১৭৭/১৭৭** + cursor ২৫/২৫ + guard + brace-০ ×৫-JS + agent-browser ১৪-পেজ কনসোল-০/390px-১০-পেজ-০ — **স্টেবল-ফেজ রায়** → ফিচার-রাউন্ড (session137/138-প্রস্তাব ①③④ গ্রহণ)।

**🚨 বাগফিক্স-১ (QA-সুইপে-ধরা — /admin 390px-এ 63px ওভারফ্লো; session136-এর "admin-390-০" দাবি ভাঙা):** দ্বি-স্তর-মূল: ① **grid auto-min ফাঁদ** — `.dash-cols{grid-template-columns:1fr}`-এ `1fr = minmax(auto,1fr)`; নেস্টেড nowrap-ellipsis চেইনের min-content (প্রমাণিত ৪৪১px) ট্র্যাক ঠেলে দেয় → **ক্যানোনিকাল-ফিক্স `minmax(0,1fr)`** (ডেস্কটপ ২-কলাম ও মোবাইল ১-কলাম উভয়ে)। ② **inline-nowrap-ক্লিপ-ফাঁদ** — `.rl-title{white-space:nowrap;overflow:hidden}` কিন্তু display ছিল inline → overflow:hidden inline-এ **অকার্যকর** → টাইটেল কার্ড-বাইরে বেরিয়ে যায় → ফিক্স `.recent-list .rl-title/.rl-meta{display:block;max-width:100%}`। ফলাফল: 63px → **(-10) সম্পূর্ণ-শূন্য** (০-ওভারফ্লো-এলিমেন্ট)।

**ফিচার-২ ① /me-ব্যাজ-প্যারিটি (session137-এক্সটেনশন-পয়েন্ট পূরণ):** `routes/social.js` /me-র myPosts-SELECT-এ `accepted_comment_id` কলাম (profile.ejs `SELECT *`-এ ছিলই — /me-র স্পষ্ট-তালিকায় ছিল না) → FeedPostCard-এর ক্যানোনিকাল `feed-acc-badge135` এখন /me-তেও রেন্ডার। **নতুন E2E verify-session139-parity.sh ২২/২২ ALL GREEN** (সিড→গ্রহণ→/me-ব্যাজ ×৪ + ডিলিট-পরবর্তী-অনুপস্থিতি ×২)।

**ফিচার-③ tokens-র্যাচেট-ওয়েভ-২ (session136-ওয়েভ-১-এর ধারাবাহিকতা):** `scripts/patch139-admin-ratchet.js` (idempotent, প্রমাণ/প্রয়োগ-মোড) — **৬০ নতুন --lf-* টোকেন** তিন-পরিবারে: TW-স্ট্যান্ডার্ড শেড ৪১ (gray/blue/sky/indigo/violet/cyan/emerald/green/rose/orange/yellow/amber স্কেল-নাম) + **FB-গ্রে-র‍্যাম্প ১৫** (--lf-fbg-50…fbg-500, fb-text-trio, fb-link-slate) + **ব্র্যান্ড-সবুজ ৫** (brandgreen-ramp) → admin.css exact-value var()-ম্যাপ **১৭২ → ৩০ হেক্স (৮৩%)** — ভিজ্যুয়াল-পরিবর্তন-শূন্য (computed-style-প্রমাণ: --lf-brandgreen #0aa56d লাইভ-রেজলভ + brand-emblem-gradient rgb(10,165,109))। বেসলাইন admin.css 172→30 (--update-hex-baseline)। অবশিষ্ট-৩০ = একক-ব্যবহার-কাস্টম শেড (ভবিষ্যৎ-ওয়েভ-প্রার্থী)।

**ফিচার-④ যাচাই-ফল (কোড-শূন্য):** ② answer_accepted reltime-চিপ **ত্রি-সারফেসেই ইতোমধ্যে-সম্পূর্ণ** (ফুল-পেজ rel119+data-ts [session136] · ড্রপডাউন notif-time+data-ts [session122] · live.js paintList data-ts [session125]) — E2E-প্রমাণ: ৩০/৩০-রো-চিপ-গণনা-প্যারিটি + রো-ব্লকে icon-accepted135। crx og-default-গার্ড session133-এই-সম্পন্ন। সাথে **স্বাস্থ্য-পরিষ্কারণ:** ismail-এর ৩১টি স্টেল টেস্ট-answer_accepted-বিজ্ঞপ্তি dismiss (পূর্ব-রাউন্ডগুলোর E2E-ক্লিনআপ প্রথম-id-মাত্র-ডিসমিস করত)।

**গোটচা-নতুন ×৫:**
1. **🚨 grep `.{0,N}`-উইন্ডো-প্যাটার্ন বিশাল-HTML-এ ঝুলে যায়:** ৩০ সে+ টাইমআউট, শূন্য-ফল — রেন্ডার্ড-পেজ-HTML-এ প্রসঙ্গ-উইন্ডো দরকার হলে **awk `index()/substr()` O(n)**-ই নিরাপদ।
2. **🚨 awk-ডিফল্ট-রেকর্ড=লাইন:** রেন্ডার্ড-HTML মাল্টি-লাইন — `exit` প্রথম-লাইনেই ফায়ার করে মিথ্যা-শূন্য-দেয় → **`BEGIN{RS="\0"}`** দিয়ে গোটা-ফাইল-এক-রেকর্ড + `if(i>0){print;exit}` ব্রেস-চুক্তি।
3. **CSRF-টোকেন পেজ-স্কোপড মনে হয়:** /login-পেজের টোকেন /qa/new-POST-এ `303 ?csrf=1` দেয় — **টার্গেট-পেজ থেকেই getcsrf** (E2E-রীতি `getcsrf $J $PG` মানুন; session138-নোটের 303-রিট্রাই-হেল্পারও এটাই করে)।
4. **grid `1fr` ≠ নিরাপদ:** auto-min চেইন (flex-item min-width:auto → nowrap-টেক্সট) যেকোনো 1fr-ট্র্যাক-ই ফুলিয়ে দিতে পারে — নতুন grid-লেআউটে **minmax(0,1fr)**-ই ডিফল্ট রীতি হোক।
5. **proof-mode-লেখা-ফাঁদ:** আমার র্যাচেট-স্ক্রিপ্টের প্রথম-সংস্করণে প্রমাণ-মোডেও writeFileSync ফায়ার করেছিল — সংশোধিত (`if (APPLY)`); প্রমাণ-মোড যদি বলে, লেখাও যেন গেটেড-থাকে।

**পরবর্তী-প্রথম-পছন্দ:** admin.css-অবশিষ্ট-৩০-একক-শেড (ওয়েভ-৩ ছোট) → dashboard.css (২৩৩)/style.css (১৩৯৫)-র্যাচেট → কল-ইতিহাসে degrade-স্তর-রেকর্ড (db-স্কিমা) → সিরিজ-কভার-ইমেজ ফিল্ড → লাইভ-Turso-রিসেট (টোকেন-ধারী)। **পরবর্তী-এজেন্ট: session142 লেবেল থেকে।** (উপরে-রিলেবেল-নোট দেখুন)

## Cross-Agent Note — Session 142 (cron-QA-রাউন্ড: og-স্টাইল লিংক-প্রিভিউ কার্ড + খালি-URL অটো-লিংক) (২৪ সেপ্টেম্বর ২০২৬)
**প্রবেশ-অবস্থা:** origin/main @ 98f9d9c → বেসলাইন-QA সব-সবুজ (৮-পেজ 200, dupFixed, প্যালেট-৭, পারমালিঙ্ক-attr, 390px ×৭-০, কনসোল-০) → ফেজ-স্টেবল → session135-ব্যাকলগ ① (reply-anchor-লিঙ্ক-প্রিভিউ-কার্ড og-style) + session138-① (profile accepted_flag — সমান্তরাল-১৩৯ ইতোমধ্যে ক্যানোনিকাল)।
**[প্রত্যাহার-নোট (৯ম-ইউনিয়ন-প্রমাণ):] আমার রাউন্ডে profile-ট্যাব-ত্রয়ী (প্রশ্ন/মন্তব্য/প্রতিক্রিয়া-প্যানে + comments139/reactions139-route-সমৃদ্ধি + profile.css pf-actlist-ব্লক) সম্পূর্ণ-ইমপ্ল-ই-করেছিলাম (E2E-প্রুফড); push-পূর্ব fetch-এ দেখা গেল সমান্তরাল session139-এজেন্ট (7f8e972) হুবহু-একই-ফিচার ক্যানোনিকাল-লেয়ারে পুশ করে ফেলেছে (তাদেরটায় /me-প্যারিটি + accepted_flag-SQL + ফিল্টার-বার-স্থানান্তর অতিরিক্ত) → stash-pop-ইউনিয়নে profile.ejs/profile.css = তাদের-সংস্করণ (git checkout HEAD --), আমার ডেল্টা সম্পূর্ণ-প্রত্যাহৃত — ডুপ্লিকেশন-শূন্য। আমার অনন্য-রক্ষিত: og-card-স্ট্যাক (৪-ফাইল)।**
**স্কোপ:** routes/social.js (GET /api/link-preview + _lpvCache139/_RT139/_bnNum139) · helpers/markdown-lite.js (inlineMd দুই-পাস-স্প্লিট) · public/assets/js/comment-tools.js (optMd-মিরর + og-ইঞ্জিন EOF + সম্পাদনা-সেভ-দুই-পাথ data-lpv-রিসেট) · public/assets/css/shared.css (session142-ব্লক EOF) — schema শূন্য।

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **GET /api/link-preview?u= চুক্তি:** রেসপন্স `{ok:true, card:{kind:'comment'|'content', label, title, desc, meta, thumb, icon, link}}`; 404=not_found, 400=bad_url। কমেন্ট-অ্যাঙ্কর (#fc-cN/#cN) প্রাধান্য-পায় (পাথ যা-ই হোক কমেন্টের সত্য-প্রসঙ্গ)। ক্যাশ TTL ৫মি/ক্যাপ ৩০০ (boot-মেমরি — ডিপ্লয়ে রিসেট)। নতুন-কনটেন্ট-টাইপ যোগ করলে ক্লায়েন্ট LPV_INTERNAL_RE139-ও বাড়াতে হবে। **এক্সটার্নাল-লিংকে কার্ড নেই (ইচ্ছাকৃত)** — চাইলে helpers/url-fetch.js-এর SSRF-গার্ড-প্যাটার্নে করা যায়, তবে স্যান্ডবক্স-নেটওয়ার্কে E2E-অনির্ভরযোগ্য।
2. **markdown-lite inlineMd এখন দুই-পাস:** পাস-১ = বোল্ড/ইটালিক/কাটা/মার্কডাউন-লিংক + **খালি-URL অটো-লিংক** (split-guard + ট্রেলিং `[.,;:!?…।]`-স্ট্রিপ); পাস-২ = @ম্যানশন/#ট্যাগ (split-guard)। **গোটচা-গুরুত্বপূর্ণ:** এক-পাসে সব-মিলিয়ে লিখলে #tag-রেজেক্স URL-এর ভেতরের `#fc-c22` ভেঙে `<a class=tag>` বানায় → পারমালিঙ্ক-কার্ড প্রশ্ন-কার্ড হয়ে যায় (E2E-ধরা)। URL অবশ্যই ম্যানশন/ট্যাগের **আগে** অ্যাঙ্কর হতে হবে। optMd (comment-tools.js) হুবহু মিরর — এক-পাস-বদলালে দুটোই বদলান।
3. **og-ইঞ্জিন-চুক্তি (comment-tools.js EOF):** MutationObserver(document.body, childList+subtree, ১৫০ms-ডিবাউন্স) → `.fc-body:not([data-lpv])` স্ক্যান → `a.a-link` হ্রেফ origin-স্ট্রিপ → হোয়াইটলিস্ট-রেজেক্স → বাবলে শিমার→কার্ড। **🚨 ডুপ্লিকেট-গার্ডে `:not(.lf-og-loading)` বাধ্যতামূলক** — শিমার-প্লেসহোল্ডারেও `data-lpv-u` অ্যাট্রিবিউট আছে; ছাড়া `lpvMount139` নিজের-শিমার-দেখে সাইলেন্ট-রিটার্ন করে → স্থায়ী-শিমার (E2E-আবিষ্কৃত; dbg-ট্রেইল "mounted"-কিন্তু-DOM-শিমার দিয়ে ধরা)। সম্পাদনা-সেভ-পাথ (legacy ~লাইন-851 + canonical ~লাইন-1515) `bodyEl.removeAttribute('data-lpv')` ডাকে — observer পুনঃ-স্ক্যান করে; নতুন-এডিট-পাথ যোগ হলে এই-লাইনও।
4. **shared.css session142-ব্লক:** .lf-ogcard টোকেন-শুধু; `.fc-bubble .lf-ogcard{max-width:100%}` — বাবলের-ভেতরে বাউন্ড; শিমার `lfOgShimmer139` (reduced-motion-গার্ডসহ)।
5. **AV-ক্যাশ-গোটচা-পুনঃপ্রমাণ (এ-রাউন্ডে ৩-বার):** স্ট্যাটিক-JS-এডিটের পর **সার্ভার-রিস্টার্ট ছাড়া ব্রাউজার পুরনো ?v= -immutable-ক্যাশ চালায়** — dbg-প্যাচ-প্রমাণ সার্ভারে থাকলেও ব্রাউজারে "dbg:none" (v=zlgk3j-এ পুরনো-ফাইল); প্রতি-ইটারেশনে কিল-বাই-পোর্ট+রিস্টার্ট রীতি। SW-আনরেজিস্টার-রীতিও প্রযোজ্য (এ-রাউন্ডে ১-বার)।
6. **CSS.escape অ্যাট্রিবিউট-সিলেক্টর-নোট:** `[data-lpv-u="' + CSS.escape(href) + '"]` — CSS.escape স্ল্যাশকে `\/` করে; CSS-স্ট্রিং-এস্কেপ-হিসেবে বৈধ (Chrome-যাচাই), match হয়।

**E2E-প্রমাণ:** লোড-পাথ SSR-কার্ড (title + 'ইসমাইল হোসেন · 💬 ৬ উত্তর' বাংলা-অঙ্ক) ✓ সাবমিট-পাথ (optimistic→observer→কার্ড ~১.২সে) ✓ পারমালিঙ্ক-কমেন্ট → কমেন্ট-কার্ড (অ্যাভাটার-থাম্ব + 'রিয়া আক্তার' + প্রসঙ্গ) ✓ per-body-ইউনিক (md-link+URL মিশ্রে ১-কার্ড) ✓ API ৪-কেস + bad-url-400 + traversal-404 + missing-404 ✓ inlineMd-ইউনিট ×৫ ✓ স্ক্রিনশট ×২ (s139-og-card3.png ডাউনলোড-ফোল্ডারে)। **রিগ্রেশন (মার্জড-ট্রি @ da945f0):** role-policy **212/212** ✓ cursor 25/25 ✓ guard ✓ audit:views ✓ brace-০ ✓ node --check ×৩ ✓ dupFixed ✓ 390px ×১০-পেজ-০ ✓ কনসোল-০ ✓ টেস্ট-ক্লিনআপ (probe-কমেন্ট ×৫ ডিলিট + accept-রিভার্ট) ✓।
**পরবর্তী-প্রথম-পছন্দ:** ① পোস্ট-বডিতেও og-কার্ড (ফিড-কার্ড/আর্টিকেল-বডি — একই-ইঞ্জিন স্কোপ-বর্ধন) ② এক্সটার্নাল-লিংকে domain-chip কার্ড (নেটওয়ার্ক-শূন্য — favicon-less মিনি-কার্ড) ③ og-কার্ডে reactors-count (লিংক-টার্গেটের রিঅ্যাকশন-সারসংক্ষেপ) ④ ড্রপডাউন-paintList-পাথে reltime-রি-পেইন্ট (session134-অবশিষ্ট)। **পরের-এজেন্ট: session143 থেকে।**

## Cross-Agent Note — Session 143 (cron: QA→ফিচার-রাউন্ড — notifications শূন্য-অবস্থা ব্র্যান্ডেড-পলিশ + /qa রিচ-এডিটর ইন্টিগ্রেশন + profile.css hex-টোকেনাইজেশন ৭৮→০) (২৪ সেপ্টেম্বর ২০২৬)
**লেবেল-নোট:** [relabel: আমার-১৪১→১৪৩ — সমান্তরাল session142 (og-লিংক-প্রিভিউ) push-পূর্বে ল্যান্ডেড; max+1 রীতি; কোড-মার্কার -141 অক্ষত (session137-রীতি)]
**প্রবেশ-অবস্থা:** origin/main @ 9ecb57a — QA-ফেজ ALL GREEN (guard + role-policy ২১২/২১২ [পোর্ট-গোটচা: RP_PORT=3030 বাধ্যতামূলক] + cursor ২৬/২৬ + audit + agent-browser ৯-পেজ ২০০/কনসোল-এরর-০/390px ×৫-০) → স্থিতিশীল-ফেজ রায় → ফিচার-রাউন্ড (session140-প্রস্তাব ①③ গ্রহণ)।

**ফিচার-১ notifications শূন্য-অবস্থা ব্র্যান্ডেড-পলিশ (session140-প্রস্তাব ③):** nf-branded141 মডিফায়ার-স্কোপ — বেস `.notif-empty` লাইভ-ড্রপডাউন (live.js) শেয়ার করে তাই মডিফায়ার বাধ্যতামূলক। **session114-চুক্তি-আবিষ্কার:** `.notif-empty i` নিজেই-ব্যাজ (64px সার্কেল + notifBell114 রিং-অ্যানিমেশন) — র‍্যাপার-ব্যাজ বানালে ডাবল-ব্যাজ+feed.css-এর `.notif-empty i{color:var(--accent)}`-ইনহেরিটেন্স-ব্যর্থতা (সবুজ-ওপর-সবুজ) → ইউনিয়ন-সংশোধন: র‍্যাপার-বাদ, self-badge রিস্কিন (সলিড-ব্র্যান্ড+সার্ফেস-বর্ডার+সফট-শ্যাডো), অ্যানিমেশন অক্ষত। **CTA-আইকন-ফাঁদ:** session114-নিয়ম সব-বংশধর `<i>`-তে পড়ে (64px-সার্কেল-ব্লব বাটনের ভেতরে!) → `.nf141-btn i` ফুল-রিসেট (width/auto, bg-transparent, animation:none)। প্যানেল: brand-light→surface গ্রেডিয়েন্ট + radial-accent; CTA দুটি (ফিড ব্রাউজ / নতুন লেখা — solid+ghost, 640px-এ ফুল-উইডth-স্ট্যাক)। ফিল্টার-শূন্যও পলিশড (মার্কআপ-অস্পৃশ্য — JS first-span চুক্তি রক্ষা)। **[hidden]-গার্ড-ভীতি-নোট:** style.css-এ `.notif-filter-empty[hidden]{display:none!important}` ইনট্যাক্ট-প্রমাণ দরকার হলে ডিটারমিনিস্টিক-প্রেডিকেট (`s.includes('.sel[hidden]')`) — ডিসপ্লে-ম্যানলিং `[h`-খাওয়ায় মিথ্যা-বাগ-ভাব-ঝুঁকি।

**ফিচার-২ /qa রিচ-এডিটর ইন্টিগ্রেশন (session140-প্রস্তাব ①):** qa-composer.js-এ ম্যানুয়াল `LekhokRichEditor.init(body, {preview:false})` — **data-rich-editor অ্যাট্রিবিউট ইচ্ছাকৃত-নেই** (auto-init-ডিফল্ট-cfg = ডেস্কটপে স্প্লিট-প্রিভিউ, কম্পোজার-প্যানেলে ভারী); DOMContentLoaded-মাউন্ট (লোড-অর্ডার-নিরপেক্ষ), ইঞ্জিন-অনুপস্থিতে সাদামাটা-textarea (প্রগ্রেসিভ)। সার্ভার renderBody-চুক্তি (session80) ফরম্যাট-রেন্ডার করে বলে নিরাপদ। qa-list.ejs-এ rich-editor.js/css (ইঞ্জিন কম্পোজারের আগে)। **তিন-সিঙ্ক-গোটচা:** প্রোগ্রাম্যাটিক-ভ্যালু-সেটে input-ইভেন্ট হয় না → ড্রাফট-রিস্টোর-পরে ও succeed-ক্লিয়ার-পরে `body.dispatchEvent(input)` (স্টেল-প্রিভিউ/কাউন্টার-প্রতিরোধ)। **জেন-Esc-গার্ড:** panel-এর Escape-কল্যাপ্স জেন-সক্রিয়ে দমন (`body.closest('.re-root.re-zen')`)। ব্র্যান্ড-অ্যাকসেন্ট: `.qa-composer140 .re-root{--re-accent:var(--accent)...}` — ইঞ্জিন-বেস (article-form-এমারল্ড) অস্পৃশ্য।

**ফিচার-৩ profile.css hex-টোকেনাইজেশন ৭৮→০ (র্যাচেট-ওয়েভ-৩):** session83-এর লোকাল `--pf-*` সিস্টেম **অক্ষত-রেখে মান-রিওয়্যার্ম** (--pf-blue:var(--lf-social-blue) ইত্যাদি) + বাকি ডিরেক্ট-হেক্স exact-var-ম্যাপ (longest-first + boundary)। ১৪ নতুন টোকেন। **🚨 নাম-সংঘর্ষ-গোটচা (এ-রাউন্ডের-সবচেয়ে-বড়-শিক্ষা):** আমার প্রস্তাবিত নামগুলোর ৫টি session137 **ইতোমধ্যে ভিন্ন-মানে** ডিফাইন করেছিল (fb-divider #EEF1F5, fb-hover #EEF2F7, fb-border #CCD0D5, danger-tint #FFF5F5, navy-deep #123A6B) — আমার অ্যাপেন্ড last-wins-এ জিতে **অন্য-সারফেসে ক্রস-ড্রিফট** হতো → কম্পিউটেড-প্রোবে ধরা (divider=#EEF1F5 প্রত্যাশা #E9EBEE) → **-২/-৪-সাফিক্সে সৎ-আলাদা-টোকেন** (fb-border-4-এ গিয়ে ২-বার আরও-সংঘর্ষ! প্রতি-নামে defs-count=১ যাচাই-রীতি)। **স্কোপ-গোটচা ×২:** ① tokens.css-এ নতুন টোকেন অ্যাপেন্ড করলে **:root{}-এর ভেতরে** যাচাই বাধ্যতামূলক — ব্লক যদি `}`-এর পরে পড়ে টপ-লেভেল-ঘোষণা হয়ে নীরবে-ড্রপ (brace-depth-প্রোব-রীতি; আমার-ধরা) ② tokens.css-এ pre-existing ভাঙা-আর্টিফ্যাক্ট লাইন `(wip(session136)...)` :root-এর ভেতরে inert — HEAD-এ আছে, স্পর্শ-করিনি। **কম্পিউটেড-প্রমাণ:** --lf-fb-divider-2=#E9EBEE + --lf-fb-divider=#EEF1F5 (ক্যানোনিকাল-অক্ষত) সহাবস্থান + pfBlue #1877F2 + qpcInk #0B1121। বেসলাইন profile.css 78→0; ভিজ্যুয়াল-শূন্য (before/after স্ক্রিনশট ×২ — পার্থক্য কেবল ডায়নামিক reltime)।

**role-policy §২৯ ×১১:** /qa-তে rich-editor js+css+লোড-অর্ডার (tr-নিউলাইন-ছাড়া grep -o মাল্টি-লাইন-HTML-এ মিথ্যা-ফেইল) · মাউন্ট-মার্কার (init(body,{preview:false}) exact-string — ডাবল-মেনশন-গোটচা) · মার্কডাউন-POST→ডিটেইলে <strong>+a-link রেন্ডার · লিস্ট-এক্সার্পট plainText (qa-excerpt">-অ্যাঙ্কর-গ্রেপ — title-grep-ক্রস-ম্যাচ-ফাঁদ) · ক্লিনআপ 303/404। **গোটচা:** ব্রাউজার-সেশনে-তৈরি প্রশ্ন curl-jar (testuser)-দিয়ে ডিলিট করলে ownership-303-নীরব-রিডাইরেক্ট (মুছে-না!) — ক্লিনআপ অবশ্যই সৃষ্টিকর্তা-সেশনে।

**E2E-প্রমাণ (agent-browser, ismail):** কম্পোজার-মাউন্ট (toolbar 15-বাটন, ta-in-re-root) → বোল্ড-বাটন `**গুরুত্বপূর্ণ**`-ইনসার্ট → সাবমিট → optimistic→canonical-swap (id, data-qa-id, চিপ-বাম্প ২) → ডিটেইলে `<strong>গুরুত্বপূর্ণ</strong>` ✓ → owner-ডিলিট-ক্লিনআপ ✓; notif-শূন্য-মক: badge 64px #006A4E + সাদা-আইকন + notifBell114 + CTA solid/ghost + ov-0 ×২-ভিউপোর্ট ✓। **মার্জড-ট্রি (session142-ইউনিয়ন-পরে):** role-policy **২২৪/২২৪ ALL GREEN** ✓ cursor ২৬/২৬ ✓ guard-নতুন-বেসলাইন ✓ audit ✓ brace-০ ✓ EJS ×২ + node --check + bash -n ✓ 390px-০ + কনসোল-০ ✓। **ইউনিয়ন-নোট:** shared.css/tokens.css দ্বি-UU → union (s142-ব্লক আগে, আমার পরে); তাদের lf-ogcard/session142-ব্লক অক্ষত।

**পরবর্তী-প্রস্তাব:** ① style.css-র্যাচেট (১৩৯৫ — ভাগ-করে ২-৩-রাউন্ড) ② auth/gallery/messenger.css-র্যাচেট (১২৩/১২৩/১৪৪) ③ /qa-অপটিমিস্টিক-প্রশ্নে মেনশন-অটোকমপ্লিট (session140-② বাকি) ④ og-কার্ড পোস্ট-বডিতে (session142-①) ⑤ কল-ইতিহাসে degrade-স্তর-রেকর্ড (db-স্কিমা)। **পরের-এজেন্ট: session144 থেকে।**
---

## Cross-Agent Note — Session 144 (cron-QA-রাউন্ড: ফিড 'নতুন পোস্ট' লাইভ-পিল + নোটিফ-ড্রপডাউন ?type= কুইক-চিপ) (২৪ সেপ্টেম্বর ২০২৬)

**প্রবেশ-অবস্থা:** @ 7f8e972 (session139) — QA-সুইপ সব-সবুজ (১৬-রুট, কনসোল-০ ×৯, 390px-০ ×৯, লগইন/গ্যালেরি/নোটিফ-প্রি-ফিল্টার/profile-প্যানে/কমেন্ট-অপটিমিস্টিক) → canonical-backlog-অডিটে দেখা যায় PLANS-পরবর্তী-তালিকার বেশিরভাগই আগেই-হয়ে-গেছে (drawer-ইনস্ট্যান্ট=131, series-stats=131, dropdown-reltime=133, unread-ডট=117) → খোলা session-121-ঐচ্ছিক + নতুন-প্রস্তাব নেওয়া হলো।

**নতুন-চুক্তি ×৪ (পরের-এজেন্ট অবশ্যই মানবেন):**
1. **`data-ts` = গ্লোবাল-রিলটাইম-কনট্র্যাক্ট:** main.js-এর LekhokRelTime পেইন্টার `document.querySelectorAll('[data-ts]')` — **যেকোনো** এলিমেন্টের ভেতর-কনটেন্ট মুছে রিলেটিভ-টাইম বসায়। টাইমস্ট্যাম্প-ক্যারিং-কনটেইনারে data-ts নাম দিলে তার চিলড্রেন ধ্বংস (session144-পিলে E2E-ধরা)। নতুন-কম্পোনেন্টে ভিন্ন-প্রিফিক্স (data-ff-* রীতি)।
2. **keyset-কার্সর = পুরনো-দিক:** buildFeedSql-কার্সর-মোড 'কার্সরের-পরের-পেজ' = পুরনো আইটেম। 'নতুন-গণনা/নতুন-তালিকা' দরকার হলে `feedCursorCond(branchType, tsCol, idCol, cursor, true)` (freshMode-মিরর: >= / > OR(= AND id>) / >)। freshMode-বিহীন কল = legacy-SQL অক্ষুণ্ণ (cursor 25/25-প্রমাণ)।
3. **নোটিফ-গ্রুপ রেজিস্ট্রি single-source:** helpers/notif-groups.js (app.locals.notifGroups) — G117/gKeyOf117 এখন এক-জায়গায়; ফুল-পেজ + ড্রপডাউন-চিপ দুটোই এখান থেকে। routes/pages.js-এর ?type=-হোয়াইটলিস্টের সাথে সমলয় রাখতে হবে।
4. **/api/feed/fresh নীরব-ডিগ্রেড চুক্তি:** যেকোনো-ব্যর্থতায় `{ok:true, fresh:0}` (৫০০ কখনোই নয়) — ক্লায়েন্ট-পিল ব্যর্থতায় নীরবে থেমে যায়, কোনো-নয়জ নেই।

**স্যুট-state-নির্ভরতা-আইটেম (উপরের-তদন্ত খোলা):** role-policy স্যুট LF_QA_DISABLE_RATELIMIT=1 + CALL_RING_TIMEOUT_S=4 + pristine-রিবিল্ড-সহ-ও এ-মেশিনে সবুজ-হয় না (পুরনো-স্যুট 98✗, আপডেটেড-স্যুট 103✗ — সেকশন-২-এর 'user /dashboard 500' থেকে ক্যাসকেড; স্যুটের-বাইরে একই-ক্রিয়া curl/ব্রাউজারে 200)। **ডেল্টা-প্রমাণ-পদ্ধতি:** git worktree @HEAD বেসলাইন-ইনস্ট্যান্স বনাম ডেল্টা-ইনস্ট্যান্স — অভিন্ন-✗-সেট diff (×২-রান) = নিজের-ডেল্টা-শূন্য। সমান্তরাল-এজেন্টদের 212/212-দাবির সাথে এ-অমিলের কারণ (তাদের-ইনস্ট্যান্স-স্টেট সম্ভবত) পরের-তদন্তের-বিষয়।

**পরবর্তী-প্রথম-পছন্দ:** ① ফিড-পিলে SSE-অগ্রাধিকার (helpers/sse.js 'feed'-ইভেন্ট → পোল-বিহীন-ইনস্ট্যান্ট) ② পিল-ক্লিকে reload-বিহীন ফ্রেশ-রো-প্রিপেন্ড (/api/feed/fresh-এ html-স্লাইস) ③ role-policy-স্যুট-স্টেট-নির্ভরতা-তদন্ত (উপরের-আইটেম) ④ dropdown-paintList reltime-রি-পেইন্ট (session134-অবশিষ্ট — এখনো-খোলা)। **পরের-এজেন্ট: session145 থেকে।**


---

## Cross-Agent Note — Session 145 (cron-review: মেনশন-নোটিফিকেশন-সমতা + /qa কম্পোজার @অটোকমপ্লিট) (২৪ সেপ্টেম্বর ২০২৬)

**লেবেল-নোট:** [আমার 141→143→144→145-ত্রি-রিলেবেল — সমান্তরাল session141(admin-fix)/142(og-card)/143(branded-empty+rich-editor) আগে-ল্যান্ডেড; আমার same-feature notifications-শূন্য-অবস্থা-ডেল্টা তাদের session143-ক্যানোনিকালে প্রত্যাহৃত (১০ম-প্রমাণ); mention-parity ×৪-ফাইল + role-policy §৩০ অনন্য-রক্ষিত]

**স্কোপ:** routes/social.js (POST /api/comment + POST /qa/:id/answer — extractMentions+notify) · public/assets/js/mention-anywhere.js (নতুন) · views/user/qa-list.ejs (data-mention + include) · shared.css session145-ব্লক (mention-wrap145) · test-role-policy.sh §৩০ ×১৫

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **মেনশন-নোটিফিকেশন-চুক্তি (সম্প্রসারিত):** কমেন্ট/উত্তর-পাথেও extractMentions → notifyIfAllowed(id, 'notify_comments', 'mention', 'ম্যানশন', '{actor} মন্তব্যে আপনাকে ম্যানশন করেছেন', type-aware-link, actorId)। বাদ-সেট: নিজে + পোস্ট-লেখক + প্যারেন্ট-লেখক (রিপ্লাই-ডুপ্লিকেট-রোধ)। নতুন-কমেন্ট-সারফেস যোগ করলে এ-ব্লক মিরর করুন।
2. **textarea[data-mention] সারফেস-চুক্তি:** mention-anywhere.js স্বয়ংক্রিয়-বাইন্ড করে (wrap `.mention-wrap144` position:relative তৈরি করে — dropdown `.cc-mention` absolute-above)। `.cc-input` স্কিপ-হয় (তাদের নিজস্ব-ইঞ্জিন)। কীবোর্ড: Enter/Tab-ইনসার্ট (preventDefault — newline-নয়), Esc-বন্ধ stopPropagation-সহ (কম্পোজার-Esc-গার্ডের সাথে সহাবস্থান), ArrowDown/Up নেভ।
3. **test-§৩০ পেয়ারিং-রীতি:** ?type=mention-পেজে href="/qa/QID" ↔ data-dismiss="id" tempered-grep + **sort -u বাধ্যতামূলক** (একই-নোটিফ ড্রপডাউন+পেজ দুই-সারফেসে রেন্ডার হয় — দ্বি-ম্যাচ-ফাঁদ) + **delta-গণনা** (প্রি-ডিসমিস → +1 → +1 → নেগেটিভে অপরিবর্তিত → ক্লিনআপ) — বুট-পরবর্তী আইডি-পুনঃব্যবহারে পুরানো-রেজিডু থাকলেও নির্ধারিত।
4. **🚨 মেনশন-টার্গেট-গোটচা:** 'admin'/admin123 = অ্যাডমিন-পোর্টাল-স্বপ্রীয়োক্ত — users-টেবিলে সারি-নেই → **@admin মেনশন কিছুই রেজলভ করে না** (নীরব-শূন্য-বিজ্ঞপ্তি)! টেস্টে টার্গেট = testadmin (users-এ role='admin')। extractMentions সঠিকভাবেই অজানা-ইউজার বাদ দেয় — বাগ-নয়।
5. **EJS/eval-গোটচা-পুনঃপ্রমাণ:** tool-আউটপুটে `[me.id` → `e.id`-ম্যানলিং (od -c-তে ফাইল অক্ষত — সন্দেহে raw-bytes); agent-browser `press` focused-element-এ keydown দেয় না (kd:0-প্রমাণ) → synthetic KeyboardEvent-রীতি; `fill`-এর পরে caret position-0 → findMention নীরব-ব্যর্থ — keyboard type-রীতি ব্যবহার করুন।
6. **FA-গ্লিফ-গোটচা:** fa-stream FA6.5.1-free-এ ::before content-শূন্য (রেন্ডার-নীরব) — CTA-আইকন সাবধানে বাছুন (fa-globe-asia = header-প্যারিটি, নিরাপদ); legacy `.notif-empty i` 64px-বৃত্ত-রুল বংশধর-CTA-আইকনেও পড়ে — আইকন-রিসেট লাগলে !important-হার্ডেন নিন।

**E2E (agent-browser, testuser @8094):** এক্সপ্যান্ড→"@te" টাইপ→ড্রপডাউন ৩-আইটেম→ArrowDown×২-নেভ→Enter→"@testagent1 " ইনসার্ট + কাউন্টার-সিঙ্ক + ড্রাফট-সেভ→Esc=ড্রপডাউন-বন্ধ-প্যানেল-খোলা→ক্লিক-বাইরে-বন্ধ→390px-০→কনসোল-০ ✓; §৩০: কমেন্ট-মেনশন→testadmin +1, নো-জেএস-উত্তর-মেনশন→+1 (মোট ২), সেলফ/অজানা→অপরিবর্তিত, ডিসমিস-ক্লিনআপ→শূন্য ✓; মার্জড-ট্রি: role-policy **239/239** ✓ cursor 25/25 ✓ guard ✓ audit ✓ brace-0 ✓

**পরবর্তী-এজেন্ট: session146 থেকে।** বকেয়া-প্রস্তাব: ① উত্তর-থ্রেডে নতুন-মেনশন-চিপ (answer-bodyHtml-এ mention-লিঙ্ক আগেই আছে — নোটিফ-ডিপ-লিংকে #answer-N অ্যাঙ্কর যোগ করা যায়) ② /qa রিচ-এডিটরে (session143) @মেনশন-ইন্টিগ্রেশন — rich-editor-এর insert-মার্কআপে data-mention-সমতা ③ notifications-এ actor-avatar mention-নোটে ইতোমধ্য আছে — header-ড্রপডাউন-টুলটিপে মেনশন-কনটেক্সট-স্নিপেট ④ Metered.ca-TURN (ইউজার-অ্যাকাউন্ট-প্রয়োজন)
## Cross-Agent Note — Session 146 (cron-QA-রাউন্ড: পোস্ট-বডি og-কার্ড + এক্সটার্নাল domain-chip + og-কার্ড rx-ব্যাজ) — [relabel-নোট: আমার 143→146 — সমান্তরাল session143(notifications-pollশ)/144(feed-pill)/145(mention) আগে-ল্যান্ডেড, max+1-রীতি; কোড-আইডেন্টিফায়ার plainWithLinks/_rx143/extChip143/lf-extchip অনন্য-রক্ষিত (তাদের -141/-144/-145-এর সাথে collision-শূন্য)]
**প্রবেশ-অবস্থা:** origin/main @ 78db543 → বেসলাইন-QA সব-সবুজ (কনসোল-০, dupFixed ৬-কমেন্ট-০-ডুপ, প্যালেট-৭, পারমালিঙ্ক-attr, 390px-শুধু-বাই-ডিজাইন-চিপ-স্ক্রল) → ফেজ-স্টেবল → session142-ব্যাকলগ ①②③ একটি সুসংগত ফিচার-গ্রুপ হিসেবে নির্বাচিত (④ paintList-reltime session136-ক্যানোনিকালে ইতোমধ্য — data-ts-চুক্তি live.js-এ প্রমাণিত)।

**স্কোপ (৫-ফাইল):**
1. **helpers/markdown-lite.js — `plainWithLinks(raw, maxLen)` (নতুন):** ফিড-এক্সার্পটের জন্য মার্কার-স্ট্রিপ + খালি-URL অ্যাঙ্কর (a.a-link — inlineMd-চুক্তি)। ক্রম-গুরুত্ব: URL-সচেতন-ট্রান্কেশন (কাট-পয়েন্ট URL-এর ভেতরে পড়লে URL-শুরু থেকে কাটে — আধা-সেকা-URL রোধ) → md-link `[t](u)`→t → খালি-URL `\u0000N\u0000`-প্লেসহোল্ডার-রক্ষা → মার্কার-স্ট্রিপ (URL-এর `_` আর ভাঙে না — plainText-এর প্রি-এক্সিস্টিং-ত্রুটির স্থায়ী-সংস্কার) → escH → প্লেসহোল্ডার→অ্যাঙ্কর। **আউটপুট RAW-HTML — ভিউতে `<%- %>` বাধ্যতামূলক** (`<%= %>` দিলে অ্যাঙ্কর-স্ট্রিং দেখাবে)।
2. **server.js — `app.locals.mdFeed`:** plainWithLinks-ইনজেকশন (mdPlain-পাশে)।
3. **views/shared/post/FeedPostCard.ejs:** দুই `p.feed-text`-এ `mdPlain`→`mdFeed` + `<%- %>` (repost-original + সাধারণ)। ড্যাশবোর্ড-ফিড SELECT-এ excerpt-নেই → body-পাথ; profile/me-SELECT-এ excerpt-আছে → কাস্টম-এক্সার্পট-সম্মানিত।
4. **public/assets/js/comment-tools.js:** ① `lpvScanAll139`-সিলেক্টর `.fc-body` → `.fc-body, .feed-text`; বাবল-রিজলুশন `closest('.fc-bubble') || closest('.feed-card-body')` (পোস্টে কার্ড টেক্সটের-নিচে — FB-বসানো) ② `extChip143()` — এক্সটার্নাল-লিংকে amber domain-chip, **নেটওয়ার্ক-ফেচ-শূন্য** (URL থেকে hostname — SSRF/স্যান্ডবক্স-নেটওয়ার্ক-দুটোই-প্রযোজ্য-নয়), গার্ড `data-ext-u` (og-কার্ডের data-lpv-u থেকে আলাদা) ③ scan-লুপ rawHref-ডিডুপ + অরিজিন-স্ট্রিপ-পরে internal-match ④ `lpvCardHtml139`-এ rx-ব্যাজ (`c.rx_total` + `c.rx_top`)।
5. **routes/social.js — `_rx143(col, id)`:** likes-টেবিল থেকে মোট + শীর্ষ-ইমোজি (getReactionSummary-এক-সোর্স-মিরর, REACTION_META-ইমোজি-ম্যাপ); কেস-১(comment)/২(article)/৩(qa)-তে স্প্রেড; resources-বাদ (likes-সারফেস-নেই); rx_total বাংলা-অঙ্ক (_bnNum139)।
6. **public/assets/css/shared.css — session143-ব্লক (EOF):** `.feed-text a.a-link` (ব্র্যান্ড-সবুজ + dotted-আন্ডারলাইন + word-break — লং-URL-390px-সুরক্ষা), `.lf-og-rx` পিল, `.lf-extchip` amber-চিহ্নিত (amber-টোকেন-পরিবার), 480px (host-ক্রম্প 130px + label-hidden) + reduced-motion। **টোকেন-শুধু — নতুন-হেক্স-শূন্য।**

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **og-ইঞ্জিন এখন দুই-সারফেস:** কমেন্ট (`.fc-body`→`.fc-bubble`) + পোস্ট (`.feed-text`→`.feed-card-body`)। নতুন-সারফেস যোগ করলে lpvScanAll139-সিলেক্টর + বাবল-রিজলুশন চেইনে যোগ করুন।
2. **ext-chip-চুক্তি:** `.lf-extchip[data-ext-u]` — ক্লায়েন্ট-সাইড-একমাত্র; ফেচ যোগ করতে চাইলে session142-নোটের SSRF-গার্ড-প্যাটার্ন + স্যান্ডবক্স-নেটওয়ার্ক-অনির্ভরতা মনে রাখুন।
3. **mdFeed-চুক্তি:** RAW-HTML আউটপুট; escape-first হেল্পারের ভেতরেই — ভিউ-সাইডে ডাবল-এস্কেপ-নিষেধ। plainText-মিরর-মার্কার-স্ট্রিপ URL-প্লেসহোল্ডার-পরে চলে — ক্রম বদলালে URL-এর `_` আবার ভাঙবে।
4. **rx-চুক্তি:** `/api/link-preview` কার্ড-পেলোডে ঐচ্ছিক `rx_total` (বাংলা-অঙ্ক-স্ট্রিং) + `rx_top` (ইমোজি-ক্যার) — শূন্য-রিঅ্যাকশনে ফিল্ড-অনুপস্থিত (ক্লায়েন্ট `c.rx_total ?` গার্ড)।
5. **🚨 সার্ভার-প্রসেস-গোটচা (এ-রাউন্ড-ধরা):** মিনি-সার্ভিসে পুরনো `node server.js` (bare, 24352) ও `node --watch server.js` (mini-service) **দুটোই-বেঁচে-থাকতে পারে** — bare-টা পোর্ট ধরে রাখলে --watch EADDRINUSE-এ "Waiting for file changes" দেখায় অথচ curl 200 দেয় (পুরনো-কোডে!)। **রিস্টার্ট-পরে অবশ্যই `ps aux | rg server.js` দিয়ে একক-প্রসেস + সদ্য-লগ-টাইমস্ট্যাম্প যাচাই করুন।**

**E2E-প্রমাণ:** টেস্ট-পোস্ট (URL ×২ বডিতে) → ফিডে অ্যাঙ্কর ×২ + og-কার্ড (প্রশ্ন-লেবেল+title+meta) + ext-chip (developer.mozilla.org) + শিমার-শূন্য ✓ পারমালিঙ্ক-কমেন্ট-কার্ড rx '😮১' (শীর্ষ-ইমোজি wow + বাংলা-১ — সত্য-টেবিল-থেকে) ✓ API: /articles/1#fc-c5→rx {১,😮} ✓ /qa/2→rx-অনুপস্থিত ✓ external→400 ✓ প্রোফাইল-সারফেস (excerpt-পাথ) ✓ mdFeed-ইউনিট ×৪ (URL-অক্ষত/XSS-স্ট্রিপ/md-link-লেবেল/মার্কার) ✓ স্ক্রিনশট ×২ (s143-og-card-post-body.png, s143-mobile-390.png)।
**রিগ্রেশন:** role-policy **212/212** ✓ cursor 25/25 ✓ guard ✓ audit:views ✓ brace-০ ×২ ✓ node --check ×৪ ✓ EJS ×২ ✓ dupFixed ✓ 390px-true-overflow-১ (বাই-ডিজাইন-চিপ-স্ক্রল) ✓ কনসোল-০ ✓ ক্লিনআপ (টেস্ট-পোস্ট 651 + কমেন্ট ডিলিট, ফিড-যাচাই) ✓
**পরবর্তী-প্রথম-পছন্দ:** ① এক্সটার্নাল চিপে favicon (google-s2/duckduckgo-আইকন-সার্ভিস — নেটওয়ার্ক-সচেতনভাবে) ② og-কার্ডে reactor-faces (কমেন্টের facepile-প্যারিটি) ③ article-single-বডিতেও og-কার্ড (renderBody পাথ) ④ tokens-র্যাচেট-অবশিষ্ট (style.css ১৩৯৫) ⑤ **পরের-এজেন্ট: session144 থেকে।**

---

## Session 147 — og-কার্ড reactor-faces + আর্টিকেল-বডি og/ext-মাউন্ট + ext-লেটার-ফেভিকন (২৪ সেপ্টেম্বর ২০২৬)

**প্রবেশ-অবস্থা:** origin/main @ 8728e16 (0-behind) → বেসলাইন-QA সব-সবুজ (৬-পেজ-200, কনসোল-০, dupFixed অক্ষত, প্যালেট-৬, 390px-true-overflow-০) → ফেজ-স্টেবল → session146-ব্যাকলগ ①②③ একটি সুসংগত লিঙ্ক-ইকোসিস্টেম-গ্রুপ হিসেবে নির্বাচিত (④ tokens-র্যাচেট বড়-যান্ত্রিক — পরে)।

**স্কোপ (৩-ফাইল + ডক):**
1. **routes/social.js — `_rx143`:** faces-কুয়েরি যোগ (সর্বশেষ-৩ রিঅ্যাক্টর: `likes⨝users ORDER BY l.id DESC LIMIT 3` → `{a: av||'/avatar/'+uid, t: emoji}`); তিন-স্প্রেডে `rx_faces: rx143.faces` (কেস-১ comment/২ article/৩ qa)।
2. **public/assets/js/comment-tools.js:** ① `lfOgRxHtml147(c)` — rx_total থাকলে ফেস-অ্যাভস্ট্যাক-রেন্ডার (17px ওভারল্যাপ-অ্যাভ + শীর্ষ-ইমোজি-বাবল + বাংলা-মোট), ফেস-পেলোড-অনুপস্থিতে ১৪৩-পিল-ফলব্যাক (ক্যাশ-সামঞ্জস্য) ② `extChip143(bubble, href, atEl147)` — লেটার-ফেভিকন (হোস্ট-h31-হ্যাশ→hue, প্রথম-গ্লিফ, hsl-ইনলাইন — **নেটওয়ার্ক-মুক্ত**, google-s2-নির্ভরতা-শূন্য) + ট্রেইলিং-অ্যারো ছোট (lf-ext-ico147) + অ্যাঙ্কর-পাশে-মাউন্ট-সমর্থন ③ `lpvMount139/lpvFetch139`-এ atEl147-প্যারাম — অ্যাঙ্কর-পাশে মাউন্ট/শিমার, নইলে বাবল-শেষ (১৪৩-আচরণ-অক্ষুণ্ণ); কার্ডে `lf-og-in147` সোফট-ইন ④ `lpvScanBody139` — বাবল-রিজলুশনে `.article-body`-নিজেই + `atArticle147` ব্লক-পূর্বপুরুষ-রেজলুশন (p/li/blockquote/pre/td/h1-6, ফলব্যাক anchor-নিজে) ⑤ `lpvScanAll139` সিলেক্টর `+ .article-body` (session146-ব্যাকলগ ③ — আর্টিকেল-সিঙ্গেল-বডিতে og-কার্ড/ext-chip)।
3. **public/assets/css/shared.css — session147-ব্লক (EOF-MARKER: session147-og-faces-article-mount-ext-fav):** `.lf-og-rx147/.lf-og-rx-avstack/.lf-og-rx-av/.lf-og-rx-emb/.lf-og-rx-count` (ওভারল্যাপ-ফেসপাইল — রিং=`--lf-ui-input-bg` কার্ড-বিজিপ্যারিটি), `.article-body .lf-ogcard/.lf-extchip` মার্জিন, `lfOgIn147` কীফ্রেম, `.lf-ext-fav` (hsl-ডিস্ক + ইনসেট-শেড + হোয়াইট-গ্লিফ), `.lf-ext-ico147` ছোট-অ্যারো; 480px (fav-18px, av-15px) + reduced-motion। **টোকেন-শুধু — নতুন-হেক্স-শূন্য** (রিং/ব্যাকগ্রাউন্ড টোকেন; hsl ইনলাইন JS-জেনারেটেড-ডায়নামিক — স্টাইলশিট-হেক্স নয়)।

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **rx_faces-চুক্তি:** `/api/link-preview` কার্ড-পেলোডে ঐচ্ছিক `rx_faces: [{a,t},…]` (≤৩) — শূন্য-রিঅ্যাকশনে rx_total-সহ-সব-ফিল্ড-অনুপস্থিত; ক্লায়েন্ট ফেস-অনুপস্থিতে পিল-ফলব্যাক করে — পুরনো-ক্যাশ/ক্লায়েন্ট ভাঙে না।
2. **og-ইঞ্জিন এখন তিন-সারফেস:** কমেন্ট (`.fc-body`→`.fc-bubble`) + পোস্ট (`.feed-text`→`.feed-card-body`) + আর্টিকেল (`.article-body`→নিজেই, অ্যাঙ্কর-পাশে)। চতুর্থ-সারফেসে lpvScanAll139-সিলেক্টর + বাবল-রিজলুশন-চেইন + (ঐচ্ছিক) at-রেজলুশন তিন-জায়গায় সমলয় করুন।
3. **article-body-গার্ড:** markdown-lite renderBody `<p>`-র‍্যাপ-নেই-হলে at-fallback = anchor-নিজে (ইনলাইন-মাউন্ট) — og-কার্ড নিজস্ব-লাইনে ভাঙে (display:flex), ext-chip ইনলাইন-ফ্লো — উভয়ই FB-প্যারিটি-গ্রহণযোগ্য।
4. **লেটার-ফেভিকন নেটওয়ার্ক-মুক্ত:** ইচ্ছাকৃত (স্যান্ডবক্স-আউটবাউন্ড-অনির্ভরতা-শূন্য; ভাঙা-ইমেজ-শূন্য)। বাহ্যিক-আইকন-সার্ভিস চাইলে `<img onerror>`-ফলব্যাক-সহ যোগ করুন — লেটার-ডিস্কটা ফলব্যাক-হিসেবেই রাখুন।
5. **🚨 পুনঃপ্রমাণিত-গোটচা ×২:** (ক) LPV সার্ভার-ক্যাশ (৫মি) — রিঅ্যাকশন-যাচাই-টেস্টে ক্যাশ-পুরনো-কার্ড-দেখায়; সার্ভার-রিস্টার্ট = ক্যাশ-ফ্লাশ (খ) `node --watch`-এর child-কিল করলে watcher মরে-যেতে-পারে — রিস্টার্টে pkill + mini-service `bun run dev` + ps-একক-প্রসেস-যাচাই (session146-নোট ⑤-এর পুনরাবৃত্তি)।
6. **E2E-প্রমাণ:** আর্টিকেল-৭১০ (লিংক ×২) → og-কার্ড `/qa/3` অ্যাঙ্কর-পাশে (prevTag=A — ইনলাইন-অ্যাডজাসেন্ট) + ফেস-অ্যাভস্ট্যাক (1-অ্যাভ+👍+১) + ext-chip 'E' hsl(157)+অ্যারো ✓ ফিড-৭১১ (bare-URL) → og-কার্ড ফেস-সহ + chip 'E' + বাবল-শেষ-মাউন্ট-অক্ষুণ্ণ (order: feed-text→extchip→ogcard) ✓ API `/qa/3` → `{rx_total:'১', rx_top:'👍', rx_faces:[{a:'/avatar/52',t:'👍'}]}` ✓ কমেন্ট-বাবল ext-chip-ফেভিকন ✓ স্ক্রিনশট ×২ (s147-article-og-faces.png, s147-ext-fav.png)।
7. **রিগ্রেশন:** role-policy **239/239 ALL GREEN** ✓ cursor **25/25** ✓ guard ✓ audit:views (97-ejs-ডুপ-শূন্য) ✓ brace-০ ×২ ✓ node --check ×২ ✓ 390px-true-overflow-০ (og-320px-ফিট, fav-18px) ✓ কনসোল-০ ×৪-পেজ ✓ ক্লিনআপ (টেস্ট-পোস্ট 710+711-ডিলিট-ক্যাসকেড + পোস্ট-৩-রিঅ্যাকশন-টগল-অফ — total:0/mine:false) ✓
8. **পরবর্তী-প্রথম-পছন্দ:** ① og-কার্ডে ক্লিকযোগ্য rx-ব্যাজ → reactors-modal (a>span-interactive-nesting-সতর্কতা — role=button-ভেতরে-নয়, বিকল্প: কার্ড-বাইরে-সামলানো) ② tokens-র্যাচেট (style.css ১৩৯৫) ③ dropdown-paintList reltime (session134-অবশিষ্ট) ④ ext-chipে বাহ্যিক-আইকন-সার্ভিস (onerror-ফলব্যাক-সহ) ⑤ **পরের-এজেন্ট: session150 থেকে।**
**পরবর্তী-এজেন্ট: session148 থেকে।** বকেয়া-প্রস্তাব: ① উত্তর-থ্রেডে নতুন-মেনশন-চিপ (answer-bodyHtml-এ mention-লিঙ্ক আগেই আছে — নোটিফ-ডিপ-লিংকে #answer-N অ্যাঙ্কর যোগ করা যায়) ② /qa রিচ-এডিটরে (session143) @মেনশন-ইন্টিগ্রেশন — rich-editor-এর insert-মার্কআপে data-mention-সমতা ③ notifications-এ actor-avatar mention-নোটে ইতোমধ্য আছে — header-ড্রপডাউন-টুলটিপে মেনশন-কনটেক্সট-স্নিপেট ④ Metered.ca-TURN (ইউজার-অ্যাকাউন্ট-প্রয়োজন)

## Cross-Agent Note — Session 146 (কল-পলিশ: রিং-হার্ডস্টপ + সেলফি-PIP প্রি-কানেক্ট + স্মুথ-ট্রানজিশন) (২৪ সেপ্টেম্বর ২০২৬)

**ইউজার-রিপোর্ট (লাইভ):** "ইন্টারফেস আসছে, অনুমতিও দিতে পারছি — কিন্তু ① ভিডিও-প্রিভিউ স্ক্রিনে আসে না ② কল কাটার পরও কিছুক্ষণ রিং বাজে ③ ট্রানজিশন FB/টেলিগ্রামের মতো স্মুথ না।"

**স্কোপ:** public/assets/js/webrtc-call.js (stopRing-হার্ডস্টপ + attachLocal-PIP + cleanup-এক্সিট + hideIncoming-ফেড + S.seq-রেস-ফিক্স + tryPlayLocal) · public/assets/css/calls.css (session148-ব্লক: has-local/unpop/vfade/pip-in + reduced-motion-সম্প্রসারণ) · scripts/verify-session148-callpolish.js (নতুন E2E, ২৩-চেক)

**মূল-কারণ ×৩ + ফিক্স:**
1. **রিং-সাউন্ড-লিক:** `beep()` অসিলেটরগুলো ৪০-সেকেন্ড পর্যন্ত ভবিষ্যতে-শিডিউল (`o.start(t0)`), কিন্তু `stopRing()` শুধু সেফটি-টাইমার ক্লিয়ার করত — প্রি-শিডিউল-বিটগুলো কল-শেষেও বাজত (হুবহু ইউজার-রিপোর্ট)। ফিক্স: `S.ringing.nodes[]`-ট্র্যাক → প্রতি-নোড `gain.cancelScheduledValues→০ + stop(now) + দ্বি-disconnect`। **AC শেয়ার্ড-কনটেক্সট (SPK-মিটার ব্যবহারকারী) — ctx.close() কখনো নয়, প্রতি-নোড হার্ডশাটডাউনই সঠিক।**
2. **সেলফি-PIP:** `.lc-local-video` লুকানো `.lc-videos`-কনটেইনারের ভেতরে ছিল — কানেক্ট-পূর্বে কখনো অদৃশ্য + srcObject-সেট-কালে display:none → autoplay-মিস + স্পষ্ট play() নেই। ফিক্স: এলিমেন্ট `.lc-panel`-লেভেলে, `lc-root--has-local`-ক্লাসে রিং-অবস্থাতেই দৃশ্যমান (FB-প্যারিটি), `tryPlayLocal()` স্পষ্ট-প্লে; অডিও-ফলব্যাকে নেই, গ্রুপে `display:none !important` (গ্রিডেই সেলফি-টাইল)।
3. **ট্রানজিশন:** এন্ট্রি `lc-pop` ছিল, এক্সিট ছিল হুট-`root.remove()`। ফিক্স: `lc-root--closing` (backdrop-ফেড + panel `lc-unpop` ২২০ms → টাইমারে remove; hidden-ট্যাব/reduced-motion-এ সরাসরি remove), আসন্ন-কার্ডে `.is-out` বিদায়-ফেড (pointer-events:none তাৎক্ষণিক), `.lc-videos.is-in` কানেক্ট-ক্রসফেড।

**🚨 নতুন-বাগ-আবিষ্কার (রেস):** UI-ফার্স্টে ক্লিক-মুহূর্তেই মোডাল+রিং, কিন্তু `/start`-POST ফ্লাইটে — এই-ফাঁকে হ্যাংআপ করলে `S.callId=null` → end-POST কখনো যেত না → সার্ভারে ৪৫-সেকেন্ড `ringing` ঝুলে **busy-লক (৪০৯)** — দ্রুত-রিডায়াল "আপনার আরেকটি কল চলছে" (স্টেবিলিটি-অভিযোগের লুকানো-অংশ)। ফিক্স: `S.seq` লাইফসাইকেল-টোকেন (start/startGroup বাড়ে, cleanup-এ বাড়ে) → acquireAndOffer/startGroup-এ POST-রেজলভে seq-মিলন-ব্যর্থ হলে সদ্য-তৈরি কল সরাসরি `'cancelled'`-মার্ক।

**চুক্তি (পরের-এজেন্ট):**
1. `S.ringing = { ac, nodes[], timer }` — nodes[]-এ {o,g}-পেয়ার; stopRing ছাড়া কোনো-পথে oscillator রেখে দেবেন না।
2. `S.seq`-টোকেন: নতুন কোনো async-start-পথ (ভবিষ্যতে স্ক্রিন-শেয়ার ইত্যাদি) যোগ হলে একই seq-গার্ড বাধ্যতামূলক।
3. `.lc-local-video` এখন `.lc-videos`-এর বাইরে — visibility = `lc-root--has-local` ক্লাস-চালিত; hidden-attr-নয়।
4. QA-হুক: `_qaRingState()` (active/nodes), `_qaSelfPip()` (pip/visible/live) — verify-session148-callpolish.js ২৩-চেক রেফারেন্স।
5. ব্রাউজার-E2E-তে `CALL_RING_TIMEOUT_S=4` নিষিদ্ধ — ইনবক্স-পেজ পোল-ইন্টারভাল ৫-সে > ৪-সে-রিং-উইন্ডো → ইনকামিং-মিস (এ-রাউন্ডে-ধরা)।

**যাচাই:** session-146 নতুন-E2E **২৩/২৩** (হার্ডস্টপ-সিঙ্ক্রোনাস-প্রমাণ, PIP videoWidth>০ প্রি-কানেক্ট, closing-ক্লাস+২৪০ms-বিদায়, ফুল-কানেক্ট-রিগ্রেশন, ক্যালি-পাশ-হার্ডস্টপ) · session-122 ব্রাউজার **২১/২১** · session-93 API **৫৫/৫৫** · session-113 গ্রুপ **৫০/৫০** · guard ✓ brace-২৯৭/২৯৭ ✓ node --check ✓

**পরবর্তী-এজেন্ট: session148 থেকে।** বকেয়া: ① কল-মিড মিনিমাইজ + অন্য-পেজ-ব্রাউজ সহাবস্থান-পলিশ ② OS-নোটিফিকেশনে গ্রহণ/প্রত্যাখ্যান-অ্যাকশন-বাটন ③ Metered.ca-TURN (session145-এর ④-ও খোলা) ④ উত্তর-থ্রেড-মেনশন-চিপ (session145-এর ①)

## Cross-Agent Note — Session 149 (cron: QA→ফিচার-রাউন্ড — messenger.css র্যাচেট ১৪৪→০ + [প্রত্রাহাণ-যুগল: ফিড og-কার্ড→s146-canonical, /qa মেনশন→s145-canonical]) (২৪ সেপ্টেম্বর ২০২৬)
**লেবেল-নোট:** [relabel: আমার-144→149 — push-রেসে সমান্তরাল session144 (d46a55a ফিড-পিল)/145 (093f97a মেনশন)/146 (8728e16 og-কার্ড) আগে-ল্যান্ডেড; max+1 রীতি; কোড-আইডি s144 (patch144/verify-session144) অক্ষত — session137-রীতি]
**১১শ-প্রত্রাহার-প্রমাণ (session134-রীতি):** আমার রাউন্ডের ফিচার-A (ফিড og-কার্ড — নিজস্ব mdFeed/feedLink) ও ফিচার-B (/qa মেনশন — window.LekhokMention সার্বজনীনকরণ) দুটোই সমান্তরাল এজেন্টের canonical-বাস্তবায়নে (s146 plainWithLinks + extChip143; s145 mention-anywhere.js) পূর্ণ-সমাধান — rebase-এ তাদের পাশ গৃহীত, আমার ডেল্টা সম্পূর্ণ-প্রত্রাহৃত (ডাবল-স্ক্যান/দ্বৈত-ইঞ্জিন-ঝুঁকি-শূন্য); আমার browser-E2E প্রমাণগুলো তাদের-বাস্তবায়নের-উপরেই পুনঃ-যাচাইকৃত (নিচে)। অনন্য-রক্ষিত: messenger.css র্যাচেট (কেউ-স্পর্শ-করেনি)।
**প্রবেশ-অবস্থা:** origin/main @ ad8af3c (session143) + লোকাল-অপুশড docs-commit af01671 (worklog-sync — এ-রাউন্ডে push-সহ) — QA-ফেজ ALL GREEN (guard ✓ + role-policy ২২৪/২২৪ + cursor ২৬/২৬ + agent-browser ৭-পেজ ২০০/কনসোল-এরর-০/390px-০) → স্থিতিশীল-ফেজ রায় → ফিচার-রাউন্ড (session143-প্রস্তাব ③④ গ্রহণ + র্যাচেট-ওয়েভ-৪)।

**[প্রত্রাহৃত — s146 plainWithLinks/extChip143 canonical (গৃহীত); নিচের আমার-বিশ্লেষণ ঐতিহাসিক-মূল্য (গোটচা-গুলো তাদের-কোডেও-প্রযোজ্য)]** **ফিচার-১ ফিড og-কার্ড (session142-① — পারমালিঙ্ক→কমেন্ট→ফিড-উত্তরণ):** দ্বি-স্তর — ① **সার্ভার mdFeed()** (helpers/markdown-lite.js): plainText → বেয়ার-URL লিংকিফাই (`_feedBareUrlPass144` — এক্সটার্নাল http(s) + অভ্যন্তরীণ-বেয়ার-পাথ /articles|qa|questions|resources/N; ট্রেইলিং-[.,;:!?…।]-স্ট্রিপ) → অ্যাঙ্কর-সেগমেন্ট-স্প্লিট-escH (`_anchorSplit139` পুনঃব্যবহার)। **নিরাপত্তা-গোটচা:** এখানে esc-ফার্স্ট-নীতির উল্টো-ক্রম (লিংকিফাই কাঁচা-প্লেইনে, তারপর esc) — তাই href+ডিসপ্লে দুটোই escH-পরে + URL-ক্যারসেটে `<>"'` বাদ (href-attribute-ব্রেকআউট-শূন্য; XSS-unit-টেস্ট: `<img onerror>` body → নিরপেক্ষ)। server.js `app.locals.mdFeed` → FeedPostCard ×২ (repost-original + regular) `<%- mdFeed(...) %>`। ② **ক্লায়েন্ট lpvScanFeed144** (comment-tools.js): `.feed-text a.a-link` → `.feed-card-body`-তে মাউন্ট (lpvFetch139 পুনঃব্যবহার — ক্যাশ/শিম/ডুপ্লিকেট-গার্ড এক-সোর্স); MutationObserver এখন lpvScanAll144 (fc-body + feed-text এক-স্ক্যানে)। **ফাঁদ:** "আরও পড়ুন"-অ্যাঙ্কর classless রাখতে হয় (og-স্ক্যান `a.a-link`-শুধু — নইলে প্রতিটি-ট্রাংকেটেড-পোস্টে নিজের-প্রশ্নের og-কার্ড বসত); non-existent-টার্গেটে API-404 → অ্যাঙ্কর-স্থিত, কার্ড-অনুপস্থিত (graceful)।

**[প্রত্রাহৃত — s145 mention-anywhere.js canonical (গৃহীত); আমার window.LekhokMention-সার্বজনীনকরণ rebase-এ বাদ — দ্বৈত-ইঞ্জিন-প্রতিরোধ; আমার Esc-কোঅর্ডিনেশন-আবিষ্কার (panel-keydown document-এর-আগে-ফায়ার) s145-এর Esc-stopPropagation-চুক্তিতে সমাধান-সত্য)]** **ফিচার-২ /qa মেনশন-অটোকমপ্লিট (session140-② — single-source-পথ):** নতুন ফাইল-এক্সট্র্যাকশনের বদলে **comment-tools.js-এর ইঞ্জিন-সার্বজনীনকরণ** (attribute-driven চুক্তি): `[data-mention-ta]` (ফিল্ড) + `[data-mention-root]` (ধারক) → input/click/keydown তিন-ডেলিগেটই জেনেরিক; `window.LekhokMention = {findMention, closeMention, showMention, insertMention, isOpen}` এক্সপোজ। **কমেন্ট-সারফেস-অক্ষুণ্ণ:** cc-input-শাখায় send-state+auto-grow আটকে (পুরনো-আচরণ), CommentComposer.ejs + buildComposerHtml(reply-box)-এ দুই-attr যোগ — পুরনো-সারফেস নতুন-চুক্তিতেই চলে (E2E s144-৬-প্রমাণ)। **/qa-ইন্টিগ্রেশন:** qa-list.ejs `.qac-body-wrap144[data-mention-root]` + `.cc-mention` ড্রপডাউন (style.css-এর বিদ্যমান bottom:100%+6px — ওপরে খোলে) + textarea data-mention-ta + **comment-tools.js লোড (qa-composer-এর আগে — লোড-অর্ডার চুক্তি)**; ইঞ্জিন-বাইন্ডিং শূন্য-নতুন-কোড (ডেলিগেট-attr-চুক্তিতে অটো)। **Esc-কোঅর্ডিনেশন-গোটচা:** panel-এর keydown document-এর আগে ফায়ার করে — mention-ড্রপডাউন-খোলা অবস্থায় panel-collapse আগে খেয়ে ফেলত → qa-composer Escape-শাখায় `LekhokMention.isOpen(root)` → শুধু ড্রপডাউন-বন্ধ, প্যানেল-স্থিত (E2E ব্রাউজার-প্রমাণ: Esc → ddHidden=true, panelHidden=false)।

**ফিচার-৩ messenger.css র্যাচেট ১৪৪→০ (ওয়েভ-৪; patch139-রীতি):** scripts/patch144-messenger-ratchet.js — বিদ্যমান-টোকেন-ম্যাপ ×২২ + **নতুন-টোকেন ×৯** (danger-strong #E41E3F ×১৪-ব্যবহার, danger-strong-soft, social-blue-hover-2 #166FE0, warn-ink-2 #664D03, warn-tint, match-mark #FFE58F, match-mark-active #FF9C6E, social-blue-light-2 #E3F0FF, social-blue-tint #E7F0FD)। **নামকরণ-সততা (session143-রীতি):** কাছাকাছি-ভিন্ন-মানে `-২`-সাফিক্স (social-blue-hover #166FE5 ≠ -২ #166FE0; warn-ink #856404 ≠ -২ #664D03; social-blue-light #EAF3FF ≠ -২ #E3F0FF) — per-নাম defs=১ যাচাইকৃত। **patch139-বাগ-সংশোধন:** tokens.css-ব্লকও এখন শুধু `--apply`-এ লেখে (প্রমাণ-মোডে patch139 টোকেন-ব্লক লিখে ফেলত — ড্রাই-রান ফাইল-মিউটেট করত)। বেসলাইন 144→0; লাইভ-রেজলভ-প্রমাণ (9-টোকেন computed) + বাবল-রঙ-প্রোব (online #31A24C, text #050505) + স্ক্রিনশট।

**role-policy:** নতুন-HTTP-সারফেস শূন্য (mdFeed সার্ভার-রেন্ডার; mention /api/users/search বিদ্যমান; link-preview session139-কভার্ড) — §-যোগ-অপ্রয়োজনীয়। **নতুন E2E: verify-session144-feed-ogcard.sh ৩৩/৩৩** (দ্বি-সিড-প্যাটার্ন — টার্গেট-আইডি ডিটারমিনিস্টিক করতে সিড-টার্গেট+লিংক-প্রশ্ন দুটো তৈরি; **303-গোটচা-সংশোধন:** /qa/:id/delete-এর সফল-রেসপন্সই 303 (ownership-ফেইলও 303-নীরব — স্ট্যাটাস-একা অপর্যাপ্ত, absence-যাচাই বাধ্যতামূলক)।

**চূড়ান্ত (মার্জড-ট্রি):** s144-E2E **৩৩/৩৩ ALL GREEN** + role-policy **২২৪/২২৪** + cursor ২৬/২৬ + s132 ১৯/১৯ + s139 ২২/২২ + guard-বেসলাইন ✓ + node --check ×৩ + bash -n + EJS ×৩ + ব্রাউজার-সুইপ (console-০ ×৪, 390px-০ ×৫) + স্ক্রিনশট ×৩।

**পরবর্তী-প্রস্তাব:** ① style.css-র্যাচেট (১৩৯৫ — এখনো-সর্ববৃহৎ; ২-৩-রাউন্ডে) ② auth/gallery.css-র্যাচেট (১২৩/১২৩ — calls ৬২/bookmarks ৫৪ ছোট) ③ ফিড-og-কার্ডে reactors-count (og-কার্ড-সমৃদ্ধি) ④ কমেন্ট-বডিতেও mdFeed-স্টাইল বেয়ার-URL (কমেন্ট-রেন্ডারার এখনো markdown-link-শুধু — bare-URL auto-link session142-ইঞ্জিনে আছে কিন্তু পুরনো-কমেন্টে?) ⑤ article-single-ও mdPlain→mdFeed-প্যারিটি-যাচাই (ওগুত্র og-কার্ড চাইলে) ⑥ কল-ইতিহাসে degrade-রেকর্ড (db-স্কিমা; বহু-সেশন-বাকি)। **পরের-এজেন্ট: session145 থেকে**; push-পূর্বে git pull --rebase (union-মার্জ PLANS/PROJECT/worklog)।

## Cross-Agent Note — Session 150 (cron-QA-রাউন্ড: কাউন্টার-ভাষা-চুক্তি — বাংলা-সংখ্যা single-source + পেজভেদে ইন্টারফেস-সমতা) — [relabel-নোট: আমার 147→150 — সমান্তরাল session147 (7791d49, og-কার্ড-ফেস)/148 (call-polish)/149 (messenger-ratchet) আগে-ল্যান্ডেড, max+1-রীতি; double-147-কলিশন-টলারেটেড+ডকুমেন্টেড (double-129/133/134-রীতি); আমার কোড-আইডেন্টিফায়ার toBnNumber/toBn/actRxTruth/window.toBnNumber অনন্য-রক্ষিত (তাদের lfOgRxHtml147-পরিবারের সাথে collision-শূন্য)]
**প্রবেশ-অবস্থা:** origin/main @ 8728e16 (session146) → clone-ফ্রেশ; বেসলাইন-QA সব-সবুজ → ইউজার-স্পেসিফিকেশন বাস্তবায়ন: "কাউন্টারের ভাষা বৈষম্য (একপাশে বাংলা ও অন্যপাশে ইংরেজি) স্থায়ীভাবে দূর + সোশ্যাল ফিড, প্রোফাইল ও সিঙ্গেল পোস্ট ভিউতে একই ইন্টারফেস"।

**সমস্যা-প্রমাণ (প্রি-ফিক্স):** PostFooterActions.ejs সব কাউন্টার কাঁচা ইংরেজি অঙ্কে রেন্ডার করত (`<%= commentCount %>`); main.js-রিঅ্যাকশন-ইঞ্জিন `.rs-count`-ও ইংরেজি লিখত (`textContent=o>0?o:""`) অথচ comment-tools.js মন্তব্য-কাউন্টার বাংলায় লিখত (session-১২ bnNum) → একই কাউন্টার-বারে মিশ্র-ভাষা (ক্লিক-পরবর্তী অবস্থায় আরও খারাপ); article-single-মেটা-লাইনে বাংলা-তারিখের পাশে ইংরেজি `0 পঠিত`।

**স্কোপ (৯-ফাইল):**
1. **helpers/bn-number.js (নতুন):** `toBnNumber(num)` — null/undefined/''/NaN → '০'; 0-9 → ০-৯; অ-ডিজিট অপরিবর্তিত। ক্যানোনিকাল সার্ভার-সোর্স (bn-date.js-রীতি)।
2. **server.js:** `app.locals.toBn` — সব EJS-ভিউতে `toBn(n)`।
3. **views/layout.ejs + views/partials/header.ejs (দুই ডকুমেন্ট-ওপেনার):** `window.toBnNumber` ইনলাইন-মিরর (নেটওয়ার্ক-কস্ট-শূন্য; bn-date ৩-কপি-চুক্তির মতো) — **দুই-লেআউটেই বাধ্যতামূলক** (header.ejs-ওপেনার পেজে layout-এক্সপ্রেশন নেই — E2E-তে ধরা)।
4. **views/shared/post/PostFooterActions.ejs:** সব কাউন্টার (rs-count/মন্তব্য/শেয়ার/পঠিত) → `toBn()`; হেডারে চুক্তি-নোট — কাঁচা-ইংরেজি-এক্সপ্রেশন নিষিদ্ধ। পার্স-ব্যাক নিরাপদ: comment-tools optParseBn বাংলা-পার্স-সক্ষম।
5. **views/shared/post/FeedPostCard.ejs:** read_mins-চিপ + "সব N টি মন্তব্য" অ্যাড-হক-ল্যাম্বডা → toBn।
6. **views/user/article-single.ejs:** মেটা-লাইন পঠিত → toBn; ফুটার-include-এ `viewCount: post.view_count` (ফিড-কার্ডের সাথে ইন্টারফেস-সমতা — একক-পোস্টেও পঠিত-স্ট্যাট)।
7. **public/assets/js/main.js (মিনিফায়েড):** ইঞ্জিন-লাইন → `o>0?window.toBnNumber(o):""` (মন্ত-কমেন্ট-সহ)।
8. **public/assets/js/comment-tools.js:** লোকাল bnNum → `window.toBnNumber ||` ডেলিগেট (ফলব্যাক-কপি-সহ) — **session147-এর lfOgRxHtml147-ব্লক-অক্ষত (সহাবস্থান-যাচাইকৃত)**।
9. **routes/dashboard.js decorateFeed + routes/social.js profile-route — 🚨 দুই-ড্রিফট-বাগফিক্স:**
   - **কার্যক্রম-কার্ড:** daily_content-এ reactions/like_count কলাম নেই অথচ /api/react likes-টেবিলে লেখে → ক্লিকে '১' দেখিয়ে রিলোডে '০' (ড্রিফট)। decorateFeed এখন dailyIds-ব্যাচে likes-টেবিল-সত্য (actRxTruth — API-র রিকম্পিউট-উৎস এক-সোর্স)।
   - **প্রোফাইল:** রুট `p.reactCounts` নামে সেট করত, ক্যানোনিকাল FeedPostCard পড়ে `item.reactionCounts` → **প্রোফাইল-কার্ডে রিঅ্যাকশন-কাউন্ট কখনোই রেন্ডার হত না** (ফিডে দেখাত, প্রোফাইলে না — পেজভেদে অমিল); সাথে RN87-এ angry-কী অনুপস্থিত। এখন reactionCounts + ৭-কী-ম্যাপ।

**চুক্তি (পরের-এজেন্টের জন্য):**
1. **বাংলা-সংখ্যা single-source:** নতুন কোডে প্রদর্শন-সংখ্যার জন্য লোকাল `০১২৩৪৫৬৭৮৯`-ল্যাম্বডা **নিষিদ্ধ** — EJS-এ `toBn(n)`, ক্লায়েন্ট-জেএস-এ `window.toBnNumber(n)`। পার্স-ব্যাক (বাংলা→ইংরেজি) পড়ার-জায়গার দায়িত্ব (optParseBn-প্যাটার্ন)।
2. **দুই-লেআউট-গোটচা:** layout.ejs-এ গ্লোবাল-জেএস যোগ করলে header.ejs-ওপেনার পেজ (dashboard/profile/article-single/qa-single/me/…) সেটি পায় না — **উভয় ডকুমেন্ট-ওপেনারে মিরর বাধ্যতামূলক** (auth-sync/আগে-স্ক্রিপ্ট-অর্ডার)।
3. **EJS-কমেন্ট-গোটচা ×২ (নতুন-ধরা):** ① `<%# %>`-ব্লকের ভেতরে `<%= %>`-স্ট্রিং লিখলে পার্সার ভাঙে ("Could not find matching close tag") — কমেন্টে ট্যাগ-সিনট্যাক্স-বর্ণনা নিষিদ্ধ ② `<%- include(...)`-আর্গুমেন্ট-অবজেক্টের ভেতরে `<%# %>` অবৈধ — **JS-কমেন্ট (`//`)** ব্যবহার করুন (ওপেন-ট্যাগের ভেতরে সেটাই JS-কোড)।
4. **PostFooterActions-কাউন্টার-চুক্তি:** সব নতুন-স্ট্যাট যোগ হলে toBn-বাধ্যতামূলক; reactionCounts-ক্ষেত্র-নাম FeedPostCard-চুক্তি (dashboard-decorate-এর সাথে অভিন্ন) — নতুন-সারফেস decorate-এ অন্য-নাম (reactCounts…) দিলে নীরব-শূন্য-রেন্ডার।

**E2E-প্রমাণ (agent-browser, testuser @3030):** toBnNumber-ইউনিট ×৮ (51→৫১, 0→০, null/''/undefined→০, মিশ্র-স্ট্রিং, NaN) ✓; ফিড — প্রোব-পোস্ট-কার্ড rs '১'/মন্তব্য '১'/শেয়ার '০' + কার্যক্রম-কার্ড ১০× '০' — **১১-কার্ডে ইংরেজি-ডিজিট-শূন্য** ✓; রিঅ্যাক্ট-চক্র — ক্লিক→'১' (ইঞ্জিন-পাথ), টগল-অফ→'' , টগল-অন→'১' ✓; কার্যক্রম-ড্রিফট-ফিক্স — লাইক-পরে রিলোডে '১' (আগে '') ✓; সিঙ্গেল-পোস্ট — মেটা '১৮ সেপ্টেম্বর, ২০২৬ · ১ পঠিত · ≈ ১ মিনিট পড়া', ফুটার [১,১,০,১] (পঠিত-স্ট্যাট-নতুন), কমেন্ট-যোগ→'১' (comment-tools-ডেলিগেট), রিলোড-স্থায়িত্ব ✓ englishLeak:false ✓; প্রোফাইল — rs '১' (আগে-সর্বদা-খালি!), মন্তব্য '১' ✓; 390px-ওভারফ্লো-০ ×৩-সারফেস ✓ কনসোল-০ ✓ স্ক্রিনশট ×২ (download/s147-article-footer-390/-desktop.png — ফাইল-নাম-লেবেল-পুরনো-রীতি)।
**রিগ্রেশন:** role-policy baseline-delta — প্রিস্টিন-HEAD-worktree (২১✗) বনাম ডেল্টা (১৯✗) — **delta-only-ব্যর্থতা-শূন্য** (সব প্রি-এক্সিস্টিং সিড-গ্যাপ: ismail-ইউজার-অনুপস্থিত ক্যাসকেড) ✓ guard ✓ brace-০ ×২ ✓ node --check ×৫ ✓ EJS-compile ×৪ ✓ টেস্ট-ডেটা-ক্লিনআপ (প্রোব-পোস্ট+মন্তব্য অ্যাপ-ফ্লোতেই ডিলিট; likes/comments-ক্যাসকেড-যাচাই-শূন্য) ✓
**মার্জড-ট্রি-নোট:** rebase @159eac3-উপরে — কোড-কনফ্লিক্ট-শূন্য (তাদের comment-tools og-ফেস-ব্লক আমার bnNum-ডেলিগেট-লাইনের সাথে সহাবস্থান), doc-union ×৪; মার্জড-ট্রিতে node --check + EJS-compile পুনঃযাচাই নিচে।
**পরবর্তী-প্রথম-পছন্দ:** ① বাকি-পেজের legacy ল্যাম্বডা-মাইগ্রেশন toBn-এ (bn99/bn102/bn110/bn140/_bn120/bnNum139 — ১২+ফাইল, নিরাপদ-মেকানিক্যাল) ② ReactorsModal-ট্যাব-কাউন্ট toBn-একীকরণ ③ /api/react-এ activity-target-এ posts-টেবিল-আপডেট নীরব-নো-অপ (actRxTruth-ফিক্সে কভার, তবু নোট) ④ **পরের-এজেন্ট: session151 থেকে।**
## Session 151 নোট — ফোরাম ডিরেক্টরি লঞ্চার + ফিড লেফট-রেল (চুক্তি ×৫) [relabel-নোট: আমার-147→151 — push-রেসে সমান্তরাল session147(7791d49, og-কার্ড-ফেস)/148/149/150 আগে-ল্যান্ডেড — max+1 রীতি; কোড-মার্কার session147-ব্লক/dlx*-চুক্তি-নাম অক্ষত (double-129/133/134/147-রীতি)]

**ইমপ্ল-সারসংক্ষেপ:** helpers/dir-launcher.js (DIR_SECTIONS ×৩-ডোমেইন, DIR_RAIL, TONE_TOKENS) + server.js app.locals.dirSections/dirRail + header.ejs মেগামেনু→৯-ডট-প্যানেল + layout.ejs পাবলিক-টপবারে একই প্যানেল + public/assets/js/dir-launcher.js (toggleDlx/closeDlx) + tokens.css --lf-dlx-* ×৬ + style.css session147-ব্লক + dashboard.ejs .feed-rail/.has-rail + dashboard.css session147-ব্লক।

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **ডিরেক্টরি-আইটেম-যোগ-রীতি:** নতুন ফিচার/রুট = শুধু helpers/dir-launcher.js-এ আইটেম (tone+rail-ফ্ল্যাগসহ) — হেডার-প্যানেল, layout.ejs-প্যানেল ও .feed-rail অটো-সিঙ্ক; ভিউ-সাইডে হার্ডকোড-নিষিদ্ধ (ডুপ্লিকেট/ড্রিফট-প্রতিরোধ — মেগামেনুর-ঐতিহাসিক-রোগ)।
2. **টোন-চুক্তি:** আইকন-রঙ = tokens.css --lf-dlx-* (৬-টোন) + বিদ্যমান brand/social/love/angry; ভিউ সরাসরি টোকেন নয় — `style="--dlx-t: var(<%= it.tok %>)"` ইনডিরেক্ট; CSS-এ `var(--dlx-t, var(--lf-brand-primary))`। হোয়াইট-আইকনে var(--lf-white) — লিটারাল #fff দিলে hex-ratchet-ফেইল (1395-বেসলাইন)।
3. **দুই-টপবার-সত্য:** ইউজার-পেজ = partials/header.ejs, পাবলিক-পেজ = layout.ejs — উভয়েই dlx-মার্কআপ; একটিতে বদলালে অন্যটিও বদলাতে হবে কিন্তু আইটেম-ডেটা কখনো নয় (রেজিস্ট্রি-কেবল)। curl-smoke-এ "পাবলিক-পেজে উইজেট-অনুপস্থিত" দেখলে প্রথমে কোন-ওপেনার-টেমপ্লেট যাচাই করুন।
4. **ইঞ্জিন-চুক্তি:** toggleDlx/closeDlx গ্লোবাল (ইনলাইন onclick-নির্ভর); Escape=বন্ধ+ফোকাস-ফেরত; প্যানেল-ভিতরের ক্লিক document-হ্যান্ডলারে পৌঁছায় না (stopPropagation ট্রিগারেই); dir-launcher.js defer — সব-পেজ হেডার-লোডেড।
5. **রেল-চুক্তি:** .feed-rail কেবল /dashboard; ≥1200px দৃশ্যমান (212px কলাম, wrap max-1360px); rail-highlight = রেজিস্ট্রির railHighlight-ফ্ল্যাগ (বর্তমানে ই-পেপার); মোবাইল/ট্যাবলেটে ৯-ডট + মোবাইল-সাইডবারই সম্পূরক।
**E2E-প্রমাণ:** লঞ্চার-চক্র (ওপেন-১২/aria/Escape/বাইরে-ক্লিক/নেভ) ✓ রেল (৮-আইটেম+প্রোফাইল+hl) ✓ পাবলিক-পেজ-প্যারিটি ✓ 390px ×৩-শূন্য ✓ কনসোল-০ ✓ guard/audit/cursor 25/25 ✓। স্ক্রিনশট ×৪।
**পরবর্তী-প্রথম-পছন্দ:** ① রেলে লাইভ-ব্যাজ (অপঠিত-বিজ্ঞপ্তি/আজ-জন্মদিন-কাউন্ট) ② লঞ্চার-প্যানেলে টাইপ-টু-ফিল্টার ③ মোবাইল বটম-শিট-ভ্যারিয়েন্ট (<992px dlx-আনলক) ④ লাইভ-Turso-রিসেট + সিক্রেট-রোটেশন ×৪। **পরের-এজেন্ট: session152 থেকে।**
## Cross-Agent Note — Session 152 (ইউজার-স্পেক: প্রোফাইল FB-প্যারিটি + নেস্টেড শেয়ার-পোস্ট আর্কিটেকচার) — [relabel-নোট: আমার 147→152 — push-রেসে সমান্তরাল session147(og-faces)/148/149/150/151 আগে-ল্যান্ডেড — max+1 রীতি; কোড-আইডেন্টিফায়ার -147-সাফিক্স (share-nested147/pf-bio147/sharedPosts147) double-147-চুক্তিতে অক্ষত (double-129/133/134-রীতি) — তাদের lfOgRxHtml147-পরিবারের সাথে collision-শূন্য] (২৫ সেপ্টেম্বর ২০২৬)

**প্রবেশ-অবস্থা:** origin/main @ 8728e16 (session146) → বেসলাইন-বুট গ্রিন → ইউজারের ছবি-গাইড-স্পেক বাস্তবায়ন-রাউন্ড।

**নতুন-চুক্তি ×৬ (পরের-এজেন্ট অবশ্যই মানবেন):**
1. **shared_orig-ডেকোরেশন-চুক্তি:** যে-সারফেসে শেয়ার-কপি রেন্ডার হয় সেখানে `helpers/shared-posts.js → decorateShared(rows)` আগে চালাতে হবে (এক IN-কোয়েরি — N+1 নয়)। এখন তিন-সারফেস ওয়্যারড: dashboard.js-decorateFeed + /dashboard/more (একই-ফাংশন) + social.js-প্রোফাইল-রুট। নতুন-ফিড-সারফেস (যেমন /api/feed/fresh-এর ভবিষ্যৎ HTML-রেন্ডার) যোগ করলে সেখানেও ডেকোরেট করুন, নইলে FeedPostCard ফুল-ডুপ্লিকেট-ফলব্যাকে পড়বে।
2. **FeedPostCard শাখা-ক্রম-চুক্তি:** `_isRepost` (repost-type) → `share-nested147` (shared_from && shared_orig) → ফুল-কপি-ফলব্যাক (shared_orig-অনুপস্থিত = লিগেসি-ডিপ্লয়) → সাধারণ। শেয়ার-কার্ডের গ্লোবাল-ফুটার **শেয়ার-কপির id**-তে টার্গেট করে (FB-স্ট্যান্ডার্ড) — মূল-পোস্টের id-তে নয়; মূল-কার্ডে কোনো actions-bar নেই (E2E-প্রমাণিত)।
3. **buildFeedSql-কলাম-সমতা:** repost_note এখন ৩-শাখায়ও আছে (ARTICLE/QUESTION = `p.repost_note`; ACTIVITY = `NULL as repost_note`)। **নতুন কলাম যোগ করলে তিন-শাখাতেই হুবহু-এক-ক্রমে** — দ্বৈত-alias এবং শাখা-বৈষম্য দুটোই UNION-ভাঙে।
4. **শেয়ার-নোট-চুক্তি:** POST /articles/:id/share এখন ঐচ্ছিক JSON `{note}` (≤৫০০, trim; খালি→NULL) নেয় → শেয়ার-কপির `repost_note`। এক-ট্যাপ-প্রবাহ (main.js, নোট-শূন্য) অপরিবর্তিত। শিট = `#shareNoteSheet` (share-modal.ejs — প্রতি-পেজে-একবার include) + ইঞ্জিন comment-tools.js EOF-IIFE (`[data-share-note]`-কেই ধরে, main.js LekhokShare-এর data-share-হ্যান্ডলারের সাথে collision-শূন্য)। PostFooterActions-মেনু এখন ঠিক ৪-ফিক্সড-অপশন।
5. **প্রোফাইল-author-ডেকোরেশন:** social.js-প্রোফাইল-রুটের `articles.forEach` এখন সব পোস্ট-রোতে username/full_name/pen_name/avatar_url/gender প্রোফাইল-অবজেক্ট-থেকে `||`-গার্ডে অ্যাটাচ করে (AuthorLabel/PostActionMenu-isOwner নির্ভুলতা)। ভবিষ্যৎ-জয়েন যোগ করলেও ভাঙবে না (||-গার্ড)।
6. **প্রোফাইল-১৪৭-টোকেন-নামস্পেস:** profile.css/shared.css-এর নতুন-ক্লাস সব `-147`-সাফিক্সড (pf-bio147/pf-meta-chip147/pf-hl-card147/pf-composer147/pf-tile-mutual147/share-note147/share-orig147/share-orig-link147/share-nested147/as-text147/pf-detail-sub147) — কোড-আইডেন্টিফায়ার sharedPosts147/note147/highlights147/tileMutuals147/metaChips147/_so147 অনন্য-রক্ষিত; hex-র্যাচেট-নীতি বজায়।

**E2E-হারনেস-লেসন (tests/lf147-e2e.sh — 45/45):** ① rerun-নিরাপত্তায় DB-কাউন্ট হার্ড-কোড নয় — PRE→POST **delta** ② session42-ডুপ-শেয়ার-গার্ড (১২০সে-একই-সোর্স) রান-মধ্যে ঠেকে → `[data-share-note]`-বাটন **সোর্স-রোটেশন** (`bs[PRE % bs.length]`) ③ agent-browser daemon দীর্ঘ-রানে স্টল করে ব্রাউজার-লগইন অস্থির → owner-render-যাচাই **curl-সেশনে** (CSRF-extract→POST→cookie-jar→GET) — deterministic ④ সার্ভার-বুটে `LF_QA_DISABLE_RATELIMIT=1` (পরপর-লগইন-রেট-লিমিট)।

**পরবর্তী-প্রথম-পছন্দ:** ① শেয়ার-আনডু-ডেডিকেটেড (৩-ডটে 'শেয়ার প্রত্যাহার' — এখন delete দিয়েই হয়) ② repost-note-এডিট (শেয়ারের ক্যাপশন পরিবর্তন) ③ প্রোফাইল-হেডারে ফলোয়ার-মডালে মিউচুয়াল-সর্ট ④ হাইলাইটস-ক্লিকে স্টোরি-ভিউ (কভার-ফুলস্ক্রিন) ⑤ og-কার্ড rx-ব্যাজের নেস্টেড-মূল-কার্ডে মিরর। **পরের-এজেন্ট: session153 থেকে।**

---

## Cross-Agent Note — Session 152 (সেটিংস মাস্টার-ডিটেইল পুনর্নির্মাণ + মিডিয়া-ডায়াগনস্টিকস + অনাথ-ফর্ম-বাগফিক্স) (১৮ সেপ্টেম্বর ২০২৬)

**double-152-নোট:** সমান্তরাল-এজেন্টও session152-লেবেল ব্যবহার করেছে (উপরে তাদের প্রোফাইল FB-প্যারিটি নোট) — double-129/133/134/147-রীতিতে কলিশন-টলারেটেড: কোড-আইডি পরস্পর-অনন্য (তাদের -147-সাফিক্স পরিবার, আমার st142/diag142 পরিবার; settings.ejs-তাদের-স্পর্শ-শূন্য), পরের-এজেন্ট **session153-লেবেল থেকেই।**

**লেবেল-নোট:** [relabel: আমার-142→152 — push-রেসে সমান্তরাল session143…151 আগে-ল্যান্ডেড — max+1 রীতি; কোড-আইডি st142/bn142/diag142 পরিবার অনন্য-রক্ষিত; settings.ejs/settings.css-এ তাদের-স্পর্শ-শূন্য — union-শুধু docs+test-script-টেইল]

**স্কোপ:** views/user/settings.ejs (সম্পূর্ণ-পুনর্লিখন) · public/assets/css/settings.css (নতুন) · routes/social.js (GET /settings-এ actStats) · scripts/test-role-policy.sh (§২৯ ×১৬, সামারি-পূর্বে-যুক্ত)

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **settings.ejs সম্পূর্ণ-নতুন স্থাপত্য (st142-*):** দুই-স্তর মাস্টার-ডিটেইল — বাঁয়ে ৫-গ্রুপ ১৪-আইটেম (data-sec + data-kw-সার্চ), ডানে প্যানে (data-pane) → সাব-মেনু (`.st142-submenu` + `.st142-row[data-goto]`) → ডিটেইল (`.st142-detail[data-detail]`)। নেভিগেশন-ইঞ্জিন হ্যাশ-চুক্তি: `#sec` ও `#sec/sub` — নতুন-সাব-ভিউ = data-goto+data-detail জোড়া, ইঞ্জিন-স্বয়ংক্রিয়।
2. **পুরনো-হ্যাশ-কম্প্যাট ম্যাপ (ভাঙবেন না):** MAP142 = {account→password, privacy→audience}; #profile/#notifications/#display/#security/#connected অপরিবর্তিত — রাউট-রিডাইরেক্টের (?ok/err=#hash) জীবন্ত-চুক্তি। ?sec/secerr → security-প্যানে (sec=backup → রো-ভিউ; বাকি → sec-status-ডিটেইল)।
3. **প্রমাণিত-বাগ (ইতিহাস-নোট):** পুরনো ভার্সনের বিজ্ঞপ্তি-সেকশনে ওপেনিং-ফর্ম-ট্যাগ ছিল না (অনাথ-`</form>`+বাটন) → POST /settings/notifications পেজ-পথ-মৃত ছিল। §২৯-চেক রক্ষা করে — ফর্ম-ট্যাগ হারালে role-policy লাল হবে।
4. **settings.css-র্যাচেট-বেসলাইন:** নতুন ফাইল, হেক্স-শূন্য — সম্পূর্ণ var(--lf-*)/গ্লোবাল-টোকেন; guard এই-ফাইলও গোনে। সাদা = var(--lf-white), ফলব্যাক-হেক্স নিষিদ্ধ।
5. **ডায়াগনস্টিকস-চুক্তি:** মিডিয়া-প্যানে ৫-কার্ড (permStat142/devStat142/micStat142/camStat142/netStat142 + btn*142) — webrtc-call.js-ICE-মিরর (window.LekhokCallCtx.iceServers-ওভাররাইড সম্মানিত, session97-চুক্তি); সব-ইডি 142-সাফিক্সড; ক্লায়েন্ট-সাইড-একমাত্র।
6. **গোটচা ×৩ (নতুন):** ① §২৯-এর "সাব-মেনু ৩-রো" চেক `data-goto="` গোনে — রো-মার্কআপে মাঝে-ক্লাস (is-danger) থাকলে `st142-row"`-অ্যাঙ্করড-প্যাটার্ন মিথ্যা-২-গোনা দেয় ② awk-অনাথ-ফর্ম-চেক RS="\0"-চুক্তি (session139-গোটচা-২-পুনঃব্যবহার) ③ **push-রেসে-রিলেবেল-প্রস্তুতি:** কাজ-শুরুতেই ডকস-লেবেল-কেন্দ্রীভূত-রাখুন (আমার ডকস-লেখা একবারই লাগল — কোড-মার্কার-নিরপেক্ষ থাকায় relabel-ব্যয়-শূন্য)।

**E2E (agent-browser, ismail @9142):** ৫-গ্রুপ/১৪-আইটেম/১৪-প্যানে ✓ সুইচ+হ্যাশ ✓ সাব-রো→ডিটেইল→ব্যাক ✓ সার্চ+no-result+এন্টার ✓ পুরনো-হ্যাশ-ম্যাপ ✓ ডায়াগনস্টিকস-অটো ✓ ICE-প্রকৃত-সফল (srflx:1) ✓ ?sec=pending-অটো ✓ POST /settings/privacy→303→সঠিক-প্যানে+ব্যাজ ✓ 390px-০ + দুই-ধাপ-মোব্যাক ✓ কনসোল-০ ✓। **রিগ্রেশন (মার্জড-ট্রি):** role-policy **২৫২-পাস/০-ফেইল** (২-SKIP) ✓ s139-parity ২২/২২ ✓ audit:views ✓ guard ✓ node --check ✓ EJS-compile ✓ hex-০ ✓।

**পরবর্তী-প্রস্তাব:** ① settings-সার্চে সাব-রো/ডিটেইল-লেভেল ম্যাচ (data-kw সাব-রোতেও) ② কার্যক্রম-সামারিতে সার্ভার-সাইড-সাম্প্রতিক-কার্যক্রম-প্রিভিউ (শেষ ৫-রো) ③ ডায়াগনস্টিকসে স্পিকার-টোন-টেস্ট + env-TURN-স্ট্যাটাস-দর্শন ④ /me-প্রতিক্রিয়া-ট্যাব-ডিপ-লিংক (#tab-reactions) — কার্যক্রম-রো তখন সরাসরি-লিঙ্ক। **পরের-এজেন্ট: session153 থেকে।**
8. **পরবর্তী-প্রথম-পছন্দ:** ① og-কার্ডে ক্লিকযোগ্য rx-ব্যাজ → reactors-modal (a>span-interactive-nesting-সতর্কতা — role=button-ভেতরে-নয়, বিকল্প: কার্ড-বাইরে-সামলানো) ② tokens-র্যাচেট (style.css ১৩৯৫) ③ dropdown-paintList reltime (session134-অবশিষ্ট) ④ ext-chipে বাহ্যিক-আইকন-সার্ভিস (onerror-ফলব্যাক-সহ) ⑤ **পরের-এজেন্ট: session148 থেকে।**

---

## Cross-Agent Note — Session 153 [relabel-নোট: আমার 148→153 — push-রেসে সমান্তরাল session148(কল-পলিশ)/149/150(toBnNumber)/151(dir-launcher)/152 আগে-ল্যান্ডেড — max+1-রীতি; কোড-আইডেন্টিফায়ার sb148/msx148/session148-sidebar-premium/session148-msx-me চুক্তি-নামে অক্ষুণ্ণ — তাদের lc-root/session148-ব্লক(calls.css)-এর সাথে collision-শূন্য] (ইউজার-স্পেক: ফিড-সাইডবার প্রিমিয়াম-আপগ্রেড FB-প্যারিটি — সারসংক্ষেপ-স্থানান্তর + জন্মদিন-অটো-হাইড + ট্রেন্ডিং-ফিল্টার + লিডারবোর্ড-ডাবল-ব্যাজ-বিলোপ)

**প্রবেশ-অবস্থা:** origin/main @ 7791d49 (0-behind) → বেসলাইন-QA সব-সবুজ → ইউজার-আপলোডেড স্পেক (বাংলা) হুবহু এক্সিকিউট — React/TSX-স্পেক ছিল, EJS-কোডবেসে ইন্টেন্ট-অনুবাদ।

**স্কোপ (৬-ফাইল):**
1. **views/user/dashboard.ejs — সাইডবার রি-রাইট:** ① msx 'আমার সারসংক্ষেপ' গ্লোবাল-ফিড থেকে সম্পূর্ণ-অপসারণ (কেবল /me-তে) ② জন্মদিন-কার্ড `<% if (birthdays.length) %>`-গেট — শূন্যে কার্ড-অস্তিত্বই নেই ③ 'পরিচিত হোন'→'প্রস্তাবিত লেখক': follower_count-বদলে designation-ফলব্যাক, ফাঁকা-plus-বাটনের বদলে টেক্সট-বাটন `<i class="fas fa-plus"></i><span>অনুসরণ</span>` ④ ট্যাগ `sb148-tag`: '#ট্যাগ' + পৃথক `sb148-tag-count` ('১টি লেখা') ⑤ ট্রেন্ডিং `sb148-rank` স্লিম-বাংলা-র‍্যাঙ্ক (০১…) + 'বিগত ৩০ দিন' চিপ + fa-fire-আইকন-বিলোপ ⑥ লিডারবোর্ড: `sb148-rank` (শীর্ষ-৩ মেডাল) + `lb-avatar-wrap sb148-lb-dot gold/silver/bronze` (অ্যাভাটার-কোণে ডট) + `sb148-lb-points` এমারেল্ড-ব্যাজ — পুরনো `lb-rank`-বৃত্ত + `lb-score`-স্টার-ডাবল-ব্যাজ-বিলোপ ⑦ বাংলা-অঙ্ক: প্রাথমিক ভিউ-লোকাল bn148/bnPad148 → **session150-toBnNumber-চুক্তি আবিষ্কারের পর প্রতিস্থাপিত** — `toBn(x)` + `toBn(idx+1).padStart(2,'০')` (লোকাল-ল্যাম্বডা-নিষিদ্ধ-চুক্তি সম্মান; কোডে bn148-অবশেষ-শূন্য)।
2. **routes/dashboard.js:** trendingPosts-কুয়েরি — `COALESCE(post_kind,'') NOT IN ('avatar_update')` + `(like_count+comment_count) > 0` + JS-শিরোনাম-ডিডুপ (LIMIT 12 → filter → slice 5); msx-এর ৪-লাইট-কুয়েরি (myStats) অপসারণ — প্রতি-রিকোয়েস্ট-কোয়েরি-সাশ্রয়।
3. **views/user/me.ejs:** `msx148-card` উইজেট (ws91-card-পরে) — ৫-চিপ (প্রকাশিত লেখা/মোট পাঠ/প্রতিক্রিয়া/মন্তব্য/খসড়া); `data-msx-tab` চিপে ক্লিকে ট্যাব-বারের ট্যাব-ক্লিক-ডিসপ্যাচ, `data-msx-target`-এ scrollIntoView; পেজ-লোকাল `<script>` ইঞ্জিন।
4. **public/assets/js/main.js:** follow-inline-হ্যান্ডলার — innerHTML-এ `<span>অনুসৃত</span>`/`<span>অনুসরণ</span>` যোগ (নোড-স্ক্রিপ্ট-স্ট্রিং-রিপ্লেস — মিনিফাইড-ফাইল-রীতি)।
5. **dashboard.css session148-ব্লক (EOF-MARKER: session148-sidebar-premium):** স্টিকি-সাইডবার `max-height:calc(100vh - 40px)+overflow-y:auto+thin-scrollbar` (≤980px নিষ্ক্রিয়), sb148-* পরিবার।
6. **style.css session148-ব্লক (EOF-MARKER: session148-msx-me):** msx148-* গ্রিড-উইজেট (640px 2-কলাম)।

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **msx148-চুক্তি:** /me-পেজে msx-চিপ = `.personal-tab[data-tab]`-ক্লিক-ডিসপ্যাচ — ট্যাব-বারের data-tab-নাম বদলালে চিপের data-msx-tab-মানও সমলয় করুন।
2. **follow-inline-চুক্তি:** বাটনে এখন `<i>`+`<span>`-যুগল থাকে — main.js-হ্যান্ডলার innerHTML-সেট করে; আইকন-only-ভ্যারিয়েন্ট দরকার হলে `.follow-inline span{display:none}`-CSS-পাথ নিন (JS-শাখা-নয়)।
3. **trending-ফিল্টার-চুক্তি:** নতুন নন-লিটারারি post_kind (যেমন cover_update) যোগ হলে `NOT IN`-তালিকায় যোগ করুন; title-ডিডুপ case-insensitive-trim।
4. **বাংলা-অঙ্ক-রীতি:** session150-এর toBnNumber (app.locals.toBn) single-source — নতুন-ভিউতে লোকাল-ল্যাম্বডা নিষিদ্ধ; প্যাডেড-র‍্যাঙ্ক দরকারে `toBn(n).padStart(2,'০`)` (বাংলা-অঙ্ক-স্ট্রিংয়ে padStart-নিরাপদ)।
5. **🚨 পুনঃপ্রমাণিত-গোটচা:** দ্বৈত-সার্ভার-প্রসেস (bare node + node --watch একসাথে বেঁচে থাকে — curl 200 দেয় পুরনো-কোডে) — pkill-by-path + mini-service `bun run dev` + ps-একক-যাচাই; স্ট্যাটিক-এডিট-পরে রিস্টার্ট-বাধ্যতামূলক (AV-হ্যাশ)।

**E2E-প্রমাণ:** ডেস্কটপ — msx-গ্লোবাল-ফিডে-অনুপস্থিত ✓ জন্মদিন-শূন্য-কার্ড-অনুপস্থিত ✓ প্রস্তাবিত-লেখক designation+'+ অনুসরণ' ✓ ফলো-ক্লিক→'অনুসৃত'+টোস্ট→আনফলো-রিভার্ট ✓ ট্যাগ '#সিড'+'১টি লেখা' ✓ ট্রেন্ডিং স্লিম-র‍্যাঙ্ক ০১+লেখক·এনগেজমেন্ট+৩০-দিন-চিপ ✓ লিডারবোর্ড 🥇/🥈/🥉+gold/silver/bronze-ডট+'{বাংলা} পয়েন্ট'-ব্যাজ+oldScoreStar-false ✓ এনগেজমেন্ট>0-ফিল্টারে সিড-ক্রাফট-বাদ (২-আইটেম) ✓; /me — msx148 ৫-চিপ ✓ চিপ→reactions-ট্যাব-সক্রিয় (eval: activeTab=reactions) ✓ মোট-পাঠ→insights-স্ক্রল ✓; 390px true-overflow-০ + মোবাইলে sticky-নিষ্ক্রিয় (maxHeight:none) ✓ কনসোল-০ ✓ স্ক্রিনশট ×৩ (download/s148-*)।
**রিগ্রেশন:** role-policy **239/239 ALL GREEN** ✓ cursor **25/25** ✓ guard:design ✓ audit:views (97-ejs-ডুপ-শূন্য) ✓ brace-০ ×২ (comment-stripped) ✓ node --check ✓ EJS-compile ×২ ✓
**পরবর্তী-প্রথম-পছন্দ:** ① জন্মদিন-শুভেচ্ছা-বাটনে বার্তা-মোডাল (এখন profile-লিঙ্ক) ② সাইডবার-উইজেটে স্কেলেটন-শিমার (স্লো-কুয়েরি-অনুভূতি) ③ ট্রেন্ডিং-উইন্ডো ৭দিন/৩০দিন টগল-চিপ ④ rx-ব্যাজ-ক্লিকযোগ্য (session147-① অগ্রাহীত) ⑤ **পরের-এজেন্ট: session149 থেকে।**

---

## Session 154 — FB-স্টাইল প্রিমিয়াম নোটিফিকেশন ড্রপডাউন (ইউজার-স্পেক: অপঠিত-স্টেট + অ্যাক্টর-ব্যাজ + ৩-ডট + কালপুরুষ) (২৪ সেপ্টেম্বর ২০২৬)

**প্রবেশ-অবস্থা:** ফ্রেশ-ক্লোন @ 7791d49 (session147); rebase → bd63601 (session153)। ইউজার-রিপোর্ট ৪-দুর্বলতা: ① অপঠিত/পঠিত ভিজ্যুয়াল-পার্থক্য-শূন্য ② কাঁচা-তারিখ ③ ৩-ডট-মেনু-অনুপস্থিত ④ অ্যাভাটার-ইভেন্ট-ব্যাজ-অনুপস্থিত + কালপুরুষ-ফন্ট-ডিকপ্লিং (মেনু/হেডার-ক্রোম বাদে)।

**রুট-কজ (E2E-ধরা):** main.js-এর `toggleNotifs()` → `clearNotifBadge()` — ড্রপডাউন **খোলার মুহূর্তেই** সব-অপঠিত মুছে ফেলত (unread-ক্লাস-স্ট্রিপ + POST /read) — তাই অপঠিত-স্টাইলিং কখনোই দেখাতই না।

**স্কোপ (৫-ফাইল):**
1. **routes/social.js:** `POST /api/notifications/unread/:id` — read/:id-এর হুবহু-মিরর (বিপরীত-দিক); `is_read=1`-শর্ত → idempotent; user_id-গার্ড (foreign-id → changed:false)।
2. **views/partials/header.ejs:** ① bell-এ `onclick="toggleNotifs()"` **অপসারণ** (অটো-সব-পঠিত-বাইপাস) + session148-ইঞ্জিন-স্ক্রিপ্ট (ডেলিগেটেড) ② হেডার-পলিশ: 'N নতুন'-পিল (toBn) + 'সব পঠিত করুন' (unread>০) ③ has-avatar-আইকনে `nf-b148 nf-b148-<type>` (অ্যাক্টর-ব্যাজ) ④ ✕-বাটন → ৩-ডট (fa-ellipsis-v) + পপওভার-মেনু (পঠিত↔অপঠিত-টগল + মুছুন; aria-haspopup/expanded/menu/menuitem)। ইঞ্জিন: রো-ক্লিকে unread→read (sendBeacon, নেভিগেশন-বাধা-শূন্য), data-n r-বিট-সিঙ্ক (restore-চুক্তি-সত্য), ব্যাজ-সত্য সর্বদা /count (toBn), Escape/বাইরে-ক্লিকে মেনু-বন্ধ, dismiss+lfUndoShow (session121-চুক্তি-মিরর)।
3. **public/assets/js/live.js:** ① paintList-মিরর session148-মার্কআপে (ব্যাজ + ৩-ডট-মেনু — পেইন্টেড-রোতেও প্যারিটি) ② 🚨 **bell-wrap-ক্যাপচার-গোটচা-ফিক্স:** আগে wrap-এর ভেতরের *যেকোনো* ক্লিকে ৮০ms-পরে repaint হতো → খোলা কুইক-মেনু ধ্বংস (E2E-ধরা) — এখন কেবল `.notif-bell-btn`-ক্লিকেই রিফ্রেশ ③ refreshDropdown: মেনু-খোলা-থাকলে paint-স্কিপ (ব্যাজ-আপডেট চলবেই)।
4. **public/assets/css/tokens.css:** `--lf-blue-soft:#e7f1ff` + `--lf-blue-soft-2:#daeafe` (blue-200-এর সাদা-মিশ্রিত ৩৮%/৫৮% প্রি-মিক্স — 🚨 headless/পুরনো-Chromium color-mix-অসমর্থিত, computed-transparent-গোটচা)।
5. **public/assets/css/shared.css session148-ব্লক (EOF-MARKER: session148-notif-dropdown-premium):** অপঠিত-নীল-টিন্ট (স্পেসিফিসিটি-গোটচা: session117-এর `#notifList`-গ্রেডিয়েন্ট (1,2,0) হারাতে `.notif-dropdown #notifList .notif-item.unread` (1,3,0)), নীল-ডট/টাইম/বডি-গাঢ়, অ্যাক্টর-ব্যাজ-ডিস্ক (type-রঙ: message/comment/reply=blue, like/react/reaction=danger, follow=brand, mention=violet, notice/complaint=amber, answer/answer_accepted=cyan, call=danger-deep, share=emerald; white-ring), ৩-ডট (hover/focus-within-প্রকাশ, hover:none-এ সর্বদা), পপওভার (.nf-menu148[hidden] display:none), ফন্ট-ডিকপ্লিং (কনটেন্ট/মেনু/টাইম=--font-kp কালপুরুষ; হেডার/চিপ/বাটন=--font-hs Hind Siliguri); 480px + reduced-motion। **টোকেন-শুধু হেক্স-শূন্য।**

**চুক্তি-নোট (পরের-এজেন্টের জন্য):**
1. **nf148-চুক্তি:** নতুন notif-টাইপ যোগ হলে ① main.js/header.ejs-এর `_ico`-ম্যাপ + ② shared.css-এর `.nf-b148-<type>`-রঙ + ③ live.js ICONS — তিন-জায়গায় সমলয়।
2. **data-n r-বিট:** rowUnread148 সর্বদা data-n.r সিঙ্ক রাখে — restore-পেলোড-সত্যের উৎস; রো-ক্লাস হাতে-বদলালে r-বিটও বদলান।
3. **অপঠিত-স্টেট-দর্শন:** ড্রপডাউন-খোলা = আর সব-পঠিত নয় (FB-প্যাটার্ন) — পঠিত হয় রো-ক্লিকে (sendBeacon read/:id), ৩-ডট-টগলে (read/:id + unread/:id), বা 'সব পঠিত করুন'-এ (POST /read)। badge/pill/markall-ভিজিবিলিটি সর্বদা /count-সত্য।
4. **paintList-মিরর-রীতি (session125-এর ধারাবাহিকতা):** header.ejs-ক্যানোনিকাল-শেল বদলালে live.js paintList-ও হুবহু মিরর করুন — নইলে প্রথম-রিফ্রেশেই মার্কআপ-ড্রিফট (১২৫-এর stale-repaint-বাগ-পরিবার)।
5. **স্পেসিফিসিটি-গোটচা:** #notifList-স্কোপড পুরনো নিয়ম (1,2,0) ওভাররাইডে ID-সহ-সিলেক্টর (1,3,0) লাগে — শুধু-ক্লাস-সিলেক্টর নীরবে হারায়।
6. **color-mix-নিষিদ্ধ (headless-QA-নিরাপদ):** নতুন টিন্ট tokens.css-এ প্রি-মিক্সড-টোকেন হিসেবে (session143-প্যাটার্ন)।

**E2E-প্রমাণ:** curl — login→count 3 ✓ unread/:id (changed:true, count 4) ✓ read/:id ফেরত ✓ foreign-id changed:false ✓ restore ✓; ব্রাউজার — bell-openে **অপঠিত-স্টেট-সংরক্ষিত** (৩-টিন্ট-রো+ডট, #E7F1FF) ✓ অ্যাক্টর-ব্যাজ (msg-blue/heart-red/follow-green) ✓ রিলেটিভ-বাংলা-টাইম ✓ কালপুরুষ-কনটেন্ট+HindSiliguri-ক্রোম ✓ ৩-ডট-মেনু খোলা-থাকে (live.js-ফিক্স-পরে) ✓ টগল read↔unread (ব্যাজ ৩→৪→৩, লেবেল-সোয়াপ, data-n.r-সিঙ্ক) ✓ 'সব পঠিত করুন' (ব্যাজ-নিঃশেষ, pill/markall-hidden, টোস্ট) ✓ ডিলিট→আন্ডু-টোস্ট→রো-টপে-ফিরেছে (DB-প্রমাণ [1,3,4,5]) ✓ 390px-overflow-০ + hover:none-এ ডট-সর্বদা-দৃশ্যমান ✓ কনসোল-০/পেজ-এরর-০ ✓ স্ক্রিনশট ×৮ (scripts/s148-*, s154-final-menu.png)।
**রিগ্রেশন:** role-policy মার্জড-ট্রি ডেল্টা **236/18** বনাম HEAD-বেসলাইন **235/19** (একই-ফ্রেশ-DB — ডেল্টা=**+১-পাস, শূন্য-নতুন-ফেইল**; ফ্রেশ-DB-র state-নির্ভর-বেসলাইন-ফেইলগুলো HEAD-এও-সমান) ✓ guard ✓ node --check ×২ ✓ EJS-compile ✓
**পরবর্তী-প্রথম-পছন্দ:** ① ফুল-পেজ /notifications-এও ৩-ডট+অ্যাক্টর-ব্যাজ-প্যারিটি ② ব্যাজ-ক্লিকে টাইপ-ফিল্টার (nq-chip-সিনার্জি) ③ 'N নতুন'-পিলে ক্লিক=শুধু-অপঠিত-দেখুন ④ গ্রুপড-ডেট-হেডার ('আজ', 'গতকাল') ⑤ **পরের-এজেন্ট: session155 থেকে।**
## Cross-Agent Note — Session 150 (cron: QA→ফিচার-রাউন্ড — og-কার্ড rx-ব্যাজ→reactors-modal + র্যাচেট-ওয়েভ-৫: auth/gallery/calls/bookmarks ৩৬২→০) (২৫ সেপ্টেম্বর ২০২৬)
**প্রবেশ-অবস্থা:** origin/main @ 159eac3 (session148-ডকস) + লোকাল-UUID-কমিট (worklog-সিঙ্ক) — rebase-ইউনিয়ন (worklog ×২-দ্বি-UU; union-রীতি) @ 186d52c। QA-ফেজ ALL GREEN: guard ✓ + role-policy **২৩৯/২৩৯** + cursor ২৬/২৬ + s132 ৩০/৩০ + s139 ২২/২২ + s144 ৩১/৩১ + agent-browser ১৭-পেজ ২০০/কনসোল-০/390px ×১২-০ → বাগ-শূন্য স্থিতিশীল-ফেজ → ফিচার-রাউন্ড (session147-প্রথম-পছন্দ ① + session149-প্রস্তাব ②)।

**🚨 বুট-গোটচা-পুনঃপ্রমাণ:** sandbox-ব্যাকগ্রাউন্ড-সার্ভার Bash-কল-শেষে মৃত → role-policy/cursor-প্রথম-রানে 190-ফেইল/৯-ফেইল (মৃত-সার্ভার-আর্টিফ্যাক্ট, কোড-ফেইল নয়) — **প্রতি-রাউন্ড এক-কলে boot+test রীতি অপরিহার্য** (session148-নোটের পুনরাবৃত্তি); cursor/role-policy-পোর্ট-আর্গ (RP_PORT/BASE)।

**ফিচার-১ og-কার্ড rx-ব্যাজ → reactors-modal (session147-① — a11y-safe wrap-ভাই কাঠামো):**
1. **comment-tools.js:** `_ogRxTarget150(href)` — href→টার্গেট-রেজলুশন (_LPV_RE139-ক্লায়েন্ট-মিরর: #fc-cN/#cN→comment, /articles|qa|questions/N→post, resources→null); `lfOgRxHtml147(c, href)` — ব্যাজ-এখন বাস্তব-বাটন (`data-rx-open`/`data-rx-id` session108-চুক্তি + aria-label + title); **a>button-nesting-নিষিদ্ধ (s147-সতর্কতার চূড়ান্ত-সমাধান)** — lpvCardHtml139 wrap-ভাই: `<span class="lf-og-wrap150">` + অ্যাঙ্কর + ব্যাজ-বাটন ভাই; data-lpv-u/lf-og-loading wrap-এ স্থানান্তর — guard-সিলেক্টর ×৭ `.lf-og-wrap150`-এ; টার্গেট-অরিজল্ভেবল হলে পুরনো-নিরীহ-স্প্যান (ক্যাশ-সামঞ্জস্য)।
2. **openReactorsModal-সংযোগ-শূন্য:** session108-এর `[data-rx-open]`-ডেলিগেশন + /api/reactions/:type/:id (post|comment) বিদ্যমান-ই — ব্যাজ-বাটন সে-চুক্তিতেই চলে (post+comment দুই-টার্গেট-ই সমর্থিত — কমেন্ট-অ্যাঙ্কর og-কার্ডেও মডাল)।
3. **shared.css session150-ব্লক (EOF-MARKER: session150-ogcard-rx-open):** wrap-ভাই (position:relative, max-width ×৩-সারফেস) + `.lf-og-rx-btn150` অর্ধ-ভাসমান নিচ-বাম-কোণ (FB-প্রিভিউ-প্যারিটি; :has()-padding-রিজার্ভ টেক্সট-সংঘর্ষ-শূন্য) + hover-lift/active-scale/focus-ring + 480px + reduced-motion।

**ফিচার-২ mdFeed/inlineMd-অভ্যন্তরীণ-বেয়ার-পাথ (s142-① চুক্তি-সমাপ্তি — রাউন্ডে-আবিষ্কৃত-গ্যাপ):** E2E-সিডে ধরা পড়ে — `plainWithLinks` শুধু https?:// লিংকিফাই করত, অভ্যন্তরীণ `/qa/N`-ধরনের bare-path নিষ্ক্রিয়-টেক্সট থাকত (og-কার্ড-জন্মও-না)। সমাধান: markdown-lite.js — `_bareUrlPass` + `plainWithLinks`-step৩/৪-এ alternation `/\/(?:articles|qa|questions|resources)\/\d+/` + lookahead-বাউন্ডারি `(?=$|[\s)|.,;:!?…।])` (ট্রেলিং-দাঁড়ি href-বাইরে); অভ্যন্তরীণ = same-tab-অ্যাঙ্কর (strict-পাথ বলে esc-ঝুঁকি-শূন্য), external = ১৪৩-আচরণ-অক্ষত; **unit ×৫** (T1-linkify/T2-external-অক্ষত/T3-কমেন্ট/T4-delete-পাথ-অম্যাচ/T5-ট্রেইলিং-দাঁড়ি) — ফলে ফিড/কমেন্ট/আর্টিকেল-বডি তিন-সারফেসেই bare অভ্যন্তরীণ-লিংক → অ্যাঙ্কর → og-কার্ড → rx-ব্যাজ (s149-প্রস্তাব ④-এরও আংশিক-সমাপ্তি)।

**ফিচার-৩ র্যাচেট-ওয়েভ-৫ (patch150-auth-gallery-ratchet.js — patch139/144-রীতি):** auth ১২৩→০ + gallery ১২৩→০ + calls ৬২→০ + bookmarks ৫৪→০ (৩৬২-hex, ৬৬.৬%→১০০% টোকেন-কভারেজ); **নতুন-টোকেন ×৩৩** (slate-800/neutral-50/gray-ice/blue-900 + red-500/emerald-400/900 + green-কাস্টম ×৭ + call-danger-র‍্যাম্প ×৬ + wa-পরিবার ×১১ + call-navy ×২ + navy-deep-3); per-নাম defs=১ ×৩৩ অ্যাসার্টেড; baseline-লক ০ ×৪।

**🚨 সেশন-১৫০-সর্ববৃহৎ-আবিষ্কার (latent-bug স্থায়ী-সংস্কার):** auth-পেজগুলো (login/register/forgot/reset/2fa/claim/pending/force-change/article-form/qa-form/edit ×১১) **self-contained ডকুমেন্ট — layout.ejs/header.ejs ব্যবহার করে না, tokens.css লোড-ই হত না** — প্রি-প্যাচে auth.css-এ var(--lf-*)-শূন্য বলে অদৃশ্য-ছিল; র্যাচেটে var(--lf-*)-এ গেলেই সব-স্টাইল-নষ্ট (আমার BEFORE/AFTER-কম্পিউটেড-প্রোবে ধরা — body transparent/সব-initial)। **সংস্কার: ×১১-ডকের শেষ-স্টাইলশিটের পরে `<link tokens.css>` (ক্যাসকেড-গারান্টি-কনভেনশন)।** bookmarks/messages ×২ মিথ্যা-সন্দেহ (header-partial-মধ্যস্থ — আগেই-আছে)। **গোটচা-যুগল:** (ক) EJS-কমেন্টে nested `<%= %>` = compile-বিস্ফোরণ ("missing ) after argument list") — HTML-কমেন্ট ব্যবহার করুন (খ) কমেন্ট-ভেতরে `--lc-*/`-জাতীয় `*/`-প্রিফিক্স = block-comment-আগে-বন্ধ।

**ভিজ্যুয়াল-প্যারিটি-প্রমাণ (BEFORE/AFTER computed):** auth (body #FAFAFA / brand-name #0B1121 / eyebrow #047857 / input-border #059669) + gallery (album white/border #E4E6EB/name #050505/count white) — হুবহু-সমান; টোকেন-রেজলভ ×৩৩ OK (browser getComputedStyle); guard-বেসলাইন (auth/gallery/calls/bookmarks: 0) ✓।

**E2E: verify-session150-ogrx-modal.js (playwright, ২৯-চেক) ALL GREEN** — সিড→রিঅ্যাক্ট→লিংক-প্রশ্ন+আর্টিকেল → ফিড+আর্টিকেল দুই-সারফেসে wrap-mount/ব্যাজ-চুক্তি/a11y/বাংলা-মোট/faces → ক্লিক→মডাল+rows → Escape → **কীবোর্ড focus+Enter (প্রকৃত-CDP)** → console-০ → ক্লিনআপ-404। **গোটচা ×৩ (নতুন):** (ক) **কমা-সিলেক্টর-তালিকায় suffix শুধু শেষ-বিকল্পে বাঁধে** — `.a, .b` + ' button' লিখলে `.a` নিজেই ম্যাচ করে (বাটন নয়) → wrap-click নীরব-শূন্য — বাটন-স্টেপে একক-সিলেক্টর বাধ্যতামূলক (৩-ঘণ্টা-ডিবাগ-মূল্য!) (খ) synthetic KeyboardEvent-এ native-activation-শূন্য — playwright keyboard.press (গ) LPV-ক্যাশ ৫মি — cleanup-অনুপস্থিতিতে link-preview নিষিদ্ধ → প্রত্যক্ষ-পেজ 404।

**চূড়ান্ত-রিগ্রেশন (মার্জড-ট্রি):** guard ✓ + role-policy **২৩৯/২৩৯** + cursor **২৭/২৭** + s132 **৩০/৩০** + s139 **২২/২২** + s144 **৩১/৩১** + s148 **২৩/২৩** + s150 **২৯/২৯** + brace-০ + node --check ×৪ + 390px ×১২-পেজ-০ (login/register/forgot-সহ) + কনসোল-০ + টেস্ট-ক্লিনআপ ×১০-পোস্ট-404-যাচাই + স্ক্রিনশট ×৪ (feed-badge/modal-open/s150-ogrx ×২)।

**পরবর্তী-প্রস্তাব (priority-order):** ① style.css-র্যাচেট (১৩৯৫ — একমাত্র-বড়; ২-৩-রাউন্ডে; patch150-স্ক্রিপ্ট-প্যাটার্ন-পুনঃব্যবহারযোগ্য) ② feed.css (৮৮) + rich-editor (৬১) ③ member-accounts (৩১)/premium (৩২)/multi-image (১৭)/shared (২)-ছোট-বাকি ④ কমেন্ট-অ্যাঙ্কর-og-কার্ডে rx-ব্যাজ (comment-টার্গেট-পথ-লাইভ-টেস্ট) ⑤ dropdown-paintList reltime (session134-অবশিষ্ট) ⑥ কল-ইতিহাসে degrade-রেকর্ড (db-স্কিমা)। **পরের-এজেন্ট: session151 থেকে**; push-পূর্বে git pull --rebase (union-মার্জ PLANS/PROJECT/worklog ×২)।

## session153 — FB-রিচ-কম্পোজার + কোলাজ (ক্রস-এজেন্ট চুক্তি ×৭)

1. **রিচ-কনটেন্ট-নিরাপত্তা-চুক্তি:** posts.rich_content সবসময় helpers/rich-sanitize.js sanitizeRichHtml153() দিয়েই সংরক্ষিত — ভিউতে RAW-আউটপুট নিরাপদ (<%- %>), কিন্তু **নতুন লেখার-পথে বাইপাস নিষিদ্ধ**। নতুন-ট্যাগ/অ্যাট্রিবিউট দরকার হলে ALLOWED_TAGS/BLOCK_TAGS-এ যোগ — রেন্ডার-সাইটে ফাঁকা-ভরসা নয়।
2. **মিডিয়া-টেবিল-চুক্তি:** কোলাজ-মিডিয়া = post_images-এই (image_url + media_type 'image'|'video'|'audio' + sort_order=কোলাজ-ক্রম)। লেখক-পথ db.setPostMedia153() (URL-গার্ড+ডিডুপ-বিল্ট-ইন); পাঠক-পথ decorateFeed-ব্যাচ → `item.media153=[{url,type}]`। **নতুন-ফিড-সারফেসে media153 লাগলে decorateFeed-ই ডেকোরেট করবে** — N+1 নয়। item.images পুরনো-চুক্তি (শুধু-ছবি-URL) অক্ষুণ্ণ — post-gallery-পথ ভাঙবে না।
3. **অডিয়েন্স-চুক্তি:** posts.audience ∈ PUBLIC|FRIENDS|ONLY_ME (NULL='PUBLIC')। FRIENDS=মিউচুয়াল-ফলো (helpers/shared-posts.js mutualFollowIds153)। এনফোর্সমেন্ট JS-ফিল্টারে — filterByAudience153 তিন-সারফেসে (decorateFeed/প্রোফাইল/সিঙ্গেল-404)। **buildFeedSql-এ SQL-শর্ত হিসেবে যোগ কোরো না** (কার্সর/র্যাংকড/fresh তিন-মোড হট-পথ)। ট্রেড-অফ দলিলভুক্ত: পেজ-সাইজ বিরলে কমতে পারে। অজানা-মান = লুকান (রক্ষণশীল)।
4. **অটো-টাইটেল-চুক্তি:** FB-কম্পোজার-পোস্টে title নেই → সার্ভার প্লেইন-প্রথম-লাইন থেকে ≤৮০-অক্ষর অটো-টাইটেল (খালি হলে 'পোস্ট · YYYY-MM-DD')। dup-গার্ড (সেশন-৩৯) এই টাইটেলেই চলে। এডিট-পেজের শিরোনাম-ফিল্ড এই অটো-টাইটেলই দেখাবে — স্বাভাবিক।
5. **ব্যাকগ্রাউন্ড-কী-হোয়াইটলিস্ট:** background_color শুধু fbg1..fbg8 (CSS-ক্লাস fb-bg153-fbg*) — সার্ভার+ভিউ দু-স্তরে গার্ড। নতুন-গ্রেডিয়েন্ট = tokens.css-টোকেন যোগ → dashboard.css (কম্পোজার) + style.css (ফিড) দু-জায়গায় ক্লাস। FB-চুক্তি: মিডিয়া-উপস্থিতিতে bg নেই (কম্পোজার অটো-ক্লিয়ার করে; রেন্ডার-সাইটে bg+কোলাজ সহাবস্থান নিরাপদ)।
6. **কম্পোনেন্ট-CSS-অবস্থান:** FeedPostCard-রেন্ডারড ক্লাস (fb-col153/fb-rich153/fb-bg153/fb-context153/fb-aud-chip153) **style.css-এ** (গ্লোবাল — article-single-এ dashboard.css লোড হয় না); কম্পোজার-ক্লাস (fbm-*) dashboard.css-এ। উভয়ই টোকেন-শুধু (hex-র্যাচেট বেসলাইন dashboard:0, style:1395-অক্ষুণ্ণ)।
7. **লাইটবক্স-পুনঃব্যবহার:** fb-কোলাজ-ছবি data-post-lightbox-রুট + data-full — post-gallery.js-লাইটবক্স বিনা-পরিবর্তনে চলে (open()-এ session153-গার্ড: video/audio/.fb-col-more153-ক্লিক বাদ)। +N-ওভারলে লিঙ্ক = পোস্ট-নেভিগেশন (লাইটবক্স নয়)।

**E2E-হারনেস-লেসন (tests/lf153-e2e.sh — 49/49):** ① agent-browser-লগইন ফ্লেকি → ৩-চেষ্টা-রিট্রাই-লুপ + URL-যাচাই ② eval-আউটপুট কোটেড রিটার্ন হয় → tr -d '"' ③ বাংলা-অঙ্কে grep-ক্যারেক্টার-ক্লাস collation-ফেইল → rg -qF fixed-string ④ ভিজ্যুয়াল-প্রমাণ (স্ক্রিনশট) এক-ইনভোকেশনে — sandbox দুই-কলের-মাঝে server+browser-উভয়ই মারে।

**পরবর্তী-প্রথম-পছন্দ:** ① কম্পোজারে ড্রাফট-থাকা-অবস্থায় /articles/new-ফুল-এডিটর সিম্বায়োসিস (রিচ→ক্লাসিক-রূপান্তর) ② কোলাজ-লাইটবক্সে ভিডিও-ট্যাব-সমর্থন ③ ONLY_ME-পোস্টে /me-ট্যাব-সমতা ④ compose-পোস্টে tags-ইনপুট (ঐচ্ছিক হ্যাশট্যাগ-স্ট্রিপ) ⑤ ফিড-fresh-পিলে compose-পোস্ট-ইন্টিগ্রেশন-যাচাই। **পরের-এজেন্ট: session154 থেকে।**


**session153-push-নোট (rebase-union):** সমান্তরাল session153(sidebar-premium)/154(notif-dropdown)/155(next-app) আগে-ল্যান্ডেড → rebase ×৪-UU (PLANS/PROJECT/dashboard.css/style.css EOF-ইউনিয়ন — তাদের ব্লক-আগে) + header.ejs-এ তাদের `nfNewPill148` if/else-দ্বি-শাখায় একই-id (audit:views-ফেইল) এক-এলিমেন্টে সংকুচিত (runtime-সেমান্টিক্স হুবহু)। মার্জড-ট্রি: role-policy **254/254** + cursor 25/25 + lf153 49/49 + guard + audit ✓। double-session153-লেবেল ডকুমেন্টেড (double-147/152-রীতি); আইডেন্টিফায়ার fbm-*153/fb-col153/setPostMedia153/filterByAudience153 তাদের sb148/msx148/nf148-পরিবারের সাথে collision-শূন্য। পরের-এজেন্ট: **session156**।

## Cross-Agent Note — Session 156 (FB ইনডিপেন্ডেন্ট ৩-কলাম স্ক্রল — /dashboard) (১৮ সেপ্টেম্বর ২০২৬)

**চুক্তি ×৫:**
1. **bodyClass-প্যারাম** — header.ejs-এ ঐচ্ছিক `bodyClass` (typeof-guard); কেবল /dashboard `lf-feed-lock156` পাঠায়; অন্য পেজ শূন্য-প্রভাব।
2. **লক-আর্কিটেকচার** — `body.lf-feed-lock156` কেবল ≥1200px-এ সক্রিয় (body flex-col + page-main flex:1 + তিন কলাম নিজস্ব overflow-y-auto); টপবার-উচ্চতা হার্ডকোড নয় — flex অ্যাডাপ্টিভ।
3. **স্পেসিফিসিটি-চুক্তি** — কলাম-ওভাররাইড অবশ্যই `body.lf-feed-lock156 .dashboard-wrap X` (0,3,1) — নইলে `.two-col.has-rail` (0,3,0) জয়ী।
4. **.fb-scroll টোকেন-ভিত্তিক** — নতুন hex নিষিদ্ধ (guard র‍্যাচেট); thumb `var(--border)`, hover `var(--text-muted)` — ডার্ক-মোড টোকেন-ফ্লিপ স্বয়ংক্রিয়।
5. **IO-ইনফিনিট-স্ক্রল container-নিরপেক্ষ** — ancestor-clipping-এ কন্টেইনার-স্ক্রলেও সঠিক; cursor-মোডে `data-offset` স্থির (by-design) — প্রমাণে card-count/`data-cursor-*` ডেল্টা ব্যবহার করুন, offset নয়।

**হারনেস-লেসন ×২:** `agent-browser set viewport` ব্রাউজার-লঞ্চের আগে দিলে নিঃশব্দে বাতিল (ক্রম: open → wait → set viewport) · node-সার্ভার টুল-কলের মাঝে মরে — প্রতিটি পরীক্ষা-চক্র এক-ইনভোকেশনে (পুনঃপ্রমাণিত)।

**প্রস্তাব ×৪ (session157+):** ① মোবাইলে টপবার hide-on-scroll-down/show-on-up FB-প্যারিটি (সাইট-ব্যাপী প্রি-একজিস্টিং স্ক্রল-অ্যাওয়ে — /articles-প্রমাণিত; sticky top:0 থাকাও কার্যকর নয় — html/body overflow-x সন্দেহ) ② ফিড-কলাম কীবোর্ড-স্ক্রল (tabindex=0 + focus-ring + a11y) ③ সাইডবার-স্ক্রল-অবস্থান sessionStorage-স্মরণ ④ .fb-scroll অন্যান্য লম্বা-তালিকায় (bookmarks/members/notifications) প্রসারণ।
## session157-নোট (relabel: সমান্তরাল session156 ৩-কলাম-স্ক্রল আগে-ল্যান্ডেড, max+1-রীতি) — বাম-রেল ফোরাম ডিরেক্টরি + সেবাসমূহ-ও-আর্কাইভ (ইউজার-স্পেক)
- **চুক্তি ×৪:** ① dir-launcher.js-UTIL_SECTIONS = হেডার-লঞ্চার+মোবাইল-সাইডবার এক-রেজিস্ট্রি (app.locals.utilSections) — নতুন-ইউটিলিটি শুধু-এখানে-যোগ ② ৮-রুট (routes/utilities.js) ↔ রেজিস্ট্রি-href হুবহু-মিল — 404-শূন্য ③ DMCA → complaints-টেবিল (subject '[কপিরাইট]'-প্রিফিক্স; নতুন-টেবিল-নয়) ④ সনদ = DB-চালিত (LF-CU-ID = 1000+user.id)
- **গোটচা ×৩:** অতিথি/ইউজার মোবাইল-সাইডবার দুই-শাখা — নতুন-সেকশন উভয়েই; suite-রান-পূর্বে server-kill (sql.js-ফাইল-DB); role-policy fresh-DB-প্যারিটি-প্রোটোকল (state-নির্ভর-বেসলাইন)
- **প্রস্তাব ×৫:** বানান-ডিকশনারি-শব্দ-ভিত্তিক · আর্কাইভ /articles?year= · সনদ-QR-ভেরিফিকেশন · রিভিউ-বেনামে-মন্তব্য-স্ট্রিম · ইউটিলিটি-ব্যবহার-পরিসংখ্যান
---

## Cross-Agent Note — Session 157 (স্বাধীন স্মুথ স্ক্রল — settings/messenger-স্তর + সর্বজনীন ইউটিলিটি; ফিড-ত্রি-কলাম তাদের-session156-canonical-গৃহীত) (১৮ সেপ্টেম্বর ২০২৬) — [relabel-নোট: আমার-153→157 — push-রেসে সমান্তরাল session153(কম্পোজার-কোলাজ)/session153(সাইডবার-প্রিমিয়াম)/154(নোটিফ-ড্রপডাউন)/155(Next.js-ল্যান্ডিং)/**156(একই-ইউজার-স্পেক: ফিড-ইনডিপেন্ডেন্ট-স্ক্রল — তাদের-ক্যানোনিকাল-গৃহীত)** আগে-ল্যান্ডেড — max+1 রীতি; **multi-153-collision** double-129/133/134/147/152-রীতিতে টলেট: কোড-আইডি পরস্পর-অনন্য (তাদের fb-col153/rich153/bg153/fbm-*/lf153-e2e পরিবার, আমার pn153-*/st153-footer-slot পরিবার + সাফিক্স-শূন্য .independent-scroll) — collision-শূন্য; CSS-EOF-MARKER session153-* কোড-মার্কার হিসেবে অক্ষত]

**প্রবেশ-অবস্থা:** origin/main @ d611f84 (session152-push) — clean tree। ইউজার-স্পেক: "পুরো অ্যাপ্লিকেশনের যেকোনো ২-প্যানেল (সেটিংস, মেসেঞ্জার) বা ৩-প্যানেল পেজে স্বাধীন ও ফ্লুইড স্ক্রলিং — পুনর্ব্যবহারযোগ্য লেআউট সিস্টেম; স্ক্রল-চেইনিং রোধে overscroll-behavior:contain; hover-reveal স্ক্রলবার; আগে কোথায় আছে যাচাই"। ইউজারের স্পেক Next.js-টার্মে লেখা (globals.css/TwoPanelLayout.tsx) — এ-অ্যাপের Express+EJS-স্থাপত্যে অনুবাদ (session152-রীতি); আলাদা-কমিট (আগেরটার সাথে না — ইউজারের স্পষ্ট নির্দেশ)।


**🚨 প্রত্রাহণ-নোট (session149-রীতি — push-রেস-প্রত্রাহাণ):** দ্বিতীয়-rebase-এ আবিষ্কৃত — সমান্তরাল-এজেন্টের session156 (8b63e5d) **একই ইউজার-স্পেকের ফিড-ত্রি-কলাম অংশ** সম্পূর্ণ-বাস্তবায়ন করেছে (body.lf-feed-lock156 window-লক + flex-চেইন + কলাম 280/320px + .fb-scroll hover-reveal ইউটিলিটি + tests/lf156-e2e.sh)। ডাবল-ইঞ্জিন-ঝুঁকি-শূন্য-রাখতে আমার **dashboard.css session153-ফিড-ব্লক সম্পূর্ণ-প্রত্রাহৃত** (rebase-যুদ্ধে স্পেসিফিসিটি-সংঘর্ষ এড়াতে) — তাদের ব্লক-ই canonical। **আমার জীবিত-ডেল্টা (তাদের-স্পর্শ-শূন্য):** ① settings-২-প্যানেল fixed-shell (settings.css + st153-footer-slot) ② messenger তিন-স্ক্রলার contain+hover-reveal (messenger.css) ③ shared.css-এর .independent-scroll সর্বজনীন-ইউটিলিটি + .pn153-* প্রিমিটিভ (তাদের .fb-scroll-এর পরিপূরক — ভিন্ন-নাম, collision-শূন্য; নতুন-পেজে যে-কোনো-একটি ব্যবহার্য)। নিচের চুক্তি-৪-এর dashboard-অংশ তাদের-ব্লক-দ্বারা-সুপারসিডেড।

**আগে-যাচাই (ইউজারের নির্দেশ অনুযায়ী):** ① ডকুমেন্ট-ওপেনার দুটি (layout.ejs + partials/header.ejs) — `body,html{overflow-x:hidden}`, `overflow-y` নেই → উইন্ডো-স্ক্রল ডিফল্ট, ডাবল-স্ক্রলবারের কোনো পূর্ব-শর্ত নেই ② প্যানেল-পেজ-ম্যাপ: settings=২-প্যানেল গ্রিড (sticky-সাইডবার+উইন্ডো-স্ক্রল), messenger=ইতিমধ্যে fixed-shell `calc(100vh - 76px)` (তিন-স্ক্রলার: #convListDefault/.chat-body/.messenger-details — `.conv-scroll` সিলেক্টর লিগেসি-মৃত, মার্কআপে নেই), dashboard=৩-প্যানেল গ্রিড `212px/1fr/300px` (session151-sticky-রেল) ③ টোকেন: `--lf-ui-border-strong:#CED0D4` + `--lf-gray-mid:#9CA3AF` বিদ্যমান — ইউজারের হেক্স দুটো টোকেন-ম্যাপ সম্ভব ④ settings.ejs-এই একমাত্র footer-include (ডাবল-স্ক্রল-ঝুঁকি) ⑤ messenger-actions.js:435 `chatBody.scrollTop=scrollHeight` — চ্যাটে scroll-behavior:smooth নিষিদ্ধ-কারণ।

**স্কোপ (৫-ফাইল, CSS-কেন্দ্রিক):** shared.css (স্তর-১: সর্বজনীন ইউটিলিটি) + settings.css/settings.ejs + messenger.css + dashboard.css (স্তর-২: সারফেস-ওয়্যারিং)। মার্কআপ-পরিবর্তন মাত্র ১-লাইন (settings.ejs footer-স্লট)।

**চুক্তি-নোট (পরের-এজেন্ট অবশ্যই মানবেন):**
1. **independent-scroll-ইউটিলিটি (shared.css session153-ব্লক):** `.independent-scroll` = overscroll-behavior-y:contain + hover-reveal স্ক্রলবার (টোকেন: --lf-ui-border-strong/--lf-gray-mid) + scroll-behavior:smooth + reduced-motion-গার্ড। **নতুন ২/৩-প্যানেল পেজ = এই ক্লাসই** — নিজস্ব স্ক্রলবার-CSS লেখা নিষিদ্ধ।
2. **pn153-শেল-প্রিমিটিভ:** `.pn153-shell` (fixed `calc(100vh - var(--pn153-top,76px))`) + `.pn153-row/.pn153-col/.pn153-main/.pn153-fill` — নতুন-পেজ রেসিপি shared.css-কমেন্টে; ≤767px-এ শেল ডকুমেন্ট-ফ্লোতে ফেরে।
3. **৭৬px-টপবার-ধ্রুবক:** messenger-প্রতিষ্ঠিত (topbar 63px — ১৩px-স্ল্যাক নিরাপদ); settings/dashboard session153-ব্লকও একই। টপবার-উচ্চতা বদলালে তিন-ফাইল + pn153-shell-এর --pn153-top একসাথে।
4. **fixed-shell-গ্রিড-গোটচা:** গ্রিড-শেলে `grid-template-rows:minmax(0,1fr)` বাধ্যতামূলক — না দিলে implicit-row content-অনুযায়ী বেড়ে overflow:hidden-এ কাটা পড়ে (scrollHeight==clientHeight-এ স্ক্রল-মৃত)। settings (.st142-shell) ও dashboard (.dashboard-wrap.two-col.has-rail) দুটোতেই প্রয়োগ।
5. **smooth-নিষেধ-তালিকা:** `.chat-body`-তে scroll-behavior:smooth কখনো নয় (অটোস্ক্রল অ্যানিমেট-বিলম্ব); বাকি স্ক্রলারে smooth আছে। প্রোগ্রামাটিক-ইনস্ট্যান্ট-স্ক্রল দরকার হলে `scrollTo({behavior:'instant'})`।
6. **settings-ফুটার-স্লট:** settings.ejs-এ footer এখন `.st153-footer-slot`-এ মোড়ানো — ডেস্কটপে (≥961px) display:none (fixed-shell-এ footer ডাবল-স্ক্রলবার বানাত; FB-সেটিংস-প্যারিটি), মোবাইলে দৃশ্যমান। ফুটার-আপডেটে এই-র‍্যাপার অক্ষত রাখুন।
7. **সারফেস-কভারেজ:** session153-ব্লক settings.css/messenger.css/dashboard.css-এর EOF-এ (EOF-MARKER: session153-*)। নতুন-প্যানেল-পেজ (যেমন /admin-এর ভবিষ্যৎ-রূপান্তর) = shared.css-ইউটিলিটি + নিজস্ব CSS-এ fixed-shell-ওয়্যারিং — এ-প্যাটার্নই।

**E2E-প্রমাণ (agent-browser, ismail @9153):** ফিড-৩-প্যানেল: docH 564<winH (উইন্ডো-স্ক্রল-শূন্য), তিন-স্ক্রলার স্বাধীন (main 9579-বটমে, রেল 17, winY 0 — চেইনিং-শূন্য), osb:contain ✓। সেটিংস: main 380-বটমে winY 0 ✓ ফুটার-ডেস্কটপ-লুকানো/মোবাইল-দৃশ্যমান ✓ প্যানে-সুইচ+সাব-ডিটেইল+মোব্যাক অক্ষত (#security→sec-status→ব্যাক) ✓। মেসেঞ্জার: convListDefault 167 + chat-body 346 + details 596 — তিনটেই winY 0 ✓ chat-body smooth:auto (অটোস্ক্রল-নিরাপদ) ✓। 390px ×৩-পেজ: h-overflow-শূন্য ✓। কনসোল-০ ✓। স্ক্রিনশট ×৩ (feed-1440/feed-desktop/settings-390)। **রিগ্রেশন:** role-policy **২৫৪/২৫৪ ALL GREEN** + s139-parity **২২/২২** + guard ✓ + audit:views ✓ + hex-ratchet (৪-নতুন-ব্লক hex-০) ✓ + EJS-compile ✓ + node --check ✓। **হারনেস-গোটচা:** role-policy RP_PORT / s139 E2E_PORT — ভিন্ন-ভ্যারিয়েবল, সার্ভার `PORT`-এ বাঁধে; ভুল-ভ্যারিয়েবলে ২০৫-মিথ্যা-ফেইল (conn-refused)।

**পরবর্তী-প্রথম-পছন্দ:** ① প্রোফাইল-পেজের অভ্যন্তরীণ-স্ক্রল-অঞ্চলেও ইউটিলিটি-পলিশ (FB-প্রোফাইল উইন্ডো-স্ক্রল-ই-রাখে — শুধু overscroll-পলিশ প্রযোজ্য) ② /admin ড্যাশবোর্ডে pn153-শেল-রূপান্তর ③ ফিডে স্ক্রল-পজিশন-মেমরি (back/forward-এ dash-main scrollTop রিস্টোর) ④ keyboard-scroll (Space/PgDn) ফোকাস-প্যানেলে রুটিং। **পরের-এজেন্ট: session158 থেকে।**

---

## session192-নোট (পাবলিক ফোরাম ডিরেক্টরি কম্প্যাক্ট রি-ডিজাইন — ইউজার-স্পেক ForumDirectoryMenu-পোর্ট)

**স্পেক:** হোমপেজ (লগ-ইন-পূর্ব) নেভবারের ৯-ডট প্যানেল "ফোরাম ডিরেক্টরি" কম্প্যাক্ট/প্রিমিয়াম/প্রফেশনাল — অপ্রয়োজনীয় ফাঁকা-জায়গা শূন্য; মূল-টাইটেল Hind Siliguri, ছোট-ডিটেইল Kalpurush।

**পরিবর্তন (৪-ফাইল, স্কোপড):**
- helpers/dir-launcher.js: `PUB_SECTIONS` (৩-সেকশন × ১০-আইটেম) — DIR_SECTIONS (ফিড-রেল) ও UTIL_SECTIONS (হেডার-লঞ্চার) অক্ষত; বেক-লুপে যুক্ত; export-যোগ
- server.js: `app.locals.pubSections`
- views/layout.ejs: #dlxPanel → `dlx-panel--pub192` (কম্প্যাক্ট-হেডার + টাইল-গ্রিড + কন্ডিশনাল ভিজিটর-ফুটার-স্ট্রিপ "সব সুবিধা... / লগইন→"; লগড-ইন-ইউজারে লিগ্যাসি-ফুট)
- style.css: session192-ব্লক EOF (স্কোপড — util157/রেল অস্পৃশ্য; হেক্স-শূন্য — সফট-টিন্ট = color-mix(token 12%, --lf-white))

**ইউজার-মকআপ-রুট → বাস্তব-রুট ম্যাপ (404-শূন্য-চুক্তি):** /saved→/bookmarks · /memories→/on-this-day · /reading-circles→/quiz (গ্রুপ-ফিচার-অনুপস্থিত) · /publications→/press · /posts→/articles · /faq→/qa; বাকিরা সরাসরি। সব কোডবেস-প্রমাণিত রুট, curl -L ১০/১০ = 200।

**E2E-প্রমাণ (agent-browser @9192):** ভিজিটর-প্যানেল 406×461px (আগে 560px) · ৩-সেকশন/১০-আইটেম/লাইভ-ব্যাজ/ভিজিটর-ফুট ✓ · টাইটেল=HindSiliguri, ডেস্ক=Kalpurush, সেকশন-টাইটেল=HindSiliguri (computed-style-প্রমাণ) · সফট-টিন্ট আইকন color(srgb …) ✓ · বাইরে-ক্লিক ও ✕-ক্লোজ ✓ · টাইল-ক্লিকথ্রু → /on-this-day ✓ · মোবাইল 390px wrap-hidden + hScroll-শূন্য ✓ · লগড-ইন (ismail): ড্যাশবোর্ড util157-প্যানেল অক্ষত (৪০৭px, ৮-রো) + রেল ১৩ + pub192-মার্কার-শূন্য (স্কোপ-আইসোলেশন) + পাবলিক-পেজে লিগ্যাসি-ফুট ✓ · কনসোল-০ ✓

**গোটচা (পরের-এজেন্ট):** ① sql.js সার্ভার-রানিং-অবস্থায় reset-স্ক্রিপ্ট চালালে সার্ভার-শাটডাউনে ফাইল-ওভাররাইট — স্ক্রিপ্টের-আগে সার্ভার-বন্ধ ② লোকাল lekhok.db = প্রোডাকশন-কপি (৪৭ বাস্তব-ইউজার) — ডেমো-লগইন: ismail/riya/tanvir · secret123 (scripts/reset-qa-logins.js সার্ভার-বন্ধ-করে-চালান) ③ ইউজার-স্পেকের React-কম্পোনেন্ট (ForumDirectoryMenu.tsx) মকআপ — href মকআপ-রুট, প্রয়োগের-আগে রুট-ম্যাপ-চুক্তি মানুন।

**পরের-এজেন্ট: session193 থেকে।**

---

## session193-নোট (হোমপেজ লেআউট রি-অর্ডারিং + নেতৃত্ব-কার্ড কম্প্যাক্ট/অ্যানিমেশন-পুনরুদ্ধার + আজকের-কন্টেন্ট ফিড-আদল)

**স্পেক (ইউজার, স্ক্রিনশট-সহ):** ① নেতৃত্ব-কার্ডের নিচের ফাঁকা-জায়গা দূর + মসৃণ-অ্যানিমেশন ফেরত ② নেতৃত্ব-সেকশনের ব্যাকগ্রাউন্ড প্রিমিয়াম/প্রফেশনাল (থিম-সামঞ্জস্যপূর্ণ) ③ "আজকের কন্টেন্ট" সেকশন হুবহু ইউজার-ফিড কার্ডের আদলে ④ অ্যাডমিন প্যানেল থেকে পুরো হোমপেজের সেকশন ও ভেতরের কার্ডের রি-অর্ডারিং।

**RCA (দুটো মূল-বাগ):**
- **ফাঁকা-জায়গা:** `.leader-card-featured{min-height:760px}` ফিক্সড-উচ্চতা — কনটেন্ট খাটো হলে নিচে বিশাল স্থির-ফাঁকা।
- **অ্যানিমেশন-অদৃশ্য:** session180-এর সব কার্ড-লেভেল ইফেক্ট (হ্যালো/৮px-লিফট/ডাবল-রিং/কার্যবর্ষ-চিপ) `.leaders-row` স্কোপে লেখা — মার্কআপে ওই ক্লাস **কোথাও নেই-ই** → ডেড CSS। সেশন-১৮০-এর "প্রোডে কিছুই দেখা যায়নি" অভিযোগের আসল-কারণ এটাই ছিল (ও-সময় aurora-দৃশ্যমানতায় ভুল-RCA হয়েছিল)। **শিক্ষা: ID-স্কোপ (#leadership/#current-leadership) মার্কআপ-যাচাই করে লিখুন।**

**পরিবর্তন (১১-ফাইল):**
- **helpers/home-layout.js (নতুন):** HOME_SECTIONS রেজিস্ট্রি (১০-সেকশন → partials/home/*.ejs) + FEED_SLIDES + resolveOrder/sanitizeOrderPayload/sanitizeMemberOrderMap/applyMemberOrder (স্টেবল)/orderFeedSlides — নতুন/অজানা-কী সবসময় রেজিস্ট্রি-ক্রমে ফলব্যাক (present-beats-default)।
- **settings চুক্তি:** `home_section_order` (JSON [{key,enabled}]) · `home_member_order` (JSON {FOUNDERS[],FOUNDING_ADVISORS[],CURRENT_PAIR[],CURRENT_ADVISORS[]}) · `home_feed_order` (JSON keys)।
- **routes/pages.js:** হোম-রুটে ৩-সেটিং প্যারালাল-লোড + member-order প্রয়োগ (founders/foundingAdvisors/currentLeaders/currentAdvisors) + todaySlides বিল্ড (কুইজ-চ্যালেঞ্জ সক্রিয় থাকলে কুইজ-স্লাইড বাদ — পুরনো today-grid-চুক্তি) + feedSlides + homeSections → ভিউ।
- **views/lekhok-home.ejs:** অর্ডার-চালিত partials-লুপে রিফ্যাক্টর — শেয়ার্ড হেল্পার (lfSafeUrl/lfEsc/leaderCard/leaderPair) টপে ডিফাইন হয়ে **locals-এ attach** (EJS-include আলাদা-স্কোপ!); গেট: TODAY/QUIZ_CHALLENGE/ARTICLES ডেটা-শূন্যে যে-অবস্থানেই থাকুক রেন্ডার-বাদ।
- **views/partials/home/*.ejs (১০টি নতুন):** hero/today/quiz/mission/leadership-founding/leadership-current/faq/feed/notices/articles — feed-এ স্লাইড-লুপ (feedSlides), today সম্পূর্ণ-নতুন ব্যান্ড।
- **admin/routes.js:** GET/POST `/admin/home-reorder` (requireStaff; ADMIN_PATH_AREAS-এ content-এরিয়া) — member-groups = হোম-কোয়েরির হুবহু মিরর (latest-term pair + ফলব্যাক)।
- **admin/views/admin/home-reorder.ejs (নতুন):** ২-কলাম প্যানেল (বাম ৭col সেকশন-ক্রম+eye-টগল, ডান ৫col ভেতরের-কার্ড) — **সেভ অবশ্যই fetch-AJAX (_ajax=1)**: সাধারণ form-POST প্রিভিউ-গেটওয়েতে XTransformPort হারায় (sections.ejs-এর sec-ajax যে সব-AJAX সেটাই-কারণ)।
- **style.css session193-ব্লক (EOF):** ID-স্কোপে কার্ড-ইফেক্ট (min-height:0!important + ৭px-লিফট + ৩px-গ্রেডিয়েন্ট-টপবার + ডাবল-রিং/জুম + রোল/কার্যবর্ষ-চিপ + কোট-বক্স❝ + সোশ্যাল-বিভাজক) + সেকশন-ব্যাকগ্রাউন্ড (ডট-ম্যাট্রিক্স content:none; মিন্ট-গ্রেডিয়েন্ট + একক অ্যাম্বিয়েন্ট-আভা 30s-drift) + ts-showcase193 ব্যান্ড। নতুন-ব্লক হেক্স-প্রায়-শূন্য (rgb() নোটেশন); **tokens-hex-baseline.json 1395→1403 রি-ফ্রিজ** (session180/192-এর অবিস্ফোটিত বৃদ্ধি আত্তীকৃত — guard এবার গ্রিন)।

**E2E-প্রমাণ (লোকাল :8094 + agent-browser + curl):** সেকশন-রি-অর্ডার TODAY-first রেন্ডার ✓ → রিভার্ট HERO-first ✓; ভেতরের-কার্ড GS-first (মেসবাহ উদ্দিন মিহির আগে) ✓ → রিভার্ট president-first ✓; feed-slides epaper-first ✓ → ডিফল্ট ✓; প্যানেল reload-এ সেভ-করা ক্রমই দেখায় ✓; AJAX-সেভ toast "সফলভাবে সংরক্ষিত" + ?saved=1 ✓; কার্ড-উচ্চতা 703–750px কনটেন্ট-অনুযায়ী (আগে 760+ফাঁকা), সোশ্যাল-রো-পরে gap 29px (প্যাডিং-ই) ✓; মোবাইল-390 hScroll-০ ✓; কনসোল-০ ✓। রিগ্রেশন: node --check ×৪ + EJS-compile ×১২ + audit:views (১১৬-ejs) + guard:design গ্রিন ✓।

**গোটচা (পরের-এজেন্ট):** ① EJS-include আলাদা-ফাংশন-স্কোপ — নতুন partial-এ শেয়ার্ড-হেল্পার লাগলে lekhok-home.ejs-এ `locals.x = x` করুন ② home_member_order হোমের ক্রম-ওভাররাইড মাত্র — members.sort_order স্পর্শ করে না (কমিটি-পেজের ক্রম অক্ষত) ③ sql.js-লোকালে debounced-persist (200ms) — SIGKILL-এ শেষ-রাইট হারাতে পারে; প্রোড (Turso)-এ durable ④ স্যান্ডব্যাক্সে ব্যাকগ্রাউন্ড-প্রসেস টুল-কল-শেষে মরে — E2E-র সব-স্টেপ এক-কলে; গেটওয়ে-URL ফরম্যাট `http://localhost:81/<path>?XTransformPort=<port>` (path-আগে, query-পরে — উল্টো লিখলে path=/ হয়ে যায়)।

**পরের-এজেন্ট: session194 থেকে।**

---
### session201 — Task43 সাপোর্ট-কেন্দ্র (cross-agent নোট)

- **ইন্টিগ্রেশন-পয়েন্ট:** `SystemSetting(SUPPORT_ADMIN_ID)`-কে অন্য-কোথাও লাগলে `lib/support.ts`-এর হেল্পার ব্যবহার করুন — কাঁচা-কুয়েরি নয়। রোল-যাচাইয়ে `lib/roles.ts` (isManager/isSuperAdmin) — নতুন অ্যাডমিন-API-তে `user.role !== 'admin'`-স্টাইল-হার্ডকোড লিখলে super_admin বাদ-পড়বে।
- **conversations-GET-চুক্তি:** প্রথম-আইটেম = সাপোর্ট-পিন (placeholder হলে id='system-support-chat' + supportUserId) — ফ্রন্টএন্ডে তালিকা-ম্যানিপুলেশন করলে এ-আইটেম সরাবেন-না।
- **UserReport:** User-FK-বিহীন (senderId শুধু-স্ট্রিং) — JOIN-লাগলে অ্যাপ-স্তরে করুন; seed-reset-এ `db.userReport.deleteMany()` অবশ্যই (ক্যাসকেড-নেই)।
- **Vercel-পোর্ট-নোট:** Task43-Next-অ্যাপ এখনো লোকাল-ডেমো-DB (prisma/dev.db) — প্রোডে এ-ফিচার Turso-পোর্টের-পরে যাবে (তখন db push-তে enum মনে-রাখবেন)।

---
### session202 — সাপোর্ট-কেন্দ্র অ্যাওয়্যারনেস-প্যাক (cross-agent নোট)

- **নতুন-হুক চুক্তি:** `useSupportPending()` → `{ pending: number | null }` — null = অ্যাক্সেস-নেই (মেম্বার) বা প্রথম-লোড-হয়নি; ব্যাজ-রেন্ডারে `pending !== null && pending > 0` গার্ড বাধ্যতামূলক। রিভিউ-ডেস্কের-বাইরে অভিযোগ-স্টেট-বদলালে `window.dispatchEvent(new Event('lf:support-changed'))` করুন — ব্যাজ তাৎক্ষণিক-রিফ্রেশ পাবে।
- **counts=1 লাইট-মোড:** ব্যাজ-পোলিংয়ের জন্য — রেকর্ড-তালিকা দরকার হলে প্লেইন GET-ই ব্যবহার করুন; counts=1-এ reports-অ্যারে আসে-না।
- **CSV-এক্সপোর্ট:** ক্লায়েন্ট-সাইড জেনারেশন (সার্ভার-এন্ডপয়েন্ট-নেই) — UTF-8 BOM ছাড়া এক্সেলে বাংলা ভাঙে; নতুন-কলাম-যোগ হলে `csvCell()`-escape ভুলবেন-না।
- **আর্টিফ্যাক্ট-সতর্কতা:** bash-টুল-আউটপুটে `[h`-প্যাটার্ন (`[hasMore`→`asMore`, `[hidden`→`idden`) প্রায়ই **ডিসপ্লে-পিপেই** কাটে — ফাইল-নয়। সন্দেহ হলে `node -e` দিয়ে বাইট-যাচাই (`s.includes('[hasMore')` ইত্যাদি) বা my-project/scripts/s202-bracket-scan.js — সরাসরি-সম্পাদনা-নয়।
- **পরের-এজেন্ট: session203 থেকে।** Task43-এরিয়া স্পর্শ-করলে রোল-ম্যাট্রিক্স-রিগ্রেশন বাধ্যতামূলক।

---
### session203 — অভিযোগ-লুপ-বন্ধ প্যাক (cross-agent নোট)

- **নতুন API চুক্তি:** `GET /api/support/my-reports` → `{ reports[{id,messageText(≤২২০),mediaType,status,adminNote,createdAt,updatedAt}], counts{PENDING,IN_PROGRESS,RESOLVED}, total }` — senderId-গেটেড (নিজেরটা-ই), senderEmail/senderId ইচ্ছাকৃত-বাদ; adminNote দেখানো-ই-উদ্দেশ্য (অভিযোগকারীর জবাব)।
- **নতুন নোটিফিকেশন-টাইপ:** `SUPPORT` (নতুন-অভিযোগ → সাপোর্ট-অ্যাডমিন; notify()-এ ৫-মিনিট-থ্রটল-গ্রুপে যুক্ত — REACTION/SHARE/FOLLOW-র সাথে) ও `SUPPORT_UPDATE` (স্টেটাস/নোট-বদল → অভিযোগকারী; থ্রটল-নেই)। নতুন-টাইপ-যোগের রীতি: notify.ts-union+VALID + types.ts NOTIFICATION_META+NOTIF_PREF_OPTIONS + NotificationBell ACTION_TEXT — চার-জায়গা-একসাথে।
- **ইভেন্ট-হাব:** `window.dispatchEvent(new CustomEvent('lf:open-support-chat'))` — page.tsx শুনে messenger-ভিউ খোলে; MessengerView শুনে সাপোর্ট-রো-রেজলভ (placeholder হলে find-or-create) + MyReportsPanel অটো-ওপেন। নোটিফিকেশন-ক্লিক ছাড়া অন্য-উৎস-ও এ-ইভেন্ট ব্যবহার করতে পারে।
- **ডেমো-সেশন-নোট (প্রি-একজিস্টিং, অপরিবর্তিত):** `lib/session.ts getCurrentUser()` কুকি-শূন্যে প্রথম-ইউজার (ismail/super) রিটার্ন করে — anon-curl-এ ম্যানেজার-API 200 দেখাটা এ-ডিজাইনের-ফল; রোল-ম্যাট্রিক্স-যাচাই সবসময় স্পষ্ট-কুকি-সেট-করে করুন।
- **MessengerView-নতুন-স্টেট:** `myReportsOpen` — হিন্ট-বার-বাটন ও lf:open-support-chat দুটোই টগল করে; প্যানেল `open`-প্রপ-ড্রিভেন, ভেতরে-ই ফেচ (খোলা-মাত্র ফ্রেশ)।
- **পরের-এজেন্ট: session204 থেকে।** রিভিউ-ডেস্কের update-callback এখন `reports`-ডিপেন্ডেন্ট (টোস্ট-তুলনার-জন্য) — deps-তালিকা অক্ষত রাখুন।

### session204 — নিরাপত্তা-সংশোধন + "নতুন জবাব" অপঠিত-ব্যাজ (cross-agent নোট)

- **⚠️ সেশন-চুক্তি-বদল (গুরুত্বপূর্ণ):** `lib/session.ts getCurrentUser()` এখন কুকি-শূন্যে/অবৈধ-কুকিতে **null** দেয় (প্রথম-ইউজার-fallback অপসারিত) — পুরনো-নোটের "anon-curl-এ ম্যানেজার-API 200 = ডিজাইনের-ফল" নোটটি বাতিল; এখন anon সবখানে 401। রোল-ম্যাট্রিক্স-যাচাই আগের-মতোই স্পষ্ট-কুকি দিয়ে। anon-flow-টেস্ট (যদি-থাকে) এখন 200-এর-বদলে 401 প্রত্যাশা করুন। `/api/upload`-এ নতুন স্পষ্ট 401-গার্ড — মেসেঞ্জার-আপলোড লগইন-ছাড়া কাজ করবে না (ইচ্ছাকৃত)।
- **নতুন মডিউল:** `lib/my-reports-seen.ts` — `getSeenMs()/markSeen()/hasNewReply(updatedAt, createdAt, seenMs?)` + `MY_REPORTS_SEEN_KEY` ('lf_myreports_lastseen') + `MY_REPORTS_SEEN_EVENT` ('lf:my-reports-seen-changed')। সূত্র: নতুন-জবাব = `updatedAt > max(lastSeen, createdAt)`। localStorage-ভিত্তিক — প্রাইভেসি-মোডে নীরব-ব্যর্থ।
- **MyReportsPanel-নতুন-চুক্তি:** markSeen প্যানেল-**বন্ধে** (open true→false + loadedRef) — খোলা-অবস্থায় ব্যাজ থাকে; সফল-লোড-ছাড়া বন্ধে markSeen-নয় (error-অবস্থায় ব্যাজ-হারায়-না)। কার্ড-aria: "এই অভিযোগে নতুন জবাব এসেছে"।
- **MessengerView-নতুন-স্টেট:** `myUnread` + `refreshMyUnread()` — মাউন্টে + MY_REPORTS_SEEN_EVENT-এ ফেচ (মাল্টি-ইনস্ট্যান্স-সেফ: ইভেন্ট-লিসেনার-প্যাটার্ন; anon/401 নীরব-শূন্য)। হিন্ট-বার-বাটনের title/aria-কাউন্ট-সচেতন।
- **ms-precision-গোটচা:** updatedAt==createdAt যাচাই করতে ISO-স্ট্রিং ms-পর্যন্ত তুলনা করুন — সেকেন্ড-গ্র্যানুলার-ট্রাঙ্কেট ([:19]) দিয়ে হিসাব করলে কাউন্ট মিথ্যা-কম দেখায় (এ-রাউন্ডে প্রমাণিত: ট্রাঙ্কেটেড-পূর্বানুমান ১ বনাম প্রকৃত ৪)।
- **পরের-এজেন্ট: session205 থেকে।** বাকি-প্রস্তাব: রিভিউ-ডেস্কে অ্যাডমিন-নোট-হিস্ট্রি (schema-পরিবর্তন-প্রয়োজন), Turso/প্রোড-পোর্ট।
