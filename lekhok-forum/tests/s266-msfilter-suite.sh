#!/bin/bash
# s266-msfilter-suite.sh — session266 যোগাযোগ-বার্তা (/admin/messages) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (ms266 স্ট্রিপ + data-ms-row/data-kw কার্ড-সারফেস + শূন্য-অবস্থা +
#          no-regression: স্ট্যাট-স্ট্রিপ / ফিল্টার-পিল / q-সার্চ / bulk-bar / তালিকা-প্রিন্ট /
#          admin-header / sidebar)
#          ② স্টাইল (ms266-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ/শূন্য-বক্স/কার্ড
#          (.msg105-card[data-ms-row][hidden] !important — author display:flex-ওভাররাইড,
#          session256-শ্রেণি — সঠিক-বাইট))
#          ③ আচরণ (__msQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত (session265-উন্নতি); নির্ধারক-প্রোব
#          'qa266msg-3917' (একক-সিড) + ' mail ' (ইমেইল) + 'অপঠিত unread' (স্ট্যাটাস) → পূর্বগণনা-মিল;
#          নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস
#          (bubbles:true) + **ফিল্ড-গার্ড-প্রোব** (input[name=q]-সার্চ-থেকে 'f' → ফোকাস-চুরি-শূন্য);
#          Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **প্রোডাকশন-প্রবাহ-সিড (s254/s257-চুক্তি):** ইনবক্স-শূন্য হলে পাবলিক POST /api/contact
#         (CSRF-শূন্য — পাবলিক-ফর্ম; রেট-লিমিট ৫/১০মি — ×২-রান-সুরক্ষিত) দ্বারা এক-সিড
#         (মার্কার 'qa266msg-3917' — নাম+বিষয়+বার্তা-ত্রয়ী); বিদ্যমান-মার্কার-সারি থাকলে পুনঃব্যবহার
#         (ক্র্যাশ-নিরাপদ idempotent) ② **স্বয়ং-নিরাময়ী ক্লিনার:** delete→trashed=<tid> →
#         /admin/trash/bulk-purge → নেট-DB-রাইট-শূন্য প্রমাণ (BASE → BASE) ③ ভিউয়ার =
#         testadmin/demo123 (requireAdmin) ④ **নেমস্পেস:** .msg105-*/.mn-*/.pill105-* পূর্ব-দখলকৃত
#         → ফিল্টার-প্রিফিক্স ms (সংঘর্ষ-মুক্ত — প্যাচ-পূর্ব FATAL-গার্ড) ⑤ অ্যাঙ্করড-চেক-প্রথা
#         (session264-গোটচা): URL-গ্রেপ '/admin/messages/?$'
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
MARKER='qa266msg-3917'

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → সিড → পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
J=/tmp/s266-ms-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s266-ms-page.html -w "%{http_code}" -b "$J" "$BASE/admin/messages")
if [ "$PC" = "200" ]; then ok "বার্তা-পৃষ্ঠা 200"; else bad "বার্তা-পৃষ্ঠা HTTP $PC"; fi
BASEN=$(grep -o 'data-ms-row="[0-9]*"' /tmp/s266-ms-page.html | wc -l)
if grep -q "$MARKER" /tmp/s266-ms-page.html; then
  SEEDED=0; ok "মার্কার-সারি পূর্ব-বিদ্যমান (পুনঃব্যবহার — idempotent)"
else
  SC=$(curl -s -o /tmp/s266-seed.json -w "%{http_code}" -X POST "$BASE/api/contact" -H "Content-Type: application/json" \
    --data "{\"name\":\"QA266 পরীক্ষক ${MARKER}\",\"email\":\"qa266msg3917@example.com\",\"subject\":\"প্রোব-বিষয় ${MARKER}\",\"message\":\"এটি s266-সুইটের সিড-বার্তা ${MARKER} — ফিল্টার-প্রোব-উৎস, পরে স্বয়ংক্রিয়-পরিষ্কার হবে।\"}")
  if [ "$SC" = "200" ]; then SEEDED=1; ok "প্রোডাকশন-ফ্লো-সিড (POST /api/contact → 200)"; else bad "সিড-ব্যর্থ (HTTP $SC)"; fi
  sleep 0.5
