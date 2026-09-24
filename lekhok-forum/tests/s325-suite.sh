#!/bin/bash
# s325-suite.sh — session325: sfs325 ট্যাপ-পথের aria-live-ঘোষণা-parity + hr325 ইতিহাস-সারি-একক-বিলোপ
# [Task ID 162] PLANS session324-নোটের প্রস্তাব-②+③ প্রয়োগ (①-প্রোড-স্পট রাউন্ড-আরম্ভেই-সম্পন্ন):
#   ② sfs325 (feed.ejs) — টাচ-ব্যবহারকারীর ঘোষণা-parity: s324-মোড়ক-চেইন-পরবর্তী __sfs319Show-
#      পুনঃমোড়ক (৫ম-স্তর — tap-গেট × keynav-নিষ্ক্রিয়) — একই .sfs317-live-অঞ্চলে একই-বিন্যাসে
#      ঘোষণা (নতুন-অঞ্চল-ডুপ-শূন্য); অবস্থান-সূত্র = লেবেল-স্বয়ং-নির্ণীত idx (indexOf —
#      s321-এর ১-ভিত্তিক-পাস-অসমতা-স্বাধীন); অভিন্ন-পাঠ-পুনঃঘোষণা = clear→task-বিভাজন→পুনঃস্থাপন;
#      জীবনচক্র = চতুর্থ-MO — গেট-সমাপ্তি × keynav-নিষ্ক্রিয়ে বিলোপ (keynav-সক্রিয়ে হস্তান্তর-অস্পৃশ্য);
#      __sfs325QA {announces, re, last, live(), text(), err}
#   ③ hr325 (admin/home-reorder.ejs) — ইতিহাস-সারি-একক-বিলোপ: .hr325-x ×-নিয়ন্ত্রণ (সারি-হোভারে
#      প্রকাশ; stopPropagation — s319-পুনঃকপি-সংঘর্ষ-শূন্য) + X-শর্টকাট (পয়েন্টার-সারি —
#      hr320-পয়েন্টার-নেভিগেশন-সম্প্রসারণ — s320/s324-keydown-রীতি; পয়েন্টার-শূন্যে নীরব);
#      splice+save321-স্থায়ীকরণ-সিঙ্ক + ptr320-স্টেল-বিলোপ + tipRender318-এক-উৎস-রিফ্রেশ +
#      ptrSync320-পুনঃপ্রয়োগ; সর্ব-বিলোপে tipHide317 (clearHist323-সমাপ্তি-দর্শন);
#      __hrAria325QA {deletes, lastKey, hist(), ptr(), err}
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + ক্লিপবোর্ড-স্টাব-পূর্বে-কপি (defineProperty — s316/s324) +
#         হেক্স-শূন্য + নেট-শূন্য-পরিষ্কারক + সুইট-রান = রিপো-রুট-cwd (s319-চুক্তি) +
#         গেট-সমাপ্তি-wait-৫০০০ms + keynav-সক্রিয়ণ = phone-ArrowDown-keydown (s323-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_AN=/home/z/my-project/download/s325-announce-desk.png
SH_RM=/home/z/my-project/download/s325-rowdelete-admin.png
SH_MOB=/home/z/my-project/download/s325-announce-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s325-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s325-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (ভিউ/সিএসএস/সিনট্যাক্স) ──"
grep -q 'window.__sfs319Show = function (l325, i325b, n325)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs319Show-পুনঃমোড়ক (s320→s322→s323→s324-চেইন-পরবর্তী ৫ম-স্তর)" || bad "feed.ejs: মোড়ক-অমিল"
grep -q "Array.prototype.indexOf.call(labs325, l325)" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: অবস্থান-সূত্র = লেবেল-স্বয়ং-নির্ণীত idx (indexOf — ১-ভিত্তিক-পাস-অসমতা-স্বাধীন)" || bad "feed.ejs: অবস্থান-সূত্র-অমিল"
grep -q "if (!nm325) return; /\* s317-নাম-গেট-প্যারিটি" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: s317-নাম-গেট-প্যারিটি (শূন্য-নামে নীরব)" || bad "feed.ejs: নাম-গেট-অমিল"
grep -q 'window.__sfs317Announce(l325, i0325, labs325.length)' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: একই-অঞ্চল-পুনঃব্যবহার (__sfs317Announce — নতুন-অঞ্চল-ডুপ-শূন্য)" || bad "feed.ejs: অঞ্চল-পুনঃব্যবহার-অমিল"
grep -q "q325.re += 1" "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: অভিন্ন-পাঠ-পুনঃঘোষণা-পথ (clear→task-বিভাজন→পুনঃস্থাপন)" || bad "feed.ejs: পুনঃঘোষণা-পথ-অমিল"
grep -q 'var gateGone325 = !phone325.hasAttribute' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: জীবনচক্র-MO (চতুর্থ-MO — গেট-সমাপ্তি × keynav-নিষ্ক্রিয়ে বিলোপ)" || bad "feed.ejs: MO-অমিল"
grep -q 'window.__sfs325QA = q325' "$APP/views/partials/home/feed.ejs" && ok "feed.ejs: __sfs325QA-হুক" || bad "feed.ejs: QA-হুক-অমিল"
CSS325=$(sed -n '/session325 (sfs325 ট্যাপ-ঘোষণা-parity/,/EOF session325/p' "$APP/public/assets/css/style.css")
HEXN=$(printf '%s' "$CSS325" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
if [ "$HEXN" = "0" ]; then ok "style.css: session325-ব্লক হেক্স-শূন্য (guard:design-চুক্তি)"; else bad "style.css: হেক্স ×$HEXN"; fi
printf '%s' "$CSS325" | grep -q '.sfs292-glabel:active' && ok "style.css: ট্যাপ-প্রেস-ফিডব্যাক (glabel:active-টিন্ট — কেবল-রঙ — geometry-অস্পৃশ্য)" || bad "style.css: প্রেস-ফিডব্যাক-অনুপস্থিত"
printf '%s' "$CSS325" | grep -q '@media (max-width: 640px)' && ok "style.css: 640px-ভ্যারিয়েন্ট (টিন্ট ১৮→২২%)" || bad "style.css: 640px-অনুপস্থিত"
printf '%s' "$CSS325" | grep -q 'prefers-reduced-motion' && ok "style.css: reduced-motion-নিরাপত্তা" || bad "style.css: reduced-motion-অনুপস্থিত"
grep -q '.hr325-x' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: .hr325-x-স্টাইল (rgba-only + :focus-visible-রিং)" || bad "home-reorder.ejs: .hr325-x-স্টাইল-অমিল"
grep -q 'var deleteRow325 = function' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: deleteRow325-এক-উৎস (splice+save321+ptr-স্টেল-বিলোপ)" || bad "home-reorder.ejs: deleteRow325-অমিল"
grep -q "save321(); /\* স্থায়ীকরণ-সিঙ্ক" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: স্থায়ীকরণ-সিঙ্ক (hr321-এক-উৎস — পুনঃলোডে বিলোপ-টিকে)" || bad "home-reorder.ejs: save321-অমিল"
grep -q "e325f.stopPropagation(); deleteRow325(k325x)" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: ×-stopPropagation (s319-সারি-পুনঃকপি-সংঘর্ষ-শূন্য)" || bad "home-reorder.ejs: stopPropagation-অমিল"
grep -q "e325h.key !== 'x' && e325h.key !== 'X'" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: X-শর্টকাট (পয়েন্টার-সারি — s320/s324-keydown-রীতি)" || bad "home-reorder.ejs: X-শর্টকাট-অমিল"
grep -q "if (!ptr320 || ptrIdx320() < 0) return; /\* পয়েন্টার-শূন্যে নীরব" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: পয়েন্টার-শূন্যে-নীরব (কিছু-নির্বাচিত-নয়)" || bad "home-reorder.ejs: নীরব-গেট-অমিল"
grep -q "X = পয়েন্টার-সারি বিলোপ" "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: kbd-হিন্ট-সম্প্রসারণ (X = পয়েন্টার-সারি বিলোপ)" || bad "home-reorder.ejs: হিন্ট-অমিল"
grep -q 'window.__hrAria325QA = q325h' "$APP/admin/views/admin/home-reorder.ejs" && ok "home-reorder.ejs: __hrAria325QA-হুক" || bad "home-reorder.ejs: QA-হুক-অমিল"
S325CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/views/partials/home/feed.ejs', encoding='utf-8').read()
m = re.search(r'<script>\n(/\* session325.*?)</script>', t, re.S)
if not m: print('FAIL'); raise SystemExit
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(m.group(1)); f.close()
r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
print('OK' if r.returncode == 0 else 'FAIL')")
if [ "$S325CHK" = "OK" ]; then ok "feed.ejs: session325-ইঞ্জিন node --check OK"; else bad "feed.ejs: ইঞ্জিন-সিনট্যাক্স-ব্যর্থ"; fi
A325CHK=$(python3 -c "
import io, re, subprocess, tempfile, os
t = io.open('$APP/admin/views/admin/home-reorder.ejs', encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', t, re.S)
okall = True; found = False
for b in blocks:
    if '__hrAria325QA' not in b: continue
    found = True
    b2 = re.sub(r'<%[\s\S]*?%>', '\"__EJS__\"', b)
    f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); f.write(b2); f.close()
    r = subprocess.run(['node','--check',f.name], capture_output=True, text=True); os.unlink(f.name)
    if r.returncode != 0: okall = False
print('OK' if (okall and found) else 'FAIL')")
if [ "$A325CHK" = "OK" ]; then ok "home-reorder.ejs: hr325-স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi

echo "── ধাপ-২: SSR (সার্ভার-রেন্ডার-মার্কার) ──"
SS0=$(curl -s "$BASE/")
if printf '%s' "$SS0" | grep -q '__sfs325QA'; then ok "SSR: s325-ইঞ্জিন-হুক-রেন্ডারিত"; else bad "SSR: s325-ইঞ্জিন-অনুপস্থিত"; fi
if printf '%s' "$SS0" | grep -q '__sfs324QA'; then ok "SSR: __sfs324QA-হুক-অটুট (s324-সহাবস্থান)"; else bad "SSR: s324-হুক-অনুপস্থিত"; fi
LV=$(printf '%s' "$SS0" | grep -o 'class="sfs317-live"' | wc -l | tr -d ' ')
if [ "$LV" = "1" ]; then ok "SSR: .sfs317-live-অঞ্চল ×১-অটুট (একই-অঞ্চল-পুনঃব্যবহার — ডুপ-শূন্য)"; else bad "SSR: live-অঞ্চল ×$LV"; fi
AL=$(printf '%s' "$SS0" | grep -o '<a class="sfs292-phone"' | wc -l | tr -d ' ')
if [ "$AL" = "1" ]; then ok "SSR: phone-একক-লিঙ্ক (s306-চুক্তি-অটুট)"; else bad "SSR: phone-লিঙ্ক ×$AL"; fi

echo "── ধাপ-৩: sfs325-ই২ই (ট্যাপ-ঘোষণা→অবস্থান-সঠিক→পুনঃঘোষণা→হস্তান্তর→গেট-সমাপ্তি→চুপ) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
if bopen "$BASE/"; then agent-browser wait 1500 >/dev/null 2>&1; ok "ই২ই: হোম-লোড"; else bad "হোম-open-ব্যর্থ"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 700 >/dev/null 2>&1
Q0=$(ev "JSON.stringify({q:!!window.__sfs325QA,ann:window.__sfs325QA?window.__sfs325QA.announces:-1,lv:window.__sfs325QA?window.__sfs325QA.live():false,tx:window.__sfs325QA?window.__sfs325QA.text():'x',e:(window.__sfs325QA||{}).err||''})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf ann "$Q0J")" = "0" ] && [ "$(jf lv "$Q0J")" = "true" ] && [ "$(jf tx "$Q0J")" = "" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __sfs325QA-হুক + প্রারম্ভিক announces=০/অঞ্চল-জীবন্ত/পাঠ-শূন্য/ত্রুটি-শূন্য"; else bad "ই২ই: $(unjj "$Q0")"; fi
GIDS=$(ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');return {n:ls.length,n0:ls[0].textContent.replace(/\\s+/g,' ').trim(),n1:ls[1].textContent.replace(/\\s+/g,' ').trim()}})())")
GIDSJ=$(unjj "$GIDS")
if [ "$(jf n "$GIDSJ")" = "2" ]; then ok "ই২ই: দৃশ্যমান-গ্রুপ-লেবেল ×২ ([$(jf n0 "$GIDSJ")] [$(jf n1 "$GIDSJ")])"; else bad "ই২ই: labs=$(jf n "$GIDSJ")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T1=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,tx:window.__sfs317QA.text(),last:window.__sfs325QA.last,st:window.__sfs317QA.announces,gate:window.__sfs322QA.gate(),s324:window.__sfs324QA.count(),err:window.__sfs325QA.err})")
T1J=$(unjj "$T1")
EXP1="$(jf n0 "$GIDSJ") — ১/২"
if [ "$(jf ann "$T1J")" = "1" ] && [ "$(jf tx "$T1J")" = "$EXP1" ]; then ok "ই২ই: ট্যাপ-১ → ঘোষণা (একই-অঞ্চল — [$(jf tx "$T1J")])"; else bad "ই২ই: $(unjj "$T1") exp=[$EXP1]"; fi
if [ "$(jf st "$T1J")" = "1" ] && [ "$(jf gate "$T1J")" = "true" ] && [ "$(jf s324 "$T1J")" = "1" ]; then ok "ই২ই: s317-গণনা-এক + s322-গেট + s324-চিহ্ন (সম্পূর্ণ-চেইন-সহাবস্থান)"; else bad "ই২ই: st=$(jf st "$T1J") gate=$(jf gate "$T1J") s324=$(jf s324 "$T1J")"; fi
if agent-browser screenshot "$SH_AN" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-ঘোষণা-মুহূর্ত সংরক্ষিত"; else skip "ডেস্ক-স্ক্রিনশট-ব্যর্থ"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't2'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T2=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,tx:window.__sfs317QA.text(),re:window.__sfs325QA.re})")
T2J=$(unjj "$T2")
EXP2="$(jf n1 "$GIDSJ") — ২/২"
if [ "$(jf ann "$T2J")" = "2" ] && [ "$(jf tx "$T2J")" = "$EXP2" ]; then ok "ই২ই: ট্যাপ-২ → ঘোষণা-স্থানান্তর (অবস্থান-সঠিক ২/২ — indexOf-স্বয়ং-নির্ণীত)"; else bad "ই২ই: $(unjj "$T2") exp=[$EXP2]"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[1];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't3'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
T3=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,re:window.__sfs325QA.re,tx:window.__sfs317QA.text()})")
T3J=$(unjj "$T3")
if [ "$(jf ann "$T3J")" = "3" ] && [ "$(jf re "$T3J")" = "1" ] && [ "$(jf tx "$T3J")" = "$EXP2" ]; then ok "ই২ই: একই-লেবেল-পুনঃট্যাপ → অভিন্ন-পাঠ-পুনঃঘোষণা (re=১ — clear→task-বিভাজন→পুনঃস্থাপন)"; else bad "ই২ই: $(unjj "$T3")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T4=$(ev "JSON.stringify({tx:window.__sfs317QA.text(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),kann:window.__sfs317QA.announces,ann:window.__sfs325QA.announces})")
T4J=$(unjj "$T4")
KEXP="$(jf n0 "$GIDSJ") — ১/২"
if [ "$(jf kf "$T4J")" = "true" ] && [ "$(jf tx "$T4J")" = "$KEXP" ] && [ "$(jf kann "$T4J")" = "4" ]; then ok "ই২ই: keynav-হস্তান্তর → অঞ্চল-মালিকানা-হস্তান্তর (keynav-নিজস্ব-ঘোষণা — s325-অস্পৃশ্য — kann=৪ = ট্যাপ-৩ + keynav-১)"; else bad "ই২ই: $(unjj "$T4") exp=[$KEXP]"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return 'e1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
T5=$(ev "JSON.stringify({tx:window.__sfs317QA.text(),kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus'),err:window.__sfs325QA.err})")
T5J=$(unjj "$T5")
if [ "$(jf tx "$T5J")" = "" ] && [ "$(jf kf "$T5J")" = "false" ]; then ok "ই২ই: Escape-পরিষ্কার (s317-নিজস্ব-পথ — অঞ্চল-শূন্য)"; else bad "ই২ই: $(unjj "$T5")"; fi
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't4'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
T6=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,tx:window.__sfs317QA.text(),re:window.__sfs325QA.re})")
T6J=$(unjj "$T6")
if [ "$(jf ann "$T6J")" = "4" ] && [ "$(jf tx "$T6J")" = "$EXP1" ]; then ok "ই২ই: Escape-পরবর্তী পুনঃট্যাপে ঘোষণা-পুনঃপ্রয়োগ (পূর্ব-পাঠ-শূন্য — re-পথ-অনুপস্থিত)"; else bad "ই২ই: $(unjj "$T6")"; fi
agent-browser wait 5000 >/dev/null 2>&1
T7=$(ev "JSON.stringify({tx:window.__sfs317QA.text(),gate:window.__sfs322QA.gate(),uf:window.__sfs322QA.unfrozen,e:window.__sfs325QA.err})")
T7J=$(unjj "$T7")
if [ "$(jf tx "$T7J")" = "" ] && [ "$(jf gate "$T7J")" = "false" ] && [ "$(jf uf "$T7J")" = "1" ]; then ok "ই২ই: গেট-সমাপ্তি → ঘোষণা-বিলোপ + আনফ্রিজ (চতুর্থ-MO — একই-মাইক্রোটাস্ক-পালা)"; else bad "ই২ই: $(unjj "$T7")"; fi
ev "JSON.stringify((function(){var p=document.querySelector('.sfs292-phone');p.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'k2'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
ev "JSON.stringify((function(){var ls=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]');ls[1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 't5'})())" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
T8=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,kf:document.querySelector('.sfs292-phone').hasAttribute('data-sfs314-focus')})")
T8J=$(unjj "$T8")
if [ "$(jf ann "$T8J")" = "4" ] && [ "$(jf kf "$T8J")" = "true" ]; then ok "ই২ই: keynav-সক্রিয়ে ট্যাপে ঘোষণা-নীরব (announces=৪-অপরিবর্তিত — tap-গেট-স্বতন্ত্রক)"; else bad "ই২ই: $(unjj "$T8")"; fi

