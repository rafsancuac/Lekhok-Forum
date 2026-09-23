#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s278-patch.py — session278: /admin/members তাৎক্ষণিক-ফিল্টার aml278 (s277/ev277-প্যাটার্ন-মিরর)
# চুক্তি: skip-if-present idempotent; in-memory-সম্পাদনা → assert → write (প্যাচ-নিরাপত্তা-চুক্তি);
#         .aml278- নেমস্পেস-গার্ড (view+admin.css+tokens.css); হেক্স-শূন্য-স্টাইল-পোস্ট-অ্যাসার্ট;
#         প্রি/পোস্ট-সংরক্ষণ-অ্যাসার্ট (bulk-bar/mem-filter-bar/thead/empty-branch/badge-টার্নারি অক্ষুণ্ণ);
#         [hidden]-বাইট-নিরাপত্তা: HDR = '['+'hidden'+']' কনক্যাট-নির্মিত (transport-ম্যাংল-প্রমাণ) + পোস্ট-অ্যাসার্ট
import re, sys, io

VIEW = "admin/views/admin/members/list.ejs"
CSS_FILES = ["public/assets/css/admin.css", "public/assets/css/tokens.css"]
HDR = "[" + "hidden" + "]"  # transport-mangle-proof [hidden] literal

src = io.open(VIEW, encoding="utf-8").read()

# ── skip-if-present (idempotent) ──
if "aml278" in src:
    print("SKIP: aml278 already present — idempotent no-op")
    sys.exit(0)

def count(hay, needle):
    return hay.count(needle)

# ── pre-asserts (অ্যাসার্ট-লেখার-আগে-সম্পাদনা-প্রভাব-মানচিত্র) ──
pre = {
    'bulk-bar-form': count(src, 'action="/admin/members/bulk-delete"'),
    'bulk-msg': count(src, 'data-bulk-msg="'),
    'bulk-suspend': count(src, 'formaction="/admin/members/bulk-suspend"'),
    'bulk-unsuspend': count(src, 'formaction="/admin/members/bulk-unsuspend"'),
    'forEach': count(src, "members.forEach(m => {"),
    'close-form': count(src, "</form>"),
    'thead': count(src, "<thead>"),
    'empty-branch': count(src, "কোনো সদস্য নেই"),
    'mem-filter-bar': count(src, 'action="/admin/members"'),
    'mem-filter-href': count(src, 'href="/admin/members" class="btn btn-sm"'),
    'term-select': count(src, 'name="term"'),
    'type-select': count(src, 'name="type"'),
    'edit-link': count(src, '/edit" class="btn btn-primary btn-sm">সম্পাদনা</a>'),
    'delete-form': count(src, '?_method=DELETE" style="display:inline;"'),
    'st-ternary': count(src, "m.account_status || (m.user_id ? 'active' : 'unclaimed')"),
    'wing-ternary': count(src, "m.member_type === 'central' ? 'success'"),
    'close-body': count(src, "</body>"),
    'icons-fa-filter': count(src, "fa-filter"),
    'icons-fa-times': count(src, "fa-times"),
    'icons-fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kw-marker': count(src, "data-kw="),
    'aml-marker': count(src, "data-aml-row"),
    'bulk-all': count(src, "data-bulk-all"),
    'hdr-literal': count(src, HDR),
}
assert pre['bulk-bar-form'] == 1, "bulk-delete form count unexpected: %s" % pre
assert pre['bulk-msg'] == 3, "bulk-msg expected 3 (suspend/unsuspend/trash): %s" % pre
assert pre['bulk-suspend'] == 1 and pre['bulk-unsuspend'] == 1, "bulk formactions unexpected: %s" % pre
assert pre['forEach'] == 1, "members.forEach unexpected: %s" % pre
assert pre['close-form'] == 5, "</form> expected 5 (mem-filter-bar + bulk-bar + per-row restore + per-row suspend + per-row delete — দুই-শাখাই-সোর্সে): %s" % pre
assert pre['thead'] == 1, "thead unexpected: %s" % pre
assert pre['empty-branch'] == 1, "empty-branch unexpected: %s" % pre
assert pre['mem-filter-bar'] == 1, 'GET-filter form action="/admin/members" expected 1: %s' % pre
assert pre['mem-filter-href'] == 1, "remove-filter link href expected 1: %s" % pre
assert pre['term-select'] == 1 and pre['type-select'] == 1, "term/type selects unexpected: %s" % pre
assert pre['edit-link'] == 1 and pre['delete-form'] == 1, "row-actions unexpected: %s" % pre
assert pre['st-ternary'] == 1, "status-badge ternary unexpected: %s" % pre
assert pre['wing-ternary'] == 1, "wing-badge ternary unexpected: %s" % pre
assert pre['close-body'] == 1, "</body> unexpected: %s" % pre
assert pre['icons-fa-filter'] == 0 and pre['icons-fa-circle-xmark'] == 0, "icon-collision (s271-গোটচা): %s" % pre
assert pre['icons-fa-times'] == 1, "fa-times expected exactly 1 (মেম্বার-ফিল্টার-সরান লিংক): %s" % pre
assert pre['kw-marker'] == 0 and pre['aml-marker'] == 0, "aml278 markers pre-existing: %s" % pre
assert pre['bulk-all'] == 1, "data-bulk-all expected 1: %s" % pre
assert pre['hdr-literal'] == 0, "unexpected [hidden] literal pre-existing: %s" % pre

