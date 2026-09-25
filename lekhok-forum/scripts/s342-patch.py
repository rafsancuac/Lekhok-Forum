#!/usr/bin/env python3
# s342-patch.py — session342: hr342 getHints-মাল্টি-মোড-ব্যাচ + .hr342-bbtn সর্ব-মোড-ব্যাচ-রপ্তাই + sfs342 স্টাইল
# [Task ID 179] PLANS session341-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (hr341-চুক্তি-প্রসারিত)
# ২-ধাপ: ① JS-ব্লক (hr342 — শেয়ার্ড-IIFE-অভ্যন্তরে __hrAria341QA-পরবর্তী) ② CSS-ব্লক (sfs342 — session341-ব্লক-পরে)
# Idempotent: প্রতি-ধাপে মার্কার-যাচাই — পুনঃরানে স্কিপ।
import io, sys

EJS = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/admin/views/admin/home-reorder.ejs"

JS_BLOCK = r'''
  /* সেশন ৩৪২ (hr342): getHints-মাল্টি-মোড-ব্যাচ getHints(মোড-অ্যারে) + সর্ব-মোড-ব্যাচ-রপ্তাই-বাটন (PLANS session341-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প — hr341-চুক্তি-প্রসারিত)
     • getHints(মোড-অ্যারে) (getHintsOrig342-চেইন-রীতি — hr341-চুক্তি-প্রসারিত): q333h.getHints(['rich','key','json'])
       = বহু-মোড-মানচিত্র-জুটি {mode: রেজলভড-মানচিত্র} — এক-RAW-স্ন্যাপশট-অলস-ফেচ (প্রথম-বৈধ-মোডে-একবার —
       সর্ব-মোডে-পুনঃব্যবহৃত — স্ন্যাপশট-সামঞ্জস্য + শূন্য-অ্যারে-শূন্য-স্ন্যাপশট); প্রতি-মোড-এ {fmt}→
       fmtLabel331(modeStr)-কল-টাইম-প্রতিস্থাপন (hr341-মিরর-লজিক — mode326-অস্পৃশ্য — q340h/q341h-কাউন্টার-
       অস্পৃশ্য — নিজস্ব-কাউন্টার); ডুপ-মোড-বর্জন (প্রথম-আবির্ভূত-ক্রম-সংরক্ষণ); অবৈধ-এন্ট্রি (অ-সদস্য-স্ট্রিং ∨
       অ-স্ট্রিং) = স্কিপ + invalids-গণনা + getmb:invalid-মার্কার (শূন্য-অনুমান — diffHints/setHints-রীতি);
       শূন্য-অ্যারে = শূন্য-অবজেক্ট + getmb:empty-মার্কার; প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট (hr338-কপি-সুরক্ষা-
       উত্তরাধিকার); রেজলভড-মানচিত্র = পাঠ-কেবল-স্ন্যাপশট (setHints-ইনপুট-নয় — hr340-অর্থবিদ্যা-উত্তরাধিকার);
       অ্যারে-বহি-ইনপুট = getHintsOrig342-প্রতিনিধি (স্ট্রিং-মোড = hr341-অটুট — মিথ্যা=RAW/সত্য=বর্তমান-মোডে = hr340-অটুট)।
     • সর্ব-মোড-ব্যাচ-রপ্তাই-বাটন .hr342-bbtn (স্বতন্ত্র-শ্রেণি — s326-.hr326-fmt-রীতি — .hr324-btn-গণনা-চুক্তি-
       অটুট): স্বতন্ত্র-বার .hr324-bar.hr342-bar (hr341-বার-রীতি — hr339/hr340/hr341-বারে-সংযোজন-নিষিদ্ধ-
       উত্তরাধিকার); নির্মাণ = trOrig342-চেইন (hr341-পরে); গেট = বার-পরিবার-দৃশ্যমানতা (hist317.length ≥১ ∨
       storeN339() ≥১ — শূন্য-অবস্থায় নীরব — hr324-দর্শন — fresh-DOM-অপরিবর্তিত-প্রমাণ); ডুপ-রক্ষা +
       পরিবার-শূন্যে-নিজস্ব-বার-সিঙ্ক-অপসারণ (ensureBbtn342 এক-উৎস — চতুর্মোড়ক-জীবন্ত-সিঙ্ক: trOrig342-চেইন +
       persist337-মোড়ক + q337h.clearStore-মোড়ক + cycleFmt326-মোড়ক — regOrig334-চেইন-রীতি — রি-রেন্ডার-বিহীন —
       ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪); বাটন-কপি = getHints(['rich','key','json']) → JSON.stringify(…, null, 2) —
       রেকর্ড-বিহীন (copyHist324-রীতি — copyAria316-বর্জন-ইচ্ছাকৃত — ইতিহাস-গণনা-দূষণ-শূন্য) + টোস্ট ('সর্ব-মোড
       হিন্ট-মানচিত্র ব্যাচ-কপি হয়েছে (৩-বিন্যাস — প্রতি-বিন্যাসে N-কী)') + .hr342-done-ফ্ল্যাশ (১.২s);
       কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339/hr340/hr341-উত্তরাধিকার — ওভারলে-৮-সারি-স্থায়িত্ব)।
     • চুক্তি: ovRows330/registry/kbd-লাইন/storage-অস্পৃশ্য; hr338-diff/hr337-restored/hr336-batched/hr339-/
       hr340-/hr341-শ্রেণি-বার-অস্পৃশ্য (একক-দায়িত্ব); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য; QA-হুক-প্রতিনিধি-বাইপাস-
       উত্তরাধিকার-অটুট।
     • QA-হুক __hrAria342QA {getmb, invalids, copies, last, bbtn(), bar(), batch(modes), err} — সারি-শূন্যে-ও-
       সংজ্ঞায়িত; s341/s340/s339/s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q342h = { getmb: 0, invalids: 0, copies: 0, last: '', err: '' };
  var getHintsOrig342 = q333h.getHints; /* hr341-চেইন-উপরে-hr342-চেইন — স্ট্রিং/মিথ্যা/সত্য-পথ-অক্ষুণ্ণ */
  var MODES342 = ['rich', 'key', 'json']; /* MODES341-মিরর (ত্রি-মোড-রেজিস্ট্রি — hr326/hr331-চুক্তি) */
  q333h.getHints = function (m342q) {
    try {
      if (Object.prototype.toString.call(m342q) === '[object Array]') {
        var snap342 = null; /* অলস-ফেচ — প্রথম-বৈধ-মোডে-একবার (শূন্য-অ্যারে-শূন্য-স্ন্যাপশট-চুক্তি) */
        var out342 = {};
        var seen342 = {};
        var n342v = 0;
        var hadInv342 = false; /* অবৈধ-এন্ট্রি-পতাকা (মার্কার-অগ্রাধিকার-চুক্তি) */
        for (var a342 = 0; a342 < m342q.length; a342++) {
          var e342 = m342q[a342];
          var ok342 = false;
          if (typeof e342 === 'string') {
            for (var b342 = 0; b342 < MODES342.length; b342++) { if (MODES342[b342] === e342) { ok342 = true; break; } }
          }
          if (!ok342) { q342h.invalids += 1; hadInv342 = true; continue; } /* অবৈধ-এন্ট্রি = স্কিপ (শূন্য-অনুমান — মার্কার = লুপ-পরবর্তী-অগ্রাধিকার) */
          if (seen342[e342]) continue; /* ডুপ-মোড-বর্জন (প্রথম-আবির্ভূত-ক্রম-সংরক্ষণ) */
          seen342[e342] = true;
          if (!snap342) snap342 = getHintsOrig342(); /* এক-RAW-স্ন্যাপশট (hr338-চেইন — প্রতি-কলে-নতুন-কপি — সর্ব-মোডে-পুনঃব্যবহৃত) */
          var r342 = {};
          for (var c342 in snap342) {
            if (!Object.prototype.hasOwnProperty.call(snap342, c342)) continue;
            var v342 = String(snap342[c342]);
            if (v342.indexOf('{fmt}') >= 0) v342 = v342.split('{fmt}').join(fmtLabel331(e342)); /* মোড-নির্দিষ্ট-কল-টাইম-রেজলিউশন (hr341-মিরর — mode326-অস্পৃশ্য) */
            r342[c342] = v342;
          }
          out342[e342] = r342;
          n342v += 1;
        }
        q342h.getmb += 1;
        if (hadInv342) { q342h.last = 'getmb:invalid'; } /* অবৈধ-এন্ট্রি-উপস্থিতে invalid-মার্কার-অগ্রাধিকার (ইনপুট-গুণ-সংকেত) */
        else if (n342v > 0) { q342h.last = 'getmb:' + n342v; }
        else { q342h.last = 'getmb:empty'; }
        return out342; /* প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট (কপি-সুরক্ষা-উত্তরাধিকার) */
      }
      return getHintsOrig342(m342q); /* hr341/hr340-চুক্তি-অটুট (স্ট্রিং-মোড / মিথ্যা=RAW / সত্য=বর্তমান-মোডে-রেজলভড) */
    } catch (e342g) { q342h.err = String((e342g && e342g.message) || e342g); return {}; }
  };
  var bbtn342 = function () { return tip317 ? tip317.querySelector('.hr342-bbtn') : null; };
  var ensureBbtn342 = function () {
    try {
      if (!tip317) return;
      var fam342 = (hist317.length >= 1) || (storeN339() >= 1); /* বার-পরিবার-দৃশ্যমানতা (hr324-দর্শন) */
      var s342b = bbtn342();
      if (!fam342) {
        if (s342b) {
          var bar342r = s342b.parentNode; /* সর্বদা-নিজস্ব-বার (.hr342-bar) — সম্পূর্ণ-বার-অপসারণ */
          if (bar342r && bar342r.parentNode) bar342r.parentNode.removeChild(bar342r);
          q342h.last = 'sync:off';
        }
        return;
      }
      if (s342b) return; /* ডুপ-রক্ষা */
      var bar342 = document.createElement('span');
      bar342.className = 'hr324-bar hr342-bar'; /* hr341-বার-রীতি — hr324-পরিবার-সম্মত + স্বতন্ত্র-মার্কার */
      var bb342 = document.createElement('button');
      bb342.type = 'button';
      bb342.className = 'hr342-bbtn'; /* স্বতন্ত্র-শ্রেণি — .hr324-btn-গণনা-চুক্তি-অটুট */
      bb342.setAttribute('aria-label', 'সর্ব-মোড রেজলভড হিন্ট-মানচিত্র এক-কপিতে ক্লিপবোর্ডে রপ্তাই করুন (getHints([সর্ব-মোড]) — ত্রি-বিন্যাস)');
      var bi342 = document.createElement('i'); bi342.className = 'fas fa-layer-group'; bi342.setAttribute('aria-hidden', 'true');
      var bl342 = document.createElement('span'); bl342.className = 'hr342-lbl'; bl342.textContent = ' সর্ব-মোড ব্যাচ-কপি';
      bb342.appendChild(bi342); bb342.appendChild(bl342);
      bb342.addEventListener('click', function (e342c) {
        e342c.preventDefault(); e342c.stopPropagation();
        try {
          var mb342 = q333h.getHints(MODES342.slice(0)); /* সর্ব-মোড-ব্যাচ (hr342-চেইন — ত্রি-মোড-জুটি) */
          var fm342 = null;
          for (var mk342 in mb342) { if (Object.prototype.hasOwnProperty.call(mb342, mk342)) { fm342 = mb342[mk342]; break; } }
          var nk342 = 0;
          if (fm342) { for (var kk342 in fm342) { if (Object.prototype.hasOwnProperty.call(fm342, kk342)) nk342 += 1; } }
          var txt342 = JSON.stringify(mb342, null, 2);
          var ok342m = 'সর্ব-মোড হিন্ট-মানচিত্র ব্যাচ-কপি হয়েছে (৩-বিন্যাস — প্রতি-বিন্যাসে ' + bn317a(nk342) + '-কী)';
          var done342 = function () {
            q342h.copies += 1; q342h.last = 'copy:batch';
            showToast(true, ok342m);
            bb342.classList.add('hr342-done');
            setTimeout(function () { bb342.classList.remove('hr342-done'); }, 1200); /* hr324-ফ্ল্যাশ-রীতি */
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt342).then(done342, function () { fallbackCopy316(txt342) ? done342() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন'); });
          } else {
            fallbackCopy316(txt342) ? done342() : showToast(false, 'রপ্তাই ব্যর্থ — ম্যানুয়ালি নির্বাচন করুন');
          }
        } catch (e342cc) { q342h.err = String((e342cc && e342cc.message) || e342cc); }
      });
      bar342.appendChild(bb342);
      tip317.appendChild(bar342);
      q342h.last = 'sync:on';
    } catch (e342e) { q342h.err = String((e342e && e342e.message) || e342e); }
  };
  var trOrig342 = tipRender318; /* hr341-চেইন-পরবর্তী — নির্মাণ-এক-উৎস */
  tipRender318 = function (k342t) {
    trOrig342(k342t);
    try { ensureBbtn342(); } catch (e342t) { q342h.err = String((e342t && e342t.message) || e342t); }
  };
  var persistOrig342 = persist337; /* regOrig334-চেইন-রীতি — প্রতি-সফল-স্থায়ীকরণ-পরবর্তী-জীবন্ত-সিঙ্ক */
  persist337 = function () {
    var r342p = persistOrig342();
    try { ensureBbtn342(); } catch (e342p) { q342h.err = String((e342p && e342p.message) || e342p); }
    return r342p;
  };
  var clearOrig342 = q337h.clearStore; /* hr337-চুক্তি-প্রসারিত — সর্ব-ক্লিয়ার-পথে-জীবন্ত-সিঙ্ক */
  q337h.clearStore = function () {
    var ok342cl = clearOrig342();
    try { ensureBbtn342(); } catch (e342cl) { q342h.err = String((e342cl && e342cl.message) || e342cl); }
    return ok342cl;
  };
  var fmtOrig342 = cycleFmt326; /* cf332-রীতি — চেইন-পরবর্তী-মোড়ক (MO=৪-চতুর্থ-সিঙ্ক-পয়েন্ট) */
  cycleFmt326 = function (b342f) {
    var r342f = fmtOrig342(b342f);
    try { ensureBbtn342(); } catch (e342f) { q342h.err = String((e342f && e342f.message) || e342f); }
    return r342f;
  };
  q342h.batch = function (arr342q) { return q333h.getHints(arr342q); };
  q342h.bbtn = function () { return !!bbtn342(); };
  q342h.bar = function () { return !!(tip317 && tip317.querySelector('.hr342-bar')); };
  window.__hrAria342QA = q342h;
'''

