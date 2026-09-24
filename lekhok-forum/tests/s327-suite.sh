#!/bin/bash
# s327-suite.sh — session327: sfs327 ট্যাপ-ব্যাজ × নাম-চিপ সম-প্রদর্শন-পলিশ + hr327 রপ্তাই-পূর্বরূপ-প্রিভিউ
# [Task ID 164] PLANS session326-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ③ sfs327 (style.css + feed.ejs) — ট্যাপ-পথে ব্যাজ (s326 OR-গেট) × চিপ (s321-গেট)
#      সম-প্রদর্শন-পলিশ: ① চিপ-কম্পোজিটর-সংকোচন (transition:none + backdrop-filter:none —
#      s326-ব্যাজ-রেসিপি-সমতা — s321-চিপ-গেটের অবশিষ্ট ০.২s-fade+blur-একই-রেস-শ্রেণি-বন্ধ)
#      ② সম-প্রদর্শন-গাটার (ব্যাজ-on-পূর্বসূরি ~-ভাই → চিপ right ৬৮→৮৪px — বহু-অঙ্ক-ব্যাজ-সংঘর্ষ-বন্ধ)
#      ③ জুটি-টোন (চিপ-বর্ডার-টিন্ট ৪৬→৫৮%) ④ ≤৩৬০px চিপ-প্রস্থ-সংকোচন (৫২→৩৮%);
#      __sfs327QA {probe(), err} — MO-অবর্জন-চুক্তি-অটুট (৪-MO-স্থগিত — computed-প্রোব-কেবল)
#   ② hr327 (admin/home-reorder.ejs) — রপ্তাই-পূর্বরূপ-প্রিভিউ: .hr327-pv বাটন (hr324-বার-৪র্থ —
#      স্বতন্ত্র-শ্রেণি; dotted) → টগল = .hr327-pre-ব্লক (বার-পূর্বে — সঠিক strip324() পাঠ WYSIWYG —
#      hr326-বিন্যাস-মোড-সম্মত + .hr327-meta n-লাইন·m-অক্ষর); F-টগল-সমন্বয় (cycleFmt326-মোড়ক —
#      খোলা-প্রিভিউ-সমকালীন-রিফ্রেশ + P-হিন্ট-সংরক্ষণ); P-শর্টকাট (s320/s324-keydown-রীতি);
#      __hrAria327QA {opens, closes, last, preview(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316/s324) + বেয়ার-এক্সপ্রেশন-
#         রিটার্ন (s325-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + গেট-সমাপ্তি-wait-৫০০০ms
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_CD=/home/z/my-project/download/s327-codisplay-desk.png
SH_PV=/home/z/my-project/download/s327-preview-admin.png
SH_MOB=/home/z/my-project/download/s327-codisplay-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s327-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s327-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS327=$(sed -n '/session327 (sfs327 ট্যাপ-ব্যাজ × নাম-চিপ সম-প্রদর্শন-পলিশ)/,/EOF session327/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS327" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS327" ]; then ok "style.css: session327-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
printf '%s' "$CSS327" | grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs319-namechip\[data-sfs319-on\]' && ok "style.css: ① চিপ-কম্পোজিটর-সংকোচন-নির্বাচক (tap-গেট × chip-on)" || bad "style.css: সংকোচন-নির্বাচক-অনুপস্থিত"
printf '%s' "$CSS327" | grep -q 'backdrop-filter: none' && printf '%s' "$CSS327" | grep -q 'transition: none' && ok "style.css: সংকোচন-মান (transition:none + backdrop-filter:none — s326-রেসিপি-সমতা)" || bad "style.css: সংকোচন-মান-অমিল"
GUTN=$(printf '%s' "$CSS327" | grep -c '.sfs318-posbadge\[data-sfs318-on\] ~ .sfs319-namechip\[data-sfs319-on\]' | tr -d ' ')
if [ "$GUTN" -ge 3 ]; then ok "style.css: ② সম-প্রদর্শন-গাটার (~-ভাই — ব্যাজ-সচেতন-অফসেট) + ③ জুটি-টোন"; else bad "style.css: গাটার-রুল ×$GUTN"; fi
printf '%s' "$CSS327" | grep -q 'right: 84px' && printf '%s' "$CSS327" | grep -q 'right: 72px' && ok "style.css: গাটার-মান (৮৪px ডেস্ক / ৭২px ৬৪০px — বহু-অঙ্ক-ব্যাজ-সংঘর্ষ-বন্ধ)" || bad "style.css: গাটার-মান-অমিল"
printf '%s' "$CSS327" | grep -q '@media (max-width: 360px)' && printf '%s' "$CSS327" | grep -q 'max-width: 38%' && ok "style.css: ④ ৩৬০px-ক্ষুদ্র-ভ্যারিয়েন্ট (চিপ-প্রস্থ ৫২→৩৮%)" || bad "style.css: ৩৬০px-ভ্যারিয়েন্ট-অনুপস্থিত"
printf '%s' "$CSS327" | grep -q 'prefers-reduced-motion' && ok "style.css: reduced-motion-নিরাপত্তা" || bad "style.css: reduced-motion-অনুপস্থিত"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q 'window.__sfs327QA = q327' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs327QA-হুক (computed-প্রোব — MO-অবর্জন)" || bad "feed.ejs: QA-হুক-অমিল"
grep -q '.hr327-pv' "$APP/admin/views/admin/home-reorder.ejs" && grep -q '.hr327-pre' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr327-pv/.hr327-pre-স্টাইল (.hr324-btn-উত্তরাধিকার + dotted — rgba-only)" || bad "home-reorder.ejs: .hr327-স্টাইল-অমিল"
grep -q "bar327.parentNode.insertBefore(pre327, bar327)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: প্রিভিউ-বার-পূর্বে-সন্নিবেশ (তালিকা↔বার-মাঝে)" || bad "home-reorder.ejs: সন্নিবেশ-অমিল"
grep -q 'var txt327 = strip324();' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: WYSIWYG-উৎস (strip324-ডাইনামিক-রিড — hr326-বিন্যাস-মোড-সম্মত — এক-উৎস)" || bad "home-reorder.ejs: WYSIWYG-অমিল"
grep -q 'var cf326o = cycleFmt326;' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: cycleFmt326-মোড়ক (F-টগলে খোলা-প্রিভিউ-রিফ্রেশ + P-হিন্ট-সংরক্ষণ)" || bad "home-reorder.ejs: F-সমন্বয়-মোড়ক-অমিল"
grep -q "if (pvOpen327) renderPv327();" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: খোলা-প্রিভিউ-সমকালীন-রিফ্রেশ (এক-উৎস)" || bad "home-reorder.ejs: রিফ্রেশ-অমিল"
grep -q "e327e.key !== 'p' && e327e.key !== 'P'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: P-শর্টকাট (s320/s324-keydown-রীতি)" || bad "home-reorder.ejs: P-শর্টকাট-অমিল"
grep -q "pvOpen327 = false; /\* পুনঃনির্মাণে প্রিভিউ-বন্ধ" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: পুনঃরেন্ডারে-প্রিভিউ-বন্ধ (tipRender318-পুনঃনির্মাণ-চুক্তি)" || bad "home-reorder.ejs: পুনঃনির্মাণ-চুক্তি-অমিল"
FSGATE=$(grep -c "শূন্য-ইতিহাসে নীরব (hr323-দর্শন)" "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$FSGATE" -ge 3 ]; then ok "home-reorder.ejs: শূন্য-ইতিহাস-নীরব-গেট ×৩ (X + F + P-পথ — hr323-দর্শন)"; else bad "home-reorder.ejs: নীরব-গেট ×$FSGATE"; fi
grep -q 'window.__hrAria327QA = q327h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria327QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S327CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session327.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S327CHK" = "OK" ]; then ok "feed.ejs: session327-ইঞ্জিন node --check OK (স্বতন্ত্র-স্ক্রিপ্ট-ব্লক)"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A327CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria327QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A327CHK" = "OK" ]; then ok "home-reorder.ejs: hr327-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: s327-প্রোব-হুক-রেন্ডারিত"; else bad "SSR: s327-প্রোব-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs327-ই২ই (সম-প্রদর্শন→computed-গাটার→সংকোচন-প্রমাণ→গেট-সমাপ্তি→৩৬০px) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs327QA,p:!!(window.__sfs327QA&&window.__sfs327QA.probe()),e:((window.__sfs327QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf p "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs327QA-হুক + probe() + ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
PR0=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$PR0")" = "false" ] && [ "$(jf chipOn "$PR0")" = "false" ] && [ "$(jf right "$PR0")" = "68px" ]; then ok "ই২ই: প্রারম্ভিক-প্রোব (ব্যাজ-off × চিপ-off — right=৬৮px-ভিত্তি)"; else bad "ই২ই: $(unjj "$PR0")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$T1")" = "true" ] && [ "$(jf chipOn "$T1")" = "true" ] && [ "$(jf right "$T1")" = "84px" ]; then ok "ই২ই: ট্যাপ-সম-প্রদর্শন → গাটার-প্রমাণ (ব্যাজ-on × চিপ-on → right ৬৮→৮৪px — computed)"; else bad "ই২ই: $(unjj "$T1")"; fi
if [ "$(jf trans "$T1")" = "0s" ] && [ "$(jf blur "$T1")" = "none" ]; then ok "ই২ই: চিপ-কম্পোজিটর-সংকোচন-প্রমাণ (transitionDuration=০s + backdropFilter=none — s326-রেসিপি-সমতা)"; else bad "ই২ই: trans=$(jf trans "$T1") blur=$(jf blur "$T1")"; fi
if agent-browser screenshot "$SH_CD" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-সম-প্রদর্শন সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T2=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$T2")" = "false" ] && [ "$(jf right "$T2")" = "68px" ]; then ok "ই২ই: Escape → ব্যাজ-বিলোপ → গাটার-স্বয়ং-প্রত্যাহার (right→৬৮px — CSS-গেট-এক-উৎস)"; else bad "ই২ই: $(unjj "$T2")"; fi
agent-browser wait 5000 >/dev/null 2>&1
T3=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf chipOn "$T3")" = "false" ]; then ok "ই২ই: গেট-সমাপ্তি → চিপ-বিলোপ (s322-গেট — অস্পৃশ্য-পুনঃপ্রমাণ)"; else bad "ই২ই: $(unjj "$T3")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
T4=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf chipOn "$T4")" = "true" ] && [ "$(jf badgeOn "$T4")" = "true" ] && [ "$(jf right "$T4")" = "84px" ]; then ok "ই২ই: keynav-সম-প্রদর্শন-গাটার (sfs328-প্যারিটি — ট্যাপ-মান-সমতা ৮৪px — কেবল-সংযোজন)"; else bad "ই২ই: $(unjj "$T4")"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$M1")" = "true" ] && [ "$(jf right "$M1")" = "72px" ]; then ok "ই২ই: ৬৪০px-মিডিয়ায় গাটার (right=৭২px — ক্ষুদ্র-পর্দা-ভ্যারিয়েন্ট-প্রমাণ)"; else bad "ই২ই: $(unjj "$M1")"; fi
MW390=$(jf maxw "$M1")
agent-browser set viewport 360 740 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
MW360=$(jf maxw "$M2")
MWLT=$(python3 -c "
import re
def num(s):
    m = re.match(r'^([0-9.]+)(px|%)?$', s or '')
    return float(m.group(1)) if m else -1.0
print(1 if num('${MW360:-}') >= 0 and num('${MW390:-}') >= 0 and num('${MW360:-}') < num('${MW390:-}') else 0)")
if [ "$MWLT" = "1" ]; then ok "ই২ই: ৩৬০px-ক্ষুদ্র-ভ্যারিয়েন্ট (max-width $MW360 < $MW390 — ফ্রেম-বহির্ভূত-নিষেধ-প্রমাণ)"; else bad "ই২ই: maxw360=$MW360 maxw390=$MW390"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: hr327-ই২ই (rich-প্রিভিউ→WYSIWYG→F-রিফ্রেশ→P-টগল→শূন্য-নীরব) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria327QA,o:window.__hrAria327QA?window.__hrAria327QA.opens:-1,c:window.__hrAria327QA?window.__hrAria327QA.closes:-1,e:((window.__hrAria327QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf o "$H0J")" = "0" ] && [ "$(jf c "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria327QA-হুক + opens=closes=০"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap327=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,pv:!!document.querySelector('.hr317-tip.is-on .hr327-pv'),ex:(document.querySelector('.hr317-tip.is-on .hr327-pv')||{}).getAttribute?document.querySelector('.hr317-tip.is-on .hr327-pv').getAttribute('aria-expanded'):'',kbd:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('P = প্রিভিউ')>=0})")
B1J=$(unjj "$B1")
if [ "$(jf h "$B1J")" = "2" ] && [ "$(jf pv "$B1J")" = "true" ] && [ "$(jf ex "$B1J")" = "false" ] && [ "$(jf kbd "$B1J")" = "true" ]; then ok "ই২ই: .hr327-pv-বাটন (aria-expanded=false) + kbd-হিন্ট (P = প্রিভিউ)"; else bad "ই২ই: $(unjj "$B1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
P1=$(ev "JSON.stringify({o:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),txt:(document.querySelector('.hr317-tip.is-on .hr327-pre .hr327-text')||{textContent:''}).textContent,mt:(document.querySelector('.hr317-tip.is-on .hr327-pre .hr327-meta')||{textContent:''}).textContent,ex:(document.querySelector('.hr317-tip.is-on .hr327-pv')||{getAttribute:function(){return ''}}).getAttribute('aria-expanded')})")
P1J=$(unjj "$P1")
if [ "$(jf o "$P1J")" = "1" ] && [ "$(jf pre "$P1J")" = "true" ] && [ "$(jf ex "$P1J")" = "true" ]; then ok "ই২ই: P-কী → প্রিভিউ-খোলা (opens=১ + aria-expanded=true)"; else bad "ই২ই: $(unjj "$P1")"; fi
PT=$(unjj "$(ev "JSON.stringify({s:window.__hrAria326QA.strip()})")")
if [ "$(jf txt "$P1J")" = "$(jf s "$PT")" ]; then ok "ই২ই: WYSIWYG-প্রমাণ (প্রিভিউ-পাঠ = strip324() অক্ষরে-অক্ষরে — rich-বিন্যাস)"; else bad "ই২ই: প্রিভিউ≠স্ট্রিপ"; fi
MT=$(printf '%s' "$(jf mt "$P1J")")
if printf '%s' "$MT" | grep -q 'লাইন' && printf '%s' "$MT" | grep -q 'অক্ষর' && printf '%s' "$MT" | grep -q 'সমৃদ্ধ'; then ok "ই২ই: .hr327-meta (লাইন·অক্ষর-গণনা বাংলা-অঙ্কে + বিন্যাস-লেবেল 'সমৃদ্ধ')"; else bad "ই২ই: meta=[$MT]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
F1=$(ev "JSON.stringify({mode:window.__hrAria326QA.mode(),pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),txt:(document.querySelector('.hr317-tip.is-on .hr327-pre .hr327-text')||{textContent:''}).textContent,mt:(document.querySelector('.hr317-tip.is-on .hr327-pre .hr327-meta')||{textContent:''}).textContent,kbdP:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('P = প্রিভিউ')>=0,kbdF:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('F = বিন্যাস')>=0})")
F1J=$(unjj "$F1")
STK=$(unjj "$(ev "JSON.stringify({s:window.__hrAria326QA.strip()})")")
if [ "$(jf mode "$F1J")" = "key" ] && [ "$(jf pre "$F1J")" = "true" ] && [ "$(jf txt "$F1J")" = "$(jf s "$STK")" ]; then ok "ই২ই: F-টগল → খোলা-প্রিভিউ-সমকালীন-রিফ্রেশ (key-বিন্যাসে — এক-উৎস-সম্মত)"; else bad "ই২ই: $(unjj "$F1")"; fi
if [ "$(jf mt "$F1J")" != "" ] && printf '%s' "$(jf mt "$F1J")" | grep -q 'কেবল-কী'; then ok "ই২ই: meta-লেবেল-সমকালীন-আপডেট ('কেবল-কী')"; else bad "ই২ই: meta=[$(jf mt "$F1J")]"; fi
if [ "$(jf kbdP "$F1J")" = "true" ] && [ "$(jf kbdF "$F1J")" = "true" ]; then ok "ই২ই: P-হিন্ট-সংরক্ষণ (cycleFmt326-kbd-পুনঃলেখনে P = প্রিভিউ-টিকে)"; else bad "ই২ই: kbdP=$(jf kbdP "$F1J") kbdF=$(jf kbdF "$F1J")"; fi
if agent-browser screenshot "$SH_PV" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-প্রিভিউ সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr327-pv');if(!b)return 'nb';b.click();return 'bc'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
BC=$(ev "JSON.stringify({c:window.__hrAria327QA.closes,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')})")
BCJ=$(unjj "$BC")
if [ "$(jf c "$BCJ")" = "1" ] && [ "$(jf pre "$BCJ")" = "false" ]; then ok "ই২ই: বাটন-ক্লিক → প্রিভিউ-বন্ধ (closes=১)"; else bad "ই২ই: $(unjj "$BC")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'P',bubbles:true,cancelable:true}));return 'p2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
P2=$(ev "JSON.stringify({o:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')})")
P2J=$(unjj "$P2")
if [ "$(jf o "$P2J")" = "2" ] && [ "$(jf pre "$P2J")" = "true" ]; then ok "ই২ই: P (বড়-হর) পুনঃখোলা (opens=২ — শিফট-সমতা)"; else bad "ই২ই: $(unjj "$P2")"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr327-pre');if(!b)return 'np';b.remove();window.__hrAria327QA.last='cleaned';return 'r1'})())" >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK2")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: পুনঃopen + USER_FEED-পুনঃনির্বাচন"; else bad "ই২ই: পুনঃনির্বাচন-রো-অনুপস্থিত"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd1'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd2'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1
Z1=$(ev "JSON.stringify((function(){var o=window.__hrAria327QA.opens;var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return {h:window.__hrAria317QA.hist().length,was:o,is:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')}})())")
Z1J=$(unjj "$Z1")
if [ "$(jf h "$Z1J")" = "0" ] && [ "$(jf was "$Z1J")" = "$(jf is "$Z1J")" ] && [ "$(jf pre "$Z1J")" = "false" ]; then ok "ই২ই: শূন্য-ইতিহাসে P-নীরব (Delete×২-পরিষ্কার + opens-অপরিবর্তিত + প্রিভিউ-অনুপস্থিত — hr323-দর্শন)"; else bad "ই২ই: $(unjj "$Z1")"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + সম-প্রদর্শন + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs327QA,err:(window.__sfs327QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs327QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M3=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$M3")" = "true" ] && [ "$(jf chipOn "$M3")" = "true" ] && [ "$(jf right "$M3")" = "72px" ]; then ok "মোবাইলে সম-প্রদর্শন-গাটার (right=৭২px — computed-প্রমাণ)"; else bad "মোবাইলে $(unjj "$M3")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s327-suite ✓ সর্ব-সবুজ"; else echo "s327-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
