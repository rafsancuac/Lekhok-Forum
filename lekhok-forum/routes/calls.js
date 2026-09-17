const express = require('express');
const router = express.Router();
const db = require('../db');

// ══════════════════════════════════════════════════════════════════════════
// সেশন ৯৩ — WebRTC অডিও/ভিডিও কল: HTTP-পোলিং সিগন্যালিং
// ──────────────────────────────────────────────────────────────────────────
// কেন এই আর্কিটেকচার? অ্যাপ Vercel-serverless-এ চলে — স্থায়ী WebSocket/Socket.io
// সম্ভব নয় (ফাংশন কয়েক সেকেন্ডেই freeze)। মেসেঞ্জার ইতিমধ্যেই HTTP-পোলিং-এ
// চলে (typing/seen/edits), তাই কল-সিগন্যালও একই প্যাটার্নে DB-মাধ্যমে রিলে হয়:
//
//   caller ──POST /api/calls/start (offer SDP)──▶ call_sessions
//   callee ◀──GET /api/calls/poll (incoming+offer)──────────────
//   callee ──POST /api/calls/:id/answer (answer SDP)──────────▶
//   দুই-পক্ষ ──POST /api/calls/:id/signal (ICE ব্যাচ)──▶ call_signals
//   দুই-পক্ষ ◀──GET /api/calls/poll?after=<cursor> (নতুন signal)─
//   যে-কেউ ──POST /api/calls/:id/end|decline|cancel──────────▶
//
// নিরাপত্তা: সব এন্ডপয়েন্ট ensureAuth + convAccess-গেটেড; শুধু 1:1 কথোপকথনে
// কল অনুমোদিত; busy-guard (এক ইউজার একসাথে একটাই কল); SDP/ICE-পেলোড সাইজ-ক্যাপ।
// ══════════════════════════════════════════════════════════════════════════

const RING_TIMEOUT_S = parseInt(process.env.CALL_RING_TIMEOUT_S, 10) || 45; // এত-সেকেন্ডে উত্তর না-এলে missed/cancelled (টেস্টে env-দিয়ে ছোট করা যায়)
const ACTIVE_WINDOW_S = 7200;   // ended-সেশন ক্লায়েন্ট-সিঙ্ক-উইন্ডো (২ ঘণ্টা)
const MAX_SIGNALS_PER_POST = 24;
const MAX_SIGNAL_PAYLOAD = 4096; // প্রতি ICE-candidate JSON-এর বাইট-সীমা

/* সেশন ১১৩: গ্রুপ-কল সাইজ-সীমা — মেশ-টপোলজিতে অংশগ্রহণকারী যত বাড়ে দ্রুত
   O(N²) PC-জোড়া হয়; স্যানিটি-ক্যাপ (FB-গ্রুপ-কলেও নিয়মিত ক্যাপ থাকে)। */
const MAX_GROUP_CALLERS = 8;

