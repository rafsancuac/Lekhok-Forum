#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s313-patch.py — session313: sfs313 গ্রুপ-সম্মিলন + s313-land নোটিশ (PLANS session312-প্রস্তাব-①+③)
# [Task ID 150] ① helpers/home-layout.js — FEED_SLIDES-এ real-latest/real-popular এন্ট্রি
#   (append-চুক্তি — ডিফল্ট চিপ-slice(0,3) অপরিবর্তিত; admin home-reorder স্বয়ং-আবিষ্কার)
# ② feed.ejs — sfsGroups313 (গ্রুপ-ক্রম home_feed_order-সমন্বিত: real-popular আগে = জনপ্রিয়-প্রথম)
#   + হাফ-ক্লোন-লুপ (×২-ডুপ্লিকেট-মার্কআপ নির্মূল — রেন্ডার-অভিন্ন) + __sfs313QA-হুক (নতুন-নেমস্পেস)
# ③ dashboard.ejs — found:0-পথে মৃদু-নোটিশ (showToast 'lf313-info'; হ্যাশ-বিহীন = অপরিবর্তিত)
# ④ style.css — session313-ব্লক হেক্স-শূন্য: .toast-পরিবার ভিজ্যুয়াল-স্টেট (success/error/info
#   বাম-অ্যাকসেন্ট-বার) + lf313-info ব্র্যান্ড-টিন্ট + 640px safe-area + reduced-motion।
# চুক্তি: মার্কার-স্কিপ ইডেমপোটেন্ট ×N + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট + হেক্স-শূন্য +
#   EJS-কম্পাইল ×২ + node --check + রেজিস্ট্রি-লোড-প্রমাণ।
import subprocess
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'

FATAL = []


def fatal(msg):
    FATAL.append(msg)
    print('FATAL: ' + msg)


