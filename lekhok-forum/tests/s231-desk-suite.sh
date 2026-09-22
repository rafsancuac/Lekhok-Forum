#!/bin/bash
# s231-desk-suite.sh — session231 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; /tmp-লস-সমস্যার সমাধান)
# কভারেজ: কাঠামো (KPI+স্পার্ক+ট্রেন্ড+বাল্ক+সহায়িকা) + Ctrl+Z আন্ডু (সিঙ্গেল+বাল্ক-গ্রুপ) + সহায়িকা-চক্র + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট (seed/cleanup) সার্ভার-বন্ধ-অবস্থায় ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড) ④ TAG=Task231-UNDO জঞ্জাল-শূন্য
# গোটচা (এ-সুইটের-প্রথম-রানে-ধরা): eval-আউটপুট কোট-এস্কেপড (\"k\":v) → প্যাটার্নে k..: (দুই-ডট); eval-ত্রুটি = {} আউটপুট; undoN = JSON.parse().length (স্ট্রিং-দৈর্ঘ্য-নয়)
set -u
ROOT=/home/z/lekhok-forum/lekhok-forum
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
assert(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (প্রত্যাশা=$2 প্রাপ্ত=$3)"; fi; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
numof(){ echo "$1" | grep -o "$2..:[0-9-]*" | grep -o '[0-9-]*$'; }
J=/tmp/s231-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
# waitdesk — reload-রেস-প্রতিরোধ (গোটচা: eval রিলোড-নেভিগেশনের-সময় {} ফেরায় — এলিমেন্ট-ওয়েট + সেটল-বাধ্যতমূল)
waitdesk(){ agent-browser wait '.sc-card' >/dev/null 2>&1; sleep 0.7; }
# waitstate — reload-সচেতন-ওয়েট (PENDING-ফিল্টার-ভিউতে পুরোনো-পেজে টার্গেট-স্টেট মেলে-ই-না → রেস-নিরাপদ)
waitstate(){ agent-browser wait ".sc-card[data-status=\"$1\"]" >/dev/null 2>&1; sleep 0.5; }
# pollst — রিলোড-রেস-নিরাপদ পোল-রিট্রাই (১২×০.৫সে; প্যাটার্ন-মিললে-তাৎক্ষণিক)
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→seed→বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$APP" && node tests/s231-seed-undo.js seed) || { echo "FATAL: seed ব্যর্থ"; exit 1; }
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: CSRF-লগইন + ডেস্ক-কাঠামো ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "desk-200 + KPI-গ্রুপ" "$DESK" 'sc-kpis'
contains "স্পার্ক-fresh" "$DESK" 'data-spark="fresh"'
contains "স্পার্ক-res" "$DESK" 'data-spark="res"'
contains "স্পার্ক-stale" "$DESK" 'data-spark="stale"'
contains "স্পার্ক-avg" "$DESK" 'data-spark="avg"'
contains "ট্রেন্ড-প্যানেল" "$DESK" 'sc-trend'
contains "আন্ডু-JS (sc-undo)" "$DESK" "sc-undo"
contains "আন্ডু-JS (undoPop)" "$DESK" 'undoPop'
contains "সহায়িকা-Ctrl+Z-সারি" "$DESK" 'শেষ স্ট্যাটাস-বদল আন্ডু'
contains "বাল্ক-টুলবার" "$DESK" 'id="scBulk"'
contains "টোস্ট-undo-আইকন-CSS" "$DESK" '#scToast.undo::before'

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

echo "── ধাপ-৩: KPI-স্পার্ক (৭-বার/কার্ড + আজ-হাইলাইট) ──"
SPARK=$(ev "(function(){var o={};['fresh','res','stale','avg'].forEach(function(k){var el=document.querySelector('[data-spark='+k+']');o[k]=el?el.querySelectorAll('i').length:-1;});o.today=document.querySelectorAll('.k-spark i.today').length;return JSON.stringify(o);})()")
contains "স্পার্ক-fresh ৭-বার" "$SPARK" 'fresh..:7'
contains "স্পার্ক-res ৭-বার" "$SPARK" 'res..:7'
contains "স্পার্ক-stale ৭-বার" "$SPARK" 'stale..:7'
contains "স্পার্ক-avg ৭-বার" "$SPARK" 'avg..:7'
assert "আজ-হাইলাইট (৪-কার্ডে ৪-today)" "4" "$(numof "$SPARK" 'today')"

echo "── ধাপ-৪: আন্ডু-সিঙ্গেল (সংরক্ষণ→Ctrl+Z→পূর্বাবস্থা) ──"
ev "sessionStorage.removeItem('sc-undo');'CLEARED'" >/dev/null
R=$(ev "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});if(c.length<2)return 'NOTFOUND';var s=c[0].querySelector('[data-sc-status]');s.value='IN_PROGRESS';c[0].querySelector('[data-sc-save]').click();return 'CLICKED';})()")
contains "TAG-কার্ড-সংরক্ষণ-ক্লিক" "$R" 'CLICKED'
# ভিউ-ফিল্টার-সেমান্টিক্স: save→IN_PROGRESS-এ কার্ড PENDING-ভিউ-ছাড়ে (n:২→১) + স্ট্যাকে-১
ST=$(pollst "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});return JSON.stringify({n:c.length,undoN:(function(){try{return JSON.parse(sessionStorage.getItem('sc-undo')||'[]').length;}catch(e){return -1;}})()});})()" 'n..:1')
assert "সংরক্ষণ: ভিউ-ছাড় (n=১) + স্ট্যাকে-১" "1 1" "$(echo "$ST" | grep -o 'n..:[0-9]*\|undoN..:[0-9]*' | grep -o '[0-9]*$' | tr '\n' ' ' | sed 's/ $//')"
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,bubbles:true,cancelable:true}));'Z'" >/dev/null
ST2=$(pollst "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});return JSON.stringify({n:c.length,s1:c.length?c[0].getAttribute('data-status'):'-',undoN:(function(){try{return JSON.parse(sessionStorage.getItem('sc-undo')||'[]').length;}catch(e){return -1;}})()});})()" 'n..:2')
contains "Ctrl+Z-পর PENDING (পূর্বাবস্থা, ভিউ-ফেরত)" "$ST2" 's1..:..PENDING'
assert "আন্ডু-পর স্ট্যাক-খালি" "0" "$(numof "$ST2" 'undoN')"

