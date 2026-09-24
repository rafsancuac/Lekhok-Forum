#!/usr/bin/env python3
# s302-patch.py — session302: ① dqf302 /moderator/daily/:type তাৎক্ষণিক-ফিল্টার (**checked-pinned
#                  চুক্তি** — চেক-করা-সারি সর্বদা-দৃশ্যমান → bulk-delete-হিডেন-ঝুঁকি-শূন্য; PLANS
#                  session301-প্রস্তাব) ② ep302 মাস-প্যানেল-কোষ-ইচ্ছা-প্রিফেচ (ep283-মাস-গ্রিড —
#                  ক্লিক-কনভেনশন-মিরর; PLANS session301-প্রস্তাব) ③ [Mandatory-স্টাইল] দুই-ব্লক
#                  (হেক্স-শূন্য টোকেন-শুধু)
# চুক্তি: মার্কার-গার্ড-প্রথম + idempotent ×N + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট
#         (h-bracket-ক্ষয়-বাইট-যাচাই; CSS-ব্লক হেক্স-শূন্য; EJS-ইনলাইন-স্ক্রিপ্টে '<%'-শূন্য)
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
DF  = APP + '/views/user/moderator-daily-form.ejs'
EJS = APP + '/views/user/epaper.ejs'
EP  = APP + '/public/assets/css/epaper.css'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def hexzero(css, tag):
    body = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits:
        die('%s-ব্লকে হেক্স-লিটারাল: %s' % (tag, hits[:4]))

# ═══════════ ফাইল-১: moderator-daily-form.ejs (dqf302) ═══════════
w = rd(DF)
DF_DONE = ('dqfFilter302' in w)

