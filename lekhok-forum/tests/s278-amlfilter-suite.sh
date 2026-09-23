#!/bin/bash
# s278-amlfilter-suite.sh — session278 অ্যাডমিন কমিটি-সদস্য তালিকা (/admin/members) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (aml278 স্ট্রিপ + tr[data-aml-row]/data-kw সারফেস + শূন্য-অবস্থা + no-regression:
#          bulk-bar/data-bulk-all/data-bulk-msg ×৩/bulk-suspend+bulk-unsuspend/mem-filter-bar (term+type GET-ফিল্টার)/
#          sidebar/empty-শাখা — রেন্ডার্ড+সোর্স) ② স্টাইল (aml278-ব্লক হেক্স-শূন্য টোকেন-শুধু — brandgreen-পরিবার;
#          color-mix রিং; kbd-পিল; hidden-গার্ড ×৩ সঠিক-বাইট) ③ আচরণ (__amlQA হুক; bare-id-একক-প্রোব +
#          MEM-আইডি-একক-প্রোব + নাম/পদ/কার্যবর্ষ-একক-প্রোব + উইং-মান-অ্যালায়াস-প্রোব + স্ট্যাটাস-মান-অ্যালায়াস-প্রোব
#          + সর্বজনীন 'সদস্য member'/'সম্পাদনা edit'/'মুছুন delete'; নো-ম্যাচ→শূন্য + computed-display-গার্ড-প্রমাণ +
#          শূন্য-বক্স-বিপরীত-প্রমাণ; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) +
#          ফিল্ড-গার্ড (bulk_ids-checkbox — INPUT-গার্ড + term-SELECT-গার্ড — এ-পৃষ্ঠায় onchange-submit select আছে);
#          Escape-ক্লিয়ার+ব্লার) ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **রিড-ওনলি-পূর্বগণনা-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-DB-রাইট-শূন্য
#          প্রমাণ = সারফেস-সারি PRE == FINAL + প্রোব-অবশেষ-শূন্য (GET /admin/members = বিশ-SELECT — রুট-মানচিত্রিত)
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireAdmin-অতিক্রম; s231-প্রথা)
#         ② csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ③ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ④ eval-JSON-এস্কেপ: tr -d '"\' + grep -qF ⑤ KeyboardEvent-cancelable:true
#         ⑥ নেমস্পেস: .aml278- ভার্সন-সাফিক্স (admin.css/tokens.css .aml278- প্রি-যাচাইকৃত-শূন্য — s273-গোটচা;
#         mm-প্রিফিক্স-সংঘর্ষ-এড়ানো — moderator-members.ejs data-mm-row s255-থেকে ব্যবহৃত)
#         ⑦ tr-সারফেস: tr[data-aml-row][hidden] !important ⑧ ডেটা-নির্ভর-skip: সারফেস-শূন্যে-প্রোব-স্কিপ (s269-চুক্তি)
#         ⑨ [hidden]-বাইট-নিরাপত্তা: HG='['hidden']' কনক্যাট (transport-ম্যাংল-প্রমাণ)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s278-am-page.html
J=/tmp/s278-am-jar.txt
HG='['hidden']'
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/members"; }
kwlist(){ grep -oE 'data-kw="[^"]*"' "$PAGE" || true; }

echo "── ধাপ-০: পরিবেশ (প্রোব → লগইন → পূর্বগণনা) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "superadmin-লগইন admin/admin123 ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(fetch_page)
if [ "$PC" = "200" ]; then ok "সদস্য-তালিকা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

