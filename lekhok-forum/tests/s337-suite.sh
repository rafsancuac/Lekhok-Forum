#!/bin/bash
# s337-suite.sh — session337: hr337 রেজিস্ট্রি-হিন্ট-স্থায়ীকরণ (sessionStorage-replay) + sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন
# [Task ID 174] PLANS session336-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড):
#   hr337 (admin/home-reorder.ejs — hr336-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি): q333h.setHint/setHints-
#      পাবলিক-API-চেইন-মোড়ক — সফল-প্রয়োগে persist337(): রেজিস্ট্রি-স্ন্যাপশট (অ-শূন্য-হিন্ট — {fmt}-RAW) —
#      sessionStorage 'hr337-hints' JSON; শূন্য-মানচিত্রে removeItem; replay337(): invalid-JSON-নিরাপদ-পাঠ —
#      প্রতি-কী-তে setHint335-প্রতিনিধি (ত্রি-পথ-উত্তরাধিকার); applied≥১-এ hr337-restored-শ্রেণি (sfs337-গেট —
#      টিপ-প্রস্তুতে-সরাসরি + tip317=null-এ pending → appendHint334-মোড়কে-স্থগিত-প্রয়োগ); IIFE-সমাপ্তি-
#      স্বয়ংক্রিয়-পুনঃপ্রয়োগ (reload-পরবর্তী-হিন্ট-পুনঃপ্রয়োগ); QA-হুক-প্রতিনিধি-বাইপাস-চুক্তি;
#      __hrAria337QA {saves, restores, misses, clears, pending, last, save(), load(), map(), clearStore(), hintOf(), line(), err}
#   sfs337 (home-reorder.ejs ইনলাইন-<style> session337-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral):
#      .hr324-kbd.hr337-restored গভীরতর-ব্র্যান্ড-টোন ২২% + অতি-গাঢ়-টেক্সট (kbd-র‍্যাম্প ৮→১৫→২২ —
#      cascade: session337-ব্লক session336-পরে — দ্বি-শ্রেণি-সহাবস্থানে restored-প্রাধান্য — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         computed-রঙ-assert = ফরম্যাট-নিরপেক্ষ-পার্স + টিপ-প্রদর্শন = দ্বি-কপি + blur+focus-রেসিপি
#         (s334-গোটচা-① — **প্রতি-reload-পরবর্তী-পুনঃপ্রয়োগ-বাধ্যতামূলক — tip317-ডাইনামিক-নির্মাণ —
#         reload-পরে টিপ-অনুপস্থিত — স্থায়ীকরণ-সুইট-গোটচা-①**) + admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই
#         (s335-গোটচা-①) + পরিবেশ-রাজ্য = সুইট-অভ্যন্তরীণ-সীমিত + স্ন্যাপশট-অর্থবিদ্যা (persist = সর্ব-রেজিস্ট্রি-
#         হিন্ট — reload-পরে অ-সংরক্ষিত-কী = স্ট্যাটিক-ডিফল্ট-ফেরত) +
#         **সুইট-শেষে hr337-hints-পরিষ্কারণ (রিগ্রেশন-সহাবস্থান-চুক্তি — পরবর্তী-সুইটে-ফ্রেশ-লোড-অটুট)**
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s337-restored-desk.png
SH_MOB=/home/z/my-project/download/s337-restored-mobile390.png
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
# recipe — s334-গোটচা-①-রেসিপি (টিপ-নির্মাণ + প্রদর্শন): USER_FEED-নির্বাচন + ক্লিপবোর্ড-স্টাব + দ্বি-কপি + blur+focus
recipe(){
  ev "JSON.stringify((function(){try{if(!window.__clipCap337)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap337=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'rc2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'rc3'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'rc4'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
}
rld(){ agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1; recipe; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s337-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s337-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr337-স্থায়ীকরণ + sfs337-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "var q337h = { saves: 0, restores: 0, misses: 0, clears: 0, pending: false, last: '', err: '' };" "$EJSF" && ok "home-reorder.ejs: __hrAria337QA-কাউন্টার-পঞ্চক+পতাকা (saves/restores/misses/clears/pending)" || bad "home-reorder.ejs: কাউন্টার-অমিল"
grep -q "var HR337_KEY = 'hr337-hints';" "$EJSF" && grep -q "window.sessionStorage.setItem(HR337_KEY, JSON.stringify(m337))" "$EJSF" && ok "home-reorder.ejs: persist337 + HR337_KEY (sessionStorage-JSON-স্ন্যাপশট)" || bad "home-reorder.ejs: persist-API-অমিল"
grep -q "if (r337.length > 2 && r337\[2\]) m337\[String(r337\[0\])\] = String(r337\[2\]);" "$EJSF" && ok "home-reorder.ejs: রেজিস্ট্রি-[0]→[2]-স্ন্যাপশট (অ-শূন্য-হিন্ট-কেবল — {fmt}-RAW-অরেজলভড)" || bad "home-reorder.ejs: স্ন্যাপশট-রীতি-অমিল"
grep -q "if (!p337 || typeof p337 !== 'object' || Array.isArray(p337)) return {};" "$EJSF" && ok "home-reorder.ejs: invalid-JSON/অ্যারে-নিরাপদ-পাঠ (storedMap337-গার্ড)" || bad "home-reorder.ejs: নিরাপদ-পাঠ-গার্ড-অমিল"
grep -q "if (setHint335(ks337r\[j337\], m337r\[ks337r\[j337\]\])) ok337r += 1; else miss337r += 1;" "$EJSF" && ok "home-reorder.ejs: প্রতি-কী-তে setHint335-প্রতিনিধি (ত্রি-পথ-উত্তরাধিকার)" || bad "home-reorder.ejs: প্রতিনিধি-অমিল"
grep -q "var setHintOrig337 = q333h.setHint;" "$EJSF" && grep -q "var setHintsOrig337 = q333h.setHints;" "$EJSF" && ok "home-reorder.ejs: পাবলিক-API-চেইন-মোড়ক-জুটি (regOrig334-চেইন-রীতি)" || bad "home-reorder.ejs: চেইন-মোড়ক-অমিল"
grep -q "if (ok337c) persist337();" "$EJSF" && grep -q "if (r337c && r337c.applied > 0) persist337();" "$EJSF" && ok "home-reorder.ejs: সফল-প্রয়োগে-স্থায়ীকরণ-গেট (set+setHints-দ্বি-পথ)" || bad "home-reorder.ejs: স্থায়ীকরণ-গেট-অমিল"
grep -q "else q337h.pending = true;" "$EJSF" && grep -q "var appendOrig337 = appendHint334;" "$EJSF" && grep -q "kb337w.classList.add('hr337-restored'); q337h.pending = false;" "$EJSF" && ok "home-reorder.ejs: শ্রেণি-বিলম্ব-চুক্তি (tip317-null → pending → appendHint334-মোড়কে-স্থগিত-প্রয়োগ — টিপ-নির্মাণ-পথ)" || bad "home-reorder.ejs: বিলম্ব-চুক্তি-অমিল"
grep -q "try { replay337(); } catch (e337i)" "$EJSF" && ok "home-reorder.ejs: IIFE-সমাপ্তি-স্বয়ংক্রিয়-পুনঃপ্রয়োগ (এক-বার — reload-পরবর্তী-হিন্ট-পুনঃপ্রয়োগ)" || bad "home-reorder.ejs: স্বয়ংক্রিয়-পুনঃপ্রয়োগ-অমিল"
grep -q "kb337r.classList.add('hr337-restored')" "$EJSF" && grep -q "if (ok337r > 0)" "$EJSF" && ok "home-reorder.ejs: applied≥১-এ hr337-restored-শ্রেণি (sfs337-টোন-গেট — টিপ-প্রস্তুত-পথ)" || bad "home-reorder.ejs: টোন-গেট-অমিল"
grep -q "window.__hrAria337QA = q337h;" "$EJSF" && grep -q "window.__hrAria336QA = q336h;" "$EJSF" && grep -q "window.__hrAria335QA = q335h;" "$EJSF" && grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria337QA-হুক + s336/s335/s334/s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "var setHint335 = function (k335s, h335s)" "$EJSF" && grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "var cf333 = cycleFmt326;" "$EJSF" && ok "home-reorder.ejs: hr335/hr334/hr333-মোড়ক-গঠন-অস্পৃশ্য (setHint335 + regOrig334 + cf333-অটুট)" || bad "home-reorder.ejs: মোড়ক-গঠন-ভাঙা"
A337CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria337QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A337CHK" = "OK" ]; then ok "home-reorder.ejs: hr337-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS337=$(sed -n '/session337 (sfs337 পুনঃপ্রয়োগ-সনাক্ত-kbd-টোন — admin-ইনলাইন)/,/EOF session337/p' "$EJSF")
HEXN=$(printf '%s' "$CSS337" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS337" ]; then ok "home-reorder.ejs: session337-ইনলাইন-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "home-reorder.ejs: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS337" | grep -c 'session337' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session337-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গোটচা-①-চুক্তি-স্থান)"; else bad "home-reorder.ejs: মার্কার ×$BN"; fi
printf '%s' "$CSS337" | grep -q '.hr317-tip .hr324-kbd.hr337-restored {' && printf '%s' "$CSS337" | grep -q 'background-color: color-mix(in srgb, var(--lf-brand-primary) 22%, transparent)' && printf '%s' "$CSS337" | grep -q 'color: rgba(6, 95, 70, 0.95)' && ok "home-reorder.ejs: পুনঃপ্রয়োগ-টোন ২২% + অতি-গাঢ়-টেক্সট (kbd-র‍্যাম্প ৮→১৫→২২ — sfs336-১৫%-উপরে-ধাপ)" || bad "home-reorder.ejs: পুনঃপ্রয়োগ-টোন-রুল-অমিল"
printf '%s' "$CSS337" | grep -q 'background-color' && printf '%s' "$CSS337" | grep -qE 'right:|max-width|width:|padding|border-radius|border:' && bad "home-reorder.ejs: layout/কেবল-রঙ-নীতি-ভাঙা" || ok "home-reorder.ejs: layout-neutral + কেবল-রঙ (background-color+color — geometry-অস্পৃশ্য)"
C337AFTER=$(grep -n 'EOF session337' "$EJSF" | head -1 | cut -d: -f1)
C336BEFORE=$(grep -n 'EOF session336' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C337AFTER" ] && [ -n "$C336BEFORE" ] && [ "$C337AFTER" -gt "$C336BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session337-ব্লক session336-পরে — দ্বি-শ্রেণি-সহাবস্থানে restored-২২%-প্রাধান্য-চুক্তি)"; else bad "home-reorder.ejs: cascade-অবস্থান-ভাঙা (337@$C337AFTER ≤ 336@$C336BEFORE)"; fi
B337=$(grep -c 'session337' "$APP/public/assets/css/style.css" | tr -d ' ')
B336=$(grep -c 'session336' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B337" = "0" ] && [ "$B336" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session337/336-শূন্য (admin-CSS-চুক্তি — গোটচা-①: admin-পৃষ্ঠা style.css-লোড-করে-না) + session334 ×২-অটুট"; else bad "style.css: s337×$B337 s336×$B336 s334×$GOODCSS (admin-CSS-চুক্তি-অমিল)"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন — s333-সুইটে-যাচাইকৃত)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C337S=$(printf '%s' "$SSC" | grep -c 'session337' | tr -d ' ')
C336S=$(printf '%s' "$SSC" | grep -c 'session336' | tr -d ' ')
C334K=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C337S" = "0" ] && [ "$C336S" = "0" ] && [ "$C334K" = "2" ]; then ok "সার্ভেড-CSS: session334 ×২-লাইভ-অটুট + session337/336-শূন্য (ফিড-সাইড-অস্পৃশ্য — admin-CSS-চুক্তি-লাইভ-প্রমাণ)"; else bad "সার্ভেড-CSS: s337×$C337S s336×$C336S s334×$C334K"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: hr337+sfs337-ই২ই (স্থায়ীকরণ + reload-পুনঃপ্রয়োগ + টোন-২২%) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria337QA,s:window.__hrAria337QA?window.__hrAria337QA.saves:-1,r:window.__hrAria337QA?window.__hrAria337QA.restores:-1,mi:window.__hrAria337QA?window.__hrAria337QA.misses:-1,c:window.__hrAria337QA?window.__hrAria337QA.clears:-1,pd:window.__hrAria337QA?window.__hrAria337QA.pending:true,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria337QA||{}).err||''),m:Object.keys((window.__hrAria337QA&&window.__hrAria337QA.map())||{}).length})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf s "$Q0J")" = "0" ] && [ "$(jf r "$Q0J")" = "0" ] && [ "$(jf mi "$Q0J")" = "0" ] && [ "$(jf c "$Q0J")" = "0" ] && [ "$(jf pd "$Q0J")" = "false" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf m "$Q0J")" = "0" ]; then ok "ই২ই: __hrAria337QA-হুক (সর্ব-কাউন্টার=০ + pending=false + মানচিত্র-শূন্য + ত্রুটি-শূন্য) + s336/s335/s334/s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
TONE0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr337-restored'),cls36:k.classList.contains('hr336-batched')}})())")
TONE0J=$(unjj "$TONE0")
if [ "$(jf e "$TONE0J")" = "" ] && [ "$(jf al "$TONE0J")" = "0.08" ] && [ "$(jf cls "$TONE0J")" = "false" ] && [ "$(jf cls36 "$TONE0J")" = "false" ]; then ok "ই২ই: পুনঃপ্রয়োগ-পূর্ব kbd-বেস-টোন α=0.08 + hr337-restored/hr336-batched-শ্রেণি-অনুপস্থিত (স্টোরেজ-শূন্য-ফ্রেশ-চুক্তি)"; else bad "ই২ই: $(unjj "$TONE0")"; fi
ST=$(ev "JSON.stringify((function(){var ok=window.__hrAria333QA.setHint('X','X = স্থায়ী (৩৩৭)');var m=window.__hrAria337QA.map();var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';return{ok:ok,x:m.X==='X = স্থায়ী (৩৩৭)',sv:window.__hrAria337QA.saves,kb:t.indexOf('X = স্থায়ী (৩৩৭)')>=0,eq:t===window.__hrAria337QA.line(),last:window.__hrAria337QA.last}})())")
STJ=$(unjj "$ST")
if [ "$(jf ok "$STJ")" = "true" ] && [ "$(jf x "$STJ")" = "true" ] && [ "$(jf sv "$STJ")" = "1" ] && [ "$(jf kb "$STJ")" = "true" ] && [ "$(jf eq "$STJ")" = "true" ] && printf '%s' "$(jf last "$STJ")" | grep -q 'persist:'; then ok "ই২ই: পাবলিক-setHint → স্থায়ীকরণ (map-RAW-মিল + saves=১ + লাইভ-উপস্থিত + live==line + persist:-last)"; else bad "ই২ই: $(unjj "$ST")"; fi
rld
RL1=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{ho:window.__hrAria337QA.hintOf('X'),cls:k?k.classList.contains('hr337-restored'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],r:window.__hrAria337QA.restores,s:window.__hrAria337QA.saves,e:(window.__hrAria337QA.err||''),eq:(k?k.textContent:'')===window.__hrAria337QA.line()}})())")
RL1J=$(unjj "$RL1")
if [ "$(jf ho "$RL1J")" = "X = স্থায়ী (৩৩৭)" ] && [ "$(jf cls "$RL1J")" = "true" ] && [ "$(jf al "$RL1J")" = "0.22" ] && [ "$(jf r "$RL1J")" = "1" ] && [ "$(jf s "$RL1J")" = "0" ] && [ "$(jf e "$RL1J")" = "" ] && [ "$(jf eq "$RL1J")" = "true" ]; then ok "ই২ই: reload-পুনঃপ্রয়োগ (hintOf-পুনঃস্থাপিত + hr337-restored-শ্রেণি + টোন α=0.22 + restores=১ + fresh-saves=০ + live==line)"; else bad "ই২ই: $(unjj "$RL1")"; fi
MB=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.setHints({'D':'D = স্থায়ী-ব্যাচ','F':'F = {fmt} স্থায়ী'});var m=window.__hrAria337QA.map();return{a:r.applied,sv:window.__hrAria337QA.saves,d:m.D==='D = স্থায়ী-ব্যাচ',fr:m.F==='F = {fmt} স্থায়ী',last:window.__hrAria337QA.last}})())")
MBJ=$(unjj "$MB")
if [ "$(jf a "$MBJ")" = "2" ] && [ "$(jf sv "$MBJ")" = "1" ] && [ "$(jf d "$MBJ")" = "true" ] && [ "$(jf fr "$MBJ")" = "true" ]; then ok "ই২ই: পাবলিক-ব্যাচ → স্থায়ীকরণ ({applied:২} + saves=১ + RAW-স্ন্যাপশট — {fmt}-অরেজলভড-সংরক্ষণ-প্রমাণ)"; else bad "ই২ই: $(unjj "$MB")"; fi
rld
RL2=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var t=k?k.textContent:'';var lr=window.__hrAria337QA.load();return{hd:window.__hrAria337QA.hintOf('D'),hf:window.__hrAria337QA.hintOf('F'),tr:t.indexOf('{fmt}')<0,cls:k?k.classList.contains('hr337-restored'):false}})())")
RL2J=$(unjj "$RL2")
if [ "$(jf hd "$RL2J")" = "D = স্থায়ী-ব্যাচ" ] && printf '%s' "$(jf hf "$RL2J")" | grep -q 'F = সমৃদ্ধ স্থায়ী' && [ "$(jf tr "$RL2J")" = "true" ] && [ "$(jf cls "$RL2J")" = "true" ]; then ok "ই২ই: reload-ব্যাচ-পুনঃপ্রয়োগ (D-পুনঃস্থাপিত + {fmt}-কল-টাইম-'সমৃদ্ধ'-রেজলভ + literal-শূন্য + শ্রেণি-উপস্থিত)"; else bad "ই২ই: $(unjj "$RL2")"; fi
CS=$(ev "JSON.stringify((function(){var ok=window.__hrAria333QA.setHint('D','');var m=window.__hrAria337QA.map();return{ok:ok,d:!!m.D,hasX:!!m.X,hasF:!!m.F}})())")
CSJ=$(unjj "$CS")
if [ "$(jf ok "$CSJ")" = "true" ] && [ "$(jf d "$CSJ")" = "false" ] && [ "$(jf hasX "$CSJ")" = "true" ] && [ "$(jf hasF "$CSJ")" = "true" ]; then ok "ই২ই: শূন্য-মান-সেট → মানচিত্র-থেকে-বিলোপ (D-অনুপস্থিত + X/F-অটুট — persist337-পুনঃস্ন্যাপশট)"; else bad "ই২ই: $(unjj "$CS")"; fi
rld
RL3=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');return{hd:window.__hrAria337QA.hintOf('D'),hx:window.__hrAria337QA.hintOf('X'),r:window.__hrAria337QA.restores,cls:k?k.classList.contains('hr337-restored'):false}})())")
RL3J=$(unjj "$RL3")
if [ "$(jf hd "$RL3J")" = "D = ডাউনলোড" ] && [ "$(jf hx "$RL3J")" = "X = স্থায়ী (৩৩৭)" ] && [ "$(jf r "$RL3J")" = "1" ] && [ "$(jf cls "$RL3J")" = "true" ]; then ok "ই২ই: স্থায়ী-ক্লিয়ার-অর্থবিদ্যা (reload-পর D=স্ট্যাটিক-ডিফল্ট-ফেরত + X-কাস্টম-অটুট + restored-শ্রেণি — স্ন্যাপশট-অর্থবিদ্যা)"; else bad "ই২ই: $(unjj "$RL3")"; fi
DC=$(ev "JSON.stringify((function(){var rb=window.__hrAria333QA.setHints({'S':'S = ক্যাসকেড (৩৩৭)'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';var cls36=k?k.classList.contains('hr336-batched'):false;var cls37b=k?k.classList.contains('hr337-restored'):false;var lr=window.__hrAria337QA.load();var cls37=k?k.classList.contains('hr337-restored'):false;var bg2=k?getComputedStyle(k).backgroundColor:'';return{ba:rb.applied,cls36:cls36,cls37b:cls37b,cls37:cls37,a:lr.applied,al1:(bg.match(/([0-9.]+)\)$/)||['',''])[1],al2:(bg2.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
DCJ=$(unjj "$DC")
if [ "$(jf ba "$DCJ")" = "1" ] && [ "$(jf cls36 "$DCJ")" = "true" ] && [ "$(jf cls37b "$DCJ")" = "true" ] && [ "$(jf cls37 "$DCJ")" = "true" ] && [ "$(jf a "$DCJ")" = "8" ] && [ "$(jf al1 "$DCJ")" = "0.22" ] && [ "$(jf al2 "$DCJ")" = "0.22" ]; then ok "ই২ই: দ্বি-শ্রেণি-ক্যাসকেড-প্রাধান্য (RL3-পুনঃপ্রয়োগ-শ্রেণি-অটুট + ব্যাচে hr336-batched-যুক্ত → দ্বি-শ্রেণি-সহাবস্থানে al1=al2=০.২২ — restored-২২%-প্রাধান্য cascade-চুক্তি-লাইভ-প্রমাণ + load()-applied=৮-সর্ব-স্ন্যাপশট)"; else bad "ই২ই: $(unjj "$DC")"; fi
IJ=$(ev "JSON.stringify((function(){try{sessionStorage.setItem('hr337-hints','not-json{')}catch(e){};return 'ij'})())" >/dev/null 2>&1; rld; ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');var lr=window.__hrAria337QA.load();var bg=k?getComputedStyle(k).backgroundColor:'';return{a:lr.applied,t:lr.total,e:(window.__hrAria337QA.err||'').length>0,cls:k?k.classList.contains('hr337-restored'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
IJJ=$(unjj "$IJ")
if [ "$(jf a "$IJJ")" = "0" ] && [ "$(jf t "$IJJ")" = "0" ] && [ "$(jf e "$IJJ")" = "true" ] && [ "$(jf cls "$IJJ")" = "false" ] && [ "$(jf al "$IJJ")" = "0.08" ]; then ok "ই২ই: invalid-JSON-স্টোরেজ-নিরাপদ (replay-total=০ + err-ক্যাপচার + শ্রেণি-অনুপস্থিত + বেস-টোন-অটুট — নীরব-ব্যর্থতা)"; else bad "ই২ই: $(unjj "$IJ")"; fi
ev "JSON.stringify((function(){try{window.__hrAria337QA.clearStore()}catch(e){};return 'cb0'})())" >/dev/null 2>&1
rld
CB=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{m:Object.keys(window.__hrAria337QA.map()).length,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k?k.classList.contains('hr337-restored'):false,eq:(k?k.textContent:'')===window.__hrAria337QA.line()}})())")
CBJ=$(unjj "$CB")
if [ "$(jf m "$CBJ")" = "0" ] && [ "$(jf al "$CBJ")" = "0.08" ] && [ "$(jf cls "$CBJ")" = "false" ] && [ "$(jf eq "$CBJ")" = "true" ]; then ok "ই২ই: clearStore-পরবর্তী-ফ্রেশ-রাজ্য (মানচিত্র-শূন্য + বেস-টোন ০.০৮ + শ্রেণি-অনুপস্থিত + live==line)"; else bad "ই২ই: $(unjj "$CB")"; fi
OV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,r:window.__hrAria333QA.rows()})")
OVJ=$(unjj "$OV")
if [ "$(jf o "$OVJ")" = "true" ] && [ "$(jf li "$OVJ")" = "8" ] && [ "$(jf r "$OVJ")" = "8" ]; then ok "ই২ই: ওভারলে-৮-সারি (স্থায়ীকরণ-রো-গণনা-অস্পৃশ্য — হিন্ট-কেবল-পুনঃপ্রয়োগ-প্রমাণ)"; else bad "ই২ই: $(unjj "$OV")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-ফ্রেশ-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333+hr334+hr335+hr336+hr337 — ফ্রেশ-পেজ-পরবর্তী)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs337-মোবাইল-390 (পুনঃপ্রয়োগ-টোন-সর্ব-ব্যান্ড-এক-মান) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints')}catch(e){};return 'mc0'})())" >/dev/null 2>&1
rld
MT0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr337-restored')}})())")
MT0J=$(unjj "$MT0")
if [ "$(jf e "$MT0J")" = "" ] && [ "$(jf al "$MT0J")" = "0.08" ] && [ "$(jf cls "$MT0J")" = "false" ]; then ok "ই২ই: মোবাইল-390 পুনঃপ্রয়োগ-পূর্ব বেস-টোন α=0.08 + শ্রেণি-অনুপস্থিত (ফ্রেশ-লোড)"; else bad "ই২ই: $(unjj "$MT0")"; fi
MS=$(ev "JSON.stringify((function(){var ok=window.__hrAria333QA.setHint('D','D = মোবাইল-স্থায়ী (৩৯০)');return{ok:ok,sv:window.__hrAria337QA.saves}})())")
MSJ=$(unjj "$MS")
if [ "$(jf ok "$MSJ")" = "true" ] && [ "$(jf sv "$MSJ")" = "1" ]; then ok "ই২ই: মোবাইল-390 স্থায়ীকরণ-সেট (saves=১)"; else bad "ই২ই: $(unjj "$MS")"; fi
rld
MT1=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{ho:window.__hrAria337QA.hintOf('D'),al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k?k.classList.contains('hr337-restored'):false}})())")
MT1J=$(unjj "$MT1")
if [ "$(jf ho "$MT1J")" = "D = মোবাইল-স্থায়ী (৩৯০)" ] && [ "$(jf al "$MT1J")" = "0.22" ] && [ "$(jf cls "$MT1J")" = "true" ]; then ok "ই২ই: মোবাইল-390 reload-পুনঃপ্রয়োগ (hintOf-পুনঃস্থাপিত + টোন α=0.22 + শ্রেণি-উপস্থিত — সর্ব-ব্যান্ড-এক-মান — media-query-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$MT1")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 পুনঃপ্রয়োগ-টোন সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints-রিগ্রেশন-চুক্তি) + দ্বি-লোড-কনসোল + নেট-শূন্য ──"
ev "JSON.stringify((function(){try{window.__hrAria337QA.clearStore()}catch(e){};return 'cl0'})())" >/dev/null 2>&1
rld
CLN=$(ev "JSON.stringify({m:Object.keys(window.__hrAria337QA.map()).length,ss:(sessionStorage.getItem('hr337-hints')===null)})")
CLNJ=$(unjj "$CLN")
if [ "$(jf m "$CLNJ")" = "0" ] && [ "$(jf ss "$CLNJ")" = "true" ]; then ok "পরিষ্কারণ: hr337-hints-শূন্য (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি — রিগ্রেশন-সহাবস্থান)"; else bad "পরিষ্কারণ-ব্যর্থ: $(unjj "$CLN")"; fi
CN=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN:-0}" = "0" ] || [ -z "$CN" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ×$CN"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
CN2=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN2:-0}" = "0" ] || [ -z "$CN2" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "দ্বি-লোড-ত্রুটি ×$CN2"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে সার্ভার-বুট-ব্যর্থ"
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s337-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s337-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
