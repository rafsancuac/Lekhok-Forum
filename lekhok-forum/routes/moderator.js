const express = require('express');
const router = express.Router();
const db = require('../db');
const { broadcastToAll } = require('./dashboard');
const { notifyUser } = require('../helpers/notify'); // সেশন ৯০: তদারকি-বিজ্ঞপ্তি
const { validateNavJson, parseNav } = require('../helpers/nav');
const { pressUpload, withUpload, resourceUpload } = require('../middleware/upload');
const { plainText: mdPlain85 } = require('../helpers/markdown-lite'); // সেশন ৮৫: এক্সসার্পট-স্ট্রিপ

// সেশন ৪৪: পারমিশন-ত্রুটিতে আগে `404` টেমপ্লেট রেন্ডার হতো — সেভ/এডিটের পর
// রিডাইরেক্টে ভুল স্কোপ/রোল পেলে ইউজার "ভুল ৪০৪ পেজ" দেখত। এখন সঠিক "অনুমতি নেই"
// পেজ দেখাই (admin/denied), ৪০৪ নয়।
function ensureModerator(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.session.user.role !== 'moderator' && req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
    return res.status(403).render('admin/denied', { currentPath: '/moderator', homePath: '/moderator' });
  }
  next();
}

function requireScope(scope) {
  return async (req, res, next) => {
    if (req.session.user.role === 'admin' || req.session.user.role === 'superadmin') return next(); // admin/superadmin implicitly has every scope
    if (!(await db.hasScope(req.session.user.id, scope))) {
      return res.status(403).render('admin/denied', { currentPath: '/moderator', homePath: '/moderator' });
    }
    next();
  };
}

function today() { return new Date().toISOString().split('T')[0]; }

// ── সেশন ৪৭: মডারেটর প্যানেলেও স্কোপ-মেটা (সাইডবার ব্যাজ + লিংক-গেটিং) ─────
// আগে userScopeMeta শুধু /admin রাউটার সেট করত — মডারেটর প্যানেলে সাইডবারের
// স্কোপ-ব্যাজ ও স্কোপ-ভিত্তিক লিংক-লুকানো কাজ করত না। এখন এখানেও সেট হয়।
router.use(async (req, res, next) => {
  try {
    const u = req.session && req.session.user;
    if (u && (u.role === 'admin' || u.role === 'superadmin')) {
      res.locals.userScopeMeta = db.MODERATOR_SCOPES.map(s => ({ key: s.key, label: s.label }));
    } else if (u && u.role === 'moderator') {
      const sc = await db.getModeratorScopes(u.id);
      res.locals.userScopeMeta = db.MODERATOR_SCOPES.filter(s => (sc || []).includes(s.key));
    }
  } catch (e) {}
  next();
});

// ── Site menu management (admin + moderators) ────────────────────────────────
router.get('/navigation', ensureModerator, async (req, res) => {
  const settings = await db.getSettingsAll();
  res.render('user/moderator-navigation', {
    navConfig: parseNav(settings['nav_json']),
    success: req.query.saved ? 'মেনু সংরক্ষিত হয়েছে — সাইটে সাথে সাথে প্রযোজ্য' : null,
    error: null,
    currentPath: '/moderator/navigation'
  });
});

router.post('/navigation', ensureModerator, async (req, res) => {
  if (req.body.reset) {
    await db.setSetting('nav_json', '');
    return res.redirect('/moderator/navigation?saved=1');
  }
  const v = validateNavJson(req.body.nav_json);
  if (!v.ok) {
    const settings = await db.getSettingsAll();
    return res.status(400).render('user/moderator-navigation', {
      navConfig: parseNav(settings['nav_json']),
      success: null,
      error: v.error,
      currentPath: '/moderator/navigation'
    });
  }
  await db.setSetting('nav_json', v.nav.length ? JSON.stringify(v.nav) : '');
  res.redirect('/moderator/navigation?saved=1');
});

// ── Committee members management (admin + moderators) ────────────────────────
// Drives /committee (member_type='central') and /committee/advisory
// (member_type='advisory') public pages. Each row carries কার্যবর্ষ (term_year).
const MEMBER_TYPES = ['central', 'advisory'];

async function resolveMemberUserId(username) {
  const uname = String(username || '').trim();
  if (!uname) return null;
  const u = await db.prepare('SELECT id FROM users WHERE username = ?').get(uname);
  return u ? u.id : null;
}

function memberFormValues(b) {
  return {
    name: String(b.name || '').trim().slice(0, 120),
    role: String(b.role || '').trim().slice(0, 120),
    designation: String(b.designation || '').trim().slice(0, 160),
    bio: String(b.bio || '').trim().slice(0, 1200),
    image_url: String(b.image_url || '').trim().slice(0, 400),
    social_fb: String(b.social_fb || '').trim().slice(0, 300),
    social_email: String(b.social_email || '').trim().slice(0, 160),
    member_type: MEMBER_TYPES.includes(b.member_type) ? b.member_type : 'central',
    term_year: String(b.term_year || '').trim().slice(0, 40),
    sort_order: Math.max(0, parseInt(b.sort_order, 10) || 0)
  };
}

// টাস্ক ১৩ (পর্ব ৪, অংশ ক): ফর্ম থেকে images (JSON স্ট্রিং) → URL অ্যারে
function parseImages(v) {
  if (Array.isArray(v)) return v.filter(x => x && String(x).trim());
  if (typeof v === 'string' && v.trim()) {
    try { const a = JSON.parse(v); if (Array.isArray(a)) return a.filter(x => x && String(x).trim()); } catch (e) {}
  }
  return [];
}

// টাস্ক ১২ (পর্ব ৩, অংশ খ): কেন্দ্রীয় কমিটিতে "উপদেষ্টা" role নিষিদ্ধ —
// উপদেষ্টারা কেবল উপদেষ্টা পরিষদ (advisory) টাইপে থাকবেন (ব্যাকএন্ড গার্ড)।
function advisorRoleError(v) {
  if (v.member_type === 'central' && /উপদেষ্টা/.test(v.role)) {
    return 'কেন্দ্রীয় কমিটিতে "উপদেষ্টা" পদ রাখা যাবে না — উপদেষ্টারা "উপদেষ্টা পরিষদ" ধরনে যোগ করুন।';
  }
  return null;
}

router.get('/members', ensureModerator, async (req, res) => {
  const members = await db.prepare(`
    SELECT m.*, u.username AS user_username
    FROM members m LEFT JOIN users u ON u.id = m.user_id
    ORDER BY CASE m.member_type WHEN 'central' THEN 0 ELSE 1 END, m.sort_order ASC, m.id ASC
  `).all();
  res.render('user/moderator-members', {
    members,
    posted: req.query.posted || null,
    removed: req.query.removed || null,
    error: req.query.error || null,
    currentPath: '/moderator/members'
  });
});

