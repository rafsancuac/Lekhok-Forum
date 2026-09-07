# RBAC — রোল-বেজড অ্যাক্সেস কন্ট্রোল (Permission Matrix)

> **শেষ আপডেট:** সেশন ৪৭ (৮ সেপ্টেম্বর ২০২৬)
> এই ডকুমেন্টটি অ্যাডমিন ও মডারেটর রোলের স্পষ্ট, লঙ্ঘন-অযোগ্য অ্যাক্সেস-সীমারেখা বর্ণনা করে।
> প্রতিটি রুট/মডিউল **ব্যাকএন্ড মিডলওয়্যার** ও **ফ্রন্টএন্ড (সাইডবার/টাইল)** দুই স্তরেই enforce হয়।

## ১. তিনটি রোল

| রোল | সেশন ভেরিয়েবল | অর্থ |
|---|---|---|
| **অ্যাডমিন** | `session.adminUser` (admin_users) বা `session.user.role === 'admin'` | সব ফিচারে পূর্ণ অ্যাক্সেস |
| **মডারেটর** | `session.user.role === 'moderator'` | শুধু অনুমোদিত স্কোপের মডিউল |
| **নিয়মিত ইউজার** | `session.user.role === 'user'` | শুধু পাবলিক + নিজস্ব কনটেন্ট |

## ২. মিডলওয়্যার গার্ড (backend enforcement)

| গার্ড | সংজ্ঞা | অ্যাক্সেস |
|---|---|---|
| `requireAdmin` | admin_users-সেশন **বা** user-রোল=admin | শুধু অ্যাডমিন |
| `requireStaff` | অ্যাডমিন **বা** মডারেটর (যেকোনো) | স্টাফ-লেভেল |
| `requireScope(scope)` | স্টাফ + স্কোপ-চেক (`db.hasScope`) | মডারেটরকে নির্দিষ্ট স্কোপ |
| `ensureModerator` (moderator.js) | রোল মডারেটর/অ্যাডমিন | মডারেটর প্যানেল |

**স্কোপ ক্যাটালগ** (`MODERATOR_SCOPES`): `quiz, this_day, best_writer, activity, notice, epaper, event, complaints, content` (আলিয়াস: `notices↔notice`, `events↔event`; `daily` = quiz/this_day/activity/epaper-এর ছাতা)।

## ৩. Permission Matrix — অ্যাডমিন রাউট (`/admin/*`)

| মডিউল | রুট (সংক্ষিপ্ত) | গার্ড | অ্যাডমিন | মডারেটর |
|---|---|---|---|---|
| লগইন/লগআউট | `/login`, `/logout` | (publik) | ✅ | ✅ |
| ড্যাশবোর্ড শেল | `/` | requireStaff | ✅ | ✅ |
| বিজ্ঞপ্তি CRUD | `/notices`, `/notices/:id`, bulk | requireScope(`notices`) | ✅ | ✅ (notice স্কোপ) |
| ইভেন্ট CRUD | `/events…` | requireScope(`events`) | ✅ | ✅ (event স্কোপ) |
| ডেইলি কনটেন্ট | `/daily…`, bulk-publish | requireScope(`daily`) | ✅ | ✅ (daily স্কোপ) |
| গ্যালারি | `/gallery…` | requireScope(`gallery`) | ✅ | ✅ (gallery স্কোপ) |
| অভিযোগ | `/complaints…` | requireScope(`complaints`) | ✅ | ✅ (complaints স্কোপ) |
| কমিটি সদস্য | `/members…` | **requireAdmin** | ✅ | ❌ 403 |
| রিসোর্স | `/resources…` | **requireAdmin** | ✅ | ❌ 403 |
| অর্জন | `/achievements…` | **requireAdmin** | ✅ | ❌ 403 |
| গঠনতন্ত্র | `/constitution…` | **requireAdmin** | ✅ | ❌ 403 |
| প্রাক্তন নেতৃত্ব | `/past-leaders…` | **requireAdmin** | ✅ | ❌ 403 |
| ইউজার ম্যানেজমেন্ট | `/users…` (role/password/scopes) | **requireAdmin** | ✅ | ❌ 403 |
| মডারেটর ম্যানেজমেন্ট | `/moderators…` (grant/revoke) | **requireAdmin** | ✅ | ❌ 403 |
| সাবস্ক্রাইবার (মিউটেশন) | `/subscribers/:id/*`, export.csv | **requireAdmin** | ✅ | ❌ 403 |
| সাবস্ক্রাইবার (ভিউ) | `/subscribers`, `/subscribers/export` | requireStaff | ✅ | ✅ |
| কনটেন্ট এডিটর | `/content`, `/content/history`, `/content/restore`, `/content/upload` | **requireAdmin** | ✅ | ❌ 403 |
| সেটিংস | `/settings` | **requireAdmin** | ✅ | ❌ 403 |
| মেনু ব্যবস্থাপনা | `/navigation` | requireStaff | ✅ | ✅ |
| অ্যাক্টিভিটি লগ | `/activity` | requireStaff | ✅ | ✅ |
| মেসেজ | `/messages` | **requireAdmin** | ✅ | ❌ 403 |
| টাস্ক | `/tasks…` | **requireAdmin** | ✅ | ❌ 403 |
| ট্র্যাশ | `/trash…` (restore/restore-all) | requireStaff | ✅ | ✅ |
| ট্র্যাশ স্থায়ী-মুছুন | `/trash/:id/purge` | **requireAdmin** | ✅ | ❌ 403 |
| অডিট লগ + CSV | `/audit`, `/audit/export.csv` | **requireAdmin** | ✅ | ❌ 403 |
| সেকশন আইটেম | `/sections…` | requireStaff | ✅ | ✅ (content স্কোপ — মডারেটর প্যানেলে) |
| মিডিয়া লাইব্রেরি | `/media`, `/media/delete`, `/media/optimize` | **requireAdmin** | ✅ | ❌ 403 |
| অ্যানালিটিক্স | `/analytics` | **requireAdmin** | ✅ | ❌ 403 |
| ইমেজ আপলোড | `/upload-image`, `/search-index` | requireStaff | ✅ | ✅ |

