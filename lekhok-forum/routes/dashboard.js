const express = require('express');
const router = express.Router();
const db = require('../db');
const { messageUpload, complaintUpload, attachmentUpload, messageAudioUpload, withUpload } = require('../middleware/upload');
const rolePolicy = require('../helpers/role-policy');
const { displayName } = require('../helpers/display-name');
const sseHub = require('../helpers/sse'); // সেশন ৯৯ (রোডম্যাপ-০১): SSE রিয়েল-টাইম হাব
const FR = require('../helpers/feed-ranking'); // সেশন ১০২ (০৮-ইউনিয়ন): অ্যাফিনিটি + র‍্যাংক-ব্যাজ
const sharedPosts147 = require('../helpers/shared-posts')(db); // সেশন ১৪৭: নেস্টেড শেয়ার-ডেকোরেটর

// ── ডুপ্লিকেট-নোটিফিকেশন গার্ড: একই ইউজার+টাইপ+বডি ১ মিনিটের মধ্যে দ্বিতীয়বার ঢোকে না ──
// সেশন ৯১ (B4): ঐচ্ছিক prefsKind — প্রাপকের notify_prefs[kind]===false হলে নোটিফিকেশনই হয় না
// (মেসেজ-পরিবারে 'notify_messages'; মিউট-চেক আলাদাই আছে — প্রেফ = স্থায়ী, মিউট = প্রতি-কথোপকথন)।
const { prefAllows } = require('../helpers/notify');
async function notifyOnce(uid, type, title, body, link, windowMin, prefsKind) {
  try {
    if (prefsKind && !(await prefAllows(uid, prefsKind))) return false;
    const dup = await db.prepare(
      "SELECT id FROM notifications WHERE user_id = ? AND type = ? AND body = ? AND created_at >= datetime('now', ?) LIMIT 1"
    ).get(uid, type, body, '-' + (windowMin || 10) + ' minutes');
    if (dup) return false;
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(uid, type, title, body, link);
    // সেশন ৯৯: SSE পুশ — মিউট/প্রেফ/ডিডাপ-গার্ড-পাস-করা নোটিফিকেশনই টোস্ট-যোগ্য
    try { sseHub.publishToUser(uid, 'notification', { type, title, body, link }); } catch (_) {}
    return true;
  } catch (e) { return false; }
}

