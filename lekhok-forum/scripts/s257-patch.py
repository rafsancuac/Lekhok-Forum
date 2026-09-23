#!/usr/bin/env python3
# s257-patch.py — session257: ট্র্যাশ (/moderator/trash) তাৎক্ষণিক-ফিল্টার (tr257)
# চুক্তি: cu256/mm255-প্যাটার্ন-মিরর — data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + __trQA হুক
# স্টাইল: tr257-ব্লক হেক্স-শূন্য টোকেন-শুধু (guard-র্যাচেট-নিরাপদ) + [hidden]-গার্ড-জোড়া ×২ (চিপ+শূন্য-বক্স — session256-শিক্ষা) + সারি-hidden-গার্ড
import sys, io

VIEW = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/admin/views/admin/trash.ejs"

with io.open(VIEW, "r", encoding="utf-8") as f:
    src = f.read()

if "data-tr-row" in src:
    print("SKIP: tr257 already present (idempotent)")
    sys.exit(0)

edits = []

# ── এডিট-১: forEach-সূচক + data-kw কনস্ট ──
old1 = ("""        <% rows.forEach(r => {
             let o = {};
             try { o = JSON.parse(r.payload); } catch (e) {}
             const prev = o.title || o.name || o.email || '';
             const base = (typeof moderatorView !== 'undefined' && moderatorView) ? '/moderator' : '/admin';
        %>""")
new1 = ("""        <% rows.forEach((r, trI257) => {
             let o = {};
             try { o = JSON.parse(r.payload); } catch (e) {}
             const prev = o.title || o.name || o.email || '';
             const base = (typeof moderatorView !== 'undefined' && moderatorView) ? '/moderator' : '/admin';
             const trKw257 = ['#' + r.id, (r.table_name || ''), (prev || ''), String(r.payload || '').slice(0, 400), (r.deleted_by_name || ''), String(r.deleted_at || '')].filter(Boolean).join(' ');
        %>""")
edits.append((old1, new1))

# ── এডিট-২: সারি-অ্যাট্রিবিউট ──
old2 = """        <tr>
          <td style="width:34px;"><input type="checkbox" name="bulk_ids" value="<%= r.id %>" aria-label="সিলেক্ট"></td>"""
new2 = """        <tr data-tr-row="<%= trI257 %>" data-kw="<%= trKw257 %>">
          <td style="width:34px;"><input type="checkbox" name="bulk_ids" value="<%= r.id %>" aria-label="সিলেক্ট"></td>"""
edits.append((old2, new2))

# ── এডিট-৩: তাৎক্ষণিক-ফিল্টার UI + শূন্য-অবস্থা (card-এর-আগে) ──
old3 = """  <div class="card" style="padding:0;overflow:hidden;">
    <% if (!rows.length) { %>"""
new3 = """  <div class="tr-instant">
    <i class="fas fa-filter tr-instant-ico" aria-hidden="true"></i>
    <input type="text" id="trFilter257" class="tr-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — আইডি / টেবিল / স্ন্যাপশট / মুছেছেন" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="trClear257" class="tr-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="tr-count-chip" id="trCount257" hidden></span>
    <span class="tr-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="tr-zero" id="trZero257" data-tr-empty hidden>
    <i class="fas fa-trash-can" aria-hidden="true"></i>
    <span>কোনো আইটেম মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">
    <% if (!rows.length) { %>"""
edits.append((old3, new3))

# ── এডিট-৪: স্টাইল + স্ক্রিপ্ট (</body>-এর-আগে) ──
old4 = """</div>
</body>
</html>"""
new4 = """</div>
<style>
/* session257 — ট্র্যাশ তাৎক্ষণিক-ফিল্টার (tr257 — হেক্স-শূন্য টোকেন-শুধু; cu256/mm255-মিরর) */
.tr-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 10px; background: var(--lf-white); }
.tr-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.tr-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 8px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.tr-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.tr-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 8px; transition: none; }
.tr-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.tr-instant-clear:active { transform: scale(.96); }
.tr-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.tr-count-chip[hidden] { display: none; }
.tr-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.tr-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.tr-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 10px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.tr-zero[hidden] { display: none; }
.table tr[data-tr-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .tr-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .tr-kbd-hint { display: none; } .tr-instant { padding: 9px 11px; } }
</style>
<script>
(function () {
  'use strict';
  /* session257 — tr257 তাৎক্ষণিক-ফিল্টার (cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __trQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-tr-row]'));
  var input = document.getElementById('trFilter257');
  var clearBtn = document.getElementById('trClear257');
  var countChip = document.getElementById('trCount257');
  var zeroBox = document.getElementById('trZero257');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function trApply257() {
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (row) {
      var kw = (row.getAttribute('data-kw') || '').toLowerCase();
      var hit = !q || kw.indexOf(q) !== -1;
      row.hidden = !hit;
      if (hit) { shown++; }
    });
    if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = shown + ' / ' + total; } }
    if (clearBtn) { clearBtn.hidden = !q; }
    if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
  }
  function trClear257() {
    input.value = '';
    trApply257();
    input.blur();
  }
  input.addEventListener('input', trApply257);
  if (clearBtn) { clearBtn.addEventListener('click', trClear257); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); trClear257(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__trQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: trApply257,
    clear: trClear257
  };
})();
</script>
</body>
</html>"""
edits.append((old4, new4))

out = src
applied = 0
for i, (o, n) in enumerate(edits, 1):
    cnt = out.count(o)
    if cnt != 1:
        print("FATAL: edit-%d anchor count=%d (অবশ্যই ১)" % (i, cnt))
        sys.exit(1)
    out = out.replace(o, n)
    applied += 1

with io.open(VIEW, "w", encoding="utf-8") as f:
    f.write(out)

checks = [
    ("forEach-index", "trI257"),
    ("kw-const", "trKw257"),
    ("row-attr", 'data-tr-row="<%= trI257 %>"'),
    ("filter-input", 'id="trFilter257"'),
    ("count-chip", 'id="trCount257"'),
    ("zero-box", 'data-tr-empty'),
    ("kbd-hint", "tr-kbd-hint"),
    ("style-marker", "tr257 — হেক্স-শূন্য"),
    ("hidden-guard", ".table tr[data-tr-row][hidden]"),
    ("chip-guard", ".tr-count-chip[hidden] { display: none; }"),
    ("hook", "__trQA"),
]
inv_ok = True
for name, pat in checks:
    c = out.count(pat)
    print("  %-14s ×%d" % (name, c))
    if c == 0:
        inv_ok = False
if not inv_ok:
    print("FATAL: ইনভেন্টরি-শূন্য")
    sys.exit(1)
print("OK: tr257 প্যাচ প্রয়োগ (%d-এডিট, ইনভেন্টরি-গ্রিন)" % applied)
