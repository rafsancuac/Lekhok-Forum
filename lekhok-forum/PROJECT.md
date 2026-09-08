# লেখক ফোরাম — সম্পূর্ণ প্রজেক্ট ডকুমেন্টেশন

> **সংস্করণ:** v5 (লগইন/মডারেটর সেশন ৮-এর ফিক্সের পর) · **শেষ হালনাগাদ:** ৪ সেপ্টেম্বর ২০২৬
> **রিপোজিটরি:** https://github.com/rafsancuac/Lekhok-Forum.git
>
> এই ফাইলটা পুরো প্রজেক্টের একমাত্র সোর্স অব ট্রুথ। **একাধিক এজেন্ট সমান্তরালে এই রিপোতে কাজ
> করছে** — কাজ শুরুর আগে সবসময় `git fetch && git log origin/main` চেক করুন, এবং কাজ শেষে
> এই ফাইলে নিজের Changelog entry যোগ করে তারপর push করুন।

> ## ✅ Turso/Vercel মোড এখন কার্যকর
> ~~এখানে আগে লেখা ছিল "Turso/Vercel মোড ভাঙা" — commit `5aa3eda`-এ আরেকটা এজেন্ট পুরো
> async migration সম্পন্ন করেছে (৩৩০টা call site await করা হয়েছে, route handlers async
> বানানো হয়েছে, error middleware যোগ)।~~ সেশন ৬-এ স্বাধীনভাবে যাচাই করা হয়েছে (public
> pages, auth, admin, moderator, reactions, messenger — কোনো `[object Promise]` লিক ছাড়াই)।
> সেশন ৭-এ fresh-Turso ডেমো-সিডিং ফিক্সসহ **দুটো ব্যাকএন্ডই ৯১/৯১ চেক পাস করে**
> (`bash scripts/test-lekhok.sh`; sql.js + `TURSO_DATABASE_URL=file:...` ফাইল-মোড)।
> Turso বাস্তব ক্রেডেনশিয়াল দিয়ে টেস্ট হয়নি — কোড-লেভেলে প্যাটার্ন সামঞ্জস্যপূর্ণ।

---

## সূচিপত্র

