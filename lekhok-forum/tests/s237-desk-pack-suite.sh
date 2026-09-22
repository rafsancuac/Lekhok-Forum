#!/bin/bash
# s237-desk-pack-suite.sh — session237 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s236-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: ① অক্ষর-গণনা (EJS-প্রথম-পেইন্ট bnNum + JS-ইনপুট bnJs; ১৮০০-এ warn-amber, ২০০০-এ full-red; টেমপ্লেট-ফিল-সিঙ্ক)
#          ② কপি-প্যাক (কম্পোজার data-note-copy + ইতিহাস data-hcopy ডেলিগেশন; ক্লিপবোর্ড-API→execCommand-ফলব্যাক;
#             খালি-লেখায় টোস্ট; .sc-tpl button[data-tpl]-ফিল্টার — কপি-বাটনে value='null'-দূষণ-প্রতিরোধ)
#          ③ তুলনামূলক-সময় চিপ (.sc-rel — helpers relTimeBn এক-উৎস, সার্ভার-গণনা) + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
#         ④ DB-পরিষ্কার-পথ: PUT note-only (স্ট্যাটাস-অস্পৃষ্ট) → PATCH delete-note ফেরত — নতুন-জঞ্জাল-শূন্য
#           (admin_note-কলাম-অবশিষ্ট TAG-প্রিফিক্সড — পরের-seed-প্রি-ক্লিন-এ-মোছায়)
# গোটচা-সম্মতি (PLANS session231-237-নোট): eval-IIFE })()-ইনভোকেড · কোট-এস্কেপ-দ্বি-স্তর · grep-BRE-ব্র্যাকেট-এস্কেপ ·
#         বাংলা-মান-তুলনা JS-এ · dirty-অবস্থায়-ম্যানুয়াল-reload-নিষিদ্ধ (কাউন্টার-টেস্ট সবার-শেষে) ·
#         ভিউপোর্ট-রিসেট + MOB-রিট্রাই ×৩ (s235-হার্ডেনিং) · LEKHOK_ROOT-সেমান্টিক্স=রিপো-রুট
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s237-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→seed→বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$APP" && node tests/s231-seed-undo.js seed) || { echo "FATAL: seed ব্যর্থ"; exit 1; }
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "কাউন্টার-হুক (data-note-count)" "$DESK" 'data-note-count'
contains "কাউন্টার-প্রথম-পেইন্ট বাংলা (০/২০০০)" "$DESK" '০/২০০০'
contains "কম্পোজার-কপি বাটন (data-note-copy)" "$DESK" 'data-note-copy'
contains "ইতিহাস-কপি ডেলিগেশন ([data-hcopy])" "$DESK" '\[data-hcopy\]'
contains "কাউন্টার-সিঙ্ক-ফাংশন (noteCountSync)" "$DESK" 'function noteCountSync'
contains "টেমপ্লেট-ফিল [data-tpl]-ফিল্টার (null-দূষণ-প্রতিরোধ)" "$DESK" '\.sc-tpl button\[data-tpl\]'
contains "কপি-ফলব্যাক (execCommand)" "$DESK" "execCommand('copy')"
contains "CSS warn-amber (১৮০০-সীমা)" "$DESK" '\.sc-note-count\.warn'
contains "CSS full-red (২০০০-সীমা)" "$DESK" '\.sc-note-count\.full'
contains "CSS rel-চিপ (.sc-rel)" "$DESK" '\.sc-rel{'
contains "CSS কম্পোজার-কপি (margin-left:auto)" "$DESK" '\.sc-tpl-copy{margin-left:auto'
contains "EJS rel-চিপ রেন্ডার (sc-rel)" "$DESK" 'class="sc-rel"'
contains "সহায়িকা কপি-সারি" "$DESK" 'কপি-বাটন'

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
pollst "JSON.stringify({lv:document.getElementById('scLive').classList.contains('on')&&document.getElementById('scLiveTxt').textContent==='লাইভ'})" "lv..:true" >/dev/null && ok "SSE-সংযোগ (ব্যাজ-লাইভ)" || bad "SSE-ব্যাজ-লাইভ-হয়নি"
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs

echo "── ধাপ-৩: তুলনামূলক-সময় চিপ (.sc-rel) ──"
REL=$(ev "(function(){ var cs=document.querySelectorAll('.sc-card'), rs=document.querySelectorAll('.sc-card .sc-rel'); if(!cs.length) return JSON.stringify({n:0,c:0}); var ok1=rs.length===cs.length; var ok2=true, ok3=true; rs.forEach(function(r){ var t=r.textContent||''; if(!(t.indexOf('আগে')>=0||t.indexOf('এখনই')>=0)) ok2=false; if(!(r.getAttribute('title')||'').length) ok3=false; }); return JSON.stringify({n:cs.length,c:rs.length,a:ok1,b:ok2,t:ok3}); })()" 2>/dev/null)
contains "প্রতি-কার্ডে rel-চিপ (সংখ্যা-মিল)" "$REL" 'a..:true'
contains "rel-চিপ-টেক্সট (আগে/এখনই)" "$REL" 'b..:true'
contains "rel-title পূর্ণ-তারিখ (অ-খালি)" "$REL" 't..:true'

echo "── ধাপ-৪: PUT note-only → SSE→টোস্ট→অটো-রিলোড → ইতিহাস-রেন্ডার ──"
for i in 1 2 3; do
  ARM=$(ev "(function(){ var t=document.getElementById('scToast'); if(!t) return 'no-toast'; sessionStorage.removeItem('s237mr'); new MutationObserver(function(){ var x=t.textContent||''; if(x.indexOf('রিফ্রেশ হচ্ছে')>=0) sessionStorage.setItem('s237mr','1'); }).observe(t,{childList:true,characterData:true,subtree:true,attributes:true}); return 'armed'; })()")
  echo "$ARM" | grep -q 'armed' && break
  sleep 0.5
done
ev "(function(){ var c=document.querySelector('.sc-card'); if(!c){ window.__s237put={ok:false,why:'no-card'}; return 'no-card'; } var id=c.getAttribute('data-id'); sessionStorage.setItem('s237id', id); fetch('/admin/support-center/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({status:'PENDING',adminNote:'Task231-UNDO-s237-কপি-টার্গেট'})}).then(function(r){return r.json();}).then(function(j){window.__s237put={ok:j.ok===true,unc:j.unchanged===true};}).catch(function(){window.__s237put={ok:false,why:'fetch'};}); return 'sent'; })()" >/dev/null 2>&1
if pollst "JSON.stringify(window.__s237put||{ok:false,why:'pending'})" "ok..:true" >/dev/null; then ok "PUT note-only সফল (স্ট্যাটাস-অস্পৃষ্ট)"; else bad "PUT-ব্যর্থ"; fi
if pollst "JSON.stringify({mr:sessionStorage.getItem('s237mr')==='1'})" "mr..:true" >/dev/null; then ok "SSE→টোস্ট-দেখা (observer)"; else bad "SSE-টোস্ট-মিস"; fi
sleep 2.2
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "অটো-রিলোড-পরবর্তী-ডেস্ক-লোড" || bad "অটো-রিলোড-পরবর্তী-লোড-ব্যর্থ"
if pollst "JSON.stringify({h:document.querySelectorAll('.sc-card [data-hcopy]').length>0})" "h..:true" >/dev/null; then ok "ইতিহাস-সারিতে কপি-বাটন-রেন্ডার"; else bad "ইতিহাস-কপি-বাটন-নেই"; fi
installErrs

