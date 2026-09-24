#!/bin/bash
# s320-suite.sh — session320: sfs320 নাম-চিপ সময়-ভিত্তিক-স্বয়ং-বিলোপ + hr320 ইতিহাস-কীবোর্ড-নেভিগেশন
# [Task ID 157] PLANS session319-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ③ sfs320 (feed.ejs) — নাম-চিপের সময়-ভিত্তিক-স্বয়ং-বিলোপ: প্রদর্শনের __sfs320Cfg.ms
#      (ডিফল্ট ৪০০০ms) পরে data-sfs320-off → CSS-ফেড-আউট (দ্বি-গেট-ভিতরে opacity-ওভাররাইড);
#      __sfs319Show/__sfs319Hide guarded-মোড়ক (s319-বন্ধ-অস্পৃশ্য — গণনা s319-ব্যবস্থাপন্ন);
#      প্রতি-Show-এ off-বিলোপ + রি-আর্ম; Hide-এ ডিস-আর্ম + off-বিলোপ; __sfs320QA
#      {fired, off(), ms(), arm(), err}
#   ② hr320 (admin/home-reorder.ejs) — ইতিহাস-কীবোর্ড-নেভিগেশন: কপি-বাটন-ফোকাসেই
#      ArrowDown/ArrowUp = পয়েন্টার-স্থানান্তর (hist[০]=সর্বশেষ, clamp-বাউন্ড) + সারিতে
#      .hr320-ptr চিহ্ন; Enter = পয়েন্টার-কী-পুনঃকপি (rowRecopy319-এক-উৎস); পয়েন্টার-শূন্যে
#      Enter = বাটনের-নিজস্ব-কপি (নেটিভ-পথ-অস্পৃশ্য); tipHide317-মোড়ক (সর্ব-বিলোপ-পথে
#      পয়েন্টার-পরিষ্কার); সারি-focus/role/tabindex-অনুপ্রবেশ-শূন্য; __hrAria320QA
#      {ptr(), moves, copies, err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + transition-পরবর্তী-অ্যাসার্ট (viswait-পোল) +
#         ক্লিপবোর্ড-স্টাব (defineProperty — s316) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         __sfs320Cfg.ms-ইনজেকশন (একই-বস্তু-রেফারেন্স — QA-সংক্ষিপ্ত-সময়-পথ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_FADE=/home/z/my-project/download/s320-autofade-desk.png
SH_KBD=/home/z/my-project/download/s320-kbdnav-admin.png
SH_MOB=/home/z/my-project/download/s320-autofade-mobile390.png
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

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s320-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s320-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs320Cfg = window.__sfs320Cfg || { ms: 4000 }' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs320Cfg.ms-কনফিগ (ডিফল্ট ৪০০০ms)" || bad "feed.ejs: কনফিগ-অমিল"
grep -q "c320b.setAttribute('data-sfs320-off', '1')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: টাইমার-টু-data-sfs320-off-পথ" || bad "feed.ejs: off-পথ-অমিল"
grep -q 'var sh320 = window.__sfs319Show;' "$APP/views/partials/home/feed.ejs" && grep -q 'var hd320 = window.__sfs319Hide;' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show/__sfs319Hide guarded-মোড়ক (s319-বন্ধ-অস্পৃশ্য)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "c320c.removeAttribute('data-sfs320-off')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: প্রতি-Show-এ off-বিলোপ + রি-আর্ম" || bad "feed.ejs: রিসেট-অমিল"
grep -q 'window.__sfs320QA = q320' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs320QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs319-namechip\[data-sfs319-on\]\[data-sfs320-off\]' "$APP/public/assets/css/style.css" && ok "style.css: off-ওভাররাইড দ্বি-গেট-ভিতরে (specificity-উচ্চতর)" || bad "style.css: off-গেট-অমিল"
CSS320=$(sed -n '/session320 (sfs320 নাম-চিপ সময়-ভিত্তিক-স্বয়ং-বিলোপ)/,/EOF session320/p' "$APP/public/assets/css/style.css")
printf '%s' "$CSS320" | grep -q 'prefers-reduced-motion' && ok "style.css: session320-ব্লকে reduced-motion" || bad "style.css: reduced-motion-অনুপস্থিত"
HEXN=$(printf '%s' "$CSS320" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session320-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
grep -q '.hr318-row.hr320-ptr' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr320-ptr-স্টাইল (is-cur-সহাবস্থান — inset-বাম-বার)" || bad "home-reorder.ejs: ptr-স্টাইল-অমিল"
grep -q 'var ptrIdx320' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'var ptrSync320' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ptrIdx/ptrSync-জোড়া (পয়েন্টার-মূল)" || bad "home-reorder.ejs: ptr-জোড়া-অমিল"
grep -q "e320b.key === 'ArrowDown' || e320b.key === 'ArrowUp'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ArrowDown/ArrowUp-নেভিগেশন-গেট" || bad "home-reorder.ejs: অ্যারো-গেট-অমিল"
grep -q "e320b.key === 'Enter' && ptr320 && ptrIdx320() >= 0" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Enter-গেট (পয়েন্টার-সক্রিয়ে-ই — নেটিভ-পথ-অস্পৃশ্য)" || bad "home-reorder.ejs: enter-গেট-অমিল"
grep -q 'rowRecopy319(ptr320, null)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Enter → rowRecopy319-এক-উৎস-পুনঃব্যবহার" || bad "home-reorder.ejs: recopy-অমিল"
grep -q "i320c > hist317.length - 1) i320c = hist317.length - 1" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: clamp-বাউন্ড (উভয়-প্রান্ত)" || bad "home-reorder.ejs: clamp-অমিল"
grep -q 'var recOrig320 = window.__hrAria317Record;' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'recOrig320(k320r);' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria317Record-মোড়ক (অ্যাসিনক-done316-পথ-সহ পুনঃনির্মাণ-পরবর্তী ptrSync)" || bad "home-reorder.ejs: record-মোড়ক-অমিল"
grep -q 'var tipHideOrig320 = tipHide317;' "$APP/admin/views/admin/home-reorder.ejs" && grep -q "tipHide317 = function () { ptr320 = ''; tipHideOrig320(); };" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: tipHide317-মোড়ক (সর্ব-বিলোপ-পথে পয়েন্টার-পরিষ্কার)" || bad "home-reorder.ejs: hide-মোড়ক-অমিল"
grep -q 'window.__hrAria320QA = q320' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria320QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S320CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session320.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S320CHK" = "OK" ]; then ok "feed.ejs: session320-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A320CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria320QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A320CHK" = "OK" ]; then ok "home-reorder.ejs: hr320-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১-অটুট (s319-সহাবস্থান)"; else bad "SSR: নাম-চিপ ×$NC"; fi
if printf '%s' "$SS0" | grep -q '__sfs320QA' && printf '%s' "$SS0" | grep -q '__sfs320Cfg'; then ok "SSR: s320-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s320-ইঞ্জিন-অনুপস্থিত"; fi
S319H=$(printf '%s' "$SS0" | grep -o '__sfs319QA' | wc -l | tr -d ' ')
if [ "$S319H" -ge 1 ]; then ok "SSR: __sfs319QA-হুক-অটুট (s319-সহাবস্থান)"; else bad "SSR: s319-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge ×১-অটুট (s318-সহাবস্থান)"; else bad "SSR: ব্যাজ ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs320-ই২ই (সময়-ভিত্তিক-স্বয়ং-বিলোপ: আর্ম→ফায়ার→ফেড→রিসেট→বিলোপ) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs320QA,ms:window.__sfs320QA?window.__sfs320QA.ms():-1,off:window.__sfs320QA?window.__sfs320QA.off():null,fd:window.__sfs320QA?window.__sfs320QA.fired:-1,err:(window.__sfs320QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf ms "$Q0J")" = "4000" ]; then ok "ই২ই: __sfs320QA-হুক + ডিফল্ট-ms=৪০০০"; else bad "ই২ই: q=$(jf q "$Q0J") ms=$(jf ms "$Q0J")"; fi
if [ "$(jf off "$Q0J")" = "false" ] && [ "$(jf fd "$Q0J")" = "0" ]; then ok "ই২ই: প্রারম্ভিক-অবস্থা — off-নেই + fired=০"; else bad "ই২ই: off=$(jf off "$Q0J") fd=$(jf fd "$Q0J")"; fi
if [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$Q0J")"; fi
ev "window.__sfs320Cfg.ms = 250; 'inj'" >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify(window.__sfs320QA.ms())")")" = "250" ]; then ok "ই২ই: __sfs320Cfg.ms-ইনজেকশন-প্রতিফলিত (একই-বস্তু-রেফারেন্স-চুক্তি)"; else bad "ই২ই: ইনজেকশন-অপ্রতিফলিত"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a1'})())" >/dev/null 2>&1
agent-browser wait 100 >/dev/null 2>&1
A1=$(ev "JSON.stringify({on:window.__sfs319QA.on(),off:window.__sfs320QA.off(),arm:window.__sfs320QA.arm(),fd:window.__sfs320QA.fired,v:getComputedStyle(document.querySelector('.sfs319-namechip')).opacity})")
A1J=$(unjj "$A1")
if [ "$(jf on "$A1J")" = "true" ] && [ "$(jf off "$A1J")" = "false" ] && [ "$(jf arm "$A1J")" = "true" ]; then ok "ই২ই: প্রদর্শন → off-নেই + টাইমার-আর্মড (১০০ms-জানালা — ২৫০ms-ফায়ার-পূর্ব)"; else bad "ই২ই: on=$(jf on "$A1J") off=$(jf off "$A1J") arm=$(jf arm "$A1J")"; fi
if [ "$(jf fd "$A1J")" = "0" ] && [ "$(jf v "$A1J")" != "0" ]; then ok "ই২ই: আর্ম-জানালায় দৃশ্যমান (opacity≠০ — ফেড-পূর্ব)"; else bad "ই২ই: fd=$(jf fd "$A1J") opacity=$(jf v "$A1J")"; fi
agent-browser wait 600 >/dev/null 2>&1
A2=$(ev "JSON.stringify({off:window.__sfs320QA.off(),fd:window.__sfs320QA.fired,op:getComputedStyle(document.querySelector('.sfs319-namechip')).opacity,tr:window.__sfs319QA.on()})")
A2J=$(unjj "$A2")
if [ "$(jf off "$A2J")" = "true" ] && [ "$(jf fd "$A2J")" = "1" ]; then ok "ই২ই: ২৫০ms-পরে data-sfs320-off-প্রয়োগ (fired=১)"; else bad "ই২ই: off=$(jf off "$A2J") fd=$(jf fd "$A2J")"; fi
if [ "$(jf op "$A2J")" = "0" ]; then ok "ই২ই: computed-opacity→০ (CSS-ফেড-আউট-প্রয়োগ)"; else bad "ই২ই: opacity=$(jf op "$A2J")"; fi
if [ "$(jf tr "$A2J")" = "true" ]; then ok "ই২ই: keynav-গেট-অটুট (data-sfs319-on-অপরিবর্তিত — কেবল-ফেড)"; else bad "ই২ই: tr=$(jf tr "$A2J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
A3=$(ev "JSON.stringify({on:window.__sfs319QA.on(),off:window.__sfs320QA.off(),arm:window.__sfs320QA.arm(),tx:window.__sfs319QA.text()})")
A3J=$(unjj "$A3")
if [ "$(jf on "$A3J")" = "false" ] && [ "$(jf off "$A3J")" = "false" ] && [ "$(jf arm "$A3J")" = "false" ] && [ -z "$(jf tx "$A3J")" ]; then ok "ই২ই: Escape → চিপ-বিলোপ + off-বিলোপ + ডিস-আর্ম (s319-সমান্তরাল)"; else bad "ই২ই: on=$(jf on "$A3J") off=$(jf off "$A3J") arm=$(jf arm "$A3J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a2'})())" >/dev/null 2>&1
agent-browser wait 100 >/dev/null 2>&1
A4=$(ev "JSON.stringify({on:window.__sfs319QA.on(),off:window.__sfs320QA.off(),fd:window.__sfs320QA.fired,tx:window.__sfs319QA.text()})")
A4J=$(unjj "$A4")
if [ "$(jf on "$A4J")" = "true" ] && [ "$(jf off "$A4J")" = "false" ]; then ok "ই২ই: পুনঃ-Show → off-রিসেট (রি-আর্ম-পথ — ১০০ms-জানালা)"; else bad "ই২ই: on=$(jf on "$A4J") off=$(jf off "$A4J")"; fi
agent-browser wait 500 >/dev/null 2>&1
A5=$(ev "JSON.stringify({off:window.__sfs320QA.off(),fd:window.__sfs320QA.fired})")
if [ "$(jf off "$(unjj "$A5")")" = "true" ] && [ "$(jf fd "$(unjj "$A5")")" = "2" ]; then ok "ই২ই: দ্বিতীয়-চক্রে পুনঃফায়ার (fired=২ — টাইমার-পুনঃপ্রারম্ভ-প্রমাণ)"; else bad "ই২ই: off=$(jf off "$(unjj "$A5")") fd=$(jf fd "$(unjj "$A5")")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();p.blur();return 'bl'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
A6=$(ev "JSON.stringify({on:window.__sfs319QA.on(),off:window.__sfs320QA.off(),arm:window.__sfs320QA.arm()})")
if [ "$(jf on "$(unjj "$A6")")" = "false" ] && [ "$(jf off "$(unjj "$A6")")" = "false" ] && [ "$(jf arm "$(unjj "$A6")")" = "false" ]; then ok "ই২ই: blur → সর্ব-বিলোপ + ডিস-আর্ম (s314-blur-চুক্তি-সমান্তরাল)"; else bad "ই২ই: blur-পরবর্তী $(unjj "$A6")"; fi
if agent-browser screenshot "$SH_FADE" >/dev/null 2>&1; then ok "স্ক্রিনশট: স্বয়ং-বিলোপ-চক্র (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr320-ই২ই (কীবোর্ড-নেভিগেশন: অ্যারো→পয়েন্টার→Enter-পুনঃকপি→পরিষ্কার) ──"
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
H0=$(ev "JSON.stringify({h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1,q:!!window.__hrAria320QA,p:window.__hrAria320QA?window.__hrAria320QA.ptr():'X',mv:window.__hrAria320QA?window.__hrAria320QA.moves:-1,cp:window.__hrAria320QA?window.__hrAria320QA.copies:-1,e:((window.__hrAria320QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf p "$H0J")" = "" ] && [ "$(jf mv "$H0J")" = "0" ] && [ "$(jf cp "$H0J")" = "0" ]; then ok "ই২ই: __hrAria320QA-হুক (ptr-শূন্য + moves/copies=০)"; else bad "ই২ই: q=$(jf q "$H0J") p=[$(jf p "$H0J")] mv=$(jf mv "$H0J")"; fi
if [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: hr320-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf e "$H0J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'n1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
N1=$(ev "JSON.stringify({mv:window.__hrAria320QA.moves,p:window.__hrAria320QA.ptr(),rows:window.__hrAria319QA.rows(),lv:window.__hrAria319QA.live()})")
if [ "$(jf mv "$(unjj "$N1")")" = "0" ] && [ "$(jf p "$(unjj "$N1")")" = "" ] && [ "$(jf rows "$(unjj "$N1")")" = "0" ]; then ok "ই২ই: শূন্য-ইতিহাসে ArrowDown-নীরব (moves=০ + পয়েন্টার-শূন্য + তালিকা-শূন্য — focusin-tip = hr317-স্বাভাবিক)"; else bad "ই২ই: শূন্য-ইতিহাসে $(unjj "$N1")"; fi
CS=$(ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap320=t;return Promise.resolve()}},configurable:true});return 'stub'})())")
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,k0:window.__hrAria317QA.hist()[0].key,k1:window.__hrAria317QA.hist()[1].key})")
C2J=$(unjj "$C2")
if [ "$(jf h "$C2J")" = "2" ]; then ok "ই২ই: দ্বি-কপি → hist=২ (s317-রেজিস্ট্রি-অটুট)"; else bad "ই২ই: h=$(jf h "$C2J")"; fi
CAP=$(jf k1 "$C2J"); CAPB=$(jf k0 "$C2J")
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'e0'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
E0=$(ev "JSON.stringify({cp:window.__hrAria320QA.copies,cc:window.__hrAria316QA.copied||'',p:window.__hrAria320QA.ptr()})")
if [ "$(jf cp "$(unjj "$E0")")" = "0" ] && [ "$(jf p "$(unjj "$E0")")" = "" ]; then ok "ই২ই: পয়েন্টার-শূন্যে Enter-নীরব (copies=০ — নেটিভ-পথ-অস্পৃশ্য-চুক্তি)"; else bad "ই২ই: পয়েন্টার-শূন্যে $(unjj "$E0")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
D1=$(ev "JSON.stringify({p:window.__hrAria320QA.ptr(),mv:window.__hrAria320QA.moves,tip:window.__hrAria317QA.tip(),pc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr320-ptr').length,rc:document.querySelectorAll('.hr317-tip.is-on .hr318-row').length})")
D1J=$(unjj "$D1")
if [ "$(jf p "$D1J")" = "$CAPB" ] && [ "$(jf mv "$D1J")" = "1" ]; then ok "ই২ই: ArrowDown-১ → পয়েন্টার=hist[০] [$CAPB] (moves=১)"; else bad "ই২ই: p=[$(jf p "$D1J")] mv=$(jf mv "$D1J")"; fi
if [ "$(jf tip "$D1J")" = "true" ] && [ "$(jf pc "$D1J")" = "1" ] && [ "$(jf rc "$D1J")" = "2" ]; then ok "ই২ই: টুলটিপ-খোলা + .hr320-ptr ×১ (২-সারি-তালিকায়)"; else bad "ই২ই: tip=$(jf tip "$D1J") pc=$(jf pc "$D1J") rc=$(jf rc "$D1J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'd2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
D2=$(ev "JSON.stringify({p:window.__hrAria320QA.ptr(),mv:window.__hrAria320QA.moves,pc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr320-ptr').length})")
if [ "$(jf p "$(unjj "$D2")")" = "$CAP" ] && [ "$(jf mv "$(unjj "$D2")")" = "2" ] && [ "$(jf pc "$(unjj "$D2")")" = "1" ]; then ok "ই২ই: ArrowDown-২ → পয়েন্টার=hist[১] [$CAP] (চিহ্ন-স্থানান্তরিত)"; else bad "ই২ই: p=[$(jf p "$(unjj "$D2")")] mv=$(jf mv "$(unjj "$D2")")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return 'u2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
U2=$(ev "JSON.stringify({p:window.__hrAria320QA.ptr(),mv:window.__hrAria320QA.moves,pc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr320-ptr').length})")
U2J=$(unjj "$U2")
if [ "$(jf p "$U2J")" = "$CAPB" ] && [ "$(jf mv "$U2J")" = "5" ] && [ "$(jf pc "$U2J")" = "1" ]; then ok "ই২ই: ArrowUp ×৩ → পয়েন্টার-clamp hist[০]-এ (moves=৫, চিহ্ন-একক)"; else bad "ই২ই: p=[$(jf p "$U2J")] mv=$(jf mv "$U2J") pc=$(jf pc "$U2J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'dn'})())" >/dev/null 2>&1
agent-browser wait 200 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'dn2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
DN=$(ev "JSON.stringify({p:window.__hrAria320QA.ptr(),mv:window.__hrAria320QA.moves})")
if [ "$(jf p "$(unjj "$DN")")" = "$CAP" ] && [ "$(jf mv "$(unjj "$DN")")" = "7" ]; then ok "ই২ই: ArrowDown-শেষে-clamp (hist[১]-এ আটকে — বাউন্ড-প্রমাণ)"; else bad "ই২ই: p=[$(jf p "$(unjj "$DN")")] mv=$(jf mv "$(unjj "$DN")")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return 'bk'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
EV=$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return 'en'})())")
agent-browser wait 550 >/dev/null 2>&1
EN=$(ev "JSON.stringify({rc:window.__hrAria319QA.recopies,lk:window.__hrAria319QA.lastKey,cp:window.__hrAria320QA.copies,cc:window.__hrAria316QA.copied||'',cap:window.__clipCap320||'',h0k:window.__hrAria317QA.hist()[0].key,h0n:window.__hrAria317QA.hist()[0].n,p:window.__hrAria320QA.ptr(),pc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr320-ptr').length,e:window.__hrAria320QA.err})")
ENJ=$(unjj "$EN")
if [ "$(jf rc "$ENJ")" = "1" ] && [ "$(jf lk "$ENJ")" = "$CAPB" ]; then ok "ই২ই: Enter → পয়েন্টার-কী-পুনঃকপি (recopies=১, lastKey=[$CAPB])"; else bad "ই২ই: rc=$(jf rc "$ENJ") lk=[$(jf lk "$ENJ")]"; fi
if [ "$(jf cp "$ENJ")" = "1" ] && [ "$(jf cc "$ENJ")" = "$CAPB" ] && [ "$(jf cap "$ENJ")" = "$CAPB" ]; then ok "ই২ই: এক-উৎস-কপি-পথ-প্রমাণ (copies=১, copied==ক্যাপচার==পয়েন্টার-কী)"; else bad "ই২ই: cp=$(jf cp "$ENJ") cc=[$(jf cc "$ENJ")] cap=[$(jf cap "$ENJ")]"; fi
if [ "$(jf h0k "$ENJ")" = "$CAPB" ] && [ "$(jf h0n "$ENJ")" = "2" ]; then ok "ই২ই: রেকর্ড-হালনাগাদ (hist[০]=পয়েন্টার-কী, n=২ — unshift-রীতি)"; else bad "ই২ই: h0k=[$(jf h0k "$ENJ")] h0n=$(jf h0n "$ENJ")"; fi
if [ "$(jf p "$ENJ")" = "$CAPB" ] && [ "$(jf pc "$ENJ")" = "1" ]; then ok "ই২ই: পয়েন্টার-অনুসরণ (কপি-কৃত-কী hist[০]-এ — ptrSync-পুনঃপ্রয়োগ ×১)"; else bad "ই২ই: p=[$(jf p "$ENJ")] pc=$(jf pc "$ENJ")"; fi
if [ "$(jf e "$ENJ")" = "" ]; then ok "ই২ই: Enter-পরবর্তী-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf e "$ENJ")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));return 'g1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
G1=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),p:window.__hrAria320QA.ptr()})")
if [ "$(jf tip "$(unjj "$G1")")" = "false" ] && [ "$(jf p "$(unjj "$G1")")" = "" ]; then ok "ই২ই: mouseout-বিলোপ → পয়েন্টার-পরিষ্কার (tipHide317-মোড়ক-পথ)"; else bad "ই২ই: tip=$(jf tip "$(unjj "$G1")") p=[$(jf p "$(unjj "$G1")")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'r1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'r2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
R2=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),p:window.__hrAria320QA.ptr()})")
if [ "$(jf tip "$(unjj "$R2")")" = "false" ] && [ "$(jf p "$(unjj "$R2")")" = "" ]; then ok "ই২ই: Escape → টুলটিপ-বিলোপ + পয়েন্টার-পরিষ্কার"; else bad "ই২ই: Escape-পরবর্তী $(unjj "$R2")"; fi
if agent-browser screenshot "$SH_KBD" >/dev/null 2>&1; then ok "স্ক্রিনশট: কীবোর্ড-নেভিগেশন (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + চিপ-মোবাইল-গেট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,nc:document.querySelectorAll('.sfs319-namechip').length,e320:(window.__sfs320QA||{}).err||'',e319:(window.__sfs319QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf nc "$MJ")" = "1" ]; then ok "মোবাইলে নাম-চিপ-মার্কআপ ×১"; else bad "মোবাইলে চিপ=$(jf nc "$MJ")"; fi
if [ "$(jf e320 "$MJ")" = "" ] && [ "$(jf e319 "$MJ")" = "" ]; then ok "মোবাইলে s319/s320-ইঞ্জিন-অটুট"; else bad "মোবাইলে ইঞ্জিন-অমিল"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "window.__sfs320Cfg.ms = 300; 'inj'" >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
M2=$(ev "JSON.stringify({on:window.__sfs319QA.on(),tx:window.__sfs319QA.text(),v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf on "$M2J")" = "true" ] && [ "$(jf v "$M2J")" = "visible" ]; then ok "মোবাইলে চিপ-সক্রিয় (computed-দৃশ্যমান — ফেড-পূর্ব)"; else bad "মোবাইলে $(unjj "$M2")"; fi
agent-browser wait 500 >/dev/null 2>&1
M3=$(ev "JSON.stringify({off:window.__sfs320QA.off(),op:getComputedStyle(document.querySelector('.sfs319-namechip')).opacity})")
if [ "$(jf off "$(unjj "$M3")")" = "true" ] && [ "$(jf op "$(unjj "$M3")")" = "0" ]; then ok "মোবাইলে স্বয়ং-বিলোপ-প্রয়োগ (off + opacity-০)"; else bad "মোবাইলে $(unjj "$M3")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৬: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
bopen "$BASE/" || bad "হোম-পুনঃopen-ব্যর্থ"
agent-browser wait 1800 >/dev/null 2>&1
E=$(agent-browser errors 2>/dev/null | grep -v 'ep-reader fallback' | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড — নথিভুক্ত-ep-reader-ফলব্যাক-বহির্ভূত)"; else bad "কনসোল-ত্রুটি: $E"; fi
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s320-suite ✓ সর্ব-সবুজ"; else echo "s320-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
