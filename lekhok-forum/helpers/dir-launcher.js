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
     core   — (সেশন ১৫৯) কোর-সেকশন-ফ্ল্যাগ — রেলে শিরোনাম-শূন্য টপ-ব্লক (FB Saved/
              Memories/Groups/Pages প্যারিটি); হেডার-প্যানেলে sec.title দেখায়
     secKey/secTitle — (সেশন ১৫৯) বেক-লুপে যোগ হয় — রেল-সার্চের সেকশন-গ্রুপিং-সোর্স
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
    /* সেশন ১৫৯ (ইউজার-স্পেক: FB-কোর-শর্টকাট): সংরক্ষিত লেখা/মেমোরিজ/গ্রুপ/পেজ — রেলের
       সর্বাগ্রে শিরোনাম-শূন্য টপ-ব্লক। রুট-ম্যাপ (ইন্টেন্ট-অনুবাদ): /saved→/bookmarks,
       /memories→/on-this-day ('এই দিনে' কোর-ব্লকে প্রতিস্থাপিত), /groups→/messages
       (গ্রুপ-চ্যাট), /pages→/press (প্রেস-ক্লিপিং = ফোরামের পত্রিকা-পাতা)। */
    key: 'core',
    title: 'দ্রুত অ্যাক্সেস',
    core: true,
    items: [
      { label: 'সংরক্ষিত লেখা',  desc: 'বুকমার্ক করা লেখা ও পোস্ট',   href: '/bookmarks',   icon: 'fa-bookmark',       tone: 'gold',   rail: true },
      { label: 'স্মৃতি ও মেমোরিজ', desc: 'বিগত বছরের আজকের লেখা',      href: '/on-this-day', icon: 'fa-hourglass-half', tone: 'violet', rail: true },
      { label: 'পাঠচক্র ও গ্রুপ',  desc: 'গ্রুপ-আলাপ ও পাঠচক্র',        href: '/messages',    icon: 'fa-users',          tone: 'social', rail: true },
      { label: 'পত্রিকা ও পেজ',   desc: 'প্রেস, প্রকাশনা ও পাতা',       href: '/press',       icon: 'fa-flag',           tone: 'cyan',   rail: true }
    ]
  },
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
      { label: 'অর্জন ও সম্মাননা',     desc: 'স্মারক স্বীকৃতির প্রাচীর',           href: '/achievements', icon: 'fa-trophy',         tone: 'amber',  rail: false },
      { label: 'মতামত ও ফিডব্যাক',     desc: 'অভিযোগ ও পরামর্শ জানান',            href: '/complaints',  icon: 'fa-comment-dots',    tone: 'brand',  rail: true }
    ]
  },
  {
    key: 'daily',
    title: 'দৈনন্দিন ফিচার',
    items: [
      { label: 'আজকের জন্মদিন',       desc: 'সহ-লেখকদের শুভেচ্ছা জানান',         href: '/birthdays',   icon: 'fa-birthday-cake',   tone: 'pink',   rail: false },
      { label: 'আজকের কুইজ',          desc: 'প্রাত্যহিক সাহিত্য পরীক্ষা',         href: '/quiz',        icon: 'fa-brain',           tone: 'cyan',   rail: true }
    ]
  }
];

/* ── সেশন ১৫৬ (ইউজার-স্পেক: FB-স্টাইল বাম-রেল পূর্ণাঙ্গ ডিরেক্টরি) ───────────
   ইউজার: "ডান দিকের আরও আইটেমের সকল কন্টেন্ট বাম প্যানেলে নিয়ে আসুন" — অর্থাৎ
   হেডার-লঞ্চারের ১২ আইটেমই এখন ফিড লেফট-রেলে সেকশন-শিরোনামসহ স্থায়ীভাবে থাকবে।
   ফলে rail:false ফ্ল্যাগ অপ্রচলিত — সব rail:true (উত্তরাধিকার-ফিল্ড রাখা হলো,
   কেউ ব্যবহার না-ও করতে পারে)। রেলে এখন desc + badge-ও রেন্ডার হয়। ── */

