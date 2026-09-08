# নিরাপত্তা (Security) — লেখক ফোরাম

এই ডকুমেন্টে লেখক ফোরামের নিরাপত্তা ব্যবস্থা, কনফিগারেশন ফ্ল্যাগ এবং জানা-থাকা
সীমাবদ্ধতা/দুর্বলতা নথিভুক্ত করা হয়েছে। সব ব্যবস্থা **বিনামূল্যে / সেলফ-হোস্টেড** —
কোনো পেইড সার্ভিস (Cloudflare WAF, কাস্টম ডোমেইন, তৃতীয়-পক্ষ MFA) লাগে না।
পরে কাস্টম ডোমেইন কিনলে এখানে বর্ণিত জায়গাগুলোতে ছোট পরিবর্তনে সেটি যুক্ত করা যাবে।

---

## ১. বাস্তবায়িত নিয়ন্ত্রণ (সম্পন্ন)

### ১.১ Authentication ও Session
| নিয়ন্ত্রণ | বিবরণ | ফাইল |
|---|---|---|
| পাসওয়ার্ড হ্যাশিং | `bcryptjs`, cost factor 10 | সর্বত্র |
| অ্যাডমিন 2FA (TOTP) | Google Authenticator/Authy-সামঞ্জস্য, dependency-free (Node `crypto`) | `helpers/totp.js`, `admin/routes.js` |
| ব্যাকআপ কোড | ১০টি, SHA-256 হ্যাশ হয়ে সংরক্ষিত; একবার-ব্যবহার | `helpers/totp.js` |
| Session rotation | লগইনের পর `req.session.regenerate()` — session-fixation গার্ড | `routes/auth.js`, `admin/routes.js` |
| Session cookie | `secure` (HTTPS), `httpOnly` (ডিফল্ট) | `server.js` |
| MFA bypass-ব্লক | অ্যাডমিন `/login` ফলব্যাক পথেও TOTP বাধ্যতামূলক | `routes/auth.js` |

### ১.২ Rate Limiting (in-memory, sliding-window — WAF-এর বিকল্প)
`helpers/rate-limit.js`-এ কেন্দ্রীভূত; প্রিসেট:

| Endpoint | সীমা | উইন্ডো | কী |
|---|---|---|---|
| ইউজার লগইন | ১০ ব্যর্থ | ১৫ মি | ip+username |
| অ্যাডমিন লগইন | ৫ ব্যর্থ | ১৫ মি | ip+username |
| ফরগট-পাসওয়ার্ড | ৫ | ১ ঘণ্টা | ip |
| রেজিস্ট্রেশন | ৫ | ১ ঘণ্টা | ip |
| মেম্বার find | ৩০ | ১ মি | ip |
| ক্লেইম | ১০ | ১৫ মি | ip |

> দ্রষ্টব্য: in-memory লিমিটার প্রতি-instance; Vercel serverless-এ instance-মাঝে
> শেয়ার হয় না (বিস্তারিত §4)। একক-নোড/ডেমোতে সম্পূর্ণ কার্যকর।

### ১.৩ Input Validation ও File Upload
- **Magic-byte sniffing** — আপলোড করা ছবির আসল ফাইল-সিগনেচার (JPEG/PNG/GIF/WebP)
  যাচাই করা হয়; ক্লায়েন্টের দেওয়া MIME/এক্সটেনশন বিশ্বাস করা হয় না
  (`middleware/upload.js` → `detectImageType`)।
- **SVG নিষিদ্ধ** — SVG-তে `<script>` এমবেড করা যায় (stored XSS)। শুধু রাস্টার
  ফরম্যাট অনুমোদিত, যেগুলো WebP-রিঅ্যানকোডে (sharp) স্যানিটাইজ হয়।
- **e-Paper সীমিত** — আগে "যেকোনো ফাইল"; এখন শুধু PDF + ইমেজ (HTML/SVG আপলোড করে
  stored-XSS বন্ধ)।
