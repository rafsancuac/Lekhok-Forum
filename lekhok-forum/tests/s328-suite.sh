#!/bin/bash
# s328-suite.sh — session328: sfs328 keynav-পথের সম-প্রদর্শন-গাটার-প্যারিটি + hr328 প্রিভিউ-কপি-বাটন
# [Task ID 165] PLANS session327-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ③ sfs328 (style.css session328-ব্লক — কেবল-সংযোজন): keynav-পথে ব্যাজ × চিপ সম-দৃশ্যমান —
#      keynav-গেট-সমকক্ষ ~-ভাই-গাটার (right ৬৮→৮৪px, ৬৪০px: ৭২px) + জুটি-টোন (৪৬→৫৮%) =
#      ট্যাপ-মান-সমতা (s327-প্যারিটি-নীতি); keynav-মূল-রুল-অস্পৃশ্য; MO-অবর্জন-চুক্তি-অটুট
#   ② hr328 (admin/home-reorder.ejs): প্রিভিউ-কপি-বাটন — .hr328-cp (স্বতন্ত্র-শ্রেণি; meta↔text-মাঝে)
#      → বর্তমান-বিন্যাসেই সরাসরি রপ্তাই (strip324() WYSIWYG — এক-উৎস); রেকর্ড-বিহীন-পথ
#      (fallbackCopy316 + clipboard.writeText — hr324-রীতি); C-শর্টকাট (s320/s324-keydown-রীতি —
#      বন্ধ-প্রিভিউয়ে C = প্রথমে-খোলা); kbd-হিন্ট '· C = প্রিভিউ কপি' (স্বতন্ত্র-মোড়ক-জুটি);
#      __hrAria328QA {copies, last, copy(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316/s324/s327) +
#         বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd +
#         গেট-সমাপ্তি-wait-৫০০০ms + jf/unjj-নিউলাইন-অসমতা (s327-গোটচা — মাল্টি-লাইন-assert = jf-ভিত্তিক)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_KP=/home/z/my-project/download/s328-keyparity-desk.png
SH_CP=/home/z/my-project/download/s328-pvcopy-admin.png
SH_MOB=/home/z/my-project/download/s328-keyparity-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s328-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s328-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS328=$(sed -n '/session328 (sfs328 keynav-পথের সম-প্রদর্শন-গাটার-প্যারিটি)/,/EOF session328/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS328" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS328" ]; then ok "style.css: session328-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
printf '%s' "$CSS328" | grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs318-posbadge\[data-sfs318-on\] ~ .sfs319-namechip\[data-sfs319-on\]' && ok "style.css: keynav-গাটার-নির্বাচক (কেবল-সংযোজন — keynav-মূল-রুল-অস্পৃশ্য)" || bad "style.css: keynav-নির্বাচক-অনুপস্থিত"
printf '%s' "$CSS328" | grep -q 'right: 84px' && printf '%s' "$CSS328" | grep -q 'right: 72px' && ok "style.css: গাটার-মান = s327-ট্যাপ-মান-সমতা (৮৪px / ৬৪০px: ৭২px)" || bad "style.css: গাটার-মান-অমিল"
printf '%s' "$CSS328" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 58%, transparent)' && ok "style.css: জুটি-টোন-প্যারিটি (৫৮% — s327-সম-মান)" || bad "style.css: টোন-অমিল"
printf '%s' "$CSS328" | grep -q '@media (max-width: 640px)' && ok "style.css: 640px-ভ্যারিয়েন্ট" || bad "style.css: 640px-অনুপস্থিত"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q '.hr328-cp' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr328-cp-স্টাইল (স্বতন্ত্র-শ্রেণি — rgba-only)" || bad "home-reorder.ejs: .hr328-cp-অমিল"
grep -q "pre327.insertBefore(bc328, tx327);" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: বাটন-নির্মাণ (meta↔text-মাঝে — DOM-API/textContent-কেবল)" || bad "home-reorder.ejs: বাটন-নির্মাণ-অমিল"
grep -q "var txt328 = strip324();" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: WYSIWYG-উৎস (strip324-ডাইনামিক-রিড — প্রিভিউ-পাঠের-সম-উৎস)" || bad "home-reorder.ejs: WYSIWYG-অমিল"
grep -q "fallbackCopy316(txt328)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: রেকর্ড-বিহীন-রপ্তাই-পথ (fallbackCopy316 + clipboard.writeText — hr324-রীতি)" || bad "home-reorder.ejs: রপ্তাই-পথ-অমিল"
grep -q "e328c.key !== 'c' && e328c.key !== 'C'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: C-শর্টকাট (s320/s324-keydown-রীতি)" || bad "home-reorder.ejs: C-শর্টকাট-অমিল"
grep -q "togglePv327(null); /\* বন্ধ-অবস্থায় C = প্রথমে-খোলা" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: C-বন্ধ-প্রিভিউ = প্রথমে-খোলা (togglePv327-পুনঃব্যবহার)" || bad "home-reorder.ejs: C-খোলা-পথ-অমিল"
grep -q "var cf327w = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var trOrig328 = tipRender318;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: হিন্ট-মোড়ক-জুটি (cycleFmt326 + tipRender318 — 'C = প্রিভিউ কপি' — P-হিন্ট-চেইন-পরবর্তী)" || bad "home-reorder.ejs: হিন্ট-মোড়ক-অমিল"
grep -q "flash324(btn328)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: flash324-পুনঃব্যবহার (ফ্ল্যাশ-এক-উৎস)" || bad "home-reorder.ejs: flash-অমিল"
FSGATE=$(grep -c "শূন্য-ইতিহাসে নীরব (hr323-দর্শন)" "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$FSGATE" -ge 4 ]; then ok "home-reorder.ejs: শূন্য-ইতিহাস-নীরব-গেট ×৪ (X + F + P + C-পথ — hr323-দর্শন)"; else bad "home-reorder.ejs: নীরব-গেট ×$FSGATE"; fi
grep -q 'window.__hrAria328QA = q328h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria328QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
A328CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria328QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A328CHK" = "OK" ]; then ok "home-reorder.ejs: hr328-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs328-ই২ই (keynav-সম-প্রদর্শন-গাটার→টোন-প্যারিটি→গেট-সমাপ্তি→৬৪০px) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs327QA,p:!!(window.__sfs327QA&&window.__sfs327QA.probe()),e:((window.__sfs327QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf p "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs327QA-প্রোব-জীবন্ত + ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
KBC=$(unjj "$(ev "JSON.stringify({bc:(function(){var c=document.querySelector('.sfs319-namechip');return c?getComputedStyle(c).borderColor:''})()})")")
if [ "$(jf chipOn "$K1")" = "true" ] && [ "$(jf badgeOn "$K1")" = "true" ] && [ "$(jf right "$K1")" = "84px" ]; then ok "ই২ই: keynav-সম-প্রদর্শন-গাটার (চিপ+ব্যাজ → right=৮৪px — computed)"; else bad "ই২ই: $(unjj "$K1")"; fi
if [ "$(jf blur "$K1")" = "blur(6px)" ]; then ok "ই২ই: keynav-পথে চিপ-মূল-রুল-অস্পৃশ্য-পুনঃপ্রমাণ (blur(6px) — s318-mূল-মান — কেবল-সংযোজন-নীতি)"; else bad "ই২ই: blur=$(jf blur "$K1")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
TBC=$(unjj "$(ev "JSON.stringify({bc:(function(){var c=document.querySelector('.sfs319-namechip');return c?getComputedStyle(c).borderColor:''})()})")")
if [ "$(jf right "$T1")" = "84px" ] && [ "$(jf bc "$(unjj "$TBC")")" = "$(jf bc "$(unjj "$KBC")")" ]; then ok "ই২ই: ট্যাপ-পথ-অটুট + টোন-প্যারিটি-প্রমাণ (tap/keynav borderColor-সমতা — এক-মান)"; else bad "ই২ই: $(unjj "$T1") bc: $(unjj "$TBC") vs $(unjj "$KBC")"; fi
if agent-browser screenshot "$SH_KP" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-ট্যাপ-সম-প্রদর্শন সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T2=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$T2")" = "false" ] && [ "$(jf right "$T2")" = "68px" ]; then ok "ই২ই: Escape → গাটার-স্বয়ং-প্রত্যাহার (right→৬৮px — দ্বি-গেট-এক-উৎস)"; else bad "ই২ই: $(unjj "$T2")"; fi
agent-browser wait 5000 >/dev/null 2>&1
T3=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf chipOn "$T3")" = "false" ]; then ok "ই২ই: গেট-সমাপ্তি → চিপ-বিলোপ (s322-গেট — অস্পৃশ্য-পুনঃপ্রমাণ)"; else bad "ই২ই: $(unjj "$T3")"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$M1")" = "true" ] && [ "$(jf right "$M1")" = "72px" ]; then ok "ই২ই: ৬৪০px-মিডিয়ায় keynav-গাটার (right=৭২px — ক্ষুদ্র-পর্দা-প্যারিটি-প্রমাণ)"; else bad "ই২ই: $(unjj "$M1")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: hr328-ই২ই (কপি-বাটন→WYSIWYG→F-সম-বিন্যাস→C-শর্টকাট→বন্ধ-খোলা→শূন্য-নীরব) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({q:!!window.__hrAria328QA,c:window.__hrAria328QA?window.__hrAria328QA.copies:-1,e:((window.__hrAria328QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf c "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria328QA-হুক + copies=০"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap328=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,kbC:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('C = প্রিভিউ কপি')>=0,kbP:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('P = প্রিভিউ')>=0})")
B1J=$(unjj "$B1")
if [ "$(jf h "$B1J")" = "2" ] && [ "$(jf kbC "$B1J")" = "true" ] && [ "$(jf kbP "$B1J")" = "true" ]; then ok "ই২ই: kbd-হিন্ট-চেইন (P = প্রিভিউ + C = প্রিভিউ কপি — সম-সারিতে)"; else bad "ই২ই: $(unjj "$B1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
P1=$(ev "JSON.stringify({o:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),cp:!!document.querySelector('.hr317-tip.is-on .hr328-cp'),lb:(document.querySelector('.hr317-tip.is-on .hr328-cp')||{textContent:''}).textContent,al:(document.querySelector('.hr317-tip.is-on .hr328-cp')||{getAttribute:function(){return ''}}).getAttribute('aria-label')})")
P1J=$(unjj "$P1")
if [ "$(jf o "$P1J")" = "1" ] && [ "$(jf pre "$P1J")" = "true" ] && [ "$(jf cp "$P1J")" = "true" ] && [ "$(jf lb "$P1J")" = "কপি" ]; then ok "ই২ই: প্রিভিউ-খোলা → .hr328-cp-বাটন ('কপি' — meta↔text-মাঝে)"; else bad "ই২ই: $(unjj "$P1")"; fi
if printf '%s' "$(jf al "$P1J")" | grep -q 'বর্তমান-বিন্যাসে'; then ok "ই২ই: aria-label (বর্তমান-বিন্যাসে-রপ্তাই-বর্ণনা)"; else bad "ই২ই: al=[$(jf al "$P1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr328-cp');if(!b)return 'nb';b.click();return 'cc1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
CC1=$(ev "JSON.stringify({c:window.__hrAria328QA.copies,cap:(window.__clipCap328||'').indexOf('বার')>=0,m:window.__hrAria326QA.mode()})")
CC1J=$(unjj "$CC1")
if [ "$(jf c "$CC1J")" = "1" ] && [ "$(jf cap "$CC1J")" = "true" ] && [ "$(jf m "$CC1J")" = "rich" ]; then ok "ই২ই: বাটন-কপি rich-বিন্যাসে (copies=১ + ক্যাপচারে 'বার' — strip-সম-উৎস-প্রমাণ)"; else bad "ই২ই: $(unjj "$CC1")"; fi
CAPJ=$(unjj "$(ev "JSON.stringify({s:window.__clipCap328||'',x:window.__hrAria328QA.copy()})")")
if [ "$(jf s "$CAPJ")" = "$(jf x "$CAPJ")" ]; then ok "ই২ই: ক্যাপচার = copy() অক্ষরে-অক্ষরে (jf-পথ — s327-নিউলাইন-গোটচা-সম্মত)"; else bad "ই২ই: ক্যাপচার≠copy()"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr328-cp');if(!b)return 'nb';b.click();return 'cc2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
CC2=$(ev "JSON.stringify({c:window.__hrAria328QA.copies,cap:(window.__clipCap328||'').indexOf('বার')<0,m:window.__hrAria326QA.mode(),kbC:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('C = প্রিভিউ কপি')>=0})")
CC2J=$(unjj "$CC2")
if [ "$(jf c "$CC2J")" = "2" ] && [ "$(jf cap "$CC2J")" = "true" ] && [ "$(jf m "$CC2J")" = "key" ] && [ "$(jf kbC "$CC2J")" = "true" ]; then ok "ই২ই: F-টগল-পরবর্তী বাটন-কপি key-বিন্যাসে (copies=২ + 'বার'-শূন্য + C-হিন্ট-kbd-পুনঃলেখনে-টিকে)"; else bad "ই২ই: $(unjj "$CC2")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true,cancelable:true}));return 'c1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C1=$(ev "JSON.stringify({c:window.__hrAria328QA.copies,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),cap:(window.__clipCap328||'').indexOf('বার')<0})")
C1J=$(unjj "$C1")
if [ "$(jf c "$C1J")" = "3" ] && [ "$(jf pre "$C1J")" = "true" ] && [ "$(jf cap "$C1J")" = "true" ]; then ok "ই২ই: C-কী-কপি (খোলা-প্রিভিউয়ে — copies=৩ + key-বিন্যাস)"; else bad "ই২ই: $(unjj "$C1")"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr327-pv');if(!b)return 'nb';b.click();return 'pc1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var o0=window.__hrAria327QA.opens;var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'C',bubbles:true,cancelable:true}));return JSON.stringify({o0:o0,o1:window.__hrAria327QA.opens,c:window.__hrAria328QA.copies,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')})})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C2=$(ev "JSON.stringify({o:window.__hrAria327QA.opens,c:window.__hrAria328QA.copies,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')})")
C2J=$(unjj "$C2")
if [ "$(jf o "$C2J")" = "2" ] && [ "$(jf c "$C2J")" = "4" ] && [ "$(jf pre "$C2J")" = "true" ]; then ok "ই২ই: বন্ধ-প্রিভিউয়ে C = প্রথমে-খোলা-তারপর-কপি (opens=২ + copies=৪ — শিফট-C-সমতা)"; else bad "ই২ই: $(unjj "$C2")"; fi
if agent-browser screenshot "$SH_CP" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-কপি-বাটন সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr327-pv');if(!b)return 'nb';b.click();return 'pc2'})())" >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK2")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: পুনঃopen + USER_FEED-পুনঃনির্বাচন"; else bad "ই২ই: পুনঃনির্বাচন-রো-অনুপস্থিত"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd1'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd2'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1
Z1=$(ev "JSON.stringify((function(){var c0=window.__hrAria328QA.copies;var o0=window.__hrAria327QA.opens;var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true,cancelable:true}));return {h:window.__hrAria317QA.hist().length,c0:c0,c1:window.__hrAria328QA.copies,o0:o0,o1:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')}})())")
Z1J=$(unjj "$Z1")
if [ "$(jf h "$Z1J")" = "0" ] && [ "$(jf c0 "$Z1J")" = "$(jf c1 "$Z1J")" ] && [ "$(jf o0 "$Z1J")" = "$(jf o1 "$Z1J")" ] && [ "$(jf pre "$Z1J")" = "false" ]; then ok "ই২ই: শূন্য-ইতিহাসে C-নীরব (Delete×২-পরিষ্কার + copies/opens-অপরিবর্তিত + প্রিভিউ-অনুপস্থিত — hr323-দর্শন)"; else bad "ই২ই: $(unjj "$Z1")"; fi
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'hyg'})())" >/dev/null 2>&1

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + keynav-গাটার + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs327QA,err:(window.__sfs327QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs327QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M3=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$M3")" = "true" ] && [ "$(jf chipOn "$M3")" = "true" ] && [ "$(jf right "$M3")" = "72px" ]; then ok "মোবাইলে keynav-সম-প্রদর্শন-গাটার (right=৭২px — computed-প্রমাণ)"; else bad "মোবাইলে $(unjj "$M3")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s328-suite ✓ সর্ব-সবুজ"; else echo "s328-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