# ── নেমস্পেস-গার্ড (.aml278- প্রি-যাচাই — view + শেয়ার্ড-css; mm-সংঘর্ষ-সচেতন: moderator-members.ejs data-mm-row আছে) ──
assert re.search(r"\.aml278-[a-z]", src) is None, ".aml278- prefix already in view"
assert re.search(r"data-aml-row", src) is None, "data-aml-row pre-existing in view"
for cssf in CSS_FILES:
    css = io.open(cssf, encoding="utf-8").read()
    assert re.search(r"\.aml278-[a-z]", css) is None, ".aml278- prefix collision in " + cssf

# ── সম্পাদনা ১: ফিল্টার-স্ট্রিপ (bulk-bar-</form>-এর পরে, empty-if-এর আগে — always-rendered) ──
STRIP_ANCHOR = '</form>\n  <% if (members.length === 0) { %>'
STRIP_NEW = '''</form>
  <%# ── session278 — aml278 তাৎক্ষণিক-ফিল্টার (s277/ev277-প্যাটার্ন-মিরর; একক-স্ট্রিপ — 'f'-মালিকানা-নির্দ্বিধা; term/type-GET-ফিল্টারের-সহায়ক ক্লায়েন্ট-সাইড অনুসন্ধান) ── %>
  <div class="aml278-instant" id="amlInstant278">
    <i class="fas fa-filter aml278-ico" aria-hidden="true"></i>
    <input type="text" id="amlFilter278" class="aml278-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / আইডি / পদ / কার্যবর্ষ" autocomplete="off" aria-label="সদস্য-তালিকা তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="amlClear278" class="aml278-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="aml278-count-chip" id="amlCount278" hidden></span>
    <span class="aml278-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <% if (members.length === 0) { %>'''
assert count(src, STRIP_ANCHOR) == 1, "strip-anchor not unique"
src = src.replace(STRIP_ANCHOR, STRIP_NEW)

# ── সম্পাদনা ২: সারি-সারফেস (forEach → (m, amlI278) + kw + data-aml-row) ──
ROW_ANCHOR = '''      <% members.forEach(m => { %>
        <tr>'''
ROW_NEW = '''      <% members.forEach((m, amlI278) => { %>
        <%# session278 — aml278 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড ×৫; উইং-মান-অ্যালায়াস + স্ট্যাটাস-মান-অ্যালায়াস s273-চুক্তি) %>
        <% const stAml278 = m.account_status || (m.user_id ? 'active' : 'unclaimed'); %>
        <% const amlKw278 = [
             '#' + m.id,
             'সদস্য member',
             'আইডি id', String(m.member_id || '').replace(/\\s+/g, ' '),
             'নাম name', String(m.name || '').replace(/\\s+/g, ' '),
             'পদ role', String(m.role || '').replace(/\\s+/g, ' '),
             'ডিপার্টমেন্ট department', String(m.department || '').replace(/\\s+/g, ' '),
             'কার্যবর্ষ term', String(m.term_year || '').replace(/\\s+/g, ' '),
             m.member_type === 'central' ? 'কেন্দ্রীয় central' :
             m.member_type === 'advisory' ? 'উপদেষ্টা advisory' :
             m.member_type === 'publication' ? 'প্রকাশনা publication' :
             m.member_type === 'office' ? 'দপ্তর office' :
             m.member_type === 'it-promo' ? 'আইটি itpromo' :
             m.member_type === 'founder' ? 'প্রতিষ্ঠাতা founder' :
             m.member_type === 'permanent' ? 'স্থায়ী permanent' :
             m.member_type === 'branch' ? 'শাখা branch' : 'সাধারণ general',
             stAml278 === 'active' ? 'অ্যাক্টিভ active' :
             stAml278 === 'pending' ? 'পেন্ডিং pending' :
             stAml278 === 'suspended' ? 'স্থগিত suspended' : 'আনক্লেইমড unclaimed',
             'সম্পাদনা edit',
             'মুছুন delete'
           ].filter(Boolean).join(' '); %>
        <tr data-aml-row="<%= amlI278 %>" data-kw="<%= amlKw278 %>">'''
