#!/bin/bash
# s253-mrfilter-suite.sh — session253 রিপোর্ট-কিউ (/moderator/reports) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (mr253 স্ট্রিপ + data-kw কার্ড + শূন্য-অবস্থা + ট্যাব-GET-অক্ষুণ্ণ + বাল্ক-বার-অক্ষুণ্ণ)
#          ② স্টাইল (mr253-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-fade; reduced-motion-জোড়া; 640px-সংকোচন; hidden-গার্ড)
#          ③ আচরণ (__mrQA হুক; প্রথম-কার্ড-কীওয়ার্ড→মিল; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার; 'f'-কী ফোকাস — body-বাবল synthetic; Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① প্রায়-অ-ধ্বংসাত্মক — pkill/POST-মডারেশন-অ্যাকশন নেই; একমাত্র seed = রিপোর্ট-শূন্য-হলে **একটি** ডেমো-রিপোর্ট
#           প্রোডাকশন-প্রবাহে (POST /report — lib-seed-users-সিমান্তিক, ডুপ্লিকেট-গার্ড 409-এ idempotent, লেগ্যাসি-ডেমো-সিমান্তিক-স্থায়ী)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server ③ keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি)
#         ④ কাউন্ট-অ্যাসার্ট ডায়নামিক (নাম/ID-হার্ডকোড-নিষিদ্ধ — সিড-স্বাধীন; প্রথম-কার্ড data-kw-সাবস্ট্রিং থেকে প্রোব)
#         ⑤ ব্রাউজার-সেশন-প্রি-ক্লিয়ার (stale admin-প্যানেল-সেশন /admin/login-অটো-রিডাইরেক্ট-গোটচা — session253-প্রমাণিত)
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
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ (Chrome-মৃত্যু-শ্রেণি)

echo "── ধাপ-০: পরিবেশ (প্রোব → মডারেটর-লগইন → ডেমো-রিপোর্ট-সিড) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
# ① মডারেটর-ইউজার-সেশন (রিপোর্ট-কিউ দেখতে)
J=/tmp/s253-mr-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=moderator" --data-urlencode "password=moderator123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "মডারেটর-লগইন ($LC)"; else bad "মডারেটর-লগইন-ব্যর্থ (HTTP $LC)"; fi
# ② ডেমো-রিপোর্ট সিড (প্রোডাকশন-প্রবাহ; idempotent — 409=আগেই-আছে)
. "$APP/tests/lib-seed-users.sh"
SJ=/tmp/s253-seed-jar.txt
SU=$(ensureUser "$SJ" testuser demo123 "টেস্ট ইউজার")
if echo "$SU" | grep -q "ok"; then ok "seed-ইউজার প্রস্তুত ($SU)"; else bad "seed-ইউজার-ব্যর্থ ($SU)"; fi
RCOUNT=$(curl -s -b "$J" "$BASE/moderator/reports?tab=open" | grep -c 'mrq81-card st-' || true)
if [ "${RCOUNT:-0}" -eq 0 ]; then
  PID=$(curl -s -b "$SJ" "$BASE/dashboard" | grep -oE 'data-post-id="[0-9]+"' | head -5 | grep -oE '[0-9]+' | head -1)
  SEEDED=0
  for CAND in $(curl -s -b "$SJ" "$BASE/dashboard" | grep -oE 'data-post-id="[0-9]+"' | grep -oE '[0-9]+' | head -5); do
    RR=$(curl -s -b "$SJ" -X POST "$BASE/report" -H "Content-Type: application/json" \
      -d "{\"target_type\":\"post\",\"target_id\":$CAND,\"reason\":\"misleading\",\"details\":\"session253 ফিল্টার-সুইট ডেমো-রিপোর্ট (legacy-demo-সিমান্তিক)\"}")
    if echo "$RR" | grep -q '"ok":true'; then SEEDED=1; ok "ডেমো-রিপোর্ট-সিড (post $CAND — প্রোডাকশন-প্রবাহ)"; break; fi
    if echo "$RR" | grep -q 'ইতিমধ্যে'; then SEEDED=1; ok "ডেমো-রিপোর্ট পূর্ব-বিদ্যমান (409-idempotent)"; break; fi
    # 400=নিজের-লেখা → পরের-ক্যান্ডিডেট
  done
  [ "$SEEDED" = "0" ] && skip "ডেমো-রিপোর্ট-সিড-অসম্ভব (ক্যান্ডিডেট-শূন্য/লিমিট) — আচরণ-ধাপ skip-হবে"
else
  ok "রিপোর্ট পূর্ব-বিদ্যমান ($RCOUNT — সিড-প্রয়োজন নেই)"
