/**
 * db/migrate-add-user-id-to-members.js
 *
 * Adds a user_id column to the members table so committee entries can be
 * linked to user accounts. Linked members will show their user avatar and
 * be clickable to their profile page on the committee page.
 *
 * Run: node db/migrate-add-user-id-to-members.js
 */

const path = require('path');
const fs   = require('fs');
const initSqlJs = require(path.join(__dirname, '..', 'node_modules', 'sql.js'));

const DB_PATH = path.join(__dirname, '..', 'lekhok.db');

(async () => {
  const SQL = await initSqlJs();
  const buf = fs.readFileSync(DB_PATH);
  const db  = new SQL.Database(buf);

  // 1. Add user_id column if missing
  const cols = db.exec("PRAGMA table_info(members)").flat();
  const colNames = cols.map(c => c[1]);
  if (!colNames.includes('user_id')) {
    db.run("ALTER TABLE members ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
    console.log('✅ Added user_id column to members table');
  } else {
    console.log('ℹ️  user_id column already exists in members table');
  }

  // 2. Link ইসমাইল হোসেন to his user account
  //    - members: name = 'ইসমাইল হোসেন', role = 'সভাপতি'
  //    - users:   username = 'smal_hosen', id = 790
  const linkResult = db.run(
    "UPDATE members SET user_id = 790 WHERE name = 'ইসমাইল হোসেন' AND role = 'সভাপতি'"
  );
  const changes = db.getRowsModified();
  if (changes > 0) {
    console.log(`✅ Linked ইসমাইল হোসেন (সভাপতি) → user_id 790 (smal_hosen)`);
  } else {
    // Try softer match
    const existing = db.exec("SELECT id, name, role, user_id FROM members WHERE name LIKE '%ইসমাইল%'");
    if (existing.length && existing[0].values.length) {
      const [id, name, role, uid] = existing[0].values[0];
      console.log(`ℹ️  Found member: id=${id}, name="${name}", role="${role}", user_id=${uid}`);
      if (!uid) {
        db.run("UPDATE members SET user_id = 790 WHERE id = ?", [id]);
        console.log(`✅ Linked member id ${id} → user_id 790`);
      }
    } else {
      console.log('⚠️  Could not find ইসমাইল হোসেন member entry to link');
    }
  }

  // 3. Show current state
  const members = db.exec("SELECT id, name, role, user_id FROM members WHERE member_type = 'central' ORDER BY sort_order");
  if (members.length) {
    console.log('\n📋 Current central members:');
    members[0].values.forEach(row => {
      console.log(`  id=${row[0]} | ${row[1]} | ${row[2]} | user_id=${row[3] || 'null'}`);
    });
  }

  fs.writeFileSync(DB_PATH, db.export());
  console.log('\n✅ Database saved.');
  db.close();
})().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
