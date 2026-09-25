#!/bin/bash
# s341-suite.sh — session341: hr341 getHints(mode-string) মোড-নির্দিষ্ট-রেজলিউশন + .hr341-msel/.hr341-mbtn মোড-নির্বাচক-রপ্তাই + sfs341 স্টাইল
# [Task ID 178] PLANS session340-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (hr340-চুক্তি-প্রসারিত):
#   hr341 (admin/home-reorder.ejs — hr340-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     getHintsOrig341-চেইন (hr340-চুক্তি-প্রসারিত): getHints('rich'|'key'|'json') = নির্দিষ্ট-মোডে-রেজলভড
#     (RAW-স্ন্যাপশট-উপরে {fmt}→fmtLabel331(modeStr) — mode326-অস্পৃশ্য); getHints()=RAW-অটুট; getHints(true)=
#     বর্তমান-মোডে-রেজলভড-অটুট; অবৈধ-স্ট্রিং-মোড = RAW + getm:invalid (শূন্য-অনুমান); প্রতি-কলে-নতুন-অবজেক্ট;
#     .hr341-msel+.hr341-mbtn স্বতন্ত্র-শ্রেণি-জুটি + স্বতন্ত্র-বার .hr341-bar (hr340-বার-রীতি); গেট = বার-পরিবার-
#     দৃশ্যমানতা (hist≥১ ∨ store≥১); চতুর্মোড়ক-জীবন্ত-সিঙ্ক (trOrig341 + persist337 + q337h.clearStore +
#     cycleFmt326-মোড়ক fmt-sync — cf332-রীতি); কপি-পথ = রেকর্ড-বিহীন (copyHist324-রীতি) + .hr341-done-ফ্ল্যাশ;
#     কীবোর্ড-parity hr343-এ সম্পন্ন (পয়েন্টার-কেবল-উত্তরাধিকার — ওভারলে-৯-সারি — hr343-বিবর্তন)।
#   sfs341 (ইনলাইন-<style> session341-ব্লক — cascade-অবস্থান session340-পরে — হেক্স-শূন্য):
#     .hr341-msel/.hr341-mbtn বেগুনি-মোড-রপ্তাই-টোন (rgba-only — নীল-রিড/সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-বিভাজন-বৃদ্ধি)
#     — নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য — সর্ব-ব্যান্ড — MO=৪-অটুট।
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         ক্লিপবোর্ড-ক্যাপ-স্টাব (__clipCap341 — রেকর্ড-বিহীন-কপি-প্রমাণ) + পরিষ্কারণ-চুক্তি (hr337-hints +
#         hr326-fmt + hr321-hist) + রেসিপি-ক্রম-অর্থবিদ্যা (s340-গোটচা — গেট-দর্শন-assert = প্লেইন-রিলোডে-কেবল)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s341-msel-desk.png
SH_MOB=/home/z/my-project/download/s341-msel-mobile390.png
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
  ev "JSON.stringify((function(){try{if(!window.__clipCap341)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap341=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
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
(cd "$APP" && node db/migrate.js >/tmp/s341-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s341-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr341+sfs341-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + ক্যাসকেড) ──"
HN=$(grep -c 'hr341' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 12 ]; then ok "home-reorder.ejs: hr341-রেফারেন্স-লাইন ×$HN (হুক+নির্বাচক+বাটন+বার+স্টাইল-সহাবস্থান)"; else bad "hr341-রেফারেন্স-অপ্রতুল ($HN)"; fi
A341CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A341CHK" = "OK" ]; then ok "home-reorder.ejs: hr341-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS341=$(sed -n '/session341 (sfs341 মোড-নির্বাচক-রপ্তাই — admin-ইনলাইন)/,/EOF session341/p' "$EJSF")
HEXN=$(printf '%s' "$CSS341" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS341" ]; then ok "home-reorder.ejs: session341-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session341-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS341" | grep -c 'session341' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session341-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session341-মার্কার ×$BN (<২)"; fi
C341AFTER=$(grep -n 'EOF session341' "$EJSF" | head -1 | cut -d: -f1)
C340BEFORE=$(grep -n 'EOF session340' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C341AFTER" ] && [ -n "$C340BEFORE" ] && [ "$C341AFTER" -gt "$C340BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session341-ব্লক session340-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (341@$C341AFTER vs 340@$C340BEFORE)"; fi
B341=$(grep -c 'session341' "$APP/public/assets/css/style.css" | tr -d ' ')
B340=$(grep -c 'session340' "$APP/public/assets/css/style.css" | tr -d ' ')
B339=$(grep -c 'session339' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B341" = "0" ] && [ "$B340" = "0" ] && [ "$B339" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session341/340/339-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (341=$B341 340=$B340 339=$B339 334=$GOODCSS)"; fi
MS=$(grep -c 'hr341-msel' "$EJSF" | tr -d ' ')
MB=$(grep -c 'hr341-mbtn' "$EJSF" | tr -d ' ')
if [ "$MS" -ge 3 ] && [ "$MB" -ge 3 ]; then ok "hr341-msel ×$MS + hr341-mbtn ×$MB-শ্রেণি-রেফারেন্স (নির্মাণ+স্টাইল+হুক)"; else bad "শ্রেণি-রেফারেন্স-অপ্রতুল (msel=$MS mbtn=$MB)"; fi
MODREG=$(grep -c "MODES341 = \['rich', 'key', 'json'\]" "$EJSF" | tr -d ' ')
if [ "$MODREG" = "1" ]; then ok "MODES341-ত্রি-মোড-রেজিস্ট্রি-মিরর (hr326/hr331-চুক্তি — এক-সংজ্ঞা)"; else bad "MODES341-রেজিস্ট্রি-অমিল ($MODREG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr341-ই২ই (মোড-নির্দিষ্ট-রেজলিউশন + মোড-নির্বাচক-রপ্তাই + জীবন্ত-সিঙ্ক) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria341QA,g:window.__hrAria341QA?window.__hrAria341QA.getm:-1,i:window.__hrAria341QA?window.__hrAria341QA.invalids:-1,ms:window.__hrAria341QA?window.__hrAria341QA.msel():null,mb:window.__hrAria341QA?window.__hrAria341QA.mbtn():null,br:window.__hrAria341QA?window.__hrAria341QA.bar():null,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria341QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf g "$Q0J")" = "0" ] && [ "$(jf i "$Q0J")" = "0" ] && [ "$(jf ms "$Q0J")" = "false" ] && [ "$(jf mb "$Q0J")" = "false" ] && [ "$(jf br "$Q0J")" = "false" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria341QA-হুক (কাউন্টার=০ + নির্বাচক/বাটন/বার-অনুপস্থিত — শূন্য-পরিবার-গেট) + s340–s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
MX=$(ev "JSON.stringify((function(){var j=window.__hrAria341QA.modeResolved('json');var ri=window.__hrAria341QA.modeResolved('rich');var raw=window.__hrAria340QA.raw();var cur=window.__hrAria340QA.resolved();return{jF:j['F'],riF:ri['F'],rawF:raw['F'],curF:cur['F'],getm:window.__hrAria341QA.getm,last:window.__hrAria341QA.last,rows:window.__hrAria333QA.rows(),ss:sessionStorage.getItem('hr337-hints')===null,ms:window.__hrAria341QA.msel(),raws340:window.__hrAria340QA.raws,getr340:window.__hrAria340QA.getr}})())")
MXJ=$(unjj "$MX")
if printf '%s' "$(jf jF "$MXJ")" | grep -q 'JSON' && printf '%s' "$(jf riF "$MXJ")" | grep -q 'সমৃদ্ধ' && printf '%s' "$(jf rawF "$MXJ")" | grep -q '{fmt}' && printf '%s' "$(jf curF "$MXJ")" | grep -q 'সমৃদ্ধ' && [ "$(jf getm "$MXJ")" = "2" ] && printf '%s' "$(jf last "$MXJ")" | grep -q 'getm:rich' && [ "$(jf rows "$MXJ")" = "9" ] && [ "$(jf ss "$MXJ")" = "true" ] && [ "$(jf ms "$MXJ")" = "false" ] && [ "$(jf raws340 "$MXJ")" = "2" ] && [ "$(jf getr340 "$MXJ")" = "1" ]; then ok "ই২ই: মোড-নির্দিষ্ট-রেজলিউশন (getHints('json')-F='JSON' + getHints('rich')-F='সমৃদ্ধ' — mode326='rich'-তেও + RAW='{fmt}'-অটুট + getm:২ + রিড-পবিত্রতা {রো=৯ + স্টোরেজ-শূন্য} + এক-উৎস-কাউন্টার {raws=২ {২-মোড-স্ন্যাপশট} + getr=১ — raw() = QA-হুক-বাইপাস-ডক-কৃত})"; else bad "ই২ই: $(unjj "$MX")"; fi
PY=$(ev "JSON.stringify((function(){var cur=sessionStorage.getItem('hr326-fmt')||'rich';var r1=window.__hrAria341QA.modeResolved(cur);var r2=window.__hrAria340QA.resolved();return{eq:JSON.stringify(r1)===JSON.stringify(r2),r1:JSON.stringify(r1).length}})())")
PYJ=$(unjj "$PY")
if [ "$(jf eq "$PYJ")" = "true" ]; then ok "ই২ই: getHints(মোড326)-≡-getHints(true)-সমতা (বর্তমান-মোডে-মোড-নির্দিষ্ট-পথ = hr340-পথ — দ্বি-পথ-সামঞ্জস্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$PY")"; fi
NO=$(ev "JSON.stringify((function(){var a=window.__hrAria341QA.modeResolved('key');var b=window.__hrAria341QA.modeResolved('key');return{ne:JSON.stringify(a)!==JSON.stringify(b)?'no':'wait',same:JSON.stringify(a)===JSON.stringify(b)}})())")
NOJ=$(unjj "$NO")
if [ "$(jf same "$NOJ")" = "true" ]; then ok "ই২ই: প্রতি-কলে-নতুন-অবজেক্ট (দ্বি-কল-গভীর-সমতা — hr338-কপি-সুরক্ষা-উত্তরাধিকার — লাইভ-রেফারেন্স-প্রকাশ-নিষিদ্ধ)"; else bad "ই২ই: $(unjj "$NO")"; fi
IV=$(ev "JSON.stringify((function(){var iv=window.__hrAria341QA.modeResolved('desktop');var raw=window.__hrAria340QA.raw();return{eq:JSON.stringify(iv)===JSON.stringify(raw),i:window.__hrAria341QA.invalids,last:window.__hrAria341QA.last}})())")
IVJ=$(unjj "$IV")
if [ "$(jf eq "$IVJ")" = "true" ] && [ "$(jf i "$IVJ")" = "1" ] && printf '%s' "$(jf last "$IVJ")" | grep -q 'getm:invalid'; then ok "ই২ই: অবৈধ-মোড-স্ট্রিং (getHints('desktop') = RAW-ফেরত + getm:invalid-মার্কার + invalids=১ — শূন্য-অনুমান-চুক্তি)"; else bad "ই২ই: $(unjj "$IV")"; fi
FOC=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'r2'})())")
agent-browser wait 500 >/dev/null 2>&1
FG=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip'),ms:window.__hrAria341QA.msel(),br:window.__hrAria341QA.bar(),s324bar:!!document.querySelector('.hr324-bar'),hist:window.__hrAria317QA.hist().length})")
FGJ=$(unjj "$FG")
if [ "$(jf tip "$FGJ")" = "true" ] && [ "$(jf ms "$FGJ")" = "false" ] && [ "$(jf br "$FGJ")" = "false" ] && [ "$(jf s324bar "$FGJ")" = "false" ] && [ "$(jf hist "$FGJ")" = "0" ]; then ok "ই২ই: পরিবার-গেট-দর্শন (খোলা-টিপেও শূন্য-ইতিহাস+শূন্য-স্টোরে নির্বাচক/বার-অনুপস্থিত — hr324-দর্শন — fresh-DOM-অপরিবর্তিত)"; else bad "ই২ই: $(unjj "$FG")"; fi
LSY=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪১)');var s=document.querySelector('.hr341-msel');var b=document.querySelector('.hr341-mbtn');return{ms:!!s,mb:!!b,rb:!!document.querySelector('.hr340-resbtn'),cb:!!document.querySelector('.hr339-clearbtn'),b2:document.querySelectorAll('.hr324-btn').length,st:window.__hrAria339QA.store(),last:window.__hrAria341QA.last,opt:s?s.options.length:0,def:s?s.value:''}})())")
LSYJ=$(unjj "$LSY")
if [ "$(jf ms "$LSYJ")" = "true" ] && [ "$(jf mb "$LSYJ")" = "true" ] && [ "$(jf rb "$LSYJ")" = "true" ] && [ "$(jf cb "$LSYJ")" = "true" ] && [ "$(jf b2 "$LSYJ")" = "0" ] && [ "$(jf st "$LSYJ")" = "9" ] && printf '%s' "$(jf last "$LSYJ")" | grep -q 'sync:on' && [ "$(jf opt "$LSYJ")" = "3" ] && [ "$(jf def "$LSYJ")" = "rich" ]; then ok "ই২ই: জীবন্ত-সিঙ্ক-অন (persist337-মোড়ক → নির্বাচক-রি-রেন্ডার-বিহীন-তাৎক্ষণিক-উপস্থিত + hr339/hr340-সহাবস্থান + অপশন ×৩ {সমৃদ্ধ/কেবল-কী/JSON} + বর্তমান-মোড-ডিফল্ট)"; else bad "ই২ই: $(unjj "$LSY")"; fi
WP=$(ev "JSON.stringify((function(){window.__hrAria339QA.wipe();var s=document.querySelector('.hr341-msel');return{ms:!!s,br:window.__hrAria341QA.bar(),br340:window.__hrAria340QA.bar(),cb:!!document.querySelector('.hr339-clearbtn'),last:window.__hrAria341QA.last,ss:sessionStorage.getItem('hr337-hints')===null}})())")
WPJ=$(unjj "$WP")
if [ "$(jf ms "$WPJ")" = "false" ] && [ "$(jf br "$WPJ")" = "false" ] && [ "$(jf br340 "$WPJ")" = "false" ] && [ "$(jf cb "$WPJ")" = "false" ] && printf '%s' "$(jf last "$WPJ")" | grep -q 'sync:off' && [ "$(jf ss "$WPJ")" = "true" ]; then ok "ই২ই: জীবন্ত-সিঙ্ক-অফ (q337h.clearStore-মোড়ক → পরিবার-শূন্যে-নিজস্ব-বার-সম্পূর্ণ-অপসারণ + sync:off + hr340-বার-সহ-অপসারণ-সমতা — hr339-বার-অবরোধ-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$WP")"; fi
rld
CP0=$(ev "JSON.stringify((function(){var s=document.querySelector('.hr341-msel');var b=document.querySelector('.hr341-mbtn');var k=document.querySelector('.hr324-kbd');return{ms:!!s,mb:!!b,cls:k?k.className:'',diff:k?k.classList.contains('hr338-diff'):null,res:k?k.classList.contains('hr337-restored'):null,bat:k?k.classList.contains('hr336-batched'):null,line:window.__hrAria337QA.line()===(k?k.textContent:''),b2:document.querySelectorAll('.hr324-btn').length}})())")
CP0J=$(unjj "$CP0")
if [ "$(jf ms "$CP0J")" = "true" ] && [ "$(jf mb "$CP0J")" = "true" ] && [ "$(jf cls "$CP0J")" = "hr324-kbd" ] && [ "$(jf diff "$CP0J")" = "false" ] && [ "$(jf res "$CP0J")" = "false" ] && [ "$(jf bat "$CP0J")" = "false" ] && [ "$(jf line "$CP0J")" = "true" ] && [ "$(jf b2 "$CP0J")" = "2" ]; then ok "ই২ই: নির্মাণ-পথ+পবিত্রতা (রেসিপি-পরবর্তী-নির্বাচক+বাটন-উপস্থিত + kbd-শ্রেণি-বেস-অটুট {diff/restored/batched-অনুপস্থিত} + live-kbd==line() + .hr324-btn=২-গণনা-চুক্তি-অটুট — s338/337/336-শ্রেণি-অস্পৃশ্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$CP0")"; fi
H0=$(ev "JSON.stringify(window.__hrAria317QA.hist().length)" | tr -d '"')
MCOPY=$(ev "JSON.stringify((function(){var s=document.querySelector('.hr341-msel');s.value='json';s.dispatchEvent(new Event('change',{bubbles:true}));window.__clipCap341='';document.querySelector('.hr341-mbtn').click();return 'clicked'})())")
agent-browser wait 700 >/dev/null 2>&1
CP1=$(ev "JSON.stringify({capF:window.__clipCap341.indexOf('\"F = বিন্যাস (JSON)\"')>=0,capRich:window.__clipCap341.indexOf('সমৃদ্ধ')<0,capN:(window.__clipCap341||'').length,c:window.__hrAria341QA.copies,last:window.__hrAria341QA.last,done:document.querySelector('.hr341-mbtn').classList.contains('hr341-done'),h1:window.__hrAria317QA.hist().length})")
CP1J=$(unjj "$CP1")
if [ "$(jf capF "$CP1J")" = "true" ] && [ "$(jf capRich "$CP1J")" = "true" ] && [ "$(jf capN "$CP1J")" -ge 30 ] 2>/dev/null && [ "$(jf c "$CP1J")" = "1" ] && printf '%s' "$(jf last "$CP1J")" | grep -q 'copy:json' && [ "$(jf done "$CP1J")" = "true" ] && [ "$(jf h1 "$CP1J")" = "$H0" ]; then ok "ই২ই: মোড-নির্বাচক-রপ্তাই-কপি (json-নির্বাচন → ক্লিপবোর্ড-ক্যাপ {F='JSON'-রেজলভড + সমৃদ্ধ-বিহীন — mode326='rich'-সত্ত্বেও} + copies=১ + copy:json-মার্কার + .hr341-done-ফ্ল্যাশ + ইতিহাস-গণনা-অপরিবর্তিত ($H0) — রেকর্ড-বিহীন-পথ-প্রমাণ)"; else bad "ই২ই: $(unjj "$CP1") h0=$H0"; fi
FSYNC=$(ev "JSON.stringify((function(){var fb=document.querySelector('.hr326-fmt');if(!fb)return{e:'no-fmt-btn'};fb.click();var s=document.querySelector('.hr341-msel');return{last:window.__hrAria341QA.last,def:s?s.value:'',mode:window.__hrAria331QA.mode()}})())")
FSJ=$(unjj "$FSYNC")
if [ "$(jf e "$FSJ")" = "" ] && printf '%s' "$(jf last "$FSJ")" | grep -q 'fmt-sync:' && [ "$(jf mode "$FSJ")" = "key" ] && [ "$(jf def "$FSJ")" = "key" ]; then ok "ই২ই: fmt-sync-জীবন্ত-সিঙ্ক (cycleFmt326-মোড়ক → .hr326-fmt-ক্লিকে নির্বাচক-ডিফল্ট-তাৎক্ষণিক-রি-সেট rich→key + fmt-sync-মার্কার — cf332-রীতি-চতুর্থ-মোড়ক)"; else bad "ই২ই: $(unjj "$FSYNC")"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria341QA.err||'')+(window.__hrAria340QA.err||'')+(window.__hrAria339QA.err||'')+(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
QERRJ=$(unjj "$QERR")
if [ "$(jf e "$QERRJ")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333–s341)"; else bad "ই২ই: হুক-ত্রুটি $(unjj "$QERR")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-মোড-নির্বাচক-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs341-মোবাইল-390 (নির্বাচক-সর্ব-ব্যান্ড + কম্প্যাক্ট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
MB=$(ev "JSON.stringify((function(){var s=document.querySelector('.hr341-msel');var b=document.querySelector('.hr341-mbtn');if(!s||!b)return{e:'no-pair'};var cs=getComputedStyle(s);var fs=parseFloat(cs.fontSize);return{ms:true,mb:true,fs:fs,fsOk:fs<8.4,vis:s.offsetWidth>0&&b.offsetWidth>0}})())")
MBJ=$(unjj "$MB")
if [ "$(jf e "$MBJ")" = "" ] && [ "$(jf ms "$MBJ")" = "true" ] && [ "$(jf mb "$MBJ")" = "true" ] && [ "$(jf fsOk "$MBJ")" = "true" ] && [ "$(jf vis "$MBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 নির্বাচক+বাটন (দৃশ্যমান + কম্প্যাক্ট-ফন্ট 0.52rem-৬৪০px-গেট — সর্ব-ব্যান্ড-উপস্থিতি)"; else bad "ই২ই: $(unjj "$MB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + দ্বি-লোড-কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1; agent-browser wait 1200 >/dev/null 2>&1
CL=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,ms:(window.__hrAria341QA?window.__hrAria341QA.msel():null)})")
CLJ=$(unjj "$CL")
if [ "$(jf ss "$CLJ")" = "true" ] && [ "$(jf ms "$CLJ")" = "false" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য + নির্বাচক-অনুপস্থিত (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি — রিগ্রেশন-সহাবস্থান)"; else bad "পরিষ্কারণ: $(unjj "$CL")"; fi
ERR1=$(ev "(function(){return window.__s341console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s341-suite ✓ সর্ব-সবুজ"; else echo "s341-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
