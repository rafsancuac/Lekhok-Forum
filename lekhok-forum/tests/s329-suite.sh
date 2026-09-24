#!/bin/bash
# s329-suite.sh — session329: sfs329 keynav-পথের ৩৬০px-ক্ষুদ্র-ভ্যারিয়েন্ট-প্যারিটি + hr329 প্রিভিউ-অবস্থা-স্থায়ীকরণ + প্রিভিউ-ডাউনলোড
# [Task ID 166] PLANS session328-নোটের প্রস্তাব-② প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন; ③-গবেষণা-স্থগিত; ④-গেটেড):
#   sfs329 (style.css session329-ব্লক — কেবল-সংযোজন): s327-এর ৩৬০px-ভ্যারিয়েন্ট (৩৮%) keynav-গেটেও
#      ([data-sfs314-focus] × badge-on ~ chip-on — s328-সমবায়-নির্বাচক) — parity-নীতি-সমাপ্তি;
#      keynav-মূল-রুল-অস্পৃশ্য; MO-অবর্জন-চুক্তি-অটুট
#   hr329 (admin/home-reorder.ejs): sessionStorage 'hr327-pv'-স্থায়ীকরণ (togglePv327-মোড়ক — সর্ব-টগল-পথ
#      এক-উৎস) + প্রথম-ইতিহাসযুক্ত-রেন্ডারে পুনরুদ্ধার (pvRestored329-গেট — opens/closes-অস্পৃশ্য —
#      aria-সিঙ্ক — '· পুনরুদ্ধার'-মার্কার) + .hr329-dl ডাউনলোড-বাটন (renderPv327-মোড়ক — dlHist324-রীতি —
#      'lekhok-preview-YYYY-MM-DD.txt') + S-শর্টকাট (s320/s324-keydown-রীতি — শূন্য-ইতিহাসে নীরব) +
#      kbd-হিন্ট '· S = প্রিভিউ সংরক্ষণ' (মোড়ক-জুটি) + __hrAria329QA {restores, downloads, last, persist(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ডাউনলোড-স্টাব-পূর্বে-ক্লিক (s324) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি
#         (s316/s324/s327/s328) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক +
#         সুইট-রান = রিপো-রুট-cwd + গেট-সমাপ্তি-wait-৫০০০ms + jf/unjj-নিউলাইন-অসমতা (s327-গোটচা) +
#         hygiene-clear ×৩ (hr321-hist + hr326-fmt + hr327-pv — e2e-বিবর্তন-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_KV=/home/z/my-project/download/s329-keyparity-desk.png
SH_RS=/home/z/my-project/download/s329-restore-admin.png
SH_MOB=/home/z/my-project/download/s329-keynav360-mobile.png
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
(cd "$APP" && node db/migrate.js >/tmp/s329-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s329-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
CSS329=$(sed -n '/session329 (sfs329 keynav-পথের ৩৬০px-ক্ষুদ্র-ভ্যারিয়েন্ট-প্যারিটি)/,/EOF session329/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS329" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS329" ]; then ok "style.css: session329-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN বা ব্লক-অনুপস্থিত"; fi
printf '%s' "$CSS329" | grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs318-posbadge\[data-sfs318-on\] ~ .sfs319-namechip\[data-sfs319-on\]' && ok "style.css: keynav-৩৬০px-নির্বাচক (s328-সমবায়-নির্বাচক — কেবল-সংযোজন)" || bad "style.css: keynav-নির্বাচক-অনুপস্থিত"
printf '%s' "$CSS329" | grep -q '@media (max-width: 360px)' && printf '%s' "$CSS329" | grep -q 'max-width: 38%' && ok "style.css: ৩৬০px-ভ্যারিয়েন্ট (মান = s327-ট্যাপ-সমতা — ৩৮%)" || bad "style.css: ৩৬০px-ভ্যারিয়েন্ট-অমিল"
MOBN=$(grep -c 'new MutationObserver' "$APP/views/partials/home/feed.ejs" | tr -d ' ')
if [ "$MOBN" = "4" ]; then ok "feed.ejs: MO-গণনা=৪-অটুট (৫ম-MO-অবর্জন-চুক্তি — s326-গোটচা)"; else bad "feed.ejs: MO-গণনা=$MOBN (চুক্তি-ভাঙা!)"; fi
grep -q '.hr329-dl' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr329-dl-স্টাইল (স্বতন্ত্র-শ্রেণি — rgba-only)" || bad "home-reorder.ejs: .hr329-dl-অমিল"
grep -q 'border: 3px double rgba' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: double-বর্ডার (hr326-dashed/hr327-dotted/hr328-solid-পার্থক্ষ্য)" || bad "home-reorder.ejs: double-বর্ডার-অমিল"
grep -q '.hr327-meta.hr329-restored' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr329-restored-মার্কার-রুল" || bad "home-reorder.ejs: restored-রুল-অমিল"
grep -q "var tpOrig329 = togglePv327;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: togglePv327-মোড়ক (সর্ব-টগল-পথ এক-উৎস-স্থায়ী)" || bad "home-reorder.ejs: toggle-মোড়ক-অমিল"
grep -q "sessionStorage.setItem('hr327-pv'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: 'hr327-pv'-স্থায়ীকরণ (যাচাই-কৃত-মান — নীরব-অবনমন — hr326-রীতি)" || bad "home-reorder.ejs: স্থায়ীকরণ-অমিল"
grep -q "var rpOrig329 = renderPv327;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: renderPv327-মোড়ক (F-রিফ্রেশ-পথেও বাটন-টিকে)" || bad "home-reorder.ejs: render-মোড়ক-অমিল"
grep -q "bd329.className = 'hr329-dl';" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr329-dl-নির্মাণ (DOM-API/textContent-কেবল — XSS-নিরাপদ)" || bad "home-reorder.ejs: বাটন-নির্মাণ-অমিল"
grep -q "pre329.insertBefore(bd329, bc329.nextSibling);" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: copy-পরে-সন্নিবেশ (meta↔copy↔dl↔text-ক্রম)" || bad "home-reorder.ejs: সন্নিবেশ-ক্রম-অমিল"
grep -q "a329.download = 'lekhok-preview-'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Blob+a[download]+revoke (dlHist324-রীতি — ISO-তারিখ-ফাইলনাম)" || bad "home-reorder.ejs: ডাউনলোড-রীতি-অমিল"
grep -q "setTimeout(function () { URL.revokeObjectURL(u329); }, 400);" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: revokeObjectURL-পরিষ্কার (৪০০ms — hr324-সম-মান)" || bad "home-reorder.ejs: revoke-অমিল"
grep -q "flash324(btn329)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: flash324-পুনঃব্যবহার (ফ্ল্যাশ-এক-উৎস)" || bad "home-reorder.ejs: flash-অমিল"
grep -q "e329i.key !== 's' && e329i.key !== 'S'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: S-শর্টকাট (s320/s324-keydown-রীতি — C/D/E/F/P/X-অস্পৃশ্য)" || bad "home-reorder.ejs: S-শর্টকাট-অমিল"
FSGATE=$(grep -c "শূন্য-ইতিহাসে নীরব (hr323-দর্শন)" "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$FSGATE" -ge 5 ]; then ok "home-reorder.ejs: শূন্য-ইতিহাস-নীরব-গেট ×৫ (X + F + P + C + S-পথ — hr323-দর্শন)"; else bad "home-reorder.ejs: নীরব-গেট ×$FSGATE"; fi
grep -q "var pvRestored329 = false;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "sessionStorage.getItem('hr327-pv')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: পুনরুদ্ধার-গেট (pvRestored329 — প্রতি-পৃষ্ঠা-লোডে একবার)" || bad "home-reorder.ejs: পুনরুদ্ধার-গেট-অমিল"
grep -q "bs329.setAttribute('aria-expanded', 'true')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: aria-সিঙ্ক-পুনরুদ্ধারে (টগল-পথ-নিরপেক্ষ — s327-গোটচা-②-চুক্তি)" || bad "home-reorder.ejs: aria-সিঙ্ক-অমিল"
grep -q "mt329.textContent + ' · পুনরুদ্ধার'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: '· পুনরুদ্ধার'-মার্কার (meta — ব্যবহারকারী-দৃশ্যমান-ধারাবাহিকতা)" || bad "home-reorder.ejs: মার্কার-অমিল"
grep -q "var cf329 = cycleFmt326;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "var trOrig329 = tipRender318;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: হিন্ট-মোড়ক-জুটি (cycleFmt326 + tipRender318 — 'S = প্রিভিউ সংরক্ষণ' — C-হিন্ট-চেইন-পরবর্তী)" || bad "home-reorder.ejs: হিন্ট-মোড়ক-অমিল"
grep -q "window.__hrAria329QA = q329h" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "window.__hrAria328QA = q328h" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria329QA-হুক + s328-হুক-সহাবস্থান" || bad "home-reorder.ejs: QA-হুক-অমিল"
A329CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria329QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A329CHK" = "OK" ]; then ok "home-reorder.ejs: hr329-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs327QA'; then ok "SSR: __sfs327QA-হুক-অটুট (s327-সহাবস্থান)"; else bad "SSR: s327-হুক-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: __sfs326QA-হুক-অটুট (s326-সহাবস্থান)"; else bad "SSR: s326-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs329-ই২ই (keynav-গাটার-সহাবস্থান → ৩৬০px-প্যারিটি → Escape-প্রত্যাহার) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
K1=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf chipOn "$K1")" = "true" ] && [ "$(jf badgeOn "$K1")" = "true" ] && [ "$(jf right "$K1")" = "84px" ]; then ok "ই২ই: keynav-গাটার-সহাবস্থান (s328-মান-অটুট — right=৮৪px — computed)"; else bad "ই২ই: $(unjj "$K1")"; fi
if agent-browser screenshot "$SH_KV" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-keynav-সম-প্রদর্শন সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 360 740 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k360'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M360=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
MW360=$(jf maxw "$M360")
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" >/dev/null 2>&1
agent-browser wait 1400 >/dev/null 2>&1
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k390'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M390=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
MW390=$(jf maxw "$M390")
MWLT=$(python3 -c "
def num(s):
    s = (s or '').replace('px','').replace('%','').strip()
    try: return float(s)
    except: return -1
print(1 if num('${MW360:-}') >= 0 and num('${MW390:-}') >= 0 and num('${MW360:-}') < num('${MW390:-}') else 0)")
if [ "$MWLT" = "1" ]; then ok "ই২ই: ৩৬০px-keynav-ক্ষুদ্র-ভ্যারিয়েন্ট (max-width $MW360 < $MW390 — s327-ট্যাপ-সমতা-প্যারিটি-প্রমাণ)"; else bad "ই২ই: maxw360=$MW360 maxw390=$MW390"; fi
if [ "$(jf badgeOn "$M360")" = "true" ] && [ "$(jf chipOn "$M360")" = "true" ]; then ok "ই২ই: ৩৬০px-এ keynav-সম-প্রদর্শন (ব্যাজ × চিপ — সংঘর্ষ-প্রেক্ষাপট-সক্রিয়)"; else bad "ই২ই: ৩৬০px-সম-প্রদর্শন=$(unjj "$M360")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: ৩৬০px-keynav সংরক্ষিত"; else skip "৩৬০px-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T2=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf badgeOn "$T2")" = "false" ] && [ "$(jf right "$T2")" = "60px" ]; then ok "ই২ই: Escape → গাটার-স্বয়ং-প্রত্যাহার (right→৬০px — ≤640px-বেস-মান — keynav-মূল-রুল-অটুট-পুনঃপ্রমাণ)"; else bad "ই২ই: $(unjj "$T2")"; fi
agent-browser wait 5000 >/dev/null 2>&1
T3=$(unjj "$(ev "JSON.stringify(window.__sfs327QA.probe())")")
if [ "$(jf chipOn "$T3")" = "false" ]; then ok "ই২ই: গেট-সমাপ্তি → চিপ-বিলোপ (s322-গেট — অস্পৃশ্য-পুনঃপ্রমাণ)"; else bad "ই২ই: $(unjj "$T3")"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: hr329-ই২ই (স্থায়ীকরণ→ডাউনলোড→S-শর্টকাট→F-টিকে→পুনরুদ্ধার→বন্ধ-স্থায়ী→শূন্য-নীরব) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria329QA,r:window.__hrAria329QA?window.__hrAria329QA.restores:-1,d:window.__hrAria329QA?window.__hrAria329QA.downloads:-1,e:((window.__hrAria329QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf r "$H0J")" = "0" ] && [ "$(jf d "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria329QA-হুক + restores=downloads=০"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap329=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,kbS:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('S = প্রিভিউ সংরক্ষণ')>=0,kbC:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('C = প্রিভিউ কপি')>=0})")
B1J=$(unjj "$B1")
if [ "$(jf h "$B1J")" = "2" ] && [ "$(jf kbS "$B1J")" = "true" ] && [ "$(jf kbC "$B1J")" = "true" ]; then ok "ই২ই: kbd-হিন্ট-চেইন (C = প্রিভিউ কপি + S = প্রিভিউ সংরক্ষণ — সম-সারিতে)"; else bad "ই২ই: $(unjj "$B1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
P1=$(ev "JSON.stringify({o:window.__hrAria327QA.opens,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),dl:!!document.querySelector('.hr317-tip.is-on .hr329-dl'),lb:(document.querySelector('.hr317-tip.is-on .hr329-dl')||{textContent:''}).textContent,al:(document.querySelector('.hr317-tip.is-on .hr329-dl')||{getAttribute:function(){return ''}}).getAttribute('aria-label'),pv:window.__hrAria329QA.persist()})")
P1J=$(unjj "$P1")
if [ "$(jf o "$P1J")" = "1" ] && [ "$(jf pre "$P1J")" = "true" ] && [ "$(jf dl "$P1J")" = "true" ] && [ "$(jf lb "$P1J")" = "সংরক্ষণ" ]; then ok "ই২ই: প্রিভিউ-খোলা → .hr329-dl-বাটন ('সংরক্ষণ' — copy-পরে)"; else bad "ই২ই: $(unjj "$P1")"; fi
if printf '%s' "$(jf al "$P1J")" | grep -q '.txt ফাইলে ডাউনলোড'; then ok "ই২ই: aria-label (txt-ডাউনলোড-বর্ণনা)"; else bad "ই২ই: al=[$(jf al "$P1J")]"; fi
if [ "$(jf pv "$P1J")" = "open" ]; then ok "ই২ই: টগল → 'hr327-pv'=open-স্থায়ী (persist()-প্রমাণ)"; else bad "ই২ই: pv=[$(jf pv "$P1J")]"; fi
ev "JSON.stringify((function(){window.__dlStub329={urls:[],clicks:0,name:''};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub329.urls.push(String(b&&b.size));return 'blob:qa-stub'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub329.clicks+=1;window.__dlStub329.name=this.getAttribute('download')||'';return}return ocl.call(this)};return 'dstub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr329-dl');if(!b)return 'nb';b.click();return 'dl1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D1=$(ev "JSON.stringify({d:window.__hrAria329QA.downloads,ck:window.__dlStub329.clicks,nm:window.__dlStub329.name,sz:(window.__dlStub329.urls[0]||'')})")
D1J=$(unjj "$D1")
NM=$(jf nm "$D1J")
if [ "$(jf d "$D1J")" = "1" ] && [ "$(jf ck "$D1J")" = "1" ]; then ok "ই২ই: বাটন-ডাউনলোড (Blob+anchor-click — স্টাব-প্রমাণ)"; else bad "ই২ই: $(unjj "$D1")"; fi
if printf '%s' "$NM" | grep -qE '^lekhok-preview-[0-9]{4}-[0-9]{2}-[0-9]{2}\.txt$' && [ "$(jf sz "$D1J")" != "" ] && [ "$(jf sz "$D1J")" != "0" ]; then ok "ই২ই: ডাউনলোড-ফাইলনাম+বিষয়বস্তু ([$NM] — ISO-তারিখ + non-empty-blob)"; else bad "ই২ই: nm=[$NM] sz=[$(jf sz "$D1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true,cancelable:true}));return 's1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D2=$(ev "JSON.stringify({d:window.__hrAria329QA.downloads,ck:window.__dlStub329.clicks})")
D2J=$(unjj "$D2")
if [ "$(jf d "$D2J")" = "2" ] && [ "$(jf ck "$D2J")" = "2" ]; then ok "ই২ই: S-কী-ডাউনলোড (খোলা-প্রিভিউয়ে — downloads=২)"; else bad "ই২ই: $(unjj "$D2")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
F1=$(ev "JSON.stringify({m:window.__hrAria326QA.mode(),dl:!!document.querySelector('.hr317-tip.is-on .hr329-dl'),pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),kbS:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('S = প্রিভিউ সংরক্ষণ')>=0})")
F1J=$(unjj "$F1")
if [ "$(jf m "$F1J")" = "key" ] && [ "$(jf dl "$F1J")" = "true" ] && [ "$(jf pre "$F1J")" = "true" ] && [ "$(jf kbS "$F1J")" = "true" ]; then ok "ই২ই: F-রিফ্রেশ-পরেও .hr329-dl-টিকে (renderPv327-মোড়ক — key-বিন্যাস + S-হিন্ট-টিকে)"; else bad "ই২ই: $(unjj "$F1")"; fi
if agent-browser screenshot "$SH_RS" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-ডাউনলোড-বাটন সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK2")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: পুনঃopen + USER_FEED-পুনঃনির্বাচন (flag=open + ইতিহাস=২-স্থায়ী)"; else bad "ই২ই: পুনঃনির্বাচন-রো-অনুপস্থিত"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
R1=$(ev "JSON.stringify({r:window.__hrAria329QA.restores,o:window.__hrAria327QA.opens,cl:window.__hrAria327QA.closes,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre'),ex:(document.querySelector('.hr317-tip.is-on .hr327-pv')||{getAttribute:function(){return ''}}).getAttribute('aria-expanded'),mt:(document.querySelector('.hr317-tip.is-on .hr327-meta')||{textContent:''}).textContent,mc:(document.querySelector('.hr317-tip.is-on .hr327-meta')||{classList:{contains:function(){return false}}}).classList.contains('hr329-restored'),dl:!!document.querySelector('.hr317-tip.is-on .hr329-dl')})")
R1J=$(unjj "$R1")
if [ "$(jf r "$R1J")" = "1" ] && [ "$(jf o "$R1J")" = "0" ] && [ "$(jf cl "$R1J")" = "0" ] && [ "$(jf pre "$R1J")" = "true" ]; then ok "ই২ই: পুনঃলোডে প্রিভিউ-স্বয়ং-পুনরুদ্ধার (restores=১ + opens/closes-অস্পৃশ্য — গণনা-সততা)"; else bad "ই২ই: $(unjj "$R1")"; fi
if [ "$(jf ex "$R1J")" = "true" ] && [ "$(jf mc "$R1J")" = "true" ]; then ok "ই২ই: aria-expanded=true + .hr329-restored-শ্রেণি (টগল-পথ-নিরপেক্ষ-সিঙ্ক)"; else bad "ই২ই: ex=[$(jf ex "$R1J")] mc=[$(jf mc "$R1J")]"; fi
MT=$(printf '%s' "$(jf mt "$R1J")")
if printf '%s' "$MT" | grep -q 'পুনরুদ্ধার'; then ok "ই২ই: meta-তে '· পুনরুদ্ধার'-মার্কার (ব্যবহারকারী-দৃশ্যমান)"; else bad "ই২ই: meta=[$MT]"; fi
if [ "$(jf dl "$R1J")" = "true" ]; then ok "ই২ই: পুনরুদ্ধার-প্রিভিউয়েও .hr329-dl-উপস্থিত (render-মোড়ক-এক-উৎস)"; else bad "ই২ই: dl-অনুপস্থিত"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr327-pv');if(!b)return 'nb';b.click();return 'pc1'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
PC=$(ev "JSON.stringify({c:window.__hrAria327QA.closes,pv:window.__hrAria329QA.persist()})")
PCJ=$(unjj "$PC")
if [ "$(jf c "$PCJ")" = "1" ] && [ "$(jf pv "$PCJ")" = "closed" ]; then ok "ই২ই: বন্ধ-টগল → 'hr327-pv'=closed-স্থায়ী (closes=১)"; else bad "ই২ই: $(unjj "$PC")"; fi
bopen "$BASE/admin/home-reorder" >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
CLK3=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
[ "$(jf ok "$(unjj "$CLK3")")" = "1" ] && agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f3'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
R2=$(ev "JSON.stringify({r:window.__hrAria329QA.restores,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')})")
R2J=$(unjj "$R2")
if [ "$(jf r "$R2J")" = "0" ] && [ "$(jf pre "$R2J")" = "false" ]; then ok "ই২ই: 'closed'-অবস্থায় পুনঃলোডে পুনরুদ্ধার-নেই (ফ্রেশ-পৃষ্ঠায় restores=০ + pre-অনুপস্থিত — দ্বি-মুখী-স্থায়ীকরণ)"; else bad "ই২ই: $(unjj "$R2")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd1'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd2'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1
Z1=$(ev "JSON.stringify((function(){var d0=window.__hrAria329QA.downloads;var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true,cancelable:true}));return {h:window.__hrAria317QA.hist().length,d0:d0,d1:window.__hrAria329QA.downloads,pre:!!document.querySelector('.hr317-tip.is-on .hr327-pre')}})())")
Z1J=$(unjj "$Z1")
if [ "$(jf h "$Z1J")" = "0" ] && [ "$(jf d0 "$Z1J")" = "$(jf d1 "$Z1J")" ] && [ "$(jf pre "$Z1J")" = "false" ]; then ok "ই২ই: শূন্য-ইতিহাসে S-নীরব (Delete×২-পরিষ্কার + downloads-অপরিবর্তিত + প্রিভিউ-অনুপস্থিত — hr323-দর্শন)"; else bad "ই২ই: $(unjj "$Z1")"; fi
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr327-pv')}catch(e){};return 'hyg'})())" >/dev/null 2>&1

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + হুক + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs327QA,err:(window.__sfs327QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs327QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s329-suite ✓ সর্ব-সবুজ"; else echo "s329-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
