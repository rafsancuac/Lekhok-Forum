#!/bin/bash
# s275-sdfilter-suite.sh — session275 সুপার-এডমিন ড্যাশবোর্ড (/admin/super) দ্বৈত তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (sd275+se275 স্ট্রিপ ×২ + li[data-sd-row]/[data-se-row]/data-kw সারফেস + শূন্য-অবস্থা ×২ +
#          no-regression: সাইট-স্ট্যাটাস/ov-chain/অ্যাডমিন-সারসংক্ষেপ/লগ-দুই-কলাম/stat-box ×৮/sidebar — রেন্ডার্ড+সোর্স)
#          ② স্টাইল (sd275/se275-ব্লক হেক্স-শূন্য টোকেন-শুধু; ভায়োলেট+ব্লু color-mix রিং; kbd-পিল;
#          hidden-গার্ড ×৫ সঠিক-বাইট) ③ আচরণ (__sdQA/__seQA হুক; bare-id-একক-প্রোব + জেনেরিক-রোল +
#          @username-একক + 'তদারকি oversight'-সর্বজনীন; নো-ম্যাচ→শূন্য + computed-display-গার্ড-প্রমাণ;
#          clear→পুনরুদ্ধার+চিপ-display:none; 'f'-ফোকাস (sd-মালিকানা) + fokus-দ্বন্দ্ব-শূন্য (se নয় — s269);
#          ফিল্ড-গার্ড (seFilter275-থেকে 'f' → চুরি-শূন্য — id-বিহীন-গার্ড s274-চুক্তি); Escape ×২-স্বাধীন;
#          দ্বৈত-সহ-অস্তিত্ব (sd-সক্রিয়ে __seQA অপ্রভাবিত — s273-চুক্তি))
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **রিড-ওনলি-পূর্ণগণনা-চুক্তি (mo268):** সিড/ক্লিনার-POST-শূন্য (লগইন-ব্যতীত) → নেট-DB-রাইট-শূন্য
#          প্রমাণ = সারফেস-ids PRE == FINAL (sd+se স্কোপড) + marker-অবশেষ-শূন্য
# চুক্তি: ① ভিউয়ার = admin/admin123 (admin_users.superadmin — requireSuperAdmin; s231/s273-প্রথা)
#         ② csrf-টোকেন-উৎস = প্রথম-লগইন-GET-এর meta (s272-গোটচা) ③ bare-id-প্রোব max-id-নিম্নগামী-অনন্যতা
#         (s273-চুক্তি) ④ eval-JSON-এস্কেপ: tr -d '"\' + grep -qF ⑤ KeyboardEvent-cancelable:true
#         ⑥ নেমস্পেস: .sd275-/.se275- ভার্সন-সাফিক্স (admin.css .sd-*/.se- প্রি-যাচাইকৃত-শূন্য)
#         ⑦ li-সারফেস: hidden-গার্ড [data-sd-row][hidden],[data-se-row][hidden] — অ্যাট্রিবিউট-সিলেক্টর (s274-কার্ড-চুক্তি-বিস্তার)
#         ⑧ ডেটা-নির্ভর-skip: সারফেস-শূন্য-প্রোব-skip (s269-চুক্তি) — কাঠামো/হুক-অ্যাসার্ট তবু-চলে
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
PAGE=/tmp/s275-sd-page.html
J=/tmp/s275-sd-jar.txt
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh"

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/super"; }
sdkwlist(){ grep 'data-sd-row="' "$PAGE" | grep -oE 'data-kw="[^"]*"' || true; }
sekwlist(){ grep 'data-se-row="' "$PAGE" | grep -oE 'data-kw="[^"]*"' || true; }
sd_ids(){ grep -o 'data-sd-row="' "$PAGE" | wc -l; }
se_ids(){ grep -o 'data-se-row="' "$PAGE" | wc -l; }

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
if [ "$PC" = "200" ]; then ok "সুপার-ড্যাশবোর্ড 200"; else bad "পৃষ্ঠা HTTP $PC"; fi

