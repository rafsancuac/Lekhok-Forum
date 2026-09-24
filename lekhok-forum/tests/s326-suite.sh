#!/bin/bash
# s326-suite.sh — session326: sfs326 ট্যাপ-পথের অবস্থান-ব্যাজ parity + hr326 রপ্তাই-বিন্যাস-অপশন
# [Task ID 163] PLANS session325-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ③ sfs326 (feed.ejs) — টাচ-ব্যবহারকারীর অবস্থান-ব্যাজ parity: s318-posbadge keynav-গেটে-ই
#      দৃশ্যমান — s325-মোড়ক-চেইন-পরবর্তী __sfs319Show-পুনঃমোড়ক (৬ষ্ঠ-স্তর — tap-গেট ×
#      keynav-নিষ্ক্রিয়) — **একই __sfs318Show-ইঞ্জিন-পুনঃব্যবহার** (নতুন-ব্যাজ-ডুপ-শূন্য);
#      অবস্থান = লেবেল-স্বয়ং-নির্ণীত idx (indexOf — s325-চুক্তি); CSS OR-গেট ([data-sfs321-tap] ×
#      [data-sfs318-on] — keynav-মূল-রুল-অস্পৃশ্য); জীবনচক্র = পঞ্চম-MO — গেট-সমাপ্তি ×
#      keynav-নিষ্ক্রিয়ে __sfs318Hide (keynav-সক্রিয়ে মালিকানা-হস্তান্তর);
#      __sfs326QA {shown, on(), text(), err}
#   ② hr326 (admin/home-reorder.ejs) — রপ্তাই-বিন্যাস-অপশন: strip324-পুনঃনির্দেশ ('rich' ⇄
#      'key' — var-চলক-ডাইনামিক-রিড — copyHist324/dlHist324/q324h.strip সর্ব-পথ এক-উৎস);
#      .hr326-fmt বাটন (.hr324-btn-উত্তরাধিকার + dashed) + F-শর্টকাট (s320/s324-keydown-রীতি);
#      sessionStorage 'hr326-fmt' স্থায়ীকরণ (যাচাই-কৃত-মান); শূন্য-ইতিহাসে নীরব;
#      __hrAria326QA {mode(), cycles, last, strip(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (defineProperty — s316/s324) +
#         বেয়ার-এক্সপ্রেশন-রিটার্ন (s325-গোটচা — JSON.stringify-স্ট্রিং-দ্বি-সংলাপ-বর্জন) +
#         হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd (s319-চুক্তি; s306-ব্যতিক্রম
#         = app-dir-cwd) + গেট-সমাপ্তি-wait-৫০০০ms + keynav-সক্রিয়ণ = phone-ArrowDown-keydown
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_BD=/home/z/my-project/download/s326-tapbadge-desk.png
SH_FM=/home/z/my-project/download/s326-fmt-admin.png
SH_MOB=/home/z/my-project/download/s326-tapbadge-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s326-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s326-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs319Show = function (l326, i326b, n326)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show-পুনঃমোড়ক (s320→s322→s323→s324→s325-চেইন-পরবর্তী ৬ষ্ঠ-স্তর)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "window.__sfs318Show(l326, i0326, labs326.length)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: একই-ইঞ্জিন-পুনঃব্যবহার (__sfs318Show — নতুন-ব্যাজ-ডুপ-শূন্য)" || bad "feed.ejs: ইঞ্জিন-পুনঃব্যবহার-অমিল"
grep -q "freeze-জানালায় ব্যাজ-চাপ-শূন্য" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: বিলম্বিত-প্রকাশ (setTimeout-0 — freeze-ফ্রেমে ব্যাজ-চাপ-শূন্য — s315-রেস-বন্ধ)" || bad "feed.ejs: বিলম্বিত-প্রকাশ-অমিল"
grep -q "Array.prototype.indexOf.call(labs326, l326)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: অবস্থান-সূত্র = লেবেল-স্বয়ং-নির্ণীত idx (s325-চুক্তি — পাস-কৃত-সূচকে-বিশ্বাস-নিষিদ্ধ)" || bad "feed.ejs: অবস্থান-সূত্র-অমিল"
grep -q 'var cl326 = window.__sfs317Clear' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: জীবনচক্র = __sfs317Clear-মোড়ক (৫ম-MO-অবর্জন — s325-MO/keynav-সর্ব-পথ-এক-উৎস-ইন্টারসেপ্ট)" || bad "feed.ejs: clear-মোড়ক-অমিল"
grep -q 'window.__sfs326QA = q326' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs326QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
CSS326=$(sed -n '/session326 (sfs326 ট্যাপ-পথের অবস্থান-ব্যাজ parity)/,/EOF session326/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS326" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session326-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS326" | grep -q '.sfs292-phone\[data-sfs321-tap\] .sfs318-posbadge\[data-sfs318-on\]' && ok "style.css: OR-গেট (tap-গেট × badge-on — keynav-মূল-রুল-অস্পৃশ্য — কেবল-সংযোজন)" || bad "style.css: OR-গেট-অনুপস্থিত"
printf '%s' "$CSS326" | grep -q '@media (max-width: 640px)' && ok "style.css: 640px-ভ্যারিয়েন্ট (বর্ডার-টিন্ট ৪২→৩৪%)" || bad "style.css: 640px-অনুপস্থিত"
printf '%s' "$CSS326" | grep -q 'prefers-reduced-motion' && ok "style.css: reduced-motion-নিরাপত্তা" || bad "style.css: reduced-motion-অনুপস্থিত"
grep -q '.hr326-fmt' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr326-fmt-স্টাইল (.hr324-btn-উত্তরাধিকার + dashed — rgba-only)" || bad "home-reorder.ejs: .hr326-fmt-অমিল"
grep -q 'var stripRich326 = strip324' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: strip324-পুনঃনির্দেশ (var-ডাইনামিক-রিড — রপ্তাই-পথ-এক-উৎস)" || bad "home-reorder.ejs: strip326-অমিল"
grep -q "if (mode326 !== 'key') return stripRich326()" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: দ্বি-বিন্যাস ('rich' ডিফল্ট — hr324-চুক্তি-অটুট ⇄ 'key')" || bad "home-reorder.ejs: দ্বি-বিন্যাস-অমিল"
grep -q "sessionStorage.getItem('hr326-fmt')" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: স্থায়ীকরণ (sessionStorage 'hr326-fmt' — যাচাই-কৃত-মান)" || bad "home-reorder.ejs: স্থায়ীকরণ-অমিল"
grep -q "e326i.key !== 'f' && e326i.key !== 'F'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: F-শর্টকাট (s320/s324-keydown-রীতি)" || bad "home-reorder.ejs: F-শর্টকাট-অমিল"
FSGATE=$(grep -c "শূন্য-ইতিহাসে নীরব (hr323-দর্শন)" "$APP/admin/views/admin/home-reorder.ejs" | tr -d ' ')
if [ "$FSGATE" -ge 2 ]; then ok "home-reorder.ejs: শূন্য-ইতিহাস-নীরব-গেট ×২ (X-পথ + F-পথ — hr323-দর্শন)"; else bad "home-reorder.ejs: নীরব-গেট ×$FSGATE"; fi
grep -q "flash324(btn326)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: flash324-পুনঃব্যবহার (ফ্ল্যাশ-এক-উৎস)" || bad "home-reorder.ejs: flash-অমিল"
grep -q 'window.__hrAria326QA = q326h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria326QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S326CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session326.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S326CHK" = "OK" ]; then ok "feed.ejs: session326-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A326CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria326QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A326CHK" = "OK" ]; then ok "home-reorder.ejs: hr326-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs326QA'; then ok "SSR: s326-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s326-ইঞ্জিন-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs325QA'; then ok "SSR: __sfs325QA-হুক-অটুট (s325-সহাবস্থান)"; else bad "SSR: s325-হুক-অনুপস্থিত"; fi
PB=$(printf '%s' "$SS0" | grep -o 'class="sfs318-posbadge"' | wc -l | tr -d ' ')
if [ "$PB" = "1" ]; then ok "SSR: posbadge-মার্কআপ ×১-অটুট (s318-সহাবস্থান — ডুপ-শূন্য)"; else bad "SSR: posbadge ×$PB"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs326-ই২ই (ট্যাপ-ব্যাজ→computed-প্রমাণ→হস্তান্তর→গেট-সমাপ্তি→চুপ) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs326QA,sh:window.__sfs326QA?window.__sfs326QA.shown:-1,on:window.__sfs326QA?window.__sfs326QA.on():true,e:((window.__sfs326QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf sh "$Q0J")" = "0" ] && [ "$(jf on "$Q0J")" = "false" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs326QA-হুক + প্রারম্ভিক shown=০/on-false/ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
GIDS=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length}})())")
GIDSJ=$(unjj "$GIDS")
if [ "$(jf n "$GIDSJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২"; else bad "ই২ই: labs=$(jf n "$GIDSJ")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(ev "JSON.stringify({sh:window.__sfs326QA.shown,on:window.__sfs326QA.on(),txt:window.__sfs326QA.text(),op:(function(){var b=document.querySelector('.sfs318-posbadge');return b?getComputedStyle(b).opacity:''})(),chip:window.__sfs319QA.on(),ann:window.__sfs325QA.announces,s324:window.__sfs324QA.count(),err:window.__sfs326QA.err})")
T1J=$(unjj "$T1")
if [ "$(jf sh "$T1J")" = "1" ] && [ "$(jf on "$T1J")" = "true" ] && [ "$(jf txt "$T1J")" = "১/২" ]; then ok "ই২ই: ট্যাপ-১ → ব্যাজ (অবস্থান-সঠিক ১/২ — indexOf-নির্ণীত)"; else bad "ই২ই: $(unjj "$T1")"; fi
if [ "$(jf op "$T1J")" = "1" ] && [ "$(jf chip "$T1J")" = "true" ] && [ "$(jf ann "$T1J")" = "1" ] && [ "$(jf s324 "$T1J")" = "1" ]; then ok "ই২ই: computed-opacity=১ (CSS-OR-গেট-প্রমাণ) + s319-চিপ + s325-ঘোষণা + s324-চিহ্ন (সম্পূর্ণ-চেইন-সহাবস্থান)"; else bad "ই২ই: op=$(jf op "$T1J") chip=$(jf chip "$T1J") ann=$(jf ann "$T1J") s324=$(jf s324 "$T1J")"; fi
if agent-browser screenshot "$SH_BD" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-ট্যাপ-ব্যাজ সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T2=$(ev "JSON.stringify({sh:window.__sfs326QA.shown,txt:window.__sfs326QA.text()})")
T2J=$(unjj "$T2")
if [ "$(jf sh "$T2J")" = "2" ] && [ "$(jf txt "$T2J")" = "২/২" ]; then ok "ই২ই: ট্যাপ-২ → ব্যাজ-স্থানান্তর (২/২)"; else bad "ই২ই: $(unjj "$T2")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T3=$(ev "JSON.stringify({txt:window.__sfs326QA.text(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),op:(function(){var b=document.querySelector('.sfs318-posbadge');return b?getComputedStyle(b).opacity:''})()})")
T3J=$(unjj "$T3")
if [ "$(jf kf "$T3J")" = "true" ] && [ "$(jf op "$T3J")" = "1" ]; then ok "ই২ই: keynav-হস্তান্তর → ব্যাজ-মালিকানা-হস্তান্তর (keynav-নিজস্ব-Show — দৃশ্যমানতা-অটুট)"; else bad "ই২ই: $(unjj "$T3")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T4=$(ev "JSON.stringify({txt:window.__sfs326QA.text(),op:(function(){var b=document.querySelector('.sfs318-posbadge');return b?getComputedStyle(b).opacity:''})()})")
T4J=$(unjj "$T4")
if [ "$(jf txt "$T4J")" = "" ] && [ "$(jf op "$T4J")" = "0" ]; then ok "ই২ই: Escape → ব্যাজ-বিলোপ (s318-নিজস্ব-Hide-পথ)"; else bad "ই২ই: $(unjj "$T4")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T5=$(ev "JSON.stringify({sh:window.__sfs326QA.shown,txt:window.__sfs326QA.text()})")
T5J=$(unjj "$T5")
if [ "$(jf sh "$T5J")" = "3" ] && [ "$(jf txt "$T5J")" = "১/২" ]; then ok "ই২ই: Escape-পরবর্তী পুনঃট্যাপে ব্যাজ-পুনঃপ্রয়োগ"; else bad "ই২ই: $(unjj "$T5")"; fi
agent-browser wait 5000 >/dev/null 2>&1
T6=$(ev "JSON.stringify({txt:window.__sfs326QA.text(),gate:window.__sfs322QA.gate(),op:(function(){var b=document.querySelector('.sfs318-posbadge');return b?getComputedStyle(b).opacity:''})(),e:window.__sfs326QA.err})")
T6J=$(unjj "$T6")
if [ "$(jf txt "$T6J")" = "" ] && [ "$(jf gate "$T6J")" = "false" ] && [ "$(jf op "$T6J")" = "0" ]; then ok "ই২ই: গেট-সমাপ্তি → ব্যাজ-বিলোপ (পঞ্চম-MO — একই-মাইক্রোটাস্ক-পালা)"; else bad "ই২ই: $(unjj "$T6")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T7=$(ev "JSON.stringify({sh:window.__sfs326QA.shown,kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T7J=$(unjj "$T7")
if [ "$(jf sh "$T7J")" = "3" ] && [ "$(jf kf "$T7J")" = "true" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপে ব্যাজ-নীরব (shown=৩-অপরিবর্তিত — tap-গেট-স্বতন্ত্রক)"; else bad "ই২ই: $(unjj "$T7")"; fi

echo "── ধাপ-৪: hr326-ই২ই (rich-ডিফল্ট→F-টগল→key-স্ট্রিপ→E-কপি→D-ডাউনলোড→স্থায়ীকরণ→নীরব) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr326-fmt')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({q:!!window.__hrAria326QA,mode:window.__hrAria326QA?window.__hrAria326QA.mode():'x',cy:window.__hrAria326QA?window.__hrAria326QA.cycles:-1,e:((window.__hrAria326QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf mode "$H0J")" = "rich" ] && [ "$(jf cy "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria326QA-হুক + ডিফল্ট rich + cycles=০"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap326=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,fmt:!!document.querySelector('.hr317-tip.is-on .hr326-fmt'),lbl:(document.querySelector('.hr317-tip.is-on .hr326-fmt')||{}).textContent||'',kbd:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent.indexOf('F = বিন্যাস')>=0})")
B1J=$(unjj "$B1")
if [ "$(jf h "$B1J")" = "2" ] && [ "$(jf fmt "$B1J")" = "true" ] && [ "$(jf lbl "$B1J")" = "বিন্যাস: সমৃদ্ধ" ] && [ "$(jf kbd "$B1J")" = "true" ]; then ok "ই২ই: .hr326-fmt-বাটন (rich-লেবেল) + kbd-হিন্ট (F = বিন্যাস)"; else bad "ই২ই: $(unjj "$B1")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return 'f1k'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
F1=$(ev "JSON.stringify({mode:window.__hrAria326QA.mode(),cy:window.__hrAria326QA.cycles,st:(window.__hrAria326QA.strip()||'').indexOf('বার')<0&&window.__hrAria326QA.strip().indexOf('↔')>=0,stored:(function(){try{return sessionStorage.getItem('hr326-fmt')}catch(e){return 'x'}})(),toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),lbl:(document.querySelector('.hr317-tip.is-on .hr326-fmt')||{}).textContent||''})")
F1J=$(unjj "$F1")
if [ "$(jf mode "$F1J")" = "key" ] && [ "$(jf cy "$F1J")" = "1" ] && [ "$(jf st "$F1J")" = "true" ]; then ok "ই২ই: F-কী → key-বিন্যাস (strip324-কী-এক-উৎস — বার-শূন্য + ↔-উপস্থিত)"; else bad "ই২ই: $(unjj "$F1")"; fi
if [ "$(jf stored "$F1J")" = "key" ] && printf '%s' "$(jf toast "$F1J")" | grep -q 'কেবল-কী'; then ok "ই২ই: স্থায়ীকরণ (sessionStorage='key') + টোস্ট-প্রমাণ"; else bad "ই২ই: stored=$(jf stored "$F1J") toast=[$(jf toast "$F1J")]"; fi
if agent-browser screenshot "$SH_FM" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-বিন্যাস-বাটন সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
E1=$(ev "JSON.stringify({cp:window.__hrAria324QA.copies,cap:(window.__clipCap326||'').indexOf('বার')<0,hist:window.__hrAria317QA.hist().length})")
E1J=$(unjj "$E1")
if [ "$(jf cp "$E1J")" = "1" ] && [ "$(jf cap "$E1J")" = "true" ]; then ok "ই২ই: E-কী-কপি key-বিন্যাসে (ক্লিপবোর্ড-ক্যাপচার বার-শূন্য — রপ্তাই-পথ-এক-উৎস-প্রমাণ)"; else bad "ই২ই: $(unjj "$E1")"; fi
ev "JSON.stringify((function(){window.__dlStub326={clicks:0,size:''};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub326.size=String(b&&b.size);return 'blob:qa-stub-326'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub326.clicks+=1;return}return ocl.call(this)};var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D1=$(ev "JSON.stringify({dl:window.__hrAria324QA.downloads,ck:window.__dlStub326.clicks,sz:window.__dlStub326.size})")
D1J=$(unjj "$D1")
if [ "$(jf dl "$D1J")" = "1" ] && [ "$(jf ck "$D1J")" = "1" ] && [ "$(jf sz "$D1J")" != "0" ]; then ok "ই২ই: D-কী-ডাউনলোড key-বিন্যাসে (non-empty-blob — উভয়-রপ্তাই-পথ-সম্মত)"; else bad "ই২ই: $(unjj "$D1")"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr326-fmt');if(!b)return 'nb';b.click();return 'bc'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
BC=$(ev "JSON.stringify({mode:window.__hrAria326QA.mode(),cy:window.__hrAria326QA.cycles,lbl:(document.querySelector('.hr317-tip.is-on .hr326-fmt')||{}).textContent||''})")
BCJ=$(unjj "$BC")
if [ "$(jf mode "$BCJ")" = "rich" ] && [ "$(jf cy "$BCJ")" = "2" ] && [ "$(jf lbl "$BCJ")" = "বিন্যাস: সমৃদ্ধ" ]; then ok "ই২ই: বাটন-ক্লিক → rich-পুনঃটগল (লেবেল-সমকালীন-আপডেট)"; else bad "ই২ই: $(unjj "$BC")"; fi
bopen "$BASE/admin/home-reorder" || bad "home-reorder-পুনঃopen-ব্যর্থ"
agent-browser wait 1600 >/dev/null 2>&1
P1=$(ev "JSON.stringify({mode:(window.__hrAria326QA?window.__hrAria326QA.mode():'x'),stored:(function(){try{var m=sessionStorage.getItem('hr326-fmt');sessionStorage.removeItem('hr326-fmt');return m}catch(e){return 'x'}})()})")
P1J=$(unjj "$P1")
if [ "$(jf mode "$P1J")" = "rich" ] || [ "$(jf mode "$P1J")" = "key" ]; then ok "ই২ই: পুনঃলোড-পরবর্তী মোড-যাচাই (স্থায়ীকরণ-ইঞ্জিন-জীবিত) + পরিষ্কারক (স্টোর-কী-বিলোপ — সুইট-স্বাস্থ্যবিধি)"; else bad "ই২ই: $(unjj "$P1")"; fi
CLK2=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK2")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: পুনঃopen-পরবর্তী USER_FEED-পুনঃনির্বাচন (aria-copy-সরবরাহ)"; else bad "ই২ই: পুনঃনির্বাচন-রো-অনুপস্থিত"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd1'})())" >/dev/null 2>&1; agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd2'})())" >/dev/null 2>&1; agent-browser wait 400 >/dev/null 2>&1
Z1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,mode:window.__hrAria326QA.mode(),cy:window.__hrAria326QA.cycles,fsilent:(function(){var b=document.querySelectorAll('.hr-aria-copy')[0];var c0=window.__hrAria326QA.cycles;b.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true,cancelable:true}));return window.__hrAria326QA.cycles===c0})()})")
Z1J=$(unjj "$Z1")
if [ "$(jf h "$Z1J")" = "0" ] && [ "$(jf mode "$Z1J")" = "rich" ] && [ "$(jf cy "$Z1J")" = "0" ] && [ "$(jf fsilent "$Z1J")" = "true" ]; then ok "ই২ই: শূন্য-ইতিহাসে F-নীরব (Delete×২-পরিষ্কার + mode-অপরিবর্তিত + cycles=০-পুনঃআরম্ভ — in-memory-গণনা, মোড-স্থায়ী — hr323-দর্শন)"; else bad "ই২ই: $(unjj "$Z1")"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-ব্যাজ + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs326QA,err:(window.__sfs326QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs326QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(ev "JSON.stringify({sh:window.__sfs326QA.shown,txt:window.__sfs326QA.text(),op:(function(){var b=document.querySelector('.sfs318-posbadge');return b?getComputedStyle(b).opacity:''})(),g:window.__sfs322QA.gate()})")
M2J=$(unjj "$M2")
if [ "$(jf sh "$M2J")" = "1" ] && [ "$(jf txt "$M2J")" = "১/২" ] && [ "$(jf op "$M2J")" = "1" ] && [ "$(jf g "$M2J")" = "true" ]; then ok "মোবাইলে ট্যাপ-ব্যাজ (shown=১ + ১/২ + computed-opacity-১ + গেট)"; else bad "মোবাইলে $(unjj "$M2")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s326-suite ✓ সর্ব-সবুজ"; else echo "s326-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
