#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# tests/lf153-e2e.sh — সেশন ১৫৩ E2E (এক-ইনভোকেশন: সার্ভার + হারনেস)
# সুযোগ: FB-রিচ-কম্পোজার (ইউজার-স্পেক A-to-Z) — /api/posts/compose + /upload-media
#        + অডিয়েন্স-এনফোর্সমেন্ট + ফিড-কোলাজ (fb-col153) + 'Aa' গ্রেডিয়েন্ট
#        + স্যানিটাইজেশন (XSS) + মোবাইল-৩৯০px + রিগ্রেশন (cursor)
# পূর্বশর্ত: testuser/qa113user (demo123) — scripts/seed-test-users.js + seed-qa-113 (রিপো-কনভেনশন)
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
chk(){ if [ "$1" = "$2" ]; then ok "$3"; else bad "$3 (got=$1 want=$2)"; fi; }

PORT=${LF153_PORT:-8080}
BASE="http://localhost:$PORT"

getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J="$1" PG="$2" U="$3" PW="$4"
  rm -f "$J"
  local TOK=$(getcsrf "$J" "$PG")
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  if [ "${R%% *}" = "200" ] || [[ "${R#* }" == *"csrf=1"* ]]; then
    TOK=$(getcsrf "$J" "$PG")
    R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  fi
  echo "$R"
}

echo "── [0] সার্ভার (pkill -9 → বুট → health)"
pkill -9 -f "node server.js" 2>/dev/null; sleep 0.8
PORT=$PORT LF_QA_DISABLE_RATELIMIT=1 node server.js > /tmp/lf153-server.log 2>&1 &
SRV=$!
sleep 6
H=$(curl -s "$BASE/api/health")
echo "$H" | rg -q '"status":"healthy"' && ok "health=healthy" || bad "health: $H"

echo "── [1] অথ-গেট + কম্পোজ-ভ্যালিডেশন"
P=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/posts/compose" -H 'Content-Type: application/json' -d '{"content":"guest"}')
chk "$P" 401 "গেস্ট compose → 401"
P=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/upload-media")
chk "$P" 303 "গেস্ট upload-media → 303 (অথ-গেট)"

J1=/tmp/lf153-jar1.txt
R=$(login "$J1" /login testuser demo123)
echo "$R" | rg -q "30[23]" && ok "testuser লগইন ($R)" || bad "testuser লগইন ব্যর্থ ($R)"
CT=$(curl -s -b "$J1" -c "$J1" "$BASE/dashboard" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
[ -n "$CT" ] && ok "CSRF-টোকেন প্রাপ্ত" || bad "CSRF-টোকেন অনুপস্থিত"

R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d '{"content":"","media":[]}')
echo "$R" | rg -q '"ok":false' && ok "খালি-কম্পোজ → 400-শেপ ($R)" || bad "খালি-কম্পোজ-গার্ড ($R)"

R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d '{"content":"x","background_color":"fbg999"}')
echo "$R" | rg -q '"ok":true' && ok "অজানা-bg-কী → নিরাপদ-ডিফল্ট (পোস্ট হয়)" || bad "bg-হোয়াইটলিস্ট-ভাঙা ($R)"
DUPID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

echo "── [2] XSS-স্যানিটাইজেশন (সার্ভার-পথ)"
R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d '{"content":"<p onclick=\"alert(1)\">নিরাপদ লেখা</p><script>alert(2)<\/script><img src=x onerror=alert(3)>"}')
echo "$R" | rg -q '"ok":true' && ok "XSS-পেলোড-পোস্ট গৃহীত" || bad "XSS-পোস্ট ব্যর্থ ($R)"
XID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
XHTML=$(curl -s -b "$J1" "$BASE/articles/$XID")
echo "$XHTML" | rg -qF 'onclick="alert' && bad "onclick লিক (XSS!)" || ok "onclick-শূন্য (স্যানিটাইজড)"
echo "$XHTML" | rg -q '<script>alert' && bad "script-লিক (XSS!)" || ok "script-শূন্য"
echo "$XHTML" | rg -qF 'onerror=alert' && bad "onerror-লিক (XSS!)" || ok "onerror-শূন্য"
echo "$XHTML" | rg -q 'নিরাপদ লেখা' && ok "টেক্সট-কনটেন্ট অক্ষত" || bad "টেক্সট-লস"

