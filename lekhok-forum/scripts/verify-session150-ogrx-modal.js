#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১৫০ — og-কার্ড rx-ব্যাজ → reactors-modal (a11y-safe wrap-ভাই কাঠামো)
   ─────────────────────────────────────────────────────────────────────────
   চালানো: NODE_PATH=/home/z/.npm-global/lib/node_modules node \
             scripts/verify-session150-ogrx-modal.js http://localhost:3030

   প্রমাণ-তালিকা:
   ① wrap-ভাই কাঠামো: og-কার্ড এখন .lf-og-wrap150-রুটেড (data-lpv-u wrap-এ);
      rx-ব্যাজ অ্যাঙ্করের বাইরে বাস্তব-বাটন (a>button-nesting-নিষিদ্ধ — s147-সতর্কতা)
   ② ব্যাজ-চুক্তি: data-rx-open="post" + data-rx-id (session108 ডেলিগেশন-চুক্তি);
      aria-label + বাংলা-মোট + reactor-faces অ্যাভস্ট্যাক
   ③ ক্লিক → #reactorsModal খোলে (reactors ফেচ + রো-রেন্ডার); Escape → বন্ধ
   ④ কীবোর্ড: focus + Enter → মডাল খোলে (native-button a11y)
   ⑤ আর্টিকেল-বডি সারফেসেও একই আচরণ (mount-অ্যাডজাসেন্ট অক্ষুণ্ণ)
   ⑥ রিগ্রেশন: wrap-মাউন্টে ফিড-অ্যাঙ্কর অক্ষত + console-error-শূন্য + ক্লিনআপ
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = process.argv[2] || 'http://localhost:3030';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { chromium } = require('playwright');
  console.log('══ সেশন ১৫০ — og-কার্ড rx-ব্যাজ → reactors-modal E2E @ ' + BASE + ' ══\n');

  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'bn-BD' });
  const consoleErrors = [];
  ctx.on('page', (p) => {
    p.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 120)));
    p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR_ABORTED/i.test(m.text())) consoleErrors.push(m.text().slice(0, 120)); });
  });

  /* ── লগইন ── */
  const page = await ctx.newPage();
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="username"]', 'ismail');
  await page.fill('input[name="password"]', 'secret123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  check('ismail লগইন', (page.url() || '').indexOf('/login') === -1, page.url());

  /* ── সিড (ctx.request — cookies-শেয়ারড; headless-fetch-303-গোটচা এড়াতে) ── */
  const getCsrf = async (path) => {
    const r = await ctx.request.get(BASE + path);
    const t = await r.text();
    const m = t.match(/csrf-token" content="([^"]+)"/);
    return m ? m[1] : '';
  };
  const tok = await getCsrf('/qa/new');
  check('CSRF-টোকেন (/qa/new)', !!tok);

  const postForm = async (path, data) => {
    const r = await ctx.request.post(BASE + path, { form: { ...data, _csrf: tok }, maxRedirects: 5 });
    return { url: r.url(), status: r.status(), text: await r.text() };
  };
  const stamp = Date.now().toString(36);
  /* ১) টার্গেট-প্রশ্ন (রিঅ্যাকশন-গ্রহীতা) */
  const rq1 = await postForm('/qa/new', { title: 's150 সিড-টার্গেট প্রশ্ন ' + stamp, body: 's150 রিঅ্যাকশন-টার্গেট সিড বডি।' });
  const QT = (rq1.url.match(/\/qa\/(\d+)/) || [])[1];
  check('টার্গেট-প্রশ্ন সিড (/qa/' + QT + ')', !!QT, rq1.url);
  /* ২) লিংক-বহুল প্রশ্ন (ফিডে og-কার্ড জন্মায়) */
  const rq2 = await postForm('/qa/new', { title: 's150 og-rx প্রশ্ন ' + stamp, body: 'ভেতরের প্রশ্ন /qa/' + QT + ' দেখুন — প্রতিক্রিয়া-সত্য প্রমাণ।' });
  const Q = (rq2.url.match(/\/qa\/(\d+)/) || [])[1];
  check('লিংক-প্রশ্ন সিড (/qa/' + Q + ')', !!Q, rq2.url);
  /* ৩) টার্গেটে রিঅ্যাকশন (love — rx_total/rx_faces পেলোড) */
  const rr = await ctx.request.post(BASE + '/api/react', {
    data: { target_id: Number(QT), target_type: 'post', reaction_type: 'love' },
    headers: { 'x-csrf-token': tok }
  });
  const rj = await rr.json().catch(() => ({}));
  check('টার্গেটে love-রিঅ্যাকশন (/api/react)', rr.ok() && (rj.ok !== false), rj);
  /* ৪) আর্টিকেল (quick JSON — বডিতে লিংক) */
  const ra = await ctx.request.post(BASE + '/api/articles/quick', {
    data: { title: 's150 og-rx লেখা ' + stamp, body: 's150 লেখা-বডি — ভেতরের প্রশ্ন /qa/' + QT + ' দেখুন।' },
    headers: { 'x-csrf-token': tok }
  });
  const aj = await ra.json().catch(() => ({}));
  const ART = aj.id;
  check('আর্টিকেল সিড (/articles/' + ART + ')', !!(aj.ok && ART), aj);
  /* ৫) LPV-ক্যাশ-ওয়ার্ম (rx_faces-পেলোড যাচাই) */
  const lp = await ctx.request.get(BASE + '/api/link-preview?u=/qa/' + QT);
  const lpj = await lp.json().catch(() => ({}));
  const card = (lpj && lpj.card) || {};
  check('link-preview rx-পেলোড (total/top/faces)', card.rx_total && card.rx_top && Array.isArray(card.rx_faces) && card.rx_faces.length >= 1, { rx_total: card.rx_total, rx_top: card.rx_top, faces: (card.rx_faces || []).length });

  /* ══ টেস্ট-১: ফিড-সারফেস (/dashboard) ══ */
  console.log('\n— ① ফিড-সারফেস: wrap-ভাই কাঠামো + ব্যাজ-চুক্তি —');
  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  const wrapSel = '.lf-og-wrap150[data-lpv-u="/qa/' + QT + '"]';
  await page.waitForSelector(wrapSel + ':not(.lf-og-loading)', { timeout: 15000 }).catch(() => {}); // s150-গোটচা: লোডিং-শিমেও data-lpv-u আছে — real-card অপেক্ষা বাধ্যতামূলক
  const t1 = await page.evaluate((wrapSel) => {
    const w = document.querySelector(wrapSel);
    if (!w) return { found: false };
    const b = w.querySelector('button.lf-og-rx-btn150');
    const anchor = w.querySelector('a.lf-ogcard');
    return {
      found: true,
      wrapIsSpan: w.tagName === 'SPAN',
      dataOnWrap: w.getAttribute('data-lpv-u'),
      anchorOk: !!anchor && (anchor.getAttribute('href') === w.getAttribute('data-lpv-u')),
      badgeIsButton: !!b,
      badgeOutsideAnchor: !!b && !b.closest('a'),
      rxOpen: b && b.getAttribute('data-rx-open'),
      rxId: b && b.getAttribute('data-rx-id'),
      aria: b && b.getAttribute('aria-label'),
      avCount: b ? b.querySelectorAll('.lf-og-rx-av').length : 0,
      hasEmb: b ? !!b.querySelector('.lf-og-rx-emb') : false,
      countText: b ? (b.querySelector('.lf-og-rx-count') || {}).textContent : null,
      modalExists: !!document.getElementById('reactorsModal')
    };
  }, wrapSel);
  check('og-কার্ড wrap মাউন্ট', t1.found === true, t1);
  check('wrap=SPAN + data-lpv-u wrap-এ', t1.wrapIsSpan && t1.dataOnWrap === '/qa/' + QT, t1);
  check('অ্যাঙ্কর অক্ষত (href=lpv-u)', t1.anchorOk === true, t1);
  check('ব্যাজ=বাস্তব BUTTON (অ্যাঙ্কর-বাইরে — nesting-নিষিদ্ধ)', t1.badgeIsButton && t1.badgeOutsideAnchor, t1);
  check('data-rx-open=post + data-rx-id চুক্তি', t1.rxOpen === 'post' && String(t1.rxId) === String(QT), t1);
  check('aria-label (a11y)', typeof t1.aria === 'string' && t1.aria.indexOf('প্রতিক্রিয়া') !== -1, t1.aria);
  check('reactor-faces অ্যাভস্ট্যাক + শীর্ষ-ইমোজি-বাবল', t1.avCount >= 1 && t1.hasEmb, t1);
  check('বাংলা-মোট টেক্সট', t1.countText === '১', t1.countText);
  check('#reactorsModal পেজে উপস্থিত', t1.modalExists === true);

  console.log('\n— ② ক্লিক → মডাল + Escape + কীবোর্ড (প্রকৃত-CDB-input) —');
  await page.click(wrapSel + ' button.lf-og-rx-btn150');
  await page.waitForFunction(() => { const m = document.getElementById('reactorsModal'); return m && !m.hidden; }, null, { timeout: 8000 }).catch(() => {});
  const m1 = await page.evaluate(() => {
    const m = document.getElementById('reactorsModal');
    if (!m) return { open: false };
    const rows = m.querySelectorAll('.lf-rxm-row, .lf-rxm-fcell').length;
    const listHtml = (m.querySelector('.lf-rxm-list') || {}).innerHTML || '';
    return { open: !m.hidden, rows, hasAvatar: listHtml.indexOf('lf-rxm-av') !== -1 };
  });
  check('ক্লিকে মডাল খোলে', m1.open === true, m1);
  check('রিঅ্যাক্টর-রো রেন্ডার (≥১)', m1.rows >= 1, m1.rows);
  await page.screenshot({ path: 'scripts/s150-ogrx-modal.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  const m2 = await page.evaluate(() => { const m = document.getElementById('reactorsModal'); return m ? !m.hidden : null; });
  check('Escape-এ মডাল বন্ধ', m2 === false, m2);
  /* সেশন ১৫০-গোটচা: synthetic KeyboardEvent-এ native-activation হয় না — প্রকৃত playwright keyboard */
  await page.focus(wrapSel + ' button.lf-og-rx-btn150');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => { const m = document.getElementById('reactorsModal'); return m && !m.hidden; }, null, { timeout: 8000 }).catch(() => {});
  const m3 = await page.evaluate(() => { const m = document.getElementById('reactorsModal'); return { open: m ? !m.hidden : false }; });
  check('কীবোর্ড focus+Enter → মডাল খোলে', m3.open === true, m3);
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'scripts/s150-ogrx-feed.png' });

  /* ══ টেস্ট-২: আর্টিকেল-বডি সারফেস ══ */
  console.log('\n— ③ আর্টিকেল-বডি সারফেস: mount-অ্যাডজাসেন্ট + ব্যাজ —');
  await page.goto(BASE + '/articles/' + ART, { waitUntil: 'domcontentloaded' });
  const wrapSel2 = '.article-body ~ .lf-og-wrap150[data-lpv-u="/qa/' + QT + '"], .article-body .lf-og-wrap150[data-lpv-u="/qa/' + QT + '"], .lf-og-wrap150[data-lpv-u="/qa/' + QT + '"]';
  await page.waitForSelector(wrapSel2 + ':not(.lf-og-loading)', { timeout: 15000 }).catch(() => {}); // s150-গোটচা: শিম-ক্লিক-রেস এড়াতে
  const t2 = await page.evaluate(({ wrapSel, QT }) => {
    const ws = [...document.querySelectorAll('.lf-og-wrap150[data-lpv-u="/qa/' + QT + '"]')];
    if (!ws.length) return { found: false };
    const w = ws[0];
    const b = w.querySelector('button.lf-og-rx-btn150');
    const body = document.querySelector('.article-body');
    return {
      found: true,
      wrapCount: ws.length,
      adjacent: body ? (body.contains(w) || body.nextElementSibling === w) : false,
      badgeOk: !!b && b.getAttribute('data-rx-id') === String(QT),
      rxOpen: b && b.getAttribute('data-rx-open')
    };
  }, { wrapSel: wrapSel2, QT: QT });
  check('আর্টিকেল-বডিতে og-কার্ড wrap মাউন্ট (dup-শূন্য)', t2.found === true && t2.wrapCount === 1, t2);
  check('mount-অ্যাডজাসেন্ট (body-ভেতরে/পাশে)', t2.adjacent === true, t2);
  check('ব্যাজ আর্টিকেল-সারফেসেও চুক্তিসই (rx-id=' + QT + ')', t2.badgeOk && t2.rxOpen === 'post', t2);
  /* s150-গোটচা: কমা-সিলেক্টর-তালিকায় suffix শুধু শেষ-বিকল্পে বাঁধে — বাটন-স্টেপে একক-সিলেক্টর বাধ্যতামূলক */
  const ogBtnSel150 = '.lf-og-wrap150[data-lpv-u="/qa/' + QT + '"] button.lf-og-rx-btn150';
  const pre150 = await page.evaluate(({ sel }) => {
    const b = document.querySelector(sel);
    const m = document.getElementById('reactorsModal');
    if (!b) return { btn: false };
    const r = b.getBoundingClientRect();
    const topEl = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { btn: true, isButton: b.tagName === 'BUTTON', topIsBtnOrChild: b.contains(topEl), modalHiddenPre: m ? m.hidden : null };
  }, { sel: ogBtnSel150 });
  const m4 = await page.evaluate(({ sel }) => {
    const b = document.querySelector(sel);
    if (!b || b.tagName !== 'BUTTON') return { final: false, tagName: b && b.tagName };
    b.click();
    const m = document.getElementById('reactorsModal');
    return { final: m ? !m.hidden : false };
  }, { sel: ogBtnSel150 });
  check('আর্টিকেল-সারফেসে ক্লিকে মডাল (button-টার্গেট যাচাইকৃত)', m4 && m4.final === true && pre150.isButton === true, { m4: m4, pre: pre150 });
  await page.keyboard.press('Escape');

  /* ══ console-error + ক্লিনআপ ══ */
  console.log('\n— ④ কনসোল + ক্লিনআপ (303-অনুপস্থিতি-যাচাই) —');
  const realErrors = consoleErrors.filter((e) => !/favicon|net::ERR_ABORTED/i.test(e));
  check('console-error-শূন্য', realErrors.length === 0, realErrors.slice(0, 3));

  const tok2 = await getCsrf('/qa');
  const d1 = await ctx.request.post(BASE + '/qa/' + Q + '/delete', { form: { _csrf: tok2 }, maxRedirects: 0 });
  const d2 = await ctx.request.post(BASE + '/qa/' + QT + '/delete', { form: { _csrf: tok2 }, maxRedirects: 0 });
  const d3 = await ctx.request.post(BASE + '/articles/' + ART + '/delete', { form: { _csrf: tok2 }, maxRedirects: 0 });
  /* সেশন ১৫০-গোটচা: LPV-সার্ভার-ক্যাশ ৫মি — link-preview-দিয়ে absence-যাচাই নিষিদ্ধ (s147-নোট);
     প্রত্যক্ষ-পেজ 404-যাচাই */
  const g1 = await ctx.request.get(BASE + '/qa/' + QT);
  check('টার্গেট-প্রশ্ন ডিলিট (303-সফল)', d1.status() === 303, d1.status());
  check('লিংক-প্রশ্ন ডিলিট (303-সফল)', d2.status() === 303, d2.status());
  check('আর্টিকেল ডিলিট', [200, 302, 303].includes(d3.status()), d3.status());
  check('ক্লিনআপ-অনুপস্থিতি (/qa/QT 404)', g1.status() === 404, { status: g1.status() });

  await browser.close();
  console.log('\n════════════════════════════════');
  console.log('  PASS: ' + pass + '  FAIL: ' + fail);
  if (fail) { console.log('  FAILURES:\n    - ' + fails.join('\n    - ')); process.exit(1); }
  console.log('  ALL GREEN ✓');
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
