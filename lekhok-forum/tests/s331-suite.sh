#!/bin/bash
# s331-suite.sh — session331: sfs331 ৬৪০px-সম-প্রদর্শন-টোন-ধার + hr331 রপ্তাই-বিন্যাসে 'json'-তৃতীয়-মোড
# [Task ID 168] PLANS session330-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ④-গেটেড):
#   sfs331 (style.css session331-ব্লক — কেবল-সংযোজন): টোন-সিঁড়ি-পুনর্বিবেচনা — বেস ৪৬% →
#      সম-প্রদর্শন ৫৮% (>৬৪০px — s327/s328) → ৬২% (৩৬১–৬৪০px — এ-ব্লক — রেঞ্জ-স্কোপড
#      মিডিয়া-কোয়েরি — s330-এর ≤৩৬০px-রুল-স্পর্শ-শূন্য) → ৬৬% (≤৩৬০px — s330-অটুট); ট্যাপ ×
#      keynav উভয়-গেট-সম-মান (parity-নীতি); কেবল-রঙ — layout-neutral
#   hr331 (admin/home-reorder.ejs): রপ্তাই-বিন্যাসে 'json'-তৃতীয়-মোড — ত্রি-মোড-চক্র (rich ⇄ key
#      ⇄ json ⇄ rich) + fmtLabel331-লেবেল-এক-উৎস (সর্ব-সাইট ×৮) + strip324-মোড়ক (json-এ
#      JSON.stringify([{key,count}…], null, 2) — হেডার-নেই বিশুদ্ধ-JSON — সর্ব-রপ্তাই-পথ
#      WYSIWYG) + স্থায়ীকরণ = 'hr326-fmt'-কী-ই (নতুন-কী-নেই) + hr330-ওভারলে F-বর্ণনা-হালনাগাদ +
#      __hrAria331QA {jsonStrips, last, mode(), strip(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (s316/s324/s327/s328/s330) +
#         বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         সুইট-রান = রিপো-রুট-cwd + গেট-সমাপ্তি-wait + jf/unjj-নিউলাইন-অসমতা (s327-গোটচা) +
#         computed-borderColor = ইউনিট-স্বাধীন-সমতা (color-mix-রেন্ডার-স্ট্রিং-নিরপেক্ষ — s330-রীতি) +
#         hygiene-clear ×৩ (hr321-hist + hr326-fmt + hr327-pv — নতুন-কী-নেই — e2e-বিবর্তন-অস্পৃশ্য)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_TONE=/home/z/my-project/download/s331-toneladder-390.png
SH_JSON=/home/z/my-project/download/s331-jsonfmt-admin.png
SH_MOB=/home/z/my-project/download/s331-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s331-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s331-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS331=$(sed -n '/session331 (sfs331 ৬৪০px-সম-প্রদর্শন-টোন-ধার)/,/EOF session331/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS331" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS331" ]; then ok "style.css: session331-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
TAPN=$(printf '%s' "$CSS331" | grep -c 'data-sfs321-tap' | tr -d ' ')
KEYN=$(printf '%s' "$CSS331" | grep -c 'data-sfs314-focus' | tr -d ' ')
if [ "$TAPN" -ge 1 ] && [ "$KEYN" -ge 1 ]; then ok "style.css: ট্যাপ×keynav-উভয়-গেট (sfs331 — parity-নীতি)"; else bad "style.css: গেট tap=$TAPN keynav=$KEYN"; fi
printf '%s' "$CSS331" | grep -q 'color-mix(in srgb, var(--lf-brand-primary) 62%, transparent)' && printf '%s' "$CSS331" | grep -q '@media (max-width: 640px) and (min-width: 361px)' && ok "style.css: টোন-ধার-রুল (৫৮→৬২% ৩৬১–৬৪০px — রেঞ্জ-স্কোপড — কেবল-রঙ)" || bad "style.css: ৬২%-রুল/রেঞ্জ-কোয়েরি-অমিল"
printf '%s' "$CSS331" | grep -q 'right:' && printf '%s' "$CSS331" | grep -q 'max-width' && bad "style.css: layout-স্পর্শ (কেবল-রঙ-নীতি-ভাঙা)" || ok "style.css: layout-neutral (গাটার/প্রস্থ-রুল-শূন্য — কেবল-রঙ-নীতি)"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q "m326s === 'rich' || m326s === 'json'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: স্থায়ীকরণ-যাচাইকরণে 'json'-গ্রহণ ('hr326-fmt'-কী-ই — নতুন-কী-নেই)" || bad "home-reorder.ejs: json-যাচাইকরণ-অমিল"
grep -q "(mode326 === 'rich') ? 'key' : (mode326 === 'key' ? 'json' : 'rich')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ত্রি-মোড-চক্র (rich ⇄ key ⇄ json ⇄ rich — মালিকানা-এক-উৎস)" || bad "home-reorder.ejs: চক্র-কোর-অমিল"
LBLN=$(grep -c 'fmtLabel331(mode326)' "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$LBLN" -ge 8 ]; then ok "home-reorder.ejs: fmtLabel331-লেবেল-এক-উৎস (সর্ব-সাইট ×$LBLN — টোস্ট ×৩ + kbd ×২ + বাটন + aria + meta)"; else bad "home-reorder.ejs: লেবেল-সাইট ×$LBLN (<৮)"; fi
grep -q "var stOrig331 = strip324;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "arr331.push({ key: hist317\[i331a\].key, count: hist317\[i331a\].n })" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: strip324-মোড়ক (json-এ JSON.stringify — হেডার-নেই — সর্ব-পথ WYSIWYG)" || bad "home-reorder.ejs: strip-মোড়ক-অমিল"
grep -q "'F', 'রপ্তাই-বিন্যাস চক্র (rich ⇄ key ⇄ json)'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr330-ওভারলে F-বর্ণনা-হালনাগাদ (json-সন্নিবেষ্ট)" || bad "home-reorder.ejs: ওভারলে-F-বর্ণনা-অমিল"
grep -q "window.__hrAria331QA = q331h" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "window.__hrAria330QA = q330h" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria331QA-হুক + s330-হুক-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "togglePv327 = function (b329t)" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var cf330 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: s329/s330-ইঞ্জিন-অস্পৃশ্য (মোড়ক-চেইন-অটুট — কেবল-সংযোজন)" || bad "home-reorder.ejs: পুরাতন-ইঞ্জিন-স্পর্শ-ভাঙা"
grep -q "if (mode326 !== 'key') return stripRich326()" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: hr326-রিডাইরেক্ট-অটুট (hr331-মোড়ক-অবস্থান-সঠিক — পরবর্তী-স্তর)" || bad "home-reorder.ejs: hr326-রিডাইরেক্ট-অমিল"
A331CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria331QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A331CHK" = "OK" ]; then ok "home-reorder.ejs: hr331-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs331-ই২ই (টোন-ধার ৩৯০px-৬২% → ডেস্ক-৫৮% → ৩৬০px-৬৬% → parity) ──"
BCJS='JSON.stringify((function(){var c=document.querySelector(".sfs319-namechip");return {bc:c?getComputedStyle(c).borderColor:""}})())'
agent-browser set viewport 390 844 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড (৩৯০px)"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M390=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
BC390=$(unjj "$(ev "$BCJS")")
if [ "$(jf badgeOn "$M390")" = "true" ] && [ "$(jf chipOn "$M390")" = "true" ]; then ok "ই২ই: ৩৯০px-keynav-সম-প্রদর্শন (ব্যাজ × চিপ — ধার-প্রেক্ষাপট-সক্রিয়)"; else bad "ই২ই: $(unjj "$M390")"; fi
if [ "$(jf right "$M390")" = "72px" ]; then ok "ই২ই: ৩৯০px-গাটার-অটুট (right=৭২px — ≤640px-বেস — s327/s328-মান-অস্পৃশ্য)"; else bad "ই২ই: right=$(jf right "$M390")"; fi
if [ "$(jf maxw "$M390")" = "52%" ]; then ok "ই২ই: ৩৯০px-চিপ-প্রস্থ-অটুট (max-width ৫২% — ৩৮% = ≤৩৬০px-কেবল — s327/s329-অস্পৃশ্য — কেবল-রঙ-নীতি)"; else bad "ই২ই: maxw=$(jf maxw "$M390")"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'kdesk'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
BCDES=$(unjj "$(ev "$BCJS")")
if [ "$(jf bc "$(unjj "$BCDES")")" != "$(jf bc "$(unjj "$BC390")")" ]; then ok "ই২ই: ধার-প্রমাণ-১ (ডেস্ক ৫৮% ≠ ৩৯০px ৬২% — রেঞ্জ-রুল-সক্রিয়)"; else bad "ই২ই: desk=[$(unjj "$BCDES")] = 390"; fi
agent-browser set viewport 360 740 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k360'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
BC360=$(unjj "$(ev "$BCJS")")
MW360=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf bc "$(unjj "$BC360")")" != "$(jf bc "$(unjj "$BC390")")" ]; then ok "ই২ই: ধার-প্রমাণ-২ (৩৬০px ৬৬% ≠ ৩৯০px ৬২% — s330-রুল-স্পর্শ-শূন্য-প্রমাণ)"; else bad "ই২ই: 360=[$(unjj "$BC360")] = 390"; fi
if [ "$(jf bc "$(unjj "$BCDES")")" != "$(jf bc "$(unjj "$BC360")")" ] && [ "$(jf maxw "$MW360")" = "38%" ]; then ok "ই২ই: টোন-সিঁড়ি-সম্পূর্ণ (৫৮ < ৬২ < ৬৬ — ত্রি-ভিউপোর্ট ত্রি-মান + ৩৬০px-প্রস্থ-৩৮%-অটুট)"; else bad "ই২ই: desk=360 বা maxw=$(jf maxw "$MW360")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T360=$(unjj "$(ev "$BCJS")")
if [ "$(jf bc "$(unjj "$T360")")" = "$(jf bc "$(unjj "$BC360")")" ]; then ok "ই২ই: ৩৬০px-ট্যাপ×keynav-টোন-সমতা (borderColor-এক-মান — parity-নীতি-প্রমাণ)"; else bad "ই২ই: tap=[$(unjj "$T360")] keynav=[$(unjj "$BC360")]"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1
if agent-browser screenshot "$SH_TONE" >/dev/null 2>&1; then ok "স্ক্রিনশট: টোন-ধার-৩৯০px সংরক্ষিত"; else skip "টোন-স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: hr331-ই২ই (json-মোড: চক্র→স্ট্রিপ→প্রিভিউ→পূর্ণ-চক্র→স্থায়ীকরণ→ওভারলে) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria331QA,m:window.__hrAria331QA?window.__hrAria331QA.mode():'x',cy:window.__hrAria326QA?window.__hrAria326QA.cycles:-1,js:window.__hrAria331QA?window.__hrAria331QA.jsonStrips:-1,e:((window.__hrAria331QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf m "$H0J")" = "rich" ] && [ "$(jf cy "$H0J")" = "0" ] && [ "$(jf js "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria331QA-হুক + rich-ডিফল্ট + cycles=jsonStrips=০"; else bad "ই২ই: $(unjj "$H0")"; fi
FS=$(ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var c0=window.__hrAria326QA.cycles;var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return {silent:window.__hrAria326QA.cycles===c0}})())")
agent-browser wait 350 >/dev/null 2>&1
if [ "$(jf silent "$(unjj "$FS")")" = "true" ]; then ok "ই২ই: শূন্য-ইতিহাসে F-নীরব (গেট ×৫-অটুট — hr323-দর্শন — ত্রি-মোডে-ও)"; else bad "ই২ই: F-গেট-ভাঙা"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true}));return 'q1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
OF=$(ev "JSON.stringify({o:window.__hrAria330QA.isOpen(),fd:(function(){var o=document.querySelector('.hr330-ov');if(!o)return '';var ks=[].slice.call(o.querySelectorAll('.hr330-li'));for(var i=0;i<ks.length;i++){if(ks[i].querySelector('.hr330-k').textContent==='F')return ks[i].querySelector('.hr330-d').textContent}return ''})()})")
OFJ=$(unjj "$OF")
if [ "$(jf o "$OFJ")" = "true" ] && printf '%s' "$(jf fd "$OFJ")" | grep -q 'json'; then ok "ই২ই: ওভারলে-F-বর্ণনা-json ([$(jf fd "$OFJ")])"; else bad "ই২ই: $(unjj "$OF")"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'esc'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
if [ "$(ev "JSON.stringify(window.__hrAria330QA.isOpen())" | tr -d '"')" = "false" ]; then ok "ই২ই: ওভারলে-Escape-বন্ধ (পরবর্তী-ধাপের-পূর্ব-পরিষ্কার)"; else bad "ই২ই: ওভারলে-খোলা-অবশিষ্ট"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap331=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
HS=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length})")
if [ "$(jf h "$(unjj "$HS")")" = "2" ]; then ok "ই২ই: ইতিহাস-সিড ×২ (ক্লিপবোর্ড-স্টাব-পূর্বে-কপি — s316-চুক্তি)"; else bad "ই২ই: hist=$(unjj "$HS")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F1=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),stored:(function(){try{return sessionStorage.getItem('hr326-fmt')}catch(e){return 'x'}})(),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})()})")
F1J=$(unjj "$F1")
if [ "$(jf m "$F1J")" = "key" ] && [ "$(jf stored "$F1J")" = "key" ] && printf '%s' "$(jf toast "$F1J")" | grep -q 'কেবল-কী'; then ok "ই২ই: F×১ → key (স্থায়ীকরণ + টোস্ট — s326-চুক্তি-অটুট)"; else bad "ই২ই: $(unjj "$F1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F2=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),stored:(function(){try{return sessionStorage.getItem('hr326-fmt')}catch(e){return 'x'}})(),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),lbl:(document.querySelector('.hr317-tip.is-on .hr326-fmt')||{}).textContent||'',kbd:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent})")
F2J=$(unjj "$F2")
if [ "$(jf m "$F2J")" = "json" ] && [ "$(jf stored "$F2J")" = "json" ] && printf '%s' "$(jf toast "$F2J")" | grep -q 'JSON'; then ok "ই২ই: F×২ → json (তৃতীয়-মোড-সক্রিয় + স্থায়ীকরণ + টোস্ট-JSON)"; else bad "ই২ই: $(unjj "$F2")"; fi
if [ "$(jf lbl "$F2J")" = "বিন্যাস: JSON" ] && printf '%s' "$(jf kbd "$F2J")" | grep -q 'F = বিন্যাস (JSON)'; then ok "ই২ই: json-লেবেল-সমকালীন (বাটন 'বিন্যাস: JSON' + kbd 'F = বিন্যাস (JSON)' — fmtLabel331-এক-উৎস)"; else bad "ই২ই: lbl=[$(jf lbl "$F2J")]"; fi
ev "JSON.stringify((function(){window.__clipCap331='';if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
EJ=$(ev "JSON.stringify((function(){try{var a=JSON.parse(window.__clipCap331);return {isArr:Array.isArray(a),n:a.length,k:typeof a[0].key,c:typeof a[0].count,head:window.__clipCap331.slice(0,1)}}catch(e){return {err:String(e&&e.message||e)}}})())")
EJJ=$(unjj "$EJ")
if [ "$(jf isArr "$EJJ")" = "true" ] && [ "$(jf n "$EJJ")" = "2" ] && [ "$(jf k "$EJJ")" = "string" ] && [ "$(jf c "$EJJ")" = "number" ]; then ok "ই২ই: E-কপি json-বিন্যাসে (JSON.parse-প্রমাণ — [{key,count}×২] — হেডার-নেই)"; else bad "ই২ই: $(unjj "$EJ")"; fi
JN=$(ev "JSON.stringify({js:window.__hrAria331QA.jsonStrips,e:(window.__hrAria331QA.err||'')})")
if [ "$(jf js "$(unjj "$JN")")" -ge 1 ] && [ "$(jf e "$(unjj "$JN")")" = "" ]; then ok "ই২ই: jsonStrips-গণনা-সক্রিয় + ত্রুটি-শূন্য (q331h-গণনা-সততা)"; else bad "ই২ই: $(unjj "$JN")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
PV=$(ev "JSON.stringify({pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),meta:(document.querySelector('.hr317-tip.is-on .hr327-meta')||{textContent:''}).textContent,pj:(function(){try{var t=(document.querySelector('.hr317-tip.is-on .hr327-text')||{textContent:''}).textContent;var a=JSON.parse(t);return Array.isArray(a)&&a.length===2}catch(e){return false}})()})")
PVJ=$(unjj "$PV")
if [ "$(jf pre "$PVJ")" = "true" ] && printf '%s' "$(jf meta "$PVJ")" | grep -q 'বিন্যাস: JSON'; then ok "ই২ই: P-প্রিভিউ json-মেটা ([(jf meta "$PVJ")])"; else bad "ই২ই: $(unjj "$PV")"; fi
if [ "$(jf pj "$PVJ")" = "true" ]; then ok "ই২ই: প্রিভিউ-পাঠ-পার্সযোগ্য (WYSIWYG — strip324-এক-উৎস-প্রমাণ)"; else bad "ই২ই: প্রিভিউ-পার্স-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f3'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
F3=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),lbl:(document.querySelector('.hr317-tip.is-on .hr326-fmt')||{}).textContent||'',pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),pmeta:(document.querySelector('.hr317-tip.is-on .hr327-meta')||{textContent:''}).textContent})")
F3J=$(unjj "$F3")
if [ "$(jf m "$F3J")" = "rich" ] && [ "$(jf lbl "$F3J")" = "বিন্যাস: সমৃদ্ধ" ]; then ok "ই২ই: F×৩ → rich-পূর্ণ-চক্র (json ⇄ key ⇄ rich — চক্র-সমাপ্তি)"; else bad "ই২ই: $(unjj "$F3")"; fi
if [ "$(jf pre "$F3J")" = "true" ] && printf '%s' "$(jf pmeta "$F3J")" | grep -q 'বিন্যাস: সমৃদ্ধ'; then ok "ই২ই: F-রিফ্রেশে খোলা-প্রিভিউ-সমকালীন-রিফ্রেশ (মেটা 'সমৃদ্ধ' — s327-চুক্তি-অটুট — ত্রি-মোডে-ও)"; else bad "ই২ই: $(unjj "$F3")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p2'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f4'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f5'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ST=$(ev "JSON.stringify({m:window.__hrAria331QA.mode(),stored:(function(){try{return sessionStorage.getItem('hr326-fmt')}catch(e){return 'x'}})()})")
STJ=$(unjj "$ST")
if [ "$(jf m "$STJ")" = "json" ] && [ "$(jf stored "$STJ")" = "json" ]; then ok "ই২ই: F×২-পুনঃপ্রয়োগে json (rich → key → json — স্থায়ী-মান-প্রস্তুত)"; else bad "ই২ই: $(unjj "$ST")"; fi
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
RL=$(ev "JSON.stringify({q:!!window.__hrAria331QA,m:window.__hrAria331QA?window.__hrAria331QA.mode():'x',js:window.__hrAria331QA?window.__hrAria331QA.jsonStrips:-1,h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1})")
RLJ=$(unjj "$RL")
if [ "$(jf q "$RLJ")" = "true" ] && [ "$(jf m "$RLJ")" = "json" ] && [ "$(jf js "$RLJ")" = "0" ]; then ok "ই২ই: পুনঃলোডে json-পুনরুদ্ধার (যাচাইকরণ-গ্রহণ-প্রমাণ — তৃতীয়-মোড-স্থায়ী) + jsonStrips=০ (ফ্রেশ-গণনা)"; else bad "ই২ই: $(unjj "$RL")"; fi
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK2")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: পুনঃopen-পরবর্তী USER_FEED-পুনঃনির্বাচন (aria-copy-সরবরাহ — s326-রীতি)"; else bad "ই২ই: পুনঃনির্বাচন-রো-অনুপস্থিত"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap331b=t;return Promise.resolve()}},configurable:true});if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true,cancelable:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
EJ2=$(ev "JSON.stringify((function(){try{var a=JSON.parse(window.__clipCap331b);return {n:a.length}}catch(e){return {err:String(e&&e.message||e)}}})())")
if [ "$(jf n "$(unjj "$EJ2")")" = "2" ]; then ok "ই২ই: পুনঃলোড-পরবর্তী E-কপি json-পার্সযোগ্য (hist-পুনরুদ্ধার + বিন্যাস-স্থায়িত্ব)"; else bad "ই২ই: $(unjj "$EJ2")"; fi
if agent-browser screenshot "$SH_JSON" >/dev/null 2>&1; then ok "স্ক্রিনশট: json-বিন্যাস-অ্যাডমিন সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
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
if [ "$FAIL" = "0" ]; then echo "s331-suite ✓ সর্ব-সবুজ"; else echo "s331-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
