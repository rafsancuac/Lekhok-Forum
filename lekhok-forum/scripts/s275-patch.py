#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s275-patch.py — session275: সুপার-এডমিন ড্যাশবোর্ড (/admin/super) দ্বৈত তাৎক্ষণিক-ফিল্টার
sd275 (তদারকি-স্কোপধারী মডারেটর তালিকা) + se275 (অ্যাডমিন অ্যাকাউন্ট সারসংক্ষেপ)।
s274-প্যাটার্ন-মিরর + **দ্বৈত-স্ট্রিপ চুক্তি (s269)**: 'f'-ফোকাস একক-মালিকানা (শুধু sd275)।

চুক্তি:
- skip-if-present idempotent (sdFilter275 প্রাক-উপস্থিত → SKIP exit 0)
- in-memory-সম্পাদনা → সম্পূর্ণ-অ্যাসার্ট → তার-পরে write (প্যাচ-নিরাপত্তা-চুক্তি)
- FATAL-গার্ড: নেমস্পেস (.sd275-/.se275- regex + data-sd-row/data-se-row + __sdQA/__seQA)
- PRESERVE-মানচিত্র: data-ov-confirm, stat-box ×৮, ov-empty ×২, ov-list ×২, recent-list ×৩,
  dash-cols ×১, card-title, forEach ৬→৮, addEventListener ১→৮, aria-label +২
- হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (sd275/se275-স্টাইল-ব্লক) + সঠিক-বাইট ×৫ hidden-গার্ড
- আইকন-সংঘর্ষ-গার্ড (s271): প্রতিটি-নতুন-আইকন ×১ (fa-filter/fa-magnifying-glass/
  fa-filter-circle-xmark/fa-circle-xmark/fa-times/fa-xmark)