- ডকুমেন্ট/অ্যাটাচমেন্ট: এক্সটেনশন + MIME দুই-স্তর হোয়াইটলিস্ট।

### ১.৪ Headers (server.js)
| Header | মান |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; … object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `Strict-Transport-Security` | HTTPS-এ `max-age=31536000; includeSubDomains` |
| `Cache-Control: no-store` | `/admin`, `/moderator`, `/dashboard`, `/profile`, `/settings`, `/claim`, `/reset-password`, `/forgot-password` |

> CSP নোট: `script-src 'unsafe-inline'` আছে কারণ অ্যাপে বহু inline `<script>` ব্যবহৃত।
> ভবিষ্যৎ উন্নতি: nonce/hash-ভিত্তিক CSP (সম্পূর্ণ মাইগ্রেশন লাগবে)।

### ১.৫ CSRF
- সব `POST` ফর্ম ও multipart-এ CSRF টোকেন যাচাই (`server.js`)।
- JSON API (`/api/*`) CSRF-নয় বরং SameSite-কুকি + CORS-অনুপস্থিতিতে নির্ভর করে।

### ১.৬ Authorization (RBAC)
- `requireAdmin`, `requireStaff`, `requireScope` (মডারেটর-স্কোপ) গার্ড — `admin/routes.js`।
- মডারেটর স্কোপ-ভিত্তিক অ্যাক্সেস (alias-aware)।
- রোল/অনুমতি পরিবর্তন audit-লগ হয় (`TA42.audit` / `db.logActivity`)।

### ১.৭ Password Reset
- টোকেন: `crypto.randomBytes(32)` → SHA-256 হ্যাশ সংরক্ষণ; ৬০ মি মেয়াদ; একবার-ব্যবহার।
- User-enumeration রোধ: পাওয়া না গেলেও একই "done" বার্তা।

### ১.৮ Open Redirect গার্ড
- `safeNextPath()` — শুধু same-origin রিলেটিভ পাথ; `//host` ও `scheme://` ব্লক
  (`routes/auth.js`)।

### ১.৯ Audit Logging
- `AUDIT_LOGGING_ENABLED=true`; অ্যাডমিন MFA enable/disable/backup-regen,
  ক্লেইম approve/reject, রোল পরিবর্তন, পাসওয়ার্ড-রিসেট লগ হয়।

---

## ২. কনফিগারেশন ফ্ল্যাগ (`helpers/security-config.js`)

সব ফ্ল্যাগ `SECURITY_<KEY>` এনভায়রনমেন্ট ভ্যারিয়েবল দিয়ে override করা যায়;
অন্যথায় DB `settings` টেবিল; সবার শেষে fail-closed ডিফল্ট।

| ফ্ল্যাগ | ডিফল্ট | অর্থ |
|---|---|---|
| `ACCOUNT_CLAIM_REQUIRES_ADMIN_APPROVAL` | `false` | ক্লেইম অটো-অনুমোদন (`true` → PENDING_REVIEW + অ্যাডমিন রিভিউ) |
| `REQUIRE_REGISTRATION_APPROVAL` | `false` | নতুন নিবন্ধন অটো-active (`true` → pending) |
| `REQUIRE_MFA_FOR_ADMIN` | `true` | অ্যাডমিন MFA-এর গুরুত্ব (এনরোলড হলে সর্বদা বাধ্যতামূলক) |
| `REQUIRE_MFA_FOR_SUPER_ADMIN` | `true` | সুপার-অ্যাডমিন MFA |
| `LOGIN_RATE_LIMIT_ENABLED` | `true` | |
| `CLAIM_RATE_LIMIT_ENABLED` | `true` | |
| `FILE_UPLOAD_VALIDATION_ENABLED` | `true` | magic-byte + এক্সটেনশন যাচাই |
| `AUDIT_LOGGING_ENABLED` | `true` | |
| `DEBUG_MODE` | `false` | প্রোডাকশনে সর্বদা `false` রাখুন |

