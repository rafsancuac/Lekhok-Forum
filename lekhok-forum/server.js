const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');
const { runBirthdayCheck } = require('./helpers/notify');
const { parseNav, visibleNav, navItemActive } = require('./helpers/nav');

// ── সেশন ৪৪-পরিপূরক: async রুট-এরর অটো-ক্যাচ (ইনফিনিট স্পিনারের মূল ফিক্স) ──
// Express 4 async হ্যান্ডলার/মিডলওয়্যারের ভেতরে throw হওয়া এরর ক্যাচ করে না —
// তখন রেসপন্স কখনো পাঠানো হয় না, রিকোয়েস্ট হ্যাং করে (ব্রাউজারে স্পিনার ঘুরতেই
// থাকে) এবং শেষে প্রক্সি/Vercel টাইমআউটে ভুল পেজ দেখায়। নিচের প্যাচটি বুটের
// শুরুতেই Express-এর Route.prototype ভার্ভ মেথড ও Router.prototype.use প্যাচ করে —
// যেকোনো AsyncFunction অটো `.catch(next)` পাবে, এরর গ্লোবাল এরর-মিডলওয়্যারে
// গিয়ে দ্রুত সঠিক ৫০০/এরর রেসপন্স দেবে। রুট কোড/আর্কিটেকচার অপরিবর্তিত,
// নতুন ডিপেন্ডেন্সি নেই। sync হ্যান্ডলার আগের মতোই Express নিজে ক্যাচ করে।
(function patchAsyncErrors44() {
  try {
    const probe = express.Router();
    const routeProto = Object.getPrototypeOf(probe.route('/__probe44'));
    const wrap44 = (fn) => (fn && fn.constructor && fn.constructor.name === 'AsyncFunction')
      ? function (req, res, next) { return fn.call(this, req, res, next).catch(next); }
      : fn;
    ['get', 'post', 'put', 'patch', 'delete', 'all'].forEach(function (verb) {
      const orig = routeProto[verb];
      if (typeof orig !== 'function') return;
      routeProto[verb] = function () {
        const args = Array.prototype.slice.call(arguments).map(wrap44);
        return orig.apply(this, args);
      };
    });
    // router.use()/app.use()-এর async মিডলওয়্যারও কভার (লোকালস/CSRF/ভিজিট-ট্র্যাকিং)
    const routerProto = Object.getPrototypeOf(probe);
    const origUse = routerProto.use;
    routerProto.use = function () {
      const args = Array.prototype.slice.call(arguments).map(wrap44);
      return origUse.apply(this, args);
    };
  } catch (e) { console.error('[async44] patch failed:', e.message); }
})();

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
// সেশন ৪৩: compression + সিকিউরিটি হেডার
// সিকিউরিটি টাস্ক: + Content-Security-Policy (frame-ancestors/object-src/base-uri/
// form-action) + ক্যাশ-কন্ট্রোল। CSP-তে script-src 'unsafe-inline' আছে কারণ অ্যাপে
// বহু inline <script> ব্যবহৃত (nonce-মাইগ্রেশন ভবিষ্যৎ উন্নতি হিসেবে ডকুমেন্ট করা)।
try { app.use(require('compression')()); } catch (e) {}
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "font-src 'self' https://cdnjs.cloudflare.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests"
].join('; ');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', CSP_POLICY);
  if (req.secure || req.get('x-forwarded-proto') === 'https') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// সিকিউরিটি টাস্ক (§63): অথেনটিকেটেড/প্রাইভেট পেজ কখনো পাবলিক ক্যাশ হবে না।
