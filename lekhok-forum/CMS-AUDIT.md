# CMS-গ্রেড অ্যাডমিন প্যানেল — বিদ্যমান ফিচার অডিট (সেশন ৪৯)

> টাস্ক ৬-এর বাধ্যতামূলক প্রথম ধাপ: নতুন কিছু বানানোর আগে বিদ্যমান কোডবেসে কী আছে তার তালিকা।
> কিংবদন্তি: ✅ আছে · 🟡 আংশিক আছে · ❌ নেই

---

## ১. ডাইনামিক নেভিগেশন — 🟡 আংশিক

| সক্ষমতা | অবস্থা | প্রমাণ (ফাইল/রুট) |
|---|---|---|
| মেনু/সাবমেনু তৈরি ও মুছা | ✅ | `admin/routes.js` `GET/POST /admin/navigation`; `public/assets/js/nav-editor.js` (addItem/addChild/removeItem/removeChild) |
| লেবেল/লিংক/আইকন এডিট | ✅ | `nav-editor.js` — প্রতি আইটেমে label/href/icon ইনপুট |
| স্টোরেজ ও লাইভ রিফ্লেকশন | ✅ | `settings` টেবিল key `nav_json`; `helpers/nav.js` `parseNav()`; হেডার+মোবাইল সাইডবার এখান থেকেই রেন্ডার |
| স্যানিটাইজেশন + ডিফল্ট ফলব্যাক | ✅ | `helpers/nav.js` `sanitizeNav()`/`validateNavJson()`/`DEFAULT_NAV` (সাইট কখনো মেনু হারায় না) |
| ডিফল্টে রিসেট | ✅ | `POST /admin/navigation` (reset) |
| মডারেটর-প্যানেল এডিটর | ✅ | `views/user/moderator-navigation.ejs` |
| **রি-অর্ডার (drag-and-drop / priority)** | ❌ | `nav-editor.js`-এ কোনো up/down/drag নেই; ডেটা-মডেলে `priority`/`sort_order` নেই |
| **enable/disable (আইটেম লুকানো)** | ❌ | ডেটা-মডেলে `enabled` ফিল্ড নেই; `sanitizeNav()` তা বাদ দেয় |

**গ্যাপ:** রি-অর্ডার + enable/disable। এই দুটিই টাস্কের এক্সপ্লিসিট চাহিদা।

---

## ২. পেজ কনটেন্ট ম্যানেজমেন্ট — 🟡 আংশিক (SEO ফিল্ড নেই)

| সক্ষমতা | অবস্থা | প্রমাণ |
|---|---|---|
| প্রতি পেজের টাইটেল/টেক্সট/কার্ড/বাটন এডিট | ✅ | `helpers/content-registry.js` — **১৪টি পেজ** (home, about, contact, committee, advisory, members, team, notices, events, gallery, resources, articles, press, layout/header-footer), **১৬১ ডিফল্ট key** |
| অ্যাডমিন UI (ট্যাব-ভিত্তিক এডিটর) | ✅ | `admin/views/admin/content.ejs` + `GET/POST /admin/content` (requireAdmin) |
| ফিল্ড টাইপ | ✅ | text, textarea, number, icon, **image** (আপলোড+রিসেট-টু-ডিফল্ট) |
| ডিফল্ট ফলব্যাক (সাইট খালি হয় না) | ✅ | `content-registry.DEFAULTS` + `C()`/`Cbr()` হেল্পার |
| রিভিশন হিস্ট্রি + রিস্টোর | ✅ | `content_revisions` (শেষ ১০); `GET /admin/content/history`, `POST /admin/content/restore` |
| সেকশন-আইটেম CRUD (সাইট_আইটেমস) | ✅ | `admin/routes.js` `/admin/sections/*` — add/save/undo/**reorder**/toggle/**move up-down**/delete (home_faq, contact_channels/university/transport) |
| ব্যানার/ইমেজ ফিল্ড | ✅ | hero_banner, feed_banner ইত্যাদি `type:'image'` |
| **SEO ফিল্ড (meta title/description) প্রতি পেজে** | ❌ | `content-registry.js`-এ কোনো meta/description field নেই; `header.ejs` `title`/`metaDesc`/`ogImage` লোকাল সাপোর্ট করে কিন্তু অ্যাডমিন থেকে সেট করার UI নেই |
| **সেকশন-এডিটরে drag-and-drop** | 🟡 | `reorder` endpoint আছে; UI-তে up/down + (সেশন ৪৩) ড্র্যাগ — এটা যাচাই করতে হবে |

**গ্যাপ:** প্রতি পেজের meta title/description (SEO) ফিল্ড — টাস্কের এক্সপ্লিসিট চাহিদা। বাকি কনটেন্ট-এডিটিং খুবই পরিণত।

---

## ৩. ইমেজ ম্যানেজমেন্ট — 🟡 আংশিক

| সক্ষমতা | অবস্থা | প্রমাণ |
|---|---|---|
| আপলোড (বহু জায়গা থেকে) | ✅ | `/admin/content/upload`, `/admin/upload-image`, গ্যালারি/মেম্বার/অ্যাচিভমেন্ট/past-leaders ফর্ম; `middleware/upload.js` `storeBufferImage()` (Vercel Blob+ডিস্ক dual-mode) |
| মিডিয়া লাইব্রেরি (তালিকা + প্রিভিউ) | ✅ | `GET /admin/media` — recursive scan, থাম্বনেইল, সাইজ/তারিখ |
| ডিলিট | ✅ | `POST /admin/media/delete` |
| অটো-অপটিমাইজেশন (WebP) | ✅ | `POST /admin/media/optimize` — sharp, quality 82, max 2000px; মূল ফাইল অক্ষত (সেশন ৪৪) |
| URL কপি | ✅ | media.ejs ক্লিপবোর্ড |
| **লাইব্রেরি থেকেই আপলোড** | ❌ | `media.ejs`-তে কোনো আপলোড বাটন নেই |
| **রিপ্লেস (একই URL-এ নতুন ছবি)** | ❌ | রিপ্লেস endpoint নেই |