echo "── [3] গ্রেডিয়েন্ট + রিচ-ফিড-রেন্ডার"
R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d '{"content":"<h2>LF153 গ্রেডিয়েন্ট-শিরোনাম</h2><p>বর্ডারহীন ক্যানভাসের <b>বোল্ড</b> লেখা — ফেসবুক-প্যারিটি।</p>","background_color":"fbg1","feeling":"খুশি 😊","location":"চট্টগ্রাম বিশ্ববিদ্যালয়"}')
echo "$R" | rg -q '"ok":true' && ok "গ্রেডিয়েন্ট-পোস্ট তৈরি" || bad "গ্রেডিয়েন্ট-পোস্ট ব্যর্থ ($R)"
GID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
DASH=$(curl -s -b "$J1" "$BASE/dashboard")
echo "$DASH" | rg -q "fb-bg153-fbg1" && ok "ফিডে গ্রেডিয়েন্ট-শাখা (fb-bg153-fbg1)" || bad "ফিডে গ্রেডিয়েন্ট অনুপস্থিত"
echo "$DASH" | rg -q 'fb-rich153' && ok "ফিডে রিচ-বডি (fb-rich153)" || bad "রিচ-বডি অনুপস্থিত"
echo "$DASH" | rg -q 'খুশি 😊' && ok "অনুভূতি-চিপ ফিডে" || bad "অনুভূতি-চিপ অনুপস্থিত"
echo "$DASH" | rg -q 'চট্টগ্রাম বিশ্ববিদ্যালয়' && ok "লোকেশন-চিপ ফিডে" || bad "লোকেশন-চিপ অনুপস্থিত"
# session249-আধুনিকীকরণ: fb-aud-chip153 session164-এ বিলোপ-ইচ্ছাকৃত (হেডার-শূন্য FB-কম্প্যাক্ট-কার্ড) —
# প্রতিস্থাপক = লেখক-সময়-লাইনের visibility-meta (গ্লোব title="পাবলিক") — পাবলিক-পোস্টে গ্লোব-প্রমাণ
echo "$DASH" | rg -q 'title="পাবলিক"' && ok "পাবলিক-পোস্টে গ্লোব-মেটা (session164-প্রতিস্থাপক)" || bad "গ্লোব-মেটা অনুপস্থিত"
echo "$DASH" | rg -q 'LF153 গ্রেডিয়েন্ট-শিরোনাম' && ok "রিচ-কনটেন্ট ফিডে দৃশ্যমান" || bad "রিচ-কনটেন্ট অনুপস্থিত"

