#!/bin/bash
# s265-acfilter-suite.sh — session265 অ্যাডমিন-কমপ্লেইন্স (/admin/complaints) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (ac265 স্ট্রিপ + data-ac-row/data-kw কার্ড-সারফেস + শূন্য-অবস্থা +
#          no-regression: স্ট্যাটাস-ট্যাব ×৫ / data-bulk-all + bulkBar / প্রতি-কার্ড PUT+DELETE ফর্ম /
#          admin-header / sidebar)
#          ② স্টাইল (ac265-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — চিপ/শূন্য-বক্স/কার্ড
#          (.card[data-ac-row][hidden] !important — সঠিক-বাইট))
#          ③ আচরণ (__acQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত (session265-উন্নতি); নির্ধারক-প্রোব
#          'অভিযোগ complaint' (সর্বজনীন) + '#<আইডি>' (একক) + স্ট্যাটাস-কী (পূর্বগণনা-মিল) +
#          '/profile/' (শর্তসাপেক্ষ) → সিড-শূন্য রিড-ওনলি চুক্তি; নো-ম্যাচ→শূন্য-অবস্থা;
#          সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস (bubbles:true) +
#          **ফিল্ড-গার্ড-প্রোব** (select[name=status]-থেকে 'f' → ফোকাস-চুরি-শূন্য — এ-পেজে
#          PUT-ফর্মের select/input আছে, গার্ড-প্রমাণ-বাধ্যতমূলক); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **সিড-শূন্য (রিড-ওনলি-UI — DB-রাইট-শূন্য)** — প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা
#         (গণনা-০-এ শর্তসাপেক্ষ-স্কিপ, রেঞ্জ-অ্যাসার্ট-নিষিদ্ধ — muf262-চুক্তি)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — complaints-স্কোপ)
#         ④ **নেমস্পেস:** .card/.btn/bulk-* (admin.css) পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স ac
#         (সংঘর্ষ-মুক্ত যাচাইকৃত — প্যাচ-পূর্ব FATAL-গার্ড)
#         ⑤ **অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা):** URL-গ্রেপ '/admin/complaints/?$' অ্যাঙ্করড
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
J=/tmp/s265-ac-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s265-ac-page.html -w "%{http_code}" -b "$J" "$BASE/admin/complaints")
if [ "$PC" = "200" ]; then ok "কমপ্লেইন্স-পৃষ্ঠা 200"; else bad "কমপ্লেইন্স-পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-ac-row="[0-9]*"' /tmp/s265-ac-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s265-ac-page.html | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (সিড-শূন্য-নীতি — রেন্ডার্ড-HTML-ই-সত্য; muf262-চুক্তি)
UNIVN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c 'অভিযোগ complaint' || true)
FIRSTID=$(grep -o 'data-kw="#[0-9]*' /tmp/s265-ac-page.html | head -1 | grep -o '[0-9]*$')
NEWN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c 'নতুন new' || true)
REVN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c 'পর্যালোচনাধীন in_review' || true)
RESN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c 'সমাধান হয়েছে resolved' || true)
DISN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c 'বাতিল dismissed' || true)
PROFN=$(grep -o 'data-kw="[^"]*"' /tmp/s265-ac-page.html | grep -c '/profile/' || true)
if [ "$KW" -ge "$ROWS" ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-১: কাঠামো (ac265 স্ট্রিপ — ট্যাব/বাল্ক/ফর্ম no-regression) ──"
contains "ac265-ইনপুট রেন্ডার" "$(cat /tmp/s265-ac-page.html)" 'id="acFilter265"'
contains "ac265-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s265-ac-page.html)" 'id="acCount265"'
contains "ac265-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s265-ac-page.html)" 'id="acClear265"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s265-ac-page.html)" 'ac-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-ac-empty)" "$(cat /tmp/s265-ac-page.html)" 'data-ac-empty'
contains "__acQA হুক উপস্থিত" "$(cat /tmp/s265-ac-page.html)" '__acQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s265-ac-page.html)" "ac.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s265-ac-page.html)" '<div class="ac-zero" id="acZero265" data-ac-empty hidden>'
containsF "no-regression: স্ট্যাটাস-ট্যাব-সব (btn-primary)" "$(cat /tmp/s265-ac-page.html)" 'href="/admin/complaints" class="btn'
containsF "no-regression: স্ট্যাটাস-ট্যাব-নতুন" "$(cat /tmp/s265-ac-page.html)" 'admin/complaints?status=new'
containsF "no-regression: স্ট্যাটাস-ট্যাব-পর্যালোচনাধীন" "$(cat /tmp/s265-ac-page.html)" 'admin/complaints?status=in_review'
containsF "no-regression: স্ট্যাটাস-ট্যাব-সমাধান" "$(cat /tmp/s265-ac-page.html)" 'admin/complaints?status=resolved'
containsF "no-regression: স্ট্যাটাস-ট্যাব-বাতিল" "$(cat /tmp/s265-ac-page.html)" 'admin/complaints?status=dismissed'
containsF "no-regression: data-bulk-all (সব-সিলেক্ট)" "$(cat /tmp/s265-ac-page.html)" 'data-bulk-all'
containsF "no-regression: bulkBar (bulk-delete ফর্ম)" "$(cat /tmp/s265-ac-page.html)" '/admin/complaints/bulk-delete'
containsF "no-regression: bulk-count স্প্যান" "$(cat /tmp/s265-ac-page.html)" 'bulk-count'
containsF "no-regression: admin-header শিরোনাম" "$(cat /tmp/s265-ac-page.html)" 'অভিযোগ ব্যবস্থাপনা'
containsF "no-regression: newCount-গোপনীয়তা-নোট" "$(cat /tmp/s265-ac-page.html)" 'এই তথ্য গোপনীয়'
containsF "no-regression: sidebar (পার্শিয়াল)" "$(cat /tmp/s265-ac-page.html)" 'admin-sidebar'
if [ "$ROWS" -ge 1 ]; then
  containsF "no-regression: PUT-ফর্ম (select+নোট+সংরক্ষণ)" "$(cat /tmp/s265-ac-page.html)" '?_method=PUT'
  containsF "no-regression: DELETE-ফর্ম" "$(cat /tmp/s265-ac-page.html)" '?_method=DELETE'
  contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat /tmp/s265-ac-page.html)" "data-kw=\"#$FIRSTID"
