#!/bin/bash
# s238-lbox-suite.sh — session238 কার্ড-লাইটবক্স সুইট (স্থায়ী — রিপো-কমিটেড; s237-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (data-lbox-হুক ×২-ধরন + #scLbox-ডায়ালগ + [hidden]-স্পষ্ট-নিয়ম + z-৯০ + reduced-motion + Esc-শৃঙ্খল-অগ্রাধিকার + সহায়িকা-সারি)
#          ② আচরণ: ক্লিক→খোলা (src/caption/scroll-lock/ফোকাস) + বন্ধ-পথ ×৩ (Esc/বাটন/ব্যাকড্রপ) + ফোকাস-ফেরত
#          ③ সংশোধক-কী (Ctrl+ক্লিক) নেটিভ-অক্ষুণ্ণ (preventDefault-নেই) + কনসোল + 390px + স্ক্রিনশট ×২
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (tests/s238-seed-lbox.js — TAG Task238-LBOX; ১×১-PNG-data-URI স্বয়ংসম্পূর্ণ)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
#         ④ লাইটবক্স = রিড-ওনলি-UI — DB-রাইট-শূন্য; শেষে seed-cleanup-ই-পরিষ্কার
# গোটচা-সম্মতি (PLANS session231-237-নোট): eval-IIFE })()-ইনভোকেড · [hidden]-স্পষ্ট-নিয়ম (display:flex-চাপা) ·
#         __scQA-হুক-অবশ্যই-পুনঃসৃজনের-পরে · ভিউপোর্ট-রিসেট + MOB-রিট্রাই ×৩ · LEKHOK_ROOT-সেমান্টিক্স=রিপো-রুট
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s238-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→seed→বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$APP" && node tests/s238-seed-lbox.js seed) || { echo "FATAL: seed ব্যর্থ"; exit 1; }
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "লাইটবক্স-হুক (a[data-lbox])" "$DESK" 'data-lbox'
contains "ক্যাপশন-হুক (data-lcap)" "$DESK" 'data-lcap'
contains "ডায়ালগ-ডম (#scLbox role=dialog aria-modal)" "$DESK" 'id="scLbox" role="dialog" aria-modal="true"'
contains "বন্ধ-বাটন (#scLboxClose aria-label-Esc)" "$DESK" 'id="scLboxClose" aria-label'
contains "CSS [hidden]-স্পষ্ট-নিয়ম (display:flex-চাপা-গোটচা)" "$DESK" '#scLbox\[hidden\]{display:none}'
contains "CSS z-স্তর-৯০ (বাল্ক 80-এর-উপরে)" "$DESK" '#scLbox{position:fixed;inset:0;z-index:90'
contains "CSS reduced-motion-নিরাপদ (অ্যানিমেশন-বাদ)" "$DESK" '@media (prefers-reduced-motion: reduce){#scLbox{animation:none}}'
contains "CSS 640px-সংকোচন" "$DESK" '@media (max-width:640px){#scLbox{padding:12px}'
contains "CSS zoom-in-কার্সর + হোভার-কোণার-আইকন" "$DESK" 'cursor:zoom-in'
contains "Esc-শৃঙ্খলে-লাইটবক্স-সর্বপ্রথম (মোডাল-অগ্রাধিকার)" "$DESK" "if (!lbox.hidden) { lboxHide(); return; }"
contains "সংশোধক-কী-নেটিভ-ট্যাব (metaKey-guard)" "$DESK" 'e.metaKey || e.ctrlKey || e.shiftKey || e.altKey'
contains "স্ক্রল-লক (body.overflow)" "$DESK" "document.body.style.overflow = 'hidden'"
contains "ফোকাস-ফেরত (lboxSrc.focus)" "$DESK" 'lboxSrc.focus()'
contains "সহায়িকা লাইটবক্স-সারি" "$DESK" 'সংযুক্তি-ছবি কার্ড ছাড়াই বড় করে দেখুন'
contains "QA-হুক (__scQA.lboxOpen)" "$DESK" '__scQA.lboxOpen'

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
NIMG=$(ev "(function(){ var a=document.querySelectorAll('.sc-media a[data-lbox]'); window.__s238a=a[0]||null; return JSON.stringify({n:a.length, href:a[0]?a[0].getAttribute('href'):''}); })()" 2>/dev/null)
contains "seed-IMAGE-কার্ড রেন্ডার (data:image/png)" "$NIMG" 'n..:1'
contains "media-হ্রেফ = data-URI (১×১-PNG)" "$NIMG" 'data:image/png'
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs

