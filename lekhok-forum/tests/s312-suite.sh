#!/bin/bash
# s312-suite.sh — session312: sfs312 — ফোন-ফিড ট্যাপ-থ্রু (is-real307 → /dashboard#post-<id>)
# [Task ID 149] PLANS session311-নোটের প্রস্তাব-① প্রয়োগ:
#   ① feed.ejs — sfsRow307 +id বহন + ×৪-রো data-post-id + session312-ইঞ্জিন (ডেলিগেটেড click →
#      stopPropagation + preventDefault + navigate; JS-বিহীনে কেবল-প্রদর্শন s306b-ধর্ম;
#      s306-একক-লিঙ্ক-চুক্তি অক্ষুণ্ণ — tabindex/role-অনুপ্রবেশ-নিষিদ্ধ) + __sfs312QA-হুক
#   ② FeedPostCard.ejs — সাধারণ-কার্ড রুটে নামস্পেসড data-s312-post (data-post-id-ব্যবহারকারী
#      comment-tools/article-reading-সংঘর্ষ-নিষিদ্ধ — নতুন-অ্যাট্রির-পূর্বে সংঘর্ষ-গ্রেপ-চুক্তি)
#   ③ dashboard.ejs — s312-অবতরণ-ব্লক: #post-<id> → [data-s312-post]/[data-post-id]
#      scrollIntoView + .s312-land-flash + __s312LandQA-হুক (হ্যাশ-বিহীন লোড = no-op;
#      /dashboard নাম-গেটেড নয় — নাম-বিহীনও 200 — ফিড-কার্ড-বহুল প্রিভিউ)
#   ④ style.css — session312-ব্লক হেক্স-শূন্য (ট্যাপ-অ্যাফোর্ডেন্স + অবতরণ-ফ্ল্যাশ + reduced-motion + 640px)
# চুক্তি: সার্ভার-বন্ধ-সিড (s280-নীতি) + ডায়নামিক-গণনা-অ্যাসার্ট (ডিবি-রিয়েল-সংখ্যা-স্বাধীন)
#         + নেট-শূন্য-পরিষ্কারক (s307-মার্কার --clean) + jf/unjj-পার্সার (bash-quote-জিমন্যাস্টিকস-শূন্য)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s312-tap-desk.png
SH_MOB=/home/z/my-project/download/s312-tap-mobile390.png
SH_LAND=/home/z/my-project/download/s312-land-flash.png
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
  for i in 1 2 3 4 5; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  agent-browser close --all >/dev/null 2>&1
  sleep 1
  for i in 1 2 3; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s312-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s312-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent — ২-ইউজার + ৬-পোস্ট)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস) ──"
