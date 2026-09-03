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
- **Turso/Vercel async মাইগ্রেশন এখনো বাকি** — কেউ Vercel deploy নিয়ে কাজ করলে এটা priority #1,
  কিন্তু স্কোপ অনেক বড় (৩২০+ কল-সাইট)। শুরু করার আগে PROJECT.md §১২ পড়ুন।
