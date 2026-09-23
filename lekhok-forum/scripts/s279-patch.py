#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s279-patch.py — session279: /admin/resources তাৎক্ষণিক-ফিল্টার arl279 (s278/aml278-প্যাটার্ন-মিরর)
# চুক্তি: skip-if-present idempotent; in-memory-সম্পাদনা → assert → write (প্যাচ-নিরাপত্তা-চুক্তি);
#         .arl279- নেমস্পেস-গার্ড (view+admin.css+tokens.css); হেক্স-শূন্য-স্টাইল-পোস্ট-অ্যাসার্ট;
#         প্রি/পোস্ট-সংরক্ষণ-অ্যাসার্ট (bulk-bar/seriesStats/bulk-modal-include/thead/empty-branch অক্ষুণ্ণ);
#         [hidden]-বাইট-নিরাপত্তা: HDR = '['+'hidden'+']' কনক্যাট-নির্মিত (transport-ম্যাংল-প্রমাণ) + পোস্ট-অ্যাসার্ট
import re, sys, io

VIEW = "admin/views/admin/resources/list.ejs"
CSS_FILES = ["public/assets/css/admin.css", "public/assets/css/tokens.css"]
HDR = "[" + "hidden" + "]"  # transport-mangle-proof [hidden] literal

src = io.open(VIEW, encoding="utf-8").read()

# ── skip-if-present (idempotent) ──
if "arl279" in src:
    print("SKIP: arl279 already present — idempotent no-op")
    sys.exit(0)

def count(hay, needle):
    return hay.count(needle)

# ── pre-asserts (অ্যাসার্ট-লেখার-আগে-সম্পাদনা-প্রভাব-মানচিত্র) ──
pre = {
    'bulk-bar-form': count(src, 'action="/admin/resources/bulk-delete"'),
    'bulk-msg': count(src, 'data-bulk-msg="'),
    'bulk-all': count(src, "data-bulk-all"),
    'forEach': count(src, "resources.forEach(r => {"),
    'close-form': count(src, "</form>"),
    'thead': count(src, "<thead>"),
    'empty-branch': count(src, "কোনো রিসোর্স নেই"),
    'edit-link': count(src, '/edit" class="btn btn-primary btn-sm">সম্পাদনা</a>'),
    'delete-form': count(src, '?_method=DELETE" style="display:inline;"'),
    'close-body': count(src, "</body>"),
    'icons-fa-filter': count(src, "fa-filter"),
    'icons-fa-times': count(src, "fa-times"),
    'icons-fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kw-marker': count(src, "data-kw="),
    'arl-marker': count(src, "data-arl-row"),
    'script-open': count(src, "<script>"),
    'script-close': count(src, "</script>"),
    'rss-grid': count(src, "rss-grid"),
    'bulk-include': count(src, "rsxOpenBulkImport"),
    'norm-type': count(src, "RES_TYPE_META.normalizeResType(r)"),
    'hdr-literal': count(src, HDR),
}
assert pre['bulk-bar-form'] == 1, "bulk-delete form count unexpected: %s" % pre
assert pre['bulk-msg'] == 1, "bulk-msg expected 1: %s" % pre
assert pre['bulk-all'] == 1, "data-bulk-all expected 1: %s" % pre
assert pre['forEach'] == 1, "resources.forEach unexpected: %s" % pre
assert pre['close-form'] == 2, "</form> expected 2 (bulk-bar + per-row delete): %s" % pre
assert pre['thead'] == 1, "thead unexpected: %s" % pre
assert pre['empty-branch'] == 1, "empty-branch unexpected: %s" % pre
assert pre['edit-link'] == 1 and pre['delete-form'] == 1, "row-actions unexpected: %s" % pre
assert pre['close-body'] == 1, "</body> unexpected: %s" % pre
assert pre['icons-fa-filter'] == 0 and pre['icons-fa-circle-xmark'] == 0 and pre['icons-fa-times'] == 0, "icon-collision (s271-গোটচা): %s" % pre
assert pre['kw-marker'] == 0 and pre['arl-marker'] == 0, "arl279 markers pre-existing: %s" % pre
assert pre['script-open'] == 2 and pre['script-close'] == 2, "script blocks pre: %s" % pre
assert pre['rss-grid'] >= 2, "seriesStats surface missing: %s" % pre
assert pre['bulk-include'] == 1, "bulk-modal include missing: %s" % pre
assert pre['norm-type'] == 1, "normalizeResType unexpected: %s" % pre
assert pre['hdr-literal'] == 0, "unexpected [hidden] literal pre-existing: %s" % pre

