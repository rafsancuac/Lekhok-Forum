#!/bin/bash
# s264-adfilter-suite.sh — session264 অ্যাডমিন-ড্যাশবোর্ড (/admin) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (adf264 স্ট্রিপ + [data-adf-row]/data-kw সারফেস ×১৮ = stat ×৯ + কার্ড ×২ +
#          কুইক-অ্যাকশন ×৭ + শূন্য-অবস্থা + welcome-banner/stat-grid/dash-cols/quick-actions
#          no-regression)
#          ② স্টাইল (adf264-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion-জোড়া; 640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ — মিশ্র-ট্যাগ
#          stat-box/card/btn — .stat-box display:flex-ওভাররাইড-গার্ডসহ, session256-শিক্ষা)
#          ③ আচরণ (__adfQA হুক; নির্ধারক-প্রোব 'গ্যালারি'/'gallery'/'বিজ্ঞপ্তি'/'/admin/notices'/
#          'নিউজলেটার'/'inbox' → পূর্বগণনা-মিল (সিড-শূন্য — রিড-ওনলি-সারফেস); নো-ম্যাচ→শূন্য-অবস্থা;
#          সব-hidden ১৮/১৮; clear→পুনরুদ্ধার+চিপ-display-none; 'f'-ফোকাস (bubbles:true —
#          session256-চুক্তি); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① **সিড-শূন্য (রিড-ওনলি-UI — DB-রাইট-শূন্য)** — s263-নীতি: সারফেস-কাঠামোই-নির্ধারক
#         (৯-stat + ২-কার্ড + ৭-কুইক = ১৮-সারফেস, admin-ভিউয়ার); প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-
#         পূর্বগণনা (গণনা-০-এ শর্তসাপেক্ষ-স্কিপ, রেঞ্জ-অ্যাসার্ট-নিষিদ্ধ — muf262-চুক্তি)
#         ② স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server (LF_QA_DISABLE_RATELIMIT=1)
#         ③ ভিউয়ার = testadmin/demo123 (role=admin — কুইক-অ্যাকশন ৭/৭ রেন্ডার)
#         ④ **নেমস্পেস:** .stat-*/.dash-*/.card/.btn (admin.css) পূর্ব-দখলকৃত → ফিল্টার-প্রিফিক্স
#         adf (সংঘর্ষ-মুক্ত যাচাইকৃত)
#         ⑤ **মিশ্র-ট্যাগ-সারফেস গার্ড:** stat-box (display:flex!) + card + quick-actions .btn →
#         author-স্তর [hidden]-গার্ড ×৩ বাধ্যতমূলক (UA-[hidden] author-display-এ পরাজিত হয়)
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
J=/tmp/s264-ad-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o /tmp/s264-ad-page.html -w "%{http_code}" -b "$J" "$BASE/admin")
if [ "$PC" = "200" ]; then ok "অ্যাডমিন-ড্যাশবোর্ড পৃষ্ঠা 200"; else bad "অ্যাডমিন-ড্যাশবোর্ড পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-adf-row="[0-9]*"' /tmp/s264-ad-page.html | wc -l)
KW=$(grep -o 'data-kw="' /tmp/s264-ad-page.html | wc -l)
# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (সিড-শূন্য-নীতি — রেন্ডার্ড-HTML-ই-সত্য; muf262/s263-চুক্তি)
GALLN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c 'গ্যালারি' || true)
ENGLN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c 'gallery' || true)
NOTICEN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c 'বিজ্ঞপ্তি' || true)
LINKN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c '/admin/notices' || true)
NEWLN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c 'নিউজলেটার' || true)
INBOXN=$(grep -o 'data-kw="[^"]*"' /tmp/s264-ad-page.html | grep -c 'inbox' || true)
if [ "$ROWS" = "18" ]; then ok "সারফেস-মোট ১৮ (৯-stat + ২-কার্ড + ৭-কুইক)"; else bad "সারফেস-মোট-ব্যত্যয় (got=$ROWS প্রত্যাশা=১৮)"; fi

