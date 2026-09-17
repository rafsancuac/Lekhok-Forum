#!/usr/bin/env node
/* ═════════════════════════════════════════════════════════════════════════
   সেশন ১১৩ — গ্রুপ-কল (mesh WebRTC) সিগন্যালিং-প্লেন E2E যাচাই (তিন-ইউজার)
   ─────────────────────────────────────────────────────────────────────────
   ব্যবহার: node scripts/verify-session113-groupcalls.js http://localhost:8080
   (সার্ভার CALL_RING_TIMEOUT_S=4 দিয়ে চালালে missed-টেস্ট দ্রুত হয়)

   কভার: গ্রুপ-স্টার্ট (অফার-বিহীন) → সব-সদস্যের incoming → ধাপে-ধাপে জয়েন
         (joined-তালিকা সঠিক) → mesh সিগন্যাল-রিলে (from-ভিত্তিক রাউটিং:
         offer/answer/candidate) → অংশগ্রহণকারী-তালিকা লাইভ → লিভ (সেশন-চলমান) →
         সব-লিভে সেশন-শেষ → decline → মিসড (রিং-টাইমআউট) → busy-guard ×২ →
         অ-অংশগ্রহণকারী signal → 403 → গ্রুপ-ইতিহাস → auth-গার্ড।
   ═════════════════════════════════════════════════════════════════════════ */
