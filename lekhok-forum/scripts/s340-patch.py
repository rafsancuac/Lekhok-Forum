#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s340-patch.py — session340: hr340 getHints মোড-সচেতন + sfs340 রেজলভড-রপ্তাই-বাটন-স্টাইল
[Task ID 177] PLANS session339-নোটের প্রস্তাব-②-প্রথম-বিকল্প (hr338-চুক্তি-প্রসারিত)।
Idempotent ×২ (marker-guard-প্রথম); অ্যাঙ্কর-এককতা-FATAL; ইউনিক-লাইন-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য।
"""
import sys, io, re

PATH = "admin/views/admin/home-reorder.ejs"

JS_MARK = "__hrAria340QA"  # JS-উপস্থিতি = ASCII-হুক-নাম (s339-রীতি — JS-হেডার বাংলা-সংখ্যায়)
CSS_MARK = "session340 (sfs340"

JS_BLOCK = """
  /* সেশন ৩৪০ (hr340): রেজিস্ট্রি-হিন্ট-রিড-API-মোড-সচেতন getHints(true) + রেজলভড-রপ্তাই-বাটন (PLANS session339-নোটের প্রস্তাব-②-প্রথম-বিকল্প — hr338-চুক্তি-প্রসারিত)
     • getHints-মোড-সচেতন (getHintsOrig340-চেইন-রীতি — hr338-চুক্তি-প্রসারিত): q333h.getHints() মিথ্যা-মোড়ানো =
       RAW-মানচিত্র (অপরিবর্তিত — s338-রাউন্ড-ট্রিপ-চুক্তি-অটুট); q333h.getHints(true) = রেজলভড-মানচিত্র (প্রতি-কী
       hintOf334-কল-টাইম-{fmt}-রেজলিউশন — এক-উৎস — প্রদর্শন-প্রস্তুত); রেজলভড-মানচিত্র = পাঠ-কেবল-স্ন্যাপশট
       (setHints-ইনপুট-বিন্যাস-নয় — {fmt}-কী-তে getHints(true)→setHints-রাউন্ড-ট্রিপ-নিষিদ্ধ — ডক-কৃত-অর্থবিদ্যা);
       প্রতি-কলে-নতুন-অবজেক্ট (লাইভ-রেফারেন্স-প্রকাশ-নিষিদ্ধ — hr338-উত্তরাধিকার); রিড-পবিত্রতা = রেজিস্ট্রি/লাইন/
       স্টোরেজ/DOM-মিউটেশন-শূন্য (শ্রেণি-অস্পৃশ্য — hr338-রিড-API-চুক্তি-উত্তরাধিকার)।
     • রেজলভড-রপ্তাই-বাটন .hr340-resbtn (স্বতন্ত্র-শ্রেণি — s326-.hr326-fmt-রীতি — .hr324-btn-গণনা-চুক্তি-অটুট —
       querySelectorAll('.hr324-btn')=২-অটুট): স্বতন্ত্র-বার .hr324-bar.hr340-bar (hr339-বার-রীতি — hr339-বার-
       শূন্য-পরীক্ষা-অবরোধ-শূন্য — নিজস্ব-বার-সর্বদা); নির্মাণ = trOrig340-চেইন (tipRender318-মোড়ক-চেইন-পরবর্তী —
       hr339-পরে); গেট = বার-পরিবার-দৃশ্যমানতা (hist317.length ≥১ ∨ storeN339() ≥১ — শূন্য-অবস্থায় নীরব —
       hr324-দর্শন — fresh-DOM-অপরিবর্তিত-প্রমাণ); ডুপ-রক্ষা + পরিবার-শূন্যে-নিজস্ব-বার-সিঙ্ক-অপসারণ (ensureRes340
       এক-উৎস — নির্মাণ+সিঙ্ক-দ্বৈত — cf332/cf333-রীতি: trOrig340-চেইন + persist337-মোড়ক + q337h.clearStore-মোড়ক —
       ত্রি-মোড়ক-জীবন্ত-সিঙ্ক — hr339-উত্তরাধিকার); রি-রেন্ডার-বিহীন-উপস্থিতি/অপসারণ (৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট — MO=৪)।
     • কপি-পথ = copyHist324-রীতি (রেকর্ড-বিহীন রপ্তাই — copyAria316-বর্জন-ইচ্ছাকৃত — s324-গোটচা-উত্তরাধিকার:
       ইতিহাস-গণনা-দূষণ-শূন্য): navigator.clipboard.writeText-সরাসরি + fallbackCopy316-ফলব্যাক + টোস্ট ('রেজলভড
       হিন্ট-মানচিত্র কপি হয়েছে (N-কী — বিন্যাস: X)' — fmtLabel331-কল-টাইম-মোড-সম্মত) + .hr340-done-ফ্ল্যাশ (১.২s —
       hr324-রীতি); কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339-সতর্ক-নকশা-উত্তরাধিকার — register-
       নথিভুক্তি-শূন্য — ওভারলে-৮-সারি-স্থায়িত্ব — hr333-চুক্তি-সামঞ্জস্য)।
     • চুক্তি: ovRows330/registry/kbd-লাইন/storage-অস্পৃশ্য; hr338-diff/hr337-restored/hr336-batched/hr339-শ্রেণি-
       অস্পৃশ্য (একক-দায়িত্ব); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; QA-হুক-প্রতিনিধি-বাইপাস-উত্তরাধিকার-অটুট।
     • QA-হুক __hrAria340QA {getr, raws, copies, last, raw(), resolved(), resbtn(), bar(), err} — সারি-শূন্যে-ও-
       সংজ্ঞায়িত; s339/s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q340h = { getr: 0, raws: 0, copies: 0, last: '', err: '' };
  var getHintsOrig340 = q333h.getHints; /* hr338-চেইন-উপরে-hr340-চেইন — RAW-পথ-অক্ষুণ্ণ */
  q333h.getHints = function (m340q) {
    try {
      if (!m340q) { q340h.raws += 1; return getHintsOrig340(); } /* RAW — অপরিবর্তিত (s338-চুক্তি) */
      var m340 = getHintsOrig340();
      var r340 = {};
      for (var c340 in m340) {
        if (!Object.prototype.hasOwnProperty.call(m340, c340)) continue;
        r340[c340] = hintOf334(c340); /* এক-উৎস-কল-টাইম-{fmt}-রেজলিউশন (mode326-সচেতন) */
      }
      var n340 = 0;
      for (var c340n in r340) { if (Object.prototype.hasOwnProperty.call(r340, c340n)) n340 += 1; }
      q340h.getr += 1; q340h.last = 'getr:' + n340;
      return r340;
    } catch (e340g) { q340h.err = String((e340g && e340g.message) || e340g); return {}; }
  };
  var resBtn340 = function () { return tip317 ? tip317.querySelector('.hr340-resbtn') : null; };
  var ensureRes340 = function () {
    try {
      if (!tip317) return;
      var fam340 = (hist317.length >= 1) || (storeN339() >= 1); /* বার-পরিবার-দৃশ্যমানতা (hr324-দর্শন) */
      var b340 = resBtn340();
      if (!fam340) {
        if (b340) {
          var bar340r = b340.parentNode; /* সর্বদা-নিজস্ব-বার (.hr340-bar) — সম্পূর্ণ-বার-অপসারণ */
          if (bar340r && bar340r.parentNode) bar340r.parentNode.removeChild(bar340r);
          q340h.last = 'sync:off';
        }
        return;
      }
      if (b340) return; /* ডুপ-রক্ষা */
      var bar340 = document.createElement('span');
      bar340.className = 'hr324-bar hr340-bar'; /* hr324-পরিবার-সম্মত + স্বতন্ত্র-মার্কার (hr339-বার-রীতি) */
      var br340 = document.createElement('button');
      br340.type = 'button';
      br340.className = 'hr340-resbtn'; /* স্বতন্ত্র-শ্রেণি — .hr324-btn-গণনা-চুক্তি-অটুট */
      br340.setAttribute('aria-label', 'রেজলভড হিন্ট-মানচিত্র ক্লিপবোর্ডে রপ্তাই করুন (getHints(true) — {fmt}-কল-টাইম-রেজলভড)');
      var ii340 = document.createElement('i'); ii340.className = 'fas fa-code'; ii340.setAttribute('aria-hidden', 'true');
      var il340 = document.createElement('span'); il340.className = 'hr340-lbl'; il340.textContent = ' রেজলভড কপি';
      br340.appendChild(ii340); br340.appendChild(il340);
      br340.addEventListener('click', function (e340c) {
        e340c.preventDefault(); e340c.stopPropagation();
        try {
          var m340c = q333h.getHints(true);
          var n340c = 0;
          for (var c340c in m340c) { if (Object.prototype.hasOwnProperty.call(m340c, c340c)) n340c += 1; }
          var txt340 = JSON.stringify(m340c, null, 2);
          var ok340m = 'রেজলভড হিন্ট-মানচিত্র কপি হয়েছে (' + bn317a(n340c) + '-কী — বিন্যাস: ' + fmtLabel331(mode326) + ')';
          var done340 = function () {
            q340h.copies += 1; q340h.last = 'copy:' + n340c;
            showToast(true, ok340m);
            br340.classList.add('hr340-done');
            setTimeout(function () { br340.classList.remove('hr340-done'); }, 1200); /* hr324-ফ্ল্যাশ-রীতি */
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt340).then(done340, function () { fallbackCopy316(txt340) ? done340() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন'); });
          } else {
            fallbackCopy316(txt340) ? done340() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন');
          }
        } catch (e340cc) { q340h.err = String((e340cc && e340cc.message) || e340cc); }
      });
      bar340.appendChild(br340);
      tip317.appendChild(bar340);
      q340h.last = 'sync:on';
    } catch (e340e) { q340h.err = String((e340e && e340e.message) || e340e); }
  };
  var trOrig340 = tipRender318; /* hr339-চেইন-পরবর্তী — নির্মাণ-এক-উৎস */
  tipRender318 = function (k340t) {
    trOrig340(k340t);
    try { ensureRes340(); } catch (e340t) { q340h.err = String((e340t && e340t.message) || e340t); }
  };
  var persistOrig340 = persist337; /* regOrig334-চেইন-রীতি — প্রতি-সফল-স্থায়ীকরণ-পরবর্তী-জীবন্ত-সিঙ্ক */
  persist337 = function () {
    var r340p = persistOrig340();
    try { ensureRes340(); } catch (e340p) { q340h.err = String((e340p && e340p.message) || e340p); }
    return r340p;
  };
  var clearOrig340 = q337h.clearStore; /* hr337-চুক্তি-প্রসারিত — সর্ব-ক্লিয়ার-পথে-জীবন্ত-সিঙ্ক */
  q337h.clearStore = function () {
    var ok340c = clearOrig340();
    try { ensureRes340(); } catch (e340c) { q340h.err = String((e340c && e340c.message) || e340c); }
    return ok340c;
  };
  q340h.raw = function () { return getHintsOrig340(); };
  q340h.resolved = function () { return q333h.getHints(true); };
  q340h.resbtn = function () { return !!resBtn340(); };
  q340h.bar = function () { return !!(tip317 && tip317.querySelector('.hr340-bar')); };
  window.__hrAria340QA = q340h;
"""

CSS_BLOCK = """
    /* ═══════ session340 (sfs340 রেজলভড-রপ্তাই-বাটন — admin-ইনলাইন) ═══════ */
    /* সেশন ৩৪০ (sfs340): রেজলভড-রপ্তাই-বাটন (hr324-বার-পরিবার — স্বতন্ত্র-শ্রেণি .hr340-resbtn —
       s326-.hr326-fmt-রীতি — .hr324-btn-গণনা-চুক্তি-অটুট; নীল-পরিবার = রিড/ইনস্পেক্ট-টোন (সবুজ-সম্পাদনা/
       লাল-ধ্বংসাত্মক-পরিবার-বিভাজন-সম্মত); dashed-বর্ডার = বিন্যাস-নির্বাচক-রীতি-উত্তরাধিকার; নতুন-উপাদান-
       স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য; সর্ব-ব্যান্ড (media-query-শূন্য — মোবাইল-সংকোচন-ব্যতিক্রম);
       rgba-only — হেক্স-শূন্য; transition-কেবল-বেস-বাটন-রীতি; MO=৪-অটুট) */
    .hr340-resbtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font: inherit; font-size: 0.55rem; padding: 2px 7px; border-radius: 4px; border: 1px dashed rgba(29, 78, 216, 0.45); background: rgba(29, 78, 216, 0.08); color: rgba(30, 64, 175, 0.95); cursor: pointer; transition: none; user-select: none; }
    .hr340-resbtn:hover { background: rgba(29, 78, 216, 0.16); border-color: rgba(29, 78, 216, 0.6); }
    .hr340-resbtn:focus-visible { outline: 2px solid rgba(37, 99, 235, 0.75); outline-offset: 1px; }
    .hr340-resbtn:active { transform: scale(0.97); }
    .hr340-resbtn.hr340-done { background: rgba(37, 99, 235, 0.2); border-color: rgba(37, 99, 235, 0.85); color: rgba(30, 58, 138, 1); }
    @media (prefers-reduced-motion: reduce) { .hr340-resbtn:active { transform: none; } }
    @media (max-width: 640px) { .hr340-resbtn { font-size: 0.52rem; padding: 2px 6px; } }
    /* ═══════ EOF session340 (sfs340 রেজলভড-রপ্তাই-বাটন — admin-ইনলাইন) ═══════ */
