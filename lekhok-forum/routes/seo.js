const express = require('express');
const router = express.Router();
const db = require('../db');

// ── SEO routes: /sitemap.xml (dynamic) + /robots.txt ────────────────────────
// Sitemap combines stable public pages with DB-driven content (published
// articles, Q&A questions, notices) so search engines can crawl everything.
// lastmod comes from updated_at/created_at (SQLite "YYYY-MM-DD HH:MM:SS" → ISO).

// Only genuinely public pages — everything behind auth or admin is excluded.
const STATIC_PAGES = [
  { path: '/',                  priority: '1.0', changefreq: 'daily'   },
  { path: '/articles',          priority: '0.9', changefreq: 'daily'   },
  { path: '/committee',         priority: '0.8', changefreq: 'monthly' },
  { path: '/committee/past',    priority: '0.6', changefreq: 'monthly' },
  { path: '/committee/advisory',priority: '0.6', changefreq: 'monthly' },
  { path: '/members',           priority: '0.7', changefreq: 'weekly'  },
  { path: '/about',             priority: '0.7', changefreq: 'monthly' },
  { path: '/constitution',      priority: '0.5', changefreq: 'yearly'  },
  { path: '/notices',           priority: '0.7', changefreq: 'daily'   },
  { path: '/events',            priority: '0.7', changefreq: 'weekly'  },
  { path: '/activities',        priority: '0.6', changefreq: 'weekly'  },
  { path: '/gallery',           priority: '0.6', changefreq: 'weekly'  },
  { path: '/resources',         priority: '0.6', changefreq: 'monthly' },
  { path: '/qa',                priority: '0.6', changefreq: 'daily'   },
  { path: '/epaper',            priority: '0.5', changefreq: 'daily'   },
  { path: '/best-writer',       priority: '0.5', changefreq: 'monthly' },
  { path: '/contact',           priority: '0.5', changefreq: 'yearly'  },
];

// SQLite CURRENT_TIMESTAMP → ISO 8601 (treated as UTC), safe fallback to null
function toISO(ts) {
  if (!ts) return null;
  try {
    const d = new Date(String(ts).replace(' ', 'T') + (String(ts).includes('Z') ? '' : 'Z'));
    return isNaN(d) ? null : d.toISOString();
  } catch (_) { return null; }
}

function xmlEscape(s) {
  return String(s || '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    const todayISO = new Date().toISOString().split('T')[0];

    const urls = STATIC_PAGES.map(p => ({
      loc: siteUrl + p.path,
      lastmod: todayISO,
      changefreq: p.changefreq,
      priority: p.priority,
    }));

    // Published articles + Q&A questions (public singles)
    try {
      const posts = await db.prepare("SELECT id, type, created_at FROM posts WHERE status = 'published' AND type IN ('article', 'question') ORDER BY id DESC LIMIT 2000").all();
      for (const p of posts) {
        urls.push({
          loc: `${siteUrl}/${p.type === 'question' ? 'qa' : 'articles'}/${p.id}`,
          lastmod: (toISO(p.created_at) || todayISO).split('T')[0],
          changefreq: 'monthly',
          priority: p.type === 'article' ? '0.8' : '0.5',
        });
      }
    } catch (_) { /* posts query failed — static entries still served */ }

    // Notice detail pages
    try {
      const notices = await db.prepare('SELECT id, created_at FROM notices ORDER BY id DESC LIMIT 500').all();
      for (const n of notices) {
        urls.push({
          loc: `${siteUrl}/notices/${n.id}`,
          lastmod: (toISO(n.created_at) || todayISO).split('T')[0],
          changefreq: 'monthly',
          priority: '0.5',
        });
      }
    } catch (_) { /* notices table missing — skip */ }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(u => '  <url>\n' +
        `    <loc>${xmlEscape(u.loc)}</loc>\n` +
        `    <lastmod>${u.lastmod}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        '  </url>').join('\n') +
      '\n</urlset>';

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (_) {
    // Never 500 — search engines should always get a valid (if shorter) sitemap
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>');
  }
});

router.get('/robots.txt', (req, res) => {
  const siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /admin\n' +
    'Disallow: /api/\n' +
    'Disallow: /dashboard\n' +
    'Disallow: /messages\n' +
    'Disallow: /bookmarks\n' +
    'Disallow: /settings\n' +
    'Disallow: /articles/new\n' +
    'Disallow: /qa/new\n' +
    'Disallow: /avatar/\n' +
    '\n' +
    `Sitemap: ${siteUrl}/sitemap.xml\n`
  );
});

module.exports = router;
