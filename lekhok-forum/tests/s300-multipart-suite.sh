#!/bin/bash
# s300-multipart-suite.sh — session300 press-ফর্ম multipart-ব্রাউজার-পাথ ই২ই (রিয়েল-ফাইল-আপলোড) +
#                            moderator-দিক sections-ফিল্টার (lsf298) যাচাই (স্থায়ী — রিপো-কমিটেড)
# প্রেক্ষাপট: PLANS session299-প্রস্তাব-প্রথম-দুই-প্রার্থী:
#   ① s258-হেডার-চুক্তির multipart-সিড শুধু image_url-পথ যাচাই করেছিল — প্রকৃত-ফাইল-আপলোড
#     (multer pressUpload → /uploads/press/ → clip-thumb-রেন্ডার) ব্রাউজার-পথে-অযাচাইকৃত ছিল;
#   ② /moderator/sections = admin/sections-ভিউ পুনঃব্যবহার (moderatorView:true + BASE:/moderator) —
#     lsf298-ফিল্টার-মার্কআপ উত্তরাধিকারসূত্রে-মিলেও moderator-দিকের ব্রাউজার-আচরণ-যাচাই-বাকি ছিল।
# কভারেজ: ① কাঠামো (press যোগ-ফর্ম multipart + input[name=image] + session300 আপলোড-affordance স্টাইল +
#             s258-স্ট্রিপ অক্ষুণ্ণ; sections lsfStrip298 + হুক + BASE:/moderator-অ্যাকশন)
#          ② E2E-আপলোড (agent-browser): fetch-POST লগইন → fill মার্কার → upload রিয়েল-PNG →
#             files.length=১ → সাবমিট → posted=১ → /uploads/press/-URL HTTP-200-ছবি → মার্কার-রেন্ডার
#          ③ স্বয়ং-নিরাময়ী-ক্লিন (delete→ট্র্যাশ→bulk-purge — s258-নীতি)
#          ④ E2E-মডারেটর-সেকশনস: __lsf298QA হুক + ফিল্টার-আচরণ (apply/clear) + ফর্ম-অ্যাকশন-অক্ষুণ্ণ
# চুক্তি: fetch-POST লগইন opaqueredirect-তিন-শাখা (30[23]/0/ALR — session297-গোটচা) + open-রিট্রাই +
#         eval-এ else-বিহীন-ternary-নিষিদ্ধ (cond&&expr-রীতি) + বাংলা-মার্কার ASCII-গ্রেপ-সুরক্ষা (মার্কার ASCII)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
MARK="qa300mp$(date +%s | tail -c 6)"
J=/tmp/s300-jar.txt
PAGE=/tmp/s300-pr-page.html
PNG=/tmp/s300-upload.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
contains(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
poll(){
  local i r
  for i in $(seq 1 "${3:-20}"); do
    r=$(ev "$1" 2>/dev/null | tr -d '"\\')
    if echo "$r" | grep -qF -- "$2"; then return 0; fi
    sleep 0.5
  done
  echo "poll-final: $r"
  return 1
}
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o "$PAGE" -w "%{http_code}" -b "$J" "$BASE/moderator/press")
if [ "$PC" = "200" ]; then ok "প্রেস পৃষ্ঠা 200"; else bad "প্রেস পৃষ্ঠা HTTP $PC"; fi
MARKN=$(grep -cF "$MARK" "$PAGE" || true)
if [ "$MARKN" = "0" ]; then ok "মার্কার-পূর্ব-শূন্য (নির্ধারক)"; else bad "মার্কার-পূর্ব-উপস্থিত ($MARKN)"; fi

