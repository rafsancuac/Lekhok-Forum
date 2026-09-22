# ⚠️ STRICT AGENT INSTRUCTIONS: TECH STACK RULES — সর্বপ্রথম এটা পড়ো

> এ-ফাইলটি প্রতিটি AI এজেন্ট/ডেভেলপারের জন্য **বাধ্যতামূলক পঠনীয়** (২০২৬-০৯-২২, ব্যবহারকারীর স্পষ্ট নির্দেশে স্থাপিত)।
> এখানে-লেখা-নিয়ম ভাঙলে ডিপ্লয়-ব্লক/প্রোড-ভাঙন নিশ্চিত।

## ১. ⛔ NO NEXT.JS — কঠোরভাবে নিষিদ্ধ

1. **এ-প্রজেক্টে Next.js, React App Router, RSC, `next/`-প্যাকেজ ব্যবহার/পুনঃসৃজন/স্টাইল-পোর্ট করা সম্পূর্ণ নিষিদ্ধ।**
2. পুরনো `lekhok-forum-next/` (Next.js 16 ফেসবুক-স্টাইল প্রোটোটাইপ, ১৯৩-ফাইল) ২০২৬-০৯-২২ ব্যবহারকারীর
   নির্দেশে **গিট-থেকে চিরতরে মুছে-ফেলা-হয়েছে**; `.gitignore`-এ পুনঃসৃজন-গার্ড (`lekhok-forum-next/`) আছে।
3. নতুন-ফিচারের-স্পেক React/JSX-মকআপ-এ এলে **সরাসরি EJS-এ পোর্ট করো** (প্রমাণিত-প্রবাদ: session192/193 — "React-মকআপ → EJS-পোর্ট")। কখনো-ই মাঝপথে Next.js-অ্যাপ-বানাবে-না।
4. `/home/z/my-project` (স্যান্ডবক্স-Next.js-স্ক্যাফোল্ড) এ-প্রজেক্টের **অংশ-নয়** — ওখানে-করা-কাজ প্রোডে-যায়-না; বিভ্রান্ত-হওয়া-নিষেধ।

## ২. ✅ আসল লাইভ স্ট্যাক (এক-মাত্র অনুমোদিত)

| স্তর | প্রযুক্তি |
|---|---|
| সার্ভার | **Node.js + Express.js** (server-side rendering) |
| ভিউ | **EJS** টেমপ্লেট + Tailwind-শৈলী কাস্টম CSS (tokens.css/design-tokens) |
| ডাটাবেস | **sql.js (SQLite-in-WASM) + Turso** (প্রোড-durable) — `db.js`; Prisma **নয়** |
| সেশন | `session-store.js` |
| ফ্রন্ট-জেএস | ভ্যানিলা JS (`public/assets/js/`) — কোনো-বান্ডলার-নেই |

## ৩. 🗂 আর্কিটেকচার-ম্যাপ (মনোরিপো)

```
├─ server.js            # লাইভ-অ্যাপ-এন্ট্রি (রাউট-মাউন্ট, res.locals, CSP, ক্যাশ-RE)
├─ db.js                # sql.js/Turso ডাটালেয়ার
├─ routes/              # Express-রাউটার (pages, social, calls, seo, legal…)
├─ views/               # EJS: lekhok-home.ejs + partials/home/* (home-layout.js রেজিস্ট্রি-চালিত)
├─ helpers/             # home-layout.js, home-leadership.js (৮-স্লট), nav.js (enabled/visibleNav)…
├─ admin/               # অ্যাডমিন: admin/routes.js (API+POST) + admin/views/admin/*.ejs
├─ public/assets/       # css/js/img — style.css (স্কোপড-ব্লক, হেক্স-গার্ড আছে)
├─ middleware/          # auth/upload ইত্যাদি
├─ api/index.js         # Vercel-সার্ভারলেস-এন্ট্রি (vercel.json rewrite /(.*)→ এখানে)
├─ epaper-bot/          # ২৪/৭ টেলিগ্রাম→ড্রাইভ→সাইট সিঙ্ক-বট (বট-রানবুক: epaper-bot/README.md)
├─ legacy-static-site/  # পুরনো HTML-ভার্সন (শুধু-সংরক্ষণাগার — এডিট-নয়)
└─ worklog.md           # প্রতি-সেশনের-হাতোভার — কাজের-আগে-পড়ো, শেষে-যোগ-করো
```