router.post('/members', ensureModerator, async (req, res) => {
  const v = memberFormValues(req.body);
  if (!v.name) return res.redirect('/moderator/members?error=' + encodeURIComponent('নাম আবশ্যক — সদস্য যোগ হয়নি।'));
  const roleErr = advisorRoleError(v);
  if (roleErr) return res.redirect('/moderator/members?error=' + encodeURIComponent(roleErr));
  const user_id = await resolveMemberUserId(req.body.username);
  try {
    await db.prepare(`
      INSERT INTO members (name, role, designation, bio, image_url, social_fb, social_email, member_type, sort_order, term_year, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(v.name, v.role, v.designation, v.bio, v.image_url, v.social_fb, v.social_email,
           v.member_type, v.sort_order, v.term_year || null, user_id);
  } catch (e) {
    if (String(e.message || '').includes('idx_members_unique_name_term')) {
      return res.redirect('/moderator/members?error=' + encodeURIComponent('এই নাম, কার্যবর্ষ ও ধরনের সদস্য ইতিমধ্যেই আছে — কার্যবর্ষ বদলে দিন বা বিদ্যমান সদস্য সম্পাদনা করুন।'));
    }
    throw e;
  }
  res.redirect('/moderator/members?posted=1');
});

router.post('/members/:id', ensureModerator, async (req, res) => {
  const row = await db.prepare('SELECT id FROM members WHERE id = ?').get(req.params.id);
  if (!row) return res.redirect('/moderator/members?error=' + encodeURIComponent('সদস্যটি খুঁজে পাওয়া যায়নি।'));
  const v = memberFormValues(req.body);
  if (!v.name) return res.redirect('/moderator/members?error=' + encodeURIComponent('নাম আবশ্যক — পরিবর্তন সংরক্ষিত হয়নি।'));
  const roleErr = advisorRoleError(v);
  if (roleErr) return res.redirect('/moderator/members?error=' + encodeURIComponent(roleErr));
  const user_id = await resolveMemberUserId(req.body.username);
  try {
    await db.prepare(`
      UPDATE members SET name = ?, role = ?, designation = ?, bio = ?, image_url = ?,
        social_fb = ?, social_email = ?, member_type = ?, sort_order = ?, term_year = ?, user_id = ?
      WHERE id = ?
    `).run(v.name, v.role, v.designation, v.bio, v.image_url, v.social_fb, v.social_email,
           v.member_type, v.sort_order, v.term_year || null, user_id, req.params.id);
  } catch (e) {
    if (String(e.message || '').includes('idx_members_unique_name_term')) {
      return res.redirect('/moderator/members?error=' + encodeURIComponent('এই নাম, কার্যবর্ষ ও ধরনের আরেকজন সদস্য আছে — নাম বা কার্যবর্ষ আলাদা করুন।'));
    }
    throw e;
  }
  res.redirect('/moderator/members?posted=1');
});

router.post('/members/:id/delete', ensureModerator, async (req, res) => {
  const tid42 = await TA42.trashDelete(db, 'members', req.params.id, req);
  await TA42.audit(db, req, 'delete', 'members', req.params.id, '');
  res.redirect('/moderator/members?removed=1&trashed=' + tid42);
});

// ── Press clippings management (admin + moderators) ─────────────────────────
// Drives the পত্রিকায় আমাদের নিউজ grid on /about (first 4) and the full
// /press page. Image can be uploaded (auto-WebP) or given as a URL.
function pressFormValues(b) {
  return {
    title: String(b.title || '').trim().slice(0, 200),
    paper_name: String(b.paper_name || '').trim().slice(0, 120),
    image_url: String(b.image_url || '').trim().slice(0, 600),
    published_date: String(b.published_date || '').trim().slice(0, 40) || null,
    sort_order: Math.max(0, parseInt(b.sort_order, 10) || 0),
    is_active: b.is_active === '0' ? 0 : 1
  };
}

router.get('/press', ensureModerator, requireScope('epaper'), async (req, res) => {
  const clips = await db.prepare(
    'SELECT * FROM press_clippings ORDER BY sort_order ASC, id DESC'
  ).all();
  for (const c of clips) {
    c._images = (await db.getPostImages('news', c.id)).map(i => i.image_url);
  }
  res.render('user/moderator-press', {
    clips,
    posted: req.query.posted || null,
    removed: req.query.removed || null,
    error: req.query.error || null,
    currentPath: '/moderator/press'
  });
});

/* ── সেশন ৩৯: মডারেটর বাল্ক মার্ক-অ্যান্ড-ডিলিট (ইউজার রিকোয়েস্ট: mark / mark-all) ──
   সাইডবারের জেনেরিক bulk JS (#bulkBar + name=bulk_ids + data-bulk-all) এখানেও কাজ করে।
   নোট: এই রুটগুলো সংশ্লিষ্ট '/:id' রুটের আগে বসে, তাই 'bulk-delete' কখনো id ধরা পড়ে না। */
function _bulkIds(body) {
  let ids = body.ids;
  if (!Array.isArray(ids)) ids = ids ? [ids] : [];
  return [...new Set(ids.map(v => parseInt(v, 10)).filter(n => Number.isInteger(n) && n > 0))];
}
const TA42 = require('../helpers/trash-audit'); // সেশন ৪২
async function _bulkDelete(table, req, res, backPath) {
  const ids = _bulkIds(req.body);
  if (!ids.length) return res.redirect(backPath + '?bulk=0');
  const tids42 = await TA42.trashBulkDelete(db, table, ids, req);
  await TA42.audit(db, req, 'bulk-delete', table, null, ids.length + 'টি আইটেম');
  console.log(`[moderator] bulk-delete ${table}: ${ids.length} item(s) by user ${(req.session.user && req.session.user.id)} (${req.session.role})`);
  res.redirect(backPath + '?bulk=' + ids.length + (tids42.length ? '&trashed=' + tids42[tids42.length - 1] : ''));
}
router.post('/notices/bulk-delete', ensureModerator, requireScope('notice'), async (req, res) => { await _bulkDelete('notices', req, res, '/moderator/notices'); });
router.post('/events/bulk-delete', ensureModerator, requireScope('event'), async (req, res) => { await _bulkDelete('events', req, res, '/moderator/events'); });
router.post('/complaints/bulk-delete', ensureModerator, requireScope('complaints'), async (req, res) => { await _bulkDelete('complaints', req, res, '/moderator/complaints'); });
router.post('/press/bulk-delete', ensureModerator, requireScope('epaper'), async (req, res) => { await _bulkDelete('press_clippings', req, res, '/moderator/press'); });
router.post('/members/bulk-delete', ensureModerator, async (req, res) => { await _bulkDelete('members', req, res, '/moderator/members'); });

// সেশন ৪২: বাল্ক পাবলিশ/লুকান (মডারেটর)
router.post('/press/bulk-toggle', ensureModerator, requireScope('epaper'), async (req, res) => {
  const on = req.body.mode === 'publish' ? 1 : 0;
  const ids = _bulkIds(req.body);
  for (const id of ids) { try { await db.prepare('UPDATE press_clippings SET is_active = ? WHERE id = ?').run(on, id); } catch (e) {} }
  await TA42.audit(db, req, on ? 'bulk-publish' : 'bulk-hide', 'press_clippings', null, ids.length + 'টি');
  res.redirect('/moderator/press?saved=1&undo_mode=' + (on ? 'publish' : 'hide') + '&undo_ids=' + ids.join(',') + '&undo_base=/moderator/press');
});
router.post('/notices/bulk-toggle', ensureModerator, requireScope('notice'), async (req, res) => {
  const on = req.body.mode === 'publish' ? 1 : 0;
  const ids = _bulkIds(req.body);
  for (const id of ids) { try { await db.prepare('UPDATE notices SET is_active = ? WHERE id = ?').run(on, id); } catch (e) {} }
  await TA42.audit(db, req, on ? 'bulk-publish' : 'bulk-hide', 'notices', null, ids.length + 'টি');
  res.redirect('/moderator/notices?saved=1&undo_mode=' + (on ? 'publish' : 'hide') + '&undo_ids=' + ids.join(',') + '&undo_base=/moderator/notices');
});
router.post('/events/bulk-toggle', ensureModerator, requireScope('event'), async (req, res) => {
  const on = req.body.mode === 'publish' ? 1 : 0;
  const ids = _bulkIds(req.body);
  for (const id of ids) { try { await db.prepare('UPDATE events SET is_active = ? WHERE id = ?').run(on, id); } catch (e) {} }
  await TA42.audit(db, req, on ? 'bulk-publish' : 'bulk-hide', 'events', null, ids.length + 'টি');
  res.redirect('/moderator/events?saved=1&undo_mode=' + (on ? 'publish' : 'hide') + '&undo_ids=' + ids.join(',') + '&undo_base=/moderator/events');
});

router.post('/press', ensureModerator, requireScope('epaper'), withUpload(pressUpload), async (req, res) => {
  const v = pressFormValues(req.body);
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  const images = parseImages(req.body.images);
  if (!fileUrl && !v.image_url && !images.length) {
    return res.redirect('/moderator/press?error=' + encodeURIComponent('ছবি আপলোড করুন অথবা ছবির URL দিন, সংরক্ষিত হয়নি।'));
  }
  // সেশন ৩৯: সার্ভার-সাইড ডুপলিকেট গার্ড — গত ২ মিনিটে একই শিরোনাম+পত্রিকা
  // আগেই সেভ হয়ে থাকলে এই রিকোয়েস্ট উপেক্ষা (ডাবল-ক্লিক/রিট্রাই নিরাপদ)।
  const dup = await db.prepare(`
    SELECT id FROM press_clippings
    WHERE title = ? AND COALESCE(paper_name, '') = COALESCE(?, '')
      AND created_at > datetime('now', '-2 minutes')
    ORDER BY id DESC LIMIT 1
  `).get(v.title, v.paper_name);
  if (dup) {
    console.log(`[moderator] press: duplicate POST ignored (matched id ${dup.id}, user ${(req.session.user && req.session.user.id)})`);
    return res.redirect('/moderator/press?posted=dup');
  }
  if (fileUrl && !images.includes(fileUrl)) images.unshift(fileUrl);
  const cover = fileUrl || v.image_url || images[0] || '';
  const r = await db.prepare(`
    INSERT INTO press_clippings (title, paper_name, image_url, published_date, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(v.title, v.paper_name, cover, v.published_date, v.sort_order, v.is_active);
  await db.setPostImages('news', r.lastInsertRowid, images);
  res.redirect('/moderator/press?posted=1');
});

router.post('/press/:id', ensureModerator, requireScope('epaper'), withUpload(pressUpload), async (req, res) => {
  const row = await db.prepare('SELECT id FROM press_clippings WHERE id = ?').get(req.params.id);
  if (!row) return res.redirect('/moderator/press?error=' + encodeURIComponent('কাটিংটি খুঁজে পাওয়া যায়নি।'));
  const v = pressFormValues(req.body);
  const fileUrl = req.file ? (req.file.url || req.file.path) : null;
  let images = parseImages(req.body.images);
  if (fileUrl && !images.includes(fileUrl)) images.unshift(fileUrl);
  // ফর্মে images ফিল্ড না থাকলে (পুরনো ক্লায়েন্ট) আগের গ্যালারি ধরে রাখুন
  if (req.body.images === undefined && !fileUrl) {
    images = (await db.getPostImages('news', req.params.id)).map(i => i.image_url);
  }
  const cover = fileUrl || v.image_url || images[0] || '';
  await db.prepare(`
    UPDATE press_clippings SET title = ?, paper_name = ?, image_url = ?,
      published_date = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `).run(v.title, v.paper_name, cover, v.published_date, v.sort_order, v.is_active, req.params.id);
  await db.setPostImages('news', req.params.id, images);
  res.redirect('/moderator/press?posted=1');
});

// টাস্ক ১৩ খ: সেকশন-ভিত্তিক সেভ (নিউজ/প্রেস কাটিং এডিট)
router.post('/press/:id/section', ensureModerator, requireScope('epaper'), async (req, res) => {
  const row = await db.prepare('SELECT id FROM press_clippings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'কাটিংটি পাওয়া যায়নি' });
  const upd = {};
  if (req.body.title !== undefined) upd.title = String(req.body.title).trim().slice(0, 200);
  if (req.body.paper_name !== undefined) upd.paper_name = String(req.body.paper_name).trim().slice(0, 120);
  if (req.body.published_date !== undefined) upd.published_date = String(req.body.published_date).trim().slice(0, 40) || null;
  if (req.body.sort_order !== undefined) upd.sort_order = Math.max(0, parseInt(req.body.sort_order, 10) || 0);
  if (req.body.is_active !== undefined) upd.is_active = req.body.is_active === '0' ? 0 : 1;
  if (req.body.image_url !== undefined || req.body.images !== undefined) {
    const images = parseImages(req.body.images);
    const cover = (req.body.image_url !== undefined ? String(req.body.image_url).trim() : '') || images[0] || '';
    if (cover) upd.image_url = cover;
    await db.setPostImages('news', req.params.id, images);
  }
  const cols = Object.keys(upd);
  if (cols.length) await db.prepare('UPDATE press_clippings SET ' + cols.map(c => c + ' = ?').join(', ') + ' WHERE id = ?').run(...cols.map(c => upd[c]), req.params.id);
  await TA42.audit(db, req, 'edit-section', 'press_clippings', req.params.id, cols.join(',') || 'images');
  res.json({ ok: true });
});

router.post('/press/:id/delete', ensureModerator, requireScope('epaper'), async (req, res) => {
  const tid42 = await TA42.trashDelete(db, 'press_clippings', req.params.id, req);
  await TA42.audit(db, req, 'delete', 'press_clippings', req.params.id, '');
  res.redirect('/moderator/press?removed=1&trashed=' + tid42);
});

// ── Moderator dashboard ──────────────────────────────────────────────────────
router.get('/', ensureModerator, async (req, res) => {
  const myScopes = (req.session.user.role === 'admin' || req.session.user.role === 'superadmin')
    ? db.MODERATOR_SCOPES.map(s => s.key)
    : await db.getModeratorScopes(req.session.user.id);
  // Stats for dashboard
  let stats = { notices: 0, events: 0, daily: 0, openReports: 0 };
  try { stats.notices = (await db.prepare('SELECT COUNT(*) as c FROM notices').get()).c; } catch(e) {}
  try { stats.events = (await db.prepare('SELECT COUNT(*) as c FROM events').get()).c; } catch(e) {}
  try { stats.daily = (await db.prepare('SELECT COUNT(*) as c FROM daily_content WHERE published = 1').get()).c; } catch(e) {}
  // সেশন ৮১: খোলা রিপোর্ট-ব্যাজ
  try { stats.openReports = (await db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'open'").get()).c; } catch(e) {}
  res.render('user/moderator-dashboard', {
    scopes: db.MODERATOR_SCOPES,
    myScopes,
    scopeAliases: db.SCOPE_ALIASES,
    dailyContentScopes: db.DAILY_CONTENT_SCOPES,
    stats,
    currentPath: '/moderator'
  });
});

// ── সেশন ৮১: পোস্ট-মডারেশন — রিপোর্ট-কিউ (approve/report-queue) ─────────────
// সব মডারেটর-রোল + অ্যাডমিন প্রবেশ করতে পারে (কনটেন্ট-মডারেশন মূল দায়িত্ব,
// ডেইলি-কনটেন্ট স্কোপের সাথে বাঁধা নয় — navigation-প্যানেলের মতোই)।
router.get('/reports', ensureModerator, async (req, res) => {
  const tab81 = ['open', 'resolved', 'dismissed'].includes(req.query.tab) ? req.query.tab : 'open';
  const { REPORT_REASONS_81 } = require('./social');
  const esc81 = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try {
    const [rows81, counts81, hidden81] = await Promise.all([
      db.prepare(`
        SELECT r.*, ru.full_name AS reporter_name, ru.username AS reporter_username, ru.avatar_url AS reporter_avatar,
               vu.full_name AS resolver_name,
               p.title AS post_title, p.status AS post_status, p.type AS post_type, p.author_id AS post_author_id,
               pu.full_name AS post_author_name, pu.username AS post_author_username,
               c.body AS comment_body, cu.full_name AS comment_author_name, cu.username AS comment_author_username
        FROM reports r
        JOIN users ru ON r.reporter_id = ru.id
        LEFT JOIN users vu ON r.resolved_by = vu.id
        LEFT JOIN posts p ON r.post_id = p.id
        LEFT JOIN users pu ON p.author_id = pu.id
        LEFT JOIN comments c ON r.comment_id = c.id
        LEFT JOIN users cu ON c.author_id = cu.id
        WHERE r.status = ?
        ORDER BY r.created_at DESC LIMIT 100`).all(tab81),
      db.prepare(`SELECT
        (SELECT COUNT(*) FROM reports WHERE status = 'open') AS open,
        (SELECT COUNT(*) FROM reports WHERE status = 'resolved') AS resolved,
        (SELECT COUNT(*) FROM reports WHERE status = 'dismissed') AS dismissed,
        (SELECT COUNT(*) FROM reports WHERE status = 'resolved' AND date(resolved_at) = date('now')) AS resolvedToday`).get(),
      db.prepare("SELECT COUNT(*) AS c FROM posts WHERE status = 'hidden'").get()
    ]);
    // টার্গেট-প্রিভিউ: পোস্ট-রিপোর্টে এক্সার্পট, কমেন্ট-রিপোর্টে মন্তব্যের অংশ
    const excerpts = new Map();
    const postIds = [...new Set(rows81.filter(r => r.post_id && !r.comment_id).map(r => r.post_id))];
    if (postIds.length) {
      const ph = postIds.map(() => '?').join(',');
      const pr = await db.prepare(`SELECT id, body, excerpt FROM posts WHERE id IN (${ph})`).all(...postIds);
      pr.forEach(p => {
        const txt = mdPlain85(p.excerpt || p.body || ''); // সেশন ৮৫: মার্কডাউন-মার্কার-সহ স্ট্রিপ
        excerpts.set(p.id, txt.slice(0, 220));
      });
    }
    // ── সেশন ৮৫: রিপোর্টার-ইতিহাস (স্প্যাম-হিউরিস্টিক) ──────────────────────────
    // কিউ-কার্ডে রিপোর্টকারীর পাশে ছোট-চিপ: মোট/খারিজ/সমাধান গণনা। ≥৩ খারিজ ও
    // ০ সমাধান হলে 'স্প্যাম-প্রবণ' অ্যাম্বার-চিপ — মডারেটর এক-নজরে সিগন্যাল পান।
    const hist85 = new Map();
    const repIds85 = [...new Set(rows81.map(r => r.reporter_id).filter(Boolean))];
    if (repIds85.length) {
      const ph85 = repIds85.map(() => '?').join(',');
      const rows85 = await db.prepare(
        `SELECT reporter_id, COUNT(*) total,
                SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) dismissed,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) resolved
         FROM reports WHERE reporter_id IN (${ph85}) GROUP BY reporter_id`
      ).all(...repIds85);
      rows85.forEach(h => hist85.set(h.reporter_id, {
        total: h.total || 0, dismissed: h.dismissed || 0, resolved: h.resolved || 0
      }));
    }
    const reports = rows81.map(r => ({
      ...r,
      reasonMeta: REPORT_REASONS_81[r.reason] || REPORT_REASONS_81.other,
      targetExcerpt: r.comment_id ? mdPlain85(r.comment_body, 220) : (excerpts.get(r.post_id) || ''),
      targetPath: r.post_id ? ((r.post_type === 'question' ? '/qa/' : '/articles/') + r.post_id) : null,
      targetLabel: r.comment_id ? 'মন্তব্য' : (r.post_type === 'question' ? 'প্রশ্ন' : 'লেখা'),
      reporterHist: hist85.get(r.reporter_id) || null,
    }));
    res.render('user/moderator-reports', {
      reports, tab81, counts: counts81, hiddenCount: hidden81.c,
      reasons: REPORT_REASONS_81, esc: esc81,
      done81: req.query.done || null,
      bulkN85: parseInt(req.query.n, 10) || 0,
      bulkSk85: parseInt(req.query.sk, 10) || 0,
      currentPath: '/moderator/reports'
    });
  } catch (e) {
    console.error('[reports:81]', e.message);
    res.status(500).send('রিপোর্ট-কিউ লোড করা যায়নি — সার্ভার-লগ দেখুন।');
  }
});

// ── সেশন ৮৫: শেয়ার্ড রিপোর্ট-অ্যাকশন লজিক ──────────────────────────────────
// একক-রুট (POST /reports/:id/action) ও বাল্ক-রুট (POST /reports/bulk) উভয়েই
// একই কোর-ফ্লো চালায় — নোটিফিকেশন-চেইন (লেখক + রিপোর্টার) অক্ষত রেখে।
// রিটার্ন: { ok:true } | { ok:false, why:'missing'|'already' } — অন্যথা থ্রো।
async function applyReportAction85(reportId, action, me) {
  const report = await db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!report) return { ok: false, why: 'missing' };
  if (report.status !== 'open' && action !== 'unhide') return { ok: false, why: 'already' };
  let postTitle81 = '';
  if (report.post_id) {
    const p = await db.prepare('SELECT id, title, author_id, type, status FROM posts WHERE id = ?').get(report.post_id);
    if (p) {
      postTitle81 = String(p.title || '').slice(0, 80);
      if (action === 'hide' && p.status !== 'hidden') {
        await db.prepare("UPDATE posts SET status = 'hidden' WHERE id = ?").run(p.id);
        // লেখককে জানানো (রিপোর্টার নয় — কনফিডেনশিয়ালিটি)
        if (p.author_id !== me.id) {
          await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
            p.author_id, 'system', 'আপনার লেখা লুকানো হয়েছে',
            'মডারেটর-নির্বাচনে "' + postTitle81 + '" সাময়িকভাবে লুকানো হয়েছে। প্রয়োজনে সম্পাদনা করে আবার প্রকাশ করতে পারেন।',
            (p.type === 'question' ? '/qa/' : '/articles/') + p.id
          );
        }
      }
      if (action === 'unhide' && p.status === 'hidden') {
        await db.prepare("UPDATE posts SET status = 'published' WHERE id = ?").run(p.id);
        if (p.author_id !== me.id) {
          await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
            p.author_id, 'system', 'আপনার লেখা পুনরায় প্রকাশিত হয়েছে',
            '"' + postTitle81 + '" আবার সবার জন্য দৃশ্যমান করা হয়েছে।',
            (p.type === 'question' ? '/qa/' : '/articles/') + p.id
          );
        }
      }
    }
  }
  if (action !== 'unhide') {
    const newStatus = action === 'hide' || action === 'resolve' ? 'resolved' : 'dismissed';
    await db.prepare('UPDATE reports SET status = ?, action = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, action, me.id, report.id);
    // রিপোর্টকারীকে ফলাফল-জানানো
    const msg81 = action === 'hide'
      ? { title: 'আপনার রিপোর্টে ব্যবস্থা নেওয়া হয়েছে ✓', body: 'রিপোর্ট করা কনটেন্টটি লুকানো হয়েছে। সহযোগিতার জন্য ধন্যবাদ।' }
      : action === 'resolve'
      ? { title: 'আপনার রিপোর্ট সমাধান করা হয়েছে ✓', body: 'মডারেটররা বিষয়টি দেখে প্রয়োজনীয় ব্যবস্থা নিয়েছেন।' }
      : { title: 'আপনার রিপোর্ট পর্যালোচনা করা হয়েছে', body: 'এবারের রিপোর্টে কোনো নিয়মভঙ্গ পাওয়া যায়নি। তবুও জানানোর জন্য ধন্যবাদ।' };
    if (report.reporter_id !== me.id) {
      await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
        report.reporter_id, 'system', msg81.title, msg81.body, '/moderator/reports'
      );
    }
  }
  return { ok: true };
}

// সেশন ৮১: রিপোর্টে মডারেটর-অ্যাকশন — hide (পোস্ট লুকানো+সমাধান) / dismiss / resolve
router.post('/reports/:id/action', ensureModerator, async (req, res) => {
  const action = String(req.body.action || '');
  if (!['hide', 'dismiss', 'resolve', 'unhide'].includes(action)) {
    return res.status(400).redirect('/moderator/reports');
  }
  try {
    const r85 = await applyReportAction85(req.params.id, action, req.session.user);
    if (!r85.ok) return res.redirect('/moderator/reports?done=' + r85.why);
    res.redirect('/moderator/reports?done=' + action);
  } catch (e) {
    console.error('[reports-action:81]', e.message);
    res.redirect('/moderator/reports?done=error');
  }
});

// ── সেশন ৮৫: বাল্ক-অ্যাকশন — নির্বাচিত খোলা-রিপোর্টে একবারে hide/dismiss/resolve ──
// বড়-কিউ পরিষ্কারের গতি; unhide বাল্কে নেই — পুনঃপ্রকাশ সবসময় কেস-বাই-কেস।
// সর্বোচ্চ ৫০-আইডি (অ্যাবিউজ-গার্ড), ইতিমধ্যে-প্রক্রিয়াকৃত স্কিপ-হিসেবে গণনা হয়।
router.post('/reports/bulk', ensureModerator, async (req, res) => {
  const action = String(req.body.action || '');
  if (!['hide', 'dismiss', 'resolve'].includes(action)) {
    return res.status(400).redirect('/moderator/reports');
  }
  let ids = [];
  try {
    ids = (Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids])
      .map(Number).filter(Number.isFinite);
  } catch (e) { ids = []; }
  ids = [...new Set(ids)].slice(0, 50);
  if (!ids.length) return res.redirect('/moderator/reports?done=bulk-none');
  let applied = 0, skipped = 0;
  try {
    for (const id of ids) {
      try {
        const r85 = await applyReportAction85(id, action, req.session.user);
        if (r85.ok) applied++; else skipped++;
      } catch (e) { skipped++; console.error('[reports-bulk-item:85]', id, e.message); }
    }
    res.redirect('/moderator/reports?done=bulk-' + action + '&n=' + applied + (skipped ? '&sk=' + skipped : ''));
  } catch (e) {
    console.error('[reports-bulk:85]', e.message);
    res.redirect('/moderator/reports?done=error');
  }
});

// ── Generic daily_content poster (quiz / this_day / activity / epaper) ──────
const DAILY_TYPES = {
  quiz:      { scope: 'quiz',      label: 'আজকের কুইজ' },
  this_day:  { scope: 'this_day',  label: 'আজকের এই দিনে' },
  activity:  { scope: 'activity',  label: 'সাংগঠনিক কার্যক্রম' },
  epaper:    { scope: 'epaper',    label: 'আজকের ই-পেপার' }
};

router.get('/daily/:type', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const items = await db.prepare('SELECT * FROM daily_content WHERE content_type = ? ORDER BY scheduled_date DESC, id DESC LIMIT 30').all(req.params.type);
    // সেশন ৬২: এডিট-UI-র জন্য options পার্স করা অবস্থায় পাঠাই (answer-সহ —
    // মডারেটর-প্যানেল ভিউ; /quiz-এর পাবলিক রুটে answer যায় না)।
    const withOpts = items.map(it => {
      const o = Object.assign({}, it);
      o.parsedOptions = null;
      if (o.options) {
        try {
          const arr = JSON.parse(o.options);
          if (Array.isArray(arr) && arr.length) o.parsedOptions = arr.map(String);
        } catch (e) { /* খারাপ JSON — স্ট্যাটিক */ }
      }
      return o;
    });
    res.render('user/moderator-daily-form', { type: req.params.type, meta, items: withOpts, todayDate: today(), posted: req.query.posted || null, edited: req.query.edited || null, currentPath: '/moderator' });
  });
});

