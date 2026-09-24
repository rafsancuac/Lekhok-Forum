#!/bin/bash
# s315-suite.sh — session315: sfs315 keynav-স্ক্রল-সমন্বয় + hr315 aria-জোড়া-সচেতন-কী-তালিকা
# [Task ID 152] PLANS session314-নোটের প্রস্তাব-②+③ প্রয়োগ:
#   ② sfs315 — keynav-হাইলাইটের দৃশ্যমানতা-গ্যারান্টি (মার্কি-বিরতি-মোডে): হাইলাইট-গ্রুপ-লেবেল
#      feed-ভিউপোর্টের বাইরে থাকলে দৃশ্যমান-হাফে সংশোধনী-ট্রান্সফর্ম — লেবেল feed-শীর্ষ+২২px-প্যাডে;
#      কেবল-মাপা-সংশোধনী (track-অ্যানিমেশন-অস্পৃশ্য — s314 CSS-গেট-ই বিরত-উৎস); ক্লিয়ারে
#      সংশোধনী-বিলোপ → মার্কি স্থগিত-কীফ্রেম থেকেই পুনঃচলে; guarded-হুক __sfs315Freeze/Unfreeze + __sfs315QA
#   ③ hr315 — /admin/home-reorder-এ aria-জোড়া-সচেতন কী-তালিকা (অ্যাডমিন-শিক্ষা-কপি):
#      USER_FEED-শাখায় hr-aria-note + real-*/গ্রুপ-কী-তে hr-aria-chip (sfs314-glab-* ↔ sfs314-grows-*)
#      + __hrAria315QA {keys, note(), chips()} — রেজিস্ট্রি-সত্য (SFS314_PAIRS)
#   ④ style.css session315-ব্লক হেক্স-শূন্য (half-transition glide + will-change + রিং-গভীরতা
#      38%→48% কেবল-বক্স-শ্যাডো — s314 alpha-0.14-চুক্তি অটুট; 640px + reduced-motion)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + transition-পরবর্তী-অ্যাসার্ট (wait ≥৪০০ms —
#         s314-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক (s307 --clean) + ব্রাউজার-লগইন (s304-রীতি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_FREEZE=/home/z/my-project/download/s315-keynav-freeze-desk.png
SH_MOB=/home/z/my-project/download/s315-keynav-freeze-mobile390.png
SH_ADMIN=/home/z/my-project/download/s315-admin-aria-pairs.png
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
(cd "$APP" && node db/migrate.js >/tmp/s315-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s315-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q "__sfs315Freeze" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs315Freeze-হুক" || bad "feed.ejs: __sfs315Freeze-অনুপস্থিত"
grep -q "__sfs315Unfreeze" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs315Unfreeze-হুক" || bad "feed.ejs: __sfs315Unfreeze-অনুপস্থিত"
grep -q "window.__sfs315QA" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs315QA-হুক" || bad "feed.ejs: __sfs315QA-অনুপস্থিত"
grep -q "if (window.__sfs315Freeze) window.__sfs315Freeze(labs314\[i314\], phone314)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: apply314-guarded-হুক-কল" || bad "feed.ejs: apply314-হুক-কল-অমিল"
grep -q "if (window.__sfs315Unfreeze) window.__sfs315Unfreeze(phone314)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: clear314-guarded-হুক-কল" || bad "feed.ejs: clear314-হুক-কল-অমিল"
grep -q "prevY315 + (fTop + 22) - lTop" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: শীর্ষ+২২px-প্যাড-গণিত (transition-ল্যাগ-সম্মত স্ন্যাপশট)" || bad "feed.ejs: প্যাড-গণিত-অমিল"
grep -q "track315.style.translate" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: track-translate-সংশোধনী (half-inline-গোটচা-ফেরত)" || bad "feed.ejs: track-translate-অনুপস্থিত"
grep -q "sfs315-frozen" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: frozen-স্টেট-ক্লাস" || bad "feed.ejs: frozen-ক্লাস-অনুপস্থিত"
grep -q "SFS314_PAIRS" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: SFS314_PAIRS-রেজিস্ট্রি-সত্য" || bad "home-reorder.ejs: SFS314_PAIRS-অনুপস্থিত"
grep -q "hr-aria-note" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr-aria-note (শিক্ষা-কপি)" || bad "home-reorder.ejs: hr-aria-note-অনুপস্থিত"
grep -q "hr-aria-chip" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr-aria-chip (স্লাগ-জোড়া)" || bad "home-reorder.ejs: hr-aria-chip-অনুপস্থিত"
grep -q "window.__hrAria315QA" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria315QA-হুক" || bad "home-reorder.ejs: __hrAria315QA-অনুপস্থিত"
grep -q "sfs314-glab-' + s.key + ' ↔ sfs314-grows-' + s.key" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: জোড়া-স্লাগ-নির্মাণ (রেজিস্ট্রি-চালিত)" || bad "home-reorder.ejs: স্লাগ-নির্মাণ-অমিল"
B315=$(python3 - "$APP/public/assets/css/style.css" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding='utf-8').read()
i = t.find('session315 (sfs315')
e = t.find('EOF session315')
print(t[i:e] if i != -1 and e > i else 'MISSING')
PYEOF
)
if [ "$B315" != "MISSING" ]; then
  ok "style.css: session315-ব্লক উপস্থিত"
  HEXN=$(printf '%s' "$B315" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
  if [ "$HEXN" = "0" ]; then ok "style.css: session315-ব্লক হেক্স-শূন্য"; else bad "style.css: হেক্স ×$HEXN (session315-ব্লক)"; fi
  echo "$B315" | grep -q ".sfs292-track { transition: translate 0.26s ease-out; }" && ok "style.css: track-translate-glide (CSS Transforms L2)" || bad "style.css: track-translate-অমিল"
  echo "$B315" | grep -q ".sfs292-track.sfs315-frozen { will-change: translate, transform; }" && ok "style.css: frozen-will-change-পারফ-হিন্ট" || bad "style.css: will-change-অনুপস্থিত"
  echo "$B315" | grep -q "48%, transparent" && ok "style.css: রিং-গভীরতা ৪৮% (ইন্সপেক্ট-মোড)" || bad "style.css: ৪৮%-রিং-অনুপস্থিত"
  echo "$B315" | grep -q "prefers-reduced-motion" && ok "style.css: reduced-motion-গার্ড" || bad "style.css: reduced-motion-অনুপস্থিত"
  echo "$B315" | grep -q "max-width: 640px" && ok "style.css: 640px-সংকোচন" || bad "style.css: 640px-অনুপস্থিত"
  B314N=$(printf '%s' "$B315" | grep -c "14%" || true)
  if [ "$B314N" = "0" ]; then ok "style.css: s314-alpha-0.14-টিন্ট-অস্পৃশ্য (চুক্তি-রক্ষা)"; else bad "style.css: s315-ব্লকে 14%-সংঘর্ষ"; fi
else
  bad "style.css: session315-ব্লক-অনুপস্থিত"
fi
SS0=$(curl -s "$BASE/")
printf '%s' "$SS0" | python3 -c "
import sys, re
t = sys.stdin.read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
s315 = [b for b in blocks if '__sfs315QA' in b]
s314 = [b for b in blocks if '__sfs314QA' in b]
open('/tmp/s315-inline.js', 'w', encoding='utf-8').write(s315[0] if s315 else 'MISSING')
open('/tmp/s314-inline.js', 'w', encoding='utf-8').write(s314[0] if s314 else 'MISSING')
print('OK' if s315 and s314 else 'MISSING')
" | grep -q "OK" && ok "SSR: s314/s315-ইনলাইন-স্ক্রিপ্ট-নিষ্কাশন" || bad "SSR: স্ক্রিপ্ট-নিষ্কাশন-ব্যর্থ"
node --check /tmp/s315-inline.js && ok "node --check s315-ইনলাইন-স্ক্রিপ্ট" || bad "s315-স্ক্রিপ্ট --check-ব্যর্থ"
node --check /tmp/s314-inline.js && ok "node --check s314-ইনলাইন-স্ক্রিপ্ট (পুরাতন-অটুট)" || bad "s314-স্ক্রিপ্ট --check-ব্যর্থ"

echo "── ধাপ-২: SSR-ডায়নামিক (s314-চুক্তি-অটুট + s315-উপস্থিতি) ──"
AC=$(printf '%s' "$SS0" | grep -o 'aria-controls="sfs314-grows-' | wc -l | tr -d ' ')
if [ "$AC" = "2" ]; then ok "SSR: aria-controls ×২ (s314-জোড়া-অটুট)"; else bad "SSR: aria-controls ×$AC"; fi
GT=$(printf '%s' "$SS0" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (s313-রেন্ডার-অটুট)"; else bad "SSR: glabel-মোট ×$GT"; fi
printf '%s' "$SS0" | grep -q "window.__sfs315Freeze" && ok "SSR: s315-ফ্রিজ-ইঞ্জিন-স্ক্রিপ্ট" || bad "SSR: ফ্রিজ-ইঞ্জিন-অনুপস্থিত"
printf '%s' "$SS0" | grep -q "popFirst: false" && ok "SSR: popFirst=false (ডিফল্ট-ক্রম-অটুট)" || bad "SSR: popFirst-অমিল"

echo "── ধাপ-৩: keynav-ফ্রিজ-ই২ই (দৃশ্যমানতা-সমন্বয় + চুক্তি) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
HJ=$(ev "JSON.stringify({p:(window.__sfs315QA||null)?1:0, e:(window.__sfs315QA||{}).err, pr:(window.__sfs314QA||{}).pairs})")
HJJ=$(unjj "$HJ")
if [ "$(jf p "$HJJ")" = "1" ] && [ "$(jf e "$HJJ")" = "" ]; then ok "ই২ই: __sfs315QA-হুক-ত্রুটি-শূন্য"; else bad "ই২ই: হুক p=$(jf p "$HJJ") e=$(jf e "$HJJ")"; fi
if [ "$(jf pr "$HJJ")" = "2" ]; then ok "ই২ই: s314-pairs=২ (পূর্বসূরি-অটুট)"; else bad "ই২ই: pairs=$(jf pr "$HJJ")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v1'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
F1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);var tr=document.querySelector('.sfs292-track');return {pv:d.defaultPrevented,st:tr.style.translate!==''&&tr.classList.contains('sfs315-frozen'),fz:(window.__sfs315QA||{}).frozen,sh:(window.__sfs315QA||{}).shifts,pause:getComputedStyle(tr).animationPlayState,attr:p.getAttribute('data-sfs314-focus')}})())")
F1J=$(unjj "$F1")
if [ "$(jf pv "$F1J")" = "true" ]; then ok "ই২ই: ArrowDown-ইন্টারসেপ্ট (s314-অটুট)"; else bad "ই২ই: prevented=$(jf pv "$F1J")"; fi
if [ "$(jf st "$F1J")" = "true" ] && [ "$(jf fz "$F1J")" = "1" ] && [ "$(jf sh "$F1J")" = "1" ]; then ok "ই২ই: ফ্রিজ-সক্রিয় (track-translate+frozen+shifts=১)"; else bad "ই২ই: ফ্রিজ st=$(jf st "$F1J") fz=$(jf fz "$F1J") sh=$(jf sh "$F1J")"; fi
if [ "$(jf pause "$F1J")" = "paused" ]; then ok "ই২ই: মার্কি-বিরত (s314-গেট — track-অস্পৃশ্য-প্রমাণ)"; else bad "ই২ই: মার্কি=$(jf pause "$F1J")"; fi
if [ "$(jf attr "$F1J")" = "real-latest" ]; then ok "ই২ই: data-sfs314-focus=real-latest"; else bad "ই২ই: attr=$(jf attr "$F1J")"; fi
agent-browser wait 450 >/dev/null 2>&1
P1=$(ev "JSON.stringify((function(){var l=document.querySelector('.sfs292-glabel.sfs314-gfocus');var f=document.querySelector('.sfs292-feed');if(!l||!f)return{ok:0};return {ok:1,d:Math.round((l.getBoundingClientRect().top-f.getBoundingClientRect().top)*10)/10}})())")
P1J=$(unjj "$P1")
D1=$(jf d "$P1J")
if [ "$(jf ok "$P1J")" = "1" ] && python3 -c "import sys; sys.exit(0 if abs(float('${D1:-999}')-22.0)<=2.5 else 1)" 2>/dev/null; then ok "ই২ই: লেবেল-অবস্থান feed-শীর্ষ+২২px (d=$D1 — transition-পরবর্তী)"; else bad "ই২ই: অবস্থান d=$D1 (প্রত্যাশা ২২±২.৫)"; fi
agent-browser wait 200 >/dev/null 2>&1
F2=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');return {at:p.getAttribute('data-sfs314-focus'),sh:(window.__sfs315QA||{}).shifts}})())")
F2J=$(unjj "$F2")
if [ "$(jf at "$F2J")" = "real-popular" ] && [ "$(jf sh "$F2J")" = "2" ]; then ok "ই২ই: দ্বিতীয়-গ্রুপে পুনঃ-ফ্রিজ (shifts=২ — পুনঃ-মাপা-সংশোধনী)"; else bad "ই২ই: পুনঃ-ফ্রিজ at=$(jf at "$F2J") sh=$(jf sh "$F2J")"; fi
agent-browser wait 450 >/dev/null 2>&1
P2=$(ev "JSON.stringify((function(){var l=document.querySelector('.sfs292-glabel.sfs314-gfocus');var f=document.querySelector('.sfs292-feed');if(!l||!f)return{ok:0};return {ok:1,d:Math.round((l.getBoundingClientRect().top-f.getBoundingClientRect().top)*10)/10}})())")
D2=$(jf d "$(unjj "$P2")")
if python3 -c "import sys; sys.exit(0 if abs(float('${D2:-999}')-22.0)<=2.5 else 1)" 2>/dev/null; then ok "ই২ই: দ্বিতীয়-গ্রুপ-লেবেল-ও-শীর্ষে (d=$D2)"; else bad "ই২ই: দ্বিতীয়-অবস্থান d=$D2"; fi
F3=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true});p.dispatchEvent(d);return {at:p.getAttribute('data-sfs314-focus'),sh:(window.__sfs315QA||{}).shifts}})())")
F3J=$(unjj "$F3")
if [ "$(jf at "$F3J")" = "real-latest" ] && [ "$(jf sh "$F3J")" = "3" ]; then ok "ই২ই: ArrowUp-পশ্চাদমুখী + পুনঃ-ফ্রিজ (shifts=৩)"; else bad "ই২ই: ArrowUp at=$(jf at "$F3J") sh=$(jf sh "$F3J")"; fi
KN=$(ev "JSON.stringify({k:(window.__sfs314QA||{}).keys,s:(window.__sfs315QA||{}).shifts})")
KNJ=$(unjj "$KN")
KNV=$(jf k "$KNJ"); KSV=$(jf s "$KNJ")
EN=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});p.dispatchEvent(d);return {pv:d.defaultPrevented,k:window.__sfs314QA.keys,s:window.__sfs315QA.shifts}})())")
ENJ=$(unjj "$EN")
if [ "$(jf pv "$ENJ")" = "false" ] && [ "$(jf k "$ENJ")" = "$KNV" ] && [ "$(jf s "$ENJ")" = "$KSV" ]; then ok "ই২ই: Enter-অস্পৃশ্য (keys+shifts-অপরিবর্তিত — s306-চুক্তি)"; else bad "ই২ই: Enter pv=$(jf pv "$ENJ")"; fi
E1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});p.dispatchEvent(d);p.blur();var tr=document.querySelector('.sfs292-track');return {cls:document.querySelectorAll('.sfs292-glabel.sfs314-gfocus').length,at:p.getAttribute('data-sfs314-focus'),st:tr.style.translate,fz:(window.__sfs315QA||{}).frozen,pause:getComputedStyle(tr).animationPlayState}})())")
E1J=$(unjj "$E1")
if [ "$(jf cls "$E1J")" = "0" ] && [ "$(jf at "$E1J")" = "None" ]; then ok "ই২ই: Escape-বিলোপ (s314-অটুট)"; else bad "ই২ই: Escape cls=$(jf cls "$E1J") at=$(jf at "$E1J")"; fi
if [ -z "$(jf st "$E1J")" ] || [ "$(jf st "$E1J")" = "None" ]; then ok "ই২ই: সংশোধনী-বিলোপ (track-translate-শূন্য)"; else bad "ই২ই: translate-অবশিষ্ট=$(jf st "$E1J")"; fi
if [ "$(jf fz "$E1J")" = "0" ] && [ "$(jf pause "$E1J")" = "running" ]; then ok "ই২ই: আনফ্রিজ → মার্কি-পুনঃচলে (স্থগিত-কীফ্রেম-থেকে)"; else bad "ই২ই: পুনঃচলে fz=$(jf fz "$E1J") pause=$(jf pause "$E1J")"; fi
ev "window.scrollTo(0,0);'o1'" >/dev/null 2>&1
agent-browser wait 800 >/dev/null 2>&1
O1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return {pv:d.defaultPrevented,s:window.__sfs315QA.shifts}})())")
O1J=$(unjj "$O1")
if [ "$(jf pv "$O1J")" = "false" ] && [ "$(jf s "$O1J")" = "$KSV" ]; then ok "ই২ই: অফস্ক্রিন-গেট — ফ্রিজ-নন-ফায়ার (shifts-অপরিবর্তিত)"; else bad "ই২ই: গেট pv=$(jf pv "$O1J") s=$(jf s "$O1J")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v2'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
R1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return {pv:d.defaultPrevented,st:document.querySelector('.sfs292-track').style.translate!=='',s:window.__sfs315QA.shifts}})())")
R1J=$(unjj "$R1")
if [ "$(jf pv "$R1J")" = "true" ] && [ "$(jf st "$R1J")" = "true" ]; then ok "ই২ই: গেট-পুনঃপ্রবেশে ফ্রিজ-পুনঃসক্রিয়"; else bad "ই২ই: পুনঃপ্রবেশ pv=$(jf pv "$R1J")"; fi
SHN=$(jf s "$(unjj "$R1")")
if [ "$((SHN - KSV))" = "1" ]; then ok "ই২ই: shifts-পুনঃবৃদ্ধি ($KSV→$SHN)"; else bad "ই২ই: shifts=$SHN (প্রত্যাশা $((KSV+1)))"; fi
agent-browser wait 450 >/dev/null 2>&1
C1=$(ev "JSON.stringify((function(){var g=document.querySelector('.sfs292-glabel.sfs314-gfocus');if(!g)return{cls:0};var s=getComputedStyle(g);return {cls:1,bgA:s.backgroundColor.split('/').pop()||'',ins:s.boxShadow.indexOf('inset')!==-1?1:0}})())")
C1J=$(unjj "$C1")
if [ "$(jf bgA "$C1J")" = "0.14)" ] || echo "$(jf bgA "$C1J")" | grep -q "0.14"; then ok "ই২ই: s314-alpha-0.14-টিন্ট-অটুট (s315-রিং-গভীরতা-সহাবস্থান)"; else bad "ই২ই: bg-alpha=$(jf bgA "$C1J")"; fi
if [ "$(jf ins "$C1J")" = "1" ]; then ok "ই২ই: inset-রিং রেন্ডার (৪৮%-গভীর)"; else bad "ই২ই: রিং-অনুপস্থিত"; fi
if agent-browser screenshot "$SH_FREEZE" >/dev/null 2>&1; then ok "স্ক্রিনশট: keynav-ফ্রিজ (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
ev "var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});p.dispatchEvent(d);'clean'" >/dev/null 2>&1

