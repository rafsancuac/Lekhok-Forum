#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s304-patch.py — session304: checked-pinned চুক্তি পোর্ট-প্যাক (no304/ev304/mm304)
# [Task ID 144] pr303-প্যাটার্ন-মিরর — moderator-notices/events/members তিন-সারফেসে
#   hit = pinned || !q || kw-match → bulk-delete/publish/hide কখনো অদৃশ্য-সারি-স্পর্শ-নয়।
# চুক্তি: বাইট-নিরাপদ HID-গঠন ('[' + 'h' + ... — লেখনী-স্তর -সিকোয়েন্স-ক্ষয়-এড়ানো s298/s299-গোটচা)
#   + মার্কার-স্কিপ ইডেমপোটেন্ট ×N + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + EJS-কম্পাইল।
import re
import subprocess
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
HID = '[' + 'h' + 'idden]'  # বাইট-নিরাপদ গঠন — সোর্সে আক্ষরিক-সিকোয়েন্স-শূন্য

FATAL = []


def fatal(msg):
    FATAL.append(msg)
    print('FATAL: ' + msg)


# ── নতুন ইঞ্জিন-বডি ×৩ (pr303-মিরর — সারফেস-নেমস্পেস প্রতি-সারফেস) ──────────────

NO_ENGINE = """  /* session259 — no259 তাৎক্ষণিক-ফিল্টার (pr258/tr257/cu256-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __noQA)
     session304 (no304) — **checked-pinned চুক্তি পোর্ট** (pr303-মিরর): hit = pinned || !q || kw-match —
     চেক-করা bulk_ids-সারি ফিল্টারে-ও-দৃশ্যমান → bulk-delete/publish/hide কখনো অদৃশ্য-সারি-স্পর্শ-নয়;
     sidebar initBulkBar-এর target-level sync আগে → document-level change-ডেলিগেশনে apply পরে (বাবল-ক্রম —
     s302-সহাবস্থান-চুক্তি); boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox —
     বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম) + __noQA হুক রো-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি);
     কাউন্ট-চিপ ASCII-অঙ্ক (no259-চুক্তি — bn-পরিবর্তন-নিষিদ্ধ) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.mod-item[data-no-row]'));
  var input = document.getElementById('noFilter259');
  var clearBtn = document.getElementById('noClear259');
  var countChip = document.getElementById('noCount259');
  var zeroBox = document.getElementById('noZero259');
  var total = rows.length;
  function noPinned259() {
    return rows.filter(function (row) {
      var cb = row.querySelector('input[name="bulk_ids"]');
      return !!(cb && cb.checked);
    }).length;
  }
  function noApply259() {
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
  function noClear259() {
    if (!input) return;
    input.value = '';
    noApply259();
    input.blur();
  }
  window.__noQA = {
    surface: function () { return 'notices'; },
    total: function () { return total; },
    pinned: noPinned259,
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: noApply259,
    clear: noClear259
  };
  if (!input || !rows.length) { return; }
  input.addEventListener('input', noApply259);
  if (clearBtn) { clearBtn.addEventListener('click', noClear259); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); noClear259(); return; }
    if (ev.key === 'Enter') {
      var first = rows.filter(function (r) { return !r.hidden; })[0];
      if (first) {
        ev.preventDefault();
        var cb = first.querySelector('input[name="bulk_ids"]');
        if (cb) { cb.focus(); }
        first.classList.add('no-flash304');
        setTimeout(function () { first.classList.remove('no-flash304'); }, 900);
      }
    }
  });
  /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
     sidebar-এর target-level sync আগে চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
  document.addEventListener('change', function (ev) {
    if (!ev.target || !ev.target.matches) { return; }
    if (ev.target.matches('input[name="bulk_ids"],[data-bulk-all]')) { noApply259(); }
  });
  noApply259(); /* boot-apply-init — session300-শিক্ষা */
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
})();
"""

