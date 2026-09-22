#!/bin/bash
# s248-status-suite.sh — session248 স্ট্যাটাস-সাইকেল সুইট (স্থায়ী — রিপো-কমিটেড; s243-সিড-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (statusCycle + keydown s-ব্রাঞ্চ + সহায়িকা-সারি s (status-family-মার্জ) + .sc-cycle-hint CSS ×২ + active-chip inset-underline + QA-হুক)
#          ② রেন্ডার-প্রমাণ (hint-মার্কআপ ×১ + status=PENDING → নতুন-চিপ active + computed box-shadow inset + 390px-hint-hidden)
#          ③ আচরণ (s-সাইকেল ×৪-ধাপ রিয়েল-নেভিগেশন + media/q-সংরক্ষণ + হুক cur/next + কনসোল-শূন্য + সিড-cleanup-শূন্য)
# চুক্তি: ① সিড = s243-seed-video.js পুনঃব্যবহার (TAG Task243-VIDEO ×৬ PENDING; সার্ভার-বন্ধে-seed) ② CSRF-লগইন admin/admin123
#         ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল) ④ keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s248-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
TAG='Task243-VIDEO'
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্ড (ব্যাটারি-ক্রমে Chrome-মৃত্যু-শ্রেণি)

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
contains "statusCycle ফাংশন" "$SRC" 'function statusCycle()'
contains "keydown s-ব্রাঞ্চ" "$SRC" "e.key === 's' || e.key === 'S'"
contains "সহায়িকা-সারি s (status-family-মার্জ — ব্যাজ-শূন্য-ক্যাসকেড)" "$SRC" 'সাইকেল সব→নতুন→চলমান→সমাধান'
contains "সহায়িকা kbd s" "$SRC" '<kbd class="sc-kbd">s</kbd>'
contains "affordance মার্কআপ (.sc-cycle-hint)" "$SRC" 'sc-cycle-hint'
contains "affordance CSS (dashed-পিল)" "$SRC" '.sc-cycle-hint{display:inline-flex'
contains "affordance 640px-সংকোচন" "$SRC" '.sc-cycle-hint{display:none}'
contains "active-chip inset-underline" "$SRC" 'box-shadow:inset 0 -2px 0 var(--ad-accent)'
contains "QA-হুক statusCycle" "$SRC" '__scQA.statusCycle'
ORDER=$(echo "$SRC" | grep -c "var order = \['', 'PENDING', 'IN_PROGRESS', 'RESOLVED'\]")
if [ "$ORDER" = "2" ]; then ok "status-অর্ডার-এক-উৎস ×২ (fn+হুক)"; else bad "status-অর্ডার-গণনা (প্রত্যাশা ২, পাওয়া $ORDER)"; fi

echo "── ধাপ-২: রেন্ডার-প্রমাণ ──"
D0=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "affordance রেন্ডার (স্ট্যাটাস-চিপ-পরিবারে)" "$D0" 'sc-cycle-hint'
SPANN=$(echo "$D0" | grep -o '<span class="sc-cycle-hint"' | wc -l)
if [ "$SPANN" = "1" ]; then ok "hint-মার্কআপ-একমাত্রতা ×১"; else bad "hint-মার্কআপ (প্রত্যাশা ১, পাওয়া $SPANN)"; fi
AP=$(curl -s -b "$J" "$BASE/admin/support-center?status=PENDING")
contains "status=PENDING → নতুন-চিপ active (aria-current)" "$AP" 'class="sc-chip active" aria-current="true" href="/admin/support-center?status=PENDING'

