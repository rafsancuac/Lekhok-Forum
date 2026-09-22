# লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় — মনোরিপো

> ⚠️ **এজেন্ট/ডেভেলপার-হলে প্রথমে [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) পড়ো** —
> স্ট্যাক-নিয়ম কঠোরভাবে প্রযোজ্য: **এক-মাত্র লাইভ স্ট্যাক = Node.js + Express + EJS (SSR)**।
> Next.js সম্পূর্ণ নিষিদ্ধ (পুরনো `lekhok-forum-next/` প্রোটোটাইপ ২০২৬-০৯-২২ গিট-থেকে বিলুপ্ত)।

## 📁 গঠন

| পথ | কী |
|---|---|
| `lekhok-forum/` | **লাইভ অ্যাপ** — Express + EJS (`server.js` এন্ট্রি, `views/`, `routes/`, `helpers/`, `admin/`, `public/assets/`, `api/index.js` = Vercel-এন্ট্রি) |
| `epaper-bot/` | ২৪/৭ টেলিগ্রাম→গুগল-ড্রাইভ→সাইট ই-পেপার-সিঙ্ক-বট (রানবুক: `epaper-bot/README.md`) |
| `legacy-static-site/` | পুরনো static-HTML ভার্সন — শুধু-সংরক্ষণাগার |
| `ensure-server.sh` | লোকাল-QA সার্ভার (:8094) |
| `worklog.md` | সেশন-ধারাবাহিক হাতোভার-ডক — কাজের-আগে-পড়ো, শেষে-যোগ-করো |

## 🚀 লোকাল QA

```bash
bash ensure-server.sh        # → http://localhost:8094
```

## 🚀 ডিপ্লয়

- **Vercel** — প্রজেক্ট `lekhok-forum` (Express via `api/index.js`, region `bom1`, কনফিগ: `lekhok-forum/vercel.json`)।
- **গোটচা**: কমিট-অথর অবশ্যই `rafsancuac@users.noreply.github.com` — নইলে Vercel `COMMIT_AUTHOR_REQUIRED`-ব্লক।

## 🤖 বট-অপারেশন

```bash
bash epaper-bot/bot-keeper.sh    # exit 0=সুস্থ · 2=.env-নেই · 3=প্রতীক্ষিত · 4=স্টার্ট-ব্যর্থ
```

---

লাইভ: https://lekhok-forum.vercel.app — বাংলাদেশের শিক্ষার্থী-লেখক-সম্প্রদায়ের জন্য ❤️-দিয়ে-নির্মিত।
