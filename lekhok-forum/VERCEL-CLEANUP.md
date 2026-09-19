# লেখক-ফোরাম — Vercel ডিপ্লয়মেন্ট পরিষ্কার-রাখা (session171)

## সমস্যাটা কী ছিল

Vercel ড্যাশবোর্ডে **Functions Storage ১২.৩২ GB / ১০ GB** — ফ্রি-সীমা পার।

এটা কোনো ডাটাবেজ বা ফাইল-স্টোরেজ নয়। এটা হলো **প্রতিটি ডিপ্লয়মেন্টের ফাংশন-বান্ডেলের সমষ্টি**:
এই প্রজেক্টে `vercel.json`-এর `includeFiles` অনুযায়ী প্রতিটি ডিপ্লয়মেন্টে
`node_modules` (ট্রেসড) + `views/**` + `admin/views/**` + `public/**` — সব মিলিয়ে
বান্ডেল তৈরি হয়, আর পুরনো ডিপ্লয়মেন্টগুলো ড্যাশবোর্ডে জমতে থাকে। ২০–৩০টি ডিপ্লয়মেন্ট জমলেই সীমা পার হয়ে যায়।

> রিপো নিজে মাত্র **২৮.৫ MiB** (git size-pack) — GitHub পাশ থেকে কোনো সমস্যা নেই।
> গিটের ইতিহাস ঘাঁটার (BFG / filter-repo) **দরকার নেই, করবেন না**।

## সমাধান: সর্বশেষ ৫টি রেখে বাকিগুলো ডিলিট

### পদ্ধতি ১ — টার্মিনাল (এক-বার চালানো)

```bash
# রিপোর রুট থেকে:

# ① প্রথমে ড্রাই-রান — কী মোছা হবে শুধু দেখাবে, কিছুই মুছবে না
VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs --dry-run

# ② ঠিক থাকলে আসল ডিলিট
VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs

# রাখার সংখ্যা বদলাতে: --keep 10
```

**VERCEL_TOKEN কোথায় পাবেন:**
1. https://vercel.com/account/settings/tokens → **Add New…**
2. Scope: আপনার অ্যাকাউন্ট (Full Account) · Expiration: স্বল্প মেয়াদ দিন
3. কপি করে উপরের কমান্ডে বসান — ⚠️ এই টোকেন কোথাও কমিট/পেস্ট করবেন না

### পদ্ধতি ২ — দৈনিক অটোমেশন (GitHub Actions, এক-বার সেট করলেই চিরকাল)

`.github/workflows/vercel-cleanup.yml` **প্রতিদিন রাত ১২:০০টায় (ঢাকা-সময়)** স্ক্রিপ্টটা চালায়।
চালু করতে রিপোতে ৩টি সিক্রেট যোগ করুন —
**GitHub → Settings → Secrets and variables → Actions → New repository secret:**

| Secret | দরকার? | মান কোথায় পাবেন |
|---|---|---|
| `VERCEL_TOKEN` | ✅ আবশ্যিক | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | টিম-অ্যাকাউন্ট হলে | প্রজেক্ট → Settings → General → "Vercel Team ID" |
| `VERCEL_PROJECT_ID` | ঐচ্ছিক | প্রজেক্ট → Settings → General → "Project ID" |

> `VERCEL_PROJECT_ID` না দিলেও চলবে — স্ক্রিপ্ট `lekhok-forum` নাম-দিয়ে প্রজেক্ট খুঁজে নেয়।
> ম্যানুয়ালি চালাতে: **Actions ট্যাব → Vercel Deployment Cleanup → Run workflow** (keep ইনপুট দেওয়া যায়)।
> রান-শেষে লগের পাশাপাশি **Summary**-তে ডিলিট-তালিকা টেবিল আকারে দেখা যাবে।

## স্ক্রিপ্টের নিরাপত্তা-নিশ্চয়তা

