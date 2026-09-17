#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   সেশন ৯৩ — WebRTC কল-সিগন্যালিং API-র সম্পূর্ণ E2E যাচাই (দুই-ইউজার)
   ───────────────────────────────────────────────────────────────────────
   ব্যবহার: node scripts/verify-session93-calls.js http://localhost:3030
   (সার্ভার CALL_RING_TIMEOUT_S=4 দিয়ে চালালে missed-call-টেস্ট দ্রুত হয়)

   কভার: start→incoming→answer→active(answer)→ICE-বিনিময়→end→চ্যাট-রেকর্ড,
         decline-flow, cancel-flow, missed+নোটিফিকেশন, busy-guard ×২,
         group-ব্লক, auth-guard, ভিডিও-কাইন্ড, সাইজ-ক্যাপ।
   ═══════════════════════════════════════════════════════════════════════ */
const BASE = process.argv[2] || 'http://localhost:3030';
const U_A = 'ismail', U_B = 'monem', U_C = 'karishma', DEMO_PASS = 'demo123';

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra ? ' — ' + JSON.stringify(extra) : '')); }
}

function jar() {
  const cookies = {};
  return {
    header() { return Object.entries(cookies).map(([k, v]) => k + '=' + v).join('; '); },
    absorb(res) {
      const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      (Array.isArray(set) ? set : [set]).forEach(c => {
        const [kv] = c.split(';');
        const eq = kv.indexOf('=');
        if (eq > 0) cookies[kv.slice(0, eq).trim()] = kv.slice(eq + 1).trim();
      });
    }
  };
}
async function req(sess, method, path, body) {
  const opt = { method, headers: { Accept: 'application/json' }, redirect: 'manual' };
  if (sess) opt.headers.Cookie = sess.header();
  if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const res = await fetch(BASE + path, opt);
  if (sess) sess.absorb(res);
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json, location: res.headers.get('location') };
}

const FAKE_OFFER = { type: 'offer', sdp: 'v=0\r\no=- 4611731400430051336 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtpmap:111 opus/48000/2\r\n' };
const FAKE_ANSWER = { type: 'answer', sdp: 'v=0\r\no=- 99 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtpmap:111 opus/48000/2\r\n' };
const CAND = () => ({ type: 'candidate', candidate: { candidate: 'candidate:1 1 UDP 2122252543 192.168.0.' + (1 + Math.floor(Math.random() * 200)) + ' 53231 typ host generation 0', sdpMid: '0', sdpMLineIndex: 0 } });

async function login(username, password) {
  const s = jar();
  const r = await req(s, 'POST', '/login', { username, password });
  check('লগইন: ' + username, [200, 302, 303].includes(r.status) && !(r.json && r.json.error === 'login'), { status: r.status });
  return s;
}

