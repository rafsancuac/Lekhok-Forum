const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../db');
const { coverUpload, withUpload } = require('../middleware/upload');

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

// Extract @mentions from post body — returns JSON array of {username, user_id} for valid users
function extractMentions(text) {
  if (!text) return JSON.stringify([]);
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  const usernames = [...new Set(matches.map(m => m.substring(1).toLowerCase()))];
  if (!usernames.length) return JSON.stringify([]);
  const placeholders = usernames.map(() => '?').join(',');
  const users = db.prepare(`SELECT id, username FROM users WHERE LOWER(username) IN (${placeholders})`).all(...usernames);
  return JSON.stringify(users.map(u => ({ id: u.id, username: u.username })));
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

// ── Submit article (with optional cover image upload) ────────────────────────
router.post('/articles/new', ensureLoggedIn, withUpload(coverUpload), (req, res) => {
  const { title, body, excerpt, cover_image, tags, category } = req.body;
  if (!title || !body) {
    return res.render('user/article-form', { post: req.body, error: 'শিরোনাম ও বিষয়বস্তু আবশ্যক', currentPath: '/articles/new' });
  }
  const cover = req.file ? '/uploads/covers/' + req.file.filename : (cover_image || null);
  const mentions = extractMentions(body);
  const result = db.prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, mentions, category) VALUES (?, 'article', ?, ?, ?, ?, ?, ?, ?)`).run(
    req.session.user.id, title, body, excerpt || body.substring(0, 200), cover, tags || null, mentions, category || 'general'
  );

  // Send notifications to mentioned users
  try {
    const mentioned = JSON.parse(mentions);
    const postId = result.lastInsertRowid;
    mentioned.forEach(m => {
      if (m.id !== req.session.user.id) {
        db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'mention', ?, ?, ?)`).run(
          m.id, 'ম্যানশন', req.session.user.full_name + ' আপনাকে ম্যানশন করেছেন', '/articles/' + postId
        );
      }
    });
  } catch (e) {}

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
router.get(['/qa/new', '/questions/new'], ensureLoggedIn, (req, res) => {
  res.render('user/qa-form', { post: null, error: null, currentPath: '/qa/new' });
});

