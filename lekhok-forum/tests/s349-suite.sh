#!/bin/bash
# s349-suite.sh — session349: hr349 ওভারলে-সারি-বর্ণনা-ঘোষণা-সংযোগ + sfs349 বর্ণনা-আবিষ্কার-টোন
# [Task ID 186] PLANS session348-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ:
#   hr349 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     mkLi330-দ্বি-লাইন-সম্প্রসারণ: .hr349-d-উৎস-span (hintOf334-কল-টাইম-রেজলভ — {fmt}-মোড-সচেতন) +
#       li.setAttribute('aria-describedby', d349.id) — hr348-কী-attr-জুটি-সম্পূর্ণতা (কী-ঘোষণা + কর্ম-ঘোষণা);
#       নির্মাতা-এক-উৎস → build/rebuild-সম-পথ-স্বয়ং-কভারড; cf349-cycleFmt326-মোড়ক (cf330/cf333-পরবর্তী)
#       → চক্র-পরবর্তী syncDs349() = সর্ব-সারি-পুনঃমূল্যায়ন (F-{fmt}-স্থায়িত্ব)।
#     চুক্তি: ovRows330-অ্যারে-অস্পৃশ্য (৯-সারি); q-কাউন্টার/storage/ক্লিপবোর্ড-অস্পৃশ্য; appendHint334-পাঠ-কেবল।
#   sfs349 (ইনলাইন-<style> session349-ব্লক — cascade EOF-session348-পরে — হেক্স-শূন্য rgba-only):
#     ইন্দিগো-পরিবার = বর্ণনা/হিন্ট-ঘোষণা-সংকেত (নতুন-পরিবার-বিভাজন — ফায়ান্সি-আবিষ্কার-পরে);
#     .hr349-d = দৃষ্টিহীন-রীতি (SR-only — 1px-clip); hover/focus → .hr330-d-বর্ণনা-পাঠ-টোন (ইন্দিগো +
#     আন্ডারলাইন); অর্থোগোনাল-ক্ষেত্র-নকশা (.hr330-d = সর্ব-অবস্থা-পরিবার-অস্পৃশ্য → :not-গার্ড-অপ্রয়োজনীয় —
#     সর্ব-অবস্থা-সারি-সম-আচরণ — অবস্থা-টোন-অজেয়-চুক্তি-অটুট); ≤640px-কম্প্যাক্ট offset 1px।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) + jf-None-অর্থবিদ্যা (s345-গোটচা-①)।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s349-desc-desk.png
SH_MOB=/home/z/my-project/download/s349-desc-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s349console){window.__s349console=0;var oe=console.error;console.error=function(){window.__s349console=(window.__s349console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
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
stubclip(){ ev "JSON.stringify((function(){if(!window.__cc349set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap349=t;return Promise.resolve()}},configurable:true});window.__cc349set=true}return 'stub'})())" >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s349-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s349-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr349+sfs349-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + অর্থোগোনাল-চুক্তি) ──"
ADN=$(grep -c 'aria-describedby' "$EJSF" | tr -d ' ')
if [ "$ADN" = "4" ]; then ok "home-reorder.ejs: aria-describedby-রেফারেন্স ×$ADN-লাইন (attr-set ×১ + ডক ×১ + ds/dsK-get ×২ — এক-উৎস-নির্মাণ)"; else bad "aria-describedby-রেফারেন্স ×$ADN (প্রত্যাশা ৪)"; fi
AKS=$(grep -c 'aria-keyshortcuts' "$EJSF" | tr -d ' ')
if [ "$AKS" = "7" ]; then ok "home-reorder.ejs: s348-লক-অটুট (aria-keyshortcuts ×$AKS-লাইন-অপরিবর্তিত — hr349-লিটারাল-স্পর্শ-শূন্য)"; else bad "s348-লক-ভাঙা (aria-keyshortcuts ×$AKS)"; fi
NG=$(grep -o ':not(\[data-hr343-w\])' "$EJSF" | wc -l | tr -d ' ')
if [ "$NG" = "4" ]; then ok "home-reorder.ejs: s348-লক-অটুট (:not-গার্ড ×$NG — sfs349-অর্থোগোনাল-ক্ষেত্র = গার্ড-বিহীন-প্রমাণ)"; else bad "s348-লক-ভাঙা (:not ×$NG)"; fi
A349CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A349CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr349-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ ($A349CHK)"; fi
CSS349=$(sed -n '/session349 (sfs349 ওভারলে-সারি-বর্ণনা-আবিষ্কার-টোন — admin-ইনলাইন)/,/EOF session349/p' "$EJSF")
HEXN=$(printf '%s' "$CSS349" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS349" ]; then ok "home-reorder.ejs: session349-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session349-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS349" | grep -c 'session349' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session349-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session349-মার্কার ×$BN (<২)"; fi
C349AFTER=$(grep -n 'EOF session349' "$EJSF" | head -1 | cut -d: -f1)
C348BEFORE=$(grep -n 'EOF session348' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C349AFTER" ] && [ -n "$C348BEFORE" ] && [ "$C349AFTER" -gt "$C348BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session349-ব্লক session348-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (349@$C349AFTER vs 348@$C348BEFORE)"; fi
B349=$(grep -c 'session349' "$APP/public/assets/css/style.css" | tr -d ' ')
B348=$(grep -c 'session348' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B349" = "0" ] && [ "$B348" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session349/348-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (349=$B349 348=$B348 334=$GOODCSS)"; fi
GSET=$(grep -o "setAttribute('aria-describedby', d349.id)" "$EJSF" | wc -l | tr -d ' ')
GGET=$(grep -o "getAttribute('aria-describedby')" "$EJSF" | wc -l | tr -d ' ')
DSYN=$(grep -o "var syncDs349 = function" "$EJSF" | wc -l | tr -d ' ')
DCF=$(grep -o "var cf349 = cycleFmt326" "$EJSF" | wc -l | tr -d ' ')
if [ "$GSET" = "2" ] && [ "$GGET" = "2" ] && [ "$DSYN" = "1" ] && [ "$DCF" = "1" ]; then ok "mkLi330-দ্বি-লাইন-এক-উৎস (set-অসংঘটন ×$GSET = কোড ×১ + ডক ×১) + ds-পাঠ ×$GGET (ds+dsK) + syncDs349/cf349-এক-উৎস (জীবন্ত-সিঙ্ক-চেইন)"; else bad "এক-উৎস-চুক্তি-অমিল (set=$GSET get=$GGET sync=$DSYN cf=$DCF)"; fi
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
DLCNT=$(grep -c "ovRows330 = \[" "$EJSF" | tr -d ' ')
if [ "$RG" = "1" ] && [ "$DLCNT" = "1" ]; then ok "ovRows330-৯-সারি-রেজিস্ট্রি-মিরর-অটুট (hr349-অ্যারে-অস্পৃশ্য-চুক্তি — সর্ব-সারি-এক-উৎস)"; else bad "রেজিস্ট্রি-মিরর-অমিল ($RG/$DLCNT)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr349-ই২ই (aria-describedby ×৯ + জোড়া-সমতা + dsT-এক-উৎস + দৃষ্টিহীন-রীতি) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria349QA,last:window.__hrAria349QA?window.__hrAria349QA.last:'x',e:((window.__hrAria349QA||{}).err||''),q348:!!window.__hrAria348QA,q347:!!window.__hrAria347QA,q346:!!window.__hrAria346QA,q345:!!window.__hrAria345QA,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA,ds0:(window.__hrAria349QA?window.__hrAria349QA.ds():[-1]).length})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf last "$Q0J")" = "built" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf ds0 "$Q0J")" = "0" ] && [ "$(jf q348 "$Q0J")" = "true" ] && [ "$(jf q347 "$Q0J")" = "true" ] && [ "$(jf q346 "$Q0J")" = "true" ] && [ "$(jf q345 "$Q0J")" = "true" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ]; then ok "ই২ই: __hrAria349QA-হুক (last=built + err-শূন্য + নির্মাণ-পূর্ব ds()=[] — সারি-শূন্যে-ও-সংজ্ঞায়িত) + s348–s330-সহাবস্থান"; else bad "ই২ই: হুক $(unjj "$Q0")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
DS=$(unjj "$(ev "JSON.stringify(window.__hrAria349QA.ds())")")
if [ "$DS" = '["hr349-d-E","hr349-d-D","hr349-d-X","hr349-d-F","hr349-d-P","hr349-d-C","hr349-d-S","hr349-d-W","hr349-d-?"]' ]; then ok "ই২ই: aria-describedby ×৯ (ovRows330-সম-ক্রম E,D,X,F,P,C,S,W,? — id-উপসর্গ+কী — নির্মাতা-এক-উৎস buildOv330-পথ)"; else bad "ই২ই: ds=$DS"; fi
PAIR=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var okn=0;for(var i=0;i<rs.length;i++){var id=rs[i].getAttribute('aria-describedby');var sp=id?document.getElementById(id):null;if(sp&&sp.parentNode===rs[i]&&sp.textContent.length>0)okn++}return{okn,n:rs.length}})())")")
PAIRJ=$(unjj "$PAIR")
if [ "$(jf okn "$PAIRJ")" = "9" ] && [ "$(jf n "$PAIRJ")" = "9" ]; then ok "ই২ই: attr≡span-জোড়া-সমতা (৯/৯-সারি aria-describedby → সর্ব-সারি-অভ্যন্তরে-উৎস-span + অ-শূন্য-বর্ণনা-পাঠ — hintOf334-পূর্ণ-রেজিস্ট্রি)"; else bad "ই২ই: জোড়া $(unjj "$PAIR")"; fi
DT=$(unjj "$(ev "JSON.stringify({e:window.__hrAria349QA.dsT('E'),x:window.__hrAria349QA.dsT('X'),w:window.__hrAria349QA.dsK('W'),nope:window.__hrAria349QA.dsK('nope')})")")
DTJ=$(unjj "$DT")
if [ "$(jf e "$DTJ")" = "E = স্ট্রিপ কপি" ] && [ "$(jf x "$DTJ")" = "X = পয়েন্টার-সারি বিলোপ" ] && [ "$(jf w "$DTJ")" = "hr349-d-W" ] && [ "$(jf nope "$DTJ")" = "None" ]; then ok "ই২ই: dsT/dsK-স্পট (E/X-বর্ণনা-সঠিক + W-সারি-সম-আচরণ {অর্থোগোনাল-ক্ষেত্র} + অজানা-কী = null — jf-None-অর্থবিদ্যা)"; else bad "ই২ই: dsT $(unjj "$DT")"; fi
FP=$(unjj "$(ev "JSON.stringify({t:window.__hrAria349QA.dsT('F'),h:window.__hrAria334QA.hintOf('F')})")")
FPJ=$(unjj "$FP")
if [ "$(jf t "$FPJ")" = "$(jf h "$FPJ")" ] && printf '%s' "$(jf t "$FPJ")" | grep -q 'F = বিন্যাস'; then ok "ই২ই: F-সারি-{fmt}-মোড-সচেতন (dsT ≡ hintOf334-কল-টাইম-রেজলভ — এক-উৎস-সমতা — ডিফল্ট-সমৃদ্ধ-মোড)"; else bad "ই২ই: F $(unjj "$FP")"; fi
VH=$(unjj "$(ev "JSON.stringify((function(){var d=document.querySelector('.hr330-ov .hr330-li .hr349-d');if(!d)return{got:false};var cs=getComputedStyle(d);return{got:true,pos:cs.position,w:cs.width,cp:cs.clipPath.indexOf('inset(50%)')>=0}})())")")
VHJ=$(unjj "$VH")
if [ "$(jf got "$VHJ")" = "true" ] && [ "$(jf pos "$VHJ")" = "absolute" ] && [ "$(jf w "$VHJ")" = "1px" ] && [ "$(jf cp "$VHJ")" = "true" ]; then ok "ই২ই: .hr349-d-দৃষ্টিহীন-রীতি (SR-only — position:absolute + 1px + clip-path inset(50%) — লেআউট-প্রভাব-শূন্য)"; else bad "ই২ই: দৃষ্টিহীন $(unjj "$VH")"; fi
SC=$(unjj "$(ev "JSON.stringify({n:window.__hrAria349QA.sync(),last:window.__hrAria349QA.last,e:window.__hrAria349QA.err})")")
SCJ=$(unjj "$SC")
if [ "$(jf n "$SCJ")" = "9" ] && [ "$(jf last "$SCJ")" = "sync:9" ] && [ "$(jf e "$SCJ")" = "" ]; then ok "ই২ই: sync()-বলপ্রয়োগ-সিঙ্ক (৯/৯-পুনঃমূল্যায়ন + last=sync:9 + err-শূন্য)"; else bad "ই২ই: sync $(unjj "$SC")"; fi

echo "── ধাপ-৪: cf349-জীবন্ত-সিঙ্ক (F-{fmt}-চক্র-পরবর্তী-সতেজ + appendHint334-পাঠ-কেবল-প্রমাণ) ──"
rld
opentip
seedhist
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F1=$(unjj "$(ev "JSON.stringify({t0:window.__hrAria349QA.dsT('F'),a0:window.__hrAria334QA.appends,o0:window.__hrAria330QA.opens})")")
ev "JSON.stringify((function(){var b=document.querySelector('.hr326-fmt');if(b)b.click();return 'c3'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
F2=$(unjj "$(ev "JSON.stringify({t1:window.__hrAria349QA.dsT('F'),h1:window.__hrAria334QA.hintOf('F'),a:window.__hrAria334QA.appends,o:window.__hrAria330QA.opens,e:window.__hrAria349QA.err})")")
F1T=$(jf t0 "$F1"); F1A=$(jf a0 "$F1"); F1O=$(jf o0 "$F1"); F2J=$(unjj "$F2"); F2T=$(jf t1 "$F2J")
FAD=$(( $(jf a "$F2J") - F1A )); FOD=$(( $(jf o "$F2J") - F1O ))
if [ -n "$F1T" ] && [ "$F1T" != "None" ] && [ "$F2T" != "$F1T" ] && [ "$F2T" = "$(jf h1 "$F2J")" ] && [ "$FAD" = "0" ] && [ "$FOD" = "0" ] && [ "$(jf e "$F2J")" = "" ]; then ok "ই২ই: cf349-চক্র-পরবর্তী-জীবন্ত-সিঙ্ক {dsT('$F1T'→'$F2T')-পরিবর্তিত + ≡ hintOf334-পোস্ট-চক্র — F-{fmt}-স্থায়িত্ব} + appendHint334-ডেল্টা=০ {hr349-অ্যাপেন্ড-স্পর্শ-শূন্য — পাঠ-কেবল} + opens-ডেল্টা=০ {টগল-স্পর্শ-শূন্য}"; else bad "ই২ই: cf349 (t0=$F1T / $(unjj "$F2") / a0=$F1A o0=$F1O)"; fi

echo "── ধাপ-৫: sfs349-বর্ণনা-আবিষ্কার-টোন (ইন্দিগো + অর্থোগোনাল-অবস্থা-সহাবস্থান) ──"
ev "JSON.stringify((function(){try{var ov=document.querySelector('.hr330-ov');if(ov)ov.remove();window.__hrAria330QA.open('qa');return 'ro'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T0=$(unjj "$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];var cs=getComputedStyle(r.querySelector('.hr330-d'));return{col:cs.color}})())")")
T1=$(unjj "$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.focus();var cs=getComputedStyle(r.querySelector('.hr330-d'));return{col:cs.color,ul:cs.textDecorationLine.indexOf('underline')>=0,uc:cs.textDecorationColor,off:cs.textUnderlineOffset}})())")")
T1J=$(unjj "$T1")
if [ "$(jf col "$T0")" = "rgb(6, 78, 59)" ] && [ "$(jf col "$T1J")" = "rgba(67, 56, 202, 0.95)" ] && [ "$(jf ul "$T1J")" = "true" ] && [ "$(jf uc "$T1J")" = "rgba(79, 70, 229, 0.45)" ] && [ "$(jf off "$T1J")" = "2px" ]; then ok "ই২ই: sfs349-ফোকাস-বর্ণনা-টোন (বেসলাইন rgb(6,78,59) → ইন্দিগো {color rgba(67,56,202,0.95) + আন্ডারলাইন rgba(79,70,229,0.45) + offset 2px} — বর্ণনা-ঘোষণা-দৃশ্যমান-প্যারিটি)"; else bad "ই২ই: টোন (t0=$(unjj "$T0") / t1=$(unjj "$T1"))"; fi
T2=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');rs[0].blur();var w=rs[7];w.focus();var dcs=getComputedStyle(w.querySelector('.hr330-d'));var kcs=getComputedStyle(w.querySelector('.hr330-k'));var dc=dcs.color;var kc=kcs.color;w.blur();rs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var cur=document.querySelector('.hr330-li.hr345-cursor');var cc=cur?getComputedStyle(cur.querySelector('.hr330-k')).color:'';var cd=cur?getComputedStyle(cur.querySelector('.hr330-d')).color:'';return{wd:dc,wk:kc,cur:cc,curd:cd}})())")")
T2J=$(unjj "$T2")
if [ "$(jf wd "$T2J")" = "rgba(67, 56, 202, 0.95)" ] && [ "$(jf wk "$T2J")" = "rgba(185, 28, 28, 0.95)" ] && [ "$(jf cur "$T2J")" = "rgb(6, 95, 70)" ] && [ "$(jf curd "$T2J")" = "rgba(67, 56, 202, 0.95)" ]; then ok "ই২ই: অর্থোগোনাল-অবস্থা-সহাবস্থান (W-সারি-focus → বর্ণনা-ইন্দিগো-সম + কীক্যাপ-লাল-অটুট {rgba(185,28,28) — sfs343-অজেয়} + কার্সর-সারি → কীক্যাপ-সবুজ-অটুট {rgb(6,95,70)} + বর্ণনা-ইন্দিগো-সম — সর্ব-অবস্থা-সম-আচরণ-প্রমাণ)"; else bad "ই২ই: অর্থোগোনাল $(unjj "$T2")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-ওভারলে + ফোকাসড-সারি — s349-ডেস্ক)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৬: sfs349-মোবাইল-390 (কম্প্যাক্ট-offset 1px) + কাউন্টার-সততা ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.focus();return 'm1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
MOB=$(unjj "$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];if(!r)return{got:false};var cs=getComputedStyle(r.querySelector('.hr330-d'));var d=r.querySelector('.hr349-d');return{got:true,id:r.getAttribute('aria-describedby'),col:cs.color,off:cs.textUnderlineOffset,sp:!!d}})())")")
MOBJ=$(unjj "$MOB")
if [ "$(jf got "$MOBJ")" = "true" ] && [ "$(jf id "$MOBJ")" = "hr349-d-E" ] && [ "$(jf col "$MOBJ")" = "rgba(67, 56, 202, 0.95)" ] && [ "$(jf off "$MOBJ")" = "1px" ] && [ "$(jf sp "$MOBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 কম্প্যাক্ট (offset 1px-≤640px-গেট {2px-অনুপস্থিত} + ইন্দিগো-টোন + attr-স্থায়িত্ব + উৎস-span)"; else bad "ই২ই: মোবাইল $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
CS=$(unjj "$(ev "JSON.stringify({dl:window.__hrAria347QA.dl,sv:window.__hrAria347QA.sv,navs:window.__hrAria345QA.navs,reg:window.__hrAria333QA.rows(),ds:window.__hrAria349QA.ds().length,e349:window.__hrAria349QA.err,e348:window.__hrAria348QA.err,e347:window.__hrAria347QA.err,e346:window.__hrAria346QA.err,e345:window.__hrAria345QA.err})")")
CSJ=$(unjj "$CS")
if [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf ds "$CSJ")" = "9" ] && [ "$(jf dl "$CSJ")" = "0" ] && [ "$(jf sv "$CSJ")" = "0" ] && [ "$(jf e349 "$CSJ")" = "" ] && [ "$(jf e348 "$CSJ")" = "" ] && [ "$(jf e347 "$CSJ")" = "" ] && [ "$(jf e346 "$CSJ")" = "" ] && [ "$(jf e345 "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা {রেজিস্ট্রি-৯ + ds ×৯ + hr347-লেজার-শূন্য {dl=০/sv=০} + q345h-নেভ-লেজার + সর্ব-হুক-ত্রুটি-শূন্য}"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi

echo "── ধাপ-৭: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr349')>=0||ks[i].indexOf('hr348')>=0)return false}return true})(),q349:!!window.__hrAria349QA,ds:(window.__hrAria349QA?window.__hrAria349QA.ds():[-1]).length})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf noKey "$CLNJ")" = "true" ] && [ "$(jf q349 "$CLNJ")" = "true" ] && [ "$(jf ds "$CLNJ")" = "0" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr349/hr348-কী-শূন্য-সহ} + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব + নির্মাণ-পূর্ব-ds=[] (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s349console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s349-suite ✓ সর্ব-সবুজ"; else echo "s349-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