EV_ENGINE = """  /* session260 — ev260 তাৎক্ষণিক-ফিল্টার (no259/pr258/tr257-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __evQA)
     session304 (ev304) — **checked-pinned চুক্তি পোর্ট** (pr303-মিরর): hit = pinned || !q || kw-match —
     চেক-করা bulk_ids-সারি ফিল্টারে-ও-দৃশ্যমান → bulk-delete/toggle কখনো অদৃশ্য-সারি-স্পর্শ-নয়;
     sidebar initBulkBar-এর target-level sync আগে → document-level change-ডেলিগেশনে apply পরে (বাবল-ক্রম —
     s302-সহাবস্থান-চুক্তি); boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox —
     বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম) + __evQA হুক রো-শূন্যে-ও-সংজ্ঞায়িত (পরিবার-চুক্তি);
     কাউন্ট-চিপ ASCII-অঙ্ক (ev260-চুক্তি — bn-পরিবর্তন-নিষিদ্ধ) */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.mod-item[data-ev-row]'));
  var input = document.getElementById('evFilter260');
  var clearBtn = document.getElementById('evClear260');
  var countChip = document.getElementById('evCount260');
  var zeroBox = document.getElementById('evZero260');
  var total = rows.length;
  function evPinned260() {
    return rows.filter(function (row) {
      var cb = row.querySelector('input[name="bulk_ids"]');
      return !!(cb && cb.checked);
    }).length;
  }
  function evApply260() {
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
  function evClear260() {
    if (!input) return;
    input.value = '';
    evApply260();
    input.blur();
  }
  window.__evQA = {
    surface: function () { return 'events'; },
    total: function () { return total; },
    pinned: evPinned260,
    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
    apply: evApply260,
    clear: evClear260
  };
  if (!input || !rows.length) { return; }
  input.addEventListener('input', evApply260);
  if (clearBtn) { clearBtn.addEventListener('click', evClear260); }
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); evClear260(); return; }
    if (ev.key === 'Enter') {
      var first = rows.filter(function (r) { return !r.hidden; })[0];
      if (first) {
        ev.preventDefault();
        var cb = first.querySelector('input[name="bulk_ids"]');
        if (cb) { cb.focus(); }
        first.classList.add('ev-flash304');
        setTimeout(function () { first.classList.remove('ev-flash304'); }, 900);
      }
    }
  });
  /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
     sidebar-এর target-level sync আগে চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
  document.addEventListener('change', function (ev) {
    if (!ev.target || !ev.target.matches) { return; }
    if (ev.target.matches('input[name="bulk_ids"],[data-bulk-all]')) { evApply260(); }
  });
  evApply260(); /* boot-apply-init — session300-শিক্ষা */
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
})();
"""

MM_ENGINE = """  /* ── session255: তাৎক্ষণিক-ফিল্টার (mc254-চুক্তি-মিরর + grouped-list সেকশন-অটো-হাইড; __mmQA হুক) ──
     session304 (mm304) — **checked-pinned চুক্তি পোর্ট** (pr303-মিরর): hit = pinned || !v || kw-match —
     চেক-করা bulk_ids-সারি ফিল্টারে-ও-দৃশ্যমান → bulk-delete কখনো অদৃশ্য-সারি-স্পর্শ-নয়;
     সেকশন-অটো-হাইড পিন-সচেতন (পিনড-সারি-বিশিষ্ট সেকশন সর্বদা-দৃশ্যমান); sidebar initBulkBar-এর
     target-level sync আগে → document-level change-ডেলিগেশনে apply পরে (বাবল-ক্রম — s302-সহাবস্থান-চুক্তি);
     boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — বিপজ্জনক-অ্যাকশন-বাটন-ফোকাস-নিষিদ্ধ-নিয়ম);
     কাউন্ট-চিপ ASCII-অঙ্ক (mm255-চুক্তি — bn-পরিবর্তন-নিষিদ্ধ) */
  (function () {
    'use strict';
    var input = document.getElementById('mm255-filter');
    var count = document.getElementById('mm255-count');
    var clearBtn = document.getElementById('mm255-clear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-mm-row]'));
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-mm-sec]'));
    var emptyBox = document.querySelector('[data-mm-empty]');
    var total = cards.length;
    function mmPinned255() {
      return cards.filter(function (c) {
        var cb = c.querySelector('input[name="bulk_ids"]');
        return !!(cb && cb.checked);
      }).length;
    }
    function apply255() {
      if (!input) return;
      var v = (input.value || '').trim().toLowerCase();
      var vis = 0;
      cards.forEach(function (c) {
        var cb = c.querySelector('input[name="bulk_ids"]');
        var pinned = !!(cb && cb.checked);
        var hit = pinned || !v || (c.getAttribute('data-kw') || '').indexOf(v) >= 0;
        c.hidden = !hit;
        if (hit) vis++;
      });
      secs.forEach(function (s) {
        var any = s.querySelector('[data-mm-row]:not(@@HID@@)');
        s.hidden = !!v && !any;
      });
      if (count) { count.textContent = String(vis); count.classList.toggle('mm255-dim', !!v && vis !== total); }
      if (emptyBox) emptyBox.hidden = vis !== 0;
      if (clearBtn) clearBtn.hidden = !v;
    }
    function clear255() { if (!input) return; input.value = ''; apply255(); }
    if (input) {
      input.addEventListener('input', apply255);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { clear255(); input.blur(); return; }
        if (e.key === 'Enter') {
          var first = cards.filter(function (c) { return !c.hidden; })[0];
          if (first) {
            e.preventDefault();
            var cb = first.querySelector('input[name="bulk_ids"]');
            if (cb) { cb.focus(); }
            first.classList.add('mm-flash304');
            setTimeout(function () { first.classList.remove('mm-flash304'); }, 900);
          }
        }
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', function () { clear255(); input.focus(); });
    /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
       sidebar-এর target-level sync আগে চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
    document.addEventListener('change', function (e) {
      if (!e.target || !e.target.matches) return;
      if (e.target.matches('input[name="bulk_ids"],[data-bulk-all]')) apply255();
    });
    apply255(); /* boot-apply-init — session300-শিক্ষা */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'f' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });
    /* session255/304 QA-হুক (__mmQA — সারফেস-নেমস্পেস-রীতি; pinned-সহ বর্ধিত) */
    window.__mmQA = {
      total: function () { return total; },
      pinned: mmPinned255,
      count: function () { return document.querySelectorAll('[data-mm-row]:not(@@HID@@)').length; },
      secs: function () { return document.querySelectorAll('[data-mm-sec]:not(@@HID@@)').length; },
      apply: apply255,
      clear: function () { clear255(); }
    };
  })();
"""

