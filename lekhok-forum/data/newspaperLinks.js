// ============================================================
// session-226 · সংবাদপত্র ডিরেক্টরি (e-paper dual view — Tab 2)
// Single source of truth: routes/epaper.js এই তালিকা লোড করে
// views/epaper.ejs-এ `newspapers` লোকাল হিসেবে পাঠায়।
// ক্যাটাগরি: national | regional | english | international
// ============================================================
module.exports = [
  // ================= ১. জাতীয় পত্রিকা (বাংলা) =================
  { name: 'প্রথম আলো', category: 'national', lang: 'bn', url: 'https://epaper.prothomalo.com/', isPopular: true },
  { name: 'ইত্তেফাক', category: 'national', lang: 'bn', url: 'https://epaper.ittefaq.com.bd/', isPopular: true },
  { name: 'যুগান্তর', category: 'national', lang: 'bn', url: 'https://epaper.jugantor.com/', isPopular: true },
  { name: 'কালের কণ্ঠ', category: 'national', lang: 'bn', url: 'https://www.kalerkantho.com/epaper', isPopular: true },
  { name: 'সমকাল', category: 'national', lang: 'bn', url: 'https://epaper.samakal.com/', isPopular: true },
  { name: 'বাংলাদেশ প্রতিদিন', category: 'national', lang: 'bn', url: 'https://www.bd-pratidin.com/epaper', isPopular: true },
  { name: 'বণিক বার্তা', category: 'national', lang: 'bn', url: 'https://epaper.bonikbarta.com/', isPopular: true },
  { name: 'আমার দেশ', category: 'national', lang: 'bn', url: 'https://eamardesh.com/' },
  { name: 'নয়া দিগন্ত', category: 'national', lang: 'bn', url: 'https://www.enayadiganta.com/' },
  { name: 'কালবেলা', category: 'national', lang: 'bn', url: 'https://epaper.kalbela.com/' },
  { name: 'ইনকিলাব', category: 'national', lang: 'bn', url: 'https://epaper.dailyinqilab.com/' },
  { name: 'মানবজমিন', category: 'national', lang: 'bn', url: 'https://www.mzamin.com/print' },
  { name: 'দেশ রূপান্তর', category: 'national', lang: 'bn', url: 'https://epaper.deshrupantor.com/' },
  { name: 'প্রতিদিনের বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.protidinerbangladesh.com/' },
  { name: 'দৈনিক বাংলা', category: 'national', lang: 'bn', url: 'https://epaper.dainikbangla.com.bd/' },
  { name: 'আজকের পত্রিকা', category: 'national', lang: 'bn', url: 'https://epaper.ajkerpatrika.com/' },
  { name: 'আমাদের সময়', category: 'national', lang: 'bn', url: 'https://epaper.dainikamadershomoy.com/' },
  { name: 'ভোরের কাগজ', category: 'national', lang: 'bn', url: 'https://epaper.bhorerkagoj.com/' },
  { name: 'যায়যায়দিন', category: 'national', lang: 'bn', url: 'https://epaper.jaijaidin.news/' },
  { name: 'জনকণ্ঠ', category: 'national', lang: 'bn', url: 'https://epaper.dailyjanakantha.com/' },
  { name: 'দিনকাল', category: 'national', lang: 'bn', url: 'https://epaperdinkal.com/' },
  { name: 'শেয়ার বিজ', category: 'national', lang: 'bn', url: 'https://esharebiz.net/' },
  { name: 'রূপালী বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.rupalibangladesh.com/' },
  { name: 'বিজনেস বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.businessbangladesh.com.bd/' },

  // ================= ২. চট্টগ্রাম ও আঞ্চলিক পত্রিকা =================
  { name: 'দৈনিক আজাদী (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://edainikazadi.net/', isPopular: true },
  { name: 'দৈনিক পূর্বকোণ (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://www.edainikpurbokone.net/', isPopular: true },
  { name: 'সুপ্রভাত বাংলাদেশ (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://www.esuprobhat.com/' },
  { name: 'করতোয়া (বগুড়া/উত্তরবঙ্গ)', category: 'regional', lang: 'bn', url: 'https://www.ekaratoa.com/' },
  { name: 'অগ্নিশিখা', category: 'regional', lang: 'bn', url: 'https://www.thedailyagnishikha.com/mfitmagazine/' },
  { name: 'ইনফো বাংলা', category: 'regional', lang: 'bn', url: 'https://www.einfobangla.com/' },
  { name: 'সকালের বাণী', category: 'regional', lang: 'bn', url: 'https://epaper.sokalerbani.com/' },

  // ================= ৩. ইংরেজি পত্রিকা (English Papers) =================
  { name: 'The Daily Star', category: 'english', lang: 'en', url: 'https://epaper.thedailystar.net/', isPopular: true },
  { name: 'Dhaka Tribune', category: 'english', lang: 'en', url: 'https://epaper.dhakatribune.com/', isPopular: true },
  { name: 'New Age', category: 'english', lang: 'en', url: 'https://epaper.newagebd.net/' },
  { name: 'Daily Sun', category: 'english', lang: 'en', url: 'https://epaper.daily-sun.com/' },
  { name: 'The Financial Express', category: 'english', lang: 'en', url: 'https://epaper.thefinancialexpress.com.bd/' },
  { name: 'The Bangladesh Today', category: 'english', lang: 'en', url: 'https://epaper.thebangladeshtoday.com/' },
  { name: 'The Daily Observer', category: 'english', lang: 'en', url: 'https://epaper.observerbd.com/' },
  { name: 'Bangladesh Post', category: 'english', lang: 'en', url: 'https://www.bangladeshpost.net/epaper' },

  // ================= ৪. আন্তর্জাতিক পত্রিকা =================
  { name: 'The Hindu (India)', category: 'international', lang: 'en', url: 'https://epaper.thehindu.com/reader' },
  { name: 'একদিন (কলকাতা)', category: 'international', lang: 'bn', url: 'https://www.ekdin-epaper.com/' },
  { name: 'এই সময় (কলকাতা)', category: 'international', lang: 'bn', url: 'https://epaper.eisamay.com/' },
  { name: 'সংবাদ প্রতিদিন (কলকাতা)', category: 'international', lang: 'bn', url: 'https://epaper.sangbadpratidin.in/' },
  { name: 'ঠিকানা (যুক্তরাষ্ট্র)', category: 'international', lang: 'bn', url: 'https://e.thikananews.com/' },
  { name: 'জাগো বাংলা', category: 'international', lang: 'bn', url: 'https://epaper.jagobangla.in/' }
];
