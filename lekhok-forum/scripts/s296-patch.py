#!/usr/bin/env python3
# s296-patch.py — session296: ডেইলি স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট (dcf296 — dcf293-সম্প্রসারণ)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N + পোস্ট-অ্যাসার্ট
#         (ইউনিক-সম্পূর্ণ-লাইন — শেয়ার্ড-প্যাটার্ন-সর্ব-ফাইল-গণনা-নিষিদ্ধ (session295-গোটচা);
#         স্টাইল-ব্লক হেক্স-শূন্য + no-regression + idden]-গার্ড-বাইট-অক্ষুণ্ণ)
# ডিজাইন: একক-ফানেল — চিপ-ক্লিকে #dcfType293-মান-সেট + change-dispatch (বিদ্যমান dcfApply293-পুনঃব্যবহার —
#         নতুন-ফিল্টার-লজিক-শূন্য; session294-পিল-প্যাটার্ন-উত্তরাধিকার); sync = dcfApply293-তে guarded
#         হুক (__dcfChipSync296 — clear/Escape/manual-select সব-পথ-কভার) + aria-pressed স্টেট-মেশিন।
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
VIEW = APP + '/admin/views/admin/daily/list.ejs'
MARK = 'session296'

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

# ── নেমস্পেস-গার্ড (প্যাচ-FATAL — 296-প্রিফিক্স পূর্ব-শূন্য) ──
for NS in ('dcf296', 'dcf-chip296', '__dcf296QA', '__dcfChipSync296', 'dcfChipbar296'):
    if NS in v:
        die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)

# ── অ্যাঙ্কর-অ্যাসার্ট (গার্ড-পরে; সব ইউনিক-সম্পূর্ণ-লাইন) ──
A1 = ('    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">\n'
      '      <span class="chip chip-accent"><i class="fas fa-layer-group"></i> সব <%= totalItems %></span>\n'
      '      <% Object.keys(DAILY_TYPES).forEach(t => {\n'
      '           if (types[t]) { %>\n'
      '            <span class="chip"><i class="<%= DAILY_TYPES[t].icon || \'fas fa-circle\' %>"></i> <%= DAILY_TYPES[t].label %> <%= types[t] %></span>\n'
      '      <% } }); %>\n'
      '    </div>\n')
A2 = '    if (zeroBox) { zeroBox.hidden = !(act && shown === 0); }\n'
A3 = "  if (clearBtn) { clearBtn.addEventListener('click', dcfClear293); }\n"
A4 = '  @media (max-width: 640px) { .dcf-kbd-hint { display: none; } .dcf-instant { padding: 9px 11px; } }\n'
for name, a in [('A1', A1), ('A2', A2), ('A3', A3), ('A4', A4)]:
    if v.count(a) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, v.count(a)))

# ── এডিট-১: চিপ-বার মার্কআপ (স্ট্যাটিক-span → ক্লিকেবল-facet; বিষয়বস্তু-ভিজ্যুয়াল-প্যারিটি) ──
E1 = ('    <!-- session296: dcf296 চিপ-facet — স্ট্যাটিক-চিপ → ক্লিকেবল-প্রিসেট (dcfType293-সেট + change-চেইন; role=button + tabindex + aria-pressed) -->\n'
      + A1.replace(
      '    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">\n',
      '    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;" id="dcfChipbar296" role="group" aria-label="ধরন অনুযায়ী দ্রুত-ফিল্টার">\n')
      .replace(
      '      <span class="chip chip-accent"><i class="fas fa-layer-group"></i> সব <%= totalItems %></span>\n',
      '      <span class="chip chip-accent" data-dcf-chip296 data-dcf-type296="" role="button" tabindex="0" aria-pressed="true"><i class="fas fa-layer-group"></i> সব <%= totalItems %></span>\n')
      .replace(
      '            <span class="chip"><i class="<%= DAILY_TYPES[t].icon || \'fas fa-circle\' %>"></i> <%= DAILY_TYPES[t].label %> <%= types[t] %></span>\n',
      '            <span class="chip" data-dcf-chip296 data-dcf-type296="<%= t %>" role="button" tabindex="0" aria-pressed="false"><i class="<%= DAILY_TYPES[t].icon || \'fas fa-circle\' %>"></i> <%= DAILY_TYPES[t].label %> <%= types[t] %></span>\n'))
