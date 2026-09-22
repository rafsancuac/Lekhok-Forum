#!/bin/bash
# s241-media-suite.sh — session241 মিডিয়া-প্যাক সুইট (স্থায়ী — রিপো-কমিটেড; s240/s239-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (CSV-range-href-ফিক্স + মিডিয়া-স্ট্রিপ ×৫-হুক + লেজেন্ড + payload-মিডিয়া-সেকশন ×২ + QA-হুক + CSS ×৫)
#          ② আচরণ (সিড q=TAG-স্কোপ): স্ট্রিপ-গণনা নিখুত {t:2,i:1,a:1,v:0} + payload-মোট-৪ + CSV range-ফাইলনাম/সারি-গণনা + ডট-ব্যাজ
#          ③ খালি-অবস্থা (cleanup-পরে q=TAG): data-mtotal=0 + sc-mb-none + কনসোল + 390px + স্ক্রিনশট ×২
# চুক্তি: ① সিড = TAG 'Task241-MEDIA' (প্রি-ক্লিন+cleanup — জঞ্জাল-শূন্য; সার্ভার-বন্ধ-অবস্থায় seed) ② CSRF-লগইন admin/admin123
#         ③ eval-স্ট্রিং-মান-গ্রেপ k..:..v (session240-গোটচা); বুলিয়ান k..:true; বাংলা-অঙ্ক-যাচাই JS-এ (grep-range-নিষিদ্ধ)
#         ④ স্কোপ-চুক্তি সুবিধায় q=TAG → mediaBreak নিখুত-গণনা (বেস-DB-নিরপেক্ষ)
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s241-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → সিড → বুট) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/tests/s241-seed-media.js" seed 2>&1)
if echo "$SD" | grep -q "SEED-COUNT=4"; then ok "সিড ×৪ (TEXT×2 + IMAGE + AUDIO — TAG Task241-MEDIA)"; else bad "সিড ব্যর্থ: $SD"; exit 1; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (HTML-উৎস, ফিল্টার-শূন্য ডেস্ক) ──"
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
DESK=$(curl -s -b "$J" "$BASE/admin/support-center")
DESKR=$(curl -s -b "$J" "$BASE/admin/support-center?range=7d")
contains "CSV-href range-ফিক্স (রেন্ডার-প্রমাণ — range=7d-সহ)" "$DESKR" 'export.csv?range=7d'
contains "CSV-ফিল্টার-টাইটেল (সময়-সীমা-শাখা)" "$DESKR" 'সময়-সীমা: 7d'
contains "মিডিয়া-স্ট্রিপ ব্লক (track + role=img)" "$DESK" 'class="sc-mediabar-track" role="img"'
contains "স্ট্রিপ-ডেটা-হুক ×৫ (data-mt/mi/ma/mv/mtotal)" "$DESK" 'data-mtotal='
contains "লেজেন্ড ×৪+মোট (lg-dot-টোকেন)" "$DESK" 'class="lg-dot lg-text"'
MSC=$(echo "$DESK" | grep -o 'মিডিয়া বিভাজন (বর্তমান-স্কোপ)' | wc -l)
if [ "$MSC" = "2" ]; then ok "payload-মিডিয়া-সেকশন ×২ (৭+৩০-দিন)"; else bad "payload-মিডিয়া-সেকশন-গণনা (প্রত্যাশা ২, পাওয়া $MSC)"; fi
contains "QA-হুক (__scQA.mediaBreak)" "$DESK" '__scQA.mediaBreak'
contains "CSS স্ট্রিপ-বেস (.sc-mediabar{)" "$DESK" '.sc-mediabar{background:var(--ad-card)'
contains "CSS সেগমেন্ট-টোকেন ×৪ (m-text→m-video)" "$DESK" '.sc-mb.m-text{background:var(--ad-accent)}'
contains "CSS CSV-ডট (.sc-csv-dot{)" "$DESK" '.sc-csv-dot{display:inline-block'
contains "CSS 640px-সংকোচন (mediabar)" "$DESK" '@media (max-width:640px){.sc-mediabar{padding:8px 10px}'
contains "ফিল্টার-শূন্যে ডট-ব্যাজ-অনুপস্থিত (conditional)" "$DESK" 'CSV</a>' || contains "ফিল্টার-শূন্যে ডট-অনুপস্থিত (fallback-মার্কার)" "$DESK" '>CSV<'

