#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s341-patch.py — session341: hr341 getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই + sfs341 স্টাইল
[Task ID 178] PLANS session340-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প (hr340-চুক্তি-প্রসারিত)।
Idempotent ×২ (marker-guard-প্রথম); অ্যাঙ্কর-এককতা-FATAL; ইউনিক-লাইন-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য।
"""
import sys, io, re

PATH = "admin/views/admin/home-reorder.ejs"

JS_MARK = "__hrAria341QA"  # JS-উপস্থিতি = ASCII-হুক-নাম (s340-রীতি)
CSS_MARK = "session341 (sfs341"

JS_BLOCK = """
  /* সেশন ৩৪১ (hr341): getHints-মোড-সচেতন-সম্প্রসারণ getHints(mode-string) + মোড-নির্বাচক-রপ্তাই (PLANS session340-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প — hr340-চুক্তি-প্রসারিত)
     • getHints(mode-string) (getHintsOrig341-চেইন-রীতি — hr340-চুক্তি-প্রসারিত): q333h.getHints('rich'|'key'|'json')
       = নির্দিষ্ট-মোডে-রেজলভড-মানচিত্র (RAW-স্ন্যাপশট-উপরে {fmt}→fmtLabel331(modeStr)-কল-টাইম-প্রতিস্থাপন — mode326-
       অস্পৃশ্য — রিড-পবিত্রতা); getHints() মিথ্যা-মোড়ানো = RAW (অপরিবর্তিত — s338-অটুট); getHints(true) =
       বর্তমান-মোডে-রেজলভড (অপরিবর্তিত — hr340-অটুট); অবৈধ-স্ট্রিং-মোড = RAW-ফেরত + getm:invalid-মার্কার
       (diffHints/setHints-অবৈধ-ইনপুট-রীতি — শূন্য-অনুমান); প্রতি-কলে-নতুন-অবজেক্ট (hr338-উত্তরাধিকার);
       রেজলভড-মানচিত্র = পাঠ-কেবল-স্ন্যাপশট (setHints-ইনপুট-নয় — hr340-ডক-কৃত-অর্থবিদ্যা-উত্তরাধিকার)।
     • মোড-নির্বাচক-রপ্তাই .hr341-msel + .hr341-mbtn (স্বতন্ত্র-শ্রেণি-জুটি — s326-.hr326-fmt-রীতি —
       .hr324-btn-গণনা-চুক্তি-অটুট): স্বতন্ত্র-বার .hr324-bar.hr341-bar (hr340-বার-রীতি — hr339/hr340-বারে-
       সংযোজন-নিষিদ্ধ-উত্তরাধিকার); নির্মাণ = trOrig341-চেইন (hr340-পরে); গেট = বার-পরিবার-দৃশ্যমানতা
       (hist317.length ≥১ ∨ storeN339() ≥১ — শূন্য-অবস্থায় নীরব — hr324-দর্শন); ডুপ-রক্ষা + পরিবার-শূন্যে-
       নিজস্ব-বার-সিঙ্ক-অপসারণ (ensureMsel341 এক-উৎস — চতুর্মোড়ক-জীবন্ত-সিঙ্ক: trOrig341-চেইন + persist337-মোড়ক +
       q337h.clearStore-মোড়ক + cycleFmt326-মোড়ক (fmtOrig341-চেইন — মোড-বদলে-নির্বাচক-ডিফল্ট-রি-সেট — cf332-রীতি) —
       regOrig334-চেইন-রীতি — রি-রেন্ডার-বিহীন — ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪); নির্বাচক-অপশন = fmtLabel331-লেবেল
       (সমৃদ্ধ/কেবল-কী/JSON — নির্মাণ-কালে বর্তমান-মোড-ডিফল্ট); বাটন-কপি = q333h.getHints(নির্বাচিত-মোড) →
       JSON.stringify(…, null, 2) — রেকর্ড-বিহীন (copyHist324-রীতি — copyAria316-বর্জন-ইচ্ছাকৃত — ইতিহাস-গণনা-
       দূষণ-শূন্য) + টোস্ট ('মোড-নির্দিষ্ট হিন্ট-মানচিত্র কপি হয়েছে (N-কী — বিন্যাস: X)') + .hr341-done-ফ্ল্যাশ (১.২s);
       কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339/hr340-উত্তরাধিকার — ওভারলে-৮-সারি-স্থায়িত্ব)।
     • চুক্তি: ovRows330/registry/kbd-লাইন/storage-অস্পৃশ্য; hr338-diff/hr337-restored/hr336-batched/hr339-/
       hr340-শ্রেণি-বার-অস্পৃশ্য (একক-দায়িত্ব); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; QA-হুক-প্রতিনিধি-বাইপাস-উত্তরাধিকার-অটুট।
     • QA-হুক __hrAria341QA {getm, invalids, copies, last, msel(), mbtn(), bar(), modeResolved(m), err} —
       সারি-শূন্যে-ও-সংজ্ঞায়িত; s340/s339/s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q341h = { getm: 0, invalids: 0, copies: 0, last: '', err: '' };
  var getHintsOrig341 = q333h.getHints; /* hr340-চেইন-উপরে-hr341-চেইন — RAW/বর্তমান-মোড-পথ-অক্ষুণ্ণ */
  var MODES341 = ['rich', 'key', 'json']; /* mode326-ত্রি-মোড-রেজিস্ট্রি-মিরর (hr326/hr331-চুক্তি) */
  q333h.getHints = function (m341q) {
    try {
      if (typeof m341q === 'string') {
        var is341 = false;
        for (var i341 = 0; i341 < MODES341.length; i341++) { if (MODES341[i341] === m341q) { is341 = true; break; } }
        if (!is341) { q341h.invalids += 1; q341h.last = 'getm:invalid'; return getHintsOrig341(); /* অবৈধ-মোড = RAW (শূন্য-অনুমান — রেজলিউশন-বর্জন) */ }
        var m341a = getHintsOrig341(); /* RAW-স্ন্যাপশট (hr338-চেইন — প্রতি-কলে-নতুন-কপি) */
        var r341 = {};
        for (var c341 in m341a) {
          if (!Object.prototype.hasOwnProperty.call(m341a, c341)) continue;
          var v341 = String(m341a[c341]);
          if (v341.indexOf('{fmt}') >= 0) v341 = v341.split('{fmt}').join(fmtLabel331(m341q)); /* মোড-নির্দিষ্ট-কল-টাইম-রেজলিউশন (mode326-অস্পৃশ্য) */
          r341[c341] = v341;
        }
        q341h.getm += 1; q341h.last = 'getm:' + m341q;
        return r341;
      }
      return getHintsOrig341(m341q); /* hr340-চুক্তি-অটুট (মিথ্যা=RAW / সত্য=বর্তমান-মোডে-রেজলভড) */
    } catch (e341g) { q341h.err = String((e341g && e341g.message) || e341g); return {}; }
  };
  var msel341 = function () { return tip317 ? tip317.querySelector('.hr341-msel') : null; };
  var mbtn341 = function () { return tip317 ? tip317.querySelector('.hr341-mbtn') : null; };
  var ensureMsel341 = function () {
    try {
      if (!tip317) return;
      var fam341 = (hist317.length >= 1) || (storeN339() >= 1); /* বার-পরিবার-দৃশ্যমানতা (hr324-দর্শন) */
      var s341 = msel341();
      if (!fam341) {
        if (s341) {
          var bar341r = s341.parentNode; /* সর্বদা-নিজস্ব-বার (.hr341-bar) — সম্পূর্ণ-বার-অপসারণ */
          if (bar341r && bar341r.parentNode) bar341r.parentNode.removeChild(bar341r);
          q341h.last = 'sync:off';
        }
        return;
      }
      if (s341) return; /* ডুপ-রক্ষা */
      var bar341 = document.createElement('span');
      bar341.className = 'hr324-bar hr341-bar'; /* hr324-পরিবার-সম্মত + স্বতন্ত্র-মার্কার (hr340-বার-রীতি) */
      var sel341 = document.createElement('select');
      sel341.className = 'hr341-msel';
      sel341.setAttribute('aria-label', 'রেজলভড-রপ্তাই-মোড নির্বাচন (getHints(মোড) — নির্দিষ্ট-বিন্যাসে {fmt}-রেজলিউশন)');
      for (var j341 = 0; j341 < MODES341.length; j341++) {
        var o341 = document.createElement('option');
        o341.value = MODES341[j341];
        o341.textContent = fmtLabel331(MODES341[j341]);
        if (MODES341[j341] === mode326) o341.selected = true; /* নির্মাণ-কালে-বর্তমান-মোড-ডিফল্ট */
        sel341.appendChild(o341);
      }
      var bb341 = document.createElement('button');
      bb341.type = 'button';
      bb341.className = 'hr341-mbtn'; /* স্বতন্ত্র-শ্রেণি — .hr324-btn-গণনা-চুক্তি-অটুট */
      bb341.setAttribute('aria-label', 'নির্বাচিত মোডে রেজলভড হিন্ট-মানচিত্র ক্লিপবোর্ডে রপ্তাই করুন (getHints(মোড))');
      var mi341 = document.createElement('i'); mi341.className = 'fas fa-sliders-h'; mi341.setAttribute('aria-hidden', 'true');
      var ml341 = document.createElement('span'); ml341.className = 'hr341-lbl'; ml341.textContent = ' মোডে কপি';
      bb341.appendChild(mi341); bb341.appendChild(ml341);
      sel341.addEventListener('change', function () {
        bb341.setAttribute('aria-label', 'নির্বাচিত মোডে (' + fmtLabel331(sel341.value) + ') রেজলভড হিন্ট-মানচিত্র ক্লিপবোর্ডে রপ্তাই করুন');
      });
      bb341.addEventListener('click', function (e341c) {
        e341c.preventDefault(); e341c.stopPropagation();
        try {
          var sm341 = sel341.value;
          var m341c = q333h.getHints(sm341); /* hr341-চেইন — মোড-নির্দিষ্ট-রেজলভড */
          var n341c = 0;
          for (var c341c in m341c) { if (Object.prototype.hasOwnProperty.call(m341c, c341c)) n341c += 1; }
          var txt341 = JSON.stringify(m341c, null, 2);
          var ok341m = 'মোড-নির্দিষ্ট হিন্ট-মানচিত্র কপি হয়েছে (' + bn317a(n341c) + '-কী — বিন্যাস: ' + fmtLabel331(sm341) + ')';
          var done341 = function () {
            q341h.copies += 1; q341h.last = 'copy:' + sm341;
            showToast(true, ok341m);
            bb341.classList.add('hr341-done');
            setTimeout(function () { bb341.classList.remove('hr341-done'); }, 1200); /* hr324-ফ্ল্যাশ-রীতি */
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt341).then(done341, function () { fallbackCopy316(txt341) ? done341() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন'); });
          } else {
            fallbackCopy316(txt341) ? done341() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন');
          }
        } catch (e341cc) { q341h.err = String((e341cc && e341cc.message) || e341cc); }
      });
      bar341.appendChild(sel341);
      bar341.appendChild(bb341);
      tip317.appendChild(bar341);
      q341h.last = 'sync:on';
    } catch (e341e) { q341h.err = String((e341e && e341e.message) || e341e); }
  };
  var trOrig341 = tipRender318; /* hr340-চেইন-পরবর্তী — নির্মাণ-এক-উৎস */
  tipRender318 = function (k341t) {
    trOrig341(k341t);
    try { ensureMsel341(); } catch (e341t) { q341h.err = String((e341t && e341t.message) || e341t); }
  };
  var persistOrig341 = persist337; /* regOrig334-চেইন-রীতি — প্রতি-সফল-স্থায়ীকরণ-পরবর্তী-জীবন্ত-সিঙ্ক */
  persist337 = function () {
    var r341p = persistOrig341();
    try { ensureMsel341(); } catch (e341p) { q341h.err = String((e341p && e341p.message) || e341p); }
    return r341p;
  };
  var clearOrig341 = q337h.clearStore; /* hr337-চুক্তি-প্রসারিত — সর্ব-ক্লিয়ার-পথে-জীবন্ত-সিঙ্ক */
  q337h.clearStore = function () {
    var ok341c = clearOrig341();
    try { ensureMsel341(); } catch (e341c) { q341h.err = String((e341c && e341c.message) || e341c); }
    return ok341c;
  };
  var fmtOrig341 = cycleFmt326; /* cf332-রীতি — মোড-বদলে-নির্বাচক-ডিফল্ট-জীবন্ত-সিঙ্ক (চেইন-পরবর্তী-মোড়ক) */
  cycleFmt326 = function (b341f) {
    var r341f = fmtOrig341(b341f);
    try {
      var s341f = msel341();
      if (s341f) {
        for (var k341f = 0; k341f < s341f.options.length; k341f++) { if (s341f.options[k341f].value === mode326) { s341f.selectedIndex = k341f; break; } }
        q341h.last = 'fmt-sync:' + mode326;
      }
    } catch (e341f) { q341h.err = String((e341f && e341f.message) || e341f); }
    return r341f;
  };
  q341h.modeResolved = function (m341q2) { return q333h.getHints(m341q2); };
  q341h.msel = function () { return !!msel341(); };
  q341h.mbtn = function () { return !!mbtn341(); };
  q341h.bar = function () { return !!(tip317 && tip317.querySelector('.hr341-bar')); };
  window.__hrAria341QA = q341h;
"""

CSS_BLOCK = """
    /* ═══════ session341 (sfs341 মোড-নির্বাচক-রপ্তাই — admin-ইনলাইন) ═══════ */
    /* সেশন ৩৪১ (sfs341): মোড-নির্বাচক + মোডে-কপি-বাটন (hr324-বার-পরিবার — স্বতন্ত্র-শ্রেণি-জুটি
       .hr341-msel/.hr341-mbtn — s326-.hr326-fmt-রীতি; বেগুনি-পরিবার = মোড-নির্দিষ্ট-রপ্তাই-টোন (নীল-রিড/
       সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-পরিবার-বিভাজন-বৃদ্ধি — মোড-সচেতন-সংকেত); .hr341-mbtn dashed-বর্ডার =
       বিন্যাস-নির্বাচক-রীতি-উত্তরাধিকার; নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য; সর্ব-ব্যান্ড
       (মোবাইল-সংকোচন-ব্যতিক্রম); rgba-only — হেক্স-শূন্য; transition-শূন্য; MO=৪-অটুট) */
    .hr341-msel { flex: 0 0 auto; font: inherit; font-size: 0.55rem; padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(109, 40, 217, 0.45); background: rgba(109, 40, 217, 0.08); color: rgba(76, 29, 149, 0.95); cursor: pointer; transition: none; user-select: none; }
    .hr341-msel:hover { background: rgba(109, 40, 217, 0.14); border-color: rgba(109, 40, 217, 0.6); }
    .hr341-msel:focus-visible { outline: 2px solid rgba(139, 92, 246, 0.75); outline-offset: 1px; }
    .hr341-mbtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font: inherit; font-size: 0.55rem; padding: 2px 7px; border-radius: 4px; border: 1px dashed rgba(109, 40, 217, 0.45); background: rgba(109, 40, 217, 0.1); color: rgba(76, 29, 149, 0.95); cursor: pointer; transition: none; user-select: none; }
    .hr341-mbtn:hover { background: rgba(109, 40, 217, 0.18); border-color: rgba(109, 40, 217, 0.6); }
    .hr341-mbtn:focus-visible { outline: 2px solid rgba(139, 92, 246, 0.75); outline-offset: 1px; }
    .hr341-mbtn:active { transform: scale(0.97); }
    .hr341-mbtn.hr341-done { background: rgba(124, 58, 237, 0.2); border-color: rgba(124, 58, 237, 0.85); color: rgba(91, 33, 182, 1); }
    @media (prefers-reduced-motion: reduce) { .hr341-mbtn:active { transform: none; } }
    @media (max-width: 640px) { .hr341-msel { font-size: 0.52rem; padding: 2px 3px; } .hr341-mbtn { font-size: 0.52rem; padding: 2px 6px; } }
    /* ═══════ EOF session341 (sfs341 মোড-নির্বাচক-রপ্তাই — admin-ইনলাইন) ═══════ */