# ── [Mandatory-স্টাইল] session304 CSS-ব্লক ×৩ (হেক্স-শূন্য টোকেন-শুধু; pr303-মিরর+বিস্তারিত) ──

NO_CSS = """/* session304 — checked-pinned সারি-অ্যাফোর্ডেন্স (no304; হেক্স-শূন্য টোকেন-শুধু; pr303-মিরর):
   চেক-করা bulk_ids-সারি = ফিল্টারে-ও-দৃশ্যমান (hit=pinned||match) → পিন-অবস্থার দৃশ্যমান-সংকেত
   (soft brandgreen প্রান্ত+টিন্ট+শিরোনাম-গাঢ় — :has()-গেটেড, অসমর্থিত-ব্রাউজারে-নীরব)
   + Enter-firstMatch ফ্ল্যাশ + চেকবক্স focus-visible রিং + মসৃণ-ট্রানজিশন */
@supports selector(:has(*)) {
  .mod-item[data-no-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); background: color-mix(in srgb, var(--lf-brandgreen) 6%, transparent); }
  .mod-item[data-no-row]:has(input[name="bulk_ids"]:checked) > div > strong { color: var(--lf-brandgreen-deep); }
}
.mod-item[data-no-row] { transition: background .15s ease, box-shadow .15s ease; }
.mod-item[data-no-row].no-flash304 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
.mod-item[data-no-row] input[name="bulk_ids"]:focus-visible { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 60%, transparent); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .mod-item[data-no-row] { transition: none; } .mod-item[data-no-row].no-flash304 { outline-color: transparent; } }
@media (max-width: 640px) { .mod-item[data-no-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); } }
"""

EV_CSS = """/* session304 — checked-pinned সারি-অ্যাফোর্ডেন্স (ev304; হেক্স-শূন্য টোকেন-শুধু; pr303-মিরর):
   চেক-করা bulk_ids-সারি = ফিল্টারে-ও-দৃশ্যমান (hit=pinned||match) → পিন-অবস্থার দৃশ্যমান-সংকেত
   (soft brandgreen প্রান্ত+টিন্ট+শিরোনাম-গাঢ় — :has()-গেটেড, অসমর্থিত-ব্রাউজারে-নীরব)
   + Enter-firstMatch ফ্ল্যাশ + চেকবক্স focus-visible রিং + মসৃণ-ট্রানজিশন */
@supports selector(:has(*)) {
  .mod-item[data-ev-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); background: color-mix(in srgb, var(--lf-brandgreen) 6%, transparent); }
  .mod-item[data-ev-row]:has(input[name="bulk_ids"]:checked) > div > strong { color: var(--lf-brandgreen-deep); }
}
.mod-item[data-ev-row] { transition: background .15s ease, box-shadow .15s ease; }
.mod-item[data-ev-row].ev-flash304 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
.mod-item[data-ev-row] input[name="bulk_ids"]:focus-visible { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 60%, transparent); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .mod-item[data-ev-row] { transition: none; } .mod-item[data-ev-row].ev-flash304 { outline-color: transparent; } }
@media (max-width: 640px) { .mod-item[data-ev-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); } }
"""