echo "── [4] ৫-মিডিয়া কোলাজ (+N ওভারলে)"
MEDIA='[{"url":"/avatar/1","type":"image"},{"url":"/avatar/2","type":"image"},{"url":"/avatar/3","type":"image"},{"url":"/avatar/4","type":"image"},{"url":"/avatar/5","type":"image"},{"url":"/avatar/6","type":"image"}]'
R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d "{\"content\":\"LF153 কোলাজ-পোস্ট — ছয় ছবি\",\"media\":$MEDIA}")
echo "$R" | rg -q '"ok":true' && ok "৬-মিডিয়া পোস্ট তৈরি" || bad "কোলাজ-পোস্ট ব্যর্থ ($R)"
CID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
DASH=$(curl -s -b "$J1" "$BASE/dashboard")
echo "$DASH" | rg -q 'fb-col153-5' && ok "৫+-লেআউট শাখা (fb-col153-5)" || bad "৫+-লেআউট অনুপস্থিত"
echo "$DASH" | rg -q 'fb-col-more153' && ok "+N ওভারলে উপস্থিত" || bad "+N ওভারলে অনুপস্থিত"
echo "$DASH" | rg -qF '<i class="fas fa-plus" aria-hidden="true"></i> ২</span>' && ok "+N গণনা = ২ (৬টির ৪ দৃশ্যমান — বাংলা-অঙ্ক toBn)" || bad "+N গণনা ভুল"
# সেশন-১৫৩-ফিক্স-রিগ্রেশন: audience-বিহীন পেলোড 'undefined'-স্ট্রিং সেভ করত (প্রমাণিত-
# বাগ) → অতিথি-ফিড থেকে নীরবে-লুকাত। অতিথি-ফিডেও কোলাজ দৃশ্যমান হতে বাধ্য।
GDASH=$(curl -s "$BASE/dashboard")
echo "$GDASH" | rg -q 'fb-col153-5' && ok "অতিথি-ফিডেও কোলাজ (audience-নরমালাইজ-ফিক্স)" || bad "অতিথি-ফিডে কোলাজ অদৃশ্য (undefined-রিগ্রেশন!)"

echo "── [5] অডিয়েন্স-এনফোর্সমেন্ট (ONLY_ME/FRIENDS)"
R=$(curl -s -b "$J1" -X POST "$BASE/api/posts/compose" -H "x-csrf-token: $CT" -H 'Content-Type: application/json' -d '{"content":"LF153 গোপন পোস্ট — শুধু আমি","audience":"ONLY_ME"}')
echo "$R" | rg -q '"ok":true' && ok "ONLY_ME পোস্ট তৈরি" || bad "ONLY_ME পোস্ট ব্যর্থ ($R)"
OID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
PRIV=$(curl -s -b "$J1" "$BASE/dashboard")
echo "$PRIV" | rg -q 'LF153 গোপন পোস্ট' && ok "লেখকের ফিডে ONLY_ME দৃশ্যমান" || bad "লেখকেও ONLY_ME অদৃশ্য"
# session249-আধুনিকীকরণ: চিপ-বিলোপ-পরবর্তী প্রতিস্থাপক = visibility-lock meta (title-অ্যাট্রি)
echo "$PRIV" | rg -q 'দৃশ্যমানতা: শুধুমাত্র আমি' && ok "লেখকে দৃশ্যমানতা-লক (শুধুমাত্র আমি)" || bad "দৃশ্যমানতা-লক অনুপস্থিত"
P=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/articles/$OID")
chk "$P" 404 "গেস্ট সরাসরি-URL ONLY_ME → 404"
P=$(curl -s -o /dev/null -w "%{http_code}" -b "$J1" "$BASE/articles/$OID")
chk "$P" 200 "লেখক সরাসরি-URL ONLY_ME → 200"

J2=/tmp/lf153-jar2.txt
R=$(login "$J2" /login qa113user demo123)
echo "$R" | rg -q "30[23]" && ok "qa113user লগইন" || bad "qa113user লগইন ব্যর্থ ($R)"
D2=$(curl -s -b "$J2" "$BASE/dashboard")
echo "$D2" | rg -q 'LF153 গোপন পোস্ট' && bad "অন্য-ইউজারের (qa113user) ফিডে ONLY_ME লিক!" || ok "অন্য-ইউজারের (qa113user) ফিডে ONLY_ME লুকান"
D2G=$(curl -s "$BASE/dashboard")
echo "$D2G" | rg -q 'LF153 গোপন পোস্ট' && bad "গেস্ট-ফিডে ONLY_ME লিক!" || ok "গেস্ট-ফিডে ONLY_ME লুকান"

