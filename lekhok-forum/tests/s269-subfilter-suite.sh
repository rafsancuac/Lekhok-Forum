#!/bin/bash
# s269-subfilter-suite.sh — session269 নিউজলেটার সাবস্ক্রাইবার (/admin/subscribers) দ্বৈত-সারফেস
# তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড): sb269 (subs টেবিল) + sl269 (logs টেবিল)
# কভারেজ: ① কাঠামো (sb/sl স্ট্রিপ + tr[data-sb-row]/tr[data-sl-row]/data-kw সারি-সারফেস +
#          শূন্য-অবস্থা ×২ + no-regression: stat-box ×৪ / মেইল-কার্ড / q-সার্চ / পেজিনেশন /
#          CSV-এক্সপোর্ট / bulk-bar / data-bulk-all / toggle+delete+retry-ফর্ম / sidebar / লগ-হেডার)
#          ② স্টাইল (session269-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ/শূন্য/সারি
#          (tr[data-sb-row][hidden], tr[data-sl-row][hidden] !important — সঠিক-বাইট))
#          ③ আচরণ (__sbQA + __slQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; নির্ধারক-প্রোব পূর্ণগণনা
#          (মার্কার-একক + 'সক্রিয় active' + 'ইমেইল email'-সর্বজনীন + logs 'বিজ্ঞপ্তি notice'/
#          'কিউতে queued'/'রেকর্ড log'); নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+চিপ-
#          display:none; 'f'-ফোকাস (একক-মালিকানা sb269 — sl ফোকাস-দ্বন্দ্ব-শূন্য-প্রমাণ) +
#          ফিল্ড-গার্ড-প্রোব (input[name=q]-থেকে 'f' → ফোকাস-চুরি-শূন্য); Escape ×২ স্বাধীন)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **দ্বৈত-সারফেস-সিড:** subs = পাবলিক POST /api/newsletter/subscribe (মার্কার
#         qa269sub-3917@example.com — রেট-লিমিট ৩/১০মি → মার্কার-উপস্থিত-হলে-পুনঃব্যবহার/POST-শূন্য;
#         429 → মার্কার-নির্ভর-প্রোব-skip) + লগস = সিড-পথ-নেই → **রিড-ওনলি-পূর্ণগণনা-চুক্তি**
#         (mo268-অনুলিপি — প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্ণগণনা) ② ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে +
#         স্বয়ং-নিরাময়ী ক্লিনার (delete → trashed=<tid> → /admin/trash/bulk-purge) → নেট-DB-রাইট-
#         শূন্য প্রমাণ (subs BASE → BASE; logs অস্পৃশ্ত) ③ ভিউয়ার = testadmin/demo123 (requireStaff;
#         isAdmin-শাখা — toggle/delete/retry-ফর্ম-দৃশ্যমান) ④ **নেমস্পেস:** .sb-/.sl- প্রিফিক্স
#         পূর্ব-শূন্য (প্যাচ-FATAL-গার্ড) ⑤ অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা):
#         '/admin/subscribers/?$' — সাবস্ট্রিং '/admin/subscribers/export'-সংঘর্ষ-নিরাপদ
#         ⑥ eval-JSON-এস্কেপ-গ্রেপ (session267-গোটচা): 'h..:false'-এস্কেপ-সহনশীল
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
MARKER='qa269sub-3917@example.com'
J=/tmp/s269-sb-jar.txt
PAGE=/tmp/s269-sb-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/subscribers"; }
marker_ids(){ grep -oE 'data-kw="#[0-9]+ [^"]*qa269sub-3917' "$PAGE" | grep -oE '#[0-9]+' | tr -d '#' | sort -u; }
# ক্র্যাশ-অবশেষ-ক্লিনার + টার্মিনাল-ক্লিনার: সব-মার্কার-সারি delete → trashed → bulk-purge
clean_marker(){
  fetch_page >/dev/null
  local IDS TID PURGEBODY=""
  IDS=$(marker_ids)
  [ -z "$IDS" ] && return 0
  for id in $IDS; do
    RD=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -X POST "$BASE/admin/subscribers/$id/delete")
    TID=$(echo "$RD" | grep -oE 'trashed=[0-9]+' | grep -oE '[0-9]+')
    [ -n "$TID" ] && PURGEBODY="$PURGEBODY&ids=$TID"
  done
  if [ -n "$PURGEBODY" ]; then
    curl -s -o /dev/null -b "$J" -X POST "$BASE/admin/trash/bulk-purge" --data "${PURGEBODY#&}"
  fi
  fetch_page >/dev/null
  return 0
}

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → ক্লিনার → সিড → পূর্ণগণনা) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi

clean_marker
PC=$(fetch_page)
if [ "$PC" = "200" ]; then ok "সাবস্ক্রাইবার-পৃষ্ঠা 200"; else bad "সাবস্ক্রাইবার-পৃষ্ঠা HTTP $PC"; fi
BASEN=$(grep -o 'data-sb-row="[0-9]*"' "$PAGE" | wc -l)
BASEL=$(grep -o 'data-sl-row="[0-9]*"' "$PAGE" | wc -l)
# সিড — পাবলিক POST /api/newsletter/subscribe (মার্কার-অনুপস্থিত-হলে-ই POST; রেট-লিমিট-সচেতন)
# গোটচা (session269-নতুন): পাবলিক-এন্ডপয়েন্ট-ও CSRF-গার্ডেড (server.js csrf57) — admin-jar ($J,
# /admin/login-GET-এ _csrfTok-কুকি-স্থাপিত) + x-csrf-token-হেডার (login-পেজ-meta-টোকেন) বাধ্যতমূলক।
# ⚠ হোমপেজ '/' ক্যাশেবল-পাবলিক-GET (session72) — কুকি-স্কিপ → সে-জার-দিয়ে-সিড → 303-ব্লক!
SEEDSKIP=0
if ! grep -q "$MARKER" "$PAGE"; then
  SC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/api/newsletter/subscribe" \
    -H "x-csrf-token: $TOK" \
    --data-urlencode "email=$MARKER" --data-urlencode "name=qa269name-3917")
  if [ "$SC" = "200" ]; then
    ok "পাবলিক-ফর্ম-সিড (POST /api/newsletter/subscribe → 200)"
    sleep 0.4
    fetch_page >/dev/null
  elif [ "$SC" = "429" ]; then
    SEEDSKIP=1
    skip "সিড-POST রেট-লিমিটেড (429) — মার্কার-নির্ভর-প্রোব-skip (ডেটা-নির্ভর-skip-চুক্তি)"
    fetch_page >/dev/null
  else
    SEEDSKIP=1
    bad "সিড-ব্যর্থ (HTTP $SC)"
    fetch_page >/dev/null
  fi
else
  ok "মার্কার-সারি পূর্ব-বিদ্যমান (পুনঃব্যবহার — idempotent, POST-শূন্য)"
fi
ROWS=$(grep -o 'data-sb-row="[0-9]*"' "$PAGE" | wc -l)
LROWS=$(grep -o 'data-sl-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্ণগণনা (রেন্ডার্ড-HTML-ই-সত্য — subs=সিড-পরে, logs=রিড-ওনলি)
MARKN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c "$MARKER" || true)
ACTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'সক্রিয় active' || true)
INACTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'বাতিল inactive' || true)
UNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'ইমেইল email' || true)
LNOTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'বিজ্ঞপ্তি notice' || true)
LPOSTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'লেখা post' || true)
LUNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'রেকর্ড log' || true)
QUEUEN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'কিউতে queued' || true)
if [ "$SEEDSKIP" = "1" ] && [ "$ROWS" = "0" ]; then
  skip "সিড-নিশ্চিত (রেট-লিমিট 429 — মার্কার-নির্ভর-অ্যাসার্ট-স্কিপ, ডেটা-নির্ভর-skip-চুক্তি)"
