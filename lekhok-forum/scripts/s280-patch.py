#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s280-patch.py — session280: /admin/gallery তাৎক্ষণিক-ফিল্টার agl280 (s279/arl279-প্যাটার্ন-মিরর; কার্ড-সারফেস — s274-কার্ড-চুক্তি)
# চুক্তি: skip-if-present idempotent; in-memory-সম্পাদনা → assert → write (প্যাচ-নিরাপত্তা-চুক্তি);
#         .agl280- নেমস্পেস-গার্ড (view+admin.css+tokens.css); হেক্স-শূন্য-স্টাইল-পোস্ট-অ্যাসার্ট;
#         প্রি/পোস্ট-সংরক্ষণ-অ্যাসার্ট (bulk-bar/data-bulk-msg/img/forEach/empty-শাখা/অ্যাকশন অক্ষুণ্ণ);
#         কার্ড-সারফেস: div[data-agl-row] — tr-অনুমান-নিষিদ্ধ (s274-চুক্তি);
#         idden]-বাইট-নিরাপত্তা: HDR = '['+'hidden'+']' কনক্যাট-নির্মিত (transport-ম্যাংল-প্রমাণ) + পোস্ট-অ্যাসার্ট
import re, sys, io

VIEW = "admin/views/admin/gallery/list.ejs"
CSS_FILES = ["public/assets/css/admin.css", "public/assets/css/tokens.css"]
HDR = "[" + "hidden" + "]"  # transport-mangle-proof idden] literal

src = io.open(VIEW, encoding="utf-8").read()

# ── skip-if-present (idempotent) ──
if "agl280" in src:
    print("SKIP: agl280 already present — idempotent no-op")
    sys.exit(0)

def count(hay, needle):
    return hay.count(needle)

# ── pre-asserts (অ্যাসার্ট-লেখার-আগে-সম্পাদনা-প্রভাব-মানচিত্র) ──
pre = {
    'bulk-bar-form': count(src, 'action="/admin/gallery/bulk-delete"'),
    'bulk-msg': count(src, 'data-bulk-msg="'),
    'forEach': count(src, "items.forEach(g => {"),
    'card-div': count(src, '<div class="card" style="padding:8px; position:relative;">'),
    'close-form': count(src, "</form>"),
    'img-tag': count(src, '<img src="<%= g.image_url %>"'),
    'caption-p': count(src, '<p style="color:#666; font-size:0.85rem; min-height:30px;"><%= g.caption || \'\' %></p>'),
    'empty-branch': count(src, "কোনো ছবি নেই"),
    'edit-link': count(src, '/edit" class="btn btn-primary btn-sm">সম্পাদনা</a>'),
    'delete-form': count(src, '?_method=DELETE" style="display:inline;"'),
    'close-body': count(src, "</body>"),
    'icons-fa-filter': count(src, "fa-filter"),
    'icons-fa-times': count(src, "fa-times"),
    'icons-fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'icons-fa-tag': count(src, "fa-tag"),
    'kw-marker': count(src, "data-kw="),
    'agl-marker': count(src, "data-agl-row"),
    'script-open': count(src, "<script>"),
    'script-close': count(src, "</script>"),
    'grid-div': count(src, "repeat(auto-fill, minmax(220px, 1fr))"),
    'hdr-literal': count(src, HDR),
}
assert pre['bulk-bar-form'] == 1, "bulk-delete form count unexpected: %s" % pre
assert pre['bulk-msg'] == 1, "bulk-msg expected 1: %s" % pre
assert pre['forEach'] == 1, "items.forEach unexpected: %s" % pre
assert pre['card-div'] == 1, "card-div unexpected: %s" % pre
assert pre['close-form'] == 2, "</form> expected 2 (bulk-bar + per-card delete): %s" % pre
assert pre['img-tag'] == 1, "img-tag unexpected: %s" % pre
assert pre['caption-p'] == 1, "caption-p unexpected: %s" % pre
assert pre['empty-branch'] == 1, "empty-branch unexpected: %s" % pre
assert pre['edit-link'] == 1 and pre['delete-form'] == 1, "row-actions unexpected: %s" % pre
assert pre['close-body'] == 1, "</body> unexpected: %s" % pre
assert pre['icons-fa-filter'] == 0 and pre['icons-fa-circle-xmark'] == 0 and pre['icons-fa-times'] == 0, "icon-collision (s271-গোটচা): %s" % pre
assert pre['icons-fa-tag'] == 0, "fa-tag collision: %s" % pre
assert pre['kw-marker'] == 0 and pre['agl-marker'] == 0, "agl280 markers pre-existing: %s" % pre
assert pre['script-open'] == 0 and pre['script-close'] == 0, "gallery view had no script blocks pre: %s" % pre
assert pre['grid-div'] == 1, "card-grid div missing: %s" % pre
assert pre['hdr-literal'] == 0, "unexpected idden] literal pre-existing: %s" % pre

