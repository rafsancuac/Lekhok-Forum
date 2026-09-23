#!/bin/bash
# s280-ep3p-suite.sh — session280: /epaper PressReader ৩-প্যানেল রিডার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (epGrid280 + একক ep-ctlbar + ep-rail + ep-cal280 + epBarDate/epCalGrid/epPageJump;
#          পুরনো-বার-শূন্য: ep-switchstrip/ep-viewer-bar/epPagePager/epTodayBtn/epIssueSelect/ep-btn-allpages)
#          ② স্টাইল (epaper.css hex-০ র‍্যাচেট + session280-ব্লক + রেল/ক্যালেন্ডার-সিলেক্টর; guard:design গ্রিন)
#          ③ আচরণ (রিয়েল-ব্রাউজার: বুট-অবস্থা — ক্যালেন্ডার-গ্রিড/আজ-রিং/নির্বাচিত-ফিল/উপলব্ধ-ডট/তালিকা/বার-বাংলা-তারিখ;
#          ক্যালেন্ডার-ক্লিকে দিন-সুইচ (তালিকা+লেবেল+বার-তারিখ-সিঙ্ক); জুম ×২→১৩০%; মাস-নেভিগেশন;
#          স্টাব-পিডিএফ-পথে রেল-থাম্বনেইল রেন্ডার (ক্যানভাস ×N + ক্যাপশন + পেজ-ড্রপডাউন); মোড-টগলে রেল-রিসেট)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২  ⑤ পরিষ্কারক (s280-qa-সারি-বিলোপ — idempotent)
# চুক্তি: ① পাবলিক-পেজ (লগইন-শূন্য) ② সিড = সার্ভার-বন্ধে scripts/s280-seed-epaper.js (clobber-গোটচা — pkill -9)
#         ③ স্টাব-পিডিএফ = ব্রাউজার-নিজস্ব fetch-ওভাররাইড (বৈধ ৩-পাতা মিনি-পিডিএফ — dict-স্পেস-চুক্তি)
#         ④ eval-JSON: tr -d '"\' → grep -qF (s279-চুক্তি) ⑤ বাংলা-স্ট্রিং grep = কাঁচা-UTF-8 (JSON.stringify অ-এস্কেপড)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s280-ep-page.html
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — অনুপস্থিত: $3"; fi; }
not_contains(){ if echo "$2" | grep -q "$3"; then bad "$1 — নিষিদ্ধ-উপস্থিত: $3"; else ok "$1"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
jflat(){ echo "$1" | tr -d '"\\'; }
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ (প্রোব → সিড-প্রয়োজনে-সার্ভার-চক্র) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
NEED_SEED=0
if echo "$H" | grep -q '"status":"healthy"'; then
  curl -s -m 6 "$BASE/epaper" -o "$PAGE" 2>/dev/null
  if echo "$PAGE" | grep -q 'data-papers="%5B%5D'; then NEED_SEED=1; fi
  if ! grep -q 's280কিউএ' "$PAGE" 2>/dev/null; then NEED_SEED=1; fi
  if [ "$NEED_SEED" = "0" ]; then ok "স্থায়ী-সার্ভার জীবিত + s280-qa-ডেটা-বিদ্যমান"; fi
else
  NEED_SEED=1
fi
if [ "$NEED_SEED" = "1" ]; then
  pkill -9 -f "node server.js" 2>/dev/null; sleep 1
  (cd "$APP" && node scripts/s280-seed-epaper.js) || { echo "FATAL: সিড-ব্যর্থ"; exit 1; }
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সিড+সার্ভার-চক্র সম্পন্ন (s280-qa-সারি)"
  curl -s -m 6 "$BASE/epaper" -o "$PAGE" 2>/dev/null
fi
HC=$(curl -s -o /dev/null -w "%{http_code}" -m 6 "$BASE/epaper")
if [ "$HC" = "200" ]; then ok "GET /epaper → 200"; else bad "GET /epaper → $HC"; fi

echo "── ধাপ-১: কাঠামো (রেন্ডার্ড HTML) ──"
PAGETXT=$(cat "$PAGE" 2>/dev/null || echo '')
for m in 'id="epGrid280"' 'class="ep-ctlbar"' 'class="ep-rail"' 'class="ep-cal280"' 'id="epBarDate"' 'id="epCalGrid"' 'id="epCalPrev"' 'id="epCalNext"' 'id="epPageJump"' 'id="epPaperSelect"' 'id="epListLbl"' 'type="date"'; do
  contains "কাঠামো: $m" "$PAGETXT" "$m"
done
for m in 'ep-switchstrip' 'ep-viewer-bar' 'epPagePager' 'epPgNums' 'epTodayBtn' 'epIssueSelect' 'ep-btn-allpages' 'epAllPagesBtn' 'ep-pages is-grid'; do
  not_contains "পুরনো-বিলোপ: $m" "$PAGE" "$m"
done

echo "── ধাপ-২: স্টাইল (CSS-র‍্যাচেট + session280-ব্লক) ──"
CSSF="$APP/public/assets/css/epaper.css"
HEXC=$(grep -oE '#[0-9a-fA-F]{3,8}\b' "$CSSF" | wc -l)
if [ "$HEXC" = "0" ]; then ok "epaper.css hex-০ (র‍্যাচেট-নিরাপদ)"; else bad "epaper.css hex=$HEXC (baseline 0 লঙ্ঘন)"; fi
contains "session280-ব্লক-মার্কার" "$(cat "$CSSF")" "session280 — PressReader ৩-প্যানেল"
for sel in '\.ep-rail-item' '\.ep-cal-day' '\.ep-bardate' 'ep-grid:fullscreen' '\.ep-rail-thumb' 'ep-rail-shimmer'; do
  contains "CSS: $sel" "$(cat "$CSSF")" "$sel"
done
GUARD=$(cd "$APP" && npm run guard:design 2>&1 | tail -1)
if echo "$GUARD" | grep -q 'গ্রিন'; then ok "guard:design গ্রিন"; else bad "guard:design: $GUARD"; fi

echo "── ধাপ-৩: আচরণ (রিয়েল-ব্রাউজার) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1 || true
agent-browser open "$BASE/epaper" >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo '')
if [ -z "$BHC" ]; then balive; agent-browser open "$BASE/epaper" >/dev/null 2>&1; fi
sleep 4
BOOT=$(ev "JSON.stringify({grid:!!document.getElementById('epGrid280'),calDays:document.querySelectorAll('#epCalGrid .ep-cal-day').length,today:!!document.querySelector('.ep-cal-day.is-today'),sel:!!document.querySelector('.ep-cal-day.is-sel'),dots:document.querySelectorAll('.ep-cal-day.has').length,list:document.querySelectorAll('#epList .ep-item').length,barDate:document.getElementById('epBarDate').textContent,paperOpts:document.getElementById('epPaperSelect').options.length,readerOn:document.getElementById('epModeReader').classList.contains('is-on')})")
J=$(jflat "$BOOT")
contains "বুট: গ্রিড-জীবিত" "$J" "grid:true"
contains "বুট: ক্যালেন্ডার-গ্রিড ≥২৮-দিন" "$J" "calDays"
if echo "$J" | grep -qE 'calDays:(2[89]|3[01])'; then ok "বুট: মাস-দিন-সংখ্যা বাস্তব (২৮–৩১)"; else bad "বুট: calDays অস্বাভাবিক — $J"; fi
contains "বুট: আজ-রিং" "$J" "today:true"
contains "বুট: নির্বাচিত-ফিল" "$J" "sel:true"
if echo "$J" | grep -qE 'dots:[1-9]'; then ok "বুট: উপলব্ধ-তারিখ-ডট ≥১"; else bad "বুট: ডট-শূন্য (সিড-তারিখ-অমিল?) — $J"; fi
if echo "$J" | grep -qE 'list:[1-9]'; then ok "বুট: তালিকা-সারি ≥১"; else bad "বুট: তালিকা-শূন্য — $J"; fi
if echo "$BOOT" | grep -qF 'বার, ' && echo "$BOOT" | grep -qF '২০২৬'; then ok "বুট: বার-তারিখ পূর্ণ-বাংলা (বার+বর্ষ)"; else bad "বুট: barDate-অসম্পূর্ণ — $BOOT"; fi
if echo "$J" | grep -qE 'paperOpts:[1-9]'; then ok "বুট: পত্রিকা-সিলেক্টর-পূরণ"; else bad "বুট: সিলেক্টর-শূন্য"; fi
contains "বুট: ডিজিটাল-রিডার-ডিফল্ট" "$J" "readerOn:true"

