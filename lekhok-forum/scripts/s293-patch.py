#!/usr/bin/env python3
# s293-patch.py — session293: ডেইলি কনটেন্ট তাৎক্ষণিক-ফিল্টার (dcf293) — /admin/daily তালিকা-সারফেস
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N + পোস্ট-অ্যাসার্ট
#         (নতুন-মার্কার + [hidden]-বাইট-সঠিক + স্টাইল-ব্লক হেক্স-শূন্য + no-regression-স্ট্রিং)
# প্যাটার্ন-মিরর: mo268/sb269-পরিবার (data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড
#         + Escape + QA-হুক সারফেস-শূন্যে-ও-সংজ্ঞায়িত) + সেশন-নির্দিষ্ট-সম্প্রসারণ: দ্বৈত-ফ্যাসেট
#         (data-dcf-type + data-dcf-pub — ধরন/স্ট্যাটাস-সিলেক্ট) — সব-শর্ত AND।
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
VIEW = APP + '/admin/views/admin/daily/list.ejs'
MARK = 'session293'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

v = rd(VIEW)
if MARK in v:
    print('PATCH-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)

# ── নেমস্পেস-গার্ড (প্যাচ-FATAL — dcf-প্রিফিক্স পূর্ব-শূন্য) ──
if '.dcf-' in v or 'dcf293' in v:
    die('dcf-নেমস্পেস-পূর্ব-অস্বচ্ছ (গার্ড)')

# ── অ্যাঙ্কর-অ্যাসার্ট (গার্ড-পরে) ──
A1 = '  <% if (items.length === 0) { %>\n'
A2 = '       const totalItems = items.length; %>\n'
A3 = ('          <tr>\n'
      '            <td style="width:34px;"><input type="checkbox" name="bulk_ids" value="<%= it.id %>" aria-label="সিলেক্ট"></td>\n')
A4 = '</body>\n</html>\n'
for name, a in [('A1', A1), ('A2', A2), ('A3', A3), ('A4', A4)]:
    if v.count(a) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, v.count(a)))

# ── এডিট-১: kw-সহায়ক (chips-প্রিলুডে — rows-ব্রাঞ্চের-ভিতরেই) ──
E2 = A2 + ('  <% /* session293: dcf293 ফিল্টার-সহায়ক — সারি-কীওয়ার্ড (শিরোনাম+বডি+ধরন-লেবেল+তারিখ; ১৪০-অক্ষর-ক্যাপ) */ %>\n'
           '  <% var dcfKw293 = function (it) { return [it.title, it.body, (DAILY_TYPES[it.content_type] ? DAILY_TYPES[it.content_type].label : it.content_type), (it.scheduled_date || \'\')].filter(Boolean).join(\' \').replace(/\\s+/g, \' \').slice(0, 140); }; %>\n')
v = v.replace(A2, E2, 1)

# ── এডিট-২: ফিল্টার-স্ট্রিপ (দুই-শাখার-আগে — সারফেস-শূন্যে-ও-উপস্থিত) ──
STRIP = '''  <!-- session293: dcf293 তাৎক্ষণিক-ফিল্টার (কীওয়ার্ড + ধরন + স্ট্যাটাস — sb269-পরিবার-সম্প্রসারণ) -->
  <div class="dcf-instant" id="dcfStrip293">
    <i class="fas fa-filter dcf-instant-ico" aria-hidden="true"></i>
    <input type="text" id="dcfFilter293" class="dcf-instant-input" placeholder="শিরোনাম / বিবরণ খুঁজুন…" aria-label="ডেইলি কনটেন্ট খুঁজুন">
    <select id="dcfType293" class="dcf-instant-select" aria-label="ধরন অনুযায়ী ফিল্টার">
      <option value="">সব ধরন</option>
      <% Object.keys(DAILY_TYPES).forEach(function (t) { %>
      <option value="<%= t %>"><%= DAILY_TYPES[t].label %></option>
      <% }); %>
    </select>
    <select id="dcfPub293" class="dcf-instant-select" aria-label="স্ট্যাটাস অনুযায়ী ফিল্টার">
      <option value="">সব স্ট্যাটাস</option>
      <option value="1">প্রকাশিত</option>
      <option value="0">খসড়া</option>
    </select>
    <button type="button" id="dcfClear293" class="dcf-instant-clear" hidden aria-label="ফিল্টার পরিষ্কার"><i class="fas fa-xmark"></i></button>
    <span class="dcf-count-chip" id="dcfCount293" hidden><i class="fas fa-list-ul" aria-hidden="true"></i> <span id="dcfCountTxt293">০ / ০</span></span>
    <span class="dcf-kbd-hint"><kbd>F</kbd> খুঁজুন · <kbd>Esc</kbd> পরিষ্কার</span>
  </div>
  <div class="dcf-zero" id="dcfZero293" hidden><i class="fas fa-magnifying-glass-minus" aria-hidden="true"></i> কোনো মেলে-না — ফিল্টার বদলান বা পরিষ্কার করুন</div>
'''
v = v.replace(A1, STRIP + A1, 1)

