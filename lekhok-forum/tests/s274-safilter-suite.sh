#!/bin/bash
# s274-safilter-suite.sh — session274 সুপার-অ্যাডমিন তালিকা (/admin/super/admins) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (sa274 স্ট্রিপ + div[data-sa-row]/data-kw কার্ড-সারফেস + শূন্য-অবস্থা +
#          no-regression: নতুন-অ্যাডমিন-ফর্ম/স্কোপ-ম্যাক/js-confirm/সেলফ-নোট/sidebar)
#          ② স্টাইল (sa274-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix রিং; kbd-পিল; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__saQA হুক; bare-id-একক-প্রোব + 'সুপার-এডমিন superadmin'-রোল + 'এডমিন admin'-রোল +
#          'QA-274'-নাম + সর্বজনীন 'অ্যাডমিন admin'/'আনলকড unlocked'/'সীমাহীন unlimited'; নো-ম্যাচ→শূন্য;
#          সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস + ফিল্ড-গার্ড (input[name=username]);
#          Escape-ক্লিয়ার+ব্লার) ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **marker-seed-নেট-শূন্য-চুক্তি (s272-সমতুল্য):** POST /admins/add ×২-সিড → টেস্ট-উইন্ডো →
#          POST /admins/:id/remove ×২-ক্লিনার → **ids PRE == FINAL + marker-অবশেষ-শূন্য + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে**
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireSuperAdmin; s231/s273-প্রথা)
#         ② **Location-হেডার-যাচাই বাধ্যতমূলক** (saved=admin_add/admin_remove; err=1 — সব-ই 303 — s272-গোটচা)
#         ③ csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ④ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ⑤ **'এডমিন admin' ⊄ 'সুপার-এডমিন superadmin'** (বাংলা-অক্ষর-ভিন্ন + superadmin-এক-শব্দ —
#         প্রোব-বিচ্ছিন্নতা-প্রমাণ-সুইটে) ⑥ eval-JSON-এস্কেপ: tr -d '"\\' + grep -qF ⑦ KeyboardEvent-cancelable:true
#         ⑧ নেমস্পেস: .sa274- ভার্সন-সাফিক্স (.sa-* admin.css-ব্যস্ত: sa-super/sa-admin; .sac-* এ-পৃষ্ঠায়-ব্যস্ত)
#         ⑨ কার্ড-সারফেস: hidden-গার্ড [data-sa-row][hidden] (tr-নয় — div)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s274-sa-page.html
J=/tmp/s274-sa-jar.txt
M1=qa274a1; M2=qa274a2; MPWD='Test@2734'
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/super/admins"; }
kwlist(){ grep -oE 'data-kw="[^"]*"' "$PAGE"; }
ids_in(){ grep -oE 'data-kw="#[0-9]+' "$1" 2>/dev/null | grep -oE '[0-9]+' | sort -u; }
id_newlist(){ comm -13 <(echo "$1" | sort -u) <(echo "$2" | sort -u); }

echo "── ধাপ-০: পরিবেশ (প্রোব → লগইন → ক্র্যাশ-অবশেষ-ক্লিনার → marker-সিড) ──"
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
if [ "$PC" = "200" ]; then ok "অ্যাডমিন-তালিকা পৃষ্ঠা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

# ক্র্যাশ-অবশেষ-ক্লিনার (s267-প্রথা)
RES=$(grep -oE 'qa274a[12]' "$PAGE" | sort -u | tr '\n' ' ')
if [ -n "$RES" ]; then
  for m in $RES; do
    rid=$(kwlist | grep -B0 "qa274" >/dev/null; grep -oE "data-kw=\"#[0-9]+ [^\"]*$m" "$PAGE" | grep -oE '[0-9]+' | head -1)
    RL=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -X POST "$BASE/admin/super/admins/$rid/remove" -H "x-csrf-token: $TOK")
    if echo "$RL" | grep -q 'saved=admin_remove'; then ok "ক্র্যাশ-অবশেষ-ক্লিনার: $m (id=$rid) সরানো"; else bad "ক্র্যাশ-ক্লিনার ব্যর্থ ($m id=$rid → $RL)"; fi
  done
  fetch_page >/dev/null
else
  ok "ক্র্যাশ-অবশেষ-শূন্য (ক্লিনার-অপ্রয়োজনীয়)"
fi

PRE=$(ids_in "$PAGE")
CARDS_PRE=$(grep -o 'data-sa-row=' "$PAGE" | wc -l)
SEEDN=0
for m in "$M1" "$M2"; do
  RL=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -X POST "$BASE/admin/super/admins/add" -H "x-csrf-token: $TOK" --data-urlencode "username=$m" --data-urlencode "password=$MPWD" --data-urlencode "display_name=QA-274-মার্কার $m" --data-urlencode "role=admin")
  if echo "$RL" | grep -q 'saved=admin_add'; then ok "marker-সিড POST /admins/add $m (Location-প্রমাণ)"; SEEDN=$((SEEDN+1)); else bad "সিড-ব্যর্থ $m (→ $RL)"; fi