// সেশন ৬২: ডেইলি-কনটেন্ট এডিট — শিরোনাম/ব্যাখ্যা/তারিখ + কুইজ হলে বিকল্প ও
// সঠিক-উত্তর। পুরনো কুইজের বিকল্প এডিট করা যায় না-পারা ছিল সেশন ৬১-এর পেন্ডিং।
router.post('/daily/:type/edit/:id', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const id = parseInt(req.params.id, 10);
    const row = await db.prepare('SELECT * FROM daily_content WHERE id = ? AND content_type = ?').get(id, req.params.type);
    if (!row) return res.redirect('/moderator/daily/' + req.params.type);

    const title = String(req.body.title || '').trim();
    if (!title) return res.redirect('/moderator/daily/' + req.params.type + '/?edited=empty');

    // কুইজ: বিকল্প-ওয়ালা ফর্ম এলে পুনর্গঠন; ফাঁকা বিকল্প-ফর্ম এলে আগেরটাই থাকে
    let optionsVal = row.options, answerVal = row.answer;
    if (req.params.type === 'quiz' && req.body.opt_0 !== undefined) {
      const opts = [0, 1, 2, 3].map(i => String(req.body['opt_' + i] || '').trim()).filter(Boolean);
      if (opts.length >= 2) {
        optionsVal = JSON.stringify(opts);
        const sel = parseInt(req.body.correct_answer, 10);
        answerVal = (Number.isInteger(sel) && sel >= 0 && sel < opts.length) ? sel : 0;
      } else if (opts.length === 0) {
        // সব ফাঁকা = স্ট্যাটিকে ফেরানোর ইচ্ছা
        optionsVal = null; answerVal = null;
      }
    }

    await db.prepare('UPDATE daily_content SET title = ?, body = ?, scheduled_date = ?, options = ?, answer = ? WHERE id = ?')
      .run(title, String(req.body.body || '').trim(), String(req.body.scheduled_date || row.scheduled_date || today()).trim(), optionsVal, answerVal, id);
    await TA42.audit(db, req, 'update', 'daily_content', id, title);
    res.redirect('/moderator/daily/' + req.params.type + '?edited=' + id);
  });
});