**অ্যাডমিন UI টগল:** `/admin/settings`-এ ক্লেইম-অনুমোদন ও নিবন্ধন-অনুমোদন;
`/admin/security`-এ 2FA। DB `settings` কী: `account_claim_requires_admin_approval`,
`require_registration_approval` (মান `'0'`/`'1'`)।

---

## ৩. অ্যাডমিন 2FA সেটআপ (ব্যবহার)

1. `/admin` → সাইডবার → **সিকিউরিটি**।
2. "2FA চালু করুন" → সিক্রেট কী + `otpauth://` URI দেখাবে।
3. Google Authenticator/Authy-তে সিক্রেট কী বা QR স্ক্যান করুন।
4. অ্যাপের বর্তমান ৬-অঙ্কের কোড দিন → সক্রিয়।
5. **ব্যাকআপ কোড** একবারই দেখানো হয় — নিরাপদ জায়গায় রাখুন (ফোন/অ্যাপ হারালে লগইন)।

লগইনের সময়: পাসওয়ার্ডের পর ৬-অঙ্কের TOTP (বা ব্যাকআপ কোড) আবশ্যক। এটি
`/admin/login` ও `/login` (অ্যাডমিন ফলব্যাক) — **দুই পথেই** প্রযোজ্য।

---

## ৪. জানা সীমাবদ্ধতা ও পরবর্তী পদক্ষেপ

1. **In-memory rate limit** — Vercel serverless-এ instance-মাঝে শেয়ার হয় না।
   একাধিক-ইনস্ট্যান্স/ক্লাস্টারের জন্য Redis-ব্যাকড স্টোর লাগবে (ভবিষ্যৎ)।
2. **CSP `unsafe-inline`** — inline `<script>`-এর কারণে; nonce-ভিত্তিক CSP-তে
   মাইগ্রেশন ভবিষ্যৎ উন্নতি (এখন স্কোপের বাইরে)।
3. **`npm audit` বাকি (transitive)**:
   - `qs` (moderate, express→body-parser-এর ভেতর) — DoS; express-এর পরবর্তী
     রিলিজে `qs` আপডেট এলে সমাধান হবে। সরাসরি এক্সপ্লয়েবল নয় (আমরা query-string
     অ্যারে-পার্সিং কনফিগার করি না)।
   - `undici` (high, `@vercel/blob`-এর বান্ডল) — শুধু Blob-স্টোর HTTP কলের জন্য
     ব্যবহৃত। ফিক্স `@vercel/blob@2.8.0` (ব্রেকিং মেজর) — আপগ্রেডের সময় ব্লব
     আপলোড আবার টেস্ট করতে হবে।
4. **কাস্টম ডোমেইন পরে:** CSP-র `frame-ancestors`/`form-action` ও cookie `domain`
   ও `Secure` ফ্ল্যাগ — ডোমেইন এলে `server.js`-এ এক জায়গায় আপডেট।
5. **HSTS preload / ট্রান্সপোর্ট-লেভেল:** Vercel SSL-টার্মিনেশন-এ নির্ভরশীল।
6. **Rate limit ও MFA-র DB সিঙ্ক:** `sql.js` লোকাল মোডে server বন্ধের সময় save হয়;
   প্রোডাকশন Turso-তে তাৎক্ষণিক।

---

## ৫. টেস্ট

স্বয়ংক্রিয় স্মোক-টেস্ট: `node test/security.test.js` (চালানোর আগে সার্ভার চলমান
থাকতে হবে `http://localhost:8080`-এ)।

- TOTP RFC 4226/6238 test-ভেক্টর (যাচাই: `node -e "..."` রিগ্রেশন)।
- হেডার/CSP/no-store উপস্থিতি।
- MFA এনরোল→কনফার্ম→লগইন-গেটিং।
- magic-byte আপলোড রিজেকশন।

---

*সর্বশেষ আপডেট: ২০২৬-০৯-০৮*
