// ── Site navigation config ──────────────────────────────────────────────────
// The public top-bar + mobile sidebar menus are rendered from a JSON config
// stored in the `settings` table (key: nav_json). Admin & moderators edit it
// from their dashboards. If the key is missing/invalid we fall back to
// DEFAULT_NAV so the site can never lose its menu.

const DEFAULT_NAV = [
  { label: 'হোম', href: '/', icon: 'fa-home' },
  {
    label: 'পরিচিতি', href: '/about', icon: 'fa-info-circle',
    children: [
      { label: 'সংগঠন পরিচিতি', href: '/about', icon: 'fa-info-circle' },
      { label: 'আমাদের কার্যাক্রম', href: '/about#activities', icon: 'fa-tasks' },
      { label: 'পত্রিকায় পাতায় লেখক ফোরাম', href: '/about#magazine', icon: 'fa-book' },
      { label: 'পত্রিকায় আমাদের নিউজ', href: '/press', icon: 'fa-newspaper' },
      { label: 'গঠনতন্ত্র', href: '/constitution', icon: 'fa-scroll' },
      { label: 'কলম সৈনিক হতে চান?', href: '/about#soldier', icon: 'fa-fighter-jet' },
      { label: 'সদস্য হওয়ার শর্তাবলি', href: '/about#conditions', icon: 'fa-clipboard-list' }
    ]
  },
  {
    label: 'কার্যনির্বাহী পরিষদ', href: '/committee', icon: 'fa-users-cog',
    children: [
      { label: 'উপদেষ্টাদের তালিকা', href: '/committee/advisory', icon: 'fa-user-tie' },
      { label: 'কার্যনির্বাহী কমিটি', href: '/committee', icon: 'fa-users-cog' },
      { label: 'সদস্য পরিচিতি', href: '/members', icon: 'fa-users' }
    ]
  },
  {
    label: 'প্রকাশিত লেখা', href: '/articles', icon: 'fa-pen-nib',
    children: [
      { label: 'প্রকাশিত কলাম', href: '/articles?filter=column', icon: 'fa-pen-nib' },
      { label: 'প্রকাশিত চিঠি', href: '/articles?filter=letter', icon: 'fa-envelope' }
    ]
  },
  { label: 'গ্যালারি', href: '/gallery', icon: 'fa-images' },
  { label: 'রিসোর্স', href: '/resources', icon: 'fa-folder-open' },
  { label: 'যোগাযোগ', href: '/contact', icon: 'fa-envelope' }
];

// Defensive sanitizer — every field trimmed + length-capped; bad shapes dropped
function sanitizeNav(arr) {
  const clean = [];
  for (const item of (Array.isArray(arr) ? arr : [])) {
    if (!item || typeof item !== 'object') continue;
    const label = String(item.label || '').trim().slice(0, 60);
    const href = String(item.href || '').trim().slice(0, 300);
    if (!label || !href) continue;
    const out = { label, href };
    const icon = String(item.icon || '').trim().slice(0, 60);
    if (icon) out.icon = icon;
    if (Array.isArray(item.children) && item.children.length) {
      const kids = [];
      for (const c of item.children) {
        if (!c || typeof c !== 'object') continue;
        const cl = String(c.label || '').trim().slice(0, 60);
        const ch = String(c.href || '').trim().slice(0, 300);
        if (!cl || !ch) continue;
        const co = { label: cl, href: ch };
        const ci = String(c.icon || '').trim().slice(0, 60);
        if (ci) co.icon = ci;
        kids.push(co);
        if (kids.length >= 12) break;   // sanity cap per dropdown
      }
      if (kids.length) out.children = kids;
    }
    clean.push(out);
    if (clean.length >= 12) break;      // sanity cap for top level
  }
  return clean;
}

// Parse the stored nav_json; fall back to DEFAULT_NAV when missing/invalid
function parseNav(jsonStr) {
  if (jsonStr && String(jsonStr).trim()) {
    try {
      const arr = sanitizeNav(JSON.parse(String(jsonStr)));
      if (arr.length) return arr;
    } catch (_) { /* fall through to default */ }
  }
  return DEFAULT_NAV;
}

// Validate a submitted nav_json string → {ok, nav?, error?}
function validateNavJson(str) {
  if (!str || !String(str).trim()) return { ok: true, nav: [] };   // reset to default
  try {
    const arr = sanitizeNav(JSON.parse(String(str)));
    if (!arr.length) return { ok: false, error: 'অন্তত একটি মেনু আইটেম দরকার (লেবেল ও লিংক সঠিকভাবে পূরণ করুন)।' };
    return { ok: true, nav: arr };
  } catch (e) {
    return { ok: false, error: 'মেনু ডেটা পড়া যায়নি — আবার চেষ্টা করুন।' };
  }
}

// Active-state helper: exact match, prefix match on path, or same path w/ query
function navIsActive(href, currentPath) {
  if (!href || !currentPath) return false;
  const h = String(href).split('?')[0].split('#')[0] || '/';
  if (h === '/') return currentPath === '/';
  return currentPath === h || currentPath.indexOf(h + '/') === 0 ||
         currentPath.indexOf(h + '?') === 0;
}

function navItemActive(item, currentPath) {
  return navIsActive(item.href, currentPath) ||
         (item.children || []).some(c => navIsActive(c.href, currentPath));
}

module.exports = { DEFAULT_NAV, parseNav, sanitizeNav, validateNavJson, navIsActive, navItemActive };
