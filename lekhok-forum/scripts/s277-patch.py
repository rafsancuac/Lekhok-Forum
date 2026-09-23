#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s277-patch.py — session277: /admin/events তাৎক্ষণিক-ফিল্টার ev277 (s276/an276-প্যাটার্ন-মিরর)
# চুক্তি: skip-if-present idempotent; in-memory-সম্পাদনা → assert → write (প্যাচ-নিরাপত্তা-চুক্তি);
#         .ev277- নেমস্পেস-গার্ড (view+admin.css+tokens.css); হেক্স-শূন্য-স্টাইল-পোস্ট-অ্যাসার্ট;
#         প্রি/পোস্ট-সংরক্ষণ-অ্যাসার্ট (bulk-bar/formactions/thead/empty-branch/display-cells অক্ষুণ্ণ)
import re, sys, io

VIEW = "admin/views/admin/events/list.ejs"
CSS_FILES = ["public/assets/css/admin.css", "public/assets/css/tokens.css"]

src = io.open(VIEW, encoding="utf-8").read()

# ── skip-if-present (idempotent) ──
if "ev277" in src:
    print("SKIP: ev277 already present — idempotent no-op")
    sys.exit(0)

def count(hay, needle):
    return hay.count(needle)

# ── pre-asserts (অ্যাসার্ট-লেখার-আগে-সম্পাদনা-প্রভাব-মানচিত্র) ──
pre = {
    'bulk-bar-form': count(src, 'action="/admin/events/bulk-delete"'),
    'bulk-toggle-publish': count(src, 'formaction="/admin/events/bulk-toggle"'),
    'forEach': count(src, "events.forEach(e => {"),
    'close-form': count(src, "</form>"),
    'thead': count(src, "<thead>"),
    'empty-branch': count(src, "কোনো ইভেন্ট নেই"),
    'display-title': count(src, "<td><strong><%= e.title %></strong></td>"),
    'display-date': count(src, "<td><%= e.date || '—' %></td>"),
    'display-location': count(src, "<td><%= e.location || '—' %></td>"),
    'edit-link': count(src, '/edit" class="btn btn-primary btn-sm">সম্পাদনা</a>'),
    'delete-form': count(src, '?_method=DELETE" style="display:inline;"'),
    'close-body': count(src, "</body>"),
    'icons-fa-filter': count(src, "fa-filter"),
    'icons-fa-times': count(src, "fa-times"),
    'icons-fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kw-marker': count(src, "data-kw="),
    'ev-marker': count(src, "data-ev-row"),
}
assert pre['bulk-bar-form'] == 1, "bulk-delete form count unexpected: %s" % pre
assert pre['bulk-toggle-publish'] == 2, "bulk-toggle formactions expected 2: %s" % pre
assert pre['forEach'] == 1, "events.forEach unexpected: %s" % pre
assert pre['close-form'] == 2, "</form> expected 2 (bulk-bar + per-row delete): %s" % pre
assert pre['thead'] == 1, "thead unexpected: %s" % pre
assert pre['empty-branch'] == 1, "empty-branch unexpected: %s" % pre
assert pre['display-title'] == 1 and pre['display-date'] == 1 and pre['display-location'] == 1, "display-cells unexpected: %s" % pre
assert pre['edit-link'] == 1 and pre['delete-form'] == 1, "row-actions unexpected: %s" % pre
assert pre['close-body'] == 1, "</body> unexpected: %s" % pre
assert pre['icons-fa-filter'] == 0 and pre['icons-fa-times'] == 0 and pre['icons-fa-circle-xmark'] == 0, "icon-collision (s271-গোটচা): %s" % pre
assert pre['kw-marker'] == 0 and pre['ev-marker'] == 0, "ev277 markers pre-existing: %s" % pre

# ── নেমস্পেস-গার্ড (.ev277- প্রি-যাচাই — view + শেয়ার্ড-css) ──
assert re.search(r"\.ev277-[a-z]", src) is None, ".ev277- prefix already in view"
for cssf in CSS_FILES:
    css = io.open(cssf, encoding="utf-8").read()
    assert re.search(r"\.ev277-[a-z]", css) is None, ".ev277- prefix collision in " + cssf

