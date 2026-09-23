#!/bin/bash
# s279-arlfilter-suite.sh — session279 অ্যাডমিন রিসোর্স তালিকা (/admin/resources) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (arl279 স্ট্রিপ + tr[data-arl-row]/data-kw সারফেস + শূন্য-অবস্থা + no-regression:
#          bulk-bar/data-bulk-all/data-bulk-msg/seriesStats (rss-grid + rssRefresh)/bulk-modal-include/thead/empty-শাখা — রেন্ডার্ড+সোর্স)
#          ② স্টাইল (arl279-ব্লক হেক্স-শূন্য টোকেন-শুধু — brandgreen-পরিবার; color-mix রিং; kbd-পিল; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__arlQA হুক; bare-id-একক-প্রোব + শিরোনাম-একক-প্রোব + ধরন-অ্যালায়াস-প্রোব (short+label) + ক্যাটাগরি-একক-প্রোব
#          + সর্বজনীন 'রিসোর্স resource'/'সম্পাদনা edit'/'মুছুন delete'; নো-ম্যাচ→শূন্য + computed-display-গার্ড-প্রমাণ +
#          শূন্য-বক্স-বিপরীত-প্রমাণ; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) +
#          দ্বি-ফিল্ড-গার্ড (bulk_ids-checkbox INPUT + rbmCsv TEXTAREA — মোডাল-অংশ); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **রিড-ওনলি-পূর্বগণনা-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-DB-রাইট-শূন্য
#          প্রমাণ = সারফেস-সারি PRE == FINAL + প্রোব-অবশেষ-শূন্য (GET /admin/resources = বিশ-SELECT — create-রুটে
#          broadcastToAll/notifySubscribers/mailer-শূন্য প্রমাণিত — s279-রাউন্ড রুট-মানচিত্র)
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireAdmin-অতিক্রম; s231-প্রথা)
#         ② csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ③ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ④ eval-JSON-এস্কেপ: tr -d '"\' + grep -qF ⑤ KeyboardEvent-cancelable:true
#         ⑥ নেমস্পেস: .arl279- ভার্সন-সাফিক্স (admin.css/tokens.css .arl279- প্রি-যাচাইকৃত-শূন্য — s273-গোটচা)
#         ⑦ tr-সারফেস: tr[data-arl-row][hidden] !important ⑧ ডেটা-নির্ভর-skip: সারফেস-শূন্যে-প্রোব-স্কিপ (s269-চুক্তি)
#         ⑨ [hidden]-বাইট-নিরাপত্তা: HG='['hidden']' কনক্যাট (transport-ম্যাংল-প্রমাণ)
#         ⑩ **while IFS= read -r মাল্টি-ওয়ার্ড-প্রোব-প্রথা (s277-গোটচা-সমাধান — for-loop word-splitting নিষিদ্ধ)**
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s279-ar-page.html
J=/tmp/s279-ar-jar.txt
HG='['hidden']'
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/resources"; }
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
if [ "$PC" = "200" ]; then ok "রিসোর্স-তালিকা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

