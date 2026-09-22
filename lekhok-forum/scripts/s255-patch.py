#!/usr/bin/env python3
# s255-patch.py — session255 (Task ID 95): /moderator/members তাৎক্ষণিক-ফিল্টার mm255 — অবশিষ্ট-খণ্ড (idempotent)
# নোট: MultiEdit-আংশিক-প্রয়োগ-গোটচা (edit 1-3 ল্যান্ডেড, 4-ব্যর্থ — রোলব্যাক-হয়নি) → এ-স্ক্রিপ্ট skip-if-present।
import io, sys

VIEWS = 'views/user/moderator-members.ejs'

def rd(p):
    with io.open(p, 'r', encoding='utf-8') as f: return f.read()

def wr(p, s):
    with io.open(p, 'w', encoding='utf-8') as f: f.write(s)

html = rd(VIEWS)

def sub1(s, old, new, tag, present_marker):
    if present_marker in s:
        print(f'  skip [{tag}] — already applied')
        return s
    c = s.count(old)
    if c != 1:
        print(f'FATAL: anchor [{tag}] count={c} (expected 1)'); sys.exit(1)
    print(f'  apply [{tag}]')
    return s.replace(old, new, 1)

# ① wing + other কার্ডে data-mm-sec
html = sub1(html, '<div class="mod-card">\n    <h2><i class="fas fa-user-tie"></i> ',
                 '<div class="mod-card" data-mm-sec>\n    <h2><i class="fas fa-user-tie"></i> ', 'sec-wing', 'data-mm-sec>\n    <h2><i class="fas fa-user-tie"')
html = sub1(html, '<div class="mod-card">\n    <h2><i class="fas fa-user"></i> ',
                 '<div class="mod-card" data-mm-sec>\n    <h2><i class="fas fa-user"></i> ', 'sec-other', 'data-mm-sec>\n    <h2><i class="fas fa-user"')

# ② wing/other include-এ wlabel
html = sub1(html, "<% wrows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS }) %>",
                 "<% wrows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS, wlabel: wlabel }) %>", 'inc-wing', "wrows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS, wlabel: wlabel })")
html = sub1(html, "<% otherRows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS }) %>",
                 "<% otherRows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS, wlabel: 'অন্যান্য ধরন' }) %>", 'inc-other', "otherRows.forEach(m => { %>\n      <%- include('../shared/mod-member-row', { m: m, adv: true, MT_OPTIONS: MT_OPTIONS, wlabel")

# ③ শূন্য-অবস্থা বক্স — otherRows-ব্লকের <% } %>-এর পরে
EMPTY = (
"  <% } %>\n"
"\n"
"  <%# session255: তাৎক্ষণিক-ফিল্টার-শূন্য-অবস্থা (ক্লায়েন্ট-সাইডেই টগল হয়) %>\n"
"  <div class=\"mm255-empty\" data-mm-empty hidden>\n"
"    <i class=\"fas fa-filter-circle-xmark\"></i>\n"
"    <h3>এই ফিল্টারে কোনো সদস্য মেলেনি</h3>\n"
"    <p>ফিল্টার-কীওয়ার্ড বদলে আবার চেষ্টা করুন — বা Escape দিয়ে পরিষ্কার করুন।</p>\n"
"  </div>\n"
"</div>"
)
html = sub1(html, "  <% } %>\n</div>", EMPTY, 'empty-box', 'data-mm-empty')