/* ── সেশন ১৫৭: সেবাসমূহ ও আর্কাইভ (কদাচিৎ-ব্যবহৃত সহায়ক ও প্রশাসনিক ফিচার) ──
   ইউজার-স্পেক (MoreUtilitiesMenu): "আরও সেকশনে এমন কিছু যুক্ত করুন যা অন্য
   কোথাও থাকবে না, কম কাজে আসে বা আসতে পারে" — হেডার-লঞ্চার-প্যানেল এখন এই
   ইউটিলিটি-রেজিস্ট্রি রেন্ডার করবে (ডিরেক্টরি বাম-রেলে স্থায়ী)।
   href সবই routes/utilities.js-এ বাস্তব-পেজ (404-শূন্য চুক্তি)। */
const UTIL_SECTIONS = [
  {
    key: 'lang-tools',
    title: 'ভাষা ও সম্পাদনা সরঞ্জাম',
    items: [
      { label: 'প্রমিত বানান পরীক্ষক ও অভিধান', desc: 'বাংলা একাডেমি প্রমিত বানান যাচাই ও সমার্থক শব্দভাণ্ডার', href: '/tools/spell-checker', icon: 'fa-spell-check', tone: 'cyan' },
      { label: 'ইউনিকোড ও ফন্ট কনভার্টার',     desc: 'বিজয়-যুগের টেক্সট পরিষ্কার, সংখ্যা ও যতিচিহ্ন রূপান্তর টুল',   href: '/tools/font-converter', icon: 'fa-arrow-right-arrow-left', tone: 'social' }
    ]
  },
  {
    key: 'admin-member',
    title: 'প্রশাসনিক ও সদস্য সনদ',
    items: [
      { label: 'সদস্যপদ সনদ ও আইডি কার্ড',       desc: 'ডিজিটাল সদস্য সনদ ও প্রেস পাস প্রিন্ট/ডাউনলোড',            href: '/me/certificate', icon: 'fa-id-card', tone: 'gold' },
      { label: 'পাণ্ডুলিপি কপিরাইট ও চৌর্যবৃত্তি রিপোর্ট', desc: 'লেখাচুরির বিরুদ্ধে আনুষ্ঠানিকভাবে অভিযোগ দাখিল',       href: '/support/dmca-report', icon: 'fa-scale-balanced', tone: 'angry' }
    ]
  },
  {
    key: 'archive-research',
    title: 'সংগ্রহশালা ও গবেষণা',
    items: [
      { label: 'ঐতিহাসিক আর্কাইভ (প্রতিষ্ঠা-অবধি)', desc: 'বিগত বছরের পুরোনো সংখ্যা, প্রকাশনা ও বিরল লেখা',          href: '/archive', icon: 'fa-box-archive', tone: 'amber' },
      { label: 'ব্লাইন্ড পিয়ার-রিভিউ প্যানেল',     desc: 'জ্যেষ্ঠ লেখকদের নিরপেক্ষ পাণ্ডুলিপি যাচাই ব্যবস্থা',           href: '/peer-review', icon: 'fa-user-secret', tone: 'violet' }
    ]
  },
  {
    key: 'institutional',
    title: 'প্রাতিষ্ঠানিক সংযোগ',
    items: [
      { label: 'বিজ্ঞাপন ও স্পন্সরশিপ নীতিমালা',   desc: 'ফোরামের সাহিত্য প্রকাশনায় বিজ্ঞাপন ও অর্থায়ন গাইড',        href: '/sponsorship', icon: 'fa-briefcase', tone: 'pink' },
      { label: 'কীবোর্ড শর্টকাটস ও টাইপিং চিটশিট', desc: 'দ্রুত টাইপিং ও ন্যাভিগেশনের সম্পূর্ণ গাইড',                  href: '/shortcuts', icon: 'fa-keyboard', tone: 'slate' }
    ]
  }
];

/* টোন → টোকেন-রেফ বেক (ভিউতে style="--dlx-t: var(<%= it.tok %>)")
   + সেকশন-ট্যাগ (সেশন ১৫৯ — রেল-সার্চের গ্রুপিং/টাইটেল-সোর্স) */
for (const sec of [...DIR_SECTIONS, ...UTIL_SECTIONS]) {
  for (const it of sec.items) {
    it.tok = TONE_TOKENS[it.tone] || TONE_TOKENS.brand;
    it.secKey = sec.key;
    it.secTitle = sec.title;
  }
}
for (const sec of DIR_SECTIONS) {
  if (sec.core) for (const it of sec.items) it.core = true;
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

module.exports = { DIR_SECTIONS, DIR_RAIL, UTIL_SECTIONS, TONE_TOKENS };
