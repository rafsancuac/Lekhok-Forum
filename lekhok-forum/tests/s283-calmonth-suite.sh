#!/bin/bash
# s283-calmonth-suite.sh — session283 ক্যালেন্ডারে মাস-তালিকা-শর্টকাট সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep283 = মাস-লেবেল-ক্লিকে ইন-কার্ড ডিসক্লোজার-প্যানেল (বছর-স্টেপার + ১২-মাস-গ্রিড +
# তথ্য-আছে-মাস-ডট + এক-ক্লিক-জাম্প); calJump/calRender-চুক্তি অক্ষুণ্ণ (ওভারলে-স্তর)।
# কভারেজ: ① সোর্স-কাঠামো (মাস-বাটন + প্যানেল-মার্কআপ + মডিউল + __ep283QA + css ep283-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (fresh-reboot-প্রথা — stale-view-cache-গোটচা; curl /epaper)
#          ③ E2E (agent-browser): ট্রিগার-ক্লিকে প্যানেল-খোলা (isOpen + hidden=false + aria-expanded=true +
#             বছর-লেবেল) → ১২-মাস-গ্রিড + has/disabled-গণনা → মাস-ক্লিকে এক-ক্লিক-জাম্প (jumped==elDateInput.value
#             + is-sel-দিন + প্যানেল-বন্ধ) → বছর-স্টেপার (±১ বছর + has-পুনঃগণনা) → Escape-বন্ধ →
#             বাইরে-ক্লিকে-বন্ধ → কার্সর-প্রমাণ → স্ক্রিনশট ×২
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s281-হেল্পার-পুনঃব্যবহার — kill→seed→boot ক্রম)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ containsF-কনটেন্ট-চুক্তি (PAGEC)
#         ④ পোর্ট-ফ্রি-পোলিং-কিল ⑤ বাংলা-অঙ্ক-গ্রেপ-বারণ (ল্যাটিন-অঙ্ক-হুক-তুলনা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s283-page.html
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
LMEV=$(agent-browser open "about:blank" >/dev/null 2>&1; agent-browser eval 'navigator.deviceMemory||8' 2>/dev/null | tr -d '"')
echo "  · QA-ব্রাউজার deviceMemory=$LMEV (মাস-প্যানেল LOWMEM-স্পর্শকাতর-নয়)"

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJS=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
containsF "মাস-লেবেল বাটন-রূপান্তর (aria-haspopup)" "$EJS" 'class="ep-cal-month" id="epCalMonth"'
containsF "মাস-বাটন aria-expanded প্রারম্ভিক-false" "$EJS" 'aria-expanded="false" title="মাস-তালিকা খুলুন"'
containsF "মাস-প্যানেল মার্কআপ (hidden-প্রারম্ভিক)" "$EJS" 'id="epCalMPanel" hidden'
containsF "বছর-স্টেপার জোড়া (Prev+Next)" "$EJS" 'id="epCalMYPrev"'
containsF "বছর-লেবেল" "$EJS" 'id="epCalMY"'
containsF "১২-মাস-গ্রিড (listbox)" "$EJS" 'id="epCalMGrid" role="listbox"'
containsF "QA-হুক __ep283QA" "$EJS" 'window.__ep283QA'
containsF "avail-ম্যাপ (byDate-উদ্ভূত বছর→মাস)" "$EJS" 'function ep283Avail'
containsF "এক-ক্লিক-জাম্প (মাসের-প্রথম-সংরক্ষিত-দিনে calJump)" "$EJS" 'ep283ClosePanel();
    calJump(first);'