function ensureAuth(req, res, next) {
  if (!req.session.user) {
    // API endpoints (typing / poll / check / unread) must get JSON 401 —
    // XHR follows redirects blindly and would choke on login-page HTML.
    if (req.originalUrl.startsWith('/api/') || req.xhr) return res.status(401).json({ error: 'login' });
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

// ── Online presence (5-min activity window) ───────────────────────
// lastSeen map: userId -> timestamp
const onlineState = new Map();
function touchOnline(userId) { onlineState.set(userId, Date.now()); }
function isOnline(userId) {
  const ts = onlineState.get(userId);
  // BUGFIX: bare `ts && …` returned `undefined` (not false) for never-seen
  // users → JSON.stringify({online: undefined}) dropped the key entirely,
  // and the /api/messages/online endpoint replied with `{}`.
  return !!(ts && (Date.now() - ts) < 5 * 60 * 1000);
}

// Touch own online state on ANY router hit (registered before all routes)
router.use(async (req, res, next) => {
  if (req.session && req.session.user) {
    touchOnline(req.session.user.id);
    if (process.env.DBG75) console.log('[dbg75] touch uid=' + req.session.user.id, req.method, req.path);
  }
  next();
});


// ── Dashboard (Facebook-style feed) ───────────────────────────────────────

// সেশন ৮৯: ফিড-কুয়েরি বিল্ডার — /dashboard ও /dashboard/more (ইনফিনিট-স্ক্রল)
// দুই রুটই একই SQL শেয়ার করে (ডুপ্লিকেট-লজিক এড়াতে)। ইউজার না-থাকলে
// 'following' ফিল্টার স্বয়ংক্রিয়ভাবে 'all'-এ নামে।
// সেশন ১০০ (রোডম্যাপ-০৮): ranked-পুল — স্কোরিং-পুল কুয়েরি (LIMIT/OFFSET ছাড়া,
// activity বাদ — এনগেজমেন্ট-০ মডারেটর-পোস্ট র‍্যাংকে অর্থহীন); স্কোর-সাজানো JS-সাইডে
// applyRankedSort()-এ (২-পাস স্কোরিং — পাস-১ SQL পুল, পাস-২ time-decay স্কোর)।
// UNION-গোটচা-সচেতন: view_count তিন শাখাতেই সমান-অর্ডারে যোগ করা হয়েছে।
// সেশন ১০৪ (রোডম্যাপ-০৫): OFFSET→keyset (কার্সার) পেজিনেশন।
//   • কার্সার-টুপল = (created_at, item_type, id) — পরবর্তী-পেজ = টুপলের চেয়ে কঠোর-ছোট
//     (DESC-অর্ডারে) → সার্ভার-সাইডে O(1)-জাম্প, OFFSET-এর O(n)-স্ক্যান ও বড়-অফসেটের
//     পারফরম্যান্স-ক্ষয় নেই; পেজ-মাঝে-নতুন-পোস্ট-ঢুকলেও ডুপ্লিকেট/স্কিপ-শূন্য (OFFSET-এর মূল-ব্যধি)।
//   • ORDER BY-তে item_type+id টাই-ব্রেকার যোগ → এক-সেকেন্ডে-একাধিক-পোস্টেও পেজ-সীমানা
//     নির্ধারণী (পুরনো OFFSET-যুগের টাই-শাফল-বাগও সহ-নির্মূল)।
//   • ranked-মোড keyset-প্রযোজ্য নয় (র‍্যাংক-অর্ডার created_at-মোনোটোনিক নয়) — পুল
//     FEED_POOL_CAP=১৫০-বাউন্ডেড বলে JS-স্লাইসই সঠিক (রানওয়ে-গার্ড off>300)।
const FEED_POOL_CAP = 150; // ranked পুল — সর্বশেষ ১৫০ পোস্টের মধ্যেই র‍্যাংকিং (স্কেল-সুরক্ষা)

// কার্সার-শাখা-কন্ডিশন: শাখার কনস্ট্যান্ট-টাইপ T ও কার্সার-টাইপ ct তুলনা করে
// সরলীকৃত কন্ডিশন জেনারেট (item_type শাখা-প্রতি ধ্রুবক — ৩-কেসেই সংকুচিত):
//   T > ct → টাই-সেকেন্ডের এই-শাখার সব-আইটেম কার্সারের আগে → শুধু ts < cur
//   T = ct → টাই-সেকেন্ডে id-টাই-ব্রেকার: (ts < cur OR (ts = cur AND id < curId))
//   T < ct → টাই-সেকেন্ডের এই-শাখার সব-আইটেম কার্সারের পরে → ts <= cur
function feedCursorCond(branchType, tsCol, idCol, cursor, freshMode) {
  if (!cursor || !cursor.ts || !cursor.type) return '';
  const ct = String(cursor.type);
  /* সেশন ১৪৪: freshMode=true = দিক-মিরর — 'কার্সরের চেয়ে নতুন' (DESC-ক্রমে
     কার্সরের আগে-সর্ট) — /api/feed/fresh-এর জন্য। legacy পেজিনেশন = পুরনো-দিক,
     freshMode-বিহীন কলে SQL হুবহু আগের মতোই (অপরিবর্তিত-চুক্তি)। */
  if (freshMode) {
    if (branchType > ct) return ` AND ${tsCol} >= ?`;
    if (branchType === ct) return ` AND (${tsCol} > ? OR (${tsCol} = ? AND ${idCol} > ?))`;
    return ` AND ${tsCol} > ?`;
  }
  if (branchType > ct) return ` AND ${tsCol} < ?`;
  if (branchType === ct) return ` AND (${tsCol} < ? OR (${tsCol} = ? AND ${idCol} < ?))`;
  return ` AND ${tsCol} <= ?`;
}
function feedCursorParams(branchType, cursor) {
  if (!cursor || !cursor.ts || !cursor.type) return [];
  const ct = String(cursor.type);
  if (branchType > ct) return [cursor.ts];
  if (branchType === ct) return [cursor.ts, cursor.ts, cursor.id];
  return [cursor.ts];
}

function buildFeedSql(filter, me, limit, offset, ranked, cursor, freshMode) {
  const lim = Math.max(1, Math.min(30, limit | 0 || 30));
  const off = Math.max(0, offset | 0);
  const ORDER = ' ORDER BY created_at DESC, item_type DESC, id DESC'; // ১০৪: নির্ধারণী-টাই-ব্রেকার
  const useCursor = !ranked && cursor && cursor.ts && cursor.type;
  const limOff = ranked
    ? ORDER + ` LIMIT ${Math.max(FEED_POOL_CAP, off + lim)}`
    : useCursor
      ? ORDER + ` LIMIT ${lim + 1}` // কার্সার-মোড: hasMore-সঠিকতার জন্য +১
      : ORDER + ` LIMIT ${lim} OFFSET ${off}`;
  // সেশন ১৫৩: নতুন কলাম ×৫ (rich_content/background_color/feeling/location/audience)
  // UNION-কলাম-সাম্য চুক্তি — তিন-শাখাতেই যোগ (activity শাখায় NULL; কার্যক্রমে ধারণাই নেই)
  const RICH153 = 'p.rich_content, p.background_color, p.feeling, p.location, p.audience';
  const RICH153_NULL = 'NULL as rich_content, NULL as background_color, NULL as feeling, NULL as location, NULL as audience';
  // সেশন ১৫৮: শাখা-লেবেল (category) — ফিড-কার্ডে .ucs158-cat-chip; UNION-কলাম-সাম্য অক্ষুণ্ণ
  const CAT158 = 'p.category';
  const CAT158_NULL = 'NULL as category';
  const ARTICLE_SQL = `\n    SELECT 'article' as item_type, p.id as id, p.title, p.body, p.cover_image, p.tags, p.shared_from, p.repost_note,
           NULL as accepted_flag,
           p.published_at as created_at, p.like_count, p.comment_count, p.share_count, p.reactions, p.view_count,
           NULL as accepted_comment_id,
           ${RICH153}, ${CAT158},
           p.author_id,
           u.full_name as author_name, u.pen_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'article'`;
  const QUESTION_SQL = ` /* session132: accepted_flag — ফিড-প্রশ্ন-কার্ডে গ্রহণকৃত-উত্তর-ব্যাজ */\n    SELECT 'question' as item_type, p.id as id, p.title, p.body, p.cover_image, p.tags, p.shared_from, p.repost_note,
           (CASE WHEN p.accepted_comment_id IS NOT NULL THEN 1 ELSE 0 END) as accepted_flag,
           p.published_at as created_at, p.like_count, p.comment_count, p.share_count, p.reactions, p.view_count,
           p.accepted_comment_id,
           ${RICH153}, ${CAT158},
           p.author_id,
           u.full_name as author_name, u.pen_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'question'`;
  const ACTIVITY_SQL = `\n    SELECT 'activity' as item_type, dc.id as id, dc.title, dc.body, dc.image_url as cover_image, dc.content_type as tags,
           NULL as shared_from, NULL as repost_note,
           NULL as accepted_flag,
           dc.created_at, 0 as like_count, 0 as comment_count, 0 as share_count, '{}' as reactions, 0 as view_count,
           NULL as accepted_comment_id,
           ${RICH153_NULL}, ${CAT158_NULL},
           NULL as author_id,
           '\u09ae\u09a1\u09be\u09b0\u09c7\u099f\u09b0' as author_name, NULL as pen_name, 'moderator' as username, NULL as avatar_url, 'other' as gender, '' as designation, 'moderator' as author_role
    FROM daily_content dc
    WHERE dc.content_type = 'activity' AND dc.published = 1`;

  // ১০৪: শাখা-প্রতি কার্সার-কন্ডিশন + প্যারাম (শাখা-যোগদান-ক্রমেই প্যারাম-ক্রম)
  const cArt = feedCursorCond('article', 'p.published_at', 'p.id', cursor, freshMode);
  const cQues = feedCursorCond('question', 'p.published_at', 'p.id', cursor, freshMode);
  const cAct = feedCursorCond('activity', 'dc.created_at', 'dc.id', cursor, freshMode);
  const pArt = feedCursorParams('article', cursor);
  const pQues = feedCursorParams('question', cursor);
  const pAct = feedCursorParams('activity', cursor);

  let sql, params = [];
  if (filter === 'article') {
    sql = ARTICLE_SQL + cArt + limOff;
    params = pArt;
  } else if (filter === 'question') {
    sql = QUESTION_SQL + cQues + limOff;
    params = pQues;
  } else if (filter === 'activity') {
    // ranked-এ activity বাদ — 'activity'-ফিল্টার + ranked = recent-অর্ডারেই (স্কোর-০)
    sql = ACTIVITY_SQL + cAct + limOff;
    params = pAct;
  } else if (filter === 'following' && me) {
    sql = ARTICLE_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)` + cArt + `
      UNION ALL ` + QUESTION_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)` + cQues + limOff;
    params = [me.id].concat(pArt, [me.id], pQues);
  } else if (ranked) {
    // র‍্যাংকড-পুল: article+question (activity বাদ) — পুল-ক্যাপ LIMIT limOff-এই বসে
    sql = ARTICLE_SQL + ' UNION ALL ' + QUESTION_SQL + limOff;
  } else {
    sql = ARTICLE_SQL + cArt + ' UNION ALL ' + QUESTION_SQL + cQues + ' UNION ALL ' + ACTIVITY_SQL + cAct + limOff;
    params = [].concat(pArt, pQues, pAct);
  }
  return { sql, params };
}

// সেশন ১০০ (রোডম্যাপ-০৮): এনগেজমেন্ট-র‍্যাংকড স্কোরিং — time-decay (FB "জনপ্রিয়")।
// score = (like×2 + comment×3 + share×2.5) / (ageHours + 2)^1.15
//   • like_count আসলে মোট-রিঅ্যাকশন (react-এন্ডপয়েন্ট recompute করে রাখে) — দ্বিগুণ-গণনা নেই
//   • কমেন্ট-ওজন সর্বোচ্চ (FB-প্যাটার্ন: কথোপকথন > রিঅ্যাকশন > শেয়ার)
//   • ageHours+2 ফ্লোর নতুন-পোস্টকে সুস্পষ্ট-সুবিধা দেয়; ^1.15 = ধীর-ক্ষয় (৭২ঘ→÷৫.৪)
//   • view_count ×০.২ — পড়া গণনায় সামান্য-ওজন (র‍্যাংক-ইঞ্জিনের প্রত্যাশা-মতো)
function rankScoreOf(item, nowMs, aff) {
  const raw = String(item.created_at || '');
  const t = Date.parse(raw.includes('T') || raw.includes('Z') ? raw : raw.replace(' ', 'T'));
  const ageH = Number.isFinite(t) ? Math.max(0, (nowMs - t) / 3.6e6) : 0;
  const engagement =
    (item.like_count | 0) * 2 +
    (item.comment_count | 0) * 3 +
    (item.share_count | 0) * 2.5 +
    (item.view_count | 0) * 0.2;
  // সেশন-১০২ (০৮-ইউনিয়ন): + অ্যাফিনিটি-বোনাস (follow×3 + reaction-মিল×2) —
  // PLANS.md-স্পেকের "সামঞ্জস্য-স্কোর"; গেস্টে/aff-শূন্যে আগের-মতোই নিরপেক্ষ-গ্লোবাল
  return (engagement + FR.affinityBonus(item, aff)) / Math.pow(ageH + 2, 1.15);
}
function applyRankedSort(pool, nowMs, aff) {
  const now = nowMs || Date.now();
  return pool
    .map(i => ({ i, s: rankScoreOf(i, now, aff) }))
    // সেশন-১০২: ৩ম-টাই-ব্রেক (score → created_at → id) — সম্পূর্ণ-ডিটারমিনিস্টিক
    // ক্রম → /dashboard/more-এর অফসেট-স্লাইসিং স্থির
    .sort((a, b) => (b.s - a.s)
      || String(b.i.created_at).localeCompare(String(a.i.created_at))
      || ((b.i.id | 0) - (a.i.id | 0)))
    .map(x => x.i);
}
// ranked ফিড-পেজ: পুল এনে স্কোর-সাজিয়ে offset..offset+limit স্লাইস
async function rankedFeedSlice(filter, me, limit, offset, aff) {
  const lim = Math.max(1, Math.min(30, limit | 0 || 30));
  const off = Math.max(0, offset | 0);
  if (off > 300) return { items: [], hasMore: false }; // রানওয়ে-গার্ড (recent-মোডের সমান)
  const { sql, params } = buildFeedSql(filter, me, lim, off, true);
  const pool = await db.prepare(sql).all(...params);
  const ranked = applyRankedSort(pool, undefined, aff);
  const items = ranked.slice(off, off + lim);
  items.forEach(i => { i.rank_badge = FR.rankBadge(i, aff); }); // সেশন-১০২: "কেন-দেখছেন" চিপ
  return { items, hasMore: off + lim < ranked.length && off + lim <= 300 };
}

// সেশন ৮৯: ফিড-ডেকোরেশন — /dashboard ও /dashboard/more-এর শেয়ার্ড পাইপলাইন।
//   • reactionCounts/myReaction/link/display_name (D1 — pen_name-প্রধান নাম)
//   • ছবি: (A2) N+1 ফিক্স — আগে প্রতি-আইটেমে getPostImages() কল হতো (৩০ আইটেম =
//     ৩০+ কুয়ারি); এখন দুটি batch কুয়ারিতে (post + daily) সব ছবি এনে মেমোরিতে গ্রুপ
//   • reactorFaces: FB-২০২৪ ফেসপাইল — প্রতি-পোস্টে সর্বশেষ ৩ রিঅ্যাক্টরের মিনি-অ্যাভাটার (১ batch)
//   • commentPreview: ফিড-কার্ডের নিচে সর্বশেষ মন্তব্যের প্রিভিউ-লাইন (১ batch)
async function decorateFeed(feed, me, { withBookmarks } = {}) {
  // সেশন ১৪৭: শেয়ার-কপিগুলোতে shared_orig অ্যাটাচ (FB-নেস্টেড রেন্ডার —
  // FeedPostCard-এর shared-শাখা)। withBookmarks-মোডে ফিড খালি — স্কিপ-সস্তা।
  if (!withBookmarks) await sharedPosts147.decorateShared(feed);
  // সেশন ১৫৩: অডিয়েন্স-সম্মান — ONLY_ME/FRIENDS-পোস্ট অনুমোদিত দর্শক ছাড়া
  // ফিডে আসবেই না (মিউটেটিং-ফিল্টার; ব্যাচ-ডেকোরেশনের আগেই — লুকানো-পোস্টে
  // কোনো কুয়েরি-খরচ নেই)।
  const _friends153 = await sharedPosts147.mutualFollowIds153(me);
  const _visible153 = sharedPosts147.filterByAudience153(feed, me, _friends153);
  if (_visible153.length !== feed.length) {
    feed.length = 0;
    feed.push(..._visible153);
  }
  const postItems = feed.filter(i => i.item_type !== 'activity');
  const postIds = postItems.map(i => i.id);
  const dailyIds = feed.filter(i => i.item_type === 'activity').map(i => i.id);
  const ph = (n) => n ? '(' + n.map(() => '?').join(',') + ')' : null;

  // (৫০) আমার রিঅ্যাকশন — এক batch
  const myReactions = {};
  if (me && postIds.length) {
    try {
      const likes = await db.prepare(
        `SELECT post_id, reaction_type FROM likes WHERE user_id = ? AND post_id IN (${postIds.map(() => '?').join(',')})`
      ).all(me.id, ...postIds);
      for (const l of likes) myReactions[l.post_id] = l.reaction_type || 'like';
    } catch (_) {}
  }

  // (A2) ছবি-ব্যাচ — post + daily দুই এন্টিটি-টাইপে দুটি কুয়ারি (আগে ছিল N কুয়ারি)
  // সেশন ১৫৩: media_type-ও ('image'|'video'|'audio') — FB-কোলাজ-রেন্ডারের
  // item.media=[{url,type}]; item.images পুরনো-চুক্তি (শুধু-ছবি-URL) অক্ষুণ্ণ।
  const imgsByEntity = {};
  try {
    if (postIds.length) {
      (await db.prepare(`SELECT entity_id, image_url, media_type FROM post_images WHERE entity_type = 'post' AND entity_id IN ${ph(postIds)} ORDER BY sort_order, id`).all(...postIds))
        .forEach(r => {
          (imgsByEntity['post:' + r.entity_id] = imgsByEntity['post:' + r.entity_id] || []).push({ url: r.image_url, type: r.media_type || 'image' });
        });
    }
    if (dailyIds.length) {
      (await db.prepare(`SELECT entity_id, image_url, media_type FROM post_images WHERE entity_type = 'daily' AND entity_id IN ${ph(dailyIds)} ORDER BY sort_order, id`).all(...dailyIds))
        .forEach(r => {
          (imgsByEntity['daily:' + r.entity_id] = imgsByEntity['daily:' + r.entity_id] || []).push({ url: r.image_url, type: r.media_type || 'image' });
        });
    }
  } catch (_) { /* post_images টেবিল/কলাম না থাকলে পুরনো-পথ */ }

  // সেশন ১৪৭: কার্যক্রম-কার্ডের রিঅ্যাকশন-সত্য (কাউন্টার-ড্রিফট-ফিক্স) — daily_content-এ
  // reactions/like_count কলাম নেই, কিন্তু /api/react likes-টেবিলে লেখে → ক্লিকে '১'
  // দেখিয়ে রিলোডে '০' হতো। সার্ভার-ট্রুথ এখন likes-টেবিল থেকেই (API-র রিকম্পিউট-উৎস
  // হুবহু — এক-সোর্স; posts-আইটেমের মতোই এক ব্যাচ-কুয়েরি)।
  const actRxTruth = {};
  if (dailyIds.length) {
    try {
      (await db.prepare(`SELECT post_id, reaction_type, COUNT(*) AS c FROM likes WHERE post_id IN ${ph(dailyIds)} GROUP BY post_id, reaction_type`).all(...dailyIds))
        .forEach(r => {
          const row = (actRxTruth[r.post_id] = actRxTruth[r.post_id] || { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
          row[r.reaction_type || 'like'] = r.c;
        });
    } catch (_) {}
  }

  // (৮৯) ফেসপাইল-ব্যাচ — প্রতি-পোস্টে সর্বশেষ ৩ রিঅ্যাক্টর (ডিস্টিঙ্ক্ট ইউজার)
  const facesByPost = {};
  if (postIds.length) {
    try {
      (await db.prepare(`
        SELECT l.post_id, u.id, u.username, u.full_name, u.avatar_url, u.pen_name
        FROM likes l JOIN users u ON u.id = l.user_id
        WHERE l.post_id IN ${ph(postIds)} AND IFNULL(l.reaction_type, '') != ''
        ORDER BY l.created_at DESC, l.id DESC
      `).all(...postIds)).forEach(r => {
        const arr = (facesByPost[r.post_id] = facesByPost[r.post_id] || []);
        if (arr.length < 3 && !arr.some(x => x.id === r.id)) arr.push(r);
      });
    } catch (_) {}
  }

  // (৮৯+৯২) কমেন্ট-প্রিভিউ-ব্যাচ — প্রতি-পোস্টের সর্বশেষ ২ মন্তব্য (FB-স্টাইল
  // হাইলাইটেড-প্রিভিউ বাবল; আগে ছিল ১টি লাইন)
  const cmtByPost = {};
  if (postIds.length) {
    try {
      (await db.prepare(`
        SELECT c.post_id, c.body, c.created_at, u.id AS author_uid, u.username, u.full_name, u.avatar_url, u.pen_name
        FROM comments c JOIN users u ON u.id = c.author_id
        WHERE c.post_id IN ${ph(postIds)}
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT 400
      `).all(...postIds)).forEach(r => {
        const arr = (cmtByPost[r.post_id] = cmtByPost[r.post_id] || []);
        if (arr.length < 2) arr.push(r);
      });
    } catch (_) {}
  }

  for (const item of feed) {
    // সেশন ১৪৭: কার্যক্রম-কার্ডে likes-টেবিল-সত্য (উপরে actRxTruth); বাকিতে reactions-JSON
    if (item.item_type === 'activity') {
      item.reactionCounts = actRxTruth[item.id] || { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    } else {
      try { item.reactionCounts = JSON.parse(item.reactions || '{}'); } catch (_) { item.reactionCounts = {}; }
    }
    ['like','love','care','haha','wow','sad','angry'].forEach(k => { item.reactionCounts[k] = item.reactionCounts[k] || 0; });
    item.link = item.item_type === 'question' ? '/qa/' + item.id : (item.item_type === 'activity' ? '/activities' : '/articles/' + item.id);
    item.myReaction = (me && item.item_type !== 'activity') ? (myReactions[item.id] || null) : null;
    // (D1) কলমী-নাম-প্রধান প্রদর্শন-নাম (ফিড-কার্ডের লেখক-লাইনে)
    item.display_name = item.item_type === 'activity' ? item.author_name : displayName(item, item.author_name);
    if (!item.images && !item.media153) {
      // সেশন ১৫৩: মিডিয়া-রোগুলো [{url,type}] — item.media153 (কোলাজ) + item.images
      // (পুরনো-চুক্তি: শুধু-ছবি-URL; cover-ফলব্যাক অক্ষুণ্ণ)
      const rows153 = imgsByEntity[(item.item_type === 'activity' ? 'daily' : 'post') + ':' + item.id] || [];
      item.media153 = rows153;
      const imgUrls153 = rows153.filter(m => (m.type || 'image') === 'image').map(m => m.url);
      item.images = imgUrls153.length ? imgUrls153 : (item.cover_image ? [item.cover_image] : []);
    }
    item.reactorFaces = facesByPost[item.id] || [];
    // সেশন ১১০: আনুমানিক পড়ার-সময় — মার্কডাউন/HTML-মার্কার-স্ট্রিপ → ~৯৫০ অক্ষর/মিনিট
    // (বাংলা ~২০০ wpm × ~৪.৭ অক্ষর/শব্দ), ফ্লোর ১ — /dashboard + /dashboard/more দুটোতেই চলে
    if (item.item_type === 'article' || item.item_type === 'question') {
      const plain110 = String(item.body || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/[#*_>`~\[\]()!]/g, '')
        .replace(/\s+/g, ' ').trim();
      item.read_mins = Math.max(1, Math.round(plain110.length / 950) || 1);
    }
    // (৯২) FB-স্টাইল প্রিভিউ-বাবল ×২ — কম্প্যাক্ট রেন্ডারের জন্য মার্কার-স্ট্রিপড
    const cpList = cmtByPost[item.id] || [];
    if (cpList.length) {
      item.commentPreviews = cpList.map(cp => ({
        authorName: displayName(cp, cp.full_name),
        username: cp.username,
        avatar: cp.avatar_url || '/avatar/' + cp.author_uid,
        body: String(cp.body || '').replace(/^#{1,6}[ \t]+/gm, '').replace(/\s+/g, ' ').trim().substring(0, 110)
      }));
      item.commentPreview = item.commentPreviews[0]; // ৮৯-ব্যাকওয়ার্ড-কম্প্যাট
    }
  }

  if (withBookmarks && me) {
    try {
      return (await db.prepare('SELECT post_id FROM bookmarks WHERE user_id = ?').all(me.id)).map(r => r.post_id);
    } catch (_) { return []; }
  }
  return null; // myBookmarkedIds প্রত্যাশা করলে রিটার্ন-ভ্যালু হিসেবে পাঠায়
}

/* ── session133: /feed অ্যালায়াস — ডিজাইন-সিস্টেম-ডকসে "Social Feed" পেজটিকে /feed বলা হয়,
 *    বাস্তব-রুট /dashboard (session105 থেকে)। পুরনো-লিংক/বুকমার্ক/ডক-প্রত্যাশা 404-এ না-পড়ায়
 *    query-সংরক্ষণসহ 302 (filter/sort অক্ষুণ্ণ)। GET-শুধু — POST কখনো /feed-এ আসে না। ── */
router.get('/feed', (req, res) => {
  const qs = Object.keys(req.query || {}).length ? '?' + new URLSearchParams(req.query).toString() : '';
  res.redirect(302, '/dashboard' + qs);
});

router.get('/dashboard', async (req, res) => {
  const me = req.session.user || null;
  const filter = me && req.query.filter === 'following' ? 'following' : (req.query.filter || 'all');   // all | article | question | activity | following
  const sort = (req.query.sort === 'ranked' || req.query.sort === 'relevant') ? 'ranked' : 'recent'; // সেশন-১০০ (০৮) + ১০২-ইউনিয়ন ('relevant' অ্যালায়াস)

  let feed;
  if (sort === 'ranked') {
    // সেশন-১০২: লগড-ইন হলে অ্যাফিনিটি-সেট (২-কুয়েরি) → ব্যক্তিগত-র‍্যাংকিং + ব্যাজ
    const aff = me ? await FR.buildAffinity(me) : FR.blankAffinity();
    feed = (await rankedFeedSlice(filter, me, 30, 0, aff)).items;
  } else {
    const { sql, params } = buildFeedSql(filter, me, 30, 0);
    feed = await db.prepare(sql).all(...params);
  }
  await decorateFeed(feed, me);
  const myBookmarkedIds = (await decorateFeed([], me, { withBookmarks: true })) || [];

  // Right sidebar data
  const mmdd = new Date().toISOString().slice(5, 10); // MM-DD
  const birthdays = await db.prepare(`
    SELECT id, username, full_name, avatar_url, birth_date FROM users
    WHERE status = 'active' AND birth_date IS NOT NULL AND birth_date != ''
      AND substr(birth_date, 6) = ?
    LIMIT 6
  `).all(mmdd);

  const suggested = me ? await db.prepare(`
    SELECT id, username, full_name, avatar_url, designation,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count
    FROM users u
    WHERE u.status = 'active' AND u.id != ?
      AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
      AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
      AND u.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)
    ORDER BY follower_count DESC LIMIT 5
  `).all(me.id, me.id, me.id, me.id) : [];

  const myFollowing = me ? await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.designation, u.avatar_url
    FROM follows f JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = ? ORDER BY RANDOM() LIMIT 6
  `).all(me.id) : [];

  const tagRows = await db.prepare("SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != '' AND status = 'published' ORDER BY published_at DESC LIMIT 100").all();
  const tagCounts = {};
  tagRows.forEach(r => {
    String(r.tags).split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag, count }));

  // Leaderboard: top users by engagement score
  const leaderboard = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url,
      (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND status='published') +
      (SELECT COUNT(*) FROM comments WHERE author_id = u.id) +
      (SELECT COUNT(*) FROM likes WHERE user_id = u.id) as score
    FROM users u WHERE u.status = 'active'
    ORDER BY score DESC LIMIT 8
  `).all();

  // Trending posts: highest engagement in last 30 days
  // সেশন ১৪৮ (ইউজার-স্পেক): ট্রেন্ডিং-অ্যালগরিদম ফিল্টার —
  // ① প্রোফাইল-পিকচার/স্ট্যাটাস-আপডেট (post_kind='avatar_update' ইত্যাদি নন-লিটারারি কাইন্ড) কখনোই নয় —
  //    কেবল মৌলিক সাহিত্যকর্ম (কাইন্ড-শূন্য/writing/question)
  // ② একই শিরোনামের ডুপ্লিকেট-পোস্ট একবারই (JS-সাইড ডিডুপ — সর্বোচ্চ-এনগেজমেন্ট-টিক আগে আসে)
  const rawTrending148 = await db.prepare(`
    SELECT p.id, p.title, p.type,
      p.like_count + p.comment_count as engagement,
      u.full_name as author_name
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.published_at >= date('now', '-30 days')
      AND COALESCE(p.post_kind, '') NOT IN ('avatar_update')
      AND (p.like_count + p.comment_count) > 0
    ORDER BY engagement DESC, p.published_at DESC LIMIT 12
  `).all();
  const seenTitles148 = new Set();
  const trendingPosts = rawTrending148.filter(p => {
    const key = String(p.title || '').trim().toLowerCase();
    if (seenTitles148.has(key)) return false;
    seenTitles148.add(key);
    return true;
  }).slice(0, 5);

  let myInterests = [];
  if (me) { try { myInterests = JSON.parse(await db.prepare('SELECT interests FROM users WHERE id = ?').get(me.id)?.interests || '[]'); } catch (_) {} }

  // সেশন ১৪৮: 'আমার সারসংক্ষেপ' উইজেট গ্লোবাল-ফিড থেকে সরে /me-তে গেছে —
  // দৈনিক-প্রতি-রিকোয়েস্ট ৪-লাইট-কুয়েরির এ-ব্লক এখন ড্যাশবোর্ডে অপ্রয়োজনীয় (কোয়েরি-সাশ্রয়)

  // সেশন ৬৬+৮৯: bookmarked-প্রিফিল এখন decorateFeed()-এর সাথেই (উপরে myBookmarkedIds)

  // সেশন ১০৪ (রোডম্যাপ-০৫): পেজ-১-এর শেষ-আইটেম থেকে প্রাথমিক keyset-কার্সার —
  // ranked-মোডে কার্সার অর্থহীন (পুল-স্লাইস), খালি-ফিডেও নয়।
  const lastFeed = sort === 'recent' && feed.length ? feed[feed.length - 1] : null;
  const cursor = (lastFeed && lastFeed.created_at && lastFeed.item_type && lastFeed.id)
    ? { ts: String(lastFeed.created_at), type: String(lastFeed.item_type), id: lastFeed.id } : null;

  res.render('user/dashboard', {
    feed, filter, sort, birthdays, suggested, myFollowing, trendingTags, leaderboard, trendingPosts, myInterests,
    myBookmarkedIds, cursor,
    user: req.session.user || null,
    currentPath: '/dashboard'
  });
});

// ── সেশন ৮৯ (B1): ইনফিনিট-স্ক্রল — পরবর্তী ফিড-পেজ সার্ভার-রেন্ডার করে HTML ফেরত।
// ক্লায়েন্ট (main.js-এর feed-more ইঞ্জিন) IntersectionObserver-সেন্টিনেলে এই এন্ডপয়েন্ট
// ডেকে ফলাফল ফিডের শেষে append করে। per-page ১০, প্রথম পেজ ৩০ (/dashboard রুট)।
// গেস্ট-ও ব্যবহার করতে পারে (ফিড পাবলিক)।
// সেশন ১০৪ (রোডম্যাপ-০৫): OFFSET→keyset — recent-মোডে ?cursor=<ts>&cursorType=<type>&cursorId=<id>
// গ্রহণ করে (last.created_at/item_type/id টুপল); উত্তরে nextCursor ফেরত। OFFSET-প্যারাম
// অক্ষত (পুরনো-ক্যাশড ক্লায়েন্ট + ranked-মোডের ফলব্যাক)। ranked পুল-স্লাইসেই থাকে।
// সেশন ১৪৪: কার্সার-পার্স এখন /dashboard/more ও /api/feed/fresh দুই-এন্ডপয়েন্টেই
// একই parseFeedCursor হেল্পার দিয়ে (single-source — নরমালাইজেশন কখনো ভিন্ন হবে না)।
function parseFeedCursor(req) {
  // ১০৪: কার্সার-পার্স — ts নরমালাইজ (T/ফ্র্যাকশন/Z-কেটা), type হোয়াইট-লিস্ট, id পূর্ণসংখ্যা;
  // অসম্পূর্ণ কার্সার → null (OFFSET-ফলব্যাক) — কখনোই ৫০০ নয়।
  let cursor = null;
  const rawTs = String(req.query.cursor || '').trim();
  if (rawTs) {
    const ts = rawTs.replace('T', ' ').replace(/[Zz].*$/, '').replace(/\.\d+$/, '').slice(0, 19);
    const type = ['article', 'question', 'activity'].includes(String(req.query.cursorType)) ? String(req.query.cursorType) : '';
    const id = parseInt(req.query.cursorId, 10) || 0;
    if (ts.length === 19 && type && id > 0) cursor = { ts, type, id };
  }
  return cursor;
}

router.get('/dashboard/more', async (req, res) => {
  const me = req.session.user || null;
  const filter = me && req.query.filter === 'following' ? 'following' : (['article', 'question', 'activity'].includes(req.query.filter) ? req.query.filter : 'all');
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const sort = (req.query.sort === 'ranked' || req.query.sort === 'relevant') ? 'ranked' : 'recent'; // সেশন-১০০ (০৮) + ১০২ ('relevant' অ্যালায়াস) + ১০৪ keyset
  const cursor = parseFeedCursor(req);
  if (!cursor && offset > 300) return res.json({ ok: true, html: '', hasMore: false, nextOffset: offset }); // রানওয়ে-গার্ড (কার্সার-মোডে অপ্রাসঙ্গিক — টুপল-বাউন্ড)
  try {
    let feed, hasMore;
    if (sort === 'ranked') {
      const aff = me ? await FR.buildAffinity(me) : FR.blankAffinity(); // সেশন-১০২: অ্যাফিনিটি
      const r = await rankedFeedSlice(filter, me, 10, offset, aff);
      feed = r.items; hasMore = r.hasMore; // ১০২: পুল-শেষ-সীমা-সচেতন hasMore
    } else if (cursor) {
      // ১০৪: keyset — lim+১ এনে সঠিক hasMore; decorate-এর আগেই স্লাইস
      const { sql, params } = buildFeedSql(filter, me, 10, 0, false, cursor);
      const rows = await db.prepare(sql).all(...params);
      hasMore = rows.length > 10;
      feed = rows.slice(0, 10);
    } else {
      const { sql, params } = buildFeedSql(filter, me, 10, offset);
      feed = await db.prepare(sql).all(...params);
      hasMore = feed.length >= 10;
    }
    await decorateFeed(feed, me);
    const myBookmarkedIds = me ? ((await decorateFeed([], me, { withBookmarks: true })) || []) : [];
    res.render('partials/feed-cards', { feed, user: req.session.user || null, myBookmarkedIds, sort }, function (err, html) {
      if (err) return res.status(500).json({ ok: false, error: 'render' });
      const last = feed[feed.length - 1];
      res.json({
        ok: true, html, hasMore,
        nextCursor: (sort !== 'ranked' && hasMore && last && last.created_at && last.item_type && last.id)
          ? { ts: String(last.created_at), type: String(last.item_type), id: last.id } : null,
        nextOffset: offset + feed.length // legacy-কম্প্যাট
      });
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server' });
  }
});

// ── সেশন ১৪৪: ফিড 'নতুন পোস্ট' পিল-এর ফ্রেশ-কাউন্ট API (FB-প্যারিটি) ────────────
// GET /api/feed/fresh?cursor=<ts>&cursorType=<type>&cursorId=<id>&filter=<f>
// → { ok: true, fresh: N, capped: bool }
// বর্তমান-ফিডের টপ-আইটেমের keyset-টুপলের চেয়ে নতুন কতগুলো আইটেম এসেছে —
// buildFeedSql-এর কার্সর-মোড পুনঃব্যবহারে (visibility/ফিল্টার/লগইন-নিয়ম /dashboard-এর
// সাথে হুবহু অভিন্ন — আলাদা SQL নেই, তাই ড্রিফট-ঝুঁকি শূন্য)। ক্যাপ ৩০ (৩০+ দেখায়)।
// কার্সর-বিহীন/অসম্পূর্ণ কল → fresh:0 (কখনোই ৫০০ নয় — পিল-ইঞ্জিন নীরবে থেমে যাবে)।
router.get('/api/feed/fresh', async (req, res) => {
  try {
    const me = req.session.user || null;
    const filter = me && req.query.filter === 'following' ? 'following' : (['article', 'question', 'activity'].includes(req.query.filter) ? req.query.filter : 'all');
    const cursor = parseFeedCursor(req);
    if (!cursor) return res.json({ ok: true, fresh: 0, capped: false });
    const FRESH_CAP = 30;
    const { sql, params } = buildFeedSql(filter, me, FRESH_CAP, 0, false, cursor, true);
    const rows = await db.prepare(sql).all(...params);
    const fresh = Math.min(rows.length, FRESH_CAP);
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, fresh, capped: rows.length > FRESH_CAP });
  } catch (e) {
    res.json({ ok: true, fresh: 0, capped: false }); // নীরব-ডিগ্রেড — পিল-নয়জ কখনোই ৫০০ নয়
  }
});

// ── Messages (Messenger-like) ─────────────────────────────────────────────
// সেশন ৩৮: মেসেজ-রিয়েকশন ম্যাপ (এক কোয়েরিতে)
async function reactionMapFor(messages) {
  const map = {};
  try {
    const ids = (messages || []).map(m => m.id).filter(Boolean);
    if (!ids.length) return map;
    const rr = await db.prepare('SELECT message_id, emoji, COUNT(*) AS c FROM message_reactions WHERE message_id IN (' + ids.join(',') + ') GROUP BY message_id, emoji').all();
    rr.forEach(r => { (map[r.message_id] = map[r.message_id] || []).push({ emoji: r.emoji, c: r.c }); });
  } catch (e) {}
  return map;
}

// ── session183/190: মেসেঞ্জার-মিডিয়া স্থায়িত্ব — data-URI-in-DB + হালকা-প্রদর্শন লিংক ──
// অডিও ও ছবির বাইটস messages.file_url-এ data-URI হয়ে DB-তেই থাকে (middleware/upload.js
// messageAudioUpload: session183-অডিও + session190-ছবি) — বার্তার-সাথেই অমর,
// বাইরের-স্টোরেজ/ফাইল-সিস্টেম-যা-ই-হোক। তালিকা/পোল/প্যান/EJS-প্রদর্শনে ভারী data-URI-
// এর বদলে সংক্ষিপ্ত স্ট্রিম-লিংক যায়:
//   data:audio/* → /api/messages/audio/<id>-voice.webm  (audio-রুট)
//   data:image/* → /api/messages/media/<id>-img.<ext>   (media-রুট, নিচে)
// প্রত্যয়-এক্সটেনশন (.webm/.webp/…) — সব-জায়গার এক্সটেনশন-ভিত্তিক isAud/isImg চেক
// (বাবল/সাইডবার/প্যান/পোল-ক্লায়েন্ট) নির্বিঘ্নে কাজ করে।
function voiceStreamUrl(id, url) {
  const u = String(url || '');
  if (u.slice(0, 5) !== 'data:') return url;
  const nid = parseInt(id, 10);
  if (!(nid > 0)) return url;
  if (u.slice(0, 11) === 'data:audio/') return '/api/messages/audio/' + nid + '-voice.webm';
  if (u.slice(0, 11) === 'data:image/') {
    const m = u.match(/^data:\s*image\/([a-z0-9.+-]+)\s*;/i);
    const sub = (m && m[1]) || 'webp';
    const ext = sub === 'jpeg' ? 'jpg' : sub.replace(/[^a-z0-9]/gi, '');
    return '/api/messages/media/' + nid + '-img.' + ext;
  }
  return url;
}

// সেশন ৭৬: মিউট-স্টেট হেল্পার — মিউট করা সদস্যকে নোটিফিকেশন যাবে না
async function isConvMuted(convId, userId) {
  try {
    return !!(await db.prepare('SELECT 1 AS x FROM conversation_members WHERE conversation_id = ? AND user_id = ? AND muted = 1').get(convId, userId));
  } catch (e) { return false; }
}

// সেশন ৭৬: চ্যাট-মেসেজ লোড — রিপ্লাই-টার্গেট প্রিভিউ + এডিট-ট্রেসসহ
async function chatMessagesFor(convId) {
  try {
    const rows = await db.prepare(`
      SELECT m.*,
        rb.body AS reply_body, rb.file_url AS reply_file_url, rb.file_name AS reply_file_name,
        ru.full_name AS reply_sender_name, ru.username AS reply_sender_username
      FROM messages m
      LEFT JOIN messages rb ON rb.id = m.reply_to_id
      LEFT JOIN users ru ON ru.id = rb.sender_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(convId);
    // session183: ভয়েস data-URI → সংক্ষিপ্ত স্ট্রিম-লিংক (পেজ-পেলোড হালকা)
    rows.forEach(r => {
      r.file_url = voiceStreamUrl(r.id, r.file_url);
      if (r.reply_file_url) r.reply_file_url = voiceStreamUrl(r.reply_to_id, r.reply_file_url);
    });
    return rows;
  } catch (e) {
    const rows = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);
    rows.forEach(r => { r.file_url = voiceStreamUrl(r.id, r.file_url); });
    return rows;
  }
}

// সেশন ৯৩: চ্যাট-উইন্ডোিং (রোডম্যাপ-১১ ভিত্তি) — সম্পূর্ণ-ইতিহাস রেন্ডার বন্ধ।
// ডিফল্ট প্রাথমিক-রেন্ডার সর্বশেষ ৬০টি; ?all=1 পূর্ণ-ইতিহাস; ?around=<id> নির্দিষ্ট-বার্তা-কেন্দ্রিক
// উইন্ডো (সার্চ/রিপ্লাই-জাম্পে কনটেক্সটসহ রিলোড)। ডিটেইলস-ট্যাব ডেটা রুটে পূর্ণ-তালিকা থেকে গণনা হয়।
const CHAT_PER_PAGE = 60;       // প্রাথমিক + আগের-বার্তা ব্যাচ-সাইজ
const CHAT_AROUND_BEFORE = 25;  // around-মোডে টার্গেটের আগে কনটেক্সট-বার্তা

function buildChatWindow(allRows, opts) {
  opts = opts || {};
  let slice, aroundMode = false;
  if (opts.all) {
    slice = allRows;
  } else if (opts.aroundId && allRows.some(r => r.id === opts.aroundId)) {
    aroundMode = true;
    const i = allRows.findIndex(r => r.id === opts.aroundId);
    const start = Math.max(0, i - CHAT_AROUND_BEFORE);
    const end = Math.min(allRows.length, i + 1 + Math.round(CHAT_PER_PAGE / 2));
    slice = allRows.slice(start, end);
  } else {
    slice = allRows.slice(Math.max(0, allRows.length - CHAT_PER_PAGE));
  }
  const oldestId = slice.length ? slice[0].id : 0;
  const hasOlder = !opts.all && oldestId > 0 && allRows.some(r => r.id < oldestId);
  return { slice, hasOlder, oldestId, aroundMode };
}

// সেশন ৯৩: ডিটেইলস-প্যানেল ডেটা (মিডিয়া/ফাইল/ভয়েস/লিংক) — পূর্ণ-ইতিহাস থেকে (উইন্ডো নয়)
function buildChatShared(rows) {
  const isImg = (u) => u && /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(u);
  const isAud = (u) => u && /\.(webm|ogg|oga|m4a|mp3|wav|aac|opus)$/i.test(u);
  const seen = {}; const links = [];
  for (let i = rows.length - 1; i >= 0 && links.length < 12; i--) {
    const b = String(rows[i].body || ''); const re = /(https?:\/\/[^\s<>"']+)/gi; let mm;
    while ((mm = re.exec(b)) !== null) {
      const url = mm[1].replace(/[.,;:!)\]]+$/, '');
      if (seen[url]) continue; seen[url] = 1;
      links.push({ url, host: url.replace(/^https?:\/\//i, '').split('/')[0] });
      if (links.length >= 12) break;
    }
  }
  return {
    imgs: rows.filter(m => isImg(m.file_url)).slice(-9).reverse(),
    docs: rows.filter(m => m.file_url && !isImg(m.file_url) && !isAud(m.file_url)).slice(-12).reverse(),
    voice: rows.filter(m => isAud(m.file_url)).slice(-12).reverse(),
    links
  };
}

// সেশন ৯৩: আগের-বার্তা ব্যাচ (id-কার্সার — সন্নিবেশ-ক্রমে মনোটোনিক, created_at-ক্রমের সমতুল্য)
async function chatOlderBatch(convId, beforeId) {
  const rows = await db.prepare(`
    SELECT m.*,
      rb.body AS reply_body, rb.file_url AS reply_file_url, rb.file_name AS reply_file_name,
      ru.full_name AS reply_sender_name, ru.username AS reply_sender_username
    FROM messages m
    LEFT JOIN messages rb ON rb.id = m.reply_to_id
    LEFT JOIN users ru ON ru.id = rb.sender_id
    WHERE m.conversation_id = ? AND m.id < ?
    ORDER BY m.id DESC LIMIT ?
  `).all(convId, beforeId, CHAT_PER_PAGE);
  rows.reverse();
  let hasOlder = false;
  if (rows.length) {
    hasOlder = !!(await db.prepare('SELECT 1 AS x FROM messages WHERE conversation_id = ? AND id < ? LIMIT 1').get(convId, rows[0].id));
  }
  return { rows, hasOlder, oldestId: rows.length ? rows[0].id : 0 };
}

// সেশন ৩৮: 1-on-1 + গ্রুপ — একত্রে কথোপথন তালিকা (সাইডবার/লিস্ট দুই জায়গাতেই)
async function convListFor(me) {
  const one = await db.prepare(`
    SELECT c.*, 0 as is_group_flag,
      CASE WHEN c.user_a = ? THEN ub.full_name ELSE ua.full_name END as other_name,
      CASE WHEN c.user_a = ? THEN ub.username ELSE ua.username END as other_username,
      CASE WHEN c.user_a = ? THEN ub.avatar_url ELSE ua.avatar_url END as other_avatar,
      CASE WHEN c.user_a = ? THEN ub.gender ELSE ua.gender END as other_gender,
      '/messages/' || (CASE WHEN c.user_a = ? THEN ub.username ELSE ua.username END) as conv_link,
      (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_body,
      (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_sender_id,
      (SELECT id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_msg_id,
      (SELECT file_url FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_file_url,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count,
      IFNULL((SELECT pinned FROM conversation_members WHERE conversation_id = c.id AND user_id = ?), 0) as pinned,
      IFNULL((SELECT muted FROM conversation_members WHERE conversation_id = c.id AND user_id = ?), 0) as muted
    FROM conversations c
    JOIN users ua ON c.user_a = ua.id
    JOIN users ub ON c.user_b = ub.id
    WHERE (c.user_a = ? OR c.user_b = ?) AND IFNULL(c.is_group, 0) = 0
  `).all(me, me, me, me, me, me, me, me, me, me);
  let groups = [];
  try {
    groups = await db.prepare(`
      SELECT c.*, 1 as is_group_flag, c.title as other_name, NULL as other_username, NULL as other_avatar, NULL as other_gender,
        '/messages/g/' || c.id as conv_link,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_body,
        (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_sender_id,
        (SELECT id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_msg_id,
        (SELECT u.full_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_sender_name,
        (SELECT m.file_url FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_file_url,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count,
        (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as member_count,
        IFNULL(cm.pinned, 0) as pinned, IFNULL(cm.muted, 0) as muted
      FROM conversations c JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = ?
      WHERE IFNULL(c.is_group, 0) = 1
    `).all(me, me);
  } catch (e) {}
  // session183: সাইডবার-প্রিভিউতেও ভয়েস data-URI → '🎙️ ভয়েস মেসেজ' (MiniBubblePreview)
  const rows76 = one.concat(groups);
  rows76.forEach(r => { r.last_file_url = voiceStreamUrl(r.last_msg_id, r.last_file_url); });
  // ── সাপোর্ট-সেন্টার (Next-পোর্ট): নিয়োজিত সাপোর্ট-অ্যাডমিনের থ্রেড সার্ভার-পিন ──
  // ইউজার নিজের পিন সরালেও প্রতি-লোডে আবার বসে যায় (অপসারণ-অযোগ্য অফিসিয়াল থ্রেড)।
  // কথোপকথন না-থাকলে প্লেসহোল্ডার-রো: লিংকে ক্লিক করলেই চ্যাট-পেজ find-or-create করে।
  try {
    const SC76 = require('../helpers/support-center');
    const sa76 = await SC76.getSupportAdmin();
    if (sa76 && sa76.id !== me) {
      const found = rows76.find(r => !r.is_group_flag && (r.user_a === sa76.id || r.user_b === sa76.id));
      if (found) {
        found.is_support_official = 1;
        found.pinned = 2; // ইউজার-পিন (1)-এর উপরে
      } else {
        rows76.push({
          id: -1, is_group_flag: 0, is_support_official: 1, pinned: 2,
          user_a: 0, user_b: 0,
          other_name: sa76.full_name, other_username: sa76.username,
          other_avatar: sa76.avatar_url, other_gender: null,
          conv_link: '/messages/' + sa76.username,
          last_body: null, last_sender_id: null, last_msg_id: null, last_file_url: null,
          unread_count: 0
        });
      }
    }
  } catch (e) {}
  // সেশন ৭৬: পিন-করা কথোপকথন সবার আগে (FB চ্যাট-হেড আচরণ)
  return rows76.sort((a, b) => ((b.pinned || 0) - (a.pinned || 0)) || String(b.last_message_at || '').localeCompare(String(a.last_message_at || '')));
}

router.get('/messages', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conversations = await convListFor(me);
  const allUsers = await db.prepare("SELECT username, full_name, avatar_url FROM users WHERE status = 'active' AND id != ? ORDER BY full_name LIMIT 40").all(me);
  res.render('user/messages-list', { conversations, allUsers, currentPath: '/messages', err: req.query.err || null });
});

router.get('/messages/:username', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const other = await db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  if (other.id === me) return res.redirect('/messages');

  // ── সেশন ৮৩: সরাসরি-কানেকশন নীতি — ইউজার↔মডারেটর, মডারেটর↔এডমিন,
  // এডমিন↔সুপার-এডমিন জোড়া ১:১ চ্যাট খুলতে/চালাতে পারবে না (উভয় দিক থেকে)।
  if (rolePolicy.connectionBlocked(req.session.user.role, other.role)) {
    const errMsg81 = rolePolicy.DIRECT_PAIR_MESSAGE;
    const _api81 = req.xhr || (req.headers.accept || '').includes('application/json') ||
      String(req.headers['content-type'] || '').includes('application/json');
    if (_api81) return res.status(403).json({ ok: false, error: errMsg81 });
    return res.redirect('/messages?err=' + encodeURIComponent(errMsg81));
  }

  // Find or create conversation
  let conv = await db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);

  // ── সেশন ৮০: মেসেজ-পারমিশন গেট — শুধু *নতুন* কথোপকথন শুরুতে প্রযোজ্য।
  // আগের কথোপকথন থাকলে চলতে থাকে (চলমান আলাপ হঠাৎ বন্ধ হয় না)।
  if (!conv) {
    let permError = null;
    const amf = (other.allow_messages_from || 'everyone');
    if (amf === 'none') {
      permError = 'এই সদস্য কারও কাছ থেকেই নতুন বার্তা গ্রহণ করেন না।';
    } else if (amf === 'followers') {
      const following = await db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(me, other.id);
      if (!following) permError = 'এই সদস্য শুধুমাত্র অনুসরণকারীদের কাছ থেকেই বার্তা গ্রহণ করেন। আগে ফলো করুন।';
    }
    if (permError) return res.redirect('/messages?err=' + encodeURIComponent(permError));
    const a = Math.min(me, other.id), b = Math.max(me, other.id);
    const r = await db.prepare('INSERT INTO conversations (user_a, user_b) VALUES (?, ?)').run(a, b);
    conv = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(r.lastInsertRowid);
  }

  // Mark as read
  await db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(conv.id, me);

  /* সেশন ৯৩: উইন্ডোিং — ডিফল্ট সর্বশেষ ৬০, ?all=1 পূর্ণ, ?around= জাম্প-কনটেক্সট; ডিটেইলস-ডেটা পূর্ণ-তালিকা থেকে */
  const _all93 = req.query.all === '1';
  const _around93 = parseInt(req.query.around, 10) || 0;
  const _hl93 = parseInt(req.query.hl, 10) || 0;
  const allRows93 = await chatMessagesFor(conv.id);
  const _win93 = buildChatWindow(allRows93, { all: _all93, aroundId: _around93 });
  const messages = _win93.slice;
  const reactionMap = await reactionMapFor(messages);
  const chatShared = buildChatShared(allRows93);
  let lastOwnReadId = 0;
  for (const m of allRows93) { if (m.sender_id === me && m.is_read) lastOwnReadId = m.id; }

  // Refresh list of conversations for sidebar (1-on-1 + groups)
  const conversations = await convListFor(me);

  // সেশন ৭৬: আমার প্রতি-কথোপকথন সেটিংস (মিউট/পিন)
  let myFlags = { muted: 0, pinned: 0 };
  try { myFlags = await db.prepare('SELECT muted, pinned FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(conv.id, me) || myFlags; } catch (e) {}

  res.render('user/messages-chat', { other, messages, conversations, conv, isGroup: false, members: [], reactionMap, myFlags, currentPath: '/messages', err: req.query.err || null,
    isSupportThread: await (require('../helpers/support-center')).isSupportAdmin(other.id),
    olderState: { hasOlder: _win93.hasOlder, oldestId: _win93.oldestId }, aroundMode: _win93.aroundMode, hlMsgId: _hl93, chatShared, lastOwnReadId });
});

router.post('/messages/:username', ensureAuth, withUpload(messageAudioUpload), async (req, res) => {
  const me = req.session.user.id;
  const other = await db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.redirect('/messages');
  // ── সেশন ৮৩: সরাসরি-কানেকশন নীতি — পাশাপাশি পদের জোড়ায় ১:১ মেসেজ বন্ধ
  if (rolePolicy.connectionBlocked(req.session.user.role, other.role)) {
    const errMsg81 = rolePolicy.DIRECT_PAIR_MESSAGE;
    const _api81 = req.xhr || (req.headers.accept || '').includes('application/json') ||
      String(req.headers['content-type'] || '').includes('application/json');
    if (_api81) return res.status(403).json({ ok: false, error: errMsg81 });
    return res.redirect('/messages?err=' + encodeURIComponent(errMsg81));
  }
  // Block check — a blocked pair cannot exchange messages
  if (await db.prepare('SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)').get(me, other.id, other.id, me)) {
    const errMsg = 'আপনি এই ব্যবহারকারীর সাথে মেসেজ করতে পারবেন না';
    if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.status(403).json({ ok: false, error: errMsg });
    return res.redirect('/messages/' + req.params.username + '?err=' + encodeURIComponent(errMsg));
  }
  if (req.uploadError) {
    if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.status(400).json({ ok: false, error: req.uploadError });
    return res.redirect('/messages/' + req.params.username + '?err=' + encodeURIComponent(req.uploadError));
  }
  const conv = await db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);
  if (!conv) return res.redirect('/messages');
  const { body, reply_to } = req.body;
  // সেশন ৭৬: রিপ্লাই-থ্রেডিং — টার্গেট মেসেজ এই কথোপকথনেই থাকতে হবে
  let replyToId = parseInt(reply_to, 10) || null;
  if (replyToId) {
    const rt = await db.prepare('SELECT id FROM messages WHERE id = ? AND conversation_id = ?').get(replyToId, conv.id);
    if (!rt) replyToId = null;
  }
  // req.file.url is correct in BOTH modes (local disk path or Vercel blob URL)
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const fileName = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !fileUrl) {
    if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.status(400).json({ ok: false, error: 'empty' });
    return res.redirect('/messages/' + req.params.username);
  }
  // সেশন ১৫৮: ভয়েস-মেসেজ স্থায়ী-ফিক্স — রেকর্ডারের মাপা সেকেন্ধ duration DB-তে।
  // multipart-ফিল্ড multer req.body-তে দেয়; অনুপস্থিত/অবৈধ হলে ০ (নিরাপদ)।
  const voiceDur158 = Math.max(0, Math.min(7200, parseInt(req.body && req.body.duration, 10) || 0));
  const ins = await db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name, duration, reply_to_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim() || null, fileUrl, fileName, voiceDur158, replyToId);
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  // সেশন ৯৯: SSE পুশ — প্রাপক তাৎক্ষণিক জানবে (পোলিং-ফলব্যাক অক্ষত; এটা শুধু
  // লেটেন্সি ২.৫সে → ~০ করে)। প্রেরকের ট্যাবগুলো ইচ্ছাকৃতভাবে বাদ — optimistic-
  // append-রেসে ডুপ্লিকেট-বাবল ঝুঁকি; সেখানে ২.৫সে-পোলই যথেষ্ট।
  try { sseHub.publishToUsers([other.id], 'message', { conv_id: conv.id, id: Number(ins.lastInsertRowid), from: me, at: Date.now() }, me); } catch (_) {}
  // ── সাপোর্ট-সেন্টার মিরর (Next-পোর্ট): প্রাপক = নিয়োজিত সাপোর্ট-অ্যাডমিন হলে ──
  // প্রতিটি বার্তা user_reports-এ রেকর্ড হয় (ভয়েস → AUDIO); ব্যর্থ হলে নীরব-স্কিপ —
  // মেসেঞ্জারের প্রাইমারি-ফ্লো কখনো ভাঙে না।
  try {
    const SCM = require('../helpers/support-center');
    if (other.id !== me && await SCM.isSupportAdmin(other.id)) {
      const mime = (req.file && req.file.mimetype) || '';
      const mt = fileUrl ? (/^image\//.test(mime) ? 'IMAGE' : /^audio\//.test(mime) ? 'AUDIO' : /^video\//.test(mime) ? 'VIDEO' : 'TEXT') : 'TEXT';
      const rtext = (body && body.trim())
        ? body.trim()
        : (fileUrl && mt === 'AUDIO' ? '🎙️ ভয়েস মেসেজ (' + voiceDur158 + ' সেকেন্ড)' : (fileUrl ? '📎 সংযুক্তি: ' + (fileName || mt) : ''));
      if (rtext) {
        await db.prepare('INSERT INTO user_reports (sender_id, message_text, media_type, media_url, media_name) VALUES (?, ?, ?, ?, ?)')
          .run(me, rtext, mt, fileUrl, fileName);
        await notifyOnce(other.id, 'support', 'নতুন সাপোর্ট-অভিযোগ', displayName(req.session.user) + ' সাপোর্ট-ডেস্কে অভিযোগ রেকর্ড করেছেন', '/admin/support-center', 5, 'notify_messages');
        try { sseHub.publishToAll('support-changed', {}); } catch (_) {}
      }
    }
  } catch (eSCM) { console.error('[support-mirror]', eSCM.message); }
  // Notify recipient (dedup: ১০ মিনিটে একই বডির দ্বিতীয় নোটিফিকেশন নয়; মিউট-হলে নয়)
  if (other.id !== me && !(await isConvMuted(conv.id, other.id))) {
    await notifyOnce(other.id, 'message', 'নতুন বার্তা', `${displayName(req.session.user)} আপনাকে মেসেজ করেছেন`, '/messages/' + req.session.user.username, 10, 'notify_messages');
  }
  if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.json({ ok: true, id: ins.lastInsertRowid });
  res.redirect('/messages/' + req.params.username);
});


// ── সেশন ৩৮: গ্রুপ কথোপথন ────────────────────────────────────────────────
// সদস্যতা-যাচাই কেন্দ্রীয়: 1-on-1 = user_a/user_b, গ্রুপ = conversation_members
async function convAccess(convId, me) {
  const conv = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
  if (!conv) return null;
  if (conv.is_group) {
    const m = await db.prepare('SELECT 1 AS x FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(convId, me);
    return m ? conv : null;
  }
  return (conv.user_a === me || conv.user_b === me) ? conv : null;
}

// গ্রুপ তৈরি: title + members[] (username)
router.post('/messages/group/create', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const title = (req.body.title || '').trim();
  if (!title) return res.redirect('/messages');
  const names = [].concat(req.body.members || []).filter(Boolean);
  if (!names.length) return res.redirect('/messages?err=members');
  // user_a/user_b NOT NULL — গ্রুপে দুটোই ক্রিয়েটর (সদস্যতা conversation_members-এ)
  const r = await db.prepare('INSERT INTO conversations (user_a, user_b, is_group, title, last_message_at) VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)').run(me, me, title);
  const convId = r.lastInsertRowid;
  const mine = await db.prepare('SELECT id FROM users WHERE id = ?').get(me);
  const all = new Set([me]);
  let blockedCount = 0;
  for (const nm of names) {
    const u = await db.prepare('SELECT id, role FROM users WHERE username = ? AND status = ?').get(nm, 'active');
    if (!u) continue;
    // সেশন ৮৬: সরাসরি-কানেকশন নীতি — গ্রুপের মাধ্যমেও adjacent জোড়া সংযোগ নয়
    if (rolePolicy.connectionBlocked(req.session.user.role, u.role)) { blockedCount++; continue; }
    all.add(u.id);
  }
  if (all.size < 2) {
    // শুধু নির্মাতা — কোনো অনুমোদিত সদস্য নেই
    try { await db.prepare('DELETE FROM conversations WHERE id = ?').run(convId); } catch (e) {}
    return res.redirect('/messages?err=' + encodeURIComponent(rolePolicy.GROUP_PAIR_MESSAGE));
  }
  for (const uid of all) {
    try { await db.prepare('INSERT INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(convId, uid, me); } catch (e) {}
  }
  for (const uid of all) {
    if (uid !== me) await notifyOnce(uid, 'message', 'নতুন গ্রুপ', `${displayName(req.session.user)} আপনাকে "${title}" গ্রুপে যুক্ত করেছেন`, '/messages/g/' + convId, 10, 'notify_messages');
  }
  res.redirect('/messages/g/' + convId + (blockedCount ? ('?blocked=' + blockedCount) : ''));
});

// গ্রুপ চ্যাট ভিউ
router.get('/messages/g/:id', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) return res.redirect('/messages');
  await db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(conv.id, me);
  /* সেশন ৯৩: উইন্ডোিং (গ্রুপ-রুট) — ১:১-রুটের সমতুল্য */
  const _all93 = req.query.all === '1';
  const _around93 = parseInt(req.query.around, 10) || 0;
  const _hl93 = parseInt(req.query.hl, 10) || 0;
  const allRows93 = await chatMessagesFor(conv.id);
  const _win93 = buildChatWindow(allRows93, { all: _all93, aroundId: _around93 });
  const messages = _win93.slice;
  const reactionMap = await reactionMapFor(messages);
  const chatShared = buildChatShared(allRows93);
  let lastOwnReadId = 0;
  for (const m of allRows93) { if (m.sender_id === me && m.is_read) lastOwnReadId = m.id; }
  const members = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url FROM conversation_members cm JOIN users u ON u.id = cm.user_id WHERE cm.conversation_id = ?
  `).all(conv.id);
  const other = { id: 0, username: null, full_name: conv.title, avatar_url: null, is_group: true };
  const conversations = await convListFor(me);
  let myFlags = { muted: 0, pinned: 0 };
  try { myFlags = await db.prepare('SELECT muted, pinned FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(conv.id, me) || myFlags; } catch (e) {}
  res.render('user/messages-chat', {
    other, messages, conversations, conv, isGroup: true, members, reactionMap, myFlags,
    currentPath: '/messages', err: req.query.err || null,
    note: req.query.added ? 'added' : (req.query.removed ? 'removed' : null),
    blocked: req.query.blocked || null,
    olderState: { hasOlder: _win93.hasOlder, oldestId: _win93.oldestId }, aroundMode: _win93.aroundMode, hlMsgId: _hl93, chatShared, lastOwnReadId
  });
});

// গ্রুপে মেসেজ পাঠানো
router.post('/messages/g/:id', ensureAuth, withUpload(messageAudioUpload), async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) {
    if ((req.headers.accept || '').includes('application/json')) return res.status(403).json({ ok: false, error: 'forbidden' });
    return res.redirect('/messages');
  }
  const { body, reply_to } = req.body;
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const fileName = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !fileUrl) {
    if ((req.headers.accept || '').includes('application/json')) return res.status(400).json({ ok: false, error: 'empty' });
    return res.redirect('/messages/g/' + conv.id);
  }
  // সেশন ৭৬: গ্রুপেও রিপ্লাই-থ্রেডিং
  let replyToId = parseInt(reply_to, 10) || null;
  if (replyToId) {
    const rt = await db.prepare('SELECT id FROM messages WHERE id = ? AND conversation_id = ?').get(replyToId, conv.id);
    if (!rt) replyToId = null;
  }
  // সেশন ১৫৮: গ্রুপেও ভয়েস-duration স্থায়ী (১:১-পথের রূপান্তর সমতুল্য)
  const voiceDurG158 = Math.max(0, Math.min(7200, parseInt(req.body && req.body.duration, 10) || 0));
  const ins = await db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name, duration, reply_to_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim() || null, fileUrl, fileName, voiceDurG158, replyToId);
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  const members = await db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(conv.id);
  // সেশন ৯৯: SSE পুশ — গ্রুপ-সদস্যরা তাৎক্ষণিক জানবে (প্রেরক বাদ — ওপরের নীতি)
  try { sseHub.publishToUsers(members.map(m => m.user_id), 'message', { conv_id: conv.id, id: Number(ins.lastInsertRowid), from: me, at: Date.now() }, me); } catch (_) {}
  for (const m of members) {
    if (m.user_id !== me && !(await isConvMuted(conv.id, m.user_id))) await notifyOnce(m.user_id, 'message', 'নতুন বার্তা', `${displayName(req.session.user)} (${conv.title}): ${(body || '📎').slice(0, 60)}`, '/messages/g/' + conv.id, 10, 'notify_messages');
  }
  if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.json({ ok: true, id: ins.lastInsertRowid });
  res.redirect('/messages/g/' + conv.id);
});

// ── সেশন ৩৯: গ্রুপ সদস্য ব্যবস্থাপনা (সেশন-৩৮ বাকি কাজ) ──────────────────
// অ্যাডমিন = ক্রিয়েটর (conversations.user_a)। সদস্য যোগ/বাদ শুধু অ্যাডমিন; লিভ শুধু নন-অ্যাডমিন।
function _groupNames(raw) {
  const arr = Array.isArray(raw) ? raw : String(raw || '').split(/[\s,]+/);
  return [...new Set(arr.map(x => String(x).trim()).filter(Boolean))];
}

router.post('/messages/g/:id/members/add', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) return res.redirect('/messages');
  if (conv.user_a !== me) return res.redirect('/messages/g/' + conv.id + '?err=perm');
  const names = _groupNames(req.body.members);
  let added = 0, blocked81 = 0;
  for (const nm of names) {
    const u = await db.prepare("SELECT id, role FROM users WHERE username = ? AND status = 'active'").get(nm);
    if (!u) continue;
    // সেশন ৮৬: গ্রুপ-সদস্য সংযোজনেও সরাসরি-কানেকশন নীতি (অ্যাক্টর↔টার্গেট adjacent হলে বাদ)
    if (rolePolicy.connectionBlocked(req.session.user.role, u.role)) { blocked81++; continue; }
    const ex = await db.prepare('SELECT 1 AS x FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(conv.id, u.id);
    if (ex) continue;
    try {
      await db.prepare('INSERT INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(conv.id, u.id, me);
      added++;
      await notifyOnce(u.id, 'message', 'গ্রুপে যোগ', `${displayName(req.session.user)} আপনাকে "${conv.title}" গ্রুপে যুক্ত করেছেন`, '/messages/g/' + conv.id);
    } catch (e) {}
  }
  res.redirect('/messages/g/' + conv.id + '?added=' + added + (blocked81 ? ('&blocked=' + blocked81) : ''));
});

router.post('/messages/g/:id/members/:uid/remove', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) return res.redirect('/messages');
  if (conv.user_a !== me) return res.redirect('/messages/g/' + conv.id + '?err=perm');
  const uid = parseInt(req.params.uid);
  if (!uid || uid === me || uid === conv.user_a) return res.redirect('/messages/g/' + conv.id + '?err=self');
  await db.prepare('DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?').run(conv.id, uid);
  res.redirect('/messages/g/' + conv.id + '?removed=1');
});

router.post('/messages/g/:id/leave', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) return res.redirect('/messages');
  if (conv.user_a === me) return res.redirect('/messages/g/' + conv.id + '?err=owner');
  await db.prepare('DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?').run(conv.id, me);
  res.redirect('/messages?left=1');
});

// মেসেজে রিয়েকশন (hover-ইমোজি)
router.post('/api/messages/react', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msgId = parseInt(req.body.message_id);
  const emoji = (req.body.emoji || '').slice(0, 8);
  if (!msgId || !emoji) return res.json({ ok: false });
  const msg = await db.prepare('SELECT conversation_id, sender_id FROM messages WHERE id = ?').get(msgId);
  if (!msg || !(await convAccess(msg.conversation_id, me))) return res.json({ ok: false });
  const existing = await db.prepare('SELECT 1 AS x FROM message_reactions WHERE message_id = ? AND user_id = ?').get(msgId, me);
  if (existing) {
    await db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?').run(msgId, me);
  } else {
    try { await db.prepare('INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)').run(msgId, me, emoji); } catch (e) {}
  }
  const counts = await db.prepare('SELECT emoji, COUNT(*) AS c FROM message_reactions WHERE message_id = ? GROUP BY emoji').all(msgId);
  res.json({ ok: true, mine: !existing, counts });
});
router.get('/api/messages/reactions', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msgId = parseInt(req.query.message_id);
  const msg = await db.prepare('SELECT conversation_id FROM messages WHERE id = ?').get(msgId);
  if (!msg || !(await convAccess(msg.conversation_id, me))) return res.json({ counts: [] });
  const counts = await db.prepare('SELECT emoji, COUNT(*) AS c FROM message_reactions WHERE message_id = ? GROUP BY emoji').all(msgId);
  const mine = await db.prepare('SELECT emoji FROM message_reactions WHERE message_id = ? AND user_id = ?').get(msgId, me);
  res.json({ counts, mine: mine ? mine.emoji : null });
});

// ── v2.4: Delete entire conversation ───────────────────────────────────
router.post('/messages/:username/delete', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const other = await db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) {
    if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.json({ ok: true, redirect: '/messages' });
    return res.redirect('/messages');
  }
  const conv = await db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?) AND IFNULL(is_group,0)=0')
    .get(me, other.id, other.id, me);
  if (conv) {
    try { await db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conv.id); } catch (e) {}
    try { await db.prepare('DELETE FROM conversation_members WHERE conversation_id = ?').run(conv.id); } catch (e) {}
    try { await db.prepare('DELETE FROM conversations WHERE id = ?').run(conv.id); } catch (e) {}
  }
  if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.json({ ok: true, redirect: '/messages' });
  res.redirect('/messages');
});

// ── v2.4: Delete single message (sender only) ──────────────────────────
router.post('/messages/:username/:msgId/delete', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(parseInt(req.params.msgId, 10));
  if (!msg || msg.sender_id !== me) return res.status(403).json({ ok: false });
  await db.prepare('DELETE FROM messages WHERE id = ?').run(msg.id);
  res.json({ ok: true });
});

// ── v2.3: Messenger — typing indicator (in-memory, 6s window) ──────────
// Map<userId, Map<convId, timestamp>>
const typingState = new Map();

router.post('/api/messages/typing', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.body.conv_id || req.query.conv_id);
  if (!convId) return res.json({ ok: false });
  if (!typingState.has(me)) typingState.set(me, new Map());
  typingState.get(me).set(convId, Date.now());
  res.json({ ok: true });
});