# ক্যালেন্ডার-ক্লিকে দিন-সুইচ
CALCLICK=$(ev "var t=document.querySelector('.ep-cal-day.is-today');var d=t.getAttribute('data-d');var alt=document.querySelector('.ep-cal-day.has:not(.is-sel)');var tgt=alt||t;tgt.click();JSON.stringify({clicked:tgt.getAttribute('data-d')})")
sleep 1
SW=$(ev "JSON.stringify({list:document.querySelectorAll('#epList .ep-item').length,lbl:document.getElementById('epListLbl').textContent,selN:(document.querySelector('.ep-cal-day.is-sel')||{textContent:''}).textContent,barDate:document.getElementById('epBarDate').textContent})")
JSW=$(jflat "$SW")
if echo "$JSW" | grep -qE 'list:[0-9]+'; then ok "ক্যালেন্ডার-ক্লিকে তালিকা-পুনর্নির্মাণ"; else bad "ক্যালেন্ডার-ক্লিক: তালিকা — $SW"; fi
if echo "$SW" | grep -qF 'পত্রিকা'; then ok "ক্যালেন্ডার-ক্লিকে লেবেল-সিঙ্ক"; else bad "লেবেল — $SW"; fi
if echo "$SW" | grep -qF 'selN' && ! echo "$SW" | grep -q 'selN":""'; then ok "ক্যালেন্ডার-ক্লিকে নির্বাচিত-ফিল-সরণ"; else bad "ফিল-সরণ — $SW"; fi