v = v.replace(A1, E1, 1)

# ── এডিট-২: dcfApply293-সিঙ্ক-হুক (এক-লাইন — clear/Escape/manual-সব-পথ dcfApply293-দিয়ে-যায়) ──
E2 = (A2
      + '    if (window.__dcfChipSync296) { window.__dcfChipSync296(); } /* session296: চিপ-aria-pressed-সিঙ্ক (একক-ফানেল-হুক) */\n')
v = v.replace(A2, E2, 1)

# ── এডিট-৩: চিপ-ওয়্যারিং + QA-হুক (IIFE-ভিতরে — typeSel/চিপ-সব-স্কোপড; __dcf296QA চিপ-শূন্যে-ও-সংজ্ঞায়িত) ──
WIRING = '''  /* session296 — dcf296 চিপ-facet: ক্লিকেবল-প্রিসেট (একক-ফানেল: dcfType293-মান-সেট + change-dispatch —
     dcfApply293-পুনঃব্যবহার; নতুন-ফিল্টার-লজিক-শূন্য) + Enter/Space-কীবোর্ড + aria-pressed-স্টেট-মেশিন */
  var chips296 = Array.prototype.slice.call(document.querySelectorAll('[data-dcf-chip296]'));
  function dcfChipSync296() {
    var cur = typeSel.value || '';
    chips296.forEach(function (c) {
      c.setAttribute('aria-pressed', (c.getAttribute('data-dcf-type296') || '') === cur ? 'true' : 'false');
    });
  }
  function dcfChipFire296(c) {
    typeSel.value = c.getAttribute('data-dcf-type296') || '';
    typeSel.dispatchEvent(new Event('change'));
  }
  chips296.forEach(function (c) {
    c.addEventListener('click', function () { dcfChipFire296(c); });
    c.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); dcfChipFire296(c); }
    });
  });
  if (chips296.length) { dcfChipSync296(); }
  window.__dcfChipSync296 = dcfChipSync296;
  window.__dcf296QA = {
    chips: function () { return chips296.length; },
    pressed: function () { return chips296.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).length; },
    pressedType: function () { var c = chips296.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0]; return c ? (c.getAttribute('data-dcf-type296') || '') : null; },
    type: function () { return typeSel.value || ''; },
    clickAt: function (i) { var c = chips296[i]; if (c) { dcfChipFire296(c); } return chips296.length; },
    sync: dcfChipSync296
  };
'''
E3 = A3 + WIRING
v = v.replace(A3, E3, 1)

# ── এডিট-৪: স্টাইল-ব্লক (session296 — হেক্স-শূন্য টোকেন-শুধু; amber-পরিবার) ──
STYLE = A4 + '''  /* session296 — dcf296 চিপ-facet স্টাইল (dcf293-পরিবার-সম্মত — হেক্স-শূন্য টোকেন-শুধু) */
  [data-dcf-chip296] { cursor: pointer; transition: none; user-select: none; -webkit-user-select: none; }
  [data-dcf-chip296]:hover { border-color: color-mix(in srgb, var(--lf-amber-deep) 40%, transparent); background: var(--lf-amber-soft); color: var(--lf-amber-deep); }
  [data-dcf-chip296]:active { transform: scale(.97); }
  [data-dcf-chip296]:focus-visible { outline: 2px solid var(--lf-amber-deep); outline-offset: 2px; }
  [data-dcf-chip296][aria-pressed="true"] { background: var(--lf-amber-deep); border-color: var(--lf-amber-deep); color: var(--lf-white); box-shadow: 0 1px 4px color-mix(in srgb, var(--lf-amber-deep) 30%, transparent); }
  [data-dcf-chip296][aria-pressed="true"]:hover { background: var(--lf-amber-deep); color: var(--lf-white); }
  @media (prefers-reduced-motion: reduce) { [data-dcf-chip296]:active { transform: none; } }
  @media (max-width: 640px) { [data-dcf-chip296] { padding: 5px 10px; font-size: .78rem; } }
'''
v = v.replace(A4, STYLE, 1)