# ── নেমস্পেস-গার্ড (.agl280- প্রি-যাচাই — view + শেয়ার্ড-css; s273-গোটচা-প্রথা) ──
assert re.search(r"\.agl280-[a-z]", src) is None, ".agl280- prefix already in view"
assert re.search(r"data-agl-row", src) is None, "data-agl-row pre-existing in view"
for cssf in CSS_FILES:
    css = io.open(cssf, encoding="utf-8").read()
    assert re.search(r"\.agl280-[a-z]", css) is None, ".agl280- prefix collision in " + cssf

# ── সম্পাদনা ১: ফিল্টার-স্ট্রিপ (admin-header-বন্ধের পরে, empty-if-এর আগে — always-rendered; s271-চুক্তি) ──
STRIP_ANCHOR = '</div>\n  <% if (items.length === 0) { %>'
STRIP_NEW = '''</div>
  <%# ── session280 — agl280 তাৎক্ষণিক-ফিল্টার (s279/arl279-প্যাটার্ন-মিরর; কার্ড-সারফেস — s274-কার্ড-চুক্তি; একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা; ক্লায়েন্ট-সাইড অনুসন্ধান — GET-ফিল্টার-বার-বিহীন-সারফেস) ── %>
  <div class="agl280-instant" id="aglInstant280">
    <i class="fas fa-filter agl280-ico" aria-hidden="true"></i>
    <input type="text" id="aglFilter280" class="agl280-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / ক্যাপশন / ক্যাটাগরি / আইডি" autocomplete="off" aria-label="গ্যালারি-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="aglClear280" class="agl280-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="agl280-count-chip" id="aglCount280" hidden></span>
    <span class="agl280-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (items.length === 0) { %>'''
assert count(src, STRIP_ANCHOR) == 1, "strip-anchor not unique"
src = src.replace(STRIP_ANCHOR, STRIP_NEW)

# ── সম্পাদনা ২: কার্ড-সারফেস (forEach → (g, aglI280) + kw + div[data-agl-row] — s274-কার্ড-চুক্তি: tr-অনুমান-নিষিদ্ধ) ──
ROW_ANCHOR = '''    <% items.forEach(g => { %>
      <div class="card" style="padding:8px; position:relative;">'''
ROW_NEW = '''    <% items.forEach((g, aglI280) => { %>
      <%# session280 — agl280 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড ×৪; image_url+title+caption+category) %>
      <% const aglKw280 = [
           '#' + g.id,
           'ছবি image', String(g.image_url || '').replace(/\\s+/g, ' '),
           'শিরোনাম title', String(g.title || '(শিরোনাম নেই)').replace(/\\s+/g, ' '),
           g.caption ? 'ক্যাপশন caption ' + String(g.caption).replace(/\\s+/g, ' ') : '',
           'ক্যাটাগরি category', String(g.category || 'general').replace(/\\s+/g, ' '),
           'সম্পাদনা edit',
           'মুছুন delete'
         ].filter(Boolean).join(' '); %>
      <div class="card" data-agl-row="<%= aglI280 %>" data-kw="<%= aglKw280 %>" style="padding:8px; position:relative;">'''
assert count(src, ROW_ANCHOR) == 1, "row-anchor not unique"
src = src.replace(ROW_ANCHOR, ROW_NEW)

# ── সম্পাদনা ৩: ক্যাটাগরি-চিপ (ক্যাপশন-p-এর পরে — kw 'ক্যাটাগরি category'-টোকেন সারফেস-সৎ [Mandatory-স্টাইল]) ──
CHIP_ANCHOR = "        <p style=\"color:#666; font-size:0.85rem; min-height:30px;\"><%= g.caption || '' %></p>"
CHIP_NEW = '''        <p style="color:#666; font-size:0.85rem; min-height:30px;"><%= g.caption || '' %></p>
        <span class="agl280-catchip"><i class="fas fa-tag" aria-hidden="true"></i> <%= g.category || 'general' %></span>'''