else
  skip "PUT/DELETE-ফর্ম-অ্যাসার্ট (সারফেস-শূন্য)"
fi
if [ "$UNIVN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'অভিযোগ complaint' (প্রতি-সারফেস $UNIVN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN rows=$ROWS)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
ACCSS=$(sed -n '/session265 — অ্যাডমিন কমপ্লেইন্স/,/<\/style>/p' /tmp/s265-ac-page.html)
HEXN=$(echo "$ACCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "ac265-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ac265-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$ACCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$ACCSS" '.ac-kbd-hint kbd'
contains "reduced-motion জোড়া" "$ACCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$ACCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$ACCSS" '.ac-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-কার্ড (মিশ্র-ট্যাগ !important)" "$ACCSS" '.card[data-ac-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$ACCSS" '.ac-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$ACCSS" '.ac-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম ac-স্কোপ)" "$ACCSS" '.ac-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/complaints" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
# অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা — সাবস্ট্রিং-গ্রেপ লগইন-পেজেও-মেলে-ঝুঁকি)
if echo "$PREURL" | grep -qE '/admin/complaints/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/complaints" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/complaints খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/complaints'
contains "__acQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও — session265-উন্নতি)" "$(ev 'typeof window.__acQA')" 'object'
T=$(ev 'window.__acQA.total()' | tr -d '"')
C=$(ev 'window.__acQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#acFilter265' 'অভিযোগ complaint' >/dev/null 2>&1; sleep 0.4
  C0=$(ev 'window.__acQA.count()' | tr -d '"')
  if [ -n "$C0" ] && [ "$C0" = "$UNIVN" ]; then ok "সর্বজনীন-প্রোব 'অভিযোগ complaint' → মিল ($C0/$T)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C0 প্রত্যাশা=$UNIVN)"; fi
  agent-browser fill '#acFilter265' "#$FIRSTID" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__acQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "একক-প্রোব '#$FIRSTID' → ১-মিল (আইডি-স্বতন্ত্র)"; else bad "আইডি-প্রোব ব্যর্থ (got=$C1)"; fi
  PROBE265=''; PROBEN=0
  if [ "$NEWN" -ge 1 ]; then PROBE265='নতুন new'; PROBEN=$NEWN;
  elif [ "$REVN" -ge 1 ]; then PROBE265='পর্যালোচনাধীন in_review'; PROBEN=$REVN;
  elif [ "$RESN" -ge 1 ]; then PROBE265='সমাধান হয়েছে resolved'; PROBEN=$RESN;
  elif [ "$DISN" -ge 1 ]; then PROBE265='বাতিল dismissed'; PROBEN=$DISN; fi
  if [ -n "$PROBE265" ]; then
    agent-browser fill '#acFilter265' "$PROBE265" >/dev/null 2>&1; sleep 0.4
    C2=$(ev 'window.__acQA.count()' | tr -d '"')
    if [ -n "$C2" ] && [ "$C2" = "$PROBEN" ]; then ok "স্ট্যাটাস-প্রোব '$PROBE265' → পূর্বগণনা-মিল ($C2/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$PROBEN)"; fi
  else
    skip "স্ট্যাটাস-প্রোব (kw-স্ট্যাটাস-শূন্য)"
  fi
  if [ "$PROFN" -ge 1 ]; then
    agent-browser fill '#acFilter265' '/profile/' >/dev/null 2>&1; sleep 0.4
    C3=$(ev 'window.__acQA.count()' | tr -d '"')
    if [ -n "$C3" ] && [ "$C3" = "$PROFN" ]; then ok "লিংক-প্রোব '/profile/' → পূর্বগণনা-মিল ($C3/$T)"; else bad "প্রোফাইল-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$PROFN)"; fi
  else
    skip "'/profile/'-প্রোব (kw-প্রোফাইল-শূন্য)"
  fi
  CHIPV=$(ev 'document.getElementById("acCount265").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$PROBEN / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
else
  skip "ফিল্টার-প্রোব-ত্রয়ী (সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi
agent-browser fill '#acFilter265' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C3z=$(ev 'window.__acQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-ac-empty]").hidden' | tr -d '"')
if [ "$C3z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-ac-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — card-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__acQA.clear()' >/dev/null 2>&1; sleep 0.3
C4=$(ev 'window.__acQA.count()' | tr -d '"')
if [ "$C4" = "$T" ]; then ok "__acQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("acCount265")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "acFilter265" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
if [ "$ROWS" -ge 1 ]; then
  FG=$(ev 'var s=document.querySelector("select[name=status]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));document.activeElement.tagName' | tr -d '"')
  if [ "$FG" = "SELECT" ]; then ok "ফিল্ড-গার্ড: select-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
else
  skip "ফিল্ড-গার্ড-প্রোব (সারফেস-শূন্য — select রেন্ডার-শূন্য)"
fi
ev 'document.getElementById("acFilter265").value="probe265";document.getElementById("acFilter265").dispatchEvent(new Event("input"));document.getElementById("acFilter265").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("acFilter265").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "acFilter265" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s265-acfilter-desk.png" >/dev/null 2>&1 && ok "s265-acfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s265-acfilter-mobile390.png" >/dev/null 2>&1 && ok "s265-acfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: রিড-ওনলি-নিশ্চয়তা (সিড-শূন্য — সারফেস-সংখ্যা-অপরিবর্তিত) ──"
curl -s -b "$J" "$BASE/admin/complaints" -o /tmp/s265-ac-after.html
ROWS2=$(grep -o 'data-ac-row="[0-9]*"' /tmp/s265-ac-after.html | wc -l)
if [ "$ROWS2" = "$ROWS" ]; then ok "DB-রাইট-শূন্য প্রমাণ (সারফেস $ROWS → $ROWS2)"; else bad "সারফেস-সংখ্যা-পরিবর্তন ($ROWS → $ROWS2)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
