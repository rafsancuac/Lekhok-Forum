const express = require('express');
const router = express.Router();
const db = require('../db');

// ── SEO routes: /sitemap.xml + /rss.xml (dynamic) + /robots.txt ──────────────
// Sitemap combines stable public pages with DB-driven content (published
// articles, Q&A questions, notices) so search engines can crawl everything.
// lastmod comes from updated_at/created_at (SQLite "YYYY-MM-DD HH:MM:SS" → ISO).
//
// সেশন ৭২ (GSC ইনডেক্সিং-ফিক্স):
//  • স্ট্যাটিক পেজে আর প্রতিদিনের fake `lastmod=আজ` যায় না — Google lastmod-এর
//    সাথে বাস্তব পরিবর্তন মিলতে না দেখলে সংকেতের প্রতি আস্থা হারায় (fake
//    freshness ক্রল-অগ্রাধিকার কমায়)। স্ট্যাটিক পেজে lastmod বাদ, ডাইনামিক
//    কনটেন্টে বাস্তব টাইমস্ট্যাম্প।
//  • /quiz, /achievements, /team, /birthdays, /on-this-day যোগ — সবই পাবলিক।
//  • /rss.xml যোগ — ডিসকভারি + এক্সটার্নাল ফিড-রিডার সিগন্যাল।

// Only genuinely public pages — everything behind auth or admin is excluded.
const STATIC_PAGES = [
  { path: '/',                  priority: '1.0', changefreq: 'daily'   },
  { path: '/articles',          priority: '0.9', changefreq: 'daily'   },
  { path: '/committee',         priority: '0.8', changefreq: 'monthly' },
  { path: '/committee/past',    priority: '0.6', changefreq: 'monthly' },
  { path: '/committee/advisory',priority: '0.6', changefreq: 'monthly' },
  { path: '/members',           priority: '0.7', changefreq: 'weekly'  },
  { path: '/about',             priority: '0.7', changefreq: 'monthly' },
  { path: '/press',             priority: '0.6', changefreq: 'monthly' },
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
  // সেশন ৭২: আগে নিচের ৫টি পাবলিক পেজ সাইটম্যাপেই ছিল না
  { path: '/quiz',              priority: '0.5', changefreq: 'daily'   },
  { path: '/achievements',      priority: '0.5', changefreq: 'monthly' },
  { path: '/team',              priority: '0.5', changefreq: 'monthly' },
  { path: '/birthdays',         priority: '0.4', changefreq: 'daily'   },
  { path: '/on-this-day',       priority: '0.4', changefreq: 'daily'   },
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

// RSS-এর জন্য HTML-এস্কেপ + সংক্ষিপ্ত বর্ণনা
function rssDesc(html) {
  const t = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > 300 ? t.slice(0, 300) + '…' : t;
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');

    const urls = STATIC_PAGES.map(p => ({
      loc: siteUrl + p.path,
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: null, // সৎ সিগন্যাল: বাস্তব পরিবর্তন-তারিখ জানা নেই — বাদ
    }));

    // Published articles + Q&A questions (public singles)
    try {
      const posts = await db.prepare("SELECT id, type, created_at, updated_at FROM posts WHERE status = 'published' AND type IN ('article', 'question') ORDER BY id DESC LIMIT 2000").all();
      for (const p of posts) {
        urls.push({
          loc: `${siteUrl}/${p.type === 'question' ? 'qa' : 'articles'}/${p.id}`,
          lastmod: (toISO(p.updated_at || p.created_at) || '').split('T')[0] || null,
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
          lastmod: (toISO(n.created_at) || '').split('T')[0] || null,
          changefreq: 'monthly',
          priority: '0.5',
        });
      }
    } catch (_) { /* notices table missing — skip */ }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(u => '  <url>\n' +
        `    <loc>${xmlEscape(u.loc)}</loc>\n` +
        (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
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

// ── RSS 2.0 ফিড — সর্বশেষ প্রকাশিত লেখা ও প্রশ্ন ────────────────────────────
router.get('/rss.xml', async (req, res) => {
  try {
    const siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    let items = [];
    try {
      const rows = await db.prepare(
        "SELECT p.id, p.type, p.title, p.excerpt, p.body, p.published_at, p.created_at, u.full_name AS author_name " +
        "FROM posts p JOIN users u ON p.author_id = u.id " +
        "WHERE p.status = 'published' AND p.type IN ('article','question') " +
        "ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT 20").all();
      items = rows;
    } catch (_) { /* DB না থাকলে খালি ফিড */ }

    const pubDate = items.length
      ? (toISO(items[0].published_at || items[0].created_at) || new Date().toUTCString())
      : new Date().toUTCString();

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
      '  <channel>\n' +
      `    <title>লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় — সাম্প্রতিক লেখা ও প্রশ্ন</title>\n` +
      `    <link>${xmlEscape(siteUrl)}/</link>\n` +
      '    <description>লেখক ফোরামের সদস্যদের প্রকাশিত কলাম, প্রবন্ধ, চিঠি ও প্রশ্নোত্তর।</description>\n' +
      '    <language>bn</language>\n' +
      `    <lastBuildDate>${new Date(pubDate).toUTCString()}</lastBuildDate>\n` +
      `    <atom:link href="${xmlEscape(siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />\n` +
      items.map(it => {
        const link = `${siteUrl}/${it.type === 'question' ? 'qa' : 'articles'}/${it.id}`;
        const dt = toISO(it.published_at || it.created_at);
        return '    <item>\n' +
          `      <title>${xmlEscape(it.title)}</title>\n` +
          `      <link>${xmlEscape(link)}</link>\n` +
          `      <guid isPermaLink="true">${xmlEscape(link)}</guid>\n` +
          (dt ? `      <pubDate>${new Date(dt).toUTCString()}</pubDate>\n` : '') +
          `      <description>${xmlEscape(rssDesc(it.excerpt || it.body))}</description>\n` +
          (it.author_name ? `      <author>${xmlEscape(it.author_name)}</author>\n` : '') +
          '    </item>';
      }).join('\n') +
      '\n  </channel>\n</rss>';

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=1800');
    res.send(xml);
  } catch (_) {
    res.status(500).set('Content-Type', 'application/rss+xml; charset=utf-8')
      .send('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>লেখক ফোরাম</title></channel></rss>');
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
