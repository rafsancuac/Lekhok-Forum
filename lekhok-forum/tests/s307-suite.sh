#!/bin/bash
# s307-suite.sh — session307: sfs307 — ফোন-ফিড **বাস্তব-হাইড্রেশন** + IO-পজ + চিপ ×৩
# [Task ID 147] PLANS session306-প্রস্তাবের প্রথম-তিন-প্রার্থী এক-রাউন্ডে:
#   ① ফোন-স্ক্রিনে বাস্তব-ফিড-ডেটা — লগইন-বিহীন পাবলিক-পোস্ট SSR-হাইড্রেশন
#     (status='published' + audience='PUBLIC' + shared_from IS NULL + লেখক-active;
#      গ্রুপ-এ=সর্বশেষ ৪, গ্রুপ-বি=জনপ্রিয়তা-সর্ট ৪; ঘাটতিতে ডেমো-ফিল — ৪+৪ স্থিতিশীল;
#      try/catch-গ্রেসফুল — অ-মাইগ্রেটেড ডিবিতেও হোম-জীবিত s306b-ধর্ম)
#   ② kiosk-স্টাইল IntersectionObserver-পজ — সেকশন ভিউপোর্ট-বহির্ভূত হলে ট্র্যাক-স্থগিত
#     (CPU-সাশ্রয়; .sfs307-io-off ক্লাস-টগল + animation-play-state) + __sfs307QA-হুক
#   ③ চিপ ×২→×৩ — feedSlides-রেজিস্ট্রির পূর্ণ-ব্যবহার (sfs292-chip-c মধ্য-বাম)
#   [Mandatory-স্টাইল] style.css session307-ব্লক হেক্স-শূন্য (লাইভ-পিল pulse + ব্র্যান্ড-রিং
#     বাস্তব-অ্যাভাটার + চিপ-c + ট্রানজিশন + reduced-motion + 1024px)।
# চুক্তি: সার্ভার-বন্ধ-সিড (pkill -9; s280-নীতি) + মার্কার-সিড idempotent + নেট-শূন্য-পরিষ্কারক
#         (--clean ×৩-অ্যাসার্ট) + bopen-রিট্রাই + unj() + ডায়নামিক-গণনা-অ্যাসার্ট
#         (ডিবি-র-পূর্ব-বিদ্যমান পাবলিক-পোস্টের উপর নির্ভর-শূন্য — real ≥ 6-মার্কার-নিম্নসীমা)।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s307-feed-real-desk.png
SH_MOB=/home/z/my-project/download/s307-feed-real-mobile390.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
unj(){ echo "$1" | sed 's/\\"/"/g; s/^"//; s/"$//'; }
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
SRV_WAS=0
if curl -s -o /dev/null -m 2 "$BASE/"; then SRV_WAS=1; pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s307-migrate.log 2>&1) && ok "db/migrate.js রান (audience-কলাম-নিশ্চিত)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s307-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent — ২-ইউজার + ৬-পোস্ট)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (রুট/ভিউ/সিএসএস) ──"
grep -q "let sfsRealPosts307 = \[\];" "$APP/routes/pages.js" && ok "pages.js: sfs307-কোয়েরি-লোকাল (try/catch-গ্রেসফুল)" || bad "pages.js: কোয়েরি-লোকাল-অনুপস্থিত"
grep -q "p.audience = 'PUBLIC' AND p.shared_from IS NULL" "$APP/routes/pages.js" && ok "pages.js: পাবলিক-ফিল্টার (audience+shared_from)" || bad "pages.js: পাবলিক-ফিল্টার-অনুপস্থিত"
grep -q "u.status = 'active'" "$APP/routes/pages.js" && ok "pages.js: লেখক-active-ফিল্টার" || bad "pages.js: লেখক-ফিল্টার-অনুপস্থিত"
grep -q "LIMIT 8\`).all();" "$APP/routes/pages.js" && ok "pages.js: LIMIT-8-হাইড্রেশন-ক্যাপ" || bad "pages.js: LIMIT-অনুপস্থিত"
grep -q "sfsRealPosts: sfsRealPosts307," "$APP/routes/pages.js" && ok "pages.js: রেন্ডার-লোকাল-পাস" || bad "pages.js: রেন্ডার-পাস-অনুপস্থিত"
node --check "$APP/routes/pages.js" && ok "pages.js: node --check গ্রিন" || bad "pages.js: সিনট্যাক্স-ব্যর্থ"
grep -q "const sfsRow307 = (p) => ({" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfsRow307-হাইড্রেশন-বিল্ডার" || bad "feed.ejs: বিল্ডার-অনুপস্থিত"
grep -q "sfsReal307.slice(4, 8).slice().sort" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: গ্রুপ-বি জনপ্রিয়তা-সর্ট (engagement DESC)" || bad "feed.ejs: জনপ্রিয়তা-সর্ট-অনুপস্থিত"
grep -q "sfsFill307(sfsRealA307, sfsDemoA292)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: ডেমো-ফিল-চুক্তি (৪+৪ স্থিতিশীল)" || bad "feed.ejs: ফিল-অনুপস্থিত"
# session312 (sfs312): রো-মার্ক ×৪ + s312-ইঞ্জিনের querySelectorAll-রেফারেন্স ×২ = ৬ (লিজিটিমেট-বৃদ্ধি)
# session313-আপডেট (নতুন-মান+কারণ — গণনা-অ্যাসার্ট-চুক্তি): হাফ-ক্লোন-লুপ-গঠনে রো-মার্ক ×১-লুপে
# নেমেছে (×৪-ডুপ্লিকেট নির্মূল — রেন্ডার্ড-আউটপুট অপরিবর্তিত) + s312-ইঞ্জিন-রেফ ×২ = ৩।
[ "$(grep -o "is-real307" "$APP/views/partials/home/feed.ejs" | wc -l | tr -d ' ')" = "3" ] && ok "feed.ejs: is-real307 রো-মার্ক ×১-লুপ + s312-ইঞ্জিন-রেফ ×২ (session313-লুপ-গঠন)" || bad "feed.ejs: রো-মার্ক-গণনা=$(grep -o 'is-real307' "$APP/views/partials/home/feed.ejs" | wc -l | tr -d ' ')"
grep -q 'sfsRealCount307 > 0' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: লাইভ-পিল-গেট (realCount>0)" || bad "feed.ejs: লাইভ-পিল-গেট-অনুপস্থিত"
grep -q "slice(0, 3);" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: চিপ ×২→×৩ (slice(0,3))" || bad "feed.ejs: চিপ-স্লাইস-অমিল"
grep -q "\['a', 'b', 'c'\]\[i\]" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: চিপ-ক্লাস-ম্যাপিং ×৩" || bad "feed.ejs: চিপ-ম্যাপিং-অনুপস্থিত"
grep -q "__sfs307QA" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs307QA-হুক" || bad "feed.ejs: হুক-অনুপস্থিত"
grep -q "IntersectionObserver" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: IO-পজ-ইঞ্জিন" || bad "feed.ejs: IO-ইঞ্জিন-অনুপস্থিত"
grep -q "sfs307-io-off" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: io-off-ক্লাস-টগল" || bad "feed.ejs: io-off-টগল-অনুপস্থিত"
grep -q "'IntersectionObserver' in window" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: IO-সাপোর্ট-গার্ড (পুরাতন-ব্রাউজার-জীবিত)" || bad "feed.ejs: সাপোর্ট-গার্ড-অনুপস্থিত"
(cd "$APP" && node -e "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('views/partials/home/feed.ejs','utf8'),{filename:'views/partials/home/feed.ejs'});console.log('EJS-OK')") >/dev/null 2>&1 && ok "feed.ejs: EJS-compile গ্রিন" || bad "feed.ejs: EJS-compile-ব্যর্থ"
grep -q "session307 (sfs307)" "$APP/public/assets/css/style.css" && ok "style.css: session307-ব্লক" || bad "style.css: 307-ব্লক-অনুপস্থিত"
BLOCK307=$(sed -n "/session307 (sfs307)/,\$p" "$APP/public/assets/css/style.css")
if echo "$BLOCK307" | grep -qE "#[0-9a-fA-F]{3,8}\b"; then bad "css-session307-ব্লকে হেক্স-আবিষ্কৃত"; else ok "css-session307-ব্লক হেক্স-শূন্য (টোকেন/color-mix)"; fi
echo "$BLOCK307" | grep -q "sfs292-card.sfs307-io-off .sfs292-track" && ok "css: IO-পজ-রুল (animation-play-state)" || bad "css: IO-পজ-রুল-অনুপস্থিত"
echo "$BLOCK307" | grep -q "sfs292-chip-c" && ok "css: চিপ-c-অবস্থান" || bad "css: চিপ-c-অনুপস্থিত"
echo "$BLOCK307" | grep -q "prefers-reduced-motion" && ok "css-session307: reduced-motion-গার্ড" || bad "css-session307: reduced-motion-অনুপস্থিত"
grep -q "EOF session306 (sfs292)" "$APP/public/assets/css/style.css" && ok "style.css: EOF-306-অ্যাঙ্কর অক্ষুণ্ণ" || bad "style.css: EOF-306-ক্ষতিগ্রস্ত"

