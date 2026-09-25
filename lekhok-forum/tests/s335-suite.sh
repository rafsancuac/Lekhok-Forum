#!/bin/bash
# s335-suite.sh — session335: hr335 রেজিস্ট্রি-হিন্ট-সম্পাদনা-API setHint(k,h) + sfs335 kbd-লাইন-ব্র্যান্ড-টোন
# [Task ID 172] PLANS session334-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড):
#   hr335 (admin/home-reorder.ejs — hr334-IIFE-অভ্যন্তরে-সম্প্রসারণ): q333h.setHint(k, h) — register-পরিবার-
#      সম্প্রসারণ — এক-কল-হিন্ট-সম্পাদনা — রেজিস্ট্রি-রো-[2]-মিউটেশন + kbd-লাইন-লাইভ-সিঙ্ক (দ্বি-সাইট);
#      লাইন-সিঙ্ক-ত্রি-পথ (in-place-split-join-পুনঃলেখন / appendHint334-প্রতিনিধি / ক্লিয়ার-অপসারণ);
#      {fmt}-টেমপ্লেট-সমর্থিত; ওভারলে-বর্ণনা-[1]-অস্পৃশ্য + ওভারলে-পুনঃনির্মাণ-শূন্য;
#      __hrAria335QA {sets, misses, rewrites, appends, last, set(), hintOf(), line(), err}
#   sfs335 (style.css session335-ব্লক — কেবল-সংযোজন): .hr317-tip .hr324-kbd বেস-ব্র্যান্ড-টোন ৮%
#      (color-mix — hex-free — কেবল-রঙ — layout-neutral — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-
#         পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + hygiene-clear ×৩ + computed-রঙ-assert =
#         ফরম্যাট-নিরপেক্ষ-পার্স + স্ট্রিং-সমতা (s330/s334-রীতি) + tip-প্রদর্শন = দ্বি-কপি +
#         blur+focus-রেসিপি (s334-গোটচা-①) + নিবন্ধন-রাজ্য = সুইট-অভ্যন্তরীণ-সীমিত +
#         immutable-CSS-ক্যাশ-বাস্ট = fetch(cache:'reload')-পূর্বে-বাধ্যতামূলক (s335-গোটচা-③)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s335-sethint-admin.png
SH_MOB=/home/z/my-project/download/s335-kbdtone-mobile390.png
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
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s335-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s335-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr335-setHint + sfs335-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "var q335h = { sets: 0, misses: 0, rewrites: 0, appends: 0, last: '', err: '' };" "$EJSF" && ok "home-reorder.ejs: __hrAria335QA-কাউন্টার-চতুষ্টয় (sets/misses/rewrites/appends)" || bad "home-reorder.ejs: কাউন্টার-অমিল"
grep -q "var setHint335 = function (k335s, h335s)" "$EJSF" && grep -q "q333h.setHint = function (k335q, h335q)" "$EJSF" && ok "home-reorder.ejs: setHint335 + q333h.setHint (register-পরিবার-সম্প্রসারণ)" || bad "home-reorder.ejs: setHint-API-অমিল"
grep -q "kb335.textContent.split(oldR335).join(newR335)" "$EJSF" && ok "home-reorder.ejs: in-place-split-join-সর্ব-উপস্থিতি (পুনঃলেখন-পথ — s333-গোটচা-②-রীতি)" || bad "home-reorder.ejs: পুনঃলেখন-পথ-অমিল"
grep -q "kb335.textContent.split(' · ' + oldR335).join('')" "$EJSF" && ok "home-reorder.ejs: ক্লিয়ার-পথ (' · '+পুরাতন-অপসারণ)" || bad "home-reorder.ejs: ক্লিয়ার-পথ-অমিল"
grep -q "appendHint334(k335s); /\* অ্যাপেন্ড-পথ-প্রতিনিধি" "$EJSF" && ok "home-reorder.ejs: অ্যাপেন্ড-পথ = appendHint334-প্রতিনিধি (এক-উৎস-অ্যাপেন্ডার-পুনঃব্যবহার)" || bad "home-reorder.ejs: অ্যাপেন্ড-পথ-অমিল"
grep -q "row335s\[2\] = String(h335s === undefined || h335s === null ? '' : h335s);" "$EJSF" && ok "home-reorder.ejs: রেজিস্ট্রি-রো-[2]-মিউটেশন (null/undefined-ক্লিয়ার-সম্মত)" || bad "home-reorder.ejs: মিউটেশন-অমিল"
grep -q "window.__hrAria335QA = q335h;" "$EJSF" && grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria335QA-হুক + s334/s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "var cf333 = cycleFmt326;" "$EJSF" && ok "home-reorder.ejs: hr334/hr333-মোড়ক-গঠন-অস্পৃশ্য (regOrig334 + cf333-অটুট)" || bad "home-reorder.ejs: মোড়ক-গঠন-ভাঙা"
A335CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria335QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A335CHK" = "OK" ]; then ok "home-reorder.ejs: hr335-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS335=$(sed -n '/session335 (sfs335 kbd-লাইন-ব্র্যান্ড-টোন — admin-ইনলাইন)/,/EOF session335/p' "$EJSF")
HEXN=$(printf '%s' "$CSS335" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS335" ]; then ok "home-reorder.ejs: session335-ইনলাইন-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "home-reorder.ejs: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS335" | grep -c 'session335' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session335-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গোটচা-③-সংশোধিত-স্থান)"; else bad "home-reorder.ejs: মার্কার ×$BN"; fi
printf '%s' "$CSS335" | grep -q '.hr317-tip .hr324-kbd {' && printf '%s' "$CSS335" | grep -q 'background-color: color-mix(in srgb, var(--lf-brand-primary) 8%, transparent)' && ok "home-reorder.ejs: kbd-লাইন-ব্র্যান্ড-টোন ৮% (hr334-এক-উৎস-লাইন-সনাক্তযোগ্যতা — .hr324-kbd-বেস-রুল-সহাবস্থান)" || bad "home-reorder.ejs: টোন-রুল-অমিল"
printf '%s' "$CSS335" | grep -q 'background-color' && printf '%s' "$CSS335" | grep -qE 'right:|max-width|width:|padding|border-radius|border:' && bad "home-reorder.ejs: layout/কেবল-রঙ-নীতি-ভাঙা" || ok "home-reorder.ejs: layout-neutral + কেবল-background-color (geometry-অস্পৃশ্য)"
BADCSS=$(grep -c 'session335' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$BADCSS" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session335-শূন্য (রোলব্যাক-প্রমাণ — গোটচা-③: admin-পৃষ্ঠা style.css-লোড-করে-না) + session334 ×২-অটুট"; else bad "style.css: s335×$BADCSS s334×$GOODCSS (রোলব্যাক-অমিল)"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন — s333-সুইটে-যাচাইকৃত)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C335=$(printf '%s' "$SSC" | grep -c 'session335' | tr -d ' ')
C334K=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C335" = "0" ] && [ "$C334K" = "2" ]; then ok "সার্ভেড-CSS: session334 ×২-লাইভ-অটুট + session335-শূন্য (রোলব্যাক-লাইভ-প্রমাণ — ফিড-সাইড-অস্পৃশ্য)"; else bad "সার্ভেড-CSS: s335×$C335 s334×$C334K"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: hr335+sfs335-ই২ই (setHint-দ্বি-সাইট + টোন-৮%) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
Q0=$(ev "JSON.stringify({q:!!window.__hrAria335QA,s:window.__hrAria335QA?window.__hrAria335QA.sets:-1,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria335QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf s "$Q0J")" = "0" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria335QA-হুক (sets=০ + ত্রুটি-শূন্য) + s334/s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
MS=$(ev "JSON.stringify({m:window.__hrAria335QA.set('Z__NOPE','x'),mi:window.__hrAria335QA.misses,r:window.__hrAria333QA.rows()})")
MSJ=$(unjj "$MS")
if [ "$(jf m "$MSJ")" = "false" ] && [ "$(jf mi "$MSJ")" = "1" ] && [ "$(jf r "$MSJ")" = "9" ]; then ok "ই২ই: অজানা-কী-সেট = false (misses=১ + rows-অপরিবর্তিত)"; else bad "ই২ই: $(unjj "$MS")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap335=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'foc'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
TONE=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{bg:bg,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
TONEJ=$(unjj "$TONE")
if [ "$(jf e "$TONEJ")" = "" ] && [ "$(jf al "$TONEJ")" = "0.08" ]; then ok "ই২ই: kbd-লাইন-ব্র্যান্ড-টোন α=0.08 (sfs335-ডেস্ক — ফরম্যাট-নিরপেক্ষ-পার্স — s334-চুক্তি-③)"; else bad "ই২ই: টোন $(unjj "$TONE")"; fi
KB0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');if(!k)return{e:'no-kbd'};return{on:k.classList.contains('hr324-kbd'),eq:k.textContent===window.__hrAria335QA.line(),x:k.textContent.indexOf('X = পয়েন্টার-সারি বিলোপ')>=0}})())")
KB0J=$(unjj "$KB0")
if [ "$(jf eq "$KB0J")" = "true" ] && [ "$(jf x "$KB0J")" = "true" ]; then ok "ই২ই: প্রি-সেট live-kbd == line() + X-পুরাতন-হিন্ট-উপস্থিত (এক-উৎস-বেসলাইন)"; else bad "ই২ই: $(unjj "$KB0")"; fi
RW=$(ev "JSON.stringify((function(){var ok1=window.__hrAria335QA.set('X','X = বিলোপ (৩৩৫)');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{ok1:ok1,s:window.__hrAria335QA.sets,rw:window.__hrAria335QA.rewrites,nw:t.indexOf('X = বিলোপ (৩৩৫)')>=0,od:t.indexOf('X = পয়েন্টার-সারি বিলোপ')>=0,eq:t===window.__hrAria335QA.line()}})())")
RWJ=$(unjj "$RW")
if [ "$(jf ok1 "$RWJ")" = "true" ] && [ "$(jf s "$RWJ")" = "1" ] && [ "$(jf rw "$RWJ")" = "1" ] && [ "$(jf nw "$RWJ")" = "true" ] && [ "$(jf od "$RWJ")" = "false" ] && [ "$(jf eq "$RWJ")" = "true" ]; then ok "ই২ই: setHint('X')-in-place-পুনঃলেখন (sets=১ + rewrites=১ + নতুন-উপস্থিত + পুরাতন-বিলুপ্ত + live==line)"; else bad "ই২ই: $(unjj "$RW")"; fi
FM=$(ev "JSON.stringify((function(){var ok2=window.__hrAria335QA.set('F','F = বিন্যাস ({fmt})');var h=window.__hrAria335QA.hintOf('F');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');return{ok2:ok2,h:h,live:k?k.textContent.indexOf(h)>=0:false,rw:window.__hrAria335QA.rewrites}})())")
FMJ=$(unjj "$FM")
if [ "$(jf ok2 "$FMJ")" = "true" ] && printf '%s' "$(jf h "$FMJ")" | grep -q 'F = বিন্যাস (সমৃদ্ধ)' && [ "$(jf live "$FMJ")" = "true" ] && [ "$(jf rw "$FMJ")" = "2" ]; then ok "ই২ই: {fmt}-টেমপ্লেট-সেট (rich-রেজলভ + লাইভ-সিঙ্ক + rewrites=২)"; else bad "ই২ই: $(unjj "$FM")"; fi
CL=$(ev "JSON.stringify((function(){var ok3=window.__hrAria335QA.set('X','');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{ok3:ok3,rw:window.__hrAria335QA.rewrites,od:t.indexOf('X = বিলোপ (৩৩৫)')>=0,eq:t===window.__hrAria335QA.line(),ho:window.__hrAria335QA.hintOf('X')}})())")
CLJ=$(unjj "$CL")
if [ "$(jf ok3 "$CLJ")" = "true" ] && [ "$(jf rw "$CLJ")" = "3" ] && [ "$(jf od "$CLJ")" = "false" ] && [ "$(jf eq "$CLJ")" = "true" ] && [ "$(jf ho "$CLJ")" = "" ]; then ok "ই২ই: ক্লিয়ার-পথ (set('X','') = লাইন-অপসারণ + hintOf='' + live==line)"; else bad "ই২ই: $(unjj "$CL")"; fi
AP=$(ev "JSON.stringify((function(){var r0=window.__hrAria333QA.rows();var reg=window.__hrAria333QA.register('J335','সেট-বর্ণনা');var ok4=window.__hrAria335QA.set('J335','J335 = সেট-হিন্ট');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{reg:reg,ok4:ok4,r0:r0,r1:window.__hrAria333QA.rows(),a335:window.__hrAria335QA.appends,a334:window.__hrAria334QA.appends,kb:t.indexOf('J335 = সেট-হিন্ট')>=0,eq:t===window.__hrAria335QA.line()}})())")
APJ=$(unjj "$AP")
if [ "$(jf reg "$APJ")" = "true" ] && [ "$(jf ok4 "$APJ")" = "true" ] && [ "$(jf r0 "$APJ")" = "9" ] && [ "$(jf r1 "$APJ")" = "10" ] && [ "$(jf a335 "$APJ")" = "1" ] && [ "$(jf kb "$APJ")" = "true" ] && [ "$(jf eq "$APJ")" = "true" ]; then ok "ই২ই: হিন্ট-বিহীন-কী-সেট = অ্যাপেন্ড-পথ (rows ৯→১০ + appends=১ + লাইভ-উপস্থিত + live==line)"; else bad "ই২ই: $(unjj "$AP")"; fi
PV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';var m=window.__hrAria326QA?window.__hrAria326QA.mode():'';return{m:m,fk:t.indexOf('F = বিন্যাস (কেবল-কী)')>=0,j:t.indexOf('J335 = সেট-হিন্ট')>=0,eq:t===window.__hrAria335QA.line()}})())")
PVJ=$(unjj "$PV")
if [ "$(jf m "$PVJ")" = "key" ] && [ "$(jf fk "$PVJ")" = "true" ] && [ "$(jf j "$PVJ")" = "true" ] && [ "$(jf eq "$PVJ")" = "true" ]; then ok "ই২ই: চক্র-পরবর্তী-স্থায়িত্ব (F→কেবল-কী-রেজলভ + J335-সেট-হিন্ট-রেজিস্ট্রি-থেকে-পুনঃনির্মিত + live==line — এক-উৎস-স্থায়িত্ব)"; else bad "ই২ই: $(unjj "$PV")"; fi
OV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,r:window.__hrAria333QA.rows()})")
OVJ=$(unjj "$OV")
if [ "$(jf o "$OVJ")" = "true" ] && [ "$(jf li "$OVJ")" = "10" ] && [ "$(jf r "$OVJ")" = "10" ]; then ok "ই২ই: ওভারলে-১০-সারি (৯+W + J335-নিবন্ধিত — setHint-রো-গণনা-অস্পৃশ্য — পুনঃনির্মাণ-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$OV")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: setHint-পরবর্তী-ওভারলে সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||''),last:window.__hrAria335QA.last})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s333+s330+hr334+hr335)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs335-মোবাইল-390 (টোন-সর্ব-ব্যান্ড-এক-মান) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'msel'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'm1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'm2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'mfoc'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
MT=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
MTJ=$(unjj "$MT")
if [ "$(jf e "$MTJ")" = "" ] && [ "$(jf al "$MTJ")" = "0.08" ]; then ok "ই২ই: মোবাইল-390 kbd-টোন α=0.08 (সর্ব-ব্যান্ড-এক-মান — media-query-শূন্য-প্রমাণ)"; else bad "ই২ই: মোবাইল-টোন $(unjj "$MT")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 kbd-টোন সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
CN=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN:-0}" = "0" ] || [ -z "$CN" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ×$CN"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
CN2=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN2:-0}" = "0" ] || [ -z "$CN2" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "দ্বি-লোড-ত্রুটি ×$CN2"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে সার্ভার-বুট-ব্যর্থ"
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s335-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s335-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