echo "── ধাপ-৪: hr325-ই২ই (শূন্য-নীরব→×-নিয়ন্ত্রণ→×-বিলোপ→স্থায়ীকরণ→X-শর্টকাট→সর্ব-বিলোপ) ──"
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
H0=$(ev "JSON.stringify({q:!!window.__hrAria325QA,dl:window.__hrAria325QA?window.__hrAria325QA.deletes:-1,e:((window.__hrAria325QA||{}).err||'')})")
H0J=$(unjj "$H0")
if [ "$(jf q "$H0J")" = "true" ] && [ "$(jf dl "$H0J")" = "0" ] && [ "$(jf e "$H0J")" = "" ]; then ok "ই২ই: __hrAria325QA-হুক + বিলোপ-বেসলাইন"; else bad "ই২ই: $(unjj "$H0")"; fi
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f0'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
Z0=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip.is-on'),x:document.querySelectorAll('.hr317-tip.is-on .hr325-x').length,h:window.__hrAria317QA.hist().length})")
Z0J=$(unjj "$Z0")
if [ "$(jf tip "$Z0J")" = "true" ] && [ "$(jf x "$Z0J")" = "0" ] && [ "$(jf h "$Z0J")" = "0" ]; then ok "ই২ই: শূন্য-ইতিহাসে ×-অনুপস্থিত (নীরব-দর্শন — hr319-live-গেট-উত্তরাধিকার)"; else bad "ই২ই: $(unjj "$Z0")"; fi
ev "JSON.stringify((function(){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap325=t;return Promise.resolve()}},configurable:true});return 'stub'})())" >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].click();return 'c1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){document.querySelectorAll('.hr-aria-copy')[1].click();return 'c2'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f1'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
B1=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip.is-on'),x:document.querySelectorAll('.hr317-tip.is-on .hr325-x').length,lb:(document.querySelectorAll('.hr317-tip.is-on .hr325-x')[0]||{}).getAttribute?document.querySelectorAll('.hr317-tip.is-on .hr325-x')[0].getAttribute('aria-label').slice(0,14):'',kbd:(document.querySelector('.hr317-tip.is-on .hr324-kbd')||{textContent:''}).textContent,h:window.__hrAria317QA.hist().length})")
B1J=$(unjj "$B1")
if [ "$(jf tip "$B1J")" = "true" ] && [ "$(jf x "$B1J")" = "2" ] && [ "$(jf lb "$B1J")" = "ইতিহাস-সারি বি" ]; then ok "ই২ই: ×-নিয়ন্ত্রণ ×২ + aria-label (hist=২)"; else bad "ই২ই: $(unjj "$B1")"; fi
if printf '%s' "$(jf kbd "$B1J")" | grep -q 'X = পয়েন্টার-সারি বিলোপ'; then ok "ই২ই: kbd-হিন্ট-সম্প্রসারণ (X = পয়েন্টার-সারি বিলোপ)"; else bad "ই২ই: kbd=[$(jf kbd "$B1J")]"; fi
RC0=$(ev "window.__hrAria319QA.recopies" | tr -d '"')
if agent-browser screenshot "$SH_RM" >/dev/null 2>&1; then ok "স্ক্রিনশট: অ্যাডমিন-সারি-×-নিয়ন্ত্রণ সংরক্ষিত"; else skip "অ্যাডমিন-স্ক্রিনশট-ব্যর্থ"; fi
K0=$(unjj "$(ev "document.querySelectorAll('.hr317-tip.is-on .hr318-row')[0].getAttribute('data-copy')")")
ev "JSON.stringify((function(){var x=document.querySelectorAll('.hr317-tip.is-on .hr325-x')[0];x.click();return 'x1'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
X1=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,dl:window.__hrAria325QA.deletes,lk:window.__hrAria325QA.lastKey,rc:window.__hrAria319QA.recopies,rows:document.querySelectorAll('.hr317-tip.is-on .hr318-row').length,toast:(function(){var ts=document.querySelectorAll('.hr-toast');return ts.length?ts[ts.length-1].textContent:''})(),stored:(function(){try{return JSON.parse(sessionStorage.getItem('hr321-hist')||'[]').length}catch(e){return -1}})(),e:window.__hrAria325QA.err})")
X1J=$(unjj "$X1")
if [ "$(jf h "$X1J")" = "1" ] && [ "$(jf dl "$X1J")" = "1" ] && [ "$(jf lk "$X1J")" = "$K0" ]; then ok "ই২ই: ×-ক্লিক → এক-সারি-বিলোপ (hist=১ + lastKey-মিল)"; else bad "ই২ই: $(unjj "$X1") K0=[$K0]"; fi
if [ "$(jf rc "$X1J")" = "$RC0" ] && [ "$(jf rc "$X1J")" = "0" ]; then ok "ই২ই: পুনঃকপি-সংঘর্ষ-শূন্য (recopies=০ — stopPropagation-প্রমাণ)"; else bad "ই২ই: recopies=$(jf rc "$X1J") (প্রত্যাশা ০)"; fi
if [ "$(jf stored "$X1J")" = "1" ] && printf '%s' "$(jf toast "$X1J")" | grep -q 'বিলোপ'; then ok "ই২ই: স্থায়ীকরণ-সিঙ্ক (sessionStorage ×১) + টোস্ট-প্রমাণ"; else bad "ই২ই: stored=$(jf stored "$X1J") toast=[$(jf toast "$X1J")]"; fi
RL=$(unjj "$(ev "document.querySelectorAll('.hr317-tip.is-on .hr318-row')[0].getAttribute('data-copy')")")
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.focus();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));return 'p1'})())" >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
P1=$(ev "JSON.stringify({ptr:window.__hrAria325QA.ptr()})")
P1J=$(unjj "$P1")
if [ "$(jf ptr "$P1J")" = "$RL" ]; then ok "ই২ই: পয়েন্টার-নেভিগেশন (ArrowDown → অবশিষ্ট-সারি)"; else bad "ই২ই: $(unjj "$P1") RL=[$RL]"; fi
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'x',bubbles:true,cancelable:true}));return 'xdel'})())" >/dev/null 2>&1
agent-browser wait 450 >/dev/null 2>&1
X2=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,dl:window.__hrAria325QA.deletes,tip:!!document.querySelector('.hr317-tip.is-on'),e:window.__hrAria325QA.err})")
X2J=$(unjj "$X2")
if [ "$(jf h "$X2J")" = "0" ] && [ "$(jf dl "$X2J")" = "2" ] && [ "$(jf tip "$X2J")" = "false" ]; then ok "ই২ই: X-শর্টকাট → পয়েন্টার-সারি-বিলোপ (hist=০ + সর্ব-বিলোপে tipHide — সমাপ্তি-দর্শন)"; else bad "ই২ই: $(unjj "$X2")"; fi
ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelectorAll('.hr-aria-copy')[0].focus();return 'f2'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
ev "JSON.stringify((function(){var b=document.querySelectorAll('.hr-aria-copy')[0];b.dispatchEvent(new KeyboardEvent('keydown',{key:'x',bubbles:true,cancelable:true}));return 'x0'})())" >/dev/null 2>&1
agent-browser wait 350 >/dev/null 2>&1
X3=$(ev "JSON.stringify({h:window.__hrAria317QA.hist().length,dl:window.__hrAria325QA.deletes,ptr:window.__hrAria325QA.ptr()})")
X3J=$(unjj "$X3")
if [ "$(jf h "$X3J")" = "0" ] && [ "$(jf dl "$X3J")" = "2" ] && [ "$(jf ptr "$X3J")" = "" ]; then ok "ই২ই: পয়েন্টার-শূন্যে X-নীরব (কিছু-নির্বাচিত-নয় — hr323-দর্শন)"; else bad "ই২ই: $(unjj "$X3")"; fi
bopen "$BASE/admin/home-reorder" || bad "home-reorder-পুনঃopen-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
X4=$(ev "JSON.stringify((function(){try{var a=JSON.parse(sessionStorage.getItem('hr321-hist')||'[]');return{restored:window.__hrAria321QA.restored,len:a.length}}catch(e){return{restored:-1,len:-1}}})())")
X4J=$(unjj "$X4")
if [ "$(jf restored "$X4J")" = "0" ] && [ "$(jf len "$X4J")" = "0" ]; then ok "ই২ই: পুনঃলোডে বিলোপ-টিকে (স্টোর-শূন্য → restored=০ — স্থায়ীকরণ-সিঙ্ক-প্রমাণ)"; else bad "ই২ই: $(unjj "$X4")"; fi