MM_CSS = """/* session304 — checked-pinned সারি-অ্যাফোর্ডেন্স (mm304; হেক্স-শূন্য টোকেন-শুধু; pr303-মিরর):
   চেক-করা bulk_ids-সারি = ফিল্টারে-ও-দৃশ্যমান (hit=pinned||match) → পিন-অবস্থার দৃশ্যমান-সংকেত
   (soft brandgreen প্রান্ত+টিন্ট+নাম-গাঢ় — :has()-গেটেড, অসমর্থিত-ব্রাউজারে-নীরব)
   + Enter-firstMatch ফ্ল্যাশ + চেকবক্স focus-visible রিং + মসৃণ-ট্রানজিশন */
@supports selector(:has(*)) {
  details.mem-row[data-mm-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); background: color-mix(in srgb, var(--lf-brandgreen) 6%, transparent); }
  details.mem-row[data-mm-row]:has(input[name="bulk_ids"]:checked) .mem-name { color: var(--lf-brandgreen-deep); }
}
details.mem-row[data-mm-row] { transition: background .15s ease, box-shadow .15s ease; }
details.mem-row[data-mm-row].mm-flash304 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
details.mem-row[data-mm-row] input[name="bulk_ids"]:focus-visible { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 60%, transparent); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { details.mem-row[data-mm-row] { transition: none; } details.mem-row[data-mm-row].mm-flash304 { outline-color: transparent; } }
@media (max-width: 640px) { details.mem-row[data-mm-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); } }
"""

MM_ENGINE = MM_ENGINE.replace('@@HID@@', HID)


# ── প্রয়োগ-লজিক: অ্যাঙ্কর-লাইন → সমাপ্তি-লাইন সেগমেন্ট-রিপ্লেস + CSS-ইনসার্ট ──

def apply_surface(path, anchor, marker, engine, css, label):
    try:
        text = open(path, encoding='utf-8').read()
    except OSError as e:
        fatal(label + ': ফাইল-পড়া-ব্যর্থ ' + str(e))
        return False
    if marker in text:
        print('SKIP ' + label + ' (মার্কার-পূর্ব-বিদ্যমান — ইডেমপোটেন্ট)')
        return True
    if text.count(anchor) != 1:
        fatal(label + ': অ্যাঙ্কর-এককতা-ব্যর্থ (count=' + str(text.count(anchor)) + ')')
        return False
    if text.count('</style>') != 1:
        fatal(label + ': </style> এককতা-ব্যর্থ (count=' + str(text.count('</style>')) + ')')
        return False
    a = text.index(anchor)
    ls = text.rfind('\n', 0, a) + 1
    lines = text.split('\n')
    off = text[:ls].count('\n')
    end = None
    for i in range(off, len(lines)):
        if lines[i].strip() == '})();':
            end = i
            break
    if end is None:
        fatal(label + ': IIFE-সমাপ্তি-লাইন-অনুপস্থিত')
        return False
    new_lines = lines[:off] + engine.rstrip('\n').split('\n') + lines[end + 1:]
    text2 = '\n'.join(new_lines)
    j = text2.index('</style>')
    text2 = text2[:j] + css + text2[j:]
    open(path, 'w', encoding='utf-8').write(text2)
    print('APPLIED ' + label)
    return True


SURFACES = [
    (APP + '/views/user/moderator-notices.ejs', "session259 — no259", 'noPinned259', NO_ENGINE, NO_CSS, 'no304/notices'),
    (APP + '/views/user/moderator-events.ejs', "session260 — ev260", 'evPinned260', EV_ENGINE, EV_CSS, 'ev304/events'),
    (APP + '/views/user/moderator-members.ejs', "/* ── session255: তাৎক্ষণিক-ফিল্টার (mc254-চুক্তি-মিরর + grouped-list সেকশন-অটো-হাইড; __mmQA হুক) ── */", 'mmPinned255', MM_ENGINE, MM_CSS, 'mm304/members'),
]

for path, anchor, marker, engine, css, label in SURFACES:
    if not apply_surface(path, anchor, marker, engine, css, label):
        continue

if FATAL:
    sys.exit(1)

# ── পোস্ট-অ্যাসার্ট (session303-গোটচা-প্রতিষেধক সহ) ──────────────────────────

