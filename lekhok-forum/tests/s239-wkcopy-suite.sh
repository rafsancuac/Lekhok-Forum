#!/bin/bash
# s239-wkcopy-suite.sh — session239 সপ্তাহ-রিপোর্ট-কপি সুইট (স্থায়ী — রিপো-কমিটেড; s238-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (বাটন #scWkCopyBtn + পেলোড #scWkReport-JSON + w-বাইন্ডিং + সহায়িকা-সারি + QA-হুক + CSS ×৫)
#          ② আচরণ: ক্লিক→ক্লিপবোর্ড (ওভাররাইড) + পেলোড-হুবহু-মিল + টোস্ট + ok-ফিডব্যাক (আইকন-সোয়াপ→রিসেট)
#          ③ w-কী→কপি + typing-গার্ড (সার্চ-ইনপুট-টার্গেটে ব্লক) + কনসোল + 390px + স্ক্রিনশট ×২
# চুক্তি: ① সিড-শূন্য — রিপোর্ট-কপি = রিড-ওনলি-UI (DB-রাইট-শূন্য; খালি-ডেস্কেও-গণনা-রেন্ডার) ② CSRF-লগইন admin/admin123 (লোকাল-সিড)
#         ③ ক্লিপবোর্ড-ওভাররাইড-প্যাটার্ন (s237-চুক্তি: arm→click→আলাদা-eval-পড়া — মাইক্রোটাস্ক-ফ্লাশ-সীমানা)
# গোটচা-সম্মতি (PLANS session231-238-নোট): __scQA-হুক-পুনঃসৃজনের-পরে · ভিউপোর্ট-রিসেট + MOB-রিট্রাই ×৩ ·
#         grep-প্যাটার্নে বাংলা-অঙ্ক-রেঞ্জ-নিষিদ্ধ · dispatchEvent-রিটার্ন-সেমান্টিক্স (প্রয়োজনে-defaultPrevented-পড়ুন)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s239-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→বুট; সিড-শূন্য — রিড-ওনলি-সুইট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "কপি-বাটন (#scWkCopyBtn + w-টাইটেল)" "$DESK" 'id="scWkCopyBtn" title="সপ্তাহ-রিপোর্ট কপি করুন (w)"'
contains "বাটন aria-label (KPI-গণনা-সারাংশ)" "$DESK" 'aria-label="সপ্তাহ-রিপোর্ট ক্লিপবোর্ডে কপি'
contains "পেলোড-স্ক্রিপ্ট (#scWkReport JSON)" "$DESK" '<script type="application/json" id="scWkReport">'
contains "রিপোর্ট-টাইটেল (EJS-এক-উৎস-টেক্সট)" "$DESK" 'লেখক ফোরাম — সাপোর্ট সাপ্তাহিক রিপোর্ট'
contains "রিপোর্ট-বিভাগ: ২৪ঘ-সারসংক্ষেপ" "$DESK" 'ঘণ্টার সারসংক্ষেপ'
contains "রিপোর্ট-বিভাগ: বর্তমান-অবস্থা" "$DESK" 'বর্তমান অবস্থা (সব-স্কোপ)'
contains "রিপোর্ট-বিভাগ: ৭-দিনের-প্রবণতা" "$DESK" 'প্রবণতা (নতুন / সমাধান / গড়-সমাধান)'
contains "w-কী-বাইন্ডিং (typing-গার্ডের-পরে)" "$DESK" "e.key === 'w' || e.key === 'W'"
contains "সহায়িকা w-সারি" "$DESK" 'সপ্তাহ-রিপোর্ট ক্লিপবোর্ডে কপি'
contains "QA-হুক (__scQA.wkCopy)" "$DESK" '__scQA.wkCopy'
contains "CSS trend-head-ডানে (margin-left:auto)" "$DESK" '.sc-wk-copy{margin-left:auto'
contains "CSS ok-টোন (sc-wk-ok)" "$DESK" '.sc-wk-copy.sc-wk-ok{'
contains "CSS আইকন-পপ-অ্যানিমেশন (scWkPop)" "$DESK" '@keyframes scWkPop'
contains "CSS reduced-motion-নিরাপদ" "$DESK" '@media (prefers-reduced-motion: reduce){.sc-wk-copy{transition:none'
contains "CSS 640px-সংকোচন" "$DESK" '@media (max-width:640px){.sc-wk-copy{'

echo "── ধাপ-২: ব্রাউজার-সেশন (ভিউপোর্ট-রিসেট + রোবাস্ট-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
for i in 1 2 3; do
  U=$(agent-browser get url 2>/dev/null || echo '')
  echo "$U" | grep -q '/admin/login' && break
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
done
agent-browser fill '#username' admin >/dev/null 2>&1
agent-browser fill '#password' admin123 >/dev/null 2>&1
agent-browser click 'button[type=submit]' >/dev/null 2>&1
sleep 1.5
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "ডেস্ক-লোড (KPI-গ্রুপ)" || bad "ডেস্ক-লোড"
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs

