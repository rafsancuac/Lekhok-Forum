#!/usr/bin/env node
/* ডায়াগ: দুই-পেজ WebRTC ICE-স্টেট ডাম্প */
const BASE = process.argv[2] || 'http://localhost:8080';
(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const login = (ctx, u, p) => (async () => {
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await pg.fill('input[name="username"]', u);
    await pg.fill('input[name="password"]', p);
    await Promise.all([pg.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}), pg.click('button[type="submit"]')]);
    return pg;
  })();
  const A = await login(ctxA, 'ismail', 'secret123');
  const B = await login(ctxB, 'monem', 'demo123');
  await A.goto(BASE + '/messages/monem', { waitUntil: 'domcontentloaded' });
  await A.click('button[title="অডিও কল"]');
  await A.waitForSelector('.lc-root');
  await B.goto(BASE + '/messages', { waitUntil: 'domcontentloaded' });
  await B.waitForSelector('.lc-incoming', { timeout: 15000 });
  await B.click('[data-lc="accept"]');
  await new Promise(r => setTimeout(r, 12000));

  const dump = async (pg, tag) => {
    const d = await pg.evaluate(async () => {
      const S = window.LekhokCall._debug;
      const out = { state: S.state, callId: S.callId, queue: (S.queue || []).length, outBuf: (S.outBuf || []).length, after: S.after, conn: (S.pc || {}).connectionState, ice: (S.pc || {}).iceConnectionState, remote: !!S.remote };
      if (S.pc) {
        out.remoteDesc = S.pc.remoteDescription ? S.pc.remoteDescription.type : null;
        out.localDesc = S.pc.localDescription ? S.pc.localDescription.type : null;
        const st = await S.pc.getStats();
        out.cands = { host: 0, srflx: 0, relay: 0, prflx: 0, other: 0, mdns: 0 };
        let pair = null;
        st.forEach(r => {
          if (r.type === 'local-candidate') {
            const c = r.candidate || (r.address != null ? '' : '');
            if (/\.local/.test(r.address || '')) out.cands.mdns++;
            if (r.candidateType === 'host') out.cands.host++;
            else if (r.candidateType === 'srflx') out.cands.srflx++;
            else if (r.candidateType === 'relay') out.cands.relay++;
            else out.cands.other++;
          }
          if (r.type === 'candidate-pair' && (r.selected || r.state === 'succeeded')) pair = r;
          if (r.type === 'candidate-pair' && !pair && r.state !== 'failed') pair = r;
        });
        out.pair = pair ? { state: pair.state, selected: !!pair.selected, rtt: pair.currentRoundTripTime, localId: pair.localCandidateId, remoteId: pair.remoteCandidateId } : null;
      }
      return out;
    });
    console.log(tag, JSON.stringify(d));
  };
  await dump(A, 'A:');
  await dump(B, 'B:');
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(2); });