# ── এডিট-৩: সারি-বৈশিষ্ট্য (data-dcf-row + data-kw + data-dcf-type + data-dcf-pub) ──
E3 = ('          <tr data-dcf-row data-kw="<%= dcfKw293(it) %>" data-dcf-type="<%= it.content_type %>" data-dcf-pub="<%= it.published ? \'1\' : \'0\' %>">\n'
      '            <td style="width:34px;"><input type="checkbox" name="bulk_ids" value="<%= it.id %>" aria-label="সিলেক্ট"></td>\n')
v = v.replace(A3, E3, 1)

# ── এডিট-৪: স্টাইল + স্ক্রিপ্ট (</body>-এর-আগে) ──
TAIL = '''<style>
  /* session293 — dcf293 তাৎক্ষণিক-ফিল্টার স্টাইল (mo268/sb269-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
  .dcf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
  .dcf-instant-ico { color: var(--lf-amber-deep); opacity: .75; }
  .dcf-instant-input, .dcf-instant-select { border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-amber-soft); transition: none; }
  .dcf-instant-input { flex: 1 1 220px; min-width: 0; }
  .dcf-instant-select { flex: 0 1 auto; cursor: pointer; }
  .dcf-instant-input:focus, .dcf-instant-select:focus { outline: none; border-color: color-mix(in srgb, var(--lf-amber-deep) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-amber-deep) 15%, transparent); }
  .dcf-instant-clear { border: 0; background: transparent; color: var(--lf-amber-deep); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
  .dcf-instant-clear:hover { background: var(--lf-amber-soft); }
  .dcf-instant-clear:active { transform: scale(.96); }
  .dcf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-amber-deep); background: var(--lf-amber-soft); }
  .dcf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
  .dcf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-amber-deep) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-amber-deep); background: var(--lf-white); }
  .dcf-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-amber-deep) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-amber-soft); }
  .dcf-count-chip[hidden], .dcf-zero[hidden], .dcf-instant-clear[hidden] { display: none; }
  tr[data-dcf-row][hidden] { display: none !important; }
  @media (prefers-reduced-motion: reduce) { .dcf-instant-clear:active { transform: none; } }
  @media (max-width: 640px) { .dcf-kbd-hint { display: none; } .dcf-instant { padding: 9px 11px; } }
</style>
<script>
(function () {
  /* session293 — dcf293 তাৎক্ষণিক-ফিল্টার (sb269-প্যাটার্ন-মিরর + দ্বৈত-ফ্যাসেট: data-kw + ধরন + স্ট্যাটাস — সব-শর্ত AND;
     'f'-ফোকাস-ফিল্ড-গার্ড + Escape + শূন্য-অবস্থা + কাউন্ট-চিপ + __dcf293QA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
  if (window.__dcf293wired) return; window.__dcf293wired = true;
  var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-dcf-row]'));
  var input = document.getElementById('dcfFilter293');
  var typeSel = document.getElementById('dcfType293');
  var pubSel = document.getElementById('dcfPub293');
  var clearBtn = document.getElementById('dcfClear293');
  var countChip = document.getElementById('dcfCount293');
  var countTxt = document.getElementById('dcfCountTxt293');
  var zeroBox = document.getElementById('dcfZero293');
  if (!input) return;
  var total = rows.length;
  var bn293 = function (n) { return String(n).replace(/\\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); };
  function dcfActive293() {
    return !!(input.value || '').trim() || !!typeSel.value || !!pubSel.value;
  }
  function dcfApply293() {
    var q = (input.value || '').trim().toLowerCase();
    var ty = typeSel.value;
    var pb = pubSel.value;
    var shown = 0;
    rows.forEach(function (row) {
      var kw = (row.getAttribute('data-kw') || '').toLowerCase();
      var hit = (!q || kw.indexOf(q) !== -1) && (!ty || row.getAttribute('data-dcf-type') === ty) && (!pb || row.getAttribute('data-dcf-pub') === pb);
      row.hidden = !hit;
      if (hit) { shown++; }
    });
    var act = dcfActive293();
    if (countChip) { countChip.hidden = !act; if (act && countTxt) { countTxt.textContent = bn293(shown) + ' / ' + bn293(total); } }
    if (clearBtn) { clearBtn.hidden = !act; }
    if (zeroBox) { zeroBox.hidden = !(act && shown === 0); }
  }
  function dcfClear293() {
    input.value = '';
    typeSel.value = '';
    pubSel.value = '';
    dcfApply293();
    input.blur();
  }
  input.addEventListener('input', dcfApply293);
  typeSel.addEventListener('change', dcfApply293);
  pubSel.addEventListener('change', dcfApply293);
  if (clearBtn) { clearBtn.addEventListener('click', dcfClear293); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); dcfClear293(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__dcf293QA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: dcfApply293,
    clear: dcfClear293
  };
})();
</script>
</body>
</html>
'''
v = v.replace(A4, TAIL, 1)

