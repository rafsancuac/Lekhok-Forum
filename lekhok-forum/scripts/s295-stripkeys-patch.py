#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════════════
# s295-stripkeys-patch.py — session295 প্যাচ (ep295): স্ট্রিপ মিনি-থাম্ব + ←/→ কীবোর্ড-নেভ
# Idempotent ×২ (মার্কার-গার্ড-প্রথম); অ্যাঙ্কর-এককতা-FATAL; পোস্ট-অ্যাসার্ট
# (মার্কআপ+ক্লায়েন্ট+CSS+হেক্স-শূন্য+hidden-গার্ড-বাইট+no-regression s294)।
# টার্গেট: views/user/epaper.ejs + public/assets/css/epaper.css
# ব্যবহার: python3 scripts/s295-stripkeys-patch.py
# ═══════════════════════════════════════════════════════════════════════════
import io, sys, subprocess, os

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.path.join(APP, 'views', 'user', 'epaper.ejs')
CSS = os.path.join(APP, 'public', 'assets', 'css', 'epaper.css')

MARK = 'session295'

# ── এডিট ১: পিল-মার্কআপে কন্ডিশনাল মিনি-থাম্ব (row-native thumbs — মিসম্যাচ-অসম্ভব) ──
ANCHOR_BTN = (
    '    <button type="button" class="ep-strip294-pill" data-ep-strip294="<%= p.name %>" title="<%= p.dateBn %>">\n'
    '      <span class="ep-strip294-dot" aria-hidden="true"></span>'
)
REPL_BTN = (
    '    <button type="button" class="ep-strip294-pill" data-ep-strip294="<%= p.name %>" title="<%= p.dateBn %>">\n'
    '      <% if (p.thumbs && p.thumbs.length) { %><span class="ep-strip294-thumb" aria-hidden="true"><img class="ep-strip294-thumb-img" src="<%= p.thumbs[0] %>" alt="" loading="lazy" decoding="async"></span><% } %><span class="ep-strip294-dot" aria-hidden="true"></span>'
)

# ── এডিট ২: ক্লায়েন্ট-স্ক্রিপ্ট — capture-এরর-লিসনার + keydown ←/→ + QA-হুক ──
ANCHOR_JS = (
    "      sel.dispatchEvent(new Event('change', { bubbles: true }));\n"
    "    });\n"
    "  })();"
)
INSERT_JS = (
    "      sel.dispatchEvent(new Event('change', { bubbles: true }));\n"
    "    });\n"
    "    /* session295 (ep295): মিনি-থাম্ব লোড-ব্যর্থতায় স্প্যান-লুকান — টেক্সট-অনলি-ফলব্যাক (ep292-প্যাটার্ন-মিরর);\n"
    "       error ইভেন্ট non-bubbling → স্ট্রিপে capture-ফেজে শোনা হয় (ep292-নীতি-উত্তরাধিকার)। */\n"
    "    strip.addEventListener('error', function (e) {\n"
    "      var t = e.target;\n"
    "      if (!t || !t.classList || !t.classList.contains('ep-strip294-thumb-img')) return;\n"
    "      var w = t.parentNode;\n"
    "      if (w && w.classList && w.classList.contains('ep-strip294-thumb')) w.hidden = true;\n"
    "    }, true);\n"
    "    /* session295 (ep295): ←/→ কীবোর্ড-নেভ — ফোকাস-পিলে-থাকলে পিল-থেকে-পিল (wrap);\n"
    "       সক্রিয়করণ = নেটিভ-সিলেক্টর change-চেইন-পুনঃব্যবহার (next.click() — একক-ফানেল, date-aware ফ্রি);\n"
    "       লিসনার স্ট্রিপ-স্কোপড → বাইন্ডিং-স্কোপই-ফিল্ড-গার্ড (স্ট্রিপ-বহির্ভূত-ফোকাসে-হস্তক্ষেপ-শূন্য)। */\n"
    "    strip.addEventListener('keydown', function (ev) {\n"
    "      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;\n"
    "      var pills = strip.querySelectorAll('.ep-strip294-pill');\n"
    "      if (!pills.length) return;\n"
    "      var cur = ev.target && ev.target.closest ? ev.target.closest('.ep-strip294-pill') : null;\n"
    "      if (!cur) return;\n"
    "      var idx = Array.prototype.indexOf.call(pills, cur);\n"
    "      if (idx < 0) return;\n"
    "      var next = ev.key === 'ArrowRight' ? pills[(idx + 1) % pills.length] : pills[(idx - 1 + pills.length) % pills.length];\n"
    "      if (!next) return;\n"
    "      ev.preventDefault();\n"
    "      next.focus();\n"
    "      next.click();\n"
    "    });\n"
    "    /* session295: QA-হুক (সারফেস-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি) */\n"
    "    window.__epStrip295QA = {\n"
    "      pills: function () { return strip.querySelectorAll('.ep-strip294-pill').length; },\n"
    "      thumbs: function () { return strip.querySelectorAll('.ep-strip294-thumb').length; },\n"
    "      thumbsHidden: function () { return strip.querySelectorAll('.ep-strip294-thumb[hidden]').length; },\n"
    "      imgs: function () { return strip.querySelectorAll('.ep-strip294-thumb-img').length; },\n"
    "      keynav: true\n"
    "    };\n"
    "  })();"
)

