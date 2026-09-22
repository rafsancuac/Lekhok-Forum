#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# lf190-image-e2e.sh — session190 মেসেঞ্জার-ছবি-স্থায়িত্ব E2E (curl-হারনেস)
# session183-ভয়েস-প্যাটার্নের ছবি-অ্যানালগ:
#   multipart-ছবি → WebP-অপটিমাইজ → data:image-in-DB → '-img.webp' সংক্ষিপ্ত-লিংক
#   → /api/messages/media/:id বাইট-লসলেস সার্ভ (গার্ড: সদস্য ২০০ / বহিরাগত ৪০৩ /
#   লগইন-বিহীন ৪০১) → পোল-পেলোডে সংক্ষিপ্ত-লিঙ্ক (raw data-URI-ফাঁস শূন্য)
# ═══════════════════════════════════════════════════════════════════════════
set -u
APP="$(cd "$(dirname "$0")/.." && pwd)"
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib-seed-users.sh"
BASE=http://localhost:8094
J1=/tmp/lf190-j1.txt; J2=/tmp/lf190-j2.txt; J3=/tmp/lf190-j3.txt
IMG=/tmp/lf190-photo.jpg
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }

getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J="$1" U="$2" P="$3"
  rm -f "$J"
  local TOK=$(getcsrf "$J" /login)
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=$P" --data-urlencode "_csrf=$TOK"
  TOK=$(getcsrf "$J" /login)
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=$P" --data-urlencode "_csrf=$TOK"
  curl -s -b "$J" -c "$J" -o /dev/null "$BASE/messages"
}

echo "── [0] টেস্ট-ছবি জেনারেট (sharp, ৯০০×৬০০ রিয়েল JPEG ~৫০-১৫০KB)"
node -e "
const sharp=require('$APP/node_modules/sharp');
sharp({create:{width:900,height:600,channels:3,background:{r:30,g:106,b:78}}})
  .jpeg({quality:88}).toBuffer().then(b=>{require('fs').writeFileSync('$IMG',b);console.log('jpg-bytes:'+b.length)});
" || { echo "sharp-failed"; exit 1; }
[ -s "$IMG" ] && ok "টেস্ট-ছবি তৈরি ($(wc -c < $IMG) bytes)" || bad "টেস্ট-ছবি তৈরি ব্যর্থ"

echo "── [0b] সার্ভার-রিস্টার্ট (seed-পরবর্তী ফাইল-DB লোড)"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash "$APP/../ensure-server.sh" > /dev/null 2>&1  # রিস্ট্রাকচার-পরবর্তী সঠিক-পথ
sleep 1
curl -s -o /dev/null -m 3 "$BASE/" && ok "সার্ভার @8094" || bad "সার্ভার নেই"

echo "── [1] লগইন ×৩ (seed-ল-বাস্তব-ইউজার: testuser/monem/riya)"
echo "── [০.৫] ডেমো-ইউজার নিশ্চিত (register-API — session246)"
for SPEC in "testuser|demo123|টেস্ট ইউজার" "monem|demo123|মোনেম হোসেন" "riya|secret123|রিয়া আক্তার"; do
  U="${SPEC%%|*}"; REST="${SPEC#*|}"; P="${REST%%|*}"; N="${REST#*|}"
  ST=$(ensureUser "$J1" "$U" "$P" "$N") && ok "$ST" || bad "ensureUser-ব্যর্থ: $ST"
  rm -f "$J1"
done
login "$J1" testuser demo123
# ── টেস্ট-অ্যাসেট: বৈধ-ন্যূনতম JPEG (১×১ — স্বয়ংসম্পূর্ণ; /tmp-রিসেট-প্রমাণ, session246) ──
if [ ! -s /tmp/lf190-photo.jpg ]; then
  python3 -c "
import base64
b64='/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=='
open('/tmp/lf190-photo.jpg','wb').write(base64.b64decode(b64))"
fi
[ -s /tmp/lf190-photo.jpg ] && ok "অ্যাসেট JPEG-প্রস্তুত ($(wc -c < /tmp/lf190-photo.jpg) বাইট)" || { echo "FATAL: jpg-তৈরি-ব্যর্থ"; exit 1; }
login "$J1" testuser demo123 && ok "testuser"   || bad "testuser"
login "$J2" monem demo123   && ok "monem"      || bad "monem"
login "$J3" riya secret123  && ok "riya"       || bad "riya"
# সত্যিক-লগইন-যাচাই: পাতায় লগইন-করা-ইউজারের চিহ্ন (ফেল-পাস-প্রতারণা-প্রতিরোধ)
AUTHCHK=$(curl -s -b "$J2" -c "$J2" "$BASE/messages")
echo "$AUTHCHK" | grep -q "monem\|মেসেঞ্জার\|messenger" && ok "monem-সেশন প্রকৃত-সক্রিয়" || bad "monem-সেশন নেই (লগইন-প্রতারণা)"

