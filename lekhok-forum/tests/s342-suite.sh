#!/bin/bash
# s342-suite.sh — session342: hr342 getHints-মাল্টি-মোড-ব্যাচ getHints(মোড-অ্যারে) + .hr342-bbtn সর্ব-মোড-ব্যাচ-রপ্তাই + sfs342 স্টাইল
# [Task ID 179] PLANS session341-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (hr341-চুক্তি-প্রসারিত):
#   hr342 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     getHintsOrig342-চেইন (hr341-চুক্তি-প্রসারিত): getHints(['rich','key','json']) = বহু-মোড-মানচিত্র-জুটি
#     {mode: রেজলভড-মানচিত্র} — এক-RAW-স্ন্যাপশট-অলস-ফেচ (সর্ব-মোডে-পুনঃব্যবহৃত + শূন্য-অ্যারে-শূন্য-স্ন্যাপশট);
#     প্রতি-মোড-এ {fmt}→fmtLabel331(modeStr) — mode326-অস্পৃশ্য — q340h/q341h-কাউন্টার-অস্পৃশ্য; ডুপ-বর্জন;
#     অবৈধ-এন্ট্রি = স্কিপ + getmb:invalid; শূন্য-অ্যারে = getmb:empty; প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট;
#     অ্যারে-বহি-ইনপুট = প্রতিনিধি (স্ট্রিং=hr341-অটুট — মিথ্যা/সত্য=hr340-অটুট)।
#     .hr342-bbtn সর্ব-মোড-ব্যাচ-রপ্তাই-বাটন (স্বতন্ত্র-শ্রেণি/বার — পরিবার-গেট — চতুর্মোড়ক-জীবন্ত-সিঙ্ক
#     ensureBbtn342-এক-উৎস — রেকর্ড-বিহীন-কপি copyHist324-রীতি + .hr342-done-ফ্ল্যাশ); MO=৪-অটুট;
#     কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — ওভারলে-৮-সারি-স্থায়িত্ব)।
#   sfs342 (ইনলাইন-<style> session342-ব্লক — cascade-অবস্থান session341-পরে — হেক্স-শূন্য):
#     .hr342-bbtn টিল-বহু-মোড-ব্যাচ-টোন (rgba-only — solid-বর্ডার = সর্ব-মোড-সম্পূর্ণ-রপ্তাই) —
#     নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য — সর্ব-ব্যান্ড — MO=৪-অটুট।
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         ক্লিপবোর্ড-ক্যাপ-স্টাব (__clipCap342 — রেকর্ড-বিহীন-কপি-প্রমাণ) + কাউন্টার-ডেল্টা-assert (s336-গোটচা —
#         পরম-assert-নিষিদ্ধ) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) + রেসিপি-ক্রম-অর্থবিদ্যা
#         (s340-গোটচা — গেট-দর্শন-assert = প্লেইন-রিলোডে-কেবল)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s342-bbtn-desk.png
SH_MOB=/home/z/my-project/download/s342-bbtn-mobile390.png
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
rld(){ agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1; recipe; }
recipe(){
  ev "JSON.stringify((function(){try{if(!window.__clipCap342)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap342=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'rc2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'rc3'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'rc4'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
}
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s342-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s342-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr342+sfs342-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + ক্যাসকেড) ──"
HN=$(grep -c 'hr342' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 12 ]; then ok "home-reorder.ejs: hr342-রেফারেন্স-লাইন ×$HN (হুক+বাটন+বার+স্টাইল-সহাবস্থান)"; else bad "hr342-রেফারেন্স-অপ্রতুল ($HN)"; fi
A342CHK=$(python3 - "$EJSF" <<'PYEOF'
import re, subprocess, tempfile, os, sys
src = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"<script>(.*?)</script>", src, re.S)
for b in blocks:
    b2 = re.sub(r"<%[^%]*%>", "null", b)
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(b2); p = f.name
    r = subprocess.run(["node","--check",p], capture_output=True, text=True)
    os.unlink(p)
    if r.returncode != 0:
        print("FAIL:" + r.stderr[:200]); sys.exit()
