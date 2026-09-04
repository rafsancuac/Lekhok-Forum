#!/usr/bin/env node
/**
 * db/filter-users.js — Remove all users except admin, moderators,
 * and the user-created "মোঃ রাফছান" account.
 *
 * Batched cascade deletes to avoid single large IN() clauses.
 *
 * Usage: node db/filter-users.js
 */

const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  if (!fs.existsSync(dbPath)) {
    console.error('Database not found:', dbPath);
    process.exit(1);
  }
  const db = new SQL.Database(fs.readFileSync(dbPath));

  function allRows(sql, params = []) {
    const out = [];
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    while (stmt.step()) out.push(stmt.getAsObject());
    stmt.free();
    return out;
  }

  function runSql(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      if (params.length) stmt.bind(params);
      stmt.step();
      stmt.free();
      return true;
    } catch (e) {
      return false;
    }
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  const before = allRows('SELECT id, username, full_name, role FROM users');
  console.log(`[before] Total users: ${before.length}`);

  // ── Identify keep vs remove ────────────────────────────────────────────────
  const keep = allRows(
    "SELECT id FROM users WHERE role IN ('admin','moderator') " +
    "OR LOWER(full_name) LIKE '%রাফ%ছ%ন%' OR username = 'rafshan'"
  );
  const keepIds = new Set(keep.map(u => u.id));
  const remove  = before.filter(u => !keepIds.has(u.id));
  const removeIds = remove.map(u => u.id);

  if (removeIds.length === 0) {
    console.log('\n✅ No users to remove. Nothing to do.');
    return;
  }

  console.log(`Keeping IDs: ${[...keepIds].join(', ')}`);
  console.log(`Removing: ${removeIds.length} users...`);

  // ── Batch delete helper ─────────────────────────────────────────────────────
  // Delete from table where user_id IN (removeIds) — processes in batches of 100
  function batchDelete(table, column, ids) {
    const batchSize = 100;
    let total = 0;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const ph = batch.map(() => '?').join(',');
      try {
        const stmt = db.prepare(`DELETE FROM ${table} WHERE ${column} IN (${ph})`);
        stmt.bind(batch);
        stmt.step();
        stmt.free();
        total += batch.length;
      } catch (e) {
        // Table may not have this column — skip
      }
    }
    return total;
  }

  // ── Cascade deletes ────────────────────────────────────────────────────────
  console.log('\nCascade deleting...');

  // 1. Remove likes made by these users
  const d1 = batchDelete('likes', 'user_id', removeIds);
  console.log(`  ✅ likes (user_id): ${d1}`);

  // 2. Remove comments made by these users
  const d2 = batchDelete('comments', 'author_id', removeIds);
  console.log(`  ✅ comments (author_id): ${d2}`);

  // 3. Get post IDs by removed authors
  const postIds = [];
  const batchSize = 100;
  for (let i = 0; i < removeIds.length; i += batchSize) {
    const batch = removeIds.slice(i, i + batchSize);
    const ph = batch.map(() => '?').join(',');
    try {
      const stmt = db.prepare(`SELECT id FROM posts WHERE author_id IN (${ph})`);
      stmt.bind(batch);
      while (stmt.step()) postIds.push(stmt.getAsObject().id);
      stmt.free();
    } catch (e) {}
  }
  console.log(`  Found ${postIds.length} posts by removed users`);

  // 4. Delete post-linked data and posts themselves
  if (postIds.length > 0) {
    batchDelete('bookmarks', 'post_id', postIds);
    batchDelete('likes', 'post_id', postIds);
    batchDelete('comments', 'post_id', postIds);
    batchDelete('posts', 'id', postIds);
    console.log(`  ✅ Deleted ${postIds.length} posts and related data`);
  }

  // 5. Remove messages sent by these users
  const d5 = batchDelete('messages', 'sender_id', removeIds);
  console.log(`  ✅ messages (sender_id): ${d5}`);

  // 6. Remove conversations where these users are participants
  //    (find conv IDs first, then delete messages in those convs, then convs)
  const convIds = [];
  for (let i = 0; i < removeIds.length; i += batchSize) {
    const batch = removeIds.slice(i, i + batchSize);
    const ph = batch.map(() => '?').join(',');
    try {
      const stmt = db.prepare(`SELECT id FROM conversations WHERE user_a IN (${ph}) OR user_b IN (${ph})`);
      stmt.bind([...batch, ...batch]);
      while (stmt.step()) convIds.push(stmt.getAsObject().id);
      stmt.free();
    } catch (e) {}
  }
  if (convIds.length > 0) {
    const uniqConv = [...new Set(convIds)];
    batchDelete('messages', 'conversation_id', uniqConv);
    batchDelete('conversations', 'id', uniqConv);
    console.log(`  ✅ Deleted ${uniqConv.length} conversations`);
  }

  // 7. Remove notifications for these users
  const d7 = batchDelete('notifications', 'user_id', removeIds);
  console.log(`  ✅ notifications (user_id): ${d7}`);

  // 8. Finally delete the user rows
  const d8 = batchDelete('users', 'id', removeIds);
  console.log(`  ✅ users: ${d8}`);

  // ── Save ──────────────────────────────────────────────────────────────────
  fs.writeFileSync(dbPath, db.export());
  console.log('\n[after]');
  const after = allRows('SELECT id, username, full_name, role FROM users');
  console.log(`Total users: ${after.length}`);
  after.forEach(u => console.log(`  id=${u.id} | ${u.role.padEnd(12)} | @${u.username.padEnd(30)} | ${u.full_name}`));
  console.log('\n✅ Filter complete.');
})().catch(err => { console.error(err); process.exit(1); });
