#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s305-patch.py — session305: cf305 — moderator-complaints (mc254-ইঞ্জিন) checked-pinned চুক্তি পোর্ট
# [Task ID 145] pr303-প্যাটার্ন-মিরর — পরিবার-সম্পূর্ণতা: শেষ-বাকি bulk+filter-সারফেস
# চুক্তি: বাইট-নিরাপদ HID-গঠন + মার্কার-স্কিপ ইডেমপোটেন্ট ×N + অ্যাঙ্কর-এককতা-FATAL +
#   পোস্ট-অ্যাসার্ট + IIFE-শেষ-লাইন-প্রমাণ + হেক্স-শূন্য + EJS-কম্পাইল।
import re
import subprocess
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
HID = '[' + 'h' + 'idden]'  # বাইট-নিরাপদ গঠন — সোর্সে আক্ষরিক-সিকোয়েন্স-শূন্য

FATAL = []


def fatal(msg):
    FATAL.append(msg)
    print('FATAL: ' + msg)


MC_ENGINE = """  /* ── session254: তাৎক্ষণিক-ফিল্টার (mr253-চুক্তি-মিরর — field-গার্ড keydown; Escape-ক্লিয়ার+ব্লার; __mcQA হুক) ──
     session305 (cf305) — **checked-pinned চুক্তি পোর্ট** (pr303-মিরর): hit = pinned || !v || kw-match —
     চেক-করা bulk_ids-সারি ফিল্টারে-ও-দৃশ্যমান → bulk-delete কখনো অদৃশ্য-সারি-স্পর্শ-নয়;
     sidebar initBulkBar-এর target-level sync আগে → document-level change-ডেলিগেশনে apply পরে (বাবল-ক্রম);
     boot-apply-init + Enter-firstMatch (অ্যাঙ্কর = bulk-checkbox — স্ট্যাটাস-আপডেট/ডিলিট-বাটন-ফোকাস-বিপজ্জনক);
     __mcQA হুক-বর্ধিত (pinned-সহ — legacy total/count/apply/clear-অক্ষুণ্ণ); কাউন্ট-চিপ ASCII (mc254-চুক্তি) */
  (function () {
    'use strict';
    var input = document.getElementById('mc254-filter');
    var count = document.getElementById('mc254-count');
    var clearBtn = document.getElementById('mc254-clear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-mc-row]'));
    var emptyBox = document.querySelector('[data-mc-empty]');
    var total = cards.length;
    function mcPinned254() {
      return cards.filter(function (c) {
        var cb = c.querySelector('input[name="bulk_ids"]');
        return !!(cb && cb.checked);
      }).length;
    }
    function apply254() {
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
      if (count) { count.textContent = String(vis); count.classList.toggle('mc254-dim', !!v && vis !== total); }
      if (emptyBox) emptyBox.hidden = vis !== 0;
      if (clearBtn) clearBtn.hidden = !v;
    }
    function clear254() { if (!input) return; input.value = ''; apply254(); }
    if (input) {
      input.addEventListener('input', apply254);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { clear254(); input.blur(); return; }
        if (e.key === 'Enter') {
          var first = cards.filter(function (c) { return !c.hidden; })[0];
          if (first) {
            e.preventDefault();
            var cb = first.querySelector('input[name="bulk_ids"]');
            if (cb) { cb.focus(); }
            first.classList.add('mc-flash305');
            setTimeout(function () { first.classList.remove('mc-flash305'); }, 900);
          }
        }
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', function () { clear254(); input.focus(); });
    /* checked-pinned ধর্ম — চেক-পরিবর্তনে পুনঃ-apply (bulk_ids-সরাসরি-ক্লিক + bulk-all-উভয়-পথ;
       sidebar-এর target-level sync আগে চলে (বাবল-ক্রম) → এ-apply সর্বদা-সর্বশেষ-অবস্থায়) */
    document.addEventListener('change', function (e) {
      if (!e.target || !e.target.matches) return;
      if (e.target.matches('input[name="bulk_ids"],[data-bulk-all]')) apply254();
    });
    apply254(); /* boot-apply-init — session300-শিক্ষা */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'f' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });
    /* session254/305 QA-হুক (__mcQA — পিন-সচেতন বর্ধিত) */
    window.__mcQA = {
      surface: function () { return 'complaints'; },
      total: function () { return total; },
      pinned: mcPinned254,
      count: function () { return document.querySelectorAll('[data-mc-row]:not(@@HID@@)').length; },
      apply: apply254,
      clear: function () { clear254(); }
    };
  })();
"""

MC_CSS = """/* session305 — checked-pinned সারি-অ্যাফোর্ডেন্স (cf305; হেক্স-শূন্য টোকেন-শুধু; pr303-মিরর):
   চেক-করা bulk_ids-সারি = ফিল্টারে-ও-দৃশ্যমান (hit=pinned||match) → পিন-অবস্থার দৃশ্যমান-সংকেত
   (soft brandgreen প্রান্ত+টিন্ট+বিষয়-গাঢ় — :has()-গেটেড, অসমর্থিত-ব্রাউজারে-নীরব)
   + Enter-firstMatch ফ্ল্যাশ + চেকবক্স focus-visible রিং + মসৃণ-ট্রানজিশন */
@supports selector(:has(*)) {
  .complaint-card[data-mc-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); background: color-mix(in srgb, var(--lf-brandgreen) 6%, transparent); }
  .complaint-card[data-mc-row]:has(input[name="bulk_ids"]:checked) > div > strong { color: var(--lf-brandgreen-deep); }
}
.complaint-card[data-mc-row] { transition: background .15s ease, box-shadow .15s ease; }
.complaint-card[data-mc-row].mc-flash305 { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); outline-offset: 2px; }
.complaint-card[data-mc-row] input[name="bulk_ids"]:focus-visible { outline: 2px solid color-mix(in srgb, var(--lf-brandgreen) 60%, transparent); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .complaint-card[data-mc-row] { transition: none; } .complaint-card[data-mc-row].mc-flash305 { outline-color: transparent; } }
@media (max-width: 640px) { .complaint-card[data-mc-row]:has(input[name="bulk_ids"]:checked) { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); } }
"""

