#!/usr/bin/env python3
# s301-patch.py — session301: ① ep301 ক্যালেন্ডার-দিন-সেল-ইচ্ছা-প্রিফেচ (epk300-ফানেল-পুনঃব্যবহার;
#                  PLANS session300-প্রস্তাব) ② bwf301 /moderator/best-writer তাৎক্ষণিক-ফিল্টার
#                  (lsf298/re261-চুক্তি-মিরর + boot-apply-init — session300-শিক্ষা) ③ ofx301 টপবার
#                  মোবাইল-ক্লিপ ফিক্স (body+21px-উৎস-নির্মূল — PLANS session294-তদন্ত-প্রস্তাব)
#                  ④ [Mandatory-স্টাইল] epaper.css session301-ব্লক + bwf-স্ট্রিপ-স্টাইল (হেক্স-শূন্য)
# চুক্তি: মার্কার-গার্ড অ্যাঙ্কর-অ্যাসার্টের-আগে + idempotent ×N + নেমস্পেস-গার্ড + অ্যাঙ্কর-এককতা-FATAL +
#         পোস্ট-অ্যাসার্ট (ইউনিক-সম্পূর্ণ-লাইন; h-bracket-ক্ষয়-বাইট-যাচাই — session298/299-গোটচা;
#         CSS-ব্লক হেক্স-শূন্য; EJS-ইনলাইন-স্ক্রিপ্টে '<%'-শূন্য)
import sys, re

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/user/epaper.ejs'
BW  = APP + '/views/user/moderator-best-writer.ejs'
EP  = APP + '/public/assets/css/epaper.css'
ST  = APP + '/public/assets/css/style.css'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

def hexzero(css, tag):
    body = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits:
        die('%s-ব্লকে হেক্স-লিটারাল: %s' % (tag, hits[:4]))

# ═══════════ ফাইল-১: epaper.ejs (ep301) ═══════════
v = rd(EJS)
EJS_DONE = ('epk301CalFire' in v)