# ── নেমস্পেস-গার্ড (.arl279- প্রি-যাচাই — view + শেয়ার্ড-css; s273-গোটচা-প্রথা) ──
assert re.search(r"\.arl279-[a-z]", src) is None, ".arl279- prefix already in view"
assert re.search(r"data-arl-row", src) is None, "data-arl-row pre-existing in view"
for cssf in CSS_FILES:
    css = io.open(cssf, encoding="utf-8").read()
    assert re.search(r"\.arl279-[a-z]", css) is None, ".arl279- prefix collision in " + cssf

# ── সম্পাদনা ১: ফিল্টার-স্ট্রিপ (bulk-bar-</form>-এর পরে, empty-if-এর আগে — always-rendered) ──
STRIP_ANCHOR = '</form>\n  <% if (resources.length === 0) { %>'
STRIP_NEW = '''</form>
  <%# ── session279 — arl279 তাৎক্ষণিক-ফিল্টার (s278/aml278-প্যাটার্ন-মিরর; একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা; ক্লায়েন্ট-সাইড অনুসন্ধান — GET-ফিল্টার-বার-বিহীন-সারফেস) ── %>
  <div class="arl279-instant" id="arlInstant279">
    <i class="fas fa-filter arl279-ico" aria-hidden="true"></i>
    <input type="text" id="arlFilter279" class="arl279-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ধরন / ক্যাটাগরি / আইডি" autocomplete="off" aria-label="রিসোর্স-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="arlClear279" class="arl279-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="arl279-count-chip" id="arlCount279" hidden></span>
    <span class="arl279-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (resources.length === 0) { %>'''
assert count(src, STRIP_ANCHOR) == 1, "strip-anchor not unique"
src = src.replace(STRIP_ANCHOR, STRIP_NEW)

# ── সম্পাদনা ২: সারি-সারফেস (forEach → (r, arlI279) + kw + data-arl-row) ──
ROW_ANCHOR = '''      <% resources.forEach(r => { var _rt = RES_TYPE_META.RES_TYPES[RES_TYPE_META.normalizeResType(r)]; %>
        <tr>'''
ROW_NEW = '''      <% resources.forEach((r, arlI279) => { var _rt = RES_TYPE_META.RES_TYPES[RES_TYPE_META.normalizeResType(r)]; %>
        <%# session279 — arl279 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড ×৪; ধরন-মান-অ্যালায়াস short+label s273-চুক্তি) %>
        <% const arlKw279 = [
             '#' + r.id,
             'রিসোর্স resource',
             'শিরোনাম title', String(r.title || '').replace(/\\s+/g, ' '),
             'ধরন type', String(_rt.short || '').replace(/\\s+/g, ' '), String(_rt.label || ''),
             'ক্যাটাগরি category', String(r.category || '').replace(/\\s+/g, ' '),
             r.file_url ? 'ফাইল file ' + String(r.file_url).replace(/\\s+/g, ' ') : 'লিংক link',
             'ভিউ view ' + (r.views || 0),
             'ডাউনলোড download ' + (r.downloads || 0),
             'সম্পাদনা edit',
             'মুছুন delete'
           ].filter(Boolean).join(' '); %>
        <tr data-arl-row="<%= arlI279 %>" data-kw="<%= arlKw279 %>">'''
