const db = require('../db');

// ── Broadcast a notification to every active user ───────────────────────────
// Used when a moderator/admin publishes daily content, notices, events.
async function broadcastToAll(type, title, body, link, excludeUserId) {
  const users = await db.prepare("SELECT id FROM users WHERE status = 'active' AND id != ?").all(excludeUserId || 0);
  const stmt = db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)');
  for (const u of users) await stmt.run(u.id, type, title, body, link);
  return users.length;
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
      `শুভ জন্মদিন, ${b.full_name}! বাংলাদেশ তরুণ কলাম লেখক ফোরাম পরিবারের পক্ষ থেকে শুভকামনা।`,
      '/profile/' + b.username
    );
  }
}

module.exports = { broadcastToAll, runBirthdayCheck };