function ensureAuth(req, res, next) {
  if (!req.session.user) {
    if (req.originalUrl.startsWith('/api/') || req.xhr) return res.status(401).json({ error: 'login' });
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

async function convAccess(convId, me) {
  const conv = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
  if (!conv) return null;
  if (conv.is_group) {
    const m = await db.prepare('SELECT 1 AS x FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(convId, me);
    return m ? conv : null;
  }
  return (conv.user_a === me || conv.user_b === me) ? conv : null;
}

function peerOf(conv, me) { return conv.user_a === me ? conv.user_b : conv.user_a; }

// ── গ্রুপ-কল হেল্পার (সেশন ১১৩) ────────────────────────────────────────────
// অংশগ্রহণকারী-তালিকা (join users) — জয়েন-ক্রমে (NULL সবশেষে, তারপর id)
async function groupParticipants(callId) {
  return await db.prepare(
    `SELECT cp.id AS cp_id, cp.user_id, cp.status, cp.joined_at, cp.left_at,
            u.username, u.full_name, u.avatar_url
       FROM call_participants cp JOIN users u ON u.id = cp.user_id
      WHERE cp.call_id = ?
      ORDER BY (cp.joined_at IS NULL), cp.joined_at, cp.id`
  ).all(callId);
}

function participantPub(p) {
  return { id: p.user_id, username: p.username, name: p.full_name || p.username, avatar: p.avatar_url || ('/avatar/' + p.user_id), status: p.status, joined_at: p.joined_at || null };
}

// গ্রুপ-সেশন চূড়ান্তকরণ: কোনো ringing/joined অংশগ্রহণকারী না-থাকলে সেশন শেষ
// করে দাও (self-heal — ক্লায়েন্ট-নির্ভরতা নেই) + missed-নোটিফিকেশন/চ্যাট-রেকর্ড
async function maybeFinalizeAbandonedGroupCall(callId, reason) {
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ? AND is_group = 1').get(callId);
  if (!call || (call.status !== 'ringing' && call.status !== 'accepted')) return;
  const live = await db.prepare("SELECT COUNT(*) AS n FROM call_participants WHERE call_id = ? AND status IN ('ringing','joined')").get(callId);
  if (live.n > 0) return;
  const wasAccepted = call.status === 'accepted';
  const finalStatus = wasAccepted ? 'ended' : 'missed';
  await db.prepare("UPDATE call_sessions SET status = ?, ended_reason = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('ringing','accepted')")
    .run(finalStatus, wasAccepted ? (reason || 'all_left') : 'timeout', callId);
  // ringing-অংশগ্রহণকারীরা মিসড — নোটিফিকেশন
  const ringing = await db.prepare("SELECT user_id FROM call_participants WHERE call_id = ? AND status = 'ringing'").all(callId);
  if (!wasAccepted && ringing.length) {
    const kindBn = call.kind === 'video' ? 'ভিডিও' : 'অডিও';
    const caller = await publicUser(call.caller_id);
    for (const r of ringing) {
      try {
        await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
          r.user_id, 'call', 'মিসড কল',
          (caller ? caller.name : 'কেউ') + ' গ্রুপে ' + kindBn + ' কল দিয়েছিলেন',
          '/messages/g/' + call.conversation_id);
      } catch (_) {}
    }
  }
  if (wasAccepted) {
    const dur = await durationTextBn(call);
    await postCallMessage(call.conversation_id, call.caller_id, '📞 গ্রুপ ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল' + (dur ? ' — ' + dur : ''));
  } else {
    await postCallMessage(call.conversation_id, call.caller_id, '📞 মিসড গ্রুপ ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল');
  }
}

// গ্রুপ-রিং self-heal: আমার মেয়াদোত্তীর্ণ ringing-অংশগ্রহণ-রো missed-মার্ক
async function healGroupStale(me) {
  const stale = await db.prepare(
    `SELECT cp.id AS cp_id, cs.id AS call_id FROM call_participants cp
       JOIN call_sessions cs ON cs.id = cp.call_id
      WHERE cp.user_id = ? AND cp.status = 'ringing' AND cs.status = 'ringing' AND cs.is_group = 1
        AND cs.created_at < datetime('now', ?)`
  ).all(me, '-' + RING_TIMEOUT_S + ' seconds');
  for (const s of stale) {
    await db.prepare("UPDATE call_participants SET status='missed', left_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(s.cp_id);
    await maybeFinalizeAbandonedGroupCall(s.call_id);
  }
}

async function publicUser(id) {
  const u = await db.prepare('SELECT id, username, full_name, avatar_url, gender FROM users WHERE id = ?').get(id);
  if (!u) return null;
  return { id: u.id, username: u.username, name: u.full_name || u.username, avatar: u.avatar_url || ('/avatar/' + u.id) };
}

function parseSdp(raw) {
  if (!raw) return null;
  try { const o = JSON.parse(raw); return (o && o.type && o.sdp) ? { type: String(o.type), sdp: String(o.sdp) } : null; } catch (_) { return null; }
}

// কল-শেষে কথোপকথনে সিস্টেম-স্টাইল রেকর্ড-মেসেজ (FB-আচরণ — কল-ইতিহাস চ্যাটে থাকে)
async function postCallMessage(convId, senderId, text) {
  try {
    await db.prepare('INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)').run(convId, senderId, text);
    await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(convId);
  } catch (_) {}
}

function bnDigits(n) { return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]); }

async function durationTextBn(session) {
  if (!session.answered_at) return null;
  const t0 = new Date(session.answered_at.replace(' ', 'T') + 'Z').getTime();
  if (isNaN(t0)) return null;
  const dur = Math.max(0, Math.round((Date.now() - t0) / 1000));
  const m = Math.floor(dur / 60), s = dur % 60;
  return m > 0 ? (bnDigits(m) + ' মিনিট ' + bnDigits(s) + ' সেকেন্ড') : (bnDigits(s) + ' সেকেন্ড');
}

async function notifyMissed(session) {
  try {
    const kindBn = session.kind === 'video' ? 'ভিডিও' : 'অডিও';
    const caller = await publicUser(session.caller_id);
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      session.callee_id, 'call', 'মিসড কল',
      (caller ? caller.name : 'কেউ') + ' আপনাকে ' + kindBn + ' কল দিয়েছিলেন',
      '/messages/' + (caller ? caller.username : '')
    );
  } catch (_) {}
}

