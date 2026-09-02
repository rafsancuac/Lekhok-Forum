const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'admin', 'views')
]);
app.use(expressLayouts);
app.set('layout', false); // We use our own layout

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'lekhok-forum-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// ── Locals middleware ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.siteName = db.getSetting('site_name') || 'লেখক ফোরাম';
  res.locals.tagline  = db.getSetting('tagline')  || 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়';
  res.locals.adminUser = req.session.adminUser || null;
  res.locals.currentPath = req.path;
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/',     require('./routes/pages'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./admin/routes'));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { layout: false, siteName: 'লেখক ফোরাম' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  লেখক ফোরাম server running at http://localhost:${PORT}\n`);
  console.log(`  Admin panel:  http://localhost:${PORT}/admin\n`);
});