router.get('/api/messages/typing', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id);
  if (!convId) return res.json({ typing: false });
  const conv = await convAccess(convId, me);
  if (!conv || conv.is_group) return res.json({ typing: false });
  const otherId = conv.user_a === me ? conv.user_b : conv.user_a;
  const others = typingState.get(otherId);
  if (!others) return res.json({ typing: false });
  const ts = others.get(convId);
  if (!ts) return res.json({ typing: false });
  const fresh = (Date.now() - ts) < 6000; // 6s freshness
  res.json({ typing: fresh, user_id: otherId });
});

// ── v2.3: Messenger — mark message as seen (read receipt) ───────────────
router.post('/api/messages/seen', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const messageId = parseInt(req.body.message_id);
  if (!messageId) return res.json({ ok: false });
  // Verify the message belongs to a conversation the user is in
  const msg = await db.prepare('SELECT m.* FROM messages m WHERE m.id = ?').get(messageId);
  if (!msg || !(await convAccess(msg.conversation_id, me))) return res.json({ ok: false });
  if (msg.sender_id === me) return res.json({ ok: true }); // own message
  await db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId);
  res.json({ ok: true });
});

router.post('/api/messages/seen-all', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.body.conv_id);
  if (!convId) return res.json({ ok: false });
  const conv = await convAccess(convId, me);
  if (!conv) return res.json({ ok: false });
  await db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(convId, me);
  res.json({ ok: true });
});

