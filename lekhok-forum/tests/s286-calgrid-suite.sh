#!/bin/bash
# s286-calgrid-suite.sh — session286 মাস-গ্রিডে কী-বোর্ড-নেভিগেশন সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep286 = ep283-মাস-গ্রিডে ৪-কলাম-রোভিং (←→=±1, ↑=-4, ↓=+4; wrap + disabled-স্কিপ) +
# Home/End-enabled + Enter/Space-সক্রিয় + খোলায়-আর্ম (is-cur→has→প্রথম-enabled) + রোভিং-ট্যাবইনডেক্স +
# is-act-শ্রেণি + রি-রেন্ডার-সফট-আর্ম + Escape-ফোকাস-ফেরত epCalMonth + জাম্পে-ফোকাস-ফেরত;
# ep285/ep284/ep283/ep282/ep281/ep280 অক্ষুণ্ণ (র‍্যাপার-স্তর — ep283/ep284-ফাংশন-বডি-অস্পৃশ্য)।
# কভারেজ: ① সোর্স-কাঠামো (মডিউল-টোকেন + র‍্যাপার ×৩ + হুক + css ep286-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot + বহু-মাস-সিড ×৮ — জানু..আগস্ট-enabled;
#             সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser press): খোলায়-আর্ম (is-cur-অগ্রাধিকার — পেজ সর্বশেষ-সংরক্ষিত-তারিখে
#             বুট-করে → is-cur-আগস্ট-enabled; focused==active + is-act-বাটন-enabled) + is-act ×১ +
#             রোভিং-ট্যাবইনডেক্স (z=1, m=enabled-1, n=12 — disabled-বাটন-ট্যাবইনডেক্স-স্পর্শ-শূন্য) →
#             Home-জানু (নিশ্চিত-অ্যাংকর) → →-ফেব্রুয়ারি → ↓-জুন (+4) → ↑-ফেরত → End-আগস্ট (শেষ-enabled —
#             DOM-শেষ-ডিসেম্বর-নয়) → ↓-wrap+skip (আগস্ট→ডিসেম্বর-disabled→জানু) → ←-wrap+skip (জানু→
#             ডিসেম্বর-disabled→আগস্ট) → Home-জানু → Enter-জাম্প (প্রথম-সংরক্ষিত-দিন + প্যানেল-বন্ধ +
#             ফোকাস-ফেরত epCalMonth) → Escape-ফোকাস-ফেরত → স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s286-seedmonths; s284-মার্কার-অস্পৃশ্য)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ পোর্ট-ফ্রি-পোলিং-কিল
#         ④ ল্যাটিন-অঙ্ক-হুক-তুলনা (বাংলা-অঙ্ক-গ্রেপ-বারণ) ⑤ কিল→ক্লিন→বুট-ক্রম (stale-flush-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s286-page.html
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
containsF "QA-হুক __ep286QA" "$EJS" 'window.__ep286QA'
containsF "রোভিং-সেটার (tabindex + is-act)" "$EJS" "b.setAttribute('tabindex'"
containsF "is-act-টগল" "$EJS" "classList.toggle('is-act'"
containsF "→-নেভ (+1)" "$EJS" "k === 'ArrowRight'"
containsF "←-নেভ (-1)" "$EJS" "k === 'ArrowLeft'"
containsF "↓-নেভ (+4 — গ্রিড-সারি)" "$EJS" "ep286Move(4)"
containsF "↑-নেভ (-4 — গ্রিড-সারি)" "$EJS" "ep286Move(-4)"
containsF "Home-গার্ড" "$EJS" "k === 'Home'"
containsF "End-গার্ড (শেষ-enabled লুপ)" "$EJS" "if (!all[i].disabled) { fN = all[i]; break; }"
containsF "Enter/Space-সক্রিয়" "$EJS" "k === 'Enter' || k === ' '"
containsF "wrap-গণিত (+12-নিরাপত্তা)" "$EJS" "(idx + step + 12) % 12"
containsF "disabled-স্কিপ-লুপ" "$EJS" "while (tries < 12 && bs[n] && bs[n].disabled)"
containsF "খোলায়-আর্ম (র‍্যাপার — নাম-মিল)" "$EJS" 'ep286OpenPanelBase'
containsF "রি-রেন্ডার-সফট-আর্ম (র‍্যাপার)" "$EJS" 'ep286RenderBase'
containsF "বন্ধে-রিসেট/Escape-ফোকাস (র‍্যাপার)" "$EJS" 'ep286ClosePanelBase'
containsF "Escape-পতাকা (capture-ফেজ)" "$EJS" 'ep286EscPending = true'
containsF "জাম্পে-ফোকাস-ফেরত (epCalMonth)" "$EJS" 'elCalMonth.focus()'
containsF "is-cur→has-অগ্রাধিকার-আর্ম" "$EJS" '.ep-cal-m.is-cur:not(:disabled)'
containsF "ep285-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep285QA'
containsF "ep284-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep284QA'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B286=$(echo "$CSSF" | sed -n '/session286 — মাস-গ্রিডে কী-বোর্ড-নেভিগেশন/,$p')
if [ -n "$B286" ]; then
  ok "ep286-ব্লক উপস্থিত"
  HEXN=$(echo "$B286" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep286-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep286-ব্লকে হেক্স $HEXN"; fi
  containsF "is-act-টিন্ট" "$B286" '.ep-cal-m.is-act'
  containsF "is-cur.is-act-আউটলাইন" "$B286" '.ep-cal-m.is-act.is-cur'
  containsF "মোবাইল-সংকোচন (640px)" "$B286" 'max-width: 640px'
  containsF "reduced-motion-গার্ড" "$B286" 'prefers-reduced-motion'
else
  bad "ep286-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
PC0=$(node "$APP/scripts/s286-seedmonths.js" clean 2>/dev/null | tail -1)
if echo "$PC0" | grep -q "CLEAN-OK"; then ok "প্রি-ক্লিন ($PC0 — কিল→ক্লিন→বুট-ক্রম; স্টেল-মার্কার-মুক্ত বেসলাইন)"; else bad "প্রি-ক্লিন-ব্যর্থ ($PC0)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "fresh-reboot (টেমপ্লেট-কম্পাইল নিশ্চিত)" || bad "fresh-reboot-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)

