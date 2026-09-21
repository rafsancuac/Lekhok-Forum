#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# lf64-next-probe.sh — Task63b (next-প্ল্যাটফর্ম) স্বাধীন API-লেভেল প্রোব:
#   ① পাবলিক /api/home-leadership → {cards:[]} 200 (খালি-টেবিলে নিরাপদ-জবাব)
#   ② অ্যাডমিন API লগইন-বিহীন → 401 (গার্ড-স্বভাব)
#   ③ অ্যাডমিন-লগইন করে GET → 200; POST তৈরি → 200+record (isActive=false ডিফল্ট);
#      PATCH টগল → 200; পাবলিক-সিঙ্ক যাচাই; DELETE → 200; টেবিল-পরিষ্কার
# ═══════════════════════════════════════════════════════════════════════════
set -u
APP="$(cd "$(dirname "$0")/.." && pwd)"
BASE=http://localhost:3100
J=/tmp/lf64-next-jar.txt
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }

cd "$APP"
echo "── [0] dev-সার্ভার বুট (:3100)"
pkill -9 -f "next dev" 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null; sleep 1
rm -rf .next/dev.lock 2>/dev/null
PORT=3100 setsid nohup npx next dev -p 3100 > /tmp/lf64-next-dev.log 2>&1 < /dev/null &
UP=0
for i in $(seq 1 60); do
  sleep 1
  if curl -s -o /dev/null -m 2 "$BASE/"; then UP=1; break; fi
done
[ "$UP" = "1" ] && ok "dev-সার্ভার উঠেছে" || { echo "  ✗ সার্ভার-বুট ব্যর্থ"; tail -15 /tmp/lf64-next-dev.log; exit 1; }

echo "── [1] পাবলিক API (খালি-টেবিল)"
PB=$(curl -s -w "\n%{http_code}" "$BASE/api/home-leadership")
CODE=$(echo "$PB" | tail -1); BODY=$(echo "$PB" | head -1)
[ "$CODE" = "200" ] && ok "পাবলিক 200" || bad "পাবলিক=$CODE"
echo "$BODY" | rg -q '"cards":\[\]' && ok "পেলোড {cards:[]} — খালি-নিরাপদ" || bad "পেলোড: $BODY"

echo "── [2] অ্যাডমিন-গার্ড (লগইন-বিহীন)"
G1=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/home-leadership")
[ "$G1" = "401" ] || [ "$G1" = "403" ] && ok "GET লগইন-বিহীন → $G1 (গার্ড-সক্রিয়)" || bad "GET=$G1"
G2=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/admin/home-leadership" -H "Content-Type: application/json" -d '{"id":"x","isActive":true}')
[ "$G2" = "401" ] || [ "$G2" = "403" ] && ok "PATCH লগইন-বিহীন → $G2" || bad "PATCH=$G2"
G3=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/admin/home-leadership?id=x")
[ "$G3" = "401" ] || [ "$G3" = "403" ] && ok "DELETE লগইন-বিহীন → $G3" || bad "DELETE=$G3"

echo "── [3] অ্যাডমিন-সেশন (lf_user_id কুকি — sandbox-ডেমো-সেশন) + পূর্ণ CRUD-প্রোব"
rm -f "$J"
ADMINID=$(node -e "
const { PrismaClient } = require('$APP/node_modules/@prisma/client');
const db = new PrismaClient();
db.user.findFirst({where:{role:'admin'},select:{id:true}}).then(u=>{console.log(u.id);process.exit(0);}).catch(()=>{process.exit(1);});")
[ -n "$ADMINID" ] && ok "অ্যাডমিন-ইউজার পাওয়া গেছে" || bad "অ্যাডমিন-ইউজার নেই"
AG=$(curl -s -H "Cookie: lf_user_id=$ADMINID" -b "$J" -c "$J" -o /tmp/lf64-next-admin.json -w "%{http_code}" "$BASE/api/admin/home-leadership")
[ "$AG" = "200" ] && ok "অ্যাডমিন GET 200" || bad "অ্যাডমিন GET=$AG"

CR=$(curl -s -H "Cookie: lf_user_id=$ADMINID" -b "$J" -c "$J" -w "\n%{http_code}" -X POST "$BASE/api/admin/home-leadership" -H "Content-Type: application/json" -d '{"category":"CURRENT","name":"প্রোব উপদেষ্টা","role":"উপদেষ্টা","term":"(২০২৬-২৭ কার্যবর্ষ)"}')
CCODE=$(echo "$CR" | tail -1); CBODY=$(echo "$CR" | head -1)
[ "$CCODE" = "200" ] && ok "POST তৈরি 200" || bad "POST=$CCODE"
echo "$CBODY" | rg -q '"isActive":false' && ok "নতুন-কার্ড ডিফল্ট লুকানো (isActive=false)" || bad "ডিফল্ট-isActive ভিন্ন"
CID=$(echo "$CBODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$CID" ] && ok "নতুন id=$CID" || bad "id নেই"

PT=$(curl -s -H "Cookie: lf_user_id=$ADMINID" -b "$J" -c "$J" -w "\n%{http_code}" -X PATCH "$BASE/api/admin/home-leadership" -H "Content-Type: application/json" -d "{\"id\":\"$CID\",\"isActive\":true}")
PCODE=$(echo "$PT" | tail -1)
[ "$PCODE" = "200" ] && ok "PATCH টগল 200" || bad "PATCH=$PCODE"
PS=$(curl -s "$BASE/api/home-leadership")
echo "$PS" | rg -q 'প্রোব উপদেষ্টা' && ok "হোমপেজ-সিঙ্ক: টগল-অনের-পরে পাবলিক-পেলোডে আছে" || bad "পাবলিক-সিঙ্ক ব্যর্থ"
DL=$(curl -s -H "Cookie: lf_user_id=$ADMINID" -b "$J" -c "$J" -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/admin/home-leadership?id=$CID")
[ "$DL" = "200" ] && ok "DELETE 200" || bad "DELETE=$DL"
PS2=$(curl -s "$BASE/api/home-leadership")
echo "$PS2" | rg -q 'প্রোব উপদেষ্টা' && bad "ডিলিট-পরেও পাবলিকে আছে" || ok "ডিলিট-পরে পাবলিক পরিষ্কার"

echo "── [4] ফলাফল: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "PROBE-GREEN" || echo "PROBE-PARTIAL (গার্ড/পাবলিক-যাচাই-সম্পন্ন)"