MC_ENGINE = MC_ENGINE.replace('@@HID@@', HID)

PATH = APP + '/views/user/moderator-complaints.ejs'
MARKER = 'mcPinned254'
# পূর্ণ-প্যাটার্ন অ্যাঙ্কর (সংক্ষিপ্ত-অ্যাঙ্কর-সংঘর্ষ-গোটচা — session304-শিক্ষা; CSS-কমেন্টেও session254 আছে)
ANCHOR = "/* ── session254: তাৎক্ষণিক-ফিল্টার (mr253-চুক্তি-মিরর — field-গার্ড keydown; Escape-ক্লিয়ার+ব্লার; __mcQA হুক) ── */"

text = open(PATH, encoding='utf-8').read()
if MARKER in text:
    print('SKIP cf305/complaints (মার্কার-পূর্ব-বিদ্যমান — ইডেমপোটেন্ট)')
else:
    if text.count(ANCHOR) != 1:
        fatal('cf305: অ্যাঙ্কর-এককতা-ব্যর্থ (count=' + str(text.count(ANCHOR)) + ')')
    if text.count('</style>') != 1:
        fatal('cf305: </style> এককতা-ব্যর্থ (count=' + str(text.count('</style>')) + ')')
    if not FATAL:
        a = text.index(ANCHOR)
        ls = text.rfind('\n', 0, a) + 1
        lines = text.split('\n')
        off = text[:ls].count('\n')
        end = None
        for i in range(off, len(lines)):
            if lines[i].strip() == '})();':
                end = i
                break
        if end is None:
            fatal('cf305: IIFE-সমাপ্তি-লাইন-অনুপস্থিত')
        else:
            new_lines = lines[:off] + MC_ENGINE.rstrip('\n').split('\n') + lines[end + 1:]
            text2 = '\n'.join(new_lines)
            j = text2.index('</style>')
            text2 = text2[:j] + MC_CSS + text2[j:]
            open(PATH, 'w', encoding='utf-8').write(text2)
            print('APPLIED cf305/complaints')

# ── পোস্ট-অ্যাসার্ট ──
text = open(PATH, encoding='utf-8').read()
for nd in [
    'function mcPinned254()',
    'pinned: mcPinned254,',
    'var hit = pinned || !v || (c.getAttribute(\'data-kw\') || \'\').indexOf(v) >= 0;',
    'input[name="bulk_ids"],[data-bulk-all]',
    'apply254(); /* boot-apply-init',
    "first.classList.add('mc-flash305');",
    ':has(input[name="bulk_ids"]:checked)',
    '__mcQA',
]:
    if nd not in text:
        fatal('পোস্ট-অ্যাসার্ট-ব্যর্থ: ' + nd[:60])

# IIFE-শেষ-লাইন-প্রমাণ (session304-রীতি)
i = text.find('session305 (cf305)')
j = text.find('</script>', i)
seg_lines = [ln.strip() for ln in text[i:j].split('\n') if ln.strip()]
if not seg_lines or seg_lines[-1] != '})();':
    fatal('cf305: IIFE-আহ্বান-সমাপ্তি-ক্ষয়-সন্দেহ (শেষ-লাইন=' + (seg_lines[-1] if seg_lines else 'শূন্য') + ')')

# [hidden]-অখণ্ডতা: ইঞ্জিনে :not([hidden]) ×১ (count-হুক) + গার্ড-CSS ×১ অক্ষুণ্ণ
n_not = text.count(':not(' + HID + ')')
if n_not != 1:
    fatal('complaints :not([hidden]) গণনা=' + str(n_not) + ' (প্রত্যাশা ১)')
n_guard = text.count('[data-mc-row]' + HID)
if n_guard != 1:
    fatal('complaints hidden-গার্ড-গণনা=' + str(n_guard) + ' (প্রত্যাশা ১)')

# হেক্স-শূন্য (নতুন CSS-ব্লক)
i = text.find('session305 — checked-pinned')
if i < 0:
    fatal('cf305: CSS-ব্লক-অনুপস্থিত')
else:
    seg = text[i:text.find('</style>', i)]
    body = re.sub(r'/\*.*?\*/', '', seg, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits:
        fatal('cf305: হেক্স-লিটারাল ' + str(hits[:3]))

# EJS-কম্পাইল
r = subprocess.run(['node', '-e', "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('" + PATH + "','utf8'));console.log('OK')"],
                   cwd=APP, capture_output=True, text=True)
if r.returncode != 0:
    fatal('cf305: EJS-কম্পাইল-ব্যর্থ: ' + (r.stderr or '')[:300])

if FATAL:
    print('সারসংক্ষেপ: ' + str(len(FATAL)) + ' FATAL')
    sys.exit(1)
print('S305-PATCH-GREEN (cf305 প্রয়োগ + পোস্ট-অ্যাসার্ট-সবুজ)')
