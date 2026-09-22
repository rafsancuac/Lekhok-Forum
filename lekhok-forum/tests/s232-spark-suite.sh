#!/bin/bash
# s232-spark-suite.sh — session232 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s231-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: স্পার্ক/ট্রেন্ড-টুলটিপ (data-d/data-v/data-unit + hover/focus/blur + বার-মান-মিল) + কমপ্যাক্ট-মোড
#          (বাটন + d-কী + localStorage-স্মরণ + typing-গার্ড) + সহায়িকা-সারি + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
# গোটচা-সম্মতি (PLANS session231-নোট): eval-IIFE })()-ইনভোকড · কোট-এস্কেপ-দ্বি-স্তর (k..: + ..ভ্যালু) ·
#         reloadSoon-রেসে pollst · ক্ষণস্থায়ী-টোস্ট-অ্যাসার্ট-বর্জন (ক্লাস/লোকালস্টোরেজ-ই-সত্য-সিগনাল)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
assert(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (প্রত্যাশা=$2 প্রাপ্ত=$3)"; fi; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
numof(){ echo "$1" | grep -o "$2..:[0-9-]*" | grep -o '[0-9-]*$'; }
# waitdesk — reload-রেস-প্রতিরোধ; pollst — রিলোড/হোভার-ইভেন্ট-রেস-নিরাপদ পোল-রিট্রাই (১২×০.৫সে)
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s232-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
waitdesk(){ agent-browser wait '.sc-card' >/dev/null 2>&1; sleep 0.7; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→seed→বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$APP" && node tests/s231-seed-undo.js seed) || { echo "FATAL: seed ব্যর্থ"; exit 1; }
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: CSRF-লগইন + কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "টুলটিপ-এলিমেন্ট" "$DESK" 'id="scSparkTip"'
contains "স্পার্ক-ইউনিট-হুক (avg=ঘ)" "$DESK" 'data-unit="ঘ"'
DD=$(echo "$DESK" | grep -o 'data-d="' | wc -l | tr -d ' ')
assert "data-d-হুক ৪২-বার (৪-স্পার্ক+২-ট্রেন্ড)" "42" "$DD"
NT=$(echo "$DESK" | grep -o '<i [^>]*title=' | wc -l | tr -d ' ')
assert "native-title-বাদ (স্পার্ক-বার)" "0" "$NT"
contains "কমপ্যাক্ট-বাটন" "$DESK" 'id="scCompactBtn"'
contains "সহায়িকা-d-সারি" "$DESK" 'কমপ্যাক্ট-মোড টগল'
contains "সহায়িকা-হোভার-সারি" "$DESK" 'দিনভিত্তিক-গণনা টুলটিপ'
contains "টুলটিপ-CSS (data-on)" "$DESK" '#scSparkTip\[data-on="1"\]'
contains "কমপ্যাক্ট-CSS" "$DESK" '.sc-compact .sc-card'
contains "কমপ্যাক্ট-স্মরণ-কী" "$DESK" "sc-compact"
contains "রিগ্রেশন: KPI-গ্রুপ" "$DESK" 'sc-kpis'
contains "রিগ্রেশন: বাল্ক-টুলবার" "$DESK" 'id="scBulk"'
contains "রিগ্রেশন: আন্ডু-স্ট্যাক" "$DESK" "sc-undo"

echo "── ধাপ-২: ব্রাউজার-সেশন (রোবাস্ট-লগইন retry-চুক্তি) ──"
agent-browser close >/dev/null 2>&1 || true
sleep 0.5
agent-browser open "$BASE/admin/login" >/dev/null 2>&1
sleep 1.2
for i in 1 2 3; do
  U=$(agent-browser get url 2>/dev/null || echo '')
  echo "$U" | grep -q '/admin/login' && break
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
done
agent-browser fill '#username' admin >/dev/null 2>&1
agent-browser fill '#password' admin123 >/dev/null 2>&1
agent-browser click 'button[type="submit"]' >/dev/null 2>&1
sleep 1.4
AU=$(agent-browser get url 2>/dev/null || echo '')
if echo "$AU" | grep -q '/admin/login'; then
  agent-browser click 'button[type="submit"]' >/dev/null 2>&1; sleep 1.4
  AU=$(agent-browser get url 2>/dev/null || echo '')
fi
if echo "$AU" | grep -q '/admin/login'; then bad "ব্রাউজার-লগইন-ব্যর্থ (URL=$AU)"; else ok "ব্রাউজার-লগইন"; fi
agent-browser open "$BASE/admin/support-center?status=PENDING" >/dev/null 2>&1
waitdesk
TAGN=$(ev "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});return JSON.stringify({n:c.length});})()")
assert "TAG-কার্ড-২টি রেন্ডার" "2" "$(numof "$TAGN" 'n')"

echo "── ধাপ-৩: টুলটিপ — হোভার/হোভার-আউট/ফোকাস/ব্লার ──"
# গোটচা (session213-চুক্তি): agent-browser hover-এর-পরে ট্রেলিং-mouseout → টুলটিপ-দৃশ্যমানতা ক্ষণস্থায়ী →
# ইন-ব্রাউজার MutationObserver-এ ধরুন (data-on অ্যাট্রিবিউট-ওয়াচ; হিডেন-পরেও টেক্সট-রক্ষা)
ev "(function(){var t=document.getElementById('scSparkTip');window.__tipSeen=false;new MutationObserver(function(){if(t.getAttribute('data-on')==='1')window.__tipSeen=t.textContent;}).observe(t,{attributes:true,attributeFilter:['data-on']});return 'OBS';})()" >/dev/null
agent-browser hover '.k-spark[data-spark="fresh"] i:nth-child(3)' >/dev/null 2>&1
T1=$(pollst "(function(){return JSON.stringify({seen:!!window.__tipSeen,txt:String(window.__tipSeen)});})()" 'seen..:true')
contains "হোভার→টুলটিপ-দৃশ্যমান (observer-ট্রেনজিয়েন্ট-নিরাপদ)" "$T1" 'seen..:true'
contains "টুলটিপ-টেক্সট-ইউনিট (টি)" "$T1" 'টি'
T2=$(ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"fresh\"] i:nth-child(3)');return JSON.stringify({same:window.__tipSeen===b.getAttribute('data-d')+' — '+b.getAttribute('data-v')+' টি'});})()")
contains "টুলটিপ-মান-বার-data-মিল" "$T2" 'same..:true'
agent-browser hover '.admin-header h1' >/dev/null 2>&1
sleep 0.4
T3=$(ev "(function(){var t=document.getElementById('scSparkTip');return JSON.stringify({on:t.getAttribute('data-on')});})()")
contains "হোভার-আউট→লুকায়" "$T3" 'on..:null'
T4=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').focus();var t=document.getElementById('scSparkTip');return JSON.stringify({on:t.getAttribute('data-on'),txt:t.textContent});})()")
contains "KPI-ফোকাস→আজ-বার-দৃশ্যমান" "$T4" 'on..:..1'
contains "ফোকাস-টুলটিপ-ইউনিট (ঘ)" "$T4" 'ঘ'
T5=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').blur();var t=document.getElementById('scSparkTip');return JSON.stringify({on:t.getAttribute('data-on')});})()")
contains "ব্লার→লুকায়" "$T5" 'on..:null'

echo "── ধাপ-৪: কমপ্যাক্ট-মোড (বাটন + স্মরণ + d-কী + typing-গার্ড) ──"
ev "localStorage.removeItem('sc-compact');'CLEARED'" >/dev/null
agent-browser reload >/dev/null 2>&1
waitdesk
C0=$(ev "(function(){return JSON.stringify({cls:document.body.classList.contains('sc-compact')});})()")
contains "বেসলাইন-বন্ধ" "$C0" 'cls..:false'
agent-browser click '#scCompactBtn' >/dev/null 2>&1
sleep 0.4
C1=$(ev "(function(){return JSON.stringify({cls:document.body.classList.contains('sc-compact'),ls:localStorage.getItem('sc-compact'),pr:document.getElementById('scCompactBtn').getAttribute('aria-pressed')});})()")
contains "বাটন-ক্লিক→চালু (ক্লাস)" "$C1" 'cls..:true'
contains "বাটন-ক্লিক→স্মরণ (ls=১)" "$C1" 'ls..:..1'
contains "বাটন-ক্লিক→aria-pressed" "$C1" 'pr..:..true'
agent-browser reload >/dev/null 2>&1
waitdesk
C2=$(ev "(function(){return JSON.stringify({cls:document.body.classList.contains('sc-compact')});})()")
contains "রিলোডে-স্মরণ-টিকে" "$C2" 'cls..:true'
ev "(function(){var t=document.querySelector('.sc-note-box textarea');t.focus();t.dispatchEvent(new KeyboardEvent('keydown',{key:'d',code:'KeyD',bubbles:true,cancelable:true}));return 'TYPED';})()" >/dev/null
sleep 0.3
C3=$(ev "(function(){return JSON.stringify({cls:document.body.classList.contains('sc-compact')});})()")
contains "typing-গার্ড (লেখা-বক্সে d-অকার্যকর)" "$C3" 'cls..:true'
ev "(function(){var t=document.querySelector('.sc-note-box textarea');t.blur();document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'d',code:'KeyD',bubbles:true,cancelable:true}));return 'KEYD';})()" >/dev/null
sleep 0.3
C4=$(ev "(function(){return JSON.stringify({cls:document.body.classList.contains('sc-compact'),ls:localStorage.getItem('sc-compact')});})()")
contains "d-কী→বন্ধ" "$C4" 'cls..:false'
contains "d-কী→স্মরণ-হালনাগাদ (ls=০)" "$C4" 'ls..:..0'

echo "── ধাপ-৫: সহায়িকা (d-সারি + Esc-চক্র) ──"
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'?',code:'Slash',shiftKey:true,bubbles:true,cancelable:true}));'Q'" >/dev/null
sleep 0.5
H1=$(ev "(function(){var h=document.getElementById('scHelp');var row=false;[].slice.call(h.querySelectorAll('.sc-help-row')).forEach(function(r){if(r.textContent.indexOf('কমপ্যাক্ট-মোড টগল')>=0)row=true;});return JSON.stringify({row:row,open:h.classList.contains('open')});})()")
contains "সহায়িকা-খোলা + d-সারি" "$H1" 'row..:true'
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));'ESC'" >/dev/null
sleep 0.4
H2=$(ev "(function(){return JSON.stringify({open:document.getElementById('scHelp').classList.contains('open')});})()")
contains "Esc-বন্ধ" "$H2" 'open..:false'

