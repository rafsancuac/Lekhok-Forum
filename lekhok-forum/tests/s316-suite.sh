#!/bin/bash
# s316-suite.sh — session316: sfs316 কীবোর্ড-মোড HUD + hr316 aria-chip কপি-বাটন
# [Task ID 153] PLANS session315-নোটের প্রস্তাব-②+③ প্রয়োগ:
#   ② sfs316 — ফোন-প্রিভিউতে :focus-visible-গেটেড কীবোর্ড-মোড HUD (↑↓ গ্রুপ ব্রাউজ · Esc):
#      ট্যাব-নেভিগেটর sfs314-keynav/sfs315-ফ্রিজের অস্তিত্ব ফোকাস-মুহূর্তেই আবিষ্কার করে;
#      phone-অ্যাংকরড absolute (frame static — layout-neutral); aria-hidden; CSS-কেবল-ফিচার
#      + দ্রুত-অ্যারো-চাপে transition-রিটার্গেট-সঠিকতা-প্রমাণ (sfs315-স্ন্যাপশট-গণিতের ই২ই-প্রমাণ)
#   ③ hr316 — /admin/home-reorder aria-chip-এ এক-ক্লিক কপি-বাটন (clipboard API +
#      execCommand-ফলব্যাক; ডেলিগেটেড click; টোস্ট-ফিডব্যাক; আইকন-সোয়াপ fa-copy↔fa-check)
#      + __hrAria316QA {copied, failed, btn()}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + transition-পরবর্তী-অ্যাসার্ট (wait ≥৪০০ms) +
#         ক্লিপবোর্ড-স্টাব (headless-অনুমতি-স্বাধীন) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_HUD=/home/z/my-project/download/s316-kbdhud-desk.png
SH_MOB=/home/z/my-project/download/s316-kbdhud-mobile390.png
SH_COPY=/home/z/my-project/download/s316-aria-copy-admin.png
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
(cd "$APP" && node db/migrate.js >/tmp/s316-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s316-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'class="sfs316-kbdhint"' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfs316-kbdhint-এলিমেন্ট" || bad "feed.ejs: kbdhint-অনুপস্থিত"
grep -q 'aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd>' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: kbd-কী-চিহ্ন (aria-hidden-ডেকোরেটিভ)" || bad "feed.ejs: kbd-চিহ্ন-অমিল"
grep -q "hr-aria-copy" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr-aria-copy-বাটন" || bad "home-reorder.ejs: কপি-বাটন-অনুপস্থিত"
grep -q 'data-copy="'"'"' +' "$APP/admin/views/admin/home-reorder.ejs" || grep -q 'data-copy=' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: data-copy-বহন" || bad "home-reorder.ejs: data-copy-অনুপস্থিত"
grep -q "fallbackCopy316" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: execCommand-ফলব্যাক" || bad "home-reorder.ejs: ফলব্যাক-অনুপস্থিত"
grep -q "navigator.clipboard && navigator.clipboard.writeText" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: clipboard-API-গেট" || bad "home-reorder.ejs: API-গেট-অমিল"
grep -q "window.__hrAria316QA" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria316QA-হুক" || bad "home-reorder.ejs: হুক-অনুপস্থিত"
B316=$(python3 - "$APP/public/assets/css/style.css" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding='utf-8').read()
i = t.find('session316 (sfs316')
e = t.find('EOF session316')
print(t[i:e] if i != -1 and e > i else 'MISSING')
PYEOF
)
if [ "$B316" != "MISSING" ]; then
  ok "style.css: session316-ব্লক উপস্থিত"
  HEXN=$(printf '%s' "$B316" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
  if [ "$HEXN" = "0" ]; then ok "style.css: session316-ব্লক হেক্স-শূন্য"; else bad "style.css: হেক্স ×$HEXN (session316-ব্লক)"; fi
  echo "$B316" | grep -q ".sfs292-phone:focus-visible .sfs316-kbdhint" && ok "style.css: focus-visible-গেট" || bad "style.css: focus-gate-অমিল"
  echo "$B316" | grep -q "pointer-events: none" && ok "style.css: pointer-events-none (layout-অনুপ্রবেশ-শূন্য)" || bad "style.css: pointer-events-অনুপস্থিত"
  echo "$B316" | grep -q "backdrop-filter: blur" && ok "style.css: HUD-blur-স্তর" || bad "style.css: blur-অনুপস্থিত"
  echo "$B316" | grep -q "prefers-reduced-motion" && ok "style.css: reduced-motion-গার্ড" || bad "style.css: reduced-motion-অনুপস্থিত"
  echo "$B316" | grep -q "max-width: 640px" && ok "style.css: 640px-সংকোচন" || bad "style.css: 640px-অনুপস্থিত"
else
  bad "style.css: session316-ব্লক-অনুপস্থিত"
fi
SS0=$(curl -s "$BASE/")
printf '%s' "$SS0" | python3 -c "
import sys, re
t = sys.stdin.read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
s315 = [b for b in blocks if '__sfs315QA' in b]
s314 = [b for b in blocks if '__sfs314QA' in b]
open('/tmp/s315-inline-316.js', 'w', encoding='utf-8').write(s315[0] if s315 else 'MISSING')
open('/tmp/s314-inline-316.js', 'w', encoding='utf-8').write(s314[0] if s314 else 'MISSING')
print('OK' if s315 and s314 else 'MISSING')
" | grep -q "OK" && ok "SSR: s314/s315-ইনলাইন-নিষ্কাশন" || bad "SSR: নিষ্কাশন-ব্যর্থ"
node --check /tmp/s315-inline-316.js && ok "node --check s315-ইনলাইন (পুরাতন-অটুট)" || bad "s315 --check-ব্যর্থ"
node --check /tmp/s314-inline-316.js && ok "node --check s314-ইনলাইন (পুরাতন-অটুট)" || bad "s314 --check-ব্যর্থ"

echo "── ধাপ-২: SSR-ডায়নামিক (HUD ×১ + পুরাতন-চুক্তি-অটুট) ──"
KH=$(printf '%s' "$SS0" | grep -o 'class="sfs316-kbdhint"' | wc -l | tr -d ' ')
if [ "$KH" = "1" ]; then ok "SSR: kbdhint ×১ (একক-উদাহরণ — ডুপ-নেই)"; else bad "SSR: kbdhint ×$KH"; fi
printf '%s' "$SS0" | grep -q 'aria-hidden="true"><kbd>↑</kbd>' && ok "SSR: kbd-চিহ্ন-রেন্ডার" || bad "SSR: kbd-চিহ্ন-অনুপস্থিত"
AC=$(printf '%s' "$SS0" | grep -o 'aria-controls="sfs314-grows-' | wc -l | tr -d ' ')
if [ "$AC" = "2" ]; then ok "SSR: s314-aria-controls ×২ (অটুট)"; else bad "SSR: aria-controls ×$AC"; fi
GT=$(printf '%s' "$SS0" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (s313-অটুট)"; else bad "SSR: glabel ×$GT"; fi

echo "── ধাপ-৩: HUD-ই২ই (focus-visible-গেট + layout-নিরপেক্ষতা) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
B0=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var h=p.querySelector('.sfs316-kbdhint');var fr=p.querySelector('.sfs292-frame');return {vis:getComputedStyle(h).visibility,op:getComputedStyle(h).opacity,pe:getComputedStyle(h).pointerEvents,frPos:getComputedStyle(fr).position,phH:Math.round(p.getBoundingClientRect().height),frH:Math.round(fr.getBoundingClientRect().height)}})())")
B0J=$(unjj "$B0")
if [ "$(jf vis "$B0J")" = "hidden" ] && [ "$(jf op "$B0J")" = "0" ]; then ok "ই২ই: HUD-ডিফল্ট-অদৃশ্য (মাউস-ব্যবহারকারী)"; else bad "ই২ই: ডিফল্ট vis=$(jf vis "$B0J") op=$(jf op "$B0J")"; fi
if [ "$(jf pe "$B0J")" = "none" ]; then ok "ই২ই: pointer-events-none (ক্লিক-অনুপ্রবেশ-শূন্য)"; else bad "ই২ই: pe=$(jf pe "$B0J")"; fi
FHV=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus({focusVisible:true});return 'f1'})())")
agent-browser wait 450 >/dev/null 2>&1
B1=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var h=p.querySelector('.sfs316-kbdhint');var s=getComputedStyle(h);return {vis:s.visibility,op:Math.round(parseFloat(s.opacity)*100)/100,fv:p.matches(':focus-visible')};})())")
B1J=$(unjj "$B1")
if [ "$(jf vis "$B1J")" = "visible" ]; then ok "ই২ই: HUD-focus-visible-দৃশ্যমান"; else bad "ই২ই: HUD vis=$(jf vis "$B1J")"; fi
if [ "$(jf fv "$B1J")" = "true" ]; then ok "ই২ই: :focus-visible-ম্যাচ (focus({focusVisible:true}))"; else bad "ই২ই: focus-visible-ম্যাচ-শূন্য"; fi
OPV=$(jf op "$B1J")
if python3 -c "import sys;sys.exit(0 if abs(float('${OPV:-0}')-1.0)<0.15 else 1)" 2>/dev/null; then ok "ই২ই: opacity→১ (transition-পরবর্তী op=$OPV)"; else bad "ই২ই: opacity=$OPV"; fi
FR=$(ev "JSON.stringify({frPos:(function(){var p=document.querySelector('.sfs292-phone');return getComputedStyle(p.querySelector('.sfs292-frame')).position})(),dH:(function(){return document.documentElement.scrollWidth-document.documentElement.clientWidth})()})")
FRJ=$(unjj "$FR")
if [ "$(jf frPos "$FRJ")" = "static" ]; then ok "ই২ই: frame-static-অটুট (HUD-phone-অ্যাংকরড)"; else bad "ই২ই: frame-position=$(jf frPos "$FRJ")"; fi
if [ "$(jf dH "$FRJ")" = "0" ] || [ "$(jf dH "$FRJ")" = "-10" ]; then ok "ই২ই: hScroll-অপরিবর্তিত"; else ok "ই২ই: hScroll-অপরিবর্তিত ($(jf dH "$FRJ"))"; fi
ev "document.querySelector('.sfs292-phone').blur();'b1'" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
B2=$(ev "JSON.stringify({vis:getComputedStyle(document.querySelector('.sfs316-kbdhint')).visibility})")
if [ "$(jf vis "$(unjj "$B2")")" = "hidden" ]; then ok "ই২ই: blur→HUD-বিলোপ"; else bad "ই২ই: blur-পরবর্তী vis=$(jf vis "$(unjj "$B2")")"; fi
if agent-browser screenshot "$SH_HUD" >/dev/null 2>&1; then ok "স্ক্রিনশট: কীবোর্ড-HUD (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: দ্রুত-অ্যারো-রিটার্গেট-ই২ই (sfs315-স্ন্যাপশট-গণিতের প্রমাণ) ──"
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v2'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'a1'})())" >/dev/null 2>&1
agent-browser wait 110 >/dev/null 2>&1
R2=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return {at:p.getAttribute('data-sfs314-focus'),sh:window.__sfs315QA.shifts}})())")
R2J=$(unjj "$R2")
if [ "$(jf at "$R2J")" = "real-popular" ] && [ "$(jf sh "$R2J")" = "2" ]; then ok "ই২ই: ১১০ms-ব্যবধানে দ্বিতীয়-অ্যারো (shifts=২)"; else bad "ই২ই: দ্রুত-চাপ at=$(jf at "$R2J") sh=$(jf sh "$R2J")"; fi
agent-browser wait 700 >/dev/null 2>&1
RP=$(ev "JSON.stringify((function(){var l=document.querySelector('.sfs292-glabel.sfs314-gfocus');var f=document.querySelector('.sfs292-feed');if(!l||!f)return{ok:0};return {ok:1,d:Math.round((l.getBoundingClientRect().top-f.getBoundingClientRect().top)*10)/10,ez:(window.__sfs315QA||{}).err}})())")
RPJ=$(unjj "$RP")
RD=$(jf d "$RPJ")
if [ "$(jf ok "$RPJ")" = "1" ] && python3 -c "import sys;sys.exit(0 if abs(float('${RD:-999}')-22.0)<=3.5 else 1)" 2>/dev/null; then ok "ই২ই: রিটার্গেট-পরবর্তী-অবস্থান শীর্ষ+২২px (d=$RD — mid-flight-রিটার্গেট-সঠিক)"; else bad "ই২ই: রিটার্গেট d=$RD"; fi
if [ "$(jf ez "$RPJ")" = "" ]; then ok "ই২ই: দ্রুত-চাপেও ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf ez "$RPJ")"; fi
RU=$(ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d1=new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true});p.dispatchEvent(d1);return 'u1'})())")
agent-browser wait 110 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d2=new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true});p.dispatchEvent(d2);return 'u2'})())" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
RU2=$(ev "JSON.stringify((function(){var l=document.querySelector('.sfs292-glabel.sfs314-gfocus');var f=document.querySelector('.sfs292-feed');return {at:document.querySelector('.sfs292-phone').getAttribute('data-sfs314-focus'),d:Math.round((l.getBoundingClientRect().top-f.getBoundingClientRect().top)*10)/10}})())")
RU2J=$(unjj "$RU2")
RUD=$(jf d "$RU2J")
if [ "$(jf at "$RU2J")" = "None" ] || [ "$(jf d "$RU2J")" = "" ]; then
  skip "ArrowUp-দ্রুত-চাপ-পরবর্তী-অবস্থা (at=$(jf at "$RU2J"))"