1. [প্রজেক্ট পরিচিতি ও মূল ভিশন](#১-প্রজেক্ট-পরিচিতি-ও-মূল-ভিশন)
2. [টেকনোলজি স্ট্যাক](#২-টেকনোলজি-স্ট্যাক)
3. [কীভাবে চালাবেন](#৩-কীভাবে-চালাবেন)
4. [ফাইল স্ট্রাকচার](#৪-ফাইল-স্ট্রাকচার)
5. [ডাটাবেজ স্কিমা](#৫-ডাটাবেজ-স্কিমা)

6. [রাউট ম্যাপ](#৬-রাউট-ম্যাপ)
7. [ডেমো অ্যাকাউন্ট ও সিড ডাটা](#৭-ডেমো-অ্যাকাউন্ট-ও-সিড-ডাটা)
8. [ডিজাইন সিস্টেম](#৮-ডিজাইন-সিস্টেম)
9. [বর্তমান অবস্থা — সেকশন-ভিত্তিক স্ট্যাটাস](#৯-বর্তমান-অবস্থা--সেকশন-ভিত্তিক-স্ট্যাটাস)
10. [Changelog — কী কী করা হয়েছে, কোন সেশনে](#১০-changelog)
11. [বাগ ফিক্স হিস্ট্রি (সব ঠিক হয়ে গেছে — রেফারেন্সের জন্য রাখা)](#১১-বাগ-ফিক্স-হিস্ট্রি)
12. [জানা সমস্যা — এখনো বাকি](#১২-জানা-সমস্যা--এখনো-বাকি)
13. [রেফারেন্স সাইট থেকে নেওয়া আইডিয়া](#১৩-রেফারেন্স-সাইট-থেকে-নেওয়া-আইডিয়া)
14. [ইম্প্রুভমেন্ট রোডম্যাপ](#১৪-ইম্প্রুভমেন্ট-রোডম্যাপ)
15. [ডিপ্লয়মেন্ট গাইড](#১৫-ডিপ্লয়মেন্ট-গাইড)
16. [গিট হিস্ট্রি](#১৬-গিট-হিস্ট্রি)

---

## ১. প্রজেক্ট পরিচিতি ও মূল ভিশন

**লেখক ফোরাম** একটি সম্পূর্ণ বাংলা ভাষার সোশ্যাল রাইটিং প্ল্যাটফর্ম — লেখকরা নিবন্ধন করে লেখা প্রকাশ করতে পারেন, প্রশ্ন করতে পারেন, একে-অপরকে মেসেজ করতে পারেন, আর নির্বাচিত মডারেটররা প্রতিদিনের কনটেন্ট (কুইজ, ই-পেপার, এই দিনে ইত্যাদি) পরিচালনা করতে পারেন — সব কিছুই এডমিনের নিয়ন্ত্রণে থাকা পারমিশন সিস্টেমের মাধ্যমে।

### মূল ২২টা সেকশন (আসল দাবি)
লেখক প্রোফাইল · ইউজার আইডি (auth) · সংগঠন পরিচিতি · রানিং কমিটি · সাবেক সভাপতি/সাধারণ সম্পাদক · ইভেন্ট পেইজ · প্রকাশিত লেখা · অর্জন/পুরস্কার · গঠনতন্ত্র · আজকের কুইজ · আজকের এই দিনে · মাসিক সেরা লেখক · সাংগঠনিক কার্যক্রম · যোগাযোগ · বিজ্ঞপ্তি · সাধারণ জিজ্ঞাসা (Q&A) · ফাইল সেকশন · সদস্য পরিচিতি · আজকের ই-পেপার · উপদেষ্টা পর্ষদ · জন্মদিনের শুভেচ্ছা

### পরে যোগ হওয়া চাহিদা
- গ্যালারি পেইজ (ছবি + ক্যাপশন), প্রতিটা সেকশনে ~১০টা ডেমো আইটেম
- ফেসবুক-স্টাইল ড্যাশবোর্ড ফিড, মেসেঞ্জার-স্টাইল DM (ফাইল এটাচমেন্টসহ)
- প্রাইভেট অভিযোগ পেইজ (ফাইল এটাচমেন্টসহ) — শুধু এডমিন/নির্বাচিত মডারেটর দেখবে
- **এডমিন প্রতিটা মডারেটরের কাজের পরিধি (permission scope) আলাদাভাবে কন্ট্রোল করতে পারবে**
- মডারেটর পোস্ট করলে সব ইউজারকে অটো-নোটিফিকেশন
- ফন্ট: Hind Siliguri, Tiro Bangla, SolaimanLipi, Kalpurush, Times New Roman
- ব্র্যান্ডিং কড়াভাবে নিরপেক্ষ — `bycwf.org` / `CURHS` / "বাংলাদেশ তরুণ কলাম লেখক ফোরাম" কোথাও থাকবে না
- ডিজাইন আইডিয়া রেফারেন্স সাইট থেকে (কোড/কন্টেন্ট কপি না করে, শুধু স্ট্রাকচারাল প্যাটার্ন)
- WhatsApp/Email নোটিফিকেশন ইন্টিগ্রেশন — **ভবিষ্যতে** (ব্যবহারকারী নিজেই বলেছেন "পরে")

### মূল ফিচার সেট (সারাংশ টেবিল)

| ক্যাটাগরি | ফিচার |
|---|---|
| **সোশ্যাল** | ইউজার অ্যাকাউন্ট, প্রোফাইল, আর্টিকেল, প্রশ্নোত্তর, লাইক, কমেন্ট, বুকমার্ক, ফলো, @মেনশন, #হ্যাশট্যাগ |
| **মেসেজিং** | মেসেঞ্জার-স্টাইল DM, **ফাইল অ্যাটাচমেন্ট (কার্যকর — multer দিয়ে)** |
| **ডেইলি কনটেন্ট** | আজকের কুইজ, এই দিনে, ই-পেপার, সাংগঠনিক কার্যক্রম, মাসিক সেরা লেখক |
| **ফেসবুক-স্টাইল ফিড** | ড্যাশবোর্ডে সবার পোস্ট, লাইক/কমেন্ট |
| **প্রাইভেসি** | প্রাইভেট অভিযোগ পেজ (এডমিন + scope-প্রাপ্ত মডারেটর), প্রোফাইল প্রাইভেসি কন্ট্রোল |
| **মডারেটর পারমিশন** | এডমিন যেকোনো ইউজারকে ৮টা নির্দিষ্ট scope দিয়ে মডারেটর বানাতে পারে |
| **সংগঠন** | কমিটি, সাবেক নেতৃত্ব, উপদেষ্টা পর্ষদ, গঠনতন্ত্র, অর্জন, গ্যালারি |
| **নোটিফিকেশন** | বেল আইকন, ৩০s পোলিং, জন্মদিন, লাইক/কমেন্ট/ফলো/মেসেজ/মডারেটর-পোস্ট ব্রডকাস্ট |
| **অ্যাডমিন** | notices/events/members/gallery/resources/settings CRUD + মডারেটর ম্যানেজমেন্ট + অভিযোগ প্যানেল |

---

## ২. টেকনোলজি স্ট্যাক

| লেয়ার | টেকনোলজি | নোট |
|---|---|---|
| রানটাইম | Node.js | — |
| ফ্রেমওয়ার্ক | Express.js | — |
| টেমপ্লেট | EJS | **layout ইঞ্জিন disabled** (`app.set('layout', false)`) — প্রতিটা view স্বয়ংসম্পূর্ণ HTML ডকুমেন্ট হতে হয় (নিচে §১২-এ এই প্যাটার্নের একটা সাইড-ইফেক্ট বাগ উল্লেখ আছে) |
| ডাটাবেজ | **sql.js** (WebAssembly SQLite) | better-sqlite3-এর বদলে — নেটিভ কম্পাইল লাগে না, যেকোনো হোস্টে চলে; ফাইল-ভিত্তিক `lekhok.db`, ডিবাউন্স করে (200ms) ডিস্কে সেভ হয় |
| অথ | express-session + bcryptjs | কুকি সেশন, পাসওয়ার্ড হ্যাশ |
| ফাইল আপলোড | **multer** | এই session-এ ওয়্যার করা হয়েছে (আগে শুধু dependency ছিল, ব্যবহার হতো না) |
| ফর্ম মেথড | method-override | `?_method=PUT/DELETE` কোয়েরি-স্ট্রিং প্যাটার্ন |
| ফন্ট | Hind Siliguri, Tiro Bangla, SolaimanLipi (CDN ডিফল্ট), Kalpurush, Times New Roman | মাল্টি-ফন্ট টগল সিস্টেম (`fonts.css`) — ড্যাশবোর্ড/ইউজার পেজে সক্রিয়, **পাবলিক পেজে এখনো যুক্ত হয়নি** |
| আইকন | Font Awesome 6.5.1 | CDN |

### sql.js-এর গুরুত্বপূর্ণ বৈশিষ্ট্য (db.js)

```js
db.prepare('SELECT ...').get(param)   // এক রো
db.prepare('SELECT ...').all(param)   // সব রো
db.prepare('INSERT ...').run(params)  // রাইট + ডিবাউন্সড অটো-সেভ + lastInsertRowid (ফিক্সড, নিচে দেখুন)
```

**সতর্কতা:**
- `stmt.bind()` **undefined ভ্যালু রিজেক্ট করে** — সব প্যারামিটারে `|| null` ব্যবহার করা উচিত
- প্রতি `run()`-এর পর ২০০ms ডিবাউন্স করে ডিস্কে সেভ হয় (`persist()`)
- **সার্ভার প্রসেস বন্ধ হওয়ার সময় (`SIGINT`/`SIGTERM`) এখন জোর করে flush হয়** (এই session-এর ফিক্স — আগে ছিল না)

---

## ৩. কীভাবে চালাবেন

```bash
cd lekhok-forum
npm install          # প্রথমবার
node server.js       # http://localhost:8080
```

- **সাইট:** http://localhost:8080
- **অ্যাডমিন প্যানেল:** http://localhost:8080/admin → `admin` / `admin123` *(ডেমো — প্রোডাকশনে অবশ্যই বদলাতে হবে)*
  v2.6 থেকে **একই ক্রেডেনশিয়াল `/login` (ইউজার পেজ) থেকেও কাজ করে** — অ্যাডমিন লগইন করলে সরাসরি `/admin`-এ পড়বেন।
- **ডেমো মডারেটর:** `moderator` / `moderator123` → `/login` থেকে লগইন, প্যানেল `/moderator`
  (সব স্কোপ আছে; `/admin`-এর স্কোপড সেকশনগুলোও দেখতে পারে) *(ডেমো — প্রোডাকশনে বদলাতে হবে)*
- **ডেমো ইউজার:** `ismail` / `monem` / `karishma` / `mahfuz` / `nusrat` → পাসওয়ার্ড `demo123`
- পোর্ট বদলাতে: `PORT=3000 node server.js`
- ডাটাবেজ রিসেট: `lekhok.db` ফাইল ডিলিট করে সার্ভার রিস্টার্ট করলেই অটো সিড হয়ে যায়
- **প্রোডাকশন সিক্রেট:** `SESSION_SECRET` এনভায়রনমেন্ট ভ্যারিয়েবল সেট করা উচিত (এখন হার্ডকোডেড ডিফল্ট আছে)

---

## ৪. ফাইল স্ট্রাকচার

```
lekhok-forum/
├── server.js              # Express অ্যাপ, মিডলওয়্যার, রাউট মাউন্ট, graceful shutdown
├── db.js                  # sql.js ইনিট + টেবিল মাইগ্রেশন + সিড + মডারেটর হেল্পার ফাংশন
├── package.json
│
├── middleware/
│   └── upload.js          # multer: messageUpload (10MB), complaintUpload (15MB)
│
├── routes/
│   ├── auth.js            # /login /register /logout /profile/edit
│   ├── social.js          # articles, questions, members, profile, like/comment/follow API
│   ├── daily.js           # quiz, on-this-day, epaper, activities, best-writer, birthdays...
│   ├── dashboard.js       # ফেসবুক-ফিড, gallery, messages (+ফাইল), complaints (+ফাইল)
│   ├── moderator.js       # স্কোপড মডারেটর পোস্টিং প্যানেল (নতুন)
│   ├── pages.js           # about, committee, contact, notices, events, home
│   ├── api.js             # JSON API: notifications count ইত্যাদি
│   └── avatar.js          # /avatar/:id — জেন্ডার-ভিত্তিক ডিফল্ট SVG
│
├── admin/
│   ├── routes.js          # CRUD (notices/events/members/gallery/resources/settings) + মডারেটর ম্যানেজমেন্ট + অভিযোগ
│   └── views/admin/       # dashboard, sidebar, প্রতিটা সেকশনের ফর্ম/লিস্ট, moderators.ejs, complaints.ejs
│
├── views/
│   ├── partials/header.ejs   # টপবার+নেভবার+নোটিফ বেল — একটা সম্পূর্ণ HTML ডকুমেন্টও বটে (§১২ দেখুন)
│   ├── user/                  # ৩০+ ইউজার-ফেসিং পেজ (dashboard, articles, messages-chat, moderator-*...)
│   ├── lekhok-*.ejs           # v1-এর ৯টা পাবলিক পেজ (home, about, committee, contact...)
│   ├── layout.ejs, 404.ejs
│
├── public/assets/
│   ├── css/                   # style, fonts, feed, dashboard, admin
│   ├── js/main.js
│   └── uploads/                # ইউজার-আপলোডকৃত ফাইল (gitignored, শুধু .gitkeep কমিটেড)
│
└── lekhok.db                  # SQLite ফাইল (gitignored, রান করলে অটো তৈরি+সিড হয়)
```

---

## ৫. ডাটাবেজ স্কিমা

**মোট ~২১টা টেবিল** (`db.js` → `runMigrations()`):

### v1 টেবিল
| টেবিল | কাজ |
|---|---|
| `admin_users` | অ্যাডমিন লগইন |
| `notices`, `events`, `members`, `resources`, `settings`, `contact_submissions` | মূল সাইট কনটেন্ট |

### v2 সোশ্যাল/পারমিশন টেবিল
| টেবিল | কাজ | গুরুত্বপূর্ণ কলাম |
|---|---|---|
| `users` | ইউজার অ্যাকাউন্ট | username, password_hash, full_name, gender, birth_date, show_email/phone/birth, avatar_url, status, **role** (ALTER দিয়ে যোগ হয়েছে) |
| `moderators` | মডারেটর তালিকা | user_id, added_by |
| `moderator_scopes` | সেকশন-ভিত্তিক পারমিশন | user_id, scope, granted_by — **এখন সম্পূর্ণ কার্যকর** (৮টা scope: quiz/this_day/best_writer/activity/notice/epaper/event/complaints) |
| `posts` | আর্টিকেল + প্রশ্ন | author_id, type, tags, category, status, featured, view/like/comment_count |
| `comments`, `likes`, `bookmarks`, `follows` | সোশ্যাল ইন্টারঅ্যাকশন | — |
| `daily_content` | কুইজ/এই দিনে/ই-পেপার/কার্যক্রম | content_type, scheduled_date, published, author_id, link_url |
| `notifications` | নোটিফিকেশন | user_id, type, link, is_read |
| `conversations` + `messages` | DM | user_a/b, sender_id, body, **file_url, file_name** (এখন multer দিয়ে বাস্তবে কাজ করে) |
| `complaints` | প্রাইভেট অভিযোগ | submitted_by, subject, body, **file_url, file_name** (ALTER দিয়ে যোগ হয়েছে), status, admin_notes |
| `gallery`, `achievements`, `past_leaders`, `constitution` | স্ট্যাটিক-ঘরানা সেকশন | — |

**সিড শর্ত:** `admin_users > 0 AND gallery > 0` হলে সিড স্কিপ হয়।

---

## ৬. রাউট ম্যাপ

### পাবলিক পেজ (লগইন ছাড়া)
`/`, `/articles`, `/articles/:id`, `/qa`, `/questions/:id`, `/members`, `/profile/:username`, `/quiz`, `/on-this-day`, `/epaper`, `/activities`, `/best-writer`, `/achievements`, `/constitution`, `/committee`, `/committee/past`, `/committee/advisory`, `/gallery`, `/birthdays`, `/notices`, `/events`, `/resources`, `/about`, `/contact`, `/avatar/:id`

### লগইন-লাগবে (302 → /login)
`/dashboard`, `/messages`, `/messages/:username`, `/complaints`, `/articles/new`, `/questions/new`, `/profile/edit`, `/notifications`

### মডারেটর প্যানেল (`/moderator`, scope-guarded) — নতুন
| রাউট | দরকারি scope |
|---|---|
| `/moderator` | (কোনোটাই — শুধু dashboard) |
| `/moderator/daily/:type` (quiz/this_day/activity/epaper) | সংশ্লিষ্ট scope |
| `/moderator/notices` | `notice` |
| `/moderator/events` | `event` |
| `/moderator/best-writer` | `best_writer` |
| `/moderator/complaints` | `complaints` |

অ্যাডমিন (`role === 'admin'`) স্বয়ংক্রিয়ভাবে সব scope পায়, আলাদা করে assign করা লাগে না।

### JSON API (`/api`)
`/api/notifications/count` + like/comment/follow/bookmark POST এন্ডপয়েন্ট (social.js)

### অ্যাডমিন (`/admin`, session-guarded)
notices/events/members/gallery/resources CRUD + settings + messages (contact form submissions) + **moderators (নতুন)** + **complaints (নতুন)**

---

## ৭. ডেমো অ্যাকাউন্ট ও সিড ডাটা

### ডেমো ইউজার (পাসওয়ার্ড: `demo123`)
`ismail`, `monem`, `karishma`, `mahfuz`, `nusrat`

> ⚠️ **লগইন দুই রকম:** সোশ্যাল ইউজাররা `/login`-এ ঢোকে; **এডমিন আলাদা** — `/admin/login`-এ
> `admin` / `admin123` (admin_users টেবিল থেকে)। পুরনো ডকে amin/sadia/… লেখা থাকলে সেটা আউটডেটেড।

### সিড কাউন্ট (যাচাইকৃত)
| টেবিল | সংখ্যা |
|---|---|
| gallery | 10 |
| posts (আর্টিকেল+প্রশ্ন) | 20 |
| daily_content (প্রতি টাইপে ~10) | 40 |
| achievements | 10 |
| past_leaders | 10 |
| constitution | 10 |
| members (কমিটি+উপদেষ্টা) | 16 |
| resources | 10 |
| notices | 6 |
| events | 4 |

---

## ৮. ডিজাইন সিস্টেম

### কঠোর দুই-ফন্ট নিয়ম (`public/assets/css/fonts.css`) — সেশন ১৪ থেকে কার্যকর
**সাইট-ওয়াইড শুধু দুটি ফন্ট, কঠোরভাবে অনুসরণীয়:**
- **Hind Siliguri** → সব হেডিং (h1–h6), সাব-হেডিং, মেনু/নেভ, লোগো, সেকশন/কার্ড টাইটেল, টেবিল হেডার (th), বড় সংখ্যা
- **Kalpurush** → বাকি সব (বডি টেক্সট, প্যারাগ্রাফ, লিস্ট, টেবিল সেল, ফর্ম, বাটন)
- নিয়ম ভাঙা যাবে না — নতুন CSS-এ ফন্ট লাগলে `var(--font-hs)` বা `var(--font-kp)` ব্যবহার করুন; অন্য কোনো ফন্ট-ফ্যামিলি যোগ নিষিদ্ধ
- SolaimanLipi CDN সম্পূর্ণ সরানো হয়েছে — সব ফন্ট লোকাল (fonts/ = HindSiliguri×৫ ওয়েট + kalpurush.ttf)
- পুরনো `--font-display/serif/hand/sans/base/bn` ভেরিয়েবল ও `body.font-*` প্রেফারেন্স ক্লাস এখন এই দুই ফন্টেই রিম্যাপড (backward-compatible)

### UI কম্পোনেন্ট
- **Topbar:** ব্র্যান্ড + নোটিফ বেল (ড্রপডাউন, unread ব্যাজ) + ইউজার মেনু (ড্যাশবোর্ড পেজে)
- **Navbar:** ১৭টা সেকশন লিংক সমতলে (গ্রুপিং করা হয়নি এখনো)
- **ফিড কার্ড:** অ্যাভাটার + লেখকবার + বডি + লাইক/কমেন্ট/শেয়ার
- **ডিফল্ট অ্যাভাটার:** জেন্ডার-ভিত্তিক ইনলাইন SVG (male/female/neutral) — এক্সটার্নাল সার্ভিস নেই

---

## ৯. বর্তমান অবস্থা — সেকশন-ভিত্তিক স্ট্যাটাস

| # | সেকশন | স্ট্যাটাস |
|---|---|---|
| ১ | লেখক প্রোফাইল | ✅ `/profile/:username` |
| ২ | ইউজার আইডি | ✅ auth সম্পূর্ণ, gender-ভিত্তিক default avatar |
| ৩,১০ | সংগঠন পরিচিতি | ✅ static `/about` |
| ৪ | রানিং কমিটি | ✅ `/committee` |
| ৫ | সাবেক নেতৃবৃন্দ | ✅ `/committee/past` |
| ৬ | ইভেন্ট পেইজ | ✅ + **মডারেটর পোস্ট করতে পারে** |
| ৭ | প্রকাশিত লেখা | ✅ `/articles`, কমেন্ট/লাইক |
| ৮ | অর্জন/পুরস্কার | ✅ `/achievements` |
| ৯ | গঠনতন্ত্র | ✅ `/constitution` |
| ১১ | আজকের কুইজ | ✅ + **মডারেটর পোস্টিং** |
| ১২ | আজকের এই দিনে | ✅ + মডারেটর পোস্টিং |
| ১৩ | মাসিক সেরা লেখক | ✅ `/best-writer` + **মডারেটর টগল** |
| ১৪ | সাংগঠনিক কার্যক্রম | ✅ + মডারেটর পোস্টিং |
| ১৫ | যোগাযোগ | ✅ static + ফর্ম |
| ১৬ | বিজ্ঞপ্তি | ✅ + **মডারেটর পোস্টিং** |
| ১৭ | Q&A | ✅ `/qa` |
| ১৮ | ফাইল সেকশন | ✅ `/resources` |
| ১৯ | সদস্য পরিচিতি | ✅ `/members` — রেজিস্ট্রেশনে অটো-যুক্ত |
| ২০ | আজকের ই-পেপার | ✅ + মডারেটর পোস্টিং |
| ২১ | উপদেষ্টা পর্ষদ | ✅ `/committee/advisory` |
| ২২ | জন্মদিনের শুভেচ্ছা | ✅ `/birthdays` |

**অতিরিক্ত ফিচার:** গ্যালারি ✅ · ড্যাশবোর্ড ফিড ✅ · মেসেজিং+ফাইল ✅ · অভিযোগ+ফাইল+এডমিন/মডারেটর ভিউ ✅ · নোটিফিকেশন+ব্রডকাস্ট ✅ · **মডারেটর পারমিশন সিস্টেম ✅ (সম্পূর্ণ, এই session-এ তৈরি)**

---

## ১০. Changelog

### সেশন ৫৫ (৮ সেপ্টেম্বর ২০২৬) — মাল্টি-ইমেজ আপলোড ও গ্যালারি ডিসপ্লে (টাস্ক ১৩, পর্ব ৪, অংশ ক)

**উদ্দেশ্য:** ৬ পোস্ট টাইপে (Notice, Event, Daily, News/press, Social Feed, User Feed) একাধিক ছবি — multi-select + drag&drop + preview + reorder + রিমুভ + গ্যালারি/লাইটবক্স ডিসপ্লে।

**ডেটা মডেল:**
- `db.js` — জেনেরিক `post_images(entity_type, entity_id, image_url, sort_order, created_at)` টেবিল (সব ৬ টাইপ এক টেবিলে; sort_order → reorder)।
- মাইগ্রেশন `post_images_v6_seeded` (আইডেম্পোটেন্ট): বিদ্যমান `events.image_url`/`daily_content.image_url`/`press_clippings.image_url`/`posts.cover_image` → `post_images` (sort_order 0); মূল single-image কলাম অক্ষত (backward-compat, ডেটা-লস শূন্য)।
- হেল্পার `getPostImages`/`setPostImages` (ডুয়াল sql.js + Turso) এক্সপোর্ট।

**আপলোড এন্ডপয়েন্ট:** `/admin/upload-images` (staff) + `/upload-images` (লগইন-করা ইউজার, লেখা-ফর্মের জন্য) — JSON, সর্বোচ্চ ২০ ফাইল/রিকোয়েস্ট, WebP-অপটিমাইজ (existing `storeBufferImage` pipeline reuse)।

**পারসিস্টেন্স (create + edit, সব ৬ টাইপ):** Notice/Event/Daily/News + Social/User Feed (posts) — অ্যাডমিন ও মডারেটর রুটে `setPostImages`; শেয়ার (share) করলে মূল পোস্টের ছবিও কপি; trashDelete-এ `post_images` অরফান-ক্লিনআপ।

**আপলোড UI:** reusable `admin/views/admin/partials/multi-image.ejs` + `public/assets/js/multi-image.js` + `multi-image.css` — multi-select, drag&drop, preview-grid, drag-reorder, ব্যক্তিগত রিমুভ, লোডিং/সাকসেস/এরর স্ট্যাটাস। অ্যাডমিন (events/notices/daily) + মডারেটর (events/daily/notices/press) + ইউজার লেখা-ফর্মে বসানো।

**ফ্রন্টএন্ড ডিসপ্লে:** reusable `views/partials/post-gallery.ejs` + `public/assets/js/post-gallery.js` — ১ ছবি → আগের মতো একক `<img>` (গ্যালারি UI নেই); ১+ → main + thumbnail strip (অ্যাডমিন-সেট ক্রম) + shared lightbox (prev/next/Esc, ক্লিক-করা থাম্বের ইনডেক্স থেকে খোলে) + lazy-loading। ইভেন্ট/প্রেস/নোটিশ-বিস্তারিত/লেখা-তালিকা/লেখা-বিস্তারিত/ফিড(dashboard)/ডেইলি(epaper/on-this-day/activities)-এ লাগানো। `.lightbox-nav` স্টাইল যোগ (গ্যালারি পেজের আনস্টাইলড nav-ও ঠিক)।

**যাচাই:** মাইগ্রেশন সিড ৩৪ সারি (event 4 + daily 30); E2E — ২ ছবি আপলোড → মাল্টি-ইমেজ ইভেন্ট/প্রেস তৈরি → পাবলিক পেজে pg-gallery + count + ক্রম অনুযায়ী থাম্ব; পাবলিক ১২ পেজ + অ্যাডমিন/মডারেটর/লেখা-ফর্ম ২০০; প্রেস images-only POST (ভ্যালিডেশন ফিক্স) ৩০২।

---

### সেশন ৫৪ (৮ সেপ্টেম্বর ২০২৬) — লগইন/রেজিস্ট্রেশন UI: স্থিতিশীলতা + প্রিমিয়াম রিডিজাইন (টাস্ক ১১)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** ভাসমান আপ-অ্যারো বাটন সরানো; স্ক্রল/টাচপ্যাডে লগইন/রেজিস্ট্রেশন/মডাল নড়া বন্ধ; লগইন/রেজিস্ট্রেশন UI প্রিমিয়াম — কোনো ফাংশনালিটি না ভেঙে।

**১) ভাসমান আপ-অ্যারো (scroll-to-top) অপসারিত:**
- `views/layout.ejs` — হার্ডকোডেড `<button class="back-to-top">` ব্লক সরানো।
- `public/assets/js/main.js` (minified) — ডাইনামিক back-to-top ইনজেকশন + স্ক্রল-হ্যান্ডলারে `f.classList.toggle("show")` + ক্লিক-হ্যান্ডলার — ৪টি স্নিপেট সার্জিক্যালি সরানো (node --check পাস; `backToTop`/`back-to-top` ref ০)।
- `public/assets/css/style.css` (minified) — `.back-to-top` (৪টি নিয়ম) সরানো (ব্রেস ব্যালান্স ১২৫৫/১২৫৫)।

**২) স্ক্রল-লিংকড মুভমেন্ট স্থির:**
- লগইন/রেজিস্ট্রেশন পেজ ছিল স্ট্যান্ডঅ্যালোন (`body{display:flex;align-items:center;min-height:100vh}`) — লম্বা রেজিস্টার ফর্মে flexbox-centering overflow বাগে উপরের অংশ কাটা পড়ত। এখন `body{display:flex}` + `.auth-card{margin:auto}` — ছোট হলে দুই অক্ষে কেন্দ্রে, লম্বা হলে উপরে লেগে স্ক্রলযোগ্য (এক পিক্সেলও নড়ে না)।
- মডাল/পপ-আপ (`modal-overlay`, `modal-backdrop`) ইতিমধ্যে `position:fixed;inset:0` — যাচাই, অপরিবর্তিত।

**৩) প্রিমিয়াম UI রিডিজাইন (ডিজাইন-সিস্টেম টোকেনে):**
- `auth.css`-এ `:root` টোকেন (brand/accent/radius/shadow — style.css-এর সাথে মিল) যোগ। আগে auth পেজে style.css লোড হতো না বলে `var(--radius-sm)` অপার্য → কার্ডে radius 0 (বর্গাকার) পড়ছিল; এখন ঠিক।
- ব্র্যান্ড: গোলাকার লোগো-মার্ক (accent→brand গ্র্যাডিয়েন্ট) + "লেখক ফোরাম" ওয়ার্ডমার্ক।
- হেডিং: `h1.auth-title` "স্বাগতম" + `p.auth-sub` "আপনার অ্যাকাউন্টে লগইন করুন" (সাবহেডিং)।
- ইনপুট: label + focus ring (`box-shadow` accent-soft) + এরর স্টেট (`.has-error` লাল বর্ডার/রিং)।
- বাটন: সাইটের accent-gradient প্রাইমারির হুবহু (`linear-gradient(accent→accent-dark)` + glow + hover translateY(-2px)/active) — আগে ভুলভাবে নেভি `#0a1f44` ছিল।
- লিংক: `.auth-foot a` accent + hover underline।
- রেজিস্টার/এডিট পেজের ইনলাইন `h3` → `.auth-section-title` ক্লাস (এলোমেলো ইনলাইন স্টাইল সরানো)।
- backward-compat: `.sub` ও `.auth-card h1` নিয়ম রাখা হয়েছে (article-form/qa-form/edit পেজের জন্য)।

**৪) ফাংশনালিটি অক্ষত (রিগ্রেশন):** লগইন সাকসেস/এরর/রিডাইরেক্ট, রেজিস্ট্রেশন (তৈরি→`/profile/:u?welcome=1`, লগইন→`/dashboard`), wrong-password এরর, ভ্যালিডেশন — সব ২০০/৩০২ আগের মতো। পাবলিক ১৫ পেজ 200; `/profile/edit`, `/articles/new`, `/qa/new` (রেগুলার ইউজারে) 200 + auth-card রেন্ডার।

---

### সেশন ৫৩ (৮ সেপ্টেম্বর ২০২৬) — Resources মেনু: ক্রস-লিঙ্ক অপসারণ + 'পত্রিকার ই-মেইল' পেজ যাচাই (টাস্ক ১০)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** দুই সাবমেনু পেজের নিচ থেকে একে অপরের ক্রস-লিঙ্ক সরানো + 'পত্রিকার ই-মেইল' পেজ প্রফেশনাল রিডিজাইন (বিদ্যমান ডিজাইন সিস্টেমে)।

**ধাপ ১ — ক্রস-লিঙ্ক অপসারণ (সম্পন্ন):**
- `lekhok-resources.ejs` নিচ থেকে `পত্রিকার ইমেইল ডিরেক্টরি দেখুন` (`/resources/emails`) লিঙ্ক ব্লক **সরানো**।
- `lekhok-emails.ejs` নিচ থেকে `গুরুত্বপূর্ণ ফাইল ও রিসোর্স` (`/resources`) লিঙ্ক ব্লক **সরানো**।
- মেইন নেভিগেশন (টপবার + মোবাইল সাইডবার) সাবমেনু লিংক অক্ষত — দুটোই একই প্যারেন্ট মেনু থেকে অ্যাক্সেসযোগ্য।

**ধাপ ২ — 'পত্রিকার ই-মেইল' রিডিজাইন (যাচাই):** পেজটি ইতিমধ্যে (সেশন ৪০-এ) সাইটের ডিজাইন সিস্টেমে পূর্ণাঙ্গ কার্ড-ভিত্তিক ডিজাইনে ছিল — ৬টি মানদণ্ডের সবগুলো পূরণ করে:
১) কম্পোনেন্ট রিইউজ (`card`, `eyebrow`, CSS var, 5px radius, accent/brand); ২) প্রতিটি পত্রিকা = আলাদা `pe-card` (নাম + নোট-ব্যাজ + ইমেইল-পিল); ৩) টাইপোগ্রাফি হায়ারার্কি (পত্রিকার নাম bold/brand, ইমেইল accent সেকেন্ডারি); ৪) হোভার `translateY(-4px)`+শ্যাডো (সাইটের `campus-card` প্যাটার্নের সাথে মিল); ৫) রেসপনসিভ `auto-fill minmax(290px,1fr)` — মোবাইলে ১ কলাম; ৬) নেভিগেশন পরিষ্কার (ক্রস-লিঙ্ক সরানোর পর)।

**ডেটা অক্ষত:** ১৪ গ্রুপ, ১২৬ পত্রিকা, ১৫৮ ইমেইল — সব রেন্ডার হয় (কপি-বাটন ১৫৮/১৫৮), কোনো তথ্য হারায়নি।

**টেস্ট:** পাবলিক ১৫ পেজ 200; দুই পেজে বডি-ক্রস-লিঙ্ক ০; ইমেইল পেজ ১২৬ কার্ড/১৪ গ্রুপ/সার্চ+কপি অক্ষত।

---

### সেশন ৫২ (৮ সেপ্টেম্বর ২০২৬) — স্থায়ী পরিষদ পেজ: উপদেষ্টা-তালিকার সাথে ১০০% ডিজাইন কনসিসটেন্সি (টাস্ক ৯)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** 'স্থায়ী পরিষদ' পেজের কার্ডকে রেফারেন্স স্ট্যান্ডার্ড 'উপদেষ্টাদের তালিকা' কার্ডের সাথে হুবহু মিলানো + পেজের নিচের অপ্রয়োজনীয় লিঙ্ক সরানো।

**রেফারেন্স কার্ড ডকুমেন্টেশন (উপদেষ্টাদের তালিকা):** কম্পোনেন্ট = `leader-card has-image clickable-card [linked-member]` (ভাগ করা গ্লোবাল কম্পোনেন্ট, style.css)। লেআউট: গ্রিড `leaders-grid` (`repeat(auto-fit,minmax(240px,1fr))`, gap 20px); কার্ড: আয়তাকার কভার-ইমেজ (`img` width:100%, height:200px, object-fit:cover) + বডি (`leader-body` padding 22px: h3 19px, role 13px uppercase accent, bio 0.9rem); বর্ডার-রেডিয়াস 5px, 1px বর্ডার, `--shadow-soft`; হোভার: `translateY(-4px)` + ইমেজ `scale(1.06)` + বর্ডার accent; লিংক-মেম্বারে ডান-উপরের ফাঁ-অ্যারো ব্যাজ (`::after`, hover-এ দেখায়)। রেসপনসিভ: ব্রেকপয়েন্টে কলাম স্বয়ংক্রিয় কমে (auto-fit), কোনো বিশেষ মিডিয়া-কুয়ারি ছাড়া — দুই পেজেই অভিন্ন।

**কী করা হলো:**
- `lekhok-permanent.ejs`-এর আলাদা `perm-card`/`perm-grid` কম্পোনেন্ট **বাতিল**; এখন উপদেষ্টা-তালিকার **হুবহু একই** `leader-card has-image` মার্কআপ + একই ইনলাইন কার্ড-স্টাইল (`.leader-card`/hover/`linked-member::after`/`term-empty`) রিইউজ করা হয়েছে (নতুন স্টাইল লেখা হয়নি)।
- খালি-অবস্থা `empty-state` → `term-empty` (উপদেষ্টা-পেজের সাথে অভিন্ন)।
- পেজের নিচের ২টি অপ্রাসঙ্গিক `link-more` লিঙ্ক ("কার্যনির্বাহী কমিটি", "উপদেষ্টা পরিষদ") **সরানো** হয়েছে।
- কার্ডের লেবেল বাংলায় অক্ষত (নাম/ভূমিকা `m.role`), লিংক-মেম্বার প্রোফাইল-অ্যারো ব্যাজসহ।

**ডাইনামিক স্ট্যাটাস:** সেকশনটি আগে থেকেই অ্যাডমিন-ম্যানেজেবল (`members` টেবিল, `member_type='permanent'`; `/admin/members` Add/Edit/Delete + ধরন ড্রপডাউনে "স্থায়ী পরিষদ") — নতুন ফাংশনালিটি লাগেনি; লাইভ টেস্টে add→পাবলিক পেজে দেখা গেছে→delete যাচাই।

**টেস্ট:** পাবলিক ১৫ পেজ সব 200; `/committee/permanent`-এ ৫ কার্ড = `leader-card has-image clickable-card linked-member`, নিচে ০ link-more; ইমেজ/টেক্সট/রোল বাংলায়; উপদেষ্টা-পেজের সাথে মার্কআপ-প্যারিটি যাচাই। অ্যাডমিন members add/delete 302 OK।

---

### সেশন ৫১ (৮ সেপ্টেম্বর ২০২৬) — সদস্য হওয়ার শর্তাবলি: ৯ম কার্ড + সেকশন ডাইনামিক (টাস্ক ৮)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** হোমপেজ → পরিচিতি → 'সদস্য হওয়ার শর্তাবলি' সেকশনে ৯ম কার্ড যোগ, বিদ্যমান ৮ কার্ডের ডিজাইন হুবহু রেখে; সেকশন অ্যাডমিন থেকে Add/Edit/Delete/Reorder-যোগ্য করা।

**কী করা হলো:**
- **৮টি হার্ডকোডেড ধাপ-কার্ড → DB-চালিত:** নতুন `conditions_steps` সেকশন `helpers/sections-registry.js`-এ (সেশন ৪২-এর `site_items` প্যাটার্ন অনুসরণ); `routes/pages.js` `/about`-এ `getSectionItems('conditions_steps')`; `lekhok-about.ejs`-এ ৮টি আলাদা `<div class="join-step">` ব্লক → একটি `forEach` লুপ।
- **৯ম কার্ড যোগ:** 'নবীনবরণ ও পরিচিতি সভা' (সদস্যপদ নিশ্চিত হওয়ার পর নতুন সদস্যদের নবীনবরণ ও পরিচিতি সভায় আমন্ত্রণ জানানো হয়।)
- **ডেটা অক্ষত:** ৮ কার্ডের শিরোনাম/বিবরণ/পেমেন্ট নম্বর হুবহু ডিফল্টে সংরক্ষিত (step ৪-এর কার্যকরী টেক্সটসহ)। কার্ডের স্টাইল টোকেন (padding 20px, border-radius 5px, shadow, step-num 42px circle, hover) অপরিবর্তিত।
- **গ্রিড রিফ্লো:** `.join-steps` → `repeat(3, 1fr)` (আগে `auto-fit minmax(290px,1fr)`), যাতে ৯ কার্ড সব ব্রেকপয়েন্টে সমান/ফাঁকাহীন — ডেস্কটপ/ট্যাবলেট ৩×৩, মোবাইল (≤768px) ১ কলাম। (৮→৯-এ ২-কলাম ট্যাবলেটে orphan-রো এড়ানো হয়েছে।)
- **ক্লিনআপ:** `content-registry.js` থেকে অচল `about_step1..8_title/text` + `about_pay_number` ফিল্ড/ডিফল্ট (ডুপ্লিকেট `about_step4_text`সহ) সরানো; এখন শুধু অ্যাডমিন → সেকশন ম্যানেজার দিয়ে এডিট হয়।

**অ্যাডমিন:** `/admin/sections?section=conditions_steps` (ও মডারেটর `/moderator/sections`) — ৯টি আইটেমের Add/Edit/Delete/Reorder/লুকানো/ড্র্যাগ-রিঅর্ডার সম্পূর্ণ কার্যকর (লাইভ টেস্ট: add→১০, delete→৯, move/reorder OK)।

**টেস্ট:** পাবলিক ১৬ পেজ 200, অ্যাডমিন ৪ পেজ 200; `/about`-এ ৯টি join-step + ধাপ ১–৯ (বাংলা সংখ্যা) যাচাই। বিদ্যমান ৮ কার্ডের টেক্সট/স্টাইল অপরিবর্তিত।

---

### সেশন ৪৪-পরিপূরক (৮ সেপ্টেম্বর ২০২৬) — async auto-catch + আনম্যাচড POST→saveerr টোস্ট (প্যারালাল-সেশন একীকরণ)

- **প্রেক্ষাপট**: রিমোটে প্যারালাল সেশন ৪৪-৫০ আগেই পুশ হয়েছিল (একই ৩ টাস্ক তাদের নিজস্ব বাস্তবায়নে: method-override ফিক্স, `page_visits` অ্যানালিটিক্স, `/admin/media/optimize`, ৪০৩≠৪০৪ ইত্যাদি + কনফার্ম-অপসারণ/RBAC/টাইপোগ্রাফি/CMS/পারফরম্যান্স-অডিট)। ডুপ্লিকেট রুট/ডাবল-কাউন্টিং এড়াতে লোকালের স্বাধীন বাস্তবায়ন (কমিট `6b11fb3`, reflog-এ সংরক্ষিত) বাতিল করে রিমোট-টিপ ক্যানন ধরা হয়েছে; তাদের কোডে **দুটি অনুপস্থিত পরিপূরক ফিক্স** উপরে যোগ করা হলো (কোনো ডুপ্লিকেশন নেই):
১) **Express-4 async auto-catch প্যাচ** (server.js বুটে): `Route.prototype` ভার্ভ মেথড + `Router.prototype.use` — যেকোনো AsyncFunction হ্যান্ডলার/মিডলওয়্যার অটো `.catch(next)` পায়। আগে async throw হলে রেসপন্স কখনো পাঠানো হতো না → রিকোয়েস্ট হ্যাং → ব্রাউজারে **ইনফিনিট স্পিনার**, শেষে প্রক্সি/Vercel টাইমআউটে ভুল পেজ। এখন এরর গ্লোবাল মিডলওয়্যারে গিয়ে দ্রুত সঠিক ৫০০ রেসপন্স দেয়। রুট কোড/আর্কিটেকচার অপরিবর্তিত, নতুন ডিপেন্ডেন্সি নেই।
২) **আনম্যাচড POST আর ৪০৪ পেজে যায় না**: 404 ক্যাচ-অল এখন POST পেলে রেফারার পেজে `?saveerr=1` দিয়ে ৩০২ ফেরত পাঠায়; এরর-টোস্ট "সংরক্ষণ সম্পন্ন হয়নি — আবার চেষ্টা করুন" (৭সে পরে অটো-হাইড, URL থেকে প্যারাম ক্লিন) — স্নিপেট যুক্ত: `main.js` (layout-ভিত্তিক পাবলিক পেজ), `partials/footer.ejs` (me/settings), অ্যাডমিন `sidebar.ejs`; ডাবল-টোস্ট গার্ড `window.__saveerr44`।
- **টেস্ট**: verify44b.js **৯/৯** (অননুমেত অ্যাডমিন→লগইন ৩০২, আনম্যাচড POST→/contact?saveerr=1 ৩০২, পাবলিক+অ্যাডমিন টোস্ট রেন্ডার, URL ক্লিন, তাদের মিডিয়া/অ্যানালিটিক্স ২০০ অক্ষত, প্যাচ উপস্থিতি, শূন্য ৫০০) + রিমোট-টিপে পূর্ণ রেগ্রেশন **১২৩/১২৩** (smoke38 ১২, session42 ২০, session43 ২৫, session39 ২২, session41 ১১, session40 ৩৩)।
- **নোট**: সেশন ৫০-এ main.js মিনিফাই হওয়ায় session39-এর স্ট্যাটিক অ্যাসার্শন ফিচার-বেজড করা হলো ('ডাবল-সাবমিট গার্ড' কমেন্ট → `data-submitting`) — গার্ড কোড অক্ষত আছে (১০সে রিলিজ + pageshow/load রিলিজ সহ)।

### সেশন ৫০ (৮ সেপ্টেম্বর ২০২৬) — সম্পূর্ণ টেকনিক্যাল পারফরম্যান্স অডিট (টাস্ক ৭)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** ফ্রন্টএন্ড/ব্যাকএন্ড/অ্যাডমিন পারফরম্যান্স অপ্টিমাইজ, কোনো ফাংশনালিটি না ভেঙে; before/after মেট্রিক্স রিপোর্ট। বিস্তারিত: `PERFORMANCE-REPORT.md`।

**ফ্রন্টএন্ড:**
- **ফন্ট → WOFF2** (fontTools): ৬টি TTF (1.64 MB) → WOFF2 (559 KB) = **−66%**; `fonts.css`-এ WOFF2-প্রথম + TTF fallback।
- **CSS minify** (clean-css lv2, ৮ ফাইল) + **JS minify** (terser, ৩ ফাইল) = CSS+JS **−28%** (354 KB → 256 KB)। টপ-লেভেল গ্লোবাল (closeMenu/toggleGlobalSearch ইত্যাদি) অক্ষত যাচাই করা হয়েছে।
- **Lazy loading** আরও ৭ ইমেজে (যোগাযোগ-চ্যানেল + আর্টিকেল কমেন্ট অ্যাভাটার)।

**ব্যাকএন্ড:**
- **স্ট্যাটিক ক্যাশ:** `express.static` setHeaders — `/assets/*` ও `/uploads/*` → `immutable, 30d`; `/assets/*` `?v=<AV>` দিয়ে bust হয় (নিরাপদ)।
- **N+1 ফিক্স:** ড্যাশবোর্ড ফিড (৩০ কুয়ারি → ১ batch), হোম top-answer (৫ → ১)।
- **+৯ ইনডেক্স:** comments/likes/messages/bookmarks/follows/posts(type,status)/conversation_members।

**অ্যাডমিন প্যানেল:** সব CRUD মসৃণ (মিডিয়া আপলোড/রিপ্লেসসহ) — রিগ্রেশনে যাচাই।

**টেস্ট:** রিগ্রেশন smoke ১৮/১৮+৯/৯, RBAC ১০/১০, টাইপোগ্রাফি ৪৬/৪৬, মিডিয়া ৫/৫, পাবলিক ১৬ পেজ 200 = সবুজ। ফলাফল: প্রথম-ভিজিট পেজ-ওজন ~**−1.2 MB**, পুনরাবৃত্ত-ভিজিট ~০ (immutable ক্যাশ)।

### সেশন ৪৯ (৮ সেপ্টেম্বর ২০২৬) — ডাইনামিক CMS-গ্রেড অ্যাডমিন প্যানেল (টাস্ক ৬)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** কোড না ছুঁয়ে অ্যাডমিন থেকে নেভিগেশন, কনটেন্ট, মিডিয়া ও লিডারশিপ ম্যানেজ। প্রথম ধাপে পূর্ণাঙ্গ অডিট (`CMS-AUDIT.md`) — বিদ্যমান ফিচার রিইউজ/ইমপ্রুভ, ফাঁক শুধু নতুন করে।

**১) ডাইনামিক নেভিগেশন — রি-অর্ডার + enable/disable:**
- `helpers/nav.js`: `sanitizeNav()` এখন `enabled` ফিল্ড সংরক্ষণ করে; নতুন `visibleNav()` (disabled আইটেম বাদ)।
- `server.js`: পাবলিক `navConfig` = `visibleNav(parseNav(...))` — disabled মেনু সাইটে দেখায় না, কিন্তু এডিটরে থেকে যায় (আবার চালু করা যায়)।
- `nav-editor.js`: প্রতি আইটেম/সাব-আইটেমে **drag-and-drop** (HTML5) + **উপরে/নিচে বাটন** + **enable/disable toggle** (চোখ আইকন, disabled আইটেম ধূসর)।

**২) পেজ কনটেন্ট — SEO meta title/description:**
- `content-registry.js`: ১৩টি রিয়েল পেজে (layout বাদ) `seo` গ্রুপ যোগ — `{page}_meta_title` + `{page}_meta_desc` (মোট ২৬ নতুন ফিল্ড, মোট ২৭৫); `SEO_DEFAULTS` সহ।
- `server.js` + `layout.ejs` + `header.ejs`: path→page (exact match) ম্যাপিং — পেজের meta title `<title>`/og:title ও meta description-এ প্রতিফলিত হয়; ডিটেইল-পেজ (নোটিশ/আর্টিকেল) নিজস্ব টাইটেলই পায়।

**৩) ইমেজ ম্যানেজমেন্ট — আপলোড + রিপ্লেস:**
- `admin/routes.js`: `POST /admin/media/upload` (সাব-ডিরেক্টরি নির্বাচন, অটো-WebP) + `POST /admin/media/replace` (একই URL-এ ইন-প্লেস ওভাররাইট — সব রেফারেন্স অক্ষত; Blob-মোডে নতুন URL ফলব্যাক)।
- `media.ejs`: আপলোড ফর্ম (ফাইল + ডিরেক্টরি) + প্রতি কার্ডে "রিপ্লেস" বাটন।

**৪) লিডারশিপ — LinkedIn + বাণী + ব্র্যান্ড-কালার আইকন:**
- `db.js` (LATER_COLUMNS): `members.social_linkedin`, `members.message`; `past_leaders.social_fb`, `social_linkedin`, `message` (idempotent মাইগ্রেশন)।
- অ্যাডমিন members ও past-leaders ফর্ম + রুট: LinkedIn ও বাণী (message/quote) ফিল্ড।
- রেন্ডারিং: হোম (`lekhok-home.ejs`), কমিটি (`lekhok-committee.ejs`), প্রাক্তন নেতা (`past-leaders.ejs`) কার্ডে **শর্তসাপেক্ষ** সোশ্যাল আইকন (লিংক থাকলেই), `target="_blank" rel="noopener noreferrer"`, অফিসিয়াল ব্র্যান্ড কালার (Facebook #1877F2, LinkedIn #0A66C2); বাণী প্রাধিকার message → bio → slot-statement।
- `main.js`: `.leader-card[data-href]` ক্লিক-হ্যান্ডলার জেনারেলাইজ (nested-anchor বাগ প্রতিরোধ)।

**টেস্ট (session49 CMS):** নেভ (save/reorder/disabled-hide/editor-retain), SEO (title/desc লাইভ-রিফ্লেক্ট), মিডিয়া (আপলোড→WebP, রিপ্লেস), লিডারশিপ (LinkedIn ফিল্ড/আইকন/ব্র্যান্ড-কালার/rel/বাণী) — **সবুজ**। রিগ্রেশন: smoke ১৮/১৮ + ৯/৯, RBAC ১০/১০, typography ৪৬/৪৬ = সবুজ।

### সেশন ৪৮ (৮ সেপ্টেম্বর ২০২৬) — গ্লোবাল টাইপোগ্রাফি সিস্টেম (কেন্দ্রীয় ফন্ট টোকেন)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** সাইট-ব্যাপী একটাই টাইপোগ্রাফি নিয়ম — হেডিং/মেনু/বাটন/টেবল-হেডার/নেভ = Hind Siliguri, প্যারাগ্রাফ/ফর্ম/বডি/কমেন্ট/টেবল-কনটেন্ট = Kalpurush; কোনো hardcoded `font-family` অবশিষ্ট নেই। বিদ্যমান ফন্ট অ্যাসেট (`public/assets/fonts/HindSiliguri-*.ttf` + `kalpurush.ttf`) রিইউজ, নতুন ডাউনলোড নেই।

**কেন্দ্রীয় টোকেন (`public/assets/css/fonts.css`):**
- `--font-heading: 'HindSiliguri','Hind Siliguri','Noto Sans Bengali',sans-serif`
- `--font-body: 'Kalpurush','HindSiliguri','Noto Sans Bengali',sans-serif`
- fallback stack-এ `Noto Sans Bengali` + generic `sans-serif` — ফন্ট লোড ব্যর্থ হলেও বাংলা সঠিকভাবে রেন্ডার হয়।
- legacy alias `--font-hs`→heading, `--font-kp`→body ধরে রাখা হয়েছে (পশ্চাৎ-সামঞ্জস্য)।

**পরিবর্তনের পরিসর:**
- **১১টি ফাইল**-এ hardcoded ফন্ট-স্ট্যাক টোকেনে রূপান্তর: `admin.css`, `auth.css`, `profile.css`, `style.css`, `lekhok-advisory.ejs`, ৪টি মডারেটর view, admin login, admin users/edit।
- **১৬টি view**-এ Google Fonts `<link>` সরিয়ে স্থানীয় `fonts.css?v=<%= AV %>` — কোনো network dependency নেই।
- `messages-list.ejs` + `style.css`-এ `font-family: monospace` → `var(--font-body)` (কনসিস্টেন্সি)।
- semantic চেক: `.mod-page` ও `.adv-filter-bar` (label/select) → `var(--font-body)` (এগুলো বডি-কনটেন্ট, হেডিং নয়)।

**টেস্ট (session48 typography):** **৪৬/৪৬** — fonts.css 200 + উভয় টোকেন + fallback stack; ৭টি অ্যাডমিন পেজ + ৫টি মডারেটর পেজ + home/about সবই `fonts.css` লোড করে ও Google Fonts মুক্ত; served CSS-এ hardcoded `'Hind Siliguri'`/`'Kalpurush'` স্ট্যাক ০। রিগ্রেশন: smoke ১৮/১৮ + ৯/৯ + RBAC ১০/১০ = সবুজ।

### সেশন ৪৭ (৮ সেপ্টেম্বর ২০২৬) — RBAC কঠোর বাস্তবায়ন (permission matrix + frontend/backend enforcement)

**উদ্দেশ্য (ইউজার-রিকোয়েস্ট):** অ্যাডমিন ও মডারেটরের জন্য লঙ্ঘন-অযোগ্য অ্যাক্সেস-সীমারেখা — মডারেটর শুধু নির্ধারিত মডিউলে, অ্যাডমিন সবকিছুতে; UI (hide/disable) ও API (middleware) দুই স্তরেই enforce।

**নতুন ডক:** `RBAC.md` — সম্পূর্ণ permission matrix (রোল, গার্ড, প্রতি মডিউলের রুট ও অ্যাক্সেস) + enforcement নিয়ম।

**ব্যাকএন্ড ফাঁক বন্ধ:**
- **মডারেটর প্যানেল স্কোপ-মেটা:** `routes/moderator.js`-এ `router.use` যোগ — `userScopeMeta` এখন মডারেটর প্যানেলেও সেট হয় (আগে শুধু `/admin` রাউটারে); সাইডবার স্কোপ-ব্যাজ ও স্কোপ-গেটিং কাজ করে।
- **Press CRUD স্কোপ গার্ড:** `/moderator/press` (get/post/:id/:id-delete/bulk-delete)-এ `requireScope('epaper')` যোগ — আগে শুধু bulk-toggle-এ ছিল, CRUD গার্ডহীন ছিল (ইনকনসিস্টেন্সি)।
- **`requireScope` (admin) denied homePath:** মডারেটর "ফিরে যান" বাটন এখন `/moderator`-এ নেয় (আগে `/admin`)।

**ফ্রন্টএন্ড (UI) enforcement:**
- **সাইডবার** (`sidebar.ejs`): মডারেটর-প্যানেল লিংক স্কোপ-অনুযায়ী লুকানো হয় (`_hasScope()` হেল্পার, daily-আমব্রেলা ও notice/event আলিয়াসসহ; মেটা না পেলে নিরাপদ ফলব্যাক = কিছু লুকায় না)।
- **মডারেটর ড্যাশবোর্ড** (`moderator-dashboard.ejs`): "পত্রিকা কাটিং" টাইল `epaper` স্কোপ-গেটেড (আগে হার্ডকোডড দেখাত)।

**সেশন স্থায়িত্ব (অহেতুক লগআউট বন্ধ):** `server.js`-এ `rolling: true` — সক্রিয় রিকোয়েস্টে কুকি/সেশন মেয়াদ রিসেট হয়; ২৪-ঘণ্টার সীমা এখন নিষ্ক্রিয়তার ২৪ ঘণ্টা (সক্রিয় ইউজার আর অন্যায্যভাবে লগআউট হয় না)।

**টেস্ট (session47 RBAC):** ফুল-মডারেটর ১৪টি অ্যাডমিন-অনলি GET → **403 + "অনুমতি নেই" পেজ** (৪০৪ নয়), অ্যাডমিন-অনলি POST → 403 (মিউটেশন ব্লক), নিজের স্কোপড মডিউল ১০টি → 200, অ্যাডমিন সব → 200, লিমিটেড-মডারেটর (শুধু `notice` স্কোপ) → notice 200 / events/press/best-writer/complaints 403 / সাইডবার-লুকানো / POST press 403, নিয়মিত ইউজার /moderator ও /admin/users → 403। রিগ্রেশন: auth46 ১৩/১৩ + session44 ১০/১০ + smoke ১৮/১৮+৯/৯ = সবুজ। rolling যাচাই: অথেনটিকেটেড রিকোয়েস্টে Set-Cookie (expires) রিফ্রেশ হয়।

### সেশন ৪৬ (৮ সেপ্টেম্বর ২০২৬) — লগইন/অথেনটিকেশন/রিডাইরেক্ট ফ্লো ফিক্স (সব রোল)

**সমস্যা (ইউজার-রিপোর্ট):** লগইনের পর মাঝে মাঝে ভুল/অস্তিত্বহীন পেজে ৪০৪, বা লোডিং শেষ হয় না, অথচ ইউজার আসলে লগইন হয়েই থাকে। রুট-কজ বিশ্লেষণে পাওয়া গেল:

- **রোল-বেজড রিডাইরেক্ট ছিল না:** `POST /login`-এ সব ইউজারকে হার্ডকোড করা `/dashboard`-এ পাঠানো হতো — মডারেটর (`role='moderator'`) তার নিজস্ব `/moderator` ড্যাশবোর্ডে না গিয়ে নিয়মিত ফিডে পড়ত।
- **`next` প্যারামিটার তৈরি হয় কিন্তু কখনো ব্যবহার হতো না:** প্রোটেক্টেড পেজ থেকে `/login?next=...`-এ এলে লগইনের পর সবসময় ডিফল্ট ড্যাশবোর্ডে যেত, আসল গন্তব্যে ফিরত না।
- **ইতিমধ্যে লগইন থাকলে** `GET /login`/`GET /register` সবাইকে `/dashboard`-এ পাঠাত (রোল ভেদে নয়)।
- **মডারেটর RBAC:** `requireAdmin` লগইন-করা নন-অ্যাডমিনকে `/admin/login`-এ বাউন্স করত (মডারেটর সেখানে admin_users-এ না থাকায় আটকে যেত) — সঠিক আচরণ ৪০৩ "অনুমতি নেই"।
- **সেশন-সেভ হ্যাং ঝুঁকি:** Vercel/Turso-তে সেশন-রাইট ধীর/হ্যাং হলে `res.redirect`-এর আগের session.save কলব্যাক কখনো ফায়ার না হতে পারত → "লোডিং শেষ হয় না"।

**ফিক্স:**
- `routes/auth.js` — নতুন হেল্পার `dashboardFor(role)` (admin→/admin, moderator→/moderator, user→/dashboard) + `safeNextPath(raw)` (শুধু same-origin রিলেটিভ পাথ; `//` ও scheme:// ব্লক — open-redirect গার্ড)।
- `POST /login` — রোল-বেজড গন্তব্য + সেফ `next` (body/query) প্রায়োরিটি; admin-fallback-এও `next`+`/admin`।
- `GET /login` ও `GET /register` — ইতিমধ্যে লগইন থাকলে রোল-অনুযায়ী সঠিক ড্যাশবোর্ডে রিডাইরেক্ট (adminUser→/admin)।
- `views/user/login.ejs` — `next` hidden ইনপুট (ব্যর্থ লগইনেও গন্তব্য টিকে থাকে)।
- `admin/routes.js` `requireAdmin` — লগইন-করা নন-অ্যাডমিন → ৪০৩ `admin/denied` (homePath রোল-অনুযায়ী), `/admin/login`-এ বাউন্স নয়; অপ্রমাণিত → `/admin/login`।
- `server.js` — গ্লোবাল session-save-before-redirect wrapper-এ **১.৫সে সেফটি-টাইমআউট**: সেশন-রাইট হ্যাং করলেও রিডাইরেক্ট সর্বদা ঘটে (লোডিং আর চিরতরে আটকে থাকে না)।

**টেস্ট:** session46.js **১৩/১৩** — রোল-বেজড রিডাইরেক্ট (admin/moderator/user), admin-fallback, `next`→/messages, ইতিমধ্যে-লগইন GET /login, মডারেটর /admin/members→403+denied, সেশন-পারসিস্টেন্স (refresh), ইউজার /moderator→403। রিগ্রেশন: session44 ১০/১০ + smoke ১৮/১৮ + ৯/৯ = সবুজ।

### সেশন ৪৫ (৮ সেপ্টেম্বর ২০২৬) — ডিলিট ফাংশনালিটি: নেটিভ কনফার্মেশন পপ-আপ অপসারণ

- **উদ্দেশ্য:** ডিলিট/ডেস্ট্রাক্টিভ বাটনে ক্লিক করলে ব্রাউজারের `window.confirm()` পপ-আপ ছাড়াই সরাসরি রিকোয়েস্ট যাবে (ইউজার-রিকোয়েস্ট)।
- **করণীয়:** কোডবেসের **সব** `confirm()` / `window.confirm()` কল সরানো হয়েছে — ২৯টি view ফাইলে ৩৯টি কল (অ্যাট্রিবিউট-ভিত্তিক `onsubmit`/`onclick="return confirm(...)"` + JS গার্ড `if (!confirm(...)) return;` + sidebar.ejs-এর বাল্ক-বার/কীবোর্ড-ডিলিট `window.confirm`)। `grep -rn "confirm("` → **০ ফল** (পুরো রিপোতে)।
- **কভারেজ:** অ্যাডমিন (notices/events/members/gallery/resources/daily/achievements/constitution/past-leaders/complaints/subscribers/tasks/trash/media/sections/content-history) + মডারেটর (notices/events/press/members/daily) + ইউজার (article-single/dashboard/profile/qa-single/settings/messages-chat) + বাল্ক-ডিলিট কীবোর্ড-শর্টকাট (Delete key) ও বাল্ক-বার।
- **নোট:** কনফার্মেশন সরানোর পরও নিরাপত্তা বহাল — সফট-ডিলিট/ট্র্যাশ + আন্ডু-টোস্ট (সেশন ৪২/৪৩) সেফটি-নেট হিসেবে আগে থেকেই আছে; CSRF গার্ড অপরিবর্তিত।
- **টেস্ট:** smoke (অ্যাডমিন ১৭ পেজ + মডারেটর ৮ পেজ) **২৫/২৫** — সব 200, কোনো পেজে `confirm(` নেই; EJS/JS সিনট্যাক্স ভাঙেনি।

### সেশন ৪৪ (৮ সেপ্টেম্বর ২০২৬) — এডিট/আপডেট স্পিনার+৪০৪ ফিক্স, মিডিয়া WebP অপটিমাইজেশন, অ্যানালিটিক্স রিয়েকশন/ভিজিট ট্রেন্ড

**১) এডিট/আপডেট ফর্ম — ইনফিনিট স্পিনার ও ভুল ৪০৪ রিডাইরেক্ট ফিক্স (ইউজার-রিপোর্ট):**
- **রুট-কজ (মূল):** `method-override`-এর ডিফল্ট getter শুধু কুয়েরি-স্ট্রিং থেকে `_method` পড়ে (non-"X-" prefix → `createQueryGetter`)। ফলে বডিতে hidden `_method` ফিল্ড পাঠালে PUT/DELETE এডিট-ফর্ম POST হিসেবেই থেকে যায়, রাউট মেলে না → **৪০৪**, আর স্পিনার (ডাবল-সাবমিট গার্ড) আটকে থাকে। ফিক্স: `server.js`-এ কাস্টম getter — বডি **ও** কুয়েরি দুটোই চেক করে; বডি-ভ্যালু ব্যবহারের পর `delete req.body._method`।
- **ভুল ৪০৪ (মডারেটর):** `routes/moderator.js`-এর `ensureModerator`/`requireScope` পারমিশন-ত্রুটিতে `404` টেমপ্লেট রেন্ডার করত (403 স্ট্যাটাসে "পৃষ্ঠা খুঁজে পাওয়া যায়নি" দেখাত)। এখন `admin/denied` পেজ (সঠিক "অনুমতি নেই" + `homePath: '/moderator'`-এ ফেরার বাটন); `denied.ejs`-এ `homePath` ডাইনামিক।
- **স্পিনার-রিলিজ:** `content.ejs` সাবমিটে ১৫ সেকেন্ড সেফটি-রিলিজ (নেভিগেশন/রেসপন্স না এলে স্পিনার আর ইনফিনিট থাকে না); AJAX ফ্লোতে (`main.js` শেয়ার, `sidebar.ejs` আন্ডু-টোস্ট, `sections.ejs` রিঅর্ডার/আন্ডু) `res.ok` + 401→লগইন চেক যোগ — রেসপন্স success/error যাই হোক স্পিনার/বাটন সবসময় রিসেট হয়, ভুল রিডাইরেক্ট হয় না।

**২) মিডিয়া লাইব্রেরি — WebP অপটিমাইজেশন:** নতুন `POST /admin/media/optimize` (requireAdmin): JPEG/PNG → WebP (sharp, quality 82, max-edge 2000, rotate+resize `inside withoutEnlargement`); অপটিমাইজড ফাইল বড়/সমান হলে মূলই রাখা হয় (কখনো বড় হবে না); GIF/SVG/WebP/AVIF স্কিপ; নাম-সংঘর্ষে `-1/-2` সাফিক্স; মূল ফাইল মুছে ফেলা হয় না (পুরনো URL-রেফারেন্স অক্ষত); অডিট-লগ এন্ট্রি। `media.ejs`-তে প্রতি JPEG/PNG কার্ডে "WebP" বাটন + WebP/JPEG-PNG ব্যাজ + flash (কত % ছোট / যথেষ্ট অপটিমাইজড / স্কিপ / ব্যর্থ); `GET /media` রুটে query-flash পাস করা হয়েছে (আগে `saved` flash নীরবে দেখাত না)।

