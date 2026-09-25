#!/usr/bin/env python3
# s337-patch.py — session337: hr337 রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ (sessionStorage-replay) + sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন
# [Task ID 174] PLANS session336-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড)
# Idempotent ×২-চুক্তি (s335/s336-রীতি): প্রতি-ধাপে old-বিদ্যমানে প্রয়োগ, new-বিদ্যমানে স্কিপ, উভয়ে-অনুপস্থিতে ব্যর্থতা।
import sys, io, os

APP = os.environ.get('LEKHOK_APP', '/home/z/lekhok-forum/lekhok-forum/lekhok-forum')
EJS = os.path.join(APP, 'admin', 'views', 'admin', 'home-reorder.ejs')

def load(p):
    with io.open(p, encoding='utf-8') as f: return f.read()

def save(p, s):
    with io.open(p, 'w', encoding='utf-8') as f: f.write(s)

def step(name, s, old, new, count=1):
    """s335-রীতি: old-থাকলে new-এ বদল (count-বার), new-থাকলে স্কিপ, উভয়ে-নেই ব্যর্থতা।"""
    if new in s:
        print(f"  skip {name} (already-applied)")
        return s, 0
    n = s.count(old)
    if n < count:
        print(f"  FAIL {name} (old×{n} < {count})")
        sys.exit(1)
    print(f"  ok   {name}")
    return s.replace(old, new, count), 1

SFS337_CSS = """    /* ═══════ session337 (sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন — admin-ইনলাইন) ═══════ */
    /* hex-free (color-mix); hr337-সহাবস্থান: পুনঃপ্রয়োগ-সনাক্ত-kbd-লাইন (.hr324-kbd.hr337-restored —
       hr337-replay-এ-applied≥১-এ-যুক্ত-শ্রেণি — auto/manual-উভয়-পথে) গভীরতর-ব্র্যান্ড-টোন ২২% +
       অতি-গাঢ়-টেক্সট (sfs336-ব্যাচ-১৫%-এর-উপরে-ধাপ — kbd-র‍্যাম্প ৮→১৫→২২ — সহাবস্থান-অসম্পৃক্ত) —
       পুনঃপ্রয়োগ-সনাক্তযোগ্যতা (reload-পরবর্তী-স্থায়িত্ব-প্রমাণ); cascade-চুক্তি: ব্লক-অবস্থান
       session336-ব্লক-পরে — সম-নির্দিষ্টতায়-পরবর্তী-রুল-প্রাধান্য — দ্বি-শ্রেণি
       (hr336-batched+hr337-restored)-সহাবস্থানে restored-২২%-জয়ী);
       **কেবল-রঙ (background-color + color)** — layout-neutral (geometry/প্যাডিং/বর্ডার-অস্পৃশ্য —
       বক্স-মডেল-অটুট — hScroll-অপরিবর্তিত); সর্ব-ব্যান্ড (media-query-শূন্য); α=০.২২
       (পূর্ব-র‍্যাম্প ১৮/২৪/২৮/৩৪/৪২/৫০%-সহাবস্থান-অসম্পৃক্ত); transition-শূন্য (s315-নিরাপদ);
       var(--lf-brand-primary) = tokens.css-লোডেড (admin-হেড — s335-গোটচা-③-যাচাইকৃত)। */
    .hr317-tip .hr324-kbd.hr337-restored {
      background-color: color-mix(in srgb, var(--lf-brand-primary) 22%, transparent);
      color: rgba(6, 95, 70, 0.95);
    }
    /* ═══════ EOF session337 (sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন — admin-ইনলাইন) ═══════ */"""

