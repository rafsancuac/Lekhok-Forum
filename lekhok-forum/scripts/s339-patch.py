#!/usr/bin/env python3
# s339-patch.py — session339: hr339 হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন (q337h.clearStore-UI-প্রকাশ) + sfs339 ক্লিয়ার-বাটন-স্টাইল
# [Task ID 176] PLANS session338-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (hr337-চুক্তি-প্রসারিত)
# (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; getHints-মোড-সচেতন-বিকল্প = অপ্রয়োগিত-মুক্ত; csv-চতুর্থ-মোড = সতর্ক-মূল্যায়নে-অপ্রয়োগিত; ③-স্থায়ী-স্থগিত; ④-গেটেড)
# Idempotent ×২-চুক্তি (s335/s336/s337/s338-রীতি): প্রতি-ধাপে old-বিদ্যমানে প্রয়োগ, new-বিদ্যমানে স্কিপ, উভয়ে-অনুপস্থিতে ব্যর্থতা।
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

SFS339_CSS = """    /* ═══════ session339 (sfs339 স্থায়ী-ক্লিয়ার-বাটন — admin-ইনলাইন) ═══════ */
    /* rgba-only (সর্ব-নিয়ম — হেক্স-শূন্য); hr339-সহাবস্থান: স্থায়ী-ক্লিয়ার-বাটন (.hr339-clearbtn —
       **স্বতন্ত্র-শ্রেণি** — s326-.hr326-fmt-রীতি — s324-.hr324-btn-গণনা-চুক্তি-অটুট) hr324-বাটন-পরিবার-সম্মত
       সবুজ-বেস + আর্মড-ধ্বংসাত্মক-লাল-টিন্ট (.hr339-armed — hr322/hr323/hr325-বিলোপ-রীতি — rgba(220,38,38)-পরিবার —
       দ্বি-চাপ-নিশ্চিত-সংকেত); নতুন-উপাদান-স্টাইল (s326-রীতি — geometry-সহ — বিদ্যমান-উপাদান-অস্পৃশ্য);
       সর্ব-ব্যান্ড (media-query-শূন্য); transition-কেবল-বেস-বাটন (0.12s — .hr324-btn-সমতা); MO=৪-অটুট। */
    .hr339-clearbtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font: inherit; font-size: 0.55rem; font-weight: 700; color: rgba(6, 95, 70, 0.95); background: rgba(4, 120, 87, 0.08); border: 1px solid rgba(4, 120, 87, 0.32); border-radius: 5px; padding: 3px 7px; cursor: pointer; white-space: nowrap; transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease; }
    .hr339-clearbtn:hover { background: rgba(4, 120, 87, 0.16); border-color: rgba(4, 120, 87, 0.5); }
    .hr339-clearbtn:focus-visible { outline: 2px solid rgba(5, 150, 105, 0.75); outline-offset: 1px; }
    .hr339-clearbtn.hr339-armed { background: rgba(220, 38, 38, 0.14); border-color: rgba(220, 38, 38, 0.6); color: rgba(185, 28, 28, 0.97); }
    .hr339-clearbtn.hr339-armed:hover { background: rgba(220, 38, 38, 0.22); border-color: rgba(220, 38, 38, 0.75); }
    /* ═══════ EOF session339 (sfs339 স্থায়ী-ক্লিয়ার-বাটন — admin-ইনলাইন) ═══════ */"""

