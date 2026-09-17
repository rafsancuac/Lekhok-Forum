#!/usr/bin/env bash
# seed-qa-113.sh — QA-সিড (HTTP-পাইপলাইন, sql.js dual-instance-গোটচা এড়ানো):
# ১টি প্রশ্ন + ২ উত্তর (২ ইউজার) + ১ রিপ্লাই + রিঅ্যাকশন — ক্যানোনিকাল CommentItem E2E-র জন্য।
# ব্যবহার: bash scripts/seed-qa-113.sh   (সার্ভার :3030 চালু থাকতে হবে)
set -u
BASE="http://127.0.0.1:3030"
J1=/tmp/qa-seed-u1.jar; J2=/tmp/qa-seed-u2.jar

login() { # $1=jar $2=user $3=pass
  local tok
  tok=$(curl -s -c "$1" "$BASE/login" -o /dev/null && awk '$6=="_csrfTok"{print $7}' "$1" | tail -1)
  [ -z "$tok" ] && { echo "csrf-cookie missing"; return 1; }
  curl -s -b "$1" -c "$1" -o /dev/null -w "login($2): %{http_code} -> %{redirect_url}\n" \
    -X POST "$BASE/login" \
    --data-urlencode "_csrf=$tok" \
    --data-urlencode "username=$2" \
    --data-urlencode "password=$3"
}

postf() { # $1=jar $2=url $3...=fields  → echoes status:location
  local jar=$1 url=$2 tok
  tok=$(awk '$6=="_csrfTok"{print $7}' "$jar" | tail -1)
  shift 2
  local args=( -b "$jar" -c "$jar" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$url" --data-urlencode "_csrf=$tok" )
  local f
  for f in "$@"; do args+=( --data-urlencode "$f" ); done
  curl -s "${args[@]}"
  echo ""
}

echo "── ১. testuser লগইন"
login "$J1" "testuser" "demo123"
echo "── ২. testagent1 লগইন"
login "$J2" "testagent1" "Test@1234"

echo "── ৩. প্রশ্ন তৈরি (testuser)"
OUT=$(postf "$J1" "$BASE/qa/new" "title=ক্যানোনিকাল-উত্তর-থ্রেড E2E প্রশ্ন — সেশন ১১৭" "body=উত্তর-থ্রেড কমেন্ট-সমতা যাচাইয়ের **প্রশ্ন**। ইনলাইন রিপ্লাই ও প্যালেট-রিঅ্যাকশন কি ঠিকমতো কাজ করে?" "category=general")
echo "$OUT"
QID=$(echo "$OUT" | grep -oE '/qa/[0-9]+' | grep -oE '[0-9]+' | tail -1)
echo "QID=$QID"
[ -z "${QID:-}" ] && { echo "FAIL: no QID"; exit 1; }

echo "── ৪. উত্তর-১ (testagent1)"
postf "$J2" "$BASE/qa/$QID/answer" "body=প্রথম উত্তর — ক্যানোনিকাল CommentItem-বাবলে রেন্ডার হওয়ার কথা।" >/dev/null

echo "── ৫. উত্তর-২ (testuser)"
OUT2=$(postf "$J1" "$BASE/qa/$QID/answer" "body=দ্বিতীয় উত্তর — রিপ্লাই-থ্রেড পরীক্ষার জন্য।")
echo "$OUT2"

echo "── ৬. রিঅ্যাকশন (testuser → উত্তর-১-এ love) — JSON API"
# উত্তর-১-এর comment-id দরকার: /api/comments থেকে নিই
ANS1=$(curl -s -b "$J1" "$BASE/api/comments?post_id=$QID" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const t=(j.comments||j).filter?j.comments||j:j;const tops=(Array.isArray(t)?t:[]).sort((a,b)=>a.id-b.id);console.log(tops[0]?tops[0].id:'')})")
echo "ANS1=$ANS1"
curl -s -b "$J1" -X POST "$BASE/api/react" -H "Content-Type: application/json" \
  -d "{\"target_type\":\"comment\",\"target_id\":$ANS1,\"reaction_type\":\"love\"}"
echo ""

echo "── ৭. রিপ্লাই (testuser → উত্তর-১-এ, /api/comment parent_id)"
curl -s -b "$J1" -X POST "$BASE/api/comment" -H "Content-Type: application/json" \
  -d "{\"post_id\":$QID,\"body\":\"ইনলাইন রিপ্লাই — থ্রেড-অ্যাটাচ প্রমাণ।\",\"parent_id\":$ANS1}"
echo ""

echo "── ৮. যাচাই: /qa/$QID রেন্ডার"
curl -s -o /tmp/qa-seed-page.html -w "GET /qa/$QID: %{http_code}\n" "$BASE/qa/$QID"
grep -c "fc-bubble" /tmp/qa-seed-page.html | xargs echo "fc-bubble count:"
grep -c "qa-answer-outer" /tmp/qa-seed-page.html | xargs echo "qa-answer-outer count:"
grep -c "top-answer-chip" /tmp/qa-seed-page.html | xargs echo "top-answer-chip count:"
grep -c "cc-form" /tmp/qa-seed-page.html | xargs echo "cc-form count (anon=0):"
grep -o 'data-post-link="[^"]*"' /tmp/qa-seed-page.html | head -1
echo "QID=$QID" > /tmp/qa-seed-qid.txt
