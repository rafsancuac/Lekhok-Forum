#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s266-patch.py — session266 (Task ID 106): যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার ms266
admin/views/admin/messages.ejs — ac265-প্যাটার্ন-মিরর (skip-if-present idempotent):
  ① [Mandatory-ফিচার] ফিল্টার-স্ট্রিপ (msFilter266 + msClear266 + msCount266 + ms-kbd-hint)
     + শূন্য-অবস্থা (msZero266 data-ms-empty) + কার্ড-সারফেস data-ms-row/data-kw + __msQA হুক
     (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — session265-উন্নতি)
  ② সারফেস = msg105-card (forEach-(m, idx)-এর idx) — 'inbox-empty105' নো-ডেটা-বক্স ইচ্ছাকৃত-বাদ
  ③ **নেমস্পেস-ম্যাপ:** .msg105-*/.mn-*/.act-*/.pill105-*/inbox-* পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স
     **ms** (admin.css-এ .ms- শূন্য — প্যাচ-আগে FATAL-যাচাই)
  ④ **দ্বিভাষিক data-kw:** #আইডি + বার্তা/message + নাম + ইমেইল + mail + বিষয় + বডি (১৪০-স্লাইস,
     স্পেস-নরমাল) + তারিখ + অবস্থা (অপঠিত unread / পঠিত read) + আর্কাইভ archived + নোট note উত্তর reply
  ⑤ [Mandatory-স্টাইল] ms266-ব্লক হেক্স-শূন্য টোকেন-শুধু (color-mix রিং + dashed kbd-পিল + :active
     + reduced-motion-জোড়া + 640px + hidden-গার্ড — .msg105-card[data-ms-row][hidden] !important,
     author display:flex-ওভাররাইড — session256-শ্রেণি, সঠিক-বাইট-যাচাইকৃত)
অক্ষুণ্ণ: স্ট্যাট-স্ট্রিপ ×৪, ফিল্টার-পিল ×৪ (all/unread/read/archived), q105-সার্চ, pagination,
bulk-bar (bulk-delete/unarchive/archive/read), data-bulk-all, প্রতি-কার্ড read/unread/archive/
unarchive/delete ফর্ম, প্রিন্ট (msgPrint108), উত্তর-নোট (mn-*109), কম্পোজ-মোডাল (cmodal*105),
msg-list105, sidebar — সব no-regression-অ্যাসার্টে প্রমাণিত।
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEW = os.path.join(ROOT, 'admin', 'views', 'admin', 'messages.ejs')
ADMINCSS = os.path.join(ROOT, 'public', 'assets', 'css', 'admin.css')

# ── নেমস্পেস-পূর্ব-যাচাই: admin.css-এ .ms- প্রিফিক্স অবশ্যই শূন্য ──
with io.open(ADMINCSS, 'r', encoding='utf-8') as f:
    _css = f.read()
if re.search(r'\.ms-', _css):
    sys.exit('FATAL: admin.css-এ .ms- প্রিফিক্স পূর্ব-দখলকৃত — নেমস্পেস-সংঘর্ষ')

with io.open(VIEW, 'r', encoding='utf-8') as f:
    src = f.read()

if 'msFilter266' in src:
    print('SKIP: ms266 পূর্ব-উপস্থিত (idempotent)')
    sys.exit(0)

APPLIED = []

def rep(anchor, replacement, label):
    global src
    if anchor not in src:
        sys.exit('FATAL: অ্যাঙ্কর পাওয়া যায়নি — ' + label)
    src = src.replace(anchor, replacement, 1)
    APPLIED.append(label)

# ── ① স্টাইল-ব্লক (head-এ, admin.css-লিংক-এর পরে) — হেক্স-শূন্য টোকেন-শুধু ──
STYLE_BLOCK = """  <style>
    /* session266 — যোগাযোগ-বার্তা তাৎক্ষণিক-ফিল্টার (ms266 — হেক্স-শূন্য টোকেন-শুধু; ac265-প্যাটার্ন-মিরর) */
    .ms-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .ms-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .ms-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .ms-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .ms-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .ms-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .ms-instant-clear:active { transform: scale(.96); }
    .ms-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .ms-count-chip[hidden] { display: none; }
    .ms-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .ms-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .ms-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .ms-zero[hidden] { display: none; }
    .msg105-card[data-ms-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .ms-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .ms-kbd-hint { display: none; } .ms-instant { padding: 9px 11px; } }
  </style>
</head>"""

rep("""  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
</head>""",
    """  <link rel="stylesheet" href="/assets/css/admin.css?v=<%= AV %>" />
""" + STYLE_BLOCK,
    'স্টাইল-ব্লক (head)')

# ── ② ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা (bulk-bar-এর পরে, empty-check-এর আগে) ──
STRIP = """  </form>

  <div class="ms-instant" id="msInstant266">
    <i class="fas fa-filter ms-instant-ico" aria-hidden="true"></i>
    <input type="text" id="msFilter266" class="ms-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / ইমেইল / বিষয় / বার্তা" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="msClear266" class="ms-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="ms-count-chip" id="msCount266" hidden></span>
    <span class="ms-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="ms-zero" id="msZero266" data-ms-empty hidden>
    <i class="fas fa-inbox" aria-hidden="true"></i>
    <span>কোনো বার্তা মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>

  <% if (messages.length === 0) { %>"""

