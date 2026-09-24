#!/bin/bash
# s314-suite.sh — session314: sfs314 aria-জোড়া + keynav-গ্রুপ-হাইলাইট + s314-cacheflush
# [Task ID 151] PLANS session313-নোটের প্রস্তাব-②+③ প্রয়োগ:
#   ② sfs314 — ফোন-ফিড গ্রুপ-লেবেল aria-জোড়া (দৃশ্যমান-হাফে glabel id+aria-controls ↔
#      grows id+aria-labelledby; ক্লোন-হাফে id-নিষিদ্ধ) + কীবোর্ড-roving-হাইলাইট
#      (ArrowDown/ArrowUp ওয়ার্প + Escape; IO-গেট; Enter/Tab-অস্পৃশ্য — s306-চুক্তি) + __sfs314QA
#   ③ s314-cacheflush — db.js invalidateSettingsCache()/settingsCacheState() পাবলিক-হুক:
#      TTL-হিট-সম-রেফ (হট-পাথ-কোয়েরি-মুক্ত) + setSetting-তাৎক্ষণিক-ইনভ্যালিডেশন +
#      TTL-মেয়াদ-পরবর্তী-ফ্রেশ-রি-কোয়েরি প্রমাণ; ≤10s ক্রস-ইনস্ট্যান্স-বাউন্ড ডক-কৃত
#   ④ style.css session314-ব্লক হেক্স-শূন্য (var(--lf-brand-primary) + color-mix;
#      geometry-নিরপেক্ষ হাইলাইট; data-sfs314-focus-মার্কি-বিরতি; 640px + reduced-motion)
# চুক্তি: সার্ভার-বন্ধ-ইউনিট (s313-order-toggle-রীতি — দ্বি-প্রসেস-লেখা-বিস্ফোরণ-নিষিদ্ধ) +
#         অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক (s307 --clean)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s314-keynav-desk.png
SH_MOB=/home/z/my-project/download/s314-keynav-mobile390.png
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
  # s313-গোটচা: সম-URL-পুনঃ-open = নো-অপ → ম্যাচের-পরে reload বাধ্যতমূলক
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
(cd "$APP" && node db/migrate.js >/tmp/s314-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s314-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/ডিবি/সিএসএস/সিনট্যাক্স) ──"
grep -q "key: 'real-latest'" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: গ্রুপ-key real-latest" || bad "feed.ejs: key-অনুপস্থিত"
grep -q 'id="sfs314-glab-' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: glabel-id-টেমপ্লেট" || bad "feed.ejs: glabel-id-অনুপস্থিত"
grep -q 'aria-controls="sfs314-grows-' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: aria-controls-জোড়া" || bad "feed.ejs: aria-controls-অনুপস্থিত"
grep -q 'aria-labelledby="sfs314-glab-' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: aria-labelledby-বিপরীত-জোড়া" || bad "feed.ejs: aria-labelledby-অনুপস্থিত"
grep -q 'sfsHalf313 ? '"'"''"'"' : '"'"'<span class="sfs314-grows"' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: grows-র‍্যাপার-শাখা (ক্লোন-হাফে-শূন্য)" || bad "feed.ejs: grows-শাখা-অমিল"
grep -q "window.__sfs314QA" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs314QA-হুক" || bad "feed.ejs: __sfs314QA-অনুপস্থিত"
grep -q "labs314.length === grows314.length" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: জোড়া-অখণ্ডতা-গার্ড" || bad "feed.ejs: অখণ্ডতা-গার্ড-অনুপস্থিত"
grep -q "if (k314 === 'Escape')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: Escape-পথ" || bad "feed.ejs: Escape-পথ-অনুপস্থিত"
grep -q "phone314.addEventListener('blur', clear314)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: blur-বিলোপ" || bad "feed.ejs: blur-বিলোপ-অনুপস্থিত"
grep -q "function invalidateSettingsCache()" "$APP/db.js" && ok "db.js: invalidateSettingsCache()" || bad "db.js: invalidate-অনুপস্থিত"
grep -q "function settingsCacheState()" "$APP/db.js" && ok "db.js: settingsCacheState()" || bad "db.js: state-অনুপস্থিত"
grep -q "  settingsCacheState," "$APP/db.js" && ok "db.js: exports-দ্বয়" || bad "db.js: exports-অনুপস্থিত"
grep -q "invalidateSettingsCache();  // invalidate read cache" "$APP/db.js" && ok "db.js: setSetting-একক-উৎস-ইনভ্যালিডেশন" || bad "db.js: setSetting-ইনভ্যালিডেশন-অমিল"
B314=$(python3 - "$APP/public/assets/css/style.css" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding='utf-8').read()
i = t.find('session314')
e = t.find('EOF session314')
print(t[i:e] if i != -1 and e > i else 'MISSING')
PYEOF
)
if [ "$B314" != "MISSING" ]; then
  ok "style.css: session314-ব্লক উপস্থিত"
  HEXN=$(printf '%s' "$B314" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
  if [ "$HEXN" = "0" ]; then ok "style.css: session314-ব্লক হেক্স-শূন্য"; else bad "style.css: হেক্স ×$HEXN (session314-ব্লক)"; fi
  echo "$B314" | grep -q "color-mix(in srgb, var(--lf-brand-primary) 14%" && ok "style.css: ব্র্যান্ড-টিন্ট color-mix" || bad "style.css: color-mix-অমিল"
  echo "$B314" | grep -q ".sfs314-grows { display: contents; }" && ok "style.css: grows-layout-neutral" || bad "style.css: display-contents-অনুপস্থিত"
  echo "$B314" | grep -q ".sfs292-phone\[data-sfs314-focus\] .sfs292-track" && ok "style.css: মার্কি-বিরতি-গেট" || bad "style.css: মার্কি-বিরতি-অনুপস্থিত"
  echo "$B314" | grep -q "prefers-reduced-motion" && ok "style.css: reduced-motion-গার্ড" || bad "style.css: reduced-motion-অনুপস্থিত"
  echo "$B314" | grep -q "max-width: 640px" && ok "style.css: 640px-safe-area" || bad "style.css: 640px-অনুপস্থিত"
  echo "$B314" | grep -q "margin-inline: -8px" && ok "style.css: geometry-নিরপেক্ষ-আপস" || bad "style.css: আপস-অনুপস্থিত"
else
  bad "style.css: session314-ব্লক-অনুপস্থিত"
fi
(cd "$APP" && node --check db.js) && ok "node --check db.js" || bad "db.js --check-ব্যর্থ"

echo "── ধাপ-২: SSR-ডায়নামিক (aria-জোড়া ×২ — দৃশ্যমান-হাফে-কেবল) ──"
SS=$(curl -s "$BASE/")
AC=$(printf '%s' "$SS" | grep -o 'aria-controls="sfs314-grows-' | wc -l | tr -d ' ')
if [ "$AC" = "2" ]; then ok "SSR: aria-controls ×২ (জোড়া-পূর্ণ)"; else bad "SSR: aria-controls ×$AC (প্রত্যাশা ২)"; fi
GI=$(printf '%s' "$SS" | grep -o 'id="sfs314-glab-' | wc -l | tr -d ' ')
if [ "$GI" = "2" ]; then ok "SSR: glabel-id ×২ (ক্লোন-হাফে-শূন্য — ডুপ-আইডি-নেই)"; else bad "SSR: glabel-id ×$GI (প্রত্যাশা ২)"; fi
WI=$(printf '%s' "$SS" | grep -o 'id="sfs314-grows-' | wc -l | tr -d ' ')
if [ "$WI" = "2" ]; then ok "SSR: grows-id ×২"; else bad "SSR: grows-id ×$WI (প্রত্যাশা ২)"; fi
AL=$(printf '%s' "$SS" | grep -o 'aria-labelledby="sfs314-glab-' | wc -l | tr -d ' ')
if [ "$AL" = "2" ]; then ok "SSR: aria-labelledby ×২ (দ্বি-দিক-জোড়া)"; else bad "SSR: aria-labelledby ×$AL (প্রত্যাশা ২)"; fi
GT=$(printf '%s' "$SS" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (২-জোড়া + ২-ক্লোন — s313-রেন্ডার-অটুট)"; else bad "SSR: glabel-মোট ×$GT (প্রত্যাশা ৪)"; fi
echo "$SS" | grep -q "__sfs314QA" && ok "SSR: keynav-ইঞ্জিন-স্ক্রিপ্ট" || bad "SSR: ইঞ্জিন-স্ক্রিপ্ট-অনুপস্থিত"
echo "$SS" | grep -q "popFirst: false" && ok "SSR: popFirst=false (ডিফল্ট-ক্রম-অটুট)" || bad "SSR: popFirst-অমিল"
echo "$SS" | grep -q 'labels: \["সর্বশেষ লেখা","জনপ্রিয় আলোচনা"\]' && ok "SSR: labels-ডিফল্ট-ক্রম (s313-অটুট)" || bad "SSR: labels-ক্রম-অমিল"

echo "── ধাপ-৩: keynav-ই২ই (roving-হাইলাইট + গেট + চুক্তি) ──"
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
HJ=$(ev "JSON.stringify(window.__sfs314QA||{})")
HJJ=$(unjj "$HJ")
PR=$(jf pairs "$HJJ"); IO=$(jf io "$HJJ"); ER=$(jf err "$HJJ")
if [ "$PR" = "2" ]; then ok "ই২ই: __sfs314QA.pairs=২ (জোড়া-আবিষ্কার)"; else bad "ই২ই: pairs=$PR"; fi
if [ "$IO" = "1" ]; then ok "ই২ই: IO-গেট-নিবন্ধিত"; else bad "ই২ই: io=$IO"; fi
if [ "$ER" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: ত্রুটি: $ER"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v1'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
D1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');return {pv:d.defaultPrevented,cls:g?1:0,attr:p.getAttribute('data-sfs314-focus'),lb:g?g.textContent.trim():''}})())")
D1J=$(unjj "$D1")
PV=$(jf pv "$D1J"); CL=$(jf cls "$D1J"); AT=$(jf attr "$D1J"); LB=$(jf lb "$D1J")
if [ "$PV" = "true" ]; then ok "ই২ই: ArrowDown-ইন্টারসেপ্ট (preventDefault)"; else bad "ই২ই: prevented=$PV"; fi
if [ "$CL" = "1" ] && [ "$AT" = "real-latest" ] && [ "$LB" = "সর্বশেষ লেখা" ]; then ok "ই২ই: প্রথম-গ্রুপ-হাইলাইট (real-latest)"; else bad "ই২ই: cls=$CL attr=$AT lb=$LB"; fi
D2=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');return {lb:g?g.textContent.trim():'',at:p.getAttribute('data-sfs314-focus')}})())")
D2J=$(unjj "$D2")
if [ "$(jf lb "$D2J")" = "জনপ্রিয় আলোচনা" ] && [ "$(jf at "$D2J")" = "real-popular" ]; then ok "ই২ই: ওয়ার্প-চক্র (০→১ — দ্বিতীয়-গ্রুপ)"; else bad "ই২ই: ওয়ার্প=$(jf at "$D2J")"; fi
D3=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true});p.dispatchEvent(d);var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');return {lb:g?g.textContent.trim():''}})())")
if [ "$(jf lb "$(unjj "$D3")")" = "সর্বশেষ লেখা" ]; then ok "ই২ই: ArrowUp-পশ্চাদমুখী (১→০)"; else bad "ই২ই: ArrowUp-অমিল"; fi
E1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});p.dispatchEvent(d);return {cls:document.querySelectorAll('.sfs292-glabel.sfs314-gfocus').length,at:p.getAttribute('data-sfs314-focus')}})())")
E1J=$(unjj "$E1")
if [ "$(jf cls "$E1J")" = "0" ] && [ "$(jf at "$E1J")" = "None" ]; then ok "ই২ই: Escape-বিলোপ (cls=০ + attr-বিলোপ)"; else bad "ই২ই: Escape=$(jf at "$E1J")"; fi
N1=$(ev "JSON.stringify({k:window.__sfs314QA.keys})"); N1V=$(jf k "$(unjj "$N1")")
EN=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});p.dispatchEvent(d);return {pv:d.defaultPrevented,k:window.__sfs314QA.keys}})())")
ENJ=$(unjj "$EN")
if [ "$(jf pv "$ENJ")" = "false" ] && [ "$(jf k "$ENJ")" = "$N1V" ]; then ok "ই২ই: Enter-অস্পৃশ্য (নেটিভ-নেভিগেশন — s306-চুক্তি)"; else bad "ই২ই: Enter pv=$(jf pv "$ENJ") keys=$(jf k "$ENJ")/[$N1V]"; fi
ev "window.scrollTo(0,0);'o1'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
O1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return {pv:d.defaultPrevented,k:window.__sfs314QA.keys,cls:document.querySelectorAll('.sfs292-glabel.sfs314-gfocus').length}})())")
O1J=$(unjj "$O1")
if [ "$(jf pv "$O1J")" = "false" ] && [ "$(jf k "$O1J")" = "$N1V" ]; then ok "ই২ই: অফস্ক্রিন-গেট (ভিউপোর্ট-বহির্ভূতে নেটিভ-স্ক্রল)"; else bad "ই২ই: গেট pv=$(jf pv "$O1J")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v2'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C1=$(ev "JSON.stringify((function(){var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');if(!g)return{cls:0};var s=getComputedStyle(g);return {cls:1,bgA:s.backgroundColor.split('/').pop()||'',inset:s.boxShadow.indexOf('inset')!==-1?1:0,pause:getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState}})())")
C1J=$(unjj "$C1")
if [ "$(jf cls "$C1J")" = "1" ]; then ok "ই২ই: হাইলাইট-পুনঃপ্রয়োগ (গেট-পুনঃপ্রবেশ)"; else bad "ই২ই: পুনঃপ্রয়োগ-ব্যর্থ"; fi
BGA=$(jf bgA "$C1J")
if echo "$BGA" | grep -q "0.14"; then ok "ই২ই: brand-টিন্ট রেন্ডার (alpha 0.14 — color-mix)"; else bad "ই২ই: bg-alpha=$BGA"; fi
if [ "$(jf inset "$C1J")" = "1" ]; then ok "ই২ই: inset-রিং রেন্ডার (38%)"; else bad "ই২ই: রিং-অনুপস্থিত"; fi
if [ "$(jf pause "$C1J")" = "paused" ]; then ok "ই২ই: মার্কি-বিরতি (data-sfs314-focus-গেট)"; else bad "ই২ই: মার্কি=$(jf pause "$C1J")"; fi
if agent-browser screenshot "$SH_DESK" >/dev/null 2>&1; then ok "স্ক্রিনশট: keynav-হাইলাইট (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
TJ=$(ev "JSON.stringify({w:(window.__sfs312QA||{}).wired, e313:((window.__sfs313QA||{}).err), e307:((window.__sfs307QA||{}).err)})")
TJJ=$(unjj "$TJ")
if [ "$(jf w "$TJJ")" = "16" ]; then ok "ই২ই: sfs312-রিগ্রেশন-পিক wired=16 (পুরাতন-ইঞ্জিন-অটুট)"; else bad "ই২ই: wired=$(jf w "$TJJ")"; fi
if [ "$(jf e313 "$TJJ")" = "" ] && [ "$(jf e307 "$TJJ")" = "" ]; then ok "ই২ই: sfs313/sfs307-ত্রুটি-শূন্য (অটুট)"; else bad "ই২ই: পুরাতন-ইঞ্জিন-ত্রুটি"; fi

echo "── ধাপ-৪: মোবাইল-390 (hScroll-শূন্য + ইঞ্জিন-অটুট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth, pr:(window.__sfs314QA||{}).pairs})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে জোড়া-আবিষ্কার ×২ (রেসপনসিভ-অটুট)"; else bad "মোবাইল pairs=$(jf pr "$MJ")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "মোবাইল-স্ক্রিনশট সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৫: s314-cacheflush-ইউনিট (সার্ভার-বন্ধ — দ্বি-প্রসেস-লেখা-নিষিদ্ধ) ──"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
U=$(cd "$APP" && node -e "
const d = require('./db.js');
(async () => {
  await d.initDb();
  const s1 = await d.getSettingsAll();
  const st1 = d.settingsCacheState();
  const s2 = await d.getSettingsAll();
  const sameRef = (s1 === s2);
  d.setSetting('__s314qa_probe', '1');
  const st2 = d.settingsCacheState();
  const s3 = await d.getSettingsAll();
  const st3 = d.settingsCacheState();
  const freshRef = (s3 !== s2);
  const probeRead = await d.getSetting('__s314qa_probe');
  d.invalidateSettingsCache();
  const st4 = d.settingsCacheState();
  try { d.prepare(\"DELETE FROM settings WHERE key = '__s314qa_probe'\").run(); } catch (e) {}
  d.saveDb();
  console.log(JSON.stringify({ st1: st1, sameRef: sameRef, st2: st2, st3: st3, freshRef: freshRef, probeRead: probeRead, st4: st4 }));
  process.exit(0);
})().catch(e => { console.log('UNIT-ERR: ' + (e && e.message)); process.exit(1); });
") || U=""
UJ=$(printf '%s' "$U" | tail -1)
if echo "$UJ" | grep -q "UNIT-ERR"; then bad "ইউনিট-ব্যর্থ: $UJ"; else
  TT=$(printf '%s' "$UJ" | python3 -c "import sys,json;print(json.load(sys.stdin)['st1']['ttlMs'])" 2>/dev/null)
  if [ "$TT" = "10000" ]; then ok "ইউনিট: ttlMs=১০০০০ (বাউন্ড-সত্য)"; else bad "ইউনিট: ttlMs=$TT"; fi
  if [ "$(jf sameRef "$UJ")" = "true" ]; then ok "ইউনিট: TTL-হিট সম-রেফ (হট-পাথ-কোয়েরি-মুক্ত — সাশ্রয়-প্রমাণ)"; else bad "ইউনিট: sameRef=$(jf sameRef "$UJ")"; fi
  SC2=$(printf '%s' "$UJ" | python3 -c "import sys,json;print(json.load(sys.stdin)['st2']['cached'])" 2>/dev/null)
  if [ "$SC2" = "False" ]; then ok "ইউনিট: setSetting → তাৎক্ষণিক-ইনভ্যালিডেশন (cached=false)"; else bad "ইউনিট: setSetting-পরবর্তী cached=$SC2"; fi
  if [ "$(jf freshRef "$UJ")" = "true" ]; then ok "ইউনিট: ইনভ্যালিডেশন-পরবর্তী ফ্রেশ-রি-কোয়েরি (নতুন-অবজেক্ট)"; else bad "ইউনিট: freshRef=$(jf freshRef "$UJ")"; fi
  if [ "$(jf probeRead "$UJ")" = "1" ]; then ok "ইউনিট: getSetting-সরাসরি-পাঠ ('1' — ক্যাশ-বহির্ভূত-সত্য)"; else bad "ইউনিট: probeRead=$(jf probeRead "$UJ")"; fi
  ST4=$(printf '%s' "$UJ" | python3 -c "import sys,json;print(json.load(sys.stdin)['st4']['cached'])" 2>/dev/null)
  if [ "$ST4" = "False" ]; then ok "ইউনিট: পাবলিক invalidateSettingsCache() কার্যকর"; else bad "ইউনিট: st4.cached=$ST4"; fi
  A1=$(printf '%s' "$UJ" | python3 -c "import sys,json;print(json.load(sys.stdin)['st1']['cached'])" 2>/dev/null)
  A3=$(printf '%s' "$UJ" | python3 -c "import sys,json;print(json.load(sys.stdin)['st3']['ageMs'] < 3000)" 2>/dev/null)
  if [ "$A1" = "True" ] && [ "$A3" = "True" ]; then ok "ইউনিট: ক্যাশ-জীবনকাল-রূপরেখা (হিট→সতেজ→হিট)"; else bad "ইউনিট: জীবনকাল st1=$A1 st3-fresh=$A3"; fi
fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "ইউনিট-পরবর্তী সার্ভার-বুট" || bad "ইউনিট-পরবর্তী বুট-ব্যর্থ"
PC=$(curl -s "$BASE/" | grep -c "__s314qa_probe" || true)
if [ "$PC" = "0" ]; then ok "প্রোব-কী-ক্লিনআপ-প্রমাণ (SSR-শূন্য)"; else bad "প্রোব-কী-অবশিষ্ট (SSR ×$PC)"; fi

echo "── ধাপ-৬: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
bopen "$BASE/" || bad "হোম-পুনঃopen-ব্যর্থ"
agent-browser wait 1800 >/dev/null 2>&1
E=$(agent-browser errors 2>/dev/null | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "কনসোল-ত্রুটি: $E"; fi
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s314-suite ✓ সর্ব-সবুজ"; else echo "s314-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