assert count(src, ROW_ANCHOR) == 1, "row-anchor not unique"
src = src.replace(ROW_ANCHOR, ROW_NEW)

# ── সম্পাদনা ৩: শূন্য-অবস্থা + স্ক্রিপ্ট + স্টাইল (টেবিল-ব্রাঞ্চ-বন্ধের পরে, admin-main-বন্ধের আগে) ──
ZERO_ANCHOR = '''  </table>
  <% } %>
</div>
</body>'''
ZERO_NEW = '''  </table>
  <% } %>
  <div class="aml278-zero" id="amlZero278" data-aml-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো সদস্য মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
<script>
  (function () {
    /* session278 — aml278 তাৎক্ষণিক-ফিল্টার (s277/ev277-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড (term/type-SELECT + bulk_ids-INPUT) + Escape + __amlQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; tr-সারফেস: tr[data-aml-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-aml-row]'));
    var input = document.getElementById('amlFilter278');
    var clearBtn = document.getElementById('amlClear278');
    var countChip = document.getElementById('amlCount278');
    var zeroBox = document.getElementById('amlZero278');
    if (!input) { return; }
    var total = rows.length;
    function amlApply278() {
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
    function amlClearFn278() {
      input.value = '';
      amlApply278();
      input.blur();
    }
    input.addEventListener('input', amlApply278);
    if (clearBtn) { clearBtn.addEventListener('click', amlClearFn278); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); amlClearFn278(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__amlQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: amlApply278,
      clear: amlClearFn278
    };
  })();
</script>
<style>
    /* session278 — aml278 তাৎক্ষণিক-ফিল্টার স্টাইল (s277-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */
    .aml278-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .aml278-ico { color: var(--lf-brandgreen); opacity: .75; }
    .aml278-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .aml278-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .aml278-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .aml278-clear:hover { background: var(--lf-brandgreen-soft); }
    .aml278-clear:active { transform: scale(.96); }
    .aml278-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .aml278-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .aml278-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .aml278-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .aml278-count-chip'''+HDR+''' { display: none; }
    .aml278-zero'''+HDR+''' { display: none; }
    tr[data-aml-row]'''+HDR+''' { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .aml278-clear:active { transform: none; } }
    @media (max-width: 640px) { .aml278-kbd-hint { display: none; } .aml278-instant { padding: 9px 11px; } }
  </style>
</body>'''
assert count(src, ZERO_ANCHOR) == 1, "zero-anchor not unique"
src = src.replace(ZERO_ANCHOR, ZERO_NEW)