assert count(src, ROW_ANCHOR) == 1, "row-anchor not unique"
src = src.replace(ROW_ANCHOR, ROW_NEW)

# ── সম্পাদনা ৩: শূন্য-অবস্থা + স্ক্রিপ্ট + স্টাইল (টেবিল-ব্রাঞ্চ-বন্ধের পরে, modal-include-কমেন্টের আগে) ──
ZERO_ANCHOR = '''  </table>
  <% } %>
</div>
<%# সেশন ১১৬'''
ZERO_NEW = '''  </table>
  <% } %>
  <div class="arl279-zero" id="arlZero279" data-arl-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো রিসোর্স মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
<script>
  (function () {
    /* session279 — arl279 তাৎক্ষণিক-ফিল্টার (s278/aml278-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড (bulk_ids-INPUT + rbmCsv-TEXTAREA — মোডাল-অংশ) + Escape + __arlQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; tr-সারফেস: tr[data-arl-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-arl-row]'));
    var input = document.getElementById('arlFilter279');
    var clearBtn = document.getElementById('arlClear279');
    var countChip = document.getElementById('arlCount279');
    var zeroBox = document.getElementById('arlZero279');
    if (!input) { return; }
    var total = rows.length;
    function arlApply279() {
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
    function arlClearFn279() {
      input.value = '';
      arlApply279();
      input.blur();
    }
    input.addEventListener('input', arlApply279);
    if (clearBtn) { clearBtn.addEventListener('click', arlClearFn279); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); arlClearFn279(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__arlQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: arlApply279,
      clear: arlClearFn279
    };
  })();
</script>
<style>
    /* session279 — arl279 তাৎক্ষণিক-ফিল্টার স্টাইল (s278-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */
    .arl279-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .arl279-ico { color: var(--lf-brandgreen); opacity: .75; }
    .arl279-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .arl279-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .arl279-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .arl279-clear:hover { background: var(--lf-brandgreen-soft); }
    .arl279-clear:active { transform: scale(.96); }
    .arl279-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .arl279-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .arl279-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .arl279-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .arl279-count-chip'''+HDR+''' { display: none; }
    .arl279-zero'''+HDR+''' { display: none; }
    tr[data-arl-row]'''+HDR+''' { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .arl279-clear:active { transform: none; } }
    @media (max-width: 640px) { .arl279-kbd-hint { display: none; } .arl279-instant { padding: 9px 11px; } }
  </style>
<%# সেশন ১১৬'''
assert count(src, ZERO_ANCHOR) == 1, "zero-anchor not unique"
src = src.replace(ZERO_ANCHOR, ZERO_NEW)

