#!/bin/bash
# s299-eppref-suite.sh — session299 ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: PLANS session298-প্রস্তাব — কিয়স্ক-শিট নির্বাচন/হোভার/ফোকাস-ইচ্ছায় রিডার-ডিপ-লিংক
#   (/epaper?file=<id>) প্রিফেচ — প্রকৃত-নেভিগেশনে রিডার-প্রস্তুতি (ওয়ার্ম-নেভিগেশন)।
# সমাধান (ep299): ① একক-ফানেল epk299Prefetch299 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড +
#   link[rel=prefetch][data-epk299]-ইনজেকশন (ব্রাউজার-লো-প্রায়োরিটি-ক্যাশ-ওয়ার্ম)
#   ② ট্রিগার — নির্বাচন (ফিল্ম-ক্লিক, মোবাইল-পথ) + হোভার/ফোকাস (front-sheet) + CTA-হোভার
#   ③ উষ্ণ-সংকেত-মিরর — applyPaper-এ epk299-warm-ক্লাস warmed-হিসেবে-সামঞ্জস্য (স্টেল-শূন্য)
#   ④ __epk299QA হুক (prefetched/has/last/links — papers-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি)
# [Mandatory-স্টাইল]: CSS session299-ব্লক হেক্স-শূন্য — উষ্ণ-হোভার-বাটন অ্যাকসেন্ট-রিং (color-mix) +
#   উষ্ণ-শিট-প্রান্ত অ্যাকসেন্ট-ফেড + হোভার-বাটন-ট্রানজিশন-সম্প্রসারণ + 640px-সংকোচন + রিডিউসড-মোশন।
# কভারেজ: ① সোর্স-কাঠামো (today.ejs + style.css — session299-মার্কার + s291/s292/s297-অক্ষুণ্ণ + EJS-compile)
#          ② SSR (সিড-হোম): হুক-স্ক্রিপ্ট + ফিল্ম-বাটন = papers-JSON-গণনা + উষ্ণ-ক্লাস/প্রিফেচ-লিংক SSR-অনুপস্থিত
#          ③ E2E (agent-browser): বুট-শূন্য-প্রিফেচ + hover→prefetch/warm/links + ডিডুপ + select + CTA-ডিডুপ +
#             tick→অপ্রিফেচডে-কোল্ড + পুনঃ-hover→prefetch + 390-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-ক্লিন নেট-শূন্য (s296-seedhome seed|clean)
# চুক্তি: eval-এ else-বিহীন-ternary-নিষিদ্ধ (cond&&expr-রীতি) + IIFE-র‍্যাপ + কিল→সিড→বুট ক্রম + open-রিট্রাই
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s299-home-page.html
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
# session299-ইঞ্জিন-মার্কার
containsF "হুক __epk299QA" "$EJS" 'window.__epk299QA = {'
containsF "একক-ফানেল-স্বাক্ষর" "$EJS" 'function epk299Prefetch299(url, reason299) {'
containsF "ফানেল-ডিডুপ-গার্ড" "$EJS" 'if (!url || epk299Warmed[url]) return false;'
containsF "অফলাইন/saveData-গার্ড" "$EJS" 'if (navigator.onLine === false || (cn299 && cn299.saveData)) return false;'
containsF "link[rel=prefetch]-ইনজেকশন-সেলেক্টর" "$EJS" "document.querySelectorAll('link[rel=\"prefetch\"][data-epk299]')"
containsF "ইনজেকশন-অ্যাট্রি-সেট" "$EJS" "l299.setAttribute('data-epk299', '1');"
containsF "নির্বাচন-ট্রিগার (ফিল্ম-ক্লিক)" "$EJS" "if (!isNaN(i) && papers[i]) { applyPaper(i); resetTimer(); epk299Prefetch299(papers[i].href, 'select'); }"
containsF "হোভার-লিসনার (front)" "$EJS" "front.addEventListener('mouseenter', epk299Hover299);"
containsF "ফোকাস-লিসনার (front)" "$EJS" "front.addEventListener('focusin', epk299Hover299);"
containsF "CTA-হোভার-ট্রিগার" "$EJS" "if (cta) cta.addEventListener('mouseenter', function () { if (papers[current]) epk299Prefetch299(papers[current].href, 'cta'); });"
containsF "উষ্ণ-সংকেত-মিরর (applyPaper)" "$EJS" "if (epk299Warmed[p.href]) { front.classList.add('epk299-warm'); } else { front.classList.remove('epk299-warm'); } /* session299: উষ্ণ-সংকেত-মিরর */"
# পরিবার-চুক্তি: হুক papers-শূন্যে-ও-সংজ্ঞায়িত (early-return-এর-আগে)
HL=$(echo "$EJS" | grep -nF 'window.__epk299QA = {' | head -1 | cut -d: -f1)
RL=$(echo "$EJS" | grep -nF 'if (!papers.length) return;' | head -1 | cut -d: -f1)
if [ -n "$HL" ] && [ -n "$RL" ] && [ "$HL" -lt "$RL" ]; then ok "হুক early-return-এর-আগে (শূন্যে-ও-সংজ্ঞায়িত)"; else bad "হুক-ক্রম (H=$HL R=$RL)"; fi
# no-regression (s291/s292/s296/s297-চুক্তি অক্ষুণ্ণ)
containsF "s297-অক্ষুণ্ণ: QA-হুক" "$EJS" 'window.__epk297QA = {'
containsF "s297-অক্ষুণ্ণ: sync-ফানেল" "$EJS" 'function epk297Sync297() {'
containsF "s292-অক্ষুণ্ণ: QA-হুক" "$EJS" 'window.__epk292QA = {'
containsF "s292-অক্ষুণ্ণ: চেইন-ইঞ্জিন" "$EJS" 'function setImg296(p) {'
containsF "s291-অক্ষুণ্ণ: wired-গার্ড" "$EJS" 'if (window.__epk291wired) return;'
containsF "s291-অক্ষুণ্ণ: অটো-স্লাইড ৩.৫সে" "$EJS" '}, 3500);'
# CSS-মার্কার (session299-ব্লক)
containsF "CSS: উষ্ণ-হোভার-বাটন-রিং" "$CSSF" '.epk291-front.epk299-warm .epk291-hoverbtn296 {'
containsF "CSS: উষ্ণ-শিট-প্রান্ত-ফেড" "$CSSF" '.epk291-front.epk299-warm .epk291-edge {'
containsF "CSS: হোভার-বাটন-ট্রানজিশন-সম্প্রসারণ" "$CSSF" '.epk291-hoverbtn296 { transition: transform .22s ease, box-shadow .22s ease, filter .22s ease; }'
containsF "CSS: 640px-সংকোচন" "$CSSF" '@media (max-width: 640px) {'
containsF "CSS: রিডিউসড-মোশন (২৯৯-ব্লকে)" "$CSSF" '  .epk291-hoverbtn296, .epk291-front.epk299-warm .epk291-hoverbtn296 { transition: none; }'
containsF "CSS: EOF-২৯৯-মার্কার" "$CSSF" '/* ═══════════ EOF সেশন ২৯৯ ═══════════ */'
# CSS-ব্লক হেক্স-শূন্য (ব্লক-বিস্তারে — টোকেন-শুধু চুক্তি)
BLK=$(echo "$CSSF" | sed -n '/সেশন ২৯৯ (session299/,/EOF সেশন ২৯৯/p')
if echo "$BLK" | grep -Eq '#[0-9a-fA-F]{3,8}'; then bad "CSS-ব্লক-হেক্স-উপস্থিত (নিষিদ্ধ)"; else ok "CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; fi
# no-reg CSS (পূর্ব-সেশন-চুক্তি)
containsF "CSS: s297-৫-কলাম @1440 অক্ষুণ্ণ" "$CSSF" '@media (min-width: 1440px) {'
containsF "CSS: s297-৫-কলাম-লিটারাল অক্ষুণ্ণ" "$CSSF" 'repeat(5, minmax(0, 1fr));'
containsF "CSS: s296-৪-কলাম অক্ষুণ্ণ" "$CSSF" 'repeat(4, minmax(0, 1fr));'
containsF "CSS: EOF-২৯৭-মার্কার অক্ষুণ্ণ" "$CSSF" '/* ═══════════ EOF সেশন ২৯৭ ═══════════ */'
# EJS-compile
node -e "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('$APP/views/partials/home/today.ejs','utf8'),{filename:'today.ejs'});console.log('COMPILE-OK');" 2>/dev/null | grep -qF 'COMPILE-OK' && ok "EJS-compile" || bad "EJS-compile"

