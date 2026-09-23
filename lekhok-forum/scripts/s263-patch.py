#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s263-patch.py — session263 (Task ID 103): মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার mdf263
views/user/moderator-dashboard.ejs — muf262-প্যাটার্ন-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (mdfFilter263 + mdfClear263 + mdfCount263 + mdf-kbd-hint)
     + শূন্য-অবস্থা (mdfZero263 data-mdf-empty) + টাইল data-mdf-row/data-kw + __mdfQA হুক
  ② **পূর্ণ-সারফেস-কভারেজ:** scope-টাইল (mod-grid — ২-শাখা allowed/locked) + এক্সট্রা-টাইল
     (reports/navigation/members/press — ৪-টাইল দ্বিতীয়-গ্রিড) — সব .mod-tile data-mdf-row/data-kw-বহুল
  ③ **নেমস্পেস-ম্যাপ:** পেজের .mod-* CSS পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স **mdf** (সংঘর্ষ-মুক্ত যাচাইকৃত)
  ④ **দ্বি-ভাষা data-kw:** লেবেল+বর্ণনা+key+লিংক+অবস্থা-শব্দ (খোলা/লকড + unlocked/locked) —
     ব্যবহারকারী যে-ভাষাতেই-লিখুক মেলে
  ⑤ [Mandatory-স্টাইল] mdf263-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active
     + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩ — **inline-display:flex-টাইল-ওভাররাইড-গার্ডসহ**,
     session256-শিক্ষা)