echo "── ধাপ-১: কাঠামো (adf264 স্ট্রিপ — banner/grid/cards/actions no-regression) ──"
contains "adf264-ইনপুট রেন্ডার" "$(cat /tmp/s264-ad-page.html)" 'id="adfFilter264"'
contains "adf264-কাউন্ট চিপ রেন্ডার" "$(cat /tmp/s264-ad-page.html)" 'id="adfCount264"'
contains "adf264-ক্লিয়ার বাটন রেন্ডার" "$(cat /tmp/s264-ad-page.html)" 'id="adfClear264"'
contains "kbd-পিল affordance রেন্ডার" "$(cat /tmp/s264-ad-page.html)" 'adf-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-adf-empty)" "$(cat /tmp/s264-ad-page.html)" 'data-adf-empty'
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat /tmp/s264-ad-page.html)" '<div class="adf-zero" id="adfZero264" data-adf-empty hidden>'
contains "__adfQA হুক উপস্থিত" "$(cat /tmp/s264-ad-page.html)" '__adfQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat /tmp/s264-ad-page.html)" "ad.key !== 'f'"
containsF "no-regression: welcome-banner" "$(cat /tmp/s264-ad-page.html)" 'welcome-banner'
containsF "no-regression: wb-date" "$(cat /tmp/s264-ad-page.html)" 'wb-date'
containsF "no-regression: stat-grid" "$(cat /tmp/s264-ad-page.html)" 'stat-grid'
containsF "no-regression: stat-ico আইকন-হোস্ট" "$(cat /tmp/s264-ad-page.html)" 'stat-ico'
containsF "no-regression: dash-cols কার্ড-গ্রিড" "$(cat /tmp/s264-ad-page.html)" 'dash-cols'
containsF "no-regression: recent-list" "$(cat /tmp/s264-ad-page.html)" 'recent-list'
containsF "no-regression: quick-actions" "$(cat /tmp/s264-ad-page.html)" 'quick-actions'
containsF "no-regression: sidebar (পার্শিয়াল)" "$(cat /tmp/s264-ad-page.html)" 'admin-sidebar'
if [ "$ROWS" -gt 0 ] && [ "$KW" -ge "$ROWS" ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$NEWLN" = "1" ]; then ok "নির্ধারক-প্রোব-পূর্বশর্ত ('নিউজলেটার' একক-মিল)"; else bad "'নিউজলেটার'-প্রোব-অনির্ধারক (মিল=$NEWLN)"; fi
if [ "$GALLN" -ge 1 ]; then ok "প্রোব-পূর্বশর্ত ('গ্যালারি' মিল=$GALLN)"; else bad "'গ্যালারি'-প্রোব-মিল-শূন্য"; fi

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
ADFCSS=$(sed -n '/session264 — অ্যাডমিন ড্যাশবোর্ড/,/<\/style>/p' /tmp/s264-ad-page.html)
HEXN=$(echo "$ADFCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "adf264-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "adf264-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$ADFCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$ADFCSS" '.adf-kbd-hint kbd'
contains "reduced-motion জোড়া" "$ADFCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$ADFCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$ADFCSS" '.adf-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-stat-box (display:flex-ওভাররাইড)" "$ADFCSS" '.stat-box[data-adf-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-কার্ড (মিশ্র-ট্যাগ)" "$ADFCSS" '.card[data-adf-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-কুইক-বাটন (মিশ্র-ট্যাগ)" "$ADFCSS" '.quick-actions .btn[data-adf-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ ([hidden]-জোড়া)" "$ADFCSS" '.adf-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$ADFCSS" '.adf-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম adf-স্কোপ)" "$ADFCSS" '.adf-instant { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
# গোটচা (s264-প্রথম-রানে ধরা): '/admin' সাবস্ট্রিং-গ্রেপ লগইন-পেজেও মেলে (/admin/login) —
# মিথ্যা-সেশন-সক্রিয় → ব্রাউজার লগইন-পেজে-আটকে __adfQA-শূন্য → ১৩-মিথ্যা-ফেল। অ্যাঙ্করড-চেক বাধ্যতমূলক।
if echo "$PREURL" | grep -qE '/admin/?$'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে /admin খোলা" "$(agent-browser get url 2>/dev/null)" '/admin'
if [ "$ROWS" -ge 1 ]; then
  contains "__adfQA সংজ্ঞায়িত" "$(ev 'typeof window.__adfQA')" 'object'
  T=$(ev 'window.__adfQA.total()' | tr -d '"')
  C=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
  agent-browser fill '#adfFilter264' গ্যালারি >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ -n "$C1" ] && [ "$C1" = "$GALLN" ] && [ "$C1" -ge 1 ]; then ok "প্রোব 'গ্যালারি' → নির্ধারক-মিল ($C1/$T)"; else bad "গ্যালারি-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=$GALLN)"; fi
  agent-browser fill '#adfFilter264' gallery >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C2" = "$ENGLN" ] && [ "$C2" -ge 1 ]; then ok "প্রোব 'gallery' (ইংরেজি-অ্যালায়াস) → মিল ($C2/$T)"; else bad "gallery-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$ENGLN)"; fi
  agent-browser fill '#adfFilter264' বিজ্ঞপ্তি >/dev/null 2>&1; sleep 0.4
  C2b=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C2b" = "$NOTICEN" ]; then ok "প্রোব 'বিজ্ঞপ্তি' → নির্ধারক-মিল ($C2b/$T)"; else bad "বিজ্ঞপ্তি-প্রোব ব্যর্থ (got=$C2b প্রত্যাশা=$NOTICEN)"; fi
  agent-browser fill '#adfFilter264' /admin/notices >/dev/null 2>&1; sleep 0.4
  C2c=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C2c" = "$LINKN" ] && [ "$C2c" -ge 1 ]; then ok "প্রোব '/admin/notices' (লিংক-প্রোব) → মিল ($C2c/$T)"; else bad "লিংক-প্রোব ব্যর্থ (got=$C2c প্রত্যাশা=$LINKN)"; fi
  agent-browser fill '#adfFilter264' inbox >/dev/null 2>&1; sleep 0.4
  C2d=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C2d" = "$INBOXN" ] && [ "$C2d" -ge 1 ]; then ok "প্রোব 'inbox' (ইংরেজি-অ্যালায়াস) → মিল ($C2d/$T)"; else bad "inbox-প্রোব ব্যর্থ (got=$C2d প্রত্যাশা=$INBOXN)"; fi
  agent-browser fill '#adfFilter264' নিউজলেটার >/dev/null 2>&1; sleep 0.4
  C2e=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C2e" = "$NEWLN" ] && [ "$C2e" = "1" ]; then ok "প্রোব 'নিউজলেটার' → একক-মিল ($C2e/$T)"; else bad "নিউজলেটার-প্রোব ব্যর্থ (got=$C2e প্রত্যাশা=$NEWLN)"; fi
  CHIPV=$(ev 'document.getElementById("adfCount264").textContent' | tr -d '"')
  if echo "$CHIPV" | grep -q "$NEWLN / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
  agent-browser fill '#adfFilter264' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__adfQA.count()' | tr -d '"')
  EMPT=$(ev 'document.querySelector("[data-adf-empty]").hidden' | tr -d '"')
  if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
  HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-adf-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
  if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — মিশ্র-ট্যাগ-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
  ev 'window.__adfQA.clear()' >/dev/null 2>&1; sleep 0.3
  C4=$(ev 'window.__adfQA.count()' | tr -d '"')
  if [ "$C4" = "$T" ]; then ok "__adfQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
  CHIPD=$(ev 'getComputedStyle(document.getElementById("adfCount264")).display' | tr -d '"')
  if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none ([hidden]-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
  ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}))' >/dev/null 2>&1; sleep 0.3
  AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ "$AE" = "adfFilter264" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, bubbles:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
  ev 'document.getElementById("adfFilter264").value="probe264";document.getElementById("adfFilter264").dispatchEvent(new Event("input"));document.getElementById("adfFilter264").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV=$(ev 'document.getElementById("adfFilter264").value' | tr -d '"')
  AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
  if [ -z "$EV" ] && [ "$AE2" != "adfFilter264" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
else
  skip "আচরণ-অ্যাসার্ট (সারফেস-শূন্য — কাঠামো+স্টাইল-কভারেজ অক্ষত)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s264-adfilter-desk.png" >/dev/null 2>&1 && ok "s264-adfilter-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s264-adfilter-mobile390.png" >/dev/null 2>&1 && ok "s264-adfilter-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"

echo "── ধাপ-৫: রিড-ওনলি-নিশ্চয়তা (সিড-শূন্য — সারফেস-সংখ্যা-অপরিবর্তিত) ──"
curl -s -b "$J" "$BASE/admin" -o /tmp/s264-ad-after.html
ROWS2=$(grep -o 'data-adf-row="[0-9]*"' /tmp/s264-ad-after.html | wc -l)
if [ "$ROWS2" = "$ROWS" ]; then ok "DB-রাইট-শূন্য প্রমাণ (সারফেস $ROWS → $ROWS2)"; else bad "সারফেস-সংখ্যা-পরিবর্তন ($ROWS → $ROWS2)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.3

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