echo "── ধাপ-৬: স্ক্রিনশট + 390px + কনসোল ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 0.5
# স্ক্রিনশট-বাস্তবায়ন: সিনথেটিক-mouseover (dispatchEvent) — টুলটিপ-ধরে-রাখে (রিয়েল-হোভারের-ট্রেলিং-mouseout-সমস্যা-মুক্ত)
ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"res\"] i:nth-child(5)');b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'TIP';})()" >/dev/null
sleep 0.5
agent-browser screenshot "$APP/download/s232-tooltip.png" >/dev/null 2>&1
ev "(function(){document.getElementById('scSparkTip').removeAttribute('data-on');return 'HIDE';})()" >/dev/null
agent-browser click '#scCompactBtn' >/dev/null 2>&1
sleep 0.6
agent-browser screenshot "$APP/download/s232-compact.png" >/dev/null 2>&1
agent-browser click '#scCompactBtn' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 0.6
HW=$(ev "(function(){return JSON.stringify({h:document.documentElement.scrollWidth,w:window.innerWidth});})()")
H=$(numof "$HW" 'h'); W=$(numof "$HW" 'w')
if [ -n "$H" ] && [ -n "$W" ] && [ "$H" -le "$W" ]; then ok "390px অনুভূমিক-ওভারফ্লো-শূন্য ($H<=$W)"; else bad "390px ওভারফ্লো — $HW"; fi
agent-browser screenshot "$APP/download/s232-mobile-390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
waitdesk
CONS=$(agent-browser console 2>/dev/null | grep -ci "error" || true)
assert "কনসোল-ত্রুটি-শূন্য" "0" "$CONS"

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + ফাইল-ক্লিনআপ ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.5
(cd "$APP" && node tests/s231-seed-undo.js cleanup)
pkill -f "chrome.*agent-browser" 2>/dev/null || true
echo ""
echo "s232-spark-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] || exit 1
