#!/bin/bash
# s318-suite.sh — session318: sfs318 keynav-অবস্থান-ব্যাজ + hr318 টুলটিপ-সম্পূর্ণ-ইতিহাস-তালিকা
# [Task ID 155] PLANS session317-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs318 (feed.ejs) — sfs317-SR-ঘোষণার দৃশ্যমান-সমকক্ষ: keynav-হাইলাইট-মুহূর্তে
#      ফোন-প্রিভিউতে ছোট-ব্যাজ "n/মোট" (বাংলা-অঙ্ক); aria-hidden ডেকোরেটিভ (kbdhint-পূর্বাদাহ);
#      phone-অ্যাংকরড absolute (frame static — layout-neutral); দ্বি-গেট
#      [data-sfs314-focus] × [data-sfs318-on] — মাউস-ব্যবহারকারীর জন্য চির-অদৃশ্য;
#      __sfs318Show/__sfs318Hide guarded-হুক + __sfs318QA {shown, last, badge(), on(), text(), err}
#   ③ hr318 (admin/home-reorder.ejs) — hr317-টুলটিপ দ্বি-স্তরে: .hr318-sum (এক-লাইন-সারাংশ —
#      hr317-পাঠ-চুক্তি অটুট) + .hr318-list (hist ×১২ সর্বশেষ-প্রথম — "key · n বার · সময়-আগে";
#      চলতি-কী-সারি is-cur); DOM-API-নির্মাণ (XSS-নিরাপদ); __hrAria318QA {rows(), cur(), list(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + transition-পরবর্তী-অ্যাসার্ট (wait ≥৪০০ms) +
#         ক্লিপবোর্ড-স্টাব (defineProperty — s316-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_BADGE=/home/z/my-project/download/s318-posbadge-desk.png
SH_TIP=/home/z/my-project/download/s318-histlist-admin.png
SH_MOB=/home/z/my-project/download/s318-posbadge-mobile390.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
unjj(){ printf '%s' "$1" | sed 's/^"//; s/"$//; s/\\"/"/g'; }
jdec2(){ printf '%s' "$1" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if isinstance(d, str):
    try: d = json.loads(d)
    except Exception: pass
print(d)" 2>/dev/null; }
viswait(){ # headless-frame-starvation × transition-computed-চুক্তি: computed-visibility-পোল (৬×০.৬s)
  local i v want="$1"
  for i in 1 2 3 4 5 6; do
    v=$(ev "getComputedStyle(document.querySelector('.sfs318-posbadge')).visibility" | tr -d '"')
    if [ "$v" = "$want" ]; then printf '%s' "$v"; return 0; fi
    sleep 0.6
  done
  printf '%s' "$v"; return 1
}
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
    if [ "$u" = "$1" ]; then agent-browser reload >/dev/null 2>&1; return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s318-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s318-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q '<span class="sfs318-posbadge" aria-hidden="true"></span>' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfs318-posbadge-মার্কআপ (aria-hidden — kbdhint-পূর্বাদাহ)" || bad "feed.ejs: ব্যাজ-মার্কআপ-অমিল"
grep -q 'if (window.__sfs318Show) window.__sfs318Show(labs314\[i314\], i314, labs314.length)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: apply314-এ __sfs318Show guarded-হুক" || bad "feed.ejs: show-হুক-অমিল"
grep -q 'if (window.__sfs318Hide) window.__sfs318Hide();' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: clear314-এ __sfs318Hide guarded-হুক" || bad "feed.ejs: hide-হুক-অমিল"
grep -q 'window.__sfs318QA = q318' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs318QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q "'০১২৩৪৫৬৭৮৯'" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: বাংলা-অঙ্ক-ম্যাপার (s317-রীতি)" || bad "feed.ejs: অঙ্ক-ম্যাপার-অমিল"
grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs318-posbadge\[data-sfs318-on\]' "$APP/public/assets/css/style.css" && ok "style.css: দ্বি-গেট ([data-sfs314-focus] × [data-sfs318-on])" || bad "style.css: দ্বি-গেট-অমিল"
CSS318=$(sed -n '/session318 (sfs318 keynav-অবস্থান-ব্যাজ)/,/EOF session318/p' "$APP/public/assets/css/style.css")
printf '%s' "$CSS318" | grep -q 'prefers-reduced-motion' && ok "style.css: session318-ব্লকে reduced-motion" || bad "style.css: reduced-motion-অনুপস্থিত"
HEXN=$(printf '%s' "$CSS318" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session318-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS318" | grep -q 'color-mix(in srgb, var(--lf-slate-deeper)' && ok "style.css: color-mix + var-টোকেন (kbdhint-রীতি)" || bad "style.css: var-টোকেন-অমিল"
grep -q '.hr318-sum' "$APP/admin/views/admin/home-reorder.ejs" && grep -q '.hr318-list' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr318-sum + .hr318-list স্টাইল (ফাইল-রীতি)" || bad "home-reorder.ejs: hr318-স্টাইল-অমিল"
grep -q '.hr318-row.is-cur' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr318-row.is-cur (চলতি-কী-হাইলাইট)" || bad "home-reorder.ejs: is-cur-অমিল"
grep -q 'var tipRender318' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: tipRender318-সংজ্ঞা (sum+list এক-উৎস)" || bad "home-reorder.ejs: tipRender318-অনুপস্থিত"
grep -q "tipRender318(b317.getAttribute" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: tipShow317→tipRender318-সংযুক্ত" || bad "home-reorder.ejs: show-সংযুক্তি-অমিল"
grep -q "tipRender318(tipBtn317.getAttribute" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: রেকর্ড-রিফ্রেশ→tipRender318 (sum+list-উভয়)" || bad "home-reorder.ejs: রিফ্রেশ-সংযুক্তি-অমিল"
grep -q "window.__hrAria318QA" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria318QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q "'.hr317-tip.is-on .hr318-sum'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: text() sum-ফলব্যাক (hr317-পাঠ-চুক্তি অটুট)" || bad "home-reorder.ejs: text()-ফলব্যাক-অমিল"
S318CHK=$(python3 -c "
import io, re, subprocess
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session318.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
io.open('/tmp/s318-engine.js','w',encoding='utf-8').write(m.group(1))
r = subprocess.run(['node','--check','/tmp/s318-engine.js'], capture_output=True, text=True)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S318CHK" = "OK" ]; then ok "feed.ejs: session318-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: ব্যাজ-মার্কআপ ×১ (একক-উদাহরণ)"; else bad "SSR: ব্যাজ ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি — ব্যাজ aria-hidden-বহির্ভূত-নাম)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi
GT=$(printf '%s' "$SS0" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (s313-অটুট)"; else bad "SSR: glabel ×$GT"; fi
printf '%s' "$SS0" | grep -q 'class="sfs317-live"' && ok "SSR: sfs317-live-অঞ্চল-অটুট (সমান্তরাল-সহাবস্থান)" || bad "SSR: live-অঞ্চল-অনুপস্থিত"
GR=$(printf '%s' "$SS0" | grep -o 'class="sfs314-grows"' | wc -l | tr -d ' ')
if [ "$GR" = "2" ]; then ok "SSR: aria-জোড়া ×২ (s314-অটুট)"; else bad "SSR: grows ×$GR"; fi

echo "── ধাপ-৩: sfs318-ই২ই (ব্যাজ-জীবনচক্র: প্রদর্শন→হালনাগাদ→বিলোপ→ওয়ার্প→blur) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({b:window.__sfs318QA?window.__sfs318QA.badge():null,on:window.__sfs318QA?window.__sfs318QA.on():null,tx:window.__sfs318QA?window.__sfs318QA.text():'',err:(window.__sfs318QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf b "$Q0J")" = "true" ]; then ok "ই২ই: __sfs318QA-হুক + ব্যাজ-ডম-উপস্থিত"; else bad "ই২ই: b=$(jf b "$Q0J")"; fi
if [ "$(jf on "$Q0J")" = "false" ] && [ -z "$(jf tx "$Q0J")" ]; then ok "ই২ই: প্রারম্ভিক-অবস্থা — নিষ্ক্রিয় + পাঠ-শূন্য"; else bad "ই২ই: on=$(jf on "$Q0J") tx=[$(jf tx "$Q0J")]"; fi
if [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$Q0J")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim()}})())")
LBJ=$(unjj "$LB"); L0=$(jf l0 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] …)"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
A1=$(ev "JSON.stringify({on:window.__sfs318QA.on(),tx:window.__sfs318QA.text(),sh:window.__sfs318QA.shown,sr:window.__sfs317QA.last,at:document.querySelector('.sfs292-phone').getAttribute('data-sfs314-focus')})")
A1J=$(unjj "$A1")
if [ "$(jf tx "$A1J")" = "১/২" ]; then ok "ই২ই: ব্যাজ-১ = ১/২ (বাংলা-অবস্থান)"; else bad "ই২ই: tx=[$(jf tx "$A1J")]"; fi
if [ "$(jf on "$A1J")" = "true" ] && [ "$(jf sh "$A1J")" = "1" ]; then ok "ই২ই: data-sfs318-on-গেট-খোলা (shown=১)"; else bad "ই২ই: on=$(jf on "$A1J") sh=$(jf sh "$A1J")"; fi
case "$(jf sr "$A1J")" in *"$L0"*"১/২"*) ok "ই২ই: sfs317-ঘোষণা-সমান্তরাল-অটুট";; *) bad "ই২ই: sr=[$(jf sr "$A1J")]";; esac
ATV=$(jf at "$A1J")
if [ -n "$ATV" ] && [ "$ATV" != "None" ]; then ok "ই২ই: data-sfs314-focus-সিঙ্ক ($ATV)"; else bad "ই২ই: at-অনুপস্থিত"; fi
V1V=$(viswait visible)
if [ "$V1V" = "visible" ]; then ok "ই২ই: computed-দৃশ্যমান (দ্বি-গেট-CSS-প্রয়োগ — পোল-স্থিতি)"; else bad "ই২ই: v=$V1V (পোল-নিঃশেষ)"; fi
AH=$(ev "String(document.querySelector('.sfs318-posbadge').getAttribute('aria-hidden'))" | tr -d '"')
if [ "$AH" = "true" ]; then ok "ই২ই: aria-hidden-ডেকোরেটিভ (accessible-name-অপরিবর্তিত)"; else bad "ই২ই: ah=$AH"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A2=$(ev "JSON.stringify({tx:window.__sfs318QA.text(),sh:window.__sfs318QA.shown})")
if [ "$(jf tx "$(unjj "$A2")")" = "২/২" ] && [ "$(jf sh "$(unjj "$A2")")" = "2" ]; then ok "ই২ই: ব্যাজ-২ = ২/২ (হালনাগাদ)"; else bad "ই২ই: tx=[$(jf tx "$(unjj "$A2")")]"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
sleep 1
A3=$(ev "JSON.stringify({on:window.__sfs318QA.on(),tx:window.__sfs318QA.text(),v:getComputedStyle(document.querySelector('.sfs318-posbadge')).visibility,at:document.querySelector('.sfs292-phone').getAttribute('data-sfs314-focus')})")
A3J=$(unjj "$A3")
if [ -z "$(jf tx "$A3J")" ] && [ "$(jf on "$A3J")" = "false" ]; then ok "ই২ই: Escape→ব্যাজ-বিলোপ (পাঠ-শূন্য)"; else bad "ই২ই: tx=[$(jf tx "$A3J")]"; fi
A3V=$(viswait hidden)
if [ "$A3V" = "hidden" ]; then ok "ই২ই: Escape→computed-অদৃশ্য (পোল-স্থিতি)"; else bad "ই২ই: v=$A3V (পোল-নিঃশেষ)"; fi
if [ -z "$(jf at "$A3J")" ] || [ "$(jf at "$A3J")" = "None" ]; then ok "ই২ই: Escape→data-sfs314-focus-বিলোপ (s314-অটুট)"; else bad "ই২ই: at=$(jf at "$A3J")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return 'u1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A4=$(ev "JSON.stringify({tx:window.__sfs318QA.text(),sh:window.__sfs318QA.shown})")
A4J=$(unjj "$A4")
if [ "$(jf tx "$A4J")" = "২/২" ] && [ "$(jf sh "$A4J")" = "3" ]; then ok "ই২ই: ArrowUp→ওয়ার্প-পুনঃপ্রদর্শন (২/২, shown=৩)"; else bad "ই২ই: tx=[$(jf tx "$A4J")] sh=$(jf sh "$A4J")"; fi
if agent-browser screenshot "$SH_BADGE" >/dev/null 2>&1; then ok "স্ক্রিনশট: অবস্থান-ব্যাজ (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();p.blur();return 'bl'})())" >/dev/null 2>&1
sleep 1
A5=$(ev "JSON.stringify({on:window.__sfs318QA.on(),v:getComputedStyle(document.querySelector('.sfs318-posbadge')).visibility})")
if [ "$(jf on "$(unjj "$A5")")" = "false" ] && [ "$(jf v "$(unjj "$A5")")" = "hidden" ]; then ok "ই২ই: blur→ব্যাজ-বিলোপ (s314-blur-চুক্তি-সমান্তরাল)"; else bad "ই২ই: blur-পরবর্তী on=$(jf on "$(unjj "$A5")") v=$(jf v "$(unjj "$A5")")"; fi

