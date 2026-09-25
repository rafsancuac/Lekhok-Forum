#!/bin/bash
# s348-suite.sh — session348: hr348 ওভারলে-সারি-aria-keyshortcuts + sfs348 শর্টকাট-আবিষ্কার-টোন
# [Task ID 185] PLANS session347-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ
#   (+ P/C-সারি-Enter-প্রতিনিধি-ই২ই-বিস্তার-যাচাই — প্রস্তাব-②-প্রথম-বিকল্পের-যাচাইযোগ্য-অংশ-সহ):
#   hr348 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     mkLi330-এক-লাইন-সম্প্রসারণ: li.setAttribute('aria-keyshortcuts', row330m[0]) — row330m[0] =
#       .hr330-k-textContent-সম-উৎস = hr346-প্রতিনিধি-সম-কী (ত্রি-উৎস-এক-সত্য); নির্মাতা-এক-উৎস →
#       build/rebuild-সম-পথ-স্বয়ং-কভারড; স্ক্রিন-রিডার-সক্রিয়করণ-পরিচিতি (li-ফোকাসযোগ্য hr345-tabIndex=-১)।
#     চুক্তি: ovRows330-অ্যারে-অস্পৃশ্য (৯-সারি); q-কাউন্টার/storage-অস্পৃশ্য; পাঠযোগ্য-attr-কেবল।
#   sfs348 (ইনলাইন-<style> session348-ব্লক — cascade EOF-session347-পরে — হেক্স-শূন্য rgba-only):
#     ফায়ান্সি-পরিবার = শর্টকাট-আবিষ্কার-সংকেত (নতুন-পরিবার-বিভাজন); hover/focus-কীক্যাপ-বুস্ট;
#     :not-গার্ড-চতুষ্টয় ([data-hr343-w]/.hr345-cursor/.hr346-act/.hr347-io — অবস্থা-টোন-অজেয়);
#     ≤640px-কম্প্যাক্ট inset 1px; MO=৪-অটুট।
#   সুইট-যাচাই-বিস্তার: P-সারি-Enter → togglePv327 {opens/closes + .hr327-pre + aria-expanded};
#     C-সারি-Enter → copyPv328 {বন্ধ-প্রিভিউয়ে-প্রথমে-খোলা + clipboard ≡ strip324 ≡ q328h.last};
#     P/C = hr347-লেজার-বহি {^act:(D|S)@-regex — .hr347-io-ফ্ল্যাশ-বহি}।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) + jf-None-অর্থবিদ্যা (s345-গোটচা-①) +
#         async-copies-ডেল্টা-পাঠ ≥৪৫০ms (s347-গোটচা-②)।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s348-aks-desk.png
SH_MOB=/home/z/my-project/download/s348-aks-mobile390.png
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
rld(){ agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1; arm; }
arm(){ ev "JSON.stringify((function(){if(!window.__s348console){window.__s348console=0;var oe=console.error;console.error=function(){window.__s348console=(window.__s348console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
opentip(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();return 'r2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
seedhist(){ local a
  for a in 1 2; do
    stubclip
    ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1
    ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1
    local h; h=$(ev "(function(){return (window.__hrAria317QA?window.__hrAria317QA.hist().length:0)})()" 2>/dev/null | tr -d '"')
    if [ "$h" -ge 1 ] 2>/dev/null; then return 0; fi
  done
  return 0; }
stubclip(){ ev "JSON.stringify((function(){if(!window.__cc348set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap348=t;return Promise.resolve()}},configurable:true});window.__cc348set=true}return 'stub'})())" >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s348-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s348-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr348+sfs348-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + গার্ড-চতুষ্টয়) ──"
AKN=$(grep -c 'aria-keyshortcuts' "$EJSF" | tr -d ' ')
if [ "$AKN" = "7" ]; then ok "home-reorder.ejs: aria-keyshortcuts-রেফারেন্স ×$AKN (attr-set ×১ + getAttribute ×২ + ডক ×৪ — এক-উৎস-নির্মাণ)"; else bad "aria-keyshortcuts-রেফারেন্স ×$AKN (প্রত্যাশা ৭)"; fi
A348CHK=$(python3 - "$EJSF" <<'PYEOF'
import re, subprocess, tempfile, os, sys
src = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"<script>(.*?)</script>", src, re.S)
for b in blocks:
    b2 = re.sub(r"<%-[^%]*%>", "null", b)
    b2 = re.sub(r"<%=[^%]*%>", "null", b2)
    b2 = re.sub(r"<%[^%]*%>", "", b2)
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(b2); p = f.name
    r = subprocess.run(["node","--check",p], capture_output=True, text=True)
    os.unlink(p)
    if r.returncode != 0:
        print("FAIL:" + r.stderr[:200]); sys.exit()
print("OK")
PYEOF
)
if [ "$A348CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr348-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ ($A348CHK)"; fi
CSS348=$(sed -n '/session348 (sfs348 ওভারলে-সারি-শর্টকাট-আবিষ্কার-টোন — admin-ইনলাইন)/,/EOF session348/p' "$EJSF")
HEXN=$(printf '%s' "$CSS348" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS348" ]; then ok "home-reorder.ejs: session348-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session348-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS348" | grep -c 'session348' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session348-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session348-মার্কার ×$BN (<২)"; fi
C348AFTER=$(grep -n 'EOF session348' "$EJSF" | head -1 | cut -d: -f1)
C347BEFORE=$(grep -n 'EOF session347' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C348AFTER" ] && [ -n "$C347BEFORE" ] && [ "$C348AFTER" -gt "$C347BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session348-ব্লক session347-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (348@$C348AFTER vs 347@$C347BEFORE)"; fi
B348=$(grep -c 'session348' "$APP/public/assets/css/style.css" | tr -d ' ')
B347=$(grep -c 'session347' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B348" = "0" ] && [ "$B347" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session348/347-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (348=$B348 347=$B347 334=$GOODCSS)"; fi
GSET=$(grep -o "setAttribute('aria-keyshortcuts', row330m\[0\])" "$EJSF" | wc -l | tr -d ' ')
GGET=$(grep -o "getAttribute('aria-keyshortcuts')" "$EJSF" | wc -l | tr -d ' ')
GN=$(grep -o ':not(\[data-hr343-w\])' "$EJSF" | wc -l | tr -d ' ')
if [ "$GSET" = "2" ] && [ "$GGET" = "2" ] && [ "$GN" = "4" ]; then ok "mkLi330-এক-লাইন-এক-উৎস (set-অসংঘটন ×$GSET = কোড ×১ + ডক ×১ — নির্মাতা-এক-উৎস) + aks-পাঠ ×$GGET (aks+aksK) + :not-গার্ড-চতুষ্টয় ×$GN-অসংঘটন (অবস্থা-টোন-অজেয় — sfs343/345/346/347-সহাবস্থান)"; else bad "গার্ড-চুক্তি-অমিল (set=$GSET get=$GGET not=$GN)"; fi
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
DLCNT=$(grep -c "ovRows330 = \[" "$EJSF" | tr -d ' ')
if [ "$RG" = "1" ] && [ "$DLCNT" = "1" ]; then ok "ovRows330-৯-সারি-রেজিস্ট্রি-মিরর-অটুট (hr348-অ্যারে-অস্পৃশ্য-চুক্তি — সর্ব-সারি-এক-উৎস)"; else bad "রেজিস্ট্রি-মিরর-অমিল ($RG/$DLCNT)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr348-ই২ই (aria-keyshortcuts ×৯ + P/C-প্রতিনিধি + লেজার-বহি + আবিষ্কার-টোন) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria348QA,last:window.__hrAria348QA?window.__hrAria348QA.last:'x',e:((window.__hrAria348QA||{}).err||''),q347:!!window.__hrAria347QA,q346:!!window.__hrAria346QA,q345:!!window.__hrAria345QA,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA,aks0:(window.__hrAria348QA?window.__hrAria348QA.aks():[-1]).length})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf last "$Q0J")" = "built" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf aks0 "$Q0J")" = "0" ] && [ "$(jf q347 "$Q0J")" = "true" ] && [ "$(jf q346 "$Q0J")" = "true" ] && [ "$(jf q345 "$Q0J")" = "true" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ]; then ok "ই২ই: __hrAria348QA-হুক (last=built + err-শূন্য + নির্মাণ-পূর্ব aks()=[] — সারি-শূন্যে-ও-সংজ্ঞায়িত) + s347–s330-সহাবস্থান"; else bad "ই২ই: হুক $(unjj "$Q0")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
AKS=$(unjj "$(ev "JSON.stringify(window.__hrAria348QA.aks())")")
if [ "$AKS" = '["E","D","X","F","P","C","S","W","?"]' ]; then ok "ই২ই: aria-keyshortcuts ×৯ (ovRows330-সম-ক্রম E,D,X,F,P,C,S,W,? — নির্মাতা-এক-উৎস buildOv330-পথ)"; else bad "ই২ই: aks=$AKS"; fi
PAIR=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var okn=0;for(var i=0;i<rs.length;i++){var k=rs[i].querySelector('.hr330-k');if(k&&(k.textContent||'').trim()===rs[i].getAttribute('aria-keyshortcuts'))okn++}return{okn,n:rs.length}})())")")
PAIRJ=$(unjj "$PAIR")
if [ "$(jf okn "$PAIRJ")" = "9" ] && [ "$(jf n "$PAIRJ")" = "9" ]; then ok "ই২ই: attr≡চিপ-ত্রি-উৎস-এক-সত্য (৯/৯-সারি aria-keyshortcuts ≡ .hr330-k-textContent = hr346-প্রতিনিধি-সম-কী)"; else bad "ই২ই: জোড়া $(unjj "$PAIR")"; fi
AKK=$(unjj "$(ev "JSON.stringify({e:window.__hrAria348QA.aksK('E'),w:window.__hrAria348QA.aksK('W'),q:window.__hrAria348QA.aksK('?'),nope:window.__hrAria348QA.aksK('nope')})")")
AKKJ=$(unjj "$AKK")
if [ "$(jf e "$AKKJ")" = "E" ] && [ "$(jf w "$AKKJ")" = "W" ] && [ "$(jf q "$AKKJ")" = "?" ] && [ "$(jf nope "$AKKJ")" = "None" ]; then ok "ই২ই: aksK-স্পট (E/W/?-মিল + অজানা-কী = null — jf-None-অর্থবিদ্যা)"; else bad "ই২ই: aksK $(unjj "$AKK")"; fi