// ── v2.3: Messenger — online status (5-min activity window) ─────────────
// ── v2.3: Messenger ── online status (query only; touch happens in top middleware) ──
router.get('/api/messages/online', ensureAuth, async (req, res) => {
  const userId = parseInt(req.query.user_id);
  if (!userId) return res.json({ online: false });
  res.json({ online: isOnline(userId) });
});

// ── v2.3: Messenger ── combined poll
// ── সেশন ৯৩ (রোডম্যাপ-১১): আগের-বার্তা HTML-ফ্র্যাগমেন্ট — চ্যাট-উইন্ডোইং লোডার ──
router.get('/api/messages/older', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id, 10);
  const before = parseInt(req.query.before, 10) || 0;
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
  if (!before) return res.json({ ok: true, html: '', hasOlder: false, oldestId: 0 });
  const { rows, hasOlder, oldestId } = await chatOlderBatch(convId, before);
  if (!rows.length) return res.json({ ok: true, html: '', hasOlder: false, oldestId: before });
  const reactionMap = await reactionMapFor(rows);
  /* বাউন্ডারি-কনটেক্সট: prev = ব্যাচের-আগের বার্তা (ক্লাস্টার/ডেট-ধারাবাহিকতা), next = আগে-রেন্ডারড প্রথম বাবল */
  const prevMsg = await db.prepare('SELECT id, sender_id, created_at FROM messages WHERE conversation_id = ? AND id < ? ORDER BY id DESC LIMIT 1').get(convId, rows[0].id) || null;
  const nextMsg = await db.prepare('SELECT id, sender_id, created_at FROM messages WHERE id = ?').get(before) || null;
  let partner = { id: 0, full_name: conv.title || 'কথোপকথন', avatar_url: null };
  if (!conv.is_group) {
    const pid = conv.user_a === me ? conv.user_b : conv.user_a;
    partner = await db.prepare('SELECT id, full_name, avatar_url FROM users WHERE id = ?').get(pid) || partner;
  }
  const members = await db.prepare('SELECT u.id, u.username, u.full_name, u.avatar_url FROM conversation_members cm JOIN users u ON u.id = cm.user_id WHERE cm.conversation_id = ?').all(convId);
  const html = await new Promise((resolve, reject) => {
    req.app.render('user/chat-fragment', {
      user: req.session.user, conv, isGroup: !!conv.is_group, other: partner, members,
      batch: rows, prevMsg, nextMsg, reactionMap
    }, (err, out) => err ? reject(err) : resolve(out));
  });
  res.json({ ok: true, html, hasOlder, oldestId, count: rows.length });
});

