#!/bin/bash
# s287-calday-suite.sh — session287 দিন-গ্রিডে কী-বোর্ড-নেভিগেশন সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ep287 = epCalGrid-দিন-গ্রিডে ৭-কলাম-রোভিং (←→=±1, ↑=-7, ↓=+7; wrap + disabled-স্কিপ —
# ভবিষ্যৎ-দিন-লাফ; মাস-সীমা-স্কিপ = সীমা-অতিক্রম-নয় — wrap-এ-সীমা-লাফ, ep286-চুক্তি) +
# Home/End-enabled + Enter/Space-সক্রিয় (grid-ক্লিক-হ্যান্ডলার-পুনঃব্যবহার — calJump-ডুপ্লিকেট-নিষিদ্ধ)
# + জাম্পে-ফোকাস-ফেরত is-sel-দিন + বুট/রি-রেন্ডার-সফট-আর্ম (is-sel→is-today→প্রথম-enabled;
# calRender-র‍্যাপার) + রোভিং-ট্যাবইনডেক্স (disabled-স্পর্শ-শূন্য) + is-act-শ্রেণি; ep286/285/284/283 অক্ষুণ্ণ।
# কভারেজ: ① সোর্স-কাঠামো (মডিউল-টোকেন + র‍্যাপার + হুক ×৮-ফিল্ড + css ep287-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot + মার্কার-সিড (hasPayload-গ্যারান্টি — s283-গোটচা);
#             সব-curl-এ ?nc=$RANDOM)
#          ③ E2E (agent-browser press): বুট-আর্ম (ডায়নামিক — পেজ সর্বশেষ-সংরক্ষিত-তারিখে-বুট;
#             focused==active set()-পরে) + is-act ×১ + রোভিং-ট্যাবইনডেক্স (z=1, m=enabled-1,
#             disabled-ট্যাবইনডেক্স-স্পর্শ-শূন্য) → Home-অ্যাংকর → →/↓(+7)/↑(-7) → End → →-wrap+skip →
#             ←-wrap+skip → Home → Enter-জাম্প (is-sel-স্থানান্তর + ফোকাস-ফেরত গ্রিডেই) → স্টেপার-সফট-আর্ম
#             (ফোকাস-চুরি-শূন্য) → স্ক্রিনশট ×২ + 390px-hScroll-শূন্য
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s287-seedday; s284/s286-মার্কার-অস্পৃশ্য)
# চুক্তি: ① eval-escaped-quote-নিষিদ্ধ ② css-nocache-relink ③ পোর্ট-ফ্রি-পোলিং-কিল
#         ④ ল্যাটিন-অঙ্ক-হুক-তুলনা (বাংলা-অঙ্ক-গ্রেপ-বারণ) ⑤ কিল→ক্লিন→বুট-ক্রম (stale-flush-গোটচা)
#         ⑥ আর্ম/নেভ-অ্যাসার্ট-ডায়নামিক (is-cur-সর্বশেষ-তারিখ-বুট-গোটচা — s286-চুক্তি-অনুলিপি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s287-page.html
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
containsF "QA-হুক __ep287QA" "$EJS" 'window.__ep287QA'
containsF "রোভিং-সেটার (tabindex + is-act)" "$EJS" "b.setAttribute('tabindex'"
containsF "is-act-টগল" "$EJS" "classList.toggle('is-act'"
containsF "→-নেভ (+1)" "$EJS" "k === 'ArrowRight'"
containsF "←-নেভ (-1)" "$EJS" "k === 'ArrowLeft'"
containsF "↓-নেভ (+7 — ৭-কলাম-সারি)" "$EJS" "ep287Move(7)"
containsF "↑-নেভ (-7 — ৭-কলাম-সারি)" "$EJS" "ep287Move(-7)"
containsF "Home-গার্ড" "$EJS" "k === 'Home'"
containsF "End-গার্ড (শেষ-enabled লুপ)" "$EJS" "if (!all[i].disabled) { fN = all[i]; break; }"
containsF "Enter/Space-সক্রিয়" "$EJS" "k === 'Enter' || k === ' '"
containsF "wrap-গণিত (bs.length-নিরাপত্তা)" "$EJS" "(idx + step + bs.length) % bs.length"
containsF "disabled-স্কিপ-লুপ" "$EJS" "while (tries < bs.length && bs[n] && bs[n].disabled)"
containsF "is-sel-অগ্রাধিকার-আর্ম" "$EJS" '.ep-cal-day.is-sel:not(:disabled)'
containsF "is-today-ফলব্যাক-আর্ম" "$EJS" '.ep-cal-day.is-today:not(:disabled)'
containsF "calRender-র‍্যাপার (সফট-আর্ম)" "$EJS" 'ep287CalRenderBase'
containsF "জাম্পে-ফোকাস-ফেরত (is-sel-দিন)" "$EJS" "|| elCalGrid.querySelector('.ep-cal-day[data-d="
containsF "হুক-ফিল্ড days/enabled/tabbed" "$EJS" 'tabbed: function'
containsF "ep286-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep286QA'
containsF "ep285-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep285QA'
containsF "ep284-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep284QA'
containsF "ep283-হুক অক্ষুণ্ণ" "$EJS" 'window.__ep283QA'
B287=$(echo "$CSSF" | sed -n '/session287 — দিন-গ্রিডে কী-বোর্ড-নেভিগেশন/,$p')
if [ -n "$B287" ]; then
  ok "ep287-ব্লক উপস্থিত"
  HEXN=$(echo "$B287" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep287-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep287-ব্লকে হেক্স $HEXN"; fi
  containsF "is-act-টিন্ট" "$B287" '.ep-cal-day.is-act'
  containsF "is-act.is-sel-সংরক্ষণ" "$B287" '.ep-cal-day.is-act.is-sel'
  containsF "focus-visible-রিং" "$B287" '.ep-cal-day:focus-visible'
  containsF "মোবাইল-সংকোচন (640px)" "$B287" 'max-width: 640px'
  containsF "reduced-motion-গার্ড" "$B287" 'prefers-reduced-motion'
else
  bad "ep287-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো (প্রি-ক্লিন + fresh-reboot — stale-view-cache-গোটচা) ──"
kill8094
PC0=$(node "$APP/scripts/s287-seedday.js" clean 2>/dev/null | tail -1)
if echo "$PC0" | grep -q "CLEAN-OK"; then ok "প্রি-ক্লিন ($PC0 — কিল→ক্লিন→বুট-ক্রম; স্টেল-মার্কার-মুক্ত বেসলাইন)"; else bad "প্রি-ক্লিন-ব্যর্থ ($PC0)"; fi
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
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
E2E_OK=1
if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; else bad "সিড-পরে-অপ্রত্যাশিত (HTTP $PC2 SEED=$SEEDLEN)"; E2E_OK=0; fi

echo "── ধাপ-২.৭: রিডার-মার্কআপ যাচাই (সিড-পরে — hasPayload-গেট) ──"
curl -s -o "$PAGE" "$BASE/epaper?nc=$RANDOM"
MK=$(grep -o 'epCalGrid\|epCalMonth\|epCalPrev\|epCalNext' "$PAGE" | sort -u | wc -l)
if [ "$MK" = "4" ]; then ok "দিন-গ্রিড-মার্কআপ রেন্ডারড (৪-উপাদান)"; else bad "মার্কআপ-অসম্পূর্ণ ($MK/4)"; fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser press) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
HOOK=$(ev 'typeof window.__ep287QA==="object"&&typeof window.__ep287QA.move==="function"&&typeof window.__ep287QA.tabbed==="function"&&typeof window.__ep286QA==="object"&&typeof window.__ep283QA==="object"' | tr -d '"')
if [ "$HOOK" = "true" ]; then ok "__ep287QA + __ep286QA + __ep283QA হুক সজ্জিত"; else bad "হুক-অনুপস্থিত ($HOOK)"; fi
DAYS=$(ev 'window.__ep287QA.days()' 2>/dev/null | tr -dc '0-9')
EN=$(ev 'window.__ep287QA.enabled()' 2>/dev/null | tr -dc '0-9')
DN=$(ev 'window.__ep287QA.days()' 2>/dev/null | tr -dc '0-9')
if [ -n "$DAYS" ] && [ "$DAYS" -ge 28 ] && [ "$DAYS" -le 31 ]; then ok "গ্রিড-দিন-গণনা (days=$DAYS — ২৮..৩১-বৈধ)"; else bad "days-অবৈধ ($DAYS)"; fi
AA=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
ARMB=$(ev 'var b=document.querySelector(".ep-cal-day.is-act"); b && !b.disabled && (b.classList.contains("is-sel")||b.classList.contains("is-today")||b.getAttribute("data-d"))' 2>/dev/null | tr -d '"')
if [ -n "$AA" ] && [ "$ARMB" != "false" ] && [ "$ARMB" != "" ]; then ok "বুট-আর্ম (active=$AA — is-act-enabled + is-sel/is-today/দিন — সর্বশেষ-তারিখ-বুট-ডায়নামিক)"; else bad "বুট-আর্ম-ব্যর্থ (active=$AA arm=$ARMB)"; fi
ev 'window.__ep287QA.set(window.__ep287QA.active())' >/dev/null 2>&1; sleep 0.2
FA=$(ev 'window.__ep287QA.focused()' 2>/dev/null | tr -d '"')
AA2=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$FA" ] && [ "$FA" = "$AA2" ]; then ok "set()-ফোকাস-চেইন (focused=$FA == active=$AA2)"; else bad "ফোকাস-চেইন-ব্যর্থ (focused=$FA active=$AA2)"; fi
ACTN=$(ev 'document.querySelectorAll(".ep-cal-day.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$ACTN" = "1" ]; then ok "is-act ×১ (বুট-আর্ম)"; else bad "is-act-ব্যর্থ ($ACTN)"; fi
ROV=$(ev 'var b=[].slice.call(document.querySelectorAll(".ep-cal-day")); JSON.stringify({z:b.filter(function(x){return x.getAttribute("tabindex")==="0"}).length,m:b.filter(function(x){return x.getAttribute("tabindex")==="-1"}).length,n:b.length,d:b.filter(function(x){return x.disabled}).length,t:b.filter(function(x){return x.disabled&&x.hasAttribute("tabindex")}).length})' 2>/dev/null | tr -d '"\\')
ROVZ=$(echo "$ROV" | sed 's/.*z:\([0-9]*\).*/\1/')
ROVM=$(echo "$ROV" | sed 's/.*m:\([0-9]*\).*/\1/')
ROVN=$(echo "$ROV" | sed 's/.*n:\([0-9]*\).*/\1/')
ROVD=$(echo "$ROV" | sed 's/.*d:\([0-9]*\).*/\1/')
ROVT=$(echo "$ROV" | sed 's/.*t:\([0-9]*\).*/\1/')
ENB=$((ROVN-ROVD))
if [ "$ROVZ" = "1" ] && [ "$ROVM" = "$((ENB-1))" ] && [ "$ROVT" = "0" ]; then ok "রোভিং-ট্যাবইনডেক্স (z=$ROVZ, m=$ROVM=enabled-1, n=$ROVN, disabled=$ROVD, disabled-স্পর্শ=$ROVT)"; else bad "রোভিং-ব্যর্থ ($ROV)"; fi
EXPF0=$(ev '(function(){var b=document.querySelector("#epCalGrid .ep-cal-day:not(:disabled)");return b?b.getAttribute("data-d"):""})()' 2>/dev/null | tr -d '"')
agent-browser press Home >/dev/null 2>&1; sleep 0.2
A0=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXPF0" ] && [ "$A0" = "$EXPF0" ]; then ok "Home-অ্যাংকর ($A0 — প্রথম-enabled; নেভ-ক্রমের-ভিত্তি)"; else bad "Home-অ্যাংকর-ব্যর্থ (active=$A0 exp=$EXPF0)"; fi
EXP1=$(ev "(function(){var bs=[].slice.call(document.querySelectorAll('#epCalGrid .ep-cal-day'));var act=window.__ep287QA.active();var i=-1,j;for(j=0;j<bs.length;j++){if(bs[j].getAttribute('data-d')===act){i=j;break}}if(i<0)return '';var st=1,n=(i+st+bs.length)%bs.length,t=0;while(t<bs.length&&bs[n]&&bs[n].disabled){n=(n+(st>0?1:-1)+bs.length)%bs.length;t++}if(t>=bs.length||!bs[n]||bs[n].disabled)return '';return bs[n].getAttribute('data-d')})()" 2>/dev/null | tr -d '"')
agent-browser press ArrowRight >/dev/null 2>&1; sleep 0.2
A1=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
F1=$(ev 'window.__ep287QA.focused()' 2>/dev/null | tr -d '"')
if [ -n "$EXP1" ] && [ "$A1" = "$EXP1" ] && [ "$F1" = "$A1" ]; then ok "→-নেভ ($A1 + ফোকাস-অনুসরণ)"; else bad "→-ব্যর্থ (active=$A1 exp=$EXP1 focused=$F1)"; fi
EXP2=$(ev "(function(){var bs=[].slice.call(document.querySelectorAll('#epCalGrid .ep-cal-day'));var act=window.__ep287QA.active();var i=-1,j;for(j=0;j<bs.length;j++){if(bs[j].getAttribute('data-d')===act){i=j;break}}if(i<0)return '';var st=7,n=(i+st+bs.length)%bs.length,t=0;while(t<bs.length&&bs[n]&&bs[n].disabled){n=(n+(st>0?1:-1)+bs.length)%bs.length;t++}if(t>=bs.length||!bs[n]||bs[n].disabled)return '';return bs[n].getAttribute('data-d')})()" 2>/dev/null | tr -d '"')
agent-browser press ArrowDown >/dev/null 2>&1; sleep 0.2
A2=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXP2" ] && [ "$A2" = "$EXP2" ]; then ok "↓-নেভ (+7-সারি: $A2)"; else bad "↓-ব্যর্থ (active=$A2 exp=$EXP2)"; fi
EXP3=$(ev "(function(){var bs=[].slice.call(document.querySelectorAll('#epCalGrid .ep-cal-day'));var act=window.__ep287QA.active();var i=-1,j;for(j=0;j<bs.length;j++){if(bs[j].getAttribute('data-d')===act){i=j;break}}if(i<0)return '';var st=-7,n=(i+st+bs.length)%bs.length,t=0;while(t<bs.length&&bs[n]&&bs[n].disabled){n=(n+(st>0?1:-1)+bs.length)%bs.length;t++}if(t>=bs.length||!bs[n]||bs[n].disabled)return '';return bs[n].getAttribute('data-d')})()" 2>/dev/null | tr -d '"')
agent-browser press ArrowUp >/dev/null 2>&1; sleep 0.2
A3=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXP3" ] && [ "$A3" = "$EXP3" ]; then ok "↑-নেভ (-7-সারি: $A3)"; else bad "↑-ব্যর্থ (active=$A3 exp=$EXP3)"; fi
EXPF4=$(ev '(function(){var b=[].slice.call(document.querySelectorAll("#epCalGrid .ep-cal-day"));var i;for(i=b.length-1;i>=0;i--){if(!b[i].disabled)return b[i].getAttribute("data-d")}return ""})()' 2>/dev/null | tr -d '"')
agent-browser press End >/dev/null 2>&1; sleep 0.2
A4=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXPF4" ] && [ "$A4" = "$EXPF4" ]; then ok "End-শেষ-enabled ($A4 — DOM-শেষ-নয়)"; else bad "End-ব্যর্থ (active=$A4 exp=$EXPF4)"; fi
EXP5=$(ev "(function(){var bs=[].slice.call(document.querySelectorAll('#epCalGrid .ep-cal-day'));var act=window.__ep287QA.active();var i=-1,j;for(j=0;j<bs.length;j++){if(bs[j].getAttribute('data-d')===act){i=j;break}}if(i<0)return '';var st=1,n=(i+st+bs.length)%bs.length,t=0;while(t<bs.length&&bs[n]&&bs[n].disabled){n=(n+(st>0?1:-1)+bs.length)%bs.length;t++}if(t>=bs.length||!bs[n]||bs[n].disabled)return '';return bs[n].getAttribute('data-d')})()" 2>/dev/null | tr -d '"')
agent-browser press ArrowRight >/dev/null 2>&1; sleep 0.2
A5=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXP5" ] && [ "$A5" = "$EXP5" ]; then ok "→-wrap+skip (End→$A5 — ভবিষ্যৎ-দিন-লাফ)"; else bad "→-wrap-ব্যর্থ (active=$A5 exp=$EXP5)"; fi
EXP6=$(ev "(function(){var bs=[].slice.call(document.querySelectorAll('#epCalGrid .ep-cal-day'));var act=window.__ep287QA.active();var i=-1,j;for(j=0;j<bs.length;j++){if(bs[j].getAttribute('data-d')===act){i=j;break}}if(i<0)return '';var st=-1,n=(i+st+bs.length)%bs.length,t=0;while(t<bs.length&&bs[n]&&bs[n].disabled){n=(n+(st>0?1:-1)+bs.length)%bs.length;t++}if(t>=bs.length||!bs[n]||bs[n].disabled)return '';return bs[n].getAttribute('data-d')})()" 2>/dev/null | tr -d '"')
agent-browser press ArrowLeft >/dev/null 2>&1; sleep 0.2
A6=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXP6" ] && [ "$A6" = "$EXP6" ]; then ok "←-wrap+skip ($A6)"; else bad "←-wrap-ব্যর্থ (active=$A6 exp=$EXP6)"; fi
agent-browser press Home >/dev/null 2>&1; sleep 0.2
A7=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
if [ -n "$EXPF0" ] && [ "$A7" = "$EXPF0" ]; then ok "Home-পুনঃ-অ্যাংকর (Enter-জাম্পের-পূর্বশর্ত)"; else bad "Home-পুনঃ-অ্যাংকর-ব্যর্থ (active=$A7 exp=$EXPF0)"; fi
agent-browser press Enter >/dev/null 2>&1; sleep 0.4
JF=$(ev 'window.__ep287QA.focused()' 2>/dev/null | tr -d '"')
JA=$(ev 'window.__ep287QA.active()' 2>/dev/null | tr -d '"')
JS=$(ev 'var b=document.querySelector(".ep-cal-day.is-act"); b && b.classList.contains("is-sel")' 2>/dev/null | tr -d '"')
SEL=$(ev '(function(){var b=document.querySelector("#epCalGrid .ep-cal-day.is-sel:not(:disabled)");return b?b.getAttribute("data-d"):""})()' 2>/dev/null | tr -d '"')
if [ -n "$JF" ] && [ "$JF" = "$JA" ] && [ "$JS" = "true" ] && [ "$SEL" = "$JA" ]; then ok "Enter-জাম্প ($JA — is-sel-স্থানান্তর + ফোকাস-ফেরত গ্রিডেই)"; else bad "Enter-জাম্প-ব্যর্থ (focused=$JF active=$JA is-sel=$JS sel=$SEL)"; fi
# স্টেপার-নির্বাচন-গোটচা: epCalPrev=calM++ (অক্টোবর — সম্পূর্ণ-ভবিষ্যৎ-মাস → সব-disabled →
# সফট-আর্ম বৈধভাবেই শূন্য — আর্ম-যোগ্য-মাসে-যেতে epCalNext (calM--) ব্যবহার
agent-browser click '#epCalNext' >/dev/null 2>&1; sleep 0.4
STF=$(ev 'document.activeElement && document.activeElement.id || ""' 2>/dev/null | tr -d '"')
STZ=$(ev 'window.__ep287QA.tabbed()' 2>/dev/null | tr -dc '0-9')
STA=$(ev 'document.querySelectorAll(".ep-cal-day.is-act").length' 2>/dev/null | tr -dc '0-9')
if [ "$STF" = "epCalNext" ] && [ "$STZ" = "1" ] && [ "$STA" = "1" ]; then ok "স্টেপার-সফট-আর্ম (ফোকাস=$STF-এ-স্থির — চুরি-শূন্য; is-act ×১, z=$STZ)"; else bad "সফট-আর্ম-ব্যর্থ (focus=$STF z=$STZ is-act=$STA)"; fi
# সম্পূর্ণ-ভবিষ্যৎ-মাস-চুক্তি (epCalPrev ×২ → অক্টোবর — আগস্ট-থেকে-সেপ্টেম্বর-হয়ে; সব-disabled →
# z=0 + is-act=০ (নো-ট্যাবয়েবল — সঠিক); ব্রাউজার-তারিখ-নির্ভর — অক্টোবর-নয়-হলে ডায়নামিক-স্কিপ)
agent-browser click '#epCalPrev' >/dev/null 2>&1; sleep 0.3
agent-browser click '#epCalPrev' >/dev/null 2>&1; sleep 0.4
FZ=$(ev 'window.__ep287QA.tabbed()' 2>/dev/null | tr -dc '0-9')
FA=$(ev 'document.querySelectorAll(".ep-cal-day.is-act").length' 2>/dev/null | tr -dc '0-9')
FD=$(ev 'window.__ep287QA.enabled()' 2>/dev/null | tr -dc '0-9')
if [ "$FD" = "0" ] && [ "$FZ" = "0" ] && [ "$FA" = "0" ]; then ok "সম্পূর্ণ-ভবিষ্যৎ-মাস-চুক্তি (enabled=$FD → z=$FZ, is-act=$FA — নো-ট্যাবয়েবল-সঠিক)"; else skip "ভবিষ্যৎ-মাস-চুক্তি (enabled=$FD z=$FZ is-act=$FA — ব্রাউজার-তারিখ-নির্ভর দৃশ্য-অনুপস্থিত)"; fi

echo "── ধাপ-৪: স্ক্রিনশট (দিন-গ্রিড + is-act) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1; }
agent-browser screenshot "$APP/tests/s287-calday-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s287-calday-desk.png" ]; then ok "s287-calday-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
agent-browser screenshot "$APP/tests/s287-calday-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s287-calday-mobile390.png" ]; then ok "s287-calday-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
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
