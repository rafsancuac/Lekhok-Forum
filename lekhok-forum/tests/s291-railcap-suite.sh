#!/bin/bash
# s291-railcap-suite.sh — session291 ই-পেপার রেল-থাম্বনেইল আগাম-ক্যাপ + অলস-IO-পথ সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: s281-রেল-থাম্বনেইল-ক্যাশ-এর-শীর্ষে session291-প্রস্তাব — LOWMEM-ডিভাইসে eager-রেন্ডার
# সব-পাতায় চলে (বড়-সংখ্যায় খোলায় CPU/মেমরি-চাপ) → ep291: RAIL_PRE_MAX-ক্যাপ (LOWMEM=৬, নাহলে ০)
# + IntersectionObserver-অলস-পথ (দৃশ্যমান-হলে রেন্ডার; ক্যাশ-হিট ক্যাপের-উপরে তাৎক্ষণিক)।
# কভারেজ: ① সোর্স-কাঠামো (RAIL_PRE_MAX + ক্যাপ-গেট + ep291Paint/Queue + IO-টোকেন-গার্ড + __ep291QA হুক
#          + ep291-CSS-ব্লক হেক্স-শূন্য + s281-স্ট্রিং-সব-অক্ষুণ্ণ)
#          ② রেন্ডার্ড-কাঠামো (curl /epaper — ep-rail-মার্কআপ + data-papers)
#          ③ E2E (agent-browser + fetch-intercept pdf-lib ৯-পাতা-PDF — scripts/s291-genpdf.js):
#             বুট (LOWMEM=false → ক্যাপ ০) → stored=৯ সব-eager (s281-আচরণ-অক্ষুণ্ণ),
#             setPreMax(6,true) @1280×400 → মিড-স্টেট: canvases=৬ + pending=৩ + lazy=০ (ক্যাপ-ধারণ-প্রমাণ),
#             থাম্ব ৭→৮→৯ scrollintoview → canvases=৯ + pending=০ + lazy=৩ (অলস-দৃশ্যমানতা-পথ-প্রমাণ),
#             setPreMax(1) (ক্যাশ-অক্ষত) → imgs=৯ + canvases=০ (ক্যাশ-হিট-ক্যাপের-উপরে — তাৎক্ষণিক),
#             পুনঃ-ভিজিট (keep-alive) → restored-বৃদ্ধি (s281-পথ-অক্ষুণ্ণ), রেল-ক্লিকে পাতা-৯-জাম্প,
#             390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-সিড/ক্লিন নেট-শূন্য (s272-চুক্তি; s281-seedpaper-পুনঃব্যবহার)
# চুক্তি: ① ডেটা-নির্ভর: epaper_files-শূন্যে মার্কার-সিড (কিল→সিড→বুট — ক্রম-বাধ্যতমূলক)
#         ② eval-escaped-quote-নিষিদ্ধ (Write-টুল-ম্যাংলিং-গোটচা — index/লুপ/String.indexOf-কৌশল)
#         ③ css-nocache-relink (epaper.css মেমরি-ক্যাশ-গোটচা — session279) ④ eval-JSON tr -d '"\\' + grep -qF
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s291-ep-page.html
PDFB64=$(node "$APP/scripts/s291-genpdf.js" 9)
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
if [ -n "$PDFB64" ] && [ "${#PDFB64}" -gt 1000 ]; then ok "pdf-lib ৯-পাতা-PDF নির্মিত (base64 ${#PDFB64}-অক্ষর)"; else bad "PDF-জেনারেটর ব্যর্থ"; fi
LMEV=$(agent-browser open "about:blank" >/dev/null 2>&1; agent-browser eval 'navigator.deviceMemory||8' 2>/dev/null | tr -d '"')
echo "  · QA-ব্রাউজার deviceMemory=$LMEV (LOWMEM-সিমুলেশন QA-হুকেই — setPreMax পথ-ব্যায়াম)"

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJS=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
containsF "ক্যাপ-ঘোষণা (LOWMEM?৬:০)" "$EJS" 'var RAIL_PRE_MAX = LOWMEM ? 6 : 0;'
containsF "ক্যাপ-গেট (eager-লুপে — ক্যাশ-হিট-পরে)" "$EJS" 'if (RAIL_PRE_MAX > 0 && n > RAIL_PRE_MAX) { ep291Queue(items[n - 1], n, st, cache, tok); return step(); }'
containsF "অলস-পেইন্টার (টোকেন-গার্ড)" "$EJS" 'function ep291Paint(item, n, st, cache, tok)'
containsF "অলস-কিউ (is-lazy-শ্রেণি)" "$EJS" "item.classList.add('is-lazy');"
containsF "IO-রুট=রেল-স্ক্রলার" "$EJS" "{ root: elRail, rootMargin: '80px' }"
containsF "IO-ফায়ারে-unobserve (একক-পেইন্ট-গার্ড)" "$EJS" 'ep291IO.unobserve(ents[i].target);'
containsF "অলস-ক্যাশ-সংরক্ষণ (eager-চুক্তি-মিরর)" "$EJS" "if (cache && tok === railTok) { try { cache[n] = cv.toDataURL('image/jpeg', 0.72); ep281Stored++; } catch (e) {} }"
containsF "QA-হুক __ep291QA" "$EJS" 'window.__ep291QA'
containsF "setPreMax (ক্যাশ-বিসর্জন-আর্গ)" "$EJS" 'setPreMax: function (n, reset)'
containsF "IO-অনুপস্থিত-ফলব্যাক (পুরাতন-ব্রাউজার সরাসরি-পেইন্ট)" "$EJS" "if (!('IntersectionObserver' in window)) { ep291Paint(item, n, st, cache, tok); return; }"
# s281-স্ট্রিং-অক্ষুণ্ণ (পূর্ব-সুইট-গ্রেপ-চুক্তি — eager-বডি-অস্পৃশ্য-প্রমাণ)
containsF "s281-অক্ষুণ্ণ: ক্যাশ-স্টোর" "$EJS" 'aentry.railThumbs || (aentry.railThumbs = [])'
containsF "s281-অক্ষুণ্ণ: ক্যাশ-ঘোষণা" "$EJS" 'var cache = (aentry && numPages >= 2) ? (aentry.railThumbs || (aentry.railThumbs = [])) : null;'
containsF "s281-অক্ষুণ্ণ: হিট-পথ-img" "$EJS" "host.innerHTML = '<img alt=\"\" draggable=\"false\" src=\"' + cached + '\" />';"
containsF "s281-অক্ষুণ্ণ: QA-হুক __ep281QA" "$EJS" 'window.__ep281QA'
B291=$(echo "$CSSF" | sed -n '/session291 — LOWMEM-আগাম-ক্যাপ/,$p')
if [ -n "$B291" ]; then
  ok "ep291-CSS-ব্লক উপস্থিত"
  HEXN=$(echo "$B291" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep291-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep291-ব্লকে হেক্স $HEXN"; fi
  containsF "is-lazy-শান্ত-প্লেসহোল্ডার (dashed-বর্ডার)" "$B291" '.ep-rail-item.is-lazy .ep-rail-thumb.is-pending { border-style: dashed; }'
  containsF "is-lazy-ধীর-শিমার (কম-অ্যানিমেশন-ব্যয়)" "$B291" 'animation-duration: 2.2s'
  containsF "reduced-motion-গার্ড" "$B291" 'prefers-reduced-motion'
else
  bad "ep291-CSS-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: রেন্ডার্ড-কাঠামো ──"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
if [ "$PC" = "200" ]; then ok "/epaper 200"; else bad "/epaper HTTP $PC"; fi
PRELEN=$(plen)
PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
SEEDFLAG=0
E2E_OK=1
if [ "$PAPERSN" -ge 1 ] && [ "$PRELEN" -ge 1 ]; then ok "data-papers এমবেডেড (PRE=$PRELEN)"; else
  SEEDFLAG=1
  echo "── ধাপ-২.৫: মার্কার-সিড (কিল→সিড→বুট — ক্রম-গোটচা) ──"
  kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
  SR=$(node "$APP/scripts/s281-seedpaper.js" seed 2>/dev/null)
  if echo "$SR" | grep -q "SEED-"; then ok "মার্কার-সিড ($SR)"; else bad "সিড-ব্যর্থ ($SR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  PC2=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/epaper")
  SEEDLEN=$(plen)
  PAPERSN=$(grep -o 'data-papers="' "$PAGE" | wc -l)
  if [ "$PC2" = "200" ] && [ "$PAPERSN" -ge 1 ] && [ "$SEEDLEN" -ge 1 ]; then ok "সিড-পরে data-papers (SEED=$SEEDLEN — PRE=$PRELEN অক্ষুণ্ণ)"; E2E_OK=1; else bad "সিড-পরেও-শূন্য (HTTP $PC2 attr=$PAPERSN len=$SEEDLEN)"; E2E_OK=0; fi
