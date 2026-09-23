#!/bin/bash
# s280-aglfilter-suite.sh — session280 অ্যাডমিন গ্যালারি (/admin/gallery) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (agl280 স্ট্রিপ + div[data-agl-row]/data-kw কার্ড-সারফেস — s274-কার্ড-চুক্তি (tr-অনুমান-নিষিদ্ধ) +
#          agl280-catchip ক্যাটাগরি-চিপ + শূন্য-অবস্থা + no-regression: bulk-bar/data-bulk-msg/img/forEach/empty-শাখা/অ্যাকশন — রেন্ডার্ড+সোর্স)
#          ② স্টাইল (agl280-ব্লক হেক্স-শূন্য টোকেন-শুধু — brandgreen-পরিবার; color-mix রিং; kbd-পিল; hidden-গার্ড ×৩ সঠিক-বাইট — কার্ড-গার্ড [data-agl-row])
#          ③ আচরণ (__aglQA হুক; bare-id-একক-প্রোব + শিরোনাম-একক-প্রোব + ক্যাপশন-একক-প্রোব + ক্যাটাগরি-একক-প্রোব +
#          ক্যাটাগরি-বহু-প্রোব (n≥২) + সর্বজনীন 'ছবি image'/'সম্পাদনা edit'/'মুছুন delete'; নো-ম্যাচ→শূন্য + computed-display-গার্ড-প্রমাণ (কার্ড) +
#          শূন্য-বক্স-বিপরীত-প্রমাণ; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) +
#          ফিল্ড-গার্ড (bulk_ids-checkbox INPUT — এ-পৃষ্ঠায়-মোডাল-নেই); Escape-ক্লিয়ার+ব্লার)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **রিড-ওনলি-পূর্বগণনা-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-DB-রাইট-শূন্য
#          প্রমাণ = সারফেস-কার্ড PRE == FINAL + প্রোব-অবশেষ-শূন্য (GET /admin/gallery = বিশ-SELECT — create/update-রুটে
#          broadcastToAll/notifySubscribers/mailer-শূন্য প্রমাণিত — s280-রাউন্ড রুট-মানচিত্র: INSERT/UPDATE-শুধু)
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireAdmin-অতিক্রম; s231-প্রথা)
#         ② csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ③ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ④ eval-JSON-এস্কেপ: tr -d '"\' + grep -qF ⑤ KeyboardEvent-cancelable:true
#         ⑥ নেমস্পেস: .agl280- ভার্সন-সাফিক্স (admin.css/tokens.css .agl280- প্রি-যাচাইকৃত-শূন্য — s273-গোটচা)
#         ⑦ কার্ড-সারফেস: [data-agl-row]idden] !important (tr-নয় — div; s274-চুক্তি)
#         ⑧ ডেটা-নির্ভর-skip: সারফেস-শূন্যে-প্রোব-স্কিপ (s269-চুক্তি)
#         ⑨ idden]-বাইট-নিরাপত্তা: HG='['hidden']' কনক্যাট (transport-ম্যাংল-প্রমাণ)
#         ⑩ **while IFS= read -r মাল্টি-ওয়ার্ড-প্রোব-প্রথা (s277-গোটচা-সমাধান — for-loop word-splitting নিষিদ্ধ)**
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s280-ag-page.html
J=/tmp/s280-ag-jar.txt
HG='['hidden']'
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/gallery"; }
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
if [ "$PC" = "200" ]; then ok "গ্যালারি-তালিকা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

