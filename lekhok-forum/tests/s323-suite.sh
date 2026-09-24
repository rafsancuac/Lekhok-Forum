#!/bin/bash
# s323-suite.sh — session323: sfs323 ট্যাপ-লেবেল-হাইলাইট parity + hr323 ইতিহাস-কীবোর্ড-পরিষ্কার-সমতা
# [Task ID 160] PLANS session322-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs323 (feed.ejs) — ট্যাপ-পথের লেবেল-হাইলাইট parity: keynav-.sfs314-gfocus-এর ট্যাপ-সমকক্ষ
#      data-sfs323-on (gfocus-রেসিপি-মিরর — geometry-স্পর্শ-নিষিদ্ধ); জীবনচক্র = সক্রিয়-পথ-অনুসরণ —
#      keynav-সক্রিয়ে হস্তান্তর + গেট-সমাপ্তিে বিলোপ (MutationObserver — s322-MO-সমান্তরাল);
#      রিং-হস্তান্তর (keynav-সক্রিয়ে ফ্রেম-রিং ৪৬%→৭০% — focus-ring-মান-সমতা);
#      __sfs323QA {set, on(), count(), err}
#   ③ hr323 (admin/home-reorder.ejs) — ইতিহাস-কীবোর্ড-পরিষ্কার-সমতা: Delete ×২ (Backspace-সমতুল্য)
#      = sum-দ্বি-ক্লিকের কীবোর্ড-সমকক্ষ — এক-Delete = নিরামড (৩s + টোস্ট + .hr323-armed) —
#      দ্বি-Delete = clearHist323 (এক-উৎস — hr322-dblclick-ডেলিগেট — উভয়-পথ-একই-গণনা);
#      Escape/৩s = নিরামড; __hrAria323QA {armed, cleared, arm(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব (defineProperty — s316) + হেক্স-শূন্য +
#         নেট-শূন্য-পরিষ্কারক + translate-transition-পরবর্তী-মাপ (≥৪০০ms) + MO-microtask-পোল +
#         সুইট-রান = রিপো-রুট-cwd (s319-চুক্তি) + outline-color-দ্বি-মাপ (৪৬%↔৭০% পার্থক্য-প্রমাণ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_LBL=/home/z/my-project/download/s323-label-parity-desk.png
SH_KBD=/home/z/my-project/download/s323-kbd-clear-admin.png
SH_MOB=/home/z/my-project/download/s323-label-parity-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s323-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s323-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs319Show = function (l323, i323b, n323)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show-পুনঃমোড়ক (s320→s322-চেইন-পরবর্তী — মোড়ক-স্তর-নীতি)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "l323.setAttribute('data-sfs323-on', '1')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: ট্যাপ-লেবেল-হাইলাইট-সেট (উৎস-সত্য = ট্যাপ-কৃত-লেবেল — স্টেট-ডুপ-শূন্য)" || bad "feed.ejs: হাইলাইট-সেট-অমিল"
grep -q 'var clearAll323 = function' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: এক-সক্রিয়-চুক্তি (clearAll-পূর্বে)" || bad "feed.ejs: clearAll-অমিল"
grep -q 'var keep323 = phone323.hasAttribute' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: জীবনচক্র-MO (কেবল tap-গেট × keynav-নিষ্ক্রিয়ে টিকে)" || bad "feed.ejs: MO-অমিল"
grep -q 'window.__sfs323QA = q323' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs323QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q '.sfs292-glabel\[data-sfs323-on\]' "$APP/public/assets/css/style.css" && ok "style.css: লেবেল-হাইলাইট-মিরর (gfocus-রেসিপি — ১৪%-টিন্ট + inset-রিং)" || bad "style.css: মিরর-অমিল"
grep -q '.sfs292-phone\[data-sfs314-focus\]\[data-sfs321-tap\] .sfs292-frame' "$APP/public/assets/css/style.css" && ok "style.css: রিং-হস্তান্তর (keynav-সক্রিয়ে ৪৬%→৭০% — focus-ring-মান-সমতা)" || bad "style.css: রিং-হস্তান্তর-অমিল"
CSS323=$(sed -n '/session323 (sfs323 ট্যাপ-লেবেল-হাইলাইট parity)/,/EOF session323/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS323" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session323-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS323" | grep -q '@media (max-width: 640px)' && ok "style.css: 640px-রিং-ভ্যারিয়েন্ট (gfocus-সমান্তরাল)" || bad "style.css: 640px-অনুপস্থিত"
grep -q 'var clearHist323 = function' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: clearHist323 এক-উৎস (dblclick + Delete ×২ — পরিষ্কার-পথ-ডুপ-শূন্য)" || bad "home-reorder.ejs: clearHist323-অমিল"
grep -q "clearHist323(); /\* s323: এক-উৎস-পরিষ্কার" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr322-dblclick-ডেলিগেশন (রিফ্যাক্টর — ইনলাইন-পরিষ্কার-বিলোপ)" || bad "home-reorder.ejs: ডেলিগেশন-অমিল"
grep -q "e323c.key !== 'Delete' && e323c.key !== 'Backspace'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Delete/Backspace-দ্বি-কী (Mac-সমতা)" || bad "home-reorder.ejs: কী-অমিল"
grep -q "if (armed323) disarm323" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Escape-নিরামড (স্বয়ং-নিরামড ৩s-সহ)" || bad "home-reorder.ejs: নিরামড-অমিল"
grep -q "q322c.cleared += 1; /\* s322-QA-গণনা" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: q322c-গণনা-অটুট (উভয়-পথ-একই-গণনা — s322-suite-চুক্তি)" || bad "home-reorder.ejs: গণনা-অমিল"
grep -q "showToast(true, 'আবার Delete চাপুন" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: নিরামড-টোস্ট-সংকেত (দ্বি-ধাপ-আবিষ্কার্যতা)" || bad "home-reorder.ejs: টোস্ট-অমিল"
grep -q 'window.__hrAria323QA = q323h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria323QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q '.hr317-tip.hr323-armed .hr318-sum' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr323-armed-স্টাইল (ধ্বংসাত্মক-প্রস্তুতি-সংকেত)" || bad "home-reorder.ejs: স্টাইল-অমিল"
S323CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session323.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S323CHK" = "OK" ]; then ok "feed.ejs: session323-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A323CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria323QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A323CHK" = "OK" ]; then ok "home-reorder.ejs: hr323-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs323QA'; then ok "SSR: s323-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s323-ইঞ্জিন-অনুপস্থিত"; fi
S322H=$(printf '%s' "$SS0" | grep -o '__sfs322QA' | wc -l | tr -d ' ')
if [ "$S322H" -ge 1 ]; then ok "SSR: __sfs322QA-হুক-অটুট (s322-সহাবস্থান)"; else bad "SSR: s322-হুক-অনুপস্থিত"; fi
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১-অটুট (s319-সহাবস্থান)"; else bad "SSR: নাম-চিপ ×$NC"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট — হাইলাইট-অ্যাট্রিবিউট-নাম-অপরিবর্তিত)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs323-ই২ই (ট্যাপ-হাইলাইট→হস্তান্তর→গেট-সমাপ্তি-বিলোপ→রিং-গভীরতা-পরিবর্তন) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs323QA,st:window.__sfs323QA?window.__sfs323QA.set:-1,c:window.__sfs323QA?window.__sfs323QA.count():-1,e:(window.__sfs323QA||{}).err||'',tp:(window.__sfs322QA||{}).taps})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf st "$Q0J")" = "0" ] && [ "$(jf c "$Q0J")" = "0" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs323QA-হুক + প্রারম্ভিক set=০/count=০/ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim(),l1:String(ls[1].textContent).replace(/\\s+/g,' ').trim()}})())")
LBJ=$(unjj "$LB"); L0=$(jf l0 "$LBJ"); L1=$(jf l1 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] [$L1])"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(ev "JSON.stringify({c:window.__sfs323QA.count(),on:window.__sfs323QA.on(),st:window.__sfs323QA.set,tp:window.__sfs322QA.taps,g:window.__sfs322QA.gate(),a0:document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0].hasAttribute('data-sfs323-on'),a1:document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1].hasAttribute('data-sfs323-on'),oc:getComputedStyle(document.querySelector('.sfs292-frame')).outlineColor})")
T1J=$(unjj "$T1")
if [ "$(jf c "$T1J")" = "1" ] && [ "$(jf on "$T1J")" = "true" ] && [ "$(jf a0 "$T1J")" = "true" ] && [ "$(jf a1 "$T1J")" = "false" ]; then ok "ই২ই: ট্যাপ-১ → লেবেল-০-হাইলাইট (count=১ + গেট-সহাবস্থান)"; else bad "ই২ই: $(unjj "$T1")"; fi
if [ "$(jf tp "$T1J")" = "1" ] && [ "$(jf g "$T1J")" = "true" ]; then ok "ই২ই: s322-চেইন-অটুট (taps=১ + গেট — মোড়ক-স্তরে-অস্পৃশ্য)"; else bad "ই২ই: tp=$(jf tp "$T1J") g=$(jf g "$T1J")"; fi
OC2=$(jf oc "$T1J")
if printf '%s' "$OC2" | grep -q "/ 0.46"; then ok "ই২ই: ট্যাপ-একক্ষেত্রে রিং-৪৬% (computed-color-mix-মান-প্রমাণ)"; else bad "ই২ই: OC2=[$OC2] (৪৬%-অমিল)"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T2=$(ev "JSON.stringify({c:window.__sfs323QA.count(),st:window.__sfs323QA.set,a0:document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0].hasAttribute('data-sfs323-on'),a1:document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1].hasAttribute('data-sfs323-on')})")
T2J=$(unjj "$T2")
if [ "$(jf c "$T2J")" = "1" ] && [ "$(jf st "$T2J")" = "2" ] && [ "$(jf a0 "$T2J")" = "false" ] && [ "$(jf a1 "$T2J")" = "true" ]; then ok "ই২ই: ট্যাপ-২ → হাইলাইট-স্থানান্তর (এক-সক্রিয়-চুক্তি — লেবেল-০-বিলোপ + লেবেল-১-সেট)"; else bad "ই২ই: $(unjj "$T2")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T3=$(ev "JSON.stringify({c:window.__sfs323QA.count(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),gf:document.querySelectorAll('.sfs292-glabel.sfs314-gfocus').length,oc:getComputedStyle(document.querySelector('.sfs292-frame')).outlineColor})")
T3J=$(unjj "$T3")
if [ "$(jf c "$T3J")" = "0" ] && [ "$(jf kf "$T3J")" = "true" ] && [ "$(jf gf "$T3J")" -ge 1 ] 2>/dev/null; then ok "ই২ই: keynav-হস্তান্তর (ট্যাপ-হাইলাইট-বিলোপ → gfocus-একক — দ্বি-হাইলাইট-শূন্য)"; else bad "ই২ই: $(unjj "$T3")"; fi
OC3=$(jf oc "$T3J")
if [ -n "$OC2" ] && [ "$OC3" != "$OC2" ]; then ok "ই২ই: রিং-হস্তান্তর-প্রমাণ (computed-outlineColor-পরিবর্তন — ৪৬%→৭০% পথ)"; else bad "ই২ই: OC2=[$OC2] OC3=[$OC3] (অপরিবর্তিত?)"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
E1=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),c:window.__sfs323QA.count()})")
E1J=$(unjj "$E1")
if [ "$(jf g "$E1J")" = "false" ] && [ "$(jf c "$E1J")" = "0" ]; then ok "ই২ই: Escape → লিক-হার্ডেনিং + হাইলাইট-শূন্য (s322-MO-পথ-অটুট)"; else bad "ই২ই: $(unjj "$E1")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
agent-browser wait 5000 >/dev/null 2>&1
T4=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),c:window.__sfs323QA.count(),uf:window.__sfs322QA.unfrozen})")
T4J=$(unjj "$T4")
if [ "$(jf g "$T4J")" = "false" ] && [ "$(jf c "$T4J")" = "0" ] && [ "$(jf uf "$T4J")" = "1" ]; then ok "ই২ই: গেট-সমাপ্তি → হাইলাইট-বিলোপ + আনফ্রিজ (s322-চেইন-সমকালীন — একই-মাইক্রোটাস্ক)"; else bad "ই২ই: $(unjj "$T4")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T5=$(ev "JSON.stringify({st:window.__sfs323QA.set,c:window.__sfs323QA.count(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T5J=$(unjj "$T5")
if [ "$(jf st "$T5J")" = "3" ] && [ "$(jf c "$T5J")" = "0" ] && [ "$(jf kf "$T5J")" = "true" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপে হাইলাইট-নীরব (set=৩-অপরিবর্তিত — s322-স্বতন্ত্রক-পুনঃব্যবহার)"; else bad "ই২ই: $(unjj "$T5")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
if agent-browser screenshot "$SH_LBL" >/dev/null 2>&1; then ok "স্ক্রিনশট: ট্যাপ-লেবেল-হাইলাইট (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr323-ই২ই (Delete ×২-নিরামড→পরিষ্কার→স্বয়ং-নিরামড→dblclick-সমতা→শূন্য-ইতিহাস-নীরব) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria323QA,a:window.__hrAria323QA?window.__hrAria323QA.armed:-1,c:window.__hrAria323QA?window.__hrAria323QA.cleared:-1,e:((window.__hrAria323QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf a "$H0J")" = "0" ] && [ "$(jf c "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria323QA-হুক + পরিষ্কার-বেসলাইন"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap323=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
D1=$(ev "JSON.stringify({arm:window.__hrAria323QA.arm(),an:window.__hrAria323QA.armed,cls:!!document.querySelector('.hr317-tip.hr323-armed'),h:window.__hrAria317QA.hist().length,c:window.__hrAria322QA.cleared,tip:!!document.querySelector('.hr317-tip.is-on'),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),e:window.__hrAria323QA.err})")
D1J=$(unjj "$D1")
if [ "$(jf arm "$D1J")" = "true" ] && [ "$(jf an "$D1J")" = "1" ] && [ "$(jf cls "$D1J")" = "true" ]; then ok "ই২ই: Delete-১ → নিরামড (৩s-জানালা + .hr323-armed-ভিজ্যুয়াল)"; else bad "ই২ই: $(unjj "$D1")"; fi
if [ "$(jf h "$D1J")" = "1" ] && [ "$(jf c "$D1J")" = "0" ] && [ "$(jf tip "$D1J")" = "true" ]; then ok "ই২ই: এক-Delete-বিলোপ-নীরব (hist=১-অটুট — দ্বি-ধাপ-আবশ্যক)"; else bad "ই২ই: h=$(jf h "$D1J") c=$(jf c "$D1J") tip=$(jf tip "$D1J")"; fi
if printf '%s' "$(jf toast "$D1J")" | grep -q 'আবার Delete'; then ok "ই২ই: নিরামড-টোস্ট (আবার Delete চাপুন)"; else bad "ই২ই: toast=[$(jf toast "$D1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'd2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
D2=$(ev "JSON.stringify({arm:window.__hrAria323QA.arm(),cn:window.__hrAria323QA.cleared,c:window.__hrAria322QA.cleared,h:window.__hrAria317QA.hist().length,s:window.__hrAria321QA.stored(),tip:!!document.querySelector('.hr317-tip.is-on'),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),e:window.__hrAria323QA.err})")
D2J=$(unjj "$D2")
if [ "$(jf arm "$D2J")" = "false" ] && [ "$(jf cn "$D2J")" = "1" ] && [ "$(jf c "$D2J")" = "1" ]; then ok "ই২ই: Delete-২ → পরিষ্কার (clearHist323-এক-উৎস — উভয়-QA-গণনা-সমকালীন)"; else bad "ই২ই: $(unjj "$D2")"; fi
if [ "$(jf h "$D2J")" = "0" ] && [ "$(jf s "$D2J")" = "false" ] && [ "$(jf tip "$D2J")" = "false" ]; then ok "ই২ই: hist+স্টোর-উভয়-পরিষ্কার + টুলটিপ-বন্ধ (hr322-চুক্তি-পুনঃব্যবহৃত)"; else bad "ই২ই: h=$(jf h "$D2J") s=$(jf s "$D2J") tip=$(jf tip "$D2J")"; fi
if printf '%s' "$(jf toast "$D2J")" | grep -q 'ইতিহাস মুছে ফেলা'; then ok "ই২ই: পরিষ্কার-টোস্ট-প্রমাণ"; else bad "ই২ই: toast=[$(jf toast "$D2J")]"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c3'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'd3'})())" >/dev/null 2>&1
agent-browser wait 3300 >/dev/null 2>&1
D3=$(ev "JSON.stringify({arm:window.__hrAria323QA.arm(),cls:!!document.querySelector('.hr317-tip.hr323-armed'),h:window.__hrAria317QA.hist().length,tip:!!document.querySelector('.hr317-tip.is-on')})")
D3J=$(unjj "$D3")
if [ "$(jf arm "$D3J")" = "false" ] && [ "$(jf cls "$D3J")" = "false" ] && [ "$(jf h "$D3J")" = "2" ]; then ok "ই২ই: ৩s-স্বয়ং-নিরামড (hist=২-অটুট — বাতিল-পথ)"; else bad "ই২ই: $(unjj "$D3")"; fi
TP2=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip.is-on'),rows:window.__hrAria319QA.rows()})")
if [ "$(jf tip "$(unjj "$TP2")")" = "true" ] && [ "$(jf rows "$(unjj "$TP2")")" = "2" ]; then ok "ই২ই: blur+focus-পুনঃখোলা (tooltip পুনর্মুক্ত — focusin-পথ)"; else bad "ই২ই: টুলটিপ-পুনঃখোলা-ব্যর্থ ($(unjj "$TP2"))"; fi
ev "JSON.stringify((function(){var s=document.querySelector('.hr317-tip.is-on .hr318-sum');s.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));return 'd4'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
D4=$(ev "JSON.stringify({c:window.__hrAria322QA.cleared,h:window.__hrAria317QA.hist().length,tip:!!document.querySelector('.hr317-tip.is-on'),e:window.__hrAria322QA.err})")
D4J=$(unjj "$D4")
if [ "$(jf c "$D4J")" = "2" ] && [ "$(jf h "$D4J")" = "0" ] && [ "$(jf tip "$D4J")" = "false" ]; then ok "ই২ই: dblclick-সমতা-প্রমাণ (রিফ্যাক্টর-পরবর্তী একই-clearHist323-পথ — cleared=২)"; else bad "ই২ই: $(unjj "$D4")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f3'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
TX=$(ev "window.__hrAria317QA.text()" | tr -d '"')
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'd5'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
D5=$(ev "JSON.stringify({an:window.__hrAria323QA.armed,cn:window.__hrAria323QA.cleared,h:window.__hrAria317QA.hist().length})")
D5J=$(unjj "$D5")
if [ "$(jf an "$D5J")" = "2" ] && [ "$(jf cn "$D5J")" = "1" ] && [ "$(jf h "$D5J")" = "0" ]; then ok "ই২ই: শূন্য-ইতিহাসে Delete-নীরব ([$TX] — arm-ও-নয় — আকস্মিক-রোধ)"; else bad "ই২ই: $(unjj "$D5")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'e3'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if agent-browser screenshot "$SH_KBD" >/dev/null 2>&1; then ok "স্ক্রিনশট: কীবোর্ড-পরিষ্কার-সমতা (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-হাইলাইট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs323QA,err:(window.__sfs323QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs323QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(ev "JSON.stringify({c:window.__sfs323QA.count(),g:window.__sfs322QA.gate(),ps:getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState,v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf c "$M2J")" = "1" ] && [ "$(jf g "$M2J")" = "true" ]; then ok "মোবাইলে ট্যাপ-হাইলাইট (count=১ + গেট)"; else bad "মোবাইলে $(unjj "$M2")"; fi
if [ "$(jf ps "$M2J")" = "paused" ] && [ "$(jf v "$M2J")" = "visible" ]; then ok "মোবাইলে বিরতি+চিপ-সহাবস্থান (paused + computed-দৃশ্যমান)"; else bad "মোবাইলে ps=$(jf ps "$M2J") v=$(jf v "$M2J")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s323-suite ✓ সর্ব-সবুজ"; else echo "s323-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