echo "── ধাপ-২: ব্রাউজার-সেশন (q=TAG-স্কোপ — নিখুত-গণনা) ──"
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
agent-browser open "$BASE/admin/support-center?q=Task241-MEDIA" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-mediabar-track')?'MB-OK':'loading'" "MB-OK" >/dev/null && ok "ডেস্ক-লোড (মিডিয়া-স্ট্রিপ উপস্থিত)" || bad "ডেস্ক-লোড"
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
installErrs

echo "── ধাপ-৩: স্ট্রিপ-গণনা নিখুত (q=TAG → {t:2,i:1,a:1,v:0,total:4}) ──"
MB=$(ev "(function(){ var h=window.__scQA.mediaBreak(); return JSON.stringify({ p:h.present, t:h.t, i:h.i, a:h.a, v:h.v, total:h.total }); })()" 2>/dev/null)
contains "হুক present" "$MB" 'p..:true'
contains "লেখা=২" "$MB" 't..:2'
contains "ছবি=১" "$MB" 'i..:1'
contains "ভয়েস=১" "$MB" 'a..:1'
contains "ভিডিও=০" "$MB" 'v..:0'
contains "মোট=৪" "$MB" 'total..:4'
MW=$(ev "(function(){ var s=document.querySelector('.sc-mb.m-text'); var a=document.querySelector('.sc-mb.m-video'); return JSON.stringify({ textW:s?s.getBoundingClientRect().width>0:false, videoW:a?a.getBoundingClientRect().width===0:true }); })()" 2>/dev/null)
contains "flex-grow-অনুপাত (লেখা-দৃশ্যমান, ভিডিও-শূন্য-প্রস্থ)" "$MW" 'textW..:true'
contains "ভিডিও-সেগমেন্ট-শূন্য-প্রস্থ" "$MW" 'videoW..:true'
PM=$(ev "(function(){ var o=JSON.parse(document.getElementById('scWkReport').textContent); var o30=JSON.parse(document.getElementById('scWkReport30').textContent); return JSON.stringify({ m7:o.text.indexOf('মিডিয়া বিভাজন')>=0, tot7:o.text.indexOf('মোট ৪ টি')>=0, m30:o30.text.indexOf('মিডিয়া বিভাজন')>=0, tot30:o30.text.indexOf('মোট ৪ টি')>=0 }); })()" 2>/dev/null)
contains "payload-৭ মিডিয়া-সেকশন + মোট-৪ (বাংলা-অঙ্ক)" "$PM" 'm7..:true'
contains "payload-৭ মোট-৪-লেখা" "$PM" 'tot7..:true'
contains "payload-৩০ মিডিয়া-সেকশন" "$PM" 'm30..:true'
contains "payload-৩০ মোট-৪-লেখা" "$PM" 'tot30..:true'

echo "── ধাপ-৪: CSV range-সচেতন (রুট+href-ফিক্স এন্ড-টু-এন্ড) ──"
C1=$(curl -s -D /tmp/s241-h1.txt -o /tmp/s241-c1.csv -b "$J" "$BASE/admin/support-center/export.csv?q=Task241-MEDIA&range=7d")
FN1=$(grep -i "content-disposition" /tmp/s241-h1.txt | grep -o 'filename="[^"]*"' | head -1)
L1=$(($(awk 'END{print NR}' /tmp/s241-c1.csv) - 1))
if echo "$FN1" | grep -q "7d"; then ok "ফাইলনামে range (7d) — $FN1"; else bad "ফাইলনামে range-অনুপস্থিত: $FN1"; fi
if [ "$L1" = "4" ]; then ok "range-ফিল্টার-সচেতন সারি=৪"; else bad "সারি-গণনা (প্রত্যাশা ৪, পাওয়া $L1)"; fi
curl -s -D /tmp/s241-h2.txt -o /tmp/s241-c2.csv -b "$J" "$BASE/admin/support-center/export.csv?q=Task241-MEDIA&media=AUDIO&range=7d" >/dev/null
FN2=$(grep -i "content-disposition" /tmp/s241-h2.txt | grep -o 'filename="[^"]*"' | head -1)
L2=$(($(awk 'END{print NR}' /tmp/s241-c2.csv) - 1))
if echo "$FN2" | grep -q "audio-7d"; then ok "ফাইলনামে media+range (audio-7d)"; else bad "ফাইলনাম audio-7d-অনুপস্থিত: $FN2"; fi
if [ "$L2" = "1" ]; then ok "media-ফিল্টার সারি=১"; else bad "media-ফিল্টার-সারি (প্রত্যাশা ১, পাওয়া $L2)"; fi
curl -s -D /tmp/s241-h3.txt -o /tmp/s241-c3.csv -b "$J" "$BASE/admin/support-center/export.csv?q=Task241-MEDIA" >/dev/null
FN3=$(grep -i "content-disposition" /tmp/s241-h3.txt | grep -o 'filename="[^"]*"' | head -1)
if echo "$FN3" | grep -q "lekhok-support-" && ! echo "$FN3" | grep -q "7d"; then ok "range-শূন্যে ফাইলনাম-পরিষ্কার"; else bad "range-শূন্য-ফাইলনাম অপ্রত্যাশিত: $FN3"; fi

