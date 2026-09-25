#!/usr/bin/env python3
# s338-patch.py — session338: hr338 রেজিস্ট্রি-হিন্ট-রিড-API getHints + ডিফ-প্রিভিউ diffHints + sfs338 ডিফ-পেন্ডিং-kbd-টোন
# [Task ID 175] PLANS session337-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (session336-নোটের-৩য়-বিকল্প-উত্তরাধিকার)
# (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ক্লিয়ার-বাটন = পরবর্তী-রাউন্ডের-জন্য-মুক্ত; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)
# Idempotent ×২-চুক্তি (s335/s336/s337-রীতি): প্রতি-ধাপে old-বিদ্যমানে প্রয়োগ, new-বিদ্যমানে স্কিপ, উভয়ে-অনুপস্থিতে ব্যর্থতা।
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

SFS338_CSS = """    /* ═══════ session338 (sfs338 ডিফ-পেন্ডিং-kbd-টোন — admin-ইনলাইন) ═══════ */
    /* hex-free (color-mix); hr338-সহাবস্থান: ডিফ-পেন্ডিং-kbd-লাইন (.hr324-kbd.hr338-diff —
       hr338-diffHints-এ-changed>০-এ-যুক্ত + changed=০/সফল-setHints-প্রয়োগে-অপসারিত — pending-intent-গেট)
       অতি-গভীর-ব্র্যান্ড-টোন ৩০% + সর্বোচ্চ-গাঢ়-টেক্সট (kbd-র‍্যাম্প ৮→১৫→২২→৩০ — sfs337-restored-২২%-এর-
       উপরে-ধাপ — র‍্যাম্প-সহাবস্থান-অসম্পৃক্ত) — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ-সনাক্তযোগ্যতা (intent-অপূর্ণ-সংকেত);
       cascade-চুক্তি: ব্লক-অবস্থান session337-ব্লক-পরে — সম-নির্দিষ্টতায়-পরবর্তী-রুল-প্রাধান্য — দ্বি-শ্রেণি
       (hr337-restored+hr338-diff)-সহাবস্থানে diff-৩০%-জয়ী (pending-মনোযোগ-সর্বোচ্চ);
       **কেবল-রঙ (background-color + color)** — layout-neutral (geometry/প্যাডিং/বর্ডার-অস্পৃশ্য —
       বক্স-মডেল-অটুট — hScroll-অপরিবর্তিত); সর্ব-ব্যান্ড (media-query-শূন্য); α=০.৩০
       (পূর্ব-র‍্যাম্প ১৮/২৪/২৮/৩৪/৪২/৫০%-সহাবস্থান-অসম্পৃক্ত); transition-শূন্য (s315-নিরাপদ);
       var(--lf-brand-primary) = tokens.css-লোডেড (admin-হেড — s335-গোটচা-③-যাচাইকৃত)। */
    .hr317-tip .hr324-kbd.hr338-diff {
      background-color: color-mix(in srgb, var(--lf-brand-primary) 30%, transparent);
      color: rgba(6, 95, 70, 0.97);
    }
    /* ═══════ EOF session338 (sfs338 ডিফ-পেন্ডিং-kbd-টোন — admin-ইনলাইন) ═══════ */"""

