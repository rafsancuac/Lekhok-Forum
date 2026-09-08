// ── Nav editor (admin + moderator panel) ────────────────────────────────────
// Builds editable rows for the site menu config; serializes to JSON on submit.
// Server stores it in settings key `nav_json` (helpers/nav.js parses it).
// সেশন ৪৯: + রি-অর্ডার (drag-and-drop + উপরে/নিচে বাটন) + enable/disable toggle।
window.NavEditor = {
  data: [],
  reset: false,
  dragIdx: null,

  init(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = Array.isArray(data) ? JSON.parse(JSON.stringify(data)) : [];
    this.render();
  },

  // এক আইটেমের enable/disable স্টেট (default true)
  enabled(item) { return item.enabled !== false; },

  render() {
    const c = this.container;
    if (!c) return;
    if (!this.data.length) {
      c.innerHTML = '<p style="color:#64748b;padding:12px 4px;">কোনো মেনু আইটেম নেই — নিচের "+ মেনু আইটেম" বাটনে ক্লিক করুন।</p>';
      return;
    }
    let html = '';
    this.data.forEach((item, i) => {
      const on = this.enabled(item);
      html += '<div class="nv-item" data-i="' + i + '" draggable="true"'
        + ' style="border:1.5px solid ' + (on ? '#e2e8f0' : '#cbd5e1') + ';border-radius:12px;padding:14px;margin-bottom:12px;background:' + (on ? '#f8fafc' : '#f1f5f9') + ';opacity:' + (on ? '1' : '0.62') + ';">'
        // ── টুলবার: ড্র্যাগ হ্যান্ডেল + enable/disable + up/down + delete ──
        + '<div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">'
        + '<span class="nv-drag" data-i="' + i + '" title="টেনে সাজান" style="cursor:grab;color:#94a3b8;padding:4px 8px;font-size:14px;user-select:none;">⋮⋮</span>'
        + '<button type="button" class="nv-toggle" data-i="' + i + '" title="' + (on ? 'লুকান' : 'দেখান') + '" style="padding:5px 10px;border:1px solid ' + (on ? '#cbd5e1' : '#fca5a5') + ';background:' + (on ? '#fff' : '#fef2f2') + ';color:' + (on ? '#475569' : '#dc2626') + ';border-radius:8px;cursor:pointer;"><i class="fas ' + (on ? 'fa-eye' : 'fa-eye-slash') + '"></i></button>'
        + '<span style="flex:1;"></span>'
        + '<button type="button" class="nv-up" data-i="' + i + '" title="উপরে" style="padding:5px 10px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:8px;cursor:pointer;' + (i === 0 ? 'visibility:hidden;' : '') + '"><i class="fas fa-arrow-up"></i></button>'
        + '<button type="button" class="nv-down" data-i="' + i + '" title="নিচে" style="padding:5px 10px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:8px;cursor:pointer;' + (i === this.data.length - 1 ? 'visibility:hidden;' : '') + '"><i class="fas fa-arrow-down"></i></button>'
        + '<button type="button" class="nv-del" data-i="' + i + '" title="মেনু আইটেম মুছুন" style="padding:5px 10px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:8px;cursor:pointer;"><i class="fas fa-trash"></i></button>'
        + '</div>'
        // ── এডিট ফিল্ড ──
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
        + '<input class="nv-label" value="' + this.esc(item.label) + '" placeholder="মেনু লেবেল (যেমন: হোম)" style="flex:2 1 150px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">'
        + '<input class="nv-href" value="' + this.esc(item.href) + '" placeholder="লিংক (যেমন: /about)" style="flex:2 1 150px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
        + '<input class="nv-icon" value="' + this.esc(item.icon || '') + '" placeholder="আইকন (fa-home)" style="flex:1 1 110px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
        + '</div>';
      const kids = item.children || [];
      if (kids.length) {
        html += '<div class="nv-kids" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">';
        kids.forEach((ch, j) => {
          const chOn = this.enabled(ch);
          html += '<div class="nv-child" data-j="' + j + '" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;background:#fff;border:1px dashed #cbd5e1;border-radius:10px;padding:8px 10px;opacity:' + (chOn ? '1' : '0.55') + ';">'
            + '<span style="color:#94a3b8;font-size:12px;">↳</span>'
            + '<button type="button" class="nc-toggle" data-i="' + i + '" data-j="' + j + '" title="' + (chOn ? 'লুকান' : 'দেখান') + '" style="padding:4px 8px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:6px;cursor:pointer;font-size:12px;"><i class="fas ' + (chOn ? 'fa-eye' : 'fa-eye-slash') + '"></i></button>'
            + '<input class="nc-label" value="' + this.esc(ch.label) + '" placeholder="সাব-মেনু লেবেল" style="flex:2 1 130px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">'
            + '<input class="nc-href" value="' + this.esc(ch.href) + '" placeholder="লিংক" style="flex:2 1 130px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
            + '<input class="nc-icon" value="' + this.esc(ch.icon || '') + '" placeholder="fa-circle" style="flex:1 1 90px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
            + '<button type="button" class="nc-up" data-i="' + i + '" data-j="' + j + '" title="উপরে" style="padding:4px 8px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:6px;cursor:pointer;' + (j === 0 ? 'visibility:hidden;' : '') + '"><i class="fas fa-arrow-up"></i></button>'
            + '<button type="button" class="nc-down" data-i="' + i + '" data-j="' + j + '" title="নিচে" style="padding:4px 8px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:6px;cursor:pointer;' + (j === kids.length - 1 ? 'visibility:hidden;' : '') + '"><i class="fas fa-arrow-down"></i></button>'
            + '<button type="button" class="nc-del" data-i="' + i + '" data-j="' + j + '" title="সাব-মেনু মুছুন" style="padding:4px 8px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:6px;cursor:pointer;"><i class="fas fa-times"></i></button>'
            + '</div>';
        });
        html += '</div>';
      }
      html += '<button type="button" class="nv-addchild" data-i="' + i + '" style="margin-top:10px;padding:7px 12px;border:1px dashed #94a3b8;background:#fff;color:#475569;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;"><i class="fas fa-plus"></i> সাব-মেনু যোগ করুন</button>'
        + '</div>';
    });
    c.innerHTML = html;
  },

  syncFromDOM() {
    if (!this.container) return;
    const items = this.container.querySelectorAll('.nv-item');
    const next = [];
    items.forEach(el => {
      const idx = parseInt(el.dataset.i, 10);
      const src = this.data[idx] || {};
      const item = {
        label: (el.querySelector('.nv-label') || {}).value || '',
        href: (el.querySelector('.nv-href') || {}).value || '',
        icon: (el.querySelector('.nv-icon') || {}).value || ''
      };
      if (String(item.icon).trim() === '') delete item.icon;
      // সেশন ৪৯: enabled স্টেট সংরক্ষণ
      if (src.enabled === false) item.enabled = false;
      const kids = [];
      el.querySelectorAll('.nv-child').forEach(kel => {
        const j = parseInt(kel.dataset.j, 10);
        const ksrc = (src.children || [])[j] || {};
        const kid = {
          label: (kel.querySelector('.nc-label') || {}).value || '',
          href: (kel.querySelector('.nc-href') || {}).value || '',
          icon: (kel.querySelector('.nc-icon') || {}).value || ''
        };
        if (String(kid.icon).trim() === '') delete kid.icon;
        if (ksrc.enabled === false) kid.enabled = false;
        kids.push(kid);
      });
      if (kids.length) item.children = kids;
      next.push(item);
    });
    this.data = next;
  },

  addItem() { this.syncFromDOM(); this.data.push({ label: '', href: '/' }); this.render(); },
  removeItem(i) { this.syncFromDOM(); this.data.splice(i, 1); this.render(); },
  addChild(i) { this.syncFromDOM(); if (!this.data[i].children) this.data[i].children = []; this.data[i].children.push({ label: '', href: '/' }); this.render(); },
  removeChild(i, j) { this.syncFromDOM(); this.data[i].children.splice(j, 1); if (!this.data[i].children.length) delete this.data[i].children; this.render(); },
  moveItem(i, dir) {
    this.syncFromDOM();
    const j = i + dir;
    if (j < 0 || j >= this.data.length) return;
    const t = this.data[i]; this.data[i] = this.data[j]; this.data[j] = t;
    this.render();
  },
  moveChild(i, j, dir) {
    this.syncFromDOM();
    const k = j + dir;
    const kids = this.data[i].children || [];
    if (k < 0 || k >= kids.length) return;
    const t = kids[j]; kids[j] = kids[k]; kids[k] = t;
    this.render();
  },
  toggleItem(i) {
    this.syncFromDOM();
    const it = this.data[i];
    it.enabled = (it.enabled === false);  // undefined → false → লুকানো; false → true → দেখানো
    this.render();
  },
  toggleChild(i, j) {
    this.syncFromDOM();
    const ch = (this.data[i].children || [])[j];
    if (!ch) return;
    ch.enabled = (ch.enabled === false);
    this.render();
  },
  reorderTo(from, to) {
    if (from === to || from == null || to == null) return;
    this.syncFromDOM();
    const [moved] = this.data.splice(from, 1);
    this.data.splice(to, 0, moved);
    this.render();
  },

  beforeSubmit() {
    if (this.reset) return true;   // reset button already cleared the hidden input
    this.syncFromDOM();
    const input = document.getElementById('navJsonInput');
    if (input) input.value = JSON.stringify(this.data);
    return true;
  },

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
};