// সেশন ৪১: ডেইলি কনটেন্ট বাল্ক ডিলিট (মার্ক/মার্ক-অল) — create রুট '/daily/:type'-এর আগে
router.post('/daily/bulk-delete', ensureModerator, async (req, res) => { await _bulkDelete('daily_content', req, res, '/moderator/daily/' + (req.body.back_type || 'quiz')); });

router.post('/daily/:type', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const { title, body, image_url, link_url, scheduled_date } = req.body;
    if (!title) return res.redirect('/moderator/daily/' + req.params.type);
    const images = parseImages(req.body.images);
    const cover = image_url || images[0] || '';

    // সেশন ৬০: ইন্টারঅ্যাক্টিভ কুইজ-অপশন — কমপক্ষে ২টি খোঁজা বিকল্প লাগবে;
    // সঠিক-ইনডেক্স ফাঁকা বিকল্প এড়িয়ে ভ্যালিডেট হয় (বিকল্প-সংখ্যার ভেতরে)।
    let optionsJson = null, answer = null;
    if (req.params.type === 'quiz') {
      const opts = [0, 1, 2, 3].map(i => String(req.body['opt_' + i] || '').trim()).filter(Boolean);
      if (opts.length >= 2) {
        optionsJson = JSON.stringify(opts);
        const sel = parseInt(req.body.correct_answer, 10);
        answer = (Number.isInteger(sel) && sel >= 0 && sel < opts.length) ? sel : 0;
      }
    }

    const r = await db.prepare(`INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, author_id, published, options, answer)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`)
      .run(req.params.type, title, body || '', cover, link_url || '', scheduled_date || today(), req.session.user.id, optionsJson, answer);
    await db.setPostImages('daily', r.lastInsertRowid, images);
    await broadcastToAll('daily_' + req.params.type, meta.label, `নতুন আপডেট: ${title}`, '/' + (req.params.type === 'this_day' ? 'on-this-day' : req.params.type), req.session.user.id);
    res.redirect('/moderator/daily/' + req.params.type + '?posted=1');
  });
});