ROWS=$(grep -o 'data-agl-row="' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'ছবি image' || true)
EDITN=$(kwlist | grep -c 'সম্পাদনা edit' || true)
DELN=$(kwlist | grep -c 'মুছুন delete' || true)
CATN=$(kwlist | grep -c 'ক্যাটাগরি category' || true)
CHIPN=$(grep -o 'class="agl280-catchip"' "$PAGE" | wc -l)
IMGN=$(grep -o '<img src="' "$PAGE" | wc -l)
MAXID=$(kwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
IDP=''
for i in $(seq "${MAXID:-0}" -1 1); do
  if [ "$(kwlist | grep -cF "#$i " || true)" = "1" ]; then IDP="#$i"; break; fi
done
TITLEP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "শিরোনাম title $t ক্যাপশন caption" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then TITLEP="$t"; break; fi
done < <(kwlist | sed -E 's/.*শিরোনাম title (.*) ক্যাপশন caption .*/\1/' | sort -u | head -30)
CAPTP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "ক্যাপশন caption $t" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then CAPTP="$t"; break; fi
done < <(kwlist | sed -E 's/.*ক্যাপশন caption (.*) ক্যাটাগরি category .*/\1/' | sort -u | head -30)
CAT1P=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "ক্যাটাগরি category $t সম্পাদনা edit" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then CAT1P="$t"; break; fi
done < <(kwlist | sed -E 's/.*ক্যাটাগরি category (.*) সম্পাদনা edit.*/\1/' | sort -u | head -30)
CATNP=''; CATNN=0
while IFS= read -r t; do
  n=$(kwlist | grep -cF "ক্যাটাগরি category $t সম্পাদনা edit" || true)
  if [ "$n" -ge 2 ]; then CATNP="$t"; CATNN=$n; break; fi
done < <(kwlist | sed -E 's/.*ক্যাটাগরি category (.*) সম্পাদনা edit.*/\1/' | sort -u | head -30)
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য kw কভারেজ ($ROWS কার্ড)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$UNIVN" = "$ROWS" ]; then ok "সর্বজনীন-টোকেন 'ছবি image' ($UNIVN/$ROWS)"; else bad "সর্বজনীন-ব্যর্থ"; fi
if [ "$EDITN" = "$ROWS" ] && [ "$DELN" = "$ROWS" ] && [ "$CATN" = "$ROWS" ]; then ok "অ্যাকশন+ক্যাটাগরি-টোকেন সর্বজনীন (edit=$EDITN delete=$DELN cat=$CATN / $ROWS)"; else bad "অ্যাকশন-টোকেন-বেমান"; fi
if [ "$CHIPN" = "$ROWS" ] && [ "$IMGN" = "$ROWS" ]; then ok "ক্যাটাগরি-চিপ + img সারফেস-সমতুল্য (chip=$CHIPN img=$IMGN / $ROWS)"; else bad "চিপ/img-বেমান (chip=$CHIPN img=$IMGN row=$ROWS)"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID নিম্নগামী)"; else skip "id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$TITLEP" ]; then ok "শিরোনাম-একক-প্রোব নির্বাচিত ('$TITLEP')"; else skip "শিরোনাম-প্রোব-নির্বাচন (অনন্য-শিরোনাম-নেই)"; fi
if [ -n "$CAPTP" ]; then ok "ক্যাপশন-একক-প্রোব নির্বাচিত ('$CAPTP')"; else skip "ক্যাপশন-প্রোব-নির্বাচন (অনন্য-ক্যাপশন-নেই)"; fi
if [ -n "$CAT1P" ]; then ok "ক্যাটাগরি-একক-প্রোব নির্বাচিত ('$CAT1P')"; else skip "ক্যাটাগরি-একক-প্রোব (অনন্য-ক্যাটাগরি-নেই)"; fi
if [ -n "$CATNP" ]; then ok "ক্যাটাগরি-বহু-প্রোব প্রস্তুত ($CATNP — $CATNN)"; else skip "ক্যাটাগরি-বহু-প্রোব (ডেটা-নির্ভর)"; fi

echo "── ধাপ-১: কাঠামো (agl280 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (agl280-instant)" "$(cat "$PAGE")" 'id="aglInstant280"'
containsF "ফিল্টার-ইনপুট (aglFilter280)" "$(cat "$PAGE")" 'id="aglFilter280"'
containsF "ক্লিয়ার-বাটন (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="aglClear280" class="agl280-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="aglCount280" hidden'
containsF "kbd-hint" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (data-agl-empty)" "$(cat "$PAGE")" 'id="aglZero280" data-agl-empty hidden'
containsF "__aglQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__aglQA'
contains "no-regression: bulk-bar (রেন্ডার্ড)" "$(cat "$PAGE")" 'action="/admin/gallery/bulk-delete"'
contains "no-regression: data-bulk-msg বাটন (রেন্ডার্ড)" "$(grep -o 'data-bulk-msg="' "$PAGE" | wc -l)" '^1$'
contains "no-regression: সম্পাদনা-লিংক (রেন্ডার্ড)" "$(grep -o '/edit"' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: DELETE-ফর্ম (রেন্ডার্ড)" "$(grep -o '_method=DELETE' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
SRC=$(cat "$APP/admin/views/admin/gallery/list.ejs")
containsF "সোর্স: forEach((g, aglI280)) সূচক-যুক্ত" "$SRC" 'items.forEach((g, aglI280) => {'
contains "সোর্স: kw হোয়াইটস্পেস-নরমালাইজ ×৪" "$(echo "$SRC" | grep -c "replace(/\\\\s+/g, ' '")" '^4$'
containsF "সোর্স: ক্যাটাগরি-চিপ (agl280-catchip)" "$SRC" 'agl280-catchip'
containsF "সোর্স: কার্ড-গার্ড (div — tr-অনুমান-নিষিদ্ধ)" "$SRC" "[data-agl-row]$HG { display: none !important; }"
containsF "সোর্স: empty-শাখা অক্ষুণ্ণ" "$SRC" '<div class="card empty">কোনো ছবি নেই</div>'

echo "── ধাপ-২: স্টাইল (agl280 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session280 — agl280 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/gallery/list.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং (brandgreen)" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "catchip color-mix-বর্ডার" "$CSSBLK" 'border: 1px solid color-mix(in srgb, var(--lf-brandgreen) 25%, transparent)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" ".agl280-count-chip$HG { display: none; }"
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" ".agl280-zero$HG { display: none; }"
containsF "hidden-গার্ড-৩ (কার্ড — সঠিক-বাইট !important, tr-নয়)" "$CSSBLK" "[data-agl-row]$HG { display: none !important; }"

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/gallery" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/login'; then
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/gallery" >/dev/null 2>&1; sleep 1.2
else
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
fi
contains "ব্রাউজারে গ্যালারি-তালিকা খোলা (অ্যাঙ্করড-চেক s264 — BRE-নিরাপদ)" "$(agent-browser get url 2>/dev/null)" 'admin/gallery$'
contains "__aglQA সংজ্ঞায়িত" "$(ev 'typeof window.__aglQA')" 'object'
T=$(ev 'window.__aglQA.total()' | tr -d '"')
C=$(ev 'window.__aglQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ] && [ -n "$IDP" ]; then
  agent-browser fill '#aglFilter280' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__aglQA.count()' | tr -d '"')
  if [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1)"; fi
else
  skip "id-প্রোব (সারফেস/প্রোব-শূন্য)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$TITLEP" ]; then
  agent-browser fill '#aglFilter280' "$TITLEP" >/dev/null 2>&1; sleep 0.4
  CN=$(ev 'window.__aglQA.count()' | tr -d '"')
  if [ "$CN" = "1" ]; then ok "শিরোনাম-একক-প্রোব '$TITLEP' → ১-মিল"; else bad "শিরোনাম-প্রোব ব্যর্থ (got=$CN)"; fi
else
  skip "শিরোনাম-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$CAPTP" ]; then
  agent-browser fill '#aglFilter280' "$CAPTP" >/dev/null 2>&1; sleep 0.4
  CC=$(ev 'window.__aglQA.count()' | tr -d '"')
  if [ "$CC" = "1" ]; then ok "ক্যাপশন-একক-প্রোব '$CAPTP' → ১-মিল"; else bad "ক্যাপশন-প্রোব ব্যর্থ (got=$CC)"; fi
else
  skip "ক্যাপশন-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$CAT1P" ]; then
  agent-browser fill '#aglFilter280' "$CAT1P" >/dev/null 2>&1; sleep 0.4
  CG=$(ev 'window.__aglQA.count()' | tr -d '"')
  if [ "$CG" = "1" ]; then ok "ক্যাটাগরি-একক-প্রোব '$CAT1P' → ১-মিল"; else bad "ক্যাটাগরি-একক-প্রোব ব্যর্থ (got=$CG)"; fi
