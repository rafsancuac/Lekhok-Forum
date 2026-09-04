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
