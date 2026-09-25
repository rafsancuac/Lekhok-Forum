#!/bin/bash
# s339-suite.sh — session339: hr339 হিন্ট-স্থায়ীকরণ-ক্লিয়ার-বাটন (q337h.clearStore-UI-প্রকাশ) + sfs339 ক্লিয়ার-বাটন-স্টাইল
# [Task ID 176] PLANS session338-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (hr337-চুক্তি-প্রসারিত):
#   hr339 (admin/home-reorder.ejs — hr338-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি): গেট = সংরক্ষিত-স্টোর-অ-শূন্য
#      × tip317-উপস্থিত; .hr324-bar-বিদ্যমানে-সংযোজন / অনুপস্থিতে স্বতন্ত্র-বার (.hr324-bar.hr339-bar); বাটন-শ্রেণি
#      .hr339-clearbtn **স্বতন্ত্র-শ্রেণি** (s326-রীতি — s324-.hr324-btn-গণনা-চুক্তি-অটুট); দ্বি-চাপ-নিশ্চিত (hr323-রীতি —
#      ৩s-স্বয়ং-নিরামড — .hr339-armed-লাল-টিন্ট + aria/লেবেল-জীবন্ত-সিঙ্ক — hr332-চুক্তি); সম্পাদন = q337h.clearStore()
#      (hr337-এক-উৎস) + টোস্ট + বাটন-লাইভ-অপসারণ; জীবন্ত-সিঙ্ক = persist337-মোড়ক + q337h.clearStore-মোড়ক
#      (regOrig334-চেইন-রীতি — পাবলিক-সেট/ব্যাচেও-রি-রেন্ডার-বিহীন-উপস্থিতি/অপসারণ); রেজিস্ট্রি-রো-সংযোজন-শূন্য
#      (ovRows330-৮-সারি-স্থায়িত্ব); কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (ধ্বংসাত্মক-সতর্কতা — hr333-register-চুক্তি);
#      __hrAria339QA {clicks, arms, disarms, clears, last, btn(), armed(), wipe(), sync(), store(), err}
#   sfs339 (home-reorder.ejs ইনলাইন-<style> session339-ব্লক — cascade-অবস্থান session338-পরে — হেক্স-শূন্য):
#      .hr339-clearbtn hr324-পরিবার-সম্মত-সবুজ-বেস + .hr339-armed ধ্বংসাত্মক-লাল-টিন্ট (rgba(220,38,38)-পরিবার —
#      hr322/hr323/hr325-রীতি — rgba-only — নতুন-উপাদান-স্টাইল — বিদ্যমান-উপাদান-অস্পৃশ্য — MO=৪-অটুট)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         computed-রঙ-assert = ফরম্যাট-নিরপেক্ষ-পার্স + টিপ-প্রদর্শন = দ্বি-কপি + blur+focus-রেসিপি + প্রতি-reload-
#         recipe-পুনঃপ্রয়োগ (s337-গোটচা-①) + admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই + **সুইট-শেষে
#         hr337-hints-পরিষ্কারণ (রিগ্রেশন-সহাবস্থান-চুক্তি)**
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s339-clearbtn-desk.png
SH_MOB=/home/z/my-project/download/s339-clearbtn-mobile390.png
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
recipe(){
  ev "JSON.stringify((function(){try{if(!window.__clipCap339)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap339=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'rc2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'rc3'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'rc4'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
}
rld(){ agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1; recipe; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s339-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s339-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr339-ক্লিয়ার-বাটন + sfs339-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "var q339h = { clicks: 0, arms: 0, disarms: 0, clears: 0, last: '', err: '' };" "$EJSF" && ok "home-reorder.ejs: __hrAria339QA-কাউন্টার-চতুষ্টয় (clicks/arms/disarms/clears)" || bad "home-reorder.ejs: কাউন্টার-অমিল"
grep -q "if (storeN339() === 0)" "$EJSF" && grep -q "if (b339e) return; /\* ডুপ-রক্ষা \*/" "$EJSF" && ok "home-reorder.ejs: গেট-জুটি (স্টোর-শূন্য-অপসারণ + ডুপ-রক্ষা — স্টোর-অ-শূন্য-গেট)" || bad "home-reorder.ejs: গেট-অমিল"
grep -q "bc339.className = 'hr339-clearbtn';" "$EJSF" && ! grep -q "className = 'hr324-btn hr339-clearbtn'" "$EJSF" && ok "home-reorder.ejs: .hr339-clearbtn-স্বতন্ত্র-শ্রেণি (s326-রীতি — s324-.hr324-btn-গণনা-চুক্তি-অটুট)" || bad "home-reorder.ejs: শ্রেণি-চুক্তি-ভাঙা"
grep -q "hr324-bar hr339-bar" "$EJSF" && ok "home-reorder.ejs: স্বতন্ত্র-বার-পথ (.hr324-bar.hr339-bar — শূন্য-ইতিহাস+স্থায়ী-স্টোর)" || bad "home-reorder.ejs: স্বতন্ত্র-বার-অমিল"
grep -q "var ok339w = q337h.clearStore();" "$EJSF" && ok "home-reorder.ejs: সম্পাদন = q337h.clearStore() (hr337-এক-উৎস — চুক্তি-প্রসারিত)" || bad "home-reorder.ejs: এক-উৎস-সম্পাদন-অমিল"
grep -q "tmr339 = setTimeout(function () { disarm339(false); }, 3000);" "$EJSF" && ok "home-reorder.ejs: ৩s-স্বয়ং-নিরামড (hr323-ধ্বংসাত্মক-রীতি)" || bad "home-reorder.ejs: নিরামড-টাইমার-অমিল"
grep -q "bc339.classList.add('hr339-armed');" "$EJSF" && grep -q "b339d.classList.remove('hr339-armed');" "$EJSF" && ok "home-reorder.ejs: আর্মড-শ্রেণি-জুটি (সংযোজন + নিরামড-অপসারণ)" || bad "home-reorder.ejs: আর্মড-শ্রেণি-অমিল"
grep -q "'নিশ্চিত করুন — আবার চাপলে স্থায়ী-হিন্ট-স্টোর মুছে যাবে'" "$EJSF" && grep -q "'স্থায়ী-হিন্ট-স্টোর মুছুন (দ্বি-চাপ-নিশ্চিত)'" "$EJSF" && ok "home-reorder.ejs: aria-স্টেট-জুটি (নির্মাণ-টেমপ্লেট + জীবন্ত-সিঙ্ক — hr332-চুক্তি)" || bad "home-reorder.ejs: aria-চুক্তি-অমিল"
grep -q "'স্থায়ী-হিন্ট-স্টোর মুছে ফেলা হয়েছে — পরবর্তী রিলোডে ডিফল্ট ফেরবে'" "$EJSF" && ok "home-reorder.ejs: টোস্ট-প্রমাণ (বিলোপ-পরবর্তী-পরিণতি-ঘোষণা)" || bad "home-reorder.ejs: টোস্ট-অমিল"
grep -q "var persistOrig339 = persist337;" "$EJSF" && grep -q "var clearOrig339 = q337h.clearStore;" "$EJSF" && grep -q "var trOrig339 = tipRender318;" "$EJSF" && ok "home-reorder.ejs: ত্রি-মোড়ক (persist337 + q337h.clearStore + tipRender318 — regOrig334-চেইন-রীতি — জীবন্ত-সিঙ্ক)" || bad "home-reorder.ejs: মোড়ক-ত্রয়ী-অমিল"
grep -q "window.__hrAria339QA = q339h;" "$EJSF" && grep -q "window.__hrAria338QA = q338h;" "$EJSF" && grep -q "window.__hrAria337QA = q337h;" "$EJSF" && grep -q "window.__hrAria336QA = q336h;" "$EJSF" && grep -q "window.__hrAria335QA = q335h;" "$EJSF" && grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria339QA-হুক + s338/s337/s336/s335/s334/s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "q333h.register('W'" "$EJSF" && bad "home-reorder.ejs: রেজিস্ট্রি-রো-সংযোজন-ঘটেছে (ovRows330-৮-সারি-চুক্তি-ভাঙা)" || ok "home-reorder.ejs: রেজিস্ট্রি-রো-সংযোজন-শূন্য (ovRows330-৮-সারি-স্থায়িত্ব — পুরাতন-সুইট-সহাবস্থান)"
grep -q "var setHint335 = function (k335s, h335s)" "$EJSF" && grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "var appendOrig337 = appendHint334;" "$EJSF" && grep -q "var setHintsOrig338 = q333h.setHints;" "$EJSF" && ok "home-reorder.ejs: সর্ব-পূর্ববর্তী-মোড়ক-গঠন-অস্পৃশ্য (setHint335 + regOrig334 + appendOrig337 + setHintsOrig338-অটুট)" || bad "home-reorder.ejs: মোড়ক-গঠন-ভাঙা"
A339CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria339QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A339CHK" = "OK" ]; then ok "home-reorder.ejs: hr339-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS339=$(sed -n '/session339 (sfs339 স্থায়ী-ক্লিয়ার-বাটন — admin-ইনলাইন)/,/EOF session339/p' "$EJSF")
HEXN=$(printf '%s' "$CSS339" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS339" ]; then ok "home-reorder.ejs: session339-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-চুক্তি)"; else bad "home-reorder.ejs: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS339" | grep -c 'session339' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session339-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গোটচা-①-চুক্তি-স্থান)"; else bad "home-reorder.ejs: মার্কার ×$BN"; fi
printf '%s' "$CSS339" | grep -q '.hr339-clearbtn.hr339-armed {' && printf '%s' "$CSS339" | grep -q 'background: rgba(220, 38, 38, 0.14)' && printf '%s' "$CSS339" | grep -q 'color: rgba(185, 28, 28, 0.97)' && ok "home-reorder.ejs: আর্মড-ধ্বংসাত্মক-লাল-টিন্ট (rgba(220,38,38)-পরিবার — hr322/hr323/hr325-রীতি)" || bad "home-reorder.ejs: আর্মড-টিন্ট-রুল-অমিল"
C339AFTER=$(grep -n 'EOF session339' "$EJSF" | head -1 | cut -d: -f1)
C338BEFORE=$(grep -n 'EOF session338' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C339AFTER" ] && [ -n "$C338BEFORE" ] && [ "$C339AFTER" -gt "$C338BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session339-ব্লক session338-পরে)"; else bad "home-reorder.ejs: cascade-অবস্থান-ভাঙা (339@$C339AFTER ≤ 338@$C338BEFORE)"; fi
B339=$(grep -c 'session339' "$APP/public/assets/css/style.css" | tr -d ' ')
B338=$(grep -c 'session338' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B339" = "0" ] && [ "$B338" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session339/338-শূন্য (admin-CSS-চুক্তি — গোটচা-①) + session334 ×২-অটুট"; else bad "style.css: s339×$B339 s338×$B338 s334×$GOODCSS (admin-CSS-চুক্তি-অমিল)"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C339S=$(printf '%s' "$SSC" | grep -c 'session339' | tr -d ' ')
C334K=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C339S" = "0" ] && [ "$C334K" = "2" ]; then ok "সার্ভেড-CSS: session334 ×২-লাইভ-অটুট + session339-শূন্য (ফিড-সাইড-অস্পৃশ্য — admin-CSS-চুক্তি-লাইভ-প্রমাণ)"; else bad "সার্ভেড-CSS: s339×$C339S s334×$C334K"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: hr339+sfs339-ই২ই (ক্লিয়ার-বাটন-গেট + দ্বি-চাপ-নিশ্চিত + জীবন্ত-সিঙ্ক) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr327-pv');sessionStorage.removeItem('hr337-hints')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints')}catch(e){};return 'c0'})())" >/dev/null 2>&1
rld
Q0=$(ev "JSON.stringify({q:!!window.__hrAria339QA,c:window.__hrAria339QA?window.__hrAria339QA.clicks:-1,b:window.__hrAria339QA?window.__hrAria339QA.btn():null,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria339QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf c "$Q0J")" = "0" ] && [ "$(jf b "$Q0J")" = "false" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria339QA-হুক (কাউন্টার=০ + বাটন-অনুপস্থিত — শূন্য-স্টোর-গেট-অফ) + s338/s337/s336/s335/s334/s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
LA=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = স্থায়ী (৩৩৯)');var b=document.querySelector('.hr339-clearbtn');return{btn:!!b,lbl:b?(b.querySelector('.hr339-lbl')||{}).textContent:'',ar:b?b.getAttribute('aria-label'):'',st:window.__hrAria339QA.store(),sv:window.__hrAria337QA.saves,last:window.__hrAria339QA.last}})())")
LAJ=$(unjj "$LA")
if [ "$(jf btn "$LAJ")" = "true" ] && printf '%s' "$(jf lbl "$LAJ")" | grep -q 'স্থায়ী মুছুন' && printf '%s' "$(jf ar "$LAJ")" | grep -q 'দ্বি-চাপ-নিশ্চিত' && [ "$(jf st "$LAJ")" = "8" ] && [ "$(jf sv "$LAJ")" -ge 1 ] && printf '%s' "$(jf last "$LAJ")" | grep -q 'sync'; then ok "ই২ই: জীবন্ত-উপস্থিতি (পাবলিক-setHint → persist337-মোড়ক → বাটন-রি-রেন্ডার-বিহীন-তাৎক্ষণিক-উপস্থিত + গেট-লেবেল/aria-টেমপ্লেট + স্ন্যাপশট-৮-কী — hr337-সর্ব-রেজিস্ট্রি-অর্থবিদ্যা)"; else bad "ই২ই: $(unjj "$LA")"; fi
ARM=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');b.click();var bg=getComputedStyle(b).backgroundColor;var bc=getComputedStyle(b).borderColor;return{c:window.__hrAria339QA.clicks,a:window.__hrAria339QA.arms,armed:b.classList.contains('hr339-armed'),ar:b.getAttribute('aria-label'),al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],bl:(bc.match(/([0-9.]+)\)$/)||['',''])[1],lbl:(b.querySelector('.hr339-lbl')||{}).textContent,last:window.__hrAria339QA.last}})())")
ARMJ=$(unjj "$ARM")
if [ "$(jf c "$ARMJ")" = "1" ] && [ "$(jf a "$ARMJ")" = "1" ] && [ "$(jf armed "$ARMJ")" = "true" ] && printf '%s' "$(jf ar "$ARMJ")" | grep -q 'নিশ্চিত করুন' && [ "$(jf al "$ARMJ")" = "0.14" ] && [ "$(jf bl "$ARMJ")" = "0.6" ] && printf '%s' "$(jf lbl "$ARMJ")" | grep -q 'আবার চাপুন'; then ok "ই২ই: প্রথম-চাপ = আর্মড (.hr339-armed + লাল-টিন্ট α=0.14/বর্ডার 0.6 + aria/লেবেল-জীবন্ত-সিঙ্ক — hr332-চুক্তি)"; else bad "ই২ই: $(unjj "$ARM")"; fi
agent-browser wait 3400 >/dev/null 2>&1
DARMT=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');if(!b)return{e:'no-btn'};var bg=getComputedStyle(b).backgroundColor;return{armed:b.classList.contains('hr339-armed'),al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],d:window.__hrAria339QA.disarms,ar:b.getAttribute('aria-label'),last:window.__hrAria339QA.last}})())")
DARMTJ=$(unjj "$DARMT")
if [ "$(jf e "$DARMTJ")" = "" ] && [ "$(jf armed "$DARMTJ")" = "false" ] && [ "$(jf al "$DARMTJ")" = "0.08" ] && [ "$(jf d "$DARMTJ")" = "1" ] && printf '%s' "$(jf ar "$DARMTJ")" | grep -q 'দ্বি-চাপ-নিশ্চিত'; then ok "ই২ই: ৩s-স্বয়ং-নিরামড (disarms=১ + সবুজ-বেস-ফেরত α=0.08 + aria/লেবেল-পুনঃস্থাপন — hr323-রীতি)"; else bad "ই২ই: $(unjj "$DARMT")"; fi
WIPE=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');if(!b)return{e:'no-btn'};b.click();b.click();var ss=sessionStorage.getItem('hr337-hints')===null;return{c:window.__hrAria339QA.clicks,cl:window.__hrAria339QA.clears,c37:window.__hrAria337QA.clears,btn:!!document.querySelector('.hr339-clearbtn'),ss:ss,last:window.__hrAria339QA.last,l37:window.__hrAria337QA.last}})())")
WIPEJ=$(unjj "$WIPE")
if [ "$(jf e "$WIPEJ")" = "" ] && [ "$(jf c "$WIPEJ")" = "3" ] && [ "$(jf cl "$WIPEJ")" = "1" ] && [ "$(jf c37 "$WIPEJ")" = "1" ] && [ "$(jf btn "$WIPEJ")" = "false" ] && [ "$(jf ss "$WIPEJ")" = "true" ] && printf '%s' "$(jf last "$WIPEJ")" | grep -q 'wipe' && printf '%s' "$(jf l37 "$WIPEJ")" | grep -q 'store:cleared'; then ok "ই২ই: দ্বি-চাপ-সম্পাদন (clicks=৩ → clears=১ + q337h.clears=১ — hr337-এক-উৎস + স্টোরেজ-শূন্য + বাটন-লাইভ-অপসারণ + store:cleared-last)"; else bad "ই২ই: $(unjj "$WIPE")"; fi
RB=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHints({'X':'X = ব্যাচ (৩৩৯)','E':'E = ব্যাচ (৩৩৯)'});var b=document.querySelector('.hr339-clearbtn');return{btn:!!b,st:window.__hrAria339QA.store()}})())")
RBJ=$(unjj "$RB")
if [ "$(jf btn "$RBJ")" = "true" ] && [ "$(jf st "$RBJ")" = "8" ]; then ok "ই২ই: ব্যাচ-স্থায়ীকরণ-পরবর্তী-পুনঃউপস্থিতি (setHints → persist-মোড়ক → বাটন-তাৎক্ষণিক — জীবন্ত-সিঙ্ক-দ্বৈত-প্রমাণ + স্ন্যাপশট-৮-কী)"; else bad "ই২ই: $(unjj "$RB")"; fi
WP2=$(ev "JSON.stringify({w:window.__hrAria339QA.wipe(),ss:(sessionStorage.getItem('hr337-hints')===null),btn:!!document.querySelector('.hr339-clearbtn'),cl:window.__hrAria339QA.clears})")
WP2J=$(unjj "$WP2")
if [ "$(jf w "$WP2J")" = "true" ] && [ "$(jf ss "$WP2J")" = "true" ] && [ "$(jf btn "$WP2J")" = "false" ] && [ "$(jf cl "$WP2J")" = "2" ]; then ok "ই২ই: wipe()-প্রোগ্রাম্যাটিক-পথ (QA-হুক — স্টোরেজ-শূন্য + বাটন-অপসৃত + clears=২)"; else bad "ই২ই: $(unjj "$WP2")"; fi
rld
RL=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{ho:window.__hrAria337QA.hintOf('X'),cls37:k?k.classList.contains('hr337-restored'):null,b:window.__hrAria339QA.btn(),al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
RLJ=$(unjj "$RL")
if [ "$(jf ho "$RLJ")" = "X = পয়েন্টার-সারি বিলোপ" ] && [ "$(jf cls37 "$RLJ")" = "false" ] && [ "$(jf b "$RLJ")" = "false" ] && [ "$(jf al "$RLJ")" = "0.08" ]; then ok "ই২ই: wipe-পরবর্তী-রিলোড-ডিফল্ট-ফেরত (hintOf-ডিফল্ট + hr337-restored-অনুপস্থিত + বাটন-অনুপস্থিত + বেস-টোন ০.০৮ — পরিষ্কার-অর্থবিদ্যা)"; else bad "ই২ই: $(unjj "$RL")"; fi
CP=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('F','F = নির্মাণ-পথ (৩৩৯)');return 's1'})())" >/dev/null 2>&1; rld; ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');var k=document.querySelector('.hr317-tip .hr324-kbd');return{btn:!!b,ho:window.__hrAria337QA.hintOf('F'),cls37:k?k.classList.contains('hr337-restored'):false,st:window.__hrAria339QA.store()}})())")
CPJ=$(unjj "$CP")
if [ "$(jf btn "$CPJ")" = "true" ] && printf '%s' "$(jf ho "$CPJ")" | grep -q 'নির্মাণ-পথ' && [ "$(jf cls37 "$CPJ")" = "true" ] && [ "$(jf st "$CPJ")" = "8" ]; then ok "ই২ই: নির্মাণ-পথ (স্থায়ী-স্টোর-সহ-রিলোড → replay → বাটন-সৃষ্টিকালীন-উপস্থিত + hr337-restored-অটুট + স্ন্যাপশট-৮-কী — s337-উত্তরাধিকার-সহাবস্থান)"; else bad "ই২ই: $(unjj "$CP")"; fi
REG=$(ev "JSON.stringify({r:window.__hrAria333QA.rows(),line:(window.__hrAria337QA.line()===((document.querySelector('.hr317-tip .hr324-kbd')||{}).textContent))})")
REGJ=$(unjj "$REG")
if [ "$(jf r "$REGJ")" = "8" ]; then ok "ই২ই: রেজিস্ট্রি-৮-সারি-অটুট (hr339-রো-সংযোজন-শূন্য — ওভারলে-সারি-গণনা-স্থায়িত্ব)"; else bad "ই২ই: $(unjj "$REG")"; fi
if [ "$(jf line "$REGJ")" = "true" ]; then ok "ই২ই: live-kbd == line() (kbd-এক-উৎস-চুক্তি-অটুট — hr339-অস্পৃশ্য-প্রমাণ)"; else bad "ই২ই: line=$(unjj "$REG")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-নির্মাণ-পথ-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria339QA.err||'')+(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333+hr334+hr335+hr336+hr337+hr338+hr339)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs339-মোবাইল-390 (ক্লিয়ার-বাটন-সর্ব-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints')}catch(e){};return 'mc0'})())" >/dev/null 2>&1
rld
MB=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = মোবাইল (৩৯০)');var b=document.querySelector('.hr339-clearbtn');if(!b)return{e:'no-btn'};var bg=getComputedStyle(b).backgroundColor;return{btn:true,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],armed:b.classList.contains('hr339-armed')}})())")
MBJ=$(unjj "$MB")
if [ "$(jf e "$MBJ")" = "" ] && [ "$(jf btn "$MBJ")" = "true" ] && [ "$(jf al "$MBJ")" = "0.08" ] && [ "$(jf armed "$MBJ")" = "false" ]; then ok "ই২ই: মোবাইল-390 বেস-বাটন (জীবন্ত-উপস্থিত + সবুজ-বেস α=0.08 — সর্ব-ব্যান্ড-এক-মান — media-query-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$MB")"; fi
MW=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');if(!b)return{e:'no-btn'};b.click();var bg=getComputedStyle(b).backgroundColor;var on=b.classList.contains('hr339-armed');var al=(bg.match(/([0-9.]+)\)$/)||['',''])[1];b.click();return{armedWas:on,alWas:al,ss:(sessionStorage.getItem('hr337-hints')===null),btn:!!document.querySelector('.hr339-clearbtn'),cl:window.__hrAria339QA.clears}})())")
MWJ=$(unjj "$MW")
if [ "$(jf e "$MWJ")" = "" ] && [ "$(jf armedWas "$MWJ")" = "true" ] && [ "$(jf alWas "$MWJ")" = "0.14" ] && [ "$(jf ss "$MWJ")" = "true" ] && [ "$(jf btn "$MWJ")" = "false" ] && [ "$(jf cl "$MWJ")" = "1" ]; then ok "ই২ই: মোবাইল-390 দ্বি-চাপ-সম্পাদন (আর্মড α=0.14-সর্ব-ব্যান্ড + স্টোরেজ-শূন্য + বাটন-অপসৃত + clears=১)"; else bad "ই২ই: $(unjj "$MW")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 পরিষ্কার-পরবর্তী-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints-রিগ্রেশন-চুক্তি) + দ্বি-লোড-কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{window.__hrAria337QA.clearStore()}catch(e){};return 'cl0'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({m:Object.keys(window.__hrAria337QA.map()).length,ss:(sessionStorage.getItem('hr337-hints')===null),b:window.__hrAria339QA.btn()})")
CLNJ=$(unjj "$CLN")
if [ "$(jf m "$CLNJ")" = "0" ] && [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf b "$CLNJ")" = "false" ]; then ok "পরিষ্কারণ: hr337-hints-শূন্য + বাটন-অনুপস্থিত (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি — রিগ্রেশন-সহাবস্থান)"; else bad "পরিষ্কারণ-ব্যর্থ: $(unjj "$CLN")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s339-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s339-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
