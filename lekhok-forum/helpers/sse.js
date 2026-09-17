// ── সেশন ৯৯ (রোডম্যাপ-আইটেম ০১): SSE রিয়েল-টাইম হাব ────────────────────────────
// এক-টেন্ডার ইভেন্ট-বাস: সার্ভার → ক্লায়েন্ট পুশ (নোটিফিকেশন + মেসেঞ্জার-মেসেজ)।
// পোলিং (messages/poll + সার্ভার-রেন্ডারড বেল) আগের মতোই ফলব্যাক — এই হাব শুধু
// লেটেন্সি কমায় (২.৫সে-পোল → ইনস্ট্যান্ট পুশ)। যে-কোনো ব্যর্থতায় ক্লায়েন্ট
// EventSource-এর auto-reconnect + আগের পোলিং-ইঞ্জিনই সত্যের-উৎস থাকে।
//
// সংযোগ: GET /api/events (routes/dashboard.js) — ensureAuth-গার্ডেড, express-session
// কুকি EventSource-এ স্বয়ংক্রিয়ভাবে যায়। কম্প্রেশন-বাইপাস: Cache-Control-এ
// no-transform (compression মিডলওয়্যার এটা দেখে স্কিপ করে) + X-Accel-Buffering: no।
'use strict';

const clients = new Map(); // userId → Set<res>
let hbTimer = null;

function addClient(uid, res) {
  if (!clients.has(uid)) clients.set(uid, new Set());
  clients.get(uid).add(res);
}

function removeClient(uid, res) {
  const set = clients.get(uid);
  if (!set) return;
  set.delete(res);
  if (!set.size) clients.delete(uid);
}

function _write(res, chunk) {
  try {
    if (!res.writableEnded) res.write(chunk);
    return true;
  } catch (_) {
    return false;
  }
}

// এক ইউজারের সব-ট্যাব/ডিভাইসে পুশ (multi-tab sync — FB-প্যাটার্ন)
function publishToUser(uid, type, data) {
  const set = clients.get(uid);
  if (!set || !set.size) return 0;
  const payload = 'event: ' + type + '\ndata: ' + JSON.stringify(data || {}) + '\n\n';
  let sent = 0;
  for (const res of set) if (_write(res, payload)) sent++;
  return sent;
}

// একাধিক ইউজার (কথোপকথন-সদস্য ইত্যাদি) — exceptUid = নিজের-ট্যাবে ডাবল-কিক এড়াতে
function publishToUsers(uids, type, data, exceptUid) {
  const uniq = [...new Set(uids)].filter(id => id && id !== exceptUid);
  let sent = 0;
  for (const id of uniq) sent += publishToUser(id, type, data);
  return sent;
}

// সব-সংযুক্ত ক্লায়েন্টে (broadcastToAll-এর সঙ্গী)
function publishToAll(type, data, exceptUid) {
  let sent = 0;
  for (const uid of clients.keys()) {
    if (uid === exceptUid) continue;
    sent += publishToUser(uid, type, data);
  }
  return sent;
}

// ডায়গনস্টিক — /api/health-তে যোগ করা যাবে
function stats() {
  let conns = 0;
  for (const set of clients.values()) conns += set.size;
  return { connections: conns, users: clients.size };
}

// হার্টবিট: প্রতি ২৫সে-এ কমেন্ট-লাইন — প্রক্সি/LB আইডল-টাইমআউট ভেঙে সংযোগ
// বন্ধ না-করে। মৃত-সংযোগ লিখতে-ব্যর্থ হলে সরিয়ে ফেলা হয়। unref: একা এই টাইমার
// প্রসেস জীবিত রাখবে না (serverless-সুরক্ষা)।
if (!hbTimer) {
  hbTimer = setInterval(() => {
    for (const [uid, set] of clients) {
      for (const res of set) {
        if (!_write(res, ': hb\n\n')) removeClient(uid, res);
      }
    }
  }, 25000);
  if (typeof hbTimer.unref === 'function') hbTimer.unref();
}

module.exports = { addClient, removeClient, publishToUser, publishToUsers, publishToAll, stats };