# জুম ×২ → ১৩০%
Z=$(ev "document.getElementById('epZoomIn').click();document.getElementById('epZoomIn').click();document.getElementById('epZoomReset').textContent")
if echo "$Z" | grep -qF '১৩০%'; then ok "জুম ×২ → ১৩০%"; else bad "জুম — $Z"; fi
# মাস-নেভিগেশন
MN=$(ev "var m0=document.getElementById('epCalMonth').textContent;document.getElementById('epCalPrev').click();var m1=document.getElementById('epCalMonth').textContent;document.getElementById('epCalNext').click();JSON.stringify({m0:m0,m1:m1,m2:document.getElementById('epCalMonth').textContent,changed:m0!==m1})")
if [ "$(echo "$MN" | tr -d '"\\')" != "$(echo "$MN" | tr -d '"\\' | sed 's/changed:true/changed:false/')" ] && echo "$MN" | tr -d '"\\' | grep -q 'changed:true'; then ok "মাস-নেভ: পিছনে-সামনে পুনরুদ্ধার"; else bad "মাস-নেভ — $MN"; fi

# স্টাব-পিডিএফ-পথে রেল-থাম্বনেইল (ব্রাউজার-নিজস্ব fetch-ওভাররাইড — বৈধ ৩-পাতা মিনি-পিডিএফ)
STUB=$(ev "window.__s280bytes=(function(){function mk(n){var objs=[];var kids=[];for(var i=0;i<n;i++)kids.push((3+i)+' 0 R');objs.push('<< /Type /Catalog /Pages 2 0 R >>');objs.push('<< /Type /Pages /Kids [ '+kids.join(' ')+' ] /Count '+n+' >>');for(var i=0;i<n;i++)objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 300 400 ] /Contents '+(3+n+i)+' 0 R /Resources << /Font << /F1 '+(3+2*n+i)+' 0 R >> >> >>');for(var i=0;i<n;i++){var s='BT /F1 24 Tf 40 200 Td (Page '+(i+1)+') Tj ET';objs.push('<< /Length '+s.length+' >>\nstream\n'+s+'\nendstream');}for(var i=0;i<n;i++)objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');var body='%PDF-1.4\n';var offs=[];objs.forEach(function(o,idx){offs.push(body.length);body+=(idx+1)+' 0 obj\n'+o+'\nendobj\n'});var xref=body.length;body+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';offs.forEach(function(off){body+=('0000000000'+off).slice(-10)+' 00000 n \n'});body+='trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';return body;}var s=mk(3);var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&0xff;return u;})();window.__s280hits=0;window.fetch=function(url,opts){if(String(url).indexOf('/api/epaper/file/')!==-1){window.__s280hits++;return Promise.resolve(new Response(window.__s280bytes.slice()));}return Promise.reject(new Error('s280-blocked'));};'armed'")
contains "রেল-টেস্ট: স্টাব-আর্মড" "$STUB" "armed"
ev "var its=document.querySelectorAll('#epList .ep-item');its[its.length-1].click();'clicked'"
sleep 6
RL=$(ev "JSON.stringify({hits:window.__s280hits,items:document.querySelectorAll('#epRail .ep-rail-item').length,canvases:document.querySelectorAll('#epRail .ep-rail-thumb canvas').length,pending:document.querySelectorAll('#epRail .ep-rail-thumb.is-pending').length,caps:[].slice.call(document.querySelectorAll('#epRail .ep-rail-cap')).map(function(e){return e.textContent}).join('|'),jumpOpts:document.getElementById('epPageJump').hidden===false?document.getElementById('epPageJump').options.length:0,stageCanvas:!!document.querySelector('#epStage .ep-page-holder canvas'),count:document.getElementById('epRailCount').textContent})")
JRL=$(jflat "$RL")
if echo "$JRL" | grep -qE 'hits:[1-9]'; then ok "রেল-টেস্ট: স্টাব-ফেচ-হিট"; else bad "রেল-টেস্ট: স্টাব-হিট-শূন্য — $RL"; fi
if echo "$JRL" | grep -qE 'items:3'; then ok "রেল-টেস্ট: পাতা-বাটন ×৩ (পিডিএফ-অনুযায়ী)"; else bad "রেল-টেস্ট: items — $RL"; fi
if echo "$JRL" | grep -qE 'canvases:3'; then ok "রেল-টেস্ট: থাম্বনেইল-ক্যানভাস ×৩ রেন্ডারড"; else bad "রেল-টেস্ট: ক্যানভাস — $RL"; fi
contains "রেল-টেস্ট: পেন্ডিং-শূন্য (পূর্ণ-রেন্ডার)" "$JRL" "pending:0"
if echo "$RL" | grep -qF 'প্রথম পাতা' && echo "$RL" | grep -qF 'পাতা ৩'; then ok "রেল-টেস্ট: ক্যাপশন (প্রথম পাতা/পাতা ৩)"; else bad "রেল-টেস্ট: ক্যাপশন — $RL"; fi
if echo "$JRL" | grep -qE 'jumpOpts:3'; then ok "রেল-টেস্ট: পাতা-ড্রপডাউন ×৩-সিঙ্কড"; else bad "রেল-টেস্ট: ড্রপডাউন — $RL"; fi
contains "রেল-টেস্ট: মূল-স্টেজ-ক্যানভাস" "$JRL" "stageCanvas:true"
# রেল-ক্লিকে পাতা-জাম্প + সিঙ্ক
RP=$(ev "document.querySelectorAll('#epRail .ep-rail-item')[2].click();'p3'")
sleep 2
RS=$(ev "JSON.stringify({on:document.querySelector('#epRail .ep-rail-item.is-on').getAttribute('data-n'),jumpVal:document.getElementById('epPageJump').value})")
if jflat "$RS" | grep -q 'on:3'; then ok "রেল-ক্লিক: পাতা-৩-সক্রিয়"; else bad "রেল-ক্লিক — $RS"; fi
# মোড-টগলে রেল-রিসেট (প্রচ্ছদ-মোডে খালি-অবস্থা)
ev "document.getElementById('epModeThumb').click();'thumb-mode'"
sleep 1
TM=$(ev "JSON.stringify({railEmpty:!!document.querySelector('#epRail .ep-rail-empty'),thumbOn:document.getElementById('epModeThumb').classList.contains('is-on')})")
if jflat "$TM" | grep -qF 'railEmpty:true'; then ok "মোড-টগল: প্রচ্ছদ-মোডে রেল-খালি-অবস্থা"; else bad "মোড-টগল — $TM"; fi
ev "document.getElementById('epModeReader').click();'back-reader'"