# ── পোস্ট-অ্যাসার্ট ──
if MARK not in v: die('পোস্ট-অ্যাসার্ট: মার্কার-অনুপস্থিত')
for s in ['data-dcf-row', 'dcfKw293', '__dcf293QA', "getElementById('dcfFilter293')",
          "getElementById('dcfType293')", "getElementById('dcfPub293')",
          "tr[data-dcf-row][hidden] { display: none !important; }",
          '.dcf-count-chip[hidden]', "key !== 'f'", "ev.key === 'Escape'"]:
    if s not in v: die('পোস্ট-অ্যাসার্ট-অনুপস্থিত: ' + s)
if '__dcf293wired' not in v: die('পোস্ট-অ্যাসার্ট-অনুপস্থিত: __dcf293wired')
# স্টাইল-ব্লক নিষ্কাশন + হেক্স-শূন্য
B = v.split('/* session293 — dcf293 তাৎক্ষণিক-ফিল্টার স্টাইল', 1)[1].split('</style>', 1)[0]
import re
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B))
if HEXN != 0: die('dcf293-স্টাইল-ব্লকে হেক্স-%d (শূন্য-প্রত্যাশিত)' % HEXN)
for tok in ['var(--lf-fb-border)', 'var(--lf-amber-deep)', 'var(--lf-amber-soft)', 'var(--lf-slate)', 'var(--lf-white)', 'prefers-reduced-motion', 'max-width: 640px']:
    if tok not in B: die('স্টাইল-ব্লকে-টোকেন-অনুপস্থিত: ' + tok)
# no-regression (পূর্ব-স্ট্রিং-অক্ষুণ্ণ)
for s in ['data-bulk-all', '/admin/daily/bulk-delete', 'bulk-publish', 'count-pill', "include('../partials/sidebar')", 'DAILY_TYPES', 'bulk_ids']:
    if s not in v: die('no-regression-ভঙ্গ: ' + s)
wr(VIEW, v)
print('ok: daily/list.ejs dcf293-প্যাচড (স্ট্রিপ + সারি-বৈশিষ্ট্য + স্টাইল/স্ক্রিপ্ট — হেক্স-শূন্য)')
print('PATCH-OK')