**গ্যাপ:** মিডিয়া লাইব্রেরিতে আপলোড + রিপ্লেস — টাস্কের "আপলোড, রিপ্লেস, ডিলিট" চাহিদার ২টি।

---

## ৪. লিডারশিপ সেকশন ("নেতৃত্বের ধারায়" / "বর্তমান নেতৃত্ব") — 🟡 আংশিক

| সক্ষমতা | অবস্থা | প্রমাণ |
|---|---|---|
| কার্ডে ছবি/নাম/পদবি/কার্যবর্ষ | ✅ | `members` টেবিল (name, role, designation, image_url, term_year…) + `past_leaders` (name, role, term_start/end, photo_url) |
| অ্যাডমিন CRUD | ✅ | `/admin/members/*` + `/admin/past-leaders/*` (create/edit/delete/bulk) |
| বাণী (message/quote) | 🟡 | `bio` ফিল্ড + `data/leaderStatements.js` ফলব্যাক (হোমে); কিন্তু **আলাদা "বাণী" ফিল্ড নেই**, admin form-এ শুধু "বায়ো" |
| Facebook লিংক | ✅ | `members.social_fb` (ফর্ম + হোম রেন্ডার) |
| **LinkedIn লিংক** | ❌ | `members` টেবিলে `social_linkedin` কলাম নেই; হোম টেমপ্লেট `m.social_linkedin` চেক করলেও সবসময় undefined → **আইকন কখনো দেখায় না** (dead code) |
| শর্তসাপেক্ষ আইকন (লিংক থাকলেই দেখাবে) | 🟡 | হোম (`lekhok-home.ejs`) — আছে (fb/email/twitter/linkedin conditional) |
| নতুন ট্যাবে ওপেন | 🟡 | হোমে `target="_blank" rel="noopener"` — আছে, কিন্তু **`rel="noopener noreferrer"` নয়** (শুধু noopener) |
| ব্র্যান্ড কালার আইকন | ❌ | কোনো social-brand কালার নেই (facebook ব্লু #1877F2 / linkedin ব্লু #0A66C2) |
| কমিটি পেজে সোশ্যাল আইকন | ❌ | `lekhok-committee.ejs` কার্ডে সোশ্যাল আইকন **রেন্ডারই হয় না** |
| past-leaders পেজে সোশ্যাল আইকন | ❌ | `views/user/past-leaders.ejs`-এ কোনো সোশ্যাল আইকন নেই |

**গ্যাপ (লিডারশিপের টাস্ক-চাহিদার মূল অংশ):**
1. `members` + `past_leaders`-এ `social_linkedin` কলাম (মাইগ্রেশন)
2. আলাদা `message`/বাণী ফিল্ড (admin form + রেন্ডার)
3. কমিটি ও past-leaders কার্ডে শর্তসাপেক্ষ সোশ্যাল আইকন (fb+linkedin)
4. `rel="noopener noreferrer"` + ব্র্যান্ড কালার

---

## ৫. ভিজ্যুয়াল স্টাইল কনসিস্টেন্সি — ✅

- টাইপোগ্রাফি টোকেন (`--font-heading`/`--font-body`) সেশন ৪৮-এ সম্পন্ন।
- CSS ভেরিয়েবল: `--brand`, বর্ডার-রেডিয়াস 5px, `leader-card`/`leader-social` ক্লাস ইতিমধ্যে বিদ্যমান (`style.css`)।
- নতুন UI বিদ্যমান `admin.css`/`style.css` প্যাটার্ন অনুসরণ করবে।

---

## ৬. স্মুথ লোডিং / রিডাইরেক্ট — ✅ (আগের সেশনে ফিক্সড)

- session-save ১.৫সে টাইমআউট + `rolling: true` (সেশন ৪৬/৪৭) — ইনফিনিট স্পিনার বন্ধ।
- ৪০৪/ডেনায়েড ফ্লো (সেশন ৪৬)।

---

## সারসংক্ষেপ — যা করতে হবে (গ্যাপ-ক্লোজিং)

| # | কাজ | অবস্থা |
|---|---|---|
| ১ | নেভিগেশন রি-অর্ডার (drag/priority) + enable/disable | ❌ → বানাতে হবে |
| ২ | প্রতি পেজে SEO meta title/description ফিল্ড | ❌ → বানাতে হবে |
| ৩ | মিডিয়া লাইব্রেরিতে আপলোড + রিপ্লেস | ❌ → বানাতে হবে |
| ৪ | লিডারশিপ: `social_linkedin` + বাণী ফিল্ড + কমিটি/past-leaders কার্ডে শর্তসাপেক্ষ ব্র্যান্ড-কালার আইকন (noopener noreferrer) | ❌ → বানাতে হবে |

**বিদ্যমান ও ইমপ্রুভ করার মতো (নতুন বানাতে হবে না):** নেভ এডিটর, কনটেন্ট এডিটর, সেকশন CRUD+রিঅর্ডার, রিভিশন হিস্ট্রি, মিডিয়া WebP অপটিমাইজ, members/past-leaders CRUD, হোম লিডারশিপ সোশ্যাল আইকন।
