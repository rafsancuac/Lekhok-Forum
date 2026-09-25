#!/usr/bin/env python3
# s335-patch.py — session335: hr335 রেজিস্ট্রি-হিন্ট-সম্পাদনা-API setHint(k,h) + sfs335 kbd-লাইন-ব্র্যান্ড-টোন
# [Task ID 172] PLANS session334-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড)
# Idempotent ×২-চুক্তি (s333-রীতি): প্রতি-ধাপে old-বিদ্যমানে প্রয়োগ, new-বিদ্যমানে স্কিপ, উভয়ে-অনুপস্থিতে ব্যর্থতা।
import sys, io, os

APP = os.environ.get('LEKHOK_APP', '/home/z/lekhok-forum/lekhok-forum/lekhok-forum')
EJS = os.path.join(APP, 'admin', 'views', 'admin', 'home-reorder.ejs')
CSS = os.path.join(APP, 'public', 'assets', 'css', 'style.css')

def load(p):
    with io.open(p, encoding='utf-8') as f: return f.read()

def save(p, s):
    with io.open(p, 'w', encoding='utf-8') as f: f.write(s)

def step(name, s, old, new, count=1):
    """s333-রীতি: old-থাকলে new-এ বদল (count-বার), new-থাকলে স্কিপ, উভয়ে-নেই ব্যর্থতা।"""
    if new in s:
        print(f"  skip {name} (already-applied)")
        return s, 0
    n = s.count(old)
    if n < count:
        print(f"  FAIL {name} (old×{n} < {count})")
        sys.exit(1)
    print(f"  ok   {name}")
    return s.replace(old, new, count), 1

HR335_BLOCK = """  window.__hrAria334QA = q334h;

  /* সেশন ৩৩৫ (hr335): রেজিস্ট্রি-হিন্ট-সম্পাদনা-API — setHint (PLANS session334-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প)
     • register-পরিবার-সম্প্রসারণ: q333h.setHint(k, h) — এক-কল-হিন্ট-সম্পাদনা (hr334-চুক্তি-প্রসারিত):
       রেজিস্ট্রি-রো-[2]-মিউটেশন + kbd-লাইন-লাইভ-সিঙ্ক (দ্বি-সাইট — নিবন্ধন-দ্বি-সাইট-রীতির সম্পাদনা-প্রতিপাদ্য);
       ওভারলে-বর্ণনা [1]-অস্পৃশ্য + ওভারলে-পুনঃনির্মাণ-অপ্রয়োজনীয় (mkLi330-হিন্ট-অরেন্ডার-প্রমাণ —
       ওভারলে-সারি-গণনা-অপরিবর্তিত)।
     • লাইন-সিঙ্ক-ত্রি-পথ: ①পুরাতন-উপস্থিত+নতুন-উপস্থিত = split-join-সর্ব-উপস্থিতি in-place-পুনঃলেখন
       (s333-গোটচা-②-রীতি — পুরাতন-রেজলভড → নতুন-রেজলভড — rewrites-গণনা) ②পুরাতন-শূন্য+নতুন-উপস্থিত =
       appendHint334-প্রতিনিধি (অ্যাপেন্ড-পথ — q334h.appends-সহ-গণনা) ③নতুন-শূন্য = ' · '+পুরাতন-
       অপসারণ (ক্লিয়ার-পথ — rewrites-গণনা)।
     • {fmt}-টেমপ্লেট-সমর্থিত (hintOf334-কল-টাইম-রেজলভ — মোড-সচেতন-অটুট); চক্র-পরবর্তী
       kbdLine334()-পুনঃনির্মাণ = রেজিস্ট্রি-থেকে-স্বয়ংক্রিয়-স্থায়িত্ব (এক-উৎস-সমতা-অটুট —
       live==line()-চুক্তি-সংরক্ষণ); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য (fresh-render-চুক্তি)।
     • QA-হুক __hrAria335QA {sets, misses, rewrites, appends, last, set(), hintOf(), line(), err}
       — সারি-শূন্যে-ও-সংজ্ঞায়িত; s334/s333-হুক-সহাবস্থান-অটুট। */
  var q335h = { sets: 0, misses: 0, rewrites: 0, appends: 0, last: '', err: '' };
  var setHint335 = function (k335s, h335s) {
    try {
      if (!k335s) { q335h.misses += 1; return false; }
      var row335s = null;
      for (var i335s = 0; i335s < ovRows330.length; i335s++) {
        if (ovRows330[i335s][0] === k335s) { row335s = ovRows330[i335s]; break; }
      }
      if (!row335s) { q335h.misses += 1; q335h.last = 'miss:' + k335s; return false; }
      var oldR335 = hintOf334(k335s);
      row335s[2] = String(h335s === undefined || h335s === null ? '' : h335s);
      var newR335 = hintOf334(k335s);
      var kb335 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb335) {
        if (oldR335 && newR335 && kb335.textContent.indexOf(oldR335) >= 0) {
          kb335.textContent = kb335.textContent.split(oldR335).join(newR335); /* in-place-সর্ব-উপস্থিতি (rewrites) */
          q335h.rewrites += 1;
        } else if (!newR335 && oldR335 && kb335.textContent.indexOf(oldR335) >= 0) {
          kb335.textContent = kb335.textContent.split(' · ' + oldR335).join(''); /* ক্লিয়ার-পথ (rewrites) */
          q335h.rewrites += 1;
        } else if (newR335) {
          appendHint334(k335s); /* অ্যাপেন্ড-পথ-প্রতিনিধি (q334h.appends-অভ্যন্তরে-গণনা) */
          q335h.appends += 1;
        }
      }
      q335h.sets += 1; q335h.last = 'set:' + k335s;
      return true;
    } catch (e335s) { q335h.err = String((e335s && e335s.message) || e335s); return false; }
  };
  q333h.setHint = function (k335q, h335q) { return setHint335(k335q, h335q); };
  q335h.set = function (k335q2, h335q2) { return setHint335(k335q2, h335q2); };
  q335h.hintOf = function (k335q3) { return hintOf334(k335q3); };
  q335h.line = function () { return kbdLine334(); };
  window.__hrAria335QA = q335h;
})();"""