# ── এডিট ৩: CSS ব্লক (EOF-এ append; হেক্স-শূন্য টোকেন-শুধু) ──
CSS_BLOCK = '''
/* ═══ session295 — স্ট্রিপ মিনি-থাম্ব + কীবোর্ড-নেভ (ep295 — ep294-স্ট্রিপ-বিস্তার; PLANS session294-প্রস্তাব ①+②)
   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + hidden-গার্ড বাইট-সঠিক + focus-visible-রিং (কীবোর্ড-নেভ-সামন্বয়)
   + reduced-motion-সম্মান + 640px-সংকোচন ═══ */
.ep-strip294-thumb { display: inline-flex; width: 22px; height: 30px; border-radius: var(--radius-sm); border: 1px solid var(--lf-ui-border); background: var(--lf-brandgreen-soft-3); overflow: hidden; flex-shrink: 0; }
.ep-strip294-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ep-strip294-thumb[hidden] { display: none !important; }
.ep-strip294-pill.is-active .ep-strip294-thumb { border-color: var(--lf-white); box-shadow: 0 0 0 1px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent); }
.ep-strip294-pill:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 2px; }
.ep-strip294-pill.is-active:focus-visible { outline-color: var(--lf-white); }
@media (max-width: 640px) { .ep-strip294-thumb { width: 18px; height: 24px; } }
@media (prefers-reduced-motion: reduce) { .ep-strip294-pill:focus-visible { outline-offset: 0; } }
'''


def fatal(msg):
    print('FATAL:', msg)
    sys.exit(1)


def read(p):
    return io.open(p, 'r', encoding='utf-8').read()


def write(p, s):
    io.open(p, 'w', encoding='utf-8').write(s)


# ── ১. epaper.ejs ──
ep = read(EP)
if MARK in ep:
    print('skip: epaper.ejs (মার্কার-উপস্থিত)')
else:
    if ep.count(ANCHOR_BTN) != 1:
        fatal('BTN-অ্যাঙ্কর-এককতা ভঙ্গ (count=%d)' % ep.count(ANCHOR_BTN))
    if ep.count(ANCHOR_JS) != 1:
        fatal('JS-অ্যাঙ্কর-এককতা ভঙ্গ (count=%d)' % ep.count(ANCHOR_JS))
    ep = ep.replace(ANCHOR_BTN, REPL_BTN, 1)
    ep = ep.replace(ANCHOR_JS, INSERT_JS, 1)
    write(EP, ep)
    print('ok: epaper.ejs প্যাচড')

# ── ২. epaper.css ──
css = read(CSS)
if MARK in css:
    print('skip: epaper.css (মার্কার-উপস্থিত)')
else:
    css = css.rstrip('\n') + '\n' + CSS_BLOCK
    write(CSS, css)
    print('ok: epaper.css প্যাচড')

# ── ৩. পোস্ট-অ্যাসার্ট ──
ep = read(EP)
css = read(CSS)

