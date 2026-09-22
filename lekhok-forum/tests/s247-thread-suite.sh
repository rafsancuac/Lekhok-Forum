#!/bin/bash
# s247-thread-suite.sh — session247 প্রেরক-থ্রেড-লিঙ্ক সুইট (স্থায়ী — রিপো-কমিটেড; s243-সিড-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (data-thread মার্কআপ + .sc-th CSS ×২ + threadOpen + t-কী-ব্রাঞ্চ + বাইন্ডিং + QA-হুক ×২ + সহায়িকা ×২ + ব্যাজ ×২)
#          ② রেন্ডার-প্রমাণ (থ্রেড-লিঙ্ক-গণনা = কার্ড-গণনা; href=/messages/; aria-label)
#          ③ আচরণ (কার্সর-শূন্যে t = টোস্ট; j→t = window.open-স্টাব-ক্যাপচার /messages/<username> নতুন-ট্যাব)
#          ④ কনসোল-শূন্য + 390px + সিড-জঞ্জাল-শূন্য
# চুক্তি: ① সিড = s243-seed-video.js পুনঃব্যবহার (TAG Task243-VIDEO ×৬; সার্ভার-বন্ধে-seed) ② CSRF-লগইন admin/admin123
#         ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল) ④ window.open-স্টাব = s239-ক্লিপবোর্ড-স্টাব-প্যাটার্ন
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s247-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
TAG='Task243-VIDEO'

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধে-seed → বুট → লগইন) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/tests/s243-seed-video.js" seed 2>&1)
if echo "$SD" | grep -q "SEED-COUNT=6"; then ok "সিড ×৬ (s243-seed পুনঃব্যবহার)"; else bad "সিড-ব্যর্থ: $SD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (সোর্স-ফাইল) ──"
SRC=$(cat "$APP/admin/views/admin/support-center.ejs")
contains "থ্রেড-লিঙ্ক মার্কআপ" "$SRC" 'data-thread href="/messages/'
contains "sc-th ক্লাস" "$SRC" 'class="sc-cp sc-th"'
contains "noopener-নিরাপত্তা" "$SRC" 'target="_blank" rel="noopener"'
contains "CSS .sc-th বেস" "$SRC" '.sc-cp.sc-th{text-decoration:none}'
contains "CSS .sc-th আইকন-accent" "$SRC" '.sc-cp.sc-th i{color:var(--ad-accent)'
contains "threadOpen ফাংশন" "$SRC" 'function threadOpen'
contains "t-কী ব্রাঞ্চ" "$SRC" "e.key === 't' || e.key === 'T'"
contains "বাইন্ডিং \[data-thread\]" "$SRC" "querySelectorAll('\\[data-thread\\]')"
contains "stopPropagation (কার্ড-শৃঙ্খল-অক্ষুণ্ণ)" "$SRC" "ev.stopPropagation"
contains "QA-হুক thread" "$SRC" '__scQA.thread ='
contains "QA-হুক threadOpen" "$SRC" '__scQA.threadOpen = threadOpen'
contains "সহায়িকা t-সারি" "$SRC" 'প্রেরককে মেসেঞ্জারে লিখুন'
contains "সহায়িকা কথা-বাটন-সারি" "$SRC" 'কার্ডে কথা-বাটন'
contains "G2-ব্যাজ আপডেট ৯-১২" "$SRC" 'কার্ড-অ্যাকশন <span class="sc-hg-n">৯-১২</span>'
contains "G4-ব্যাজ আপডেট ১৭-২৬" "$SRC" 'মাউস-ও-টাচ <span class="sc-hg-n">১৭-২৬</span>'

