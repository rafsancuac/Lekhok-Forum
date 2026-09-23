#!/usr/bin/env python3
# s258-patch.py — session258: পত্রিকা-কাটিং (/moderator/press) তাৎক্ষণিক-ফিল্টার (pr258)
# চুক্তি: tr257/cu256-প্যাটার্ন-মিরর — data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + __prQA হুক
# স্টাইল: pr258-ব্লক হেক্স-শূন্য টোকেন-শুধু (guard-র্যাচেট-নিরাপদ) + [hidden]-গার্ড-জোড়া ×২ (চিপ+শূন্য-বক্স — session256-শিক্ষা) + সারি-hidden-গার্ড
# নো-রিগ্রেশন: bulk-bar (bulk-delete/bulk-toggle) + যোগ-ফর্ম (multipart) + clip-count + সম্পাদনা sf-section সম্পূর্ণ অক্ষুণ্ণ
import sys, io

VIEW = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/moderator-press.ejs"

with io.open(VIEW, "r", encoding="utf-8") as f:
    src = f.read()

if "data-pr-row" in src:
    print("SKIP: pr258 already present (idempotent)")
    sys.exit(0)

edits = []

# ── এডিট-১: খালি-নোটিশ-পরে ফিল্টার-বার + শূন্য-অবস্থা + forEach-সূচক + data-kw কনস্ট ──
old1 = """    <% if (!clips.length) { %><p class="mod-hint"><i class="fas fa-info-circle"></i> এখনো কোনো কাটিং যোগ করা হয়নি।</p><% } %>
    <% clips.forEach(c => { %>
      <details class="clip-row">"""
new1 = """    <% if (!clips.length) { %><p class="mod-hint"><i class="fas fa-info-circle"></i> এখনো কোনো কাটিং যোগ করা হয়নি।</p><% } %>

    <div class="pr-instant" id="prInstant258">
      <i class="fas fa-filter pr-instant-ico" aria-hidden="true"></i>
      <input type="text" id="prFilter258" class="pr-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / পত্রিকা / তারিখ / অবস্থা" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="prClear258" class="pr-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="pr-count-chip" id="prCount258" hidden></span>
      <span class="pr-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
    </div>
    <div class="pr-zero" id="prZero258" data-pr-empty hidden>
      <i class="fas fa-images" aria-hidden="true"></i>
      <span>কোনো কাটিং মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
    <% clips.forEach((c, prI258) => {
         const prKw258 = ['#' + c.id, (c.title || ''), (c.paper_name || ''), (c.published_date || ''), (c.is_active ? 'দৃশ্যমান' : 'লুকানো'), 'ক্রম' + String(c.sort_order == null ? '' : c.sort_order), (c.image_url || '')].filter(Boolean).join(' ');
    %>
      <details class="clip-row" data-pr-row="<%= prI258 %>" data-kw="<%= prKw258 %>">"""
edits.append((old1, new1))

# ── এডিট-২: premium.js-include-পরে স্টাইল-ব্লক + স্ক্রিপ্ট-ব্লক (</body>-আগে) ──
old2 = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
</body>"""
new2 = """  <script src="/assets/js/premium.js?v=<%= AV %>"></script>
<style>
/* session258 — পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার (pr258 — হেক্স-শূন্য টোকেন-শুধু; tr257/cu256-মিরর) */
.pr-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.pr-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.pr-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.pr-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.pr-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.pr-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.pr-instant-clear:active { transform: scale(.96); }
.pr-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.pr-count-chip[hidden] { display: none; }
.pr-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.pr-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.pr-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.pr-zero[hidden] { display: none; }
.clip-row[data-pr-row][hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { .pr-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .pr-kbd-hint { display: none; } .pr-instant { padding: 9px 11px; } }
</style>
<script>
(function () {
  'use strict';
  /* session258 — pr258 তাৎক্ষণিক-ফিল্টার (tr257/cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __prQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('details.clip-row[data-pr-row]'));
  var input = document.getElementById('prFilter258');
  var clearBtn = document.getElementById('prClear258');
  var countChip = document.getElementById('prCount258');
  var zeroBox = document.getElementById('prZero258');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function prApply258() {
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
  function prClear258() {
    input.value = '';
    prApply258();
    input.blur();
  }
  input.addEventListener('input', prApply258);
  if (clearBtn) { clearBtn.addEventListener('click', prClear258); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); prClear258(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__prQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: prApply258,
    clear: prClear258
  };
})();
</script>
</body>"""
edits.append((old2, new2))

# ── প্রয়োগ (session255-শিক্ষা: প্রতিটি-এডিট আলাদা-যাচাই; আংশিক-প্রয়োগ-হলে স্পষ্ট-ব্যর্থতা) ──
out = src
applied = 0
for i, (o, n) in enumerate(edits, 1):
    if out.count(o) != 1:
        print(f"FAIL: এডিট-{i} anchor অদ্বিতীয় নয় (count={out.count(o)}) — প্যাচ-বাতিল")
        sys.exit(1)
    out = out.replace(o, n)
    applied += 1

with io.open(VIEW, "w", encoding="utf-8") as f:
    f.write(out)

# ── প্যাচ-পরে প্রতি-টার্গেট-ইনভেন্টরি (session255-গোটচা-প্রতিরোধ) ──
checks = {
    "prFilter258": 1, "prClear258": 1, "prCount258": 1, "prZero258": 1,
    "data-pr-row": 1, "data-kw=\"<%= prKw258 %>\"": 1, "__prQA": 1,
    "data-pr-empty": 1, "prI258": 1, "prKw258": 2,
    "pr-count-chip[hidden]": 1, "pr-zero[hidden]": 1, "clip-row[data-pr-row][hidden]": 1,
    "bulkBar": 1, "data-bulk-all": 1,
}
bad = {k: out.count(k) for k, want in checks.items() if out.count(k) != want}
if bad:
    print(f"WARN: ইনভেন্টরি-বিচ্যুতি: {bad}")
else:
    print(f"OK: pr258 প্রয়োগ ({applied} এডিট) — ইনভেন্টরি-সব-মিল ({len(checks)} মার্কার)")
