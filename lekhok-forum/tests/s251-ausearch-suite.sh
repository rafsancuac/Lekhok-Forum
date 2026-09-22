#!/bin/bash
# s251-ausearch-suite.sh — session251 অ্যাডমিন-ইউজার তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (au251 স্ট্রিপ + data-kw সারি + শূন্য-অবস্থা + GET ফিল্টার-বার-অক্ষুণ্ণ + হিন্ট-অক্ষুণ্ণ)
#          ② স্টাইল (au251-ব্লক হেক্স-শূন্য — guard-র্যাচেট-নিরাপদ; color-mix ফোকাস-রিং; kbd-fade; reduced-motion-জোড়া; 640px-সংকোচন)
#          ③ আচরণ (__auQA হুক; fill→কাউন্ট-ড্রপ; নো-ম্যাচ→শূন্য-অবস্থা; clear→পুনরুদ্ধার; 'f'-কী ফোকাস — body-বাবল synthetic; Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট
# চুক্তি: ① অ-ধ্বংসাত্মক — pkill/seed নেই (স্থায়ী ৮০৯৪-সার্ভার প্রোব; নামলে ensure-server) — DB-ফ্লাশ-শ্রেণি-ঝুঁকি শূন্য
#         ② keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি) ③ কাউন্ট-অ্যাসার্ট ডায়নামিক (fbtest-নাম-হার্ডকোড-নিষিদ্ধ — সিড-স্বাধীন)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ (Chrome-মৃত্যু-শ্রেণি)

echo "── ধাপ-০: পরিবেশ (অ-ধ্বংসাত্মক প্রোব → সুপার-লগইন) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
J=/tmp/s251-au-jar.txt; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "সুপার-লগইন ($LC)"; else bad "সুপার-লগইন-ব্যর্থ (HTTP $LC)"; fi
HTML=$(curl -s -b "$J" "$BASE/admin/users")

echo "── ধাপ-১: কাঠামো (au251 স্ট্রিপ — GET-ফিল্টার-বার-অক্ষুণ্ণ) ──"
contains "au251-ইনপুট রেন্ডার" "$HTML" 'id="au251-filter"'
contains "au251-কাউন্ট চিপ রেন্ডার" "$HTML" 'id="au251-count"'
contains "kbd-পিল affordance রেন্ডার" "$HTML" 'au251-kbd'
contains "শূন্য-অবস্থা সারি (data-au-empty)" "$HTML" 'data-au-empty'
contains "শূন্য-অবস্থা পূর্ব-লুকানো" "$HTML" '<tr data-au-empty hidden>'
contains "GET ফিল্টার-বার অক্ষুণ্ণ (no-regression)" "$HTML" 'class="filter-bar"'
# সার্ভার-পাশের শূন্য-সারি = টেমপ্লেট-উৎস-লক (রেন্ডারড HTML-এ শুধু ০-ইউজার-পৃষ্ঠাতেই আসে)
contains "সার্ভার-পাশের শূন্য-সারি অক্ষুণ্ণ (টেমপ্লেট-উৎস)" "$(cat "$APP/admin/views/admin/users/list.ejs")" 'কোনো ইউজার পাওয়া যায়নি'
contains "সারি-কীওয়ার্ড data-kw রেন্ডার" "$HTML" 'data-kw='
ROWS=$(echo "$HTML" | grep -o '<tr data-au-row' | wc -l)
KW=$(echo "$HTML" | grep -o 'data-kw=' | wc -l)
if [ "$ROWS" -gt 0 ] && [ "$ROWS" = "$KW" ]; then ok "data-au-row == data-kw ($ROWS সারি)"; else bad "সারি/kw-বেমান (row=$ROWS kw=$KW)"; fi
CHIP=$(echo "$HTML" | grep -o 'id="au251-count"[^>]*>[0-9]*' | grep -o '[0-9]*$')
if [ -n "$CHIP" ] && [ "$CHIP" = "$ROWS" ]; then ok "চিপ-প্রাথমিক মান == সারি-সংখ্যা ($CHIP)"; else bad "চিপ-মান বেমান (chip=$CHIP row=$ROWS)"; fi
contains "__auQA হুক উপস্থিত" "$HTML" '__auQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$HTML" "e.key !== 'f'"

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
AUCSS=$(echo "$HTML" | sed -n '/session251 — তাৎক্ষণিক-ফিল্টার/,/<\/style>/p')
HEXN=$(echo "$AUCSS" | grep -oiE '#[0-9a-f]\{0,1\}[0-9a-f]{2,6}' | wc -l)
if [ "$HEXN" = "0" ]; then ok "au251-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "au251-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$AUCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd fade (focus-within)" "$AUCSS" '.au251-field:focus-within .au251-kbd { opacity: 0; }'
contains "reduced-motion জোড়া" "$AUCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$AUCSS" '@media (max-width: 640px)'
contains "প্রেস-ফিডব্যাক (:active scale)" "$AUCSS" '.au251-clear:active { transform: scale(.96); }'

echo "── ধাপ-৩: আচরণ (agent-browser — সুপার সেশন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
U=$(agent-browser get url 2>/dev/null || echo '')
if echo "$U" | grep -q '/admin/login'; then :; else agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1; balive || true; fi
agent-browser fill 'input[name="username"]' admin >/dev/null 2>&1
agent-browser fill 'input[name="password"]' admin123 >/dev/null 2>&1
agent-browser click 'button[type="submit"]' >/dev/null 2>&1; sleep 1
agent-browser open "$BASE/admin/users" >/dev/null 2>&1; sleep 1.2
contains "ব্রাউজারে /admin/users খোলা" "$(agent-browser get url 2>/dev/null)" '/admin/users'
contains "__auQA সংজ্ঞায়িত" "$(ev 'typeof window.__auQA')" 'object'
T=$(ev 'window.__auQA.total()' | tr -d '"')
C=$(ev 'window.__auQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ]; then ok "প্রাথমিক count==total ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C)"; fi
agent-browser fill '#au251-filter' fbtest >/dev/null 2>&1; sleep 0.4
C2=$(ev 'window.__auQA.count()' | tr -d '"')
if [ -n "$C2" ] && [ "$C2" -gt 0 ] && [ "$C2" -lt "$T" ]; then ok "ফিল্টার fbtest → কাউন্ট-ড্রপ ($T→$C2)"; else bad "ফিল্টার-ড্রপ ব্যর্থ (total=$T got=$C2)"; fi
agent-browser fill '#au251-filter' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C3=$(ev 'window.__auQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("tr[data-au-empty]").hidden' | tr -d '"')
if [ "$C3" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C3 emptyHidden=$EMPT)"; fi
ev 'window.__auQA.clear()' >/dev/null 2>&1; sleep 0.3
C4=$(ev 'window.__auQA.count()' | tr -d '"')
if [ "$C4" = "$T" ]; then ok "__auQA.clear() → পুনরুদ্ধার ($T)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C4)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f"}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "au251-filter" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
ev 'document.getElementById("au251-filter").value="probe251";document.getElementById("au251-filter").dispatchEvent(new Event("input"));document.getElementById("au251-filter").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("au251-filter").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "au251-filter" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px hScroll-প্রমাণ: $HS"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.6
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser screenshot "$APP/tests/s251-ausearch-desk.png" >/dev/null 2>&1 && ok "s251-ausearch-desk.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s251-ausearch-mobile390.png" >/dev/null 2>&1 && ok "s251-ausearch-mobile390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=0"
if [ $FAIL -eq 0 ]; then echo "ALL GREEN ✓"; else echo "RED ✗ — $FAIL টি ব্যর্থ"; exit 1; fi