if EJS_DONE:
    print('EJS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    for NS in ('epk301CalFire', "'cal-focus'", '__epk301'):
        if NS in v:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)
    if 'epk300Prefetch300' not in v or '__epk300QA' not in v:
        die('epk300-ভিত্তি-অনুপস্থিত (সেশন৩০০-প্যাচ-আগে-চালান)')

    # ── অ্যাঙ্কর-১: __epk300QA হুকে cells-গেটার (lazy — রো-শূন্যে-ও নিরাপদ) ──
    A1 = ("    pills: function () { try { return document.querySelectorAll('.ep-strip294-pill').length; } catch (e300) { return 0; } }\n"
          "  };")
    if v.count(A1) != 1:
        die('অ্যাঙ্কর-১-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A1))
    B1 = ("    pills: function () { try { return document.querySelectorAll('.ep-strip294-pill').length; } catch (e300) { return 0; } },\n"
          "    cells: function () { try { return document.querySelectorAll('.ep-cal-day.epk300-warm').length; } catch (e301) { return 0; } }\n"
          "  };")
    v = v.replace(A1, B1)

    # ── অ্যাঙ্কর-২: তালিকা-focusin-ব্লকের পরে ক্যালেন্ডার-সেল-ডেলিগেশন ──
    A2 = ("  elList.addEventListener('focusin', function (e300) {\n"
          "    var it300 = e300.target && e300.target.closest ? e300.target.closest('.ep-item') : null;\n"
          "    if (it300 && it300.getAttribute('data-id')) {\n"
          "      var u300 = epk300Url300(it300.getAttribute('data-id'));\n"
          "      epk300Prefetch300(u300, 'item-focus');\n"
          "      it300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');\n"
          "    }\n"
          "  });\n"
          "})();")
    if v.count(A2) != 1:
        die('অ্যাঙ্কর-২-অনন্যতা-ব্যর্থ (count=%d)' % v.count(A2))
    B2 = r'''  elList.addEventListener('focusin', function (e300) {
    var it300 = e300.target && e300.target.closest ? e300.target.closest('.ep-item') : null;
    if (it300 && it300.getAttribute('data-id')) {
      var u300 = epk300Url300(it300.getAttribute('data-id'));
      epk300Prefetch300(u300, 'item-focus');
      it300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');
    }
  });

  /* session301: ক্যালেন্ডার-দিন-সেল-ইচ্ছা (PLANS session300-প্রস্তাব) — ডেলিগেশন (mouseover+focusin —
     calRender-পুনঃরেন্ডার-নিরাপদ); শুধু .ep-cal-day.has (সংরক্ষিত-সংখ্যা-আছে দিন — ভবিষ্যৎ/শূন্য-দিন
     প্রিফেচ-শূন্য); byDate[iso] → ঐ-দিনের প্রথম-পত্রিকা → /epaper?file=<id>; বুট/calJump-প্রিফেচ-নিষিদ্ধ —
     ইচ্ছা-গেট-ধর্ম অক্ষুণ্ণ (ep299/ep300-ধর্ম); উষ্ণ-মিরর warmed-has-ভিত্তিক (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা) */
  if (elCalGrid) {
    var epk301CalFire = function (cell301, reason301) {
      var iso301 = cell301.getAttribute('data-d');
      if (!iso301 || !cell301.classList.contains('has')) return;
      var arr301 = byDate[iso301];
      var p301 = arr301 && arr301.length ? arr301[0] : null; /* প্রতি-তারিখে-অ্যারে — date-DESC-প্রথম = সর্বশেষ-সংখ্যা (s300-কনভেনশন) */
      if (!p301 || !p301.id) return;
      var u301 = epk300Url300(p301.id);
      epk300Prefetch300(u301, reason301);
      cell301.classList[epk300Warmed[u301] ? 'add' : 'remove']('epk300-warm');
    };
    elCalGrid.addEventListener('mouseover', function (e301) {
      var c301 = e301.target && e301.target.closest ? e301.target.closest('.ep-cal-day') : null;
      if (c301) epk301CalFire(c301, 'cal');
    });
    elCalGrid.addEventListener('focusin', function (e301) {
      var c301 = e301.target && e301.target.closest ? e301.target.closest('.ep-cal-day') : null;
      if (c301) epk301CalFire(c301, 'cal-focus');
    });
  }
})();'''
    v = v.replace(A2, B2)

    # ── পোস্ট-অ্যাসার্ট ──
    if v.count('epk301CalFire') != 3:
        die('পোস্ট-অ্যাসার্ট: epk301CalFire count=%d (প্রত্যাশা ৩)' % v.count('epk301CalFire'))
    if "cells: function () { try { return document.querySelectorAll('.ep-cal-day.epk300-warm').length;" not in v:
        die('পোস্ট-অ্যাসার্ট: cells-গেটার-অনুপস্থিত')
    if '<%' in B2:
        die('পোস্ট-অ্যাসার্ট: ইনলাইন-স্ক্রিপ্টে EJS-ট্যাগ')
    wr(EJS, v)
    print('EJS-OK: ep301 ক্যালেন্ডার-সেল-প্রিফেচ + হুক-cells')

# ═══════════ ফাইল-২: moderator-best-writer.ejs (bwf301) ═══════════
w = rd(BW)
BW_DONE = ('bwfFilter301' in w)

if BW_DONE:
    print('BW-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    for NS in ('bwf301', 'bwf-instant', '__bwf301QA'):
        if NS in w:
            die('নেমস্পেস-%s-পূর্ব-উপস্থিত (গার্ড)' % NS)

    # ── অ্যাঙ্কর-৩: সারি-লুপে মার্ক + দ্বিভাষিক data-kw ──
    A3 = ('    <% articles.forEach(a => { %>\n'
          '      <div class="mod-item">')
    if w.count(A3) != 1:
        die('অ্যাঙ্কর-৩-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A3))
    B3 = ('    <% articles.forEach(function (a, bwfI301) { var bwfKw301 = [\'#\' + a.id, a.title || \'\', a.full_name || \'\', a.username || \'\', a.featured ? \'সেরা লেখক চিহ্নিত featured\' : \'সাধারণ\'].filter(Boolean).join(\' \'); %>\n'
          '      <div class="mod-item" data-bwf-row301="<%= a.id %>" data-kw="<%= bwfKw301 %>">')
    w = w.replace(A3, B3)

    # ── অ্যাঙ্কর-৪: স্ট্রিপ + শূন্য-অবস্থা মার্কআপ (intro-প্যারার পরে — form-বহির্ভূত) ──
    A4 = '    <p style="color:#666;">যে লেখাগুলো "সেরা লেখক" হিসেবে চিহ্নিত থাকবে সেগুলো <code>/best-writer</code> পেইজে দেখা যাবে এবং লেখককে নোটিফিকেশন যাবে।</p>'
    if w.count(A4) != 1:
        die('অ্যাঙ্কর-৪-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A4))
    B4 = A4 + '''
    <div class="bwf-instant" id="bwfInstant301">
      <i class="fas fa-filter bwf-instant-ico" aria-hidden="true"></i>
      <input type="text" id="bwfFilter301" class="bwf-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — শিরোনাম / লেখক / @ইউজারনেম / #আইডি / অবস্থা" autocomplete="off" aria-label="তাৎক্ষণিক ফিল্টার" />
      <button type="button" id="bwfClear301" class="bwf-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
      <span class="bwf-count-chip" id="bwfCount301" hidden></span>
      <span class="bwf-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন · <kbd>↵</kbd> প্রথম-মিল</span>
    </div>
    <div class="bwf-zero" id="bwfZero301" data-bwf-empty hidden>
      <i class="fas fa-star" aria-hidden="true"></i>
      <span>কোনো লেখা মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
    </div>'''
    w = w.replace(A4, B4)

    # ── অ্যাঙ্কর-৫: স্টাইল + ইঞ্জিন (main.js-লোডারের আগে) ──
    A5 = '  <script src="/assets/js/main.js?v=<%= AV %>"></script>'
    if w.count(A5) != 1:
        die('অ্যাঙ্কর-৫-অনন্যতা-ব্যর্থ (count=%d)' % w.count(A5))
    B5 = r'''  <style>
/* session301 — সেরা-লেখক তাৎক্ষণিক-ফিল্টার (bwf301 — হেক্স-শূন্য টোকেন-শুধু; re261/lsf298-মিরর) */
.bwf-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 10px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
.bwf-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
.bwf-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
.bwf-instant-input:hover { border-color: color-mix(in srgb, var(--lf-brandgreen) 25%, transparent); }
.bwf-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
.bwf-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
.bwf-instant-clear:hover { background: var(--lf-brandgreen-soft); }
.bwf-instant-clear:active { transform: scale(.96); }
.bwf-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
.bwf-count-chip[hidden] { display: none; }
.bwf-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
.bwf-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
.bwf-zero { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
.bwf-zero[hidden] { display: none; }
.mod-item[data-bwf-row301][hidden] { display: none !important; }
.mod-item.bwf-flash301 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .bwf-instant-clear:active { transform: none; } }
@media (max-width: 640px) { .bwf-kbd-hint { display: none; } .bwf-instant { padding: 9px 11px; } }
  </style>
  <script>
  (function () {
    'use strict';
    /* session301 — bwf301 তাৎক্ষণিক-ফিল্টার (lsf298/re261-চুক্তি-মিরর: রানটাইম-ইনডেক্স (per-apply DOM-পুনঃস্ক্যান —
       re-render/আন্ডু-নিরাপদ) + কাউন্ট-চিপ (বাংলা-অঙ্ক) + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + Enter-firstMatch-
       ফোকাস/ফ্ল্যাশ + boot-apply-init (session300-শিক্ষা — act=false: প্রশ্ন-খালি → দৃশ্যমান-প্রভাব-শূন্য,
       total() বুট-সত্য) + __bwf301QA হুক রো-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি)) */
    var input = document.getElementById('bwfFilter301');
    var surface = document.getElementById('bwfInstant301');
    var countChip = document.getElementById('bwfCount301');
    var clearBtn = document.getElementById('bwfClear301');
    var zeroBox = document.getElementById('bwfZero301');
    function bn301(n) { return String(n).replace(/\d/g, function (d301) { return '০১২৩৪৫৬৭৮৯'[d301]; }); }
    function bwfIndex301() {
      if (!surface) return [];
      return Array.prototype.slice.call(surface.parentNode.querySelectorAll('.mod-item[data-bwf-row301]'));
    }
    function bwfMatches301() {
      return bwfIndex301().filter(function (r301) { return !r301.hidden; });
    }
    function bwfApply301() {
      if (!input) return;
      var q = (input.value || '').trim().toLowerCase();
      var rows301 = bwfIndex301();
      var shown = 0;
      rows301.forEach(function (row301) {
        var kw = (row301.getAttribute('data-kw') || '').toLowerCase();
        var hit = !q || kw.indexOf(q) !== -1;
        row301.hidden = !hit;
        if (hit) shown++;
      });
      if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = bn301(shown) + ' / ' + bn301(rows301.length); } }
      if (clearBtn) { clearBtn.hidden = !q; }
      if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
    }
    function bwfClear301() {
      if (!input) return;
      input.value = '';
      bwfApply301();
      input.focus();
    }
    if (input) {
      input.addEventListener('input', bwfApply301);
      input.addEventListener('keydown', function (e301) {
        if (e301.key === 'Escape') { e301.stopPropagation(); bwfClear301(); return; }
        if (e301.key === 'Enter') {
          var first301 = bwfMatches301()[0];
          if (first301) {
            e301.preventDefault();
            var btn301 = first301.querySelector('button[type="submit"]');
            if (btn301) { btn301.focus(); }
            first301.classList.add('bwf-flash301');
            setTimeout(function () { first301.classList.remove('bwf-flash301'); }, 900);
          }
        }
      });
      document.addEventListener('keydown', function (e301) {
        if (e301.key !== 'f' || e301.altKey || e301.ctrlKey || e301.metaKey) { return; }
        var t301 = e301.target;
        if (t301 && (t301.tagName === 'INPUT' || t301.tagName === 'TEXTAREA' || t301.tagName === 'SELECT' || t301.isContentEditable)) { return; }
        e301.preventDefault();
        input.focus();
        input.select();
      });
      bwfApply301(); /* boot-apply-init — session300-শিক্ষা */
    }
    window.__bwf301QA = {
      surface: function () { return surface ? surface.id : ''; },
      rows: function () { return bwfIndex301().length; },
      matches: function () { return bwfMatches301().length; },
      total: function () { return bwfIndex301().length; },
      active: function () { return !!(input && (input.value || '').trim()); },
      firstMatch: function () { var f301 = bwfMatches301()[0]; return f301 ? (f301.getAttribute('data-bwf-row301') || '') : ''; },
      apply: bwfApply301,
      clear: bwfClear301
    };
  })();
  </script>
''' + A5
    w = w.replace(A5, B5)

    # ── পোস্ট-অ্যাসার্ট ──
    if w.count('data-bwf-row301=') != 1:
        die('পোস্ট-অ্যাসার্ট: মার্কআপ-attr count=%d (প্রত্যাশা ১)' % w.count('data-bwf-row301='))
    if w.count('[data-bwf-row301]') != 2:
        die('পোস্ট-অ্যাসার্ট: সিলেক্টর count=%d (প্রত্যাশা ২ — CSS+JS)' % w.count('[data-bwf-row301]'))
    if w.count('hidden]') < 3:
        die('পোস্ট-অ্যাসার্ট: hidden-গার্ড-ক্ষয়-সন্দেহ (count=%d)' % w.count('hidden]'))
    css_start = w.find('/* session301 — সেরা-লেখক')
    css_end = w.find('</style>', css_start)
    if css_start < 0 or css_end < 0:
        die('পোস্ট-অ্যাসার্ট: bwf-CSS-ব্লক-অনুপস্থিত')
    hexzero(w[css_start:css_end], 'bwf301-CSS')
    wr(BW, w)
    print('BW-OK: bwf301 স্ট্রিপ+ইঞ্জিন+স্টাইল')

# ═══════════ ফাইল-৩: epaper.css (session301-ব্লক — [Mandatory-স্টাইল]) ═══════════
c = rd(EP)
if 'session301' in c:
    print('EP-CSS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    B6 = r'''
/* ═══ session301 — ক্যালেন্ডার-দিন-সেল উষ্ণ-সংকেত + লোডিং-পোস্টার প্রবেশ (ep301; PLANS session300-প্রস্তাব)
   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + color-mix-অ্যাকসেন্ট + :not()-সংঘর্ষ-বিচ্ছিন্নতা (is-sel-অস্পৃশ্য)
   + 640px-সংকোচন + reduced-motion-সম্মান (session300-সুপারসেট) ═══ */
/* ① উষ্ণ-ক্যালেন্ডার-দিন — প্রিফেচড-সংখ্যার সেল প্রস্তুত-অবস্থা (রিং + টিন্ট; is-sel/is-today-অস্পৃশ্য) */
.ep-cal-day.epk300-warm:not(.is-sel) {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--lf-brand-primary) 8%, transparent);
}
/* ② সেল-ট্রানজিশন-সম্প্রসারণ (উষ্ণ-সংকেত-মসৃণ) */
.ep-cal-day { transition: color .15s ease, background .15s ease, box-shadow .22s ease; }
/* ③ লোডিং-পোস্টার প্রবেশ-পলিশ (onerror-কোট-ক্ষয়-ফিক্স-পরবর্তী দৃশ্যমানতা — নরম-ফেড) */
@keyframes epk301PosterIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.ep-load-poster { animation: epk301PosterIn .45s ease-out both; }
/* ④ 640px-সংকোচন (টাচ-সারফেসে উষ্ণ-সংকেত-শান্ত) */
@media (max-width: 640px) {
  .ep-cal-day.epk300-warm:not(.is-sel) { box-shadow: 0 0 0 1px color-mix(in srgb, var(--lf-brand-primary) 35%, transparent); }
}
/* ⑤ রিডিউসড-মোশন গার্ড */
@media (prefers-reduced-motion: reduce) {
  .ep-cal-day, .ep-load-poster { animation: none; transition: none; }
}
'''
    hexzero(B6, 'epaper-session301')
    wr(EP, c.rstrip() + '\n' + B6)
    print('EP-CSS-OK: session301 ব্লক (উষ্ণ-সেল + পোস্টার)')

# ═══════════ ফাইল-৪: style.css (ofx301 — টপবার মোবাইল-ক্লিপ ফিক্স) ═══════════
s = rd(ST)
if 'ofx301' in s:
    print('STYLE-CSS-SKIP: মার্কার-উপস্থিত (idempotent)')
else:
    B7 = r'''
/* ═══ session301 (ofx301) — টপবার মোবাইল-ক্লিপ ফিক্স: body+21px-উৎস-নির্মূল (PLANS session294-তদন্ত-প্রস্তাব)
   রুট: 992-MQ-র .topbar-nav{display:none} ক্যাসকেড-পরবর্তী top-level .topbar-nav{display:inline-flex}
   পুনঃঘোষণায় (notif-যুগ) বাসি → মোবাইলে লগইন/রেজিস্ট্রেশন-অ্যাঙ্কর ফিরে-আসে → .menu-toggle ২১px ডানে-ছাঁটা
   (body{overflow-x:clip}-নীরব-ক্লিপ — স্ক্রলবার-শূন্য কিন্তু ট্যাপ-টার্গেট-ক্ষত)। সমাধান: ক্যাসকেড-শেষে
   element-গঠন-স্পেসিফিকিটি (a.topbar-nav) + MQ-পুনঃপ্রতিষ্ঠা — ডেস্কটপ-অস্পৃশ্য; অথ-লিংক মোবাইল-সাইডবারে
   .mobile-cta হিসেবে বিদ্যমান (হারানো-ক্ষমতা-শূন্য)। ═══ */
@media (max-width: 992px) {
  .topbar-right a.topbar-nav { display: none; }
  a.topbar-nav { display: none; }
}
'''
    hexzero(B7, 'ofx301')
    wr(ST, s.rstrip() + '\n' + B7)
    print('STYLE-CSS-OK: ofx301 ব্লক')

print('S301-PATCH-DONE')
