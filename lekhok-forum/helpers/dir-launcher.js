'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   dir-launcher.js — ফোরাম ডিরেক্টরি রেজিস্ট্রি (সেশন ১৪৭)
   ───────────────────────────────────────────────────────────────────────────
   সমস্যা: পুরনো "আরও" মেগামেনু (header.ejs) ৪-কলাম ই-কমার্স-স্টাইল —
     ① মনোক্রোম আইকন, সাব-টাইটেল-শূন্য  ② ক্যাটাগরি-ডুপ্লিকেট (ঘোষণা/বিজ্ঞপ্তি,
     আয়োজন/ইভেন্ট একই href দুইবার)  ③ "আরও"-কলামের-ভেতরে-আরও।

   সমাধান: FB ৯-ডট অ্যাপ-লঞ্চার প্যারিটি — ৩টি সুনির্দিষ্ট ডোমেইনে ১২ আইটেম,
   প্রতিটিতে Title + এক-লাইনের Subtitle + টোন-টোকেন স্কুইর্কল আইকন।

   রীতি (notifGroups-চুক্তি): হেডার-লঞ্চার (header.ejs #dlxPanel) ও ফিড
   লেফট-রেল (dashboard.ejs .feed-rail) দুই-সারফেস **এক-রেজিস্ট্রি** —
   নতুন ফিচার যোগ হলে শুধু এখানে যোগ হবে, ড্রিফট/ডুপ্লিকেট-অসম্ভব।

   ফিল্ড-চুক্তি:
     label  — আইটেম-শিরোনাম (সংক্ষিপ্ত)
     desc   — এক-লাইনের সাব-টাইটেল (সারফেসে truncate)
     href   — লক্ষ্য-রুট (সবই কোডবেস-প্রমাণিত routes/daily|social|pages.js)
     icon   — FontAwesome ক্লাস (কোডবেসে-ইতোমধ্যে-ব্যবহৃত নাম)
     tone   — TONE_TOKENS-কী (tokens.css --lf-* রেফ; হেক্স-শূন্য নীতি)
     rail   — ফিড লেফট-রেলে দৃশ্যমান কি না
     railHighlight — রেলে ব্র্যান্ড-টিন্ট হাইলাইট (দৈনিক ই-পেপার)
   ═══════════════════════════════════════════════════════════════════════════ */

/* টোন → tokens.css টোকেন-রেফ (নতুন টোকেন সেশন-১৪৭-ব্লকে; শুধু এখানেই ম্যাপড) */
const TONE_TOKENS = {
  brand:  '--lf-brand-primary',
  social: '--lf-social-blue',
  love:   '--lf-reaction-love',
  angry:  '--lf-reaction-angry',
  amber:  '--lf-dlx-amber',
  gold:   '--lf-dlx-gold',
  cyan:   '--lf-dlx-cyan',
  violet: '--lf-dlx-violet',
  pink:   '--lf-dlx-pink',
  slate:  '--lf-dlx-slate'
};

const DIR_SECTIONS = [
  {
    key: 'knowledge',
    title: 'জ্ঞান ও সাহিত্য কর্নার',
    items: [
      { label: 'সকল লেখা',           desc: 'সাম্প্রতিক সাহিত্যকর্ম ও ফিচার',      href: '/articles',    icon: 'fa-pen-nib',         tone: 'brand',  rail: true },
      { label: 'প্রশ্নোত্তর (Q&A)',    desc: 'পাঠ ও লেখার জিজ্ঞাসা',               href: '/qa',          icon: 'fa-question-circle', tone: 'social', rail: true },
      { label: 'রিসোর্স ও ফাইল',      desc: 'গবেষণা, পাণ্ডুলিপি ও সহায়ক বই',     href: '/resources',   icon: 'fa-folder-open',     tone: 'amber',  rail: false },
      { label: 'আজকের ই-পেপার',       desc: 'দৈনিক সাহিত্য পাতা ও বুলেটিন',       href: '/epaper',      icon: 'fa-newspaper',       tone: 'love',   rail: true, railHighlight: true }
    ]
  },
  {
    key: 'forum',
    title: 'ফোরাম ও প্রাতিষ্ঠানিক কার্যক্রম',
    items: [
      { label: 'বিজ্ঞপ্তি ও ঘোষণা',    desc: 'দাপ্তরিক নোটিশ বোর্ড',               href: '/notices',     icon: 'fa-bullhorn',        tone: 'cyan',   rail: true },
      { label: 'ইভেন্ট ও আয়োজন',      desc: 'সাহিত্য আড্ডা ও কর্মশালা',           href: '/events',      icon: 'fa-calendar-alt',    tone: 'angry',  rail: true },
      { label: 'সাংগঠনিক কার্যক্রম',   desc: 'কমিটি ও মিটিং এজেন্ডা',              href: '/activities',  icon: 'fa-calendar-check',  tone: 'slate',  rail: false },
      { label: 'সেরা লেখক',           desc: 'মাসিক স্বীকৃতি ও পুরস্কার',          href: '/best-writer', icon: 'fa-star',            tone: 'gold',   rail: true },
      { label: 'অর্জন ও সম্মাননা',     desc: 'স্মারক স্বীকৃতির প্রাচীর',           href: '/achievements', icon: 'fa-trophy',         tone: 'amber',  rail: false }
    ]
  },
  {
    key: 'daily',
    title: 'দৈনন্দিন ফিচার ও স্মৃতি',
    items: [
      { label: 'এই দিনে',             desc: 'বিগত বছরের আজকের লেখা',             href: '/on-this-day', icon: 'fa-calendar-day',    tone: 'violet', rail: true },
      { label: 'আজকের জন্মদিন',       desc: 'সহ-লেখকদের শুভেচ্ছা জানান',         href: '/birthdays',   icon: 'fa-birthday-cake',   tone: 'pink',   rail: false },
      { label: 'আজকের কুইজ',          desc: 'প্রাত্যহিক সাহিত্য পরীক্ষা',         href: '/quiz',        icon: 'fa-brain',           tone: 'cyan',   rail: true }
    ]
  }
];

/* টোন → টোকেন-রেফ বেক (ভিউতে style="--dlx-t: var(<%= it.tok %>)") */
for (const sec of DIR_SECTIONS) {
  for (const it of sec.items) {
    it.tok = TONE_TOKENS[it.tone] || TONE_TOKENS.brand;
  }
}

/* ফিড লেফট-রেল: ফ্ল্যাট তালিকা — রেল-ক্রম এখানেই নিয়ন্ত্রিত (রেজিস্ট্রি-বাইরে ডুপ্লিকেট-অসম্ভব) */
const DIR_RAIL_ORDER = ['/epaper', '/articles', '/qa', '/events', '/on-this-day', '/notices', '/best-writer', '/quiz'];
const _railFlat = [];
for (const sec of DIR_SECTIONS) {
  for (const it of sec.items) if (it.rail) _railFlat.push(it);
}
const DIR_RAIL = DIR_RAIL_ORDER
  .map(h => _railFlat.find(i => i.href === h))
  .filter(Boolean)
  .concat(_railFlat.filter(i => !DIR_RAIL_ORDER.includes(i.href)));

module.exports = { DIR_SECTIONS, DIR_RAIL, TONE_TOKENS };
