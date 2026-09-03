const express = require('express');
const router = express.Router();
const db = require('../db');
const { messageUpload, complaintUpload } = require('../middleware/upload');

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

router.post('/messages/:username', ensureAuth, messageUpload.single('file'), (req, res) => {
  const me = req.session.user.id;
  const other = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!other) return res.redirect('/messages');
  const conv = db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me, other.id, other.id, me);
  if (!conv) return res.redirect('/messages');
  const { body } = req.body;
  const file_url = req.file ? '/uploads/messages/' + req.file.filename : null;
  const file_name = req.file ? req.file.originalname : null;
  if ((!body || !body.trim()) && !file_url) return res.redirect('/messages/' + req.params.username);
  db.prepare('INSERT INTO messages (conversation_id, sender_id, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(conv.id, me, (body || '').trim(), file_url, file_name);
  db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  // Notify recipient
  if (other.id !== me) {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(other.id, 'message', 'নতুন বার্তা', `${req.session.user.full_name} আপনাকে মেসেজ করেছেন`, '/messages/' + req.params.username);
  }
  res.redirect('/messages/' + req.params.username);
});

// ── Complaints (private) ──────────────────────────────────────────────────
router.get('/complaints', ensureAuth, (req, res) => {
  const mine = db.prepare('SELECT * FROM complaints WHERE submitted_by = ? ORDER BY created_at DESC').all(req.session.user.id);
  res.render('user/complaints', { mine, currentPath: '/complaints' });
});

router.post('/complaints', ensureAuth, complaintUpload.single('file'), (req, res) => {
  const { subject, body } = req.body;
  if (!subject) return res.redirect('/complaints');
  const file_url = req.file ? '/uploads/complaints/' + req.file.filename : null;
  const file_name = req.file ? req.file.originalname : null;
  db.prepare('INSERT INTO complaints (submitted_by, subject, body, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
    .run(req.session.user.id, subject, body || null, file_url, file_name);
  // Notify moderators who have the 'complaints' scope (admin sees all complaints
  // directly on the /admin/complaints panel — admin_users has no notification bell)
  const modScopes = db.prepare("SELECT user_id FROM moderator_scopes WHERE scope = 'complaints'").all();
  modScopes.forEach(m => {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(m.user_id, 'complaint', 'নতুন অভিযোগ', `${req.session.user.full_name} একটি অভিযোগ দিয়েছেন: ${subject}`, '/moderator/complaints');
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
