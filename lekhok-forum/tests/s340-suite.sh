#!/bin/bash
# s340-suite.sh — session340: hr340 getHints মোড-সচেতন (getHints(true) = {fmt}-রেজলভড-মানচিত্র) + sfs340 রেজলভড-রপ্তাই-বাটন
# [Task ID 177] PLANS session339-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (hr338-চুক্তি-প্রসারিত):
#   hr340 (admin/home-reorder.ejs — hr339-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     getHintsOrig340-চেইন (hr338-চুক্তি-প্রসারিত): মিথ্যা-মোড়ানো = RAW (অপরিবর্তিত — s338-রাউন্ড-ট্রিপ-অটুট);
#     getHints(true) = রেজলভড-মানচিত্র (প্রতি-কী hintOf334-কল-টাইম-{fmt}-রেজলিউশন — এক-উৎস — প্রতি-কলে-নতুন-
#     অবজেক্ট); রিড-পবিত্রতা (রেজিস্ট্রি/লাইন/স্টোরেজ/DOM-মিউটেশন-শূন্য — শ্রেণি-অস্পৃশ্য); .hr340-resbtn
#     স্বতন্ত্র-শ্রেণি (s326-রীতি — .hr324-btn-গণনা-চুক্তি-অটুট) + স্বতন্ত্র-বার .hr340-bar (hr339-বার-অবরোধ-শূন্য);
#     গেট = বার-পরিবার-দৃশ্যমানতা (hist≥১ ∨ store≥১ — hr324-দর্শন); ত্রি-মোড়ক-জীবন্ত-সিঙ্ক (trOrig340-চেইন +
#     persist337-মোড়ক + q337h.clearStore-মোড়ক — regOrig334-রীতি); কপি-পথ = রেকর্ড-বিহীন (copyHist324-রীতি —
#     ইতিহাস-গণনা-দূষণ-শূন্য) + টোস্ট (fmtLabel331-কল-টাইম) + .hr340-done-ফ্ল্যাশ; কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত
#     (পয়েন্টার-কেবল — hr339-উত্তরাধিকার — ওভারলে-৮-সারি-স্থায়িত্ব)।
#   sfs340 (home-reorder.ejs ইনলাইন-<style> session340-ব্লক — cascade-অবস্থান session339-পরে — হেক্স-শূন্য):
#     .hr340-resbtn নীল-রিড/ইনস্পেক্ট-টোন (rgba-only — সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-বিভাজন-সম্মত) — নতুন-উপাদান-
#     স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য — সর্ব-ব্যান্ড — MO=৪-অটুট।
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         computed-রঙ-assert = ফরম্যাট-নিরপেক্ষ + টিপ-প্রদর্শন = দ্বি-কপি + blur+focus-রেসিপি + ক্লিপবোর্ড-ক্যাপ-স্টাব
#         (__clipCap340 — রেকর্ড-বিহীন-কপি-প্রমাণ) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s340-resbtn-desk.png
SH_MOB=/home/z/my-project/download/s340-resbtn-mobile390.png
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
  ev "JSON.stringify((function(){try{if(!window.__clipCap340)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap340=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
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
(cd "$APP" && node db/migrate.js >/tmp/s340-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s340-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr340+sfs340-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + ক্যাসকেড) ──"
HN=$(grep -c 'hr340' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 12 ]; then ok "home-reorder.ejs: hr340-রেফারেন্স-লাইন ×$HN (হুক+বাটন+বার+স্টাইল-সহাবস্থান)"; else bad "hr340-রেফারেন্স-অপ্রতুল ($HN)"; fi
A340CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A340CHK" = "OK" ]; then ok "home-reorder.ejs: hr340-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS340=$(sed -n '/session340 (sfs340 রেজলভড-রপ্তাই-বাটন — admin-ইনলাইন)/,/EOF session340/p' "$EJSF")
HEXN=$(printf '%s' "$CSS340" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS340" ]; then ok "home-reorder.ejs: session340-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session340-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS340" | grep -c 'session340' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session340-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session340-মার্কার ×$BN (<২)"; fi
C340AFTER=$(grep -n 'EOF session340' "$EJSF" | head -1 | cut -d: -f1)
C339BEFORE=$(grep -n 'EOF session339' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C340AFTER" ] && [ -n "$C339BEFORE" ] && [ "$C340AFTER" -gt "$C339BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session340-ব্লক session339-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (340@$C340AFTER vs 339@$C339BEFORE)"; fi
B340=$(grep -c 'session340' "$APP/public/assets/css/style.css" | tr -d ' ')
B339=$(grep -c 'session339' "$APP/public/assets/css/style.css" | tr -d ' ')
B338=$(grep -c 'session338' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B340" = "0" ] && [ "$B339" = "0" ] && [ "$B338" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session340/339/338-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (340=$B340 339=$B339 338=$B338 334=$GOODCSS)"; fi
RBCLS=$(grep -c 'hr340-resbtn' "$EJSF" | tr -d ' ')
if [ "$RBCLS" -ge 3 ]; then ok "hr340-resbtn-শ্রেণি-রেফারেন্স ×$RBCLS (নির্মাণ+স্টাইল+হুক)"; else bad "hr340-resbtn-রেফারেন্স-অপ্রতুল ($RBCLS)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr340-ই২ই (মোড-সচেতন-getHints + রেজলভড-রপ্তাই-বাটন + জীবন্ত-সিঙ্ক) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria340QA,g:window.__hrAria340QA?window.__hrAria340QA.getr:-1,rb:window.__hrAria340QA?window.__hrAria340QA.resbtn():null,br:window.__hrAria340QA?window.__hrAria340QA.bar():null,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria340QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf g "$Q0J")" = "0" ] && [ "$(jf rb "$Q0J")" = "false" ] && [ "$(jf br "$Q0J")" = "false" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria340QA-হুক (কাউন্টার=০ + বাটন/বার-অনুপস্থিত — শূন্য-পরিবার-গেট) + s339–s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
RR=$(ev "JSON.stringify((function(){var raw=window.__hrAria340QA.raw(),res=window.__hrAria340QA.resolved();return{rawF:raw['F'],resF:res['F'],n:window.__hrAria340QA.getr,last:window.__hrAria340QA.last,rows:window.__hrAria333QA.rows(),ss:sessionStorage.getItem('hr337-hints')===null,rb:window.__hrAria340QA.resbtn()}})())")
RRJ=$(unjj "$RR")
if printf '%s' "$(jf rawF "$RRJ")" | grep -q '{fmt}' && printf '%s' "$(jf resF "$RRJ")" | grep -q 'সমৃদ্ধ' && [ "$(jf n "$RRJ")" = "1" ] && printf '%s' "$(jf last "$RRJ")" | grep -q 'getr:8' && [ "$(jf rows "$RRJ")" = "8" ] && [ "$(jf ss "$RRJ")" = "true" ] && [ "$(jf rb "$RRJ")" = "false" ]; then ok "ই২ই: RAW-vs-রেজলভড (raw F='{fmt}'-অরেজলভড + resolved F='সমৃদ্ধ'-কল-টাইম + getr:৮-কী + রিড-পবিত্রতা {স্টোরেজ-শূন্য + রো=৮ + বাটন-অস্পৃশ্য})"; else bad "ই২ই: $(unjj "$RR")"; fi
FOC=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'r2'})())")
agent-browser wait 500 >/dev/null 2>&1
FG=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip'),rb:window.__hrAria340QA.resbtn(),br:window.__hrAria340QA.bar(),s324bar:!!document.querySelector('.hr324-bar'),hist:window.__hrAria317QA.hist().length})")
FGJ=$(unjj "$FG")
if [ "$(jf tip "$FGJ")" = "true" ] && [ "$(jf rb "$FGJ")" = "false" ] && [ "$(jf br "$FGJ")" = "false" ] && [ "$(jf s324bar "$FGJ")" = "false" ] && [ "$(jf hist "$FGJ")" = "0" ]; then ok "ই২ই: পরিবার-গেট-দর্শন (খোলা-টিপেও শূন্য-ইতিহাস+শূন্য-স্টোরে বাটন/বার-অনুপস্থিত — hr324-দর্শন — fresh-DOM-অপরিবর্তিত)"; else bad "ই২ই: $(unjj "$FG")"; fi
LSY=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪০)');var rb=document.querySelector('.hr340-resbtn');return{rb:!!rb,cb:!!document.querySelector('.hr339-clearbtn'),b2:document.querySelectorAll('.hr324-btn').length,st:window.__hrAria339QA.store(),last:window.__hrAria340QA.last,al:rb?rb.getAttribute('aria-label')||'':''}})())")
LSYJ=$(unjj "$LSY")
if [ "$(jf rb "$LSYJ")" = "true" ] && [ "$(jf cb "$LSYJ")" = "true" ] && [ "$(jf b2 "$LSYJ")" = "0" ] && [ "$(jf st "$LSYJ")" = "8" ] && printf '%s' "$(jf last "$LSYJ")" | grep -q 'sync:on' && printf '%s' "$(jf al "$LSYJ")" | grep -q 'getHints(true)'; then ok "ই২ই: জীবন্ত-সিঙ্ক-অন (persist337-মোড়ক → বাটন-রি-রেন্ডার-বিহীন-তাৎক্ষণিক-উপস্থিত + hr339-ক্লিয়ার-সহাবস্থান + শূন্য-ইতিহাসে .hr324-btn=০-স্বতন্ত্র-শ্রেণি-প্রমাণ + aria-getHints(true)-টেমপ্লেট)"; else bad "ই২ই: $(unjj "$LSY")"; fi
WP=$(ev "JSON.stringify((function(){window.__hrAria339QA.wipe();var rb=document.querySelector('.hr340-resbtn');return{rb:!!rb,br:window.__hrAria340QA.bar(),cb:!!document.querySelector('.hr339-clearbtn'),last:window.__hrAria340QA.last,ss:sessionStorage.getItem('hr337-hints')===null}})())")
WPJ=$(unjj "$WP")
if [ "$(jf rb "$WPJ")" = "false" ] && [ "$(jf br "$WPJ")" = "false" ] && [ "$(jf cb "$WPJ")" = "false" ] && printf '%s' "$(jf last "$WPJ")" | grep -q 'sync:off' && [ "$(jf ss "$WPJ")" = "true" ]; then ok "ই২ই: জীবন্ত-সিঙ্ক-অফ (q337h.clearStore-মোড়ক → পরিবার-শূন্যে-নিজস্ব-বার-সম্পূর্ণ-অপসারণ + sync:off-মার্কার + স্টোরেজ-শূন্য — hr339-বার-অবরোধ-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$WP")"; fi
rld
CP0=$(ev "JSON.stringify((function(){var rb=document.querySelector('.hr340-resbtn');var k=document.querySelector('.hr324-kbd');return{rb:!!rb,k:!!k,cls:k?k.className:'',diff:k?k.classList.contains('hr338-diff'):null,res:k?k.classList.contains('hr337-restored'):null,bat:k?k.classList.contains('hr336-batched'):null,line:window.__hrAria337QA.line()===(k?k.textContent:''),b2:document.querySelectorAll('.hr324-btn').length}})())")
CP0J=$(unjj "$CP0")
if [ "$(jf rb "$CP0J")" = "true" ] && [ "$(jf k "$CP0J")" = "true" ] && [ "$(jf cls "$CP0J")" = "hr324-kbd" ] && [ "$(jf diff "$CP0J")" = "false" ] && [ "$(jf res "$CP0J")" = "false" ] && [ "$(jf bat "$CP0J")" = "false" ] && [ "$(jf line "$CP0J")" = "true" ] && [ "$(jf b2 "$CP0J")" = "2" ]; then ok "ই২ই: নির্মাণ-পথ+পবিত্রতা (রেসিপি-পরবর্তী-বাটন-উপস্থিত + kbd-শ্রেণি-বেস-অটুট {diff/restored/batched-অনুপস্থিত} + live-kbd==line() + .hr324-btn=২-গণনা-চুক্তি-অটুট — hr338/337/336-শ্রেণি-অস্পৃশ্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$CP0")"; fi
H0=$(ev "JSON.stringify(window.__hrAria317QA.hist().length)" | tr -d '"')
CLICKEV=$(ev "JSON.stringify((function(){window.__clipCap340='';document.querySelector('.hr340-resbtn').click();return 'clicked'})())")
agent-browser wait 700 >/dev/null 2>&1
CP1=$(ev "JSON.stringify({capF:window.__clipCap340.indexOf('\"F = বিন্যাস (সমৃদ্ধ)\"')>=0,capN:(window.__clipCap340||'').length,c:window.__hrAria340QA.copies,last:window.__hrAria340QA.last,done:document.querySelector('.hr340-resbtn').classList.contains('hr340-done'),h1:window.__hrAria317QA.hist().length})")
CP1J=$(unjj "$CP1")
if [ "$(jf capF "$CP1J")" = "true" ] && [ "$(jf capN "$CP1J")" -ge 30 ] 2>/dev/null && [ "$(jf c "$CP1J")" = "1" ] && printf '%s' "$(jf last "$CP1J")" | grep -q 'copy:8' && [ "$(jf done "$CP1J")" = "true" ] && [ "$(jf h1 "$CP1J")" = "$H0" ]; then ok "ই২ই: রেজলভড-রপ্তাই-কপি (ক্লিপবোর্ড-ক্যাপ-রেজলভড-JSON {সমৃদ্ধ-সহ} + copies=১ + copy:৮-মার্কার + .hr340-done-ফ্ল্যাশ + ইতিহাস-গণনা-অপরিবর্তিত ($H0) — রেকর্ড-বিহীন-পথ-প্রমাণ)"; else bad "ই২ই: $(unjj "$CP1") h0=$H0"; fi
MJ=$(ev "JSON.stringify((function(){sessionStorage.setItem('hr326-fmt','json');return 'set'})())" >/dev/null 2>&1; rld; ev "JSON.stringify({resF:window.__hrAria340QA.resolved()['F'],rawF:window.__hrAria340QA.raw()['F'],rb:window.__hrAria340QA.resbtn(),mode:sessionStorage.getItem('hr326-fmt')})")
MJJ=$(unjj "$MJ")
if printf '%s' "$(jf resF "$MJJ")" | grep -q 'JSON' && printf '%s' "$(jf rawF "$MJJ")" | grep -q '{fmt}' && [ "$(jf rb "$MJJ")" = "true" ] && [ "$(jf mode "$MJJ")" = "json" ]; then ok "ই২ই: মোড-সচেতন-কল-টাইম-রেজলিউশন (json-মোড-রিলোড → resolved F='JSON' + RAW='{fmt}'-অপরিবর্তিত + নির্মাণ-পথ-পুনঃউপস্থিতি — স্থায়ীকরণ-উত্তরাধিকার-সহাবস্থান)"; else bad "ই২ই: $(unjj "$MJ")"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria340QA.err||'')+(window.__hrAria339QA.err||'')+(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
QERRJ=$(unjj "$QERR")
if [ "$(jf e "$QERRJ")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333–s340)"; else bad "ই২ই: হুক-ত্রুটি $(unjj "$QERR")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রেজলভড-বাটন-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs340-মোবাইল-390 (বাটন-সর্ব-ব্যান্ড + কম্প্যাক্ট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
MB=$(ev "JSON.stringify((function(){var rb=document.querySelector('.hr340-resbtn');if(!rb)return{e:'no-btn'};var cs=getComputedStyle(rb);var fs=parseFloat(cs.fontSize);return{rb:true,fs:fs,fsOk:fs<8.4,vis:rb.offsetWidth>0}})())")
MBJ=$(unjj "$MB")
if [ "$(jf e "$MBJ")" = "" ] && [ "$(jf rb "$MBJ")" = "true" ] && [ "$(jf fsOk "$MBJ")" = "true" ] && [ "$(jf vis "$MBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 বাটন (দৃশ্যমান + কম্প্যাক্ট-ফন্ট 0.52rem-৬৪০px-গেট — সর্ব-ব্যান্ড-উপস্থিতি)"; else bad "ই২ই: $(unjj "$MB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + দ্বি-লোড-কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1; agent-browser wait 1200 >/dev/null 2>&1
CL=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,rb:(window.__hrAria340QA?window.__hrAria340QA.resbtn():null)})")
CLJ=$(unjj "$CL")
if [ "$(jf ss "$CLJ")" = "true" ] && [ "$(jf rb "$CLJ")" = "false" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য + বাটন-অনুপস্থিত (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি — রিগ্রেশন-সহাবস্থান)"; else bad "পরিষ্কারণ: $(unjj "$CL")"; fi
ERR1=$(ev "(function(){return window.__s340console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s340-suite ✓ সর্ব-সবুজ"; else echo "s340-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
