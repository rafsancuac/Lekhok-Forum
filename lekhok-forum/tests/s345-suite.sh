#!/bin/bash
# s345-suite.sh — session345: hr345 ওভারলে-সারি-কীবোর্ড-নেভিগেশন (↑/↓/Home/End — সারি-ফোকাস-যাত্রা) + sfs345 কার্সর-টোন
# [Task ID 182] PLANS session344-নোটের প্রস্তাব-②-দ্বিতীয়-বিকল্প প্রয়োগ (৯-সারি-যুগে নতুন-মূল্যায়ন-সম্পন্ন-গৃহীত)
#   (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন — 9654d4f-ডিপ্লয়-প্রমাণ: vercel home-200 + session334-মার্কার ×২-লাইভ-
#   /assets/css/style.css-এ + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated + hr344/hr343-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত):
#   hr345 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     mkLi330-এক-লাইন-সম্প্রসারণ: li330.tabIndex = -1 (প্রোগ্রাম্যাটিক-ফোকাসযোগ্য — নির্মাতা-এক-উৎস —
#       build/rebuild-সম-পথ — ট্যাব-ক্রম-অস্পৃশ্য)।
#     গেট: ovOpen330 ∧ টার্গেট-সর্বনিকট .hr330-ov (ওভারলে-অভ্যন্তর-উৎস-কেবল — .hr-aria-copy-প্রেক্ষাপট =
#       hr320-ইতিহাস-পয়েন্টার-অটুট — দ্বি-নেভ-সংঘর্ষ-শূন্য; sfs292-phone-arrow-পথ-সহ সর্ব-পুরাতন-সুইট-শূন্য-স্পর্শ)।
#     কার্সর-মেশিন (syncNav345-এক-উৎস — রি-রেন্ডার-বিহীন — শ্রেণি-কেবল — MO=৪-অটুট): navIdx345 (−১ =
#       কার্সর-শূন্য); ArrowDown = +১ {৮→০-মোড়ক}, ArrowUp = −১ {০→৮-মোড়ক}, Home = ০, End = ৮; কার্সর-
#       শূন্য-প্রবেশ: Down→প্রথম, Up→শেষ; .hr345-cursor-শ্রেণি-সিঙ্ক + সারি-focus() (সত্যিকার-ফোকাস-যাত্রা)।
#     Space-ব্লক (li-উৎস-কেবল — .hr330-x-বাটন-অস্পৃশ্য) + মিশ্র-পথ-সমতা (সারি-ক্লিক = কার্সর + ফোকাস) +
#     জীবন্ত-সিঙ্ক ত্রি-মোড়ক {openOv330-মোড়ক (ooOrig345 — খোলায় কার্সর-রিসেট) + closeOv330-মোড়ক (coOrig345 —
#     বন্ধে কার্সর-পরিষ্কার + অভ্যন্তর-ফোকাস-ব্লার — hidden-ফোকাস-ফাঁদ-নিবারণ) + rebuildOv330-মোড়ক (rbOrig345 —
#     tabIndex-মিলিত + কার্সর-পুনঃপ্রয়োগ)}; চুক্তি: ovRows330-অ্যারে-অস্পৃশ্য (৯-সারি-স্থায়িত্ব); q320/…/q344h-
#     কাউন্টার-অস্পৃশ্য; storage-অস্পৃশ্য; s344…s333-হুক-সহাবস্থান-অটুট।
#   sfs345 (ইনলাইন-<style> session345-ব্লক — cascade EOF-session344-পরে — হেক্স-শূন্য rgba-only):
#     সবুজ-পরিবার কার্সর-টোন (inset-বার + ক-চিপ-বুস্ট + :focus/:focus-visible রিং + reduced-motion +
#     ≤640px-কম্প্যাক্ট inset 1.5px); নতুন-অবস্থা-টোন-কেবল — বিদ্যমান-সারি-ডিফল্ট-রূপ-অস্পৃশ্য — MO=৪-অটুট।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা — পরম-assert-নিষিদ্ধ) + পরিষ্কারণ-চুক্তি (hr337-hints +
#         hr326-fmt + hr321-hist) + কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) +
#         কার্সর-এনকোডিং-ফ্ল্যাট-রীতি {i:k|'null' — unjj-নিরাপদ — নেস্টেড-JSON.stringify-নিষিদ্ধ}
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s345-ovnav-desk.png
SH_MOB=/home/z/my-project/download/s345-ovnav-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s345console){window.__s345console=0;var oe=console.error;console.error=function(){window.__s345console=(window.__s345console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
opentip(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();return 'r2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
CURF(){ printf '%s' "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('cur'); print('null' if not c else str(c.get('i'))+':'+str(c.get('k')))" 2>/dev/null; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s345-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s345-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr345+sfs345-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + tabIndex-নির্মাতা) ──"
HN=$(grep -c 'hr345' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 10 ]; then ok "home-reorder.ejs: hr345-রেফারেন্স-লাইন ×$HN (হুক+নেভ+স্টাইল-সহাবস্থান)"; else bad "hr345-রেফারেন্স-অপ্রতুল ($HN)"; fi
A345CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A345CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr345-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS345=$(sed -n '/session345 (sfs345 ওভারলে-সারি-কীবোর্ড-নেভিগেশন-কার্সর — admin-ইনলাইন)/,/EOF session345/p' "$EJSF")
HEXN=$(printf '%s' "$CSS345" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS345" ]; then ok "home-reorder.ejs: session345-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session345-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS345" | grep -c 'session345' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session345-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session345-মার্কার ×$BN (<২)"; fi
C345AFTER=$(grep -n 'EOF session345' "$EJSF" | head -1 | cut -d: -f1)
C344BEFORE=$(grep -n 'EOF session344' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C345AFTER" ] && [ -n "$C344BEFORE" ] && [ "$C345AFTER" -gt "$C344BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session345-ব্লক session344-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (345@$C345AFTER vs 344@$C344BEFORE)"; fi
B345=$(grep -c 'session345' "$APP/public/assets/css/style.css" | tr -d ' ')
B344=$(grep -c 'session344' "$APP/public/assets/css/style.css" | tr -d ' ')
B343=$(grep -c 'session343' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B345" = "0" ] && [ "$B344" = "0" ] && [ "$B343" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session345/344/343-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (345=$B345 344=$B344 343=$B343 334=$GOODCSS)"; fi
TB=$(grep -cE '^[[:space:]]*li330\.tabIndex = -1;' "$EJSF" | tr -d ' ')
CUR=$(grep -c 'hr345-cursor' "$EJSF" | tr -d ' ')
if [ "$TB" = "1" ] && [ "$CUR" -ge 6 ]; then ok "mkLi330-tabIndex-নির্মাতা-এক-উৎস ×$TB + .hr345-cursor-শ্রেণি-রেফারেন্স ×$CUR (নেভ+স্টাইল+হুক)"; else bad "নির্মাতা/শ্রেণি-রেফারেন্স-অপ্রতুল (tabIndex=$TB cursor=$CUR)"; fi
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
if [ "$RG" = "1" ]; then ok "ovRows330-৯-সারি-রেজিস্ট্রি-মিরর-অটুট (hr345-অ্যারে-অস্পৃশ্য-চুক্তি — সর্ব-সারি-এক-উৎস)"; else bad "রেজিস্ট্রি-মিরর-অমিল ($RG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr345-ই২ই (ফোকাস-যাত্রা + মোড়ক + মিশ্র-পথ + সহাবস্থান) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria345QA,navs:window.__hrAria345QA?window.__hrAria345QA.navs:-1,idx:window.__hrAria345QA?window.__hrAria345QA.idx():-2,cur:window.__hrAria345QA?window.__hrAria345QA.cur():null,rows:window.__hrAria345QA?window.__hrAria345QA.rows():-1,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA,e:((window.__hrAria345QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf navs "$Q0J")" = "0" ] && [ "$(jf idx "$Q0J")" = "-1" ] && [ "$(CURF "$Q0J")" = "null" ] && [ "$(jf rows "$Q0J")" = "0" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria345QA-হুক (কাউন্টার=০ + কার্সর-শূন্য {idx=-১, cur=null} + ওভারলে-অনির্মিত rows()=০ — নীরব-শূন্য-অবস্থা) + s344–s330-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
opentip
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৫)');window.__hrAria330QA.open('qa');return 'o1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
OO0=$(ev "JSON.stringify({opens:window.__hrAria330QA.opens,rows:window.__hrAria345QA.rows(),tb:[].slice.call(document.querySelectorAll('.hr330-ov .hr330-li')).filter(function(r){return r.tabIndex===-1}).length,cur:window.__hrAria345QA.cur(),bar:window.__hrAria344QA.bar()})")
OO0J=$(unjj "$OO0")
if [ "$(jf opens "$OO0J")" = "1" ] && [ "$(jf rows "$OO0J")" = "9" ] && [ "$(jf tb "$OO0J")" = "9" ] && [ "$(CURF "$OO0J")" = "null" ] && [ "$(jf bar "$OO0J")" = "true" ]; then ok "ই২ই: ওভারলে-নির্মাণ-পথ (q330h.open → rows()=৯ + tabIndex=-১ ×৯ {mkLi330-এক-উৎস-প্রমাণ} + কার্সর-শূন্য-অটুট + hr344-বার-সহাবস্থান)"; else bad "ই২ই: ওভারলে-নির্মাণ $(unjj "$OO0")"; fi
GATE=$(ev "JSON.stringify((function(){var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();ac[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return{navs:window.__hrAria345QA.navs,idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur()}})())")
GATEJ=$(unjj "$GATE")
if [ "$(jf navs "$GATEJ")" = "0" ] && [ "$(jf idx "$GATEJ")" = "-1" ] && [ "$(CURF "$GATEJ")" = "null" ]; then ok "ই২ই: দ্বি-নেভ-সংঘর্ষ-শূন্য (.hr-aria-copy-প্রেক্ষাপটে ArrowDown = hr320-ইতিহাস-পয়েন্টার-অঞ্চল — hr345-গেট-নীরব {navs=০ + কার্সর-শূন্য} — ওভারলে-অভ্যন্তর-উৎস-কেবল)"; else bad "ই২ই: গেট $(unjj "$GATE")"; fi
N1=$(ev "JSON.stringify((function(){document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var li=document.querySelectorAll('.hr330-ov .hr330-li');return{navs:window.__hrAria345QA.navs,idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),ae:(document.activeElement===li[0]),tb:document.activeElement?document.activeElement.tabIndex:-2,last:window.__hrAria345QA.last}})())")
N1J=$(unjj "$N1")
if [ "$(jf navs "$N1J")" = "1" ] && [ "$(jf idx "$N1J")" = "0" ] && [ "$(CURF "$N1J")" = "0:E" ] && [ "$(jf ae "$N1J")" = "true" ] && [ "$(jf tb "$N1J")" = "-1" ] && [ "$(jf last "$N1J")" = "down:0" ]; then ok "ই২ই: ArrowDown-ফোকাস-যাত্রা (কার্সর-শূন্য-প্রবেশ → সারি-০ {'E'} + .hr345-cursor + সত্যিকার-ফোকাস {activeElement=সারি-০, tabIndex=-১} + down:0-মার্কার)"; else bad "ই২ই: ArrowDown $(unjj "$N1")"; fi
W1=$(ev "JSON.stringify((function(){var i;for(i=0;i<8;i++)document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var li=document.querySelectorAll('.hr330-ov .hr330-li');return{navs:window.__hrAria345QA.navs,idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),ae:(document.activeElement===li[8])}})())")
W1J=$(unjj "$W1")
if [ "$(jf navs "$W1J")" = "9" ] && [ "$(jf idx "$W1J")" = "8" ] && [ "$(CURF "$W1J")" = "8:?" ] && [ "$(jf ae "$W1J")" = "true" ]; then ok "ই২ই: ArrowDown ×৮-ধারাবাহিক-যাত্রা (সারি-০→৮ — 'E'→'?' শেষ-সারি + প্রতি-ধাপে ফোকাস-অনুসরণ — clamp-বিহীন-আগাম-যাত্রা)"; else bad "ই২ই: ×৮ $(unjj "$W1")"; fi
WR1=$(ev "JSON.stringify((function(){document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return{idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),wraps:window.__hrAria345QA.wraps,navs:window.__hrAria345QA.navs}})())")
WR1J=$(unjj "$WR1")
if [ "$(jf idx "$WR1J")" = "0" ] && [ "$(CURF "$WR1J")" = "0:E" ] && [ "$(jf wraps "$WR1J")" = "1" ] && [ "$(jf navs "$WR1J")" = "10" ]; then ok "ই২ই: ৮→০-মোড়ক (ArrowDown-সর্বশেষ-সারি-সীমায় প্রথম-সারিতে মোড়ক — wraps=১)"; else bad "ই২ই: মোড়ক-ডাউন $(unjj "$WR1")"; fi
WR2=$(ev "JSON.stringify((function(){document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return{idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),wraps:window.__hrAria345QA.wraps,navs:window.__hrAria345QA.navs}})())")
WR2J=$(unjj "$WR2")
if [ "$(jf idx "$WR2J")" = "8" ] && [ "$(CURF "$WR2J")" = "8:?" ] && [ "$(jf wraps "$WR2J")" = "2" ] && [ "$(jf navs "$WR2J")" = "11" ]; then ok "ই২ই: ০→৮-মোড়ক (ArrowUp-প্রথম-সারি-সীমায় শেষ-সারিতে মোড়ক — wraps=২)"; else bad "ই২ই: মোড়ক-আপ $(unjj "$WR2")"; fi
HE=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));var h={idx:window.__hrAria345QA.idx(),homes:window.__hrAria345QA.homes};t.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));return{idx:window.__hrAria345QA.idx(),homes:h.homes,ends:window.__hrAria345QA.ends,cur:window.__hrAria345QA.cur()}})())")
HEJ=$(unjj "$HE")
if [ "$(jf homes "$HEJ")" = "1" ] && [ "$(jf ends "$HEJ")" = "1" ] && [ "$(jf idx "$HEJ")" = "8" ] && [ "$(CURF "$HEJ")" = "8:?" ]; then ok "ই২ই: Home=০/End=৮-জাম্প (homes=১ + ends=১ + ফোকাস-জাম্প-অনুসরণ — দ্বি-টার্মিনাল-যাত্রা)"; else bad "ই২ই: Home/End $(unjj "$HE")"; fi
IDN=$(ev "JSON.stringify((function(){var rows=[].slice.call(document.querySelectorAll('.hr330-ov .hr330-li'));window.__s345probe=rows[0];window.__s345n=rows.length;var ul=document.querySelector('.hr330-ov .hr330-list');window.__s345ul=ul;document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var rows2=[].slice.call(document.querySelectorAll('.hr330-ov .hr330-li'));return{same:rows2[0]===window.__s345probe,n:rows2.length===window.__s345n,ulSame:document.querySelector('.hr330-ov .hr330-list')===window.__s345ul,cursor0:rows2[0].classList.contains('hr345-cursor'),cursor1:rows2[1].classList.contains('hr345-cursor')}})())")
IDNJ=$(unjj "$IDN")
if [ "$(jf same "$IDNJ")" = "true" ] && [ "$(jf n "$IDNJ")" = "true" ] && [ "$(jf ulSame "$IDNJ")" = "true" ] && [ "$(jf cursor0 "$IDNJ")" = "true" ] && [ "$(jf cursor1 "$IDNJ")" = "false" ]; then ok "ই২ই: রি-রেন্ডার-বিহীন-প্রমাণ {৮→০-মোড়ক-পথে} (সারি-উপাদান-অভিন্নতা {rows[0]===probe} + তালিকা-উপাদান-অভিন্নতা + গণনা-স্থায়িত্ব + একক-কার্সর {সারি-০-সত্য/সারি-১-মিথ্যা} — শ্রেণি-কেবল-সিঙ্ক)"; else bad "ই২ই: অভিন্নতা $(unjj "$IDN")"; fi
WCO=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));t.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));var rows=document.querySelectorAll('.hr330-ov .hr330-li');var w=document.querySelector('.hr330-ov [data-hr343-w]');return{idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),wraps:window.__hrAria345QA.wraps,navs:window.__hrAria345QA.navs,wCur:w?w.classList.contains('hr345-cursor'):false,wArmed:w?w.classList.contains('hr343-armed'):false,wPos:w?[].indexOf.call(rows,w):-1}})())")
WCOJ=$(unjj "$WCO")
if [ "$(jf idx "$WCOJ")" = "7" ] && [ "$(CURF "$WCOJ")" = "7:W" ] && [ "$(jf wCur "$WCOJ")" = "true" ] && [ "$(jf wArmed "$WCOJ")" = "false" ] && [ "$(jf wPos "$WCOJ")" = "7" ] && [ "$(jf wraps "$WCOJ")" = "4" ] && [ "$(jf navs "$WCOJ")" = "14" ]; then ok "ই২ই: W-সারি-কার্সর-সহাবস্থান (দ্বি-ArrowUp {০→৮-মোড়ক→৭} → সারি-৭ {'W' — hr343-রাউন্ড-সারি} + data-hr343-w-হুক-সহ .hr345-cursor + wPos=৭ — অ-আর্মড-নীরব {wArmed=false — hr343-যন্ত্র-অস্পৃশ্য-প্রমাণ})"; else bad "ই২ই: W-সহাবস্থান $(unjj "$WCO")"; fi
kdsp=$(ev "JSON.stringify((function(){document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var r=document.querySelectorAll('.hr330-ov .hr330-li')[8];r.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));return{blocks:window.__hrAria345QA.blocks,last:window.__hrAria345QA.last,idx:window.__hrAria345QA.idx(),navs:window.__hrAria345QA.navs}})())")
kdspJ=$(unjj "$kdsp")
if [ "$(jf blocks "$kdspJ")" = "1" ] && [ "$(jf last "$kdspJ")" = "block:space" ] && [ "$(jf idx "$kdspJ")" = "8" ] && [ "$(jf navs "$kdspJ")" = "15" ]; then ok "ই২ই: Space-ব্লক (সারি-উৎস Space = preventDefault — পাতা-স্ক্রল-বিস্ময়-নিবারণ + blocks=১ + block:space-মার্কার + কার্সর-অটুট {নেভ-গণনা-স্পর্শ-শূন্য})"; else bad "ই২ই: Space $(unjj "$kdsp")"; fi
CL=$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[2];r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));var li=document.querySelectorAll('.hr330-ov .hr330-li');return{idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),last:window.__hrAria345QA.last,ae:(document.activeElement===li[2]),navs:window.__hrAria345QA.navs}})())")
CLJ=$(unjj "$CL")
if [ "$(jf idx "$CLJ")" = "2" ] && [ "$(CURF "$CLJ")" = "2:X" ] && [ "$(jf last "$CLJ")" = "click:2" ] && [ "$(jf ae "$CLJ")" = "true" ] && [ "$(jf navs "$CLJ")" = "15" ]; then ok "ই২ই: মিশ্র-পথ-সমতা (সারি-ক্লিক = কার্সর-সেট {সারি-২ 'X'} + ফোকাস-যাত্রা + click:2-মার্কার + নেভ-গণনা-স্পর্শ-শূন্য — পয়েন্টার-প্রবেশ→কীবোর্ড-ধারাবাহিকতা — s343-রীতি)"; else bad "ই২ই: ক্লিক $(unjj "$CL")"; fi
ESC=$(ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return{open:window.__hrAria330QA.isOpen(),cur:window.__hrAria345QA.cur(),inFocus:(document.activeElement&&document.activeElement.closest)?!!document.activeElement.closest('.hr330-ov'):false,closes:window.__hrAria330QA.closes}})())")
ESCJ=$(unjj "$ESC")
if [ "$(jf open "$ESCJ")" = "false" ] && [ "$(CURF "$ESCJ")" = "null" ] && [ "$(jf inFocus "$ESCJ")" = "false" ] && [ "$(jf closes "$ESCJ")" = "1" ]; then ok "ই২ই: Escape-বন্ধ-পরিষ্কারণ (closeOv330-মোড়ক → কার্সর-শ্রেণি-পরিষ্কার + .hr330-ov-অভ্যন্তর-ফোকাস-ব্লার {hidden-ফোকাস-ফাঁদ-নিবারণ} + closes=১-গণনা-অটুট)"; else bad "ই২ই: Escape $(unjj "$ESC")"; fi
RE=$(ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var a={idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),rows:window.__hrAria345QA.rows()};document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return{aIdx:a.idx,aCur:a.cur,aRows:a.rows,idx:window.__hrAria345QA.idx(),cur:window.__hrAria345QA.cur(),wraps:window.__hrAria345QA.wraps,navs:window.__hrAria345QA.navs}})())")
REJ=$(unjj "$RE")
if [ "$(jf aIdx "$REJ")" = "-1" ] && [ "$(printf '%s' "$REJ" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('aCur'); print('null' if not c else str(c.get('i'))+':'+str(c.get('k')))" 2>/dev/null)" = "null" ] && [ "$(jf aRows "$REJ")" = "9" ] && [ "$(jf idx "$REJ")" = "8" ] && [ "$(CURF "$REJ")" = "8:?" ] && [ "$(jf wraps "$REJ")" = "4" ] && [ "$(jf navs "$REJ")" = "16" ]; then ok "ই২ই: পুনঃখোলা-কার্সর-রিসেট (openOv330-মোড়ক → idx=-১/কার্সর-শূন্য/rows=৯ — নীরব-শূন্য-অবস্থা) + কার্সর-শূন্য-Up-প্রবেশ (→শেষ-সারি '?' — wraps-অবৃদ্ধি-শূন্য)"; else bad "ই২ই: পুনঃখোলা $(unjj "$RE")"; fi
CS=$(ev "JSON.stringify({opens:window.__hrAria330QA.opens,closes:window.__hrAria330QA.closes,bar:window.__hrAria344QA.bar(),barN:document.querySelectorAll('.hr344-bar').length,reg:window.__hrAria333QA.rows(),navs:window.__hrAria345QA.navs,e:window.__hrAria345QA.err})")
CSJ=$(unjj "$CS")
if [ "$(jf opens "$CSJ")" = "2" ] && [ "$(jf closes "$CSJ")" = "1" ] && [ "$(jf bar "$CSJ")" = "true" ] && [ "$(jf barN "$CSJ")" = "1" ] && [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf e "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা-সহাবস্থান (q330h.opens/closes-ডেল্টা-অটুট {২/১ — hr345-মোড়ক-গণনা-স্পর্শ-শূন্য} + hr344-বার-একক-স্থায়িত্ব + রেজিস্ট্রি-৯ + হুক-ত্রুটি-শূন্য)"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-ওভারলে + সবুজ-কার্সর-সারি)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs345-মোবাইল-390 (কার্সর-কম্প্যাক্ট-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
opentip
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৫)');window.__hrAria330QA.open('qa');document.querySelector('.hr330-ov .hr330-x').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
MOB=$(ev "JSON.stringify((function(){var r=document.querySelector('.hr330-ov .hr330-li.hr345-cursor');var cs=r?getComputedStyle(r):null;var sh=cs?cs.boxShadow:'';return{cur:window.__hrAria345QA.cur(),shInset:sh.indexOf('inset')>=0,sh15:sh.indexOf('1.5px')>=0}})())")
MOBJ=$(unjj "$MOB")
if [ "$(CURF "$MOBJ")" = "0:E" ] && [ "$(jf shInset "$MOBJ")" = "true" ] && [ "$(jf sh15 "$MOBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 কার্সর-কম্প্যাক্ট (inset 1.5px-≤640px-গেট — ডেস্ক-2px-বৈচিত্র্য-অটুট + কার্সর-যাত্রা-স্থায়িত্ব)"; else bad "ই২ই: মোবাইল $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,br:(window.__hrAria344QA?window.__hrAria344QA.bar():null),rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr345')>=0)return false}return true})()})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf br "$CLNJ")" = "false" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf noKey "$CLNJ")" = "true" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr345-কী-শূন্য-সহ} + বার-অনুপস্থিত + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s345console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s345-suite ✓ সর্ব-সবুজ"; else echo "s345-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