"""

JS_ANCHOR = "  window.__hrAria339QA = q339h;\n})();"
CSS_ANCHOR = "    /* ═══════ EOF session339 (sfs339 স্থায়ী-ক্লিয়ার-বাটন — admin-ইনলাইন) ═══════ */\n"

def fatal(msg):
    print("FATAL: " + msg); sys.exit(1)

def main():
    try:
        with io.open(PATH, "r", encoding="utf-8") as f:
            src = f.read()
    except OSError as e:
        fatal("পাঠ-ব্যর্থ: %s" % e)

    js_has = JS_MARK in src
    css_has = CSS_MARK in src
    print("guard: js_has=%s css_has=%s" % (js_has, css_has))
    if js_has and css_has:
        print("SKIP: session340-ব্লক-উভয়ে-বিদ্যমান (idempotent-রান-২)")
        verify(src)
        return
    if js_has != css_has:
        fatal("অর্ধেক-প্রয়োগ-অবস্থা (js=%s css=%s) — ম্যানুয়াল-যাচাই-প্রয়োজন" % (js_has, css_has))

    if src.count(JS_ANCHOR) != 1:
        fatal("JS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(JS_ANCHOR))
    if src.count(CSS_ANCHOR) != 1:
        fatal("CSS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(CSS_ANCHOR))

    out = src.replace(JS_ANCHOR, "  window.__hrAria339QA = q339h;\n" + JS_BLOCK + "})();", 1)
    out = out.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_BLOCK, 1)

    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(out)
    print("PATCH ✓ (session340 JS+CSS সন্নিবেশিত)")
    verify(out)

def verify(src):
    # ইউনিক-লাইন-পোস্ট-অ্যাসার্ট
    uniq = [
        "var q340h = { getr: 0, raws: 0, copies: 0, last: '', err: '' };",
        "var getHintsOrig340 = q333h.getHints;",
        "var trOrig340 = tipRender318;",
        "var persistOrig340 = persist337;",
        "var clearOrig340 = q337h.clearStore;",
        "window.__hrAria340QA = q340h;",
        ".hr340-resbtn { flex: 0 0 auto;",
        "EOF session340",
    ]
    for u in uniq:
        c = src.count(u)
        if c != 1:
            fatal("পোস্ট-অ্যাসার্ট-ব্যর্থ (count=%d): %s" % (c, u[:60]))
    # মার্কার-গণনা (CSS-ব্লক হেডার+EOF = কমপক্ষে-২)
    n_css = src.count("session340 (sfs340")
    if n_css < 2:
        fatal("CSS-মার্কার-গণনা-ব্যর্থ (n=%d)" % n_css)
    # হেক্স-শূন্য (session340-ব্লক)
    m = re.search(r"/\* সেশন ৩৪০ \(sfs340.*?EOF session340", src, re.S)
    if not m:
        fatal("CSS-ব্লক-নিষ্কাশন-ব্যর্থ")
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", m.group(0))
    if hexes:
        fatal("হেক্স-লব্ধ (rgba-only-চুক্তি): %s" % hexes[:5])
    # ক্যাসকেড-অবস্থান (EOF340 > EOF339)
    e339 = src.find("EOF session339")
    e340 = src.find("EOF session340")
    if not (e339 >= 0 and e340 > e339):
        fatal("ক্যাসকেড-অবস্থান-ব্যর্থ")
    print("VERIFY ✓ (ইউনিক-লাইন ×৮ + মার্কার ×২ + হেক্স-শূন্য + ক্যাসকেড-অবস্থান)")

if __name__ == "__main__":
    main()