// busy-guard: আমি (caller বা callee) যেকোনো চলমান কলে আছি কি?
// (সাথে নিজের মেয়াদোত্তীর্ণ ringing-সেশন self-heal — ক্লায়েন্ট-পোল-নির্ভরতা নেই)
// সেশন ১১৩: গ্রুপ-কল — গ্রুপে আমি caller/জয়েনড-অংশগ্রহণকারী হলে ব্যস্ত;
// শুধু-রিং হচ্ছে (গ্রহণ করিনি) হলে ব্যস্ত নয় — অন্য-কলে গ্রহণ করলেই সেই রো missed হয়ে যাবে
async function activeCallOf(me) {
  const stale = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE (caller_id = ? OR callee_id = ?) AND status = 'ringing'
        AND created_at < datetime('now', ?)`
  ).all(me, me, '-' + RING_TIMEOUT_S + ' seconds');
  for (const sr of stale) {
    await db.prepare("UPDATE call_sessions SET status='missed', ended_reason='timeout', ended_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(sr.id);
    const again = await db.prepare('SELECT status FROM call_sessions WHERE id = ?').get(sr.id);
    if (again && again.status === 'missed') {
      if (sr.caller_id === me) { await notifyMissed(sr); await postCallMessage(sr.conversation_id, sr.caller_id, '📞 মিসড ' + (sr.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল'); }
    }
  }
  await healGroupStale(me);
  /* সেশন ১২২ self-heal: ব্রাউজার ক্র্যাশ/নেট-বিচ্ছিন্নতায় 'accepted' কল কখনোই
     'ended' না-হয়ে ঝুলে থাকলে দুই-পক্ষই চিরকাল busy (409) — নতুন কলই নেওয়া যায় না।
     সক্রিয়-উইন্ডো (২ ঘণ্টা) পেরিয়ে গেলে সার্ভার নিজেই 'ended'-মার্ক করে দিই। */
  await db.prepare(
    `UPDATE call_sessions SET status='ended', ended_reason='stale_cleanup', ended_at=CURRENT_TIMESTAMP
      WHERE status = 'accepted' AND answered_at IS NOT NULL
        AND answered_at < datetime('now', ?)`
  ).run('-' + ACTIVE_WINDOW_S + ' seconds');
  const one = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE status IN ('ringing','accepted') AND (caller_id = ? OR callee_id = ?)
      ORDER BY id DESC LIMIT 1`
  ).get(me, me);
  if (one) return one;
  return await db.prepare(
    `SELECT cs.* FROM call_sessions cs
      WHERE cs.is_group = 1 AND cs.status IN ('ringing','accepted')
        AND (cs.caller_id = ? OR EXISTS (
          SELECT 1 FROM call_participants cp
           WHERE cp.call_id = cs.id AND cp.user_id = ? AND cp.status = 'joined'))
      ORDER BY cs.id DESC LIMIT 1`
  ).get(me, me);
}

// ── কল শুরু (caller) ──────────────────────────────────────────────────────
router.post('/api/calls/start', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt((req.body || {}).conv_id);
  const kind = (req.body || {}).kind === 'video' ? 'video' : 'audio';
  const offer = (req.body || {}).offer;
  /* সেশন ১১৩: গ্রুপ-স্টার্ট অফার-বিহীন — অফার-যাচাই 1:1-শাখায় নেমে গেছে */
  if (!convId) return res.status(400).json({ ok: false, error: 'invalid' });

  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });

  /* ── সেশন ১১৩: গ্রুপ-কল (mesh) — গ্রুপ-কথোপকথনে অফার-বিহীন স্টার্ট ──
     1:1-এর মতো আগে-থেকে-অফার নয়: মেশ-এ প্রতি-পিয়ার PC আলাদা, SDP জয়েনের পরে
     প্রতি-জোড়ায় বিনিময় হয় (নতুন-জয়েনকারী আগে-জয়েনডদের প্রতি অফার পাঠায় —
     deterministic গ্লেয়ার-প্রতিরোধ)। callee_id=0 + is_group=1। */
  if (conv.is_group) {
    const busy = await activeCallOf(me);
    if (busy) return res.status(409).json({ ok: false, error: 'busy', call_id: busy.id });
    const members = await db.prepare(
      'SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?'
    ).all(convId, me);
    if (!members.length) return res.status(400).json({ ok: false, error: 'no_members' });
    if (members.length + 1 > MAX_GROUP_CALLERS) return res.status(400).json({ ok: false, error: 'too_many_members', cap: MAX_GROUP_CALLERS });
    const r = await db.prepare(
      `INSERT INTO call_sessions (conversation_id, caller_id, callee_id, kind, status, is_group)
       VALUES (?, ?, 0, ?, 'ringing', 1)`
    ).run(convId, me, kind);
    const callId = Number(r.lastInsertRowid);
    await db.prepare("INSERT INTO call_participants (call_id, user_id, status, joined_at) VALUES (?, ?, 'joined', CURRENT_TIMESTAMP)").run(callId, me);
    for (const m of members) {
      await db.prepare("INSERT OR IGNORE INTO call_participants (call_id, user_id, status) VALUES (?, ?, 'ringing')").run(callId, m.user_id);
    }
    return res.json({ ok: true, call_id: callId, peer: null, group: true });
  }

  const busy = await activeCallOf(me);
  if (busy) return res.status(409).json({ ok: false, error: 'busy', call_id: busy.id });

  /* 1:1 — অফার আবশ্যক (সেশন ১১৩: যাচাই এখানে সরিয়ে আনা হয়েছে) */
  if (!offer || !offer.type || !offer.sdp || typeof offer.sdp !== 'string' || offer.sdp.length > 32000) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const peerId = peerOf(conv, me);
  const peerBusy = await activeCallOf(peerId);
  if (peerBusy) return res.status(409).json({ ok: false, error: 'peer_busy' });

  const peer = await publicUser(peerId);
  if (!peer) return res.status(404).json({ ok: false, error: 'peer_not_found' });

  const r = await db.prepare(
    `INSERT INTO call_sessions (conversation_id, caller_id, callee_id, kind, status, offer_sdp)
     VALUES (?, ?, ?, ?, 'ringing', ?)`
  ).run(convId, me, peerId, kind, JSON.stringify({ type: offer.type, sdp: offer.sdp }));

  res.json({ ok: true, call_id: r.lastInsertRowid, peer });
});