grep -q "id: p.id || ''," "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfsRow307-id-বহন" || bad "feed.ejs: id-বহন-অনুপস্থিত"
N_DP=$(grep -o "data-post-id=\"<%= p.id || '' %>\"" "$APP/views/partials/home/feed.ejs" | wc -l | tr -d ' ')
[ "$N_DP" = "4" ] && ok "feed.ejs: data-post-id ×৪-রো (২-গ্রুপ × ২-হাফ)" || bad "feed.ejs: data-post-id-গণনা=$N_DP (প্রত্যাশা ৪)"
grep -q "sfs312-tap" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfs312-tap-ক্লাস-ওয়্যারিং" || bad "feed.ejs: tap-ক্লাস-অনুপস্থিত"
grep -q "stopPropagation" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: ফোন-অ্যাঙ্কর-দমন (stopPropagation)" || bad "feed.ejs: দমন-অনুপস্থিত"
grep -q "preventDefault" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: ডিফল্ট-নেভিগেশন-দমন (preventDefault)" || bad "feed.ejs: preventDefault-অনুপস্থিত"
grep -q "'/dashboard#post-' + encodeURIComponent" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: ডিপ-লিঙ্ক-গঠন (/dashboard#post-<id>)" || bad "feed.ejs: ডিপ-লিঙ্ক-গঠন-অমিল"
grep -q "window.__sfs312QA = q312;" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs312QA-হুক (সর্বদা-সংজ্ঞায়িত)" || bad "feed.ejs: 312-হুক-অনুপস্থিত"
grep -q "window.__sfs307QA = q307;" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs307QA-হুক অক্ষুণ্ণ (legacy)" || bad "feed.ejs: 307-হুক-ক্ষতিগ্রস্ত"
if grep -q "setAttribute('tabindex'" "$APP/views/partials/home/feed.ejs"; then bad "feed.ejs: tabindex-অনুপ্রবেশ (s306-একক-লিঙ্ক-চুক্তি-ভঙ্গ)"; else ok "feed.ejs: tabindex/role-অনুপ্রবেশ-শূন্য (s306-চুক্তি অক্ষুণ্ণ)"; fi
(cd "$APP" && node -e "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('views/partials/home/feed.ejs','utf8'),{filename:'views/partials/home/feed.ejs'});console.log('OK')") >/dev/null 2>&1 && ok "feed.ejs: EJS-compile গ্রিন" || bad "feed.ejs: EJS-compile-ব্যর্থ"
grep -q 'data-s312-post="<%= item.id %>"' "$APP/views/shared/post/FeedPostCard.ejs" && ok "FeedPostCard.ejs: সাধারণ-কার্ড data-s312-post (নামস্পেসড)" || bad "FeedPostCard.ejs: data-s312-post-অনুপস্থিত"
if grep -rn "data-s312-post" "$APP/public/assets/js/" >/dev/null 2>&1; then bad "FeedPostCard: data-s312-post-জেএস-সংঘর্ষ"; else ok "data-s312-post: JS-সংঘর্ষ-শূন্য (নামস্পেস-চুক্তি)"; fi
(cd "$APP" && node -e "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('views/shared/post/FeedPostCard.ejs','utf8'),{filename:'views/shared/post/FeedPostCard.ejs'});console.log('OK')") >/dev/null 2>&1 && ok "FeedPostCard.ejs: EJS-compile গ্রিন" || bad "FeedPostCard.ejs: EJS-compile-ব্যর্থ"
grep -q "window.__s312LandQA = q312;" "$APP/views/user/dashboard.ejs" && ok "dashboard.ejs: __s312LandQA-হুক" || bad "dashboard.ejs: ল্যান্ড-হুক-অনুপস্থিত"
grep -q '\^#post-' "$APP/views/user/dashboard.ejs" && ok "dashboard.ejs: হ্যাশ-রেজেক্স-গেট (^#post-<digits>)" || bad "dashboard.ejs: হ্যাশ-রেজেক্স-অনুপস্থিত"
grep -q 's312-land-flash' "$APP/views/user/dashboard.ejs" && ok "dashboard.ejs: অবতরণ-ফ্ল্যাশ-ক্লাস" || bad "dashboard.ejs: ফ্ল্যাশ-ক্লাস-অনুপস্থিত"
grep -q "data-s312-post" "$APP/views/user/dashboard.ejs" && ok "dashboard.ejs: দ্বি-নির্বাচক ([data-s312-post]/[data-post-id])" || bad "dashboard.ejs: দ্বি-নির্বাচক-অনুপস্থিত"
(cd "$APP" && node -e "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('views/user/dashboard.ejs','utf8'),{filename:'views/user/dashboard.ejs'});console.log('OK')") >/dev/null 2>&1 && ok "dashboard.ejs: EJS-compile গ্রিন" || bad "dashboard.ejs: EJS-compile-ব্যর্থ"
BLOCK312=$(sed -n "/session312 (sfs312)/,\$p" "$APP/public/assets/css/style.css")
echo "$BLOCK312" | grep -q ".sfs312-tap" && ok "style.css: session312-ব্লক .sfs312-tap" || bad "style.css: 312-ব্লক-অনুপস্থিত"
if echo "$BLOCK312" | grep -qE "#[0-9a-fA-F]{3,8}\b"; then bad "css-session312-ব্লকে হেক্স-আবিষ্কৃত"; else ok "css-session312-ব্লক হেক্স-শূন্য (টোকেন/color-mix)"; fi
echo "$BLOCK312" | grep -q "prefers-reduced-motion" && ok "css-session312: reduced-motion-গার্ড" || bad "css-session312: reduced-motion-অনুপস্থিত"
echo "$BLOCK312" | grep -q "max-width: 640px" && ok "css-session312: 640px-সংকোচন" || bad "css-session312: 640px-অনুপস্থিত"
echo "$BLOCK312" | grep -q "s312LandFlash" && ok "css-session312: অবতরণ-ফ্ল্যাশ keyframes" || bad "css-session312: ফ্ল্যাশ-keyframes-অনুপস্থিত"
echo "$BLOCK312" | grep -q "cursor: pointer" && ok "css-session312: pointer-অ্যাফোর্ডেন্স" || bad "css-session312: pointer-অ্যাফোর্ডেন্স-অনুপস্থিত"

echo "── ধাপ-২: SSR (ডায়নামিক-গণনা — ডিবি-রিয়েল-সংখ্যা-স্বাধীন) ──"
bopen "$BASE/" || { bad "হোম open ব্যর্থ"; exit 1; }
agent-browser wait 2200 >/dev/null 2>&1
H=$(ev "JSON.stringify({real:(window.__sfs307QA||{}).real||0, wired:(window.__sfs312QA||{}).wired, taps:(window.__sfs312QA||{}).taps, err:(window.__sfs312QA||{}).err, tapRows:document.querySelectorAll('.sfs312-tap').length, demoTap:document.querySelectorAll('.sfs292-post:not(.is-real307).sfs312-tap').length, phoneA:!!document.querySelector('a.sfs292-phone[href=\"/dashboard\"]')})")
HJ=$(unjj "$H")
REAL=$(jf real "$HJ")
WIRED=$(jf wired "$HJ")
TAPROWS=$(jf tapRows "$HJ")
ERR312=$(jf err "$HJ")
EXPECT=$(( 2 * (REAL < 4 ? REAL : 4) + 2 * ((REAL - 4) > 0 ? ((REAL - 4) < 4 ? (REAL - 4) : 4) : 0) ))
if [ "$REAL" -ge 6 ] 2>/dev/null; then ok "রিয়েল-পোস্ট ডিবিতে উপস্থিত (real=$REAL — সিড-গ্যারান্টি)"; else bad "রিয়েল-পোস্ট-ঘাটতি (real=$REAL)"; fi
if [ "$WIRED" = "$EXPECT" ] && [ "$WIRED" -gt 0 ] 2>/dev/null; then ok "wired=ডায়নামিক-প্রত্যাশা ($WIRED = ২×মিন(৪,realA)+২×মিন(৪,realB))"; else bad "wired=$WIRED প্রত্যাশা=$EXPECT"; fi
if [ "$TAPROWS" = "$WIRED" ]; then ok "tapRows==wired ($TAPROWS — ক্লাস-ওয়্যারিং-সামঞ্জস্য)"; else bad "tapRows=$TAPROWS wired=$WIRED অমিল"; fi
if [ "$ERR312" = "" ]; then ok "sfs312-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "sfs312-ইঞ্জিন-ত্রুটি: $ERR312"; fi
DEMO=$(jf demoTap "$HJ")
if [ "$DEMO" = "0" ]; then ok "ডেমো-সারি অস্পৃশ্য (demoTap=0 — id-শূন্য-গেট)"; else bad "ডেমো-সারি-ট্যাপযোগ্য ($DEMO)"; fi
PHONEA=$(jf phoneA "$HJ")
if [ "$PHONEA" = "true" ]; then ok "ফোন-একক-লিঙ্ক অক্ষুণ্ণ (a.sfs292-phone → /dashboard)"; else bad "ফোন-লিঙ্ক-ক্ষতিগ্রস্ত"; fi

echo "── ধাপ-৩: E2E ট্যাপ-থ্রু (এভাল-ক্লিক — নির্ধারক; ইন্টারসেকশন-নির্বাচন) ──"
# গোটচা (রান-২/৩-এ আবিষ্কৃত): ফোন-ট্যাপ-সারির-পোস্ট ড্যাশবোর্ড-ফিডে-না-ও-থাকতে-পারে
# (র‍্যাঙ্কড-সর্ট/স্লাইস — ফিড-ব্যক্তিগতকরণ) — found:0-গ্রেসফুল-চুক্তি বৈধ; সুইটে গন্তব্য-
# নিশ্চিত-নির্বাচন = হোম-ট্যাপ-আইডি ∩ ড্যাশবোর্ড-ফিড-কার্ড-আইডি (প্রথম-মিল)।
DIDS=$(curl -s "$BASE/dashboard" | grep -o 'data-s312-post="[0-9]*"' | grep -o '[0-9]*' | sort -u | tr '\n' ' ')
TIDS=$(ev "JSON.stringify([].map.call(document.querySelectorAll('.sfs312-tap'),function(r){return r.getAttribute('data-post-id')}))")
TIDSJ=$(unjj "$TIDS")
TID=$(printf '%s' "$TIDSJ" | DIDS="$DIDS" python3 -c "
import sys, json, os
ids = json.load(sys.stdin)
have = set(os.environ.get('DIDS', '').split())
pick = [i for i in ids if i in have]
print(pick[0] if pick else '')" 2>/dev/null)
if [ -n "$TID" ] && [ "$TID" != "null" ]; then
  ok "ট্যাপ∩ড্যাশবোর্ড-ফিড গন্তব্য-নির্বাচিত ($TID — ফিড-সাবসেট-সচেতন)"
  ev "(function(){var el=document.querySelector('.sfs312-tap[data-post-id=\"$TID\"]'); if(el) el.click(); return 'ok'})()" >/dev/null 2>&1
  agent-browser wait 1500 >/dev/null 2>&1
  U=$(agent-browser get url 2>/dev/null)
  if echo "$U" | grep -q "#post-$TID\$"; then ok "ক্লিকে ডিপ-লিঙ্ক-নেভিগেশন ($U)"; else bad "নেভিগেশন-ব্যর্থ (URL=$U)"; fi
  if echo "$U" | grep -q "/dashboard"; then ok "গন্তব্য /dashboard (লগইন-গেট-সচেতন গঠন)"; else bad "গন্তব্য-অমিল ($U)"; fi
  L=$(ev "JSON.stringify({found:(window.__s312LandQA||{}).found, id:(window.__s312LandQA||{}).id, err:(window.__s312LandQA||{}).err, tgt:!!document.querySelector('[data-s312-post=\"$TID\"]'), inView:(function(){var el=document.querySelector('[data-s312-post=\"$TID\"]'); if(!el) return false; var r=el.getBoundingClientRect(); return r.top>=-40 && r.top<=window.innerHeight;})(), postAttr:document.querySelectorAll('[data-s312-post]').length})")
  LJ=$(unjj "$L")
  FOUND=$(jf found "$LJ")
  LID=$(jf id "$LJ")
  LERR=$(jf err "$LJ")
  TGT=$(jf tgt "$LJ")
  INVIEW=$(jf inView "$LJ")
  PATTR=$(jf postAttr "$LJ")
  if [ "$FOUND" = "1" ]; then ok "অবতরণ-হুক found=1 (হ্যাশ-রেজলভ)"; else bad "অবতরণ-হুক found=$FOUND"; fi
  if [ "$LID" = "$TID" ]; then ok "অবতরণ-হুক সঠিক-আইডি ($LID)"; else bad "অবতরণ-আইডি-অমিল ($LID ≠ $TID)"; fi
  if [ "$LERR" = "" ]; then ok "অবতরণ-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "অবতরণ-ত্রুটি: $LERR"; fi
  if [ "$TGT" = "true" ]; then ok "গন্তব্য-কার্ড data-s312-post উপস্থিত (পোস্ট $TID)"; else bad "গন্তব্য-কার্ড-অনুপস্থিত"; fi
  if [ "$INVIEW" = "true" ]; then ok "scrollIntoView-প্রমাণ (কার্ড ভিউপোর্টে)"; else bad "কার্ড-ভিউপোর্ট-বহির্ভূত"; fi
  if [ "$PATTR" -gt 0 ] 2>/dev/null; then ok "ফিডে data-s312-post-কার্ড ×$PATTR (FeedPostCard-পোর্ট-প্রমাণ)"; else bad "ফিডে data-s312-post-শূন্য"; fi
  if agent-browser screenshot "$SH_LAND" >/dev/null 2>&1; then ok "অবতরণ-স্ক্রিনশট সংরক্ষিত"; else skip "অবতরণ-স্ক্রিনশট-ব্যর্থ"; fi
else
  skip "ট্যাপ∩ফিড-ইন্টারসেকশন-শূন্য — অবতরণ-অ্যাসার্ট স্কিপ (found:0-গ্রেসফুল-চুক্তি-বৈধ)"
fi

echo "── ধাপ-৪: অ্যাফোর্ডেন্স (cursor + hover-টিন্ট + শেভরন + দ্বি-লোড-এরর-শূন্য) ──"
bopen "$BASE/" || bad "হোম-পুনঃopen ব্যর্থ"
agent-browser wait 2200 >/dev/null 2>&1
A=$(ev "JSON.stringify({cur:(function(){var t=document.querySelector('.sfs312-tap'); return t?getComputedStyle(t).cursor:''})(), tr:document.querySelectorAll('.sfs312-tap').length})")
AJ=$(unjj "$A")
CUR=$(jf cur "$AJ")
if [ "$CUR" = "pointer" ]; then ok "tap-সারি cursor:pointer (অ্যাফোর্ডেন্স)"; else bad "cursor=$CUR (প্রত্যাশা pointer)"; fi
agent-browser hover ".sfs312-tap" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
HV=$(ev "JSON.stringify({bg:getComputedStyle(document.querySelector('.sfs312-tap')).backgroundColor, ch:getComputedStyle(document.querySelector('.sfs312-tap'),'::after').opacity})")
HVJ=$(unjj "$HV")
BG=$(jf bg "$HVJ")
CH=$(jf ch "$HVJ")
if [ "$BG" != "rgba(0, 0, 0, 0)" ] && [ -n "$BG" ]; then ok "hover-ব্র্যান্ড-টিন্ট প্রয়োগ (color-mix)"; else bad "hover-টিন্ট-অনুপস্থিত ($BG)"; fi
if [ "$CH" = "1" ]; then ok "hover-শেভরন ::after opacity=1"; else bad "শেভরন-opacity=$CH"; fi
if agent-browser screenshot "$SH_DESK" >/dev/null 2>&1; then ok "হোম-ট্যাপ-স্ক্রিনশট (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
if bopen "$BASE/"; then agent-browser wait 1800 >/dev/null 2>&1; ok "দ্বি-লোড-সম্পন্ন"; else bad "দ্বি-লোড-ব্যর্থ"; fi
E=$(agent-browser errors 2>/dev/null | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "কনসোল-ত্রুটি: $E"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-open ব্যর্থ"
agent-browser wait 2000 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth, wired:(window.__sfs312QA||{}).wired})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "মোবাইল-স্ক্রিনশট সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৬: নেট-শূন্য-পরিষ্কারক (s307-মার্কার --clean — ×৩-অ্যাসার্ট) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi
SS=$(curl -s "$BASE/")
if echo "$SS" | grep -q "s307কিউএ"; then bad "পরিষ্কার-পরে মার্কার-শিরোনাম অবশিষ্ট"; else ok "পরিষ্কার-পরে মার্কার-শিরোনাম-শূন্য (SSR)"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s312-suite ✓ সর্ব-সবুজ"; else echo "s312-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
