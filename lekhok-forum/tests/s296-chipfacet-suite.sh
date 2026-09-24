#!/bin/bash
# s296-chipfacet-suite.sh — session296 ডেইলি (/admin/daily) স্ট্যাটিক-চিপ → ক্লিকেবল-ফ্যাসেট dcf296 সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (চিপবার dcfChipbar296 + data-dcf-chip296/data-dcf-type296 + role=button/tabindex/aria-pressed
#          + no-regression: dcf293-স্ট্রিপ ×৬ + bulk-bar + sidebar + chip chip-accent + idden]-গার্ড ×২)
#          ② স্টাইল (session296-ব্লক হেক্স-শূন্য টোকেন-শুধু; amber-পরিবার; aria-pressed-সক্রিয়-অবস্থা;
#          focus-visible-রিং; reduced-motion; 640px-সংকোচন) + EJS-compile
#          ③ আচরণ (__dcf296QA হুক — চিপ-শূন্যে-ও-সংজ্ঞায়িত; চিপ-ক্লিক → dcfType293-সেট + change-চেইন
#          একক-ফানেল; aria-pressed-স্টেট-মেশিন দুই-দিক (চিপ→select + select→চিপ); clear-পথ-সিঙ্ক
#          (dcfApply293-হুক-প্রমাণ); Enter/Space-কীবোর্ড; ফোকাস-চুরি-শূন্য (দৃশ্যমান-কন্ট্রোল-প্রোব —
#          session295-গোটচা); AND-কম্বো dcf293-অক্ষুণ্ণ)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# session297-রক্ষণাবেক্ষণ: ধাপ-৩-এর লগইন-open → open-রিট্রাই+url-যাচাই (fresh-daemon-first-open-wedge —
#          wedge-প্রোটোকল-যুগে daemon-পুনঃসূচনা নিয়মিত) + লগইন-status-assert-এ opaqueredirect-0-গ্রহণ
#          (fetch-স্পেক: redirect:manual → status-0 — warm-daemon-ALR-শাখার-পূর্ব-নির্ভরতা-বিলোপ)।
# চুক্তি: ① সিড = DB-সরাসরি (s293-seeddaily পুনঃব্যবহার — POST-নিষিদ্ধ: published=1-এ broadcastToAll,
#         s274/s277-চুক্তি; কিল→সিড→বুট ক্রম) ② ভিউয়ার = admin/admin123 (s277-প্রমাণিত) ③ প্রত্যাশা-গণনা =
#         রেন্ডার্ড-HTML থেকে (চিপ-ইউনিক-জোড় 'data-dcf-chip296 data-dcf-type296=' — CSS/JS-লিটারাল-নিরাপদ;
#         সারি-ইউনিক 'data-dcf-row data-kw=') ④ অ্যাঙ্করড-চেক '/admin/daily/?$' ⑤ সুইট-POST-শূন্য
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
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
. "$APP/tests/lib-qa-browser.sh"
J=/tmp/s296-chip-jar.txt
PAGE=/tmp/s296-chip-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/daily"; }

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (daily/list.ejs) ──"
V=$(cat "$APP/admin/views/admin/daily/list.ejs")
containsF "চিপবার-কন্টেইনার (id=dcfChipbar296 + role=group)" "$V" 'id="dcfChipbar296" role="group" aria-label="ধরন অনুযায়ী দ্রুত-ফিল্টার"'
containsF "সব-চিপ (ক্লিকেবল + aria-pressed=true-SSR)" "$V" '<span class="chip chip-accent" data-dcf-chip296 data-dcf-type296="" role="button" tabindex="0" aria-pressed="true">'
containsF "ধরন-চিপ (ক্লিকেবল + aria-pressed=false-SSR)" "$V" '<span class="chip" data-dcf-chip296 data-dcf-type296="<%= t %>" role="button" tabindex="0" aria-pressed="false">'
containsF "সিঙ্ক-হুক (dcfApply293-ভিতরে — একক-ফানেল)" "$V" 'if (window.__dcfChipSync296) { window.__dcfChipSync296(); }'
containsF "চিপ-ওয়্যারিং (querySelectAll)" "$V" "document.querySelectorAll('[data-dcf-chip296]')"
containsF "একক-ফানেল-ফায়ার (dcfType293-সেট + change-dispatch)" "$V" "typeSel.dispatchEvent(new Event('change'));"
containsF "Enter/Space-কীবোর্ড-সক্রিয়করণ" "$V" "if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); dcfChipFire296(c); }"
containsF "aria-pressed-স্টেট-মেশিন" "$V" "c.setAttribute('aria-pressed',"
containsF "QA-হুক __dcf296QA (চিপ-শূন্যে-ও-সংজ্ঞায়িত)" "$V" 'window.__dcf296QA = {'
containsF "wired-গার্ড-হুক-এক্সপোর্ট" "$V" 'window.__dcfChipSync296 = dcfChipSync296;'
B296=$(echo "$V" | grep -nF 'session296 — dcf296 চিপ-facet স্টাইল' | head -1 | cut -d: -f1)
if [ -n "$B296" ]; then
  ok "session296-স্টাইল-ব্লক উপস্থিত (লাইন-$B296)"
  BEND=$(echo "$V" | grep -nF '</style>' | head -1 | cut -d: -f1)
  BLK=$(echo "$V" | sed -n "${B296},${BEND}p")
  HEXN=$(echo "$BLK" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "স্টাইল-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "স্টাইল-ব্লকে হেক্স $HEXN"; fi
  containsF "amber-টোকেন-পরিবার" "$BLK" 'var(--lf-amber-deep)'
  containsF "সক্রিয়-চিপ-অবস্থা (aria-pressed=true)" "$BLK" '[data-dcf-chip296][aria-pressed="true"]'
  containsF "focus-visible-রিং" "$BLK" '[data-dcf-chip296]:focus-visible'
  containsF "color-mix-হোভার-বর্ডার" "$BLK" 'color-mix(in srgb, var(--lf-amber-deep) 40%, transparent)'
  containsF "reduced-motion-গার্ড" "$BLK" 'prefers-reduced-motion'
  containsF "640px-সংকোচন" "$BLK" 'max-width: 640px'
else
  bad "session296-স্টাইল-ব্লক অনুপস্থিত"
fi
# no-regression (dcf293-পরিবার + কাঠামো)
containsF "no-reg: dcf293-স্ট্রিপ" "$V" '<div class="dcf-instant" id="dcfStrip293">'
containsF "no-reg: ধরন-সিলেক্ট" "$V" 'id="dcfType293"'
containsF "no-reg: স্ট্যাটাস-সিলেক্ট" "$V" 'id="dcfPub293"'
containsF "no-reg: সারি-বৈশিষ্ট্য-চতুষ্টয়" "$V" 'data-dcf-row data-kw='
containsF "no-reg: __dcf293QA-হুক" "$V" 'window.__dcf293QA'
containsF "no-reg: 'f'-ফোকাস-ফিল্ড-গার্ড" "$V" "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)"
containsF "no-reg: Escape-পরিষ্কার" "$V" "if (ev.key === 'Escape') { ev.stopPropagation(); dcfClear293(); }"
containsF "no-reg: bulk-bar" "$V" '/admin/daily/bulk-delete'
containsF "no-reg: chip chip-accent (s293-অ্যাঙ্কর)" "$V" 'chip chip-accent'
containsF "no-reg: সারি-hidden-গার্ড" "$V" 'tr[data-dcf-row][hidden] { display: none !important; }'
# EJS-compile (অ্যাপের-নিজ-ejs)
EC=$(cd "$APP" && node -e "try{require('ejs').compile(require('fs').readFileSync('admin/views/admin/daily/list.ejs','utf8'));console.log('C-OK')}catch(e){console.log('C-ERR '+e.message)}" 2>/dev/null)
if echo "$EC" | grep -qF 'C-OK'; then ok "EJS-compile সবুজ"; else bad "EJS-compile ($EC)"; fi

echo "── ধাপ-২: মার্কার-সিড → লগইন → SSR (কিল→সিড→বুট ক্রম) ──"
kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
SR=$(node "$APP/scripts/s293-seeddaily.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -q "SEED-OK count=3"; then ok "মার্কার-সিড ×৩ ($SR)"; else bad "সিড-ব্যর্থ ($SR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন (admin — s277-প্রমাণিত)"; else bad "লগইন-HTTP $LC"; fi
PC=$(fetch_page)
if [ "$PC" = "200" ] && grep -qF 'ডেইলি কনটেন্ট' "$PAGE" && grep -qF 'dcfChipbar296' "$PAGE"; then ok "/admin/daily 200 (চিপবার-উপস্থিত)"; else bad "/admin/daily HTTP $PC"; fi
if grep -qF '/admin/login' "$PAGE" && ! grep -qF 'dcfChipbar296' "$PAGE"; then bad "লগইন-পেজে-আটকে"; else ok "অ্যাঙ্করড-চেক: সত্যিক-তালিকা-পেজ"; fi
# প্রত্যাশা-গণনা (রেন্ডার্ড-HTML থেকে — অন্য-সারি-উপস্থিতিতেও নির্ধারক)
TOTAL=$(grep -o 'data-dcf-row data-kw=' "$PAGE" | wc -l)
QZ=$(grep -o 'data-dcf-type="quiz"' "$PAGE" | wc -l)
CHIPN=$(grep -o 'data-dcf-chip296 data-dcf-type296=' "$PAGE" | wc -l)
QZD=$(grep -F 'data-dcf-type="quiz"' "$PAGE" | grep -cF 'data-dcf-pub="0"')
if [ "$TOTAL" -ge 3 ] 2>/dev/null; then ok "সারি-মোট=$TOTAL (≥৩)"; else bad "সারি-মোট=$TOTAL"; fi
if [ "$QZ" -ge 1 ] 2>/dev/null; then ok "quiz-সারি=$QZ (quiz-চিপ-লাইভ-নিশ্চিত)"; else bad "quiz-সারি=$QZ"; fi
if [ "$CHIPN" -ge 2 ] 2>/dev/null; then ok "চিপ-মোট=$CHIPN (সব + প্রতি-উপস্থিত-ধরন)"; else bad "চিপ-মোট=$CHIPN"; fi
echo "  (quiz+খসড়া-সারি=$QZD — AND-অ্যাসার্ট-শাখা-নির্ধারক)"

echo "── ধাপ-৩: E2E (agent-browser — ইউনিক-কোয়েরি-open) ──"
Q1="qa296a=$(date +%s)$RANDOM"
# session297-প্রয়োগ: open-রিট্রাই + url-যাচাই (নীরব-ব্যর্থ-open → about:blank; fresh-daemon-first-open-wedge —
# wedge-প্রোটোকল-যুগে daemon-পুনঃসূচনা নিয়মিত → প্রথম-open ধীর/আটকে-যেতে-পারে — s296-epkwide-রীতি)
OPENOK=""
for k in 1 2 3 4; do
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1
  sleep 1
  UU=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$UU" | grep -q "admin"; then OPENOK=1; break; fi
  sleep 1
done
if [ -n "$OPENOK" ]; then ok "open (url-যাচাই — admin/*)"; else bad "open-ব্যর্থ (url=$UU)"; fi
LR=$(ev '(function(){var c=document.querySelector("input[name=_csrf]");if(!c)return "ALR";return fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(c.value)}).then(function(r){return String(r.status)})})()' 2>/dev/null | tr -d '"')
# session297: status "0" = opaqueredirect (fetch-স্পেক — redirect:manual → status-0, Chrome-প্রমাণিত) —
# রিডাইরেক্ট-ঘটেছে-ই; 30[23] = পুরনো-চেইন। ALR = পূর্ব-লগইনড-সেশন (warm-daemon-যুগের-পথ)।
if echo "$LR" | grep -qE '^30[23]$'; then ok "ব্রাউজার-লগইন ($LR)"; else
  if echo "$LR" | grep -qE '^0$'; then ok "ব্রাউজার-লগইন (opaqueredirect-0 — রিডাইরেক্ট-প্রমাণিত)"; else
    if echo "$LR" | grep -qF 'ALR'; then ok "ব্রাউজার-সেশন পূর্ব-লগইনড (ALR)"; else bad "ব্রাউজার-লগইন ($LR)"; fi
  fi
fi
# session297: কুকি-সেটলমেন্ট-পোল — fetch-লগইনের Set-Cookie-প্রক্রিয়াকরণ opaqueredirect-ফিল্টারের-পরেও
# এক-টিক-নিতে-পারে → সঙ্গে-সঙ্গে-open-করলে রেসে অ-লগইনড-বাউন্স (/admin)। authed-probe (authed=200,
# unauth-রিডাইরেক্ট=opaqueredirect-0) 200-না-হওয়া-পর্যন্ত — নির্ধারক-সেটল।
poll '(function(){return fetch("/admin/daily",{redirect:"manual"}).then(function(r){return r.status===200?"AUTHED":"WAIT"})})()' 'AUTHED' 20 && ok "লগইন-কুকি-সেটল (authed-probe-200)" || bad "লগইন-কুকি-সেটল"
OPEN2=""
for k in 1 2 3; do
  agent-browser open "$BASE/admin/daily/?$Q1" >/dev/null 2>&1
  sleep 1
  UU2=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$UU2" | grep -qF "admin/daily"; then OPEN2=1; break; fi
  sleep 1
done
if [ -n "$OPEN2" ]; then ok "open ($Q1 — অ্যাঙ্করড-টার্গেট, url-যাচাই)"; else bad "open-ব্যর্থ (url=$UU2)"; fi
if poll 'window.__dcf296QA ? ("N" + window.__dcf296QA.chips() + "P" + window.__dcf296QA.pressed() + "T" + window.__dcf296QA.pressedType()) : "NOHOOK"' "N${CHIPN}P1T"; then ok "বুট: হুক-জীবিত (chips=$CHIPN pressed=১ pressedType=''-সব)"; else bad "বুট-হুক"; fi
# চিপ-ক্লিক (quiz) → একক-ফানেল: select-সেট + change-চেইন + aria-pressed-স্থানান্তর
# গোটচা: বাস-সিঙ্গেল-কোটের-ভিতরে JS-স্ট্রিং-নেস্টেড-কোট নিষিদ্ধ → CSS-অ্যাট্রি-সিলেক্টর আনকোটেড (quiz/activity/this_day = বৈধ-আইডেন্টিফায়ার); সব-চিপ = প্রথম [data-dcf-chip296]
E1=$(ev '(function(){var q=document.querySelector("[data-dcf-type296=quiz]");if(!q)return "NOQ";q.click();var qa=window.__dcf296QA;return "TY"+qa.type()+"C"+window.__dcf293QA.count()+"P"+qa.pressed()+"PT"+qa.pressedType()})()' 2>/dev/null | tr -d '"\\')
if echo "$E1" | grep -qF "TYquizC${QZ}P1PTquiz"; then ok "quiz-চিপ-ক্লিক → type=quiz + count=$QZ + pressed-স্থানান্তর"; else bad "quiz-চিপ ($E1)"; fi
E1B=$(ev '(function(){var s=document.getElementById("dcfCount293");var sb=document.querySelector("[data-dcf-chip296]");return "CH"+(!s.hidden?"1":"0")+"S"+(sb.getAttribute("aria-pressed"))})()' 2>/dev/null | tr -d '"\\')
if echo "$E1B" | grep -qF 'CH1Sfalse'; then ok "কাউন্ট-চিপ-দৃশ্যমান + সব-চিপ-unpressed"; else bad "কাউন্ট-চিপ/সব-অবস্থা ($E1B)"; fi
# ফোকাস-চুরি-শূন্য (দৃশ্যমান-কন্ট্রোল-প্রোব — session295-গোটচা)
E2=$(ev '(function(){var i=document.getElementById("dcfFilter293");i.focus();var q=document.querySelector("[data-dcf-type296=this_day]");if(!q)return "NOTD";q.click();var a=document.activeElement;return "F"+(a&&a.id?a.id:"-")+"TY"+window.__dcf296QA.type()})()' 2>/dev/null | tr -d '"\\')
if echo "$E2" | grep -qF 'FdcfFilter293'; then ok "ফোকাস-চুরি-শূন্য (ইনপুট-অটুট + চিপ-ফায়ার)"; else bad "ফোকাস-প্রোব ($E2)"; fi
# Enter/Space-কীবোর্ড (synthetic — স্ব-ডকুমেন্ট-লিসনার)
E3=$(ev '(function(){var q=document.querySelector("[data-dcf-type296=quiz]");q.focus();q.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));var a1=window.__dcf296QA.pressedType();q.dispatchEvent(new KeyboardEvent("keydown",{key:" ",bubbles:true}));return "E"+a1+"S"+window.__dcf296QA.pressedType()})()' 2>/dev/null | tr -d '"\\')
if echo "$E3" | grep -qF 'EquizSquiz'; then ok "Enter+Space-কীবোর্ড → চিপ-ফায়ার (pressedType=quiz)"; else bad "কীবোর্ড ($E3)"; fi
# বিপরীত-সিঙ্ক (select→চিপ)
E4=$(ev '(function(){var s=document.getElementById("dcfType293");s.value="activity";s.dispatchEvent(new Event("change"));return "PT"+window.__dcf296QA.pressedType()})()' 2>/dev/null | tr -d '"\\')
if echo "$E4" | grep -qF 'PTactivity'; then ok "বিপরীত-সিঙ্ক: select-change → চিপ-pressed=activity"; else bad "বিপরীত-সিঙ্ক ($E4)"; fi
# clear-পথ-সিঙ্ক (dcfApply293-হুক-প্রমাণ — সব-চিপ-ফিরে-আসে)
E5=$(ev '(function(){document.getElementById("dcfClear293").click();var qa=window.__dcf296QA;return "TY"+qa.type()+"P"+qa.pressed()+"C"+window.__dcf293QA.count()})()' 2>/dev/null | tr -d '"\\')
if echo "$E5" | grep -qF "TYP1C${TOTAL}"; then ok "clear → সব-চিপ-পুনঃ-pressed + পুনরুদ্ধার ($TOTAL)"; else bad "clear-সিঙ্ক ($E5)"; fi
# সব-চিপ-ক্লিক (রিসেট-ফ্যাসেট)
E6=$(ev '(function(){window.__dcf296QA.clickAt(0);var qa=window.__dcf296QA;return "TY"+qa.type()+"C"+window.__dcf293QA.count()+"P"+qa.pressed()})()' 2>/dev/null | tr -d '"\\')
if echo "$E6" | grep -qF "TYC${TOTAL}P1"; then ok "সব-চিপ-ক্লিক → রিসেট ($TOTAL) + একক-pressed"; else bad "সব-চিপ ($E6)"; fi
# AND-কম্বো (quiz-চিপ + কীওয়ার্ড — dcf293-অক্ষুণ্ণ)
QZM=$(grep -F 'data-dcf-type="quiz"' "$PAGE" | grep -cF 'qa293-')
if [ "$QZM" -ge 1 ] 2>/dev/null; then ok "marker-quiz-সারি=$QZM (কীওয়ার্ড-AND-নির্ধারক)"; else bad "marker-quiz=$QZM"; fi
E7=$(ev '(function(){var q=document.querySelector("[data-dcf-type296=quiz]");q.click();var i=document.getElementById("dcfFilter293");i.value="qa293";i.dispatchEvent(new Event("input"));var c=window.__dcf293QA.count();document.getElementById("dcfFilter293").value="zzz-no-match";document.getElementById("dcfFilter293").dispatchEvent(new Event("input"));var z=document.getElementById("dcfZero293");return "Q"+c+"Z"+(!z.hidden?"1":"0")+"TY"+window.__dcf296QA.type()})()' 2>/dev/null | tr -d '"\\')
if echo "$E7" | grep -qF "Q${QZM}Z1TYquiz"; then ok "AND-কম্বো: quiz-চিপ+মার্কার-কীওয়ার্ড=$QZM + no-match→শূন্য-অবস্থা (type=quiz-অটুট)"; else bad "AND-কম্বো ($E7)"; fi
if [ "$QZD" = "0" ]; then
  E8=$(ev '(function(){document.getElementById("dcfFilter293").value="";document.getElementById("dcfFilter293").dispatchEvent(new Event("input"));var s=document.getElementById("dcfPub293");s.value="0";s.dispatchEvent(new Event("change"));var c=window.__dcf293QA.count();var z=document.getElementById("dcfZero293");return "A"+c+"Z"+(!z.hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
  if echo "$E8" | grep -qF 'A0Z1'; then ok "quiz+খসড়া (AND) → count=০ + শূন্য-অবস্থা (seed-চুক্তি)"; else bad "quiz+খসড়া ($E8)"; fi
else
  skip "quiz+খসড়া-শূন্য-অবস্থা (DB-পূর্ব-quiz+খসড়া=$QZD — শাখা-নির্ধারক রেন্ডার্ড-HTML)"
fi
# Escape-পথ-সিঙ্ক (ইনপুট-ফোকাসে Escape → সব-চিপ-ফিরে)
E9=$(ev '(function(){var i=document.getElementById("dcfFilter293");i.focus();var ek=new KeyboardEvent("keydown",{key:"Escape",bubbles:true});i.dispatchEvent(ek);var qa=window.__dcf296QA;return "TY"+qa.type()+"P"+qa.pressed()+"C"+window.__dcf293QA.count()})()' 2>/dev/null | tr -d '"\\')
if echo "$E9" | grep -qF "TYP1C${TOTAL}"; then ok "Escape → পরিষ্কার + সব-চিপ-সিঙ্ক ($TOTAL)"; else bad "Escape-সিঙ্ক ($E9)"; fi
# ফ্রেশ-লোড → হুক-পুনঃপ্রতিষ্ঠা
Q2="qa296b=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/daily/?$Q2" >/dev/null 2>&1
if poll 'window.__dcf296QA ? ("N" + window.__dcf296QA.chips()) : "NOHOOK"' "N${CHIPN}"; then ok "ফ্রেশ-লোড হুক-পুনঃপ্রতিষ্ঠা (chips=$CHIPN)"; else bad "ফ্রেশ-লোড"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' 2>/dev/null | tr -d '"\\')
if echo "$HS" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য"; else bad "390px-hScroll ($HS)"; fi
if agent-browser screenshot "$ROOT/download/s296-chipfacet-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s296-chipfacet-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
CR=$(node "$APP/scripts/s293-seeddaily.js" clean 2>/dev/null | tail -1)
if echo "$CR" | grep -q "CLEAN-OK deleted=3"; then ok "মার্কার-ক্লিন ($CR)"; else bad "ক্লিন ($CR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "চূড়ান্ত-বুট"

echo "══════════════════════════════"
echo "s296-chipfacet: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