echo "── ধাপ-৫: মোবাইল-390 (hScroll-শূন্য + ট্যাপ-ঘোষণা + স্ক্রিনশট) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "মোবাইল-হোম-open-ব্যর্থ"
agent-browser wait 1500 >/dev/null 2>&1
M=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,q:!!window.__sfs325QA,err:(window.__sfs325QA||{}).err||''})")
MJ=$(unjj "$M")
if [ "$(jf hs "$MJ")" = "false" ]; then ok "মোবাইল-390 hScroll-শূন্য"; else bad "মোবাইল-390 আড়াআড়ি-স্ক্রল"; fi
if [ "$(jf q "$MJ")" = "true" ] && [ "$(jf err "$MJ")" = "" ]; then ok "মোবাইলে __sfs325QA-হুক + ত্রুটি-শূন্য"; else bad "মোবাইলে $(unjj "$M")"; fi
ev "document.querySelector('.sfs292-card').scrollIntoView({block:'center'});'v'" >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
ev "JSON.stringify((function(){var l=document.querySelectorAll('.sfs292-half:not([aria-hidden=\"true\"]) .sfs292-glabel[id]')[0];l.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 'm1'})())" >/dev/null 2>&1
agent-browser wait 550 >/dev/null 2>&1
M2=$(ev "JSON.stringify({ann:window.__sfs325QA.announces,tx:window.__sfs317QA.text(),g:window.__sfs322QA.gate(),hc:window.__sfs323QA.count()})")
M2J=$(unjj "$M2")
if [ "$(jf ann "$M2J")" = "1" ] && [ "$(jf g "$M2J")" = "true" ] && [ "$(jf hc "$M2J")" = "1" ]; then ok "মোবাইলে ট্যাপ-ঘোষণা (announces=১ + গেট + হাইলাইট-সহাবস্থান)"; else bad "মোবাইলে $(unjj "$M2")"; fi
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
if [ "$FAIL" = "0" ]; then echo "s325-suite ✓ সর্ব-সবুজ"; else echo "s325-suite ✗ ব্যর্থতা বিদ্যমান"; fi
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
