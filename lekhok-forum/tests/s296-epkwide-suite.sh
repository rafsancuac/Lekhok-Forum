#!/bin/bash
# s296-epkwide-suite.sh — session296 প্রশস্ত-প্রিমিয়াম কিয়স্ক সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: ইউজার-রিপোর্ট — হোম ই-পেপার কার্ড সংকীর্ণ, থাম্বনেইল (লোগো-ব্যানার) cover-ক্রপে
# কাটা; শীর্ষ-জনপ্রিয় পত্রিকাগুলো (প্রথম আলো, যুগান্তর, সমকাল, কালের কণ্ঠ, ইত্তেফাক, আমার দেশ,
# মানবকণ্ঠ) সামনে-থাকা-দরকার; ডিজাইন আরও প্রিমিয়াম।
# সমাধান (session296): ① শিট 236→330px + aspect-ratio (১:১.৪৫) ② মূল-কার্ডে সারির-নিজ
#   প্রথম-পাতা-চেইন (drive_thumb_id → /api/epaper/thumb প্রক্সি — session175-চুক্তি; ফলব্যাচ
#   লোগো-ব্যানার → টেক্সট-মাস্টহেড) ③ object-fit cover→contain (কাটা-যাবে-না) ④ epPopularRank296
#   প্রাধিকার-ক্রম + LIMIT 14 + ফিল্মস্ট্রিপ-ক্যাপ ৮ ⑤ হোভার-ওভারলে "পূর্ণাঙ্গ পাতা পড়ুন"
#   ⑥ ফিল্মস্ট্রিপ ডেস্কটপে ৪-কলাম গ্রিড, মোবাইলে স্ন্যাপ-স্ক্রল ⑦ বাম-কলাম রিয়েল-ডেটা স্ট্যাট-রো।
# কভারেজ: ① সোর্স-কাঠামো (today.ejs + pages.js + style.css — session296-মার্কার + s292-মার্কার-অক্ষুণ্ণ)
#          ② SSR (সিড-হোম): ক্যাপ-৮ + র‍্যাংক-ক্রম (৭ জনপ্রিয় আগে) + চেইন-src + স্ট্যাট-রো
#          ③ E2E (agent-browser): শিট-প্রস্থ ≥300 + contain + ব্যর্থ-চেইন→লোগো-ফলব্যাচ + CTA-সিঙ্ক +
#             গ্রিড-৪কলাম + স্ট্যাট-রো + মোবাইল-390 hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-ক্লিন নেট-শূন্য (s296-seedhome seed|clean + s292-সহ-অস্তিত্ব-যাচাই)
# চুক্তি: eval-এ else-বিহীন-ternary-নিষিদ্ধ (cond&&expr-রীতি) + কিল→সিড→বুট ক্রম (s279-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s296-home-page.html
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
poll(){
  local i r
  for i in $(seq 1 "${3:-20}"); do
    r=$(ev "$1" 2>/dev/null | tr -d '"\\')
    if echo "$r" | grep -qF -- "$2"; then return 0; fi
    sleep 0.5
  done
  echo "poll-final: $r"
  return 1
}
kill8094(){
  local pid i j
  for i in 1 2 3; do
    pid=$(lsof -t -i :8094 2>/dev/null | head -1)
    [ -z "$pid" ] && return 0
    kill "$pid" 2>/dev/null
    for j in $(seq 1 16); do
      lsof -t -i :8094 2>/dev/null | grep -q . || return 0
      sleep 0.5
    done
    kill -9 "$pid" 2>/dev/null
    sleep 1
  done
  return 0
}
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ + সিড (কিল→সিড→বুট) ──"
kill8094
S1=$(node "$APP/scripts/s296-seedhome.js" seed 2>/dev/null)
S2=$(node "$APP/scripts/s292-seedhome.js" seed 2>/dev/null)
echo "$S1" | grep -q "SEED-OK count=7" && ok "s296-সিড ×৭" || bad "s296-সিড ($S1)"
echo "$S2" | grep -q "SEED-OK count=2" && ok "s292-সিড ×২ (সহ-অস্তিত্ব)" || bad "s292-সিড ($S2)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: সোর্স-কাঠামো (today.ejs + pages.js + style.css) ──"
EJS=$(cat "$APP/views/partials/home/today.ejs")
PJS=$(cat "$APP/routes/pages.js")
CSSF=$(cat "$APP/public/assets/css/style.css")
# session296-ভিউ-মার্কার
containsF "হোভার-ওভারলে মার্কআপ" "$EJS" '<span class="epk291-hover296" aria-hidden="true">'
containsF "হোভার-বাটন লেবেল" "$EJS" 'পূর্ণাঙ্গ পাতা পড়ুন</span>'
containsF "চেইন-ইঞ্জিন setImg296" "$EJS" 'function setImg296(p) {'
containsF "লোড-হ্যান্ডলার (ফ্ল্যাশ-শূন্য)" "$EJS" "img.addEventListener('load', showImg296);"
containsF "চেইন-অগ্রগতি (shift)" "$EJS" 'chain.shift();'
containsF "স্ট্যাট-রো মার্কআপ" "$EJS" '<div class="te-stats296" role="list"'
containsF "চেকলিস্টে যুগান্তর" "$EJS" 'প্রথম আলো, ইত্তেফাক, যুগান্তর, সমকাল ও কালের কণ্ঠের মূল প্রথম পাতা'
containsF "চেকলিস্টে আমার দেশ+মানবকণ্ঠ" "$EJS" 'আমার দেশ, মানবকণ্ঠ ও ক্যাম্পাস সাহিত্য ক্রোড়পত্রের পূর্ণাঙ্গ সংখ্যা'
# s292-মার্কার-অক্ষুণ্ণ (রিগ্রেশন-চুক্তি)
containsF "s292-অক্ষুণ্ণ: ফিল্ম-থাম্ব-SSR" "$EJS" '<% if (p.thumb) { %><span class="epk291-film-thumb" aria-hidden="true">'
containsF "s292-অক্ষুণ্ণ: wired-গার্ড" "$EJS" 'if (window.__epk291wired) return;'
containsF "s292-অক্ষুণ্ণ: অটো-স্লাইড ৩.৫সে" "$EJS" '}, 3500);'
# pages.js-মার্কার
containsF "রুট: LIMIT 14 (আজ)" "$PJS" 'AND scheduled_date = ? ORDER BY id ASC LIMIT 14'
containsF "রুট: সর্বশেষ-দিন সাবকুয়েরি" "$PJS" 'scheduled_date = (SELECT MAX(scheduled_date) FROM epaper_files WHERE published = 1)'
containsF "রুট: জনপ্রিয়-র‍্যাংক তালিকা" "$PJS" "epPopularRank296 = ['প্রথম আলো', 'যুগান্তর', 'সমকাল', 'কালের কণ্ঠ', 'ইত্তেফাক', 'আমার দেশ', 'মানবকণ্ঠ']"
containsF "রুট: চেইন-নির্মাণ" "$PJS" 'p.thumbs = chain296;'
containsF "রুট: ফিল্ম-ক্যাপ ৮" "$PJS" 'epaperToday233.slice(0, 8)'
containsF "রুট: স্ট্যাট-কুয়েরি" "$PJS" 'COUNT(DISTINCT paper_name) AS totalPapers'
# style.css-মার্কার
containsF "CSS: প্রশস্ত aspect-ratio শিট" "$CSSF" 'aspect-ratio: 20 / 29;'
containsF "CSS: contain (কাটা-যাবে-না)" "$CSSF" '.epk291-img { object-fit: contain; object-position: center top; }'
containsF "CSS: হোভার-ওভারলে" "$CSSF" '.epk291-front:hover .epk291-hover296,'
containsF "CSS: টাচে-ওভারলে-বিলোপ" "$CSSF" '@media (hover: none) { .epk291-hover296 { display: none; } }'
containsF "CSS: ফিল্ম ৪-কলাম গ্রিড" "$CSSF" 'grid-template-columns: repeat(4, minmax(0, 1fr));'
containsF "CSS: স্ট্যাট-রো ব্লক" "$CSSF" '.te-stats296 {'
containsF "CSS: s292-অক্ষুণ্ণ (film-thumb cover)" "$CSSF" '.epk291-film-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }'

