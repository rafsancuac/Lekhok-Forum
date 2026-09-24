#!/bin/bash
# s324-suite.sh — session324: sfs324 ট্যাপ-হাইলাইটে grows-প্রথম-পোস্ট-চিহ্ন + hr324 ইতিহাস-রপ্তাই
# [Task ID 161] PLANS session323-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs324 (feed.ejs) — ট্যাপ-হাইলাইটে হাইলাইটেড-গ্রুপের grows-প্রথম-পোস্টে data-sfs324-first
#      (উৎস-সত্য = data-sfs323-on-লেবেল — label.id→grows-id→first-post; স্টেট-ডুপ-শূন্য);
#      s323-মোড়ক-চেইন-পরবর্তী __sfs319Show-পুনঃমোড়ক (৪র্থ-স্তর); জীবনচক্র-MO (ত্রি-MO-নিরাপদ —
#      একই-attributeFilter): গেট-সমাপ্তি/keynav-সক্রিয়ে চিহ্ন-বিলোপ (s323-সমকালীন);
#      __sfs324QA {set, on(), count(), first(), err}
#   ③ hr324 (admin/home-reorder.ejs) — ইতিহাস-রপ্তাই: .hr324-bar দ্বি-বাটন (স্ট্রিপ-কপি + ডাউনলোড)
#      = রেকর্ড-বিহীন রপ্তাই-পথ (copyAria316-বর্জন — done316→record-গণনা-দূষণ-গোটচা);
#      fallbackCopy316-মেকানিজম-পুনঃব্যবহার; কীবোর্ড = E/D-শর্টকাট (s320/s323-keydown-রীতি —
#      টুলটিপ-বাটন focusout-জীবনচক্ষে-ট্যাবে-অপ্রাপ্য); শূন্য-ইতিহাসে বার-অনুপস্থিত (নীরব);
#      ডাউনলোড = Blob+a[download]+revoke; __hrAria324QA {copies, downloads, last, strip(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব (defineProperty — s316) + হেক্স-শূন্য +
#         নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd (s319-চুক্তি) + গেট-সমাপ্তি-wait-৫০০০ms +
#         keynav-সক্রিয়ণ = phone-ArrowDown-keydown (s323-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_FP=/home/z/my-project/download/s324-firstpost-desk.png
SH_EXP=/home/z/my-project/download/s324-export-admin.png
SH_MOB=/home/z/my-project/download/s324-firstpost-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s324-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s324-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs319Show = function (l324, i324b, n324)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show-পুনঃমোড়ক (s320→s322→s323-চেইন-পরবর্তী ৪র্থ-স্তর)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "on324.id.indexOf('sfs314-glab-') === 0" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: উৎস-সত্য = s323-লেবেল (label.id→grows-id→first-post — স্টেট-ডুপ-শূন্য)" || bad "feed.ejs: উৎস-সত্য-অমিল"
grep -q 'var clearAll324 = function' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: এক-সক্রিয়-চুক্তি (clearAll-পূর্বে)" || bad "feed.ejs: clearAll-অমিল"
grep -q 'var keep324 = phone324.hasAttribute' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: জীবনচক্র-MO (ত্রি-MO-নিরাপদ — একই-attributeFilter)" || bad "feed.ejs: MO-অমিল"
grep -q 'window.__sfs324QA = q324' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs324QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
grep -q '.sfs314-grows > .sfs292-post\[data-sfs324-first\]' "$APP/public/assets/css/style.css" && ok "style.css: প্রথম-পোস্ট-চিহ্ন (inset-বার + টিন্ট — layout-neutral)" || bad "style.css: চিহ্ন-অমিল"
CSS324=$(sed -n '/session324 (sfs324 ট্যাপ-হাইলাইটে grows-প্রথম-পোস্ট-চিহ্ন)/,/EOF session324/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS324" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session324-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS324" | grep -q '@media (max-width: 640px)' && ok "style.css: 640px-বার-ভ্যারিয়েন্ট (৩→২px)" || bad "style.css: 640px-অনুপস্থিত"
printf '%s' "$CSS324" | grep -q 'prefers-reduced-motion' && ok "style.css: reduced-motion-নিরাপত্তা" || bad "style.css: reduced-motion-অনুপস্থিত"
grep -q 'var strip324 = function' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: strip324-নির্মাতা (bn-অঙ্ক + হেডার)" || bad "home-reorder.ejs: strip324-অমিল"
grep -q 'copyAria316-এর done316 → __hrAria317Record' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: copyAria316-বর্জন-ডক (রেকর্ড-দূষণ-গোটচা — রেকর্ড-বিহীন-রপ্তাই-পথ)" || bad "home-reorder.ejs: বর্জন-ডক-অমিল"
grep -q "fallbackCopy316(txt324)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: fallbackCopy316-মেকানিজম-পুনঃব্যবহার (কপি-মেকানিজম-এক-উৎস)" || bad "home-reorder.ejs: fallback-অমিল"
grep -q "e324k.key === 'e' || e324k.key === 'E'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: E/D-শর্টকাট (কীবোর্ড-parity — focusout-জীবনচক্ষে-ট্যাব-অপ্রাপ্য-গোটচা)" || bad "home-reorder.ejs: E/D-অমিল"
grep -q "if (!hist317.length) return; /\* শূন্য-ইতিহাসে নীরব (রপ্তাই-ও-নয়" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: শূন্য-ইতিহাস-নীরব (hr323-দর্শন)" || bad "home-reorder.ejs: নীরব-গেট-অমিল"
grep -q 'a324.download = ' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: Blob+a[download]+revoke (DOM-API — XSS-নিরাপদ)" || bad "home-reorder.ejs: ডাউনলোড-অমিল"
grep -q 'window.__hrAria324QA = q324h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria324QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
grep -q '.hr324-kbd' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr324-bar/.hr324-btn/.hr324-kbd-স্টাইল (rgba-only)" || bad "home-reorder.ejs: স্টাইল-অমিল"
S324CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session324.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S324CHK" = "OK" ]; then ok "feed.ejs: session324-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A324CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria324QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A324CHK" = "OK" ]; then ok "home-reorder.ejs: hr324-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs324QA'; then ok "SSR: s324-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s324-ইঞ্জিন-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs323QA'; then ok "SSR: __sfs323QA-হুক-অটুট (s323-সহাবস্থান)"; else bad "SSR: s323-হুক-অনুপস্থিত"; fi
NC=$(printf '%s' "$SS0" | grep -o 'class="sfs319-namechip"' | wc -l | tr -d ' ')
if [ "$NC" = "1" ]; then ok "SSR: নাম-চিপ-মার্কআপ ×১-অটুট (s319-সহাবস্থান)"; else bad "SSR: নাম-চিপ ×$NC"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট — চিহ্ন-অ্যাট্রিবিউট-নাম-অপরিবর্তিত)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs324-ই২ই (ট্যাপ-চিহ্ন→এক-সক্রিয়→keynav-বিলোপ→গেট-সমাপ্তি→চুপ) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs324QA,st:window.__sfs324QA?window.__sfs324QA.set:-1,c:window.__sfs324QA?window.__sfs324QA.count():-1,f:window.__sfs324QA?window.__sfs324QA.first():'x',e:(window.__sfs324QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf st "$Q0J")" = "0" ] && [ "$(jf c "$Q0J")" = "0" ] && [ "$(jf f "$Q0J")" = "" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs324QA-হুক + প্রারম্ভিক set=০/count=০/first-শূন্য/ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
GIDS=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,g0:ls[0].id.replace('sfs314-glab-',''),g1:ls[1].id.replace('sfs314-glab-','')}})())")
GIDSJ=$(unjj "$GIDS")
if [ "$(jf n "$GIDSJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$(jf g0 "$GIDSJ")] [$(jf g1 "$GIDSJ")])"; else bad "ই২ই: labs=$(jf n "$GIDSJ")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(ev "JSON.stringify({c:window.__sfs324QA.count(),on:window.__sfs324QA.on(),st:window.__sfs324QA.set,gid:(function(){var f=document.querySelector('.sfs314-grows > .sfs292-post[data-sfs324-first]');return f?f.closest('.sfs314-grows').id:''})(),tp:window.__sfs322QA.taps,hc:window.__sfs323QA.count()})")
T1J=$(unjj "$T1")
if [ "$(jf c "$T1J")" = "1" ] && [ "$(jf on "$T1J")" = "true" ] && [ "$(jf gid "$T1J")" = "sfs314-grows-$(jf g0 "$GIDSJ")" ]; then ok "ই২ই: ট্যাপ-১ → গ্রুপ-০-প্রথম-পোস্ট-চিহ্ন (count=১ + grows-id-মিল)"; else bad "ই২ই: $(unjj "$T1")"; fi
if [ "$(jf tp "$T1J")" = "1" ] && [ "$(jf hc "$T1J")" = "1" ]; then ok "ই২ই: s322/s323-চেইন-অটুট (taps=১ + হাইলাইট=১ — মোড়ক-স্তরে-অস্পৃশ্য)"; else bad "ই২ই: tp=$(jf tp "$T1J") hc=$(jf hc "$T1J")"; fi
BS=$(ev "JSON.stringify({bs:(function(){var f=document.querySelector('.sfs314-grows > .sfs292-post[data-sfs324-first]');return f?getComputedStyle(f).boxShadow:''})()})")
if printf '%s' "$(unjj "$BS")" | grep -q 'inset'; then ok "ই২ই: চিহ্ন-ভিজ্যুয়াল-প্রমাণ (computed-boxShadow-inset-বার — color-mix-রেসিপি)"; else bad "ই২ই: boxShadow=[$(unjj "$BS")]"; fi
if agent-browser screenshot "$SH_FP" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-প্রথম-পোস্ট-চিহ্ন সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T2=$(ev "JSON.stringify({c:window.__sfs324QA.count(),st:window.__sfs324QA.set,gid:(function(){var f=document.querySelector('.sfs314-grows > .sfs292-post[data-sfs324-first]');return f?f.closest('.sfs314-grows').id:''})()})")
T2J=$(unjj "$T2")
if [ "$(jf c "$T2J")" = "1" ] && [ "$(jf st "$T2J")" = "2" ] && [ "$(jf gid "$T2J")" = "sfs314-grows-$(jf g1 "$GIDSJ")" ]; then ok "ই২ই: ট্যাপ-২ → চিহ্ন-স্থানান্তর (এক-সক্রিয় — count=১ + grows-id-বদল)"; else bad "ই২ই: $(unjj "$T2")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T3=$(ev "JSON.stringify({c:window.__sfs324QA.count(),hc:window.__sfs323QA.count(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T3J=$(unjj "$T3")
if [ "$(jf c "$T3J")" = "0" ] && [ "$(jf hc "$T3J")" = "0" ] && [ "$(jf kf "$T3J")" = "true" ]; then ok "ই২ই: keynav-হস্তান্তর → চিহ্ন-বিলোপ (s323-বিলোপের-সমকালীন — দ্বি-চিহ্ন-বিভ্রান্তি-শূন্য)"; else bad "ই২ই: $(unjj "$T3")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
if [ "$(jf c "$(unjj "$(ev "JSON.stringify({c:window.__sfs324QA.count()})")")")" = "1" ]; then ok "ই২ই: Escape-পরবর্তী পুনঃট্যাপে চিহ্ন-পুনঃপ্রয়োগ"; else bad "ই২ই: পুনঃট্যাপে চিহ্ন-অনুপস্থিত"; fi
agent-browser wait 5000 >/dev/null 2>&1
T4=$(ev "JSON.stringify({g:window.__sfs322QA.gate(),c:window.__sfs324QA.count(),uf:window.__sfs322QA.unfrozen})")
T4J=$(unjj "$T4")
if [ "$(jf g "$T4J")" = "false" ] && [ "$(jf c "$T4J")" = "0" ] && [ "$(jf uf "$T4J")" = "1" ]; then ok "ই২ই: গেট-সমাপ্তি → চিহ্ন-বিলোপ + আনফ্রিজ (একই-মাইক্রোটাস্ক-পালা)"; else bad "ই২ই: $(unjj "$T4")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T5=$(ev "JSON.stringify({st:window.__sfs324QA.set,c:window.__sfs324QA.count(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T5J=$(unjj "$T5")
if [ "$(jf st "$T5J")" = "3" ] && [ "$(jf c "$T5J")" = "0" ] && [ "$(jf kf "$T5J")" = "true" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপে চিহ্ন-নীরব (set=৩-অপরিবর্তিত — tap-গেট-স্বতন্ত্রক)"; else bad "ই২ই: $(unjj "$T5")"; fi

echo "── ধাপ-৪: hr324-ই২ই (শূন্য-নীরব→বার→স্ট্রিপ-কপি→রেকর্ড-বিহীন→ডাউনলোড→বাটন-পথ) ──"
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
CLK=$(ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(!t)return{ok:0};t.click();return{ok:1}})())")
if [ "$(jf ok "$(unjj "$CLK")")" = "1" ]; then agent-browser wait 400 >/dev/null 2>&1; ok "ই২ই: USER_FEED-নির্বাচন"; else bad "ই২ই: USER_FEED-রো-অনুপস্থিত"; fi
H0=$(ev "JSON.stringify({q:!!window.__hrAria324QA,cp:window.__hrAria324QA?window.__hrAria324QA.copies:-1,dl:window.__hrAria324QA?window.__hrAria324QA.downloads:-1,e:((window.__hrAria324QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf cp "$H0J")" = "0" ] && [ "$(jf dl "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria324QA-হুক + রপ্তাই-বেসলাইন"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f0'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
Z0=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip.is-on'),bar:!!document.querySelector('.hr317-tip.is-on .hr324-bar'),h:window.__hrAria317QA.hist().length})")
Z0J=$(unjj "$Z0")
if [ "$(jf tip "$Z0J")" = "true" ] && [ "$(jf bar "$Z0J")" = "false" ] && [ "$(jf h "$Z0J")" = "0" ]; then ok "ই২ই: শূন্য-ইতিহাসে বার-অনুপস্থিত (নীরব-দর্শন — hr322/hr323-গেট-উত্তরাধিকার)"; else bad "ই২ই: $(unjj "$Z0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap324=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip.is-on'),bar:!!document.querySelector('.hr317-tip.is-on .hr324-bar'),b:document.querySelectorAll('.hr317-tip.is-on .hr324-btn').length,kbd:!!document.querySelector('.hr317-tip.is-on .hr324-kbd'),h:window.__hrAria317QA.hist().length})")
B1J=$(unjj "$B1")
if [ "$(jf tip "$B1J")" = "true" ] && [ "$(jf bar "$B1J")" = "true" ] && [ "$(jf b "$B1J")" = "2" ] && [ "$(jf kbd "$B1J")" = "true" ]; then ok "ই২ই: .hr324-bar-উপস্থিত (দ্বি-বাটন + kbd-হিন্ট — hist=২)"; else bad "ই২ই: $(unjj "$B1")"; fi
SP=$(ev "window.__hrAria324QA.strip()" | sed 's/^"//; s/"$//; s/\\n/⏎/g')
if printf '%s' "$SP" | grep -q 'কপি-ইতিহাস (২):' && printf '%s' "$SP" | grep -q '১ বার'; then ok "ই২ই: strip324-বিষয়বস্তু (হেডার-২ + bn-অঙ্ক — [$(printf '%s' "$SP" | head -c 90)…])"; else bad "ই২ই: strip=[$SP]"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap324=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
E1=$(ev "JSON.stringify({cp:window.__hrAria324QA.copies,cap:(window.__clipCap324||'').slice(0,18),st0:window.__hrAria324QA.strip().slice(0,18),h:window.__hrAria317QA.hist().length,cl:window.__hrAria322QA.cleared,toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),e:window.__hrAria324QA.err})")
E1J=$(unjj "$E1")
if [ "$(jf cp "$E1J")" = "1" ] && [ "$(jf cap "$E1J")" = "$(jf st0 "$E1J")" ]; then ok "ই২ই: E-কী → ক্লিপবোর্ড-স্ট্রিপ-রপ্তাই (স্টাব-ক্যাপচার = strip324-এক-উৎস)"; else bad "ই২ই: $(unjj "$E1")"; fi
if [ "$(jf h "$E1J")" = "2" ] && [ "$(jf cl "$E1J")" = "0" ]; then ok "ই২ই: রেকর্ড-বিহীন-প্রমাণ (hist=২-অপরিবর্তিত + cleared=০ — copyAria316-বর্জন-গোটচা-প্রতিষ্ঠিত)"; else bad "ই২ই: h=$(jf h "$E1J") cl=$(jf cl "$E1J")"; fi
if printf '%s' "$(jf toast "$E1J")" | grep -q 'রপ্তাই'; then ok "ই২ই: রপ্তাই-টোস্ট-প্রমাণ"; else bad "ই২ই: toast=[$(jf toast "$E1J")]"; fi
ev "JSON.stringify((function(){window.__dlStub324={urls:[],clicks:0,name:''};var oc=URL.createObjectURL;URL.createObjectURL=function(b){window.__dlStub324.urls.push(String(b&&b.size));return 'blob:qa-stub'};URL.revokeObjectURL=function(){};var ocl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){window.__dlStub324.clicks+=1;window.__dlStub324.name=this.getAttribute('download')||'';return}return ocl.call(this)};return 'dstub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true,cancelable:true}));return 'd1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
D1=$(ev "JSON.stringify({dl:window.__hrAria324QA.downloads,ck:window.__dlStub324.clicks,nm:window.__dlStub324.name,sz:window.__dlStub324.urls[0]||'',e:window.__hrAria324QA.err})")
D1J=$(unjj "$D1")
NM=$(jf nm "$D1J")
if [ "$(jf dl "$D1J")" = "1" ] && [ "$(jf ck "$D1J")" = "1" ]; then ok "ই২ই: D-কী → ডাউনলোড-পথ (Blob+anchor-click — স্টাব-প্রমাণ)"; else bad "ই২ই: $(unjj "$D1")"; fi
if printf '%s' "$NM" | grep -qE '^lekhok-copy-history-[0-9]{4}-[0-9]{2}-[0-9]{2}\.txt$' && [ "$(jf sz "$D1J")" != "" ] && [ "$(jf sz "$D1J")" != "0" ]; then ok "ই২ই: ডাউনলোড-ফাইলনাম+বিষয়বস্তু ([$NM] — ISO-তারিখ + non-empty-blob)"; else bad "ই২ই: nm=[$NM] sz=[$(jf sz "$D1J")]"; fi
ev "JSON.stringify((function(){var b=document.querySelector('.hr317-tip.is-on .hr324-copy');if(!b)return'nb';b.click();return 'bc'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
BC=$(ev "JSON.stringify({cp:window.__hrAria324QA.copies,h:window.__hrAria317QA.hist().length})")
BCJ=$(unjj "$BC")
if [ "$(jf cp "$BCJ")" = "2" ] && [ "$(jf h "$BCJ")" = "2" ]; then ok "ই২ই: বাটন-ক্লিক-পথ (pointer-রপ্তাই — একই-copyHist324 — copies=২ + hist-অটুট)"; else bad "ই২ই: $(unjj "$BC")"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true,cancelable:true}));return 'dd2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
Z2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,tip:!!document.querySelector('.hr317-tip.is-on'),bar:!!document.querySelector('.hr317-tip.is-on .hr324-bar')})")
Z2J=$(unjj "$Z2")
if [ "$(jf h "$Z2J")" = "0" ] && [ "$(jf bar "$Z2J")" = "false" ]; then ok "ই২ই: পরিষ্কার-পরবর্তী বার-অনুপস্থিত (zero-history-গেট-পুনঃপ্রয়োগ — tipRender318-চেইন)"; else bad "ই২ই: $(unjj "$Z2")"; fi
if agent-browser screenshot "$SH_EXP" >/dev/null 2>&1; then skip "অ্যাডমিন-স্ক্রিনশট (রপ্তাই-পরে শূন্য-ইতিহাস — পূর্বে-ক্যাপচারযোগ্য নয়)"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-চিহ্ন + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs324QA,err:(window.__sfs324QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs324QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(ev "JSON.stringify({c:window.__sfs324QA.count(),g:window.__sfs322QA.gate(),hc:window.__sfs323QA.count()})")
M2J=$(unjj "$M2")
if [ "$(jf c "$M2J")" = "1" ] && [ "$(jf g "$M2J")" = "true" ] && [ "$(jf hc "$M2J")" = "1" ]; then ok "মোবাইলে ট্যাপ-চিহ্ন (count=১ + গেট + হাইলাইট-সহাবস্থান)"; else bad "মোবাইলে $(unjj "$M2")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s324-suite ✓ সর্ব-সবুজ"; else echo "s324-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