// সেশন ৫৭: login/register-ও যোগ — স্টেল-ক্যাশড অথ-পেজ পুরনো CSRF-টোকেন বহন
// করে, সাবমিটে 403 আসত (লাইভ-রিপোর্ট)।
app.use((req, res, next) => {
  if (/^\/(admin|moderator|dashboard|profile|settings|claim|login|logout|register|reset-password|forgot-password)\b/.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});
// সেশন ৫০ (পারফরম্যান্স): স্ট্যাটিক অ্যাসেটে দীর্ঘ Cache-Control।
// /assets/* (CSS/JS/ফন্ট) `?v=<AV>` দিয়ে bust হয়; /uploads/* timestamp-ফাইলনামে
// কনটেন্ট-অ্যাড্রেসড — তাই immutable (৩০ দিন) নিরাপদ। অন্য স্ট্যাটিক ১ দিন।
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    let rel = filePath.replace(path.join(__dirname, 'public'), '').replace(/\\/g, '/');
    if (rel.startsWith('/assets/') || rel.startsWith('/uploads/')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// সেশন ৪৪: method-override-এর ডিফল্ট getter শুধু কুয়েরি-স্ট্রিং থেকে `_method`
// পড়ে (non-"X-" prefix → createQueryGetter) — বডিতে hidden `_method` ফিল্ড পাঠালে
// সেটি উপেক্ষা হয়, ফলে PUT/DELETE এডিট-ফর্ম POST হিসেবেই থেকে যায় এবং রাউট না
// মেলায় ৪০৪ দেয়। এখন কুয়েরি ও বডি দুটোই চেক করি যাতে এডিট/আপডেট ফর্ম কখনো
// ৪০৪ না পায়। (req.body.urlencoded পার্সের পরে আসে বলে বডি এখানে পাওয়া যায়।)
app.use(methodOverride(function (req) {
  if (req.body && typeof req.body === 'object' && req.body._method) {
    const m = req.body._method;
    delete req.body._method;
    return m;
  }
  return req.query._method;
}));
if (process.env.VERCEL) app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'lekhok-forum-secret-key-change-in-production',
  store: new (require('./session-store'))(),  // DB-backed — MemoryStore loses logins across serverless instances
  resave: false,
  saveUninitialized: false,
  // সেশন ৪৭: rolling — সক্রিয় রিকোয়েস্টে কুকি/সেশন মেয়াদ রিসেট হয়, ফলে সক্রিয়
  // ইউজার ২৪ ঘণ্টার সীমায় অহেতুক লগআউট হয় না (মেয়াদ = নিষ্ক্রিয়তার ২৪ ঘণ্টা পরে)।
  rolling: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax', secure: process.env.VERCEL ? 'auto' : false }
}));