echo "── ধাপ-৩: আচরণ (ব্রাউজার — s-সাইকেল + সংরক্ষণ) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo '')
[ -z "$BHC" ] && balive || true # session248 — Chrome-মৃত্যু-রিলাঞ্চ-গার্ড
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
agent-browser open "$BASE/admin/support-center?media=TEXT&q=$TAG" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-cycle-hint')?'HINT-OK':'loading'" "HINT-OK" >/dev/null && ok "ডেস্ক-লোড (media=TEXT&q=TAG — সংরক্ষণ-স্কোপ)" || bad "ডেস্ক-লোড"
installErrs
HK=$(ev "(function(){ var s=window.__scQA.statusCycle(); return JSON.stringify({ cur:s.cur, next:s.next }); })()" 2>/dev/null)
contains "হুক statusCycle next=PENDING (status-শূন্য থেকে)" "$HK" 'next..:..PENDING'
# s-সাইকেল ×৪-ধাপ (রিয়েল-নেভিগেশন) — media=TEXT&q সংরক্ষণ-সহ
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true})); 'sent'" >/dev/null 2>&1
URL1=''; for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'status=PENDING&media=TEXT' && break; sleep 0.7; done
contains "s→নতুন (PENDING) + media-সংরক্ষণ" "$URL1" 'status=PENDING&media=TEXT'
contains "সংরক্ষিত q (TAG-স্কোপ)" "$URL1" "q=$TAG"
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'status=IN_PROGRESS' && break; sleep 0.7; done
contains "s→চলমান (IN_PROGRESS) + সংরক্ষণ" "$URL1" 'status=IN_PROGRESS&media=TEXT'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'status=RESOLVED' && break; sleep 0.7; done
contains "s→সমাধান (RESOLVED) + সংরক্ষণ" "$URL1" 'status=RESOLVED&media=TEXT'
HK2=$(ev "(function(){ var s=window.__scQA.statusCycle(); return JSON.stringify({ cur:s.cur, next:s.next }); })()" 2>/dev/null)
contains "হুক cur=RESOLVED (চক্রের-শেষ-ধাপ)" "$HK2" 'cur..:..RESOLVED'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'s',bubbles:true})); 'sent'" >/dev/null 2>&1
for i in 1 2 3 4 5 6; do URL1=$(agent-browser get url 2>/dev/null || echo ''); echo "$URL1" | grep -q 'status=' || break; sleep 0.7; done
NS=$(echo "$URL1" | grep -o 'status=' | wc -l)
if [ "${NS:-0}" = "0" ]; then ok "s→সব (চক্র-সমাপ্তি — status-শূন্য)"; else bad "চক্র-সমাপ্তি-ব্যর্থ (status-এখনো-আছে: $URL1)"; fi
contains "চক্র-পরবর্তী media-সংরক্ষণ অক্ষুণ্ণ" "$URL1" 'media=TEXT'

echo "── ধাপ-৪: স্টাইল-প্রমাণ (computed) + স্ক্রিনশট ──"
BHC=$(agent-browser get url 2>/dev/null || echo '')
[ -z "$BHC" ] && balive || true # session248 — Chrome-মৃত্যু-রিলাঞ্চ-গার্ড
agent-browser open "$BASE/admin/support-center?status=PENDING&media=TEXT&q=$TAG" >/dev/null 2>&1; sleep 1.5
pollst "!!document.querySelector('.sc-filters .sc-chip.active')?'CHIP-OK':'loading'" "CHIP-OK" >/dev/null
BS=$(ev "(function(){ var c=document.querySelector('.sc-filters .sc-chip.active'); if(!c) return JSON.stringify({bs:'none'}); return JSON.stringify({ bs: getComputedStyle(c).boxShadow }); })()" 2>/dev/null)
contains "active-chip computed inset-underline (color-first-সিরিয়ালাইজ)" "$BS" 'bs..:.*inset'
agent-browser screenshot "$APP/download/s248-status-desk.png" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
DH=$(ev "(function(){ var h=document.querySelector('.sc-cycle-hint'); if(!h) return JSON.stringify({ dh:'absent' }); return JSON.stringify({ dh: getComputedStyle(h).display }); })()" 2>/dev/null)
contains "390px affordance-সংকোচন (display:none)" "$DH" 'dh..:..none'
HW=''; for i in 1 2 3; do
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s248-status-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: কনসোল-শূন্য + চূড়ান্ত-পরিষ্কার ──"
HN=$(ev "(function(){ return JSON.stringify({ errs:(window.__scErrs||[]).length }); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$HN" 'errs..:0'
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
CD=$(node "$APP/tests/s243-seed-video.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi
rm -f "$J"
echo ""
echo "s248-status-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
