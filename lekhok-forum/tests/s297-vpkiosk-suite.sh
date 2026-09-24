#!/bin/bash
# s297-vpkiosk-suite.sh — session297 ভিউপোর্ট-সচেতন কিয়স্ক সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: session296-প্রস্তাব — হোম-কিয়স্ক অটো-স্লাইড অদৃশ্য-সেকশনে/লুকানো-ট্যাবে চলতেই-থাকে
# (interval ৩.৫সে টিক + DOM-লেখা + ফ্লিপ-অ্যানিমেশন + চেইন-ইমেজ-লোড) — CPU-অপচয়।
# সমাধান (ep297): ① IntersectionObserver (threshold .12) — অদৃশ্যে টাইমার-সম্পূর্ণ-বন্ধ
#   ② visibilitychange — লুকানো-ট্যাবে বন্ধ ③ tick-গেট (inView && tabVisible && !paused)
#   ④ __epk297QA হুক (inView/tabVisible/ioOn/timerOn/tickN/current/tick/sync — papers-শূন্যে-ও-সংজ্ঞায়িত)
#   ⑤ IO-অসমর্থিতে আচরণ-অপরিবর্তিত (গ্রেসফুল-ডিগ্রেডেশন)।
# [Mandatory-স্টাইল]: CSS session297-ব্লক — ৫-কলাম ফিল্ম-গ্রিড @≥1440px (s296-র 1280×৪-কলাম-চুক্তি অক্ষুণ্ণ)
#   + ফিল্ম-বাটন হোভার-লিফট/ছায়া + নির্বাচিত-অ্যাকসেন্ট-রিং + মিনি-থাম্ব হোভার-পলিশ + CTA-লিফট + রিডিউসড-মোশন।
# কভারেজ: ① সোর্স-কাঠামো (today.ejs + style.css — session297-মার্কার + s291/s292/s296-অক্ষুণ্ণ + EJS-compile)
#          ② SSR (সিড-হোম): ইঞ্জিন-স্ক্রিপ্ট-মার্কার + ফিল্ম-বাটন ×৭
#          ③ E2E (agent-browser): হুক/ioOn + inView-পজ→টাইমার-বন্ধ + রিজিউম→পুনঃ-সূচনা + অটো-অ্যাডভান্স +
#             tickN-বৃদ্ধি + ম্যানুয়াল-tick + ৫-কলাম@1440 + ৪-কলাম@1280 (s296-চুক্তি) + 390-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-ক্লিন নেট-শূন্য (s296-seedhome seed|clean)
# চুক্তি: eval-এ else-বিহীন-ternary-নিষিদ্ধ (cond&&expr-রীতি) + কিল→সিড→বুট ক্রম + open-রিট্রাই + url-যাচাই
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s297-home-page.html
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
poll(){
  local i r
  for i in $(seq 1 "${3:-20}"); do
    r=$(ev "$1" 2>/dev/null | tr -d '"\\')
    if echo "$r" | grep -qF -- "$2"; then return 0; fi
    sleep 0.5
  done
  echo "poll-final: $r"
  return 1
}
kill8094(){
  local pid i j
  for i in 1 2 3; do
    pid=$(lsof -t -i :8094 2>/dev/null | head -1)
    [ -z "$pid" ] && return 0
    kill "$pid" 2>/dev/null
    for j in $(seq 1 16); do
      lsof -t -i :8094 2>/dev/null | grep -q . || return 0
      sleep 0.5
    done
    kill -9 "$pid" 2>/dev/null
    sleep 1
  done
  return 0
}
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ + সিড (কিল→প্রি-ক্লিন→সিড→বুট — পুরনো-মার্কার-সারি-অবশেষ-বিলোপ; নির্ধারক-গণনা) ──"
kill8094
node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null >/dev/null || true
node "$APP/scripts/s292-seedhome.js" clean 2>/dev/null >/dev/null || true
S1=$(node "$APP/scripts/s296-seedhome.js" seed 2>/dev/null)
echo "$S1" | grep -q "SEED-OK count=7" && ok "s296-সিড ×৭ (প্রি-ক্লিন-পরে)" || bad "s296-সিড ($S1)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: সোর্স-কাঠামো (today.ejs + style.css) ──"
EJS=$(cat "$APP/views/partials/home/today.ejs")
CSSF=$(cat "$APP/public/assets/css/style.css")
# session297-ইঞ্জিন-মার্কার
containsF "হুক __epk297QA" "$EJS" 'window.__epk297QA = {'
containsF "স্টেট-ভের্স (inView/tabVisible/tickN/IO)" "$EJS" 'var epk297InView = true, epk297TabVisible = true, epk297TickN = 0, epk297IO = null;'
containsF "sync-ফাংশন (টাইমার-স্টার্ট/স্টপ)" "$EJS" 'function epk297Sync297() {'
containsF "IO-observe" "$EJS" 'epk297IO.observe(section);'
containsF "threshold .12" "$EJS" '}, { threshold: 0.12 });'
containsF "visibilitychange-লিসনার" "$EJS" "document.addEventListener('visibilitychange', function () {"
containsF "tick-গেট (inView+tabVisible+!paused)" "$EJS" 'if (!paused && epk297InView && epk297TabVisible) { epk297TickN++; applyPaper((current + 1) % papers.length); }'
containsF "গ্রেসফুল-ডিগ্রেডেশন (IO-অসমর্থিত)" "$EJS" "if ('IntersectionObserver' in window) {"
containsF "IO-ব্যর্থতায় ফলব্যাক (catch)" "$EJS" '} catch (e297) { epk297IO = null; epk297InView = true; }'
# পরিবার-চুক্তি: হুক papers-শূন্যে-ও-সংজ্ঞায়িত (early-return-এর-আগে)
HL=$(echo "$EJS" | grep -nF 'window.__epk297QA = {' | head -1 | cut -d: -f1)
RL=$(echo "$EJS" | grep -nF 'if (!papers.length) return;' | head -1 | cut -d: -f1)
if [ -n "$HL" ] && [ -n "$RL" ] && [ "$HL" -lt "$RL" ]; then ok "হুক early-return-এর-আগে (শূন্যে-ও-সংজ্ঞায়িত)"; else bad "হুক-ক্রম (H=$HL R=$RL)"; fi
# no-regression (s291/s292/s296-চুক্তি অক্ষুণ্ণ)
containsF "s291-অক্ষুণ্ণ: wired-গার্ড" "$EJS" 'if (window.__epk291wired) return;'
containsF "s291-অক্ষুণ্ণ: অটো-স্লাইড ৩.৫সে" "$EJS" '}, 3500);'
containsF "s292-অক্ষুণ্ণ: QA-হুক" "$EJS" 'window.__epk292QA = {'
containsF "s292-অক্ষুণ্ণ: চেইন-ইঞ্জিন" "$EJS" 'function setImg296(p) {'
containsF "s296-অক্ষুণ্ণ: স্ট্যাট-রো মার্কআপ" "$EJS" '<div class="te-stats296" role="list"'
# CSS-মার্কার
containsF "CSS: ৫-কলাম @1440" "$CSSF" '@media (min-width: 1440px) {'
containsF "CSS: ৫-কলাম গ্রিড-লিটারাল" "$CSSF" 'repeat(5, minmax(0, 1fr));'
containsF "CSS: s296-৪-কলাম অক্ষুণ্ণ" "$CSSF" 'repeat(4, minmax(0, 1fr));'
containsF "CSS: ফিল্ম-বাটন হোভার-লিফট" "$CSSF" '.epk291-film-btn:hover { transform: translateY(-1px);'
containsF "CSS: নির্বাচিত-অ্যাকসেন্ট-রিং" "$CSSF" '.epk291-film-btn[aria-selected="true"] { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22), 0 0 0 1px color-mix(in srgb, var(--epkAcc291, var(--lf-brand-primary)) 24%, transparent); }'
containsF "CSS: মিনি-থাম্ব হোভার-পলিশ" "$CSSF" '.epk291-film-btn:hover .epk291-film-thumb { transform: rotate(-1.4deg) scale(1.05); }'
containsF "CSS: CTA-লিফট" "$CSSF" '#teKioskCta291:hover { transform: translateY(-1px);'
containsF "CSS: রিডিউসড-মোশন গার্ড (২৯৭-ব্লকে)" "$CSSF" '  .epk291-film-btn, .epk291-film-thumb, #teKioskCta291 { transition: none; }'
containsF "CSS: EOF-২৯৭-মার্কার" "$CSSF" '/* ═══════════ EOF সেশন ২৯৭ ═══════════ */'
# EJS-compile
node -e "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('$APP/views/partials/home/today.ejs','utf8'),{filename:'today.ejs'});console.log('COMPILE-OK');" 2>/dev/null | grep -qF 'COMPILE-OK' && ok "EJS-compile" || bad "EJS-compile"

