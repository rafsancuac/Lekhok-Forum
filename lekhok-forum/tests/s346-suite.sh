#!/bin/bash
# s346-suite.sh — session346: hr346 ওভারলে-সারি-Enter-সক্রিয়করণ (এক-উৎস-প্রতিনিধি) + sfs346 সক্রিয়করণ-ফ্ল্যাশ
# [Task ID 183] PLANS session345-নোটের প্রস্তাব-②-তৃতীয়-বিকল্প প্রয়োগ (দ্বি-সক্রিয়করণ-ঝুঁকি-সতর্ক-মূল্যায়ন-সম্পন্ন-গৃহীত)
#   (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন — 8599a72-ডিপ্লয়-প্রমাণ READY: vercel home-200 + session334-মার্কার ×২-লাইভ-
#   /assets/css/style.css-এ {টানা-২০-রাউন্ড} + epaper-200 + প্রোড-অ্যাডমিন-৩০৭-cred-gated + hr345/hr344-মার্কার-পাবলিক-পাঠে-শূন্য-ই-প্রত্যাশিত):
#   hr346 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     গেট: ovOpen330 ∧ টার্গেট-সর্বনিকট .hr330-li (.hr330-ov-অভ্যন্তর) ∧ key==='Enter' ∧ মডিফায়ার-বর্জন —
#       .hr330-x-বাটন-নেটিভ-অস্পৃশ্য (হাইজ্যাক-শূন্য); কার্সর-মেশিন-স্বাধীন (q345h-অটুট)।
#     প্রতিনিধি (এক-উৎস): সারি-কী = সংশ্লিষ্ট-শর্টকাট-কী — প্রথম .hr-aria-copy-উপরে synthetic-KeyboardEvent-
#       প্রেরণ → সর্ব-শর্টকাট-হ্যান্ডলার (s324-E/D + s325-X + s326-F + s327-P + s328-C + s329-S + hr343-W +
#       hr330-'?')-নিজস্ব-গেটে-সিদ্ধান্ত — অনুলিপি-লজিক-শূন্য; নীরব-নো-অপ-ও-প্রতিনিধি-গণিত।
#     দ্বি-সক্রিয়করণ-ঝুঁকি-নিষ্ক্রিয়করণ (ত্রি-স্তর): ① প্রতিনিধি-কী ≠'Enter' → পুনঃপ্রবেশ-শূন্য ② li = অ-বাটন →
#       নেটিভ-সক্রিয়করণ-শূন্য ③ hr320-Enter-রিকপি = 'Enter'-কী-কেবল → অস্পৃশ্য।
#     ব্লক-পথ: .hr-aria-copy-অনুপস্থিতি → blocked-গণনা {act:notip}; li-বহি-টার্গেট = নীরব-উপেক্ষা।
#     ফ্ল্যাশ: .hr346-act ১.২s-স্বয়ং-নিরামড (hr324-ফ্ল্যাশ-রীতি); ফোকাস-স্থির (dispatchEvent-স্থানান্তর-শূন্য);
#     চুক্তি: ovRows330-অ্যারে-অস্পৃশ্য; q320/…/q345h-কাউন্টার-অস্পৃশ্য; storage-অস্পৃশ্য; s345…s330-হুক-সহাবস্থান।
#   sfs346 (ইনলাইন-<style> session346-ব্লক — cascade EOF-session345-পরে — হেক্স-শূন্য rgba-only):
#     সবুজ-পরিবার-গভীর-টোন (rgba(16,185,129)/rgba(5,150,105) — hr345-কার্সর-সম-পরিবার — নেভ→সক্রিয়-
#     ধারাবাহিকতা); নতুন-অবস্থা-টোন-কেবল; ≤640px-কম্প্যাক্ট inset 1.5px; MO=৪-অটুট।
# চুক্তি: কাউন্টার-ডেল্টা-assert (s336-গোটচা) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি + app-dir-cwd (s306-চুক্তি) + ফ্ল্যাট-এনকোডিং-রীতি (s345-গোটচা-①)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s346-act-desk.png
SH_MOB=/home/z/my-project/download/s346-act-mobile390.png
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
arm(){ ev "JSON.stringify((function(){if(!window.__s346console){window.__s346console=0;var oe=console.error;console.error=function(){window.__s346console=(window.__s346console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
opentip(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();return 'r2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s346-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s346-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr346+sfs346-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + প্রতিনিধি-চুক্তি) ──"
HN=$(grep -c 'hr346' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 10 ]; then ok "home-reorder.ejs: hr346-রেফারেন্স-লাইন ×$HN (হুক+প্রতিনিধি+স্টাইল-সহাবস্থান)"; else bad "hr346-রেফারেন্স-অপ্রতুল ($HN)"; fi
A346CHK=$(python3 - "$EJSF" <<'PYEOF'
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
if [ "$A346CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr346-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS346=$(sed -n '/session346 (sfs346 ওভারলে-সারি-Enter-সক্রিয়করণ-ফ্ল্যাশ — admin-ইনলাইন)/,/EOF session346/p' "$EJSF")
HEXN=$(printf '%s' "$CSS346" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS346" ]; then ok "home-reorder.ejs: session346-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session346-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS346" | grep -c 'session346' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session346-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session346-মার্কার ×$BN (<২)"; fi
C346AFTER=$(grep -n 'EOF session346' "$EJSF" | head -1 | cut -d: -f1)
C345BEFORE=$(grep -n 'EOF session345' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C346AFTER" ] && [ -n "$C345BEFORE" ] && [ "$C346AFTER" -gt "$C345BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session346-ব্লক session345-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (346@$C346AFTER vs 345@$C345BEFORE)"; fi
B346=$(grep -c 'session346' "$APP/public/assets/css/style.css" | tr -d ' ')
B345=$(grep -c 'session345' "$APP/public/assets/css/style.css" | tr -d ' ')
B344=$(grep -c 'session344' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B346" = "0" ] && [ "$B345" = "0" ] && [ "$B344" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session346/345/344-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (346=$B346 345=$B345 344=$B344 334=$GOODCSS)"; fi
ACT=$(grep -c 'hr346-act' "$EJSF" | tr -d ' ')
DL=$(grep -c "dispatchEvent(new KeyboardEvent('keydown', { key: key346" "$EJSF" | tr -d ' ')
if [ "$ACT" -ge 4 ] && [ "$DL" = "1" ]; then ok ".hr346-act-শ্রেণি-রেফারেন্স ×$ACT (স্টাইল+ফ্ল্যাশ+হুক) + এক-উৎস-প্রতিনিধি-কল ×$DL (অনুলিপি-লজিক-শূন্য)"; else bad "শ্রেণি/প্রতিনিধি-রেফারেন্স-অপ্রতুল (act=$ACT delegate=$DL)"; fi
RG=$(grep -c "q333h.rows = function" "$EJSF" | tr -d ' ')
if [ "$RG" = "1" ]; then ok "ovRows330-৯-সারি-রেজিস্ট্রি-মিরর-অটুট (hr346-অ্যারে-অস্পৃশ্য-চুক্তি — সর্ব-সারি-এক-উৎস)"; else bad "রেজিস্ট্রি-মিরর-অমিল ($RG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr346-ই২ই (প্রতিনিধি + দ্বি-সক্রিয়করণ-নিষ্ক্রিয়করণ + ব্লক-পথ + সহাবস্থান) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria346QA,acts:window.__hrAria346QA?window.__hrAria346QA.acts:-1,blocked:window.__hrAria346QA?window.__hrAria346QA.blocked:-1,last:window.__hrAria346QA?window.__hrAria346QA.last:'x',q345:!!window.__hrAria345QA,q344:!!window.__hrAria344QA,q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,q330:!!window.__hrAria330QA,e:((window.__hrAria346QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf acts "$Q0J")" = "0" ] && [ "$(jf blocked "$Q0J")" = "0" ] && [ "$(jf last "$Q0J")" = "" ] && [ "$(jf q345 "$Q0J")" = "true" ] && [ "$(jf q344 "$Q0J")" = "true" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf q330 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria346QA-হুক (কাউন্টার=০ + last-শূন্য — নীরব-শূন্য-অবস্থা) + s345–s330-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'g1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
GATE=$(ev "JSON.stringify({acts:window.__hrAria346QA.acts,blocked:window.__hrAria346QA.blocked,open:window.__hrAria330QA.isOpen(),rows:window.__hrAria345QA.rows()})")
GATEJ=$(unjj "$GATE")
if [ "$(jf acts "$GATEJ")" = "0" ] && [ "$(jf blocked "$GATEJ")" = "0" ] && [ "$(jf open "$GATEJ")" = "true" ] && [ "$(jf rows "$GATEJ")" = "9" ]; then ok "ই২ই: li-বহি-টার্গেট-নীরব-উপেক্ষা (document-Enter = গেট-নীরব {acts=০/blocked=০} — সক্রিয়করণ-প্রচেষ্টা-নয়-অর্থবিদ্যা + ওভারলে-খোলা rows=৯)"; else bad "ই২ই: গেট $(unjj "$GATE")"; fi
BLK=$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{blocked:window.__hrAria346QA.blocked,acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,idx:window.__hrAria345QA.idx(),ae:(document.activeElement===r)}})())")
BLKJ=$(unjj "$BLK")
if [ "$(jf blocked "$BLKJ")" = "1" ] && [ "$(jf acts "$BLKJ")" = "0" ] && [ "$(jf last "$BLKJ")" = "act:notip" ] && [ "$(jf idx "$BLKJ")" = "0" ] && [ "$(jf ae "$BLKJ")" = "true" ]; then ok "ই২ই: টিপ-বন্ধ-ব্লক-পথ (সারি-ক্লিক-কার্সর + Enter = .hr-aria-copy-অনুপস্থিতি → preventDefault + blocked=১ {act:notip} — নীরব-ব্লক + ফোকাস-স্থির)"; else bad "ই২ই: ব্লক $(unjj "$BLK")"; fi
opentip
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৬)');if(!window.__cc346set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap346=t;return Promise.resolve()}},configurable:true});window.__cc346set=true}var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].click();return 's1'})())" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
REF=$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.focus();var h0=window.__hrAria317QA.hist().length;window.__h346hist0=h0;window.__h346expect=window.__hrAria324QA.strip();r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,flash:r.classList.contains('hr346-act'),capEq:window.__clipCap346===window.__h346expect,histSame:window.__hrAria317QA.hist().length===h0,cursor:r.classList.contains('hr345-cursor')}})())")
REFJ=$(unjj "$REF")
if [ "$(jf acts "$REFJ")" = "1" ] && [ "$(jf last "$REFJ")" = "act:E@0" ] && [ "$(jf flash "$REFJ")" = "true" ] && [ "$(jf capEq "$REFJ")" = "true" ] && [ "$(jf histSame "$REFJ")" = "true" ] && [ "$(jf cursor "$REFJ")" = "true" ]; then ok "ই২ই: E-সারি-Enter-প্রতিনিধি (সারি-০ {'E'} → synthetic-'E' → s324-copyHist324-এক-উৎস {ক্লিপবোর্ড-ক্যাপ ≡ strip324 + ইতিহাস-গণনা-অপরিবর্তিত — রেকর্ড-বিহীন} + acts=১ + act:E@0-মার্কার + .hr346-act-ফ্ল্যাশ-তাৎক্ষণিক + কার্সর-সহাবস্থান)"; else bad "ই২ই: E-প্রতিনিধি $(unjj "$REF")"; fi
agent-browser wait 1400 >/dev/null 2>&1
FL2=$(ev "JSON.stringify({flash:(document.querySelectorAll('.hr330-ov .hr330-li')[0].classList.contains('hr346-act'))})")
FL2J=$(unjj "$FL2")
if [ "$(jf flash "$FL2J")" = "false" ]; then ok "ই২ই: ফ্ল্যাশ-১.২s-স্বয়ং-নিরামড (hr324-ফ্ল্যাশ-রীতি — রি-রেন্ডার-বিহীন-অবস্থা-পরিষ্কার)"; else bad "ই২ই: ফ্ল্যাশ-নিরামড $(unjj "$FL2")"; fi
FACT=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));var i;for(i=0;i<3;i++)t.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));var m0=window.__hrAria331QA.mode();var r=document.querySelectorAll('.hr330-ov .hr330-li')[3];r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var ch=document.querySelector('.hr344-chip');return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,mode0:m0,mode1:window.__hrAria331QA.mode(),mode:window.__hrAria326QA.mode(),chT:ch?ch.textContent:'',fmtSync:window.__hrAria341QA.last,flash:r.classList.contains('hr346-act')}})())")
FACTJ=$(unjj "$FACT")
if [ "$(jf acts "$FACTJ")" = "2" ] && [ "$(jf last "$FACTJ")" = "act:F@3" ] && [ "$(jf mode0 "$FACTJ")" = "rich" ] && [ "$(jf mode1 "$FACTJ")" = "key" ] && [ "$(jf mode "$FACTJ")" = "key" ] && [ "$(jf chT "$FACTJ")" = "সমৃদ্ধ ৯ · কেবল-কী ৯ · JSON ৯" ] && printf '%s' "$(jf fmtSync "$FACTJ")" | grep -q 'fmt-sync' && [ "$(jf flash "$FACTJ")" = "true" ]; then ok "ই২ই: F-সারি-Enter-প্রতিনিধি (সারি-৩ {'F'} → s326-cycleFmt326-এক-উৎস {rich→key মোড-বদল} + চিপ-মোড-নিরপেক্ষ-গণনা {৯·৯·৯} + hr341-fmt-sync-সহাবস্থান + acts=২ + act:F@3)"; else bad "ই২ই: F-প্রতিনিধি $(unjj "$FACT")"; fi
XACT=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));var r=document.querySelectorAll('.hr330-ov .hr330-li')[2];var d0=window.__hrAria325QA.deletes;r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,delSame:window.__hrAria325QA.deletes===d0,hist:window.__hrAria317QA.hist().length}})())")
XACTJ=$(unjj "$XACT")
if [ "$(jf acts "$XACTJ")" = "3" ] && [ "$(jf last "$XACTJ")" = "act:X@2" ] && [ "$(jf delSame "$XACTJ")" = "true" ] && [ "$(jf hist "$XACTJ")" -ge 1 ] 2>/dev/null; then ok "ই২ই: X-সারি-Enter-প্রতিনিধি-নীরব-নো-অপ (সারি-২ {'X'} → synthetic-'X' → s325-হ্যান্ডলার-নিজস্ব-গেট-সিদ্ধান্ত {পয়েন্টার-শূন্যে নীরব — deletes-অপরিবর্তিত} + প্রতিনিধি-গণিত {acts=৩} — হ্যান্ডলার-সিদ্ধান্ত-স্বাধীন-অর্থবিদ্যা)"; else bad "ই২ই: X-প্রতিনিধি $(unjj "$XACT")"; fi
W1=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));t.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));var r=document.querySelectorAll('.hr330-ov .hr330-li')[7];var a0=window.__hrAria343QA.arms,w0=window.__hrAria343QA.wipes;r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var w=document.querySelector('.hr330-ov [data-hr343-w]');return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,arms:window.__hrAria343QA.arms-a0,wipes:window.__hrAria343QA.wipes-w0,armed:w?w.classList.contains('hr343-armed'):false,store:window.__hrAria339QA.store()}})())")
W1J=$(unjj "$W1")
if [ "$(jf acts "$W1J")" = "4" ] && [ "$(jf last "$W1J")" = "act:W@7" ] && [ "$(jf arms "$W1J")" = "1" ] && [ "$(jf wipes "$W1J")" = "0" ] && [ "$(jf armed "$W1J")" = "true" ] && [ "$(jf store "$W1J")" = "9" ]; then ok "ই২ই: W-সারি-Enter-প্রথম-চাপ-আর্ম (সারি-৭ {'W'} → hr343-এক-উৎস-আর্ম {arms+১/wipes-অপরিবর্তিত + .hr343-armed + store=৯-অটুট} — দ্বি-চাপ-নিশ্চিত-ধারাবাহিকতা)"; else bad "ই২ই: W-আর্ম $(unjj "$W1")"; fi
W2=$(ev "JSON.stringify((function(){var r=document.querySelectorAll('.hr330-ov .hr330-li')[7];var w0=window.__hrAria343QA.wipes,c0=window.__hrAria339QA.clears;r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,wipes:window.__hrAria343QA.wipes-w0,clears:window.__hrAria339QA.clears-c0,store:window.__hrAria339QA.store(),ss:sessionStorage.getItem('hr337-hints')===null}})())")
W2J=$(unjj "$W2")
if [ "$(jf acts "$W2J")" = "5" ] && [ "$(jf last "$W2J")" = "act:W@7" ] && [ "$(jf wipes "$W2J")" = "1" ] && [ "$(jf clears "$W2J")" = "1" ] && [ "$(jf store "$W2J")" = "0" ] && [ "$(jf ss "$W2J")" = "true" ]; then ok "ই২ই: W-সারি-Enter-দ্বিতীয়-চাপ-ওয়াইপ (hr343-এক-উৎস-ওয়াইপ {wipes+১ + q339h.clears+১-parity + store=০ + স্টোরেজ-শূন্য} — দ্বি-চাপ-সম্পূর্ণ-প্রমাণ)"; else bad "ই২ই: W-ওয়াইপ $(unjj "$W2")"; fi
QA=$(ev "JSON.stringify((function(){var t=document.querySelector('.hr330-ov .hr330-x');t.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));var r=document.querySelectorAll('.hr330-ov .hr330-li')[8];var c0=window.__hrAria330QA.closes;r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,open:window.__hrAria330QA.isOpen(),closes:window.__hrAria330QA.closes-c0,cur:window.__hrAria345QA.cur(),inFocus:(document.activeElement&&document.activeElement.closest)?!!document.activeElement.closest('.hr330-ov'):false}})())")
QAJ=$(unjj "$QA")
if [ "$(jf acts "$QAJ")" = "6" ] && [ "$(jf last "$QAJ")" = "act:?@8" ] && [ "$(jf open "$QAJ")" = "false" ] && [ "$(jf closes "$QAJ")" = "1" ] && [ "$(printf '%s' "$QAJ" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('cur'); print('null' if not c else str(c.get('i'))+':'+str(c.get('k')))" 2>/dev/null)" = "null" ] && [ "$(jf inFocus "$QAJ")" = "false" ]; then ok "ই২ই: '?'-সারি-Enter-টগল-বন্ধ (সারি-৮ {'?'} → hr330-এক-উৎস-টগল {isOpen=false + closes+১} + coOrig345-পরিষ্কারণ {কার্সর-শূন্য + অভ্যন্তর-ফোকাস-ব্লার} + acts=৬ + act:?@8 {idx-প্রি-ক্যাপচুর-প্রমাণ — dispatchEvent-সিঙ্ক্রোনাস-গোটচা-সংশোধন})"; else bad "ই২ই: ?-টগল $(unjj "$QA")"; fi
ev "JSON.stringify((function(){window.__hrAria330QA.open('qa');var x=document.querySelector('.hr330-ov .hr330-x');x.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'h1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
HJ=$(ev "JSON.stringify((function(){var c0=window.__hrAria330QA.closes;var openBefore=window.__hrAria330QA.isOpen();document.querySelector('.hr330-ov .hr330-x').click();return{acts:window.__hrAria346QA.acts,blocked:window.__hrAria346QA.blocked,openBefore:openBefore,closes:window.__hrAria330QA.closes-c0,openAfter:window.__hrAria330QA.isOpen()}})())")
HJJ=$(unjj "$HJ")
if [ "$(jf acts "$HJJ")" = "6" ] && [ "$(jf blocked "$HJJ")" = "1" ] && [ "$(jf openBefore "$HJJ")" = "true" ] && [ "$(jf closes "$HJJ")" = "1" ] && [ "$(jf openAfter "$HJJ")" = "false" ]; then ok "ই২ই: .hr330-x-বাটন-হাইজ্যাক-শূন্য (x-Enter = li-বহি-নীরব-উপেক্ষা {acts/blocked-অপরিবর্তিত + ওভারলে-খোলা-টিকে} + x-ক্লিক-নেটিভ-পথ-অটুট {closes+১ — s330-নিজস্ব-যন্ত্র})"; else bad "ই২ই: x-হাইজ্যাক $(unjj "$HJ")"; fi
CS=$(ev "JSON.stringify({opens:window.__hrAria330QA.opens,closes:window.__hrAria330QA.closes,navs:window.__hrAria345QA.navs,homes:window.__hrAria345QA.homes,ends:window.__hrAria345QA.ends,wraps:window.__hrAria345QA.wraps,acts:window.__hrAria346QA.acts,blocked:window.__hrAria346QA.blocked,cp344:window.__hrAria344QA.copies,hist:window.__hrAria317QA.hist().length,reg:window.__hrAria333QA.rows(),e346:window.__hrAria346QA.err,e345:window.__hrAria345QA.err})")
CSJ=$(unjj "$CS")
if [ "$(jf opens "$CSJ")" = "2" ] && [ "$(jf closes "$CSJ")" = "2" ] && [ "$(jf navs "$CSJ")" = "5" ] && [ "$(jf homes "$CSJ")" = "1" ] && [ "$(jf ends "$CSJ")" = "2" ] && [ "$(jf wraps "$CSJ")" = "0" ] && [ "$(jf acts "$CSJ")" = "6" ] && [ "$(jf blocked "$CSJ")" = "1" ] && [ "$(jf cp344 "$CSJ")" = "0" ] && [ "$(jf reg "$CSJ")" = "9" ] && [ "$(jf e346 "$CSJ")" = "" ] && [ "$(jf e345 "$CSJ")" = "" ]; then ok "ই২ই: কাউন্টার-সততা-সহাবস্থান (q330h-opens/closes-ডেল্টা {২/২} + q345h-নেভ-লেজার {navs=৫/homes=১/ends=২/wraps=০ — Enter-নেভ-গণনা-স্পর্শ-শূন্য} + q346h {acts=৬/blocked=১} + q344h.copies-অটুট {সর্ব-মোড-বাটন-কেবল} + রেজিস্ট্রি-৯ + সর্ব-হুক-ত্রুটি-শূন্য)"; else bad "ই২ই: কাউন্টার $(unjj "$CS")"; fi
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৬)');window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[0];r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'sc1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-ওভারলে + সবুজ-কার্সর-সারি)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs346-মোবাইল-390 (ফ্ল্যাশ-কম্প্যাক্ট-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
opentip
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৬)');window.__hrAria330QA.open('qa');var r=document.querySelectorAll('.hr330-ov .hr330-li')[2];r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
MOB=$(ev "JSON.stringify((function(){var r=document.querySelector('.hr330-ov .hr330-li.hr346-act');var cs=r?getComputedStyle(r):null;var bg=cs?cs.backgroundColor:'';var sh=cs?cs.boxShadow:'';return{acts:window.__hrAria346QA.acts,last:window.__hrAria346QA.last,bgEmerald:bg.indexOf('16, 185, 129')>=0,shInset:sh.indexOf('inset')>=0,sh15:sh.indexOf('1.5px')>=0}})())")
MOBJ=$(unjj "$MOB")
if [ "$(jf acts "$MOBJ")" = "1" ] && [ "$(jf last "$MOBJ")" = "act:X@2" ] && [ "$(jf bgEmerald "$MOBJ")" = "true" ] && [ "$(jf sh15 "$MOBJ")" = "true" ]; then ok "ই২ই: মোবাইল-390 ফ্ল্যাশ-কম্প্যাক্ট (inset 1.5px-≤640px-গেট + emerald-bg-ব্যান্ড {rgba(16,185,129)-গভীর-টোন} + act:X@2-প্রতিনিধি {rld-পুনঃআরম্ভ-গণনা-রীতি — acts=১-পোস্ট-রিলোড} + hr321-hist-স্থায়িত্ব-গেট)"; else bad "ই২ই: মোবাইল $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1),noKey:(function(){var ks=Object.keys(sessionStorage);for(var i=0;i<ks.length;i++){if(ks[i].indexOf('hr346')>=0)return false}return true})()})")
CLNJ=$(unjj "$CLN")
if [ "$(jf ss "$CLNJ")" = "true" ] && [ "$(jf rows "$CLNJ")" = "9" ] && [ "$(jf noKey "$CLNJ")" = "true" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য {hr346-কী-শূন্য-সহ} + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CLN")"; fi
ERR1=$(ev "(function(){return window.__s346console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s346-suite ✓ সর্ব-সবুজ"; else echo "s346-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
