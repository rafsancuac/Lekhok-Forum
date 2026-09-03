const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');
const { runBirthdayCheck } = require('./helpers/notify');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Async-handler safety net ─────────────────────────────────────────────────
// The async/Turso migration turned every route handler into an async function.
// Express 4 does not catch rejected promises from handlers, so wrap every
// Router-registered handler: a rejection is forwarded to next(err) and lands
// in the error middleware at the bottom of this file. Sync handlers are
// unaffected; 4-arg error handlers are passed through untouched.
(function patchExpressRouter() {
  const Router = express.Router;
  const wrap = (h) => {
    if (typeof h !== 'function' || h.length >= 4) return h;
    return function (req, res, next) {
      try {
        const p = h(req, res, next);
        if (p && typeof p.catch === 'function') p.catch(next);
      } catch (e) { next(e); }
    };
  };
  express.Router = function (...args) {
    const r = Router.apply(this, args);
    for (const m of ['get', 'post', 'put', 'delete', 'patch', 'use', 'all']) {
      const orig = r[m];
      r[m] = function (...handlers) { return orig.apply(r, handlers.map(wrap)); };
    }
    return r;
  };
})();

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'admin', 'views')
]);
app.use(expressLayouts);
app.set('layout', false);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'lekhok-forum-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ── Locals middleware (async — DB awaited; settings pre-loaded once) ────────
app.use(async (req, res, next) => {
  try {
    runBirthdayCheck().catch(() => {});  // cheap date-guarded check, once per day per process
    // One settings query per request; EJS templates get a SYNC accessor via
    // res.locals.getSetting (templates cannot await) — identical behaviour
    // on the sql.js and Turso backends.
    const settings = await db.getSettingsAll();
    res.locals.siteName   = settings['site_name'] || 'লেখক ফোরাম';
    res.locals.tagline    = settings['tagline']   || 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়';
    res.locals.getSetting = (k) => (k in settings ? settings[k] : null);
    res.locals.adminUser = req.session.adminUser || null;
    res.locals.user      = req.session.user || null;          // social user session
    res.locals.currentPath = req.path;

    // Per-user display prefs (theme / font size) — consumed by header partial
    res.locals.displayPrefs = {};
    if (req.session.user) {
      try {
        const row = await db.prepare('SELECT display_prefs FROM users WHERE id = ?').get(req.session.user.id);
        if (row && row.display_prefs) res.locals.displayPrefs = JSON.parse(row.display_prefs) || {};
      } catch (_) {}
    }

    // Unread notification count
    if (req.session.user) {
      const row = await db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(req.session.user.id);
      res.locals.unread = row.c;
      const recent = await db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").all(req.session.user.id);
      res.locals.recentNotifs = recent;
    } else {
      res.locals.unread = 0;
      res.locals.recentNotifs = [];
    }

    next();
  } catch (e) { next(e); }
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/',          require('./routes/auth'));    // login, register, logout, profile edit
app.use('/',          require('./routes/social'));   // articles, qa, members, profile, follow, api
app.use('/',          require('./routes/daily'));    // quiz, on-this-day, epaper, activities, birthdays, etc.
app.use('/',          require('./routes/pages'));     // public pages: home, about, gallery, committee, contact, events, resources, notices
app.use('/',          require('./routes/dashboard'));// dashboard feed, messages, complaints
app.use('/avatar',    require('./routes/avatar'));   // default avatar serving
app.use('/moderator', require('./routes/moderator'));// scoped moderator posting panel
app.use('/api',      require('./routes/api'));
app.use('/admin',    require('./admin/routes'));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
});

// ── Error middleware (async/Turso rejections land here) ─────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[express]', req.method, req.originalUrl, '—', err && err.message);
  if (res.headersSent) return;
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: 'server' });
  }
  res.status(500).send('সার্ভার সমস্যা — কিছুক্ষণ পর আবার চেষ্টা করুন।');
});

// ── Start (after DB init) ───────────────────────────────────────────────────
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  লেখক ফোরাম server running at http://localhost:${PORT}`);
    console.log(`  Admin panel:  http://localhost:${PORT}/admin`);
    console.log(`  Login:        admin / admin123\n`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// ── Graceful shutdown: force-flush the debounced sql.js DB to disk ──────────
// Without this, a restart/redeploy/Ctrl+C within the ~200ms save-debounce
// window silently drops the most recent writes (registrations, posts, etc.)
function shutdown(signal) {
  console.log(`\n  ${signal} পেয়েছি — ডাটাবেজ সেভ করে বন্ধ হচ্ছে...`);
  try { db.saveDb(); } catch (e) { console.error('Shutdown save failed:', e.message); }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
