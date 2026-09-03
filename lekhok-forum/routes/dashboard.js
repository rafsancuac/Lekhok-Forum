const express = require('express');
const router = express.Router();
const db = require('../db');
const { messageUpload, complaintUpload, attachmentUpload, withUpload } = require('../middleware/upload');

function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  next();
}

// ── Dashboard (Facebook-style feed) ───────────────────────────────────────
router.get('/dashboard', ensureAuth, (req, res) => {
  // Combined feed: articles + questions + activities from daily_content
  const feed = db.prepare(`
    SELECT 'article' as type, p.id, p.title, p.body, p.cover_image, p.published_at as created_at,
           p.like_count, p.comment_count, u.full_name as author_name, u.username, u.avatar_url, u.gender
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published' AND p.type = 'article'
    UNION ALL
    SELECT 'activity' as type, dc.id, dc.title, dc.body, dc.image_url as cover_image, dc.created_at,
           0 as like_count, 0 as comment_count, 'মডারেটর' as author_name, 'moderator' as username, NULL as avatar_url, 'other' as gender
    FROM daily_content dc
    WHERE dc.content_type = 'activity' AND dc.published = 1
    ORDER BY created_at DESC LIMIT 30
  `).all();
  res.render('user/dashboard', { feed, currentPath: '/dashboard' });
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
