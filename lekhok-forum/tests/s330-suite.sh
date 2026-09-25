#!/bin/bash
# s330-suite.sh — session330: sfs330 ৩৬০px-সম-প্রদর্শন-টোন-ভ্যারিয়েন্ট + hr330 '?'-কী শর্টকাট-সহায়তা-ওভারলে
# [Task ID 167] PLANS session329-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ④-গেটেড):
#   sfs330 (style.css session330-ব্লক — কেবল-সংযোজন): টোন-সিঁড়ি-সমাপ্তি (৪৬→৫৮→৬৬% — ≤৩৬০px
#      সম-প্রদর্শনে ট্যাপ×keynav-উভয়-গেট — parity-নীতি; কেবল-রঙ — layout-neutral)
#   hr330 (admin/home-reorder.ejs): '?'-কী শর্টকাট-সহায়তা-ওভারলে (৮-সারি — kbd-চিপ + বর্ণনা;
#      '?'-টগল — ইতিহাস-গেট-নেই; Escape-বন্ধ — ফোকাস-প্রেক্ষাপট-নিরপেক্ষ; .hr330-x-বন্ধ-বাটন;
#      নন-মোডাল — ফোকাস-চুরি-নেই; body-সন্নিবেশ — পুনঃনির্মাণ-চুক্তি-অস্পৃশ্য; হিন্ট-মোড়ক-জুটি) +
#      __hrAria330QA {opens, closes, last, isOpen(), open(), close(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316/s324/s327/s328) +
#         বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         সুইট-রান = রিপো-রুট-cwd + গেট-সমাপ্তি-wait-৫০০০ms + jf/unjj-নিউলাইন-অসমতা (s327-গোটচা) +
#         computed-%-মান = ইউনিট-কাটা-তুলনা (s329-গোটচা-①) + hygiene-clear ×৩ (hr321-hist +
#         hr326-fmt + hr327-pv — e2e-বিবর্তন-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_TONE=/home/z/my-project/download/s330-toneladder-360.png
SH_OV=/home/z/my-project/download/s330-helpoverlay-admin.png
SH_MOB=/home/z/my-project/download/s330-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s330-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s330-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS330=$(sed -n '/session330 (sfs330 ৩৬০px-সম-প্রদর্শন-টোন-ভ্যারিয়েন্ট)/,/EOF session330/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS330" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS330" ]; then ok "style.css: session330-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
TAPN=$(printf '%s' "$CSS330" | grep -c 'data-sfs321-tap' | tr -d ' ')
KEYN=$(printf '%s' "$CSS330" | grep -c 'data-sfs314-focus' | tr -d ' ')
if [ "$TAPN" -ge 1 ] && [ "$KEYN" -ge 1 ]; then ok "style.css: ট্যাপ×keynav-উভয়-গেট (sfs330 — parity-নীতি)"; else bad "style.css: গেট tap=$TAPN keynav=$KEYN"; fi
printf '%s' "$CSS330" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 66%, transparent)' && printf '%s' "$CSS330" | grep -q '@media (max-width: 360px)' && ok "style.css: টোন-সিঁড়ি-সমাপ্তি (৪৬→৫৮→৬৬% — ≤৩৬০px — কেবল-রঙ)" || bad "style.css: ৬৬%-টোন-অমিল"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
HREX=$(sed -n '/সেশন ৩৩০ (hr330)/,/hr330-ft/p' "$APP/admin/views/admin/home-reorder.ejs")
HEXH=$(printf '%s' "$HREX" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXH" = "0" ] && [ -n "$HREX" ]; then ok "home-reorder.ejs: .hr330-স্টাইল rgba-only (hex-শূন্য)"; else bad "home-reorder.ejs: hex ×$HEXH বা স্টাইল-অনুপস্থিত"; fi
grep -q '.hr330-ov\[hidden\] { display: none; }' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: [hidden]-টগল-রুল (কোনো-নতুন-MO-নেই)" || bad "home-reorder.ejs: hidden-রুল-অমিল"
grep -q "ov330.setAttribute('role', 'dialog')" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "aria-modal', 'false'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: role=dialog + aria-modal=false (নন-মোডাল — ফোকাস-চুরি-নেই)" || bad "home-reorder.ejs: dialog-attr-অমিল"
grep -q "document.body.appendChild(ov330);" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: body-সন্নিবেশ (tip317-বহির্ভূত — পুনঃনির্মাণ-চুক্তি-অস্পৃশ্য)" || bad "home-reorder.ejs: সন্নিবেশ-অমিল"
grep -q "e330k.key !== '?'" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "e330k.ctrlKey || e330k.metaKey || e330k.altKey" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: '?'-টগল-হ্যান্ডলার (s320-keydown-রীতি — ctrl/meta/alt-বর্জন — shift-অনুমোদিত)" || bad "home-reorder.ejs: ?-হ্যান্ডলার-অমিল"
grep -q "e330k.target.closest('.hr-aria-copy') || e330k.target.closest('.hr330-ov')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: দ্বি-প্রেক্ষাপট-গেট (.hr-aria-copy × ওভারলে-অভ্যন্তরীণ — টগল-চালুক্রম)" || bad "home-reorder.ejs: গেট-অমিল"
grep -q "e330k.key === 'Escape' && ovOpen330" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Escape-বন্ধ (ফোকাস-প্রেক্ষাপট-নিরপেক্ষ — গোটচা-ডক-কৃত)" || bad "home-reorder.ejs: Escape-অমিল"
grep -q "closeOv330('escape')" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "closeOv330('btn')" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "closeOv330('key')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: বন্ধ-পথ-ত্রয়ী (escape × btn × key — last-গণনা)" || bad "home-reorder.ejs: বন্ধ-পথ-অমিল"
grep -q "var cf330 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var trOrig330 = tipRender318;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: হিন্ট-মোড়ক-জুটি (cycleFmt326 + tipRender318 — '? = সহায়িকা' — S-হিন্ট-চেইন-পরবর্তী)" || bad "home-reorder.ejs: হিন্ট-মোড়ক-অমিল"
grep -q "window.__hrAria330QA = q330h" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "window.__hrAria329QA = q329h" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria330QA-হুক + s329-হুক-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "hr327-pv" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "togglePv327 = function (b329t)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr329-ইঞ্জিন-অস্পৃশ্য (কেবল-সংযোজন — persist-চুক্তি-অটুট)" || bad "home-reorder.ejs: hr329-অস্পৃশ্যতা-ভাঙা"
A330CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria330QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A330CHK" = "OK" ]; then ok "home-reorder.ejs: hr330-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs330-ই২ই (৩৬০px-টোন-সিঁড়ি → প্যারিটি → ৩৯০px/ডেস্ক-অটুট) ──"
BCJS='JSON.stringify((function(){var c=document.querySelector(".sfs319-namechip");return {bc:c?getComputedStyle(c).borderColor:""}})())'
agent-browser set viewport 360 740 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (৩৬০px)"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M360=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
BC360=$(unjj "$(ev "$BCJS")")
if [ "$(jf badgeOn "$M360")" = "true" ] && [ "$(jf chipOn "$M360")" = "true" ]; then ok "ই২ই: ৩৬০px-keynav-সম-প্রদর্শন (ব্যাজ × চিপ — টোন-ভ্যারিয়েন্ট-প্রেক্ষাপট-সক্রিয়)"; else bad "ই২ই: $(unjj "$M360")"; fi
MW360=$(jf maxw "$M360")
if [ "$MW360" = "38%" ]; then ok "ই২ই: ৩৬০px-চিপ-প্রস্থ-অটুট (max-width $MW360 — s327/s329-মান-অস্পৃশ্য — কেবল-রঙ-নীতি)"; else bad "ই২ই: maxw=$MW360"; fi
if [ "$(jf right "$M360")" = "72px" ]; then ok "ই২ই: ৩৬০px-গাটার-অটুট (right=৭২px — ≤640px-বেস — ভিউপোর্ট-প্রেক্ষাপট-সচেতন — s329-গোটচা-②-সমতা — s327/s328-মান-অস্পৃশ্য)"; else bad "ই২ই: right=$(jf right "$M360")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T360=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
TBC360=$(unjj "$(ev "$BCJS")")
if [ "$(jf badgeOn "$T360")" = "true" ] && [ "$(jf bc "$(unjj "$TBC360")")" = "$(jf bc "$(unjj "$BC360")")" ]; then ok "ই২ই: ৩৬০px-ট্যাপ×keynav-টোন-সমতা (borderColor-এক-মান — parity-নীতি-প্রমাণ)"; else bad "ই২ই: tap=[$(unjj "$TBC360")] keynav=[$(unjj "$BC360")]"; fi
if agent-browser screenshot "$SH_TONE" >/dev/null 2>&1; then ok "স্ক্রিনশট: ৩৬০px-টোন-ভ্যারিয়েন্ট সংরক্ষিত"; else skip "৩৬০px-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
BC390=$(unjj "$(ev "$BCJS")")
if [ "$(jf bc "$(unjj "$BC390")")" != "$(jf bc "$(unjj "$BC360")")" ]; then ok "ই২ই: টোন-সিঁড়ি-প্রমাণ (৩৬০px ≠ ৩৯০px — ক্ষুদ্র-পর্দায় ৬৬% > ৫৮%)"; else bad "ই২ই: টোন-সিঁড়ি-ভাঙা (সম-মান)"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'kdesk'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
BCDES=$(unjj "$(ev "$BCJS")")
if [ "$(jf bc "$(unjj "$BCDES")")" != "$(jf bc "$(unjj "$BC390")")" ] && [ "$(jf bc "$(unjj "$BCDES")")" != "$(jf bc "$(unjj "$BC360")")" ]; then ok "ই২ই: টোন-ধার-প্রমাণ (ডেস্ক ৫৮% ≠ ৩৯০px ৬২% ≠ ৩৬০px ৬৬% — sfs331-রেঞ্জ-রুল — ডেস্ক-মূল-অটুট)"; else bad "ই২ই: desk=[$(unjj "$BCDES")] 390=[$(unjj "$BC390")] 360=[$(unjj "$BC360")]"; fi

echo "── ধাপ-৪: hr330-ই২ই (?-টগল→Escape→বন্ধ-বাটন→কী-তালিকা→নন-মোডাল→হিন্ট→পুনঃলোড) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria330QA,o:window.__hrAria330QA?window.__hrAria330QA.opens:-1,c:window.__hrAria330QA?window.__hrAria330QA.closes:-1,e:((window.__hrAria330QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf o "$H0J")" = "0" ] && [ "$(jf c "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria330QA-হুক + opens=closes=০"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
O1=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),h:window.__hrAria317QA.hist().length,last:window.__hrAria330QA.last,role:(document.querySelector('.hr330-ov')||{getAttribute:function(){return ''}}).getAttribute('role'),lb:(document.querySelector('.hr330-ov')||{getAttribute:function(){return ''}}).getAttribute('aria-labelledby'),rows:document.querySelectorAll('.hr330-ov .hr330-li').length})")
O1J=$(unjj "$O1")
if [ "$(jf o "$O1J")" = "true" ] && [ "$(jf h "$O1J")" = "0" ]; then ok "ই২ই: শূন্য-ইতিহাসে '?'-খোলা (ইতিহাস-গেট-নেই-প্রমাণ — আবিষ্কারযোগ্যতা-সিদ্ধান্ত)"; else bad "ই২ই: $(unjj "$O1")"; fi
if [ "$(jf role "$O1J")" = "dialog" ] && [ "$(jf lb "$O1J")" = "hr330-t" ] && [ "$(jf rows "$O1J")" = "8" ]; then ok "ই২ই: ওভারলে-কাঠামো (role=dialog + aria-labelledby + ৮-সারি — E/D/X/F/P/C/S/?)"; else bad "ই২ই: role=[$(jf role "$O1J")] rows=[$(jf rows "$O1J")]"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
E1=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),c:window.__hrAria330QA.closes,last:window.__hrAria330QA.last})")
E1J=$(unjj "$E1")
if [ "$(jf o "$E1J")" = "false" ] && [ "$(jf c "$E1J")" = "1" ] && [ "$(jf last "$E1J")" = "close:escape" ]; then ok "ই২ই: Escape-বন্ধ (document-স্তর — closes=১ — last=close:escape)"; else bad "ই২ই: $(unjj "$E1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q2'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q3'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
T1=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),oN:window.__hrAria330QA.opens,cN:window.__hrAria330QA.closes})")
T1J=$(unjj "$T1")
if [ "$(jf o "$T1J")" = "false" ] && [ "$(jf oN "$T1J")" = "2" ] && [ "$(jf cN "$T1J")" = "2" ]; then ok "ই২ই: '?'-টগল-চালুক্রম (?-খোলা → ?-বন্ধ — opens=closes=২)"; else bad "ই২ই: $(unjj "$T1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q4'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var x=document.querySelector('.hr330-ov .hr330-x');if(!x)return 'nx';x.click();return 'xb'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
B1=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),c:window.__hrAria330QA.closes,last:window.__hrAria330QA.last})")
B1J=$(unjj "$B1")
if [ "$(jf o "$B1J")" = "false" ] && [ "$(jf last "$B1J")" = "close:btn" ]; then ok "ই২ই: .hr330-x-বন্ধ-বাটন (pointer-path — last=close:btn)"; else bad "ই২ই: $(unjj "$B1")"; fi
KL=$(ev "JSON.stringify((function(){var o=document.querySelector('.hr330-ov');if(!o)return 'no';var ks=[].slice.call(o.querySelectorAll('.hr330-k')).map(function(k){return k.textContent});var need=['E','D','X','F','P','C','S','?'];var miss=need.filter(function(k){return ks.indexOf(k)<0});return {n:ks.length,miss:miss.join('')}})())")
KLJ=$(unjj "$KL")
if [ "$(jf n "$KLJ")" = "8" ] && [ "$(jf miss "$KLJ")" = "" ]; then ok "ই২ই: কী-তালিকা-সম্পূর্ণতা (E/D/X/F/P/C/S/? — ব্যস্ত-কী-স্ক্যান-সমতা)"; else bad "ই২ই: $(unjj "$KL")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap330=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
HS=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length})")
if [ "$(jf h "$(unjj "$HS")")" = "2" ]; then ok "ই২ই: ইতিহাস-সিড ×২ (ক্লিপবোর্ড-স্টাব-পূর্বে-কপি — s316-চুক্তি)"; else bad "ই২ই: hist=$(unjj "$HS")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q5'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
NM=$(ev "JSON.stringify({ov:window.__hrAria330QA.isOpen(),pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),o:window.__hrAria327QA.opens,am:(document.querySelector('.hr330-ov')||{getAttribute:function(){return ''}}).getAttribute('aria-modal')})")
NMJ=$(unjj "$NM")
if [ "$(jf ov "$NMJ")" = "true" ] && [ "$(jf pre "$NMJ")" = "true" ] && [ "$(jf o "$NMJ")" = "1" ]; then ok "ই২ই: নন-মোডাল-প্রমাণ (ওভারলে-খোলা-অবস্থায় P-টগল-স্বাভাবিক — শর্টকাট-চালুক্রম-অব্যাহত)"; else bad "ই২ই: $(unjj "$NM")"; fi
if [ "$(jf am "$NMJ")" = "false" ]; then ok "ই২ই: aria-modal=false-স্থায়ী"; else bad "ই২ই: am=[$(jf am "$NMJ")]"; fi
KB=$(ev "JSON.stringify({q:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('? = সহায়িকা')>=0,s:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('S = প্রিভিউ সংরক্ষণ')>=0,c:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('C = প্রিভিউ কপি')>=0})")
KBJ=$(unjj "$KB")
if [ "$(jf q "$KBJ")" = "true" ] && [ "$(jf s "$KBJ")" = "true" ] && [ "$(jf c "$KBJ")" = "true" ]; then ok "ই২ই: হিন্ট-চেইন-সহাবস্থান (? = সহায়িকা + S + C — সম-সারিতে)"; else bad "ই২ই: $(unjj "$KB")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
F1=$(ev "JSON.stringify({m:window.__hrAria326QA.mode(),ov:window.__hrAria330QA.isOpen(),kq:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('? = সহায়িকা')>=0})")
F1J=$(unjj "$F1")
if [ "$(jf m "$F1J")" = "key" ] && [ "$(jf ov "$F1J")" = "true" ] && [ "$(jf kq "$F1J")" = "true" ]; then ok "ই২ই: F-রিফ্রেশ-পরেও ওভারলে+হিন্ট-টিকে (body-সন্নিবেশ + cycleFmt326-মোড়ক)"; else bad "ই২ই: $(unjj "$F1")"; fi
if agent-browser screenshot "$SH_OV" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-সহায়তা-ওভারলে সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc2'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
R1=$(ev "JSON.stringify({o:window.__hrAria330QA?window.__hrAria330QA.opens:-1,ov:!!document.querySelector('.hr330-ov:not([hidden])')})")
R1J=$(unjj "$R1")
if [ "$(jf o "$R1J")" = "0" ] && [ "$(jf ov "$R1J")" = "false" ]; then ok "ই২ই: পুনঃলোডে ওভারলে-বন্ধ-বেসলাইন (opens=০ — স্থায়ীকরণ-নেই — পৃষ্ঠা-লোড = সীমানা — hr329-চুক্তি-সমতা)"; else bad "ই২ই: $(unjj "$R1")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'x',bubbles:true,cancelable:true}));return 'x1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
Z1=$(ev "JSON.stringify({o:window.__hrAria330QA.opens,d:window.__hrAria325QA?window.__hrAria325QA.deletes:-1})")
Z1J=$(unjj "$Z1")
if [ "$(jf o "$Z1J")" = "0" ]; then ok "ই২ই: X-নীরব-অটুট (শূন্য-ইতিহাসে — hr330-?-হ্যান্ডলার-অন্য-কী-অস্পৃশ্য)"; else bad "ই২ই: $(unjj "$Z1")"; fi
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'hyg'})())" >/dev/null 2>&1

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
if [ "$FAIL" = "0" ]; then echo "s330-suite ✓ সর্ব-সবুজ"; else echo "s330-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
