#!/bin/bash
# s322-suite.sh — session322: sfs322 ট্যাপ-স্ক্রল-সমন্বয় + hr322 ইতিহাস-স্পষ্ট-নিয়ন্ত্রণ
# [Task ID 159] PLANS session321-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs322 (feed.ejs) — glabel-ট্যাপে grows-স্ক্রল-সমন্বয়: ট্যাপ-কৃত-গ্রুপের প্রথম-সারি
#      phone-ফ্রেমে-আনা — s315-freeze-পথ-পুনঃব্যবহার (__sfs319Show-পুনঃমোড়ক — কেবল
#      tap-গেট-উপস্থিতে ও keynav-নিষ্ক্রিয়ে); গেট-সমাপ্তিতে (4.8s) MutationObserver-পথে
#      আনফ্রিজ (মার্কি-পুনঃপ্রবাহ — s315-শূন্য-লাফ-চুক্তি); s321-গেট-লিক-হার্ডেনিং
#      (keynav-বিলোপে স্থগিত-গেট-পরিষ্কার); __sfs322QA {taps, unfrozen, tr(), gate(), err}
#   ③ hr322 (admin/home-reorder.ejs) — ইতিহাস-স্পষ্ট-নিয়ন্ত্রণ: sum-দ্বি-ক্লিকে hist+স্টোর-
#      পরিষ্কার (স্থায়ীকরণ-পরিপূরক; ভুল-ক্লিপবোর্ড-পুনঃব্যবহার-রোধ) — hist317-শূন্য +
#      sessionStorage-বিলোপ + ptr320-বিলোপ + এক-উৎস-রিফ্রেশ + টোস্ট; .hr322-hint-হিন্ট;
#      __hrAria322QA {cleared, hist(), stored(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব (defineProperty — s316) + হেক্স-শূন্য +
#         নেট-শূন্য-পরিষ্কারক + translate-transition-পরবর্তী-মাপ (≥৪০০ms — s315/s316-গোটচা) +
#         MO-microtask-পোল (viswait-পরিবার) + সুইট-রান = রিপো-রুট-cwd (s319-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SCR=/home/z/my-project/download/s322-scroll-sync-desk.png
SH_CLR=/home/z/my-project/download/s322-history-clear-admin.png
SH_MOB=/home/z/my-project/download/s322-scroll-sync-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s322-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s322-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs319Show = function (l322, i322, n322)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show-পুনঃমোড়ক (s320-চেইন-পরবর্তী — মোড়ক-স্তর-নীতি)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "phone322.hasAttribute('data-sfs321-tap') && !phone322.hasAttribute('data-sfs314-focus')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: দ্বি-শর্ত-স্বতন্ত্রক (tap-গেট-উপস্থিত × keynav-নিষ্ক্রিয়)" || bad "feed.ejs: স্বতন্ত্রক-অমিল"
grep -q 'window.__sfs315Freeze(l322, phone322)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: s315-freeze-পথ-পুনঃব্যবহার (guarded)" || bad "feed.ejs: freeze-পুনঃব্যবহার-অমিল"
grep -q 'new MutationObserver' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: গেট-সমাপ্তি MutationObserver (microtask-পালা — পেইন্ট-পূর্বে)" || bad "feed.ejs: MO-অমিল"
grep -q "attributeFilter: \['data-sfs321-tap', 'data-sfs314-focus'\]" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: MO-attributeFilter (দ্বি-গেট-পর্যবেক্ষণ)" || bad "feed.ejs: attributeFilter-অমিল"
grep -q "if (window.__sfs315QA && !window.__sfs315QA.frozen) return" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: doUnfreeze-গার্ড (ইতিমধ্যে-মুক্তে গণনা-দ্বি-নিষিদ্ধ)" || bad "feed.ejs: গার্ড-অমিল"
grep -q "phone322.removeAttribute('data-sfs321-tap')" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: s321-গেট-লিক-হার্ডেনিং (focus-removal-রেকর্ডে স্থগিত-গেট-পরিষ্কার)" || bad "feed.ejs: হার্ডেনিং-অমিল"
grep -q 'window.__sfs322QA = q322' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs322QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs292-track' "$APP/public/assets/css/style.css" && ok "style.css: tap-গেটে মার্কি-বিরতি (keynav-গেট-সমান্তরাল — freeze-স্থায়িত্ব-পূর্বশর্ত)" || bad "style.css: বিরতি-নিয়ম-অমিল"
grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs292-frame' "$APP/public/assets/css/style.css" && ok "style.css: ট্যাপ-ফ্রেম-রিং (focus-ring-সমকক্ষ — outline-কেবল)" || bad "style.css: রিং-অমিল"
CSS322=$(sed -n '/session322 (sfs322 ট্যাপ-স্ক্রল-সমন্বয়)/,/EOF session322/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS322" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session322-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
grep -q "document.addEventListener('dblclick'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: document-স্তরের ডেলিগেটেড dblclick (পুনঃনির্মাণ-নিরাপদ — s320-রীতি)" || bad "home-reorder.ejs: dblclick-অমিল"
grep -q "closest('.hr318-sum, .hr322-hint')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: sum+hint-লক্ষ্য" || bad "home-reorder.ejs: লক্ষ্য-অমিল"
grep -q "classList.contains('hr319-live')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr319-live-গেট (তালিকাযুক্ত-টুলটিপেই — pointer-events-চুক্তি)" || bad "home-reorder.ejs: গেট-অমিল"
grep -q 'hist317.length = 0' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'sessionStorage.removeItem(HR321_KEY)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hist+স্টোর-উভয়-পরিষ্কার (স্থায়ীকরণ-পরিপূরক)" || bad "home-reorder.ejs: পরিষ্কার-অমিল"
grep -q "ptr320 = ''" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ptr320-বিলোপ (s320-স্টেল-পয়েন্টার-পুনঃকপি-রোধ)" || bad "home-reorder.ejs: ptr-বিলোপ-অমিল"
grep -q 'var trOrig322 = tipRender318' "$APP/admin/views/admin/home-reorder.ejs" && grep -q "hr322-hint" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: হিন্ট-মোড়ক (s321-চেইন-পরবর্তী — .hr322-hint DOM-যোগ)" || bad "home-reorder.ejs: হিন্ট-মোড়ক-অমিল"
grep -q 'showToast(true, .কপি-ইতিহাস মুছে ফেলা হয়েছে.)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: টোস্ট-প্রমাণ (showToast-পুনঃব্যবহার)" || bad "home-reorder.ejs: টোস্ট-অমিল"
grep -q 'window.__hrAria322QA = q322c' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria322QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q '.hr317-tip.hr319-live .hr318-sum { cursor: pointer; }' "$APP/admin/views/admin/home-reorder.ejs" && grep -q '.hr322-hint { display: block;' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr322-hint-স্টাইল + sum-কার্সর (admin-লোকাল)" || bad "home-reorder.ejs: স্টাইল-অমিল"
S322CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session322.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S322CHK" = "OK" ]; then ok "feed.ejs: session322-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A322CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria322QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A322CHK" = "OK" ]; then ok "home-reorder.ejs: hr322-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs322QA'; then ok "SSR: s322-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s322-ইঞ্জিন-অনুপস্থিত"; fi
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১-অটুট (s319-সহাবস্থান)"; else bad "SSR: নাম-চিপ ×$NC"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi
S321H=$(printf '%s' "$SS0" | grep -o '__sfs321QA' | wc -l | tr -d ' ')
if [ "$S321H" -ge 1 ]; then ok "SSR: __sfs321QA-হুক-অটুট (s321-সহাবস্থান)"; else bad "SSR: s321-হুক-অনুপস্থিত"; fi

echo "── ধাপ-৩: sfs322-ই২ই (ট্যাপ-ফ্রিজ→স্থান-প্রমাণ→পুনঃফ্রিজ→গেট-সমাপ্তি-আনফ্রিজ→লিক-হার্ডেনিং) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs322QA,tp:window.__sfs322QA?window.__sfs322QA.taps:-1,uf:window.__sfs322QA?window.__sfs322QA.unfrozen:-1,tr:window.__sfs322QA?window.__sfs322QA.tr():'x',g:window.__sfs322QA?window.__sfs322QA.gate():null,err:(window.__sfs322QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf tp "$Q0J")" = "0" ] && [ "$(jf uf "$Q0J")" = "0" ]; then ok "ই২ই: __sfs322QA-হুক + প্রারম্ভিক taps=০/unfrozen=০"; else bad "ই২ই: q=$(jf q "$Q0J") tp=$(jf tp "$Q0J") uf=$(jf uf "$Q0J")"; fi
if [ "$(jf tr "$Q0J")" = "" ] && [ "$(jf g "$Q0J")" = "false" ] && [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: প্রারম্ভিক-অবস্থা — translate-শূন্য + গেট-বন্ধ + ত্রুটি-শূন্য"; else bad "ই২ই: tr=[$(jf tr "$Q0J")] g=$(jf g "$Q0J") err=[$(jf err "$Q0J")]"; fi
PS0=$(ev "getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState")
if [ "$(unjj "$PS0")" = "running" ]; then ok "ই২ই: মার্কি-প্রারম্ভিক-প্রবাহ (running)"; else bad "ই২ই: play-state=$(unjj "$PS0")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim(),l1:String(ls[1].textContent).replace(/\\s+/g,' ').trim()}})())")
LBJ=$(unjj "$LB"); L0=$(jf l0 "$LBJ"); L1=$(jf l1 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] [$L1])"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),tp:window.__sfs322QA.taps,tr:window.__sfs322QA.tr(),ps:getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState,on:window.__sfs321QA.on(),tx:window.__sfs321QA.text(),d:Math.round(document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0].getBoundingClientRect().top-document.querySelector('.sfs292-feed').getBoundingClientRect().top)})")
T1J=$(unjj "$T1")
if [ "$(jf g "$T1J")" = "true" ] && [ "$(jf tp "$T1J")" = "1" ] && [ "$(jf tr "$T1J")" != "" ]; then ok "ই২ই: ট্যাপ-১ → ফ্রিজ (গেট-খোলা + taps=১ + translate-সেট — s315-পথ-পুনঃব্যবহার)"; else bad "ই২ই: g=$(jf g "$T1J") tp=$(jf tp "$T1J") tr=[$(jf tr "$T1J")]"; fi
if [ "$(jf ps "$T1J")" = "paused" ]; then ok "ই২ই: tap-গেটে মার্কি-বিরতি (session322-CSS — freeze-স্থায়িত্ব)"; else bad "ই২ই: play-state=$(jf ps "$T1J")"; fi
if [ "$(jf tx "$T1J")" = "$L0" ] && [ "$(jf on "$T1J")" = "true" ]; then ok "ই২ই: চিপ-সহাবস্থান ([$L0] — s321-পথ-অটুট)"; else bad "ই২ই: tx=[$(jf tx "$T1J")] on=$(jf on "$T1J")"; fi
D1=$(jf d "$T1J")
if [ "$D1" -ge 18 ] && [ "$D1" -le 26 ] 2>/dev/null; then ok "ই২ই: লেবেল feed-শীর্ষ+২২px-প্যাডে (মাপ=$D1 — s315-গণিত; transition-পরবর্তী-মাপ)"; else bad "ই২ই: লেবেল-মাপ=$D1 (প্রত্যাশা ২২±৪)"; fi
TR1=$(jf tr "$T1J")
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T2=$(ev "JSON.stringify({tp:window.__sfs322QA.taps,tr:window.__sfs322QA.tr(),tx:window.__sfs321QA.text(),d:Math.round(document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1].getBoundingClientRect().top-document.querySelector('.sfs292-feed').getBoundingClientRect().top)})")
T2J=$(unjj "$T2")
if [ "$(jf tp "$T2J")" = "2" ] && [ "$(jf tx "$T2J")" = "$L1" ]; then ok "ই২ই: ট্যাপ-২ → পুনঃফ্রিজ (taps=২ + চিপ [$L1])"; else bad "ই২ই: tp=$(jf tp "$T2J") tx=[$(jf tx "$T2J")]"; fi
D2=$(jf d "$T2J")
if [ "$D2" -ge 18 ] && [ "$D2" -le 26 ] 2>/dev/null; then ok "ই২ই: পুনঃফ্রিজেও লেবেল-২ প্যাডে (মাপ=$D2 — prevY-স্ন্যাপশট-গণিত-অটুট)"; else bad "ই২ই: লেবেল-২-মাপ=$D2"; fi
agent-browser wait 4900 >/dev/null 2>&1
T3=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),tr:window.__sfs322QA.tr(),uf:window.__sfs322QA.unfrozen,ps:getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState,err:(window.__sfs322QA||{}).err||''})")
T3J=$(unjj "$T3")
if [ "$(jf g "$T3J")" = "false" ] && [ "$(jf tr "$T3J")" = "" ]; then ok "ই২ই: গেট-সমাপ্তি → আনফ্রিজ (4.8s-MO-পথ — translate-বিলোপ, মার্কি-পুনঃপ্রবাহ-প্রস্তুত)"; else bad "ই২ই: g=$(jf g "$T3J") tr=[$(jf tr "$T3J")]"; fi
if [ "$(jf uf "$T3J")" = "1" ] && [ "$(jf ps "$T3J")" = "running" ] && [ "$(jf err "$T3J")" = "" ]; then ok "ই২ই: unfrozen=১ + মার্কি-পুনঃপ্রবাহ (running) + ত্রুটি-শূন্য"; else bad "ই২ই: uf=$(jf uf "$T3J") ps=$(jf ps "$T3J") err=[$(jf err "$T3J")]"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
agent-browser wait 5000 >/dev/null 2>&1
LK=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
LKJ=$(unjj "$LK")
if [ "$(jf g "$LKJ")" = "true" ] && [ "$(jf kf "$LKJ")" = "true" ]; then ok "ই২ই: লিক-অবস্থা-পুনঃসৃষ্টি (keynav-সক্রিয়ে s321-ওয়ান-শট-টাইমার-গেট-বাদ-করে — স্থগিত-গেট-অবশিষ্ট)"; else bad "ই২ই: g=$(jf g "$LKJ") kf=$(jf kf "$LKJ") (লিক-অনুপস্থিত?)"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
E1=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),on:window.__sfs319QA.on(),uf:window.__sfs322QA.unfrozen})")
E1J=$(unjj "$E1")
if [ "$(jf g "$E1J")" = "false" ] && [ "$(jf kf "$E1J")" = "false" ]; then ok "ই২ই: s321-গেট-লিক-হার্ডেনিং-প্রমাণ (Escape → MO-পথে স্থগিত-গেট-পরিষ্কার — s321-একা-অপারেশনে-সম্ভব-নয়)"; else bad "ই২ই: g=$(jf g "$E1J") kf=$(jf kf "$E1J")"; fi
if [ "$(jf on "$E1J")" = "false" ] && [ "$(jf uf "$E1J")" = "1" ]; then ok "ই২ই: doUnfreeze-গার্ড-প্রমাণ (s314-নিজস্ব-আনফ্রিজ-পরবর্তী গণনা-দ্বি-নিষিদ্ধ — unfrozen=১-ই)"; else bad "ই২ই: on=$(jf on "$E1J") uf=$(jf uf "$E1J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T4=$(ev "JSON.stringify({tp:window.__sfs322QA.taps,g:window.__sfs322QA.gate(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T4J=$(unjj "$T4")
if [ "$(jf tp "$T4J")" = "3" ] && [ "$(jf g "$T4J")" = "false" ] && [ "$(jf kf "$T4J")" = "true" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপে ফ্রিজ-নীরব (taps=৩-অপরিবর্তিত + গেট-অনাবশ্যক — viewport keynav-মালিকানাধীন)"; else bad "ই২ই: tp=$(jf tp "$T4J") g=$(jf g "$T4J") kf=$(jf kf "$T4J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
if agent-browser screenshot "$SH_SCR" >/dev/null 2>&1; then ok "স্ক্রিনশট: ট্যাপ-স্ক্রল-সমন্বয় (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr322-ই২ই (দ্বি-কপি→হিন্ট→sum-দ্বি-ক্লিক-পরিষ্কার→পুনঃহোভার-শূন্য→এক-ক্লিক-নীরব→পুনঃব্যবহার) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria322QA,c:window.__hrAria322QA?window.__hrAria322QA.cleared:-1,h:window.__hrAria322QA?window.__hrAria322QA.hist():-1,s:window.__hrAria322QA?window.__hrAria322QA.stored():null,e:((window.__hrAria322QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf c "$H0J")" = "0" ] && [ "$(jf h "$H0J")" = "0" ] && [ "$(jf s "$H0J")" = "false" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria322QA-হুক + পরিষ্কার-বেসলাইন (cleared=০/hist=০/স্টোর-শূন্য/ত্রুটি-শূন্য)"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap322=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,s:window.__hrAria321QA.stored()})")
if [ "$(jf h "$(unjj "$C2")")" = "2" ] && [ "$(jf s "$(unjj "$C2")")" = "true" ]; then ok "ই২ই: দ্বি-কপি → hist=২ + স্বয়ংক্রিয়-সংরক্ষণ (hr321-অটুট)"; else bad "ই২ই: $(unjj "$C2")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
TP=$(ev "JSON.stringify({rows:window.__hrAria319QA.rows(),lv:window.__hrAria319QA.live(),hint:document.querySelectorAll('.hr317-tip.is-on .hr322-hint').length,hs:document.querySelector('.hr317-tip.is-on .hr322-hint')?document.querySelector('.hr317-tip.is-on .hr322-hint').textContent:''})")
TPJ=$(unjj "$TP")
if [ "$(jf rows "$TPJ")" = "2" ] && [ "$(jf lv "$TPJ")" = "true" ]; then ok "ই২ই: তালিকাযুক্ত-টুলটিপ-খোলা (rows=২ + live-গেট — দ্বি-ক্লিক-পূর্বশর্ত)"; else bad "ই২ই: $(unjj "$TP")"; fi
if [ "$(jf hint "$TPJ")" = "1" ] && [ "$(jf hs "$TPJ")" = "দ্বি-ক্লিক = ইতিহাস মুছুন" ]; then ok "ই২ই: .hr322-hint-হিন্ট-প্রদর্শিত (দ্বি-ক্লিক = ইতিহাস মুছুন)"; else bad "ই২ই: hint=$(jf hint "$TPJ") hs=[$(jf hs "$TPJ")]"; fi
ev "JSON.stringify((function(){var s=document.querySelector('.hr317-tip.is-on .hr318-sum');s.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
D1=$(ev "JSON.stringify({c:window.__hrAria322QA.cleared,h:window.__hrAria317QA.hist().length,s:window.__hrAria322QA.stored(),raw:(function(){try{return sessionStorage.getItem('hr321-hist')||''}catch(e){return ''}})(),tip:!!document.querySelector('.hr317-tip.is-on'),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),e:window.__hrAria322QA.err})")
D1J=$(unjj "$D1")
if [ "$(jf c "$D1J")" = "1" ] && [ "$(jf h "$D1J")" = "0" ] && [ "$(jf s "$D1J")" = "false" ] && [ "$(jf raw "$D1J")" = "" ]; then ok "ই২ই: sum-দ্বি-ক্লিক → hist+স্টোর-উভয়-পরিষ্কার (cleared=১ + raw-শূন্য)"; else bad "ই২ই: $(unjj "$D1")"; fi
if [ "$(jf tip "$D1J")" = "false" ]; then ok "ই২ই: টুলটিপ-বন্ধ (tipHide317 — পুনঃহোভারে সতেজ)"; else bad "ই২ই: tip=$(jf tip "$D1J") (খোলা-অবশিষ্ট)"; fi
if printf '%s' "$(jf toast "$D1J")" | grep -q 'ইতিহাস মুছে ফেলা'; then ok "ই২ই: টোস্ট-প্রমাণ (কপি-ইতিহাস মুছে ফেলা হয়েছে)"; else bad "ই২ই: toast=[$(jf toast "$D1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
E2=$(ev "JSON.stringify({rows:window.__hrAria318QA.rows(),tx:window.__hrAria317QA.text(),lv:window.__hrAria319QA.live(),hint:document.querySelectorAll('.hr317-tip.is-on .hr322-hint').length})")
E2J=$(unjj "$E2")
if [ "$(jf rows "$E2J")" = "0" ] && [ "$(jf tx "$E2J")" = "এখনো কপি হয়নি" ] && [ "$(jf lv "$E2J")" = "false" ] && [ "$(jf hint "$E2J")" = "0" ]; then ok "ই২ই: পুনঃহোভার → সতেজ-শূন্য-টুলটিপ (এখনো কপি হয়নি + live-গেট-বন্ধ + হিন্ট-শূন্য)"; else bad "ই২ই: $(unjj "$E2")"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c3'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
ev "JSON.stringify((function(){var s=document.querySelector('.hr317-tip.is-on .hr318-sum');s.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 's1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
S1=$(ev "JSON.stringify({c:window.__hrAria322QA.cleared,h:window.__hrAria317QA.hist().length,tip:!!document.querySelector('.hr317-tip.is-on')})")
S1J=$(unjj "$S1")
if [ "$(jf c "$S1J")" = "1" ] && [ "$(jf h "$S1J")" = "1" ] && [ "$(jf tip "$S1J")" = "true" ]; then ok "ই২ই: এক-ক্লিক-নীরব (cleared=১-অপরিবর্তিত + hist=১ — আকস্মিক-বিলোপ-রোধ চুক্তি)"; else bad "ই২ই: $(unjj "$S1")"; fi
ev "JSON.stringify((function(){var s=document.querySelector('.hr317-tip.is-on .hr318-sum');s.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));return 'd2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
D2b=$(ev "JSON.stringify({c:window.__hrAria322QA.cleared,h:window.__hrAria317QA.hist().length,s:window.__hrAria322QA.stored(),e:window.__hrAria322QA.err})")
D2J=$(unjj "$D2b")
if [ "$(jf c "$D2J")" = "2" ] && [ "$(jf h "$D2J")" = "0" ] && [ "$(jf s "$D2J")" = "false" ] && [ "$(jf e "$D2J")" = "" ]; then ok "ই২ই: পুনঃব্যবহারযোগ্য-নিয়ন্ত্রণ (দ্বিতীয়-দ্বি-ক্লিক → cleared=২ + ত্রুটি-শূন্য)"; else bad "ই২ই: $(unjj "$D2b")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'e3'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if agent-browser screenshot "$SH_CLR" >/dev/null 2>&1; then ok "স্ক্রিনশট: ইতিহাস-স্পষ্ট-নিয়ন্ত্রণ (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-ফ্রিজ-বিরতি + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs322QA,err:(window.__sfs322QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs322QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),tp:window.__sfs322QA.taps,tr:window.__sfs322QA.tr(),ps:getComputedStyle(document.querySelector('.sfs292-track')).animationPlayState,v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf g "$M2J")" = "true" ] && [ "$(jf tp "$M2J")" = "1" ] && [ "$(jf tr "$M2J")" != "" ]; then ok "মোবাইলে ট্যাপ-ফ্রিজ (গেট + translate-সেট)"; else bad "মোবাইলে $(unjj "$M2")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s322-suite ✓ সর্ব-সবুজ"; else echo "s322-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
