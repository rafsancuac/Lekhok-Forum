#!/bin/bash
# s332-suite.sh — session332: sfs332 ডেস্ক-সম-প্রদর্শন-ব্যাজ-টোন-ধার + hr332 ডাউনলোড-ফাইলনাম-এক্সটেনশন-সমন্বয়
# [Task ID 169] PLANS session331-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-স্থায়ী-স্থগিত; ④-গেটেড):
#   sfs332 (style.css session332-ব্লক — কেবল-সংযোজন): প্যারি-টোন-সমাপ্তি — টোন-সিঁড়ি
#      (৪৬→৫৮→৬২→৬৬%) এ-পর্যন্ত কেবল-চিপে; ডেস্ক-ব্যান্ডে (>৬৪০px) সম-প্রদর্শনে (chip-on)
#      ব্যাজ-বর্ডার ৪২→৫০% — জুটি-এক-টোন-পাঠ (parity-নীতি); :has()-নির্ভর (গ্রেসফুল-অবনমন);
#      কেবল->৬৪০px — s326-এর ≤640px-ট্যাপ-৩৪%-রুল-স্পর্শ-শূন্য; ট্যাপ × keynav উভয়-গেট-সম-মান;
#      কেবল-রঙ (border-color) — layout-neutral
#   hr332 (admin/home-reorder.ejs): ডাউনলোড-ফাইলনাম-এক্সটেনশন-সমন্বয় — json-মোডে D/S
#      '.json'-এক্সটেনশন + application/json;charset=utf-8-MIME; অ-জসন-মোডে '.txt'-অটুট;
#      dlHist324/dlPv329-ফাইলনাম-সাইট-দ্বয় (ইন-প্লেস-ন্যূনতম-সম্পাদনা — ex332a/ex332b);
#      aria-label-মোড-সম্মত (নির্মাণ-কালে) + জীবন্ত-সিঙ্ক (cf332-মোড়ক — cf327→cf329→cf332);
#      __hrAria332QA {histJson, pvJson, last, ext(), err} — সারি-শূন্যে-ও-সংজ্ঞায়িত
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316/s324/s327/s328/s330/s331) +
#         dl-স্টাব-পূর্বে-ডাউনলোড (s329-গোটচা) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য +
#         নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd + গেট-সমাপ্তি-wait +
#         hygiene-clear ×৩ (hr321-hist + hr326-fmt + hr327-pv — নতুন-কী-নেই) +
#         computed-borderColor = ইউনিট-স্বাধীন-তুলনা (সম-ব্রাউজার-রেন্ডার — s330-রীতি) +
#         chip-on-অস্থায়ী-অপসারণ-প্রোব (pair/single-তুলনা — অবস্থায়ন-পুনঃস্থাপন-সহ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_PAIR=/home/z/my-project/download/s332-badgepair-desk.png
SH_JSON=/home/z/my-project/download/s332-jsondl-admin.png
SH_MOB=/home/z/my-project/download/s332-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s332-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s332-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS332=$(sed -n '/session332 (sfs332 ডেস্ক-সম-প্রদর্শন-ব্যাজ-টোন-ধার)/,/EOF session332/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS332" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS332" ]; then ok "style.css: session332-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
HASN=$(printf '%s' "$CSS332" | grep -c ':has(' | tr -d ' ')
TAPN=$(printf '%s' "$CSS332" | grep -c 'data-sfs321-tap' | tr -d ' ')
KEYN=$(printf '%s' "$CSS332" | grep -c 'data-sfs314-focus' | tr -d ' ')
if [ "$HASN" -ge 2 ] && [ "$TAPN" -ge 1 ] && [ "$KEYN" -ge 1 ]; then ok "style.css: :has()-নির্ভর ট্যাপ×keynav-উভয়-গেট (sfs332 — parity-নীতি)"; else bad "style.css: :has=$HASN tap=$TAPN keynav=$KEYN"; fi
printf '%s' "$CSS332" | grep -q '@media (min-width: 641px)' && printf '%s' "$CSS332" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 50%, transparent)' && ok "style.css: ডেস্ক-ব্যান্ড-টোন-ধার (৪২→৫০% — >৬৪০px — s326-≤640px-রুল-স্পর্শ-শূন্য)" || bad "style.css: ৬৪১px-ব্যান্ড/৫০%-রুল-অমিল"
printf '%s' "$CSS332" | grep -q 'border-color' && printf '%s' "$CSS332" | grep -q 'right:' && printf '%s' "$CSS332" | grep -q 'max-width' && bad "style.css: layout-স্পর্শ (কেবল-রঙ-নীতি-ভাঙা)" || ok "style.css: layout-neutral (গাটার/প্রস্থ-রুল-শূন্য — কেবল-রঙ-নীতি)"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q "var ex332a = (mode326 === 'json') ? '.json' : '.txt';" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var ex332b = (mode326 === 'json') ? '.json' : '.txt';" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ex332a/ex332b-মোড-সম্মত-এক্সটেনশন (call-time-রেজলিউশন — dlHist324/dlPv329-সাইট-দ্বয়)" || bad "home-reorder.ejs: ex332-মার্কার-অমিল"
MJN=$(grep -c "'application/json;charset=utf-8' : 'text/plain;charset=utf-8'" "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$MJN" = "2" ]; then ok "home-reorder.ejs: application/json-MIME-টারনারি ×২ (D/S-সাইট-দ্বয় — hr332)"; else bad "home-reorder.ejs: MIME ×$MJN (প্রত্যাশা ২)"; fi
grep -q "a324.download = 'lekhok-copy-history-' + new Date().toISOString().slice(0, 10) + ex332a;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "a329.download = 'lekhok-preview-' + new Date().toISOString().slice(0, 10) + ex332b;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ফাইলনাম-সাইট-দ্বয় মোড-সম্মত ('.txt'-হার্ডকোড-মোছা)" || bad "home-reorder.ejs: ফাইলনাম-অমিল"
grep -q "bd324.setAttribute('aria-label', 'কপি-ইতিহাস ' + ((mode326 === 'json') ? '.json' : '.txt') + ' ফাইলে ডাউনলোড করুন');" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "bd329.setAttribute('aria-label', 'প্রিভিউ-বিষয়বস্তু ' + ((mode326 === 'json') ? '.json' : '.txt') + ' ফাইলে ডাউনলোড করুন (বর্তমান-বিন্যাসে)');" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: aria-label-নির্মাণ-কালে-মূল্যায়ন (মোড-সম্মত — s329-সুইট-সামঞ্জস্য: ডিফল্টে '.txt')" || bad "home-reorder.ejs: aria-label-অমিল"
grep -q "var cf332 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "cycleFmt326 = function (b332f)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "q332h.last = 'sync:' + ex332s;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: cf332-মোড়ক (চেইন cf327→cf329→cf332 — জীবন্ত-aria-সিঙ্ক — s327-গোটচা-②-চুক্তি)" || bad "home-reorder.ejs: cf332-মোড়ক-অমিল"
grep -q "window.__hrAria332QA = q332h" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "q332h.ext = function () { return (mode326 === 'json') ? '.json' : '.txt'; };" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "window.__hrAria331QA = q331h" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria332QA-হুক + s331-হুক-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "if (mode326 === 'json') q332h.histJson += 1;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "if (mode326 === 'json') q332h.pvJson += 1;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: json-ডাউনলোড-গণনা (q324h/q329h.downloads-অস্পৃশ্য — গণনা-সততা-চুক্তি)" || bad "home-reorder.ejs: json-গণনা-অমিল"
grep -q "togglePv327 = function (b329t)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var cf330 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var stOrig331 = strip324;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var cf329 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: s329/s330/s331-ইঞ্জিন-অস্পৃশ্য (মোড়ক-চেইন-অটুট — কেবল-সংযোজন)" || bad "home-reorder.ejs: পুরাতন-ইঞ্জিন-স্পর্শ-ভাঙা"
grep -q "(mode326 === 'rich') ? 'key' : (mode326 === 'key' ? 'json' : 'rich')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ত্রি-মোড-চক্র-অটুট (hr331-মালিকানা-এক-উৎস — স্পর্শ-শূন্য)" || bad "home-reorder.ejs: চক্র-কোর-অমিল"
A332CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria332QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A332CHK" = "OK" ]; then ok "home-reorder.ejs: hr332-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs332-ই২ই (ডেস্ক-ব্যাজ-টোন-ধার: pair≠single @>640px; pair=single @≤640px; parity) ──"
PAIRPROBE='JSON.stringify((function(){var ph=document.querySelector(".sfs292-phone");var bd=ph.querySelector(".sfs318-posbadge");var ch=ph.querySelector(".sfs319-namechip");if(!bd||!ch)return{e:"missing"};var bp0=bd.hasAttribute("data-sfs318-on"),cp0=ch.hasAttribute("data-sfs319-on");if(!bp0)return{e:"badge-off"};ch.removeAttribute("data-sfs319-on");var single=getComputedStyle(bd).borderColor;ch.setAttribute("data-sfs319-on","1");var pair=getComputedStyle(bd).borderColor;var restored=bd.hasAttribute("data-sfs318-on")&&ch.hasAttribute("data-sfs319-on");var chipPair=getComputedStyle(ch).borderColor;ch.removeAttribute("data-sfs319-on");var chipSingle=getComputedStyle(ch).borderColor;ch.setAttribute("data-sfs319-on","1");return {single:single,pair:pair,diff:single!==pair,restored:restored,chipPair:chipPair,chipSingle:chipSingle,chipDiff:chipPair!==chipSingle}})())'
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (ডেস্ক 1366px)"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'kdesk'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
KD=$(unjj "$(ev "$PAIRPROBE")")
if [ "$(jf e "$KD")" = "" ] && [ "$(jf diff "$KD")" = "true" ] && [ "$(jf restored "$KD")" = "true" ]; then ok "ই২ই: keynav-ডেস্ক pair≠single (ব্যাজ-টোন-ধার — ৪২→৫০% প্রমাণ)"; else bad "ই২ই: $(unjj "$KD")"; fi
if [ "$(jf chipDiff "$KD")" = "true" ]; then ok "ই২ই: চিপ-টোন-অটুট (pair≠single — s327/s328-৫৮%-স্পর্শ-শূন্য)"; else bad "ই২ই: chipDiff=$(jf chipDiff "$KD")"; fi
KEYPAIR=$(jf pair "$KD")
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
TD=$(unjj "$(ev "$PAIRPROBE")")
if [ "$(jf e "$TD")" = "" ] && [ "$(jf diff "$TD")" = "true" ]; then ok "ই২ই: ট্যাপ-ডেস্ক pair≠single (ট্যাপ-গেট-ধার — parity-নীতি)"; else bad "ই২ই: ট্যাপ $(unjj "$TD")"; fi
TAPPAIR=$(jf pair "$TD")
if [ -n "$KEYPAIR" ] && [ "$KEYPAIR" = "$TAPPAIR" ]; then ok "ই২ই: ট্যাপ×keynav-টোন-সমতা (borderColor-এক-মান — parity-নীতি-প্রমাণ)"; else bad "ই২ই: keynav=[$KEYPAIR] tap=[$TAPPAIR]"; fi
if agent-browser screenshot "$SH_PAIR" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-প্যারি-টোন সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K390=$(unjj "$(ev "$PAIRPROBE")")
if [ "$(jf e "$K390")" = "" ] && [ "$(jf diff "$K390")" = "false" ]; then ok "ই২ই: ৩৯০px-keynav pair=single (ব্যাজ-বেস-অটুট — >640px-ব্যান্ড-স্কোপিং-প্রমাণ)"; else bad "ই২ই: ৩৯০keynav $(unjj "$K390")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T390=$(unjj "$(ev "$PAIRPROBE")")
if [ "$(jf e "$T390")" = "" ] && [ "$(jf diff "$T390")" = "false" ]; then ok "ই২ই: ৩৯০px-ট্যাপ pair=single (s326-৩৪%-নরম-রুল-অটুট — মোবাইল-স্পর্শ-শূন্য)"; else bad "ই২ই: ৩৯০ট্যাপ $(unjj "$T390")"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: hr332-ই২ই (json-এ .json-ফাইলনাম+MIME; অ-জসনে .txt-অটুট; জীবন্ত-aria-সিঙ্ক) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria332QA,x:window.__hrAria332QA?window.__hrAria332QA.ext():'x',q31:!!window.__hrAria331QA,e:((window.__hrAria332QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf x "$H0J")" = ".txt" ] && [ "$(jf q31 "$H0J")" = "true" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria332QA-হুক + ext()='.txt'-ডিফল্ট + s331-সহাবস্থান"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap332=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
HS=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length})")
if [ "$(jf h "$(unjj "$HS")")" = "2" ]; then ok "ই২ই: ইতিহাস-সিড ×২ (ক্লিপবোর্ড-স্টাব-পূর্বে-কপি — s316-চুক্তি)"; else bad "ই২ই: hist=$(unjj "$HS")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
PV=$(ev "JSON.stringify({pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),dl:!!document.querySelector('.hr317-tip.is-on .hr329-dl'),al:(document.querySelector('.hr317-tip.is-on .hr329-dl')||{getAttribute:function(){return ''}}).getAttribute('aria-label')})")
PVJ=$(unjj "$PV")
if [ "$(jf pre "$PVJ")" = "true" ] && [ "$(jf dl "$PVJ")" = "true" ] && printf '%s' "$(jf al "$PVJ")" | grep -q '.txt ফাইলে ডাউনলোড'; then ok "ই২ই: প্রিভিউ-খোলা → .hr329-dl aria '.txt' (ডিফল্ট-rich — s329-সুইট-চুক্তি-অটুট)"; else bad "ই২ই: $(unjj "$PV")"; fi
ev "JSON.stringify((function(){window.__dlStub332={types:[],clicks:0,names:[]};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub332.types.push(String(b&&b.type));return 'blob:qa-stub-332'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub332.clicks+=1;window.__dlStub332.names.push(this.getAttribute('download')||'');return}return ocl.call(this)};return 'dstub'})())" >/dev/null 2>&1
# সতর্কতা (এ-রাউন্ড-গোটচা): একই-সারি-refocus = tipRender318-পুনঃরেন্ডার → .hr327-pre-ধ্বংস
# (pvOpen327=false — opens/closes-অস্পৃশ্য) → P-খোলার পরে সর্ব-কীডাউন সরাসরি-ডিসপ্যাচ (refocus-শূন্য)
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D1=$(ev "JSON.stringify({d:window.__hrAria324QA.downloads,hj:window.__hrAria332QA.histJson,pvj:window.__hrAria332QA.pvJson,ck:window.__dlStub332.clicks,nm:window.__dlStub332.names[window.__dlStub332.names.length-1]||'',tp:window.__dlStub332.types[window.__dlStub332.types.length-1]||'',pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),dl:!!document.querySelector('.hr317-tip.is-on .hr329-dl')})")
D1J=$(unjj "$D1")
NM1=$(jf nm "$D1J")
if [ "$(jf d "$D1J")" = "1" ] && [ "$(jf hj "$D1J")" = "0" ] && [ "$(jf ck "$D1J")" = "1" ]; then ok "ই২ই: D-rich ডাউনলোড (histJson=০ — q324h-অস্পৃশ্য)"; else bad "ই২ই: $(unjj "$D1")"; fi
if printf '%s' "$NM1" | grep -q '\.txt$'; then ok "ই২ই: rich-ফাইলনাম '.txt' [$NM1]"; else bad "ই২ই: nm=[$NM1]"; fi
if [ "$(jf tp "$D1J")" = "text/plain;charset=utf-8" ]; then ok "ই২ই: rich-MIME text/plain (অটুট)"; else bad "ই২ই: tp=[$(jf tp "$D1J")]"; fi
if [ "$(jf pre "$D1J")" = "true" ] && [ "$(jf dl "$D1J")" = "true" ]; then ok "ই২ই: D-পরবর্তী প্রিভিউ-টিকে (refocus-শূন্য-ডিসপ্যাচ — পুনঃরেন্ডার-শূন্য)"; else bad "ই২ই: প্রিভিউ-ধ্বংস pre=$(jf pre "$D1J") dl=$(jf dl "$D1J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F2=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),x:window.__hrAria332QA.ext(),alD:(document.querySelector('.hr317-tip.is-on .hr324-dl')||{getAttribute:function(){return ''}}).getAttribute('aria-label'),alP:(document.querySelector('.hr317-tip.is-on .hr329-dl')||{getAttribute:function(){return ''}}).getAttribute('aria-label'),sync:window.__hrAria332QA.last})")
F2J=$(unjj "$F2")
if [ "$(jf m "$F2J")" = "json" ] && [ "$(jf x "$F2J")" = ".json" ]; then ok "ই২ই: F×২ → json (ext()='.json' — hr331-চক্র-অটুট)"; else bad "ই২ই: $(unjj "$F2")"; fi
if printf '%s' "$(jf alD "$F2J")" | grep -q '.json ফাইলে ডাউনলোড'; then ok "ই২ই: জীবন্ত-সিঙ্ক .hr324-dl aria '.json' (খোলা-টুলটিপে — cf332 — s327-গোটচা-②-চুক্তি)"; else bad "ই২ই: alD=[$(jf alD "$F2J")]"; fi
if printf '%s' "$(jf alP "$F2J")" | grep -q '.json ফাইলে ডাউনলোড'; then ok "ই২ই: জীবন্ত-সিঙ্ক .hr329-dl aria '.json' (খোলা-প্রিভিউয়ে)"; else bad "ই২ই: alP=[$(jf alP "$F2J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D2=$(ev "JSON.stringify({hj:window.__hrAria332QA.histJson,ck:window.__dlStub332.clicks,nm:window.__dlStub332.names[window.__dlStub332.names.length-1]||'',tp:window.__dlStub332.types[window.__dlStub332.types.length-1]||'',toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})()})")
D2J=$(unjj "$D2")
NM2=$(jf nm "$D2J")
if [ "$(jf hj "$D2J")" = "1" ] && [ "$(jf ck "$D2J")" = "2" ]; then ok "ই২ই: D-json ডাউনলোড (histJson=১ — গণনা-সততা)"; else bad "ই২ই: $(unjj "$D2")"; fi
if printf '%s' "$NM2" | grep -q '\.json$'; then ok "ই২ই: json-ফাইলনাম '.json' [$NM2]"; else bad "ই২ই: nm=[$NM2]"; fi
if [ "$(jf tp "$D2J")" = "application/json;charset=utf-8" ]; then ok "ই২ই: json-MIME application/json;charset=utf-8"; else bad "ই২ই: tp=[$(jf tp "$D2J")]"; fi
if printf '%s' "$(jf toast "$D2J")" | grep -q '(.json)'; then ok "ই২ই: json-টোস্ট-এক্সটেনশন-সম্মত"; else bad "ই২ই: toast=[$(jf toast "$D2J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true,cancelable:true}));return 's1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
S1=$(ev "JSON.stringify({pvj:window.__hrAria332QA.pvJson,d:window.__hrAria329QA.downloads,ck:window.__dlStub332.clicks,nm:window.__dlStub332.names[window.__dlStub332.names.length-1]||'',tp:window.__dlStub332.types[window.__dlStub332.types.length-1]||''})")
S1J=$(unjj "$S1")
NM3=$(jf nm "$S1J")
if [ "$(jf pvj "$S1J")" = "1" ] && [ "$(jf d "$S1J")" = "1" ] && [ "$(jf ck "$S1J")" = "3" ]; then ok "ই২ই: S-json ডাউনলোড (pvJson=১ — q329h-অস্পৃশ্য)"; else bad "ই২ই: $(unjj "$S1")"; fi
if printf '%s' "$NM3" | grep -q 'lekhok-preview-.*\.json$'; then ok "ই২ই: json-প্রিভিউ-ফাইলনাম [$NM3]"; else bad "ই২ই: nm=[$NM3]"; fi
if [ "$(jf tp "$S1J")" = "application/json;charset=utf-8" ]; then ok "ই২ই: json-প্রিভিউ- MIME application/json"; else bad "ই২ই: tp=[$(jf tp "$S1J")]"; fi
if agent-browser screenshot "$SH_JSON" >/dev/null 2>&1; then ok "স্ক্রিনশট: json-ডাউনলোড-অ্যাডমিন সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f3'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F3=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),x:window.__hrAria332QA.ext(),alD:(document.querySelector('.hr317-tip.is-on .hr324-dl')||{getAttribute:function(){return ''}}).getAttribute('aria-label')})")
F3J=$(unjj "$F3")
if [ "$(jf m "$F3J")" = "rich" ] && [ "$(jf x "$F3J")" = ".txt" ] && printf '%s' "$(jf alD "$F3J")" | grep -q '.txt ফাইলে ডাউনলোড'; then ok "ই২ই: F×১ → rich-পূর্ণ-চক্র (ext()='।txt'-ফেরত + aria-সিঙ্ক-ফেরত — ত্রি-চক্র-সমাপ্তি)"; else bad "ই২ই: $(unjj "$F3")"; fi

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
if [ "$FAIL" = "0" ]; then echo "s332-suite ✓ সর্ব-সবুজ"; else echo "s332-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