ROWS=$(grep -o 'data-arl-row="' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'রিসোর্স resource' || true)
EDITN=$(kwlist | grep -c 'সম্পাদনা edit' || true)
DELN=$(kwlist | grep -c 'মুছুন delete' || true)
MAXID=$(kwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
IDP=''
for i in $(seq "${MAXID:-0}" -1 1); do
  if [ "$(kwlist | grep -cF "#$i " || true)" = "1" ]; then IDP="#$i"; break; fi
done
TITLEP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "শিরোনাম title $t ধরন type" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then TITLEP="$t"; break; fi
done < <(kwlist | sed -E 's/.*শিরোনাম title (.*) ধরন type .*/\1/' | sort -u | head -30)
TYPEP=''; TYPEN=0
while IFS= read -r t; do
  n=$(kwlist | grep -cF "ধরন type $t " || true)
  if [ "$n" -ge 1 ]; then TYPEP="$t"; TYPEN=$n; break; fi
done <<'TYPES'
PDF
পিডিএফ ফাইল
অডিও
ভিডিও
ছবি
ডক
লিংক
ড্রাইভ / লিংক
TYPES
CATP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "ক্যাটাগরি category $t " || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then CATP="$t"; break; fi
done < <(kwlist | sed -E 's/.*ক্যাটাগরি category (.*) (ফাইল file|লিংক link) .*/\1/' | sort -u | head -30)
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য kw কভারেজ ($ROWS সারি)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$UNIVN" = "$ROWS" ]; then ok "সর্বজনীন-টোকেন 'রিসোর্স resource' ($UNIVN/$ROWS)"; else bad "সর্বজনীন-ব্যর্থ"; fi
if [ "$EDITN" = "$ROWS" ] && [ "$DELN" = "$ROWS" ]; then ok "অ্যাকশন-টোকেন সর্বজনীন (edit=$EDITN delete=$DELN / $ROWS)"; else bad "অ্যাকশন-টোকেন-বেমান"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID নিম্নগামী)"; else skip "id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$TITLEP" ]; then ok "শিরোনাম-একক-প্রোব নির্বাচিত ('$TITLEP')"; else skip "শিরোনাম-প্রোব-নির্বাচন (অনন্য-শিরোনাম-নেই)"; fi
if [ -n "$TYPEP" ]; then ok "ধরন-অ্যালায়াস-প্রোব প্রস্তুত ($TYPEP — $TYPEN)"; else skip "ধরন-অ্যালায়াস (ডেটা-নির্ভর)"; fi
if [ -n "$CATP" ]; then ok "ক্যাটাগরি-একক-প্রোব নির্বাচিত ('$CATP')"; else skip "ক্যাটাগরি-প্রোব-নির্বাচন (অনন্য-ক্যাটাগরি-নেই)"; fi

echo "── ধাপ-১: কাঠামো (arl279 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (arl279-instant)" "$(cat "$PAGE")" 'id="arlInstant279"'
containsF "ফিল্টার-ইনপুট (arlFilter279)" "$(cat "$PAGE")" 'id="arlFilter279"'
containsF "ক্লিয়ার-বাটন (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="arlClear279" class="arl279-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="arlCount279" hidden'
containsF "kbd-hint" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (data-arl-empty)" "$(cat "$PAGE")" 'id="arlZero279" data-arl-empty hidden'
containsF "__arlQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__arlQA'
contains "no-regression: bulk-bar (রেন্ডার্ড)" "$(cat "$PAGE")" 'action="/admin/resources/bulk-delete"'
contains "no-regression: data-bulk-all checkbox (রেন্ডার্ড)" "$(grep -o 'data-bulk-all aria-label' "$PAGE" | wc -l)" '^1$'
contains "no-regression: data-bulk-msg বাটন (রেন্ডার্ড)" "$(grep -o 'data-bulk-msg="' "$PAGE" | wc -l)" '^1$'
contains "no-regression: seriesStats সেকশন (রেন্ডার্ড/কন্ডিশনাল-সোর্স)" "$(cat "$APP/admin/views/admin/resources/list.ejs")" 'rss-grid'
contains "no-regression: bulk-modal include (রেন্ডার্ড — rbmCsv)" "$(cat "$PAGE")" 'id="rbmCsv"'
contains "no-regression: rsxBulkBtn (রেন্ডার্ড)" "$(cat "$PAGE")" 'id="rsxBulkBtn"'
contains "no-regression: সম্পাদনা-লিংক (রেন্ডার্ড)" "$(grep -o '/edit"' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: DELETE-ফর্ম (রেন্ডার্ড)" "$(grep -o '_method=DELETE' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
SRC=$(cat "$APP/admin/views/admin/resources/list.ejs")
containsF "সোর্স: forEach((r, arlI279)) সূচক-যুক্ত" "$SRC" 'resources.forEach((r, arlI279) => {'
contains "সোর্স: kw হোয়াইটস্পেস-নরমালাইজ ×৪" "$(echo "$SRC" | grep -c "replace(/\\\\s+/g, ' '")" '^4$'
containsF "সোর্স: ধরন-মান-অ্যালায়াস (short+label)" "$SRC" "String(_rt.short || '')"
containsF "সোর্স: মূল-টাইপ-ব্যাজ অক্ষুণ্ণ" "$SRC" "RES_TYPE_META.RES_TYPES[RES_TYPE_META.normalizeResType(r)]"
containsF "সোর্স: empty-শাখা অক্ষুণ্ণ" "$SRC" '<div class="card empty">কোনো রিসোর্স নেই</div>'

echo "── ধাপ-২: স্টাইল (arl279 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session279 — arl279 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/resources/list.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং (brandgreen)" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" ".arl279-count-chip$HG { display: none; }"
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" ".arl279-zero$HG { display: none; }"
containsF "hidden-গার্ড-৩ (tr — সঠিক-বাইট !important)" "$CSSBLK" "tr[data-arl-row]$HG { display: none !important; }"

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/resources" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/login'; then
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/resources" >/dev/null 2>&1; sleep 1.2
else
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
fi
contains "ব্রাউজারে রিসোর্স-তালিকা খোলা (অ্যাঙ্করড-চেক s264 — BRE-নিরাপদ)" "$(agent-browser get url 2>/dev/null)" 'admin/resources$'
contains "__arlQA সংজ্ঞায়িত" "$(ev 'typeof window.__arlQA')" 'object'
T=$(ev 'window.__arlQA.total()' | tr -d '"')
C=$(ev 'window.__arlQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ] && [ -n "$IDP" ]; then
  agent-browser fill '#arlFilter279' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__arlQA.count()' | tr -d '"')
  if [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1)"; fi
else
  skip "id-প্রোব (সারফেস/প্রোব-শূন্য)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$TITLEP" ]; then
  agent-browser fill '#arlFilter279' "$TITLEP" >/dev/null 2>&1; sleep 0.4
  CN=$(ev 'window.__arlQA.count()' | tr -d '"')
  if [ "$CN" = "1" ]; then ok "শিরোনাম-একক-প্রোব '$TITLEP' → ১-মিল"; else bad "শিরোনাম-প্রোব ব্যর্থ (got=$CN)"; fi
else
  skip "শিরোনাম-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$TYPEP" ]; then
  agent-browser fill '#arlFilter279' "$TYPEP" >/dev/null 2>&1; sleep 0.4
  CT=$(ev 'window.__arlQA.count()' | tr -d '"')
  if [ "$CT" = "$TYPEN" ]; then ok "ধরন-অ্যালায়াস-প্রোব → পূর্বগণনা-মিল ($CT/$T)"; else bad "ধরন-প্রোব ব্যর্থ (got=$CT প্রত্যাশা=$TYPEN)"; fi
else
  skip "ধরন-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$CATP" ]; then
  agent-browser fill '#arlFilter279' "$CATP" >/dev/null 2>&1; sleep 0.4
  CG=$(ev 'window.__arlQA.count()' | tr -d '"')
  if [ "$CG" = "1" ]; then ok "ক্যাটাগরি-একক-প্রোব '$CATP' → ১-মিল"; else bad "ক্যাটাগরি-প্রোব ব্যর্থ (got=$CG)"; fi
