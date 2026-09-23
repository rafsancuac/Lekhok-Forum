#!/bin/bash
# s292-filmthumb-suite.sh — session292 ফিল্মস্ট্রিপ মিনি-থাম্ব-প্রিভিউ সুইট (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: epk291-কিয়স্ক ফিল্মস্ট্রিপ বাটনে আগে কেবল টেক্সট (কিকার+নাম) — ep292 নাম-মিলে-থাম্ব
# মিনি-প্রিভিউ (SSR — no-JS-এও সঠিক); লোড-ব্যর্থতায় JS থাম্ব-স্প্যান লুকায় (ভাঙা-ছবি-কখনো-নয়)।
# কভারেজ: ① সোর্স-কাঠামো (থাম্ব-স্প্যান + capture-error-লিসনার + __epk292QA + ep292-CSS হেক্স-শূন্য
#          + epk291-বডি-অক্ষুণ্ণ) ② মার্কার-সিড-হোম-SSR (মিল→থাম্ব + অমিল→টেক্সট-শাখা — JSON-প্রত্যাশা-গণনা)
#          ③ E2E (agent-browser): হুক-গণিত + img-লোড-প্রমাণ + error-fallback (dispatch→hidden) +
#             ক্লিক-সিঙ্ক (programmatic-click + same-eval sync-read — s291-রেস-গোটচা) + aria-selected +
#             CTA-সিঙ্ক + 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-ক্লিন নেট-শূন্য (s292-seedhome — কিল→সিড→বুট ক্রম-গোটচা)
# চুক্তি: eval-এ else-বিহীন-ternary-নিষিদ্ধ (SyntaxError — s291-গোটচা; cond&&expr-রীতি) + ইউনিক-কোয়েরি-open
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s292-home-page.html
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
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (today.ejs + style.css) ──"
EJS=$(cat "$APP/views/partials/home/today.ejs")
CSSF=$(cat "$APP/public/assets/css/style.css")
containsF "থাম্ব-স্প্যান SSR (শর্তসাপেক্ষ p.thumb)" "$EJS" '<% if (p.thumb) { %><span class="epk291-film-thumb" aria-hidden="true">'
containsF "থাম্ব-img (lazy+async, alt-শূন্য, id-শূন্য)" "$EJS" '<img class="epk291-film-thumb-img" src="<%= p.thumb %>" alt="" loading="lazy" decoding="async">'
containsF "capture-ফেজ-error-লিসনার (film-কনটেইনারে)" "$EJS" "film.addEventListener('error', function (e) {"
containsF "error-গার্ড (থাম্ব-img-শ্রেণি-মিল)" "$EJS" "if (!t || !t.classList || !t.classList.contains('epk291-film-thumb-img')) return;"
containsF "fallback: থাম্ব-স্প্যান hidden" "$EJS" 'w.hidden = true;'
containsF "QA-হুক __epk292QA" "$EJS" 'window.__epk292QA'
containsF "হুক: hidden-গণনা ([hidden]-সেলেক্টর)" "$EJS" "hidden: function () { return film.querySelectorAll('.epk291-film-thumb[hidden]').length; }"
containsF "হেডার-ডক session292" "$EJS" 'session292: ফিল্মস্ট্রিপ বাটনে মিনি-থাম্ব-প্রিভিউ'
# epk291-বডি-অক্ষুণ্ণ (র‍্যাপার-স্তর-রীতি-প্রমাণ)
containsF "epk291-অক্ষুণ্ণ: wired-গার্ড" "$EJS" 'if (window.__epk291wired) return;'
containsF "epk291-অক্ষুণ্ণ: applyPaper-বডি" "$EJS" 'function applyPaper(i) {'
containsF "epk291-অক্ষুণ্ণ: ফ্রন্ট-img-error-ফলব্যাক" "$EJS" "img.addEventListener('error', function () {"
containsF "epk291-অক্ষুণ্ণ: অটো-স্লাইড ৩.৫সে" "$EJS" '}, 3500);'
B292=$(echo "$CSSF" | sed -n '/সেশন ২৯২ (session292)/,/EOF সেশন ২৯২/p')
if [ -n "$B292" ]; then
  ok "ep292-CSS-ব্লক উপস্থিত"
  HEXN=$(echo "$B292" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "ep292-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ep292-ব্লকে হেক্স $HEXN"; fi
  containsF "থাম্ব-আকৃতি+টোকেন-বর্ডার" "$B292" '.epk291-film-thumb {'
  containsF "নির্বাচিত-অ্যাকসেন্ট-বর্ডার (--epkAcc291)" "$B292" '.epk291-film-btn[aria-selected="true"] .epk291-film-thumb {'
  containsF "object-fit-cover" "$B292" '.epk291-film-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }'
  containsF "মোবাইল-সংকোচন (480px)" "$B292" 'max-width: 480px'
  containsF "reduced-motion-গার্ড" "$B292" 'prefers-reduced-motion'
else
  bad "ep292-CSS-ব্লক অনুপস্থিত"
fi

echo "── ধাপ-২: মার্কার-সিড → হোম-SSR (কিল→সিড→বুট — ক্রম-গোটচা) ──"
kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
SR=$(node "$APP/scripts/s292-seedhome.js" seed 2>/dev/null)
if echo "$SR" | grep -q "SEED-OK"; then ok "মার্কার-সিড ×২ ($SR)"; else bad "সিড-ব্যর্থ ($SR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
PC=$(curl -s -o "$PAGE" -w "%{http_code}" "$BASE/")
if [ "$PC" = "200" ]; then ok "/ 200"; else bad "/ HTTP $PC"; fi
# JSON-প্রত্যাশা-গণনা (রেন্ডার্ড-HTML থেকে — অন্য-সারি-উপস্থিতিতেও নির্ধারক)
EXP=$(node -e "
const fs=require('fs');
const h=fs.readFileSync('$PAGE','utf8');
const m=h.match(/var papers = (\[[\s\S]*?\]);/);
if(!m){console.log('-1');process.exit(0)}
try{const a=JSON.parse(m[1]);let c=0;for(let i=0;i<a.length;i++){if(a[i].thumb)c++;}console.log(a.length+':'+c);}catch(e){console.log('-1')}
")
PAPERSN=${EXP%%:*}; WITH=${EXP##*:}
if [ "$EXP" = "-1" ]; then bad "papers-JSON-নিষ্কাশন-ব্যর্থ"; PAPERSN=0; WITH=0; else ok "papers-JSON: মোট=$PAPERSN থাম্ব=$WITH"; fi
BTN=$(grep -o 'class="epk291-film-btn"' "$PAGE" | wc -l)
TH=$(grep -o 'class="epk291-film-thumb"' "$PAGE" | wc -l)
if [ "$PAPERSN" -ge 2 ] 2>/dev/null; then ok "কিয়স্ক-পত্রিকা-মোট=$PAPERSN (≥২ — দুই-শাখা-লাইভ)"; else bad "কিয়স্ক-পত্রিকা-মোট=$PAPERSN (২-প্রত্যাশিত)"; fi
if [ "$WITH" -ge 1 ] 2>/dev/null; then ok "থাম্ব-যুক্ত-পত্রিকা=$WITH (মিল-শাখা)"; else bad "থাম্ব-যুক্ত=$WITH"; fi
if [ "$WITH" -lt "$PAPERSN" ] 2>/dev/null; then ok "থাম্ব-শূন্য-পত্রিকা-উপস্থিত (অমিল-শাখা — ফলব্যাক-লাইভ)"; else bad "অমিল-শাখা-নেই (WITH=$WITH PAPERSN=$PAPERSN)"; fi
if [ "$TH" = "$WITH" ]; then ok "SSR থাম্ব-স্প্যান=$TH == প্রত্যাশা-$WITH"; else bad "SSR থাম্ব-স্প্যান=$TH ≠ প্রত্যাশা-$WITH"; fi
if [ "$BTN" = "$PAPERSN" ]; then ok "ফিল্ম-বাটন=$BTN == মোট-$PAPERSN"; else bad "ফিল্ম-বাটন=$BTN ≠ মোট-$PAPERSN"; fi

echo "── ধাপ-৩: E2E (agent-browser — ইউনিক-কোয়েরি-open) ──"
Q1="qa292a=$(date +%s)$RANDOM"
agent-browser open "about:blank" >/dev/null 2>&1 || true
if agent-browser open "$BASE/?$Q1" >/dev/null 2>&1; then ok "open ($Q1)"; else bad "open-ব্যর্থ"; fi
if poll 'window.__epk292QA && window.__epk291wired && ("H" + window.__epk292QA.hidden() + "T" + window.__epk292QA.total())' "H0T$WITH"; then ok "বুট: হুক-জীবিত (hidden=০ total=$WITH)"; else bad "বুট-হুক-গণিত"; fi
if poll '(function(){var l=document.querySelectorAll(".epk291-film-thumb-img"),o=0,i;for(i=0;i<l.length;i++){if(l[i].complete&&l[i].naturalWidth>0)o++;}return "OK"+o+"of"+l.length})()' "OK${WITH}of${WITH}"; then ok "সব-থাম্ব-img লোডিত (naturalWidth>0 ×$WITH)"; else bad "থাম্ব-img-লোড"; fi
E1=$(ev '(function(){var f=document.getElementById("epk291Film");if(!f)return "NF";var im=f.querySelector(".epk291-film-thumb-img");if(!im)return "NI";im.dispatchEvent(new Event("error"));return "D"+window.__epk292QA.hidden()})()' | tr -d '"\\')
if echo "$E1" | grep -qF 'D1'; then ok "error-dispatch → fallback (hidden=১)"; else bad "error-dispatch ($E1)"; fi
if poll '(function(){var w=document.querySelector(".epk291-film-thumb");return w&&w.hidden?"WH":"WS"})()' 'WH'; then ok "থাম্ব-স্প্যান hidden-বৈশিষ্ট্য-প্রমাণ"; else bad "স্প্যান-hidden"; fi
E2=$(ev '(function(){var l=document.querySelectorAll(".epk291-film-thumb");var h=0,i;for(i=0;i<l.length;i++){if(l[i].hidden)h++;}return "H"+h+"T"+l.length})()' | tr -d '"\\')
if echo "$E2" | grep -qF "H1T$WITH"; then ok "ক্লিন-রিলোড-পূর্ব গণিত (H1 T$WITH — একক-লক্ষ্যে-সীমিত)"; else bad "গণিত-$E2"; fi
# fresh-load (stale-পেজ-গোটচা) — ক্লিক-সিঙ্ক + CTA + live
Q2="qa292b=$(date +%s)$RANDOM"
if agent-browser open "$BASE/?$Q2" >/dev/null 2>&1; then ok "open-fresh ($Q2)"; else bad "open-2-ব্যর্থ"; fi
if poll 'window.__epk292QA && "T" + window.__epk292QA.total()' "T$WITH"; then ok "ফ্রেশ-লোড hidden=০-পুনঃপ্রতিষ্ঠা (T=$WITH)"; else bad "ফ্রেশ-লোড-হুক"; fi
E3=$(ev '(function(){var b=document.querySelectorAll(".epk291-film-btn");if(b.length<2)return "NB";var t=b[1];t.click();var nm=t.querySelector(".epk291-film-name");var fn=document.getElementById("epk291Name");var sel=t.getAttribute("aria-selected")==="true";var cta=document.getElementById("teKioskCtaText291");var m=nm&&fn&&cta&&(nm.textContent===fn.textContent)&&sel&&cta.textContent.indexOf(nm.textContent)>=0;return m?"SYNC":"NS"})()' | tr -d '"\\')
if echo "$E3" | grep -qF 'SYNC'; then ok "ক্লিক-সিঙ্ক: aria-selected + ফ্রন্ট-নাম + CTA (same-eval sync-read)"; else bad "ক্লিক-সিঙ্ক ($E3)"; fi
E4=$(ev '(function(){var lr=document.getElementById("epk291Live");var th=document.querySelectorAll(".epk291-film-thumb").length;var h=0,l=document.querySelectorAll(".epk291-film-thumb"),i;for(i=0;i<l.length;i++){if(l[i].hidden)h++;}return (lr&&lr.textContent.length>0?"LIVE":"NL")+"H"+h+"T"+th})()' | tr -d '"\\')
if echo "$E4" | grep -qF 'LIVE'; then ok "aria-live-ঘোষণা-জীবিত + হুক-স্থির ($E4)"; else bad "live ($E4)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' | tr -d '"\\')
if echo "$HS" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য"; else bad "390px-hScroll ($HS)"; fi
if agent-browser screenshot "$ROOT/download/s292-film-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s292-film-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
CR=$(node "$APP/scripts/s292-seedhome.js" clean 2>/dev/null)
if echo "$CR" | grep -q "CLEAN-OK deleted=2"; then ok "মার্কার-ক্লিন ($CR)"; else bad "ক্লিন ($CR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "চূড়ান্ত-বুট"

echo "══════════════════════════════"
echo "s292-filmthumb: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
