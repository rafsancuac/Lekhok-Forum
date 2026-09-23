#!/bin/bash
# s282-epsearch-suite.sh — session282 পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep282 = নেটিভ #epPaperSelect-ওভারলে কম্বো (ট্রিগার + সার্চ-প্যানেল + কী-বোর্ড);
# নেটিভ select = একক-উৎস (পূর্ব-জারি change-লজিক অক্ষুণ্ণ); no-JS ফলব্যাক (ep282-armed JS-যোগিত)।
# কভারেজ: ① সোর্স-কাঠামো (মার্কআপ ×৫ + sync-হুক + মডিউল + __ep282QA + css ep282-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (curl /epaper — মার্কআপ ×৪ + aria-expanded-initial)
#          ③ E2E (agent-browser): armed-প্রমাণ (কম্বো inline-flex + select none) → ট্রিগার-ক্লিকে
#             প্যানেল-খোলা (isOpen + hidden=false + aria-expanded=true + সার্চ-ফোকাস) → সারি/গ্রুপ-গণনা →
#             সার্চ-ফিল্টার (zzzz→শূন্য + খালি-অবস্থা; ক্লিয়ারে পুনঃস্থাপন) → কী-বোর্ড (ArrowUp-র‍্যাপ + Enter-নির্বাচন) →
#             Escape-বন্ধ → বাইরে-ক্লিকে-বন্ধ → সারি-ক্লিক-নির্বাচন → change-লুপ (picked==select.value) → স্ক্রিনশট ×২
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s281-হেল্পার-পুনঃব্যবহার — kill→seed→boot ক্রম)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ (single-quoted-bash + double-quoted-JS)
#         ② css-nocache-relink (session279-গোটচা) ③ বাংলা-অঙ্ক-গ্রেপ-বারণ (ল্যাটিন-অঙ্ক-তুলনা-ব্রাউজার-সাইডে)
#         ④ পোর্ট-ফ্রি-পোলিং-কিল (session281-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s282-page.html
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
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
plen(){ node -e "const m=require('fs').readFileSync('$PAGE','utf8').match(/data-papers=.([^\"]*)/);try{console.log(JSON.parse(decodeURIComponent(m?m[1]:'[]')).length)}catch(e){console.log(0)}" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
LMEV=$(agent-browser open "about:blank" >/dev/null 2>&1; agent-browser eval 'navigator.deviceMemory||8' 2>/dev/null | tr -d '"')
echo "  · QA-ব্রাউজার deviceMemory=$LMEV (কম্বো LOWMEM-স্পর্শকাতর-নয় — সচেতনতা-মাত্র)"

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJS=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
containsF "কম্বো-ট্রিগার মার্কআপ" "$EJS" 'id="epPs282Btn"'
containsF "ট্রিগার aria-haspopup=listbox" "$EJS" 'aria-haspopup="listbox"'
containsF "প্যানেল মার্কআপ (hidden-প্রারম্ভিক)" "$EJS" 'id="epPs282Panel" hidden'
containsF "সার্চ-ইনপুট" "$EJS" 'id="epPs282Search"'
containsF "অপশন-লিস্টবক্স" "$EJS" 'id="epPs282Opts" role="listbox"'
containsF "খালি-অবস্থা" "$EJS" 'id="epPs282Empty"'
containsF "armed-শ্রেণি (JS-যোগিত — no-JS ফলব্যাক)" "$EJS" "classList.add('ep282-armed')"
containsF "QA-হুক __ep282QA" "$EJS" 'window.__ep282QA'
containsF "syncPaperSelect-লেবেল-সিঙ্ক-হুক" "$EJS" 'ps282SyncLabel(); // session282'
containsF "নেটিভ-select-একক-উৎস (change-পুনঃপ্রেরণ)" "$EJS" "dispatchEvent(new Event('change'))"
containsF "কী-বোর্ড-নেভিগেশন (ArrowDown/ArrowUp/Enter/Escape)" "$EJS" "e.key === 'Escape'"
containsF "বাইরে-ক্লিকে-বন্ধ (contains-গার্ড)" "$EJS" 'elPsWrap.contains(e.target)'
containsF "হুক-ফিল্ড isOpen/picked/pick/options" "$EJS" 'picked: function'
B282=$(echo "$CSSF" | sed -n '/═══ session282 — পত্রিকা-সিলেক্টরে সার্চযোগ্য-ড্রপডাউন/,$p')
if [ -n "$B282" ]; then
  ok "ep282-ব্লক উপস্থিত"
  HEXN=$(echo "$B282" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep282-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep282-ব্লকে হেক্স $HEXN"; fi
  containsF "কম্বো-বেস-স্টাইল" "$B282" '.ep-ps-combo'
  containsF "armed-টগল (select-লুচ্ছন + কম্বো-প্রদর্শন)" "$B282" 'ep282-armed .ep-paper-select'
  containsF "প্যানেল + সারি + গ্রুপ + খালি-স্টাইল" "$B282" '.ep-ps-grp'
  containsF "নির্বাচিত-চিহ্ন (::after ✓)" "$B282" '.ep-ps-opt.is-sel::after'
  containsF "এন্ট্রি-অ্যানিমেশন" "$B282" '@keyframes ep-ps-in'
  containsF "reduced-motion-গার্ড" "$B282" 'prefers-reduced-motion'
  containsF "মোবাইল-সংকোচন" "$B282" '@media (max-width: 600px)'
else
  bad "ep282-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (প্রথমে fresh-reboot — পুরাতন-প্রসেসের view-cache-গোটচা বর্জন) ──"
kill8094
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
MK=$(grep -o 'epPs282Btn\|epPs282Panel\|epPs282Search\|epPs282Opts' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "কম্বো-মার্কআপ ×৪ রেন্ডারড"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi
PAGEC=$(cat "$PAGE")
containsF "aria-expanded প্রারম্ভিক-false" "$PAGEC" 'aria-expanded="false"'
PRELEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
SEEDED=0
E2E_OK=1
if [ "$PAPERSN" -ge 1 ] && [ "$PRELEN" -ge 1 ]; then ok "data-papers এমবেডেড (PRE=$PRELEN)"; else
  echo "── ধাপ-২.৫: মার্কার-সিড (কিল→সিড→বুট — ক্রম-গোটচা) ──"
  kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
  SR=$(node "$APP/scripts/s281-seedpaper.js" seed 2>/dev/null | tail -1)
  if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
  SEEDLEN=$(plen)
  PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
  if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; E2E_OK=1; else bad "সিড-পরেও-শূন্য (HTTP $PC2 attr=$PAPERSN len=$SEEDLEN)"; fi
fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
ARMED=$(ev 'document.getElementById("epPs282").className.indexOf("ep282-armed")>=0' | tr -d '"')
if [ "$ARMED" = "true" ]; then ok "armed-শ্রেণি প্রয়োগ (JS-বুট-প্রমাণ)"; else bad "armed-অনুপস্থিত ($ARMED)"; fi
# গোটচা: flex-কনটেইনার-সন্তানে used-value blockification — inline-flex নির্দেশক মান flex-এ গণনা হয়
DSP=$(ev 'getComputedStyle(document.getElementById("epPs282Btn")).display+":"+getComputedStyle(document.getElementById("epPaperSelect")).display' | tr -d '"')
if [ "$DSP" = "flex:none" ]; then ok "armed-CSS-টগল (কম্বো flex + select none — blockified-গণনা)"; else bad "টগল-ব্যর্থ ($DSP)"; fi
HOOK=$(ev 'typeof window.__ep282QA==="object"&&typeof window.__ep282QA.open==="function"&&typeof window.__ep282QA.pick==="function"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep282QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
OPTN=$(ev 'window.__ep282QA.options()' 2>/dev/null | tr -dc '0-9')
if [ -n "$OPTN" ] && [ "$OPTN" -ge 1 ]; then ok "select-অপশন $OPTN-টি (data-papers-চালিত)"; else bad "অপশন-শূন্য"; fi
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.3
ISO=$(ev 'window.__ep282QA.isOpen()' | tr -d '"')
PH=$(ev 'document.getElementById("epPs282Panel").hidden' | tr -d '"')
AX=$(ev 'document.getElementById("epPs282Btn").getAttribute("aria-expanded")' | tr -d '"')
FOC=$(ev 'document.activeElement&&document.activeElement.id' | tr -d '"')
if [ "$ISO" = "true" ] && [ "$PH" = "false" ] && [ "$AX" = "true" ]; then ok "ট্রিগার-ক্লিকে প্যানেল-খোলা (isOpen + hidden=false + aria-expanded=true)"; else bad "খোলা-ব্যর্থ (isOpen=$ISO hidden=$PH aria=$AX)"; fi
if [ "$FOC" = "epPs282Search" ]; then ok "খোলার-সাথে-সাথে সার্চ-ফোকাসড"; else bad "ফোকাস-ব্যর্থ ($FOC)"; fi
ROWS=$(ev 'document.querySelectorAll(".ep-ps-opt").length' 2>/dev/null | tr -dc '0-9')
VIS=$(ev 'window.__ep282QA.visible()' 2>/dev/null | tr -dc '0-9')
GRPN=$(ev 'document.querySelectorAll(".ep-ps-grp").length' 2>/dev/null | tr -dc '0-9')
if [ -n "$ROWS" ] && [ "$ROWS" = "$VIS" ] && [ "$ROWS" = "$OPTN" ]; then ok "সারি-গণনা সামঞ্জস্য (rows=$ROWS = visible = options)"; else bad "গণনা-ব্যর্থ (rows=$ROWS vis=$VIS opt=$OPTN)"; fi
if [ -n "$GRPN" ] && [ "$GRPN" -ge 1 ]; then ok "optgroup-হেডার রেন্ডারড ($GRPN-গ্রুপ)"; else bad "গ্রুপ-হেডার-শূন্য"; fi
ev 'var S=document.getElementById("epPs282Search");S.value="zzzz";S.dispatchEvent(new Event("input"));0' >/dev/null 2>&1; sleep 0.2
V0=$(ev 'window.__ep282QA.visible()' 2>/dev/null | tr -dc '0-9')
EH=$(ev 'document.getElementById("epPs282Empty").hidden' | tr -d '"')
OH=$(ev 'document.getElementById("epPs282Opts").hidden' | tr -d '"')
CH=$(ev 'document.getElementById("epPs282Clear").hidden' | tr -d '"')
if [ "$V0" = "0" ] && [ "$EH" = "false" ] && [ "$OH" = "true" ] && [ "$CH" = "false" ]; then ok "সার্চ-ফিল্টার: অমিল-কোয়েরিতে শূন্য-সারি + খালি-অবস্থা + ক্লিয়ার-বাটন"; else bad "ফিল্টার-ব্যর্থ (v=$V0 empty=$EH opts=$OH clear=$CH)"; fi
agent-browser click '#epPs282Clear' >/dev/null 2>&1; sleep 0.2
V1=$(ev 'window.__ep282QA.visible()' 2>/dev/null | tr -dc '0-9')
if [ "$V1" = "$OPTN" ]; then ok "ক্লিয়ার-বাটনে পূর্ণ-তালিকা পুনঃস্থাপন ($V1/$OPTN)"; else bad "ক্লিয়ার-ব্যর্থ ($V1≠$OPTN)"; fi
LAST=$((OPTN-1))
agent-browser press ArrowUp >/dev/null 2>&1; sleep 0.2
ACT=$(ev 'window.__ep282QA.active()' 2>/dev/null | tr -dc '0-9-')
if [ "$ACT" = "$LAST" ]; then ok "ArrowUp-র‍্যাপ-নেভিগেশন (active=$ACT = শেষ-সূচি)"; else bad "নেভিগেশন-ব্যর্থ (active=$ACT ≠ $LAST)"; fi
agent-browser press Enter >/dev/null 2>&1; sleep 0.4
PK=$(ev 'window.__ep282QA.picked()' | tr -d '"\\')
SVM=$(ev 'window.__ep282QA.picked()===document.getElementById("epPaperSelect").value&&document.getElementById("epPaperSelect").value!==""' | tr -d '"')
LBM=$(ev 'window.__ep282QA.label()===document.getElementById("epPaperSelect").value' | tr -d '"')
CL1=$(ev 'window.__ep282QA.isOpen()' | tr -d '"')
if [ "$SVM" = "true" ] && [ "$LBM" = "true" ] && [ "$CL1" = "false" ] && [ -n "$PK" ]; then ok "Enter-নির্বাচন: select.value==picked + লেবেল-সিঙ্ক + প্যানেল-বন্ধ"; else bad "Enter-নির্বাচন-ব্যর্থ (svm=$SVM lbm=$LBM open=$CL1)"; fi
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.2
ev 'document.querySelectorAll(".ep-ps-opt")[0].click();0' >/dev/null 2>&1; sleep 0.3
SVM2=$(ev 'window.__ep282QA.picked()===document.getElementById("epPaperSelect").value&&window.__ep282QA.isOpen()===false' | tr -d '"')
if [ "$SVM2" = "true" ]; then ok "সারি-ক্লিক-নির্বাচন (দ্বিতীয়-পথ)"; else bad "সারি-ক্লিক-ব্যর্থ"; fi
SEL=$(ev 'window.__ep282QA.picked()===(document.getElementById("epPaperSelect").options[document.getElementById("epPaperSelect").selectedIndex]||{}).value' | tr -d '"')
if [ "$SEL" = "true" ]; then ok "selectedIndex-সামঞ্জস্য (নেটিভ-স্টেট অক্ষুণ্ণ)"; else bad "selectedIndex-ব্যর্থ"; fi
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.2
ev 'document.body.click();0' >/dev/null 2>&1; sleep 0.2
CL2=$(ev 'window.__ep282QA.isOpen()' | tr -d '"')
if [ "$CL2" = "false" ]; then ok "বাইরে-ক্লিকে-বন্ধ"; else bad "বাইরে-ক্লিকে-খোলা-থাকে"; fi
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.2
agent-browser press Escape >/dev/null 2>&1; sleep 0.2
CL3=$(ev 'window.__ep282QA.isOpen()' | tr -d '"')
AXF=$(ev 'document.getElementById("epPs282Btn").getAttribute("aria-expanded")' | tr -d '"')
if [ "$CL3" = "false" ] && [ "$AXF" = "false" ]; then ok "Escape-বন্ধ + aria-expanded=false-ফেরত"; else bad "Escape-ব্যর্থ (open=$CL3 aria=$AXF)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (প্যানেল-খোলা অবস্থায়) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.3
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; agent-browser click '#epPs282Btn' >/dev/null 2>&1; sleep 0.3; }
agent-browser screenshot "$APP/tests/s282-epsearch-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s282-epsearch-desk.png" ]; then ok "s282-epsearch-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (প্যানেল-খোলা)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s282-epsearch-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s282-epsearch-mobile390.png" ]; then ok "s282-epsearch-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-পরেও-শূন্য) ──"
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
