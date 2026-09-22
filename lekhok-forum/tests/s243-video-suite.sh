#!/bin/bash
# s243-video-suite.sh — session243 মিডিয়া-চিপ-সম্পূর্ণতা সুইট (স্থায়ী — রিপো-কমিটেড; s241-স্টাইল সিড-ভিত্তিক নিখুত-গণনা)
# কভারেজ: ① কাঠামো (VIDEO-চিপ + sc-mchip/data-mh/sc-mcount/aria-current/আইকন + CSS/JS-টোকেন + সহায়িকা-সারি)
#          ② রেন্ডার-প্রমাণ (q=TAG → ব্যাজ {লেখা ২, ছবি ১, ভয়েস ১, ভিডিও ২}; aria-current; href-ফিল্টার-সংরক্ষণ; /data mediaCounts)
#          ③ আচরণ (চিপ→সেগমেন্ট seg-hot, সেগমেন্ট→চিপ chip-hot, focusin/focusout, তাৎক্ষণিক-ক্লাস)
#          ④ খালি-অবস্থা (cleanup-পরে q=TAG → ব্যাজ-শূন্য ×৪) + কনসোল + 390px + স্ক্রিনশট ×২
# চুক্তি: ① সার্ভার-বন্ধে-seed ② CSRF-লগইন admin/admin123 ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল)
#         ④ বাংলা-অঙ্ক-যাচাই JS-textContent (grep-range-নিষিদ্ধ-রীতি) ⑤ s241-স্ট্যাটিক-স্ট্রিপ-অক্ষুণ্ণ (data-mh-attr-যোগ-মাত্র)
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s243-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
TAG='Task243-VIDEO'

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধে-seed → বুট → লগইন) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/tests/s243-seed-video.js" seed 2>&1)
if echo "$SD" | grep -q "SEED-COUNT=6"; then ok "সিড ×৬ (TEXT×2+IMAGE+AUDIO+VIDEO×2)"; else bad "সিড-ব্যর্থ: $SD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (HTML-উৎস) ──"
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "VIDEO-চিপ উপস্থিত (P2-গ্যাপ-ফিক্স)" "$DESK" "data-mh=\"VIDEO\""
contains "media=VIDEO- href (রেন্ডারড)" "$DESK" 'support-center.media=VIDEO"'
contains "ভিডিও-লেবেল" "$DESK" '>ভিডিও <b class="sc-mcount">'
MCHIPN=$(echo "$DESK" | grep -o 'class="sc-chip sc-mchip' | wc -l)
if [ "$MCHIPN" = "4" ]; then ok "sc-mchip ×৪"; else bad "sc-mchip-গণনা (প্রত্যাশা ৪, পাওয়া $MCHIPN)"; fi
MCOUNTN=$(echo "$DESK" | grep -o 'sc-mcount">' | wc -l)
if [ "$MCOUNTN" = "4" ]; then ok "গণনা-ব্যাজ ×৪"; else bad "ব্যাজ-গণনা (প্রত্যাশা ৪, পাওয়া $MCOUNTN)"; fi
for IC in fa-font fa-image fa-microphone fa-video; do
  contains "আইকন $IC" "$DESK" "$IC"
done
ARN=$(echo "$DESK" | grep -o 'data-mh="[A-Z]*" aria-current=' | wc -l)
if [ "$ARN" = "4" ]; then ok "মিডিয়া-চিপ aria-current ×৪"; else bad "aria-current-গণনা (প্রত্যাশা ৪, পাওয়া $ARN)"; fi
SARN=$(grep -c 'aria-current="<%= status === ' "$APP/admin/views/admin/support-center.ejs" 2>/dev/null || true)
SARN2=$(grep -c 'aria-current="<%= !status ' "$APP/admin/views/admin/support-center.ejs" 2>/dev/null || true)
if [ "$((SARN + SARN2))" = "4" ]; then ok "status-চিপ aria-current ×৪ (সোর্স-ফাইল-অ্যাসার্ট)"; else bad "status-aria-গণনা (প্রত্যাশা ৪, পাওয়া $((SARN + SARN2)))"; fi
contains "CSS ব্যাজ (.sc-mcount{)" "$DESK" '.sc-mcount{display:inline-block'
contains "CSS ব্যাজ-সক্রিয় (accent-ভরাট)" "$DESK" '.sc-chip.active .sc-mcount{background:var(--ad-accent)'
contains "CSS 640px-সংকোচন (ব্যাজ)" "$DESK" '@media (max-width:640px){.sc-mcount{'
contains "CSS সেগমেন্ট-হোভার" "$DESK" ']:hover{filter:brightness'
contains "CSS seg-hot" "$DESK" '.sc-mb.seg-hot{filter:brightness'
contains "CSS chip-hot" "$DESK" '.sc-chip.chip-hot{border-color'
contains "JS ক্রস-হাইলাইট-বাইন্ড (sc-mchip[data-mh])" "$DESK" 'sc-mchip\[data-mh'
contains "JS mouseenter+focusin+focus (bindPair)" "$DESK" "el.addEventListener('focus'"
contains "সহায়িকা-সারি (ক্রস-হাইলাইট)" "$DESK" 'মিডিয়া-চিপে হোভার/ফোকাস'
SEGDN=$(echo "$DESK" | grep -o 'sc-mb m-[a-z]*" data-mh="[A-Z]*"' | wc -l)
if [ "$SEGDN" = "4" ]; then ok "স্ট্রিপ-সেগমেন্ট data-mh ×৪ (s241-অক্ষুণ্ণ)"; else bad "সেগমেন্ট-data-mh-গণনা (প্রত্যাশা ৪, পাওয়া $SEGDN)"; fi