- 🟢 **সর্বশেষ ৫টি সবসময় অক্ষত** — বর্তমানে-লাইভ প্রোডাকশন-ডিপ্লয়মেন্ট সবসময় এর ভেতরে থাকে
- 🟢 **BUILDING / QUEUED** অবস্থার ডিপ্লয়মেন্ট কখনো স্পর্শ হয় না
- 🟢 ভার্সেল নিজেই কারেন্ট-লাইভ ডিপ্লয়মেন্ট ডিলিটে বাধা দেয় — স্ক্রিপ্ট তাকে স্কিপ-লগ করে (ক্ষতি শূন্য)
- 🟢 ডিফল্ট **ড্রাই-রান নয়** — তাই প্রথমবার অবশ্যই `--dry-run` দিয়ে দেখে নিন
- রেট-লিমিটে অটো-রিট্রাই (৪ চেষ্টা), প্রতি-ডিলিটে ২৫০ms বিরতি

## সাথে যা যা যোগ হলো

- `lekhok-forum/scripts/cleanup-vercel-deployments.mjs` — মূল স্ক্রিপ্ট (নির্ভরতা-শূন্য, Node 18+)
- `.github/workflows/vercel-cleanup.yml` — দৈনিক অটোমেশন
- `lekhok-forum/.vercelignore` — **CLI-ডিপ্লয়ে** (`vercel` / `deploy-to-vercel.ps1`) ফাংশন-বান্ডেলে
  `scripts/ tests/ download/ *.md` যাবে না (রানটাইমে লাগে না)
  > নোট: GitHub-গিট-ডিপ্লয়ে `.vercelignore` প্রযোজ্য নয়; সেখানে Root Directory = `lekhok-forum`
  > সেট-থাকায় `epaper-bot/` ও `legacy-static-site/` আগে থেকেই আপলোডের বাইরে।

## Vercel-এর "Needs Attention" ওয়ার্নিং (Environment Variables) — ✅ সম্পন্ন (session177)

`SESSION_SECRET` ও `BLOB_READ_WRITE_TOKEN` — দুটোই এখন **Sensitive** (session177-এ Vercel API
দিয়ে টিক করা হয়েছে; মান হুবহু অপরিবর্তিত, শুধু ড্যাশবোর্ড/API থেকে আর পড়া যায় না —
decrypt-GET value-বিহীন প্রমাণিত)। uni-tracker-এর টোকেনগুলো আগে-ই sensitive ছিল।
ওয়ার্নিং এখন আর দেখাবে না।

- ভবিষ্যতে মান বদলাতে হলে: Settings → Environment Variables → ⋯ → Edit → নতুন মান দিয়ে ওভাররাইট
- এখনো encrypted (ঐচ্ছিক বাকি): `RESEND_API_KEY`, `EPAPER_SYNC_TOKEN`, `TURSO_AUTH_TOKEN`
  > ⚠️ সতর্কতা: Sensitive করলে `vercel env pull` আর মান দেয় না — bot/লোকাল-টুল যদি কোনোটা
  > pull করে থাকে, sensitive-করার আগে যাচাই করুন।

## ভবিষ্যৎ যাতে আবার না জমে

- এ-ওয়ার্কফ্লো চালু থাকলে দিনে একবার অটো-পরিষ্কার হবে — আর কিছু করা লাগবে না
- বড় ফাইল রিপো/`public/`-এ কমিট করবেন না (ই-পেপার PDF এখন ড্রাইভে + বট-পাইপলাইনে আছে — সঠিক)
- ⚠️ GitHub Actions-এর সি-ডিউল ৬০ দিন রিপো-নিষ্ক্রিয়তায় বন্ধ হয় — সাইট-অ্যাক্টিভ থাকলে সমস্যা নেই

## নিশ্চয়তা-যাচাই (session171)

মক-Vercel-সার্ভারে E2E: ৯ ডিপ্লয়মেন্ট → ড্রাই-রানে "৩টি মোছা হতো" ✓ → আসল রানে ঠিক ২টি মুছে
`DEPLOYMENT_IS_CURRENT`-ওয়ালা স্কিপ ✓ → BUILDING অস্পৃশ্য ✓ → exit-code সঠিক ✓