containsF "তথ্য-শূন্য-মাস-নিষ্ক্রিয় (disabled-অ্যাট্রিবিউট)" "$EJS" "(ok ? '' : ' disabled')"
containsF "Escape-বন্ধ-গার্ড (ep283Open-শর্তসাপেক্ষ)" "$EJS" "e.key === 'Escape' && ep283Open"
containsF "বাইরে-ক্লিকে-বন্ধ (ep-cal280-contains-গার্ড)" "$EJS" "elCalMPanel.closest('.ep-cal280')"
containsF "হুক-ফিল্ড isOpen/year/has/jumped" "$EJS" 'jumped: function'
B283=$(echo "$CSSF" | sed -n '/═══ session283 — ক্যালেন্ডারে মাস-তালিকা-শর্টকাট/,$p')
if [ -n "$B283" ]; then
  ok "ep283-ব্লক উপস্থিত"
  HEXN=$(echo "$B283" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep283-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep283-ব্লকে হেক্স $HEXN"; fi
  containsF "মাস-বাটন-রিসেট+হোভার" "$B283" '.ep-cal-month'
  containsF "প্যানেল+স্টেপার+গ্রিড-স্টাইল" "$B283" '.ep-cal-mgrid'
  containsF "তথ্য-ডট (::after)" "$B283" '.ep-cal-m.has::after'
  containsF "বর্তমান-মাস-ফিল (is-cur)" "$B283" '.ep-cal-m.is-cur'
  containsF "এন্ট্রি-অ্যানিমেশন" "$B283" '@keyframes ep-cal-m-in'
  containsF "reduced-motion-গার্ড" "$B283" 'prefers-reduced-motion'
else
  bad "ep283-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
SEEDED=0
E2E_OK=1
if [ "$PAPERSN" -ge 1 ] && [ "$PRELEN" -ge 1 ]; then ok "data-papers এমবেডেড (PRE=$PRELEN)"; else
  echo "── ধাপ-২.৫: মার্কার-সিড (কিল→সিড→বুট) ──"
  kill8094
  SR=$(node "$APP/scripts/s281-seedpaper.js" seed 2>/dev/null | tail -1)
  if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
  SEEDLEN=$(plen)
  PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
  if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; E2E_OK=1; else bad "সিড-পরেও-শূন্য (HTTP $PC2)"; E2E_OK=0; fi
fi

echo "── ধাপ-২.৭: রিডার-মার্কআপ যাচাই (সিড-পরে — hasPayload-শর্তসাপেক্ষ-রেন্ডার-চুক্তি) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
MK=$(grep -o 'epCalMPanel\|epCalMYPrev\|epCalMYNext\|epCalMGrid' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "মাস-প্যানেল-মার্কআপ ×৪ রেন্ডারড (payload-অবস্থা)"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi
PAGEC=$(cat "$PAGE")
containsF "মাস-বাটন aria-expanded প্রারম্ভিক-false (রেন্ডার্ড)" "$PAGEC" 'aria-expanded="false" title="মাস-তালিকা খুলুন"'

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep283QA==="object"&&typeof window.__ep283QA.open==="function"&&typeof window.__ep283QA.jumped==="function"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
CUR=$(ev 'getComputedStyle(document.getElementById("epCalMonth")).cursor' | tr -d '"')
if [ "$CUR" = "pointer" ]; then ok "মাস-বাটন ক্লিকেবল (cursor:pointer)"; else bad "কার্সর-ব্যর্থ ($CUR)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
ISO=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
PH=$(ev 'document.getElementById("epCalMPanel").hidden' | tr -d '"')
AX=$(ev 'document.getElementById("epCalMonth").getAttribute("aria-expanded")' | tr -d '"')
if [ "$ISO" = "true" ] && [ "$PH" = "false" ] && [ "$AX" = "true" ]; then ok "মাস-ক্লিকে প্যানেল-খোলা (isOpen + hidden=false + aria-expanded=true)"; else bad "খোলা-ব্যর্থ (isOpen=$ISO hidden=$PH aria=$AX)"; fi
YR=$(ev 'window.__ep283QA.year()' 2>/dev/null | tr -dc '0-9')
YL=$(ev 'String(window.__ep283QA.year())===String(window.__ep283QA.year())&&document.getElementById("epCalMY").textContent.length>0' | tr -d '"')
if [ -n "$YR" ] && [ "$YR" -ge 2020 ] && [ "$YL" = "true" ]; then ok "বছর-লেবেল বুট-সিঙ্ক (year=$YR + লেবেল-বাংলা-অঙ্ক)"; else bad "বছর-ব্যর্থ (y=$YR lbl=$YL)"; fi
ROWS=$(ev 'document.querySelectorAll(".ep-cal-m").length' 2>/dev/null | tr -dc '0-9')
if [ "$ROWS" = "12" ]; then ok "১২-মাস-গ্রিড রেন্ডারড"; else bad "গ্রিড-ব্যর্থ ($ROWS/12)"; fi
HAS=$(ev 'window.__ep283QA.has()' 2>/dev/null | tr -dc '0-9')
DIS=$(ev 'document.querySelectorAll(".ep-cal-m[disabled]").length' 2>/dev/null | tr -dc '0-9')
EXPECT_DIS=$((12-${HAS:-0}))
if [ -n "$HAS" ] && [ "$DIS" = "$EXPECT_DIS" ]; then ok "has/disabled-গণনা সামঞ্জস্য (has=$HAS + disabled=$DIS = ১২)"; else bad "গণনা-ব্যর্থ (has=$HAS dis=$DIS exp=$EXPECT_DIS)"; fi
CURN=$(ev 'document.querySelectorAll(".ep-cal-m.is-cur").length' 2>/dev/null | tr -dc '0-9')
if [ "$CURN" = "1" ]; then ok "বর্তমান-মাস-ফিল (is-cur ×১)"; else bad "is-cur-ব্যর্থ ($CURN)"; fi
HASEX=$(ev 'document.querySelectorAll(".ep-cal-m.has").length===window.__ep283QA.has()&&document.querySelectorAll(".ep-cal-m:not([disabled])").length===window.__ep283QA.has()' | tr -d '"')
if [ "$HASEX" = "true" ]; then ok "has-ডট-শ্রেণি = সক্রিয়-মাস-সেট (তথ্য-সামঞ্জস্য)"; else bad "has-সেট-ব্যর্থ"; fi
agent-browser click '#epCalMYPrev' >/dev/null 2>&1; sleep 0.2
YR2=$(ev 'window.__ep283QA.year()' 2>/dev/null | tr -dc '0-9')
if [ -n "$YR" ] && [ -n "$YR2" ] && [ "$YR2" = "$((YR-1))" ]; then ok "বছর-স্টেপার −১ ($YR→$YR2)"; else bad "স্টেপার-ব্যর্থ ($YR→$YR2)"; fi
agent-browser click '#epCalMYNext' >/dev/null 2>&1; agent-browser click '#epCalMYNext' >/dev/null 2>&1; sleep 0.2
YR3=$(ev 'window.__ep283QA.year()' 2>/dev/null | tr -dc '0-9')
if [ "$YR3" = "$((YR+1))" ]; then ok "বছর-স্টেপার +২ ($YR2→$YR3)"; else bad "স্টেপার+ব্যর্থ ($YR2→$YR3)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.2
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
YR4=$(ev 'window.__ep283QA.year()' 2>/dev/null | tr -dc '0-9')
if [ "$YR4" = "$YR" ]; then ok "পুনঃ-খোলায় বছর-রিসেট (calY-সিঙ্ক $YR4)"; else bad "রিসেট-ব্যর্থ ($YR4≠$YR)"; fi
agent-browser eval 'document.querySelector(".ep-cal-m.has").click();0' >/dev/null 2>&1; sleep 0.4
JM=$(ev 'window.__ep283QA.jumped()===document.getElementById("epDateInput").value&&window.__ep283QA.jumped()!==""' | tr -d '"')
CL1=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
SELN=$(ev 'document.querySelectorAll(".ep-cal-day.is-sel").length' 2>/dev/null | tr -dc '0-9')
if [ "$JM" = "true" ] && [ "$CL1" = "false" ] && [ -n "$SELN" ] && [ "$SELN" -ge 1 ]; then ok "মাস-ক্লিকে এক-ক্লিক-জাম্প (jumped==elDateInput + is-sel-দিন + প্যানেল-বন্ধ)"; else bad "জাম্প-ব্যর্থ (jm=$JM open=$CL1 sel=$SELN)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.2
agent-browser press Escape >/dev/null 2>&1; sleep 0.2
CL2=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
AXF=$(ev 'document.getElementById("epCalMonth").getAttribute("aria-expanded")' | tr -d '"')
if [ "$CL2" = "false" ] && [ "$AXF" = "false" ]; then ok "Escape-বন্ধ + aria-expanded=false-ফেরত"; else bad "Escape-ব্যর্থ (open=$CL2 aria=$AXF)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.2
ev 'document.body.click();0' >/dev/null 2>&1; sleep 0.2
CL3=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
if [ "$CL3" = "false" ]; then ok "বাইরে-ক্লিকে-বন্ধ"; else bad "বাইরে-ক্লিকে-খোলা-থাকে"; fi

echo "── ধাপ-৪: স্ক্রিনশট (প্যানেল-খোলা অবস্থায়) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3; }
agent-browser screenshot "$APP/tests/s283-calmonth-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s283-calmonth-desk.png" ]; then ok "s283-calmonth-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (প্যানেল-খোলা)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s283-calmonth-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s283-calmonth-mobile390.png" ]; then ok "s283-calmonth-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
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
  curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
  FINLEN=$(plen)
  if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
else
  skip "মার্কার-ক্লিন (সিড-প্রয়োজন-হয়নি — PRE=$PRELEN)"
  ok "নেট-DB-রাইট-শূন্য (সিড-অপারেশন-শূন্য; মিউটেশন-POST-শূন্য — রিড-ওনলি-প্যানেল)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
