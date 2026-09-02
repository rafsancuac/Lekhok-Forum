const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../db');

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentUser(req) {
  return req.session.user || null;
}

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  next();
}

// Auto-linkify @mentions and #hashtags in post bodies
function linkify(text) {
  if (!text) return '';
  // Escape first
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Newlines
  s = s.replace(/\n/g, '<br>');
  // @mentions
  s = s.replace(/@([a-zA-Z0-9_]+)/g, '<a class="mention" href="/profile/$1">@$1</a>');
  // #hashtags
  s = s.replace(/#([\u0980-\u09FFa-zA-Z0-9_]+)/g, '<a class="tag" href="/articles?tag=$1">#$1</a>');
  return s;
}

// ── Article list ─────────────────────────────────────────────────────────────
router.get('/articles', (req, res) => {
  const tag = req.query.tag;
  const author = req.query.author;
  const filterFeatured = req.query.featured === '1';
  let q = `SELECT p.*, u.full_name as author_name, u.username as author_username, u.avatar_url as author_avatar, u.gender as author_gender
           FROM posts p JOIN users u ON p.author_id = u.id
           WHERE p.type = 'article' AND p.status = 'published'`;
  const params = [];
  if (tag) { q += ' AND p.tags LIKE ?'; params.push('%' + tag + '%'); }
  if (author) { q += ' AND u.username = ?'; params.push(author); }
  if (filterFeatured) q += ' AND p.featured = 1';
  q += ' ORDER BY p.published_at DESC';
  const articles = db.prepare(q).all(...params);
  const popularTags = db.prepare("SELECT tags FROM posts WHERE type='article' AND tags IS NOT NULL").all();
  res.render('user/articles', { articles, tag, popularTags, currentPath: '/articles' });
});

// ── New article form ─────────────────────────────────────────────────────────
router.get('/articles/new', ensureLoggedIn, (req, res) => {
  res.render('user/article-form', { post: null, error: null, currentPath: '/articles/new' });
});

// ── Submit article ───────────────────────────────────────────────────────────
router.post('/articles/new', ensureLoggedIn, (req, res) => {
  const { title, body, excerpt, cover_image, tags, category } = req.body;
  if (!title || !body) {
    return res.render('user/article-form', { post: req.body, error: 'শিরোনাম ও বিষয়বস্তু আবশ্যক', currentPath: '/articles/new' });
  }
  const result = db.prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, category) VALUES (?, 'article', ?, ?, ?, ?, ?, ?)`).run(
    req.session.user.id, title, body, excerpt || body.substring(0, 200), cover_image || null, tags || null, category || 'general'
  );
  res.redirect('/articles/' + result.lastInsertRowid);
});

// ── Single article view ──────────────────────────────────────────────────────
router.get('/articles/:id', (req, res) => {
  const post = db.prepare(`SELECT p.*, u.full_name as author_name, u.username as author_username, u.avatar_url as author_avatar, u.gender as author_gender, u.designation as author_designation, u.bio as author_bio
                           FROM posts p JOIN users u ON p.author_id = u.id
                           WHERE p.id = ? AND p.status = 'published'`).get(req.params.id);
  if (!post) return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });

  // increment view
  db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

  // comments
  const comments = db.prepare(`SELECT c.*, u.full_name, u.username, u.avatar_url, u.gender
                               FROM comments c JOIN users u ON c.author_id = u.id
                               WHERE c.post_id = ? ORDER BY c.created_at ASC`).all(req.params.id);

  // check if current user liked/bookmarked
  let userLiked = false, userBookmarked = false;
  if (req.session.user) {
    userLiked = !!db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND comment_id IS NULL').get(req.params.id, req.session.user.id);
    userBookmarked = !!db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(req.params.id, req.session.user.id);
  }

  const author = {
    id: post.author_id,
    full_name: post.author_name,
    username: post.author_username,
    avatar_url: post.author_avatar,
    gender: post.author_gender,
    designation: post.author_designation,
    bio: post.author_bio
  };
  const user = req.session.user || null;
  res.render('user/article-single', { post, author, comments, user, userLiked, userBookmarked, currentPath: '/articles' });
});

// ── Edit article form ────────────────────────────────────────────────────────
router.get('/articles/:id/edit', ensureLoggedIn, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles/' + req.params.id);
  res.render('user/article-form', { post, error: null, currentPath: '/articles' });
});

// ── Update article ───────────────────────────────────────────────────────────
router.post('/articles/:id/edit', ensureLoggedIn, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles/' + req.params.id);
  const { title, body, excerpt, cover_image, tags, category } = req.body;
  db.prepare('UPDATE posts SET title=?, body=?, excerpt=?, cover_image=?, tags=?, category=? WHERE id=?').run(title, body, excerpt || body.substring(0, 200), cover_image || null, tags || null, category || 'general', req.params.id);
  res.redirect('/articles/' + req.params.id);
});

// ── Delete article ───────────────────────────────────────────────────────────
router.post('/articles/:id/delete', ensureLoggedIn, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles');
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM comments WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM likes WHERE post_id = ?').run(req.params.id);
  res.redirect('/articles');
});

// ── Like / Unlike post (POST/DELETE) ─────────────────────────────────────────
function toggleLike(req, res) {
  const back = req.get('Referrer') || '/';
  const postId = req.params.id;
  const userId = req.session.user.id;
  const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND comment_id IS NULL').get(postId, userId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ?').run(postId);
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
    // notify post author
    const post = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(postId);
    if (post && post.author_id !== userId) {
      db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
        post.author_id, 'like', 'নতুন লাইক', `${req.session.user.full_name} আপনার লেখা "${post.title}" লাইক করেছেন`, '/articles/' + postId
      );
    }
  }
  res.redirect(back);
}
router.post('/articles/:id/like', ensureLoggedIn, toggleLike);

// ── Bookmark ─────────────────────────────────────────────────────────────────
function toggleBookmark(req, res) {
  const back = req.get('Referrer') || '/';
  const existing = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(req.params.id, req.session.user.id);
  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(req.session.user.id, req.params.id);
  }
  res.redirect(back);
}
router.post('/articles/:id/bookmark', ensureLoggedIn, toggleBookmark);

// ── Add comment ──────────────────────────────────────────────────────────────
router.post('/articles/:id/comment', ensureLoggedIn, (req, res) => {
  const { body, parent_id } = req.body;
  if (!body || !body.trim()) return res.redirect('/articles/' + req.params.id);
  db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id) VALUES (?, ?, ?, ?)').run(
    req.params.id, req.session.user.id, body.trim(), parent_id || null
  );
  db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.id);
  // notify
  const post = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(req.params.id);
  if (post && post.author_id !== req.session.user.id) {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      post.author_id, 'comment', 'নতুন মন্তব্য', `${req.session.user.full_name} আপনার লেখায় মন্তব্য করেছেন`, '/articles/' + req.params.id
    );
  }
  res.redirect('/articles/' + req.params.id + '#comments');
});

// ── Q&A list ─────────────────────────────────────────────────────────────────
router.get('/qa', (req, res) => {
  const questions = db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as ans_count
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.type = 'question' AND p.status = 'published'
    ORDER BY p.published_at DESC`).all();
  res.render('user/qa-list', { questions, currentPath: '/qa' });
});