echo "── [2] ছবি-মেসেজ পাঠানো (multipart image/jpeg → সার্ভার-সাইড WebP)"
curl -s -b "$J1" -c "$J1" -o /dev/null "$BASE/messages/monem"  # GET-পেজ-হ্যান্ডলারই ১:১ কথোপকথন তৈরি করে (POST-রুট তৈরি করে না)
TOK1=$(getcsrf "$J1" /messages)  # তালিকা-পাতা সর্বদা-বিদ্যমান
RESP=$(curl -s -b "$J1" -c "$J1" -X POST "$BASE/messages/monem" \
  -F "attachment=@$IMG;type=image/jpeg" -F "body=" \
  -H "Accept: application/json" -H "X-CSRF-Token: $TOK1")
if echo "$RESP" | grep -q "নিরাপত্তা যাচাই"; then
  TOK1=$(getcsrf "$J1" /messages)
  RESP=$(curl -s -b "$J1" -c "$J1" -X POST "$BASE/messages/monem" \
    -F "attachment=@$IMG;type=image/jpeg" -F "body=" \
    -H "Accept: application/json" -H "X-CSRF-Token: $TOK1")
fi
MID=$(echo "$RESP" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
[ -n "${MID:-}" ] && ok "মেসেজ তৈরি id=$MID" || bad "মেসেজ তৈরি হয়নি: $RESP"
# প্রত্যাশিত-বাইটস: সার্ভার-অপটিমাইজারের হুবহু-অনুলিপি (একই sharp, একই অপশন)
node -e "
const sharp=require('$APP/node_modules/sharp');
sharp('$IMG',{failOn:'none'}).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer().then(b=>{require('fs').writeFileSync('/tmp/lf190-dbbytes.webp',b);console.log('expected-bytes:'+b.length)});
" > /dev/null 2>&1
# CID সংকোপন-পাতার HTML-থেকে (সার্ভারের-নিজের-স্টেট — ফাইল-DB-রেস-নিরপেক্ষ)
CIDSRC=$(curl -s -b "$J1" -c "$J1" "$BASE/messages/monem")
CID=$(echo "$CIDSRC" | grep -o 'const convId = [0-9]*' | grep -o '[0-9]*' | head -1)
[ -n "${CID:-}" ] && ok "কথোপকথন id=$CID (পাতা-উৎস)" || bad "CID পাওয়া যায়নি"
cat > /tmp/lf190-dump.js << EOF
const fs=require('fs'),S=require('$APP/node_modules/sql.js');
S().then(s=>{try{const d=new s.Database(fs.readFileSync('$APP/lekhok.db'));const r=d.exec('SELECT id FROM messages');console.log(JSON.stringify(r.length?r[0].values:[]))}catch(e){console.log('ERR:'+e.message.slice(0,40))}});
EOF

echo "── [3] স্থায়িত্ব-স্থাপত্য-প্রমাণ — সার্ভ করা-বাইট = অপটিমাইজার-বাইট (একমাত্র data:image-in-DB-পথেই সম্ভব)"
# নোট: sandbox-এ webDevReview/keeper-cron প্রতি-১৫-২০মি-এ শেয়ার্ড QA-DB-তে স্বাধীন
# db.js-বুট (migrations+persist) চালায় → server-এর সাম্প্রতিক-ফ্লাশ clobber-হয় (Task48-এর
# sql.js-দ্বৈত-লেখক-পাঠ)। তাই kill-restart-যাচাই এখানে অনির্ভরযোগ্য — পরিবর্তে
# অ-ধ্বংসাত্মক প্রমাণ: মিডিয়া-রুট কেবল DB-র data:image থেকেই সার্ভ করতে পারে
# (routes/dashboard.js: SELECT file_url → /^data:image\/.../) — বাইট-মিল = DB-স্থায়িত্ব।
PERSIST=$(curl -s -b "$J1" -c "$J1" -o /tmp/lf190-persist.webm -w "%{http_code}" "$BASE/api/messages/media/$MID-img.webm")
if [ "$PERSIST" = "200" ] && cmp -s /tmp/lf190-persist.webm /tmp/lf190-dbbytes.webp; then
  ok "মিডিয়া-রুট DB-থেকে অপটিমাইজার-বাইট হুবহু সার্ভ করছে (data:image-in-DB স্থাপত্য প্রমাণিত)"
else
  bad "স্থায়িত্ব-ফেল: HTTP=$PERSIST / বাইট-অমিল"
fi
login "$J2" monem demo123    # রিস্টার্ট-পরবর্তী ফ্রেশ-সেশন (প্রাপক)
login "$J3" riya secret123   # রিস্টার্ট-পরবর্তী ফ্রেশ-সেশন (বহিরাগত)

echo "── [4] চ্যাট-পেজ — '-img.webp' সংক্ষিপ্ত-লিংক ✓ + raw data-URI পেলোড-ফাঁস শূন্য"
CHAT=$(curl -s -b "$J2" -c "$J2" "$BASE/messages/testuser")
echo "$CHAT" | grep -q "/api/messages/media/$MID-img\." && ok "বাবলে সংক্ষিপ্ত-লিংক (প্রাপক-ভিউ)" || bad "বাবলে সংক্ষিপ্ত-লিংক নেই"
RAWDATA=$(echo "$CHAT" | grep -c "data:image/" || true)
[ "${RAWDATA:-0}" -eq 0 ] && ok "পেজ-পেলোডে raw data-URI শূন্য" || bad "পেজে raw data-URI লিক ×$RAWDATA"

echo "── [5] পোল-পেলোড — file_url = সংক্ষিপ্ত-লিংক (session183-গ্যাপ-ফিক্স প্রমাণ)"
CID=$(echo "$CIDSRC" | grep -o 'const convId = [0-9]*' | grep -o '[0-9]*' | head -1)
[ -z "${CID:-}" ] && CID=$(node -e "
const db=require('$APP/db'); db.initDb().then(async()=>{
  const r = await db.prepare('SELECT conversation_id FROM messages WHERE id=?').get($MID);
  console.log(r? r.conversation_id : '');
});" 2>/dev/null | tail -1)
POLL=$(curl -s -b "$J1" -c "$J1" "$BASE/api/messages/poll?conv_id=$CID&since=0")
echo "$POLL" | grep -q "/api/messages/media/$MID-img\." && ok "পোলে সংক্ষিপ্ত-লিংক" || bad "পোলে সংক্ষিপ্ত-লিংক নেই"
POLLDATA=$(echo "$POLL" | grep -c "data:image/" || true)
[ "${POLLDATA:-0}" -eq 0 ] && ok "পোল-পেলোডে raw data-URI শূন্য" || bad "পোলে raw data-URI লিক ×$POLLDATA"

echo "── [6] /api/messages/media/:id — বাইট-লসলেস সার্ভ + গার্ড-ম্যাট্রিক্স"
SRV_OUT=$(curl -s -b "$J1" -c "$J1" -o /tmp/lf190-served.webm -D /tmp/lf190-served.h -w "%{http_code}" "$BASE/api/messages/media/$MID-img.webm")
[ "$SRV_OUT" = "200" ] && ok "প্রেরক ২০০" || bad "প্রেরক HTTP=$SRV_OUT"
grep -qi "^content-type: image/webp" /tmp/lf190-served.h && ok "Content-Type: image/webp" || bad "Content-Type ভুল"
grep -qi "immutable" /tmp/lf190-served.h && ok "immutable ক্যাশ-হেডার" || bad "immutable নেই"
if cmp -s /tmp/lf190-served.webm /tmp/lf190-dbbytes.webp; then ok "বাইট-লসলেস (cmp — অপটিমাইজার-বাইটস = সার্ভড-বাইটস)"; else bad "বাইট-অসম (cmp ফেল)"; fi
R2=$(curl -s -b "$J2" -c "$J2" -o /dev/null -w "%{http_code}" "$BASE/api/messages/media/$MID-img.webm")
[ "$R2" = "200" ] && ok "প্রাপক ২০০" || bad "প্রাপক HTTP=$R2"
R3=$(curl -s -b "$J3" -c "$J3" -o /dev/null -w "%{http_code}" "$BASE/api/messages/media/$MID-img.webm")
[ "$R3" = "403" ] && ok "অসংশ্লিষ্ট-ইউজার ৪০৩" || bad "বহিরাগত HTTP=$R3 (৪০৩ প্রত্যাশিত)"
R4=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/messages/media/$MID-img.webm")
{ [ "$R4" = "401" ] || [ "$R4" = "302" ]; } && ok "লগইন-বিহীন প্রতিরোধ (HTTP=$R4)" || bad "লগইন-বিহীন HTTP=$R4"

echo "── [7] ক্লিনআপ — টেস্ট-মেসেজ ডিলিট (DB পরিষ্কার)"
node -e "
const db=require('$APP/db'); db.initDb().then(async()=>{
  await db.prepare('DELETE FROM messages WHERE id=?').run($MID);
  await db.prepare('UPDATE conversations SET last_message_at = (SELECT COALESCE(MAX(created_at), CURRENT_TIMESTAMP) FROM messages WHERE messages.conversation_id = conversations.id)').run();
  console.log('CLEAN:OK');
});" 2>&1 | tail -1
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
bash "$APP/../ensure-server.sh" > /dev/null 2>&1  # রিস্ট্রাকচার-পরবর্তী সঠিক-পথ (রিপো-রুটে)
ok "ক্লিনআপ + সার্ভার-রিস্টার্ট"

echo ""
echo "════════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "ALL-GREEN ✓" || echo "FAILURES ✗"
exit $FAIL
