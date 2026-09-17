/**
 * সেশন ১০২ (রোডম্যাপ-০৮ ইউনিয়ন-মার্জ): র‍্যাংকড-ফিড অ্যাফিনিটি + র‍্যাংক-ব্যাজ হেল্পার
 * ============================================================================
 * সেশন-১০০-এর ranked-ইঞ্জিনের (rankScoreOf/applyRankedSort — dashboard.js) ওপর
 * ব্যক্তিগত-সামঞ্জস্য স্তর (PLANS.md-স্পেক: "follow×3 + reaction-মিল×2") + "কেন-
 * দেখছেন" UI-ব্যাজ যোগ করে। স্কোর-সূত্র (ইউনিয়ন):
 *   Score = (like×2 + comment×3 + share×2.5 + view×0.2 + affinityBonus)
 *           / (ageHours + 2)^1.15
 *   affinityBonus = অনুসৃত-লেখক +3, আগে-রিঅ়াক্ট-করা-লেখক +2
 *
 * ⚠️ UNION-গোটচা (PLANS.md): buildFeedSql-এর ৩ শাখাতেই author_id কলাম আছে
 * (article/question: p.author_id, activity: NULL) — ভবিষ্যৎ-এজেন্ট কলাম বাড়ালে
 * তিন শাখাতেই দিতে হবে।
 */

'use strict';

// db-লেজি-রিকোয়ার — ইউনিট-টেস্টে (db-নির্ভরতা-ছাড়া) খালি-লোড সম্ভব;
// buildAffinity-কলে-ই প্রথমবার লোড হয় (প্রোডাকশনে একবারই, require-ক্যাশ)।
let _db = null;
function dbx() { if (!_db) _db = require('../db'); return _db; }

// অ্যাফিনিটি-ওয়েট (স্কোরের সংখ্যা-গুণ, decay-অংশীদার নয়)
const AFF = { follow: 3, reactMatch: 2 };

/** খালি-অ্যাফিনিটি কনটেক্সট (গেস্ট/ফেইল-ফলব্যাক) */
function blankAffinity() {
  return { followingIds: new Set(), reactedAuthorIds: new Set() };
}

/**
 * লগড-ইন ইউজারের অ্যাফিনিটি-সেট — ২টি ছোট কুয়েরি:
 *   ① followingIds: যাদের অনুসরণ করি (follows)
 *   ② reactedAuthorIds: যাদের লেখায় আগে রিঅ়াক্ট করেছি (likes × posts)
 * কুয়েরি-ফেইলে খালি-সেট (নিরপেক্ষ র‍্যাংকিং — গ্রেসফুল)।
 */
async function buildAffinity(me) {
  if (!me) return blankAffinity();
  try {
    const db = dbx();
    const following = new Set(
      (await db.prepare('SELECT following_id FROM follows WHERE follower_id = ?').all(me.id))
        .map(r => r.following_id));
    const reacted = new Set(
      (await db.prepare(
        'SELECT DISTINCT p.author_id FROM likes l JOIN posts p ON p.id = l.post_id WHERE l.user_id = ? AND p.author_id IS NOT NULL'
      ).all(me.id)).map(r => r.author_id));
    return { followingIds: following, reactedAuthorIds: reacted };
  } catch (_) {
    return blankAffinity();
  }
}

/** আইটেমের অ্যাফিনিটি-বোনাস (সংখ্যা — স্কোরের লবে যোগ হয়) */
function affinityBonus(item, aff) {
  if (!aff || !item || !item.author_id) return 0;
  let b = 0;
  if (aff.followingIds && aff.followingIds.has(item.author_id)) b += AFF.follow;
  if (aff.reactedAuthorIds && aff.reactedAuthorIds.has(item.author_id)) b += AFF.reactMatch;
  return b;
}

/**
 * UI-ব্যাজ — প্রাসঙ্গিক-মোডের কার্ড-হেডে ছোট "কেন-দেখছেন" চিপ।
 * প্রাধান্য: অনুসৃত → আলোচিত (এনগেজমেন্ট ≥ ১০) → নতুন (< ২৪ঘ)।
 * খালি-স্ট্রিং হলে ভিউতে চিপ আঁকা হয় না। activity-আইটেমে কখনোই নয়
 * (ranked-পুলে ওরা নেই-ই)।
 */
function rankBadge(item, aff) {
  if (!item || item.item_type === 'activity') return '';
  if (affinityBonus(item, aff) >= AFF.follow) return 'followed';
  const eng = (item.like_count | 0) + (item.comment_count | 0) + (item.share_count | 0);
  if (eng >= 10) return 'hot';
  const raw = String(item.created_at || '');
  const t = Date.parse(raw.includes('T') || raw.includes('Z') ? raw : raw.replace(' ', 'T'));
  const ageH = Number.isFinite(t) ? Math.max(0, (Date.now() - t) / 3.6e6) : Infinity;
  if (ageH < 24) return 'fresh';
  return '';
}

module.exports = { AFF, blankAffinity, buildAffinity, affinityBonus, rankBadge };