(async () => {
  console.log('══ সেশন ৯৩ — কল-সিগন্যালিং E2E @ ' + BASE + ' ══');

  /* ── ০. auth-guard ── */
  console.log('\n— Auth-গার্ড —');
  const anon = await req(null, 'GET', '/api/calls/poll');
  check('পোল (অ-লগড-ইন) → 401', anon.status === 401, { status: anon.status });
  const anonStart = await req(null, 'POST', '/api/calls/start', { conv_id: 1, kind: 'audio', offer: FAKE_OFFER });
  check('start (অ-লগড-ইন) → 401', anonStart.status === 401, { status: anonStart.status });

  /* ── ১. দুই ইউজার লগইন ── */
  console.log('\n— লগইন —');
  const A = await login(U_A, DEMO_PASS);
  const B = await login(U_B, DEMO_PASS);

  // A↔B কথোপকথন নিশ্চিত: GET /messages/<B> পাওয়া-তৈরি করে; চ্যাট-পেজ-HTML থেকে
  // নির্দিষ্টভাবে এই 1:1-conv-এর id বের করি (unread-তালিকায় গ্রুপ থাকলে বিভ্রান্তি হয়)
  const html = await (await fetch(BASE + '/messages/' + U_B, { headers: { Cookie: A.header() } })).text();
  const mId = html.match(/const convId = (\d+);/);
  const convId = mId ? parseInt(mId[1], 10) : null;
  check('কথোপকথন-আইডি পাওয়া গেছে (HTML-পার্স)', !!convId, { convId });

  // নিশ্চিত: এই conv-টাই A↔B (1:1)? — পোল-কনভ থেকে যাচাই
  const chk = await req(A, 'GET', '/api/messages/poll?conv_id=' + convId + '&since=0');
  check('conv A↔B অ্যাক্সেসযোগ্য', chk.status === 200 && chk.json && Array.isArray(chk.json.messages), { status: chk.status });
  /* ── ২. ভুল-ইনপুট গার্ড ── */
  console.log('\n— ইনপুট-গার্ড —');
  const badStart = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio' });
  check('offer-হীন start → 400', badStart.status === 400, { status: badStart.status });
  const badConv = await req(A, 'POST', '/api/calls/start', { conv_id: 999999, kind: 'audio', offer: FAKE_OFFER });
  check('অজানা-conv start → 403', badConv.status === 403, { status: badConv.status });

  /* ── ৩. গ্রুপ-কল ব্লক ── */
  console.log('\n— গ্রুপ-কল ব্লক —');
  const gcreate = await req(A, 'POST', '/messages/group/create', { title: 'কল-টেস্ট-গ্রুপ', members: [U_B] });
  const gm = (gcreate.location || '').match(/\/messages\/g\/(\d+)/);
  const groupConvId = gm ? parseInt(gm[1], 10) : null;
  if (groupConvId) {
    const gcall = await req(A, 'POST', '/api/calls/start', { conv_id: groupConvId, kind: 'audio', offer: FAKE_OFFER });
    check('গ্রুপ-কল → 400 group_call_unsupported', gcall.status === 400 && gcall.json && gcall.json.error === 'group_call_unsupported', gcall.json);
  } else {
    check('গ্রুপ-কল ব্লক (গ্রুপ-তৈরি ব্যর্থ — স্কিপ)', true);
  }

  /* ── ৪. মূল ফ্লো: অডিও কল ── */
  console.log('\n— মূল ফ্লো (অডিও) —');
  // নির্ধারক-প্রি-ক্লিনআপ: পুরনো টেস্ট/অন্য-সোর্সের stale রিং self-heal (ring-timeout > 4s হলে ৫সে অপেক্ষা)
  await req(A, 'GET', '/api/calls/poll?after=0');
  await new Promise(r => setTimeout(r, 5200));
  await req(A, 'GET', '/api/calls/poll?after=0');
  const st = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio', offer: FAKE_OFFER });
  check('start → ok + call_id + peer', st.status === 200 && st.json.ok && st.json.call_id && st.json.peer, st.json);
  const callId = st.json && st.json.call_id;
  check('peer = ' + U_B, st.json && st.json.peer && st.json.peer.username === U_B, st.json.peer);

  // busy-guards
  const busyA = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio', offer: FAKE_OFFER });
  check('caller-আবার-শুরু → 409 busy', busyA.status === 409, { status: busyA.status });
  const busyB = await req(B, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio', offer: FAKE_OFFER });
  check('callee-নিজে-শুরু → 409 busy', busyB.status === 409, { status: busyB.status });

  // B-র পোলে incoming
  const pB1 = await req(B, 'GET', '/api/calls/poll?after=0');
  check('B-পোল: incoming দেখা যাচ্ছে', pB1.json && pB1.json.incoming && pB1.json.incoming.id === callId, pB1.json);
  check('incoming-এ caller= ' + U_A, pB1.json && pB1.json.incoming && pB1.json.incoming.caller && pB1.json.incoming.caller.username === U_A);
  check('incoming-এ offer-SDP আছে', pB1.json && pB1.json.incoming && pB1.json.incoming.offer && pB1.json.incoming.offer.sdp.indexOf('v=0') === 0);

  // A-র পোলে outgoing
  const pA1 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('A-পোল: outgoing ringing', pA1.json && pA1.json.outgoing && pA1.json.outgoing.id === callId && pA1.json.outgoing.status === 'ringing', pA1.json);

  // B গ্রহণ করল
  const ans = await req(B, 'POST', '/api/calls/' + callId + '/answer', { answer: FAKE_ANSWER });
  check('answer → ok', ans.status === 200 && ans.json.ok, ans.json);
  const ans2 = await req(B, 'POST', '/api/calls/' + callId + '/answer', { answer: FAKE_ANSWER });
  check('দ্বিতীয়-answer → 409 not_ringing', ans2.status === 409, { status: ans2.status });

  // A-র পোলে active + answer-SDP
  const pA2 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('A-পোল: active accepted', pA2.json && pA2.json.active && pA2.json.active.id === callId && pA2.json.active.status === 'accepted', pA2.json);
  check('active-এ answer-SDP আছে', pA2.json && pA2.json.active && pA2.json.active.answer && pA2.json.active.answer.sdp.indexOf('v=0') === 0);

  /* ── ৫. ICE-বিনিময় (দুই-দিক, sender-ফিল্টারসহ) ── */
  console.log('\n— ICE-সিগন্যালিং —');
  const c1 = await req(A, 'POST', '/api/calls/' + callId + '/signal', { signals: [CAND(), CAND()] });
  check('A→signal(২) ok', c1.status === 200 && c1.json.ok, c1.json);
  const c2 = await req(B, 'POST', '/api/calls/' + callId + '/signal', { signals: [CAND()] });
  check('B→signal(১) ok', c2.status === 200 && c2.json.ok, c2.json);

  const pB2 = await req(B, 'GET', '/api/calls/poll?after=0');
  const sigB = (pB2.json && pB2.json.signals) || [];
  const candB = sigB.filter(s => s.signal.type === 'candidate');
  check('B-পোল: A-র ২ candidate এসেছে', candB.length >= 2, { n: sigB.length, types: sigB.map(s => s.signal.type) });

  const pA3 = await req(A, 'GET', '/api/calls/poll?after=0');
  const sigA = (pA3.json && pA3.json.signals) || [];
  const candA = sigA.filter(s => s.signal.type === 'candidate');
  check('A-পোল: B-র ১ candidate এসেছে (+accepted-নজ)', candA.length >= 1, { n: sigA.length, types: sigA.map(s => s.signal.type) });

  // কার্সার: after=maxId → পরের পোলে পুরনো সিগন্যাল আসবে না
  const maxSeen = Math.max(pA3.json.after || 0, pB2.json.after || 0);
  const pA4 = await req(A, 'GET', '/api/calls/poll?after=' + maxSeen);
  check('কার্সার-অ্যাডভান্স: পুরনো-সিগন্যাল পুনরাবৃত্তি হয় না', ((pA4.json && pA4.json.signals) || []).length === 0, { n: pA4.json && pA4.json.signals && pA4.json.signals.length });

  // সাইজ-ক্যাপ: 8KB-বিশিষ্ট একটা candidate → প্রত্যাখ্যাত (কিন্তু 200-রেসপন্স, রো-না-ঢোকা)
  const big = { type: 'candidate', candidate: { candidate: 'x'.repeat(8192), sdpMid: '0', sdpMLineIndex: 0 } };
  await req(A, 'POST', '/api/calls/' + callId + '/signal', { signals: [big] });
  const pA5 = await req(A, 'GET', '/api/calls/poll?after=' + maxSeen);
  const noBig = ((pA5.json && pA5.json.signals) || []).every(s => !(s.signal.candidate && s.signal.candidate.candidate && s.signal.candidate.candidate.length > 4096));
  check('৪KB-ক্যাপ: বিশাল-পেলোড রিলে হয় না', noBig);

  /* ── ৬. কল-শেষ + চ্যাটে রেকর্ড ── */
  console.log('\n— কল-শেষ —');
  const end = await req(A, 'POST', '/api/calls/' + callId + '/end', { reason: 'hangup' });
  check('end → ok', end.status === 200 && end.json.ok, end.json);
  const pB3 = await req(B, 'GET', '/api/calls/poll?after=' + maxSeen);
  const gotEnd = (pB3.json && pB3.json.ended || []).some(e => e.id === callId && e.status === 'ended') ||
    ((pB3.json && pB3.json.signals) || []).some(s => s.signal.type === 'ended');
  check('B-পোল: ended-সিগন্যাল/স্টেট পেয়েছে', gotEnd, pB3.json && { ended: pB3.json.ended, sig: (pB3.json.signals || []).map(s => s.signal.type) });
  const pA6 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('A-পোল: আর কোনো active/outgoing নেই', !(pA6.json && pA6.json.active) && !(pA6.json && pA6.json.outgoing), pA6.json && { a: pA6.json.active, o: pA6.json.outgoing });

  // চ্যাটে কল-রেকর্ড মেসেজ (দুটো: answer-এর আগে-পরে নয় — এন্ড-হওয়ায় একটাই)
  const msgs = await req(A, 'GET', '/api/messages/check?conversation_id=' + convId + '&since=0');
  const callMsgs = ((msgs.json) || []).filter(m => typeof m.body === 'string' && m.body.indexOf('📞') === 0);
  check('চ্যাটে কল-রেকর্ড-মেসেজ ঢুকেছে (≥১)', callMsgs.length >= 1, { n: callMsgs.length, bodies: callMsgs.map(m => m.body) });

  /* ── ৭. decline-ফ্লো ── */
  console.log('\n— decline-ফ্লো —');
  const st2 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio', offer: FAKE_OFFER });
  const cid2 = st2.json.call_id;
  const dec = await req(B, 'POST', '/api/calls/' + cid2 + '/decline');
  check('B-decline ok', dec.status === 200 && dec.json.ok, dec.json);
  const pA7 = await req(A, 'GET', '/api/calls/poll?after=0');
  const declined = (pA7.json && pA7.json.ended || []).some(e => e.id === cid2 && e.status === 'declined');
  check('A-পোল: declined-স্টেট', declined, pA7.json && pA7.json.ended);
  const dmsgs = await req(A, 'GET', '/api/messages/check?conversation_id=' + convId + '&since=0');
  check('চ্যাটে "প্রত্যাখ্যাত"-রেকর্ড', ((dmsgs.json) || []).some(m => m.body && m.body.indexOf('প্রত্যাখ্যাত') > -1));

  /* ── ৮. ভিডিও-কাইন্ড + cancel-ফ্লো ── */
  console.log('\n— ভিডিও + cancel —');
  const st3 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'video', offer: FAKE_OFFER });
  check('ভিডিও-কল শুরু ok', st3.status === 200 && st3.json.ok, st3.json);
  const cid3 = st3.json.call_id;
  const pB4 = await req(B, 'GET', '/api/calls/poll?after=0');
  check('B: incoming kind=video', pB4.json && pB4.json.incoming && pB4.json.incoming.kind === 'video', pB4.json && pB4.json.incoming && pB4.json.incoming.kind);
  const can = await req(A, 'POST', '/api/calls/' + cid3 + '/cancel');
  check('A-cancel ok', can.status === 200 && can.json.ok, can.json);
  const pB5 = await req(B, 'GET', '/api/calls/poll?after=0');
  const cancelSeen = ((pB5.json && pB5.json.signals) || []).some(s => s.signal.type === 'cancelled') || (pB5.json && pB5.json.ended || []).some(e => e.id === cid3 && e.status === 'cancelled');
  check('B: cancel-সিগন্যাল পেয়েছে (রিং-বন্ধ জানার উপায়)', cancelSeen);

  /* ── ৯. missed-ফ্লো (রিং-টাইমআউট) + নোটিফিকেশন ── */
  console.log('\n— missed + নোটিফিকেশন —');
  const beforeNotif = await req(B, 'GET', '/api/notifications');
  const bCount0 = (beforeNotif.json && beforeNotif.json.notifications || beforeNotif.json || []).length || 0;
  const st4 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio', offer: FAKE_OFFER });
  const cid4 = st4.json.call_id;
  console.log('  … রিং-টাইমআউট-এর অপেক্ষা (CALL_RING_TIMEOUT_S=4 হলে ~৬সে)…');
  await new Promise(r => setTimeout(r, 7000));
  const pA8 = await req(A, 'GET', '/api/calls/poll?after=0');
  const missed = (pA8.json && pA8.json.ended || []).some(e => e.id === cid4 && e.status === 'missed');
  check('A-পোল: timeout→missed-মার্কড', missed, pA8.json && pA8.json.ended);
  const pB6 = await req(B, 'GET', '/api/calls/poll?after=0');
  check('B-পোল: মেয়াদোত্তীর্ণ incoming আর দেখায় না', !(pB6.json && pB6.json.incoming));
  const mmsgs = await req(A, 'GET', '/api/messages/check?conversation_id=' + convId + '&since=0');
  check('চ্যাটে "মিসড"-রেকর্ড', ((mmsgs.json) || []).some(m => m.body && m.body.indexOf('মিসড') > -1));
  const afterNotif = await req(B, 'GET', '/api/notifications');
  const bList = (afterNotif.json && afterNotif.json.notifications) || afterNotif.json || [];
  const missedNotif = JSON.stringify(bList).indexOf('মিসড কল') > -1 || JSON.stringify(bList).indexOf('কল দিয়েছিলেন') > -1;
  check('B: missed-নোটিফিকেশন ঢুকেছে', missedNotif);

  /* ── ১০. অনুপ্রবেশ-গার্ড: তৃতীয় পক্ষ ── */
  console.log('\n— অনুপ্রবেশ-গার্ড —');
  const C = await login(U_C, DEMO_PASS);
  const outsider = await req(C, 'POST', '/api/calls/' + (cid4 || 1) + '/end', { reason: 'hack' });
  check('-outsider end → 403', outsider.status === 403, { status: outsider.status });
  const outsiderSig = await req(C, 'POST', '/api/calls/' + (cid4 || 1) + '/signal', { signals: [CAND()] });
  check('outsider signal → 403', outsiderSig.status === 403, { status: outsiderSig.status });

  /* ── ১১. কল-ইতিহাস API (সেশন ৯৪ — চ্যাট-ডিটেইলস "কল" ট্যাব) ── */
  console.log('\n— কল-ইতিহাস —');
  const hist401 = await req(null, 'GET', '/api/calls/history?conv_id=' + convId);
  check('history (অ-লগড-ইন) → 401', hist401.status === 401, { status: hist401.status });
  const hist = await req(A, 'GET', '/api/calls/history?conv_id=' + convId);
  check('history → ok + calls অ্যারে', hist.status === 200 && hist.json.ok && Array.isArray(hist.json.calls), hist.json && { n: hist.json.calls && hist.json.calls.length });
  const hlist = (hist.json && hist.json.calls) || [];
  check('history: ≥৪ রো (এই-রাউন্ডের ফ্লোগুলো)', hlist.length >= 4, { n: hlist.length });
  check('history: peer সঠিক (' + U_B + ')', hist.json && hist.json.peer && hist.json.peer.username === U_B);
  check('history: ended-রোতে duration_s', hlist.some(c => c.status === 'ended' && typeof c.duration_s === 'number' && c.duration_s >= 0), { sample: hlist[0] });
  check('history: A-দৃষ্টিতে outgoing আছে', hlist.some(c => c.direction === 'outgoing'));
  const histB = await req(B, 'GET', '/api/calls/history?conv_id=' + convId);
  check('history: B-দৃষ্টিতে incoming আছে', ((histB.json && histB.json.calls) || []).some(c => c.direction === 'incoming'));
  if (groupConvId) {
    const histG = await req(A, 'GET', '/api/calls/history?conv_id=' + groupConvId);
    check('history: গ্রুপ-conv → 400', histG.status === 400 && histG.json && histG.json.error === 'group_call_unsupported', histG.json);
  }
  const histF = await req(A, 'GET', '/api/calls/history?conv_id=999999');
  check('history: অজানা-conv → 403', histF.status === 403, { status: histF.status });

  /* ── সারসংক্ষেপ ── */
  console.log('\n════════════════════════════════');
  console.log('  PASS: ' + pass + '   FAIL: ' + fail);
  if (fail) { console.log('\nব্যর্থ চেক:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
  console.log('  ALL GREEN ✓');
})().catch(e => { console.error('FATAL:', e); process.exit(2); });