wr(VIEW, v)

# ── পোস্ট-অ্যাসার্ট (সংরক্ষিত-ফাইল-উপরে; ইউনিক-সম্পূর্ণ-লাইন) ──
v2 = rd(VIEW)
def need1(s, what):
    if v2.count(s) != 1:
        die('পোস্ট-%s-কাউন্ট=%d (১-প্রত্যাশিত)' % (what, v2.count(s)))

need1('      <span class="chip chip-accent" data-dcf-chip296 data-dcf-type296="" role="button" tabindex="0" aria-pressed="true">', 'চিপ-সব-লাইন')
need1('            <span class="chip" data-dcf-chip296 data-dcf-type296="<%= t %>" role="button" tabindex="0" aria-pressed="false">', 'চিপ-ধরন-লাইন')
need1('    if (window.__dcfChipSync296) { window.__dcfChipSync296(); } /* session296: চিপ-aria-pressed-সিঙ্ক (একক-ফানেল-হুক) */', 'সিঙ্ক-হুক-লাইন')
need1('  window.__dcfChipSync296 = dcfChipSync296;', 'হুক-এক্সপোর্ট')
need1('  window.__dcf296QA = {', 'QA-হুক')
need1('id="dcfChipbar296"', 'চিপবার-আইডি')
# no-regression অ্যাঙ্কর (অক্ষুণ্ণ)
for NR in ('data-dcf-row data-kw=', 'window.__dcf293QA', "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)",
           '/admin/daily/bulk-delete', 'var dcfKw293 = function (it)', 'if (window.__dcf293wired) return;',
           'if (ev.key === \'Escape\') { ev.stopPropagation(); dcfClear293(); }',
           '.dcf-count-chip[hidden], .dcf-zero[hidden], .dcf-instant-clear[hidden] { display: none; }',
           'tr[data-dcf-row][hidden] { display: none !important; }',
           '<span class="chip" style="font-size:.78rem;padding:4px 10px;">'):
    if NR not in v2:
        die('no-reg-অ্যাঙ্কর-অনুপস্থিত: %s' % NR[:60])
# স্টাইল-ব্লক হেক্স-শূন্য (session296-ব্লক-স্কোপড)
i0 = v2.find('session296 — dcf296 চিপ-facet স্টাইল')
i1 = v2.find('</style>', i0)
if i0 == -1 or i1 == -1:
    die('স্টাইল-ব্লক-বাউন্ডারি-অনুপস্থিত')
BLK = v2[i0:i1]
HEXN = re.findall(r'#[0-9a-fA-F]{3,8}', BLK)
if HEXN:
    die('স্টাইল-ব্লকে-হেক্স: %s' % HEXN[:3])
for TOK in ('var(--lf-amber-deep)', 'var(--lf-amber-soft)', 'var(--lf-white)', 'color-mix(in srgb', 'prefers-reduced-motion', 'max-width: 640px'):
    if TOK not in BLK:
        die('স্টাইল-টোকেন-অনুপস্থিত: %s' % TOK)
# কী-স্টাইল-মার্কার
for K in ('[data-dcf-chip296][aria-pressed="true"]', '[data-dcf-chip296]:focus-visible', '[data-dcf-chip296]:active'):
    if K not in BLK:
        die('স্টাইল-মার্কার-অনুপস্থিত: %s' % K)
print('PATCH-OK: session296 চিপ-facet প্রয়োগ (dcf296)')
