#!/bin/bash
# s300-epref-suite.sh — session300 ইচ্ছা-সচেতন রিডার-ডিপ-লিংক-প্রিফেচ ep300 (আর্কাইভ-সারফেস — স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: PLANS session299-প্রস্তাব — ep299-ধর্ম epaper-আর্কাইভ-সারফেসে সম্প্রসারণ:
#   আর্কাইভ-পিল (ep-strip294-pill) / তালিকা-আইটেম (.ep-item)-এর ইচ্ছায় রিডার-ডিপ-লিংক (/epaper?file=<id>)
#   প্রিফেচ — শেয়ারড-ডিপ-লিংক-নেভিগেশন-ওয়ার্ম (ক্লায়েন্ট-সাইড-সিলেকশন-পথে-নেভিগেশন-শূন্য তবু ডিপ-লিংক-ক্যাশ-ওয়ার্ম)।
# সমাধান (ep300): ① একক-ফানেল epk300Prefetch300 — ডিডুপ-ম্যাপ + অফলাইন/saveData-গার্ড +
#   link[rel=prefetch][as=document][data-epk300]-হেড-ইনজেকশন  ② ট্রিগার — পিল mouseenter/focusin (per-node)
#   + আইটেম mouseover/focusin (ডেলিগেশন — renderList-পুনঃরেন্ডার-নিরাপদ)  ③ উষ্ণ-মিরর warmed-has-ভিত্তিক
#   (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা — স্টেল-শূন্য)  ④ বুট/apply-প্রিফেচ-নিষিদ্ধ — ইচ্ছা-গেট-ধর্ম
#   ⑤ __epk300QA হুক (prefetched/has/last/links/pills — papers-শূন্যে-ও — early-return-এর-আগে — পরিবার-চুক্তি)
# [Mandatory-স্টাইল]: epaper.css session300-ব্লক হেক্স-শূন্য — উষ্ণ-পিল অ্যাকসেন্ট-রিং (:not(.is-active)) +
#   উষ্ণ-আইটেম সফট-প্রান্ত (::before, :not(.is-on)) + পিল-ট্রানজিশন-সম্প্রসারণ + 640px + reduced-motion।
# কভারেজ: ① সোর্স-কাঠামো (epaper.ejs + epaper.css — session300-মার্কার + s294/s290/s295-অক্ষুণ্ণ + EJS-compile)
#          ② SSR (সিড-হোম): হুক-স্ক্রিপ্ট + পিল = papers-JSON-নাম-ডিডুপ-মিল + উষ্ণ-ক্লাস/প্রিফেচ-লিংক-অনুপস্থিত
#          ③ E2E (agent-browser): বুট-শূন্য-প্রিফেচ + পিল-হোভার→prefetch/warm/links + ডিডুপ + ফোকাস-ট্রিগার +
#             আইটেম-হোভার/ফোকাস + renderList-পুনঃরেন্ডারে-উষ্ণ-পুনঃ-প্রতিষ্ঠা + 390-hScroll-শূন্য + স্ক্রিনশট ×২
#          ④ মার্কার-ক্লিন নেট-শূন্য (s296-seedhome seed|clean)
# চুক্তি: eval-এ else-বিহীন-ternary-নিষিদ্ধ (cond&&expr-রীতি) + IIFE-র‍্যাপ + কিল→সিড→বুট ক্রম + open-রিট্রাই
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s300-epaper-page.html
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

