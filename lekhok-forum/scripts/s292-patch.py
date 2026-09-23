#!/usr/bin/env python3
# s292-patch.py — session292: ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ (ep292)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N
#         + পোস্ট-অ্যাসার্ট (নতুন-মার্কার + epk291-স্ট্রিং-অক্ষুণ্ণ + ep292-CSS-ব্লক হেক্স-শূন্য)
# epk291-বডি-অস্পৃশ্য-রীতি: applyPaper/startTimer/হোভার-পজ-লজিক অপরিবর্তিত —
#   থাম্ব-স্প্যান SSR-মার্কআপ + capture-ফেজ-error-লিসনার + QA-হুক র‍্যাপার-স্তরে
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/partials/home/today.ejs'
CSS = APP + '/public/assets/css/style.css'
MARK = 'session292'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# ══ today.ejs ══
ej = rd(EJS)
if MARK in ej:
    print('PATCH-SKIP(ejs): মার্কার-উপস্থিত (idempotent)')
else:
    # ── অ্যাঙ্কর-অ্যাসার্ট (গার্ড-পরে) ──
    A1 = ('                        style="--epkAcc291: <%= teAcc291(i) %>">\n'
          '                  <span class="epk291-film-kicker">দৈনিক</span>\n')
    A2 = '    • deep-link: /epaper?file=<id> — epaper-অ্যাপের session233-boot-hook সরাসরি খোলে।\n'
    A3 = '  applyPaper(0);\n  startTimer();\n'
    for name, a in [('A1', A1), ('A2', A2), ('A3', A3)]:
        if ej.count(a) != 1:
            die('ejs %s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, ej.count(a)))

    # ── এডিট-১: ফিল্ম-বাটনে মিনি-থাম্ব (SSR — no-JS-এও সঠিক; একক-লাইন-স্প্যান; img-এ id-নেই — dup-id-নিরাপদ) ──
    E1 = ('                        style="--epkAcc291: <%= teAcc291(i) %>">\n'
          '                  <% if (p.thumb) { %><span class="epk291-film-thumb" aria-hidden="true"><img class="epk291-film-thumb-img" src="<%= p.thumb %>" alt="" loading="lazy" decoding="async"></span><% } %>\n'
          '                  <span class="epk291-film-kicker">দৈনিক</span>\n')
    ej = ej.replace(A1, E1, 1)

    # ── এডিট-২: হেডার-কমেন্ট-ডক (session292-মার্কার-বহন) ──
    E2 = A2 + ('    • session292: ফিল্মস্ট্রিপ বাটনে মিনি-থাম্ব-প্রিভিউ — একই epaperThumbByName291 নাম-মিল-সোর্স\n'
               '      (ভুল-পত্রিকার-ছবি-অসম্ভব); লোড-ব্যর্থতায় JS থাম্ব-স্প্যান লুকায় — টেক্সট-অনলি-ফলব্যাক।\n')
    ej = ej.replace(A2, E2, 1)

    # ── এডিট-৩: capture-ফেজ-error-লিসনার + __epk292QA হুক (applyPaper-পূর্বে) ──
    E3 = ('  // session292: ফিল্ম-মিনি-থাম্ব লোড-ব্যর্থতায় থাম্ব-স্প্যান লুকান — টেক্সট-অনলি-ফলব্যাক\n'
          '  // (ভাঙা-ছবি-কখনো-নয়); error ইভেন্ট non-bubbling → film-কনটেইনারে capture-ফেজে শোনা হয়\n'
          '  if (film) {\n'
          '    film.addEventListener(\'error\', function (e) {\n'
          '      var t = e.target;\n'
          '      if (!t || !t.classList || !t.classList.contains(\'epk291-film-thumb-img\')) return;\n'
          '      var w = t.parentNode;\n'
          '      if (w && w.classList && w.classList.contains(\'epk291-film-thumb\')) w.hidden = true;\n'
          '    }, true);\n'
          '    window.__epk292QA = {\n'
          '      total: function () { return film.querySelectorAll(\'.epk291-film-thumb\').length; },\n'
          '      hidden: function () { return film.querySelectorAll(\'.epk291-film-thumb[hidden]\').length; },\n'
          '      imgs: function () { return film.querySelectorAll(\'.epk291-film-thumb-img\').length; }\n'
          '    };\n'
          '  }\n\n'
          '  applyPaper(0);\n  startTimer();\n')
    ej = ej.replace(A3, E3, 1)

    # ── পোস্ট-অ্যাসার্ট (ejs) ──
    if MARK not in ej: die('ejs পোস্ট-অ্যাসার্ট: মার্কার-অনুপস্থিত')
    for s in ['epk291-film-thumb', 'epk291-film-thumb-img', '__epk292QA', "addEventListener('error'"]:
        if s not in ej: die('ejs পোস্ট-অ্যাসার্ট-অনুপস্থিত: ' + s)
    # epk291-বডি-অক্ষুণ্ণ-প্রমাণ
    for s in ["if (window.__epk291wired) return;", 'function applyPaper(i) {', 'function startTimer() {', 'teImgAttrs291', "img.addEventListener('error'"]:
        if s not in ej: die('ejs epk291-বডি-অক্ষুণ্ণ-ভঙ্গ: ' + s)
    wr(EJS, ej)
    print('ok: today.ejs প্যাচড (থাম্ব-স্প্যান + error-লিসনার + __epk292QA)')

# ══ style.css ══
cs = rd(CSS)
if MARK in cs:
    print('PATCH-SKIP(css): মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)

A4 = '/* ═══════════ EOF সেশন ২৯১ (epk291 কিয়স্ক) ═══════════ */\n'
if cs.count(A4) != 1:
    die('css A4-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % cs.count(A4))

BLOCK = '''/* ═══ সেশন ২৯২ (session292): ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ — হেক্স-শূন্য টোকেন-শুধু ═══
   একই epaperThumbByName291 নাম-মিল-সোর্স (ভুল-পত্রিকার-ছবি-অসম্ভব); লোড-ব্যর্থতায় JS
   থাম্ব-স্প্যান লুকায় (টেক্সট-অনলি-ফলব্যাক); aria-hidden — নাম-টেক্সট-ই-SR-যথেষ্ট। */
.epk291-film-btn { gap: 3px; }
.epk291-film-thumb {
  width: 30px;
  height: 40px;
  flex: none;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--lf-ui-border);
  border-radius: var(--radius-sm, 5px);
  background: var(--lf-amber-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: border-color .18s ease, box-shadow .18s ease;
}
.epk291-film-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.epk291-film-btn[aria-selected="true"] .epk291-film-thumb {
  border-color: var(--epkAcc291, var(--lf-brand-primary));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}
@media (max-width: 480px) {
  .epk291-film-thumb { width: 26px; height: 34px; }
}
@media (prefers-reduced-motion: reduce) {
  .epk291-film-thumb { transition: none; }
}
/* ═══════════ EOF সেশন ২৯২ (session292 ফিল্ম-থাম্ব) ═══════════ */
'''
E4 = BLOCK + A4
cs = cs.replace(A4, E4, 1)

# ── পোস্ট-অ্যাসার্ট (css): ব্লক-নিষ্কাশন + হেক্স-শূন্য + s291-অক্ষুণ্ণ ──
if MARK not in cs: die('css পোস্ট-অ্যাসার্ট: মার্কার-অনুপস্থিত')
B = cs.split('/* ═══ সেশন ২৯২ (session292)', 1)[1].split('EOF সেশন ২৯২', 1)[0] if '/* ═══ সেশন ২৯২ (session292)' in cs else ''
if not B: die('css ব্লক-নিষ্কাশন-ব্যর্থ')
import re
HEXN = len(re.findall(r'#[0-9a-fA-F]{3,8}', B))
if HEXN != 0: die('css ep292-ব্লকে হেক্স-%d (শূন্য-প্রত্যাশিত)' % HEXN)
for s in ['.epk291-film-thumb', '.epk291-film-thumb-img', '--lf-ui-border', '--lf-amber-soft', '--epkAcc291', 'prefers-reduced-motion', 'max-width: 480px']:
    if s not in B: die('css পোস্ট-অ্যাসার্ট-অনুপস্থিত: ' + s)
# s291-অক্ষুণ্ণ
for s in ['.epk291-film-btn[aria-selected="true"]::after', '.epk291-live {', 'EOF সেশন ২৯১ (epk291 কিয়স্ক)']:
    if s not in cs: die('css s291-অক্ষুণ্ণ-ভঙ্গ: ' + s)
wr(CSS, cs)
print('ok: style.css ep292-ব্লক সন্নিবেশিত (হেক্স-শূন্য)')
print('PATCH-OK')