**৩) অ্যানালিটিক্স — রিয়েকশন ও ভিজিট ট্রেন্ড:** `analytics.ejs`-এ ৩→৫ কার্ড: নতুন **রিয়েকশন** (likes ৩০-দিনের সিরিজ) ও **পেজ ভিজিট** (page_visits) স্পার্কলাইন + রিয়েকশন-ধরন ব্রেকডাউন চিপ (লাইক/ভালোবাসা/যত্ন/হাসি/বিস্ময়/দুঃখ)। নতুন টেবিল `page_visits(id, path, day, count, UNIQUE(path,day))` + `idx_visits_day` (idempotent, `applySession42Migrations`-এ 44a); `server.js`-এ ফায়ার-অ্যান্ড-ফরগেট ভিজিট-মিডলওয়্যার (শুধু পাবলিক HTML GET, অ্যাসেট/API/অ্যাডমিন-মডারেটর বাদ, রেসপন্স কখনো ব্লক হয় না)।

**টেস্ট:** session44.js **১০/১০** (লগইন, body/query `_method=PUT` ও body `_method=DELETE` → 302 [আগে body 404], অ্যানালিটিক্স রিয়েকশন+ভিজিট কার্ড, মিডিয়া 200, মডারেটর /admin এখন আর 404-পেজ নয়)। মিডিয়া optimize লাইভ-চেক: test-photo.png (8.6KB) → test-photo.webp (0.9KB, **৮৯% ছোট**)।

### সেশন ৪৩ (৭ সেপ্টেম্বর ২০২৬) — ১২ আপগ্রেড: সব-ফেরত, অডিট CSV, সেকশন ছবি/প্রিভিউ/রিঅর্ডার + সিকিউরিটি/পারফরম্যান্স প্যাক

**আপগ্রেড (১২টিই সম্পন্ন — ইউজার কনফার্ম: সব ১-১২, ছবি=আপলোড+URL দুটোই, সব-ফেরত=গ্লোবাল+টেবিল-ভিত্তিক):**
১) **ট্র্যাশে "সব ফেরত"** — `/admin/trash/restore-all` + `/moderator/trash/restore-all` (মডারেটর: স্কোপড টেবিল হোয়াইটলিস্ট); গ্লোবাল ও টেবিল-ভিত্তিক দুই বাটন; ক্যাপ ৫০০; সাইডবারে লাল ট্র্যাশ-কাউন্ট ব্যাজ।
২) **অডিট CSV** — `/admin/audit/export.csv` (UTF-8 BOM, এক্সেল-বন্ধুত্বপূর্ণ); অ্যাকশন/তারিখ(from-to)/সার্চ ফিল্টার অডিট পেজ ও CSV দুটোতেই।
৩) **সেকশন ম্যানেজারে ছবি** — `site_items.image` কলাম; ফাইল আপলোড (`/admin/upload-image`) + URL দুই পথ; লাইভ প্রিভিউ; পাবলিক কন্টাক্ট কার্ডে ছবি রেন্ডার (চ্যানেল/ইউনিভার্সিটি/ট্রান্সপোর্ট); ড্র্যাগ-অ্যান্ড-ড্রপ রিঅর্ডার (`/sections/reorder`)।
৪) **ট্র্যাশ স্ন্যাপশট প্রিভিউ** — প্রতি সারিতে `<details>` "বিস্তারিত দেখুন" (payload ফিল্ডসহ); টেবিল-ফিল্টার ড্রপডাউন (?table=); মডারেটর ট্র্যাশেও ফিল্টার+সার্চ।
৫) **আন্ডু টোস্ট সম্প্রসারিত** — বাল্ক পাবলিশ/লুকান (admin+moderator, redirect-এ undo_mode/ids/base প্যারাম) ও সেকশন-এডিট (`/sections/:id/undo`, session স্ন্যাপশট)।
৬) **কীবোর্ড শর্টকাট** — Shift+ক্লিক রেঞ্জ-সিলেক্ট, Esc সিলেকশন-ক্লিয়ার, Delete বাল্ক-ডিলিট (confirm সহ) — সব অ্যাডমিন/মডারেটর লিস্টে।
৭) **মিডিয়া লাইব্রেরি** — `/admin/media`: public/uploads ওয়াক (ছবি সাইজসহ), কপি-URL বাটন, প্রিভিউ, ডিলিট (`/media/delete`)।
৮) **কনটেন্ট রিভিশন হিস্ট্রি** — `content_revisions` টেবিল (প্রতি সেভে পুরনো মান, কী-প্রতি শেষ ১০টি); `/admin/content/history?key=` + এক-ক্লিক রিস্টোর (`/content/restore`)।
৯) **নিউজলেটার প্যাক** — এক্সপোর্ট CSV-তে ?status=active|inactive ফিল্টার; ডুপ সাবস্ক্রাইবে বন্ধুত্বপূর্ণ বার্তা; ডাবল-অপ্ট-ইন (লাইট) — `confirm_token` কলাম, `/api/newsletter/confirm`, শুধু RESEND_API_KEY থাকলে সক্রিয় (নাহলে আগের তাৎক্ষণিক আচরণ); mailer.js-এ নতুন `sendMail()` এক্সপোর্ট।
১০) **সিকিউরিটি প্যাক** — লগইন ব্রুট-ফোর্স গার্ড (IP+username প্রতি ১০ ব্যর্থ/১৫মিনিট → ৪২৯; সফল লগইনে কাউন্টার রিসেট), সিকিউরিটি হেডার (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS), কুকি sameSite=lax + secure='auto' (VERCEL-এ trust proxy)।
১১) **পারফরম্যান্স প্যাক** — `compression` (gzip), ৯টি নতুন DB ইনডেক্স (IDX43: posts created_at/author_id, notifications user_id, audit_log created_at, trash deleted_at/table_name, site_items section+sort_order, newsletter_subscribers email/is_active), locals মিডলওয়্যার async (ট্র্যাশ-কাউন্ট await)।
১২) **অ্যাডমিন অ্যানালিটিক্স** — `/admin/analytics`: ৩০-দিনের সিরিজ (নতুন সাবস্ক্রাইবার/পোস্ট/নোটিশ) ইনলাইন SVG স্পার্কলাইন + মোট কার্ড।

**নতুন ভিউ:** `content-history.ejs`, `media.ejs`, `analytics.ejs`; রিরাইট: `trash.ejs`; আপডেট: `audit.ejs`, `content.ejs`, `sections.ejs`, `sidebar.ejs` (ব্যাজ/লিংক/শর্টকাট/বাল্ক-আন্ডু), `lekhok-contact.ejs` (ছবি)।

**মাইগ্রেশন ৪৩:** `site_items.image TEXT`, `newsletter_subscribers.confirm_token TEXT`, `content_revisions(id,key,value,saved_by,saved_at)` + ৯ ইনডেক্স — সব idempotent।

**টেস্ট:** session43.js ২৫/২৫ (নতুন স্যুট) + রেগ্রেশন session42 ২০/২০, session39 ২২/২২, session41 ১১/১১, session40 ৩৩/৩৩, smoke38 ১২/১২ = **১২৩/১২৩ সবুজ**; শূন্য ৫০০/পেজ-এরর। স্ক্রিনশট: `/home/user/screenshots/session43/01-06`।

**বাগ ফিক্স (বিল্ডকালীন):** (ক) টোস্ট CSS কন্ডিশনাল ব্লকে বন্দি ছিল → সব টোস্ট (বাল্ক/ট্র্যাশ/সেকশন) এখন স্টাইলড; (খ) মডারেটর ট্র্যাশ ৫০০ (নতুন ভিউ-লোকালস মিসিং) → রুটে tables43/tbl43/restoredFlag পাঠানো + ভিউ-গার্ড; (গ) সফল লগইনে রেট-লিমিট কাউন্টার রিসেট হয়নি → loginOk() দুই ব্র্যাঞ্চে; (ঘ) বাল্ক-টগল redirect-এ আন্ডু প্যারাম যোগ (admin+moderator ৩ স্লাগ)।


### সেশন ৪২ (৭ সেপ্টেম্বর ২০২৬) — ৮ আপগ্রেড + স্পিনার/৪০৪ ও শেয়ার বাগ ফিক্স

**আপগ্রেড (৮টিই সম্পন্ন):**
১) **বাল্ক পাবলিশ/লুকান** — বাল্ক-বারে "প্রকাশ/লুকান" বাটন (অ্যাডমিন: নোটিশ, ইভেন্ট, সাবস্ক্রাইবার + জেনেরিক loop; মডারেটর: প্রেস, নোটিশ, ইভেন্ট)।
২) **সফট-ডিলিট + ট্র্যাশ** — সব ডিলিট এখন স্ন্যাপশটসহ `trash` টেবিলে; ৩০ দিন পর্যন্ত ফেরত; অ্যাডমিন /admin/trash + মডারেটর /moderator/trash; অটো-পার্জ।
৩) **টোস্ট + আন্ডু** — ডিলিটের পর নিচে কালো টোস্ট "আন্ডু" বাটনসহ (এক ক্লিকে রিস্টোর)।
৪) **সার্চ + পেজিনেশন** — সাবস্ক্রাইবার ও টাস্ক লিস্টে সার্ভার-সাইড সার্চ + ২০/পেজ পেজিনেশন; সব লিস্টে ক্লায়েন্ট-সাইড ইনস্ট্যান্ট ফিল্টার JS।
৫) **CSV এক্সপোর্ট** — /admin/subscribers/export.csv (BOM-সহ, বাংলা-নিরাপদ) + অডিট এন্ট্রি।
৬) **অডিট লগ** — `audit_log` টেবিল (কে/কখন/কোন টেবিল/কী); /admin/audit পেজ সার্চ+পেজিনেশনসহ; ডিলিট/বাল্ক/রিস্টোর/কনটেন্ট-সেভ/এক্সপোর্টে এন্ট্রি।
৭) **CSRF টোকেন** — সেশন-ভিত্তিক টোকেন; সব POST ফর্মে ক্লায়েন্ট-সাইড অটো-ইনজেকশন (multipart-এ action-কুয়েরি); মিডলওয়্যারে যাচাই (ভুল হলে ৪০৩)।
৮) **রেট-লিমিট** — নিউজলেটার সাবস্ক্রাইব: IP-প্রতি ১০ মিনিটে ৩টির বেশি হলে ৪২৯।

**বাগ ফিক্স:**
- "সেভ/ডিলিটে স্পিনার ঘুরতে থাকা + ৪০৪": bfcache/ব্যাক-বাটনে আটকে-থাকা গার্ড রিলিজ (pageshow/load); Vercel-এ মাল্টি-ইনস্ট্যান্স DB-ভিন্নতার কারণে ৪০ — স্ন্যাপশট-ফ্লাশ আগে থেকেই আছে, এবার পুরো ফ্লো টেস্টেড।
- শেয়ার: ড্যাশবোর্ড রেন্ডারে `user` লোকাল ছিল না → ফিডে "নিজের টাইমলাইনে শেয়ার" বাটন উধাও; ফিক্স + ডুপ-শেয়ার গার্ড (২ মিনিটে একই সোর্স আবার নয়)।
- রেজিস্টার/চ্যাট/অ্যাডমিন-লগইন পেজে CSRF meta/ইনজেকশন না থাকায় ফর্ম ব্লক — সব স্ট্যান্ডঅ্যালোন হেডে meta + ইনজেকশন।

**সেকশন ম্যানেজার (কন্টেন্ট-এডিটর আপগ্রেড + সর্বত্র CRUD):** নতুন `site_items` টেবিল + /admin/sections ও /moderator/sections (content স্কোপ) — হোম FAQ, যোগাযোগের চ্যানেল/বিশ্ববিদ্যালয়/ট্রান্সপোর্ট কার্ড এখন DB-চালিত: যোগ/সম্পাদনা/লুকানো/সাজানো/বাদ, পাবলিক পেজে সাথে সাথে। বাকি সেকশন (ফাউন্ডার/লিডারশিপ/স্থায়ী পরিষদ/নোটিশ/ইভেন্ট/প্রেস/গ্যালারি…) আগে থেকেই members/notices ইত্যাদি টেবিল via CRUD। মার্ক-অল টগল (দুই ক্লিকে আনমার্ক) সব লিস্টে বহাল।

**টেস্ট:** session42.js ২০/২০ + রেগ্রেশন ২+১১+৩+১২ = **৯৮/৯৮**। স্ক্রিনশট: screenshots/session42/ (৬টি)।


### সেশন ৪১ (৭ সেপ্টেম্বর ২০২৬) — মার্ক/মার্ক-অল কভারেজ সম্পূর্ণ + প্রেস সেভ-UX

সেশন ৩-এর তালিকার বাকি আইটেমগুলো শেষ:

- **বাল্ক ডিলিট কভারেজ ১০০%**: ডিলিট-ক্ষমতাসম্পন্ন সব মডারেটর/অ্যাডমিন লিস্টে এখন মার্ক + মার্ক-অল আছে। নতুন যোগ: মডারেটর ডেইলি কনটেন্ট (`POST /moderator/daily/bulk-delete`, create রুটের আগে রেজিস্টার্ড), অ্যাডমিন সাবস্ক্রাইবার্স ও টাস্ক (`BULK_TABLES`-এ `newsletter_subscribers`, `moderator_tasks` — জেনেরিক লুপ থেকে রুট তৈরি)। ভিউতে: মাস্টার "সব সিলেক্ট" লেবেল + bulkBar + প্রতি সারিতে চেকবক্স।
- **প्रेस কাটিং সেভ-UX**: প্রতিটি কাটিং সারির summary-তে দৃশ্যমান সবুজ **"সম্পাদনা / সংরক্ষণ"** বাটন (ক্লিকে এডিট-প্যানেল খোলে + স্ক্রল); ডুপ্লিকেট POST-এ আলাদা ফ্ল্যাশ বার্তা ("ডুপ্লিকেট রিকোয়েস্ট উপেক্ষিত") — আগের সাধারণ "সংরক্ষিত" বার্তার সাথে গুলিয়ে যায় না।
- **বাগ ফিক্স**: লগে `req.session.userId` (undefined) → `req.session.user.id`; ভুল টেবিল-নাম (`subscribers`/`tasks` → `newsletter_subscribers`/`moderator_tasks`)।
- **টেস্ট**: session41.js ১১/১১ + রেগ্রেশন session39 ২২/২২, session40 ৩৩/৩৩, smoke38 ১২/১২ = **৭৮/৭৮**। স্ক্রিনশট: screenshots/session41/ (৪টি)।

### সেশন ৪০ (৭ সেপ্টেম্বর ২০২৬) — পাবলিক সাইট পলিশ: ডুয়াল-মার্কি কাটিং স্লাইডার, FAQ +/− অ্যাকর্ডিয়ন, স্থায়ী পরিষদ পেজ+অ্যাডমিন, রিসোর্স বিভাজন ও পত্রিকার ইমেইল ডিরেক্টরি

**ইউজার রিকোয়েস্ট**: "পত্রিকায় পাতায় লেখক ফোরাম প্যারাগ্রাফ জাস্টিফাই+প্রশস্ত, কাটিংগুলো স্লাইডিং (উপরে ৩ বাম→ডান, নিচে ৩ ডান→বাম, বড়)… কলম-সৈনিক প্যারা প্রশস্ত+সবুজ দাগ মিসিং… শর্তাবলিতে আরও ৪ শর্ত+রেস্পন্সিভ… অবশ্যপালনীয় শর্ত বড়+অন্য সাবসেকশনের মতো ডিজাইন… সাধারণ জিজ্ঞাসা +/− এলিগ্যান্ট অ্যাকর্ডিয়ন+ইউজার-লিংক বাদ+১৫টি প্রশ্ন… ফাউন্ডার/বর্তমান নেতৃত্ব কার্ড ভাইব্রেন্ট+অ্যানিমেশন+দাগ সেন্টার+ইউজার-লিংক বাদ… কার্যনির্বাহী পরিষদে 'স্থায়ী পরিষদ' সাব-পেজ (৫ আইডি, অ্যাডমিন থেকে ইউজার সার্চ করে এড)… রিসোর্সের ইংরেজি নাম বাংলা… রিসোর্স ও পত্রিকার ইমেইল দুটো স্বতন্ত্র পেজ+নতুন ইমেইল ডিরেক্টরি (বারভিত্তিক+ক্যাটাগরি, ডুপ বাদ)… যোগাযোগে ক্যাম্পাস+যাতায়াত সেকশন সেন্টার-দাগ+৩ কলাম ভাইব্রেন্ট কার্ড"

- **পরিচিতি**: ম্যাগাজিন-প্যারা justify+1000px; প্রেস-কাটিং **ডুয়াল মার্কি স্লাইডার** (২ সারি × ৩, বড় কার্ড, mask-fade edge, hover-পজ, উপরে mqLTR/নিচে mqRTL, reduced-motion সম্মান); CTA-তে accent-divider center + প্যারা 1040px; শর্তাবলি ৪→**৮ ধাপ** (নতুন content-key step5-8, রেজিস্ট্রি+অ্যাডমিন এডিটর) + auto-fit রেস্পন্সিভ গ্রিড; অবশ্যপালনীয় শর্ত = সেন্টার হেড+দাগ+১px বুলেট
- **হোম**: সাধারণ জিজ্ঞাসা = **+/− অ্যাকর্ডিয়ন** (কারেটেড ১৫ প্রশ্ন-উত্তর, নাম্বার-ব্যাজ, ইউজার-লিংক বাদ, হেড+দাগ সেন্টার); ফাউন্ডার/বর্তমান নেতৃত্ব কার্ডে gradient top-bar, hover photo-zoom, staggered leadIn অ্যানিমেশন, profile/data-href লিংক বাদ; দাগ সেন্টার
- **স্থায়ী পরিষদ**: নতুন পেজ `/committee/permanent` (lekhok-permanent.ejs — perm-card ফটো গ্রিড, অ্যানিমেশন); nav DEFAULT + nav_json মাইগ্রেশনে child যুক্ত; db সিড ৫ user-linked সদস্য; অ্যাডমিন members ফর্মে member_type='permanent' + **ইউজার সার্চ-ফিল্টার** (নাম/ইউজারনেম/আইডি → select ফিল্টার, Enter-এ exact আইডি) — কার্যনির্বাহী/উপদেষ্টা লিংকেও একই সুবিধা
- **রিসোর্স**: `/resources` ও `/resources/emails` স্বতন্ত্র পেজ (সাব-ট্যাব বাদ, হেডার নেভে রিসোর্স ড্রপডাউন); ক্যাটাগরি/ব্যাজ সব বাংলা (CAT_BN/FT_BN ম্যাপ); ইমেইল পেজ = **helpers/paper-emails.js** ডিরেক্টরি (১৪ গ্রুপ, ১২৬ এন্ট্রি, ১৫৮ ইমেইল, ডুপ বাদ) — sticky ট্যাব, লাইভ সার্চ+কাউন্ট, mailto+কপি বাটন, ভাইব্রেন্ট কার্ড
- **যোগাযোগ**: ক্যাম্পাস-চ্যানেল ও ক্যাম্পাস/যাতায়াত গ্রিড ৩-কলাম (রেস্পন্সিভ), কার্ডে gradient আইকন-সার্কেল+হোভার লিফট; দুই সাবসেকশন হেড সেন্টার+দাগ
- **ভেরিফিকেশন**: session40 **33/33** + রেগ্রেশন session39 22/22 + smoke38 12/12 = **৬৭/৬৭**; স্ক্রিনশট `screenshots/session40/` (৯টি)

### সেশন ৩৯ (৭ সেপ্টেম্বর ২০২৬) — সেভ-হারানো/ডুপ্লিকেট-সাবমিট বাগ পার্মানেন্ট ফিক্স + মডারেটর প্যানেল = অ্যাডমিন ডিজাইন + বাল্ক মার্ক/মার্ক-অল + গ্রুপ-সদস্য UI

**ইউজার রিকোয়েস্ট**: "প্রেস-কাটিং পেজে এক আপলোডে ১৮-২০ ফাইল চলে আসে… এই ক্লাসের বাগ সব জায়গায় খুঁজে পার্মানেন্টলি ফিক্স করো… সেভ/ক্রিয়েট/আপডেট সাথে সাথে হয় না, মাঝে মাঝে হারিয়ে যায় — কেন/কোথায় ব্যাখ্যা করো… মডারেটর প্যানেলের ডিজাইন অ্যাডমিন প্যানেলের মতো করো… মডারেটর+অ্যাডমিন লিস্টে মার্ক/মার্ক-অল ডিলিট… গ্রুপে সদস্য যোগ/বাদ UI… আরও আপগ্রেড সাজেশন দাও"