fi
PC=$(curl -s -o /tmp/s266-ms-page.html -w "%{http_code}" -b "$J" "$BASE/admin/messages")
ROWS=$(grep -o 'data-ms-row="[0-9]*"' /tmp/s266-ms-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s266-ms-page.html | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (রেন্ডার্ড-HTML-ই-সত্য)
MARKN=$(grep -o 'data-kw="[^"]*"' /tmp/s266-ms-page.html | grep -c "$MARKER" || true)
UNIVN=$(grep -o 'data-kw="[^"]*"' /tmp/s266-ms-page.html | grep -c 'বার্তা message' || true)
MAILN=$(grep -o 'data-kw="[^"]*"' /tmp/s266-ms-page.html | grep -c ' mail ' || true)
UNREADN=$(grep -o 'data-kw="[^"]*"' /tmp/s266-ms-page.html | grep -c 'অপঠিত unread' || true)
if [ "$ROWS" -ge 1 ] && [ "$MARKN" = "1" ]; then ok "সিড-সারফেস প্রস্তুত (মোট $ROWS, মার্কার ১)"; else bad "সিড-যাচাই-ব্যর্থ (rows=$ROWS mark=$MARKN)"; fi
if [ "$KW" -ge "$ROWS" ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-১: কাঠামো (ms266 স্ট্রিপ — টুলবার/বাল্ক/প্রিন্ট no-regression) ──"
contains "ms266-ইনপুট রেন্ডার" "$(cat /tmp/s266-ms-page.html)" 'id="msFilter266"'
contains "ms266-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s266-ms-page.html)" 'id="msCount266"'
contains "ms266-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s266-ms-page.html)" 'id="msClear266"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s266-ms-page.html)" 'ms-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-ms-empty)" "$(cat /tmp/s266-ms-page.html)" 'data-ms-empty'
contains "__msQA হুক উপস্থিত" "$(cat /tmp/s266-ms-page.html)" '__msQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s266-ms-page.html)" "ms.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s266-ms-page.html)" '<div class="ms-zero" id="msZero266" data-ms-empty hidden>'
containsF "no-regression: admin-header শিরোনাম" "$(cat /tmp/s266-ms-page.html)" 'যোগাযোগ বার্তা'
containsF "no-regression: স্ট্যাট-স্ট্রিপ" "$(cat /tmp/s266-ms-page.html)" 'ইনবক্সে মোট'
containsF "no-regression: ফিল্টার-পিল-সব" "$(cat /tmp/s266-ms-page.html)" 'class="pill105'
containsF "no-regression: q-সার্চ-ইনপুট" "$(cat /tmp/s266-ms-page.html)" 'name="q"'
containsF "no-regression: bulk-delete ফর্ম" "$(cat /tmp/s266-ms-page.html)" '/admin/messages/bulk-delete'
containsF "no-regression: data-bulk-all" "$(cat /tmp/s266-ms-page.html)" 'data-bulk-all'
containsF "no-regression: তালিকা-প্রিন্ট (msgPrintAll108)" "$(cat /tmp/s266-ms-page.html)" 'msgPrintAll108'
containsF "no-regression: msg-list105 ধারক" "$(cat /tmp/s266-ms-page.html)" 'msg-list105'
containsF "no-regression: inbox-meta105" "$(cat /tmp/s266-ms-page.html)" 'inbox-meta105'
containsF "no-regression: sidebar (পার্শিয়াল)" "$(cat /tmp/s266-ms-page.html)" 'admin-sidebar'
if [ "$ROWS" -ge 1 ]; then
  containsF "no-regression: read/unread প্রতি-কার্ড-ফর্ম" "$(cat /tmp/s266-ms-page.html)" '/read'
  containsF "no-regression: archive/unarchive প্রতি-কার্ড-ফর্ম" "$(cat /tmp/s266-ms-page.html)" '/archive'
  contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat /tmp/s266-ms-page.html)" 'data-kw="#[0-9]*'
else
  skip "প্রতি-কার্ড-ফর্ম-অ্যাসার্ট (সারফেস-শূন্য)"