// ── সেশন ১০৫: নতুন-আসা মেসেজের ক্যানোনিকাল HTML-রেন্ডার ──────────────────────
// GET /api/messages/render?conv_id=N&after_id=M — after_id-পরবর্তী বার্তাগুলো
// chat-fragment (→ shared/messenger/MessengerBubble) দিয়েই রেন্ডার হয়।
// messages-chat.ejs-এর পুরনো JS-বাবল-বিল্ডার প্রতিস্থাপন — মেসেঞ্জার-মার্কআপের
// একমাত্র সোর্স এখন views/shared/messenger/MessengerBubble.ejs (গার্ড-রুল)।
router.get('/api/messages/render', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id, 10);
  const afterId = parseInt(req.query.after_id, 10) || 0;
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
  // সতর্কতা: after_id=0 বৈধ (নতুন কনভার্সেশনের প্রথম-বার্তা) — LIMIT 50-ই বাউন্ড
  const rows = await db.prepare(`
    SELECT m.*,
      rb.body AS reply_body, rb.file_url AS reply_file_url, rb.file_name AS reply_file_name,
      ru.full_name AS reply_sender_name, ru.username AS reply_sender_username
    FROM messages m
    LEFT JOIN messages rb ON rb.id = m.reply_to_id
    LEFT JOIN users ru ON ru.id = rb.sender_id
    WHERE m.conversation_id = ? AND m.id > ?
    ORDER BY m.id ASC LIMIT 50
  `).all(convId, afterId);
  if (!rows.length) return res.json({ ok: true, html: '', lastId: afterId });
  const lastId = rows[rows.length - 1].id;
  const reactionMap = await reactionMapFor(rows);
  const prevMsg = await db.prepare('SELECT id, sender_id, created_at FROM messages WHERE conversation_id = ? AND id < ? ORDER BY id DESC LIMIT 1').get(convId, rows[0].id) || null;
  let partner = null;
  if (!conv.is_group) {
    const pid = conv.user_a === me ? conv.user_b : conv.user_a;
    partner = await db.prepare('SELECT id, full_name, avatar_url FROM users WHERE id = ?').get(pid) || partner;
  }
  const members = await db.prepare('SELECT u.id, u.username, u.full_name, u.avatar_url FROM conversation_members cm JOIN users u ON u.id = cm.user_id WHERE cm.conversation_id = ?').all(convId);
  const html = await new Promise((resolve, reject) => {
    req.app.render('user/chat-fragment', {
      user: req.session.user, conv, isGroup: !!conv.is_group, other: partner, members,
      batch: rows, prevMsg, nextMsg: null, reactionMap
    }, (err, out) => err ? reject(err) : resolve(out));
  });
  res.json({ ok: true, html, lastId, count: rows.length });
});