echo "── ধাপ-০: পরিবেশ + সিড (কিল→প্রি-ক্লিন→সিড→বুট) ──"
kill8094
node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null >/dev/null || true
node "$APP/scripts/s292-seedhome.js" clean 2>/dev/null >/dev/null || true
S1=$(node "$APP/scripts/s296-seedhome.js" seed 2>/dev/null)
echo "$S1" | grep -q "SEED-OK count=7" && ok "s296-সিড ×৭ (প্রি-ক্লিন-পরে)" || bad "s296-সিড ($S1)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: সোর্স-কাঠামো (epaper.ejs + epaper.css) ──"
EJSF=$(cat "$APP/views/user/epaper.ejs")
CSSF=$(cat "$APP/public/assets/css/epaper.css")
# session300-ইঞ্জিন-মার্কার
containsF "হুক __epk300QA" "$EJSF" 'window.__epk300QA = {'
containsF "হুক-ফাংশন ×৫ (prefetched/has/last/links/pills)" "$EJSF" 'pills: function () {'
containsF "একক-ফানেল-স্বাক্ষর" "$EJSF" 'function epk300Prefetch300(url, reason300) {'
containsF "ফানেল-ডিডুপ-গার্ড" "$EJSF" 'if (!url || epk300Warmed[url]) return false;'
containsF "অফলাইন/saveData-গার্ড" "$EJSF" 'if (navigator.onLine === false || (cn300 && cn300.saveData)) return false;'
containsF "link[rel=prefetch]-ইনজেকশন-সেলেক্টর" "$EJSF" "document.querySelectorAll('link[rel=\"prefetch\"][data-epk300]')"
containsF "ইনজেকশন-অ্যাট্রি-সেট" "$EJSF" "l300.setAttribute('data-epk300', '1');"
containsF "ডিপ-লিংক-URL-নির্মাতা" "$EJSF" "'/epaper?file=' + encodeURIComponent(String(id300))"
containsF "পিল-ট্রিগার (mouseenter)" "$EJSF" "pill300.addEventListener('mouseenter', function () { fire300('pill'); });"
containsF "পিল-ট্রিগার (focusin)" "$EJSF" "pill300.addEventListener('focusin', function () { fire300('pill-focus'); });"
containsF "আইটেম-ট্রিগার (mouseover-ডেলিগেশন)" "$EJSF" "elList.addEventListener('mouseover', function (e300) {"
containsF "আইটেম-ট্রিগার (focusin-ডেলিগেশন)" "$EJSF" "elList.addEventListener('focusin', function (e300) {"
containsF "নাম-মিল-লুপ (date-DESC → সর্বশেষ-সংখ্যা)" "$EJSF" "if (String(papers[pi300].name) === name300) { p300 = papers[pi300]; break; }"
containsF "উষ্ণ-মিরর (warmed-has-ভিত্তিক)" "$EJSF" "pill300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');"
containsF "আইটেম-উষ্ণ-মিরর" "$EJSF" "it300.classList[epk300Warmed[u300] ? 'add' : 'remove']('epk300-warm');"
# পরিবার-চুক্তি: হুক papers-শূন্যে-ও-সংজ্ঞায়িত (early-return-এর-আগে)
HL=$(echo "$EJSF" | grep -nF 'window.__epk300QA = {' | head -1 | cut -d: -f1)
RL=$(echo "$EJSF" | grep -nF 'if (!papers.length || !elList) return;' | head -1 | cut -d: -f1)
if [ -n "$HL" ] && [ -n "$RL" ] && [ "$HL" -lt "$RL" ]; then ok "হুক early-return-এর-আগে (শূন্যে-ও-সংজ্ঞায়িত)"; else bad "হুক-ক্রম (H=$HL R=$RL)"; fi
# no-regression (s294/s290/s295-চুক্তি অক্ষুণ্ণ)
containsF "s294-অক্ষুণ্ণ: স্ট্রিপ-DOM" "$EJSF" 'id="epStrip294"'
containsF "s294-অক্ষুণ্ণ: স্ট্রিপ-সিঙ্ক" "$EJSF" 'function sync294(p) {'
containsF "s290-অক্ষুণ্ণ: QA-হুক" "$EJSF" 'window.__ep290QA = {'
containsF "s295-অক্ষুণ্ণ: মিনি-থাম্ব-ক্লাস" "$CSSF" '.ep-strip294-thumb-img'
containsF "s280-অক্ষুণ্ণ: গ্রিড" "$EJSF" 'epGrid280'
# CSS-মার্কার (session300-ব্লক — ফাইল-সমাপ্তি-ব্লক)
containsF "CSS: উষ্ণ-পিল-রিং (:not(.is-active)-বিচ্ছিন্ন)" "$CSSF" '.ep-strip294-pill.epk300-warm:not(.is-active)'
containsF "CSS: উষ্ণ-আইটেম-সফট-প্রান্ত (::before)" "$CSSF" '.ep-item.epk300-warm:not(.is-on)::before'
containsF "CSS: অ্যাকসেন্ট-রিং color-mix" "$CSSF" 'color-mix(in srgb, var(--lf-brand-primary) 40%, transparent)'
containsF "CSS: পিল-ট্রানজিশন-সম্প্রসারণ" "$CSSF" '.ep-strip294-pill { transition: color .15s ease, border-color .15s ease, background .15s ease, transform .15s ease, box-shadow .22s ease, filter .22s ease; }'
containsF "CSS: 640px-সংকোচন" "$CSSF" '@media (max-width: 640px)'
containsF "CSS: reduced-motion-গার্ড" "$CSSF" 'prefers-reduced-motion'
# session300-CSS-ব্লক হেক্স-শূন্য (ব্লক-স্কোপড — ফাইল-সমাপ্তি)
HEXN=$(echo "$CSSF" | sed -n '/session300 —/,$p' | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "CSS session300-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "CSS-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
# EJS-compile
node -e "require('ejs').compile(require('fs').readFileSync('$APP/views/user/epaper.ejs','utf8'),{filename:'epaper.ejs'});console.log('OK')" 2>/dev/null | grep -q OK && ok "EJS-compile" || bad "EJS-compile-ব্যর্থ"
# ইঞ্জিন-স্ক্রিপ্ট-সিনট্যাক্স (নতুন-ব্লকসহ — node Function)
node -e "
var fs=require('fs');var v=fs.readFileSync('$APP/views/user/epaper.ejs','utf8');
var m=v.match(/<script>([\s\S]*?)<\/script>/g)||[];
for(var i=0;i<m.length;i++){var s=m[i].replace(/^<script>/,'').replace(/<\/script>$/,'');new Function(s);}
console.log('OK');" 2>/dev/null | grep -q OK && ok "ইঞ্জিন-স্ক্রিপ্ট-সিনট্যাক্স" || bad "স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"

echo "── ধাপ-২: সিড-হোম SSR (/epaper) ──"
curl -s "$BASE/epaper" -o "$PAGE" || { bad "epaper-SSR ফেচ"; }
PG=$(cat "$PAGE")
containsF "SSR: প্রিফেচ-হুক-স্ক্রিপ্ট" "$PG" 'window.__epk300QA = {'
containsF "SSR: ফানেল-স্ক্রিপ্ট" "$PG" 'function epk300Prefetch300(url, reason300) {'
containsF "SSR: অ্যাপ-রুট" "$PG" 'id="epApp170"'
# উষ্ণ-ক্লাস/প্রিফেচ-লিংক মার্কআপ-স্তরে-অনুপস্থিত (JS-only — ইচ্ছা-সচেতন; ইনলাইন-ইঞ্জিন-স্ক্রিপ্ট-বর্জিত — s299-গোটচা-১)
PGM=$(python3 -c "import re,sys;print(re.sub(r'<script.*?</script>','',sys.stdin.read(),flags=re.S))" < "$PAGE")
if echo "$PGM" | grep -qF 'epk300-warm'; then bad "SSR-মার্কআপে উষ্ণ-ক্লাস-উপস্থিত (নিষিদ্ধ — JS-only)"; else ok "SSR-মার্কআপ উষ্ণ-ক্লাস-শূন্য (JS-only)"; fi
if echo "$PGM" | grep -qF 'rel="prefetch"'; then bad "SSR-মার্কআপে prefetch-লিংক-উপস্থিত (নিষিদ্ধ — ইচ্ছা-গেটেড)"; else ok "SSR-মার্কআপ prefetch-লিংক-শূন্য (ইচ্ছা-গেটেড)"; fi
# প্রত্যাশা-গণনা রেন্ডার্ড-HTML data-papers থেকে (নাম-ডিডুপ-প্রথম-দর্শন ≤৮ — s294-সার্ভার-লজিক-মিরর)
PJ=$(python3 -c "
import re,sys,urllib.parse,json,html
v=sys.stdin.read()
m=re.search(r'data-papers=\"([^\"]*)\"', v)
d=json.loads(urllib.parse.unquote(html.unescape(m.group(1))) if m else '[]')
seen=[];[seen.append(str(p['name'])) if str(p['name']) not in seen else None for p in d]
print(len(seen[:8]))" < "$PAGE")
PN=$(echo "$PGM" | grep -o 'class="ep-strip294-pill"' | wc -l)
if [ "$PN" -ge 1 ] && [ "$PN" = "$PJ" ]; then ok "পিল = papers-নাম-ডিডুপ-মিল ($PN)"; else bad "পিল ($PN ≠ প্রত্যাশা $PJ)"; fi
if [ "$PN" -ge 1 ]; then ok "নির্ধারক-প্রোব-পূর্বশর্ত (পিল ≥১)"; else bad "পিল-শূন্য — E2E-অসম্ভব"; fi

echo "── ধাপ-৩: E2E (agent-browser) ──"
agent-browser close >/dev/null 2>&1 || true
sleep 1
OPENED=""
for k in 1 2 3; do
  agent-browser open "$BASE/epaper" >/dev/null 2>&1
  sleep 2
  U=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$U" | grep -qF "localhost:8094/epaper"; then OPENED=1; break; fi
  sleep 1
done
if [ -n "$OPENED" ]; then ok "open (url-যাচাই)"; else bad "open ব্যর্থ (url=$U)"; fi
RD=$(poll '(function(){var k=!!document.getElementById("epApp170");return k?"READY":"WAIT";})()' 'READY' 50)
if echo "$RD" | grep -qF 'READY'; then ok "ব্রাউজার-রেডি (অ্যাপ-রুট DOM)"; else skip "ব্রাউজার-রেডি-পোল ($RD)"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
# হুক-উপস্থিতি (papers-শূন্যে-ও-সংজ্ঞায়িত — পরিবার-চুক্তি)
HK=$(ev '(function(){var t=typeof window.__epk300QA;return t==="object"?"HOOKOBJ":t;})()' | tr -d '"\\')
echo "$HK" | grep -qF 'HOOKOBJ' && ok "__epk300QA হুক-বস্তু" || bad "হুক ($HK)"
# বুট-শূন্য-প্রিফেচ (ইচ্ছা-গেট — বুট/applyPaper-প্রিফেচ-নিষিদ্ধ)
B0=$(ev '(function(){return "N"+window.__epk300QA.prefetched()+"L"+window.__epk300QA.links();})()' | tr -d '"\\')
echo "$B0" | grep -qF 'N0L0' && ok "বুট-প্রিফেচ-শূন্য + লিংক-শূন্য (ইচ্ছা-গেট)" || bad "বুট-প্রিফেচ ($B0)"
# পিল-গণনা হুক-সম্মত
PC=$(ev '(function(){return "P"+window.__epk300QA.pills();})()' | tr -d '"\\')
if [ "$(echo "$PC" | sed 's/P//')" = "$PN" ] 2>/dev/null; then ok "হুক-pills = SSR-পিল-মিল ($PC)"; else bad "হুক-pills ($PC ≠ $PN)"; fi
# পিল-হোভার-ইচ্ছা → প্রিফেচ + উষ্ণ-ক্লাস + লিংক-ইনজেকশন + has(ডিপ-লিংক)
ev '(function(){var p=document.querySelectorAll(".ep-strip294-pill")[0];p.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk300QA.prefetched()>0?"P1":"WAIT";})()' 'P1' 20; then ok "পিল-হোভার→প্রিফেচ-গণনা ≥১"; else bad "পিল-হোভার→প্রিফেচ"; fi
HA=$(ev '(function(){
  var p=document.querySelectorAll(".ep-strip294-pill")[0];
  var nm=p.getAttribute("data-ep-strip294")||"";
  var ps=JSON.parse(decodeURIComponent(document.getElementById("epApp170").getAttribute("data-papers")||"[]"));
  var f=null;for(var i=0;i<ps.length;i++){if(String(ps[i].name)===nm){f=ps[i];break;}}
  return f&&window.__epk300QA.has("/epaper?file="+encodeURIComponent(String(f.id)))?"HAS":"NO";})()' | tr -d '"\\')
echo "$HA" | grep -qF 'HAS' && ok "পিল-হোভার→has(সর্বশেষ-সংখ্যা-ডিপ-লিংক)" || bad "has($HA)"
LA=$(ev '(function(){return window.__epk300QA.last()==="pill"?"RPILL":"R"+window.__epk300QA.last();})()' | tr -d '"\\')
echo "$LA" | grep -qF 'RPILL' && ok "পিল-হোভার→কারণ=pill" || bad "কারণ ($LA)"
WA=$(ev '(function(){var p=document.querySelectorAll(".ep-strip294-pill")[0];return p.classList.contains("epk300-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$WA" | grep -qF 'WARM' && ok "পিল-হোভার→উষ্ণ-ক্লাস" || bad "উষ্ণ-ক্লাস ($WA)"
LN=$(ev '(function(){return "L"+window.__epk300QA.links();})()' | tr -d '"\\')
if [ "$(echo "$LN" | sed 's/L//')" -ge 1 ] 2>/dev/null; then ok "link[rel=prefetch][data-epk300]-ইনজেকশন ($LN)"; else bad "ইনজেকশন ($LN)"; fi
# ডিডুপ — পুনঃ-হোভারে গণনা-অপরিবর্তিত
D1=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
ev '(function(){var p=document.querySelectorAll(".ep-strip294-pill")[0];p.dispatchEvent(new MouseEvent("mouseenter"));return "D";})()' >/dev/null 2>&1
D2=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
if [ "$D1" = "$D2" ]; then ok "ডিডুপ — পুনঃ-হোভারে অপরিবর্তিত ($D1)"; else bad "ডিডুপ ($D1→$D2)"; fi
# পিল-ফোকাস-ইচ্ছা — পরের-পিল → নতুন-প্রিফেচ (নাম-ডিডুপেড → ভিন্ন-সংখ্যা)
ev '(function(){var p=document.querySelectorAll(".ep-strip294-pill")[1];p.dispatchEvent(new FocusEvent("focusin",{bubbles:true}));return "F";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk300QA.prefetched()>1?"P2":"WAIT";})()' 'P2' 20; then ok "পিল-ফোকাস→প্রিফেচ-গণনা ≥২"; else bad "পিল-ফোকাস→প্রিফেচ"; fi
LB=$(ev '(function(){return window.__epk300QA.last()==="pill-focus"?"RPFOC":"R"+window.__epk300QA.last();})()' | tr -d '"\\')
echo "$LB" | grep -qF 'RPFOC' && ok "পিল-ফোকাস→কারণ=pill-focus" || bad "ফোকাস-কারণ ($LB)"
# আইটেম-হোভার-ইচ্ছা — ডেলিগেশন (mouseover-বাবলিং) → প্রিফেচ + উষ্ণ-ক্লাস
# গোটচা-গার্ড (রান-১-প্রমাণ): বুট-তারিখের শীর্ষ-আইটেম = স্ট্রিপ-পিলের সর্বশেষ-সংখ্যা-মিল — পূর্ব-উষ্ণ →
# ডিডুপ-ধর্মে গণনা-স্থির (সঠিক-ইঞ্জিন-আচরণ, ভুল-প্রত্যাশা) → তাই তারিখ-সুইচে পুরাতন-সংখ্যার আইটেমে (নতুন-id)
ev '(function(){
  var ps=JSON.parse(decodeURIComponent(document.getElementById("epApp170").getAttribute("data-papers")||"[]"));
  var ds=[];ps.forEach(function(p){var d=String(p.date||"").slice(0,10);if(ds.indexOf(d)<0)ds.push(d);});
  ds.sort();ds.reverse();
  var d=document.getElementById("epDateInput");
  var st=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value");
  st.set.call(d,ds[1]||ds[0]);d.dispatchEvent(new Event("change",{bubbles:true}));
  return ds[1]||ds[0];})()' >/dev/null 2>&1
