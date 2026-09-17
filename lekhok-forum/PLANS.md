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

## Cross-Agent Note: Session 107-ব — আর্টিকেল-পেজ FB-কমেন্ট + 🚨 AV-হ্যাশ-কোলিশন-ফিক্স (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** comment-tools.js (ডুয়াল-সারফেস অ্যাডাপ্টার) + article-single.ejs (কমেন্ট-মার্কআপ FB-প্যারিটি) + style.css (integration-ব্লক) + social.js (REACTION_META care) + **server.js (computeAssetVersion)**। মেসেঞ্জার/নোটিফিকেশন/গ্যালারি লক-জোন অস্পৃশ্য।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট:**
- **কমেন্ট-মার্কআপ-চুক্তি (আর্টিকেল/প্রশ্ন-পেজ):** `.comment-item`/`.reply-item`-এ `data-cid` + `data-author-id` + `.comment-body[data-raw="…"]` + `.fc-edit-slot` (user) + meta-রোতে `.fc-react-wrap`/`.fc-menu-wrap`। এই ক্লাস-সেট ভাঙলে প্যালেট/মেনু/এডিট নীরবে মরে (কোনো এরর নেই)। নতুন কমেন্ট-সারফেস যোগ করলে এই মার্কআপ-ছাঁদই কপি করুন — JS-অ্যাডাপ্টার অটো-কাজ করবে।
- **🚨 AV-হ্যাশ-কোলিশন (সব এজেন্টের জন্য):** computeAssetVersion এখন boot-epoch-XOR — প্রতি রিস্টার্টে ?v= ইউনিক। স্ট্যাটিক-অ্যাসেট এডিট → **সার্ভার রিস্টার্ট বাধ্যতামূলক** (নোট আগেও ছিল), এখন রিস্টার্টই যথেষ্ট (কোলিশনেও ব্রাউজার ফ্রেশ পাবে)। ব্রাউজার-টেস্টে "কোড ঠিক কিন্তু আচরণ পুরনো" দেখলে প্রথমে `document.querySelector('link[href*="style.css"]').href`-এর ?v= আর সার্ভার-লগের বুট-হ্যাশ মিলিয়ে দেখুন।
- **রিঅ্যাকশন-চুক্তি:** আর্টিকেল-কমেন্ট এখন ফিডের মতো hover-palette (`/api/react` target_type=comment) — session100-hold-ইঞ্জিন শুধু পোস্ট-স্তরে। REACTION_META এখন ৬-ইমোজি (care-সহ) — নতুন রিঅ্যাকশন-টাইপ যোগ লাগলে এই ম্যাপ + server REACTIONS + actions-bar _meta + main.js R_META + comment-tools R_META — **পাঁচ** জায়গা একসাথে।
- **কমেন্ট-ডিলিট কাউন্টার-সিঙ্ক:** non-drawer পেজে DELETE-সফল হলে JS নিজেই `.comments-h` ও `.as-stat[title="মন্তব্য"]` আপডেট করে — হেডার-মার্কআপ বদলালে এই সিলেক্টর-দুটি রক্ষা করুন।

**E2E-প্রমাণিত:** আর্টিকেল-পেজ প্যালেট/ব্যাজ/এডিট/ডিলিট/রিপ্লাই ✓ ফিড-রিগ্রেশন ✓ 390px ✓ কনসোল-০ ✓ role-policy ৯৪/১০৩ (ফেল=প্রি-এক্সিস্টিং সিড-স্টেট) ✓।

**পরবর্তী-সুপারিশ:** ① qa-single-উত্তরেও একই FB-মার্কআপ (এন্ডপয়েন্ট প্রস্তুত) ② কমেন্ট-রিপ্লাই/রিঅ্যাকশনে নোটিফিকেশন ③ আর্টিকেল-কমেন্টে optimistic-UI (রিলোড-ছাড়া নতুন-কমেন্ট ইনসার্ট)
**পরবর্তী-ক্রন-রাউন্ডে (১০৭-পরবর্তী):** শেয়ার্ড-ট্যাব pagination (Agent-Chat-লক) → প্রোফাইল-টাইমলাইন স্ক্রল-রিস্টোর → ০৩-Metered.ca-TURN (ইউজার-অ্যাকাউন্ট লাগবে — env-TURN-পথ প্রস্তুত: LEKHOK_TURN_URLS/USERNAME/CREDENTIAL) → গ্রুপ-কল → ইমেইল-ডিরেক্টরি-অ্যাডমিন-সম্পাদনাযোগ্য-ডেটা।


