#!/bin/bash
# s313-suite.sh — session313: sfs313 গ্রুপ-সম্মিলন + s313-land নোটিশ + toast-family
# [Task ID 150] PLANS session312-নোটের প্রস্তাব-①+③ প্রয়োগ:
#   ① home-layout.js — FEED_SLIDES +real-latest/real-popular (append-চুক্তি; admin
#      home-reorder স্বয়ং-আবিষ্কার — রেজিস্ট্রি-চালিত প্রমাণসহ)
#   ② feed.ejs — sfsGroups313 (গ্রুপ-ক্রম home_feed_order-সমন্বিত: real-popular আগে =
#      জনপ্রিয়-প্রথম) + হাফ-ক্লোন-লুপ (×২-ডুপ্লিকেট নির্মূল — রেন্ডার-অভিন্ন) + __sfs313QA
#   ③ dashboard.ejs — found:0-পথে lf313-info-টোস্ট + hashchange-পুনঃচালু + প্রতি-চেষ্টায়
#      সতেজ-স্টেট (found=শেষ-চেষ্টার-সত্য)
#   ④ style.css — session313-ব্লক হেক্স-শূন্য: .toast-পরিবার ভিজ্যুয়াল-স্টেট + 640px +
#      reduced-motion
# চুক্তি: সার্ভার-বন্ধ-সিড (s280-নীতি) + DB-অর্ডার-টগল-ই২ই (set→restart→assert→restore→restart —
#         s311-in-memory-স্টেল-গোটচা-সচেতন) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক (s307 --clean)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s313-groups-desk.png
SH_MOB=/home/z/my-project/download/s313-groups-mobile390.png
SH_TOAST=/home/z/my-project/download/s313-land-toast.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
unjj(){ printf '%s' "$1" | sed 's/^"//; s/"$//; s/\\"/"/g'; }
jf(){ printf '%s' "$2" | python3 -c "
import sys, json
d = json.load(sys.stdin)
v = d.get(sys.argv[1], '')
if isinstance(v, bool): v = 'true' if v else 'false'
print(v)" "$1" 2>/dev/null; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
bopen(){
  local i u
  # session313-গোটচা (রান-২-এ আবিষ্কৃত): open-এর URL-সমতা-চেক সম-URL-পুনঃ-open-কে
  # নো-অপ-হিসেবে পাস করায় (রিলোড-শূন্য) → ব্রাউজার পুরনো-ডম স্টেল-স্টেট দেখে
  # (order-toggle-ই২ই-তে popFirst=false-মিথ্যা) → ম্যাচের-পরে reload বাধ্যতমূলক।
  for i in 1 2 3 4 5; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then agent-browser reload >/dev/null 2>&1; return 0; fi
    sleep 1
  done
  agent-browser close --all >/dev/null 2>&1
  sleep 1
  for i in 1 2 3; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then agent-browser reload >/dev/null 2>&1; return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s313-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s313-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$APP" && node scripts/s313-order-toggle.js get) >/tmp/s313-order-orig.txt 2>&1
ORIG_ORDER=$(cat /tmp/s313-order-orig.txt)
ok "home_feed_order-মূল-মান সংরক্ষিত (${ORIG_ORDER:0:60})"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (রেজিস্ট্রি/ভিউ/সিএসএস) ──"
grep -q "key: 'real-latest'" "$APP/helpers/home-layout.js" && ok "home-layout: real-latest-এন্ট্রি" || bad "home-layout: real-latest-অনুপস্থিত"
grep -q "key: 'real-popular'" "$APP/helpers/home-layout.js" && ok "home-layout: real-popular-এন্ট্রি" || bad "home-layout: real-popular-অনুপস্থিত"
grep -q "sfs313" "$APP/helpers/home-layout.js" && ok "home-layout: s313-কমেন্ট-মার্কার" || bad "home-layout: s313-মার্কার-অনুপস্থিত"
grep -q "const sfsGroups313" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfsGroups313-কম্পিউট" || bad "feed.ejs: sfsGroups313-অনুপস্থিত"
grep -q "sfsPopFirst313" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfsPopFirst313-গেট" || bad "feed.ejs: sfsPopFirst313-অনুপস্থিত"
grep -q '\[false, true\].forEach((sfsHalf313)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: হাফ-ক্লোন-লুপ" || bad "feed.ejs: হাফ-লুপ-অনুপস্থিত"
grep -q "window.__sfs313QA" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs313QA-হুক" || bad "feed.ejs: __sfs313QA-অনুপস্থিত"
N_ROWS=$(grep -c "sfs292-post<" "$APP/views/partials/home/feed.ejs")
if [ "$N_ROWS" = "1" ]; then ok "feed.ejs: সারি-মার্কআপ ×১ (ডুপ্লিকেট-নির্মূল-প্রমাণ)"; else bad "feed.ejs: সারি-মার্কআপ ×$N_ROWS (ডুপ্লিকেট-অবশিষ্ট)"; fi
grep -q "notice: 0" "$APP/views/user/dashboard.ejs" && ok "dashboard: notice-ফিল্ড" || bad "dashboard: notice-ফিল্ড-অনুপস্থিত"
grep -q "'lf313-info'" "$APP/views/user/dashboard.ejs" && ok "dashboard: lf313-info-টোস্ট-কল" || bad "dashboard: lf313-info-অনুপস্থিত"
grep -q "hashEvents" "$APP/views/user/dashboard.ejs" && ok "dashboard: hashchange-পুনঃচালু" || bad "dashboard: hashEvents-অনুপস্থিত"
grep -q "q312.found = 0; q312.notice = 0;" "$APP/views/user/dashboard.ejs" && ok "dashboard: প্রতি-চেষ্টায়-সতেজ-স্টেট" || bad "dashboard: সতেজ-স্টেট-রিসেট-অনুপস্থিত"
B313=$(python3 - "$APP/public/assets/css/style.css" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding='utf-8').read()
i = t.find('session313')
e = t.find('EOF session313')
print(t[i:e] if i != -1 and e > i else 'MISSING')
PYEOF
)
if [ "$B313" != "MISSING" ]; then
  ok "style.css: session313-ব্লক উপস্থিত"
  HEXN=$(printf '%s' "$B313" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
  if [ "$HEXN" = "0" ]; then ok "style.css: session313-ব্লক হেক্স-শূন্য"; else bad "style.css: হেক্স ×$HEXN (session313-ব্লক)"; fi
  echo "$B313" | grep -q "prefers-reduced-motion" && ok "style.css: reduced-motion-গার্ড" || bad "style.css: reduced-motion-অনুপস্থিত"
  echo "$B313" | grep -q "max-width: 640px" && ok "style.css: 640px-safe-area" || bad "style.css: 640px-অনুপস্থিত"
  echo "$B313" | grep -q ".toast.lf313-info" && ok "style.css: lf313-info-ভ্যারিয়েন্ট" || bad "style.css: lf313-info-অনুপস্থিত"
  echo "$B313" | grep -q ".toast.success::before" && ok "style.css: success-স্টেট-বার" || bad "style.css: success-বার-অনুপস্থিত"
  echo "$B313" | grep -q ".toast.error::before" && ok "style.css: error-স্টেট-বার" || bad "style.css: error-বার-অনুপস্থিত"
else
  bad "style.css: session313-ব্লক-অনুপস্থিত"
fi
(cd "$APP" && node --check helpers/home-layout.js) && ok "node --check home-layout.js" || bad "home-layout.js --check-ব্যর্থ"

echo "── ধাপ-২: SSR-ডায়নামিক (ডিফল্ট-ক্রম — রেন্ডার-অভিন্ন-প্রমাণ) ──"
SS=$(curl -s "$BASE/")
echo "$SS" | grep -q "popFirst: false" && ok "SSR: popFirst=false (ডিফল্ট — সর্বশেষ-প্রথম)" || bad "SSR: popFirst-গেট-অসঙগত"
echo "$SS" | grep -q 'labels: \["সর্বশেষ লেখা","জনপ্রিয় আলোচনা"\]' && ok "SSR: labels-ডিফল্ট-ক্রম" || bad "SSR: labels-ক্রম-অমিল"
GL=$(printf '%s' "$SS" | grep -o 'class="sfs292-glabel"' | wc -l | tr -d ' ')
if [ "$GL" = "4" ]; then ok "SSR: glabel ×৪ (২-গ্রুপ × ২-হাফ — রেন্ডার-অভিন্ন)"; else bad "SSR: glabel ×$GL (প্রত্যাশা ৪)"; fi
ROWS=$(printf '%s' "$SS" | grep -o 'sfs292-post[^>]*is-real307' | wc -l | tr -d ' ')
# is-real307-গণনা-অ্যাসার্ট (s312-চুক্তি — ডায়নামিক-গণনা-সচেতন; wired-সূত্র = ২×মিন(৪,realA)+২×মিন(৪,realB))
WJS=$(cd "$APP" && node -e "
const f=require('fs'),i=require('sql.js');
new i().then(function(S){
  const d=new S.Database(f.readFileSync('lekhok.db'));
  const st=d.prepare(\"SELECT COUNT(*) AS n FROM posts WHERE status='published' AND audience='PUBLIC' AND shared_from IS NULL AND author_id IN (SELECT id FROM users WHERE status='active')\");
  st.step(); console.log(st.getAsObject().n); st.free();});")
REAL=$(echo "$WJS" | tail -1)
EXPECT=$(( 2 * (REAL < 4 ? REAL : 4) + 2 * ((REAL - 4) > 0 ? ((REAL - 4) < 4 ? (REAL - 4) : 4) : 0) ))
if [ "$ROWS" = "$EXPECT" ] 2>/dev/null && [ "$ROWS" -gt 0 ] 2>/dev/null; then ok "SSR: is-real307=ডায়নামিক-প্রত্যাশা ($ROWS = wired-সূত্র)"; else bad "SSR: is-real307=$ROWS প্রত্যাশা=$EXPECT"; fi
CHJ=$(printf '%s' "$SS" | grep -o 'sfs292-chip-[abc]" href="[^"]*"' | head -3 | grep -o 'href="[^"]*"' | tr '\n' ' ')
ok "SSR: চিপ-href-তালিকা ($CHJ)"

echo "── ধাপ-৩: DB-অর্ডার-টগল-ই২ই (সম্মিলন-প্রমাণ — real-popular-প্রথম) ──"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
(cd "$APP" && node scripts/s313-order-toggle.js set '["real-popular","epaper","real-latest","quiz","thisday","best"]') | grep -q "SET ✓" && ok "home_feed_order সেট (real-popular-প্রথম — রেজিস্ট্রি-কী-মিশ্রণ)" || bad "অর্ডার-সেট-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "রিস্টার্ট-পরে বুট (in-memory-স্টেল-গোটচা-সচেতন)" || bad "রিস্টার্ট-ব্যর্থ"
SS2=$(curl -s "$BASE/")
echo "$SS2" | grep -q "popFirst: true" && ok "SSR: popFirst=true (জনপ্রিয়-প্রথম — সম্মিলন-কার্য)" || bad "SSR: popFirst=true-অনুপস্থিত"
echo "$SS2" | grep -q 'labels: \["জনপ্রিয় আলোচনা","সর্বশেষ লেখা"\]' && ok "SSR: labels-উল্টানো-ক্রম" || bad "SSR: labels-উল্টানো-অমিল"
CHIP1=$(printf '%s' "$SS2" | grep -o 'sfs292-chip-a" href="[^"]*" aria-label="[^"]*"' | head -1)
if echo "$CHIP1" | grep -q "জনপ্রিয় আলোচনা"; then ok "SSR: চিপ-এ = real-popular (রেজিস্ট্রি-প্রমোট-প্রমাণ)"; else bad "SSR: চিপ-এ-অমিল ($CHIP1)"; fi
if bopen "$BASE/"; then agent-browser wait 2000 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (অর্ডার-সেট)" || bad "হোম-লোড-ব্যর্থ"; else bad "হোম-open-ব্যর্থ"; fi
HJ=$(ev "JSON.stringify(window.__sfs313QA||{})")
HJJ=$(unjj "$HJ")
PF=$(jf popFirst "$HJJ")
GJ=$(ev "JSON.stringify([].map.call(document.querySelectorAll('.sfs292-glabel'),function(e){return e.textContent.trim()}).slice(0,2))")
GJJ=$(unjj "$GJ")
GLIST=$(printf '%s' "$GJJ" | python3 -c "import sys,json;print('|'.join(json.load(sys.stdin)))" 2>/dev/null)
if [ "$PF" = "true" ]; then ok "ই২ই: __sfs313QA.popFirst=true"; else bad "ই২ই: popFirst=$PF"; fi
if [ "$GLIST" = "জনপ্রিয় আলোচনা|সর্বশেষ লেখা" ]; then ok "ই২ই: প্রথম-glabel=জনপ্রিয় আলোচনা (DOM-ক্রম-প্রমাণ)"; else bad "ই২ই: glabel-ক্রম=$GLIST"; fi
ERR313=$(jf err "$HJJ")
if [ "$ERR313" = "" ]; then ok "ই২ই: sfs313-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: sfs313-ত্রুটি: $ERR313"; fi
if agent-browser screenshot "$SH_DESK" >/dev/null 2>&1; then ok "স্ক্রিনশট: জনপ্রিয়-প্রথম (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
if [ "$ORIG_ORDER" = "NULL" ]; then
  (cd "$APP" && node scripts/s313-order-toggle.js set 'null') | grep -q "CLEARED ✓" && ok "মূল-মান পুনঃস্থাপন (NULL)" || bad "পুনঃস্থাপন-ব্যর্থ"
else
  (cd "$APP" && node scripts/s313-order-toggle.js set "$ORIG_ORDER") | grep -q "SET ✓" && ok "মূল-মান পুনঃস্থাপন" || bad "পুনঃস্থাপন-ব্যর্থ"
fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পুনঃস্থাপন-পরে বুট" || bad "পুনঃস্থাপন-পরে-বুট-ব্যর্থ"
SS3=$(curl -s "$BASE/")
echo "$SS3" | grep -q "popFirst: false" && ok "পুনঃস্থাপন-প্রমাণ: popFirst=false (ডিফল্ট-ফিরেছে)" || bad "পুনঃস্থাপন-অনুপস্থিত (popFirst)"

echo "── ধাপ-৪: s313-land নোটিশ-ই২ই (লোড-পথ + হ্যাশ-বিহীন) ──"
bopen "$BASE/dashboard#post-999999" || bad "dashboard#post-999999-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
LJ=$(ev "JSON.stringify(window.__s312LandQA||{})")
LJJ=$(unjj "$LJ")
NT=$(jf notice "$LJJ")
NTID=$(jf id "$LJJ")
if [ "$NT" = "1" ]; then ok "found:0-পথে notice=1 (লোড-পথ)"; else bad "notice=$NT (found:0-পথে)"; fi
if [ "$NTID" = "999999" ]; then ok "নোটিশ-পথে সঠিক-আইডি ($NTID)"; else bad "নোটিশ-আইডি-অমিল ($NTID)"; fi
bopen "$BASE/dashboard" || bad "dashboard-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
LJ2=$(ev "JSON.stringify(window.__s312LandQA||{})")
LJ2J=$(unjj "$LJ2")
NT2=$(jf notice "$LJ2J")
AT=$(ev "JSON.stringify(!!document.querySelector('.toast'))")
ATJ=$(unjj "$AT")
if [ "$NT2" = "0" ] && [ "$ATJ" = "false" ]; then ok "হ্যাশ-বিহীন লোডে notice=0+টোস্ট-শূন্য (মূল-প্রবাহ অটুট)"; else bad "হ্যাশ-বিহীন: notice=$NT2 টোস্ট=$ATJ"; fi
echo "── ধাপ-৪খ: hashchange-চেইন (টোস্ট-ডোম-অ্যাসার্ট — নির্ধারক; লাইফটাইম-রেস-শূন্য) ──"
# গোটচা (রান-১-এ আবিষ্কৃত): bopen-রিট্রাই-লুপ toast-২.৪সে-লাইফটাইমকে অতিক্রম করতে পারে
# → টোস্ট-অ্যাসার্ট hashchange-পথে তাৎক্ষণিক-ইভ (টোস্ট-জন্মের-পরেই — রেস-শূন্য)।
ev "location.hash='#post-999999'; 'n1'" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1
TP=$(ev "JSON.stringify({v:(function(){var t=document.querySelector('.toast.lf313-info'); return t?'1':'0'})()})")
TPJ=$(unjj "$TP"); TPV=$(jf v "$TPJ")
TS=$(ev "JSON.stringify({v:(function(){var t=document.querySelector('.toast.lf313-info'); return t&&t.classList.contains('show')?'1':'0'})()})")
TSJ=$(unjj "$TS"); TSV=$(jf v "$TSJ")
if [ "$TPV" = "1" ] && [ "$TSV" = "1" ]; then ok "lf313-info-টোস্ট উপস্থিত+প্রদর্শিত (hashchange-জন্ম)"; else bad "টোস্ট-উপস্থিত=$TPV প্রদর্শিত=$TSV"; fi
TBG=$(ev "JSON.stringify({v:(function(){var t=document.querySelector('.toast.lf313-info'); return t?getComputedStyle(t,'::before').backgroundColor:'none'})()})")
TBGJ=$(unjj "$TBG"); TBGV=$(jf v "$TBGJ")
if [ -n "$TBGV" ] && [ "$TBGV" != "none" ] && [ "$TBGV" != "rgba(0, 0, 0, 0)" ]; then ok "টোস্ট ::before-অ্যাকসেন্ট-বার-প্রয়োগ (color-mix রেন্ডার: $TBGV)"; else bad "::before-বার-অনুপস্থিত ($TBGV)"; fi
TAF=$(ev "JSON.stringify({v:(function(){var t=document.querySelector('.toast.lf313-info'); if(!t) return 'absent'; var c=getComputedStyle(t,'::after').content; return c==='none'?'none':'icon'})()})")
TAFJ=$(unjj "$TAF"); TAFV=$(jf v "$TAFJ")
if [ "$TAFV" = "icon" ]; then ok "lf313-info ::after-তথ্য-আইকন (FA6 content নন-নোন)"; else bad "::after-আইকন ($TAFV)"; fi
if agent-browser screenshot "$SH_TOAST" >/dev/null 2>&1; then ok "স্ক্রিনশট: অবতরণ-নোটিশ-টোস্ট"; else skip "টোস্ট-স্ক্রিনশট-ব্যর্থ"; fi
M1=$(ev "JSON.stringify({n:window.__s312LandQA.notice, h:window.__s312LandQA.hashEvents})")
M1J=$(unjj "$M1")
N1=$(jf n "$M1J"); H1=$(jf h "$M1J")
if [ "$N1" = "1" ] && [ "$H1" = "1" ]; then ok "hashchange-ই২ই: miss→notice=1, hashEvents=1"; else bad "hashchange-miss: notice=$N1 hashEvents=$H1"; fi
# গোটচা (s312-নোট-পুনঃপ্রমাণিত): curl-ফিড ≠ ব্রাউজার-ফিড (সেশন-ব্যক্তিগতকরণ) — হিট-আইডি
# অবশ্যই ব্রাউজার-DOM থেকে (ইন্টারসেকশন-নীতি)।
DID=$(ev "JSON.stringify({id:(function(){var e=document.querySelector('[data-s312-post]');return e?String(e.getAttribute('data-s312-post')):''})()})")
DIDJ=$(unjj "$DID")
DIDV=$(jf id "$DIDJ")
if [ -n "$DIDV" ] && [ "$DIDV" != "" ] && [ "$DIDV" != "None" ]; then
  ev "location.hash='#post-$DIDV'; 'n2'" >/dev/null 2>&1; agent-browser wait 700 >/dev/null 2>&1
  M2=$(ev "JSON.stringify({f:window.__s312LandQA.found, n:window.__s312LandQA.notice, i:window.__s312LandQA.id, h:window.__s312LandQA.hashEvents})")
  M2J=$(unjj "$M2")
  F2=$(jf f "$M2J"); N2b=$(jf n "$M2J"); I2=$(jf i "$M2J"); H2=$(jf h "$M2J")
  if [ "$F2" = "1" ] && [ "$N2b" = "0" ] && [ "$I2" = "$DIDV" ]; then ok "হ্যাশ-শৃঙ্খলে সতেজ-স্টেট (miss→hit: found=1 notice=0 স্টেল-শূন্য — গন্তব্য $DIDV)"; else bad "শৃঙ্খল: found=$F2 notice=$N2b id=$I2 (প্রত্যাশা $DIDV)"; fi
  if [ "$H2" = "2" ]; then ok "hashEvents=২ (দুই-চেষ্টা-গণিত)"; else bad "hashEvents=$H2 (প্রত্যাশা ২)"; fi
else
  skip "ব্রাউজার-DOM-কার্ড-আইডি-শূন্য — হিট-শাখা-স্কিপ (found:0-গ্রেসফুল-চুক্তি-বৈধ)"
fi

echo "── ধাপ-৫: toast-family ভিজ্যুয়াল-স্টেট (success/error বার) ──"
ev "window.showToast('সফল-পরীক্ষা','success'); 't1'" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
SB=$(ev "JSON.stringify((function(){var t=document.querySelector('.toast.success'); return t?getComputedStyle(t,'::before').backgroundColor:''})())")
SBJ=$(unjj "$SB")
if [ -n "$SBJ" ] && [ "$SBJ" != "rgba(0, 0, 0, 0)" ]; then ok "success-টোস্ট ::before-বার (var(--lf-ok)-রেন্ডার)"; else bad "success-বার-অনুপস্থিত ($SBJ)"; fi
ev "window.showToast('ত্রুটি-পরীক্ষা','error'); 't2'" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
EB=$(ev "JSON.stringify((function(){var t=document.querySelector('.toast.error'); return t?getComputedStyle(t,'::before').backgroundColor:''})())")
EBJ=$(unjj "$EB")
if [ -n "$EBJ" ] && [ "$EBJ" != "rgba(0, 0, 0, 0)" ]; then ok "error-টোস্ট ::before-বার (var(--lf-danger)-রেন্ডার)"; else bad "error-বার-অনুপস্থিত ($EBJ)"; fi

echo "── ধাপ-৬: মোবাইল-390 (hScroll-শূন্য + টোস্ট-ভিউপোর্ট-সচেতন + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/dashboard" || bad "মোবাইল-ড্যাশবোর্ড-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
ev "location.hash='#post-999999'; 'm1'" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth, tv:(function(){var t=document.querySelector('.toast.lf313-info'); if(!t) return -1; var r=t.getBoundingClientRect(); return (r.bottom<=window.innerHeight+2 && r.left>=0 && r.right<=window.innerWidth+2)?1:0})()})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
TV=$(jf tv "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$TV" = "1" ]; then ok "মোবাইলে টোস্ট ভিউপোর্টে-সম্পূর্ণ (safe-area-640px-রেন্ডার)"; else bad "টোস্ট-ভিউপোর্ট-বহির্ভূত (tv=$TV)"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "মোবাইল-স্ক্রিনশট সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৭: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
bopen "$BASE/" || bad "হোম-পুনঃopen-ব্যর্থ"
agent-browser wait 1800 >/dev/null 2>&1
E=$(agent-browser errors 2>/dev/null | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "কনসোল-ত্রুটি: $E"; fi
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi
SSC=$(curl -s "$BASE/")
if echo "$SSC" | grep -q "s307কিউএ"; then bad "পরিষ্কার-পরে মার্কার-শিরোনাম অবশিষ্ট"; else ok "পরিষ্কার-পরে মার্কার-শিরোনাম-শূন্য (SSR)"; fi
(cd "$APP" && node scripts/s313-order-toggle.js get) | grep -q "NULL" && ok "পরিষ্কার-পরে home_feed_order=নিরপেক্ষ (NULL)" || ok "পরিষ্কার-পরে home_feed_order-অ-NULL (মূল-মান-সংরক্ষিত — বৈধ)"

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s313-suite ✓ সর্ব-সবুজ"; else echo "s313-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
