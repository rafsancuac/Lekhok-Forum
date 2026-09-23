#!/bin/bash
# s288-calaria-suite.sh — session288 ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep288 = ep287-পরবর্তী a11y-স্তর — aria-live (polite/role=status) লাইভ-রিজিয়নে বাংলা-ঘোষণা
# (রোভিং-দিন + মাস-পরিবর্তন; আজ/নির্বাচিত/সংরক্ষিত-সাফিক্স) + দিন-বাটনে aria-label + is-sel-এ
# aria-current="date" + **স্টেপার-aria-label আচরণ-মিল-সংশোধন** (epCalPrev=calM++ → "পরের মাস";
# epCalNext=calM-- → "আগের মাস" — লেবেল-বনাম-আচরণ-বৈপরীত্য-বাগ-ফিক্স) + বুট-নীরব (engaged-গেট);
# র‍্যাপার-স্তর (ep287SetActive/calRender-বডি-অস্পৃশ্য); ep287/286/285/284/283 অক্ষুণ্ণ।
# কভারেজ: ① সোর্স-কাঠামো (মডিউল + র‍্যাপার ×২ + লেবেল-ফিক্স + লাইভ-রিজিয়ন + হুক ×৬-ফিল্ড + css হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot + মার্কার-সিড (hasPayload-গেট — s283-গোটচা);
#             সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser): বুট-নীরব (last='' + engaged=false) + aria-সিঙ্ক-লোডে (labeled=days +
#             current=is-sel) + set()-গেট-প্রমাণ (ফোকাস-দেয়, ঘোষণা-নয়) + →-রোভিং-ঘোষণা (last==label-ডায়নামিক)
#             + স্টেপার-মাস-ঘোষণা ('মাস: ' উপসর্গ) + Enter-জাম্প-ঘোষণা ('নির্বাচিত'-সাফিক্স + aria-current-স্থানান্তর)
#             + লেবেল-ফিক্স-রেন্ডার্ড-প্রমাণ + ep287-অক্ষুণ্ণ (tabbed=1, is-act ×১) + স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s287-seedday-পুনঃব্যবহার — হেল্পার-পুনঃব্যবহারযোগ্যতা-চুক্তি)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ পোর্ট-ফ্রি-পোলিং-কিল
#         ④ ল্যাটিন-অঙ্ক-হুক-তুলনা ⑤ কিল→ক্লিন→বুট-ক্রম ⑥ আর্ম/নেভ-অ্যাসার্ট-ডায়নামিক (s286/s287-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s288-page.html
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
containsF "QA-হুক __ep288QA" "$EJS" 'window.__ep288QA'
containsF "ep288Say-ঘোষণাকারী" "$EJS" 'function ep288Say'
containsF "ep288DayLabel-লেবেলকারী (আজ/নির্বাচিত/সংরক্ষিত)" "$EJS" 'function ep288DayLabel'
containsF "ep288SyncAria (aria-label + aria-current)" "$EJS" 'function ep288SyncAria'
containsF "ep287SetActive-র‍্যাপার (দিন-ঘোষণা)" "$EJS" 'ep288SetActiveBase'
containsF "calRender-র‍্যাপার (aria-সিঙ্ক + মাস-ঘোষণা)" "$EJS" 'ep288CalRenderBase'
containsF "engaged-গেট (বুট-নীরব)" "$EJS" 'ep288Engaged = true'
containsF "মাস-ঘোষণা-স্ট্রিং" "$EJS" "ep288Say('মাস: '"
containsF "লাইভ-রিজিয়ন-মার্কআপ" "$EJS" 'id="epCalLive" role="status" aria-live="polite"'
containsF "স্টেপার-লেবেল-ফিক্স epCalPrev (পরের মাস)" "$EJS" 'id="epCalPrev" aria-label="পরের মাস"'
containsF "স্টেপার-লেবেল-ফিক্স epCalNext (আগের মাস)" "$EJS" 'id="epCalNext" aria-label="আগের মাস"'
containsF "দিন-বাটন-aria-label-স্থাপনা" "$EJS" "b.setAttribute('aria-label'"
containsF "aria-current-স্থাপনা" "$EJS" "'aria-current', 'date'"
containsF "ep287-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep287QA'
containsF "ep286-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep286QA'
containsF "ep285-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep285QA'
containsF "ep284-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep284QA'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B288=$(echo "$CSSF" | sed -n '/session288 — ক্যালেন্ডার-কার্ডে a11y-ভার্বালাইজেশন/,$p')
if [ -n "$B288" ]; then
  ok "ep288-ব্লক উপস্থিত"
  HEXN=$(echo "$B288" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep288-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep288-ব্লকে হেক্স $HEXN"; fi
  containsF "sr-only লাইভ-রিজিয়ন" "$B288" '.ep-cal-live'
  containsF "aria-current-দৃশ্যমান-রিং" "$B288" '.ep-cal-day[aria-current="date"]'
else
  bad "ep288-ব্লক অনুপস্থিত"
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

echo "── ধাপ-২.৭: রেন্ডার্ড-মার্কআপ যাচাই (সিড-পরে — hasPayload-গেট) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
PAGEC=$(cat "$PAGE")
containsF "লাইভ-রিজিয়ন-রেন্ডারড (role+aria-live)" "$PAGEC" 'id="epCalLive" role="status" aria-live="polite"'
containsF "স্টেপার-লেবেল-ফিক্স-রেন্ডারড (epCalPrev)" "$PAGEC" 'id="epCalPrev" aria-label="পরের মাস"'
containsF "স্টেপার-লেবেল-ফিক্স-রেন্ডারড (epCalNext)" "$PAGEC" 'id="epCalNext" aria-label="আগের মাস"'

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep288QA==="object"&&typeof window.__ep288QA.say==="function"&&typeof window.__ep287QA==="object"&&typeof window.__ep283QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep288QA + __ep287QA + __ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
L0=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
G0=$(ev 'window.__ep288QA.engaged()' 2>/dev/null | tr -d '"')
if [ -z "$L0" ] && [ "$G0" = "false" ]; then ok "বুট-নীরব (last=শূন্য + engaged=false — লোডে-ঘোষণা-কোলাহল-শূন্য)"; else bad "বুট-নীরব-ব্যর্থ (last=$L0 engaged=$G0)"; fi
DN=$(ev 'window.__ep287QA.days()' 2>/dev/null | tr -dc '0-9')
LB=$(ev 'window.__ep288QA.labeled()' 2>/dev/null | tr -dc '0-9')
if [ -n "$DN" ] && [ "$LB" = "$DN" ]; then ok "aria-সিঙ্ক-লোডে (labeled=$LB == days=$DN)"; else bad "aria-সিঙ্ক-ব্যর্থ (labeled=$LB days=$DN)"; fi
SEL0=$(ev '(function(){var b=document.querySelector("#epCalGrid .ep-cal-day.is-sel:not(:disabled)");return b?b.getAttribute("data-d"):""})()' 2>/dev/null | tr -d '"')
CU0=$(ev 'window.__ep288QA.current()' 2>/dev/null | tr -d '"')
if [ -n "$SEL0" ] && [ "$CU0" = "$SEL0" ]; then ok "aria-current-লোডে ($CU0 == is-sel)"; else bad "aria-current-ব্যর্থ (current=$CU0 sel=$SEL0)"; fi
ev 'window.__ep287QA.set(window.__ep287QA.active())' >/dev/null 2>&1; sleep 0.2
L1=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
FA=$(ev 'window.__ep287QA.focused()' 2>/dev/null | tr -d '"')
if [ -z "$L1" ] && [ -n "$FA" ]; then ok "set()-গেট-প্রমাণ (ফোকাস-দেয় $FA, ঘোষণা-নয় — প্রোগ্রাম্যাটিক-নীরব)"; else bad "set()-গেট-ব্যর্থ (last=$L1 focused=$FA)"; fi
agent-browser press ArrowRight >/dev/null 2>&1; sleep 0.25
G2=$(ev 'window.__ep288QA.engaged()' 2>/dev/null | tr -d '"')
A2=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
L2=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
EXP2=$(ev 'window.__ep288QA.label(window.__ep287QA.active())' 2>/dev/null | tr -d '"')
if [ "$G2" = "true" ] && [ -n "$A2" ] && [ -n "$L2" ] && [ "$L2" = "$EXP2" ]; then ok "→-রোভিং-ঘোষণা (engaged + last==label — $L2)"; else bad "রোভিং-ঘোষণা-ব্যর্থ (engaged=$G2 active=$A2 last=$L2 exp=$EXP2)"; fi
agent-browser press ArrowLeft >/dev/null 2>&1; sleep 0.25
A3=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
L3=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
EXP3=$(ev 'window.__ep288QA.label(window.__ep287QA.active())' 2>/dev/null | tr -d '"')
if [ -n "$L3" ] && [ "$L3" = "$EXP3" ] && [ "$A3" != "$A2" ]; then ok "←-রোভিং-ঘোষণা-পুনঃ-স্থানান্তর ($L3)"; else bad "←-ঘোষণা-ব্যর্থ (active=$A3 last=$L3 exp=$EXP3)"; fi
agent-browser click '#epCalNext' >/dev/null 2>&1; sleep 0.4
L4=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
STZ=$(ev 'window.__ep287QA.tabbed()' 2>/dev/null | tr -dc '0-9')
if echo "$L4" | grep -qF 'মাস: ' && [ "$STZ" = "1" ]; then ok "স্টেপার-মাস-ঘোষণা ($L4 — ep287-রোভিং-অক্ষুণ্ণ z=$STZ)"; else bad "মাস-ঘোষণা-ব্যর্থ (last=$L4 z=$STZ)"; fi
ev 'window.__ep287QA.set(window.__ep287QA.active())' >/dev/null 2>&1; sleep 0.2
agent-browser press Home >/dev/null 2>&1; sleep 0.2
agent-browser press Enter >/dev/null 2>&1; sleep 0.45
L5=$(ev 'window.__ep288QA.last()' 2>/dev/null | tr -d '"')
A5=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
F5=$(ev 'window.__ep287QA.focused()' 2>/dev/null | tr -d '"')
C5=$(ev 'window.__ep288QA.current()' 2>/dev/null | tr -d '"')
if echo "$L5" | grep -qF '(নির্বাচিত)' && [ "$A5" = "$F5" ] && [ "$C5" = "$A5" ]; then ok "Enter-জাম্প-ঘোষণা ($L5 — aria-current-স্থানান্তর $C5 + ফোকাস-ফেরত)"; else bad "জাম্প-ঘোষণা-ব্যর্থ (last=$L5 active=$A5 focused=$F5 current=$C5)"; fi
LP=$(ev 'document.getElementById("epCalPrev").getAttribute("aria-label")' 2>/dev/null | tr -d '"')
LN=$(ev 'document.getElementById("epCalNext").getAttribute("aria-label")' 2>/dev/null | tr -d '"')
if [ "$LP" = "পরের মাস" ] && [ "$LN" = "আগের মাস" ]; then ok "স্টেপার-লেবেল-আচরণ-মিল (Prev=পরের মাস, Next=আগের মাস — calM±±-সত্য)"; else bad "লেবেল-মিল-ব্যর্থ (Prev=$LP Next=$LN)"; fi
ACTN=$(ev 'document.querySelectorAll(".ep-cal-day.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$ACTN" = "1" ]; then ok "ep287-অক্ষুণ্ণ (is-act ×১ রাউন্ড-শেষে)"; else bad "is-act-ব্যর্থ ($ACTN)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (ক্যালেন্ডার + aria-current-রিং) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; }
agent-browser screenshot "$APP/tests/s288-calaria-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s288-calaria-desk.png" ]; then ok "s288-calaria-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s288-calaria-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s288-calaria-mobile390.png" ]; then ok "s288-calaria-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
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
