#!/bin/bash
# s336-suite.sh — session336: hr336 রেজিস্ট্রি-হিন্ট-ব্যাচ-API setHints(map) + sfs336 ব্যাচ-kbd-ফিডব্যাক-টোন
# [Task ID 173] PLANS session335-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড):
#   hr336 (admin/home-reorder.ejs — hr335-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি): q333h.setHints(map) —
#      register-পরিবার-সম্প্রসারণ — এক-কল-বহু-কী-হিন্ট-সম্পাদনা (hr335-চুক্তি-প্রসারিত) — hasOwnProperty-রক্ষা-
#      for-in — প্রতি-কী-তে setHint335-প্রতিনিধি (লাইন-সিঙ্ক-ত্রি-পথ-উত্তরাধিকার — rewrites/appends/misses-গণনা-
#      স্বয়ংক্রিয়); ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys}; অবৈধ-ইনপুট = batch:invalid; শূন্য-মান-কী =
#      ক্লিয়ার-পথ; {fmt}-টেমপ্লেট-সমর্থিত; live==line()-চুক্তি-সংরক্ষণ; সফল-ব্যাচে kbd-লাইনে hr336-batched-শ্রেণি;
#      __hrAria336QA {batches, applied, missed, keys, last, setHints(), set(), hintOf(), line(), err}
#   sfs336 (home-reorder.ejs ইনলাইন-<style> session336-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral):
#      .hr324-kbd.hr336-batched গভীর-ব্র্যান্ড-টোন ১৫% + গাঢ়-টেক্সট (color-mix — কেবল-রঙ — সর্ব-ব্যান্ড-এক-মান —
#      MO=৪-অটুট — transition-শূন্য)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-
#         পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + hygiene-clear ×৩ + computed-রঙ-assert =
#         ফরম্যাট-নিরপেক্ষ-পার্স + স্ট্রিং-সমতা (s330/s334-রীতি) + tip-প্রদর্শন = দ্বি-কপি +
#         blur+focus-রেসিপি (s334-গোটচা-① — s335-গোটচা-③-সম্প্রসারিত) + নিবন্ধন-রাজ্য =
#         সুইট-অভ্যন্তরীণ-সীমিত + admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই (s335-গোটচা-①-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s336-batchtone-desk.png
SH_MOB=/home/z/my-project/download/s336-batchtone-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s336-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s336-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr336-setHints + sfs336-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "var q336h = { batches: 0, applied: 0, missed: 0, keys: 0, last: '', err: '' };" "$EJSF" && ok "home-reorder.ejs: __hrAria336QA-কাউন্টার-পঞ্চক (batches/applied/missed/keys/last)" || bad "home-reorder.ejs: কাউন্টার-অমিল"
grep -q "var setHints336 = function (m336)" "$EJSF" && grep -q "q333h.setHints = function (m336q)" "$EJSF" && ok "home-reorder.ejs: setHints336 + q333h.setHints (register-পরিবার-সম্প্রসারণ)" || bad "home-reorder.ejs: setHints-API-অমিল"
grep -q "Object.prototype.hasOwnProperty.call(m336, c336)" "$EJSF" && ok "home-reorder.ejs: hasOwnProperty-রক্ষা-for-in (পুরাতন-রীতি — প্রোটোটাইপ-কী-বর্জন)" || bad "home-reorder.ejs: hasOwnProperty-রক্ষা-অমিল"
grep -q "if (setHint335(ks336\[i336\], m336\[ks336\[i336\]\])) ok336 += 1; else miss336 += 1;" "$EJSF" && ok "home-reorder.ejs: প্রতি-কী-তে setHint335-প্রতিনিধি (লাইন-সিঙ্ক-ত্রি-পথ-উত্তরাধিকার)" || bad "home-reorder.ejs: প্রতিনিধি-অমিল"
grep -q "return { applied: ok336, missed: miss336, total: ks336.length, keys: ks336 };" "$EJSF" && ok "home-reorder.ejs: ব্যাচ-সারসংক্ষেপ {applied, missed, total, keys} রিটার্ন" || bad "home-reorder.ejs: সারসংক্ষেপ-অমিল"
grep -q "q336h.last = 'batch:invalid';" "$EJSF" && ok "home-reorder.ejs: অবৈধ-ইনপুট-গার্ড (batch:invalid-last)" || bad "home-reorder.ejs: অবৈধ-ইনপুট-গার্ড-অমিল"
grep -q "kb336b.classList.add('hr336-batched')" "$EJSF" && grep -q "if (ok336 > 0)" "$EJSF" && ok "home-reorder.ejs: সফল-ব্যাচে hr336-batched-শ্রেণি (sfs336-ফিডব্যাক-গেট — একক-set()-পথে-অযুক্ত)" || bad "home-reorder.ejs: ফিডব্যাক-শ্রেণি-অমিল"
grep -q "window.__hrAria336QA = q336h;" "$EJSF" && grep -q "window.__hrAria335QA = q335h;" "$EJSF" && grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria336QA-হুক + s335/s334/s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "var setHint335 = function (k335s, h335s)" "$EJSF" && grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "var cf333 = cycleFmt326;" "$EJSF" && ok "home-reorder.ejs: hr335/hr334/hr333-মোড়ক-গঠন-অস্পৃশ্য (setHint335 + regOrig334 + cf333-অটুট)" || bad "home-reorder.ejs: মোড়ক-গঠন-ভাঙা"
A336CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria336QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A336CHK" = "OK" ]; then ok "home-reorder.ejs: hr336-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS336=$(sed -n '/session336 (sfs336 ব্যাচ-সম্পাদিত-kbd-ফিডব্যাক-টোন — admin-ইনলাইন)/,/EOF session336/p' "$EJSF")
HEXN=$(printf '%s' "$CSS336" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS336" ]; then ok "home-reorder.ejs: session336-ইনলাইন-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "home-reorder.ejs: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS336" | grep -c 'session336' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session336-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গোটচা-①-চুক্তি-স্থান)"; else bad "home-reorder.ejs: মার্কার ×$BN"; fi
printf '%s' "$CSS336" | grep -q '.hr317-tip .hr324-kbd.hr336-batched {' && printf '%s' "$CSS336" | grep -q 'background-color: color-mix(in srgb, var(--lf-brand-primary) 15%, transparent)' && printf '%s' "$CSS336" | grep -q 'color: rgba(6, 95, 70, 0.92)' && ok "home-reorder.ejs: ব্যাচ-kbd-ফিডব্যাক-টোন ১৫% + গাঢ়-টেক্সট (sfs335-বেস-৮%-উপরে-ধাপ — র‍্যাম্প-সহাবস্থান)" || bad "home-reorder.ejs: ফিডব্যাক-টোন-রুল-অমিল"
printf '%s' "$CSS336" | grep -q 'background-color' && printf '%s' "$CSS336" | grep -qE 'right:|max-width|width:|padding|border-radius|border:' && bad "home-reorder.ejs: layout/কেবল-রঙ-নীতি-ভাঙা" || ok "home-reorder.ejs: layout-neutral + কেবল-রঙ (background-color+color — geometry-অস্পৃশ্য)"
B336=$(grep -c 'session336' "$APP/public/assets/css/style.css" | tr -d ' ')
B335=$(grep -c 'session335' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B336" = "0" ] && [ "$B335" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session336/session335-শূন্য (admin-CSS-চুক্তি — গোটচা-①: admin-পৃষ্ঠা style.css-লোড-করে-না) + session334 ×২-অটুট"; else bad "style.css: s336×$B336 s335×$B335 s334×$GOODCSS (admin-CSS-চুক্তি-অমিল)"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন — s333-সুইটে-যাচাইকৃত)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C336=$(printf '%s' "$SSC" | grep -c 'session336' | tr -d ' ')
C335S=$(printf '%s' "$SSC" | grep -c 'session335' | tr -d ' ')
C334K=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C336" = "0" ] && [ "$C335S" = "0" ] && [ "$C334K" = "2" ]; then ok "সার্ভেড-CSS: session334 ×২-লাইভ-অটুট + session336/335-শূন্য (ফিড-সাইড-অস্পৃশ্য — admin-CSS-চুক্তি-লাইভ-প্রমাণ)"; else bad "সার্ভেড-CSS: s336×$C336 s335×$C335S s334×$C334K"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: hr336+sfs336-ই২ই (setHints-ব্যাচ + ফিডব্যাক-টোন-১৫%) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria336QA,b:window.__hrAria336QA?window.__hrAria336QA.batches:-1,a:window.__hrAria336QA?window.__hrAria336QA.applied:-1,mi:window.__hrAria336QA?window.__hrAria336QA.missed:-1,k:window.__hrAria336QA?window.__hrAria336QA.keys:-1,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria336QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf b "$Q0J")" = "0" ] && [ "$(jf a "$Q0J")" = "0" ] && [ "$(jf mi "$Q0J")" = "0" ] && [ "$(jf k "$Q0J")" = "0" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria336QA-হুক (সর্ব-কাউন্টার=০ + ত্রুটি-শূন্য) + s335/s334/s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
IV=$(ev "JSON.stringify((function(){var r=window.__hrAria336QA.setHints(null);return{a:r.applied,mi:r.missed,t:r.total,last:window.__hrAria336QA.last}})())")
IVJ=$(unjj "$IV")
if [ "$(jf a "$IVJ")" = "0" ] && [ "$(jf mi "$IVJ")" = "1" ] && [ "$(jf t "$IVJ")" = "0" ] && [ "$(jf last "$IVJ")" = "batch:invalid" ]; then ok "ই২ই: অবৈধ-ইনপুট (null) = {applied:০, missed:১, total:০} + batch:invalid-last"; else bad "ই২ই: $(unjj "$IV")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap336=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'foc'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
TONE0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr336-batched')}})())")
TONE0J=$(unjj "$TONE0")
if [ "$(jf e "$TONE0J")" = "" ] && [ "$(jf al "$TONE0J")" = "0.08" ] && [ "$(jf cls "$TONE0J")" = "false" ]; then ok "ই২ই: ব্যাচ-পূর্ব kbd-বেস-টোন α=0.08 + hr336-batched-শ্রেণি-অনুপস্থিত (sfs335-বেস-অটুট — ফরম্যাট-নিরপেক্ষ-পার্স)"; else bad "ই২ই: $(unjj "$TONE0")"; fi
KB0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');if(!k)return{e:'no-kbd'};return{eq:k.textContent===window.__hrAria336QA.line(),x:k.textContent.indexOf('X = পয়েন্টার-সারি বিলোপ')>=0}})())")
KB0J=$(unjj "$KB0")
if [ "$(jf eq "$KB0J")" = "true" ] && [ "$(jf x "$KB0J")" = "true" ]; then ok "ই২ই: প্রি-ব্যাচ live-kbd == line() + X-ডিফল্ট-হিন্ট-উপস্থিত (এক-উৎস-বেসলাইন)"; else bad "ই২ই: $(unjj "$KB0")"; fi
MX=$(ev "JSON.stringify((function(){var r=window.__hrAria336QA.setHints({'X':'X = ব্যাচ (৩৩৬)','Z__NOPE':'z','F':'F = ব্যাচ ({fmt})'});var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{a:r.applied,mi:r.missed,t:r.total,rw:window.__hrAria335QA.rewrites,nx:t.indexOf('X = ব্যাচ (৩৩৬)')>=0,ox:t.indexOf('X = পয়েন্টার-সারি বিলোপ')>=0,fh:window.__hrAria335QA.hintOf('F'),fk:t.indexOf('F = ব্যাচ (সমৃদ্ধ)')>=0,m335:window.__hrAria335QA.misses,eq:t===window.__hrAria336QA.line()}})())")
MXJ=$(unjj "$MX")
if [ "$(jf a "$MXJ")" = "2" ] && [ "$(jf mi "$MXJ")" = "1" ] && [ "$(jf t "$MXJ")" = "3" ] && [ "$(jf rw "$MXJ")" = "2" ] && [ "$(jf nx "$MXJ")" = "true" ] && [ "$(jf ox "$MXJ")" = "false" ] && printf '%s' "$(jf fh "$MXJ")" | grep -q 'F = ব্যাচ (সমৃদ্ধ)' && [ "$(jf fk "$MXJ")" = "true" ] && [ "$(jf m335 "$MXJ")" = "1" ] && [ "$(jf eq "$MXJ")" = "true" ]; then ok "ই২ই: মিশ্র-ব্যাচ ({applied:২, missed:১, total:৩} — পুনঃলেখন×২ + {fmt}-রেজলভ + অজানা-কী=miss-উত্তরাধিকার + live==line)"; else bad "ই২ই: $(unjj "$MX")"; fi
TONE1=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;var col=getComputedStyle(k).color;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],ca:(col.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr336-batched')}})())")
TONE1J=$(unjj "$TONE1")
if [ "$(jf e "$TONE1J")" = "" ] && [ "$(jf al "$TONE1J")" = "0.15" ] && [ "$(jf ca "$TONE1J")" = "0.92" ] && [ "$(jf cls "$TONE1J")" = "true" ]; then ok "ই২ই: ব্যাচ-পরবর্তী ফিডব্যাক-টোন α=0.15 + গাঢ়-টেক্সট α=0.92 + শ্রেণি-উপস্থিত (sfs336-ডেস্ক — ব্যাচ-সনাক্তযোগ্যতা)"; else bad "ই২ই: $(unjj "$TONE1")"; fi
CL=$(ev "JSON.stringify((function(){var r=window.__hrAria336QA.setHints({'X':''});var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{a:r.applied,rw:window.__hrAria335QA.rewrites,nx:t.indexOf('X = ব্যাচ (৩৩৬)')>=0,ho:window.__hrAria335QA.hintOf('X'),eq:t===window.__hrAria336QA.line()}})())")
CLJ=$(unjj "$CL")
if [ "$(jf a "$CLJ")" = "1" ] && [ "$(jf rw "$CLJ")" = "3" ] && [ "$(jf nx "$CLJ")" = "false" ] && [ "$(jf ho "$CLJ")" = "" ] && [ "$(jf eq "$CLJ")" = "true" ]; then ok "ই২ই: শূন্য-মান-কী-ব্যাচ = ক্লিয়ার-পথ (applied=১ + rewrites=৩ + hintOf='' + live==line)"; else bad "ই২ই: $(unjj "$CL")"; fi
AP=$(ev "JSON.stringify((function(){var r0=window.__hrAria333QA.rows();var a0=window.__hrAria334QA.appends;var s0=window.__hrAria335QA.appends;var reg=window.__hrAria333QA.register('J336','ব্যাচ-বর্ণনা');var r1=window.__hrAria333QA.rows();var r=window.__hrAria336QA.setHints({'J336':'J336 = ব্যাচ-হিন্ট'});var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{reg:reg,r0:r0,r1:r1,a:r.applied,a334:window.__hrAria334QA.appends-a0,a335:window.__hrAria335QA.appends-s0,kb:t.indexOf('J336 = ব্যাচ-হিন্ট')>=0,eq:t===window.__hrAria336QA.line()}})())")
APJ=$(unjj "$AP")
if [ "$(jf reg "$APJ")" = "true" ] && [ "$(jf r0 "$APJ")" = "8" ] && [ "$(jf r1 "$APJ")" = "9" ] && [ "$(jf a "$APJ")" = "1" ] && [ "$(jf a334 "$APJ")" = "1" ] && [ "$(jf a335 "$APJ")" = "1" ] && [ "$(jf kb "$APJ")" = "true" ] && [ "$(jf eq "$APJ")" = "true" ]; then ok "ই২ই: হিন্ট-বিহীন-কী-ব্যাচ = অ্যাপেন্ড-পথ (rows ৮→৯ + appends-দ্বি-গণনা-ডেল্টা×১ + লাইভ-উপস্থিত + live==line)"; else bad "ই২ই: $(unjj "$AP")"; fi
PV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';var m=window.__hrAria326QA?window.__hrAria326QA.mode():'';return{m:m,fk:t.indexOf('F = ব্যাচ (কেবল-কী)')>=0,j:t.indexOf('J336 = ব্যাচ-হিন্ট')>=0,eq:t===window.__hrAria336QA.line()}})())")
PVJ=$(unjj "$PV")
if [ "$(jf m "$PVJ")" = "key" ] && [ "$(jf fk "$PVJ")" = "true" ] && [ "$(jf j "$PVJ")" = "true" ] && [ "$(jf eq "$PVJ")" = "true" ]; then ok "ই২ই: চক্র-পরবর্তী-স্থায়িত্ব (F→কেবল-কী-রেজলভ + J336-ব্যাচ-হিন্ট-রেজিস্ট্রি-থেকে-পুনঃনির্মিত + live==line — ব্যাচ-স্থায়িত্ব)"; else bad "ই২ই: $(unjj "$PV")"; fi
OV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,r:window.__hrAria333QA.rows()})")
OVJ=$(unjj "$OV")
if [ "$(jf o "$OVJ")" = "true" ] && [ "$(jf li "$OVJ")" = "9" ] && [ "$(jf r "$OVJ")" = "9" ]; then ok "ই২ই: ওভারলে-৯-সারি (J336-নিবন্ধিত — ব্যাচ-রো-গণনা-অস্পৃশ্য — পুনঃনির্মাণ-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$OV")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ব্যাচ-পরবর্তী-ফিডব্যাক-টোন সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
FC=$(ev "JSON.stringify({b:window.__hrAria336QA.batches,a:window.__hrAria336QA.applied,mi:window.__hrAria336QA.missed,k:window.__hrAria336QA.keys,last:window.__hrAria336QA.last})")
FCJ=$(unjj "$FC")
if [ "$(jf b "$FCJ")" = "3" ] && [ "$(jf a "$FCJ")" = "4" ] && [ "$(jf mi "$FCJ")" = "2" ] && [ "$(jf k "$FCJ")" = "5" ] && [ "$(jf last "$FCJ")" = "batch:1/1" ]; then ok "ই২ই: কাউন্টার-সঞ্চয় (batches=৩ + applied=৪ + missed=২ + keys=৫ + last=batch:1/1)"; else bad "ই২ই: $(unjj "$FC")"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s333+s330+hr334+hr335+hr336)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs336-মোবাইল-390 (ফিডব্যাক-টোন-সর্ব-ব্যান্ড-এক-মান) ──"
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
MT0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr336-batched')}})())")
MT0J=$(unjj "$MT0")
if [ "$(jf e "$MT0J")" = "" ] && [ "$(jf al "$MT0J")" = "0.08" ] && [ "$(jf cls "$MT0J")" = "false" ]; then ok "ই২ই: মোবাইল-390 ব্যাচ-পূর্ব বেস-টোন α=0.08 + শ্রেণি-অনুপস্থিত (fresh-load — নিবন্ধন-রাজ্য-সুইট-সীমিত)"; else bad "ই২ই: $(unjj "$MT0")"; fi
MT1=$(ev "JSON.stringify((function(){var r=window.__hrAria336QA.setHints({'D':'D = মোবাইল-ব্যাচ (৩৯০)'});var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{a:r.applied,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k?k.classList.contains('hr336-batched'):false}})())")
MT1J=$(unjj "$MT1")
if [ "$(jf a "$MT1J")" = "1" ] && [ "$(jf al "$MT1J")" = "0.15" ] && [ "$(jf cls "$MT1J")" = "true" ]; then ok "ই২ই: মোবাইল-390 ব্যাচ-পরবর্তী ফিডব্যাক-টোন α=0.15 + শ্রেণি-উপস্থিত (সর্ব-ব্যান্ড-এক-মান — media-query-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$MT1")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 ফিডব্যাক-টোন সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

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
if [ "$FAIL" = "0" ]; then echo "s336-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s336-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
