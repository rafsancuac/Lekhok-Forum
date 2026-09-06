const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');
const { runBirthdayCheck } = require('./helpers/notify');
const { parseNav, navItemActive } = require('./helpers/nav');

const app = express();
const PORT = process.env.PORT || 8080;

// Vercel runs behind a CDN/proxy — tell Express to trust it so req.protocol,
// req.secure, and secure cookies work correctly.
app.set('trust proxy', 1);

// ── Asset cache-busting version ──────────────────────────────────────────────
// Hash of public/assets file sizes+mtimes at boot. Exposed to all views as
// `AV` (app.locals) and appended to hot asset URLs (?v=…) so a browser can
// never keep serving a stale main.js/style.css after an update + restart.
function computeAssetVersion() {
  let h = 5381;
  try {
    const walk = (d) => {
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else { h = ((h * 33) ^ (st.size + Math.floor(st.mtimeMs / 1000))) | 0; }
      }
    };
    walk(path.join(__dirname, 'public', 'assets'));
  } catch (e) { h = Date.now() & 0x7fffffff; }
  return (h >>> 0).toString(36);
}
app.locals.AV = computeAssetVersion();

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
  store: new (require('./session-store'))(),  // DB-backed — MemoryStore loses logins across serverless instances
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ── সম্পাদনাযোগ্য কনটেন্ট (সেশন ৩৩) — রেজিস্ট্রি + ভিউ-হেল্পার ──────────────────
// C(key)   → অ্যাডমিনের লেখা মান (settings 'content_'+key), খালি/না-থাকলে ডিফল্ট
// Cbr(key) → C(key) + HTML-escape + নতুন লাইন → <br/> (textarea ফিল্ডের জন্য)
const contentRegistry = require('./helpers/content-registry');
const { C, Cbr } = require('./helpers/content-view-helpers')(contentRegistry);

// ── Locals middleware (async — DB awaited; settings pre-loaded once) ────────
app.use(async (req, res, next) => {
  try {
    runBirthdayCheck().catch(() => {});  // cheap date-guarded check, once per day per process
    // One settings query per request; EJS templates get a SYNC accessor via
    // res.locals.getSetting (templates cannot await) — identical behaviour
    // on the sql.js and Turso backends.
    const settings = await db.getSettingsAll();
    res.locals.siteName   = settings['site_name'] || 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়';
    res.locals.tagline    = settings['tagline']   || 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়।';
    res.locals.motto      = settings['motto']     || 'তারুণ্যের শাণিত কলমে আলোকিত ধরনী';
    res.locals.getSetting = (k) => (k in settings ? settings[k] : null);
    res.locals.getContent = (page, section, key, fallback) => {
      const fullKey = 'content_' + page + '_' + section + '_' + key;
      return (fullKey in settings) ? settings[fullKey] : (fallback !== undefined ? fallback : '');
    };
    // কনটেন্ট হেল্পার — প্রতি রিকোয়েস্টে ফ্রেশ settings-এর সাথে বাঁধা (ক্যাশ-নিরাপদ)
    res.locals.C   = (key) => C(key, settings);
    res.locals.Cbr = (key) => Cbr(key, settings);
    res.locals.adminUser = req.session.adminUser || null;
    res.locals.user      = req.session.user || null;          // social user session
    res.locals.currentPath = req.path;
    // Canonical site URL for SEO (OG/canonical/sitemap) — SITE_URL env wins
    res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    // Public nav (editable from admin/moderator panel — settings key nav_json)
    res.locals.navConfig = parseNav(settings['nav_json']);
    res.locals.navItemActive = navItemActive;

    // Per-user display prefs (theme / font size) — consumed by header partial
    res.locals.displayPrefs = {};
    if (req.session.user) {
      try {
        const row = await db.prepare('SELECT username, full_name, role, status, avatar_url, gender, display_prefs FROM users WHERE id = ?').get(req.session.user.id);
        if (row && row.display_prefs) res.locals.displayPrefs = JSON.parse(row.display_prefs) || {};
        // session33 fix — role পরিবর্তন এখন সঙ্গে সঙ্গে কার্যকর (আগে re-login লাগত; §১২)।
        // প্রতি রিকোয়েস্টে ফ্রেশ role/নাম/অবতার সেশনে ফেরত; banned/inactive/ডিলিটেড
        // অ্যাকাউন্টের সেশন এখানেই বাতিল হয়ে যায়, তাই ensureAuth পথেও নত traps।
        if (!row || row.status === 'banned' || row.status === 'inactive') {
          req.session.user = null;
          res.locals.user = null;
        } else {
          req.session.user.username   = row.username;
          req.session.user.full_name  = row.full_name;
          req.session.user.avatar_url = row.avatar_url;
          req.session.user.gender     = row.gender;
          req.session.user.role       = row.role || 'user';
          res.locals.user = req.session.user;
        }
      } catch (_) {}
    }

    // Unread notification count
    if (req.session.user) {
      const row = await db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(req.session.user.id);
      res.locals.unread = row.c;
      const recent = await db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").all(req.session.user.id);
      res.locals.recentNotifs = recent;
      // Unread message conversations count
      try {
        const msgRow = await db.prepare("SELECT COUNT(*) as c FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE m.sender_id != ? AND m.is_read = 0 AND (c.user_a = ? OR c.user_b = ?)").get(req.session.user.id, req.session.user.id, req.session.user.id);
        res.locals.msgBadge = msgRow.c;
      } catch (_) { res.locals.msgBadge = 0; }
    } else {
      res.locals.unread = 0;
      res.locals.recentNotifs = [];
      res.locals.msgBadge = 0;
    }

    next();
  } catch (e) { next(e); }
});