echo "── ধাপ-২.৫: বহু-মাস-মার্কার-সিড (s286-হেল্পার — ২০২৬-জানু..আগস্ট গ্যারান্টি) ──"
kill8094
SR=$(node "$APP/scripts/s286-seedmonths.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -qE "SEED-(OK|ALREADY)"; then ok "বহু-মাস-মার্কার-সিড ($SR)"; SEEDED=1; else bad "সিড-ব্যর্থ ($SR)"; SEEDED=0; E2E_OK=0; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper?nc=$RANDOM")
SEEDLEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
E2E_OK=1
if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 8 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরে-অপ্রত্যাশিত (HTTP $PC2 SEED=$SEEDLEN)"; E2E_OK=0; fi

echo "── ধাপ-২.৭: রিডার-মার্কআপ যাচাই (সিড-পরে) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
MK=$(grep -o 'epCalMPanel\|epCalMGrid\|epCalMonth\|epCalMY"' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "মাস-প্যানেল-মার্কআপ রেন্ডারড (৪-উপাদান)"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser press) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep286QA==="object"&&typeof window.__ep286QA.move==="function"&&typeof window.__ep286QA.focused==="function"&&typeof window.__ep285QA==="object"&&typeof window.__ep283QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep286QA + __ep285QA + __ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
S1=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
if [ "$S1" = "true" ]; then ok "প্যানেল-খোলা (পূর্বশর্ত)"; else bad "প্যানেল-খোলা-ব্যর্থ ($S1)"; fi
FA=$(ev 'window.__ep286QA.focused()' 2>/dev/null | tr -dc '0-9')
AA=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
ARMD=$(ev 'var b=document.querySelector(".ep-cal-m.is-act"); b && !b.disabled && (b.classList.contains("has")||b.classList.contains("is-cur"))' | tr -d '"')
if [ -n "$FA" ] && [ "$FA" = "$AA" ] && [ "$ARMD" = "true" ]; then ok "খোলায়-আর্ম is-cur-অগ্রাধিকারে (focused=$FA == active=$AA, enabled+has/is-cur — পেজ-সর্বশেষ-তারিখ-বুট)"; else bad "আর্ম-ব্যর্থ (focused=$FA active=$AA arm=$ARMD)"; fi
ACTN=$(ev 'document.querySelectorAll(".ep-cal-m.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$ACTN" = "1" ]; then ok "is-act ×১ (খোলায়-আর্ম)"; else bad "is-act-ব্যর্থ ($ACTN)"; fi
ROV=$(ev 'var b=[].slice.call(document.querySelectorAll(".ep-cal-m")); JSON.stringify({z:b.filter(function(x){return x.getAttribute("tabindex")==="0"}).length,m:b.filter(function(x){return x.getAttribute("tabindex")==="-1"}).length,n:b.length,d:b.filter(function(x){return x.disabled}).length})' 2>/dev/null | tr -d '"\\')
ROVZ=$(echo "$ROV" | sed 's/.*z:\([0-9]*\).*/\1/')
ROVM=$(echo "$ROV" | sed 's/.*m:\([0-9]*\).*/\1/')
ROVN=$(echo "$ROV" | sed 's/.*n:\([0-9]*\).*/\1/')
ROVD=$(echo "$ROV" | sed 's/.*d:\([0-9]*\).*/\1/')
if [ "$ROVZ" = "1" ] && [ "$ROVM" = "$((ROVN-ROVD-1))" ] && [ "$ROVN" = "12" ]; then ok "রোভিং-ট্যাবইনডেক্স (z=1, m=$ROVM=enabled-1, n=$ROVN, disabled=$ROVD — disabled-স্পর্শ-শূন্য)"; else bad "রোভিং-ব্যর্থ ($ROV)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.2
A0=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A0" = "0" ]; then ok "Home-অ্যাংকর (জানু $A0 — নেভ-ক্রমের-ভিত্তি)"; else bad "Home-অ্যাংকর-ব্যর্থ (active=$A0)"; fi
agent-browser press ArrowRight >/dev/null 2>&1; sleep 0.2
A1=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
F1=$(ev 'window.__ep286QA.focused()' 2>/dev/null | tr -dc '0-9')
if [ "$A1" = "1" ] && [ "$F1" = "1" ]; then ok "→-ফেব্রুয়ারি (0→1 + ফোকাস-অনুসরণ)"; else bad "→-ব্যর্থ (active=$A1 focused=$F1)"; fi
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A2=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A2" = "5" ]; then ok "↓-জুন (1→5 — গ্রিড-সারি-নেভ)"; else bad "↓-ব্যর্থ (active=$A2 exp=5)"; fi
agent-browser press ArrowUp >/dev/null 2>&1; sleep 0.2
A3=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A3" = "1" ]; then ok "↑-ফেরত (5→1)"; else bad "↑-ব্যর্থ (active=$A3 exp=1)"; fi
agent-browser press End >/dev/null 2>&1; sleep 0.2
A4=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A4" = "7" ]; then ok "End-আগস্ট (শেষ-enabled — DOM-শেষ-ডিসেম্বর-নয়)"; else bad "End-ব্যর্থ (active=$A4 exp=7)"; fi
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A5=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A5" = "0" ]; then ok "↓-wrap+skip (7→ডিসেম্বর-disabled→জানু $A5)"; else bad "↓-wrap-ব্যর্থ (active=$A5 exp=0)"; fi
agent-browser press ArrowLeft >/dev/null 2>&1; sleep 0.2
A6=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A6" = "7" ]; then ok "←-wrap+skip (0→ডিসেম্বর-disabled→আগস্ট $A6)"; else bad "←-wrap-ব্যর্থ (active=$A6 exp=7)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.2
A7=$(ev 'window.__ep286QA.active()' 2>/dev/null | tr -dc '0-9')
if [ "$A7" = "0" ]; then ok "Home-জানু (প্রথম-enabled — Enter-জাম্পের-পূর্বশর্ত)"; else bad "Home-ব্যর্থ (active=$A7 exp=0)"; fi
agent-browser press Enter >/dev/null 2>&1; sleep 0.3
JP=$(ev 'window.__ep283QA.jumped()' 2>/dev/null | tr -d '"')
P3=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
FBACK=$(ev 'document.activeElement && document.activeElement.id || ""' 2>/dev/null | tr -d '"')
if [ "$JP" = "2026-01-10" ] && [ "$P3" = "false" ] && [ "$FBACK" = "epCalMonth" ]; then ok "Enter-জাম্প ($JP + প্যানেল-বন্ধ + ফোকাস-ফেরত epCalMonth)"; else bad "Enter-জাম্প-ব্যর্থ (jumped=$JP panel=$P3 focus=$FBACK)"; fi
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
agent-browser press Escape >/dev/null 2>&1; sleep 0.3
P4=$(ev 'window.__ep283QA.isOpen()' | tr -d '"')
FB2=$(ev 'document.activeElement && document.activeElement.id || ""' 2>/dev/null | tr -d '"')
if [ "$P4" = "false" ] && [ "$FB2" = "epCalMonth" ]; then ok "Escape-বন্ধ + ফোকাস-ফেরত epCalMonth ($FB2)"; else bad "Escape-ফোকাস-ব্যর্থ (panel=$P4 focus=$FB2)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (গ্রিড-খোলা + is-act) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; agent-browser click '#epCalMonth' >/dev/null 2>&1; sleep 0.3; }
agent-browser screenshot "$APP/tests/s286-calgrid-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s286-calgrid-desk.png" ]; then ok "s286-calgrid-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (গ্রিড-খোলা)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s286-calgrid-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s286-calgrid-mobile390.png" ]; then ok "s286-calgrid-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-ব্যর্থ) ──"
skip "E2E-আচরণ"
skip "স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (mo268-চুক্তি) ──"
if [ "$SEEDED" = "1" ]; then
  kill8094
  CR=$(node "$APP/scripts/s286-seedmonths.js" clean 2>/dev/null | tail -1)
  if echo "$CR" | grep -q "CLEAN-OK deleted=8 residual=0"; then ok "মার্কার-ক্লিন (ডিলিট=৮ residual=০)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
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