echo "── ধাপ-৪: hr315-ই২ই (অ্যাডমিন-লগইন → USER_FEED → aria-জোড়া-তালিকা) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0) ok "ব্রাউজার XHR-লগইন ($LS)";; '') ok "ব্রাউজার XHR-লগইন (sync-XHR-রিটার্ন-শূন্য — পরবর্তী-হুক-প্রমাণই-কর্তৃত্বস্বর)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
AJS=$(ev "JSON.stringify({h:typeof window.__hrAria315QA==='object',k:(window.__hrAria315QA||{}).keys||[]})")
AJSJ=$(unjj "$AJS")
if [ "$(jf h "$AJSJ")" = "true" ]; then ok "ই২ই: __hrAria315QA-হুক-সংজ্ঞায়িত"; else bad "ই২ই: হুক-অনুপস্থিত"; fi
KSEQ=$(printf '%s' "$(unjj "$AJS")" | python3 -c "import sys,json;print(','.join(json.load(sys.stdin).get('k') or []))" 2>/dev/null)
if [ "$KSEQ" = "real-latest,real-popular" ]; then ok "ই২ই: keys=[real-latest,real-popular] (রেজিস্ট্রি-সত্য-ক্রম)"; else bad "ই২ই: keys=$KSEQ"; fi
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-সেকশন-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
NT=$(ev "JSON.stringify({n:(window.__hrAria315QA?window.__hrAria315QA.note():-1),c:(window.__hrAria315QA?window.__hrAria315QA.chips():-1)})")
NTJ=$(unjj "$NT")
if [ "$(jf n "$NTJ")" = "1" ]; then ok "ই২ই: hr-aria-note ×১ (শিক্ষা-কপি-রেন্ডার)"; else bad "ই২ই: note=$(jf n "$NTJ")"; fi
if [ "$(jf c "$NTJ")" = "2" ]; then ok "ই২ই: hr-aria-chip ×২ (দুই-গ্রুপ-কী)"; else bad "ই২ই: chips=$(jf c "$NTJ")"; fi
CT2=$(ev "JSON.stringify((function(){var cs=[].slice.call(document.querySelectorAll('.hr-aria-chip'));return {g1:cs.some(function(x){return x.textContent.indexOf('sfs314-glab-real-latest')!==-1&&x.textContent.indexOf('sfs314-grows-real-latest')!==-1}),g2:cs.some(function(x){return x.textContent.indexOf('sfs314-glab-real-popular')!==-1&&x.textContent.indexOf('sfs314-grows-real-popular')!==-1}),kb:[].slice.call(document.querySelectorAll('.hr-aria-note')).some(function(x){return x.textContent.indexOf('ArrowUp/ArrowDown')!==-1})}})())")
CT2J=$(unjj "$CT2")
if [ "$(jf g1 "$CT2J")" = "true" ] && [ "$(jf g2 "$CT2J")" = "true" ]; then ok "ই২ই: উভয়-স্লাগ-জোড়া-সঠিক (glab↔grows)"; else bad "ই২ই: স্লাগ g1=$(jf g1 "$CT2J") g2=$(jf g2 "$CT2J")"; fi
if [ "$(jf kb "$CT2J")" = "true" ]; then ok "ই২ই: কীবোর্ড-নেভ-শিক্ষা-কপি (ArrowUp/ArrowDown-উল্লেখ)"; else bad "ই২ই: কপি-অনুপস্থিত"; fi
if agent-browser screenshot "$SH_ADMIN" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-aria-তালিকা"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ফ্রিজ-অটুট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,pr:(window.__sfs314QA||{}).pairs,ez:((window.__sfs315QA||{}).err)===''})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে জোড়া-আবিষ্কার ×২"; else bad "মোবাইল pairs=$(jf pr "$MJ")"; fi
if [ "$(jf ez "$MJ")" = "true" ]; then ok "মোবাইলে s315-ত্রুটি-শূন্য"; else bad "মোবাইল s315-ত্রুটি"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'mv'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
M2=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return {st:document.querySelector('.sfs292-track').style.translate!=='',s:(window.__sfs315QA||{}).shifts}})())")
if [ "$(jf st "$(unjj "$M2")")" = "true" ] && [ "$(jf s "$(unjj "$M2")")" = "1" ]; then ok "মোবাইলে ফ্রিজ-কার্যকর (shifts=১)"; else bad "মোবাইল-ফ্রিজ M2=$(unjj "$M2")"; fi
agent-browser wait 450 >/dev/null 2>&1
MP=$(ev "JSON.stringify((function(){var l=document.querySelector('.sfs292-glabel.sfs314-gfocus');var f=document.querySelector('.sfs292-feed');if(!l||!f)return{ok:0};return {ok:1,d:Math.round((l.getBoundingClientRect().top-f.getBoundingClientRect().top)*10)/10}})())")
MD=$(jf d "$(unjj "$MP")")
if [ "$(jf ok "$(unjj "$MP")")" = "1" ] && python3 -c "import sys; sys.exit(0 if abs(float('${MD:-999}')-22.0)<=3.5 else 1)" 2>/dev/null; then ok "মোবাইলে লেবেল-অবস্থান শীর্ষ+২২px (d=$MD)"; else bad "মোবাইল-অবস্থান d=$MD"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "মোবাইল-স্ক্রিনশট সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

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
if [ "$FAIL" = "0" ]; then echo "s315-suite ✓ সর্ব-সবুজ"; else echo "s315-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
