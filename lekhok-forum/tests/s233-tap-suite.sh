#!/bin/bash
# s233-tap-suite.sh — session233 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s232/s231-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: টাচ-ট্যাপ টুলটিপ (বারে ট্যাপ → টুলটিপ+সপ্তাহ-ওভারভিউ চিপ; বাইরে ট্যাপে লুকায়; KPI-লিংকের-ভিতরে
#          স্পার্ক-বার-ট্যাপে নেভিগেশন-বন্ধ) + #scSparkTipWk সপ্তাহ-ওভারভিউ চিপ (data-wk EJS-এক-উৎস ×৬;
#          #scSparkTip-textContent-চুক্তি-অক্ষুণ্ণ — s232-T2-সামঞ্জস্য) + সহায়িকা-ট্যাপ-সারি + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
# গোটচা-সম্মতি (PLANS session231/232-নোট): eval-IIFE })()-ইনভোকেড · কোট-এস্কেপ-দ্বি-স্তর (k..: + ..ভ্যালু) ·
#         ক্লিক-পরবর্তী-ট্রেলিং-mouseout → MutationObserver-ক্যাপচার + সিনথেটিক-ক্লিকে স্থায়িত্ব-প্রমাণ ·
#         grep-BRE-ব্র্যাকেট-এস্কেপ (\[data-on="1"\]) · ক্ষণস্থায়ী-টোস্ট-অ্যাসার্ট-বর্জন
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
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s233-jar.txt
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
contains "ওভারভিউ-চিপ-এলিমেন্ট" "$DESK" 'id="scSparkTipWk"'
WK=$(echo "$DESK" | grep -o 'data-wk="' | wc -l | tr -d ' ')
assert "data-wk-হুক ৬-হোস্ট (৪-স্পার্ক+২-ট্রেন্ড)" "6" "$WK"
contains "চিপ-CSS (data-on)" "$DESK" '#scSparkTipWk\[data-on="1"\]'
contains "টাচ-সংকেত-CSS (hover:none)" "$DESK" '(hover:none)'
contains "টাচ-হিট-এরিয়া-বর্ধন-CSS" "$DESK" 'top:-6px'
contains "ট্রেন্ড-রো-ওভারভিউ (মোট+গড়)" "$DESK" 'data-wk="সপ্তাহে মোট'
contains "সহায়িকা-ট্যাপ-সারি" "$DESK" 'সপ্তাহ-ওভারভিউসহ টুলটিপ'
contains "রিগ্রেশন: টুলটিপ-এলিমেন্ট" "$DESK" 'id="scSparkTip"'
contains "রিগ্রেশন: স্পার্ক-ইউনিট-হুক (avg=ঘ)" "$DESK" 'data-unit="ঘ"'
contains "রিগ্রেশন: কমপ্যাক্ট-বাটন" "$DESK" 'id="scCompactBtn"'

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