echo "── ধাপ-২: রেন্ডার-প্রমাণ ──"
D=$(curl -s -b "$J" "$BASE/admin/support-center?q=$TAG")
contains "রেন্ডারে থ্রেড-লিঙ্ক" "$D" 'data-thread href'
CC=$(echo "$D" | grep -o 'class="sc-card ' | wc -l)
TC=$(echo "$D" | grep -o 'data-thread href=' | wc -l)
if [ "$TC" = "$CC" ] && [ "$TC" != "0" ]; then ok "থ্রেড-লিঙ্ক ×$TC = কার্ড ×$CC (১:১)"; else bad "লিঙ্ক/কার্ড-অমিল (লিঙ্ক $TC, কার্ড $CC)"; fi
contains "href /messages/<username>" "$D" 'href="/messages/md_rafsan"'
contains "aria-label প্রেরকের-সাথে" "$D" 'aria-label="প্রেরকের সাথে কথা বলুন'

echo "── ধাপ-৩: আচরণ (ব্রাউজার — t-কী) ──"
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
agent-browser open "$BASE/admin/support-center?q=$TAG" >/dev/null 2>&1
pollst "!!window.__scQA?'QA-OK':'loading'" "QA-OK" >/dev/null && ok "ডেস্ক-লোড (q=TAG)" || bad "ডেস্ক-লোড"
installErrs
HK=$(ev "(function(){ var h=window.__scQA.thread(); return JSON.stringify({ links:h.links, msg:h.first&&h.first.indexOf('/messages/')==0 }); })()" 2>/dev/null)
contains "হুক links=৬" "$HK" 'links..:6'
contains "হুক first /messages/-প্রিফিক্স" "$HK" 'msg..:true'
# ① কার্সর-শূন্য → টোস্ট (window.open-স্টাব আর্ম করেই)
ev "(function(){ window.__s247open=[]; window.__s247ow=window.open.bind(window); window.open=function(u,t,o){ window.__s247open.push(String(u)); return null; }; document.dispatchEvent(new KeyboardEvent('keydown',{key:'t'})); return 'armed+t'; })()" >/dev/null 2>&1; sleep 0.5
N0=$(ev "JSON.stringify({ n:window.__s247open.length })" 2>/dev/null)
contains "কার্সর-শূন্যে open-শূন্য" "$N0" 'n..:0'
TT=$(ev "(function(){ var t=document.getElementById('scToast'); return JSON.stringify({ shown:!!t&&t.classList.contains('show'), text:t?t.textContent:'' }); })()" 2>/dev/null)
contains "টোস্ট 'কার্সর-কার্ড নেই'" "$TT" 'কার্সর-কার্ড নেই'
# ② j→t → স্টাব-ক্যাপচার
ev "(function(){ document.dispatchEvent(new KeyboardEvent('keydown',{key:'j'})); document.dispatchEvent(new KeyboardEvent('keydown',{key:'t'})); return 'j+t'; })()" >/dev/null 2>&1; sleep 0.5
OP=$(ev "JSON.stringify({ n:window.__s247open.length, first:window.__s247open[0]||'' })" 2>/dev/null)
contains "j→t open ×১" "$OP" 'n..:1'
contains "ক্যাপচার /messages/md_rafsan" "$OP" 'first..:../messages/md_rafsan'
ev "(function(){ if(window.__s247ow) window.open=window.__s247ow; return 'override-restored'; })()" >/dev/null 2>&1

echo "── ধাপ-৪: কনসোল-শূন্য + 390px + স্ক্রিনশট ──"
ER=$(ev "JSON.stringify({ n:(window.__scErrs||[]).length })" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$ER" 'n..:0'
agent-browser screenshot tests/s247-thread-desk.png >/dev/null 2>&1 && ok "s247-thread-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
contains "390px hScroll-শূন্য" "$HS" 'h..:false'
agent-browser screenshot tests/s247-thread-mobile390.png >/dev/null 2>&1 && ok "s247-thread-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: সিড-cleanup ──"
CD=$(node "$APP/tests/s243-seed-video.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi

echo "════════════════════════════════════"
echo "s247-thread-suite: PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "ALL-GREEN" || echo "SOME-FAILED"
exit $FAIL
