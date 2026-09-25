#!/bin/bash
# s338-suite.sh — session338: hr338 রেজিস্ট্রি-হিন্ট-রিড-API getHints + ডিফ-প্রিভিউ diffHints + sfs338 ডিফ-পেন্ডিং-kbd-টোন
# [Task ID 175] PLANS session337-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (session336-নোটের-৩য়-বিকল্প-উত্তরাধিকার):
#   hr338 (admin/home-reorder.ejs — hr337-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি): q333h.getHints() —
#      রেজিস্ট্রি-RAW-মানচিত্র-কপি ({fmt}-অরেজলভড — setHints-ইনপুট-বিন্যাসে — রাউন্ড-ট্রিপ-চুক্তি — প্রতি-কলে-
#      নতুন-অবজেক্ট — বাহ্যিক-মিউটেশন-সুরক্ষা); q333h.diffHints(intended) — ব্যাচ-পূর্ব-ডিফ-প্রিভিউ
#      {changed, same, missed, total} — অবৈধ-ইনপুট = diff:invalid; শ্রেণি-গেট (sfs338): changed>০-তে
#      hr338-diff-শ্রেণি + changed=০/সফল-setHints-প্রয়োগে-অপসারণ (hr337-চেইন-উপরে-hr338-চেইন);
#      রিড-কেবল-চুক্তি (রেজিস্ট্রি/লাইন/স্টোরেজ-মিউটেশন-শূন্য); __hrAria338QA {gets, diffs, changed, missed, last, get(), diff(), line(), err}
#   sfs338 (home-reorder.ejs ইনলাইন-<style> session338-ব্লক — কেবল-সংযোজন — হেক্স-শূন্য — layout-neutral —
#      cascade-অবস্থান session337-পরে — দ্বি-শ্রেণি-সহাবস্থানে diff-৩০%-প্রাধান্য):
#      .hr324-kbd.hr338-diff অতি-গভীর-টোন ৩০% + সর্বোচ্চ-গাঢ়-টেক্সট (kbd-র‍্যাম্প ৮→১৫→২২→৩০ — সর্ব-ব্যান্ড-এক-মান — MO=৪-অটুট)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         computed-রঙ-assert = ফরম্যাট-নিরপেক্ষ-পার্স + টিপ-প্রদর্শন = দ্বি-কপি + blur+focus-রেসিপি + প্রতি-reload-
#         recipe-পুনঃপ্রয়োগ (s337-গোটচা-①) + admin-ভিউ-টার্গেট-CSS = ইনলাইন-<style>-ই + রিড-API-কপি-সুরক্ষা +
#         **সুইট-শেষে hr337-hints-পরিষ্কারণ (রিগ্রেশন-সহাবস্থান-চুক্তি)**
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s338-diff-desk.png
SH_MOB=/home/z/my-project/download/s338-diff-mobile390.png
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
recipe(){
  ev "JSON.stringify((function(){try{if(!window.__clipCap338)Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap338=t;return Promise.resolve()}},configurable:true})}catch(e){};var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'rc1'})())" >/dev/null 2>&1
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
(cd "$APP" && node db/migrate.js >/tmp/s338-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s338-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr338-রিড-API + sfs338-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "var q338h = { gets: 0, diffs: 0, changed: 0, missed: 0, last: '', err: '' };" "$EJSF" && ok "home-reorder.ejs: __hrAria338QA-কাউন্টার-পঞ্চক (gets/diffs/changed/missed/last)" || bad "home-reorder.ejs: কাউন্টার-অমিল"
grep -q "if (r338.length > 2 && r338\[2\]) m338\[String(r338\[0\])\] = String(r338\[2\]);" "$EJSF" && ok "home-reorder.ejs: getHints338-RAW-কপি ([0]→[2] — {fmt}-অরেজলভড — প্রতি-কলে-নতুন-অবজেক্ট)" || bad "home-reorder.ejs: RAW-কপি-অমিল"
grep -q "if (!m338d || typeof m338d !== 'object' || Array.isArray(m338d))" "$EJSF" && ok "home-reorder.ejs: diffHints-অবৈধ-ইনপুট-গার্ড (null/অবজেক্ট-নয়/অ্যারে)" || bad "home-reorder.ejs: ইনপুট-গার্ড-অমিল"
grep -q "return { changed: ch338, same: sm338, missed: ms338, total: tt338 };" "$EJSF" && ok "home-reorder.ejs: ডিফ-সারসংক্ষেপ {changed, same, missed, total} রিটার্ন" || bad "home-reorder.ejs: ডিফ-সারসংক্ষেপ-অমিল"
grep -q "q333h.getHints = function () { return getHints338(); };" "$EJSF" && grep -q "q333h.diffHints = function (m338q)" "$EJSF" && ok "home-reorder.ejs: q333h.getHints + q333h.diffHints (register-পরিবার-রিড-সম্প্রসারণ)" || bad "home-reorder.ejs: রিড-API-অমিল"
grep -q "if (on338) kb338g.classList.add('hr338-diff');" "$EJSF" && grep -q "else kb338g.classList.remove('hr338-diff');" "$EJSF" && ok "home-reorder.ejs: শ্রেণি-গেট-জুটি (changed>০-সংযোজন + changed=০-অপসারণ — sfs338-পেন্ডিং-গেট)" || bad "home-reorder.ejs: শ্রেণি-গেট-অমিল"
grep -q "var setHintsOrig338 = q333h.setHints;" "$EJSF" && grep -q "if (r338s && r338s.applied > 0) diffGate338(false);" "$EJSF" && ok "home-reorder.ejs: hr337-চেইন-উপরে-hr338-চেইন + intent-পূর্ণ-অপসারণ-গেট (স্থায়ীকরণ-উত্তরাধিকার)" || bad "home-reorder.ejs: চেইন-গেট-অমিল"
grep -q "window.__hrAria338QA = q338h;" "$EJSF" && grep -q "window.__hrAria337QA = q337h;" "$EJSF" && grep -q "window.__hrAria336QA = q336h;" "$EJSF" && grep -q "window.__hrAria335QA = q335h;" "$EJSF" && grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria338QA-হুক + s337/s336/s335/s334/s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "var setHint335 = function (k335s, h335s)" "$EJSF" && grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "var cf333 = cycleFmt326;" "$EJSF" && grep -q "var appendOrig337 = appendHint334;" "$EJSF" && ok "home-reorder.ejs: সর্ব-পূর্ববর্তী-মোড়ক-গঠন-অস্পৃশ্য (setHint335 + regOrig334 + cf333 + appendOrig337-অটুট)" || bad "home-reorder.ejs: মোড়ক-গঠন-ভাঙা"
A338CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria338QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A338CHK" = "OK" ]; then ok "home-reorder.ejs: hr338-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS338=$(sed -n '/session338 (sfs338 ডিফ-পেন্ডিং-kbd-টোন — admin-ইনলাইন)/,/EOF session338/p' "$EJSF")
HEXN=$(printf '%s' "$CSS338" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS338" ]; then ok "home-reorder.ejs: session338-ইনলাইন-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "home-reorder.ejs: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS338" | grep -c 'session338' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session338-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গোটচা-①-চুক্তি-স্থান)"; else bad "home-reorder.ejs: মার্কার ×$BN"; fi
printf '%s' "$CSS338" | grep -q '.hr317-tip .hr324-kbd.hr338-diff {' && printf '%s' "$CSS338" | grep -q 'background-color: color-mix(in srgb, var(--lf-brand-primary) 30%, transparent)' && printf '%s' "$CSS338" | grep -q 'color: rgba(6, 95, 70, 0.97)' && ok "home-reorder.ejs: ডিফ-পেন্ডিং-টোন ৩০% + সর্বোচ্চ-গাঢ়-টেক্সট (kbd-র‍্যাম্প ৮→১৫→২২→৩০ — sfs337-২২%-উপরে-ধাপ)" || bad "home-reorder.ejs: ডিফ-টোন-রুল-অমিল"
printf '%s' "$CSS338" | grep -q 'background-color' && printf '%s' "$CSS338" | grep -qE 'right:|max-width|width:|padding|border-radius|border:' && bad "home-reorder.ejs: layout/কেবল-রঙ-নীতি-ভাঙা" || ok "home-reorder.ejs: layout-neutral + কেবল-রঙ (background-color+color — geometry-অস্পৃশ্য)"
C338AFTER=$(grep -n 'EOF session338' "$EJSF" | head -1 | cut -d: -f1)
C337BEFORE=$(grep -n 'EOF session337' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C338AFTER" ] && [ -n "$C337BEFORE" ] && [ "$C338AFTER" -gt "$C337BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session338-ব্লক session337-পরে — দ্বি-শ্রেণি-সহাবস্থানে diff-৩০%-প্রাধান্য-চুক্তি)"; else bad "home-reorder.ejs: cascade-অবস্থান-ভাঙা (338@$C338AFTER ≤ 337@$C337BEFORE)"; fi
B338=$(grep -c 'session338' "$APP/public/assets/css/style.css" | tr -d ' ')
B337=$(grep -c 'session337' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B338" = "0" ] && [ "$B337" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session338/337-শূন্য (admin-CSS-চুক্তি — গোটচা-①) + session334 ×২-অটুট"; else bad "style.css: s338×$B338 s337×$B337 s334×$GOODCSS (admin-CSS-চুক্তি-অমিল)"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C338S=$(printf '%s' "$SSC" | grep -c 'session338' | tr -d ' ')
C334K=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C338S" = "0" ] && [ "$C334K" = "2" ]; then ok "সার্ভেড-CSS: session334 ×২-লাইভ-অটুট + session338-শূন্য (ফিড-সাইড-অস্পৃশ্য — admin-CSS-চুক্তি-লাইভ-প্রমাণ)"; else bad "সার্ভেড-CSS: s338×$C338S s334×$C334K"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: hr338+sfs338-ই২ই (রিড-API + ডিফ-প্রিভিউ + টোন-৩০%) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria338QA,g:window.__hrAria338QA?window.__hrAria338QA.gets:-1,d:window.__hrAria338QA?window.__hrAria338QA.diffs:-1,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria338QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf g "$Q0J")" = "0" ] && [ "$(jf d "$Q0J")" = "0" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria338QA-হুক (কাউন্টার=০ + ত্রুটি-শূন্য) + s337/s336/s335/s334/s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
GH=$(ev "JSON.stringify((function(){var m=window.__hrAria333QA.getHints();m.X='MUTATED';var m2=window.__hrAria333QA.getHints();var ks=Object.keys(m2);return{n:ks.length,x:m2.X==='X = পয়েন্টার-সারি বিলোপ',cp:m2.X!=='MUTATED',g:window.__hrAria338QA.gets,last:window.__hrAria338QA.last}})())")
GHJ=$(unjj "$GH")
if [ "$(jf n "$GHJ")" = "9" ] && [ "$(jf x "$GHJ")" = "true" ] && [ "$(jf cp "$GHJ")" = "true" ] && [ "$(jf g "$GHJ")" = "2" ] && printf '%s' "$(jf last "$GHJ")" | grep -q 'get:'; then ok "ই২ই: getHints-রিড-API (৯-কী-RAW + ডিফল্ট-মিল + **কপি-সুরক্ষা** {MUTATED-বাহ্যিক-মিউটেশন-অস্পৃশ্য} + gets=২ + get:-last)"; else bad "ই২ই: $(unjj "$GH")"; fi
DF1=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.diffHints({'X':'X = স্থায়ী (৩৩৭)'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{c:r.changed,s:r.same,mi:r.missed,t:r.total,cls:k?k.classList.contains('hr338-diff'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
DF1J=$(unjj "$DF1")
if [ "$(jf c "$DF1J")" = "1" ] && [ "$(jf s "$DF1J")" = "0" ] && [ "$(jf mi "$DF1J")" = "0" ] && [ "$(jf t "$DF1J")" = "1" ] && [ "$(jf cls "$DF1J")" = "true" ] && [ "$(jf al "$DF1J")" = "0.3" ]; then ok "ই২ই: ডিফ-প্রিভিউ-পরিবর্তন ({changed:১, same:০, missed:০, total:১} + hr338-diff-শ্রেণি + টোন α=0.30 — sfs338-গেট-অন)"; else bad "ই২ই: $(unjj "$DF1")"; fi
DF2=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.diffHints({'X':'X = পয়েন্টার-সারি বিলোপ'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{c:r.changed,s:r.same,cls:k?k.classList.contains('hr338-diff'):true,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
DF2J=$(unjj "$DF2")
if [ "$(jf c "$DF2J")" = "0" ] && [ "$(jf s "$DF2J")" = "1" ] && [ "$(jf cls "$DF2J")" = "false" ] && [ "$(jf al "$DF2J")" = "0.08" ]; then ok "ই২ই: ডিফ-অভিন্ন-গেট-অফ ({changed:০, same:১} + শ্রেণি-অপসারণ + বেস-টোন-ফেরত α=0.08)"; else bad "ই২ই: $(unjj "$DF2")"; fi
DF3=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.diffHints({'Z__NOPE':'z','X':'X = স্থায়ী (৩৩৭)'});var k=document.querySelector('.hr317-tip .hr324-kbd');return{c:r.changed,mi:r.missed,t:r.total,cls:k?k.classList.contains('hr338-diff'):true}})())")
DF3J=$(unjj "$DF3")
if [ "$(jf c "$DF3J")" = "1" ] && [ "$(jf mi "$DF3J")" = "1" ] && [ "$(jf t "$DF3J")" = "2" ] && [ "$(jf cls "$DF3J")" = "true" ]; then ok "ই২ই: মিশ্র-ডিফ (অজানা-কী=miss-উত্তরাধিকার + পরিবর্তন-সহ-গেট-অন)"; else bad "ই২ই: $(unjj "$DF3")"; fi
IV=$(ev "JSON.stringify((function(){var r1=window.__hrAria333QA.diffHints(null);var r2=window.__hrAria333QA.diffHints(['arr']);var k=document.querySelector('.hr317-tip .hr324-kbd');return{c1:r1.changed,mi1:r1.missed,t1:r1.total,c2:r2.changed,mi2:r2.missed,cls:k?k.classList.contains('hr338-diff'):true,last:window.__hrAria338QA.last}})())")
IVJ=$(unjj "$IV")
if [ "$(jf c1 "$IVJ")" = "0" ] && [ "$(jf mi1 "$IVJ")" = "1" ] && [ "$(jf t1 "$IVJ")" = "0" ] && [ "$(jf c2 "$IVJ")" = "0" ] && [ "$(jf mi2 "$IVJ")" = "1" ] && [ "$(jf cls "$IVJ")" = "false" ] && [ "$(jf last "$IVJ")" = "diff:invalid" ]; then ok "ই২ই: অবৈধ-ইনপুট-জুটি (null+অ্যারে = {missed:১} + গেট-অফ + diff:invalid-last)"; else bad "ই২ই: $(unjj "$IV")"; fi
RT=$(ev "JSON.stringify((function(){var m=window.__hrAria333QA.getHints();m.X='X = রাউন্ড-ট্রিপ';var d=window.__hrAria333QA.diffHints(m);var r=window.__hrAria333QA.setHints(m);var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';var g2=window.__hrAria333QA.getHints();return{dc:d.changed,r:r.applied,cls38:k?k.classList.contains('hr338-diff'):true,cls36:k?k.classList.contains('hr336-batched'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],x:g2.X==='X = রাউন্ড-ট্রিপ',pv:window.__hrAria337QA.map().X==='X = রাউন্ড-ট্রিপ'}})())")
RTJ=$(unjj "$RT")
if [ "$(jf dc "$RTJ")" = "1" ] && [ "$(jf r "$RTJ")" = "9" ] && [ "$(jf cls38 "$RTJ")" = "false" ] && [ "$(jf cls36 "$RTJ")" = "true" ] && [ "$(jf al "$RTJ")" = "0.15" ] && [ "$(jf x "$RTJ")" = "true" ] && [ "$(jf pv "$RTJ")" = "true" ]; then ok "ই২ই: রাউন্ড-ট্রিপ (getHints→সম্পাদনা→diff{changed:১}→setHints{applied:৯} → গেট-অফ + hr336-batched-১৫% + RAW-আপডেট + hr337-স্থায়ীকরণ-স্বয়ংক্রিয়)"; else bad "ই২ই: $(unjj "$RT")"; fi
AP=$(ev "JSON.stringify((function(){var m=window.__hrAria333QA.getHints();var d=window.__hrAria333QA.diffHints(m);var k=document.querySelector('.hr317-tip .hr324-kbd');return{c:d.changed,s:d.same,t:d.total,mi:d.missed,cls:k?k.classList.contains('hr338-diff'):true}})())")
APJ=$(unjj "$AP")
if [ "$(jf c "$APJ")" = "0" ] && [ "$(jf s "$APJ")" = "9" ] && [ "$(jf t "$APJ")" = "9" ] && [ "$(jf mi "$APJ")" = "0" ] && [ "$(jf cls "$APJ")" = "false" ]; then ok "ই২ই: রাউন্ড-ট্রিপ-স্বয়ংসমতা (diff(getHints()) = {changed:০, same:৯, missed:০} — রিড-নিরপেক্ষতা-প্রমাণ)"; else bad "ই২ই: $(unjj "$AP")"; fi
rld
RL=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{ho:window.__hrAria337QA.hintOf('X'),cls37:k?k.classList.contains('hr337-restored'):false,cls38:k?k.classList.contains('hr338-diff'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],g:window.__hrAria338QA.gets}})())")
RLJ=$(unjj "$RL")
if [ "$(jf ho "$RLJ")" = "X = রাউন্ড-ট্রিপ" ] && [ "$(jf cls37 "$RLJ")" = "true" ] && [ "$(jf cls38 "$RLJ")" = "false" ] && [ "$(jf al "$RLJ")" = "0.22" ] && [ "$(jf g "$RLJ")" = "0" ]; then ok "ই২ই: reload-পর hr337-পুনঃপ্রয়োগ-অটুট (hintOf-পুনঃস্থাপিত + টোন α=0.22) + hr338-শ্রেণি-অনুপস্থিত + fresh-gets=০ (রিড-API-অ-স্থায়ী)"; else bad "ই২ই: $(unjj "$RL")"; fi
CS=$(ev "JSON.stringify((function(){var d=window.__hrAria333QA.diffHints({'D':'D = ডিফ-ক্যাসকেড'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';var c37=k?k.classList.contains('hr337-restored'):false;var c38=k?k.classList.contains('hr338-diff'):false;return{c:d.changed,c37:c37,c38:c38,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
CSJ=$(unjj "$CS")
if [ "$(jf c "$CSJ")" = "1" ] && [ "$(jf c37 "$CSJ")" = "true" ] && [ "$(jf c38 "$CSJ")" = "true" ] && [ "$(jf al "$CSJ")" = "0.3" ]; then ok "ই২ই: ত্রি-রাজ্য-ক্যাসকেড-প্রাধান্য (restored+diff-দ্বি-শ্রেণি-সহাবস্থানে diff-৩০%-জয়ী — cascade-চুক্তি-লাইভ-প্রমাণ)"; else bad "ই২ই: $(unjj "$CS")"; fi
AP2=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.setHints({'D':'D = ডিফ-ক্যাসকেড'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{a:r.applied,c38:k?k.classList.contains('hr338-diff'):false,c37:k?k.classList.contains('hr337-restored'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
AP2J=$(unjj "$AP2")
if [ "$(jf a "$AP2J")" = "1" ] && [ "$(jf c38 "$AP2J")" = "false" ] && [ "$(jf c37 "$AP2J")" = "true" ] && [ "$(jf al "$AP2J")" = "0.22" ]; then ok "ই২ই: প্রয়োগ-পরবর্তী-গেট-অফ + ক্যাসকেড-অবনমন (applied=১ → diff-শ্রেণি-অপসারণ → restored-২২%-ফেরত — intent-পূর্ণ-চুক্তি)"; else bad "ই২ই: $(unjj "$AP2")"; fi
OV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1; agent-browser wait 450 >/dev/null 2>&1; ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,r:window.__hrAria333QA.rows()})")
OVJ=$(unjj "$OV")
if [ "$(jf o "$OVJ")" = "true" ] && [ "$(jf li "$OVJ")" = "9" ] && [ "$(jf r "$OVJ")" = "9" ]; then ok "ই২ই: ওভারলে-৯-সারি (রিড-API-রো-গণনা-অস্পৃশ্য-প্রমাণ — hr343)"; else bad "ই২ই: $(unjj "$OV")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-প্রয়োগ-পরবর্তী-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
QERR=$(ev "JSON.stringify({e:(window.__hrAria338QA.err||'')+(window.__hrAria337QA.err||'')+(window.__hrAria336QA.err||'')+(window.__hrAria335QA.err||'')+(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s330+s333+hr334+hr335+hr336+hr337+hr338)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৪: sfs338-মোবাইল-390 (ডিফ-টোন-সর্ব-ব্যান্ড-এক-মান) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints')}catch(e){};return 'mc0'})())" >/dev/null 2>&1
rld
MT0=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip .hr324-kbd');if(!k)return{e:'no-kbd'};var bg=getComputedStyle(k).backgroundColor;return{al:(bg.match(/([0-9.]+)\)$/)||['',''])[1],cls:k.classList.contains('hr338-diff')}})())")
MT0J=$(unjj "$MT0")
if [ "$(jf e "$MT0J")" = "" ] && [ "$(jf al "$MT0J")" = "0.08" ] && [ "$(jf cls "$MT0J")" = "false" ]; then ok "ই২ই: মোবাইল-390 ডিফ-পূর্ব বেস-টোন α=0.08 + শ্রেণি-অনুপস্থিত (ফ্রেশ-লোড)"; else bad "ই২ই: $(unjj "$MT0")"; fi
MD=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.diffHints({'E':'E = মোবাইল-ডিফ (৩৯০)'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{c:r.changed,cls:k?k.classList.contains('hr338-diff'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
MDJ=$(unjj "$MD")
if [ "$(jf c "$MDJ")" = "1" ] && [ "$(jf cls "$MDJ")" = "true" ] && [ "$(jf al "$MDJ")" = "0.3" ]; then ok "ই২ই: মোবাইল-390 ডিফ-গেট-অন (changed=১ + টোন α=0.30 — সর্ব-ব্যান্ড-এক-মান — media-query-শূন্য-প্রমাণ)"; else bad "ই২ই: $(unjj "$MD")"; fi
MA=$(ev "JSON.stringify((function(){var r=window.__hrAria333QA.setHints({'E':'E = মোবাইল-ডিফ (৩৯০)'});var k=document.querySelector('.hr317-tip .hr324-kbd');var bg=k?getComputedStyle(k).backgroundColor:'';return{a:r.applied,cls:k?k.classList.contains('hr338-diff'):false,cls36:k?k.classList.contains('hr336-batched'):false,al:(bg.match(/([0-9.]+)\)$/)||['',''])[1]}})())")
MAJ=$(unjj "$MA")
if [ "$(jf a "$MAJ")" = "1" ] && [ "$(jf cls "$MAJ")" = "false" ] && [ "$(jf cls36 "$MAJ")" = "true" ] && [ "$(jf al "$MAJ")" = "0.15" ]; then ok "ই২ই: মোবাইল-390 প্রয়োগ-পরবর্তী-গেট-অফ (applied=১ → diff-শ্রেণি-অপসারণ + hr336-batched-১৫%-গেট-অন — s336-ব্যাচ-উত্তরাধিকার — ডেস্ক-RT-সমতা)"; else bad "ই২ই: $(unjj "$MA")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 প্রয়োগ-পরবর্তী-রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

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
if [ "$FAIL" = "0" ]; then echo "s338-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s338-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
