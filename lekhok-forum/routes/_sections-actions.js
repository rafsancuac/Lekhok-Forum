// সেশন ৪২: সেকশন-আইটেম অ্যাকশন (মডারেটর রুট থেকে রি-ইউজ)
module.exports = async function (db, TA42, SECTIONS, req, res, act, id) {
  const base = '/moderator/sections';
  if (act === 'add') {
    const sec = SECTIONS[req.body.section] ? req.body.section : 'home_faq';
    const mx = await db.prepare('SELECT MAX(sort_order) AS m FROM site_items WHERE section = ?').get(sec);
    await db.prepare(`INSERT INTO site_items (section, sort_order, title, subtitle, body, icon, extra, image, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?, datetime('now','localtime'))`)
      .run(sec, (mx && mx.m || 0) + 1, req.body.title || '', req.body.subtitle || '', req.body.body || '', req.body.icon || '', req.body.extra || '', req.body.image || '', 1);
    await TA42.audit(db, req, 'add', 'site_items:' + sec, null, req.body.title || '');
    return res.redirect(base + '?section=' + sec + '&saved=1');
  }
  if (act === ':id/save') {
    const row = await db.prepare('SELECT section FROM site_items WHERE id = ?').get(id);
    if (!row) return res.redirect(base);
    const prev43 = await db.prepare('SELECT * FROM site_items WHERE id = ?').get(id);
    await db.prepare('UPDATE site_items SET title = ?, subtitle = ?, body = ?, icon = ?, extra = ?, image = ? WHERE id = ?')
      .run(req.body.title || '', req.body.subtitle || '', req.body.body || '', req.body.icon || '', req.body.extra || '', req.body.image || '', id);
    await TA42.audit(db, req, 'edit', 'site_items:' + row.section, id, req.body.title || '');
    req.session.undoSec43 = { id: Number(id), prev: prev43 };
    return res.redirect(base + '?section=' + row.section + '&saved=1&undo_sec=' + id);
  }
  if (act === ':id/toggle') {
    const row = await db.prepare('SELECT section, is_active FROM site_items WHERE id = ?').get(id);
    if (row) {
      await db.prepare('UPDATE site_items SET is_active = ? WHERE id = ?').run(row.is_active ? 0 : 1, id);
      await TA42.audit(db, req, row.is_active ? 'hide' : 'publish', 'site_items:' + row.section, id, '');
    }
    return res.redirect(base + '?section=' + (row ? row.section : '') + '&saved=1');
  }
  if (act === ':id/move') {
    const row = await db.prepare('SELECT * FROM site_items WHERE id = ?').get(id);
    if (row) {
      const dir = req.body.dir === 'up' ? -1 : 1;
      const sib = await db.prepare('SELECT * FROM site_items WHERE section = ? AND sort_order ' + (dir === -1 ? '<' : '>') + ' ? ORDER BY sort_order ' + (dir === -1 ? 'DESC' : 'ASC') + ' LIMIT 1').get(row.section, row.sort_order);
      if (sib) {
        await db.prepare('UPDATE site_items SET sort_order = ? WHERE id = ?').run(sib.sort_order, row.id);
        await db.prepare('UPDATE site_items SET sort_order = ? WHERE id = ?').run(row.sort_order, sib.id);
      }
    }
    return res.redirect(base + '?section=' + (row ? row.section : '') + '&saved=1');
  }
  if (act === ':id/undo') {
    const u = req.session.undoSec43;
    if (!u || String(u.id) !== String(id)) return res.redirect(base);
    await db.prepare('UPDATE site_items SET title = ?, subtitle = ?, body = ?, icon = ?, extra = ?, image = ? WHERE id = ?')
      .run(u.prev.title || '', u.prev.subtitle || '', u.prev.body || '', u.prev.icon || '', u.prev.extra || '', u.prev.image || '', u.id);
    req.session.undoSec43 = null;
    await TA42.audit(db, req, 'undo', 'site_items:' + (u.prev.section || ''), u.id, 'আগের সংস্করণে ফেরত');
    return res.redirect(base + '?section=' + (u.prev.section || '') + '&saved=1');
  }
  if (act === 'reorder') {
    const sec = SECTIONS[req.body.section] ? req.body.section : 'home_faq';
    const ids = [].concat(req.body.ids || []).map(Number).filter(n => n > 0);
    let i = 1;
    for (const id2 of ids) { try { await db.prepare('UPDATE site_items SET sort_order = ? WHERE id = ? AND section = ?').run(i++, id2, sec); } catch (e) {} }
    await TA42.audit(db, req, 'reorder', 'site_items:' + sec, null, ids.length + 'টি আইটেম');
    return res.redirect(base + '?section=' + sec + '&saved=1');
  }
  if (act === ':id/delete') {
    const row = await db.prepare('SELECT section FROM site_items WHERE id = ?').get(id);
    let tid = '';
    if (row) {
      tid = await TA42.trashDelete(db, 'site_items', id, req);
      await TA42.audit(db, req, 'delete', 'site_items:' + row.section, id, '');
    }
    return res.redirect(base + '?section=' + (row ? row.section : '') + '&saved=1' + (tid ? '&trashed=' + tid : ''));
  }
  res.redirect(base);
};