// ── New question ─────────────────────────────────────────────────────────────
router.get('/qa/new', ensureLoggedIn, (req, res) => {
  res.render('user/qa-form', { post: null, error: null, currentPath: '/qa/new' });
});

router.post('/qa/new', ensureLoggedIn, (req, res) => {
  const { title, body, category, tags } = req.body;
  if (!title || !body) return res.render('user/qa-form', { post: req.body, error: 'শিরোনাম ও প্রশ্ন আবশ্যক', currentPath: '/qa/new' });
  const r = db.prepare(`INSERT INTO posts (author_id, type, title, body, category, tags) VALUES (?, 'question', ?, ?, ?, ?)`).run(req.session.user.id, title, body, category || 'general', tags || null);
  res.redirect('/qa/' + r.lastInsertRowid);
});

// ── Question detail with answers ────────────────────────────────────────────
router.get('/qa/:id', (req, res) => {
  const post = db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender, u.designation
                           FROM posts p JOIN users u ON p.author_id = u.id
                           WHERE p.id = ? AND p.type = 'question' AND p.status = 'published'`).get(req.params.id);
  if (!post) return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  const answers = db.prepare(`SELECT c.*, u.full_name, u.username, u.avatar_url, u.gender
                              FROM comments c JOIN users u ON c.author_id = u.id
                              WHERE c.post_id = ? AND c.parent_id IS NULL
                              ORDER BY c.like_count DESC, c.created_at ASC`).all(req.params.id);
  res.render('user/qa-single', { post, answers, currentPath: '/qa' });
});

// ── Members directory ────────────────────────────────────────────────────────
router.get('/members', (req, res) => {
  const search = req.query.q || '';
  let q = 'SELECT id, username, full_name, designation, bio, avatar_url, gender, created_at FROM users WHERE status = ?';
  const params = ['active'];
  if (search) { q += ' AND (full_name LIKE ? OR username LIKE ? OR designation LIKE ?)'; const t = '%' + search + '%'; params.push(t, t, t); }
  q += ' ORDER BY full_name ASC';
  const members = db.prepare(q).all(...params);
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").get().c;
  res.render('user/members', { members, search, totalUsers, currentPath: '/members' });
});

// ── Public profile ───────────────────────────────────────────────────────────
router.get('/profile/:username', (req, res) => {
  const profile = db.prepare('SELECT * FROM users WHERE username = ? AND status = ?').get(req.params.username, 'active');
  if (!profile) return res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
  const articles = db.prepare("SELECT * FROM posts WHERE author_id = ? AND type = 'article' AND status = 'published' ORDER BY published_at DESC LIMIT 20").all(profile.id);
  const questions = db.prepare("SELECT * FROM posts WHERE author_id = ? AND type = 'question' AND status = 'published' ORDER BY published_at DESC LIMIT 20").all(profile.id);
  const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(profile.id).c;
  const followingCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(profile.id).c;
  const isOwner = req.session.user && req.session.user.id === profile.id;
  const isFollowing = req.session.user && !!db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.user.id, profile.id);
  res.render('user/profile', {
    profile,
    author: profile,
    posts: articles,
    questions,
    postCount: articles.length,
    followerCount, followingCount,
    isOwner, isFollowing,
    currentPath: '/profile/' + profile.username
  });
});

// ── Follow / Unfollow ────────────────────────────────────────────────────────
router.post('/profile/:username/follow', ensureLoggedIn, (req, res) => {
  const back = req.get('Referrer') || ('/profile/' + req.params.username);
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target || target.id === req.session.user.id) return res.redirect(back);
  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.user.id, target.id);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.session.user.id, target.id);
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      target.id, 'follow', 'নতুন ফলোয়ার', `${req.session.user.full_name} আপনাকে ফলো করেছেন`, '/profile/' + req.params.username
    );
  }
  res.redirect(back);
});

// ── Generic API endpoints for the JS in views ───────────────────────────────
router.post('/api/like', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { id, type } = req.body; // type: 'post' or 'comment'
  const userId = req.session.user.id;
  if (type === 'comment') {
    const existing = db.prepare('SELECT id FROM likes WHERE comment_id = ? AND user_id = ? AND post_id IS NULL').get(id, userId);
    if (existing) {
      db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
      db.prepare('UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(id);
    } else {
      db.prepare('INSERT INTO likes (user_id, comment_id) VALUES (?, ?)').run(userId, id);
      db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(id);
    }
    const c = db.prepare('SELECT like_count FROM comments WHERE id = ?').get(id);
    return res.json({ count: c.like_count, liked: !existing });
  } else {
    const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND comment_id IS NULL').get(id, userId);
    if (existing) {
      db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
      db.prepare('UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(id);
    } else {
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, id);
      db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(id);
      const post = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(id);
      if (post && post.author_id !== userId) {
        db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
          post.author_id, 'like', 'নতুন লাইক', `${req.session.user.full_name} আপনার লেখা "${post.title}" লাইক করেছেন`, '/articles/' + id
        );
      }
    }
    const p = db.prepare('SELECT like_count FROM posts WHERE id = ?').get(id);
    return res.json({ count: p.like_count, liked: !existing });
  }
});

router.post('/api/bookmark', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { post_id } = req.body;
  const existing = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(post_id, req.session.user.id);
  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
    return res.json({ saved: false });
  } else {
    db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(req.session.user.id, post_id);
    return res.json({ saved: true });
  }
});

router.post('/api/comment', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { post_id, body, parent_id } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'empty' });
  db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id) VALUES (?, ?, ?, ?)').run(
    post_id, req.session.user.id, body.trim(), parent_id || null
  );
  db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(post_id);
  const post = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(post_id);
  if (post && post.author_id !== req.session.user.id) {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      post.author_id, 'comment', 'নতুন মন্তব্য', `${req.session.user.full_name} আপনার লেখায় মন্তব্য করেছেন`, '/articles/' + post_id
    );
  }
  res.json({ ok: true });
});

router.post('/follow/:userId', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const targetId = parseInt(req.params.userId, 10);
  if (targetId === req.session.user.id) return res.json({ following: false });
  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.user.id, targetId);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
    return res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.session.user.id, targetId);
    const target = db.prepare('SELECT username FROM users WHERE id = ?').get(targetId);
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      targetId, 'follow', 'নতুন ফলোয়ার', `${req.session.user.full_name} আপনাকে ফলো করেছেন`, '/profile/' + (target?.username || '')
    );
    return res.json({ following: true });
  }
});

router.get('/api/notifications/count', (req, res) => {
  if (!req.session.user) return res.json({ unread: 0 });
  const r = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.session.user.id);
  res.json({ unread: r.c });
});

router.post('/api/notifications/read/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.session.user.id);
  res.json({ ok: true });
});

router.get('/notifications/mark-all-read', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.session.user.id);
  res.redirect('/notifications');
});

router.get('/bookmarks', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const items = db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender
    FROM bookmarks b JOIN posts p ON b.post_id = p.id JOIN users u ON p.author_id = u.id
    WHERE b.user_id = ? AND p.status = 'published' ORDER BY b.created_at DESC`).all(req.session.user.id);
  res.render('user/articles', { posts: items, articles: items, tag: null, currentPath: '/bookmarks' });
});

// ── API: Notifications ───────────────────────────────────────────────────────
router.get('/api/notifications', (req, res) => {
  if (!req.session.user) return res.json([]);
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.session.user.id);
  res.json(notifications);
});

router.post('/api/notifications/read', (req, res) => {
  if (!req.session.user) return res.json({ error: 'unauthorized' });
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.session.user.id);
  res.json({ success: true });
});

module.exports = router;
