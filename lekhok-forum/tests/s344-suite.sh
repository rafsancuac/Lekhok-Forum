#!/bin/bash
# s344-suite.sh — session344: hr344 getHints('all')-সর্ব-মোড-শর্টহ্যান্ড + .hr344-bar/.hr344-abtn/.hr344-chip সর্ব-মোড-রপ্তাই-বার + sfs344 স্টাইল
# [Task ID 181] PLANS session343-নোটের প্রস্তাব-②-প্রথম-বিকল্প প্রয়োগ (hr342-চুক্তি-প্রসারিত):
#   hr344 (admin/home-reorder.ejs — শেয়ার্ড-IIFE-অভ্যন্তরে-সম্প্রসারণ — সহাবস্থান-রীতি):
#     getHints('all') (getHintsOrig344-চেইন-রীতি — hr342-চুক্তি-প্রসারিত): q333h.getHints('all') =
#       getHints(MODES344.slice(0))-এক-উৎস-প্রতিনিধি — batch-MODES342-সমতুল্য (দ্বি-পথ-সমতা {আকৃতি+ক্রম+
#       স্ন্যাপশট+getmb-কাউন্টার-ডেল্টা-সমতা} — অনুলিপি-লজিক-শূন্য); অ-'all'-ইনপুট = প্রতিনিধি-অটুট (অ্যারে =
#       hr342; স্ট্রিং-মোড = hr341 — 'all'-ব্যতীত; মিথ্যা=RAW/সত্য=বর্তমান-মোডে = hr340; অবৈধ-স্ট্রিং =
#       getm:invalid-অটুট — hr341/hr342-কাউন্টার-'all'-পথে-অস্পৃশ্য); প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট।
#     সর্ব-মোড-রপ্তাই-বার .hr344-bar + .hr344-abtn + কী-গণনা-চিপ .hr344-chip (স্বতন্ত্র-শ্রেণি-ত্রয়ী —
#       s326-.hr326-fmt-রীতি — .hr324-btn-গণনা-চুক্তি-অটুট): স্বতন্ত্র-বার .hr324-bar.hr344-bar (hr342-বার-রীতি);
#       নির্মাণ = trOrig344-চেইন (hr343-পরে); গেট = বার-পরিবার-দৃশ্যমানতা (hist317.length ≥১ ∨ storeN339() ≥১ —
#       শূন্য-অবস্থায় নীরব); ডুপ-রক্ষা + পরিবার-শূন্যে-নিজস্ব-বার-সিঙ্ক-অপসারণ (ensureAll344 এক-উৎস — চতুর্মোড়ক-
#       জীবন্ত-সিঙ্ক: trOrig344-চেইন + persist337-মোড়ক + q337h.clearStore-মোড়ক + cycleFmt326-মোড়ক — রি-রেন্ডার-
#       বিহীন — ৫ম-MO-নিষিদ্ধ-চুক্তি-অটুট MO=৪); চিপ = প্রতি-সিঙ্কে getHints('all')-পাঠে-তাজা-কী-গণনা
#       (syncChip344-এক-উৎস — bn317a-বাংলা-সংখ্যা — aria-hidden-চাক্ষুষ-কেবল); বাটন-কপি = getHints('all') →
#       JSON.stringify(…, null, 2) — রেকর্ড-বিহীন (copyHist324-রীতি — ইতিহাস-গণনা-দূষণ-শূন্য) + টোস্ট +
#       .hr344-done-ফ্ল্যাশ (১.২s); কীবোর্ড-parity ইচ্ছাকৃত-অনুপস্থিত (পয়েন্টার-কেবল — hr339…hr342-উত্তরাধিকার)।
#   sfs344 (ইনলাইন-<style> session344-ব্লক — cascade session343-পরে — হেক্স-শূন্য rgba-only):
#     অ্যাম্বার-পরিবার = সর্ব-মোড-শর্টহ্যান্ড-সংকেত (নীল-রিড/বেগুনি-মোড/টিল-ব্যাচ/সবুজ-সম্পাদনা/লাল-ধ্বংসাত্মক-
#     পরিবার-বিভাজন-বৃদ্ধি — all-সংকেত); solid-বর্ডার-বাটন + dashed-চিপ (নির্দেশক-নিষ্ক্রিয়-অর্থবিদ্যা) +
#     hover/focus-visible + :active scale(0.97) + .hr344-done-ফ্ল্যাশ + prefers-reduced-motion + ≤640px-কম্প্যাক্ট
#     (চিপ max-width 116px-এলিপসিস); নতুন-উপাদান-স্টাইল-কেবল — বিদ্যমান-উপাদান-অস্পৃশ্য — MO=৪-অটুট।
# চুক্তি: অবজেক্ট-মোড়ানো-eval (s313) + বেয়ার-এক্সপ্রেশন-রিটার্ন (s325) + হেক্স-শূন্য + কাউন্টার-ডেল্টা-assert
#         (s336-গোটচা — পরম-assert-নিষিদ্ধ) + পরিষ্কারণ-চুক্তি (hr337-hints + hr326-fmt + hr321-hist) +
#         কনসোল-কাউন্টার-পুনঃআর্ম-রীতি (rld-পুনঃআর্ম — রিলোডে-উইন্ডো-রিসেট)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_SET=/home/z/my-project/download/s344-allbar-desk.png
SH_MOB=/home/z/my-project/download/s344-allbar-mobile390.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
unjj(){ printf '%s' "$1" | sed 's/^"//; s/"$//; s/\\"/"/g'; }
jf(){ printf '%s' "$2" | python3 -c "
import sys, json
d = json.load(sys.stdin)
v = d.get(sys.argv[1], '')
if isinstance(v, bool): v = 'true' if v else 'false'
print(v)" "$1" 2>/dev/null; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
bopen(){
  local i u
  for i in 1 2 3 4 5; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then agent-browser reload >/dev/null 2>&1; return 0; fi
    sleep 1
  done
  agent-browser close --all >/dev/null 2>&1
  sleep 1
  for i in 1 2 3; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  return 1
}
rld(){ agent-browser reload >/dev/null 2>&1; agent-browser wait 1400 >/dev/null 2>&1; arm; }
arm(){ ev "JSON.stringify((function(){if(!window.__s344console){window.__s344console=0;var oe=console.error;console.error=function(){window.__s344console=(window.__s344console||0)+1;try{oe.apply(console,arguments)}catch(e){}}}return 'arm'})())" >/dev/null 2>&1; }
opentip(){ ev "JSON.stringify((function(){var rs=[].slice.call(document.querySelectorAll('#hrSectionList .hr-sec-row'));var t=rs.filter(function(r){return r.textContent.indexOf('USER_FEED')>=0})[0];if(t)t.click();return 'r1'})())" >/dev/null 2>&1
  agent-browser wait 500 >/dev/null 2>&1
  ev "JSON.stringify((function(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].focus();return 'r2'})())" >/dev/null 2>&1
  agent-browser wait 400 >/dev/null 2>&1; }
EJSF=$APP/admin/views/admin/home-reorder.ejs

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
if curl -s -o /dev/null -m 2 "$BASE/"; then pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s344-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s344-migrate.log)"
(cd "$APP" && node scripts/s307-seed-feed.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s307-মার্কার-সিড (idempotent)" || bad "s307-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট (8094)" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (hr344+sfs344-ব্লক-মার্কার + সিনট্যাক্স + হেক্স-শূন্য + রেজিস্ট্রি-মিরর) ──"
HN=$(grep -c 'hr344' "$EJSF" | tr -d ' ')
if [ "$HN" -ge 10 ]; then ok "home-reorder.ejs: hr344-রেফারেন্স-লাইন ×$HN (হুক+বার+চিপ+স্টাইল-সহাবস্থান)"; else bad "hr344-রেফারেন্স-অপ্রতুল ($HN)"; fi
A344CHK=$(python3 - "$EJSF" <<'PYEOF'
import re, subprocess, tempfile, os, sys
src = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"<script>(.*?)</script>", src, re.S)
for b in blocks:
    b2 = re.sub(r"<%[^%]*%>", "null", b)
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(b2); p = f.name
    r = subprocess.run(["node","--check",p], capture_output=True, text=True)
    os.unlink(p)
    if r.returncode != 0:
        print("FAIL:" + r.stderr[:200]); sys.exit()
print("OK")
PYEOF
)
if [ "$A344CHK" = "OK" ]; then ok "home-reorder.ejs: স্ক্রিপ্ট-ব্লক node --check OK (EJS-placeholder — hr344-সহ)"; else bad "home-reorder.ejs: স্ক্রিপ্ট-সিনট্যাক্স-ব্যর্থ"; fi
CSS344=$(sed -n '/session344 (sfs344 সর্ব-মোড-শর্টহ্যান্ড-রপ্তাই — admin-ইনলাইন)/,/EOF session344/p' "$EJSF")
HEXN=$(printf '%s' "$CSS344" | grep -cE '#[0-9a-fA-F]{3,8}' | tr -d ' ')
if [ "$HEXN" = "0" ] && [ -n "$CSS344" ]; then ok "home-reorder.ejs: session344-ইনলাইন-ব্লক হেক্স-শূন্য (rgba-only — guard:design-সম্মত)"; else bad "session344-ব্লক-হেক্স-লব্ধ ($HEXN)"; fi
BN=$(printf '%s' "$CSS344" | grep -c 'session344' | tr -d ' ')
if [ "$BN" -ge 2 ]; then ok "home-reorder.ejs: session344-ব্লক-মার্কার ×২ (হেডার+EOF — admin-ইনলাইন-<style> — গার্ড-প্রথা)"; else bad "session344-মার্কার ×$BN (<২)"; fi
C344AFTER=$(grep -n 'EOF session344' "$EJSF" | head -1 | cut -d: -f1)
C343BEFORE=$(grep -n 'EOF session343' "$EJSF" | head -1 | cut -d: -f1)
if [ -n "$C344AFTER" ] && [ -n "$C343BEFORE" ] && [ "$C344AFTER" -gt "$C343BEFORE" ]; then ok "home-reorder.ejs: cascade-অবস্থান (session344-ব্লক session343-ব্লক-পরে — ক্যাসকেড-চুক্তি)"; else bad "cascade-অবস্থান-ব্যর্থ (344@$C344AFTER vs 343@$C343BEFORE)"; fi
B344=$(grep -c 'session344' "$APP/public/assets/css/style.css" | tr -d ' ')
B343=$(grep -c 'session343' "$APP/public/assets/css/style.css" | tr -d ' ')
B342=$(grep -c 'session342' "$APP/public/assets/css/style.css" | tr -d ' ')
GOODCSS=$(grep -c 'session334' "$APP/public/assets/css/style.css" | tr -d ' ')
if [ "$B344" = "0" ] && [ "$B343" = "0" ] && [ "$B342" = "0" ] && [ "$GOODCSS" = "2" ]; then ok "style.css: session344/343/342-শূন্য (admin-CSS-চুক্তি — গোটচা-অলোড-প্রমাণ) + session334 ×২-অটুট"; else bad "style.css-চুক্তি-ব্যর্থ (344=$B344 343=$B343 342=$B342 334=$GOODCSS)"; fi
AB=$(grep -c 'hr344-abtn' "$EJSF" | tr -d ' ')
CH=$(grep -c 'hr344-chip' "$EJSF" | tr -d ' ')
if [ "$AB" -ge 3 ] && [ "$CH" -ge 3 ]; then ok "hr344-abtn ×$AB + hr344-chip ×$CH-শ্রেণি-রেফারেন্স (নির্মাণ+স্টাইল+হুক)"; else bad "শ্রেণি-রেফারেন্স-অপ্রতুল (abtn=$AB chip=$CH)"; fi
MODREG=$(grep -c "MODES344 = \['rich', 'key', 'json'\]" "$EJSF" | tr -d ' ')
if [ "$MODREG" = "1" ]; then ok "MODES344-ত্রি-মোড-রেজিস্ট্রি-মিরর (MODES342/341-সমতুল্য — এক-সংজ্ঞা)"; else bad "MODES344-রেজিস্ট্রি-অমিল ($MODREG)"; fi

