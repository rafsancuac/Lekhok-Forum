#!/bin/bash
# s259-noticefilter-suite.sh — session259 বিজ্ঞপ্তি (/moderator/notices) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (no259 স্ট্রিপ + data-no-row/data-kw সারি + শূন্য-অবস্থা + bulk-bar/যোগ-ফর্ম/data-bulk-all অক্ষুণ্ণ)
#          ② স্টাইল (no259-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — সারি+চিপ+শূন্য-বক্স; cat-chip টোকেন-টিন্ট)
#          ③ আচরণ (__noQA হুক; সিড-মার্কার→১-মিল (নির্ধারক); ক্যাটাগরি-শব্দ-প্রোব; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true — session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **প্রোডাকশন-প্রবাহ-সিড** (s254/s257/s258-নীতি): মার্কার-বিজ্ঞপ্তি তৈরি (urlencoded POST /moderator/notices — 'qa259notice' + category=urgent — dup-গার্ড অ-বাধক); **শেষে মার্কার-সারি delete→ট্র্যাহ→bulk-purge** (testadmin=admin; POST ?_method=DELETE → trashed=<tid> → /admin/trash/bulk-purge ids=) — স্বয়ং-নিরাময়ী
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — notice-স্কোপ-সহ)
#         ④ কাউন্ট = .mod-item[data-no-row] রেন্ডার-সারি (CSS/JS-ফ্যান্টম-মুক্ত — grep-occurrence নয়, সারি-কাঠামো); প্রতি-POST-আগে ফ্রেশ-GET-_csrf (রোটেশন-সুরক্ষা — s254-নীতি)
#         ⑤ id-আবিষ্কার = সারি-অনন্য-অ্যাঙ্কর RS='<div class="mod-item"' + name="bulk_ids" value= gsub-এক্সট্র্যাকশন (PLANS session258-শিক্ষা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
MARK="qa259notice"
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
J=/tmp/s259-no-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s259-no-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/notices")
if [ "$PC" = "200" ]; then ok "বিজ্ঞপ্তি পৃষ্ঠা 200"; else bad "বিজ্ঞপ্তি পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'class="mod-item" data-no-row="[0-9]*"' /tmp/s259-no-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s259-no-page.html | wc -l)
MARKN=$(grep -cF "$MARK" /tmp/s259-no-page.html || true)

echo "── ধাপ-০.৫: প্রোডাকশন-প্রবাহ-সিড (মার্কার-বিজ্ঞপ্তি urlencoded-POST — category=urgent) ──"
if [ "$MARKN" = "0" ]; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/notices" \
    --data-urlencode "title=$MARK বিজ্ঞপ্তি-ডেমো" --data-urlencode "content=$MARK সুইট-সিড (স্বয়ং-নিরাময়ী)" \
    --data-urlencode "category=urgent" --data-urlencode "_csrf=$TOK")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "মার্কার-বিজ্ঞপ্তি তৈরি ($CC)"; else bad "বিজ্ঞপ্তি-তৈরি ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" -c "$J" "$BASE/moderator/notices" -o /tmp/s259-no-page.html
  MARKN=$(grep -cF "$MARK" /tmp/s259-no-page.html || true)
  if [ "$MARKN" -ge 1 ]; then ok "সিড-পরে মার্কার-রেন্ডার ($MARKN)"; else bad "সিড-পরে-ও মার্কার-শূন্য"; fi
else
  skip "সিড-স্কিপ (মার্কার-সারি পূর্ব-বিদ্যমান — পুনঃব্যবহার)"
fi
NID=$(awk 'BEGIN{RS="<div class=\"mod-item\""} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' /tmp/s259-no-page.html)
if [ -n "$NID" ] && [ "$NID" -gt 0 ] 2>/dev/null; then ok "মার্কার-id আবিষ্কার #$NID"; else bad "মার্কার-id আবিষ্কার-ব্যর্থ"; fi
ROWS=$(grep -o 'class="mod-item" data-no-row="[0-9]*"' /tmp/s259-no-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s259-no-page.html | wc -l)
if [ "$ROWS" -ge 1 ]; then ok "সিড-পরে বিজ্ঞপ্তি-সারি ($ROWS)"; else bad "সিড-পরে-ও সারি-শূন্য"; fi