// ── সেশন ৯৩ (রোডম্যাপ-১১): সার্ভার-সাইড ইন-চ্যাট সার্চ (LIKE) — উইন্ডোর-বাইরের পুরনো বার্তাসহ ──
router.get('/api/messages/search', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id, 10);
  const q = String(req.query.q || '').trim().slice(0, 80);
  const conv = await convAccess(convId, me);
  if (!conv || q.length < 2) return res.json({ ok: true, results: [] });
  const needle = '%' + q.replace(/[\\%_]/g, (ch) => '\\' + ch) + '%';
  let rows = [];
  try {
    rows = await db.prepare(`
      SELECT m.id, m.body, m.created_at, m.sender_id, u.full_name, u.username
      FROM messages m JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ? AND m.body LIKE ? ESCAPE '\\'
      ORDER BY m.id DESC LIMIT 30
    `).all(convId, needle);
  } catch (e) { rows = []; }
  const lq = q.toLowerCase();
  const results = rows.map((r) => {
    const bodyTxt = String(r.body || '');
    const i = bodyTxt.toLowerCase().indexOf(lq);
    const s = Math.max(0, i - 30);
    const e2 = Math.min(bodyTxt.length, (i >= 0 ? i + q.length : 60) + 50);
    return {
      id: r.id,
      sender: r.full_name,
      username: r.username,
      snippet: (s > 0 ? '…' : '') + bodyTxt.slice(s, e2) + (e2 < bodyTxt.length ? '…' : ''),
      at: r.created_at
    };
  });
  res.json({ ok: true, results });
});

