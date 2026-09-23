#!/usr/bin/env python3
# s291-patch.py — session291: LOWMEM-রেল-থাম্ব-আগাম-ক্যাপ + অলস-IO-পথ (ep291)
# চুক্তি: মার্কার-গার্ড সর্বদা অ্যাঙ্কর-অ্যাসার্টের-আগে (s290-গোটচা) + idempotent ×N
#         + অ্যাঙ্কর-নিলীন-বিশ্লেষণ (সব-অ্যাঙ্কর append-স্টাইল — রিপ্লেসমেন্টে-সংরক্ষিত)
#         + পোস্ট-অ্যাসার্ট (নতুন-মার্কার + s281-স্ট্রিং-অক্ষুণ্ণ + CSS হেক্স-শূন্য)
# eager-বডি-অস্পৃশ্য-রীতি: ক্যাপ-গেট + অলস-পথ র‍্যাপার-স্তরে (s281-রেন্ডার-লজিক অপরিবর্তিত)
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
EJS = APP + '/views/user/epaper.ejs'
CSS = APP + '/public/assets/css/epaper.css'
MARK = 'session291'

def die(m):
    print('PATCH-FAIL: ' + m)
    sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

ej = rd(EJS)
if MARK in ej:
    print('PATCH-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)

# ── অ্যাঙ্কর-অ্যাসার্ট (গার্ড-পরে — s290-ক্রম-সংশোধন) ──
A1 = '  var ep281Stored = 0, ep281Restored = 0; // session281: ক্যাশ-QA-কাউন্টার (stored=নতুন-রেন্ডার-সংরক্ষণ, restored=dataURL-পুনঃদর্শন)\n'
A2 = '        ep281Restored++;\n        step();\n        return;\n      }\n'
A3 = '  function syncRail(cur) {'
A4 = '    cacheArmed: function () { var a = (reader && reader.fid) ? alive.get(reader.fid) : null; return !!(a && a.railThumbs); }\n  };\n'
for name, a in [('A1', A1), ('A2', A2), ('A3', A3), ('A4', A4)]:
    if ej.count(a) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, ej.count(a)))

# ── এডিট-১: ক্যাপ-স্টেট-ঘোষণা (ep281-কাউন্টারের-পরে) ──
E1 = A1 + '''  /* session291: LOWMEM-আগাম-ক্যাপ — eager-রেন্ডার প্রথম RAIL_PRE_MAX-পাতা পর্যন্ত; বাকি IO-অলস-পথে
     (0 = ক্যাপ-শূন্য — সব-আগাম-রেন্ডার; LOWMEM-ডিভাইসে ৬ — খোলায় CPU/মেমরি-চাপ-সীমিত;
     স্ক্রলে-দৃশ্যমান-হলে তবু-রেন্ডার; ক্যাশ-হিট-পথ ক্যাপের-উপরে তাৎক্ষণিক) */
  var RAIL_PRE_MAX = LOWMEM ? 6 : 0;
  var ep291Lazy = 0, ep291IO = null;
'''
ej = ej.replace(A1, E1, 1)

# ── এডিট-২: ক্যাপ-গেট (eager-স্টেপে ক্যাশ-হিট-ব্লকের-পরে — হিট-পথ ক্যাপের-উপরে) ──
E2 = A2 + '''      // session291: আগাম-ক্যাপ-গেট — RAIL_PRE_MAX-পার হলে eager-লুপ অলস-কিউতে-হস্তান্তর করে পরের-ইনডেক্সে
      if (RAIL_PRE_MAX > 0 && n > RAIL_PRE_MAX) { ep291Queue(items[n - 1], n, st, cache, tok); return step(); }
'''
ej = ej.replace(A2, E2, 1)

# ── এডিট-৩: অলস-পথ (painter + queue — syncRail-এর-আগে) ──
B3 = '''  /* session291: অলস-রেল-পথ — ক্যাপ-পরবর্তী-থাম্ব দৃশ্যমান-হলে (IntersectionObserver) রেন্ডার;
     ক্যাশ-হিট-তাৎক্ষণিক, রেন্ডার-টোকেন-গার্ড-যুক্ত (সুইচে-বাতিল); eager-বডি-অস্পৃশ্য-রীতি */
  function ep291Paint(item, n, st, cache, tok) {
    var host = item ? item.querySelector('.ep-rail-thumb') : null;
    if (!host || tok !== railTok) return;
    var cached = cache ? cache[n] : null;
    if (cached) {
      host.classList.remove('is-pending');
      host.innerHTML = '<img alt="" draggable="false" src="' + cached + '" />';
      ep281Restored++;
      return;
    }
    st.doc.getPage(n).then(function (page) {
      if (tok !== railTok) return;
      var base = page.getViewport({ scale: 1 });
      var vp = page.getViewport({ scale: Math.min(176 / base.width, 2.5) });
      var cv = document.createElement('canvas');
      cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
      host.classList.remove('is-pending');
      host.innerHTML = '';
      host.appendChild(cv);
      return page.render({ canvasContext: cv.getContext('2d', { alpha: false }), viewport: vp, background: '#ffffff' }).promise.then(function () {
        if (cache && tok === railTok) { try { cache[n] = cv.toDataURL('image/jpeg', 0.72); ep281Stored++; } catch (e) {} }
      });
    }).then(function () { ep291Lazy++; }).catch(function () { ep291Lazy++; });
  }
  function ep291Queue(item, n, st, cache, tok) {
    if (!item || tok !== railTok) return;
    item.classList.add('is-lazy');
    if (!('IntersectionObserver' in window)) { ep291Paint(item, n, st, cache, tok); return; }
    if (!ep291IO) {
      ep291IO = new IntersectionObserver(function (ents) {
        for (var i = 0; i < ents.length; i++) {
          if (!ents[i].isIntersecting) continue;
          var d = ents[i].target.__ep291;
          if (!d) continue;
          ep291IO.unobserve(ents[i].target);
          ep291Paint(ents[i].target, d.n, d.st, d.cache, d.tok);
        }
      }, { root: elRail, rootMargin: '80px' });
    }
    item.__ep291 = { n: n, st: st, cache: cache, tok: tok };
    try { ep291IO.observe(item); } catch (e) {}
  }
'''
ej = ej.replace(A3, B3 + A3, 1)