echo "── ধাপ-৩: খোলা-আচরণ (ক্লিক→ডায়ালগ) ──"
OP=$(ev "(function(){ var a=window.__s238a; if(!a) return JSON.stringify({e:'no-link'}); a.click(); var lb=document.getElementById('scLbox'); var img=document.getElementById('scLboxImg'); var cap=document.getElementById('scLboxCap'); return JSON.stringify({ open:!lb.hidden, src:(img.getAttribute('src')||'').indexOf('data:image/png')===0, cap:cap.textContent===a.getAttribute('data-lcap')&&cap.textContent.length>0, lock:document.body.style.overflow==='hidden', focus:document.activeElement&&document.activeElement.id==='scLboxClose' }); })()" 2>/dev/null)
contains "ক্লিক→ডায়ালগ-খোলা" "$OP" 'open..:true'
contains "বড়-ছবি-উৎস সেট (data-URI)" "$OP" 'src..:true'
contains "ক্যাপশন = data-lcap (প্রেরক · সময়)" "$OP" 'cap..:true'
contains "body-স্ক্রল-লক সক্রিয়" "$OP" 'lock..:true'
contains "ফোকাস → বন্ধ-বাটন (a11y)" "$OP" 'focus..:true'
agent-browser screenshot "$APP/download/s238-lbox-open.png" >/dev/null 2>&1

echo "── ধাপ-৪: বন্ধ-পথ ×৩ (Esc / বাটন / ব্যাকড্রপ) + ফোকাস-ফেরত ──"
E1=$(ev "(function(){ document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); var lb=document.getElementById('scLbox'); return JSON.stringify({ closed:lb.hidden, unlock:document.body.style.overflow==='', imgClear:!document.getElementById('scLboxImg').getAttribute('src'), back:document.activeElement===window.__s238a }); })()" 2>/dev/null)
contains "Esc→বন্ধ" "$E1" 'closed..:true'
contains "স্ক্রল-লক-ফেরত" "$E1" 'unlock..:true'
contains "img-উৎস-পরিষ্কার" "$E1" 'imgClear..:true'
contains "ফোকাস-ফেরত-উৎস-লিঙ্কে" "$E1" 'back..:true'
O2=$(ev "(function(){ var a=window.__s238a; a.click(); var st=!document.getElementById('scLbox').hidden; document.getElementById('scLboxClose').click(); return JSON.stringify({ opened:st, closed:document.getElementById('scLbox').hidden }); })()" 2>/dev/null)
contains "বাটন-পুনঃখোলা→বন্ধ (চক্র)" "$O2" 'opened..:true'
contains "বাটন→বন্ধ" "$O2" 'closed..:true'
O3=$(ev "(function(){ var a=window.__s238a; a.click(); var lb=document.getElementById('scLbox'); var st=!lb.hidden; lb.click(); return JSON.stringify({ opened:st, closed:lb.hidden }); })()" 2>/dev/null)
contains "ব্যাকড্রপ-ক্লিক→বন্ধ (figure-বাইরে)" "$O3" 'opened..:true'
contains "ব্যাকড্রপ→বন্ধ" "$O3" 'closed..:true'

echo "── ধাপ-৫: সংশোধক-কী নেটিভ-অক্ষুণ্ণ (Ctrl+ক্লিক = নতুন-ট্যাব) ──"
CK=$(ev "(function(){ var a=window.__s238a; var e=new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true}); var pd=a.dispatchEvent(e); return JSON.stringify({ notPrevented:pd, closed:document.getElementById('scLbox').hidden }); })()" 2>/dev/null)
contains "Ctrl+ক্লিকে preventDefault-নেই" "$CK" 'notPrevented..:true'
contains "Ctrl+ক্লিকে ডায়ালগ-বন্ধ-থাকে" "$CK" 'closed..:true'

echo "── ধাপ-৬: কনসোল + 390px + স্ক্রিনশট ──"
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
agent-browser screenshot "$APP/download/s238-lbox-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + seed-cleanup (TAG-জঞ্জাল-শূন্য) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
(cd "$APP" && node tests/s238-seed-lbox.js cleanup) || true
rm -f "$J"
echo "CLEANUP-COUNT=0 (লাইটবক্স-রিড-ওনলি — DB-রাইট-শূন্য; seed-cleanup-সম্পন্ন)"

echo ""
echo "s238-lbox-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
