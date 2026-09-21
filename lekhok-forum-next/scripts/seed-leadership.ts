/**
 * Session 189 — scripts/seed-leadership.ts
 *
 * নেতৃত্ব-টেবিলের প্রাথমিক ডেটা:
 *  ① ডেমো-ইউজার 'ismail'-কে role='admin' করা (অ্যাডমিন-প্যানেল গার্ডের জন্য)
 *  ② FOUNDING = প্রতিষ্ঠাতা পরিষদ (২০২০-২১ কার্যবর্ষ — প্রোডাকশন members-টেবিল থেকে নেওয়া ৮ জন)
 *  ③ CURRENT  = বর্তমান নেতৃত্ব (২০২৫-২৬ কার্যবর্ষ — ১৫ সদস্যের কমিটি)
 * বাণী: Express-অ্যাপের data/leaderStatements.js-এর প্রকৃত বক্তব্য (সভাপতি ও সাধারণ সম্পাদক স্লটে)।
 *
 * চালানো: bun scripts/seed-leadership.ts [--force]
 * ডিফল্টে একবার-সিড (টেবিল খালি থাকলে); --force দিলে মুছে-আবার-সিড।
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const TERM_FOUNDING = '(২০২০-২১ কার্যবর্ষ)'
const TERM_CURRENT = '(২০২৫-২৬ কার্যবর্ষ)'

/* Express-অ্যাপের data/leaderStatements.js থেকে প্রকৃত বক্তব্য */
const QUOTE_founder_president =
  'চট্টগ্রাম বিশ্ববিদ্যালয়ের তরুণ লেখকদের নিয়ে এই ফোরাম গড়ার স্বপ্নটা আমাদের ছিল বহু আগে থেকে। মাত্র কয়েকজন মানুষের হাত ধরে শুরু হওয়া যাত্রা আজ শত সদস্যের পরিবার। বিশ্বাস করি, শব্দের শক্তিতেই বদলায় সমাজ, আর সেই শক্তিকে গুছিয়ে সাজানোই আমাদের অঙ্গীকার। যে-তরুণ আজ প্রথম কলম ধরেছে, সে যেন একদিন দেশের শ্রেষ্ঠ কলামিস্ট হয়ে ওঠে; এই প্রত্যাশা নিয়েই আমরা পথ চলেছি। প্রতিটি সদস্যের প্রথম প্রকাশিত লেখাই আমার কাছে জীবনের সবচেয়ে বড় পুরস্কার; লেখক ফোরাম তাই আমাদের ভালোবাসার প্রতিদান।'

const QUOTE_founder_general_secretary =
  'প্রতিষ্ঠার শুরুতে আমাদের সামনে প্রশ্ন ছিল একটাই, শিক্ষার্থীদের লেখালেখির অনুশীলন হবে কোথায়? উত্তর হিসেবেই জন্ম নিয়েছিল লেখক ফোরাম। সদস্য তালিকা গোছানো, সেমিনার আয়োজন, দেয়ালিকা প্রকাশ আর নতুনদের উৎসাহ জোগানো, সবই ছিল আমার দায়িত্বের অংশ। আজও মনে হয়, কলমের ঝুলি বুকে নিয়ে যারা হাঁটতে শেখে, তারা কখনো হারায় না। এই ফোরামের প্রতিটি সদস্য আমার কাছে পরিবারের মানুষের মতো; তাদের প্রতিটি প্রকাশিত লেখা পড়ে আজও বিগত দিনের স্মৃতি হাতছানি করে ডাকে, আর মনে হয় সংগ্রামটা সার্থক হয়েছে।'

const QUOTE_current_president =
  'প্রতিষ্ঠাতাদের হাত ধরে গড়া এই ফোরামের দায়িত্ব বহন করা আমাদের জন্য গর্বের, আবার সমানই দায়। এই কার্যবর্ষে আমাদের লক্ষ্য, নতুন সদস্য সংগ্রহ, নিয়মিত কর্মশালার আয়োজন আর দেশের প্রতিষ্ঠিত পত্রিকায় সদস্যদের লেখা প্রকাশের সুযোগ তৈরি করা। আমরা বিশ্বাস করি, মুক্ত চিন্তার অনুশীলনই সুনাগরিক সমাজ গড়ার প্রথম ধাপ, আর কলম তার শ্রেষ্ঠ হাতিয়ার। প্রতিষ্ঠাতা সদস্যদের স্বপ্ন সত্যি করতে প্রতিটি সদস্যকে সঙ্গে নিয়েই কাজ করে যাচ্ছি আমরা; ফোরামের পতাকা যেন সম্মান নিয়ে উড়ে, সেটাই আমাদের প্রতিজ্ঞা।'

const QUOTE_current_general_secretary =
  'সাধারণ সম্পাদক হিসেবে আমার দায়িত্ব, ফোরামের প্রতিটি কার্যক্রম গুছিয়ে রাখা আর সদস্যদের মতামতের ওপর ভর করে সিদ্ধান্ত নেওয়া। এই কার্যবর্ষে আমরা চালু করেছি মাসিক লেখালেখি প্রতিযোগিতা, অতিথি সেমিনার আর অনলাইন সংকলন প্রকাশ। প্রতিটি সদস্যের লেখা যেন পাঠকের কাছে পৌঁছায়; সেটাই আমাদের অগ্রাধিকার। প্রতিষ্ঠাতারা যে আদর্শ আর পরিশ্রমের ভিত্তি রেখে গেছেন, সেই পথেই দলবদ্ধভাবে এগোচ্ছি আমরা। নতুন যাঁরা যুক্ত হতে চান, তাঁদের জন্য দরজা সবসময় খোলা; কলম হাতে নিয়েই যোগ দিন, পরিবার অপেক্ষায় রইল।'

