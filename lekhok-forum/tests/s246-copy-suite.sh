#!/bin/bash
# s246-copy-suite.sh — session246 কার্ড-রিপোর্ট-কপি + কার্ড-হোভার/স্ক্রলবার সুইট (স্থায়ী — রিপো-কমিটেড; s243-সিড-পুনঃব্যবহার)
# কভারেজ: ① কাঠামো (data-card-copy মার্কআপ + .sc-cp CSS ×৩ + cardReportText + বাইন্ডিং + QA-হুক + সহায়িকা-সারি + G4-ব্যাজ ১৭-২৫)
#          ② রেন্ডার-প্রমাণ (কপি-বাটন-গণনা = কার্ড-গণনা; বাটন-ইন-কার্ড-হেড)
#          ③ আচরণ (ক্লিক → টোস্ট 'রিপোর্ট #ID কপি হয়েছে ✓' + বাটন sc-cp-ok + আইকন fa-circle-check-সোয়াপ; কার্ড-হোভার-স্টাইল-রুল)
#          ④ কনসোল-শূন্য + 390px + সিড-জঞ্জাল-শূন্য
# চুক্তি: ① সিড = s243-seed-video.js পুনঃব্যবহার (TAG Task243-VIDEO ×৬; সার্ভার-বন্ধে-seed) ② CSRF-লগইন admin/admin123
#         ③ eval-প্যাটার্ন: বুলিয়ান k..:true, সংখ্যা k..:N, স্ট্রিং k..:..v (session241-টেবিল) ④ clipboard-বিষয়বস্তু-অ্যাসার্ট = headless-অবিশ্বস্ত → toast+class-প্রক্সি
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s246-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
installErrs(){ ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null 2>&1; }
TAG='Task243-VIDEO'

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধে-seed → বুট → লগইন) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/tests/s243-seed-video.js" seed 2>&1)
if echo "$SD" | grep -q "SEED-COUNT=6"; then ok "সিড ×৬ (s243-seed পুনঃব্যবহার)"; else bad "সিড-ব্যর্থ: $SD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/admin/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=admin&password=admin123&_csrf=$CSRF" "$BASE/admin/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (সোর্স-ফাইল) ──"
SRC=$(cat "$APP/admin/views/admin/support-center.ejs")
contains "কপি-বাটন মার্কআপ" "$SRC" 'data-card-copy data-id'
contains "cardReportText ফাংশন" "$SRC" 'function cardReportText'
contains "বাইন্ডিং data-card-copy" "$SRC" "querySelectorAll('\\[data-card-copy\\]')"
contains "stopPropagation (লাইটবক্স/নির্বাচন-অক্ষুণ্ণ)" "$SRC" 'ev.stopPropagation()'
contains "toast সফল-ফরম্যাট" "$SRC" 'কপি হয়েছে ✓'
contains "CSS .sc-cp" "$SRC" '.sc-cp{'
contains "CSS সফল-ফিডব্যাক" "$SRC" '.sc-cp.sc-cp-ok{'
contains "CSS কার্ড-হোভার" "$SRC" '.sc-card:hover{border-color:var(--ad-accent-ring)'
contains "CSS স্ক্রলবার" "$SRC" '::-webkit-scrollbar-thumb{background:var(--ad-line)'
contains "QA-হুক cardCopy" "$SRC" '__scQA.cardCopy'
contains "সহায়িকা-সারি কপি" "$SRC" 'কার্ডে কপি-বাটন — রিপোর্ট-তথ্য ক্লিপবোর্ডে'
contains "G4-ব্যাজ আপডেট ১৭-২৫" "$SRC" 'মাউস-ও-টাচ <span class="sc-hg-n">১৭-২৫</span>'

echo "── ধাপ-২: রেন্ডার-প্রমাণ ──"
D=$(curl -s -b "$J" "$BASE/admin/support-center?q=$TAG")
contains "রেন্ডারে কপি-বাটন" "$D" 'data-card-copy'
CC=$(echo "$D" | grep -o 'class="sc-card ' | wc -l)
BC=$(echo "$D" | grep -o 'data-card-copy data-id' | wc -l)
if [ "$BC" = "$CC" ] && [ "$BC" != "0" ]; then ok "কপি-বাটন ×$BC = কার্ড ×$CC (১:১)"; else bad "বাটন/কার্ড-অমিল (বাটন $BC, কার্ড $CC)"; fi
contains "aria-label প্রতি-কার্ড" "$D" 'aria-label="রিপোর্ট #'