echo "── ধাপ-২: মার্কার-সিড-হোম SSR ──"
curl -s "$BASE/" -o "$PAGE" || { bad "হোম-SSR ফেচ"; }
containsF "SSR: ইঞ্জিন-হুক-স্ক্রিপ্ট" "$(cat $PAGE)" 'window.__epk297QA = {'
containsF "SSR: IO-observe-স্ক্রিপ্ট" "$(cat $PAGE)" 'epk297IO.observe(section);'
containsF "SSR: kiosk-DOM" "$(cat $PAGE)" 'id="epKiosk291"'
# প্রত্যাশা-গণনা রেন্ডার্ড-HTML papers-JSON থেকে (session292-চুক্তি — DB-অন্য-সারি-উপস্থিতিতেও নির্ধারক)
PJ=$(sed -n 's/.*var papers = \[\(.*\)\];.*/\1/p' "$PAGE")
PN=$(echo "$PJ" | grep -o '"href"' | wc -l)
EXP=7
if [ "$PN" -gt 8 ]; then EXP=8; else EXP="$PN"; fi
BN=$(grep -o 'class="epk291-film-btn"' "$PAGE" | wc -l)
if [ "$BN" -eq "$EXP" ] && [ "$EXP" -ge 1 ]; then ok "ফিল্ম-বাটন = papers-JSON-মিল ($BN, cap-৮-অন্তর্ভুক্ত)"; else bad "ফিল্ম-বাটন ($BN ≠ প্রত্যাশা $EXP — papers=$PN)"; fi