## Cross-Agent Note: Session 107 — রিসোর্স সিরিজ/সংকলন + ডিটেইল-স্টাফ-অ্যাকশন + স্যান্ডবক্স-লিংক-পোর্ট-ফিক্স (১৮ সেপ্টেম্বর ২০২৬)

**রোডম্যাপ-প্রগতি:** session106-সুপারিশের **① সংকলন-সিরিজ ✓ (বাল্ক-ইমপোর্টের অর্ধেক-রূপ — সিরিজ-গ্রুপিং)** + **③ ডিটেইল-স্টাফ-অ্যাকশন ✓**। অবশিষ্ট: বাল্ক-ইমপোর্ট (CSV/জিপ), created_at UTC→লোকাল সাইট-ওয়াইড।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **সিরিজ-ডেটা-চুক্তি:** resources.series (TRIM-করে তুলনা — ভিউ-রুটেও TRIM(COALESCE(series,''))), series_order NULL হলে id-ফলব্যাক (ORDER BY COALESCE(series_order,1000000), id)। নতুন resources-কুয়েরিতে সিরিজ-রাখলে এই ক্রমই ধরুন।
- **ফিল্টার-URL-চুক্তি বর্ধিত:** ?series= এখন ৪র্থ-প্যারাম (সার্ভার-সাইড, ≤80 ক্যারেক্টার) — rsxExtra-এ seriesও বহন হয়; syncUrl() ইচ্ছাকৃতভাবে series-ধরে না (URLSearchParams-রিইউজে স্বয়ংক্রিয়-সংরক্ষিত)।
- **কার্ড-ক্লিক-গার্ড বর্ধিত:** a[data-rsx-seri] (এপব্যান্ড-লিংক) গার্ডে যোগ হয়েছে — কার্ডে নতুন লিংক যোগলে guarded()-সিলেক্টর আপডেট করুন।
- **🚨 স্যান্ডবক্স-লিংক-পোর্ট-ফিক্স (layout.ejs):** ক্যাপচার-ফেজ click-লিসেনার এখন সব /path ও ?query href-এ XTransformPort যোগ করে (প্রিভিউতে)। query-only হ্রেফ (?category=…) আর 404 যায় না। নতুন-পেজে special href-হ্যান্ডলিং লাগলে এই লিসেনারের শর্ত (/^(?!\/)/ + '?') দেখুন।
- **স্টাফ-অ্যাকশন-চুক্তি (ডিটেইল-পেজ):** staffRole ('admin'/'superadmin' → এডিট+মুছুন; 'moderator' → ম্যানেজ)। মুছুন-ফ্লো: fetch(?_u= fresh-GET → মেটা-টোকেন) → POST ?_method=DELETE + X-CSRF-Token — **নেটিভ-ফর্ম নয়** (ক্যাশেবল-পাবলিক-পেজে রেন্ডার-টোকেন এফেমেরাল)।
- **⚠️ পরিবেশ-গোটচা:** setsid-$!-পিড-মিসম্যাচ → জম্বি-সার্ভার → তার SIGTERM-flush ফাইল-ক্লোবার (বিস্তারিত PROJECT.md সেশন-১০৭)। সার্ভার-কিল = pkill -f; seed = সার্ভার-বন্ধ অবস্থায়, kill-এর ৩সে পরে।

---

## Cross-Agent Note (session111): style.css EOF-ইউনিয়ন — media-query-splice-গোটচা 🚨
**Date:** 2026-09-18 · **Agent:** Z.ai Cron (webDevReview)

