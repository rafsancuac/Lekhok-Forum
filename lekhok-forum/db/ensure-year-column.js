#!/usr/bin/env node
/**
 * db/ensure-year-column.js — Add 'term_year' column to members table
 * if it doesn't exist. This allows filtering committees by year.
 *
 * Usage: node db/ensure-year-column.js
 */
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

  // Check existing columns
  const cols = allRows('PRAGMA table_info(members)').map(c => c.name);
  if (!cols.includes('term_year')) {
    db.run("ALTER TABLE members ADD COLUMN term_year TEXT DEFAULT '২০২৫-২০২৬'");
    console.log("✅ Added term_year column to members table");
  } else {
    console.log("✅ term_year column already exists");
  }

  fs.writeFileSync(dbPath, db.export());
  console.log("Done.");
})().catch(err => { console.error(err); process.exit(1); });
