#!/bin/bash
# s343-suite.sh — session343: hr343 register-'W'-সম্পূর্ণ-কীবোর্ড-parity + sfs343 ওভারলে-W-সারি-ধ্বংসাত্মক-টোন
# [Task ID 180] PLANS session342-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (hr339-চুক্তি-প্রসারিত):
#   hr343 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     ovRows330-স্ট্যাটিক-সারি ['W', বর্ণনা, হিন্ট] ('S'-পরে-'?'-পূর্বে — সহায়িকা-শেষ-রীতি-অটুট) —
#     ৮→৯-সারি (ওভারলে-গণনা-সুইট-বিবর্তন-জুটি — s330…s342-গণনা-৮→৯ + s339-গার্ড-বিবর্তন);
#     W-keydown (s320/s324-keydown-রীতি): .hr-aria-copy-ফোকাস-প্রেক্ষাপট × মডিফায়ার-বর্জন × বাটন-গেট
#     (clearBtn339-উপস্থিত = store≥১ × tip-খোলা — শূন্যে নীরব); প্রথম-W = আর্ম (পয়েন্টার-সম-পথ —
#     armed339 + .hr339-armed + label339 + tmr339-৩s-স্বয়ং-নিরামড) × দ্বিতীয়-W = wipe339-এক-উৎস
#     (q339h.clears-গণনা-সহ — parity-প্রমাণ); পয়েন্টার↔কীবোর্ড-সম-স্টেট-মেশিন (মিশ্র-পথ-সমতা);
#     label339-মোড়ক (labelOrig343-চেইন) = আর্মড-জীবন্ত-সিঙ্ক (ওভারলে-W-সারি .hr343-armed-টগল —
#     syncW343-এক-উৎস) + openOv330-মোড়ক-পুনঃপ্রয়োগ — রি-রেন্ডার-বিহীন — ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪।
#   sfs343 (ইনলাইন-<style> session343-ব্লক — cascade-অবস্থান session342-পরে — হেক্স-শূন্য):
#     ওভারলে-W-সারি-ধ্বংসাত্মক-টোন (data-hr343-w-মার্কার-হুক — mkLi330-এক-লাইন-সম্প্রসারণ — লাল-পরিবার
#     rgba-only — hr339-armed-সম-পরিবার) + আর্মড-সলিড-চিপ (.hr343-armed) + ≤640px-কম্প্যাক্ট;
#     বিদ্যমান-সারি-অস্পৃশ্য — নতুন-টোন-কেবল।
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         কাউন্টার-ডেল্টা-assert (s336-গোটচা — পরম-assert-নিষিদ্ধ) + পরিষ্কারণ-চুক্তি (hr337-hints +
#         hr326-fmt + hr321-hist) + কনসোল-কাউন্টার-পুনঃআর্ম-রীতি (rld-পুনঃআর্ম — রিলোডে-উইন্ডো-রিসেট)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s343-wrow-desk.png
SH_MOB=/home/z/my-project/download/s343-wrow-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s343console){window.__s343console=0;var oe=console.error;console.error=function(){window.__s343console=(window.__s343console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
rc(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('.hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc0'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){try{if(!window.__clipCap343)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap343=t;return Promise.resolve()}},configurable:true})}catch(e){};document.querySelectorAll('.hr-aria-copy')[0].click();return 'rc1'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'rc2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
wp(){ ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true}));return 'w1'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; }
seed(){ ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = স্থায়ী (৩৪৩)');return 'sd'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s343-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s343-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr343+sfs343-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + W-সারি-স্ট্যাটিক) ──"
HN=$(grep -c 'hr343' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 10 ]; then ok "home-reorder.ejs: hr343-রেফারেন্স-লাইন ×$HN (হুক+keydown+স্টাইল-সহাবস্থান)"; else bad "hr343-রেফারেন্স-অপ্রতুল ($HN)"; fi
A343CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A343CHK" = "OK" ]; then ok "home-reorder.ejs: hr343-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS343=$(sed -n '/session343 (sfs343 ওভারলে-W-সারি-ধ্বংসাত্মক-টোন — admin-ইনলাইন)/,/EOF session343/p' "$EJSF")
HEXN=$(printf '%s' "$CSS343" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS343" ]; then ok "home-reorder.ejs: session343-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session343-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS343" | grep -c 'session343' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session343-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session343-মার্কার ×$BN (<২)"; fi
C343AFTER=$(grep -n 'EOF session343' "$EJSF" | head -1 | cut -d: -f1)
C342BEFORE=$(grep -n 'EOF session342' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C343AFTER" ] && [ -n "$C342BEFORE" ] && [ "$C343AFTER" -gt "$C342BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session343-ব্লক session342-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (343@$C343AFTER vs 342@$C342BEFORE)"; fi
B343=$(grep -c 'session343' "$APP/public/assets/css/style.css" | tr -d ' ')
B342=$(grep -c 'session342' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B343" = "0" ] && [ "$B342" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session343/342-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (343=$B343 342=$B342 334=$GOODCSS)"; fi
grep -q "\['W', 'স্থায়ী-হিন্ট-স্টোর মুছুন (দ্বি-চাপ-নিশ্চিত)', 'W = স্থায়ী মুছুন'\]" "$EJSF" && ok "home-reorder.ejs: W-সারি-স্ট্যাটিক-নথিভুক্ত (ovRows330-৯ম-সারি — 'S'-পরে-'?'-পূর্বে — সহায়িকা-শেষ-রীতি)" || bad "home-reorder.ejs: W-সারি-অনুপস্থিত"
grep -q "q333h.register('W'" "$EJSF" && bad "home-reorder.ejs: register-'W'-কল-ঘটেছে (স্ট্যাটিক-সারি-রীতি-ভাঙা)" || ok "home-reorder.ejs: register-কল-শূন্য (স্ট্যাটিক-সারি-রীতি — q333h.register-পাবলিক-API-অব্যবহৃত-অটুট)"
grep -q "data-hr343-w" "$EJSF" && ok "home-reorder.ejs: data-hr343-w-মার্কার (mkLi330-এক-লাইন-সম্প্রসারণ — sfs343-টোন-হুক)" || bad "data-hr343-w-মার্কার-অনুপস্থিত"
grep -q "var labelOrig343 = label339;" "$EJSF" && grep -q "var ooOrig343 = openOv330;" "$EJSF" && grep -q "var clrOrig343 = q337h.clearStore;" "$EJSF" && grep -q "var syncW343 = function" "$EJSF" && ok "home-reorder.ejs: label339/openOv330/clearStore-মোড়ক-চেইন + syncW343-এক-উৎস (regOrig334-চেইন-রীতি — hr339-যন্ত্র-অস্পৃশ্য)" || bad "মোড়ক-চেইন-মার্কার-অমিল"
grep -q "window.__hrAria343QA = q343h;" "$EJSF" && grep -q "window.__hrAria342QA = q342h;" "$EJSF" && grep -q "window.__hrAria330QA = q330h;" "$EJSF" && ok "home-reorder.ejs: __hrAria343QA-হুক + s342…s330-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr343-ই২ই (W-parity আর্ম/ওয়াইপ + মিশ্র-পথ + আর্মড-সিঙ্ক) ──"
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
arm
RB=$(ev "JSON.stringify({q:!!window.__hrAria343QA,rows:window.__hrAria333QA?window.__hrAria333QA.rows():-1,hW:window.__hrAria334QA?window.__hrAria334QA.hintOf('W'):'',ln:window.__hrAria334QA?window.__hrAria334QA.line().indexOf('W = স্থায়ী মুছুন'):-1,e:(window.__hrAria343QA||{}).err||''})")
RBJ=$(unjj "$RB")
if [ "$(jf q "$RBJ")" = "true" ] && [ "$(jf rows "$RBJ")" = "9" ] && [ "$(jf hW "$RBJ")" = "W = স্থায়ী মুছুন" ] && [ "$(jf ln "$RBJ")" -ge 0 ] 2>/dev/null; then ok "ই২ই: রেজিস্ট্রি-৯-সারি + W-হিন্ট (hintOf('W') + kbd-লাইন-W-অন্তর্ভুক্ত — নথিভুক্তকরণ-স্ব-ডকুমেন্টেড)"; else bad "ই২ই: $(unjj "$RB")"; fi
rc
OV=$(ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].focus();document.querySelectorAll('.hr-aria-copy')[0].dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'o1'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1; ev "JSON.stringify((function(){var o=document.querySelector('.hr330-ov');if(!o)return{e:'no-ov'};var lis=o.querySelectorAll('.hr330-li');var w=o.querySelector('[data-hr343-w]');return{e:'',n:lis.length,w:!!w,wTxt:w?(w.querySelector('.hr330-k')||{}).textContent:'',armed:w?w.classList.contains('hr343-armed'):null,pos:w?[].indexOf.call(lis,w):[]}})())")
OVJ=$(unjj "$OV")
if [ "$(jf e "$OVJ")" = "" ] && [ "$(jf n "$OVJ")" = "9" ] && [ "$(jf w "$OVJ")" = "true" ] && [ "$(jf wTxt "$OVJ")" = "W" ] && [ "$(jf pos "$OVJ")" = "7" ]; then ok "ই২ই: ওভারলে-৯-সারি + W-সারি-মার্কার (৮ম-অবস্থান — '?'-সহায়িকা-৯ম/শেষ — সহায়িকা-শেষ-রীতি-অটুট)"; else bad "ই২ই: $(unjj "$OV")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
GS0=$(ev "JSON.stringify({p:window.__hrAria343QA.press,a:window.__hrAria343QA.arms,ar:window.__hrAria343QA.armed(),btn:window.__hrAria343QA.btn()})")
wp
GS1=$(ev "JSON.stringify({p:window.__hrAria343QA.press,a:window.__hrAria343QA.arms,ar:window.__hrAria343QA.armed(),btn:window.__hrAria343QA.btn()})")
if [ "$(unjj "$GS1")" = "$(unjj "$GS0")" ]; then ok "ই২ই: গেট-নীরবতা (বাটন-শূন্যে W-নীরব — hr339-গেট-সমতা — কাউন্টার-অপরিবর্তিত)"; else bad "ই২ই: গেট-ভাঙা $(unjj "$GS0") → $(unjj "$GS1")"; fi
rc
seed
SB=$(ev "JSON.stringify({btn:window.__hrAria343QA.btn(),st:window.__hrAria339QA.store()})")
if [ "$(jf btn "$(unjj "$SB")")" = "true" ] && [ "$(jf st "$(unjj "$SB")")" = "9" ]; then ok "ই২ই: সিড-পরবর্তী-বাটন-উপস্থিত (setHint → persist337-মোড়ক → জীবন্ত-সিঙ্ক + স্ন্যাপশট-৯-কী)"; else bad "ই২ই: $(unjj "$SB")"; fi
C0=$(ev "JSON.stringify({p:window.__hrAria343QA.press,a:window.__hrAria343QA.arms,c:window.__hrAria339QA.clears})")
wp
A1=$(ev "JSON.stringify({p:window.__hrAria343QA.press,a:window.__hrAria343QA.arms,w:window.__hrAria343QA.wipes,c:window.__hrAria339QA.clears,ar:window.__hrAria343QA.armed(),last:window.__hrAria343QA.last,lbl:(document.querySelector('.hr339-clearbtn .hr339-lbl')||{textContent:''}).textContent,cls:!!document.querySelector('.hr339-clearbtn.hr339-armed')})")
A1J=$(unjj "$A1")
if [ "$(jf p "$A1J")" -ge 1 ] 2>/dev/null && [ "$(jf w "$A1J")" = "0" ] && [ "$(jf ar "$A1J")" = "true" ] && [ "$(jf last "$A1J")" = "w-arm" ] && printf '%s' "$(jf lbl "$A1J")" | grep -q 'নিশ্চিত' && [ "$(jf cls "$A1J")" = "true" ]; then ok "ই২ই: W-আর্ম (প্রথম-W = পয়েন্টার-আর্ম-সম-পথ — .hr339-armed + লেবেল-বদল + wipes-শূন্য + q339h-কাউন্টার-অস্পৃশ্য)"; else bad "ই২ই: $(unjj "$A1") c0=$(unjj "$C0")"; fi
wp
W1=$(ev "JSON.stringify({w:window.__hrAria343QA.wipes,c:window.__hrAria339QA.clears,ar:window.__hrAria343QA.armed(),btn:window.__hrAria343QA.btn(),st:window.__hrAria339QA.store(),last:window.__hrAria343QA.last})")
W1J=$(unjj "$W1")
if [ "$(jf w "$W1J")" = "1" ] && [ "$(jf c "$W1J")" -ge 1 ] 2>/dev/null && [ "$(jf ar "$W1J")" = "false" ] && [ "$(jf btn "$W1J")" = "false" ] && [ "$(jf st "$W1J")" = "0" ] && [ "$(jf last "$W1J")" = "w-wipe" ]; then ok "ই২ই: W-ওয়াইপ (দ্বিতীয়-W = wipe339-এক-উৎস — q339h.clears-গণনা-সহ parity-প্রমাণ + বাটন-লাইভ-অপসারণ + স্টোর-শূন্য)"; else bad "ই২ই: $(unjj "$W1") c0=$(unjj "$C0")"; fi
seed
M0=$(ev "JSON.stringify({c:window.__hrAria339QA.clicks,a:window.__hrAria339QA.arms})")
ev "JSON.stringify((function(){var b=document.querySelector('.hr339-clearbtn');if(!b)return 'nb';b.click();return 'mc'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
MA=$(ev "JSON.stringify({ar:window.__hrAria339QA.armed(),wcls:(document.querySelector('.hr330-ov [data-hr343-w]')||{classList:{contains:function(){return null}}}).classList.contains('hr343-armed')})")
wp
M1=$(ev "JSON.stringify({c:window.__hrAria339QA.clicks,a:window.__hrAria339QA.arms,w:window.__hrAria343QA.wipes,btn:window.__hrAria343QA.btn(),last:window.__hrAria343QA.last,wcls:(document.querySelector('.hr330-ov [data-hr343-w]')||{classList:{contains:function(){return null}}}).classList.contains('hr343-armed')})")
M1J=$(unjj "$M1")
if [ "$(jf c "$M1J")" -ge 1 ] 2>/dev/null && [ "$(jf a "$M1J")" -ge 1 ] 2>/dev/null && [ "$(jf w "$M1J")" = "2" ] && [ "$(jf btn "$M1J")" = "false" ] && [ "$(jf last "$M1J")" = "w-wipe" ] && [ "$(jf wcls "$M1J")" = "false" ] && [ "$(jf ar "$(unjj "$MA")")" = "true" ] && [ "$(jf wcls "$(unjj "$MA")")" = "true" ]; then ok "ই২ই: মিশ্র-পথ-সমতা (পয়েন্টার-আর্ম → W-ওয়াইপ — সম-স্টেট-মেশিন + সারি-শ্রেণি দ্বি-পথ-সিঙ্ক true→false — clearStore-মোড়ক-গোটচা-সংশোধন-প্রমাণ)"; else bad "ই২ই: $(unjj "$M1") m0=$(unjj "$M0") ma=$(unjj "$MA")"; fi
seed
wp
agent-browser wait 3400 >/dev/null 2>&1
AD=$(ev "JSON.stringify({ar:window.__hrAria343QA.armed(),cls:!!document.querySelector('.hr339-clearbtn.hr339-armed'),btn:window.__hrAria343QA.btn()})")
ADJ=$(unjj "$AD")
if [ "$(jf ar "$ADJ")" = "false" ] && [ "$(jf cls "$ADJ")" = "false" ] && [ "$(jf btn "$ADJ")" = "true" ]; then ok "ই২ই: ৩s-স্বয়ং-নিরামড (hr323-রীতি-উত্তরাধিকার — আর্মড-বিলোপ + বাটন-টিকে)"; else bad "ই২ই: $(unjj "$AD")"; fi
seed
rc
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'o2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
wp
OS=$(ev "JSON.stringify((function(){var w=document.querySelector('.hr330-ov [data-hr343-w]');return{armed:w?w.classList.contains('hr343-armed'):null,btn:window.__hrAria343QA.armed()}})())")
OSJ=$(unjj "$OS")
if [ "$(jf armed "$OSJ")" = "true" ] && [ "$(jf btn "$OSJ")" = "true" ]; then ok "ই২ই: আর্মড-জীবন্ত-সিঙ্ক-অন (W-আর্ম → label339-মোড়ক → ওভারলে-W-সারি .hr343-armed — খোলা-ওভারলেতে-জীবন্ত)"; else bad "ই২ই: $(unjj "$OS")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-আর্মড-ওভারলে-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
wp
OS2=$(ev "JSON.stringify((function(){var w=document.querySelector('.hr330-ov [data-hr343-w]');return{armed:w?w.classList.contains('hr343-armed'):null,btn:window.__hrAria343QA.btn(),st:window.__hrAria339QA.store()}})())")
OS2J=$(unjj "$OS2")
if [ "$(jf armed "$OS2J")" = "false" ] && [ "$(jf btn "$OS2J")" = "false" ] && [ "$(jf st "$OS2J")" = "0" ]; then ok "ই২ই: আর্মড-জীবন্ত-সিঙ্ক-অফ (W-ওয়াইপ → disarm339-চেইন → শ্রেণি-অপসারণ — দ্বি-পথ-সম-সিঙ্ক-প্রমাণ)"; else bad "ই২ই: $(unjj "$OS2")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc2'})())" >/dev/null 2>&1
QERR=$(ev "JSON.stringify({e:(window.__hrAria343QA.err||'')+(window.__hrAria342QA.err||'')+(window.__hrAria341QA.err||'')+(window.__hrAria340QA.err||'')+(window.__hrAria339QA.err||'')+(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333–s343)"; else bad "ই২ই: হুক-ত্রুটি $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs343-মোবাইল-390 (W-চিপ-কম্প্যাক্ট-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
rc
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'o3'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
MB=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr330-ov [data-hr343-w] .hr330-k');if(!k)return{e:'no-chip'};var cs=getComputedStyle(k);return{e:'',mw:cs.minWidth,vis:k.offsetWidth>0}})())")
MBJ=$(unjj "$MB")
if [ "$(jf e "$MBJ")" = "" ] && [ "$(jf mw "$MBJ")" = "16px" ] && [ "$(jf vis "$MBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 W-চিপ (কম্প্যাক্ট min-width 16px-≤640px-গেট — ডেস্ক-২০px-ব্যান্ড-বৈচিত্র্য)"; else bad "ই২ই: $(unjj "$MB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1; agent-browser wait 1200 >/dev/null 2>&1
arm
CL=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null&&sessionStorage.getItem('hr321-hist')===null,btn:(window.__hrAria343QA?window.__hrAria343QA.btn():null),rows:window.__hrAria333QA?window.__hrAria333QA.rows():-1})")
CLJ=$(unjj "$CL")
if [ "$(jf ss "$CLJ")" = "true" ] && [ "$(jf btn "$CLJ")" = "false" ] && [ "$(jf rows "$CLJ")" = "9" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য + বাটন-অনুপস্থিত + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CL")"; fi
ERR1=$(ev "(function(){return window.__s343console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s343-suite ✓ সর্ব-সবুজ"; else echo "s343-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