অন্য-এজেন্টের EOF-ব্লক (session107-লেবেল, 2a8d411) আমার session109-ব্লকের `@media (max-width:640px){...}`-এর ক্লোজিং `}`-এর আগে splice হয়ে যায় — ফলে পরের সব ব্লক (session107-comment + session110-feed) ৬৪০px-মিডিয়া-কুয়েরির "ভেতরে" ঢুকে ডেস্কটপে ডেড। রিপেয়ার: f736fc1।

**চুক্তি (সব এজেন্টের জন্য):**
1. style.css-EOF-এ append-এর পরে (এবং rebase/union-মার্জের পরে) **comment-stripped brace-depth-চেক** বাধ্যতামূলক: `css.replace(/\/\*[\s\S]*?\*\//g,'')` → `{`/`}` কাউন্ট সমান + ডেপথ-নেগেটিভ-শূন্য।
2. নিজের EOF-ব্লকের **আগে-ও-পরে ফাঁকা-লাইন + `/* EOF-MARKER: <session> */` কমেন্ট** রাখলে splice-নির্ণয় সহজ হয়।
3. সেশন-লেবেল-রেস আবার হয়েছে (১১০×২) — পরবর্তীতে **`session<YYMMDD-HHMM>`-স্টাইল আইডি** ব্যবহার করুন (কমিট-মেসেজ প্রিফিক্সেও)।
4. CSS-এডিটের পরে সার্ভার-রিস্টার্ট (AV-গণনা বুটে) + রুট-কজ-বিচারের আগে স্টেল-প্রসেস-সন্দেহ প্রথমে বাদ দিন (views ডিস্ক-থেকে ফ্রেশ, কিন্তু routes মডিউল-ক্যাশে — মিসম্যাচে ফ্যান্টম-৫০০)।

## Cross-Agent Note: Session 109 — ইনবক্স রিপ্লাই-নোট + টাইম-লেভেল 'এখন খোলা' ব্যাজ + প্রভোস্ট প্রিন্ট (১৮ সেপ্টেম্বর ২০২৬) [লেবেল-রেস: '১০৯' দুই-এজেন্টে — আমি contact/admin-সাইড, অন্য-এজেন্ট /me-ফিড-রিডিজাইন (style.css)]

**স্কোপ:** session105/107-এর অবশিষ্ট-সুপারিশ তিনটি — ① ইনবক্স রিপ্লাই-নোট ② contact_hours টাইম-লেভেল লাইভ-ইন্ডিকেটর ③ প্রভোস্ট-তালিকা প্রিন্ট। QA-সুইপ বাগ-শূন্য (১৫-পেজ ২০০, কনসোল-০)।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (এজেন্টদের জন্য):**
- **contact_submissions এখন ৬-কাস্টম-কলাম:** is_read/is_archived (১০৭) + admin_reply/replied_at (১০৯) + resources.series/series_order (১০৭-সিরিজ) — LATER_COLUMNS-ইউনিয়ন বজায় রাখুন।
- **CSV-স্কিমা বৃদ্ধি:** `/admin/messages/export` হেডার এখন `...,created_at,replied_at,admin_reply` — পরবর্তী-কলাম-যোগে শুধু টেইল-অ্যাপেন্ড (পুরনো-কনজিউমার-সেফ)।
- **রিপ্লাই-নোট UI-কনট্র্যাক্ট (messages.ejs):** `[data-note-open/edit/cancel/count]` হুক + মুছুন-পথ ১০৫-কনফার্ম-মোডাল ডেলিগেশনে (data-confirm+data-form) — নতুন-বাটন যোগে এই-প্যাটার্ন রাখুন। ক্যানসেল এডিট-ড্রাফট বাতিল করে মূল-নোট রিস্টোর করে।
- **contact hour-row:** `data-days` + **নতুন `data-time`** (বাংলা সময়-পরিসর) — ব্যাজ-IIFE পার্সার এটাই পড়ে; অ্যাডমিন contact_hours সেটিংস-টেক্সট ফরম্যাট (দিন: সময়) বদলালে পার্সার-ফলব্যাক 'আজ খোলা'-তে নিরাপদে পড়ে।
- **প্রিন্ট-ব্লক:** `cx-print-keep` ক্লাস = প্রিন্টে-টিকে-থাকা-সেকশন মার্কার; ভবিষ্যতে প্রিন্টেবল-সেকশন যোগ করলে এই-ক্লাস দিন (**:has() ব্যবহার নয়** — প্রিন্ট-ইঞ্জিন-ফলব্যাক)।

