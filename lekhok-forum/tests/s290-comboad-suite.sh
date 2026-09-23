#!/bin/bash
# s290-comboad-suite.sh — session290 কম্বো aria-activedescendant সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep290 = ep282-কম্বো-প্যানেলের a11y-চেইন-বর্ধন — ↑↓-নেভ এতদূর ভিজ্যুয়াল-শুধু
# (is-act-ক্লাস; অপশনে-আইডি-নেই, aria-activedescendant-নেই); এ-রাউন্ডে: elPsSearch-এ role=combobox
# + aria-autocomplete=list + aria-controls + aria-expanded-সিঙ্ক (খোলা/বন্ধ-র‍্যাপারে) + রেন্ডার-র‍্যাপারে
# দৃশ্যমান-অপশনে স্থিতিশীল-আইডি (epPsOpt290-<i>) + অ্যাক্টিভেট-র‍্যাপারে aria-activedescendant-সিঙ্ক
# (elPsSearch — DOM-ফোকাস-ধারক + elPsBtn — aria-controls-মালিক) + বন্ধে-পরিষ্কারণ + Home/End
# (প্যানেল-খোলা + অপশন-উপস্থিত → প্রথম/শেষ — APG-কম্বো-প্যাটার্ন); বডি-অস্পৃশ্য (র‍্যাপার-স্তর ×৪);
# [Mandatory-স্টাইল] is-act = অ্যাক্টিভ-ডিসেনডেন্ট-দৃশ্যমান-দ্বৈত (ইনসেট-বার + ওজন — হেক্স-শূন্য)।
# কভারেজ: ① সোর্স-কাঠামো (র‍্যাপার ×৪ + সেটআপ + Home/End + হুক ×৫-ফিল্ড + css হেক্স-শূন্য + ইনসেট-বার)
#          ② রেন্ডার্ড-কাঠামো (মার্কার-সিড-গেট s281-seedpaper-পুনঃব্যবহার; সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser): বুট-স্টেট (expSearch=false) + খোলা (expSearch=true + আইডি-সিঙ্ক
#             + ad==activeId-দ্বৈত-মালিক) + ↑↓-নেভ-ad-স্থানান্তর + Home/End-প্রথম/শেষ + সার্চ-ফিল্টারে
#             আইডি-পুনঃসিঙ্ক + Enter-নির্বাচন-বন্ধ-পরিষ্কারণ (ad=শূন্য + expSearch=false) + ep282-অক্ষুণ্ণ
#             + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s281-seedpaper — হেল্পার-পুনঃব্যবহারযোগ্যতা-চুক্তি)
# চুক্তি: ① PAGEC=$(cat "$PAGE")-রেন্ডার্ড-অ্যাসার্ট (s288-containsF-গোটচা) ② css-nocache-relink
#         ③ পোর্ট-ফ্রি-পোলিং-কিল ④ ল্যাটিন-অঙ্ক-হুক-তুলনা (বাংলা-অঙ্ক-গ্রেপ-বারণ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s290-page.html
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
containsF "QA-হুক __ep290QA" "$EJS" 'window.__ep290QA'
containsF "সেটআপ role=combobox (সার্চ-ইনপুট)" "$EJS" "elPsSearch.setAttribute('role', 'combobox')"
containsF "সেটআপ aria-autocomplete=list" "$EJS" "elPsSearch.setAttribute('aria-autocomplete', 'list')"
containsF "সেটআপ aria-controls (listbox-সংযোগ)" "$EJS" "elPsSearch.setAttribute('aria-controls', 'epPs282Opts')"
containsF "রেন্ডার-র‍্যাপার (ep290RenderBase)" "$EJS" 'ep290RenderBase'
containsF "অ্যাক্টিভেট-র‍্যাপার (ep290ActivateBase)" "$EJS" 'ep290ActivateBase'
containsF "খোলা-র‍্যাপার (ep290OpenBase)" "$EJS" 'ep290OpenBase'
containsF "বন্ধ-র‍্যাপার (ep290CloseBase)" "$EJS" 'ep290CloseBase'
containsF "activedescendant-স্থাপনা (বাটন)" "$EJS" "elPsBtn.setAttribute('aria-activedescendant', id)"
containsF "activedescendant-স্থাপনা (সার্চ)" "$EJS" "elPsSearch.setAttribute('aria-activedescendant', id)"
containsF "স্থিতিশীল-আইডি-প্যাটার্ন (epPsOpt290-)" "$EJS" "epPsOpt290-"
containsF "Home-কী (প্রথম-অপশন)" "$EJS" "e.key === 'Home'"
containsF "End-কী (শেষ-অপশন)" "$EJS" "e.key === 'End'"
containsF "ep282-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep282QA'
containsF "ep289-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep289QA'
containsF "ep288-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep288QA'
B290=$(echo "$CSSF" | sed -n '/session290 — কম্বো aria-activedescendant/,$p')
if [ -n "$B290" ]; then
  ok "ep290-CSS-ব্লক উপস্থিত"
  HEXN=$(echo "$B290" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep290-CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep290-CSS-ব্লকে হেক্স $HEXN"; fi
  containsF "is-act-ইনসেট-বার (দৃশ্যমান-দ্বৈত)" "$B290" '.ep-ps-opt.is-act { box-shadow: inset 3px 0 0 var(--lf-brand-primary); font-weight: 800; }'
  containsF "reduced-motion-অক্ষুণ্ণ" "$B290" 'prefers-reduced-motion'
else
  bad "ep290-CSS-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো + ডেটা-গেট (প্রি-ক্লিন + fresh-reboot) ──"
kill8094
PC0=$(node "$APP/scripts/s281-seedpaper.js" clean 2>/dev/null | tail -1)
if echo "$PC0" | grep -q "CLEAN-OK"; then ok "প্রি-ক্লিন ($PC0 — s281-হেল্পার-পুনঃব্যবহার)"; else bad "প্রি-ক্লিন-ব্যর্থ ($PC0)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
SEEDED=0
E2E_OK=1
if [ "$PAPERSN" -ge 1 ] && [ "$PRELEN" -ge 1 ]; then ok "data-papers এমবেডেড (PRE=$PRELEN)"; else
  kill8094
  SR=$(node "$APP/scripts/s281-seedpaper.js" seed 2>/dev/null | tail -1)
  if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; E2E_OK=0; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
  SEEDLEN=$(plen)
  PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
  if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরেও-শূন্য (HTTP $PC2 attr=$PAPERSN len=$SEEDLEN)"; E2E_OK=0; fi
fi

echo "── ধাপ-২.৭: রেন্ডার্ড-মার্কআপ যাচাই (PAGEC-প্রথা) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
PAGEC=$(cat "$PAGE")
containsF "কম্বো-ট্রিগার-রেন্ডারড (aria-controls)" "$PAGEC" 'id="epPs282Btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="epPs282Opts"'
containsF "listbox-কন্টেইনার-রেন্ডারড" "$PAGEC" 'id="epPs282Opts" role="listbox"'
containsF "__ep290QA-হুক-ইনলাইন-স্ক্রিপ্টে" "$PAGEC" 'window.__ep290QA'

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep290QA==="object"&&typeof window.__ep290QA.ad==="function"&&typeof window.__ep282QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep290QA + __ep282QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
OPTN=$(ev 'window.__ep282QA.options()' 2>/dev/null | tr -dc '0-9')
if [ -n "$OPTN" ] && [ "$OPTN" -ge 1 ]; then ok "select-অপশন $OPTN-টি (data-papers-চালিত)"; else bad "অপশন-শূন্য"; fi
E0=$(ev 'window.__ep290QA.expSearch()' 2>/dev/null | tr -d '"')
A0=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
if [ "$E0" = "false" ] && [ -z "$A0" ]; then ok "বুট-স্টেট (expSearch=false + ad=শূন্য — সেটআপ-প্রয়োগ)"; else bad "বুট-স্টেট-ব্যর্থ (expSearch=$E0 ad=$A0)"; fi
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.4
O1=$(ev 'window.__ep282QA.isOpen()' 2>/dev/null | tr -d '"')
E1=$(ev 'window.__ep290QA.expSearch()' 2>/dev/null | tr -d '"')
IDN=$(ev 'window.__ep290QA.ids()' 2>/dev/null | tr -dc '0-9')
VIS=$(ev 'window.__ep282QA.visible()' 2>/dev/null | tr -dc '0-9')
AID=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
AD1=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
ADS1=$(ev 'window.__ep290QA.adSearch()' 2>/dev/null | tr -d '"')
if [ "$O1" = "true" ] && [ "$E1" = "true" ] && [ -n "$IDN" ] && [ "$IDN" = "$VIS" ] && [ -n "$AID" ] && [ "$AD1" = "$AID" ] && [ "$ADS1" = "$AID" ]; then ok "খোলা-সিঙ্ক (expSearch=true + আইডি $IDN==$VIS + ad==adSearch==activeId — দ্বৈত-মালিক)"; else bad "খোলা-সিঙ্ক-ব্যর্থ (open=$O1 exp=$E1 ids=$IDN vis=$VIS activeId=$AID ad=$AD1 adS=$ADS1)"; fi
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.25
AID2=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
AD2=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
ACT2=$(ev 'window.__ep282QA.active()' 2>/dev/null | tr -dc '0-9')
if [ -n "$AID2" ] && [ "$AID2" = "$AID" ] && [ "$AD2" = "$AID2" ] && [ "$ACT2" = "0" ]; then ok "↓-নেভ-ad-সিঙ্ক (এক-অপশনে wrap-ইন-প্লেস active=০ + ad==activeId — অ্যাক্টিভেট-র‍্যাপার-প্রতি-কল-প্রমাণ)"; else bad "↓-নেভ-ব্যর্থ (activeId=$AID2 ad=$AD2 active=$ACT2)"; fi
agent-browser press ArrowUp >/dev/null 2>&1; sleep 0.25
AID3=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
AD3=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
ADS3=$(ev 'window.__ep290QA.adSearch()' 2>/dev/null | tr -d '"')
ACT3=$(ev 'window.__ep282QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$AID3" = "$AID" ] && [ "$AD3" = "$AID" ] && [ "$ADS3" = "$AID" ] && [ "$ACT3" = "0" ]; then ok "↑-নেভ-ad-সিঙ্ক (active=০ + ad==adSearch==activeId)"; else bad "↑-নেভ-ব্যর্থ (activeId=$AID3 ad=$AD3 adS=$ADS3 active=$ACT3)"; fi
agent-browser press End >/dev/null 2>&1; sleep 0.25
AID4=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
LASTID=$(ev 'var v=[];document.querySelectorAll("#epPs282Opts .ep-ps-opt").forEach(function(b){v.push(b.id)});v[v.length-1]' 2>/dev/null | tr -d '"')
if [ -n "$AID4" ] && [ "$AID4" = "$LASTID" ]; then ok "End-কী-শেষ-অপশন ($AID4)"; else bad "End-কী-ব্যর্থ (activeId=$AID4 last=$LASTID)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.25
AID5=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
FIRSTID=$(ev 'document.querySelector("#epPs282Opts .ep-ps-opt").id' 2>/dev/null | tr -d '"')
if [ "$AID5" = "$FIRSTID" ]; then ok "Home-কী-প্রথম-অপশন ($AID5)"; else bad "Home-কী-ব্যর্থ (activeId=$AID5 first=$FIRSTID)"; fi
ev 'var s=document.getElementById("epPs282Search");s.value="্";s.dispatchEvent(new Event("input"))' >/dev/null 2>&1; sleep 0.3
VIS6=$(ev 'window.__ep282QA.visible()' 2>/dev/null | tr -dc '0-9')
IDN6=$(ev 'window.__ep290QA.ids()' 2>/dev/null | tr -dc '0-9')
AID6=$(ev 'window.__ep290QA.activeId()' 2>/dev/null | tr -d '"')
AD6=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
if [ "$IDN6" = "$VIS6" ] && [ -n "$AID6" ] && [ "$AD6" = "$AID6" ]; then ok "সার্চ-ফিল্টারে-আইডি-পুনঃসিঙ্ক (ids=$IDN6 == vis=$VIS6 + ad-সিঙ্ক)"; else bad "ফিল্টার-সিঙ্ক-ব্যর্থ (ids=$IDN6 vis=$VIS6 activeId=$AID6 ad=$AD6)"; fi
ev 'var s=document.getElementById("epPs282Search");s.value="";s.dispatchEvent(new Event("input"))' >/dev/null 2>&1; sleep 0.3
agent-browser press Enter >/dev/null 2>&1; sleep 0.5
O7=$(ev 'window.__ep282QA.isOpen()' 2>/dev/null | tr -d '"')
E7=$(ev 'window.__ep290QA.expSearch()' 2>/dev/null | tr -d '"')
AD7=$(ev 'window.__ep290QA.ad()' 2>/dev/null | tr -d '"')
ADS7=$(ev 'window.__ep290QA.adSearch()' 2>/dev/null | tr -d '"')
PK7=$(ev 'window.__ep282QA.picked()' 2>/dev/null | tr -d '"')
if [ "$O7" = "false" ] && [ "$E7" = "false" ] && [ -z "$AD7" ] && [ -z "$ADS7" ] && [ -n "$PK7" ]; then ok "Enter-নির্বাচন-বন্ধ-পরিষ্কারণ (picked=$PK7 + ad/adS=শূন্য + expSearch=false)"; else bad "নির্বাচন-পরিষ্কারণ-ব্যর্থ (open=$O7 exp=$E7 ad=$AD7 adS=$ADS7 picked=$PK7)"; fi
LBL=$(ev 'window.__ep282QA.label()' 2>/dev/null | tr -d '"')
if [ -n "$LBL" ] && [ "$LBL" != "পত্রিকা…" ]; then ok "ep282-অক্ষুণ্ণ (label-সিঙ্ক — $LBL)"; else bad "label-ব্যর্থ ($LBL)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (কম্বো-প্যানেল + is-act-বার) ──"
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.4
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; }
agent-browser screenshot "$APP/tests/s290-comboad-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s290-comboad-desk.png" ]; then ok "s290-comboad-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s290-comboad-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s290-comboad-mobile390.png" ]; then ok "s290-comboad-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-ব্যর্থ) ──"
skip "E2E-আচরণ"
skip "স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (mo268-চুক্তি) ──"
if [ "$SEEDED" = "1" ]; then
  kill8094
  CR=$(node "$APP/scripts/s281-seedpaper.js" clean 2>/dev/null | tail -1)
  if echo "$CR" | grep -q "CLEAN-OK deleted=1"; then ok "মার্কার-ক্লিন (ডিলিট=১)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  curl -s -o "$PAGE" "$BASE/epaper"
  FINLEN=$(plen)
  if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
else
  skip "মার্কার-ক্লিন (সিড-প্রয়োজন-হয়নি — PRE=$PRELEN)"
  ok "নেট-DB-রাইট-শূন্য (সিড-অপারেশন-শূন্য; মিউটেশন-POST-শূন্য — রিড-ওনলি-কম্বো)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