elif [ "$ROWS" -ge 1 ] && [ "$MARKN" = "1" ]; then ok "সিড-সারফেস প্রস্তুত (subs $BASEN→$ROWS, মার্কার ১)"; else bad "সিড-যাচাই-ব্যর্থ (rows=$ROWS mark=$MARKN seedskip=$SEEDSKIP)"; fi
if [ "$SEEDSKIP" = "1" ] && [ $((ROWS + LROWS)) = "0" ]; then
  skip "সারফেস-সমতুল্য data-kw কভারেজ (রেট-লিমিট-স্কিপ — দুই-সারফেস-ই-শূন্য)"
elif [ "$KW" -ge $((ROWS + LROWS)) ] && [ $((ROWS + LROWS)) -ge 1 ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ (subs=$ROWS logs=$LROWS)"; else bad "সারফেস/kw-বেমান (kw=$KW rows=$ROWS+$LROWS)"; fi
if [ "$ROWS" = "0" ]; then
  skip "স্ট্যাটাস-অ্যালায়াস-সামঞ্জস্য (সারফেস-শূন্য)"
elif [ $((ACTN + INACTN)) = "$ROWS" ]; then ok "স্ট্যাটাস-অ্যালায়াস-সামঞ্জস্য (active $ACTN + inactive $INACTN = $ROWS)"; else bad "স্ট্যাটাস-সামঞ্জস্য-ব্যর্থ (a=$ACTN i=$INACTN r=$ROWS)"; fi
if [ "$LUNIVN" = "$LROWS" ]; then ok "logs-সর্বজনীন-অ্যালায়াস 'রেকর্ড log' ($LUNIVN/$LROWS)"; else bad "logs-সর্বজনীন-অ্যালায়াস ব্যর্থ ($LUNIVN/$LROWS)"; fi
if [ $((LNOTN + LPOSTN)) = "$LROWS" ]; then ok "logs-ধরন-অ্যালায়াস-সামঞ্জস্য (notice $LNOTN + post $LPOSTN = $LROWS)"; else bad "logs-ধরন-সামঞ্জস্য-ব্যর্থ (n=$LNOTN p=$LPOSTN l=$LROWS)"; fi

echo "── ধাপ-১: কাঠামো (sb269 + sl269 স্ট্রিপ — no-regression) ──"
contains "sb269-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="sbFilter269"'
contains "sb269-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="sbCount269"'
contains "sb269-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="sbClear269"'
contains "sb-kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'sb-kbd-hint'
contains "sb-শূন্য-অবস্থা বক্স (data-sb-empty)" "$(cat "$PAGE")" 'data-sb-empty'
contains "__sbQA হুক উপস্থিত" "$(cat "$PAGE")" '__sbQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ — sb269-একক-মালিকানা)" "$(cat "$PAGE")" "sb.key !== 'f'"
containsF "sb-শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="sb-zero" id="sbZero269" data-sb-empty hidden>'
contains "sl269-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="slFilter269"'
contains "sl269-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="slCount269"'
contains "sl269-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="slClear269"'
contains "sl-kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'sl-kbd-hint'
contains "sl-শূন্য-অবস্থা বক্স (data-sl-empty)" "$(cat "$PAGE")" 'data-sl-empty'
contains "__slQA হুক উপস্থিত" "$(cat "$PAGE")" '__slQA'
containsF "sl-শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="sl-zero" id="slZero269" data-sl-empty hidden>'
containsF "no-regression: stat-box ×৪" "$(cat "$PAGE")" 'stat-box'
contains "no-regression: মেইল-কনফিগ-কার্ড" "$(cat "$PAGE")" 'ইমেইল সার্ভিস'
contains "no-regression: q-সার্চ-ফর্ম" "$(cat "$PAGE")" 'name="q"'
contains "no-regression: পেজিনেশন" "$(cat "$PAGE")" 'পেজ '
contains "no-regression: CSV-এক্সপোর্ট লিংক" "$(cat "$PAGE")" '/admin/subscribers/export'
contains "no-regression: নোটিফিকেশন-রেকর্ড হেডার" "$(cat "$PAGE")" 'ইমেইল নোটিফিকেশন রেকর্ড'
containsF "no-regression: sidebar (পার্শিয়াল-রেন্ডার)" "$(cat "$PAGE")" 'admin-sidebar'
containsF "no-regression: sb269-স্ট্রিপ always-rendered (empty-শাখা-সংলগ্ন — s267-প্রথা)" "$(cat "$PAGE")" 'sb-instant'
containsF "no-regression: sl269-স্ট্রিপ always-rendered" "$(cat "$PAGE")" 'sl-instant'
containsF "EJS-শাখা-সংরক্ষণ: নো-ডেটা 'card empty' ×২ (সোর্স-স্তর — দ্বৈত-শূন্য-বক্স-চুক্তি s265)" "$(cat "$APP/admin/views/admin/subscribers.ejs")" 'card empty'
if [ "$ROWS" -ge 1 ]; then
  contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat "$PAGE")" 'data-kw="#[0-9]*'
  contains "no-regression: toggle-ফর্ম (isAdmin-শাখা)" "$(cat "$PAGE")" '/toggle'
  contains "no-regression: delete-ফর্ম" "$(cat "$PAGE")" '/delete'
  contains "no-regression: bulk-bar" "$(cat "$PAGE")" 'bulk-bar'
  BN=$(grep -oF 'type="checkbox" data-bulk-all' "$PAGE" | wc -l)
  if [ "$BN" = "2" ]; then ok "no-regression: data-bulk-all checkbox ×২ (JS-রেফারেন্স-বাদ — রেন্ডার্ড-গণনা ৪ = ২-checkbox + ২-JS)"; else bad "data-bulk-all checkbox বেমান ($BN/2)"; fi