// ── কল গ্রহণ (callee) ─────────────────────────────────────────────────────
router.post('/api/calls/:id/answer', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const answer = (req.body || {}).answer;

  /* ── সেশন ১১৩: গ্রুপ-গ্রহণ — অংশগ্রহণকারী-রো joined + প্রথম-জয়েনে সেশন accepted;
     SDP নেই — মেশ-এ প্রতি-জোড়ায় ক্লায়েন্টই অফার/আনসার আদান-প্রদান করে। রেসপনসে
     আগে-জয়েনড-অংশগ্রহণকারীর তালিকা (নতুন-জয়েনকারী এদের প্রতি অফার পাঠাবে)। */
  const grpCall = callId ? await db.prepare('SELECT * FROM call_sessions WHERE id = ? AND is_group = 1').get(callId) : null;
  if (grpCall) {
    const cp = await db.prepare('SELECT * FROM call_participants WHERE call_id = ? AND user_id = ?').get(callId, me);
    if (!cp) return res.status(403).json({ ok: false, error: 'forbidden' });
    if (grpCall.status !== 'ringing' && grpCall.status !== 'accepted') return res.status(409).json({ ok: false, error: 'not_ringing', status: grpCall.status });
    if (cp.status === 'joined') {
      const others = (await groupParticipants(callId)).filter(p => p.user_id !== me && p.status === 'joined');
      return res.json({ ok: true, group: true, already: true, me_joined_at: cp.joined_at, joined: others.map(participantPub) });
    }
    if (cp.status !== 'ringing') return res.status(409).json({ ok: false, error: 'not_ringing', status: cp.status });
    // রিং-টাইমআউট পেরিয়ে গেলে গ্রহণ অচল (1:1-এর মতোই)
    const createdMs = new Date(grpCall.created_at.replace(' ', 'T') + 'Z').getTime();
    if (isNaN(createdMs) || (Date.now() - createdMs) > (RING_TIMEOUT_S + 10) * 1000) {
      await db.prepare("UPDATE call_participants SET status='missed', left_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(cp.id);
      await maybeFinalizeAbandonedGroupCall(callId);
      return res.status(409).json({ ok: false, error: 'expired' });
    }
    const others = (await groupParticipants(callId)).filter(p => p.user_id !== me && p.status === 'joined');
    await db.prepare("UPDATE call_participants SET status='joined', joined_at=CURRENT_TIMESTAMP, left_at=NULL WHERE id = ? AND status = 'ringing'").run(cp.id);
    await db.prepare("UPDATE call_sessions SET status='accepted', answered_at=CURRENT_TIMESTAMP WHERE id = ? AND status = 'ringing'").run(callId);
    // স্বাস্থ্য-পরিষ্কার: অন্য-কলে আমার ঝুলন্ত ringing-অংশগ্রহণ-রো মিসড-মার্ক (এক-ইউজার-এক-কল)
    await db.prepare(
      `UPDATE call_participants SET status='missed', left_at=CURRENT_TIMESTAMP
        WHERE user_id = ? AND call_id != ? AND status = 'ringing'`
    ).run(me, callId);
    await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
      .run(callId, me, JSON.stringify({ type: 'joined' }));
    return res.json({ ok: true, group: true, me_joined_at: new Date().toISOString().slice(0, 19).replace('T', ' '), joined: others.map(participantPub) });
  }

  if (!callId || !answer || !answer.type || !answer.sdp) return res.status(400).json({ ok: false, error: 'invalid' });
  if (typeof answer.sdp !== 'string' || answer.sdp.length > 32000) return res.status(400).json({ ok: false, error: 'invalid' });

  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  if (!call || call.callee_id !== me) return res.status(403).json({ ok: false, error: 'forbidden' });
  if (call.status !== 'ringing') return res.status(409).json({ ok: false, error: 'not_ringing', status: call.status });

  // রিং-টাইমআউট পেরিয়ে গেলে গ্রহণ অচল (caller ইতিমধ্যে ছেড়ে দিয়েছে ধরে নেওয়া হয়)
  const createdMs = new Date(call.created_at.replace(' ', 'T') + 'Z').getTime();
  if (isNaN(createdMs) || (Date.now() - createdMs) > (RING_TIMEOUT_S + 10) * 1000) {
    await db.prepare("UPDATE call_sessions SET status='missed', ended_reason='timeout', ended_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(callId);
    return res.status(409).json({ ok: false, error: 'expired' });
  }

  await db.prepare(
    "UPDATE call_sessions SET status='accepted', answered_at=CURRENT_TIMESTAMP, answer_sdp=? WHERE id = ? AND status='ringing'"
  ).run(JSON.stringify({ type: answer.type, sdp: answer.sdp }), callId);

  // দ্রুত-পথ: caller-এর পোল না-আসা পর্যন্ত অপেক্ষা না-করতে signal-ও বসাই
  await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
    .run(callId, me, JSON.stringify({ type: 'accepted' }));

  res.json({ ok: true });
});

// ── কল প্রত্যাখ্যান (callee) ───────────────────────────────────────────────
router.post('/api/calls/:id/decline', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  if (!call || call.callee_id !== me) {
    /* সেশন ১১৩: গ্রুপ-প্রত্যাখ্যান — অংশগ্রহণকারী-রো declined + সিগন্যাল */
    if (call && call.is_group) {
      const cp = await db.prepare('SELECT * FROM call_participants WHERE call_id = ? AND user_id = ?').get(callId, me);
      if (!cp) return res.status(403).json({ ok: false, error: 'forbidden' });
      if (cp.status === 'ringing') {
        await db.prepare("UPDATE call_participants SET status='declined', left_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(cp.id);
        await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
          .run(callId, me, JSON.stringify({ type: 'declined' }));
      }
      return res.json({ ok: true });
    }
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if (call.status !== 'ringing') return res.json({ ok: true });
  await db.prepare("UPDATE call_sessions SET status='declined', ended_by=?, ended_reason='declined', ended_at=CURRENT_TIMESTAMP WHERE id = ?").run(me, callId);
  await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
    .run(callId, me, JSON.stringify({ type: 'declined' }));
  await postCallMessage(call.conversation_id, call.caller_id, '📞 ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল — প্রত্যাখ্যাত');
  res.json({ ok: true });
});

// ── রিং-চলাকালীন বাতিল (caller) ───────────────────────────────────────────
router.post('/api/calls/:id/cancel', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  if (!call || call.caller_id !== me) return res.status(403).json({ ok: false, error: 'forbidden' });
  if (call.status !== 'ringing') return res.json({ ok: true });
  await db.prepare("UPDATE call_sessions SET status='cancelled', ended_by=?, ended_reason='cancelled', ended_at=CURRENT_TIMESTAMP WHERE id = ?").run(me, callId);
  await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
    .run(callId, me, JSON.stringify({ type: 'cancelled' }));
  /* সেশন ১১৩: গ্রুপ-বাতিল — রিং-অংশগ্রহণকারীরা মিসড-মার্ক */
  if (call.is_group) {
    await db.prepare("UPDATE call_participants SET status='missed', left_at=CURRENT_TIMESTAMP WHERE call_id = ? AND status = 'ringing'").run(callId);
  }
  res.json({ ok: true });
});

// ── কল শেষ (যে-কেউ পক্ষ) ──────────────────────────────────────────────────
router.post('/api/calls/:id/end', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const reason = String(((req.body || {}).reason || 'hangup')).slice(0, 24);
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  if (!call || (call.caller_id !== me && call.callee_id !== me)) {
    /* সেশন ১১৩: গ্রুপ-লিভ/এন্ড — caller=পুরো-কল-শেষ; অন্য=শুধু-লিভ (সবাই গেলে সেশন শেষ) */
    if (call && call.is_group) {
      const cp = await db.prepare('SELECT * FROM call_participants WHERE call_id = ? AND user_id = ?').get(callId, me);
      if (!cp) return res.status(403).json({ ok: false, error: 'forbidden' });
      if (me === call.caller_id) {
        const wasAccepted = call.status === 'accepted';
        const wasRinging = call.status === 'ringing';
        await db.prepare("UPDATE call_participants SET status='left', left_at=CURRENT_TIMESTAMP WHERE call_id = ? AND status = 'joined'").run(callId);
        await db.prepare("UPDATE call_participants SET status='missed', left_at=CURRENT_TIMESTAMP WHERE call_id = ? AND status = 'ringing'").run(callId);
        await db.prepare("UPDATE call_sessions SET status='ended', ended_by=?, ended_reason=?, ended_at=CURRENT_TIMESTAMP WHERE id = ? AND status IN ('ringing','accepted')").run(me, reason, callId);
        await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
          .run(callId, me, JSON.stringify({ type: 'ended', reason }));
        if (wasAccepted) {
          const dur = await durationTextBn(call);
          await postCallMessage(call.conversation_id, call.caller_id, '📞 গ্রুপ ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল' + (dur ? ' — ' + dur : ''));
        } else if (wasRinging) {
          const ringed = await db.prepare("SELECT user_id FROM call_participants WHERE call_id = ? AND status = 'missed'").all(callId);
          const kindBn = call.kind === 'video' ? 'ভিডিও' : 'অডিও';
          const caller = await publicUser(call.caller_id);
          for (const r of ringed) {
            try {
              await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
                r.user_id, 'call', 'মিসড কল',
                (caller ? caller.name : 'কেউ') + ' গ্রুপে ' + kindBn + ' কল দিয়েছিলেন',
                '/messages/g/' + call.conversation_id);
            } catch (_) {}
          }
          await postCallMessage(call.conversation_id, call.caller_id, '📞 মিসড গ্রুপ ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল');
        }
      } else if (cp.status === 'joined') {
        await db.prepare("UPDATE call_participants SET status='left', left_at=CURRENT_TIMESTAMP WHERE id = ? AND status = 'joined'").run(cp.id);
        await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
          .run(callId, me, JSON.stringify({ type: 'left' }));
        await maybeFinalizeAbandonedGroupCall(callId, 'all_left');
      }
      return res.json({ ok: true });
    }
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if (call.status === 'ended' || call.status === 'declined' || call.status === 'cancelled' || call.status === 'missed') {
    return res.json({ ok: true });
  }

  const wasAccepted = call.status === 'accepted';
  await db.prepare("UPDATE call_sessions SET status='ended', ended_by=?, ended_reason=?, ended_at=CURRENT_TIMESTAMP WHERE id = ?").run(me, reason, callId);
  await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)')
    .run(callId, me, JSON.stringify({ type: 'ended', reason }));

  if (wasAccepted) {
    const dur = await durationTextBn(call);
    await postCallMessage(call.conversation_id, call.caller_id, '📞 ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল' + (dur ? ' — ' + dur : ''));
  } else if (call.status === 'ringing') {
    // callee-র পক্ষে missed-হিসেবে চিহ্নিত (caller হাতে-কোরাম কেটে দিয়েছে)
    await db.prepare("UPDATE call_sessions SET status='missed', ended_reason='hangup_before_answer', ended_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'").run(callId);
    await notifyMissed(call);
    await postCallMessage(call.conversation_id, call.caller_id, '📞 মিসড ' + (call.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল');
  }
  res.json({ ok: true });
});

// ── ICE-candidate (বা ভবিষ্যৎ-রিনেগোশিয়েশন) সিগন্যাল পুশ ─────────────────
router.post('/api/calls/:id/signal', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const list = (req.body || {}).signals;
  if (!callId || !Array.isArray(list) || !list.length) return res.status(400).json({ ok: false, error: 'invalid' });
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  let allowed = !!call && (call.caller_id === me || call.callee_id === me);
  /* সেশন ১১৩: গ্রুপ-কলে যে-কোনো অংশগ্রহণকারী (রিং/জয়েনড/লিফট) সিগনাল পাঠাতে পারে */
  if (!allowed && call && call.is_group) {
    const cp = await db.prepare("SELECT 1 AS x FROM call_participants WHERE call_id = ? AND user_id = ? AND status IN ('ringing','joined','left')").get(callId, me);
    allowed = !!cp;
  }
  if (!allowed) return res.status(403).json({ ok: false, error: 'forbidden' });

  const batch = list.slice(0, MAX_SIGNALS_PER_POST);
  for (const sig of batch) {
    let payload;
    try { payload = JSON.stringify(sig); } catch (_) { continue; }
    if (!payload || payload.length > MAX_SIGNAL_PAYLOAD) continue;
    try {
      await db.prepare('INSERT INTO call_signals (call_id, sender_id, payload) VALUES (?, ?, ?)').run(callId, me, payload);
    } catch (_) {}
  }
  res.json({ ok: true });
});