SFS335_BLOCK = """    .hr324-kbd { display: block; margin-top: 3px; font-size: 0.52rem; color: rgba(6, 95, 70, 0.66); white-space: nowrap; }
    /* ═══════ session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন) ═══════ */
    /* hex-free (color-mix); hr335-সহাবস্থান: kbd-হিন্ট-লাইন (.hr324-kbd — hr334-এক-উৎস-লাইন)
       বেস-ব্র্যান্ড-টোন ৮% — হিন্ট-লাইন-সনাক্তযোগ্যতা (ত্রি-মোড-চক্রেও-স্থায়ী —
       hr335-setHint-পুনঃলেখনেও-অটুট — textContent-সম্পাদনা-শৈলী-অসম্পৃক্ত);
       **কেবল-রঙ (background-color)** — layout-neutral (geometry/প্যাডিং/বর্ডার-অস্পৃশ্য —
       বক্স-মডেল-অটুট — hScroll-অপরিবর্তিত); সর্ব-ব্যান্ড (media-query-শূন্য); α=০.০৮
       (পূর্ব-র‍্যাম্প ১৮/২৪/২৮/৩৪/৪২/৫০%-সহাবস্থান-অসম্পৃক্ত); transition-শূন্য (s315-নিরাপদ);
       var(--lf-brand-primary) = tokens.css-লোডেড (admin-হেড — s335-গোটচা-③-যাচাইকৃত)। */
    .hr317-tip .hr324-kbd {
      background-color: color-mix(in srgb, var(--lf-brand-primary) 8%, transparent);
    }
    /* ═══════ EOF session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন) ═══════ */"""

def main():
    applied = 0
    s = load(EJS)

    # ── P1: hr335-ব্লক (setHint-API — hr334-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি) ──
    s, d = step('P1-hr335-sethint', s,
        """  window.__hrAria334QA = q334h;
})();""",
        HR335_BLOCK)
    applied += d
    save(EJS, s)

    c = load(CSS)

    # ── P2: style.css-রোলব্যাক (গোটচা-③-সংশোধন: sfs335-ভুল-স্থানে-প্রয়োগ-প্রত্যাহার —
    #        admin-পৃষ্ঠা style.css-লোড-করে-না — এ-ব্লক style.css-এ-নিষ্ক্রিয়-ই-ছিল) ──
    BAD_SFS335 = "/* ═══════════════════ session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন) ═══════════════════ */"
    if BAD_SFS335 in c:
        i0 = c.index(BAD_SFS335)
        i1 = c.index("EOF session335", i0)
        i1 = c.index("*/", i1) + 2
        c = c[:i0] + c[i1:].lstrip('\n')
        print("  ok   P2-stylecss-rollback (ভুল-স্থান-ব্লক-অপসারণ)")
        applied += 1
    else:
        print("  skip P2-stylecss-rollback (উপস্থিত-নেই — রোলব্যাক-অপ্রয়োজনীয়)")
    save(CSS, c)

    # ── P3: sfs335-ব্লক (kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন-<style> — .hr324-kbd-বেস-রুল-সহাবস্থান) ──
    s = load(EJS)
    s, d = step('P3-sfs335-inline-tone', s,
        "    .hr324-kbd { display: block; margin-top: 3px; font-size: 0.52rem; color: rgba(6, 95, 70, 0.66); white-space: nowrap; }",
        SFS335_BLOCK)
    applied += d
    save(EJS, s)

    print(f"s335-patch: {applied} ধাপ-প্রয়োগ (idempotent-চুক্তি — দ্বি-রান-নিরাপদ)")

if __name__ == '__main__':
    main()