"""
import re, sys

VIEW = 'admin/views/admin/super/dashboard.ejs'
view = open(VIEW, encoding='utf-8').read()
orig_len = len(view)

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def count(s, needle): return s.count(needle)

if 'sdFilter275' in view:
    print('SKIP: sdFilter275 পূর্ব-উপস্থিত — idempotent রান, কোনো-পরিবর্তন-নেই')
    sys.exit(0)

# ── FATAL-গার্ড: নেমস্পেস-শূন্যতা ──
if re.search(r'\.sd275-[a-z]', view): fatal('view-এ .sd275- প্রি-উপস্থিত')
if re.search(r'\.se275-[a-z]', view): fatal('view-এ .se275- প্রি-উপস্থিত')
for tok in ('data-sd-row', 'data-se-row', '__sdQA', '__seQA', 'sdZero275', 'seZero275'):
    if tok in view: fatal(f'view-এ {tok} প্রি-উপস্থিত')
for ico in ('fa-filter', 'fa-magnifying-glass', 'fa-filter-circle-xmark', 'fa-circle-xmark', 'fa-xmark'):
    if ico in view: fatal(f'আইকন {ico} প্রি-উপস্থিত (সংঘর্ষ-ঝুঁকি)')

# ── PRESERVE-পূর্ব-গণনা ──
pre = {
    'ovconfirm': count(view, 'data-ov-confirm'),
    'statbox': count(view, 'stat-box'),
    'ovempty': count(view, 'ov-empty'),
    'ovlist': count(view, 'ov-list'),
    'recentlist': count(view, 'recent-list'),
    'dashcols': count(view, 'dash-cols'),
    'cardtitle': count(view, 'card-title'),
    'formpost': count(view, '<form method="POST"'),
    'foreach': count(view, 'forEach'),
    'ael': count(view, '.addEventListener('),
    'arialabel': count(view, 'aria-label'),
    'fatimes': count(view, 'fa-times'),
    'bodyclose': count(view, '</body>'),
    'modsh4': count(view, 'তদারকি-স্কোপধারী মডারেটর (ইউজার তদারকি)</h4>'),
    'adminstitle': count(view, 'অ্যাডমিন অ্যাকাউন্ট <a href="/admin/super/admins"'),
    'modselse': count(view, "কোনো মডারেটরের 'ইউজার তদারকি' স্কোপ নেই"),
    'logscomment': count(view, '<!-- লগ দুই-কলাম -->'),
    'modforeach': count(view, 'oversight.userMgmtMods.forEach(m => {'),
    'adminforeach': count(view, 'admins.slice(0, 6).forEach(a => {'),
}
for k in ('modsh4', 'adminstitle', 'modselse', 'logscomment', 'modforeach', 'adminforeach', 'bodyclose'):
    if pre[k] != 1: fatal(f"অ্যাঙ্কর {k} অনন্য-নয় (n={pre[k]})")
if pre['statbox'] != 8: fatal(f"stat-box ×৮ প্রত্যাশিত, পাওয়া {pre['statbox']}")
if pre['ovempty'] != 2: fatal(f"ov-empty ×২ প্রত্যাশিত, পাওয়া {pre['ovempty']}")

# ══════════════════════════════════════════════════════════════════════════════
# E1a — sd275: মডারেটর-তালিকা forEach + kw গণনা + সারি-অ্যাট্রিবিউট
# ══════════════════════════════════════════════════════════════════════════════
MODS_ANCHOR = """          <% oversight.userMgmtMods.forEach(m => { %>
          <li>"""
MODS_NEW = """          <% oversight.userMgmtMods.forEach((m, sdI275) => { %>
          <%# session275 — sd275 দ্বিভাষিক data-kw (হোয়াইটস্পেস-নরমালাইজড) %>
          <% const sdKw275 = [
               '#' + m.id,
               'মডারেটর moderator',
               '@' + m.username,
               'নাম name', String(m.full_name || m.username || '').replace(/\\s+/g, ' '),
               'তদারকি oversight user_mgmt স্কোপ scope',
               'শেষ লগইন last ' + String(m.last_login || '').slice(0, 10)
             ].filter(Boolean).join(' '); %>
          <li data-sd-row="<%= sdI275 %>" data-kw="<%= sdKw275 %>">"""
if count(view, MODS_ANCHOR) != 1: fatal('MODS_ANCHOR অনন্য-নয়')
view = view.replace(MODS_ANCHOR, MODS_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E1b — se275: অ্যাডমিন-সারসংক্ষেপ forEach + kw গণনা + সারি-অ্যাট্রিবিউট
# ══════════════════════════════════════════════════════════════════════════════
ADMINS_ANCHOR = """      <% admins.slice(0, 6).forEach(a => { %>
        <li>"""
ADMINS_NEW = """      <% admins.slice(0, 6).forEach((a, seI275) => { %>
        <%# session275 — se275 দ্বিভাষিক data-kw (রোল/লক-মান-অ্যালায়াসসহ — হোয়াইটস্পেস-নরমালাইজড) %>
        <% const seKw275 = [
             '#' + a.id,
             'অ্যাডমিন admin',
             '@' + a.username,
             'নাম name', String(a.display_name || a.username || '').replace(/\\s+/g, ' '),
             'রোল role', a.role === 'superadmin' ? 'সুপার-এডমিন superadmin' : 'এডমিন admin',
             a.locked ? 'লকড locked' : 'আনলকড unlocked',
             'শেষ লগইন last ' + String(a.last_login || '').slice(0, 16)
           ].filter(Boolean).join(' '); %>
        <li data-se-row="<%= seI275 %>" data-kw="<%= seKw275 %>">"""
if count(view, ADMINS_ANCHOR) != 1: fatal('ADMINS_ANCHOR অনন্য-নয়')
view = view.replace(ADMINS_ANCHOR, ADMINS_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E2a — sd275 ফিল্টার-স্ট্রিপ (mods ov-box h4-এর-পরে; conditional-বাইরে — always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
H4_ANCHOR = """        <h4><i class="fas fa-users-cog"></i> তদারকি-স্কোপধারী মডারেটর (ইউজার তদারকি)</h4>"""
H4_NEW = H4_ANCHOR + """
        <%# ── session275 — sd275 তাৎক্ষণিক-ফিল্টার (s274-প্যাটার্ন-মিরর; দ্বৈত-স্ট্রিপ: 'f'-মালিক sd275) ── %>
        <div class="sd275-instant" id="sdInstant275">
          <i class="fas fa-filter sd275-ico" aria-hidden="true"></i>
          <input type="text" id="sdFilter275" class="sd275-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / @username / তদারকি" autocomplete="off" aria-label="তদারকি-স্কোপধারী মডারেটর তাৎক্ষণিক ফিল্টার" />
          <button type="button" id="sdClear275" class="sd275-clear" aria-label="মডারেটর-ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
          <span class="sd275-count-chip" id="sdCount275" hidden></span>
          <span class="sd275-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
        </div>"""
if count(view, H4_ANCHOR) != 1: fatal('H4_ANCHOR অনন্য-নয়')
view = view.replace(H4_ANCHOR, H4_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E2b — se275 ফিল্টার-স্ট্রিপ (অ্যাডমিন-কার্ড title-এর-পরে; always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
SECT_ANCHOR = """    <h3 class="card-title"><i class="fas fa-user-shield"></i> অ্যাডমিন অ্যাকাউন্ট <a href="/admin/super/admins" class="super-manage-link">ব্যবস্থাপনা করুন <i class="fas fa-arrow-right"></i></a></h3>"""
SECT_NEW = SECT_ANCHOR + """
    <%# ── session275 — se275 তাৎক্ষণিক-ফিল্টার (s274-প্যাটার্ন-মিরর; স্বাধীন-স্ট্রিপ — page-'f'-শ্রোতা-নেই, s269-চুক্তি) ── %>
    <div class="se275-instant" id="seInstant275">
      <i class="fas fa-magnifying-glass se275-ico" aria-hidden="true"></i>
      <input type="text" id="seFilter275" class="se275-input" placeholder="তাৎক্ষণিক ফিল্টার — নাম / @username / রোল / লক" autocomplete="off" aria-label="অ্যাডমিন সারসংক্ষেপ তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="seClear275" class="se275-clear" aria-label="অ্যাডমিন-ফিল্টার মুছুন" hidden><i class="fas fa-xmark"></i></button>
      <span class="se275-count-chip" id="seCount275" hidden></span>
    </div>"""
if count(view, SECT_ANCHOR) != 1: fatal('SECT_ANCHOR অনন্য-নয়')
view = view.replace(SECT_ANCHOR, SECT_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E3a — sd275 শূন্য-অবস্থা (mods conditional-বন্ধের-পরে; always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
ELSE_ANCHOR = """<% } else { %><p class="ov-empty">কোনো মডারেটরের 'ইউজার তদারকি' স্কোপ নেই — <a href="/admin/moderators">মডারেটর ব্যবস্থাপনা</a> থেকে দিন।</p><% } %>"""
ELSE_NEW = ELSE_ANCHOR + """
        <div class="sd275-zero" id="sdZero275" data-sd-empty hidden>
          <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
          <span>কোনো মডারেটর মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
        </div>"""
if count(view, ELSE_ANCHOR) != 1: fatal('ELSE_ANCHOR অনন্য-নয়')
view = view.replace(ELSE_ANCHOR, ELSE_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E3b — se275 শূন্য-অবস্থা (অ্যাডমিন-তালিকা </ul>-এর-পরে; always-rendered)
# ══════════════════════════════════════════════════════════════════════════════
UL_ANCHOR = """      <% }) %>
    </ul>
  </div>

  <!-- লগ দুই-কলাম -->"""
UL_NEW = """      <% }) %>
    </ul>
    <div class="se275-zero" id="seZero275" data-se-empty hidden>
      <i class="fas fa-circle-xmark" aria-hidden="true"></i>
      <span>কোনো অ্যাডমিন মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
  </div>

  <!-- লগ দুই-কলাম -->"""
if count(view, UL_ANCHOR) != 1: fatal('UL_ANCHOR অনন্য-নয়')
view = view.replace(UL_ANCHOR, UL_NEW, 1)

# ══════════════════════════════════════════════════════════════════════════════
# E4 — script + style (</body>-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
BLOCK = '''<script>
  (function () {
    /* session275 — sd275 তাৎক্ষণিক-ফিল্টার (s274-প্যাটার্ন-মিরর; দ্বৈত-স্ট্রিপ 'f'-একক-মালিকানা s269-চুক্তি: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __sdQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; li-সারফেস: [data-sd-row]-hidden-গার্ড) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-sd-row]'));
    var input = document.getElementById('sdFilter275');
    var clearBtn = document.getElementById('sdClear275');
    var countChip = document.getElementById('sdCount275');
    var zeroBox = document.getElementById('sdZero275');
    if (!input) { return; }
    var total = rows.length;
    function sdApply275() {
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
    function sdClearFn275() {
      input.value = '';
      sdApply275();
      input.blur();
    }
    input.addEventListener('input', sdApply275);
    if (clearBtn) { clearBtn.addEventListener('click', sdClearFn275); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); sdClearFn275(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ev.preventDefault();
      input.focus();
      input.select();
    });
    window.__sdQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: sdApply275,
      clear: sdClearFn275
    };
  })();
  (function () {
    /* session275 — se275 তাৎক্ষণিক-ফিল্টার (স্বাধীন-স্ট্রিপ: page-'f'-শ্রোতা-নেই — s269 দ্বৈত-স্ট্রিপ-চুক্তি; __seQA) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-se-row]'));
    var input = document.getElementById('seFilter275');
    var clearBtn = document.getElementById('seClear275');
    var countChip = document.getElementById('seCount275');
    var zeroBox = document.getElementById('seZero275');
    if (!input) { return; }
    var total = rows.length;
    function seApply275() {
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
    function seClearFn275() {
      input.value = '';
      seApply275();
      input.blur();
    }
    input.addEventListener('input', seApply275);
    if (clearBtn) { clearBtn.addEventListener('click', seClearFn275); }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); seClearFn275(); }
    });
    window.__seQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: seApply275,
      clear: seClearFn275
    };
  })();
</script>
<style>
    /* session275 — sd275/se275 তাৎক্ষণিক-ফিল্টার স্টাইল (s274-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; sd=ভায়োলেট সুপার-থিম, se=ব্লু) */
    .sd275-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 12px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .sd275-ico { color: var(--lf-violet-600); opacity: .75; }
    .sd275-input { flex: 1 1 220px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-violet-soft); transition: none; }
    .sd275-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-violet-600) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-violet-600) 15%, transparent); }
    .sd275-clear { border: 0; background: transparent; color: var(--lf-violet-600); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .sd275-clear:hover { background: var(--lf-violet-soft); }
    .sd275-clear:active { transform: scale(.96); }
    .sd275-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-violet-deep); background: var(--lf-violet-soft-2); }
    .sd275-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .sd275-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-violet-600) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-violet-deep); background: var(--lf-white); }
    .sd275-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; padding: 12px 14px; border: 1px dashed color-mix(in srgb, var(--lf-violet-600) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-violet-soft); }
    .se275-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 12px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .se275-ico { color: var(--lf-blue-600); opacity: .75; }
    .se275-input { flex: 1 1 220px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-blue-soft); transition: none; }
    .se275-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-blue-600) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-blue-600) 15%, transparent); }
    .se275-clear { border: 0; background: transparent; color: var(--lf-blue-600); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .se275-clear:hover { background: var(--lf-blue-soft); }
    .se275-clear:active { transform: scale(.96); }
    .se275-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-blue-800); background: var(--lf-blue-soft-2); }
    .se275-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0 0; padding: 12px 14px; border: 1px dashed color-mix(in srgb, var(--lf-blue-600) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-blue-soft); }
    .sd275-count-chip[hidden] { display: none; }
    .sd275-zero[hidden] { display: none; }
    .se275-count-chip[hidden] { display: none; }
    .se275-zero[hidden] { display: none; }
    [data-sd-row][hidden], [data-se-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .sd275-clear:active, .se275-clear:active { transform: none; } }
    @media (max-width: 640px) { .sd275-kbd-hint { display: none; } .sd275-instant, .se275-instant { padding: 9px 11px; } }
  </style>
</body>'''
if count(view, '</body>') != 1: fatal('</body> অনন্য-নয়')
view = view.replace('</body>', BLOCK, 1)

# ══════════════════════════════════════════════════════════════════════════════
# পোস্ট-অ্যাসার্ট (write-এর-আগে)
# ══════════════════════════════════════════════════════════════════════════════
post = {
    'ovconfirm': count(view, 'data-ov-confirm'),
    'statbox': count(view, 'stat-box'),
    'ovempty': count(view, 'ov-empty'),
    'ovlist': count(view, 'ov-list'),
    'recentlist': count(view, 'recent-list'),
    'dashcols': count(view, 'dash-cols'),
    'cardtitle': count(view, 'card-title'),
    'formpost': count(view, '<form method="POST"'),
    'foreach': count(view, 'forEach'),
    'ael': count(view, '.addEventListener('),
    'arialabel': count(view, 'aria-label'),
    'fatimes': count(view, 'fa-times'),
    'faxmark': count(view, 'fa-xmark'),
    'fafilter': count(view, 'fa-filter'),
    'fafilterspace': count(view, 'fa-filter '),
    'fafcx': count(view, 'fa-filter-circle-xmark'),
    'famag': count(view, 'fa-magnifying-glass'),
    'facirclex': count(view, 'fa-circle-xmark'),
    'sdi': count(view, 'id="sdInstant275"'), 'sdf': count(view, 'id="sdFilter275"'),
    'sdc': count(view, 'id="sdClear275"'), 'sdcc': count(view, 'id="sdCount275"'),
    'sdz': count(view, 'id="sdZero275"'),
    'sei': count(view, 'id="seInstant275"'), 'sef': count(view, 'id="seFilter275"'),
    'sec': count(view, 'id="seClear275"'), 'secc': count(view, 'id="seCount275"'),
    'sez': count(view, 'id="seZero275"'),
    'sdhook': count(view, 'window.__sdQA'), 'sehook': count(view, 'window.__seQA'),
    'sdapply': count(view, 'sdApply275'), 'seapply': count(view, 'seApply275'),
    'sdclearfn': count(view, 'sdClearFn275'), 'seclearfn': count(view, 'seClearFn275'),
    'dsdrow': count(view, 'data-sd-row="'), 'dserow': count(view, 'data-se-row="'),
    'dakw': count(view, 'data-kw="'),
}
asserts = [
    ('data-sd-row == data-se-row == data-kw/2 (টেমপ্লেট ×১)', post['dsdrow'] == 1 and post['dserow'] == 1 and post['dakw'] == 2, f"{post['dsdrow']}/{post['dserow']}/{post['dakw']}"),
    ('data-ov-confirm অপরিবর্তিত', post['ovconfirm'] == pre['ovconfirm'], str(post['ovconfirm'])),
    ('stat-box ×৮ অপরিবর্তিত', post['statbox'] == 8, str(post['statbox'])),
    ('ov-empty ×২ অপরিবর্তিত', post['ovempty'] == 2, str(post['ovempty'])),
    ('ov-list/recent-list/dash-cols/card-title/form অপরিবর্তিত', post['ovlist'] == pre['ovlist'] and post['recentlist'] == pre['recentlist'] and post['dashcols'] == pre['dashcols'] and post['cardtitle'] == pre['cardtitle'] and post['formpost'] == pre['formpost'], f"{post['ovlist']}/{post['recentlist']}/{post['dashcols']}/{post['cardtitle']}/{post['formpost']}"),
    ('forEach প্রি৬→পোস্ট৮ (+২ rows.forEach)', post['foreach'] == pre['foreach'] + 2, f"{pre['foreach']}→{post['foreach']}"),
    ('addEventListener প্রি১→পোস্ট৮ (+৭)', post['ael'] == pre['ael'] + 7, f"{pre['ael']}→{post['ael']}"),
    ('aria-label +৪ (দ্বৈত-স্ট্রিপ: input+clear ×২)', post['arialabel'] == pre['arialabel'] + 4, f"{pre['arialabel']}→{post['arialabel']}"),
    ('আইকন ×১-প্রতি-নতুন + fa-times প্রি-সচেতন', post['fatimes'] == pre['fatimes'] + 1 and post['faxmark'] == 1 and post['fafilterspace'] == 1 and post['fafcx'] == 1 and post['famag'] == 1 and post['facirclex'] == 1 and post['fafilter'] == 2, f"ft={post['fatimes']} fx={post['faxmark']} ff={post['fafilter']} ffcx={post['fafcx']} mag={post['famag']} cx={post['facirclex']}"),
    ('স্ট্রিপ-উপাদান ×১-প্রতি-আইডি', post['sdi'] == 1 and post['sdf'] == 1 and post['sdc'] == 1 and post['sdcc'] == 1 and post['sdz'] == 1 and post['sei'] == 1 and post['sef'] == 1 and post['sec'] == 1 and post['secc'] == 1 and post['sez'] == 1, 'strip-elems'),
    ('__sdQA + __seQA হুক ×১', post['sdhook'] == 1 and post['sehook'] == 1, 'hooks'),
    ('sdApply275/seApply275 ×৪ (def+৩-রেফ)', post['sdapply'] == 4 and post['seapply'] == 4, f"{post['sdapply']}/{post['seapply']}"),
    ('sdClearFn275/seClearFn275 ×৪ (def+৩-রেফ)', post['sdclearfn'] == 4 and post['seclearfn'] == 4, f"{post['sdclearfn']}/{post['seclearfn']}"),
]
for name, cond, detail in asserts:
    if not cond: fatal(f'পোস্ট-অ্যাসার্ট ব্যর্থ: {name} ({detail})')

# হেক্স-শূন্য (sd275/se275-স্টাইল-ব্লক)
m = re.search(r'/\* session275 — sd275/se275 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', view, re.S)
if not m: fatal('স্টাইল-ব্লক-নিষ্কাশন ব্যর্থ')
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', m.group(0))
if hexes: fatal(f'স্টাইল-ব্লকে হেক্স-রং: {hexes[:5]}')

# সঠিক-বাইট ×৫ hidden-গার্ড
for guard in ('[data-sd-row][hidden], [data-se-row][hidden] { display: none !important; }',
              '.sd275-count-chip[hidden] { display: none; }',
              '.sd275-zero[hidden] { display: none; }',
              '.se275-count-chip[hidden] { display: none; }',
              '.se275-zero[hidden] { display: none; }'):
    if guard not in view: fatal(f'hidden-গার্ড-বাইট অনুপস্থিত: {guard}')

open(VIEW, 'w', encoding='utf-8').write(view)
print(f'PATCHED: {VIEW} ({orig_len} → {len(view)} বাইট)')
print('  sd275+se275 দ্বৈত-সারফেস যুক্ত + সঠিক-বাইট ×৫ + হেক্স-শূন্য + PRESERVE-মানচিত্র-গ্রিন')