// ── কল-ইতিহাস (চ্যাট-ডিটেইলস-প্যানেলের "কল" ট্যাব — সেশন ৯৪) ──────────────
// সেশন ১১৩: গ্রুপ-কথোপকথনেও কাজ করে (গ্রুপ-সেশনে peer=null, direction=caller-ভিত্তিক)
router.get('/api/calls/history', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt(req.query.conv_id);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  if (!convId) return res.status(400).json({ ok: false, error: 'invalid' });
  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });

  const peer = conv.is_group ? null : await publicUser(peerOf(conv, me));
  const rows = await db.prepare(
    `SELECT id, caller_id, callee_id, kind, status, answered_at, ended_at, ended_reason, created_at
       FROM call_sessions WHERE conversation_id = ?
       ORDER BY id DESC LIMIT ?`
  ).all(convId, limit);

  const calls = rows.map(function (r) {
    let durS = null;
    if (r.answered_at && r.ended_at) {
      const t0 = new Date(r.answered_at.replace(' ', 'T') + 'Z').getTime();
      const t1 = new Date(r.ended_at.replace(' ', 'T') + 'Z').getTime();
      if (!isNaN(t0) && !isNaN(t1) && t1 >= t0) durS = Math.round((t1 - t0) / 1000);
    }
    return {
      id: r.id,
      kind: r.kind === 'video' ? 'video' : 'audio',
      status: r.status,
      direction: r.caller_id === me ? 'outgoing' : 'incoming',
      duration_s: durS,
      reason: r.ended_reason || '',
      created_at: r.created_at
    };
  });

  res.json({ ok: true, peer, group: !!conv.is_group, calls });
});