echo "── ধাপ-২: মার্কার-সিড-হোম SSR ──"
curl -s "$BASE/" -o "$PAGE" || { bad "হোম-SSR ফেচ"; }
BN=$(grep -o 'class="epk291-film-btn"' "$PAGE" | wc -l)
if [ "$BN" -eq 8 ]; then ok "ফিল্ম-বাটন ক্যাপ-৮ ($BN)"; else bad "ফিল্ম-বাটন সংখ্যা ($BN ≠ ৮)"; fi
N0=$(grep -o 'epk291-film-name">[^<]*' "$PAGE" | sed -n '1p')
if echo "$N0" | grep -qF 'প্রথম আলো'; then ok "র‍্যাংক-১: প্রথম আলো প্রথম"; else bad "র‍্যাংক-১ ভুল ($N0)"; fi
NAMES=$(grep -o 'epk291-film-name">[^<]*' "$PAGE" | sed 's/epk291-film-name">//')
RANK_OK=1
i=0
for want in 'যুগান্তর' 'সমকাল' 'কালের কণ্ঠ' 'ইত্তেফাক' 'আমার দেশ' 'মানবকণ্ঠ'; do
  i=$((i+1))
  got=$(echo "$NAMES" | sed -n "$((i+1))p")
  echo "$got" | grep -qF "$want" || RANK_OK=0
