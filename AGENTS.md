# ⚠️ এজেন্ট-নির্দেশ — স্ট্যাক-লক (session224)

## এই রিপোর একমাত্র স্ট্যাক: **Express + EJS** (`lekhok-forum/`)

- লাইভ সাইট: https://lekhok-forum.vercel.app — Vercel প্রজেক্ট `lekhok-forum`,
  rootDirectory = `lekhok-forum`, GitHub main-push → অটো-ডিপ্লয়।
- কোনো Next.js/React/Prisma অ্যাপ **এই রিপোতে নেই এবং আর কখনো থাকবে না**।
  পুরনো `lekhok-forum-next/` পোর্ট session224-এ অপসারিত (ইতিহাসে খুঁজলে পাওয়া যাবে)।

## কঠোর নিয়ম

1. **সব ফিচার-কাজ, বাগ-ফিক্স, স্টাইল — `lekhok-forum/`-এর ভেতরে** (routes/, views/,
   admin/, helpers/, public/assets/)। নতুন কোনো সাব-অ্যাপ ফোল্ডার তৈরি নিষিদ্ধ।
2. **নতুন প্যাকেজ যোগের আগে ভাবুন** — Express অ্যাপের বাইরে কোনো টুলচেইন
   (next/react/vite/prisma) ইনস্টল নয়।
3. QA: `cd lekhok-forum && npm install && PORT=3030 node server.js`
   (লোকাল sql.js: `lekhok.db`; লাইভ-ডেটা দরকারে Turso env-সহ বুট)।
4. ডিপ্লয় = `git push origin main` — Vercel নিজেই বিল্ড করে (`npm start` → `api/index.js`)।
   আলাদা `vercel deploy` দরকার নেই।
5. CSS/JS ক্যাশ-বাস্ট অটো (`computeAssetVersion()` size+mtime হ্যাশ) — ম্যানুয়াল
   ভার্সন-বাম্পের দরকার নেই; তবে নতুন ব্লক সবসময় মার্ক-কমেন্টসহ style.css-এর শেষে।
6. সেটিংস-কী সবসময় `content_` প্রিফিক্সসহ (ভিউ C() হেল্পার এই কী-ই পড়ে) —
   session224-এ `home_year_current` প্রিফিক্স-মিসিং বাগ ঠিক হয়েছে।
7. কনটেন্ট WYSIWYG নীতি: অ্যাডমিনে সেভ-করা ফাঁকা মান = সাইটে অদৃশ্য;
   কখনো-সেভ-না-হওয়া কী = রেজিস্ট্রি-ডিফল্ট (fresh install)।
