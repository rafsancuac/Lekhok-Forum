#!/bin/bash
# s273-sufilter-suite.sh — session273 সুপার-ইউজার সাপোর্ট (/admin/super/users-support) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (su273 স্ট্রিপ + tr[data-su-row]/data-kw সারি-সারফেস + শূন্য-অবস্থা +
#          no-regression: us-searchbar/input[name=q]/us-chips/us-table/us-empty-ব্রাঞ্চ(সোর্স)/sidebar/300-hint(সোর্স))
#          ② স্টাইল (su273-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া;
#          640px-সংকোচন; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__suQA হুক; '#id'-একক-প্রোব (bare — অনন্যতা-পূর্বযাচাই) + 'মডারেটর moderator'-রোল-প্রোব +
#          'সক্রিয় active'-স্ট্যাটাস-প্রোব + সর্বজনীন 'ইউজার user'/'স্ট্যাটাস status'; নো-ম্যাচ→শূন্য-অবস্থা;
#          সব-hidden; clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব (input[name=q]-থেকে);
#          Escape-ক্লিয়ার+ব্লার; **দ্বৈত-ফিল্টার-সহ-অস্তিত্ব: বিদ্যমান us-সার্চ-ফিল্টার-অক্ষুণ্ণ — দুই-স্বাধীন-ডাইমেনশন**)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ নেট-DB-রাইট-শূন্য (রিড-ওনলি-সারফেস — s270-চুক্তি: রেন্ডার্ড-পাংক্তি PRE == FINAL)
# চুক্তি: ① **রিড-ওনলি-পূর্বগণনা (mo268/au270-চুক্তি):** সিড-নেই — প্রোব-প্রত্যাশা রেন্ডার্ড-HTML-থেকে
#         (data-kw-নিষ্কাশন); মিউটেশন-POST-শূন্য → users-টেবিল-অস্পৃষ্ত ② ভিউয়ার = admin/admin123
#         (admin_users.superadmin — requireSuperAdmin; s231-প্রথা) ③ **bare-id-প্রোব-অনন্যতা:** '#N'-সাবস্ট্রিং
#         ঝুঁকি (#6 ⊂ #60) → সর্বোচ্চ-id-থেকে-নিম্নগামী-প্রথম-অনন্য-প্রোব-নির্বাচন ④ অ্যাঙ্করড-চেক-প্রথা:
#         '/admin/super/users-support' ⑤ eval-JSON-এস্কেপ-গ্রেপ (session267/271-গোটচা): tr -d '"\\' + grep -qF
#         ⑥ KeyboardEvent-cancelable:true (session271-গোটচা) ⑦ নেমস্পেস: .su273- প্রিফিক্স (view+css — .su-*
#         admin.css-এ-ব্যস্ত: su-avatar/su-logout/su-meta/su-name/su-role — সংঘর্ষ-FATAL-গার্ড প্যাচে)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s273-su-page.html
J=/tmp/s273-su-jar.txt
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/super/users-support"; }
kwlist(){ grep -oE 'data-kw="[^"]*"' "$PAGE"; }

echo "── ধাপ-০: পরিবেশ (প্রোব → superadmin-লগইন → রিড-ওনলি-সারফেস-পূর্বগণনা) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "superadmin-লগইন admin/admin123 ($LC)"; else bad "superadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi

PC=$(fetch_page)
if [ "$PC" = "200" ]; then ok "ইউজার-সাপোর্ট-পৃষ্ঠা 200"; else bad "পৃষ্ঠা HTTP $PC"; fi
ROWS=$(grep -o 'data-su-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
DS=$(grep -o 'data-search="' "$PAGE" | wc -l)
UNIVN=$(kwlist | grep -c 'ইউজার user' || true)
STATN=$(kwlist | grep -c 'স্ট্যাটাস status' || true)
ROLN=$(kwlist | grep -c 'মডারেটর moderator' || true)
ACTN=$(kwlist | grep -c 'স্ট্যাটাস status সক্রিয় active' || true)
MAXID=$(grep -o 'data-su-row="[0-9]*"' "$PAGE" | grep -o '[0-9]*' | sort -n | tail -1)
IDP=''
for i in $(seq "$MAXID" -1 1); do
  if [ "$(kwlist | grep -cF "#$i" || true)" = "1" ]; then IDP="#$i"; break; fi
done
if [ "$ROWS" -ge 1 ]; then ok "সুপার-ইউজার-সারফেস প্রস্তুত ($ROWS সারি — রিড-ওনলি)"; else bad "সারফেস-খালি/ব্যর্থ (rows=$ROWS)"; fi
if [ "$KW" = "$ROWS" ] && [ "$DS" = "$ROWS" ]; then ok "সারফেস-সমতুল্য kw+search কভারেজ ($ROWS/$KW/$DS)"; else bad "কভারেজ-বেমান (row=$ROWS kw=$KW ds=$DS)"; fi
if [ "$UNIVN" = "$ROWS" ] && [ "$STATN" = "$ROWS" ]; then ok "সর্বজনীন-অ্যালায়াস 'ইউজার user'+'স্ট্যাটাস status' ($UNIVN/$STATN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN stat=$STATN rows=$ROWS)"; fi
if [ -n "$IDP" ]; then ok "bare-id একক-প্রোব নির্বাচিত ($IDP — max=$MAXID থেকে নিম্নগামী)"; else bad "id-প্রোব-নির্বাচন ব্যর্থ"; fi
if [ "$ROLN" -ge 1 ]; then ok "রোল-প্রোব প্রস্তুত ('মডারেটর moderator' → $ROLN)"; else skip "রোল-প্রোব-ডেটা-শূন্য (মডারেটর-বিহীন DB)"; fi

echo "── ধাপ-১: কাঠামো (su273 স্ট্রিপ — no-regression) ──"
containsF "ফিল্টার-স্ট্রিপ (su273-instant)" "$(cat "$PAGE")" 'id="suInstant273"'
containsF "ফিল্টার-ইনপুট (suFilter273)" "$(cat "$PAGE")" 'id="suFilter273"'
containsF "ক্লিয়ার-বাটন (suClear273 — hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="suClear273" class="su273-clear" aria-label="ফিল্টার মুছুন" hidden'
containsF "কাউন্ট-চিপ (suCount273 — hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="suCount273" hidden'
containsF "kbd-hint (f-ফোকাস · Esc)" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "শূন্য-অবস্থা (suZero273 — data-su-empty)" "$(cat "$PAGE")" 'id="suZero273" data-su-empty hidden'
containsF "__suQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__suQA'
containsF "no-regression: us-searchbar ফর্ম অক্ষুণ্ণ" "$(cat "$PAGE")" 'class="us-searchbar" method="GET"'
containsF "no-regression: input[name=q] অক্ষুণ্ণ" "$(cat "$PAGE")" 'id="usSearch" name="q"'
containsF "no-regression: us-chips অক্ষুণ্ণ" "$(cat "$PAGE")" 'class="us-chips"'
containsF "no-regression: us-table অক্ষুণ্ণ" "$(cat "$PAGE")" 'class="us-table"'
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
contains "no-regression: us-note (নিরাপত্তা-নোট)" "$(cat "$PAGE")" 'us-note'
contains "no-regression: ব্যবহারকারী তালিকা হেডার" "$(cat "$PAGE")" 'ইউজার তথ্য ও পাসওয়ার্ড সাপোর্ট'
SRC=$(cat "$APP/admin/views/admin/super/users.ejs")
containsF "সোর্স: us-empty ব্রাঞ্চ অক্ষুণ্ণ (EJS-শাখা)" "$SRC" 'class="us-empty"'
containsF "সোর্স: 300-hint ব্রাঞ্চ অক্ষুণ্ণ" "$SRC" 'users.length >= 300'
containsF "সোর্স: forEach((u, suI273)) সূচক-যুক্ত" "$SRC" 'users.forEach((u, suI273) => {'
containsF "সোর্স: বিদ্যমান applyFilter-অক্ষুণ্ণ (দ্বৈত-ডাইমেনশন)" "$SRC" 'function applyFilter()'

echo "── ধাপ-২: স্টাইল (su273 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session273 — su273 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/super/users.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "color-mix ফোকাস-রিং" "$CSSBLK" 'color-mix(in srgb, var(--lf-brandgreen) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (chip — সঠিক-বাইট)" "$CSSBLK" '.su273-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-২ (zero — সঠিক-বাইট)" "$CSSBLK" '.su273-zero[hidden] { display: none; }'
containsF "hidden-গার্ড-৩ (tr — সঠিক-বাইট !important)" "$CSSBLK" 'tr[data-su-row][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/super/users-support" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/super/users-support'; then
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/super/users-support" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে সুপার-ইউজার-পৃষ্ঠা খোলা" "$(agent-browser get url 2>/dev/null)" 'admin/super/users-support'
contains "__suQA সংজ্ঞায়িত" "$(ev 'typeof window.__suQA')" 'object'
T=$(ev 'window.__suQA.total()' | tr -d '"')
C=$(ev 'window.__suQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
agent-browser fill '#suFilter273' "$IDP" >/dev/null 2>&1; sleep 0.4
C1=$(ev 'window.__suQA.count()' | tr -d '"')
if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "bare-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
if [ "$ROLN" -ge 1 ]; then
  agent-browser fill '#suFilter273' 'মডারেটর moderator' >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__suQA.count()' | tr -d '"')
  if [ -n "$C2" ] && [ "$C2" = "$ROLN" ]; then ok "রোল-প্রোব → পূর্বগণনা-মিল ($C2/$T)"; else bad "রোল-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$ROLN)"; fi
else
  skip "রোল-প্রোব-বাদ (DB-শূন্য)"
fi
agent-browser fill '#suFilter273' 'সক্রিয় active' >/dev/null 2>&1; sleep 0.4
C3=$(ev 'window.__suQA.count()' | tr -d '"')
if [ -n "$C3" ] && [ "$C3" = "$ACTN" ]; then ok "স্ট্যাটাস-প্রোব → পূর্বগণনা-মিল ($C3/$T)"; else bad "স্ট্যাটাস-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$ACTN)"; fi
agent-browser fill '#suFilter273' 'ইউজার user' >/dev/null 2>&1; sleep 0.4
C4=$(ev 'window.__suQA.count()' | tr -d '"')
CHIPV=$(ev 'document.getElementById("suCount273").textContent' | tr -d '"')
if [ -n "$C4" ] && [ "$C4" = "$ROWS" ] && echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "সর্বজনীন-প্রোব ব্যর্থ (got=$C4 chip=$CHIPV)"; fi
CHIPS=$(ev 'document.getElementById("suCount273").hidden' | tr -d '"')
if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
agent-browser fill '#suFilter273' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C5z=$(ev 'window.__suQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-su-empty]").hidden' | tr -d '"')
if [ "$C5z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C5z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-su-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
ev 'window.__suQA.clear()' >/dev/null 2>&1; sleep 0.3
C6=$(ev 'window.__suQA.count()' | tr -d '"')
if [ "$C6" = "$T" ]; then ok "__suQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C6)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("suCount273")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "suFilter273" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("input[name=q]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));document.activeElement.id' | tr -d '"')
if [ "$FG" = "usSearch" ]; then ok "ফিল্ড-গার্ড: usSearch-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("suFilter273").value="probe273";document.getElementById("suFilter273").dispatchEvent(new Event("input"));document.getElementById("suFilter273").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("suFilter273").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "suFilter273" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
contains "দ্বৈত-ডাইমেনশন: su273-clear-পরে সারফেস-পুরো-দৃশ্যমান" "$(ev 'window.__suQA.count()' | tr -d '"')" "$T"
ev 'var s=document.getElementById("usSearch");s.value="testuser";s.dispatchEvent(new Event("input"))' >/dev/null 2>&1; sleep 0.3
UC=$(ev 'document.getElementById("usCount").textContent' | tr -d '"')
SUC=$(ev 'window.__suQA.count()' | tr -d '"')
if echo "$UC" | grep -q 'জন' && [ "$SUC" = "$T" ]; then ok "সহ-অস্তিত্ব: us-সার্চ-ফিল্টার-কার্যকর ($UC) + su273-অপ্রভাবিত ($SUC)"; else bad "সহ-অস্তিত্ব ব্যর্থ (usCount=$UC su=$SUC)"; fi
ev 'var s=document.getElementById("usSearch");s.value="";s.dispatchEvent(new Event("input"))' >/dev/null 2>&1; sleep 0.3

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s273-sufilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s273-sufilter-desk.png" ]; then ok "s273-sufilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s273-sufilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s273-sufilter-mobile390.png" ]; then ok "s273-sufilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: নেট-DB-রাইট-শূন্য (রিড-ওনলি — s270-চুক্তি) ──"
PC2=$(fetch_page)
ROWS2=$(grep -o 'data-su-row="[0-9]*"' "$PAGE" | wc -l)
if [ "$PC2" = "200" ] && [ "$ROWS2" = "$ROWS" ]; then ok "রেন্ডার্ড-পাংক্তি PRE == FINAL ($ROWS → $ROWS2)"; else bad "নেট-রাইট-প্রমাণ ব্যর্থ (PRE=$ROWS FINAL=$ROWS2 HTTP=$PC2)"; fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