if DF_DONE:
    print('DF-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    for NS in ('dqf302', 'dqf-instant', '__dqf302QA'):
        if NS in w:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)

    # ── অ্যাঙ্কর-১: সারি-লুপে মার্ক + দ্বিভাষিক data-kw ──
    A1 = ('    <% items.forEach(it => { %>\n'
          '      <div class="mod-item">\n'
          '        <input type="checkbox" name="bulk_ids" value="<%= it.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">')
    if w.count(A1) != 1:
        die('অ্যাঙ্কর-১-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A1))
    B1 = ('''    <% items.forEach(function (it, dqfI302) { var dqfKw302 = ['#' + it.id, it.title || '', it.scheduled_date || '', type || '', (type === 'quiz' ? ((it.parsedOptions && it.parsedOptions.length >= 2) ? 'interactive ইন্টারঅ্যাক্টিভ' : 'static স্ট্যাটিক') : '')].filter(Boolean).join(' '); %>
      <div class="mod-item" data-dqf-row302="<%= it.id %>" data-kw="<%= dqfKw302 %>">
        <input type="checkbox" name="bulk_ids" value="<%= it.id %>" aria-label="সিলেক্ট" style="width:16px;height:16px;flex-shrink:0;margin-right:4px;">''')
    w = w.replace(A1, B1)

    # ── অ্যাঙ্কর-২: স্ট্রিপ + শূন্য-অবস্থা (h3-র পরে, bulk-form-এর আগে — form-বহির্ভূত) ──
    A2 = '''  <form method="POST" action="/moderator/daily/bulk-delete" class="bulk-bar" id="bulkBar">'''
    if w.count(A2) != 1:
        die('অ্যাঙ্কর-২-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A2))
    B2 = '''    <div class="dqf-instant" id="dqfInstant302">
      <i class="fas fa-filter dqf-instant-ico" aria-hidden="true"></i>
      <input type="text" id="dqfFilter302" class="dqf-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / #আইডি / তারিখ / ধরন" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="dqfClear302" class="dqf-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="dqf-count-chip" id="dqfCount302" hidden></span>
      <span class="dqf-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন · <kbd>↵</kbd> প্রথম-মিল</span>
    </div>
    <div class="dqf-zero" id="dqfZero302" data-dqf-empty hidden>
      <i class="fas fa-calendar-day" aria-hidden="true"></i>
      <span>কোনো পোস্ট মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>
''' + A2
    w = w.replace(A2, B2)

    # ── অ্যাঙ্কর-৩: স্টাইল + ইঞ্জিন (main.js-লোডারের আগে) ──
    A3 = '  <script src="/assets/js/main.js?v=<%= AV %>"></script>'
    if w.count(A3) != 1:
        die('অ্যাঙ্কর-৩-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A3))
    B3 = r'''  <style>
/* session302 — দৈনিক-পোস্ট তাৎক্ষণিক-ফিল্টার (dqf302 — হেক্স-শূন্য টোকেন-শুধু; bwf301/re261-মিরর) */
.dqf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.dqf-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.dqf-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.dqf-instant-input:hover { border-color: color-mix(in srgb, var(--lf-brandgreen) 25%, transparent); }
.dqf-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.dqf-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.dqf-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.dqf-instant-clear:active { transform: scale(.96); }
.dqf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.dqf-count-chip[hidden] { display: none; }
.dqf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.dqf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.dqf-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.dqf-zero[hidden] { display: none; }
.mod-item[data-dqf-row302][hidden] { display: none !important; }
.mod-item.dqf-flash302 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .dqf-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .dqf-kbd-hint { display: none; } .dqf-instant { padding: 9px 11px; } }
  </style>
  <script>
  (function () {
    'use strict';
    /* session302 — dqf302 তাৎক্ষণিক-ফিল্টার (bwf301/re261-চুক্তি-মিরর + **checked-pinned চুক্তি**):
       চেক-করা bulk_ids-চেকবক্সের সারি ফিল্টারে-ও-দৃশ্যমান থাকে → bulk-delete কখনো অদৃশ্য-সারি-মুছে-না;
       sidebar.ejs-বাল্ক-স্ক্রিপ্টের সাথে-সহাবস্থান: bulk-all/target-level sync আগে → document-ডেলিগেশনে
       apply() পরে (বাবল-ক্রম) → সব-চেক-পথেও পিন-সামঞ্জস্য; রানটাইম-ইনডেক্স + boot-apply-init +
       'f'-ফোকাস + Escape + Enter-firstMatch-ফোকাস+ফ্ল্যাশ (প্রাথমিক-অ্যাঙ্কর = bulk-checkbox —
       delete-বাটন-ফোকাস-বিপজ্জনক) + __dqf302QA হুক ×৯ রো-শূন্যে-ও-সংজ্ঞায়িত */
    var input = document.getElementById('dqfFilter302');
    var surface = document.getElementById('dqfInstant302');
    var countChip = document.getElementById('dqfCount302');
    var clearBtn = document.getElementById('dqfClear302');
    var zeroBox = document.getElementById('dqfZero302');
    function bn302(n) { return String(n).replace(/\d/g, function (d302) { return '০১২৩৪৫৬৭৮৯'[d302]; }); }
    function dqfIndex302() {
      return Array.prototype.slice.call(document.querySelectorAll('.mod-item[data-dqf-row302]'));
    }
    function dqfMatches302() {
      return dqfIndex302().filter(function (r302) { return !r302.hidden; });
    }
    function dqfPinned302() {
      return dqfIndex302().filter(function (r302) {
        var cb302 = r302.querySelector('input[name="bulk_ids"]');
        return !!(cb302 && cb302.checked);
      }).length;
    }
    function dqfApply302() {
      if (!input) return;
      var q = (input.value || '').trim().toLowerCase();
      var rows302 = dqfIndex302();
      var shown = 0;
      rows302.forEach(function (row302) {
        var cb302 = row302.querySelector('input[name="bulk_ids"]');
        var pinned302 = !!(cb302 && cb302.checked);
        var kw = (row302.getAttribute('data-kw') || '').toLowerCase();
        var hit = pinned302 || !q || kw.indexOf(q) !== -1;
        row302.hidden = !hit;
        if (hit) shown++;
      });
      if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = bn302(shown) + ' / ' + bn302(rows302.length); } }
      if (clearBtn) { clearBtn.hidden = !q; }
      if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
    }
    function dqfClear302() {
      if (!input) return;
      input.value = '';
      dqfApply302();
      input.focus();
    }
    if (input) {
      input.addEventListener('input', dqfApply302);
      input.addEventListener('keydown', function (e302) {
        if (e302.key === 'Escape') { e302.stopPropagation(); dqfClear302(); return; }
        if (e302.key === 'Enter') {
          var first302 = dqfMatches302()[0];
          if (first302) {
            e302.preventDefault();
            var cb302 = first302.querySelector('input[name="bulk_ids"]');
            if (cb302) { cb302.focus(); }
            first302.classList.add('dqf-flash302');
            setTimeout(function () { first302.classList.remove('dqf-flash302'); }, 900);
          }
        }
      });
      document.addEventListener('keydown', function (e302) {
        if (e302.key !== 'f' || e302.altKey || e302.ctrlKey || e302.metaKey) { return; }
        var t302 = e302.target;
        if (t302 && (t302.tagName === 'INPUT' || t302.tagName === 'TEXTAREA' || t302.tagName === 'SELECT' || t302.isContentEditable)) { return; }
        e302.preventDefault();
        input.focus();
        input.select();
      });
      /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
         bulk-all-এর নিজস্ব target-level হ্যান্ডলার আগে-চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
      document.addEventListener('change', function (e302) {
        if (!e302.target || !e302.target.matches) { return; }
        if (e302.target.matches('input[name="bulk_ids"],[data-bulk-all]')) { dqfApply302(); }
      });
      dqfApply302(); /* boot-apply-init — session300-শিক্ষা */
    }
    window.__dqf302QA = {
      surface: function () { return surface ? surface.id : ''; },
      rows: function () { return dqfIndex302().length; },
      matches: function () { return dqfMatches302().length; },
      total: function () { return dqfIndex302().length; },
      active: function () { return !!(input && (input.value || '').trim()); },
      pinned: function () { return dqfPinned302(); },
      firstMatch: function () { var f302 = dqfMatches302()[0]; return f302 ? (f302.getAttribute('data-dqf-row302') || '') : ''; },
      apply: dqfApply302,
      clear: dqfClear302
    };
  })();
  </script>
''' + A3
    w = w.replace(A3, B3)

    # ── পোস্ট-অ্যাসার্ট ──
    if w.count('data-dqf-row302=') != 1:
        die('পোস্ট-অ্যাসার্ট: মার্কআপ-attr count=%d (প্রত্যাশা ১)' % w.count('data-dqf-row302='))
    if w.count('[data-dqf-row302]') != 2:
        die('পোস্ট-অ্যাসার্ট: সিলেক্টর count=%d (প্রত্যাশা ২)' % w.count('[data-dqf-row302]'))
    if w.count('hidden]') < 3:
        die('পোস্ট-অ্যাসার্ট: hidden-গার্ড-ক্ষয়-সন্দেহ (count=%d)' % w.count('hidden]'))
    css_start = w.find('/* session302 — দৈনিক-পোস্ট')
    css_end = w.find('</style>', css_start)
    if css_start < 0 or css_end < 0:
        die('পোস্ট-অ্যাসার্ট: dqf-CSS-ব্লক-অনুপস্থিত')
    hexzero(w[css_start:css_end], 'dqf302-CSS')
    with open(DF, 'w', encoding='utf-8') as f:
        f.write(w)
    print('DF-OK: dqf302 স্ট্রিপ+ইঞ্জিন+স্টাইল (checked-pinned)')

# ═══════════ ফাইল-২: epaper.ejs (ep302 মাস-প্যানেল-প্রিফেচ) ═══════════
v = rd(EJS)
EJS_DONE = ('ep302MonFire' in v)

if EJS_DONE:
    print('EJS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    for NS in ('ep302MonFire', "'mon-focus'", '__ep302'):
        if NS in v:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)
    if 'epk301CalFire' not in v:
        die('ep301-ভিত্তি-অনুপস্থিত (s301-প্যাচ-আগে-চালান)')

    # ── অ্যাঙ্কর-৪: __epk300QA হুকে months-গেটার (lazy — papers-শূন্যে-ও নিরাপদ) ──
    A4 = ("    cells: function () { try { return document.querySelectorAll('.ep-cal-day.epk300-warm').length; } catch (e301) { return 0; } }\n"
          "  };")
    if v.count(A4) != 1:
        die('অ্যাঙ্কর-৪-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A4))
    B4 = ("    cells: function () { try { return document.querySelectorAll('.ep-cal-day.epk300-warm').length; } catch (e301) { return 0; } },\n"
          "    months: function () { try { return document.querySelectorAll('.ep-cal-m.epk300-warm').length; } catch (e302) { return 0; } }\n"
          "  };")
    v = v.replace(A4, B4)

    # ── অ্যাঙ্কর-৫: ep301-ব্লকের পরে মাস-প্যানেল-ডেলিগেশন ──
    A5 = ("    elCalGrid.addEventListener('focusin', function (e301) {\n"
          "      var c301 = e301.target && e301.target.closest ? e301.target.closest('.ep-cal-day') : null;\n"
          "      if (c301) epk301CalFire(c301, 'cal-focus');\n"
          "    });\n"
          "  }\n"
          "})();")
    if v.count(A5) != 1:
        die('অ্যাঙ্কর-৫-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A5))
    B5 = r'''    elCalGrid.addEventListener('focusin', function (e301) {
      var c301 = e301.target && e301.target.closest ? e301.target.closest('.ep-cal-day') : null;
      if (c301) epk301CalFire(c301, 'cal-focus');
    });
  }

  /* session302: মাস-প্যানেল-কোষ-ইচ্ছা (PLANS session301-প্রস্তাব) — ডেলিগেশন (mouseover+focusin —
     ep283Render-পুনঃরেন্ডার-নিরাপদ); শুধু .ep-cal-m.has (তথ্য-আছে মাস — disabled/শূন্য-মাস-শূন্য);
     ep283-ক্লিক-কনভেনশন-মিরর: YYYY-MM-প্রিফিক্স → byDate-কী-সর্ট-প্রথম = ঐ-মাসের প্রথম-সংরক্ষিত-দিন
     → arr[0] = ঐ-দিনের সর্বশেষ-পত্রিকা → /epaper?file=<id>; বুট/panel-open/calJump-প্রিফেচ-নিষিদ্ধ —
     ইচ্ছা-গেট-ধর্ম অক্ষুণ্ণ; উষ্ণ-মিরর warmed-has-ভিত্তিক (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা) */
  if (elCalMGrid) {
    var ep302MonFire = function (cell302, reason302) {
      if (!cell302.classList.contains('has') || cell302.disabled) return;
      var mo302 = +cell302.getAttribute('data-m');
      if (isNaN(mo302)) return;
      var pre302 = ep283Year + '-' + ('0' + (mo302 + 1)).slice(-2) + '-';
      var first302 = Object.keys(byDate).filter(function (iso302) { return String(iso302).indexOf(pre302) === 0; }).sort()[0];
      if (!first302) return;
      var arr302 = byDate[first302];
      var p302 = arr302 && arr302.length ? arr302[0] : null;
      if (!p302 || !p302.id) return;
      var u302 = epk300Url300(p302.id);
      epk300Prefetch300(u302, reason302);
      cell302.classList[epk300Warmed[u302] ? 'add' : 'remove']('epk300-warm');
    };
    elCalMGrid.addEventListener('mouseover', function (e302) {
      var c302 = e302.target && e302.target.closest ? e302.target.closest('.ep-cal-m') : null;
      if (c302) ep302MonFire(c302, 'mon');
    });
    elCalMGrid.addEventListener('focusin', function (e302) {
      if (ep302Quiet302) return; /* panel-open arm-focus-সাপ্রেস — ইচ্ছা-গেট-ধর্ম */
      var c302 = e302.target && e302.target.closest ? e302.target.closest('.ep-cal-m') : null;
      if (c302) ep302MonFire(c302, 'mon-focus');
    });
  }
})();'''
    v = v.replace(A5, B5)

    # ── অ্যাঙ্কর-৬: ep283OpenPanel wrapper (quiet-window — sync arm-focus-সাপ্রেশন) ──
    A6 = ("  ep283OpenPanel = function () { ep286OpenPanelBase(); if (ep283Open) ep286Arm(); };")
    if v.count(A6) != 1:
        die('অ্যাঙ্কর-৭-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A6))
    B6 = ('  ep283OpenPanel = function () { ep286OpenPanelBase(); if (ep283Open) ep286Arm(); };\n'
         '  /* session302: প্যানেল-খোলার arm-ফোকাস (ep286Arm → focus) = ইচ্ছা-নয় (ep299-ধর্ম) — sync-quiet-জানালায়\n'
         '     ep302-ফোকাস-প্রিফেচ-সাপ্রেস (ep290-wrapper-প্যাটার্ন-মিরর); ব্যবহারকারীর Tab-ফোকাস = পরের-টাস্কে = ইচ্ছা */\n'
         '  var ep302Quiet302 = false;\n'
         '  var ep302OpenBase302 = ep283OpenPanel;\n'
         '  ep283OpenPanel = function () { ep302Quiet302 = true; ep302OpenBase302(); ep302Quiet302 = false; };')
    v = v.replace(A6, B6)
    # ── পোস্ট-অ্যাসার্ট ──
    if v.count('ep302MonFire') != 3:
        die('পোস্ট-অ্যাসার্ট: ep302MonFire count=%d (প্রত্যাশা ৩)' % v.count('ep302MonFire'))
    if "months: function () { try { return document.querySelectorAll('.ep-cal-m.epk300-warm').length;" not in v:
        die('পোস্ট-অ্যাসার্ট: months-গেটার-অনুপস্থিত')
    if v.count('ep302Quiet302') < 3:
        die('পোস্ট-অ্যাসার্ট: quiet-window count=%d (প্রত্যাশা >=৩)' % v.count('ep302Quiet302'))
    if '<%' in B5:
        die('পোস্ট-অ্যাসার্ট: ইনলাইন-স্ক্রিপ্টে EJS-ট্যাগ')
    with open(EJS, 'w', encoding='utf-8') as f:
        f.write(v)
    print('EJS-OK: ep302 মাস-প্যানেল-প্রিফেচ + হুক-months')

# ═══════════ ফাইল-৩: epaper.css (session302-ব্লক — [Mandatory-স্টাইল]) ═══════════
c = rd(EP)
if 'session302' in c:
    print('EP-CSS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    B6 = r'''
/* ═══ session302 — মাস-প্যানেল উষ্ণ-সংকেত (ep302; PLANS session301-প্রস্তাব)
   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + color-mix + :not()-সংঘর্ষ-বিচ্ছিন্নতা (is-cur-অস্পৃশ্য)
   + 640px-সংকোচন + reduced-motion (session301-সুপারসেট) ═══ */
/* ① উষ্ণ-মাস-কোষ — প্রিফেচড-মাসের সেল প্রস্তুত-অবস্থা (রিং + টিন্ট; is-cur-অস্পৃশ্য) */
.ep-cal-m.epk300-warm:not(.is-cur) {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--lf-brand-primary) 10%, transparent);
}
/* ② মাস-কোষ-ট্রানজিশন-সম্প্রসারণ */
.ep-cal-m { transition: color .15s ease, background .15s ease, box-shadow .22s ease; }
/* ③ 640px-সংকোচন */
@media (max-width: 640px) {
  .ep-cal-m.epk300-warm:not(.is-cur) { box-shadow: 0 0 0 1px color-mix(in srgb, var(--lf-brand-primary) 35%, transparent); }
}
/* ④ রিডিউসড-মোশন গার্ড */
@media (prefers-reduced-motion: reduce) {
  .ep-cal-m { animation: none; transition: none; }
}
'''
    hexzero(B6, 'epaper-session302')
    with open(EP, 'w', encoding='utf-8') as f:
        f.write(c.rstrip() + '\n' + B6)
    print('EP-CSS-OK: session302 ব্লক (উষ্ণ-মাস-কোষ)')

print('S302-PATCH-DONE')
