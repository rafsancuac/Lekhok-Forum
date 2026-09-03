const express = require('express');
const router = express.Router();
const db = require('../db');
const { messageUpload, complaintUpload, attachmentUpload, withUpload } = require('../middleware/upload');

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
  return ts && (Date.now() - ts) < 5 * 60 * 1000;
}

// Touch own online state on ANY router hit (registered before all routes)
router.use((req, res, next) => {
  if (req.session && req.session.user) touchOnline(req.session.user.id);
  next();
});


// ── Dashboard (Facebook-style feed) ───────────────────────────────────────
router.get('/dashboard', ensureAuth, (req, res) => {
  const me = req.session.user;
  const filter = req.query.filter || 'all';   // all | article | question | activity | following

  const ARTICLE_SQL = `
    SELECT 'article' as item_type, p.id, p.title, p.body, p.cover_image, p.tags,
           p.published_at as created_at, p.like_count, p.comment_count, p.reactions,
           u.full_name as author_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'article'`;
  const QUESTION_SQL = `
    SELECT 'question' as item_type, p.id, p.title, p.body, p.cover_image, p.tags,
           p.published_at as created_at, p.like_count, p.comment_count, p.reactions,
           u.full_name as author_name, u.username, u.avatar_url, u.gender, u.designation, u.role as author_role
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'question'`;
  const ACTIVITY_SQL = `
    SELECT 'activity' as item_type, dc.id, dc.title, dc.body, dc.image_url as cover_image, dc.content_type as tags,
           dc.created_at, 0 as like_count, 0 as comment_count, '{}' as reactions,
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
  } else if (filter === 'following') {
    sql = ARTICLE_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      UNION ALL ` + QUESTION_SQL + ` AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY created_at DESC LIMIT 30`;
    params = [me.id, me.id];
  } else {
    sql = ARTICLE_SQL + ' UNION ALL ' + QUESTION_SQL + ' UNION ALL ' + ACTIVITY_SQL + ' ORDER BY created_at DESC LIMIT 30';
  }

  const feed = db.prepare(sql).all(...params);
  feed.forEach(item => {
    try { item.reactionCounts = JSON.parse(item.reactions || '{}'); } catch (_) { item.reactionCounts = {}; }
    ['like','love','haha','wow','sad'].forEach(k => { item.reactionCounts[k] = item.reactionCounts[k] || 0; });
    item.link = item.item_type === 'question' ? '/qa/' + item.id : (item.item_type === 'activity' ? '/activities' : '/articles/' + item.id);
    // my current reaction on this item (activities have no reactions)
    if (item.item_type !== 'activity') {
      const mine = db.prepare('SELECT reaction_type FROM likes WHERE user_id = ? AND post_id = ?').get(me.id, item.id);
      item.myReaction = mine ? (mine.reaction_type || 'like') : null;
    } else {
      item.myReaction = null;
    }
  });

  // Right sidebar data
  const mmdd = new Date().toISOString().slice(5, 10); // MM-DD
  const birthdays = db.prepare(`
    SELECT id, username, full_name, avatar_url, birth_date FROM users
    WHERE status = 'active' AND birth_date IS NOT NULL AND birth_date != ''
      AND substr(birth_date, 6) = ?
    LIMIT 6
  `).all(mmdd);

  const suggested = db.prepare(`
    SELECT id, username, full_name, avatar_url, designation,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count
    FROM users u
    WHERE u.status = 'active' AND u.id != ?
      AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
      AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
      AND u.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)
    ORDER BY follower_count DESC LIMIT 5
  `).all(me.id, me.id, me.id, me.id);

  const myFollowing = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url
    FROM follows f JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = ? ORDER BY RANDOM() LIMIT 6
  `).all(me.id);

  const tagRows = db.prepare("SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != '' AND status = 'published' ORDER BY published_at DESC LIMIT 100").all();
  const tagCounts = {};
  tagRows.forEach(r => {
    String(r.tags).split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag, count }));

  // Leaderboard: top users by engagement score
  const leaderboard = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url,
      (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND status='published') +
      (SELECT COUNT(*) FROM comments WHERE author_id = u.id) +
      (SELECT COUNT(*) FROM likes WHERE user_id = u.id) as score
    FROM users u WHERE u.status = 'active'
    ORDER BY score DESC LIMIT 8
  `).all();

  // Trending posts: highest engagement in last 30 days
  const trendingPosts = db.prepare(`
    SELECT p.id, p.title, p.type,
      p.like_count + p.comment_count as engagement,
      u.full_name as author_name
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.published_at >= date('now', '-30 days')
    ORDER BY engagement DESC, p.published_at DESC LIMIT 5
  `).all();

  let myInterests = [];
  try { myInterests = JSON.parse(db.prepare('SELECT interests FROM users WHERE id = ?').get(me.id)?.interests || '[]'); } catch (_) {}

  res.render('user/dashboard', {
    feed, filter, birthdays, suggested, myFollowing, trendingTags, leaderboard, trendingPosts, myInterests,
    currentPath: '/dashboard'
  });
});

