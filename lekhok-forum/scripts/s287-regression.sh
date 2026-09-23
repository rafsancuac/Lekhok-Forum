#!/bin/bash
# s287-regression.sh — session287 পূর্ণ-রিগ্রেশন রানার (s260..s287 + role-policy + guard:design + audit:views)
# রীতি: প্রতি-সুইট-পরে ফল-সারাংশ; কোনো-এক-সুইট-ফেল-করলেও পুরো-তালিকা চালিয়ে যায় (সম্পূর্ণ-চিত্র)
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
cd "$ROOT" || exit 1
SUITES=(s260-eventsfilter s261-resfilter s262-mufilter s263-mdfilter s264-adfilter s265-acfilter \
        s266-msfilter s267-tkfilter s268-mofilter s269-subfilter s270-aufilter s271-avfilter \
        s272-chfilter s273-sufilter s274-safilter s275-sdfilter s276-anfilter s277-evfilter \
        s278-amlfilter s279-arlfilter s280-aglfilter s280-ep3p s281-epthumb s282-epsearch \
        s283-calmonth s284-calyear s285-calkey s286-calgrid s287-calday)
TOTAL=0; BAD=()
for S in "${SUITES[@]}"; do
  TOTAL=$((TOTAL+1))
  OUT=$(bash "$APP/tests/$S-suite.sh" 2>&1 | tail -4)
  LINE=$(echo "$OUT" | grep -E 'PASS=[0-9]+' | tail -1)
  if echo "$OUT" | grep -q 'ALL GREEN' || echo "$LINE" | grep -qE 'PASS=[0-9]+ FAIL=0'; then
    echo "✓ $S — $LINE"
  else
    echo "✗ $S — $LINE"; BAD+=("$S")
  fi
done
echo "── পার্শ্ব-গার্ড ──"
RP=$(bash "$APP/scripts/test-role-policy.sh" 2>&1 | grep -E 'PASS=|ALL|total|পাস|✓' | tail -2)
echo "role-policy: $RP"
if node "$APP/scripts/guard-design-system.js" >/dev/null 2>&1; then echo "✓ guard:design"; else echo "✗ guard:design"; BAD+=("guard:design"); fi
if node "$APP/scripts/audit-view-dupes.mjs" >/dev/null 2>&1; then echo "✓ audit:views ($(ls "$APP"/views/*.ejs "$APP"/views/**/*.ejs 2>/dev/null | wc -l) ejs)"; else echo "✗ audit:views"; BAD+=("audit:views"); fi
echo "════════════════════════════════"
echo "রিগ্রেশন-মোট: $TOTAL-সুইট + role-policy + guard + audit; ব্যর্থ: ${#BAD[@]}"
if [ "${#BAD[@]}" = "0" ]; then echo "ALL GREEN ✓"; else printf 'ব্যর্থ-তালিকা: %s\n' "${BAD[*]}"; exit 1; fi