echo "── ধাপ-২: ডিবি + SSR ──"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
[ "$HC" = "200" ] && ok "হোম 200" || bad "হোম HTTP $HC"
curl -s "$BASE/" -o /tmp/s307-home.html
MK=$(grep -o 's307কিউএ' /tmp/s307-home.html | wc -l | tr -d ' ')
[ "$MK" -ge 6 ] && ok "SSR: s307কিউএ-মার্কার ×$MK (≥৬ — বাস্তব-হাইড্রেশন-প্রমাণ)" || bad "SSR: মার্কার-গণনা=$MK (প্রত্যাশা ≥৬)"
RI=$(grep -o 'is-real307' /tmp/s307-home.html | wc -l | tr -d ' ')
[ "$RI" -ge 12 ] && ok "SSR: is-real307 ×$RI (≥১২ — ৬-মার্কার × ২-হাফ)" || bad "SSR: is-real307-গণনা=$RI"
grep -q 'sfs307-live' /tmp/s307-home.html && ok "SSR: লাইভ-পিল-রেন্ডার (realCount>0-গেট)" || bad "SSR: লাইভ-পিল-অনুপস্থিত"
grep -q 'sfs292-chip-c' /tmp/s307-home.html && ok "SSR: চিপ ×৩-রেন্ডার" || bad "SSR: চিপ-c-অনুপস্থিত"
grep -q '__sfs307QA' /tmp/s307-home.html && ok "SSR: QA-হুক-এমিট" || bad "SSR: হুক-অনুপস্থিত"