**🚨 নতুন-গোটচা:**
1. **[hidden] vs ক্লাস-ডিসপ্লে:** টগল-এলিমেন্টে ক্লাসে `display:inline-flex/flex` থাকলে `hidden`-অ্যাট্রিবিউট নীরবে বাতিল (author > UA `[hidden]`)। ফিক্স: `.cls[hidden]{display:none!important}` — admin.css-109-ব্লক রেফারেন্স।
2. **অ্যাডমিন-লগইন curl-E2E:** GET /admin/login → `_csrfTok`-কুকি + hidden `_csrf` (double-submit) → POST → দুই-কুকি (`_csrfTok`+`connect.sid`) পরবর্তী-সব-কলে। /login (ইউজার-পোর্টাল) দিয়ে অ্যাডমিন-পেজ পাবেন না।
3. **বাংলা-সময়-পার্সিং:** ভোর/সকাল/দুপুর/বিকাল/সন্ধ্যা/রাত → ঘণ্টা-ম্যাপিং + `c<=o → c+=12h` (মধ্যরাত-অতিক্রম)। ১০-কেস-প্রমাণিত — নতুন-ফরম্যাট লাগলে lekhok-contact.ejs-পার্সার এক্সটেন্ড করুন।

**E2E-প্রমাণ:** curl (নোট-সেভ 303+saved=1+f-সংরক্ষণ, CSV-কলাম, নোট-ডিলিট, অডিট reply-note) + agent-browser (is-idle 21:47-UTC, is-live মক-স্ক্রিনশট, পার্সার-১০কেস, beforeprint-প্রসারণ, নোট open/edit/cancel/কাউন্টার, 390px-০, কনসোল-০) + post-rebase-ইন্টিগ্রেশন (সিরিজ-ফিল্টার+নোট-হুক+CSV+প্রিন্ট-বাটন সহ-অস্তিত্ব) ✓।

**পরবর্তী-সুপারিশ:** ইনবক্সে প্রিন্ট/PDF-ভিউ → pagination-লাইভ-টেস্ট (১৬+) → প্রোফাইল-টাইমলাইন স্ক্রল-রিস্টোর → ০৩-Metered.ca-TURN (অ্যাকাউন্ট-প্রয়োজন)।

## Cross-Agent Note: Session 105 — 🎨 সেন্ট্রালাইজড গ্লোবাল ডিজাইন-সিস্টেম (Single Source of Truth) (১৮ সেপ্টেম্বর ২০২৬)