router.get('/api/messages/poll', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id);
  const since = parseInt(req.query.since) || 0;
  if (!convId) return res.json({ messages: [], typing: false, online: false });

  const conv = await convAccess(convId, me);
  if (!conv) return res.json({ messages: [], typing: false, online: false });
  const otherId = conv.is_group ? null : (conv.user_a === me ? conv.user_b : conv.user_a);

  // New messages
  const rows = await db.prepare(
    `SELECT m.*, u.username AS sender_username, u.full_name AS sender_name, u.avatar_url AS sender_avatar,
      rb.body AS reply_body, ru.full_name AS reply_sender_name
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    LEFT JOIN messages rb ON rb.id = m.reply_to_id
    LEFT JOIN users ru ON ru.id = rb.sender_id
    WHERE m.conversation_id = ? AND m.id > ? ORDER BY m.id ASC`
  ).all(convId, since);
  const messages = rows.map(r => ({
    id: r.id,
    body: r.body,
    file_url: voiceStreamUrl(r.id, r.file_url), // session190-ফিক্স: /api/messages/check যেখানে ছিল, এই-পোলেও — data-URI-পেলোড-ফাঁস বন্ধ
    file_name: r.file_name,
    sender_id: r.sender_id,
    sender_name: r.sender_name,
    sender_username: r.sender_username,
    sender_avatar: r.sender_avatar || '/avatar/' + r.sender_id,
    is_me: r.sender_id === me,
    created_at: r.created_at,
    is_read: !!r.is_read,
    reply_to_id: r.reply_to_id || null,
    reply_body: r.reply_body || null,
    reply_sender_name: r.reply_sender_name || null,
    edited: !!r.edited_at
  }));

  // সেশন ৭৬: লাইভ-এডিট প্রোপাগেশন — পুরনো (id <= since) মেসেজের নতুন এডিটও ক্লায়েন্টে পৌঁছাক
  let edits = [];
  try {
    edits = await db.prepare('SELECT id, body, edited_at FROM messages WHERE conversation_id = ? AND id <= ? AND edited_at IS NOT NULL').all(convId, since);
  } catch (_) {}

  // Typing (1-on-1 only)
  let typing = false;
  if (otherId) {
    const others = typingState.get(otherId);
    if (others) {
      const ts = others.get(convId);
      if (ts && (Date.now() - ts) < 6000) typing = true;
    }
  }

  // Online
  const online = otherId ? isOnline(otherId) : false;

  // সেশন ৭৫ (FB-মেসেঞ্জার-রিভাম্প): সিন-রসিট — আমার পাঠানো শেষ-পঠিত মেসেজের id
  // (পল-এ এলে ক্লায়েন্ট সেই বাবলের নিচে অপর পক্ষের মাইক্রো-অ্যাভাটার বসায়)
  let seen_upto = 0;
  try {
    const r = await db.prepare('SELECT MAX(id) AS mx FROM messages WHERE conversation_id = ? AND sender_id = ? AND is_read = 1').get(convId, me);
    seen_upto = (r && r.mx) || 0;
  } catch (_) {}

  res.json({ messages, typing, online, seen_upto, edits, me: { id: me } });
});

// ── সেশন ৭৫ (FB-মেসেঞ্জার-রিভাম্প): Active-now ট্রে-র জন্য সব অনলাইন ইউজার ──
router.get('/api/messages/online-users', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const now = Date.now();
  const ids = [];
  onlineState.forEach((ts, uid) => {
    if ((now - ts) < 5 * 60 * 1000 && uid !== me) ids.push(uid);
  });
  if (!ids.length) return res.json({ users: [] });
  try {
    const ph = ids.map(() => '?').join(',');
    const rows = await db.prepare(
      `SELECT id, username, full_name, avatar_url, gender FROM users WHERE id IN (${ph}) AND status = 'active' LIMIT 12`
    ).all(...ids);
    res.json({ users: rows.map(u => ({
      id: u.id,
      username: u.username,
      name: u.full_name || u.username,
      avatar: u.avatar_url || ('/avatar/' + u.id)
    })) });
  } catch (_) { res.json({ users: [] }); }
});

// ── v2.2: Messenger polling — fetch new messages since timestamp ───────
router.get('/api/messages/check', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conversation_id);
  const since = parseInt(req.query.since) || 0; // last known message id
  if (!convId) return res.json([]);
  // Confirm the conversation belongs to this user
  const conv = await convAccess(convId, me);
  if (!conv) return res.json([]);
  const rows = await db.prepare(
    'SELECT m.*, u.username AS sender_username, u.full_name AS sender_name, u.avatar_url AS sender_avatar FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? AND m.id > ? ORDER BY m.id ASC'
  ).all(convId, since);
  res.json(rows.map(r => ({
    id: r.id,
    body: r.body,
    file_url: voiceStreamUrl(r.id, r.file_url), // session183: ভয়েস data-URI → স্ট্রিম-লিংক
    file_name: r.file_name,
    sender_id: r.sender_id,
    sender_name: r.sender_name,
    sender_username: r.sender_username,
    sender_avatar: r.sender_avatar || '/avatar/' + r.sender_id,
    is_me: r.sender_id === me,
    created_at: r.created_at
  })));
});

// ── session183: ভয়েস-বাইট স্ট্রিম — DB-র file_url data-URI থেকে অডিও সার্ভ ────
// সদস্যতা-যাচাই + immutable-ক্যাশ-হেডার (একবার-প্লেতেই ব্রাউজার-ক্যাশে, দ্বিতীয়-
// প্লে নেটওয়ার্ক-শূন্য)। রেঞ্জ-রিকোয়েস্ট দরকার নেই — ভয়েস-নোট ≤৪MB।
router.get('/api/messages/audio/:id', ensureAuth, async (req, res) => {
  try {
    const nid = parseInt(req.params.id, 10);
    if (!nid) return res.status(400).json({ ok: false, error: 'bad-id' });
    const row = await db.prepare('SELECT id, conversation_id, sender_id, file_url FROM messages WHERE id = ?').get(nid);
    if (!row || String(row.file_url || '').slice(0, 11) !== 'data:audio/') return res.status(404).json({ ok: false, error: 'not-found' });
    const conv = await convAccess(row.conversation_id, req.session.user.id);
    if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
    const m = String(row.file_url).match(/^data:(audio\/[a-z0-9.+-]+);base64,([\s\S]+)$/);
    if (!m) return res.status(404).json({ ok: false, error: 'bad-data' });
    const buf = Buffer.from(m[2], 'base64');
    res.setHeader('Content-Type', m[1]);
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'audio-stream-failed' });
  }
});

// ── session190: মেসেঞ্জার-ছবির বাইট স্ট্রিম — DB-র data:image URI থেকে সার্ভ ────
// ভয়েস-রুটের হুবহু নিরাপত্তা-ছাঁচ: ensureAuth + convAccess-সদস্যতা + immutable-ক্যাশ।
// মাইম-অনুমতিপত্র কঠোর: কেবল image/(webp|png|jpeg|gif) — SVG সবসময় বাদ
// (same-origin <img>-এ SVG-স্ক্রিপ্ট = stored-XSS ভেক্টর; আপলোড-স্তরেও SVG নেই)।
// nosniff + Content-Disposition:inline — ব্রাউজার কখনো অন্য-কিছু ভাববে না।
router.get('/api/messages/media/:id', ensureAuth, async (req, res) => {
  try {
    const nid = parseInt(req.params.id, 10);
    if (!nid) return res.status(400).json({ ok: false, error: 'bad-id' });
    const row = await db.prepare('SELECT id, conversation_id, sender_id, file_url FROM messages WHERE id = ?').get(nid);
    if (!row || String(row.file_url || '').slice(0, 11) !== 'data:image/') return res.status(404).json({ ok: false, error: 'not-found' });
    const conv = await convAccess(row.conversation_id, req.session.user.id);
    if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
    const m = String(row.file_url).match(/^data:(image\/(?:webp|png|jpeg|gif));base64,([\s\S]+)$/);
    if (!m) return res.status(404).json({ ok: false, error: 'bad-data' });
    const buf = Buffer.from(m[2], 'base64');
    res.setHeader('Content-Type', m[1]);
    res.setHeader('Content-Length', buf.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'media-stream-failed' });
  }
});

// Poll: returns all conversations with new activity since timestamp (for sidebar refresh)
router.get('/api/messages/unread', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const rows = await db.prepare(`
    SELECT c.id, c.last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread
    FROM conversations c WHERE c.user_a = ? OR c.user_b = ?
  `).all(me, me, me);
  const totalUnread = rows.reduce((a, r) => a + r.unread, 0);
  res.json({ totalUnread, conversations: rows });
});

// ── সেশন ৯৯ (রোডম্যাপ-আইটেম ০১): SSE রিয়েল-টাইম হাব এন্ডপয়েন্ট ─────────────────
// লগইন-গার্ডেড ইভেন্ট-স্ট্রিম। নোটিফিকেশন-বেল + মেসেঞ্জার পুশ-গন্তব্য।
// হেডার নোট: 'no-transform' → compression মিডলওয়্যার এই রেসপন্স স্কিপ করে
// (বাফারিং করলে ইভেন্ট আটকে যেত); X-Accel-Buffering → nginx-স্টাইল প্রক্সি।
// session236 — অ্যাডমিন-সেশনও গ্রহণ (support-center admin-only; ensureAuth member-শুধু ছিল → EventSource 401 → লাইভ-ব্যাজ-মৃত)।
// uid-namespaced 'admin:N' — নোটিফিকেশন-hub-এর member-uid-এর সাথে cross-table-আইডি-সংঘর্ষ-নিরাপদ; publishToAll সব-কী-তে-পৌঁছায়।
router.get('/api/events', (req, res) => {
  const uid = (req.session.user && req.session.user.id)
    || (req.session.adminUser && ('admin:' + req.session.adminUser.id))
    || null;
  if (!uid) {
    if (req.originalUrl.startsWith('/api/') || req.xhr) return res.status(401).json({ error: 'login' });
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 3000\n: connected\n\n');
  sseHub.addClient(uid, res);
  req.on('close', () => sseHub.removeClient(uid, res));
});

// ── সাপোর্ট-সেন্টার (Next-পোর্ট): আমার জমা দেওয়া অভিযোগ (user-side) ────────────
// নিজের রিপোর্টই শুধু; স্পষ্ট ফিল্ড-ম্যাপ (privacy চুক্তি): হিস্ট্রি থেকে by/byRole/
// editedBy বাদ — রিপোর্টার শুধু জবাব-টেক্সট + সম্পাদিত-কি-না দেখে।
router.get('/api/support/my-reports', ensureAuth, async (req, res) => {
  try {
    const me = req.session.user.id;
    const rows = await db.prepare('SELECT * FROM user_reports WHERE sender_id = ? ORDER BY created_at DESC, id DESC LIMIT 50').all(me);
    const reports = rows.map(r => {
      let hist = [];
      try { hist = JSON.parse(r.note_history || '[]'); } catch (_) {}
      const notes = (Array.isArray(hist) ? hist : [])
        .filter(h => h && h.t === 'note')
        .slice(-20).reverse()
        .map(h => ({ note: String(h.note || '').slice(0, 2000), at: h.at || null, edited: !!h.editedAt }));
      return {
        id: r.id,
        message_text: r.message_text,
        media_type: r.media_type,
        status: r.status,
        admin_note: r.admin_note,
        note_history: notes,
        created_at: r.created_at,
        updated_at: r.updated_at
      };
    });
    const counts = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    rows.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    res.json({ ok: true, reports, counts, total: rows.length });
  } catch (e) {
    console.error('[my-reports]', e.message);
    res.status(500).json({ ok: false, error: 'লোড ব্যর্থ' });
  }
});

// হেলথ-প্রোব (সেশন-৮৯-এ ছিল, মার্জে হারিয়েছিল — SSE-স্ট্যাটসহ পুনর্নির্মাণ):
// সুপারভাইজার/আপটাইম-মনিটর + সংযুক্ত-ক্লায়েন্ট ডায়গনস্টিক। no-store।
router.get('/api/health', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let dbOk = false, dbLatencyMs = -1;
  try {
    const t0 = Date.now();
    await db.prepare('SELECT 1 AS x').get();
    dbOk = true; dbLatencyMs = Date.now() - t0;
  } catch (_) {}
  const m = process.memoryUsage();
  res.json({ ok: dbOk, status: dbOk ? 'healthy' : 'degraded', db: dbOk, dbLatencyMs,
    uptime: Math.round(process.uptime()), memory: { rss: Math.round(m.rss / 1048576), heapUsed: Math.round(m.heapUsed / 1048576) },
    sse: sseHub.stats(), version: '99' });
});

