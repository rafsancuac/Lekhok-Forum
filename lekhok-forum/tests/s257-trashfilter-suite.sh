#!/bin/bash
# s257-trashfilter-suite.sh — session257 ট্র্যাশ (/moderator/trash) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (tr257 স্ট্রিপ + data-tr-row/data-kw সারি + শূন্য-অবস্থা + GET-q/টেবিল-সিলেক্ট/restore-all/data-bulk-all অক্ষুণ্ণ)
#          ② স্টাইল (tr257-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ+শূন্য+সারি)
#          ③ আচরণ (__trQA হুক; সিড-মার্কার→১-মিল (নির্ধারক); টেবিল-প্রোব; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true — session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **প্রোডাকশন-প্রবাহ-সিড** (s254-নীতি): ট্র্যাশ-খালি-হলে মার্কার-নোটিশ তৈরি (POST /moderator/notices — 'qa257trash') → bulk-delete → ট্র্যাশে ১-সারি; **শেষে মার্কার-সারি bulk-purge** (testadmin=admin; /admin/trash/bulk-purge ids=) — স্বয়ং-নিরাময়ী (ব্যর্থ-রানের-অবশিষ্ট-মার্কার-সারি পরের-রানে পুনঃ-ব্যবহৃত-ও-পরিষ্কার)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — trash স্কোপ-মুক্ত; moderatorView-মোডে bulkBar-লুকানো — অ্যাসার্ট-বহির্ভূত)
#         ④ কাউন্ট = data-tr-row="[0-9]*" (thead-tr/CSS/JS-ফ্যান্টম-মুক্ত); প্রতি-POST-আগে ফ্রেশ-GET-_csrf (রোটেশন-সুরক্ষা — s254-নীতি)
#         ⑤ ব্রাউজার-সেশন-প্রি-ক্লিয়ার (session253-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
MARK="qa257trash"
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
J=/tmp/s257-tr-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s257-tr-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/trash")
if [ "$PC" = "200" ]; then ok "ট্র্যাশ পৃষ্ঠা 200"; else bad "ট্র্যাশ পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-tr-row="[0-9]*"' /tmp/s257-tr-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s257-tr-page.html | wc -l)
MARKN=$(grep -cF "$MARK" /tmp/s257-tr-page.html || true)

echo "── ধাপ-০.৫: প্রোডাকশন-প্রবাহ-সিড (ট্র্যাশ-খালি → মার্কার-নোটিশ তৈরি → সফট-ডিলিট) ──"
if [ "$MARKN" = "0" ]; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/notices" --data-urlencode "title=$MARK ট্র্যাশ-ডেমো" --data-urlencode "content=$MARK suite seed" --data-urlencode "category=notice" --data-urlencode "_csrf=$TOK")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "মার্কার-নোটিশ তৈরি ($CC)"; else bad "নোটিশ-তৈরি ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" -c "$J" "$BASE/moderator/notices" -o /tmp/s257-notices.html
  NID=$(awk 'BEGIN{RS="</div>"} /'"$MARK"'/ { if (match($0, /value="[0-9]+"/)) { print substr($0, RSTART+7, RLENGTH-8); exit } }' /tmp/s257-notices.html)
  if [ -n "$NID" ] && [ "$NID" -gt 0 ] 2>/dev/null; then ok "HTML-ডিসকভারি id=$NID"; else bad "নোটিশ-id আবিষ্কার-ব্যর্থ"; fi
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/notices/bulk-delete" --data-urlencode "ids=$NID" --data-urlencode "_csrf=$TOK")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ] && [ "$TID" -gt 0 ] 2>/dev/null; then ok "সফট-ডিলিট → ট্র্যাশ-সারি #$TID"; else bad "bulk-delete-ব্যর্থ (loc=$LOC)"; fi
  curl -s -b "$J" "$BASE/moderator/trash" -o /tmp/s257-tr-page.html
  ROWS=$(grep -o 'data-tr-row="[0-9]*"' /tmp/s257-tr-page.html | wc -l)
  KW=$(grep -o 'data-kw="' /tmp/s257-tr-page.html | wc -l)
  MARKN=$(grep -cF "$MARK" /tmp/s257-tr-page.html || true)
  if [ "$ROWS" -ge 1 ]; then ok "সিড-পরে ট্র্যাশ-সারি ($ROWS)"; else bad "সিড-পরে-ও সারি-শূন্য"; fi
else
  skip "সিড-স্কিপ (মার্কার-সারি পূর্ব-বিদ্যমান — পুনঃব্যবহার)"
fi