/* প্রোডাকশন members-টেবিলের ২০২০-২১ (প্রতিষ্ঠাতা পরিষদ) থেকে */
const FOUNDING: [string, string, string | null][] = [
  ['আরমান শেখ', 'সভাপতি', QUOTE_founder_president],
  ['মো. রাফছান', 'সাধারণ সম্পাদক', QUOTE_founder_general_secretary],
  ['নেজাম উদ্দীন', 'সাংগঠনিক সম্পাদক', null],
  ['আকিজ মাহমুদ', 'দপ্তর সম্পাদক', null],
  ['মুশফিকুর রহমান ইমন', 'উপদপ্তর সম্পাদক', null],
  ['রাব্বি হাসান', 'অর্থ সম্পাদক', null],
  ['জান্নাতুল ফেরদৌস সায়মা', 'প্রচার সম্পাদিকা', null],
  ['আয়শা সিদ্দিকা', 'উপপ্রচার সম্পাদিকা', null],
]

/* প্রোডাকশন members-টেবিলের ২০২৫-২৬ কার্যনির্বাহী কমিটি থেকে */
const CURRENT: [string, string, string | null][] = [
  ['ইসমাইল হোসেন ইমন', 'সভাপতি', QUOTE_current_president],
  ['মোনেম শাহরিয়ার শাওন', 'সাধারণ সম্পাদক', QUOTE_current_general_secretary],
  ['রাসেল হোসেন সাকিব', 'যুগ্ম সাধারণ সম্পাদক', null],
  ['আজিজ ওয়েসি', 'সাংগঠনিক সম্পাদক', null],
  ['কারিশমা ইরিন এ্যামি', 'সহ-সাংগঠনিক সম্পাদক', null],
  ['জান্নাতুল ফেরদৌস ইকরা', 'অর্থ সম্পাদক', null],
  ['মোঃ রেজাউল করিম', 'দপ্তর সম্পাদক', null],
  ['সানজিদা আফরোজ', 'সহ-দপ্তর সম্পাদক', null],
  ['মোঃ নাঈম মিজি', 'সাহিত্য ও প্রকাশনা সম্পাদক', null],
  ['মাহফুজ রহমান', 'প্রচার সম্পাদক', null],
  ['নুসরাত সুলতানা', 'প্রশিক্ষণ বিষয়ক সম্পাদক', null],
  ['মাহমুদুল হাসান শাকিব', 'তথ্য ও প্রযুক্তি সম্পাদক', null],
  ['আব্দুল্লাহ আল নাঈম', 'সম্পাদকীয় পর্ষদ সদস্য', null],
  ['আবরার আহাদ রাফি', 'কার্যনির্বাহী সদস্য', null],
  ['ঋতু আক্তার', 'কার্যনির্বাহী সদস্য', null],
]

/* Task61: উপদেষ্টা পরিষদ — [নাম, পদবী, username(অ্যাপ-অ্যাকাউন্ট থাকলে), বাণী] */
const ADVISOR: Array<[string, string, string, string | null]> = [
  ['অধ্যাপক ড. রফিকুল আলম', 'উপদেষ্টা', 'rafik.alam', null],
]

async function main() {
  const force = process.argv.includes('--force')

  /* ① ডেমো-অ্যাডমিন */
  const admin = await db.user.updateMany({
    where: { username: 'ismail' },
    data: { role: 'admin' },
  })
  console.log(`admin-role: ${admin.count} user(s) promoted (ismail → admin)`)

  /* ②③ নেতৃত্ব-সিড */
  const existing = await db.leadershipMember.count()
  if (existing > 0 && !force) {
    console.log(`leadership: already seeded (${existing} rows) — স্কিপ (পুনঃসিডে --force)`)
    return
  }
  if (existing > 0) {
    const del = await db.leadershipMember.deleteMany({})
    console.log(`leadership: cleared ${del.count} old rows (--force)`)
  }

  await db.leadershipMember.createMany({
    data: [
      ...FOUNDING.map(([name, role, quote], i) => ({
        category: 'FOUNDING',
        name,
        role,
        term: TERM_FOUNDING,
        quote: quote ?? '',
        order: i + 1,
      })),
      ...CURRENT.map(([name, role, quote], i) => ({
        category: 'CURRENT',
        name,
        role,
        term: TERM_CURRENT,
        quote: quote ?? '',
        order: i + 1,
      })),
      ...ADVISOR.map(([name, role, username, quote], i) => ({
        category: 'ADVISOR',
        name,
        role,
        username,
        term: '',
        quote: quote ?? '',
        order: i + 1,
      })),
    ],
  })
  const total = await db.leadershipMember.count()
  console.log(`leadership: seeded — মোট ${total} জন (FOUNDING ${FOUNDING.length} + CURRENT ${CURRENT.length} + ADVISOR ${ADVISOR.length})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