echo "── ধাপ-৪: P/C-সারি-Enter-প্রতিনিধি-ই২ই (togglePv327 + copyPv328 + hr347-লেজার-বহি) ──"
rld
opentip
seedhist
stubclip
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
P1=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var o0=window.__hrAria327QA.opens;var dl0=window.__hrAria347QA.dl;var sv0=window.__hrAria347QA.sv;rs[4].dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var pre=document.querySelector('.hr327-pre');var bs=document.querySelector('.hr327-pv');return{o:window.__hrAria327QA.opens-o0,dl:window.__hrAria347QA.dl-dl0,sv:window.__hrAria347QA.sv-sv0,pre:!!pre,exp:bs?bs.getAttribute('aria-expanded'):'',last346:window.__hrAria346QA.last,ioP:rs[4].classList.contains('hr347-io')}})())")")
P1J=$(unjj "$P1")
if [ "$(jf o "$P1J")" = "1" ] && [ "$(jf dl "$P1J")" = "0" ] && [ "$(jf sv "$P1J")" = "0" ] && [ "$(jf pre "$P1J")" = "true" ] && [ "$(jf exp "$P1J")" = "true" ] && [ "$(jf ioP "$P1J")" = "false" ]; then ok "ই২ই: P-সারি-Enter → togglePv327-খোলা {opens Δ+১ + .hr327-pre-উপস্থিত + aria-expanded=true} + hr347-লেজার-বহি {dl/sv-Δ=০ + .hr347-io-ফ্ল্যাশ-বহি — ^act:(D|S)@-regex-প্রমাণ}"; else bad "ই২ই: P-খোলা $(unjj "$P1")"; fi
P2=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var c0=window.__hrAria327QA.closes;rs[4].dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{c:window.__hrAria327QA.closes-c0,pre:!document.querySelector('.hr327-pre'),last:window.__hrAria327QA.last}})())")")
P2J=$(unjj "$P2")
if [ "$(jf c "$P2J")" = "1" ] && [ "$(jf pre "$P2J")" = "true" ] && [ "$(jf last "$P2J")" = "closed" ]; then ok "ই২ই: P-সারি-Enter-পুনঃ → togglePv327-বন্ধ {closes Δ+১ + .hr327-pre-অনুপস্থিত + last=closed — টগল-দ্বি-মুখী-প্রমাণ}"; else bad "ই২ই: P-বন্ধ $(unjj "$P2")"; fi
C1=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var o0=window.__hrAria327QA.opens;var cp0=window.__hrAria328QA.copies;var sv0=window.__hrAria347QA.sv;rs[5].dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var pre=document.querySelector('.hr327-pre');return{o:window.__hrAria327QA.opens-o0,pre:!!pre,ioC:rs[5].classList.contains('hr347-io'),last346:window.__hrAria346QA.last,sv:window.__hrAria347QA.sv-sv0}})())")")
agent-browser wait 500 >/dev/null 2>&1
C1J=$(unjj "$C1")
CP=$(unjj "$(ev "JSON.stringify({cp:window.__hrAria328QA.copies,cap:window.__hrAria328QA.last,pre:window.__hrAria327QA.preview()})")")
CPJ=$(unjj "$CP")
CAP=$(jf cap "$CPJ"); PREV=$(jf pre "$CPJ"); CPN=$(jf cp "$CPJ")
NONEMPTY=""; [ -n "$CAP" ] && [ "$CAP" != "None" ] && NONEMPTY="y"
if [ "$(jf o "$C1J")" = "1" ] && [ "$(jf pre "$C1J")" = "true" ] && [ "$(jf ioC "$C1J")" = "false" ] && [ "$(jf sv "$C1J")" = "0" ] && [ "$CPN" = "1" ] && [ "$NONEMPTY" = "y" ] && [ "$CAP" = "$PREV" ]; then ok "ই২ই: C-সারি-Enter → copyPv328 {বন্ধ-প্রিভিউয়ে-প্রথমে-খোলা opens Δ+১ + copies Δ+১ + ক্লিপবোর্ড-ক্যাপ ≡ q328h.last ≡ প্রিভিউ-পাঠ — WYSIWYG-এক-উৎস} + hr347-লেজার-বহি {sv-Δ=০ + .hr347-io-বহি}"; else bad "ই২ই: C $(unjj "$C1") / কপি $(unjj "$CP")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-ওভারলে + খোলা-প্রিভিউ — s348-ডেস্ক)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: sfs348-আবিষ্কার-টোন (ফায়ান্সি-কীক্যাপ + অবস্থা-প্রাধিকার্য-গার্ড) ──"
ev "JSON.stringify((function(){try{var ov=document.querySelector('.hr330-ov');if(ov)ov.remove();window.__hrAria330QA.open('qa');return 'ro'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T1=$(unjj "$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.focus();var k=r.querySelector('.hr330-k');var cs=getComputedStyle(k);return{col:cs.color,bg:cs.backgroundColor,sh:cs.boxShadow.indexOf('inset')>=0,sh15:cs.boxShadow.indexOf('1.5px')>=0}})())")")
T1J=$(unjj "$T1")
if [ "$(jf col "$T1J")" = "rgb(134, 25, 143)" ] && [ "$(jf bg "$T1J")" = "rgba(192, 38, 211, 0.12)" ] && [ "$(jf sh "$T1J")" = "true" ] && [ "$(jf sh15 "$T1J")" = "true" ]; then ok "ই২ই: sfs348-ফোকাস-আবিষ্কার-টোন (অ-অবস্থা-সারি focus → ফায়ান্সি-কীক্যাপ {color rgba(134,25,143) + bg rgba(192,38,211,0.12) + inset-কীক্যাপ 1.5px} — aria-keyshortcuts-দৃশ্যমান-প্যারিটি)"; else bad "ই২ই: টোন $(unjj "$T1")"; fi
T2=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');rs[0].blur();var w=rs[7];w.focus();var cs=getComputedStyle(w.querySelector('.hr330-k'));var c=cs.color;w.blur();rs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var cur=document.querySelector('.hr330-li.hr345-cursor');var cc=cur?getComputedStyle(cur.querySelector('.hr330-k')).color:'';return{wcol:c,cur:cc,curCls:!!cur}})())")")
T2J=$(unjj "$T2")
if [ "$(jf wcol "$T2J")" = "rgba(185, 28, 28, 0.95)" ] && [ "$(jf curCls "$T2J")" = "true" ] && [ "$(jf cur "$T2J")" = "rgb(6, 95, 70)" ]; then ok "ই২ই: অবস্থা-প্রাধিকার্য (W-সারি-focus → লাল-ধ্বংসাত্মক-টোন-অটুট {rgba(185,28,28)} + কার্সর-সারি → সবুজ-মূল-টোন-অটুট {rgb(6,95,70)} — :not-গার্ড-চতুষ্টয়-প্রমাণ — ফায়ান্সি-অজেয়)"; else bad "ই২ই: গার্ড $(unjj "$T2")"; fi
LED=$(unjj "$(ev "JSON.stringify({opens:window.__hrAria327QA.opens,closes:window.__hrAria327QA.closes,cp:window.__hrAria328QA.copies})")")
if [ "$(jf opens "$LED")" = "2" ] && [ "$(jf closes "$LED")" = "1" ] && [ "$(jf cp "$LED")" = "1" ]; then ok "ই২ই: লেজার-চুক্তি {q327h opens=২ {P-খোলা + C-স্বয়ং-খোলা} / closes=১ {P-পুনঃ} / q328h.copies=১ — টগল-দ্বি-মুখ + C-প্রথমে-খোলা-সম্পূর্ণ-চুক্তি}"; else bad "ই২ই: লেজার $(unjj "$LED")"; fi

