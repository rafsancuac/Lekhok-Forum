/**
 * helpers/paper-emails.js — সেশন ৪০
 * ═══════════════════════════════════════════════════════════════════════════
 * বাংলাদেশের জাতীয় ও আঞ্চলিক পত্রিকার সাহিত্য/কলাম/চিঠিপত্র পাতার ইমেইল
 * ডিরেক্টরি (ইউজার-প্রদান তালিকা)। ডুপ্লিকেট এন্ট্রি বাদ দেওয়া হয়েছে।
 * /resources/emails পেজ এই ডেটা রেন্ডার করে।
 * ═══════════════════════════════════════════════════════════════════════════
 */
module.exports = {
  intro:
    'অনেকে সাহিত্য পত্রিকায় লেখা পাঠানোর জন্য ইমেইল খুঁজে পান না। তাদের সুবিধার্থে বাংলাদেশের সকল জাতীয় ও আঞ্চলিক সাহিত্য পত্রিকার ইমেইলগুলো একসাথে দেওয়া হলো। বারভিত্তিক তালিকা ছাড়াও জাতীয় দৈনিক, ইসলামিক পাতা, অনলাইন পোর্টাল, ক্যাম্পাস পাতা, ভ্রমণ কাহিনী, রম্য ও সাহিত্য বিভাগের ইমেইল আলাদা করে সাজানো আছে।',
  note: 'লেখা পাঠানোর আগে সংশ্লিষ্ট পত্রিকার নীতিমালা ও শব্দসীমা দেখে নেওয়া ভালো। তথ্য হালনাগাদ নয় মনে হলে যোগাযোগ পেজে জানান।',
  groups: [
    {
      id: 'fri', label: 'শুক্রবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'দৈনিক চাঁপাই দর্পণ', note: '', emails: ['chapai.darpon14@gmail.com'] },
        { paper: 'দৈনিক হাওয়া', note: '', emails: ['shamimast2018@gmail.com'] },
        { paper: 'দৈনিক নয়াদিগন্ত', note: 'সাহিত্য', emails: ['digantasahitto@gmail.com'] },
        { paper: 'দৈনিক চাঁদনী বাজার', note: 'বগুড়া', emails: ['chandnibazar05sahitto@gmail.com'] },
        { paper: 'দৈনিক সংগ্রাম', note: 'সাহিত্য', emails: ['shahitto@dailysangram.com'] },
        { paper: 'দৈনিক যায়যায়দিন', note: 'সাহিত্য পাতা', emails: ['salamsaleh@ymail.com'] },
        { paper: 'দৈনিক দিনদর্পণ', note: 'কোলকাতা • ইসলামি কবিতা (দ্বীন)', emails: ['editorial@dindarpan.com'] },
        { paper: 'দৈনিক যুগান্তর', note: 'সাহিত্য', emails: ['shahittojugantor@gmail.com'] },
        { paper: 'প্রতিদিনের সংবাদ', note: 'সাময়িকী', emails: ['samoyikipds@gmail.com'] },
        { paper: 'নারায়ণগঞ্জ বার্তা', note: '', emails: ['foyzur.rahman4242@gmail.com'] },
        { paper: 'দৈনিক ইত্তেফাক', note: 'সাহিত্য', emails: ['lit.Ittefaq@gmail.com'] },
        { paper: 'সাপ্তাহিক কলমের কণ্ঠ', note: '', emails: ['jahidhasanrana2003@gmail.com'] }
      ]
    },
    {
      id: 'sat', label: 'শনিবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'আলোকিত বাংলাদেশ', note: 'সাময়িকী', emails: ['alokitoshamoiki@gmail.com'] },
        { paper: 'দৈনিক আজকের প্রত্যাশা', note: '', emails: ['aprattashasahitto@gmail.com'] },
        { paper: 'আলোকিত প্রতিদিন', note: '', emails: ['dailyalokitoprotidin@gmail.com'] },
        { paper: 'দৈনিক কাজিরবাজার', note: 'সিলেট', emails: ['kazirbazar@gmail.com'] },
        { paper: 'দৈনিক সমাজের কথা', note: 'যশোর', emails: ['sahitto.samajerkatha@gmail.com'] },
        { paper: 'দৈনিক আমাদের সময়', note: '', emails: ['amadershomoylekhalekhi@gmail.com'] },
        { paper: 'দৈনিক মেহেরপুর প্রতিদিন', note: '', emails: ['mpratidin@gmail.com'] },
        { paper: 'দৈনিক গৌড়বাংলা', note: 'চাঁপাই', emails: ['news.dailygourbangla@gmail.com'] },
        { paper: 'বাংলাদেশের খবর', note: 'সাহিত্য', emails: ['anyorekha@gmail.com'] },
        { paper: 'দৈনিক সংবাদ', note: 'সাময়িকী', emails: ['sangbadsamoeky@gmail.com'] },
        { paper: 'দৈনিক যুগান্তর', note: 'রঙ্গ', emails: ['jugantorrongo@gmail.com'] },
        { paper: 'সাপ্তাহিক মিযান', note: 'ভারত', emails: ['mizanweekly@gmail.com'] },
        { paper: 'দৈনিক আজকের খবর', note: 'সিলেট', emails: ['ajkerkhoborshahitta@gmail.com'] },
        { paper: 'সময়ের সমীকরণ', note: 'চুয়াডাঙ্গা', emails: ['sahityosomikoron@gmail.com'] },
        { paper: 'দৈনিক কালেরচিত্র', note: 'সাতক্ষীরা', emails: ['kalerchitrasahitta@gmail.com'] }
      ]
    },
    {
      id: 'sun', label: 'রবিবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'শুভ প্রতিদিন', note: 'শিশুপ্রহর', emails: ['khaleduddin@gmail.com', 'sahittay.shubo@gmail.com'] },
        { paper: 'আলোকিত সকাল', note: 'সাহিত্য পাতা', emails: ['sahittosakal@gmail.com'] },
        { paper: 'আপনজন', note: 'ভারত', emails: ['aponzone@gmail.com'] },
        { paper: 'দৈনিক যুগের আলো', note: '', emails: ['jugeralorangpur@gmail.com'] },
        { paper: 'দৈনিক বাংলা খবর', note: 'ঘাসফুল', emails: ['abkliterature@gmail.com'] },
        { paper: 'দৈনিক পাঠক সংবাদ', note: '', emails: ['pathaksangbad@gmail.com'] },
        { paper: 'সাপ্তাহিক বজ্রকথা', note: '', emails: ['bwazarakatha@gmail.com'] }
      ]
    },
    {
      id: 'mon', label: 'সোমবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'দৈনিক জয়পুরহাট খবর', note: '', emails: ['rony.net70@gmail.com'] },
        { paper: 'দৈনিক বর্তমান', note: 'জলপড়ে পাতা', emails: ['bartoman.jolpore@gmail.com'] },
        { paper: 'দৈনিক জনতা', note: 'সাময়িকী', emails: ['bishu.janata@gmail.com'] },
        { paper: 'দৈনিক ফুলকি', note: 'সাভার', emails: ['fulki04@yahoo.com'] },
        { paper: 'সাপ্তাহিক স্লোগান', note: 'শিশুতোষ', emails: ['tupurtapurslogan@gmail.com'] },
        { paper: 'সাপ্তাহিক স্লোগান', note: 'সাহিত্য পাতা', emails: ['sahittyaslogan@gmail.com'] }
      ]
    },
    {
      id: 'tue', label: 'মঙ্গলবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'দৈনিক সমকাল', note: 'ঘাসফড়িং', emails: ['ghashforing007@gmail.com'] },
        { paper: 'দৈনিক স্পন্দন', note: 'যশোর', emails: ['dailyspandan@yahoo.com'] },
        { paper: 'দৈনিক আজাদী', note: '', emails: ['kholahawa2015@gmail.com'] },
        { paper: 'দৈনিক বাংলাদেশের খবর', note: 'হৈচৈ', emails: ['writetomukul36@gmail.com'] }
      ]
    },
    {
      id: 'wed', label: 'বুধবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'দৈনিক ফুলবাড়িয়া প্রতিদিন', note: '', emails: ['hasanfokrul24@yahoo.com'] },
        { paper: 'দৈনিক আজাদী', note: 'আগামীদের আসর', emails: ['kholahawa2015@gmail.com'] },
        { paper: 'দৈনিক বায়ান্নর আলো', note: '', emails: ['dainikbayannoralo@gmail.com'] },
        { paper: 'জালালাবাদ', note: 'সপ্তডিঙ্গা (শিশুপাতা)', emails: ['jalalabadshahitta@gmail.com'] },
        { paper: 'দৈনিক আমার সংবাদ', note: '', emails: ['amarsangbadfeature@gmail.com'] },
        { paper: 'দৈনিক যায়যায়দিন', note: '', emails: ['hattimatimtim@jjdbd.com'] },
        { paper: 'দৈনিক যুগের আলো', note: '', emails: ['jugeralorangpur@gmail.com'] }
      ]
    },
    {
      id: 'thu', label: 'বৃহস্পতিবার', icon: 'fa-calendar-day',
      items: [
        { paper: 'দৈনিক যুগের আলো', note: '', emails: ['jugeralorangpur@gmail.com'] },
        { paper: 'দৈনিক বীর চট্টগ্রাম মঞ্চ', note: '', emails: ['manchaeditor@gmail.com'] },
        { paper: 'দৈনিক আমাদের সময়', note: '', emails: ['ghatangghat@gmail.com'] },
        { paper: 'সাপ্তাহিক সোনার বাংলা', note: '', emails: ['sonarbanglaweekly@gmail.com'] },
        { paper: 'দৈনিক সিলেটের ডাক', note: '', emails: ['sylheterdak@yahoo.com'] },
        { paper: 'দৈনিক খোলা কাগজ', note: '', emails: ['agarojon.kk@gmail.com'] }
      ]
    },
    {
      id: 'national', label: 'জাতীয় দৈনিক (সর্বদা)', icon: 'fa-newspaper',
      items: [
        { paper: 'দৈনিক ইত্তেফাক', note: 'কলাম / চিঠিপত্র-মতামত', emails: ['columnittefaq@gmail.com', 'letters.ittefaq@gmail.com'] },
        { paper: 'ভোরের কাগজ', note: 'চিঠিপত্র ও কলাম / পাঠকের কলাম', emails: ['bkeditorial@yahoo.com'] },
        { paper: 'সমকাল', note: 'চিঠিপত্র ও কলাম / মুক্তমঞ্চ • প্রিয় ক্যাম্পাস', emails: ['samakal.editorial@gmail.com', 'priyocampus1971@gmail.com'] },
        { paper: 'যুগান্তর', note: 'চিঠিপত্র ও কলাম / অভিমত / ইসলাম', emails: ['editorial.jugantor@gmail.com', 'dristipath.jugantor@gmail.com', 'islam.jugantor@gmail.com'] },
        { paper: 'কালের কণ্ঠ', note: 'চিঠিপত্র', emails: ['editorial@kalerkantho.com'] },
        { paper: 'দৈনিক ইনকিলাব', note: 'চিঠিপত্র / নিবন্ধ / ইসলামী জীবন / ধর্ম দর্শন', emails: ['inqilab.info@gmail.com', 'islamijibonpata@gmail.com', 'dharmadorshan@gmail.com'] },
        { paper: 'যায়যায়দিন', note: 'চিঠি / পাঠকমত / কলাম', emails: ['ss_opinion@yahoo.com', 'country_jjd@jjdbd.com', 'jajadi@jjdbd.com'] },
        { paper: 'সংবাদ', note: 'কলাম / নারীকথা / সম্পাদকীয়', emails: ['sampadakio@gmail.com', 'sangbadnarikatha@gmail.com', 'editorial.sangbad@gmail.com'] },
        { paper: 'নয়াদিগন্ত', note: 'চিঠি / নয়া দিগন্ত', emails: ['digantaeditorial@gmail.com', 'islamdiganta@gmail.com'] },
        { paper: 'প্রথম আলো', note: 'সম্পাদকীয় / নাগরিক সংবাদ / চিঠি', emails: ['editorial@prothom-alo.info', 'ns@prothomalo.com', 'Editorial@prothomalo.com'] },
        { paper: 'দৈনিক জনকণ্ঠ', note: 'কলাম / চিঠিপত্র / সমাজ / ক্যাম্পাস', emails: ['janakanthaeditorial@gmail.com', 'letterpathao@gmail.com', 'shomajjanakantha@gmail.com', 'campusjanakantha@gmail.com'] },
        { paper: 'দৈনিক মানবকণ্ঠ', note: 'ইসলাম ও জীবন (বরিবার — শনিবারে পাঠান) / সম্প্রতি / এলেবেলে', emails: ['islamojibonmk@gmail.com', 'editorial.manobkantha@gmail.com', 'mk.elebele@gmail.com'] },
        { paper: 'দৈনিক জনতা', note: '', emails: ['viewjanata@yahoo.com'] },
        { paper: 'দৈনিক দিনকাল', note: '', emails: ['dinkalnews@gmail.com'] },
        { paper: 'দৈনিক আজকালের খবর', note: '', emails: ['editorialajkalerkhobor@gmail.com'] },
        { paper: 'দৈনিক পূর্বকোণ', note: '', emails: ['editorial@dainikpurbokone.net'] },
        { paper: 'দৈনিক বর্তমান', note: '', emails: ['wo.bartoman@gmail.com'] },
        { paper: 'বাংলাদেশ প্রতিদিন', note: 'নগরপরিক্রমা', emails: ['nagarparikramabd@gmail.com', 'bdpratidinny@gmail.com'] },
        { paper: 'বাংলাদেশের খবর', note: '', emails: ['bk2018editorial@gmail.com'] },
        { paper: 'খোলা কাগজ', note: '', emails: ['Kholakagojed2@gmail.com'] },
        { paper: 'আলোকিত বাংলাদেশ', note: 'সম্পাদকীয় / বুক রিভিউ (শনি) / শিশু', emails: ['editorial.alokitobangladesh@gmail.com', 'alokito.shamoiki@gmail.com', 'alokitoshishu2016@gmail.com'] },
        { paper: 'দৈনিক দেশ রূপান্তর', note: 'নিউজ / কলাম', emails: ['News@deshrupantor.com', 'editorial@deshrupantor.com'] },
        { paper: 'প্রতিদিনের সংবাদ', note: 'কলাম / দৃষ্টিপাত / মুক্তমত / ক্যাম্পাস', emails: ['Pdsangbadeditorial@gmail.com', 'pseditorbd@gmail.com', 'Khealkhusibd@gmail.com'] },
        { paper: 'দৈনিক সকালের সময়', note: '', emails: ['dailysokalersomoy@gmail.com'] },
        { paper: 'দৈনিক সময়ের আলো', note: 'সময়ের জানালা / ইসলামের আলো (সোমবার)', emails: ['editorial@shomoyeralo.com', 'islameralo@shomoyeralo.com'] },
        { paper: 'দৈনিক আমাদের সময়', note: 'সম্পাদক / চিঠিপত্র ও কলাম', emails: ['editor@dainikamadersomoy.com', 'amadershomoyeditorial@gmail.com'] },
        { paper: 'দৈনিক বনিক বার্তা', note: 'কলাম ও চিঠিপত্র', emails: ['editorialbonikbarta@gmail.com', 'onlinenews@bonikbarta.com'] },
        { paper: 'ভোরের ডাক', note: '', emails: ['bhorerdakonline@gmail.com', 'adbhorerdak@gmail.com'] },
        { paper: 'মানবজমিন', note: '', emails: ['news@emanabzamin.com'] },
        { paper: 'আমাদের অর্থনীতি', note: '', emails: ['news@amaderOrthoneeti.com'] },
        { paper: 'স্বাধীন বাংলা', note: '', emails: ['dailyswadhinbangla@gmail.com'] },
        { paper: 'দৈনিক আজাদী', note: '', emails: ['azadieditorial@gmail.com'] },
        { paper: 'দৈনিক সংগ্রাম', note: '', emails: ['news@dailysangram.com'] },
        { paper: 'দৈনিক বাংলাদেশ বুলেটিন', note: '', emails: ['thebdbulletin@gmail.com'] },
        { paper: 'দৈনিক দেশকাল', note: '', emails: ['editorial@deshkalbd.com'] },
        { paper: 'দৈনিক করতোয়া', note: '', emails: ['dkaratoa@yahoo.com'] }
      ]
    },
    {
      id: 'islam', label: 'ইসলামিক পাতা', icon: 'fa-mosque',
      items: [
        { paper: 'দেশ রূপান্তর', note: 'প্রতিদিন', emails: ['features@deshrupantor.com'] },
        { paper: 'যুগান্তর', note: 'ইসলাম', emails: ['islam.jugantor@gmail.com'] },
        { paper: 'ইত্তেফাক', note: 'শুক্রবার • ধর্মচিন্তা', emails: ['dharmochinta63@gmail.com'] },
        { paper: 'বাংলাদেশের খবর', note: 'প্রতিদিন', emails: ['Bk2018editorial@gmail.com'] },
        { paper: 'আলোকিত বাংলাদেশ', note: 'বুধবার • ইসলাম ও সমাজ', emails: ['abislamosomaj@gmail.com'] }
      ]
    },
    {
      id: 'online', label: 'অনলাইন পোর্টাল', icon: 'fa-globe',
      items: [
        { paper: 'ডেলটা টাইমস', note: '', emails: ['deltatimes24@gmail.com'] },
        { paper: 'শেয়ারবিজ', note: '', emails: ['editorial.sharebiz@gmail.com'] },
        { paper: 'রাইজিং বিডি', note: 'ক্যাম্পাস', emails: ['risingbdcampus@gmail.com'] },
        { paper: 'প্রথম আলো অনলাইন', note: 'নাগরিক সংবাদ', emails: ['ns@prothomalo.com'] },
        { paper: 'দৈনিক অধিকার', note: '', emails: ['inbox.odhikar@gmail.com'] },
        { paper: 'সংবাদ দর্পন', note: '', emails: ['songbaddarpan@gmail.com'] },
        { paper: 'পরিবর্তন', note: '', emails: ['poribortonnewsroom@gmail.com'] },
        { paper: 'আমাদের ইসলাম', note: '', emails: ['newsourislam24@gmail.com'] },
        { paper: 'বাংলা নিউজ ২৪', note: 'ইসলাম', emails: ['bn24.islam@gmail.com'] }
      ]
    },
    {
      id: 'campus', label: 'ক্যাম্পাস পাতা', icon: 'fa-graduation-cap',
      items: [
        { paper: 'ইত্তেফাক', note: 'বুধবার', emails: ['Campus.ittefaq@gmail.com', 'Ittefaq.youth@gmail.com'] },
        { paper: 'সমকাল', note: 'মঙ্গল/রবি/সোমবার • প্রিয় ক্যাম্পাস', emails: ['Priyocampus1971@gmail.com'] },
        { paper: 'যায়যায়দিন', note: 'সোমবার', emails: ['princeashraf007@gmail.com', 'Campus@jjbd.com'] },
        { paper: 'কালের কণ্ঠ', note: 'বুধবার', emails: ['Campus@kalerkantho.com'] },
        { paper: 'জনকণ্ঠ', note: 'রবিবার', emails: ['Campusjanakantha@gmail.com'] },
        { paper: 'খোলা কাগজ', note: 'বৃহস্পতিবার • প্রিয় ক্যাম্পাস', emails: ['agarojon.kk@gmail.com', 'kholakagoj.priyocampus@gmail.com'] },
        { paper: 'বাংলাদেশের খবর', note: 'ক্যাম্পাস ক্যারিয়ার', emails: ['bkcampuscarrer@gmail.com'] }
      ]
    },
    {
      id: 'travel', label: 'ভ্রমণ কাহিনী', icon: 'fa-route',
      items: [
        { paper: 'জনকণ্ঠ', note: 'শুক্রবার', emails: ['jk.vromon2016@gmail.com'] },
        { paper: 'ইত্তেফাক', note: 'বুধবার', emails: ['korcha.ittefaq@gmail.com'] },
        { paper: 'প্রথম আলো', note: 'শনিবার • ছুটিদিনে', emails: ['chutirdine@prothomalo.com'] }
      ]
    },
    {
      id: 'humor', label: 'হাসি-ঠাট্টা-রম্য পাতা', icon: 'fa-face-smile',
      items: [
        { paper: 'ইত্তেফাক', note: 'রবিবার • ঠাট্টা', emails: ['ittefaq.thatta@gmail.com'] },
        { paper: 'বাংলাদেশ প্রতিদিন', note: 'সংবাদ • রকমারি', emails: ['rokorommo@gmail.com'] },
        { paper: 'যুগান্তর', note: 'রবিবার • বিচ্ছু', emails: ['bicchoojugantor@gmail.com'] },
        { paper: 'নয়া দিগন্ত', note: 'বৃহস্পতিবার • থেরাপি', emails: ['therapi2016@gmail.com'] },
        { paper: 'খোলা কাগজ', note: 'মঙ্গলবার • বাঙ্গালিয়াশ', emails: ['Bangkawash.kk@gmail.com'] }
      ]
    },
    {
      id: 'lit', label: 'সাহিত্য (গল্প-ছড়া)', icon: 'fa-feather-pointed',
      items: [
        { paper: 'জনকণ্ঠ', note: 'শনিবার • ঝিলিমিলি', emails: ['jilimilijanakantha@yahoo.com'] },
        { paper: 'ভোরের কাগজ', note: 'শনিবার • পাঠক ফোরাম', emails: ['pathokforum_bk@yahoo.com'] },
        { paper: 'প্রতিদিনের সংবাদ', note: 'খেলখুশি', emails: ['khealkhushi@gmail.com'] },
        { paper: 'ইত্তেফাক', note: 'শুক্র/রবিবার • গল্প-ছড়া-মজার বিষয়', emails: ['Kochikacharaashor@gmail.com'] }
      ]
    }
  ]
};