CSS_BLOCK = r'''    /* ═══════ session342 (sfs342 সর্ব-মোড-ব্যাচ-রপ্তাই — admin-ইনলাইন) ═══════ */
    /* সেশন ৩৪২ (sfs342): সর্ব-মোড-ব্যাচ-রপ্তাই-বাটন (hr324-বার-পরিবার — স্বতন্ত্র-শ্রেণি .hr342-bbtn —
       s326-.hr326-fmt-রীতি): টিল-পরিবার = বহু-মোড-ব্যাচ-রপ্তাই-টোন (নীল-রিড/বেগুনি-মোড/সবুজ-সম্পাদনা/
       লাল-ধ্বংসাত্মক-পরিবার-বিভাজন-বৃদ্ধি — ব্যাচ-সংকেত); solid-বর্ডার = সর্ব-মোড-সম্পূর্ণ-রপ্তাই
       (dashed-একক-মোড-রীতি-বিপরীত); নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য — সর্ব-ব্যান্ড —
       MO=৪-অটুট। */
    .hr342-bbtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font: inherit; font-size: 0.55rem; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(13, 148, 136, 0.5); background: rgba(13, 148, 136, 0.1); color: rgba(15, 118, 110, 0.97); cursor: pointer; transition: none; user-select: none; }
    .hr342-bbtn:hover { background: rgba(13, 148, 136, 0.18); border-color: rgba(13, 148, 136, 0.65); }
    .hr342-bbtn:focus-visible { outline: 2px solid rgba(20, 184, 166, 0.75); outline-offset: 1px; }
    .hr342-bbtn:active { transform: scale(0.97); }
    .hr342-bbtn.hr342-done { background: rgba(20, 184, 166, 0.22); border-color: rgba(20, 184, 166, 0.85); color: rgba(19, 78, 74, 1); }
    @media (prefers-reduced-motion: reduce) { .hr342-bbtn:active { transform: none; } }
    @media (max-width: 640px) { .hr342-bbtn { font-size: 0.52rem; padding: 2px 6px; } }
    /* ═══════ EOF session342 (sfs342 সর্ব-মোড-ব্যাচ-রপ্তাই — admin-ইনলাইন) ═══════ */'''

