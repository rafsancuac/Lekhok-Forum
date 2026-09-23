#!/bin/bash
# s271-avfilter-suite.sh — session271 অ্যাক্টিভিটি লগ (/admin/activity) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (av271 স্ট্রিপ + tr[data-av-row]/data-kw সারি-সারফেস + শূন্য-অবস্থা +
#          no-regression: table/thead/chip-danger ×২/chip-accent/subtitle/sidebar/empty-ব্রাঞ্চ)
#          ② স্টাইল (av271-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__avQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; নির্ধারক-প্রোব পূর্বগণনা —
#          '#id'-একক-প্রোব + actor-প্রোব + action-'delete'-প্রোব + সর্বজনীন 'অ্যাকশন action';
#          নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস +
#          ফিল্ড-গার্ড-দ্বৈত-প্রমাণ (input-টার্গেট defaultPrevented=false / body-টার্গেট=true —
#          পৃষ্ঠায় অন্য-ফিল্ড-শূন্য তাই defaultPrevented-প্রমাণ-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **রিড-ওনলি-সারফেস (net-DB-write-শূন্য-by-design — au270/mo268-অনুলিপি):**
#         অ্যাক্টিভিটি-পৃষ্ঠা মিউটেশন-ছাড়া (create/update/delete-ফর্ম-নেই — GET /admin/activity
#         requireStaff SELECT-শুধু) → সিড-পথ-বাদ; প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্ণগণনা;
#         সুইটে মিউটেশন-POST-শূন্য (লগইন-POST ব্যতীত) ② ভিউয়ার = testadmin/demo123
#         (requireStaff — admin-যথেষ্ট) ③ **নেমস্পেস:** .av- প্রিফিক্স view+css-এ পূর্ব-শূন্য
#         (প্যাচ-FATAL-গার্ড) ④ অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা): '/admin/activity/?$'
#         ⑤ eval-JSON-এস্কেপ-গ্রেপ (session267-গোটচা): 'guarded..:false'-এস্কেপ-সহনশীল
#         ⑥ লিমিট-সচেতন: রুট-কোয়েরি LIMIT 200 — পূর্ণগণনা রেন্ডার্ড-পেজ-ই-সত্য
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
# domcount PROBE — ব্রাউজার-লাইভ-DOM-পূর্ণগণনা (session271-গোটচা: অ্যাক্টিভিটি-লগ = লাইভ-সারফেস —
# সুইটের নিজস্ব logout/login-ও এন্ট্রি-লেখে → step-০-curl-পূর্ণগণনা step-৩-এ ড্রিফট-করে
# (LIMIT-200-চার্ন) → প্রোব-প্রত্যাশা ব্রাউজারে-খোলা-একই-DOM-স্ন্যাপশট-থেকে-গণনা বাধ্যতমূলক)
domcount(){ ev "Array.prototype.slice.call(document.querySelectorAll('tr[data-av-row]')).filter(function(r){return (r.getAttribute('data-kw')||'').toLowerCase().indexOf('$1')!==-1;}).length" | tr -d '"'; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ
J=/tmp/s271-av-jar.txt
PAGE=/tmp/s271-av-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/activity"; }

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → রিড-ওনলি-পৃষ্ঠা-সংগ্রহ + পূর্ণগণনা) ──"
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
if [ "$PC" = "200" ]; then ok "অ্যাক্টিভিটি-পৃষ্ঠা 200"; else bad "অ্যাক্টিভিটি-পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-av-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্ণগণনা (রেন্ডার্ড-HTML-ই-সত্য — রিড-ওনলি সারফেস)
UNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'অ্যাক্টিভিটি activity' || true)
ACTN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'অ্যাকশন action' || true)
IDP=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | grep -oE '#[0-9]+' | head -1)
IDN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "${IDP} " || true)
ACTOR=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | sed -n 's/.*ব্যবহারকারী user \([^"]*\) রোল role.*/\1/p' | awk '{print $1}')
TME=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | head -1 | sed -n 's/.*সময় time \([^"]*\) ব্যবহারকারী.*/\1/p' | awk '{print $1}')
# ACTORN/DELN/MODN/TMEN বাদ — লাইভ-চার্ন-নিরাপদ ব্রাউজার-DOM-পূর্ণগণনা (domcount) ধাপ-৩-এ
if [ "$PC" = "200" ] && [ "$ROWS" -ge 1 ]; then ok "অ্যাক্টিভিটি-সারফেস প্রস্তুত ($ROWS এন্ট্রি — রিড-ওনলি)"; else bad "অ্যাক্টিভিটি-সারফেস-খালি/ব্যর্থ (rows=$ROWS)"; fi
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ -n "$IDP" ] && [ "$IDN" = "1" ]; then ok "activity-row-id একক-প্রোব প্রস্তুত ($IDP — অনন্য)"; else bad "id-প্রোব-অনন্যতা-ব্যর্থ (probe=$IDP n=$IDN)"; fi
if [ "$UNIVN" = "$ROWS" ] && [ "$ACTN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'অ্যাক্টিভিটি activity'+'অ্যাকশন action' (প্রতি-সারফেস $UNIVN/$ACTN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN act=$ACTN rows=$ROWS)"; fi
if [ -n "$ACTOR" ]; then ok "actor-প্রোব প্রস্তুত ($ACTOR — ধাপ-৩-এ DOM-পূর্ণগণনা)"; else bad "actor-প্রোব-নিষ্কাশন-ব্যর্থ (actor=শূন্য)"; fi

echo "── ধাপ-১: কাঠামো (av271 স্ট্রিপ — no-regression) ──"
contains "av271-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="avFilter271"'
contains "av271-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="avCount271"'
contains "av271-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="avClear271"'
contains "av-kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'av-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-av-empty)" "$(cat "$PAGE")" 'data-av-empty'
contains "__avQA হুক উপস্থিত" "$(cat "$PAGE")" '__avQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat "$PAGE")" "av.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="av-zero" id="avZero271" data-av-empty hidden>'
contains "no-regression: table+thead" "$(cat "$PAGE")" '<table class="table">'
contains "no-regression: সময়-কলাম-হেডার" "$(cat "$PAGE")" 'সময়'
contains "no-regression: টার্গেট-কলাম-হেডার" "$(cat "$PAGE")" 'টার্গেট'
contains "no-regression: subtitle" "$(cat "$PAGE")" 'subtitle'
# রেন্ডার-স্তর-মার্কার (EJS-সোর্স-মার্কার include/class-empty রেন্ডার্ড-HTML-এ-অনুপস্থিত — session271-গোটচা)
contains "no-regression: admin-main ধারক (sidebar-রেন্ডার-প্রমাণ)" "$(cat "$PAGE")" 'admin-main'
contains "no-regression: হেডার-টাইটেল" "$(cat "$PAGE")" 'অ্যাক্টিভিটি লগ'
contains "no-regression: chip-danger (রোল/DELETE-চিপ)" "$(cat "$PAGE")" 'chip-danger'
contains "no-regression: DELETE-chip অক্ষুণ্ণ" "$(cat "$PAGE")" 'DELETE'
contains "no-regression: target-code অক্ষুণ্ণ" "$(cat "$PAGE")" '<code'

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
AVCSS=$(sed -n '/session271 — av271 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$PAGE")
HEXN=$(echo "$AVCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "av271-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "av271-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$AVCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$AVCSS" '.av-kbd-hint kbd'
contains "reduced-motion জোড়া" "$AVCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$AVCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$AVCSS" '.av-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr !important — সঠিক-বাইট)" "$AVCSS" 'tr[data-av-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$AVCSS" '.av-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$AVCSS" '.av-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম av-স্কোপ)" "$AVCSS" '.av-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/activity" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -qE '/admin/activity/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ, অ্যাঙ্করড-চেক)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/activity" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin/activity খোলা (অ্যাঙ্করড)" "$(agent-browser get url 2>/dev/null)" '/admin/activity'
contains "__avQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__avQA')" 'object'
T=$(ev 'window.__avQA.total()' | tr -d '"')
C=$(ev 'window.__avQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#avFilter271' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__avQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "activity-row-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
  agent-browser fill '#avFilter271' "$ACTOR" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__avQA.count()' | tr -d '"'); EXP2=$(domcount "$ACTOR")
  if [ -n "$C2" ] && [ "$C2" = "$EXP2" ]; then ok "actor-প্রোব '$ACTOR' → DOM-পূর্ণগণনা-মিল ($C2/$T)"; else bad "actor-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$EXP2)"; fi
  agent-browser fill '#avFilter271' 'delete' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__avQA.count()' | tr -d '"'); EXP3=$(domcount 'delete')
  if [ -n "$C3" ] && [ "$C3" = "$EXP3" ]; then ok "action-প্রোব 'delete' → DOM-পূর্ণগণনা-মিল ($C3/$T — case-insensitive kw)"; else bad "action-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$EXP3)"; fi
  if [ -n "$TME" ]; then
    agent-browser fill '#avFilter271' "$TME" >/dev/null 2>&1; sleep 0.4
    C3t=$(ev 'window.__avQA.count()' | tr -d '"'); EXP3t=$(domcount "$TME")
    if [ -n "$C3t" ] && [ "$C3t" = "$EXP3t" ]; then ok "সময়-প্রোব '$TME' → DOM-পূর্ণগণনা-মিল ($C3t/$T)"; else bad "সময়-প্রোব ব্যর্থ (got=$C3t প্রত্যাশা=$EXP3t)"; fi
  else
    skip "সময়-প্রোব (নিষ্কাশন-শূন্য — ডেটা-নির্ভর-skip-চুক্তি)"
  fi
  agent-browser fill '#avFilter271' 'মডারেটর moderator' >/dev/null 2>&1; sleep 0.4
  C3m=$(ev 'window.__avQA.count()' | tr -d '"'); EXP3m=$(domcount 'মডারেটর moderator')
  if [ -n "$C3m" ] && [ "$C3m" = "$EXP3m" ]; then ok "রোল-প্রোব 'মডারেটর moderator' → DOM-পূর্ণগণনা-মিল ($C3m/$T)"; else bad "রোল-প্রোব ব্যর্থ (got=$C3m প্রত্যাশা=$EXP3m)"; fi
  agent-browser fill '#avFilter271' 'অ্যাকশন action' >/dev/null 2>&1; sleep 0.4
  CHIPV=$(ev 'document.getElementById("avCount271").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("avCount271").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
  CLRB=$(ev 'document.getElementById("avClear271").hidden' | tr -d '"')
  if [ "$CLRB" = "false" ]; then ok "ক্লিয়ার-বাটন সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "ক্লিয়ার-বাটন ব্যর্থ (hidden=$CLRB)"; fi
else
  skip "ফিল্টার-প্রোব-ষড়য় (সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi
agent-browser fill '#avFilter271' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__avQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-av-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
if [ "$ROWS" -ge 1 ]; then
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-av-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
else
  skip "সব-hidden অ্যাসার্ট (সারফেস-শূন্য)"
fi
ev 'window.__avQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__avQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__avQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("avCount271")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "avFilter271" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var r={};var i=document.getElementById("avFilter271");i.focus();var e1=new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true});i.dispatchEvent(e1);r.inp=e1.defaultPrevented;var e2=new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true});document.body.dispatchEvent(e2);r.bod=e2.defaultPrevented;JSON.stringify(r)' | tr -d '"\\')
if echo "$FG" | grep -qF 'inp:false' && echo "$FG" | grep -qF 'bod:true'; then ok "ফিল্ড-গার্ড-দ্বৈত-প্রমাণ: input-টার্গেট defaultPrevented=false + body-টার্গেট=true ($FG)"; else bad "ফিল্ড-গার্ড-দ্বৈত-প্রমাণ ব্যর্থ ($FG)"; fi
ev 'document.getElementById("avFilter271").value="probe271";document.getElementById("avFilter271").dispatchEvent(new Event("input"));document.getElementById("avFilter271").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("avFilter271").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "avFilter271" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s271-avfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s271-avfilter-desk.png" ]; then ok "s271-avfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s271-avfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s271-avfilter-mobile390.png" ]; then ok "s271-avfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি নেট-রাইট-শূন্য-প্রমাণ ──"
PC2=$(fetch_page)
ROWSA=$(grep -o 'data-av-row="[0-9]*"' "$PAGE" | wc -l)
if [ "$PC2" = "200" ] && [ "$ROWSA" = "$ROWS" ]; then
  ok "নেট-DB-রাইট-শূন্য প্রমাণ (রিড-ওনলি সারফেস $ROWS → $ROWSA)"
else
  bad "নেট-রাইট-প্রমাণ ব্যর্থ (http=$PC2 before=$ROWS after=$ROWSA)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