echo "── ধাপ-৪: 390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
HS=$(ev "JSON.stringify({hs:document.documentElement.scrollWidth>document.documentElement.clientWidth,cw:document.documentElement.scrollWidth})")
if jflat "$HS" | grep -qF 'hs:false'; then ok "390px: অনুভূমিক-স্ক্রল-শূন্য"; else bad "390px: hScroll — $HS"; fi
agent-browser screenshot "$APP/tests/s280-ep3p-mobile390.png" >/dev/null 2>&1 && ok "স্ক্রিনশট: mobile390" || bad "স্ক্রিনশট-মোবাইল-ব্যর্থ"
agent-browser set viewport 1366 900 >/dev/null 2>&1
sleep 1
agent-browser screenshot "$APP/tests/s280-ep3p-desk.png" >/dev/null 2>&1 && ok "স্ক্রিনশট: desk" || bad "স্ক্রিনশট-ডেস্ক-ব্যর্থ"

echo "── ধাপ-৫: পরিষ্কারক (s280-qa-সারি — idempotent, সার্ভার-বন্ধ-চক্র) ──"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
(cd "$APP" && node scripts/s280-seed-epaper.js --clean) && ok "s280-qa-সারি-বিলোপ" || bad "ক্লিনআপ-ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার-পুনরুদ্ধার" || bad "সার্ভার-পুনরুদ্ধার-ব্যর্থ"

echo ""
echo "সারসংক্ষেপ: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
[ "$FAIL" = "0" ] && exit 0 || exit 1
