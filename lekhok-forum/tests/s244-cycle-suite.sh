#!/bin/bash
# s244-cycle-suite.sh — session244 কীবোর্ড-নেভিগেশন সুইট (স্থায়ী — রিপো-কমিটেড; s243-সিড-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (mediaCycle/firstPendingJump + keydown m/u-ব্রাঞ্চ + সহায়িকা-সারি ×২ + sc-mb-cur CSS + QA-হুক ×২)
#          ② রেন্ডার-প্রমাণ (media=TEXT/VIDEO → সেগমেন্ট sc-mb-cur ×১; ফিল্টার-শূন্যে cur-শূন্য + s243-প্যাটার্ন-সুরক্ষা)
#          ③ আচরণ (m-সাইকেল ×৫-ধাপ রিয়েল-নেভিগেশন + ফিল্টার-সংরক্ষণ + u-জাম্প কার্সর + u-খালি-টোস্ট)
# চুক্তি: ① সিড = s243-seed-video.js পুনঃব্যবহার (TAG Task243-VIDEO ×৬ PENDING; সার্ভার-বন্ধে-seed) ② CSRF-লগইন admin/admin123
#         ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল) ④ keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s244-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
TAG='Task243-VIDEO'

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধে-seed → বুট → লগইন) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/tests/s243-seed-video.js" seed 2>&1)
if echo "$SD" | grep -q "SEED-COUNT=6"; then ok "সিড ×৬ (s243-seed পুনঃব্যবহার — সব PENDING)"; else bad "সিড-ব্যর্থ: $SD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (সোর্স-ফাইল) ──"
SRC=$(cat "$APP/admin/views/admin/support-center.ejs")
contains "mediaCycle ফাংশন" "$SRC" 'function mediaCycle()'
contains "firstPendingJump ফাংশন" "$SRC" 'function firstPendingJump()'
contains "keydown m-ব্রাঞ্চ" "$SRC" "e.key === 'm' || e.key === 'M'"
contains "keydown u-ব্রাঞ্চ" "$SRC" "e.key === 'u' || e.key === 'U'"
contains "সহায়িকা-সারি m" "$SRC" 'মাধ্যম-ফিল্টার সাইকেল — সব→লেখা→ছবি→ভয়েস→ভিডিও→সব'
contains "সহায়িকা-সারি u" "$SRC" 'প্রথম-নতুন (অমীমাংসিত)-কার্ডে কার্সর-জাম্প'
contains "CSS সেগমেন্ট-একো (.sc-mb.sc-mb-cur{)" "$SRC" '.sc-mb.sc-mb-cur{box-shadow:inset'
contains "QA-হুক mediaCycle" "$SRC" '__scQA.mediaCycle'
contains "QA-হুক uJump" "$SRC" '__scQA.uJump'
MORDER=$(echo "$SRC" | grep -c 'var order = ')
if [ "$MORDER" = "2" ]; then ok "সাইকেল-অর্ডার-এক-উৎস ×২ (fn+হুক)"; else bad "অর্ডার-গণনা (প্রত্যাশা ২, পাওয়া $MORDER)"; fi

echo "── ধাপ-২: রেন্ডার-প্রমাণ ──"
DT=$(curl -s -b "$J" "$BASE/admin/support-center?media=TEXT")
contains "media=TEXT → সেগমেন্ট-একো ×১" "$DT" 'class="sc-mb sc-mb-cur m-text"'
CURI=$(echo "$DT" | grep -o 'class="sc-mb sc-mb-cur' | wc -l)
if [ "$CURI" = "1" ]; then ok "একো-একমাত্রতা (নিষ্ক্রিয় ×৩ রক্ষা)"; else bad "একো-গণনা (প্রত্যাশা ১, পাওয়া $CURI)"; fi
DV=$(curl -s -b "$J" "$BASE/admin/support-center?media=VIDEO")
contains "media=VIDEO → ভিডিও-সেগমেন্ট-একো" "$DV" 'sc-mb-cur m-video'
D0=$(curl -s -b "$J" "$BASE/admin/support-center")
CURL0=$(echo "$D0" | grep -o 'class="sc-mb sc-mb-cur' | wc -l)
if [ "$CURL0" = "0" ]; then ok "ফিল্টার-শূন্যে একো-শূন্য"; else bad "ফিল্টার-শূন্য-একো (প্রত্যাশা ০, পাওয়া $CURL0)"; fi
contains "s243-প্যাটার্ন-সুরক্ষা (নিষ্ক্রিয়-সেগমেন্ট-হুবহু)" "$D0" 'class="sc-mb m-text" data-mh="TEXT"'

