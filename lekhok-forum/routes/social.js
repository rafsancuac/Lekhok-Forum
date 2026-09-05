const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { coverUpload, avatarUpload, withUpload } = require('../middleware/upload');

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentUser(req) {
  return req.session.user || null;
}

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) {
    // API/XHR callers expect JSON, not a login-page redirect — main.js checks
    // for 401 and redirects the browser itself.
    if (req.originalUrl.startsWith('/api/') || req.xhr) return res.status(401).json({ error: 'login' });
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
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
async function extractMentions(text) {
  if (!text) return JSON.stringify([]);
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  const usernames = [...new Set(matches.map(m => m.substring(1).toLowerCase()))];
  if (!usernames.length) return JSON.stringify([]);
  const placeholders = usernames.map(() => '?').join(',');
  const users = await db.prepare(`SELECT id, username FROM users WHERE LOWER(username) IN (${placeholders})`).all(...usernames);
  return JSON.stringify(users.map(u => ({ id: u.id, username: u.username })));
}

// ── Reaction helpers (5-emoji system) ────────────────────────────────────────
const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad'];
const REACTION_META = {
  like: { emoji: '👍', label: 'লাইক' },
  love: { emoji: '❤️', label: 'ভালোবাসা' },
  haha: { emoji: '😂', label: 'হাহা' },
  wow:  { emoji: '😮', label: 'বিস্ময়' },
  sad:  { emoji: '😢', label: 'দুঃখ' }
};

async function getReactionSummary(col, id, myUserId) {
  const rows = await db.prepare(`SELECT user_id, reaction_type FROM likes WHERE ${col} = ?`).all(id);
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
  let mine = null;
  rows.forEach(r => {
    const t = r.reaction_type || 'like';
    counts[t] = (counts[t] || 0) + 1;
    if (myUserId && r.user_id === myUserId) mine = t;
  });
  return { counts, total: rows.length, mine };
}

function parseReactionsJson(json) {
  try {
    const p = JSON.parse(json || '{}');
    return { like: p.like || 0, love: p.love || 0, haha: p.haha || 0, wow: p.wow || 0, sad: p.sad || 0 };
  } catch (_) { return { like: 0, love: 0, haha: 0, wow: 0, sad: 0 }; }
}

async function isBlockedBetween(a, b) {
  return !!await db.prepare('SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)').get(a, b, b, a);
}

// Top tag pool from published posts (for interest/category pickers)
async function getTagPool(limit) {
  const rows = await db.prepare("SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != '' AND status = 'published'").all();
  const counts = {};
  rows.forEach(r => {
    String(r.tags).split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit || 24).map(([tag, count]) => ({ tag, count }));
}

// ── Article list ─────────────────────────────────────────────────────────────
router.get('/articles', async (req, res) => {
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
  const articles = await db.prepare(q).all(...params);
  const popularTags = await db.prepare("SELECT tags FROM posts WHERE type='article' AND tags IS NOT NULL").all();
  res.render('user/articles', { articles, tag, popularTags, currentPath: '/articles' });
});

// ── New article form ─────────────────────────────────────────────────────────
router.get('/articles/new', ensureLoggedIn, async (req, res) => {
  res.render('user/article-form', { post: null, error: null, currentPath: '/articles/new' });
});

// ── Submit article (with optional cover image upload) ────────────────────────
router.post('/articles/new', ensureLoggedIn, withUpload(coverUpload), async (req, res) => {
  const { title, body, excerpt, cover_image, tags, category } = req.body;
  if (!title || !body) {
    return res.render('user/article-form', { post: req.body, error: 'শিরোনাম ও বিষয়বস্তু আবশ্যক', currentPath: '/articles/new' });
  }
  const cover = req.file ? (req.file.url || req.file.path) : (cover_image || null);
  const mentions = await extractMentions(body);
  const result = await db.prepare(`INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, mentions, category) VALUES (?, 'article', ?, ?, ?, ?, ?, ?, ?)`).run(
    req.session.user.id, title, body, excerpt || body.substring(0, 200), cover, tags || null, mentions, category || 'general'
  );

  // Send notifications to mentioned users
  try {
    const mentioned = JSON.parse(mentions);
    const postId = result.lastInsertRowid;
    for (const m of mentioned) {
      if (m.id !== req.session.user.id) {
        await db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'mention', ?, ?, ?)`).run(
          m.id, 'ম্যানশন', req.session.user.full_name + ' আপনাকে ম্যানশন করেছেন', '/articles/' + postId
        );
      }
    }
  } catch (e) {}

  // Newsletter — when a staff member (admin/moderator) publishes an article,
  // every active subscriber gets an automatic email notification.
  // notifySubscribers() is fully awaited-safe, but wrapped here so a mail
  // failure can never block the author's redirect.
  try {
    const author = req.session.user || {};
    const isStaffAuthor = author.role === 'admin' || author.role === 'moderator' || req.session.adminUser;
    if (isStaffAuthor) {
      const mailer = require('../helpers/mailer');
      const postRow = await db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
      const r = await mailer.notifySubscribers({
        kind: 'article', refId: result.lastInsertRowid,
        title, body: excerpt || body, authorName: author.full_name || ''
      });
      console.log(`[newsletter] article #${result.lastInsertRowid}: queued=${r.queued} sent=${r.sent} failed=${r.failed}${r.configured ? '' : ' (RESEND_API_KEY নেই — কিউতে অপেক্ষমাণ)'}`);
    }
  } catch (e) { console.error('[newsletter] article notify failed:', e.message); }

  res.redirect('/articles/' + result.lastInsertRowid);
});

// ── Share to own timeline (Facebook-style) ───────────────────────────────────
// Creates a NEW post authored by the current user that references the original
// via posts.shared_from — the original stays untouched; the shared copy lives
// on the sharer's timeline/profile like a Facebook share.
router.post('/articles/:id/share', ensureLoggedIn, async (req, res) => {
  const orig = await db.prepare(`
    SELECT p.*, u.full_name as orig_author, u.username as orig_username
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.id = ? AND p.status = 'published'
  `).get(req.params.id);
  if (!orig) return res.status(404).json({ ok: false, error: 'পোস্ট পাওয়া যায়নি' });
  // Resolve to the true original when sharing an already-shared post
  const sourceId = orig.shared_from || orig.id;
  const source = sourceId !== orig.id
    ? await db.prepare('SELECT p.*, u.full_name as orig_author FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?').get(sourceId)
    : orig;

  const title = source.title;
  const body = source.body || '';
  const excerpt = (source.excerpt || body.substring(0, 200));
  const result = await db.prepare(`
    INSERT INTO posts (author_id, type, title, body, excerpt, cover_image, tags, mentions, category, shared_from)
    VALUES (?, 'article', ?, ?, ?, ?, NULL, NULL, 'general', ?)
  `).run(req.session.user.id, title, body, excerpt, source.cover_image || null, sourceId);
  const newIdInt = result && result.lastInsertRowid;

  // Notify the original author (not when sharing your own post)
  const origAuthorId = orig.author_id;
  if (origAuthorId && origAuthorId !== req.session.user.id) {
    try {
      await db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'share', ?, ?, ?)`).run(
        origAuthorId, 'শেয়ার',
        req.session.user.full_name + ' আপনার পোস্ট শেয়ার করেছেন',
        '/articles/' + (newIdInt || sourceId)
      );
    } catch (e) {}
  }
  res.json({ ok: true, new_id: newIdInt || null, redirect: newIdInt ? ('/articles/' + newIdInt) : '/dashboard' });
});

// ── Single article view ──────────────────────────────────────────────────────
router.get('/articles/:id', async (req, res) => {
  const post = await db.prepare(`SELECT p.*, u.full_name as author_name, u.username as author_username, u.avatar_url as author_avatar, u.gender as author_gender, u.designation as author_designation, u.bio as author_bio
                           FROM posts p JOIN users u ON p.author_id = u.id
                           WHERE p.id = ? AND p.status = 'published'`).get(req.params.id);
  if (!post) return res.status(404).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });

  // If this is a shared copy, resolve the ORIGINAL post + author for attribution
  if (post.shared_from) {
    post.shared_original = await db.prepare(`
      SELECT p.id, p.title, u.full_name as orig_author, u.username as orig_username
      FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?
    `).get(post.shared_from) || null;
  }

  // increment view
  await db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

  // comments — threaded (top-level + replies), with reaction info
  const flatComments = await db.prepare(`SELECT c.*, u.full_name, u.username, u.avatar_url, u.gender
                               FROM comments c JOIN users u ON c.author_id = u.id
                               WHERE c.post_id = ? ORDER BY c.created_at ASC`).all(req.params.id);
  const myId = req.session.user ? req.session.user.id : null;
  // (async migration) nested per-comment reaction lookups moved from sync
  // .map() callbacks into a for..of loop awaiting each summary.
  const comments = [];
  for (const c of flatComments.filter(c => !c.parent_id)) {
    const replies = [];
    for (const r of flatComments.filter(r => r.parent_id === c.id)) {
      replies.push({ ...r, reaction: await getReactionSummary('comment_id', r.id, myId) });
    }
    comments.push({ ...c, reaction: await getReactionSummary('comment_id', c.id, myId), replies });
  }

  // check if current user liked/bookmarked
  let userBookmarked = false;
  if (req.session.user) {
    userBookmarked = !!await db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(req.params.id, req.session.user.id);
  }
  const reaction = await getReactionSummary('post_id', req.params.id, myId);

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

  // ── SEO: per-article OG/Twitter/JSON-LD data ────────────────────────────────
  const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const _d = stripTags(post.excerpt || post.body);
  const metaDesc = _d ? (_d.length > 197 ? _d.slice(0, 197) + '…' : _d) : null;
  const _base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  const ogImage = post.cover_image
    ? (post.cover_image.startsWith('http') ? post.cover_image : _base + post.cover_image)
    : null;
  let publishedTime = null;
  try {
    const d = new Date(String(post.published_at || post.created_at || '').replace(' ', 'T') + 'Z');
    publishedTime = isNaN(d) ? null : d.toISOString();
  } catch (_) { publishedTime = null; }

  res.render('user/article-single', { post, author, comments, user, userBookmarked, reaction, REACTION_META, userLiked: !!reaction.mine, currentPath: '/articles', canonicalPath: `/articles/${post.id}`, metaDesc, ogImage, ogType: 'article', publishedTime, authorName: author.full_name });
});

// ── Edit article form ────────────────────────────────────────────────────────
router.get('/articles/:id/edit', ensureLoggedIn, async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles/' + req.params.id);
  res.render('user/article-form', { post, error: null, currentPath: '/articles' });
});

// ── Update article ───────────────────────────────────────────────────────────
router.post('/articles/:id/edit', ensureLoggedIn, withUpload(coverUpload), async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles/' + req.params.id);
  if (req.uploadError) return res.render('user/article-form', { post, error: req.uploadError, currentPath: '/articles' });
  const { title, body, excerpt, cover_image, tags, category } = req.body;
  // New upload wins; else keep the submitted URL; else keep the existing cover
  const cover = req.file ? (req.file.url || req.file.path) : (cover_image !== undefined ? (cover_image || null) : post.cover_image);
  await db.prepare('UPDATE posts SET title=?, body=?, excerpt=?, cover_image=?, tags=?, category=? WHERE id=?').run(title, body, excerpt || body.substring(0, 200), cover, tags || null, category || 'general', req.params.id);
  res.redirect('/articles/' + req.params.id);
});

// ── Delete article ───────────────────────────────────────────────────────────
router.post('/articles/:id/delete', ensureLoggedIn, async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/articles');
  await db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  await db.prepare('DELETE FROM comments WHERE post_id = ?').run(req.params.id);
  await db.prepare('DELETE FROM likes WHERE post_id = ?').run(req.params.id);
  res.redirect('/articles');
});

// ── Like / Unlike post (POST/DELETE) ─────────────────────────────────────────
async function toggleLike(req, res) {
  const back = req.get('Referrer') || '/';
  const postId = req.params.id;
  const userId = req.session.user.id;
  const existing = await db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND comment_id IS NULL').get(postId, userId);
  if (existing) {
    await db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    await db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ?').run(postId);
  } else {
    await db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    await db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
    // notify post author
    const post = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(postId);
    if (post && post.author_id !== userId) {
      await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
        post.author_id, 'like', 'নতুন লাইক', `${req.session.user.full_name} আপনার লেখা "${post.title}" লাইক করেছেন`, '/articles/' + postId
      );
    }
  }
  res.redirect(back);
}
router.post('/articles/:id/like', ensureLoggedIn, toggleLike);

// ── Bookmark ─────────────────────────────────────────────────────────────────
async function toggleBookmark(req, res) {
  const back = req.get('Referrer') || '/';
  const existing = await db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(req.params.id, req.session.user.id);
  if (existing) {
    await db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
  } else {
    await db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(req.session.user.id, req.params.id);
  }
  res.redirect(back);
}
router.post('/articles/:id/bookmark', ensureLoggedIn, toggleBookmark);

// ── Add comment ──────────────────────────────────────────────────────────────
router.post('/articles/:id/comment', ensureLoggedIn, async (req, res) => {
  const { body, parent_id } = req.body;
  if (!body || !body.trim()) return res.redirect('/articles/' + req.params.id);
  await db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id) VALUES (?, ?, ?, ?)').run(
    req.params.id, req.session.user.id, body.trim(), parent_id || null
  );
  await db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.id);
  // notify
  const post = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(req.params.id);
  if (post && post.author_id !== req.session.user.id) {
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      post.author_id, 'comment', 'নতুন মন্তব্য', `${req.session.user.full_name} আপনার লেখায় মন্তব্য করেছেন`, '/articles/' + req.params.id
    );
  }
  res.redirect('/articles/' + req.params.id + '#comments');
});

// ── Q&A list ─────────────────────────────────────────────────────────────────
router.get('/qa', async (req, res) => {
  const questions = await db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as ans_count
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.type = 'question' AND p.status = 'published'
    ORDER BY p.published_at DESC`).all();
  res.render('user/qa-list', { questions, currentPath: '/qa' });
});

// ── New question ─────────────────────────────────────────────────────────────
router.get(['/qa/new', '/questions/new'], ensureLoggedIn, async (req, res) => {
  res.render('user/qa-form', { post: null, error: null, currentPath: '/qa/new' });
});

router.post(['/qa/new', '/questions/new'], ensureLoggedIn, async (req, res) => {
  const { title, body, category, tags } = req.body;
  if (!title || !body) return res.render('user/qa-form', { post: req.body, error: 'শিরোনাম ও প্রশ্ন আবশ্যক', currentPath: '/qa/new' });
  const mentions = await extractMentions(body);
  const r = await db.prepare(`INSERT INTO posts (author_id, type, title, body, category, tags, mentions) VALUES (?, 'question', ?, ?, ?, ?, ?)`).run(req.session.user.id, title, body, category || 'general', tags || null, mentions);

  // Send notifications to mentioned users
  try {
    const mentioned = JSON.parse(mentions);
    const postId = r.lastInsertRowid;
    for (const m of mentioned) {
      if (m.id !== req.session.user.id) {
        await db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'mention', ?, ?, ?)`).run(
          m.id, 'ম্যানশন', req.session.user.full_name + ' আপনাকে একটি প্রশ্নে ম্যানশন করেছেন', '/qa/' + postId
        );
      }
    }
  } catch (e) {}

  res.redirect('/qa/' + r.lastInsertRowid);
});

// ── Edit question (GET) ─────────────────────────────────────────────────────
router.get('/qa/:id/edit', ensureLoggedIn, async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ? AND type = ?').get(req.params.id, 'question');
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/qa/' + req.params.id);
  res.render('user/qa-form', { post, error: null, currentPath: '/qa' });
});

// ── Update question (POST) ──────────────────────────────────────────────────
router.post('/qa/:id/edit', ensureLoggedIn, async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ? AND type = ?').get(req.params.id, 'question');
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/qa/' + req.params.id);
  const { title, body, category, tags } = req.body;
  if (!title || !body) return res.render('user/qa-form', { post, error: 'শিরোনাম ও প্রশ্ন আবশ্যক', currentPath: '/qa' });
  const mentions = await extractMentions(body);
  await db.prepare('UPDATE posts SET title=?, body=?, category=?, tags=?, mentions=? WHERE id=?').run(title, body, category || 'general', tags || null, mentions, req.params.id);
  res.redirect('/qa/' + req.params.id);
});

// ── Delete question ─────────────────────────────────────────────────────────
router.post('/qa/:id/delete', ensureLoggedIn, async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ? AND type = ?').get(req.params.id, 'question');
  if (!post || post.author_id !== req.session.user.id) return res.redirect('/qa');
  await db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  await db.prepare('DELETE FROM comments WHERE post_id = ?').run(req.params.id);
  await db.prepare('DELETE FROM likes WHERE post_id = ?').run(req.params.id);
  res.redirect('/qa');
});

// ── Question detail with answers ────────────────────────────────────────────
// BUGFIX: qa-list.ejs links every question to /questions/:id, but only the
// /qa/:id route existed → every question link on the site 404'd. Added the
// missing /questions/:id alias (also /questions/new already exists).
router.get(['/qa/:id', '/questions/:id'], async (req, res) => {
  const post = await db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender, u.designation
                           FROM posts p JOIN users u ON p.author_id = u.id
                           WHERE p.id = ? AND p.type = 'question' AND p.status = 'published'`).get(req.params.id);
  if (!post) return res.status(404).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
  const answers = await db.prepare(`SELECT c.*, u.full_name, u.username, u.avatar_url, u.gender
                              FROM comments c JOIN users u ON c.author_id = u.id
                              WHERE c.post_id = ? AND c.parent_id IS NULL
                              ORDER BY c.like_count DESC, c.created_at ASC`).all(req.params.id);
  const myId = req.session.user ? req.session.user.id : null;
  for (const a of answers) { a.reaction = await getReactionSummary('comment_id', a.id, myId); }
  const reaction = await getReactionSummary('post_id', req.params.id, myId);
  res.render('user/qa-single', { post, answers, reaction, REACTION_META, currentPath: '/qa' });
});

// ── Members directory ────────────────────────────────────────────────────────
router.get('/members', async (req, res) => {
  const search     = req.query.q    || '';
  const roleFilter = req.query.role || '';
  const deptFilter = req.query.dept || '';

  // Pull all active users to build the filter dropdowns AND the dept→raws reverse map
  const allUsers = await db.prepare('SELECT designation, role FROM users WHERE status = ?').all('active');

  // Unique roles — Bengali labels
  const roleMap = { user: 'ব্যবহারকারী', admin: 'অ্যাডমিন', moderator: 'মডারেটর' };
  const uniqueRoles = [...new Set(allUsers.map(u => u.role).filter(Boolean))].sort();

  // ── Department canonicalization ──
  // Decode any HTML entities (e.g. "&amp;") in the raw designation so "& journalism"
  // and "Communication &amp; Journalism" both produce the same key.
  const decode = s => s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  const norm = s => decode(s).split('(')[0].trim().replace(/\s+/g, ' ').toLowerCase();

  // Canonical map: variant → preferred label (Bengali where possible, else English)
  const CANON = {
    'accounting': 'হিসাববিজ্ঞান', 'a/counting': 'হিসাববিজ্ঞান', 'accounts': 'হিসাববিজ্ঞান',
    'anthropology': 'নৃবিজ্ঞান',
    'arabic': 'আরবি', 'arabic literature': 'আরবি',
    'bangla': 'বাংলা', 'bangladesh studies': 'বাংলাদেশ স্টাডিজ',
    'botany': 'উদ্ভিদবিজ্ঞান',
    'chemistry': 'রসায়ন',
    'communication & journalism': 'যোগাযোগ ও সাংবাদিকতা',
    'communication and journalism': 'যোগাযোগ ও সাংবাদিকতা',
    'criminology': 'ক্রিমিনোলজি', 'criminology and police science': 'ক্রিমিনোলজি',
    'economics': 'অর্থনীতি',
    'electrical and electronic engineering': 'তড়িৎ ও ইলেকট্রনিক প্রকৌশল',
    'electrical and electronics engineering': 'তড়িৎ ও ইলেকট্রনিক প্রকৌশল',
    'english': 'ইংরেজি', 'department of english': 'ইংরেজি', 'department of engllish': 'ইংরেজি',
    'englisg': 'ইংরেজি',
    'history': 'ইতিহাস',
    'islamic history and culture': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'islamic history & culture': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'islamic history and calture': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'islamic studies': 'ইসলামিক স্টাডিজ',
    'law': 'আইন',
    'management': 'ম্যানেজমেন্ট', 'human resources management': 'ম্যানেজমেন্ট',
    'marketing': 'মার্কেটিং',
    'mathematics': 'গণিত',
    'pali': 'পালি',
    'persian language and literature': 'ফারসি',
    'philosophy': 'দর্শন',
    'physical education and sports science': 'শারীরিক শিক্ষা',
    'political science': 'রাষ্ট্রবিজ্ঞান',
    'sanskrit': 'সংস্কৃত',
    'sociology': 'সমাজতত্ত্ব',
    'soil science': 'মৃত্তিকা বিজ্ঞান',
    'statistics': 'পরিসংখ্যান',
    'zoology': 'প্রাণিবিজ্ঞান',
    // Bengali variants → same Bengali canon
    'অর্থনীতি': 'অর্থনীতি',
    'অ্যারাবিক': 'আরবি', 'আরবি': 'আরবি', 'আরবী': 'আরবি', 'আরবি ভাষা ও সাহিত্য': 'আরবি',
    'আইইআর': 'আইইআর', 'ier': 'আইইআর',
    'ইনস্টিটিউট অব এডুকেশন অ্যান্ড রিসার্চ': 'আইইআর', 'institute of education and research': 'আইইআর',
    'আইন': 'আইন', 'আইন ও বিচার': 'আইন',
    'আধুনিক ভাষা ইনস্টিটিউট': 'আধুনিক ভাষা ইনস্টিটিউট',
    'আন্তর্জাতিক সম্পর্ক': 'আন্তর্জাতিক সম্পর্ক',
    'ইংরেজি': 'ইংরেজি',
    'ইতিহাস': 'ইতিহাস', 'ইতিহাস।': 'ইতিহাস',
    'ইসলামিক স্টাডিজ': 'ইসলামিক স্টাডিজ',
    'ইসলামের ইতিহাস ও সংস্কৃতি': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'ইসলামের ইতিহাস এবং সংস্কৃতি': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'ইসলামের ইতিহাসের ও সংস্কৃতি': 'ইসলামের ইতিহাস ও সংস্কৃতি',
    'উদ্ভিদবিজ্ঞান': 'উদ্ভিদবিজ্ঞান',
    'একাউন্টিং': 'হিসাববিজ্ঞান', 'হিসাববিজ্ঞান ও অ্যাকাউন্টিং': 'হিসাববিজ্ঞান',
    'কেমিস্ট্রি': 'রসায়ন', 'রসায়ন বিজ্ঞান': 'রসায়ন', 'ফলিত রসায়ন ও কেমিকৌশল': 'রসায়ন',
    'ক্রিমিনোলজি এন্ড পুলিশ সাইন্স': 'ক্রিমিনোলজি',
    'গণিত': 'গণিত',
    'চারুকলা': 'চারুকলা',
    'তথ্য ও যোগাযোগ প্রযুক্তি': 'তথ্য ও যোগাযোগ প্রযুক্তি',
    'দর্শন': 'দর্শন',
    'নাট্যকলা': 'নাট্যকলা',
    'পরিসংখ্যান': 'পরিসংখ্যান',
    'পালি': 'পালি', 'পালি ও বৌদ্ধ দর্শন': 'পালি',
    'পদার্থবিজ্ঞান': 'পদার্থবিজ্ঞান',
    'প্রাণিবিজ্ঞান': 'প্রাণিবিজ্ঞান',
    'বাংলা': 'বাংলা', 'বাংলা বিভাগ': 'বাংলা',
    'বাংলাদেশ স্টাডিজ': 'বাংলাদেশ স্টাডিজ',
    'ব্যাংকিং অ্যান্ড ইন্স্যুরেন্স': 'ব্যাংকিং ও বীমা',
    'মনোবিজ্ঞান': 'মনোবিজ্ঞান',
    'মার্কেটিং': 'মার্কেটিং',
    'মৃত্তিকা বিজ্ঞান': 'মৃত্তিকা বিজ্ঞান', 'মাটি ও পরিবেশ বিজ্ঞান': 'মৃত্তিকা বিজ্ঞান',
    'ম্যানেজমেন্ট': 'ম্যানেজমেন্ট',
    'যোগাযোগ ও সাংবাদিকতা': 'যোগাযোগ ও সাংবাদিকতা',
    'রাজনীতি বিজ্ঞান': 'রাষ্ট্রবিজ্ঞান', 'রাজনীতি বিজ্ঞান বিভাগ': 'রাষ্ট্রবিজ্ঞান',
    'পলিটিকাল সাইন্স': 'রাষ্ট্রবিজ্ঞান',
    'রাষ্ট্রবিজ্ঞান': 'রাষ্ট্রবিজ্ঞান',
    'লোকপ্রশাসন': 'লোকপ্রশাসন', 'লোক প্রশাসন': 'লোকপ্রশাসন',
    'সংস্কৃত': 'সংস্কৃত', 'সংস্কৃত বিভাগ': 'সংস্কৃত',
    'সমাজতত্ত্ব': 'সমাজতত্ত্ব',
    'ফাইন্যান্স': 'ফাইন্যান্স',
    'ফারসি ভাষা ও সাহিত্য': 'ফারসি',
    'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং': 'তড়িৎ ও ইলেকট্রনিক প্রকৌশল',
    'ইলেকট্রিক্যাল এন্ড ইলেকট্রনিকস ইঞ্জিনিয়ারং': 'তড়িৎ ও ইলেকট্রনিক প্রকৌশল',
    'কম্পিউটার বিজ্ঞান ও প্রকৌশল': 'কম্পিউটার বিজ্ঞান ও প্রকৌশল', 'cse': 'কম্পিউটার বিজ্ঞান ও প্রকৌশল',
    'শিক্ষা ও গবেষণা ইন্সটিটিউট': 'শিক্ষা ও গবেষণা ইন্সটিটিউট',
    'ifa': 'আইএফএ', 'iml': 'আইএমএল', 'ihc': 'আইএইচসি',
    'pll': 'পিএলএল',
  };

  // Committee role titles and noise — not departments
  const BLACKLIST = new Set([
    'সভাপতি', 'সাধারণ সম্পাদক', 'যুগ্ম সাধারণ সম্পাদক', 'কার্যনির্বাহী সদস্য',
    'অর্থ সম্পাদক', 'দপ্তর সম্পাদক', 'তথ্য ও প্রযুক্তি সম্পাদক',
    'প্রচার সম্পাদক', 'প্রশিক্ষণ বিষয়ক সম্পাদক',
    'সহ-দপ্তর সম্পাদক', 'সহ-সাংগঠনিক সম্পাদক',
    'সাংগঠনিক সম্পাদক', 'সাহিত্য ও প্রকাশনা সম্পাদক',
    'সম্পাদকীয় পর্ষদ সদস্য', 'সাহিত্যিক', 'মানবিক',
    'writer', 'user', 'users', 'department of arabic', 'department of bangla',
  ]);
  // Lowercase blacklist for case-insensitive matching
  const BLACKLIST_LO = new Set([...BLACKLIST].map(s => s.toLowerCase()));

  // Extract the raw department token from a designation
  // "কার্যনির্বাহী সদস্য — কম্পিউটার বিজ্ঞান" → "কম্পিউটার বিজ্ঞান"
  // "কম্পিউটার বিজ্ঞান" → "কম্পিউটার বিজ্ঞান"
  function extractRawDept(designation) {
    if (!designation) return null;
    const parts = designation.split(' — ');
    return (parts[parts.length - 1]).split('(')[0].trim() || null;
  }

  // Build a canon → set-of-raw-fragments reverse map. Used both for the dropdown
  // and for matching in the SQL filter.
  const canonToRaws = new Map();
  for (const u of allUsers) {
    const rawExtracted = extractRawDept(u.designation);
    if (!rawExtracted || rawExtracted.length < 2) continue;
    const decoded = decode(rawExtracted);
    if (BLACKLIST.has(decoded)) continue;
    const key = norm(decoded);
    if (BLACKLIST_LO.has(key)) continue;
    const canon = CANON[key] || CANON[decoded] || decoded;
    // If canon lands on a blacklist entry (e.g. 'user'), drop it
    if (BLACKLIST_LO.has(norm(canon))) continue;
    if (!canonToRaws.has(canon)) canonToRaws.set(canon, new Set());
    canonToRaws.get(canon).add(decoded);
  }
  const departments = [...canonToRaws.keys()]
    .filter(d => !BLACKLIST_LO.has(d.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'bn'));


  // ── Map each dept to a stable URL-safe slug so Bengali text never goes
  //    through URL encoding (which the browser/server mangles for `ী`/`ি` etc).
  const slugify = s => decodeURIComponent(escape(Buffer.from(s, 'utf8').toString('binary')))
    .replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase()
    || ('d' + [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0).toString(36));
  const slugToCanon = new Map();
  for (const d of departments) {
    const baseSlug = slugify(d);
    let slug = baseSlug, i = 2;
    while (slugToCanon.has(slug)) slug = baseSlug + '_' + (i++);
    slugToCanon.set(slug, d);
  }
  const selectedCanon = deptFilter && slugToCanon.has(deptFilter) ? slugToCanon.get(deptFilter) : null;

  // Now build the SQL query
  let q = 'SELECT id, username, full_name, designation, bio, avatar_url, gender, role, last_login, created_at FROM users WHERE status = ?';
  const params = ['active'];
  if (search)     { q += ' AND (full_name LIKE ? OR username LIKE ? OR designation LIKE ?)'; const t = '%' + search + '%'; params.push(t, t, t); }
  if (roleFilter) { q += ' AND role = ?'; params.push(roleFilter); }
  if (selectedCanon && canonToRaws.has(selectedCanon)) {
    const raws = [...canonToRaws.get(selectedCanon)];
    if (raws.length === 1) {
      q += ' AND designation LIKE ?';
      params.push('%' + raws[0] + '%');
    } else {
      const placeholders = raws.map(() => 'designation LIKE ?').join(' OR ');
      q += ' AND (' + placeholders + ')';
      raws.forEach(r => params.push('%' + r + '%'));
    }
  }
  q += ' ORDER BY full_name ASC';
  const members = await db.prepare(q).all(...params);

  // কার্যবর্ষ ম্যাপ (users → members টেবিল) — প্রত্যেক সদস্যের কার্ডে কার্যবর্ষ চিপ
  const termRows = await db.prepare('SELECT user_id, term_year FROM members WHERE user_id IS NOT NULL AND term_year IS NOT NULL').all();
  const termMap = {};
  for (const r of termRows) {
    if (!termMap[r.user_id]) termMap[r.user_id] = [];
    if (!termMap[r.user_id].includes(r.term_year)) termMap[r.user_id].push(r.term_year);
  }
  const bnTerm = (s) => parseInt(String(s || '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)), 10) || 0;
  for (const m of members) {
    m.terms = (termMap[m.id] || []).sort((a, b) => bnTerm(b) - bnTerm(a));
  }

  const totalUsers = (await db.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").get()).c;
  // পাবলিক হোম-সাইট পেজ (সোশ্যাল ফিড লেআউট নয় — ইউজারের অনুরোধ)
  res.render('lekhok-members', {
    layout: 'layout',
    pageTitle: 'সদস্য পরিচিতি',
    currentPath: '/members',
    members, search, totalUsers,
    departments, uniqueRoles, roleMap,
    deptSlugs: [...slugToCanon.keys()],
    slugToCanon,
    currentRole: roleFilter,
    currentDept: deptFilter
  });
});

// ── Public profile ───────────────────────────────────────────────────────────
router.get('/profile/:username', async (req, res) => {
  const profile = await db.prepare('SELECT * FROM users WHERE username = ? AND status != ?').get(req.params.username, 'banned');
  if (!profile) return res.status(404).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
  const isOwner = req.session.user && req.session.user.id === profile.id;
  const myId = req.session.user ? req.session.user.id : null;

  const articles = await db.prepare("SELECT * FROM posts WHERE author_id = ? AND type = 'article' AND status = 'published' ORDER BY published_at DESC LIMIT 20").all(profile.id);
  const questions = await db.prepare("SELECT * FROM posts WHERE author_id = ? AND type = 'question' AND status = 'published' ORDER BY published_at DESC LIMIT 20").all(profile.id);
  const drafts = isOwner
    ? await db.prepare("SELECT id, title, type, created_at, status FROM posts WHERE author_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 20").all(profile.id)
    : [];
  const myDaily = isOwner
    ? await db.prepare('SELECT id, content_type, title, scheduled_date, published FROM daily_content WHERE author_id = ? ORDER BY created_at DESC LIMIT 10').all(profile.id)
    : [];

  // Comments by this user (public context)
  const comments = await db.prepare(`
    SELECT c.id, c.body, c.created_at, p.id AS post_id, p.title AS post_title, p.type AS post_type
    FROM comments c JOIN posts p ON p.id = c.post_id
    WHERE c.author_id = ? ORDER BY c.created_at DESC LIMIT 30
  `).all(profile.id);

  // Reactions this user gave
  const reactions = await db.prepare(`
    SELECT l.reaction_type, l.created_at, p.id AS post_id, p.title, p.type AS post_type
    FROM likes l JOIN posts p ON p.id = l.post_id
    WHERE l.user_id = ? AND l.post_id IS NOT NULL ORDER BY l.created_at DESC LIMIT 30
  `).all(profile.id);

  // Bookmarks — owner only (private)
  const bookmarks = isOwner
    ? await db.prepare(`SELECT p.id, p.title, p.type, p.cover_image, b.created_at AS bookmarked_at
                  FROM bookmarks b JOIN posts p ON p.id = b.post_id
                  WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 30`).all(profile.id)
    : [];

  // Followers / Following lists (with follow-date)
  const followers = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, f.created_at AS since
    FROM follows f JOIN users u ON u.id = f.follower_id
    WHERE f.following_id = ? ORDER BY f.created_at DESC LIMIT 50
  `).all(profile.id);
  const followingList = await db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, f.created_at AS since
    FROM follows f JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = ? ORDER BY f.created_at DESC LIMIT 50
  `).all(profile.id);

  const followerCount = followers.length || (await db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(profile.id)).c;
  const followingCount = followingList.length || (await db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(profile.id)).c;
  const isFollowing = myId && !!await db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(myId, profile.id);
  const iBlockedHim = myId && !!await db.prepare('SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?').get(myId, profile.id);

  // Interests + tag pool (owner manages categories; visitors see them)
  let interests = [];
  try { interests = JSON.parse(profile.interests || '[]'); } catch (_) {}
  const tagPool = isOwner ? await getTagPool(24) : [];

  // সংগঠনে দায়িত্ব — committee posts held by this user (any term), newest term first
  const bnLead = (s) => parseInt(String(s || '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)), 10) || 0;
  const orgRoles = (await db.prepare(
    "SELECT role, term_year FROM members WHERE user_id = ? AND role IS NOT NULL AND role != ''"
  ).all(profile.id)).sort((a, b) => bnLead(b.term_year) - bnLead(a.term_year));

  res.render('user/profile', {
    profile,
    author: profile,
    posts: articles,
    questions, comments, reactions, bookmarks, drafts, myDaily,
    followers, following: followingList,
    interests, tagPool, orgRoles,
    postCount: articles.length,
    followerCount, followingCount,
    isOwner, isFollowing, iBlockedHim,
    REACTION_META,
    req,
    currentPath: '/profile/' + profile.username
  });
});

// ── Follow / Unfollow ────────────────────────────────────────────────────────
router.post('/profile/:username/follow', ensureLoggedIn, async (req, res) => {
  const back = req.get('Referrer') || ('/profile/' + req.params.username);
  const target = await db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target || target.id === req.session.user.id) return res.redirect(back);
  if (await isBlockedBetween(req.session.user.id, target.id)) {
    return res.redirect(back + (back.includes('?') ? '&' : '?') + 'err=blocked');
  }
  const existing = await db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.user.id, target.id);
  if (existing) {
    await db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
  } else {
    await db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.session.user.id, target.id);
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      target.id, 'follow', 'নতুন ফলোয়ার', `${req.session.user.full_name} আপনাকে ফলো করেছেন`, '/profile/' + req.params.username
    );
  }
  res.redirect(back);
});

// ── Generic API endpoints for the JS in views ───────────────────────────────
router.post('/api/like', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { id, type } = req.body; // type: 'post' or 'comment'
  const userId = req.session.user.id;
  if (type === 'comment') {
    const existing = await db.prepare('SELECT id FROM likes WHERE comment_id = ? AND user_id = ? AND post_id IS NULL').get(id, userId);
    if (existing) {
      await db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
      await db.prepare('UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(id);
    } else {
      await db.prepare('INSERT INTO likes (user_id, comment_id) VALUES (?, ?)').run(userId, id);
      await db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(id);
    }
    const c = await db.prepare('SELECT like_count FROM comments WHERE id = ?').get(id);
    return res.json({ count: c.like_count, liked: !existing });
  } else {
    const existing = await db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND comment_id IS NULL').get(id, userId);
    if (existing) {
      await db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
      await db.prepare('UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(id);
    } else {
      await db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, id);
      await db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(id);
      const post = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(id);
      if (post && post.author_id !== userId) {
        await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
          post.author_id, 'like', 'নতুন লাইক', `${req.session.user.full_name} আপনার লেখা "${post.title}" লাইক করেছেন`, '/articles/' + id
        );
      }
    }
    const p = await db.prepare('SELECT like_count FROM posts WHERE id = ?').get(id);
    return res.json({ count: p.like_count, liked: !existing });
  }
});

router.post('/api/bookmark', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { post_id } = req.body;
  const existing = await db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(post_id, req.session.user.id);
  if (existing) {
    await db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
    return res.json({ saved: false });
  } else {
    await db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(req.session.user.id, post_id);
    return res.json({ saved: true });
  }
});

router.post('/api/comment', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const { post_id, body, parent_id } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'empty' });
  const ins = await db.prepare('INSERT INTO comments (post_id, author_id, body, parent_id) VALUES (?, ?, ?, ?)').run(
    post_id, req.session.user.id, body.trim(), parent_id || null
  );
  await db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(post_id);
  const post = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(post_id);
  if (post && post.author_id !== req.session.user.id) {
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      post.author_id, 'comment', 'নতুন মন্তব্য', `${req.session.user.full_name} আপনার লেখায় মন্তব্য করেছেন`, '/articles/' + post_id
    );
  }
  // Return the new comment id so callers (inline reply UI, tests) can chain
  // follow-ups like /api/comment with parent_id.
  res.json({ ok: true, id: Number(ins.lastInsertRowid) });
});

