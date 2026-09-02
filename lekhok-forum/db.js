const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'lekhok.db'));

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'notice',
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    end_date TEXT,
    location TEXT,
    image_url TEXT,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    designation TEXT,
    bio TEXT,
    image_url TEXT,
    social_fb TEXT,
    social_email TEXT,
    member_type TEXT DEFAULT 'central',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    caption TEXT,
    event_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'general',
    author TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Seed data ────────────────────────────────────────────────────────────────
const adminExists = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)`)
    .run('admin', hash, 'প্রশাসক');

  // Default settings
  const defaultSettings = [
    ['site_name', 'লেখক ফোরাম'],
    ['tagline', 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়'],
    ['contact_email', 'info@lekhokforum.org'],
    ['contact_phone', '০১XXXXXXXXX'],
    ['contact_address', 'আপনার ক্যাম্পাস ঠিকানা'],
    ['facebook_url', '#'],
    ['telegram_url', '#'],
    ['youtube_url', '#']
  ];
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([k, v]) => insertSetting.run(k, v));

  // Sample notices
  const notices = [
    ['নতুন সদস্য নিবন্ধন শুরু', 'আগ্রহী প্রার্থীরা অনলাইনে আবেদন করতে পারবেন।', 'notice', '২০২৬ সালের ১ জানুয়ারি'],
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'এবারের সম্মেলনে থাকছে কবিতা পাঠ,প্রবন্ধ উপস্থাপন ও আলোচনা সভা।', 'event', '২০২৬ সালের ১৫ ফেব্রুয়ারি'],
    ['প্রকাশনা বিজ্ঞপ্তি', 'আমাদের নতুন ম্যাগাজিন প্রকাশিত হয়েছে। সদস্যদের জন্য বিনামূল্যে কপি পাওয়া যাবে।', 'press', '২০২৬ সালের ২০ জানুয়ারি'],
    ['কার্যনির্বাহী সভা', 'আগামী ৫ তারিখ সন্ধ্যা ৬টায় কার্যনির্বাহী সভা অনুষ্ঠিত হবে।', 'notice', '২০২৬ সালের ৩ জানুয়ারি'],
    ['ফেলোশিপ কার্যক্রম', 'প্রতিভাবান লেখকদের জন্য বিশেষ ফেলোশিপ ঘোষণা করা হয়েছে। আবেদনের শেষ তারিখ ৩১ মার্চ।', 'notice', '২০২৬ সালের ১০ ফেব্রুয়ারি'],
    ['লেখক সম্মাননা ২০২৬', 'প্রতি বছরের মতো এবারও শীর্ষ লেখকদের সম্মাননা প্রদান করা হবে।', 'press', '২০২৬ সালের ১৫ মার্চ']
  ];
  const insertNotice = db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)');
  notices.forEach(n => insertNotice.run(...n));

  // Sample events
  const events = [
    ['বার্ষিক সাহিত্য সম্মেলন ২০২৬', 'কবিতা পাঠ, প্রবন্ধ উপস্থাপন, আলোচনা সভা এবং সাংস্কৃতিক অনুষ্ঠান।', '২০২৬-০২-১৫', '২০২৬-০২-১৫', 'ঢাকা বিশ্ববিদ্যালয়', 'https://picsum.photos/seed/event1/800/400', 1],
    ['আন্তর্জাতিক মাতৃভাষা দিবস উদযাপন', 'ভাষা আন্দোলনের শহীদদের স্মরণে আলোচনা সভা ও কবিতা পাঠ।', '২০২৬-০২-২১', '২০২৬-০২-২১', 'শহীদ মিনার', 'https://picsum.photos/seed/event2/800/400', 0],
    ['গবেষণা কর্মশালা: লেখালেখির পদ্ধতি', 'প্রফেশনাল লেখকদের তত্ত্বাবধানে একদিনের গবেষণা কর্মশালা।', '২০২৬-০৩-১০', '২০২৬-০৩-১০', 'অনলাইন (জুম)', 'https://picsum.photos/seed/event3/800/400', 0],
    ['প্রকাশনা মেলা ও বইমেলা', 'সদস্যদের প্রকাশিত বইয়ের প্রদর্শনী ও বিক্রয়।', '২০২৬-০৪-২০', '২০২৬-০৪-২২', 'বাংলা একাডেমি', 'https://picsum.photos/seed/event4/800/400', 1]
  ];
  const insertEvent = db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)');
  events.forEach(e => insertEvent.run(...e));

  // Sample members
  const members = [
    ['মো. রুহুল আমিন', 'সভাপতি', 'কেন্দ্রীয় কমিটি', 'দীর্ঘদিন ধরে সাংগঠনিক কাজে সক্রিয়। তরুণ লেখকদের পৃষ্ঠপোষকতা করে আসছেন।', 'https://picsum.photos/seed/mem1/300/300', '#', '', 'central', 1],
    ['সাইশা সুলতানা সাদিয়া', 'মহাসচিব', 'কেন্দ্রীয় কমিটি', 'প্রগতিশীল লেখালেখি ও সাংস্কৃতিক আন্দোলনে অগ্রণী।', 'https://picsum.photos/seed/mem2/300/300', '#', '', 'central', 2],
    ['আবদুল্লাহ আল মাহমুদ', 'সাংগঠনিক সম্পাদক', 'কেন্দ্রীয় কমিটি', 'সাংগঠনিক দক্ষতা ও নেতৃত্বের গুণাবলি সম্পন্ন।', 'https://picsum.photos/seed/mem3/300/300', '#', '', 'central', 3],
    ['ফারজানা আক্তার', 'প্রচার সম্পাদক', 'কেন্দ্রীয় কমিটি', 'ডিজিটাল মাধ্যমে সংগঠনের উপস্থিতি বৃদ্ধিতে কাজ করছেন।', 'https://picsum.photos/seed/mem4/300/300', '#', '', 'central', 4],
    ['নাঈম হোসেন', 'সদস্য', 'বিশ্ববিদ্যালয় শাখা', 'নতুন প্রজন্মের মধ্যে সংগঠন সম্প্রসারণে কাজ করছেন।', 'https://picsum.photos/seed/mem5/300/300', '#', '', 'branch', 5],
    ['তাহসিন আরা', 'সদস্য', 'বিশ্ববিদ্যালয় শাখা', 'সৃজনশীল লেখালেখি ও গবেষণায় আগ্রহী।', 'https://picsum.photos/seed/mem6/300/300', '#', '', 'branch', 6]
  ];
  const insertMember = db.prepare('INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  members.forEach(m => insertMember.run(...m));

  // Sample gallery
  const gallery = [
    ['সাহিত্য সম্মেলন ২০২৫', 'https://picsum.photos/seed/gal1/600/400', 'সম্মেলনের একাংশ', '২০২৫-১২-১০'],
    ['কর্মশালা ২০২৫', 'https://picsum.photos/seed/gal2/600/400', 'গবেষণা কর্মশালা', '২০২৫-১০-০৫'],
    ['ম্যাগাজিন প্রকাশ', 'https://picsum.photos/seed/gal3/600/400', 'নতুন ম্যাগাজিনের মোড়ক উন্মোচন', '২০২৫-০৮-২০'],
    ['আলোচনা সভা', 'https://picsum.photos/seed/gal4/600/400', 'মাসিক আলোচনা সভা', '২০২৫-০৭-১৫'],
    ['বইমেলা স্টল', 'https://picsum.photos/seed/gal5/600/400', 'অমর একুশে বইমেলায় স্টল', '২০২৫-০২-০১'],
    ['টিম মিটিং', 'https://picsum.photos/seed/gal6/600/400', 'কার্যনির্বাহী সভা', '২০২৫-০৬-১০']
  ];
  const insertGallery = db.prepare('INSERT INTO gallery (title, image_url, caption, event_date) VALUES (?, ?, ?, ?)');
  gallery.forEach(g => insertGallery.run(...g));

  // Sample resources
  const resources = [
    ['কবিতা লেখার কৌশল', 'কবিতা লেখার মূল ভিত্তি হলো অনুভূতির সত্যিকারের প্রকাশ। প্রথমে অনুভূতি থেকে লিখুন, পরে সম্পাদনা করুন।', 'scholarship', 'সম্পাদক', 'কবিতা,লেখালেখি,পরামর্শ'],
    ['প্রবন্ধ রচনার পদ্ধতি', 'প্রবন্ধে যুক্তি ও অনুভূতির ভারসাম্য রক্ষা করতে হয়। বিষয়বস্তু স্পষ্ট করে লিখুন।', 'writing-tips', 'মো. রুহুল আমিন', 'প্রবন্ধ,রচনা,গাইড'],
    ['ফেলোশিপ ও গবেষণা অনুদান', 'দেশী-বিদেশী বিভিন্ন ফেলোশিপ ও গবেষণা অনুদান সম্পর্কে বিস্তারিত তথ্য।', 'scholarship', 'সাইশা সুলতানা সাদিয়া', 'ফেলোশিপ,গবেষণা,অনুদান'],
    ['অনলাইনে লেখালেখি ও প্রকাশনা', 'ডিজিটাল প্ল্যাটফর্মে লেখা প্রকাশ করার সুবিধা ও সতর্কতা।', 'writing-tips', 'ফারজানা আক্তার', 'ডিজিটাল,প্রকাশনা,টিপস']
  ];
  const insertResource = db.prepare('INSERT INTO resources (title, content, category, author, tags) VALUES (?, ?, ?, ?, ?)');
  resources.forEach(r => insertResource.run(...r));
}

// ── Helper functions ──────────────────────────────────────────────────────────
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`)
    .run(key, value);
}

module.exports = {
  db,
  getSetting,
  setSetting
};