echo "── ধাপ-২: SSR (হোম-200 + style.css-200 + admin-গেট) ──"
HC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC" = "200" ]; then ok "SSR: হোম-200"; else bad "হোম-$HC"; fi
SCC=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/assets/css/style.css")
if [ "$SCC" = "200" ]; then ok "SSR: style.css-200"; else bad "style.css-$SCC"; fi
AG=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")
if [ "$AG" = "302" ] || [ "$AG" = "307" ]; then ok "SSR: admin-গেট ($AG — লগইন-রিডাইরেক্ট)"; else bad "admin-গেট-$AG"; fi

echo "── ধাপ-৩: hr344-ই২ই (all-শর্টহ্যান্ড + দ্বি-পথ-সমতা + চিপ + রপ্তাই + জীবন্ত-সিঙ্ক) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
agent-browser wait 800 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr321-hist');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr327-pv');sessionStorage.removeItem('hr337-hints')}catch(e){};return 'clr'})())" >/dev/null 2>&1
CT=$(unjj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){var x=new XMLHttpRequest();x.open('POST','/admin/login',false);x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');x.send('username=testadmin&password=demo123&_csrf=$CT');return x.status})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 200|302|303|0|"") ok "ব্রাউজার XHR-লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/admin/home-reorder" || bad "home-reorder-open-ব্যর্থ"
agent-browser wait 1200 >/dev/null 2>&1
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints')}catch(e){};return 'c0'})())" >/dev/null 2>&1
rld
Q0=$(ev "JSON.stringify({q:!!window.__hrAria344QA,ga:window.__hrAria344QA?window.__hrAria344QA.getall:-1,cp:window.__hrAria344QA?window.__hrAria344QA.copies:-1,br:window.__hrAria344QA?window.__hrAria344QA.bar():null,ab:window.__hrAria344QA?window.__hrAria344QA.abtn():null,chn:window.__hrAria344QA?window.__hrAria344QA.chip():'',q343:!!window.__hrAria343QA,q342:!!window.__hrAria342QA,q341:!!window.__hrAria341QA,q340:!!window.__hrAria340QA,q339:!!window.__hrAria339QA,q338:!!window.__hrAria338QA,q337:!!window.__hrAria337QA,q336:!!window.__hrAria336QA,q335:!!window.__hrAria335QA,q334:!!window.__hrAria334QA,q333:!!window.__hrAria333QA,e:((window.__hrAria344QA||{}).err||'')})")
Q0J=$(unjj "$Q0")
if [ "$(jf q "$Q0J")" = "true" ] && [ "$(jf ga "$Q0J")" = "0" ] && [ "$(jf cp "$Q0J")" = "0" ] && [ "$(jf br "$Q0J")" = "false" ] && [ "$(jf ab "$Q0J")" = "false" ] && [ "$(jf chn "$Q0J")" = "" ] && [ "$(jf q343 "$Q0J")" = "true" ] && [ "$(jf q342 "$Q0J")" = "true" ] && [ "$(jf q341 "$Q0J")" = "true" ] && [ "$(jf q340 "$Q0J")" = "true" ] && [ "$(jf q339 "$Q0J")" = "true" ] && [ "$(jf q338 "$Q0J")" = "true" ] && [ "$(jf q337 "$Q0J")" = "true" ] && [ "$(jf q336 "$Q0J")" = "true" ] && [ "$(jf q335 "$Q0J")" = "true" ] && [ "$(jf q334 "$Q0J")" = "true" ] && [ "$(jf q333 "$Q0J")" = "true" ] && [ "$(jf e "$Q0J")" = "" ]; then ok "ই২ই: __hrAria344QA-হুক (কাউন্টার=০ + বার/বাটন/চিপ-অনুপস্থিত — শূন্য-পরিবার-গেট) + s343–s333-সহাবস্থান"; else bad "ই২ই: $(unjj "$Q0")"; fi
A1=$(ev "JSON.stringify((function(){var g0=window.__hrAria344QA.getall,mb0=window.__hrAria342QA.getmb;var a=window.__hrAria344QA.all();var mb1=window.__hrAria342QA.getmb;var raw=window.__hrAria340QA.raw();var b=window.__hrAria342QA.batch(['rich','key','json']);var k=[];for(var m in a){if(Object.prototype.hasOwnProperty.call(a,m))k.push(m)}return{ga:window.__hrAria344QA.getall-g0,mb1:mb1-mb0,mb2:window.__hrAria342QA.getmb-mb1,eq:JSON.stringify(a)===JSON.stringify(b),ord:k.join(','),rawF:raw['F'],modeF:a.rich?a.rich['F']:'',last:window.__hrAria344QA.last}})())")
A1J=$(unjj "$A1")
if [ "$(jf ga "$A1J")" = "1" ] && [ "$(jf mb1 "$A1J")" = "1" ] && [ "$(jf mb2 "$A1J")" = "1" ] && [ "$(jf eq "$A1J")" = "true" ] && [ "$(jf ord "$A1J")" = "rich,key,json" ] && printf '%s' "$(jf rawF "$A1J")" | grep -q '{fmt}' && printf '%s' "$(jf modeF "$A1J")" | grep -q 'সমৃদ্ধ' && printf '%s' "$(jf last "$A1J")" | grep -q 'getall'; then ok "ই২ই: all-শর্টহ্যান্ড-দ্বি-পথ-সমতা (getHints('all') ≡ getHints(['rich','key','json']) — আকৃতি+ক্রম-সমতা + getmb-ডেল্টা-সমতা {প্রতি-পথে ১ — এক-উৎস-প্রতিনিধি-প্রমাণ} + RAW='{fmt}'-অটুট + রিচ-রেজলভড + getall-মার্কার)"; else bad "ই২ই: $(unjj "$A1")"; fi
A2=$(ev "JSON.stringify((function(){var ga0=window.__hrAria344QA.getall,gm0=window.__hrAria341QA.getm,iv0=window.__hrAria341QA.invalids;var rf=window.__hrAria333QA.getHints(false);var rt=window.__hrAria333QA.getHints(true);var rj=window.__hrAria333QA.getHints('json');var rd=window.__hrAria333QA.getHints('desktop');return{gaD:window.__hrAria344QA.getall-ga0,gmD:window.__hrAria341QA.getm-gm0,ivD:window.__hrAria341QA.invalids-iv0,fF:rf['F'],tF:rt['F'],jF:rj['F'],dF:rd['F'],last341:window.__hrAria341QA.last}})())")
A2J=$(unjj "$A2")
if [ "$(jf gaD "$A2J")" = "0" ] && [ "$(jf gmD "$A2J")" = "1" ] && [ "$(jf ivD "$A2J")" = "1" ] && printf '%s' "$(jf fF "$A2J")" | grep -q '{fmt}' && printf '%s' "$(jf tF "$A2J")" | grep -q 'সমৃদ্ধ' && printf '%s' "$(jf jF "$A2J")" | grep -q 'JSON' && printf '%s' "$(jf dF "$A2J")" | grep -q '{fmt}' && printf '%s' "$(jf last341 "$A2J")" | grep -q 'getm:invalid'; then ok "ই২ই: অ-'all'-প্রতিনিধি-অটুট (মিথ্যা=RAW + সত্য=বর্তমান-মোডে-রেজলভড + 'json'=JSON-রেজলভড {getm=১} + 'desktop'=RAW+getm:invalid {getm-অবৃদ্ধি — invalid-পথ-রীতি} — hr341/hr340-অটুট + getall-ডেল্টা=০ — ইন্টারসেপশন-'all'-কেবল)"; else bad "ই২ই: $(unjj "$A2")"; fi
A3=$(ev "JSON.stringify((function(){var rw0=window.__hrAria340QA.raws;var a1=window.__hrAria344QA.all();var a2=window.__hrAria344QA.all();return{eq:JSON.stringify(a1)===JSON.stringify(a2),ref:a1.rich!==a2.rich,rwD:window.__hrAria340QA.raws-rw0}})())")
A3J=$(unjj "$A3")
if [ "$(jf eq "$A3J")" = "true" ] && [ "$(jf ref "$A3J")" = "true" ] && [ "$(jf rwD "$A3J")" = "2" ]; then ok "ই২ই: প্রতি-কলে-নতুন-নেস্টেড-অবজেক্ট (দ্বি-all-কল-গভীর-সমতা + অভ্যন্তরীণ-মানচিত্র-রেফারেন্স-বিচ্ছিন্ন + প্রতি-ব্যাচে-এক-RAW-স্ন্যাপশট {raws-ডেল্টা=২ — অলস-ফেচ-চুক্তি-উত্তরাধিকার})"; else bad "ই২ই: $(unjj "$A3")"; fi
opentip
FG=$(ev "JSON.stringify({tip:!!document.querySelector('.hr317-tip'),br:window.__hrAria344QA.bar(),ab:window.__hrAria344QA.abtn(),chn:window.__hrAria344QA.chip(),s324bar:!!document.querySelector('.hr324-bar'),hist:window.__hrAria317QA.hist().length})")
FGJ=$(unjj "$FG")
if [ "$(jf tip "$FGJ")" = "true" ] && [ "$(jf br "$FGJ")" = "false" ] && [ "$(jf ab "$FGJ")" = "false" ] && [ "$(jf chn "$FGJ")" = "" ] && [ "$(jf s324bar "$FGJ")" = "false" ] && [ "$(jf hist "$FGJ")" = "0" ]; then ok "ই২ই: পরিবার-গেট-দর্শন (খোলা-টিপেও শূন্য-ইতিহাস+শূন্য-স্টোরে বার/বাটন/চিপ-অনুপস্থিত — hr324-দর্শন — fresh-DOM-অপরিবর্তিত)"; else bad "ই২ই: $(unjj "$FG")"; fi
LSY=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৪)');var ab=document.querySelector('.hr344-abtn');var b=ab?ab.parentNode:null;var ch=document.querySelector('.hr344-chip');return{br:window.__hrAria344QA.bar(),ab:window.__hrAria344QA.abtn(),chT:ch?ch.textContent:'',cb:!!document.querySelector('.hr339-clearbtn'),rb:!!document.querySelector('.hr340-resbtn'),ms:!!document.querySelector('.hr341-msel'),mb:!!document.querySelector('.hr341-mbtn'),bb:!!document.querySelector('.hr342-bbtn'),b2:document.querySelectorAll('.hr324-btn').length,st:window.__hrAria339QA.store(),brCls:b?b.className:'',brN:document.querySelectorAll('.hr344-bar').length,last:window.__hrAria344QA.last}})())")
LSYJ=$(unjj "$LSY")
if [ "$(jf br "$LSYJ")" = "true" ] && [ "$(jf ab "$LSYJ")" = "true" ] && [ "$(jf chT "$LSYJ")" = "সমৃদ্ধ ৯ · কেবল-কী ৯ · JSON ৯" ] && [ "$(jf cb "$LSYJ")" = "true" ] && [ "$(jf rb "$LSYJ")" = "true" ] && [ "$(jf ms "$LSYJ")" = "true" ] && [ "$(jf mb "$LSYJ")" = "true" ] && [ "$(jf bb "$LSYJ")" = "true" ] && [ "$(jf b2 "$LSYJ")" = "0" ] && [ "$(jf st "$LSYJ")" = "9" ] && [ "$(jf brCls "$LSYJ")" = "hr324-bar hr344-bar" ] && [ "$(jf brN "$LSYJ")" = "1" ] && printf '%s' "$(jf last "$LSYJ")" | grep -q 'sync:on'; then ok "ই২ই: জীবন্ত-সিঙ্ক-অন (persist337-মোড়ক → বার-রি-রেন্ডার-বিহীন-তাৎক্ষণিক + চিপ-কী-গণনা {সমৃদ্ধ ৯ · কেবল-কী ৯ · JSON ৯ — রেজিস্ট্রি-৯-সারি-সমৃদ্ধ-পূর্ব-স্থিতি — বাংলা-সংখ্যা-এক-উৎস} + hr339/hr340/hr341/hr342-সহাবস্থান + .hr324-btn=০-ইতিহাস-শূন্য-রীতি {s342-LSY-সম-রীতি} + স্বতন্ত্র-বার hr324-bar hr344-bar + ডুপ-শূন্য)"; else bad "ই২ই: $(unjj "$LSY")"; fi
ev "JSON.stringify((function(){if(!window.__cc344set){Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__clipCap344=t;return Promise.resolve()}},configurable:true});window.__cc344set=true}return 'cap'})())" >/dev/null 2>&1
WPO=$(ev "JSON.stringify((function(){window.__hrAria339QA.wipe();return{br:window.__hrAria344QA.bar(),br342:window.__hrAria342QA.bar(),br341:window.__hrAria341QA.bar(),br340:window.__hrAria340QA.bar(),cb:!!document.querySelector('.hr339-clearbtn'),last:window.__hrAria344QA.last,ss:sessionStorage.getItem('hr337-hints')===null}})())")
WPOJ=$(unjj "$WPO")
if [ "$(jf br "$WPOJ")" = "false" ] && [ "$(jf br342 "$WPOJ")" = "false" ] && [ "$(jf br341 "$WPOJ")" = "false" ] && [ "$(jf br340 "$WPOJ")" = "false" ] && [ "$(jf cb "$WPOJ")" = "false" ] && printf '%s' "$(jf last "$WPOJ")" | grep -q 'sync:off' && [ "$(jf ss "$WPOJ")" = "true" ]; then ok "ই২ই: জীবন্ত-সিঙ্ক-অফ (ওয়াইপ → সর্ব-পরিবার-বার-সম্পূর্ণ-অপসারণ {hr344+hr342+hr341+hr340+clearbtn — ইতিহাস-শূন্য-রীতিতে} + sync:off-মার্কার + স্টোরেজ-শূন্য — hr337-এক-উৎস-চুক্তি)"; else bad "ই২ই: $(unjj "$WPO")"; fi
HSEED=$(ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৪)');var ac=document.querySelectorAll('.hr-aria-copy');if(ac[0])ac[0].click();return 'h1'})())" >/dev/null 2>&1; agent-browser wait 500 >/dev/null 2>&1; ev "JSON.stringify((function(){return{h:window.__hrAria317QA.hist().length,fb:!!document.querySelector('.hr326-fmt'),br:window.__hrAria344QA.bar()}})())")
HSEEDJ=$(unjj "$HSEED")
if [ "$(jf h "$HSEEDJ")" -ge 1 ] 2>/dev/null && [ "$(jf fb "$HSEEDJ")" = "true" ] && [ "$(jf br "$HSEEDJ")" = "true" ]; then ok "ই২ই: ইতিহাস-বীজ+পুনঃসিঙ্ক (aria-copy-ক্লিক → রেকর্ড + টিপ-রি-রেন্ডার → hr326-fmt-বাটন + hr344-বার-পুনর্নির্মাণ {ইতিহাস-গেট-পুনঃপ্রবেশ — দ্বি-পথ-সিঙ্ক-প্রমাণ} — FSYNC-পূর্বশর্ত)"; else bad "ই২ই: ইতিহাস-বীজ $(unjj "$HSEED")"; fi
FSYNC=$(ev "JSON.stringify((function(){var fb=document.querySelector('.hr326-fmt');if(!fb)return{e:'no-fmt-btn'};fb.click();var ch=document.querySelector('.hr344-chip');return{e:'',br:window.__hrAria344QA.bar(),chT:ch?ch.textContent:'',brN:document.querySelectorAll('.hr344-bar').length,last:window.__hrAria344QA.last,last341:window.__hrAria341QA.last,mode:window.__hrAria331QA.mode()}})())")
FSJ=$(unjj "$FSYNC")
if [ "$(jf e "$FSJ")" = "" ] && [ "$(jf br "$FSJ")" = "true" ] && [ "$(jf chT "$FSJ")" = "সমৃদ্ধ ৯ · কেবল-কী ৯ · JSON ৯" ] && [ "$(jf brN "$FSJ")" = "1" ] && printf '%s' "$(jf last "$FSJ")" | grep -q 'chip:sync' && printf '%s' "$(jf last341 "$FSJ")" | grep -q 'fmt-sync:' && [ "$(jf mode "$FSJ")" = "key" ]; then ok "ই২ই: fmt-sync-চতুর্থ-সিঙ্ক-পয়েন্ট (cycleFmt326-মোড়ক-চেইন → .hr326-fmt-ক্লিকে চিপ-পুনঃসিঙ্ক {মোড-নিরপেক্ষ-গণনা — all-মানচিত্র-অপরিবর্তিত} + বার-ডুপ-রক্ষিত-স্থায়িত্ব + hr341-fmt-sync-মার্কার-সহাবস্থান + মোড-বদল rich→key — MO=৪-অটুট)"; else bad "ই২ই: $(unjj "$FSYNC")"; fi
CPY1=$(ev "JSON.stringify((function(){var h0=window.__hrAria317QA.hist().length;window.__h344hist0=h0;window.__h344expect=JSON.stringify(window.__hrAria344QA.all(),null,2);document.querySelector('.hr344-abtn').click();return 'c1'})())" >/dev/null 2>&1)
agent-browser wait 600 >/dev/null 2>&1
CPY=$(ev "JSON.stringify((function(){var ab=document.querySelector('.hr344-abtn');return{capEq:window.__clipCap344===window.__h344expect,copies:window.__hrAria344QA.copies,last:window.__hrAria344QA.last,done:ab?ab.classList.contains('hr344-done'):false,hist:window.__hrAria317QA.hist().length===window.__h344hist0}})())")
CPYJ=$(unjj "$CPY")
if [ "$(jf capEq "$CPYJ")" = "true" ] && [ "$(jf copies "$CPYJ")" = "1" ] && printf '%s' "$(jf last "$CPYJ")" | grep -q 'copy:all' && [ "$(jf done "$CPYJ")" = "true" ] && [ "$(jf hist "$CPYJ")" = "true" ]; then ok "ই২ই: all-শর্টহ্যান্ড-রপ্তাই-কপি (ক্লিপবোর্ড-ক্যাপ ≡ getHints('all')-JSON.stringify — দ্বি-বিন্দু-সমতা + copies=১ + copy:all-মার্কার + .hr344-done-ফ্ল্যাশ + ইতিহাস-গণনা-অপরিবর্তিত — রেকর্ড-বিহীন-প্রমাণ)"; else bad "ই২ই: $(unjj "$CPY")"; fi
if agent-browser screenshot "$SH_SET" >/dev/null 2>&1; then ok "স্ক্রিনশট: ডেস্ক-রাজ্য সংরক্ষিত (খোলা-টিপ + অ্যাম্বার-বার + চিপ)"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৪: sfs344-মোবাইল-390 (চিপ-কম্প্যাক্ট-ব্যান্ড) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
rld
opentip
ev "JSON.stringify((function(){window.__hrAria333QA.setHint('X','X = সিঙ্ক (৩৪৪)');return 's1'})())" >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
MOB=$(ev "JSON.stringify((function(){var ch=document.querySelector('.hr344-chip');var cs=ch?getComputedStyle(ch):null;return{br:window.__hrAria344QA.bar(),ab:window.__hrAria344QA.abtn(),chT:window.__hrAria344QA.chip(),mw:cs?cs.maxWidth:'',fs:cs?cs.fontSize:''}})())")
MOBJ=$(unjj "$MOB")
if [ "$(jf br "$MOBJ")" = "true" ] && [ "$(jf ab "$MOBJ")" = "true" ] && [ "$(jf mw "$MOBJ")" = "116px" ]; then ok "ই২ই: মোবাইল-390 চিপ-কম্প্যাক্ট (max-width 116px-≤640px-গেট — এলিপসিস-ব্যান্ড — ডেস্ক-বৈচিত্র্য-অটুট)"; else bad "ই২ই: $(unjj "$MOB")"; fi
if agent-browser screenshot "$SH_MOB" >/dev/null 2>&1; then ok "স্ক্রিনশট: মোবাইল-390 রাজ্য সংরক্ষিত"; else skip "স্ক্রিনশট-ব্যর্থ"; fi

