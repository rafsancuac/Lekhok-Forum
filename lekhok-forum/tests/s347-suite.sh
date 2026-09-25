#!/bin/bash
# s347-suite.sh — session347: hr347 D/S-সারি-Enter-সক্রিয়করণ I/O-লেজার + sfs347 সায়ান-I/O-ফ্ল্যাশ-ভ্যারিয়েন্ট
# [Task ID 184] PLANS session346-নোটের প্রস্তাব-②-তৃতীয়-বিকল্প প্রয়োগ (dlHist324-ব্লব-পথ-assert-চ্যালেঞ্জ-সমাধান)
#   (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন — 9232ab4-ডিপ্লয়-প্রমাণ READY: vercel home-200 + session334-মার্কার ×২-লাইভ-
#   /assets/css/style.css-এ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated — hr346-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত):
#   hr347 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     এক-উৎস-সংযোগ: q346h.last-মার্কার-পাঠ-কেবল ('act:D@N'/'act:S@N') — সম-মূল-Enter-ইভেন্টে শ্রোতা-নিবন্ধন-ক্রম;
#       synthetic-'D'/'S'-প্রতিনিধি-ইভেন্ট = key!=='Enter'-ফিল্টার-বহি — পুনঃপ্রবেশ-শূন্য।
#     গেট (নয়েজ-ফিল্টার): key==='Enter' ∧ মডিফায়ার-বর্জন ∧ ovOpen330 ∧ li-অভ্যন্তর ∧ q346h.last-মিল —
#       li-বহি-নীরব-Enter-এ পুরাতন-মার্কার-দূষণ-শূন্য।
#     লেজার (সম্পন্ন-কেবল): D → dlHist324-সম-গেট (hist≥১) → dl+bytesD = Blob([strip324()]).size (আকার-পাঠ-কেবল);
#       S → dlPv329-সম-গেট → sv+bytesS; শূন্য-ইতিহাস = 'io:D@skip'/'io:S@skip' — লেজার-বহি + .hr347-io-ফ্ল্যাশ-বহি।
#     I/O-ফ্ল্যাশ-ভ্যারিয়েন্ট: .hr347-io (সায়ান-পরিবার — sfs347) ১.২s-স্বয়ং-নিরামড — .hr346-act-সহাবস্থান।
#     চুক্তি: ovRows330/q-কাউন্টার/storage-অস্পৃশ্য {q346h.last-পাঠ-কেবল}; ক্লিপবোর্ড-স্পর্শ-শূন্য; s346…s330-হুক-অটুট।
#   sfs347 (ইনলাইন-<style> session347-ব্লক — cascade EOF-session346-পরে — হেক্স-শূন্য rgba-only):
#     সায়ান-পরিবার = ফাইল-I/O-সম্পন্ন-সংকেত (নতুন-পরিবার-বিভাজন); কম্পাউন্ড-ক্যাসকেড .hr347-io.hr346-act
#     (সায়ান-জয়); ≤640px-কম্প্যাক্ট inset 1.5px; MO=৪-অটুট।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) + ফ্ল্যাট-এনকোডিং-রীতি (s345-গোটচা-①) +
#         dl-stub-পথ (s324-রীতি — URL.createObjectURL-মাইগ্রেট-stub — ব্লব-আকার-ক্যাপচার)।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s347-io-desk.png
SH_MOB=/home/z/my-project/download/s347-io-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s347console){window.__s347console=0;var oe=console.error;console.error=function(){window.__s347console=(window.__s347console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
opentip(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();return 'r2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s347-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s347-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr347+sfs347-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + লেজার-চুক্তি) ──"
HN=$(grep -c 'hr347' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 10 ]; then ok "home-reorder.ejs: hr347-রেফারেন্স-লাইন ×$HN (হুক+লেজার+স্টাইল-সহাবস্থান)"; else bad "hr347-রেফারেন্স-অপ্রতুল ($HN)"; fi
A347CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A347CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr347-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS347=$(sed -n '/session347 (sfs347 D\/S-I\/O-ফ্ল্যাশ-ভ্যারিয়েন্ট — admin-ইনলাইন)/,/EOF session347/p' "$EJSF")
HEXN=$(printf '%s' "$CSS347" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS347" ]; then ok "home-reorder.ejs: session347-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session347-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS347" | grep -c 'session347' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session347-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session347-মার্কার ×$BN (<২)"; fi
C347AFTER=$(grep -n 'EOF session347' "$EJSF" | head -1 | cut -d: -f1)
C346BEFORE=$(grep -n 'EOF session346' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C347AFTER" ] && [ -n "$C346BEFORE" ] && [ "$C347AFTER" -gt "$C346BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session347-ব্লক session346-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (347@$C347AFTER vs 346@$C346BEFORE)"; fi
B347=$(grep -c 'session347' "$APP/public/assets/css/style.css" | tr -d ' ')
B346=$(grep -c 'session346' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B347" = "0" ] && [ "$B346" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session347/346-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (347=$B347 346=$B346 334=$GOODCSS)"; fi
IOREF=$(grep -c 'hr347-io' "$EJSF" | tr -d ' ')
ONEsrc=$(grep -c "q346h.last || ''" "$EJSF" | tr -d ' ')
LG=$(grep -c "new Blob(\[strip324()\]).size" "$EJSF" | tr -d ' ')
SKIPG=$(grep -c "io:D@skip" "$EJSF" | tr -d ' ')
if [ "$IOREF" -ge 5 ] && [ "$ONEsrc" = "1" ] && [ "$LG" -ge 2 ] && [ "$SKIPG" -ge 1 ]; then ok ".hr347-io-রেফারেন্স ×$IOREF (স্টাইল+লেজার+ফ্ল্যাশ) + q346h.last-এক-উৎস-পাঠ ×$ONEsrc (লেখা-শূন্য) + ব্লব-আকার-পাঠ ×$LG (D+S — ডাউনলোড-স্পর্শ-শূন্য) + skip-গেট-মার্কার ×$SKIPG"; else bad "লেজার-চুক্তি-অমিল (io=$IOREF one=$ONEsrc blob=$LG skip=$SKIPG)"; fi
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
DLCNT=$(grep -c "ovRows330 = \[" "$EJSF" | tr -d ' ')
if [ "$RG" = "1" ] && [ "$DLCNT" = "1" ]; then ok "ovRows330-৯-সারি-রেজিস্ট্রি-মিরর-অটুট (hr347-অ্যারে-অস্পৃশ্য-চুক্তি — সর্ব-সারি-এক-উৎস)"; else bad "রেজিস্ট্রি-মিরর-অমিল ($RG/$DLCNT)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr347-ই২ই (I/O-লেজার + skip-পথ + ব্লব-ক্যাপচার + নয়েজ-ফিল্টার + সহাবস্থান) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria347QA,dl:window.__hrAria347QA?window.__hrAria347QA.dl:-1,sv:window.__hrAria347QA?window.__hrAria347QA.sv:-1,bd:window.__hrAria347QA?window.__hrAria347QA.bytesD:-1,bs:window.__hrAria347QA?window.__hrAria347QA.bytesS:-1,last:window.__hrAria347QA?window.__hrAria347QA.last:'x',e:((window.__hrAria347QA||{}).err||''),q346:!!window.__hrAria346QA,q345:!!window.__hrAria345QA,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf dl "$Q0J")" = "0" ] && [ "$(jf sv "$Q0J")" = "0" ] && [ "$(jf bd "$Q0J")" = "0" ] && [ "$(jf bs "$Q0J")" = "0" ] && [ "$(jf last "$Q0J")" = "" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf q346 "$Q0J")" = "true" ] && [ "$(jf q345 "$Q0J")" = "true" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ]; then ok "ই২ই: __hrAria347QA-হুক (লেজার=০ + last-শূন্য — নীরব-শূন্য-অবস্থা) + s346–s330-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
opentip
SKIP1=$(ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[1];var d0=window.__hrAria324QA.downloads;r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{last346:window.__hrAria346QA.last,last347:window.__hrAria347QA.last,dl:window.__hrAria347QA.dl,q324d:window.__hrAria324QA.downloads-d0,f346:r.classList.contains('hr346-act'),f347:r.classList.contains('hr347-io')}})())")
SKIP1J=$(unjj "$SKIP1")
if [ "$(jf last346 "$SKIP1J")" = "act:D@-1" ] && [ "$(jf last347 "$SKIP1J")" = "io:D@skip" ] && [ "$(jf dl "$SKIP1J")" = "0" ] && [ "$(jf q324d "$SKIP1J")" = "0" ] && [ "$(jf f346 "$SKIP1J")" = "true" ] && [ "$(jf f347 "$SKIP1J")" = "false" ]; then ok "ই২ই: D-সারি-শূন্য-ইতিহাস-skip-পথ (dlHist324-সম-গেট → io:D@skip-মার্কার + লেজার-বহি {dl=০/q324h-অপরিবর্তিত} + .hr347-io-ফ্ল্যাশ-বহি {সায়ান = I/O-সম্পন্ন-অর্থবিদ্যা} + hr346-ফ্ল্যাশ-সহাবস্থান)"; else bad "ই২ই: skip $(unjj "$SKIP1")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'g1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
NOISE=$(ev "JSON.stringify({dl:window.__hrAria347QA.dl,last347:window.__hrAria347QA.last,last346:window.__hrAria346QA.last})")
NOISEJ=$(unjj "$NOISE")
if [ "$(jf dl "$NOISEJ")" = "0" ] && [ "$(jf last347 "$NOISEJ")" = "io:D@skip" ] && [ "$(jf last346 "$NOISEJ")" = "act:D@-1" ]; then ok "ই২ই: li-বহি-Enter-নয়েজ-ফিল্টার (document-Enter = পুরাতন-মার্কার-দূষণ-শূন্য {last346-অপরিবর্তিত + লেজার-অটুট — গেট-মিরর-প্রমাণ})"; else bad "ই২ই: নয়েজ $(unjj "$NOISE")"; fi
ev "JSON.stringify((function(){if(!window.__cc347set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap347=t;return Promise.resolve()}},configurable:true});window.__cc347set=true}return 'stub'})())" >/dev/null 2>&1
opentip
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
HIST=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length})")
if [ "$(jf h "$(unjj "$HIST")")" = "2" ]; then ok "ই২ই: ইতিহাস-বীজ (দ্বি-aria-copy-ক্লিক → hist=২ — স্টাব-ক্লিপবোর্ড-রীতি)"; else bad "ই২ই: বীজ $(unjj "$HIST")"; fi
ev "JSON.stringify((function(){window.__dlStub347={sizes:[],clicks:0,names:[]};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub347.sizes.push(b?b.size:-1);return 'blob:qa-stub'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub347.clicks+=1;window.__dlStub347.names.push(this.getAttribute('download')||'');return}return ocl.call(this)};window.__hrAria330QA.open('qa');return 'dstub-open'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
D1=$(ev "JSON.stringify((function(){var d0=window.__hrAria324QA.downloads;var r=document.querySelectorAll('.hr330-ov .hr330-li')[1];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{last346:window.__hrAria346QA.last,last347:window.__hrAria347QA.last,dl:window.__hrAria347QA.dl,bd:window.__hrAria347QA.bytesD,ss:window.__dlStub347.sizes[0],ck:window.__dlStub347.clicks,q324d:window.__hrAria324QA.downloads-d0,f346:r.classList.contains('hr346-act'),f347:r.classList.contains('hr347-io')}})())")
D1J=$(unjj "$D1")
if [ "$(jf last346 "$D1J")" = "act:D@-1" ] && [ "$(printf '%s' "$(jf last347 "$D1J")" | grep -c 'io:D@')" = "1" ] && [ "$(jf dl "$D1J")" = "1" ] && [ "$(jf bd "$D1J")" = "$(jf ss "$D1J")" ] && [ "$(jf bd "$D1J")" != "0" ] && [ "$(jf ck "$D1J")" = "1" ] && [ "$(jf q324d "$D1J")" = "1" ] && [ "$(jf f346 "$D1J")" = "true" ] && [ "$(jf f347 "$D1J")" = "true" ]; then ok "ই২ই: D-সারি-Enter-I/O-লেজার (dl=১ + bytesD ≡ স্টাব-ব্লব-আকার {দ্বি-পর্যবেক্ষক-ক্রস-ভ্যালিডেশন — dlHist324-সম-এক-উৎস-payload} + স্টাব-ক্লিক=১ {ব্লব+অ্যাঙ্কর-পথ-প্রমাণ} + q324h-ডেল্টা=১-সমতা + দ্বি-ফ্ল্যাশ-সহাবস্থান {.hr346-act+.hr347-io})"; else bad "ই২ই: D-লেজার $(unjj "$D1")"; fi
agent-browser wait 1400 >/dev/null 2>&1
FLD=$(ev "JSON.stringify({f346:(document.querySelectorAll('.hr330-ov .hr330-li')[1].classList.contains('hr346-act')),f347:(document.querySelectorAll('.hr330-ov .hr330-li')[1].classList.contains('hr347-io'))})")
FLDJ=$(unjj "$FLD")
if [ "$(jf f346 "$FLDJ")" = "false" ] && [ "$(jf f347 "$FLDJ")" = "false" ]; then ok "ই২ই: দ্বি-ফ্ল্যাশ-১.২s-স্বয়ং-নিরামড (hr346+hr347-সম-রীতি — রি-রেন্ডার-বিহীন-অবস্থা-পরিষ্কার)"; else bad "ই২ই: নিরামড $(unjj "$FLD")"; fi
S1=$(ev "JSON.stringify((function(){var d0=window.__hrAria329QA.downloads;var r=document.querySelectorAll('.hr330-ov .hr330-li')[6];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{last347:window.__hrAria347QA.last,sv:window.__hrAria347QA.sv,bs:window.__hrAria347QA.bytesS,ss2:window.__dlStub347.sizes[1],ck:window.__dlStub347.clicks,nm2:window.__dlStub347.names[1]||'',q329d:window.__hrAria329QA.downloads-d0,f347:r.classList.contains('hr347-io')}})())")
S1J=$(unjj "$S1")
if [ "$(printf '%s' "$(jf last347 "$S1J")" | grep -c 'io:S@')" = "1" ] && [ "$(jf sv "$S1J")" = "1" ] && [ "$(jf bs "$S1J")" = "$(jf ss2 "$S1J")" ] && [ "$(jf bs "$S1J")" != "0" ] && [ "$(jf ck "$S1J")" = "2" ] && [ "$(jf q329d "$S1J")" = "1" ] && [ "$(jf f347 "$S1J")" = "true" ] && printf '%s' "$(jf nm2 "$S1J")" | grep -qE '^lekhok-preview-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}\.txt$'; then ok "ই২ই: S-সারি-Enter-I/O-লেজার (sv=১ + bytesS ≡ স্টাব-আকার {dlPv329-সম-এক-উৎস} + q329h-ডেল্টা=১ + .hr347-io-ফ্ল্যাশ + প্রিভিউ-ফাইলনাম-প্রমাণ [lekhok-preview-*.txt])"; else bad "ই২ই: S-লেজার $(unjj "$S1")"; fi
ev "JSON.stringify((function(){window.__e347expect=window.__hrAria324QA.strip();window.__e347c0=window.__hrAria324QA.copies;var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
EN=$(ev "JSON.stringify({last346:window.__hrAria346QA.last,last347:window.__hrAria347QA.last,dl:window.__hrAria347QA.dl,sv:window.__hrAria347QA.sv,f347:(document.querySelectorAll('.hr330-ov .hr330-li')[0].classList.contains('hr347-io')),cap:window.__clipCap347===window.__e347expect,cp324:window.__hrAria324QA.copies-window.__e347c0})")
ENJ=$(unjj "$EN")
if [ "$(jf last346 "$ENJ")" = "act:E@-1" ] && [ "$(printf '%s' "$(jf last347 "$ENJ")" | grep -c 'io:S@')" = "1" ] && [ "$(jf dl "$ENJ")" = "1" ] && [ "$(jf sv "$ENJ")" = "1" ] && [ "$(jf f347 "$ENJ")" = "false" ] && [ "$(jf cap "$ENJ")" = "true" ] && [ "$(jf cp324 "$ENJ")" = "1" ]; then ok "ই২ই: E-সারি-Enter-লেজার-বহি (অ-I/O-সারি → লেজার-অটুট {dl/sv-অপরিবর্তিত + .hr347-io-শূন্য} + E-প্রতিনিধি-অটুট {ক্লিপবোর্ড-ক্যাপ ≡ strip324 + copies-ডেল্টা=১ — s346-চুক্তি-সহাবস্থান})"; else bad "ই২ই: E-বহি $(unjj "$EN")"; fi
agent-browser wait 1400 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
NAT=$(ev "JSON.stringify({dl:window.__hrAria347QA.dl,q324d:window.__hrAria324QA.downloads,ck:window.__dlStub347.clicks,last347:window.__hrAria347QA.last})")
NATJ=$(unjj "$NAT")
if [ "$(jf dl "$NATJ")" = "1" ] && [ "$(jf q324d "$NATJ")" = "2" ] && [ "$(jf ck "$NATJ")" = "3" ] && [ "$(printf '%s' "$(jf last347 "$NATJ")" | grep -c 'io:')" = "1" ]; then ok "ই২ই: নেটিভ-'d'-কীবোর্ড-পথ-লেজার-বহি (aria-copy-ফোকাসে 'd' → q324h-ডেল্টা+স্টাব-পথ-প্রমাণ {downloads=২/clicks=৩} কিন্তু q347h.dl-অপরিবর্তিত {Enter-প্রতিনিধি-কেবল-লেজার — পথ-নির্দিষ্ট-অর্থবিদ্যা})"; else bad "ই২ই: নেটিভ $(unjj "$NAT")"; fi
CS=$(ev "JSON.stringify({opens:window.__hrAria330QA.opens,closes:window.__hrAria330QA.closes,navs:window.__hrAria345QA.navs,homes:window.__hrAria345QA.homes,ends:window.__hrAria345QA.ends,wraps:window.__hrAria345QA.wraps,acts:window.__hrAria346QA.acts,blocked:window.__hrAria346QA.blocked,cp344:window.__hrAria344QA.copies,hist:window.__hrAria317QA.hist().length,reg:window.__hrAria333QA.rows(),dl:window.__hrAria347QA.dl,sv:window.__hrAria347QA.sv,e347:window.__hrAria347QA.err,e346:window.__hrAria346QA.err,e345:window.__hrAria345QA.err})")
CSJ=$(unjj "$CS")
if [ "$(jf opens "$CSJ")" -ge 3 ] && [ "$(jf navs "$CSJ")" = "0" ] && [ "$(jf acts "$CSJ")" = "4" ] && [ "$(jf blocked "$CSJ")" = "0" ] && [ "$(jf cp344 "$CSJ")" = "0" ] && [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf dl "$CSJ")" = "1" ] && [ "$(jf sv "$CSJ")" = "1" ] && [ "$(jf e347 "$CSJ")" = "" ] && [ "$(jf e346 "$CSJ")" = "" ] && [ "$(jf e345 "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা-সহাবস্থান (q345h-নেভ-লেজার-শূন্য {Enter-নেভ-গণনা-স্পর্শ-শূন্য} + q346h {acts=৪ — skip-D+D+S+E-প্রতিনিধি / blocked=০} + q344h.copies-অটুট + q347h {dl=১/sv=১} + রেজিস্ট্রি-৯ + সর্ব-হুক-ত্রুটি-শূন্য)"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[1];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var cs=r?getComputedStyle(r):null;var bg=cs?cs.backgroundColor:'';var sh=cs?cs.boxShadow:'';return{dl:window.__hrAria347QA.dl,bgCyan:bg.indexOf('8, 145, 178')>=0,shInset:sh.indexOf('inset')>=0,sh2:sh.indexOf('2px')>=0,kCyan:(function(){var k=r.querySelector('.hr330-k');var csk=k?getComputedStyle(k):null;return csk?csk.backgroundColor.indexOf('8, 145, 178')>=0:false})()}})())" >/dev/null 2>&1
agent-browser wait 200 >/dev/null 2>&1
DESK=$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li.hr347-io')[0];if(!r)return{got:false};var cs=getComputedStyle(r);var k=r.querySelector('.hr330-k');var csk=k?getComputedStyle(k):null;return{got:true,bgCyan:cs.backgroundColor.indexOf('8, 145, 178')>=0,shInset:cs.boxShadow.indexOf('inset')>=0,sh2:cs.boxShadow.indexOf('2px')>=0,kCyan:csk?csk.backgroundColor.indexOf('8, 145, 178')>=0:false,dl:window.__hrAria347QA.dl}})())")
DESKJ=$(unjj "$DESK")
if [ "$(jf got "$DESKJ")" = "true" ] && [ "$(jf bgCyan "$DESKJ")" = "true" ] && [ "$(jf sh2 "$DESKJ")" = "true" ] && [ "$(jf kCyan "$DESKJ")" = "true" ] && [ "$(jf dl "$DESKJ")" = "2" ]; then ok "ই২ই: sfs347-ডেস্ক-কম্পাউন্ড-ক্যাসকেড (.hr347-io.hr346-act → সায়ান-জয় {bg rgba(8,145,178)-ব্যান্ড + inset 2px + কী-চিপ-সায়ান} — I/O-নির্দিষ্ট-টোন-সংকেত)"; else bad "ই২ই: ডেস্ক $(unjj "$DESK")"; fi
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৭)');window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[1];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'sc1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-ওভারলে + সায়ান-I/O-ফ্ল্যাশ-সারি)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs347-মোবাইল-390 (I/O-কম্পাক্ট-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
opentip
ev "JSON.stringify((function(){if(!window.__cc347set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){return Promise.resolve()}},configurable:true});window.__cc347set=true}return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1m'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[6];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
MOB=$(ev "JSON.stringify((function(){var r=document.querySelector('.hr330-ov .hr330-li.hr347-io');if(!r)return{got:false};var cs=getComputedStyle(r);var sh=cs.boxShadow;return{got:true,sv:window.__hrAria347QA.sv,bgCyan:cs.backgroundColor.indexOf('8, 145, 178')>=0,sh15:sh.indexOf('1.5px')>=0,sh2:sh.indexOf('2px')>=0}})())")
MOBJ=$(unjj "$MOB")
if [ "$(jf got "$MOBJ")" = "true" ] && [ "$(jf sv "$MOBJ")" = "1" ] && [ "$(jf bgCyan "$MOBJ")" = "true" ] && [ "$(jf sh15 "$MOBJ")" = "true" ] && [ "$(jf sh2 "$MOBJ")" = "false" ]; then ok "ই২ই: মোবাইল-390 I/O-কম্পাক্ট (inset 1.5px-≤640px-গেট {2px-অনুপস্থিত} + সায়ান-bg-ব্যান্ড {rgba(8,145,178)} + io:S@-লেজার {rld-পুনঃআরম্ভ-গণনা-রীতি — sv=১-পোস্ট-রিলোড} + hr321-hist-স্থায়িত্ব-গেট)"; else bad "ই২ই: মোবাইল $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr347')>=0||ks[i].indexOf('hr346')>=0)return false}return true})(),q347:!!window.__hrAria347QA})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf noKey "$CLNJ")" = "true" ] && [ "$(jf q347 "$CLNJ")" = "true" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr347/hr346-কী-শূন্য-সহ} + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব + হুক-পুনঃসংজ্ঞা (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s347console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s347-suite ✓ সর্ব-সবুজ"; else echo "s347-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
