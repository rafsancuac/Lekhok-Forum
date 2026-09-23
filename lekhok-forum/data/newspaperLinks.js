// ============================================================
// session-227 · সংবাদপত্র ডিরেক্টরি (e-paper dual view — Tab 2)
// ৮২ পত্রিকা — প্রতিটি থাম্বনেইল manifest# + sha256-যাচাইকৃত (bycwf.org সংগ্রহ)
// মিশ্রণ-নিষিদ্ধ-নিশ্চয়তা: নাম ↔ URL-ডোমেইন ↔ manifest-নম্বর ↔ sha256 চতুঃস্তর-লক;
// ফাইলনেম NNN-ডোমেইন.png — এক পত্রিকার থাম্ব অন্য পত্রিকায় যাওয়া অসম্ভব।
// Single source of truth: routes/daily.js এই তালিকা /epaper-এ newspapers হিসেবে পাঠায়।
// ক্যাটাগরি: national | regional | english | international
// ============================================================
module.exports = [
  // ================= ১. জাতীয় পত্রিকা (বাংলা) =================
  { name: 'প্রথম আলো', category: 'national', lang: 'bn', url: 'https://epaper.prothomalo.com/', thumb: '/assets/img/epaper/007-prothomalo.com.png', isPopular: true }, // manifest #007 · sha256:6971acddef
  { name: 'ইত্তেফাক', category: 'national', lang: 'bn', url: 'https://epaper.ittefaq.com.bd/', thumb: '/assets/img/epaper/021-ittefaq.com.bd.png', isPopular: true }, // manifest #021 · sha256:a87f6800d0
  { name: 'যুগান্তর', category: 'national', lang: 'bn', url: 'https://epaper.jugantor.com/', thumb: '/assets/img/epaper/009-jugantor.com.png', isPopular: true }, // manifest #009 · sha256:01afeb8e92
  { name: 'কালের কণ্ঠ', category: 'national', lang: 'bn', url: 'https://www.kalerkantho.com/epaper', thumb: '/assets/img/epaper/023-kalerkantho.com.png', isPopular: true }, // manifest #023 · sha256:7eb6ad5036
  { name: 'সমকাল', category: 'national', lang: 'bn', url: 'https://epaper.samakal.com/', thumb: '/assets/img/epaper/010-samakal.com.png', isPopular: true }, // manifest #010 · sha256:66c579c56d
  { name: 'বাংলাদেশ প্রতিদিন', category: 'national', lang: 'bn', url: 'https://www.bd-pratidin.com/epaper', thumb: '/assets/img/epaper/004-bd-pratidin.com.png', isPopular: true }, // manifest #004 · sha256:32d50e6b10
  { name: 'বণিক বার্তা', category: 'national', lang: 'bn', url: 'https://epaper.bonikbarta.com/', thumb: '/assets/img/epaper/028-bonikbarta.com.png', isPopular: true }, // manifest #028 · sha256:c718b1042d
  { name: 'আমার দেশ', category: 'national', lang: 'bn', url: 'https://eamardesh.com/', thumb: '/assets/img/epaper/024-eamardesh.com.png' }, // manifest #024 · sha256:3b1e7c6860
  { name: 'নয়া দিগন্ত', category: 'national', lang: 'bn', url: 'https://www.enayadiganta.com/', thumb: '/assets/img/epaper/020-enayadiganta.com.png' }, // manifest #020 · sha256:46cb7de2fe
  { name: 'কালবেলা', category: 'national', lang: 'bn', url: 'https://epaper.kalbela.com/', thumb: '/assets/img/epaper/014-kalbela.com.png' }, // manifest #014 · sha256:607a0b6666
  { name: 'ইনকিলাব', category: 'national', lang: 'bn', url: 'https://epaper.dailyinqilab.com/', thumb: '/assets/img/epaper/011-dailyinqilab.com.png' }, // manifest #011 · sha256:468a912ffb
  { name: 'মানবজমিন', category: 'national', lang: 'bn', url: 'https://www.mzamin.com/print', thumb: '/assets/img/epaper/026-mzamin.com.png' }, // manifest #026 · sha256:5f7e1bfdf2
  { name: 'দেশ রূপান্তর', category: 'national', lang: 'bn', url: 'https://epaper.deshrupantor.com/', thumb: '/assets/img/epaper/006-deshrupantor.com.png' }, // manifest #006 · sha256:e7bca50318
  { name: 'প্রতিদিনের বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.protidinerbangladesh.com/', thumb: '/assets/img/epaper/005-protidinerbangladesh.com.png' }, // manifest #005 · sha256:434e35d851
  { name: 'দৈনিক বাংলা', category: 'national', lang: 'bn', url: 'https://epaper.dainikbangla.com.bd/', thumb: '/assets/img/epaper/002-dainikbangla.com.bd.png' }, // manifest #002 · sha256:23a2767afc
  { name: 'আজকের পত্রিকা', category: 'national', lang: 'bn', url: 'https://epaper.ajkerpatrika.com/', thumb: '/assets/img/epaper/017-ajkerpatrika.com.png' }, // manifest #017 · sha256:cc471aa4f2
  { name: 'আমাদের সময়', category: 'national', lang: 'bn', url: 'https://epaper.dainikamadershomoy.com/', thumb: '/assets/img/epaper/033-dainikamadershomoy.com.png' }, // manifest #033 · sha256:75663d5904
  { name: 'ভোরের কাগজ', category: 'national', lang: 'bn', url: 'https://epaper.bhorerkagoj.com/', thumb: '/assets/img/epaper/035-bhorerkagoj.com.png' }, // manifest #035 · sha256:e50a749688
  { name: 'যায়যায়দিন', category: 'national', lang: 'bn', url: 'https://epaper.jaijaidin.news/', thumb: '/assets/img/epaper/027-jaijaidin.news.png' }, // manifest #027 · sha256:95a37c9839
  { name: 'জনকণ্ঠ', category: 'national', lang: 'bn', url: 'https://epaper.dailyjanakantha.com/', thumb: '/assets/img/epaper/022-dailyjanakantha.com.png' }, // manifest #022 · sha256:b37fb4fb82
  { name: 'দিনকাল', category: 'national', lang: 'bn', url: 'https://epaperdinkal.com/', thumb: '/assets/img/epaper/012-epaperdinkal.com.png' }, // manifest #012 · sha256:5dd4e2fb3c
  { name: 'শেয়ার বিজ', category: 'national', lang: 'bn', url: 'https://esharebiz.net/', thumb: '/assets/img/epaper/034-esharebiz.net.png' }, // manifest #034 · sha256:e11bd7b17a
  { name: 'রূপালী বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.rupalibangladesh.com/', thumb: '/assets/img/epaper/015-rupalibangladesh.com.png' }, // manifest #015 · sha256:8878e435b7
  { name: 'বিজনেস বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.businessbangladesh.com.bd/', thumb: '/assets/img/epaper/048-businessbangladesh.com.bd.png' }, // manifest #048 · sha256:7b3419605c
  { name: 'আজকালের খবর', category: 'national', lang: 'bn', url: 'https://epaper.ajkalerkhobor.net/', thumb: '/assets/img/epaper/001-ajkalerkhobor.net.png' }, // manifest #001 · sha256:34abe19d89
  { name: 'ডেল্টাটাইমস', category: 'national', lang: 'bn', url: 'https://epaper.deltatimes24.com/', thumb: '/assets/img/epaper/003-deltatimes24.com.png' }, // manifest #003 · sha256:41290d7384
  { name: 'সোনার বাংলা', category: 'national', lang: 'bn', url: 'https://epaper.weeklysonarbangla.net/2026/03/06/page-01', thumb: '/assets/img/epaper/008-weeklysonarbangla.net.png' }, // manifest #008 · sha256:a1c829f066
  { name: 'সংগ্রাম', category: 'national', lang: 'bn', url: 'https://epaper.dailysangram.com/', thumb: '/assets/img/epaper/013-dailysangram.com.png' }, // manifest #013 · sha256:251cfaa207
  { name: 'খবরের কাগজ', category: 'national', lang: 'bn', url: 'https://epaper.khaborerkagoj.com/', thumb: '/assets/img/epaper/016-khaborerkagoj.com.png' }, // manifest #016 · sha256:aae150c41f
  { name: 'এই বাংলা', category: 'national', lang: 'bn', url: 'https://epaper.dailyeaibangla.com/', thumb: '/assets/img/epaper/018-dailyeaibangla.com.png' }, // manifest #018 · sha256:4686b3074f
  { name: 'সংবাদ', category: 'national', lang: 'bn', url: 'https://epaper.sangbad.net/', thumb: '/assets/img/epaper/019-sangbad.net.png' }, // manifest #019 · sha256:0d381281ab
  { name: 'আমার বার্তা', category: 'national', lang: 'bn', url: 'https://epaper.amarbarta.com/', thumb: '/assets/img/epaper/025-amarbarta.com.png' }, // manifest #025 · sha256:96ea1532a9
  { name: 'বাংলাদেশের খবর', category: 'national', lang: 'bn', url: 'https://epaper.bangladesherkhabor.net/', thumb: '/assets/img/epaper/029-bangladesherkhabor.net.png' }, // manifest #029 · sha256:64d7f8fe2f
  { name: 'আলোকিত বাংলাদেশ', category: 'national', lang: 'bn', url: 'https://epaper.alokitobangladesh.com/', thumb: '/assets/img/epaper/030-alokitobangladesh.com.png' }, // manifest #030 · sha256:870f657be9
  { name: 'বাংলা বাজার', category: 'national', lang: 'bn', url: 'https://epaper.banglabazarpatrika.net/', thumb: '/assets/img/epaper/031-banglabazarpatrika.net.png' }, // manifest #031 · sha256:2368833e15
  { name: 'মানবকণ্ঠ', category: 'national', lang: 'bn', url: 'https://epaperarchive.manobkantha.com.bd/', thumb: '/assets/img/epaper/032-epaperarchive.manobkantha.com.bd.png' }, // manifest #032 · sha256:33f0e0c2b5
  { name: 'সময়ের আলো', category: 'national', lang: 'bn', url: 'https://epaper.shomoyeralo.com/', thumb: '/assets/img/epaper/036-shomoyeralo.com.png' }, // manifest #036 · sha256:a4186d0332
  { name: 'খোলা কাগজ', category: 'national', lang: 'bn', url: 'https://epaper.kholakagojbd.com/', thumb: '/assets/img/epaper/037-kholakagojbd.com.png' }, // manifest #037 · sha256:0e08389d6e
  { name: 'প্রতিদিনের সংবাদ', category: 'national', lang: 'bn', url: 'https://epaper.protidinersangbad.com/', thumb: '/assets/img/epaper/038-protidinersangbad.com.png' }, // manifest #038 · sha256:57de8fe78d
  { name: 'ভোরের পাতা', category: 'national', lang: 'bn', url: 'https://epaper.dailyvorerpata.com/', thumb: '/assets/img/epaper/039-dailyvorerpata.com.png' }, // manifest #039 · sha256:2297cf96b3
  { name: 'সকালের সময়', category: 'national', lang: 'bn', url: 'https://epaper.sokalersomoy.online/', thumb: '/assets/img/epaper/040-sokalersomoy.online.png' }, // manifest #040 · sha256:2942ecfe7d
  { name: 'ভোরের ডাক', category: 'national', lang: 'bn', url: 'https://ebhorerdak.com/', thumb: '/assets/img/epaper/041-ebhorerdak.com.png' }, // manifest #041 · sha256:3811f5070b
  { name: 'জবাবদিহি', category: 'national', lang: 'bn', url: 'https://e-paper.jobabdihi.com/', thumb: '/assets/img/epaper/042-e-paper.jobabdihi.com.png' }, // manifest #042 · sha256:22a4579ea5
  { name: 'আজকের দর্পণ', category: 'national', lang: 'bn', url: 'https://eajkerdarpon.com/', thumb: '/assets/img/epaper/043-eajkerdarpon.com.png' }, // manifest #043 · sha256:d868b9faf8
  { name: 'দৈনিক বর্তমান', category: 'national', lang: 'bn', url: 'https://epaper.dailybartaman.com/', thumb: '/assets/img/epaper/044-dailybartaman.com.png' }, // manifest #044 · sha256:783aa13bb1
  { name: 'দেশকাল', category: 'national', lang: 'bn', url: 'http://epaper.deshkalbd.com/', thumb: '/assets/img/epaper/045-deshkalbd.com.png' }, // manifest #045 · sha256:bc17869ac8
  { name: 'দেশেরকণ্ঠ', category: 'national', lang: 'bn', url: 'https://dainikdesherkantha.com/', thumb: '/assets/img/epaper/046-dainikdesherkantha.com.png' }, // manifest #046 · sha256:3262001f64
  { name: 'বিডি বুলেটিন', category: 'national', lang: 'bn', url: 'https://epaper.bd-bulletin.com/', thumb: '/assets/img/epaper/047-bd-bulletin.com.png' }, // manifest #047 · sha256:611815b26e
  { name: 'লাখো কণ্ঠ', category: 'national', lang: 'bn', url: 'http://epaper.lakhokantho.com/', thumb: '/assets/img/epaper/049-lakhokantho.com.png' }, // manifest #049 · sha256:61cfc17e14
  { name: 'স্বদেশ প্রতিদিন', category: 'national', lang: 'bn', url: 'https://epaper.swadeshpratidin.com/', thumb: '/assets/img/epaper/050-swadeshpratidin.com.png' }, // manifest #050 · sha256:bea8b4f9fb
  { name: 'এশিয়া বাণী', category: 'national', lang: 'bn', url: 'http://www.dailyasiabani.com/', thumb: '/assets/img/epaper/051-dailyasiabani.com.png' }, // manifest #051 · sha256:7576b9b51c
  { name: 'সংবাদ প্রতিদিন (বাংলাদেশ)', category: 'national', lang: 'bn', url: 'https://epaper.dainiksangbadpratidin.com/', thumb: '/assets/img/epaper/052-dainiksangbadpratidin.com.png' }, // manifest #052 · sha256:78470c4d29
  { name: 'সরেজমিন বার্তা', category: 'national', lang: 'bn', url: 'https://epaper.sorejominbarta.com/', thumb: '/assets/img/epaper/053-sorejominbarta.com.png' }, // manifest #053 · sha256:5a5c6dd2ee
  { name: 'খবর পত্র', category: 'national', lang: 'bn', url: 'https://e.khoborpatrabd.com/', thumb: '/assets/img/epaper/054-khoborpatrabd.com.png' }, // manifest #054 · sha256:29efe90dcb
  { name: 'গণকণ্ঠ', category: 'national', lang: 'bn', url: 'https://www.egonokantho.com/', thumb: '/assets/img/epaper/055-egonokantho.com.png' }, // manifest #055 · sha256:660bdf6c29
  { name: 'আমার সংবাদ', category: 'national', lang: 'bn', url: 'https://epaper.amarsangbad.com/', thumb: '/assets/img/epaper/056-amarsangbad.com.png' }, // manifest #056 · sha256:0629c76204

  // ================= ২. চট্টগ্রাম ও আঞ্চলিক পত্রিকা =================
  { name: 'দৈনিক আজাদী (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://edainikazadi.net/', thumb: '/assets/img/epaper/061-edainikazadi.net.png', isPopular: true }, // manifest #061 · sha256:f3ee504b26
  { name: 'দৈনিক পূর্বকোণ (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://www.edainikpurbokone.net/', thumb: '/assets/img/epaper/062-edainikpurbokone.net.png', isPopular: true }, // manifest #062 · sha256:7b0a68730a
  { name: 'সুপ্রভাত বাংলাদেশ (চট্টগ্রাম)', category: 'regional', lang: 'bn', url: 'https://www.esuprobhat.com/', thumb: '/assets/img/epaper/063-esuprobhat.com.png' }, // manifest #063 · sha256:20da8de5a6
  { name: 'করতোয়া (বগুড়া/উত্তরবঙ্গ)', category: 'regional', lang: 'bn', url: 'https://www.ekaratoa.com/', thumb: '/assets/img/epaper/059-ekaratoa.com.png' }, // manifest #059 · sha256:0c1965f136
  { name: 'অগ্নিশিখা', category: 'regional', lang: 'bn', url: 'https://www.thedailyagnishikha.com/mfitmagazine/', thumb: '/assets/img/epaper/058-thedailyagnishikha.com.png' }, // manifest #058 · sha256:ef53f3bd4b
  { name: 'ইনফো বাংলা', category: 'regional', lang: 'bn', url: 'https://www.einfobangla.com/', thumb: '/assets/img/epaper/060-einfobangla.com.png' }, // manifest #060 · sha256:72541e97cc
  { name: 'সকালের বাণী', category: 'regional', lang: 'bn', url: 'https://epaper.sokalerbani.com/', thumb: '/assets/img/epaper/064-sokalerbani.com.png' }, // manifest #064 · sha256:df4ea17973

  // ================= ৩. ইংরেজি পত্রিকা (English Papers) =================
  { name: 'The Daily Star', category: 'english', lang: 'en', url: 'https://epaper.thedailystar.net/', thumb: '/assets/img/epaper/080-thedailystar.net.png', isPopular: true }, // manifest #080 · sha256:156257e986
  { name: 'Dhaka Tribune', category: 'english', lang: 'en', url: 'https://epaper.dhakatribune.com/', thumb: '/assets/img/epaper/072-dhakatribune.com.png', isPopular: true }, // manifest #072 · sha256:fbf652de0c
  { name: 'New Age', category: 'english', lang: 'en', url: 'https://epaper.newagebd.net/', thumb: '/assets/img/epaper/075-newagebd.net.png' }, // manifest #075 · sha256:bed70a909d
  { name: 'Daily Sun', category: 'english', lang: 'en', url: 'https://epaper.daily-sun.com/', thumb: '/assets/img/epaper/076-daily-sun.com.png' }, // manifest #076 · sha256:dc8c519269
  { name: 'The Financial Express', category: 'english', lang: 'en', url: 'https://epaper.thefinancialexpress.com.bd/', thumb: '/assets/img/epaper/077-thefinancialexpress.com.bd.png' }, // manifest #077 · sha256:8ac8fddb8a
  { name: 'The Bangladesh Today', category: 'english', lang: 'en', url: 'https://epaper.thebangladeshtoday.com/', thumb: '/assets/img/epaper/073-thebangladeshtoday.com.png' }, // manifest #073 · sha256:97c4a92b0b
  { name: 'The Daily Observer', category: 'english', lang: 'en', url: 'https://epaper.observerbd.com/', thumb: '/assets/img/epaper/074-observerbd.com.png' }, // manifest #074 · sha256:2f8eeec27a
  { name: 'Bangladesh Post', category: 'english', lang: 'en', url: 'https://www.bangladeshpost.net/epaper', thumb: '/assets/img/epaper/078-bangladeshpost.net.png' }, // manifest #078 · sha256:5580d4d739
  { name: 'Daily Industry', category: 'english', lang: 'en', url: 'https://edailyindustry.com/', thumb: '/assets/img/epaper/079-edailyindustry.com.png' }, // manifest #079 · sha256:afb484368b
  { name: 'Muslim Times', category: 'english', lang: 'en', url: 'https://www.themuslimtimes-bd.com/epaper-themuslimtimes-bd/index.php', thumb: '/assets/img/epaper/081-themuslimtimes-bd.com.png' }, // manifest #081 · sha256:8e6b7d0e9b
  { name: 'Country Today', category: 'english', lang: 'en', url: 'https://epaper.dailycountrytodaybd.com/', thumb: '/assets/img/epaper/082-dailycountrytodaybd.com.png' }, // manifest #082 · sha256:3bdb1e8371
  { name: 'Capital Views', category: 'english', lang: 'en', url: 'http://epaper.dailycapitalviews.com/', thumb: '/assets/img/epaper/083-dailycapitalviews.com.png' }, // manifest #083 · sha256:e61c1e93d7

  // ================= ৪. আন্তর্জাতিক পত্রিকা =================
  { name: 'The Hindu (India)', category: 'international', lang: 'en', url: 'https://epaper.thehindu.com/reader', thumb: '/assets/img/epaper/084-thehindu.com.png' }, // manifest #084 · sha256:0021b83052
  { name: 'একদিন (কলকাতা)', category: 'international', lang: 'bn', url: 'https://www.ekdin-epaper.com/', thumb: '/assets/img/epaper/067-ekdin-epaper.com.png' }, // manifest #067 · sha256:0568fc46de
  { name: 'এই সময় (কলকাতা)', category: 'international', lang: 'bn', url: 'https://epaper.eisamay.com/', thumb: '/assets/img/epaper/069-eisamay.com.png' }, // manifest #069 · sha256:3c21d43b04
  { name: 'সংবাদ প্রতিদিন (কলকাতা)', category: 'international', lang: 'bn', url: 'https://epaper.sangbadpratidin.in/', thumb: '/assets/img/epaper/070-sangbadpratidin.in.png' }, // manifest #070 · sha256:e88e5c8af3
  { name: 'ঠিকানা (যুক্তরাষ্ট্র)', category: 'international', lang: 'bn', url: 'https://e.thikananews.com/', thumb: '/assets/img/epaper/065-thikananews.com.png' }, // manifest #065 · sha256:1e01dc504e
  { name: 'জাগো বাংলা', category: 'international', lang: 'bn', url: 'https://epaper.jagobangla.in/', thumb: '/assets/img/epaper/066-jagobangla.in.png' }, // manifest #066 · sha256:198f8db654
  { name: 'সুখবর', category: 'international', lang: 'bn', url: 'http://www.sukhabar.in/', thumb: '/assets/img/epaper/068-sukhabar.in.png' }, // manifest #068 · sha256:7d9aa7f421
  { name: 'বাংলা প্রেস', category: 'international', lang: 'bn', url: 'https://epaper.banglapress24.com/', thumb: '/assets/img/epaper/071-banglapress24.com.png' }, // manifest #071 · sha256:38be1d4974
];