# ── post-asserts (ফাইল-লেখার-আগে) ──
post = {
    'aml278-total': count(src, "aml278"),
    'kw-marker': count(src, "data-kw="),
    'aml-row-attr': count(src, 'data-aml-row="<%= amlI278 %>"'),
    'aml-row-any': count(src, "data-aml-row"),
    'filter-input': count(src, 'id="amlFilter278"'),
    'clear-btn': count(src, 'id="amlClear278"'),
    'count-chip': count(src, 'id="amlCount278"'),
    'zero-box': count(src, 'id="amlZero278"'),
    'qa-hook': count(src, "window.__amlQA"),
    'apply-fn': count(src, "function amlApply278"),
    'clear-fn': count(src, "function amlClearFn278"),
    'fa-filter': count(src, 'fas fa-filter aml278-ico'),
    'fa-times': count(src, "fa-times"),
    'fa-circle-xmark': count(src, "fa-filter-circle-xmark"),
    'kbd-hint': count(src, "<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন"),
    'kw-comment': count(src, "aml278 দ্বিভাষিক data-kw"),
    'kw-join': count(src, "].filter(Boolean).join(' ');"),
    'st-ternary-kept': count(src, "m.account_status || (m.user_id ? 'active' : 'unclaimed')"),
    'wing-badge-kept': count(src, "m.member_type === 'central' ? 'success'"),
    'hidden-guard-row': count(src, "tr[data-aml-row]" + HDR + " { display: none !important; }"),
    'hidden-guard-chip': count(src, ".aml278-count-chip" + HDR + " { display: none; }"),
    'hidden-guard-zero': count(src, ".aml278-zero" + HDR + " { display: none; }"),
    'bulk-delete-kept': count(src, 'action="/admin/members/bulk-delete"'),
    'bulk-msg-kept': count(src, 'data-bulk-msg="'),
    'bulk-suspend-kept': count(src, 'formaction="/admin/members/bulk-suspend"'),
    'bulk-unsuspend-kept': count(src, 'formaction="/admin/members/bulk-unsuspend"'),
    'close-form-kept': count(src, "</form>"),
    'mem-filter-kept': count(src, 'action="/admin/members"'),
    'mem-filter-href-kept': count(src, 'href="/admin/members" class="btn btn-sm"'),
    'term-select-kept': count(src, 'name="term"'),
    'type-select-kept': count(src, 'name="type"'),
    'edit-kept': count(src, "সম্পাদনা"),
    'delete-kept': count(src, "মুছুন"),
    'empty-kept': count(src, "কোনো সদস্য নেই"),
    'bulk-all-kept': count(src, "data-bulk-all"),
    'norm-replace': count(src, "replace(/\\s+/g, ' ')"),
}
assert post['kw-marker'] == 1 and post['aml-row-attr'] == 1, "row-surface markers expected 1 each (template-level): %s" % post
assert post['filter-input'] == 1 and post['clear-btn'] == 1 and post['count-chip'] == 1 and post['zero-box'] == 1, "strip ids: %s" % post
assert post['qa-hook'] == 1 and post['apply-fn'] == 1 and post['clear-fn'] == 1, "hook: %s" % post
assert post['fa-filter'] == 1 and post['fa-times'] == 2 and post['fa-circle-xmark'] == 1, "icon counts (fa-times = নতুন-ক্লিয়ার + পুরাতন-ফিল্টার-সরান): %s" % post
assert post['kbd-hint'] == 1, "kbd-hint: %s" % post
assert post['kw-comment'] == 1 and post['kw-join'] == 1, "kw-block: %s" % post
assert post['st-ternary-kept'] == 2 and post['wing-badge-kept'] == 1, "badge-ternary regression (st-ternary = মূল-badge + kw-const ×২): %s" % post
assert post['hidden-guard-row'] == 1 and post['hidden-guard-chip'] == 1 and post['hidden-guard-zero'] == 1, "hidden-guards ×3 (সঠিক-বাইট): %s" % post
assert post['bulk-delete-kept'] == 1 and post['bulk-msg-kept'] == 3, "bulk-bar regression: %s" % post
assert post['bulk-suspend-kept'] == 1 and post['bulk-unsuspend-kept'] == 1, "bulk-formactions regression: %s" % post
assert post['mem-filter-kept'] == 1 and post['mem-filter-href-kept'] == 1 and post['term-select-kept'] == 1 and post['type-select-kept'] == 1, "mem-filter-bar regression: %s" % post
assert post['close-form-kept'] == 5, "</form> post expected 5 (নতুন-কোনো-form-নেই — clear একটি button, strip/zero div): %s" % post
assert post['edit-kept'] == 2 and post['delete-kept'] >= 3 and post['empty-kept'] == 1, "display regression: %s" % post
assert post['bulk-all-kept'] == 1, "bulk-all regression: %s" % post
assert post['norm-replace'] == 5, "kw হোয়াইটস্পেস-নরমালাইজ ×৫: %s" % post

# স্টাইল-ব্লক হেক্স-শূন্য-অ্যাসার্ট (শুধু নতুন-যোগ-স্টাইল-অংশ)
style_part = src.split("<style>", 1)[1].split("</style>", 1)[0]
hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", style_part)
assert not hexes, "hex in aml278 style block: %s" % hexes
for tok in ["--lf-brandgreen", "--lf-brandgreen-deep", "--lf-brandgreen-soft", "--lf-brandgreen-soft-2", "--lf-fb-border", "--lf-white", "--lf-slate"]:
    assert tok in style_part, "token missing in style: " + tok

# [hidden]-বাইট-স্বাস্থ্য-চূড়ান্ত-প্রমাণ: ম্যাংলড-রূপ শূন্য হতে-হবে
assert count(src, "chip" + HDR) == 1, "chip[hidden] exact byte"
assert count(src, "dden] { display") == 3, "hidden-guard display decls ×3"

io.open(VIEW, "w", encoding="utf-8").write(src)
print("OK: aml278 patch applied —", post['aml278-total'], "aml278-occurrences")