# ── সম্পাদনা ১: ফিল্টার-স্ট্রিপ (bulk-bar-এর পরে) ──
STRIP_ANCHOR = '</form>\n  <% if (events.length === 0) { %>'
STRIP_NEW = '''</form>
  <%# ── session277 — ev277 তাৎক্ষণিক-ফিল্টার (s276/s275-প্যাটার্ন-মিরর; একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা) ── %>
  <div class="ev277-instant" id="evInstant277">
    <i class="fas fa-filter ev277-ico" aria-hidden="true"></i>
    <input type="text" id="evFilter277" class="ev277-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / তারিখ / স্থান" autocomplete="off" aria-label="ইভেন্ট-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="evClear277" class="ev277-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="ev277-count-chip" id="evCount277" hidden></span>
    <span class="ev277-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (events.length === 0) { %>'''
assert count(src, STRIP_ANCHOR) == 1, "strip-anchor not unique"
src = src.replace(STRIP_ANCHOR, STRIP_NEW)

# ── সম্পাদনা ২: সারি-সারফেস (forEach → (e, evI277) + kw + data-ev-row) ──
ROW_ANCHOR = '''      <% events.forEach(e => { %>
        <tr>'''
ROW_NEW = '''      <% events.forEach((e, evI277) => { %>
        <%# session277 — ev277 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড; featured-মান-অ্যালায়াস s273-চুক্তি) %>
        <% const evKw277 = [
             '#' + e.id,
             'ইভেন্ট event',
             'শিরোনাম title', String(e.title || '').replace(/\\s+/g, ' '),
             'তারিখ date', String(e.date || '').replace(/\\s+/g, ' '),
             'স্থান location', String(e.location || '').replace(/\\s+/g, ' '),
             e.featured ? 'বিশেষ featured' : 'সাধারণ normal',
             'সম্পাদনা edit',
             'মুছুন delete'
           ].filter(Boolean).join(' '); %>
        <tr data-ev-row="<%= evI277 %>" data-kw="<%= evKw277 %>">'''
assert count(src, ROW_ANCHOR) == 1, "row-anchor not unique"
src = src.replace(ROW_ANCHOR, ROW_NEW)

# ── সম্পাদনা ৩: শূন্য-অবস্থা (টেবিল-ব্রাঞ্চ-বন্ধের পরে, admin-main-বন্ধের আগে) ──
ZERO_ANCHOR = '''  <% } %>
</div>
</body>'''
ZERO_NEW = '''  <% } %>
  <div class="ev277-zero" id="evZero277" data-ev-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো ইভেন্ট মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
<script>
  (function () {
    /* session277 — ev277 তাৎক্ষণিক-ফিল্টার (s276/an276-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __evQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; tr-সারফেস: tr[data-ev-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-ev-row]'));
    var input = document.getElementById('evFilter277');
    var clearBtn = document.getElementById('evClear277');
    var countChip = document.getElementById('evCount277');
    var zeroBox = document.getElementById('evZero277');
    if (!input) { return; }
    var total = rows.length;
    function evApply277() {
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
    function evClearFn277() {
      input.value = '';
      evApply277();
      input.blur();
    }
    input.addEventListener('input', evApply277);
    if (clearBtn) { clearBtn.addEventListener('click', evClearFn277); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); evClearFn277(); }
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
      apply: evApply277,
      clear: evClearFn277
    };
  })();
</script>
<style>
    /* session277 — ev277 তাৎক্ষণিক-ফিল্টার স্টাইল (s276-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */
    .ev277-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .ev277-ico { color: var(--lf-brandgreen); opacity: .75; }
    .ev277-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .ev277-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .ev277-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .ev277-clear:hover { background: var(--lf-brandgreen-soft); }
    .ev277-clear:active { transform: scale(.96); }
    .ev277-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .ev277-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .ev277-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .ev277-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .ev277-count-chip[hidden] { display: none; }
    .ev277-zero[hidden] { display: none; }
    tr[data-ev-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .ev277-clear:active { transform: none; } }
    @media (max-width: 640px) { .ev277-kbd-hint { display: none; } .ev277-instant { padding: 9px 11px; } }
  </style>
</body>'''
assert count(src, ZERO_ANCHOR) == 1, "zero-anchor not unique"
src = src.replace(ZERO_ANCHOR, ZERO_NEW)