echo "── ধাপ-১: কাঠামো (no259 স্ট্রিপ — bulk-bar/যোগ-ফর্ম/data-bulk-all অক্ষুণ্ণ) ──"
contains "no259-ইনপুট রেন্ডার" "$(cat /tmp/s259-no-page.html)" 'id="noFilter259"'
contains "no259-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s259-no-page.html)" 'id="noCount259"'
contains "no259-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s259-no-page.html)" 'id="noClear259"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s259-no-page.html)" 'no-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-no-empty)" "$(cat /tmp/s259-no-page.html)" 'data-no-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s259-no-page.html)" '<div class="no-zero" id="noZero259" data-no-empty hidden>'
contains "ক্যাটাগরি-চিপ রেন্ডার (নতুন-সারি-সমৃদ্ধি)" "$(cat /tmp/s259-no-page.html)" 'class="no-cat-chip"'
contains "bulk-bar অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s259-no-page.html)" 'id="bulkBar"'
contains "bulk-delete অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s259-no-page.html)" '/notices/bulk-delete'
contains "bulk-toggle অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s259-no-page.html)" '/notices/bulk-toggle'
contains "bulk-সব-চেকবক্স অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s259-no-page.html)" 'data-bulk-all'
contains "যোগ-ফর্ম অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s259-no-page.html)" 'action="/moderator/notices" class="mod-form"'
contains "__noQA হুক উপস্থিত" "$(cat /tmp/s259-no-page.html)" '__noQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s259-no-page.html)" "ev.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "সারি-সমতুল্য data-kw কভারেজ ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
NOCSS=$(sed -n '/session259 — বিজ্ঞপ্তি তাৎক্ষণিক-ফিল্টার/,/<\/style>/p' /tmp/s259-no-page.html)
HEXN=$(echo "$NOCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "no259-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "no259-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$NOCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$NOCSS" '.no-kbd-hint kbd'
contains "reduced-motion জোড়া" "$NOCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$NOCSS" '@media (max-width: 640px)'
contains "নোটিশ-ফিডব্যাক (:active scale)" "$NOCSS" '.no-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (mod-item)" "$NOCSS" '.mod-item[data-no-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$NOCSS" '.no-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$NOCSS" '.no-zero[hidden] { display: none; }'
containsF "ক্যাটাগরি-চিপ টোকেন-টিন্ট" "$NOCSS" '.no-cat-chip { display: inline-flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/notices" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/notices'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/notices" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/notices খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/notices'
if [ "$ROWS" -ge 1 ]; then
  contains "__noQA সংজ্ঞায়িত" "$(ev 'typeof window.__noQA')" 'object'
  T=$(ev 'window.__noQA.total()' | tr -d '"')
  C=$(ev 'window.__noQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  agent-browser fill '#noFilter259' "$MARK" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__noQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "মার্কার-প্রোব '$MARK' → নির্ধারক-১-মিল"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=১)"; fi
  CHIPV=$(ev 'document.getElementById("noCount259").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "1 / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  agent-browser fill '#noFilter259' জরুরি >/dev/null 2>&1; sleep 0.4
  C5=$(ev 'window.__noQA.count()' | tr -d '"')
  if [ -n "$C5" ] && [ "$C5" -ge 1 ] && [ "$C5" -le "$T" ]; then ok "ক্যাটাগরি-শব্দ-প্রোব 'জরুরি' → মিল ($C5/$T)"; else bad "ক্যাটাগরি-প্রোব ব্যর্থ (got=$C5)"; fi
  agent-browser fill '#noFilter259' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__noQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-no-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__noQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__noQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__noQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("noCount259")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "noFilter259" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("noFilter259").value="probe259";document.getElementById("noFilter259").dispatchEvent(new Event("input"));document.getElementById("noFilter259").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("noFilter259").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "noFilter259" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×৯ (সারি-শূন্য — সিড-ব্যর্থ; কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s259-noticefilter-desk.png" >/dev/null 2>&1 && ok "s259-noticefilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s259-noticefilter-mobile390.png" >/dev/null 2>&1 && ok "s259-noticefilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: মার্কার-সারি পরিষ্কারক (delete→ট্র্যাহ→bulk-purge — পুনঃরান-idempotent) ──"
if [ -n "$NID" ] && [ "$NID" -gt 0 ] 2>/dev/null; then
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/notices/$NID?_method=DELETE" --data-urlencode "_csrf=$TOK")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ] && [ "$TID" -gt 0 ] 2>/dev/null; then ok "মার্কার-বিজ্ঞপ্তি সফট-ডিলিট → ট্র্যাশ #$TID"; else bad "delete-ব্যর্থ (loc=$LOC)"; fi
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$TOK")
  curl -s -b "$J" "$BASE/moderator/notices" -o /tmp/s259-no-after.html
  LEFT=$(grep -cF "$MARK" /tmp/s259-no-after.html || true)
  if [ "$PU" = "302" ] || [ "$PU" = "303" ]; then ok "মার্কার-সারি #$TID purge ($PU; বিজ্ঞপ্তিতে-অবশিষ্ট-মার্কার=$LEFT)"; else bad "purge-ব্যর্থ (HTTP $PU)"; fi
else
  skip "পরিষ্কারক-স্কিপ (মার্কার-id-শূন্য)"
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
