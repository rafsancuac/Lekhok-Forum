#!/bin/bash
# s317-suite.sh — session317: sfs317 keynav aria-live ঘোষণা + hr317 সাম্প্রতিক-কপি-ইতিহাস টুলটিপ
# [Task ID 154] PLANS session316-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs317 (feed.ejs) — sfs314-keynav-হাইলাইটের স্ক্রিন-রিডার-ঘোষণা: গ্রুপ-লেবেল + বাংলা-অবস্থান
#      (n/মোট) — visually-hidden role=status aria-live=polite অঞ্চলে; অঞ্চল phone-অ্যাংকরের
#      বাইরে (s306-একক-লিঙ্ক-চুক্তি অটুট — লিঙ্কের accessible-name-অপরিবর্তিত);
#      __sfs317Announce/__sfs317Clear guarded-হুক (sfs315-রীতি) + __sfs317QA {announces, last, live(), text()}
#   ③ hr317 (admin/home-reorder.ejs) — hr316-কপি-সফলতায় __hrAria317Record (per-key {at,n}-রেজিস্ট্রি)
#      + কপি-বাটনে hover/focus-এ body-পোর্টাল-টুলটিপ (chip-এর overflow:hidden-ক্লিপ-বহির্ভূত):
#      "সর্বশেষ কপি: <slug> · <x বার> · <সময়-আগে>" / "এখনো কপি হয়নি" + Escape-বিলোপ + __hrAria317QA
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + transition-পরবর্তী-অ্যাসার্ট (wait ≥৪০০ms) +
#         ক্লিপবোর্ড-স্টাব (defineProperty — s316-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_LIVE=/home/z/my-project/download/s317-liveregion-desk.png
SH_TIP=/home/z/my-project/download/s317-tip-admin.png
SH_MOB=/home/z/my-project/download/s317-liveregion-mobile390.png
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
    if [ "$u" = "$1" ]; then agent-browser reload >/dev/null 2>&1; return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s317-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s317-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'class="sfs317-live" role="status" aria-live="polite" aria-atomic="true"' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfs317-live-অঞ্চল (role=status + polite + atomic)" || bad "feed.ejs: live-অঞ্চল-অমিল"
