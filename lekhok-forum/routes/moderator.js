const express = require('express');
const router = express.Router();
const db = require('../db');
const { broadcastToAll } = require('./dashboard');
const { validateNavJson, parseNav } = require('../helpers/nav');
const { pressUpload, withUpload } = require('../middleware/upload');

// সেশন ৪৪: পারমিশন-ত্রুটিতে আগে `404` টেমপ্লেট রেন্ডার হতো — সেভ/এডিটের পর
// রিডাইরেক্টে ভুল স্কোপ/রোল পেলে ইউজার "ভুল ৪০৪ পেজ" দেখত। এখন সঠিক "অনুমতি নেই"
// পেজ দেখাই (admin/denied), ৪০৪ নয়।
function ensureModerator(req, res, next) {
  if (!req.session.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.session.user.role !== 'moderator' && req.session.user.role !== 'admin') {
    return res.status(403).render('admin/denied', { currentPath: '/moderator', homePath: '/moderator' });
  }
  next();
}

function requireScope(scope) {
  return async (req, res, next) => {
    if (req.session.user.role === 'admin') return next(); // admin implicitly has every scope
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
    if (u && u.role === 'admin') {
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
  const myScopes = req.session.user.role === 'admin'
    ? db.MODERATOR_SCOPES.map(s => s.key)
    : await db.getModeratorScopes(req.session.user.id);
  // Stats for dashboard
  let stats = { notices: 0, events: 0, daily: 0 };
  try { stats.notices = (await db.prepare('SELECT COUNT(*) as c FROM notices').get()).c; } catch(e) {}
  try { stats.events = (await db.prepare('SELECT COUNT(*) as c FROM events').get()).c; } catch(e) {}
  try { stats.daily = (await db.prepare('SELECT COUNT(*) as c FROM daily_content WHERE published = 1').get()).c; } catch(e) {}
  res.render('user/moderator-dashboard', {
    scopes: db.MODERATOR_SCOPES,
    myScopes,
    scopeAliases: db.SCOPE_ALIASES,
    dailyContentScopes: db.DAILY_CONTENT_SCOPES,
    stats,
    currentPath: '/moderator'
  });
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
    res.render('user/moderator-daily-form', { type: req.params.type, meta, items, todayDate: today(), posted: req.query.posted || null, currentPath: '/moderator' });
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
    const r = await db.prepare(`INSERT INTO daily_content (content_type, title, body, image_url, link_url, scheduled_date, author_id, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
      .run(req.params.type, title, body || '', cover, link_url || '', scheduled_date || today(), req.session.user.id);
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

module.exports = router;
