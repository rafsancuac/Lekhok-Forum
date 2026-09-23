#!/usr/bin/env python3
# s260-patch.py — session260: ইভেন্ট (/moderator/events) তাৎক্ষণিক-ফিল্টার (ev260)
# চুক্তি: no259/pr258/tr257-প্যাটার্ন-মিরর — data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape-ক্লিয়ার+ব্লার + __evQA হুক
# সংযোজন: আসন্ন/সমাপ্ত স্ট্যাটাস-চিপ (তারিখ-গণনা-ভিত্তিক — end_date||date বনাম আজ; upcoming/ended ইংরেজি-কী-সহ data-kw)
# স্টাইল: ev260-ব্লক হেক্স-শূন্য টোকেন-শুধু + [hidden]-গার্ড-জোড়া + সারি-hidden-গার্ড + status-chip টোকেন-টিন্ট + past-মিউট
# নো-রিগ্রেশন: bulk-bar (bulk-delete/bulk-toggle) + যোগ-ফর্ম (mod-form) + data-bulk-all সম্পূর্ণ অক্ষুণ্ণ
import sys, io

VIEW = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/moderator-events.ejs"

with io.open(VIEW, "r", encoding="utf-8") as f:
    src = f.read()

if "data-ev-row" in src:
    print("SKIP: ev260 already present (idempotent)")
    sys.exit(0)

edits = []

# ── এডিট-১: তালিকার-আগে ফিল্টার-বার + শূন্য-অবস্থা + forEach-সূচক + data-kw + স্ট্যাটাস-চিপ ──
old1 = """    <% events.forEach(e => { %>
      <div class="mod-item">
        <input type="checkbox" name="bulk_ids" value="<%= e.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">
        <div style="flex:1;"><strong><%= e.title %></strong><div style="color:#999; font-size:0.85rem;"><%= e.date %></div></div>
        <form method="POST" action="/moderator/events/<%= e.id %>?_method=DELETE">
          <button class="btn btn-danger btn-sm" type="submit">মুছুন</button>
        </form>
      </div>
    <% }) %>"""
new1 = """    <div class="ev-instant" id="evInstant260">
      <i class="fas fa-filter ev-instant-ico" aria-hidden="true"></i>
      <input type="text" id="evFilter260" class="ev-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / স্থান / তারিখ / অবস্থা / #আইডি" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="evClear260" class="ev-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="ev-count-chip" id="evCount260" hidden></span>
      <span class="ev-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="ev-zero" id="evZero260" data-ev-empty hidden>
      <i class="fas fa-calendar-alt" aria-hidden="true"></i>
      <span>কোনো ইভেন্ট মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
    <% const evToday260 = new Date().toISOString().slice(0, 10); %>
    <% events.forEach((e, evI260) => {
         const evEnd260 = e.end_date || e.date || '';
         const evUpcoming260 = evEnd260 && evEnd260 >= evToday260;
         const evStatus260 = evUpcoming260 ? 'আসন্ন' : 'সমাপ্ত';
         const evKw260 = ['#' + e.id, (e.title || ''), (e.location || ''), (e.date || ''), (e.end_date || ''), evStatus260, (evUpcoming260 ? 'upcoming' : 'ended')].filter(Boolean).join(' ');
    %>
      <div class="mod-item" data-ev-row="<%= evI260 %>" data-kw="<%= evKw260 %>">
        <input type="checkbox" name="bulk_ids" value="<%= e.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">
        <div style="flex:1;"><strong><%= e.title %></strong><div style="color:#999; font-size:0.85rem;"><%= e.date %><%= e.end_date ? ' → ' + e.end_date : '' %><%= e.location ? ' · ' + e.location : '' %></div></div>
        <span class="ev-status-chip <%= evUpcoming260 ? '' : 'past' %>"><%= evStatus260 %></span>
        <form method="POST" action="/moderator/events/<%= e.id %>?_method=DELETE">
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
/* session260 — ইভেন্ট তাৎক্ষণিক-ফিল্টার (ev260 — হেক্স-শূন্য টোকেন-শুধু; no259/pr258/tr257-মিরর) */
.ev-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.ev-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.ev-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.ev-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.ev-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.ev-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.ev-instant-clear:active { transform: scale(.96); }
.ev-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.ev-count-chip[hidden] { display: none; }
.ev-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.ev-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.ev-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.ev-zero[hidden] { display: none; }
.ev-status-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: .76rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); white-space: nowrap; }
.ev-status-chip.past { color: var(--lf-slate); background: color-mix(in srgb, var(--lf-slate) 10%, transparent); }
.mod-item[data-ev-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .ev-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .ev-kbd-hint { display: none; } .ev-instant { padding: 9px 11px; } .ev-status-chip { display: none; } }
</style>
<script>
(function () {
  'use strict';
  /* session260 — ev260 তাৎক্ষণিক-ফিল্টার (no259/pr258/tr257-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __evQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.mod-item[data-ev-row]'));
  var input = document.getElementById('evFilter260');
  var clearBtn = document.getElementById('evClear260');
  var countChip = document.getElementById('evCount260');
  var zeroBox = document.getElementById('evZero260');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function evApply260() {
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
  function evClear260() {
    input.value = '';
    evApply260();
    input.blur();
  }
  input.addEventListener('input', evApply260);
  if (clearBtn) { clearBtn.addEventListener('click', evClear260); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); evClear260(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__evQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: evApply260,
    clear: evClear260
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
print("OK: ev260 প্রয়োগ-সম্পন্ন (ফিল্টার-বার + শূন্য-অবস্থা + data-kw-সারি + স্ট্যাটাস-চিপ + স্টাইল + __evQA)")
