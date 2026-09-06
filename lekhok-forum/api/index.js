/**
 * api/index.js — Vercel serverless entrypoint.
 *
 * On Vercel: the entire `app` from server.js is exported, and Vercel routes
 * all HTTP traffic through @vercel/node. This file lazily boots the DB
 * (Turso or local) and then hands off to Express.
 *
 * Local dev: `vercel dev` will also load this file, so it acts as the
 * single boot point.
 */

let app;
let bootError = null;
let bootStage = 'not-started';

async function boot() {
  if (app) return app;
  // Initialise the DB first (Turso schema migrations, etc.) so any
  // synchronous access during the first request doesn't crash.
  bootStage = 'require-db';
  const db = require('../db');
  bootStage = 'initDb';
  await db.initDb();
  bootStage = 'require-server';
  app = require('../server');
  bootStage = 'ready';
  return app;
}

// Vercel invokes this default export with (req, res)
module.exports = async (req, res) => {
  try {
    const a = await boot();
    return await a(req, res);
  } catch (e) {
    // TEMPORARY boot diagnostic (session 36 hotfix investigation) — gated by
    // a secret query param so normal traffic never sees internals. Remove
    // once the cold-boot incident is closed.
    if (req.url && req.url.includes('diag_lekhok_36')) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('[lekhok-diag] stage=' + bootStage + ' bootError=' + (bootError && bootError.message)
        + '\nname=' + (e && e.name) + '\nmessage=' + (e && e.message) + '\n\nstack=' + (e && e.stack));
      return;
    }
    throw e;
  }
};
