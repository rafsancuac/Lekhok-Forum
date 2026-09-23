#!/bin/bash
# s260-eventsfilter-suite.sh — session260 ইভেন্ট (/moderator/events) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (ev260 স্ট্রিপ + data-ev-row/data-kw সারি + শূন্য-অবস্থা + bulk-bar/যোগ-ফর্ম/data-bulk-all অক্ষুণ্ণ)
#          ② স্টাইল (ev260-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — সারি+চিপ+শূন্য-বক্স; status-chip টোকেন-টিন্ট + past-ব্যবস্থা)
#          ③ আচরণ (__evQA হুক; সিড-মার্কার→১-মিল (নির্ধারক); অবস্থা-শব্দ-প্রোব আসন্ন; স্থান-প্রোব; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true — session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **প্রোডাকশন-প্রবাহ-সিড** (s254/s257/s258/s259-নীতি): মার্কার-ইভেন্ট তৈরি (urlencoded POST /moderator/events — 'qa260event' + date=2027-01-01 আসন্ন + location=qa260venue — body._csrf-পথ); **শেষে মার্কার-সারি delete→ট্র্যাহ→bulk-purge** (POST ?_method=DELETE → trashed=<tid> → /admin/trash/bulk-purge ids=) — স্বয়ং-নিরাময়ী
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — event-স্কোপ-সহ)
#         ④ কাউন্ট = .mod-item[data-ev-row] রেন্ডার-সারি (CSS/JS-ফ্যান্টম-মুক্ত); প্রতি-POST-আগে ফ্রেশ-GET-_csrf (রোটেশন-সুরক্ষা)
#         ⑤ id-আবিষ্কার = সারি-অনন্য-অ্যাঙ্কর RS='<div class="mod-item"' + name="bulk_ids" value= gsub-এক্সট্র্যাকশন (PLANS session258/259-শিক্ষা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
MARK="qa260event"
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
J=/tmp/s260-ev-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s260-ev-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/events")
if [ "$PC" = "200" ]; then ok "ইভেন্ট পৃষ্ঠা 200"; else bad "ইভেন্ট পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'class="mod-item" data-ev-row="[0-9]*"' /tmp/s260-ev-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s260-ev-page.html | wc -l)
MARKN=$(grep -cF "$MARK" /tmp/s260-ev-page.html || true)

echo "── ধাপ-০.৫: প্রোডাকশন-প্রবাহ-সিড (মার্কার-ইভেন্ট urlencoded-POST — date=2027 আসন্ন + location) ──"
if [ "$MARKN" = "0" ]; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/events" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/events" \
    --data-urlencode "title=$MARK ইভেন্ট-ডেমো" --data-urlencode "description=$MARK সুইট-সিড (স্বয়ং-নিরাময়ী)" \
    --data-urlencode "date=2027-01-01" --data-urlencode "end_date=2027-01-02" \
    --data-urlencode "location=qa260venue" --data-urlencode "_csrf=$TOK")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "মার্কার-ইভেন্ট তৈরি ($CC)"; else bad "ইভেন্ট-তৈরি ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" -c "$J" "$BASE/moderator/events" -o /tmp/s260-ev-page.html
  MARKN=$(grep -cF "$MARK" /tmp/s260-ev-page.html || true)
  if [ "$MARKN" -ge 1 ]; then ok "সিড-পরে মার্কার-রেন্ডার ($MARKN)"; else bad "সিড-পরে-ও মার্কার-শূন্য"; fi
else
  skip "সিড-স্কিপ (মার্কার-সারি পূর্ব-বিদ্যমান — পুনঃব্যবহার)"
fi
EID=$(awk 'BEGIN{RS="<div class=\"mod-item\""} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' /tmp/s260-ev-page.html)
if [ -n "$EID" ] && [ "$EID" -gt 0 ] 2>/dev/null; then ok "মার্কার-id আবিষ্কার #$EID"; else bad "মার্কার-id আবিষ্কার-ব্যর্থ"; fi
ROWS=$(grep -o 'class="mod-item" data-ev-row="[0-9]*"' /tmp/s260-ev-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s260-ev-page.html | wc -l)
if [ "$ROWS" -ge 1 ]; then ok "সিড-পরে ইভেন্ট-সারি ($ROWS)"; else bad "সিড-পরে-ও সারি-শূন্য"; fi