// ── Gallery ───────────────────────────────────────────────────────────────
router.get('/gallery', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
  const byCategory = {};
  items.forEach(it => {
    if (!byCategory[it.category]) byCategory[it.category] = [];
    byCategory[it.category].push(it);
  });
  res.render('user/gallery', { items, byCategory, currentPath: '/gallery' });
});

// ── Messages (Messenger-like) ─────────────────────────────────────────────
router.get('/messages', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  // List of conversations
  const conversations = db.prepare(`
    SELECT c.*,
      CASE WHEN c.user_a = ? THEN ub.full_name ELSE ua.full_name END as other_name,
      CASE WHEN c.user_a = ? THEN ub.username ELSE ua.username END as other_username,
      CASE WHEN c.user_a = ? THEN ub.avatar_url ELSE ua.avatar_url END as other_avatar,
      CASE WHEN c.user_a = ? THEN ub.gender ELSE ua.gender END as other_gender,
      (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_body,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
    FROM conversations c
    JOIN users ua ON c.user_a = ua.id
    JOIN users ub ON c.user_b = ub.id
    WHERE c.user_a = ? OR c.user_b = ?
    ORDER BY c.last_message_at DESC
  `).all(me, me, me, me, me, me, me);
  res.render('user/messages-list', { conversations, currentPath: '/messages' });
});

router.get('/messages/:username', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const other = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  if (other.id === me) return res.redirect('/messages');

  // Find or create conversation
  let conv = db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);
  if (!conv) {
    const a = Math.min(me, other.id), b = Math.max(me, other.id);
    const r = db.prepare('INSERT INTO conversations (user_a, user_b) VALUES (?, ?)').run(a, b);
    conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(r.lastInsertRowid);
  }

  // Mark as read
  db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(conv.id, me);

  const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conv.id);

  // Refresh list of conversations for sidebar
  const conversations = db.prepare(`
    SELECT c.*,
      CASE WHEN c.user_a = ? THEN ub.full_name ELSE ua.full_name END as other_name,
      CASE WHEN c.user_a = ? THEN ub.username ELSE ua.username END as other_username,
      CASE WHEN c.user_a = ? THEN ub.avatar_url ELSE ua.avatar_url END as other_avatar,
      CASE WHEN c.user_a = ? THEN ub.gender ELSE ua.gender END as other_gender
    FROM conversations c JOIN users ua ON c.user_a = ua.id JOIN users ub ON c.user_b = ub.id
    WHERE c.user_a = ? OR c.user_b = ?
    ORDER BY c.last_message_at DESC
  `).all(me, me, me, me, me, me);

  res.render('user/messages-chat', { other, messages, conversations, conv, currentPath: '/messages' });
});

router.post('/messages/:username', ensureAuth, withUpload(attachmentUpload), (req, res) => {
  const me = req.session.user.id;
  const other = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.redirect('/messages');
  // Block check — a blocked pair cannot exchange messages
  if (db.prepare('SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)').get(me, other.id, other.id, me)) {
    return res.redirect('/messages/' + req.params.username + '?err=' + encodeURIComponent('আপনি এই ব্যবহারকারীর সাথে মেসেজ করতে পারবেন না'));
  }
  if (req.uploadError) return res.redirect('/messages/' + req.params.username + '?err=' + encodeURIComponent(req.uploadError));
  const conv = db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);
  if (!conv) return res.redirect('/messages');
  const { body } = req.body;
  const fileUrl = req.file ? '/uploads/attachments/' + req.file.filename : null;
  const fileName = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !fileUrl) return res.redirect('/messages/' + req.params.username);
  db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim() || null, fileUrl, fileName);
  db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  // Notify recipient
  if (other.id !== me) {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(other.id, 'message', 'নতুন বার্তা', `${req.session.user.full_name} আপনাকে মেসেজ করেছেন`, '/messages/' + req.session.user.username);
  }
  res.redirect('/messages/' + req.params.username);
});

// ── v2.3: Messenger — typing indicator (in-memory, 6s window) ──────────
// Map<userId, Map<convId, timestamp>>
const typingState = new Map();

router.post('/api/messages/typing', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.body.conv_id || req.query.conv_id);
  if (!convId) return res.json({ ok: false });
  if (!typingState.has(me)) typingState.set(me, new Map());
  typingState.get(me).set(convId, Date.now());
  res.json({ ok: true });
});

router.get('/api/messages/typing', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id);
  if (!convId) return res.json({ typing: false });
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)').get(convId, me, me);
  if (!conv) return res.json({ typing: false });
  const otherId = conv.user_a === me ? conv.user_b : conv.user_a;
  const others = typingState.get(otherId);
  if (!others) return res.json({ typing: false });
  const ts = others.get(convId);
  if (!ts) return res.json({ typing: false });
  const fresh = (Date.now() - ts) < 6000; // 6s freshness
  res.json({ typing: fresh, user_id: otherId });
});