# মার্কআপ (সোর্স-টেমপ্লেট-লাইন-গণনা — রেন্ডার্ড-গণনা সুইট-স্তরে)
for pat, want, label in [
    ('ep-strip294-thumb"', 1, 'থাম্ব-স্প্যান-মার্কআপ'),
    ('ep-strip294-thumb-img', 3, 'থাম্ব-ইমগ-রেফারেন্স (মার্কআপ+লিসনার+হুক)'),
    ('aria-hidden="true"><img class="ep-strip294-thumb-img"', 1, 'থাম্ব-aria-hidden'),
    ("strip.addEventListener('error', function (e) {", 1, 'capture-এরর-লিসনার'),
    ("strip.addEventListener('keydown', function (ev) {", 1, 'keydown-লিসনার'),
    ("if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;", 1, 'keydown-গার্ড-লাইন'),
    ("var next = ev.key === 'ArrowRight' ? pills[(idx + 1) % pills.length] : pills[(idx - 1 + pills.length) % pills.length];", 1, 'wrap-নেভ-লাইন'),
    ('window.__epStrip295QA', 1, 'QA-হুক-সংজ্ঞা'),
    ('next.focus();', 1, 'রোভিং-ফোকাস'),
    ('next.click();', 1, 'একক-ফানেল-ক্লিক'),
]:
    got = ep.count(pat)
    if got != want:
        fatal('%s-গণনা=%d (প্রত্যাশা %d)' % (label, got, want))
print('ok: epaper.ejs পোস্ট-অ্যাসার্ট ×১১')

# বাইট-ক্রম: থাম্ব-স্প্যান পিল-বাটন-খোলার পরে ও ডট-স্প্যানের আগে
i_btn = ep.find('class="ep-strip294-pill" data-ep-strip294=')
i_thumb = ep.find('ep-strip294-thumb"')
i_dot = ep.find('ep-strip294-dot')
if not (i_btn < i_thumb < i_dot):
    fatal('মার্কআপ-ক্রম ভঙ্গ (btn=%d thumb=%d dot=%d)' % (i_btn, i_thumb, i_dot))
print('ok: বাইট-ক্রম (button → thumb → dot)')

# no-regression: s294 মার্কার-চতুষ্টয় অক্ষুণ্ণ
for pat in ['id="epStrip294"', 'window.__epStrip294Sync = sync294',
            'window.__epStrip294Sync(p)', 'aria-label="শীর্ষ পত্রিকা দ্রুত-সুইচ"',
            'ep-strip294-all', "pills[(idx + 1) % pills.length]", "pills[(idx - 1 + pills.length) % pills.length]"]:
    if pat not in ep:
        fatal('no-regression: s294-মার্কার অনুপস্থিত: %s' % pat)
print('ok: no-regression s294 ×৭')

# CSS: ব্লক-উপস্থিতি + hidden-গার্ড বাইট-সঠিক + হেক্স-শূন্য
for pat in [
    'session295 — স্ট্রিপ মিনি-থাম্ব + কীবোর্ড-নেভ',
    '.ep-strip294-thumb { display: inline-flex;',
    '.ep-strip294-thumb[hidden] { display: none !important; }',
    '.ep-strip294-pill:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 2px; }',
    'color-mix(in srgb, var(--lf-brand-primary) 40%, transparent)',
    '@media (max-width: 640px) { .ep-strip294-thumb { width: 18px; height: 24px; } }',
    '@media (prefers-reduced-motion: reduce) { .ep-strip294-pill:focus-visible { outline-offset: 0; } }',
]:
    if pat not in css:
        fatal('CSS-মার্কার অনুপস্থিত: %s' % pat)
s295 = css.find('session295 — স্ট্রিপ মিনি-থাম্ব')
if s295 < 0:
    fatal('CSS s295-ব্লক-শুরু নির্ণয় ব্যর্থ')
block = css[s295:]
import re
hexes = re.findall(r'#[0-9a-fA-F]{3,8}', block)
if hexes:
    fatal('CSS s295-ব্লকে hex=%d (%s)' % (len(hexes), hexes[:3]))
print('ok: CSS ব্লক + hidden-গার্ড-বাইট + হেক্স-শূন্য')

# s294 CSS-ব্লক অক্ষুণ্ণ
if 'session294 — কুইক-সুইচ স্ট্রিপ' not in css:
    fatal('no-regression: CSS s294-ব্লক অনুপস্থিত')

# EJS-compile
r = subprocess.run(['node', '-e',
                    "require('ejs').compile(require('fs').readFileSync('views/user/epaper.ejs','utf8'),{filename:'views/user/epaper.ejs'})"],
                   cwd=APP, capture_output=True, text=True)
if r.returncode != 0:
    fatal('EJS-compile ব্যর্থ: %s' % r.stderr[:300])
print('ok: EJS-compile')

print('══ s295-প্যাচ: সব-অ্যাসার্ট সবুজ ══')