echo "── ধাপ-৫: কপি-আচরণ (ক্লিপবোর্ড-ওভাররাইড — নির্ধারিত) ──"
ev "(function(){ window.__copied=false; var cp=navigator.clipboard; if(cp&&cp.writeText){ window.__origWrite=cp.writeText.bind(cp); cp.writeText=function(t){ window.__copied=true; return Promise.resolve(); }; } return 'override-armed'; })()" >/dev/null 2>&1
agent-browser click '.sc-card [data-hcopy]' >/dev/null 2>&1
if pollst "JSON.stringify({c:window.__copied===true,t:(document.getElementById('scToast').textContent||'').indexOf('জবাব কপি হয়েছে')>=0})" "c..:true" >/dev/null && ev "JSON.stringify({t:(document.getElementById('scToast').textContent||'').indexOf('জবাব কপি হয়েছে')>=0})" 2>/dev/null | grep -q 't..:true'; then ok "ইতিহাস-কপি→টোস্ট 'জবাব কপি হয়েছে ✓'"; else bad "ইতিহাস-কপি-ব্যর্থ"; fi
ev "(function(){ var cp=navigator.clipboard; if(cp&&window.__origWrite) cp.writeText=window.__origWrite; return 'override-restored'; })()" >/dev/null 2>&1
ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); if(b){ b.value=''; b.dispatchEvent(new Event('input',{bubbles:true})); } return 'box-cleared'; })()" >/dev/null 2>&1
agent-browser click '.sc-card [data-note-copy]' >/dev/null 2>&1
if pollst "JSON.stringify({t:(document.getElementById('scToast').textContent||'').indexOf('কপি করার মতো লেখা নেই')>=0})" "t..:true" >/dev/null; then ok "খালি-লেখা→টোস্ট 'কপি করার মতো লেখা নেই'"; else bad "খালি-কপি-টোস্ট-মিস"; fi
ev "(function(){ var cp=navigator.clipboard; window.__copied=false; if(cp&&cp.writeText){ window.__origWrite2=cp.writeText.bind(cp); cp.writeText=function(t){ window.__copied=true; return Promise.resolve(); }; } var b=document.querySelector('.sc-card [data-sc-note]'); if(b){ b.value='s237-কপি-নমুনা-লেখা'; b.dispatchEvent(new Event('input',{bubbles:true})); } return 'armed+filled'; })()" >/dev/null 2>&1
agent-browser click '.sc-card [data-note-copy]' >/dev/null 2>&1
if pollst "JSON.stringify({c:window.__copied===true})" "c..:true" >/dev/null && ev "JSON.stringify({t:(document.getElementById('scToast').textContent||'').indexOf('লেখা কপি হয়েছে')>=0})" 2>/dev/null | grep -q 't..:true'; then ok "কম্পোজার-কপি→টোস্ট 'লেখা কপি হয়েছে ✓'"; else bad "কম্পোজার-কপি-ব্যর্থ"; fi
ev "(function(){ var cp=navigator.clipboard; if(cp&&window.__origWrite2) cp.writeText=window.__origWrite2; return 'restored'; })()" >/dev/null 2>&1

echo "── ধাপ-৬: DB-পরিষ্কার-পথ (PATCH delete-note — ইতিহাস-ফেরত) ──"
ev "(function(){ var id=sessionStorage.getItem('s237id'); if(!id){ window.__s237pat={ok:false,why:'no-id'}; return 'no-id'; } fetch('/admin/support-center/'+id+'/history',{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({index:0,action:'delete-note'})}).then(function(r){return r.json();}).then(function(j){window.__s237pat={ok:j.ok===true};}).catch(function(){window.__s237pat={ok:false,why:'fetch'};}); return 'sent'; })()" >/dev/null 2>&1
if pollst "JSON.stringify(window.__s237pat||{ok:false,why:'pending'})" "ok..:true" >/dev/null; then ok "PATCH delete-note-ফেরত (জঞ্জাল-শূন্য-পথ)"; else bad "PATCH-ক্লিনআপ-ব্যর্থ"; fi
sleep 2.2
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "ক্লিনআপ-পরবর্তী-ডেস্ক-লোড" || bad "ক্লিনআপ-পরবর্তী-লোড-ব্যর্থ"
installErrs