router.post(['/qa/new', '/questions/new'], ensureLoggedIn, (req, res) => {
  const { title, body, category, tags } = req.body;
  if (!title || !body) return res.render('user/qa-form', { post: req.body, error: 'শিরোনাম ও প্রশ্ন আবশ্যক', currentPath: '/qa/new' });
  const mentions = extractMentions(body);
  const r = db.prepare(`INSERT INTO posts (author_id, type, title, body, category, tags, mentions) VALUES (?, 'question', ?, ?, ?, ?, ?)`).run(req.session.user.id, title, body, category || 'general', tags || null, mentions);

  // Send notifications to mentioned users
  try {
    const mentioned = JSON.parse(mentions);
    const postId = r.lastInsertRowid;
    mentioned.forEach(m => {
      if (m.id !== req.session.user.id) {
        db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'mention', ?, ?, ?)`).run(
          m.id, 'ম্যানশন', req.session.user.full_name + ' আপনাকে একটি প্রশ্নে ম্যানশন করেছেন', '/qa/' + postId
        );
      }
    });
  } catch (e) {}

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
  let q = 'SELECT id, username, full_name, designation, bio, avatar_url, gender, last_login, created_at FROM users WHERE status = ?';
  const params = ['active'];
  if (search) { q += ' AND (full_name LIKE ? OR username LIKE ? OR designation LIKE ?)'; const t = '%' + search + '%'; params.push(t, t, t); }
  q += ' ORDER BY full_name ASC';
  const members = db.prepare(q).all(...params);

  // Group members of the organization (from members table) by member_type
  const allCommittee = db.prepare('SELECT * FROM members ORDER BY member_type, sort_order, name').all();
  const grouped = {
    central:  allCommittee.filter(m => m.member_type === 'central'),
    branch:   allCommittee.filter(m => m.member_type === 'branch'),
    advisory: allCommittee.filter(m => m.member_type === 'advisory'),
    founder:  allCommittee.filter(m => m.member_type === 'founder')
  };
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").get().c;
  res.render('user/members', { members, search, totalUsers, grouped, currentPath: '/members' });
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

// ────────────────────────────────────────────────────────────────────────────
// /me — Personal feed (control center for logged-in user)
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', ensureLoggedIn, (req, res) => {
  const me = req.session.user;

  // My published posts (articles + Q&A)
  const myPosts = db.prepare(`
    SELECT id, type, title, body, excerpt, cover_image, like_count, comment_count, view_count,
           published_at, created_at, status, featured
    FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(me.id);

  // My drafts
  const myDrafts = db.prepare(`
    SELECT id, type, title, body, created_at, status
    FROM posts WHERE author_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 20
  `).all(me.id);

  // My recent comments
  const myComments = db.prepare(`
    SELECT c.id, c.body, c.created_at, c.like_count,
           p.id AS post_id, p.title AS post_title, p.type AS post_type
    FROM comments c JOIN posts p ON p.id = c.post_id
    WHERE c.author_id = ? ORDER BY c.created_at DESC LIMIT 30
  `).all(me.id);

  // My reactions
  const myReactions = db.prepare(`
    SELECT l.post_id, COALESCE(l.reaction_type, 'like') AS reaction_type, l.created_at,
           p.title, p.type AS post_type, p.cover_image
    FROM likes l JOIN posts p ON p.id = l.post_id
    WHERE l.user_id = ? AND l.post_id IS NOT NULL ORDER BY l.created_at DESC LIMIT 30
  `).all(me.id);

  // My bookmarks
  const myBookmarks = db.prepare(`
    SELECT p.id, p.title, p.body, p.cover_image, p.type, p.like_count, p.comment_count,
           b.created_at AS bookmarked_at
    FROM bookmarks b JOIN posts p ON p.id = b.post_id
    WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 30
  `).all(me.id);

  // Following — users + their recent activity
  const following = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio
    FROM follows f JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = ? ORDER BY u.full_name LIMIT 50
  `).all(me.id);

  // Stats
  const stats = {
    posts:       myPosts.filter(p => p.status === 'published').length,
    drafts:      myDrafts.length,
    comments:    myComments.length,
    reactions:   myReactions.length,
    bookmarks:   myBookmarks.length,
    following:   following.length,
    followers:   db.prepare('SELECT COUNT(*) AS c FROM follows WHERE following_id = ?').get(me.id).c
  };

  res.render('user/me', { myPosts, myDrafts, myComments, myReactions, myBookmarks, following, stats, currentPath: '/me' });
});

// ────────────────────────────────────────────────────────────────────────────
// /settings — full settings page (profile, privacy, notifications, account, display, connected)
// ────────────────────────────────────────────────────────────────────────────
router.get('/settings', ensureLoggedIn, (req, res) => {
  res.render('user/settings', { currentPath: '/settings' });
});

router.post('/settings/profile', ensureLoggedIn, withUpload(coverUpload), (req, res) => {
  const me = req.session.user;
  const { full_name, bio, designation, address, gender, birth_date, social_fb, social_twitter, social_linkedin, social_website } = req.body;
  db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      bio = ?, designation = ?, address = ?,
      gender = COALESCE(?, gender),
      birth_date = ?,
      social_fb = ?, social_twitter = ?, social_linkedin = ?, social_website = ?
    WHERE id = ?
  `).run(full_name, bio || null, designation || null, address || null, gender || null, birth_date || null,
         social_fb || null, social_twitter || null, social_linkedin || null, social_website || null, me.id);
  // Refresh session
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
  req.session.user = fresh;
  res.redirect('/settings?ok=profile');
});

router.post('/settings/privacy', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const { show_email, show_phone, show_birth } = req.body;
  db.prepare('UPDATE users SET show_email = ?, show_phone = ?, show_birth = ? WHERE id = ?')
    .run(show_email === '1' ? 1 : 0, show_phone === '1' ? 1 : 0, show_birth === '1' ? 1 : 0, me.id);
  res.redirect('/settings?ok=privacy');
});

router.post('/settings/notifications', ensureLoggedIn, (req, res) => {
  // Stored in user_settings (light key-value); for now we use a JSON column on users.
  // If the column doesn't exist, ignore. Migration adds it safely.
  const me = req.session.user;
  try {
    db.exec("ALTER TABLE users ADD COLUMN notify_prefs TEXT DEFAULT '{}'");
  } catch (_) {}
  const prefs = {
    email_mention: req.body.email_mention === '1',
    email_comment: req.body.email_comment === '1',
    push_like:     req.body.push_like === '1',
    daily_digest:  req.body.daily_digest === '1'
  };
  db.prepare('UPDATE users SET notify_prefs = ? WHERE id = ?').run(JSON.stringify(prefs), me.id);
  res.redirect('/settings?ok=notifications');
});

router.post('/settings/account/password', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const { current_password, new_password, confirm_password } = req.body;
  if (new_password !== confirm_password) return res.redirect('/settings?err=password_mismatch');
  if (new_password.length < 6) return res.redirect('/settings?err=password_short');
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(me.id);
  if (!bcrypt.compareSync(current_password || '', row.password_hash)) {
    return res.redirect('/settings?err=password_wrong');
  }
  const newHash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, me.id);
  res.redirect('/settings?ok=password');
});