## ৪. Permission Matrix — মডারেটর রাউট (`/moderator/*`)

| মডিউল | রুট | গার্ড | অ্যাডমিন | মডারেটর |
|---|---|---|---|---|
| ড্যাশবোর্ড | `/` | ensureModerator | ✅ | ✅ |
| বিজ্ঞপ্তি | `/notices…` | ensureModerator + requireScope(`notice`) | ✅ | ✅ (notice) |
| ইভেন্ট | `/events…` | ensureModerator + requireScope(`event`) | ✅ | ✅ (event) |
| ডেইলি কনটেন্ট | `/daily/:type…` | ensureModerator + requireScope(type) | ✅ | ✅ (সংশ্লিষ্ট) |
| সেরা লেখক | `/best-writer…` | ensureModerator + requireScope(`best_writer`) | ✅ | ✅ |
| অভিযোগ | `/complaints…` | ensureModerator + requireScope(`complaints`) | ✅ | ✅ |
| পত্রিকা কাটিং | `/press…` | ensureModerator + requireScope(`epaper`) | ✅ | ✅ (epaper) |
| কমিটি সদস্য | `/members…` | ensureModerator | ✅ | ✅ |
| মেনু ব্যবস্থাপনা | `/navigation` | ensureModerator | ✅ | ✅ |
| সেকশন আইটেম | `/sections…` | ensureModerator + requireScope(`content`) | ✅ | ✅ (content) |
| ট্র্যাশ | `/trash…` | ensureModerator | ✅ | ✅ |
| রোল-সুইচ | `/switch` | ensureModerator | ✅ | ✅ |

## ৫. Enforcement নিয়ম

1. **UI hide/disable** — সাইডবার ও ড্যাশবোর্ড টাইল স্কোপ-অনুযায়ী লিংক লুকায়/লক করে (অ্যাডমিন-অনলি লিংক `_isAdmin`-গেটেড; মডারেটর-মডিউল লিংক `userScopeMeta`-গেটেড)।
2. **Backend enforce** — UI লুকানো সত্ত্বেও সরাসরি URL/API কল প্রতিটি রুটের মিডলওয়্যার গার্ডে ব্লক হয়।
3. **Denied পেজ (৪০৪ নয়)** — মডারেটর অ্যাডমিন-অনলি রুটে গেলে `403` + `admin/denied` ("অনুমতি নেই") দেখায়, রোল-অনুযায়ী "ফিরে যান" বাটন (মডারেটর → `/moderator`)।
4. **সেশন স্থায়িত্ব** — `rolling: true`: সক্রিয় রিকোয়েস্টে কুকি/সেশন মেয়াদ রিসেট হয় → সক্রিয় ইউজার অহেতুক লগআউট হয় না (মেয়াদ ২৪ ঘণ্টা, নিষ্ক্রিয়তার পর)।
