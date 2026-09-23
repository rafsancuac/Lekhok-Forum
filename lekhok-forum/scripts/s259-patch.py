#!/usr/bin/env python3
# s259-patch.py — session259: বিজ্ঞপ্তি (/moderator/notices) তাৎক্ষণিক-ফিল্টার (no259)
# চুক্তি: pr258/tr257/cu256-প্যাটার্ন-মিরর — data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + __noQA হুক
# স্টাইল: no259-ব্লক হেক্স-শূন্য টোকেন-শুধু (guard-র্যাচেট-নিরাপদ) + [hidden]-গার্ড-জোড়া (চিপ+শূন্য-বক্স — session256-শিক্ষা) + সারি-hidden-গার্ড + cat-chip টোকেন-টিন্ট
# নো-রিগ্রেশন: bulk-bar (bulk-delete/bulk-toggle) + যোগ-ফর্ম (mod-form) + data-bulk-all সম্পূর্ণ অক্ষুণ্ণ
import sys, io

VIEW = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/moderator-notices.ejs"

with io.open(VIEW, "r", encoding="utf-8") as f:
    src = f.read()

if "data-no-row" in src:
    print("SKIP: no259 already present (idempotent)")
    sys.exit(0)

edits = []

# ── এডিট-১: তালিকার-আগে ফিল্টার-বার + শূন্য-অবস্থা + forEach-সূচক + data-kw কনস্ট + ক্যাটাগরি-চিপ ──
old1 = """    <% notices.forEach(n => { %>
      <div class="mod-item">
        <input type="checkbox" name="bulk_ids" value="<%= n.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">
        <div style="flex:1;"><strong><%= n.title %></strong><div style="color:#999; font-size:0.85rem;"><%= n.date %></div></div>
        <form method="POST" action="/moderator/notices/<%= n.id %>?_method=DELETE">
          <button class="btn btn-danger btn-sm" type="submit">মুছুন</button>
        </form>
      </div>
    <% }) %>"""
new1 = """    <div class="no-instant" id="noInstant259">
      <i class="fas fa-filter no-instant-ico" aria-hidden="true"></i>
      <input type="text" id="noFilter259" class="no-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ক্যাটাগরি / তারিখ / #আইডি" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="noClear259" class="no-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="no-count-chip" id="noCount259" hidden></span>
      <span class="no-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="no-zero" id="noZero259" data-no-empty hidden>
      <i class="fas fa-bullhorn" aria-hidden="true"></i>
      <span>কোনো বিজ্ঞপ্তি মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
    <% notices.forEach((n, noI259) => {
         const noCat259 = ({ notice: 'সাধারণ বিজ্ঞপ্তি', urgent: 'জরুরি', event: 'ইভেন্ট সংক্রান্ত' })[n.category] || 'সাধারণ বিজ্ঞপ্তি';
         const noKw259 = ['#' + n.id, (n.title || ''), noCat259, (n.category || ''), (n.date || '')].filter(Boolean).join(' ');
    %>
      <div class="mod-item" data-no-row="<%= noI259 %>" data-kw="<%= noKw259 %>">
        <input type="checkbox" name="bulk_ids" value="<%= n.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">
        <div style="flex:1;"><strong><%= n.title %></strong><div style="color:#999; font-size:0.85rem;"><%= n.date %></div></div>
        <span class="no-cat-chip"><%= noCat259 %></span>
        <form method="POST" action="/moderator/notices/<%= n.id %>?_method=DELETE">
          <button class="btn btn-danger btn-sm" type="submit">মুছুন</button>
        </form>
      </div>
    <% }) %>"""
edits.append((old1, new1))

# ── এডিট-২: premium.js-include-পরে স্টাইল-ব্লক + স্ক্রিপ্ট-ব্লক (</body>-আগে) ──
old2 = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
</body>"""
new2 = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
<style>
/* session259 — বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার (no259 — হেক্স-শূন্য টোকেন-শুধু; pr258/tr257/cu256-মিরর) */
.no-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.no-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.no-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.no-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.no-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.no-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.no-instant-clear:active { transform: scale(.96); }
.no-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.no-count-chip[hidden] { display: none; }
.no-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.no-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.no-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.no-zero[hidden] { display: none; }
.no-cat-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: .76rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); white-space: nowrap; }
.mod-item[data-no-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .no-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .no-kbd-hint { display: none; } .no-instant { padding: 9px 11px; } .no-cat-chip { display: none; } }
</style>
<script>
(function () {
  'use strict';
  /* session259 — no259 তাৎক্ষণিক-ফিল্টার (pr258/tr257/cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __noQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.mod-item[data-no-row]'));
  var input = document.getElementById('noFilter259');
  var clearBtn = document.getElementById('noClear259');
  var countChip = document.getElementById('noCount259');
  var zeroBox = document.getElementById('noZero259');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function noApply259() {
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
  function noClear259() {
    input.value = '';
    noApply259();
    input.blur();
  }
  input.addEventListener('input', noApply259);
  if (clearBtn) { clearBtn.addEventListener('click', noClear259); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); noClear259(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__noQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: noApply259,
    clear: noClear259
  };
})();
</script>
</body>"""
edits.append((old2, new2))

for i, (o, n) in enumerate(edits, 1):
    if o not in src:
        print(f"FATAL: এডিট-{i}-অ্যাঙ্কর অনুপস্থিত (ভিউ-পরিবর্তিত?)")
        sys.exit(1)
    src = src.replace(o, n, 1)

with io.open(VIEW, "w", encoding="utf-8") as f:
    f.write(src)
print("OK: no259 প্রয়োগ-সম্পন্ন (ফিল্টার-বার + শূন্য-অবস্থা + data-kw-সারি + cat-chip + স্টাইল + __noQA)")
