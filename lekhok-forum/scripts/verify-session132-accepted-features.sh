#!/bin/bash
# ═══ session132/136 E2E (union: ব্যাজ/আইকন-ক্লাস = session135-ক্যানোনিকাল feed-acc-badge135/icon-accepted135) — ফিড-কার্ড গ্রহণকৃত-উত্তর-ব্যাজ + answer_accepted টোনাল-আইকন ═══
# পূর্বশর্ত: সার্ভার চালু (lf-boot.sh — LF_QA_DISABLE_RATELIMIT=1-সহ), সিড-ইউজার আছে।
# ফ্লো: testuser প্রশ্ন → ismail উত্তর → testuser গ্রহণ → ismail-এর /notifications-এ
#        icon-accepted135 + fa-circle-check + গ্রুপ-গণনা; /dashboard-এ feed-acc-badge135;
#        ক্লিনআপ: নোটিফিকেশন-dismiss + প্রশ্ন-ডিলিট (ক্যাসকেড)।
P=${E2E_PORT:-3030}; BASE="http://localhost:$P"
PASS=0; FAIL=0
rm -f /tmp/j132u /tmp/j132v
# session132: বাস্তব-jar মুছুন — সেশন-স্টোর DB-backed (session-store.js) — রিবূট-পরেও পুরানো লগইন বেঁচ থাকে; rm ছাড়া চলে GET /login 302 দেয় খালি-token ৗ
ck() { if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (expected [$2] got [$3])"; fi }
ckc() { if echo "$3" | grep -q "$2"; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (missing: $2)"; fi }
strip() { echo "$1" | sed 's|https\?://[^/]*||'; }
getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J=$1 PG=$2 U=$3 PW=$4
  local TOK=$(getcsrf "$J" "$PG")
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  # session132: csrf-race-রিকভারি — ব্রাউজার-মিরর (?csrf=1-GET-ফলো → ফ্রেশ-টোকেন → রিট্রাই ×২)
  local tries=0
  while [ $tries -lt 2 ]; do
    tries=$((tries+1))
    if [ "${R%% *}" != "200" ] && ! echo "${R##* }" | grep -q "csrf=1"; then break; fi
    curl -s -b "$J" -c "$J" -o /dev/null "$BASE/" # ?csrf=1-রিডাইরেক্ট-ফলো (ব্রাউজার-মিরর)
    sleep 0.4
    TOK=$(getcsrf "$J" "$PG")
    R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  done
  echo "$R"
}

echo "══ s132-১. লগইন (testuser প্রশ্নকর্তা · ismail উত্তরদাতা) ══"
# প্রতিষ্ঠিত-কনভেনশন (reset-qa-logins.js/session97): ismail=secret123; testuser=demo123
R1=$(login /tmp/j132u /login testuser demo123); ck "testuser → /dashboard" "/dashboard" "$(strip "${R1##* }")"
R2=$(login /tmp/j132v /login ismail secret123);   ck "ismail → /dashboard" "/dashboard" "$(strip "${R2##* }")"

echo "══ s132-২. সেলফ-সিড: প্রশ্ন + উত্তর + গ্রহণ ══"
TOKU=$(getcsrf /tmp/j132u /qa/new)
RQ=$(curl -s -b /tmp/j132u -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE/qa/new" --data-urlencode "title=s132 ফিড-ব্যাজ টেস্ট প্রশ্ন" --data-urlencode "body=session132 E2E সেলফ-সিড প্রশ্ন" --data-urlencode "_csrf=$TOKU")
Q=$(strip "${RQ#* }" | grep -o '[0-9][0-9]*$')
if [ -z "$Q" ]; then echo "  ✗ প্রশ্ন-সিড ব্যর্থ"; FAIL=$((FAIL+1)); else
  PASS=$((PASS+1)); echo "  ✓ প্রশ্ন id=$Q"
  A=$(curl -s -b /tmp/j132v -X POST "$BASE/api/comment" -H "Content-Type: application/json" -d "{\"post_id\":$Q,\"body\":\"s132 সেলফ-সিড উত্তর\"}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  if [ -z "$A" ]; then echo "  ✗ উত্তর-সিড ব্যর্থ"; FAIL=$((FAIL+1)); else
    PASS=$((PASS+1)); echo "  ✓ উত্তর id=$A"
    ACC=$(curl -s -b /tmp/j132u -X POST "$BASE/api/qa/$Q/accept-answer" -H "Content-Type: application/json" -d "{\"comment_id\":$A}")
    ckc "গ্রহণ → accepted_comment_id" "\"accepted_comment_id\":$A" "$ACC"

    echo "══ s132-৩. ফিড-কার্ড গ্রহণকৃত-ব্যাজ (সার্ভার-সত্য) ══"
    DASH=$(curl -s "$BASE/dashboard")
    ckc "/dashboard feed-acc-badge135 রেন্ডার" "feed-acc-badge135" "$DASH"
    ckc "/dashboard?filter=question ব্যাজ" "feed-acc-badge135" "$(curl -s "$BASE/dashboard?filter=question")"
    ckc "ranked-মোডেও ব্যাজ" "feed-acc-badge135" "$(curl -s "$BASE/dashboard?sort=ranked")"
    MORE=$(curl -s "$BASE/dashboard/more?offset=0&limit=30")
    ckc "/dashboard/more (recent) ব্যাজ" "feed-acc-badge135" "$MORE"
    # ব্যাজ যেন শুধু accepted-প্রশ্নেই — ব্যাজ-সংখ্যা সংখ্যাতাত্ত্বিক-স্যানিটি (≥১)
    N=$(echo "$DASH" | grep -o "feed-acc-badge135" | wc -l)
    ck "ব্যাজ-উপস্থিতি ≥১ (got $(echo "$N" | tr -d ' '))" "1" "$([ "$N" -ge 1 ] && echo 1 || echo 0)"

    echo "══ s132-৪. answer_accepted টোনাল-আইকন (ismail-এর বিজ্ঞপ্তি) ══"
    NP=$(curl -s -b /tmp/j132v "$BASE/notifications")
    ckc "icon-accepted135 প্যালেট" "icon-accepted135" "$NP"
    ckc "fa-circle-check আইকন" "fa-circle-check" "$NP"
    ckc "answer_accepted data-type" 'data-type="answer_accepted"' "$NP"
    ckc "G117 গ্রুপ data-g117=reply" 'data-g117="reply"' "$NP"
    # ড্রপডাউন-সারফেস: ড্যাশবোর্ড-হেডারে সাম্প্রতিক-বিজ্ঞপ্তি (ico-answer_accepted)
    DDASH="$(curl -s -b /tmp/j132v "$BASE/dashboard")"
    ckc "ড্রপডাউন data-n-এ answer_accepted" "answer_accepted" "$DDASH"
    ckc "ড্রপডাউন fa-circle-check আইকন" "fa-circle-check" "$DDASH"

    echo "══ s132-৫. ক্লিনআপ ══"
    # নোটিফিকেশন id — ismail-এর /notifications data-n থেকে answer_accepted-টাইপের id
    NID=$(echo "$NP" | grep -o 'data-n="{&#34;i&#34;:[0-9]*,&#34;t&#34;:&#34;answer_accepted&#34;' | grep -o '[0-9]*' | head -1)
    [ -z "$NID" ] && NID=$(echo "$NP" | grep -o 'data-n="{&quot;i&quot;:[0-9]*,&quot;t&quot;:&quot;answer_accepted&quot;' | grep -o '[0-9]*' | head -1)
    if [ -n "$NID" ]; then
      D=$(curl -s -b /tmp/j132v -X POST "$BASE/api/notifications/$NID/dismiss")
      ckc "নোটিফিকেশন-dismiss (id=$NID)" '"ok":true' "$D"
    else
      echo "  ⚠ dismiss-id পাওয়া যায়নি (HTML-এনকোডিং-ভিন্নতা?) — হাতে-পরীক্ষা লাগবে"
    fi
    TOKD=$(getcsrf /tmp/j132u /qa)
    ck "প্রশ্ন-ডিলিট → 303 (ক্যাসকেড)" "303" "$(curl -s -b /tmp/j132u -o /dev/null -w "%{http_code}" -X POST "$BASE/qa/$Q/delete?_csrf=$TOKD")"
    ckc "ডিলিটের-পরে /dashboard-এ ব্যাজ-অনুপস্থিত (টেস্ট-রো-জন্য)" "ABSENT" "$(curl -s "$BASE/dashboard" | grep -q 's132 ফিড-ব্যাজ' && echo PRESENT || echo ABSENT)"
  fi
fi

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✓" || echo "FAILURES ✗"
[ $FAIL -gt 0 ] && exit 1
exit 0