"""

JS_ANCHOR = "  window.__hrAria340QA = q340h;\n})();"
CSS_ANCHOR = "    /* ═══════ EOF session340 (sfs340 রেজলভড-রপ্তাই-বাটন — admin-ইনলাইন) ═══════ */\n"

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
        print("SKIP: session341-ব্লক-উভয়ে-বিদ্যমান (idempotent-রান-২)")
        verify(src)
        return
    if js_has != css_has:
        fatal("অর্ধেক-প্রয়োগ-অবস্থা (js=%s css=%s) — ম্যানুয়াল-যাচাই-প্রয়োজন" % (js_has, css_has))

    if src.count(JS_ANCHOR) != 1:
        fatal("JS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(JS_ANCHOR))
    if src.count(CSS_ANCHOR) != 1:
        fatal("CSS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(CSS_ANCHOR))

    out = src.replace(JS_ANCHOR, "  window.__hrAria340QA = q340h;\n" + JS_BLOCK + "})();", 1)
    out = out.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_BLOCK, 1)

    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(out)
    print("PATCH ✓ (session341 JS+CSS সন্নিবেশিত)")
    verify(out)

def verify(src):
    # ইউনিক-লাইন-পোস্ট-অ্যাসার্ট
    uniq = [
        "var q341h = { getm: 0, invalids: 0, copies: 0, last: '', err: '' };",
        "var getHintsOrig341 = q333h.getHints;",
        "var MODES341 = ['rich', 'key', 'json'];",
        "var trOrig341 = tipRender318;",
        "var persistOrig341 = persist337;",
        "var clearOrig341 = q337h.clearStore;",
        "var fmtOrig341 = cycleFmt326;",
        "window.__hrAria341QA = q341h;",
        ".hr341-msel { flex: 0 0 auto;",
        ".hr341-mbtn { flex: 0 0 auto;",
        "EOF session341",
    ]
    for u in uniq:
        c = src.count(u)
        if c != 1:
            fatal("পোস্ট-অ্যাসার্ট-ব্যর্থ (count=%d): %s" % (c, u[:60]))
    # মার্কার-গণনা (CSS-ব্লক হেডার+EOF = কমপক্ষে-২)
    n_css = src.count("session341 (sfs341")
    if n_css < 2:
        fatal("CSS-মার্কার-গণনা-ব্যর্থ (n=%d)" % n_css)
    # হেক্স-শূন্য (session341-ব্লক)
    m = re.search(r"/\* সেশন ৩৪১ \(sfs341.*?EOF session341", src, re.S)
    if not m:
        fatal("CSS-ব্লক-নিষ্কাশন-ব্যর্থ")
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", m.group(0))
    if hexes:
        fatal("হেক্স-লব্ধ (rgba-only-চুক্তি): %s" % hexes[:5])
    # ক্যাসকেড-অবস্থান (EOF341 > EOF340 > EOF339)
    e339 = src.find("EOF session339")
    e340 = src.find("EOF session340")
    e341 = src.find("EOF session341")
    if not (e339 >= 0 and e340 > e339 and e341 > e340):
        fatal("ক্যাসকেড-অবস্থান-ব্যর্থ")
    print("VERIFY ✓ (ইউনিক-লাইন ×১১ + মার্কার ×২ + হেক্স-শূন্য + ক্যাসকেড-অবস্থান)")

if __name__ == "__main__":
    main()