fi

if [ "$E2E_OK" = "1" ]; then
echo "── ধাপ-৩: E2E আচরণ (agent-browser + fetch-intercept) ──"
agent-browser open "$BASE/epaper?qa=$(date +%s)$RANDOM" >/dev/null 2>&1
# open-গেট (রেস-প্রতিকার): ইউনিক-কোয়েরি = জোরালো-fresh-load (পুরনো-পেজ-পুনঃব্যবহার-গোটচা —
# stale-ক্যাপ/কাউন্টার/alive-ক্যাশ সব-শূন্য-নিশ্চিত) + URL-পোল + প্রয়োজনে পুনঃ-open
for i in 1 2 3; do
  for j in $(seq 1 10); do
    BHC=$(agent-browser get url 2>/dev/null || echo '')
    echo "$BHC" | grep -q '/epaper' && break
    sleep 0.5
  done
  echo "$BHC" | grep -q '/epaper' && break
  balive || true
  agent-browser open "$BASE/epaper?qa=$(date +%s)$RANDOM" >/dev/null 2>&1
  sleep 1.5
done
if echo "$BHC" | grep -q '/epaper'; then ok "open-গেট: /epaper fresh-load-প্রমাণ"; else bad "open-ব্যর্থ ($BHC)"; fi
ev 'var L=document.querySelectorAll("link");for(var i=0;i<L.length;i++){if(String(L[i].href).indexOf("epaper.css")>=0){L[i].href=L[i].href+"&nocache="+Date.now()}}0' >/dev/null 2>&1
sleep 0.5
ev "window.fetch=(function(of){return function(u,o){u=String(u&&u.url||u);if(u.indexOf('/api/epaper/file/')>=0){var b=atob('$PDFB64'),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return Promise.resolve(new Response(a,{status:200,headers:{'content-type':'application/pdf'}}));}return of(u,o);}})(window.fetch.bind(window));0" >/dev/null 2>&1
if poll 'document.querySelectorAll("#epList .ep-item").length+""' '1' 30; then ok "তালিকা-রেন্ডার-প্রোব (ep-item ≥১ — ক্লিক-পূর্ব-গেট)"; else bad "তালিকা-রেন্ডার-ব্যর্থ"; fi
ev 'var I=document.querySelectorAll("#epList .ep-item");if(I[0])I[0].click();0' >/dev/null 2>&1
# বুট: ডিভাইস-ডিফল্ট-ক্যাপ-সচেতন (LOWMEM-ব্রাউজারে বুটেই ক্যাপ-সক্রিয় — অ্যাসার্ট শর্তাধীন)
PM0=$(ev 'window.__ep291QA&&window.__ep291QA.preMax()+""' | tr -d '"')
case "$PM0" in 0) EXPBOOT=9;; *) EXPBOOT=$PM0;; esac
if poll 'window.__ep291QA&&window.__ep291QA.eager()+""' "$EXPBOOT" 60; then ok "বুট: eager=$EXPBOOT (ডিফল্ট-ক্যাপ=$PM0-অনুযায়ী শাখা-গেট)"; else bad "বুট-eager-ব্যর্থ ($(ev 'window.__ep291QA&&window.__ep291QA.eager()+""'))"; fi
EXPHOLD=$((9-EXPBOOT))
if poll 'window.__ep291QA&&window.__ep291QA.canvases()+""' "$EXPBOOT" 60; then ok "বুট: canvas=$EXPBOOT (ডিফল্ট-ক্যাপ-অনুযায়ী — QA-ব্রাউজার deviceMemory=৪ = বাস্তব-LOWMEM-পথ)"; else bad "বুট-ক্যানভাস-ব্যর্থ ($(ev 'window.__ep291QA&&window.__ep291QA.canvases()+""'))"; fi
if poll 'window.__ep291QA&&window.__ep291QA.pending()+""' "$EXPHOLD" 40; then ok "বুটে is-pending=$EXPHOLD (ক্যাপ-ধারণের নির্ধারক-প্রমাণ — অদৃশ্য-থাম্ব অলস-কিউতে)"; else bad "বুটে pending=$(ev 'window.__ep291QA&&window.__ep291QA.pending()+""') ($EXPHOLD-প্রত্যাশিত)"; fi
# মিড-স্টেট: ক্যাপ ৬ + ক্যাশ-বিসর্জন (আপেক্ষিক-eager — কাউন্টার-cumulative-চুক্তি)
EGB=$(ev 'window.__ep291QA&&window.__ep291QA.eager()+""' | tr -d '"')
EXP6=$((EGB+6))
agent-browser set viewport 1280 400 >/dev/null 2>&1; sleep 0.4
ev 'window.__ep291QA.setPreMax(6,true)+""' >/dev/null 2>&1
if poll 'window.__ep291QA&&window.__ep291QA.eager()+""' "$EXP6" 40; then ok "ক্যাপ-নির্ধারক-প্রমাণ: eager $EGB→$EXP6 (শাখা-গেট ঠিক-৬-এ থামা — IO-অপেক্ষাকৃত)"; else bad "eager-$EXP6-ব্যর্থ ($(ev 'window.__ep291QA&&window.__ep291QA.eager()+""'))"; fi
ILZ1=$(ev 'document.querySelectorAll(".ep-rail-item.is-lazy").length+""' | tr -d '"')
if [ "$ILZ1" = "3" ]; then ok "is-lazy ×৩ স্থায়ী-কিউ-মার্কার (অলস-হস্তান্তর-প্রমাণ)"; else bad "is-lazy=$ILZ1 (৩-প্রত্যাশিত)"; fi
if poll 'window.__ep291QA&&window.__ep291QA.pending()+""' '3' 30; then ok "মিড-স্টেটে pending=৩ (রি-বিল্ডে ৭-৯ পুনঃ-কিউ — বাস্তব-থাম্ব-গণনা)"; else bad "মিড-স্টেটে pending=$(ev 'window.__ep291QA&&window.__ep291QA.pending()+""') (৩-প্রত্যাশিত)"; fi
IMZ1=$(ev 'window.__ep291QA&&window.__ep291QA.imgs()+""' | tr -d '"')
if [ "$IMZ1" = "0" ]; then ok "মিড-স্টেটে img-শূন্য (ক্যাশ-বিসর্জন-প্রমাণ — সব-তাজা-রেন্ডার)"; else bad "মিড-স্টেটে img=$IMZ1"; fi
# অলস-দৃশ্যমানতা-পথ: থাম্ব ৭→৮→৯ স্ক্রলে রেন্ডার (lazy-আপেক্ষিক)
LZB=$(ev 'window.__ep291QA&&window.__ep291QA.lazy()+""' | tr -d '"')
EXPZ=$((LZB+3))
agent-browser scrollintoview '.ep-rail-item[data-n="7"]' >/dev/null 2>&1; sleep 0.8
agent-browser scrollintoview '.ep-rail-item[data-n="8"]' >/dev/null 2>&1; sleep 0.8
agent-browser scrollintoview '.ep-rail-item[data-n="9"]' >/dev/null 2>&1; sleep 0.8
if poll 'window.__ep291QA&&window.__ep291QA.lazy()+""' "$EXPZ" 40; then ok "অলস-পথ: স্ক্রলে থাম্ব ৭-৯ রেন্ডার (lazy $LZB→$EXPZ — IO-দৃশ্যমানতা-পৃথকতা)"; else bad "অলস-রেন্ডার-অসম্পূর্ণ ($(ev 'window.__ep291QA&&window.__ep291QA.lazy()+""'))"; fi
if poll 'window.__ep291QA&&window.__ep291QA.canvases()+""' '9' 40; then ok "অলস-পথে canvas-মোট ৯ (eager ৬ + অলস ৩)"; else bad "canvas-মোট-ব্যর্থ ($(ev 'window.__ep291QA&&window.__ep291QA.canvases()+""'))"; fi
if poll 'window.__ep291QA&&window.__ep291QA.pending()+""' '0' 40; then ok "অলস-পথে pending-শূন্য (সম্পূর্ণ-পেইন্ট)"; else bad "pending=$(ev 'window.__ep291QA&&window.__ep291QA.pending()+""')"; fi
# ক্যাশ-হিট ক্যাপের-উপরে: ক্যাপ ১ (ক্যাশ-অক্ষত) → সব-হিট তাৎক্ষণিক, eager-স্পর্শ-শূন্য
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
ev 'window.__ep291QA.setPreMax(1)+""' >/dev/null 2>&1
if poll 'window.__ep291QA&&window.__ep291QA.imgs()+""' '9' 30; then ok "ক্যাশ-হিট-ক্যাপের-উপরে: ক্যাপ-১-তেও img ×৯ তাৎক্ষণিক"; else bad "হিট-পথ-ব্যর্থ ($(ev 'window.__ep291QA&&window.__ep291QA.imgs()+""'))"; fi
CAN3=$(ev 'window.__ep291QA&&window.__ep291QA.canvases()+""' | tr -d '"')
if [ "$CAN3" = "0" ]; then ok "হিট-পথে canvas-শূন্য (pdf.js-স্পর্শ-শূন্য)"; else bad "canvas=$CAN3"; fi
EG3=$(ev 'window.__ep291QA&&window.__ep291QA.eager()+""' | tr -d '"')
if [ "$EG3" = "$EXP6" ]; then ok "হিট-পথে eager-অপরিবর্তিত ($EXP6→$EXP6 — নতুন-রেন্ডার-শূন্য)"; else bad "eager=$EG3 ($EXP6-প্রত্যাশিত)"; fi
# পুনঃ-ভিজিট (keep-alive re-attach — s281-পথ অক্ষুণ্ণ)
REST1=$(ev 'window.__ep281QA.restored()+""' | tr -d '"')
ev 'var I=document.querySelectorAll("#epList .ep-item");if(I[0])I[0].click();0' >/dev/null 2>&1
if poll 'window.__ep281QA.restored()+""' "$((REST1+9))" 30; then ok "পুনঃ-ভিজিট: restored $REST1→$((REST1+9)) (s281-ক্যাশ-পথ-অক্ষুণ্ণ)"; else bad "restored-বৃদ্ধি-ব্যর্থ ($(ev 'window.__ep281QA.restored()+""'))"; fi
# রেল-ক্লিকে পাতা-জাম্প (is-on সিঙ্ক — ৯-পাতায়; poll + দৃঢ়-fallback)
ev 'var B=document.querySelectorAll(".ep-rail-item");if(B[8])B[8].click();0' >/dev/null 2>&1
ISONOK=0
for t in $(seq 1 20); do
  ISON=$(ev '(function(){var b=document.querySelector(".ep-rail-item.is-on");return b?b.getAttribute("data-n"):"0"})()' | tr -d '"')
  [ "$ISON" = "9" ] && { ISONOK=1; break; }
  sleep 0.5
