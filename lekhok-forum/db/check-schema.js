#!/usr/bin/env node
const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  const db = new SQL.Database(fs.readFileSync(dbPath));

  function allRows(sql) {
    const out = [];
    const stmt = db.prepare(sql);
    while (stmt.step()) out.push(stmt.getAsObject());
    stmt.free();
    return out;
  }

  // Get schema for posts, comments, likes
  for (const table of ['posts', 'comments', 'likes', 'users', 'conversations', 'messages', 'notifications']) {
    console.log(`\n=== ${table} ===`);
    const cols = allRows(`PRAGMA table_info(${table})`);
    cols.forEach(c => console.log(`  ${c.name} (${c.type})`));
  }
})();