echo "── ধাপ-৩: E2E (agent-browser — হুক + IO-পজ/রিজিউম + চিপ + বাংলা-অঙ্ক) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" && ok "হোম-পেজ-ওপেন" || bad "হোম-ওপেন-ব্যর্থ"
sleep 2
H=$(ev "(function(){var h=window.__sfs307QA; if(!h) return 'NO-HOOK'; return JSON.stringify({real:h.real,total:h.total,chips:h.chips,io:h.io})})()")
unj "$H" | grep -q '"total":8' && ok "হুক total=8 (৪+৪ সর্বদা)" || bad "হুক total-অমিল: $H"
unj "$H" | grep -q '"chips":3' && ok "হুক chips=3 (রেজিস্ট্রি-পূর্ণ-ব্যবহার)" || bad "হুক chips-অমিল: $H"
unj "$H" | grep -q '"io":1' && ok "হুক io=1 (IO-ইঞ্জিন-সক্রিয়)" || bad "হুক io-অমিল: $H"
REAL=$(unj "$H" | grep -o '"real":[0-9]*' | grep -o '[0-9]*$')
if [ -z "$REAL" ]; then REAL=$(unj "$H" | sed 's/.*"real": \([0-9]*\).*/\1/'); fi
[ -n "$REAL" ] && [ "$REAL" -ge 6 ] && ok "হুক real=$REAL (≥৬-মার্কার — ডায়নামিক-নিম্নসীমা)" || bad "হুক real-অমিল: $H"
EXP=$((REAL * 2))
RC=$(ev "(function(){return String(document.querySelectorAll('.sfs292-post.is-real307').length)})()" 2>/dev/null | tr -d '"')
[ "$RC" = "$EXP" ] && ok "DOM is-real307=$RC (হুক-real × ২-হাফ = $EXP)" || bad "DOM is-real307=$RC (প্রত্যাশা $EXP)"
TC=$(ev "(function(){return String(document.querySelectorAll('.sfs292-post').length)})()" 2>/dev/null | tr -d '"')
[ "$TC" = "16" ] && ok "DOM সর্ব-সারি=16 (৮ × ২-হাফ — ফিল-চুক্তি)" || bad "DOM সারি=$TC (প্রত্যাশা ১৬)"
# IO-পজ: পৃষ্ঠা-শীর্ষে (সেকশন ভিউপোর্ট-বহির্ভূত) → স্থগিত
ev "(function(){window.scrollTo(0,0);return 'top'})()" >/dev/null 2>&1; sleep 1
P1=$(ev "(function(){var h=window.__sfs307QA;var tr=document.querySelector('.sfs292-track');return JSON.stringify({off:h.ioOff,ps:getComputedStyle(tr).animationPlayState})})()")
unj "$P1" | grep -q '"off":true' && ok "IO: শীর্ষে-অফস্ক্রিনে ioOff=true" || bad "IO: অফস্ক্রিন-অবস্থা: $P1"
unj "$P1" | grep -q '"ps":"paused"' && ok "IO: ট্র্যাক animation-play-state=paused (CPU-সাশ্রয়)" || bad "IO: paused-অমিল: $P1"
# রিজিউম: সেকশনে ফিরে → চলমান
ev "(function(){var s=document.querySelector('#user-feed'); if(s) s.scrollIntoView({block:'center'}); return 'sec'})()" >/dev/null 2>&1; sleep 1
P2=$(ev "(function(){var h=window.__sfs307QA;var tr=document.querySelector('.sfs292-track');return JSON.stringify({off:h.ioOff,ps:getComputedStyle(tr).animationPlayState})})()")
unj "$P2" | grep -q '"off":false' && ok "IO: সেকশনে-ফিরে ioOff=false" || bad "IO: রিজিউম-অবস্থা: $P2"
unj "$P2" | grep -q '"ps":"running"' && ok "IO: ট্র্যাক পুনঃ-running" || bad "IO: running-অমিল: $P2"
LP=$(ev "(function(){var l=document.querySelector('.sfs307-live'); return l? JSON.stringify({tx:l.textContent.trim().slice(0,40),vis:l.offsetWidth>0}) : 'NO-LIVE'})()")
unj "$LP" | grep -q 'বাস্তব পোস্ট' && ok "লাইভ-পিল-টেক্সট (বাস্তব-পোস্ট-সংকেত)" || bad "লাইভ-পিল: $LP"
BN=$(ev "(function(){var p=document.querySelector('.sfs292-post.is-real307 .sfs292-pacts'); return p? String(/[০-৯]/.test(p.textContent)) : 'NO-ROW'})()")
unj "$BN" | grep -q 'true' && ok "বাস্তব-সারি কাউন্টার বাংলা-অঙ্কে" || bad "বাংলা-অঙ্ক: $BN"
ERRN=$(agent-browser errors 2>/dev/null | wc -l | tr -d ' ')
[ "$ERRN" = "0" ] && ok "JS-এরর-শূন্য" || bad "JS-এরর $ERRN টি"
agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && ok "ডেস্কটপ-স্ক্রিনশট" || skip "ডেস্কটপ-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
ev "(function(){var s=document.querySelector('#user-feed'); if(s) s.scrollIntoView(); return 'm'})()" >/dev/null 2>&1
HS=$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()" 2>/dev/null | tr -d '"')
[ "$HS" != "true" ] && ok "মোবাইল-390 hScroll-শূন্য (page-level — s302-চুক্তি)" || bad "hScroll-ওভারফ্লো=$HS"
agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && ok "মোবাইল-স্ক্রিনশট" || skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: পরিষ্কারক (নেট-শূন্য ×৩-অ্যাসার্ট + গ্রেসফুল-ফলব্যাক-পুনঃ-প্রমাণ) ──"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "seed --clean রান" || bad "clean-ব্যর্থ"
DBN=$(cd "$APP" && node -e "
const initSqlJs=require('sql.js');const fs=require('fs');
initSqlJs().then(S=>{const db=new S.Database(fs.readFileSync('lekhok.db'));
const st=db.prepare(\"SELECT (SELECT COUNT(*) FROM posts WHERE title LIKE 's307কিউএ%') + (SELECT COUNT(*) FROM users WHERE username LIKE 's307qa%') AS n\");st.step();console.log(st.getAsObject().n);st.free();})" 2>/dev/null)
[ "$DBN" = "0" ] && ok "পরিষ্কার-পরবর্তী ডিবি-গণনা=০ (পোস্ট+ইউজার)" || bad "ডিবি-অবশিষ্ট=$DBN"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1
HC2=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
[ "$HC2" = "200" ] && ok "পরিষ্কার-পরবর্তী হোম 200 (সার্ভার-সুস্থ)" || bad "পরিষ্কার-পরবর্তী HTTP $HC2"
curl -s "$BASE/" -o /tmp/s307-home-after.html
if grep -q 's307কিউএ' /tmp/s307-home-after.html; then bad "পরিষ্কার-পরবর্তী মার্কার-অবশিষ্ট (SSR)"; else ok "পরিষ্কার-পরবর্তী মার্কার-শূন্য (SSR — নেট-শূন্য ×৩-তৃতীয়)"; fi
grep -q '__sfs307QA' /tmp/s307-home-after.html && ok "পরিষ্কার-পরবর্তীও হুক-জীবিত (ডেমো-ফলব্যাক-গ্রেসফুল)" || bad "পরিষ্কার-পরবর্তী হুক-অনুপস্থিত"

echo ""
echo "══ s307-সুইট: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" = "0" ] && echo "✅ সর্ব-গ্রিন" || echo "❌ ব্যর্থতা আছে"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