- **রুট-কজ (সেভ হারানো)**: `persist()`-এ ২০০ms ডিবাউন্স → `saveDb()` → snapshot-মোডে ১৫০০ms ডিবাউন্সড blob-আপলোড = ~১.৭ সেকেন্ড উইন্ডো; JSON-API রেসপন্সে ফ্লাশ ছিলই না (শুধু redirect-এ ছিল) → ইনস্ট্যান্স-সোয়াপে রাইট হারাত। **ফিক্স**: আপলোড-ডিবাউন্স ৪০০ms + `_snapshotDirty` ফ্ল্যাগ + `res.json`-এও ফ্লাশ-র‍্যাপ + ৫-সেকেন্ডের `_snapGuard` ডার্টি-ফ্লাশ ইন্টারভাল (db.js, server.js)
- **রুট-কজ (১৮-২০ ডুপ্লিকেট)**: সাবমিট-বাটনে তাৎক্ষণিক ফিডব্যাক নেই → অধৈর্য ক্লিক প্রতিটি ফুল POST+ফাইল। **ফিক্স (৩-স্তর)**: (১) `main.js`-এ **গ্লোবাল ডাবল-সাবমিট গার্ড** — capture-phase submit লিসেনার: বাটন disable+স্পিনার, ১০s সেফটি-রিলিজ, confirm-বাতিলে রিলিজ; GET/action-হীন/data-noguard ফর্ম বাদ (সাইটের সব ফর্মে প্রযোজ্য); (২) **সার্ভার-সাইড ডুপ-গার্ড** — press (title+paper, ২ মিনিট), articles ও qa (author+title, ২ মিনিট): মিললে নতুন সারি নয়, আগেরটায় রিডাইরেক্ট; (৩) টেস্ট-প্রমাণ: এক ক্লিক = ১ কাটিং, ২য় POST উপেক্ষিত
- **মডারেটর প্যানেল = অ্যাডমিন শেল**: ৯টি moderator-*.ejs এখন admin.css + কেন্দ্রীয় sidebar (নতুন "মডারেটর প্যানেল" নেভ-ব্লক, /moderator পাথে) + .admin-main র‍্যাপার; ডার্ক-থিম টোকেন সোয়াপ (নেভি-গ্রেডিয়েন্ট→সাদা কার্ড, সোনালি→সবুজ #059669); বাকি white-on-white কনট্রাস্ট ফিক্স; sidebar-এ typeof-গার্ড + মডারেটর-পাথে /logout
- **বাল্ক মার্ক/মার্ক-অল**: মডারেটরের ৫ লিস্টে (নোটিশ/ইভেন্ট/অভিযোগ/কাটিং/সদস্য) checkbox + সিলেক্ট-অল + #bulkBar + ৫টি `/moderator/<type>/bulk-delete` রুট (scope-গার্ডেড, '/:id'-এর আগে রেজিস্টার্ড); অ্যাডমিনে **অভিযোগ** লিস্টেও বাল্ক-বার (BULK_TABLES-এ complaints) — অ্যাডমিনের বাকি ৯ লিস্টে আগে থেকেই ছিল
- **গ্রুপ-সদস্য UI (সেশন-৩৮ বাকি)**: চ্যাট-হেডারে users-cog বাটন → প্যানেল: সদস্য-চিপ (ক্রিয়েটরকে ক্রাউন), অ্যাডমিনের জন্য যোগ-ফর্ম (কমা-সেপারেটেড) + সদস্য-বাদ ×, নন-অ্যাডমিনের জন্য "গ্রুপ ছাড়ুন"; রুট: members/add, members/:uid/remove, leave — সব convAccess+অ্যাডমিন-গার্ডেড
- **ভেরিফিকেশন**: session39 **22/22** + রেগ্রেশন smoke38 12/12, msg38 9/9, profile38 10/10 = **৫/৫৩**; স্ক্রিনশট `screenshots/session39/` (৪টি)

### সেশন ৩৮ (৭ সেপ্টেম্বর ২০২৬) — সোশ্যাল-ফিড বাগ-হান্ট + ফেসবুক-আদলে ফিড/মেসেঞ্জার/প্রোফাইল আপগ্রেড + গ্লোবাল 5px

**ইউজার রিকোয়েস্ট**: "সোশ্যাল ফিডের সবগুলো ফিচার যাচাই করে দেখ, কোনো বাগ আছে কিনা… মেসেজিং ইন্টারফেস মেসেঞ্জারের মত আধুনিক… গ্রুপ ক্রিয়েট… একবার মেসেজ পাঠালে ১০-২০ বার যেন না যায়… রাউন্ডেড রেক্টেঙ্গেল সবগুলোর রাউন্ডনেস 5px (গ্লোবাল)… 'বিষয় বাছুন' অংশটা একদম বাদ… শেয়ার এক ক্লিকে… care রিয়েক্ট… বেল সার্কুলার… লগইন/এডিটের পর ৪০৪ পার্মানেন্টলি ফিক্স… প্রোফাইল পিক/কভারে ক্লিক-মেনু + অটো-পোস্ট… সংযুক্ত অ্যাকাউন্ট FB-স্টাইল… অ্যাডমিনে URL-ফিল্ডের পাশে আপলোড"

- **বাগ-ফিক্স**: (১) মেসেজ ডুপ্লিকেট — optimistic tmp-বাবল + poll-এর আসল বাবল = প্রতি মেসেজ ২বার; এখন সার্ভার POST-এ `id` ফেরত দেয়, tmp-বাবল swap হয় → **ঠিক ১ বাবল** (টেস্ট-প্রমাণ); (২) নোটিফিকেশন ডুপ — `notifyOnce` (১০ মিনিট ডুপ-গার্ড) + কমপ্লেইন্ট ডুপ-উইন্ডো ৫→৬০ মিনিট; (৩) **"সেভ/লগইনের পর ৪০৪" পার্মানেন্ট ফিক্স** — Vercel snapshot-মোডে `res.redirect`-এর আগে `session.save` + `db.flushDb()`: পরের রিকোয়েস্ট অন্য ইনস্ট্যান্সে নামলেও নতুন ডেটা পায় (রেস কন্ডিশন eliminated); (৪) UNION-কলাম মিল রেখে feed SQL-এ share_count
- **গ্লোবাল 5px রাউন্ডনেস** — ৬ CSS + ৩২ EJS sweep (border-radius-এর সব px→5px; 50%/সার্কেল অক্ষত); অ্যাডমিন `--ad-radius` 12→5px
- **ফিড FB-স্টাইল** — অ্যাকশন-বারের উপরে সামারি স্ট্রিপ (বামে রিয়েক্ট-ইমোজি+কাউন্ট, ডানে কমেন্ট/শেয়ার কাউন্ট আইকনসহ); **care 🤗 রিয়েক্ট** (REACTIONS/ALLOWED/main.js META/পিকার); **one-click শেয়ার** (.share-now → সরাসরি টাইমলাইন, caret-এ পুরনো মেনু); কমেন্ট/রিপ্লাই FB-কম্প্যাক্ট (গোলাকার ইনপুট, ছোট অ্যাভাটার, 5px বাবল); dashboard-এর "বিষয় বাছুন" interest-hint **বাদ**
- **মেসেঞ্জার** — ফুল-উইডথ (+১৬px সাইড প্যাডিং); **গ্রুপ মেসেজিং**: `conversation_members` টেবিল + conversations-এ is_group/title (idempotent মাইগ্রেশন), গ্রুপ-তৈরি ফর্ম, গ্রুপ-চ্যাট `/messages/g/:id`, গ্রুপে সদস্য-নাম+অ্যাভাটার বাবলে, poll/seen/typing-এ কেন্দ্রীয় `convAccess`; **মেসেজ-রিয়েকশন** (`message_reactions` টেবিল, হোভার-ইমোজি মেনু, চিপ); **কথোপকথনের ভিতরে মেসেজ-সার্চ**; লিস্টে সব/আনরিড/গ্রুপ ফিল্টার-চিপ; সেন্ড বাটন টেক্সটবক্সের একদম ডানে (গোলাকার)
- **নোটিফিকেশন** — বেল **পারফেক্ট সার্কুলার** (ডিম-আকৃতি ফিক্স); ড্রপডাউন FB-স্টাইল: টাইপ-অনুযায়ী গোলাকার আইকন, ২-লাইন বডি, সময়, আনরিড ডট
- **প্রোফাইল** — কভার 350px (FB-অনুপাত, রেসপন্সিভ), অ্যাভাটার 168px হোয়াইট বর্ডার; অ্যাভাটার/কভারে **ক্লিক-মেনু** (দেখুন / পরিবর্তন করুন); পরিবর্তনে **অটো-পোস্ট** → নিজের টাইমলাইন + মূল ফিড
- **সেটিংস** — "সংযুক্ত অ্যাকাউন্ট" FB-স্টাইল কার্ড-রো (গোলাকার ব্র্যান্ড আইকন, বর্ণনা, স্ট্যাটাস চিপ, ৪ প্রোভাইডার)
- **অ্যাডমিন/মডারেটর** — নতুন `POST /admin/upload-image` (requireStaff) + কেন্দ্রীয় `admin-url-upload.js` (sidebar.ejs-লোডেড): যেকোনো image/url-ইনপুটের পাশে আপলোড-বাটন, ফাইল→URL অটো-বসে
- **/me** — FB-প্রোফাইল-স্টাইল গ্র্যাডিয়েন্ট হেডার + ওভারল্যাপড অ্যাভাটার, হোভার-স্ট্যাট-টাইল, পিল-ট্যাব
- **ভেরিফিকেশন** — smoke38 **12/12**, msg38 **9/9**, profile38 **10/10**; trace404: রেজিস্টার→লগইন→এডিট→মেসেজে ০×৪০৪/০×৫xx; স্ক্রিনশট `screenshots/session38/` (১১টি)
- **নোট**: গ্রুপে user_a/user_b = ক্রিয়েটর (সদস্যতা members-টেবিলে); গ্রুপে is_read = "কেউ পড়েছে"; টাইপিং-ইন্ডিকেটর 1-on-1-এ সীমিত

### সেশন ৩৭ (৭ সেপ্টেম্বর ২০২৬) — অ্যাডমিন প্যানেল রিথিম: ফেসবুক Page Settings-স্টাইল হালকা থিম + ব্র্যান্ড-নাম "লেখক ফোরাম" সর্বত্র চূড়ান্ত

**ইউজার রিকোয়েস্ট**: "আগে বর্তমান পরিস্থিতি দেখ… এডমিন/মডারেটর ইন্টারফেস — ফেসবুক Page Settings স্টাইলে রিথিম… sidebar-এর লোগো 'লেখক ফোরাম' করো… যেসব জায়গায় আরও ডেভেলপমেন্টের সুযোগ আছে সেগুলো আইডেন্টিফাই করে আরও উন্নত ও প্রফেশনাল করো" + প্রেফারেন্স-উত্তর (ব্র্যান্ড: পাবলিক সাইটসহ সর্বত্র · অ্যাকসেন্ট: বিদ্যমান সবুজ · মৃত কোড: রাখা · পুশ: হ্যাঁ)

- **রিথিম (`admin.css` v6)** — ডার্ক নেভি/গোল্ড → ফেসবুক Page Settings-স্টাইল হালকা থিম: সাদা সাইডবার + `#f0f2f5` ক্যানভাস; প্রতি নেভ-আইটেমে বৃত্তাকার ধূসর আইকন, সিলেক্টেডতে ভরাট সবুজ আইকন + হালকা-সবুজ রাউন্ডেড পিল; গ্রুপড নেভ (মূল/সংগঠন/কনটেন্ট/কমিউনিটি/সিস্টেম) ও ২০/১০ আইটেম অক্ষত; হালকা টেবিল-হেডার, কার্ড, টোস্ট, চিপ, স্ট্যাট-কার্ড, ce-* এডিটর, লগইন — সব একই ভিজ্যুয়াল ভাষায়; দুই-ফন্ট নিয়ম ও সব কম্পোনেন্ট-ক্লাস অক্ষত
- **`sidebar.ejs`** — লোগো **"লেখক ফোরাম"**; নতুন সার্চ বক্স ("সেটিংস খুঁজুন") = ক্লায়েন্ট-সাইড নেভ-ফিল্টার (খালি গ্রুপ-লেবেল লুকায়, Esc রিসেট, "কোনো মিল নেই" হিন্ট); **ব্রেডক্রাম্ব কেন্দ্রীয় ইনজেকশন** (অ্যাডমিন › গ্রুপ › আইটেম › নতুন/সম্পাদনা) সব পেজের হেডারে; a11y — হ্যামবার্গারে aria-expanded/aria-controls, অ্যাক্টিভ লিংকে aria-current, সার্চে role/aria-label, টোস্টে role=status; ড্রয়ার/টোস্ট/ড্রাফট-অটোসেভ লজিক অপরিবর্তিত
- **ভিউ-লেভেল সামঞ্জস্য** — login.ejs হালকা থিম (সবুজ এমব্লেম/বাটন); tasks.ejs-এর ১০০% ইনলাইন স্টাইল → স্ট্যান্ডার্ড ক্লাস (অসংজ্ঞায়িত `.admin-topbar` CSS-এ সংজ্ঞায়িত); users list/edit-এর ইনলাইন `<style>` টোকেন; settings-এর h3 → form-section-title; moderators/daily ইনলাইন রঙ ফিক্স
- **পাবলিক সাইট** — রিনেমের পর টপবার ব্র্যান্ড আবার পাঠযোগ্য মাপে (17px/11px; সেশন ৩১-এর 10px বাঁধন ছিল দীর্ঘ নামের জন্য)
- **ব্র্যান্ড-রিনেম চূড়ান্ত (AUDIT deliberate non-change #1 সমাধান)** — "বাংলাদেশ তরুণ কলাম লেখক ফোরাম" → "লেখক ফোরাম" ৮৩টা প্রোডাক্ট ফাইলে (views/js/css/registry/mailer/seed); ", চট্টগ্রাম বিশ্ববিদ্যালয়" সাফিক্স অক্ষত; **idempotent DB মাইগ্রেশন** (`db.js` → `brandRenameMigration`, applyLaterMigrations-এ): settings/site_name + content_* + constitution + resources + members + past_leaders-এ UPDATE+REPLACE — প্রতি বুটে চলে, Turso-সেফ, exact-substring; ফলে পুরনো লোকাল/প্রোডাকশন DB থেকেও পুরনো নাম মুছে যায়
- **ভেরিফিকেশন (Playwright, আগে/পরে একই মেথডলজি)** — ৩০ পেজ × ২ + ১৪ কনটেন্ট-ট্যাব × ২ স্ক্রিনশট; ফাংশনাল: টোস্ট (?saved=1) ✓ · ড্রাফট অটোসেভ রিস্টোর ✓ · মোবাইল ড্রয়ার open/close ✓ · ১৪ ট্যাব/২৪১ ফিল্ড অপরিবর্তিত ✓ · এডমিন ২০/মডারেটর ১০ নেভ-আইটেম অপরিবর্তিত ✓ · নেভ-সার্চ ফিল্টার ✓ · ব্রেডক্রাম্ব ✓ · সব পেজে JS এরর ০; ফিল্ড/বাটন/ফর্ম প্যারিটি: members-list বাদে সব পেজ হুবহু (members 86→78 = ফ্রেশ-সিডের ৮ ডুপ্লিকেট রো dedupe মাইগ্রেশনে সরেছে — ক্যানন ৭, সেশন ২৪/৩৫-এ নথিভুক্ত; রিগ্রেশন নয়); `scripts/test-login-fixes.sh` 14/16 — ২ ফেইল **pre-existing** (pristine বুটে প্রমাণিত: committee-seed আগে users ভরায় `users==0` গেট ismail ডেমো-সিড স্কিপ করে; §৭-এর ডক-ড্রিফট)
- **নোট** — `test-lekhok.sh` (77 চেক) এখনো রিপোতে নেই (AUDIT সুপারিশ #৫); এই সেশনের ভেরিফিকেশন স্ক্রিপ্ট অ্যাডমিন প্যানেল কভার করে, পূর্ণ স্যুট রিস্টোর ভবিষ্যৎ কাজ
- **শিক্ষা**: সাইডবার-স্ক্রিপ্ট `.admin-main`-এর আগে চলে — DOM-ইনজেকশন ফিচারে DOMContentLoaded গার্ড লাগবে; ফিক্সড ড্রয়ার খোলা অবস্থায় Playwright-এর সেন্টার-ক্লিক actionability-তে ফেইল করে (position-ক্লিক লাগে); flex হেডারে ইনজেক্টেড চাইল্ডকে নিজের লাইন দিতে flex-basis:100%

#### সেশন ৩৭ পার্ট-২ — ধাপ ৫: চারটি অনুমোদিত প্রফেশনাল ফিচার (ইউজারের "হ্যাঁ" পরে)

- **গ্লোবাল সেটিংস-সার্চ** — `GET /admin/search-index` (requireStaff) কনটেন্ট-রেজিস্ট্রির **২৪১ ফিল্ড + ৯ সেটিংস** JSON-এ দেয়; সাইডবারের "সেটিংস খুঁজুন" বক্সে নেভ-ফিল্টারের পাশাপাশি নতুন **লেজি-লোড ড্রপডাউন** (প্রথম focus-এ ফেচ, ১৫০ms-এ নয় — সরাসরি; সর্বোচ্চ ৮ রেজাল্ট; ArrowUp/Down/Enter/Esc কীবোর্ড-নেভিগেশন); ফিল্ড-রেজাল্ট → `/admin/content?page=<page>#f_<key>` (টার্গেট ট্যাব অটো-অ্যাক্টিভেট + ফিল্ডে সবুজ **field-flash** অ্যানিমেশন + scrollIntoView), সেটিংস-রেজাল্ট → `/admin/settings#set_<key>`; হ্যাশ-জাম্প হ্যান্ডলার জেনেরিক (সাইডবারে কেন্দ্রীয়)
- **বাল্ক অ্যাকশন** — ৯টি লিস্ট-ভিউতে (notices/events/daily/gallery/members/resources/achievements/constitution/past-leaders) সিলেক্ট-অল + সারি-চেকবক্স; চেক পড়লে স্টিকি ডার্ক **বাল্ক-বার** (বাংলা সংখ্যায় গণনা) — `POST /admin/<type>/bulk-delete` (প্রতি টাইপের নিজস্ব গার্ড: scope/admin) + ডেইলিতে অতিরিক্ত **বাল্ক প্রকাশ/আনপাবলিশ** (`POST /admin/daily/bulk-publish`); গ্যালারি কার্ড-গ্রিডে ওভারলে চেকবক্স; সাবমিটে confirm() (বাটনভেদে বার্তা, `data-bulk-msg`); ids স্যানিটাইজ (integer>0, max 500)
- **অ্যাক্টিভিটি লগ** — নতুন টেবিল `activity_logs` (idempotent CREATE, sql.js+Turso উভয়ে); **সিংল router.use মিডলওয়্যার** সব সফল POST/PUT/DELETE (2xx–3xx) অটো-লগ করে — actor (adminUser/user সেশন থেকে), method, route-pattern, params + ফিল্ড-নাম (**পাসওয়ার্ড-কী কখনো লগ হয় না**, ভ্যালু নয় শুধু কী); ভবিষ্যৎ রুটও অটো-কভার্ড; নতুন পেজ `GET /admin/activity` (requireStaff, সর্বশেষ ২০০) + নতুন ভিউ `activity.ejs` (অ্যাকশন-চিপ, রোল-চিপ, সময়/টার্গেট/বিস্তারিত); সাইডবারের সিস্টেম গ্রুপে "অ্যাক্টিভিটি লগ" (সব স্টাফ)
- **পারমিশন ব্যাজ** — router.use মিডলওয়্যার `res.locals.userScopeMeta` বানায় (admin = ১০টি ক্যাননিক্যাল, মডারেটর = `db.getModeratorScopes`-এর ফিল্টারড CANONICAL_SCOPES); মডারেটরের সাইডবার ইউজার-কার্ডের নিচে **আইকন মিনি-ব্যাজ** (title=লেবেল); `/admin/moderators`-এ প্রতি মডারেটর-কার্ডে **scope-mini চিপ** (আইকন+লেবেল)
- **ভেরিফিকেশন** — নতুন `feature-test.js` (pwtool): **১৮/১৮ পাস** (বাল্ক গণনা/select-all/আসল ডিলিট 7→6 · ড্রপডাউন "hero"→৭ রেজাল্ট · সেটিংস #set_ · Enter-জাম্পে ট্যাব-অ্যাক্টিভ+ফিল্ড-দৃশ্যমান · লগে bulk-delete এন্ট্রি · মডারেটর সাইডবারে ১০ ব্যাজ · moderators পেজে ১০ চিপ · JS এরর ০); ফুল রি-ভেরিফি ৩০ পেজ ০ এরর; মেট্রিক্স-ডিফ ৮৭টি — সবকটি প্রত্যাশিত সংযোজন (navItems 20→21 সব পেজে, মডারেটর 10→11, ৯ লিস্টে +forms/buttons); `test-login-fixes.sh` 14/16 (২ ফেইল আগের মতো pre-existing); সিড-ডেটা অক্ষত (notices ৬/৬)
- **পরিধি**: রুট 86→98; নেভ-আইটেম অ্যাডমিন 20→21, মডারেটর 10→11 (নতুন: অ্যাক্টিভিটি লগ); অ্যাডমিন ভিউ 32→33 (activity.ejs); CSS/সাইডবার/৯ লিস্ট/moderators/db-তে সংযোজন — **কোনো বিদ্যমান রুট/ফিল্ড/মেনু-আইটেম বাদ যায়নি**


### সেশন ৩৬ (৭ সেপ্টেম্বর ২০২৬) — হটফিক্স: লাইভ সাইট-ওয়াইড 500 — মডিউল-লোড multer ক্র্যাশ (মূল কারণ) + কোল্ড-বুট ফাস্ট-পাথ (গুপ্ত ঝুঁকি)

**ইউজার রিকোয়েস্ট**: "সব রিভেরিফাই কর!" — পুনঃযাচাইয়ে দেখা গেল লাইভ https://lekhok-forum.vercel.app **সব রুটে HTTP 500 (FUNCTION_INVOCATION_FAILED)**।

- **নির্ণয়-পথ**: স্ট্যাটিক `/assets/css/style.css` 200 (বিল্ড ঠিক) কিন্তু সব ফাংশন-রুট ~২০ সেকেন্ড পরে 500; Turso জীবিত (অথেনটিকেটেড কোয়েরি ১৭৪ms) — DB-আউটেজ নয়। `api/index.js`-এ অস্থায়ী সিক্রেট-গেটেড বুট-ডায়াগ বসিয়ে আসল এরর বের করা হয়: **`stage=require-server` → `ENOENT: mkdir 'public/uploads/content/'`**
- **মূল কারণ (কমিট 778437b, সমান্তরাল কর্তা)**: `admin/routes.js`-এ **মডিউল-লোডে** `multer({ dest: 'public/uploads/content/' })` — multer-এর DiskStorage কনস্ট্রাক্টর লোডের সময়ই destination-এ `mkdirSync` চালায়; Vercel-এর **read-only ল্যাম্বডা FS**-এ সেটি ENOENT/EROFS ছুঁড়ে `require('../server')` ক্র্যাশ করায় → প্রতিটি কোল্ড ইনভোকেশন মরে, আর ব্যর্থ ইনস্ট্যান্স প্ল্যাটফর্ম ফেলে দেওয়ায় প্রতিটি রিকোয়েস্ট নতুন কোল্ড বুটে গিয়ে মরত। (লোকালে FS লেখাযোগ্য ও ডিরেক্টরি আছে — তাই ৭৭+২৭ টেস্ট সবই পাস করেও লাইভ ভাঙা ছিল)
- **ফিক্স ১ (মূল)**: `admin/routes.js` — লেজি memoryStorage multer (শুধু রিকোয়েস্টে তৈরি) + নতুন `storeBufferImage()` (middleware/upload.js) দিয়ে দ্বৈত-মোড সংরক্ষণ: Vercel-এ @vercel/blob, লোকালে গার্ডেড ডিস্ক + WebP অপ্টিমাইজ; এডিটরের `uploadImage()` ফ্লো ও `{ok,url}` রেসপন্স-শেপ অটুট
- **ফিক্স ২ (গুপ্ত ঝুঁকি — যা প্রায় ধরা পড়েনি)**: Turso-তে কোল্ড বুটে runMigrations + applyLaterMigrations + seed-চেক = **১০২ সিরিয়াল কোয়েরি × ~১৫৩ms RTT = ১৫.৬ সেকেন্ড বুট** — টাইমআউট-সীমার একদম কাছে; db.js-এ **বুট ফাস্ট-পাথ**: পূর্ণ ইনিট সফল হলে `_boot_cache.init_fingerprint` = md5(মাইগ্রেশন/সিড-ফাংশন-সোর্স + version) সেভ; পরের বুটে হ্যাশ মিললে সব স্কিপ। মেপা: **১৫,৬৪৯ms → ৬৪৮ms (২৪×)**; ফাংশন-সোর্স বদলালে হ্যাশ অটো-বাস্ট — নতুন মাইগ্রেশন সবসময় চলে। সাথে vercel.json-এ `maxDuration: 60`
- **রিগ্রেশন ও লাইভ যাচাই**: লোকাল 77/77 + 27/27 + আপলোড E2E (login→upload→`{ok:true,url}`→URL সার্ভ→অথ-গার্ড 302) PASS; লাইভে **verify-live-session31 ২৬/২৬ + verify-session35-browser ২৭/২৭** + স্ক্রিনশট (ফিড শোকেস, FAQ প্যাডিং, কমিটি, রিসোর্স ট্যাব, অভিযোগ, এডমিন এডিটর); স্ক্রিপ্টে `VERIFY_USER/VERIFY_PASS` env (লাইভে লোকাল-ফিক্সচার ইউজার riya নেই)
- **শিক্ষা**: (১) **মডিউল-লোডে কখনো multer({dest})/DiskStorage নয়** — constructor-ই FS-এ লেখে; read-only পরিবেশে লেজি memoryStorage + Blob-ই পথ; (২) লোকাল-পাস ≠ লাইভ-পাস — পরিবেশ-পার্থক্য (read-only FS, দূরবর্তী DB RTT) বুট-পথে বাড়ি থাকে; (৩) push-এর ঠিক পরেই লাইভ-যাচাই করা উচিত; (৪) সিক্রেট-গেটেড বুট-ডায়াগ এন্ডপয়েন্ট প্রোডাকশন-ইনসিডেন্টে নির্ণয়ের দ্রুততম পথ (ব্যবহারের পরে সরানো হয়েছে)

### সেশন ৩৫ (৭ সেপ্টেম্বর ২০২৬) — ফিড শোকেস + হিরো-উইজেট স্থানান্তর, প্যাডিং ফিক্স, অভিযোগ UX+ডুপ্লিকেট-গার্ড, এডমিন ইমেজ-আপলোড ও রিসেট-টু-ডিফল্ট

**ইউজার রিকোয়েস্ট**: "ছবি/ব্যানার আপলোড-ফিল্ড বা প্রতি-ফিল্ড 'রিসেট টু ডিফল্ট' বাটন যোগ কর। ডিজাইন প্রফেশনাল হতে হবে। ইউজার প্রোফাইলের অভিযোগ অংশের UX ডিজাইন প্রফেশনাল লাগছে না। আর একজন একটা অভিযোগ দিলে সেটা অনেকবার হয়ে যাচ্ছে। হিরো সেকশনের ডান অংশের স্লাইডিং উইজেট সরিয়ে দাও, নিচের 'ইউজার ফিড' সেকশনের সাথে ইন্টিগ্রেট কর। 'সাধারণ জিজ্ঞাসা' সেকশনে প্যাডিং নেই। ইউজার ফিডকে বেশি হাইলাইট কর। কার্যনির্বাহী কমিটির কার্ডে সাইড-প্যাডিং নেই। রিসোর্সের নিচের 'পত্রিকার ইমেইল তালিকা' লিংক সরাও, তবে সাব-পেজ হিসেবে রাখো, নাম 'পত্রিকার ইমেইল' করো।"

- **হোম — ফিড শোকেস (`#user-feed`)** — হিরোর ডান পাশের স্লাইডিং উইজেট সম্পূর্ণ সরানো (লেখা ঢেকে দিত); নতুন লুক্রেটিভ প্যানেল: ডিপ-এমারাল্ড→নেভি গ্র্যাডিয়েন্ট, ডেকোর-অর্ব, eyebrow/শিরোনাম/লিড + ৩টি চেক-পয়েন্ট + ২ CTA (ফিডে যান / ফ্রি অ্যাকাউন্ট) + ডানে গ্লাস-স্টাইল অটো-রোটেটিং ক্যারোসেল (কুইজ, এই দিনে, ই-পেপার, সেরা লেখক); main.js-এ initFeedCarousel (6s, pause-on-hover, reduced-motion)
- **হোম — সাধারণ জিজ্ঞাসা** — আসল বাগ: QA + ফিড ব্লক container/section-এর **বাইরে** ছিল (stray `</section>`), তাই দুই পাশে প্যাডিং-হীনভাবে কিনারায় লেগে ছিল; এখন পূর্ণ সেকশন-কাঠামো + প্রফেশনাল কার্ড-ডিজাইন (open-state এমারল্ড বর্ডার, উত্তর-ব্লক টিন্ট, রোটেটিং শেভরন), তালিকা max-900px সেন্টার
- **কার্যনির্বাহী কমিটি** — একই ধরনের বাগ: এই পেজের কনটেন্ট-ব্লকে `<section><div class="container">` ছিলই না; যোগ করা হয়েছে — কার্ডগ্রিড এখন অন্য সেকশনের মতো সাইড-প্যাডিংসহ
- **রিসোর্স সাব-পেজ** — নিচের বড় 'পত্রিকার ইমেইল তালিকা' বাটন-সেকশন সরানো; দুই পেজেই পিল-স্টাইল ট্যাব-নেভ ('গুরুত্বপূর্ণ ফাইল ও রিসোর্স' / 'পত্রিকার ইমেইল'); ইমেইল পেজের H1 ও pageTitle 'পত্রিকার ইমেইল'; /resources/emails রুট অটুট
- **অভিযোগ পেজ (`/complaints`)** — সম্পূর্ণ UX রিডিজাইন (cmp35): গ্র্যাডিয়েন্ট হিরো-ব্লক, গোপনীয়তা-ব্যানার, ক্লোজেবল সফল/ডুপ্লিকেট/ত্রুটি অ্যালার্ট, ফর্ম-কার্ড (ক্যারেক্টার-কাউন্টার, কাস্টম ড্র্যাগ-ড্রপ ফাইল-জোন, ফাইল-চিপ), স্ট্যাটাস-চিপ টাইমলাইন (in_review/dismissed CSS ছিলই না), অ্যাডমিন-নোট প্যানেল; **ল্যাটেন্ট বাগ**: GET /complaints-এ `query` পাসই হতো না — সফলতার বার্তা কখনো দেখাতও না
- **অভিযোগ ডুপ্লিকেট ফিক্স** — সার্ভার: ৫-মিনিট উইন্ডোতে একই user+subject+body → INSERT নয়, `?dup=1`; ক্লায়েন্ট: সাবমিটে বাটন-নিষ্ক্রিয় + স্পিনার
- **এডমিন কনটেন্ট এডিটর** — (১) **ছবি/ব্যানার আপলোড-ফিল্ড ৩টি**: `home_hero_banner`, `home_feed_banner`, `about_cta_bg` — type:'image' স্কিমা, চেকারবোর্ড প্রিভিউ, কাস্টম-ছবি ব্যাজ, ড্র্যাগ-সিলেক্ট, ফাইল-ইনফো, 5MB লিমিট, sharp WebP অটো, Blob/ডিস্ক দুই মোডেই (`makeContentImageUpload` → `req.filesContent[key]`); ভিউতে কন্ডিশনাল রেন্ডার (হিরো/ফিড/CTA-ব্যানারের পটভূমিতে ~১৬% ওপাসিটি; খালি = বর্তমান ডিজাইন); (২) **প্রতি-ফিল্ড 'ডিফল্ট' রিসেট-বাটন**: ২৩৮ টেক্সট-ফিল্ডে `data-default` + এক-ক্লিকে ডিফল্টে (ডার্টি-ট্র্যাকার সচেতন), ইমেজে 'রিসেট টু ডিফল্ট' → `reset_<key>=1` → সেটিং-মুছে ডিফল্ট; (৩) সেভড/এরর ব্যানার
- **বাগফিক্স (admin.css)** — `@media (max-width: 640px)` ব্লক আনক্লোজড ছিল (কমিট 89e6b81 থেকে) — এর পরের **সব ce-* রুল (ce-grid ২-কলাম, ce-savebar, ce-field) CSS-পার্সারে গিলে যাচ্ছিল**; ফলে কনটেন্ট এডিটরের ফিল্ডগুলো এক-কলাম আনস্টাইলড দেখাত; ব্রেস-ব্যালান্স 0 ভেরিফাইড
- **রেজিস্ট্রি বর্ধন** — ২৩১→২৪১ ফিল্ড (home_qa_eyebrow, home_feed_eyebrow, point১-৩, btn2, widget_label + ৩ ইমেজ); নতুন দৃশ্যমান টেক্সটে em dash শূন্য
- **টেস্ট**: verify-session35-browser.js **27/27** (উইজেট-স্থানান্তর, অটো-রোটেট, প্যাডিং ≥24px, ট্যাব-নেভ, রিসেট-বাটন আচরণ, আপলোড UI, ড্রপজোন, ব্যানার), ইমেজ-আপলোড E2E (POST→WebP→সাইটে প্রতিফলন→রিসেট→অদৃশ্য), অভিযোগ ডুপ্লিকেট E2E (submit→sent=1, পুনঃসাবমিট→dup=1, তালিকায় ১টাই), test-lekhok.sh **77/77**
- **শিক্ষা**: নতুন ক্যারোসেল গ্রিড-কলামে বসালে `overflow:hidden` বাধ্যতামূলক (ট্র্যাকের ৪×১০০% স্লাইড বাঁ-কলামে উপচে পড়ে); CSS অ্যাপেন্ডের আগে পুরনো ব্লকের ব্রেস-ব্যালান্স যাচাই করা উচিত

### সেশন ৩৪ (৬ সেপ্টেম্বর ২০২৬) — কনটেন্ট সম্পাদক সম্প্রসারণ: রেজিস্ট্রি-ভিত্তিক ১৪ পেজ / ২৩১ ফিল্ড + সমান্তরাল CMS-এর সাথে মার্জ

**ইউজার রিকোয়েস্ট**: "এডমিন প্যানেলে হোম পেইজসহ প্রতিটা পেইজ, সেকশন ঠিকঠাক করার মত ফন্টেন্ড ডেভেলপ কর! সাইটের সব কন্টেন্ট এডমিন চাইলে ইডিট করতে পারবে। সকল পেইজের! আর এডমিন ইন্টারফেইস আরেকটু আপডেট করতে হবে।"

- **কেন্দ্রীয় রেজিস্ট্রি (`helpers/content-registry.js`)** — ১৪ পেজ / ২৩১ ফিল্ড ডিক্লারেটিভ স্কিমা: হোম (হিরো, ৪ স্ট্যাট, আজকের কন্টেন্ট, লক্ষ্য-উদ্দেশ্য + ৮ ফিচার কার্ডের আইকনসহ, নেতৃত্ব ২ সেকশনের ৮ পদবি + ২ কার্যবর্ষ, জিজ্ঞাসা, ফিড, বিজ্ঞপ্তি), পরিচিতি (হেডার, পরিচয়, মূলমন্ত্র/স্লোগান, ৬ লক্ষ্য, ম্যাগাজিন, ৮ কার্যাক্রম, কলম-সৈনিক ব্যানার, ৪ ধাপ + পে-নম্বর, ১০ শর্ত, বিঃদ্রঃ), যোগাযোগ (৫ গ্রুপ), ১১টি পেজ-হেডার, হেডার-ব্র্যান্ড/লগইন/রেজিস্ট্রেশন বাটন, ফুটার ১০ ফিল্ড
- **ভিউ-হেল্পার (`helpers/content-view-helpers.js` + server.js)** — `C(key)` = settings `content_<key>` override → রেজিস্ট্রি-ডিফল্ট fallback (খালি ফিল্ডে সাইট কখনো খালি দেখায় না); `Cbr()` = escape + নতুন লাইন→`<br/>`; প্রতি-রিকোয়েস্ট settings-এ বাঁধা (sql.js + Turso, ক্যাশ-নিরাপদ)
- **এডিটর UI (`/admin/content`)** — বাম ১৪ পেজ-ট্যাব (ফিল্ড-কাউন্টসহ) + ডান গ্রুপ-করা ফিল্ড গ্রিড + লাইভ আইকন-প্রিভিউ + অসংরক্ষিত-পরিবর্তন কাউন্টার + স্টিকি সেভ-বার (ডাবল-ক্লিক গার্ড) + ট্যাব মনে রাখা (localStorage) + `?page=` ডিপ-লিংক; মোবাইল রেসপনসিভ
- **অ্যাডমিন ইন্টারফেস** — সাইডবারে 'কনটেন্ট সম্পাদক' (সিস্টেম গ্রুপ), ড্যাশবোর্ডে গোল্ড কুইক-অ্যাকশন বাটন, সেটিংসে Twitter/X URL, admin.css-এ ce-* ডিজাইন সিস্টেম + btn-gold
- **১৫টি পাবলিক ভিউ C()-ওয়্যারড**; যোগাযোগ পেজের ঠিকানা/ইমেইল/ফোন ও ফুটারের যোগাযোগ-তথ্য এখন সেটিংস পেজের মান অনুসরণ করে
- **সমান্তরাল কর্তার CMS-এর সাথে রিবেজ-মার্জ** — push-এর সময় দেখা যায় তারাও `/admin/content` (৭ ট্যাব, getContent-স্টাইল) ঠেলেছে; রেজল্যুশন: তাদের বেস + আমার সুপারসেট — হিরো-ক্যারোসেল, db.js getContent/setContent, ফুটার সোশ্যাল-ওয়্যার রক্ষা; তাদের ডুপ্লিকেট /content রুট (Express first-match-এ ডেড), CONTENT_SCHEMA ব্লক ও 'কন্টেন্ট ম্যানেজার' সাইডবার লিংক সরানো
- **বাগফিক্স (তাদের ভার্সনের)** — পরিচিতি পেজের 'অবশ্যপালনীয় শর্ত' লুপ fallback `''` দিলে ডিফল্টে **১০টি শর্তই অদৃশ্য** হয়ে যেত; এখন rule১-১০ ডিফল্টসহ সবসময় দৃশ্যমান
- **টেস্ট**: verify-session33.sh **48/48** (auth গার্ড, সেভ→সাইটে প্রতিফলন→রিসেট→ডিফল্ট, মডারেটর-ব্লক), verify-session33-browser.js **15/15** (ট্যাব, ডার্টি কাউন্টার, আইকন প্রিভিউ, সেভ E2E, JS-error ০), test-lekhok.sh **77/77**; em dash ক্লিন (নতুন দৃশ্যমান স্ট্রিং)
- **শিক্ষা**: push-এর আগে `git pull --rebase` না করলে সমান্তরাল CMS-এর সাথে সংঘর্ষ; কনফ্লিক্টে তাদের বেস রেখে আমার ডেল্টা বসানোই সবচেয়ে নিরাপদ

### সেশন ৩৩ (৬ সেপ্টেম্বর ২০২৬) — ফুল-স্কোপ অডিট + UX/Auth বাগফিক্স + `/search` পেজ + হিরো ক্যারোসেল

**ইউজার রিকোয়েস্ট**: কোনো রিরাইট নয়; সব পরীক্ষা করে বাগ/গ্যাপ বের করে এই রিপোতেই ঠিক করা, হিস্ট্রি-সহ। ফলাফল: নতুন **AUDIT.md** (ফাইন্ডিং F1–F9 + প্রমাণ + deliber non-changes)।

**ঠিক হওয়া বাগ (regression-প্রুভড)**

- **গ্লোবাল সার্চ সব পেজে চালু** — JS `layout.ejs` inline থেকে `main.js`-এ; আগে ৩৯টা user পেজে বাটন মরা ছিল (F1)
- **Shrink হেডার + scroll-progress + back-to-top সব পেজে** — `#mainHeader`-only সিলেক্টর → `.btclf-topbar`; missing markup main.js ইনজেক্ট করে (F2, F3)
- **লাইভ রোল-রিফ্রেশ** — re-login লাগত; এখন প্রতি রিকোয়েস্টে সেশনে ফ্রেশ role (প্রুভ: demote→তৎক্ষণাৎ 403, promote→200, একই কুকিতে) (F6)
- **Async bcrypt** — compareSync/hashSync → await compare/hash, ৮ সাইট (login যাচাইকৃত) (F5)
- ফুটার সোশ্যাল placeholder→settings URL (F7); api.js ডাবল `module.exports` সরানো (F4)

**নতুন ফিচার**

- `/search?q=` পূর্ণাঙ্গ সার্চ-পেজ: posts/questions/users/notices/daily_content grouped রেজাল্ট, ভ্যালিডেশন, empty-state (F8, §১২ gap বন্ধ)
- হিরো প্রমো ক্যারোসেল (কুইজ/এই দিনে/ই-পেপার/সেরা লেখক) — auto-rotate, dots, pause-on-hover, reduced-motion aware (F9, §১৩ আইটেম)

**ইচ্ছাকৃত অ-পরিবর্তন**: দীর্ঘ ব্র্যান্ড-নাম (সেশন ২৯-৩২-এর deliberate পলিশ মানা), `/dashboard` public feed, db.js সিড-টাইম hashSync — বিস্তারিত AUDIT.md §৩।


### সেশন ৩২ (৬ সেপ্টেম্বর ২০২৬) — লাইভ-ডিপ্লয় পূর্ণাঙ্গ যাচাই + অবশিষ্ট দৃশ্যমান em dash নির্মূল (সিড + মাইগ্রেশন + টেস্ট-ফিক্সচার)

- **ইউজার রিকোয়েস্ট**: 'এবার ভেরিফাই কর' — সেশন ২৯-৩১-এর সব ফিক্স লাইভ সাইটে (Vercel auto-deploy-এর পর) হেডলেস-ব্রাউজার দিয়ে প্রমাণসহ যাচাই
- **লাইভ যাচাই (verify-live-session31.js, ২৬ পয়েন্ট)**: টপবার ব্র্যান্ড দুই লাইন 10px সমান, লগইন/রেজিস্ট্রেশন 7×14 @12.5px, ফুটার ব্র্যান্ড 17px = ফুটার হেডিং (টপবার থেকে স্বাধীন), নেতৃত্ব ৮ কার্ড (a-wrap ০, data-href ২, উচ্চতা ৮/৮ = 760px, বক্তব্য ৭২-৭৭ শব্দ, সোশ্যাল সেন্টার), members 30/20 + গ্যাপ 12/16/12, কমিটি এক h1 + ড্রপডাউন + মডাল লুকানো, পরিচিতি লক্ষ্য ৬ — **প্রথম রানেই ২৩/২৬ PASS**
- **৩টি FAIL-এর তদন্ত**: (১) L15 আমার সিলেক্টর-ভুল — বক্তব্যের ক্লাস `.leader-bani`, সাইট নিরপরাধ; (২) L22-এ ধরা h2 টা ফুটারের ব্র্যান্ড-নাম, কমিটিতে একটাই h1 — সাইট নিরপরাধ; (৩) **L26 আসল বাগ** — হোমের 'সাধারণ জিজ্ঞাসা'-তে সিড-QA 'কোন ভাষায় লিখব — বাংলা নাকি ইংরেজি?'-তে em dash
- **গভীর সুইপ**: em dash-এর আরও উৎস — db.js-এর ৮টি সিড-স্ট্রিং (ডেমো-মডারেটর বায়ো, গ্যালারি ক্যাপশন, কুইজ উত্তর, ই-পেপার টাইটেল, ২ আর্টিকেল বডি+excerpt, QA উত্তর ও প্রশ্ন), lekhok-advisory.ejs-এর ২টি বছর-লেবেল, এবং test-lekhok.sh-এর ৭টি ফিক্সচার ('টেস্ট প্রশ্ন — automated' ইত্যাদি — প্রতি টেস্ট-রানে লোকাল DB-তে em dash ঢুকে যাচ্ছিল; লোকালে জমেছিল ৫৪ টাইটেল + ৮১ কমেন্ট)
- **ফিক্স ৩ স্তরে**: (১) db.js সিড ৮টি স্ট্রিং ক্লিন (নতুন ইনস্টল), (২) db.js initDb-তে **(1c) em dash মাইগ্রেশন** — exact-match UPDATE-এ পুরনো DB (প্রোডাকশন Turso সহ) বুটেই ক্লিন, অ্যাডমিন-এডিট অস্পৃশ্য, ইডেম্পোটেন্ট; টেমপ্লেট ২টি; (৩) test-lekhok.sh ফিক্সচার ' — automated' → ', automated'; লোকাল DB একবারে clean-test-emdash.js দিয়ে ক্লিন (ব্যাকআপ /tmp/lekhok-backup-session32.db)
- **শিক্ষা (এনভায়রনমেন্ট)**: এই স্যান্ডবক্সে ব্যাকগ্রাউন্ড node সার্ভার টুল-কল শেষে মারা যায় — সার্ভার+টেস্ট একই bash কলে চালাতে হয়; Vercel-এ Playwright-এর networkidle/load ঝুলে যায় — domcontentloaded+settle নিরাপদ
- **টেস্ট**: লোকাল ২৬/২৬ PASS (L26 সহ) + পেজ-সুইপে /qa, /quiz, /epaper, /committee, /advisory, /about, /members em dash ০ (বাকি মিলগুলো HTML/CSS কমেন্ট — দৃশ্যমান নয়); test-lekhok.sh **77/77 PASS**; পরবর্তী: পুশ → Vercel ডিপ্লয় → লাইভ রি-ভেরিফাই

### সেশন ৩১ (৬ সেপ্টেম্বর ২০২৬) — হেডার/ফুটার টাইপোগ্রাফি সমাই + "ফিডে যান" বাটন + সদস্য পেজ কমপ্যাক্ট

- **ইউজার রিকোয়েস্ট**: ৫টি UI সমাই — (১) টপবারের পুরো নাম একই সাইজে ও একটু ছোট, (২) লগইন/রেজিস্ট্রেশন বাটনের ফ্রেম-পেডিং কম, (৩) সদস্য পরিচিতি পেজে হেডার→ফিল্টার→কাউন্টের অপ্রয়োজনীয় গ্যাপ কম, (৪) "ফিডে যান" বাটনের লেখা ফ্রেমে লেগে যাচ্ছে, (৫) ফুটার ১ম কলামের নাম = ফুটার হেডিং সাইজ (টপবার লোগোর সাথে সম্পর্কহীন)
- **কাজ দুই ধাপে**: সমান্তরাল কর্তা `6ceef7c`-এ অনেকটা ঠেলেছে (ব্র্যান্ড 10px, বাটন padding 7×14 @12.5px, ফিডে-যান `.topbar-right .btn-ghost` 6×14 !important, ফুটার h2 17px, members-এ ফিল্টার+কাউন্ট এক সেকশনে) — যাচাই করে **২টি ফাঁক** ফলো-আপে বন্ধ করা হয়েছে
- **ফাঁক ১ — ব্র্যান্ডের specificity লিক (style.css)**: `.btclf-topbar .logo-text strong { font-size:16px }` (0,2,1) `.logo-text-v2 strong`-এর 10px (0,1,1)-কে হারায় — টপবারের ১ম লাইন আজও 16px-এ 'বড় ছোট' দেখাচ্ছিল (সেশন ৩০-এর 11px ফিক্সও রেন্ডারে পৌঁছায়নি একই কারণে)। ফিক্স: `.btclf-topbar .logo-text-v2 strong, .brand-line2 { font-size:10px !important }` — দুই লাইন সমান 10px (shrunk + ≤480px মিডিয়া সহ)
- **ফাঁক ২ — সদস্য পেজের হেডার→ফিল্টার গ্যাপ (lekhok-members.ejs)**: `page-header` padding 60px/50px অটুট ছিল; পেজ-লোকাল ওভাররাইড `30px 0 20px`, গ্রিড margin-top 26→12px
- **টেস্ট**: verify-session31.js headless 16/16 PASS (টপবার 10+10 সমান, ফুটার 17=17 ও টপবার থেকে স্বাধীন, লগইন 7×14 @12.5px, ফিডে-যান 6×14 @12.5px, page-header 30/20, session30 কার্ড ৮/৮ অক্ষত); test-lekhok.sh **77/77 PASS**; লোকাল লগইন E2E-সহ (ismail)

### সেশন ৩০ (৬ সেপ্টেম্বর ২০২৬) — লিডারশিপ কার্ডের আসল বাগফিক্স: nested `<a>` + ২ সেকশনে বিভাজন

- **ইউজার রিকোয়েস্ট**: 'নিচের ৪টার প্রথম ২টা কার্ড স্ট্রাকচার এখনো ব্রোকেন' — একটি প্রস্তাবিত প্যাচ-আইডিয়াসহ (nested `<a>` ডায়াগনোসিস); সেটি বাস্তবায়ন করে আরও শক্ত করা হয়েছে
- **আসল কারণ**: `leaderCard()` প্রোফাইল-লিংকড সদস্যদের (user_username যাদের) কার্ড **পুরোটা** `<a href="/profile/...">`-তে মোড়াত, অথচ কার্ডের ভেতরের সোশ্যাল রো-তেও `<a>` ছিল (fb/email/profile আইকন)। `<a>`-র ভেতর `<a>` invalid HTML — ব্রাউজার পার্সার বাইরের `<a>` আগেই বন্ধ করে প্রতিটি আক্রান্ত কার্ডকে ৩টি বিচ্ছিন্ন DOM টুকরোতে ফেলত → কার্ডের flex/min-height/এলাইনমেন্ট সব ভেঙে যেত। ডেটায় এমন মাত্র ২ জন — বর্তমান সভাপতি (mahmudul_rahman) ও সা.সম্পাদক (mesbah_uddin_miris) — তাই ঠিক 'নিচের সারির প্রথম ২টা কার্ড' ভাঙা দেখাত, বাকি ৬টি div-কার্ড নিরপরাধ সুন্দরই থাকত
- **ফিক্স (views/lekhok-home.ejs)**: কার্ড এখন **সবসময় `<div class="leader-card has-image leader-card-featured">`** — nested anchor সম্ভবই নেই; প্রোফাইল লিংক থাকে সোশ্যাল রো-এর fa-user আইকনে; পুরো কার্ড ক্লিকযোগ্য রাখতে `data-href="/profile/..."` + `title="প্রোফাইল দেখুন"`; `onclick="event.stopPropagation()"` অবশেষ বাদ; `hasSocial` এখন profileHref-সহ
- **ফিক্স (main.js)**: delegated click হ্যান্ডলার — `.leader-card-featured[data-href]`-এর যেকোনো জায়গায় ক্লিকে প্রোফাইলে যায়, তবে ভেতরের `<a>`-এ ক্লিক (`e.target.closest('a')`) হলে স্বাভাবিক আচরণ
- **ফিক্স (style.css)**: `.leader-card-featured` হার্ডেন — `min-height 680→760px`, `display:flex !important`, `align-items:center !important`, `text-align:center !important`, `overflow:visible !important` (`.leader-card.has-image`-এর `text-align:left; overflow:hidden; padding:0` আর `.linked-member`-এর `display:block` কখনো লিক করতে না পারে); `.leader-body { width:100% }` (align-items:center থাকলেও বক্তব্য পুরো প্রস্থে জাস্টিফাইড); `.leader-card-featured[data-href] { cursor:pointer }`
- **বিভাজন**: ২টি আলাদা `<section>` — সেকশন ১ `#leadership` (প্রতিষ্ঠাতা সভাপতি+সা.সম্পাদক, প্রতিষ্ঠাকালীন উপদেষ্টা) মূল শিরোনাম 'যাঁদের হাতে গড়ে উঠেছে লেখক ফোরাম'-এর নিচে; সেকশন ২ `#current-leadership` (section-alt, বর্তমান সভাপতি+সা.সম্পাদক, বর্তমান উপদেষ্টা) নিজস্ব সেন্টার-হেডিং 'বর্তমান নেতৃত্ব'-সহ — origin-এ 49ebe77 দিয়ে আসা এই দুই-সেকশন কাঠামো রক্ষা করা হয়েছে
- **টেস্ট**: verify-session30.sh 16/16 PASS (৮ div-কার্ড, `<a>`-র্যাপ ০, data-href ২, 'বর্তমান নেতৃত্ব' হেডিং, ২ ম্যাট্রিক্স, stopPropagation অবশেষ ০); Playwright হেডলেস DOM — ৮ কার্ড, উচ্চতা ৮/৮ = ঠিক 760px, img-প্রথম-সন্তান ৮/৮ (কার্ড টুকরো নয়), body-পূর্ণ-প্রস্থ ৮/৮, আইকন নিচে ২/২, ক্লিক-নেভিগেশন → /profile/mahmudul_rahman OK; test-lekhok.sh **77/77 PASS**

### সেশন ২৯ (৬ সেপ্টেম্বর ২০২৬) — হোম নেতৃত্ব সেকশন: ৮ কার্ডের পূর্ণ এলাইনমেন্ট + প্রত্যেকের ৫০-১০০ শব্দের বক্তব্য

- **ইউজার রিকোয়েস্ট**: এলাইনমেন্ট হয়নি অভিযোগ; উপরের ৪ জনের জন্য হেডিং 'যাঁদের হাতে গড়ে উঠেছে লেখক ফোরাম' (সেন্টার); উপরের ও নিচের দলের সাব-হেডিং দুটি মুছে দিতে হবে; প্রতিটি কার্ডে ছবি/নাম/পদ/কার্যবর্ষ/সোশ্যাল আইকন সেন্টারে, বক্তব্য জাস্টিফাইড ও প্রত্যেকের জন্য ৫০-১০০ শব্দ; ৮টি কার্ডই সমান ও নিচের দিকে লম্বা
- **মূল কারণ-অনুসন্ধান**: ৮ পাতার কারোই `members.bio`/`past_leaders.bio` ছিল না (সব `bio_len=0`) → কার্ড ফাঁকা ছিল, এলাইনমেন্ট যাচাইয়ের উপায়ই ছিল না; সাথে `.leader-card.has-image`-এর `text-align:left` + ডাবল প্যাডিং (কার্ড 24px + বডি 22px)
- **বক্তব্যের উৎস**: নতুন `data/leaderStatements.js` — ৮টি স্লট-ভিত্তিক বক্তব্য (founder_president/founder_general_secretary/founding_advisor_1-2/current_president/current_general_secretary/current_advisor_1-2), প্রতিটি ৭২-৭৭ শব্দ, em dash-মুক্ত (সেশন ২৭ নীতি)। ভিউতে প্রাধিকার: অ্যাডমিন-এন্ট্রি `m.bio` আগে, ফাঁকা হলে এই মান; ট্রাংকেট ৫০০→৭০০ অক্ষর। স্লট-কী বেছে নেওয়ায় কোন মানুষ কোন স্লটে গেলেও বক্তব্য বজায় থাকে
- **পদ-সংশোধন (routes/pages.js)**: বর্তমান নেতৃত্বের ২য় পাতা এখন সহ-সভাপতি নয় — role-ভিত্তিক কোয়েরিতে `সভাপতি + সাধারণ সম্পাদক` (CASE দিয়ে সভাপতি আগে), ফলব্যাকে পুরনো sort_order স্লাইস
- **ভিউ (lekhok-home.ejs)**: সেকশন টাইটেল 'লেখক ফোরামের বর্তমান নেতৃত্ব' → 'যাঁদের হাতে গড়ে উঠেছে লেখক ফোরাম' (সেন্টার); ৪টি সাব-হেডিং সম্পূর্ণ বাদ (পদ এখন কার্ডের ভেতরের role লাইনে: 'প্রতিষ্ঠাতা সভাপতি (১ম জন)', 'সাধারণ সম্পাদক (২য় জন)', 'প্রতিষ্ঠাকালীন উপদেষ্টা (১ম/২য় জন)', 'বর্তমান সভাপতি (১ম জন)', 'বর্তমান সাধারণ সম্পাদক (২য় জন)', 'বর্তমান উপদেষ্টা (১ম/২য় জন)'); প্রতিটি কার্ডে নতুন `leader-year` লাইন '(২০২০-২১/২০২৫-২৬ কার্যবর্ষ)'; leaderGroup→leaderPair (title প্যারাম বাদ); সোশ্যাল রো কন্ডিশন প্রসারিত (twitter/linkedin/profile হলেও দেখাবে), aria-label যোগ
- **CSS (style.css)**: `.leader-card-featured { text-align:center }`; body-তে `display:flex; flex-direction:column; flex:1` + `padding:0 !important` (ডাবল প্যাডিং বাদ); `.leader-social { margin-top:auto; padding-top:14px }` → আইকন কার্ডের একদম নিচে; **min-height 380px→700px** — বক্তব্য (৭২-৭৭ শব্দ)-এর সর্বোচ্চ রেন্ডার উচ্চতার চেয়ে বড় হওয়ায় ৮টি কার্ডই ঠিক সমান উচ্চতায়
- **টেস্ট**: রেন্ডার-অ্যাসার্শন ২২/২২ কনটেন্ট-চেক PASS (হেডিং, ৪ সাব-হেডিং বাদ, ৮ role লেবেল, ৮ year লেবেল, ৮ বক্তব্য, ৮ featured কার্ড, GS সংশোধন, তারিন বাদ); বক্তব্য শব্দসংখ্যা ৮/৮ (৫০-১০০); test-lekhok.sh **77/77 PASS**

### সেশন ২৮ (৬ সেপ্টেম্বর ২০২৬) — সদস্য লিস্ট ইনভিজিবল বাগফিক্স + কমিটি পেজ রিডিজাইন (ড্রপডাউন) + লক্ষ্য ৮→৬

- **ইউজার রিকোয়েস্ট**: পরিচিতি পেজের ৮টি 'লক্ষ্য ও উদ্দেশ্য' ৬টিতে আনা; সদস্য পরিচিতি (/members)-তে লিস্ট দেখা যাচ্ছে না; কমিটি পেজে ডুপ্লিকেট 'নেতৃত্ব/পূর্ণাঙ্গ কার্যনির্বাহী কমিটি' হেডিং বাদ; কার্যবর্ষ-চিপ একদম ডানে ড্রপডাউন বক্সে; ইনট্রো সেন্টার এলাইন; পেজের একদম নিচের 'বিস্তারিত' লেখাটি স্থায়ীভাবে বাদ
- **মূল বাগ (/members লিস্ট অদৃশ্য)**: `main.js`-এর reveal IntersectionObserver-এ `threshold: 0.12` — ৫৪ কার্ডের মতো **ভিউপোর্টের চেয়ে লম্বা** সেকশনে (e2e-তে মাপা: ৫৭১৮px) ১২% ভিজিবল কখনোই হয় না → সেকশন চিরকাল `opacity:0`। ফিক্স: `threshold: 0` (যেকোনো পিক্সেল দৃশ্যমান হলেই রিভিল)। শর্ট সেকশনের আচরণ অপরিবর্তিত
- **'বিস্তারিত' রহস্য**: `.modal-overlay`-এর **কোনো CSS-ই ছিল না** → কমিটি+উপদেষ্টা পেজের নিচে লুকানো-হওয়ার কথা থাকা মডাল মার্কআপ সোজা দেখা যাচ্ছিল (h3 'বিস্তারিত' + খালি body)। ফিক্স: style.css-এ সম্পূর্ণ `.modal-overlay` স্যুট (fixed, hidden by default, `.open`→flex, ডার্ক-মোড) + `.modal-member-inner` (গোল অ্যাভাটার, mm-name/role/desig/bio); দুই পেজের মডাল-হেড থেকে `<h3>বিস্তারিত</h3>` মুছে ফেলা হয়েছে (ক্লোজ বাটন র‍্যাপার flex-end)
- **কমিটি পেজ**: ডুপ্লিকেট eyebrow 'নেতৃত্ব' + h2 'পূর্ণাঙ্গ কার্যনির্বাহী কমিটি' বাদ (উপরের page-header-ই যথেষ্ট); `.term-chips` → `.term-bar` (grid 1fr auto): ইনট্রো `text-align:center` + ডানে 'কার্যবর্ষ' লেবেলসহ `<select id="termSelect">` (chevron SVG, focus ring), অপশনে সদস্য-সংখ্যা '(সদস্য ১৭ জন)', onchange → `/committee?year=…`; ≤576px-এ স্ট্যাক+সেন্টার
- **পরিচিতি পেজ**: লক্ষ্য ৮→৬ — পুরনো ৫ নং (চিন্তন-গবেষণা/যুক্তিবাদী সমাজ ≈ ৪ নং-এর বিকাশ) ও ৭ নং (দায়িত্বশীল নাগরিক ≈ ২ নং-এর দেশপ্রেমী নাগরিক) বাদ, পুনঃক্রমাঙ্কন ১-৬ (scripts/goal8to6.py — বাংলা ইউনিকোড Edit-মিসম্যাচ এড়াতে ডিজিট-মার্কার অ্যাংকর); কমেন্টে ৩টি অদৃশ্য em dash-ও পরিষ্কার
- **DB-স্তরের em dash**: ডেমো মডারেটর বায়ো 'ডেমো মডারেটর অ্যাকাউন্ট — মডারেটর…' লোকাল lekhok.db-তে REPLACE(char(8212), ', ') (sql.js স্ক্রিপ্ট, ব্যাকআপসহ); **প্রোডাকশন Turso-তে একই বায়ো এডিট ইউজারের হাতে** — tanvir লগইন → সেটিংস → প্রোফাইল → বায়ো সম্পাদনা
- **স্ক্রিপ্ট-শিক্ষা**: মাল্টি-রিজিয়ন লাইন-এডিট স্ক্রিপ্টে বটম-আপ ইনডেক্স অ্যাপ্লাই করলেও প্রতিটি রিপ্লেসমেন্টের দৈর্ঘ্য-পরিবর্তন বাকিগুলোর ইনডেক্স সরিয়ে দেয় (committee-rework.py প্রথম রানে `<script>` ট্যাগ মুছে ফেলেছিল) → টার্গেটেড ফলো-আপ ফিক্সে সঠিক অবস্থায় আনা হয়েছে
- **টেস্ট**: session28-e2e.js — 14/14 PASS (members গ্রিড `.in`+opacity 1+৫৩ কার্ড; ড্রপডাউন ৫ অপশন+নেভিগেশন; ইনট্রো center; ডানে বসা; মডাল hidden/স্টাইলড; em dash ০); test-lekhok.sh **77/77 PASS**

### সেশন ২৭ (৫ সেপ্টেম্বর ২০২৬) — পত্রিকা কাটিং ব্যবস্থা + পরিচিতি পেজ পলিশ + সাইটজুড়ে em dash অপসারণ

- **ইউজার রিকোয়েস্ট**: পরিচিতি পেজের "পত্রিকায় পাতায় লেখক ফোরাম" অংশে পত্রিকার নিউজ-ছবি (৪টি) + "আরও দেখুন" → আলাদা পেজ; ওই কার্ডের 'সদস্য হোন' বাটন বাদ; কলম সৈনিক CTA-তে পূর্ণ নতুন প্যারাগ্রাফ + 'নিবন্ধন করুন' ও 'যোগাযোগ করুন' বাটন; আমাদের পরিচয় প্যারাগ্রাফ justified + দুই প্যানেল সমান প্রস্থ; লক্ষ্য ৩ নং পয়েন্ট ছোট; **পুরো সাইটের দৃশ্যমান টেক্সটে em dash (—) নীতিগতভাবে বাদ**
- **পত্রিকা কাটিং ব্যবস্থা (নতুন)**: `press_clippings` টেবিল (title, paper_name, image_url, published_date, sort_order, is_active); মডারেটর CRUD `/moderator/press` — ছবি আপলোড (auto-WebP, 8MB, IMAGE_TYPES) অথবা URL, লুকানো/দৃশ্যমান টগল, ইনলাইন-এডিট `<details>` প্যাটার্ন (কমিটি ব্যবস্থাপনার মতই); মডারেটর ড্যাশবোর্ডে তৃতীয় টাইল; পাবলিক `/press` পেজ (lekhok-press.ejs, 4:3 কার্ড গ্রিড + empty state) + `/about`-এ প্রথম ৪টি কার্ড + "সব কাটিং দেখুন" লিংক
- **ন্যাভিগেশন**: DEFAULT_NAV-এ পরিচিতি সাবমেনুতে 'পত্রিকায় আমাদের নিউজ' → /press; **db.js বুট-মাইগ্রেশন** — কাস্টমাইজড nav_json-এও idempotent যোগ (press থাকলে স্কিপ, /about#magazine-এর পরে বসে); sitemap.xml-এ /press যোগ (৪৫ URL)
- **পরিচিতি পেজ**: section-split `grid-template-columns:1fr 1fr` ইনলাইন (সমান প্যানেল — পরীক্ষিত 568px=568px); পরিচয় প্যারাগ্রাফ `text-align:justify`; লক্ষ্য ৩ ছোট ("সামাজিক, আর্থ-সামাজিক ও বৈশ্বিক সমস্যার গঠনমূলক সমালোচনা..."); কলম সৈনিক CTA — বাটনগুলো `margin-top:26px` র‍্যাপারে
- **em dash অপসারণ (৬৫+ ফাইল)**: scripts/fix-emdash.py — প্রাসঙ্গিক প্রতিস্থাপন: বাক্য-বিরতি '।', তালিকা ',', বন্ধনী '()', কার্যকাল 'থেকে', টাইটেল-বিভাজক '|'; placeholder '—' → 'উল্লেখ নেই'; Playwright যাচাই: পাবলিক পেজে দৃশ্যমান em dash **০**
- **টেস্ট ট্র্যাপ**: db.prepare().all() নেটিভ Promise নয় (.catch নেই) → try/catch; sql.js মেমোরি-DB সরাসরি ফাইল-এডিট দেখে না ও ফ্লাশে ওভাররাইট করে → সিড/যাচাই অবশ্যই সার্ভার API দিয়ে; অ্যাডমিন `/admin/login` প্যানেল-লগইন, কিন্তু moderator প্যানেলের জন্য site-login (/login) দরকার (tanvir = moderator role)
- **টেস্ট**: press CRUD e2e — আপলোড তৈরি (auto-WebP 1400x1000 jpeg→webp), URL তৈরি, /about+ /press-এ প্রদর্শন, আপডেট, ডিলিট, গেস্ট-গার্ড 302; Playwright — ৪ কার্ড, বাটন, সমান গ্রিড, em dash ০, JS error ০; test-lekhok.sh **77/77 PASS**; ডেমো-ডেটা পরিষ্কার করে ডিপ্লয় (ইউজার নিজের আসল কাটিং প্যানেল থেকে যোগ করবেন)

### সেশন ২৬ (৫ সেপ্টেম্বর ২০২৬) — অটো WebP কনভার্সন + Resend API key যাচাই

- **ইউজার রিকোয়েস্ট**: GSC sitemap সফল (৪৪ পেজ আবিষ্কৃত) নিশ্চিত করেছেন; Resend API key দিয়েছেন; "ছবি অনেক হলে প্রতিটা ম্যানুয়ালি করা ঝামেলা" — সার্ভারে অটো-WebP কনভার্সন চেয়েছেন; কাস্টম ডোমেইন ছাড়া ইমেইল পাঠানোর বিষয়ে প্রশ্ন ("আমার এই vercel.app ডোমেইনে হবে না?")
- **অটো WebP অপটিমাইজেশন (মূল কাজ)**: `middleware/upload.js`-এ `optimizeToWebp()` — image/jpeg + image/png আপলোড স্বয়ংক্রিয়ভাবে WebP-এ রূপান্তর; sharp v0.35.4 dependency; `.rotate()` (EXIF orientation — ফোনের ছবি), `resize(2000px inside, withoutEnlargement)` (বিশাল স্ক্যান ক্যাপ, ছোট ছবি বড় হয় না), `quality 82`; **শুধু ছোট হলে সোয়াপ** (আগে থেকেই ছোট ফাইল অক্ষত থাকে); যেকোনো sharp ব্যর্থতায় মূল ফাইল সংরক্ষিত — অপটিমাইজারের কারণে আপলোড কখনো ব্যর্থ হয় না; GIF/SVG/WebP অপরিবর্তিত; দুই স্টোরেজ মোডেই (Blob + disk) এক কলে কাজ করে কারণ উভয়েই req.file.buffer খায়; ফাইলনেম এক্সটেনশন .webp হয়
- **পরিমাপ যাচাই (e2e)**: 1600x1000 JPEG 9,719 → **2,944 bytes (−70%)**; 600x400 PNG 6,062 → **510 bytes (−92%)**; `file` দিয়ে নিশ্চিত RIFF WebP VP8, ডাইমেনশন অক্ষত; ট্র্যাপ ধরা পড়েছে — পুরনো সার্ভার (পুরনো কোড) ৮০৮০-তে চলছিল, EADDRINUSE-এ নতুনটা চুপচাপ মারা যাচ্ছিল; kill + restart করে সঠিক যাচাই
- **Resend key যাচাই**: ইউজারের key (re_dFiHf…LRMj) read-only `GET /domains` কলে 200 OK — **ভ্যালিড**, `data: []` = কোনো ভেরিফাইড ডোমেইন নেই → এখন টেস্ট মোড (শুধু নিজের ইমেইলে পাঠানো যাবে, sender: onboarding@resend.dev); key Vercel-এ বসানোর দায়িত্ব ইউজারের (আমাদের Vercel অ্যাক্সেস নেই): Settings → Environment Variables → RESEND_API_KEY → Redeploy
- **কাস্টম ডোমেইন ব্যাখ্যা (ইউজারকে দেওয়া)**: ওয়েবসাইট vercel.app-এই চলবে — ইমেইলের সমস্যা আলাদা; প্রেরক ডোমেইনের মালিকানা DNS (SPF/DKIM) দিয়ে প্রমাণ করতে হয়, vercel.app-এর DNS ইউজারের নিয়ন্ত্রণে নেই; তাই সব সাবস্ক্রাইবারকে পাঠাতে নিজের ডোমেইন (~$১০/বছর) কিনে Resend-এ ভেরিফাই করতে হবে
- **টেস্ট**: test-lekhok.sh **77/77 PASS**; sharp ইনস্টল নিশ্চিত; JPEG+PNG উভয় আপলোড পাথ যাচাই

### সেশন ২৫ (৫ সেপ্টেম্বর ২০২৬) — Google Search Console ভেরিফিকেশন + কমিটি সদস্য ব্যবস্থাপনা CRUD

- **ইউজার রিকোয়েস্ট**: GSC ভেরিফিকেশনের জন্য meta tag কোড ও HTML verification file দিয়েছেন ("আর উপরে 'HTML file' ও দিয়েছি। তার পর?"); সাথে সেশন ২৪ ব্যাচের বাকি কাজ শেষ করতে — অ্যাডমিন+মডারেটর যেন ব্যাকএন্ড থেকে কমিটির সদস্য, পদ ও কার্যবর্ষের তথ্য নিজেরাই আপডেট করতে পারেন
- **GSC ভেরিফিকেশন**: ইউজারের দেওয়া `google90c26dd9b34a6fc6.html` ফাইল `public/` রুটে (express.static থেকে সার্ভ); `<meta name="google-site-verification" content="MwDt57-lqUDC5XAeiiYy0BH11xb5mPRzcyp7A4aibCg" />` — `layout.ejs` ও `partials/header.ejs` উভয় head-এ; লাইভ যাচাই: ফাইল HTTP 200 + হোমপেজসহ সব পেজে মেটা ট্যাগ; sitemap ডায়াগনোসিস — HTTP 200, `application/xml; charset=utf-8`, valid XML, ৪৪ URL, ০.৬৫s — GSC-র "Couldn't fetch" সাময়িক অবস্থা, ২৪–৪৮ ঘণ্টায় স্বয়ংক্রিয় সমাধান হওয়ার কথা
- **কমিটি সদস্য ব্যবস্থাপনা (নতুন স্ক্রিন)**: `/moderator/members` (ensureModerator — অ্যাডমিন+মডারেটর দুজনেই, আলাদা স্কোপ লাগে না) — members টেবিলের পূর্ণ CRUD: নাম, পদ (রোল), শ্রেণি/বিভাগ, **কার্যবর্ষ (term_year)**, ধরন (কার্যনির্বাহী কমিটি | উপদেষ্টা পর্ষদ), ছবি URL, ফেসবুক, ইমেইল, সংক্ষিপ্ত পরিচিতি, প্রদর্শন ক্রম, ঐচ্ছিক ইউজারনেম → user_id লিংক; তালিকা দুই গ্রুপে (central ৬৮ + advisory ১০) `<details>` ইনলাইন-এডিট ফর্ম + confirm-সহ ডিলিট; `idx_members_unique_name_term` (name+term_year+member_type) UNIQUE ভায়োলেশনে 500 নয় — বন্ধুত্বপূর্ণ বাংলা error রিডাইরেক্ট; মডারেটর ড্যাশবোর্ডে 'মেনু ব্যবস্থাপনা'-র পাশে 'কমিটি সদস্য ব্যবস্থাপনা' টাইল — এখন থেকে কমিটি না বদলালেও নতুন কমিটি গঠন/উপদেষ্টা সেট/কার্যবর্ষ বাড়ানো সব প্যানেল থেকেই সম্ভব
- **টেস্ট**: CRUD e2e — create → update (ধরন central→advisory, পদ বদল) → পাবলিক /committee/advisory-তে সাথে সাথে দেখা → delete → সব পেজ থেকে অদৃশ্য; duplicate নাম+কার্যবর্ষ → error redirect; গেস্ট অ্যাকসেস → 307 লগইনে; Playwright — পেজ 200, হিরো টাইটেল, ৭৮ সদস্য রো, এডিট ফর্ম খোলে, ড্যাশবোর্ড টাইল ভিজিবল, JS এরর ০; test-lekhok.sh **77/77 PASS**; Vercel লাইভ যাচাই (ভেরিফিকেশন ফাইল + মেটা + /moderator/members গেস্ট-গার্ড + /committee কার্যবর্ষ)

### সেশন ২৪ (৫ সেপ্টেম্বর ২০২৬) — পাবলিক সদস্য/উপদেষ্টা পেজ + মেনু ব্যবস্থাপনা + UI পলিশ

- **ইউজার রিকোয়েস্ট**: সদস্যরা সোশ্যাল ফিডে নয়, হোম পেজে আলাদা পেজ চাই; সাব-মেনুতে 'রানিং কমিটি' নয় 'কার্যনির্বাহী কমিটি'; প্রতিটি প্রোফাইলে কার্যবর্ষ; অ্যাডমিন+মডারেটর নিজেরা মেনু/সাব-মেনু এডিট করতে পারবেন; ফোন মাস্কিং; 'বিশ্ববিদ্যালয় সম্পর্কিত তথ্য'; কন্টাক্ট আইটেম কমপ্যাক্ট + 'কার্যালয়'; নিউজলেটার স্পিড + সাদা success মেসেজ
- **পাবলিক পেজ বিভাজন**: `/committee` — h1 'কার্যনির্বাহী কমিটি' (আগে 'সংগঠন কমিটি'), উপদেষ্টা সেকশন বাদ (এখন আলাদা পেজে); **নতুন** `/committee/advisory` পাবলিক পেজ (lekhok-advisory.ejs — নাম-ভিত্তিক মার্জ, একাধিক কার্যবর্ষ এক কার্ডে চিপে); **নতুন পাবলিক** `/members` (lekhok-members.ejs — সোশ্যাল ফিড লেআউট থেকে হোম-সাইট লেআউটে, সার্চ+রোল+বিভাগ ফিল্টার অক্ষত, ৫৩ কার্ড + ৬৮ কার্যবর্ষ চিপ); তিন পেজেই কার্ড → /profile/:username
- **কার্যবর্ষ**: members টেবিলের term_year থেকে প্রতি কার্ডে চিপ; প্রোফাইল পেজের 'সংগঠনে দায়িত্ব' চিপস আগেই ছিল (সেশন ১৯); উপদেষ্টাদের DB-তে term_year NULL — অ্যাডমিন প্যানেল থেকে সেট করলেই চিপ দেখাবে
- **মেনু ব্যবস্থাপনা (নতুন সিস্টেম)**: `helpers/nav.js` — DEFAULT_NAV + parseNav/sanitizeNav/validateNavJson/navItemActive; settings কী `nav_json`; server.js মিডলওয়্যারে res.locals.navConfig; layout.ejs টপবার+মোবাইল সাইডবার ও header.ejs গেস্ট নেভ এখন কনফিগ-ড্রিভেন; **admin/navigation + moderator/navigation** (requireStaff/ensureModerator — দুজনেই এডিট করতে পারেন) — JS এডিটর (nav-editor.js): লেবেল/লিংক/আইকন + সাব-মেনু যোগ/মুছুন + 'ডিফল্ট মেনুতে ফেরান'; admin sidebar 'সিস্টেম' গ্রুপে লিংক, moderator dashboard-এ টাইল
- **ফোন মাস্কিং**: সব পাবলিক জায়গায় '০১৭৯১১৮৭১৬৪ (বিকাশ/নগদ - পার্সোনাল)' → '০১********* (বিকাশ/নগদ)' — footer.ejs, layout.ejs, lekhok-about (পেমেন্ট), lekhok-contact (contact-list + মোবাইল কার্ড; tel: লিংকও সরানো — নম্বর আর সাইটে উন্মুক্ত নয়)
- **কন্টাক্ট পেজ**: 'কেন্দ্রীয় কার্যালয়' → 'কার্যালয়', 'ফোন' → 'মোবাইল'; .contact-list li padding 14→8px, gap 14→11/16→12, icon 42→36 — আইটেমগুলো কমপ্যাক্ট; 'বিশ্ববিদ্যালয় সম্পদ' → 'বিশ্ববিদ্যালয় সম্পর্কিত তথ্য' (contact + resources দুটিতেই)
- **নিউজলেটার স্পিড**: subscribe রুট ২-৩ কুয়েরি → **এক কুয়েরি** (INSERT … ON CONFLICT(email) DO UPDATE … WHERE is_active=0 — changes দিয়ে new/duplicate আলাদা); db.js getSettingsAll-এ ১০ সেকেন্ড TTL ক্যাশ + setSetting-এ ইনভ্যালিডেশন (প্রতি রিকোয়েস্টে একটি Turso round-trip বাঁচে — পুরো সাইট দ্রুত); .f-newsletter-msg.ok এখন **সাদা** + font-weight 600 (ডার্ক ফুটারে স্পষ্ট)
- **টেস্ট**: সব পেজ 200; nav POST/reset e2e (admin+moderator দুজনেই, কাস্টম লেবেল সাইটে দেখা যায়, reset ডিফল্টে ফেরায়); newsletter new/duplicate/invalid বার্তা ঠিক; Playwright — nav ট্যাব কনফিগ থেকে, committee h1, advisory ১০ কার্ড, members ৫৩ কার্ড+৬৮ চিপ, nav editor ৭ আইটেম, JS এরর ০; test-lekhok.sh **77/77 PASS**

### সেশন ২৩ (৫ সেপ্টেম্বর ২০২৬) — পূর্ণ SEO ব্যবস্থা: OG/Twitter মেটা + JSON-LD + sitemap.xml + robots.txt + lazy-loading

- **ইউজার রিকোয়েস্ট**: "চালিয়ে যাও" — Task E (অ্যাডমিন প্যানেল) লাইভ-যাচাইয়ের পর বাকি থাকা SEO ব্লক (per-article meta/OG/Twitter Card, XML sitemap + robots.txt, schema.org Article, lazy-loading) সম্পন্ন করা
- **per-page SEO মেটা**: `layout.ejs` + `partials/header.ejs`-এর head-ে গার্ডেড SEO ব্লক — description, canonical, OG (site_name/type/title/description/url/locale bn_BD), Twitter Card (ছবি থাকলে summary_large_image), `article:published_time`/`article:author`; সব ভ্যার `typeof`-গার্ডেড তাই কোনো পেজ ভাঙে না; `siteUrl` সার্ভার মিডলওয়্যারে (SITE_URL env অগ্রাধিকার, নইলে req host); `canonicalPath` ওভাররাইড (লিস্ট-অ্যাকটিভ ট্যাব রেখে per-content canonical)
- **আর্টিকেল পেজ**: OG type=article + excerpt/বডি থেকে ১৯৭-অক্ষর metaDesc + cover_image অ্যাবসোলিউট og:image + schema.org **Article JSON-LD** (headline/description/image/author Person/profile-url/datePublished/publisher/mainEntityOfPage — `<` গুলো \u003c-এস্কেপড); বিজ্ঞপ্তি ডিটেইলেও metaDesc + article OG
- **noindex হাইজিন**: dashboard/messages/me/settings/notifications/bookmarks/complaints/quiz — প্রাইভেট অ্যাপ পেজে `noindex, nofollow`
- **sitemap.xml (ডাইনামিক)**: নতুন `routes/seo.js` — ১৭ স্ট্যাটিক পাবলিক পেজ + সব published লেখা/প্রশ্ন (২০০০ পর্যন্ত) + বিজ্ঞপ্তি ডিটেইল, lastmod=created_at; প্রতিটি ডাইনামিক সেকশন try/catch — টেবিল/কলাম না থাকলেও sitemap কখনো 500 দেয় না; robots.txt — /admin, /api/, /dashboard, /messages ইত্যাদি Disallow + Sitemap রেফ
- **lazy-loading**: ২৬ ভিউ ফাইলে ৮০টি `<img>`-তে `loading="lazy" decoding="async"` (নেভি-হেডার পার্শিয়াল ও আর্টিকেল কভার LCP বাদ); Playwright যাচাই — home 6/6 lazy, feed 38 img (36 lazy), broken ০, JS এরর ০
- **টেস্ট**: sitemap ৭২ URL, robots.txt OK, আর্টিকেল canonical=`/articles/<id>` + JSON-LD পার্স-যাচাই OK, dashboard noindex OK, test-lekhok.sh **77/77 PASS**; WebP কনভার্সন এই সেশনে বাদ (sharp নেটিভ ডিপেন্ডেন্সি — ভবিষ্যৎ ঐচ্ছিক)

### সেশন ২২ (৫ সেপ্টেম্বর ২০২৬) — অ্যাডমিন প্যানেল UI/UX সমৃদ্ধকরণ + ডেটা পার্সিস্টেন্স নিশ্চিতকরণ
- **ইউজার রিকোয়েস্ট**: অ্যাডমিন প্যানেলের সব রুট (ড্যাশবোর্ড, বিজ্ঞপ্তি/ইভেন্ট/সদস্য/গ্যালারি/রিসোর্স/ডেইলি CRUD, ইউজার+মডারেটর+স্কোপ, প্রাইভেট অভিযোগ প্যানেল, সাইট সেটিংস, লগআউট) যাচাই + সবার সকল ইনপুট/ডাটা/মেসেজ/ছবি/প্রোফাইল ডিটেইলস স্থায়ীভাবে সেভ থাকবে যেন ইউজার ফিরে এসে সেভাবেই পায় + UI/UX আরও সমৃদ্ধ
- **অডিট ফল**: সব রুট ও ফিচার আগেই ছিল ✅; সব ডেটা DB-ব্যাকড (users/posts/comments/messages/complaints/settings/newsletter — কোনো ইন-মেমোরি স্টোর নেই); ফর্ম ভ্যালিডেশন-এররেও টাইপ করা মান সংরক্ষিত হয় (`member: req.body` প্যাটার্ন); ছবি আপলোড ডুয়াল-মোড (লোকাল ডিস্ক / Vercel Blob)
- **admin.css v5 রিডিজাইন**: CSS ভ্যারিয়েবল-ভিত্তিক ডিজাইন সিস্টেম (নেভি #0a1f44 + সোনালি #e8b64c + এমারাল্ড #059669), গ্রেডিয়েন্ট সাইডবার + গ্রুপড নেভ (মূল/সংগঠন/কনটেন্ট/কমিউনিটি/সিস্টেম) + নিচে ইউজার কার্ড (অ্যাভাটার+রোল+লগআউট), রঙিন স্ট্যাট-কার্ড ভ্যারিয়েন্ট, মডার্ন টেবিল (sticky নেভি হেডার, জেব্রা, হোভার), ফোকাস-রিং ফর্ম, টোস্ট, মোবাইল ড্রয়ার (হ্যামবার্গার+ব্যাকড্রপ) — `--radius-sm` ভ্যার আগে undefined ছিল, এখন ডিফাইন্ড
- **ড্যাশবোর্ড সমৃদ্ধ**: ওয়েলকাম ব্যানার (নাম+বাংলা তারিখ) + ৯ স্ট্যাট কার্ড (আগে ৬টি দেখাত, users/posts/daily/complaints কাউন্ট হতেও না) + সাম্প্রতিক কনটেন্ট প্যানেল (বিজ্ঞপ্তি/ইভেন্ট/প্রকাশিত লেখা) + সাম্প্রতিক বার্তা/অভিযোগ/নতুন সদস্য প্যানেল + দ্রুত কার্যক্রম; রুটে fail-safe recent কুয়েরি
- **ফ্ল্যাশ টোস্ট**: ৪৮টি CRUD রিডাইরেক্টে `?saved=1` → সাইডবার স্ক্রিপ্ট সফলতার টোস্ট দেখিয়ে URL পরিষ্কার করে (history.replaceState); `?error=`-তে লাল টোস্ট
- **ফর্ম ড্রাফট অটোসেভ**: সব অ্যাডমিন ফর্মে টাইপ করা সব ফিল্ড localStorage-এ অটো-সেভ (৩৫০ms ডিবাউন্স) — সেভ না করে চলে গেলেও ফিরে এসে হুবহু সেভাবেই পাওয়া যায়, সফল সাবমিটে মুছে যায়; DOMContentLoaded না দিলে সাইডবার-স্ক্রিপ্ট ফর্ম পেত না (বাগ ফিক্স)
- **লগইন পেজ পলিশ**: গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড, সোনালি এমব্লেম, আইকন-ইনপুট, এরর শেক অ্যানিমেশন, ফুটার ক্রেডিট + মূল সাইটে ফেরার লিংক
- **ক্যাশ-বাস্টিং**: সব অ্যাডমিন ভিউতে `admin.css?v=<%= AV %>` (আগে ভার্সনহীন — আপডেটের পর পুরোনো CSS থেকে যেত)
- **টেস্ট**: ৭৭/৭৭ পাস; Playwright যাচাই — ড্যাশবোর্ড/লিস্ট/ফর্ম-ড্রাফট-রিস্টোর/টোস্ট/মোবাইল-ড্রয়ার স্ক্রিনশটসহ; CRUD ফ্লো (তৈরি→টোস্ট→মুছে ফেলা) লাইভ টেস্টেড

### সেশন ২১ (৫ সেপ্টেম্বর ২০২৬) — ফুটার ৪-কলাম + নিউজলেটার সাবস্ক্রিপশন ও অটো ইমেইল নোটিফিকেশন
- **ইউজার রিকোয়েস্ট**: ফুটার এখন ৩ কলাম — বর্তমান ডিজাইনের সাথে সমন্বয় করে ৪ কলামে রূপান্তর (রেফারেন্স হিসেবে ৪-কলাম + নিউজলেটার HTML স্যাম্পল দেওয়া); সাবস্ক্রিপশনের ডিটেইল এডমিন+মডারেটরদের কাছে যাবে; এডমিন/মডারেটর পোস্ট করলে সাবস্ক্রাইবারদের ইমেইলে **অটোমেটিক** নোটিফিকেশন
- **ফুটার ৪-কলাম** (`views/layout.ejs` + `views/partials/footer.ejs` + `style.css`): ব্র্যান্ড+সোশ্যাল / প্রয়োজনীয় লিংক / যোগাযোগ / **নিউজলেটার** (ইনপুট + সাবস্ক্রাইব বাটন, অ্যাকসেন্ট-গ্রিন, সাইটের বিদ্যমান ফুটার সিস্টেমেই) — দুই ফুটারেই একই কাঠামো; রেসপনসিভ: ≤992px ২-কলাম (ব্র্যান্ড ফুল-উইডth), ≤600px ১-কলাম (specificity ফিক্সসহ)
- **DB** (`db.js` initDb): `newsletter_subscribers` (email UNIQUE, is_active, source), `newsletter_queue` (প্রতি প্রাপকের রেকর্ড, status pending/sent/failed), `newsletter_log` (পোস্টপ্রতি ব্যাচ রেকর্ড) — তিনটিই CREATE IF NOT EXISTS, পুরোনো Turso/sql.js ডেটাবেজে অটো-তৈরি হয়
- **সাবস্ক্রাইব API**: `POST /api/newsletter/subscribe` (ভ্যালিডেশন, ডুপ্লিকেট-বান্ধব বার্তা, আনসাবস্ক্রাইব-পরবর্তী রি-সাবস্ক্রাইব), `GET /newsletter/unsubscribe` (ইমেইলের ফুটারের লিংক — ইমেইল জিজ্ঞেস করে, প্রাইভেসি-সেফ), ফুটার ফর্ম AJAX (`main.js`) + নেটওয়ার্ক-ব্যর্থতায় ক্লাসিক ফর্ম-পোস্ট ফলব্যাক
- **অটো নোটিফিকেশন** (`helpers/mailer.js` নতুন): স্টাফ পোস্ট হুক — (১) `POST /articles/new` যখন লেখক role admin/moderator (সাধারণ সদস্যের লেখায় ট্রিগার হয় না), (২) admin `POST /admin/notices`, (৩) moderator `POST /moderator/notices`; পাইপলাইন: log রো → প্রতি সাবস্ক্রাইবারে queue রো → `RESEND_API_KEY` থাকলে **Resend batch API-তে এক কলেই** ডেলিভারি (১০০/চাংক, সম্পূর্ণ awaited — serverless-এ কাটা পড়ে না) → স্ট্যাটাস আপডেট; কী না থাকলে queue 'pending'-এ জমায় (হারায় না), প্যানেল থেকে রিট্রাই
- **বাংলা ইমেইল টেমপ্লেট**: ইনলাইন-স্টাইলড HTML — ব্র্যান্ড হেডার, ধরন-বার্তা (✍️ নতুন লেখা / 📢 নতুন বিজ্ঞপ্তি), শিরোনাম+লেখক+উদ্ধৃতি, "সম্পূর্ণ পড়ুন" বাটন, আনসাবস্ক্রাইব লিংক, মূলমন্ত্র-ফুটার
- **অ্যাডমিন প্যানেল** (`/admin/subscribers`, requireStaff — এডমিন+মডারেটর দেখতে পাবেন, অ্যাকশন শুধু এডমিন): stat কার্ড (মোট/সক্রিয়/পাঠানো/কিউ), মেইল-সার্ভিস স্ট্যাটাস ব্যানার, সাবস্ক্রাইবার টেবিল (toggle/delete), নোটিফিকেশন রেকর্ড টেবিল (প্রাপক-সংখ্যা, পাঠানো/ব্যর্থ, **আবার পাঠান** রিট্রাই), **CSV এক্সপোর্ট** (UTF-8 BOM); সাইডবারে "নিউজলেটার" লিংক
- **কনফিগ** (Vercel Env Vars, ঐচ্ছিক): `RESEND_API_KEY` (resend.com ফ্রি টিয়ার), `NEWSLETTER_FROM`, `SITE_URL` — কী ছাড়া সিস্টেম কিউ-মোডে চলে, প্যানেল সেটা স্পষ্ট জানায়
- **টেস্ট**: subscribe/duplicate/invalid/re-unsubscribe API, আনসাবস্ক্রাইব পেজ, মডারেটর-আর্টিকেল হুক e2e (queued=1, লগ+প্যানেল রেকর্ড), সাধারণ-সদস্য লেখায় নো-ট্রিগার, admin notice হুক e2e, 77/77 রিগ্রেশন, Playwright — ডেস্কটপ ৪-কলাম, মোবাইল ১-কলাম, সাবস্ক্রাইব মেসেজ, অ্যাডমিন পেজ স্ক্রিনশট, JS এরর-শূন্য

### সেশন ২০ (৫ সেপ্টেম্বর ২০২৬) — কমিটি হিস্ট্রি: ২০২১-২২ → ২০২৪-২৫, প্রত্যেকের ইউজার অ্যাকাউন্ট, ক্লিকেবল প্রোফাইল
- **ইউজার রিকোয়েস্ট**: কমিটি পেইজে আগের সব কমিটি (একদম ১৯-২০ থেকে প্রতি কার্যবর্ষ), সর্বশেষ কমিটি বাই-ডিফল্ট দৃশ্যমান, ফিল্টারে অন্য কার্যবর্ষ; **প্রত্যেক সদস্যের একটি ইউজার আইডি**; ক্লিক করলে সোশ্যাল-ফিডসহ সম্পূর্ণ প্রোফাইল; সবকিছু ক্লিকেবল — "এখানে ক্লিক করুন"-জাতীয় লেখা নিষিদ্ধ
- **ডেটা-মাইগ্রেশন** (`db.js` → `runMigrations()`, `committee_history_seeded` ফ্ল্যাগে idempotent): দুটি অফিসিয়াল পিডিএফ-নোটিশের (০৬/০৯/২০২৩ ও ২৩/০১/২৫ তারিখ) ৪x-৬x ক্রপ-যাচাইকৃত নামভিত্তিক —
  - **২০২৪-২৫ (১৭ জন)**: মাহমূদুল রহমান-সভাপতি, মিহাবল্ল জায়াত তারিন-সহ-সভাপতি, মেসবাহ উদ্দিন মিরিস-সা.সম্পাদক, সায়াওয়াত হোসাইন রিকাত-যুগ্ম, আজিজুল হক রাহি-সাংগঠনিক, হৃদি সরকার-সহ-সাংগঠনিক, সুমন চৌধুরী-অর্থ, কারিশমা ইরিন এ্যামি-দপ্তর, ইসমাইল হোসেন ইমন-উপ-দপ্তর, মুহাম্মাদ রিয়াদ উদ্দিন-সাহিত্য-প্রকাশনা, মোজফ্ফা কামাল-প্রচার, মো. রাকিব হোসেন-প্রশিক্ষণ, মো. জাহিদুল হক-আইসিটি, এনামুল হক + মোলেম শাহরিয়ার শাওন-সম্পাদকীয় পর্ষদ, জায়াতুল ফেরদাউস ইকরা + সাধী রানী-কার্যনির্বাহী
  - **২০২২-২৩ (১৫ জন)**: মো. ইউছাফুল ইসলাম সিকাত-সভাপতি … মারজান হোসেন + হাসনা বেগম-সম্পাদকীয় পর্ষদ
  - **প্রত্যেকের ইউজার অ্যাকাউন্ট**: exact full_name মিললে বিদ্যমান অ্যাকাউন্টে লিংক (যেমন কারিশমা → `karishma`), নাহলে slug-ইউজারনেমে নতুন অ্যাকাউন্ট (র‍্যান্ডম পাসওয়ার্ড — admin password-reset দিয়ে হস্তান্তর); ৫ জন বহু-কার্যবর্ষী সদস্য (মাহমূদুল রহমান, মিহাবল্ল, মেসবাহ, আজিজুল হক রাহি, হৃদি) একটাই অ্যাকাউন্ট শেয়ার করে, designation-এ সর্বশেষ কার্যবর্ষের পদ
- **/committee রাউট**: canonical কার্যবর্ষ ২০১৯-২০ → ২০২৪-২৫ (+admin যোগ করলে যেকোনো নতুন বর্ষ অটো-চিপে), বাংলা-ডিজিট সর্ট, ডিফল্ট = ডেটা-আছে এমন সর্বশেষ কার্যবর্ষ, প্রতি চিপে সদস্যসংখ্যা
- **/committee ভিউ**: সিলেক্ট-ড্রপডাউনের বদলে পিল-চিপ ফিল্টার, কার্ডে কার্যবর্ষ-ট্যাগ, hover-এ arrow-badge + image-zoom — **সব "প্রোফাইল দেখুন"/"বিস্তারিত দেখুন" টেক্সট বাদ**; খালি কার্যবর্ষে মার্জিত empty-state (admin CTA ছাড়া)
- **প্রোফাইল পেইজ**: নতুন **"সংগঠনে দায়িত্ব"** সেকশন — user_id দিয়ে members জয়েন করে পদ + কার্যবর্ষ চিপ (নতুন থেকে পুরোনো ক্রমে)
- **অ্যাডমিন**: members ফর্ম/CRUD/লিস্টে **কার্যবর্ষ (term_year)** ফিল্ড + datalist (বাকি বর্ষের তথ্য এখন admin নিজেই যোগ করতে পারবেন); লিস্ট কার্যবর্ষ-DESC সর্টে; users/edit-এ **পাসওয়ার্ড রিসেট** কার্ড (`POST /admin/users/:id/password`)
- **টেস্ট**: মাইগ্রেশন ভেরিফাইড (৯+১৫+১৭ = ৪১ সদস্য, ০ unlinked, idempotent re-run), member CRUD+term_year e2e, password-reset → সদস্য-লগইন e2e, 77/77 রিগ্রেশন (guest /dashboard এখন visitor-mode 200 — a2eed20 অনুযায়ী টেস্ট আপডেট), Playwright desktop/mobile/filter/empty/profile স্ক্রিনশট

### সেশন ১৯ (৫ সেপ্টেম্বর ২০২৬) — গ্লোবাল রি-ব্র্যান্ড: বাস্তব পরিচিতি + ২০২১-২২ কমিটি
- **ইউজার রিকোয়েস্ট**: সংগঠনের সঠিক পরিচিতি (নাম, মূলমন্ত্র, স্লোগান, লক্ষ্য-উদ্দেশ্য, কার্যাক্রম, সদস্য শর্তাবলি) গ্লোবালি আপডেট + কমিটিতে ২০২১-২২ কার্যবর্ষের নবনির্বাচিত নেতৃবৃন্দ যুক্ত করা
- **ডেটা-মাইগ্রেশন** (`db.js` → `runMigrations()` শেষে, প্রতি বুটে idempotent):
  - `settings`: পুরনো ডেমো ডিফল্ট থাকলেই বদলায় — `site_name` → "বাংলাদেশ তরুণ কলাম লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়", `tagline` → "সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়।", `contact_phone` → ০১৭৯১১৮৭১৬৪ (বিকাশ/নগদ - পার্সোনাল), `contact_address` → চট্টগ্রাম বিশ্ববিদ্যালয়, চট্টগ্রাম; নতুন `motto` কী → "তারুণ্যের শাণিত কলমে আলোকিত ধরনী" (admin-কাস্টমাইজ করা ভ্যালু কখনো overwrite হয় না — exact old-value match only)
  - `members`: ভুয়া ডেমো ২০২৫-২০২৬ কেন্দ্রীয় কমিটির ১৫টি নাম (exact seed-list match) DELETE → বাস্তব ২০২১-২২ শাখা কমিটির ৯ জন INSERT (Md. Rafsan-সভাপতি, K.M. Akij Mahmud-সাধারণ সম্পাদক, Mushfiqur Rahman Emon-সাংগঠনিক সম্পাদক, Rabby Hasan-অর্থ সম্পাদক, Jannatul Ferdous SaYma-দপ্তর সম্পাদক, Murad Hoshen-উপ দপ্তর সম্পাদক, আয়েশা সিদ্দিকা এ্যানি-প্রচার সম্পাদক, Tawhida Akter-উপ প্রচার সম্পাদক, Sk Rafiquzzaman-প্রশিক্ষণ বিষয়ক সম্পাদক); এরপর `autoLinkMembersToUsers()` চলে বলে নাম মিললে প্রোফাইলে অটো-লিংক হয়
  - fresh DB seed (`seedAdmin` + `seedDemoContent`) এখন থেকেই ব্র্যান্ডেড ডিফল্ট + বাস্তব কমিটি
- **গ্লোবাল টেক্সট রি-ব্র্যান্ড** (৮৬ ফাইল): views/ + admin/views/ + routes/ + CSS/JS হেডার কমেন্ট — "লেখক ফোরাম" → "বাংলাদেশ তরুণ কলাম লেখক ফোরাম" (lookbehind-guarded, ডাবল-প্রিফিক্স নেই)
- **layout.ejs / header.ejs / footer partial**: লোগো দুই-লাইন — strong "বাংলাদেশ তরুণ কলাম লেখক ফোরাম" + small "চট্টগ্রাম বিশ্ববিদ্যালয়"; footer-এ পূর্ণ পরিচিতি + মূলমন্ত্র + বাস্তব ঠিকানা/ফোন; `<title>` ও meta description ব্র্যান্ডেড
- **হোম হিরো**: eyebrow-তে পূর্ণ নাম, hero-sub-এ বাস্তব পরিচিতি, CTA "সদস্য হোন" (/register); mission সেকশন = লক্ষ্য ও উদ্দেশ্য (বাস্তব বর্ণনা + ৩+১ কার্ড)
- **/about সম্পূর্ণ রিরাইট**: পরিচয় + মূলমন্ত্র/স্লোগান চিপ, লক্ষ্য-উদ্দেশ্য (৩টি), চবি শাখা নোট, কার্যাক্রমসমূহ ৮টি কার্ড, "আপনি কি একজন কলম সৈনিক হতে চান?" CTA, সদস্য হওয়ার শর্তাবলি ৪ ধাপ (২০০ টাকা + ০১৭৯১১৮৭১৬৪ রেফারেন্স শর্তসহ), অবশ্যপালনীয় শর্ত, বিঃদ্রঃ ওয়ার্নিং (মাসিক ১ লেখা / ৬০% হাজিরা নিয়ম)
- **/committee**: সাবটাইটেল + ডায়নামিক ভূমিকা "…চবি শাখার [কার্যবর্ষ] কার্যবর্ষের নবনির্বাচিত নেতৃবৃন্দ"; **/contact**: placeholder ফোন → ০১৭৯১১৮৭১৬৪ (tel: লিংকসহ)
- **CSS**: লম্বা লোগোর জন্য `.btclf-topbar .logo-text strong` 16px+nowrap, ≤480px 13.5px — মোবাইলেও এক-লাইন
- **রেস-কন্ডিশন হটফিক্স (follow-up কমিট `3fc6d3b`)**: প্রথম ডিপ্লয়ে একসাথে একাধিক serverless কোল্ড-বুট চেক-দেন-ইনসার্ট চালিয়ে কিছু কমিটি সদস্য ৬ বার করে ঢুকে পড়েছিল (Mushfiqur ×6, Rabby ×6…) — মাইগ্রেশন এখন প্রথমে user_id merge + dedupe (name+term_year+member_type ধরে MIN(id) রাখে), তারপর `CREATE UNIQUE INDEX idx_members_unique_name_term` + `INSERT OR IGNORE` — ভবিষ্যতে কোনো কনকারেন্ট বুটে ডুপ্লিকেট অসম্ভব; admin member create/update-এ ডুপ্লিকেট হলে ৫০০-এর বদলে বাংলা error message; লাইভে যাচাইকৃত — ৯ জন, প্রত্যেকে ১ বার
- যাচাই: settings+members মাইগ্রেশন লোকালে ভেরিফায়েড (9 committee rows, 0 fake rows), 77/77 রিগ্রেশন, Playwright about/committee/home/mobile স্ক্রিনশট, লাইভ ১২ পেজ 200

### সেশন ১৯ (৫ সেপ্টেম্বর ২০২৬) — কমিটি ইতিহাস v2: অফিসিয়াল প্রেস-বিজ্ঞপ্তি ডেটা (২০২০-২১ → ২০২৪-২৫)
- **ইউজার ইনপুট**: "১৯-২০ এর কোনো কমিটি নেই! এখানে আরও কিছু ছবি দিলাম, সবগুলো বুঝে ঠিক করে তার পর সেগুলো সাইটে দাও!" — ৪টি অফিসিয়াল প্রেস বিজ্ঞপ্তির ছবি (১ মার্চ ২০২১, ১২ আগস্ট ২০২১, ২০ মার্চ ২০২২ পুনর্গঠন, ১৭ আগস্ট ২০২২, ৩ সেপ্টেম্বর ২০২৩)
- **db.js committee-history v2 মাইগ্রেশন** (`committee_history_v2_seeded` গার্ড): ৫ কার্যবর্ষের চূড়ান্ত ডেটা — ২০২০-২১ (৮ জন, নতুন), ২০২১-২২ (১৩ জন — পুনর্গঠিত চূড়ান্ত গঠন, ইংরেজি নাম বাংলায় সংশোধিত), ২০২২-২৩ (১৫ জন — v1 এ ভুলবশত ২০২৩-২৪-এর তালিকা ছিল, সংশোধিত), ২০২৩-২৪ (১৫ জন, নতুন), ২০২৪-২৫ (১৭ জন, অপরিবর্তিত)
- **পুরনো ইংরেজি ডেমো সিড নির্মূল**: `BRANCH_COMMITTEE` প্রতি-বুট INSERT লুপটি `LEGACY_BRANCH_ROWS` exact-match DELETE-এ প্রতিস্থাপিত (Md. Rafsan→মোঃ রাকেবুল ইত্যাদি ৮ নাম) — v2-flag সেট থাকলেও পুরনো রো আর ফিরে আসে না
- **অ্যাকাউন্ট রি-ম্যাপিং**: v1-এর ২৪টি অ্যাকাউন্টের username/full_name অফিসিয়াল বাংলা নামে সংশোধিত (md_rafsan→md_rakebul, yousuful_islam_sikat→irashadul_sifat, saiful_mia→saiful_mira ইত্যাদি), ১০ জন নতুন সদস্যের অ্যাকাউন্ট তৈরি (arman_sheikh, atihar_noor, rian_chandra_pal, maruf_motubbar, mijanur_rahman, sifat_tanukanar, roksana_akter, sonbul_ahmed, asaduzzaman_bulbul, nezam_uddin) — ৬০+ member row সবগুলোই user-linked (0 orphan), designation = সর্বশেষ কার্যবর্ষের পদ
- **রাউট**: `/committee` থেকে ১৯-২০ চিপ বাদ + শুধু ডেটা-আছে এমন বর্ষের চিপ + প্রতিটি বর্ষের অফিসিয়াল গঠন/পুনর্গঠন তারিখ নোট (TERM_NOTES); হোমের "বর্তমান নেতৃত্ব" ও `/team` এখন সর্বশেষ কার্যবর্ষ (২০২৪-২৫) থেকে; `/members`-এর হার্ডকোড "২০২৫-২০২৬" শিরোনাম ডাইনামিক
- যাচাই: ৫ বর্ষ × Playwright (ডিফল্ট ২০২৪-২৫, ফিল্টার চিপ, কার্ড→`/profile/md_rakebul` সোশ্যাল ফিড + মাল্টি-টার্ম "সংগঠনে দায়িত্ব" চিপ), ৭৭/৭৭ রিগ্রেশন, সব টার্ম-URL 200

### সেশন ১৮ (৫ সেপ্টেম্বর ২০২৬) — বিজ্ঞপ্তির ডিজাইন প্রফেশনাল রি-ডিজাইন (হোম + সকল বিজ্ঞপ্তি)
- **ইউজার রিপোর্ট**: "সকল বিজ্ঞপ্তি পেইজ আর হোম পেইজের বিজ্ঞপ্তির ডিজাইন প্রফেশনাল লাগছে না; ১ লাইনে ১টাই রাখো; কালো কালারটা ভালো দেখাচ্ছে না"
- **নতুন শেয়ার্ড `.notice-row` সিস্টেম** (style.css): দুই পেইজেই একই প্রফেশনাল রো-ডিজাইন — প্রতি লাইনে ঠিক ১টি বিজ্ঞপ্তি, বামে ক্যাটাগরি-রঙিন আইকন চিপ (প্রেস=cyan `fa-bullhorn`, নোটিশ=blue `fa-bell`, ইভেন্ট=amber `fa-calendar-alt`), টাইটেল + inline pill badge, নিচে ১-লাইন excerpt (শুধু /notices), ডানে muted তারিখ + chevron
- **"কালো" উপাদান অপসারণ**: পুরনো `.notice-date`-এর ডার্ক-নেভি (`--brand #0a1f44`) চিপ বাদ — তারিখ এখন `--text-muted` লেখা + emerald ক্যালেন্ডার আইকন; হোমের পুরনো `.update-*` bare-text তালিকাও বাদ (dashboard.css থেকে ডেড CSS মুছে)
- **হোভার**: emerald left-rail (::before) + border-glow + তীর স্লাইড; মোবাইল (≤576/640px) badge লুকানো, টাইটেল-লেখা পড়ে যাওয়ার জায়গা পায়
- মাইগ্রেশন: `lekhok-notices.ejs` + `lekhok-home.ejs` (৬টি সাম্প্রতিক বিজ্ঞপ্তি) নতুন মার্কআপে; `notice-card-link`/`notice-item`/`update-list` ক্লাস কোথাও ব্যবহৃত নেই (grep-verified); ডিটেইল পেইজ অপরিবর্তিত
- যাচাই: Playwright ডেস্কটপ+মোবাইল স্ক্রিনশট, hover-state, 77/77 রিগ্রেশন, `/notices` `/` `/notices/:id` সব 200

### সেশন ১৫ (৪ সেপ্টেম্বর ২০২৬) — Vercel ডেপ্লয়মেন্ট ট্রিগার (Root Directory কার্যকর করা)
- **লাইভ ডায়াগনোসিস**: `lekhok-forum.vercel.app` এখনো `500 FUNCTION_INVOCATION_FAILED` — কারণ প্রোডাকশনে চলা ডেপ্লয়মেন্ট (`cf350b6`) বিল্ড হয়েছিল **Root Directory সেট হওয়ার আগে** → repo root থেকে বিল্ড → `lekhok-forum/vercel.json` অদৃশ্য, `api/index.js` ফাংশন হিসেবে ডিসকভারই হয়নি
- ঐ ডেপ্লয়মেন্ট **redeploy-অযোগ্য** ("This deployment can not be redeployed. Please try again from a fresh commit") → নতুন কমিট ছাড়া উপায় নেই
- **এই কমিটই ট্রিগার**: নতুন ডেপ্লয় এবার হবে আপডেটেড Project Settings দিয়ে (Root Directory=`lekhok-forum`) → `vercel.json` (functions+rewrites) কার্যকর হবে
- **পেন্ডিং (ভাষ্য নয়)**: ৪টি Environment Variables — `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` (Vercel Storage → Blob), `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (turso.app) — এগুলো ছাড়া ডাটা পারসিস্ট হবে না
- ডেপ্লয়-পরবর্তী যাচাই-চেকলিস্ট: `/` 200, লগইন পেইজ রেন্ডার, `/admin/login` 200

### সেশন ১৬ (৪ সেপ্টেম্বর ২০২৬) — Vercel লাইভ 🎉 + DB-ব্যাকড সেশন স্টোর
- **`vercel.json` স্কিমা ফিক্স** (`fd3195c`): `functions["api/index.js"].includeFiles` অ্যারে → **এক স্ট্রিং brace-glob** `"{views/**,admin/views/**,public/**,node_modules/sql.js/dist/**}"` — আগের অ্যারে ফরম্যাটে বিল্ড ফেল করছিল ("includeFiles should be string"), ফলে প্রোডাকশন পুরনো ভাঙা ডেপ্লয়মেন্টে আটকে ছিল
- **সাইট লাইভ**: `/`, `/login`, `/register`, `/admin/login`, `/assets/css/fonts.css` সব 200 — দুই-ফন্ট টাইপোগ্রাফি সহ পূর্ণ অ্যাপ
- **লগইন "স্টিক না করা" বাগ ফিক্স** (`17dd48d`): Vercel সার্ভারলেসে MemoryStore প্রতি-ইনস্ট্যান্স RAM-এ সেশন রাখত → লগইন সফল হয়েও পরের রিকোয়েস্টে অন্য instance-এ সেশন হারাত। নতুন `session-store.js` (DbStore extends session.Store) + `sessions` টেবিল — সেশন এখন ডাটাবেসে persist, ইনস্ট্যান্স-বদলেও টিকে
- **Turso সংযুক্ত**: ব্যবহারকারী turso.app-এ ডাটাবেস বানিয়ে `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` Vercel-এ যোগ করেছেন — এই কমিট নতুন ডেপ্লয় ট্রিগার করবে যাতে ভ্যারিয়েবলগুলো কার্যকর হয় (env var কার্যকর হয় শুধু নতুন ডেপ্লয়ে)
- লোকাল যাচাই: ফ্রেশ-DB বুট + admin লগইন → `sessions` টেবিলে রো নিশ্চিত; ৭৭/৭৭ রিগ্রেশন পাস (riya/tanvir ডেমো ইউজার register করে)
- **নোট**: লোকাল-অনলি অ্যাকাউন্ট (যেমন b55555) Vercel-এ নেই — Turso সংযুক্ত হলে লাইভ সাইটে পুনঃনিবন্ধন বা লোকাল DB মাইগ্রেশন করতে হবে

### সেশন ১৪ (৪ সেপ্টেম্বর ২০২৬) — কঠোর দুই-ফন্ট টাইপোগ্রাফি + admin moderators/daily UI ফিক্স
- **নতুন সাইট-ওয়াইড কঠোর নিয়ম**: হেডিং, সাব-হেডিং, মেনু, বড় লেখা = **Hind Siliguri**; বাকি সব টেক্সট = **Kalpurush** — সাইটে এই দুই ফন্ট ছাড়া আর কিছু নেই
- fonts.css রিরাইট: AkhandBengali/BenSen/Durnibar/LipiMollika/Olibrick/RushfordPrinted/Times New Roman সরাতে (হেডিং আগে AkhandBengali-তে ছিল — নিয়ম লঙ্ঘন); legacy CSS ভেরিয়েবল দুই ফন্টে রিম্যাপ
- **Root cause ফিক্স**: /admin/moderators, /admin/daily (list+form), /admin/complaints, /admin/denied — ৫টি পেইজে `<head>`+CSS লিংকই ছিল না (কাঁচা unstyled HTML) → full skeleton যোগ
- SolaimanLipi CDN (৩৮ ফাইল) → লোকাল fonts.css — এক্সটার্নাল ফন্ট ডিপেন্ডেন্সি শূন্য; admin.css/auth.css-এর অসম্ভব SolaimanLipi → Kalpurush
- অপ্রয়োজনীয় ৮ ফন্ট ফাইল রিপো থেকে সরানো (git হিস্টোরিতে সংরক্ষিত); এখন fonts/ = HindSiliguri×৫ + kalpurush.ttf
- যাচাই: ১৩-পেইজ ফন্ট অডিট (সব হেডিং/মেনু HS, বডি KP), ৭৭/৭৭ রিগ্রেশন, admin ১৬ রুট 200, 404/JS-এরর ০

### সেশন ৩ (৩ সেপ্টেম্বর ২০২৬, বিকেল) — বাগ ফিক্স ও নথিভুক্তকরণ
- একটা বিস্তারিত ডকুমেন্টেশন সেশন — code পরিবর্তন হয়নি, শুধু bugs/routes/schema/roadmap নথিভুক্ত করা হয়েছিল (দেখুন কমিট `f1c5c43`)।

### সেশন ৪ (৩ সেপ্টেম্বর ২০২৬) — মডারেটর সিস্টেম, ফাইল আপলোড, বাগ ফিক্স
- রিপো ক্লিনআপ: bycwf.org/CURHS reference dump (HAR/cert/heap snapshot/Workbox/WordPress ফাইল) working tree থেকে সরানো হয়েছে (৫৪MB→৭৪৮KB), git history অক্ষত রাখা হয়েছে
- **৭টা critical বাগ ফিক্স** — বিস্তারিত §১১-এ
- **মডারেটর পারমিশন সিস্টেম সম্পূর্ণ তৈরি** (আগে শুধু স্কিমা ছিল, ০ ব্যবহার)
- **multer দিয়ে ফাইল আপলোড বাস্তবে ওয়্যার করা** (মেসেজ + অভিযোগ)
- **`/admin/complaints`, `/moderator/complaints`, `/admin/moderators` — নতুন পেইজ**
- সার্ভার graceful shutdown (SIGINT/SIGTERM flush) যোগ করা হয়েছে
- সবকিছু curl দিয়ে end-to-end টেস্ট করে যাচাই করা হয়েছে

### সেশন ৫ (৩ সেপ্টেম্বর ২০২৬, রাত) — অন্য এজেন্টদের কাজ pull + পূর্ণাঙ্গ regression টেস্ট
অন্য এজেন্ট(রা) সমান্তরালে **১৩টা কমিট** পুশ করেছিল এই সেশন শুরুর আগে — বিশাল পরিমাণ কাজ:
- emerald ডিজাইন সিস্টেম (gold থেকে migrate), dark mode
- ৫-ইমোজি রিঅ্যাকশন (like/love/haha/wow/sad) পোস্ট+কমেন্টে, শেয়ার মেনু
- FB Lite মেসেঞ্জার: typing indicator, online status, seen receipts, poll
- কমিউনিটি ফিড ফিল্টার+সাইডবার, প্রোফাইল কন্ট্রোল সেন্টার, ব্লক/ইন্টারেস্ট ফিচার
- CURHS-স্টাইল ৯টা পাবলিক পেজ রিডিজাইন (sticky shrink header, animated hero)
- কমিটি: ১৫ জন সদস্য (প্রকৃত নাম) + year-filter + modal, ড্যাশবোর্ডে leaderboard/trending
- **Vercel + Turso (libsql) + Vercel Blob স্টোরেজ যোগ (§১২-এ বিস্তারিত ও ব্লকার)**

**এই সেশনে যা টেস্ট করা হলো:** পুরো রিপো `git fetch`/`pull` করে, সব ফাইল রিভিউ করে, `sql.js`
(local/production-non-Turso) মোডে প্রতিটা পাবলিক রুট + লগইন-প্রয়োজন রুট + অ্যাডমিন প্যানেল +
মডারেটর প্যানেল + রিঅ্যাকশন/মেসেঞ্জার/সেটিংস API — সব curl দিয়ে broad sweep করে যাচাই করা হয়েছে।

**নতুন যে ৩টা critical বাগ পাওয়া গেছে ও ঠিক হয়েছে (বিস্তারিত §১১-এ):**
8. **অ্যাডমিন লগইন সম্পূর্ণ ভাঙা ছিল** (`admin`/`admin123` কখনো কাজ করত না fresh install-এ)
9. **`/committee` 500 এরর দিত** (নতুন year-filter ফিচার একটা কখনো-তৈরি-না-হওয়া কলামের উপর নির্ভরশীল ছিল)
10. **ডেমো সিডিং সম্পূর্ণ বন্ধ হয়ে গিয়েছিল** (Turso রিরাইটে rich seed মুছে গিয়েছিল, প্রতিস্থাপন হয়নি)

**কোনো নতুন ফিচার যোগ করা হয়নি এই সেশনে** — শুধু coordinate/verify/fix, যেমন ব্যবহারকারী চেয়েছিলেন।

### সেশন ৬ (৩ সেপ্টেম্বর ২০২৬, রাত — পরে) — Turso migration + আরও UI কাজ যাচাই
পুশ করার পর আরও **১২টা কমিট** এসেছে অন্য এজেন্ট(দের) থেকে, সবচেয়ে গুরুত্বপূর্ণটা:
- **`5aa3eda`: সম্পূর্ণ Turso/Vercel async migration** — ৩৩০টা DB call site await করা হয়েছে,
  route handler async বানানো হয়েছে, error middleware যোগ, EJS-এর জন্য sync `getSetting`
  accessor রাখা হয়েছে যাতে template-এ পরিবর্তন না লাগে। সাথে বাগফিক্স: `/questions/:id`
  রুট মিসিং ছিল (সব প্রশ্নের লিংক ৪০৪ দিত), `isOnline()` undefined ফেরত দিচ্ছিল।
- স্থানীয় বাংলা ফন্ট ফাইল যোগ (Hind Siliguri সব ওজনে, Kalpurush, আরও কয়েকটা) — এখন CDN-নির্ভর না
- গ্যালারি: অ্যালবাম লাইটবক্স বাগ ফিক্স, ডুপ্লিকেট রুট বাগ ফিক্স, ছবির সংখ্যা ৮→১৬
- সদস্য পেজে বিভাগ/ভূমিকা ফিল্টার, UI পলিশ পাস (টপবার, মোবাইল নেভ)

**এই সেশনে যাচাই করা হলো (curl দিয়ে):** সব পাবলিক রুট + রেজিস্ট্রেশন + `/questions/:id` (নতুন
ফিক্স হওয়া) + অ্যাডমিন লগইন/মডারেটর/অভিযোগ প্যানেল + রিঅ্যাকশন API + মেসেঞ্জার online-status API —
**কোনো এরর বা `[object Promise]` লিক পাওয়া যায়নি।** sql.js মোডে অ্যাপ সম্পূর্ণ স্বাস্থ্যকর অবস্থায়
আছে। Turso mode বাস্তব ক্রেডেনশিয়াল ছাড়া টেস্ট করা যায়নি, কিন্তু কোড-লেভেলে migration সঠিক দেখাচ্ছে।
**কোনো নতুন বাগ পাওয়া যায়নি এই রাউন্ডে** — শুধু ভেরিফিকেশন।

### সেশন ৭ (৪ সেপ্টেম্বর ২০২৬) — রুট-মাউন্ট রিগ্রেশন ফিক্স, Turso ডেমো-সিডিং, HTML nesting
**সেশনের ধরন:** verify-and-fix (অন্য এজেন্টদের কাজের উপর রিগ্রেশন টেস্ট + রোডম্যাপ এক্সিকিউশন)।

**পাওয়া ও ঠিক হওয়া বাগ (৪টি):**
11. **`/avatar/:id` ও পুরো `/moderator` প্যানেল 404** — কমিট `c2faa96` (gallery route reorder)
    অ্যাক্সিডেন্টালি দুটো mount লাইন মুছে ফেলেছিল (`routes/avatar.js`, `routes/moderator.js`)।
    প্রভাব: পুরো সাইটে gender-ভিত্তিক ডিফল্ট অ্যাভাটার + সম্পূর্ণ মডারেটর প্যানেল অকার্যকর।
    **ফিক্স:** `server.js`-এ দুটো mount পুনরুদ্ধার।
12. **Fresh Turso/Vercel deploy-এ ডেমো কনটেন্ট/ইউজার সিড হতো না** — Turso branch শুধু admin
    seed করত (ইচ্ছাকৃত light-seed), ফলে `/articles`, `/qa`, `/profile/ismail` সব 404, ডকুমেন্টেড
    ডেমো লগইন কাজ করত না। **ফিক্স:** `seedDemoContentLocal()` → dual-backend `seedDemoContent()`
    (সব স্টেটমেন্ট awaited — sql.js-এ pass-through, Turso-এ আসল await), দুই branch থেকেই কল।
13. **`POST /follow/<non-numeric>` → 500** — `parseInt('abc')` = NaN, sql.js bind-এ crash।
    **ফিক্স:** numeric+existing-user guard → 404।
14. **HTML nesting সমস্যা (§১২-এ বর্ণিত) — সম্পূর্ণ সমাধান** — ৩১টা `views/user/*.ejs` ফাইলের
    ডুপ্লিকেট `<!DOCTYPE><head><body>` সরানো; `header.ejs` এখন একমাত্র ডকুমেন্ট-ওপেনার
    (`title` + `extra_css` data হিসেবে include-এ পাস হয়)। ৫টা standalone পেজ (login/register/
    edit/forms) অপরিবর্তিত। রেন্ডার আউটপুটে এখন ১টা DOCTYPE, পেজ-নির্দিষ্ট CSS ও dynamic
    title (যেমন `post.title — লেখক ফোরাম`) ঠিক জায়গায়।

**এই সেশনে টেস্ট:**
- ১৮টা JS ফাইলের syntax check, পুরো রুট-ম্যাপ অডিট
- নতুন **`scripts/test-lekhok.sh`** (রিপোতে কমিট করা): ৯১টা চেক — public pages, auth-guards,
  admin panel (২০ পেজ), user panel (১০ পেজ), JSON API, write-flow POST (article/comment/
  reaction/bookmark/follow/message/complaint/contact/register), ব্র্যান্ড-লিক ও promise-leak চেক
- **দুই ব্যাকএন্ডেই ৯১/৯১ ALL GREEN** (sql.js + Turso file-mode; সেশন শুরুর আগে Turso ৭২/১৯ ছিল)
- মডারেটর ফ্লো end-to-end: role+scope সেট → প্যানেল 200, unscoped পেজ 403, পোস্টিং 302 ✓
- ডকুমেন্টেশন সংশোধন: §৭ ডেমো ইউজার (ismail/… সেট), top-level Turso সতর্কতা আপডেট

**অন্য এজেন্টদের জন্য:**
- টেস্ট চালাতে: `bash scripts/test-lekhok.sh http://localhost:8080` (আগে `npm install` +
  `node server.js`)। Turso: `PORT=8081 TURSO_DATABASE_URL=file:./turso-check.db node server.js`।
- সার্ভার চালু থাকা অবস্থায় `lekhok.db` ফাইল সরাসরি এডিট করবেন না — SIGTERM flush আপনার
  পরিবর্তন মুছে দেবে (এই সেশনে ধরা পড়েছে)। আগে সার্ভার kill → তারপর এডিট → তারপর চালু।
- সাম্প্রতিক কমিটে fonts.css + ফন্ট-সিলেক্টর UI (settings-এ ৭+ বাংলা ফন্ট) যোগ হয়েছে — যাচাইকৃত ✓

---


### সেশন ৮ (৪ সেপ্টেম্বর ২০২৬) — অ্যাডমিন লগইন UX, ডেমো মডারেটর, scope-key unification
**সেশনের ধরন:** verify-and-fix (ব্যবহারকারীর রিপোর্ট: "এডমিন লগিন কাজ করছে না, মডারেটর লগিনের ডিটেইল সেট করা হয়েছে?")।

**ডায়াগনোসিস:** অ্যাডমিন লগইন আসলে কাজ করছিল (`/admin/login`-এ admin/admin123), কিন্তু
ব্যবহারকারী `/login` (ইউজার পেজ) থেকে চেষ্টা করায় "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড" দেখাচ্ছিল —
UX কনফিউশন। আর মডারেটর সিস্টেম কোডে সম্পূর্ণ থাকলেও **কোনো মডারেটর অ্যাকাউন্ট কখনোই তৈরি হয়নি**
(`moderators` + `moderator_scopes` টেবিল দুটোই ফাঁকা ছিল)।

**পাওয়া ও ঠিক হওয়া বাগ (৪টি):**
15. **`/login`-এ অ্যাডমিন ক্রেডেনশিয়াল কনফিউজিং এরর** — **ফিক্স:** `POST /login` এখন
    `admin_users` টেবিলে fallback করে; অ্যাডমিন পাসওয়ার্ড মিললে `session.adminUser` সেট হয়ে
    সরাসরি `/admin`-এ redirect।
16. **মডারেটর লগইনের কোনো অ্যাকাউন্ট ছিল না** — **ফিক্স:** `db.js`-এ idempotent
    `ensureDemoModerator()` — প্রতি বুটে চলে (দুই ব্যাকএন্ডেই): `moderator`/`moderator123`
    ইউজার, role='moderator', সব canonical scope সহ।
17. **Scope-key mismatch: `/admin` প্যানেল `notices`/`events` (বহুবচন) আর `/moderator`
    প্যানে `notice`/`event` (একবচন)** — অ্যাডমিন প্যানেল থেকে প্রমোট করা মডারেটর
    (ডিফল্ট গ্রান্ট `['daily','notices','events']`) নিজের `/moderator` প্যানেলের কোনো
    চেকই পাস করত না। **ফিক্স:** `db.hasScope()` এখন alias-aware
    (notice↔notices, event↔events — SCOPE_ALIASES export করা), `admin/routes.js`-এর
    লোকাল `hasScope()` এখন `db.hasScope()`-এ delegate করে, রোল-চেঞ্জ ডিফল্ট গ্রান্ট এখন
    পূর্ণ canonical সেট, স্কোপ-চেকবক্স UI (moderators.ejs + users/edit.ejs) ১০টা
    canonical scope বাংলা লেবেলসহ দেখায় (users/edit.ejs আগে string-array-তে
    `s.key`/`s.label` চালায় ভুল করে — undefined রেন্ডার হতো)।
18. **মডারেটর সেশনে `GET /admin` → 500** — `admin/dashboard.ejs` সবসময়
    `adminUser.display_name` চালাত; `/login` থেকে মডারেটর সেশনে `adminUser` null।
    **ফিক্স:** fallback `(adminUser.display_name || user.full_name || 'স্টাফ')`;
    users/edit.ejs-এর danger-zone guard-ও দুই সেশন টাইপ সামলায়।

**অন্যান্য:** ডেড-কোড ডুপ্লিকেট `GET /admin/moderators` রুট (এক্সপ্রেস কখনো দ্বিতীয়টা
ব্যবহার করত না) সরানো।

**টেস্ট:** ২১-চেক E2E (`scripts/test-login-fixes.sh` — অ্যাডমিন/মডারেটর/ইউজার লগইন ফ্লো,
দুই প্যানেলে scope অ্যাক্সেস, 403/302 গার্ড) + ৯১-চেক ফুল regression — **সব ALL GREEN**।

### সেশন ৯ (৪ সেপ্টেম্বর ২০২৬) — 'daily' umbrella scope-এর বাকি থাকা ফাঁক
সেশন ৮-এর scope-unification ফিক্স যাচাই করতে গিয়ে একটা সংকীর্ণ কিন্তু বাস্তব ফাঁক পেলাম: সেশন
৮ শুধু `notice`↔`notices` আর `event`↔`event` alias ঠিক করেছিল, কিন্তু checkbox UI-তে থাকা
**`daily` (ডেইলি কনটেন্ট) umbrella scope-টা কোথাও ব্যবহারই হতো না।** সরাসরি টেস্ট করে দেখলাম:
`/admin/users/:id/scopes`-এ শুধু `daily` চেক করে সেভ করলে সেই মডারেটর `/moderator/daily/quiz`,
`/epaper` ইত্যাদি কোনোটাতেই ঢুকতে পারত না (৪০৩) — যদিও checkbox-এ "ডেইলি কনটেন্ট" নামে
একটা সুস্পষ্ট অপশন দেখানো হচ্ছিল, যেন এটা সবকিছু কভার করে।

**ফিক্স:** `db.js`-এ নতুন `DAILY_CONTENT_SCOPES = ['quiz','this_day','activity','epaper']`
এক্সপোর্ট করে `hasScope()`-এ যোগ করা হয়েছে — এই ৪টার যেকোনোটা চেক করলে ব্যবহারকারীর
`daily` scope থাকলেও পাস করবে (SCOPE_ALIASES-এর মতোই প্যাটার্ন, শুধু 1-বনাম-many)।
`views/user/moderator-dashboard.ejs`-এর tile-grid unlock-লজিকও একই সমন্বয় মেনে আপডেট করা
হয়েছে, যাতে ড্যাশবোর্ড আর বাস্তব অ্যাক্সেস সবসময় মিলে যায়।

**টেস্ট:** নতুন মডারেটরকে শুধু `daily` scope দিয়ে — `/moderator/daily/quiz` ও `/epaper`
দুটোই এখন 200 দেয় (আগে 403), ড্যাশবোর্ড টাইলও আনলকড দেখায়। বাকি ৯১-চেক regression আবার
চালিয়ে নিশ্চিত হয়েছি কিছু ভাঙেনি।

### সেশন ১২ (৪ সেপ্টেম্বর ২০২৬) — /settings ও /me ফুটার ফিক্স (ফ্রেমের বাইরের কনটেন্ট)
ইউজার রিপোর্ট: ফুটারের বাঁ দিকের কনটেন্ট একদম ফ্রেমের বাইরে চলে যাচ্ছে। কারণ —
`partials/footer.ejs`-এর `site-footer` ক্লাসের কোনো CSS ছিল না (কোনো ব্যাকগ্রাউন্ড নেই →
সাদার ওপর সাদা টাইটেল অদৃশ্য; `.container` নেই → কনটেন্ট x=0)। ফিক্স: partial footer-কে
layout-এর `btclf-footer` ডিজাইন-সিস্টেম + `.container`-এ নিয়ে আসা হয়েছে; ৪-কলাম রেসপনসিভ
গ্রিড (৪→২→১) যোগ হয়েছে। টেস্ট: ৬১-চেক footer E2E (৪ ভিউপোর্ট জিওমেট্রি + হোমপেজ রিগ্রেশন)
+ ৭৭-চেক ফুল regression — **সব ALL GREEN**।

### সেশন ১৩ (৪ সেপ্টেম্বর ২০২৬) — Turso ছাড়া Vercel ডিপ্লয় (Blob snapshot মোড) + v1 সাইট আর্কাইভ
ইউজারের Turso অ্যাকাউন্ট নেই, কিন্তু Vercel-এ বর্তমান অ্যাপ চালাতে হবে। নতুন **Blob snapshot
মোড**: `BLOB_READ_WRITE_TOKEN` থাকলে (Turso না থাকলে) sql.js ডাটাবেস ইমেজ সময়ে সময়ে
Vercel Blob-এ আপলোড (`private/db-<hash>.sqlite`) আর cold boot-এ রিস্টোর হয় — কোনো বাইরের
অ্যাকাউন্ট ছাড়াই ডাটা টিকে থাকে। সাথে দুটো আসল বাগ ফিক্স: (১) `middleware/upload.js`-এ
`@vercel/blob`-এর অস্তিত্বহীন `createClient().upload()` API — প্রোডাকশনে **সব ফাইল আপলোড
ক্র্যাশ করত**, আসল `put()` API-তে স্থানান্তর; (২) `vercel.json`-এ sql.js-এর `.wasm`
`includeFiles`-এ যোগ (serverless bundle-এ অন্তর্ভুক্ত না হওয়ার ঝুঁকি)। v1 স্ট্যাটিক সাইট
রিপো root থেকে `legacy-static-site/`-এ সরানো হলো (git history অক্ষত) — এটাই Vercel-এ পুরনো
সাইট দেখানোর কারণ ছিল। টেস্ট: ১০-চেক blob round-trip (সেভ→রিস্টার্ট→রিস্টোর, নো-ডুপলিকেট
সিড) + ৭৭/৭৭ ফুল regression — **ALL GREEN**।

## ১১. বাগ ফিক্স হিস্ট্রি

> এই বাগগুলো সেশন ৩-এর ডকুমেন্টেশনে "Known Issues" হিসেবে চিহ্নিত হয়েছিল এবং সেশন ৪-এ ঠিক করা হয়েছে। রেফারেন্সের জন্য এখানে রাখা হলো — যদি ভবিষ্যতে কোনো রিফ্যাক্টর এই ফিক্সগুলো ভুলবশত উল্টে দেয়।

| # | বাগ | প্রভাব | ফিক্স |
|---|---|---|---|
| ১ | `wrapStmt().run()` কখনো `lastInsertRowid` রিটার্ন করত না | রেজিস্ট্রেশনে `session.user.id = undefined`, নতুন মেসেজ conversation তৈরি ব্যর্থ, আর্টিকেল/প্রশ্ন পোস্টের পর `/articles/undefined` | `db.js`-এ `run()`-এ `SELECT last_insert_rowid()` যোগ |
| ২ | `users` টেবিলে `role` কলামই ছিল না | অভিযোগ জমাদানে SQL error (`WHERE role='admin'`), admin/moderator UI লিংক কখনো দেখাত না | `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'` |
| ৩ | `complaints` টেবিলে `file_name` কলাম ছিল না অথচ কোড insert করত | অভিযোগ জমা দিলেই ক্র্যাশ | `ALTER TABLE complaints ADD COLUMN file_name TEXT` |
| ৪ | ১২টা অ্যাডমিন সাব-পেজ (`notices/events/members/gallery/resources/settings/messages` list+form) সম্পূর্ণ `<html><head>` ছাড়াই রেন্ডার হতো | কোনো CSS/ফন্ট লোড হতো না, raw unstyled HTML | সবগুলোতে সম্পূর্ণ head/body wrapper যোগ |
| ৫ | লগইনে সেশনে `role` সেট হতো না (`routes/auth.js`) | মডারেটর বানানোর পরও ইউজার `/moderator`-এ ঢুকতে পারত না (403) — যতক্ষণ না লগআউট/লগইন করত | login/register-এ `role` সেশনে যোগ |
| ৬ | sql.js-এর ২০০ms write-debounce-এ কোনো shutdown flush ছিল না | সার্ভার রিস্টার্ট/ক্র্যাশ হলে সাম্প্রতিক লেখা ডেটা নিঃশব্দে হারিয়ে যেত (curl টেস্টে ধরা পড়েছে — `kill` করার পরপরই নতুন রেজিস্টার হওয়া ইউজার উধাও হয়ে গিয়েছিল) | `server.js`-এ `SIGINT`/`SIGTERM` হ্যান্ডলার — exit-এর আগে `saveDb()` জোর করে কল |
| ৭ | মেসেজ/অভিযোগ ফর্মের ফাইল-ইনপুট নাম `file`, কিন্তু multer middleware `attachment` আশা করছিল | ফাইল আপলোড ব্যর্থ হতো | middleware-কে ফর্মের নামের সাথে মিলিয়ে `file` করা হয়েছে |
| ৮ | local (sql.js) মোডে `admin_users` টেবিল কখনো seed হতো না — `seedIfEmptyLocal()` শুধু একটা লগ মেসেজ প্রিন্ট করত, বাস্তবে কিছু insert করত না | **fresh install-এ `admin`/`admin123` লগইন কখনো কাজ করত না** — পুরো অ্যাডমিন প্যানেল অ্যাক্সেসযোগ্য ছিল না | local branch-এও `seedAdmin()` কল করা হয় এখন (আগে শুধু Turso mode-এ কল হতো) |
| ৯ | `/committee` route-এর নতুন year-filter ফিচার `members.term_year` কলামের উপর নির্ভর করত, কিন্তু কোনো migration-এ এই কলাম কখনো যোগ হয়নি (কমেন্টে বলা "ensure-year-column.js" ফাইলটাই রিপোতে নেই) | `/committee` পেইজ প্রতিবার `500 Internal Server Error` দিত | `ALTER TABLE members ADD COLUMN term_year TEXT` migration যোগ + সিড ডেটায় term_year সেট করা হয়েছে |
| ১০ | Turso/libsql রিরাইটের সময় পুরনো rich demo-content seed function (gallery/quiz/achievements/constitution/past_leaders/resources — মূল "১০টা প্রতীকী আইটেম" চাহিদা) সম্পূর্ণ মুছে ফেলা হয়েছিল, কোনো প্রতিস্থাপন ছাড়াই | fresh install-এ গ্যালারি/কুইজ/অর্জন/গঠনতন্ত্র/রিসোর্স/কমিটি সব খালি থাকত — ডিজাইন-রেফারেন্স উদ্দেশ্যই ব্যর্থ হতো | পুরনো seed ডেটা (git history থেকে উদ্ধার করে) নতুন `seedDemoContentLocal()` ফাংশনে পুনর্লিখিত হয়েছে, `initDb()`-এর local branch থেকে অটো-কল হয় |
| ১১ | `/login`-এ অ্যাডমিন ক্রেডেনশিয়াল দিলে কনফিউজিং এরর (admin শুধু `/admin/login`-এ কাজ করত) | ব্যবহারকারী মনে করত admin login ভাঙা | `POST /login` এখন `admin_users`-এ fallback করে |
| ১২ | মডারেটর সিস্টেম কোডে সম্পূর্ণ থাকলেও কোনো ডেমো মডারেটর অ্যাকাউন্টই কখনো সিড হতো না | টেস্ট/ডেমোর জন্য মডারেটর লগইন করার কোনো উপায় ছিল না | প্রতি বুটে idempotent `ensureDemoModerator()` — `moderator`/`moderator123` |
| ১৩ | `/admin` প্যানেল `notices`/`events` (বহুবচন) স্কোপ-কী ব্যবহার করত, `/moderator` প্যানেল `notice`/`event` (একবচন) চেক করত — দুটো কখনো মেলেনি | অ্যাডমিন প্যানেল থেকে প্রমোট করা মডারেটরের বিজ্ঞপ্তি/ইভেন্ট পোস্টিং permission কার্যত অকেজো ছিল | `db.hasScope()` alias-aware করা হয়েছে (`SCOPE_ALIASES`); checkbox UI-ও ঠিক করা হয়েছে (আগে `users/edit.ejs` string-array-কে object ভেবে `s.key`/`s.label` চালাত — undefined রেন্ডার হতো) |
| ১৪ | মডারেটর সেশনে `GET /admin` 500 দিত (`admin/dashboard.ejs` সবসময় `adminUser.display_name` ধরে নিত, কিন্তু user-session মডারেটরের `adminUser` null) | মডারেটর নিজের ড্যাশবোর্ড দেখতে গেলে ক্র্যাশ | fallback `(adminUser.display_name \|\| user.full_name \|\| 'স্টাফ')` |
| ১৫ | checkbox UI-তে "ডেইলি কনটেন্ট" (`daily`) নামে একটা umbrella scope অপশন দেখানো হতো, কিন্তু `hasScope()`-এ `daily`-কে quiz/this_day/activity/epaper-এর কোনোটার সমতুল্য ধরা হতো না | শুধু `daily` scope দেওয়া মডারেটর `/moderator/daily/quiz`, `/epaper` ইত্যাদি **কোনোটাতেই** ঢুকতে পারত না, যদিও UI স্পষ্টভাবে বোঝাত এটা সব কভার করে | নতুন `DAILY_CONTENT_SCOPES` এক্সপোর্ট করে `hasScope()`-এ ১-বনাম-many সম্প্রসারণ যোগ করা হয়েছে; ড্যাশবোর্ড tile-এর unlock-লজিকও মেলানো হয়েছে |

---

## ১২. জানা সমস্যা — এখনো বাকি

### ~~🚨 Turso/Vercel মোড অকার্যকর~~ — ✅ সমাধান হয়েছে

**✅ সমাধান হয়েছে (commit `5aa3eda` + সেশন ৭-এর ডেমো-সিডিং ফিক্স)** — উপরে দেখুন। দুই
ব্যাকএন্ড ৯১/৯১ গ্রিন (`scripts/test-lekhok.sh`)। এই আইটেমটা রেফারেন্সের জন্য রাখা হলো।

> (পুরনো HTML nesting-এর বিস্তারিত বর্ণনা সরানো হলো — নিচের সেকশনে সমাধান দেওয়া আছে।)

### ~~HTML nesting issue~~ — ✅ সমাধান হয়েছে (সেশন ৭)
আগে `header.ejs`-ও সম্পূর্ণ ডকুমেন্ট ছিল আর ~৩১টা `views/user/*.ejs` নিজেদেরও `<!DOCTYPE...>`
wrapper রাখত — nested/invalid HTML। **সমাধান:** সেশন ৭-এ ৩১টা পেজের ডুপ্লিকেট head সরানো হয়েছে;
`header.ejs` এখন একমাত্র ডকুমেন্ট-ওপেনার, পেজ-নির্দিষ্ট `title`/`extra_css` include-data হিসেবে পাস
হয়। ৫টা standalone পেজ (login/register/edit/article-form/qa-form) নিজ ডকুমেন্ট রেখেছে (ওরা
header include করে না)। যাচাই: প্রতিটা রেন্ডার করা পেজে ১টা DOCTYPE, dynamic title ও পেজ-CSS ঠিক।
admin views-গুলো (`admin/views/admin/*.ejs`) শুরু থেকেই স্বয়ংসম্পূর্ণ — সেখানে nesting সমস্যা নেই।

### অন্যান্য ছোট ফাঁক
- ~~role পরিবর্তন সেশনে রিফ্রেশ হয় না~~ — ✅ সেশন ৩৩-এ locals মিডলওয়্যারে ফ্রেশ-ফেচ; banned-ও টrap হয়
- ~~ফন্ট টগল UI বাটন নেই~~ — ✅ settings-এ ৭+ বাংলা ফন্ট-সিলেক্টর (সাম্প্রতিক কমিট, সেশন ৭-এ যাচাইকৃত)
- CURHS-স্টাইল nav গ্রুপিং, sticky+shrink header, hero ক্যারোসেল, সার্চ — এখনো implement হয়নি (§১৩ দেখুন)
- ~~v1 স্ট্যাটিক সাইট (repo root-এর index.html ইত্যাদি) রাখা হবে নাকি সরানো হবে — সিদ্ধান্ত বাকি~~ — ✅ সিদ্ধান্ত হয়েছে (সেশন ১৩): `legacy-static-site/` ফোল্ডারে আর্কাইভ করা হয়েছে (ইউজারের অনুমতিক্রমে — হিস্টোরি/রেফারেন্স হিসেবে রাখা), বর্তমান সাইট শুধু `lekhok-forum/` অ্যাপ
- `bcrypt` হ্যাশ synchronous — রেজিস্ট্রেশনে সাময়িক ইভেন্ট-লুপ ব্লক করে (ছোট স্কেলে সমস্যা না, বড় হলে async ভার্সন ব্যবহার করা ভালো)
- ~~গ্লোবাল সার্চ (`/search?q=`) এখনো নেই~~ — ✅ সেশন ৩৩-এ যুক্ত হয়েছে (ড্রপডাউন + ফুল পেজ)

---

## ১৩. রেফারেন্স সাইট থেকে নেওয়া আইডিয়া

> রেফারেন্স হিসেবে শেয়ার করা ফাইলগুলো (bycwf.org, CURHS/curhs.org এক্সট্র্যাক্ট) — এগুলো **আইডিয়ার উৎস মাত্র**, কপি করার জন্য না। বাস্তবে ফাইলগুলো (HAR/cert/heap snapshot ইত্যাদি) রিপো থেকে সরিয়ে ফেলা হয়েছে (working tree থেকে) — নিচে শুধু কী কী স্ট্রাকচারাল আইডিয়া প্রাসঙ্গিক মনে হয়েছে তার তালিকা।

CURHS (Elementor/WordPress-ভিত্তিক) থেকে যা নেওয়ার মতো:

| আইডিয়া | লেখক ফোরামে বর্তমান অবস্থা |
|---|---|
| Sticky header (স্ক্রলে shrink হয়) | ❌ এখনো সাধারণ sticky, shrink অ্যানিমেশন নেই |
| Dropdown nav গ্রুপিং (About → History/Board/Members) | ❌ ১৭টা লিংক সমতলে — গ্রুপিং প্রস্তাবিত: সাহিত্য / দৈনিক / সংগঠন / মিডিয়া / আমাদের সম্পর্কে |
| Search modal (লাইভ রেজাল্ট) | ❌ সার্চ ফিচারই নেই |
| Mobile offcanvas drawer | ⚠️ সাধারণ টগল আছে, ঝকঝকে drawer না |
| Back-to-top বাটন | ❌ নেই |
| হিরো ইমেজ স্লাইডার/ক্যারোসেল | ❌ homepage-এ static gradient hero আছে, স্লাইডার নেই |
| গ্রিড-বেসড পোস্ট কার্ড + hover overlay | ❌ আর্টিকেল লিস্টিং/গ্যালারিতে প্রয়োগযোগ্য |
| আইকন-বক্স ফিচার সেকশন | ❌ "কেন লেখক ফোরাম" টাইপ সেকশন নেই |
| Preloader | দরকার নেই (সার্ভার-রেন্ডার এমনিতেই দ্রুত) |

**প্রস্তাবিত পরবর্তী কাজ:** homepage (`lekhok-home.ejs`) ও আর্টিকেল/গ্যালারি লিস্টিং-এ এই প্যাটার্নগুলো — কোড কপি না করে নতুন করে লিখে — প্রয়োগ করা।

---

## ১৪. ইম্প্রুভমেন্ট রোডম্যাপ

### দ্রুত করণীয়
- [x] পাবলিক পেজে `fonts.css` যুক্ত করা + ফন্ট-টগল UI (সাম্প্রতিক কমিটে সম্পন্ন — সেশন ৭-এ যাচাইকৃত)
- [x] ৩১টা ফাইলের HTML nesting সমস্যা ঠিক করা (§১২) — **সেশন ৭-এ সম্পন্ন**
- [x] Topbar/নেভবারে ড্যাশবোর্ড/গ্যালারি/মেসেজ/অভিযোগ লিংক — **সেশন ৭-এ যাচাইকৃত, সব আছে**

### শর্ট টার্ম
- [ ] CURHS-স্টাইল nav গ্রুপিং + sticky/shrink header + back-to-top + হিরো ক্যারোসেল
- [x] গ্লোবাল সার্চ (`/search?q=` — posts + members + daily_content) — **সেশন ৩৩**
- [x] role পরিবর্তনের পর সেশন অটো-রিফ্রেশ — **সেশন ৩৩**
- [ ] v1 static site রাখা/সরানো নিয়ে সিদ্ধান্ত

### মিড টার্ম
- [ ] **WhatsApp/ইমেইল ইন্টিগ্রেশন** (broadcastToAll-এর সাথে যুক্ত করে) — ব্যবহারকারীর ইচ্ছা অনুযায়ী পরে
- [ ] রিচ টেক্সট এডিটর (আর্টিকেল ফর্মে)
- [ ] পোস্ট মডারেশন: hide/report + মডারেটর approve-queue
- [ ] ছবি অপটিমাইজেশন (sharp) — কভার/গ্যালারি রিসাইজ
- [ ] OG meta ট্যাগ (শেয়ার প্রিভিউ)
- [ ] ইমেইল ভেরিফিকেশন

### লং টার্ম
- [ ] PostgreSQL + S3-কম্প্যাটিবল ফাইল স্টোরেজ (বড় স্কেলে)
- [ ] PWA (অফলাইন রিডিং)
- [ ] মোবাইল অ্যাপ
- [ ] মাসিক সেরা লেখক ভোটিং সিস্টেম
- [ ] অ্যাডমিন অ্যানালিটিক্স ড্যাশবোর্ড

---

## ১৫. ডিপ্লয়মেন্ট গাইড

### লোকাল — `node server.js`, কোনো নেটিভ কম্পাইল লাগে না (sql.js ব্যবহারের কারণে)

### প্রোডাকশন — Vercel সরাসরি উপযুক্ত না
persistent file storage (`lekhok.db`, `public/uploads/`) সার্ভারলেস পরিবেশে টেকে না — প্রতি রিকোয়েস্টে নতুন কোল্ড ইনস্ট্যান্স, ফাইলসিস্টেম ইফেমেরাল।

| হোস্ট | কেন | খরচ |
|---|---|---|
| **Railway** | পার্সিস্টেন্ট ডিস্ক + Git push ডিপ্লয় | ফ্রি টায়ার আছে |
| **Render** | সহজ Node ডিপ্লয় | ফ্রি (কোল্ড স্টার্ট আছে) |
| **Fly.io** | ভলিউম + গ্লোবাল এজ | ফ্রি টিয়ার |
| **VPS (DigitalOcean)** | সম্পূর্ণ নিয়ন্ত্রণ + PM2 | ~$৪/মাস |

⚠️ **প্রোডাকশনে যাওয়ার আগে:** ডিফল্ট admin পাসওয়ার্ড বদলান, `SESSION_SECRET` সেট করুন, HTTPS নিশ্চিত করুন, `public/uploads/` ভলিউমে persist হচ্ছে কিনা যাচাই করুন।

---

## ১৬. গিট হিস্ট্রি

```
c454aa2  Build full-stack lekhok-forum app: Node.js + Express + SQLite + EJS + admin panel
08c1a7f  Switch from better-sqlite3 to sql.js (pure JS) — no native compile
36b750f  v2: Full social writing platform with 22 sections, 10 demo items each
c981e9a  Remove bycwf.org/CURHS reference dumps, Workbox/WordPress junk from working tree
f1c5c43  docs: Add comprehensive PROJECT.md (সেশন ৩ — এই ফাইলের পূর্বসূরি)
<এই কমিট>  Add moderator permission system, real file uploads, fix 7 critical bugs
<পরবর্তী>  Merge two independently-created PROJECT.md into one canonical doc
```

**কমিট করার নিয়ম:**
```bash
cd lekhok-forum
git add -A
git commit -m "feat|fix|docs: বর্ণনা"
git push origin main
```

**গিটইগনোর:** `lekhok.db`, `node_modules/`, `public/uploads/*` (শুধু `.gitkeep` কমিটেড)।
