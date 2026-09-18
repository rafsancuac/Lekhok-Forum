#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১৪৮ — কল-পলিশ: রিং-হার্ডস্টপ + সেলফি-PIP প্রি-কানেক্ট + স্মুথ-ট্রানজিশন
   ─────────────────────────────────────────────────────────────────────────
   চালানো: NODE_PATH=/home/z/.npm-global/lib/node_modules node \
             scripts/verify-session148-callpolish.js http://localhost:8080

   ইউজার-রিপোর্টকৃত ৩-বাগের প্রত্যেকটির সরাসরি প্রমাণ:
   ① রিং-হার্ডস্টপ: হ্যাংআপের সেই-সিঙ্ক্রোনাস-মুহূর্তেই সব শিডিউল-অসিলেটর
      নোড নিহত (gain→০+stop+disconnect) — S.ringing=null, nodes=0;
      ক্যালির পাশেও কলার-ক্যানসেলে ≤১-পোলে নীরব (আগে ৪০-সেকেন্ড পর্যন্ত
      প্রি-শিডিউল-বিট লিক করত)
   ② সেলফি-PIP: ভিডিও-কলে কানেক্ট-পূর্বেই (রিং-অবস্থায়) নিজের ক্যামেরা
      প্রিভিউ দৃশ্যমান + প্রকৃত-ফ্রেম প্রবাহিত (videoWidth>0) — FB/টেলিগ্রাম-প্যারিটি
   ③ স্মুথ-ট্রানজিশন: হ্যাংআপে .lc-root--closing (ফেড+স্কেল-ডাউন) → ২৪০ms-এ
      DOM-থেকে বিদায়; আসন্ন-কার্ডে .is-out বিদায়-ফেড
   + মূল-ফ্লো রিগ্রেশন: ভিডিও-কল কানেক্ট, দু-পক্ষে remote-স্ট্রিম, টাইমার,
      কলার-হ্যাংআপে ক্যালির ক্লিনআপ
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = process.argv[2] || 'http://localhost:8080';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { chromium } = require('playwright');
  console.log('══ সেশন ১৪৮ — কল-পলিশ E2E @ ' + BASE + ' ══\n');

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

  const ctxA = await mkCtx();
  const ctxB = await mkCtx();
  const A = await login(ctxA, 'ismail', 'secret123');
  const B = await login(ctxB, 'monem', 'demo123');
  check('A (ismail) লগইন', (A.url() || '').indexOf('/login') === -1, A.url());
  check('B (monem) লগইন', (B.url() || '').indexOf('/login') === -1, B.url());

  /* ══ টেস্ট-১: অডিও-কল রিং → হ্যাংআপ → রিং-হার্ডস্টপ + এক্সিট-অ্যানিমেশন ══ */
  console.log('\n— ① রিং-হার্ডস্টপ + ③ এক্সিট-অ্যানিমেশন (অডিও-কল) —');
  await A.goto(BASE + '/messages/monem', { waitUntil: 'domcontentloaded' });
  await A.waitForSelector('button[title="অডিও কল"]', { timeout: 15000 });
  await A.click('button[title="অডিও কল"]');
  await A.waitForSelector('.lc-root', { timeout: 5000 });
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'outgoing', null, { timeout: 8000 }).catch(() => {});
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaRingState().active && window.LekhokCall._qaRingState().nodes > 0, null, { timeout: 8000 }).catch(() => {});
  const ring1 = await A.evaluate(() => window.LekhokCall._qaRingState());
  check('① আউটগোয়িং-রিং সক্রিয় (শিডিউল-নোড >০)', ring1.active === true && ring1.nodes > 0, ring1);

  /* হ্যাংআপ-মুহূর্ত: একই-সিঙ্ক্রোনাস-ইভালিউশনে ক্লিক+পড়া — শূন্য-রেস */
  const hangup = await A.evaluate(() => {
    const btn = document.querySelector('.lc-controls [data-lc="end"]');
    btn.click();
    return {
      state: window.LekhokCall.state(),
      ring: window.LekhokCall._qaRingState(),
      closing: !!document.querySelector('.lc-root--closing')
    };
  });
  check('① হ্যাংআপে তাৎক্ষণিক রিং-হার্ডস্টপ (active=false, nodes=০)', hangup.ring.active === false && hangup.ring.nodes === 0, hangup.ring);
  check('① হ্যাংআপে স্টেট idle', hangup.state === 'idle', hangup.state);
  check('③ এক্সিট-অ্যানিমেশন ক্লাস (.lc-root--closing)', hangup.closing === true, hangup.closing);
  await A.waitForFunction(() => !document.querySelector('.lc-root'), null, { timeout: 1500 }).catch(() => {});
  const goneA = await A.evaluate(() => !document.querySelector('.lc-root'));
  check('③ ২৪০ms-এ কল-মোডাল DOM-বিদায়', goneA === true, goneA);
  await A.waitForTimeout(1000); /* সার্ভার-সাইড end-POST সেটল — দ্রুত-রিডায়াল busy-গার্ড (409) এড়াতে */

  /* ══ টেস্ট-২: ভিডিও-কল — সেলফি-PIP প্রি-কানেক্ট + ফুল-কানেক্ট রিগ্রেশন ══ */
  console.log('\n— ② সেলফি-PIP (প্রি-কানেক্ট) + কানেক্ট-রিগ্রেশন (ভিডিও-কল) —');
  await A.waitForSelector('button[title="ভিডিও কল"]', { timeout: 10000 });
  await A.click('button[title="ভিডিও কল"]');
  await A.waitForSelector('.lc-root', { timeout: 8000 });
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'outgoing', null, { timeout: 8000 }).catch(() => {});
  await A.waitForFunction(() => {
    const r = window.LekhokCall._qaSelfPip();
    return r.pip && r.visible && r.live;
  }, null, { timeout: 10000 }).catch(() => {});
  const pip1 = await A.evaluate(() => window.LekhokCall._qaSelfPip());
  const stage1 = await A.evaluate(() => ({
    videosHidden: document.querySelector('.lc-videos').hidden,
    faceVisible: !document.querySelector('.lc-audioface').hidden
  }));
  check('② রিং-অবস্থায়ই সেলফি-PIP দৃশ্যমান (has-local)', pip1.pip === true, pip1);
  check('② PIP-তে প্রকৃত-ক্যামেরা-ফ্রেম (videoWidth>০)', pip1.live === true, pip1);
  check('② রিমোট-স্টেজ এখনো লুকানো (কানেক্ট-পূর্ব)', stage1.videosHidden === true, stage1);
  check('② অ্যাভাটার-মুখ দৃশ্যমান (রিং-স্টেজ অক্ষুণ্ণ)', stage1.faceVisible === true, stage1);

  /* ক্যালি: ইনবক্স-পেজে আসন্ন-কল → গ্রহণ */
  await B.goto(BASE + '/messages', { waitUntil: 'domcontentloaded' });
  await B.waitForSelector('.lc-incoming', { timeout: 15000 });
  await B.waitForFunction(() => !document.querySelector('.lc-incoming').hidden, null, { timeout: 15000 }).catch(() => {});
  const incVisible = await B.evaluate(() => !document.querySelector('.lc-incoming').hidden);
  check('ইনবক্স-পেজে আসন্ন-ভিডিও-কল পপ-আপ', incVisible === true, incVisible);
  const acceptOut = await B.evaluate(() => {
    const btn = document.querySelector('[data-lc="accept"]');
    btn.click();
    return { isOut: !!document.querySelector('.lc-incoming.is-out') };
  });
  check('③ গ্রহণে আসন্ন-কার্ড বিদায়-ফেড (.is-out)', acceptOut.isOut === true, acceptOut.isOut);

  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 25000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 25000 }).catch(() => {});
  const aConn = await A.evaluate(() => (window.LekhokCall._debug.pc || {}).connectionState || 'none');
  const bConn = await B.evaluate(() => (window.LekhokCall._debug.pc || {}).connectionState || 'none');
  check('রিগ্রেশন: A-পিয়ার connected', aConn === 'connected', aConn);
  check('রিগ্রেশন: B-পিয়ার connected', bConn === 'connected', bConn);
  await A.waitForFunction(() => !!window.LekhokCall._debug.remote, null, { timeout: 10000 }).catch(() => {});
  await B.waitForFunction(() => !!window.LekhokCall._debug.remote, null, { timeout: 10000 }).catch(() => {});
  check('রিগ্রেশন: A-তে remote-স্ট্রিম', (await A.evaluate(() => !!window.LekhokCall._debug.remote)) === true);
  check('রিগ্রেশন: B-তে remote-স্ট্রিম', (await B.evaluate(() => !!window.LekhokCall._debug.remote)) === true);

  const stage2 = await A.evaluate(() => ({
    videosShown: !document.querySelector('.lc-videos').hidden,
    pip: window.LekhokCall._qaSelfPip()
  }));
  check('কানেক্টে রিমোট-স্টেজ দৃশ্যমান (ক্রসফেড-পথ)', stage2.videosShown === true, stage2.videosShown);
  check('কানেক্টের পরেও সেলফি-PIP স্থায়ী', stage2.pip.pip === true && stage2.pip.visible === true, stage2.pip);
  const timerTxt = await A.evaluate(() => (document.querySelector('.lc-status') || {}).textContent || '');
  check('রিগ্রেশন: কল-টাইমার (সংযুক্ত)', /সংযুক্ত|[০-৯]:/.test(timerTxt), timerTxt);

  /* ══ টেস্ট-৩: কলার-হ্যাংআপে ক্যালি-পাশের ক্লিনআপ (রিগ্রেশন) ══ */
  console.log('\n— কলার-হ্যাংআপ → ক্যালি-ক্লিনআপ —');
  await A.evaluate(() => { document.querySelector('.lc-controls [data-lc="end"]').click(); });
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 8000 }).catch(() => {});
  const bIdle = await B.evaluate(() => window.LekhokCall.state());
  check('B-ও কল-শেষ জানত (idle)', bIdle === 'idle', bIdle);

  /* ══ টেস্ট-৪: ক্যালি-রিং-অবস্থায় কলার-ক্যানসেল → ক্যালি-পাশেও হার্ডস্টপ ══ */
  console.log('\n— ① ক্যালি-পাশে রিং-হার্ডস্টপ (কলার-ক্যানসেল) —');
  await A.waitForSelector('button[title="অডিও কল"]', { timeout: 10000 });
  await A.click('button[title="অডিও কল"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'outgoing', null, { timeout: 8000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'incoming' && window.LekhokCall._qaRingState().active, null, { timeout: 15000 }).catch(() => {});
  const bRing = await B.evaluate(() => window.LekhokCall._qaRingState());
  check('ক্যালি-পাশে ইনকামিং-রিং সক্রিয়', bRing.active === true && bRing.nodes > 0, bRing);
  await A.evaluate(() => { document.querySelector('.lc-controls [data-lc="end"]').click(); }); /* বাতিল */
  await B.waitForFunction(() => {
    const r = window.LekhokCall._qaRingState();
    return window.LekhokCall.state() === 'idle' && !r.active && r.nodes === 0;
  }, null, { timeout: 9000 }).catch(() => {});
  const bStop = await B.evaluate(() => ({ state: window.LekhokCall.state(), ring: window.LekhokCall._qaRingState() }));
  check('① ক্যানসেল-পোলে ক্যালি-পাশেও নোড-নিহত + idle', bStop.state === 'idle' && bStop.ring.active === false && bStop.ring.nodes === 0, bStop);

  await ctxA.close().catch(() => {});
  await ctxB.close().catch(() => {});
  await browser.close();

  console.log('\n════════════════════════════════');
  console.log('PASS: ' + pass + '   FAIL: ' + fail);
  if (fails.length) { console.log('\nব্যর্থ চেক:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2); });
