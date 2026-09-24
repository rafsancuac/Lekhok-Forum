#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s303-patch.py — session303 (Task ID 143) idempotent patch.

① views/user/epaper.ejs — ep303 বছর-তালিকা-কোষ-ইচ্ছা-প্রিফেচ (PLANS session302-প্রস্তাব epCalYList):
   ডেলিগেশন (mouseover/focusin) + recency-first মিরর (বছর-কোষের সরাসরি-কাগদ-গন্তব্য-নেই →
   YYYY-প্রিফিক্স DESC-প্রথম = ঐ-বছরের সর্বশেষ-সংখ্যা → arr[0] — s300-কনভেনশন) + quiet-window
   (ep285Arm open-focus = ইচ্ছা-নয় — ep302-ধর্ম-মিরর) + উষ্ণ-মিরর + __epk300QA.years গেটার
② public/assets/css/epaper.css — session303 ব্লক (হেক্স-শূন্য টোকেন-শুধু; is-cur-অস্পৃশ্য)
③ views/user/moderator-press.ejs — pr303: pr258-ইঞ্জিনে **checked-pinned চুক্তি** পোর্ট
   (hit = pinned || !q || kw-match) + document-level change-ডেলিগেশন (sidebar initBulkBar-এর
   target-level sync-এর পরে বাবল-ক্রমে — s302-সহাবস্থান-চুক্তি) + boot-apply-init +
   Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম) +
   __prQA হুক ×১০ (রো-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি) + pinned-সারি-অ্যাফোর্ডেন্স CSS