echo "── ধাপ-৪: hr318-ই২ই (সম্পূর্ণ-ইতিহাস-তালিকা: sum+list দ্বি-স্তর) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1,q:!!window.__hrAria318QA,b:window.__hrAria316QA?window.__hrAria316QA.btns():-1,err:((window.__hrAria317QA||{}).err||'')+((window.__hrAria318QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf h "$H0J")" = "0" ]; then ok "ই২ই: ইতিহাস-প্রারম্ভিক-শূন্য"; else bad "ই২ই: hist=$(jf h "$H0J")"; fi
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf b "$H0J")" = "2" ]; then ok "ই২ই: __hrAria318QA-হুক + কপি-বাটন ×২ (hr316-অটুট)"; else bad "ই২ই: q=$(jf q "$H0J") b=$(jf b "$H0J")"; fi
if [ "$(jf err "$H0J")" = "" ]; then ok "ই২ই: hr317+hr318-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$H0J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
T1=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),tx:window.__hrAria317QA.text(),rows:window.__hrAria318QA.rows(),cur:window.__hrAria318QA.cur()})")
T1J=$(unjj "$T1")
if [ "$(jf tip "$T1J")" = "true" ]; then ok "ই২ই: hover→টুলটিপ-দৃশ্যমান"; else bad "ই২ই: tip=$(jf tip "$T1J")"; fi
if [ "$(jf tx "$T1J")" = "এখনো কপি হয়নি" ] && [ "$(jf rows "$T1J")" = "0" ]; then ok "ই২ই: কখনো-কপি-হয়নি — sum-কেবল (তালিকা-অনুপস্থিত, hr317-চুক্তি)"; else bad "ই২ই: tx=[$(jf tx "$T1J")] rows=$(jf rows "$T1J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "false" ]; then ok "ই২ই: mouseout→টুলটিপ-বিলোপ"; else bad "ই২ই: mouseout-পরবর্তী-দৃশ্যমান"; fi
CS=$(ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap318=t;return Promise.resolve()}},configurable:true});return 'stub'})())")
CAP=$(jdec2 "$(ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.click();return String(b.getAttribute('data-copy'))})())")")
agent-browser wait 500 >/dev/null 2>&1
C1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,c:window.__hrAria316QA.copied,cap:window.__clipCap318||''})")
C1J=$(unjj "$C1")
if [ "$(jf h "$C1J")" = "1" ] && [ "$(jf cap "$C1J")" = "$CAP" ]; then ok "ই২ই: ক্লিপবোর্ড-স্টাব-কপি → রেকর্ড (hist=১, ক্যাপচার==copied)"; else bad "ই২ই: h=$(jf h "$C1J") cap=[$(jf cap "$C1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T2=$(ev "JSON.stringify({tx:window.__hrAria317QA.text(),rows:window.__hrAria318QA.rows(),cur:window.__hrAria318QA.cur(),l0:window.__hrAria318QA.list()[0]||''})")
T2J=$(unjj "$T2")
case "$(jf tx "$T2J")" in "সর্বশেষ কপি: "$CAP*) ok "ই২ই: sum-সারাংশ = সর্বশেষ-কপি-পাঠ (hr317-চুক্তি-অটুট)";; *) bad "ই২ই: tx=[$(jf tx "$T2J")]";; esac
if [ "$(jf rows "$T2J")" = "1" ] && [ "$(jf cur "$T2J")" = "1" ]; then ok "ই২ই: তালিকা-১-সারি + চলতি-কী is-cur"; else bad "ই২ই: rows=$(jf rows "$T2J") cur=$(jf cur "$T2J")"; fi
case "$(jf l0 "$T2J")" in "$CAP"*"১ বার"*"এইমাত্র"*) ok "ই২ই: সারি-পাঠ = key · ১ বার · এইমাত্র";; *) bad "ই২ই: l0=[$(jf l0 "$T2J")]";; esac
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
C2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,r:window.__hrAria318QA.rows()})")
if [ "$(jf h "$(unjj "$C2")")" = "2" ]; then ok "ই২ই: দ্বিতীয়-কপি → hist=২ (খোলা-টুলটিপ-রিফ্রেশ — rows=$(jf r "$(unjj "$C2")"))"; else bad "ই২ই: h=$(jf h "$(unjj "$C2")")"; fi
CAPB=$(jdec2 "$(ev "JSON.stringify(String(document.querySelectorAll('.hr-aria-copy')[1].getAttribute('data-copy')))")")
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T3=$(ev "JSON.stringify({rows:window.__hrAria318QA.rows(),cur:window.__hrAria318QA.cur(),l:window.__hrAria318QA.list(),tx:window.__hrAria317QA.text()})")
T3J=$(unjj "$T3")
if [ "$(jf rows "$T3J")" = "2" ] && [ "$(jf cur "$T3J")" = "1" ]; then ok "ই২ই: তালিকা-২-সারি + is-cur ×১ (কেবল-চলতি-কী)"; else bad "ই২ই: rows=$(jf rows "$T3J") cur=$(jf cur "$T3J")"; fi
L0A=$(printf '%s' "$T3J" | python3 -c "import sys,json;print(json.load(sys.stdin).get('l',[''])[0])" 2>/dev/null)
L1A=$(printf '%s' "$T3J" | python3 -c "import sys,json;d=json.load(sys.stdin);l=d.get('l',[]);print(l[1] if len(l)>1 else '')" 2>/dev/null)
case "$L0A" in "$CAPB"*) ok "ই২ই: তালিকা-ক্রম সর্বশেষ-প্রথম (সারি-১ = $CAPB)";; *) bad "ই২ই: l0=[$L0A]";; esac
case "$L1A" in "$CAP"*) ok "ই২ই: সারি-২ = পূর্ববর্তী-কপি ($CAP)";; *) bad "ই২ই: l1=[$L1A]";; esac
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "false" ]; then ok "ই২ই: Escape→টুলটিপ-বিলোপ"; else bad "ই২ই: Escape-পরবর্তী-দৃশ্যমান"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T4=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),rows:window.__hrAria318QA.rows(),cur:window.__hrAria318QA.cur(),tx:window.__hrAria317QA.text()})")
T4J=$(unjj "$T4")
if [ "$(jf tip "$T4J")" = "true" ] && [ "$(jf rows "$T4J")" = "2" ] && [ "$(jf cur "$T4J")" = "1" ]; then ok "ই২ই: focus→নিজস্ব-স্টেট + পূর্ণ-তালিকা (is-cur ×১)"; else bad "ই২ই: tip=$(jf tip "$T4J") rows=$(jf rows "$T4J") cur=$(jf cur "$T4J")"; fi
case "$(jf tx "$T4J")" in "সর্বশেষ কপি: "$CAP*) ok "ই২ই: focus-sum = নিজস্ব-কী-সারাংশ";; *) bad "ই২ই: tx=[$(jf tx "$T4J")]";; esac
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.click();return 'c3'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
C3=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,n:window.__hrAria317QA.hist()[0].n,l0:window.__hrAria318QA.list()[0]||''})")
C3J=$(unjj "$C3")
if [ "$(jf h "$C3J")" = "2" ] && [ "$(jf n "$C3J")" = "2" ]; then ok "ই২ই: পুনঃকপি → n=২ (ডুপ-নেই — s317-রেজিস্ট্রি-অটুট)"; else bad "ই২ই: h=$(jf h "$C3J") n=$(jf n "$C3J")"; fi
case "$(jf l0 "$C3J")" in "$CAP"*"২ বার"*) ok "ই২ই: রিফ্রেশড-তালিকা-সারি-১ = ২ বার (live-হালনাগাদ)";; *) bad "ই২ই: l0=[$(jf l0 "$C3J")]";; esac
if agent-browser screenshot "$SH_TIP" >/dev/null 2>&1; then ok "স্ক্রিনশট: সম্পূর্ণ-ইতিহাস-তালিকা-টুলটিপ (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ব্যাজ-মোবাইল-গেট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,pb:document.querySelectorAll('.sfs318-posbadge').length,e318:(window.__sfs318QA||{}).err||'',pr:(window.__sfs314QA||{}).pairs})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf pb "$MJ")" = "1" ]; then ok "মোবাইলে ব্যাজ-মার্কআপ ×১"; else bad "মোবাইলে ব্যাজ=$(jf pb "$MJ")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M2=$(ev "JSON.stringify({on:window.__sfs318QA.on(),tx:window.__sfs318QA.text(),v:getComputedStyle(document.querySelector('.sfs318-posbadge')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf tx "$M2J")" = "১/২" ] && [ "$(jf v "$M2J")" = "visible" ]; then ok "মোবাইলে ব্যাজ-সক্রিয় (১/২, computed-দৃশ্যমান)"; else bad "মোবাইলে tx=[$(jf tx "$M2J")] v=$(jf v "$M2J")"; fi
if [ "$(jf e318 "$MJ")" = "" ] && [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে s314/s318-ইঞ্জিন-অটুট"; else bad "মোবাইলে ইঞ্জিন-অমিল"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 সংরক্ষিত"; else skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"; fi
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৬: দ্বি-লোড-কনসোল + নেট-শূন্য-পরিষ্কারক ──"
bopen "$BASE/" || bad "হোম-পুনঃopen-ব্যর্থ"
agent-browser wait 1800 >/dev/null 2>&1
E=$(agent-browser errors 2>/dev/null | head -3)
if [ -z "$E" ]; then ok "কনসোল-ত্রুটি-শূন্য (দ্বি-লোড)"; else bad "কনসোল-ত্রুটি: $E"; fi
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node scripts/s307-seed-feed.js --clean) | grep -q "CLEAN ✓" && ok "মার্কার-ক্লিন-রান (CLEAN ✓)" || bad "ক্লিন-রান-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরে সার্ভার-বুট" || bad "পরিষ্কার-পরে বুট-ব্যর্থ"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HC" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "পরিষ্কার-পরে হোম=$HC"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s318-suite ✓ সর্ব-সবুজ"; else echo "s318-suite ✗ ব্যর্থতা বিদ্যমান"; fi
[ "$FAIL" = "0" ] && exit 0 || exit 1
