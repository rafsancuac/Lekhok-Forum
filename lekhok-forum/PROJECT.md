# লেখক ফোরাম — সম্পূর্ণ প্রজেক্ট ডকুমেন্টেশন

> **সংস্করণ:** v2.0 (সোশ্যাল প্ল্যাটফর্ম) · **শেষ হালনাগাদ:** ৩ সেপ্টেম্বর ২০২৬
> **রিপোজিটরি:** https://github.com/rafsancuac/Lekhok-Forum.git

---

## সূচিপত্র

1. [প্রজেক্ট পরিচিতি](#১-প্রজেক্ট-পরিচিতি)
2. [টেকনোলজি স্ট্যাক](#২-টেকনোলজি-স্ট্যাক)
3. [কীভাবে চালাবেন](#৩-কীভাবে-চালাবেন)
4. [ফাইল স্ট্রাকচার](#৪-ফাইল-স্ট্রাকচার)
5. [ডাটাবেজ স্কিমা](#৫-ডাটাবেজ-স্কিমা)
6. [রাউট ম্যাপ](#৬-রাউট-ম্যাপ)
7. [ডেমো অ্যাকাউন্ট ও সিড ডাটা](#৭-ডেমো-অ্যাকাউন্ট-ও-সিড-ডাটা)
8. [ডিজাইন সিস্টেম](#৮-ডিজাইন-সিস্টেম)
9. [বর্তমান অবস্থা — কী কী হয়েছে](#৯-বর্তমান-অবস্থা--কী-কী-হয়েছে)
10. [পরিচিত বাগ (Known Issues)](#১০-পরিচিত-বাগ-known-issues)
11. [রেফারেন্স সাইট থেকে নেওয়া আইডিয়া](#১১-রেফারেন্স-সাইট-থেকে-নেওয়া-আইডিয়া)
12. [ইম্প্রুভমেন্ট রোডম্যাপ](#১২-ইম্প্রুভমেন্ট-রোডম্যাপ)
13. [ডিপ্লয়মেন্ট গাইড](#১৩-ডিপ্লয়মেন্ট-গাইড)
14. [গিট হিস্ট্রি](#১৪-গিট-হিস্ট্রি)

---

## ১. প্রজেক্ট পরিচিতি

**লেখক ফোরাম** একটি সম্পূর্ণ বাংলা ভাষার সোশ্যাল রাইটিং প্ল্যাটফর্ম — যেখানে লেখকরা নিবন্ধন করে লেখা প্রকাশ করতে পারেন, প্রশ্ন করতে পারেন, একে-অপরের সাথে মেসেজ করতে পারেন, আর মডারেটররা প্রতিদিনের কনটেন্ট (কুইজ, ই-পেপার, এই দিনে) পরিচালনা করতে পারেন।

**মূল ফিচার সেট (২২+ সেকশন):**

| ক্যাটাগরি | ফিচার |
|---|---|
| **সোশ্যাল** | ইউজার অ্যাকাউন্ট, প্রোফাইল, লেখা (আর্টিকেল), প্রশ্নোত্তর, লাইক, কমেন্ট, বুকমার্ক, ফলো, @মেনশন, #হ্যাশট্যাগ |
| **মেসেজিং** | মেসেঞ্জার-স্টাইল ডাইরেক্ট মেসেজ, ফাইল অ্যাটাচমেন্ট (DB ফিল্ড আছে, আপলোড বাকি) |
| **ডেইলি কনটেন্ট** | আজকের কুইজ, এই দিনে, ই-পেপার, সাংগঠনিক কার্যক্রম, মাসিক সেরা লেখক |
| **ফেসবুক-স্টাইল ফিড** | ড্যাশবোর্ডে সবার পোস্ট এক জায়গায়, কমেন্ট/মতামত দেওয়ার সুবিধা |
| **প্রাইভেসি** | প্রাইভেট অভিযোগ পেজ (শুধু অ্যাডমিন/মডারেটর দেখেন), প্রোফাইল প্রাইভেসি কন্ট্রোল |
| **সংগঠন** | রানিং কমিটি, সাবেক সভাপতি/সাধারণ সম্পাদক, উপদেষ্টা পর্ষদ, গঠনতন্ত্র, অর্জন, গ্যালারি |
| **নোটিফিকেশন** | বেল আইকন, ৩০ সেকেন্ড পোলিং, জন্মদিন শুভেচ্ছা, লাইক/কমেন্ট/ফলো/মেসেজ অ্যালার্ট |
| **অ্যাডমিন** | নোটিশ/ইভেন্ট/মেম্বার/গ্যালারি/রিসোর্স/সেটিংস CRUD প্যানেল |

---

## ২. টেকনোলজি স্ট্যাক

| লেয়ার | টেকনোলজি | কেন |
|---|---|---|
| রানটাইম | Node.js v24 | — |
| ফ্রেমওয়ার্ক | Express.js | সরল, মিনিমাল |
| টেমপ্লেট | EJS + express-ejs-layouts | সার্ভার-সাইড রেন্ডারিং |
| ডাটাবেজ | **sql.js** (WebAssembly SQLite) | better-sqlite3-এর বদলে — নেটিভ কম্পাইল লাগে না, যেকোনো হোস্টে চলে |
| অথ | express-session + bcryptjs | সেশন-ভিত্তিক, পাসওয়ার্ড হ্যাশ |
| ফর্ম | methodOverride | HTML ফর্ম থেকে PUT/DELETE |
| ফন্ট | SolaimanLipi (CDN), Hind Siliguri, Tiro Bangla, Noto Serif Bengali, Kalpurush | মাল্টি-ফন্ট সিস্টেম |
| আইকন | Font Awesome 6.5.1 | — |
| ভার্সন কন্ট্রোল | Git + GitHub | `rafsancuac/Lekhok-Forum` |

### sql.js-এর গুরুত্বপূর্ণ বৈশিষ্ট্য

`db.js`-এ `wrapStmt()` হেল্পার sql.js-কে better-sqlite3-এর মতো API-তে রূপান্তর করে:

```js
db.prepare('SELECT ...').get(param)   // এক রো
db.prepare('SELECT ...').all(param)   // সব রো
db.prepare('INSERT ...').run(params)  // রাইট + অটো-সেভ
```

**সতর্কতা:**
- `stmt.bind()` **undefined ভ্যালু রিজেক্ট করে** — সব প্যারামিটারে `|| null` ব্যবহার করুন
- প্রতি `run()`-এর পর ২০০ms debounce করে ডিস্কে সেভ হয় (`persist()`)
- `run()` রিটার্ন করে `{ changes }` — **`lastInsertRowid` নেই** (বাগ #১ দেখুন)

---

## ৩. কীভাবে চালাবেন

```bash
cd "F:\Lekhok Forum\lekhok-forum"
npm install          # প্রথমবার
node server.js       # http://localhost:8080
```

- **সাইট:** http://localhost:8080
- **অ্যাডমিন প্যানেল:** http://localhost:8080/admin → `admin` / `admin123`
- **ডেমো ইউজার:** `amin` / `sadia` / `mahmud` / `farzana` / `naim` → পাসওয়ার্ড `demo123`
- পোর্ট বদলাতে: `PORT=3000 node server.js` (Windows PowerShell: `$env:PORT=3000`)
- ডাটাবেজ রিসেট: `lekhok.db` ফাইল ডিলিট করে সার্ভার রিস্টার্ট — সিড অটো চলবে

**প্রোডাকশন সিক্রেট:** `SESSION_SECRET` এনভায়রনমেন্ট ভ্যারিয়েবল সেট করুন (server.js:26 এ ডিফল্ট হার্ডকোডেড আছে)।

---

## ৪. ফাইল স্ট্রাকচার

```
lekhok-forum/
├── server.js              # Express অ্যাপ, মিডলওয়্যার, রাউট মাউন্ট (৮০ লাইন)
├── db.js                  # sql.js ইনিট + ২০টা টেবিল মাইগ্রেশন + সিড (৬৪৩ লাইন)
├── package.json
│
├── routes/
│   ├── auth.js            # /login /register /logout /profile/edit (৮৪ লাইন)
│   ├── social.js          # articles, questions, members, profile, like/comment/follow API (৩৯০ লাইন)
│   ├── daily.js           # quiz, on-this-day, epaper, activities, best-writer, birthdays (১০৩ লাইন)
│   ├── dashboard.js       # ফেসবুক-ফিড, gallery, messages, complaints (১৪৩ লাইন)
│   ├── pages.js           # about, committee, contact, notices, events, home (১১৮ লাইন)
│   ├── api.js             # JSON API: notifications count ইত্যাদি (৫৮ লাইন)
│   └── avatar.js          # /avatar/:id — জেন্ডার-ভিত্তিক ডিফল্ট SVG
│
├── admin/
│   ├── routes.js          # অ্যাডমিন CRUD: notices/events/members/gallery/resources/settings (২৪১ লাইন)
│   └── views/admin/       # dashboard, sidebar, সব ফর্ম/লিস্ট ভিউ
│
├── views/
│   ├── partials/          # header (topbar+navbar+bell), footer, daily-card ইত্যাদি (১০টা)
│   ├── user/              # ২৫টা ইউজার-ফেসিং পেজ (dashboard, articles, messages-chat...)
│   ├── lekhok-*.ejs       # v1-এর ৯টা পেজ (home, about, committee, contact...)
│   ├── layout.ejs, 404.ejs
│
├── public/assets/
│   ├── css/               # style, fonts, feed, dashboard, profile, auth, admin
│   ├── js/main.js
│   └── avatars/           # male.svg, female.svg, neutral.svg
│
├── lekhok.db              # SQLite ফাইল (gitignored)
└── test_bind.js, test_seed.js  # ডিবাগ স্ক্রিপ্ট (কমিট করা হয়নি)
```

---

## ৫. ডাটাবেজ স্কিমা

**মোট ২০টা টেবিল** (db.js-এ `runMigrations()`):

### v1 টেবিল (৮টা)
| টেবিল | কাজ |
|---|---|
| `admin_users` | অ্যাডমিন লগইন (admin/admin123) |
| `notices` | বিজ্ঞপ্তি (title, content, category, date) |
| `events` | ইভেন্ট (date, end_date, location, image_url, featured) |
| `members` | কমিটি সদস্য + উপদেষ্টা (member_type: central/branch/advisory) |
| `resources` | ফাইল/রিসোর্স (title, content, category, author, tags) |
| `settings` | সাইট সেটিংস key-value (site_name, tagline, contact...) |
| `contact_submissions` | যোগাযোগ ফর্ম |

### v2 সোশ্যাল টেবিল (১২টা)
| টেবিল | কাজ | গুরুত্বপূর্ণ কলাম |
|---|---|---|
| `users` | ইউজার অ্যাকাউন্ট | username, password_hash, full_name, gender, birth_date, show_email/phone/birth (প্রাইভেসি), avatar_url, status |
| `moderators` | মডারেটর তালিকা | user_id, added_by, permissions |
| `posts` | আর্টিকেল + প্রশ্ন | author_id, **type** ('article'/'question'), tags, category, status, featured, view/like/comment_count |
| `comments` | কমেন্ট (নেস্টেড) | post_id, author_id, parent_id |
| `likes` | লাইক | post_id বা comment_id, user_id |
| `bookmarks` | সংরক্ষণ | user_id, post_id |
| `follows` | ফলো | follower_id, following_id |
| `daily_content` | ডেইলি কনটেন্ট | content_type (quiz/this_day/epaper/activity), scheduled_date, published |
| `notifications` | নোটিফিকেশন | user_id, type, link, is_read |
| `conversations` + `messages` | DM | user_a, user_b / sender_id, body, file_url, file_name, is_read |
| `complaints` | প্রাইভেট অভিযোগ | submitted_by, subject, file_url, status, assigned_to, admin_notes |
| `moderator_scopes` | সেকশন-ভিত্তিক পারমিশন | user_id, scope, granted_by |
| `gallery` | ছবি + ক্যাপশন | title, caption, image_url, category |
| `achievements` | অর্জন | title, recipient_name, year |
| `past_leaders` | সাবেক নেতৃত্ব | role (president/general_secretary), term_start/end |
| `constitution` | গঠনতন্ত্র ধারা | section_title, content, sort_order |

**সিড শর্ত:** `admin_users > 0 AND gallery > 0` হলে সিড স্কিপ হয় — অর্থাৎ ডাটা থাকলে আর ঢুকায় না।

---

## ৬. রাউট ম্যাপ

### পাবলিক পেজ (লগইন ছাড়া)
| রাউট | ভিউ | কী |
|---|---|---|
| `/` | lekhok-home | হিরো + সব সেকশনের কার্ড |
| `/articles`, `/articles/:id` | articles, article-single | ট্যাগ/লেখক/featured ফিল্টার |
| `/qa`, `/questions/:id` | qa-list, qa-single | প্রশ্নোত্তর |
| `/members` | members | সদস্য ডিরেক্টরি |
| `/profile/:username` | profile | পাবলিক প্রোফাইল (প্রাইভেসি ফ্ল্যাগ মানে) |
| `/quiz` `/on-this-day` `/epaper` `/activities` | user/* | আজকেরটা + আর্কাইভ |
| `/best-writer` `/achievements` `/constitution` | user/* | featured পোস্ট, অর্জন, ধারা |
| `/committee` `/committee/past` `/committee/advisory` | — | বর্তমান/সাবেক/উপদেষ্টা |
| `/gallery` `/birthdays` `/notices` `/events` `/resources` `/about` `/contact` | — | বাকি সেকশন |
| `/avatar/:id` | — | জেন্ডার-ভিত্তিক SVG |

### লগইন-লাগবে (302 → /login)
| রাউট | কী |
|---|---|
| `/dashboard` | ফেসবুক-স্টাইল ফিড (articles + activities UNION) |
| `/messages`, `/messages/:username` | মেসেঞ্জার UI, অটো conversation তৈরি, read-marking |
| `/complaints` | নিজের অভিযোগের তালিকা + জমা ফর্ম |
| `/articles/new` `/questions/new` `/profile/edit` `/notifications` | ফর্ম ও তালিকা |

### JSON API (`/api`)
| রাউট | কী |
|---|---|
| `/api/notifications/count` | বেল ব্যাজ পোলিং (৩০ সেকেন্ড) |
| like/comment/follow/bookmark POST | social.js-এ (fetch দিয়ে) |

### অ্যাডমিন (`/admin`, session-guarded)
notices / events / members / gallery / resources — সম্পূর্ণ CRUD (new/edit/delete) + settings + messages ভিউ।

---

## ৭. ডেমো অ্যাকাউন্ট ও সিড ডাটা

### ডেমো ইউজার (পাসওয়ার্ড: `demo123`)
| ইউজারনেম | নাম |
|---|---|
| amin | মো. রুহুল আমিন |
| sadia | সাইশা সুলতানা সাদিয়া |
| mahmud | আবদুল্লাহ আল মাহমুদ |
| farzana | ফারজানা আক্তার |
| naim | নাঈম হোসেন |

### সিড কাউন্ট (যাচাইকৃত)
| টেবিল | সংখ্যা | বিস্তারিত |
|---|---|---|
| gallery | 10 | events/workshops/meetings/awards ক্যাটাগরি |
| posts | 20 | 10 আর্টিকেল + 10 প্রশ্ন (প্রথম ৩টা featured) |
| daily_content | 40 | প্রতি টাইপে 10 (quiz, this_day, activity, epaper) |
| achievements | 10 | — |
| past_leaders | 10 | 5 সভাপতি + 5 সাধারণ সম্পাদক |
| constitution | 10 | ১০টা ধারা |
| members | 16 | 6 কমিটি + 10 উপদেষ্টা |
| resources | 14 | — |
| notices | 6, events | 4 |

কুইজের `image_url` ইচ্ছাকৃত `null` — লিংক-ভিত্তিক কুইজ।

---

## ৮. ডিজাইন সিস্টেম

### মাল্টি-ফন্ট (`public/assets/css/fonts.css`)
| ফন্ট | ব্যবহার |
|---|---|
| **SolaimanLipi** | ডিফল্ট বডি (CDN: cdn.jsdelivr.net/gh/maateen/font-solaimanlipi) |
| Hind Siliguri | UI টেক্সট |
| Tiro Bangla | সাহিত্যিক/সেরিফ কনটেন্ট |
| Noto Serif Bengali | হেডলাইন |
| Kalpurush | বিকল্প |

### রঙ
- প্রাইমারি: সাইটের নিজস্ব প্যালেট (style.css)
- লাইক-রেড, বুকমার্ক-অ্যাম্বার, নোটিফ-রেড ব্যাজ

### UI কম্পোনেন্ট
- **Topbar:** ব্র্যান্ড + নোটিফ বেল (ড্রপডাউন, unread ব্যাজ) + ইউজার মেনু
- **Navbar:** ১৭টা সেকশন লিংক + মোবাইল হ্যামবার্গার
- **ফিড কার্ড:** অ্যাভাটার + লেখকবার + বডি + লাইক/কমেন্ট/শেয়ার অ্যাকশন
- **ডিফল্ট অ্যাভাটার:** ৩টা ইনলাইন SVG (male/female/neutral) — কোনো এক্সটার্নাল সার্ভিস নেই, ব্রোকেন ইমেজ হয় না

---

## ৯. বর্তমান অবস্থা — কী কী হয়েছে

### ✅ সম্পন্ন (v1 → v2)

**v1 (কমিট c454aa2):** স্ট্যাটিক ৮-পেজ সাইট + অ্যাডমিন প্যানেল + better-sqlite3।

**sql.js মাইগ্রেশন (কমিট 08c1a7f):** নেটিভ কম্পাইল সমস্যার কারণে better-sqlite3 → sql.js; `wrapStmt` অ্যাডাপ্টার লেখা হয়।

**v2 সোশ্যাল প্ল্যাটফর্ম (কমিট 36b750f):**
- ১২টা নতুন টেবিল + ইউজার অথেন্টিকেশন (bcrypt + session)
- আর্টিকেল/প্রশ্ন পোস্টিং, কমেন্ট, লাইক, বুকমার্ক, ফলো
- @মেনশন + #হ্যাশট্যাগ অটো-লিংকিফাই (`linkify()` in social.js)
- মেসেঞ্জার-স্টাইল DM — conversation অটো-তৈরি, unread কাউন্ট, নোটিফিকেশন
- ফেসবুক-স্টাইল ড্যাশবোর্ড ফিড (articles + activities UNION query)
- ডেইলি কনটেন্ট সিস্টেম (scheduled_date-ভিত্তিক অটো-ডিসপ্লে)
- জন্মদিন পেজ (আজকের + আসন্ন, show_birth প্রাইভেসি মানে)
- প্রাইভেট অভিযোগ ব্যবস্থা
- নোটিফিকেশন বেল + ৩০s পোলিং
- ১০ ডেমো আইটেম/সেকশন সিড — ডিজাইন রেফারেন্সের জন্য

**db.js সিনট্যাক্স-ফিক্স:** ডিবাগ-লগ ক্লিনআপের সময় পড়ে থাকা orphan কোড (`);` ফ্র্যাগমেন্ট) পরিষ্কার করা হয়েছে; এখন সব রাউট 200 দেয়।

### 🔄 আংশিক / শুরু হয়েছে
- ফাইল অ্যাটাচমেন্ট: `messages` ও `complaints` টেবিলে `file_url`/`file_name` কলাম **আছে**, ফর্মে টেক্সট ইনপুট আছে, কিন্তু **multer আপলোড নেই**
- `moderators` + `moderator_scopes` টেবিল আছে, অ্যাডমিন UI **নেই**
- `broadcastToAll()` হেল্পার লেখা আছে (dashboard.js), কিন্তু মডারেটর-পোস্টে **কল হয় না**

---

## ১০. পরিচিত বাগ (Known Issues)

> ⚠️ এই ৩টা বাগ এখন লাইভ কোডে আছে — পরবর্তী কমিটে ফিক্স করা উচিত।

### বাগ #১: `lastInsertRowid` সবসময় undefined
**কোথায়:** `db.js` wrapStmt-এর `run()` শুধু `{ changes }` ফেরত দেয়।
**প্রভাব:**
- `routes/auth.js:51` — রেজিস্ট্রেশনের পর সেশনে `user.id = undefined`
- `routes/social.js:62` — আর্টিকেল পোস্টের পর `/articles/undefined`-এ যায়
- `routes/social.js:200` — প্রশ্ন পোস্টের পর `/qa/undefined`
- `routes/dashboard.js:72` — নতুন conversation খোঁজে ব্যর্থ

**ফিক্স:** db.js-এর `run()`-এ step()-এর পর:
```js
const rowid = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
return { changes: db.getRowsModified(), lastInsertRowid: rowid };
```

### বাগ #২: `users` টেবিলে `role` কলাম নেই
**প্রভাব:**
- `routes/dashboard.js:127` — `WHERE role = 'admin'` → **অভিযোগ জমা দিলে SQL error**
- `views/partials/header.ejs:60` — `user.role` কখনো সেট হয় না → অ্যাডমিন প্যানেল লিংক দেখায় না

**ফিক্স:** মাইগ্রেশনে যোগ করুন:
```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
```
তারপর ইচ্ছায় `UPDATE users SET role='moderator' WHERE username IN ('amin','sadia')`।

### বাগ #৩: `complaints` টেবিলে `file_name` কলাম নেই
`routes/dashboard.js:124` — `INSERT INTO complaints (..., file_name)` → **অভিযোগ জমা ক্র্যাশ করে** (বাগ #২-ও একই রাউটে)।
**ফিক্স:** `ALTER TABLE complaints ADD COLUMN file_name TEXT;` অথবা INSERT থেকে file_name বাদ দিন।

### ছোটখাটো
- `views/lekhok-*.ejs` (v1 পেজ) আর `views/user/` পেজের মধ্যে হেডার/নেভ ডুপ্লিকেশন আছে
- navbar-এ `/dashboard` `/gallery` `/messages` `/complaints` লিংক এখনো নেই (topbar ইউজার-মেনুতেও নেই — শুধু বুকমার্ক/সেটিংস আছে)
- `bcrypt` হ্যাশ CPU-ইনটেনসিভ — রেজিস্ট্রেশন সাময়িক ব্লক করে (async version ব্যবহার করা যায়)

---

## ১১. রেফারেন্স সাইট থেকে নেওয়া আইডিয়া

> আপনি যেসব সাইটের ফাইল শেয়ার করেছিলেন (bycwf.org এক্সট্র্যাক্ট, CURHS/curhs.org এক্সট্র্যাক্ট) — সেগুলো **আইডিয়ার উৎস**, কপি করার জন্য নয়। নিচে কী নেওয়া হয়েছে আর কী নেওয়া যায়:

### CURHS (curhs.org) থেকে ইতিমধ্যে অনুপ্রাণিত
CURHS ব্লকসি থিম + এলিমেন্টরে বানানো — পরিচ্ছন্ন, প্রফেশনাল লুক:

| CURHS এলিমেন্ট | লেখক ফোরামে অবস্থা |
|---|---|
| Sticky header (স্ক্রলে shrink হয়) | ❌ চ্যালেঞ্জ হিসেবে রাখা যায় |
| Dropdown nav (About → History/Board/Members) | ❌ ১৭টা লিংক সমতলে আছে — গ্রুপিং দরকার |
| Search modal (লাইভ রেজাল্ট + থাম্বনেইল) | ❌ সার্চ নেই |
| Mobile offcanvas drawer | ⚠️ সাধারণ টগল আছে, drawer নয় |
| Back-to-top বাটন | ❌ নেই |
| Hero-তে recognition ব্যাজ | ❌ নেই |
| ইভেন্ট ক্যারোসেল (Swiper) | ❌ স্ট্যাটিক কার্ড |
| Preloader | ❌ (দরকার নেই-ই বলা যায়, সার্ভার-রেন্ডার দ্রুত) |
| Facebook/LinkedIn সোশ্যাল আইকন হেডারে | ⚠️ ফুটারে আছে |
| Poppins ফন্ট (Latin) | বাংলা SolaimanLipi ব্যবহৃত — সঠিক সিদ্ধান্ত |

### ইম্প্লিমেন্ট করার প্রস্তাবনা (CURHS-স্টাইল)
```css
/* 1. Sticky + shrink topbar */
.topbar { position: sticky; top: 0; z-index: 100; transition: padding .3s; }
.topbar.shrunk { padding-block: 4px; box-shadow: 0 2px 12px rgba(0,0,0,.1); }
/* JS: scroll > 60px হলে .shrunk যোগ */

/* 2. Back-to-top */
<a href="#top" class="back-to-top"><i class="fas fa-arrow-up"></i></a>
```

3. **Nav গ্রুপিং:** ১৭ লিংক → ৫-৬টা ড্রপডাউনে:
   - সাহিত্য (লেখা, প্রশ্নোত্তর, সেরা লেখক)
   - দৈনিক (কুইজ, এই দিনে, ই-পেপার, কার্যক্রম)
   - সংগঠন (কমিটি, সাবেক, উপদেষ্টা, গঠনতন্ত্র, অর্জন)
   - মিডিয়া (গ্যালারি, নোটিশ, ইভেন্ট, ফাইল)
   - আমাদের সম্পর্কে (পরিচিতি, যোগাযোগ, সদস্য)

4. **সার্চ:** `/search?q=` রাউট — posts + members + daily_content জুড়ে LIKE কোয়েরি।

---

## ১২. ইম্প্রুভমেন্ট রোডম্যাপ

### দ্রুত করণীয় (বাগ ফিক্স) — ~১ ঘণ্টা
- [ ] **বাগ #১/#২/#৩ ফিক্স** (উপরে বর্ণিত) — রেজিস্ট্রেশন, পোস্ট, অভিযোগ এখন ভাঙা
- [ ] Topbar/নেভবারে ড্যাশবোর্ড, গ্যালারি, মেসেজ, অভিযোগ লিংক

### শর্ট টার্ম (১-২ সপ্তাহ)
- [ ] **multer ফাইল আপলোড** — মেসেজ অ্যাটাচমেন্ট + অভিযোগ অ্যাটাচমেন্ট + অ্যাভাটার/কভার আপলোড (`public/uploads/`, max 5MB, ফাইলনেম = timestamp)
- [ ] **মডারেটর ব্রডকাস্ট** — daily_content পাবলিশ হলে `broadcastToAll()` কল → সব ইউজারের বেলে নোটিফ
- [ ] **অ্যাডমিন: অভিযোগ ম্যানেজমেন্ট** — `/admin/complaints`: তালিকা, status (new→in_review→resolved), admin_notes
- [ ] **অ্যাডমিন: ডেইলি কনটেন্ট প্যানেল** — কুইজ/ই-পেপার/এই দিনে যোগ-সম্পাদনা (scheduled_date পিকার)
- [ ] **অ্যাডমিন: মডারেটর ম্যানেজমেন্ট** — ইউজার→মডারেটর বানানো, moderator_scopes-এ সেকশন পারমিশন (quiz/epaper/moderation...)
- [ ] CURHS-স্টাইল nav গ্রুপিং + sticky header + back-to-top
- [ ] গ্লোবাল সার্চ

### মিড টার্ম (১-২ মাস)
- [ ] **WhatsApp/ইমেইল ইন্টিগ্রেশন** — ব্রডকাস্ট নোটিফ + WhatsApp Cloud API / Nodemailer (মডারেটর পোস্টে সবাইকে জানানো)
- [ ] রিচ টেক্সট এডিটর (লেখা লেখার ফর্মে) — TinyMCE/Quill, বাংলা ইনপুট সাপোর্ট
- [ ] পোস্ট মডারেশন: hide/report সিস্টেম, মডারেটর approve-queue
- [ ] ছবি অপটিমাইজেশন (sharp) — কভার/গ্যালারি রিসাইজ
- [ ] RSS/OG meta — শেয়ার করলে সুন্দর প্রিভিউ (og:image, og:title প্রতি পেজে)
- [ ] ই-মেইল ভেরিফিকেশন রেজিস্ট্রেশনে

### লং টার্ম
- [ ] PostgreSQL-এ মাইগ্রেশন (বড় স্কেলে), S3-কম্প্যাটিবল ফাইল স্টোরেজ
- [ ] PWA (অফলাইন রিডিং) — bycwf রেফারেন্সে workbox ফাইলগুলো এজন্যই শেয়ার করা হয়েছিল
- [ ] মোবাইল অ্যাপ (React Native রিওয়্যাজ়) — একই API
- [ ] মাসিক সেরা লেখক ভোটিং সিস্টেম
- [ ] অ্যানালিটিক্স ড্যাশবোর্ড (অ্যাডমিনে) — জনপ্রিয় লেখা, অ্যাক্টিভ ইউজার

---

## ১৩. ডিপ্লয়মেন্ট গাইড

### লোকাল রান — এভাবেই চলবে
`node server.js` — একটাও সমস্যা নেই। sql.js-এর কারণে কোনো নেটিভ মডিউল কম্পাইল লাগে না।

### প্রোডাকশন — Vercel নয়, Node হোস্ট
**Vercel কেন যাবে না:** সার্ভারলেস মডেল — প্রতি রিকোয়েস্টে নতুন কোল্ড ইনস্ট্যান্স, ফাইলসিস্টেম ইফেমেরাল (lekhok.db মুছে যায়), সেশন স্টেটলেস।

**রেকমেন্ডেশন (ক্রমানুসারে):**

| হোস্ট | কেন | খরচ |
|---|---|---|
| **Railway** | পার্সিস্টেন্ট ডিস্ক + Git push ডিপ্লয়, শূন্য কনফিগ | ফ্রি টায়ার আছে |
| **Render** | সহজ Node ডিপ্লয়, ফ্রি টিয়ার (কোল্ড স্টার্ট আছে) | ফ্রি |
| **Fly.io** | ভলিউম + গ্লোবাল এজ, SQLite-এর জন্য দুর্দান্ত | ফ্রি টিয়ার |
| **VPS (DigitalOcean)** | সম্পূর্ণ নিয়ন্ত্রণ + PM2 | $৪/মাস |

**Railway-তে ডিপ্লয় ধাপ:**
1. GitHub রিপো কানেক্ট করুন
2. ভ্যারিয়েবল সেট: `SESSION_SECRET=<লম্বা র‍্যান্ডম স্ট্রিং>`
3. স্টার্ট কমান্ড: `node server.js`
4. ভলিউম মাউন্ট: `/app` — lekhok.db পার্সিস্ট করবে
5. প্রথম ডিপ্লয়ে অ্যাডমিন পাস এখনই বদলান: `/admin` → settings

⚠️ **প্রোডাকশনে যাওয়ার আগে অবশ্যই:** ডিফল্ট পাসওয়ার্ড বদলান, SESSION_SECRET সেট করুন, HTTPS নিশ্চিত করুন।

---

## ১৪. গিট হিস্ট্রি

```
36b750f  v2: Full social writing platform with 22 sections, 10 demo items each
08c1a7f  Switch from better-sqlite3 to sql.js (pure JS) — no native compile
c454aa2  Build full-stack lekhok-forum app: Node.js + Express + SQLite + EJS + admin panel
b59f049  Remove all bycwf.org and old-name references from site
aabd0dc  Add CURHS folder (curhs.org reference extracts)
a28deb1  Final rebrand
```

**কমিট করার নিয়ম:**
```bash
cd "F:/Lekhok Forum/lekhok-forum"
git add -A                          # বা নির্দিষ্ট ফাইল
git commit -m "feat|fix|docs: বর্ণনা"
git push origin main
```

**গিটইগনর:** `lekhok.db`, `node_modules/` — DB ফাইল রিমোটে যায় না (ডেমো ডাটা প্রতি ইনস্টলে seed থেকে আসে)।

**নোট:** `test_bind.js`, `test_seed.js` ডিবাগ ফাইল — ইচ্ছা করলে ডিলিট করুন।

---

## পরবর্তী কাজের অগ্রাধিকার (সারসংক্ষেপ)

1. 🔴 **বাগ #১-৩ ফিক্স** — এখনই (রেজিস্ট্রেশন/পোস্ট/অভিযোগ ভাঙা)
2. 🟠 multer আপলোড + মডারেটর ব্রডকাস্ট + অ্যাডমিন অভিযোগ প্যানেল
3. 🟡 CURHS-স্টাইল nav গ্রুপিং, sticky header, সার্চ
4. 🟢 WhatsApp/ইমেইল ইন্টিগ্রেশন, রিচ টেক্সট এডিটর
5. ⵔ Railway-তে প্রোডাকশন ডিপ্লয়

*এই ডকুমেন্ট প্রতি বড় পরিবর্তনের পর হালনাগাদ করুন।*