router.post('/follow/:userId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  const targetId = parseInt(req.params.userId, 10);
  // Guard: non-numeric or unknown targets previously crashed with a 500
  // (sql.js rejects NaN binds) — reply 404 instead, like other user routes.
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(404).json({ error: 'not_found' });
  }
  const targetExists = await db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!targetExists) return res.status(404).json({ error: 'not_found' });
  if (targetId === req.session.user.id) return res.json({ following: false });
  if (await isBlockedBetween(req.session.user.id, targetId)) return res.status(403).json({ error: 'blocked' });
  const existing = await db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.user.id, targetId);
  if (existing) {
    await db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
    return res.json({ following: false });
  } else {
    await db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.session.user.id, targetId);
    const target = await db.prepare('SELECT username FROM users WHERE id = ?').get(targetId);
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      targetId, 'follow', 'নতুন ফলোয়ার', `${req.session.user.full_name} আপনাকে ফলো করেছেন`, '/profile/' + (target?.username || '')
    );
    return res.json({ following: true });
  }
});

router.get('/api/notifications/count', async (req, res) => {
  if (!req.session.user) return res.json({ unread: 0 });
  const r = await db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.session.user.id);
  res.json({ unread: r.c });
});

router.post('/api/notifications/read/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login' });
  await db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.session.user.id);
  res.json({ ok: true });
});