echo "── ধাপ-৫: বাল্ক-গ্রুপ-আন্ডু (x-নির্বাচন×২→বাল্ক→Ctrl+Z=সমগ্র-ব্যাচ) ──"
RB=$(ev "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});c.forEach(function(x){x.querySelector('[data-sel]').click();});var b=document.getElementById('scBulk');return JSON.stringify({sel:c.length,hidden:b.hidden});})()")
assert "২-কার্ড-নির্বাচিত" "2" "$(numof "$RB" 'sel')"
contains "বাল্ক-টুলবার-দৃশ্যমান" "$RB" 'hidden..:false'
ev "(function(){document.querySelector('[data-bulk-st=IN_PROGRESS]').click();return 'BULK';})()" >/dev/null
# bulk→দু-কার্ড-ই PENDING-ভিউ-ছাড়ে (n:০) + গ্রুপ-এন্ট্রি স্ট্যাকে-১
ST3=$(pollst "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});return JSON.stringify({n:c.length,undoN:(function(){try{return JSON.parse(sessionStorage.getItem('sc-undo')||'[]').length;}catch(e){return -1;}})()});})()" 'n..:0')
assert "বাল্ক: ভিউ-ছাড় (n=০) + গ্রুপ-স্ট্যাকে-১" "0 1" "$(echo "$ST3" | grep -o 'n..:[0-9]*\|undoN..:[0-9]*' | grep -o '[0-9]*$' | tr '\n' ' ' | sed 's/ $//')"
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,bubbles:true,cancelable:true}));'Z'" >/dev/null
ST4=$(pollst "(function(){var c=[].slice.call(document.querySelectorAll('.sc-card')).filter(function(x){return x.textContent.indexOf('Task231-UNDO')>=0;});return JSON.stringify({n:c.length,s1:c.length?c[0].getAttribute('data-status'):'-',s2:c.length>1?c[1].getAttribute('data-status'):'-',undoN:(function(){try{return JSON.parse(sessionStorage.getItem('sc-undo')||'[]').length;}catch(e){return -1;}})()});})()" 'n..:2')
contains "গ্রুপ-আন্ডু: কার্ড-১ PENDING (ভিউ-ফেরত)" "$ST4" 's1..:..PENDING'
contains "গ্রুপ-আন্ডু: কার্ড-২ PENDING (ভিউ-ফেরত)" "$ST4" 's2..:..PENDING'
assert "গ্রুপ-আন্ডু-পর স্ট্যাক-খালি" "0" "$(numof "$ST4" 'undoN')"

echo "── ধাপ-৬: সহায়িকা-চক্র (? খোলা → Ctrl+Z-সারি → Esc বন্ধ) ──"
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'?',code:'Slash',shiftKey:true,bubbles:true,cancelable:true}));'Q'" >/dev/null
sleep 0.5
HP=$(ev "(function(){var h=document.getElementById('scHelp');var row=false;[].slice.call(h.querySelectorAll('.sc-help-row')).forEach(function(r){if(r.textContent.indexOf('Ctrl')>=0&&r.textContent.indexOf('Z')>=0)row=true;});return JSON.stringify({cz:row,open:h.classList.contains('open')});})()")
contains "সহায়িকা-খোলা + Ctrl+Z-সারি" "$HP" 'cz..:true'
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));'ESC'" >/dev/null
sleep 0.4
HC=$(ev "(function(){return JSON.stringify({open:document.getElementById('scHelp').classList.contains('open')});})()")
contains "Esc-বন্ধ" "$HC" 'open..:false'

echo "── ধাপ-৭: 390px + স্ক্রিনশট + কনসোল ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 0.5
agent-browser screenshot "$APP/download/s231-desk-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 0.6
HW=$(ev "(function(){return JSON.stringify({h:document.documentElement.scrollWidth,w:window.innerWidth});})()")
H=$(numof "$HW" 'h'); W=$(numof "$HW" 'w')
if [ -n "$H" ] && [ -n "$W" ] && [ "$H" -le "$W" ]; then ok "390px অনুভূমিক-ওভারফ্লো-শূন্য ($H<=$W)"; else bad "390px ওভারফ্লো — $HW"; fi
agent-browser screenshot "$APP/download/s231-desk-390.png" >/dev/null 2>&1
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
echo "s231-desk-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] || exit 1