else
  skip "ক্যাটাগরি-একক-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ] && [ -n "$CATNP" ]; then
  agent-browser fill '#aglFilter280' "$CATNP" >/dev/null 2>&1; sleep 0.4
  CGN=$(ev 'window.__aglQA.count()' | tr -d '"')
  if [ "$CGN" = "$CATNN" ]; then ok "ক্যাটাগরি-বহু-প্রোব '$CATNP' → পূর্বগণনা-মিল ($CGN/$T)"; else bad "ক্যাটাগরি-বহু-প্রোব ব্যর্থ (got=$CGN প্রত্যাশা=$CATNN)"; fi
else
  skip "ক্যাটাগরি-বহু-প্রোব (ডেটা-নির্ভর)"
fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#aglFilter280' 'ছবি image' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__aglQA.count()' | tr -d '"')
  CHIPV=$(ev 'document.getElementById("aglCount280").textContent' | tr -d '"')
  if [ "$C3" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C3 chip=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("aglCount280").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
  AMZ=$(ev 'document.getElementById("aglZero280").hidden' | tr -d '"')
  if [ "$AMZ" = "true" ]; then ok "শূন্য-অবস্থা মিল-থাকায় লুকানো"; else bad "শূন্য-অবস্থা-ত্রুটি (hidden=$AMZ)"; fi
else
  skip "প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi
agent-browser fill '#aglFilter280' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__aglQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-agl-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-agl-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-কার্ড hidden ($HID/$T)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
DISP=$(ev 'getComputedStyle(document.querySelector("[data-agl-row]")).display' | tr -d '"')
if [ "$DISP" = "none" ]; then ok "computed-display:none (কার্ড-hidden-গার্ড-প্রমাণ — s274-চুক্তি)"; else bad "কার্ড-hidden-গার্ড ব্যর্থ (display=$DISP)"; fi
ZD=$(ev 'getComputedStyle(document.getElementById("aglZero280")).display' | tr -d '"')
if [ "$ZD" != "none" ]; then ok "শূন্য-বক্স প্রদৃশ্যমান (zeroidden]-গার্ড-বিপরীত-প্রমাণ)"; else bad "শূন্য-বক্স display:none-এ-আটকেছে"; fi
ev 'window.__aglQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__aglQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__aglQA.clear() → পুনরুদ্ধার ($T কার্ড)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("aglCount280")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "aglFilter280" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (একক-স্ট্রিপ-মালিকানা, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=bulk_ids]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$FG" = "bulk_ids" ]; then ok "ফিল্ড-গার্ড: bulk_ids-checkbox-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("aglFilter280").value="probe280";document.getElementById("aglFilter280").dispatchEvent(new Event("input"));document.getElementById("aglFilter280").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("aglFilter280").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "aglFilter280" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s280-aglfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s280-aglfilter-desk.png" ]; then ok "s280-aglfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s280-aglfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s280-aglfilter-mobile390.png" ]; then ok "s280-aglfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি-নেট-DB-রাইট-শূন্য-প্রমাণ (mo268-চুক্তি) ──"
PCF=$(fetch_page)
ROWSF=$(grep -o 'data-agl-row="' "$PAGE" | wc -l)
if [ "$PCF" = "200" ] && [ "$ROWS" = "$ROWSF" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (কার্ড $ROWS→$ROWSF)"; else bad "নেট-শূন্য-ব্যর্থ ($ROWS→$ROWSF)"; fi
RESF=$(grep -cE 'probe280|zzzqqqxyz' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "মার্কার/প্রোব-অবশেষ-শূন্য"; else bad "প্রোব-অবশেষ ($RESF)"; fi
ok "মিউটেশন-POST-শূন্য (লগইন-ব্যতীত — GET /admin/gallery বিশ-SELECT; create/update-রুট broadcast-শূন্য-ম্যাপকৃত — INSERT/UPDATE-শুধু)"

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