router.post('/settings/account/deactivate', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  db.prepare("UPDATE users SET status = 'inactive' WHERE id = ?").run(me.id);
  req.session.destroy(() => res.redirect('/'));
});

router.post('/settings/display', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const { theme, font_size, language } = req.body;
  try {
    db.exec("ALTER TABLE users ADD COLUMN display_prefs TEXT DEFAULT '{}'");
  } catch (_) {}
  const prefs = { theme: theme || 'auto', font_size: font_size || 'medium', language: language || 'bn' };
  db.prepare('UPDATE users SET display_prefs = ? WHERE id = ?').run(JSON.stringify(prefs), me.id);
  res.redirect('/settings?ok=display');
});

// ────────────────────────────────────────────────────────────────────────────
// /profile/edit — fix missing route
// ────────────────────────────────────────────────────────────────────────────
router.get('/profile/edit', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const profile = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
  res.render('user/edit', { profile, currentPath: '/me' });
});

router.post('/profile/edit', ensureLoggedIn, withUpload(coverUpload), (req, res) => {
  const me = req.session.user;
  const { full_name, bio, designation, address, gender, birth_date,
          social_fb, social_twitter, social_linkedin, social_website,
          show_email, show_phone, show_birth, email, phone } = req.body;
  const avatarPath = req.file ? '/uploads/covers/' + req.file.filename : null;
  db.prepare(`
    UPDATE users SET
      full_name = ?, bio = ?, designation = ?, address = ?,
      gender = ?, birth_date = ?,
      social_fb = ?, social_twitter = ?, social_linkedin = ?, social_website = ?,
      show_email = ?, show_phone = ?, show_birth = ?,
      email = ?, phone = ?
      ${avatarPath ? ', avatar_url = ?' : ''}
    WHERE id = ?
  `).run(full_name, bio || null, designation || null, address || null, gender || null, birth_date || null,
         social_fb || null, social_twitter || null, social_linkedin || null, social_website || null,
         show_email === '1' ? 1 : 0, show_phone === '1' ? 1 : 0, show_birth === '1' ? 1 : 0,
         email || null, phone || null,
         ...(avatarPath ? [avatarPath] : []), me.id);
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
  req.session.user = fresh;
  res.redirect('/profile/' + fresh.username + '?ok=updated');
});