# ④ স্টাইল + স্ক্রিপ্ট — /admin-main বন্ধের ঠিক-আগে
STYLE = """<style>
/* ── session255 — সদস্য-তালিকা তাৎক্ষণিক-ফিল্টার (টোকেন-শুধু; mc254-প্যাটার্ন-মিরর; guard-হেক্স-র্যাচেট-নিরাপদ) ── */
.mm255-wrap { display: flex; align-items: center; gap: 10px; margin: 2px 0 14px; }
.mm255-field { position: relative; flex: 0 1 420px; }
.mm255-input { width: 100%; padding: 10px 52px 10px 13px; font-family: inherit; font-size: .95rem; color: var(--lf-text-primary); background: var(--lf-ui-surface); border: 1px solid var(--lf-ui-border-strong); border-radius: 8px; transition: border-color .15s ease, box-shadow .15s ease; }
.mm255-input::placeholder { color: var(--lf-text-tertiary); }
.mm255-input:focus { outline: none; border-color: var(--lf-brandgreen); box-shadow: 0 0 0 4px color-mix(in srgb, var(--lf-brandgreen) 14%, transparent); }
.mm255-kbd { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; font: inherit; font-size: 10px; font-weight: 700; line-height: 1; color: var(--lf-text-tertiary); background: var(--lf-ui-canvas); border: 1px dashed var(--lf-ui-border-strong); border-radius: 4px; padding: 2px 6px; transition: opacity .15s ease; }
.mm255-field:focus-within .mm255-kbd { opacity: 0; }
.mm255-count { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; padding: 6px 10px; border-radius: 999px; background: var(--lf-ui-canvas); border: 1px solid var(--lf-ui-border); color: var(--lf-text-secondary); font-weight: 700; font-size: .85rem; font-variant-numeric: tabular-nums; }
.mm255-count.mm255-dim { color: var(--lf-text-tertiary); }
.mm255-clear { border: 1px solid var(--lf-ui-border); background: var(--lf-ui-surface); color: var(--lf-text-tertiary); border-radius: 5px; padding: 8px 11px; cursor: pointer; transition: color .15s ease, border-color .15s ease; }
.mm255-clear:hover { color: var(--lf-green-ink); border-color: var(--lf-brandgreen); }
.mm255-clear:active { transform: scale(.96); }
.mm255-empty { text-align: center; padding: 34px 16px; border: 1px dashed var(--lf-ui-border-strong); border-radius: 10px; background: var(--lf-ui-canvas); color: var(--lf-text-secondary); margin: 10px 0; }
.mm255-empty i { font-size: 1.7rem; color: var(--lf-text-tertiary); margin-bottom: 8px; display: inline-block; }
.mm255-empty h3 { margin: 4px 0 6px; font-size: 1.05rem; color: var(--lf-text-primary); }
.mm255-empty p { margin: 0; font-size: .9rem; color: var(--lf-text-tertiary); }
/* hidden-গার্ড ×২ — সারি + সেকশন-কার্ড (filter-hide নির্ভরযোগ্য) */
details.mem-row[data-mm-row][hidden] { display: none !important; }
.mod-card[data-mm-sec][hidden] { display: none !important; }
@media (max-width: 640px) { .mm255-field { flex-basis: 100%; } .mm255-input { padding-right: 13px; } .mm255-kbd { display: none; } }
@media (prefers-reduced-motion: reduce) { .mm255-input, .mm255-kbd { transition: none; } .mm255-clear:active { transform: none; } }
</style>

<script>
  /* ── session255: তাৎক্ষণিক-ফিল্টার (mc254-চুক্তি-মিরর + grouped-list সেকশন-অটো-হাইড; __mmQA হুক) ── */
  (function () {
    'use strict';
    var input = document.getElementById('mm255-filter');
    var count = document.getElementById('mm255-count');
    var clearBtn = document.getElementById('mm255-clear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-mm-row]'));
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-mm-sec]'));
    var emptyBox = document.querySelector('[data-mm-empty]');
    var total = cards.length;
    function apply255() {
      var v = (input.value || '').trim().toLowerCase();
      var vis = 0;
      cards.forEach(function (c) {
        var hit = !v || (c.getAttribute('data-kw') || '').indexOf(v) >= 0;
        c.hidden = !hit;
        if (hit) vis++;
      });
      secs.forEach(function (s) {
        var any = s.querySelector('[data-mm-row]:not([hidden])');
        s.hidden = !!v && !any;
      });
      count.textContent = String(vis);
      count.classList.toggle('mm255-dim', !!v && vis !== total);
      if (emptyBox) emptyBox.hidden = vis !== 0;
      if (clearBtn) clearBtn.hidden = !v;
    }
    function clear255() { input.value = ''; apply255(); }
    if (input) {
      input.addEventListener('input', apply255);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { clear255(); input.blur(); }
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', function () { clear255(); input.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'f' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });
    /* session255 QA-হুক (__mmQA — সারফেস-নেমস্পেস-রীতি; ক্রমের-শেষ) */
    window.__mmQA = {
      total: function () { return total; },
      count: function () { return document.querySelectorAll('[data-mm-row]:not([hidden])').length; },
      secs: function () { return document.querySelectorAll('[data-mm-sec]:not([hidden])').length; },
      apply: apply255,
      clear: function () { clear255(); }
    };
  })();
</script>
</div><!-- /admin-main -->"""
html = sub1(html, "</div><!-- /admin-main -->", STYLE, 'style-script', '__mmQA')

wr(VIEWS, html)
print('OK — mm255 remaining anchors complete')