HR338_JS = """  window.__hrAria337QA = q337h;

  /* সেশন ৩৩৮ (hr338): রেজিস্ট্রি-হিন্ট-রিড-API — getHints + ডিফ-প্রিভিউ diffHints (PLANS session337-নোটের প্রস্তাব-②-প্রথম-বিকল্প — session336-নোটের-৩য়-বিকল্প-উত্তরাধিকার)
     • register-পরিবার-সম্প্রসারণ (রিড-কেবল): q333h.getHints() — রেজিস্ট্রি-RAW-মানচিত্র-কপি ({কী: [2]-RAW —
       {fmt}-অরেজলভড — setHints-ইনপুট-বিন্যাসে — রাউন্ড-ট্রিপ-চুক্তি: getHints()→সম্পাদনা→setHints = রাউন্ড-ট্রিপ);
       প্রতি-কলে-নতুন-অবজেক্ট (লাইভ-রেজিস্ট্রি-রেফারেন্স-প্রকাশ-নিষিদ্ধ — বাহ্যিক-মিউটেশন-সুরক্ষা)।
     • q333h.diffHints(intended): ব্যাচ-পূর্ব-ডিফ-প্রিভিউ — intended-মানচিত্র vs বর্তমান-রেজিস্ট্রি-RAW:
       {changed, same, missed, total} — changed = রেজিস্ট্রি-বিদ্যমান+RAW-ভিন্ন (প্রয়োগে-পরিবর্তন), same =
       রেজিস্ট্রি-বিদ্যমান+RAW-অভিন্ন (প্রয়োগে-অপরিবর্তিত), missed = রেজিস্ট্রি-অনুপস্থিত (প্রয়োগে-miss —
       setHint335-উত্তরাধিকার); অবৈধ-ইনপুট (null/অবজেক্ট-নয়/অ্যারে) = {changed:০, same:০, missed:১, total:০} +
       diff:invalid-last; hasOwnProperty-রক্ষা-for-in (পুরাতন-রীতি)।
     • শ্রেণি-গেট (sfs338): changed>০-তে kbd-লাইনে hr338-diff-শ্রেণি (pending-intent-সংকেত — ৩০%-টোন);
       changed==০-তে শ্রেণি-অপসারণ (intent-নেই); সফল-পাবলিক-setHints-প্রয়োগে (applied>০) শ্রেণি-অপসারণ
       (intent-পূর্ণ — hr337-চেইন-উপরে hr338-চেইন — স্থায়ীকরণ-উত্তরাধিকার-অটুট); রিড-API (getHints)
       শ্রেণি-অস্পৃশ্য।
     • চুক্তি: রিড-কেবল = রেজিস্ট্রি/লাইন/স্টোরেজ-মিউটেশন-শূন্য (getHints+diffHints = পাঠ-কেবল — শ্রেণি-গেট =
       DOM-শ্রেণি-কেবল); tip317-null-নিরাপদ (শ্রেণি-গেট টিপ-প্রস্তুতে-কেবল); s324-স্ট্যাটিক-বেস-লাইন
       fresh-render-চুক্তি; ওভারলে-সারি-গণনা-অস্পৃশ্য।
     • QA-হুক __hrAria338QA {gets, diffs, changed, missed, last, get(), diff(), line(), err} —
       সারি-শূন্যে-ও-সংজ্ঞায়িত; s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q338h = { gets: 0, diffs: 0, changed: 0, missed: 0, last: '', err: '' };
  var getHints338 = function () {
    try {
      var m338 = {};
      for (var i338 = 0; i338 < ovRows330.length; i338++) {
        var r338 = ovRows330[i338];
        if (r338.length > 2 && r338[2]) m338[String(r338[0])] = String(r338[2]); /* RAW-কপি — রেফারেন্স-প্রকাশ-নিষিদ্ধ */
      }
      var n338 = 0;
      for (var c338n in m338) { if (Object.prototype.hasOwnProperty.call(m338, c338n)) n338 += 1; }
      q338h.gets += 1; q338h.last = 'get:' + n338;
      return m338;
    } catch (e338g) { q338h.err = String((e338g && e338g.message) || e338g); return {}; }
  };
  var kbLine338 = function () { return tip317 ? tip317.querySelector('.hr324-kbd') : null; };
  var diffGate338 = function (on338) {
    try {
      var kb338g = kbLine338();
      if (kb338g && kb338g.classList) {
        if (on338) kb338g.classList.add('hr338-diff'); /* sfs338-পেন্ডিং-গেট */
        else kb338g.classList.remove('hr338-diff');
      }
    } catch (e338k) { q338h.err = String((e338k && e338k.message) || e338k); }
  };
  var diffHints338 = function (m338d) {
    try {
      if (!m338d || typeof m338d !== 'object' || Array.isArray(m338d)) {
        q338h.missed += 1; q338h.last = 'diff:invalid';
        diffGate338(false);
        return { changed: 0, same: 0, missed: 1, total: 0 };
      }
      var ch338 = 0, sm338 = 0, ms338 = 0, tt338 = 0;
      var cur338 = getHints338();
      for (var c338 in m338d) {
        if (!Object.prototype.hasOwnProperty.call(m338d, c338)) continue;
        tt338 += 1;
        if (!Object.prototype.hasOwnProperty.call(cur338, c338)) { ms338 += 1; continue; }
        if (String(cur338[c338]) === String(m338d[c338])) sm338 += 1; else ch338 += 1;
      }
      q338h.diffs += 1; q338h.changed += ch338; q338h.missed += ms338;
      q338h.last = 'diff:' + ch338 + '/' + tt338;
      diffGate338(ch338 > 0); /* changed>০ = pending-গেট-অন — changed==০ = গেট-অফ */
      return { changed: ch338, same: sm338, missed: ms338, total: tt338 };
    } catch (e338d) { q338h.err = String((e338d && e338d.message) || e338d); return { changed: 0, same: 0, missed: 0, total: 0 }; }
  };
  q333h.getHints = function () { return getHints338(); };
  q333h.diffHints = function (m338q) { return diffHints338(m338q); };
  var setHintsOrig338 = q333h.setHints; /* hr337-চেইন-উপরে-hr338-চেইন — স্থায়ীকরণ-উত্তরাধিকার */
  q333h.setHints = function (m338s) {
    var r338s = setHintsOrig338(m338s);
    if (r338s && r338s.applied > 0) diffGate338(false); /* intent-পূর্ণ — pending-শ্রেণি-অপসারণ */
    return r338s;
  };
  q338h.get = function () { return getHints338(); };
  q338h.diff = function (m338q2) { return diffHints338(m338q2); };
  q338h.line = function () { return kbdLine334(); };
  window.__hrAria338QA = q338h;
})();"""

print("s338-patch: hr338 getHints+diffHints রিড-API + sfs338 ডিফ-পেন্ডিং-টোন")
t = load(EJS)
t, c1 = step("sfs338-CSS-ব্লক (session337-EOF-পরে)",
             t,
             "    /* ═══════ EOF session337 (sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন — admin-ইনলাইন) ═══════ */",
             "    /* ═══════ EOF session337 (sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন — admin-ইনলাইন) ═══════ */\n" + SFS338_CSS)
t, c2 = step("hr338-JS-ব্লক (IIFE-সমাপ্তি-পূর্বে)",
             t,
             "  window.__hrAria337QA = q337h;\n})();",
             HR338_JS)
save(EJS, t)
print(f"s338-patch ✓ (applied={c1 + c2}/2 — 0=skip-idempotent)")