router.get('/notifications/mark-all-read', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  await db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.session.user.id);
  res.redirect('/notifications');
});

router.get('/bookmarks', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const items = await db.prepare(`SELECT p.*, u.full_name, u.username, u.avatar_url, u.gender
    FROM bookmarks b JOIN posts p ON b.post_id = p.id JOIN users u ON p.author_id = u.id
    WHERE b.user_id = ? AND p.status = 'published' ORDER BY b.created_at DESC`).all(req.session.user.id);
  res.render('user/articles', { posts: items, articles: items, tag: null, currentPath: '/bookmarks' });
});

// ── API: Notifications ───────────────────────────────────────────────────────
router.get('/api/notifications', async (req, res) => {
  if (!req.session.user) return res.json([]);
  const notifications = await db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.session.user.id);
  res.json(notifications);
});

router.post('/api/notifications/read', async (req, res) => {
  if (!req.session.user) return res.json({ error: 'unauthorized' });
  await db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.session.user.id);
  res.json({ success: true });
});

// ────────────────────────────────────────────────────────────────────────────
// /me — Personal feed (control center for logged-in user)
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;

  // My published posts (articles + Q&A)
  const myPosts = await db.prepare(`
    SELECT id, type, title, body, excerpt, cover_image, like_count, comment_count, view_count,
           published_at, created_at, status, featured
    FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(me.id);

  // My drafts
  const myDrafts = await db.prepare(`
    SELECT id, type, title, body, created_at, status
    FROM posts WHERE author_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 20
  `).all(me.id);

  // My recent comments
  const myComments = await db.prepare(`
    SELECT c.id, c.body, c.created_at, c.like_count,
           p.id AS post_id, p.title AS post_title, p.type AS post_type
    FROM comments c JOIN posts p ON p.id = c.post_id
    WHERE c.author_id = ? ORDER BY c.created_at DESC LIMIT 30
  `).all(me.id);

  // My reactions
  const myReactions = await db.prepare(`
    SELECT l.post_id, COALESCE(l.reaction_type, 'like') AS reaction_type, l.created_at,
           p.title, p.type AS post_type, p.cover_image
    FROM likes l JOIN posts p ON p.id = l.post_id
    WHERE l.user_id = ? AND l.post_id IS NOT NULL ORDER BY l.created_at DESC LIMIT 30
  `).all(me.id);

  // My bookmarks
  const myBookmarks = await db.prepare(`
    SELECT p.id, p.title, p.body, p.cover_image, p.type, p.like_count, p.comment_count,
           b.created_at AS bookmarked_at
    FROM bookmarks b JOIN posts p ON p.id = b.post_id
    WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 30
  `).all(me.id);

  // Following — users + their recent activity
  const following = await db.prepare(`
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
    followers:   (await db.prepare('SELECT COUNT(*) AS c FROM follows WHERE following_id = ?').get(me.id)).c
  };

  // Chronological activity feed (posted / commented / reacted / bookmarked)
  const activity = [
    ...myPosts.filter(p => p.status !== 'draft').map(p => ({ kind: 'posted', at: p.created_at, id: p.id, title: p.title, type: p.type })),
    ...myComments.map(c => ({ kind: 'commented', at: c.created_at, id: c.post_id, title: c.post_title, type: c.post_type, body: c.body })),
    ...myReactions.map(r => ({ kind: 'reacted', at: r.created_at, id: r.post_id, title: r.title, type: r.post_type, reaction: r.reaction_type })),
    ...myBookmarks.map(b => ({ kind: 'bookmarked', at: b.bookmarked_at, id: b.id, title: b.title, type: b.type }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 40);

  // Interests (my categories) + tag pool for the picker
  let myInterests = [];
  try { myInterests = JSON.parse(await db.prepare('SELECT interests FROM users WHERE id = ?').get(me.id)?.interests || '[]'); } catch (_) {}
  const tagPool = await getTagPool(24);

  res.render('user/me', { myPosts, myDrafts, myComments, myReactions, myBookmarks, following, stats, activity, myInterests, tagPool, REACTION_META, currentPath: '/me' });
});

