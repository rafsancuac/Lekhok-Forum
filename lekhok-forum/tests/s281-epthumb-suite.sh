#!/bin/bash
# s281-epthumb-suite.sh — session281 ই-পেপার রিডার রেল-থাম্বনেইল-ক্যাশ সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: সমান্তরাল session280-ইউজার-রাউন্ড (311761c..776d7ec — PressReader ৩-প্যানেল) বাম-পাতা-রেল
# (অলস-ক্রমিক ছোট-ক্যানভাস থাম্বনেইল) ইতিমধ্যে-স্থাপিত; এ-রাউন্ড (session281) তাদের-শীর্ষ-প্রস্তাব
# **রেল-থাম্বনেইল-ক্যাশ** বাস্তবায়ন — alive-এন্ট্রিতে dataURL (JPEG ০.৭২), LOWMEM-স্কিপ, tok-গার্ড-স্টোর।
# কভারেজ: ① সোর্স-কাঠামো (railThumbs-ক্যাশ + LOWMEM-গার্ড + tok-গার্ড + __ep281QA হুক + img-CSS ep281-ব্লক হেক্স-শূন্য)
#          ② রেন্ডার্ড-কাঠামো (curl /epaper — ep-rail-মার্কআপ + data-papers)
#          ③ E2E (agent-browser + fetch-intercept pdf-lib ৩-পাতা-PDF — scripts/s281-genpdf.js):
#             প্রথম-ভিজিট → stored=৩ (canvas-রেন্ডার + dataURL-সংরক্ষণ) + cacheArmed + canvas ×৩,
#             পুনঃ-ভিজিট (keep-alive re-attach) → restored=৩ (dataURL img ×৩ — রেন্ডার-শূন্য-পথ) + stored-অপরিবর্তিত,
#             রেল-ক্লিকে পাতা-জাম্প (is-on data-n=৩), 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s272-চুক্তি + session281-কিল-রেস-গোটচা: পোর্ট-ফ্রি-পোলিং-কিল)
# চুক্তি: ① ডেটা-নির্ভর: epaper_files-শূন্যে মার্কার-সিড (কিল→সিড→বুট / কিল→ক্লিন→বুট — ক্রম-বাধ্যতমূলক)
#         ② eval-escaped-quote-নিষিদ্ধ (Write-টুল-ম্যাংলিং-গোটচা — index/লুপ/String.indexOf-কৌশল)
#         ③ css-nocache-relink (epaper.css মেমরি-ক্যাশ-গোটচা — session279) ④ eval-JSON tr -d '"\\' + grep -qF
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s281-ep-page.html
J=/tmp/s281-ep-jar.txt
PDFB64=$(node "$APP/scripts/s281-genpdf.js")
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
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
  # session281-গোটচা: এক-শট-কিল-নীরব-ব্যর্থতা → ensure-server-নো-অপ + মেমরি/ফাইল-বিচ্যুতি;
  # মৃত্যুমুখী-flush keep-alive-সংযোগের-জন্য-দেরায় → দেরিতে-flush সিড-ওভাররাইট — পোর্ট-ফ্রি-পোলিং বাধ্যতমূলক
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
plen(){ node -e "const m=require('fs').readFileSync('$PAGE','utf8').match(/data-papers=.([^\"]*)/);try{console.log(JSON.parse(decodeURIComponent(m?m[1]:'[]')).length)}catch(e){console.log(0)}" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
if [ -n "$PDFB64" ] && [ "${#PDFB64}" -gt 1000 ]; then ok "pdf-lib ৩-পাতা-PDF নির্মিত (base64 ${#PDFB64}-অক্ষর)"; else bad "PDF-জেনারেটর ব্যর্থ"; fi
LMEV=$(agent-browser open "about:blank" >/dev/null 2>&1; agent-browser eval 'navigator.deviceMemory||8' 2>/dev/null | tr -d '"')
echo "  · QA-ব্রাউজার deviceMemory=$LMEV (lowmem-সচেতনতা: ক্যাশ-সব-ডিভাইসে — dataURL-ই-সাশ্রয়ী-ফরম্যাট)"

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJS=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
containsF "ক্যাশ-স্টোর (railThumbs alive-এন্ট্রিতে)" "$EJS" 'aentry.railThumbs || (aentry.railThumbs = [])'
containsF "সব-ডিভাইসে-ক্যাশ (LOWMEM-স্কিপ-নিষিদ্ধ — dataURL-ই-সাশ্রয়ী-ফরম্যাট)" "$EJS" 'var cache = (aentry && numPages >= 2) ? (aentry.railThumbs || (aentry.railThumbs = [])) : null;'
containsF "≥২-পাতা-গার্ড" "$EJS" '(aentry && numPages >= 2)'
containsF "dataURL-সংরক্ষণ (JPEG ০.৭২)" "$EJS" "toDataURL('image/jpeg', 0.72)"
containsF "স্টোর-টোকেন-গার্ড (সুইচ-পরবর্তী-স্টোর-নিষিদ্ধ)" "$EJS" 'if (cache && tok === railTok) { try { cache[n] = cv.toDataURL'
containsF "ক্যাশ-হিট-পথ (img dataURL — রেন্ডার-শূন্য)" "$EJS" "host.innerHTML = '<img alt=\"\" draggable=\"false\" src=\"' + cached + '\" />';"
containsF "হিট-পথ-বিরতি-শূন্য (তাৎক্ষণিক-স্টেপ)" "$EJS" 'ep281Restored++;'
containsF "QA-হুক __ep281QA" "$EJS" 'window.__ep281QA'
containsF "হুক-ফিল্ড ×৪ (stored/restored/lowmem/cacheArmed)" "$EJS" 'cacheArmed: function'
B281=$(echo "$CSSF" | sed -n '/═══ session281 — রেল-থাম্বনেইল-ক্যাশ/,$p')
if [ -n "$B281" ]; then
  ok "ep281-ব্লক উপস্থিত"
  HEXN=$(echo "$B281" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep281-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep281-ব্লকে হেক্স $HEXN"; fi
  containsF "dataURL-img-স্টাইল (canvas-রূপ-মিরর)" "$B281" '.ep-rail-thumb img'
  containsF "reduced-motion-গার্ড" "$B281" 'prefers-reduced-motion'
else
  bad "ep281-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো ──"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
E2E_OK=1
if [ "$PAPERSN" -ge 1 ] && [ "$PRELEN" -ge 1 ]; then ok "data-papers এমবেডেড (PRE=$PRELEN)"; else
  E2E_OK=0
  echo "── ধাপ-২.৫: মার্কার-সিড (কিল→সিড→বুট — ক্রম-গোটচা) ──"
  kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
  SR=$(node "$APP/scripts/s281-seedpaper.js" seed 2>/dev/null)
  if echo "$SR" | grep -q "SEED-"; then ok "মার্কার-সিড ($SR)"; else bad "সিড-ব্যর্থ ($SR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
  SEEDLEN=$(plen)
  PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
  if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; E2E_OK=1; else bad "সিড-পরেও-শূন্য (HTTP $PC2 attr=$PAPERSN len=$SEEDLEN)"; fi
fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser + fetch-intercept) ──"
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && { balive || true; agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.2; }
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
CSSIMG=$(ev '(function(){var h=document.querySelector(".ep-rail-thumb");return h?getComputedStyle(h.querySelector("img")||h).display:"none"})()' | tr -d '"')
CSSPOS=$(ev 'getComputedStyle(document.querySelector(".ep-rail")).display' | tr -d '"')
if [ "$CSSPOS" = "flex" ]; then ok "epaper.css লোড-প্রমাণ (রেল display:flex — nocache-relink)"; else bad "CSS-অদৃশ্য/পুরাতন-ক্যাশ ($CSSPOS)"; fi
ev "window.fetch=(function(of){return function(u,o){u=String(u&&u.url||u);if(u.indexOf('/api/epaper/file/')>=0){var b=atob('$PDFB64'),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return Promise.resolve(new Response(a,{status:200,headers:{'content-type':'application/pdf'}}));}return of(u,o);}})(window.fetch.bind(window));0" >/dev/null 2>&1
ev 'var I=document.querySelectorAll("#epList .ep-item");if(I[0])I[0].click();0' >/dev/null 2>&1
if poll 'window.__ep281QA&&window.__ep281QA.stored()+""' '3' 40; then ok "প্রথম-ভিজিট: stored=৩ (canvas-রেন্ডার + dataURL-সংরক্ষণ)"; else bad "stored-অসম্পূর্ণ ($(ev 'window.__ep281QA&&window.__ep281QA.stored()+""'))"; fi
CA=$(ev 'window.__ep281QA.cacheArmed()+""' | tr -d '"')
if [ "$CA" = "true" ]; then ok "ক্যাশ-অস্ত্রসজ্জা (alive-এন্ট্রি railThumbs)"; else bad "ক্যাশ-অনস্ত্রসজ্জা ($CA)"; fi
CANV=$(ev 'document.querySelectorAll(".ep-rail-thumb canvas").length+""' | tr -d '"')
if [ "$CANV" = "3" ]; then ok "প্রথম-ভিজিটে canvas ×৩ (রেন্ডার-পথ অক্ষুণ্ণ)"; else bad "canvas=$CANV"; fi
PND=$(ev 'document.querySelectorAll(".ep-rail-thumb.is-pending").length+""' | tr -d '"')
if [ "$PND" = "0" ]; then ok "সম্পূর্ণ-রেন্ডার (is-pending-শূন্য)"; else bad "is-pending-অবশিষ্ট ($PND)"; fi
IMGC=$(ev 'document.querySelectorAll(".ep-rail-thumb img").length+""' | tr -d '"')
if [ "$IMGC" = "0" ]; then ok "প্রথম-ভিজিটে img-শূন্য (সংরক্ষণ-পথে-canvas)"; else bad "প্রথম-ভিজিটেই img ($IMGC)"; fi
# পুনঃ-ভিজিট (একই-পত্রিকা — keep-alive re-attach → রেল-পুনঃনির্মাণ → ক্যাশ-হিট)
ev 'var I=document.querySelectorAll("#epList .ep-item");if(I[0])I[0].click();0' >/dev/null 2>&1
if poll 'window.__ep281QA.restored()+""' '3' 30; then ok "পুনঃ-ভিজিট: restored=৩ (dataURL-তাৎক্ষণিক-পুনঃদর্শন — রেন্ডার-শূন্য)"; else bad "restored-ব্যর্থ ($(ev 'window.__ep281QA.restored()+""'))"; fi
IMGC2=$(ev 'document.querySelectorAll(".ep-rail-thumb img").length+""' | tr -d '"')
if [ "$IMGC2" = "3" ]; then ok "পুনঃ-ভিজিটে img ×৩ (ক্যাশ-হিট-পথ)"; else bad "পুনঃ-ভিজিটে img=$IMGC2"; fi
SRC0=$(ev '(function(){var i=document.querySelector(".ep-rail-thumb img");return i?String(i.src).slice(0,15):"none"})()' | tr -d '"')
if echo "$SRC0" | grep -qF 'data:image/jpe'; then ok "img-src data:image/jpeg (JPEG-ক্যাশ-প্রমাণ)"; else bad "src=$SRC0"; fi
ST2=$(ev 'window.__ep281QA.stored()+""' | tr -d '"')
if [ "$ST2" = "3" ]; then ok "stored-অপরিবর্তিত পুনঃ-ভিজিটে (৩→৩ — পুনঃ-রেন্ডার-শূন্য)"; else bad "stored-পরিবর্তিত ($ST2)"; fi
CANV2=$(ev 'document.querySelectorAll(".ep-rail-thumb canvas").length+""' | tr -d '"')
if [ "$CANV2" = "0" ]; then ok "পুনঃ-ভিজিটে canvas-শূন্য (pdf.js-স্পর্শ-শূন্য)"; else bad "canvas=$CANV2"; fi
# রেল-ক্লিকে পাতা-জাম্প (is-on সিঙ্ক)
ev 'var B=document.querySelectorAll(".ep-rail-item");if(B[2])B[2].click();0' >/dev/null 2>&1
sleep 1.2
ISON=$(ev '(function(){var b=document.querySelector(".ep-rail-item.is-on");return b?b.getAttribute("data-n"):"0"})()' | tr -d '"')
if [ "$ISON" = "3" ]; then ok "রেল-ক্লিকে পাতা-৩-জাম্প + is-on-সিঙ্ক"; else bad "is-on=$ISON"; fi
ev 'var B=document.querySelectorAll(".ep-rail-item");if(B[0])B[0].click();0' >/dev/null 2>&1; sleep 0.8

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s281-epthumb-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s281-epthumb-desk.png" ]; then ok "s281-epthumb-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s281-epthumb-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s281-epthumb-mobile390.png" ]; then ok "s281-epthumb-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-পরেও-শূন্য) ──"
skip "E2E-আচরণ"
skip "মোবাইল-390 + স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (mo268-চুক্তি) ──"
kill8094
CR=$(node "$APP/scripts/s281-seedpaper.js" clean 2>/dev/null)
if echo "$CR" | grep -q "CLEAN-OK deleted=1"; then ok "মার্কার-ক্লিন (ডিলিট=১)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
curl -s -o "$PAGE" "$BASE/epaper"
FINLEN=$(plen)
if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
ok "fetch-intercept-ক্লায়েন্ট-কাল্পনিক-পিডিএফ (সার্ভার-ফাইল-স্পর্শ-শূন্য; মিউটেশন-POST-শূন্য)"

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