echo "── ধাপ-৫: ডট-ব্যাজ (ফিল্টার-সক্রিয়ে দৃশ্যমান) ──"
agent-browser open "$BASE/admin/support-center?status=PENDING" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-mediabar-track')?'MB-OK':'loading'" "MB-OK" >/dev/null
DOT=$(ev "(function(){ return JSON.stringify({ dot:!!document.querySelector('.sc-csv-dot'), title:(document.querySelector('a[href*=export]')||{getAttribute:function(){return '';}}).getAttribute('title').indexOf('স্ট্যাটাস')>=0 }); })()" 2>/dev/null)
contains "ফিল্টার-সক্রিয়ে ডট-ব্যাজ দৃশ্যমান" "$DOT" 'dot..:true'
contains "CSV-টাইটেলে স্ট্যাটাস-উল্লেখ" "$DOT" 'title..:true'

echo "── ধাপ-৬: খালি-অবস্থা (cleanup → q=TAG → mtotal=0) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
CD=$(node "$APP/tests/s241-seed-media.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: পুনঃবুট ব্যর্থ"; exit 1; }
agent-browser open "$BASE/admin/support-center?q=Task241-MEDIA" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-mediabar-track')?'MB-OK':'loading'" "MB-OK" >/dev/null
installErrs
EM=$(ev "(function(){ var el=document.querySelector('.sc-mediabar-track'); var none=!!document.querySelector('.sc-mb-none'); var seg=document.querySelectorAll('.sc-mb').length; return JSON.stringify({ total:+el.getAttribute('data-mtotal'), none:none, seg:seg }); })()" 2>/dev/null)
contains "খালি-অবস্থা mtotal=0" "$EM" 'total..:0'
contains "খালি-অবস্থা সেগমেন্ট-শূন্য + none-ফলব্যাক" "$EM" 'none..:true'
contains "সেগমেন্ট-গণনা শূন্য" "$EM" 'seg..:0'

echo "── ধাপ-৭: কনসোল + 390px + স্ক্রিনশট ──"
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
sleep 1.5
pollst "!!document.querySelector('.sc-mediabar-track')?'MB-OK':'loading'" "MB-OK" >/dev/null
installErrs
agent-browser screenshot "$APP/download/s241-media-desk.png" >/dev/null 2>&1
sleep 1
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HW=''; for i in 1 2 3; do # s235-হার্ডেনিং — MOB-রিট্রাই ×৩
  HW=$(ev "JSON.stringify({h:(function(){var d=document.documentElement;return d.scrollWidth<=window.innerWidth+1;})()})" 2>/dev/null)
  echo "$HW" | grep -q 'h..:true' && break
  sleep 0.5
done
contains "390px অনুভূমিক-ওভারফ্লো-শূন্য" "$HW" 'h..:true'
agent-browser screenshot "$APP/download/s241-media-mobile390.png" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-শেষ: চূড়ান্ত-পরিষ্কার + pkill ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J" /tmp/s241-h1.txt /tmp/s241-h2.txt /tmp/s241-h3.txt /tmp/s241-c1.csv /tmp/s241-c2.csv /tmp/s241-c3.csv
node "$APP/tests/s241-seed-media.js" cleanup 2>&1 | grep -q "CLEANUP-COUNT=0" && echo "CLEANUP-COUNT=0 (TAG Task241-MEDIA জঞ্জাল-শূন্য; CSV-টেম্প-ফাইল-বিলোপ)" || echo "CLEANUP-WARN"

echo ""
echo "s241-media-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "HAS-FAILURES"