# ── এডিট-৪: QA-হুক (__ep281QA-র-পরে) ──
E4 = A4 + '''
  /* session291 QA-হুক (__ep291QA — আগাম-ক্যাপ + অলস-পথ-প্রমাণ; setPreMax-দ্বিতীয়-আর্গ = ক্যাশ-বিসর্জন) */
  window.__ep291QA = {
    preMax: function () { return RAIL_PRE_MAX; },
    setPreMax: function (n, reset) {
      RAIL_PRE_MAX = Math.max(0, Math.floor(Number(n) || 0));
      var a = (reader && reader.fid) ? alive.get(reader.fid) : null;
      if (a && reset) delete a.railThumbs;
      if (a) railBuild(a.st, a.numPages);
      return RAIL_PRE_MAX;
    },
    lazy: function () { return ep291Lazy; },
    pending: function () { return elRail ? elRail.querySelectorAll('.ep-rail-thumb.is-pending').length : -1; }, // ep291-thumb-pending-fix (is-pending থাম্ব-স্প্যানে — item-এ নয়)
    canvases: function () { return elRail ? elRail.querySelectorAll('.ep-rail-thumb canvas').length : -1; },
    imgs: function () { return elRail ? elRail.querySelectorAll('.ep-rail-thumb img').length : -1; }
  };
'''
ej = ej.replace(A4, E4, 1)
wr(EJS, ej)

# ── CSS: ep291-ব্লক (EOF append — হেক্স-শূন্য, টোকেন-শুধু) ──
cj = rd(CSS)
if MARK not in cj:
    C1 = '''
/* ═══ session291 — LOWMEM-আগাম-ক্যাপ + অলস-রেল-থাম্ব (is-lazy — ক্যাপ-পরবর্তী-কিউ-অবস্থা)
   চুক্তি: হেক্স-শূন্য (টোকেন-শুধু) + reduced-motion-সম্মান + eager-থাম্ব-স্টাইল-অস্পৃশ্য ═══ */
.ep-rail-item.is-lazy .ep-rail-thumb.is-pending { border-style: dashed; }
.ep-rail-item.is-lazy .ep-rail-thumb.is-pending::after { animation-duration: 2.2s; opacity: .55; }
@media (prefers-reduced-motion: reduce) {
  .ep-rail-item.is-lazy .ep-rail-thumb.is-pending::after { animation: none; }
}
'''
    with open(CSS, 'a', encoding='utf-8') as f:
        f.write(C1)
    cj = rd(CSS)

# ── পোস্ট-অ্যাসার্ট ──
ej = rd(EJS)
for m in ['RAIL_PRE_MAX', 'ep291Queue', 'ep291Paint', 'window.__ep291QA', 'is-lazy', "rootMargin: '80px'"]:
    if m not in ej:
        die('পোস্ট-অ্যাসার্ট-ব্যর্থ: ' + m)
# s281-স্ট্রিং-অক্ষুণ্ণ (সুইট-গ্রেপ-চুক্তি)
S281 = [
    'aentry.railThumbs || (aentry.railThumbs = [])',
    'var cache = (aentry && numPages >= 2) ? (aentry.railThumbs || (aentry.railThumbs = [])) : null;',
    "toDataURL('image/jpeg', 0.72)",
    'if (cache && tok === railTok) { try { cache[n] = cv.toDataURL',
    "host.innerHTML = '<img alt=\"\" draggable=\"false\" src=\"' + cached + '\" />';",
    'window.__ep281QA',
    'cacheArmed: function',
]
for s in S281:
    if s not in ej:
        die('s281-স্ট্রিং-ভাঙা: ' + s[:50])
# CSS হেক্স-শূন্য (ep291-ব্লক)
i = cj.find(MARK)
if i < 0:
    die('CSS-মার্কার-অনুপস্থিত')
B291 = cj[i:]
HEXN = len(__import__('re').findall(r'#[0-9a-fA-F]{3,8}', B291))
if HEXN != 0:
    die('ep291-CSS-ব্লকে হেক্স=%d (০-প্রত্যাশিত)' % HEXN)
if 'prefers-reduced-motion' not in B291:
    die('reduced-motion-গার্ড-অনুপস্থিত')

print('PATCH-OK: ep291 (আগাম-ক্যাপ + অলস-IO-পথ) — ejs ৪-এডিট + css ১-ব্লক; সব-অ্যাসার্ট-গ্রিন')