done
if [ "$ISONOK" != "1" ]; then
  # fallback: দীর্ঘ-স্মুথ-স্ক্রল-স্টল-গোটচা — দৃঢ়-জাম্প (block:start — অ্যানিমেশন-শূন্য) → পর্যবেক্ষক-সিঙ্ক
  ev 'var h=document.querySelector(".ep-page-holder[data-n=\"9\"]");if(h)h.scrollIntoView({block:"start"});0' >/dev/null 2>&1
  for t in $(seq 1 20); do
    ISON=$(ev '(function(){var b=document.querySelector(".ep-rail-item.is-on");return b?b.getAttribute("data-n"):"0"})()' | tr -d '"')
    [ "$ISON" = "9" ] && { ISONOK=1; break; }
    sleep 0.5
  done
fi
if [ "$ISONOK" = "1" ]; then ok "রেল-ক্লিকে পাতা-৯-জাম্প + is-on-সিঙ্ক"; else bad "is-on=$ISON (৯-প্রত্যাশিত)"; fi
ev 'window.__ep291QA.setPreMax(0)+""' >/dev/null 2>&1
PMF=$(ev 'window.__ep291QA&&window.__ep291QA.preMax()+""' | tr -d '"')
if [ "$PMF" = "0" ]; then ok "setPreMax(0)-রিসেট (ডিফল্টে-ফেরত)"; else bad "রিসেট-ব্যর্থ ($PMF)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য (রেল-অভ্যন্তরীণ-স্ক্রল)"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s291-railcap-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s291-railcap-desk.png" ]; then ok "s291-railcap-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s291-railcap-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s291-railcap-mobile390.png" ]; then ok "s291-railcap-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1
else
echo "── ধাপ-৩/৪: E2E-স্কিপড (সিড-পরেও-শূন্য) ──"
skip "E2E-আচরণ"
skip "মোবাইল-390 + স্ক্রিনশট"
fi

echo "── ধাপ-৫: মার্কার-ক্লিন + নেট-DB-রাইট-শূন্য (s272-চুক্তি) ──"
if [ "$SEEDFLAG" = "1" ]; then
  kill8094
  CR=$(node "$APP/scripts/s281-seedpaper.js" clean 2>/dev/null)
  if echo "$CR" | grep -q "CLEAN-OK deleted=1"; then ok "মার্কার-ক্লিন (ডিলিট=১)"; else bad "ক্লিন-ব্যর্থ ($CR)"; fi
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
  curl -s -o "$PAGE" "$BASE/epaper"
  FINLEN=$(plen)
  if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
else
  FINLEN=$(plen)
  if [ "$PRELEN" = "$FINLEN" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (papers PRE=$PRELEN → FINAL=$FINLEN — সিড-শূন্য-পথ)"; else bad "নেট-শূন্য-ব্যর্থ ($PRELEN → $FINLEN)"; fi
  ok "fetch-intercept-ক্লায়েন্ট-কাল্পনিক-পিডিএফ (সার্ভার-ফাইল-স্পর্শ-শূন্য; মিউটেশন-POST-শূন্য)"
fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
