#!/bin/bash
# s258-pressfilter-suite.sh — session258 পত্রিকা-কাটিং (/moderator/press) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (pr258 স্ট্রিপ + data-pr-row/data-kw সারি + শূন্য-অবস্থা + bulk-bar/যোগ-ফর্ম/clip-count অক্ষুণ্ণ)
#          ② স্টাইল (pr258-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ+শূন্য+সারি)
#          ③ আচরণ (__prQA হুক; সিড-মার্কার→১-মিল (নির্ধারক); স্ট্যাটাস-শব্দ-প্রোব; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true — session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **প্রোডাকশন-প্রবাহ-সিড** (s254/s257-নীতি): মার্কার-কাটিং তৈরি (multipart POST /moderator/press — 'qa258press' + image_url — dup-গার্ড ২-মিনিট-সহ অ-বাধক); **শেষে মার্কার-সারি delete→ট্র্যাশ→bulk-purge** (testadmin=admin; /admin/trash/bulk-purge ids=) — স্বয়ং-নিরাময়ী
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — epaper-স্কোপ-সহ)
#         ④ কাউন্ট = details-clip-row রেন্ডার-সারি (CSS/JS-ফ্যান্টম-মুক্ত — grep-occurrence নয়, সারি-কাঠামো); প্রতি-POST-আগে ফ্রেশ-GET-_csrf (রোটেশন-সুরক্ষা — s254-নীতি)
#         ⑤ ব্রাউজার-সেশন-প্রি-ক্লিয়ার (session253-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
MARK="qa258press"
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
J=/tmp/s258-pr-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s258-pr-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/press")
if [ "$PC" = "200" ]; then ok "প্রেস পৃষ্ঠা 200"; else bad "প্রেস পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'class="clip-row" data-pr-row="[0-9]*"' /tmp/s258-pr-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s258-pr-page.html | wc -l)
MARKN=$(grep -cF "$MARK" /tmp/s258-pr-page.html || true)

echo "── ধাপ-০.৫: প্রোডাকশন-প্রবাহ-সিড (মার্কার-কাটিং multipart-POST — image_url-পথ) ──"
if [ "$MARKN" = "0" ]; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/press" \
    -H "x-csrf-token: $TOK" \
    -F "title=$MARK প্রেস-ডেমো" -F "paper_name=qa258paper" -F "published_date=qa258date" \
    -F "sort_order=0" -F "is_active=1" -F "image_url=https://example.com/qa258press.jpg" -F "_csrf=$TOK")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "মার্কার-কাটিং তৈরি ($CC)"; else bad "কাটিং-তৈরি ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" -c "$J" "$BASE/moderator/press" -o /tmp/s258-pr-page.html
  MARKN=$(grep -cF "$MARK" /tmp/s258-pr-page.html || true)
  if [ "$MARKN" -ge 1 ]; then ok "সিড-পরে মার্কার-রেন্ডার ($MARKN)"; else bad "সিড-পরে-ও মার্কার-শূন্য"; fi
else
  skip "সিড-স্কিপ (মার্কার-সারি পূর্ব-বিদ্যমান — পুনঃব্যবহার)"
fi
SID=$(awk 'BEGIN{RS="</details>"} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' /tmp/s258-pr-page.html)
if [ -n "$SID" ] && [ "$SID" -gt 0 ] 2>/dev/null; then ok "মার্কার-id আবিষ্কার #$SID"; else bad "মার্কার-id আবিষ্কার-ব্যর্থ"; fi
ROWS=$(grep -o 'class="clip-row" data-pr-row="[0-9]*"' /tmp/s258-pr-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s258-pr-page.html | wc -l)
if [ "$ROWS" -ge 1 ]; then ok "সিড-পরে প্রেস-সারি ($ROWS)"; else bad "সিড-পরে-ও সারি-শূন্য"; fi