echo "── ধাপ-৩: E2E (agent-browser) ──"
agent-browser close >/dev/null 2>&1 || true
sleep 1
OPENED=""
for k in 1 2 3; do
  agent-browser open "$BASE/" >/dev/null 2>&1
  sleep 2
  U=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$U" | grep -qF "localhost:8094"; then OPENED=1; break; fi
  sleep 1
done
if [ -n "$OPENED" ]; then ok "open (url-যাচাই)"; else bad "open ব্যর্থ (url=$U)"; fi
RD=$(poll '(function(){var k=!!document.getElementById("epKiosk291");return k?"READY":"WAIT";})()' 'READY' 50)
if echo "$RD" | grep -qF 'READY'; then ok "ব্রাউজার-রেডি (কিয়স্ক DOM)"; else skip "ব্রাউজার-রেডি-পোল ($RD)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
# হুক-উপস্থিতি + IO-সমর্থন
HK=$(ev '(function(){var t=typeof window.__epk297QA;return t==="object"?"HOOKOBJ":t;})()' | tr -d '"\\')
echo "$HK" | grep -qF 'HOOKOBJ' && ok "__epk297QA হুক-বস্তু" || bad "হুক ($HK)"
IO=$(ev '(function(){return window.__epk297QA.ioOn()?"IOON":"IOOFF";})()' | tr -d '"\\')
echo "$IO" | grep -qF 'IOON' && ok "IO-নির্মিত+observe" || bad "IO ($IO)"
# রিডিউসড-মোশন প্রোব (headless-ডিফল্ট: no-preference → টাইমার-পরীক্ষা চলে)
RM=$(ev '(function(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches?"RM":"NO";})()' | tr -d '"\\')
if echo "$RM" | grep -qF 'NO'; then ok "মোশন-প্রোব: no-preference (টাইমার-পরীক্ষা-সক্রিয়)"; else skip "reduced-motion-সক্রিয় — টাইমার-পরীক্ষা-স্কিপ"; fi
# কিয়স্ক-দৃশ্যমানে ইঞ্জিন-চালু (scrollIntoView → IO-সত্য → টাইমার-চালু)
SC=$(ev '(function(){document.getElementById("today-epaper").scrollIntoView({block:"center"});return "scrolled";})()' | tr -d '"\\')
if poll '(function(){return window.__epk297QA.inView()?"IN":"OUT";})()' 'IN' 20; then ok "দৃশ্যমানে inView=true (IO)"; else bad "inView-দৃশ্যমান"; fi
if echo "$RM" | grep -qF 'NO'; then
  if poll '(function(){return window.__epk297QA.timerOn()?"TON":"TOFF";})()' 'TON' 20; then ok "দৃশ্যমানে টাইমার-চালু"; else bad "টাইমার-চালু"; fi
  # অটো-অ্যাডভান্স (৩.৫সে টিক — ১২সে-জানালা)
  C1=$(ev '(function(){return String(window.__epk297QA.current());})()' | tr -d '"\\')
  if poll '(function(){var c=window.__epk297QA.current();return String(c)!=="'"$C1"'"?"ADV":"WAIT";})()' 'ADV' 24; then ok "অটো-অ্যাডভান্স (visible-টিক)"; else bad "অটো-অ্যাডভান্স (C1=$C1)"; fi
  # tickN-বৃদ্ধি
  N1=$(ev '(function(){return String(window.__epk297QA.tickN());})()' | tr -d '"\\')
  sleep 4.2
  N2=$(ev '(function(){return String(window.__epk297QA.tickN());})()' | tr -d '"\\')
  if [ "$N2" -gt "$N1" ] 2>/dev/null; then ok "tickN-বৃদ্ধি ($N1→$N2)"; else bad "tickN ($N1→$N2)"; fi