echo "── ধাপ-২: রেন্ডার-প্রমাণ (q=TAG → নিখুত-ব্যাজ {২,১,১,২}) ──"
DQ=$(curl -s -b "$J" "$BASE/admin/support-center?q=$TAG")
contains "q=TAG-ডেস্ক রেন্ডার" "$DQ" 'sc-mcount'
DV=$(curl -s -b "$J" "$BASE/admin/support-center/data?q=$TAG")
contains "/data mediaCounts TEXT=২" "$DV" '"TEXT":2'
contains "/data mediaCounts IMAGE=১" "$DV" '"IMAGE":1'
contains "/data mediaCounts AUDIO=১" "$DV" '"AUDIO":1'
contains "/data mediaCounts VIDEO=২" "$DV" '"VIDEO":2'
DM=$(curl -s -b "$J" "$BASE/admin/support-center?status=PENDING&range=7d")
contains "href-ফিল্টার-সংরক্ষণ (status+range+media)" "$DM" 'status=PENDING&amp;range=7d&amp;media=TEXT'
contains "VIDEO-চিপেও ফিল্টার-সংরক্ষণ" "$DM" 'status=PENDING&amp;range=7d&amp;media=VIDEO'
DP=$(curl -s -b "$J" "$BASE/admin/support-center?media=VIDEO")
contains "media=VIDEO-সক্রিয়-শ্রেণি" "$DP" 'data-mh="VIDEO" aria-current="true"'
contains "media=VIDEO-অন্য-চিপ-অসক্রিয়" "$DP" 'data-mh="TEXT" aria-current="false"'

