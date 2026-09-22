#!/bin/bash
# s245-clear-suite.sh — session245 ফিল্টার-পরিষ্কার + সহায়িকা-গ্রুপ সুইট (স্থায়ী — রিপো-কমিটেড; সিড-শূন্য — base-DB-নিরপেক্ষ)
# কভারেজ: ① কাঠামো (clearFilters + keydown c-ব্রাঞ্চ + QA-হুক + সহায়িকা-সারি c + sc-help-group CSS ×৩ + গ্রুপ-টাইটেল ×৪)
#          ② রেন্ডার-প্রমাণ (গ্রুপ-টাইটেল ×৪ ডেস্ক-HTML-এ; গ্রুপ-বিহীন-রিগ্রেশন-নেগেটিভ)
#          ③ আচরণ (dirty-URL c-কী → টার্গেট-নেভিগেশন; পরিষ্কার-অবস্থায় c-কী → টোস্ট + নেভিগেশন-শূন্য; হুক dirty-সত্যতা)
#          ④ সহায়িকা-খোলা (গ্রুপ-দৃশ্যমানতা ×৪) ⑤ কনসোল-শূন্য + 390px
# চুক্তি: ① সিড-শূন্য (ফিল্টার-নেভিগেশন কার্ড-ডেটা-স্বাধীন) ② CSRF-লগইন admin/admin123
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
J=/tmp/s245-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }

echo "── ধাপ-০: পরিবেশ (বুট → লগইন; সিড-শূন্য) ──"
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (সোর্স-ফাইল) ──"
SRC=$(cat "$APP/admin/views/admin/support-center.ejs")
contains "clearFilters ফাংশন" "$SRC" 'function clearFilters()'
contains "keydown c-ব্রাঞ্চ" "$SRC" "e.key === 'c' || e.key === 'C'"
contains "টোস্ট-পরিষ্কার-অবস্থা" "$SRC" 'ফিল্টার ইতিমধ্যে পরিষ্কার'
contains "টার্গেট-URL (ট্রেইলিং-? চুক্তি)" "$SRC" "location.href = '/admin/support-center?';"
contains "QA-হুক clearFilters" "$SRC" '__scQA.clearFilters'
contains "সহায়িকা-সারি c" "$SRC" 'সব-ফিল্টার এক-কীতে পরিষ্কার — স্ট্যাটাস+মাধ্যম+সার্চ+সময়'
contains "CSS গ্রুপ-টাইটেল" "$SRC" '.sc-help-group{'
contains "CSS গ্রুপ-প্রথম-সংকোচ" "$SRC" '.sc-help-panel .sc-help-group:first-of-type'
contains "গ্রুপ-টাইটেল G1" "$SRC" 'নেভিগেশন ও ফিল্টার'
contains "গ্রুপ-টাইটেল G2" "$SRC" 'কার্ড-অ্যাকশন'
contains "গ্রুপ-টাইটেল G3" "$SRC" 'ডেস্ক-নিয়ন্ত্রণ'
contains "গ্রুপ-টাইটেল G4" "$SRC" 'মাউস-ও-টাচ'
GCNT=$(echo "$SRC" | grep -c 'class="sc-help-group"')
if [ "$GCNT" = "4" ]; then ok "গ্রুপ-টাইটেল ×৪ (HTML)"; else bad "গ্রুপ-গণনা (প্রত্যাশা ৪, পাওয়া $GCNT)"; fi

echo "── ধাপ-২: রেন্ডার-প্রমাণ (desk HTML) ──"
D=$(curl -s -b "$J" "$BASE/admin/support-center")
contains "G1 রেন্ডার" "$D" 'নেভিগেশন ও ফিল্টার'
contains "G4 রেন্ডার" "$D" 'মাউস-ও-টাচ'
contains "c-সারি রেন্ডার" "$D" 'সব-ফিল্টার এক-কীতে পরিষ্কার'
DCNT=$(echo "$D" | grep -c 'class="sc-help-group"')
if [ "$DCNT" = "4" ]; then ok "রেন্ডার-গ্রুপ ×৪"; else bad "রেন্ডার-গ্রুপ (প্রত্যাশা ৪, পাওয়া $DCNT)"; fi