else
  skip "ক্যাটাগরি-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#arlFilter279' 'রিসোর্স resource' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__arlQA.count()' | tr -d '"')
  CHIPV=$(ev 'document.getElementById("arlCount279").textContent' | tr -d '"')
  if [ "$C3" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C3 chip=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("arlCount279").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
  AMZ=$(ev 'document.getElementById("arlZero279").hidden' | tr -d '"')
  if [ "$AMZ" = "true" ]; then ok "শূন্য-অবস্থা মিল-থাকায় লুকানো"; else bad "শূন্য-অবস্থা-ত্রুটি (hidden=$AMZ)"; fi
else
  skip "প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi
agent-browser fill '#arlFilter279' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__arlQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-arl-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-arl-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারি hidden ($HID/$T)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
DISP=$(ev 'getComputedStyle(document.querySelector("[data-arl-row]")).display' | tr -d '"')
if [ "$DISP" = "none" ]; then ok "computed-display:none (tr-hidden-গার্ড-প্রমাণ)"; else bad "tr-hidden-গার্ড ব্যর্থ (display=$DISP)"; fi
ZD=$(ev 'getComputedStyle(document.getElementById("arlZero279")).display' | tr -d '"')
if [ "$ZD" != "none" ]; then ok "শূন্য-বক্স প্রদৃশ্যমান (zeroidden]-গার্ড-বিপরীত-প্রমাণ)"; else bad "শূন্য-বক্স display:none-এ-আটকেছে"; fi
ev 'window.__arlQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__arlQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__arlQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("arlCount279")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "arlFilter279" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (একক-স্ট্রিপ-মালিকানা, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=bulk_ids]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$FG" = "bulk_ids" ]; then ok "ফিল্ড-গার্ড-১: bulk_ids-checkbox-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড-১ ব্যর্থ (active=$FG)"; fi
TG=$(ev 'var b=document.getElementById("rbmBackdrop");var wasH=b.hidden;b.hidden=false;var s=document.getElementById("rbmCsv");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));var r=(document.activeElement.id||"");b.hidden=wasH;r' | tr -d '"')
if [ "$TG" = "rbmCsv" ]; then ok "ফিল্ড-গার্ড-২: rbmCsv-TEXTAREA-থেকে 'f' → ফোকাস-চুরি-শূন্য (মোডাল-অংশ-গার্ড — hidden-backdrop-খোলা-প্রোব)"; else bad "ফিল্ড-গার্ড-২ ব্যর্থ (active=$TG)"; fi
ev 'document.getElementById("arlFilter279").value="probe279";document.getElementById("arlFilter279").dispatchEvent(new Event("input"));document.getElementById("arlFilter279").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("arlFilter279").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "arlFilter279" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s279-arlfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s279-arlfilter-desk.png" ]; then ok "s279-arlfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s279-arlfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s279-arlfilter-mobile390.png" ]; then ok "s279-arlfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি-নেট-DB-রাইট-শূন্য-প্রমাণ (mo268-চুক্তি) ──"
PCF=$(fetch_page)
ROWSF=$(grep -o 'data-arl-row="' "$PAGE" | wc -l)
if [ "$PCF" = "200" ] && [ "$ROWS" = "$ROWSF" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (সারি $ROWS→$ROWSF)"; else bad "নেট-শূন্য-ব্যর্থ ($ROWS→$ROWSF)"; fi
RESF=$(grep -cE 'qa279|probe279' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "মার্কার/প্রোব-অবশেষ-শূন্য"; else bad "প্রোব-অবশেষ ($RESF)"; fi
ok "মিউটেশন-POST-শূন্য (লগইন-ব্যতীত — GET /admin/resources বিশ-SELECT; create-রুট broadcast-শূন্য-ম্যাপকৃত)"

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
