const db = require('../db');

// ── Broadcast a notification to every active user ───────────────────────────
// Used when a moderator/admin publishes daily content, notices, events.
function broadcastToAll(type, title, body, link, excludeUserId) {
  const users = db.prepare("SELECT id FROM users WHERE status = 'active' AND id != ?").all(excludeUserId || 0);
  const stmt = db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)');
  users.forEach(u => stmt.run(u.id, type, title, body, link));
  return users.length;
}

// ── Birthday auto-greeting ───────────────────────────────────────────────────
// Once per day: create a 'birthday' notification for every user whose
// birthday is today (and show_birth=1), so followers + the user get greeted.
// Idempotent — a marker row prevents duplicates on the same day.
let lastCheckDate = null;

function runBirthdayCheck() {
  const today = new Date().toISOString().split('T')[0];
  if (lastCheckDate === today) return;      // already checked today
  lastCheckDate = today;

  const mmdd = today.substring(5);           // MM-DD
  const birthdays = db.prepare(
    "SELECT id, full_name, username FROM users WHERE status = 'active' AND show_birth = 1 AND substr(birth_date, 6, 5) = ?"
  ).all(mmdd);

  birthdays.forEach(b => {
    // dedupe: skip if a birthday notification for this user already exists today
    const dup = db.prepare(
      "SELECT id FROM notifications WHERE user_id = ? AND type = 'birthday' AND date(created_at) = date('now')"
    ).get(b.id);
    if (dup) return;
    db.prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)').run(
      b.id, 'birthday', 'জন্মদিনের শুভেচ্ছা 🎉',
      `শুভ জন্মদিন, ${b.full_name}! লেখক ফোরাম পরিবারের পক্ষ থেকে শুভকামনা।`,
      '/profile/' + b.username
    );
  });
}

module.exports = { broadcastToAll, runBirthdayCheck };
