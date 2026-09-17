// ══════════════════════════════════════════════════════════════════════════════
// রোল-পলিসি (সেশন ৮৩) — রোল-হায়ারার্কি, স্টাফ/ইউজার পোর্টাল বিভাজন ও
// "সরাসরি কানেকশন-নীতি"-র একমাত্র সোর্স-অব-ট্রুথ।
// ══════════════════════════════════════════════════════════════════════════════
// ইউজার-নির্দেশিত মডেল:
//   সুপার এডমিন  >  এডমিন  >  মডারেটর  >  ইউজার
//   • ঊর্ধ্বতন পদ নিম্নতন পদের কাজ নিয়ন্ত্রণ/তদারকি/কমানো-বাড়ানো করবেন
//     (সেশন-বাই-সেশন প্যানেল-ফিচারে), কিন্তু
//   • পারস্পরিক "সরাসরি কানেকশন" (১:১ ডাইরেক্ট মেসেজ / ফলো) বন্ধ —
//     যোগাযোগ অফিসিয়াল চ্যানেলে (নোটিশ/অভিযোগ/টাস্ক)।
//   • রোল-পরিবর্তন কেবল নিয়োগে: সুপার-এডমিন এডমিন বানাবেন, এডমিন
//     মডারেটর বানাবেন — কেউ নিজেকে/একে-অপরকে সরাসরি সুইচ করতে পারবেন না।
//   • মডারেটর/এডমিন কেবল নিজের ইউজার-ইন্টারফেসের সাথে সোয়াপ করতে পারবেন
//     (/moderator/switch, /admin/switch); অন্য রোলের প্যানেলে ঢোকা যাবে না।
//   • লগইন ইন্টারফেস দুটি: /login = সাধারণ ইউজার, /admin/login = স্টাফ
//     (সুপার-এডমিন/এডমিন/মডারেটর) — ক্রস-লগইন প্রত্যাখ্যাত।

// রোল-র‍্যাংক — বড় সংখ্যা = ঊর্ধ্বতন। 'user' ছাড়া সব স্টাফ।
const ROLE_RANK = {
  user: 0,
  moderator: 10,
  admin: 20,
  superadmin: 30
};

// যে-রোলগুলো স্টাফ-পোর্টাল (/admin/login) থেকে লগইন করতে পারবে।
const STAFF_ROLES = ['moderator', 'admin', 'superadmin'];

// সাধারণ ইউজার-পোর্টাল (/login) শুধু এই রোল গ্রহণ করে।
const USER_PORTAL_ROLES = ['user'];

function normRole(r) {
  return STAFF_ROLES.includes(r) || r === 'user' ? r : 'user';
}

function isStaffRole(r) {
  return STAFF_ROLES.includes(normRole(r));
}

function roleRank(r) {
  return ROLE_RANK[normRole(r)] || 0;
}

// ── সোয়াপ-নীতি ────────────────────────────────────────────────────────────────
// মডারেটর ও এডমিন (users-টেবিলের কমিউনিটি-অ্যাকাউন্ট) নিজের ইউজার-ইন্টারফেসের
// সাথে সোয়াপ করতে পারবেন। সুপার-এডমিন স্টাফ-ওয়ার্ল্ডেই থাকবেন (কোনো ইউজার-মোড নেই)।
function canSwapToUserMode(role) {
  return normRole(role) === 'moderator' || normRole(role) === 'admin';
}

// রোল-অনুযায়ী স্টাফ-ড্যাশবোর্ড। (auth.js-এর dashboardFor-এর কেন্দ্রীয় রূপ)
function dashboardForRole(role) {
  const r = normRole(role);
  if (r === 'admin' || r === 'superadmin') return '/admin';
  if (r === 'moderator') return '/moderator';
  return '/dashboard';
}

// ── "সরাসরি কানেকশন-নীতি" (DM + ফলো) ────────────────────────────────────────
// নিষিদ্ধ জোড়া — সরাসরি ১:১ মেসেজ ও ফলো উভয়ই বন্ধ (উভয় দিক থেকে):
//   ইউজার ↔ মডারেটর, মডারেটর ↔ এডমিন, এডমিন ↔ সুপার-এডমিন।
// লজিক: পাশাপাশি স্তরের (rank-ব্যবধান ১০) দুই স্টাফ/ইউজার-স্টাফ জোড়া যেখানে
// একজন অন্যজনের নিয়ন্ত্রক — তাদের ব্যক্তিগত চ্যানেল বন্ধ; নিয়ন্ত্রণ প্যানেল-টুলে।
const DIRECT_PAIR_MESSAGE =
  'রোল-নীতি: এই দুই পদের মধ্যে সরাসরি যোগাযোগ বন্ধ। ইউজার↔মডারেটর, মডারেটর↔এডমিন, ' +
  'এডমিন↔সুপার-এডমিন সরাসরি মেসেজ/ফলো করতে পারবেন না — ঊর্ধ্বতন-নিয়ন্ত্রণ প্যানেল ও ' +
  'অফিসিয়াল চ্যানেলে (নোটিশ/অভিযোগ) যোগাযোগ করুন।';

function isAdjacentControlPair(roleA, roleB) {
  const ra = roleRank(roleA), rb = roleRank(roleB);
  return Math.abs(ra - rb) === 10; // user↔moderator, moderator↔admin, admin↔superadmin
}

// কানেকশন (DM/ফলো) অনুমোদিত কি-না — true মানে ব্লকড।
function connectionBlocked(roleA, roleB) {
  return isAdjacentControlPair(roleA, roleB);
}

// স্টাফ-পোর্টালে সাধারণ ইউজারের প্রত্যাখ্যান-বার্তা
const STAFF_PORTAL_USER_MESSAGE =
  'এটি স্টাফ লগইন পোর্টাল (সুপার এডমিন, এডমিন ও মডারেটরদের জন্য)। সাধারণ ব্যবহারকারীরা অনুগ্রহ করে মূল সাইটের লগইন ব্যবহার করুন।';

// ইউজার-পোর্টালে স্টাফ-অ্যাকাউন্টের প্রত্যাখ্যান-বার্তা
const USER_PORTAL_STAFF_MESSAGE =
  'এটি একটি স্টাফ অ্যাকাউন্ট (মডারেটর/এডমিন/সুপার এডমিন)। নিরাপত্তার জন্য স্টাফ পোর্টাল থেকে লগইন করুন।';

module.exports = {
  ROLE_RANK,
  STAFF_ROLES,
  USER_PORTAL_ROLES,
  normRole,
  isStaffRole,
  roleRank,
  canSwapToUserMode,
  dashboardForRole,
  connectionBlocked,
  isAdjacentControlPair,
  DIRECT_PAIR_MESSAGE,
  STAFF_PORTAL_USER_MESSAGE,
  USER_PORTAL_STAFF_MESSAGE
};
