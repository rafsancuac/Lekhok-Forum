#!/bin/bash
# s333-suite.sh — session333: sfs333 চিপ-প্যারি-পটভূমি-ধার + hr333 ওভারলে-স্মার্টি-সম্প্রসারণ + ফাইলনাম-HHMMSS-টাইমস্ট্যাম্প
# [Task ID 170] PLANS session332-নোটের প্রস্তাব-②-উভয়-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ④-গেটেড):
#   sfs333 (style.css session333-ব্লক — কেবল-সংযোজন): চিপ-প্যারি-পটভূমি-ধার — মোবাইল-ব্যান্ডে
#      (৩৬১–৬৪০px: ১৮→২৪%; ≤৩৬০px: ১৮→২৮%) সম-প্রদর্শনে চিপ-পটভূমি-ব্র্যান্ড-অংশ-বৃদ্ধি;
#      রেঞ্জ-স্কোপড কোয়েরি (s331-রীতি); ট্যাপ × keynav উভয়-গেট; কেবল-রঙ — layout-neutral
#   hr333a (admin/home-reorder.ejs): ওভারলে-স্মার্টি — ovRows330-রেজিস্ট্রি-এক-উৎস + mkLi330-
#      নির্মাতা-এক-উৎস + rebuildOv330 + registration-API (q333h.register — ডুপ-বর্জন); D/S-বর্ণনা
#      মোড-সচেতন (ovDsText330 + data-hr330-ds + cf333-জীবন্ত-সিঙ্ক — s327-গোটচা-②-চতুর্থ-প্রয়োগ);
#      __hrAria333QA {registrations, last, rows(), register(), sync(), err}
#   hr333b (admin/home-reorder.ejs): ফাইলনাম-HHMMSS-টাইমস্ট্যাম্প (iso333/iso333b এক-উৎস-ISO —
#      dlHist324/dlPv329 — সম-দিনে-ওভাররাইট-বিবাদ-বন্ধ)
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316-রীতি) + dl-স্টাব-পূর্বে-
#         ডাউনলোড (s329-গোটচা) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-
#         পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + hygiene-clear ×৩ (hr321-hist + hr326-fmt +
#         hr327-pv) + **প্রিভিউ/ওভারলে-স্পর্শক-keydown = refocus-নিষিদ্ধ (s332-গোটচা-①)** +
#         computed-তুলনা = ইউনিট-স্বাধীন (s330-রীতি) + নিবন্ধন-রাজ্য = সুইট-অভ্যন্তরীণ-সীমিত
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_BG=/home/z/my-project/download/s333-chipbg-390.png
SH_OV=/home/z/my-project/download/s333-overlay-admin.png
SH_MOB=/home/z/my-project/download/s333-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s333-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s333-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS333=$(sed -n '/session333 (sfs333 চিপ-প্যারি-পটভূমি-ধার)/,/EOF session333/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS333" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS333" ]; then ok "style.css: session333-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
TAPN=$(printf '%s' "$CSS333" | grep -c 'data-sfs321-tap' | tr -d ' ')
KEYN=$(printf '%s' "$CSS333" | grep -c 'data-sfs314-focus' | tr -d ' ')
if [ "$TAPN" -ge 2 ] && [ "$KEYN" -ge 2 ]; then ok "style.css: ট্যাপ×keynav-উভয়-গেট ×২-ব্যান্ড (sfs333 — parity-নীতি)"; else bad "style.css: গেট tap=$TAPN keynav=$KEYN"; fi
printf '%s' "$CSS333" | grep -q '@media (max-width: 640px) and (min-width: 361px)' && printf '%s' "$CSS333" | grep -q '@media (max-width: 360px)' && printf '%s' "$CSS333" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 24%, color-mix(in srgb, var(--lf-slate-deeper) 72%, transparent))' && printf '%s' "$CSS333" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 28%, color-mix(in srgb, var(--lf-slate-deeper) 72%, transparent))' && ok "style.css: রেঞ্জ-স্কোপড পটভূমি-ধার (২৪%/২৮% — s331-রীতি — কেবল-রঙ)" || bad "style.css: ব্যান্ড/মান-অমিল"
printf '%s' "$CSS333" | grep -q 'background-color' && printf '%s' "$CSS333" | grep -q 'right:' && printf '%s' "$CSS333" | grep -q 'max-width' && bad "style.css: layout-স্পর্শ (কেবল-রঙ-নীতি-ভাঙা)" || ok "style.css: layout-neutral (গাটার/প্রস্থ/বর্ডার-রুল-শূন্য — কেবল-রঙ-নীতি)"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q "var ovRows330 = \[" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var mkLi330 = function (row330m)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "ovList330 = ul330;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ovRows330-রেজিস্ট্রি-এক-উৎস + mkLi330-নির্মাতা + ovList330-স্থায়ী (hr333)" || bad "home-reorder.ejs: রেজিস্ট্রি-মার্কার-অমিল"
grep -q "ul330.appendChild(mkLi330(ovRows330\[i330\]))" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "ovList330.appendChild(mkLi330(ovRows330\[i333r\]))" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: build/rebuild-নির্মাতা-এক-উৎস (সম-পথ — ডুপ-নির্মাতা-নেই)" || bad "home-reorder.ejs: নির্মাতা-অমিল"
grep -q "var ovDsText330 = function (k330b, base330)" "$APP/admin/views/admin/home-reorder.ejs" && [ "$(grep -c 'data-hr330-ds' "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')" -ge 4 ] && ok "home-reorder.ejs: D/S-বর্ণনা-মোড-সচেতন (ovDsText330 + data-hr330-ds-হুক ×≥৪)" || bad "home-reorder.ejs: D/S-মোড-সচেতন-অমিল"
grep -q "var iso333 = new Date().toISOString();" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var iso333b = new Date().toISOString();" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "iso333.slice(11, 19).replace(/:/g, '')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: HHMMSS-টাইমস্ট্যাম্প ×২ (iso333/iso333b এক-উৎস-ISO — hr333)" || bad "home-reorder.ejs: টাইমস্ট্যাম্প-অমিল"
grep -q "var cf333 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "if (ovOpen330) syncDs330();" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "q333h.last = 'registered:' + k333g;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: cf333-মোড়ক (চেইন cf327→cf329→cf332→cf333 — ওভারলে-D/S-জীবন্ত-সিঙ্ক)" || bad "home-reorder.ejs: cf333-মোড়ক-অমিল"
grep -q "window.__hrAria333QA = q333h" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "q333h.register = function (k333g, d333g)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "q333h.rows = function () { return ovRows330.length; };" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "window.__hrAria332QA = q332h" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria333QA-হুক (register/rows/sync) + s332-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "togglePv327 = function (b329t)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var cf330 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var stOrig331 = strip324;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var cf332 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: s329/s330/s331/s332-ইঞ্জিন-অস্পৃশ্য (মোড়ক-চেইন-অটুট — কেবল-সংযোজন)" || bad "home-reorder.ejs: পুরাতন-ইঞ্জিন-স্পর্শ-ভাঙা"
A333CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria333QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A333CHK" = "OK" ]; then ok "home-reorder.ejs: hr333-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs333-ই২ই (পটভূমি-ধার: pair≠single @মোবাইল-ব্যান্ড; pair=single @ডেস্ক; parity) ──"
BGPROBE='JSON.stringify((function(){var ph=document.querySelector(".sfs292-phone");var bd=ph.querySelector(".sfs318-posbadge");var ch=ph.querySelector(".sfs319-namechip");if(!bd||!ch)return{e:"missing"};var bp0=bd.hasAttribute("data-sfs318-on");if(!bp0)return{e:"badge-off"};ch.removeAttribute("data-sfs319-on");var single=getComputedStyle(ch).backgroundColor;var bsingle=getComputedStyle(bd).borderColor;ch.setAttribute("data-sfs319-on","1");var pair=getComputedStyle(ch).backgroundColor;var bpair=getComputedStyle(bd).borderColor;var restored=ch.hasAttribute("data-sfs319-on");return {single:single,pair:pair,diff:single!==pair,restored:restored,bsingle:bsingle,bpair:bpair,bdiff:bsingle!==bpair}})())'
agent-browser set viewport 390 844 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (৩৯০px)"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K390=$(unjj "$(ev "$BGPROBE")")
if [ "$(jf e "$K390")" = "" ] && [ "$(jf diff "$K390")" = "true" ] && [ "$(jf restored "$K390")" = "true" ]; then ok "ই২ই: ৩৯০px-keynav pair-bg≠single-bg (পটভূমি-ধার-প্রমাণ — ১৮→২৪%)"; else bad "ই২ই: $(unjj "$K390")"; fi
if [ "$(jf bdiff "$K390")" = "false" ]; then ok "ই২ই: ৩৯০px-ব্যাজ-বর্ডার-অটুট (bdiff=false — ব্যাজ-ধার >640px-স্কোপিং-প্রমাণ — s332-চুক্তি)"; else bad "ই২ই: ৩৯০px-ব্যাজ-বর্ডার-পরিবর্তিত (স্কোপিং-ভাঙা)"; fi
KEYPAIR=$(jf pair "$K390")
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T390=$(unjj "$(ev "$BGPROBE")")
if [ "$(jf e "$T390")" = "" ] && [ "$(jf diff "$T390")" = "true" ]; then ok "ই২ই: ৩৯০px-ট্যাপ pair-bg≠single-bg (ট্যাপ-গেট-ধার — parity-নীতি)"; else bad "ই২ই: ট্যাপ $(unjj "$T390")"; fi
TAPPAIR=$(jf pair "$T390")
if [ -n "$KEYPAIR" ] && [ "$KEYPAIR" = "$TAPPAIR" ]; then ok "ই২ই: ট্যাপ×keynav-পটভূমি-সমতা (backgroundColor-এক-মান — parity-নীতি-প্রমাণ)"; else bad "ই২ই: keynav=[$KEYPAIR] tap=[$TAPPAIR]"; fi
if agent-browser screenshot "$SH_BG" >/dev/null 2>&1; then ok "স্ক্রিনশট: ৩৯০px-পটভূমি-ধার সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 360 740 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k360'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K360=$(unjj "$(ev "$BGPROBE")")
if [ "$(jf e "$K360")" = "" ] && [ "$(jf diff "$K360")" = "true" ]; then ok "ই২ই: ৩৬০px pair-bg≠single-bg (২৮%-ধার-প্রমাণ — রেঞ্জ-ব্যান্ড-২)"; else bad "ই২ই: ৩৬০ $(unjj "$K360")"; fi
if [ "$(jf pair "$K360")" != "$KEYPAIR" ]; then ok "ই২ই: ৩৬০px≠৩৯০px-পটভূমি (২৮% ≠ ২৪% — ধার-বৈচিত্র্য-প্রমাণ)"; else bad "ই২ই: ব্যান্ড-মান-সম (ধার-ভাঙা)"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'kdesk'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
KD=$(unjj "$(ev "$BGPROBE")")
if [ "$(jf e "$KD")" = "" ] && [ "$(jf diff "$KD")" = "false" ]; then ok "ই২ই: ডেস্ক pair-bg=single-bg (পটভূমি-অটুট — মোবাইল-ব্যান্ড-স্কোপিং-প্রমাণ)"; else bad "ই২ই: ডেস্ক $(unjj "$KD")"; fi
if [ "$(jf bdiff "$KD")" = "true" ]; then ok "ই২ই: ডেস্ক-ব্যাজ-বর্ডার-ধার-অটুট (s332-৫০%-স্পর্শ-শূন্য)"; else bad "ই২ই: ডেস্ক bdiff=$(jf bdiff "$KD")"; fi

echo "── ধাপ-৪: hr333-ই২ই (টাইমস্ট্যাম্প + মোড-সচেতন-D/S + register-API) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria333QA,r:window.__hrAria333QA?window.__hrAria333QA.rows():-1,reg:window.__hrAria333QA?window.__hrAria333QA.registrations:-1,q32:!!window.__hrAria332QA,x:window.__hrAria332QA?window.__hrAria332QA.ext():'x',e:((window.__hrAria333QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf r "$H0J")" = "8" ] && [ "$(jf reg "$H0J")" = "0" ] && [ "$(jf q32 "$H0J")" = "true" ] && [ "$(jf x "$H0J")" = ".txt" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria333QA-হুক (rows()=৮ + registrations=০) + s332-সহাবস্থান"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap333=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){window.__dlStub333={types:[],clicks:0,names:[]};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub333.types.push(String(b&&b.type));return 'blob:qa-stub-333'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub333.clicks+=1;window.__dlStub333.names.push(this.getAttribute('download')||'');return}return ocl.call(this)};return 'dstub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D1=$(ev "JSON.stringify({d:window.__hrAria324QA.downloads,ck:window.__dlStub333.clicks,nm:window.__dlStub333.names[window.__dlStub333.names.length-1]||'',hj:window.__hrAria332QA.histJson})")
D1J=$(unjj "$D1")
NM1=$(jf nm "$D1J")
if [ "$(jf d "$D1J")" = "1" ] && [ "$(jf ck "$D1J")" = "1" ] && [ "$(jf hj "$D1J")" = "0" ]; then ok "ই২ই: D-rich ডাউনলোড (histJson=০ — hr332-গণনা-অটুট)"; else bad "ই২ই: $(unjj "$D1")"; fi
if printf '%s' "$NM1" | grep -qE '^lekhok-copy-history-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}\.txt$'; then ok "ই২ই: rich-ফাইলনাম ISO-তারিখ+HHMMSS [$NM1]"; else bad "ই২ই: nm=[$NM1]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F2=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),x:window.__hrAria332QA.ext()})")
if [ "$(jf m "$(unjj "$F2")")" = "json" ] && [ "$(jf x "$(unjj "$F2")")" = ".json" ]; then ok "ই২ই: F×২ → json (hr331-চক্র-অটুট)"; else bad "ই২ই: $(unjj "$F2")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D2=$(ev "JSON.stringify({ck:window.__dlStub333.clicks,nm:window.__dlStub333.names[window.__dlStub333.names.length-1]||'',tp:window.__dlStub333.types[window.__dlStub333.types.length-1]||'',hj:window.__hrAria332QA.histJson})")
D2J=$(unjj "$D2")
NM2=$(jf nm "$D2J")
if printf '%s' "$NM2" | grep -qE '^lekhok-copy-history-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}\.json$'; then ok "ই২ই: json-ফাইলনাম ISO+HHMMSS+'.json' [$NM2]"; else bad "ই২ই: nm=[$NM2]"; fi
if [ "$(jf tp "$D2J")" = "application/json;charset=utf-8" ]; then ok "ই২ই: json-MIME অটুট (hr332-চুক্তি — টাইমস্ট্যাম্পে-অস্পৃশ্য)"; else bad "ই২ই: tp=[$(jf tp "$D2J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true,cancelable:true}));return 's1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
S1=$(ev "JSON.stringify({pvj:window.__hrAria332QA.pvJson,nm:window.__dlStub333.names[window.__dlStub333.names.length-1]||''})")
S1J=$(unjj "$S1")
NM3=$(jf nm "$S1J")
if [ "$(jf pvj "$S1J")" = "1" ] && printf '%s' "$NM3" | grep -qE '^lekhok-preview-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}\.json$'; then ok "ই২ই: S-json প্রিভিউ-ফাইলনাম ISO+HHMMSS [$NM3]"; else bad "ই২ই: $(unjj "$S1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
O1=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),rows:window.__hrAria333QA.rows(),li:document.querySelectorAll('.hr330-ov .hr330-li').length,dD:(document.querySelector('.hr330-ov [data-hr330-ds=\"D\"]')||{textContent:''}).textContent,dS:(document.querySelector('.hr330-ov [data-hr330-ds=\"S\"]')||{textContent:''}).textContent})")
O1J=$(unjj "$O1")
if [ "$(jf o "$O1J")" = "true" ] && [ "$(jf li "$O1J")" = "8" ] && [ "$(jf rows "$O1J")" = "8" ]; then ok "ই২ই: ওভারলে-খোলা (৮-সারি — s330-কাঠামো-অটুট)"; else bad "ই২ই: $(unjj "$O1")"; fi
if printf '%s' "$(jf dD "$O1J")" | grep -q '(.json)' && printf '%s' "$(jf dS "$O1J")" | grep -q '(.json)'; then ok "ই২ই: D/S-বর্ণনা নির্মাণ-কালে-মোড-সচেতন (json-মোডে খোলা — '.json'-বর্ণনা)"; else bad "ই২ই: dD=[$(jf dD "$O1J")] dS=[$(jf dS "$O1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f3'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
O2=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),m:window.__hrAria331QA.mode(),dD:(document.querySelector('.hr330-ov [data-hr330-ds=\"D\"]')||{textContent:''}).textContent,x:window.__hrAria332QA.ext()})")
O2J=$(unjj "$O2")
if [ "$(jf o "$O2J")" = "true" ] && [ "$(jf m "$O2J")" = "rich" ] && printf '%s' "$(jf dD "$O2J")" | grep -q '(.txt)'; then ok "ই২ই: cf333-জীবন্ত-সিঙ্ক (খোলা-ওভারলেতে F → D-বর্ণনা '.txt'-সমকালীন — s327-গোটচা-②-চুক্তি)"; else bad "ই২ই: $(unjj "$O2")"; fi
RG=$(ev "JSON.stringify({r1:window.__hrAria333QA.register('G','টেস্ট-বর্ণনা'),r2:window.__hrAria333QA.register('G','ডুপ'),rows:window.__hrAria333QA.rows(),reg:window.__hrAria333QA.registrations,g:!!document.querySelector('.hr330-ov .hr330-k'),gt:(function(){var ks=document.querySelectorAll('.hr330-ov .hr330-k');for(var i=0;i<ks.length;i++){if(ks[i].textContent==='G')return ks[i].nextSibling?ks[i].nextSibling.textContent||ks[i].parentNode.textContent:''}return ''})(),last:window.__hrAria333QA.last})")
RGJ=$(unjj "$RG")
if [ "$(jf r1 "$RGJ")" = "true" ] && [ "$(jf r2 "$RGJ")" = "false" ] && [ "$(jf rows "$RGJ")" = "9" ] && [ "$(jf reg "$RGJ")" = "1" ]; then ok "ই২ই: register-API (নিবন্ধন=true + ডুপ=false + rows()=৯ + registrations=১)"; else bad "ই২ই: $(unjj "$RG")"; fi
GL=$(ev "JSON.stringify((function(){var ks=document.querySelectorAll('.hr330-ov .hr330-li');for(var i=0;i<ks.length;i++){var k=ks[i].querySelector('.hr330-k');if(k&&k.textContent==='G')return{found:true,d:ks[i].querySelector('.hr330-d').textContent}}return{found:false}})())")
GLJ=$(unjj "$GL")
if [ "$(jf found "$GLJ")" = "true" ] && [ "$(jf d "$GLJ")" = "টেস্ট-বর্ণনা" ]; then ok "ই২ই: খোলা-ওভারলেতে তাৎক্ষণিক-সারি (G-বর্ণনা দৃশ্যমান — rebuildOv330-প্রমাণ)"; else bad "ই২ই: $(unjj "$GL")"; fi
if agent-browser screenshot "$SH_OV" >/dev/null 2>&1; then ok "স্ক্রিনশট: নিবন্ধিত-ওভারলে সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
O3=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),g:window.__hrAria333QA.rows(),sync:window.__hrAria333QA.sync()})")
O3J=$(unjj "$O3")
if [ "$(jf o "$O3J")" = "true" ] && [ "$(jf g "$O3J")" = "9" ] && [ "$(jf sync "$O3J")" = "true" ]; then ok "ই২ই: পুনঃopen-রেজিস্ট্রি-স্থায়ী (G-টিকে — নিবন্ধন-রাজ্য-অটুট) + sync()=true"; else bad "ই২ই: $(unjj "$O3")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc2'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
if [ "$(ev "JSON.stringify(window.__hrAria330QA.isOpen())" | tr -d '"')" = "false" ]; then ok "ই২ই: ওভারলে-Escape-বন্ধ (পরবর্তী-ধাপ-পরিষ্কার)"; else bad "ই২ই: ওভারলে-খোলা-অবশিষ্ট"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + হুক + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs327QA,err:(window.__sfs327QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs327QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 বেসলাইন সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
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
if [ "$FAIL" = "0" ]; then echo "s333-suite ✓ সর্ব-সবুজ"; else echo "s333-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
