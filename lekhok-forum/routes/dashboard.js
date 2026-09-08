const express = require('express');
const router = express.Router();
const db = require('../db');
const { messageUpload, complaintUpload, attachmentUpload, withUpload } = require('../middleware/upload');

// ── ডুপ্লিকেট-নোটিফিকেশন গার্ড: একই ইউজার+টাইপ+বডি ১ মিনিটের মধ্যে দ্বিতীয়বার ঢোকে না ──
async function notifyOnce(uid, type, title, body, link, windowMin) {
  try {
    const dup = await db.prepare(
      "SELECT id FROM notifications WHERE user_id = ? AND type = ? AND body = ? AND created_at >= datetime('now', ?) LIMIT 1"
    ).get(uid, type, body, '-' + (windowMin || 10) + ' minutes');
    if (dup) return false;
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(uid, type, title, body, link);
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
  if (req.session && req.session.user) touchOnline(req.session.user.id);
  next();
});


// ── Dashboard (Facebook-style feed) ───────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const me = req.session.user || null;
  const filter = me && req.query.filter === 'following' ? 'following' : (req.query.filter || 'all');   // all | article | question | activity | following

  const ARTICLE_SQL = `
    SELECT 'article' as item_type, p.id, p.title, p.body, p.cover_image, p.tags, p.shared_from,
           p.published_at as created_at, p.like_count, p.comment_count, p.share_count, p.reactions,
           u.full_name as author_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'article'`;
  const QUESTION_SQL = `
    SELECT 'question' as item_type, p.id, p.title, p.body, p.cover_image, p.tags, p.shared_from,
           p.published_at as created_at, p.like_count, p.comment_count, p.share_count, p.reactions,
           u.full_name as author_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'question'`;
  const ACTIVITY_SQL = `
    SELECT 'activity' as item_type, dc.id, dc.title, dc.body, dc.image_url as cover_image, dc.content_type as tags,
           NULL as shared_from, dc.created_at, 0 as like_count, 0 as comment_count, 0 as share_count, '{}' as reactions,
           '\u09ae\u09a1\u09be\u09b0\u09c7\u099f\u09b0' as author_name, 'moderator' as username, NULL as avatar_url, 'other' as gender, '' as designation, 'moderator' as author_role
    FROM daily_content dc
    WHERE dc.content_type = 'activity' AND dc.published = 1`;

  let sql, params = [];
  if (filter === 'article') {
    sql = ARTICLE_SQL + ' ORDER BY created_at DESC LIMIT 30';
  } else if (filter === 'question') {
    sql = QUESTION_SQL + ' ORDER BY created_at DESC LIMIT 30';
  } else if (filter === 'activity') {
    sql = ACTIVITY_SQL + ' ORDER BY created_at DESC LIMIT 30';
  } else if (filter === 'following' && me) {
    sql = ARTICLE_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      UNION ALL ` + QUESTION_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY created_at DESC LIMIT 30`;
    params = [me.id, me.id];
  } else {
    sql = ARTICLE_SQL + ' UNION ALL ' + QUESTION_SQL + ' UNION ALL ' + ACTIVITY_SQL + ' ORDER BY created_at DESC LIMIT 30';
  }

  const feed = await db.prepare(sql).all(...params);
  // (সেশন ৫০) N+1 ফিক্স: আগে প্রতি feed-আইটেমে এক করে `likes` কুয়ারি হতো
  // (৩০ আইটেম = ৩০ কুয়ারি)। এখন এক batch কুয়ারিতে আমার সব রিয়েকশন আনি।
  const postIds = feed.filter(i => i.item_type !== 'activity').map(i => i.id);
  const myReactions = {};
  if (me && postIds.length) {
    try {
      const likes = await db.prepare(
        `SELECT post_id, reaction_type FROM likes WHERE user_id = ? AND post_id IN (${postIds.map(() => '?').join(',')})`
      ).all(me.id, ...postIds);
      for (const l of likes) myReactions[l.post_id] = l.reaction_type || 'like';
    } catch (_) {}
  }
  for (const item of feed) {
    try { item.reactionCounts = JSON.parse(item.reactions || '{}'); } catch (_) { item.reactionCounts = {}; }
    ['like','love','care','haha','wow','sad'].forEach(k => { item.reactionCounts[k] = item.reactionCounts[k] || 0; });
    item.link = item.item_type === 'question' ? '/qa/' + item.id : (item.item_type === 'activity' ? '/activities' : '/articles/' + item.id);
    // my current reaction on this item (activities have no reactions)
    item.myReaction = (me && item.item_type !== 'activity') ? (myReactions[item.id] || null) : null;
    // টাস্ক ১৩ (পর্ব ৪, অংশ ক): feed-আইটেমের একাধিক ছবি (post / daily)
    item.images = (await db.getPostImages(item.item_type === 'activity' ? 'daily' : 'post', item.id)).map(i => i.image_url);
    if (!item.images.length && item.cover_image) item.images = [item.cover_image];
  }

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
    SELECT u.id, u.username, u.full_name, u.avatar_url
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
  const trendingPosts = await db.prepare(`
    SELECT p.id, p.title, p.type,
      p.like_count + p.comment_count as engagement,
      u.full_name as author_name
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.published_at >= date('now', '-30 days')
    ORDER BY engagement DESC, p.published_at DESC LIMIT 5
  `).all();

  let myInterests = [];
  if (me) { try { myInterests = JSON.parse(await db.prepare('SELECT interests FROM users WHERE id = ?').get(me.id)?.interests || '[]'); } catch (_) {} }

  res.render('user/dashboard', {
    feed, filter, birthdays, suggested, myFollowing, trendingTags, leaderboard, trendingPosts, myInterests,
    user: req.session.user || null,
    currentPath: '/dashboard'
  });
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
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
    FROM conversations c
    JOIN users ua ON c.user_a = ua.id
    JOIN users ub ON c.user_b = ub.id
    WHERE (c.user_a = ? OR c.user_b = ?) AND IFNULL(c.is_group, 0) = 0
  `).all(me, me, me, me, me, me, me, me);
  let groups = [];
  try {
    groups = await db.prepare(`
      SELECT c.*, 1 as is_group_flag, c.title as other_name, NULL as other_username, NULL as other_avatar, NULL as other_gender,
        '/messages/g/' || c.id as conv_link,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_body,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count,
        (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as member_count
      FROM conversations c JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE IFNULL(c.is_group, 0) = 1 AND cm.user_id = ?
    `).all(me, me);
  } catch (e) {}
  return one.concat(groups).sort((a, b) => String(b.last_message_at || '').localeCompare(String(a.last_message_at || '')));
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

  // Find or create conversation
  let conv = await db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);
  if (!conv) {
    const a = Math.min(me, other.id), b = Math.max(me, other.id);
    const r = await db.prepare('INSERT INTO conversations (user_a, user_b) VALUES (?, ?)').run(a, b);
    conv = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(r.lastInsertRowid);
  }

  // Mark as read
  await db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(conv.id, me);

  const messages = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conv.id);
  const reactionMap = await reactionMapFor(messages);

  // Refresh list of conversations for sidebar (1-on-1 + groups)
  const conversations = await convListFor(me);

  res.render('user/messages-chat', { other, messages, conversations, conv, isGroup: false, members: [], reactionMap, currentPath: '/messages', err: req.query.err || null });
});

router.post('/messages/:username', ensureAuth, withUpload(attachmentUpload), async (req, res) => {
  const me = req.session.user.id;
  const other = await db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.redirect('/messages');
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
  const { body } = req.body;
  // req.file.url is correct in BOTH modes (local disk path or Vercel blob URL)
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const fileName = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !fileUrl) {
    if (req.xhr || (req.headers.accept || '').includes('application/json')) return res.status(400).json({ ok: false, error: 'empty' });
    return res.redirect('/messages/' + req.params.username);
  }
  const ins = await db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim() || null, fileUrl, fileName);
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  // Notify recipient (dedup: ১০ মিনিটে একই বডির দ্বিতীয় নোটিফিকেশন নয়)
  if (other.id !== me) {
    await notifyOnce(other.id, 'message', 'নতুন বার্তা', `${req.session.user.full_name} আপনাকে মেসেজ করেছেন`, '/messages/' + req.session.user.username);
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
  for (const nm of names) {
    const u = await db.prepare('SELECT id FROM users WHERE username = ? AND status = ?').get(nm, 'active');
    if (u) all.add(u.id);
  }
  for (const uid of all) {
    try { await db.prepare('INSERT INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(convId, uid, me); } catch (e) {}
  }
  for (const uid of all) {
    if (uid !== me) await notifyOnce(uid, 'message', 'নতুন গ্রুপ', `${req.session.user.full_name} আপনাকে "${title}" গ্রুপে যুক্ত করেছেন`, '/messages/g/' + convId);
  }
  res.redirect('/messages/g/' + convId);
});

// গ্রুপ চ্যাট ভিউ
router.get('/messages/g/:id', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) return res.redirect('/messages');
  await db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(conv.id, me);
  const messages = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conv.id);
  const reactionMap = await reactionMapFor(messages);
  const members = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url FROM conversation_members cm JOIN users u ON u.id = cm.user_id WHERE cm.conversation_id = ?
  `).all(conv.id);
  const other = { id: 0, username: null, full_name: conv.title, avatar_url: null, is_group: true };
  const conversations = await convListFor(me);
  res.render('user/messages-chat', {
    other, messages, conversations, conv, isGroup: true, members, reactionMap,
    currentPath: '/messages', err: req.query.err || null,
    note: req.query.added ? 'added' : (req.query.removed ? 'removed' : null)
  });
});

