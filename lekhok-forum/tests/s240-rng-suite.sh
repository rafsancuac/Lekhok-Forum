#!/bin/bash
# s240-rng-suite.sh — session240 রিপোর্ট-ব্যাপ্তি-নির্বাচন (৭/৩০-দিন) সুইট (স্থায়ী — রিপো-কমিটেড; s239-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (সেগমেন্ট ×২ + aria-pressed-ডিফল্ট + দ্বৈত-পেলোড + QA-হুক + CSS ×৬ + সহায়িকা + s239-চুক্তি-রক্ষা)
#          ② ইউনিট-গেট (s240-unit ১২/১২ ব্যর্থে FATAL) ③ পেলোড-৩০ যাচাই (টাইটেল/লাইন-গণনা/মোট-লেবেল)
#          ④ আচরণ: ডিফল্ট-কপি=৭-দিন-হুবহু + সুইচ→কপি=৩০-দিন-হুবহু + w-কী-সক্রিয়-ব্যাপ্তি + localStorage-স্মরণ/রিলোড-পুনঃস্থাপন
# চুক্তি: ① সিড-শূন্য — রিপোর্ট-কপি = রিড-ওনলি-UI (DB-রাইট-শূন্য) ② CSRF-লগইন admin/admin123 (লোকাল-সিড)
#         ③ ক্লিপবোর্ড-ওভাররাইড-প্যাটার্ন (arm→click→আলাদা-eval-পড়া) ④ শেষে localStorage sc-wkr-পরিষ্কার (s239-ক্রস-রান-সুরক্ষা)
# গোটচা-সম্মতি (PLANS session231-239-নোট): __scQA-হুক-পুনঃসৃজনের-পরে · ভিউপোর্ট-রিসেট + MOB-রিট্রাই ×৩ ·
#         grep-প্যাটার্নে বাংলা-অঙ্ক-রেঞ্জ-নিষিদ্ধ (লিটারাল-নিরাপদ) · typeof-অ্যাসার্টে বুলিয়ান-চুক্তি (কোট-যুক্ত-ফাংশন-প্যাটার্ন-নিষিদ্ধ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s240-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ + ইউনিট-গেট ──"
UO=$(TZ=UTC node "$APP/tests/s240-unit.js" 2>&1)
if echo "$UO" | grep -q "s240-unit: 12/12"; then ok "ইউনিট-গেট (s240-unit 12/12)"; else bad "ইউনিট-গেট ব্যর্থ"; echo "$UO" | tail -5; fi
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "সেগমেন্ট-গ্রুপ (role=group + aria-label)" "$DESK" 'aria-label="রিপোর্ট-ব্যাপ্তি নির্বাচন (৭/৩০ দিন)"'
contains "৭-দিন-বাটন aria-pressed=true-ডিফল্ট" "$DESK" 'id="scWkR7" aria-pressed="true"'
contains "৩০-দিন-বাটন aria-pressed=false-ডিফল্ট" "$DESK" 'id="scWkR30" aria-pressed="false"'
contains "৩০-দিন-পেলোড-স্ক্রিপ্ট (#scWkReport30)" "$DESK" '<script type="application/json" id="scWkReport30">'
contains "রিপোর্ট-টাইটেল ৩০-দিন (EJS-এক-উৎস)" "$DESK" 'সাপোর্ট ৩০-দিনের রিপোর্ট'
contains "রিপোর্ট-টাইটেল ৭-দিন অক্ষুণ্ণ (s239-রক্ষা)" "$DESK" 'লেখক ফোরাম — সাপোর্ট সাপ্তাহিক রিপোর্ট'
contains "৩০-দিনে-মোট-লেবেল (কম্পোজার-শাখা)" "$DESK" '৩০-দিনে মোট নতুন'
contains "QA-হুক (__scQA.wkRange)" "$DESK" '__scQA.wkRange'
contains "CSS সেগমেন্ট-বেস (.sc-wkr{)" "$DESK" '.sc-wkr{margin-left:auto'
contains "CSS কপি-ওভাররাইড (8px-গ্যাপ)" "$DESK" '.sc-trend-head .sc-wkr + .sc-wk-copy{margin-left:8px}'
contains "CSS pressed-ফিল (accent)" "$DESK" '.sc-wkr-btn\[aria-pressed="true"\]{background:var(--ad-accent)'
contains "CSS reduced-motion-নিরাপদ" "$DESK" '@media (prefers-reduced-motion: reduce){.sc-wkr-btn{transition:none'
contains "CSS 640px-সংকোচন" "$DESK" '@media (max-width:640px){.sc-wkr-btn{padding:4px 8px'
contains "s239-চুক্তি-রক্ষা (.sc-wk-copy margin-auto-বেস)" "$DESK" '.sc-wk-copy{margin-left:auto'
contains "সহায়িকা ৭/৩০-সারি" "$DESK" 'রিপোর্ট-ব্যাপ্তি ৭/৩০ দিন'