**স্কোপ:** ইউজার-ডিরেক্টিভ — Home/Social-Feed/Profile/Writings/Messaging-এ একই ডিজাইন; পোস্ট/কমেন্ট/মেসেঞ্জার-মার্কআপ শুধু `views/shared/` থেকে। **এই রাউন্ডে views/shared/** নতুন ডিরেক্টরি + tokens.css/shared.css + ৪টি API + গার্ড-লিন্ট।

**নতুন-ইন্টিগ্রেশন-পয়েন্ট (সব এজেন্টের জন্য বাধ্যতামূলক):**
- **কম্পোনেন্ট-ম্যাট্রিক্স:** `shared/post/FeedPostCard.ejs` (item+user+myBookmarkedIds+opts{profileMode,showPin,cardClass,pinnedLabel,showDrawer}) — /dashboard, /profile/[id], /me, ফিড-সমতুল্য যেকোনো ভিউতে। `shared/post/PostFooterActions.ejs` — পুরনো actions-bar-এর সুপারসেট (প্যারাম-নাম এক, শিমে delegate)। `shared/post/PostActionMenu.ejs` (+pin{enabled,pinned})। `shared/comment/CommentItem.ejs` (c+link+user+compact; recursive) — সার্ভার-রেন্ডার দরকার হলে `GET /api/comments?post_id=N&format=html` কল করুন, নিজে DOM-বানাবেন না। `shared/comment/CommentComposer.ejs`। `shared/messenger/MessengerBubble.ejs` — নতুন মেসেজও JS-বিল্ডারে নয়, `GET /api/messages/render?conv_id=&after_id=` থেকে।
- **ডিজাইন-টোকেন:** নতুন CSS-এ রঙ লাগলে শুধু `var(--lf-*)` (tokens.css)। লিগ্যাসি --bg/--card/--text/--accent-ভ্যারগুলো রিম্যাপড — পুরনো কোডও এখন ক্যানোনিকাল মান পায়। **tokens.css head-এর সর্বশেষ** লোড হয় (header.ejs+layout.ejs উভয়ে) — কেউ লিংক-ক্রম বদলাবেন না।
- **গার্ড:** `npm run guard:design` — ক্যানোনিকাল-মার্কআপ shared/-বাইরে (togglePost3Dot, manual share-menu, bubble-actions, cmt-*, reaction-picker, data-rx-open…) ধরলে **ফেইল**; প্রতি QA-রাউন্ডে চালান। delegate-শিম (partials/ ৫টি ফাইল) allowlistেড — ওগুলোতে মার্কআপ ফেরালেও ফেইল।
- **নতুন API চুক্তি:** PUT/DELETE `/api/comments/:id` (মালিক/মড; delete → replies-ক্যাসকেড + likes-ক্লিনআপ + comment_count-ডিক্রেমেন্ট) · `/api/reactions/:type/:id` এখন users[]-ও দেয় (রিঅ্যাক্টরস-মডাল — ReactorsModal.ejs প্রতি-পেজ-একবার include + data-rx-open ট্রিগার)।
- **কমেন্ট-থ্রেড রিলোড-নেই:** article-পেজেও সাবমিটের পর `.comments-list[data-post-link]` + format=html-সোয়াপ (comment-tools.js §৬.a) — নতুন থ্রেড-ভিউতেও এই প্যাটার্ন নিন।

**গোটচা (নতুন/পুনঃপ্রমাণিত):**
1. **optimistic-বাবল ↔ ক্যানোনিকাল-প্রতিস্থাপন:** সেন্ড-সাকসেসে tmp-এর আইডি-রি-অ্যাসাইন করলে poll-echo `data-id`-ডুপ ধরে appendMessage স্কিপ করে → tmp-চিরস্থায়ী হয়ে যায় (এই-রাউন্ডে ধরা বাগ)। সমাধান: `_pendingTmp105` + text/dup-sweep — messages-chat.ejs-এর প্যাটার্ন কপি করুন।
2. **`/api/messages/render`-এ after_id=0 বৈধ** (নতুন কনভার্সেশন) — falsy-চেকে আর্লি-রিটার্ন করবেন না।
3. **layout.ejs বনাম partials/header.ejs — দুই-হেড:** পাবলিক-পেজ (/, /articles, /gallery…) layout.ejs-এর head ব্যবহার করে, মেম্বার-পেজ header.ejs — নতুন গ্লোবাল CSS হলে **দুটোতেই** যোগ করতে হয় (guard এখন দুটোই চেক করে)।
4. **style.css-এডিটের পর সার্ভার-রিস্টার্ট** (AV-বুট-হ্যাশ) — পুরনো-গোটচা পুনঃপ্রমাণিত; css/js-এডিটের পরেই browser-QA।
5. seed-ডেমো-ফিড: `scripts/seed-demo-feed-105.js` — সার্ভার pkill -9-এর **পরে** চালান, তারপর বুট (SIGTERM-save clobber)।

**QA-প্রমাণ:** guard গ্রিন ✓ · ফিড-ড্রয়ার/প্যালেট/ব্যাজ/এডিট/ডিলিট/মডাল/শেয়ার-৩/চ্যাট-প্রতিস্থাপন/৩৯০px-০/কনসোল-০ ✓ · টোকেন-কম্পিউটেড-ভ্যালু (দুই-লেআউটেই) ✓ — বিস্তারিত PROJECT.md Changelog সেশন ১০৫।

**পরবর্তী-সুপারিশ:** ① /qa-single-এর answer-কার্ড CommentItem-এ (উত্তর-থ্রেড কমেন্ট-সমতা) ② /notifications ফুল-পেজে actor-avatar ③ ইনবক্স-প্রিভিউতে MessengerBubble-মিনি ④ role-policy স্যুটে নতুন comment-API-চেক (PUT/DELETE 403/404-পাথ) ⑤ tokens.css-হার্ডকোড-হেক্স-স্ক্যান গার্ডে যোগ।

### Cross-Agent Note — Session 112 ('পড়া চালিয়ে যান' + QA-এনভ)

1. **lf_read_pos-চুক্তি (ভবিষ্যৎ-পাঠক):** রেকর্ড-শেপ এখন `{r, t, ti, u}` (postId-কী)। ti/u ছাড়া এন্ট্রি continue-reading.js উপেক্ষা করে — নতুন-কোডে সরাসরি map লিখলে অবশ্যই ti+u দিন; ≥.95-এ অটো-ডিলিট অক্ষুণ্ণ।
2. **মৃত-সিলেক্টর-সন্দেহ → od-প্রথমে:** টার্মিনাল/টুল-আউটপুটে `[h`-জাতীয় কিছু 'খাওয়া' দেখালে আগে `sed -n 'Np' file | od -c` দিয়ে raw-bytes দেখুন — ডিসপ্লে-আর্টিফ্যাক্ট ও বাস্তব-করাপশন একই-রকম দেখায় (এই-রাউন্ডে `.ws91-chart-wrap[hidden]` মিথ্যা-অ্যালার্ম প্রমাণিত)।
3. **ড্যাশবোর্ড-সাইডবার মার্কআপ-চুক্তি:** নতুন side-card-উইজেট হলে খালি-ডেটায় কার্ড-আঁকবেন না (msx/crx-প্যাটার্ন: mount+hidden বা সার্ভার-সাইড `<% if %>`); ইউজারের কমপ্যাক্ট-এসথেটিক অগ্রাধিকার।
4. **স্যান্ডবক্স-প্রসেস-রিপার:** এই-পরিবেশে Bash-কলের-মাঝে ব্যাকগ্রাউন্ড-সার্ভার নীরবে মরে (nohup/setsid-ও অনির্ভরযোগ্য) → রিপো-রুটের আনট্র্যাকড `ensure-server.sh` (health-check→setsid-বুট) প্রতিটি QA-ব্লকের আগে চালান; seed-আগে pkill নিয়ম অপরিবর্তিত।
5. **session105-guard-সহ-CSS-union:** EOF-union-এর পরে এখন তিন-স্তর-যাচাই: brace-depth-চেক → guard:design → ব্রাউজার-লাইভ (নতুন-ব্লক + আগের-ব্লকের একটি কর্মক্ষম-প্রমাণ, যেমন rt-chip)।
## Cross-Agent Note: Session 111 — কল-UX পলিশ প্যাকেজ: নেটওয়ার্ক-কোয়ালিটি পিল + ডায়াগনস্টিকস প্যানেল + দুর্বল-নেট-অটো-হিন্ট (১৮ সেপ্টেম্বর ২০২৬)

**প্রসঙ্গ:** QA-ফেজ সব-গ্রিন (role-policy ১০৭/১০৭ + calls-E2E ৫৪/৫৪ + cursor-E2E ২২/২২ + ব্রাউজার-সুইপ কনসোল-০ + 390px-ওভারফ্লো-০) — বাগ-না-পাওয়ায় কল-ডোমেইনের পরবর্তী-মূল্যবান পলিশ এই রাউন্ডে। মাস্টার-টেবিল ২০/২০-পরবর্তী রোডম্যাপ থেকে গ্রুপ-কল (ভারী — নিজস্ব-রাউন্ড) বাদে "কল-UX পলিশ" + "৩-Metered-TURN-যাচাই-সহায়তা"।

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
