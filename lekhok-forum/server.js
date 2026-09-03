const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');
const { runBirthdayCheck } = require('./helpers/notify');

const app = express();
const PORT = process.env.PORT || 8080;

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

// ── Locals middleware ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  runBirthdayCheck();  // cheap date-guarded check, runs once per day per process
  res.locals.siteName  = db.getSetting('site_name') || 'লেখক ফোরাম';
  res.locals.tagline   = db.getSetting('tagline')  || 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়';
  res.locals.adminUser = req.session.adminUser || null;
  res.locals.user      = req.session.user || null;          // social user session
  res.locals.currentPath = req.path;
  res.locals.getSetting  = db.getSetting;

  // Unread notification count
  if (req.session.user) {
    const row = db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(req.session.user.id);
    res.locals.unread = row.c;
    const recent = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").all(req.session.user.id);
    res.locals.recentNotifs = recent;
  } else {
    res.locals.unread = 0;
    res.locals.recentNotifs = [];
  }

  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/',          require('./routes/auth'));    // login, register, logout, profile edit
app.use('/',          require('./routes/social'));   // articles, qa, members, profile, follow, api
app.use('/',          require('./routes/daily'));    // quiz, on-this-day, epaper, activities, birthdays, etc.
app.use('/',          require('./routes/dashboard'));// dashboard feed, gallery, messages, complaints
app.use('/avatar',    require('./routes/avatar'));   // default avatar serving
app.use('/moderator', require('./routes/moderator'));// scoped moderator posting panel
app.use('/',          require('./routes/pages'));
app.use('/api',      require('./routes/api'));
app.use('/admin',    require('./admin/routes'));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
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