sleep 1.2
N1I=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
N1N=${N1I#N}
ev '(function(){var it=document.querySelectorAll(".ep-item")[0];it.dispatchEvent(new MouseEvent("mouseover",{bubbles:true}));return "D";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk300QA.prefetched()>'"$N1N"'?"PG":"WAIT";})()' 'PG' 20; then ok "আইটেম-হোভার→প্রিফেচ-বৃদ্ধি ($N1I→+)"; else bad "আইটেম-হোভার→প্রিফেচ"; fi
IA=$(ev '(function(){var it=document.querySelectorAll(".ep-item")[0];return window.__epk300QA.last()==="item"?"RITEM":"R"+window.__epk300QA.last();})()' | tr -d '"\\')
echo "$IA" | grep -qF 'RITEM' && ok "আইটেম-হোভার→কারণ=item" || bad "আইটেম-কারণ ($IA)"
IW=$(ev '(function(){var it=document.querySelectorAll(".ep-item")[0];return it.classList.contains("epk300-warm")?"WARM":"COLD";})()' | tr -d '"\\')
echo "$IW" | grep -qF 'WARM' && ok "আইটেম-হোভার→উষ্ণ-ক্লাস" || bad "আইটেম-উষ্ণ ($IW)"
N2I=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
N2N=${N2I#N}
# আইটেম-ফোকাস-ইচ্ছা — ভিন্ন-আইটেম (না-উষ্ণ প্রার্থী-খোঁজ) → প্রিফেচ-বৃদ্ধি
ev '(function(){
  var its=document.querySelectorAll(".ep-item");
  for(var i=1;i<its.length;i++){
    var u="/epaper?file="+encodeURIComponent(String(its[i].getAttribute("data-id")));
    if(!window.__epk300QA.has(u)){its[i].dispatchEvent(new FocusEvent("focusin",{bubbles:true}));return "F"+i;}
  }return "NONE";})()' >/dev/null 2>&1