অক্ষুণ্ণ: mod-hero/mod-stats/mod-section-head/mod-scope-count/mod-grid/mrq81-dash-badge/
mod-switch-btn/mod-logout-btn/mod-empty/info-note — সব no-regression-অ্যাসার্টে প্রমাণিত।
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'views', 'user', 'moderator-dashboard.ejs')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'mdfFilter263' in src:
    print('SKIP: mdf263 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

# ── ① ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (mod-section-head-এর ঠিক-পরে, mod-grid-এর-আগে) ──
A1 = """  <div class="mod-section-head">
    <h2><i class="fas fa-th-large"></i> কার্যক্রম</h2>
    <span class="mod-scope-count"><%= myScopes.length %> / <%= scopes.length %> স্কোপ অনুমোদিত</span>
  </div>
"""
B1 = """  <div class="mod-section-head">
    <h2><i class="fas fa-th-large"></i> কার্যক্রম</h2>
    <span class="mod-scope-count"><%= myScopes.length %> / <%= scopes.length %> স্কোপ অনুমোদিত</span>
  </div>

  <div class="mdf-instant" id="mdfInstant263">
    <i class="fas fa-filter mdf-instant-ico" aria-hidden="true"></i>
    <input type="text" id="mdfFilter263" class="mdf-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — স্কোপ / কার্যক্রম / মেনু / রিপোর্ট / পত্রিকা" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="mdfClear263" class="mdf-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="mdf-count-chip" id="mdfCount263" hidden></span>
    <span class="mdf-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="mdf-zero" id="mdfZero263" data-mdf-empty hidden>
    <i class="fas fa-th-large" aria-hidden="true"></i>
    <span>কোনো টাইল মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
"""
if A1 in src:
    src = src.replace(A1, B1, 1); APPLIED.append('① ফিল্টার-স্ট্রিপ+শূন্য-অবস্থা')
else:
    sys.exit('FATAL: ①-অ্যাঙ্কর পাওয়া যায়নি')

# ── ② scope-লুপ: ইনডেক্স+kw-ভেরিয়েবল + ২-শাখায় data-mdf-row/data-kw ──────────
A2 = """    <% scopes.forEach(s => {
      const aliased = scopeAliases[s.key];
      const isDaily = dailyContentScopes.includes(s.key);
      const allowed = myScopes.includes(s.key) || (aliased && myScopes.includes(aliased)) || (isDaily && myScopes.includes('daily')) || user.role === 'admin';
    %>
      <% if (allowed) { %>
        <a href="<%= links[s.key] %>" class="mod-tile">"""
B2 = """    <% scopes.forEach((s, mdfI263) => {
      const aliased = scopeAliases[s.key];
      const isDaily = dailyContentScopes.includes(s.key);
      const allowed = myScopes.includes(s.key) || (aliased && myScopes.includes(aliased)) || (isDaily && myScopes.includes('daily')) || user.role === 'admin';
      var mdfKw263 = [s.label, descs[s.key] || '', s.key, links[s.key] || '', allowed ? 'খোলা অনুমোদিত unlocked allowed open' : 'লকড অনুমতি নেই locked denied'].filter(Boolean).join(' ');
    %>
      <% if (allowed) { %>
        <a href="<%= links[s.key] %>" class="mod-tile" data-mdf-row="<%= mdfI263 %>" data-kw="<%= mdfKw263 %>">"""
if A2 in src:
    src = src.replace(A2, B2, 1); APPLIED.append('② scope-টাইল data-mdf-row/data-kw (allowed-শাখা)')
else:
    sys.exit('FATAL: ②-অ্যাঙ্কর পাওয়া যায়নি')

A3 = """        <div class="mod-tile locked" title="এই সেকশনের অনুমতি আপনার নেই">"""
B3 = """        <div class="mod-tile locked" title="এই সেকশনের অনুমতি আপনার নেই" data-mdf-row="<%= mdfI263 %>" data-kw="<%= mdfKw263 %>">"""
if A3 in src:
    src = src.replace(A3, B3, 1); APPLIED.append('③ scope-টাইল data-mdf-row/data-kw (locked-শাখা)')
else:
    sys.exit('FATAL: ③-অ্যাঙ্কর পাওয়া যায়নি')

# ── ④ এক্সট্রা-টাইল ×৪ (দ্বিতীয়-গ্রিড — স্ট্যাটিক kw) ─────────────────────────
A4 = """    <a href="/moderator/reports" class="mod-tile" style="display:flex;align-items:center;gap:14px;position:relative;">"""
B4 = """    <a href="/moderator/reports" class="mod-tile" style="display:flex;align-items:center;gap:14px;position:relative;" data-mdf-row="<%= scopes.length %>" data-kw="রিপোর্ট-কিউ সদস্যদের রিপোর্ট দেখে কনটেন্ট লুকান খারিজ করুন /moderator/reports রিপোর্ট moderation reports queue">"""
if A4 in src:
    src = src.replace(A4, B4, 1); APPLIED.append('④ রিপোর্ট-কিউ টাইল')
else:
    sys.exit('FATAL: ④-অ্যাঙ্কর পাওয়া যায়নি')

A5 = """    <a href="/moderator/navigation" class="mod-tile" style="display:flex;align-items:center;gap:14px;">"""
B5 = """    <a href="/moderator/navigation" class="mod-tile" style="display:flex;align-items:center;gap:14px;" data-mdf-row="<%= scopes.length + 1 %>" data-kw="মেনু ব্যবস্থাপনা হোম পেজের মেনু ও সাব-মেনু এডিট করুন /moderator/navigation মেনু menu navigation">"""
if A5 in src:
    src = src.replace(A5, B5, 1); APPLIED.append('⑤ মেনু-ব্যবস্থাপনা টাইল')
else:
    sys.exit('FATAL: ⑤-অ্যাঙ্কর পাওয়া যায়নি')

A6 = """    <a href="/moderator/members" class="mod-tile" style="display:flex;align-items:center;gap:14px;">"""
B6 = """    <a href="/moderator/members" class="mod-tile" style="display:flex;align-items:center;gap:14px;" data-mdf-row="<%= scopes.length + 2 %>" data-kw="কমিটি সদস্য ব্যবস্থাপনা কার্যনির্বাহী কমিটি ও উপদেষ্টাদের পদ কার্যবর্ষ তথ্য আপডেট করুন /moderator/members কমিটি members committee">"""
if A6 in src:
    src = src.replace(A6, B6, 1); APPLIED.append('⑥ কমিটি-সদস্য টাইল')
else:
    sys.exit('FATAL: ⑥-অ্যাঙ্কর পাওয়া যায়নি')

A7 = """    <a href="/moderator/press" class="mod-tile" style="display:flex;align-items:center;gap:14px;">"""
B7 = """    <a href="/moderator/press" class="mod-tile" style="display:flex;align-items:center;gap:14px;" data-mdf-row="<%= scopes.length + 3 %>" data-kw="পত্রিকা কাটিং ব্যবস্থাপনা পত্রিকায় ফোরামকে নিয়ে প্রকাশিত নিউজের ছবি যোগ আপডেট করুন /moderator/press পত্রিকা press epaper cutting">"""
if A7 in src:
    src = src.replace(A7, B7, 1); APPLIED.append('⑦ পত্রিকা-কাটিং টাইল')
else:
    sys.exit('FATAL: ⑦-অ্যাঙ্কর পাওয়া যায়নি')

# ── ⑧ CSS+JS ব্লক (premium.js-এর-পরে, </body>-র-আগে) ─────────────────────────
CSS_JS = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
<style>
/* session263 — মডারেটর ড্যাশবোর্ড তাৎক্ষণিক-ফিল্টার (mdf263 — হেক্স-শূন্য টোকেন-শুধু; muf262-প্যাটার্ন-মিরর) */
.mdf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.mdf-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.mdf-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.mdf-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.mdf-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.mdf-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.mdf-instant-clear:active { transform: scale(.96); }
.mdf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.mdf-count-chip[hidden] { display: none; }
.mdf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.mdf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.mdf-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.mdf-zero[hidden] { display: none; }
.mod-tile[data-mdf-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .mdf-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .mdf-kbd-hint { display: none; } .mdf-instant { padding: 9px 11px; } }
</style>
<script>
(function () {
  'use strict';
  /* session263 — mdf263 তাৎক্ষণিক-ফিল্টার (muf262-প্যাটার্ন-মিরর: data-kw-টাইল + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __mdfQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-mdf-row]'));
  var input = document.getElementById('mdfFilter263');
  var clearBtn = document.getElementById('mdfClear263');
  var countChip = document.getElementById('mdfCount263');
  var zeroBox = document.getElementById('mdfZero263');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function mdfApply263() {
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
  function mdfClear263() {
    input.value = '';
    mdfApply263();
    input.blur();
  }
  input.addEventListener('input', mdfApply263);
  if (clearBtn) { clearBtn.addEventListener('click', mdfClear263); }
  input.addEventListener('keydown', function (md) {
    if (md.key === 'Escape') { md.stopPropagation(); mdfClear263(); }
  });
  document.addEventListener('keydown', function (md) {
    if (md.key !== 'f' || md.altKey || md.ctrlKey || md.metaKey) { return; }
    var t = md.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    md.preventDefault();
    input.focus();
    input.select();
  });
  window.__mdfQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: mdfApply263,
    clear: mdfClear263
  };
})();
</script>
</body>
</html>
"""
A8 = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
</body>
</html>
"""
if A8 in src:
    src = src.replace(A8, CSS_JS, 1); APPLIED.append('⑧ CSS+JS ব্লক (হেক্স-শূন্য + hidden-গার্ড ×৩ + __mdfQA)')
else:
    sys.exit('FATAL: ⑧-অ্যাঙ্কর পাওয়া যায়নি')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

print('OK — প্রয়োগ:', '; '.join(APPLIED))