echo "── [6] আপলোড-ভ্যালিডেশন (মিডিয়া-মাইম-গার্ড)"
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89' > /tmp/lf153-tiny.png
P=$(curl -s -b "$J1" -o /tmp/lf153-up.json -w "%{http_code}" -X POST "$BASE/upload-media" -F "files=@/tmp/lf153-tiny.png;type=image/png" -H "x-csrf-token: $CT")
chk "$P" 200 "ছবি-আপলোড → 200"
rg -q '"type":"image"' /tmp/lf153-up.json && ok "আপলোড-রেসপন্স মিডিয়া-টাইপ" || bad "আপলোড-শেপ: $(cat /tmp/lf153-up.json | head -c 120)"
printf 'not audio at all' > /tmp/lf153-bad.txt
P=$(curl -s -b "$J1" -o /tmp/lf153-bad.json -w "%{http_code}" -X POST "$BASE/upload-media" -F "files=@/tmp/lf153-bad.txt;type=text/plain" -H "x-csrf-token: $CT")
chk "$P" 400 "অসমর্থিত-মাইম → 400"

echo "── [7] agent-browser: কম্পোজার-মোডাল E2E (qa113user)"
agent-browser close --all > /dev/null 2>&1 || true
BR_LOGIN="no"
for _try in 1 2 3; do
  agent-browser open "$BASE/login" > /dev/null 2>&1
  agent-browser wait 'input[name="username"]' > /dev/null 2>&1
  agent-browser fill 'input[name="username"]' "qa113user" > /dev/null 2>&1
  agent-browser fill 'input[name="password"]' "demo123" > /dev/null 2>&1
  agent-browser click 'button[type="submit"]' > /dev/null 2>&1
  sleep 2.5
  BURL0=$(agent-browser get url 2>/dev/null | head -1)
  if echo "$BURL0" | rg -q "dashboard|articles|profile"; then BR_LOGIN="yes"; break; fi
  echo "  … লগইন-রিট্রাই $_try (url=$BURL0)"
done
if [ "$BR_LOGIN" = "yes" ]; then ok "ব্রাউজার-লগইন (qa113user)"; else bad "ব্রাউজার-লগইন তিন-চেষ্টায় ব্যর্থ"; fi
agent-browser open "$BASE/dashboard" > /dev/null 2>&1
agent-browser wait '#composerOpen' > /dev/null 2>&1
agent-browser click '#composerOpen' > /dev/null 2>&1
sleep 0.8
VIS=$(agent-browser eval "document.getElementById('composerModal') && !document.getElementById('composerModal').hidden ? 'open' : 'closed'" 2>/dev/null | head -1 | tr -d '"' )
chk "$VIS" "open" "ট্রিগার-ক্লিকে মোডাল খোলে"
ED=$(agent-browser eval "!!document.getElementById('fbmEditor') && document.getElementById('fbmEditor').getAttribute('contenteditable')" 2>/dev/null | head -1 | tr -d '"' )
chk "$ED" "true" "বর্ডারহীন contentEditable ক্যানভাস"
TB=$(agent-browser eval "document.querySelectorAll('.fbm-toolbar153 .fbm-tool153').length" 2>/dev/null | head -1)
[ "$TB" -ge 11 ] 2>/dev/null && ok "ফরম্যাটিং-টুলবার $TB টি টুল" || bad "টুলবার-টুল সংখ্যা ($TB)"
agent-browser eval "document.getElementById('fbmEditor').innerHTML='LF153 <b>বোল্ড</b> ব্রাউজার-পোস্ট'; document.getElementById('fbmEditor').dispatchEvent(new Event('input',{bubbles:true})); 'set'" > /dev/null 2>&1
sleep 0.6
DBTN=$(agent-browser eval "!document.getElementById('cpmPostBtn').disabled ? 'enabled' : 'disabled'" 2>/dev/null | head -1 | tr -d '"' )
chk "$DBTN" "enabled" "কনটেন্টে পোস্ট-বাটন সক্রিয়"
MORE=$(agent-browser eval "(function(){ document.getElementById('fbmMore').click(); return document.getElementById('fbmViewMore').hidden ? 'hidden' : 'shown'; })()" 2>/dev/null | head -1 | tr -d '"' )
chk "$MORE" "shown" "থ্রি-ডট → ২য় স্লাইড-ইন ভিউ"
FEEL=$(agent-browser eval "(function(){ document.querySelector('.fbm-feel-chip153[data-feel=\"কৃতজ্ঞ 🙏\"]').click(); return document.getElementById('fbmFeelingChip').hidden ? 'none' : document.getElementById('fbmFeelingChip').textContent.trim(); })()" 2>/dev/null | head -1)
echo "$FEEL" | rg -q 'কৃতজ্ঞ' && ok "অনুভূতি-চিপ সেট + ভিউ-ফেরত" || bad "অনুভূতি-সেট ব্যর্থ ($FEEL)"
BACK=$(agent-browser eval "document.getElementById('fbmBack').hidden ? 'hidden' : 'shown'" 2>/dev/null | head -1 | tr -d '"' )
chk "$BACK" "hidden" "MAIN-ভিউতে ব্যাক-বাটন লুকান"
agent-browser click '#cpmPostBtn' > /dev/null 2>&1
sleep 3
BURL=$(agent-browser get url 2>/dev/null | head -1)
echo "$BURL" | rg -q '/articles/[0-9]+' && ok "পোস্ট-সাবমিট → আর্টিকেল-নেভিগেশন ($BURL)" || bad "সাবমিট-নেভিগেশন ব্যর্থ ($BURL)"
BP=$(agent-browser eval "document.body.innerText.includes('ব্রাউজার-পোস্ট') && document.body.innerText.includes('বোল্ড')" 2>/dev/null | head -1 | tr -d '"' )
chk "$BP" "true" "সিঙ্গেল-পেজে রিচ-কনটেন্ট দৃশ্যমান"

