// সেশন ৪২: সফট-ডিলিট (ট্র্যাশ) + অডিট লগ হেল্পার
// ডিলিটের আগে সারির পূর্ণ স্ন্যাপশট trash টেবিলে → ৩০ দিন রিস্টোরযোগ্য।
'use strict';

function nowStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function actorOf(req) {
  const u = (req && (req.session || {}).user) || (req && (req.session || {}).adminUser) || null;
  return { id: u ? u.id : null, name: u ? (u.full_name || u.username) : 'সিস্টেম' };
}

// একটা সারি ডিলিটের আগে স্ন্যাপশট নিয়ে trash-এ রাখি
async function snapshot(db, table, id, req) {
  try {
    const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!row) return null;
    const a = actorOf(req);
    const r = await db.prepare(`INSERT INTO trash (table_name, item_id, payload, deleted_by, deleted_by_name, deleted_at) VALUES (?,?,?,?,?,?)`)
      .run(table, id, JSON.stringify(row), a.id, a.name, nowStr());
    return r && r.lastInsertRowid;
  } catch (e) { console.error('[trash] snapshot failed', table, id, e.message); return null; }
}

// স্ন্যাপশট + ডিলিট (সফট-ডিলিট ফ্লো)
async function trashDelete(db, table, id, req) {
  const tid = await snapshot(db, table, id, req);
  await db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return tid;
}

async function trashBulkDelete(db, table, ids, req) {
  const tids = [];
  for (const id of ids) {
    const t = await trashDelete(db, table, id, req);
    if (t) tids.push(t);
  }
  return tids;
}

// ট্র্যাশ থেকে রিস্টোর — আসল id ফাঁকা থাকলে সেটা, নাহলে নতুন id
async function restoreTrash(db, trashId, req) {
  const t = await db.prepare('SELECT * FROM trash WHERE id = ?').get(trashId);
  if (!t) return { ok: false, error: 'ট্র্যাশে আইটেমটি নেই (মেয়াদ শেষ হতে পারে)' };
  let row;
  try { row = JSON.parse(t.payload); } catch (e) { return { ok: false, error: 'স্ন্যাপশট পড়া যায়নি' }; }
  const cols = Object.keys(row);
  const existing = await db.prepare(`SELECT id FROM ${t.table_name} WHERE id = ?`).get(row.id);
  let newId = row.id;
  try {
    if (!existing) {
      await db.prepare(`INSERT INTO ${t.table_name} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map(c => row[c]));
    } else {
      delete row.id;
      const c2 = Object.keys(row);
      const r = await db.prepare(`INSERT INTO ${t.table_name} (${c2.join(',')}) VALUES (${c2.map(() => '?').join(',')})`).run(...c2.map(c => row[c]));
      newId = (r && r.lastInsertRowid) || row.id;
    }
  } catch (e) { return { ok: false, error: 'রিস্টোর ব্যর্থ: ' + e.message }; }
  await db.prepare('DELETE FROM trash WHERE id = ?').run(trashId);
  const a = actorOf(req);
  try {
    await db.prepare(`INSERT INTO audit_log (actor_id, actor_name, action, table_name, item_id, detail, created_at) VALUES (?,?,?,?,?,?,?)`)
      .run(a.id, a.name, 'restore', t.table_name, newId, 'ট্র্যাশ #' + trashId + ' থেকে রিস্টোর', nowStr());
  } catch (e) {}
  return { ok: true, newId };
}

// স্থায়ীভাবে মুছে ফেলা
async function purgeTrash(db, trashId) {
  await db.prepare('DELETE FROM trash WHERE id = ?').run(trashId);
}

// ৩০ দিনের পুরনো ট্র্যাশ অটো-পার্জ
async function purgeExpired(db) {
  try {
    const r = await db.prepare(`DELETE FROM trash WHERE deleted_at < datetime('now', '-30 days', 'localtime')`).run();
    return r && r.changes ? r.changes : 0;
  } catch (e) { return 0; }
}

// অডিট লগ
async function audit(db, req, action, table, itemId, detail) {
  try {
    const a = actorOf(req);
    await db.prepare(`INSERT INTO audit_log (actor_id, actor_name, action, table_name, item_id, detail, created_at) VALUES (?,?,?,?,?,?,?)`)
      .run(a.id, a.name, action, table || '', itemId || null, detail || '', nowStr());
  } catch (e) { /* নন-ফেটাল */ }
}

module.exports = { snapshot, trashDelete, trashBulkDelete, restoreTrash, purgeTrash, purgeExpired, audit, nowStr, actorOf };