done
if [ "$RANK_OK" -eq 1 ]; then ok "র‍্যাংক ২-৭: জনপ্রিয়-ক্রম সঠিক"; else bad "র‍্যাংক-ক্রম ভুল"; fi
grep -qF 'id="epk291Img" src="/api/epaper/thumb/' "$PAGE" && ok "মূল-img: প্রথম-পাতা-চেইন src" || bad "মূল-img src চেইন-বহির্ভূত"
grep -qF 'class="te-stats296"' "$PAGE" && ok "স্ট্যাট-রো SSR" || bad "স্ট্যাট-রো অনুপস্থিত"
STN=$(grep -oF 'role="listitem"' "$PAGE" | wc -l)
if [ "$STN" -eq 3 ]; then ok "স্ট্যাট-রো ৩টি আইটেম"; else bad "স্ট্যাট-আইটেম ($STN ≠ ৩)"; fi
grep -qF 'epk291-hover296' "$PAGE" && ok "হোভার-ওভারলে SSR" || bad "হোভার-ওভারলে অনুপস্থিত"

echo "── ধাপ-৩: E2E (agent-browser) ──"
agent-browser close >/dev/null 2>&1 || true
sleep 1
# open-রিট্রাই + url-যাচাই (নীরব-ব্যর্থ-open → about:blank — ফ্ল্যাকি-ওপেন-গোটচা)
OPENED=""
for k in 1 2 3; do
  agent-browser open "$BASE/" >/dev/null 2>&1
  sleep 2
  U=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$U" | grep -qF "localhost:8094"; then OPENED=1; break; fi
  sleep 1
done
if [ -n "$OPENED" ]; then ok "open (url-যাচাই)"; else bad "open ব্যর্থ (url=$U)"; fi
# রেডিনেস-পোল (কিয়স্ক-DOM — ফ্ল্যাকি-ওপেন-রোধ; খালি-রিটার্নে স্কিপ — পরবর্তী-জ্যামিতি-চেকই মূল-গেট)
RD=$(poll '(function(){var k=!!document.getElementById("epKiosk291");return k?"READY":"WAIT";})()' 'READY' 50)
if echo "$RD" | grep -qF 'READY'; then ok "ব্রাউজার-রেডি (কিয়স্ক DOM)"; else skip "ব্রাউজার-রেডি-পোল ($RD) — পরবর্তী-চেক-ই-গেট"; fi
# ডেস্কটপ-জ্যামিতি
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
D=$(ev 'JSON.stringify((function(){var s=document.getElementById("epk291Front");var cs=getComputedStyle(s);var film=document.getElementById("epk291Film");var w=parseFloat(cs.width);var cols=getComputedStyle(film).gridTemplateColumns.split(" ").length;var st=document.querySelector(".te-stats296");return {w:Math.round(w),fit:getComputedStyle(document.getElementById("epk291Img")).objectFit,cols:cols,stats:!!st,ov:!!document.querySelector(".epk291-hover296")};})())' | tr -d '"\\')
echo "$D" | grep -qF 'w:330' && ok "শিট-প্রস্থ 330px" || bad "শিট-প্রস্থ ($D)"
echo "$D" | grep -qF 'fit:contain' && ok "object-fit contain" || bad "object-fit ($D)"
echo "$D" | grep -qF 'cols:4' && ok "ফিল্ম গ্রিড ৪-কলাম" || bad "গ্রিড-কলাম ($D)"
echo "$D" | grep -qF 'stats:true' && ok "স্ট্যাট-রো DOM" || bad "স্ট্যাট-রো DOM ($D)"
echo "$D" | grep -qF 'ov:true' && ok "হোভার-ওভারলে DOM" || bad "ওভারলে DOM ($D)"
# ব্যর্থ-চেইন → লোগো-ফলব্যাচ (যুগান্তরে ক্লিক: নকল drive-id → প্রক্সি-ব্যর্থ → লোগো)
# রেস-গোটচা (s291-চুক্তি): mouseenter-ডিসপ্যাচে ইঞ্জিন-পজ — অটো-স্লাইড পোলের-মাঝে সরে-যায়-না
CLK=$(ev 'JSON.stringify((function(){var sec=document.getElementById("today-epaper");sec.scrollIntoView({block:"center"});sec.dispatchEvent(new MouseEvent("mouseenter"));var btns=document.querySelectorAll(".epk291-film-btn");for(var i=0;i<btns.length;i++){if(btns[i].textContent.indexOf("যুগান্তর")!==-1){btns[i].click();return "clicked";}}return "notfound";})())' | tr -d '"\\')
echo "$CLK" | grep -qF 'clicked' && ok "যুগান্তর-বাটন ক্লিক (পজ-সহ)" || bad "ক্লিক-ব্যর্থ ($CLK)"
# চেইন-অগ্রগতি নির্ধারক-পরীক্ষা (s292-চুক্তি — synthetic error-ডিসপ্যাচ):
# নেটওয়ার্ক-নির্ভর-টাইমআউট-বর্জন — প্রতি-ডিসপ্যাচে ইঞ্জিন পরের-প্রার্থীতে যায়; শেষ-প্রার্থী লোগো-ব্যানার
chaindispatch(){
  local k CUR
  for k in 1 2 3 4 5 6; do
    CUR=$(ev '(function(){var img=document.getElementById("epk291Img");var s=img.getAttribute("src");if(s&&s.indexOf("009-jugantor.com.png")!==-1)return "ATLOGO";img.dispatchEvent(new Event("error"));return "dispatched";})()' | tr -d '"\\')
    echo "$CUR" | grep -qF 'ATLOGO' && return 0
    sleep 0.4
  done
  return 1
}
# poll() সফলতায় নীরব (exit-code-চুক্তি — s292-রীতি); ব্যর্থতায় poll-final-echo
if chaindispatch && poll '(function(){var img=document.getElementById("epk291Img");return (img.complete&&img.naturalWidth>0&&img.getAttribute("src")&&img.getAttribute("src").indexOf("009-jugantor.com.png")!==-1)?"FALL":"WAIT";})()' 'FALL' 20; then
  ok "চেইন-ফলব্যাচ → লোগো-ব্যানার (লোডেড)"