echo "── ধাপ-১: কাঠামো (pr258 স্ট্রিপ — bulk-bar/যোগ-ফর্ম/clip-count অক্ষুণ্ণ) ──"
contains "pr258-ইনপুট রেন্ডার" "$(cat /tmp/s258-pr-page.html)" 'id="prFilter258"'
contains "pr258-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s258-pr-page.html)" 'id="prCount258"'
contains "pr258-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s258-pr-page.html)" 'id="prClear258"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s258-pr-page.html)" 'pr-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-pr-empty)" "$(cat /tmp/s258-pr-page.html)" 'data-pr-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s258-pr-page.html)" '<div class="pr-zero" id="prZero258" data-pr-empty hidden>'
contains "bulk-bar অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" 'id="bulkBar"'
contains "bulk-delete অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" '/press/bulk-delete'
contains "bulk-toggle অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" '/press/bulk-toggle'
contains "bulk-সব-চেকবক্স অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" 'data-bulk-all'
contains "যোগ-ফর্ম multipart অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" 'action="/moderator/press" enctype="multipart/form-data"'
contains "clip-count অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s258-pr-page.html)" 'class="clip-count"'
contains "__prQA হুক উপস্থিত" "$(cat /tmp/s258-pr-page.html)" '__prQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s258-pr-page.html)" "ev.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "সারি-সমতুল্য data-kw কভারেজ ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
PRCSS=$(sed -n '/session258 — পত্রিকা-কাটিং তাৎক্ষণিক-ফিল্টার/,/<\/style>/p' /tmp/s258-pr-page.html)
HEXN=$(echo "$PRCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "pr258-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "pr258-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$PRCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$PRCSS" '.pr-kbd-hint kbd'
contains "reduced-motion জোড়া" "$PRCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$PRCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$PRCSS" '.pr-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (clip-row)" "$PRCSS" '.clip-row[data-pr-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$PRCSS" '.pr-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$PRCSS" '.pr-zero[hidden] { display: none; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/press" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/press'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/press" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/press খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/press'
if [ "$ROWS" -ge 1 ]; then
  contains "__prQA সংজ্ঞায়িত" "$(ev 'typeof window.__prQA')" 'object'
  T=$(ev 'window.__prQA.total()' | tr -d '"')
  C=$(ev 'window.__prQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  agent-browser fill '#prFilter258' "$MARK" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__prQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "মার্কার-প্রোব '$MARK' → নির্ধারক-১-মিল"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=১)"; fi
  CHIPV=$(ev 'document.getElementById("prCount258").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "1 / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  ev 'window.__prQA.clear()' >/dev/null 2>&1; sleep 0.2
  agent-browser fill '#prFilter258' দৃশ্যমান >/dev/null 2>&1; sleep 0.4
  C5=$(ev 'window.__prQA.count()' | tr -d '"')
  if [ -n "$C5" ] && [ "$C5" -ge 1 ] && [ "$C5" -le "$T" ]; then ok "স্ট্যাটাস-শব্দ-প্রোব 'দৃশ্যমান' → মিল ($C5/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C5)"; fi
  agent-browser fill '#prFilter258' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__prQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-pr-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__prQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__prQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__prQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("prCount258")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "prFilter258" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("prFilter258").value="probe258";document.getElementById("prFilter258").dispatchEvent(new Event("input"));document.getElementById("prFilter258").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("prFilter258").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "prFilter258" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৯ (সারি-শূন্য — সিড-ব্যর্থ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s258-pressfilter-desk.png" >/dev/null 2>&1 && ok "s258-pressfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s258-pressfilter-mobile390.png" >/dev/null 2>&1 && ok "s258-pressfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: মার্কার-সারি পরিষ্কারক (delete→ট্র্যাহ→bulk-purge — পুনঃরান-idempotent) ──"
if [ -n "$SID" ] && [ "$SID" -gt 0 ] 2>/dev/null; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/press/$SID/delete" --data-urlencode "_csrf=$TOK")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ] && [ "$TID" -gt 0 ] 2>/dev/null; then ok "মার্কার-কাটিং সফট-ডিলিট → ট্র্যাশ #$TID"; else bad "delete-ব্যর্থ (loc=$LOC)"; fi
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$TOK")
  curl -s -b "$J" "$BASE/moderator/press" -o /tmp/s258-pr-after.html
  LEFT=$(grep -cF "$MARK" /tmp/s258-pr-after.html || true)
  if [ "$PU" = "302" ] || [ "$PU" = "303" ]; then ok "মার্কার-সারি #$TID purge ($PU; প্রেসে-অবশিষ্ট-মার্কার=$LEFT)"; else bad "purge-ব্যর্থ (HTTP $PU)"; fi
else
  skip "পরিষ্কারক-স্কিপ (মার্কার-id-শূন্য)"
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