grep -q 'phone-অ্যাংকরের বাইরে' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: live-অঞ্চল phone-অ্যাংকর-বহির্ভূত (s306-চুক্তি-নোট)" || bad "feed.ejs: স্থাপন-নোট-অমিল"
grep -q "if (window.__sfs317Announce) window.__sfs317Announce(labs314\[i314\], i314, labs314.length)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: apply314-এ __sfs317Announce guarded-হুক" || bad "feed.ejs: announce-হুক-অমিল"
grep -q "if (window.__sfs317Clear) window.__sfs317Clear();" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: clear314-এ __sfs317Clear guarded-হুক" || bad "feed.ejs: clear-হুক-অমিল"
grep -q "__hrAria317Record" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria317Record-রেজিস্ট্রি" || bad "home-reorder.ejs: রেকর্ড-অনুপস্থিত"
grep -q "if (window.__hrAria317Record) window.__hrAria317Record(txt316)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: done316-এ guarded-রেকর্ড-হুক" || bad "home-reorder.ejs: রেকর্ড-হুক-অমিল"
grep -q "className = 'hr317-tip'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr317-tip-পোর্টাল (body-অ্যাপেন্ডেড)" || bad "home-reorder.ejs: টুলটিপ-পোর্টাল-অনুপস্থিত"
grep -q "ago317" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: বাংলা-সময়-আগে-হেল্পার (ago317)" || bad "home-reorder.ejs: ago317-অনুপস্থিত"
grep -q "focusin" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: focusin/out-ডেলিগেশন" || bad "home-reorder.ejs: focusin-অনুপস্থিত"
B317=$(python3 - "$APP/public/assets/css/style.css" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding='utf-8').read()
i = t.find('session317 (sfs317')
e = t.find('EOF session317')
print(t[i:e] if i != -1 and e > i else 'MISSING')
PYEOF
)
if [ "$B317" != "MISSING" ]; then
  ok "style.css: session317-ব্লক উপস্থিত"
  HEXN=$(printf '%s' "$B317" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
  if [ "$HEXN" = "0" ]; then ok "style.css: session317-ব্লক হেক্স-শূন্য"; else bad "style.css: হেক্স ×$HEXN (session317-ব্লক)"; fi
  echo "$B317" | grep -q "clip-path: inset(50%)" && ok "style.css: visually-hidden-ক্লিপ" || bad "style.css: clip-অমিল"
  echo "$B317" | grep -q "pointer-events: none" && ok "style.css: pointer-events-none (layout-অনুপ্রেক্ষিত)" || bad "style.css: pointer-events-অনুপস্থিত"
  echo "$B317" | grep -q "prefers-reduced-motion" && ok "style.css: reduced-motion-গার্ড" || bad "style.css: reduced-motion-অনুপস্থিত"
  echo "$B317" | grep -q "max-width: 640px" && ok "style.css: 640px-ব্লক" || bad "style.css: 640px-অনুপস্থিত"
else
  bad "style.css: session317-ব্লক-অনুপস্থিত"
fi
python3 -c "
import re
t = open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
for tag, key in (('s314','__sfs314QA'), ('s315','__sfs315QA'), ('s317','__sfs317QA')):
    b = [x for x in blocks if key in x]
    open('/tmp/s317-%s.js' % tag, 'w', encoding='utf-8').write(b[0] if b else 'MISSING')
print('OK' if all(any(key in x for x in blocks) for key in ('__sfs314QA','__sfs315QA','__sfs317QA')) else 'MISSING')
" | grep -q "OK" && ok "ইনলাইন-নিষ্কাশন (s314/s315/s317)" || bad "নিষ্কাশন-ব্যর্থ"
node --check /tmp/s317-s314.js && ok "node --check s314-ইনলাইন (পুরাতন-অটুট)" || bad "s314 --check-ব্যর্থ"
node --check /tmp/s317-s315.js && ok "node --check s315-ইনলাইন (পুরাতন-অটুট)" || bad "s315 --check-ব্যর্থ"
node --check /tmp/s317-s317.js && ok "node --check s317-ইঞ্জিন (নতুন)" || bad "s317 --check-ব্যর্থ"

echo "── ধাপ-২: SSR-ডায়নামিক (live-অঞ্চল ×১ + পুরাতন-চুক্তি-অটুট) ──"
SS0=$(curl -s "$BASE/")
LV=$(printf '%s' "$SS0" | grep -o 'class="sfs317-live"' | wc -l | tr -d ' ')
if [ "$LV" = "1" ]; then ok "SSR: sfs317-live ×১ (একক-উদাহরণ — ডুপ-নেই)"; else bad "SSR: live ×$LV"; fi
printf '%s' "$SS0" | grep -q 'role="status" aria-live="polite" aria-atomic="true"' && ok "SSR: live-অঞ্চল-গুণ-রেন্ডার" || bad "SSR: গুণ-অমিল"
KH=$(printf '%s' "$SS0" | grep -o 'class="sfs316-kbdhint"' | wc -l | tr -d ' ')
if [ "$KH" = "1" ]; then ok "SSR: kbdhint ×১ (s316-অটুট)"; else bad "SSR: kbdhint ×$KH"; fi
AC=$(printf '%s' "$SS0" | grep -o 'aria-controls="sfs314-grows-' | wc -l | tr -d ' ')
if [ "$AC" = "2" ]; then ok "SSR: s314-aria-controls ×২ (অটুট)"; else bad "SSR: aria-controls ×$AC"; fi
GT=$(printf '%s' "$SS0" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (s313-অটুট)"; else bad "SSR: glabel ×$GT"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি — live-অঞ্চল বহির্ভূত)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs317-ই২ই (ঘোষণা-জীবনচক্র: ঘোষণা→হালনাগাদ→বিলোপ→পুনঃঘোষণা) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs317QA,an:window.__sfs317QA?window.__sfs317QA.announces:-1,live:window.__sfs317QA?window.__sfs317QA.live():false,err:(window.__sfs317QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf an "$Q0J")" = "0" ]; then ok "ই২ই: __sfs317QA-হুক (announces=০ প্রারম্ভিক)"; else bad "ই২ই: q=$(jf q "$Q0J") an=$(jf an "$Q0J")"; fi
if [ "$(jf live "$Q0J")" = "true" ]; then ok "ই২ই: live-অঞ্চল-ডম-উপস্থিত"; else bad "ই২ই: live-অঞ্চল-অনুপস্থিত"; fi
if [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$Q0J")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim(),l1:ls[1]?String(ls[1].textContent).replace(/\\s+/g,' ').trim():''}})())")
LBJ=$(unjj "$LB")
L0=$(jf l0 "$LBJ"); L1=$(jf l1 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] [$L1])"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'a1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A1=$(ev "JSON.stringify({an:window.__sfs317QA.announces,last:window.__sfs317QA.last,tx:window.__sfs317QA.text(),at:document.querySelector('.sfs292-phone').getAttribute('data-sfs314-focus')})")
A1J=$(unjj "$A1")
case "$(jf last "$A1J")" in *"$L0"*"১/২") ok "ই২ই: ঘোষণা-১ = প্রথম-লেবেল + বাংলা-অবস্থান (১/২)";; *) bad "ই২ই: last=[$(jf last "$A1J")]";; esac
if [ "$(jf tx "$A1J")" = "$(jf last "$A1J")" ]; then ok "ই২ই: live-region-text == হুক-সত্য (সিঙ্কড)"; else bad "ই২ই: tx=[$(jf tx "$A1J")]"; fi
AT1=$(jf at "$A1J")
if [ "$AT1" = "real-popular" ] || [ "$AT1" = "real-latest" ] || [ -n "$AT1" ]; then ok "ই২ই: data-sfs314-focus-সিঙ্ক অটুট ($AT1)"; else bad "ই২ই: at-অনুপস্থিত"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'a2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A2=$(ev "JSON.stringify({an:window.__sfs317QA.announces,last:window.__sfs317QA.last})")
A2J=$(unjj "$A2")
case "$(jf last "$A2J")" in *"$L1"*"২/২") ok "ই২ই: ঘোষণা-২ = দ্বিতীয়-লেবেল + ২/২ (হালনাগাদ)";; *) bad "ই২ই: last=[$(jf last "$A2J")]";; esac
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'e1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
A3=$(ev "JSON.stringify({an:window.__sfs317QA.announces,tx:window.__sfs317QA.text(),at:document.querySelector('.sfs292-phone').getAttribute('data-sfs314-focus')})")
A3J=$(unjj "$A3")
if [ -z "$(jf tx "$A3J")" ]; then ok "ই২ই: Escape→ঘোষণা-বিলোপ (text-শূন্য)"; else bad "ই২ই: tx=[$(jf tx "$A3J")]"; fi
if [ "$(jf an "$A3J")" = "2" ]; then ok "ই২ই: বিলোপে announce-গণনা-অপরিবর্তিত"; else bad "ই২ই: an=$(jf an "$A3J")"; fi
if [ -z "$(jf at "$A3J")" ] || [ "$(jf at "$A3J")" = "None" ]; then ok "ই২ই: Escape→data-sfs314-focus-বিলোপ (s314-অটুট)"; else bad "ই২ই: at=$(jf at "$A3J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');var d=new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true});p.dispatchEvent(d);return 'u1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A4=$(ev "JSON.stringify({an:window.__sfs317QA.announces,last:window.__sfs317QA.last})")
A4J=$(unjj "$A4")
case "$(jf last "$A4J")" in *"$L1"*"২/২") ok "ই২ই: পুনঃঘোষণা-ArrowUp→ওয়ার্প-শেষ-লেবেল (২/২)";; *) bad "ই২ই: last=[$(jf last "$A4J")]";; esac
if [ "$(jf an "$A4J")" = "3" ]; then ok "ই২ই: announces=৩ (জীবনচক্র-গণনা-সঠিক)"; else bad "ই২ই: an=$(jf an "$A4J")"; fi
if agent-browser screenshot "$SH_LIVE" >/dev/null 2>&1; then ok "স্ক্রিনশট: লাইভ-অঞ্চল-অঞ্চল (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr317-ই২ই (রেকর্ড-রেজিস্ট্রি + পোর্টাল-টুলটিপ) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1,tip:window.__hrAria317QA?window.__hrAria317QA.tip():null,b:window.__hrAria316QA?window.__hrAria316QA.btns():-1,err:(window.__hrAria317QA||{}).err||''})")
H0J=$(unjj "$H0")
if [ "$(jf h "$H0J")" = "0" ]; then ok "ই২ই: ইতিহাস-প্রারম্ভিক-শূন্য"; else bad "ই২ই: hist=$(jf h "$H0J")"; fi
if [ "$(jf b "$H0J")" = "2" ]; then ok "ই২ই: কপি-বাটন ×২ (hr316-অটুট)"; else bad "ই২ই: btns=$(jf b "$H0J")"; fi
if [ "$(jf err "$H0J")" = "" ]; then ok "ই২ই: hr317-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$H0J")"; fi
T0=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't1'})())" )
agent-browser wait 250 >/dev/null 2>&1
T1=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),tx:window.__hrAria317QA.text()})")
T1J=$(unjj "$T1")
if [ "$(jf tip "$T1J")" = "true" ]; then ok "ই২ই: hover→টুলটিপ-দৃশ্যমান"; else bad "ই২ই: tip=$(jf tip "$T1J")"; fi
if [ "$(jf tx "$T1J")" = "এখনো কপি হয়নি" ]; then ok "ই২ই: কখনো-কপি-হয়নি-পাঠ"; else bad "ই২ই: tx=[$(jf tx "$T1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(jf tip "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")")")" = "false" ]; then ok "ই২ই: mouseout→টুলটিপ-বিলোপ"; else bad "ই২ই: mouseout-পরবর্তী-দৃশ্যমান"; fi
ev "JSON.stringify((function(){window.__clipCap317=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap317=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
K0=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.click();return String(b.getAttribute('data-copy')||'')})())")
agent-browser wait 500 >/dev/null 2>&1
H1=$(ev "JSON.stringify({n:window.__hrAria317QA.hist().length,k:window.__hrAria317QA.hist().length?window.__hrAria317QA.hist()[0].key:'',c:window.__hrAria317QA.hist().length?window.__hrAria317QA.hist()[0].n:0,cap:window.__clipCap317,copied:window.__hrAria316QA.copied})")
H1J=$(unjj "$H1")
if [ "$(jf n "$H1J")" = "1" ]; then ok "ই২ই: কপি→ইতিহাস-এন্ট্রি ×১"; else bad "ই২ই: hist=$(jf n "$H1J")"; fi
if [ "$(jf k "$H1J")" = "$(jf cap "$H1J")" ] && [ -n "$(jf k "$H1J")" ]; then ok "ই২ই: রেকর্ড-কী == ক্লিপবোর্ড-ক্যাপচার [$(jf k "$H1J")]"; else bad "ই২ই: k=[$(jf k "$H1J")] cap=[$(jf cap "$H1J")]"; fi
if [ "$(jf copied "$H1J")" = "$(jf k "$H1J")" ]; then ok "ই২ই: hr316-হুক-সামঞ্জস্য (copied==key)"; else bad "ই২ই: copied=[$(jf copied "$H1J")]"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'k2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
H2=$(ev "JSON.stringify({n:window.__hrAria317QA.hist().length,c:window.__hrAria317QA.hist().length?window.__hrAria317QA.hist()[0].n:0})")
H2J=$(unjj "$H2")
if [ "$(jf n "$H2J")" = "1" ] && [ "$(jf c "$H2J")" = "2" ]; then ok "ই২ই: পুনঃকপি→একই-এন্ট্রি (n=২ — ডুপ-নেই)"; else bad "ই২ই: n=$(jf n "$H2J") c=$(jf c "$H2J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
T3=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),tx:window.__hrAria317QA.text()})")
T3J=$(unjj "$T3")
case "$(jf tx "$T3J")" in "সর্বশেষ কপি: "*"২ বার"*"এইমাত্র"*) ok "ই২ই: টুলটিপ-পাঠ = সর্বশেষ-কপি + গণনা (২ বার) + সময় (এইমাত্র)";; *) bad "ই২ই: tx=[$(jf tx "$T3J")]";; esac
ev "JSON.stringify((function(){document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'esc'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(jf tip "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")")")" = "false" ]; then ok "ই২ই: Escape→টুলটিপ-বিলোপ"; else bad "ই২ই: Escape-পরবর্তী-দৃশ্যমান"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
T4=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),tx:window.__hrAria317QA.text()})")
T4J=$(unjj "$T4")
if [ "$(jf tip "$T4J")" = "true" ] && [ "$(jf tx "$T4J")" = "এখনো কপি হয়নি" ]; then ok "ই২ই: focus→দ্বিতীয়-বাটনে নিজস্ব-স্টেট (এখনো কপি হয়নি)"; else bad "ই২ই: tip=$(jf tip "$T4J") tx=[$(jf tx "$T4J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.blur();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(jf tip "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")")")" = "false" ]; then ok "ই২ই: blur→টুলটিপ-বিলোপ"; else bad "ই২ই: blur-পরবর্তী-দৃশ্যমান"; fi
if agent-browser screenshot "$SH_TIP" >/dev/null 2>&1; then ok "স্ক্রিনশট: কপি-ইতিহাস-টুলটিপ (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + live-অঞ্চল-উপস্থিত + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,lv:document.querySelectorAll('.sfs317-live').length,e317:(window.__sfs317QA||{}).err||'',pr:(window.__sfs314QA||{}).pairs})")
MJ=$(unjj "$M")
HS=$(jf hs "$MJ")
if [ "$HS" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf lv "$MJ")" = "1" ]; then ok "মোবাইলে live-অঞ্চল ×১"; else bad "মোবাইলে live=$(jf lv "$MJ")"; fi
if [ "$(jf e317 "$MJ")" = "" ] && [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে s314/s317-ইঞ্জিন-অটুট"; else bad "মোবাইলে ইঞ্জিন-অমিল"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৬: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
bopen "$BASE/" || bad "হোম-পুনঃopen-ব্যর্থ"
agent-browser wait 1800 >/dev/null 2>&1
E=$(agent-browser errors 2>/dev/null | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "কনসোল-ত্রুটি: $E"; fi
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s317-suite ✓ সর্ব-সবুজ"; else echo "s317-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