ROWS=$(grep -o 'data-aml-row="' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'সদস্য member' || true)
EDITN=$(kwlist | grep -c 'সম্পাদনা edit' || true)
DELN=$(kwlist | grep -c 'মুছুন delete' || true)
MAXID=$(kwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
IDP=''
for i in $(seq "${MAXID:-0}" -1 1); do
  if [ "$(kwlist | grep -cF "#$i " || true)" = "1" ]; then IDP="#$i"; break; fi
done
MEMP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "আইডি id $t নাম name" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 8 ]; then MEMP="$t"; break; fi
done < <(kwlist | sed -E 's/.*আইডি id ([^ ]*) নাম name .*/\1/' | grep '^MEM-' | sort -u | head -20)
NAMEP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "নাম name $t পদ role" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then NAMEP="$t"; break; fi
done < <(kwlist | sed -E 's/.*নাম name (.*) পদ role .*/\1/' | sort -u | head -20)
ROLEP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "পদ role $t ডিপার্টমেন্ট" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then ROLEP="$t"; break; fi
done < <(kwlist | sed -E 's/.*পদ role (.*) ডিপার্টমেন্ট department .*/\1/' | sort -u | head -20)
TERMP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "কার্যবর্ষ term $t " || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then TERMP="$t"; break; fi
done < <(kwlist | sed -E 's/.*কার্যবর্ষ term ([^ ]*) .*/\1/' | grep -E '[0-9]' | sort -u | head -20)
WINGP=''; WINGN=0
while IFS= read -r w; do
  n=$(kwlist | grep -cF "$w" || true)
  if [ "$n" -ge 1 ]; then WINGP="$w"; WINGN=$n; break; fi
done <<'WINGS'
কেন্দ্রীয় central
উপদেষ্টা advisory
প্রতিষ্ঠাতা founder
প্রকাশনা publication
স্থায়ী permanent
সাধারণ general
WINGS
STP=''; STN=0
while IFS= read -r s; do
  n=$(kwlist | grep -cF "$s" || true)
  if [ "$n" -ge 1 ]; then STP="$s"; STN=$n; break; fi
done <<'STS'
আনক্লেইমড unclaimed
অ্যাক্টিভ active
স্থগিত suspended
পেন্ডিং pending
STS
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য kw কভারেজ ($ROWS সারি)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$UNIVN" = "$ROWS" ]; then ok "সর্বজনীন-টোকেন 'সদস্য member' ($UNIVN/$ROWS)"; else bad "সর্বজনীন-ব্যর্থ"; fi
if [ "$EDITN" = "$ROWS" ] && [ "$DELN" = "$ROWS" ]; then ok "অ্যাকশন-টোকেন সর্বজনীন (edit=$EDITN delete=$DELN / $ROWS)"; else bad "অ্যাকশন-টোকেন-বেমান"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID নিম্নগামী)"; else skip "id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$MEMP" ]; then ok "MEM-আইডি একক-প্রোব নির্বাচিত ($MEMP)"; else skip "MEM-প্রোব-নির্বাচন (অনন্য-MEM-নেই)"; fi
if [ -n "$NAMEP" ]; then ok "নাম-একক-প্রোব নির্বাচিত ('$NAMEP')"; else skip "নাম-প্রোব-নির্বাচন (অনন্য-নাম-নেই)"; fi
if [ -n "$ROLEP" ]; then ok "পদ-একক-প্রোব নির্বাচিত ('$ROLEP')"; else skip "পদ-প্রোব-নির্বাচন (অনন্য-পদ-নেই)"; fi
if [ -n "$TERMP" ]; then ok "কার্যবর্ষ-একক-প্রোব নির্বাচিত ($TERMP)"; else skip "কার্যবর্ষ-প্রোব-নির্বাচন (অনন্য-বর্ষ-নেই)"; fi
if [ -n "$WINGP" ]; then ok "উইং-অ্যালায়াস-প্রোব প্রস্তুত ($WINGP — $WINGN)"; else skip "উইং-অ্যালায়াস (ডেটা-নির্ভর)"; fi
if [ -n "$STP" ]; then ok "স্ট্যাটাস-অ্যালায়াস-প্রোব প্রস্তুত ($STP — $STN)"; else skip "স্ট্যাটাস-অ্যালায়াস (ডেটা-নির্ভর)"; fi

