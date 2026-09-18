#!/bin/bash
# ═══ session139 E2E — /me গৃহীত-উত্তর-ব্যাজ-প্যারিটি (①) + answer_accepted reltime-চিপ-ত্রি-সারফেস-প্রমাণ (②) ═══
# পূর্বশর্ত: সার্ভার চালু (lf-boot.sh — LF_QA_DISABLE_RATELIMIT=1), সিড-ইউজার আছে।
# ফ্লো: testuser প্রশ্ন → ismail উত্তর → testuser গ্রহণ
#        ① testuser-এর /me-তে নিজের-প্রশ্ন-কার্ডে feed-acc-badge135 (session135-ব্যাজের /me-প্যারিটি)
#        ② ismail-এর সারফেসে answer_accepted রো-তে reltime-চিপ: ফুল-পেজ (notif-page-time+data-ts)
#           + হেডার-ড্রপডাউন (notif-time+data-ts) — LekhokRelTime চুক্তি
#        ক্লিনআপ: নোটিফিকেশন-dismiss + প্রশ্ন-ডিলিট (ক্যাসকেড) + /me-ব্যাজ-অনুপস্থিতি-পুনঃযাচাই
P=${E2E_PORT:-3030}; BASE="http://localhost:$P"
PASS=0; FAIL=0
rm -f /tmp/j139u /tmp/j139v
ck() { if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (expected [$2] got [$3])"; fi }
ckc() { if echo "$3" | grep -q "$2"; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (missing: $2)"; fi }
ckn() { if echo "$3" | grep -q "$2"; then FAIL=$((FAIL+1)); echo "  ✗ $1 (নিষিদ্ধ $2 উপস্থিত)"; else PASS=$((PASS+1)); echo "  ✓ $1"; fi }
strip() { echo "$1" | sed 's|https\?://[^/]*||'; }
getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J=$1 PG=$2 U=$3 PW=$4
  local TOK=$(getcsrf "$J" "$PG")
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  local tries=0
  while [ $tries -lt 2 ]; do
    tries=$((tries+1))
    if [ "${R%% *}" != "200" ] && ! echo "${R##* }" | grep -q "csrf=1"; then break; fi
    curl -s -b "$J" -c "$J" -o /dev/null "$BASE/"
    sleep 0.4
    TOK=$(getcsrf "$J" "$PG")
    R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  done
  echo "$R"
}

echo "══ s139-১. লগইন (testuser প্রশ্নকর্তা · ismail উত্তরদাতা) ══"
R1=$(login /tmp/j139u /login testuser demo123); ck "testuser → /dashboard" "/dashboard" "$(strip "${R1##* }")"
R2=$(login /tmp/j139v /login ismail secret123); ck "ismail → /dashboard" "/dashboard" "$(strip "${R2##* }")"

echo "══ s139-২. সেলফ-সিড: প্রশ্ন + উত্তর + গ্রহণ ══"
TOKU=$(getcsrf /tmp/j139u /qa/new)
RQ=$(curl -s -b /tmp/j139u -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE/qa/new" --data-urlencode "title=s139 /me-ব্যাজ প্যারিটি টেস্ট প্রশ্ন" --data-urlencode "body=session139 E2E সেলফ-সিড প্রশ্ন" --data-urlencode "_csrf=$TOKU")
Q=$(strip "${RQ#* }" | grep -o '[0-9][0-9]*$')
if [ -z "$Q" ]; then echo "  ✗ প্রশ্ন-সিড ব্যর্থ"; FAIL=$((FAIL+1)); else
  PASS=$((PASS+1)); echo "  ✓ প্রশ্ন id=$Q"
  A=$(curl -s -b /tmp/j139v -X POST "$BASE/api/comment" -H "Content-Type: application/json" -d "{\"post_id\":$Q,\"body\":\"s139 সেলফ-সিড উত্তর\"}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  if [ -z "$A" ]; then echo "  ✗ উত্তর-সিড ব্যর্থ"; FAIL=$((FAIL+1)); else
    PASS=$((PASS+1)); echo "  ✓ উত্তর id=$A"
    ACC=$(curl -s -b /tmp/j139u -X POST "$BASE/api/qa/$Q/accept-answer" -H "Content-Type: application/json" -d "{\"comment_id\":$A}")
    ckc "গ্রহণ → accepted_comment_id" "\"accepted_comment_id\":$A" "$ACC"

    echo "══ s139-৩. ① /me-ব্যাজ-প্যারিটি (testuser-এর নিজের-প্রশ্ন-কার্ড) ══"
    ME=$(curl -s -b /tmp/j139u "$BASE/me")
    ckc "/me-তে feed-acc-badge135 রেন্ডার" "feed-acc-badge135" "$ME"
    ckc "/me-তে সিড-প্রশ্ন-টাইটেল উপস্থিত" "s139 /me-ব্যাজ প্যারিটি টেস্ট" "$ME"
    # ব্যাজ-সংখ্যা-স্যানিটি: /me-তে ব্যাজ ≥১
    NB=$(echo "$ME" | grep -o "feed-acc-badge135" | wc -l | tr -d ' ')
    ck "/me-ব্যাজ-উপস্থিতি ≥১ (got $NB)" "1" "$([ "$NB" -ge 1 ] && echo 1 || echo 0)"
    # প্যারিটি-সমতা: ফিডেও একই-প্রশ্নে ব্যাজ (session135-সারফেস)
    ckc "/dashboard-ফিড-প্যারিটি (একই-প্রশ্ন)" "feed-acc-badge135" "$(curl -s "$BASE/dashboard")"

    echo "══ s139-৪. ② answer_accepted reltime-চিপ (ismail-এর সারফেস) ══"
    NP=$(curl -s -b /tmp/j139v "$BASE/notifications")
    # ফুল-পেজ: answer_accepted রো-ব্লকের ভেতরে notif-page-time + data-ts (rel119+LekhokRelTime চুক্তি)
    # 🚨 গোটচা (session139-আবিষ্কৃত ×২): ① grep-এর .{0,N} উইন্ডো-প্যাটার্ন বিশাল-লাইনে ঝুলে যায় →
    # awk index()/substr() O(n)-উইন্ডো; ② রেন্ডার্ড-HTML মাল্টি-লাইন — awk-ডিফল্ট-রেকর্ড=লাইনে
    # প্রথম-লাইনেই exit হয়ে যায় → BEGIN{RS="\0"} দিয়ে গোটা-ফাইল-এক-রেকর্ড বাধ্যতামূলক।
    ROW=$(echo "$NP" | awk 'BEGIN{RS="\0"} {i=index($0, "data-type=\"answer_accepted\""); if(i>0){print substr($0, (i>1200?i-1200:1), 3000); exit}}')
    if [ -n "$ROW" ]; then
      PASS=$((PASS+1)); echo "  ✓ ফুল-পেজে answer_accepted রো আছে"
      ckc "রো-ব্লকে notif-page-time চিপ" "notif-page-time" "$ROW"
      ckc "রো-ব্লকে data-ts (LekhokRelTime)" "data-ts=" "$ROW"
      ckc "রো-ব্লকে icon-accepted135 টোনাল" "icon-accepted135" "$ROW"
    else
      FAIL=$((FAIL+1)); echo "  ✗ ফুল-পেজে answer_accepted রো নেই"
    fi
    # সর্বজনীনতা-গণনা: notif-page-time চিপ-সংখ্যা ≥ answer_accepted রো-সংখ্যা (প্রতি-রো-চিপ)
    NACC=$(echo "$NP" | grep -c 'data-type="answer_accepted"'); NCHIP=$(echo "$NP" | grep -c 'notif-page-time')
    ck "চিপ-প্যারিটি-গণনা acc=$NACC chip=$NCHIP (chip≥acc)" "1" "$([ "$NCHIP" -ge "$NACC" ] && [ "$NACC" -ge 1 ] && echo 1 || echo 0)"
    # হেডার-ড্রপডাউন: /dashboard-এর recentNotifs-এ answer_accepted রো + notif-time+data-ts
    DDASH="$(curl -s -b /tmp/j139v "$BASE/dashboard")"
    DROW=$(echo "$DDASH" | awk 'BEGIN{RS="\0"} {i=index($0, "answer_accepted"); if(i>0){print substr($0, (i>900?i-900:1), 1800); exit}}')
    ckc "ড্রপডাউনে answer_accepted রো" "answer_accepted" "$DROW"
    NT=$(echo "$DDASH" | grep -o 'notif-time" data-ts' | wc -l | tr -d ' ')
    ck "ড্রপডাউন notif-time+data-ts চিপ ≥১ (got $NT)" "1" "$([ "$NT" -ge 1 ] && echo 1 || echo 0)"
    ckc "ড্রপডাউন fa-circle-check আইকন" "fa-circle-check" "$DDASH"
    # লাইভ-SSE-সারফেস (live.js paintList) — কোড-চুক্তি: relTime+data-ts টেমপ্লেট
    ckc "live.js paintList data-ts-চুক্তি (grep -F)" "data-ts=" "$(grep -oF 'notif-time" data-ts="' public/assets/js/live.js | head -1)"

    echo "══ s139-৫. ক্লিনআপ ══"
    NID=$(echo "$NP" | grep -o 'data-n="{&#34;i&#34;:[0-9]*,&#34;t&#34;:&#34;answer_accepted&#34;' | grep -o '[0-9]*' | head -1)
    [ -z "$NID" ] && NID=$(echo "$NP" | grep -o 'data-n="{&quot;i&quot;:[0-9]*,&quot;t&quot;:&quot;answer_accepted&quot;' | grep -o '[0-9]*' | head -1)
    if [ -n "$NID" ]; then
      D=$(curl -s -b /tmp/j139v -X POST "$BASE/api/notifications/$NID/dismiss")
      ckc "নোটিফিকেশন-dismiss (id=$NID)" '"ok":true' "$D"
    else
      echo "  ⚠ dismiss-id পাওয়া যায়নি — হাতে-পরীক্ষা লাগবে"
    fi
    TOKD=$(getcsrf /tmp/j139u /qa)
    ck "প্রশ্ন-ডিলিট → 303 (ক্যাসকেড)" "303" "$(curl -s -b /tmp/j139u -o /dev/null -w "%{http_code}" -X POST "$BASE/qa/$Q/delete?_csrf=$TOKD")"
    ME2=$(curl -s -b /tmp/j139u "$BASE/me")
    ckn "ডিলিটের-পরে /me-তে ব্যাজ-অনুপস্থিত" "feed-acc-badge135" "$ME2"
    ckn "ডিলিটের-পরে /dashboard-এ সিড-টাইটেল-অনুপস্থিত" "s139 /me-ব্যাজ প্যারিটি টেস্ট" "$(curl -s "$BASE/dashboard")"
  fi
fi

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✓" || echo "FAILURES ✗"
[ $FAIL -gt 0 ] && exit 1
exit 0