else
  skip "প্রতি-সারি-অ্যাসার্ট (সারফেস-শূন্য — সিড-ব্যর্থ/স্কিপ)"
fi
if [ "$ROWS" = "0" ]; then
  skip "সর্বজনীন-অ্যালায়াস 'ইমেইল email' (সারফেস-শূন্য)"
elif [ "$UNIVN" = "$ROWS" ]; then ok "সর্বজনীন-অ্যালায়াস 'ইমেইল email' (প্রতি-সারফেস $UNIVN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN rows=$ROWS)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
SBCSS=$(sed -n '/session269 — sb269\/sl269 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$PAGE")
HEXN=$(echo "$SBCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "session269-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "session269-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$SBCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$SBCSS" '.sb-kbd-hint kbd'
contains "reduced-motion জোড়া" "$SBCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$SBCSS" '@media (max-width: 640px)'
containsF "ফিল্টার-ফিডব্যাখ (:active scale — দ্বৈত-সিলেক্টর)" "$SBCSS" '.sb-instant-clear:active, .sl-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr !important — সঠিক-বাইট, দ্বৈত)" "$SBCSS" 'tr[data-sb-row][hidden], tr[data-sl-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ (দ্বৈত)" "$SBCSS" '.sb-count-chip[hidden], .sl-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স (দ্বৈত)" "$SBCSS" '.sb-zero[hidden], .sl-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (sb+sl-স্কোপ — দ্বৈত-সিলেক্টর)" "$SBCSS" '.sb-instant, .sl-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/subscribers" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -qE '/admin/subscribers/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক — export-সাবস্ট্রিং-নিরাপদ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/subscribers" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/subscribers খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/subscribers'
contains "__sbQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__sbQA')" 'object'
contains "__slQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__slQA')" 'object'
T=$(ev 'window.__sbQA.total()' | tr -d '"')
C=$(ev 'window.__sbQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "sb প্রাথমিক count==total==ROWS ($C)"; else bad "sb প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
LT=$(ev 'window.__slQA.total()' | tr -d '"')
LC2=$(ev 'window.__slQA.count()' | tr -d '"')
if [ -n "$LT" ] && [ "$LT" = "$LC2" ] && [ "$LT" = "$LROWS" ]; then ok "sl প্রাথমিক count==total==LROWS ($LT)"; else bad "sl প্রাথমিক বেমান (total=$LT count=$LC2 lrows=$LROWS)"; fi
if [ "$ROWS" -ge 1 ] && [ "$SEEDSKIP" = "0" ]; then
  agent-browser fill '#sbFilter269' "$MARKER" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__sbQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "মার্কার-একক-প্রোব → ১-মিল (ইমেইল-স্বতন্ত্র)"; else bad "মার্কার-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
  agent-browser fill '#sbFilter269' 'সক্রিয় active' >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__sbQA.count()' | tr -d '"')
  if [ -n "$C2" ] && [ "$C2" = "$ACTN" ]; then ok "স্ট্যাটাস-প্রোব 'সক্রিয় active' → পূর্ণগণনা-মিল ($C2/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$ACTN)"; fi
  CHIPV=$(ev 'document.getElementById("sbCount269").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$ACTN / $T"; then ok "sb কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "sb চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("sbCount269").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "sb চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "sb চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
else
  skip "sb ফিল্টার-মার্কার/স্ট্যাটাস-প্রোব (সিড-স্কিপ/সারফেস-শূন্য)"
fi
if [ "$LROWS" -ge 1 ]; then
  if [ "$LNOTN" -ge 1 ]; then
    agent-browser fill '#slFilter269' 'বিজ্ঞপ্তি notice' >/dev/null 2>&1; sleep 0.4
    L1=$(ev 'window.__slQA.count()' | tr -d '"')
    if [ -n "$L1" ] && [ "$L1" = "$LNOTN" ]; then ok "sl ধরন-প্রোব 'বিজ্ঞপ্তি notice' → পূর্ণগণনা-মিল ($L1/$LT)"; else bad "sl ধরন-প্রোব ব্যর্থ (got=$L1 প্রত্যাশা=$LNOTN)"; fi
  else
    skip "sl ধরন-প্রোব 'বিজ্ঞপ্তি notice' (রেন্ডার্ড-HTML-এ ০ — ডেটা-নির্ভর-skip-চুক্তি)"
  fi
  if [ "$QUEUEN" -ge 1 ]; then
    agent-browser fill '#slFilter269' 'কিউতে queued' >/dev/null 2>&1; sleep 0.4
    L2=$(ev 'window.__slQA.count()' | tr -d '"')
    if [ -n "$L2" ] && [ "$L2" = "$QUEUEN" ]; then ok "sl কিউ-প্রোব 'কিউতে queued' → পূর্ণগণনা-মিল ($L2/$LT)"; else bad "sl কিউ-প্রোব ব্যর্থ (got=$L2 প্রত্যাশা=$QUEUEN)"; fi
  else
    skip "sl কিউ-প্রোব (রেন্ডার্ড-HTML-এ ০ — ডেটা-নির্ভর-skip-চুক্তি)"
  fi
else
  skip "sl ফিল্টার-প্রোব (logs-সারফেস-শূন্য — রিড-ওনলি-পূর্ণগণনা-চুক্তি, সিড-পথ-নেই)"
fi
agent-browser fill '#sbFilter269' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__sbQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-sb-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "sb নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "sb শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-sb-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "sb নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "sb hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "sb সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__sbQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__sbQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__sbQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "sb clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("sbCount269")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "sb clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "sb কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
agent-browser fill '#slFilter269' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
L4z=$(ev 'window.__slQA.count()' | tr -d '"')
LEMP=$(ev 'document.querySelector("[data-sl-empty]").hidden' | tr -d '"')
if [ "$L4z" = "0" ] && [ "$LEMP" = "false" ]; then ok "sl নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "sl শূন্য-অবস্থা ব্যর্থ (count=$L4z emptyHidden=$LEMP)"; fi
if [ "$LROWS" -ge 1 ]; then
  LHID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-sl-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$LHID" = "$LT" ]; then ok "sl নো-ম্যাচে সব-সারফেস hidden ($LHID/$LT — tr-গার্ড-প্রমাণ)"; else bad "sl hidden-গণনা ব্যর্থ (got=$LHID)"; fi
else
  skip "sl সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__slQA.clear()' >/dev/null 2>&1; sleep 0.3
L5=$(ev 'window.__slQA.count()' | tr -d '"')
if [ "$L5" = "$LT" ]; then ok "__slQA.clear() → পুনরুদ্ধার ($LT সারফেস)"; else bad "sl clear-পুনরুদ্ধার ব্যর্থ (got=$L5)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "sbFilter269" ]; then ok "'f'-কী → sb269-ফিল্টার-ফোকাস (একক-মালিকানা)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
AEs=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AEs" != "slFilter269" ]; then ok "fokus-দ্বন্দ্ব-শূন্য (sl269-ফোকাস-চুরি-নেই — দ্বৈত-সারফেস-চুক্তি)"; else bad "fokus-দ্বন্দ্ব: sl269 ফোকাস-চুরি করেছে"; fi
FG=$(ev 'var s=document.querySelector("input[name=q]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));document.activeElement===s' | tr -d '"')
if echo "$FG" | grep -qi 'true'; then ok "ফিল্ড-গার্ড: q-সার্চ-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (got=$FG)"; fi
ev 'document.getElementById("sbFilter269").value="probe269";document.getElementById("sbFilter269").dispatchEvent(new Event("input"));document.getElementById("sbFilter269").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("sbFilter269").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "sbFilter269" ]; then ok "sb Escape → মান-শূন্য + ব্লার"; else bad "sb Escape ব্যর্থ (value=$EV active=$AE2)"; fi
ev 'document.getElementById("slFilter269").value="probe269";document.getElementById("slFilter269").dispatchEvent(new Event("input"));document.getElementById("slFilter269").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV2=$(ev 'document.getElementById("slFilter269").value' | tr -d '"')
if [ -z "$EV2" ]; then ok "sl Escape স্বাধীন-কার্যকর (মান-শূন্য)"; else bad "sl Escape ব্যর্থ (value=$EV2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s269-subfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s269-subfilter-desk.png" ]; then ok "s269-subfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s269-subfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s269-subfilter-mobile390.png" ]; then ok "s269-subfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: ক্লিনার + নেট-রাইট-শূন্য-প্রমাণ ──"
clean_marker
PC2=$(fetch_page)
ROWSA=$(grep -o 'data-sb-row="[0-9]*"' "$PAGE" | wc -l)
LROWSA=$(grep -o 'data-sl-row="[0-9]*"' "$PAGE" | wc -l)
MARKA=$(grep -c "$MARKER" "$PAGE" || true)
if [ "$PC2" = "200" ] && [ "$ROWSA" = "$BASEN" ]; then
  ok "subs নেট-DB-রাইট-শূন্য প্রমাণ (BASE $BASEN → $ROWSA — ক্লিনার-পরে)"
else
  bad "subs নেট-রাইট-প্রমাণ ব্যর্থ (http=$PC2 before=$BASEN after=$ROWSA)"
fi
if [ "$MARKA" = "0" ]; then ok "মার্কার-সম্পূর্ণ-পরিষ্কার (trashed+purge)"; else bad "মার্কার-অবশেষ ($MARKA)"; fi
if [ "$LROWSA" = "$BASEL" ]; then
  ok "logs অস্পৃশ্ত-প্রমাণ (রিড-ওনলি সারফেস $BASEL → $LROWSA)"
else
  bad "logs অস্পৃশ্ত-প্রমাণ ব্যর্থ (before=$BASEL after=$LROWSA)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