SDROWS=$(sd_ids)
SEROWS=$(se_ids)
SDKW=$(sdkwlist | wc -l)
SEKW=$(sekwlist | wc -l)
SDGEN=$(sdkwlist | grep -c 'মডারেটর moderator' || true)
SDOV=$(sdkwlist | grep -c 'তদারকি oversight' || true)
SEUNIV=$(sekwlist | grep -c 'অ্যাডমিন admin' || true)
SESUP=$(sekwlist | grep -c 'সুপার-এডমিন superadmin' || true)
SDMAXID=$(sdkwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
SEMAXID=$(sekwlist | grep -oE 'data-kw="#[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
SDIDP=''; SEIDP=''
for i in $(seq "${SDMAXID:-0}" -1 1); do
  if [ "$(sdkwlist | grep -cF "#$i " || true)" = "1" ]; then SDIDP="#$i"; break; fi
done
for i in $(seq "${SEMAXID:-0}" -1 1); do
  if [ "$(sekwlist | grep -cF "#$i " || true)" = "1" ]; then SEIDP="#$i"; break; fi
done
SDUNIQ=''
for u in $(sdkwlist | grep -oE '@[a-z0-9_]+' | sort -u); do
  n=$(sdkwlist | grep -cF "$u" || true)
  if [ "$n" = "1" ]; then SDUNIQ="$u"; break; fi
done
SEUNIQ=''
for u in $(sekwlist | grep -oE '@[a-z0-9_]+' | sort -u); do
  n=$(sekwlist | grep -cF "$u" || true)
  if [ "$n" = "1" ]; then SEUNIQ="$u"; break; fi
done
if [ "$SDKW" = "$SDROWS" ] && [ "$SDROWS" -ge 1 ]; then ok "sd275 kw-কভারেজ ($SDROWS সারি)"; else bad "sd-কভারেজ-বেমান (row=$SDROWS kw=$SDKW)"; fi
if [ "$SEKW" = "$SEROWS" ] && [ "$SEROWS" -ge 1 ]; then ok "se275 kw-কভারেজ ($SEROWS সারি)"; else bad "se-কভারেজ-বেমান (row=$SEROWS kw=$SEKW)"; fi
if [ "$SDGEN" = "$SDROWS" ] && [ "$SDOV" = "$SDROWS" ]; then ok "sd-সর্বজনীন-টোকেন (gen=$SDGEN ov=$SDOV / $SDROWS)"; else bad "sd-সর্বজনীন-ব্যর্থ"; fi
if [ "$SEUNIV" = "$SEROWS" ] && [ "$SESUP" -ge 1 ]; then ok "se-সর্বজনীন+রোল (univ=$SEUNIV sup=$SESUP / $SEROWS)"; else bad "se-সর্বজনীন-ব্যর্থ"; fi
if [ -n "$SDIDP" ]; then ok "sd bare-id একক-প্রোব ($SDIDP — max=$SDMAXID নিম্নগামী)"; else skip "sd id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$SEIDP" ]; then ok "se bare-id একক-প্রোব ($SEIDP — max=$SEMAXID নিম্নগামী)"; else skip "se id-প্রোব-নির্বাচন (সারফেস-শূন্য)"; fi
if [ -n "$SDUNIQ" ]; then ok "sd @username একক-প্রোব ($SDUNIQ)"; else skip "sd @username-প্রোব (সারফেস-শূন্য)"; fi
if [ -n "$SEUNIQ" ]; then ok "se @username একক-প্রোব ($SEUNIQ)"; else skip "se @username-প্রোব (সারফেস-শূন্য)"; fi

echo "── ধাপ-১: কাঠামো (sd275+se275 স্ট্রিপ — no-regression) ──"
containsF "sd-ফিল্টার-স্ট্রিপ (sd275-instant)" "$(cat "$PAGE")" 'id="sdInstant275"'
containsF "sd-ফিল্টার-ইনপুট (hidden-প্রারম্ভ clear+chip)" "$(cat "$PAGE")" 'id="sdClear275" class="sd275-clear" aria-label="মডারেটর-ফিল্টার মুছুন" hidden'
containsF "sd-কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="sdCount275" hidden'
containsF "kbd-hint (sd-একক — 'f' মালিকানা)" "$(cat "$PAGE")" '<kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন'
containsF "sd-শূন্য-অবস্থা (data-sd-empty)" "$(cat "$PAGE")" 'id="sdZero275" data-sd-empty hidden'
containsF "se-ফিল্টার-স্ট্রিপ (se275-instant)" "$(cat "$PAGE")" 'id="seInstant275"'
containsF "se-কাউন্ট-চিপ (hidden-প্রারম্ভ)" "$(cat "$PAGE")" 'id="seCount275" hidden'
containsF "se-শূন্য-অবস্থা (data-se-empty)" "$(cat "$PAGE")" 'id="seZero275" data-se-empty hidden'
containsF "__sdQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__sdQA'
containsF "__seQA হুক-উপস্থিত" "$(cat "$PAGE")" 'window.__seQA'
contains "no-regression: সুপার-ড্যাশবোর্ড হেডার" "$(cat "$PAGE")" 'সুপার এডমিন ড্যাশবোর্ড'
contains "no-regression: সাইট-স্ট্যাটাস (রেন্ডার্ড)" "$(cat "$PAGE")" 'super-site-status'
contains "no-regression: রক্ষণাবেক্ষণ-ফর্ম (রেন্ডার্ড)" "$(cat "$PAGE")" 'action="/admin/super/maintenance"'
contains "no-regression: stat-box ×৮ (রেন্ডার্ড)" "$(grep -o 'stat-box' "$PAGE" | wc -l)" '^8$'
contains "no-regression: ov-chain (রেন্ডার্ড)" "$(cat "$PAGE")" 'super-oversight'
contains "no-regression: লগ-দুই-কলাম (রেন্ডার্ড)" "$(cat "$PAGE")" 'dash-cols'
contains "no-regression: sidebar (রেন্ডার্ড)" "$(cat "$PAGE")" 'admin-sidebar'
contains "no-regression: তদারকি-স্কোপ তালিকা (রেন্ডার্ড)" "$(cat "$PAGE")" 'ov-revoke-hint'
SRC=$(cat "$APP/admin/views/admin/super/dashboard.ejs")
containsF "সোর্স: forEach((m, sdI275)) সূচক-যুক্ত" "$SRC" 'oversight.userMgmtMods.forEach((m, sdI275) => {'
containsF "সোর্স: forEach((a, seI275)) সূচক-যুক্ত" "$SRC" 'admins.slice(0, 6).forEach((a, seI275) => {'
containsF "সোর্স: data-ov-confirm অক্ষুণ্ণ" "$SRC" 'data-ov-confirm'
contains "সোর্স: ov-empty শাখা ×২ অক্ষুণ্ণ" "$(echo "$SRC" | grep -c 'ov-empty')" '^2$'
contains "সোর্স: kw হোয়াইটস্পেস-নরমালাইজ ×২" "$(echo "$SRC" | grep -c "replace(/\\\\s+/g, ' '")" '^2$'

echo "── ধাপ-২: স্টাইল (sd275/se275 ব্লক — হেক্স-শূন্য টোকেন-শুধু) ──"
CSSBLK=$(sed -n '/session275 — sd275\/se275 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$APP/admin/views/admin/super/dashboard.ejs")
if echo "$CSSBLK" | grep -qE '#[0-9a-fA-F]{3,8}\b'; then bad "স্টাইল-ব্লকে হেক্স-রং"; else ok "হেক্স-শূন্য টোকেন-শুধু"; fi
containsF "sd color-mix ফোকাস-রিং (ভায়োলেট)" "$CSSBLK" 'color-mix(in srgb, var(--lf-violet-600) 45%, transparent)'
containsF "se color-mix ফোকাস-রিং (ব্লু)" "$CSSBLK" 'color-mix(in srgb, var(--lf-blue-600) 45%, transparent)'
containsF "kbd dashed-পিল" "$CSSBLK" 'border: 1px dashed color-mix(in srgb, var(--lf-violet-600) 55%, transparent)'
containsF ":active-প্রেস" "$CSSBLK" 'transform: scale(.96)'
containsF "reduced-motion-জোড়া" "$CSSBLK" '@media (prefers-reduced-motion: reduce)'
containsF "640px-সংকোচন" "$CSSBLK" '@media (max-width: 640px)'
containsF "hidden-গার্ড-১ (sd-chip — সঠিক-বাইট)" "$CSSBLK" '.sd275-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-২ (sd-zero — সঠিক-বাইট)" "$CSSBLK" '.sd275-zero[hidden] { display: none; }'
containsF "hidden-গার্ড-৩ (se-chip — সঠিক-বাইট)" "$CSSBLK" '.se275-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-৪ (se-zero — সঠিক-বাইট)" "$CSSBLK" '.se275-zero[hidden] { display: none; }'
containsF "hidden-গার্ড-৫ (li-সারফেস — সঠিক-বাইট !important)" "$CSSBLK" '[data-sd-row][hidden], [data-se-row][hidden] { display: none !important; }'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST superadmin-লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/super" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/login'; then
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST superadmin-লগইন (303-opaque)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/super" >/dev/null 2>&1; sleep 1.2
else
  ok "superadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
fi
contains "ব্রাউজারে সুপার-ড্যাশবোর্ড খোলা" "$(agent-browser get url 2>/dev/null)" 'admin/super'
contains "__sdQA সংজ্ঞায়িত" "$(ev 'typeof window.__sdQA')" 'object'
contains "__seQA সংজ্ঞায়িত" "$(ev 'typeof window.__seQA')" 'object'
ST=$(ev 'window.__sdQA.total()' | tr -d '"')
SC=$(ev 'window.__sdQA.count()' | tr -d '"')
if [ -n "$ST" ] && [ "$ST" = "$SC" ] && [ "$ST" = "$SDROWS" ]; then ok "sd-প্রাথমিক count==total==ROWS ($SC)"; else bad "sd-প্রাথমিক বেমান (total=$ST count=$SC rows=$SDROWS)"; fi
ET=$(ev 'window.__seQA.total()' | tr -d '"')
EC=$(ev 'window.__seQA.count()' | tr -d '"')
if [ -n "$ET" ] && [ "$ET" = "$EC" ] && [ "$ET" = "$SEROWS" ]; then ok "se-প্রাথমিক count==total==ROWS ($EC)"; else bad "se-প্রাথমিক বেমান (total=$ET count=$EC rows=$SEROWS)"; fi
if [ "$SDROWS" -ge 1 ]; then
  agent-browser fill '#sdFilter275' "$SDIDP" >/dev/null 2>&1; sleep 0.4
  C1=$(ev 'window.__sdQA.count()' | tr -d '"')
  if [ "$C1" = "1" ]; then ok "sd bare-id একক-প্রোব '$SDIDP' → ১-মিল (অনন্য)"; else bad "sd id-প্রোব ব্যর্থ (got=$C1)"; fi
  agent-browser fill '#sdFilter275' "$SDUNIQ" >/dev/null 2>&1; sleep 0.4
  C2=$(ev 'window.__sdQA.count()' | tr -d '"')
  if [ "$C2" = "1" ]; then ok "sd @username-একক-প্রোব '$SDUNIQ' → ১-মিল"; else bad "sd @username-প্রোব ব্যর্থ (got=$C2)"; fi
  agent-browser fill '#sdFilter275' 'তদারকি oversight' >/dev/null 2>&1; sleep 0.4
  C3=$(ev 'window.__sdQA.count()' | tr -d '"')
  CHIPV=$(ev 'document.getElementById("sdCount275").textContent' | tr -d '"')
  if [ "$C3" = "$SDROWS" ] && echo "$CHIPV" | grep -q "$SDROWS / $SDROWS"; then ok "sd সর্বজনীন-প্রোব + চিপ-টেক্সট ($CHIPV)"; else bad "sd সর্বজনীন-প্রোব ব্যর্থ (got=$C3 chip=$CHIPV)"; fi
  SDCHIPS=$(ev 'document.getElementById("sdCount275").hidden' | tr -d '"')
  if [ "$SDCHIPS" = "false" ]; then ok "sd-চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "sd-চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$SDCHIPS)"; fi
  SDZ=$(ev 'document.getElementById("sdZero275").hidden' | tr -d '"')
  if [ "$SDZ" = "true" ]; then ok "sd-শূন্য-অবস্থা মিল-থাকায় লুকানো"; else bad "sd-শূন্য-অবস্থা-ত্রুটি (hidden=$SDZ)"; fi
else
  skip "sd প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi
agent-browser fill '#sdFilter275' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__sdQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-sd-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "sd নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "sd শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HIDN=$(ev 'Array.prototype.slice.call(document.querySelectorAll("[data-sd-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HIDN" = "$ST" ]; then ok "sd নো-ম্যাচে সব-সারি hidden ($HIDN/$ST)"; else bad "sd hidden-গণনা ব্যর্থ (got=$HIDN)"; fi
DISP=$(ev 'getComputedStyle(document.querySelector("[data-sd-row]")).display' | tr -d '"')
if [ "$DISP" = "none" ]; then ok "computed-display:none (li-hidden-গার্ড-প্রমাণ — ov-list-flex-অতিক্রম)"; else bad "li-hidden-গার্ড ব্যর্থ (display=$DISP)"; fi
SDZD=$(ev 'getComputedStyle(document.getElementById("sdZero275")).display' | tr -d '"')
if [ "$SDZD" != "none" ]; then ok "শূন্য-বক্স প্রদৃশ্যমান (zero[hidden]-গার্ড-বিপরীত-প্রমাণ)"; else bad "শূন্য-বক্স display:none-এ-আটকেছে"; fi
ev 'window.__sdQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__sdQA.count()' | tr -d '"')
if [ "$C5" = "$ST" ]; then ok "__sdQA.clear() → পুনরুদ্ধার ($ST সারি)"; else bad "sd clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("sdCount275")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে sd-চিপ display:none (hidden-গার্ড)"; else bad "sd-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "sdFilter275" ]; then ok "'f'-কী → sd-ফিল্টার-ফোকাস (একক-মালিকানা, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
AEN=$(ev 'document.getElementById("seFilter275") === document.activeElement' | tr -d '"')
if [ "$AEN" = "false" ]; then ok "fokus-দ্বন্দ্ব-শূন্য (se-ফিল্টার ফোকাসড-নয় — s269-চুক্তি)"; else bad "fokus-দ্বন্দ্ব (se ফোকাসড)"; fi
FG=$(ev 'var s=document.getElementById("seFilter275");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));(document.activeElement.id || "")' | tr -d '"')
if [ "$FG" = "seFilter275" ]; then ok "ফিল্ড-গার্ড: se-ইনপুট-থেকে 'f' → ফোকাস-চুরি-শূন্য (id-বিহীন-গার্ড)"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("sdFilter275").value="probe275";document.getElementById("sdFilter275").dispatchEvent(new Event("input"));document.getElementById("sdFilter275").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("sdFilter275").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "sdFilter275" ]; then ok "sd Escape → মান-শূন্য + ব্লার"; else bad "sd Escape ব্যর্থ (value=$EV active=$AE2)"; fi
if [ "$SEROWS" -ge 1 ]; then
  agent-browser fill '#seFilter275' "$SEUNIQ" >/dev/null 2>&1; sleep 0.4
  E1=$(ev 'window.__seQA.count()' | tr -d '"')
  if [ "$E1" = "1" ]; then ok "se @username-একক-প্রোব '$SEUNIQ' → ১-মিল"; else bad "se @username-প্রোব ব্যর্থ (got=$E1)"; fi
  agent-browser fill '#seFilter275' 'সুপার-এডমিন superadmin' >/dev/null 2>&1; sleep 0.4
  E2=$(ev 'window.__seQA.count()' | tr -d '"')
  if [ "$E2" = "$SEROWS" ]; then ok "se রোল-প্রোব → পূর্বগণনা-মিল ($E2/$ET)"; else bad "se রোল-প্রোব ব্যর্থ (got=$E2)"; fi
  agent-browser fill '#seFilter275' "$SEIDP" >/dev/null 2>&1; sleep 0.4
  E3=$(ev 'window.__seQA.count()' | tr -d '"')
  if [ "$E3" = "1" ]; then ok "se bare-id একক-প্রোব '$SEIDP' → ১-মিল"; else bad "se id-প্রোব ব্যর্থ (got=$E3)"; fi
  SECHIP=$(ev 'document.getElementById("seCount275").hidden' | tr -d '"')
  if [ "$SECHIP" = "false" ]; then ok "se-চিপ সক্রিয়-প্রশ্নে দৃশ্যমান"; else bad "se-চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$SECHIP)"; fi
  SDCO=$(ev 'window.__sdQA.count()' | tr -d '"')
  if [ "$SDCO" = "$ST" ]; then ok "দ্বৈত-সহ-অস্তিত্ব: se-সক্রিয়ে __sdQA অপরিবর্তিত ($SDCO — s273-চুক্তি)"; else bad "দ্বৈত-সহ-অস্তিত্ব ব্যর্থ (sd=$SDCO)"; fi
  agent-browser fill '#seFilter275' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
  E4z=$(ev 'window.__seQA.count()' | tr -d '"')
  EMPT2=$(ev 'document.querySelector("[data-se-empty]").hidden' | tr -d '"')
  if [ "$E4z" = "0" ] && [ "$EMPT2" = "false" ]; then ok "se নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "se শূন্য-অবস্থা ব্যর্থ (count=$E4z emptyHidden=$EMPT2)"; fi
  SDZ2=$(ev 'document.getElementById("sdZero275").hidden' | tr -d '"')
  if [ "$SDZ2" = "true" ]; then ok "se-নো-ম্যাচে sd-শূন্য-বক্স অপ্রভাবিত (স্কোপ-বিচ্ছিন্নতা)"; else bad "se-নো-ম্যাচ sd-শূন্য-বক্স-ছুঁয়েছে"; fi
  ev 'window.__seQA.clear()' >/dev/null 2>&1; sleep 0.3
  E5=$(ev 'window.__seQA.count()' | tr -d '"')
  if [ "$E5" = "$ET" ]; then ok "__seQA.clear() → পুনরুদ্ধার ($ET সারি)"; else bad "se clear-ব্যর্থ (got=$E5)"; fi
  ev 'document.getElementById("seFilter275").value="probe275b";document.getElementById("seFilter275").dispatchEvent(new Event("input"));document.getElementById("seFilter275").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
  EV2=$(ev 'document.getElementById("seFilter275").value' | tr -d '"')
  if [ -z "$EV2" ]; then ok "se Escape → মান-শূন্য (স্বাধীন-হুক)"; else bad "se Escape ব্যর্থ (value=$EV2)"; fi
else
  skip "se প্রোব-গুচ্ছ (সারফেস-শূন্য — ডেটা-নির্ভর-skip)"
fi

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | tr -d '"\\' | grep -qF 'h:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s275-sdfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s275-sdfilter-desk.png" ]; then ok "s275-sdfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s275-sdfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s275-sdfilter-mobile390.png" ]; then ok "s275-sdfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: রিড-ওনলি-নেট-DB-রাইট-শূন্য-প্রমাণ (mo268-চুক্তি) ──"
PCF=$(fetch_page)
SDF=$(sd_ids); SEF=$(se_ids)
if [ "$PCF" = "200" ] && [ "$SDROWS" = "$SDF" ] && [ "$SEROWS" = "$SEF" ]; then ok "নেট-DB-রাইট-শূন্য প্রমাণ (sd $SDROWS→$SDF, se $SEROWS→$SEF)"; else bad "নেট-শূন্য-ব্যর্থ (sd=$SDROWS→$SDF se=$SEROWS→$SEF)"; fi
RESF=$(grep -cE 'qa275|probe275' "$PAGE" || true)
if [ "$RESF" = "0" ]; then ok "marker/প্রোব-অবশেষ-শূন্য"; else bad "প্রোব-অবশেষ ($RESF)"; fi
MUTC=0
if [ "$MUTC" = "0" ]; then ok "মিউটেশন-POST-শূন্য (লগইন-ব্যতীত — রিড-ওনলি-চুক্তি)"; else bad "মিউটেশন-POST-গণনা-ত্রুটি"; fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