router.delete('/daily/:type/:id', ensureModerator, async (req, res, next) => {
  const meta = DAILY_TYPES[req.params.type];
  if (!meta) return next();
  requireScope(meta.scope)(req, res, async () => {
    const tid42 = await TA42.trashDelete(db, 'daily_content', req.params.id, req);
    await TA42.audit(db, req, 'delete', 'daily_content', req.params.id, '');
    res.redirect('/moderator/daily/' + req.params.type + '?trashed=' + tid42);
  });
});

// ── Resources (সেশন ১০১: মডারেটর রিসোর্স-আপলোড — অ্যাডমিনের সাথে shared-লজিক) ─
function humanFileSizeMod101(bytes) {
  if (bytes === undefined || bytes === null || bytes === '') return null;
  const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = Number(bytes) || 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? n + ' B' : n.toFixed(1) + ' ' + units[i]);
}
router.get('/resources', ensureModerator, requireScope('resources'), async (req, res) => {
  const resources = await db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  // সেশন ১০৭: সিরিজ-নামের তালিকা (ফর্মে datalist)
  const seriesList = (await db.prepare("SELECT DISTINCT TRIM(series) AS s FROM resources WHERE series IS NOT NULL AND TRIM(series) != '' ORDER BY s COLLATE NOCASE").all()).map(x => x.s).filter(Boolean);
  // সেশন ১১৬: ?edit=<id> — মডারেটরের নিজের-আপলোড এডিট-মোড (ফর্ম-প্রিফিল);
  // অন্যের আপলোড হলে নীরবে উপেক্ষা (admin-ই সব এডিট করতে পারে)।
  let editRes = null;
  const editId = parseInt(req.query.edit, 10);
  if (Number.isFinite(editId) && editId > 0) {
    const row = await db.prepare('SELECT * FROM resources WHERE id = ?').get(editId);
    if (row && String(row.created_by || '') === String(req.session.user.username || '')) editRes = row;
  }
  res.render('user/moderator-resources', {
    resources, RES_TYPE_META: require('../helpers/resource-types'),
    seriesList, editRes,
    meUsername: req.session.user.username || '',
    posted: req.query.posted || null, removed: req.query.removed || null, currentPath: '/moderator'
  });
});

router.post('/resources', ensureModerator, requireScope('resources'), withUpload(resourceUpload), async (req, res) => {
  const { title, content, category, author, tags, file_url, link_url, res_type, file_size, duration } = req.body;
  if (!title || !String(title).trim()) return res.redirect('/moderator/resources');
  if (req.uploadError) return res.redirect('/moderator/resources?posted=err');
  const f = req.file;
  const RT = require('../helpers/resource-types');
  let type = res_type || 'link', fUrl = file_url || null, fSize = file_size || null;
  if (f) {
    fUrl = f.url || f.path;
    type = RT.detectResType(f);
    fSize = humanFileSizeMod101(f.size);
  }
  // সেশন ১০১-গ: থাম্বনেইল স্যানিটাইজ (http(s)/সাইট-পাথ)
  let thumb = String(req.body.thumbnail_url || '').trim() || null;
  if (thumb && !/^(https?:\/\/.+|\/)/i.test(thumb)) thumb = null;
  // সেশন ১০৭: সিরিজ/সংকলন — নাম ≤৮০ ক্যারেক্টার; পর্ব-ক্রম ১..৯৯৯
  const ser = String(req.body.series || '').trim().slice(0, 80) || null;
  const soRaw = parseInt(req.body.series_order, 10);
  const serOrd = (Number.isFinite(soRaw) && soRaw >= 1 && soRaw <= 999) ? soRaw : null;
  await db.prepare('INSERT INTO resources (title, content, category, author, tags, file_url, link_url, file_type, res_type, file_size, duration, created_by, thumbnail_url, series, series_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    String(title).trim(), content || '', category || 'general',
    author || (req.session.user.username || req.session.user.full_name || ''),
    tags || '', fUrl, link_url || null, type, type, fSize, (duration || '').trim() || null,
    req.session.user.username || null, thumb, ser, serOrd
  );
  res.redirect('/moderator/resources?posted=1');
});

/* সেশন ১১৬: CSV বাল্ক-ইমপোর্ট — মডারেটর (resources-স্কোপ-গেটেড)। JSON {csv} +
   X-CSRF-Token (গ্লোবাল CSRF-গার্ড urlencoded/multipart-সীমিত — JSON-পথে নিজস্ব-যাচাই)। */
const resourceBulk116 = require('../helpers/resource-bulk');
function csrfOk116(req) {
  const sent = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
  const sess = req.session ? req.session.csrfToken : null;
  const cookie = req.cookies ? req.cookies._csrfTok : null;
  return !!sent && (String(sent) === String(sess) || String(sent) === String(cookie));
}
router.post('/resources/bulk', ensureModerator, requireScope('resources'), express.json({ limit: '1mb' }), async (req, res) => {
  if (!csrfOk116(req)) return res.status(403).json({ ok: false, error: 'নিরাপত্তা যাচাই পুরনো হয়ে গিয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।' });
  const out = await resourceBulk116.bulkImport(String((req.body || {}).csv || ''), req.session.user.username || 'moderator', db);
  res.json({ ok: true, inserted: out.inserted, skipped: out.skipped, dupes: out.dupes || 0, total: out.total, fetched: out.fetched, errors: out.errors });
});

/* সেশন ১১৬: মডারেটরের নিজের-আপলোড আপডেট — মালিকানা-গার্ড (created_by === নিজের-username);
   অ্যাডমিন-আপলোড হলে 403 (তা অ্যাডমিন-প্যানেলের কাজ)। multipart (ফাইল-রি-আপলোড-সহ)। */
router.post('/resources/:id(\\d+)/update', ensureModerator, requireScope('resources'), withUpload(resourceUpload), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!existing) return res.redirect('/moderator/resources');
  if (String(existing.created_by || '') !== String(req.session.user.username || '')) {
    return res.status(403).render('admin/denied', { currentPath: '/moderator', homePath: '/moderator' });
  }
  const { title, content, category, author, tags, link_url, res_type, file_size, duration } = req.body;
  if (!title || !String(title).trim()) return res.redirect('/moderator/resources?edit=' + id + '&posted=err2');
  if (req.uploadError) return res.redirect('/moderator/resources?edit=' + id + '&posted=err');
  const RT = require('../helpers/resource-types');
  let type = res_type || existing.res_type || 'link', fUrl = existing.file_url, fSize = file_size || existing.file_size;
  if (req.file) {
    fUrl = req.file.url || req.file.path;
    type = RT.detectResType(req.file);
    fSize = humanFileSizeMod101(req.file.size);
  }
  let thumb = String(req.body.thumbnail_url || '').trim() || null;
  if (thumb && !/^(https?:\/\/.+|\/)/i.test(thumb)) thumb = null;
  const ser = String(req.body.series || '').trim().slice(0, 80) || null;
  const soRaw = parseInt(req.body.series_order, 10);
  const serOrd = (Number.isFinite(soRaw) && soRaw >= 1 && soRaw <= 999) ? soRaw : null;
  const newType = RT.normalizeResType({ res_type: type, file_type: type });
  await db.prepare('UPDATE resources SET title = ?, content = ?, category = ?, author = ?, tags = ?, file_url = ?, link_url = ?, file_type = ?, res_type = ?, file_size = ?, duration = ?, thumbnail_url = ?, series = ?, series_order = ? WHERE id = ?').run(
    String(title).trim(), content || '', category || existing.category || 'general',
    author || existing.author || '', tags || '', fUrl, link_url || existing.link_url || null,
    newType, newType, fSize, (duration || '').trim() || null, thumb, ser, serOrd, id
  );
  res.redirect('/moderator/resources?posted=2');
});

