// ── সেশন ৮৯ (D1): ডিসপ্লে-নাম রেজলিউশন — একমাত্র সোর্স-অব-ট্রুথ ──────────────
// লেখক-পরিচয় নিয়ম (সেশন-৮০ থেকে): pen_name (কলমী নাম) থাকলে সেটিই প্রধান-নাম,
// না থাকলে full_name। ফিড-কার্ড/কমেন্ট-বাবল/নোটিফিকেশন — যেখানেই লেখকের নাম
// দেখাতে হবে এখান থেকে নিন, সরাসরি full_name হার্ডকোড করবেন না।
//
// ব্যবহার:
//   const { displayName } = require('../helpers/display-name');
//   row.display_name = displayName(row);            // SQL-রো (full_name/pen_name কলামসহ)
//   user.display_name = displayName(user);          // users-টেবিলের সম্পূর্ণ রো
//
// নোট: প্রোফাইল-হিরো/হেডারে 'নাম (কলমে: X)' ফরম্যাট আলাদা — সেটি ভিউ-লেভেলে
// (profile.ejs / edit.ejs) রয়ে গেছে; এই হেল্পার শুধু ফিড/লিস্ট-সারফেসের জন্য।

function clean(s) {
  return String(s == null ? '' : s).trim();
}

/**
 * প্রধান-প্রদর্শন-নাম: pen_name থাকলে সেটি, নইলে full_name, নইলে fallback।
 * @param {object} row - full_name + (ঐচ্ছিক) pen_name কলামসহ যেকোনো রো
 * @param {string} [fallback] - দুটোই খালি হলে ব্যবহার-যোগ্য টেক্সট (ডিফল্ট 'সদস্য')
 */
function displayName(row, fallback) {
  if (!row) return fallback || 'সদস্য';
  return clean(row.pen_name) || clean(row.full_name) || fallback || 'সদস্য';
}

/** 'কলমে:' চিপ দেখাতে হবে কি? (pen_name আলাদা এবং full_name-এর সমান নয়) */
function hasPenName(row) {
  if (!row) return false;
  const pen = clean(row.pen_name), full = clean(row.full_name);
  return !!pen && pen !== full;
}

module.exports = { displayName, hasPenName };
