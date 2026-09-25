#!/usr/bin/env python3
# s336-patch.py — session336: hr336 রেজিস্ট্রি-হিন্ট-ব্যাচ-API setHints(map) + sfs336 ব্যাচ-kbd-ফিডব্যাক-টোন
# [Task ID 173] PLANS session335-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড)
# Idempotent ×২-চুক্তি (s335-রীতি): প্রতি-ধাপে old-বিদ্যমানে প্রয়োগ, new-বিদ্যমানে স্কিপ, উভয়ে-অনুপস্থিতে ব্যর্থতা।
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

HR336_JS_BLOCK = """  window.__hrAria335QA = q335h;

  /* সেশন ৩৩৬ (hr336): রেজিস্ট্রি-হিন্ট-ব্যাচ-API — setHints (PLANS session335-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প)
     • register-পরিবার-সম্প্রসারণ: q333h.setHints(map) — এক-কল-বহু-কী-হিন্ট-সম্পাদনা (hr335-চুক্তি-প্রসারিত):
       hasOwnProperty-রক্ষা-for-in (পুরাতন-রীতি) — প্রতি-কী-তে setHint335-প্রতিনিধি (লাইন-সিঙ্ক-ত্রি-পথ
       উত্তরাধিকার — rewrites/appends/misses-গণনা-স্বয়ংক্রিয়); ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys}
       রিটার্ন; অবৈধ-ইনপুট (null/অবজেক্ট-নয়) = {applied:০, missed:১, total:০, keys:[]} + batch:invalid-last;
       শূন্য-মান-কী = ক্লিয়ার-পথ (hr335-সম্মত); {fmt}-টেমপ্লেট-সমর্থিত (hintOf334-কল-টাইম-রেজলভ);
       live==line()-চুক্তি-সংরক্ষণ (প্রতি-সেটে-লাইভ-সিঙ্ক — ব্যাচ-শেষেও line()==kbdLine334());
       s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য + ওভারলে-সারি-গণনা-অস্পৃশ্য (ব্যাচ = হিন্ট-কেবল-সম্পাদনা);
       সফল-ব্যাচে (applied≥১) kbd-লাইনে hr336-batched-শ্রেণি (sfs336-ফিডব্যাক-টোন-গেট —
       একক-set()-পথে-শ্রেণি-অযুক্ত — s335-আচরণ-অটুট)।
     • QA-হুক __hrAria336QA {batches, applied, missed, keys, last, setHints(), set(), hintOf(), line(), err}
       — সারি-শূন্যে-ও-সংজ্ঞায়িত; s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q336h = { batches: 0, applied: 0, missed: 0, keys: 0, last: '', err: '' };
  var setHints336 = function (m336) {
    try {
      if (!m336 || typeof m336 !== 'object') { q336h.missed += 1; q336h.last = 'batch:invalid'; return { applied: 0, missed: 1, total: 0, keys: [] }; }
      var ks336 = [];
      for (var c336 in m336) { if (Object.prototype.hasOwnProperty.call(m336, c336)) ks336.push(c336); }
      var ok336 = 0, miss336 = 0;
      for (var i336 = 0; i336 < ks336.length; i336++) {
        if (setHint335(ks336[i336], m336[ks336[i336]])) ok336 += 1; else miss336 += 1;
      }
      if (ok336 > 0) {
        var kb336b = tip317 ? tip317.querySelector('.hr324-kbd') : null;
        if (kb336b && kb336b.classList) kb336b.classList.add('hr336-batched'); /* sfs336-ফিডব্যাক-গেট */
      }
      q336h.batches += 1; q336h.applied += ok336; q336h.missed += miss336; q336h.keys += ks336.length;
      q336h.last = 'batch:' + ok336 + '/' + ks336.length;
      return { applied: ok336, missed: miss336, total: ks336.length, keys: ks336 };
    } catch (e336) { q336h.err = String((e336 && e336.message) || e336); return { applied: 0, missed: 0, total: 0, keys: [] }; }
  };
  q333h.setHints = function (m336q) { return setHints336(m336q); };
  q336h.setHints = function (m336q2) { return setHints336(m336q2); };
  q336h.set = function (k336q3, h336q3) { return setHint335(k336q3, h336q3); };
  q336h.hintOf = function (k336q4) { return hintOf334(k336q4); };
  q336h.line = function () { return kbdLine334(); };
  window.__hrAria336QA = q336h;
})();"""

HR336_CSS_BLOCK = """    /* ═══════ session336 (sfs336 ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন — admin-ইনলাইন) ═══════ */
    /* hex-free (color-mix); hr336-সহাবস্থান: ব্যাচ-সম্পাদিত-কbd-লাইন (.hr324-kbd.hr336-batched —
       hr336-setHints-সফল-ব্যাচে-যুক্ত-শ্রেণি — একক-set()-পথে-অযুক্ত) গভীর-ব্র্যান্ড-টোন ১৫% +
       গাঢ়-টেক্সট (sfs335-বেস-৮%-এর-উপরে-ধাপ — র‍্যাম্প-সহাবস্থান-অসম্পৃক্ত) — ব্যাচ-প্রয়োগ-
       সনাক্তযোগ্যতা (ত্রি-মোড-চক্রে-স্থায়ী — textContent-পুনঃলেখনে-শ্রেণি-অটুট — শৈলী-অসম্পৃক্ত);
       **কেবল-রঙ (background-color + color)** — layout-neutral (geometry/প্যাডিং/বর্ডার-অস্পৃশ্য —
       বক্স-মডেল-অটুট — hScroll-অপরিবর্তিত); সর্ব-ব্যান্ড (media-query-শূন্য); α=০.১৫
       (পূর্ব-র‍্যাম্প ১৮/২৪/২৮/৩৪/৪২/৫০%-সহাবস্থান-অসম্পৃক্ত); transition-শূন্য (s315-নিরাপদ);
       var(--lf-brand-primary) = tokens.css-লোডেড (admin-হেড — s335-গোটচা-③-যাচাইকৃত)। */
    .hr317-tip .hr324-kbd.hr336-batched {
      background-color: color-mix(in srgb, var(--lf-brand-primary) 15%, transparent);
      color: rgba(6, 95, 70, 0.92);
    }
    /* ═══════ EOF session336 (sfs336 ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন — admin-ইনলাইন) ═══════ */"""

def main():
    applied = 0
    t = load(EJS)

    # ধাপ-১ (hr336 JS): __hrAria335QA-এর-পরে + IIFE-বন্ধের-আগে setHints-ব্লক (সহাবস্থান-রীতি)
    t, n1 = step('hr336-setHints-JS-ব্লক (q335h-হুক-পরবর্তী)', t,
        "  window.__hrAria335QA = q335h;\n})();",
        HR336_JS_BLOCK)

    # ধাপ-২ (sfs336 CSS): session335-EOF-ব্লক-পরবর্তী ইনলাইন-<style> session336-ব্লক (কেবল-সংযোজন)
    t, n2 = step('sfs336-ইনলাইন-CSS-ব্লক (session335-EOF-পরবর্তী)', t,
        "    /* ═══════ EOF session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন) ═══════ */\n",
        "    /* ═══════ EOF session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন) ═══════ */\n" + HR336_CSS_BLOCK + "\n")

    if n1 or n2:
        save(EJS, t)
        print(f"saved ({n1 + n2} ধাপ-প্রয়োগ)")
    else:
        print("no-op (সর্ব-ধাপ-পূর্ব-প্রয়োগিত)")
    return 0

if __name__ == '__main__':
    sys.exit(main())
