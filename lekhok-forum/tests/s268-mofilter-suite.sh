#!/bin/bash
# s268-mofilter-suite.sh — session268 মডারেটর ব্যবস্থাপনা (/admin/moderators) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (mo268 স্ট্রিপ + tr[data-mo-row]/data-kw সারি-সারফেস + শূন্য-অবস্থা +
#          no-regression: person-card কর্মী-তালিকা / role-ফর্ম / scopes-ফর্ম / scope-toggle /
#          header-চিপ ×২ / section-head / empty-state-full / sidebar / status-select / count-pill)
#          ② স্টাইল (mo268-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ/শূন্য-বক্স/সারি
#          (tr[data-mo-row][hidden] !important — সঠিক-বাইট))
#          ③ আচরণ (__moQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; নির্ধারক-প্রোব পূর্বগণনা — ইউজারনেম-
#          একক-প্রোব + 'মডারেটর moderator' (রোল) + 'সক্রিয় active' (স্ট্যাটাস) → রেন্ডার্ড-HTML-
#          পূর্বগণনা-মিল; নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none;
#          'f'-ফোকাস (bubbles:true) + ফিল্ড-গার্ড-প্রোব (select[name=status]-থেকে 'f' → ফোকাস-চুরি-
#          শূন্য); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **রিড-ওনলি-সারফেস (net-DB-write-শূন্য-by-design):** ইউজার-তালিকা মিউটেশন-ছাড়া —
#         প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা (adf264-প্রথা); সুইটে কোনো POST-মিউটেশন-নেই
#         (লগইন-POST ব্যতীত) ② ভিউয়ার = testadmin/demo123 (requireAdmin) ③ **নেমস্পেস:**
#         .mo- প্রিফিক্স admin.css/tokens.css-এ শূন্য (প্যাচ-FATAL-গার্ড) ④ অ্যাঙ্করড-চেক-প্রথা
#         (session264-গোটচা): URL-গ্রেপ '/admin/moderators/?$' ⑤ eval-JSON-এস্কেপ-গ্রেপ
#         (session267-গোটচা): JSON.stringify-আউটপুট এস্কেপ-সহনশীল 'h..:false'
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
J=/tmp/s268-mo-jar.txt
PAGE=/tmp/s268-mo-page.html

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → রিড-ওনলি-পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi

PC=$(curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/moderators")
if [ "$PC" = "200" ]; then ok "মডারেটর-পৃষ্ঠা 200"; else bad "মডারেটর-পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-mo-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (রেন্ডার্ড-HTML-ই-সত্য — রিড-ওনলি সারফেস)
UPROBE=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | grep -oE '@[a-zA-Z0-9_-]+' | head -1)
UN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "$UPROBE" || true)
MODN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'মডারেটর moderator' || true)
ACTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'সক্রিয় active' || true)
UNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'ইউজার user' || true)
if [ "$KW" -ge "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ -n "$UPROBE" ] && [ "$UN" = "1" ]; then ok "ইউজারনেম-একক-প্রোব প্রস্তুত ($UPROBE)"; else bad "ইউজারনেম-প্রোব-অনন্যতা-ব্যর্থ (probe=$UPROBE n=$UN)"; fi

echo "── ধাপ-১: কাঠামো (mo268 স্ট্রিপ — no-regression) ──"
contains "mo268-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="moFilter268"'
contains "mo268-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="moCount268"'
contains "mo268-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="moClear268"'
contains "kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'mo-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-mo-empty)" "$(cat "$PAGE")" 'data-mo-empty'
contains "__moQA হুক উপস্থিত" "$(cat "$PAGE")" '__moQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat "$PAGE")" "mo.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="mo-zero" id="moZero268" data-mo-empty hidden>'
containsF "no-regression: কর্মী-কার্ড (person-card)" "$(cat "$PAGE")" 'person-card'
containsF "no-regression: role-ফর্ম" "$(cat "$PAGE")" '/role'
containsF "no-regression: scopes-ফর্ম" "$(cat "$PAGE")" '/scopes'
containsF "no-regression: scope-toggle গ্রিড" "$(cat "$PAGE")" 'scope-toggle'
containsF "no-regression: header কর্মী-চিপ" "$(cat "$PAGE")" 'কর্মী'
containsF "no-regression: section-head (সব ইউজার)" "$(cat "$PAGE")" 'সব ইউজার'
containsF "no-regression: mo268-স্ট্রিপ always-rendered (empty-শাখা-সংলগ্ন — s267-প্রথা)" "$(cat "$PAGE")" 'mo-instant'
containsF "no-regression: empty-state-full EJS-শাখা-সংরক্ষণ (সোর্স-স্তর)" "$(cat "$APP/admin/views/admin/moderators.ejs")" 'empty-state-full'
containsF "no-regression: sidebar (পার্শিয়াল)" "$(cat "$PAGE")" 'admin-sidebar'
containsF "no-regression: status-select ফর্ম" "$(cat "$PAGE")" 'name="status"'
containsF "no-regression: count-pill" "$(cat "$PAGE")" 'count-pill'
if [ "$ROWS" -ge 1 ]; then
  contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat "$PAGE")" 'data-kw="#[0-9]*'