# ── post-asserts (ফাইল-লেখার-আগে) ──
post = {
    'arl279-total': count(src, "arl279"),
    'kw-marker': count(src, "data-kw="),
    'arl-row-attr': count(src, 'data-arl-row="<%= arlI279 %>"'),
    'arl-row-any': count(src, "data-arl-row"),
    'filter-input': count(src, 'id="arlFilter279"'),
    'clear-btn': count(src, 'id="arlClear279"'),
    'count-chip': count(src, 'id="arlCount279"'),
    'zero-box': count(src, 'id="arlZero279"'),
    'qa-hook': count(src, "window.__arlQA"),
    'apply-fn': count(src, "function arlApply279"),
    'clear-fn': count(src, "function arlClearFn279"),
    'fa-filter': count(src, 'fas fa-filter arl279-ico'),
    'fa-times': count(src, "fa-times"),
    'fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kbd-hint': count(src, "<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন"),
    'kw-comment': count(src, "arl279 দ্বিভাষিক data-kw"),
    'kw-join': count(src, "].filter(Boolean).join(' ');"),
    'norm-replace': count(src, "replace(/\\s+/g, ' ')"),
    'type-alias-kept': count(src, "RES_TYPE_META.normalizeResType(r)"),
    'hidden-guard-row': count(src, "tr[data-arl-row]" + HDR + " { display: none !important; }"),
    'hidden-guard-chip': count(src, ".arl279-count-chip" + HDR + " { display: none; }"),
    'hidden-guard-zero': count(src, ".arl279-zero" + HDR + " { display: none; }"),
    'bulk-delete-kept': count(src, 'action="/admin/resources/bulk-delete"'),
    'bulk-msg-kept': count(src, 'data-bulk-msg="'),
    'bulk-all-kept': count(src, "data-bulk-all"),
    'close-form-kept': count(src, "</form>"),
    'edit-kept': count(src, "সম্পাদনা"),
    'delete-kept': count(src, "মুছুন"),
    'empty-kept': count(src, "কোনো রিসোর্স নেই"),
    'script-open': count(src, "<script>"),
    'script-close': count(src, "</script>"),
    'rss-grid-kept': count(src, "rss-grid"),
    'bulk-include-kept': count(src, "rsxOpenBulkImport"),
}
assert post['kw-marker'] == 1 and post['arl-row-attr'] == 1, "row-surface markers expected 1 each (template-level): %s" % post
assert post['filter-input'] == 1 and post['clear-btn'] == 1 and post['count-chip'] == 1 and post['zero-box'] == 1, "strip ids: %s" % post
assert post['qa-hook'] == 1 and post['apply-fn'] == 1 and post['clear-fn'] == 1, "hook: %s" % post
assert post['fa-filter'] == 1 and post['fa-times'] == 1 and post['fa-circle-xmark'] == 1, "icon counts: %s" % post
assert post['kbd-hint'] == 1, "kbd-hint: %s" % post
assert post['kw-comment'] == 1 and post['kw-join'] == 1, "kw-block: %s" % post
assert post['norm-replace'] == 4, "kw হোয়াইটস্পেস-নরমালাইজ ×৪ (title+short+category+file_url): %s" % post
assert post['type-alias-kept'] == 1, "normalizeResType regression: %s" % post
assert post['hidden-guard-row'] == 1 and post['hidden-guard-chip'] == 1 and post['hidden-guard-zero'] == 1, "hidden-guards ×3 (সঠিক-বাইট): %s" % post
assert post['bulk-delete-kept'] == 1 and post['bulk-msg-kept'] == 1 and post['bulk-all-kept'] == 1, "bulk-bar regression: %s" % post
assert post['close-form-kept'] == 2, "</form> post expected 2 (নতুন-কোনো-form-নেই): %s" % post
assert post['edit-kept'] == 2 and post['delete-kept'] >= 3 and post['empty-kept'] == 1, "display regression: %s" % post
assert post['script-open'] == 3 and post['script-close'] == 3, "script blocks post: %s" % post
assert post['rss-grid-kept'] >= 2, "seriesStats regression: %s" % post
assert post['bulk-include-kept'] == 1, "bulk-modal include regression: %s" % post

# স্টাইল-ব্লক হেক্স-শূন্য-অ্যাসার্ট (শুধু নতুন-যোগ-স্টাইল-অংশ)
style_part = src.split("session279 — arl279 তাৎক্ষণিক-ফিল্টার স্টাইল", 1)[1].split("</style>", 1)[0]
hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", style_part)
assert not hexes, "hex in arl279 style block: %s" % hexes
for tok in ["--lf-brandgreen", "--lf-brandgreen-deep", "--lf-brandgreen-soft", "--lf-brandgreen-soft-2", "--lf-fb-border", "--lf-white", "--lf-slate"]:
    assert tok in style_part, "token missing in style: " + tok

# [hidden]-বাইট-স্বাস্থ্য-চূড়ান্ত-প্রমাণ: ম্যাংলড-রূপ শূন্য হতে-হবে
assert count(src, "chip" + HDR) == 1, "chip[hidden] exact byte"
assert count(src, "dden] { display") == 3, "hidden-guard display decls ×3"

io.open(VIEW, "w", encoding="utf-8").write(src)
print("OK: arl279 patch applied —", post['arl279-total'], "arl279-occurrences")