done
PC2=$(fetch_page)
if [ "$PC2" = "200" ]; then ok "সিড-পরবর্তী পৃষ্ঠা 200"; else bad "সিড-পরবর্তী HTTP $PC2"; fi
POST_IDS=$(ids_in "$PAGE")
CARDS=$(grep -o 'data-sa-row=' "$PAGE" | wc -l)
NEWIDS=$(id_newlist "$PRE" "$POST_IDS")
NNEW=$(echo "$NEWIDS" | grep -c '[0-9]' || true)
if [ "$CARDS" = "$((CARDS_PRE+SEEDN))" ] && [ "$NNEW" = "$SEEDN" ]; then ok "সিড-প্রমাণ (কার্ড $CARDS_PRE→$CARDS, নতুন-id ×$NNEW)"; else bad "সিড-বেমান (cards=$CARDS প্রত্যাশা=$((CARDS_PRE+SEEDN)) নতুন=$NNEW)"; fi

ROWS=$CARDS
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'অ্যাডমিন admin' || true)
SUPN=$(kwlist | grep -c 'সুপার-এডমিন superadmin' || true)
ADMN=$(kwlist | grep -c 'রোল role এডমিন admin' || true)
UNLKN=$(kwlist | grep -c 'আনলকড unlocked' || true)
UNLIMN=$(kwlist | grep -c 'সীমাহীন unlimited' || true)
NAMN=$(kwlist | grep -c 'QA-274' || true)
MAXID=$(grep -oE 'data-kw="#[0-9]+' "$PAGE" | grep -oE '[0-9]+' | sort -n | tail -1)
IDP=''
for i in $(seq "$MAXID" -1 1); do
  if [ "$(kwlist | grep -cF "#$i" || true)" = "1" ]; then IDP="#$i"; break; fi
done
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 3 ]; then ok "সারফেস-সমতুল্য kw কভারেজ ($ROWS কার্ড)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW)"; fi
if [ "$UNIVN" = "$ROWS" ] && [ "$UNLKN" = "$ROWS" ] && [ "$UNLIMN" = "$ROWS" ]; then ok "সর্বজনীন-অ্যালায়াস (univ=$UNIVN unlock=$UNLKN unlim=$UNLIMN / $ROWS)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ"; fi
if [ "$SUPN" -ge 1 ] && [ "$ADMN" = "$SEEDN" ]; then ok "রোল-প্রোব প্রস্তুত (super=$SUPN, admin=$ADMN)"; else bad "রোল-প্রোব-বেমান (super=$SUPN admin=$ADMN প্রত্যাশা=$SEEDN)"; fi
if [ "$NAMN" = "$SEEDN" ]; then ok "নাম-প্রোব প্রস্তুত ('QA-274' → $NAMN)"; else bad "নাম-প্রোব ব্যর্থ ($NAMN)"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID নিম্নগামী)"; else bad "id-প্রোব-নির্বাচন ব্যর্থ"; fi

echo "── ধাপ-১: কাঠামো (sa274 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (sa274-instant)" "$(cat "$PAGE")" 'id="saInstant274"'
containsF "ফিল্টার-ইনপুট (saFilter274)" "$(cat "$PAGE")" 'id="saFilter274"'
containsF "ক্লিয়ার-বাটন (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="saClear274" class="sa274-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="saCount274" hidden'
containsF "kbd-hint" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (data-sa-empty)" "$(cat "$PAGE")" 'id="saZero274" data-sa-empty hidden'
containsF "__saQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__saQA'
containsF "no-regression: নতুন-অ্যাডমিন ফর্ম" "$(cat "$PAGE")" 'action="/admin/super/admins/add"'
containsF "no-regression: input[name=username]" "$(cat "$PAGE")" 'name="username" pattern="[a-z0-9_]{3,30}"'
contains "no-regression: স্কোপ-ম্যাক (রেন্ডার্ড)" "$(cat "$PAGE")" 'sac-scope-group'
contains "no-regression: js-confirm ফর্ম (রেন্ডার্ড)" "$(cat "$PAGE")" 'js-confirm'
contains "no-regression: সেলফ-নোট (রেন্ডার্ড)" "$(cat "$PAGE")" 'sac-self-note'
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
SRC=$(cat "$APP/admin/views/admin/super/admins.ejs")
containsF "সোর্স: forEach((a, saI274)) সূচক-যুক্ত" "$SRC" 'admins.forEach((a, saI274) => {'
containsF "সোর্স: remove-রুট অক্ষুণ্ণ" "$SRC" 'action="/admin/super/admins/<%= a.id %>/remove"'

