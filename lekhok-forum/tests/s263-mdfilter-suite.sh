#!/bin/bash
# s263-mdfilter-suite.sh — session263 মডারেটর-ড্যাশবোর্ড (/moderator) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (mdf263 স্ট্রিপ + [data-mdf-row]/data-kw টাইল-সারি ×১৫ + শূন্য-অবস্থা
#          + mod-hero/mod-stats/mod-grid/mrq81-dash-badge/switch/logout no-regression)
#          ② স্টাইল (mdf263-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — inline-flex-টাইলসহ)
#          ③ আচরণ (__mdfQA হুক; নির্ধারক-প্রোব 'কুইজ'/'রিপোর্ট'/'মেনু'/'ইভেন্ট'/'/moderator/press'
#          → পূর্বগণনা-মিল (সিড-শূন্য — রিড-ওনলি-সারফেস); নো-ম্যাচ→শূন্য-অবস্থা;
#          clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true — session256-চুক্তি);
#          Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **সিড-শূন্য (রিড-ওনলি-UI — DB-রাইট-শূন্য)** — s262-নীতি: টাইল-কাঠামোই-নির্ধারক
#         (১১-scope + ৪-এক্সট্রা = ১৫-টাইল, admin-ভিউয়ার); প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-পূর্বগণনা
#         (muf262-ডেটা-নির্ভর-প্রোব-চুক্তি — গণনা-০-এ শর্তসাপেক্ষ-স্কিপ, রেঞ্জ-অ্যাসার্ট-নিষিদ্ধ)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — /moderator সব-স্কোপ-প্রদর্শিত, press-টাইল-সহ)
#         ④ **নেমস্পেস:** .mod-* (পেজ-CSS) পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স mdf (সংঘর্ষ-মুক্ত যাচাইকৃত)
#         ⑤ **inline-flex-টাইল-গার্ড:** এক্সট্রা-টাইলে style="display:flex" আছে → hidden-গার্ড
#         .mod-tile[data-mdf-row][hidden]{display:none!important} বাধ্যতমূলক (session256-শ্রেণি)
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
J=/tmp/s263-md-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s263-md-page.html -w "%{http_code}" -b "$J" "$BASE/moderator")
if [ "$PC" = "200" ]; then ok "মডারেটর-ড্যাশবোর্ড পৃষ্ঠা 200"; else bad "মডারেটর-ড্যাশবোর্ড পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-mdf-row="[0-9]*"' /tmp/s263-md-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s263-md-page.html | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (সিড-শূন্য-নীতি — রেন্ডার্ড-HTML-ই-সত্য; muf262-চুক্তি)
QUIZN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'কুইজ' || true)
REPORTN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'রিপোর্ট' || true)
MENUN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'মেনু' || true)
EVENTN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'ইভেন্ট' || true)
PRESSN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c '/moderator/press' || true)
UNLOCKN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'unlocked' || true)
LOCKN=$(grep -o 'data-kw="[^"]*"' /tmp/s263-md-page.html | grep -c 'লকড' || true)
if [ "$ROWS" = "15" ]; then ok "টাইল-মোট ১৫ (১১-scope + ৪-এক্সট্রা)"; else bad "টাইল-মোট-ব্যত্যয় (got=$ROWS প্রত্যাশা=১৫)"; fi

