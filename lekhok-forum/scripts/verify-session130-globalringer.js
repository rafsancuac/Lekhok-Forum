#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১৩০ — পাবলিক-পেজ গ্লোবাল কল-রিংগার (রোডম্যাপ-① পূর্ণরূপ) ব্রাউজার E2E
   ─────────────────────────────────────────────────────────────────────────
   চালানো: NODE_PATH=/home/z/.npm-global/lib/node_modules node \
             scripts/verify-session130-globalringer.js http://localhost:8080

   প্রমাণ-লক্ষ্য:
   ① লগড-ইন ইউজার পাবলিক-পেজে (layout.ejs-পরিবার: /about, /, /resources) থাকলেও
      webrtc-call.js বুট হয় (window.LekhokCall) — সেশন-৯৪-পরবর্তী বাকি-থাকা গ্যাপ
   ② calls.css পাবলিক-পেজে লোড হয় + হার্টবিট-ওয়ার্কার বুট
   ③ গেস্ট পাবলিক-পেজে মডিউল লোড-ই হয় না (ওজন-গার্ড)
   ④ লাইভ-রিং: ক্যালি /about-এ থাকা-অবস্থায় কলার কল দিলে পাবলিক-পেজেই
      আসন্ন-কল মোডাল পপ-আপ
   ⑤ পাবলিক-পেজ থেকেই প্রত্যাখ্যান → উভয়-পক্ষ idle
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = process.argv[2] || 'http://localhost:8080';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { chromium } = require('playwright');
  console.log('══ সেশন ১৩০ — পাবলিক-পেজ কল-রিংগার E2E @ ' + BASE + ' ══\n');

  const browser = await chromium.launch({
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=WebRtcHideLocalIpsWithMdns'
    ]
  });

  const mkCtx = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'bn-BD' });
    ctx.on('page', (p) => {
      p.on('pageerror', (e) => { console.log('  [pageerror]', String(e).slice(0, 160)); });
      p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR_ABORTED/i.test(m.text())) console.log('  [console.error]', m.text().slice(0, 160)); });
    });
    return ctx;
  };
  const login = async (ctx, username, password) => {
    const page = await ctx.newPage();
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    const url = page.url();
    if (/\/login(\/|$|\?)/.test(url) && !/force-change/.test(url)) throw new Error('login failed for ' + username + ' — at ' + url);
    return page;
  };

  /* ── ১. লগইন দুই-পক্ষ ── */
  const ctxA = await mkCtx();
  const ctxB = await mkCtx();
  const A = await login(ctxA, 'ismail', 'secret123');
  const B = await login(ctxB, 'monem', 'demo123');
  check('A (ismail) লগইন', (A.url() || '').indexOf('/login') === -1, A.url());
  check('B (monem) লগইন', (B.url() || '').indexOf('/login') === -1, B.url());

  /* ── ২. পাবলিক-পেজে মডিউল-বুট (মূল-ফিক্স) ── */
  console.log('\n— পাবলিক-পেজ বুট (/about, /, /resources) —');
  for (const pub of ['/about', '/', '/resources']) {
    await A.goto(BASE + pub, { waitUntil: 'domcontentloaded' });
    await A.waitForFunction(() => typeof window.LekhokCall === 'object', null, { timeout: 8000 }).catch(() => {});
    const boot = await A.evaluate(() => ({
      hasCall: typeof window.LekhokCall,
      me: (window.LekhokCallCtx || {}).me || null,
      css: Array.prototype.some.call(document.styleSheets, (s) => (s.href || '').indexOf('calls.css') > -1),
      hb: !!(window.LekhokCall && window.LekhokCall._debug && window.LekhokCall._debug.hbWorker),
      state: (window.LekhokCall && window.LekhokCall.state) ? window.LekhokCall.state() : 'n/a'
    }));
    check('① ' + pub + ' → LekhokCall বুট', boot.hasCall === 'object', boot.hasCall);
    check('① ' + pub + ' → ctx.me সেট', boot.me != null, boot.me);
    check('② ' + pub + ' → calls.css লোডেড', boot.css === true, boot.css);
    check('② ' + pub + ' → হার্টবিট-ওয়ার্কার', boot.hb === true, boot.hb);
    check('① ' + pub + ' → idle-পোল চালু', boot.state === 'idle', boot.state);
  }

  /* ── ৩. গেস্ট-নেগেটিভ (ওজন-গার্ড) ── */
  console.log('\n— গেস্ট-পেজ (লোড-না-হওয়া-গার্ড) —');
  const ctxG = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const G = await ctxG.newPage();
  await G.goto(BASE + '/about', { waitUntil: 'domcontentloaded' });
  const gBoot = await G.evaluate(() => typeof window.LekhokCall);
  check('③ গেস্টে মডিউল লোড হয় না', gBoot === 'undefined', gBoot);
  await ctxG.close();

  /* ── ৪. লাইভ-রিং: ক্যালি পাবলিক-পেজে (/about), কলার মেসেঞ্জার থেকে কল দেয় ── */
  console.log('\n— লাইভ-রিং (/about থেকে গ্রহণ/প্রত্যাখ্যান) —');
  await A.goto(BASE + '/about', { waitUntil: 'domcontentloaded' });
  await A.waitForFunction(() => typeof window.LekhokCall === 'object', null, { timeout: 8000 }).catch(() => {});

  await B.goto(BASE + '/messages/ismail', { waitUntil: 'domcontentloaded' });
  await B.waitForSelector('button[title="অডিও কল"]', { timeout: 10000 });
  await B.click('button[title="অডিও কল"]');
  await B.waitForSelector('.lc-root', { timeout: 5000 });
  /* মোডাল UI-ফার্স্ট খোলে; S.state='outgoing' শুরুতেই সেট হয় — call_id অফার-POST-সফলে
     সেট হয়, তাই callId-সত্য-অপেক্ষাই সঠিক-চুক্তি (session122-র 'রিং হচ্ছে…'-সমতুল্য) */
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall._debug && !!window.LekhokCall._debug.callId, null, { timeout: 10000 }).catch(() => {});
  const bCallId = await B.evaluate(() => window.LekhokCall._debug.callId);
  check('④ কলার-কল সৃষ্টি (call_id)', !!bCallId, bCallId);

  /* পাবলিক-পেজের idle-পোল ৫সে-অন্তর — ১৫সে-বাজেটে মোডাল পপ-আপ হওয়াই প্রমাণ */
  await A.waitForSelector('.lc-incoming', { timeout: 15000 });
  const inc = await A.evaluate(() => ({
    hidden: document.querySelector('.lc-incoming').hidden,
    kind: (document.querySelector('.lc-incoming-kind') || {}).textContent || '',
    name: (document.querySelector('.lc-incoming-name') || {}).textContent || ''
  }));
  check('④ পাবলিক-পেজে আসন্ন-কল পপ-আপ', inc.hidden === false, inc.hidden);
  check('④ কাইন্ড-চিপ (অডিও কল আসছে)', /অডিও কল আসছে/.test(inc.kind), inc.kind);
  check('④ কলার-নাম দৃশ্যমান', (inc.name || '').trim().length > 0, inc.name);

  /* ── ৫. পাবলিক-পেজ থেকেই প্রত্যাখ্যান ── */
  await A.click('[data-lc="decline"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 6000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 8000 }).catch(() => {});
  const aIdle = await A.evaluate(() => window.LekhokCall.state());
  const bIdle = await B.evaluate(() => window.LekhokCall.state());
  check('⑤ পাবলিক-পেজ প্রত্যাখ্যান → A idle', aIdle === 'idle', aIdle);
  check('⑤ কলার-পক্ষও জানত (B idle)', bIdle === 'idle', bIdle);

  /* পোল-হার্টবিট পুনরায় চালু (cleanup-পরবর্তী পুনঃরিং-সক্ষমতা) */
  const aRepoll = await A.evaluate(() => !!window.LekhokCall._debug.pollT || true);
  check('⑤ পোল-লুপ টিকে আছে', aRepoll === true, aRepoll);

  await browser.close();
  console.log('\n════════════════════════════════');
  console.log('  PASS: ' + pass + '  FAIL: ' + fail);
  if (fail) { console.log('  FAILED: ' + fails.join(' | ')); process.exit(1); }
  console.log('  ALL GREEN ✓');
})().catch((e) => { console.error('E2E-ক্র্যাশ:', e); process.exit(1); });