HR337_JS = """  window.__hrAria336QA = q336h;

  /* সেশন ৩৩৭ (hr337): রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ — sessionStorage-replay (PLANS session336-নোটের প্রস্তাব-②-প্রথম-বিকল্প)
     • register-পরিবার-সম্প্রসারণ: q333h.setHint/setHints-পাবলিক-API-চেইন-মোড়ক (regOrig334-চেইন-রীতি) —
       সফল-প্রয়োগের-পরে persist337(): রেজিস্ট্রি-স্ন্যাপশট (সর্ব-রো [0]→[2] — অ-শূন্য-হিন্ট-কেবল —
       {fmt}-RAW-অরেজলভড-সংরক্ষণ — পুনঃপ্রয়োগে-কল-টাইম-মোড-রেজলভ) sessionStorage 'hr337-hints'-এ
       JSON-রূপে; শূন্য-মানচিত্রে removeItem (clean-state — clears-গণনা)।
     • replay337(): সংরক্ষিত-মানচিত্র-পড়া (invalid-JSON/অ্যারে/অবজেক্ট-নয় = {} — নিরাপদ) —
       প্রতি-কী-তে setHint335-প্রতিনিধি (ত্রি-পথ-উত্তরাধিকার — rewrites/appends-গণনা-স্বয়ংক্রিয়);
       applied≥১-এ kbd-লাইনে hr337-restored-শ্রেণি (sfs337-টোন-গেট — cascade-এ session337-ব্লক
       session336-ব্লক-পরে — দ্বি-শ্রেণি-সহাবস্থানে restored-২২%-প্রাধান্য); অজানা-কী = miss-গণনা।
     • IIFE-সমাপ্তি-স্বয়ংক্রিয়-পুনঃপ্রয়োগ (এক-বার — reload-পরবর্তী-সেট/ব্যাচ-হিন্ট-পুনঃপ্রয়োগ);
       sessionStorage-অনুপলব্ধ (privacy/exception) = নীরব-ব্যর্থতা (err-ক্যাপচার — QA-হুকে-দৃশ্যমান)।
     • চুক্তি: QA-হুক-প্রতিনিধি (q335h.set/q336h.setHints ইত্যাদি) = অভ্যন্তরীণ-সরাসরি-পথ —
       স্থায়ীকরণ-বাইপাস (পাবলিক-API-কেবল-স্থায়ীকরণ — s335/s336-আচরণ-অটুট); s324-স্ট্যাটিক-বেস-লাইন
       fresh-render-চুক্তি (storage-শূন্যে-অস্পৃশ্য); ওভারলে-সারি-গণনা-অস্পৃশ্য (হিন্ট-কেবল-পুনঃপ্রয়োগ);
       {fmt}-টেমপ্লেট-সমর্থিত (persist=RAW + replay-কল-টাইম-রেজলভ); live==line()-চুক্তি-সংরক্ষণ।
     • শ্রেণি-বিলম্ব-চুক্তি: replay-সময়ে tip317=null → pending-পতাকা → appendHint334-মোড়ক (এক-উৎস-
       অ্যাপেন্ডার-উত্তরাধিকার) টিপ-নির্মাণে শ্রেণি-প্রয়োগ (auto-replay-ডেটা-অটুট + টোন-টিপ-প্রস্তুতে-লাইভ)।
     • QA-হুক __hrAria337QA {saves, restores, misses, clears, pending, last, save(), load(), map(),
       clearStore(), hintOf(), line(), err} — সারি-শূন্যে-ও-সংজ্ঞায়িত; s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q337h = { saves: 0, restores: 0, misses: 0, clears: 0, pending: false, last: '', err: '' };
  var HR337_KEY = 'hr337-hints';
  var persist337 = function () {
    try {
      var m337 = {};
      for (var i337 = 0; i337 < ovRows330.length; i337++) {
        var r337 = ovRows330[i337];
        if (r337.length > 2 && r337[2]) m337[String(r337[0])] = String(r337[2]); /* {fmt}-RAW-স্ন্যাপশট */
      }
      var n337 = 0;
      for (var c337 in m337) { if (Object.prototype.hasOwnProperty.call(m337, c337)) n337 += 1; }
      if (n337 === 0) {
        window.sessionStorage.removeItem(HR337_KEY);
        q337h.clears += 1; q337h.last = 'persist:clear';
        return 0;
      }
      window.sessionStorage.setItem(HR337_KEY, JSON.stringify(m337));
      q337h.saves += 1; q337h.last = 'persist:' + n337;
      return n337;
    } catch (e337p) { q337h.err = String((e337p && e337p.message) || e337p); return -1; }
  };
  var storedMap337 = function () {
    try {
      var s337 = window.sessionStorage.getItem(HR337_KEY);
      if (!s337) return {};
      var p337 = JSON.parse(s337);
      if (!p337 || typeof p337 !== 'object' || Array.isArray(p337)) return {};
      return p337;
    } catch (e337s) { q337h.err = String((e337s && e337s.message) || e337s); return {}; }
  };
  var replay337 = function () {
    try {
      var m337r = storedMap337();
      var ks337r = [];
      for (var c337r in m337r) { if (Object.prototype.hasOwnProperty.call(m337r, c337r)) ks337r.push(c337r); }
      var ok337r = 0, miss337r = 0;
      for (var j337 = 0; j337 < ks337r.length; j337++) {
        if (setHint335(ks337r[j337], m337r[ks337r[j337]])) ok337r += 1; else miss337r += 1;
      }
      q337h.misses += miss337r;
      if (ok337r > 0) {
        var kb337r = tip317 ? tip317.querySelector('.hr324-kbd') : null;
        if (kb337r && kb337r.classList) kb337r.classList.add('hr337-restored'); /* sfs337-টোন-গেট (টিপ-প্রস্তুত-পথ) */
        else q337h.pending = true; /* টিপ-অপ্রস্তুত (IIFE-সময়ে tip317=null) — appendHint334-মোড়কে-স্থগিত-প্রয়োগ */
        q337h.restores += 1;
      }
      q337h.last = 'replay:' + ok337r + '/' + ks337r.length;
      return { applied: ok337r, missed: miss337r, total: ks337r.length };
    } catch (e337r) { q337h.err = String((e337r && e337r.message) || e337r); return { applied: 0, missed: 0, total: 0 }; }
  };
  var setHintOrig337 = q333h.setHint;
  q333h.setHint = function (k337c, h337c) {
    var ok337c = setHintOrig337(k337c, h337c);
    if (ok337c) persist337(); /* সফল-সেটে-স্থায়ীকরণ (পাবলিক-API-গেট) */
    return ok337c;
  };
  var setHintsOrig337 = q333h.setHints;
  q333h.setHints = function (m337c) {
    var r337c = setHintsOrig337(m337c);
    if (r337c && r337c.applied > 0) persist337(); /* সফল-ব্যাচে-স্থায়ীকরণ */
    return r337c;
  };
  /* appendHint334-মোড়ক (regOrig334-চেইন-রীতি — hr334-এক-উৎস-অ্যাপেন্ডার-উত্তরাধিকার): টিপ-নির্মাণ-
     পথে (kbd-লাইন-প্রাথমিক-বিল্ড ≈ ৮-অ্যাপেন্ড — s336-গোটচা-①-সংশোধন-রীতি) pending-শ্রেণি-বিলম্ব-
     প্রয়োগ — auto-replay-IIFE-সময়ে tip317=null হওয়ায় সরাসরি-শ্রেণি-অসম্ভবতা-সমাধান; মোড়ক =
     কেবল-শ্রেণি-গেট — অ্যাপেন্ড-আচরণ/গণনা (q334h.appends)-অস্পৃশ্য। */
  var appendOrig337 = appendHint334;
  appendHint334 = function (k337w) {
    var r337w = appendOrig337(k337w);
    try {
      if (q337h.pending) {
        var kb337w = tip317 ? tip317.querySelector('.hr324-kbd') : null;
        if (kb337w && kb337w.classList) { kb337w.classList.add('hr337-restored'); q337h.pending = false; } /* sfs337-স্থগিত-গেট */
      }
    } catch (e337w) { q337h.err = String((e337w && e337w.message) || e337w); }
    return r337w;
  };
  q337h.save = function () { return persist337(); };
  q337h.load = function () { return replay337(); };
  q337h.map = function () { return storedMap337(); };
  q337h.clearStore = function () {
    try { window.sessionStorage.removeItem(HR337_KEY); q337h.clears += 1; q337h.last = 'store:cleared'; return true; }
    catch (e337c) { q337h.err = String((e337c && e337c.message) || e337c); return false; }
  };
  q337h.hintOf = function (k337h) { return hintOf334(k337h); };
  q337h.line = function () { return kbdLine334(); };
  try { replay337(); } catch (e337i) { q337h.err = String((e337i && e337i.message) || e337i); } /* IIFE-সমাপ্তি-এক-বার-পুনঃপ্রয়োগ */
  window.__hrAria337QA = q337h;
})();"""

print("s337-patch: hr337 sessionStorage-স্থায়ীকরণ + sfs337 পুনঃপ্রয়োগ-টোন")
t = load(EJS)
t, c1 = step("sfs337-CSS-ব্লক (session336-EOF-পরে)",
             t,
             "    /* ═══════ EOF session336 (sfs336 ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন — admin-ইনলাইন) ═══════ */",
             "    /* ═══════ EOF session336 (sfs336 ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন — admin-ইনলাইন) ═══════ */\n" + SFS337_CSS)
t, c2 = step("hr337-JS-ব্লক (IIFE-সমাপ্তি-পূর্বে)",
             t,
             "  window.__hrAria336QA = q336h;\n})();",
             HR337_JS)
save(EJS, t)
print(f"s337-patch ✓ (applied={c1 + c2}/2 — 0=skip-idempotent)")