assert count(src, CHIP_ANCHOR) == 1, "chip-anchor not unique"
src = src.replace(CHIP_ANCHOR, CHIP_NEW)

# ── সম্পাদনা ৪: শূন্য-অবস্থা + স্ক্রিপ্ট + স্টাইল (else-শাখা-বন্ধের পরে, </body>-এর আগে — always-rendered) ──
ZERO_ANCHOR = '''    <% }) %>
  </div>
  <% } %>
</div>
</body>'''
ZERO_NEW = '''    <% }) %>
  </div>
  <% } %>
  <div class="agl280-zero" id="aglZero280" data-agl-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো ছবি মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
<script>
  (function () {
    /* session280 — agl280 তাৎক্ষণিক-ফিল্টার (s279/arl279-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড (bulk_ids-checkbox INPUT) + Escape + __aglQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; কার্ড-সারফেস s274-চুক্তি: div[data-agl-row]-hidden-গার্ড — tr-অনুমান-নিষিদ্ধ) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-agl-row]'));
    var input = document.getElementById('aglFilter280');
    var clearBtn = document.getElementById('aglClear280');
    var countChip = document.getElementById('aglCount280');
    var zeroBox = document.getElementById('aglZero280');
    if (!input) { return; }
    var total = rows.length;
    function aglApply280() {
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
    function aglClearFn280() {
      input.value = '';
      aglApply280();
      input.blur();
    }
    input.addEventListener('input', aglApply280);
    if (clearBtn) { clearBtn.addEventListener('click', aglClearFn280); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); aglClearFn280(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__aglQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: aglApply280,
      clear: aglClearFn280
    };
  })();
</script>
<style>
    /* session280 — agl280 তাৎক্ষণিক-ফিল্টার স্টাইল (s279-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */
    .agl280-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .agl280-ico { color: var(--lf-brandgreen); opacity: .75; }
    .agl280-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .agl280-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .agl280-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .agl280-clear:hover { background: var(--lf-brandgreen-soft); }
    .agl280-clear:active { transform: scale(.96); }
    .agl280-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .agl280-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .agl280-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .agl280-catchip { display: inline-flex; align-items: center; gap: 5px; margin: 2px 0 8px; padding: 2px 9px; border-radius: 999px; font-size: .68rem; font-weight: 700; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); border: 1px solid color-mix(in srgb, var(--lf-brandgreen) 25%, transparent); }
    .agl280-catchip i { font-size: .6rem; color: var(--lf-brandgreen); }
    .agl280-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .agl280-count-chip'''+HDR+''' { display: none; }
    .agl280-zero'''+HDR+''' { display: none; }
    [data-agl-row]'''+HDR+''' { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .agl280-clear:active { transform: none; } }
    @media (max-width: 640px) { .agl280-kbd-hint { display: none; } .agl280-instant { padding: 9px 11px; } }
  </style>
</body>'''
assert count(src, ZERO_ANCHOR) == 1, "zero-anchor not unique"
src = src.replace(ZERO_ANCHOR, ZERO_NEW)

