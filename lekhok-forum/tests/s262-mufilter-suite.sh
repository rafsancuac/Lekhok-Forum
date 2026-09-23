#!/bin/bash
# s262-mufilter-suite.sh — session262 ইউজার (/moderator/users) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (muf262 স্ট্রিপ + tr[data-muf-row]/data-kw সারি + শূন্য-অবস্থা
#          + mu-search/mu-stats/data-mu-confirm/mu-reason/mu-lock/mu-feed অক্ষুণ্ণ)
#          ② স্টাইল (muf262-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — সারি+চিপ+শূন্য-বক্স)
#          ③ আচরণ (__mufQA হুক; @ইউজারনেম-প্রোব '@testadmin'→১-মিল (নির্ধারক — সিড-শূন্য);
#          স্ট্যাটাস-শব্দ-প্রোব নিষিদ্ধ; রোল-প্রোব এডমিন; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার+চিপ-display-none;
#          'f'-ফোকাস (bubbles:true — session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **সিড-শূন্য (রিড-ওনলি-UI — DB-রাইট-শূন্য)** — s251/s256-নীতি: বাস্তব-ইউজার-সারিতেই
#          নির্ধারক-প্রোব (@testadmin — একক-মিল প্রি-যাচাইকৃত); ব্যান/ফেরত-ফর্ম স্পর্ষ-নয়
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — requireScope('user_mgmt') অন্তর্নিহিত-সর্বস্কোপ)
#         ④ **স্কোপ-বাউন্ডারি-অ্যাসার্ট:** data-kw-তে email-স্বাক্ষর-শূন্য (moderator-স্কোপড-ভ্যারিয়েন্ট — au251-ব্যতিক্রম)
#         ⑤ **নেমস্পেস:** .mu-* (session90-পেজ-CSS) পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স muf (সংঘর্ষ-বিতাড়িত)
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
J=/tmp/s262-mu-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s262-mu-page.html -w "%{http_code}" -b "$J" "$BASE/moderator/users")
if [ "$PC" = "200" ]; then ok "ইউজার-তদারকি পৃষ্ঠা 200"; else bad "ইউজার-তদারকি পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-muf-row="[0-9]*"' /tmp/s262-mu-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s262-mu-page.html | wc -l)
PROBE1=$(grep -o 'data-kw="[^"]*"' /tmp/s262-mu-page.html | grep -c '@testadmin')
if [ "$PROBE1" = "1" ]; then ok "নির্ধারক-প্রোব-পূর্বশর্ত ('@testadmin' একক-মিল)"; else bad "@testadmin-প্রোব-অনির্ধারক (মিল=$PROBE1)"; fi
EMAILKW=$(grep -o 'data-kw="[^"]*"' /tmp/s262-mu-page.html | grep -ciE '[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|org|net|edu|bd)' || true)
if [ "$EMAILKW" = "0" ]; then ok "স্কোপ-বাউন্ডারি (data-kw-তে email-স্বাক্ষর-শূন্য)"; else bad "স্কোপ-লঙ্ঘন — kw-তে email-স্বাক্ষর ($EMAILKW)"; fi
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (সিড-শূন্য-নীতি — বাস্তব-ডেটাই-সত্য): প্রতিটি শব্দ-প্রোবের প্রত্যাশিত-মিল
ACTIVEN=$(grep -o 'data-kw="[^"]*"' /tmp/s262-mu-page.html | grep -c 'সক্রিয়' || true)
BANNEDN=$(grep -o 'data-kw="[^"]*"' /tmp/s262-mu-page.html | grep -c 'নিষিদ্ধ' || true)
ADMINN=$(grep -o 'data-kw="[^"]*"' /tmp/s262-mu-page.html | grep -c 'এডমিন' || true)