fi
PC=$(curl -s -o /tmp/s253-mr-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/reports?tab=open")
if [ "$PC" = "200" ]; then ok "রিপোর্ট-কিউ পৃষ্ঠা 200"; else bad "রিপোর্ট-কিউ পৃষ্ঠা HTTP $PC"; fi
HTML=$(cat /tmp/s253-mr-page.html)

echo "── ধাপ-১: কাঠামো (mr253 স্ট্রিপ — ট্যাব-GET-অক্ষুণ্ণ) ──"
contains "mr253-ইনপুট রেন্ডার" "$HTML" 'id="mr253-filter"'
contains "mr253-কাউন্ট চিপ রেন্ডার" "$HTML" 'id="mr253-count"'
contains "kbd-পিল affordance রেন্ডার" "$HTML" 'mr253-kbd'
contains "শূন্য-অবস্থা বক্স (data-mr-empty)" "$HTML" 'data-mr-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$HTML" '<div class="mrq81-empty" data-mr-empty hidden>'
contains "ট্যাব-GET অক্ষুণ্ণ (no-regression)" "$HTML" 'href="/moderator/reports?tab=open"'
contains "বাল্ক-বার অক্ষুণ্ণ (no-regression)" "$HTML" 'mrq85BulkBar'
ROWS=$(echo "$HTML" | grep -c 'mrq81-card st-' || true)
KW=$(echo "$HTML" | grep -o 'data-kw="' | wc -l)
if [ "$ROWS" -gt 0 ] && [ "$ROWS" = "$KW" ]; then ok "কার্ড == data-kw ($ROWS কার্ড)"; else bad "কার্ড/kw-বেমান (row=$ROWS kw=$KW)"; fi
CHIP=$(echo "$HTML" | grep -o 'id="mr253-count"[^>]*>[0-9]*' | grep -o '[0-9]*$')
if [ -n "$CHIP" ] && [ "$CHIP" = "$ROWS" ]; then ok "চিপ-প্রাথমিক মান == কার্ড-সংখ্যা ($CHIP)"; else bad "চিপ-মান বেমান (chip=$CHIP row=$ROWS)"; fi
contains "__mrQA হুক উপস্থিত" "$HTML" '__mrQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$HTML" "e.key !== 'f'"

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MRCSS=$(echo "$HTML" | sed -n '/session253 — রিপোর্ট-কিউ তাৎক্ষণিক-ফিল্টার/,/<\/style>/p')
HEXN=$(echo "$MRCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "mr253-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "mr253-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MRCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd fade (focus-within)" "$MRCSS" '.mr253-field:focus-within .mr253-kbd { opacity: 0; }'
contains "reduced-motion জোড়া" "$MRCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MRCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$MRCSS" '.mr253-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড (অ্যানিমেশন-নিরাপদ filter-hide)" "$MRCSS" '.mrq81-card[data-mr-row][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
# স্টেল-সেশন-প্রি-ক্লিয়ার — /admin/login অটো-রিডাইরেক্ট-গোটচা (session253)
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
# ফর্ম-ক্লিক-লগইন logout-চক্রের-পরে অনির্ভরযোগ্য (নীরব-স্থির — session253-গোটচা);
# URL-ব্রাঞ্চ (eval-মুক্ত): সরাসরি-target-open → পৌঁছলে সেশন-সক্রিয়; না-পৌঁছলে
# লগইন-পৃষ্ঠা → পৃষ্ঠা-csrf fetch-POST (নির্ধারক) → পুনঃ-open
agent-browser open "$BASE/moderator/reports?tab=open" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/reports'; then
  ok "মডারেটর-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  # redirect:"manual" — 303-এ-ই-resolve (কুকি-স্থাপিত); follow-মোডে /moderator-রেন্ডার-চেইন
  # eval-await-টাইমআউট ছাড়িয়ে যায় → খালি-ফেরত (session253-গোটচা)
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=moderator&password=moderator123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/reports?tab=open" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/reports খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/reports'
contains "__mrQA সংজ্ঞায়িত" "$(ev 'typeof window.__mrQA')" 'object'
T=$(ev 'window.__mrQA.total()' | tr -d '"')
C=$(ev 'window.__mrQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
if [ -n "$T" ] && [ "$T" -ge 1 ] 2>/dev/null; then
  # সিড-স্বাধীন প্রোব-কীওয়ার্ড: প্রথম কার্ডের data-kw প্রথম ৪ অক্ষর (সাবস্ট্রিং-মিল গ্যারান্টিড)
  PROBE=$(ev 'document.querySelector("[data-mr-row]").getAttribute("data-kw").trim().slice(0,4)' | tr -d '"')
  if [ -n "$PROBE" ]; then
    agent-browser fill '#mr253-filter' "$PROBE" >/dev/null 2>&1; sleep 0.4
    C2=$(ev 'window.__mrQA.count()' | tr -d '"')
    if [ -n "$C2" ] && [ "$C2" -ge 1 ] && [ "$C2" -le "$T" ]; then ok "প্রথম-কার্ড-কীওয়ার্ড '$PROBE' → মিল ($C2/$T)"; else bad "প্রোব-ফিল্টার ব্যর্থ (probe=$PROBE got=$C2 total=$T)"; fi
  else bad "প্রোব-কীওয়ার্ড-এক্সট্র্যাকশন ব্যর্থ"; fi
  agent-browser fill '#mr253-filter' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__mrQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-mr-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__mrQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__mrQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__mrQA.clear() → পুনরুদ্ধার ($T)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f"}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "mr253-filter" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("mr253-filter").value="probe253";document.getElementById("mr253-filter").dispatchEvent(new Event("input"));document.getElementById("mr253-filter").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("mr253-filter").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "mr253-filter" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৫ (কার্ড-শূন্য — সিড-ব্যর্থ/লিমিট; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s253-mrfilter-desk.png" >/dev/null 2>&1 && ok "s253-mrfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s253-mrfilter-mobile390.png" >/dev/null 2>&1 && ok "s253-mrfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 >/dev/null 2>&1
# সমাপ্তি-সেশন-স্বাস্থ্য: ইউজার-সেশন লগআউট — পরবর্তী-সুইটের /admin/login-অটো-রিডাইরেক্ট-দূষণ-প্রতিরোধ (session253)
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
