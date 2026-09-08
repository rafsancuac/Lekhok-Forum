# আর্কিটেকচার অডিট — মেম্বার অ্যাকাউন্ট ক্লেইম, প্রোফাইল অ্যাক্টিভেশন ও নিবন্ধন

**টাস্ক:** master-prompt-member-accounts.md (টাস্ক ১৪)
**তারিখ:** 2026-09-08
**ফলাফল:** বিদ্যমান কাঠামো পরিদর্শন সম্পন্ন; নিচে কী কী পরিবর্তন দরকার তার মানচিত্র।

---

## ১. বিদ্যমান ডেটা মডেল (সত্য-উৎস)

### `users` (অথেনটিকেশন অ্যাকাউন্ট)
`id, username(UNIQUE), password_hash(bcrypt), full_name, email, phone, bio, designation, social_*, address, birth_date, gender, interests, notify_prefs, display_prefs, avatar_url, status('active'/'banned'), role('user'/'admin'/'moderator'), last_login, created_at, cover_url`

- **52 জন ইউজার**; ডেমো ইউজারদের `email` প্রায়ই `NULL`, লগইন হয় `username` দিয়ে।
- `status`-এ শুধু `active`/`banned` — **`pending` নেই**।

### `members` (সাংগঠনিক প্রোফাইল)
`id, name, role, designation, bio, image_url, social_fb, social_email, member_type('central'/'advisory'/'permanent'), sort_order, term_year, user_id(NULL→link), social_linkedin, message`

- **84 জন**; 74 জন `user_id`-তে লিংকড, **10 জন আনলিংকড** (উপদেষ্টা পরিষদ)।
- **`member_id` (MEM-XXXXX) নেই**; `department` কলাম নেই (designation দিয়ে আংশিক ম্যাপ)।
- `term_year` = কার্যবর্ষ (সেশন), `member_type` = ক্যাটাগরি, `role`/`designation` = পদবি।

### অথেনটিকেশন (`routes/auth.js`)
- `GET/POST /login` — `username OR email` + password; admin_users fallback।
- `GET/POST /register` — **তাৎক্ষণিক `active` + অটো-লগইন** (কোনো রিভিউ নেই)।
- `GET /logout`, `GET/POST /profile/edit`।
- ব্রুট-ফোর্স গার্ড (IP+username, ১০/১৫মিনিট) + CSRF + bcrypt(10) ইতিমধ্যে আছে।

### ক্লেইম/ভেরিফিকেশন
- **`account_claims` টেবিল নেই**; কোনো ক্লেইম ফ্লো নেই; Member ID ধারণাই নেই।

---

## ২. প্রম্পটের প্রয়োজনে গ্যাপ (কী পরিবর্তন করতে হবে)

| # | প্রয়োজন | বর্তমান | পরিবর্তন |
|---|---|---|---|
| 1 | `members.member_id` (MEM-XXXXX, UNIQUE) | নেই | নতুন কলাম + 84 জনে backfill |
| 2 | `members.department` | নেই | নতুন কলাম (designation থেকে সেরা-অনুমান backfill ঐচ্ছিক) |
| 3 | `members.account_status` / `claimed_at` / `verified_at` | নেই | নতুন কলাম |
| 4 | `account_claims` টেবিল | নেই | নতুন টেবিল |
| 5 | `users.status='pending'` (রিভিউ-অপেক্ষা) | শুধু active/banned | `pending` স্টেট ব্যবহার |
| 6 | Find-by-Member-ID + Name API | নেই | নতুন API |
| 7 | Unified entry page (login + find/create) | আলাদা /login, /register | `/login`-কে ইউনিফাইড করা |
| 8 | Claim form → PENDING_REVIEW | নেই | নতুন ফ্লো |
| 9 | New registration → PENDING_REVIEW (no auto-login) | auto-active | আচরণ বদল |
| 10 | Login via Member ID | username/email | member_id রেজলভ |
| 11 | Admin review dashboard (approve/reject) | নেই | নতুন |
| 12 | Bulk import (spreadsheet, no password col) | নেই | নতুন |
| 13 | Export members (password-free) | নেই | নতুন |
| 14 | Forgot/reset password | নেই | নতুন (নূন্যতম) |

---

## ৩. ম্যাপিং (প্রম্পট টার্ম → বিদ্যমান ফিল্ড)

| প্রম্পট | বিদ্যমান |
|---|---|
| Member ID | `members.member_id` (নতুন) |
| Name | `members.name` |
| Category (কমিটি/ক্যাটাগরি) | `members.member_type` (central/advisory/permanent) |
| Position (পদবি) | `members.role` + `members.designation` |
| Department | `members.department` (নতুন) |
| Session / কার্যবর্ষ | `members.term_year` |
| Profile photo | `members.image_url` |
| Bio | `members.bio` |

---

## ৪. নিরাপত্তা (ইতিমধ্যে আছে / দরকার)