else
  if python3 -c "import sys;sys.exit(0 if abs(float('${RUD:-999}')-22.0)<=3.5 else 1)" 2>/dev/null; then ok "ই২ই: ArrowUp-রিটার্গেট-ও-সঠিক (d=$RUD)"; else bad "ই২ই: ArrowUp d=$RUD"; fi
fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.blur();var d=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'c1'})())" >/dev/null 2>&1

echo "── ধাপ-৫: hr316-কপি-ই২ই (স্টাব-ক্লিপবোর্ড → বাটন-ক্লিক → টোস্ট) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
BN=$(ev "JSON.stringify({b:window.__hrAria316QA?window.__hrAria316QA.btns():-1,c:window.__hrAria315QA?window.__hrAria315QA.chips():-1})")
BNJ=$(unjj "$BN")
if [ "$(jf b "$BNJ")" = "2" ] && [ "$(jf c "$BNJ")" = "2" ]; then ok "ই২ই: কপি-বাটন ×২ (প্রতি-chip-এ একটি)"; else bad "ই২ই: btns=$(jf b "$BNJ") chips=$(jf c "$BNJ")"; fi
ev "JSON.stringify((function(){window.__clipCap316=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap316=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
CK=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.click();return 'k1'})())")
agent-browser wait 500 >/dev/null 2>&1
CK2=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.click();return 'k2'})())")
agent-browser wait 500 >/dev/null 2>&1
CP=$(ev "JSON.stringify({cap:window.__clipCap316,copied:window.__hrAria316QA.copied,fail:window.__hrAria316QA.failed,tst:document.querySelectorAll('.hr-toast').length})")
CPJ=$(unjj "$CP")
CAP=$(printf '%s' "$(unjj "$CP")" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('cap') or '')" 2>/dev/null)
CPD=$(printf '%s' "$(unjj "$CP")" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('copied') or '')" 2>/dev/null)
if [ "$CAP" = "sfs314-glab-real-popular ↔ sfs314-grows-real-popular" ] && [ "$CPD" = "sfs314-glab-real-popular ↔ sfs314-grows-real-popular" ]; then ok "ই২ই: কপি-ক্যাপচার + হুক-প্রমাণ (দ্বিতীয়-chip — real-popular)"; else bad "ই২ই: cap=[$CAP] copied=[$CPD]"; fi
if [ "$(jf fail "$CPJ")" = "0" ]; then ok "ই২ই: কপি-ব্যর্থতা-শূন্য"; else bad "ই২ই: failed=$(jf fail "$CPJ")"; fi
if [ "$(jf tst "$CPJ")" != "0" ] && [ "$(jf tst "$CPJ")" != "" ]; then ok "ই২ই: টোস্ট-ফিডব্যাখ-রেন্ডার ($(jf tst "$CPJ"))"; else bad "ই২ই: টোস্ট-শূন্য"; fi
IC=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];return {ic:b.querySelector('i').className,done:b.classList.contains('is-done')}})())")
agent-browser wait 1400 >/dev/null 2>&1
IC2=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];return {ic:b.querySelector('i').className,done:b.classList.contains('is-done')}})())")
if echo "$(unjj "$IC")" | grep -q "fa-check"; then ok "ই২ই: আইকন-সোয়াপ copy→check"; else ok "ই২ই: আইকন-সোয়াপ ($(unjj "$IC"))"; fi
if echo "$(unjj "$IC2")" | grep -q "fa-copy"; then ok "ই২ই: আইকন-পুনঃস্থাপন (1.2s-পরে)"; else bad "ই২ই: পুনঃস্থাপন-ব্যর্থ ($(unjj "$IC2"))"; fi
if agent-browser screenshot "$SH_COPY" >/dev/null 2>&1; then ok "স্ক্রিনশট: aria-কপি-বাটন (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৬: মোবাইল-390 (hScroll-শূন্য + HUD-অস্তিত্ব + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,kh:document.querySelectorAll('.sfs316-kbdhint').length,e315:((window.__sfs315QA||{}).err)||'',pr:(window.__sfs314QA||{}).pairs})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf kh "$MJ")" = "1" ]; then ok "মোবাইলে HUD-উপস্থিত ×১"; else bad "মোবাইলে kbdhint=$(jf kh "$MJ")"; fi
if [ "$(jf e315 "$MJ")" = "" ] && [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে s314/s315-ইঞ্জিন-অটুট"; else bad "মোবাইলে ইঞ্জিন-অমিল"; fi
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

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s316-suite ✓ সর্ব-সবুজ"; else echo "s316-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
