/**
 * session-store.js — DB-backed express-session store.
 *
 * WHY: Vercel serverless runs many short-lived lambda instances; the default
 * MemoryStore keeps sessions in one instance's RAM, so a successful login
 * "doesn't stick" — the next request can land on a different instance and
 * the user appears logged out again.
 *
 * This store persists sessions in the shared database (Turso in production,
 * local sql.js in dev, Blob-snapshot mode in between), so auth survives
 * instance changes and cold boots once the DB itself is persistent.
 *
 * Note: db.prepare(...) methods are sync on sql.js and promise-returning on
 * Turso — always `await`ing them is correct in both modes.
 */

const db = require('./db');
const session = require('express-session');

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // matches cookie maxAge in server.js
const SWEEP_PROB = 0.05;                    // ~5% of writes also purge expired rows

function expiryOf(sess) {
  const c = sess && sess.cookie;
  if (c && c.expires) {
    const t = new Date(c.expires).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return Date.now() + DEFAULT_TTL_MS;
}

// express-session expects callback-style store methods; run async work and
// surface errors through the callback instead of unhandled rejections.
function safe(cb, fn) {
  (async () => {
    try {
      const out = await fn();
      if (typeof cb === 'function') cb(null, out);
    } catch (e) {
      console.error('[session-store]', e.message);
      if (typeof cb === 'function') cb(e);
    }
  })();
}

// MUST extend session.Store (an EventEmitter): express-session calls
// store.on('connect'/'disconnect') — a bare duck-typed object throws
// "store.on is not a function".
class DbStore extends session.Store {
  get(sid, cb) {
    return safe(cb, async () => {
      const row = await db.prepare(
        'SELECT data, expires FROM sessions WHERE sid = ?'
      ).get(sid);
      if (!row) return null;
      if (Number(row.expires) < Date.now()) {
        await db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
        return null;
      }
      return JSON.parse(row.data);
    });
  }

  set(sid, sess, cb) {
    return safe(cb, async () => {
      const expires = expiryOf(sess);
      await db.prepare(
        'INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?) ' +
        'ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires = excluded.expires'
      ).run(sid, JSON.stringify(sess), expires);
      if (Math.random() < SWEEP_PROB) {
        await db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
      }
    });
  }

  destroy(sid, cb) {
    return safe(cb, async () => {
      await db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
    });
  }

  touch(sid, sess, cb) {
    return safe(cb, async () => {
      await db.prepare(
        'UPDATE sessions SET expires = ? WHERE sid = ?'
      ).run(expiryOf(sess), sid);
    });
  }
}

module.exports = DbStore;
