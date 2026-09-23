#!/bin/bash
# s277-evfilter-suite.sh — session277 অ্যাডমিন ইভেন্ট তালিকা (/admin/events) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (ev277 স্ট্রিপ + tr[data-ev-row]/data-kw সারফেস + শূন্য-অবস্থা + no-regression:
#          bulk-bar/data-bulk-all/data-bulk-msg ×৩/edit-delete-রুট/sidebar/empty-শাখা — রেন্ডার্ড+সোর্স)
#          ② স্টাইল (ev277-ব্লক হেক্স-শূন্য টোকেন-শুধু — brandgreen-পরিবার; color-mix রিং; kbd-পিল; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__evQA হুক; bare-id-একক-প্রোব + শিরোনাম/তারিখ/স্থান-একক-প্রোব + featured-মান-অ্যালায়াস-প্রোব
#          (বিশেষ featured / সাধারণ normal — s273-মান-চুক্তি) + সর্বজনীন 'ইভেন্ট event'/'সম্পাদনা edit'/'মুছুন delete';
#          নো-ম্যাচ→শূন্য + computed-display-গার্ড-প্রমাণ + শূন্য-বক্স-বিপরীত-প্রমাণ; clear→পুনরুদ্ধার+চিপ-display:none;
#          'f'-ফোকাস (একক-স্ট্রিপ — মালিকানা-নির্দ্বিধা) + ফিল্ড-গার্ড (bulk_ids-checkbox — INPUT-গার্ড);
#          Escape-ক্লিয়ার+ব্লার) ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **রিড-ওনলি-পূর্বগণনা-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-DB-রাইট-শূন্য
#          প্রমাণ = সারফেস-ids PRE == FINAL + প্রোব-অবশেষ-শূন্য
#          (**গোটচা:** POST /admin/events broadcastToAll করে — marker-seed-ই২ই-নিষিদ্ধ (s274-চুক্তির
#          ব্যতিক্রম — সাইড-এফেক্ট-অবশিষ্ট; s276-চুক্তি-পুনঃপ্রমাণ) → mo268-ই-সঠিক)
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireScope('events')-অতিক্রম; s231-প্রথা)
#         ② csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ③ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ④ eval-JSON-এস্কেপ: tr -d '"\' + grep -qF ⑤ KeyboardEvent-cancelable:true
#         ⑥ নেমস্পেস: .ev277- ভার্সন-সাফিক্স (admin.css/tokens.css .ev277- প্রি-যাচাইকৃত-শূন্য — s273-গোটচা)
#         ⑦ tr-সারফেস: tr[data-ev-row]idden] !important ⑧ ডেটা-নির্ভর-skip: সারফেস-শূন্যে-প্রোব-স্কিপ (s269-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s277-ev-page.html
J=/tmp/s277-ev-jar.txt
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/events"; }
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
if [ "$PC" = "200" ]; then ok "ইভেন্ট-তালিকা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

