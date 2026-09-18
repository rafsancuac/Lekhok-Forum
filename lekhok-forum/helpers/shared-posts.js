/* ═══════════════════════════════════════════════════════════════════════════
   helpers/shared-posts.js — সেশন ১৪৭: ফেসবুক-প্যারিটি নেস্টেড শেয়ার-পোস্ট ডেকোরেটর
   ───────────────────────────────────────────────────────────────────────────
   শেয়ার-কপি (posts.shared_from IS NOT NULL, post_kind='share') ফিড/প্রোফাইল-
   টাইমলাইনে FB-আর্কিটেকচারে রেন্ডার হবে: শেয়ারকারীর হেডার + (repost_note
   ক্যাপশন) + ভেতরে মূল-পোস্টের নেস্টেড কার্ড + গ্লোবাল ফুটার।

   চুক্তি:
   · decorateShared(rows) — rows-এর মধ্যে shared_from-ক্যারিং পোস্টগুলোতে
     `shared_orig` অ্যাটাচ করে (মূল-পোস্ট + মূল-লেখক-ফিল্ড)। মূল মুছে গেলে
     row._orphan = true (feed-cards.ejs-এর বিদ্যমান গার্ড এটাই স্কিপ করে)।
   · এক IN-কোয়েরি — N+1 শূন্য; sql.js (সিঙ্ক) + Turso (Promise) দুই-মোডই
     Promise-র‍্যাপে ঐক্যবদ্ধ (social.js-এর all91-প্যাটার্ন)।
   · মূল-পোস্টের দৃশ্যমানতা: published/hidden সবই রেন্ডার-যোগ্য (মালিক-নিজের
     শেয়ারে মূল hidden হলেও শেয়ার-বাবল বেঁচে থাকে — FB-ব্যবহার); draft/archived
     মূল হলে orphan-গণনা (শেয়ার-কপি নীরবে সরে)।
   · এই ফাইলে নতুন ডেটা-ফিল্ড যোগ করলে FeedPostCard.ejs-এর shared-শাখাও দেখুন।
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

module.exports = function makeSharedPosts(db) {
  return {
    /** rows-এর shared_from-ক্যারিং আইটেমে shared_orig অ্যাটাচ (মিউটেটিং)। */
    decorateShared: async function decorateShared(rows) {
      const list = (rows || []).filter(r => r && r.shared_from);
      if (!list.length) return rows;
      const ids = [...new Set(list.map(r => Number(r.shared_from)).filter(Boolean))];
      if (!ids.length) return rows;
      const ph = ids.map(() => '?').join(',');
      let origs = [];
      try {
        origs = await Promise.resolve().then(() => db.prepare(`
          SELECT p.id, p.title, p.body, p.excerpt, p.cover_image, p.published_at, p.created_at,
                 p.comment_count, p.share_count, p.view_count,
                 u.id AS author_id, u.username, u.full_name, u.pen_name,
                 u.avatar_url, u.gender, u.designation
          FROM posts p JOIN users u ON u.id = p.author_id
          WHERE p.id IN (${ph})
        `).all(...ids)).catch(() => []);
      } catch (_) { origs = []; }
      const byId = {};
      origs.forEach(o => { byId[o.id] = o; });
      list.forEach(row => {
        const o = byId[Number(row.shared_from)];
        if (!o || (o.title === undefined)) { row._orphan = true; return; }
        // শেয়ার-কপির নিজস্ব কপি-করা body/excerpt এখানে রেন্ডার হয় না (FB-নেস্টেড —
        // কনটেন্ট মূল-কার্ডে); মূল-কার্ডের জন্য এক্সেরপ্ট-সিড হেল্পারের কাছে পাঠানো হয়।
        row.shared_orig = o;
      });
      return rows;
    },

    /**
     * সেশন ১৫৩: অডিয়েন্স-ফিল্টার — FB-কম্পোজারের audience মান সম্মান করে।
     *   PUBLIC  → সবাই (audience NULL/খালি = পুরনো-রো → পাবলিক ধরা হয়)
     *   ONLY_ME → শুধু লেখক
     *   FRIENDS → লেখক + পারস্পরিক-অনুসরণ (মিউচুয়াল-ফলো = এই ফোরামের 'বন্ধু')
     * ডিজাইন-সিদ্ধান্ত: SQL-হস্তক্ষেপ নয় (buildFeedSql কার্সর/র্যাংকড/fresh তিন-মোডের
     * হট-পথ — সংঘর্ষ-ঝুঁকি), বদলে রেন্ডার-চোক-পয়েন্টে JS-ফিল্টার: decorateFeed
     * (ফিড) + profile-route (টাইমলাইন)। পেজ-সাইজ বিরল-ক্ষেত্রে সামান্য কমতে পারে।
     * friendIds: viewer-এর পারস্পরিক-অনুসরণ-সেট (routes ব্যাচ-কুয়েরিতে দেয়); শূন্য
     * হলে FRIENDS-পোস্ট শুধু লেখক-নিজে দেখে।
     */
    filterByAudience153: function filterByAudience153(rows, me, friendIds) {
      const uid = me ? Number(me.id) : null;
      const friends = (friendIds || []).map(Number);
      return (rows || []).filter(r => {
        const aud = String(r.audience || 'PUBLIC').toUpperCase();
        if (aud === 'PUBLIC' || aud === '') return true;
        if (!uid) return false;                 // অতিথি → নন-পাবলিক শূন্য
        if (Number(r.author_id) === uid) return true;
        if (aud === 'ONLY_ME') return false;
        if (aud === 'FRIENDS') return friends.includes(Number(r.author_id));
        return false;                            // অজানা-মান → রক্ষণশীল (লুকান)
      });
    },

    /** viewer-এর পারস্পরিক-অনুসরণ-আইডি-সেট (filterByAudience153-এর friendIds)। */
    mutualFollowIds153: async function mutualFollowIds153(me) {
      if (!me) return [];
      try {
        const rows = await db.prepare(`
          SELECT f1.follower_id AS a, f1.following_id AS b
          FROM follows f1
          JOIN follows f2 ON f2.follower_id = f1.following_id AND f2.following_id = f1.follower_id
          WHERE f1.follower_id = ? OR f1.following_id = ?
        `).all(me.id, me.id);
        const ids = new Set();
        (rows || []).forEach(r => { if (Number(r.a) !== Number(me.id)) ids.add(Number(r.a)); if (Number(r.b) !== Number(me.id)) ids.add(Number(r.b)); });
        return [...ids];
      } catch (_) { return []; }
    }
  };
};
