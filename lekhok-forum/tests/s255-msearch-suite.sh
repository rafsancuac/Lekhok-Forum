#!/bin/bash
# s255-msearch-suite.sh — session255 সদস্য-তালিকা (/moderator/members) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (mm255 স্ট্রিপ + data-kw সারি + শূন্য-অবস্থা + বাল্ক-বার/সব-সিলেক্ট/যোগ-ফর্ম অক্ষুণ্ণ + সেকশন-কার্ড data-mm-sec)
#          ② স্টাইল (mm255-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-fade; reduced-motion-জোড়া; 640px-সংকোচন; hidden-গার্ড ×২)
#          ③ আচরণ (__mmQA হুক; প্রথম-সারি-কীওয়ার্ড→মিল; নো-ম্যাচ→শূন্য-অবস্থা+সেকশন-অটো-হাইড; clear→পুনরুদ্ধার; 'f'-কী ফোকাস; Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① প্রায়-অ-ধ্বংসাত্মক — pkill/মডারেশন-অ্যাকশন নেই; **সিড-শূন্য** (members পূর্ব-বিদ্যমান ~৮০+; সিড-প্রয়োজনে প্রোডাকশন-প্রবাহ-নীতি s254-দেখুন)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — members স্কোপ-মুক্ত সারফেস, যে-কোনো-staff দেখে; s254-ভিউয়ার-চুক্তি-সামঞ্জস্য)
#         ④ keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি); কাউন্ট-অ্যাসার্ট ডায়নামিক (সিড-স্বাধীন)
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
J=/tmp/s255-mm-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s255-mm-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/members")
if [ "$PC" = "200" ]; then ok "সদস্য-ব্যবস্থাপনা পৃষ্ঠা 200"; else bad "সদস্য-ব্যবস্থাপনা পৃষ্ঠা HTTP $PC"; fi
HTML=$(cat /tmp/s255-mm-page.html)
ROWS=$(echo "$HTML" | grep -o 'class="mem-row" data-mm-row' | wc -l)
KW=$(echo "$HTML" | grep -o 'data-kw="' | wc -l)
SECS=$(echo "$HTML" | grep -o 'class="mod-card" data-mm-sec' | wc -l)