echo "── ধাপ-১: কাঠামো (muf262 স্ট্রিপ — mu-search/mu-stats/ban-ফর্ম/ফিড অক্ষুণ্ণ) ──"
contains "muf262-ইনপুট রেন্ডার" "$(cat /tmp/s262-mu-page.html)" 'id="mufFilter262"'
contains "muf262-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s262-mu-page.html)" 'id="mufCount262"'
contains "muf262-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s262-mu-page.html)" 'id="mufClear262"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s262-mu-page.html)" 'muf-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-muf-empty)" "$(cat /tmp/s262-mu-page.html)" 'data-muf-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s262-mu-page.html)" '<div class="muf-zero" id="mufZero262" data-muf-empty hidden>'
contains "দ্বি-ভাষা kw (রোল-লেবেল ইউজার)" "$(cat /tmp/s262-mu-page.html)" 'ইউজার user'
containsF "GET DB-সার্চ অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'class="mu-search"'
containsF "mu-stats চিপ অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'mu-chip mu-chip-all'
contains "নিষেধ-নিশ্চিতকরণ ফর্ম অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'data-mu-confirm'
contains "নোটসহ-ফর্ম অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'mu-reason-form'
contains "ঊর্ধ্বতন-লক অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'mu-lock'
contains "তদারকি-ফিড অক্ষুণ্ণ (no-regression)" "$(cat /tmp/s262-mu-page.html)" 'mu-feed'
contains "__mufQA হুক উপস্থিত" "$(cat /tmp/s262-mu-page.html)" '__mufQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s262-mu-page.html)" "mu.key !== 'f'"
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "সারি-সমতুল্য data-kw কভারেজ ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
MUFCSS=$(sed -n '/session262 — ইউজার তাৎক্ষণিক-ফিল্টার/,/<\/style>/p' /tmp/s262-mu-page.html)
HEXN=$(echo "$MUFCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "muf262-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "muf262-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$MUFCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$MUFCSS" '.muf-kbd-hint kbd'
contains "reduced-motion জোড়া" "$MUFCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$MUFCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$MUFCSS" '.muf-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr[data-muf-row])" "$MUFCSS" 'tr[data-muf-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$MUFCSS" '.muf-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$MUFCSS" '.muf-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (mu-বনাম muf-স্কোপ)" "$MUFCSS" '.muf-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/moderator/users" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q '/moderator/users'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/moderator/users" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /moderator/users খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/users'
if [ "$ROWS" -ge 1 ]; then
  contains "__mufQA সংজ্ঞায়িত" "$(ev 'typeof window.__mufQA')" 'object'
  T=$(ev 'window.__mufQA.total()' | tr -d '"')
  C=$(ev 'window.__mufQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
  agent-browser fill '#mufFilter262' '@testadmin' >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__mufQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "@ইউজারনেম-প্রোব '@testadmin' → নির্ধারক-১-মিল"; else bad "@testadmin-প্রোব ব্যর্থ (got=$C2)"; fi
  CHIPV=$(ev 'document.getElementById("mufCount262").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "1 / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  agent-browser fill '#mufFilter262' সক্রিয় >/dev/null 2>&1; sleep 0.4
  C5=$(ev 'window.__mufQA.count()' | tr -d '"')
  if [ -n "$C5" ] && [ "$C5" = "$ACTIVEN" ] && [ "$C5" -ge 1 ]; then ok "স্ট্যাটাস-শব্দ-প্রোব 'সক্রিয়' → নির্ধারক-মিল ($C5/$T)"; else bad "সক্রিয়-প্রোব ব্যর্থ (got=$C5 প্রত্যাশা=$ACTIVEN)"; fi
  if [ "$BANNEDN" -ge 1 ]; then
    agent-browser fill '#mufFilter262' নিষিদ্ধ >/dev/null 2>&1; sleep 0.4
    C5b=$(ev 'window.__mufQA.count()' | tr -d '"')
    if [ "$C5b" = "$BANNEDN" ]; then ok "স্ট্যাটাস-শব্দ-প্রোব 'নিষিদ্ধ' → নির্ধারক-মিল ($C5b/$T)"; else bad "নিষিদ্ধ-প্রোব ব্যর্থ (got=$C5b প্রত্যাশা=$BANNEDN)"; fi
  else
    skip "স্ট্যাটাস-প্রোব 'নিষিদ্ধ' (বাস্তব-ডেটায় নিষিদ্ধ-ইউজার-শূন্য — সিড-শূন্য-নীতি; সক্রিয়-প্রোবই-কভার)"
  fi
  agent-browser fill '#mufFilter262' এডমিন >/dev/null 2>&1; sleep 0.4
  C6=$(ev 'window.__mufQA.count()' | tr -d '"')
  if [ -n "$C6" ] && [ "$C6" = "$ADMINN" ] && [ "$C6" -ge 1 ]; then ok "রোল-প্রোব 'এডমিন' → নির্ধারক-মিল ($C6/$T)"; else bad "এডমিন-প্রোব ব্যর্থ (got=$C6 প্রত্যাশা=$ADMINN)"; fi
  agent-browser fill '#mufFilter262' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__mufQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-muf-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  ev 'window.__mufQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__mufQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__mufQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("mufCount262")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "mufFilter262" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("mufFilter262").value="probe262";document.getElementById("mufFilter262").dispatchEvent(new Event("input"));document.getElementById("mufFilter262").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("mufFilter262").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "mufFilter262" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট ×১১ (সারি-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s262-mufilter-desk.png" >/dev/null 2>&1 && ok "s262-mufilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s262-mufilter-mobile390.png" >/dev/null 2>&1 && ok "s262-mufilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: রিড-ওনলি-নিশ্চয়তা (সিড-শূন্য — সারি-সংখ্যা-অপরিবর্তিত) ──"
curl -s -b "$J" "$BASE/moderator/users" -o /tmp/s262-mu-after.html
ROWS2=$(grep -o 'data-muf-row="[0-9]*"' /tmp/s262-mu-after.html | wc -l)
if [ "$ROWS2" = "$ROWS" ]; then ok "DB-রাইট-শূন্য প্রমাণ (সারি $ROWS → $ROWS2)"; else bad "সারি-সংখ্যা-পরিবর্তন ($ROWS → $ROWS2)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
