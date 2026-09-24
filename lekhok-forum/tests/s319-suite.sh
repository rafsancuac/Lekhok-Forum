#!/bin/bash
# s319-suite.sh — session319: sfs319 ব্যাজ-গ্রুপ-নাম-চিপ + hr319 সারি-ক্লিক-পুনঃকপি
# [Task ID 156] PLANS session318-নোটের প্রস্তাব-②+③ প্রয়োগ (+①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs319 (feed.ejs) — sfs318-অবস্থান-ব্যাজের সমৃদ্ধ-সমকক্ষ: keynav-মুহূর্তে ব্যাজের বামে
#      গ্রুপ-আইকন + গ্রুপ-নাম-চিপ (উৎস-সত্য = হাইলাইট-লেবেল-ই — কোনো-স্টেট-ডুপ-নেই);
#      aria-hidden ডেকোরেটিভ; দ্বি-গেট [data-sfs314-focus] × [data-sfs319-on];
#      __sfs319Show/__sfs319Hide guarded-হুক (sfs318-রীতি) + __sfs319QA {shown, last,
#      chip(), on(), text(), icon(), err}
#   ③ hr319 (admin/home-reorder.ejs) — তালিকায় সারি-ক্লিক-পুনঃকপি: pointer-events-none-
#      গেট-পুনঃবিবেচনা — কেবল-তালিকাযুক্ত-টুলটিপেই .hr319-live → pointer-events:auto;
#      সারিতে data-copy + ডেলিগেটেড click → copyAria316-পুনঃব্যবহার (এক-উৎস-কপি-পথ);
#      বাটন→টুলটিপ-গমনে mouseout-গার্ড (relatedTarget-চুক্তি) + টুলটিপ-নিজস্ব-জীবনচক্র;
#      hr319-hit-ফ্ল্যাশ (380ms-পোল-প্রয়োগ, 700ms-স্বয়ংক্রিয়-মুছ); __hrAria319QA
#      {recopies, lastKey, live(), rows(), hit(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313-গোটচা) + transition-পরবর্তী-অ্যাসার্ট (viswait-পোল) +
#         ক্লিপবোর্ড-স্টাব (defineProperty — s316-গোটচা) + হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_CHIP=/home/z/my-project/download/s319-namechip-desk.png
SH_ROW=/home/z/my-project/download/s319-rowcopy-admin.png
SH_MOB=/home/z/my-project/download/s319-namechip-mobile390.png
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
  local i v want="$2"
  for i in 1 2 3 4 5 6; do
    v=$(ev "getComputedStyle(document.querySelector('$1')).visibility" | tr -d '"')
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
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  return 1
}

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s319-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s319-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q '<span class="sfs319-namechip" aria-hidden="true"></span>' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: sfs319-namechip-মার্কআপ (aria-hidden — posbadge-পূর্বাদাহ)" || bad "feed.ejs: নাম-চিপ-মার্কআপ-অমিল"
grep -q 'if (window.__sfs319Show) window.__sfs319Show(labs314\[i314\], i314, labs314.length)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: apply314-এ __sfs319Show guarded-হুক (ঘোষণা→ব্যাজ→চিপ-ক্রম)" || bad "feed.ejs: show-হুক-অমিল"
grep -q 'if (window.__sfs319Hide) window.__sfs319Hide();' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: clear314-এ __sfs319Hide guarded-হুক" || bad "feed.ejs: hide-হুক-অমিল"
grep -q 'window.__sfs319QA = q319' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q "i319e.className = ic319.className" "$APP/views/partials/home/feed.ejs" && grep -q "t319e.textContent = nm319" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: DOM-API-নির্মাণ (আইকন-className + textContent — XSS-নিরাপদ)" || bad "feed.ejs: DOM-API-অমিল"
grep -q '.sfs292-phone\[data-sfs314-focus\] .sfs319-namechip\[data-sfs319-on\]' "$APP/public/assets/css/style.css" && ok "style.css: দ্বি-গেট ([data-sfs314-focus] × [data-sfs319-on])" || bad "style.css: দ্বি-গেট-অমিল"
CSS319=$(sed -n '/session319 (sfs319 ব্যাজ-গ্রুপ-নাম-চিপ)/,/EOF session319/p' "$APP/public/assets/css/style.css")
printf '%s' "$CSS319" | grep -q 'prefers-reduced-motion' && ok "style.css: session319-ব্লকে reduced-motion" || bad "style.css: reduced-motion-অনুপস্থিত"
HEXN=$(printf '%s' "$CSS319" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session319-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS319" | grep -q 'color-mix(in srgb, var(--lf-brand-primary)' && ok "style.css: color-mix + var-টোকেন (posbadge-রীতি)" || bad "style.css: var-টোকেন-অমিল"
printf '%s' "$CSS319" | grep -q 'max-width: 46%' && ok "style.css: নাম-ক্ল্যাম্প + ellipsis (দীর্ঘ-গ্রুপ-নাম-নিরাপত্তা)" || bad "style.css: ক্ল্যাম্প-অমিল"
grep -q '.hr317-tip.hr319-live { pointer-events:auto' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr319-live গেট (কেবল-তালিকাযুক্তে-ই pointer-events)" || bad "home-reorder.ejs: live-গেট-অমিল"
grep -q "r318.setAttribute('data-copy', e318.key)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: সারিতে data-copy (পুনঃকপি-লক্ষ্য)" || bad "home-reorder.ejs: data-copy-অমিল"
grep -q "tip317.classList.toggle('hr319-live', hist317.length > 0)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: tipRender318-গেট-টগল (hist-সত্য-নির্ভর)" || bad "home-reorder.ejs: গেট-টগল-অমিল"
grep -q "tip317.contains(e317e.relatedTarget)) return;" "$APP/admin/views/admin/home-reorder.ejs" && grep -q "tip317.contains(e319a.relatedTarget)) return;" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: দ্বি-mouseout-গার্ড (innerEl + টুলটিপ-নিজস্ব)" || bad "home-reorder.ejs: গার্ড-অমিল"
grep -q 'var rowRecopy319' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'copyAria316(k319a)' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: rowRecopy319 → copyAria316-পুনঃব্যবহার (এক-উৎস-কপি-পথ)" || bad "home-reorder.ejs: rowRecopy-অমিল"
grep -q 'window.__hrAria319QA' "$APP/admin/views/admin/home-reorder.ejs" && grep -q 'recopies: 0,' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria319QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S319CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session319.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S319CHK" = "OK" ]; then ok "feed.ejs: session319-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A319CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria319QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A319CHK" = "OK" ]; then ok "home-reorder.ejs: hr319-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১ (একক-উদাহরণ)"; else bad "SSR: নাম-চিপ ×$NC"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge ×১-অটুট (s318-সহাবস্থান)"; else bad "SSR: ব্যাজ ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি — চিপ aria-hidden-বহির্ভূত-নাম)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi
GT=$(printf '%s' "$SS0" | grep -o 'class="sfs292-glabel' | wc -l | tr -d ' ')
if [ "$GT" = "4" ]; then ok "SSR: glabel-মোট ×৪ (s313-অটুট)"; else bad "SSR: glabel ×$GT"; fi
if printf '%s' "$SS0" | grep -q '__sfs319Show' && printf '%s' "$SS0" | grep -q '__sfs319QA'; then ok "SSR: s319-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: ইঞ্জিন-হুক-অনুপস্থিত"; fi
GR=$(printf '%s' "$SS0" | grep -o 'class="sfs314-grows"' | wc -l | tr -d ' ')
if [ "$GR" = "2" ]; then ok "SSR: aria-জোড়া ×২ (s314-অটুট)"; else bad "SSR: grows ×$GR"; fi

echo "── ধাপ-৩: sfs319-ই২ই (নাম-চিপ-জীবনচক্র: প্রদর্শন→হালনাগাদ→বিলোপ→ওয়ার্প→blur) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({c:window.__sfs319QA?window.__sfs319QA.chip():null,on:window.__sfs319QA?window.__sfs319QA.on():null,tx:window.__sfs319QA?window.__sfs319QA.text():'',err:(window.__sfs319QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf c "$Q0J")" = "true" ]; then ok "ই২ই: __sfs319QA-হুক + চিপ-ডম-উপস্থিত"; else bad "ই২ই: c=$(jf c "$Q0J")"; fi
if [ "$(jf on "$Q0J")" = "false" ] && [ -z "$(jf tx "$Q0J")" ]; then ok "ই২ই: প্রারম্ভিক-অবস্থা — নিষ্ক্রিয় + নাম-শূন্য"; else bad "ই২ই: on=$(jf on "$Q0J") tx=[$(jf tx "$Q0J")]"; fi
if [ "$(jf err "$Q0J")" = "" ]; then ok "ই২ই: ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=$(jf err "$Q0J")"; fi
LB=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,l0:String(ls[0].textContent).replace(/\\s+/g,' ').trim(),l1:String(ls[1].textContent).replace(/\\s+/g,' ').trim(),i0:String(ls[0].querySelector('i')?ls[0].querySelector('i').className:'')}})())")
LBJ=$(unjj "$LB"); L0=$(jf l0 "$LBJ"); L1=$(jf l1 "$LBJ"); I0=$(jf i0 "$LBJ")
if [ "$(jf n "$LBJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$L0] [$L1])"; else bad "ই২ই: labs=$(jf n "$LBJ")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
A1=$(ev "JSON.stringify({on:window.__sfs319QA.on(),tx:window.__sfs319QA.text(),ic:window.__sfs319QA.icon(),sh:window.__sfs319QA.shown,bx:window.__sfs318QA.text(),sr:window.__sfs317QA.last})")
A1J=$(unjj "$A1")
if [ "$(jf tx "$A1J")" = "$L0" ]; then ok "ই২ই: চিপ-১ = গ্রুপ-নাম [$L0] (উৎস-সত্য-লেবেল)"; else bad "ই২ই: tx=[$(jf tx "$A1J")] প্রত্যাশা [$L0]"; fi
if [ "$(jf on "$A1J")" = "true" ] && [ "$(jf sh "$A1J")" = "1" ]; then ok "ই২ই: data-sfs319-on-গেট-খোলা (shown=১)"; else bad "ই২ই: on=$(jf on "$A1J") sh=$(jf sh "$A1J")"; fi
if [ "$(jf ic "$A1J")" = "$I0" ] && case "$(jf ic "$A1J")" in *"fas"*) true;; *) false;; esac; then ok "ই২ই: আইকন-className = লেবেল-আইকন-সমতুল্য [$I0]"; else bad "ই২ই: ic=[$(jf ic "$A1J")] প্রত্যাশা [$I0]"; fi
if [ "$(jf bx "$A1J")" = "১/২" ] && case "$(jf sr "$A1J")" in *"$L0"*) true;; *) false;; esac; then ok "ই২ই: posbadge ১/২ + sfs317-ঘোষণা-সমান্তরাল-অটুট (s318/s317-সহাবস্থান)"; else bad "ই২ই: bx=[$(jf bx "$A1J")] sr=[$(jf sr "$A1J")]"; fi
V1V=$(viswait ".sfs319-namechip" visible)
if [ "$V1V" = "visible" ]; then ok "ই২ই: computed-দৃশ্যমান (দ্বি-গেট-CSS-প্রয়োগ — পোল-স্থিতি)"; else bad "ই২ই: v=$V1V (পোল-নিঃশেষ)"; fi
AH=$(ev "String(document.querySelector('.sfs319-namechip').getAttribute('aria-hidden'))" | tr -d '"')
if [ "$AH" = "true" ]; then ok "ই২ই: aria-hidden-ডেকোরেটিভ (accessible-name-অপরিবর্তিত)"; else bad "ই২ই: ah=$AH"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'a2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A2=$(ev "JSON.stringify({tx:window.__sfs319QA.text(),sh:window.__sfs319QA.shown})")
if [ "$(jf tx "$(unjj "$A2")")" = "$L1" ] && [ "$(jf sh "$(unjj "$A2")")" = "2" ]; then ok "ই২ই: চিপ-২ = [$L1] (হালনাগাদ, shown=২)"; else bad "ই২ই: tx=[$(jf tx "$(unjj "$A2")")]"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
sleep 1
A3=$(ev "JSON.stringify({on:window.__sfs319QA.on(),tx:window.__sfs319QA.text(),v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility,bx:window.__sfs318QA.text()})")
A3J=$(unjj "$A3")
if [ -z "$(jf tx "$A3J")" ] && [ "$(jf on "$A3J")" = "false" ] && [ -z "$(jf bx "$A3J")" ]; then ok "ই২ই: Escape→চিপ+ব্যাজ-দ্বি-বিলোপ (s318-সমান্তরাল)"; else bad "ই২ই: tx=[$(jf tx "$A3J")] on=$(jf on "$A3J") bx=[$(jf bx "$A3J")]"; fi
A3V=$(viswait ".sfs319-namechip" hidden)
if [ "$A3V" = "hidden" ]; then ok "ই২ই: Escape→computed-অদৃশ্য (পোল-স্থিতি)"; else bad "ই২ই: v=$A3V (পোল-নিঃশেষ)"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));return 'u1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
A4=$(ev "JSON.stringify({tx:window.__sfs319QA.text(),sh:window.__sfs319QA.shown,bx:window.__sfs318QA.text()})")
A4J=$(unjj "$A4")
if [ "$(jf tx "$A4J")" = "$L1" ] && [ "$(jf sh "$A4J")" = "3" ] && [ "$(jf bx "$A4J")" = "২/২" ]; then ok "ই২ই: ArrowUp→ওয়ার্প-পুনঃপ্রদর্শন ([$L1], ২/২, shown=৩)"; else bad "ই২ই: tx=[$(jf tx "$A4J")] sh=$(jf sh "$A4J")"; fi
if agent-browser screenshot "$SH_CHIP" >/dev/null 2>&1; then ok "স্ক্রিনশট: নাম-চিপ+ব্যাজ-জুটি (ডেস্কটপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.focus();p.blur();return 'bl'})())" >/dev/null 2>&1
sleep 1
A5=$(ev "JSON.stringify({on:window.__sfs319QA.on(),v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
if [ "$(jf on "$(unjj "$A5")")" = "false" ] && [ "$(jf v "$(unjj "$A5")")" = "hidden" ]; then ok "ই২ই: blur→চিপ-বিলোপ (s314-blur-চুক্তি-সমান্তরাল)"; else bad "ই২ই: blur-পরবর্তী on=$(jf on "$(unjj "$A5")") v=$(jf v "$(unjj "$A5")")"; fi

echo "── ধাপ-৪: hr319-ই২ই (সারি-ক্লিক-পুনঃকপি + pointer-events-গেট) ──"
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
H0=$(ev "JSON.stringify({h:window.__hrAria317QA?window.__hrAria317QA.hist().length:-1,q:!!window.__hrAria319QA,b:window.__hrAria316QA?window.__hrAria316QA.btns():-1,e1:((window.__hrAria318QA||{}).err||''),e2:((window.__hrAria319QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf h "$H0J")" = "0" ]; then ok "ই২ই: ইতিহাস-প্রারম্ভিক-শূন্য"; else bad "ই২ই: hist=$(jf h "$H0J")"; fi
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf b "$H0J")" = "2" ]; then ok "ই২ই: __hrAria319QA-হুক + কপি-বাটন ×২ (hr316-অটুট)"; else bad "ই২ই: q=$(jf q "$H0J") b=$(jf b "$H0J")"; fi
if [ "$(jf e1 "$H0J")" = "" ] && [ "$(jf e2 "$H0J")" = "" ]; then ok "ই২ই: hr318+hr319-ইঞ্জিন-ত্রুটি-শূন্য"; else bad "ই২ই: err=[$(jf e1 "$H0J")][$(jf e2 "$H0J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
T1=$(ev "JSON.stringify({tip:window.__hrAria317QA.tip(),tx:window.__hrAria317QA.text(),rows:window.__hrAria319QA.rows(),lv:window.__hrAria319QA.live()})")
T1J=$(unjj "$T1")
if [ "$(jf tip "$T1J")" = "true" ] && [ "$(jf tx "$T1J")" = "এখনো কপি হয়নি" ]; then ok "ই২ই: hover→টুলটিপ (sum-কেবল — hr317-চুক্তি-অটুট)"; else bad "ই২ই: tip=$(jf tip "$T1J") tx=[$(jf tx "$T1J")]"; fi
if [ "$(jf rows "$T1J")" = "0" ] && [ "$(jf lv "$T1J")" = "false" ]; then ok "ই২ই: শূন্য-ইতিহাসে গেট-বন্ধ (live=false, rows=০ — নিঃশর্ত-ইন্টারঅ্যাকশন-নয়)"; else bad "ই২ই: rows=$(jf rows "$T1J") lv=$(jf lv "$T1J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:document.querySelector('.hr317-tip')}));return 'g1'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "true" ]; then ok "ই২ই: mouseout-ভিতরে-গমন (relatedTarget=টুলটিপ) → টিকে-থাকা (গার্ড)"; else bad "ই২ই: গার্ড-সত্ত্বেও-বিলোপ"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));return 'g2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "false" ]; then ok "ই২ই: mouseout-বহির্গমন (relatedTarget-শূন্য) → বিলোপ (s317-অটুট)"; else bad "ই২ই: বহির্গমনে-ও-দৃশ্যমান"; fi
CS=$(ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap319=t;return Promise.resolve()}},configurable:true});return 'stub'})())")
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
C2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,k0:window.__hrAria317QA.hist()[0].key,k1:window.__hrAria317QA.hist()[1].key})")
C2J=$(unjj "$C2")
if [ "$(jf h "$C2J")" = "2" ]; then ok "ই২ই: দ্বি-কপি → hist=২ (s317-রেজিস্ট্রি-অটুট)"; else bad "ই২ই: h=$(jf h "$C2J")"; fi
CAP=$(jf k1 "$C2J"); CAPB=$(jf k0 "$C2J")
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T3=$(ev "JSON.stringify({rows:window.__hrAria319QA.rows(),lv:window.__hrAria319QA.live(),cur:window.__hrAria318QA.cur()})")
T3J=$(unjj "$T3")
if [ "$(jf rows "$T3J")" = "2" ] && [ "$(jf lv "$T3J")" = "true" ] && [ "$(jf cur "$T3J")" = "1" ]; then ok "ই২ই: তালিকা-২-সারি + গেট-খোলা (live=true) + is-cur ×১ (hr318-অটুট)"; else bad "ই২ই: rows=$(jf rows "$T3J") lv=$(jf lv "$T3J") cur=$(jf cur "$T3J")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:document.querySelector('.hr317-tip')}));return 'g3'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "true" ]; then ok "ই২ই: live-গেটে-বাটন→তালিকা-গমন-পথ টিকে-থাকা (ইন্টারঅ্যাকশন-সম্ভব)"; else bad "ই২ই: live-গেটে-গমনে-বিলোপ"; fi
ev "JSON.stringify((function(){var rs=document.querySelectorAll('.hr317-tip.is-on .hr318-row');if(rs.length<1)return{ok:0};rs[0].click();return{ok:1,n:rs.length}})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
R1=$(ev "JSON.stringify({rc:window.__hrAria319QA.recopies,lk:window.__hrAria319QA.lastKey,cp:window.__hrAria316QA.copied,cap:window.__clipCap319||'',tip:window.__hrAria317QA.tip(),h0k:window.__hrAria317QA.hist()[0].key,h0n:window.__hrAria317QA.hist()[0].n,ht:window.__hrAria319QA.hit(),e:window.__hrAria319QA.err})")
R1J=$(unjj "$R1")
if [ "$(jf rc "$R1J")" = "1" ] && [ "$(jf lk "$R1J")" = "$CAPB" ]; then ok "ই২ই: সারি-ক্লিক → পুনঃকপি-রেকর্ড (recopies=১, lastKey=সারি-কী)"; else bad "ই২ই: rc=$(jf rc "$R1J") lk=[$(jf lk "$R1J")]"; fi
if [ "$(jf cp "$R1J")" = "$CAPB" ] && [ "$(jf cap "$R1J")" = "$CAPB" ]; then ok "ই২ই: এক-উৎস-কপি-পথ-প্রমাণ (copied==ক্যাপচার==সারি-কী)"; else bad "ই২ই: cp=[$(jf cp "$R1J")] cap=[$(jf cap "$R1J")]"; fi
if [ "$(jf h0k "$R1J")" = "$CAPB" ] && [ "$(jf h0n "$R1J")" = "2" ]; then ok "ই২ই: রেকর্ড-হালনাগাদ (hist[0]=সারি-কী, n=২ — ডুপ-নেই-রীতি)"; else bad "ই২ই: h0k=[$(jf h0k "$R1J")] h0n=$(jf h0n "$R1J")"; fi
if [ "$(jf tip "$R1J")" = "true" ] && [ "$(jf e "$R1J")" = "" ]; then ok "ই২ই: ক্লিক-পরবর্তী-টুলটিপ-টিকে-থাকা + ত্রুটি-শূন্য"; else bad "ই২ই: tip=$(jf tip "$R1J") e=[$(jf e "$R1J")]"; fi
if [ "$(jf ht "$R1J")" = "1" ]; then ok "ই২ই: hr319-hit-ফ্ল্যাশ-প্রয়োগ (ক্লিক+৫৫০ms-মুহূর্তে — ৩৮০ms-পোল-জানালায়)"; else bad "ই২ই: hit=$(jf ht "$R1J") (পোল-জানালা-বহির্ভূত)"; fi
L0A=$(ev "JSON.stringify({l0:window.__hrAria318QA.list()[0]||''})")
L0V=$(jf l0 "$(unjj "$L0A")")
case "$L0V" in "$CAPB"*"২ বার"*) ok "ই২ই: রিফ্রেশড-তালিকা-সারি-১ = পুনঃকপিত-কী · ২ বার (live-হালনাগাদ)";; *) bad "ই২ই: l0=[$L0V]";; esac
agent-browser wait 900 >/dev/null 2>&1
HT2=$(ev "JSON.stringify({h:window.__hrAria319QA.hit()})")
if [ "$(jf h "$(unjj "$HT2")")" = "0" ]; then ok "ই২ই: ফ্ল্যাশ-স্বয়ংক্রিয়-মুছ (700ms-সীমা)"; else bad "ই২ই: hit=$(jf h "$(unjj "$HT2")") (অবশিষ্ট)"; fi
ev "JSON.stringify((function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'e2'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "false" ]; then ok "ই২ই: Escape→টুলটিপ-বিলোপ (s317-অটুট)"; else bad "ই২ই: Escape-পরবর্তী-দৃশ্যমান"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[1];b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 't5'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
T5=$(ev "JSON.stringify({tx:window.__hrAria317QA.text(),rows:window.__hrAria318QA.rows(),cur:window.__hrAria318QA.cur()})")
T5J=$(unjj "$T5")
case "$(jf tx "$T5J")" in "সর্বশেষ কপি: "$CAPB*"২ বার"*) ok "ই২ই: পুনঃহোভার → নিজস্ব-সারাংশ-হালনাগাদ (· ২ বার)";; *) bad "ই২ই: tx=[$(jf tx "$T5J")]";; esac
if [ "$(jf rows "$T5J")" = "2" ] && [ "$(jf cur "$T5J")" = "1" ]; then ok "ই২ই: is-cur ×১-অটুট (চলতি-কী-হাইলাইট)"; else bad "ই২ই: rows=$(jf rows "$T5J") cur=$(jf cur "$T5J")"; fi
ev "JSON.stringify((function(){var t=document.querySelector('.hr317-tip');t.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));return 'g4'})())" >/dev/null 2>&1
agent-browser wait 250 >/dev/null 2>&1
if [ "$(unjj "$(ev "JSON.stringify({tip:window.__hrAria317QA.tip()})")" | python3 -c "import sys,json;print('true' if json.load(sys.stdin).get('tip') else 'false')" 2>/dev/null)" = "false" ]; then ok "ই২ই: টুলটিপ-নিজস্ব-mouseout → বহির্গমনে-বিলোপ"; else bad "ই২ই: টুলটিপ-বহির্গমনে-ও-দৃশ্যমান"; fi
if agent-browser screenshot "$SH_ROW" >/dev/null 2>&1; then ok "স্ক্রিনশট: সারি-ক্লিক-পুনঃকপি-টুলটিপ (অ্যাডমিন)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + চিপ-মোবাইল-গেট + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,nc:document.querySelectorAll('.sfs319-namechip').length,e319:(window.__sfs319QA||{}).err||'',pr:(window.__sfs314QA||{}).pairs})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf nc "$MJ")" = "1" ]; then ok "মোবাইলে নাম-চিপ-মার্কআপ ×১"; else bad "মোবাইলে চিপ=$(jf nc "$MJ")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
M2=$(ev "JSON.stringify({on:window.__sfs319QA.on(),tx:window.__sfs319QA.text(),v:getComputedStyle(document.querySelector('.sfs319-namechip')).visibility})")
M2J=$(unjj "$M2")
if [ "$(jf tx "$M2J")" = "$L0" ] && [ "$(jf v "$M2J")" = "visible" ]; then ok "মোবাইলে চিপ-সক্রিয় ([$L0], computed-দৃশ্যমান)"; else bad "মোবাইলে tx=[$(jf tx "$M2J")] v=$(jf v "$M2J")"; fi
if [ "$(jf e319 "$MJ")" = "" ] && [ "$(jf pr "$MJ")" = "2" ]; then ok "মোবাইলে s314/s319-ইঞ্জিন-অটুট"; else bad "মোবাইলে ইঞ্জিন-অমিল"; fi
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
if [ "$FAIL" = "0" ]; then echo "s319-suite ✓ সর্ব-সবুজ"; else echo "s319-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
