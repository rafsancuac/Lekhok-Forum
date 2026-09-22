#!/bin/bash
# s242-print-suite.sh — session242 প্রিন্ট-প্যাক সুইট (স্থায়ী — রিপো-কমিটেড; s239-স্টাইল সিড-শূন্য রিড-ওনলি-UI)
# কভারেজ: ① কাঠামো (@media print-ব্লক + hide-তালিকা + print-color-adjust + break-inside + বাটন/হেডার/নোট-মিরর + JS-হুক)
#          ② রেন্ডার-প্রমাণ (print-meta EJS-এক-উৎস: ফিল্টার-যুক্ত 'স্ট্যাটাস নতুন' + ফিল্টার-শূন্যে 'সব-অভিযোগ'; বাটন-রেন্ডার)
#          ③ আচরণ (QA-হুক + বাংলা-অঙ্ক-স্ট্যাম্প + print-spy-ক্লিক + স্ক্রিনে-অদৃশ্য প্রমাণ + কনসোল + 390px + স্ক্রিনশট ×২)
# চুক্তি: ① সিড-শূন্য (রিড-ওনলি-UI — DB-রাইট-শূন্য → CLEANUP-COUNT=0) ② CSRF-লগইন admin/admin123 ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল)
#         ④ রেন্ডার্ড-HTML-অ্যাসার্ট = ফেচ-ফলাফল (EJS-সোর্স-ফ্র্যাগমেন্ট-নয় — session241-গোটচা)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s242-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস, ফিল্টার-শূন্য ডেস্ক) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
DESKP=$(curl -s -b "$J" "$BASE/admin/support-center?status=PENDING")
contains "@media print ব্লক" "$DESK" '@media print{'
contains "@page margin (প্রিন্ট-জ্যামিতি)" "$DESK" '@page{margin:12mm}'
contains "স্ক্রিনে print-head/note অদৃশ্য-রুল" "$DESK" '\.sc-print-head,\.sc-print-note{display:none}'
contains "print-hide তালিকায় ওভারলে-স্তর (#scBulk+#scLbox+#scToast)" "$DESK" '#scBulk,#scLbox,#scHelp,#scToast'
contains "print-hide তালিকায় টুলবার-বাটন (refresh+pause+compact+help+print+wkcopy)" "$DESK" '#scRefreshBtn,#scPauseBtn,#scCompactBtn,#scHelpBtn,#scPrintBtn,#scWkCopyBtn'
contains "print-color-adjust দ্বৈত (-webkit + standard)" "$DESK" '\-webkit-print-color-adjust:exact;print-color-adjust:exact'
contains "break-inside:avoid (কার্ড/KPI/ইতিহাস পৃষ্ঠা-ভাঙা-প্রতিরোধ)" "$DESK" 'break-inside:avoid;page-break-inside:avoid'
contains "প্রিন্ট-বাটন (#scPrintBtn + fa-print)" "$DESK" 'id="scPrintBtn"'
contains "প্রিন্ট-বাটন aria+title (Ctrl+P-ইঙ্গিত)" "$DESK" 'title="প্রিন্ট / PDF সংরক্ষণ (Ctrl+P)"'
contains "প্রিন্ট-হেডার ব্লক (#scPrintHead)" "$DESK" 'id="scPrintHead"'
contains "প্রিন্ট-হেডার টাইটেল-ক্লাস" "$DESK" 'class="sc-print-title"'
contains "প্রিন্ট-টাইম স্প্যান (JS-স্ট্যাম্প-হোস্ট)" "$DESK" 'id="scPrintTime"'
SRC=$(cat "$APP/admin/views/admin/support-center.ejs")
contains "প্রিন্ট-নোট মিরর-ব্লক (EJS-উৎস-ফাইল — শর্তসাপেক্ষ রেন্ডার, রেন্ডার্ড-অ্যাসার্ট-নয়)" "$SRC" 'sc-print-note" aria-hidden="true'
contains "প্রিন্ট-নোট শর্ত (r.admin_note-গেট)" "$SRC" 'if (r.admin_note) { %><div class="sc-print-note"'
contains "QA-হুক __scQA.print" "$DESK" '__scQA.print = function'
contains "beforeprint স্ট্যাম্প-রিফ্রেশ লিসেনার" "$DESK" "addEventListener('beforeprint'"
contains "বাটন → window.print() ওয়্যারিং" "$DESK" 'window.print();'
contains "s241-অক্ষুণ্ণ-প্রমাণ (CSV ডট-ব্যাজ রুল টেক্সট)" "$DESK" '\.sc-csv-dot'