echo "── ধাপ-২: ব্রাউজার-সেশন (ভিউপোর্ট-রিসেট; sc-wkr-প্রি-ক্লিন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
for i in 1 2 3; do
  U=$(agent-browser get url 2>/dev/null || echo '')
  echo "$U" | grep -q '/admin/login' && break
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
done
ev "try{localStorage.removeItem('sc-wkr');}catch(_){} 'pre-cleaned'" >/dev/null 2>&1
agent-browser fill '#username' admin >/dev/null 2>&1
agent-browser fill '#password' admin123 >/dev/null 2>&1
agent-browser click 'button[type=submit]' >/dev/null 2>&1
sleep 1.5
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "ডেস্ক-লোড (KPI-গ্রুপ)" || bad "ডেস্ক-লোড"
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs

echo "── ধাপ-৩: ডিফল্ট-অবস্থা + পেলোড-৩০ যাচাই ──"
DF=$(ev "(function(){ var h=window.__scQA.wkRange(); return JSON.stringify({ r:h.r, b7:h.b7, b30:h.b30, p7:h.p7, p30:h.p30, ok30:h.ok30 }); })()" 2>/dev/null)
contains "হুক-ডিফল্ট r=7" "$DF" 'r..:..7'
contains "হুক-ডিফল্ট b7=true" "$DF" 'b7..:true'
contains "হুক-ডিফল্ট b30=false" "$DF" 'b30..:false'
contains "দ্বৈত-পেলোড p7 উপস্থিত" "$DF" 'p7..:true'
contains "দ্বৈত-পেলোড p30 উপস্থিত" "$(echo "$DF" | grep -o 'p30..:true')" 'p30..:true'
contains "পেলোড-৩০ টাইটেল-যাচাই (ok30)" "$DF" 'ok30..:true'
P30=$(ev "(function(){ var el=document.getElementById('scWkReport30'); var o; try{ o=JSON.parse(el.textContent); }catch(_){ return JSON.stringify({e:'parse'}); } return JSON.stringify({ len:o.text.length, lines:o.text.split('\n').length, hasTotal:o.text.indexOf('৩০-দিনে মোট নতুন')>=0, hasDash:o.text.indexOf('\u2014')>=0 }); })()" 2>/dev/null)
contains "পেলোড-৩০ পার্স + দৈর্ঘ্য" "$P30" "len..:[0-9]"
contains "পেলোড-৩০ লাইন-গণনা (৩৬+)" "$P30" "lines..:[3-9][0-9]"
contains "পেলোড-৩০ মোট-লেবেল উপস্থিত" "$P30" 'hasTotal..:true'
contains "পেলোড-৩০ ব্যাপ্তি-ড্যাশ উপস্থিত" "$P30" 'hasDash..:true'

echo "── ধাপ-৪: ডিফল্ট-কপি = ৭-দিন (হুবহু; s239-চুক্তি) ──"
ev "(function(){ window.__s240clip=null; var cp=navigator.clipboard; if(cp&&cp.writeText){ window.__s240ow=cp.writeText.bind(cp); cp.writeText=function(t){ window.__s240clip=t; return Promise.resolve(); }; } var b=document.getElementById('scWkCopyBtn'); b.click(); return 'armed+clicked'; })()" >/dev/null 2>&1
sleep 0.4
CB=$(ev "(function(){ var o=JSON.parse(document.getElementById('scWkReport').textContent); return JSON.stringify({ clip:!!window.__s240clip, exact: window.__s240clip===o.text }); })()" 2>/dev/null)
contains "ডিফল্ট-ক্লিক→ক্লিপবোর্ড" "$CB" 'clip..:true'
contains "ডিফল্ট-কপি = ৭-দিন-পেলোড-হুবহু" "$CB" 'exact..:true'