fi
if [ "$UNIVN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'বার্তা message' (প্রতি-সারফেস $UNIVN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN rows=$ROWS)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MSCSS=$(sed -n '/session266 — যোগাযোগ-বার্তা/,/<\/style>/p' /tmp/s266-ms-page.html)
HEXN=$(echo "$MSCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "ms266-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ms266-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MSCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$MSCSS" '.ms-kbd-hint kbd'
contains "reduced-motion জোড়া" "$MSCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MSCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$MSCSS" '.ms-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-কার্ড (display:flex-ওভাররাইড !important)" "$MSCSS" '.msg105-card[data-ms-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$MSCSS" '.ms-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$MSCSS" '.ms-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম ms-স্কোপ)" "$MSCSS" '.ms-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/messages" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
# অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা — /admin/messages/export-বিরোধী-ও-নিরাপদ)
if echo "$PREURL" | grep -qE '/admin/messages/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/messages" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/messages খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/messages'
contains "__msQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও — session265-উন্নতি)" "$(ev 'typeof window.__msQA')" 'object'
T=$(ev 'window.__msQA.total()' | tr -d '"')
C=$(ev 'window.__msQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#msFilter266' "$MARKER" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__msQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ] && [ "$MARKN" = "1" ]; then ok "একক-প্রোব '$MARKER' → ১-মিল (সিড-স্বতন্ত্র)"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
  agent-browser fill '#msFilter266' ' mail ' >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__msQA.count()' | tr -d '"')
  if [ -n "$C2" ] && [ "$C2" = "$MAILN" ]; then ok "ইমেইল-প্রোব ' mail ' → পূর্বগণনা-মিল ($C2/$T)"; else bad "ইমেইল-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$MAILN)"; fi
  agent-browser fill '#msFilter266' 'অপঠিত unread' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__msQA.count()' | tr -d '"')
  if [ -n "$C3" ] && [ "$C3" = "$UNREADN" ]; then ok "স্ট্যাটাস-প্রোব 'অপঠিত unread' → পূর্বগণনা-মিল ($C3/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$UNREADN)"; fi
  CHIPV=$(ev 'document.getElementById("msCount266").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$UNREADN / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
else
  skip "ফিল্টার-প্রোব-ত্রয়ী (সিড-ব্যর্থ/সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi
agent-browser fill '#msFilter266' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__msQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-ms-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-ms-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — display:flex-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__msQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__msQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__msQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("msCount266")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "msFilter266" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=q]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));document.activeElement.tagName' | tr -d '"')
if [ "$FG" = "INPUT" ]; then ok "ফিল্ড-গার্ড: q-সার্চ-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("msFilter266").value="probe266";document.getElementById("msFilter266").dispatchEvent(new Event("input"));document.getElementById("msFilter266").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("msFilter266").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "msFilter266" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s266-msfilter-desk.png" >/dev/null 2>&1 && ok "s266-msfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s266-msfilter-mobile390.png" >/dev/null 2>&1 && ok "s266-msfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: স্বয়ং-নিরাময়ী ক্লিনার + নেট-রাইট-শূন্য-প্রমাণ ──"
MID=$(grep -o 'id="msg[0-9]*"[^>]*'"$MARKER" /tmp/s266-ms-page.html | head -1 | sed -E 's/id="msg([0-9]+)".*/\1/')
if [ -n "$MID" ] && [ "$SEEDED" = "1" ]; then
  DELRED=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/admin/messages/$MID/delete" --data-urlencode "_csrf=$TOK")
  TID=$(echo "$DELRED" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ]; then ok "সিড-সারি ট্র্যাশে (id=$MID → trashed=$TID)"; else bad "ট্র্যাশ-রিডাইরেক্ট-ব্যর্থ ($DELRED)"; fi
  T2=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PG=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$T2")
  if [ "$PG" = "302" ] || [ "$PG" = "303" ]; then ok "ট্র্যাশ-পার্জ (bulk-purge → $PG)"; else bad "পার্জ-ব্যর্থ (HTTP $PG)"; fi
  curl -s -b "$J" "$BASE/admin/messages" -o /tmp/s266-ms-after.html
  AFTER=$(grep -o 'data-ms-row="[0-9]*"' /tmp/s266-ms-after.html | wc -l)
  LEFT=$(grep -c "$MARKER" /tmp/s266-ms-after.html || true)
  if [ "$LEFT" = "0" ] && [ "$AFTER" = "$BASEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (সারফেস $BASEN → $AFTER, মার্কার-শূন্য)"; else bad "নেট-রাইট-ব্যর্থ (base=$BASEN after=$AFTER left=$LEFT)"; fi
elif [ "$SEEDED" = "0" ]; then
  skip "ক্লিনার (মার্কার-সারি পূর্ব-বিদ্যমান ছিল — স্পর্শ-নিষিদ্ধ)"
else
  bad "ক্লিনার-অসম্ভব (মার্কার-আইডি-শূন্য কিন্তু সিড-হয়েছিল)"
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