echo "── ধাপ-৩: টাচ-ট্যাপ + সপ্তাহ-ওভারভিউ চিপ ──"
# রিয়েল-ক্লিক + MutationObserver-ক্যাপচার (ক্লিক-পরবর্তী-ট্রেলিং-mouseout-গোটচা-নিরাপদ — টেক্সট-রক্ষা)
ev "(function(){var t=document.getElementById('scSparkTip'),w=document.getElementById('scSparkTipWk');window.__tipSeen=false;window.__wkSeen=false;new MutationObserver(function(){if(t.getAttribute('data-on')==='1')window.__tipSeen=t.textContent;}).observe(t,{attributes:true,attributeFilter:['data-on']});new MutationObserver(function(){if(w.getAttribute('data-on')==='1')window.__wkSeen=w.textContent;}).observe(w,{attributes:true,attributeFilter:['data-on']});return 'OBS';})()" >/dev/null
agent-browser click '.k-spark[data-spark="fresh"] i.today' >/dev/null 2>&1
W1=$(pollst "(function(){return JSON.stringify({wk:!!window.__wkSeen,tip:!!window.__tipSeen});})()" 'wk..:true')
contains "রিয়েল-ক্লিক→ওভারভিউ-চিপ (observer-নিরাপদ)" "$W1" 'wk..:true'
contains "রিয়েল-ক্লিক→দিন-টুলটিপ-সহ" "$W1" 'tip..:true'
W2=$(ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"fresh\"] i.today');var h=b.closest('[data-wk]');return JSON.stringify({wksame:window.__wkSeen===h.getAttribute('data-wk'),tipsame:window.__tipSeen===b.getAttribute('data-d')+' — '+b.getAttribute('data-v')+' টি'});})()")
contains "চিপ-টেক্সট-হোস্ট-data-wk-মিল" "$W2" 'wksame..:true'
contains "রিগ্রেশন: টুলটিপ-line১-চুক্তি-অক্ষুণ্ণ" "$W2" 'tipsame..:true'
URL1=$(agent-browser get url 2>/dev/null || echo '')
if echo "$URL1" | grep -q '/admin/support-center?status=PENDING$'; then ok "স্পার্ক-ট্যাপে নেভিগেশন-বন্ধ (KPI-লিংক)"; else bad "স্পার্ক-ট্যাপে নেভিগেট — $URL1"; fi
# রিয়েল-ক্লিক ট্রেন্ড-বারে (আজ-বার ২০px — নেভিগেশন-ঝুঁকি-শূন্য হোস্ট)
agent-browser click '.sc-trend-bars span.today' >/dev/null 2>&1
W1b=$(pollst "(function(){var w=document.getElementById('scSparkTipWk');return JSON.stringify({on:w.getAttribute('data-on'),txt:w.textContent});})()" 'on..:..1')
contains "রিয়েল-ক্লিক-ট্রেন্ড→চিপ" "$W1b" 'on..:..1'
contains "ট্রেন্ড-চিপ-সপ্তাহ-লেবেল" "$W1b" 'সপ্তাহে মোট'
# সিনথেটিক-ক্লিকে স্থায়িত্ব-প্রমাণ (pointer-move-শূন্য → data-on সরাসরি-পড়া-যায়)
W3=$(ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"fresh\"] i:nth-child(3)');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));var t=document.getElementById('scSparkTip'),w=document.getElementById('scSparkTipWk');return JSON.stringify({ton:t.getAttribute('data-on'),won:w.getAttribute('data-on')});})()")
contains "সিনথেটিক-ক্লিক→টুলটিপ-স্থায়ী" "$W3" 'ton..:..1'
contains "সিনথেটিক-ক্লিক→চিপ-স্থায়ী" "$W3" 'won..:..1'
W4=$(ev "(function(){document.querySelector('.admin-header h1').dispatchEvent(new MouseEvent('click',{bubbles:true}));var t=document.getElementById('scSparkTip'),w=document.getElementById('scSparkTipWk');return JSON.stringify({ton:t.getAttribute('data-on'),won:w.getAttribute('data-on')});})()")
contains "বাইরে-ক্লিক→টুলটিপ-লুকায়" "$W4" 'ton..:null'
contains "বাইরে-ক্লিক→চিপ-লুকায়" "$W4" 'won..:null'
# ট্রেন্ড-বার ট্যাপ (লিংক-বহির্ভূত — নেভিগেশন-ঝুঁকি-শূন্য)
W5=$(ev "(function(){var b=document.querySelector('.sc-trend-bars span:nth-child(3)');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));var w=document.getElementById('scSparkTipWk');return JSON.stringify({won:w.getAttribute('data-on'),txt:w.textContent});})()")
contains "ট্রেন্ড-বার-ট্যাপ→চিপ" "$W5" 'won..:..1'
contains "ট্রেন্ড-চিপ-সপ্তাহ-লেবেল" "$W5" 'সপ্তাহে মোট'
# কীবোর্ড-ফোকাস-পথেও চিপ (avg-কার্ড → ৭-দিন-গড়-লেবেল)
W6=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').focus();var t=document.getElementById('scSparkTip'),w=document.getElementById('scSparkTipWk');return JSON.stringify({won:w.getAttribute('data-on'),txt:w.textContent,unit:t.textContent});})()")
contains "KPI-ফোকাস→চিপ-দৃশ্যমান" "$W6" 'won..:..1'
contains "avg-চিপ-৭-দিন-গড়-লেবেল" "$W6" '৭-দিন গড়'
contains "ফোকাস-টুলটিপ-ইউনিট (ঘ)" "$W6" 'ঘ'
W7=$(ev "(function(){document.querySelector('.sc-kpi.k-avg').blur();var w=document.getElementById('scSparkTipWk');return JSON.stringify({won:w.getAttribute('data-on')});})()")
contains "ব্লার→চিপ-লুকায়" "$W7" 'won..:null'

echo "── ধাপ-৪: স্ক্রিনশট + 390px + কনসোল ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 0.5
ev "(function(){var b=document.querySelector('.sc-trend-bars span:nth-child(5)');b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'TIP';})()" >/dev/null
sleep 0.5
agent-browser screenshot "$APP/download/s233-wk-chip.png" >/dev/null 2>&1
ev "(function(){document.getElementById('scSparkTip').removeAttribute('data-on');document.getElementById('scSparkTipWk').removeAttribute('data-on');return 'HIDE';})()" >/dev/null
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 0.6
HW=$(ev "(function(){return JSON.stringify({h:document.documentElement.scrollWidth,w:window.innerWidth});})()")
H=$(numof "$HW" 'h'); W=$(numof "$HW" 'w')
if [ -n "$H" ] && [ -n "$W" ] && [ "$H" -le "$W" ]; then ok "390px অনুভূমিক-ওভারফ্লো-শূন্য ($H<=$W)"; else bad "390px ওভারফ্লো — $HW"; fi
ev "(function(){var b=document.querySelector('.k-spark[data-spark=\"res\"] i:nth-child(5)');b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'TIP';})()" >/dev/null
sleep 0.4
agent-browser screenshot "$APP/download/s233-mobile-390.png" >/dev/null 2>&1
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
echo "s233-tap-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] || exit 1
