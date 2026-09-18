#!/bin/bash
# session139 — /me-ব্যাজ-স্ক্রিনশট-সিড (E2E-হেল্পার-রীতি; ক্লিনআপ: --cleanup <qid>)
P=${E2E_PORT:-3030}; BASE="http://localhost:$P"
getcsrf() { curl -s -b "$1" -c "$1" "$BASE/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
login() {
  local J=$1 U=$2 PW=$3
  local TOK=$(getcsrf "$J")
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code}" -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  if [ "$R" != "200" ]; then
    curl -s -b "$J" -c "$J" -o /dev/null "$BASE/"; sleep 0.5
    TOK=$(getcsrf "$J")
    curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK"
  fi
}
if [ "$1" == "--cleanup" ]; then
  Q=$2; J=/tmp/j139a
  TOK=$(curl -s -b "$J" -c "$J" "$BASE/qa" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  curl -s -b "$J" -o /dev/null -w "delete:%{http_code}\n" -X POST "$BASE/qa/$Q/delete?_csrf=$TOK"
  exit 0
fi
rm -f /tmp/j139a /tmp/j139b
login /tmp/j139a testuser demo123
login /tmp/j139b ismail secret123
# E2E-রীতি: টোকেন টার্গেট-পেজ থেকেই (getcsrf $J $PG) — /login-টোকেন qa/new-POST-এ মেলে না
TOKU=$(curl -s -b /tmp/j139a -c /tmp/j139a "$BASE/qa/new" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
RQ=$(curl -s -b /tmp/j139a -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE/qa/new" --data-urlencode "title=গৃহীত উত্তর-ব্যাজ প্রদর্শনী প্রশ্ন" --data-urlencode "body=session139 স্ক্রিনশট-সিড প্রশ্ন" --data-urlencode "_csrf=$TOKU")
echo "RQ=$RQ"
Q=$(echo "$RQ" | sed 's|https\?://[^/]*||' | grep -o '/qa/[0-9]*' | grep -o '[0-9]*')
if [ -z "$Q" ]; then echo "SEED-FAIL"; exit 1; fi
A=$(curl -s -b /tmp/j139b -X POST "$BASE/api/comment" -H "Content-Type: application/json" -d "{\"post_id\":$Q,\"body\":\"প্রদর্শনী উত্তর\"}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
ACC=$(curl -s -b /tmp/j139a -X POST "$BASE/api/qa/$Q/accept-answer" -H "Content-Type: application/json" -d "{\"comment_id\":$A}")
echo "Q=$Q A=$A ACC=$ACC"
echo "PHOTO_ID=$Q"