echo "── ধাপ-৩: আচরণ (ব্রাউজার — ক্লিক-কপি) ──"
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
pollst "!!window.__scQA?'QA-OK':'loading'" "QA-OK" >/dev/null && ok "ডেস্ক-লোড (q=TAG)" || bad "ডেস্ক-লোড"
installErrs
HK=$(ev "(function(){ var h=window.__scQA.cardCopy(); return JSON.stringify({ buttons:h.buttons, has:h.preview!=null, id:h.preview&&h.preview.indexOf('#')>-1 }); })()" 2>/dev/null)
contains "হুক buttons≥৬" "$HK" 'buttons..:6'
contains "হুক preview-র #ID" "$HK" 'id..:true'
# ক্লিক → টোস্ট + সফল-স্টেট
CID=$(ev "document.querySelector('[data-card-copy]').getAttribute('data-id')" 2>/dev/null | tr -d '"')
ev "(function(){ window.__s246clip=null; var cp=navigator.clipboard; if(cp&&cp.writeText){ window.__s246ow=cp.writeText.bind(cp); cp.writeText=function(t){ window.__s246clip=t; return Promise.resolve(); }; } document.querySelector('[data-card-copy]').click(); return 'armed+clicked'; })()" >/dev/null 2>&1; sleep 0.7
CL=$(ev "JSON.stringify({ has:!!window.__s246clip, head:window.__s246clip?window.__s246clip.slice(0,16):'', who:window.__s246clip?window.__s246clip.indexOf('প্রেরক:')>-1:false, id:window.__s246clip?window.__s246clip.indexOf('▪ রিপোর্ট #')==0:false })" 2>/dev/null)
contains "স্টাব-ক্যাপচার (আসল-বিষয়বস্তু)" "$CL" 'has..:true'
contains "ক্যাপচারে '▪ রিপোর্ট #' প্রেফিক্স" "$CL" 'id..:true'
contains "ক্যাপচারে প্রেরক-ফিল্ড" "$CL" 'who..:true'
TT=$(ev "(function(){ var t=document.getElementById('scToast'); return JSON.stringify({ shown:!!t&&t.classList.contains('show'), text:t?t.textContent:'' }); })()" 2>/dev/null)
contains "টোস্ট 'রিপোর্ট #ID কপি হয়েছে'" "$TT" "রিপোর্ট #$CID কপি হয়েছে"
ST=$(ev "(function(){ var b=document.querySelector('[data-card-copy]'); return JSON.stringify({ ok:b.classList.contains('sc-cp-ok'), icon:b.querySelector('i').className.indexOf('fa-circle-check')>-1 }); })()" 2>/dev/null)
contains "বাটন sc-cp-ok" "$ST" 'ok..:true'
contains "আইকন fa-circle-check-সোয়াপ" "$ST" 'icon..:true'
ev "(function(){ var cp=navigator.clipboard; if(cp&&window.__s246ow) cp.writeText=window.__s246ow; return 'override-restored'; })()" >/dev/null 2>&1
sleep 1.6
ST2=$(ev "(function(){ var b=document.querySelector('[data-card-copy]'); return JSON.stringify({ restored:!b.classList.contains('sc-cp-ok') }); })()" 2>/dev/null)
contains "১.৬সে-পরে বাটন-পুনঃস্থাপন" "$ST2" 'restored..:true'

echo "── ধাপ-৪: কনসোল-শূন্য + 390px ──"
ER=$(ev "JSON.stringify({ n:(window.__scErrs||[]).length })" 2>/dev/null)
contains "কনসোল-ত্রুটি-শূন্য" "$ER" 'n..:0'
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.8
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
contains "390px hScroll-শূন্য" "$HS" 'h..:false'

echo "── ধাপ-৫: সিড-cleanup ──"
CD=$(node "$APP/tests/s243-seed-video.js" cleanup 2>&1)
if echo "$CD" | grep -q "CLEANUP-COUNT=0"; then ok "সিড-cleanup (TAG জঞ্জাল-শূন্য)"; else bad "cleanup ব্যর্থ: $CD"; fi

echo ""
echo "s246-copy-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "SOME-FAILED"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