router.post('/resources/:id/delete', ensureModerator, requireScope('resources'), async (req, res) => {
  const tid42 = await TA42.trashDelete(db, 'resources', req.params.id, req);
  await TA42.audit(db, req, 'delete', 'resources', req.params.id, '');
  res.redirect('/moderator/resources?trashed=' + tid42);
});

// ── Notices ──────────────────────────────────────────────────────────────────
router.get('/notices', ensureModerator, requireScope('notice'), async (req, res) => {
  const notices = await db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 30').all();
  res.render('user/moderator-notices', { notices, posted: req.query.posted || null, currentPath: '/moderator' });
});

router.post('/notices', ensureModerator, requireScope('notice'), async (req, res) => {
  const { title, content, category, date } = req.body;
  if (!title) return res.redirect('/moderator/notices');
  const r = await db.prepare('INSERT INTO notices (title, content, category, date) VALUES (?, ?, ?, ?)')
    .run(title, content || '', category || 'notice', date || today());
  await db.setPostImages('notice', r.lastInsertRowid, parseImages(req.body.images));
  await broadcastToAll('notice', 'নতুন বিজ্ঞপ্তি', title, '/notices', req.session.user.id);
  // Newsletter — subscribers get an automatic email for every new notice
  try {
    const mailer = require('../helpers/mailer');
    await mailer.notifySubscribers({
      kind: 'notice', title, body: content || '', authorName: req.session.user.full_name || ''
    });
  } catch (e) { console.error('[newsletter] moderator notice notify failed:', e.message); }
  res.redirect('/moderator/notices?posted=1');
});

router.delete('/notices/:id', ensureModerator, requireScope('notice'), async (req, res) => {
  const tid42 = await TA42.trashDelete(db, 'notices', req.params.id, req);
  await TA42.audit(db, req, 'delete', 'notices', req.params.id, '');
  res.redirect('/moderator/notices?trashed=' + tid42);
});

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', ensureModerator, requireScope('event'), async (req, res) => {
  const events = await db.prepare('SELECT * FROM events ORDER BY date DESC LIMIT 30').all();
  res.render('user/moderator-events', { events, posted: req.query.posted || null, currentPath: '/moderator' });
});

router.post('/events', ensureModerator, requireScope('event'), async (req, res) => {
  const { title, description, date, end_date, location, image_url } = req.body;
  if (!title) return res.redirect('/moderator/events');
  const images = parseImages(req.body.images);
  const cover = image_url || images[0] || '';
  const r = await db.prepare('INSERT INTO events (title, description, date, end_date, location, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, 0)')
    .run(title, description || '', date || '', end_date || '', location || '', cover);
  await db.setPostImages('event', r.lastInsertRowid, images);
  await broadcastToAll('event', 'নতুন ইভেন্ট', title, '/events', req.session.user.id);
  res.redirect('/moderator/events?posted=1');
});

router.delete('/events/:id', ensureModerator, requireScope('event'), async (req, res) => {
  const tid42 = await TA42.trashDelete(db, 'events', req.params.id, req);
  await TA42.audit(db, req, 'delete', 'events', req.params.id, '');
  res.redirect('/moderator/events?trashed=' + tid42);
});

// ── Best Writer (toggle featured on an existing article) ────────────────────
router.get('/best-writer', ensureModerator, requireScope('best_writer'), async (req, res) => {
  const articles = await db.prepare(`
    SELECT p.id, p.title, p.featured, u.full_name, u.username
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.type = 'article' AND p.status = 'published'
    ORDER BY p.published_at DESC LIMIT 40
  `).all();
  res.render('user/moderator-best-writer', { articles, currentPath: '/moderator' });
});

router.post('/best-writer/:id/toggle', ensureModerator, requireScope('best_writer'), async (req, res) => {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (post) {
    const next = post.featured ? 0 : 1;
    await db.prepare('UPDATE posts SET featured = ? WHERE id = ?').run(next, post.id);
    if (next) {
      await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
        .run(post.author_id, 'best_writer', 'অভিনন্দন!', 'আপনার লেখাটি মাসিক সেরা লেখক হিসেবে নির্বাচিত হয়েছে', '/articles/' + post.id);
    }
  }
  res.redirect('/moderator/best-writer');
});

// ── সেশন ৯০: হোম-কিউরেশন — 'লেখকদের কালি' + 'সব লেখা' নিয়ন্ত্রণ-কেন্দ্র ──────
// হোমপেজের 'লেখকদের কালি / সাম্প্রতিক লেখা' (home_featured, সর্বোচ্চ ৬) ও
// 'সব লেখা দেখুন' /articles-তালিকার (archive_visible) দৃশ্যমানতা — দুটোই
// মডারেটর/এডমিন এখান থেকে চেকবক্স/টগলে নিয়ন্ত্রণ করেন। অ্যাভাটার/কভার-
// আপডেট অটো-পোস্ট (post_kind≠writing) প্যানেলে দেখা যায় (চিপসহ) কিন্তু
// হোম-নির্বাচনযোগ্য নয় — সোশ্যাল-অ্যাক্টিভিটি কখনোই সাহিত্য-তালিকায় ঢুকবে না।
// সেশন ৯৪: শেয়ার-কপি (shared_from NOT NULL) প্যানেল-তালিকাতেই আসে না —
// এডমিন ভুল করেও অন্যের লেখার শেয়ার-কপি হোমে নির্বাচন করতে পারবেন না।
const MAX_HOME_FEATURED_90 = 6;
const TA42_90 = require('../helpers/trash-audit');
// সেশন ১১০: শৈল্পিক প্রচ্ছদ-রেজিস্ট্রি (একক-উৎস — হোম-রেন্ডার pages.js-ও এটিই পড়ে)
const COVERS110 = require('../helpers/covers');

router.get('/curation', ensureModerator, async (req, res) => {
  const q90 = String(req.query.q || '').trim();
  const kind90 = String(req.query.kind || '').trim(); // writing|avatar_update|cover_update
  let sql90 = `
    SELECT p.id, p.title, p.excerpt, p.status, p.post_kind, p.home_featured,
           p.home_featured_at, p.archive_visible, p.featured, p.published_at,
           p.like_count, p.comment_count, p.view_count, p.home_cover,
           u.full_name AS author_name, u.username AS author_username, u.id AS author_id
      FROM posts p JOIN users u ON p.author_id = u.id
     WHERE p.type = 'article' AND p.shared_from IS NULL /* সেশন ৯৪: শেয়ার-কপি প্যানেলেই নেই */`;
  const params90 = [];
  if (kind90 && ['writing', 'avatar_update', 'cover_update'].includes(kind90)) {
    sql90 += ' AND p.post_kind = ?'; params90.push(kind90);
  }
  if (q90) {
    sql90 += ' AND (p.title LIKE ? OR u.full_name LIKE ? OR u.username LIKE ?)';
    params90.push('%' + q90 + '%', '%' + q90 + '%', '%' + q90 + '%');
  }
  sql90 += ` ORDER BY p.home_featured DESC, p.home_featured_at DESC, p.published_at DESC LIMIT 300`;
  const [writings, featuredCount90, totalWritings90, hiddenCount90] = await Promise.all([
    db.prepare(sql90).all(...params90),
    db.prepare('SELECT COUNT(*) AS c FROM posts WHERE home_featured = 1 AND shared_from IS NULL').get(),
    db.prepare("SELECT COUNT(*) AS c FROM posts WHERE type='article' AND post_kind='writing' AND status='published' AND shared_from IS NULL").get(),
    db.prepare("SELECT COUNT(*) AS c FROM posts WHERE type='article' AND archive_visible = 0 AND shared_from IS NULL").get(),
  ]);
  res.render('user/moderator-curation', {
    writings,
    featuredCount: featuredCount90 ? featuredCount90.c : 0,
    totalWritings: totalWritings90 ? totalWritings90.c : 0,
    hiddenCount: hiddenCount90 ? hiddenCount90.c : 0,
    maxFeatured: MAX_HOME_FEATURED_90,
    searchQ: q90, kindFilter: kind90,
    coverPresets: COVERS110.COVER_PRESETS,
    savedFlash: req.query.saved ? String(req.query.saved) : '',
    currentPath: '/moderator/curation'
  });
});