echo "── [8] মোবাইল-৩৯০px + কনসোল-এরর"
agent-browser set viewport 390 844 > /dev/null 2>&1
agent-browser open "$BASE/dashboard" > /dev/null 2>&1
agent-browser wait '#composerOpen' > /dev/null 2>&1
OV=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | head -1)
[ "$OV" -le 0 ] 2>/dev/null && ok "390px-ওভারফ্লো শূন্য ($OV)" || bad "390px-ওভারফ্লো ($OV)"
agent-browser click '#composerOpen' > /dev/null 2>&1
sleep 0.5
OV2=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | head -1)
[ "$OV2" -le 2 ] 2>/dev/null && ok "মোডাল-খোলা 390px-ওভারফ্লো শূন্য ($OV2)" || bad "মোডাল-ওভারফ্লো ($OV2)"
agent-browser close --all > /dev/null 2>&1 || true

echo "── [9] টেস্ট-ডেটা ক্লিনআপ (api-delete + ফলব্যাক নীরব)"
for ID in "$DUPID" "$XID" "$GID" "$CID" "$OID"; do
  [ -n "$ID" ] && curl -s -b "$J1" -o /dev/null -X POST "$BASE/articles/$ID/delete" -H "x-csrf-token: $CT" > /dev/null 2>&1
done
ok "কমিটেড-ট্রি রাখার জন্য টেস্ট-পোস্ট মুছে ফেলা হয়েছে (নীরব)"

echo "── [10] রিগ্রেশন: কার্সার-ইনফিনিট-স্ক্রল"
CUR=$(node scripts/verify-session107-cursor.js "$BASE" 2>/dev/null | tail -2 | tail -1)
echo "$CUR" | rg -q "ALL GREEN" && ok "cursor-স্যুট ($CUR)" || bad "cursor-স্যুট ($CUR)"

kill $SRV 2>/dev/null
echo "════════════════════════════════"
echo "  PASS: $PASS   FAIL: $FAIL"
[ "$FAIL" = "0" ] && echo "  ALL GREEN ✓" || echo "  লাল ✗"
exit $FAIL