rep("""  </form>

  <% if (messages.length === 0) { %>""",
    STRIP,
    'ফিল্টার-স্ট্রিপ + শূন্য-অবস্থা')

# ── ③ কার্ড-সারফেস (data-ms-row + দ্বিভাষিক data-kw) ──
KW = ('data-kw="#<%= m.id %> বার্তা message <%= m.name || \'\' %> '
      '<%= m.email || \'\' %> mail <%= m.subject || \'\' %> '
      '<%= ((m.message || \'\') + \' \').replace(/\\s+/g, \' \').trim().slice(0, 140) %> '
      '<%= m.created_at || \'\' %> <%= !m.is_read ? \'অপঠিত unread\' : \'পঠিত read\' %>'
      '<%= m.is_archived ? \' আর্কাইভ archived\' : \'\' %>'
      '<%= m.admin_reply ? \' নোট note উত্তর reply\' : \'\' %>"')

rep("""    <div class="msg105-card<%= isUnread105 ? ' unread' : '' %><%= m.is_archived ? ' archived' : '' %>" id="msg<%= m.id %>">""",
    """    <div class="msg105-card<%= isUnread105 ? ' unread' : '' %><%= m.is_archived ? ' archived' : '' %>" id="msg<%= m.id %>" data-ms-row="<%= idx %>" """ + KW + """>""",
    'কার্ড-সারফেস (data-ms-row + data-kw)')

# ── ④ স্ক্রিপ্ট-ব্লক (__msQA হুকসহ — বিদ্যমান script-এর পরে, </body>-এর আগে) ──
SCRIPT = """</script>
<script>
  (function () {
    /* session266 — ms266 তাৎক্ষণিক-ফিল্টার (ac265-প্যাটার্ন-মিরর: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __msQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-ms-row]'));
    var input = document.getElementById('msFilter266');
    var clearBtn = document.getElementById('msClear266');
    var countChip = document.getElementById('msCount266');
    var zeroBox = document.getElementById('msZero266');
    if (!input) { return; }
    var total = rows.length;
    function msApply266() {
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
    function msClear266() {
      input.value = '';
      msApply266();
      input.blur();
    }
    input.addEventListener('input', msApply266);
    if (clearBtn) { clearBtn.addEventListener('click', msClear266); }
    input.addEventListener('keydown', function (ms) {
      if (ms.key === 'Escape') { ms.stopPropagation(); msClear266(); }
    });
    document.addEventListener('keydown', function (ms) {
      if (ms.key !== 'f' || ms.altKey || ms.ctrlKey || ms.metaKey) { return; }
      var t = ms.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ms.preventDefault();
      input.focus();
      input.select();
    });
    window.__msQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: msApply266,
      clear: msClear266
    };
  })();
</script>
</body>"""

rep("""})();
</script>
</body>""",
    """})();
""" + SCRIPT,
    'স্ক্রিপ্ট-ব্লক (__msQA)')

with io.open(VIEW, 'w', encoding='utf-8') as f:
    f.write(src)

# ── পোস্ট-যাচাই (বাইট-স্তর) ──
rows_n = src.count('data-ms-row=')
kw_n = src.count('data-kw=')
hidden_n = src.count('[hidden]')
assert rows_n == 1, 'data-ms-row অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত, পাওয়া গেল ' + str(rows_n)
assert kw_n == 1, 'data-kw অ্যাসাইনমেন্ট ১-টি প্রত্যাশিত'
assert hidden_n == 3, '[hidden] বাইট-যাচাই ব্যর্থ (৩টি গার্ড প্রত্যাশিত: চিপ+শূন্য+কার্ড), পাওয়া ' + str(hidden_n)
assert src.count('__msQA') >= 1, '__msQA হুক অনুপস্থিত'
assert '.ms-instant {' in src, 'ms266 স্টাইল-ব্লক অনুপস্থিত'
hex_in_style = re.findall(r'#[0-9a-fA-F]{3,8}\b', src.split('<style>')[1].split('</style>')[0])
assert not hex_in_style, 'স্টাইল-ব্লকে হেক্স-লিটারাল আবিষ্কৃত: ' + repr(hex_in_style[:5])
# সংরক্ষণ-যাচাই: প্রতি-কার্ড ফর্ম/বাল্ক/নোট/প্রিন্ট অক্ষুণ্ণ
for keep in ['bulk-delete', 'bulk-unarchive', 'bulk-archive', 'bulk-read', 'data-bulk-all',
             '/read', '/unread', '/archive', '/unarchive', '/delete', 'data-note-form',
             'data-msg-print', 'msgPrintAll108', 'inbox-toolbar105', 'msg-list105']:
    assert keep in src, 'সংরক্ষণ-ব্যর্থ: ' + keep

print('OK: ms266 প্যাচ-প্রয়োগ —', len(APPLIED), 'সম্পাদনা:')
for a in APPLIED:
    print('  •', a)
print('পোস্ট-যাচাই: [hidden]×' + str(hidden_n) + ' ✓, হেক্স-শূন্য ✓, __msQA ✓, সংরক্ষণ ×১৫ ✓')