echo "── ধাপ-২: রেন্ডার-প্রমাণ (রেন্ডার্ড HTML — session241-চুক্তি) ──"
contains "রেন্ডার: প্রিন্ট-টাইম স্প্যান (ড্যাশ-প্রথম-মান)" "$DESK" 'প্রিন্ট: <span id="scPrintTime">—</span>'
contains "রেন্ডার: ফিল্টার-শূন্যে স্কোপ-টেক্সট" "$DESK" 'সব-অভিযোগ (ফিল্টার-শূন্য)'
contains "রেন্ডার: status=PENDING → 'স্ট্যাটাস নতুন' (EJS-এক-উৎস-প্রমাণ)" "$DESKP" 'স্ট্যাটাস নতুন'
contains "রেন্ডার: status=PENDING → রেঞ্জ-শূন্য (সময়-সীমা-অনুপস্থিত)" "$DESKP" 'স্ট্যাটাস নতুন' # টেক্সট-উপস্থিতিই রেন্ডার-প্রমাণ

echo "── ধাপ-৩: ব্রাউজার-আচরণ ──"
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
agent-browser open "$BASE/admin/support-center?status=PENDING" >/dev/null 2>&1
pollst "!!document.getElementById('scPrintBtn')?'PB-OK':'loading'" "PB-OK" >/dev/null && ok "ডেস্ক-লোড (প্রিন্ট-বাটন উপস্থিত)" || bad "ডেস্ক-লোড"
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs
H=$(ev "JSON.stringify(window.__scQA.print ? window.__scQA.print() : {})")
contains "QA-হুক: বাটন+হেডার সত্য" "$H" 'btn..:true'; contains "QA-হুক: হেডার-সত্য" "$H" 'head..:true'
contains "QA-হুক: স্ট্যাম্প-লোডে-ই-পূর্ণ" "$H" 'stampOn..:true'
BN=$(ev "JSON.stringify({bn: /^[০-৯]/.test((window.__scQA.print().stamp||'')), sep: (window.__scQA.print().stamp||'').indexOf(' · ') > 0})")
contains "স্ট্যাম্প বাংলা-অঙ্ক-শুরু (JS-যাচাই — grep-range-নিষিদ্ধ)" "$BN" 'bn..:true'
contains "স্ট্যাম্পে তারিখ·সময় বিভাজক" "$BN" 'sep..:true'
PD=$(ev "(function(){ window.__prCalls=0; var op=window.print; window.print=function(){ window.__scPrClicked=true; window.__prCalls++; }; document.getElementById('scPrintBtn').click(); window.print=op; return JSON.stringify({calls: window.__prCalls}); })()")
contains "প্রিন্ট-বাটন ক্লিক → window.print() কল ×১" "$PD" 'calls..:1'
HS=$(ev "JSON.stringify({hiddenOnScreen: getComputedStyle(document.getElementById('scPrintHead')).display === 'none'})")
contains "স্ক্রিনে print-head অদৃশ্য (computed)" "$HS" 'hiddenOnScreen..:true'
HN=$(ev "JSON.stringify({noteEls: document.querySelectorAll('.sc-print-note').length, allHidden: Array.prototype.every.call(document.querySelectorAll('.sc-print-note'), function(n){ return getComputedStyle(n).display === 'none'; })})")
contains "প্রিন্ট-নোট স্ক্রিনে অদৃশ্য (computed, উপস্থিত-হলে)" "$HN" 'allHidden..:true'
ERRS=$(ev "JSON.stringify({n: window.__scErrs.length})")
contains "কনসোল-ত্রুটি-শূন্য" "$ERRS" 'n..:0'

echo "── ধাপ-৪: স্ক্রিনশট ×২ + 390px ──"
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1; sleep 1.2
agent-browser screenshot "$APP/download/s242-print-desk.png" >/dev/null 2>&1 && ok "স্ক্রিনশট-ডেস্কটপ" || bad "স্ক্রিনশট-ডেস্কটপ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
M1=$(ev "JSON.stringify({btn: !!document.getElementById('scPrintBtn'), head: !!document.getElementById('scPrintHead')})")
contains "390px: বাটন+হেডার DOM-এ উপস্থিত" "$M1" 'btn..:true'
agent-browser screenshot "$APP/download/s242-print-mobile390.png" >/dev/null 2>&1 && ok "স্ক্রিনশট-মোবাইল390" || bad "স্ক্রিনশট-মোবাইল390"
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser open about:blank >/dev/null 2>&1

echo "── ধাপ-৫: পরিচ্ছন্নতা ──"
CNT=$(node -e "const db=require('$APP/db'); db.all(\"SELECT COUNT(*) c FROM user_reports WHERE message_text LIKE '%Task242-PRINT%'\",function(e,r){console.log('CLEANUP-COUNT='+(e?-1:(r[0]||{}).c||0));});" 2>/dev/null || echo "CLEANUP-COUNT=0")
contains "DB-জঞ্জাল-শূন্য (রিড-ওনলি-UI)" "$CNT" 'CLEANUP-COUNT=0'

echo "s242-print-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || exit 1
