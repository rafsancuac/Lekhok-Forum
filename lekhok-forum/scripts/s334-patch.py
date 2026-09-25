#!/usr/bin/env python3
# s334-patch.py — session334: hr334 kbd-হিন্ট-এক-উৎস (smarty-সমাপ্তি) + sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি
# [Task ID 171] PLANS session333-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড)
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

def main():
    applied = 0
    s = load(EJS)

    # ── P1: ovRows330-রেজিস্ট্রি-তৃতীয়-উপাদান (kbd-হিন্ট — F='{fmt}'-টেমপ্লেট) ──
    s, d = step('P1-registry-hint', s,
        """  var ovRows330 = [
    ['E', 'কপি-ইতিহাস স্ট্রিপ কপি'],
    ['D', 'কপি-ইতিহাস ডাউনলোড (.txt)'],
    ['X', 'পয়েন্টার-সারি বিলোপ'],
    ['F', 'রপ্তাই-বিন্যাস চক্র (rich ⇄ key ⇄ json)'],
    ['P', 'রপ্তাই-প্রিভিউ টগল'],
    ['C', 'প্রিভিউ কপি'],
    ['S', 'প্রিভিউ সংরক্ষণ (.txt)'],
    ['?', 'এই সহায়িকা (টগল)']
  ];""",
        """  var ovRows330 = [ /* hr334: তৃতীয়-উপাদান = kbd-হিন্ট (এক-উৎস — F='{fmt}'-মোড-সচেতন-টেমপ্লেট) */
    ['E', 'কপি-ইতিহাস স্ট্রিপ কপি', 'E = স্ট্রিপ কপি'],
    ['D', 'কপি-ইতিহাস ডাউনলোড (.txt)', 'D = ডাউনলোড'],
    ['X', 'পয়েন্টার-সারি বিলোপ', 'X = পয়েন্টার-সারি বিলোপ'],
    ['F', 'রপ্তাই-বিন্যাস চক্র (rich ⇄ key ⇄ json)', 'F = বিন্যাস ({fmt})'],
    ['P', 'রপ্তাই-প্রিভিউ টগল', 'P = প্রিভিউ'],
    ['C', 'প্রিভিউ কপি', 'C = প্রিভিউ কপি'],
    ['S', 'প্রিভিউ সংরক্ষণ (.txt)', 'S = প্রিভিউ সংরক্ষণ'],
    ['?', 'এই সহায়িকা (টগল)', '? = সহায়িকা']
  ];""")
    applied += d

    # ── P2: s325 tipRender-পরিবার X-সাইট → appendHint334 ──
    s, d = step('P2-x325', s,
        """        var kb325 = tip317.querySelector('.hr324-kbd');
        if (kb325 && kb325.textContent.indexOf('X = পয়েন্টার-সারি বিলোপ') < 0) {
          kb325.textContent = kb325.textContent + ' · X = পয়েন্টার-সারি বিলোপ';
        }""",
        """        appendHint334('X'); /* hr334: হিন্ট-এক-উৎস (ovRows330-উদ্ভূত — গার্ড+গণনা-অন্তর্নির্মিত) */""")
    applied += d

    # ── P3: s326 cycleFmt326-কোর kbd-পুনঃলেখন → kbdLine334 (রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-লাইন) ──
    s, d = step('P3-rewrite326', s,
        """      var kb326 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb326) kb326.textContent = 'কীবোর্ড (কপি-বাটন-ফোকাসে): E = স্ট্রিপ কপি · D = ডাউনলোড · X = পয়েন্টার-সারি বিলোপ · F = বিন্যাস (' + fmtLabel331(mode326) + ')';""",
        """      var kb326 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb326) kb326.textContent = kbdLine334(); /* hr334: kbd-লাইন-এক-উৎস (রেজিস্ট্রি-নির্মিত — সর্ব-হিন্ট-সমৃদ্ধ) */""")
    applied += d

    # ── P4: s326 tipRender-পরিবার F-সাইট → appendHint334 ──
    s, d = step('P4-f326', s,
        """        var kb326b = tip317.querySelector('.hr324-kbd');
        if (kb326b && kb326b.textContent.indexOf('F = বিন্যাস') < 0) {
          kb326b.textContent = kb326b.textContent + ' · F = বিন্যাস (' + fmtLabel331(mode326) + ')';
        }""",
        """        appendHint334('F'); /* hr334: হিন্ট-এক-উৎস ({fmt}-মোড-সচেতন) */""")
    applied += d

    # ── P5: s327 cf327 P-সাইট → appendHint334 ──
    s, d = step('P5-p327c', s,
        """      var kb327 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb327 && kb327.textContent.indexOf('P = প্রিভিউ') < 0) kb327.textContent = kb327.textContent + ' · P = প্রিভিউ';""",
        """      appendHint334('P'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P6: s327 tipRender-পরিবার P-সাইট → appendHint334 ──
    s, d = step('P6-p327t', s,
        """        var kb327b = tip317.querySelector('.hr324-kbd');
        if (kb327b && kb327b.textContent.indexOf('P = প্রিভিউ') < 0) {
          kb327b.textContent = kb327b.textContent + ' · P = প্রিভিউ';
        }""",
        """        appendHint334('P'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P7: s328 cf327w C-সাইট → appendHint334 ──
    s, d = step('P7-c328c', s,
        """      var kb328 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb328 && kb328.textContent.indexOf('C = প্রিভিউ কপি') < 0) kb328.textContent = kb328.textContent + ' · C = প্রিভিউ কপি';""",
        """      appendHint334('C'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P8: s328 tipRender-পরিবার C-সাইট → appendHint334 ──
    s, d = step('P8-c328t', s,
        """        var kb328b = tip317.querySelector('.hr324-kbd');
        if (kb328b && kb328b.textContent.indexOf('C = প্রিভিউ কপি') < 0) {
          kb328b.textContent = kb328b.textContent + ' · C = প্রিভিউ কপি';
        }""",
        """        appendHint334('C'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P9: s329 cf329 S-সাইট → appendHint334 ──
    s, d = step('P9-s329c', s,
        """      var kb329 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb329 && kb329.textContent.indexOf('S = প্রিভিউ সংরক্ষণ') < 0) kb329.textContent = kb329.textContent + ' · S = প্রিভিউ সংরক্ষণ';""",
        """      appendHint334('S'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P10: s329 tipRender-পরিবার S-সাইট → appendHint334 ──
    s, d = step('P10-s329t', s,
        """        var kb329b = tip317.querySelector('.hr324-kbd');
        if (kb329b && kb329b.textContent.indexOf('S = প্রিভিউ সংরক্ষণ') < 0) {
          kb329b.textContent = kb329b.textContent + ' · S = প্রিভিউ সংরক্ষণ';
        }""",
        """        appendHint334('S'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P11: s330 cf330 ?-সাইট → appendHint334 ──
    s, d = step('P11-q330c', s,
        """      var kb330 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (kb330 && kb330.textContent.indexOf('? = সহায়িকা') < 0) kb330.textContent = kb330.textContent + ' · ? = সহায়িকা';""",
        """      appendHint334('?'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P12: s330 tipRender-পরিবার ?-সাইট → appendHint334 ──
    s, d = step('P12-q330t', s,
        """        var kb330b = tip317.querySelector('.hr324-kbd');
        if (kb330b && kb330b.textContent.indexOf('? = সহায়িকা') < 0) {
          kb330b.textContent = kb330b.textContent + ' · ? = সহায়িকা';
        }""",
        """        appendHint334('?'); /* hr334: হিন্ট-এক-উৎস */""")
    applied += d

    # ── P13: hr334-ব্লক (hintOf334 + appendHint334 + kbdLine334 + register-দ্বি-সাইট-মোড়ক + QA-হুক) ──
    hr334 = """  window.__hrAria333QA = q333h;

  /* সেশন ৩৩৪ (hr334): kbd-হিন্ট-এক-উৎস — smarty-সমাপ্তি (PLANS session333-নোটের প্রস্তাব-②-প্রথম-বিকল্প)
     • রেজিস্ট্রি-তৃতীয়-উপাদান: ovRows330-প্রতি-সারির [2] = kbd-হিন্ট-পাঠ (F-সারি '{fmt}'-টেমপ্লেট =
       মোড-সচেতন — hintOf334-কল-টাইম split-join-সর্ব-উপস্থিতি — s333-গোটচা-②-রীতি); ওভারলে-বর্ণনা
       [1]-অস্পৃশ্য (mkLi330/rebuildOv330/ovDsText330-অটুট); স্ট্যাটিক-বেস-লাইন (s324) অস্পৃশ্য।
     • hintOf334: রেজিস্ট্রি-কী-লুকআপ → হিন্ট-পাঠ (অনুপস্থিতে ''); appendHint334: এক-উৎস-অ্যাপেন্ডার
       (.hr324-kbd-লুকআপ + indexOf-ডুপ-রক্ষা + appends/dupSkips-গণনা — সর্ব-১০-অ্যাপেন্ড-সাইট
       এ-ফাংশনে পুনঃনির্দেশিত — মোড়ক-চেইন-গঠন-অস্পৃশ্য); kbdLine334: রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-
       লাইন (উপসর্গ + সারি-ক্রম E→D→X→F→P→C→S→? — পুরাতন-চেইন-ক্রম-সমতা) — cycleFmt326-
       পুনঃলেখন-সাইট এক-উৎস।
     • নিবন্ধন-দ্বি-সাইট: q333h.register-মোড়ক (regOrig334 — চেইন-রীতি) — register(k, d, h)-তৃতীয়-
       ঐচ্ছিক-প্যারামিটার h-সহ নিবন্ধনে ওভারলে-সারি + kbd-হিন্ট-উভয়-স্বয়ংক্রিয় (smarty-সমাপ্তি);
       h-বিহীন-নিবন্ধন = পুরাতন-আচরণ-অটুট (s333-সুইট-সামঞ্জস্য)।
     • QA-হুক __hrAria334QA {appends, dupSkips, dualRegs, last, hintOf(), append(), line(), err}
       — সারি-শূন্যে-ও-সংজ্ঞায়িত। */
  var q334h = { appends: 0, dupSkips: 0, dualRegs: 0, last: '', err: '' };
  var hintOf334 = function (k334) {
    try {
      for (var i334 = 0; i334 < ovRows330.length; i334++) {
        if (ovRows330[i334][0] === k334 && ovRows330[i334].length > 2 && ovRows330[i334][2]) {
          var h334 = String(ovRows330[i334][2]);
          if (h334.indexOf('{fmt}') >= 0) h334 = h334.split('{fmt}').join(fmtLabel331(mode326)); /* মোড-সচেতন-এক-উৎস */
          return h334;
        }
      }
    } catch (e334h) { q334h.err = String((e334h && e334h.message) || e334h); }
    return '';
  };
  var appendHint334 = function (k334a) {
    try {
      var h334a = hintOf334(k334a);
      if (!h334a) return false;
      var kb334 = tip317 ? tip317.querySelector('.hr324-kbd') : null;
      if (!kb334) return false;
      if (kb334.textContent.indexOf(h334a) >= 0) { q334h.dupSkips += 1; return false; } /* ডুপ-রক্ষা-এক-উৎস */
      kb334.textContent = kb334.textContent + ' · ' + h334a;
      q334h.appends += 1; q334h.last = 'append:' + k334a;
      return true;
    } catch (e334a) { q334h.err = String((e334a && e334a.message) || e334a); return false; }
  };
  var kbdLine334 = function () {
    try {
      var p334 = [];
      for (var i334b = 0; i334b < ovRows330.length; i334b++) {
        var h334b = hintOf334(ovRows330[i334b][0]);
        if (h334b) p334.push(h334b);
      }
      return 'কীবোর্ড (কপি-বাটন-ফোকাসে): ' + p334.join(' · ');
    } catch (e334b) { q334h.err = String((e334b && e334b.message) || e334b); return ''; }
  };
  var regOrig334 = q333h.register;
  q333h.register = function (k334g, d334g, h334g) {
    var ok334 = regOrig334(k334g, d334g);
    try {
      if (ok334 && h334g !== undefined && h334g !== null && String(h334g) !== '') {
        for (var i334g = 0; i334g < ovRows330.length; i334g++) {
          if (ovRows330[i334g][0] === k334g) { ovRows330[i334g][2] = String(h334g); break; }
        }
        appendHint334(k334g); /* নিবন্ধন = হিন্ট+ওভারলে-দ্বি-সাইট-স্বয়ংক্রিয় (smarty-সমাপ্তি) */
        q334h.dualRegs += 1; q334h.last = 'dual:' + k334g;
      }
    } catch (e334g) { q334h.err = String((e334g && e334g.message) || e334g); }
    return ok334;
  };
  q334h.hintOf = function (k334q) { return hintOf334(k334q); };
  q334h.append = function (k334q2) { return appendHint334(k334q2); };
  q334h.line = function () { return kbdLine334(); };
  window.__hrAria334QA = q334h;
})();"""
    s, d = step('P13-hr334-block', s, "  window.__hrAria333QA = q333h;\n})();", hr334)
    applied += d
    save(EJS, s)

    # ── P14: style.css session334-ব্লক (sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি — কেবল-সংযোজন) ──
    c = load(CSS)
    sfs334 = """/* ═══════════════════ session334 (sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি) ═══════════════════ */
/* hex-free (color-mix — guard:design-চুক্তি); s333-পরবর্তী গেট-প্যারিটি-সমাপ্তি: মোবাইল-ব্যান্ডে
   (≤৬৪০px) ব্যাজ-বর্ডার ট্যাপ-গেটে ৩৪%-নরম (s326 — ইচ্ছাকৃত-নরম-রুল), কিন্তু keynav-গেট
   বেস-৪২%-এই-থাকে (s318-মূল-রুল — গেট-অসমতা — parity-নীতি-ব্যতিক্রম); এ-ব্লকে keynav-গেটেও
   ৩৪% — ট্যাপ×keynav-উভয়-গেট-সম-মান (parity-নীতি-সমাপ্তি — ট্যাপ-রুল-অস্পৃশ্য — কেবল-সংযোজন);
   **কেবল-≤৬৪০px** (s326-ব্যান্ড-সমতা — ডেস্ক s318-বেস-৪২% + s332-চিপ-সহাবস্থান-৫০%-অটুট);
   **কেবল-রঙ (border-color)** — layout-neutral (ব্যাজ-geometry/গাটার-অস্পৃশ্য — s318-অবস্থান-অটুট);
   ব্যাজ-transition-তালিকায় border-color-নেই → পরিবর্তন-তাৎক্ষণিক (কম্পোজিটর-চাপ-শূন্য —
   s315-ফ্রিজ-গণিত-নিরাপদ); MO-অবর্জন-চুক্তি-অটুট; DOM-ক্রম-নির্ভরতা-অটুট; চিপ-সহাবস্থান-শর্ত-নেই
   (গেট-প্যারিটি = ব্যাজ-নিজস্ব — pair/probe-ব্যান্ড-অসম্পৃক্ত — s333-bdiff-স্কোপিং-সামঞ্জস্য)। */
@media (max-width: 640px) {
  .sfs292-phone[data-sfs314-focus] .sfs318-posbadge[data-sfs318-on] {
    border-color: color-mix(in srgb, var(--lf-brand-primary) 34%, transparent);
  }
}
/* ═══════════════════ EOF session334 (sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি) ═══════════════════ */"""
    c, d = step('P14-sfs334-block', c, "/* ═══════════════════ EOF session333 (sfs333 চিপ-প্যারি-পটভূমি-ধার) ═══════════════════ */",
                "/* ═══════════════════ EOF session333 (sfs333 চিপ-প্যারি-পটভূমি-ধার) ═══════════════════ */\n" + sfs334)
    applied += d
    save(CSS, c)
    print(f"s334-patch: {applied} ধাপ-প্রয়োগ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