if poll '(function(){return window.__epk300QA.prefetched()>'"$N2N"'?"PG":"WAIT";})()' 'PG' 20; then ok "আইটেম-ফোকাস→প্রিফেচ-বৃদ্ধি ($N2I→+)"; else bad "আইটেম-ফোকাস→প্রিফেচ"; fi
IF2=$(ev '(function(){return window.__epk300QA.last()==="item-focus"?"RIFO":"R"+window.__epk300QA.last();})()' | tr -d '"\\')
echo "$IF2" | grep -qF 'RIFO' && ok "আইটেম-ফোকাস→কারণ=item-focus" || bad "আইটেম-ফোকাস-কারণ ($IF2)"
# renderList-পুনঃরেন্ডারে-উষ্ণ-পুনঃ-প্রতিষ্ঠা (সার্চ→ফিল্টার→ক্লিয়ার — নতুন-DOM-নোড → পুনঃ-হোভারে ক্লাস-পুনঃস্থাপন + গণনা-স্থির)
ev '(function(){
  var s=document.getElementById("epSearch");
  var st=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value");
  st.set.call(s,"ऀ");s.dispatchEvent(new Event("input",{bubbles:true}));
  return "S";})()' >/dev/null 2>&1
sleep 1.2
RWC=$(ev '(function(){var its=document.querySelectorAll(".ep-item");for(var i=0;i<its.length;i++){if(its[i].classList.contains("epk300-warm"))return "RESIDUE";}return "CLEAN";})()' | tr -d '"\\')
echo "$RWC" | grep -qF 'CLEAN' && ok "পুনঃরেন্ডারে পুরাতন-উষ্ণ-নোড-বিলুপ্ত (নতুন-DOM-পরিষ্কার)" || bad "পুনঃরেন্ডার-অবশেষ ($RWC)"
ev '(function(){
  var s=document.getElementById("epSearch");
  var st=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value");
  st.set.call(s,"");s.dispatchEvent(new Event("input",{bubbles:true}));
  return "C";})()' >/dev/null 2>&1
