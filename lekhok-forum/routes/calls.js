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
  return await db.prepare(
    `SELECT * FROM call_sessions
      WHERE status IN ('ringing','accepted')
        AND (caller_id = ? OR callee_id = ?)
      ORDER BY id DESC LIMIT 1`
  ).get(me, me);
}

// ── কল শুরু (caller) ──────────────────────────────────────────────────────
router.post('/api/calls/start', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const convId = parseInt((req.body || {}).conv_id);
  const kind = (req.body || {}).kind === 'video' ? 'video' : 'audio';
  const offer = (req.body || {}).offer;
  if (!convId || !offer || !offer.type || !offer.sdp) return res.status(400).json({ ok: false, error: 'invalid' });
  if (typeof offer.sdp !== 'string' || offer.sdp.length > 32000) return res.status(400).json({ ok: false, error: 'invalid' });

  const conv = await convAccess(convId, me);
  if (!conv) return res.status(403).json({ ok: false, error: 'forbidden' });
  if (conv.is_group) return res.status(400).json({ ok: false, error: 'group_call_unsupported' });

  const busy = await activeCallOf(me);
  if (busy) return res.status(409).json({ ok: false, error: 'busy', call_id: busy.id });

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
  if (!call || call.callee_id !== me) return res.status(403).json({ ok: false, error: 'forbidden' });
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
  res.json({ ok: true });
});

// ── কল শেষ (যে-কেউ পক্ষ) ──────────────────────────────────────────────────
router.post('/api/calls/:id/end', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const callId = parseInt(req.params.id);
  const reason = String(((req.body || {}).reason || 'hangup')).slice(0, 24);
  const call = await db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(callId);
  if (!call || (call.caller_id !== me && call.callee_id !== me)) return res.status(403).json({ ok: false, error: 'forbidden' });
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
  if (!call || (call.caller_id !== me && call.callee_id !== me)) return res.status(403).json({ ok: false, error: 'forbidden' });

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

// ── পোল: incoming + outgoing + active + ended + নতুন signals (এক-কল-সব) ──
router.get('/api/calls/poll', ensureAuth, async (req, res) => {
  const me = req.session.user.id;
  const after = parseInt(req.query.after) || 0;

  // (০) আমার আউটগোয়িং রিং-টাইমআউট হলে missed-মার্ক + নোটিফিকেশন (একবারই,
  //     status='ringing' গার্ডে রেস-নিরাপদ)
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

  // (১) আমার জন্য আসন্ন কল (callee, ringing, সদ্য)
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
      age_s: Math.round((Date.now() - new Date(inc.created_at.replace(' ', 'T') + 'Z').getTime()) / 1000)
    };
  }

  // (২) আমার চলমান কল (caller হিসেবে ringing — callee হিসেবে/উভয় হিসেবে accepted)
  let outgoing = null, active = null;
  const mine = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE status IN ('ringing','accepted') AND (caller_id = ? OR callee_id = ?)
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

  // (৩) সদ্য-শেষ হওয়া কল (২০-সেকেন্ড-উইন্ডো) — ক্লায়েন্ট UI-কে জানাতে
  const recentEnded = await db.prepare(
    `SELECT * FROM call_sessions
      WHERE (caller_id = ? OR callee_id = ?)
        AND status IN ('ended','declined','cancelled','missed')
        AND ended_at >= datetime('now', '-20 seconds')
      ORDER BY id DESC LIMIT 3`
  ).all(me, me);
  const ended = [];
  for (const c of recentEnded) {
    ended.push({
      id: c.id,
      status: c.status,
      role: c.caller_id === me ? 'caller' : 'callee',
      reason: c.ended_reason || '',
      by_me: c.ended_by === me,
      kind: c.kind === 'video' ? 'video' : 'audio'
    });
  }

  // (৪) নতুন signals — আমার সাম্প্রতিক কলগুলোর (চলমান + সদ্য-শেষ) ভেতর থেকে
  const myRecent = await db.prepare(
    `SELECT id FROM call_sessions
      WHERE (caller_id = ? OR callee_id = ?)
        AND (status IN ('ringing','accepted') OR (ended_at IS NOT NULL AND ended_at >= datetime('now', ?)))
      ORDER BY id DESC LIMIT 5`
  ).all(me, me, '-' + Math.min(ACTIVE_WINDOW_S, 600) + ' seconds');
  let signals = [];
  let maxId = after;
  if (myRecent.length) {
    const ids = myRecent.map(r => r.id);
    const ph = ids.map(() => '?').join(',');
    const rows = await db.prepare(
      `SELECT id, call_id, payload FROM call_signals
        WHERE call_id IN (${ph}) AND sender_id != ? AND id > ? ORDER BY id ASC LIMIT 120`
    ).all(...ids, me, after);
    signals = rows.map(r => {
      let p = null;
      try { p = JSON.parse(r.payload); } catch (_) {}
      maxId = Math.max(maxId, r.id);
      return { call_id: r.call_id, signal: p };
    }).filter(x => x.signal);
  }

  res.json({ ok: true, after: maxId, incoming, outgoing, active, ended, signals, me: { id: me } });
});

module.exports = router;