echo "── ধাপ-১: কাঠামো (mm255 স্ট্রিপ — বাল্ক/যোগ-ফর্ম অক্ষুণ্ণ) ──"
contains "mm255-ইনপুট রেন্ডার" "$HTML" 'id="mm255-filter"'
contains "mm255-কাউন্ট চিপ রেন্ডার" "$HTML" 'id="mm255-count"'
contains "kbd-পিল affordance রেন্ডার" "$HTML" 'mm255-kbd'
contains "শূন্য-অবস্থা বক্স (data-mm-empty)" "$HTML" 'data-mm-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$HTML" '<div class="mm255-empty" data-mm-empty hidden>'
contains "বাল্ক-বার অক্ষুণ্ণ (no-regression)" "$HTML" 'id="bulkBar"'
contains "বাল্ক-সব-চেকবক্স অক্ষুণ্ণ (no-regression)" "$HTML" 'data-bulk-all'
contains "নতুন-সদস্য-যোগ ফর্ম অক্ষুণ্ণ (no-regression)" "$HTML" 'action="/moderator/members"'
contains "সম্পাদনা-ফর্ম অক্ষুণ্ণ (no-regression)" "$HTML" 'name="member_type"'
if [ "$ROWS" -gt 0 ] && [ "$ROWS" = "$KW" ]; then ok "সারি == data-kw ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$SECS" -ge 1 ]; then ok "সেকশন-কার্ড data-mm-sec ($SECS টি)"; else bad "সেকশন-কার্ড-মার্ক-অনুপস্থিত"; fi
CHIP=$(echo "$HTML" | grep -o 'title="দৃশ্যমান সদস্য">[0-9]*<' | grep -o '[0-9]*' | head -1)
if [ -n "$CHIP" ] && [ "$CHIP" = "$ROWS" ]; then ok "চিপ-প্রাথমিক মান == সারি-সংখ্যা ($CHIP)"; else bad "চিপ-মান বেমান (chip=$CHIP row=$ROWS)"; fi
contains "__mmQA হুক উপস্থিত" "$HTML" '__mmQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$HTML" "e.key !== 'f'"

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MMCSS=$(echo "$HTML" | sed -n '/session255 — সদস্য-তালিকা তাৎক্ষণিক-ফিল্টার/,/<\/style>/p')
HEXN=$(echo "$MMCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "mm255-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "mm255-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MMCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd fade (focus-within)" "$MMCSS" '.mm255-field:focus-within .mm255-kbd { opacity: 0; }'
contains "reduced-motion জোড়া" "$MMCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MMCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$MMCSS" '.mm255-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (details.mem-row)" "$MMCSS" 'details.mem-row[data-mm-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-সেকশন (mod-card)" "$MMCSS" '.mod-card[data-mm-sec][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/members" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/members'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/members" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/members খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/members'
contains "__mmQA সংজ্ঞায়িত" "$(ev 'typeof window.__mmQA')" 'object'
T=$(ev 'window.__mmQA.total()' | tr -d '"')
C=$(ev 'window.__mmQA.count()' | tr -d '"')
S0=$(ev 'window.__mmQA.secs()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
if [ -n "$S0" ] && [ "$S0" -ge 1 ] 2>/dev/null; then ok "প্রাথমিক সেকশন-দৃশ্যমান ($S0)"; else bad "সেকশন-প্রাথমিক বেমান (secs=$S0)"; fi
if [ -n "$T" ] && [ "$T" -ge 1 ] 2>/dev/null; then
  PROBE=$(ev 'document.querySelector("[data-mm-row]").getAttribute("data-kw").trim().slice(0,4)' | tr -d '"')
  if [ -n "$PROBE" ]; then
    agent-browser fill '#mm255-filter' "$PROBE" >/dev/null 2>&1; sleep 0.4
    C2=$(ev 'window.__mmQA.count()' | tr -d '"')
    if [ -n "$C2" ] && [ "$C2" -ge 1 ] && [ "$C2" -le "$T" ]; then ok "প্রথম-সারি-কীওয়ার্ড '$PROBE' → মিল ($C2/$T)"; else bad "প্রোব-ফিল্টার ব্যর্থ (probe=$PROBE got=$C2 total=$T)"; fi
  else bad "প্রোব-কীওয়ার্ড-এক্সট্র্যাকশন ব্যর্থ"; fi
  agent-browser fill '#mm255-filter' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__mmQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-mm-empty]").hidden' | tr -d '"')
  S1=$(ev 'window.__mmQA.secs()' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  if [ "$S1" = "0" ]; then ok "নো-ম্যাচ → সেকশন-অটো-হাইড ($S0→0)"; else bad "সেকশন-অটো-হাইড ব্যর্থ (secs=$S1)"; fi
  ev 'window.__mmQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__mmQA.count()' | tr -d '"')
  S2=$(ev 'window.__mmQA.secs()' | tr -d '"')
  if [ "$C4" = "$T" ] && [ "$S2" = "$S0" ]; then ok "__mmQA.clear() → পুনরুদ্ধার ($T সারি / $S2 সেকশন)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4 secs=$S2)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f"}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "mm255-filter" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("mm255-filter").value="probe255";document.getElementById("mm255-filter").dispatchEvent(new Event("input"));document.getElementById("mm255-filter").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("mm255-filter").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "mm255-filter" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৬ (সারি-শূন্য — ডেটা-শূন্য-পরিবেশ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s255-msearch-desk.png" >/dev/null 2>&1 && ok "s255-msearch-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s255-msearch-mobile390.png" >/dev/null 2>&1 && ok "s255-msearch-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
