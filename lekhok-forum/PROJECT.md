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

### মাল্টি-ফন্ট (`public/assets/css/fonts.css`)
Hind Siliguri, Tiro Bangla, SolaimanLipi (ডিফল্ট/CDN), Kalpurush, Times New Roman — body class দিয়ে টগল করার সিস্টেম বানানো আছে।

**⚠️ স্ট্যাটাস:** CSS ক্লাস সিস্টেম আছে ও ড্যাশবোর্ড/ইউজার পেজে যুক্ত, কিন্তু —
- পাবলিক পেজে (`layout.ejs`) এখনো যুক্ত হয়নি (শুধু SolaimanLipi)
- **কোনো UI টগল বাটনই নেই** — ইউজার এখনো ফন্ট বদলাতে পারে না, শুধু ভিত্তি বানানো আছে

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
- **role পরিবর্তন সেশনে রিফ্রেশ হয় না** — এডমিন কাউকে মডারেটর বানালে সেই ইউজারকে আবার লগইন করতে হবে নতুন পারমিশন কার্যকর করতে
- ~~ফন্ট টগল UI বাটন নেই~~ — ✅ settings-এ ৭+ বাংলা ফন্ট-সিলেক্টর (সাম্প্রতিক কমিট, সেশন ৭-এ যাচাইকৃত)
- CURHS-স্টাইল nav গ্রুপিং, sticky+shrink header, hero ক্যারোসেল, সার্চ — এখনো implement হয়নি (§১৩ দেখুন)
- v1 স্ট্যাটিক সাইট (repo root-এর index.html ইত্যাদি) রাখা হবে নাকি সরানো হবে — সিদ্ধান্ত বাকি
- `bcrypt` হ্যাশ synchronous — রেজিস্ট্রেশনে সাময়িক ইভেন্ট-লুপ ব্লক করে (ছোট স্কেলে সমস্যা না, বড় হলে async ভার্সন ব্যবহার করা ভালো)
- **গ্লোবাল সার্চ (`/search?q=`) এখনো নেই** — এখন শুধু `/api/users/search` (মেসেঞ্জার/শেয়ার-মোডালের জন্য) আছে

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
- [ ] গ্লোবাল সার্চ (`/search?q=` — posts + members + daily_content)
- [ ] role পরিবর্তনের পর সেশন অটো-রিফ্রেশ (এখন লগআউট/লগইন লাগে)
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
