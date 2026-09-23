#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s262-patch.py — session262 (Task ID 102): ইউজার তাৎক্ষণিক-ফিল্টার muf262 (স্কোপড-ভ্যারিয়েন্ট)
views/user/moderator-users.ejs — au251-admin-ভিউ-এর moderator-স্কোপড-ভ্যারিয়েন্ট (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (mufFilter262 + mufClear262 + mufCount262 + muf-kbd-hint)
     + শূন্য-অবস্থা (mufZero262 data-muf-empty) + সারি data-muf-row/data-kw + __mufQA হুক
  ② **স্কোপ-বাউন্ডারি:** data-kw-তে email নেই (moderator-ভিউ email দেখে না — au251-এর স্কোপড-ব্যতিক্রম);
     দ্বি-ভাষা: রোল/স্ট্যাটাস বাংলা-লেবেল + ইংরেজি-কী দুটোই; যোগদান+শেষ-লগইন তারিখ
  ③ **নেমস্পেস-সংঘর্ষ-বিতাড়ন:** পেজের .mu-* CSS (session90) পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স **muf**
  ④ [Mandatory-স্টাইল] muf262-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active
     + reduced-motion-জোড়া + 640px + hidden-গার্ড ×৩)
অক্ষুণ্ণ: mu-search (GET DB-সার্চ — সম্পূরক), mu-stats চিপ, নিষেধ/ফেরত ফর্ম (data-mu-confirm),
mu-reason details, ঊর্ধ্বতন-লক (mu-lock), তদারকি-ফিড (mu-feed), স্মরণী (mu-tip)।
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'views', 'user', 'moderator-users.ejs')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'mufFilter262' in src:
    print('SKIP: muf262 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

# ── ① ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (mu-main-এর শীর্ষে, rows-ব্রাঞ্চের আগে) ────
A1 = """      <div class="mu-main">
    <% if (!users.length) { %>"""
B1 = """      <div class="mu-main">
    <div class="muf-instant" id="mufInstant262">
      <i class="fas fa-filter muf-instant-ico" aria-hidden="true"></i>
      <input type="text" id="mufFilter262" class="muf-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / @ইউজারনেম / রোল / স্ট্যাটাস / #আইডি" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="mufClear262" class="muf-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="muf-count-chip" id="mufCount262" hidden></span>
      <span class="muf-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="muf-zero" id="mufZero262" data-muf-empty hidden>
      <i class="fas fa-users" aria-hidden="true"></i>
      <span>কোনো ইউজার মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
    <% if (!users.length) { %>"""
if A1 in src:
    src = src.replace(A1, B1, 1); APPLIED.append('① ফিল্টার-স্ট্রিপ+শূন্য-অবস্থা')
else:
    sys.exit('FATAL: ①-অ্যাঙ্কর পাওয়া যায়নি')

# ── ② সারি-মার্কআপ: data-muf-row + দ্বি-ভাষা data-kw (email-বিহীন স্কোপড-ভ্যারিয়েন্ট) ──
A2 = """      <% users.forEach((u, uIdx) => { %>
        <tr class="<%= u.status === 'banned' ? 'is-banned-row' : '' %>">"""
B2 = """      <% users.forEach((u, uIdx) => { var mufRoleL262 = u.role === 'moderator' ? 'মডারেটর' : (u.role === 'admin' ? 'এডমিন' : 'ইউজার'); var mufStL262 = u.status === 'banned' ? 'নিষিদ্ধ' : (u.status === 'pending' ? 'অপেক্ষমাণ' : 'সক্রিয়'); var mufKw262 = ['#' + u.id, '@' + (u.username || ''), (u.username || ''), (u.full_name || ''), mufRoleL262, (u.role || ''), mufStL262, (u.status || ''), (u.created_at || '').split(' ')[0], u.last_login ? (u.last_login + '').split(' ')[0] : ''].filter(Boolean).join(' '); %>
        <tr class="<%= u.status === 'banned' ? 'is-banned-row' : '' %>" data-muf-row="<%= uIdx %>" data-kw="<%= mufKw262 %>">"""
if A2 in src:
    src = src.replace(A2, B2, 1); APPLIED.append('② সারি data-muf-row/data-kw (দ্বি-ভাষা, email-বিহীন)')
else:
    sys.exit('FATAL: ②-অ্যাঙ্কর পাওয়া যায়নি')

# ── ③ CSS+JS ব্লক (sandbox-preview include-এর আগে) ───────────────────────────
CSS_JS = """<style>
/* session262 — ইউজার তাৎক্ষণিক-ফিল্টার (muf262 — হেক্স-শূন্য টোকেন-শুধু; au251-স্কোপড-ভ্যারিয়েন্ট; re261-মিরর) */
.muf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.muf-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.muf-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.muf-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.muf-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.muf-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.muf-instant-clear:active { transform: scale(.96); }
.muf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.muf-count-chip[hidden] { display: none; }
.muf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.muf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.muf-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.muf-zero[hidden] { display: none; }
tr[data-muf-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .muf-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .muf-kbd-hint { display: none; } .muf-instant { padding: 9px 11px; } }
</style>
<script>
(function () {
  'use strict';
  /* session262 — muf262 তাৎক্ষণিক-ফিল্টার (au251-স্কোপড-ভ্যারিয়েন্ট; ev260/re261-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __mufQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-muf-row]'));
  var input = document.getElementById('mufFilter262');
  var clearBtn = document.getElementById('mufClear262');
  var countChip = document.getElementById('mufCount262');
  var zeroBox = document.getElementById('mufZero262');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function mufApply262() {
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
  function mufClear262() {
    input.value = '';
    mufApply262();
    input.blur();
  }
  input.addEventListener('input', mufApply262);
  if (clearBtn) { clearBtn.addEventListener('click', mufClear262); }
  input.addEventListener('keydown', function (mu) {
    if (mu.key === 'Escape') { mu.stopPropagation(); mufClear262(); }
  });
  document.addEventListener('keydown', function (mu) {
    if (mu.key !== 'f' || mu.altKey || mu.ctrlKey || mu.metaKey) { return; }
    var t = mu.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    mu.preventDefault();
    input.focus();
    input.select();
  });
  window.__mufQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: mufApply262,
    clear: mufClear262
  };
})();
</script>
<%- include('../partials/sandbox-preview') %>
</body>
</html>
"""
A3 = """<%- include('../partials/sandbox-preview') %>
</body>
</html>
"""
if A3 in src:
    src = src.replace(A3, CSS_JS, 1); APPLIED.append('③ CSS+JS ব্লক (হেক্স-শূন্য + hidden-গার্ড ×৩ + __mufQA)')
else:
    sys.exit('FATAL: ③-অ্যাঙ্কর পাওয়া যায়নি')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

print('OK — প্রয়োগ:', '; '.join(APPLIED))