// ────────────────────────────────────────────────────────────────────────────
// /settings — full settings page (profile, privacy, notifications, account, display, connected)
// ────────────────────────────────────────────────────────────────────────────
router.get('/settings', ensureLoggedIn, async (req, res) => {
  const me = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  let notifyPrefs = {}, displayPrefs = {};
  try { notifyPrefs = JSON.parse(me.notify_prefs || '{}'); } catch (_) {}
  try { displayPrefs = JSON.parse(me.display_prefs || '{}'); } catch (_) {}
  res.render('user/settings', {
    currentPath: '/settings',
    profileUser: me,
    notifyPrefs, displayPrefs,
    ok: req.query.ok || null, err: req.query.err || null
  });
});

router.post('/settings/profile', ensureLoggedIn, withUpload(coverUpload), async (req, res) => {
  const me = req.session.user;
  const { full_name, bio, designation, address, gender, birth_date, social_fb, social_twitter, social_linkedin, social_website } = req.body;
  await db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      bio = ?, designation = ?, address = ?,
      gender = COALESCE(?, gender),
      birth_date = ?,
      social_fb = ?, social_twitter = ?, social_linkedin = ?, social_website = ?
    WHERE id = ?
  `).run(full_name ?? null, bio || null, designation || null, address || null, gender ?? null, birth_date || null,
         social_fb || null, social_twitter || null, social_linkedin || null, social_website || null, me.id);
  // Refresh session
  const fresh = await db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
  req.session.user = fresh;
  res.redirect('/settings?ok=profile');
});

// ── Avatar upload (quick change from profile) ────────────────────────────────
router.post('/settings/avatar', ensureLoggedIn, withUpload(avatarUpload), async (req, res) => {
  const me = req.session.user;
  if (req.uploadError) {
    console.error('[avatar] upload error:', req.uploadError);
    return res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=' + encodeURIComponent(req.uploadError));
  }
  if (!req.file) {
    return res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=no_file');
  }
  const avatarUrl = req.file.url || req.file.path;
  try {
    await db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, me.id);
    // Refresh session user from DB
    const fresh = await db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
    if (fresh) req.session.user = { id: fresh.id, username: fresh.username, full_name: fresh.full_name, avatar_url: fresh.avatar_url, gender: fresh.gender, role: fresh.role || 'user' };
    res.redirect('/profile/' + encodeURIComponent(me.username) + '?ok=avatar');
  } catch(e) {
    console.error('[avatar] save error:', e);
    res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=db');
  }
});

// ── Cover photo upload ──────────────────────────────────────────────────────
router.post('/settings/cover', ensureLoggedIn, withUpload(coverUpload), async (req, res) => {
  const me = req.session.user;
  if (req.uploadError) {
    return res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=' + encodeURIComponent(req.uploadError));
  }
  if (!req.file) {
    return res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=no_file');
  }
  const coverUrl = req.file.url || req.file.path;
  try {
    await db.prepare('ALTER TABLE users ADD COLUMN cover_url TEXT').run();
  } catch(e) {}
  try {
    await db.prepare('UPDATE users SET cover_url = ? WHERE id = ?').run(coverUrl, me.id);
    res.redirect('/profile/' + encodeURIComponent(me.username) + '?ok=cover');
  } catch(e) {
    console.error('[cover] save error:', e);
    res.redirect('/profile/' + encodeURIComponent(me.username) + '?err=db');
  }
});

router.post('/settings/privacy', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const { show_email, show_phone, show_birth } = req.body;
  await db.prepare('UPDATE users SET show_email = ?, show_phone = ?, show_birth = ? WHERE id = ?')
    .run(show_email === '1' ? 1 : 0, show_phone === '1' ? 1 : 0, show_birth === '1' ? 1 : 0, me.id);
  res.redirect('/settings?ok=privacy');
});

router.post('/settings/notifications', ensureLoggedIn, async (req, res) => {
  // Stored in user_settings (light key-value); for now we use a JSON column on users.
  // If the column doesn't exist, ignore. Migration adds it safely.
  const me = req.session.user;
  try {
    await db.exec("ALTER TABLE users ADD COLUMN notify_prefs TEXT DEFAULT '{}'");
  } catch (_) {}
  const prefs = {
    email_mention: req.body.email_mention === '1',
    email_comment: req.body.email_comment === '1',
    push_like:     req.body.push_like === '1',
    daily_digest:  req.body.daily_digest === '1'
  };
  await db.prepare('UPDATE users SET notify_prefs = ? WHERE id = ?').run(JSON.stringify(prefs), me.id);
  res.redirect('/settings?ok=notifications');
});

router.post('/settings/account/password', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const { current_password, new_password, confirm_password } = req.body;
  if (new_password !== confirm_password) return res.redirect('/settings?err=password_mismatch');
  if (new_password.length < 6) return res.redirect('/settings?err=password_short');
  const row = await db.prepare('SELECT password_hash FROM users WHERE id = ?').get(me.id);
  if (!bcrypt.compareSync(current_password || '', row.password_hash)) {
    return res.redirect('/settings?err=password_wrong');
  }
  const newHash = bcrypt.hashSync(new_password, 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, me.id);
  res.redirect('/settings?ok=password');
});

router.post('/settings/account/deactivate', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  await db.prepare("UPDATE users SET status = 'inactive' WHERE id = ?").run(me.id);
  req.session.destroy(() => res.redirect('/'));
});

router.post('/settings/display', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const { theme, font_size, language, font_family } = req.body;
  try {
    await db.exec("ALTER TABLE users ADD COLUMN display_prefs TEXT DEFAULT '{}'");
  } catch (_) {}
  const ALLOWED_FONT = ['bn', 'serif', 'sans', 'mixed', 'hand', 'display', 'durnibar', 'lipi'];
  const prefs = {
    theme:       theme       || 'auto',
    font_size:   font_size   || 'medium',
    language:    language    || 'bn',
    font_family: ALLOWED_FONT.includes(font_family) ? font_family : 'bn',
  };
  await db.prepare('UPDATE users SET display_prefs = ? WHERE id = ?').run(JSON.stringify(prefs), me.id);
  res.redirect('/settings?ok=display');
});

// ────────────────────────────────────────────────────────────────────────────
router.post('/api/react', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const { target_id, target_type, reaction_type } = req.body;
  const ALLOWED = ['like', 'love', 'haha', 'wow', 'sad'];
  if (!ALLOWED.includes(reaction_type)) return res.status(400).json({ error: 'invalid reaction' });
  if (!['post', 'comment'].includes(target_type)) return res.status(400).json({ error: 'invalid target_type' });

  // Schema: likes has columns (id, user_id, post_id, comment_id, created_at)
  // For backward compat: post_id=target_id when type=post, comment_id=target_id when type=comment
  if (target_type === 'post') {
    const existing = await db.prepare('SELECT id, reaction_type FROM likes WHERE user_id = ? AND post_id = ?').get(me.id, target_id);
    if (existing && existing.reaction_type === reaction_type) {
      await db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    } else if (existing) {
      try { await db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      await db.prepare('UPDATE likes SET reaction_type = ? WHERE id = ?').run(reaction_type, existing.id);
    } else {
      try { await db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      await db.prepare('INSERT INTO likes (user_id, post_id, reaction_type) VALUES (?, ?, ?)').run(me.id, target_id, reaction_type);
      // Notify post author (debounced — only for love/haha/wow)
      if (['love', 'haha', 'wow'].includes(reaction_type)) {
        const post = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(target_id);
        if (post && post.author_id !== me.id) {
          const labels = { love: '❤️ ভালোবাসা', haha: '😂 হাসি', wow: '😮 বিস্ময়' };
          await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
            .run(post.author_id, 'reaction', labels[reaction_type] || 'প্রতিক্রিয়া',
                 me.full_name + ' আপনার পোস্টে প্রতিক্রিয়া জানিয়েছেন', '/articles/' + target_id);
        }
      }
    }
    // Recompute like_count and store reactions JSON
    const counts = await db.prepare(`
      SELECT reaction_type, COUNT(*) AS c FROM likes WHERE post_id = ? GROUP BY reaction_type
    `).all(target_id);
    const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
    counts.forEach(r => { reactions[r.reaction_type || 'like'] = r.c; });
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    try { await db.exec("ALTER TABLE posts ADD COLUMN reactions TEXT DEFAULT '{}'"); } catch (_) {}
    await db.prepare('UPDATE posts SET like_count = ?, reactions = ? WHERE id = ?').run(total, JSON.stringify(reactions), target_id);
    res.json({ ok: true, reactions, total, mine: existing ? (existing.reaction_type === reaction_type ? null : reaction_type) : reaction_type });
  } else {
    // comment
    const existing = await db.prepare('SELECT id, reaction_type FROM likes WHERE user_id = ? AND comment_id = ?').get(me.id, target_id);
    if (existing && existing.reaction_type === reaction_type) {
      await db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    } else if (existing) {
      try { await db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      await db.prepare('UPDATE likes SET reaction_type = ? WHERE id = ?').run(reaction_type, existing.id);
    } else {
      try { await db.exec("ALTER TABLE likes ADD COLUMN reaction_type TEXT DEFAULT 'like'"); } catch (_) {}
      await db.prepare('INSERT INTO likes (user_id, comment_id, reaction_type) VALUES (?, ?, ?)').run(me.id, target_id, reaction_type);
    }
    const counts = await db.prepare(`
      SELECT reaction_type, COUNT(*) AS c FROM likes WHERE comment_id = ? GROUP BY reaction_type
    `).all(target_id);
    const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
    counts.forEach(r => { reactions[r.reaction_type || 'like'] = r.c; });
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    try { await db.exec("ALTER TABLE comments ADD COLUMN reactions TEXT DEFAULT '{}'"); } catch (_) {}
    await db.prepare('UPDATE comments SET like_count = ?, reactions = ? WHERE id = ?').run(total, JSON.stringify(reactions), target_id);
    res.json({ ok: true, reactions, total, mine: existing ? (existing.reaction_type === reaction_type ? null : reaction_type) : reaction_type });
  }
});

// Get reactions for a post (for initial render)
router.get('/api/reactions/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  if (!['post', 'comment'].includes(type)) return res.status(400).json({ error: 'invalid' });
  const col = type === 'post' ? 'post_id' : 'comment_id';
  const rows = await db.prepare(`SELECT user_id, reaction_type FROM likes WHERE ${col} = ?`).all(id);
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0 };
  rows.forEach(r => { counts[r.reaction_type || 'like'] = (counts[r.reaction_type || 'like'] || 0) + 1; });
  const mine = req.session.user ? (rows.find(r => r.user_id === req.session.user.id) || null) : null;
  res.json({ counts, total: rows.length, mine: mine ? (mine.reaction_type || 'like') : null });
});

// ────────────────────────────────────────────────────────────────────────────
// /api/share-to-user — share a post to another user via DM
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/share-to-user', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const { to_username, post_id, message } = req.body;
  const other = await db.prepare('SELECT * FROM users WHERE username = ?').get(to_username);
  if (!other) return res.status(404).json({ error: 'user not found' });
  if (other.id === me.id) return res.status(400).json({ error: 'self' });
  if (await isBlockedBetween(me.id, other.id)) return res.status(403).json({ error: 'blocked' });
  let conv = await db.prepare('SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
    .get(me.id, other.id, other.id, me.id);
  if (!conv) {
    const a = Math.min(me.id, other.id), b = Math.max(me.id, other.id);
    const r = await db.prepare('INSERT INTO conversations (user_a, user_b) VALUES (?, ?)').run(a, b);
    conv = { id: r.lastInsertRowid };
  }
  const post = await db.prepare('SELECT title, type FROM posts WHERE id = ?').get(post_id);
  const link = post && post.type === 'question' ? '/qa/' + post_id : '/articles/' + post_id;
  const body = (message || '') + (post ? '\n\n— শেয়ার: ' + post.title + ' (' + link + ')' : '');
  await db.prepare('INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)')
    .run(conv.id, me.id, body.trim());
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conv.id);
  res.json({ ok: true, redirect: '/messages/' + other.username });
});

// ────────────────────────────────────────────────────────────────────────────
// /qa/:id/answer — fix broken Q&A answer form
// ────────────────────────────────────────────────────────────────────────────
router.post('/qa/:id/answer', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const qid = parseInt(req.params.id);
  const { body } = req.body;
  if (!body || !body.trim()) return res.redirect('/qa/' + qid + '?err=empty');
  const r = await db.prepare('INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)').run(qid, me.id, body.trim());
  await db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(qid);
  // Notify question author
  const q = await db.prepare('SELECT author_id, title FROM posts WHERE id = ?').get(qid);
  if (q && q.author_id !== me.id) {
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
      .run(q.author_id, 'comment', 'নতুন উত্তর', me.full_name + ' আপনার প্রশ্নে উত্তর দিয়েছেন', '/qa/' + qid);
  }
  res.redirect('/qa/' + qid + '#answer-' + r.lastInsertRowid);
});

// ────────────────────────────────────────────────────────────────────────────
// /api/users/search — user search (share-to-user modal, messenger)
// ────────────────────────────────────────────────────────────────────────────
router.get('/api/users/search', ensureLoggedIn, async (req, res) => {
  const me = req.session.user.id;
  const q = String(req.query.q || '').trim();
  if (q.length < 1) return res.json({ users: [] });
  const like = '%' + q + '%';
  const start = q + '%';
  // Prefix-match ranks first; excludes the caller and banned accounts;
  // designation powers the messenger search UI's subtitle row.
  const users = await db.prepare(`
    SELECT id, username, full_name, designation, avatar_url
    FROM users
    WHERE status != 'banned' AND id != ? AND (
      full_name LIKE ? COLLATE NOCASE OR
      username   LIKE ? COLLATE NOCASE OR
      full_name LIKE ? COLLATE NOCASE
    )
    ORDER BY
      CASE WHEN full_name LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END,
      full_name
    LIMIT 15
  `).all(me, start, start, like, start);
  res.json({ users });
});

// ────────────────────────────────────────────────────────────────────────────
// /api/me/interests — save my categories (article interests)
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/me/interests', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  let tags = req.body.tags;
  if (typeof tags === 'string') tags = tags.split(',');
  if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be an array' });
  const clean = [...new Set(tags.map(t => String(t).trim()).filter(Boolean))].slice(0, 20);
  await db.prepare('UPDATE users SET interests = ? WHERE id = ?').run(JSON.stringify(clean), me.id);
  res.json({ ok: true, interests: clean });
});

// ────────────────────────────────────────────────────────────────────────────
// /api/followers/:userId/remove — remove one of MY followers
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/followers/:userId/remove', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const followerId = parseInt(req.params.userId, 10);
  const r = await db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, me.id);
  res.json({ ok: true, removed: r.changes > 0 });
});

// ────────────────────────────────────────────────────────────────────────────
// /api/block/:userId — toggle block (blocks follow, messages, share both ways)
// ────────────────────────────────────────────────────────────────────────────
router.post('/api/block/:userId', ensureLoggedIn, async (req, res) => {
  const me = req.session.user;
  const otherId = parseInt(req.params.userId, 10);
  if (!otherId || otherId === me.id) return res.status(400).json({ error: 'invalid' });
  const existing = await db.prepare('SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?').get(me.id, otherId);
  if (existing) {
    await db.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?').run(me.id, otherId);
    // Unblock also restores the follow relationship if it existed
    return res.json({ ok: true, blocked: false });
  }
  await db.prepare('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(me.id, otherId);
  // Blocking removes both directions of follow + cleans their messages' future path
  await db.prepare('DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)')
    .run(me.id, otherId, otherId, me.id);
  return res.json({ ok: true, blocked: true });
});

module.exports = router;