// ── v2.3: Messenger — mark message as seen (read receipt) ───────────────
router.post('/api/messages/seen', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const messageId = parseInt(req.body.message_id);
  if (!messageId) return res.json({ ok: false });
  // Verify the message belongs to a conversation the user is in
  const msg = db.prepare(`
    SELECT m.* FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = ? AND (c.user_a = ? OR c.user_b = ?)
  `).get(messageId, me, me);
  if (!msg) return res.json({ ok: false });
  if (msg.sender_id === me) return res.json({ ok: true }); // own message
  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId);
  res.json({ ok: true });
});

router.post('/api/messages/seen-all', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.body.conv_id);
  if (!convId) return res.json({ ok: false });
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)').get(convId, me, me);
  if (!conv) return res.json({ ok: false });
  db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?').run(convId, me);
  res.json({ ok: true });
});

// ── v2.3: Messenger — online status (5-min activity window) ─────────────
// ── v2.3: Messenger ── online status (query only; touch happens in top middleware) ──
router.get('/api/messages/online', ensureAuth, (req, res) => {
  const userId = parseInt(req.query.user_id);
  if (!userId) return res.json({ online: false });
  res.json({ online: isOnline(userId) });
});

// ── v2.3: Messenger ── combined poll
router.get('/api/messages/poll', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id);
  const since = parseInt(req.query.since) || 0;
  if (!convId) return res.json({ messages: [], typing: false, online: false });

  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)').get(convId, me, me);
  if (!conv) return res.json({ messages: [], typing: false, online: false });
  const otherId = conv.user_a === me ? conv.user_b : conv.user_a;

  // New messages
  const rows = db.prepare(
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

  // Typing
  let typing = false;
  const others = typingState.get(otherId);
  if (others) {
    const ts = others.get(convId);
    if (ts && (Date.now() - ts) < 6000) typing = true;
  }

  // Online
  const online = isOnline(otherId);

  res.json({ messages, typing, online, me: { id: me } });
});

// ── v2.2: Messenger polling — fetch new messages since timestamp ───────
router.get('/api/messages/check', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conversation_id);
  const since = parseInt(req.query.since) || 0; // last known message id
  if (!convId) return res.json([]);
  // Confirm the conversation belongs to this user
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)').get(convId, me, me);
  if (!conv) return res.json([]);
  const rows = db.prepare(
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
router.get('/api/messages/unread', ensureAuth, (req, res) => {
  const me = req.session.user.id;
  const rows = db.prepare(`
    SELECT c.id, c.last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread
    FROM conversations c WHERE c.user_a = ? OR c.user_b = ?
  `).all(me, me, me);
  const totalUnread = rows.reduce((a, r) => a + r.unread, 0);
  res.json({ totalUnread, conversations: rows });
});

// ── Complaints (private) ──────────────────────────────────────────────────
router.get('/complaints', ensureAuth, (req, res) => {
  const mine = db.prepare('SELECT * FROM complaints WHERE submitted_by = ? ORDER BY created_at DESC').all(req.session.user.id);
  res.render('user/complaints', { mine, currentPath: '/complaints' });
});

router.post('/complaints', ensureAuth, withUpload(attachmentUpload), (req, res) => {
  const { subject, body } = req.body;
  if (req.uploadError) return res.redirect('/complaints?err=' + encodeURIComponent(req.uploadError));
  if (!subject) return res.redirect('/complaints');
  const fileUrl = req.file ? '/uploads/attachments/' + req.file.filename : null;
  const fileName = req.file ? req.file.originalname : null;
  db.prepare('INSERT INTO complaints (submitted_by, subject, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(req.session.user.id, subject, body || null, fileUrl, fileName);
  // Notify ALL staff: moderators with 'complaints' scope + users with admin/moderator role
  const staff = new Set();
  // Scoped moderators (per-user permission system)
  db.prepare("SELECT user_id FROM moderator_scopes WHERE scope = 'complaints'").all().forEach(m => staff.add(m.user_id));
  // Role-based admins (admin/moderator users)
  db.prepare("SELECT id FROM users WHERE role IN ('admin','moderator')").all().forEach(a => staff.add(a.id));
  staff.delete(req.session.user.id);
  staff.forEach(uid => {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(uid, 'complaint', 'নতুন অভিযোগ', `${req.session.user.full_name} একটি অভিযোগ দিয়েছেন: ${subject}`, '/admin/complaints');
  });
  res.redirect('/complaints?sent=1');
});

// ── Helper: broadcast notification to all users (used by moderator posts) ──
function broadcastToAll(type, title, body, link, excludeUserId) {
  const users = db.prepare('SELECT id FROM users WHERE status = ? AND id != ?').all('active', excludeUserId || 0);
  const stmt = db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)');
  users.forEach(u => stmt.run(u.id, type, title, body, link));
}

module.exports = router;
module.exports.broadcastToAll = broadcastToAll;