# ── post-asserts (ফাইল-লেখার-আগে) ──
post = {
    'ev277-total': count(src, "ev277"),
    'kw-marker': count(src, "data-kw="),
    'ev-marker': count(src, "data-ev-row="),
    'ev-row-template': count(src, "data-ev-row"),
    'filter-input': count(src, 'id="evFilter277"'),
    'clear-btn': count(src, 'id="evClear277"'),
    'count-chip': count(src, 'id="evCount277"'),
    'zero-box': count(src, 'id="evZero277"'),
    'qa-hook': count(src, "window.__evQA"),
    'apply-fn': count(src, "function evApply277"),
    'fa-filter': count(src, 'fas fa-filter ev277-ico'),
    'fa-times': count(src, 'fas fa-times"></i>'),
    'fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kbd-hint': count(src, "<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন"),
    'hidden-guard-row': count(src, "tr[data-ev-row][hidden] { display: none !important; }"),
    'hidden-guard-chip': count(src, ".ev277-count-chip[hidden] { display: none; }"),
    'hidden-guard-zero': count(src, ".ev277-zero[hidden] { display: none; }"),
    'bulk-delete-kept': count(src, 'action="/admin/events/bulk-delete"'),
    'bulk-toggle-kept': count(src, 'formaction="/admin/events/bulk-toggle"'),
    'title-cell-kept': count(src, "<td><strong><%= e.title %></strong></td>"),
    'edit-kept': count(src, "সম্পাদনা"),
    'delete-kept': count(src, "মুছুন"),
    'empty-kept': count(src, "কোনো ইভেন্ট নেই"),
}
assert post['kw-marker'] == 1 and post['ev-marker'] == 1, "row-surface markers expected 1 each (template-level): %s" % post
assert post['filter-input'] == 1 and post['clear-btn'] == 1 and post['count-chip'] == 1 and post['zero-box'] == 1, "strip ids: %s" % post
assert post['qa-hook'] == 1 and post['apply-fn'] == 1, "hook: %s" % post
assert post['fa-filter'] == 1 and post['fa-times'] == 1 and post['fa-circle-xmark'] == 1, "icon ×1-each (s271/s275-গোটচা): %s" % post
assert post['hidden-guard-row'] == 1 and post['hidden-guard-chip'] == 1 and post['hidden-guard-zero'] == 1, "hidden-guards ×3: %s" % post
assert post['bulk-delete-kept'] == 1 and post['bulk-toggle-kept'] == 2, "bulk-bar regression: %s" % post
assert post['title-cell-kept'] == 1 and post['edit-kept'] >= 1 and post['delete-kept'] >= 2 and post['empty-kept'] == 1, "display regression: %s" % post
assert post['kbd-hint'] == 1, "kbd-hint: %s" % post

# স্টাইল-ব্লক হেক্স-শূন্য-অ্যাসার্ট (শুধু নতুন-যোগ-স্টাইল-অংশ)
style_part = src.split("<style>", 1)[1].split("</style>", 1)[0]
hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", style_part)
assert not hexes, "hex in ev277 style block: %s" % hexes
for tok in ["--lf-brandgreen", "--lf-brandgreen-deep", "--lf-brandgreen-soft", "--lf-brandgreen-soft-2", "--lf-fb-border", "--lf-white", "--lf-slate"]:
    assert tok in style_part, "token missing in style: " + tok

io.open(VIEW, "w", encoding="utf-8").write(src)
print("OK: ev277 patch applied —", post['ev277-total'], "ev277-occurrences")
