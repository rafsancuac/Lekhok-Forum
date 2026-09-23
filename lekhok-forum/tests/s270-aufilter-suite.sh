#!/bin/bash
# s270-aufilter-suite.sh — session270 অডিট লগ (/admin/audit) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (au270 স্ট্রিপ + tr[data-au-row]/data-kw সারি-সারফেস + শূন্য-অবস্থা +
#          no-regression: q/action/from/to-ফর্ম / CSV-এক্সপোর্ট / পেজিনেশন / table-wrap /
#          thead / badge / code / sidebar / হেডার-সাবটাইটেল)
#          ② স্টাইল (au270-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__auQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; নির্ধারক-প্রোব পূর্বগণনা —
#          '#id'-একক-প্রোব (audit-row-id অনন্য) + 'অ্যাকশন action'-সর্বজনীন + actor/action/
#          টেবিল-প্রোব পূর্বগণনা-মিল; নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+
#          চিপ-display:none; 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব (select[name=action]-থেকে 'f' →
#          ফোকাস-চুরি-শূন্য); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **রিড-ওনলি-সারফেস (net-DB-write-শূন্য-by-design — mo268/session269-logs-অনুলিপি):**
#         অডিট-পৃষ্ঠা মিউটেশন-ছাড়া (create/update/delete-ফর্ম-নেই) → সিড-পথ-বাদ; প্রোব-প্রত্যাশা
#         রেন্ডার্ড-HTML-পূর্বগণনা; সুইটে মিউটেশন-POST-শূন্য (লগইন-POST ব্যতীত) ② ভিউয়ার =
#         testadmin/demo123 (requireAdmin) ③ **নেমস্পেস:** .au- প্রিফিক্স view+css-এ পূর্ব-শূন্য
#         (প্যাচ-FATAL-গার্ড) ④ অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা): '/admin/audit/?$' —
#         export.csv-সাবস্ট্রিং-সংঘর্ষ-নিরাপদ ⑤ eval-JSON-এস্কেপ-গ্রেপ (session267-গোটচা):
#         'h..:false'-এস্কেপ-সহনশীল ⑥ **লিমিট-সচেতন:** রুট-কোয়েরি-ছাড়া পেজ-১ = সর্বশেষ ৩০-এন্ট্রি
#         (PER42=30; filter-ব্রাঞ্চে LIMIT 300) — পূর্বগণনা রেন্ডার্ড-পেজ-ই-সত্য (সার্ভার-মোট-নয়)
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
J=/tmp/s270-au-jar.txt
PAGE=/tmp/s270-au-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/audit"; }

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → রিড-ওনলি-পৃষ্ঠা-সংগ্রহ + পূর্বগণনা) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi

PC=$(fetch_page)
if [ "$PC" = "200" ]; then ok "অডিট-পৃষ্ঠা 200"; else bad "অডিট-পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-au-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (রেন্ডার্ড-HTML-ই-সত্য — রিড-ওনলি সারফেস)
UNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'অ্যাকশন action' || true)
AUDN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'অডিট audit' || true)
IDP=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | grep -oE '#[0-9]+' | head -1)
IDN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "${IDP} " || true)
# actor-প্রোব: প্রথম-kw-থেকে 'actor ' ও ' অ্যাকশন'-এর-মাঝে
ACTOR=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | sed -n 's/.*actor \([^"]*\) অ্যাকশন action.*/\1/p' | awk '{print $1}')
ACTORN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "actor ${ACTOR} " || true)
DELN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'delete' || true)
STATN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'status' || true)
RESN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'টেবিল table resources' || true)
if [ "$PC" = "200" ] && [ "$ROWS" -ge 1 ]; then ok "অডিট-সারফেস প্রস্তুত ($ROWS এন্ট্রি — রিড-ওনলি)"; else bad "অডিট-সারফেস-খালি/ব্যর্থ (rows=$ROWS)"; fi
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ -n "$IDP" ] && [ "$IDN" = "1" ]; then ok "audit-row-id একক-প্রোব প্রস্তুত ($IDP — অনন্য)"; else bad "id-প্রোব-অনন্যতা-ব্যর্থ (probe=$IDP n=$IDN)"; fi
if [ "$UNIVN" = "$ROWS" ] && [ "$AUDN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'অ্যাকশন action'+'অডিট audit' (প্রতি-সারফেস $UNIVN/$AUDN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN aud=$AUDN rows=$ROWS)"; fi
if [ -n "$ACTOR" ] && [ "$ACTORN" -ge 1 ]; then ok "actor-প্রোব প্রস্তুত ($ACTOR → $ACTORN)"; else bad "actor-প্রোব-নিষ্কাশন-ব্যর্থ (actor=$ACTOR n=$ACTORN)"; fi

echo "── ধাপ-১: কাঠামো (au270 স্ট্রিপ — no-regression) ──"
contains "au270-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="auFilter270"'
contains "au270-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="auCount270"'
contains "au270-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="auClear270"'
contains "au-kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'au-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-au-empty)" "$(cat "$PAGE")" 'data-au-empty'
contains "__auQA হুক উপস্থিত" "$(cat "$PAGE")" '__auQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat "$PAGE")" "au.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="au-zero" id="auZero270" data-au-empty hidden>'
containsF "no-regression: q-সার্চ-ফর্ম" "$(cat "$PAGE")" 'name="q"'
containsF "no-regression: action-সিলেক্ট" "$(cat "$PAGE")" 'name="action"'
containsF "no-regression: from/to-তারিখ-ফর্ম" "$(cat "$PAGE")" 'name="from"'
containsF "no-regression: CSV-এক্সপোর্ট লিংক" "$(cat "$PAGE")" '/admin/audit/export.csv'
contains "no-regression: পেজিনেশন" "$(cat "$PAGE")" 'পেজ '
containsF "no-regression: table-wrap" "$(cat "$PAGE")" 'table-wrap'
containsF "no-regression: thead-কলাম-হেডার" "$(cat "$PAGE")" 'ব্যবহারকারী'
contains "no-regression: badge-অ্যাকশন-শ্রেণি" "$(cat "$PAGE")" 'class="badge"'
containsF "no-regression: হেডার-সাবটাইটেল (মোট-গণনা)" "$(cat "$PAGE")" 'subtitle'
contains "no-regression: au270-স্ট্রিপ always-rendered (empty-শাখা-সংলগ্ন — s267-প্রথা)" "$(cat "$PAGE")" 'au-instant'
containsF "EJS-শাখা-সংরক্ষণ: নো-ডেটা 'card empty' (সোর্স-স্তর — দ্বৈত-শূন্য-বক্স-চুক্তি s265)" "$(cat "$APP/admin/views/admin/audit.ejs")" 'class="empty"'
containsF "no-regression: sidebar (পার্শিয়াল-রেন্ডার)" "$(cat "$PAGE")" 'admin-sidebar'
if [ "$ROWS" -ge 1 ]; then
  contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat "$PAGE")" 'data-kw="#[0-9]*'
  contains "kw-এ টেবিল-কোড-প্রোব-উপস্থিত" "$(cat "$PAGE")" 'টেবিল table'
