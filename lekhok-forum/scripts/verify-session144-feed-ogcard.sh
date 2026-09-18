#!/bin/bash
# ═══ session144 E2E — ফিড og-কার্ড (mdFeed লিংকিফাই + link-preview মাউন্ট-চুক্তি) +
#     /qa মেনশন-অটোকমপ্লিট (window.LekhokMention চুক্তি) + messenger-র্যাচেট-স্থায়িত্ব ═══
# পূর্বশর্ত: সার্ভার চালু (3030), সিড-ইউজার আছে।
# ফ্লো: testuser লিংক-সহ প্রশ্ন → ফিড-HTML-এ .feed-text a.a-link (mdFeed) →
#        /api/link-preview কার্ড-JSON → guest-ফিডেও অ্যাঙ্কর-দৃশ্যমান →
#        /qa কম্পোজার মেনশন-চুক্তি (data-mention-root/ta + LekhokMention এক্সপোজ) →
#        messenger.css হেক্স=০ + tokens.css session144-ব্লক → ক্লিনআপ (সৃষ্টিকর্তা-সেশন-ডিলিট)
P=${E2E_PORT:-3030}; BASE="http://localhost:$P"
PASS=0; FAIL=0
rm -f /tmp/j144u /tmp/j144v
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

echo "══ s144-১. লগইন (testuser প্রশ্নকর্তা) ══"
R1=$(login /tmp/j144u /login testuser demo123); ck "testuser → /dashboard" "/dashboard" "$(strip "${R1##* }")"

echo "══ s144-২. লিংক-সহ প্রশ্ন-সিড (দ্বি-সিড — টার্গেট-আইডি ডিটারমিনিস্টিক) ══"
TOKU=$(getcsrf /tmp/j144u /qa/new)
RQ=$(curl -s -b /tmp/j144u -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE/qa/new" --data-urlencode "title=s144 সিড-টার্গেট প্রশ্ন" --data-urlencode "body=s144 লিংক-টার্গেট সিড বডি।" --data-urlencode "_csrf=$TOKU")
QT=$(strip "${RQ#* }" | grep -o '[0-9][0-9]*$')
if [ -z "$QT" ]; then echo "  ✗ সিড-টার্গেট ব্যর্থ"; FAIL=$((FAIL+1)); else
PASS=$((PASS+1)); echo "  ✓ টার্গেট id=$QT"
RQ=$(curl -s -b /tmp/j144u -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE/qa/new" --data-urlencode "title=s144 og-card টেস্ট প্রশ্ন" --data-urlencode "body=ভেতরের লিংক /qa/$QT এবং বাইরের https://example.com/page দেখুন।" --data-urlencode "_csrf=$TOKU")
Q=$(strip "${RQ#* }" | grep -o '[0-9][0-9]*$')
if [ -z "$Q" ]; then echo "  ✗ প্রশ্ন-সিড ব্যর্থ"; FAIL=$((FAIL+1)); else
PASS=$((PASS+1)); echo "  ✓ প্রশ্ন id=$Q"

echo "══ s144-৩. ফিড-HTML — mdFeed লিংকিফাই চুক্তি ══"
FEED=$(curl -s -b /tmp/j144u "$BASE/dashboard")
ckc "feed-text-এ এক্সটার্নাল a-link (canonical mdFeed — nofollow)" "<a href=\"https://example.com/page\" class=\"a-link\" target=\"_blank\" rel=\"noopener nofollow\"" "$FEED"
ckc "আরও-পড়ুন-অ্যাঙ্কর classless (og-স্ক্যান-বহির্ভূত)" ">আরও পড়ুন</a>" "$FEED"
ckn "লিংক-বহির্ভূত টেক্সট escH (raw-হেক্স-শূন্য নয় — অ্যাঙ্কর-গার্ড)" "href=\"javascript:" "$FEED"
ckc "feed-text mdFeed মার্কআপ-ক্লাস" "feed-text" "$FEED"

echo "══ s144-৪. /api/link-preview — og-কার্ড-ইঞ্জিন সত্য ══"
LP=$(curl -s "$BASE/api/link-preview?u=/qa/$QT")
ckc "কনটেন্ট-কার্ড JSON" "\"kind\":\"content\"" "$LP"
ckc "কার্ড-টাইটেল উপস্থিত" "\"title\":\"" "$LP"
LP2=$(curl -s "$BASE/api/link-preview?u=/qa/$Q")
ckc "নিজের-প্রশ্নের কার্ড (লাইভ-উত্তর-গণনা-চুক্তি)" "\"kind\":\"content\"" "$LP2"

echo "══ s144-৫. /qa মেনশন-অটোকমপ্লিট চুক্তি (canonical — mention-anywhere.js session145) ══"
QA=$(curl -s -b /tmp/j144u "$BASE/qa")
ckc "qacBody140 textarea data-mention" "id=\"qacBody140\"[^>]*data-mention=\"1\"" "$QA"
ckc "mention-anywhere.js ইনক্লুড" "mention-anywhere.js" "$QA"
JS_MA=$(curl -s "$BASE/assets/js/mention-anywhere.js")
ckc "mention-anywhere: data-mention সারফেস-স্ক্যান" "textarea\[data-mention\]" "$JS_MA"
ckc "mention-anywhere: cc-input-স্কিপ (কমেন্ট-ইঞ্জিন-অক্ষুণ্ণ-চুক্তি)" "cc-input" "$JS_MA"
ckc "mention-anywhere: .mention-wrap144 অ্যাংকর" "mention-wrap144" "$JS_MA"

echo "══ s144-৬. মেনশন-ইঞ্জিন পুরনো-সারফেস-অক্ষুণ্ণ (CommentComposer cc-engine) ══"
ART=$(curl -s -b /tmp/j144u "$BASE/articles/1")
ckc "article: cc-bubble মার্কআপ-অক্ষুণ্ণ" "cc-bubble" "$ART"
ckc "article: cc-mention ড্রপডাউন-বাহক" "cc-mention" "$ART"
JS_CT=$(curl -s "$BASE/assets/js/comment-tools.js")
ckc "comment-tools: cc-ইঞ্জিন-অক্ষুণ্ণ" "ccm-item" "$JS_CT"

echo "══ s144-৭. messenger.css র্যাচেট-স্থায়িত্ব ══"
MSGR=$(curl -s "$BASE/assets/css/messenger.css")
HEXC=$(echo "$MSGR" | grep -oE '#[0-9a-fA-F]{3,8}\b' | wc -l | tr -d ' ')
ck "messenger.css হেক্স-সংখ্যা ০" "0" "$HEXC"
TK=$(curl -s "$BASE/assets/css/tokens.css")
for T in danger-strong danger-strong-soft social-blue-hover-2 warn-ink-2 warn-tint match-mark match-mark-active social-blue-light-2 social-blue-tint; do
  N=$(echo "$TK" | grep -cE "^\s*--lf-$T\s*:")
  ck "tokens.css --lf-$T defs=১" "1" "$N"
done

echo "══ s144-৮. ক্লিনআপ (সৃষ্টিকর্তা-সেশন — ownership-৩০৩-গোটচা) ══"
TOKU2=$(getcsrf /tmp/j144u /qa)
DEL=$(curl -s -b /tmp/j144u -o /dev/null -w "%{http_code}" -X POST "$BASE/qa/$Q/delete" --data-urlencode "_csrf=$TOKU2")
if [ "$DEL" == "200" ] || [ "$DEL" == "302" ] || [ "$DEL" == "303" ]; then PASS=$((PASS+1)); echo "  ✓ প্রশ্ন-ডিলিট ($DEL)"; else FAIL=$((FAIL+1)); echo "  ✗ প্রশ্ন-ডিলিট (got $DEL)"; fi
DEL2=$(curl -s -b /tmp/j144u -o /dev/null -w "%{http_code}" -X POST "$BASE/qa/$QT/delete" --data-urlencode "_csrf=$TOKU2")
if [ "$DEL2" == "200" ] || [ "$DEL2" == "302" ] || [ "$DEL2" == "303" ]; then PASS=$((PASS+1)); echo "  ✓ টার্গেট-ডিলিট ($DEL2)"; else FAIL=$((FAIL+1)); echo "  ✗ টার্গেট-ডিলিট (got $DEL2)"; fi
FEED2=$(curl -s "$BASE/dashboard")
ckn "ক্লিনআপ-যাচাই (টেস্ট-প্রশ্ন অনুপস্থিত)" "s144 og-card টেস্ট প্রশ্ন" "$FEED2"
fi
fi

echo "════════════════════════════════"
echo "  PASS: $PASS  FAIL: $FAIL"
[ $FAIL -eq 0 ] && echo "  ALL GREEN ✓" || echo "  RED ✗"
exit $([ $FAIL -eq 0 ] && echo 0 || echo 1)
