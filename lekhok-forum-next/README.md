# লেখক ফোরাম — Next.js সংস্করণ (Facebook-স্টাইল)

বাংলা লেখকদের জন্য আধুনিক সোশ্যাল প্ল্যাটফর্ম — ফেসবুক-স্টাইল UI-এর একটি সম্পূর্ণ বাস্তবায়ন।
এটি `lekhok-forum/` (Express/EJS) অ্যাপের পাশে থাকা **আলাদা Next.js 16 অ্যাপ** — দুটো একে-অপরকে স্পর্শ করে না।

## ফিচারসমূহ

- **ফেসবুক-স্টাইল ডায়নামিক পোস্ট কম্পোজার** — contentEditable রিচ-টেক্সট (H1/H2, বোল্ড, ইটালিক, তিন-ধরনের অ্যালাইনমেন্ট, নাম্বারিং/বুলেট লিস্ট), গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড, অনুভূতি/লোকেশন, অডিয়েন্স (প্রকাশ্য/বন্ধুরা/শুধু আমি), তিন-ডট স্লাইড সাব-মেনু
- **ইন্টেলিজেন্ট ইমেজ কোলাজ** — ১ ছবি ফুল-উইডথ, ২/৪-কলাম গ্রিড, ৩-ছবি লেফট-লেআউট, ৫+ ছবিতে "+N" ওভারলে; ভিডিও পোস্টার-থাম্বনেইল
- **মেসেঞ্জার (Session L)** — দুই-প্যান চ্যাট, টেক্সট + **ভয়েস মেসেজ** (রেকর্ডার-সাইড duration — ০:০০-বাগ স্থায়ীভাবে সমাধাত), রিড-রিসিপ্ট (✓✓), অপঠিত-ব্যাজ, ডেট-সেপারেটর
- **বাংলাদেশ টাইমজোন (Asia/Dhaka)** — সব টাইমস্ট্যাম্প GMT+6-এ বাংলা ডিজিটে (`src/lib/formatBdTime.ts`)
- স্টোরি (২৪-ঘণ্টা, রিপ্লাই+ভিউয়ার), রিঅ্যাকশন (৭-ধরন), থ্রেডেড কমেন্ট, গ্রুপ (প্রকাশ্য/বন্ধ), প্রোফাইল + ফলো-সিস্টেম, নোটিফিকেশন (মিউট-প্রেফসহ), সেভ-বুকমার্ক, হ্যাশট্যাগ-ট্রেন্ডিং, ইমেজ-কমপ্রেশন (EXIF-সেফ), নতুন-পোস্ট পোলিং-পিল

## টেক-স্ট্যাক

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma + SQLite

## সেটআপ

```bash
cd lekhok-forum-next
cp .env.example .env
bun install
bun run db:push          # স্কিমা → SQLite (db/custom.db)
bun prisma/seed.ts       # ডেমো-ইউজার + পোস্ট
bun prisma/seed-stories.ts
bun prisma/seed-groups.ts
bun prisma/seed-messenger.ts   # মেসেঞ্জার ডেমো (টেক্সট + ভয়েস)
bun run dev              # http://localhost:3000
```

ডেমো-ইউজার: ইসমাইল/মোনেম/করিশমা/মাহফুজ/নুসরাত (টপনাভের প্রোফাইল-মেনু থেকে আইডেন্টিটি সুইচ)।

## ভয়েস মেসেজ আর্কিটেকচার (৩-বাগ-সমাধান)

| সমস্যা | কারণ | সমাধান |
|---|---|---|
| পাঠানোর পর ০:০০ | MediaRecorder-এর webm ফাইলে EBML duration অনুপস্থিত (Infinity/0) | রেকর্ড-চলাকালীন `setInterval`-সেকেন্ধ গুনে `duration` পে-লোডে পাঠানো (`VoiceRecorder.tsx`) |
| নিজের ভয়েস শোনা যায় না | blob-URL রিভোক / কাস্টম প্লেয়ারে রিয়েল বাইন্ডিং নেই | গোপন `<audio preload="metadata">` + রিয়েল `.play()`/`.pause()` (`VoiceMessageBubble.tsx`) |
| টাইম উল্টাপাল্টা | UTC সরাসরি রেন্ডার | `Intl.DateTimeFormat` `timeZone: 'Asia/Dhaka'` + বাংলা দিনভাগ (`src/lib/formatBdTime.ts`) |

## API (নির্বাচিত)

- `GET/POST /api/messages/conversations` — কথোপকথন-তালিকা / find-or-create (`?unread=1` → ব্যাজ-কাউন্ট)
- `GET/POST /api/messages/conversations/[id]` — থ্রেড (GET-এ রিড-রিসিপ্ট) / মেসেজ পাঠানো (`{content}` বা `{type:'VOICE', audioUrl, duration}`)
- `POST /api/posts`, `GET /api/posts?tab=feed|following|timeline|saved|profile|media|group`, `/api/stories`, `/api/notifications`, `/api/users/[username]`, `/api/groups`, `/api/upload`
