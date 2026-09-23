#!/bin/bash
# s284-calyear-suite.sh — session284 মাস-প্যানেলে বছর-তালিকা-শর্টকাট সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep284 = বছর-লেবেল-ক্লিকে ইন-প্যানেল বছর-তালিকা-স্ট্রিপ (avail-উদ্ভূত) + বছর-ক্লিকে
# স্টেপার-জাম্প (±১-পুনরাবৃত্তি-শূন্য); ep283-মাস-প্যানেল/ep282-কম্বো/ep281-ক্যাশ/ep280-৩-প্যানেল অক্ষুণ্ণ।
# কভারেজ: ① সোর্স-কাঠামো (বছর-লেবেল-বাটন + ylist-মার্কআপ + মডিউল + র‍্যাপার-সিঙ্ক + __ep284QA +
#             css ep284-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (fresh-reboot + বহু-বছর-সিড — hasPayload-শর্তসাপেক্ষ-রেন্ডার-চুক্তি:
#             রিডার-মার্কআপ-অ্যাসার্ট অবশ্যই payload-অবস্থায়; সব-curl-এ ?nc=$RANDOM — প্রক্সি-HTML-ক্যাশ-গোটচা)
#          ③ E2E (agent-browser): স্ট্রিপ-প্রারম্ভিক-বন্ধ → বছর-লেবেল-ক্লিকে খোলা (isOpen + hidden=false +
#             aria-expanded=true) → চিপ-গণনা == hook.years() ≥২ (গণনা-ভিত্তিক) + is-cur ×১ →
#             অ-বর্তমান-বছর-ক্লিকে জাম্প (hook.year() আপডেট + স্ট্রিপ-বন্ধ + মাস-গ্রিড-পুনঃরেন্ডার +
#             disabled-গণনা) → মাস-ক্লিকে এক-ক্লিক-জাম্প (ep283.jumped==elDateInput.value + সেই-বছর) →
#             পুনঃ-খোলায় স্ট্রিপ-বন্ধ + বছর-calY-রিসেট → স্টেপার-চলাকালে স্ট্রিপ-is-cur-পুনঃসিঙ্ক (র‍্যাপার-প্রমাণ) →
#             Escape-পূর্ণ-বন্ধ + aria-ফেরত → কার্সর-প্রমাণ → স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s284-seedyear — kill→seed→boot ক্রম)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ containsF-কনটেন্ট-চুক্তি (PAGEC)
#         ④ পোর্ট-ফ্রি-পোলিং-কিল ⑤ বাংলা-অঙ্ক-গ্রেপ-বারণ (ল্যাটিন-অঙ্ক-হুক-তুলনা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s284-page.html
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
containsF "বছর-লেবেল বাটন-রূপান্তর (aria-haspopup)" "$EJS" 'class="ep-cal-mylabel" id="epCalMY" aria-haspopup="true"'
containsF "বছর-লেবেল aria-expanded প্রারম্ভিক-false" "$EJS" 'aria-expanded="false" title="বছর-তালিকা খুলুন"'
containsF "বছর-তালিকা-স্ট্রিপ মার্কআপ (hidden-প্রারম্ভিক)" "$EJS" 'id="epCalYList" role="listbox" aria-label="বছর নির্বাচন" hidden'
containsF "QA-হুক __ep284QA" "$EJS" 'window.__ep284QA'
containsF "years-তালিকা (avail-উদ্ভূত)" "$EJS" 'function ep284YearsList'
containsF "বছর-চিপ রেন্ডার" "$EJS" 'function ep284Render'
containsF "বছর-জাম্প (ep283Year-সেট + পুনঃরেন্ডার + স্ট্রিপ-বন্ধ)" "$EJS" 'ep283Year = +b.getAttribute'
containsF "প্যানেল-খোলা-সিঙ্ক (র‍্যাপার-স্তর)" "$EJS" 'ep283OpenPanelBase'
containsF "প্যানেল-বন্ধ-সিঙ্ক (র‍্যাপার-স্তর)" "$EJS" 'ep283ClosePanelBase'
containsF "রেন্ডার-সিঙ্ক (স্টেপার-চলাকালে স্ট্রিপ-পুনঃসিঙ্ক)" "$EJS" 'ep283RenderBase'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B284=$(echo "$CSSF" | sed -n '/session284 — মাস-প্যানেলে বছর-তালিকা-শর্টকাট/,$p')
if [ -n "$B284" ]; then
  ok "ep284-ব্লক উপস্থিত"
  HEXN=$(echo "$B284" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep284-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep284-ব্লকে হেক্স $HEXN"; fi
  containsF "বছর-লেবেল-ট্রিগার-স্টাইল (button-রিসেট+হোভার)" "$B284" '.ep-cal-mylabel'
  containsF "স্ট্রিপ-স্টাইল" "$B284" '.ep-cal-ylist'
  containsF "চিপ-স্টাইল" "$B284" '.ep-cal-y'
  containsF "বর্তমান-বছর-ফিল (is-cur)" "$B284" '.ep-cal-y.is-cur'
  containsF "এন্ট্রি-অ্যানিমেশন" "$B284" '@keyframes ep-cal-y-in'
  containsF "reduced-motion-গার্ড" "$B284" 'prefers-reduced-motion'
else
  bad "ep284-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)

echo "── ধাপ-২.৫: বহু-বছর-মার্কার-সিড (কিল→সিড→বুট — ২০২৬+২০২৫ গ্যারান্টি) ──"
kill8094
SR=$(node "$APP/scripts/s284-seedyear.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "বহু-বছর-মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; SEEDED=0; E2E_OK=0; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
SEEDLEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
E2E_OK=1
if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 2 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরে-অপ্রত্যাশিত (HTTP $PC2 SEED=$SEEDLEN)"; E2E_OK=0; fi

echo "── ধাপ-২.৭: রিডার-মার্কআপ যাচাই (সিড-পরে — hasPayload-শর্তসাপেক্ষ-রেন্ডার-চুক্তি) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
MK=$(grep -o 'epCalYList\|epCalMY"\|epCalMPanel\|epCalMGrid' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "বছর-তালিকা-মার্কআপ রেন্ডারড (payload-অবস্থা; ৪-উপাদান)"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi
PAGEC=$(cat "$PAGE")
containsF "বছর-লেবেল-বাটন (রেন্ডার্ড)" "$PAGEC" 'aria-expanded="false" title="বছর-তালিকা খুলুন"'
containsF "স্ট্রিপ-মার্কআপ (রেন্ডার্ড)" "$PAGEC" 'id="epCalYList" role="listbox"'

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep284QA==="object"&&typeof window.__ep284QA.open==="function"&&typeof window.__ep284QA.jumped==="function"&&typeof window.__ep283QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep284QA + __ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
CUR=$(ev 'getComputedStyle(document.getElementById("epCalMY")).cursor' | tr -d '"')
if [ "$CUR" = "pointer" ]; then ok "বছর-লেবেল ক্লিকেবল (cursor:pointer)"; else bad "কার্সর-ব্যর্থ ($CUR)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
P1=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
if [ "$P1" = "true" ]; then ok "মাস-প্যানেল-খোলা (পূর্বশর্ত)"; else bad "প্যানেল-খোলা-ব্যর্থ ($P1)"; fi
S0=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
H0=$(ev 'document.getElementById("epCalYList").hidden' | tr -d '"')
AX0=$(ev 'document.getElementById("epCalMY").getAttribute("aria-expanded")' | tr -d '"')
if [ "$S0" = "false" ] && [ "$H0" = "true" ] && [ "$AX0" = "false" ]; then ok "স্ট্রিপ প্রারম্ভিক-বন্ধ (isOpen + hidden + aria — প্যানেল-খোলায়-রিসেট-র‍্যাপার)"; else bad "স্ট্রিপ-প্রারম্ভিক-অবস্থা-ব্যর্থ (open=$S0 hidden=$H0 aria=$AX0)"; fi
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
S1=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
H1=$(ev 'document.getElementById("epCalYList").hidden' | tr -d '"')
AX1=$(ev 'document.getElementById("epCalMY").getAttribute("aria-expanded")' | tr -d '"')
if [ "$S1" = "true" ] && [ "$H1" = "false" ] && [ "$AX1" = "true" ]; then ok "বছর-লেবেল-ক্লিকে স্ট্রিপ-খোলা (isOpen + hidden=false + aria-expanded=true)"; else bad "স্ট্রিপ-খোলা-ব্যর্থ (open=$S1 hidden=$H1 aria=$AX1)"; fi
YN=$(ev 'window.__ep284QA.years()' 2>/dev/null | tr -dc '0-9')
CHIPN=$(ev 'document.querySelectorAll(".ep-cal-y").length' 2>/dev/null | tr -dc '0-9')
if [ -n "$YN" ] && [ "$YN" -ge 2 ] && [ "$CHIPN" = "$YN" ]; then ok "চিপ-গণনা == hook.years() ($CHIPN == $YN — ≥২-বছর-গ্যারান্টি)"; else bad "বছর-গণনা-ব্যর্থ (years=$YN chips=$CHIPN)"; fi
CURN=$(ev 'document.querySelectorAll(".ep-cal-y.is-cur").length' 2>/dev/null | tr -dc '0-9')
if [ "$CURN" = "1" ]; then ok "বর্তমান-বছর-ফিল (is-cur ×১)"; else bad "is-cur-ব্যর্থ ($CURN)"; fi
CURY=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
TGT=$(ev 'var t=document.querySelectorAll(".ep-cal-y:not(.is-cur)")[0]; t ? t.getAttribute("data-y") : ""' 2>/dev/null | tr -dc '0-9')
if [ -n "$TGT" ] && [ "$TGT" != "$CURY" ]; then ok "অ-বর্তমান-বছর-চিপ শনাক্ত (cur=$CURY → target=$TGT)"; else bad "টার্গেট-চিপ-ব্যর্থ (cur=$CURY tgt=$TGT)"; fi
agent-browser eval 'document.querySelectorAll(".ep-cal-y:not(.is-cur)")[0].click();0' >/dev/null 2>&1; sleep 0.3
YJ=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
S2=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
JLAST=$(ev 'window.__ep284QA.jumped()' 2>/dev/null | tr -dc '0-9')
if [ "$YJ" = "$TGT" ] && [ "$S2" = "false" ] && [ "$JLAST" = "$TGT" ]; then ok "বছর-ক্লিকে স্টেপার-জাম্প (year=$CURY→$YJ + স্ট্রিপ-বন্ধ + jumped=$JLAST)"; else bad "বছর-জাম্প-ব্যর্থ (y=$YJ tgt=$TGT open=$S2 last=$JLAST)"; fi
ROWS=$(ev 'document.querySelectorAll(".ep-cal-m").length' 2>/dev/null | tr -dc '0-9')
HAS=$(ev 'window.__ep283QA.has()' 2>/dev/null | tr -dc '0-9')
DIS=$(ev 'document.querySelectorAll(".ep-cal-m[disabled]").length' 2>/dev/null | tr -dc '0-9')
EXPECT_DIS=$((12-${HAS:-0}))
if [ "$ROWS" = "12" ] && [ -n "$HAS" ] && [ "$DIS" = "$EXPECT_DIS" ]; then ok "মাস-গ্রিড-পুনঃরেন্ডার (১২-কোষ + has=$HAS/disabled=$DIS — নতুন-বছরে)"; else bad "পুনঃরেন্ডার-ব্যর্থ (rows=$ROWS has=$HAS dis=$DIS exp=$EXPECT_DIS)"; fi
agent-browser eval 'document.querySelector(".ep-cal-m.has").click();0' >/dev/null 2>&1; sleep 0.4
JM=$(ev 'window.__ep283QA.jumped()===document.getElementById("epDateInput").value&&window.__ep283QA.jumped()!==""' | tr -d '"')
JMY=$(ev 'window.__ep283QA.jumped().slice(0,4)+""==="'"$TGT"'"' | tr -d '"')
P2=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
if [ "$JM" = "true" ] && [ "$JMY" = "true" ] && [ "$P2" = "false" ]; then ok "মাস-ক্লিকে এক-ক্লিক-জাম্প (jumped==elDateInput + $TGT-বছরে + প্যানেল-বন্ধ)"; else bad "জাম্প-ব্যর্থ (jm=$JM ym=$JMY open=$P2)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
S3=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
YR3=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
BOOTY=$(ev 'document.getElementById("epDateInput").value.slice(0,4)' 2>/dev/null | tr -dc '0-9')
if [ "$S3" = "false" ] && [ "$YR3" = "$BOOTY" ]; then ok "পুনঃ-খোলায় স্ট্রিপ-বন্ধ + বছর-calY-রিসেট ($YR3 == boot $BOOTY)"; else bad "রিসেট-ব্যর্থ (open=$S3 y=$YR3 boot=$BOOTY)"; fi
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.2
S4=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
agent-browser click '#epCalMYPrev' >/dev/null 2>&1; sleep 0.2
S5=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
agent-browser click '#epCalMYNext' >/dev/null 2>&1; sleep 0.2
S6B=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
CURC=$(ev 'var c=document.querySelector(".ep-cal-y.is-cur"); c ? +c.getAttribute("data-y") : 0' 2>/dev/null | tr -dc '0-9')
YR5=$(ev 'window.__ep284QA.year()' 2>/dev/null | tr -dc '0-9')
if [ "$S4" = "true" ] && [ "$S5" = "true" ] && [ "$S6B" = "true" ] && [ "$CURC" = "$YR5" ] && [ "$CURC" = "$TGT" ]; then ok "স্টেপার-চলাকালে স্ট্রিপ-is-cur-পুনঃসিঙ্ক (র‍্যাপার-প্রমাণ; is-cur==$CURC == year $YR5 — ডেটা-বিহীন-বছরে চিপ-শূন্য-সঠিক)"; else bad "স্টেপার-সিঙ্ক-ব্যর্থ (open4=$S4 open5=$S5 open6=$S6B cur=$CURC y=$YR5 tgt=$TGT)"; fi
agent-browser press Escape >/dev/null 2>&1; sleep 0.2
P3=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
S6=$(ev 'window.__ep284QA.isOpen()' | tr -d '"')
AX2=$(ev 'document.getElementById("epCalMY").getAttribute("aria-expanded")' | tr -d '"')
if [ "$P3" = "false" ] && [ "$S6" = "false" ] && [ "$AX2" = "false" ]; then ok "Escape-পূর্ণ-বন্ধ (প্যানেল+স্ট্রিপ + aria-expanded=false-ফেরত)"; else bad "Escape-ব্যর্থ (p=$P3 s=$S6 aria=$AX2)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (স্ট্রিপ-খোলা অবস্থায়) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3; agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3; }
agent-browser screenshot "$APP/tests/s284-calyear-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s284-calyear-desk.png" ]; then ok "s284-calyear-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (স্ট্রিপ-খোলা)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s284-calyear-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s284-calyear-mobile390.png" ]; then ok "s284-calyear-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
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