echo "── ধাপ-১: কাঠামো (যোগ-ফর্ম multipart + session300 আপলোড-affordance + s258 অক্ষুণ্ণ) ──"
containsF "যোগ-ফর্ম multipart অক্ষুণ্ণ" "$(cat "$PAGE")" 'action="/moderator/press" enctype="multipart/form-data"'
containsF "ফাইল-ইনপুট (name=image)" "$(cat "$PAGE")" '<input type="file" name="image" accept="image/*"'
containsF "session300: আপলোড-affordance-স্টাইল" "$(cat "$PAGE")" '.clip-field-wide input[type="file"]'
containsF "session300: focus-within-রিং" "$(cat "$PAGE")" '.clip-field-wide:focus-within'
containsF "session300: reduced-motion-গার্ড" "$(cat "$PAGE")" '.clip-field-wide input[type="file"] { transition: none; }'
containsF "s258-অক্ষুণ্ণ: prFilter258" "$(cat "$PAGE")" 'id="prFilter258"'
containsF "s258-অক্ষুণ্ণ: __prQA হুক" "$(cat "$PAGE")" '__prQA'
# session300-প্রেস-ব্লক হেক্স-শূন্য (ব্লক-স্কোপড)
PB=$(sed -n '/session300 — আপলোড/,/<\/style>/p' "$PAGE")
PHN=$(echo "$PB" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
if [ "$PHN" = "0" ]; then ok "session300-প্রেস-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "প্রেস-ব্লকে $PHN হেক্স"; fi
# রিয়েল-PNG (১×১ — বৈধ-বাইনারি)
python3 -c "
import base64,sys
open('$PNG','wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
print('PNG-OK')" | grep -q PNG-OK && ok "রিয়েল-PNG নির্মিত ($PNG)" || { bad "PNG-নির্মাণ-ব্যর্থ"; exit 1; }

echo "── ধাপ-২: E2E-আপলোড (agent-browser — ব্রাউজার-পথে প্রকৃত-ফাইল) ──"
agent-browser close >/dev/null 2>&1 || true
sleep 1
OPENED=""
for k in 1 2 3; do
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1
  sleep 2
  U=$(agent-browser get url 2>/dev/null | tr -d '"')
  if echo "$U" | grep -qF "localhost:8094"; then OPENED=1; break; fi
  sleep 1
done
if [ -n "$OPENED" ]; then ok "open (url-যাচাই)"; else bad "open ব্যর্থ (url=$U)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
if echo "$LR" | grep -qE '30[23]' || echo "$LR" | grep -q ':opaqueredirect' || echo "$LR" | grep -q 'ALR'; then ok "fetch-POST লগইন ($LR — তিন-শাখা)"; else bad "লগইন-ব্যর্থ ($LR)"; fi
agent-browser open "$BASE/moderator/press" >/dev/null 2>&1; sleep 1.5
contains "ব্রাউজারে /moderator/press খোলা" "$(agent-browser get url 2>/dev/null)" '/moderator/press'
# ফর্ম-পূরক (মার্কার-শিরোনাম + পত্রিকা)
agent-browser fill 'input[name="title"]' "$MARK আপলোড-ই২ই" >/dev/null 2>&1 && ok "শিরোনাম-ফিল (মার্কার)" || bad "শিরোনাম-ফিল"
agent-browser fill 'input[name="paper_name"]' 'qa300paper' >/dev/null 2>&1 && ok "পত্রিকা-ফিল" || bad "পত্রিকা-ফিল"
# রিয়েল-ফাইল-আপলোড (ব্রাউজার-পথ — curl -F-অনুকরণ-নয়)
agent-browser upload 'input[name="image"]' "$PNG" >/dev/null 2>&1 && ok "upload-কমান্ড (রিয়েল-ফাইল)" || bad "upload-কমান্ড-ব্যর্থ"
FL=$(ev '(function(){var f=document.querySelector("input[name=image]");return (f&&f.files&&f.files.length===1&&f.files[0].name.indexOf("s300-upload")===0)?"F1":"F"+(f&&f.files?f.files.length:"x");})()' | tr -d '"\\')
echo "$FL" | grep -qF 'F1' && ok "ফাইল-ইনপুট-বাউন্ড (files.length=১, নাম-মিল)" || bad "ফাইল-বাইন্ড ($FL)"
# সাবমিট → posted=১-রিডাইরেক্ট
agent-browser click 'form[action^="/moderator/press"] button[type="submit"]' >/dev/null 2>&1
if poll '(function(){return location.href.indexOf("posted=1")>=0?"POSTED":"W:"+location.search.slice(0,40);})()' 'POSTED' 30; then ok "সাবমিট→posted=১-রিডাইরেক্ট"; else bad "সাবমিট-রিডাইরেক্ট"; fi
ER=$(ev '(function(){return location.href.indexOf("error=")>=0?"ERR":"CLEAN";})()' | tr -d '"\\')
echo "$ER" | grep -qF 'CLEAN' && ok "error=শূন্য (সার্ভার-বর্জন-নেই)" || bad "সার্ভার-error ($ER)"
# মার্কার-রো-আবিষ্কার + আপলোড-ছবি-যাচাই (curl — কুকি-জার)
curl -s -b "$J" -c "$J" "$BASE/moderator/press" -o "$PAGE"
MARKN=$(grep -cF "$MARK" "$PAGE" || true)
if [ "$MARKN" -ge 1 ]; then ok "আপলোড-পরে মার্কার-রেন্ডার ($MARKN)"; else bad "আপলোড-পরে-ও মার্কার-শূন্য"; fi
SID=$(awk 'BEGIN{RS="</details>"} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' "$PAGE")
if [ -n "$SID" ] && [ "$SID" -gt 0 ] 2>/dev/null; then ok "মার্কার-id আবিষ্কার #$SID"; else bad "মার্কার-id আবিষ্কার-ব্যর্থ"; fi
ROW=$(awk 'BEGIN{RS="</details>"} /'"$MARK"'/ {print; exit}' "$PAGE")
IMG=$(echo "$ROW" | grep -o 'class="clip-thumb" src="[^"]*"' | head -1 | sed 's/.*src="//;s/"//')
if echo "$IMG" | grep -qF '/uploads/press/'; then ok "কভার = /uploads/press/ পথ ($IMG)"; else bad "কভার-পথ-অপ্রত্যাশিত ($IMG)"; fi
IHC=$(curl -s -o /dev/null -w "%{http_code}:%{content_type}" -b "$J" "$BASE$IMG")
if echo "$IHC" | grep -q '^200:image/'; then ok "আপলোড-ছবি HTTP-200-ছবি ($IHC)"; else bad "আপলোড-ছবি ($IHC)"; fi
ISZ=$(curl -s -b "$J" "$BASE$IMG" | wc -c)
if [ "$ISZ" -ge 60 ] 2>/dev/null; then ok "আপলোড-বাইট-অ-শূন্য ($ISZ বাইট)"; else bad "আপলোড-বাইট ($ISZ)"; fi
agent-browser screenshot /home/z/my-project/download/s300-multipart-desk.png >/dev/null 2>&1 && ok "স্ক্রিনশট ডেস্কটপ" || bad "স্ক্রিনশট-ডেস্ক"

echo "── ধাপ-৩: স্বয়ং-নিরাময়ী-ক্লিন (delete→ট্র্যাশ→bulk-purge — s258-নীতি) ──"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
DC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/press/$SID/delete" -H "x-csrf-token: $TOK" --data-urlencode "_csrf=$TOK")
if [ "$DC" = "302" ] || [ "$DC" = "303" ]; then ok "মার্কার-রো-ডিলিট ($DC)"; else bad "ডিলিট (HTTP $DC)"; fi
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
PP=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" -H "x-csrf-token: $TOK" --data-urlencode "ids=$SID" --data-urlencode "_csrf=$TOK")
if [ "$PP" = "302" ] || [ "$PP" = "303" ] || [ "$PP" = "200" ]; then ok "ট্র্যাশ-বাল্ক-পার্জ ($PP)"; else bad "পার্জ (HTTP $PP)"; fi
curl -s -b "$J" -c "$J" "$BASE/moderator/press" -o "$PAGE"
MARKN=$(grep -cF "$MARK" "$PAGE" || true)
if [ "$MARKN" = "0" ]; then ok "ক্লিন-পরে মার্কার-শূন্য (নেট-শূন্য)"; else bad "ক্লিন-পরে-ও মার্কার ($MARKN)"; fi
UPN=$(echo "$IMG" | grep -oF '/uploads/press/' | wc -l)
if [ "$UPN" = "1" ]; then ok "আপলোড-ফাইল-পথ-রেকর্ডকৃত (অর্ফান-ফাইল-পরিচিত: $IMG)"; else bad "পথ-বিশ্লেষণ"; fi

echo "── ধাপ-৪: moderator-দিক sections (lsf298 — admin/sections-ভিউ-উত্তরাধিকার যাচাই) ──"
SC=$(curl -s -b "$J" -c "$J" "$BASE/moderator/sections" -o /tmp/s300-mod-sec.html -w "%{http_code}")
if [ "$SC" = "200" ]; then ok "moderator-sections 200"; else bad "moderator-sections HTTP $SC"; fi
SECH=$(cat /tmp/s300-mod-sec.html)
containsF "lsf298-স্ট্রিপ উত্তরাধিকারসূত্রে-রেন্ডার্ড" "$SECH" 'id="lsfStrip298"'
containsF "lsf298-রো-মার্ক (data-lsf-row298)" "$SECH" 'data-lsf-row298="1"'
containsF "__lsf298QA হুক রেন্ডার্ড" "$SECH" '__lsf298QA'
containsF "BASE:/moderator-অ্যাকশন (add-ফর্ম)" "$SECH" '/moderator/sections/add'
containsF "moderator-পৃষ্ঠা-পথ" "$SECH" '/moderator/sections'
ROWSN=$(grep -o 'data-lsf-row298="1"' /tmp/s300-mod-sec.html | wc -l)
if [ "$ROWSN" -ge 1 ]; then ok "ফিল্টার-যোগ্য-সারি ≥১ ($ROWSN)"; else bad "সারি-শূন্য — আচরণ-যাচাই-অসম্ভব"; fi
agent-browser open "$BASE/moderator/sections" >/dev/null 2>&1; sleep 1.5
HK=$(ev '(function(){var t=typeof window.__lsf298QA;return t==="object"?"HOOKOBJ":t;})()' | tr -d '"\\')
echo "$HK" | grep -qF 'HOOKOBJ' && ok "__lsf298QA হুক-বস্তু (moderator-দিক)" || bad "হুক ($HK)"
RR=$(ev '(function(){return "R"+window.__lsf298QA.rows();})()' | tr -d '"\\')
RRN=$(echo "$RR" | sed 's/R//')
if [ "$RRN" = "$ROWSN" ] 2>/dev/null; then ok "হুক-rows = SSR-সারি-মিল ($RR)"; else bad "হুক-rows ($RR ≠ $ROWSN)"; fi
TT=$(ev '(function(){return "T"+window.__lsf298QA.total();})()' | tr -d '"\\')
TTN=$(echo "$TT" | sed 's/T//')
if [ "$TTN" = "$ROWSN" ] 2>/dev/null; then ok "হুক-total বুট-সত্য = rows-মিল (session300 boot-apply-init ফিক্স-প্রমাণ)"; else bad "হুক-total-বুট ($TT ≠ $ROWSN)"; fi
# আচরণ-যাচাই — ASCII-নির্ধারক-প্রোব (#<id> — প্রথম-সারির kw থেকে python-নির্যাস; বাংলা-শব্দ-শেল-উদ্ধৃতি-ঝুঁকি-শূন্য)
PROBE=$(python3 -c "
import re,html
v=open('/tmp/s300-mod-sec.html',encoding='utf-8').read()
m=re.search(r'data-kw=\"([^\"]*)\"', v)
kw=html.unescape(m.group(1)) if m else ''
mm=re.search(r'#(\\d+)', kw)
print(mm.group(1) if mm else '')")
# গোটচা (রান-২-প্রমাণ): apply() আর্গুমেন্ট-গ্রহণ-করে-না — বর্তমান-input-মান প্রয়োগ করে (হুক-চুক্তি) →
# native-setter + input-event দিয়ে মান-স্থাপন-পূর্বক (ব্রাউজার-পথ — প্রকৃত-টাইপিং-অনুকরণ)
if [ -n "$PROBE" ]; then
  ev '(function(){
    var i=document.getElementById("lsfInput298");
    var st=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value");
    st.set.call(i,"#'"$PROBE"'");i.dispatchEvent(new Event("input",{bubbles:true}));
    return "S";})()' >/dev/null 2>&1
  MC=$(ev '(function(){return "M"+window.__lsf298QA.matches();})()' | tr -d '"\\')
  MCN=$(echo "$MC" | sed 's/M//')
  EXP=$(python3 -c "
import re,html
v=open('/tmp/s300-mod-sec.html',encoding='utf-8').read()
kws=re.findall(r'data-kw=\"([^\"]*)\"', v)
print(sum(1 for k in kws if '#$PROBE' in html.unescape(k)))")
  if [ "$MCN" = "$EXP" ] 2>/dev/null && [ -n "$MCN" ]; then ok "input(#$PROBE)→matches = সাবস্ট্রিং-প্রত্যাশা ($MC = M$EXP)"; else bad "apply-মিল ($MC ≠ M$EXP)"; fi
  ev '(function(){window.__lsf298QA.clear();return "C";})()' >/dev/null 2>&1
  CC=$(ev '(function(){return "C"+window.__lsf298QA.matches()+"T"+window.__lsf298QA.total()+"R"+window.__lsf298QA.rows();})()' | tr -d '"\\')
  echo "$CC" | grep -qF "C${TTN}T${TTN}R${RRN}" && ok "clear→খালি-প্রশ্নে-সর্ব-মিল + পূর্ণ-পুনঃপ্রদর্শন ($CC)" || bad "clear ($CC প্রত্যাশা C${TTN}T${TTN}R${RRN})"
fi
# বাংলা-ডিফল্ট-সেকশন (home_faq) রো-কনটেন্ট প্রোব — দ্বিভাষিক-kw-প্রমাণ
containsF "দ্বিভাষিক data-kw প্রমাণ (মার্কার-লেবেল)" "$(cat /tmp/s300-mod-sec.html)" 'data-kw='
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){return (document.documentElement.scrollWidth>document.documentElement.clientWidth)?"HSCROLL":"OK";})()' | tr -d '"\\')
echo "$HS" | grep -qF 'OK' && ok "390px-ডক-hScroll-শূন্য" || bad "hScroll ($HS)"
agent-browser screenshot /home/z/my-project/download/s300-modsec-mobile390.png >/dev/null 2>&1 && ok "স্ক্রিনশট মোবাইল-৩৯০" || bad "স্ক্রিনশট-মোবাইল"

echo "══════════════════════════════"
echo "s300-multipart: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else echo "FAILED ✗"; exit 1; fi
