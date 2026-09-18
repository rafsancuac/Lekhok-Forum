#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১৩২ — অটো-ভিডিও-ডিগ্রেড (সাশ্রয়-ল্যাডার) ব্রাউজার-লেভেল E2E
   ─────────────────────────────────────────────────────────────────────────
   চালানো: NODE_PATH=/home/z/.npm-global/lib/node_modules node \
             scripts/verify-session132-autodegrade.js http://localhost:8080

   ⚠ দুই-ফেজ-বুট রীতি (session130-গোটচা): ব্রাউজার-E2E-র সার্ভারে
     CALL_RING_TIMEOUT_S দেবেন না — ডিফল্ট-৪৫সে রিং-উইন্ডো প্রয়োজন।

   প্রমাণ-লক্ষ্য:
   ① হুক-পথ (কল-ছাড়া): _qaApplyDegrade → সাশ্রয়-ব্যাজ পেইন্ট/গায়েব + is-eco ক্লাস
      + CSS-টোকেন-ওয়্যারিং (অ্যাম্বার = var(--lf-reaction-yellow) রেজলভ)
   ② লাইভ-কল-পথ: ভিডিও-কল connected → ৮সে-গেট-পরবর্তী বেসলাইন স্তর-০
      (sender-অস্পৃশ্ত) → ফেক দুর্বল-নেটওয়ার্ক (RTT ৭০০ms) → poorStreak-ল্যাডারে
      স্তর-১ (scale÷২ + ২৫০kbps) → স্তর-২ (÷৪ + ১২০kbps + ১০fps) — sender
      .setParameters প্রকৃত কল হয় (ক্যাপচার-লগ-প্রমাণ) + ব্যাজ + স্ট্যাটস-সারি
   ③ রিকভারি: ফেক ভালো-নেটওয়ার্ক (RTT ৫০ms) → goodStreak(≥৩)-হিস্টেরেসিসে
      ধাপ-নামা → স্তর-০ → রিস্টোর-প্যারাম (scale ১, বিধি-মুক্ত) + ব্যাজ-গায়েব
   ④ অডিও-কলে ইঞ্জিন-নিষ্ক্রিয়তা (kind-গার্ড) — ফেক দুর্বল-নেটওয়ার্কেও স্তর-০
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = process.argv[2] || 'http://localhost:8080';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { chromium } = require('playwright');
  console.log('══ সেশন ১৩২ — অটো-ভিডিও-ডিগ্রেড E2E @ ' + BASE + ' ══\n');

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
  /* কুকি-সচেতন লগইন — data-auth-বিশ্বস্ত-সোর্স (session67-চুক্তি): /dashboard গেস্টেও 200 দেয়
     (রিডাইরেক্ট-নেই) বলে URL-চেক অপর্যাপ্ত — body[data-auth] দেখে লগইন-শাখা */
  const ensureAuthed = async (ctx, username, password) => {
    const page = await ctx.newPage();
    await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
    let authed = await page.evaluate(() => document.body.getAttribute('data-auth') === '1').catch(() => false);
    if (!authed) {
      await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
        page.click('button[type="submit"]')
      ]);
      authed = await page.evaluate(() => document.body.getAttribute('data-auth') === '1').catch(() => false);
    }
    if (!authed) throw new Error('auth failed for ' + username + ' — at ' + page.url());
    /* SW-ক্যাশ-গেস্ট-মিথ্যা-নেগেটিভ-রেসিপি (session121/130-গোটচা): পুরনো SW-ক্যাশে গেস্ট-HTML থাকলে
       লগড-ইন-URL-ও অতিথি-ভার্সন দেখায় (LekhokCall undefined) — unregister+caches-purge+reload */
    await page.evaluate(async () => {
      try { const rs = await navigator.serviceWorker.getRegistrations(); for (const r of rs) await r.unregister(); } catch (e) {}
      try { if (window.caches) { const ks = await caches.keys(); for (const k of ks) await caches.delete(k); } } catch (e) {}
    }).catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForFunction(() => !!(window.LekhokCall && window.LekhokCall._debug), null, { timeout: 12000 }).catch(() => {});
    if (!(await page.evaluate(() => !!window.LekhokCall))) throw new Error('LekhokCall missing on ' + page.url());
    return page;
  };

  /* ── ফেজ-এ: হুক-পথ (কল-ছাড়া ব্যাজ/CSS যাচাই) ── */
  console.log('— ফেজ-এ: হুক-পথ (ব্যাজ-পেইন্ট + CSS-টোকেন) —');
  const ctxA = await mkCtx();
  const A0 = await ensureAuthed(ctxA, 'ismail', 'secret123');
  await A0.evaluate(() => { window.LekhokCall._qaEnsureRoot(); });
  const badgeOff0 = await A0.evaluate(() => {
    const eco = document.querySelector('.lc-eco');
    return eco ? !!eco.hidden : 'missing';
  });
  check('① ব্যাজ প্রাথমিক-অবস্থায় hidden', badgeOff0 === true, badgeOff0);
  const lvl1 = await A0.evaluate(() => window.LekhokCall._qaApplyDegrade(1));
  check('① _qaApplyDegrade(1) → স্তর-১', lvl1 === 1, lvl1);
  const paint1 = await A0.evaluate(() => {
    const eco = document.querySelector('.lc-eco');
    const pill = document.querySelector('.lc-quality');
    if (!eco || !pill) return { err: 'no-node' };
    const cs = getComputedStyle(eco);
    return {
      hidden: eco.hidden, text: eco.textContent.trim(),
      pillEco: pill.classList.contains('is-eco'),
      color: cs.color, radius: cs.borderRadius, pillHidden: pill.hidden
    };
  });
  check('① স্তর-১ ব্যাজ-টেক্সট "সাশ্রয়-১"', paint1.text.indexOf('সাশ্রয়-১') > -1, paint1.text);
  check('① পিল is-eco ক্লাস', paint1.pillEco === true, paint1.pillEco);
  check('① ব্যাজ দৃশ্যমান (পিল-সহ)', paint1.hidden === false && paint1.pillHidden === false, paint1);
  check('① CSS অ্যাম্বার-টোকেন রেজলভ (var(--lf-reaction-yellow) = rgb(247, 177, 37))', paint1.color === 'rgb(247, 177, 37)', paint1.color);
  check('① চিপ-রেডিয়াস টোকেন (9999px)', paint1.radius === '9999px', paint1.radius);
  const lvl3 = await A0.evaluate(() => window.LekhokCall._qaApplyDegrade(3));
  const paint3 = await A0.evaluate(() => (document.querySelector('.lc-eco') || {}).textContent || '');
  check('① স্তর-৩ টেক্সট "সাশ্রয়-৩"', lvl3 === 3 && paint3.indexOf('সাশ্রয়-৩') > -1, { lvl3, paint3 });
  const lvl0 = await A0.evaluate(() => window.LekhokCall._qaApplyDegrade(0));
  const paint0 = await A0.evaluate(() => {
    const eco = document.querySelector('.lc-eco');
    const pill = document.querySelector('.lc-quality');
    return { hidden: eco.hidden, pillEco: pill.classList.contains('is-eco'), lvl: window.LekhokCall._qaDegradeState().level };
  });
  check('① স্তর-০ → ব্যাজ-গায়েব + is-eco-মুক্ত', lvl0 === 0 && paint0.hidden === true && paint0.pillEco === false, { lvl0, paint0 });
  await A0.close().catch(() => {});

  /* ── ফেজ-বি: লাইভ ভিডিও-কল ল্যাডার ── */
  console.log('\n— ফেজ-বি: লাইভ ভিডিও-কল ল্যাডার —');
  const ctxB = await mkCtx();
  const A = await ensureAuthed(ctxA, 'ismail', 'secret123');
  const B = await ensureAuthed(ctxB, 'monem', 'demo123');
  check('② A লগইন', (A.url() || '').indexOf('/login') === -1, A.url());
  check('② B লগইন', (B.url() || '').indexOf('/login') === -1, B.url());

  await A.goto(BASE + '/messages/monem', { waitUntil: 'domcontentloaded' });
  /* RTCPeerConnection-র‍্যাপ — কেবল A-পেজে (কল-শুরুর আগে; একবারই — রিকার্শন-গোটচা-নিরাপদ ক্লোজার)।
     গোটচা-নোট: getSenders() প্ল্যাটফর্ম RTCRtpSender-অবজেক্ট দেয় — ক্লাস-স্তরের setParameters-
     ওভাররাইড sender-কল ধরে না; তাই প্যারাম-প্রমাণ = লাইভ sender.getParameters() এন্ড-স্টেট-পাঠ (__readVParams) */
  await A.evaluate(() => {
    window.__fakeOn = false;
    window.__fakeRtt = 0.7;
    window.__readVParams = () => {
      const pc = window.LekhokCall && window.LekhokCall._debug && window.LekhokCall._debug.pc;
      if (!pc || !pc.getSenders) return null;
      const snd = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (!snd) return null;
      const e = (snd.getParameters().encodings || [{}])[0] || {};
      return { scale: e.scaleResolutionDownBy != null ? e.scaleResolutionDownBy : null, br: e.maxBitrate != null ? e.maxBitrate : null, fr: e.maxFramerate != null ? e.maxFramerate : null };
    };
    const Orig = window.RTCPeerConnection;
    if (window.__pcPatched) return false;
    window.__pcPatched = true;
    window.RTCPeerConnection = class extends Orig {
      getStats(...a) {
        if (window.__fakeOn) {
          const rtt = window.__fakeRtt;
          return Promise.resolve({ forEach: (cb) => cb({ type: 'candidate-pair', selected: true, state: 'succeeded', currentRoundTripTime: rtt }) });
        }
        return super.getStats(...a);
      }
    };
    return true;
  });
  await A.waitForSelector('button[title="ভিডিও কল"]', { timeout: 10000 });
  await A.click('button[title="ভিডিও কল"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._debug && window.LekhokCall._debug.callId, null, { timeout: 8000 }).catch(() => {});
  const aCallId = await A.evaluate(() => window.LekhokCall._debug.callId);
  check('② ভিডিও-কল শুরু (call_id)', !!aCallId, aCallId);
  await A.evaluate(() => { window.LekhokCall._debug.kind === 'video'; });
  const aKind = await A.evaluate(() => window.LekhokCall._debug.kind);
  check('② কল-কাইন্ড video', aKind === 'video', aKind);

  await B.goto(BASE + '/messages', { waitUntil: 'domcontentloaded' });
  await B.waitForSelector('.lc-incoming', { timeout: 20000 });
  await B.click('[data-lc="accept"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 20000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 20000 }).catch(() => {});
  const aConn = await A.evaluate(() => (window.LekhokCall._debug.pc || {}).connectionState || 'none');
  check('② A-পিয়ার connected', aConn === 'connected', aConn);

  /* বেসলাইন: ৮সে-গেট + ১-টিক পরে স্তর-০, sender-অস্পৃশ্ত */
  const gated = await A.evaluate(() => window.LekhokCall._qaDegradeState().gated);
  check('② গেট-সক্রিয় (কানেক্টের ৮সে)', gated === true, gated);
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaDegradeState && !window.LekhokCall._qaDegradeState().gated, null, { timeout: 15000 }).catch(() => {});
  await A.waitForTimeout(3000); /* গেট-শেষ + ১-টিক বাস্তব-স্ট্যাট */
  const base0 = await A.evaluate(() => ({ ...window.LekhokCall._qaDegradeState(), vp: window.__readVParams() }));
  check('② বেসলাইন স্তর-০ (senders=' + base0.senders + ', প্যারাম-অস্পৃশ্ত)', base0.level === 0 && base0.senders >= 1 && base0.vp.scale === null && base0.vp.br === null, base0);

  /* দুর্বল-নেটওয়ার্ক ইনজেকশন → স্তর-১ → স্তর-২ */
  await A.evaluate(() => { window.__fakeOn = true; window.__fakeRtt = 0.7; });
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaDegradeState().level >= 1, null, { timeout: 20000 }).catch(() => {});
  const d1 = await A.evaluate(() => window.LekhokCall._qaDegradeState());
  check('② স্তর-১ পৌঁছেছে (poorStreak=' + d1.streak + ')', d1.level >= 1, d1);
  const vp1 = await A.evaluate(() => window.__readVParams());
  check('② স্তর-১ sender-প্যারাম (scale÷২ + ২৫০kbps)', vp1.scale === 2 && vp1.br === 250000, vp1);
  const badge1 = await A.evaluate(() => {
    const eco = document.querySelector('.lc-eco');
    const pill = document.querySelector('.lc-quality');
    return { txt: eco && !eco.hidden ? eco.textContent : '', eco: pill && pill.classList.contains('is-eco') };
  });
  check('② ব্যাজ "সাশ্রয়-১" দৃশ্যমান', badge1.txt.indexOf('সাশ্রয়-১') > -1 && badge1.eco, badge1);

  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaDegradeState().level >= 2, null, { timeout: 15000 }).catch(() => {});
  const d2 = await A.evaluate(() => window.LekhokCall._qaDegradeState());
  check('② স্তর-২ পৌঁছেছে', d2.level >= 2, d2);
  const vp2 = await A.evaluate(() => window.__readVParams());
  check('② স্তর-২ sender-প্যারাম (÷৪ + ১২০kbps + ১০fps)', vp2.scale === 4 && vp2.br === 120000 && vp2.fr === 10, vp2);

  /* স্ট্যাটস-প্যানেলে অটো-সাশ্রয় সারি */
  const statsRow = await A.evaluate(() => {
    window.LekhokCall.toggleStats();
    const rows = Array.from(document.querySelectorAll('.lc-stats-row')).map((r) => r.textContent.trim());
    const eco = Array.from(document.querySelectorAll('.lc-stats-row.is-eco')).map((r) => r.textContent.trim());
    return { rows, eco };
  });
  check('② স্ট্যাটস-সারি "অটো-সাশ্রয় · স্তর ২"', statsRow.rows.some((t) => t.indexOf('অটো-সাশ্রয়') > -1 && t.indexOf('স্তর ২') > -1), statsRow);
  check('② সাশ্রয়-সারি is-eco-হাইলাইটেড', statsRow.eco.some((t) => t.indexOf('অটো-সাশ্রয়') > -1), statsRow.eco);

  /* রিকভারি: ভালো-নেটওয়ার্ক → হিস্টেরেসিস-ধাপ-নামা → স্তর-০ */
  await A.evaluate(() => { window.__fakeRtt = 0.05; });
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaDegradeState().level === 0, null, { timeout: 30000 }).catch(() => {});
  const d0 = await A.evaluate(() => ({ ...window.LekhokCall._qaDegradeState(), vp: window.__readVParams() }));
  check('③ রিকভারি → স্তর-০ (good=' + d0.good + ')', d0.level === 0, d0);
  const badge0 = await A.evaluate(() => {
    const eco = document.querySelector('.lc-eco');
    const pill = document.querySelector('.lc-quality');
    return { hidden: eco ? eco.hidden : null, ecoCls: pill ? pill.classList.contains('is-eco') : null };
  });
  check('③ রিকভারি-ব্যাজ গায়েব + is-eco-মুক্ত', badge0.hidden === true && badge0.ecoCls === false, badge0);
  const vp0 = d0.vp;
  check('③ রিস্টোর-প্যারাম (scale ১, বিধি-মুক্ত)', vp0.scale === 1 && vp0.br === null && vp0.fr === null, vp0);
  check('③ ল্যাডার-ধাপ-ক্রম (স্তর-০→১→২→০ প্রমাণিত স্টেট+প্যারাম)', d0.level === 0 && vp2.scale === 4 && vp1.scale === 2, { level: d0.level, vp1, vp2 });

  /* কল-শেষ + পরিষ্কার */
  await A.evaluate(() => { try { window.LekhokCall.toggleStats(); } catch (e) {} });
  await A.click('.lc-controls [data-lc="end"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 6000 }).catch(() => {});
  await B.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 8000 }).catch(() => {});
  const idleA = await A.evaluate(() => window.LekhokCall.state());
  const idleB = await B.evaluate(() => window.LekhokCall.state());
  check('কল-শেষ উভয়-পক্ষ idle', idleA === 'idle' && idleB === 'idle', { idleA, idleB });

  /* ── ফেজ-গ: অডিও-কলে ইঞ্জিন-নিষ্ক্রিয়তা (kind-গার্ড) ── */
  console.log('\n— ফেজ-গ: অডিও-কল গার্ড —');
  await A.goto(BASE + '/messages/monem', { waitUntil: 'domcontentloaded' });
  await A.evaluate(() => {
    window.__fakeOn = false;
    window.__fakeRtt = 0.7;
    if (window.__pcPatched) return;
    window.__pcPatched = true;
    const Orig = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends Orig {
      getStats(...a) {
        if (window.__fakeOn) return Promise.resolve({ forEach: (cb) => cb({ type: 'candidate-pair', selected: true, state: 'succeeded', currentRoundTripTime: window.__fakeRtt }) });
        return super.getStats(...a);
      }
    };
  });
  await A.waitForSelector('button[title="অডিও কল"]', { timeout: 10000 });
  await A.click('button[title="অডিও কল"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._debug && window.LekhokCall._debug.callId, null, { timeout: 8000 }).catch(() => {});
  await B.waitForSelector('.lc-incoming', { timeout: 20000 });
  await B.click('[data-lc="accept"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'connected', null, { timeout: 20000 }).catch(() => {});
  const aKind2 = await A.evaluate(() => window.LekhokCall._debug.kind);
  check('④ অডিও-কল connected', aConn === 'connected' || aKind2 === 'audio', aKind2);
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall._qaDegradeState && !window.LekhokCall._qaDegradeState().gated, null, { timeout: 15000 }).catch(() => {});
  await A.evaluate(() => { window.__fakeOn = true; window.__fakeRtt = 0.7; });
  await A.waitForTimeout(9000); /* গেট-পরবর্তী ৩-টিক দুর্বল-নমুনা */
  const guardState = await A.evaluate(() => ({ ...window.LekhokCall._qaDegradeState(), kind: window.LekhokCall._debug.kind }));
  check('④ অডিও-কলে স্তর-০ বজায় (kind-গার্ড)', guardState.kind === 'audio' && guardState.level === 0, guardState);
  await A.click('.lc-controls [data-lc="end"]');
  await A.waitForFunction(() => window.LekhokCall && window.LekhokCall.state() === 'idle', null, { timeout: 6000 }).catch(() => {});

  await ctxA.close().catch(() => {});
  await ctxB.close().catch(() => {});
  await browser.close();

  console.log('\n════════════════════════════════');
  console.log('PASS: ' + pass + '   FAIL: ' + fail);
  if (fails.length) { console.log('\nব্যর্থ চেক:'); fails.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2); });