// ────────────────────────────────────────────────────────────────────────────
// /api/react — 5 emoji reactions (toggle)
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/react', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const { target_id, target_type, reaction_type } = req.body;
  const ALLOWED = ['like', 'love', 'haha', 'wow', 'sad'];
  if (!ALLOWED.includes(reaction_type)) return res.status(400).json({ error: 'invalid reaction' });
  if (!['post', 'comment'].includes(target_type)) return res.status(400).json({ error: 'invalid target_type' });

  // Schema: likes has columns (id, user_id, post_id, comment_id, created_at)
  // For backward compat: post_id=target_id when type=post, comment_id=target_id when type=comment
  if (target_type === 'post') {
    const existing = db.prepare('SELECT id, reaction_type FROM likes WHERE user_id = ? AND post_id = ?').get(me.id, target_id);
    if (existing && existing.reaction_type === reaction_type) {
      db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    } else if (existing) {
      try { db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      db.prepare('UPDATE likes SET reaction_type = ? WHERE id = ?').run(reaction_type, existing.id);
    } else {
      try { db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      db.prepare('INSERT INTO likes (user_id, post_id, reaction_type) VALUES (?, ?, ?)').run(me.id, target_id, reaction_type);
      // Notify post author (debounced — only for love/haha/wow)
      if (['love', 'haha', 'wow'].includes(reaction_type)) {
        const post = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(target_id);
        if (post && post.author_id !== me.id) {
          const labels = { love: '❤️ ভালোবাসা', haha: '😂 হাসি', wow: '😮 বিস্ময়' };
          db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
            .run(post.author_id, 'reaction', labels[reaction_type] || 'প্রতিক্রিয়া',
                 me.full_name + ' আপনার পোস্টে প্রতিক্রিয়া জানিয়েছেন', '/articles/' + target_id);
        }
      }
    }
    // Recompute like_count and store reactions JSON
    const counts = db.prepare(`
      SELECT reaction_type, COUNT(*) AS c FROM likes WHERE post_id = ? GROUP BY reaction_type
    `).all(target_id);
    const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
    counts.forEach(r => { reactions[r.reaction_type || 'like'] = r.c; });
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    try { db.exec("ALTER TABLE posts ADD COLUMN reactions TEXT DEFAULT '{}'"); } catch (_) {}
    db.prepare('UPDATE posts SET like_count = ?, reactions = ? WHERE id = ?').run(total, JSON.stringify(reactions), target_id);
    res.json({ ok: true, reactions, total, mine: existing ? (existing.reaction_type === reaction_type ? null : reaction_type) : reaction_type });
  } else {
    // comment
    const existing = db.prepare('SELECT id, reaction_type FROM likes WHERE user_id = ? AND comment_id = ?').get(me.id, target_id);
    if (existing && existing.reaction_type === reaction_type) {
      db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    } else if (existing) {
      try { db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      db.prepare('UPDATE likes SET reaction_type = ? WHERE id = ?').run(reaction_type, existing.id);
    } else {
      try { db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      db.prepare('INSERT INTO likes (user_id, comment_id, reaction_type) VALUES (?, ?, ?)').run(me.id, target_id, reaction_type);
    }
    const counts = db.prepare(`
      SELECT reaction_type, COUNT(*) AS c FROM likes WHERE comment_id = ? GROUP BY reaction_type
    `).all(target_id);
    const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
    counts.forEach(r => { reactions[r.reaction_type || 'like'] = r.c; });
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    try { db.exec("ALTER TABLE comments ADD COLUMN reactions TEXT DEFAULT '{}'"); } catch (_) {}
    db.prepare('UPDATE comments SET like_count = ?, reactions = ? WHERE id = ?').run(total, JSON.stringify(reactions), target_id);
    res.json({ ok: true, reactions, total, mine: existing ? (existing.reaction_type === reaction_type ? null : reaction_type) : reaction_type });
  }
});

// Get reactions for a post (for initial render)
router.get('/api/reactions/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (!['post', 'comment'].includes(type)) return res.status(400).json({ error: 'invalid' });
  const col = type === 'post' ? 'post_id' : 'comment_id';
  const rows = db.prepare(`SELECT user_id, reaction_type FROM likes WHERE ${col} = ?`).all(id);
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
  rows.forEach(r => { counts[r.reaction_type || 'like'] = (counts[r.reaction_type || 'like'] || 0) + 1; });
  const mine = req.session.user ? (rows.find(r => r.user_id === req.session.user.id) || null) : null;
  res.json({ counts, total: rows.length, mine: mine ? (mine.reaction_type || 'like') : null });
});

// ────────────────────────────────────────────────────────────────────────────
// /api/share-to-user — share a post to another user via DM
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/share-to-user', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const { to_username, post_id, message } = req.body;
  const other = db.prepare('SELECT * FROM users WHERE username = ?').get(to_username);
  if (!other) return res.status(404).json({ error: 'user not found' });
  let conv = db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me.id, other.id, other.id, me.id);
  if (!conv) {
    const a = Math.min(me.id, other.id), b = Math.max(me.id, other.id);
    const r = db.prepare('INSERT INTO conversations (user_a, user_b) VALUES (?, ?)').run(a, b);
    conv = { id: r.lastInsertRowid };
  }
  const post = db.prepare('SELECT title, type FROM posts WHERE id = ?').get(post_id);
  const link = post && post.type === 'question' ? '/qa/' + post_id : '/articles/' + post_id;
  const body = (message || '') + (post ? '\n\n— শেয়ার: ' + post.title + ' (' + link + ')' : '');
  db.prepare('INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)')
    .run(conv.id, me.id, body.trim());
  db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  res.json({ ok: true, redirect: '/messages/' + other.username });
});

// ────────────────────────────────────────────────────────────────────────────
// /qa/:id/answer — fix broken Q&A answer form
// ────────────────────────────────────────────────────────────────────────────
router.post('/qa/:id/answer', ensureLoggedIn, (req, res) => {
  const me = req.session.user;
  const qid = parseInt(req.params.id);
  const { body } = req.body;
  if (!body || !body.trim()) return res.redirect('/qa/' + qid + '?err=empty');
  const r = db.prepare('INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)').run(qid, me.id, body.trim());
  db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(qid);
  // Notify question author
  const q = db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(qid);
  if (q && q.author_id !== me.id) {
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(q.author_id, 'comment', 'নতুন উত্তর', me.full_name + ' আপনার প্রশ্নে উত্তর দিয়েছেন', '/qa/' + qid);
  }
  res.redirect('/qa/' + qid + '#answer-' + r.lastInsertRowid);
});

module.exports = router;
