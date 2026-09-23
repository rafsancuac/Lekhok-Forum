#!/bin/bash
# s296chip-regression.sh — session296b পূর্ণ-রিগ্রেশন রানার (s260..s296 (epkwide+chipfacet) + role-policy + guard:design + audit:views)
# রীতি: প্রতি-সুইট-পরে ফল-সারাংশ; কোনো-এক-সুইট-ফেল-করলেও পুরো-তালিকা চালিয়ে যায় (সম্পূর্ণ-চিত্র);
# মোট-সংখ্যা-অ্যাসার্ট (৩৮-সুইট) + নিজের-নাম-উপস্থিতি-অ্যাসার্ট;
# চাঙ্ক-সাপোর্ট: CHUNK_FROM/CHUNK_TO (১-সূচক) — টুল-কল-টাইমআউটের-ভিতরে চাঙ্কে-চালান (ব্যাকগ্রাউন্ড-জব-নয় — session289-গোটচা)
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
cd "$ROOT" || exit 1
SUITES=(s260-eventsfilter s261-resfilter s262-mufilter s263-mdfilter s264-adfilter s265-acfilter \
        s266-msfilter s267-tkfilter s268-mofilter s269-subfilter s270-aufilter s271-avfilter \
        s272-chfilter s273-sufilter s274-safilter s275-sdfilter s276-anfilter s277-evfilter \
        s278-amlfilter s279-arlfilter s280-aglfilter s280-ep3p s281-epthumb s282-epsearch \
        s283-calmonth s284-calyear s285-calkey s286-calgrid s287-calday s288-calaria s289-calpanel \
        s290-comboad s291-railcap s292-filmthumb s293-dcfilter s294-cejump s295-stripkeys \
        s296-epkwide s296-chipfacet)
if [ "${#SUITES[@]}" != "39" ]; then echo "FATAL: তালিকা-মোট ${#SUITES[@]} (৩৯-প্রত্যাশিত)"; exit 1; fi
case "${SUITES[*]}" in *s296-chipfacet*) ;; *) echo "FATAL: রানারে s296-chipfacet-অনুপস্থিত"; exit 1;; esac
case "${SUITES[*]}" in *s296-epkwide*) ;; *) echo "FATAL: রানারে s296-epkwide-অনুপস্থিত (সমান্তরাল-ep296-সহ — লেবেল-রেস-সমাধান)"; exit 1;; esac
case "${SUITES[*]}" in *s295-stripkeys*) ;; *) echo "FATAL: রানারে s295-stripkeys-অনুপস্থিত"; exit 1;; esac
case "${SUITES[*]}" in *s293-dcfilter*) ;; *) echo "FATAL: রানারে s293-dcfilter-অনুপস্থিত"; exit 1;; esac
FROM="${CHUNK_FROM:-1}"
TO="${CHUNK_TO:-39}"
if ! [ "$FROM" -ge 1 ] 2>/dev/null || ! [ "$TO" -le 39 ] 2>/dev/null || [ "$FROM" -gt "$TO" ]; then echo "FATAL: চাঙ্ক-সীমা-অবৈধ ($FROM..$TO)"; exit 1; fi
TOTAL=0; BAD=()
for i in $(seq "$FROM" "$TO"); do
  S="${SUITES[$((i-1))]}"
  TOTAL=$((TOTAL+1))
  OUT=$(bash "$APP/tests/$S-suite.sh" 2>&1 | tail -4)
  LINE=$(echo "$OUT" | grep -E 'PASS=[0-9]+' | tail -1)
  if echo "$OUT" | grep -q 'ALL GREEN' || echo "$LINE" | grep -qE 'PASS=[0-9]+ FAIL=0'; then
    echo "✓ $S — $LINE"
  else
    echo "✗ $S — $LINE"
    BAD+=("$S")
  fi
done
echo "────────────────────────────"
echo "regression: suites=$TOTAL failed=${#BAD[@]}"
if [ "${#BAD[@]}" != "0" ]; then printf 'FAILED: %s\n' "${BAD[@]}"; exit 1; fi
echo "ALL SUITES GREEN ✓"
