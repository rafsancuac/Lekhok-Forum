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

async function boot() {
  if (app) return app;
  // Initialise the DB first (Turso schema migrations, etc.) so any
  // synchronous access during the first request doesn't crash.
  const db = require('../db');
  await db.initDb();
  app = require('../server');
  return app;
}

// Vercel invokes this default export with (req, res)
module.exports = async (req, res) => {
  const a = await boot();
  return a(req, res);
};
