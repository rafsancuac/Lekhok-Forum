
---
## সেশন ৫৮ (৯ সেপ্টেম্বর ২০২৬) — POST→৩০৩ কেন্দ্রীয়-ফিক্স + 2FA সেটিংসে স্থানান্তর + প্রিমিয়াম পলিশ

**ইনপুট (লাইভ-ইউজার):** লগইন-পরে অ্যাডমিন/মডারেটর/ইউজার-প্যানেল-ফিড সরাসরি খোলে না (হার্ড-রিফ্রেশ লাগে); ERR_TOO_MANY_REDIRECTS; লগইন-ইন্টারফেসে 2FA নয় — ইউজার-আইডির ভেতরে; সব ইন্টারফেস প্রিমিয়াম-রেস্পন্সিভ-অ্যানিমেটেড।

**রোগনির্ণয় (Playwright লাইভ-ট্রেস):** Vercel ৩০২→৩০৭ কনভার্ট করে; ৩০৭ মেথড+বডি রাখে → লগইন-বডি নিয়ে /dashboard-এ পুনঃPOST → 404-ক্যাচ-অল ?saveerr=1 → পুনঃলগইন → লুপ।

**কাজ:**
- server.js: res.redirect-র‍্যাপারে POST/PUT/PATCH/DELETE-এ ডিফল্ট-৩০২→**৩০৩** — কেন্দ্রীয় ফিক্স, সব ফর্ম-ফ্লো কভার।
- লগইন-ফর্ম (views/user/login.ejs + admin/views/admin/login.ejs) থেকে totp_code-ফিল্ড অপসারণ।
- নতুন দুই-ধাপ ফ্লো: mfaPending সেশন-স্টেট (১০ মিনট, পাসওয়ার্ড-সংরক্ষণ-নেই) → GET/POST /login/2fa (routes/auth.js; admin/routes.js-এর দুই লগইন-পথ থেকেও) → নতুন views/user/login-2fa.ejs।
- ইউজার-লেভেল 2FA: users-টেবিলে totp কলাম (db.js ensure) + /settings-এ "নিরাপত্তা (2FA)" ট্যাব (enroll/confirm/disable/backup-regen — routes/social.js + settings.ejs; ডিজেবলে পাসওয়ার্ড-নিশ্চিতকরণ; ব্যাকআপ-কোড একবার-দেখানো+কপি)।
- premium.css + premium.js (additive; .prm-js JS-গার্ড; reduced-motion-সেফ): এন্ট্রি-অ্যানিমেশন, হোভার-লিফট, বাটন-প্রেস, ফোকাস-রিং, স্ক্রলবার, স্ক্রল-রিভিল, টেবিল-র‍্যাপ, iOS-জুম-রোধ। লোড: layout/header/footer + ৩৬ user-ভিউ + সাইডবার + অ্যাডমিন-লগইন + ৭ অথ-পেজ।
- auth.css: ধাপ-২ স্টাইল + অথ-এন্ট্রি-অ্যানিমেশন।

**যাচাই:** verify-session58.js ৪৫/৪৫; verify-session58-browser.js ২৬/২৬ (লগইন→ফিড হার্ড-রিফ্রেশ ছাড়াই; লুপ-শূন্য); রিগ্রেশন ৫৬=৫৪/৫৪+১০/১০, ৫৭=৪২/৪২।

**টুল:** /home/z/my-project/scripts/{verify-session58.js, verify-session58-browser.js, reset-admin-2fa.js}।
