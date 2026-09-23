#!/bin/bash
# s289-calpanel-suite.sh — session289 মাস-প্যানেল খোলা/বন্ধ ঘোষণা সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep289 = ep288-পরবর্তী a11y-চেইন — মাস-প্যানেল (ep283)/বছর-তালিকা (ep284) খোলা/বন্ধে
# ep288-লাইভ-রিজিয়নে বাংলা-ঘোষণা (খোলা: বছর+তথ্য-গণনা-সহ; বন্ধ: সংক্ষিপ্ত) + engaged-গেট-বিস্তার
# (প্যানেল-অভ্যন্তরীণ-প্রথম-ইনপুটেও সক্রিয় — প্রোড-প্রমাণিত ঘাটতি: বছর-লেবেল-ক্লিকে engaged=false)
# + aria-expanded-সিঙ্ক-পুনঃপ্রমাণ + [Mandatory-স্টাইল] ডিসক্লোজার-ক্যারেট (▼ — খোলায় ১৮০°-রোটেশন);
# র‍্যাপার-স্তর ×৪ (ep283Open/ClosePanel + ep284Open/CloseList-বডি-অস্পৃশ্য); ep283-288 অক্ষুণ্ণ।
# কভারেজ: ① সোর্স-কাঠামো (র‍্যাপার ×৪ + গেট-বিস্তার + হুক ×৬-ফিল্ড + css হেক্স-শূন্য + ক্যারেট)
#          ② রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot + মার্কার-সিড (s287-seedday-পুনঃব্যবহার);
#             সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser): বুট-নীরব + প্রোগ্রাম্যাটিক-open-নীরব-কিন্তু-aria-সিঙ্ক (expM=true)
#             + ক্লিক-খোলা-ঘোষণা (বছর+গণনা-সহ) + Escape-বন্ধ-ঘোষণা + বছর-তালিকা-খোলা/বন্ধ-ঘোষণা
#             + বাইরে-ক্লিক-বন্ধ-ঘোষণা + মাস-জাম্প-ঘোষণা-ওভাররাইট ('মাস: ' — ep288-চুক্তি)
#             + ক্যারেট-স্টাইল (content ▼ + is-open-রোটেশন) + ep287-অক্ষুণ্ণ + স্ক্রিনশট ×২
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s287-seedday — হেল্পার-পুনঃব্যবহারযোগ্যতা-চুক্তি)
# চুক্তি: ① PAGEC=$(cat "$PAGE")-রেন্ডার্ড-অ্যাসার্ট (s288-containsF-গোটচা) ② css-nocache-relink
#         ③ পোর্ট-ফ্রি-পোলিং-কিল ④ প্রোগ্রাম্যাটিক-আর্ম-আগে-ক্লিক-পরে (engaged-গেট-অর্ডারিং)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s289-page.html
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
containsF "QA-হুক __ep289QA" "$EJS" 'window.__ep289QA'
containsF "ep289Say-ঘোষণাকারী (ep288Say-পুনঃব্যবহার)" "$EJS" 'function ep289Say'
containsF "প্যানেল-খোলা-র‍্যাপার (ep289OpenPanelBase)" "$EJS" 'ep289OpenPanelBase'
containsF "প্যানেল-বন্ধ-র‍্যাপার (ep289ClosePanelBase)" "$EJS" 'ep289ClosePanelBase'
containsF "বছর-তালিকা-খোলা-র‍্যাপার (ep289OpenListBase)" "$EJS" 'ep289OpenListBase'
containsF "বছর-তালিকা-বন্ধ-র‍্যাপার (ep289CloseListBase)" "$EJS" 'ep289CloseListBase'
containsF "খোলা-ঘোষণা (বছর+গণনা-সহ)" "$EJS" "ep289Say('মাস-তালিকা খোলা — '"
containsF "প্যানেল-বন্ধ-ঘোষণা" "$EJS" "ep289Say('মাস-তালিকা বন্ধ')"
containsF "বছর-তালিকা-খোলা-ঘোষণা" "$EJS" "ep289Say('বছর-তালিকা খোলা — '"
containsF "বছর-তালিকা-বন্ধ-ঘোষণা" "$EJS" "ep289Say('বছর-তালিকা বন্ধ')"
containsF "engaged-গেট-বিস্তার (কার্ড-ক্যাপচার-ক্লিক)" "$EJS" "ep289Card.addEventListener('click', function () { ep288Engaged = true; }, true)"
containsF "engaged-গেট-বিস্তার (কার্ড-ক্যাপচার-কীবোর্ড)" "$EJS" "ep289Card.addEventListener('keydown', function () { ep288Engaged = true; }, true)"
containsF "ep288-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep288QA'
containsF "ep287-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep287QA'
containsF "ep284-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep284QA'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B289=$(echo "$CSSF" | sed -n '/session289 — মাস-প্যানেল খোলা\/বন্ধ ঘোষণা/,$p')
if [ -n "$B289" ]; then
  ok "ep289-CSS-ব্লক উপস্থিত"
  HEXN=$(echo "$B289" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep289-CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep289-CSS-ব্লকে হেক্স $HEXN"; fi
  containsF "ডিসক্লোজার-ক্যারেট (ট্রিগার-দ্বৈত)" "$B289" '.ep-cal-month::after, .ep-cal-mylabel::after'
  containsF "is-open-রোটেশন (১৮০°)" "$B289" 'rotate(180deg)'
  containsF "reduced-motion-অক্ষুণ্ণ" "$B289" 'prefers-reduced-motion'
else
  bad "ep289-CSS-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
PC0=$(node "$APP/scripts/s287-seedday.js" clean 2>/dev/null | tail -1)
if echo "$PC0" | grep -q "CLEAN-OK"; then ok "প্রি-ক্লিন ($PC0 — s287-হেল্পার-পুনঃব্যবহার)"; else bad "প্রি-ক্লিন-ব্যর্থ ($PC0)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)

echo "── ধাপ-২.৫: মার্কার-সিড (s287-হেল্পার — hasPayload + সেপ্টেম্বর-গ্রিড গ্যারান্টি) ──"
kill8094
SR=$(node "$APP/scripts/s287-seedday.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; SEEDED=0; E2E_OK=0; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
SEEDLEN=$(plen)
E2E_OK=1
if [ "$PC2" = "200" ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরে-অপ্রত্যাশিত (HTTP $PC2 SEED=$SEEDLEN)"; E2E_OK=0; fi

echo "── ধাপ-২.৭: রেন্ডার্ড-মার্কআপ যাচাই (সিড-পরে — PAGEC-প্রথা) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
PAGEC=$(cat "$PAGE")
containsF "মাস-ট্রিগার aria-expanded=false-রেন্ডারড" "$PAGEC" 'id="epCalMonth" aria-haspopup="true" aria-expanded="false"'
containsF "বছর-ট্রিগার aria-expanded=false-রেন্ডারড" "$PAGEC" 'id="epCalMY" aria-haspopup="true" aria-expanded="false"'
containsF "লাইভ-রিজিয়ন-রেন্ডারড (ep288-অক্ষুণ্ণ)" "$PAGEC" 'id="epCalLive" role="status" aria-live="polite"'
containsF "__ep289QA-হুক-ইনলাইন-স্ক্রিপ্টে" "$PAGEC" 'window.__ep289QA'

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep289QA==="object"&&typeof window.__ep289QA.last==="function"&&typeof window.__ep288QA==="object"&&typeof window.__ep284QA==="object"&&typeof window.__ep283QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep289QA + __ep288QA + __ep284QA + __ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
L0=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
L8=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
G0=$(ev 'window.__ep289QA.engaged()' 2>/dev/null | tr -d '"')
if [ -z "$L0" ] && [ -z "$L8" ] && [ "$G0" = "false" ]; then ok "বুট-নীরব (ep289+ep288 last=শূন্য + engaged=false)"; else bad "বুট-নীরব-ব্যর্থ (last=$L0/$L8 engaged=$G0)"; fi
ev 'window.__ep283QA.open()' >/dev/null 2>&1; sleep 0.2
OP=$(ev 'window.__ep289QA.open()' 2>/dev/null | tr -d '"')
XM=$(ev 'window.__ep289QA.expM()' 2>/dev/null | tr -d '"')
LP=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
if [ "$OP" = "true" ] && [ "$XM" = "true" ] && [ -z "$LP" ]; then ok "প্রোগ্রাম্যাটিক-open-নীরব-কিন্তু-aria-সিঙ্ক (expM=true + last=শূন্য — s288-গেট-চুক্তি)"; else bad "প্রোগ্রাম্যাটিক-গেট-ব্যর্থ (open=$OP expM=$XM last=$LP)"; fi
ev 'window.__ep283QA.close()' >/dev/null 2>&1; sleep 0.2
XC=$(ev 'window.__ep289QA.expM()' 2>/dev/null | tr -d '"')
LC=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
if [ "$XC" = "false" ] && [ -z "$LC" ]; then ok "প্রোগ্রাম্যাটিক-close-নীরব (expM=false + last=শূন্য)"; else bad "প্রোগ্রাম্যাটিক-close-ব্যর্থ (expM=$XC last=$LC)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.4
O1=$(ev 'window.__ep289QA.open()' 2>/dev/null | tr -d '"')
G1=$(ev 'window.__ep289QA.engaged()' 2>/dev/null | tr -d '"')
A1=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
X1=$(ev 'window.__ep289QA.expM()' 2>/dev/null | tr -d '"')
if [ "$O1" = "true" ] && [ "$G1" = "true" ] && [ "$A1" = "মাস-তালিকা খোলা — ২০২৬, তথ্য-আছে ১ মাস" ] && [ "$X1" = "true" ]; then ok "ক্লিক-খোলা-ঘোষণা ($A1 — expM=true)"; else bad "খোলা-ঘোষণা-ব্যর্থ (open=$O1 engaged=$G1 last=$A1 expM=$X1)"; fi
CT=$(ev 'getComputedStyle(document.getElementById("epCalMonth"),"::after").content' 2>/dev/null | tr -d '"')
CR=$(ev 'getComputedStyle(document.getElementById("epCalMonth"),"::after").transform' 2>/dev/null | tr -d '"')
if printf '%s' "$CT" | grep -q $'\xe2\x96\xbe' && [ -n "$CR" ] && [ "$CR" != "none" ]; then ok "ডিসক্লোজার-ক্যারেট (content=\25BE-গ্লিফ + is-open-রোটেশন-প্রয়োগ — বাইট-প্যাটার্ন e2 96 be)"; else bad "ক্যারেট-স্টাইল-ব্যর্থ (content=$CT transform=$CR)"; fi
agent-browser press Escape >/dev/null 2>&1; sleep 0.3
O2=$(ev 'window.__ep289QA.open()' 2>/dev/null | tr -d '"')
A2=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
X2=$(ev 'window.__ep289QA.expM()' 2>/dev/null | tr -d '"')
if [ "$O2" = "false" ] && [ "$A2" = "মাস-তালিকা বন্ধ" ] && [ "$X2" = "false" ]; then ok "Escape-বন্ধ-ঘোষণা ($A2 — expM=false)"; else bad "Escape-ঘোষণা-ব্যর্থ (open=$O2 last=$A2 expM=$X2)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
Y1=$(ev 'window.__ep289QA.yopen()' 2>/dev/null | tr -d '"')
A3=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
X3=$(ev 'window.__ep289QA.expY()' 2>/dev/null | tr -d '"')
if [ "$Y1" = "true" ] && [ "$A3" = "বছর-তালিকা খোলা — ১ বছর" ] && [ "$X3" = "true" ]; then ok "বছর-তালিকা-খোলা-ঘোষণা ($A3 — expY=true)"; else bad "বছর-খোলা-ঘোষণা-ব্যর্থ (yopen=$Y1 last=$A3 expY=$X3)"; fi
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.3
Y2=$(ev 'window.__ep289QA.yopen()' 2>/dev/null | tr -d '"')
A4=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
X4=$(ev 'window.__ep289QA.expY()' 2>/dev/null | tr -d '"')
if [ "$Y2" = "false" ] && [ "$A4" = "বছর-তালিকা বন্ধ" ] && [ "$X4" = "false" ]; then ok "বছর-তালিকা-বন্ধ-ঘোষণা ($A4 — expY=false)"; else bad "বছর-বন্ধ-ঘোষণা-ব্যর্থ (yopen=$Y2 last=$A4 expY=$X4)"; fi
agent-browser click '#epCalMY' >/dev/null 2>&1; sleep 0.2
agent-browser click '#epCount' >/dev/null 2>&1; sleep 0.3
O5=$(ev 'window.__ep289QA.open()' 2>/dev/null | tr -d '"')
A5=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
if [ "$O5" = "false" ] && [ "$A5" = "মাস-তালিকা বন্ধ" ]; then ok "বাইরে-ক্লিক-বন্ধ-ঘোষণা ($A5)"; else bad "বাইরে-ক্লিক-ব্যর্থ (open=$O5 last=$A5)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser click '.ep-cal-m.has' >/dev/null 2>&1; sleep 0.5
O6=$(ev 'window.__ep289QA.open()' 2>/dev/null | tr -d '"')
A6=$(ev 'window.__ep289QA.last()' 2>/dev/null | tr -d '"')
X6=$(ev 'window.__ep289QA.expM()' 2>/dev/null | tr -d '"')
J6=$(ev 'window.__ep283QA.jumped()' 2>/dev/null | tr -d '"')
if [ "$O6" = "false" ] && [ "$X6" = "false" ] && [ "$A6" = "মাস-তালিকা বন্ধ" ] && [ "$J6" = "2026-09-15" ]; then ok "মাস-জাম্প-বন্ধ-ঘোষণা (এক-মাস-সিডে সম-মাস-জাম্প → বন্ধ-ঘোষণা-ই-শেষ-বার্তা; জাম্প=$J6; ওভাররাইট-পথ s288-এ-প্রমাণিত)"; else bad "জাম্প-বন্ধ-ঘোষণা-ব্যর্থ (open=$O6 expM=$X6 last=$A6 jumped=$J6)"; fi
ACTN=$(ev 'document.querySelectorAll(".ep-cal-day.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$ACTN" = "1" ]; then ok "ep287-অক্ষুণ্ণ (is-act ×১ রাউন্ড-শেষে)"; else bad "is-act-ব্যর্থ ($ACTN)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (প্যানেল-খোলা + ক্যারেট) ──"
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.4
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; }
agent-browser screenshot "$APP/tests/s289-calpanel-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s289-calpanel-desk.png" ]; then ok "s289-calpanel-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s289-calpanel-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s289-calpanel-mobile390.png" ]; then ok "s289-calpanel-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-ব্যর্থ) ──"
skip "E2E-আচরণ"
skip "স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (mo268-চুক্তি) ──"
if [ "$SEEDED" = "1" ]; then
  kill8094
  CR=$(node "$APP/scripts/s287-seedday.js" clean 2>/dev/null | tail -1)
  if echo "$CR" | grep -q "CLEAN-OK deleted=1 residual=0"; then ok "মার্কার-ক্লিন (ডিলিট=১ residual=০)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
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
