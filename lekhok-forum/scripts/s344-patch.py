#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s344-patch.py — session344: hr344 getHints('all')-সর্ব-মোড-শর্টহ্যান্ড + .hr344-bar/.hr344-abtn/.hr344-chip সর্ব-মোড-রপ্তাই-বার + sfs344 স্টাইল
[Task ID 181] PLANS session343-নোটের প্রস্তাব-②-প্রথম-বিকল্প (hr342-চুক্তি-প্রসারিত)।
Idempotent ×২ (marker-guard-প্রথম); অ্যাঙ্কর-এককতা-FATAL; ইউনিক-লাইন-পোস্ট-অ্যাসার্ট + হেক্স-শূন্য + ক্যাসকেড-অবস্থান।
"""
import sys, io, re

PATH = "admin/views/admin/home-reorder.ejs"

JS_MARK = "__hrAria344QA"  # JS-উপস্থিতি = ASCII-হুক-নাম (s340-রীতি)
CSS_MARK = "session344 (sfs344"

JS_ANCHOR = "})();\n</script>"
CSS_ANCHOR = "    /* ═══════ EOF session343 (sfs343 ওভারলে-W-সারি-ধ্বংসাত্মক-টোন — admin-ইনলাইন) ═══════ */"

CSS_BLOCK = """
    /* ═══════ session344 (sfs344 সর্ব-মোড-শর্টহ্যান্ড-রপ্তাই — admin-ইনলাইন) ═══════ */
    /* সেশন ৩৪৪ (sfs344): সর্ব-মোড-রপ্তাই-বার (hr324-বার-পরিবার — স্বতন্ত্র-শ্রেণি-ত্রয়ী .hr344-abtn/
       .hr344-chip — s326-.hr326-fmt-রীতি): অ্যাম্বার-পরিবার = সর্ব-মোড-শর্টহ্যান্ড-সংকেত (নীল-রিড/বেগুনি-মোড/
       টিল-ব্যাচ/সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-পরিবার-বিভাজন-বৃদ্ধি — all-সংকেত); solid-বর্ডার = শর্টহ্যান্ড-
       সম্পূর্ণ-রপ্তাই-রীতি (hr342-সম-রীতি); চিপ = কী-গণনা-নির্দেশক (প্রতি-সিঙ্কে-তাজা — getHints('all')-
       এক-উৎস — dashed-চিপ = নির্দেশক-কেবল-নিষ্ক্রিয়-অর্থবিদ্যা); নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-
       অস্পৃশ্য — সর্ব-ব্যান্ড — rgba-only — হেক্স-শূন্য — MO=৪-অটুট। */
    .hr344-abtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font: inherit; font-size: 0.55rem; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(180, 83, 9, 0.5); background: rgba(180, 83, 9, 0.1); color: rgba(146, 64, 14, 0.97); cursor: pointer; transition: none; user-select: none; }
    .hr344-abtn:hover { background: rgba(180, 83, 9, 0.18); border-color: rgba(180, 83, 9, 0.65); }
    .hr344-abtn:focus-visible { outline: 2px solid rgba(217, 119, 6, 0.75); outline-offset: 1px; }
    .hr344-abtn:active { transform: scale(0.97); }
    .hr344-abtn.hr344-done { background: rgba(217, 119, 6, 0.22); border-color: rgba(217, 119, 6, 0.85); color: rgba(120, 53, 15, 1); }
    .hr344-chip { flex: 0 0 auto; font: inherit; font-size: 0.52rem; line-height: 1.4; padding: 1px 6px; border-radius: 999px; border: 1px dashed rgba(180, 83, 9, 0.4); background: rgba(180, 83, 9, 0.07); color: rgba(146, 64, 14, 0.9); white-space: nowrap; user-select: none; }
    @media (prefers-reduced-motion: reduce) { .hr344-abtn:active { transform: none; } }
    @media (max-width: 640px) { .hr344-abtn { font-size: 0.52rem; padding: 2px 6px; } .hr344-chip { font-size: 0.5rem; padding: 1px 5px; max-width: 116px; overflow: hidden; text-overflow: ellipsis; } }
    /* ═══════ EOF session344 (sfs344 সর্ব-মোড-শর্টহ্যান্ড-রপ্তাই — admin-ইনলাইন) ═══════ */"""

JS_BLOCK = """
  /* সেশন ৩৪৪ (hr344): getHints('all')-সর্ব-মোড-শর্টহ্যান্ড + কী-গণনা-চিপ-সহ-সর্ব-মোড-রপ্তাই-বার (PLANS session343-নোটের প্রস্তাব-②-প্রথম-বিকল্প — hr342-চুক্তি-প্রসারিত)
     • getHints('all') (getHintsOrig344-চেইন-রীতি — hr342-চুক্তি-প্রসারিত): q333h.getHints('all') =
       getHints(MODES344.slice(0))-এক-উৎস-প্রতিনিধি (batch-MODES342-সমতুল্য — দ্বি-পথ-সমতা {আকৃতি + ক্রম +
       স্ন্যাপশট + getmb-কাউন্টার-ডেল্টা-সমতা} — অনুলিপি-লজিক-শূন্য); অ-'all'-ইনপুট = getHintsOrig344-প্রতিনিধি
       (অ্যারে = hr342-অটুট; স্ট্রিং-মোড = hr341-অটুট — 'all'-ব্যতীত; মিথ্যা=RAW/সত্য=বর্তমান-মোডে = hr340-অটুট;
       অবৈধ-স্ট্রিং = getm:invalid-অটুট — 'all'-এখন-বৈধ-মোড-স্ট্রিং — hr341/hr342-কাউন্টার-'all'-পথে-অস্পৃশ্য);
       প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট (hr342/hr338-কপি-সুরক্ষা-উত্তরাধিকার)।
     • সর্ব-মোড-রপ্তাই-বার .hr344-bar + বাটন .hr344-abtn + কী-গণনা-চিপ .hr344-chip (স্বতন্ত্র-শ্রেণি-ত্রয়ী —
       s326-.hr326-fmt-রীতি — .hr324-btn-গণনা-চুক্তি-অটুট): স্বতন্ত্র-বার .hr324-bar.hr344-bar (hr342-বার-রীতি —
       hr339/hr340/hr341/hr342-বারে-সংযোজন-নিষিদ্ধ-উত্তরাধিকার); নির্মাণ = trOrig344-চেইন (hr343-পরে); গেট =
       বার-পরিবার-দৃশ্যমানতা (hist317.length ≥১ ∨ storeN339() ≥১ — শূন্য-অবস্থায় নীরব — hr324-দর্শন);
       ডুপ-রক্ষা + পরিবার-শূন্যে-নিজস্ব-বার-সিঙ্ক-অপসারণ (ensureAll344 এক-উৎস — চতুর্মোড়ক-জীবন্ত-সিঙ্ক:
       trOrig344-চেইন + persist337-মোড়ক + q337h.clearStore-মোড়ক + cycleFmt326-মোড়ক — regOrig334-চেইন-রীতি —
       রি-রেন্ডার-বিহীন — ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪); চিপ = প্রতি-সিঙ্কে registry-উৎস-প্রত্যক্ষ-গণনা
       (syncChip344-এক-উৎস — ovRows330-অ-শূন্য-হিন্ট-সারি — কাউন্টার-নীরব {q338h.gets/q342h.getmb-অস্পৃশ্য} —
       bn317a-বাংলা-সংখ্যা — aria-hidden-চাক্ষুষ-কেবল); বাটন-কপি = q333h.getHints('all') →
       JSON.stringify(…, null, 2) — রেকর্ড-বিহীন (copyHist324-রীতি — ইতিহাস-গণনা-দূষণ-শূন্য) + টোস্ট ('সর্ব-মোড
       (all-শর্টহ্যান্ড) হিন্ট-মানচিত্র কপি হয়েছে (৩-বিন্যাস — প্রতি-বিন্যাসে N-কী)') + .hr344-done-ফ্ল্যাশ (১.২s);
       কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339/hr340/hr341/hr342-উত্তরাধিকার — ওভারলে-৯-সারি-স্থায়িত্ব)।
     • চুক্তি: ovRows330/registry/kbd-লাইন/storage-অস্পৃশ্য; hr338-diff/hr337-restored/hr336-batched/hr339-/
       hr340-/hr341-/hr342-শ্রেণি-বার-অস্পৃশ্য (একক-দায়িত্ব); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; QA-হুক-প্রতিনিধি-
       বাইপাস-উত্তরাধিকার-অটুট।
     • QA-হুক __hrAria344QA {getall, copies, last, all(), chip(), abtn(), bar(), err} — সারি-শূন্যে-ও-সংজ্ঞায়িত;
       s343/s342/s341/s340/s339/s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q344h = { getall: 0, copies: 0, last: '', err: '' };
  var getHintsOrig344 = q333h.getHints; /* hr342-চেইন-উপরে-hr344-চেইন — অ্যারে/স্ট্রিং/মিথ্যা/সত্য-পথ-অক্ষুণ্ণ */
  var MODES344 = ['rich', 'key', 'json']; /* MODES342-মিরর (ত্রি-মোড-রেজিস্ট্রি — hr326/hr331-চুক্তি) */
  q333h.getHints = function (m344q) {
    try {
      if (m344q === 'all') {
        q344h.getall += 1; q344h.last = 'getall';
        return getHintsOrig344(MODES344.slice(0)); /* এক-উৎস-প্রতিনিধি — batch-সমতুল্য (দ্বি-পথ-সমতা — getmb-ডেল্টা-সহ) */
      }
      return getHintsOrig344(m344q); /* hr342/hr341/hr340-চুক্তি-অটুট */
    } catch (e344g) { q344h.err = String((e344g && e344g.message) || e344g); return {}; }
  };
  var abar344 = function () { return tip317 ? tip317.querySelector('.hr344-bar') : null; };
  var abtn344 = function () { return tip317 ? tip317.querySelector('.hr344-abtn') : null; };
  var chip344 = function () { return tip317 ? tip317.querySelector('.hr344-chip') : null; };
  var syncChip344 = function () {
    try {
      var ch344 = chip344();
      if (!ch344) return;
      var n344r = 0;
      for (var i344c = 0; i344c < ovRows330.length; i344c++) {
        var r344c = ovRows330[i344c];
        if (r344c.length > 2 && r344c[2]) n344r += 1; /* registry-উৎস-প্রত্যক্ষ-পাঠ (getHints338-সম-উৎস-উপরের-স্তর — কাউন্টার-নীরব — q338h/q341h/q342h-অস্পৃশ্য — সহাবস্থান-চুক্তি) */
      }
      var parts344 = [];
      for (var m344c = 0; m344c < MODES344.length; m344c++) {
        parts344.push(fmtLabel331(MODES344[m344c]) + ' ' + bn317a(n344r)); /* গণনা-মোড-নিরপেক্ষ {রেজলিউশন-মান-কেবল-পরিবর্তন-করে — কী-সেট-অভিন্ন} */
      }
      ch344.textContent = parts344.join(' · ');
      q344h.last = 'chip:sync';
    } catch (e344s) { q344h.err = String((e344s && e344s.message) || e344s); }
  };
  var ensureAll344 = function () {
    try {
      if (!tip317) return;
      var fam344 = (hist317.length >= 1) || (storeN339() >= 1); /* বার-পরিবার-দৃশ্যমানতা (hr324-দর্শন) */
      var s344 = abar344();
      if (!fam344) {
        if (s344) {
          var bar344r = s344.parentNode; /* সর্বদা-টিপ৩১৭ (s344 = বার-স্প্যান-নিজে — টিপ-সংরক্ষণ-সহ-বার-অপসারণ) */
          if (bar344r) bar344r.removeChild(s344);
          q344h.last = 'sync:off';
        }
        return;
      }
      var built344 = false;
      if (!s344) {
        built344 = true;
        var bar344 = document.createElement('span');
        bar344.className = 'hr324-bar hr344-bar'; /* hr342-বার-রীতি — hr324-পরিবার-সম্মত + স্বতন্ত্র-মার্কার */
        var ab344 = document.createElement('button');
        ab344.type = 'button';
        ab344.className = 'hr344-abtn'; /* স্বতন্ত্র-শ্রেণি — .hr324-btn-গণনা-চুক্তি-অটুট */
        ab344.setAttribute("aria-label", "সর্ব-মোড রেজলভড হিন্ট-মানচিত্র ক্লিপবোর্ডে রপ্তাই করুন (getHints('all')-শর্টহ্যান্ড — ত্রি-বিন্যাস)");
        var ai344 = document.createElement('i'); ai344.className = 'fas fa-clone'; ai344.setAttribute('aria-hidden', 'true');
        var al344 = document.createElement('span'); al344.className = 'hr344-lbl'; al344.textContent = ' সর্ব-মোড কপি (all)';
        ab344.appendChild(ai344); ab344.appendChild(al344);
        ab344.addEventListener('click', function (e344c) {
          e344c.preventDefault(); e344c.stopPropagation();
          try {
            var ma344b = q333h.getHints('all'); /* hr344-চেইন — all-শর্টহ্যান্ড-এক-উৎস */
            var fk344 = null;
            for (var mk344 in ma344b) { if (Object.prototype.hasOwnProperty.call(ma344b, mk344)) { fk344 = ma344b[mk344]; break; } }
            var nk344 = 0;
            if (fk344) { for (var kk344 in fk344) { if (Object.prototype.hasOwnProperty.call(fk344, kk344)) nk344 += 1; } }
            var txt344 = JSON.stringify(ma344b, null, 2);
            var ok344m = 'সর্ব-মোড (all-শর্টহ্যান্ড) হিন্ট-মানচিত্র কপি হয়েছে (৩-বিন্যাস — প্রতি-বিন্যাসে ' + bn317a(nk344) + '-কী)';
            var done344 = function () {
              q344h.copies += 1; q344h.last = 'copy:all';
              showToast(true, ok344m);
              ab344.classList.add('hr344-done');
              setTimeout(function () { ab344.classList.remove('hr344-done'); }, 1200); /* hr324-ফ্ল্যাশ-রীতি */
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(txt344).then(done344, function () { fallbackCopy316(txt344) ? done344() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন'); });
            } else {
              fallbackCopy316(txt344) ? done344() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন');
            }
          } catch (e344cc) { q344h.err = String((e344cc && e344cc.message) || e344cc); }
        });
        var chipE344 = document.createElement('span');
        chipE344.className = 'hr344-chip';
        chipE344.setAttribute('aria-hidden', 'true'); /* চাক্ষুষ-গণনা-কেবল (aria-অর্থ = বাটন-লেবেলে) */
        chipE344.setAttribute("title", "প্রতি-বিন্যাসে রেজলভড-হিন্ট-সংখ্যা (getHints('all'))");
        bar344.appendChild(ab344);
        bar344.appendChild(chipE344);
        tip317.appendChild(bar344);
      }
      syncChip344(); /* প্রতি-ensure-এ চিপ-গণনা-তাজা (রি-রেন্ডার-বিহীন — last='chip:sync') */
      if (built344) q344h.last = 'sync:on'; /* নির্মাণ-মার্কার-চূড়ান্ত (chip:sync-ওভাররাইট-নিষিদ্ধ — s342-সম-মার্কার-অর্থবিদ্যা) */
    } catch (e344e) { q344h.err = String((e344e && e344e.message) || e344e); }
  };
  var trOrig344 = tipRender318; /* hr343-চেইন-পরবর্তী — সর্ব-বহিঃস্থ-মোড়ক */
  tipRender318 = function (k344t) {
    trOrig344(k344t);
    try { ensureAll344(); } catch (e344t) { q344h.err = String((e344t && e344t.message) || e344t); }
  };
  var persistOrig344 = persist337; /* regOrig334-চেইন-রীতি — প্রতি-সফল-স্থায়ীকরণ-পরবর্তী-জীবন্ত-সিঙ্ক */
  persist337 = function () {
    var r344p = persistOrig344();
    try { ensureAll344(); } catch (e344p) { q344h.err = String((e344p && e344p.message) || e344p); }
    return r344p;
  };
  var clearAllOrig344 = q337h.clearStore; /* hr337-চুক্তি-প্রসারিত — সর্ব-ক্লিয়ার-পথে-জীবন্ত-সিঙ্ক */
  q337h.clearStore = function () {
    var ok344c = clearAllOrig344();
    try { ensureAll344(); } catch (e344c) { q344h.err = String((e344c && e344c.message) || e344c); }
    return ok344c;
  };
  var fmtOrig344 = cycleFmt326; /* cf332-রীতি — চেইন-পরবর্তী-মোড়ক (MO=৪-চতুর্থ-সিঙ্ক-পয়েন্ট) */
  cycleFmt326 = function (b344f) {
    var r344f = fmtOrig344(b344f);
    try { ensureAll344(); } catch (e344f) { q344h.err = String((e344f && e344f.message) || e344f); }
    return r344f;
  };
  q344h.all = function () { return q333h.getHints('all'); };
  q344h.chip = function () { var c344q = chip344(); return c344q ? c344q.textContent : ''; };
  q344h.abtn = function () { return !!abtn344(); };
  q344h.bar = function () { return !!(tip317 && tip317.querySelector('.hr344-bar')); };
  window.__hrAria344QA = q344h;

"""


def fatal(msg):
    print("FATAL: %s" % msg)
    sys.exit(1)


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
        print("SKIP: session344-ব্লক-উভয়ে-বিদ্যমান (idempotent-রান-২)")
        verify(src)
        return
    if js_has != css_has:
        fatal("অর্ধেক-প্রয়োগ-অবস্থা (js=%s css=%s) — ম্যানুয়াল-যাচাই-প্রয়োজন" % (js_has, css_has))

    if src.count(JS_ANCHOR) != 1:
        fatal("JS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(JS_ANCHOR))
    if src.count(CSS_ANCHOR) != 1:
        fatal("CSS-অ্যাঙ্কর-এককতা-ব্যর্থ (count=%d)" % src.count(CSS_ANCHOR))

    out = src.replace(JS_ANCHOR, JS_BLOCK + "})();\n</script>", 1)
    out = out.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_BLOCK, 1)

    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(out)
    print("PATCH ✓ (session344 JS+CSS সন্নিবেশিত)")
    verify(out)


def verify(src):
    uniq = [
        "var q344h = { getall: 0, copies: 0, last: '', err: '' };",
        "var getHintsOrig344 = q333h.getHints;",
        "var MODES344 = ['rich', 'key', 'json'];",
        "var trOrig344 = tipRender318;",
        "var persistOrig344 = persist337;",
        "var clearAllOrig344 = q337h.clearStore;",
        "var fmtOrig344 = cycleFmt326;",
        "window.__hrAria344QA = q344h;",
        ".hr344-abtn { flex: 0 0 auto;",
        ".hr344-chip { flex: 0 0 auto;",
        "EOF session344",
    ]
    for u in uniq:
        c = src.count(u)
        if c != 1:
            fatal("পোস্ট-অ্যাসার্ট-ব্যর্থ (count=%d): %s" % (c, u[:60]))
    n_css = src.count("session344 (sfs344")
    if n_css < 2:
        fatal("CSS-মার্কার-গণনা-ব্যর্থ (n=%d)" % n_css)
    m = re.search(r"/\* ═══════ session344 \(sfs344.*?EOF session344", src, re.S)
    if not m:
        fatal("CSS-ব্লক-নিষ্কাশন-ব্যর্থ")
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", m.group(0))
    if hexes:
        fatal("হেক্স-লব্ধ (rgba-only-চুক্তি): %s" % hexes[:5])
    e339 = src.find("EOF session339")
    e340 = src.find("EOF session340")
    e341 = src.find("EOF session341")
    e342 = src.find("EOF session342")
    e343 = src.find("EOF session343")
    e344 = src.find("EOF session344")
    if not (e339 >= 0 and e340 > e339 and e341 > e340 and e342 > e341 and e343 > e342 and e344 > e343):
        fatal("ক্যাসকেড-অবস্থান-ব্যর্থ")
    # ৫ম-MO-নিষিদ্ধ-চুক্তি: MO=৪ = ডক-কনভেনশন (সিঙ্ক-পয়েন্ট-চতুষ্টয় — MutationObserver-নির্মাণ-এ-ফাইলে-শূন্য —
    # s342-প্যাচ-পূর্বসূরি-রীতি — নতুন-MO-নির্মাণ-নিষিদ্ধ = sync-চেইন-মোড়ক-কেবল)
    mo_n = len(re.findall(r"new MutationObserver", src))
    if mo_n != 0:
        fatal("নতুন-MO-নির্মাণ-লব্ধ (n=%d — সিঙ্ক-চেইন-মোড়ক-কেবল-চুক্তি)" % mo_n)
    print("VERIFY ✓ (ইউনিক-লাইন ×১১ + মার্কার ×২ + হেক্স-শূন্য + ক্যাসকেড-অবস্থান + সিঙ্ক-চেইন-কেবল-চুক্তি)")


if __name__ == "__main__":
    main()