// টগল-অ্যাকশন — urlencoded-fetch (গ্লোবাল CSRF-গার্ড X-CSRF-Token হেডারে পড়ে)
// → JSON উত্তর; ভিউ অপটিমিস্টিক-আপডেটে রিলোড ছাড়াই লাইভ কাউন্টার বদলায়।
router.post('/curation/toggle', ensureModerator, async (req, res) => {
  const id90 = parseInt(req.body.id, 10);
  const field90 = String(req.body.field || '');
  const value90 = req.body.value === '1' ? 1 : 0;
  if (!id90 || !['home_featured', 'archive_visible'].includes(field90)) {
    return res.status(400).json({ ok: false, error: 'অবৈধ অনুরোধ' });
  }
  const post90 = await db.prepare("SELECT id, title, post_kind, author_id, home_featured, archive_visible, shared_from FROM posts WHERE id = ? AND type = 'article'").get(id90);
  if (!post90) return res.status(404).json({ ok: false, error: 'লেখাটি পাওয়া যায়নি' });

  if (field90 === 'home_featured') {
    if (value90) {
      // কঠোর-নিয়ম ০ (সেশন ৯৪): শেয়ার-কপি কখনোই হোমে নির্বাচনযোগ্য নয় —
      // কেবল মূল লেখকের অরিজিনাল পোস্ট (হোমপেজ-তালিকার ইউজার-নির্দেশ)
      if (post90.shared_from) {
        return res.status(422).json({ ok: false, error: 'শেয়ার-করা পোস্ট — হোমপেজের লেখা-তালিকায় নির্বাচনযোগ্য নয়। মূল লেখাটি নির্বাচন করুন।' });
      }
      // কঠোর-নিয়ম ১: অটো-পোস্ট (avatar/cover ইত্যাদি) কখনোই হোমে নির্বাচনযোগ্য নয়
      if ((post90.post_kind || 'writing') !== 'writing') {
        return res.status(422).json({ ok: false, error: 'এটি সোশ্যাল-অ্যাক্টিভিটি পোস্ট — হোমপেজের লেখা-তালিকায় নির্বাচনযোগ্য নয়।' });
      }
      // কঠোর-নিয়ম ২: সর্বোচ্চ ৬টি (ক্লায়েন্ট-গার্ডের সার্ভার-যমল)
      const cnt90 = await db.prepare('SELECT COUNT(*) AS c FROM posts WHERE home_featured = 1').get();
      if (!post90.home_featured && (cnt90.c || 0) >= MAX_HOME_FEATURED_90) {
        return res.status(422).json({ ok: false, error: 'হোমপেজে সর্বোচ্চ ' + MAX_HOME_FEATURED_90 + 'টি লেখা রাখা যায়। অন্য একটি আনচেক করে আবার চেষ্টা করুন।', featuredCount: cnt90.c });
      }
      await db.prepare('UPDATE posts SET home_featured = 1, home_featured_at = CURRENT_TIMESTAMP WHERE id = ?').run(id90);
      // লেখককে সুখবর (best-writer-নোটিফিকেশন-প্যাটার্নের মিরর)
      try {
        await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
          .run(post90.author_id, 'home_featured', 'আপনার লেখা নির্বাচিত হয়েছে!', 'আপনার «' + String(post90.title).slice(0, 60) + '» লেখাটি হোমপেজের "লেখকদের কালি" সেকশনে প্রদর্শিত হবে।', '/articles/' + id90);
      } catch (e) { /* নন-ফেটাল */ }
      await TA42_90.audit(db, req, 'home-feature', 'posts', id90, 'হোমপেজ কিউরেশন: ' + String(post90.title).slice(0, 50));
    } else {
      await db.prepare('UPDATE posts SET home_featured = 0 WHERE id = ?').run(id90);
      await TA42_90.audit(db, req, 'home-unfeature', 'posts', id90, 'হোমপেজ কিউরেশন-বাদ: ' + String(post90.title).slice(0, 50));
    }
  } else if (field90 === 'archive_visible') {
    await db.prepare('UPDATE posts SET archive_visible = ? WHERE id = ?').run(value90, id90);
    await TA42_90.audit(db, req, value90 ? 'archive-show' : 'archive-hide', 'posts', id90, 'সব-লেখা তালিকা: ' + String(post90.title).slice(0, 50));
  }
  const cntAfter90 = await db.prepare('SELECT COUNT(*) AS c FROM posts WHERE home_featured = 1').get();
  res.json({ ok: true, featuredCount: cntAfter90.c || 0 });
});

// কুইক-অ্যাকশন — 'latest6' (সর্বশেষ ৬টি খাঁটি লেখা এক ক্লিকে হোমে তোলা) |
// 'clear' (সব হোম-নির্বাচন খালি)। বড় ডিপ্লয়ের পর এডমিনের শূন্য-থেকে-শুরু
// ঝামেলা দূর করতে।
router.post('/curation/quick', ensureModerator, async (req, res) => {
  const act90 = String(req.body.action || '');
  if (!['latest6', 'clear'].includes(act90)) {
    return res.status(400).json({ ok: false, error: 'অজানা অ্যাকশন' });
  }
  if (act90 === 'clear') {
    await db.prepare('UPDATE posts SET home_featured = 0').run();
    await TA42_90.audit(db, req, 'home-clear-all', 'posts', null, 'হোমপেজ কিউরেশন সম্পূর্ণ খালি');
    return res.json({ ok: true, featuredCount: 0 });
  }
  // latest6: আগে সব খালি → সর্বশেষ ৬ খাঁটি writing বাছাই (নোটিফিকেশনসহ)
  await db.prepare('UPDATE posts SET home_featured = 0').run();
  const rows90 = await db.prepare(`
    SELECT id, author_id, title FROM posts
     WHERE type='article' AND status='published' AND post_kind='writing' AND archive_visible=1
       AND shared_from IS NULL /* সেশন ৯৪: শেয়ার-কপি বাদ */
     ORDER BY published_at DESC LIMIT ${MAX_HOME_FEATURED_90}
  `).all();
  for (const r90 of rows90) {
    await db.prepare('UPDATE posts SET home_featured = 1, home_featured_at = CURRENT_TIMESTAMP WHERE id = ?').run(r90.id);
    try {
      await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)')
        .run(r90.author_id, 'home_featured', 'আপনার লেখা নির্বাচিত হয়েছে!', 'আপনার «' + String(r90.title).slice(0, 60) + '» লেখাটি হোমপেজের "লেখকদের কালি" সেকশনে প্রদর্শিত হবে।', '/articles/' + r90.id);
    } catch (e) { /* নন-ফেটাল */ }
  }
  await TA42_90.audit(db, req, 'home-quick-latest6', 'posts', null, 'সর্বশেষ ৬ লেখা স্বয়ংক্রিয়-নির্বাচন');
  res.json({ ok: true, featuredCount: rows90.length });
});

// সেশন ১১০: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ-নির্বাচন (AdminCoverSelector) —
// POST /curation/cover {id, type: 'preset'|'typo'|'custom', value}
// value ফাঁকা → সরান (NULL)। যাচাই helpers/covers.validateCoverInput (একক-উৎস);
// স্কোপ: কেবল অরিজিনাল writing (শেয়ার-কপি/সোশ্যাল-অটোপোস্টে প্রচ্ছদ অর্থহীন)।
// অডিট: TA42 'home-cover-set'/'home-cover-clear'। JSON উত্তর — ভিউ অপটিমিস্টিক।
router.post('/curation/cover', ensureModerator, async (req, res) => {
  const id110 = parseInt(req.body.id, 10);
  if (!id110) return res.status(400).json({ ok: false, error: 'অবৈধ অনুরোধ' });
  const post110 = await db.prepare("SELECT id, title, post_kind, shared_from FROM posts WHERE id = ? AND type = 'article'").get(id110);
  if (!post110) return res.status(404).json({ ok: false, error: 'লেখাটি পাওয়া যায়নি' });
  if (post110.shared_from || (post110.post_kind || 'writing') !== 'writing') {
    return res.status(422).json({ ok: false, error: 'কেবল মূল সাহিত্য-লেখার প্রচ্ছদ নির্বাচন করা যায়' });
  }
  const v110 = COVERS110.validateCoverInput(req.body.type, req.body.value);
  if (!v110.ok) return res.status(422).json({ ok: false, error: v110.error });
  await db.prepare('UPDATE posts SET home_cover = ? WHERE id = ?').run(v110.value, id110);
  await TA42_90.audit(db, req, v110.value ? 'home-cover-set' : 'home-cover-clear', 'posts', id110,
    (v110.value ? 'হোম-প্রচ্ছদ সেট (' + String(req.body.type) + ')' : 'হোম-প্রচ্ছদ সরানো') + ': ' + String(post110.title).slice(0, 50));
  res.json({ ok: true, home_cover: v110.value || null });
});

// ── Complaints (read + status update; visible only to scoped moderators) ────
router.get('/complaints', ensureModerator, requireScope('complaints'), async (req, res) => {
  const items = await db.prepare(`
    SELECT c.*, u.full_name, u.username FROM complaints c
    JOIN users u ON c.submitted_by = u.id
    ORDER BY c.created_at DESC
  `).all();
  res.render('user/moderator-complaints', { items, currentPath: '/moderator' });
});

