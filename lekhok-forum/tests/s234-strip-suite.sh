#!/bin/bash
# s234-strip-suite.sh — session234 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s233/s232-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: #scSparkTipWk-এ ৭-দিন-মিনি-বার-স্ট্রিপ (data-bars EJS-এক-উৎস ×৬-হোস্ট; DOM-API-নির্মাণ —
#          innerHTML-নিষিদ্ধ-রীতি; label-span-textContent = data-wk-হুবহু — s233-সমতা-রক্ষা; আজ-বার today-ক্লাস)
#          + স্ট্রিপ-সহ রিয়েল-ক্লিক/ফোকাস-পথ + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
# গোটচা-সম্মতি (PLANS session231/232/233-নোট): eval-IIFE })()-ইনভোকেড · কোট-এস্কেপ-দ্বি-স্তর (k..: + ..ভ্যালু) ·
#         রিয়েল-ক্লিকে তল-বার (i.today/span.today) · MutationObserver-ক্যাপচার + সিনথেটিক-স্থায়িত্ব ·
#         grep-BRE-ব্র্যাকেট-এস্কেপ
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
assert(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (প্রত্যাশা=$2 প্রাপ্ত=$3)"; fi; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
numof(){ echo "$1" | grep -o "$2..:[0-9-]*" | grep -o '[0-9-]*$'; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s234-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
waitdesk(){ agent-browser wait '.sc-card' >/dev/null 2>&1; sleep 0.7; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ→seed→বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$APP" && node tests/s231-seed-undo.js seed) || { echo "FATAL: seed ব্যর্থ"; exit 1; }
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
BA=$(echo "$DESK" | grep -o 'data-bars="' | wc -l | tr -d ' ')
assert "data-bars-হুক ৬-হোস্ট (৪-স্পার্ক+২-ট্রেন্ড)" "6" "$BA"
contains "data-bars-CSV-ফরম্যাট (অঙ্ক-শুরু)" "$DESK" 'data-bars="[0-9]'
contains "স্ট্রিপ-CSS (.sc-tip-strip)" "$DESK" '\.sc-tip-strip{'
contains "আজ-বার-CSS (i.today)" "$DESK" '\.sc-tip-strip i\.today'
contains "লেবেল-স্প্যান-CSS (wklbl)" "$DESK" '\.sc-tip-wklbl'
WK=$(echo "$DESK" | grep -o 'data-wk="' | wc -l | tr -d ' ')
assert "রিগ্রেশন: data-wk ৬-হোস্ট অক্ষুণ্ণ" "6" "$WK"
contains "রিগ্রেশন: চিপ-এলিমেন্ট" "$DESK" 'id="scSparkTipWk"'
contains "রিগ্রেশন: 640px-স্ট্রিপ-সংকোচন" "$DESK" '\.sc-tip-strip{height:10px'

echo "── ধাপ-২: ব্রাউজার-সেশন (রোবাস্ট-লগইন retry-চুক্তি) ──"
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
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

echo "── ধাপ-৩: মিনি-বার-স্ট্রিপ (রিয়েল-ক্লিক + স্ট্রিপ-গঠন) ──"
ev "(function(){var w=document.getElementById('scSparkTipWk');window.__wkSeen=false;new MutationObserver(function(){if(w.getAttribute('data-on')==='1')window.__wkSeen=w.textContent;}).observe(w,{attributes:true,attributeFilter:['data-on']});return 'OBS';})()" >/dev/null
agent-browser click '.k-spark[data-spark="fresh"] i.today' >/dev/null 2>&1
S1=$(pollst "(function(){return JSON.stringify({wk:!!window.__wkSeen});})()" 'wk..:true')
contains "রিয়েল-ক্লিক→চিপ+স্ট্রিপ (observer-নিরাপদ)" "$S1" 'wk..:true'
S2=$(ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"fresh\"] i.today');var h=b.closest('[data-wk]');var w=document.getElementById('scSparkTipWk');var s=w.querySelector('.sc-tip-strip');var l=w.querySelector('.sc-tip-wklbl');var hok=true;if(s){[].slice.call(s.children).forEach(function(c){var px=parseInt(c.style.height,10);if(!(px>=2&&px<=10))hok=false;});}return JSON.stringify({wksame:window.__wkSeen===h.getAttribute('data-wk'),lbl:l?l.textContent===h.getAttribute('data-wk'):false,n:s?s.children.length:0,today:s&&s.children[6]?s.children[6].className==='today':false,hok:hok});})()")
contains "লেবেল-টেক্সট-data-wk-হুবহু (s233-সমতা)" "$S2" 'wksame..:true'
contains "লেবেল-স্প্যান-textContent-মিল" "$S2" 'lbl..:true'
contains "স্ট্রিপ ৭-বার" "$S2" 'n..:7'
contains "আজ-বার today-ক্লাস" "$S2" 'today..:true'
contains "বার-উচ্চতা ২-১০px-সীমায়" "$S2" 'hok..:true'
URL1=$(agent-browser get url 2>/dev/null || echo '')
if echo "$URL1" | grep -q '/admin/support-center?status=PENDING$'; then ok "স্পার্ক-ট্যাপে নেভিগেশন-বন্ধ (রিগ্রেশন)"; else bad "স্পার্ক-ট্যাপে নেভিগেট — $URL1"; fi
agent-browser click '.sc-trend-bars span.today' >/dev/null 2>&1
S3=$(pollst "(function(){var w=document.getElementById('scSparkTipWk');var s=w.querySelector('.sc-tip-strip');return JSON.stringify({on:w.getAttribute('data-on'),n:s?s.children.length:0});})()" 'on..:..1')
contains "রিয়েল-ক্লিক-ট্রেন্ড→স্ট্রিপ-সহ-চিপ" "$S3" 'on..:..1'
contains "ট্রেন্ড-স্ট্রিপ ৭-বার" "$S3" 'n..:7'
S4=$(ev "(function(){document.querySelector('.admin-header h1').dispatchEvent(new MouseEvent('click',{bubbles:true}));var w=document.getElementById('scSparkTipWk');return JSON.stringify({won:w.getAttribute('data-on')});})()")
contains "বাইরে-ক্লিক→চিপ-লুকায় (রিগ্রেশন)" "$S4" 'won..:null'
S5=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').focus();var w=document.getElementById('scSparkTipWk');var s=w.querySelector('.sc-tip-strip');return JSON.stringify({won:w.getAttribute('data-on'),n:s?s.children.length:0});})()")
contains "KPI-ফোকাস→স্ট্রিপ-সহ-চিপ" "$S5" 'won..:..1'
contains "avg-স্ট্রিপ ৭-বার" "$S5" 'n..:7'
S6=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').blur();var w=document.getElementById('scSparkTipWk');return JSON.stringify({won:w.getAttribute('data-on')});})()")
contains "ব্লার→চিপ-লুকায় (রিগ্রেশন)" "$S6" 'won..:null'
# প্রান্ত-ক্ল্যাম্প: ডান-প্রান্তের-আজ-বারে স্ট্রিপ-সহ-প্রশস্ত-চিপও ভিউপোর্টের-ভিতরে (s234-স্ক্রিনশটে-ধরা-বাগ-প্রতিগার্ড)
agent-browser click '.sc-trend-bars span.today' >/dev/null 2>&1
S7=$(pollst "(function(){var w=document.getElementById('scSparkTipWk');var rr=w.getBoundingClientRect();return JSON.stringify({on:w.getAttribute('data-on'),rOK:rr.right<=window.innerWidth+1,lOK:rr.left>=-1});})()" 'on..:..1')
contains "প্রান্ত-ক্ল্যাম্প→চিপ-ভিউপোর্টের-ভিতরে" "$S7" 'rOK..:true'
contains "বাম-প্রান্ত-অক্ষুণ্ণ" "$S7" 'lOK..:true'
ev "(function(){document.getElementById('scSparkTipWk').removeAttribute('data-on');return 'HIDE';})()" >/dev/null

echo "── ধাপ-৪: স্ক্রিনশট + 390px + কনসোল ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 0.5
ev "(function(){var b=document.querySelector('.sc-trend-bars span.today');b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'TIP';})()" >/dev/null
sleep 0.5
agent-browser screenshot "$APP/download/s234-strip.png" >/dev/null 2>&1
ev "(function(){document.getElementById('scSparkTip').removeAttribute('data-on');document.getElementById('scSparkTipWk').removeAttribute('data-on');return 'HIDE';})()" >/dev/null
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 0.6
HW=$(ev "(function(){return JSON.stringify({h:document.documentElement.scrollWidth,w:window.innerWidth});})()")
H=$(numof "$HW" 'h'); W=$(numof "$HW" 'w')
if [ -n "$H" ] && [ -n "$W" ] && [ "$H" -le "$W" ]; then ok "390px অনুভূমিক-ওভারফ্লো-শূন্য ($H<=$W)"; else bad "390px ওভারফ্লো — $HW"; fi
ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"res\"] i.today');b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'TIP';})()" >/dev/null
sleep 0.4
agent-browser screenshot "$APP/download/s234-mobile-390.png" >/dev/null 2>&1
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
echo "s234-strip-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] || exit 1