// গ্রুপে মেসেজ পাঠানো
router.post('/messages/g/:id', ensureAuth, withUpload(attachmentUpload), async (req, res) => {
  const me = req.session.user.id;
  const conv = await convAccess(parseInt(req.params.id), me);
  if (!conv || !conv.is_group) {
    if ((req.headers.accept || '').includes('application/json')) return res.status(403).json({ ok: false, error: 'forbidden' });
    return res.redirect('/messages');
  }
  const { body } = req.body;
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const fileName = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !fileUrl) {
    if ((req.headers.accept || '').includes('application/json')) return res.status(400).json({ ok: false, error: 'empty' });
    return res.redirect('/messages/g/' + conv.id);
  }
  const ins = await db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim() || null, fileUrl, fileName);
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  const members = await db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(conv.id);
  for (const m of members) {
    if (m.user_id !== me) await notifyOnce(m.user_id, 'message', 'নতুন বার্তা', `${req.session.user.full_name} (${conv.title}): ${(body || '📎').slice(0, 60)}`, '/messages/g/' + conv.id);
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
  let added = 0;
  for (const nm of names) {
    const u = await db.prepare("SELECT id FROM users WHERE username = ? AND status = 'active'").get(nm);
    if (!u) continue;
    const ex = await db.prepare('SELECT 1 AS x FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(conv.id, u.id);
    if (ex) continue;
    try {
      await db.prepare('INSERT INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)').run(conv.id, u.id, me);
      added++;
      await notifyOnce(u.id, 'message', 'গ্রুপে যোগ', `${req.session.user.full_name} আপনাকে "${conv.title}" গ্রুপে যুক্ত করেছেন`, '/messages/g/' + conv.id);
    } catch (e) {}
  }
  res.redirect('/messages/g/' + conv.id + '?added=' + added);
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
    'SELECT m.*, u.username AS sender_username, u.full_name AS sender_name, u.avatar_url AS sender_avatar FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? AND m.id > ? ORDER BY m.id ASC'
  ).all(convId, since);
  const messages = rows.map(r => ({
    id: r.id,
    body: r.body,
    file_url: r.file_url,
    file_name: r.file_name,
    sender_id: r.sender_id,
    sender_name: r.sender_name,
    sender_username: r.sender_username,
    sender_avatar: r.sender_avatar || '/avatar/' + r.sender_id,
    is_me: r.sender_id === me,
    created_at: r.created_at,
    is_read: !!r.is_read
  }));

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

  res.json({ messages, typing, online, me: { id: me } });
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
    file_url: r.file_url,
    file_name: r.file_name,
    sender_id: r.sender_id,
    sender_name: r.sender_name,
    sender_username: r.sender_username,
    sender_avatar: r.sender_avatar || '/avatar/' + r.sender_id,
    is_me: r.sender_id === me,
    created_at: r.created_at
  })));
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
    await notifyOnce(uid, 'complaint', 'নতুন অভিযোগ', `${req.session.user.full_name} একটি অভিযোগ দিয়েছেন: ${subject}`, '/admin/complaints');
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