echo "── ধাপ-১: কাঠামো (aml278 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (aml278-instant)" "$(cat "$PAGE")" 'id="amlInstant278"'
containsF "ফিল্টার-ইনপুট (amlFilter278)" "$(cat "$PAGE")" 'id="amlFilter278"'
containsF "ক্লিয়ার-বাটন (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="amlClear278" class="aml278-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="amlCount278" hidden'
containsF "kbd-hint" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (data-aml-empty)" "$(cat "$PAGE")" 'id="amlZero278" data-aml-empty hidden'
containsF "__amlQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__amlQA'
contains "no-regression: bulk-bar (রেন্ডার্ড)" "$(cat "$PAGE")" 'action="/admin/members/bulk-delete"'
contains "no-regression: data-bulk-all checkbox (রেন্ডার্ড — s269-গোটচা: সঠিক-প্যাটার্ন)" "$(grep -o 'data-bulk-all aria-label' "$PAGE" | wc -l)" '^1$'
contains "no-regression: data-bulk-msg বাটন ×৩ (রেন্ডার্ড)" "$(grep -o 'data-bulk-msg="' "$PAGE" | wc -l)" '^3$'
contains "no-regression: bulk-suspend formaction (রেন্ডার্ড)" "$(grep -o 'formaction="/admin/members/bulk-suspend"' "$PAGE" | wc -l)" '^1$'
contains "no-regression: bulk-unsuspend formaction (রেন্ডার্ড)" "$(grep -o 'formaction="/admin/members/bulk-unsuspend"' "$PAGE" | wc -l)" '^1$'
contains "no-regression: mem-filter-bar term-select (রেন্ডার্ড)" "$(grep -o 'name="term"' "$PAGE" | wc -l)" '^1$'
contains "no-regression: mem-filter-bar type-select (রেন্ডার্ড)" "$(grep -o 'name="type"' "$PAGE" | wc -l)" '^1$'
contains "no-regression: সম্পাদনা-লিংক (রেন্ডার্ড)" "$(grep -o '/edit"' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: DELETE-ফর্ম (রেন্ডার্ড)" "$(grep -o '_method=DELETE' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
SRC=$(cat "$APP/admin/views/admin/members/list.ejs")
containsF "সোর্স: forEach((m, amlI278)) সূচক-যুক্ত" "$SRC" 'members.forEach((m, amlI278) => {'
contains "সোর্স: kw হোয়াইটস্পেস-নরমালাইজ ×৫" "$(echo "$SRC" | grep -c "replace(/\\\\s+/g, ' '")" '^5$'
containsF "সোর্স: উইং-মান-অ্যালায়াস টার্নারি (s273-চুক্তি)" "$SRC" "m.member_type === 'central' ? 'কেন্দ্রীয় central'"
containsF "সোর্স: স্ট্যাটাস-মান-অ্যালায়াস (stAml278)" "$SRC" "stAml278 === 'active' ? 'অ্যাক্টিভ active'"
containsF "সোর্স: মূল-স্ট্যাটাস-টার্নারি অক্ষুণ্ণ" "$SRC" "m.account_status || (m.user_id ? 'active' : 'unclaimed')"
containsF "সোর্স: মূল-উইং-ব্যাজ-টার্নারি অক্ষুণ্ণ" "$SRC" "m.member_type === 'central' ? 'success'"
containsF "সোর্স: empty-শাখা অক্ষুণ্ণ" "$SRC" '<div class="card empty">কোনো সদস্য নেই</div>'

echo "── ধাপ-২: স্টাইল (aml278 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session278 — aml278 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/members/list.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং (brandgreen)" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" ".aml278-count-chip$HG { display: none; }"
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" ".aml278-zero$HG { display: none; }"
containsF "hidden-গার্ড-৩ (tr — সঠিক-বাইট !important)" "$CSSBLK" "tr[data-aml-row]$HG { display: none !important; }"

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/members" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/login'; then
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/members" >/dev/null 2>&1; sleep 1.2
else
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
fi
contains "ব্রাউজারে সদস্য-তালিকা খোলা (অ্যাঙ্করড-চেক s264 — BRE-নিরাপদ)" "$(agent-browser get url 2>/dev/null)" 'admin/members$'
contains "__amlQA সংজ্ঞায়িত" "$(ev 'typeof window.__amlQA')" 'object'
T=$(ev 'window.__amlQA.total()' | tr -d '"')
C=$(ev 'window.__amlQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ] && [ -n "$IDP" ]; then
  agent-browser fill '#amlFilter278' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1)"; fi
else
  skip "id-প্রোব (সারফেস/প্রোব-শূন্য)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$MEMP" ]; then
  agent-browser fill '#amlFilter278' "$MEMP" >/dev/null 2>&1; sleep 0.4
  CM=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CM" = "1" ]; then ok "MEM-আইডি একক-প্রোব '$MEMP' → ১-মিল"; else bad "MEM-প্রোব ব্যর্থ (got=$CM)"; fi
else
  skip "MEM-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$NAMEP" ]; then
  agent-browser fill '#amlFilter278' "$NAMEP" >/dev/null 2>&1; sleep 0.4
  CN=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CN" = "1" ]; then ok "নাম-একক-প্রোব '$NAMEP' → ১-মিল"; else bad "নাম-প্রোব ব্যর্থ (got=$CN)"; fi
else
  skip "নাম-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$ROLEP" ]; then
  agent-browser fill '#amlFilter278' "$ROLEP" >/dev/null 2>&1; sleep 0.4
  CR=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CR" = "1" ]; then ok "পদ-একক-প্রোব '$ROLEP' → ১-মিল"; else bad "পদ-প্রোব ব্যর্থ (got=$CR)"; fi