echo "── ধাপ-২: মার্কার-সিড-হোম SSR ──"
curl -s "$BASE/" -o "$PAGE" || { bad "হোম-SSR ফেচ"; }
PG=$(cat "$PAGE")
containsF "SSR: প্রিফেচ-হুক-স্ক্রিপ্ট" "$PG" 'window.__epk299QA = {'
containsF "SSR: ফানেল-স্ক্রিপ্ট" "$PG" 'function epk299Prefetch299(url, reason299) {'
containsF "SSR: kiosk-DOM" "$PG" 'id="epKiosk291"'
# উষ্ণ-ক্লাস/প্রিফেচ-লিংক মার্কআপ-স্তরে-অনুপস্থিত (JS-only — ইচ্ছা-সচেতন; ইনলাইন-ইঞ্জিন-স্ক্রিপ্ট-বর্জিত)
PGM=$(python3 -c "import re,sys;print(re.sub(r'<script.*?</script>','',sys.stdin.read(),flags=re.S))" < "$PAGE")
if echo "$PGM" | grep -qF 'epk299-warm'; then bad "SSR-মার্কআপে উষ্ণ-ক্লাস-উপস্থিত (নিষিদ্ধ — JS-only)"; else ok "SSR-মার্কআপ উষ্ণ-ক্লাস-শূন্য (JS-only)"; fi
if echo "$PGM" | grep -qF 'rel="prefetch"'; then bad "SSR-মার্কআপে prefetch-লিংক-উপস্থিত (নিষিদ্ধ — ইচ্ছা-গেটেড)"; else ok "SSR-মার্কআপ prefetch-লিংক-শূন্য (ইচ্ছা-গেটেড)"; fi
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
# ইঞ্জিন-ফ্রিজ (section-এ প্রকৃত-mouseenter → paused=true — অটো-স্লাইড-রেস-শূন্য নির্ধারকতা)
ev '(function(){var s=document.getElementById("today-epaper");s.dispatchEvent(new MouseEvent("mouseenter"));return "P";})()' >/dev/null 2>&1
# হুক-উপস্থিতি (papers-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি)
HK=$(ev '(function(){var t=typeof window.__epk299QA;return t==="object"?"HOOKOBJ":t;})()' | tr -d '"\\')
echo "$HK" | grep -qF 'HOOKOBJ' && ok "__epk299QA হুক-বস্তু" || bad "হুক ($HK)"
# বুট-শূন্য-প্রিফেচ (ইচ্ছা-গেট — applyPaper(0)-এ প্রিফেচ-নিষিদ্ধ)
B0=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
echo "$B0" | grep -qF 'N0' && ok "বুট-প্রিফেচ-শূন্য (ইচ্ছা-গেট)" || bad "বুট-প্রিফেচ ($B0)"
# বুট-কোল্ড (উষ্ণ-ক্লাস-অনুপস্থিত)
BC=$(ev '(function(){var f=document.getElementById("epk291Front");return f.classList.contains("epk299-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$BC" | grep -qF 'COLD' && ok "বুট-কোল্ড (উষ্ণ-ক্লাস-শূন্য)" || bad "বুট-কোল্ড ($BC)"
# হোভার-ইচ্ছা → প্রিফেচ + উষ্ণ-ক্লাস + লিংক-ইনজেকশন
ev '(function(){var f=document.getElementById("epk291Front");f.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk299QA.prefetched()>0?"P1":"WAIT";})()' 'P1' 20; then ok "হোভার→প্রিফেচ-গণনা ≥১"; else bad "হোভার→প্রিফেচ"; fi
HA=$(ev '(function(){var f=document.getElementById("epk291Front");return window.__epk299QA.has(f.getAttribute("href"))?"HAS":"NO";})()' | tr -d '"\\')
echo "$HA" | grep -qF 'HAS' && ok "হোভার→has(current-href)" || bad "has($HA)"
LA=$(ev '(function(){return window.__epk299QA.last()==="hover"?"RHOVER":"R"+window.__epk299QA.last();})()' | tr -d '"\\')
echo "$LA" | grep -qF 'RHOVER' && ok "হোভার→কারণ=hover" || bad "কারণ ($LA)"
WA=$(ev '(function(){var f=document.getElementById("epk291Front");return f.classList.contains("epk299-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$WA" | grep -qF 'WARM' && ok "হোভার→উষ্ণ-ক্লাস" || bad "উষ্ণ-ক্লাস ($WA)"
LN=$(ev '(function(){return "L"+window.__epk299QA.links();})()' | tr -d '"\\')
if [ "$(echo "$LN" | sed 's/L//')" -ge 1 ] 2>/dev/null; then ok "link[rel=prefetch]-ইনজেকশন ($LN)"; else bad "ইনজেকশন ($LN)"; fi
# ডিডুপ — পুনঃ-হোভারে গণনা-অপরিবর্তিত
D1=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
ev '(function(){var f=document.getElementById("epk291Front");f.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
D2=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
if [ "$D1" = "$D2" ]; then ok "ডিডুপ — পুনঃ-হোভারে অপরিবর্তিত ($D1)"; else bad "ডিডুপ ($D1→$D2)"; fi
# নির্বাচন-ইচ্ছা — ফিল্ম-বাটন-ক্লিকে পরের-পত্রিকা-প্রিফেচ + aria-selected-স্থানান্তর
ev '(function(){var b=document.querySelectorAll(".epk291-film-btn")[1];b.click();return "C";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk299QA.prefetched()>1?"P2":"WAIT";})()' 'P2' 20; then ok "নির্বাচন→প্রিফেচ-গণনা ≥২"; else bad "নির্বাচন→প্রিফেচ"; fi
SA=$(ev '(function(){var b=document.querySelectorAll(".epk291-film-btn")[1];return b.getAttribute("aria-selected")==="true"?"SEL1":"NO";})()' | tr -d '"\\')
echo "$SA" | grep -qF 'SEL1' && ok "নির্বাচন→aria-selected-স্থানান্তর" || bad "aria-selected ($SA)"
LB=$(ev '(function(){return window.__epk299QA.last()==="select"?"RSEL":"R"+window.__epk299QA.last();})()' | tr -d '"\\')
echo "$LB" | grep -qF 'RSEL' && ok "নির্বাচন→কারণ=select" || bad "নির্বাচন-কারণ ($LB)"
# CTA-হোভার-ডিডুপ — একই-URL (বর্তমান-পত্রিকা) → গণনা-অপরিবর্তিত
C1=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
ev '(function(){var c=document.getElementById("teKioskCta291");c.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
C2=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
if [ "$C1" = "$C2" ]; then ok "CTA-হোভার-ডিডুপ — একই-URL অপরিবর্তিত ($C1)"; else bad "CTA-ডিডুপ ($C1→$C2)"; fi
# ম্যানুয়াল-tick → অপ্রিফেচড-পত্রিকায় কোল্ড (উষ্ণ-মিরর-বিলোপ) + প্রিফেচ-শূন্য-বৃদ্ধি
T1=$(ev '(function(){var r=window.__epk297QA.tick();return r?"TICKOK":"TICKBAD";})()' | tr -d '"\\')
echo "$T1" | grep -qF 'TICKOK' && ok "ম্যানুয়াল-tick (s297-চুক্তি)" || bad "ম্যানুয়াল-tick ($T1)"
TC=$(ev '(function(){var f=document.getElementById("epk291Front");return f.classList.contains("epk299-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$TC" | grep -qF 'COLD' && ok "অপ্রিফেচডে-কোল্ড (উষ্ণ-মিরর)" || bad "অপ্রিফেচডে-কোল্ড ($TC)"
T2=$(ev '(function(){return "N"+window.__epk299QA.prefetched();})()' | tr -d '"\\')
if [ "$C1" = "$T2" ]; then ok "tick→প্রিফেচ-শূন্য-বৃদ্ধি (applyPaper-প্রিফেচ-নিষিদ্ধ)"; else bad "tick-প্রিফেচ ($C1→$T2)"; fi
# পুনঃ-হোভারে নতুন-পত্রিকা-প্রিফেচ
ev '(function(){var f=document.getElementById("epk291Front");f.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk299QA.prefetched()>2?"P3":"WAIT";})()' 'P3' 20; then ok "পুনঃ-হোভার→নতুন-প্রিফেচ (≥৩)"; else bad "পুনঃ-হোভার-প্রিফেচ"; fi
WB=$(ev '(function(){var f=document.getElementById("epk291Front");return f.classList.contains("epk299-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$WB" | grep -qF 'WARM' && ok "পুনঃ-হোভার→উষ্ণ-পুনঃ-প্রতিষ্ঠা" || bad "পুনঃ-উষ্ণ ($WB)"
# মোবাইল-390 (no-reg)
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO";})()' | tr -d '"\\')
echo "$HS" | grep -qF 'NO' && ok "390px-ডক-hScroll-শূন্য" || bad "390px-hScroll ($HS)"
if agent-browser screenshot "$ROOT/download/s299-eppref-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s299-eppref-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
CL=$(node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null)
echo "$CL" | grep -q "CLEAN-OK deleted=7" && ok "s296-ক্লিন (deleted=7)" || bad "s296-ক্লিন ($CL)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট"

echo "══════════════════════════════"
echo "s299-eppref: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
