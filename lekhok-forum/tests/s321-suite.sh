#!/bin/bash
# s321-suite.sh — session321: sfs321 টাচ-পথ-নাম-প্রকাশ + hr321 ইতিহাস-স্থায়ীকরণ
# [Task ID 158] PLANS session320-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs321 (feed.ejs) — গ্রুপ-লেবেল-ট্যাপে নাম-চিপ-এক-প্রদর্শন: টাচ-ব্যবহারকারী keynav-বহির্ভূত
#      (phone-অ্যাংকর-ট্যাপ নয় — s306-একক-লিঙ্ক-চুক্তি; glabel সারি-বহির্ভূত — s312-সংঘর্ষ-শূন্য);
#      sfs320-সময়-বিলোপ-পথ-পুনঃব্যবহার (__sfs319Show-মোড়ক-পথ → রি-আর্ম → off-ফেড);
#      keynav-সক্রিয়ে tap = keynav-সমতুল্য-পুনঃপ্রদর্শন (tap-গেট-অনাবশ্যক); keynav-নিষ্ক্রিয়ে
#      phone[data-sfs321-tap] → tap-CSS-দ্বার (keynav-দ্বার-সমান্তরাল) + 4.8s-গেট-পরিষ্কার;
#      __sfs321QA {taps, on(), gate(), text(), err}
#   ③ hr321 (admin/home-reorder.ejs) — ইতিহাস-স্থায়ীকরণ: sessionStorage 'hr321-hist' —
#      বুটে সংবেদনশীল-লোড (key:string/at:number/n:number≥১ — ১২-সীমা) → hist317-পূর্ব-সজ্জিত;
#      __hrAria317Record-পুনঃমোড়ক (s320-চেইনের পরে) → সংরক্ষণ + কপি-কৃত-কী restored-বিলোপ;
#      tipRender318-মোড়ক → restored-সারি .hr321-restored (সময়-ইটালিক); কোটা-ব্যর্থতায়
#      নীরব-অবনমন; __hrAria321QA {stored(), loadable(), restored, err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব (defineProperty — s316) + হেক্স-শূন্য +
#         নেট-শূন্য-পরিষ্কারক + arm-window (১০০ms — s320-চুক্তি) + bopen-reload = একই-ট্যাব
#         (sessionStorage-স্থায়িত্ব-পথ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_TAP=/home/z/my-project/download/s321-tapname-desk.png
SH_PER=/home/z/my-project/download/s321-persist-admin.png
SH_MOB=/home/z/my-project/download/s321-tapname-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s321-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s321-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'var tapShow321' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: tapShow321-পথ (লেবেল-ট্যাপ-হ্যান্ডলার)" || bad "feed.ejs: tap-পথ-অমিল"
grep -q "phone321.setAttribute('data-sfs321-tap', '1')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: tap-গেট-সেট (keynav-নিষ্ক্রিয়ে-ই)" || bad "feed.ejs: গেট-সেট-অমিল"
grep -q "phone321.hasAttribute('data-sfs314-focus')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: keynav-সক্রিয়ে tap-গেট-বাদ (দ্বি-গেট-সংঘর্ষ-নিষিদ্ধ)" || bad "feed.ejs: keynav-গেট-অমিল"
grep -q '}, 4800);' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: 4.8s-গেট-পরিষ্কার (ফেড-পূর্ণ-পরবর্তী)" || bad "feed.ejs: গেট-পরিষ্কার-অমিল"
grep -q 'e321.preventDefault();' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: glabel-ট্যাপে preventDefault (phone-অ্যাংকর-বংশধর-নেভিগেশন-বিলোপ — s312-রীতি)" || bad "feed.ejs: preventDefault-অমিল"
grep -q 'window.__sfs321QA = q321' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs321QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q "phone321.closest('.sfs312-tap')" "$APP/views/partials/home/feed.ejs" && bad "feed.ejs: s312-সংঘর্ষ (tap-লেবেল-সারি-বহির্ভূত-হওয়ায়)" || ok "feed.ejs: s312-.sfs312-tap-সংঘর্ষ-শূন্য (glabel-সারি-বহির্ভূত)"
grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs319-namechip\[data-sfs319-on\]' "$APP/public/assets/css/style.css" && ok "style.css: tap-দ্বার (keynav-দ্বার-সমান্তরাল)" || bad "style.css: tap-দ্বার-অমিল"
grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs319-namechip\[data-sfs319-on\]\[data-sfs320-off\]' "$APP/public/assets/css/style.css" && ok "style.css: tap-গেটের off-ওভাররাইড (s320-ফেড-সহাবস্থান — টাচ-পথ)" || bad "style.css: tap-off-ওভাররাইড-অনুপস্থিত"
CSS321=$(sed -n '/session321 (sfs321 টাচ-পথ-নাম-প্রকাশ)/,/EOF session321/p' "$APP/public/assets/css/style.css")
printf '%s' "$CSS321" | grep -q 'prefers-reduced-motion' && ok "style.css: session321-ব্লকে reduced-motion" || bad "style.css: reduced-motion-অনুপস্থিত"
HEXN=$(printf '%s' "$CSS321" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session321-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
grep -q "var HR321_KEY = 'hr321-hist'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: sessionStorage-কী (hr321-hist)" || bad "home-reorder.ejs: কী-অমিল"
grep -q 'var load321' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'Array.isArray(arr321)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: সংবেদনশীল-লোড (টাইপ-যাচাই + Array-গেট)" || bad "home-reorder.ejs: লোড-যাচাই-অমিল"
grep -q 'var save321' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'hist317.slice(0, 12)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: সংরক্ষণ (১২-সীমা-অটুট)" || bad "home-reorder.ejs: সংরক্ষণ-অমিল"
grep -q 'e321e.restored = false' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: কপি-কৃত-কী restored-বিলোপ (সতেজ-রেকর্ড)" || bad "home-reorder.ejs: restored-বিলোপ-অমিল"
grep -q 'var trOrig321 = tipRender318' "$APP/admin/views/admin/home-reorder.ejs" && grep -q "classList.toggle('hr321-restored'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: tipRender318-মোড়ক (পুনঃনির্মাণ-পরবর্তী restored-চিহ্ন — toggle-দ্বি-পথ)" || bad "home-reorder.ejs: মোড়ক-অমিল"
grep -q '.hr318-row.hr321-restored .hr318-t { font-style:italic; }' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr321-restored-স্টাইল (সময়-ইটালিক)" || bad "home-reorder.ejs: restored-স্টাইল-অমিল"
grep -q 'var applyRestored321' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'applyRestored321();' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: applyRestored321-সিঙ্ক (রেকর্ড-রিফ্রেশ-পুনঃনির্মাণ-পরবর্তী চিহ্ন-পুনঃপ্রয়োগ)" || bad "home-reorder.ejs: restored-সিঙ্ক-অমিল"
grep -q 'window.__hrAria321QA = q321b' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria321QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S321CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session321.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S321CHK" = "OK" ]; then ok "feed.ejs: session321-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A321CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria321QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A321CHK" = "OK" ]; then ok "home-reorder.ejs: hr321-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১-অটুট (s319-সহাবস্থান)"; else bad "SSR: নাম-চিপ ×$NC"; fi
if printf '%s' "$SS0" | grep -q '__sfs321QA'; then ok "SSR: s321-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s321-ইঞ্জিন-অনুপস্থিত"; fi
S320H=$(printf '%s' "$SS0" | grep -o '__sfs320QA' | wc -l | tr -d ' ')
if [ "$S320H" -ge 1 ]; then ok "SSR: __sfs320QA-হুক-অটুট (s320-সহাবস্থান)"; else bad "SSR: s320-হুক-অনুপস্থিত"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট — tap-পথ-লিঙ্ক-অস্পৃশ্য)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs321-ই২ই (টাচ-নাম-প্রকাশ: ট্যাপ→গেট→প্রদর্শন→s320-ফেড→গেট-পরিষ্কার→keynav-সহাবস্থান) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs321QA,tp:window.__sfs321QA?window.__sfs321QA.taps:-1,g:window.__sfs321QA?window.__sfs321QA.gate():null,on:window.__sfs321QA?window.__sfs321QA.on():null,err:(window.__sfs321QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf tp "$Q0J")" = "0" ]; then ok "ই২ই: __sfs321QA-হুক + প্রারম্ভিক taps=০"; else bad "ই২ই: q=$(jf q "$Q0J") tp=$(jf tp "$Q0J")"; fi
if [ "$(jf g "$Q0J")" = "false" ] && [ "$(jf on "$Q0J")" = "false" ]; then ok "ই২ই: প্রারম্ভিক-অবস্থা — গেট-বন্ধ + চিপ-নিষ্ক্রিয়"; else bad "ই২ই: g=$(jf g "$Q0J") on=$(jf on "$Q0J")"; fi
if [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$Q0J")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim(),l1:String(ls[1].textContent).replace(/\\s+/g,' ').trim()}})())")
LBJ=$(unjj "$LB"); L0=$(jf l0 "$LBJ"); L1=$(jf l1 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] [$L1])"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "window.__sfs320Cfg.ms = 250; 'inj'" >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T1=$(ev "JSON.stringify({on:window.__sfs321QA.on(),tx:window.__sfs321QA.text(),g:window.__sfs321QA.gate(),tp:window.__sfs321QA.taps,v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
T1J=$(unjj "$T1")
if [ "$(jf on "$T1J")" = "true" ] && [ "$(jf tx "$T1J")" = "$L0" ] && [ "$(jf tp "$T1J")" = "1" ]; then ok "ই২ই: ট্যাপ-১ → চিপ-প্রদর্শন ([$L0], taps=১ — s319-উৎস-সত্য-পুনঃব্যবহার)"; else bad "ই২ই: on=$(jf on "$T1J") tx=[$(jf tx "$T1J")] tp=$(jf tp "$T1J")"; fi
if [ "$(jf g "$T1J")" = "true" ] && [ "$(jf v "$T1J")" = "visible" ]; then ok "ই২ই: tap-CSS-দ্বার-খোলা (computed-দৃশ্যমান — keynav-বহির্ভূত)"; else bad "ই২ই: g=$(jf g "$T1J") v=$(jf v "$T1J")"; fi
agent-browser wait 700 >/dev/null 2>&1
T2=$(ev "JSON.stringify({off:window.__sfs320QA.off(),fd:window.__sfs320QA.fired,op:getComputedStyle(document.querySelector('.sfs319-namechip')).opacity})")
if [ "$(jf off "$(unjj "$T2")")" = "true" ] && [ "$(jf fd "$(unjj "$T2")")" = "1" ] && [ "$(jf op "$(unjj "$T2")")" = "0" ]; then ok "ই২ই: s320-সময়-বিলোপ-পথ-পুনঃব্যবহৃত (২৫০ms-ফায়ার → computed-ফেড)"; else bad "ই২ই: off=$(jf off "$(unjj "$T2")") fd=$(jf fd "$(unjj "$T2")") op=$(jf op "$(unjj "$T2")")"; fi
agent-browser wait 4600 >/dev/null 2>&1
T3=$(ev "JSON.stringify({g:window.__sfs321QA.gate(),on:window.__sfs321QA.on()})")
if [ "$(jf g "$(unjj "$T3")")" = "false" ]; then ok "ই২ই: 4.8s-পরবর্তী tap-গেট-পরিষ্কার (ফেড-পূর্ণ-পরবর্তী)"; else bad "ই২ই: g=$(jf g "$(unjj "$T3")") (গেট-অবশিষ্ট)"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
K1=$(ev "JSON.stringify({kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),tx:window.__sfs319QA.text()})")
if [ "$(jf kf "$(unjj "$K1")")" = "true" ]; then ok "ই২ই: keynav-সক্রিয় (data-sfs314-focus — সহাবস্থান-পূর্বশর্ত)"; else bad "ই২ই: kf=$(jf kf "$(unjj "$K1")")"; fi
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T4=$(ev "JSON.stringify({tx:window.__sfs321QA.text(),tp:window.__sfs321QA.taps,g:window.__sfs321QA.gate(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T4J=$(unjj "$T4")
if [ "$(jf tx "$T4J")" = "$L1" ] && [ "$(jf tp "$T4J")" = "2" ] && [ "$(jf g "$T4J")" = "false" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপ = keynav-সমতুল্য-পুনঃপ্রদর্শন ([$L1], tap-গেট-অনাবশ্যক — দ্বি-গেট-সংঘর্ষ-শূন্য)"; else bad "ই২ই: tx=[$(jf tx "$T4J")] tp=$(jf tp "$T4J") g=$(jf g "$T4J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
E1=$(ev "JSON.stringify({on:window.__sfs319QA.on(),g:window.__sfs321QA.gate()})")
if [ "$(jf on "$(unjj "$E1")")" = "false" ]; then ok "ই২ই: Escape → চিপ-বিলোপ (s314-সমান্তরাল-অটুট)"; else bad "ই২ই: on=$(jf on "$(unjj "$E1")")"; fi
if agent-browser screenshot "$SH_TAP" >/dev/null 2>&1; then ok "স্ক্রিনশট: টাচ-নাম-প্রকাশ (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr321-ই২ই (স্থায়ীকরণ: সংরক্ষণ→পুনঃলোড-পুনরুদ্ধার→restored-চিহ্ন→সতেজ-কপি-বিলোপ) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({q:!!window.__hrAria321QA,h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1,r:window.__hrAria321QA?window.__hrAria321QA.restored:-1,s:window.__hrAria321QA?window.__hrAria321QA.stored():null,e:((window.__hrAria321QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf h "$H0J")" = "0" ] && [ "$(jf r "$H0J")" = "0" ]; then ok "ই২ই: __hrAria321QA-হুক + পরিষ্কার-ইতিহাস (restored=০)"; else bad "ই২ই: q=$(jf q "$H0J") h=$(jf h "$H0J") r=$(jf r "$H0J")"; fi
if [ "$(jf s "$H0J")" = "false" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: স্টোর-শূন্য + ত্রুটি-শূন্য (পরিষ্কার-বেসলাইন)"; else bad "ই২ই: s=$(jf s "$H0J") e=[$(jf e "$H0J")]"; fi
CS=$(ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap321=t;return Promise.resolve()}},configurable:true});return 'stub'})())")
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,k0:window.__hrAria317QA.hist()[0].key,k1:window.__hrAria317QA.hist()[1].key,s:window.__hrAria321QA.stored(),raw:JSON.parse(sessionStorage.getItem('hr321-hist')).length,e:window.__hrAria321QA.err})")
C2J=$(unjj "$C2")
CAP=$(jf k0 "$C2J"); CAPB=$(jf k1 "$C2J")
if [ "$(jf h "$C2J")" = "2" ] && [ "$(jf s "$C2J")" = "true" ] && [ "$(jf raw "$C2J")" = "2" ]; then ok "ই২ই: দ্বি-কপি → hist=২ + স্বয়ংক্রিয়-সংরক্ষণ (raw-অ্যারে ×২)"; else bad "ই২ই: h=$(jf h "$C2J") s=$(jf s "$C2J") raw=$(jf raw "$C2J")"; fi
if [ "$(jf e "$C2J")" = "" ]; then ok "ই২ই: সংরক্ষণ-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf e "$C2J")"; fi
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())") >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
CS2=$(ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap321=t;return Promise.resolve()}},configurable:true});return 'stub2'})())") >/dev/null 2>&1
R1=$(ev "JSON.stringify({r:window.__hrAria321QA.restored,h:window.__hrAria317QA.hist().length,k0:window.__hrAria317QA.hist()[0].key,e:window.__hrAria321QA.err})")
R1J=$(unjj "$R1")
if [ "$(jf r "$R1J")" = "2" ] && [ "$(jf h "$R1J")" = "2" ] && [ "$(jf k0 "$R1J")" = "$CAP" ]; then ok "ই২ই: পুনঃলোডে পুনরুদ্ধার (restored=২, hist[০]=[$CAP] — ট্যাব-সেশন-স্থায়িত্ব)"; else bad "ই২ই: r=$(jf r "$R1J") h=$(jf h "$R1J") k0=[$(jf k0 "$R1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T5=$(ev "JSON.stringify({rows:window.__hrAria319QA.rows(),rc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr321-restored').length})")
if [ "$(jf rows "$(unjj "$T5")")" = "2" ] && [ "$(jf rc "$(unjj "$T5")")" = "2" ]; then ok "ই২ই: পুনরুদ্ধার-তালিকায় restored-চিহ্ন ×২ (hr321-স্টাইল-পথ)"; else bad "ই২ই: rows=$(jf rows "$(unjj "$T5")") rc=$(jf rc "$(unjj "$T5")")"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
C3=$(ev "JSON.stringify({r1:window.__hrAria321QA.restored,rc:document.querySelectorAll('.hr317-tip.is-on .hr318-row.hr321-restored').length,k0:window.__hrAria317QA.hist()[0].key,n0:window.__hrAria317QA.hist()[0].n,s:window.__hrAria321QA.stored(),e:window.__hrAria321QA.err})")
C3J=$(unjj "$C3")
if [ "$(jf k0 "$C3J")" = "$CAPB" ] && [ "$(jf n0 "$C3J")" = "2" ]; then ok "ই২ই: সতেজ-কপি → hist[০]-হালনাগাদ ([$CAPB] n=২ — unshift-রীতি-অটুট)"; else bad "ই২ই: k0=[$(jf k0 "$C3J")] প্রত্যাশা [$CAPB] n0=$(jf n0 "$C3J")"; fi
if [ "$(jf rc "$C3J")" = "1" ]; then ok "ই২ই: কপি-কৃত-কী restored-বিলোপ (চিহ্ন ×১-অবশিষ্ট — সতেজ-রেকর্ড)"; else bad "ই২ই: rc=$(jf rc "$C3J")"; fi
if [ "$(jf s "$C3J")" = "true" ] && [ "$(jf e "$C3J")" = "" ]; then ok "ই২ই: হালনাগাদ-সংরক্ষণ + ত্রুটি-শূন্য"; else bad "ই২ই: s=$(jf s "$C3J") e=[$(jf e "$C3J")]"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if agent-browser screenshot "$SH_PER" >/dev/null 2>&1; then ok "স্ক্রিনশট: স্থায়ীকৃত-ইতিহাস (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-গেট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,nc:document.querySelectorAll('.sfs319-namechip').length,e321:(window.__sfs321QA||{}).err||'',tp:window.__sfs321QA?window.__sfs321QA.taps:-1})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf nc "$MJ")" = "1" ]; then ok "মোবাইলে নাম-চিপ-মার্কআপ ×১"; else bad "মোবাইলে চিপ=$(jf nc "$MJ")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "window.__sfs320Cfg.ms = 4000; 'rst'" >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
M2=$(ev "JSON.stringify({on:window.__sfs321QA.on(),g:window.__sfs321QA.gate(),tx:window.__sfs321QA.text(),v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf on "$M2J")" = "true" ] && [ "$(jf g "$M2J")" = "true" ] && [ "$(jf v "$M2J")" = "visible" ]; then ok "মোবাইলে ট্যাপ-প্রদর্শন (গেট-খোলা + computed-দৃশ্যমান — keynav-বহির্ভূত টাচ-পথ)"; else bad "মোবাইলে $(unjj "$M2")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s321-suite ✓ সর্ব-সবুজ"; else echo "s321-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