// Delegated clicks (buttons are re-rendered each time)
document.addEventListener('click', function (e) {
  const t = e.target.closest ? e.target.closest('button') : null;
  if (!t) return;
  if (t.classList.contains('nv-del')) { e.preventDefault(); NavEditor.removeItem(parseInt(t.dataset.i, 10)); }
  else if (t.classList.contains('nc-del')) { e.preventDefault(); NavEditor.removeChild(parseInt(t.dataset.i, 10), parseInt(t.dataset.j, 10)); }
  else if (t.classList.contains('nv-addchild')) { e.preventDefault(); NavEditor.addChild(parseInt(t.dataset.i, 10)); }
  else if (t.classList.contains('nv-up')) { e.preventDefault(); NavEditor.moveItem(parseInt(t.dataset.i, 10), -1); }
  else if (t.classList.contains('nv-down')) { e.preventDefault(); NavEditor.moveItem(parseInt(t.dataset.i, 10), 1); }
  else if (t.classList.contains('nc-up')) { e.preventDefault(); NavEditor.moveChild(parseInt(t.dataset.i, 10), parseInt(t.dataset.j, 10), -1); }
  else if (t.classList.contains('nc-down')) { e.preventDefault(); NavEditor.moveChild(parseInt(t.dataset.i, 10), parseInt(t.dataset.j, 10), 1); }
  else if (t.classList.contains('nv-toggle')) { e.preventDefault(); NavEditor.toggleItem(parseInt(t.dataset.i, 10)); }
  else if (t.classList.contains('nc-toggle')) { e.preventDefault(); NavEditor.toggleChild(parseInt(t.dataset.i, 10), parseInt(t.dataset.j, 10)); }
});

// ── Drag-and-drop reorder (top-level items) — সেশন ৪৯ ──────────────────────
document.addEventListener('dragstart', function (e) {
  const item = e.target.closest ? e.target.closest('.nv-item') : null;
  if (!item) return;
  NavEditor.dragIdx = parseInt(item.dataset.i, 10);
  item.style.opacity = '0.5';
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(NavEditor.dragIdx)); } catch (_) {} }
});
document.addEventListener('dragend', function (e) {
  const item = e.target.closest ? e.target.closest('.nv-item') : null;
  if (item) item.style.opacity = '';
  NavEditor.dragIdx = null;
});
document.addEventListener('dragover', function (e) {
  const item = e.target.closest ? e.target.closest('.nv-item') : null;
  if (!item || NavEditor.dragIdx == null) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
});
document.addEventListener('drop', function (e) {
  const item = e.target.closest ? e.target.closest('.nv-item') : null;
  if (!item || NavEditor.dragIdx == null) return;
  e.preventDefault();
  const to = parseInt(item.dataset.i, 10);
  NavEditor.reorderTo(NavEditor.dragIdx, to);
});