sleep 1.2
N1=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
ev '(function(){var it=document.querySelectorAll(".ep-item")[0];it.dispatchEvent(new MouseEvent("mouseover",{bubbles:true}));return "D";})()' >/dev/null 2>&1
RE=$(ev '(function(){var it=document.querySelectorAll(".ep-item")[0];return it&&it.classList.contains("epk300-warm")?"REWARM":"NO";})()' | tr -d '"\\')
echo "$RE" | grep -qF 'REWARM' && ok "পুনঃ-হোভার→উষ্ণ-পুনঃ-প্রতিষ্ঠা (warmed-has-মিরর)" || bad "পুনঃ-প্রতিষ্ঠা ($RE)"
N2=$(ev '(function(){return "N"+window.__epk300QA.prefetched();})()' | tr -d '"\\')
if [ "$N1" = "$N2" ]; then ok "ডিডুপ-ধর্ম-অটুট — পুনঃ-প্রতিষ্ঠায় গণনা-স্থির ($N1)"; else bad "পুনঃ-প্রতিষ্ঠা-গণনা ($N1→$N2)"; fi
# 390px-ডক-hScroll-শূন্য
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1.2
HS=$(ev '(function(){return (document.documentElement.scrollWidth>document.documentElement.clientWidth)?"HSCROLL":"OK";})()' | tr -d '"\\')
echo "$HS" | grep -qF 'OK' && ok "390px-ডক-hScroll-শূন্য" || bad "hScroll ($HS)"
agent-browser screenshot /home/z/my-project/download/s300-epref-mobile390.png >/dev/null 2>&1 && ok "স্ক্রিনশট মোবাইল-৩৯০" || bad "স্ক্রিনশট-মোবাইল"
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/download/s300-epref-desk.png >/dev/null 2>&1 && ok "স্ক্রিনশট ডেস্কটপ" || bad "স্ক্রিনশট-ডেস্ক"

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094
ok "সার্ভার কিল (ক্লিন-পূর্ব)"
C1=$(node "$APP/scripts/s296-seedhome.js" clean 2>/dev/null)
echo "$C1" | grep -q "deleted=7" && ok "s296-ক্লিন ($C1)" || bad "s296-ক্লিন ($C1)"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "সার্ভার-পুনঃ-বুট"

echo "══════════════════════════════"
echo "s300-epref: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else echo "FAILED ✗"; exit 1; fi