echo "── ধাপ-৩: আচরণ (ব্রাউজার — c-কী) ──"
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
agent-browser open "$BASE/admin/support-center?status=PENDING&media=TEXT&range=7d" >/dev/null 2>&1
pollst "!!window.__scQA?'QA-OK':'loading'" "QA-OK" >/dev/null && ok "ডেস্ক-লোড (dirty-URL — ৩-ফিল্টার)" || bad "ডেস্ক-লোড"
installErrs
HK=$(ev "(function(){ var h=window.__scQA.clearFilters(); return JSON.stringify({ dirty:h.dirty, target:h.target }); })()" 2>/dev/null)
contains "হুক dirty=true (ফিল্টার-যুক্ত)" "$HK" 'dirty..:true'
contains "হুক টার্গেট-চুক্তি" "$HK" 'support-center?'
# c-কী → নেভিগেশন (টার্গেট = /admin/support-center?)
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true})); 'sent'" >/dev/null 2>&1
U1=''; for i in 1 2 3 4 5 6; do U1=$(agent-browser get url 2>/dev/null || echo ''); echo "$U1" | grep -q 'status=' || break; sleep 0.7; done
if echo "$U1" | grep -q 'status='; then bad "c-কী → নেভিগেশন-ব্যর্থ: $U1"; else ok "c-কী → সব-ফিল্টার-পরিষ্কার-নেভিগেশন"; fi
CLEAN=$(ev "(function(){ var h=window.__scQA.clearFilters(); return JSON.stringify({ dirty:h.dirty }); })()" 2>/dev/null)
contains "নেভিগেশন-পরে হুক dirty=false" "$CLEAN" 'dirty..:false'
# পরিষ্কার-অবস্থায় c → টোস্ট, নেভিগেশন-শূন্য
pollst "!!window.__scQA?'QA-OK':'loading'" "QA-OK" >/dev/null
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true})); 'sent'" >/dev/null 2>&1; sleep 1.2
U2=$(agent-browser get url 2>/dev/null || echo '')
if echo "$U2" | grep -qE 'status=|media=|q=|range='; then bad "পরিষ্কার-অবস্থায় c → অপ্রত্যাশিত-নেভিগেশন: $U2"; else ok "পরিষ্কার-অবস্থায় c → নেভিগেশন-শূন্য"; fi
TT=$(ev "(function(){ var t=document.getElementById('scToast'); return JSON.stringify({ shown:!!t&&t.classList.contains('show'), text:t?t.textContent:'' }); })()" 2>/dev/null)
contains "টোস্ট 'ফিল্টার ইতিমধ্যে পরিষ্কার'" "$TT" 'ফিল্টার ইতিমধ্যে পরিষ্কার'
contains "টোস্ট .show-ক্লাস" "$TT" 'shown..:true'

echo "── ধাপ-৪: সহায়িকা-খোলা (গ্রুপ-দৃশ্যমানতা ×৪) ──"
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true})); 'sent'" >/dev/null 2>&1; sleep 0.8
HG=$(ev "(function(){ var g=document.querySelectorAll('#scHelp .sc-help-group'); var vis=0; for(var i=0;i<g.length;i++){ if(g[i].offsetParent!==null) vis++; } return JSON.stringify({ count:g.length, visible:vis }); })()" 2>/dev/null)
contains "গ্রুপ ×৪ (DOM)" "$HG" 'count..:4'
contains "গ্রুপ ×৪ দৃশ্যমান (খোলা-অবস্থায়)" "$HG" 'visible..:4'
agent-browser eval "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); 'sent'" >/dev/null 2>&1 >/dev/null

echo "── ধাপ-৫: কনসোল-শূন্য + 390px ──"
ER=$(ev "JSON.stringify({ n:(window.__scErrs||[]).length })" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$ER" 'n..:0'
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
contains "390px hScroll-শূন্য" "$HS" 'h..:false'

echo ""
echo "s245-clear-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "SOME-FAILED"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