echo "── ধাপ-৭: কাউন্টার-আচরণ (ইনপুট-ইভেন্ট — সবার-শেষে, dirty-নিরাপদ) ──"
ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); if(!b) return 'no-box'; window.__s237orig=b.value; b.value='abc'; b.dispatchEvent(new Event('input',{bubbles:true})); var c=b.parentElement.querySelector('[data-note-count]'); return JSON.stringify({t:c?c.textContent:''}); })()" 2>/dev/null > /tmp/s237-c1.txt
CT=$(cat /tmp/s237-c1.txt)
if echo "$CT" | grep -q '৩/২০০০'; then ok "ইনপুট→কাউন্টার '৩/২০০০' (bnJs)"; else bad "ইনপুট-কাউন্টার-মিল-নেই ($CT)"; fi
W=$(ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); b.value=new Array(1801).join('ক'); b.dispatchEvent(new Event('input',{bubbles:true})); var c=b.parentElement.querySelector('[data-note-count]'); return JSON.stringify({w:c.classList.contains('warn'),f:c.classList.contains('full'),t:c.textContent}); })()" 2>/dev/null)
if echo "$W" | grep -q 'w..:true' && echo "$W" | grep -q 'f..:false'; then ok "১৮০০-অক্ষর→warn-amber (full-নয়)"; else bad "warn-সীমা-ভুল ($W)"; fi
F=$(ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); b.value=new Array(2001).join('ক'); b.dispatchEvent(new Event('input',{bubbles:true})); var c=b.parentElement.querySelector('[data-note-count]'); return JSON.stringify({f:c.classList.contains('full'),w:c.classList.contains('warn')}); })()" 2>/dev/null)
if echo "$F" | grep -q 'f..:true' && echo "$F" | grep -q 'w..:false'; then ok "২০০০-অক্ষর→full-red (warn-নয়)"; else bad "full-সীমা-ভুল ($F)"; fi
T=$(ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); var tb=document.querySelector('.sc-tpl button[data-tpl]'); tb.click(); var c=b.parentElement.querySelector('[data-note-count]'); var d='০১২৩৪৫৬৭৮৯'; var n=String(b.value.length).replace(/[0-9]/g,function(ch){return d[+ch];})+'/২০০০'; return JSON.stringify({t:c.textContent, n:n}); })()" 2>/dev/null)
if echo "$T" | grep -q 't..:' && echo "$T" | grep -q 'n..:'; then
  if [ "$(echo "$T" | sed 's/.*"t":"\([^"]*\)".*/\1/')" = "$(echo "$T" | sed 's/.*"n":"\([^"]*\)".*/\1/')" ]; then ok "টেমপ্লেট-ফিল→কাউন্টার-সিঙ্ক (সমতা)"; else bad "টেমপ্লেট-ফিল-কাউন্টার-মিল-নেই ($T)"; fi
else bad "টেমপ্লেট-ফিল-কাউন্টার-মিস ($T)"; fi
ev "(function(){ var b=document.querySelector('.sc-card [data-sc-note]'); b.value=window.__s237orig||''; b.dispatchEvent(new Event('input',{bubbles:true})); return 'restored'; })()" >/dev/null 2>&1

echo "── ধাপ-৮: কনসোল + 390px + স্ক্রিনশট ──"
sleep 1
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'
agent-browser screenshot "$APP/download/s237-desk-pack-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=''; for i in 1 2 3; do # s235-হার্ডেনিং — MOB-রিট্রাই ×৩
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s237-desk-pack-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + ফাইল-ক্লিনআপ ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J" /tmp/s237-c1.txt
echo "CLEANUP-COUNT=0 (নোট-ইতিহাস-PATCH-ফেরত + স্ট্যাটাস-অস্পৃষ্ট — নতুন-জঞ্জাল-শূন্য)"

echo ""
echo "s237-desk-pack-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
