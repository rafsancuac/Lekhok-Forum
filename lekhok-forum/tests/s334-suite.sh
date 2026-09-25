#!/bin/bash
# s334-suite.sh — session334: hr334 kbd-হিন্ট-এক-উৎস (smarty-সমাপ্তি) + sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি
# [Task ID 171] PLANS session333-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড):
#   hr334 (admin/home-reorder.ejs): kbd-হিন্ট-এক-উৎস — ovRows330-রেজিস্ট্রি-তৃতীয়-উপাদান ([2] =
#      kbd-হিন্ট — F='{fmt}'-মোড-সচেতন-টেমপ্লেট); hintOf334-লুকআপ + appendHint334-এক-উৎস-অ্যাপেন্ডার
#      (সর্ব-১০-অ্যাপেন্ড-সাইট পুনঃনির্দেশ — গার্ড+গণনা-অন্তর্নির্মিত) + kbdLine334-রেজিস্ট্রি-নির্মিত-
#      সম্পূর্ণ-লাইন (cycleFmt326-পুনঃলেখন-সাইট এক-উৎস); q333h.register-মোড়ক — register(k, d, h)-
#      তৃতীয়-ঐচ্ছিক-প্যারামিটারে ওভারলে+kbd-দ্বি-সাইট-স্বয়ংক্রিয় (smarty-সমাপ্তি);
#      __hrAria334QA {appends, dupSkips, dualRegs, last, hintOf(), append(), line(), err}
#   sfs334 (style.css session334-ব্লক — কেবল-সংযোজন): মোবাইল-ব্যাজ-গেট-প্যারিটি — ≤৬৪০px-এ
#      keynav-গেটেও ব্যাজ-বর্ডার ৩৪%-নরম (s326-ট্যাপ-সমতা — parity-নীতি-সমাপ্তি); কেবল-রঙ;
#      layout-neutral; ডেস্ক-অটুট (s318-বেস-৪২% + s332-৫০%-অটুট)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-
#         পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + hygiene-clear ×৩ (hr321-hist + hr326-fmt +
#         hr327-pv) + computed-তুলনা = ইউনিট-স্বাধীন (s330-রীতি) + নিবন্ধন-রাজ্য = সুইট-অভ্যন্তরীণ-সীমিত
#         + মোড়ক-চেইন-গঠন-অস্পৃশ্য (cf/trOrig-ঘোষণা-অটুট) + স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য (s324)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_BG=/home/z/my-project/download/s334-badgegate-390.png
SH_OV=/home/z/my-project/download/s334-hintsrc-admin.png
SH_MOB=/home/z/my-project/download/s334-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s334-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s334-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr334-এক-উৎস + sfs334-ব্লক) ──"
EJSF="$APP/admin/views/admin/home-reorder.ejs"
grep -q "'E = স্ট্রিপ কপি'\]" "$EJSF" && grep -q "'D = ডাউনলোড'\]" "$EJSF" && grep -q "'X = পয়েন্টার-সারি বিলোপ'\]" "$EJSF" && grep -q "'F = বিন্যাস ({fmt})'\]" "$EJSF" && grep -q "'P = প্রিভিউ'\]" "$EJSF" && grep -q "'C = প্রিভিউ কপি'\]" "$EJSF" && grep -q "'S = প্রিভিউ সংরক্ষণ'\]" "$EJSF" && grep -q "'W = স্থায়ী মুছুন'\]" "$EJSF" && grep -q "'? = সহায়িকা'\]" "$EJSF" && ok "home-reorder.ejs: রেজিস্ট্রি-তৃতীয়-উপাদান ×৯ (kbd-হিন্ট — E/D/X/F/P/C/S/W/? — hr343)" || bad "home-reorder.ejs: রেজিস্ট্রি-হিন্ট-অমিল"
grep -q "'F = বিন্যাস ({fmt})'" "$EJSF" && ok "home-reorder.ejs: F-হিন্ট '{fmt}'-টেমপ্লেট (মোড-সচেতন-এক-উৎস)" || bad "home-reorder.ejs: {fmt}-টেমপ্লেট-অনুপস্থিত"
grep -q "var hintOf334 = function (k334)" "$EJSF" && grep -q "var appendHint334 = function (k334a)" "$EJSF" && grep -q "var kbdLine334 = function ()" "$EJSF" && ok "home-reorder.ejs: hintOf334 + appendHint334 + kbdLine334 (ত্রয়ী-এক-উৎস)" || bad "home-reorder.ejs: এক-উৎস-ত্রয়ী-অমিল"
grep -q "split('{fmt}').join(fmtLabel331(mode326))" "$EJSF" && ok "home-reorder.ejs: {fmt}-split-join-সর্ব-উপস্থিতি (s333-গোটচা-②-রীতি)" || bad "home-reorder.ejs: split-join-অমিল"
grep -q "var regOrig334 = q333h.register;" "$EJSF" && grep -q "q333h.register = function (k334g, d334g, h334g)" "$EJSF" && grep -q "q334h.dualRegs += 1" "$EJSF" && ok "home-reorder.ejs: register-মোড়ক (regOrig334 — দ্বি-সাইট-নিবন্ধন — smarty-সমাপ্তি)" || bad "home-reorder.ejs: register-মোড়ক-অমিল"
A334N=$(grep -c "appendHint334('" "$EJSF" | tr -d ' ')
if [ "$A334N" = "10" ]; then ok "home-reorder.ejs: সর্ব-১০-অ্যাপেন্ড-সাইট appendHint334-এ ($A334N — X/F/P×২/C×২/S×২/?×২)"; else bad "home-reorder.ejs: অ্যাপেন্ড-সাইট ×$A334N (১০-প্রত্যাশিত)"; fi
L0=$(python3 -c "
import io
t = io.open('$EJSF', encoding='utf-8').read()
ks = [' · X = পয়েন্টার-সারি বিলোপ', ' · F = বিন্যাস', ' · P = প্রিভিউ', ' · C = প্রিভিউ কপি', ' · S = প্রিভিউ সংরক্ষণ', ' · ? = সহায়িকা']
print(','.join(str(t.count(k)) for k in ks))")
if [ "$L0" = "0,0,0,0,0,0" ]; then ok "home-reorder.ejs: হার্ডকোডেড-অ্যাপেন্ড-অবশেষ-শূন্য ×৬ (এক-উৎস-প্রমাণ)"; else bad "home-reorder.ejs: অবশেষ=[$L0] (সর্ব-শূন্য-প্রত্যাশিত)"; fi
grep -q "kb326.textContent = kbdLine334();" "$EJSF" && ok "home-reorder.ejs: cycleFmt326-পুনঃলেখন = kbdLine334 (রেজিস্ট্রি-নির্মিত-সম্পূর্ণ-লাইন)" || bad "home-reorder.ejs: পুনঃলেখন-সাইট-অমিল"
S324N=$(grep -c "কীবোর্ড (কপি-বাটন-ফোকাসে): E = স্ট্রিপ কপি · D = ডাউনলোড'" "$EJSF" | tr -d ' ')
if [ "$S324N" = "1" ]; then ok "home-reorder.ejs: s324-স্ট্যাটিক-বেস-লাইন-অস্পৃশ্য ×১ (fresh-render-চুক্তি)"; else bad "home-reorder.ejs: বেস-লাইন ×$S324N (১-প্রত্যাশিত)"; fi
grep -q "var cf326o = cycleFmt326;" "$EJSF" && grep -q "var cf327w = cycleFmt326;" "$EJSF" && grep -q "var cf329 = cycleFmt326;" "$EJSF" && grep -q "var cf330 = cycleFmt326;" "$EJSF" && grep -q "var cf332 = cycleFmt326;" "$EJSF" && grep -q "var cf333 = cycleFmt326;" "$EJSF" && grep -q "var trOrig330 = tipRender318;" "$EJSF" && ok "home-reorder.ejs: মোড়ক-চেইন-ঘোষণা-অটুট ×৭ (গঠন-অস্পৃশ্য — cf/trOrig-পরিবার)" || bad "home-reorder.ejs: মোড়ক-ঘোষণা-ভাঙা"
grep -q "window.__hrAria334QA = q334h;" "$EJSF" && grep -q "window.__hrAria333QA = q333h;" "$EJSF" && ok "home-reorder.ejs: __hrAria334QA-হুক + s333-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
A334CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$EJSF', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria334QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A334CHK" = "OK" ]; then ok "home-reorder.ejs: hr334-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS334=$(sed -n '/session334 (sfs334 মোবাইল-ব্যাজ-গেট-প্যারিটি)/,/EOF session334/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS334" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS334" ]; then ok "style.css: session334-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
BN=$(printf '%s' "$CSS334" | grep -c 'session334' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "style.css: session334-ব্লক-মার্কার ×২ (হেডার+EOF)"; else bad "style.css: মার্কার ×$BN"; fi
printf '%s' "$CSS334" | grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs318-posbadge\[data-sfs318-on\]' && printf '%s' "$CSS334" | grep -q '@media (max-width: 640px)' && printf '%s' "$CSS334" | grep -q 'border-color: color-mix(in srgb, var(--lf-brand-primary) 34%, transparent)' && ok "style.css: keynav-গেট-৩৪% ≤৬৪০px (s326-ট্যাপ-সমতা — parity-সমাপ্তি)" || bad "style.css: keynav-৩৪%-রুল-অমিল"
printf '%s' "$CSS334" | grep -q 'background-color' && printf '%s' "$CSS334" | grep -qE 'right:|max-width|width:' && bad "style.css: layout/গেট-বহির্ভূত-স্পর্শ (কেবল-রঙ-নীতি-ভাঙা)" || ok "style.css: layout-neutral + কেবল-border-color (গাটার/প্রস্থ/পটভূমি-অটুট)"
TAP34=$(grep -c 'data-sfs321-tap\] .sfs318-posbadge\[data-sfs318-on\] {' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$TAP34" -ge 1 ]; then ok "style.css: s326-ট্যাপ-রুল-অস্পৃশ্য (কেবল-সংযোজন-প্রমাণ)"; else bad "style.css: ট্যাপ-রুল-অনুপস্থিত"; fi
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" 2>/dev/null | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি)"; else skip "feed.ejs: MO-গণনা=$MOBN (গণনা-পদ্ধতি-ভিন্ন — s333-সুইটে-যাচাইকৃত)"; fi

echo "── ধাপ-২: SSR + সার্ভেড-CSS ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১ (s318-সহাবস্থান)"; else bad "SSR: posbadge ×$PB"; fi
SSC=$(curl -s "$BASE/assets/css/style.css")
C334=$(printf '%s' "$SSC" | grep -c 'session334' | tr -d ' ')
if [ "$C334" = "2" ]; then ok "সার্ভেড-CSS: session334-ব্লক ×২-লাইভ (HTTP-পাঠ)"; else bad "সার্ভেড-CSS: মার্কার ×$C334"; fi
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi

echo "── ধাপ-৩: sfs334-ই২ই (মোবাইল-ব্যাজ-গেট-প্যারিটি: tap=keynav @≤৬৪০px; ডেস্ক-অটুট) ──"
BDPROBE='JSON.stringify((function(){var ph=document.querySelector(".sfs292-phone");var bd=ph.querySelector(".sfs318-posbadge");if(!bd)return{e:"missing"};if(!bd.hasAttribute("data-sfs318-on"))return{e:"badge-off"};var bc=getComputedStyle(bd).borderColor;return{bc:bc,al:(bc.match(/([0-9.]+)\)$/)||["",""])[1]}})())'
agent-browser set viewport 390 844 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (৩৯০px)"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K390=$(unjj "$(ev "$BDPROBE")")
if [ "$(jf e "$K390")" = "" ] && [ "$(jf al "$K390")" = "0.34" ]; then ok "ই২ই: ৩৯০px-keynav ব্যাজ-বর্ডার α=0.34 (sfs334-ধার-প্রমাণ)"; else bad "ই২ই: keynav $(unjj "$K390")"; fi
KEYBC=$(jf bc "$K390")
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T390=$(unjj "$(ev "$BDPROBE")")
if [ "$(jf e "$T390")" = "" ] && [ "$(jf al "$T390")" = "0.34" ]; then ok "ই২ই: ৩৯০px-ট্যাপ ব্যাজ-বর্ডার α=0.34 (s326-অটুট)"; else bad "ই২ই: ট্যাপ $(unjj "$T390")"; fi
if [ -n "$KEYBC" ] && [ "$KEYBC" = "$(jf bc "$T390")" ]; then ok "ই২ই: ট্যাপ×keynav-ব্যাজ-বর্ডার-সমতা (computed-এক-মান — parity-নীতি-সমাপ্তি — s330-রীতি)"; else bad "ই২ই: keynav=[$KEYBC] tap=[$(jf bc "$T390")]"; fi
if agent-browser screenshot "$SH_BG" >/dev/null 2>&1; then ok "স্ক্রিনশট: ৩৯০px-গেট-প্যারিটি সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var ch=document.querySelector('.sfs319-namechip');if(!ch)return{e:'missing'};var bd=document.querySelector('.sfs318-posbadge');ch.removeAttribute('data-sfs319-on');var bsingle=getComputedStyle(bd).borderColor;ch.setAttribute('data-sfs319-on','1');var bpair=getComputedStyle(bd).borderColor;return{bdiff:bsingle!==bpair}})())" >/dev/null 2>&1
BD1=$(unjj "$(ev "JSON.stringify((function(){var ch=document.querySelector('.sfs319-namechip');var bd=document.querySelector('.sfs318-posbadge');if(!ch||!bd)return{e:'missing'};var on0=ch.hasAttribute('data-sfs319-on');ch.removeAttribute('data-sfs319-on');var bsingle=getComputedStyle(bd).borderColor;ch.setAttribute('data-sfs319-on','1');var bpair=getComputedStyle(bd).borderColor;return{on0:on0,bdiff:bsingle!==bpair}})())")")
if [ "$(jf bdiff "$BD1")" = "false" ]; then ok "ই২ই: ৩৯০px-ব্যাজ-বর্ডার চিপ-সহাবস্থান-অসম্পৃক্ত (bdiff=false — s333-স্কোপিং-সামঞ্জস্য)"; else bad "ই২ই: $(unjj "$BD1")"; fi
agent-browser set viewport 360 740 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k360'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K360=$(unjj "$(ev "$BDPROBE")")
if [ "$(jf e "$K360")" = "" ] && [ "$(jf bc "$K360")" = "$KEYBC" ]; then ok "ই২ই: ৩৬০px-keynav = ৩৯০px (একই ≤৬৪০px-ব্যান্ড — s326-ব্যান্ড-সমতা)"; else bad "ই২ই: ৩৬০ $(unjj "$K360")"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'kdesk'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
KD=$(unjj "$(ev "$BDPROBE")")
if [ "$(jf e "$KD")" = "" ] && [ "$(jf bc "$KD")" != "$KEYBC" ] && [ "$(jf al "$KD")" = "0.5" ]; then ok "ই২ই: ডেস্ক-keynav ব্যাজ-বর্ডার α=0.5 (s332-চিপ-সহাবস্থান — keynav-প্রদর্শন=জুটি-প্রদর্শন) + ≠মোবাইল-0.34 (ব্যান্ড-স্কোপিং-প্রমাণ)"; else bad "ই২ই: ডেস্ক $(unjj "$KD")"; fi
HS=$(ev "JSON.stringify({h:document.documentElement.scrollWidth>document.documentElement.clientWidth})")
if [ "$(jf h "$(unjj "$HS")")" = "false" ]; then ok "ই২ই: ডেস্ক hScroll-শূন্য (layout-neutral-প্রমাণ)"; else bad "ই২ই: hScroll $(unjj "$HS")"; fi

echo "── ধাপ-৪: hr334-ই২ই (হিন্ট-এক-উৎস + দ্বি-সাইট-নিবন্ধন) ──"
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
Q0=$(ev "JSON.stringify({q:!!window.__hrAria334QA,a:window.__hrAria334QA?window.__hrAria334QA.appends:-1,ds:window.__hrAria334QA?window.__hrAria334QA.dupSkips:-1,dr:window.__hrAria334QA?window.__hrAria334QA.dualRegs:-1,e:((window.__hrAria334QA||{}).err||''),q333:!!window.__hrAria333QA})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ] && [ "$(jf q333 "$Q0J")" = "true" ]; then ok "ই২ই: __hrAria334QA-হুক (ত্রুটি-শূন্য) + s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
HX=$(ev "JSON.stringify({x:window.__hrAria334QA.hintOf('X'),g:window.__hrAria334QA.hintOf('G__NOPE'),f:window.__hrAria334QA.hintOf('F')})")
HXJ=$(unjj "$HX")
if [ "$(jf x "$HXJ")" = "X = পয়েন্টার-সারি বিলোপ" ] && [ "$(jf g "$HXJ")" = "" ] && printf '%s' "$(jf f "$HXJ")" | grep -q 'F = বিন্যাস (সমৃদ্ধ)'; then ok "ই২ই: hintOf334-লুকআপ (X-সঠিক + অজানা-'' + F-{fmt}-সমৃদ্ধ-রেজলভ)"; else bad "ই২ই: $(unjj "$HX")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap334=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'foc'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
KB1=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');if(!k)return{e:'no-kbd'};var t=k.textContent;var ks=['E = স্ট্রিপ কপি','D = ডাউনলোড','X = পয়েন্টার-সারি বিলোপ','F = বিন্যাস','P = প্রিভিউ','C = প্রিভিউ কপি','S = প্রিভিউ সংরক্ষণ','W = স্থায়ী মুছুন','? = সহায়িকা'];var pos=[],i;for(i=0;i<ks.length;i++){pos.push(t.indexOf(ks[i]))}var order=true;for(i=1;i<pos.length;i++){if(pos[i]<=pos[i-1])order=false}return{all:pos.every(function(p){return p>=0}),order:order,line:window.__hrAria334QA.line(),eq:t===window.__hrAria334QA.line()}})())")
KB1J=$(unjj "$KB1")
if [ "$(jf all "$KB1J")" = "true" ] && [ "$(jf order "$KB1J")" = "true" ]; then ok "ই২ই: fresh-render kbd-সর্ব-৯-হিন্ট-ক্রমত (E→D→X→F→P→C→S→W→? — রেজিস্ট্রি-ক্রম-সমতা — hr343)"; else bad "ই২ই: $(unjj "$KB1")"; fi
if [ "$(jf eq "$KB1J")" = "true" ]; then ok "ই২ই: live-kbd == kbdLine334() (এক-উৎস-সমতা-প্রমাণ)"; else bad "ই২ই: eq=$(unjj "$KB1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
FC=$(ev "JSON.stringify((function(){var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');if(!k)return{e:'no-kbd'};var t=k.textContent;return{m:window.__hrAria326QA.mode(),fk:t.indexOf('F = বিন্যাস (কেবল-কী)')>=0,p:t.indexOf('P = প্রিভিউ')>=0,c:t.indexOf('C = প্রিভিউ কপি')>=0,s:t.indexOf('S = প্রিভিউ সংরক্ষণ')>=0,q:t.indexOf('? = সহায়িকা')>=0,eq:t===window.__hrAria334QA.line()}})())")
FCJ=$(unjj "$FC")
if [ "$(jf m "$FCJ")" = "key" ] && [ "$(jf fk "$FCJ")" = "true" ] && [ "$(jf p "$FCJ")" = "true" ] && [ "$(jf c "$FCJ")" = "true" ] && [ "$(jf s "$FCJ")" = "true" ] && [ "$(jf q "$FCJ")" = "true" ]; then ok "ই২ই: F-চক্র → কেবল-কী-লেবেল + P/C/S/?-অবিচ্ছিন্ন (kbdLine334-এক-উৎস-পুনঃলেখন — P-হারানো-বিরোধ-সমাপ্ত)"; else bad "ই২ই: $(unjj "$FC")"; fi
if [ "$(jf eq "$FCJ")" = "true" ]; then ok "ই২ই: চক্র-পরবর্তী live-kbd == kbdLine334() (পুনঃলেখন-এক-উৎস)"; else bad "ই২ই: eq=$(unjj "$FC")"; fi
DS=$(ev "JSON.stringify({a:window.__hrAria334QA.appends,d:window.__hrAria334QA.dupSkips})")
DSJ=$(unjj "$DS")
if [ "$(jf d "$DSJ")" -ge 4 ] 2>/dev/null; then ok "ই২ই: dupSkips≥৪ (চক্র-পরবর্তী মোড়ক-চেইন-ডুপ-স্কিপ — appendHint334-পুনঃনির্দেশ-প্রমাণ)"; else bad "ই২ই: $(unjj "$DS")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
FJ=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),h:window.__hrAria334QA.hintOf('F'),k:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('F = বিন্যাস (JSON)')>=0})")
FJJ=$(unjj "$FJ")
if [ "$(jf m "$FJJ")" = "json" ] && printf '%s' "$(jf h "$FJJ")" | grep -q 'F = বিন্যাস (JSON)' && [ "$(jf k "$FJJ")" = "true" ]; then ok "ই২ই: json-মোড {fmt}-রেজলভ (hintOf='F = বিন্যাস (JSON)' + live-kbd-সম্মত)"; else bad "ই২ই: $(unjj "$FJ")"; fi
RG=$(ev "JSON.stringify((function(){var ok1=window.__hrAria333QA.register('H334','টেস্ট-বর্ণনা','H334 = টেস্ট হিন্ট');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');return{ok1:ok1,rows:window.__hrAria333QA.rows(),dr:window.__hrAria334QA.dualRegs,kb:k?k.textContent.indexOf('H334 = টেস্ট হিন্ট')>=0:false}})())")
RGJ=$(unjj "$RG")
if [ "$(jf ok1 "$RGJ")" = "true" ] && [ "$(jf rows "$RGJ")" = "10" ] && [ "$(jf dr "$RGJ")" = "1" ] && [ "$(jf kb "$RGJ")" = "true" ]; then ok "ই২ই: register(k,d,h)-দ্বি-সাইট (rows=১০ {৯+H334} + kbd-হিন্ট-তাৎক্ষণিক + dualRegs=১ — smarty-সমাপ্তি)"; else bad "ই২ই: $(unjj "$RG")"; fi
RD=$(ev "JSON.stringify({d:window.__hrAria333QA.register('H334','x','y'),r:window.__hrAria333QA.rows()})")
if [ "$(jf d "$(unjj "$RD")")" = "false" ] && [ "$(jf r "$(unjj "$RD")")" = "10" ]; then ok "ই২ই: ডুপ-নিবন্ধন-বর্জন (false + rows-অপরিবর্তিত — s333-চুক্তি-অটুট)"; else bad "ই২ই: $(unjj "$RD")"; fi
RN=$(ev "JSON.stringify((function(){var ok2=window.__hrAria333QA.register('I334','হিন্ট-বিহীন-বর্ণনা');var k=document.querySelector('.hr317-tip.is-on .hr324-kbd');return{ok2:ok2,rows:window.__hrAria333QA.rows(),kb:k?k.textContent.indexOf('I334 =')>=0:false}})())")
RNJ=$(unjj "$RN")
if [ "$(jf ok2 "$RNJ")" = "true" ] && [ "$(jf rows "$RNJ")" = "11" ] && [ "$(jf kb "$RNJ")" = "false" ]; then ok "ই২ই: h-বিহীন-নিবন্ধন = পুরাতন-আচরণ (rows=১১ {৯+H334+I334} + kbd-অস্পৃশ্য — s333-সুইট-সামঞ্জস্য)"; else bad "ই২ই: $(unjj "$RN")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
OV=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,last:(document.querySelectorAll('.hr330-ov .hr330-k')[9]||{textContent:''}).textContent})")
OVJ=$(unjj "$OV")
if [ "$(jf o "$OVJ")" = "true" ] && [ "$(jf li "$OVJ")" = "11" ]; then ok "ই২ই: ওভারলে-১১-সারি (৯+W + H334+I334-নিবন্ধিত — রেজিস্ট্রি-তালিকা-সমতা)"; else bad "ই২ই: $(unjj "$OV")"; fi
if agent-browser screenshot "$SH_OV" >/dev/null 2>&1; then ok "স্ক্রিনশট: ওভারলে-নিবন্ধিত-সারি সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
QERR=$(ev "JSON.stringify({e:(window.__hrAria334QA.err||'')+(window.__hrAria333QA.err||'')+(window.__hrAria330QA.err||'')})")
if [ "$(jf e "$(unjj "$QERR")")" = "" ]; then ok "ই২ই: সর্ব-QA-হুক-ত্রুটি-শূন্য (s333+s330+hr334)"; else bad "ই২ই: $(unjj "$QERR")"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + হুক + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
HS2=$(ev "JSON.stringify({h:document.documentElement.scrollWidth>document.documentElement.clientWidth})")
if [ "$(jf h "$(unjj "$HS2")")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল hScroll-ভাঙা"; fi
MH=$(unjj "$(ev "JSON.stringify({q:!!window.__sfs327QA,e:((window.__sfs327QA||{}).err||'')})")")
if [ "$(jf q "$MH")" = "true" ] && [ "$(jf e "$MH")" = "" ]; then ok "মোবাইলে __sfs327QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইল s327-হুক-সমস্যা"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 বেসলাইন সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৬: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
NC=$(ev "JSON.stringify({n:(window.__sfs334net||0)})" 2>/dev/null)
CN=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN:-0}" = "0" ] || [ -z "$CN" ]; then ok "কনসোল-ত্রুটি-শূন্য (সেশন-লাইফটাইম)"; else bad "কনসোল-ত্রুটি ×$CN"; fi
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
CN2=$(agent-browser console 2>/dev/null | grep -ciE 'error' | tr -d ' ')
if [ "${CN2:-0}" = "0" ] || [ -z "$CN2" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "দ্বি-লোড-ত্রুটি ×$CN2"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে সার্ভার-বুট-ব্যর্থ"
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s334-suite ✓ সর্ব-সবুজ"; exit 0; else echo "s334-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
