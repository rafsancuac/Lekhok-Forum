# আর্কিটেকচার অডিট — টাস্ক ১৩ (পর্ব ৪): Moderator Panel ও কনটেন্ট ম্যানেজমেন্ট

তারিখ: ২০২৬-০৯-০৮

## ১. পোস্ট টাইপ ও single-image অবস্থা

| পোস্ট টাইপ | টেবিল | ইমেজ ফিল্ড | মডারেটর রুট | অ্যাডমিন রুট |
|---|---|---|---|---|
| Notice | `notices` | ❌ কোনো ইমেজ ফিল্ড নেই | `/moderator/notices` | `/admin/notices` |
| Event | `events` | `image_url` (single) | `/moderator/events` | `/admin/events` |
| Daily Content | `daily_content` | `image_url` (single) | `/moderator/daily/:type` | `/admin/daily` |
| News (পত্রিকায় নিউজ) | `press_clippings` | `image_url` NOT NULL (single) | `/moderator/press` | `/admin` (bulk) |
| Social Feed | `posts` (type='post') | `cover_image` (single) | — | — |
| User Feed | `posts` (type='article'/'question') | `cover_image` (single) | — | — |

- `gallery`, `achievements`, `members`, `resources`-ও single `image_url` (স্কোপের বাইরে, অপরিবর্তিত থাকবে)।

## ২. ইমেজ স্টোরেজ / সার্ভ

- **দ্বৈত-মোড** (`middleware/upload.js`): Vercel-এ `BLOB_READ_WRITE_TOKEN` সেট → `@vercel/blob` (cloud URL); লোকালে → `public/uploads/<subdir>` (ডিস্ক)।
- **অটো-অপ্টিমাইজ:** JPEG/PNG → WebP (sharp, 2000px cap, quality 82, EXIF rotate) — শুধু ছোট হলে swap।
- **রুট ইন্টারফেস:** `req.file.path / filename / url`।

## ৩. বিদ্যমান multi-আপলোড প্যাটার্ন (reuse-যোগ্য)

1. `makeUpload()` — single file (`req.file`), `UPLOAD_FIELDS` তালিকা দিয়ে `.fields()`।
2. `makeContentImageUpload()` — **একাধিক নামাঙ্কিত ফিল্ড** (`img_<key>` → `req.filesContent[key]`), কনটেন্ট এডিটরের জন্য (সেশন ৩৫)।
3. `storeBufferImage(file, subdir)` — রেডি buffer → URL (JSON আপলোড এন্ডপয়েন্টে ব্যবহৃত, সেশন ৩৬)।
4. JSON আপলোড এন্ডপয়েন্ট: `/admin/content/upload`, `/admin/upload-image` → `{ ok, url }`।

**সিদ্ধান্ত:** এক পোস্টে একাধিক ছবি (array) — এ রকম কোনো প্যাটার্ন এখনো **নেই**। তাই নতুন generic `multiImageUpload` middleware + JSON এন্ডপয়েন্ট যোগ করব, `storeBufferImage`/WebP-পাইপলাইন **reuse** করে।

## ৪. মাল্টি-ইমেজ ডেটা মডেল ডিজাইন

- নতুন generic টেবিল `post_images(entity_type, entity_id, image_url, sort_order, created_at)` — সব ৬ টাইপের জন্য এক টেবিল (প্রতি টাইপে আলাদা কলাম/টেবিল না বানিয়ে)। `sort_order` → reorder।
- Migration: বিদ্যমান single image (`events.image_url`, `daily_content.image_url`, `press_clippings.image_url`, `posts.cover_image`) → `post_images` (sort_order=0)।
- এন্টিটি টাইপ: `notice`, `event`, `daily`, `news`, `post` (post = Social Feed + User Feed, একই `posts` টেবিল)।

## ৫. পার্ট খ (section-wise save) — বর্তমান অবস্থা

- কনটেন্ট এডিটর `/admin/content` — পুরো পেজের ২৪১ ফিল্ড একসাথে POST (সেশন ৩৬-এর রেকর্ড)। সেকশন-ভিত্তিক আলাদা সেভ **নেই**।
- লক্ষ্য: প্রতি সেকশনে আলাদা Edit/Save + AJAX আংশিক আপডেট।

## ৬. পার্ট গ — বর্তমান অবস্থা

- মডারেটর প্যানেল ভিউ `views/user/moderator-*.ejs`; স্টাইল `public/assets/css/dashboard.css` (অ্যাডমিনের সাথে শেয়ার)।
- layout shift ও নিচের tick icon-এর অবস্থান বাস্তব-যাচাই সাপেক্ষে ঠিক করতে হবে।

## ব্যাকআপ

- মাল্টি-ইমেজ মাইগ্রেশনের আগে `members`-এর মতো সোর্স-টেবিলগুলোর single-image ডেটা মুছে ফেলা হয় না — শুধু কপি হয় (backward-compat: `image_url`/`cover_image` কলাম রয়ে যায়)। তাই ডেটা-লস ঝুঁকি নেই।
