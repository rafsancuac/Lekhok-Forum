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
    }
  };
};