echo "── ধাপ-৬: sfs348-মোবাইল-390 (কম্প্যাক্ট-কীক্যাপ 1px) + কাউন্টার-সততা ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
opentip
stubclip
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.focus();return 'm1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
MOB=$(unjj "$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];if(!r)return{got:false};var cs=getComputedStyle(r.querySelector('.hr330-k'));return{got:true,ak:r.getAttribute('aria-keyshortcuts'),bg:cs.backgroundColor.indexOf('192, 38, 211')>=0,sh1:cs.boxShadow.indexOf('1px')>=0,sh15:cs.boxShadow.indexOf('1.5px')>=0}})())")")
MOBJ=$(unjj "$MOB")
if [ "$(jf got "$MOBJ")" = "true" ] && [ "$(jf ak "$MOBJ")" = "E" ] && [ "$(jf bg "$MOBJ")" = "true" ] && [ "$(jf sh1 "$MOBJ")" = "true" ] && [ "$(jf sh15 "$MOBJ")" = "false" ]; then ok "ই২ই: মোবাইল-390 কম্প্যাক্ট (inset 1px-≤640px-গেট {1.5px-অনুপস্থিত} + ফায়ান্সি-bg-ব্যান্ড + attr-স্থায়িত্ব)"; else bad "ই২ই: মোবাইল $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
CS=$(unjj "$(ev "JSON.stringify({dl:window.__hrAria347QA.dl,sv:window.__hrAria347QA.sv,navs:window.__hrAria345QA.navs,reg:window.__hrAria333QA.rows(),e348:window.__hrAria348QA.err,e347:window.__hrAria347QA.err,e346:window.__hrAria346QA.err,e345:window.__hrAria345QA.err})")")
CSJ=$(unjj "$CS")
if [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf dl "$CSJ")" = "0" ] && [ "$(jf sv "$CSJ")" = "0" ] && [ "$(jf e348 "$CSJ")" = "" ] && [ "$(jf e347 "$CSJ")" = "" ] && [ "$(jf e346 "$CSJ")" = "" ] && [ "$(jf e345 "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা {রেজিস্ট্রি-৯ + hr347-লেজার-সর্ব-শূন্য {dl=০/sv=০ — P/C-প্রতিনিধি-সহ} + q345h-নেভ-লেজার-শূন্য + সর্ব-হুক-ত্রুটি-শূন্য}"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi

echo "── ধাপ-৭: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr348')>=0||ks[i].indexOf('hr347')>=0)return false}return true})(),q348:!!window.__hrAria348QA,aks:(window.__hrAria348QA?window.__hrAria348QA.aks():[-1]).length})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf noKey "$CLNJ")" = "true" ] && [ "$(jf q348 "$CLNJ")" = "true" ] && [ "$(jf aks "$CLNJ")" = "0" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr348/hr347-কী-শূন্য-সহ} + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব + নির্মাণ-পূর্ব-aks=[] (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s348console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s348-suite ✓ সর্ব-সবুজ"; else echo "s348-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