// ── পোল: incoming + outgoing + active + ended + নতুন signals (এক-কল-সব) ──
router.get('/api/calls/poll', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const after = parseInt(req.query.after) || 0;

  // (০) আমার আউটগোয়িং রিং-টাইমআউট হলে missed-মার্ক + নোটিফিকেশন (একবারই,
  //     status='ringing' গার্ডে রেস-নিরাপদ) + গ্রুপ-রিং self-heal (সেশন ১১৩)
  const staleRing = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE caller_id = ? AND status = 'ringing'
        AND created_at < datetime('now', ?)`
  ).get(me, '-' + RING_TIMEOUT_S + ' seconds');
  if (staleRing) {
    await db.prepare(
      "UPDATE call_sessions SET status='missed', ended_reason='timeout', ended_at=CURRENT_TIMESTAMP WHERE id = ? AND status='ringing'"
    ).run(staleRing.id);
    // রেস-নিরাপদ কনফার্ম: পুনঃকোয়েরিতে status বদলেছে কি-না (একবারই নোটিফাই)
    const again = await db.prepare('SELECT status FROM call_sessions WHERE id = ?').get(staleRing.id);
    if (again && again.status === 'missed') {
      await notifyMissed(staleRing);
      await postCallMessage(staleRing.conversation_id, staleRing.caller_id, '📞 মিসড ' + (staleRing.kind === 'video' ? 'ভিডিও' : 'অডিও') + ' কল');
    }
  }
  await healGroupStale(me);

  // (১) আমার জন্য আসন্ন কল (callee, ringing, সদ্য) — 1:1 আগে, তারপর গ্রুপ (সেশন ১১৩)
  let incoming = null;
  const inc = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE callee_id = ? AND status = 'ringing'
        AND created_at >= datetime('now', ?)
      ORDER BY id DESC LIMIT 1`
  ).get(me, '-' + RING_TIMEOUT_S + ' seconds');
  if (inc) {
    incoming = {
      id: inc.id,
      kind: inc.kind === 'video' ? 'video' : 'audio',
      caller: await publicUser(inc.caller_id),
      offer: parseSdp(inc.offer_sdp),
      conversation_id: inc.conversation_id,
      age_s: Math.round((Date.now() - new Date(inc.created_at.replace(' ', 'T') + 'Z').getTime()) / 1000),
      /* সেশন ৯৭: ক্লায়েন্ট-সাইড সেফটি-টাইমআউটের জন্য — কলারের ক্লায়েন্ট মরে
         গেলে সার্ভার মিসড-মার্ক করতে পারে না; ক্যালি নিজেই মোডাল সরাবে */
      ring_timeout_s: RING_TIMEOUT_S
    };
  }
  if (!incoming) {
    const ginc = await db.prepare(
      `SELECT cs.*, cp.id AS cp_id FROM call_participants cp
         JOIN call_sessions cs ON cs.id = cp.call_id
        WHERE cp.user_id = ? AND cp.status = 'ringing' AND cs.status = 'ringing' AND cs.is_group = 1
          AND cs.created_at >= datetime('now', ?)
        ORDER BY cs.id DESC LIMIT 1`
    ).get(me, '-' + RING_TIMEOUT_S + ' seconds');
    if (ginc) {
      incoming = {
        id: ginc.id,
        kind: ginc.kind === 'video' ? 'video' : 'audio',
        group: true,
        caller: await publicUser(ginc.caller_id),
        offer: null,
        conversation_id: ginc.conversation_id,
        age_s: Math.round((Date.now() - new Date(ginc.created_at.replace(' ', 'T') + 'Z').getTime()) / 1000),
        ring_timeout_s: RING_TIMEOUT_S
      };
    }
  }

  // (২) আমার চলমান কল (caller হিসেবে ringing — callee হিসেবে/উভয় হিসেবে accepted)
  //     সেশন ১১৩: গ্রুপ-সেশন এখানে নয় — নিচে (২খ)-তে আলাদা শেপে
  let outgoing = null, active = null;
  const mine = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE status IN ('ringing','accepted') AND (caller_id = ? OR callee_id = ?)
        AND (is_group = 0 OR is_group IS NULL)
      ORDER BY id DESC LIMIT 1`
  ).get(me, me);
  if (mine) {
    const role = mine.caller_id === me ? 'caller' : 'callee';
    const peerId = mine.caller_id === me ? mine.callee_id : mine.caller_id;
    const base = {
      id: mine.id,
      kind: mine.kind === 'video' ? 'video' : 'audio',
      status: mine.status,
      role,
      conversation_id: mine.conversation_id,
      peer: await publicUser(peerId)
    };
    if (role === 'caller' && mine.status === 'ringing') {
      outgoing = base;
    } else if (mine.status === 'accepted') {
      base.answer = parseSdp(mine.answer_sdp);
      active = base;
    } else if (role === 'callee' && mine.status === 'ringing') {
      // (১)-এ ইতিমধ্যে incoming হিসেবে গেছে
    }
  }

  // (২খ) গ্রুপ-কল অ্যাকটিভ (সেশন ১১৩) — caller বা জয়েনড-অংশগ্রহণকারী হিসেবে;
  // অংশগ্রহণকারী-তালিকা (ক্লায়েন্ট গ্রিড/পিয়ার-রিকনসাইলেশন এটাই পড়ে)
  let group = null;
  const gmine = await db.prepare(
    `SELECT cs.* FROM call_sessions cs
      WHERE cs.is_group = 1 AND cs.status IN ('ringing','accepted')
        AND (cs.caller_id = ? OR EXISTS (
          SELECT 1 FROM call_participants cp
           WHERE cp.call_id = cs.id AND cp.user_id = ? AND cp.status = 'joined'))
      ORDER BY cs.id DESC LIMIT 1`
  ).get(me, me);
  if (gmine) {
    const parts = await groupParticipants(gmine.id);
    const meRow = parts.find(p => p.user_id === me);
    group = {
      id: gmine.id,
      kind: gmine.kind === 'video' ? 'video' : 'audio',
      status: gmine.status,
      role: gmine.caller_id === me ? 'caller' : 'callee',
      conversation_id: gmine.conversation_id,
      me_joined_at: meRow ? (meRow.joined_at || null) : null,
      participants: parts.map(participantPub),
      ringing_count: parts.filter(p => p.status === 'ringing').length
    };
  }

  // (৩) সদ্য-শেষ হওয়া কল (২০-সেকেন্ড-উইন্ডো) — ক্লায়েন্ট UI-কে জানাতে
  //     সেশন ১১৩: গ্রুপ-অংশগ্রহণও অন্তর্ভুক্ত
  const recentEnded = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE (caller_id = ? OR callee_id = ? OR EXISTS (
        SELECT 1 FROM call_participants cp
         WHERE cp.call_id = call_sessions.id AND cp.user_id = ?))
        AND status IN ('ended','declined','cancelled','missed')
        AND ended_at >= datetime('now', '-20 seconds')
      ORDER BY id DESC LIMIT 3`
  ).all(me, me, me);
  const ended = [];
  for (const c of recentEnded) {
    ended.push({
      id: c.id,
      status: c.status,
      role: c.caller_id === me ? 'caller' : 'callee',
      reason: c.ended_reason || '',
      by_me: c.ended_by === me,
      kind: c.kind === 'video' ? 'video' : 'audio',
      group: !!(c.is_group)
    });
  }

  // (৪) নতুন signals — আমার সাম্প্রতিক কলগুলোর (চলমান + সদ্য-শেষ) ভেতর থেকে
  //     সেশন ১১৩: গ্রুপ-অংশগ্রহণও অন্তর্ভুক্ত; প্রতি-রো-তে from=sender_id (মেশ-রাউটিং)
  const myRecent = await db.prepare(
    `SELECT id FROM call_sessions
      WHERE (caller_id = ? OR callee_id = ? OR EXISTS (
        SELECT 1 FROM call_participants cp
         WHERE cp.call_id = call_sessions.id AND cp.user_id = ?))
        AND (status IN ('ringing','accepted') OR (ended_at IS NOT NULL AND ended_at >= datetime('now', ?)))
      ORDER BY id DESC LIMIT 5`
  ).all(me, me, me, '-' + Math.min(ACTIVE_WINDOW_S, 600) + ' seconds');
  let signals = [];
  let maxId = after;
  if (myRecent.length) {
    const ids = myRecent.map(r => r.id);
    const ph = ids.map(() => '?').join(',');
    const rows = await db.prepare(
      `SELECT id, call_id, sender_id, payload FROM call_signals
        WHERE call_id IN (${ph}) AND sender_id != ? AND id > ? ORDER BY id ASC LIMIT 120`
    ).all(...ids, me, after);
    signals = rows.map(r => {
      let p = null;
      try { p = JSON.parse(r.payload); } catch (_) {}
      maxId = Math.max(maxId, r.id);
      return { call_id: r.call_id, from: r.sender_id, signal: p };
    }).filter(x => x.signal);
  }

  res.json({ ok: true, after: maxId, incoming, outgoing, active, group, ended, signals, me: { id: me } });
});

module.exports = router;