## ৪. 🚫 কখনো-ব্যবহার-যাবে-না (ক্লায়েন্ট-স্ট্যাক-আমলে)

- `'use client'`, `'use server'`, `revalidatePath()`, `NextResponse`, `getServerSideProps`, React-hooks/JSX — **কখনোই নয়।**
- সবসময়: `res.render()` / `res.json()` + ভ্যানিলা JS fetch (উদাহরণ: admin-প্যানেলের AJAX-টগল)।

## ৫. 🚀 ডিপ্লয় ও QA

- **Vercel-প্রজেক্ট: `lekhok-forum`** (framework: None — Express via `api/index.js`; region: bom1; `vercel.json` স্পর্শ-করা-যাবে-না যতক্ষণ-না-প্রয়োজন-বোঝা-যায়)।
- Vercel-এ **`uni-tracker` প্রজেক্টটি ব্যবহারকারীর আলাদা-প্রজেক্ট** (rafsancuac/UniTracker) — এ-রিপোর-সাথে-অসম্পৃক্ত; **কখনো-ছুঁয়ো-না/ডিলিট-নয়।**
- লোকাল-QA: `bash ensure-server.sh` → `http://localhost:8094` (node server.js)।
- **গোটচা (Vercel-BLOCK)**: কমিটের-আগে `git config user.email` যাচাই — অবশ্যই `rafsancuac@users.noreply.github.com`;
  অন্য-অথর (যেমন z@container) হলে ডিপ্লয় `COMMIT_AUTHOR_REQUIRED` দিয়ে ব্লক-হয় (seatBlock)।
- রিগ্রেশন-ন্যূনতম: `node --check` (সব-স্পর্শকৃত-js) + EJS-compile + `npm run audit:views` + guard:design।

## ৬. 🤖 epaper-bot (২৪/৭)

- রানবুক: `epaper-bot/README.md` §'২৪/৭ অপারেশন-রানবুক'। কিপার: `bash epaper-bot/bot-keeper.sh`
  (exit 0=সুস্থ · 2=.env-নেই · 3=প্লেসহোল্ডার/পেপার-প্রতীক্ষিত · 4=স্টার্ট-ব্যর্থ)।
- সিক্রেট: split-encoded গিস্ট-ভল্ট (session198-প্যাচ) — raw-টোকেন **কোথাও-ফাইলে/কমিটে/চ্যাটে নয়**; push-URL-এ-কেবল-env।
- বট সাইটে-সিঙ্ক-করে `POST /api/epaper/...` (Express-অ্যাপে-মাউন্টেড; নেক্সট-অ্যাপ-ছিল-না-ও-নেই)।

## ৭. 📝 কাজের-চুক্তি (প্রতি-সেশনে)

1. `worklog.md`-এর-শেষাংশ-পড়ো → টাস্ক-বুঝে-নাও (সেশন-লেবেল-ধারাবাহিক-রাখো)।
2. **fetch/pull --rebase আগে** (প্যারালাল-এজেন্ট-প্রোটোকল) → তারপর-কাজ → যাচাই → কমিট(push, সঠিক-অথর)।
3. worklog-এ এন্ট্রি (Task ID/Agent/Work Log/Stage Summary) + প্রয়োজনে PLANS.md/PROJECT.md-নোট।
4. লোকাল `lekhok.db` = প্রোডাকশন-কপি — রানিং-সার্ভার-থাকলে reset-স্ক্রিপ্ট-চালাবে-না (ফাইল-ওভাররাইট-ঝুঁকি)।