echo "── ধাপ-৫: পরিষ্কারণ (hr337-hints + hr326-fmt + hr321-hist) + কনসোল + রেজিস্ট্রি-স্থায়িত্ব ──"
ev "JSON.stringify((function(){try{sessionStorage.removeItem('hr337-hints');sessionStorage.removeItem('hr326-fmt');sessionStorage.removeItem('hr321-hist')}catch(e){};return 'wipe'})())" >/dev/null 2>&1
rld
CL=$(ev "JSON.stringify({ss:sessionStorage.getItem('hr337-hints')===null&&sessionStorage.getItem('hr326-fmt')===null,br:(window.__hrAria344QA?window.__hrAria344QA.bar():null),rows:(window.__hrAria333QA?window.__hrAria333QA.rows():-1)})")
CLJ=$(unjj "$CL")
if [ "$(jf ss "$CLJ")" = "true" ] && [ "$(jf br "$CLJ")" = "false" ] && [ "$(jf rows "$CLJ")" = "9" ]; then ok "পরিষ্কারণ: স্টোরেজ-শূন্য + বার-অনুপস্থিত + রেজিস্ট্রি-৯-সারি-স্থায়িত্ব (পরবর্তী-সুইটে-ফ্রেশ-লোড-চুক্তি)"; else bad "পরিষ্কারণ: $(unjj "$CL")"; fi
ERR1=$(ev "(function(){return window.__s344console||0})()" 2>/dev/null | tr -d '"')
if [ "$ERR1" = "0" ] || [ -z "$ERR1" ]; then ok "কনসোল-ত্রুটি-শূন্য (রিলোড-পরবর্তী-জীবনকাল)"; else bad "কনসোল-ত্রুটি ($ERR1)"; fi
HC2=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$HC2" = "200" ]; then ok "পরিষ্কার-পরে হোম 200"; else bad "হোম-$HC2"; fi

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ═══"
if [ "$FAIL" = "0" ]; then echo "s344-suite ✓ সর্ব-সবুজ"; else echo "s344-suite ✗ ব্যর্থতা-বিদ্যমান"; exit 1; fi