echo "── ধাপ-৩: আচরণ (ব্রাউজার — q=TAG) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
for i in 1 2 3; do
  U=$(agent-browser get url 2>/dev/null || echo '')
  echo "$U" | grep -q '/admin/login' && break
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
done
agent-browser fill '#username' admin >/dev/null 2>&1
agent-browser fill '#password' admin123 >/dev/null 2>&1
agent-browser click 'button[type=submit]' >/dev/null 2>&1
sleep 1.5
agent-browser open "$BASE/admin/support-center?q=$TAG" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null && ok "ডেস্ক-লোড (মিডিয়া-চিপ উপস্থিত)" || bad "ডেস্ক-লোড"
installErrs
BG=$(ev "(function(){ var g=function(mh){ var c=document.querySelector('.sc-mchip[data-mh=\"'+mh+'\"] .sc-mcount'); return c?c.textContent:''; }; return JSON.stringify({ t:g('TEXT'), i:g('IMAGE'), a:g('AUDIO'), v:g('VIDEO') }); })()" 2>/dev/null)
contains "ব্যাজ-লেখা=২" "$BG" 't..:..২'
contains "ব্যাজ-ছবি=১" "$BG" 'i..:..১'
contains "ব্যাজ-ভয়েস=১" "$BG" 'a..:..১'
contains "ব্যাজ-ভিডিও=২" "$BG" 'v..:..২'
X1=$(ev "(function(){ var ch=document.querySelector('.sc-mchip[data-mh=\"TEXT\"]'); var sg=document.querySelector('.sc-mb[data-mh=\"TEXT\"]'); if(!ch||!sg) return 'missing'; ch.dispatchEvent(new MouseEvent('mouseenter',{bubbles:false})); var on=sg.classList.contains('seg-hot'); ch.dispatchEvent(new MouseEvent('mouseleave',{bubbles:false})); var off=!sg.classList.contains('seg-hot'); return JSON.stringify({ on:on, off:off }); })()" 2>/dev/null)
contains "চিপ-হোভার → সেগমেন্ট seg-hot" "$X1" 'on..:true'
contains "হোভার-বাদ → সেগমেন্ট-স্বাভাবিক" "$X1" 'off..:true'
X2=$(ev "(function(){ var ch=document.querySelector('.sc-mchip[data-mh=\"IMAGE\"]'); var sg=document.querySelector('.sc-mb[data-mh=\"IMAGE\"]'); if(!ch||!sg) return 'missing'; ch.dispatchEvent(new Event('focusin',{bubbles:true})); var on=sg.classList.contains('seg-hot'); ch.dispatchEvent(new Event('focusout',{bubbles:true})); var off=!sg.classList.contains('seg-hot'); return JSON.stringify({ on:on, off:off }); })()" 2>/dev/null)
contains "চিপ-ফোকাসিন(সিনথেটিক) → সেগমেন্ট seg-hot" "$X2" 'on..:true'
contains "ফোকাস-বাদ → সেগমেন্ট-স্বাভাবিক" "$X2" 'off..:true'
X4=$(ev "(function(){ var ch=document.querySelector('.sc-mchip[data-mh=\"VIDEO\"]'); var sg=document.querySelector('.sc-mb[data-mh=\"VIDEO\"]'); if(!ch||!sg) return 'missing'; ch.focus(); var ae=document.activeElement===ch; ch.blur(); return JSON.stringify({ aeMoved:ae }); })()" 2>/dev/null)
contains "রিয়েল focus()-এ চিপ focusable" "$X4" 'aeMoved..:true'
X3=$(ev "(function(){ var sg=document.querySelector('.sc-mb[data-mh=\"AUDIO\"]'); var ch=document.querySelector('.sc-mchip[data-mh=\"AUDIO\"]'); if(!ch||!sg) return 'missing'; sg.dispatchEvent(new MouseEvent('mouseenter',{bubbles:false})); var on=ch.classList.contains('chip-hot'); sg.dispatchEvent(new MouseEvent('mouseleave',{bubbles:false})); var off=!ch.classList.contains('chip-hot'); return JSON.stringify({ on:on, off:off }); })()" 2>/dev/null)
contains "সেগমেন্ট-হোভার → চিপ chip-hot" "$X3" 'on..:true'
contains "হোভার-বাদ → চিপ-স্বাভাবিক" "$X3" 'off..:true'
MB=$(ev "(function(){ var el=document.querySelector('.sc-mediabar-track'); return JSON.stringify({ total:el?+el.getAttribute('data-mtotal'):-1, dmh:!!document.querySelector('.sc-mb[data-mh=\"VIDEO\"]') }); })()" 2>/dev/null)
contains "স্ট্রিপ-মোট=৬ (q=TAG-সিড)" "$MB" 'total..:6'
sleep 1
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'
agent-browser screenshot "$APP/download/s243-video-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=''; for i in 1 2 3; do
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s243-video-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৪: খালি-অবস্থা (cleanup → q=TAG → ব্যাজ-শূন্য ×৪) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
CD=$(node "$APP/tests/s243-seed-video.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: পুনঃবুট ব্যর্থ"; exit 1; }
agent-browser open "$BASE/admin/support-center?q=$TAG" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
installErrs
EZ=$(ev "(function(){ var g=function(mh){ var c=document.querySelector('.sc-mchip[data-mh=\"'+mh+'\"] .sc-mcount'); return c?c.textContent:''; }; return JSON.stringify({ t:g('TEXT'), i:g('IMAGE'), a:g('AUDIO'), v:g('VIDEO') }); })()" 2>/dev/null)
contains "খালি-ব্যাজ-লেখা=০" "$EZ" 't..:..০'
contains "খালি-ব্যাজ-ছবি=০" "$EZ" 'i..:..০'
contains "খালি-ব্যাজ-ভয়েস=০" "$EZ" 'a..:..০'
contains "খালি-ব্যাজ-ভিডিও=০" "$EZ" 'v..:..০'
CONS2=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য (খালি-অবস্থা)" "$CONS2" 'errs..:0'

echo "── ধাপ-শেষ: চূড়ান্ত-পরিষ্কার + pkill ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J"
echo ""
echo "s243-video-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
