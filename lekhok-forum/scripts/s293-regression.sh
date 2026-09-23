#!/bin/bash
# s293-regression.sh — session292 পূর্ণ-রিগ্রেশন রানার (s260..s292 + role-policy + guard:design + audit:views)
# রীতি: প্রতি-সুইট-পরে ফল-সারাংশ; কোনো-এক-সুইট-ফেল-করলেও পুরো-তালিকা চালিয়ে যায় (সম্পূর্ণ-চিত্র);
# মোট-সংখ্যা-অ্যাসার্ট (৩৫-সুইট) + নিজের-নাম-উপস্থিতি-অ্যাসার্ট;
# চাঙ্ক-সাপোর্ট: CHUNK_FROM/CHUNK_TO (১-সূচক) — টুল-কল-টাইমআউটের-ভিতরে চাঙ্কে-চালান (ব্যাকগ্রাউন্ড-জব-নয় — session289-গোটচা)
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
cd "$ROOT" || exit 1
SUITES=(s260-eventsfilter s261-resfilter s262-mufilter s263-mdfilter s264-adfilter s265-acfilter \
        s266-msfilter s267-tkfilter s268-mofilter s269-subfilter s270-aufilter s271-avfilter \
        s272-chfilter s273-sufilter s274-safilter s275-sdfilter s276-anfilter s277-evfilter \
        s278-amlfilter s279-arlfilter s280-aglfilter s280-ep3p s281-epthumb s282-epsearch \
        s283-calmonth s284-calyear s285-calkey s286-calgrid s287-calday s288-calaria s289-calpanel \
        s290-comboad s291-railcap s292-filmthumb s293-dcfilter)
if [ "${#SUITES[@]}" != "35" ]; then echo "FATAL: তালিকা-মোট ${#SUITES[@]} (৩৫-প্রত্যাশিত)"; exit 1; fi
case "${SUITES[*]}" in *s292-filmthumb*) ;; *) echo "FATAL: রানারে s292-filmthumb-অনুপস্থিত"; exit 1;; esac
case "${SUITES[*]}" in *s293-dcfilter*) ;; *) echo "FATAL: রানারে s293-dcfilter-অনুপস্থিত"; exit 1;; esac
case "${SUITES[*]}" in *s291-railcap*) ;; *) echo "FATAL: রানারে s291-railcap-অনুপস্থিত"; exit 1;; esac
case "${SUITES[*]}" in *s290-comboad*) ;; *) echo "FATAL: রানারে s290-comboad-অনুপস্থিত"; exit 1;; esac
FROM="${CHUNK_FROM:-1}"
TO="${CHUNK_TO:-35}"
if ! [ "$FROM" -ge 1 ] 2>/dev/null || ! [ "$TO" -le 35 ] 2>/dev/null || [ "$FROM" -gt "$TO" ]; then echo "FATAL: চাঙ্ক-সীমা-অবৈধ ($FROM..$TO)"; exit 1; fi
TOTAL=0; BAD=()
for i in $(seq "$FROM" "$TO"); do
  S="${SUITES[$((i-1))]}"
  TOTAL=$((TOTAL+1))
  OUT=$(bash "$APP/tests/$S-suite.sh" 2>&1 | tail -4)
  LINE=$(echo "$OUT" | grep -E 'PASS=[0-9]+' | tail -1)
  if echo "$OUT" | grep -q 'ALL GREEN' || echo "$LINE" | grep -qE 'PASS=[0-9]+ FAIL=0'; then
    echo "✓ $S — $LINE"
  else
    echo "✗ $S — $LINE"; BAD+=("$S")
  fi
done
if [ "$TO" = "35" ]; then
echo "── পার্শ্ব-গার্ড ──"
RP=$(bash "$APP/scripts/test-role-policy.sh" 2>&1 | grep -E 'PASS=|ALL|total|পাস|✓' | tail -2)
echo "role-policy: $RP"
if node "$APP/scripts/guard-design-system.js" >/dev/null 2>&1; then echo "✓ guard:design"; else echo "✗ guard:design"; BAD+=("guard:design"); fi
if node "$APP/scripts/audit-view-dupes.mjs" >/dev/null 2>&1; then echo "✓ audit:views ($(ls "$APP"/views/*.ejs "$APP"/views/**/*.ejs 2>/dev/null | wc -l) ejs)"; else echo "✗ audit:views"; BAD+=("audit:views"); fi
fi
echo "══════════════════════════════"
echo "রিগ্রেশন-চাঙ্ক $FROM..$TO: $TOTAL-সুইট; ব্যর্থ: ${#BAD[@]}"
if [ "${#BAD[@]}" = "0" ]; then echo "CHUNK GREEN ✓"; else printf 'ব্যর্থ-তালিকা: %s\n' "${BAD[*]}"; exit 1; fi
