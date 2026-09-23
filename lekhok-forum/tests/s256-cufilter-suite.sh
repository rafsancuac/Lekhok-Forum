#!/bin/bash
# s256-cufilter-suite.sh — session256 লেখা-কিউরেশন (/moderator/curation) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (cu256 স্ট্রিপ + data-cu-row/data-kw সারি + শূন্য-অবস্থা + GET-সার্চ/kindchips/quick-অ্যাকশন/তালিকা অক্ষুণ্ণ)
#          ② স্টাইল (cu256-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড)
#          ③ আচরণ (__cuQA হুক; প্রথম-সারি-কীওয়ার্ড→মিল; @ইউজারনেম-প্রোব; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার; 'f'-কী ফোকাস (body-বাবল); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① প্রায়-অ-ধ্বংসাত্মক — pkill/মডারেশন-অ্যাকশন নেই; সিড-শূন্য (curation-তালিকা QA-DB-তে পূর্ব-বিদ্যমান; শূন্য-হলে আচরণ-গ্রেস-স্কিপ — s255-চুক্তি)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — ensureModerator-সারফেস s254-ভিউয়ার-চুক্তি-সামঞ্জস্য)
#         ④ কাউন্ট = data-cu-row="[0-9]*" (রেন্ডারড-সারি-শুধু — CSS/JS-ফ্যান্টম-মুক্ত: CSS-গার্ড `]`-এ-শেষ, JS `']'`-কোট, সংখ্যা-গুণক শুধু-রেন্ডারে)
#         ⑤ ব্রাউজার-সেশন-প্রি-ক্লিয়ার (stale-প্যানেল-সেশন অটো-রিডাইরেক্ট-গোটচা — session253-প্রমাণিত)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
J=/tmp/s256-cu-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s256-cu-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/curation")
if [ "$PC" = "200" ]; then ok "লেখা-কিউরেশন পৃষ্ঠা 200"; else bad "লেখা-কিউরেশন পৃষ্ঠা HTTP $PC"; fi
HTML=$(cat /tmp/s256-cu-page.html)
ROWS=$(echo "$HTML" | grep -o 'data-cu-row="[0-9]*"' | wc -l)
KW=$(echo "$HTML" | grep -o 'data-kw="' | wc -l)

echo "── ধাপ-১: কাঠামো (cu256 স্ট্রিপ — GET-সার্চ/kindchips/quick/তালিকা অক্ষুণ্ণ) ──"
contains "cu256-ইনপুট রেন্ডার" "$HTML" 'id="cuFilter256"'
contains "cu256-কাউন্ট চিপ রেন্ডার" "$HTML" 'id="cuCount256"'
contains "kbd-পিল affordance রেন্ডার" "$HTML" 'cu-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-cu-empty)" "$HTML" 'data-cu-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$HTML" '<div class="cu-zero" id="cuZero256" data-cu-empty hidden>'
contains "GET-সার্চ অক্ষুণ্ণ (no-regression)" "$HTML" 'action="/moderator/curation"'
contains "kindchips অক্ষুণ্ণ (no-regression)" "$HTML" 'kind=writing'
contains "quick-নির্বাচন অক্ষুণ্ণ (no-regression)" "$HTML" 'id="curQuickLatest"'
contains "quick-খালি অক্ষুণ্ণ (no-regression)" "$HTML" 'id="curQuickClear"'
contains "তালিকা-ধারক অক্ষুণ্ণ (no-regression)" "$HTML" 'id="curList"'
contains "__cuQA হুক উপস্থিত" "$HTML" '__cuQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$HTML" "ev.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$ROWS" = "$KW" ]; then ok "সারি == data-kw ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
CUCSS=$(echo "$HTML" | sed -n '/session256 — লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার/,/<\/style>/p')
HEXN=$(echo "$CUCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "cu256-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "cu256-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$CUCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$CUCSS" '.cu-kbd-hint kbd'
contains "reduced-motion জোড়া" "$CUCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$CUCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$CUCSS" '.cu-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (cur-item)" "$CUCSS" '.cur-item[data-cu-row][hidden] { display: none !important; }'
containsF "শূন্য-অবস্থা display-নিয়ন্ত্রণ" "$CUCSS" '.cu-zero[hidden] { display: none; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/curation" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/curation'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/curation" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/curation খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/curation'
if [ "$ROWS" -ge 1 ]; then
  contains "__cuQA সংজ্ঞায়িত" "$(ev 'typeof window.__cuQA')" 'object'
  T=$(ev 'window.__cuQA.total()' | tr -d '"')
  C=$(ev 'window.__cuQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  PROBE=$(ev 'document.querySelector("[data-cu-row]").getAttribute("data-kw").trim().slice(0,4)' | tr -d '"')
  if [ -n "$PROBE" ]; then
    agent-browser fill '#cuFilter256' "$PROBE" >/dev/null 2>&1; sleep 0.4
    C2=$(ev 'window.__cuQA.count()' | tr -d '"')
    if [ -n "$C2" ] && [ "$C2" -ge 1 ] && [ "$C2" -le "$T" ]; then ok "প্রথম-সারি-কীওয়ার্ড '$PROBE' → মিল ($C2/$T)"; else bad "প্রোব-ফিল্টার ব্যর্থ (probe=$PROBE got=$C2 total=$T)"; fi
  else bad "প্রোব-কীওয়ার্ড-এক্সট্র্যাকশন ব্যর্থ"; fi
  UPB=$(ev 'var m=document.querySelector("[data-cu-row]").getAttribute("data-kw").match(/@[^\s]+/); m?m[0].slice(1):""' | tr -d '"')
  if [ -n "$UPB" ]; then
    ev 'window.__cuQA.clear()' >/dev/null 2>&1; sleep 0.2
    agent-browser fill '#cuFilter256' "$UPB" >/dev/null 2>&1; sleep 0.4
    C5=$(ev 'window.__cuQA.count()' | tr -d '"')
    if [ -n "$C5" ] && [ "$C5" -ge 1 ] && [ "$C5" -le "$T" ]; then ok "@ইউজারনেম-প্রোব '$UPB' → মিল ($C5/$T)"; else bad "@ইউজারনেম-প্রোব ব্যর্থ (got=$C5)"; fi
  else skip "@ইউজারনেম-প্রোব (প্রথম-সারি-kw-এ-@টোকেন-শূন্য)"; fi
  agent-browser fill '#cuFilter256' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__cuQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-cu-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__cuQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__cuQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__cuQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("cuCount256")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD — [hidden]-গার্ড-মিস)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "cuFilter256" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("cuFilter256").value="probe256";document.getElementById("cuFilter256").dispatchEvent(new Event("input"));document.getElementById("cuFilter256").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("cuFilter256").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "cuFilter256" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৭ (সারি-শূন্য — ডেটা-শূন্য-পরিবেশ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s256-cufilter-desk.png" >/dev/null 2>&1 && ok "s256-cufilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s256-cufilter-mobile390.png" >/dev/null 2>&1 && ok "s256-cufilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