EXPECT = {
    APP + '/views/user/moderator-notices.ejs': [
        'function noPinned259()', 'pinned: noPinned259,', 'var hit = pinned || !q || kw.indexOf(q) !== -1;',
        'input[name="bulk_ids"],[data-bulk-all]', "noApply259(); /* boot-apply-init",
        "first.classList.add('no-flash304');", ':has(input[name="bulk_ids"]:checked)', '__noQA',
    ],
    APP + '/views/user/moderator-events.ejs': [
        'function evPinned260()', 'pinned: evPinned260,', 'var hit = pinned || !q || kw.indexOf(q) !== -1;',
        'input[name="bulk_ids"],[data-bulk-all]', "evApply260(); /* boot-apply-init",
        "first.classList.add('ev-flash304');", ':has(input[name="bulk_ids"]:checked)', '__evQA',
    ],
    APP + '/views/user/moderator-members.ejs': [
        'function mmPinned255()', 'pinned: mmPinned255,', 'var hit = pinned || !v || (c.getAttribute(\'data-kw\') || \'\').indexOf(v) >= 0;',
        'input[name="bulk_ids"],[data-bulk-all]', 'apply255(); /* boot-apply-init',
        "first.classList.add('mm-flash304');", ':has(input[name="bulk_ids"]:checked)', '__mmQA',
    ],
}

for path, needles in EXPECT.items():
    text = open(path, encoding='utf-8').read()
    for nd in needles:
        if nd not in text:
            fatal('পোস্ট-অ্যাসার্ট-ব্যর্থ [' + path.split('/')[-1] + ']: ' + nd[:60])

# IIFE-আহ্বান-ক্ষয়-চেক (session303-গোটচা): মার্কার→</script>-সেগমেন্টের শেষ-অপসারিত-লাইন = })(); প্রমাণ
for path, _, marker, _, _, label in SURFACES:
    text = open(path, encoding='utf-8').read()
    i = text.find(marker)
    if i < 0:
        fatal(label + ': মার্কার-অনুপস্থিত (IIFE-চেক)')
        continue
    j = text.find('</script>', i)
    seg_lines = [ln.strip() for ln in text[i:j].split('\n') if ln.strip()]
    if not seg_lines or seg_lines[-1] != '})();':
        fatal(label + ': IIFE-আহ্বান-সমাপ্তি-ক্ষয়-সন্দেহ (শেষ-লাইন=' + (seg_lines[-1] if seg_lines else 'শূন্য') + ')')

# members [hidden]-অখণ্ডতা (HID-নির্মিত) — সেকশন-কোয়েরি ×১ + হুক ×২ = ৩ + গার্ড-CSS ×২
mt = open(APP + '/views/user/moderator-members.ejs', encoding='utf-8').read()
n_not = mt.count(':not(' + HID + ')')
if n_not != 3:
    fatal('members :not([hidden]) গণনা=' + str(n_not) + ' (প্রত্যাশা ৩)')
n_guard = mt.count('[data-mm-row]' + HID)
if n_guard != 1:
    fatal('members সারি-hidden-গার্ড-গণনা=' + str(n_guard) + ' (প্রত্যাশা ১)')
n_guard2 = mt.count('[data-mm-sec]' + HID)
if n_guard2 != 1:
    fatal('members সেকশন-hidden-গার্ড-গণনা=' + str(n_guard2) + ' (প্রত্যাশা ১)')

# হেক্স-শূন্য (নতুন CSS-ব্লক ×৩)
for path, marker_css, label in [
    (APP + '/views/user/moderator-notices.ejs', 'session304 — checked-pinned', 'no304'),
    (APP + '/views/user/moderator-events.ejs', 'session304 — checked-pinned', 'ev304'),
    (APP + '/views/user/moderator-members.ejs', 'session304 — checked-pinned', 'mm304'),
]:
    text = open(path, encoding='utf-8').read()
    i = text.find(marker_css)
    if i < 0:
        fatal(label + ': CSS-ব্লক-অনুপস্থিত')
        continue
    seg = text[i:text.find('</style>', i)] if '</style>' in text[i:] else text[i:]
    body = re.sub(r'/\*.*?\*/', '', seg, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits:
        fatal(label + ': হেক্স-লিটারাল ' + str(hits[:3]))

# EJS-কম্পাইল ×৩
for path, _, _, _, _, label in SURFACES:
    r = subprocess.run(['node', '-e', "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('" + path + "','utf8'));console.log('OK')"],
                       cwd=APP, capture_output=True, text=True)
    if r.returncode != 0:
        fatal(label + ': EJS-কম্পাইল-ব্যর্থ: ' + (r.stderr or '')[:300])

if FATAL:
    print('সারসংক্ষেপ: ' + str(len(FATAL)) + ' FATAL')
    sys.exit(1)
print('S304-PATCH-GREEN (তিন-সারফেস প্রয়োগ + পোস্ট-অ্যাসার্ট-সবুজ)')