// ── Global session-save-before-redirect middleware ────────────────────────────
// On Vercel serverless, routes that mutate req.session.* and then immediately
// res.redirect() risk the response being sent before the DB-backed session
// store has finished writing. The follow-up GET then sees no session.user
// and the 404 catch-all at the bottom of this file fires. This middleware
// wraps res.redirect so every redirect awaits the session write first.
// Routes that already call req.session.save(cb) explicitly remain safe — the
// express-session save is idempotent within a single request.
app.use((req, res, next) => {
  const origRedirect = res.redirect.bind(res);
  const origJson = res.json.bind(res);
  
  function saveThen(cb) {
    if (req.session && typeof req.session.save === 'function' && !req._sessionSaving) {
      req._sessionSaving = true;
      try {
        return req.session.save((err) => {
          req._sessionSaving = false;
          if (err) console.error('[session-save] before response:', err);
          return cb();
        });
      } catch (e) {
        req._sessionSaving = false;
        return cb();
      }
    }
    return cb();
  }
  
  res.redirect = function (url) {
    return saveThen(() => origRedirect(url));
  };
  res.json = function (data) {
    return saveThen(() => origJson(data));
  };
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/',          require('./routes/seo'));      // sitemap.xml + robots.txt
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
  res.status(404).render('404', { layout: false, siteName: 'বাংলাদেশ তরুণ কলাম লেখক ফোরাম' });
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
// 🔴 Critical: this module MUST export the express app for the Vercel
// serverless entrypoint (api/index.js does `app = require('../server')`).
// Previously nothing was exported — on Vercel every request crashed with
// "app is not a function" → FUNCTION_INVOCATION_FAILED (all pages 500).
// Local `node server.js` worked because it listens directly, which is why
// the bug never showed up in local testing.
if (require.main === module) {
  // Direct run: init DB once, then listen.
  db.initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`\n  বাংলাদেশ তরুণ কলাম লেখক ফোরাম server running at http://localhost:${PORT}`);
      console.log(`  Admin panel:  http://localhost:${PORT}/admin`);
      console.log(`  Login:        admin / admin123\n`);
    });
  }).catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}
// Serverless entry (api/index.js) awaits db.initDb() BEFORE requiring this
// module — so no side-effect init/listen is needed here.

module.exports = app;

// ── Graceful shutdown: force-flush the debounced sql.js DB to disk ──────────
// Without this, a restart/redeploy/Ctrl+C within the ~200ms save-debounce
// window silently drops the most recent writes (registrations, posts, etc.)
// In Blob-snapshot mode (Vercel, no Turso) flushDb() additionally force-
// uploads the snapshot so the latest state survives the instance dying.
function shutdown(signal) {
  console.log(`\n  ${signal} পেয়েছি — ডাটাবেজ সেভ করে বন্ধ হচ্ছে...`);
  try { db.saveDb(); } catch (e) { console.error('Shutdown save failed:', e.message); }
  // give the async Blob upload a brief window before exit
  const done = () => process.exit(0);
  if (db.USE_DB_SNAPSHOT && db.flushDb) {
    Promise.race([db.flushDb(), new Promise(r => setTimeout(r, 3000))]).then(done, done);
  } else {
    done();
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