else
  skip "টাইমার-চালু/অ্যাডভান্স/tickN (reduced-motion)"
fi
# অদৃশ্যে ইঞ্জিন-স্থগিত (নিচে-স্ক্রল → kiosk সম্পূর্ণ-উপরে → IO-মিথ্যা → টাইমার-বন্ধ)
ev '(function(){window.scrollBy(0,1600);return "down";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk297QA.inView()?"IN":"OUT";})()' 'OUT' 20; then ok "অদৃশ্যে inView=false"; else bad "inView-অদৃশ্য"; fi
if poll '(function(){return window.__epk297QA.timerOn()?"TON":"TOFF";})()' 'TOFF' 20; then ok "অদৃশ্যে টাইমার-বন্ধ (CPU-সাশ্রয়)"; else bad "টাইমার-বন্ধ"; fi
# পুনঃ-দৃশ্যমানে পুনঃ-সূচনা
ev '(function(){window.scrollBy(0,-1600);return "up";})()' >/dev/null 2>&1
if poll '(function(){var i=window.__epk297QA.inView();var t=window.__epk297QA.timerOn();return (i&&t)?"RESUME":"WAIT";})()' 'RESUME' 20; then ok "পুনঃ-দৃশ্যমানে টাইমার-পুনঃ-সূচনা"; else bad "পুনঃ-সূচনা"; fi
# ম্যানুয়াল-tick (টাইমার-স্বাধীন)
MT=$(ev '(function(){var c0=window.__epk297QA.current();var r=window.__epk297QA.tick();var c1=window.__epk297QA.current();return (r&&c1!==c0)?"TICKOK":"TICKBAD";})()' | tr -d '"\\')
echo "$MT" | grep -qF 'TICKOK' && ok "ম্যানুয়াল-tick (current-অগ্রগতি)" || bad "ম্যানুয়াল-tick ($MT)"
# গ্রিড-কলাম: 1440→৫ (নতুন) / 1280→৪ (s296-চুক্তি)
agent-browser set viewport 1440 900 >/dev/null 2>&1; sleep 1
C5=$(ev '(function(){var f=document.getElementById("epk291Film");return "cols:"+getComputedStyle(f).gridTemplateColumns.split(" ").length;})()' | tr -d '"\\')
echo "$C5" | grep -qF 'cols:5' && ok "ফিল্ম গ্রিড ৫-কলাম @1440" || bad "৫-কলাম ($C5)"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
C4=$(ev '(function(){var f=document.getElementById("epk291Film");return "cols:"+getComputedStyle(f).gridTemplateColumns.split(" ").length;})()' | tr -d '"\\')
echo "$C4" | grep -qF 'cols:4' && ok "s296-চুক্তি: ৪-কলাম @1280" || bad "৪-কলাম ($C4)"
# মোবাইল-390 (no-reg)
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO";})()' | tr -d '"\\')
echo "$HS" | grep -qF 'NO' && ok "390px-ডক-hScroll-শূন্য" || bad "390px-hScroll ($HS)"
if agent-browser screenshot "$ROOT/download/s297-vpk-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s297-vpk-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
C1=$(node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null)
echo "$C1" | grep -q "CLEAN-OK deleted=7" && ok "s296-ক্লিন (deleted=7)" || bad "s296-ক্লিন ($C1)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট"

echo "══════════════════════════════"
echo "s297-vpkiosk: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