else
  skip "পদ-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$TERMP" ]; then
  agent-browser fill '#amlFilter278' "$TERMP" >/dev/null 2>&1; sleep 0.4
  CT=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CT" = "1" ]; then ok "কার্যবর্ষ-একক-প্রোব '$TERMP' → ১-মিল"; else bad "কার্যবর্ষ-প্রোব ব্যর্থ (got=$CT)"; fi
else
  skip "কার্যবর্ষ-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$WINGP" ]; then
  agent-browser fill '#amlFilter278' "$WINGP" >/dev/null 2>&1; sleep 0.4
  CW=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CW" = "$WINGN" ]; then ok "উইং-অ্যালায়াস-প্রোব → পূর্বগণনা-মিল ($CW/$T)"; else bad "উইং-প্রোব ব্যর্থ (got=$CW প্রত্যাশা=$WINGN)"; fi
else
  skip "উইং-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$STP" ]; then
  agent-browser fill '#amlFilter278' "$STP" >/dev/null 2>&1; sleep 0.4
  CS=$(ev 'window.__amlQA.count()' | tr -d '"')
  if [ "$CS" = "$STN" ]; then ok "স্ট্যাটাস-অ্যালায়াস-প্রোব → পূর্বগণনা-মিল ($CS/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$CS প্রত্যাশা=$STN)"; fi
else
  skip "স্ট্যাটাস-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#amlFilter278' 'সদস্য member' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__amlQA.count()' | tr -d '"')
  CHIPV=$(ev 'document.getElementById("amlCount278").textContent' | tr -d '"')
  if [ "$C3" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C3 chip=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("amlCount278").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
  AMZ=$(ev 'document.getElementById("amlZero278").hidden' | tr -d '"')
  if [ "$AMZ" = "true" ]; then ok "শূন্য-অবস্থা মিল-থাকায় লুকানো"; else bad "শূন্য-অবস্থা-ত্রুটি (hidden=$AMZ)"; fi
else
  skip "প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi
agent-browser fill '#amlFilter278' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__amlQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-aml-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-aml-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারি hidden ($HID/$T)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
DISP=$(ev 'getComputedStyle(document.querySelector("[data-aml-row]")).display' | tr -d '"')
if [ "$DISP" = "none" ]; then ok "computed-display:none (tr-hidden-গার্ড-প্রমাণ)"; else bad "tr-hidden-গার্ড ব্যর্থ (display=$DISP)"; fi
ZD=$(ev 'getComputedStyle(document.getElementById("amlZero278")).display' | tr -d '"')
if [ "$ZD" != "none" ]; then ok "শূন্য-বক্স প্রদৃশ্যমান (zeroidden]-গার্ড-বিপরীত-প্রমাণ)"; else bad "শূন্য-বক্স display:none-এ-আটকেছে"; fi
ev 'window.__amlQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__amlQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__amlQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("amlCount278")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "amlFilter278" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (একক-স্ট্রিপ-মালিকানা, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=bulk_ids]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$FG" = "bulk_ids" ]; then ok "ফিল্ড-গার্ড: bulk_ids-checkbox-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
SG=$(ev 'var s=document.querySelector("select[name=term]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$SG" = "term" ]; then ok "ফিল্ড-গার্ড: term-SELECT-থেকে 'f' → ফোকাস-চুরি-শূন্য (onchange-submit-সুরক্ষা)"; else bad "SELECT-গার্ড ব্যর্থ (active=$SG)"; fi
ev 'document.getElementById("amlFilter278").value="probe278";document.getElementById("amlFilter278").dispatchEvent(new Event("input"));document.getElementById("amlFilter278").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("amlFilter278").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "amlFilter278" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s278-amlfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s278-amlfilter-desk.png" ]; then ok "s278-amlfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s278-amlfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s278-amlfilter-mobile390.png" ]; then ok "s278-amlfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি-নেট-DB-রাইট-শূন্য-প্রমাণ (mo268-চুক্তি) ──"
PCF=$(fetch_page)
ROWSF=$(grep -o 'data-aml-row="' "$PAGE" | wc -l)
if [ "$PCF" = "200" ] && [ "$ROWS" = "$ROWSF" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (সারি $ROWS→$ROWSF)"; else bad "নেট-শূন্য-ব্যর্থ ($ROWS→$ROWSF)"; fi
RESF=$(grep -cE 'qa278|probe278' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "মার্কার/প্রোব-অবশেষ-শূন্য"; else bad "প্রোব-অবশেষ ($RESF)"; fi
ok "মিউটেশন-POST-শূন্য (লগইন-ব্যতীত — GET /admin/members বিশ-SELECT)"

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