elif chaindispatch && poll '(function(){var img=document.getElementById("epk291Img");return (img.complete&&img.naturalWidth>0&&img.getAttribute("src")&&img.getAttribute("src").indexOf("009-jugantor.com.png")!==-1)?"FALL":"WAIT";})()' 'FALL' 30; then
  ok "চেইন-ফলব্যাচ → লোগো-ব্যানার (লোডেড — রিট্রাই)"
else
  bad "চেইন-ফলব্যাচ"
fi
CTA=$(ev '(function(){return document.getElementById("teKioskCtaText291").textContent;})()' | tr -d '"\\')
echo "$CTA" | grep -qF 'যুগান্তর পড়ুন' && ok "CTA-সিঙ্ক" || bad "CTA ($CTA)"
ev '(function(){document.getElementById("today-epaper").dispatchEvent(new MouseEvent("mouseleave"));return "resumed";})()' >/dev/null 2>&1
# মোবাইল-390
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO";})()' | tr -d '"\\')
echo "$HS" | grep -qF 'NO' && ok "390px-ডক-hScroll-শূন্য" || bad "390px-hScroll ($HS)"
MS=$(ev 'JSON.stringify((function(){var s=document.getElementById("epk291Front");return {w:Math.round(parseFloat(getComputedStyle(s).width)),fit:getComputedStyle(document.getElementById("epk291Img")).objectFit};})())' | tr -d '"\\')
echo "$MS" | grep -qF 'w:292' && ok "মোবাইল শিট 292px" || bad "মোবাইল শিট ($MS)"
echo "$MS" | grep -qF 'fit:contain' && ok "মোবাইল contain" || bad "মোবাইল fit ($MS)"
if agent-browser screenshot "$ROOT/download/s296-epk-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s296-epk-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
C1=$(node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null)
echo "$C1" | grep -q "CLEAN-OK deleted=7" && ok "s296-ক্লিন (deleted=7)" || bad "s296-ক্লিন ($C1)"
C2=$(node "$APP/scripts/s292-seedhome.js" clean 2>/dev/null)
echo "$C2" | grep -q "CLEAN-OK deleted=2" && ok "s292-ক্লিন (deleted=2)" || bad "s292-ক্লিন ($C2)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট"

echo "══════════════════════════════"
echo "s296-epkwide: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" -eq 0 ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