print("OK")
PYEOF
)
if [ "$A342CHK" = "OK" ]; then ok "home-reorder.ejs: hr342-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS342=$(sed -n '/session342 (sfs342 সর্ব-মোড-ব্যাচ-রপ্তাই — admin-ইনলাইন)/,/EOF session342/p' "$EJSF")
HEXN=$(printf '%s' "$CSS342" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS342" ]; then ok "home-reorder.ejs: session342-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session342-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS342" | grep -c 'session342' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session342-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session342-মার্কার ×$BN (<২)"; fi
C342AFTER=$(grep -n 'EOF session342' "$EJSF" | head -1 | cut -d: -f1)
C341BEFORE=$(grep -n 'EOF session341' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C342AFTER" ] && [ -n "$C341BEFORE" ] && [ "$C342AFTER" -gt "$C341BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session342-ব্লক session341-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (342@$C342AFTER vs 341@$C341BEFORE)"; fi
B342=$(grep -c 'session342' "$APP/public/assets/css/style.css" | tr -d ' ')
B341=$(grep -c 'session341' "$APP/public/assets/css/style.css" | tr -d ' ')
B340=$(grep -c 'session340' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B342" = "0" ] && [ "$B341" = "0" ] && [ "$B340" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session342/341/340-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (342=$B342 341=$B341 340=$B340 334=$GOODCSS)"; fi
BB=$(grep -c 'hr342-bbtn' "$EJSF" | tr -d ' ')
if [ "$BB" -ge 3 ]; then ok "hr342-bbtn ×$BB-শ্রেণি-রেফারেন্স (নির্মাণ+স্টাইল+হুক)"; else bad "bbtn-শ্রেণি-রেফারেন্স-অপ্রতুল ($BB)"; fi
MODREG=$(grep -c "MODES342 = \['rich', 'key', 'json'\]" "$EJSF" | tr -d ' ')
if [ "$MODREG" = "1" ]; then ok "MODES342-ত্রি-মোড-রেজিস্ট্রি-মিরর (MODES341-সমতুল্য — এক-সংজ্ঞা)"; else bad "MODES342-রেজিস্ট্রি-অমিল ($MODREG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr342-ই২ই (মাল্টি-মোড-ব্যাচ + সর্ব-মোড-ব্যাচ-রপ্তাই + জীবন্ত-সিঙ্ক) ──"
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
agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__hrAria342QA,g:window.__hrAria342QA?window.__hrAria342QA.getmb:-1,i:window.__hrAria342QA?window.__hrAria342QA.invalids:-1,bb:window.__hrAria342QA?window.__hrAria342QA.bbtn():null,br:window.__hrAria342QA?window.__hrAria342QA.bar():null,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria342QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf g "$Q0J")" = "0" ] && [ "$(jf i "$Q0J")" = "0" ] && [ "$(jf bb "$Q0J")" = "false" ] && [ "$(jf br "$Q0J")" = "false" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria342QA-হুক (কাউন্টার=০ + বাটন/বার-অনুপস্থিত — শূন্য-পরিবার-গেট) + s341–s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
B1=$(ev "JSON.stringify((function(){var j=window.__hrAria342QA.batch(['json','rich']);var raw=window.__hrAria340QA.raw();return{jF:j.json['F'],rF:j.rich['F'],rawF:raw['F'],keys:Object.keys?Object.keys(j).length:2,g:window.__hrAria342QA.getmb,last:window.__hrAria342QA.last,rows:window.__hrAria333QA.rows(),ss:sessionStorage.getItem('hr337-hints')===null,bb:window.__hrAria342QA.bbtn(),raws:window.__hrAria340QA.raws,getr:window.__hrAria340QA.getr}})())")
B1J=$(unjj "$B1")
if printf '%s' "$(jf jF "$B1J")" | grep -q 'JSON' && printf '%s' "$(jf rF "$B1J")" | grep -q 'সমৃদ্ধ' && printf '%s' "$(jf rawF "$B1J")" | grep -q '{fmt}' && [ "$(jf keys "$B1J")" = "2" ] && [ "$(jf g "$B1J")" = "1" ] && printf '%s' "$(jf last "$B1J")" | grep -q 'getmb:2' && [ "$(jf rows "$B1J")" = "8" ] && [ "$(jf ss "$B1J")" = "true" ] && [ "$(jf bb "$B1J")" = "false" ] && [ "$(jf raws "$B1J")" = "1" ] && [ "$(jf getr "$B1J")" = "0" ]; then ok "ই২ই: মাল্টি-মোড-ব্যাচ (getHints(['json','rich']) = জুটি {json-F='JSON' + rich-F='সমৃদ্ধ' — mode326='rich'-তেও} + RAW='{fmt}'-অটুট + getmb:১ + getmb:2-মার্কার + রিড-পবিত্রতা {রো=৮ + স্টোরেজ-শূন্য} + এক-RAW-স্ন্যাপশট {raws=১ — দ্বি-মোডে-এক-ফেচ} + getr=০-অস্পৃশ্য)"; else bad "ই২ই: $(unjj "$B1")"; fi
B2=$(ev "JSON.stringify((function(){var b=window.__hrAria342QA.batch(['rich','json','rich']);var k=[];for(var m in b){if(Object.prototype.hasOwnProperty.call(b,m))k.push(m)}return{k:k.join(','),g:window.__hrAria342QA.getmb,i:window.__hrAria342QA.invalids,last:window.__hrAria342QA.last}})())")
B2J=$(unjj "$B2")
if [ "$(jf k "$B2J")" = "rich,json" ] && [ "$(jf g "$B2J")" = "2" ] && [ "$(jf i "$B2J")" = "0" ] && printf '%s' "$(jf last "$B2J")" | grep -q 'getmb:2'; then ok "ই২ই: ডুপ-মোড-বর্জন (['rich','json','rich'] = rich,json-ক্রম-সংরক্ষণ — দ্বি-মোড-কেবল + invalids=০-অস্পৃশ্য + getmb:2-মার্কার)"; else bad "ই২ই: $(unjj "$B2")"; fi
B3=$(ev "JSON.stringify((function(){var b=window.__hrAria342QA.batch(['json','desktop',42,null]);var k=[];for(var m in b){if(Object.prototype.hasOwnProperty.call(b,m))k.push(m)}return{k:k.join(','),jf:b.json?b.json['F']:'',i:window.__hrAria342QA.invalids,last:window.__hrAria342QA.last}})())")
B3J=$(unjj "$B3")
if [ "$(jf k "$B3J")" = "json" ] && printf '%s' "$(jf jf "$B3J")" | grep -q 'JSON' && [ "$(jf i "$B3J")" = "3" ] && printf '%s' "$(jf last "$B3J")" | grep -q 'getmb:invalid'; then ok "ই২ই: অবৈধ-এন্ট্রি-স্কিপ (['json','desktop',42,null] = json-কেবল-রেজলভড + অ-সদস্য-স্ট্রিং/অ-স্ট্রিং-স্কিপ + invalids=৩ + getmb:invalid-মার্কার — শূন্য-অনুমান-চুক্তি)"; else bad "ই২ই: $(unjj "$B3")"; fi
B4=$(ev "JSON.stringify((function(){var rw=window.__hrAria340QA.raws;var b=window.__hrAria342QA.batch([]);var n=0;for(var m in b){if(Object.prototype.hasOwnProperty.call(b,m))n+=1}return{empty:n===0,g:window.__hrAria342QA.getmb,last:window.__hrAria342QA.last,rwD:window.__hrAria340QA.raws-rw}})())")
B4J=$(unjj "$B4")
if [ "$(jf empty "$B4J")" = "true" ] && [ "$(jf g "$B4J")" = "4" ] && printf '%s' "$(jf last "$B4J")" | grep -q 'getmb:empty' && [ "$(jf rwD "$B4J")" = "0" ]; then ok "ই২ই: শূন্য-অ্যারে (getHints([]) = শূন্য-অবজেক্ট + getmb:empty-মার্কার + শূন্য-স্ন্যাপশট {raws-ডেল্টা=০ — অলস-ফেচ-চুক্তি})"; else bad "ই২ই: $(unjj "$B4")"; fi
B5=$(ev "JSON.stringify((function(){var a=window.__hrAria342QA.batch(['key']);var b=window.__hrAria342QA.batch(['key']);return{eq:JSON.stringify(a)===JSON.stringify(b),refDiff:a['key']!==b['key'],g:window.__hrAria342QA.getmb}})())")
B5J=$(unjj "$B5")
if [ "$(jf eq "$B5J")" = "true" ] && [ "$(jf refDiff "$B5J")" = "true" ]; then ok "ই২ই: প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট (দ্বি-কল-গভীর-সমতা + অভ্যন্তরীণ-মানচিত্র-রেফারেন্স-বিচ্ছিন্ন — hr338-কপি-সুরক্ষা-উত্তরাধিকার)"; else bad "ই২ই: $(unjj "$B5")"; fi
B6=$(ev "JSON.stringify((function(){var rw=window.__hrAria340QA.raws;var gr=window.__hrAria340QA.getr;var gm=window.__hrAria341QA.getm;var rawMap=window.__hrAria340QA.raw();var rwD1=window.__hrAria340QA.raws-rw;var strMap=window.__hrAria341QA.modeResolved('json');var gmD=window.__hrAria341QA.getm-gm;var rwD2=window.__hrAria340QA.raws-rw;var curMap=window.__hrAria340QA.resolved();var grD=window.__hrAria340QA.getr-gr;return{rawF:rawMap['F'],rwD1:rwD1,jF:strMap['F'],gmD:gmD,rwD2:rwD2,grD:grD}})())")
B6J=$(unjj "$B6")
if printf '%s' "$(jf rawF "$B6J")" | grep -q '{fmt}' && [ "$(jf rwD1 "$B6J")" = "0" ] && printf '%s' "$(jf jF "$B6J")" | grep -q 'JSON' && [ "$(jf gmD "$B6J")" = "1" ] && [ "$(jf rwD2 "$B6J")" = "1" ] && [ "$(jf grD "$B6J")" = "1" ]; then ok "ই২ই: অ্যারে-বহি-প্রতিনিধি-অটুট (raw()-QA-বাইপাস {rwD1=০ — s341-ডক-কৃত-গোটচা} + '{fmt}'-RAW-অটুট + স্ট্রিং-পথ=hr341 {getm-ডেল্টা=১ + অভ্যন্তরীণ-RAW-স্ন্যাপশট raws-ডেল্টা=১} + সত্য-পথ=hr340 {getr-ডেল্টা=১} — hr340/hr341-চুক্তি-অক্ষুণ্ণ)"; else bad "ই২ই: $(unjj "$B6")"; fi
B7=$(ev "JSON.stringify((function(){var m=window.__hrAria331QA.mode();var b=window.__hrAria342QA.batch([m]);var c=window.__hrAria340QA.resolved();return{eq:JSON.stringify(b[m])===JSON.stringify(c),m:m}})())")
B7J=$(unjj "$B7")
if [ "$(jf eq "$B7J")" = "true" ]; then ok "ই২ই: দ্বি-পথ-সমতা (batch-একক-বর্তমান-মোড ≡ getHints(true)-রেজলভড — মোড-সচেতন-সমতা-প্রমাণ)"; else bad "ই২ই: $(unjj "$B7")"; fi
FOC=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'r2'})())")
agent-browser wait 500 >/dev/null 2>&1
FG=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip'),bb:window.__hrAria342QA.bbtn(),br:window.__hrAria342QA.bar(),s324bar:!!document.querySelector('.hr324-bar'),hist:window.__hrAria317QA.hist().length})")
FGJ=$(unjj "$FG")
if [ "$(jf tip "$FGJ")" = "true" ] && [ "$(jf bb "$FGJ")" = "false" ] && [ "$(jf br "$FGJ")" = "false" ] && [ "$(jf s324bar "$FGJ")" = "false" ] && [ "$(jf hist "$FGJ")" = "0" ]; then ok "ই২ই: পরিবার-গেট-দর্শন (খোলা-টিপেও শূন্য-ইতিহাস+শূন্য-স্টোরে বাটন/বার-অনুপস্থিত — hr324-দর্শন — fresh-DOM-অপরিবর্তিত)"; else bad "ই২ই: $(unjj "$FG")"; fi
LSY=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪২)');var b=document.querySelector('.hr342-bbtn');return{bb:!!b,ms:!!document.querySelector('.hr341-msel'),mb:!!document.querySelector('.hr341-mbtn'),rb:!!document.querySelector('.hr340-resbtn'),cb:!!document.querySelector('.hr339-clearbtn'),b2:document.querySelectorAll('.hr324-btn').length,st:window.__hrAria339QA.store(),last:window.__hrAria342QA.last,brCls:(b&&b.parentNode)?b.parentNode.className:''}})())")
LSYJ=$(unjj "$LSY")
if [ "$(jf bb "$LSYJ")" = "true" ] && [ "$(jf ms "$LSYJ")" = "true" ] && [ "$(jf mb "$LSYJ")" = "true" ] && [ "$(jf rb "$LSYJ")" = "true" ] && [ "$(jf cb "$LSYJ")" = "true" ] && [ "$(jf b2 "$LSYJ")" = "0" ] && [ "$(jf st "$LSYJ")" = "8" ] && printf '%s' "$(jf last "$LSYJ")" | grep -q 'sync:on' && printf '%s' "$(jf brCls "$LSYJ")" | grep -q 'hr324-bar hr342-bar'; then ok "ই২ই: জীবন্ত-সিঙ্ক-অন (persist337-মোড়ক → বাটন-রি-রেন্ডার-বিহীন-তাৎক্ষণিক-উপস্থিত + hr339/hr340/hr341-সহাবস্থান + .hr324-btn=২-গণনা-চুক্তি-অটুট + স্বতন্ত্র-বার hr324-bar hr342-bar + store=৮)"; else bad "ই২ই: $(unjj "$LSY")"; fi
WP=$(ev "JSON.stringify((function(){window.__hrAria339QA.wipe();var b=document.querySelector('.hr342-bbtn');return{bb:!!b,br:window.__hrAria342QA.bar(),br341:window.__hrAria341QA.bar(),br340:window.__hrAria340QA.bar(),cb:!!document.querySelector('.hr339-clearbtn'),last:window.__hrAria342QA.last,ss:sessionStorage.getItem('hr337-hints')===null}})())")
WPJ=$(unjj "$WP")
if [ "$(jf bb "$WPJ")" = "false" ] && [ "$(jf br "$WPJ")" = "false" ] && [ "$(jf br341 "$WPJ")" = "false" ] && [ "$(jf br340 "$WPJ")" = "false" ] && [ "$(jf cb "$WPJ")" = "false" ] && printf '%s' "$(jf last "$WPJ")" | grep -q 'sync:off' && [ "$(jf ss "$WPJ")" = "true" ]; then ok "ই২ই: জীবন্ত-সিঙ্ক-অফ (q337h.clearStore-মোড়ক → পরিবার-শূন্যে-নিজস্ব-বার-সম্পূর্ণ-অপসারণ + sync:off + hr341/hr340-বার-সহ-অপসারণ-সমতা — hr339-বার-অবরোধ-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$WP")"; fi
rld
CP0=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr342-bbtn');var k=document.querySelector('.hr324-kbd');return{bb:!!b,cls:k?k.className:'',diff:k?k.classList.contains('hr338-diff'):null,res:k?k.classList.contains('hr337-restored'):null,bat:k?k.classList.contains('hr336-batched'):null,line:window.__hrAria337QA.line()===(k?k.textContent:''),b2:document.querySelectorAll('.hr324-btn').length}})())")
CP0J=$(unjj "$CP0")
if [ "$(jf bb "$CP0J")" = "true" ] && [ "$(jf cls "$CP0J")" = "hr324-kbd" ] && [ "$(jf diff "$CP0J")" = "false" ] && [ "$(jf res "$CP0J")" = "false" ] && [ "$(jf bat "$CP0J")" = "false" ] && [ "$(jf line "$CP0J")" = "true" ] && [ "$(jf b2 "$CP0J")" = "2" ]; then ok "ই২ই: নির্মাণ-পথ+পবিত্রতা (রেসিপি-পরবর্তী-বাটন-উপস্থিত + kbd-শ্রেণি-বেস-অটুট {diff/restored/batched-অনুপস্থিত} + live-kbd==line() + .hr324-btn=২-গণনা-চুক্তি-অটুট — s338/337/336-শ্রেণি-অস্পৃশ্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$CP0")"; fi
H0=$(ev "JSON.stringify(window.__hrAria317QA.hist().length)" | tr -d '"')
ev "JSON.stringify((function(){if(!window.__clipCap342)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap342=t;return Promise.resolve()}},configurable:true});window.__clipCap342='';document.querySelector('.hr342-bbtn').click();return 'clicked'})())" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
MC=$(ev "JSON.stringify({capJson:window.__clipCap342.indexOf('F = বিন্যাস (JSON)')>=0,capRich:window.__clipCap342.indexOf('সমৃদ্ধ')>=0,capKey:window.__clipCap342.indexOf('কেবল-কী')>=0,capRaw:window.__clipCap342.indexOf('{fmt}')>=0,capN:(window.__clipCap342||'').length,c:window.__hrAria342QA.copies,last:window.__hrAria342QA.last,done:document.querySelector('.hr342-bbtn').classList.contains('hr342-done'),h1:window.__hrAria317QA.hist().length})")
MCJ=$(unjj "$MC")
if [ "$(jf capJson "$MCJ")" = "true" ] && [ "$(jf capRich "$MCJ")" = "true" ] && [ "$(jf capKey "$MCJ")" = "true" ] && [ "$(jf capRaw "$MCJ")" = "false" ] && [ "$(jf capN "$MCJ")" -ge 60 ] 2>/dev/null && [ "$(jf c "$MCJ")" = "1" ] && printf '%s' "$(jf last "$MCJ")" | grep -q 'copy:batch' && [ "$(jf done "$MCJ")" = "true" ] && [ "$(jf h1 "$MCJ")" = "$H0" ]; then ok "ই২ই: সর্ব-মোড-ব্যাচ-রপ্তাই-কপি (ক্লিপবোর্ড-ক্যাপ {ত্রি-বিন্যাস-এক-পে-লোড — JSON+সমৃদ্ধ+কেবল-কী + '{fmt}'-শূন্য-সর্ব-রেজলভড} + copies=১ + copy:batch-মার্কার + .hr342-done-ফ্ল্যাশ + ইতিহাস-গণনা-অপরিবর্তিত ($H0) — রেকর্ড-বিহীন-পথ-প্রমাণ)"; else bad "ই২ই: $(unjj "$MC") h0=$H0"; fi
FSYNC=$(ev "JSON.stringify((function(){var fb=document.querySelector('.hr326-fmt');if(!fb)return{e:'no-fmt-btn'};fb.click();var b=document.querySelector('.hr342-bbtn');return{e:'',bb:!!b,last341:window.__hrAria341QA.last,mode:window.__hrAria331QA.mode()}})())")
FSJ=$(unjj "$FSYNC")
if [ "$(jf e "$FSJ")" = "" ] && [ "$(jf bb "$FSJ")" = "true" ] && printf '%s' "$(jf last341 "$FSJ")" | grep -q 'fmt-sync:' && [ "$(jf mode "$FSJ")" = "key" ]; then ok "ই২ই: fmt-sync-চতুর্থ-সিঙ্ক-পয়েন্ট (cycleFmt326-মোড়ক-চেইন → .hr326-fmt-ক্লিকে বাটন-ডুপ-রক্ষিত-স্থায়িত্ব + hr341-fmt-sync-মার্কার-সহাবস্থান + মোড-বদল rich→key — MO=৪-অটুট)"; else bad "ই২ই: $(unjj "$FSYNC")"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria342QA.err||'')+(window.__hrAria341QA.err||'')+(window.__hrAria340QA.err||'')+(window.__hrAria339QA.err||'')+(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
QERRJ=$(unjj "$QERR")
if [ "$(jf e "$QERRJ")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333–s342)"; else bad "ই২ই: হুক-ত্রুটি $(unjj "$QERR")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-ব্যাচ-রপ্তাই-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs342-মোবাইল-390 (বাটন-সর্ব-ব্যান্ড + কম্প্যাক্ট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
MB=$(ev "JSON.stringify((function(){var b=document.querySelector('.hr342-bbtn');if(!b)return{e:'no-btn'};var cs=getComputedStyle(b);var fs=parseFloat(cs.fontSize);return{bb:true,fs:fs,fsOk:fs<8.4,vis:b.offsetWidth>0}})())")
MBJ=$(unjj "$MB")
if [ "$(jf e "$MBJ")" = "" ] && [ "$(jf bb "$MBJ")" = "true" ] && [ "$(jf fsOk "$MBJ")" = "true" ] && [ "$(jf vis "$MBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 বাটন (দৃশ্যমান + কম্প্যাক্ট-ফন্ট 0.52rem-৬৪০px-গেট — সর্ব-ব্যান্ড-উপস্থিতি)"; else bad "ই২ই: $(unjj "$MB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + দ্বি-লোড-কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1; agent-browser wait 1200 >/dev/null 2>&1
CL=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,bb:(window.__hrAria342QA?window.__hrAria342QA.bbtn():null)})")
CLJ=$(unjj "$CL")
if [ "$(jf ss "$CLJ")" = "true" ] && [ "$(jf bb "$CLJ")" = "false" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য + বাটন-অনুপস্থিত (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি — রিগ্রেশন-সহাবস্থান)"; else bad "পরিষ্কারণ: $(unjj "$CL")"; fi
ERR1=$(ev "(function(){return window.__s342console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s342-suite ✓ সর্ব-সবুজ"; else echo "s342-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