# ── post-asserts (ফাইল-লেখার-আগে) ──
post = {
    'agl280-total': count(src, "agl280"),
    'kw-marker': count(src, "data-kw="),
    'agl-row-attr': count(src, 'data-agl-row="<%= aglI280 %>"'),
    'agl-row-any': count(src, "data-agl-row"),
    'filter-input': count(src, 'id="aglFilter280"'),
    'clear-btn': count(src, 'id="aglClear280"'),
    'count-chip': count(src, 'id="aglCount280"'),
    'zero-box': count(src, 'id="aglZero280"'),
    'qa-hook': count(src, "window.__aglQA"),
    'apply-fn': count(src, "function aglApply280"),
    'clear-fn': count(src, "function aglClearFn280"),
    'fa-filter': count(src, 'fas fa-filter agl280-ico'),
    'fa-times': count(src, "fa-times"),
    'fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'fa-tag': count(src, "fa-tag"),
    'kbd-hint': count(src, "<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন"),
    'kw-comment': count(src, "agl280 দ্বিভাষিক data-kw"),
    'kw-join': count(src, "].filter(Boolean).join(' ');"),
    'norm-replace': count(src, "replace(/\\s+/g, ' ')"),
    'catchip': count(src, "agl280-catchip"),
    'hidden-guard-row': count(src, "[data-agl-row]" + HDR + " { display: none !important; }"),
    'hidden-guard-chip': count(src, ".agl280-count-chip" + HDR + " { display: none; }"),
    'hidden-guard-zero': count(src, ".agl280-zero" + HDR + " { display: none; }"),
    'bulk-delete-kept': count(src, 'action="/admin/gallery/bulk-delete"'),
    'bulk-msg-kept': count(src, 'data-bulk-msg="'),
    'img-kept': count(src, '<img src="<%= g.image_url %>"'),
    'close-form-kept': count(src, "</form>"),
    'edit-kept': count(src, "সম্পাদনা"),
    'delete-kept': count(src, "মুছুন"),
    'empty-kept': count(src, "কোনো ছবি নেই"),
    'zero-kept': count(src, "কোনো ছবি মেলেনি"),
    'script-open': count(src, "<script>"),
    'script-close': count(src, "</script>"),
    'grid-div-kept': count(src, "repeat(auto-fill, minmax(220px, 1fr))"),
    'foridx-kept': count(src, "items.forEach((g, aglI280) => {"),
}
assert post['kw-marker'] == 1 and post['agl-row-attr'] == 1, "row-surface markers expected 1 each (template-level): %s" % post
assert post['filter-input'] == 1 and post['clear-btn'] == 1 and post['count-chip'] == 1 and post['zero-box'] == 1, "strip ids: %s" % post
assert post['qa-hook'] == 1 and post['apply-fn'] == 1 and post['clear-fn'] == 1, "hook: %s" % post
assert post['fa-filter'] == 1 and post['fa-times'] == 1 and post['fa-circle-xmark'] == 1 and post['fa-tag'] == 1, "icon counts: %s" % post
assert post['kbd-hint'] == 1, "kbd-hint: %s" % post
assert post['kw-comment'] == 1 and post['kw-join'] == 1, "kw-block: %s" % post
assert post['norm-replace'] == 4, "kw হোয়াইটস্পেস-নরমালাইজ ×৪ (image_url+title+caption+category): %s" % post
assert post['catchip'] == 3, "catchip ×৩ (span + CSS ×২): %s" % post
assert post['hidden-guard-row'] == 1 and post['hidden-guard-chip'] == 1 and post['hidden-guard-zero'] == 1, "hidden-guards ×3 (সঠিক-বাইট): %s" % post
assert post['bulk-delete-kept'] == 1 and post['bulk-msg-kept'] == 1, "bulk-bar regression: %s" % post
assert post['img-kept'] == 1 and post['close-form-kept'] == 2, "card-surface regression: %s" % post
assert post['edit-kept'] == 2 and post['delete-kept'] == 5 and post['empty-kept'] == 1 and post['zero-kept'] == 1, "display regression: %s" % post
assert post['script-open'] == 1 and post['script-close'] == 1, "script blocks post: %s" % post
assert post['grid-div-kept'] == 1 and post['foridx-kept'] == 1, "grid/forEach regression: %s" % post

# স্টাইল-ব্লক হেক্স-শূন্য-অ্যাসার্ট (শুধু নতুন-যোগ-স্টাইল-অংশ)
style_part = src.split("session280 — agl280 তাৎক্ষণিক-ফিল্টার স্টাইল", 1)[1].split("</style>", 1)[0]
hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", style_part)
assert not hexes, "hex in agl280 style block: %s" % hexes
for tok in ["--lf-brandgreen", "--lf-brandgreen-deep", "--lf-brandgreen-soft", "--lf-brandgreen-soft-2", "--lf-fb-border", "--lf-white", "--lf-slate"]:
    assert tok in style_part, "token missing in style: " + tok

# idden]-বাইট-স্বাস্থ্য-চূড়ান্ত-প্রমাণ: ম্যাংলড-রূপ শূন্য হতে-হবে
assert count(src, "row]" + HDR) == 1, "rowidden] exact byte"
assert count(src, "dden] { display") == 3, "hidden-guard display decls ×3"

io.open(VIEW, "w", encoding="utf-8").write(src)
print("OK: agl280 patch applied —", post['agl280-total'], "agl280-occurrences")