echo "── ধাপ-১: কাঠামো (mdf263 স্ট্রিপ — hero/stats/grid/badge no-regression) ──"
contains "mdf263-ইনপুট রেন্ডার" "$(cat /tmp/s263-md-page.html)" 'id="mdfFilter263"'
contains "mdf263-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s263-md-page.html)" 'id="mdfCount263"'
contains "mdf263-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s263-md-page.html)" 'id="mdfClear263"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s263-md-page.html)" 'mdf-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-mdf-empty)" "$(cat /tmp/s263-md-page.html)" 'data-mdf-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s263-md-page.html)" '<div class="mdf-zero" id="mdfZero263" data-mdf-empty hidden>'
contains "দ্বি-ভাষা kw (অবস্থা-শব্দ unlocked)" "$(cat /tmp/s263-md-page.html)" 'খোলা অনুমোদিত unlocked allowed open'
contains "__mdfQA হুক উপস্থিত" "$(cat /tmp/s263-md-page.html)" '__mdfQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s263-md-page.html)" "md.key !== 'f'"
containsF "no-regression: hero-নাম" "$(cat /tmp/s263-md-page.html)" 'mod-hero-name'
containsF "no-regression: stats-সারি" "$(cat /tmp/s263-md-page.html)" 'mod-stat-val'
containsF "no-regression: scope-কাউন্ট" "$(cat /tmp/s263-md-page.html)" 'mod-scope-count'
containsF "no-regression: রিপোর্ট-ব্যাজ শ্রেণি" "$(cat /tmp/s263-md-page.html)" 'mrq81-dash-badge'
containsF "no-regression: switch/logout বোতাম" "$(cat /tmp/s263-md-page.html)" 'mod-switch-btn'
containsF "no-regression: scope-টাইল-গ্রিড" "$(cat /tmp/s263-md-page.html)" 'mod-grid'
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "টাইল-সমতুল্য data-kw কভারেজ ($ROWS টাইল)"; else bad "টাইল/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$QUIZN" = "1" ]; then ok "নির্ধারক-প্রোব-পূর্বশর্ত ('কুইজ' একক-মিল)"; else bad "'কুইজ'-প্রোব-অনির্ধারক (মিল=$QUIZN)"; fi
if [ "$REPORTN" = "1" ]; then ok "নির্ধারক-প্রোব-পূর্বশর্ত ('রিপোর্ট' একক-মিল)"; else bad "'রিপোর্ট'-প্রোব-অনির্ধারক (মিল=$REPORTN)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MDFCSS=$(sed -n '/session263 — মডারেটর ড্যাশবোর্ড/,/<\/style>/p' /tmp/s263-md-page.html)
HEXN=$(echo "$MDFCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "mdf263-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "mdf263-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MDFCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$MDFCSS" '.mdf-kbd-hint kbd'
contains "reduced-motion জোড়া" "$MDFCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MDFCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$MDFCSS" '.mdf-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-টাইল (inline-flex-ওভাররাইড-সহ)" "$MDFCSS" '.mod-tile[data-mdf-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$MDFCSS" '.mdf-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$MDFCSS" '.mdf-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (mod-বনাম mdf-স্কোপ)" "$MDFCSS" '.mdf-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -qE '/moderator/?$'; then # session265: অ্যাঙ্করড-চেক (session264-গোটচা-প্রথা — /moderator/login ভবিষ্যৎ-সুরক্ষা)
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator'
if [ "$ROWS" -ge 1 ]; then
  contains "__mdfQA সংজ্ঞায়িত" "$(ev 'typeof window.__mdfQA')" 'object'
  T=$(ev 'window.__mdfQA.total()' | tr -d '"')
  C=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
  agent-browser fill '#mdfFilter263' কুইজ >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "$QUIZN" ] && [ "$C1" -ge 1 ]; then ok "প্রোব 'কুইজ' → নির্ধারক-মিল ($C1/$T)"; else bad "কুইজ-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=$QUIZN)"; fi
  agent-browser fill '#mdfFilter263' রিপোর্ট >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C2" = "$REPORTN" ]; then ok "প্রোব 'রিপোর্ট' → নির্ধারক-মিল ($C2/$T)"; else bad "রিপোর্ট-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$REPORTN)"; fi
  agent-browser fill '#mdfFilter263' মেনু >/dev/null 2>&1; sleep 0.4
  C2b=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C2b" = "$MENUN" ]; then ok "প্রোব 'মেনু' → নির্ধারক-মিল ($C2b/$T)"; else bad "মেনু-প্রোব ব্যর্থ (got=$C2b প্রত্যাশা=$MENUN)"; fi
  agent-browser fill '#mdfFilter263' ইভেন্ট >/dev/null 2>&1; sleep 0.4
  C2c=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C2c" = "$EVENTN" ]; then ok "প্রোব 'ইভেন্ট' → নির্ধারক-মিল ($C2c/$T)"; else bad "ইভেন্ট-প্রোব ব্যর্থ (got=$C2c প্রত্যাশা=$EVENTN)"; fi
  agent-browser fill '#mdfFilter263' /moderator/press >/dev/null 2>&1; sleep 0.4
  C2d=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C2d" = "$PRESSN" ] && [ "$C2d" -ge 1 ]; then ok "প্রোব '/moderator/press' (লিংক-প্রোব) → মিল ($C2d/$T)"; else bad "press-প্রোব ব্যর্থ (got=$C2d প্রত্যাশা=$PRESSN)"; fi
  agent-browser fill '#mdfFilter263' unlocked >/dev/null 2>&1; sleep 0.4
  C2e=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C2e" = "$UNLOCKN" ] && [ "$C2e" -ge 1 ]; then ok "প্রোব 'unlocked' (ইংরেজি-অবস্থা) → মিল ($C2e/$T)"; else bad "unlocked-প্রোব ব্যর্থ (got=$C2e প্রত্যাশা=$UNLOCKN)"; fi
  if [ "$LOCKN" -ge 1 ]; then
    agent-browser fill '#mdfFilter263' লকড >/dev/null 2>&1; sleep 0.4
    C2f=$(ev 'window.__mdfQA.count()' | tr -d '"')
    if [ "$C2f" = "$LOCKN" ]; then ok "প্রোব 'লকড' → নির্ধারক-মিল ($C2f/$T)"; else bad "লকড-প্রোব ব্যর্থ (got=$C2f প্রত্যাশা=$LOCKN)"; fi
  else
    skip "প্রোব 'লকড' (admin-ভিউয়ারে লকড-টাইল-শূন্য — সিড-শূন্য-নীতি; unlocked-প্রোবই-কভার)"
  fi
  CHIPV=$(ev 'document.getElementById("mdfCount263").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$UNLOCKN / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  agent-browser fill '#mdfFilter263' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__mdfQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-mdf-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-mdf-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-টাইল hidden ($HID/$T — inline-flex-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
  ev 'window.__mdfQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__mdfQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__mdfQA.clear() → পুনরুদ্ধার ($T টাইল)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("mdfCount263")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "mdfFilter263" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("mdfFilter263").value="probe263";document.getElementById("mdfFilter263").dispatchEvent(new Event("input"));document.getElementById("mdfFilter263").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("mdfFilter263").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "mdfFilter263" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট (টাইল-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s263-mdfilter-desk.png" >/dev/null 2>&1 && ok "s263-mdfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s263-mdfilter-mobile390.png" >/dev/null 2>&1 && ok "s263-mdfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: রিড-ওনলি-নিশ্চয়তা (সিড-শূন্য — টাইল-সংখ্যা-অপরিবর্তিত) ──"
curl -s -b "$J" "$BASE/moderator" -o /tmp/s263-md-after.html
ROWS2=$(grep -o 'data-mdf-row="[0-9]*"' /tmp/s263-md-after.html | wc -l)
if [ "$ROWS2" = "$ROWS" ]; then ok "DB-রাইট-শূন্য প্রমাণ (টাইল $ROWS → $ROWS2)"; else bad "টাইল-সংখ্যা-পরিবর্তন ($ROWS → $ROWS2)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
