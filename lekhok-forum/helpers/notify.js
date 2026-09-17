const db = require('../db');
const sseHub = require('./sse'); // সেশন ৯৯: নোটিফিকেশন-তৈরি → SSE পুশ (রোডম্যাপ-০১)

// ── Broadcast a notification to every active user ───────────────────────────
// Used when a moderator/admin publishes daily content, notices, events.
async function broadcastToAll(type, title, body, link, excludeUserId) {
  const users = await db.prepare("SELECT id FROM users WHERE status = 'active' AND id != ?").all(excludeUserId || 0);
  const stmt = db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)');
  for (const u of users) await stmt.run(u.id, type, title, body, link);
  // সেশন ৯৯: সংযুক্ত-ক্লায়েন্টদের তাৎক্ষণিক পুশ (ব্যাজ+টোস্ট+ড্রপডাউন-রিফ্রেশ)
  try { sseHub.publishToAll('notification', { type, title, body, link }, excludeUserId || 0); } catch (_) {}
  return users.length;
}

// ── Targeted notification (session 90) ───────────────────────────────────────
// One user, one row. Used by moderator-oversight (ban/restore with reason),
// and any future per-user system event. Never throws to the caller's flow —
// a failed notification must not break the primary action.
async function notifyUser(userId, type, title, body, link, actorId) {
  try {
    if (!userId) return false;
    // সেশন ১০২: actorId (ঐচ্ছিক, ৬ষ্ঠ প্যারাম) — ড্রপডাউনে actor-avatar দেখাতে;
    // পুরনো কল-সাইট (actor ছাড়া) অক্ষত — actor_id NULL থাকলে আইকন-ফলব্যাক।
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link, actor_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, type || 'system', title || '', body || '', link || '/notifications', actorId || null);
    // সেশন ৯৯: তাৎক্ষণিক পুশ — ব্যাজ + বডি-টোস্ট (প্রেফ-চেক notifyIfAllowed-এ আগেই হয়)
    try { sseHub.publishToUser(userId, 'notification', { type: type || 'system', title: title || '', body: body || '', link: link || '/notifications', actor_id: actorId || null }); } catch (_) {}
    return true;
  } catch (e) { console.error('[notify] notifyUser:', e.message); return false; }
}

// ── B4 (সেশন ৯১): নোটিফিকেশন-প্রেফ এনফোর্সমেন্ট ────────────────────────────────
// সেটিংস-ম্যাট্রিক্সের ৫টি in-app কী (notify_reactions / notify_comments /
// notify_follows / notify_messages / weekly_digest) আগে শুধু সেভ হতো —
// নোটিফিকেশন-তৈরির পাথ চেক করত না। prefAllows() = কেন্দ্রীয় চেক:
//   • প্রেফ আনসেট/পার্স-ফেইল → true (ব্যাক-কম্প্যাট: পুরনো ইউজার সব পান)
//   • prefs[key] === false → false (ইউজার বন্ধ করেছে)
// সিস্টেম/মডারেশন-নোটিফিকেশন (ব্যান/রিস্টোর ইত্যাদি) সবসময় যাবে — এসব
// অ্যাকাউন্ট-স্টেটের গুরুত্বপূর্ণ নোটিশ, প্রেফের অধীন নয়।
async function getNotifyPrefs(userId) {
  try {
    const row = await db.prepare('SELECT notify_prefs FROM users WHERE id = ?').get(userId);
    if (!row) return {};
    const p = JSON.parse(row.notify_prefs || '{}');
    return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
  } catch (_) { return {}; }
}

async function prefAllows(userId, key) {
  try {
    const prefs = await getNotifyPrefs(userId);
    return prefs[key] !== false;
  } catch (_) { return true; }
}

// এক ধাপে: প্রেফ-চেক পাস করলেই নোটিফিকেশন লিখে দেয় (never-throws)।
// kind = notify_prefs-কী (যেমন 'notify_reactions'); system-নোটিশে ব্যবহার করবেন না।
async function notifyIfAllowed(userId, kind, type, title, body, link, actorId) {
  try {
    if (!userId) return false;
    if (!(await prefAllows(userId, kind))) return false;
    return await notifyUser(userId, type, title, body, link, actorId);
  } catch (_) { return false; }
}

// ── Birthday auto-greeting ───────────────────────────────────────────────────
// Once per day: create a 'birthday' notification for every user whose
// birthday is today (and show_birth=1), so followers + the user get greeted.
// Idempotent — a marker row prevents duplicates on the same day.
let lastCheckDate = null;

async function runBirthdayCheck() {
  const today = new Date().toISOString().split('T')[0];
  if (lastCheckDate === today) return;      // already checked today
  lastCheckDate = today;

  const mmdd = today.substring(5);           // MM-DD
  const birthdays = await db.prepare(
    "SELECT id, full_name, username FROM users WHERE status = 'active' AND show_birth = 1 AND substr(birth_date, 6, 5) = ?"
  ).all(mmdd);

  for (const b of birthdays) {
    // dedupe: skip if a birthday notification for this user already exists today
    const dup = await db.prepare(
      "SELECT id FROM notifications WHERE user_id = ? AND type = 'birthday' AND date(created_at) = date('now')"
    ).get(b.id);
    if (dup) continue;
    await db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      b.id, 'birthday', 'জন্মদিনের শুভেচ্ছা 🎉',
      `শুভ জন্মদিন, ${b.full_name}! লেখক ফোরাম পরিবারের পক্ষ থেকে শুভকামনা।`,
      '/profile/' + b.username
    );
  }
}

module.exports = { broadcastToAll, notifyUser, runBirthdayCheck, getNotifyPrefs, prefAllows, notifyIfAllowed };