// ── সেশন ৯৯: বেল-ড্রপডাউন লাইভ-রিফ্রেশ ডেটা (live.js দ্বারা ব্যবহৃত) ──────────
// সার্ভার-রেন্ডারড বেলের হুবহু শেপ; SSE 'notification'-ইভেন্টে বা ড্রপডাউন-খোলায় ফেচ হয়।
router.get('/api/notifications/recent', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  try {
    // সেশন ১০২-ইউনিয়ন: actor-avatar — LEFT JOIN users (actor_id) + legacy link-fallback;
    // actor_id NULL পুরনো রোতে link (/messages|/profile/<u>) থেকে অ্যাক্টর-শনাক্ত করে
    // হুবহু একই ফিল্ডে (actor_id/actor_avatar) ফলব্যাক-ভরা হয় — ক্লায়েন্ট-মার্কআপ এক।
    const items = await db.prepare(`SELECT n.id, n.type, n.body, n.link, n.is_read, n.created_at, n.actor_id,
                                    a.avatar_url AS actor_avatar, a.full_name AS actor_name
                                    FROM notifications n LEFT JOIN users a ON a.id = n.actor_id
                                    WHERE n.user_id = ? ORDER BY n.created_at DESC, n.id DESC LIMIT 8`).all(me);
    try {
      const legacy = items.filter(n => !n.actor_id && n.link);
      const unames = [...new Set(legacy.map(n => {
        const m = /^(?:\/messages|\/profile)\/([^\/?#]+)/.exec(n.link || '');
        return m ? decodeURIComponent(m[1]) : null;
      }).filter(Boolean))];
      if (unames.length) {
        const ph = unames.map(() => '?').join(',');
        const urows = await db.prepare("SELECT username, avatar_url, id FROM users WHERE username IN (" + ph + ")").all(...unames);
        const umap = {}; urows.forEach(u => { umap[u.username] = u; });
        legacy.forEach(n => {
          const m = /^(?:\/messages|\/profile)\/([^\/?#]+)/.exec(n.link || '');
          if (m) {
            const u = umap[decodeURIComponent(m[1])];
            if (u) { n.actor_id = u.id; n.actor_avatar = u.avatar_url || ('/avatar/' + u.id); }
          }
        });
      }
    } catch (_) {}
    const c = await db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0').get(me);
    res.json({ ok: true, unread: c.c, items });
  } catch (e) { res.status(500).json({ ok: false, error: 'db' }); }
});

// ── সেশন ৭৬: মেসেজিং প্রো-ফিচার ──────────────────────────────────────────────
// (ক) মেসেজ এডিট — শুধু নিজের টেক্সট-মেসেজ, ১৫-মিনিট উইন্ডো, edited_at-ট্রেসসহ
router.post('/api/messages/:id/edit', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msgId = parseInt(req.params.id, 10);
  const text = String((req.body || {}).body || '').trim().slice(0, 4000);
  if (!msgId || !text) return res.status(400).json({ ok: false, error: 'invalid' });
  const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  if (!msg || msg.sender_id !== me || !(await convAccess(msg.conversation_id, me))) return res.status(403).json({ ok: false, error: 'forbidden' });
  const sentTs = new Date(String(msg.created_at).includes('T') ? msg.created_at : String(msg.created_at).replace(' ', 'T') + 'Z').getTime();
  if (Date.now() - sentTs > 15 * 60 * 1000) return res.json({ ok: false, error: 'window' });
  await db.prepare("UPDATE messages SET body = ?, edited_at = datetime('now') WHERE id = ?").run(text, msgId);
  res.json({ ok: true, id: msgId, body: text, edited: true });
});

// (খ) ফরওয়ার্ড-টার্গেট তালিকা (মোডালের জন্য — নিজের সব কথোপকথন)
router.get('/api/messages/forward-targets', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convs = await convListFor(me);
  res.json({ conversations: convs.map(c => ({
    id: c.id,
    name: c.other_name,
    avatar: c.other_avatar,
    is_group: !!c.is_group_flag,
    member_count: c.member_count || 0,
    muted: !!c.muted
  })) });
});

// (গ) ফরওয়ার্ড — কপি নতুন কথোপকথনে পাঠায় (মূল মেসেজ অক্ষত)
router.post('/api/messages/:id/forward', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msgId = parseInt(req.params.id, 10);
  const targetId = parseInt((req.body || {}).conv_id, 10);
  if (!msgId || !targetId) return res.status(400).json({ ok: false, error: 'invalid' });
  const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  if (!msg || !(await convAccess(msg.conversation_id, me))) return res.status(403).json({ ok: false, error: 'forbidden' });
  const target = await convAccess(targetId, me);
  if (!target) return res.status(403).json({ ok: false, error: 'forbidden' });
  // সেশন ১৫৮: ফরওয়ার্ডে মূল ভয়েস-duration অক্ষত কপি হয়
  const ins = await db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name, duration) VALUES (?, ?, ?, ?, ?, ?)')
    .run(targetId, me, msg.body, msg.file_url, msg.file_name, parseInt(msg.duration, 10) || 0);
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(targetId);
  const preview = (msg.body || '📎 ' + (msg.file_name || 'ফাইল')).slice(0, 60);
  if (target.is_group) {
    const members = await db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(targetId);
    for (const mm of members) {
      if (mm.user_id !== me && !(await isConvMuted(targetId, mm.user_id))) {
        await notifyOnce(mm.user_id, 'message', 'ফরওয়ার্ড করা মেসেজ', `${displayName(req.session.user)} (${target.title || 'চ্যাট'}): ${preview}`, '/messages/g/' + targetId);
      }
    }
  } else {
    const oid = target.user_a === me ? target.user_b : target.user_a;
    if (oid !== me && !(await isConvMuted(targetId, oid))) {
      await notifyOnce(oid, 'message', 'ফরওয়ার্ড করা মেসেজ', `${displayName(req.session.user)} আপনাকে একটি মেসেজ ফরওয়ার্ড করেছেন`, '/messages/' + req.session.user.username);
    }
  }
  res.json({ ok: true, id: ins.lastInsertRowid });
});

// (ঘ) মিউট টগল — 1:1-এ অন-ডিমান্ড conversation_members রো (গ্রুপে আগেই থাকে);
// মিউট = এই কথোপকথনের নোটিফিকেশন বন্ধ (চ্যাট-বার্তা আগের মতোই আসবে)
router.post('/api/messages/conv/:id/mute', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.params.id, 10);
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
  try {
    await db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(convId, me, me);
  } catch (e) {}
  const want = (req.body || {}).muted;
  const row = await db.prepare('SELECT muted FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(convId, me);
  const next = (typeof want !== 'undefined' && want !== null) ? (want ? 1 : 0) : ((row && row.muted) ? 0 : 1);
  await db.prepare('UPDATE conversation_members SET muted = ? WHERE conversation_id = ? AND user_id = ?').run(next, convId, me);
  res.json({ ok: true, muted: !!next });
});

// (ছ) সেশন ৯২ (রোডম্যাপ C4/১২): শেয়ার্ড-মিডিয়া ফিড — ডিটেইলস-প্যানেলের
// ছবি/ফাইল/লিংক-ট্যাব লাইভ-লোড করে (পেজ-লোডে স্টেল হয় না)।
// শ্রেণিবিভাগ: file_url-ইমেজ → images; বাকি সংযুক্তি → files; বডিতে http(s)-লিংক → links।
router.get('/api/messages/conv/:id/media', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.params.id, 10);
  if (!convId) return res.status(400).json({ ok: false, error: 'invalid' });
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });

  const rows = await db.prepare(
    `SELECT m.id, m.body, m.file_url, m.file_name, m.duration, m.created_at, u.full_name AS sender_name
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ? AND (m.file_url IS NOT NULL AND m.file_url != '') 
     ORDER BY m.id DESC LIMIT 90`
  ).all(convId);

  const isImg = (u) => /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(String(u || ''));
  const isAud = (u) => /\.(webm|ogg|oga|m4a|mp3|wav|aac|opus)$/i.test(String(u || ''));
  const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

  const images = [];
  const voice = [];
  const files = [];
  const seen = new Set();
  for (const m of rows) {
    const shownUrl = voiceStreamUrl(m.id, m.file_url); // session183: ভয়েস → স্ট্রিম-লিংক (.webm-প্রত্যয় → isAud ধরে)
    const item = { id: m.id, url: shownUrl, name: m.file_name || 'ফাইল', by: m.sender_name, at: m.created_at, duration: parseInt(m.duration, 10) || 0 };
    if (isImg(shownUrl)) images.push(item); // session190-ফিক্স: raw data:image-এ এক্সটেনশন-টেস্ট ফেল করত — সংক্ষিপ্ত-লিঙ্কে চেক
    else if (isAud(shownUrl)) voice.push(item);
    else { if (!seen.has(m.file_url)) { seen.add(m.file_url); files.push(item); } }
  }

  // লিংক: ফাইল-বিহীন বার্তার বডি থেকে URL (শেষ ১২০ বার্তা স্ক্যান)
  const linkRows = await db.prepare(
    `SELECT m.id, m.body, m.created_at, u.full_name AS sender_name
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ? AND (m.file_url IS NULL OR m.file_url = '') AND m.body LIKE '%http%'
     ORDER BY m.id DESC LIMIT 120`
  ).all(convId);
  const links = [];
  const seenLink = new Set();
  for (const m of linkRows) {
    const matches = String(m.body || '').match(URL_RE);
    if (!matches) continue;
    for (const raw of matches) {
      const url = raw.replace(/[.,;!?]+$/, '');
      let host = url;
      try { host = new URL(url).host; } catch (e) { continue; }
      const key = host + new URL(url).pathname;
      if (seenLink.has(key)) continue;
      seenLink.add(key);
      // প্রিভিউ-টেক্সট: URL-ছাড়া বডির প্রথম লাইন, না থাকলে host
      const text = String(m.body || '').replace(URL_RE, '').trim().replace(/\s+/g, ' ').slice(0, 80);
      links.push({ id: m.id, url, host, text, by: m.sender_name, at: m.created_at });
      break; // প্রতি-বার্তায় প্রথম লিংক
    }
    if (links.length >= 40) break;
  }

  res.json({ ok: true, images: images.slice(0, 60), voice: voice.slice(0, 24), files: files.slice(0, 40), links });
});

// (চ) আনসেন্ড — নিজের মেসেজ সবার জন্য মুছুন (1:1 + গ্রুপ এক এন্ডপয়েন্টে)
router.post('/api/messages/:id/delete', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const msgId = parseInt(req.params.id, 10);
  const msg = await db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  if (!msg || msg.sender_id !== me || !(await convAccess(msg.conversation_id, me))) return res.status(403).json({ ok: false });
  await db.prepare('DELETE FROM messages WHERE id = ?').run(msgId);
  res.json({ ok: true });
});

// (ছ) পিন টগল — পিন-করা কথোপকথন তালিকায় সবার আগে থাকে
router.post('/api/messages/conv/:id/pin', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.params.id, 10);
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
  try {
    await db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(convId, me, me);
  } catch (e) {}
  const want = (req.body || {}).pinned;
  const row = await db.prepare('SELECT pinned FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(convId, me);
  const next = (typeof want !== 'undefined' && want !== null) ? (want ? 1 : 0) : ((row && row.pinned) ? 0 : 1);
  await db.prepare('UPDATE conversation_members SET pinned = ? WHERE conversation_id = ? AND user_id = ?').run(next, convId, me);
  res.json({ ok: true, pinned: !!next });
});

// NOTE: /api/users/search lives in routes/social.js (canonical — social is
// mounted before dashboard; the messenger + share-modal both use it).

// ── Complaints (private) ──────────────────────────────────────────────────
router.get('/complaints', ensureAuth, async (req, res) => {
  const mine = await db.prepare('SELECT * FROM complaints WHERE submitted_by = ? ORDER BY created_at DESC').all(req.session.user.id);
  // সেশন ৩৫: query সরাসরি পাস — আগে পাস হতো না, তাই সফল/ডুপ্লিকেট/ত্রুটি বার্তা দেখাত না
  res.render('user/complaints', { mine, query: req.query, currentPath: '/complaints' });
});

router.post('/complaints', ensureAuth, withUpload(attachmentUpload), async (req, res) => {
  const { subject, body } = req.body;
  if (req.uploadError) return res.redirect('/complaints?err=' + encodeURIComponent(req.uploadError));
  if (!subject) return res.redirect('/complaints');

  // ── সেশন ৩৫: ডুপ্লিকেট-সাবমিট গার্ড ─────────────────────────────────────
  // একই ব্যবহারকারীর হুবহু একই subject+body ভালা অভিযোগ ৫ মিনিটের মধ্যে আবার
  // এলে INSERT করা হয় না — ডাবল-ক্লিক / রিফ্রেশ-রিসাবমিটে একটাই থাকবে।
  const recent = await db.prepare(
    "SELECT id FROM complaints WHERE submitted_by = ? AND subject = ? AND IFNULL(body,'') = IFNULL(?,'') AND created_at >= datetime('now', '-60 minutes') LIMIT 1"
  ).get(req.session.user.id, subject, body || '');
  if (recent) return res.redirect('/complaints?dup=1');

  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const fileName = req.file ? req.file.originalname : null;
  await db.prepare('INSERT INTO complaints (submitted_by, subject, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(req.session.user.id, subject, body || null, fileUrl, fileName);
  // Notify ALL staff: moderators with 'complaints' scope + users with admin/moderator role
  const staff = new Set();
  // Scoped moderators (per-user permission system)
  (await db.prepare("SELECT user_id FROM moderator_scopes WHERE scope = 'complaints'").all()).forEach(m => staff.add(m.user_id));
  // Role-based admins (admin/moderator users)
  (await db.prepare("SELECT id FROM users WHERE role IN ('admin','moderator')").all()).forEach(a => staff.add(a.id));
  staff.delete(req.session.user.id);
  for (const uid of staff) {
    await notifyOnce(uid, 'complaint', 'নতুন অভিযোগ', `${displayName(req.session.user)} একটি অভিযোগ দিয়েছেন: ${subject}`, '/admin/complaints');
  }
  res.redirect('/complaints?sent=1');
});

// ── Helper: broadcast notification to all users (used by moderator posts) ──
async function broadcastToAll(type, title, body, link, excludeUserId) {
  const users = await db.prepare('SELECT id FROM users WHERE status = ? AND id != ?').all('active', excludeUserId || 0);
  const stmt = db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)');
  for (const u of users) await stmt.run(u.id, type, title, body, link);
}

module.exports = router;
module.exports.broadcastToAll = broadcastToAll;

// ═══ সেশন ১১০: শেয়ার-মেনু রিসেন্ট-চ্যাট-শর্টকাট (ShareWithRecentChats) ═══
// GET /api/messages/recent-chats — লগইন-ইউজারের সর্বশেষ ১:১ কথোপকথন ৮টি
// (FB-শেয়ার-শীটের শীর্ষ-কন্টাক্ট-স্ট্রিপ)। ক্রম = সর্বশেষ-মেসেজ id DESC
// (conversations.last_message_at লেগেসি-সারিতে ফাঁকা থাকতে পারে — MAX(id)
// সর্বদা সঠিক)। online = isOnline() (৫-মিনিট lastSeen-ম্যাপ — এই মডিউলেই)।
// নিরাপত্তা: ensureAuth; কেবল নিজের কথোপকথন; গ্রুপ-বাদ (1:1-শর্টকাট)।
router.get('/api/messages/recent-chats', ensureAuth, async (req, res) => {
  try {
    const me110 = req.session.user.id;
    const rows110 = await db.prepare(`
      SELECT u.id AS uid, u.full_name AS name, u.username AS username,
             u.avatar_url AS avatar_url, u.pen_name AS pen_name,
             (SELECT MAX(id) FROM messages WHERE conversation_id = c.id) AS last_mid
        FROM conversations c
        JOIN users u ON u.id = (CASE WHEN c.user_a = ? THEN c.user_b ELSE c.user_a END)
       WHERE (c.user_a = ? OR c.user_b = ?) AND IFNULL(c.is_group, 0) = 0
       ORDER BY last_mid DESC
       LIMIT 8
    `).all(me110, me110, me110);
    const seen110 = new Set();
    const chats110 = [];
    for (const r of rows110) {
      if (seen110.has(r.uid)) continue; // বিরল-ডুপ্লিকেট-কনভ-গার্ড
      seen110.add(r.uid);
      chats110.push({
        id: r.uid,
        name: r.name || ('ইউজার-' + r.uid),
        pen_name: r.pen_name || '',
        username: r.username || ('user-' + r.uid),
        avatar_url: r.avatar_url || '',
        online: isOnline(r.uid)
      });
    }
    res.json({ ok: true, chats: chats110 });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'recent-chats failed' });
  }
});
