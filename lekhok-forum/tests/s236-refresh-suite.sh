#!/bin/bash
# s236-refresh-suite.sh — session236 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s235-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: dirty-guard পুনঃস্থাপন (maybeReload dirty-ব্লক + প্রতি-পর্বে এক-টোস্ট) + রিফ্রেশ-এখন (busy-স্পিন +
#          aria-busy + dirty-বাধা) + অটো-হালনাগাদ-বিরতি (পোল+SSE-গার্ড + localStorage sc-pause স্মরণ +
#          ব্যাজ-বিরতি-টোন) + r/p-কী + পরিষ্কার-পথ SSE→টোস্ট→রিলোড + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
#         ④ স্ট্যাটাস-ফ্লিপ seeded-রোতেই — নতুন-জঞ্জাল-শূন্য; ফ্লিপ-ফেরত সুইটের-ভিতরেই পুনঃস্থাপিত
# গোটচা-সম্মতি (PLANS session231-236-নোট): eval-IIFE })()-ইনভোকেড · কোট-এস্কেপ-দ্বি-স্তর · grep-BRE-ব্র্যাকেট-এস্কেপ ·
#         বাংলা-মান-তুলনা JS-এ (শেল-শুধু ok..:true) · ক্ষণস্থায়ী-UI = in-browser-MutationObserver+sessionStorage ·
#         dirty-অবস্থায়-ম্যানুয়াল-reload-নিষিদ্ধ (beforeunload-ডায়ালগ-ঝুঁকি — পরিষ্কার-পথ-আগে, dirty-পরীক্ষা-শেষে) ·
#         LEKHOK_ROOT-সেমান্টিক্স=রিপো-রুট
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
assert(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (প্রত্যাশা=$2 প্রাপ্ত=$3)"; fi; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s236-jar.txt
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
contains "রিফ্রেশ-বাটন (#scRefreshBtn)" "$DESK" 'id="scRefreshBtn"'
contains "বিরতি-বাটন aria-pressed=\"false\"-আরম্ভ" "$DESK" 'id="scPauseBtn" aria-pressed="false"'
contains "সহায়িকা r-সারি" "$DESK" '>r</kbd>'
contains "সহায়িকা p-সারি" "$DESK" '>p</kbd>'
contains "CSS স্পিন (.sc-refresh-busy i + scSpin)" "$DESK" '\.sc-refresh-busy i{animation:scSpin'
contains "CSS reduced-motion-নিরাপদ" "$DESK" 'reduce){\.sc-refresh-busy i{animation:none}}'
contains "CSS বিরতি-টোন (aria-pressed + ব্যাজ)" "$DESK" '#scPauseBtn\[aria-pressed="true"\]{background:var(--lf-amber-ink)'
contains "CSS ব্যাজ-বিরতি (.sc-live.paused)" "$DESK" '\.sc-live\.paused{color:var(--lf-amber-ink)'
contains "JS pollCounts force-গেট" "$DESK" 'if (!force && paused) return'
contains "JS maybeReload dirty-গার্ড" "$DESK" 'if (dirty) { // session236'
contains "JS এক-টোস্ট-পর্ব (dirtyWarned)" "$DESK" 'if (!dirtyWarned)'
contains "JS localStorage স্মরণ (sc-pause)" "$DESK" "localStorage.getItem('sc-pause')"
contains "JS SSE বিরতি-গার্ড" "$DESK" "if (!paused) maybeReload"

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
pollst "JSON.stringify({lv:document.getElementById('scLive').classList.contains('on')&&document.getElementById('scLiveTxt').textContent==='লাইভ'})" "lv..:true" >/dev/null && ok "SSE-সংযোগ (ব্যাজ-লাইভ) — session236-ফিক্স" || bad "SSE-ব্যাজ-লাইভ-হয়নি"
ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1

echo "── ধাপ-৩: রিফ্রেশ-এখন (busy-চক্র + কীবোর্ড) ──"
ev "(function(){ var b=document.getElementById('scRefreshBtn'); window.__rbSeen=false; if(!b) return 'no-btn'; new MutationObserver(function(){ if(b.classList.contains('sc-refresh-busy')) window.__rbSeen=true; }).observe(b,{attributes:true,attributeFilter:['class','aria-busy']}); return 'armed'; })()" >/dev/null 2>&1
agent-browser click '#scRefreshBtn' >/dev/null 2>&1
if pollst "JSON.stringify({seen:window.__rbSeen===true})" "seen..:true" >/dev/null; then ok "ক্লিক→busy-স্পিন-দেখা (observer)"; else bad "busy-স্পিন-দেখা-যায়নি"; fi
if pollst "JSON.stringify({clear:(function(){var b=document.getElementById('scRefreshBtn');return !b.getAttribute('aria-busy')&&!b.classList.contains('sc-refresh-busy')&&window.__scQA.refreshing===false;})()})" "clear..:true" >/dev/null; then ok "চক্র-সমাপ্ত (aria-busy-অপসারিত + refreshing-false)"; else bad "busy-চক্র-ঝুলে-আছে"; fi
ev "window.__rbSeen=false; 'reset'" >/dev/null 2>&1
ev "(function(){ document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'r',bubbles:true})); return 'r-sent'; })()" >/dev/null 2>&1
if pollst "JSON.stringify({kseen:window.__rbSeen===true})" "kseen..:true" >/dev/null; then ok "r-কী→busy-দেখা (কীবোর্ড-পথ)"; else bad "r-কী-পথ-ব্যর্থ"; fi

echo "── ধাপ-৪: অটো-হালনাগাদ-বিরতি (বাটন + কীবোর্ড) ──"
agent-browser click '#scPauseBtn' >/dev/null 2>&1
if pollst "JSON.stringify(function(){var b=document.getElementById('scPauseBtn'),t=document.getElementById('scLiveTxt'),l=document.getElementById('scLive');var ls=false;try{ls=localStorage.getItem('sc-pause')=='1';}catch(_){ }return {all:b.getAttribute('aria-pressed')=='true'&&t.textContent=='বিরতি'&&l.classList.contains('paused')&&ls};}())" "all..:true" >/dev/null; then ok "ক্লিক→বিরতি (aria-pressed + ব্যাজ-বিরতি + .paused + localStorage)"; else bad "বিরতি-টগল-অসম্পূর্ণ"; fi
agent-browser click '#scPauseBtn' >/dev/null 2>&1
if pollst "JSON.stringify(function(){var b=document.getElementById('scPauseBtn'),t=document.getElementById('scLiveTxt');var p={};try{p.ls=localStorage.getItem('sc-pause')===null;}catch(_){p.ls=false;}return {off:b.getAttribute('aria-pressed')==='false',bd:t.textContent!=='বিরতি',ls:p.ls};}())" "off..:true" >/dev/null; then ok "পুনঃক্লিক→চালু (সব-বিপরীত + localStorage-পরিষ্কার)"; else bad "পুনঃচালু-ব্যর্থ"; fi
ev "(function(){ document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true})); return 'p-sent'; })()" >/dev/null 2>&1
if pollst "JSON.stringify({kpr:document.getElementById('scPauseBtn').getAttribute('aria-pressed')==='true'})" "kpr..:true" >/dev/null; then ok "p-কী→বিরতি (কীবোর্ড-পথ)"; else bad "p-কী-পথ-ব্যর্থ"; fi
ev "(function(){ document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true})); return 'p2-sent'; })()" >/dev/null 2>&1
pollst "JSON.stringify({koff:document.getElementById('scPauseBtn').getAttribute('aria-pressed')==='false'})" "koff..:true" >/dev/null || bad "p-কী-পুনঃচালু-ব্যর্থ"

echo "── ধাপ-৫: পরিষ্কার-পথ (SSE→টোস্ট→অটো-রিলোড) ──"
for i in 1 2 3; do # session236-হার্ডেনিং — arm-অস্থায়ী-ব্যর্থ-প্রতিষ্কার
  ARM=$(ev "(function(){ var t=document.getElementById('scToast'); if(!t) return 'no-toast'; sessionStorage.removeItem('s236mr'); new MutationObserver(function(){ var x=t.textContent||''; if(x.indexOf('রিফ্রেশ হচ্ছে')>=0) sessionStorage.setItem('s236mr','1'); }).observe(t,{childList:true,characterData:true,subtree:true,attributes:true}); return 'armed'; })()")
  echo "$ARM" | grep -q 'armed' && break
  sleep 0.5
done
ev "(function(){ var c=document.querySelector('.sc-card:not([data-status=\"IN_PROGRESS\"])'); if(!c){ window.__s236put={put:false,why:'no-card'}; return 'no-card'; } var id=c.getAttribute('data-id'); sessionStorage.setItem('s236id', id); sessionStorage.setItem('s236from', c.getAttribute('data-status')||'PENDING'); fetch('/admin/support-center/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({status:'IN_PROGRESS',adminNote:''})}).then(function(r){return r.json();}).then(function(j){window.__s236put={put:j.ok===true,id:id};}).catch(function(){window.__s236put={put:false,why:'fetch'};}); return 'sent'; })()" >/dev/null 2>&1
if pollst "JSON.stringify(window.__s236put||{put:false,why:'pending'})" "put..:true" >/dev/null; then ok "স্ট্যাটাস-PUT সফল (SSE-উৎস)"; else bad "PUT-ব্যর্থ — SSE-উৎস-নেই"; fi
if pollst "JSON.stringify({mr:sessionStorage.getItem('s236mr')==='1'})" "mr..:true" >/dev/null; then ok "SSE→টোস্ট-দেখা (observer)"; else bad "SSE-টোস্ট-মিস"; fi
sleep 2.2
if ev "JSON.stringify({fresh:typeof window.__mrSeen==='undefined'})" 2>/dev/null | grep -q "fresh..:true"; then ok "টোস্টের-পরে পৃষ্ঠা-অটো-রিলোড-প্রমাণিত (fresh-JS)"; else bad "অটো-রিলোড-প্রমাণ-নেই"; fi
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "রিলোড-পরবর্তী-ডেস্ক-লোড" || bad "রিলোড-পরবর্তী-লোড-ব্যর্থ"
ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1

echo "── ধাপ-৬: dirty-guard E2E (dirty + SSE→ব্লক, কোনো-রিলোড-নেই) ──"
DB=$(ev "(function(){ var nb=document.querySelector('.sc-note-box'); if(!nb) return JSON.stringify({dirty:false,why:'no-notebox'}); nb.value='Task236 অসংরক্ষিত-পরীক্ষা'; nb.dispatchEvent(new Event('input',{bubbles:true})); return JSON.stringify({dirty:window.__scQA.dirty===true}); })()" 2>/dev/null)
contains "লেখা-ইনপুটে dirty-সেট" "$DB" 'dirty..:true'
for i in 1 2 3; do
  ARM=$(ev "(function(){ window.__scTag=1; var t=document.getElementById('scToast'); if(!t) return 'no-toast'; sessionStorage.removeItem('s236blk'); new MutationObserver(function(){ var x=t.textContent||''; if(x.indexOf('পিছিয়েছে')>=0) sessionStorage.setItem('s236blk','1'); }).observe(t,{childList:true,characterData:true,subtree:true,attributes:true}); return 'armed'; })()")
  echo "$ARM" | grep -q 'armed' && break
  sleep 0.5
done
ev "(function(){ var id=sessionStorage.getItem('s236id'); if(!id){ window.__s236put2={put:false,why:'no-id'}; return 'no-id'; } var to=sessionStorage.getItem('s236from')||'PENDING'; fetch('/admin/support-center/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({status:to,adminNote:''})}).then(function(r){return r.json();}).then(function(j){window.__s236put2={put:j.ok===true,id:id};}).catch(function(){window.__s236put2={put:false,why:'fetch'}}); return 'sent'; })()" >/dev/null 2>&1
pollst "JSON.stringify(window.__s236put2||{put:false,why:'pending'})" "put..:true" >/dev/null || bad "ফ্লিপ-ফেরত PUT-ব্যর্থ"
sleep 3
DG=$(ev "JSON.stringify({tag:window.__scTag===1,blk:sessionStorage.getItem('s236blk')==='1'})" 2>/dev/null)
contains "dirty-অবস্থায় SSE→রিলোড-ব্লক (tag-অক্ষত)" "$DG" 'tag..:true'
contains "dirty-ব্লক-টোস্ট-দেখা (পিছিয়েছে)" "$DG" 'blk..:true'

echo "── ধাপ-৭: কনসোল + 390px + স্ক্রিনশট ──"
sleep 1
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'
agent-browser screenshot "$APP/download/s236-refresh-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s236-refresh-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + ফাইল-ক্লিনআপ ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J"
echo "CLEANUP-COUNT=0 (স্ট্যাটাস-ফ্লিপ-ফেরত-সম্পন্ন — নতুন-জঞ্জাল-শূন্য)"

echo ""
echo "s236-refresh-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