echo "── ধাপ-৩: পেলোড-যাচাই (JSON-এক-পার্স; ক্লায়েন্ট-গণনা-শূন্য) ──"
PL=$(ev "(function(){ var el=document.getElementById('scWkReport'); if(!el) return JSON.stringify({e:'no-el'}); var o; try{ o=JSON.parse(el.textContent); }catch(_){ return JSON.stringify({e:'parse'}); } if(!o||!o.text) return JSON.stringify({e:'empty'}); return JSON.stringify({ len:o.text.length, lines:o.text.split('\n').length, marked:o.text.indexOf('\u25aa')>=0, dash:o.text.indexOf('\u2014')>=0 }); })()" 2>/dev/null)
contains "পেলোড-পার্স + দৈর্ঘ্য (২০০+)" "$PL" "len..:[0-9]" 
L1=$(echo "$PL" | grep -o "len..:[0-9]*" | grep -o "[0-9]*$")
if [ -n "$L1" ] && [ "$L1" -ge 200 ]; then ok "পেলোড-দৈর্ঘ্য $L1 (≥২০০)"; else bad "পেলোড-দৈর্ঘ্য খুব-ছোট: $PL"; fi
contains "রিপোর্ট-লাইন-গণনা (১২+)" "$PL" "lines..:1[2-9]\|lines..:[2-9][0-9]"
contains "বিভাগ-মার্কার (▪) উপস্থিত" "$PL" 'marked..:true'
contains "ব্যাপ্তি-ড্যাশ (—) উপস্থিত" "$PL" 'dash..:true'

echo "── ধাপ-৪: ক্লিক→ক্লিপবোর্ড + ফিডব্যাক (ওভাররাইড-চুক্তি: arm→click→আলাদা-eval) ──"
ev "(function(){ window.__s239clip=null; var cp=navigator.clipboard; if(cp&&cp.writeText){ window.__s239ow=cp.writeText.bind(cp); cp.writeText=function(t){ window.__s239clip=t; return Promise.resolve(); }; } var b=document.getElementById('scWkCopyBtn'); b.click(); return 'armed+clicked'; })()" >/dev/null 2>&1
sleep 0.4
CB=$(ev "(function(){ var b=document.getElementById('scWkCopyBtn'); var t=document.getElementById('scToast'); var ic=b.querySelector('i'); return JSON.stringify({ clip:!!window.__s239clip, okTone:b.classList.contains('sc-wk-ok'), iconSwap:ic.className.indexOf('fa-circle-check')>=0, toastShow:t.classList.contains('show'), toastLen:t.textContent.length }); })()" 2>/dev/null)
contains "ক্লিক→ক্লিপবোর্ড-লেখা" "$CB" 'clip..:true'
contains "ok-টোন ক্লাস সক্রিয়" "$CB" 'okTone..:true'
contains "আইকন-সোয়াপ (fa-circle-check)" "$CB" 'iconSwap..:true'
contains "টোস্ট দৃশ্যমান" "$CB" 'toastShow..:true'
contains "টোস্ট-লেখা অ-শূন্য" "$CB" "toastLen..:[1-9]"
MM=$(ev "(function(){ var o=JSON.parse(document.getElementById('scWkReport').textContent); return JSON.stringify({ exact: window.__s239clip===o.text }); })()" 2>/dev/null)
contains "ক্লিপবোর্ড = পেলোড-হুবহু" "$MM" 'exact..:true'
sleep 1.9
RS=$(ev "(function(){ var b=document.getElementById('scWkCopyBtn'); var ic=b.querySelector('i'); return JSON.stringify({ reset:!b.classList.contains('sc-wk-ok'), iconBack:ic.className.indexOf('fa-clipboard-list')>=0 }); })()" 2>/dev/null)
contains "ফিডব্যাক-রিসেট (১.৬সে-পরে টোন-শূন্য)" "$RS" 'reset..:true'
contains "আইকন-ফেরত (fa-clipboard-list)" "$RS" 'iconBack..:true'

echo "── ধাপ-৫: w-কী + typing-গার্ড ──"
ev "(function(){ window.__s239clip=null; document.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true})); return 'w-dispatched'; })()" >/dev/null 2>&1
sleep 0.4
WK=$(ev "(function(){ return JSON.stringify({ again:!!window.__s239clip }); })()" 2>/dev/null)
contains "w-কী→কপি-পুনঃট্রিগার" "$WK" 'again..:true'
ev "(function(){ window.__s239clip=null; var si=document.querySelector('.sc-search input'); si.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true})); return 'typing-dispatched'; })()" >/dev/null 2>&1
sleep 0.3
TG=$(ev "(function(){ return JSON.stringify({ blocked:window.__s239clip===null }); })()" 2>/dev/null)
contains "typing-গার্ড (ইনপুট-ফোকাসে ব্লক)" "$TG" 'blocked..:true'
QH=$(ev "(function(){ return JSON.stringify({ h: typeof window.__scQA.wkCopy === 'function' }); })()" 2>/dev/null)
contains "QA-হুক কার্যকর (function)" "$QH" 'h..:true'
ev "(function(){ var cp=navigator.clipboard; if(cp&&window.__s239ow) cp.writeText=window.__s239ow; return 'override-restored'; })()" >/dev/null 2>&1

echo "── ধাপ-৬: কনসোল + 390px + স্ক্রিনশট ──"
agent-browser screenshot "$APP/download/s239-wkcopy-desk.png" >/dev/null 2>&1
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
agent-browser screenshot "$APP/download/s239-wkcopy-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + পরিষ্কার-প্রমাণ ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J"
echo "CLEANUP-COUNT=0 (রিপোর্ট-কপি রিড-ওনলি-UI — DB-রাইট-শূন্য; সিড-শূন্য)"

echo ""
echo "s239-wkcopy-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