echo "── ধাপ-৩: আচরণ (ব্রাউজার — m-সাইকেল + u-জাম্প) ──"
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
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null && ok "ডেস্ক-লোড (q=TAG — নিখুত-স্কোপ)" || bad "ডেস্ক-লোড"
installErrs
HK=$(ev "(function(){ var h=window.__scQA.mediaCycle(); var u=window.__scQA.uJump(); return JSON.stringify({ cur:h.cur, next:h.next, found:u.found, total:u.total }); })()" 2>/dev/null)
contains "হুক mediaCycle next=TEXT (ফিল্টার-শূন্য থেকে)" "$HK" 'next..:..TEXT'
contains "হুক uJump found+total=৬ (q=TAG-স্কোপ)" "$HK" 'total..:6'
# m-সাইকেল ×৫-ধাপ (রিয়েল-নেভিগেশন) — ফিল্টার-শূন্য থেকে
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
URL1=''; for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=TEXT' && break; sleep 0.7; done
contains "m-ধাপ১ → media=TEXT" "$URL1" 'media=TEXT'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=IMAGE' && break; sleep 0.7; done
contains "m-ধাপ২ → media=IMAGE" "$URL1" 'media=IMAGE'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=AUDIO' && break; sleep 0.7; done
contains "m-ধাপ৩ → media=AUDIO" "$URL1" 'media=AUDIO'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=VIDEO' && break; sleep 0.7; done
contains "m-ধাপ৪ → media=VIDEO" "$URL1" 'media=VIDEO'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=' || break; sleep 0.7; done
if echo "$URL1" | grep -q 'media='; then bad "m-ধাপ৫ → সব (media-বাদ — সাইকেল-বদ্ধ) — URL-এ media রয়েছে: $URL1"; else ok "m-ধাপ৫ → সব (media-বাদ — সাইকেল-বদ্ধ)"; fi
# ফিল্টার-সংরক্ষণ: status+range+q সহ m
agent-browser open "$BASE/admin/support-center?status=PENDING&range=7d&q=$TAG" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'media=TEXT' && break; sleep 0.7; done
contains "m-ফিল্টার-সংরক্ষণ (status+media+q+range)" "$URL1" 'status=PENDING&media=TEXT&q=Task243-VIDEO&range=7d'
# u-জাম্প: প্রথম-নতুন-কার্ডে কার্সর
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
installErrs
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'u',bubbles:true})); 'sent'" >/dev/null 2>&1; sleep 1
UJ=$(ev "(function(){ var c=document.querySelector('.sc-cursor'); var first=document.querySelector('.sc-card'); return JSON.stringify({ has:!!c, pending:!!c&&c.getAttribute('data-status')==='PENDING', isFirst:!!c&&c===first, aria:!!c&&c.getAttribute('aria-current')==='true' }); })()" 2>/dev/null)
contains "u-জাম্প → কার্সর-স্থাপিত" "$UJ" 'has..:true'
contains "u-জাম্প → নতুন-কার্ড" "$UJ" 'pending..:true'
contains "u-জাম্প → DOM-প্রথম-কার্ড" "$UJ" 'isFirst..:true'
contains "u-জাম্প → aria-current" "$UJ" 'aria..:true'
# u-খালি: RESOLVED-ভিউ (সিড-সব-PENDING → cards শূন্য হলেও ফিল্টার-রেন্ডার-খালি) — q=TAG&status=RESOLVED
agent-browser open "$BASE/admin/support-center?status=RESOLVED&q=$TAG" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
installErrs
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'u',bubbles:true})); 'sent'" >/dev/null 2>&1; sleep 0.8
TZ2=$(ev "(function(){ var t=document.getElementById('scToast'); return JSON.stringify({ msg: t ? t.textContent : '' }); })()" 2>/dev/null)
contains "u-খালি → টোস্ট ('কোনো নতুন অভিযোগ নেই')" "$TZ2" 'নতুন অভিযোগ নেই'
HN=$(ev "(function(){ return JSON.stringify({ errs:(window.__scErrs||[]).length }); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$HN" 'errs..:0'
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-mchip')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
installErrs
agent-browser screenshot "$APP/download/s244-cycle-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=''; for i in 1 2 3; do
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s244-cycle-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: চূড়ান্ত-পরিষ্কার + pkill ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
CD=$(node "$APP/tests/s243-seed-video.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi
rm -f "$J"
echo ""
echo "s244-cycle-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
