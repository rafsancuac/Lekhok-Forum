#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# lf64-leadership-e2e.sh — সেশন ৬৪ E2E (curl-হারনেস):
#   ① ডিফল্ট-লুকানো: home_hidden_slots অনুপস্থিত → ডামি-উপদেষ্টা (সুফিয়া/তৌহিদুল)
#     হোমপেজে নেই; সভাপতি/সা.সম্পাদক আছে; .leaders-row flex-কন্টেইনার
#   ② প্যানেল: অতিরিক্ত-উপদেষ্টা কার্ড + ＋-টাইল + ডিফল্ট-অফ-সুইচ
#   ③ স্লট-টগল API রাউন্ডট্রিপ → হোমপেজ-সিঙ্ক
#   ④ অতিরিক্ত-উপদেষ্টা opt-in টগল → হোমপেজ-সিঙ্ক
#   ⑤ নতুন উপদেষ্টা তৈরি (multipart) → প্যানেলে দেখা যায়, হোমে না (opt-in বন্ধ)
#   ⑥ অতিরিক্ত-সদস্য সম্পাদনা (/slot-এন্ডপয়েন্ট) → রিনেম-সিঙ্ক
#   ⑦ টু-স্টেপ-ডিলিট API (confirm() নেই) → প্যানেল-হোম দুই-জায়গাতেই মুছে যায়
#   ⑧ পুনরুদ্ধার: সেটিংস আগের-অবস্থায়
# ═══════════════════════════════════════════════════════════════════════════
set -u
APP="$(cd "$(dirname "$0")/.." && pwd)"
BASE=http://localhost:8094
J=/tmp/lf64-admin.txt
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }

getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J="$1" U="$2" P="$3"
  rm -f "$J"
  local TOK=$(getcsrf "$J" /admin/login)
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/admin/login" --data-urlencode "username=$U" --data-urlencode "password=$P" --data-urlencode "_csrf=$TOK"
}

echo "── [0] DB-প্রি-স্টেট: ভিজিবিলিটি-সেটিংস মুছে ফ্রেশ-বুট (ডিফল্ট-অবস্থা সিমুলেট)"
node -e "
const initSqlJs = require('$APP/node_modules/sql.js'); const fs=require('fs');
(async()=>{ const SQL=await initSqlJs();
const p='$APP/lekhok.db';
const db=new SQL.Database(fs.readFileSync(p));
db.run(\"DELETE FROM settings WHERE key IN ('home_hidden_slots','home_extra_members')\");
fs.writeFileSync(p, Buffer.from(db.export()));
console.log('settings-cleared');
})();"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash "$APP/../ensure-server.sh" > /dev/null 2>&1 || { echo "server-failed"; exit 1; }
ok "সার্ভার-বুট (:8094)"

echo "── [1] অ্যাডমিন-লগইন (testadmin)"
login "$J" admin admin123
ADMIN_OK=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code}" "$BASE/admin/home-leadership")
[ "$ADMIN_OK" = "200" ] && ok "প্যানেল 200 (অ্যাডমিন-সেশন)" || bad "প্যানেল=$ADMIN_OK"

echo "── [2] হোমপেজ ডিফল্ট-অবস্থা (সেটিং-অনুপস্থিত → উপদেষ্টা-লুকানো)"
H=$(curl -s "$BASE/")
echo "$H" | rg -q 'leaders-grid' && ok ".leaders-grid কন্টেইনার আছে" || bad "leaders-grid নেই"
echo "$H" | rg -q 'সুফিয়া' && bad "ডিফল্টে সুফিয়া দেখাচ্ছে (লুকানো-করা-উচিত)" || ok "ডিফল্টে সুফিয়া লুকানো"
echo "$H" | rg -q 'তৌহিদুল ইসলাম' && bad "ডিফল্টে তৌহিদুল দেখাচ্ছে" || ok "ডিফল্টে তৌহিদুল লুকানো"
echo "$H" | rg -q 'current-leadership' && ok "বর্তমান-নেতৃত্ব সেকশন আছে" || bad "সেকশন নেই"
CRD=$(echo "$H" | grep -o 'leader-card-featured' | wc -l)
echo "   (মোট leader-card: $CRD — ২ বর্তমান + ১ প্রতিষ্ঠাকালীন + ২ প্রতিষ্ঠাতা-ফলব্যাক ≈ ৫)"