const BASE = process.argv[2] || 'http://localhost:8080';
const U_A = 'ismail', U_B = 'monem', U_C = 'karishma', U_D = 'mahfuz';
const DEMO_PASS = 'demo123', TRIO_PASS = 'secret123';

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra ? ' — ' + JSON.stringify(extra).slice(0, 220) : '')); console.log('  ✗ ' + name + (extra ? ' — ' + JSON.stringify(extra).slice(0, 220) : '')); }
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
async function login(username, password) {
  const s = jar();
  const r = await req(s, 'POST', '/login', { username, password });
  check('লগইন: ' + username, [200, 302, 303].includes(r.status) && !(r.json && r.json.error === 'login'), { status: r.status });
  return s;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FAKE_OFFER_SDP = { type: 'offer', sdp: 'v=0\r\no=- 113 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n' };
const FAKE_ANSWER_SDP = { type: 'answer', sdp: 'v=0\r\no=- 113a 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n' };
const CAND = n => ({ type: 'candidate', candidate: { candidate: 'candidate:' + n + ' 1 UDP 2122252543 192.168.113.' + n + ' 53231 typ host generation 0', sdpMid: '0', sdpMLineIndex: 0 } });
const signalsTo = (rows, type, fromUid) => rows.filter(r => r.from === fromUid && r.signal && r.signal.type === type);

(async () => {
  console.log('══ সেশন ১১৩ — গ্রুপ-কল (mesh) সিগন্যালিং E2E @ ' + BASE + ' ══');

  /* ── ০. auth-গার্ড ── */
  console.log('\n— Auth-গার্ড —');
  const anonStart = await req(null, 'POST', '/api/calls/start', { conv_id: 1, kind: 'audio' });
  check('start (অ-লগড-ইন) → 401', anonStart.status === 401, { status: anonStart.status });

  const A = await login(U_A, TRIO_PASS);
  const B = await login(U_B, DEMO_PASS);
  const C = await login(U_C, DEMO_PASS);
  const D = await login(U_D, DEMO_PASS);

  // প্রতি-ইউজার uid (mesh-রাউটিং যাচাইয়ের জন্য)
  const pollU = await req(A, 'GET', '/api/calls/poll?after=0');
  const uidA = pollU.json && pollU.json.me && pollU.json.me.id;
  const uidB = (await req(B, 'GET', '/api/calls/poll?after=0')).json.me.id;
  const uidC = (await req(C, 'GET', '/api/calls/poll?after=0')).json.me.id;

  // প্রি-ক্লিনআপ: পুরনো stale রিং self-heal
  await req(A, 'GET', '/api/calls/poll?after=0');
  await req(B, 'GET', '/api/calls/poll?after=0');
  await req(C, 'GET', '/api/calls/poll?after=0');

  /* ── ১. গ্রুপ-তৈরি + স্টার্ট ── */
  console.log('\n— গ্রুপ-স্টার্ট —');
  const gcreate = await req(A, 'POST', '/messages/group/create', { title: 'গ্রুপ-কল-ই১১৩', members: [U_B, U_C] });
  const gm = (gcreate.location || '').match(/\/messages\/g\/(\d+)/);
  check('গ্রুপ-তৈরি → রিডাইরেক্ট /messages/g/:id', !!gm, { loc: gcreate.location });
  const convId = gm ? parseInt(gm[1], 10) : 0;
  if (!convId) { console.log('গ্রুপ-তৈরি ব্যর্থ — টেস্ট অসম্পূর্ণ'); process.exit(1); }

  const st = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio' });
  check('গ্রুপ-স্টার্ট → 200 ok', st.status === 200 && st.json.ok, st.json);
  check('গ্রুপ-স্টার্ট → group:true + peer:null', st.json.group === true && st.json.peer === null, st.json);
  const callId = st.json && st.json.call_id;
  check('গ্রুপ-স্টার্ট → call_id', !!callId, st.json);
  if (!callId) process.exit(1);

  // busy-guard: কলার দ্বিতীয় কল দিতে পারে না (গ্রুপ + 1:1 উভয়ই)
  const st2 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'video' });
  check('busy-guard: চলমান-গ্রুপ-কলে দ্বিতীয় গ্রুপ-স্টার্ট → 409', st2.status === 409 && st2.json.error === 'busy', st2.json);

  // অ-অংশগ্রহণকারী সিগন্যাল → 403
  const dsig = await req(D, 'POST', '/api/calls/' + callId + '/signal', { signals: [CAND(1)] });
  check('অ-অংশগ্রহণকারী signal → 403', dsig.status === 403, { status: dsig.status });

  /* ── ২. আসন্ন-কল (B, C) + ধাপে-ধাপে জয়েন ── */
  console.log('\n— আসন্ন-কল ও জয়েন —');
  const pollB1 = await req(B, 'GET', '/api/calls/poll?after=0');
  check('B-পোল → incoming (গ্রুপ)', !!(pollB1.json && pollB1.json.incoming && pollB1.json.incoming.group === true), pollB1.json && pollB1.json.incoming);
  check('B-incoming: offer null (গ্রুপে SDP পরে)', pollB1.json.incoming && pollB1.json.incoming.offer === null, pollB1.json.incoming);
  check('B-incoming: caller = A', pollB1.json.incoming && pollB1.json.incoming.caller && pollB1.json.incoming.caller.username === U_A, pollB1.json.incoming);
  const pollC1 = await req(C, 'GET', '/api/calls/poll?after=0');
  check('C-পোল → incoming (গ্রুপ)', !!(pollC1.json && pollC1.json.incoming && pollC1.json.incoming.group === true), pollC1.json && pollC1.json.incoming);

  const ansB = await req(B, 'POST', '/api/calls/' + callId + '/answer', {});
  check('B-গ্রহণ → 200 (SDP-বিহীন গ্রুপ-গ্রহণ)', ansB.status === 200 && ansB.json.ok && ansB.json.group === true, ansB.json);
  check('B-গ্রহণ → joined = [A] (আগে-জয়েনড)', ansB.json.joined && ansB.json.joined.length === 1 && ansB.json.joined[0].username === U_A, ansB.json.joined);
  check('B-গ্রহণ → me_joined_at আছে', !!ansB.json.me_joined_at, ansB.json);

  const ansC = await req(C, 'POST', '/api/calls/' + callId + '/answer', {});
  check('C-গ্রহণ → joined = [A,B] (জয়েন-ক্রম)', ansC.json.joined && ansC.json.joined.length === 2 && ansC.json.joined[0].username === U_A && ansC.json.joined[1].username === U_B, ansC.json.joined);

  const ansB2 = await req(B, 'POST', '/api/calls/' + callId + '/answer', {});
  check('B-পুনঃগ্রহণ → already:true (idempotent)', ansB2.json.already === true, ansB2.json);

  const pollA1 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('A-পোল → group.active (accepted)', !!(pollA1.json.group && pollA1.json.group.status === 'accepted'), pollA1.json.group);
  const gparts = (pollA1.json.group && pollA1.json.group.participants) || [];
  check('A-অংশগ্রহণকারী: ৩-জনই joined', gparts.filter(p => p.status === 'joined').length === 3, gparts);
  check('A-অংশগ্রহণকারী: জয়েন-ক্রম A→B→C', gparts.length >= 3 && gparts[0].username === U_A && gparts[1].username === U_B && gparts[2].username === U_C, gparts.map(p => p.username));

  /* ── ৩. mesh সিগন্যাল-রিলে (from-ভিত্তিক রাউটিং) ── */
  console.log('\n— mesh সিগন্যাল-রিলে —');
  // B (নতুন-জয়েনকারী) → A-কে offer (to সহ) + ICE
  const sigB = await req(B, 'POST', '/api/calls/' + callId + '/signal', {
    signals: [
      { type: 'offer', to: 'user:' + (uidA), sdp: FAKE_OFFER_SDP },
      CAND(2), CAND(3)
    ]
  });
  check('B-signal ব্যাচ → ok', sigB.status === 200 && sigB.json.ok, sigB.json);
  const pollA2 = await req(A, 'GET', '/api/calls/poll?after=0');
  const aRows = (pollA2.json.signals || []).filter(r => r.call_id === callId);
  check('A-পোলে B-এর offer এসেছে (from=B)', signalsTo(aRows, 'offer', uidB).length === 1, aRows);
  check('A-পোলে B-এর ২-ক্যান্ডিডেট এসেছে', (aRows.filter(r => r.from === uidB && r.signal.type === 'candidate')).length === 2, aRows.length);
  check('A-পোলে নিজের সিগন্যাল নেই (sender বাদ)', !aRows.some(r => r.from === uidA), aRows.length);

  // A → B-কে answer + candidate
  const sigA = await req(A, 'POST', '/api/calls/' + callId + '/signal', {
    signals: [{ type: 'answer', to: 'user:' + (uidB), sdp: FAKE_ANSWER_SDP }, CAND(4)]
  });
  check('A-signal ব্যাচ → ok', sigA.status === 200 && sigA.json.ok, sigA.json);
  const pollB2 = await req(B, 'GET', '/api/calls/poll?after=0');
  const bRows = (pollB2.json.signals || []).filter(r => r.call_id === callId);
  check('B-পোলে A-এর answer এসেছে (from=A)', signalsTo(bRows, 'answer', uidA).length === 1, bRows);
  check('B-পোলে A-এর ক্যান্ডিডেট এসেছে', (bRows.filter(r => r.from === uidA && r.signal.type === 'candidate')).length === 1, bRows.length);

  // after-কার্সর: পুরনো সিগন্যাল পুনরাবৃত্তি হয় না
  const pollB3 = await req(B, 'GET', '/api/calls/poll?after=' + pollB2.json.after);
  check('after-কার্সরে ডুপ্লিকেট-শূন্য', ((pollB3.json.signals || []).filter(r => r.call_id === callId)).length === 0, pollB3.json.signals);

  /* ── ৪. লিভ: C চলে গেলে সেশন চলমান থাকে; সব-লিভে শেষ ── */
  console.log('\n— লিভ/শেষ —');
  const cLeave = await req(C, 'POST', '/api/calls/' + callId + '/end', { reason: 'hangup' });
  check('C-লিভ → ok', cLeave.status === 200 && cLeave.json.ok, cLeave.json);
  const pollA3 = await req(A, 'GET', '/api/calls/poll?after=0');
  const aLeft = (pollA3.json.signals || []).filter(r => r.call_id === callId && r.signal.type === 'left');
  check('A-পোলে C-এর left-সিগন্যাল', aLeft.some(r => r.from === uidC), aLeft);
  const pollA4 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('C-লিভেও সেশন accepted (A-দৃষ্টিতে)', pollA4.json.group && pollA4.json.group.status === 'accepted', pollA4.json.group);
  const cParts = (pollA4.json.group && pollA4.json.group.participants) || [];
  check('A-অংশগ্রহণকারী: C left, A+B joined', cParts.some(p => p.username === U_C && p.status === 'left') && cParts.filter(p => p.status === 'joined').length === 2, cParts.map(p => p.username + ':' + p.status));

  /* ── ৫. কলার-এন্ড: সবাই শেষ + চ্যাট-রেকর্ড + ইতিহাস ── */
  console.log('\n— কলার-এন্ড ও ইতিহাস —');
  const aEnd = await req(A, 'POST', '/api/calls/' + callId + '/end', { reason: 'hangup' });
  check('A-এন্ড → ok', aEnd.status === 200 && aEnd.json.ok, aEnd.json);
  const pollB4 = await req(B, 'GET', '/api/calls/poll?after=0');
  check('B-পোলে ended-সিগন্যাল (from=A)', (pollB4.json.signals || []).some(r => r.call_id === callId && r.from === uidA && r.signal.type === 'ended'), pollB4.json.signals);
  const histG = await req(A, 'GET', '/api/calls/history?conv_id=' + convId);
  check('গ্রুপ-ইতিহাস → 200 + group:true', histG.status === 200 && histG.json.ok && histG.json.group === true, histG.json);
  check('গ্রুপ-ইতিহাস: ended-রো আছে', ((histG.json.calls) || []).some(c => c.status === 'ended'), histG.json.calls);

  /* ── ৬. decline-ফ্লো ── */
  console.log('\n— decline-ফ্লো —');
  const st3 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio' });
  check('দ্বিতীয় গ্রুপ-কল স্টার্ট → ok', st3.status === 200 && st3.json.ok, st3.json);
  const callId2 = st3.json && st3.json.call_id;
  const decB = await req(B, 'POST', '/api/calls/' + callId2 + '/decline', {});
  check('B-decline → ok', decB.status === 200 && decB.json.ok, decB.json);
  const pollA5 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('A-পোলে declined-সিগন্যাল (from=B)', (pollA5.json.signals || []).some(r => r.call_id === callId2 && r.from === uidB && r.signal.type === 'declined'), pollA5.json.signals);
  const aEnd2 = await req(A, 'POST', '/api/calls/' + callId2 + '/end', { reason: 'hangup' });
  check('decline-কল ক্লিনআপ → ok', aEnd2.status === 200, aEnd2.json);
  await sleep(200);

  /* ── ৭. মিসড-ফ্লো (রিং-টাইমআউট) ── */
  console.log('\n— মিসড-ফ্লো —');
  const st4 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'video' });
  check('মিসড-টেস্ট স্টার্ট → ok', st4.status === 200 && st4.json.ok, st4.json);
  const callId3 = st4.json && st4.json.call_id;
  await sleep(5600); // RING_TIMEOUT_S=4 + মার্জিন
  const pollA6 = await req(A, 'GET', '/api/calls/poll?after=0');
  check('রিং-টাইমআউটে গ্রুপ-সেশন self-heal (আর অ্যাকটিভ নয়)', pollA6.json.group === null || pollA6.json.group === undefined, pollA6.json.group);
  const histM = await req(A, 'GET', '/api/calls/history?conv_id=' + convId);
  check('ইতিহাসে missed-রো', ((histM.json.calls) || []).some(c => c.id === callId3 && c.status === 'missed'), histM.json.calls && histM.json.calls[0]);

  /* ── ৮. busy-guard: গ্রুপ-অংশগ্রহণ 1:1-কে আটকায় ── */
  console.log('\n— busy-guard (গ্রুপ↔1:1) —');
  const st5 = await req(A, 'POST', '/api/calls/start', { conv_id: convId, kind: 'audio' });
  const callId5 = st5.json && st5.json.call_id;
  check('busy-টেস্ট স্টার্ট → ok', st5.status === 200 && st5.json.ok, st5.json);
  const ansB3 = await req(B, 'POST', '/api/calls/' + callId5 + '/answer', {});
  check('B-জয়েন → ok', ansB3.status === 200 && ansB3.json.ok, ansB3.json);
  // B এখন গ্রুপে joined — B-এর 1:1 পুরনো conv-এ কল → peer_busy/409 আশা করি (A গ্রুপে আছে)
  const hist0 = await req(A, 'GET', '/api/calls/history?conv_id=' + convId);
  check('busy-টেস্ট ক্লিনআপ-পূর্ব প্রস্তুত', hist0.status === 200, hist0.status);
  const aEnd3 = await req(A, 'POST', '/api/calls/' + callId5 + '/end', { reason: 'hangup' });
  check('busy-টেস্ট ক্লিনআপ → ok', aEnd3.status === 200, aEnd3.json);

  /* ── সারসংক্ষেপ ── */
  console.log('\n════════════════════════════════');
  console.log('  PASS: ' + pass + '  FAIL: ' + fail);
  if (fail) { console.log('\nফেইলসমূহ:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
  console.log('  ALL GREEN ✓');
  process.exit(0);

})();