HR339_JS = """  window.__hrAria338QA = q338h;

  /* সেশন ৩৩৯ (hr339): হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন — q337h.clearStore-UI-প্রকাশ (PLANS session338-নোটের প্রস্তাব-②-প্রথম-বিকল্প — hr337-চুক্তি-প্রসারিত)
     • নির্মাণ (tipRender318-মোড়ক-চেইন-পরবর্তী — hr330-পরে): গেট = সংরক্ষিত-স্টোর-অ-শূন্য (storedMap337-কী-গণনা
       ≥১ — শূন্য-স্টোরে নীরব — hr324-দর্শন) × tip317-উপস্থিত; .hr324-bar-বিদ্যমানে সেখানেই-সংযোজন, অনুপস্থিতে
       (শূন্য-ইতিহাস+স্থায়ী-স্টোর) স্বতন্ত্র-বার (.hr324-bar.hr339-bar — hr324-পরিবার); বাটন-শ্রেণি = .hr339-clearbtn
       **স্বতন্ত্র-শ্রেণি** (s326-রীতি — s324-.hr324-btn-গণনা-চুক্তি-অটুট); ডুপ-রক্ষা (পূর্ব-যাচাই)।
     • দ্বি-চাপ-নিশ্চিত (hr323-ধ্বংসাত্মক-রীতি — ৩s-স্বয়ং-নিরামড): প্রথম-চাপ = আর্মড (.hr339-armed-লাল-টিন্ট +
       লেবেল/aria-বদল — **hr332-aria-স্টেট-চুক্তি: নির্মাণ-টেমপ্লেট + জীবন্ত-সিঙ্ক-দ্বয়-বাধ্যতামূলক**); দ্বিতীয়-চাপ =
       সম্পাদন → q337h.clearStore() (hr337-এক-উৎস — চুক্তি-প্রসারিত) + টোস্ট-প্রমাণ + বাটন-লাইভ-অপসারণ।
     • জীবন্ত-সিঙ্ক (cf332/cf333-রীতি — নির্মাণ+সিঙ্ক-দ্বৈত): persist337-মোড়ক (regOrig334-চেইন-রীতি) + q337h.clearStore-
       মোড়ক — প্রতি-স্থায়ীকরণ/বিলোপ-পরবর্তী ensureClear339() — টিপ-খোলা-অবস্থায় পাবলিক-সেট/ব্যাচ-সম্পাদনাতেও বাটন-
       তাৎক্ষণিক-উপস্থিত/অপসৃত (রি-রেন্ডার-অপ্রয়োজনীয়); ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট (MO=৪ — ডম-সিঙ্ক-কেবল)।
     • চুক্তি: স্টোরেজ-মিউটেশন = q337h.clearStore-কেবল (এক-উৎস-রীতি — সরাসরি-removeItem-নিষিদ্ধ); রেজিস্ট্রি-রো-
       সংযোজন-শূন্য (ovRows330-৮-সারি-স্থায়িত্ব — পুরাতন-সুইট-সহাবস্থান — hr333-register-চুক্তি-সামঞ্জস্য);
       কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (ধ্বংসাত্মক-ক্রিয়া-সতর্কতা + নথিভুক্ত-নয়-বলে-শর্টকাট-নেই — register-'W'+
       সুইট-বিবর্তন = পরবর্তী-রাউন্ডে-মূল্যায়ন); hr338-diff/hr337-restored/hr336-batched-শ্রেণি-অস্পৃশ্য (একক-দায়িত্ব —
       স্টোর-কেবল); s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য।
     • QA-হুক __hrAria339QA {clicks, arms, disarms, clears, last, btn(), armed(), wipe(), sync(), store(), err}
       — সারি-শূন্যে-ও-সংজ্ঞায়িত; s338/s337/s336/s335/s334/s333-হুক-সহাবস্থান-অটুট। */
  var q339h = { clicks: 0, arms: 0, disarms: 0, clears: 0, last: '', err: '' };
  var armed339 = false;
  var tmr339 = null;
  var clearBtn339 = function () { return tip317 ? tip317.querySelector('.hr339-clearbtn') : null; };
  var storeN339 = function () {
    try {
      var m339s = storedMap337(), n339s = 0;
      for (var c339s in m339s) { if (Object.prototype.hasOwnProperty.call(m339s, c339s)) n339s += 1; }
      return n339s;
    } catch (e339s) { q339h.err = String((e339s && e339s.message) || e339s); return 0; }
  };
  var label339 = function (b339l, on339l) {
    var sp339l = b339l.querySelector('.hr339-lbl');
    if (on339l) {
      if (sp339l) sp339l.textContent = ' নিশ্চিত: আবার চাপুন';
      b339l.setAttribute('aria-label', 'নিশ্চিত করুন — আবার চাপলে স্থায়ী-হিন্ট-স্টোর মুছে যাবে');
    } else {
      if (sp339l) sp339l.textContent = ' স্থায়ী মুছুন';
      b339l.setAttribute('aria-label', 'স্থায়ী-হিন্ট-স্টোর মুছুন (দ্বি-চাপ-নিশ্চিত)');
    }
  };
  var disarm339 = function (silent339) {
    try {
      var b339d = clearBtn339();
      if (armed339) {
        armed339 = false;
        if (b339d) { b339d.classList.remove('hr339-armed'); label339(b339d, false); }
        if (!silent339) { q339h.disarms += 1; q339h.last = 'disarm'; }
      }
      if (tmr339) { clearTimeout(tmr339); tmr339 = null; }
    } catch (e339d) { q339h.err = String((e339d && e339d.message) || e339d); }
  };
  var ensureClear339 = function () {
    try {
      if (!tip317) return;
      var b339e = clearBtn339();
      if (storeN339() === 0) {
        if (b339e) {
          var bar339r = b339e.parentNode;
          if (b339e.remove) b339e.remove(); else if (bar339r) bar339r.removeChild(b339e);
          if (bar339r && bar339r.classList && bar339r.classList.contains('hr339-bar') && !bar339r.firstChild && bar339r.parentNode) bar339r.parentNode.removeChild(bar339r);
          q339h.last = 'sync:off';
        }
        return;
      }
      if (b339e) return; /* ডুপ-রক্ষা */
      var bar339 = tip317.querySelector('.hr324-bar');
      if (!bar339) {
        bar339 = document.createElement('span');
        bar339.className = 'hr324-bar hr339-bar'; /* স্বতন্ত্র-বার (শূন্য-ইতিহাস+স্থায়ী-স্টোর-পথ — hr324-পরিবার) */
        tip317.appendChild(bar339);
      }
      var bc339 = document.createElement('button');
      bc339.type = 'button';
      bc339.className = 'hr339-clearbtn'; /* স্বতন্ত্র-শ্রেণি (s326-রীতি — s324-.hr324-btn-গণনা-চুক্তি-অটুট) */
      bc339.setAttribute('aria-label', 'স্থায়ী-হিন্ট-স্টোর মুছুন (দ্বি-চাপ-নিশ্চিত)');
      var ic339 = document.createElement('i'); ic339.className = 'fas fa-trash'; ic339.setAttribute('aria-hidden', 'true');
      bc339.appendChild(ic339);
      var sp339 = document.createElement('span'); sp339.className = 'hr339-lbl'; sp339.textContent = ' স্থায়ী মুছুন';
      bc339.appendChild(sp339);
      bc339.addEventListener('click', function (e339c) {
        e339c.preventDefault(); e339c.stopPropagation();
        q339h.clicks += 1;
        if (armed339) { wipe339(bc339); return; }
        armed339 = true; q339h.arms += 1; q339h.last = 'arm';
        bc339.classList.add('hr339-armed');
        label339(bc339, true);
        if (tmr339) clearTimeout(tmr339);
        tmr339 = setTimeout(function () { disarm339(false); }, 3000); /* hr323-৩s-স্বয়ং-নিরামড-রীতি */
      });
      bar339.appendChild(bc339);
      q339h.last = 'sync:on';
    } catch (e339e) { q339h.err = String((e339e && e339e.message) || e339e); }
  };
  var wipe339 = function (b339w) {
    try {
      var ok339w = q337h.clearStore(); /* hr337-এক-উৎস — clearStore-মোড়ক-জীবন্ত-সিঙ্ক-অন্তর্নির্মিত */
      if (ok339w) {
        q339h.clears += 1; q339h.last = 'wipe';
        disarm339(true);
        showToast(true, 'স্থায়ী-হিন্ট-স্টোর মুছে ফেলা হয়েছে — পরবর্তী রিলোডে ডিফল্ট ফেরবে');
      } else {
        showToast(false, 'স্থায়ী-স্টোর মুছা যায়নি');
      }
      return ok339w;
    } catch (e339w) { q339h.err = String((e339w && e339w.message) || e339w); return false; }
  };
  var trOrig339 = tipRender318;
  tipRender318 = function (k339t) {
    trOrig339(k339t);
    try { ensureClear339(); } catch (e339t) { q339h.err = String((e339t && e339t.message) || e339t); }
  };
  var persistOrig339 = persist337; /* regOrig334-চেইন-রীতি — প্রতি-সফল-স্থায়ীকরণ-পরবর্তী-জীবন্ত-সিঙ্ক */
  persist337 = function () {
    var r339p = persistOrig339();
    try { ensureClear339(); } catch (e339p) { q339h.err = String((e339p && e339p.message) || e339p); }
    return r339p;
  };
  var clearOrig339 = q337h.clearStore; /* hr337-চুক্তি-প্রসারিত — সর্ব-ক্লিয়ার-পথে-জীবন্ত-সিঙ্ক */
  q337h.clearStore = function () {
    var ok339c = clearOrig339();
    try { if (ok339c) ensureClear339(); } catch (e339c) { q339h.err = String((e339c && e339c.message) || e339c); }
    return ok339c;
  };
  q339h.btn = function () { return !!clearBtn339(); };
  q339h.armed = function () { return armed339; };
  q339h.wipe = function () { return wipe339(null); };
  q339h.sync = function () { ensureClear339(); return q339h.btn(); };
  q339h.store = function () { return storeN339(); };
  window.__hrAria339QA = q339h;
})();"""

def main():
    s = load(EJS)
    n = 0
    # P1: hr339-JS (session338-QA-হুক-পরবর্তী — IIFE-সমাপ্তি-পূর্ব — সহাবস্থান-রীতি)
    s, k1 = step('P1 hr339-JS (window.__hrAria338QA = q338h; পরবর্তী)', s,
                 "  window.__hrAria338QA = q338h;\n})();",
                 HR339_JS)
    n += k1
    # P2: sfs339-CSS (cascade-অবস্থান session338-ব্লক-পরে)
    s, k2 = step('P2 sfs339-CSS (EOF session338-পরবর্তী)', s,
                 "    /* ═══════ EOF session338 (sfs338 ডিফ-পেন্ডিং-kbd-টোন — admin-ইনলাইন) ═══════ */",
                 "    /* ═══════ EOF session338 (sfs338 ডিফ-পেন্ডিং-kbd-টোন — admin-ইনলাইন) ═══════ */\n" + SFS339_CSS)
    n += k2
    save(EJS, s)
    print(f"s339-patch: {n} ধাপ-প্রয়োগ (idempotent-রানে ০-প্রত্যাশিত)")

if __name__ == '__main__':
    main()
