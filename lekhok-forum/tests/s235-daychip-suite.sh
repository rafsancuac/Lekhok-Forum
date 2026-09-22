#!/bin/bash
# s235-daychip-suite.sh — session235 সাপোর্ট-ডেস্ক সুইট (স্থায়ী — রিপো-কমিটেড; s234/s233-ইনফ্রা-পুনঃব্যবহার)
# কভারেজ: dayLabels মাইক্রো-টুলটিপ (data-days EJS-এক-উৎস ×৬-হোস্ট; মিনি-বারে data-d/data-v/data-u হুক;
#          দিন-চিপ .sc-tip-daychip = সিবলিং-এলিমেন্ট-প্যাটার্ন — wklbl-textContent-চুক্তি অক্ষুণ্ণ;
#          hover/mouseout/relatedTarget-গার্ড + ট্যাপে stopPropagation-স্থায়িত্ব + দিন-চিপে-পুনঃক্ল্যাম্প) + 390px + কনসোল
# চুক্তি: ① ফাইল-লেভেল-DB-এডিট সার্ভার-বন্ধ-অবস্থায় (s231-seed-undo.js পুনঃব্যবহার — TAG Task231-UNDO)
#         ② রিপার-চুক্তি — পুরো-সুইট এক-টুল-কলে ③ CSRF-লগইন admin/admin123 (লোকাল-সিড)
# গোটচা-সম্মতি (PLANS session231-235-নোট): eval-IIFE })()-ইনভোকেড · কোট-এস্কেপ-দ্বি-স্তর (k..: + ..ভ্যালু) ·
#         grep-BRE-ব্র্যাকেট-এস্কেপ (\[data-on=\"1\"\]) · সিনথেটিক-mouseover-স্থায়িত্ব (MutationObserver-অপ্রয়োজনীয় —
#         দিন-চিপ data-on-অ্যাট্রিবিউট-স্টেট রাখে) · LEKHOK_ROOT-সেমান্টিক্স=রিপো-রুট
set -u
ROOT="${LEKHOK_ROOT:-/home/z/lekhok-forum/lekhok-forum}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
assert(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (প্রত্যাশা=$2 প্রাপ্ত=$3)"; fi; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s235-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }

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
DA=$(echo "$DESK" | grep -o 'data-days="' | wc -l | tr -d ' ')
assert "data-days-হুক ৬-হোস্ট (৪-স্পার্ক+২-ট্রেন্ড)" "6" "$DA"
contains "data-days dayLabels-CSV (সেপ-লেবেল)" "$DESK" 'data-days="[^"]*সেপ,'
contains "দিন-চিপ-CSS (.sc-tip-daychip)" "$DESK" '\.sc-tip-daychip{'
contains "দিন-চিপ-on-গেট (\[data-on=\"1\"\]-এস্কেপ-সম্মত)" "$DESK" '\.sc-tip-daychip\[data-on="1"\]'
contains "মিনি-বার-hover-উজ্জ্বলতা" "$DESK" '\.sc-tip-strip i:hover'
contains "টাচ-হিট-বর্ধন (hover:none)" "$DESK" '(hover:none){.sc-tip-strip i{position:relative}'
contains "reduced-motion-নিরাপদ (strip-transition)" "$DESK" 'reduce){#scSparkTip{transition:none}#scSparkTipWk{transition:none}\.sc-tip-strip i{transition:none}'
BA=$(echo "$DESK" | grep -o 'data-bars="' | wc -l | tr -d ' ')
assert "রিগ্রেশন: data-bars ৬-হোস্ট অক্ষুণ্ণ" "6" "$BA"
WK=$(echo "$DESK" | grep -o 'data-wk="' | wc -l | tr -d ' ')
assert "রিগ্রেশন: data-wk ৬-হোস্ট অক্ষুণ্ণ" "6" "$WK"

echo "── ধাপ-২: ব্রাউজার-সেশন (রোবাস্ট-লগইন retry-চুক্তি) ──"
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
agent-browser open "$BASE/admin/support-center" >/dev/null 2>&1
pollst "!!document.querySelector('.sc-kpis')?'KPI-OK':'loading'" "KPI-OK" >/dev/null && ok "ডেস্ক-লোড (KPI-গ্রুপ)" || bad "ডেস্ক-লোড"
sleep 0.7

echo "── ধাপ-৩: দিন-চিপ-চক্র (hover→daychip→mouseout→reenter→tap-স্থায়িত্ব→বাইরে-বন্ধ) ──"
# গোটচা-সম্মত (s235-প্রথম-রানে-ধরা): মান-যাচাই JS-এ — grep-বাংলা-[০-৯]-range = Invalid collation মিথ্যা-নেগেটিভ;
# eval-JSON কোট-এস্কেপড → মান-অগ্রাহ্য — JS-বুলিয়ান ok..:true-ই শেল-অ্যাসার্ট
HOVER=$(ev "(function(){ var k=document.querySelector('.k-spark i[data-d]'); if(!k)return 'no-bar'; k.dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); var c=document.getElementById('scSparkTipWk'); var m=c.querySelectorAll('.sc-tip-strip i'); if(m.length!==7)return 'mini-'+m.length; var b=m[1]; b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); var dc=c.querySelector('.sc-tip-daychip'); var md=b.getAttribute('data-d'),mv=b.getAttribute('data-v'),mu=b.getAttribute('data-u'); var bnRe=/^[০-৯]+$/; var exp=md+' — '+mv+' '+mu; return JSON.stringify({ok:(bnRe.test(mv)&&mu==='টি'&&dc.getAttribute('data-on')==='1'&&dc.textContent===exp&&m[0].getAttribute('data-d')!==md&&c.querySelector('.sc-tip-wklbl').textContent.length>0),md:md,mv:mv,txt:dc.textContent}); })()")
contains "মিনি-বার+দিন-চিপ-কাঠামো (JS-যাচাই: bnJs-বাংলা-অঙ্ক+unit+on+ফরম্যাট+label)" "$HOVER" 'ok..:true'
contains "দিন-চিপ-টেক্সট-উপস্থিত" "$HOVER" 'txt..:..'
CYC=$(ev "(function(){ var c=document.getElementById('scSparkTipWk'); var m=c.querySelectorAll('.sc-tip-strip i'); var dc=c.querySelector('.sc-tip-daychip'); var r={}; m[1].dispatchEvent(new MouseEvent('mouseout',{bubbles:true})); r.out1=(dc.getAttribute('data-on')===null); m[3].dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); r.reOn=(dc.getAttribute('data-on')==='1'); r.reTxt=dc.textContent; m[3].dispatchEvent(new MouseEvent('click',{bubbles:true})); r.chipTap=(c.getAttribute('data-on')==='1'); r.dayTap=(dc.getAttribute('data-on')==='1'); document.body.dispatchEvent(new MouseEvent('click',{bubbles:true})); r.chipOut=(c.getAttribute('data-on')===null); r.dayOut=(dc.getAttribute('data-on')===null); r.tipOut=(document.getElementById('scSparkTip').getAttribute('data-on')===null); r.ok=r.out1&&r.reOn&&r.chipTap&&r.dayTap&&r.chipOut&&r.dayOut&&r.tipOut; return JSON.stringify(r); })()")
contains "mouseout→লুকায় + reenter→নতুন-দিন + tap→stopPropagation-স্থায়িত্ব + বাইরে-বন্ধ (JS-যাচাই)" "$CYC" 'ok..:true'
contains "reenter-দিন-চিপ-টেক্সট-উপস্থিত" "$CYC" 'reTxt..:..'
contains "বাইরে-ক্লিক→chip-বন্ধ (chipOut..true)" "$CYC" 'chipOut..:true'
contains "বাইরে-ক্লিক→daychip-স্টেট-পরিষ্কার (dayOut..true)" "$CYC" 'dayOut..:true'

echo "── ধাপ-৪: দিন-চিপ-পুনঃক্ল্যাম্প (প্রান্ত-বারে) + 390px + কনসোল ──"
CL=$(ev "(function(){ var t=document.querySelectorAll('.sc-trend-bars span.today')[0]||document.querySelector('.sc-trend-bars span'); if(!t)return 'no-trend'; t.dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); var c=document.getElementById('scSparkTipWk'); var m=c.querySelectorAll('.sc-tip-strip i'); m[0].dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); var r=c.getBoundingClientRect(); var okl=r.left>=-1&&r.right<=window.innerWidth+1; t.dispatchEvent(new MouseEvent('mouseout',{bubbles:true})); return JSON.stringify({l:Math.round(r.left),rt:Math.round(r.right),w:window.innerWidth,ok:okl}); })()")
contains "দিন-চিপে-পুনঃক্ল্যাম্প (ভিউপোর্টের-ভিতরে)" "$CL" 'ok..:true'
MOB=$(ev "(function(){ var m=window.matchMedia('(max-width:640px)'); if(m.matches) return 'mobile-view'; var css=''; for (var i=0;i<document.styleSheets.length;i++){ try{ var rs=document.styleSheets[i].cssRules; for (var j=0;j<rs.length;j++){ if (rs[j].media && rs[j].conditionText && rs[j].conditionText.indexOf('640')>=0){ css+=rs[j].cssRules.length; } } }catch(_){} } return 'css-rules:'+css; })()")
contains "640px-দিন-চিপ-সংকোচন-নিয়ম-উপস্থিত" "$MOB" 'css-rules:[1-9]'
CONS=$(ev "(function(){ return JSON.stringify({errs:(window.__scErrs||[]).length}); })()")
contains "কনসোল-ত্রুটি-শূন্য" "$CONS" 'errs..:0'

echo "── ধাপ-শেষ: pkill (SIGTERM-সেভ) + ফাইল-ক্লিনআপ ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1
rm -f "$J"
echo "CLEANUP-COUNT=0"
echo ""
echo "s235-daychip-suite: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && exit 0 || exit 1