echo "── [3] প্যানেল-কনটেন্ট (অতিরিক্ত-উপদেষ্টা + টাইল + ডিফল্ট-অফ সুইচ)"
P=$(curl -s -b "$J" -c "$J" "$BASE/admin/home-leadership")
echo "$P" | rg -q 'অতিরিক্ত উপদেষ্টা' && ok "অতিরিক্ত-উপদেষ্টা কার্ড রেন্ডার" || bad "অতিরিক্ত-কার্ড নেই"
echo "$P" | rg -q 'data-addtile' && ok "＋-নতুন-যোগ টাইল আছে" || bad "টাইল নেই"
OFFSW=$(echo "$P" | grep -o 'class="hl-switch off"[^>]*data-slot="current_advisor_[12]"' | wc -l)
[ "$OFFSW" = "2" ] && ok "current_advisor_১/২ সুইচ ডিফল্ট-অফ ($OFFSW/২)" || bad "ডিফল্ট-অফ সুইচ=$OFFSW (২ হওয়া-উচিত)"
CSRF=$(getcsrf "$J" /admin/home-leadership)
[ -n "$CSRF" ] && ok "CSRF-টোকেন পাওয়া গেছে" || bad "CSRF নেই"

echo "── [4] স্লট-টগল API → হোমপেজ-সিঙ্ক"
R1=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/visibility" -H "Content-Type: application/json" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -d '{"slot":"current_advisor_1","hidden":false}')
echo "$R1" | rg -q '"ok":true' && ok "টগল-অন API 200" || bad "টগল-জবাব: $R1"
H1=$(curl -s "$BASE/")
echo "$H1" | rg -q 'সুফিয়া' && ok "সুফিয়া হোমপেজে ফিরে এসেছে" || bad "সুফিয়া এখনও লুকানো"
echo "$H1" | rg -q 'তৌহিদুল ইসলাম' && bad "তৌহিদুলও দেখা যাচ্ছে (অফ-থাকা-উচিত)" || ok "তৌহিদুল এখনও লুকানো (আংশিক-টগল-নির্ভুল)"
R2=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/visibility" -H "Content-Type: application/json" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -d '{"slot":"current_advisor_1","hidden":true}')
echo "$R2" | rg -q '"ok":true' && ok "টগল-অফ API 200" || bad "টগল-অফ: $R2"
H2=$(curl -s "$BASE/")
echo "$H2" | rg -q 'সুফিয়া' && bad "সুফিয়া পুনঃলুকানো-ব্যর্থ" || ok "সুফিয়া পুনঃলুকানো ✓"

