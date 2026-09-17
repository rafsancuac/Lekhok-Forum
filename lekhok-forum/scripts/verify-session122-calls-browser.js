#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১২২ — WebRTC কল: সম্পূর্ণ ব্রাউজার-লেভেল E2E (দুই-ব্রাউজার, fake-media)
   ─────────────────────────────────────────────────────────────────────────
   চালানো: NODE_PATH=/home/z/.npm-global/lib/node_modules node \
             scripts/verify-session122-calls-browser.js http://localhost:8080

   প্রমাণ-লক্ষ্য (ইউজার-রিপোর্টকৃত বাগগুলোর প্রতিটির সরাসরি যাচাই):
   ① Permissions-Policy ফিক্স — ব্রাউজার এখন getUserMedia অনুমতি দেয় (মূল-কারণ)
   ② কলার: কল-বাটনে চাপ → কল-মোডাল তাৎক্ষণিক পপ-আপ + রিং + অফার-পোস্ট
   ③ ক্যালি: অন্য-পেজে (ইনবক্স) থাকলেও আসন্ন-কল পপ-আপ (গ্লোবাল রিংগার)
   ④ গ্রহণ → WebRTC সংযোগ connected + দু-পক্ষে remote-স্ট্রিম
   ⑤ হার্টবিট-ওয়ার্কার লোড হয়েছে (ব্যাকগ্রাউন্ড-পোল)
   ⑥ কল-শেষ → উভয়-পক্ষ পরিষ্কার, চ্যাটে রেকর্ড
   ⑦ পারমিশন-প্যানেল: getUserMedia ব্লকড ব্রাউজারে মোডাল গায়েব না-হয়ে
      সমাধান-গাইড + রিট্রাই + বাতিল-বোতাম দেখায় (UI-ফার্স্ট ফিক্স)
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = process.argv[2] || 'http://localhost:8080';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { chromium } = require('playwright');
  console.log('══ সেশন ১২২ — ব্রাউজার-লেভেল কল E2E @ ' + BASE + ' ══\n');

  const browser = await chromium.launch({
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=WebRtcHideLocalIpsWithMdns' /* কনটেইনারে mDNS-ক্যান্ডিডেট অদৃশ্য — সরাসরি host-IP দাও */
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

  /* ── ১. দুই-ইউজার লগইন (fake-media ব্রাউজার) ── */
  console.log('— লগইন + ফিক্স-যাচাই —');
  const ctxA = await mkCtx();
  const ctxB = await mkCtx();
  const A = await login(ctxA, 'ismail', 'secret123');
  const B = await login(ctxB, 'monem', 'demo123');
  check('A (ismail) লগইন', (A.url() || '').indexOf('/login') === -1, A.url());
  check('B (monem) লগইন', (B.url() || '').indexOf('/login') === -1, B.url());

  /* ① Permissions-Policy: মডিউল প্রসঙ্গে getUserMedia সত্যিই অনুমোদিত */
  const gumOk = await A.evaluate(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) { return 'ERR:' + e.name; }
  });
  check('① getUserMedia অনুমোদিত (Permissions-Policy ফিক্স)', gumOk === true, gumOk);
  const hbOk = await A.evaluate(() => !!(window.LekhokCall && window.LekhokCall._debug && window.LekhokCall._debug.hbWorker));
  check('⑤ হার্টবিট-ওয়ার্কার লোডেড', hbOk === true, hbOk);

  /* ── ২. কলার: চ্যাট-হেডারের অডিও-কল বাটন → মোডাল পপ-আপ + রিং ── */
  console.log('\n— কলার-ফ্লো (A) —');
  await A.goto(BASE + '/messages/monem', { waitUntil: 'domcontentloaded' });
  await A.waitForSelector('button[title="অডিও কল"]', { timeout: 10000 });
  await A.click('button[title="অডিও কল"]');
  await A.waitForSelector('.lc-root', { timeout: 5000 });
  check('② কল-মোডাল তাৎক্ষণিক পপ-আপ', true);
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'outgoing', null, { timeout: 5000 }).catch(() => {});
  const aState = await A.evaluate(() => window.LekhokCall.state());
  check('② caller-স্টেট outgoing', aState === 'outgoing', aState);
  await A.waitForFunction(() => {
    const s = document.querySelector('.lc-status');
    return s && /রিং হচ্ছে/.test(s.textContent);
  }, null, { timeout: 8000 }).catch(() => {});
  const aStatus = await A.evaluate(() => (document.querySelector('.lc-status') || {}).textContent || '');
  check('② "রিং হচ্ছে…" স্টেটাস (অফার-পোস্ট সফল)', /রিং হচ্ছে/.test(aStatus), aStatus);
  const aCallId = await A.evaluate(() => window.LekhokCall._debug.callId);
  check('② সার্ভারে কল-সেশন তৈরি (call_id)', !!aCallId, aCallId);

  /* ── ৩. ক্যালি: ইনবক্স-পেজে (অ-চ্যাট) আসন্ন-কল পপ-আপ ── */
  console.log('\n— ক্যালি-ফ্লো (B, ইনবক্স-পেজ থেকে) —');
  await B.goto(BASE + '/messages', { waitUntil: 'domcontentloaded' });
  await B.waitForSelector('.lc-incoming', { timeout: 15000 });
  const incHidden = await B.evaluate(() => document.querySelector('.lc-incoming').hidden);
  check('③ ইনবক্স-পেজে আসন্ন-কল পপ-আপ (গ্লোবাল রিংগার)', incHidden === false, { hidden: incHidden });
  await B.click('[data-lc="accept"]');
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connecting', null, { timeout: 5000 }).catch(() => {});

  /* ── ৪. WebRTC সংযোগ + remote-স্ট্রিম (উভয়-পক্ষ) ── */
  console.log('\n— WebRTC সংযোগ —');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 20000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 20000 }).catch(() => {});
  const aConn = await A.evaluate(() => (window.LekhokCall._debug.pc || {}).connectionState || 'none');
  const bConn = await B.evaluate(() => (window.LekhokCall._debug.pc || {}).connectionState || 'none');
  check('④ A-পিয়ার connected', aConn === 'connected', aConn);
  check('④ B-পিয়ার connected', bConn === 'connected', bConn);
  await A.waitForFunction(() => window.LekhokCall && !!window.LekhokCall._debug.remote, null, { timeout: 8000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && !!window.LekhokCall._debug.remote, null, { timeout: 8000 }).catch(() => {});
  const aRemote = await A.evaluate(() => !!window.LekhokCall._debug.remote);
  const bRemote = await B.evaluate(() => !!window.LekhokCall._debug.remote);
  check('④ A-তে remote-স্ট্রিম', aRemote === true, aRemote);
  check('④ B-তে remote-স্ট্রিম', bRemote === true, bRemote);
  const aTimer = await A.evaluate(() => (document.querySelector('.lc-status') || {}).textContent || '');
  check('④ কল-টাইমার চলছে (সংযুক্ত)', /সংযুক্ত|[০-৯]:/.test(aTimer), aTimer);

  /* ── ৫. মিউট/আনমিউট (UI-কন্ট্রোল) ── */
  await A.click('[data-lc="mic"]');
  const aMuted = await A.evaluate(() => window.LekhokCall._debug.muted);
  await A.click('[data-lc="mic"]');
  check('৫ মিউট-টগল কাজ করে', aMuted === true, aMuted);

  /* ── ৬. কল-শেষ → উভয়-পক্ষ ক্লিন + চ্যাট-রেকর্ড ── */
  console.log('\n— কল-শেষ —');
  await A.click('.lc-controls [data-lc="end"]'); /* কন্ট্রোল-ডকের দৃশ্যমান বোতাম (লুকানো রিট্রাইবারটি নয়) */
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 5000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 8000 }).catch(() => {});
  const aIdle = await A.evaluate(() => window.LekhokCall.state());
  const bIdle = await B.evaluate(() => window.LekhokCall.state());
  check('৬ A ক্লিনআপ (idle)', aIdle === 'idle', aIdle);
  check('৬ B-ও জানত (idle)', bIdle === 'idle', bIdle);

  /* ── ৭. পারমিশন-প্যানেল (getUserMedia-ব্লকড ব্রাউজার-পথ) ── */
  console.log('\n— পারমিশন-প্যানেল (ব্লকড-মিডিয়া পথ) —');
  const ctxC = await browser.newContext({ viewport: { width: 1280, height: 860 } }); /* fake-ui ছাড়া — অনুমতি নেই */
  const C = await ctxC.newPage();
  await C.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await C.fill('input[name="username"]', 'karishma');
  await C.fill('input[name="password"]', 'demo123');
  await Promise.all([C.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}), C.click('button[type="submit"]')]);
  if (/\/messages\//.test(C.url()) || !/\/login(\/|$|\?)/.test(C.url())) {
    await C.goto(BASE + '/messages/ismail', { waitUntil: 'domcontentloaded' }).catch(() => {});
    const hasBtn = await C.$('button[title="অডিও কল"]');
    if (hasBtn) {
      await C.evaluate(() => { /* মিডিয়া-নেই হেডলেসে getUserMedia NotFoundError/NotAllowedError হবে */
        if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
      });
      await C.click('button[title="অডিও কল"]');
      await C.waitForSelector('.lc-perm', { timeout: 5000 });
      const permVisible = await C.evaluate(() => { const p = document.querySelector('.lc-perm'); return !!p && !p.hidden; });
      check('⑦ অনুমতি-ব্লকে মোডাল থাকে + প্যানেল দেখায়', permVisible === true, permVisible);
      const rootAlive = await C.evaluate(() => !!document.querySelector('.lc-root'));
      check('⑦ কল-মোডাল গায়েব হয়নি (UI-ফার্স্ট)', rootAlive === true, rootAlive);
      const retryVisible = await C.evaluate(() => !!document.querySelector('[data-lc="perm-retry"]'));
      const cancelVisible = await C.evaluate(() => !!document.querySelector('[data-lc="perm-cancel"]'));
      check('⑦ রিট্রাই + বাতিল বোতাম আছে', retryVisible && cancelVisible, { retryVisible, cancelVisible });
      await C.click('[data-lc="perm-cancel"]');
      await C.waitForFunction(() => !document.querySelector('.lc-root'), null, { timeout: 4000 }).catch(() => {});
      const goneAfter = await C.evaluate(() => !document.querySelector('.lc-root'));
      check('⑦ বাতিলে মোডাল পরিষ্কার', goneAfter === true, goneAfter);
    } else {
      console.log('  (⑦ স্কিপ: karishma↔ismail conv/বাটন নেই)');
    }
  } else {
    console.log('  (⑦ স্কিপ: karishma লগইন গেটেড — ' + C.url().slice(0, 60) + ')');
  }
  await ctxC.close().catch(() => {});

  await ctxA.close().catch(() => {});
  await ctxB.close().catch(() => {});
  await browser.close();

  console.log('\n════════════════════════════════');
  console.log('PASS: ' + pass + '   FAIL: ' + fail);
  if (fails.length) { console.log('\nব্যর্থ চেক:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2); });
