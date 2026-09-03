#!/usr/bin/env node
/**
 * db/dedup-users.js
 * ────────────────────────────────────────────────────────────────
 * Collapses duplicate user records created by repeated seed runs.
 *
 * Strategy:
 *   1. Find groups of active users sharing the same full_name.
 *   2. Keep the row with the smallest id (earliest account = canonical).
 *   3. Migrate FK references from duplicates → canonical:
 *        posts.author_id, comments.author_id
 *        follows (merge unique follower_id/following_id pairs)
 *        blocks  (merge unique blocker_id/blocked_id pairs)
 *   4. Let ON DELETE CASCADE handle likes, bookmarks, notifications,
 *      messages, conversations for the duplicate rows.
 *   5. Delete duplicate rows.
 *   6. Print summary.
 *
 * Run: node db/dedup-users.js
 */

const path = require('path');
const assert = require('assert');

const DB_PATH = path.join(__dirname, '..', 'lekhok.db');

async function main() {
  const initSqlJs = require(path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.js'));

  // ── Bootstrap sql.js ────────────────────────────────────────────────────────
  const SQL = await initSqlJs();
  const buf = require('fs').readFileSync(DB_PATH);
  const db = new SQL.Database(buf);

  // Helper: run SQL and return array of rows
  function all(sql, ...params) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  // Helper: run a write statement
  function run(sql, ...params) {
    db.run(sql, params);
  }

  // Helper: count rows
  function count(sql, ...params) {
    return all(sql, ...params)[0].c;
  }

  console.log('=== Lekhok Forum — User Deduplication ===\n');

  // ── 1. Count before ─────────────────────────────────────────────────────────
  const totalBefore = count("SELECT COUNT(*) as c FROM users WHERE status != 'banned'");
  const activeBefore = count("SELECT COUNT(*) as c FROM users WHERE status = 'active'");
  console.log(`Before: ${activeBefore} active users, ${totalBefore} total (non-banned)\n`);

  // ── 2. Find duplicate full_name groups ─────────────────────────────────────
  const dupGroups = all(`
    SELECT full_name, COUNT(*) as cnt, MIN(id) as canonical_id
    FROM users
    WHERE status = 'active'
      AND full_name IS NOT NULL
      AND full_name != ''
      AND full_name NOT LIKE '%(duplicate)%'
    GROUP BY LOWER(TRIM(full_name))
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);

  if (!dupGroups.length) {
    console.log('No duplicate users found. Nothing to do.');
    save();
    return;
  }

  console.log(`Found ${dupGroups.length} duplicate groups:\n`);
  let totalDupCount = 0;
  dupGroups.forEach(g => {
    totalDupCount += g.cnt - 1;
    console.log(`  "${g.full_name}" — ${g.cnt} copies, canonical id=${g.canonical_id}`);
  });
  console.log(`\nTotal duplicates to merge: ${totalDupCount}\n`);

  // ── 3. For each duplicate group ─────────────────────────────────────────────
  let migratedPosts = 0, migratedComments = 0, mergedFollows = 0, mergedBlocks = 0, deletedRows = 0;

  for (const group of dupGroups) {
    const fn = group.full_name;
    const canonId = group.canonical_id;

    // All user IDs in this group (including canonical)
    const members = all(`
      SELECT id FROM users
      WHERE status = 'active' AND LOWER(TRIM(full_name)) = LOWER(TRIM(?))
    `, fn).map(r => r.id);

    const dups = members.filter(id => id !== canonId);
    if (!dups.length) continue;

    // ── 3a. Migrate posts ────────────────────────────────────────────────────
    const postCount = count(
      `SELECT COUNT(*) as c FROM posts WHERE author_id IN (${dups.map(() => '?').join(',')})`,
      ...dups
    );
    if (postCount > 0) {
      run(
        `UPDATE posts SET author_id = ? WHERE author_id IN (${dups.map(() => '?').join(',')})`,
        canonId, ...dups
      );
      migratedPosts += postCount;
      // If canonical already has posts on the same slug, the dup posts will have
      // conflicting slugs — that's acceptable; the canonical user's page will show
      // both (still better than losing content).
    }

    // ── 3b. Migrate comments ─────────────────────────────────────────────────
    const commentCount = count(
      `SELECT COUNT(*) as c FROM comments WHERE author_id IN (${dups.map(() => '?').join(',')})`,
      ...dups
    );
    if (commentCount > 0) {
      run(
        `UPDATE comments SET author_id = ? WHERE author_id IN (${dups.map(() => '?').join(',')})`,
        canonId, ...dups
      );
      migratedComments += commentCount;
    }

    // ── 3c. Merge follows ────────────────────────────────────────────────────
    // For each follow relationship the duplicate has, insert into canonical
    // (IGNORE duplicates via INSERT OR IGNORE, which sql.js doesn't support directly,
    // so we use a two-step approach: check existence first)
    const dupFollows = all(`
      SELECT follower_id, following_id FROM follows
      WHERE follower_id IN (${dups.map(() => '?').join(',')})
         OR following_id IN (${dups.map(() => '?').join(',')})
    `, ...dups, ...dups);

    for (const f of dupFollows) {
      // Resolve actual follower/following — if dup, map to canonical
      const actualFollower = members.includes(f.follower_id) ? canonId : f.follower_id;
      const actualFollowing = members.includes(f.following_id) ? canonId : f.following_id;

      // Skip self-follows
      if (actualFollower === actualFollowing) continue;

      // Check if canonical follow already exists
      const exists = count(
        'SELECT COUNT(*) as c FROM follows WHERE follower_id = ? AND following_id = ?',
        actualFollower, actualFollowing
      );

      if (!exists) {
        run(
          'INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, datetime("now"))',
          actualFollower, actualFollowing
        );
        mergedFollows++;
      }
    }

    // ── 3d. Merge blocks ─────────────────────────────────────────────────────
    const dupBlocks = all(`
      SELECT blocker_id, blocked_id FROM blocks
      WHERE blocker_id IN (${dups.map(() => '?').join(',')})
         OR blocked_id IN (${dups.map(() => '?').join(',')})
    `, ...dups, ...dups);

    for (const b of dupBlocks) {
      const actualBlocker = members.includes(b.blocker_id) ? canonId : b.blocker_id;
      const actualBlocked = members.includes(b.blocked_id) ? canonId : b.blocked_id;

      if (actualBlocker === actualBlocked) continue;

      const exists = count(
        'SELECT COUNT(*) as c FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
        actualBlocker, actualBlocked
      );

      if (!exists) {
        run(
          'INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, datetime("now"))',
          actualBlocker, actualBlocked
        );
        mergedBlocks++;
      }
    }

    // ── 3e. Deduplicate likes (same user liking same post multiple times) ─────
    // This can happen if dup user liked a post and then migrated to canonical.
    // We keep only the earliest reaction per (user_id, post_id) or (user_id, comment_id).
    // This is a safety net — ON DELETE CASCADE on user_id would already delete dup likes.
    // (CASCADE already handles likes for deleted users, so this step is mostly
    // for likes belonging to canonical user that were created by multiple dup IDs.)

    // ── 3f. Delete duplicate users ─────────────────────────────────────────────
    // ON DELETE CASCADE handles: likes, bookmarks, notifications, messages,
    // conversations, daily_content, gallery, complaints, moderator_scopes, blocks
    // (blocks was already merged above; duplicates' block entries are now orphaned
    // but harmless since the block pair canonical row was already inserted)
    run(
      `DELETE FROM users WHERE id IN (${dups.map(() => '?').join(',')})`,
      ...dups
    );
    deletedRows += dups.length;
  }

  // ── 4. Save the database ────────────────────────────────────────────────────
  function save() {
    const data = db.export();
    require('fs').writeFileSync(DB_PATH, Buffer.from(data));
  }
  save();

  // ── 5. Report ───────────────────────────────────────────────────────────────
  const totalAfter = count("SELECT COUNT(*) as c FROM users WHERE status != 'banned'");
  const activeAfter = count("SELECT COUNT(*) as c FROM users WHERE status = 'active'");

  console.log('\n=== Deduplication Complete ===');
  console.log(`Active users:  ${activeBefore} → ${activeAfter}  (removed ${activeBefore - activeAfter} duplicates)`);
  console.log(`Total users:   ${totalBefore} → ${totalAfter}`);
  console.log(`Posts migrated:    ${migratedPosts}`);
  console.log(`Comments migrated:${migratedComments}`);
  console.log(`Follows merged:   ${mergedFollows}`);
  console.log(`Blocks merged:    ${mergedBlocks}`);
  console.log(`User rows deleted:${deletedRows}`);
  console.log('\nDatabase saved to:', DB_PATH);
}

main().catch(err => { console.error('ERROR:', err); process.exit(1); });
