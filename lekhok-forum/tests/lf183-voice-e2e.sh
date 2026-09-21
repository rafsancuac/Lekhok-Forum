#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# /tmp/lf183-voice-e2e.sh — session183 ভয়েস-স্থায়িত্ব E2E (curl-হারনেস)
# data-URI-in-DB আপলোড → স্ট্রিম-লিংক রেন্ডার → /api/messages/audio/:id সার্ভ
# ═══════════════════════════════════════════════════════════════════════════
set -u
BASE=http://localhost:8094
J1=/tmp/lf183-j1.txt; J2=/tmp/lf183-j2.txt; J3=/tmp/lf183-j3.txt
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }

getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J="$1" U="$2"
  rm -f "$J"
  local TOK=$(getcsrf "$J" /login)
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK"
  TOK=$(getcsrf "$J" /login)
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK"
  curl -s -b "$J" -c "$J" -o /dev/null "$BASE/messages"
}

echo "── [0] সার্ভার-রিস্টার্ট (ফাইল-ডিবির সাম্প্রতিকতম-অবস্থা লোড)"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash /home/z/lekhok-forum/ensure-server.sh > /dev/null 2>&1
sleep 1

echo "── [1] লগইন"
login "$J1" testuser && ok "testuser লগইন" || bad "testuser লগইন"
login "$J2" qa113user && ok "qa113user লগইন" || bad "qa113user লগইন"
login "$J3" testuser2 && ok "testuser2 লগইন" || bad "testuser2 লগইন"

echo "── [2] ভয়েস-মেসেজ পাঠানো (multipart → data-URI-in-DB)"
TOK1=$(getcsrf "$J1" /messages/qa113user)
RESP=$(curl -s -b "$J1" -c "$J1" -X POST "$BASE/messages/qa113user" \
  -F "attachment=@/tmp/lf183-voice.wav;type=audio/wav" \
  -F "duration=5" -F "body=" -H "Accept: application/json" -H "X-CSRF-Token: $TOK1")
if echo "$RESP" | rg -q "নিরাপত্তা যাচাই"; then  # রিপো-কনভেনশন: csrf-retry (lf153-প্যাটার্ন)
  TOK1=$(getcsrf "$J1" /messages/qa113user)
  RESP=$(curl -s -b "$J1" -c "$J1" -X POST "$BASE/messages/qa113user" \
    -F "attachment=@/tmp/lf183-voice.wav;type=audio/wav" \
    -F "duration=5" -F "body=" -H "Accept: application/json" -H "X-CSRF-Token: $TOK1")
fi
echo "  resp: $RESP"
MID=$(echo "$RESP" | rg -o '"id":[0-9]+' | rg -o '[0-9]+' | head -1)
[ -n "${MID:-}" ] && ok "মেসেজ তৈরি id=$MID" || bad "মেসেজ তৈরি হয়নি: $RESP"

echo "── [3] DB-যাচাই — file_url = data:audio/... (২০০ms-ডিবাউন্স-সেভের জন্য রি-ট্রাই)"
cd "$(cd "$(dirname "$0")/.." && pwd)"
DBOK=0
for i in $(seq 1 10); do
  if node -e "
const db=require('./db'); db.initDb().then(async()=>{
  const r = await db.prepare('SELECT file_url, file_name, duration FROM messages WHERE id=?').get($MID);
  if (!r) { console.log('ROW:missing'); process.exit(1); }
  const ok = /^data:audio\\/wav;base64,[A-Za-z0-9+\\/=]+$/.test(r.file_url||'');
  console.log('ROW:' + (ok?'OK':'BAD') + ' mime=' + (r.file_url||'').slice(0,15) + ' len=' + (r.file_url||'').length + ' dur=' + r.duration + ' name=' + r.file_name);
  process.exit(ok?0:1);
});" ; then DBOK=1; break; fi
  sleep 1
done
[ "$DBOK" = "1" ] && ok "DB-তে data-URI স্থায়ী" || bad "DB-তে data-URI নেই"