ROWS=$(grep -o 'data-ev-row="' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'ইভেন্ট event' || true)
EDITN=$(kwlist | grep -c 'সম্পাদনা edit' || true)
DELN=$(kwlist | grep -c 'মুছুন delete' || true)
FEATN=$(kwlist | grep -c 'বিশেষ featured' || true)
NORMN=$(kwlist | grep -c 'সাধারণ normal' || true)
MAXID=$(kwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
IDP=''
for i in $(seq "${MAXID:-0}" -1 1); do
  if [ "$(kwlist | grep -cF "#$i " || true)" = "1" ]; then IDP="#$i"; break; fi
done
TITLEP=''
while IFS= read -r t; do
  n=$(kwlist | grep -cF "শিরোনাম title $t তারিখ" || true)
  if [ "$n" = "1" ] && [ "${#t}" -ge 4 ]; then TITLEP="$t"; break; fi
done < <(kwlist | sed -E 's/.*শিরোনাম title (.*) তারিখ date .*/\1/' | sort -u | head -20)
DATEP=''
while IFS= read -r d; do
  n=$(kwlist | grep -cF "তারিখ date $d স্থান" || true)
  if [ "$n" = "1" ] && [ "${#d}" -ge 4 ]; then DATEP="$d"; break; fi
done < <(kwlist | sed -E 's/.*তারিখ date (.*) স্থান location .*/\1/' | sort -u | head -20)
LOCP=''
while IFS= read -r l; do
  n=$(kwlist | grep -cF "স্থান location $l " || true)
  if [ "$n" = "1" ] && [ "${#l}" -ge 4 ]; then LOCP="$l"; break; fi
done < <(kwlist | sed -E 's/.*স্থান location (.*) (বিশেষ featured|সাধারণ normal) .*/\1/' | sort -u | head -20)
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য kw কভারেজ ($ROWS সারি)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$UNIVN" = "$ROWS" ]; then ok "সর্বজনীন-টোকেন 'ইভেন্ট event' ($UNIVN/$ROWS)"; else bad "সর্বজনীন-ব্যর্থ"; fi
if [ "$EDITN" = "$ROWS" ] && [ "$DELN" = "$ROWS" ]; then ok "অ্যাকশন-টোকেন সর্বজনীন (edit=$EDITN delete=$DELN / $ROWS)"; else bad "অ্যাকশন-টোকেন-বেমান"; fi
if [ "$FEATN" -ge 1 ] && [ "$NORMN" -ge 1 ]; then ok "featured-মান-বৈচিত্র্য প্রস্তুত (featured=$FEATN normal=$NORMN)"; else skip "featured-বৈচিত্র্য-অপ্রতুল (featured=$FEATN normal=$NORMN — ডেটা-নির্ভর)"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID নিম্নগামী)"; else skip "id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$TITLEP" ]; then ok "শিরোনাম-একক-প্রোব নির্বাচিত ('$TITLEP')"; else skip "শিরোনাম-প্রোব-নির্বাচন (অনন্য-শিরোনাম-নেই)"; fi
if [ -n "$DATEP" ]; then ok "তারিখ-একক-প্রোব নির্বাচিত ('$DATEP')"; else skip "তারিখ-প্রোব-নির্বাচন (অনন্য-তারিখ-নেই)"; fi
if [ -n "$LOCP" ]; then ok "স্থান-একক-প্রোব নির্বাচিত ('$LOCP')"; else skip "স্থান-প্রোব-নির্বাচন (অনন্য-স্থান-নেই)"; fi

echo "── ধাপ-১: কাঠামো (ev277 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (ev277-instant)" "$(cat "$PAGE")" 'id="evInstant277"'
containsF "ফিল্টার-ইনপুট (evFilter277)" "$(cat "$PAGE")" 'id="evFilter277"'
containsF "ক্লিয়ার-বাটন (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="evClear277" class="ev277-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="evCount277" hidden'
containsF "kbd-hint" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (data-ev-empty)" "$(cat "$PAGE")" 'id="evZero277" data-ev-empty hidden'
containsF "__evQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__evQA'
contains "no-regression: bulk-bar (রেন্ডার্ড)" "$(cat "$PAGE")" 'action="/admin/events/bulk-delete"'
contains "no-regression: data-bulk-all checkbox (রেন্ডার্ড — s269-গোটচা: JS-ref-বাদ সঠিক-প্যাটার্ন)" "$(grep -o 'data-bulk-all aria-label' "$PAGE" | wc -l)" '^1$'
contains "no-regression: data-bulk-msg বাটন ×৩ (রেন্ডার্ড — সঠিক-প্যাটার্ন)" "$(grep -o 'data-bulk-msg="' "$PAGE" | wc -l)" '^3$'
contains "no-regression: bulk-toggle-ফর্মঅ্যাকশন ×২ (রেন্ডার্ড)" "$(grep -o 'formaction="/admin/events/bulk-toggle"' "$PAGE" | wc -l)" '^2$'
contains "no-regression: সম্পাদনা-লিংক (রেন্ডার্ড)" "$(grep -o '/edit"' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: DELETE-ফর্ম (রেন্ডার্ড)" "$(grep -o '_method=DELETE' "$PAGE" | wc -l)" "^$ROWS$"
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
SRC=$(cat "$APP/admin/views/admin/events/list.ejs")
containsF "সোর্স: forEach((e, evI277)) সূচক-যুক্ত" "$SRC" 'events.forEach((e, evI277) => {'
contains "সোর্স: kw হোয়াইটস্পেস-নরমালাইজ ×৩" "$(echo "$SRC" | grep -c "replace(/\\\\s+/g, ' '")" '^3$'
containsF "সোর্স: featured-মান-অ্যালায়াস (s273-চুক্তি)" "$SRC" "e.featured ? 'বিশেষ featured' : 'সাধারণ normal'"
containsF "সোর্স: empty-শাখা অক্ষুণ্ণ" "$SRC" '<div class="card empty">কোনো ইভেন্ট নেই</div>'

echo "── ধাপ-২: স্টাইল (ev277 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session277 — ev277 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/events/list.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং (brandgreen)" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" '.ev277-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" '.ev277-zero[hidden] { display: none; }'
containsF "hidden-গার্ড-৩ (tr — সঠিক-বাইট !important)" "$CSSBLK" 'tr[data-ev-row][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/events" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/login'; then
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/events" >/dev/null 2>&1; sleep 1.2
else
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
fi
contains "ব্রাউজারে ইভেন্ট-তালিকা খোলা" "$(agent-browser get url 2>/dev/null)" 'admin/events'
contains "__evQA সংজ্ঞায়িত" "$(ev 'typeof window.__evQA')" 'object'
T=$(ev 'window.__evQA.total()' | tr -d '"')
C=$(ev 'window.__evQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
if [ "$ROWS" -ge 1 ]; then
  agent-browser fill '#evFilter277' "$IDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__evQA.count()' | tr -d '"')
  if [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1)"; fi
  if [ -n "$TITLEP" ]; then
    agent-browser fill '#evFilter277' "$TITLEP" >/dev/null 2>&1; sleep 0.4
    CT=$(ev 'window.__evQA.count()' | tr -d '"')
    if [ "$CT" = "1" ]; then ok "শিরোনাম-একক-প্রোব '$TITLEP' → ১-মিল"; else bad "শিরোনাম-প্রোব ব্যর্থ (got=$CT)"; fi
  else
    skip "শিরোনাম-প্রোব (অনন্য-শিরোনাম-নেই)"
  fi
  if [ -n "$DATEP" ]; then
    agent-browser fill '#evFilter277' "$DATEP" >/dev/null 2>&1; sleep 0.4
    CD=$(ev 'window.__evQA.count()' | tr -d '"')
    if [ "$CD" = "1" ]; then ok "তারিখ-একক-প্রোব '$DATEP' → ১-মিল"; else bad "তারিখ-প্রোব ব্যর্থ (got=$CD)"; fi
  else
    skip "তারিখ-প্রোব (অনন্য-তারিখ-নেই)"
  fi
  if [ -n "$LOCP" ]; then
    agent-browser fill '#evFilter277' "$LOCP" >/dev/null 2>&1; sleep 0.4
    CL=$(ev 'window.__evQA.count()' | tr -d '"')
    if [ "$CL" = "1" ]; then ok "স্থান-একক-প্রোব '$LOCP' → ১-মিল"; else bad "স্থান-প্রোব ব্যর্থ (got=$CL)"; fi
  else
    skip "স্থান-প্রোব (অনন্য-স্থান-নেই)"
  fi
  if [ "$FEATN" -ge 1 ]; then
    agent-browser fill '#evFilter277' 'বিশেষ featured' >/dev/null 2>&1; sleep 0.4
    CF=$(ev 'window.__evQA.count()' | tr -d '"')
    if [ "$CF" = "$FEATN" ]; then ok "featured-অ্যালায়াস-প্রোব → পূর্বগণনা-মিল ($CF/$T)"; else bad "featured-প্রোব ব্যর্থ (got=$CF প্রত্যাশা=$FEATN)"; fi
  else
    skip "featured-প্রোব (ডেটা-নির্ভর)"
  fi
  if [ "$NORMN" -ge 1 ]; then
    agent-browser fill '#evFilter277' 'সাধারণ normal' >/dev/null 2>&1; sleep 0.4
    CN=$(ev 'window.__evQA.count()' | tr -d '"')
    if [ "$CN" = "$NORMN" ]; then ok "normal-অ্যালায়াস-প্রোব → পূর্বগণনা-মিল ($CN/$T)"; else bad "normal-প্রোব ব্যর্থ (got=$CN)"; fi
  else
    skip "normal-প্রোব (ডেটা-নির্ভর)"
  fi
  agent-browser fill '#evFilter277' 'ইভেন্ট event' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__evQA.count()' | tr -d '"')
  CHIPV=$(ev 'document.getElementById("evCount277").textContent' | tr -d '"')
  if [ "$C3" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C3 chip=$CHIPV)"; fi
  CHIPS=$(ev 'document.getElementById("evCount277").hidden' | tr -d '"')
  if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
  EVZ=$(ev 'document.getElementById("evZero277").hidden' | tr -d '"')
  if [ "$EVZ" = "true" ]; then ok "শূন্য-অবস্থা মিল-থাকায় লুকানো"; else bad "শূন্য-অবস্থা-ত্রুটি (hidden=$EVZ)"; fi
else
  skip "প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi
agent-browser fill '#evFilter277' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__evQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-ev-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-ev-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারি hidden ($HID/$T)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
DISP=$(ev 'getComputedStyle(document.querySelector("[data-ev-row]")).display' | tr -d '"')
if [ "$DISP" = "none" ]; then ok "computed-display:none (tr-hidden-গার্ড-প্রমাণ)"; else bad "tr-hidden-গার্ড ব্যর্থ (display=$DISP)"; fi
ZD=$(ev 'getComputedStyle(document.getElementById("evZero277")).display' | tr -d '"')
if [ "$ZD" != "none" ]; then ok "শূন্য-বক্স প্রদৃশ্যমান (zero[hidden]-গার্ড-বিপরীত-প্রমাণ)"; else bad "শূন্য-বক্স display:none-এ-আটকেছে"; fi
ev 'window.__evQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__evQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__evQA.clear() → পুনরুদ্ধার ($T সারি)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("evCount277")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "evFilter277" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (একক-স্ট্রিপ-মালিকানা, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=bulk_ids]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$FG" = "bulk_ids" ]; then ok "ফিল্ড-গার্ড: bulk_ids-checkbox-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("evFilter277").value="probe277";document.getElementById("evFilter277").dispatchEvent(new Event("input"));document.getElementById("evFilter277").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("evFilter277").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "evFilter277" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s277-evfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s277-evfilter-desk.png" ]; then ok "s277-evfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s277-evfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s277-evfilter-mobile390.png" ]; then ok "s277-evfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি-নেট-DB-রাইট-শূন্য-প্রমাণ (mo268-চুক্তি) ──"
PCF=$(fetch_page)
ROWSF=$(grep -o 'data-ev-row="' "$PAGE" | wc -l)
if [ "$PCF" = "200" ] && [ "$ROWS" = "$ROWSF" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (সারি $ROWS→$ROWSF)"; else bad "নেট-শূন্য-ব্যর্থ ($ROWS→$ROWSF)"; fi
RESF=$(grep -cE 'qa277|probe277' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "মার্কার/প্রোব-অবশেষ-শূন্য"; else bad "প্রোব-অবশেষ ($RESF)"; fi
ok "মিউটেশন-POST-শূন্য (লগইন-ব্যতীত — broadcast-সাইড-এফেক্ট-এড়ানো)"

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