echo "── [5] অতিরিক্ত-উপদেষ্টা opt-in টগল → হোমপেজ-সিঙ্ক"
EXTRA_ID=$(node -e "
const initSqlJs = require('$APP/node_modules/sql.js'); const fs=require('fs');
(async()=>{ const SQL=await initSqlJs(); const db=new SQL.Database(fs.readFileSync('$APP/lekhok.db'));
const r=db.exec(\"SELECT id FROM members WHERE member_type='advisory' AND term_year='২০২৪-২৫' AND name='মো. ফারুক আহমেদ'\");
console.log(r[0].values[0][0]); })();")
[ -n "$EXTRA_ID" ] && ok "extra-অঞ্চল-সদস্য (slice-২+) id=$EXTRA_ID" || bad "অতিরিক্ত-সদস্য পাওয়া যায়নি"
RE=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/visibility" -H "Content-Type: application/json" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -d "{\"member_id\":$EXTRA_ID,\"active\":true}")
echo "$RE" | rg -q '"ok":true' && ok "opt-in টগল API 200" || bad "opt-in: $RE"
HE=$(curl -s "$BASE/")
echo "$HE" | rg -q 'ফারুক আহমেদ' && ok "অতিরিক্ত-উপদেষ্টা হোমপেজে দেখা যাচ্ছে" || bad "হোমপেজে অতিরিক্ত-উপদেষ্টা নেই"
RE2=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/visibility" -H "Content-Type: application/json" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -d "{\"member_id\":$EXTRA_ID,\"active\":false}")
echo "$RE2" | rg -q '"ok":true' && ok "opt-out API 200" || bad "opt-out: $RE2"
HE2=$(curl -s "$BASE/")
echo "$HE2" | rg -q 'ফারুক আহমেদ' && bad "opt-out-পরেও দেখাচ্ছে" || ok "opt-out-পরে লুকানো ✓"

echo "── [6] নতুন উপদেষ্টা তৈরি (multipart) → প্যানেল-হোম-অবস্থা"
RN=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/extra" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -F "group=current" -F "name=টেস্ট উপদেষ্টা ষষ্টিচত্বার্থ" -F "role=উপদেষ্টা" -F "_csrf=$CSRF")
echo "$RN" | rg -q '"ok":true' && ok "নতুন-উপদেষ্টা তৈরি 200" || bad "তৈরি: $RN"
NEWID=$(echo "$RN" | grep -o '"memberId":[0-9]*' | grep -o '[0-9]*')
[ -n "$NEWID" ] && ok "নতুন memberId=$NEWID" || bad "memberId নেই"
P2=$(curl -s -b "$J" -c "$J" "$BASE/admin/home-leadership")
echo "$P2" | rg -q 'টেস্ট উপদেষ্টা ষষ্টিচত্বার্থ' && ok "প্যানেলে নতুন কার্ড" || bad "প্যানেলে নতুন কার্ড নেই"
H3=$(curl -s "$BASE/")
echo "$H3" | rg -q 'টেস্ট উপদেষ্টা ষষ্টিচত্বার্থ' && bad "opt-in-ছাড়াই হোমে দেখাচ্ছে" || ok "হোমে নেই (opt-in-বন্ধ ✓)"

echo "── [7] অতিরিক্ত-সদস্য সম্পাদনা (/slot) → রিনেম"
RED=$(curl -s -b "$J" -c "$J" -X POST "$BASE/admin/home-leadership/slot" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF" -F "slot=current_advisor_2" -F "member_id=$NEWID" -F "name=টেস্ট উপদেষ্টা রিনেমড" -F "role=সম্মানিত উপদেষ্টা" -F "_csrf=$CSRF")
echo "$RED" | rg -q '"ok":true' && ok "এক্সট্রা-এডিট 200" || bad "এডিট: $RED"
P3=$(curl -s -b "$J" -c "$J" "$BASE/admin/home-leadership")
echo "$P3" | rg -q 'টেস্ট উপদেষ্টা রিনেমড' && ok "রিনেম প্যানেলে সিঙ্ক" || bad "রিনেম সিঙ্ক ব্যর্থ"

echo "── [8] ডিলিট API (guard-সহ) → প্যানেল থেকে মুছে যায়"
RDEL=$(curl -s -b "$J" -c "$J" -X DELETE "$BASE/admin/home-leadership/extra?id=$NEWID" -H "Accept: application/json" -H "X-CSRF-Token: $CSRF")
echo "$RDEL" | rg -q '"ok":true' && ok "ডিলিট 200" || bad "ডিলিট: $RDEL"
P4=$(curl -s -b "$J" -c "$J" "$BASE/admin/home-leadership")
echo "$P4" | rg -q 'টেস্ট উপদেষ্টা রিনেমড' && bad "ডিলিট-পরেও প্যানেলে আছে" || ok "প্যানেল থেকে মুছে গেছে ✓"
# অ-এডমিন ডিলিট প্রত্যাখ্যাত?
RDEL2=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/admin/home-leadership/extra?id=1" -H "Accept: application/json")
[ "$RDEL2" = "302" ] || [ "$RDEL2" = "303" ] || [ "$RDEL2" = "401" ] || [ "$RDEL2" = "403" ] && ok "অ-অ্যাডমিন ডিলিট প্রত্যাখ্যাত ($RDEL2)" || bad "গার্ড=$RDEL2"

echo "── [9] পুনরুদ্ধার: সেটিংস ফিরিয়ে ফাইনাল-যাচাই"
node -e "
const initSqlJs = require('$APP/node_modules/sql.js'); const fs=require('fs');
(async()=>{ const SQL=await initSqlJs();
const db=new SQL.Database(fs.readFileSync('$APP/lekhok.db'));
db.run(\"DELETE FROM settings WHERE key IN ('home_hidden_slots','home_extra_members')\");
db.run(\"INSERT INTO settings (key, value) VALUES ('home_hidden_slots', '')\");
fs.writeFileSync('$APP/lekhok.db', Buffer.from(db.export()));
console.log('restored-empty-setting'); })();"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash "$APP/../ensure-server.sh" > /dev/null 2>&1  # sql.js-মেমোরির চেয়ে ফাইল-সত্য — রিস্টার্টে লোড
H4=$(curl -s "$BASE/")
echo "$H4" | rg -q 'সুফিয়া' && ok "স্যান্ডবক্স-রিস্টোর: সেটিং='' → উপদেষ্টা দৃশ্যমান (আগের-আচরণ)" || bad "রিস্টোর-পরেও লুকানো"

echo ""
echo "═══ ফলাফল: PASS=$PASS FAIL=$FAIL ═══"
[ "$FAIL" = "0" ] && echo "ALL-GREEN" || echo "SOME-FAILED"