def main():
    src = io.open(EJS, encoding="utf-8").read()
    steps = []

    # ধাপ-১: JS-ব্লক (শেয়ার্ড-IIFE-অভ্যন্তরে — __hrAria341QA-পরবর্তী — })();-পূর্বে)
    if '__hrAria342QA' in src:
        steps.append("① JS-স্কিপ (মার্কার-বিদ্যমান — idempotent)")
    else:
        anchor = "  window.__hrAria341QA = q341h;\n})();\n</script>"
        if anchor not in src:
            print("FATAL: JS-অ্যাংকর-অনুপস্থিত"); sys.exit(1)
        repl = "  window.__hrAria341QA = q341h;\n" + JS_BLOCK + "\n})();\n</script>"
        src = src.replace(anchor, repl, 1)
        steps.append("① JS-ব্লক-প্রয়োগ (hr342 — IIFE-অভ্যন্তরে s341-পরবর্তী)")

    # ধাপ-২: CSS-ব্লক (session341-EOF-পরে — cascade-চুক্তি)
    if 'EOF session342' in src:
        steps.append("② CSS-স্কিপ (মার্কার-বিদ্যমান — idempotent)")
    else:
        anchor2 = "    /* ═══════ EOF session341 (sfs341 মোড-নির্বাচক-রপ্তাই — admin-ইনলাইন) ═══════ */"
        if anchor2 not in src:
            print("FATAL: CSS-অ্যাংকর-অনুপস্থিত"); sys.exit(1)
        src = src.replace(anchor2, anchor2 + "\n" + CSS_BLOCK, 1)
        steps.append("② CSS-ব্লক-প্রয়োগ (sfs342 — session341-ব্লক-পরে)")

    io.open(EJS, "w", encoding="utf-8").write(src)
    for s in steps:
        print(s)
    print("hr342-refs:", src.count('hr342'), "| session342-markers:", src.count('session342'))

if __name__ == "__main__":
    main()