else
  skip "প্রতি-সারি-অ্যাসার্ট (সারফেস-শূন্য)"
fi
if [ "$UNIVN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'ইউজার user' (প্রতি-সারফেস $UNIVN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN rows=$ROWS)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MOCSS=$(sed -n '/session268 — mo268 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$PAGE")
HEXN=$(echo "$MOCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "mo268-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "mo268-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MOCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$MOCSS" '.mo-kbd-hint kbd'
contains "reduced-motion জোড়া" "$MOCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MOCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$MOCSS" '.mo-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr !important — সঠিক-বাইট)" "$MOCSS" 'tr[data-mo-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$MOCSS" '.mo-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$MOCSS" '.mo-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম mo-স্কোপ)" "$MOCSS" '.mo-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/moderators" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -qE '/admin/moderators/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/moderators" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/moderators খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/moderators'
contains "__moQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__moQA')" 'object'
T=$(ev 'window.__moQA.total()' | tr -d '"')
C=$(ev 'window.__moQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#moFilter268' "$UPROBE" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__moQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "একক-প্রোব '$UPROBE' → ১-মিল (ইউজারনেম-স্বতন্ত্র)"; else bad "ইউজারনেম-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
  agent-browser fill '#moFilter268' 'মডারেটর moderator' >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__moQA.count()' | tr -d '"')
  if [ -n "$C2" ] && [ "$C2" = "$MODN" ]; then ok "রোল-প্রোব 'মডারেটর moderator' → পূর্বগণনা-মিল ($C2/$T)"; else bad "রোল-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$MODN)"; fi
  agent-browser fill '#moFilter268' 'সক্রিয় active' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__moQA.count()' | tr -d '"')
  if [ -n "$C3" ] && [ "$C3" = "$ACTN" ]; then ok "স্ট্যাটাস-প্রোব 'সক্রিয় active' → পূর্বগণনা-মিল ($C3/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$ACTN)"; fi
  CHIPV=$(ev 'document.getElementById("moCount268").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$ACTN / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("moCount268").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
else
  skip "ফিল্টার-প্রোব-ত্রয়ী (সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi
agent-browser fill '#moFilter268' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__moQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-mo-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-mo-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__moQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__moQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__moQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("moCount268")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "moFilter268" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("select[name=status]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));document.activeElement.tagName' | tr -d '"')
if [ "$FG" = "SELECT" ]; then ok "ফিল্ড-গার্ড: status-select-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("moFilter268").value="probe268";document.getElementById("moFilter268").dispatchEvent(new Event("input"));document.getElementById("moFilter268").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("moFilter268").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "moFilter268" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s268-mofilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s268-mofilter-desk.png" ]; then ok "s268-mofilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s268-mofilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s268-mofilter-mobile390.png" ]; then ok "s268-mofilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি নেট-রাইট-শূন্য-প্রমাণ ──"
PC2=$(curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/moderators")
ROWSA=$(grep -o 'data-mo-row="[0-9]*"' "$PAGE" | wc -l)
if [ "$PC2" = "200" ] && [ "$ROWSA" = "$ROWS" ]; then
  ok "নেট-DB-রাইট-শূন্য প্রমাণ (রিড-ওনলি সারফেস $ROWS → $ROWSA)"
else
  bad "নেট-রাইট-প্রমাণ ব্যর্থ (http=$PC2 before=$ROWS after=$ROWSA)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