echo "── ধাপ-১: কাঠামো (tr257 স্ট্রিপ — GET-ফিল্টার/restore-all/bulk-অক্ষুণ্ণ) ──"
contains "tr257-ইনপুট রেন্ডার" "$(cat /tmp/s257-tr-page.html)" 'id="trFilter257"'
contains "tr257-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s257-tr-page.html)" 'id="trCount257"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s257-tr-page.html)" 'tr-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-tr-empty)" "$(cat /tmp/s257-tr-page.html)" 'data-tr-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s257-tr-page.html)" '<div class="tr-zero" id="trZero257" data-tr-empty hidden>'
contains "GET-সার্চ অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s257-tr-page.html)" 'name="q"'
contains "টেবিল-সিলেক্ট অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s257-tr-page.html)" 'name="table"'
contains "restore-all অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s257-tr-page.html)" '/trash/restore-all'
contains "bulk-সব-চেকবক্স অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s257-tr-page.html)" 'data-bulk-all'
contains "__trQA হুক উপস্থিত" "$(cat /tmp/s257-tr-page.html)" '__trQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s257-tr-page.html)" "ev.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$ROWS" = "$KW" ]; then ok "সারি == data-kw ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
TRCSS=$(sed -n '/session257 — ট্র্যাশ তাৎক্ষণিক-ফিল্টার/,/<\/style>/p' /tmp/s257-tr-page.html)
HEXN=$(echo "$TRCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "tr257-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "tr257-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$TRCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$TRCSS" '.tr-kbd-hint kbd'
contains "reduced-motion জোড়া" "$TRCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$TRCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$TRCSS" '.tr-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (table tr)" "$TRCSS" '.table tr[data-tr-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$TRCSS" '.tr-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$TRCSS" '.tr-zero[hidden] { display: none; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/trash" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/trash'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/trash" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/trash খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/trash'
if [ "$ROWS" -ge 1 ]; then
  contains "__trQA সংজ্ঞায়িত" "$(ev 'typeof window.__trQA')" 'object'
  T=$(ev 'window.__trQA.total()' | tr -d '"')
  C=$(ev 'window.__trQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  agent-browser fill '#trFilter257' "$MARK" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__trQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "মার্কার-প্রোব '$MARK' → নির্ধারক-১-মিল"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=১)"; fi
  ev 'window.__trQA.clear()' >/dev/null 2>&1; sleep 0.2
  agent-browser fill '#trFilter257' notices >/dev/null 2>&1; sleep 0.4
  C5=$(ev 'window.__trQA.count()' | tr -d '"')
  if [ -n "$C5" ] && [ "$C5" -ge 1 ] && [ "$C5" -le "$T" ]; then ok "টেবিল-প্রোব 'notices' → মিল ($C5/$T)"; else bad "টেবিল-প্রোব ব্যর্থ (got=$C5)"; fi
  agent-browser fill '#trFilter257' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__trQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-tr-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__trQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__trQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__trQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("trCount257")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "trFilter257" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("trFilter257").value="probe257";document.getElementById("trFilter257").dispatchEvent(new Event("input"));document.getElementById("trFilter257").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("trFilter257").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "trFilter257" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৮ (সারি-শূন্য — সিড-ব্যর্থ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s257-trashfilter-desk.png" >/dev/null 2>&1 && ok "s257-trashfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s257-trashfilter-mobile390.png" >/dev/null 2>&1 && ok "s257-trashfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: মার্কার-সারি পরিষ্কারক (bulk-purge — পুনঃরান-idempotent) ──"
curl -s -b "$J" "$BASE/moderator/trash" -o /tmp/s257-tr-clean.html
CTID=$(awk 'BEGIN{RS="<tr"} /qa257trash/ { if (match($0, /data-kw="#[0-9]+/)) { s=substr($0, RSTART+10); print substr(s, 1, index(s, " ")-1); exit } }' /tmp/s257-tr-clean.html)
if [ -n "$CTID" ] && [ "$CTID" -gt 0 ] 2>/dev/null; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$CTID" --data-urlencode "_csrf=$TOK")
  curl -s -b "$J" "$BASE/moderator/trash" -o /tmp/s257-tr-after.html
  LEFT=$(grep -cF "$MARK" /tmp/s257-tr-after.html || true)
  if [ "$PU" = "302" ] || [ "$PU" = "303" ]; then ok "মার্কার-সারি #$CTID purge ($PU; অবশিষ্ট-মার্কার=$LEFT)"; else bad "purge-ব্যর্থ (HTTP $PU)"; fi
else
  skip "পরিষ্কারক-স্কিপ (মার্কার-সারি-শূন্য)"
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