// ── সেশন ৫৭: CSRF — ডাবল-সাবমিট কুকি + গ্রেসফুল ফেইল ──────────────────────────
// লাইভ-রিপোর্টেড বাগ: async সেশন-স্টোর (Turso) + Vercel lambda-freeze-এ
// csrfToken-এর সেশন-রাইট মাঝে মাঝে হারিয়ে যায় → ফর্মে রেন্ডার-হওয়া টোকেন
// সেশনের সাথে আর মেলে না → প্রতিটি POST কাঁচা 403 টেক্সে মরে যেত (লগইন,
// 2FA-কনফার্ম, ট্র্যাশ-অ্যাকশন সবকিছু)। ফিক্স দুই স্তরে:
//   ১) টোকেন এখন রেসপন্স-কুকিতেও যায় (_csrfTok) — কুকি যেই রেসপন্সে ফর্ম
//      রেন্ডার হয় ঠিক সেই রেসপন্সেই সেট হয়, তাই স্টোর-রেস/ল্যাম্বডা-ফ্রিজ
//      থাকুক-না-থাকুক ফর্ম+কুকি ব্রাউজারে সবসময় সিঙ্কড থাকে।
//      যাচাই: সেশন-টোকেন অথবা কুকি-টোকেন — যেকোনোটির সাথে মিললেই পাস।
//   ২) ব্যর্থ হলে কাঁচা 403 নয় — ফর্ম-পেজে 303 রিডাইরেক্ট (?csrf=1; main.js
//      টোস্ট দেখায়)। নতুন পেজে নতুন বৈধ টোকেন, রিট্রাই সফল হয়।
const crypto42 = require('crypto');
const CSRF_COOKIE57 = '_csrfTok';
function parseCookies57(headerVal) {
  const out = {};
  if (!headerVal) return out;
  for (const part of String(headerVal).split(';')) {
    const i = part.indexOf('=');
    if (i > 0) {
      try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); }
      catch (e) { out[part.slice(0, i).trim()] = part.slice(i + 1).trim(); }
    }
  }
  return out;
}
app.use(async (req, res, next) => {
  try {
    if (!req.cookies) req.cookies = parseCookies57(req.headers.cookie);
    // টোকেন-উৎস: সেশন → কুকি → নতুন জেনারেট
    let tok57 = req.session.csrfToken || req.cookies[CSRF_COOKIE57];
    if (!tok57 || !/^[a-f0-9]{20,}$/i.test(String(tok57))) tok57 = crypto42.randomBytes(18).toString('hex');
    req.session.csrfToken = tok57;   // সেশন-কপি best-effort; নির্ভরযোগ্য উৎস কুকি
    res.locals.csrfToken = tok57;
    res.cookie(CSRF_COOKIE57, tok57, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000, secure: process.env.VERCEL ? 'auto' : false });
    res.locals.undoTrash = req.query.trashed || null;
    res.locals.undoBulk42 = (req.query.undo_mode && req.query.undo_ids) ? { mode: req.query.undo_mode, ids: String(req.query.undo_ids).split(','), base: req.query.undo_base || '' } : null;
    res.locals.undoSec42 = req.query.undo_sec || null;
    // সেশন ৪৩: সাইডবার ট্র্যাশ ব্যাজ (স্টাফ পেজে, রেন্ডারের আগে)
    const staff43 = req.session && (req.session.adminUser || (req.session.user && /moderator|admin/.test(req.session.user.role)));
    if (staff43 && (req.path.startsWith('/admin') || req.path.startsWith('/moderator'))) {
      try { const rc = await db.prepare('SELECT COUNT(*) AS c FROM trash').get(); res.locals.trashCount42 = rc ? rc.c : 0; } catch (e) {}
    }
    res.locals.restoredFlag = req.query.restored || null;
  } catch (e) { /* কুকি-পার্স ব্যর্থ হলেও রুট চালু থাকে */ }
  if (req.method === 'POST' && (req.is('urlencoded') || req.is('multipart'))) {
    const sent57 = (req.body && req.body._csrf) || req.headers['x-csrf-token'] || req.query._csrf;
    const sess57 = req.session ? req.session.csrfToken : null;
    const cookie57 = req.cookies ? req.cookies[CSRF_COOKIE57] : null;
    if (!sent57 || (String(sent57) !== String(sess57) && String(sent57) !== String(cookie57))) {
      console.warn('[csrf] blocked', req.method, req.originalUrl);
      if (req.is('json') || String(req.headers.accept || '').includes('application/json')) {
        return res.status(403).json({ ok: false, error: 'নিরাপত্তা যাচাই পুরনো হয়ে গিয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।' });
      }
      // গ্রেসফুল রিকভারি: যেখান থেকে এসেছে সেই ফর্ম-পেজে ফেরত (?csrf=1 টোস্ট-সহ)
      let back57 = '/';
      try {
        const ref57 = req.get('referer');
        if (ref57) {
          const u57 = new URL(ref57, 'http://_csrf57_');
          if (u57.pathname && u57.pathname !== req.path) back57 = u57.pathname + (u57.search || '');
        }
      } catch (e) {}
      back57 += (back57.includes('?') ? '&' : '?') + 'csrf=1';
      return res.redirect(303, back57);
    }
  }
  next();
});