def rd(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def wr(p, t):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(t)


def apply_edit(path, marker, anchor, replacement, label, expect=1):
    """মার্কার-স্কিপ ইডেমপোটেন্ট; অ্যাঙ্কর-গণনা expect-না-মিললে FATAL (স্কিপ-নয়)।"""
    t = rd(path)
    if marker in t:
        print('  — (ইতিমধ্যে) ' + label)
        return
    n = t.count(anchor)
    if n != expect:
        fatal(label + ' — অ্যাঙ্কর-গণনা=' + str(n) + ' (প্রত্যাশা ' + str(expect) + ')')
        return
    wr(path, t.replace(anchor, replacement))
    print('  ✓ ' + label)


HL = APP + '/helpers/home-layout.js'
FEED = APP + '/views/partials/home/feed.ejs'
DASH = APP + '/views/user/dashboard.ejs'
CSS = APP + '/public/assets/css/style.css'

# ═══ 1. helpers/home-layout.js — FEED_SLIDES +real-latest/real-popular ═══
print('── home-layout.js: FEED_SLIDES বাস্তব-গ্রুপ-সম্মিলন ──')
apply_edit(
    HL,
    "key: 'real-latest'",
    "  { key: 'best',    icon: 'fa-crown',        title: 'মাসিক সেরা লেখক',   sub: 'এই মাসের শ্রেষ্ঠ লেখক কে, দেখুন', href: '/best-writer' }\n];",
    "  { key: 'best',    icon: 'fa-crown',        title: 'মাসিক সেরা লেখক',   sub: 'এই মাসের শ্রেষ্ঠ লেখক কে, দেখুন', href: '/best-writer' },\n"
    "  // সেশন ৩১৩ (sfs313): বাস্তব-পোস্ট-গ্রুপ রেজিস্ট্রিতে সম্মিলিত — home_feed_order-এ\n"
    "  // real-popular real-latest-এর আগে = ফোন-ফিডে জনপ্রিয়-গ্রুপ-প্রথম (আইকন/লেবেল-ও\n"
    "  // রেজিস্ট্রি-সত্য)। নতুন-কী append-চুক্তি (present-beats-default) — ডিফল্ট\n"
    "  // চিপ-slice(0,3) ও গ্রুপ-ক্রম অপরিবর্তিত; /admin/home-reorder স্বয়ং-আবিষ্কার।\n"
    "  { key: 'real-latest',  icon: 'fa-bolt', title: 'সর্বশেষ লেখা',    sub: 'ফোন-ফিডে সদ্য-প্রকাশিত পোস্ট', href: '/dashboard' },\n"
    "  { key: 'real-popular', icon: 'fa-fire', title: 'জনপ্রিয় আলোচনা', sub: 'সর্বাধিক সাড়া পাওয়া আলাপ', href: '/dashboard' }\n];",
    'FEED_SLIDES +real-latest/real-popular (append-চুক্তি)')

# ═══ 2. feed.ejs — sfsGroups313 কম্পিউট-ব্লক ═══
print('── feed.ejs: sfsGroups313 কম্পিউট ──')
apply_edit(
    FEED,
    'const sfsGroups313',
    "  const sfsChips292 = (typeof feedSlides !== 'undefined' && feedSlides ? feedSlides : []).slice(0, 3);\n%>",
    "  const sfsChips292 = (typeof feedSlides !== 'undefined' && feedSlides ? feedSlides : []).slice(0, 3);\n"
    "  // সেশন ৩১৩ (sfs313): বাস্তব-গ্রুপ-সম্মিলন — home_feed_order-অর্ডারে real-popular\n"
    "  // real-latest-এর আগে-হলে ফোন-ফিডে জনপ্রিয়-গ্রুপ-প্রথম; আইকন/লেবেল রেজিস্ট্রি-সত্য\n"
    "  // (fallback = বর্তমান-ধ্রুব — ডিফল্ট রেন্ডার অভিন্ন)।\n"
    "  const sfsSlides313 = (typeof feedSlides !== 'undefined' && Array.isArray(feedSlides)) ? feedSlides : [];\n"
    "  const sfsSlide313 = (k) => sfsSlides313.find((s) => s.key === k) || null;\n"
    "  const sfsIdxLatest313 = sfsSlides313.findIndex((s) => s.key === 'real-latest');\n"
    "  const sfsIdxPop313 = sfsSlides313.findIndex((s) => s.key === 'real-popular');\n"
    "  const sfsPopFirst313 = (sfsIdxPop313 !== -1) && (sfsIdxLatest313 === -1 || sfsIdxPop313 < sfsIdxLatest313);\n"
    "  const sfsRegLB313 = (k, fb) => (sfsSlide313(k) || {}).title || fb;\n"
    "  const sfsRegIC313 = (k, fb) => (sfsSlide313(k) || {}).icon || fb;\n"
    "  const sfsGroups313 = sfsPopFirst313 ? [\n"
    "    { ic: sfsRegIC313('real-popular', 'fa-fire'), lb: sfsRegLB313('real-popular', 'জনপ্রিয় আলোচনা'), rows: sfsPostsB292 },\n"
    "    { ic: sfsRegIC313('real-latest', 'fa-bolt'), lb: sfsRegLB313('real-latest', 'সর্বশেষ লেখা'), rows: sfsPostsA292 }\n"
    "  ] : [\n"
    "    { ic: sfsRegIC313('real-latest', 'fa-bolt'), lb: sfsRegLB313('real-latest', 'সর্বশেষ লেখা'), rows: sfsPostsA292 },\n"
    "    { ic: sfsRegIC313('real-popular', 'fa-fire'), lb: sfsRegLB313('real-popular', 'জনপ্রিয় আলোচনা'), rows: sfsPostsB292 }\n"
    "  ];\n%>",
    'sfsGroups313 কম্পিউট-ব্লক (রেজিস্ট্রি-সমন্বিত গ্রুপ-ক্রম)')

# ═══ 3. feed.ejs — হাফ-ক্লোন-লুপ (×২-ডুপ্লিকেট নির্মূল) ═══
print('── feed.ejs: হাফ-ক্লোন-লুপ ──')
_t = rd(FEED)
if '<% [false, true].forEach((sfsHalf313) => { %>' in _t:
    print('  — (ইতিমধ্যে) হাফ-ক্লোন-লুপ')
else:
    S = _t.find('                <span class="sfs292-track">\n')
    E = _t.find('              <span class="sfs292-tabbar" aria-hidden="true">')
    if S == -1 or E == -1 or E <= S:
        fatal('ট্র্যাক-ব্লক-অ্যাঙ্কর-অনুপস্থিত (S=' + str(S) + ', E=' + str(E) + ')')
    else:
        OLD = _t[S:E]
        _ok = (OLD.count('<span class="sfs292-half" aria-hidden="true">') == 1
               and OLD.count('<span class="sfs292-half">') == 1
               and OLD.count('fa-bolt') == 2 and OLD.count('fa-fire') == 2
               and OLD.count('sfsPostsA292.forEach') == 2 and OLD.count('sfsPostsB292.forEach') == 2)
        if not _ok:
            fatal('ট্র্যাক-ব্লক-ভেরিফিকেশন-ব্যর্থ (dup-হাফ-গণনা অসনগত)')
        else:
            NEW = (
                '                <span class="sfs292-track">\n'
                '                  <%# সেশন ৩১৩ (sfs313): হাফ-ক্লোন-লুপ (×২-ডুপ্লিকেট-মার্কআপ নির্মূল —\n'
                '                      রেন্ডার-অভিন্ন) + গ্রুপ-ক্রম sfsGroups313 (ডিফল্টে সর্বশেষ-প্রথম)। %>\n'
                '                  <% [false, true].forEach((sfsHalf313) => { %>\n'
                '                  <span class="sfs292-half"<%- sfsHalf313 ? \' aria-hidden="true"\' : \'\' %>>\n'
                '                    <% sfsGroups313.forEach((g313) => { %>\n'
                '                    <span class="sfs292-glabel"><i class="fas <%= g313.ic %>"></i> <%= g313.lb %></span>\n'
                '                    <% g313.rows.forEach((p) => { %>\n'
                '                    <span class="sfs292-post<%= p.img ? \' has-img\' : \'\' %><%= p.real ? \' is-real307\' : \'\' %>" data-post-id="<%= p.id || \'\' %>">\n'
                '                      <span class="sfs292-phead"><span class="sfs292-pav"><%= sfsInitial292(p.n) %></span><span class="sfs292-pwho"><strong><%= p.n %></strong><small><%= p.h %></small></span><i class="fas fa-ellipsis-h"></i></span>\n'
                '                      <span class="sfs292-ptext"><%= p.t %></span>\n'
                '                      <% if (p.img) { %><span class="sfs292-pimg"><i class="fas fa-image"></i></span><% } %>\n'
                '                      <span class="sfs292-pacts"><span><i class="fas fa-heart"></i> <%= p.a %></span><span><i class="fas fa-comment"></i> <%= p.c %></span><span><i class="fas fa-<%= p.real ? \'eye\' : \'share\' %>"></i> <%= p.s %></span></span>\n'
                '                    </span>\n'
                '                    <% }) %>\n'
                '                    <% }) %>\n'
                '                  </span>\n'
                '                  <% }) %>\n'
                '                </span>\n')
            wr(FEED, _t[:S] + NEW + _t[E:])
            print('  ✓ হাফ-ক্লোন-লুপ (ডুপ্লিকেট-নির্মূল — রেন্ডার-অভিন্ন)')

# ═══ 4. feed.ejs — __sfs313QA হুক ═══
print('── feed.ejs: __sfs313QA হুক ──')
apply_edit(
    FEED,
    'window.__sfs313QA',
    "  window.__sfs312QA = q312;\n})();\n</script>\n</section>",
    "  window.__sfs312QA = q312;\n})();\n</script>\n"
    "<script>\n"
    "/* session313 (sfs313): গ্রুপ-ক্রম-সমন্বয় QA-হুক (নতুন-নেমস্পেস — sfs307/sfs312 অক্ষুণ্ণ) */\n"
    "(function () {\n"
    "  var q313 = { popFirst: <%- sfsPopFirst313 ? 'true' : 'false' %>, labels: <%- JSON.stringify(sfsGroups313.map(function (g) { return g.lb; })) %>, chips: <%= sfsChips292.length %>, glabels: 0, err: '' };\n"
    "  try {\n"
    "    q313.glabels = document.querySelectorAll('.sfs292-glabel').length;\n"
    "  } catch (e313) { q313.err = String((e313 && e313.message) || e313); }\n"
    "  window.__sfs313QA = q313;\n"
    "})();\n"
    "</script>\n</section>",
    '__sfs313QA হুক (popFirst + labels + glabels)')

# ═══ 5. feed.ejs — চিপ-কমেন্ট ×২→×৩ কসমেটিক ═══
print('── feed.ejs: চিপ-কমেন্ট কসমেটিক ──')
apply_edit(
    FEED,
    's313-এ real-* কী-ও-অংশ নেয়',
    '          <%# ── ভাসমান-চিপ ×২ — feedSlides-রেজিস্ট্রি (অ্যাডমিন-রিঅর্ডারযোগ্য) ── %>',
    '          <%# ── ভাসমান-চিপ ×৩ (s307) — feedSlides-রেজিস্ট্রি (অ্যাডমিন-রিঅর্ডারযোগ্য; s313-এ real-* কী-ও-অংশ নেয়) ── %>',
    'চিপ-কমেন্ট ×২→×৩ (কসমেটিক-সত্য)')

# ═══ 6. dashboard.ejs — s313-land নোটিশ ═══
print('── dashboard.ejs: found:0-নোটিশ ──')
apply_edit(
    DASH,
    'notice: 0',
    "  var q312 = { found: 0, id: '', err: '' };",
    "  var q312 = { found: 0, id: '', notice: 0, err: '' };",
    'q312 +notice-ফিল্ড')
apply_edit(
    DASH,
    'q312.notice = 1;',
    "      if (el312) {\n"
    "        q312.found = 1;\n"
    "        if (el312.scrollIntoView) el312.scrollIntoView({ block: 'center' });\n"
    "        el312.classList.add('s312-land-flash');\n"
    "        setTimeout(function () { el312.classList.remove('s312-land-flash'); }, 2400);\n"
    "      }",
    "      if (el312) {\n"
    "        q312.found = 1;\n"
    "        if (el312.scrollIntoView) el312.scrollIntoView({ block: 'center' });\n"
    "        el312.classList.add('s312-land-flash');\n"
    "        setTimeout(function () { el312.classList.remove('s312-land-flash'); }, 2400);\n"
    "      } else {\n"
    "        /* session313 (s313-land): found:0-পথে মৃদু-নোটিশ — গন্তব্য-কার্ড ফিডে-অনুপস্থিতে\n"
    "           নীরব-নো-অপ-এর-বদলে তথ্য-টোস্ট (session312-নোটের প্রস্তাব-৩)। হ্যাশ-বিহীন লোডে\n"
    "           এ-পথে-ই-ঢোকে-না (মূল-প্রবাহ অটুট); showToast-অনুপস্থিতে নীরব-গ্রেসফুল। */\n"
    "        q312.notice = 1;\n"
    "        if (typeof window.showToast === 'function') {\n"
    "          window.showToast('পোস্টটি এই ফিডে নেই — সার্চ বা হোম-ফিড থেকে দেখুন', 'lf313-info');\n"
    "        }\n"
    "      }",
    'found:0-নোটিশ else-শাখা')

# ═══ 6b. dashboard.ejs — অবতরণ-ইঞ্জিন hashchange-সমর্থন (session313-পূর্ণতা) ═══
print('── dashboard.ejs: hashchange-সমর্থন ──')
apply_edit(
    DASH,
    'hashEvents',
    """(function () {
  var q312 = { found: 0, id: '', notice: 0, err: '' };
  try {
    var m312 = /^#post-(\\d+)$/.exec(String(window.location.hash || ''));
    if (m312) {
      var id312 = m312[1];
      q312.id = id312;
      var el312 = document.querySelector('[data-s312-post="' + id312 + '"]') ||
                  document.querySelector('[data-post-id="' + id312 + '"]');
      if (el312) {
        q312.found = 1;
        if (el312.scrollIntoView) el312.scrollIntoView({ block: 'center' });
        el312.classList.add('s312-land-flash');
        setTimeout(function () { el312.classList.remove('s312-land-flash'); }, 2400);
      } else {
        /* session313 (s313-land): found:0-পথে মৃদু-নোটিশ — গন্তব্য-কার্ড ফিডে-অনুপস্থিতে
           নীরব-নো-অপ-এর-বদলে তথ্য-টোস্ট (session312-নোটের প্রস্তাব-৩)। হ্যাশ-বিহীন লোডে
           এ-পথে-ই-ঢোকে-না (মূল-প্রবাহ অটুট); showToast-অনুপস্থিতে নীরব-গ্রেসফুল। */
        q312.notice = 1;
        if (typeof window.showToast === 'function') {
          window.showToast('পোস্টটি এই ফিডে নেই — সার্চ বা হোম-ফিড থেকে দেখুন', 'lf313-info');
        }
      }
    }
  } catch (e312) { q312.err = String((e312 && e312.message) || e312); }
  window.__s312LandQA = q312;
})();""",
    """(function () {
  var q312 = { found: 0, id: '', notice: 0, hashEvents: 0, err: '' };
  var land312 = function () {
    try {
      var m312 = /^#post-(\\d+)$/.exec(String(window.location.hash || ''));
      if (!m312) return;
      var id312 = m312[1];
      q312.id = id312;
      var el312 = document.querySelector('[data-s312-post="' + id312 + '"]') ||
                  document.querySelector('[data-post-id="' + id312 + '"]');
      if (el312) {
        q312.found = 1;
        if (el312.scrollIntoView) el312.scrollIntoView({ block: 'center' });
        el312.classList.add('s312-land-flash');
        setTimeout(function () { el312.classList.remove('s312-land-flash'); }, 2400);
      } else {
        /* session313 (s313-land): found:0-পথে মৃদু-নোটিশ — গন্তব্য-কার্ড ফিডে-অনুপস্থিতে
           নীরব-নো-অপ-এর-বদলে তথ্য-টোস্ট (session312-নোটের প্রস্তাব-৩)। হ্যাশ-বিহীন লোডে
           এ-পথে-ই-ঢোকে-না (মূল-প্রবাহ অটুট); showToast-অনুপস্থিতে নীরব-গ্রেসফুল। */
        q312.notice = 1;
        if (typeof window.showToast === 'function') {
          window.showToast('পোস্টটি এই ফিডে নেই — সার্চ বা হোম-ফিড থেকে দেখুন', 'lf313-info');
        }
      }
    } catch (e312) { q312.err = String((e312 && e312.message) || e312); }
  };
  land312();
  /* session313 (s313-land): hash-only নেভিগেশনেও অবতরণ-পুনঃচালু — পূর্বে কেবল-লোড-টাইম
     ছিল (dashboard-অবস্থায় #post-<id>-বদল নীরব-নো-অপ ছিল); sfs312-ট্যাপ-থ্রুর
     dashboard-বহির্ভূত-প্রবাহ অপরিবর্তিত (পূর্ণ-নেভিগেশন = লোড-টাইম-ই-চালু)। */
  window.addEventListener('hashchange', function () {
    q312.hashEvents += 1;
    land312();
  });
  window.__s312LandQA = q312;
})();""",
    'অবতরণ-ইঞ্জিন hashchange-পুনঃচালু (s313-পূর্ণতা)')

# ═══ 6c. dashboard.ejs — প্রতি-চেষ্টায় সতেজ-স্টেট (found/notice রিসেট) ═══
print('── dashboard.ejs: সতেজ-স্টেট-রিসেট ──')
apply_edit(
    DASH,
    'সতেজ-স্টেট',
    "  var land312 = function () {\n    try {\n      var m312",
    "  var land312 = function () {\n"
    "    q312.found = 0; q312.notice = 0; /* session313 (s313-land): প্রতি-চেষ্টায় সতেজ-স্টেট —\n"
    "       hash-শৃঙ্খলে পূর্ব-চেষ্টার স্টেল-উত্তর বহন-নিষিদ্ধ (found=শেষ-চেষ্টার-সত্য) */\n"
    "    try {\n      var m312",
    'land312 প্রতি-চেষ্টায় found/notice-রিসেট')

# ═══ 7. style.css — session313 ব্লক ═══
print('── style.css: session313-ব্লক ──')
_t = rd(CSS)
if 'EOF session313' in _t:
    print('  — (ইতিমধ্যে) session313-ব্লক')
else:
    B313 = (
        "\n\n/* ═════════════════════ session313 (s313-land + toast-family) ═════════════════════\n"
        "   ① .toast-পরিবারে ভিজ্যুয়াল-স্টেট — success/error/lf313-info (বাম-অ্যাকসেন্ট-বার —\n"
        "      এতদিন টোস্ট নিরপেক্ষ-একরঙা; স্টেট-পাঠ দৃশ্যমাল)। ② lf313-info = অবতরণ-নোটিশ\n"
        "      (ব্র্যান্ড-টিন্ট + তথ্য-আইকন)। ③ 640px safe-area + reduced-motion।\n"
        "   হেক্স-শূন্য — var(--lf-*) + color-mix (session312-চুক্তি)। */\n"
        ".toast {\n"
        "  overflow: hidden;\n"
        "}\n"
        ".toast::before {\n"
        "  content: '';\n"
        "  position: absolute;\n"
        "  left: 0;\n"
        "  top: 0;\n"
        "  bottom: 0;\n"
        "  width: 3px;\n"
        "  background: transparent;\n"
        "  pointer-events: none;\n"
        "}\n"
        ".toast.success::before {\n"
        "  background: var(--lf-ok);\n"
        "}\n"
        ".toast.error::before {\n"
        "  background: var(--lf-danger);\n"
        "}\n"
        ".toast.lf313-info {\n"
        "  background: color-mix(in srgb, var(--lf-brand-primary) 88%, var(--lf-brand-light));\n"
        "  box-shadow: var(--lf-shadow-card);\n"
        "  border: 1px solid color-mix(in srgb, var(--lf-brand-light) 55%, transparent);\n"
        "  padding-right: 44px;\n"
        "}\n"
        ".toast.lf313-info::before {\n"
        "  background: var(--lf-brand-light);\n"
        "  width: 4px;\n"
        "}\n"
        ".toast.lf313-info::after {\n"
        "  content: '\\f05a';\n"
        "  font-family: 'Font Awesome 6 Free';\n"
        "  font-weight: 900;\n"
        "  position: absolute;\n"
        "  right: 16px;\n"
        "  top: 50%;\n"
        "  transform: translateY(-50%);\n"
        "  opacity: 0.85;\n"
        "  font-size: 16px;\n"
        "}\n"
        "@media (max-width: 640px) {\n"
        "  .toast {\n"
        "    bottom: calc(16px + env(safe-area-inset-bottom, 0px));\n"
        "    max-width: calc(100% - 24px);\n"
        "    font-size: 13px;\n"
        "  }\n"
        "  .toast.lf313-info { padding-right: 40px; }\n"
        "}\n"
        "@media (prefers-reduced-motion: reduce) {\n"
        "  .toast {\n"
        "    transition: opacity 0.01ms linear;\n"
        "  }\n"
        "}\n"
        "/* ═════════════════════ EOF session313 (s313-land + toast-family) ═════════════════════ */")
    wr(CSS, _t.rstrip('\n') + B313 + '\n')
    print('  ✓ session313-ব্লক সংযোজন (toast-family + lf313-info)')

# ═══ পোস্ট-অ্যাসার্ট ═══
print('── পোস্ট-অ্যাসার্ট ──')
_t = rd(CSS)
_i = _t.find('session313')
_e = _t.find('EOF session313')
if _i == -1 or _e == -1 or _e <= _i:
    fatal('session313-ব্লক-সীমা-অনুপস্থিত')
else:
    B313C = _t[_i:_e]
    import re as _re
    _hex = _re.findall(r'#[0-9a-fA-F]{3,8}\b', B313C)
    if _hex:
        fatal('style.css session313-ব্লকে হেক্স-আবিষ্কৃত: ' + ', '.join(_hex[:5]))
    else:
        print('  ✓ style.css: session313-ব্লক হেক্স-শূন্য (var/color-mix)')
    for needle, lbl in [
        ('prefers-reduced-motion', 'style.css: reduced-motion-গার্ড'),
        ('max-width: 640px', 'style.css: 640px-safe-area'),
        ('lf313-info', 'style.css: lf313-info-ভ্যারিয়েন্ট'),
        ('--lf-danger', 'style.css: error-স্টেট-বার'),
    ]:
        if needle in B313C:
            print('  ✓ ' + lbl)
        else:
            fatal(lbl + ' অনুপস্থিত')

# node --check home-layout.js
r = subprocess.run(['node', '--check', 'helpers/home-layout.js'], cwd=APP, capture_output=True, text=True)
if r.returncode == 0:
    print('  ✓ node --check helpers/home-layout.js')
else:
    fatal('home-layout.js node --check ব্যর্থ: ' + (r.stderr or '').strip()[:200])

# রেজিস্ট্রি-লোড-প্রমাণ (৬-এন্ট্রি + কী-ক্রম)
r = subprocess.run(['node', '-e',
                    "const h=require('./helpers/home-layout.js');const ks=h.FEED_SLIDES.map(s=>s.key);"
                    "if(ks.length!==6||ks[3]!=='best'||ks[4]!=='real-latest'||ks[5]!=='real-popular'){"
                    "console.error('KEYS='+JSON.stringify(ks));process.exit(1)}"
                    "console.log('OK6')"], cwd=APP, capture_output=True, text=True)
if r.returncode == 0 and 'OK6' in r.stdout:
    print('  ✓ FEED_SLIDES=৬-এন্ট্রি + real-* append-ক্রম-প্রমাণ')
else:
    fatal('FEED_SLIDES-রেজিস্ট্রি-প্রমাণ-ব্যর্থ: ' + (r.stderr or '').strip()[:200])

# EJS-কম্পাইল ×২
print('── EJS-কম্পাইল ×২ ──')
for rel in ['views/partials/home/feed.ejs', 'views/user/dashboard.ejs']:
    r = subprocess.run(['node', '-e',
                        "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('" + rel + "','utf8'),{filename:'" + rel + "'});console.log('OK')"],
                       cwd=APP, capture_output=True, text=True)
    if r.returncode == 0 and 'OK' in r.stdout:
        print('  ✓ ' + rel + ' কম্পাইল গ্রিন')
    else:
        fatal(rel + ' EJS-কম্পাইল-ব্যর্থ: ' + (r.stderr or '').strip()[:200])

# feed.ejs গঠন-গণনা
_t = rd(FEED)
for needle, want, lbl in [
    ('sfsGroups313', None, 'sfsGroups313-উপস্থিত'),
    ('<% [false, true].forEach((sfsHalf313) => { %>', 1, 'হাফ-লুপ ×১'),
    ('g313.rows.forEach', 1, 'rows-লুপ ×১ (ডুপ্লিকেট-নির্মূল-প্রমাণ)'),
    ('rows: sfsPostsA292', 2, 'rowsA-রেজিস্ট্রি-সংযুক্ত ×২ (দ্বি-শাখা)'),
    ('rows: sfsPostsB292', 2, 'rowsB-রেজিস্ট্রি-সংযুক্ত ×২ (দ্বি-শাখা)'),
    ('window.__sfs313QA', 1, 'sfs313QA-হুক-সংজ্ঞা ×১'),
]:
    n = _t.count(needle)
    if want is None and n:
        print('  ✓ ' + lbl + ' (×' + str(n) + ')')
    elif n == want:
        print('  ✓ ' + lbl)
    else:
        fatal(lbl + ' — গণনা=' + str(n) + ' (প্রত্যাশা ' + str(want) + ')')

_t = rd(DASH)
for needle, want, lbl in [('notice: 0', 1, 'dashboard: notice-ফিল্ড ×১'),
                          ('q312.notice = 1;', 1, 'dashboard: notice-সেট ×১ (ডুপ-বিরোধী-প্রমাণ)'),
                          ("'lf313-info'", 1, 'dashboard: lf313-info-টোস্ট-কল ×১')]:
    n = _t.count(needle)
    if n == want:
        print('  ✓ ' + lbl)
    else:
        fatal(lbl + ' — গণনা=' + str(n) + ' (প্রত্যাশা ' + str(want) + ')')

if FATAL:
    print('\nসর্ব-মোট FATAL: ' + str(len(FATAL)))
    sys.exit(1)
print('\ns313-patch ✓ সর্ব-ধাপ সবুজ (idempotent ×N পুনঃরানযোগ্য)')