else
  skip "প্রতি-সারি-অ্যাসার্ট (সারফেস-শূন্য)"
fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
AUCSS=$(sed -n '/session270 — au270 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$PAGE")
HEXN=$(echo "$AUCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "au270-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "au270-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$AUCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$AUCSS" '.au-kbd-hint kbd'
contains "reduced-motion জোড়া" "$AUCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$AUCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$AUCSS" '.au-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr !important — সঠিক-বাইট)" "$AUCSS" 'tr[data-au-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$AUCSS" '.au-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$AUCSS" '.au-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম au-স্কোপ)" "$AUCSS" '.au-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/audit" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -qE '/admin/audit/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক — export.csv-নিরাপদ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/audit" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/audit খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/audit'
contains "__auQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__auQA')" 'object'
T=$(ev 'window.__auQA.total()' | tr -d '"')
C=$(ev 'window.__auQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#auFilter270' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__auQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "audit-row-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
  agent-browser fill '#auFilter270' "$ACTOR" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__auQA.count()' | tr -d '"')
  if [ -n "$C2" ] && [ "$C2" = "$ACTORN" ]; then ok "actor-প্রোব '$ACTOR' → পূর্বগণনা-মিল ($C2/$T)"; else bad "actor-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$ACTORN)"; fi
  if [ "$DELN" -ge 1 ]; then
    agent-browser fill '#auFilter270' 'delete' >/dev/null 2>&1; sleep 0.4
    C3=$(ev 'window.__auQA.count()' | tr -d '"')
    if [ -n "$C3" ] && [ "$C3" = "$DELN" ]; then ok "action-প্রোব 'delete' → পূর্বগণনা-মিল ($C3/$T)"; else bad "action-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$DELN)"; fi
  else
    skip "action-প্রোব 'delete' (রেন্ডার্ড-HTML-এ ০ — ডেটা-নির্ভর-skip-চুক্তি)"
  fi
  if [ "$RESN" -ge 1 ]; then
    agent-browser fill '#auFilter270' 'resources' >/dev/null 2>&1; sleep 0.4
    C4=$(ev 'window.__auQA.count()' | tr -d '"')
    if [ -n "$C4" ] && [ "$C4" = "$RESN" ]; then ok "টেবিল-প্রোব 'resources' → পূর্বগণনা-মিল ($C4/$T)"; else bad "টেবিল-প্রোব ব্যর্থ (got=$C4 প্রত্যাশা=$RESN)"; fi
  else
    skip "টেবিল-প্রোব 'resources' (রেন্ডার্ড-HTML-এ ০ — ডেটা-নির্ভর-skip-চুক্তি)"
  fi
  CHIPV=$(ev 'document.getElementById("auCount270").textContent' | tr -d '"')
  agent-browser fill '#auFilter270' 'অ্যাকশন action' >/dev/null 2>&1; sleep 0.4
  CHIPV=$(ev 'document.getElementById("auCount270").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("auCount270").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
else
  skip "ফিল্টার-প্রোব-চতুষ্টয় (সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi
agent-browser fill '#auFilter270' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__auQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-au-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-au-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__auQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__auQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__auQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("auCount270")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "auFilter270" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("select[name=action]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));document.activeElement.tagName' | tr -d '"')
if [ "$FG" = "SELECT" ]; then ok "ফিল্ড-গার্ড: action-select-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("auFilter270").value="probe270";document.getElementById("auFilter270").dispatchEvent(new Event("input"));document.getElementById("auFilter270").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("auFilter270").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "auFilter270" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s270-aufilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s270-aufilter-desk.png" ]; then ok "s270-aufilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s270-aufilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s270-aufilter-mobile390.png" ]; then ok "s270-aufilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি নেট-রাইট-শূন্য-প্রমাণ ──"
PC2=$(fetch_page)
ROWSA=$(grep -o 'data-au-row="[0-9]*"' "$PAGE" | wc -l)
if [ "$PC2" = "200" ] && [ "$ROWSA" = "$ROWS" ]; then
  ok "নেট-DB-রাইট-শূন্য প্রমাণ (রিড-ওনলি সারফেস $ROWS → $ROWSA)"
else
  bad "নেট-রাইট-প্রমাণ ব্যর্থ (http=$PC2 before=$ROWS after=$ROWSA)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