// নিউজলেটার সাবস্ক্রাইব রেট-লিমিট: প্রতি IP-তে ১০ মিনিটে সর্বোচ্চ ৩বার
const _nlHits42 = new Map();
app.use('/api/newsletter/subscribe', (req, res, next) => {
  if (req.method !== 'POST') return next();
  const ip = req.ip || req.connection.remoteAddress || 'x';
  const now = Date.now();
  const arr = (_nlHits42.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (arr.length >= 3) {
    return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা হয়েছে — ১০ মিনিট পর আবার চেষ্টা করুন।' });
  }
  arr.push(now); _nlHits42.set(ip, arr);
  next();
});

// ── "সেভের পর ৪০৪"-এর পার্মানেন্ট ফিক্স (Vercel serverless) ──────────────────
// স্ন্যাপশট-মোডে POST লেখে ইনস্ট্যান্স A-তে; রিডাইরেক্টের GET নামতে পারে ইনস্ট্যান্স B-তে,
// তখনো স্ন্যাপশট আপলোড না হয়ে থাকলে B পুরনো DB দেখে → নতুন রো নেই → ৪০৪।
// তাই রিডাইরেক্টের আগে স্ন্যাপশট ফ্লাশ করে নিই — পরের রিকোয়েস্ট সবসময় নতুন অবস্থা পায়।
app.use((req, res, next) => {
  if (db.snapshotActive) {
    const origRedirect = res.redirect.bind(res);
    res.redirect = function (...args) {
      const fin = () => origRedirect(...args);
      const flushThenGo = () => Promise.resolve(db.flushDb()).then(fin, fin);
      // সেশন-রাইট (লগইন/রেজিস্টার) আগে DB-তে ঢুকিয়ে তারপর স্ন্যাপশট ফ্লাশ
      if (req.session && typeof req.session.save === 'function') req.session.save(() => flushThenGo());
      else flushThenGo();
    };
    // JSON-রেসপন্স (API-সেভ) আগেও ফ্লাশ — নাহলে পরের ইনস্ট্যান্স পুরনো ডেটা দেখবে
    const origJson = res.json.bind(res);
    res.json = function (...args) {
      if (req.method === 'GET') return origJson(...args);
      const fin = () => origJson(...args);
      Promise.resolve(db.flushDb()).then(fin, fin);
    };
  }
  next();
});

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
    res.locals.siteName   = settings['site_name'] || 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়';
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
    // সেশন ৪৯: প্রতি পেজের SEO meta title/description (content-registry-র seo গ্রুপ)
    // path→page ম্যাপিং: EXACT ম্যাচ (ডিটেইল-পেজে ভিউ-এর নিজস্ব টাইটেল প্রাধান্য পায়)।
    // layout ('/') বাদ — হেডার/ফুটার নিজস্ব পেজ নয়; হোম = '/'-এ exact।
    res.locals.seoTitle = '';
    res.locals.seoDesc  = '';
    try {
      const path0 = (req.path || '/').replace(/\/+$/, '') || '/';
      let matched = (contentRegistry.PAGES || []).find(p => p.key !== 'layout' && String(p.path || '') === path0);
      if (!matched && path0 === '/') matched = (contentRegistry.PAGES || []).find(p => p.key === 'home');
      if (matched) {
        res.locals.seoTitle = C(matched.key + '_meta_title', settings);
        res.locals.seoDesc  = C(matched.key + '_meta_desc', settings);
      }
    } catch (_) { /* SEO defaults optional — never break rendering */ }
    res.locals.adminUser = req.session.adminUser || null;
    res.locals.user      = req.session.user || null;          // social user session
    res.locals.currentPath = req.path;
    // Canonical site URL for SEO (OG/canonical/sitemap) — SITE_URL env wins
    res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    // Public nav (editable from admin/moderator panel — settings key nav_json)
    res.locals.navConfig = visibleNav(parseNav(settings['nav_json']));
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
// সেশন ৫৭: render/send-ও র‍্যাপ — Vercel lambda রেসপন্সের পরে ফ্রিজ করে; রেন্ডার-
// রেসপন্সের অসম্পূর্ণ সেশন-রাইট (যেমন নতুন csrfToken বা session.user) হারিয়ে গিয়ে
// ইনকনসিস্টেন্ট সেশন-স্টেট (redirect-loop, CSRF-ব্যর্থতা) তৈরি করত।
app.use((req, res, next) => {
  const origRedirect = res.redirect.bind(res);
  const origJson = res.json.bind(res);
  const origRender = res.render.bind(res);
  const origSend = res.send.bind(res);
  
  function saveThen(cb) {
    if (req.session && typeof req.session.save === 'function' && !req._sessionSaving) {
      req._sessionSaving = true;
      // সেশন ৪৬: সেফটি-নেট — সেশন-রাইট (Turso/DB) ধীর বা হ্যাং করলেও রিডাইরেক্ট
      // সর্বোচ্চ ~১.৫ সেকেন্ডে ঘটে; নাহলে ইউজার "লোডিং শেষ হয় না" অবস্থায় আটকে যায়।
      let finished = false;
      const finish = () => { if (!finished) { finished = true; req._sessionSaving = false; return cb(); } };
      const t = setTimeout(finish, 1500);
      try {
        return req.session.save((err) => {
          if (err) console.error('[session-save] before response:', err);
          clearTimeout(t);
          finish();
        });
      } catch (e) {
        clearTimeout(t);
        finish();
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
  res.render = function (...args) {
    return saveThen(() => origRender(...args));
  };
  res.send = function (body) {
    return saveThen(() => origSend(body));
  };
  next();
});

// ── সেশন ৪৪: পেজ-ভিজিট ট্র্যাকিং (অ্যানালিটিক্স ভিজিট ট্রেন্ড) ────────────────
// শুধু পাবলিক HTML পেজ-ভিউ গণনা করি (স্ট্যাটিক অ্যাসেট/API/অ্যাডমিন-মডারেটর বাদ)।
// page_visits(path, day) → count+1 (UNIQUE path+day upsert)। ফায়ার-অ্যান্ড-ফরগেট:
// রেসপন্স কখনো ব্লক হয় না (Turso-তে নেটওয়ার্ক RTT যোগ করি না); best-effort কাউন্টার।
app.use((req, res, next) => {
  try {
    if (req.method === 'GET' && !/^\/(api|assets|uploads|avatar|admin|moderator)\b/.test(req.path) && !/\.[a-zA-Z0-9]{2,5}$/.test(req.path)) {
      const day = new Date().toISOString().slice(0, 10);
      const r = db.prepare(
        `INSERT INTO page_visits (path, day, count) VALUES (?, ?, 1)
         ON CONFLICT(path, day) DO UPDATE SET count = count + 1`
      ).run(req.path, day);
      // sql.js → sync result; Turso → promise (fire-and-forget, no unhandled rejection)
      if (r && typeof r.catch === 'function') r.catch(() => {});
    }
  } catch (e) {}
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/',          require('./routes/seo'));      // sitemap.xml + robots.txt
app.use('/',          require('./routes/auth'));    // login, register, logout, profile edit
app.use('/',          require('./routes/member-accounts')); // টাস্ক ১৪: find/claim মেম্বার অ্যাকাউন্ট
app.use('/',          require('./routes/social'));   // articles, qa, members, profile, follow, api
app.use('/',          require('./routes/daily'));    // quiz, on-this-day, epaper, activities, birthdays, etc.
app.use('/',          require('./routes/pages'));     // public pages: home, about, gallery, committee, contact, events, resources, notices
app.use('/',          require('./routes/dashboard'));// dashboard feed, messages, complaints
app.use('/avatar',    require('./routes/avatar'));   // default avatar serving
app.use('/moderator', require('./routes/moderator'));// scoped moderator posting panel
app.use('/api',      require('./routes/api'));
app.use('/admin',    require('./admin/routes'));

// ── 404 handler ──────────────────────────────────────────────────────────────
// সেশন ৪৪-পরিপূরক: ফর্ম-সেভ (POST) কখনো ৪০৪ পেজে শেষ হবে না — আনম্যাচড POST
// হলে রেফারার পেজেই ?saveerr=1 দিয়ে ফেরত পাঠানো হয়, সেখানে এরর-টোস্ট দেখায়।
app.use((req, res) => {
  if (req.method === 'POST') {
    let back = '/';
    try {
      const ref = req.get('referer');
      if (ref) {
        const u = new URL(ref, 'http://_local_');
        if (u.pathname && u.pathname !== req.path) back = u.pathname + (u.search || '');
      }
    } catch (e) {}
    back += (back.includes('?') ? '&' : '?') + 'saveerr=1';
    return res.redirect(back);
  }
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
// 🔴 Critical: this module MUST export the express app for the Vercel
// serverless entrypoint (api/index.js does `app = require('../server')`).
// Previously nothing was exported — on Vercel every request crashed with
// "app is not a function" → FUNCTION_INVOCATION_FAILED (all pages 500).
// Local `node server.js` worked because it listens directly, which is why
// the bug never showed up in local testing.
if (require.main === module) {
  // Direct run: init DB once, then listen.
  db.initDb().then(() => {
    // সেশন ৩৮: স্ন্যাপশট সেফটি-নেট — ফ্লাশ-বেকি রাইট থাকলে ৫ সেকেন্ড পরপর আপলোড
    const _snapGuard = setInterval(() => {
      try { if (db.snapshotActive && db.snapshotDirty) db.flushDb(); } catch (e) {}
    }, 5000);
    if (_snapGuard && _snapGuard.unref) _snapGuard.unref();
    app.listen(PORT, () => {
      console.log(`\n  লেখক ফোরাম server running at http://localhost:${PORT}`);
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
// trigger
