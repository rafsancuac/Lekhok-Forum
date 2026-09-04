#!/usr/bin/env node
const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const db = new SQL.Database(fs.readFileSync(dbPath));

  function allRows(sql, params = []) {
    const out = [];
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    while (stmt.step()) out.push(stmt.getAsObject());
    stmt.free();
    return out;
  }

  const users = allRows('SELECT id, username, full_name, role FROM users ORDER BY id');
  console.log(`Total users: ${users.length}`);
  users.forEach(u => console.log(`  id=${u.id} | ${u.role.padEnd(12)} | @${u.username.padEnd(30)} | ${u.full_name}`));

  const posts = allRows('SELECT COUNT(*) as cnt FROM posts');
  const comments = allRows('SELECT COUNT(*) as cnt FROM comments');
  const likes = allRows('SELECT COUNT(*) as cnt FROM likes');
  const messages = allRows('SELECT COUNT(*) as cnt FROM messages');
  console.log(`\nPosts: ${posts[0].cnt}, Comments: ${comments[0].cnt}, Likes: ${likes[0].cnt}, Messages: ${messages[0].cnt}`);
})();