- **আছে:** bcrypt(10), CSRF (সেশন-টোকেন), ব্রুট-ফোর্স রেট-লিমিট, সেশন কুকি (sameSite lax), অডিট লগ (`TA42.audit`), রোল-বেজড রিডিরেক্ট, open-redirect গার্ড।
- **যোগ করতে হবে:** ক্লেইম রেট-লিমিট, name-match যাচাই (backend), duplicate-claim প্রোটেকশন (UNIQUE constraint + transaction), plaintext পাসওয়ার্ড কখনো কোথাও না (ইমপোর্ট/এক্সপোর্টে কলাম-রিজেকশন), পাসওয়ার্ড-হ্যাশ শুধু সাবমিশনে।

---

## ৫. বাস্তবায়ন ক্রম (প্রম্পট সেকশন ৪০ অনুযায়ী)

1. Schema migration (member_id, department, account_status, claimed_at, verified_at, account_claims) + backfill।
2. Member ID ম্যানেজমেন্ট + bulk import + export (password-free)।
3. Find-প্রোফাইল API (name + member_id)।
4. Unified entry page।
5. Claim form।
6. User account creation/linking (pending status)।
7. New-registration → PENDING_REVIEW pipeline।
8. Admin review dashboard (approve/reject)।
9. Normal login (member_id/email/username) + password recovery।
10. Security hardening + testing।

---

## ৬. ঝুঁকি / রিগ্রেশন সতর্কতা

- **নিবন্ধন আচরণ বদল:** নতুন রেজিস্ট্রেশন আর তাৎক্ষণিক active+লগইন হবে না → ডেমো/টেস্ট ফ্লো ভাঙতে পারে; ব্যাকওয়ার্ড-কম্প্যাট রাখতে হবে।
- **লগইন আইডেন্টিফায়ার:** username-ভিত্তিক লগইন (ডেমো ইউজার) না ভেঙে member_id/email যোগ করতে হবে।
- **74 জন লিংকড মেম্বার** ইতিমধ্যেই সক্রিয় অ্যাকাউন্ট — এদের profile কে `claimed/active` ধরে backfill করতে হবে (নতুন ক্লেইম নয়)।
- **10 জন আনলিংকড উপদেষ্টা** — এইগুলিই আসল "প্রি-ক্রিয়েটেড + আনক্লেইমড" প্রোফাইল।
- কমিটি/মেম্বার পাবলিক পেজ (`/committee`, `/members`) অবশ্যই অক্ষত থাকতে হবে।

---

## ✅ বাস্তবায়ন সম্পন্ন (টাস্ক ১৪ — আপডেট)

**কমিট:** `d70e81d` — pushed & live-verified on Vercel.

**ইউজার-সিদ্ধান্ত (ask_user):** `unclaimed_keep_link` — সব ৮৪ প্রোফাইল `account_status='unclaimed'` (fresh claim ফ্লো), কিন্তু `user_id` লিংক অক্ষত (বিদ্যমান লগইন ভাঙে না, ডুপ্লিকেট প্রোফাইল হয় না)। এক-কালীন রিসেট `claimed_at IS NULL` গার্ডসহ, তাই অ্যাডমিন-অনুমোদিত প্রোফাইল কখনো রিসেট হয় না।

**যা যা যোগ হয়েছে:**
- `db.js` — `account_claims`, `password_resets` টেবিল; `members.member_id/department/account_status/claimed_at/verified_at`; `formatMemberId/nextMemberSeq/nextMemberId/backfillMemberIds`।
- `routes/member-accounts.js` — `POST /api/member-accounts/find` (authoritative member_id + name secondary, রেট-লিমিট), `POST /api/member-accounts/claim` (bcrypt, duplicate guards, pending), `GET /claim`।
- `routes/auth.js` — member_id/email/username লগইন; নিবন্ধনে অটো MEM ID + ঐচ্ছিক অ্যাডমিন-অনুমোদন গেট; forgot/reset password (SHA-256 টোকেন, ৬০ মিনিট)।
- `admin/routes.js` — `/admin/claims` রিভিউ (approve/reject/more-info), সদস্য তৈরিতে অটো member_id, বাল্ক CSV ইমপোর্ট (পাসওয়ার্ড-কলাম পুরো-ফাইল প্রত্যাখ্যান, ডুপ্লিকেট স্কিপ), পাসওয়ার্ড-মুক্ত এক্সপোর্ট, `/admin/settings/registration` টগল।
- ভিউ — unified `/login` (লগইন + খুঁজুন/তৈরি), `/claim`, `/register-pending`, forgot/reset পেজ; অ্যাডমিন ক্লেইম লিস্ট/ইমপোর্ট/সদস্য ফর্ম/সাইডবার/সেটিংস টগল।

**টেস্ট (সব পাস):** find (found/name-mismatch/not-found), claim (success/pending/dup/password-mismatch), approve → active → MEM ID লগইন, রেজিস্ট্রেশন (instant-active + approval-gated pending → approve → লগইন), বাল্ক ইমপোর্ট (2 তৈরি/1 ডুপ স্কিপ + পাসওয়ার্ড-কলাম প্রত্যাখ্যান), এক্সপোর্ট, forgot→reset→নতুন পাসওয়ার্ডে লগইন, রিগ্রেশন (/ /login /register /committee /about /members /admin/*)।
