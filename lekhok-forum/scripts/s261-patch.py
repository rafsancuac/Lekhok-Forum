#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s261-patch.py — session261 (Task ID 101): রিসোর্স তাৎক্ষণিক-ফিল্টার re261
views/user/moderator-resources.ejs — ev260/no259-চুক্তি-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (reFilter261 + reClear261 + reCount261 + re-kbd-hint)
     + শূন্য-অবস্থা (reZero261 data-re-empty) + সারি data-re-row/data-kw + __reQA হুক
  ② [Mandatory-ফিচার-সংযোজন] .re-cat-chip (প্রতি-সারি ক্যাটাগরি-পিল — no259 .no-cat-chip-মিরর)
  ③ [Mandatory-স্টাইল] re261-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল
     + :active + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩)
অক্ষুণ্ণ: mrForm/টাইপ-পিকার/বাল্ক-মোডাল (rsxBulkBtn)/প্রতি-সারি-মুছুন-ফর্ম/এডিট-লিংক।
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'views', 'user', 'moderator-resources.ejs')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'reFilter261' in src:
    print('SKIP: re261 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

# ── ① ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (তালিকা-কার্ডে, forEach-এর আগে) ──────────
A1 = """    <% if (!resources.length) { %><p class="mod-hint"><i class="fas fa-info-circle"></i> এখনো কোনো রিসোর্স নেই — উপরের ফর্ম থেকে প্রথমটি প্রকাশ করুন।</p><% } %>
"""
B1 = """    <% if (!resources.length) { %><p class="mod-hint"><i class="fas fa-info-circle"></i> এখনো কোনো রিসোর্স নেই — উপরের ফর্ম থেকে প্রথমটি প্রকাশ করুন।</p><% } %>
    <div class="re-instant" id="reInstant261">
      <i class="fas fa-filter re-instant-ico" aria-hidden="true"></i>
      <input type="text" id="reFilter261" class="re-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ধরন / ক্যাটাগরি / ট্যাগ / লেখক / #আইডি" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="reClear261" class="re-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="re-count-chip" id="reCount261" hidden></span>
      <span class="re-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="re-zero" id="reZero261" data-re-empty hidden>
      <i class="fas fa-book" aria-hidden="true"></i>
      <span>কোনো রিসোর্স মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
"""
if A1 in src:
    src = src.replace(A1, B1, 1); APPLIED.append('① ফিল্টার-স্ট্রিপ+শূন্য-অবস্থা')
else:
    sys.exit('FATAL: ①-অ্যাঙ্কর পাওয়া যায়নি')

# ── ② সারি-মার্কআপ: data-re-row + data-kw + .re-cat-chip ─────────────────────
A2 = """    <% resources.forEach(function(r) { var t = RES_TYPE_META.RES_TYPES[RES_TYPE_META.normalizeResType(r)]; %>
      <div class="mr-res-row">
        <span class="mr-badge" style="background:<%= t.bg %>;color:<%= t.color %>;border:1px solid <%= t.border %>;"><i class="fas <%= t.icon %>"></i> <%= t.short %></span>
"""
B2 = """    <% var RE_CAT_261 = { 'guide':'গাইড','document':'ডকুমেন্ট','report':'প্রতিবেদন','form':'ফর্ম','anthology':'সংকলন','reference':'রেফারেন্স','scholarship':'ফেলোশিপ','writing-tips':'লেখালেখির টিপস','general':'সাধারণ' }; %>
    <% resources.forEach(function(r, reI261) { var t = RES_TYPE_META.RES_TYPES[RES_TYPE_META.normalizeResType(r)]; var reCatL261 = RE_CAT_261[r.category] || r.category || 'সাধারণ'; var reKw261 = ['#' + r.id, (r.title || ''), (t && t.label) || '', (t && t.short) || '', reCatL261, (r.category || ''), (r.tags || ''), (r.author || ''), (r.file_size || ''), (r.duration || ''), (r.series || ''), (r.series_order ? '#' + r.series_order : ''), (r.created_by || ''), (r.link_url || '')].filter(Boolean).join(' '); %>
      <div class="mr-res-row" data-re-row="<%= reI261 %>" data-kw="<%= reKw261 %>">
        <span class="mr-badge" style="background:<%= t.bg %>;color:<%= t.color %>;border:1px solid <%= t.border %>;"><i class="fas <%= t.icon %>"></i> <%= t.short %></span>
        <span class="re-cat-chip" title="ক্যাটাগরি"><%= reCatL261 %></span>
"""
if A2 in src:
    src = src.replace(A2, B2, 1); APPLIED.append('② সারি data-re-row/data-kw + cat-chip')
else:
    sys.exit('FATAL: ②-অ্যাঙ্কর পাওয়া যায়নি')

# ── ③ CSS+JS ব্লক (</body>-এর আগে — sed-নিষ্কাশন-বান্ধব এক-মার্কার) ────────────
CSS_JS = """<style>
/* session261 — রিসোর্স তাৎক্ষণিক-ফিল্টার (re261 — হেক্স-শূন্য টোকেন-শুধু; ev260/no259-মিরর) */
.re-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.re-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.re-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.re-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.re-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.re-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.re-instant-clear:active { transform: scale(.96); }
.re-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.re-count-chip[hidden] { display: none; }
.re-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.re-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.re-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.re-zero[hidden] { display: none; }
.re-cat-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); white-space: nowrap; flex-shrink: 0; }
.mr-res-row[data-re-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .re-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .re-kbd-hint { display: none; } .re-instant { padding: 9px 11px; } .re-cat-chip { display: none; } }
</style>
<script>
(function () {
  'use strict';
  /* session261 — re261 তাৎক্ষণিক-ফিল্টার (ev260/no259-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __reQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.mr-res-row[data-re-row]'));
  var input = document.getElementById('reFilter261');
  var clearBtn = document.getElementById('reClear261');
  var countChip = document.getElementById('reCount261');
  var zeroBox = document.getElementById('reZero261');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function reApply261() {
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
  function reClear261() {
    input.value = '';
    reApply261();
    input.blur();
  }
  input.addEventListener('input', reApply261);
  if (clearBtn) { clearBtn.addEventListener('click', reClear261); }
  input.addEventListener('keydown', function (re) {
    if (re.key === 'Escape') { re.stopPropagation(); reClear261(); }
  });
  document.addEventListener('keydown', function (re) {
    if (re.key !== 'f' || re.altKey || re.ctrlKey || re.metaKey) { return; }
    var t = re.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    re.preventDefault();
    input.focus();
    input.select();
  });
  window.__reQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: reApply261,
    clear: reClear261
  };
})();
</script>
</body>
</html>
"""
A3 = """</body>
</html>
"""
if A3 in src:
    src = src.replace(A3, CSS_JS, 1); APPLIED.append('③ CSS+JS ব্লক (হেক্স-শূন্য + hidden-গার্ড ×৩ + __reQA)')
else:
    sys.exit('FATAL: ③-অ্যাঙ্কর পাওয়া যায়নি')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

print('OK — প্রয়োগ:', '; '.join(APPLIED))