echo "── ধাপ-১: কাঠামো (ev260 স্ট্রিপ — bulk-bar/যোগ-ফর্ম/data-bulk-all অক্ষুণ্ণ) ──"
contains "ev260-ইনপুট রেন্ডার" "$(cat /tmp/s260-ev-page.html)" 'id="evFilter260"'
contains "ev260-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s260-ev-page.html)" 'id="evCount260"'
contains "ev260-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s260-ev-page.html)" 'id="evClear260"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s260-ev-page.html)" 'ev-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-ev-empty)" "$(cat /tmp/s260-ev-page.html)" 'data-ev-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s260-ev-page.html)" '<div class="ev-zero" id="evZero260" data-ev-empty hidden>'
contains "স্ট্যাটাস-চিপ রেন্ডার (নতুন-সারি-সমৃদ্ধি)" "$(cat /tmp/s260-ev-page.html)" 'class="ev-status-chip'
contains "অবস্থা-শব্দ রেন্ডার (আসন্ন/সমাপ্ত-গণনা)" "$(cat /tmp/s260-ev-page.html)" 'আসন্ন'
contains "bulk-bar অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s260-ev-page.html)" 'id="bulkBar"'
contains "bulk-delete অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s260-ev-page.html)" '/events/bulk-delete'
contains "bulk-toggle অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s260-ev-page.html)" '/events/bulk-toggle'
contains "bulk-সব-চেকবক্স অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s260-ev-page.html)" 'data-bulk-all'
contains "যোগ-ফর্ম অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s260-ev-page.html)" 'action="/moderator/events" class="mod-form"'
contains "__evQA হুক উপস্থিত" "$(cat /tmp/s260-ev-page.html)" '__evQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s260-ev-page.html)" "ev.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "সারি-সমতুল্য data-kw কভারেজ ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
EVCSS=$(sed -n '/session260 — ইভেন্ট তাৎক্ষণিক-ফিল্টার/,/<\/style>/p' /tmp/s260-ev-page.html)
HEXN=$(echo "$EVCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "ev260-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ev260-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$EVCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$EVCSS" '.ev-kbd-hint kbd'
contains "reduced-motion জোড়া" "$EVCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$EVCSS" '@media (max-width: 640px)'
contains "ইভেন্ট-ফিডব্যাক (:active scale)" "$EVCSS" '.ev-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (mod-item)" "$EVCSS" '.mod-item[data-ev-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$EVCSS" '.ev-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$EVCSS" '.ev-zero[hidden] { display: none; }'
containsF "স্ট্যাটাস-চিপ টোকেন-টিন্ট" "$EVCSS" '.ev-status-chip { display: inline-flex;'
containsF "past-অবস্থা ব্যবস্থা (slate-মিউট)" "$EVCSS" '.ev-status-chip.past'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/events" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/events'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/events" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/events খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/events'
if [ "$ROWS" -ge 1 ]; then
  contains "__evQA সংজ্ঞায়িত" "$(ev 'typeof window.__evQA')" 'object'
  T=$(ev 'window.__evQA.total()' | tr -d '"')
  C=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  agent-browser fill '#evFilter260' "$MARK" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "মার্কার-প্রোব '$MARK' → নির্ধারক-১-মিল"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=১)"; fi
  CHIPV=$(ev 'document.getElementById("evCount260").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "1 / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  agent-browser fill '#evFilter260' আসন্ন >/dev/null 2>&1; sleep 0.4
  C5=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ -n "$C5" ] && [ "$C5" -ge 1 ] && [ "$C5" -le "$T" ]; then ok "অবস্থা-শব্দ-প্রোব 'আসন্ন' → মিল ($C5/$T)"; else bad "অবস্থা-প্রোব ব্যর্থ (got=$C5)"; fi
  agent-browser fill '#evFilter260' qa260venue >/dev/null 2>&1; sleep 0.4
  C6=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ "$C6" = "1" ]; then ok "স্থান-প্রোব 'qa260venue' → নির্ধারক-১-মিল"; else bad "স্থান-প্রোব ব্যর্থ (got=$C6)"; fi
  agent-browser fill '#evFilter260' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__evQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-ev-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__evQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__evQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("evCount260")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "evFilter260" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("evFilter260").value="probe260";document.getElementById("evFilter260").dispatchEvent(new Event("input"));document.getElementById("evFilter260").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("evFilter260").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "evFilter260" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×১১ (সারি-শূন্য — সিড-ব্যর্থ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s260-eventsfilter-desk.png" >/dev/null 2>&1 && ok "s260-eventsfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s260-eventsfilter-mobile390.png" >/dev/null 2>&1 && ok "s260-eventsfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: মার্কার-সারি পরিষ্কারক (delete→ট্র্যাহ→bulk-purge — পুনঃরান-idempotent) ──"
if [ -n "$EID" ] && [ "$EID" -gt 0 ] 2>/dev/null; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/events" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/events/$EID?_method=DELETE" --data-urlencode "_csrf=$TOK")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ] && [ "$TID" -gt 0 ] 2>/dev/null; then ok "মার্কার-ইভেন্ট সফট-ডিলিট → ট্র্যাশ #$TID"; else bad "delete-ব্যর্থ (loc=$LOC)"; fi
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$TOK")
  curl -s -b "$J" "$BASE/moderator/events" -o /tmp/s260-ev-after.html
  LEFT=$(grep -cF "$MARK" /tmp/s260-ev-after.html || true)
  if [ "$PU" = "302" ] || [ "$PU" = "303" ]; then ok "মার্কার-সারি #$TID purge ($PU; ইভেন্টে-অবশিষ্ট-মার্কার=$LEFT)"; else bad "purge-ব্যর্থ (HTTP $PU)"; fi
else
  skip "পরিষ্কারক-স্কিপ (মার্কার-id-শূন্য)"
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