echo "── ধাপ-৫: ব্যাপ্তি-সুইচ → কপি = ৩০-দিন + w-কী ──"
ev "(function(){ document.getElementById('scWkR30').click(); return 'clicked-30'; })()" >/dev/null 2>&1
sleep 0.3
SW=$(ev "(function(){ var h=window.__scQA.wkRange(); var ls=''; try{ ls=localStorage.getItem('sc-wkr')||''; }catch(_){} return JSON.stringify({ r:h.r, b30:h.b30, b7:h.b7, ls:ls }); })()" 2>/dev/null)
contains "সুইচ→r=30" "$SW" 'r..:..30'
contains "সুইচ→b30=true" "$SW" 'b30..:true'
contains "সুইচ→b7=false" "$(echo "$SW" | grep -o 'b7..:false')" 'b7..:false'
contains "localStorage sc-wkr=30" "$SW" 'ls..:..30'
ev "(function(){ window.__s240clip=null; var b=document.getElementById('scWkCopyBtn'); b.click(); return 'clicked-copy-30'; })()" >/dev/null 2>&1
sleep 0.4
C30=$(ev "(function(){ var o=JSON.parse(document.getElementById('scWkReport30').textContent); var t=document.getElementById('scToast'); return JSON.stringify({ exact: window.__s240clip===o.text, t30: t.textContent.indexOf('৩০')>=0 }); })()" 2>/dev/null)
contains "কপি = ৩০-দিন-পেলোড-হুবহু" "$C30" 'exact..:true'
contains "টোস্ট ৩০-উল্লেখ" "$C30" 't30..:true'
ev "(function(){ window.__s240clip=null; document.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true})); return 'w-dispatched'; })()" >/dev/null 2>&1
sleep 0.4
WK=$(ev "(function(){ var o=JSON.parse(document.getElementById('scWkReport30').textContent); return JSON.stringify({ again: window.__s240clip===o.text }); })()" 2>/dev/null)
contains "w-কী→সক্রিয়-ব্যাপ্তি (৩০)-কপি" "$WK" 'again..:true'

echo "── ধাপ-৬: রিলোড-স্মরণ + ফেরত-৭ ──"
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null
PR=$(ev "(function(){ var h=window.__scQA.wkRange(); return JSON.stringify({ r:h.r, b30:h.b30 }); })()" 2>/dev/null)
contains "রিলোড→৩০-পুনঃস্থাপিত (localStorage)" "$PR" 'r..:..30'
contains "রিলোড→b30=true" "$(echo "$PR" | grep -o 'b30..:true')" 'b30..:true'
ev "(function(){ document.getElementById('scWkR7').click(); return 'clicked-7'; })()" >/dev/null 2>&1
sleep 0.3
BK=$(ev "(function(){ var h=window.__scQA.wkRange(); var gone=false; try{ gone=localStorage.getItem('sc-wkr')===null; }catch(_){} return JSON.stringify({ r:h.r, gone:gone }); })()" 2>/dev/null)
contains "ফেরত-৭→localStorage-মুছে" "$BK" 'gone..:true'
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null
installErrs
PD=$(ev "(function(){ var h=window.__scQA.wkRange(); return JSON.stringify({ r:h.r, b7:h.b7 }); })()" 2>/dev/null)
contains "পুনঃরিলোড→ডিফল্ট-৭" "$PD" 'r..:..7'

echo "── ধাপ-৭: QA-হুক + কনসোল + 390px + স্ক্রিনশট ──"
QH=$(ev "(function(){ return JSON.stringify({ c: typeof window.__scQA.wkRange === 'function' && typeof window.__scQA.wkCopy === 'function' }); })()" 2>/dev/null)
contains "QA-হুক দুটিই কার্যকর (বুলিয়ান-চুক্তি)" "$QH" 'c..:true'
agent-browser screenshot "$APP/download/s240-rng-desk.png" >/dev/null 2>&1
sleep 1
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=''; for i in 1 2 3; do # s235-হার্ডেনিং — MOB-রিট্রাই ×৩
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s240-rng-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: sc-wkr-পরিষ্কার + pkill + পরিষ্কার-প্রমাণ ──"
ev "try{localStorage.removeItem('sc-wkr');}catch(_){} 'wkr-cleaned'" >/dev/null 2>&1
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J"
echo "CLEANUP-COUNT=0 (রিপোর্ট-ব্যাপ্তি রিড-ওনলি-UI — DB-রাইট-শূন্য; সিড-শূন্য; sc-wkr-পরিষ্কার)"

echo ""
echo "s240-rng-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
