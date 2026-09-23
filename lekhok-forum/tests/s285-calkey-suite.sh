#!/bin/bash
# s285-calkey-suite.sh — session285 বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep285 = ep284-বছর-স্ট্রিপে ↑↓←→-রোভিং (wrap) + Home/End + Enter/Space-সক্রিয় +
# রোভিং-ট্যাবইনডেক্স + is-act-শ্রেণি + প্রারম্ভিক-ফোকাস (is-cur) + জাম্পে ফোকাস-ফেরত;
# ep284/ep283/ep282/ep281/ep280 অক্ষুণ্ণ (র‍্যাপার-স্তর — ep284-ফাংশন-বডি-অস্পৃশ্য)।
# কভারেজ: ① সোর্স-কাঠামো (মডিউল-টোকেন + র‍্যাপার + হুক + css ep285-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (fresh-reboot + বহু-বছর-সিড — hasPayload-চুক্তি; সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser press): খোলায় is-cur-চিপে প্রারম্ভিক-ফোকাস (activeElement data-y ==
#             hook.year) + is-act ×১ + রোভিং-ট্যাবইনডেক্স (active 0, বাকি -1) → ↓-পরের-চিপ (ফোকাস-অনুসরণ) →
#             ↓-wrap (শেষ→প্রথম) → ↑-wrap (প্রথম→শেষ) → Home-প্রথম → End-শেষ → Enter-জাম্প (hook.year আপডেট +
#             স্ট্রিপ-বন্ধ + ফোকাস-ফেরত epCalMY) → পুনঃ-খোলায় is-cur-আর্ম → রি-রেন্ডার-সফট-আর্ম (স্টেপারে
#             is-act-সংরক্ষণ, ফোকাস-চুরি-শূন্য) → স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s284-seedyear পুনঃব্যবহার)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ containsF-কনটেন্ট-চুক্তি (PAGEC)
#         ④ পোর্ট-ফ্রি-পোলিং-কিল ⑤ ল্যাটিন-অঙ্ক-হুক-তুলনা (বাংলা-অঙ্ক-গ্রেপ-বারণ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s285-page.html
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
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
plen(){ node -e "const m=require('fs').readFileSync('$PAGE','utf8').match(/data-papers=.([^\"]*)/);try{console.log(JSON.parse(decodeURIComponent(m?m[1]:'[]')).length)}catch(e){console.log(0)}" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJS=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
containsF "QA-হুক __ep285QA" "$EJS" 'window.__ep285QA'
containsF "রোভিং-সেটার (tabindex + is-act)" "$EJS" "b.setAttribute('tabindex'"
containsF "is-act-টগল" "$EJS" "classList.toggle('is-act'"
containsF "↓→-নেভ" "$EJS" "k === 'ArrowDown' || k === 'ArrowRight'"
containsF "↑←-নেভ" "$EJS" "k === 'ArrowUp' || k === 'ArrowLeft'"
containsF "Home-গার্ড" "$EJS" "k === 'Home'"
containsF "End-গার্ড" "$EJS" "k === 'End'"
containsF "Enter/Space-সক্রিয়" "$EJS" "k === 'Enter' || k === ' '"
containsF "wrap-গণিত (ঋণাত্মক-সংশোধন)" "$EJS" "if (n < 0) n += chips.length"
containsF "খোলায়-প্রারম্ভিক-ফোকাস (র‍্যাপার)" "$EJS" 'ep284OpenListBase'
containsF "রি-রেন্ডার-সফট-আর্ম (র‍্যাপার)" "$EJS" 'ep284RenderBase'
containsF "বন্ধে-active-রিসেট (র‍্যাপার)" "$EJS" 'ep284CloseListBase'
containsF "জাম্পে-ফোকাস-ফেরত (epCalMY)" "$EJS" 'elCalMY.focus()'
containsF "ep284-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep284QA'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B285=$(echo "$CSSF" | sed -n '/session285 — বছর-স্ট্রিপে কী-বোর্ড-নেভিগেশন/,$p')
if [ -n "$B285" ]; then
  ok "ep285-ব্লক উপস্থিত"
  HEXN=$(echo "$B285" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep285-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep285-ব্লকে হেক্স $HEXN"; fi
  containsF "is-act-টিন্ট" "$B285" '.ep-cal-y.is-act'
  containsF "is-cur.is-act-আউটলাইন" "$B285" '.ep-cal-y.is-act.is-cur'
  containsF "reduced-motion-গার্ড" "$B285" 'prefers-reduced-motion'
else
  bad "ep285-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
PC0=$(node "$APP/scripts/s284-seedyear.js" clean 2>/dev/null | tail -1)
if echo "$PC0" | grep -q "CLEAN-OK"; then ok "প্রি-ক্লিন ($PC0 — কিল→ক্লিন→বুট-ক্রম; স্টেল-মার্কার-মুক্ত বেসলাইন)"; else bad "প্রি-ক্লিন-ব্যর্থ ($PC0)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)

echo "── ধাপ-২.৫: বহু-বছর-মার্কার-সিড (s284-হেল্পার — ২০২৬+২০২৫ গ্যারান্টি) ──"
kill8094
SR=$(node "$APP/scripts/s284-seedyear.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "বহু-বছর-মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; SEEDED=0; E2E_OK=0; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
SEEDLEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
E2E_OK=1
if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 2 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরে-অপ্রত্যাশিত (HTTP $PC2 SEED=$SEEDLEN)"; E2E_OK=0; fi

echo "── ধাপ-২.৭: রিডার-মার্কআপ যাচাই (সিড-পরে — hasPayload-চুক্তি) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
MK=$(grep -o 'epCalYList\|epCalMY"\|epCalMPanel\|epCalMGrid' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "বছর-তালিকা-মার্কআপ রেন্ডারড (payload-অবস্থা; ৪-উপাদান)"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser press) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep285QA==="object"&&typeof window.__ep285QA.move==="function"&&typeof window.__ep285QA.focused==="function"&&typeof window.__ep284QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep285QA + __ep284QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
S1=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
if [ "$S1" = "true" ]; then ok "স্ট্রিপ-খোলা (পূর্বশর্ত)"; else bad "স্ট্রিপ-খোলা-ব্যর্থ ($S1)"; fi
FA=$(ev 'window.__ep285QA.focused()' 2>/dev/null | tr -dc '0-9')
FY=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
CY=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
if [ -n "$FA" ] && [ "$FA" = "$FY" ] && [ "$FY" = "$CY" ]; then ok "খোলায় is-cur-চিপে প্রারম্ভিক-ফোকাস (focused=$FA == active=$FY == year $CY)"; else bad "প্রারম্ভিক-ফোকাস-ব্যর্থ (focused=$FA active=$FY year=$CY)"; fi
ACTN=$(ev 'document.querySelectorAll(".ep-cal-y.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$ACTN" = "1" ]; then ok "is-act ×১ (খোলায়-আর্ম)"; else bad "is-act-ব্যর্থ ($ACTN)"; fi
ROV=$(ev 'var c=[].slice.call(document.querySelectorAll(".ep-cal-y")); JSON.stringify({z:c.filter(function(b){return b.getAttribute("tabindex")==="0"}).length,m:c.filter(function(b){return b.getAttribute("tabindex")==="-1"}).length,n:c.length})' 2>/dev/null | tr -d '"\\')
ROVZ=$(echo "$ROV" | sed 's/.*z:\([0-9]*\).*/\1/')
ROVM=$(echo "$ROV" | sed 's/.*m:\([0-9]*\).*/\1/')
ROVN=$(echo "$ROV" | sed 's/.*n:\([0-9]*\).*/\1/')
if [ "$ROVZ" = "1" ] && [ "$ROVM" = "$((ROVN-1))" ] && [ "$ROVN" -ge 2 ]; then ok "রোভিং-ট্যাবইনডেক্স (z=1, m=$ROVM, n=$ROVN)"; else bad "রোভিং-ব্যর্থ ($ROV)"; fi
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A1=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
F1=$(ev 'window.__ep285QA.focused()' 2>/dev/null | tr -dc '0-9')
if [ -n "$A1" ] && [ "$A1" != "$FY" ] && [ "$F1" = "$A1" ]; then ok "↓-পরের-চিপ ($FY→$A1 + ফোকাস-অনুসরণ)"; else bad "↓-ব্যর্থ (active=$A1 focused=$F1)"; fi
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A2=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A2" = "$FY" ]; then ok "↓-wrap (শেষ→প্রথম $A2)"; else bad "↓-wrap-ব্যর্থ (active=$A2 exp=$FY)"; fi
agent-browser press ArrowUp >/dev/null 2>&1; sleep 0.2
A3=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A3" = "$A1" ]; then ok "↑-wrap (প্রথম→শেষ $A3)"; else bad "↑-wrap-ব্যর্থ (active=$A3 exp=$A1)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.2
A4=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
CH1=$(ev '+document.querySelector(".ep-cal-y").getAttribute("data-y")' 2>/dev/null | tr -dc '0-9')
if [ "$A4" = "$CH1" ]; then ok "Home-প্রথম-চিপ ($A4)"; else bad "Home-ব্যর্থ (active=$A4 first=$CH1)"; fi
agent-browser press End >/dev/null 2>&1; sleep 0.2
A5=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
CHN=$(ev 'var c=document.querySelectorAll(".ep-cal-y"); +c[c.length-1].getAttribute("data-y")' 2>/dev/null | tr -dc '0-9')
if [ "$A5" = "$CHN" ]; then ok "End-শেষ-চিপ ($A5)"; else bad "End-ব্যর্থ (active=$A5 last=$CHN)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.2
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A6=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A6" != "$CY" ]; then ok "অ-বর্তমান-বছরে নেভ-অবস্থান (Home→↓ target=$A6 ≠ cur $CY)"; else bad "টার্গেট-অবস্থান-ব্যর্থ ($A6 == $CY)"; fi
agent-browser press Enter >/dev/null 2>&1; sleep 0.3
JY=$(ev 'window.__ep284QA.jumped()' 2>/dev/null | tr -dc '0-9')
S2=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
P4=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
PH4=$(ev 'document.getElementById("epCalMPanel").hidden' | tr -d '"')
FBACK=$(ev 'document.activeElement && document.activeElement.id || ""' 2>/dev/null | tr -d '"')
if [ "$JY" = "$A6" ] && [ "$S2" = "false" ] && [ "$P4" = "true" ] && [ "$PH4" = "false" ] && [ "$FBACK" = "epCalMY" ]; then ok "Enter-জাম্প (year=$JY + স্ট্রিপ-বন্ধ + প্যানেল-খোলা-অটুট + ফোকাস-ফেরত epCalMY)"; else bad "Enter-জাম্প-ব্যর্থ (jumped=$JY strip=$S2 panel=$P4 hidden=$PH4 focus=$FBACK)"; fi
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
A7=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
CY2=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
if [ "$A7" = "$CY2" ]; then ok "পুনঃ-খোলায় is-cur-আর্ম (active=$A7 == year $CY2)"; else bad "পুনঃ-আর্ম-ব্যর্থ ($A7 ≠ $CY2)"; fi
agent-browser click '#epCalMYPrev' >/dev/null 2>&1; sleep 0.2
STFOC=$(ev 'document.activeElement && document.activeElement.id || ""' 2>/dev/null | tr -d '"')
A8=$(ev 'window.__ep285QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$STFOC" = "epCalMYPrev" ] && [ "$A8" != "0" ]; then ok "রি-রেন্ডার-সফট-আর্ম (স্টেপার-ফোকাস-অটুট + is-act-সংরক্ষিত active=$A8)"; else bad "সফট-আর্ম-ব্যর্থ (focus=$STFOC active=$A8)"; fi
agent-browser press Escape >/dev/null 2>&1; sleep 0.2
P3=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
if [ "$P3" = "false" ]; then ok "Escape-পূর্ণ-বন্ধ (ep283-সেমান্টিক-অক্ষুণ্ণ)"; else bad "Escape-ব্যর্থ ($P3)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (স্ট্রিপ-খোলা + is-act) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3; agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3; }
agent-browser screenshot "$APP/tests/s285-calkey-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s285-calkey-desk.png" ]; then ok "s285-calkey-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (স্ট্রিপ-খোলা)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s285-calkey-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s285-calkey-mobile390.png" ]; then ok "s285-calkey-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-ব্যর্থ) ──"
skip "E2E-আচরণ"
skip "স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (mo268-চুক্তি) ──"
if [ "$SEEDED" = "1" ]; then
  kill8094
  CR=$(node "$APP/scripts/s284-seedyear.js" clean 2>/dev/null | tail -1)
  if echo "$CR" | grep -q "CLEAN-OK deleted=2 residual=0"; then ok "মার্কার-ক্লিন (ডিলিট=২ residual=০)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
  FINLEN=$(plen)
  if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
else
  skip "মার্কার-ক্লিন (সিড-ব্যর্থতা)"
  skip "নেট-DB-রাইট-শূন্য"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