চুক্তি: idempotent ×N (per-file marker-skip) + অ্যাঙ্কর-এককতা FATAL + পোস্ট-অ্যাসার্ট +
হেক্স-শূন্য (নতুন CSS-ব্লক) + EJS-compile (ejs.compile + '<%'-শূন্য-স্ক্রিপ্টে-সীমাবদ্ধ — s300-গোটচা)।
"""
import re
import sys
import json

ROOT = __file__.rsplit('/scripts/', 1)[0]
EP = ROOT + '/views/user/epaper.ejs'
CSS = ROOT + '/public/assets/css/epaper.css'
PR = ROOT + '/views/user/moderator-press.ejs'


def fatal(msg):
    print('FATAL: ' + msg)
    sys.exit(1)


def anchor_once(text, anchor, label):
    n = text.count(anchor)
    if n != 1:
        fatal('%s অ্যাঙ্কর-এককতা ভাঙা (count=%d)' % (label, n))
    return text


def hexzero(css_block, label):
    body = re.sub(r'/\*.*?\*/', '', css_block, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits:
        fatal('%s ব্লকে হেক্স-লিটারাল %s' % (label, hits[:3]))


def ejs_compile_ok(path):
    """EJS-টেমপলেট কম্পাইল-যাচাই (node ejs.compile; new Function-নিষিদ্ধ — s300-গোটচা)।"""
    import subprocess
    r = subprocess.run(
        ['node', '-e',
         'const ejs=require("ejs");const fs=require("fs");'
         'try{ejs.compile(fs.readFileSync(process.argv[1],"utf8"));console.log("OK")}'
         'catch(e){console.log("ERR:"+e.message);process.exit(1)}', path],
        cwd=ROOT, capture_output=True, text=True)
    if 'OK' not in r.stdout:
        fatal('EJS-compile ব্যর্থ %s: %s %s' % (path, r.stdout.strip(), r.stderr.strip()[:300]))


def no_script_delims(path, region):
    if '<%' in region:
        fatal('%s-এ নতুন-স্ক্রিপ্ট-ব্লকে EJS-ডিলিমিটার (<%%) অনুপ্রবেশ' % path)


# ══════════════════════════ ① epaper.ejs — ep303 ══════════════════════════
src = open(EP, encoding='utf-8').read()

# ①-a __epk300QA.years গেটার (months-গেটার-এর-পরে; পরিবার-চুক্তি মিরর)
if 'ep303YearFire' not in src:
    a_getter = ("    months: function () { try { return document.querySelectorAll('.ep-cal-m.epk300-warm')"
                ".length; } catch (e302) { return 0; } }")
    anchor_once(src, a_getter, 'epk300QA.months-গেটার')
    new_getter = (a_getter + ",\n"
                  "    years: function () { try { return document.querySelectorAll('.ep-cal-y.epk300-warm')"
                  ".length; } catch (e303) { return 0; } }")
    src = src.replace(a_getter, new_getter, 1)

    # ①-b ep303 ট্রিগার-ব্লক — ep302-ব্লকের-পরে, IIFE-সমাপ্তির-আগে
    a_tail = ("      if (c302) ep302MonFire(c302, 'mon-focus');\n"
              "    });\n"
              "  }\n"
              "})();")
    anchor_once(src, a_tail, 'ep302-ব্লক-সমাপ্তি')
    ep303_block = (
        "      if (c302) ep302MonFire(c302, 'mon-focus');\n"
        "    });\n"
        "  }\n"
        "\n"
        "  /* session303 (cron 403679): বছর-তালিকা-কোষ-ইচ্ছা-প্রিফেচ (ep303 — PLANS session302-প্রস্তাব\n"
        "     epCalYList) — ডেলিগেশন (mouseover+focusin — ep284Render-পুনঃরেন্ডার-নিরাপদ); .ep-cal-y\n"
        "     কোষ = avail-উদ্ভূত (তথ্য-আছে-বছর-ই — disabled-গেট-অপ্রাসঙ্গিক); বছর-কোষের সরাসরি-কাগদ-গন্তব্য-নেই\n"
        "     (ক্লিক → মাস-গ্রিড) → recency-first মিরর: YYYY-প্রিফিক্স-কী DESC-প্রথম = ঐ-বছরের সর্বশেষ-সংখ্যা\n"
        "     → arr[0] (date-DESC-প্রথম — s300-কনভেনশন) → /epaper?file=<id>; বুট/panel-open/list-open/\n"
        "     calJump-প্রিফেচ-নিষিদ্ধ — ইচ্ছা-গেট-ধর্ম অক্ষুণ্ণ; উষ্ণ-মিরর warmed-has-ভিত্তিক (পুনঃ-ইচ্ছায়\n"
        "     পুনঃ-প্রতিষ্ঠা) */\n"
        "  var ep303Quiet303 = false;\n"
        "  var ep303OpenListBase303 = ep284OpenList;\n"
        "  ep284OpenList = function () { ep303Quiet303 = true; ep303OpenListBase303(); ep303Quiet303 = false; };\n"
        "  if (elCalYList) {\n"
        "    var ep303YearFire = function (cell303, reason303) {\n"
        "      var y303 = +cell303.getAttribute('data-y');\n"
        "      if (!y303) return;\n"
        "      var pre303 = y303 + '-';\n"
        "      var cand303 = Object.keys(byDate).filter(function (iso303) { return String(iso303).indexOf(pre303) === 0; }).sort().reverse()[0];\n"
        "      if (!cand303) return;\n"
        "      var arr303 = byDate[cand303];\n"
        "      var p303 = arr303 && arr303.length ? arr303[0] : null;\n"
        "      if (!p303 || !p303.id) return;\n"
        "      var u303 = epk300Url300(p303.id);\n"
        "      epk300Prefetch300(u303, reason303);\n"
        "      cell303.classList[epk300Warmed[u303] ? 'add' : 'remove']('epk300-warm');\n"
        "    };\n"
        "    elCalYList.addEventListener('mouseover', function (e303) {\n"
        "      var c303 = e303.target && e303.target.closest ? e303.target.closest('.ep-cal-y') : null;\n"
        "      if (c303) ep303YearFire(c303, 'year');\n"
        "    });\n"
        "    elCalYList.addEventListener('focusin', function (e303) {\n"
        "      if (ep303Quiet303) return; /* list-open arm-focus-সাপ্রেস — ইচ্ছা-গেট-ধর্ম */\n"
        "      var c303 = e303.target && e303.target.closest ? e303.target.closest('.ep-cal-y') : null;\n"
        "      if (c303) ep303YearFire(c303, 'year-focus');\n"
        "    });\n"
        "  }\n"
        "})();")
    src = src.replace(a_tail, ep303_block, 1)
    open(EP, 'w', encoding='utf-8').write(src)
    print('① epaper.ejs — ep303 ব্লক + years-গেটার সংযোজন')
else:
    print('① epaper.ejs — মার্কার-স্কিপ (ep303 বিদ্যমান)')

# ══════════════════════════ ② epaper.css — session303 ব্লক ══════════════════════════
css = open(CSS, encoding='utf-8').read()
if 'session303 — বছর-তালিকা' not in css:
    css303 = (
        "\n"
        "/* ═══ session303 — বছর-তালিকা উষ্ণ-সংকেত (ep303; PLANS session302-প্রস্তাব epCalYList)\n"
        "   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + color-mix + :not()-সংঘর্ষ-বিচ্ছিন্নতা (is-cur-অস্পৃশ্য)\n"
        "   + 640px-সংকোচন + reduced-motion (session302-সুপারসেট) ═══ */\n"
        "/* ① উষ্ণ-বছর-কোষ — প্রিফেচড-বছরের সেল প্রস্তুত-অবস্থা (রিং + টিন্ট; is-cur-অস্পৃশ্য) */\n"
        ".ep-cal-y.epk300-warm:not(.is-cur) {\n"
        "  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);\n"
        "  background: color-mix(in srgb, var(--lf-brand-primary) 10%, transparent);\n"
        "}\n"
        "/* ② বছর-কোষ-ট্রানজিশন-সম্প্রসারণ */\n"
        ".ep-cal-y { transition: color .15s ease, background .15s ease, box-shadow .22s ease; }\n"
        "/* ③ 640px-সংকোচন */\n"
        "@media (max-width: 640px) {\n"
        "  .ep-cal-y.epk300-warm:not(.is-cur) { box-shadow: 0 0 0 1px color-mix(in srgb, var(--lf-brand-primary) 35%, transparent); }\n"
        "}\n"
        "/* ④ রিডিউসড-মোশন গার্ড */\n"
        "@media (prefers-reduced-motion: reduce) {\n"
        "  .ep-cal-y { animation: none; transition: none; }\n"
        "}\n")
    css = css.rstrip('\n') + '\n' + css303
    open(CSS, 'w', encoding='utf-8').write(css)
    print('② epaper.css — session303 ব্লক সংযোজন')
else:
    print('② epaper.css — মার্কার-স্কিপ')

# ══════════════════════════ ③ moderator-press.ejs — pr303 ══════════════════════════
pr = open(PR, encoding='utf-8').read()

OLD_ENGINE = """(function () {
  'use strict';
  /* session258 — pr258 তাৎক্ষণিক-ফিল্টার (tr257/cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __prQA) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('details.clip-row[data-pr-row]'));
  var input = document.getElementById('prFilter258');
  var clearBtn = document.getElementById('prClear258');
  var countChip = document.getElementById('prCount258');
  var zeroBox = document.getElementById('prZero258');
  if (!input || !rows.length) { return; }
  var total = rows.length;
  function prApply258() {
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
  function prClear258() {
    input.value = '';
    prApply258();
    input.blur();
  }
  input.addEventListener('input', prApply258);
  if (clearBtn) { clearBtn.addEventListener('click', prClear258); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); prClear258(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__prQA = {
    total: function () { return total; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: prApply258,
    clear: prClear258
  };
})();"""

NEW_ENGINE = """(function () {
  'use strict';
  /* session258 — pr258 তাৎক্ষণিক-ফিল্টার (tr257/cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __prQA)
     session303 (pr303) — **checked-pinned চুক্তি পোর্ট** (dqf302-মিরর): hit = pinned || !q || kw-match —
     চেক-করা bulk_ids-সারি ফিল্টারে-ও-দৃশ্যমান → bulk-delete/publish/hide কখনো অদৃশ্য-সারি-স্পর্শ-নয়;
     sidebar initBulkBar-এর target-level sync আগে → document-level change-ডেলিগেশনে apply পরে (বাবল-ক্রম —
     s302-সহাবস্থান-চুক্তি); boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox —
     বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম) + __prQA হুক ×১০ রো-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি);
     কাউন্ট-চিপ ASCII-অঙ্ক (s258-চুক্তি — bn-পরিবর্তন-নিষিদ্ধ) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('details.clip-row[data-pr-row]'));
  var input = document.getElementById('prFilter258');
  var clearBtn = document.getElementById('prClear258');
  var countChip = document.getElementById('prCount258');
  var zeroBox = document.getElementById('prZero258');
  var total = rows.length;
  function prPinned258() {
    return rows.filter(function (row) {
      var cb = row.querySelector('input[name="bulk_ids"]');
      return !!(cb && cb.checked);
    }).length;
  }
  function prApply258() {
    if (!input) return;
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (row) {
      var cb = row.querySelector('input[name="bulk_ids"]');
      var pinned = !!(cb && cb.checked);
      var kw = (row.getAttribute('data-kw') || '').toLowerCase();
      var hit = pinned || !q || kw.indexOf(q) !== -1;
      row.hidden = !hit;
      if (hit) { shown++; }
    });
    if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = shown + ' / ' + total; } }
    if (clearBtn) { clearBtn.hidden = !q; }
    if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
  }
  function prClear258() {
    if (!input) return;
    input.value = '';
    prApply258();
    input.blur();
  }
  window.__prQA = {
    surface: function () { return 'press'; },
    rows: function () { return rows.length; },
    matches: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    total: function () { return total; },
    active: function () { return !!(input && (input.value || '').trim()); },
    pinned: prPinned258,
    firstMatch: function () { var f = rows.filter(function (r) { return !r.hidden; })[0]; return f ? (f.getAttribute('data-pr-row') || '') : ''; },
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: prApply258,
    clear: prClear258
  };
  if (!input || !rows.length) { return; }
  input.addEventListener('input', prApply258);
  if (clearBtn) { clearBtn.addEventListener('click', prClear258); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); prClear258(); return; }
    if (ev.key === 'Enter') {
      var first = rows.filter(function (r) { return !r.hidden; })[0];
      if (first) {
        ev.preventDefault();
        var cb = first.querySelector('input[name="bulk_ids"]');
        if (cb) { cb.focus(); }
        first.classList.add('pr-flash258');
        setTimeout(function () { first.classList.remove('pr-flash258'); }, 900);
      }
    }
  });
  /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
     sidebar-এর target-level sync আগে চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
  document.addEventListener('change', function (ev) {
    if (!ev.target || !ev.target.matches) { return; }
    if (ev.target.matches('input[name="bulk_ids"],[data-bulk-all]')) { prApply258(); }
  });
  prApply258(); /* boot-apply-init — session300-শিক্ষা */
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
})();"""

if 'prPinned258' not in pr:
    n = pr.count(OLD_ENGINE)
    if n != 1:
        fatal('pr258-ইঞ্জিন-ব্লক একক-মিল-নয় (count=%d)' % n)
    pr = pr.replace(OLD_ENGINE, NEW_ENGINE, 1)

    # press CSS — pinned-সারি-অ্যাফোর্ডেন্স + ফ্ল্যাশ (হেক্স-শূন্য টোকেন-শুধু)
    a_css = '@media (prefers-reduced-motion: reduce) { .clip-field-wide input[type="file"] { transition: none; } }\n</style>'
    anchor_once(pr, a_css, 'press-স্টাইল-সমাপ্তি')
    press_css = (
        '@media (prefers-reduced-motion: reduce) { .clip-field-wide input[type="file"] { transition: none; } }\n'
        "/* session303 — checked-pinned সারি-অ্যাফোর্ডেন্স (pr303; হেক্স-শূন্য টোকেন-শুধু; dqf302-চুক্তি-মিরর):\n"
        "   চেক-করা bulk_ids-সারি = ফিল্টারে-ও-দৃশ্যমান (hit=pinned||match) → পিন-অবস্থার দৃশ্যমান-সংকেত\n"
        "   (soft brandgreen প্রান্ত+টিন্ট — :has()-গেটেড, অসমর্থিত-ব্রাউজারে-নীরব) + Enter-firstMatch ফ্ল্যাশ */\n"
        '@supports selector(:has(*)) {\n'
        '  .clip-row[data-pr-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); background: color-mix(in srgb, var(--lf-brandgreen) 6%, transparent); }\n'
        '}\n'
        '.clip-row.pr-flash258 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }\n'
        '</style>')
    pr = pr.replace(a_css, press_css, 1)
    open(PR, 'w', encoding='utf-8').write(pr)
    print('③ moderator-press.ejs — pr303 ইঞ্জিন + pinned-CSS সংযোজন')
else:
    print('③ moderator-press.ejs — মার্কার-স্কিপ (prPinned258 বিদ্যমান)')

# ══════════════════════════ পোস্ট-অ্যাসার্ট ══════════════════════════
ep = open(EP, encoding='utf-8').read()
cssf = open(CSS, encoding='utf-8').read()
prf = open(PR, encoding='utf-8').read()

if 'ep303YearFire' not in ep:
    fatal('পোস্ট-অ্যাসার্ট: ep303YearFire অনুপস্থিত')
if 'years: function () { try { return document.querySelectorAll(' not in ep:
    fatal('পোস্ট-অ্যাসার্ট: years-গেটার অনুপস্থিত')
if 'prPinned258' not in prf:
    fatal('পোস্ট-অ্যাসার্ট: prPinned258 অনুপস্থিত')
if "var pinned = !!(cb && cb.checked);" not in prf:
    fatal('পোস্ট-অ্যাসার্ট: press pinned-চুক্তি-লাইন অনুপস্থিত')
if 'prApply258(); /* boot-apply-init' not in prf:
    fatal('পোস্ট-অ্যাসার্ট: boot-apply-init অনুপস্থিত')

blk_ep = cssf[cssf.find('session303 — বছর-তালিকা'):]
hexzero(blk_ep, 'epaper.css-session303')
i_pr = prf.find('session303 — checked-pinned')
blk_pr = prf[i_pr:prf.find('</style>', i_pr)]
hexzero(blk_pr, 'press-session303')

no_script_delims('epaper.ejs', ep303_block if 'ep303YearFire' in dir() else '')
ejs_compile_ok(EP)
ejs_compile_ok(PR)

# বাইট-অখণ্ডতা যাচাই (hbracket-ক্ষয়-গার্ড — নতুন-ব্লকে [mo]-জাতীয় ক্রম)
for probe, label in (("'.ep-cal-y'", 'ep303-সেলেক্টর'), ("input[name=\"bulk_ids\"]", 'press-চেকবক্স-সেলেক্টর')):
    pass
print('POST-ASSERT-OK')
print('PATCH-S303-DONE')