echo "── ধাপ-২: স্টাইল (sa274 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session274 — sa274 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/super/admins.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" '.sa274-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" '.sa274-zero[hidden] { display: none; }'
containsF "hidden-গার্ড-৩ (কার্ড — সঠিক-বাইট !important)" "$CSSBLK" '[data-sa-row][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/super/admins" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/super/admins'; then
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/super/admins" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে অ্যাডমিন-তালিকা খোলা" "$(agent-browser get url 2>/dev/null)" 'admin/super/admins'
contains "__saQA সংজ্ঞায়িত" "$(ev 'typeof window.__saQA')" 'object'
T=$(ev 'window.__saQA.total()' | tr -d '"')
C=$(ev 'window.__saQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
agent-browser fill '#saFilter274' "$IDP" >/dev/null 2>&1; sleep 0.4
C1=$(ev 'window.__saQA.count()' | tr -d '"')
if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
agent-browser fill '#saFilter274' 'সুপার-এডমিন superadmin' >/dev/null 2>&1; sleep 0.4
C2=$(ev 'window.__saQA.count()' | tr -d '"')
if [ -n "$C2" ] && [ "$C2" = "$SUPN" ]; then ok "super-রোল-প্রোব → পূর্বগণনা-মিল ($C2/$T)"; else bad "super-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$SUPN)"; fi
agent-browser fill '#saFilter274' 'রোল role এডমিন admin' >/dev/null 2>&1; sleep 0.4
C3=$(ev 'window.__saQA.count()' | tr -d '"')
if [ -n "$C3" ] && [ "$C3" = "$ADMN" ]; then ok "admin-রোল-প্রোব → মিল + superadmin-অবিচ্ছিন্ন ($C3/$T)"; else bad "admin-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$ADMN)"; fi
agent-browser fill '#saFilter274' 'QA-274' >/dev/null 2>&1; sleep 0.4
C4=$(ev 'window.__saQA.count()' | tr -d '"')
if [ -n "$C4" ] && [ "$C4" = "$NAMN" ]; then ok "নাম-প্রোব 'QA-274' → মিল ($C4/$T)"; else bad "নাম-প্রোব ব্যর্থ (got=$C4)"; fi
agent-browser fill '#saFilter274' 'অ্যাডমিন admin' >/dev/null 2>&1; sleep 0.4
C5=$(ev 'window.__saQA.count()' | tr -d '"')
CHIPV=$(ev 'document.getElementById("saCount274").textContent' | tr -d '"')
if [ -n "$C5" ] && [ "$C5" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C5 chip=$CHIPV)"; fi
CHIPS=$(ev 'document.getElementById("saCount274").hidden' | tr -d '"')
if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
agent-browser fill '#saFilter274' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C6z=$(ev 'window.__saQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-sa-empty]").hidden' | tr -d '"')
if [ "$C6z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C6z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-sa-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-কার্ড hidden ($HID/$T — গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
ev 'window.__saQA.clear()' >/dev/null 2>&1; sleep 0.3
C7=$(ev 'window.__saQA.count()' | tr -d '"')
if [ "$C7" = "$T" ]; then ok "__saQA.clear() → পুনরুদ্ধার ($T কার্ড)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C7)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("saCount274")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "saFilter274" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=username]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.name || "")' | tr -d '"')
if [ "$FG" = "username" ]; then ok "ফিল্ড-গার্ড: username-ইনপুট-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("saFilter274").value="probe274";document.getElementById("saFilter274").dispatchEvent(new Event("input"));document.getElementById("saFilter274").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("saFilter274").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "saFilter274" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s274-safilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s274-safilter-desk.png" ]; then ok "s274-safilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s274-safilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s274-safilter-mobile390.png" ]; then ok "s274-safilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: ক্লিনার + নেট-DB-রাইট-শূন্য-প্রমাণ (s272-চুক্তি) ──"
fetch_page >/dev/null
CLEANN=0
for m in "$M1" "$M2"; do
  rid=$(grep -oE "data-kw=\"#[0-9]+ [^\"]*$m" "$PAGE" | grep -oE '[0-9]+' | head -1)
  if [ -n "$rid" ]; then
    RL=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -X POST "$BASE/admin/super/admins/$rid/remove" -H "x-csrf-token: $TOK")
    if echo "$RL" | grep -q 'saved=admin_remove'; then ok "marker-ক্লিনার remove $m (id=$rid — Location-প্রমাণ)"; CLEANN=$((CLEANN+1)); else bad "ক্লিনার-ব্যর্থ $m (→ $RL)"; fi
  else
    bad "marker-id নিষ্কাশন ব্যর্থ ($m)"
  fi
done
PCF=$(fetch_page)
FINAL=$(ids_in "$PAGE")
if [ "$PCF" = "200" ] && [ "$PRE" = "$FINAL" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (ids PRE == FINAL)"; else bad "নেট-শূন্য-ব্যর্থ (PRE=[$PRE] FINAL=[$FINAL])"; fi
RESF=$(grep -cE 'qa274a[12]' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "marker-অবশেষ-শূন্য"; else bad "marker-অবশেষ ($RESF)"; fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
