// ── Nav editor (admin + moderator panel) ────────────────────────────────────
// Builds editable rows for the site menu config; serializes to JSON on submit.
// Server stores it in settings key `nav_json` (helpers/nav.js parses it).
window.NavEditor = {
  data: [],
  reset: false,
  init(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = Array.isArray(data) ? JSON.parse(JSON.stringify(data)) : [];
    this.render();
  },
  render() {
    const c = this.container;
    if (!c) return;
    if (!this.data.length) {
      c.innerHTML = '<p style="color:#64748b;padding:12px 4px;">কোনো মেনু আইটেম নেই — নিচের "+ মেনু আইটেম" বাটনে ক্লিক করুন।</p>';
      return;
    }
    let html = '';
    this.data.forEach((item, i) => {
      html += '<div class="nv-item" data-i="' + i + '" style="border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:12px;background:#f8fafc;">'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
        + '<input class="nv-label" value="' + this.esc(item.label) + '" placeholder="মেনু লেবেল (যেমন: হোম)" style="flex:2 1 150px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">'
        + '<input class="nv-href" value="' + this.esc(item.href) + '" placeholder="লিংক (যেমন: /about)" style="flex:2 1 150px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
        + '<input class="nv-icon" value="' + this.esc(item.icon || '') + '" placeholder="আইকন (fa-home)" style="flex:1 1 110px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
        + '<button type="button" class="nv-del" data-i="' + i + '" title="মেনু আইটেম মুছুন" style="padding:9px 12px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:8px;cursor:pointer;"><i class="fas fa-trash"></i></button>'
        + '</div>';
      const kids = item.children || [];
      if (kids.length) {
        html += '<div class="nv-kids" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">';
        kids.forEach((ch, j) => {
          html += '<div class="nv-child" data-j="' + j + '" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#fff;border:1px dashed #cbd5e1;border-radius:10px;padding:8px 10px;">'
            + '<span style="color:#94a3b8;font-size:12px;">↳</span>'
            + '<input class="nc-label" value="' + this.esc(ch.label) + '" placeholder="সাব-মেনু লেবেল" style="flex:2 1 140px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">'
            + '<input class="nc-href" value="' + this.esc(ch.href) + '" placeholder="লিংক" style="flex:2 1 140px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
            + '<input class="nc-icon" value="' + this.esc(ch.icon || '') + '" placeholder="fa-circle" style="flex:1 1 100px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;direction:ltr;text-align:left;">'
            + '<button type="button" class="nc-del" data-i="' + i + '" data-j="' + j + '" title="সাব-মেনু মুছুন" style="padding:7px 10px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:8px;cursor:pointer;"><i class="fas fa-times"></i></button>'
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
      const kids = [];
      el.querySelectorAll('.nv-child').forEach(kel => {
        const kid = {
          label: (kel.querySelector('.nc-label') || {}).value || '',
          href: (kel.querySelector('.nc-href') || {}).value || '',
          icon: (kel.querySelector('.nc-icon') || {}).value || ''
        };
        if (String(kid.icon).trim() === '') delete kid.icon;
        kids.push(kid);
      });
      if (kids.length) item.children = kids;
      void idx; void src;
      next.push(item);
    });
    this.data = next;
  },
  addItem() { this.syncFromDOM(); this.data.push({ label: '', href: '/' }); this.render(); },
  removeItem(i) { this.syncFromDOM(); this.data.splice(i, 1); this.render(); },
  addChild(i) { this.syncFromDOM(); if (!this.data[i].children) this.data[i].children = []; this.data[i].children.push({ label: '', href: '/' }); this.render(); },
  removeChild(i, j) { this.syncFromDOM(); this.data[i].children.splice(j, 1); if (!this.data[i].children.length) delete this.data[i].children; this.render(); },
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
  if (t.classList.contains('nv-del')) { e.preventDefault(); NavEditor.syncFromDOM(); NavEditor.data.splice(parseInt(t.dataset.i, 10), 1); NavEditor.render(); }
  else if (t.classList.contains('nc-del')) { e.preventDefault(); NavEditor.syncFromDOM(); const i = parseInt(t.dataset.i, 10), j = parseInt(t.dataset.j, 10); NavEditor.data[i].children.splice(j, 1); if (!NavEditor.data[i].children.length) delete NavEditor.data[i].children; NavEditor.render(); }
  else if (t.classList.contains('nv-addchild')) { e.preventDefault(); NavEditor.addChild(parseInt(t.dataset.i, 10)); }
});