echo "── [4] চ্যাট-পেজ রেন্ডার — bubble-voice + স্ট্রিম-লিংক"
CHAT=$(curl -s -b "$J1" -c "$J1" "$BASE/messages/qa113user")
echo "$CHAT" | rg -q "bubble-voice" && ok "bubble-voice রেন্ডার" || bad "bubble-voice নেই"
echo "$CHAT" | rg -q "data-src=\"/api/messages/audio/$MID-voice.webm\"" && ok "data-src = স্ট্রিম-লিংক" || bad "data-src ভুল"
echo "$CHAT" | rg -q "data:audio/" && bad "পেজে কাঁচা data-URI লিক (পেলোড ভারী)" || ok "পেজ-পেলোডে data-URI নেই (হালকা)"

echo "── [5] অডিও স্ট্রিম-এন্ডপয়েন্ট"
S1=$(curl -s -b "$J1" -c "$J1" -o /tmp/lf183-a1.bin -w "%{http_code} %{content_type} %{size_download}" "$BASE/api/messages/audio/$MID-voice.webm")
echo "  sender: $S1"
[ "${S1%% *}" = "200" ] && ok "প্রেরক পাচ্ছেন" || bad "প্রেরক-ব্যর্থ: $S1"
echo "$S1" | rg -q "audio/wav" && ok "Content-Type audio/wav" || bad "Content-Type: $S1"
cmp -s /tmp/lf183-a1.bin /tmp/lf183-voice.wav && ok "বাইট-লসলেস (আপলোড=ডাউনলোড)" || bad "বাইট-মিলছে না"
S2=$(curl -s -b "$J2" -c "$J2" -o /dev/null -w "%{http_code}" "$BASE/api/messages/audio/$MID-voice.webm")
[ "$S2" = "200" ] && ok "প্রাপক পাচ্ছেন" || bad "প্রাপক-ব্যর্থ: $S2"
S3=$(curl -s -b "$J3" -c "$J3" -o /dev/null -w "%{http_code}" "$BASE/api/messages/audio/$MID-voice.webm")
[ "$S3" = "403" ] && ok "অসংশ্লিষ্ট ইউজার 403" || bad "অনুমতি-লিক: $S3"
S4=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/messages/audio/$MID-voice.webm")
if [ "$S4" = "401" ] || [ "$S4" = "302" ]; then ok "লগইন-বিহীন ব্লক ($S4)"; else bad "লগইন-বিহীন: $S4"; fi

echo "── [6] পোল-এন্ডপয়েন্ট — সংক্ষিপ্ত লিংক"
CID=$(node -e "
const db=require('./db'); db.initDb().then(async()=>{
  const r = await db.prepare('SELECT conversation_id FROM messages WHERE id=?').get($MID);
  console.log(r ? r.conversation_id : 0); process.exit(0);
});" | tail -1)
echo "  conv=$CID"
POL=$(curl -s -b "$J2" -c "$J2" "$BASE/api/messages/check?conversation_id=$CID&since=$((MID-1))")
echo "$POL" | rg -q "/api/messages/audio/$MID-voice.webm" && ok "পোলে সংক্ষিপ্ত লিংক" || bad "পোল: ${POL:0:120}"
echo "$POL" | rg -q "data:audio" && bad "পোলে কাঁচা data-URI" || ok "পোল-পেলোড হালকা"

echo "── [7] সাইডবার প্রিভিউ — 🎙️ ভয়েস মেসেজ"
SB=$(curl -s -b "$J2" -c "$J2" "$BASE/messages")
echo "$SB" | rg -q "🎙️ ভয়েস মেসেজ" && ok "সাইডবারে ভয়েস-লেবেল" || bad "সাইডবারে ভয়েস-লেবেল নেই"

echo "── [8] সার্ভার-রিস্টার্ট-স্থায়িত্ব (আসল-অভিযোগ: 'পরে শুনতে পারছি না')"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash /home/z/lekhok-forum/ensure-server.sh
sleep 1
S5=$(curl -s -m 10 -b "$J2" -c "$J2" -o /tmp/lf183-a2.bin -w "%{http_code} %{content_type} %{size_download}" "$BASE/api/messages/audio/$MID-voice.webm")
echo "  after-restart: $S5"
[ "${S5%% *}" = "200" ] && ok "রিস্টার্টের-পরেও প্রাপক শুনতে পাচ্ছেন" || bad "রিস্টার্ট-পরবর্তী: $S5"
cmp -s /tmp/lf183-a2.bin /tmp/lf183-voice.wav && ok "রিস্টার্ট-পরেও বাইট-লসলেস" || bad "রিস্টার্ট-পরে বাইট-অমিল"

echo
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ]
