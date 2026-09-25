#!/bin/bash
# s350-suite.sh — session350: hr350 হিন্ট-সম্পাদনা-পথ-বর্ণনা-লাইভ-সিঙ্ক + sfs350 গোলাপি-সিঙ্ক-ফ্ল্যাশ
# [Task ID 187] PLANS session349-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ:
#   hr350 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     setHint/setHints-মোড়ক-চেইন (s337-পাবলিক-API-গেট-রীতি — সর্ব-পূর্ব-মোড়ক-পরবর্তী-শেষ-মান-ক্যাপচার):
#     সফল-সেটে syncDs350() = সর্ব-সারি-পরিবর্তন-সনাক্ত-পুনঃমূল্যায়ন {hintOf334-কল-টাইম} + পরিবর্তিত-সারিতে
#     .hr350-sync-ফ্ল্যাশ ১.২s-স্বয়ং-নিরামড; ব্যাচ = এক-সিঙ্ক-পাস; q335h/q336h/q337h-পাসথ্রু-অটুট;
#     জীবন্ত-সিঙ্ক-চতুর্থ-পথ-সম্পূর্ণ {চক্র + register + স্ন্যাপশট→মোড়ক-সিঙ্ক}।
#     চুক্তি: ovRows330-অ্যারে-অস্পৃশ্য; cf349/syncDs349-অস্পৃশ্য {চক্র-পথ-নীরব-অপরিবর্তিত}; q335h.set-লিগ্যাসি-অস্পৃশ্য।
#   sfs350 (ইনলাইন-<style> session350-ব্লক — cascade EOF-session349-পরে — হেক্স-শূন্য rgba-only):
#     গোলাপি-পরিবার = হিন্ট-সম্পাদনা-সিঙ্ক-সংকেত (নতুন-পরিবার-বিভাজন — ইন্দিগো-বর্ণনা-পরে); li-bg + inset-বার +
#     .hr330-d-গোলাপি-টোন {সিঙ্ক-মুহূর্তে-ইন্দিগো-জয় — cascade-পরবর্তী}; ≤640px-কম্প্যাক্ট offset 1px;
#     সর্ব-অবস্থা-সারি-সম-আচরণ {W-কীক্যাপ-লাল-অজেয় — sfs343-.hr330-k-ক্ষেত্র-বহি}।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) + jf-None-অর্থবিদ্যা (s345-গোটচা-①)।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s350-sync-desk.png
SH_MOB=/home/z/my-project/download/s350-sync-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s350console){window.__s350console=0;var oe=console.error;console.error=function(){window.__s350console=(window.__s350console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s350-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s350-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr350+sfs350-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + লক-দ্বয়-অটুট) ──"
FN=$(grep -o 'hr350-sync' "$EJSF" | wc -l | tr -d ' ')
if [ "$FN" = "8" ]; then ok "home-reorder.ejs: .hr350-sync-রেফারেন্স ×$FN (CSS ×৫ + JS-add/remove ×২ + ডক ×১ — এক-উৎস-শ্রেণি)"; else bad ".hr350-sync-রেফারেন্স ×$FN (প্রত্যাশা ৮)"; fi
AKS=$(grep -c 'aria-keyshortcuts' "$EJSF" | tr -d ' ')
if [ "$AKS" = "7" ]; then ok "home-reorder.ejs: s348-লক-অটুট (aria-keyshortcuts ×$AKS-লাইন)"; else bad "s348-লক-ভাঙা (aria-keyshortcuts ×$AKS)"; fi
NG=$(grep -o ':not(\[data-hr343-w\])' "$EJSF" | wc -l | tr -d ' ')
if [ "$NG" = "4" ]; then ok "home-reorder.ejs: s348-লক-অটুট (:not-গার্ড ×$NG)"; else bad "s348-লক-ভাঙা (:not ×$NG)"; fi
ADN=$(grep -c 'aria-describedby' "$EJSF" | tr -d ' ')
if [ "$ADN" = "4" ]; then ok "home-reorder.ejs: s349-লক-অটুট (aria-describedby ×$ADN-লাইন — hr350-লিটারাল-স্পর্শ-শূন্য)"; else bad "s349-লক-ভাঙা (aria-describedby ×$ADN)"; fi
A350CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A350CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr350-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ ($A350CHK)"; fi
CSS350=$(sed -n '/session350 (sfs350 ওভারলে-সারি-হিন্ট-সম্পাদনা-সিঙ্ক-ফ্ল্যাশ — admin-ইনলাইন)/,/EOF session350/p' "$EJSF")
HEXN=$(printf '%s' "$CSS350" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS350" ]; then ok "home-reorder.ejs: session350-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session350-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS350" | grep -c 'session350' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session350-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session350-মার্কার ×$BN (<২)"; fi
C350AFTER=$(grep -n 'EOF session350' "$EJSF" | head -1 | cut -d: -f1)
C349BEFORE=$(grep -n 'EOF session349' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C350AFTER" ] && [ -n "$C349BEFORE" ] && [ "$C350AFTER" -gt "$C349BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session350-ব্লক session349-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (350@$C350AFTER vs 349@$C349BEFORE)"; fi
B350=$(grep -c 'session350' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B350" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session350-শূন্য (admin-CSS-চুক্তি) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (350=$B350 334=$GOODCSS)"; fi
GS=$(grep -o "var setHintOrig350 = q333h.setHint" "$EJSF" | wc -l | tr -d ' ')
GSB=$(grep -o "var setHintsOrig350 = q333h.setHints" "$EJSF" | wc -l | tr -d ' ')
GSY=$(grep -o "var syncDs350 = function" "$EJSF" | wc -l | tr -d ' ')
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
if [ "$GS" = "1" ] && [ "$GSB" = "1" ] && [ "$GSY" = "1" ] && [ "$RG" = "1" ]; then ok "মোড়ক-চেইন-এক-উৎস (setHint/setHints-ক্যাপচার ×১/×১ + syncDs350 ×১) + ovRows330-রেজিস্ট্রি-মিরর-অটুট"; else bad "এক-উৎস-অমিল (sh=$GS shb=$GSB sync=$GSY reg=$RG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr350-ই২ই-প্রস্তুতি (হুক-সহাবস্থান + নির্মাণ-পূর্ব-sync + বেসলাইন-dsT) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria350QA,last:window.__hrAria350QA?window.__hrAria350QA.last:'x',e:((window.__hrAria350QA||{}).err||''),q349:!!window.__hrAria349QA,q348:!!window.__hrAria348QA,q347:!!window.__hrAria347QA,q346:!!window.__hrAria346QA,q345:!!window.__hrAria345QA,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf last "$Q0J")" = "built" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf q349 "$Q0J")" = "true" ] && [ "$(jf q348 "$Q0J")" = "true" ] && [ "$(jf q347 "$Q0J")" = "true" ] && [ "$(jf q346 "$Q0J")" = "true" ] && [ "$(jf q345 "$Q0J")" = "true" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ]; then ok "ই২ই: __hrAria350QA-হুক (last=built + err-শূন্য) + s349–s330-সহাবস্থান"; else bad "ই২ই: হুক $(unjj "$Q0")"; fi
PR=$(unjj "$(ev "JSON.stringify(window.__hrAria350QA.sync())")")
PRJ=$(unjj "$PR")
if [ "$(jf total "$PRJ")" = "0" ] && [ "$(jf changed "$PRJ")" = "0" ]; then ok "ই২ই: নির্মাণ-পূর্ব-sync {total=০/changed=০ — সারি-শূন্যে-ও-সংজ্ঞায়িত}"; else bad "ই২ই: প্রি $(unjj "$PR")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
B0=$(unjj "$(ev "JSON.stringify({e:window.__hrAria349QA.dsT('E'),n:window.__hrAria349QA.ds().length})")")
B0J=$(unjj "$B0")
if [ "$(jf e "$B0J")" = "E = স্ট্রিপ কপি" ] && [ "$(jf n "$B0J")" = "9" ]; then ok "ই২ই: ওভারলে-বেসলাইন {ds ×৯ + dsT('E') = বেস-হিন্ট — সম্পাদনা-পূর্ব-সত্য}"; else bad "ই২ই: বেসলাইন $(unjj "$B0")"; fi

echo "── ধাপ-৪: setHint-লাইভ-সিঙ্ক-ই২ই (ফ্ল্যাশ + পাসথ্রু + অটো-নিরামড + অপরিবর্তিত-নীরব + {fmt}) ──"
S1=$(unjj "$(ev "JSON.stringify((function(){var s0=window.__hrAria335QA.sets;var y0=window.__hrAria350QA.syncs;var f0=window.__hrAria350QA.flashes;var ok=window.__hrAria333QA.setHint('E','E = সম্পাদিত-বর্ণনা');var row=document.querySelectorAll('.hr330-ov .hr330-li')[0];return{ok:ok,t:window.__hrAria349QA.dsT('E'),fl:row.classList.contains('hr350-sync'),s:window.__hrAria335QA.sets-s0,y:window.__hrAria350QA.syncs-y0,f:window.__hrAria350QA.flashes-f0,last:window.__hrAria350QA.last}})())")")
S1J=$(unjj "$S1")
if [ "$(jf ok "$S1J")" = "true" ] && [ "$(jf t "$S1J")" = "E = সম্পাদিত-বর্ণনা" ] && [ "$(jf fl "$S1J")" = "true" ] && [ "$(jf s "$S1J")" = "1" ] && [ "$(jf y "$S1J")" = "1" ] && [ "$(jf f "$S1J")" = "1" ]; then ok "ই২ই: setHint('E') → তাৎক্ষণিক-সিঙ্ক {dsT-সতেজ + .hr350-sync-ফ্ল্যাশ-সক্রিয় + syncs Δ+১ + flashes Δ+১} + q335h.sets Δ+১ {পাসথ্রু-প্রমাণ}"; else bad "ই২ই: setHint $(unjj "$S1")"; fi
agent-browser wait 1500 >/dev/null 2>&1
RM=$(unjj "$(ev "JSON.stringify({fl:document.querySelectorAll('.hr330-ov .hr330-li')[0].classList.contains('hr350-sync')})")")
if [ "$(jf fl "$(unjj "$RM")")" = "false" ]; then ok "ই২ই: ফ্ল্যাশ-১.২s-স্বয়ং-নিরামড { .hr350-sync-অটো-অপসারণ — hr324-ফ্ল্যাশ-রীতি}"; else bad "ই২ই: নিরামড $(unjj "$RM")"; fi
S2=$(unjj "$(ev "JSON.stringify((function(){var y0=window.__hrAria350QA.syncs;var f0=window.__hrAria350QA.flashes;window.__hrAria333QA.setHint('E','E = সম্পাদিত-বর্ণনা');return{y:window.__hrAria350QA.syncs-y0,f:window.__hrAria350QA.flashes-f0}})())")")
S2J=$(unjj "$S2")
if [ "$(jf y "$S2J")" = "1" ] && [ "$(jf f "$S2J")" = "0" ]; then ok "ই২ই: অপরিবর্তিত-সেট-নীরব {syncs Δ+১ + flashes Δ+০ — পরিবর্তন-সনাক্তকারী-সততা}"; else bad "ই২ই: নীরব $(unjj "$S2")"; fi
S3=$(unjj "$(ev "JSON.stringify((function(){var f0=window.__hrAria350QA.flashes;var ok=window.__hrAria333QA.setHint('F','F = সম্পাদিত ({fmt})');var t=window.__hrAria349QA.dsT('F');return{ok:ok,t:t,h:window.__hrAria334QA.hintOf('F'),f:window.__hrAria350QA.flashes-f0}})())")")
S3J=$(unjj "$S3")
FT=$(jf t "$S3J")
if [ "$(jf ok "$S3J")" = "true" ] && printf '%s' "$FT" | grep -q 'F = সম্পাদিত' && [ "$FT" = "$(jf h "$S3J")" ] && [ "$(jf f "$S3J")" = "1" ]; then ok "ই২ই: F-{fmt}-টেমপ্লেট-সম্পাদনা {dsT ≡ hintOf334-রেজলভড + ফ্ল্যাশ Δ+১ — মোড-সচেতন-এক-উৎস}"; else bad "ই২ই: F $(unjj "$S3")"; fi

echo "── ধাপ-৫: setHints-ব্যাচ-ই২ই (এক-সিঙ্ক-পাস + দ্বি-ফ্ল্যাশ + W-অর্থোগোনাল) ──"
agent-browser wait 1500 >/dev/null 2>&1
B1=$(unjj "$(ev "JSON.stringify((function(){var y0=window.__hrAria350QA.syncs;var f0=window.__hrAria350QA.flashes;var r=window.__hrAria333QA.setHints({X:'X = ব্যাচ-বর্ণনা',W:'W = ব্যাচ-সতর্ক'});var rs=document.querySelectorAll('.hr330-ov .hr330-li');var fx=rs[2].classList.contains('hr350-sync');var fw=rs[7].classList.contains('hr350-sync');var wk=getComputedStyle(rs[7].querySelector('.hr330-k')).color;var wd=getComputedStyle(rs[7].querySelector('.hr330-d')).color;return{ap:r?r.applied:-1,tx:window.__hrAria349QA.dsT('X'),tw:window.__hrAria349QA.dsT('W'),y:window.__hrAria350QA.syncs-y0,f:window.__hrAria350QA.flashes-f0,fx:fx,fw:fw,wk:wk,wd:wd}})())")")
B1J=$(unjj "$B1")
if [ "$(jf ap "$B1J")" = "2" ] && [ "$(jf tx "$B1J")" = "X = ব্যাচ-বর্ণনা" ] && [ "$(jf tw "$B1J")" = "W = ব্যাচ-সতর্ক" ] && [ "$(jf y "$B1J")" = "1" ] && [ "$(jf f "$B1J")" = "2" ] && [ "$(jf fx "$B1J")" = "true" ] && [ "$(jf fw "$B1J")" = "true" ]; then ok "ই২ই: setHints-ব্যাচ {applied=২ + dsT-দ্বি-সতেজ + এক-সিঙ্ক-পাস {syncs Δ+১} + দ্বি-ফ্ল্যাশ {flashes Δ+২ — X+W-সারি-সক্রিয়}}"; else bad "ই২ই: ব্যাচ $(unjj "$B1")"; fi
if [ "$(jf wk "$B1J")" = "rgba(185, 28, 28, 0.95)" ] && [ "$(jf wd "$B1J")" = "rgba(190, 18, 60, 0.95)" ]; then ok "ই২ই: W-সারি-অর্থোগোনাল-সহাবস্থান {কীক্যাপ-লাল-অটুট {rgba(185,28,28) — sfs343-ক্ষেত্র} + বর্ণনা-গোলাপি {rgba(190,18,60) — সিঙ্ক-ক্ষেত্র} — সম-সারি-দ্বি-টোন-সংঘর্ষ-শূন্য}"; else bad "ই২ই: W $(unjj "$B1")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (সম্পাদিত-বর্ণনা-ওভারলে — s350-ডেস্ক)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৬: মোবাইল-390 (স্থায়ী-রিপ্লে + কম্প্যাক্ট-গেট + গোলাপি-টোন) + কাউন্টার-সততা ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'm1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
PL=$(unjj "$(ev "JSON.stringify({e:window.__hrAria349QA.dsT('E')})")")
if [ "$(jf e "$(unjj "$PL")")" = "E = সম্পাদিত-বর্ণনা" ]; then ok "ই২ই: স্থায়ী-রিপ্লে-সমতা {রিলোড-পরবর্তী dsT('E') = সম্পাদিত-মান — s337-persist × hr349-নির্মাণ-জোট}"; else bad "ই২ই: রিপ্লে $(unjj "$PL")"; fi
M1=$(unjj "$(ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr330-ov .hr330-li');var ok=window.__hrAria333QA.setHint('X','X = মোবাইল-সম্পাদনা');var row=rs[2];var dcs=getComputedStyle(row.querySelector('.hr330-d'));var lics=getComputedStyle(row);return{ok:ok,fl:row.classList.contains('hr350-sync'),col:dcs.color,off:dcs.textUnderlineOffset,bg:lics.backgroundColor}})())")")
M1J=$(unjj "$M1")
if [ "$(jf ok "$M1J")" = "true" ] && [ "$(jf fl "$M1J")" = "true" ] && [ "$(jf col "$M1J")" = "rgba(190, 18, 60, 0.95)" ] && [ "$(jf off "$M1J")" = "1px" ] && [ "$(jf bg "$M1J")" = "rgba(225, 29, 72, 0.1)" ]; then ok "ই২ই: মোবাইল-390 গোলাপি-ফ্ল্যাশ {offset 1px-≤640px-গেট {2px-অনুপস্থিত} + বর্ণনা-গোলাপি + li-bg-ব্যান্ড}"; else bad "ই২ই: মোবাইল $(unjj "$M1")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
CS=$(unjj "$(ev "JSON.stringify({reg:window.__hrAria333QA.rows(),ds:window.__hrAria349QA.ds().length,e350:window.__hrAria350QA.err,e349:window.__hrAria349QA.err,e348:window.__hrAria348QA.err,e347:window.__hrAria347QA.err,e346:window.__hrAria346QA.err,e345:window.__hrAria345QA.err})")")
CSJ=$(unjj "$CS")
if [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf ds "$CSJ")" = "9" ] && [ "$(jf e350 "$CSJ")" = "" ] && [ "$(jf e349 "$CSJ")" = "" ] && [ "$(jf e348 "$CSJ")" = "" ] && [ "$(jf e347 "$CSJ")" = "" ] && [ "$(jf e346 "$CSJ")" = "" ] && [ "$(jf e345 "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা {রেজিস্ট্রি-৯ + ds ×৯ + সর্ব-হুক-ত্রুটি-শূন্য {s350…s345}}"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi

echo "── ধাপ-৭: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + বেস-পুনঃস্থাপন ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');return 'o2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr350')>=0||ks[i].indexOf('hr349')>=0||ks[i].indexOf('hr348')>=0)return false}return true})(),rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),e:window.__hrAria349QA?window.__hrAria349QA.dsT('E'):'x',q350:!!window.__hrAria350QA})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf noKey "$CLNJ")" = "true" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf e "$CLNJ")" = "E = স্ট্রিপ কপি" ] && [ "$(jf q350 "$CLNJ")" = "true" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr350/hr349/hr348-কী-সহ} + রেজিস্ট্রি-৯ + dsT('E') = বেস-পুনঃস্থাপন {ওয়াইপ-রিপ্লে-ফ্রেশ-চুক্তি}"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s350console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s350-suite ✓ সর্ব-সবুজ"; else echo "s350-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