router.post('/complaints/:id/status', ensureModerator, requireScope('complaints'), async (req, res) => {
  const { status, admin_notes } = req.body;
  await db.prepare("UPDATE complaints SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(status || 'new', admin_notes || '', req.params.id);
  res.redirect('/moderator/complaints');
});


// ── Switch between user and moderator profile ────────────────────────────────
router.get('/switch', ensureModerator, (req, res) => {
  // Toggle: if currently in moderator mode, switch to user mode (and vice versa)
  if (req.session.modMode === false) {
    req.session.modMode = true;
  } else {
    req.session.modMode = false;
  }
  req.session.save(() => {
    if (req.session.modMode) {
      res.redirect('/moderator');
    } else {
      res.redirect('/dashboard');
    }
  });
});

// ═══ সেশন ৪২: মডারেটর ট্র্যাশ (নিজের স্কোপের টেবিল) ═══
router.get('/trash', ensureModerator, async (req, res) => {
  const allowed43 = ['notices', 'events', 'press_clippings', 'daily_content', 'members', 'complaints', 'site_items'];
  const tbl43 = allowed43.includes(String(req.query.table || '')) ? String(req.query.table) : '';
  const q43 = String(req.query.q || '').trim();
  let rows = [], tables43 = [];
  try {
    tables43 = await db.prepare("SELECT table_name, COUNT(*) AS c FROM trash WHERE table_name IN ('notices','events','press_clippings','daily_content','members','complaints','site_items') GROUP BY table_name ORDER BY c DESC").all();
    rows = tbl43
      ? await db.prepare('SELECT * FROM trash WHERE table_name = ? ORDER BY id DESC LIMIT 300').all(tbl43)
      : await db.prepare("SELECT * FROM trash WHERE table_name IN ('notices','events','press_clippings','daily_content','members','complaints','site_items') ORDER BY id DESC LIMIT 300").all();
  } catch (e) {}
  if (q43) rows = rows.filter(r => (r.table_name || '').includes(q43) || String(r.payload || '').includes(q43));
  res.render('admin/trash', { rows, q42: q43, tbl43, tables43, restoredFlag: req.query.restored ? Number(req.query.restored) : 0, currentPath: '/moderator/trash', moderatorView: true });
});
router.post('/trash/restore-all', ensureModerator, async (req, res) => {
  const tbl = (req.body.table || '').trim();
  const allowed = ['notices', 'events', 'press_clippings', 'daily_content', 'members', 'complaints', 'site_items'];
  let rows = [];
  try {
    rows = tbl && allowed.includes(tbl)
      ? await db.prepare('SELECT id FROM trash WHERE table_name = ? ORDER BY id').all(tbl)
      : await db.prepare(`SELECT id FROM trash WHERE table_name IN ('notices','events','press_clippings','daily_content','members','complaints','site_items') ORDER BY id`).all();
  } catch (e) {}
  let n = 0;
  for (const r of rows.slice(0, 500)) { const rr = await TA42.restoreTrash(db, r.id, req); if (rr.ok) n++; }
  await TA42.audit(db, req, 'restore-all', tbl || 'trash', null, n + 'টি আইটেম ফেরত');
  res.redirect('/moderator/trash?restored=' + n);
});
router.post('/trash/:id/restore', ensureModerator, async (req, res) => {
  const r = await TA42.restoreTrash(db, req.params.id, req);
  if ((req.headers.accept || '').indexOf('application/json') !== -1) return res.json({ ok: r.ok, error: r.error || null, redirect: r.ok ? '?restored=1' : '?error=1' });
  res.redirect('/moderator/trash' + (r.ok ? '?restored=1' : '?error=1'));
});

// ═══ সেশন ৪২: সেকশন আইটেম ম্যানেজার (মডারেটর — content স্কোপ) ═══
const SECTIONS42 = require('../helpers/sections-registry').SECTIONS;
router.get('/sections', ensureModerator, requireScope('content'), async (req, res) => {
  const key = SECTIONS42[req.query.section] ? req.query.section : 'home_faq';
  let rows = [];
  try { rows = await db.prepare('SELECT * FROM site_items WHERE section = ? ORDER BY sort_order, id').all(key); } catch (e) {}
  if (req.query.partial === '1') {
    return res.render('admin/partials/sections-list', { SECTIONS: SECTIONS42, rows, active: key, BASE: '/moderator' });
  }
  res.render('admin/sections', { SECTIONS: SECTIONS42, rows, active: key, saved: req.query.saved || null, currentPath: '/moderator/sections', moderatorView: true });
});
for (const act of ['add', ':id/save', ':id/toggle', ':id/move', ':id/delete', ':id/undo', 'reorder']) {
  router.post('/sections/' + act, ensureModerator, requireScope('content'), async (req, res) => {
    // অ্যাডমিন রুটের same লজিক — ছোট ডুপ্লিকেশন এড়াতে রি-ইউজ
    req.url42mod = true;
    return require('./_sections-actions')(db, TA42, SECTIONS42, req, res, act, req.params.id);
  });
}

// ═══ সেশন ৮৩: ইউজার তদারকি (মডারেটর — user_mgmt স্কোপ) ═══════════════════════
// হায়ারার্কি-নীতি: ইউজারের কাজ মডারেটর নিয়ন্ত্রণ/তদারকি করবেন — তবে রোল
// বদলানো তার কাজ নয় (সেটি কেবল এডমিন/সুপার-এডমিন)। তাই মডারেটর এখানে:
//   • ইউজার-তালিকা/সার্চ দেখবেন (রোল/স্ট্যাটাস সহ)
//   • নিয়ম-ভঙ্গকারীকে নিষেধ (banned) করতে ও ফেরত (active) আনতে পারবেন
//   • রোল-কলাম শুধু-দেখা — পরিবর্তনের কোনো কন্ট্রোল নেই
// সেশন ৯০: প্রতিটি নিষেধ/ফেরতে "কারণ" নেওয়া হয় (ঐচ্ছিক, ≤৩০০ অক্ষর) —
//   টার্গেট-ইউজার বিজ্ঞপ্তি পান (notifications.type='moderation') এবং audit_log-এ
//   কারণটি সংরক্ষিত হয়। GET পেজে সাম্প্রতিক তদারকি-ফিডও দেখানো হয়।
router.get('/users', ensureModerator, requireScope('user_mgmt'), async (req, res) => {
  const q81 = String(req.query.q || '').trim();
  let users = [];
  try {
    if (q81) {
      users = await db.prepare("SELECT id, username, full_name, avatar_url, gender, role, status, created_at, last_login FROM users WHERE (username LIKE ? OR full_name LIKE ?) AND role != 'superadmin' ORDER BY id DESC LIMIT 200")
        .all('%' + q81 + '%', '%' + q81 + '%');
    } else {
      users = await db.prepare("SELECT id, username, full_name, avatar_url, gender, role, status, created_at, last_login FROM users WHERE role != 'superadmin' ORDER BY id DESC LIMIT 200").all();
    }
  } catch (e) {}
  // সেশন ৯০: সাম্প্রতিক তদারকি-অ্যাকশন ফিড (সুপার-ড্যাশবোর্ডের ফিডের মিরর)
  let recentAudit = [];
  try {
    recentAudit = await db.prepare("SELECT actor_name, detail, created_at FROM audit_log WHERE table_name='users' AND action='status' AND detail LIKE 'moderator-oversight%' ORDER BY id DESC LIMIT 8").all();
  } catch (e) {}
  res.render('user/moderator-users', { users, q81, recentAudit, currentPath: '/moderator/users', saved: req.query.saved || null, err: req.query.err || null });
});

// নিষেধ/ফেরত — শুধু status টগল; role এখানে অপরিবর্তনীয় (হায়ারার্কি)
// সেশন ৯০: কারণ (ঐচ্ছিক, ≤৩০০ অক্ষর) + টার্গেট-ইউজার বিজ্ঞপ্তি + audit-এ কারণ
router.post('/users/:id/status', ensureModerator, requireScope('user_mgmt'), async (req, res) => {
  const status81 = String(req.body.status || '');
  if (!['active', 'banned'].includes(status81)) return res.redirect('/moderator/users?err=1');
  const reason90 = String(req.body.reason || '').trim().slice(0, 300);
  if (reason90.length >= 300) return res.redirect('/moderator/users?err=reason');
  const target = await db.prepare("SELECT id, username, role, status FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.redirect('/moderator/users?err=1');
  // স্টাফ-অ্যাকাউন্ট (moderator/admin/superadmin) মডারেটর ছুঁতে পারবেন না —
  // সেটি ঊর্ধ্বতন-স্তরের (এডমিন/সুপার-এডমিন) এখতিয়ার।
  if (target.role && target.role !== 'user') return res.redirect('/moderator/users?err=staff');
  if (target.status !== status81) {
    await db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status81, req.params.id);
    const auditDetail = 'moderator-oversight: ' + target.username + ' → ' + status81 + (reason90 ? ' — কারণ: ' + reason90 : '');
    await TA42.audit(db, req, 'status', 'users', req.params.id, auditDetail);
    // টার্গেট-ইউজারকে বিজ্ঞপ্তি (নিষেধ হলে ফেরত-এলে পড়তে পারবেন; ফেরতেও জানবেন)
    const isBan = status81 === 'banned';
    await notifyUser(
      target.id,
      'moderation',
      isBan ? 'আপনার অ্যাকাউন্ট সাময়িক নিষেধ করা হয়েছে' : 'আপনার অ্যাকাউন্টের নিষেধ প্রত্যাহৃত হয়েছে',
      isBan
        ? ('ফোরাম-নিয়ম ভঙ্গের তদারকি-সিদ্ধান্তে আপনার অ্যাকাউন্ট সাময়িক নিষেধ (banned) করা হয়েছে।' + (reason90 ? ' কারণ: ' + reason90 : ' কারণ উল্লেখ করা হয়নি — বিস্তারিত জানতে অভিযোগ/যোগাযোগ চ্যানেল ব্যবহার করুন।'))
        : ('তদারকি-পর্যালোচনায় আপনার অ্যাকাউন্ট আবার সক্রিয় (active) করা হয়েছে — ফোরামে অংশগ্রহণ চালিয়ে যেতে পারেন।' + (reason90 ? ' নোট: ' + reason90 : '')),
      '/notifications'
    );
  }
  res.redirect('/moderator/users?saved=1');
});

module.exports = router;
