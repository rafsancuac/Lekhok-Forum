#!/bin/bash
# s294-cejump-suite.sh — session294 কনটেন্ট-সম্পাদক (/admin/content) তাৎক্ষণিক-জাম্প cej294 সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (cej-স্ট্রিপ + ম্যাচ-লিস্ট + শূন্য-অবস্থা + no-regression: contentForm/showPage/ce-edit-btn/
#          ceSavebar/uploadImage/sidebar) ② স্টাইল (session294-ব্লক হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার;
#          color-mix ফোকাস-রিং; idden]-গার্ড বাইট-সঠিক; reduced-motion; 640px-সংকোচন) ③ আচরণ (__cej294QA হুক —
#          কীওয়ার্ড-মিল (লেবেল+মান+গ্রুপ+পেজ+হিন্ট) + সক্রিয়-হাইড + ম্যাচ-লিস্ট-টপ-৮ + ক্রস-পেজ-জাম্প (ট্যাব-অ্যাক্টিভেট +
#          ফ্ল্যাশ-রিং) + শূন্য-অবস্থা + clear + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-stopPropagation) ④ 390px-hScroll-শূন্য
#          + স্ক্রিনশট ×২
# চুক্তি: ① রিড-ওনলি-সারফেস — সিড/ক্লিন-শূন্য (POST-শূন্য — broadcast-ঝুঁকি-শূন্য) ② ভিউয়ার = admin/admin123
#          ③ প্রত্যাশা-গণনা = রেন্ডার্ড-HTML থেকে (class="ce-field ce-t- মার্কআপ-ইউনিক — CSS/JS-সিলেক্টর-ওভারকাউন্ট-নিরাপদ)
#          ④ টার্গেট-চেক = contentForm-মার্কার (লগইন-পেজে-অনুপস্থিত — session264-গোটচা-সমমান) ⑤ ইউনিক-লেবেল-জাম্প-
#          নির্ধারকতা (সর্ব-সারফেসে একক-উপস্থিতি-লেবেল → matches=[একক] → firstMatch-নিশ্চিত)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
poll(){
  local i r
  for i in $(seq 1 "${3:-20}"); do
    r=$(ev "$1" 2>/dev/null | tr -d '"\\')
    if echo "$r" | grep -qF -- "$2"; then return 0; fi
    sleep 0.5
  done
  echo "poll-final: $r"
  return 1
}
kill8094(){
  local pid i j
  for i in 1 2 3; do
    pid=$(lsof -t -i :8094 2>/dev/null | head -1)
    [ -z "$pid" ] && return 0
    kill "$pid" 2>/dev/null
    for j in $(seq 1 16); do
      lsof -t -i :8094 2>/dev/null | grep -q . || return 0
      sleep 0.5
    done
    kill -9 "$pid" 2>/dev/null
    sleep 1
  done
  return 0
}
. "$APP/tests/lib-qa-browser.sh"
J=/tmp/s294-cej-jar.txt
PAGE=/tmp/s294-cej-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/content"; }

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (content.ejs) ──"
V=$(cat "$APP/admin/views/admin/content.ejs")
containsF "ফিল্টার-স্ট্রিপ (id=cejStrip294)" "$V" '<div class="cej294-instant" id="cejStrip294">'
containsF "সার্চ-ইনপুট (Enter-জাম্প-প্লেসহোল্ডার)" "$V" 'id="cejJump294"'
containsF "ক্লিয়ার-বাটন" "$V" 'id="cejClear294"'
containsF "কাউন্ট-চিপ" "$V" 'id="cejCount294"'
containsF "ম্যাচ-লিস্ট-কনটেইনার (টপ-৮)" "$V" 'id="cejList294"'
containsF "শূন্য-অবস্থা-বক্স" "$V" 'id="cejZero294"'
containsF "wired-গার্ড" "$V" 'if (window.__cej294wired) return;'
containsF "QA-হুক __cej294QA" "$V" 'window.__cej294QA'
containsF "হুক: firstMatch (জাম্প-নির্ধারকতা)" "$V" 'firstMatch:'
containsF "হুক: pagesHit" "$V" 'pagesHit:'
containsF "মান-ইনজেকশন-নিরাপদ লিস্ট-রেন্ডার" "$V" 'var b = document.createElement('
containsF "Escape-পরিষ্কার (stopPropagation)" "$V" "if (ev.key === 'Escape') { ev.stopPropagation(); cejClear294(); }"
containsF "Enter-জাম্প" "$V" "if (ev.key === 'Enter') { ev.preventDefault(); cejJumpFirst294(); }"
containsF "'f'-ফোকাস-ফিল্ড-গার্ড" "$V" "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)"
containsF "বাংলা-কাউন্ট-টেক্সট (ফিল্ড·পেজ)" "$V" "bn294(last294.length) + ' ফিল্ড · '"
containsF "ক্রস-পেজ-জাম্প (ট্যাব-অ্যাক্টিভেট)" "$V" "if (tab && panel && !panel.classList.contains('active')) { tab.click(); }"
containsF "ফ্ল্যাশ-রিং" "$V" 'cej294-flash'
B294=$(echo "$V" | sed -n '/session294 — cej294 তাৎক্ষণিক-জাম্প স্টাইল/,/<\/style>/p')
if [ -n "$B294" ]; then
  ok "cej294-স্টাইল-ব্লক উপস্থিত"
  HEXN=$(echo "$B294" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "স্টাইল-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "স্টাইল-ব্লকে হেক্স $HEXN"; fi
  containsF "idden]-গার্ড (বাইট-সঠিক — ফিল্ড)" "$B294" '.ce-field[hidden] { display: none !important; }'
  containsF "idden]-গার্ড (বাইট-সঠিক — গ্রুপ)" "$B294" '.ce-group[hidden] { display: none !important; }'
  containsF "brandgreen-টোকেন-পরিবার" "$B294" 'var(--lf-brandgreen-deep)'
  containsF "color-mix-ফোকাস-রিং" "$B294" 'color-mix(in srgb, var(--lf-brandgreen-deep) 45%, transparent)'
  containsF "reduced-motion-গার্ড" "$B294" 'prefers-reduced-motion'
  containsF "640px-সংকোচন" "$B294" 'max-width: 640px'
else
  bad "cej294-স্টাইল-ব্লক অনুপস্থিত"
fi
# no-regression ×৯
containsF "no-reg: contentForm" "$V" 'id="contentForm"'
containsF "no-reg: ceActivePage" "$V" 'id="ceActivePage"'
containsF "no-reg: showPage (ট্যাব-সুইচিং)" "$V" 'function showPage'
containsF "no-reg: ce-edit-btn (সেকশন-সম্পাদনা)" "$V" 'ce-edit-btn'
containsF "no-reg: ceSavebar (স্টিকি-সেভ)" "$V" 'ceSavebar'
containsF "no-reg: ceDirtyCount" "$V" 'id="ceDirtyCount"'
containsF "no-reg: uploadImage" "$V" 'function uploadImage'
containsF "no-reg: sidebar" "$V" "include('partials/sidebar')"
containsF "no-reg: ce-group-status" "$V" 'ce-group-status'
# ক্রম-অ্যাসার্ট: স্ট্রিপ form-এর বাইরে (Enter-সাবমিট-নিরাপদ)
POS_S=$(echo "$V" | grep -bo 'cejStrip294' | head -1 | cut -d: -f1)
POS_F=$(echo "$V" | grep -bo 'id="contentForm"' | head -1 | cut -d: -f1)
if [ -n "$POS_S" ] && [ -n "$POS_F" ] && [ "$POS_S" -lt "$POS_F" ] 2>/dev/null; then ok "ক্রম: স্ট্রিপ form-এর বাইরে (Enter-সাবমিট-নিরাপদ)"; else bad "ক্রম-ভাঙা (স্ট্রিপ form-ভিতরে?)"; fi

echo "── ধাপ-২: লগইন → SSR (রিড-ওনলি — সিড-শূন্য) ──"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন (admin — s277-প্রমাণিত ভিউয়ার)"; else bad "লগইন-HTTP $LC"; fi
PC=$(fetch_page)
if [ "$PC" = "200" ] && grep -qF 'কনটেন্ট সম্পাদক' "$PAGE" && grep -qF 'cejStrip294' "$PAGE" && grep -qF 'contentForm' "$PAGE"; then ok "/admin/content 200 (স্ট্রিপ-সহ — contentForm-মার্কারে অ্যাঙ্করড)"; else bad "/admin/content HTTP $PC"; fi
if grep -qF '/admin/login' "$PAGE" && ! grep -qF 'contentForm' "$PAGE"; then bad "লগইন-পেজে-আটকে (session264-গোটচা)"; else ok "অ্যাঙ্করড-চেক: সত্যিক-সম্পাদক-পেজ (লগইন-পেজ-নয়)"; fi
# প্রত্যাশা-গণনা (রেন্ডার্ড-HTML — মার্কআপ-ইউনিক প্যাটার্ন; CSS/JS-সিলেক্টর-ওভারকাউন্ট-নিরাপদ)
TF=$(grep -o 'class="ce-field ce-t-' "$PAGE" | wc -l)
TP=$(grep -o 'class="ce-tab ' "$PAGE" | wc -l)
TG=$(grep -o 'class="ce-group is-locked"' "$PAGE" | wc -l)
if [ "$TF" -ge 100 ] 2>/dev/null; then ok "ফিল্ড-মোট=$TF (রেন্ডার্ড)"; else bad "ফিল্ড-মোট=$TF"; fi
if [ "$TP" -ge 5 ] 2>/dev/null; then ok "পেজ-ট্যাব=$TP (রেন্ডার্ড)"; else bad "পেজ-ট্যাব=$TP"; fi
if [ "$TG" -ge 10 ] 2>/dev/null; then ok "গ্রুপ=$TG (রেন্ডার্ড)"; else bad "গ্রুপ=$TG"; fi

echo "── ধাপ-৩: E2E (agent-browser — ইউনিক-কোয়েরি-open) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
Q1="qa294a=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
LR=$(ev '(function(){var c=document.querySelector("input[name=_csrf]");if(!c)return "ALR";return fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(c.value)}).then(function(r){return String(r.status)})})()' 2>/dev/null | tr -d '"')
if echo "$LR" | grep -qE '30[23]'; then ok "ব্রাউজার-লগইন ($LR)"; else
  if echo "$LR" | grep -qF 'ALR'; then ok "ব্রাউজার-সেশন পূর্ব-লগইনড (ALR — পারসিস্টেন্ট-প্রোফাইল)"; else bad "ব্রাউজার-লগইন ($LR)"; fi
fi
if agent-browser open "$BASE/admin/content?$Q1" >/dev/null 2>&1; then ok "open ($Q1 — ইউনিক-কোয়েরি)"; else bad "open-ব্যর্থ"; fi
if poll 'window.__cej294QA && ("F" + window.__cej294QA.fields() + "P" + window.__cej294QA.pages())' "F${TF}P${TP}"; then ok "বুট: হুক-জীবিত (F=$TF P=$TP — SSR-সমান)"; else bad "বুট-হুক"; fi
# E1: সক্রিয়-প্যানেল-লেবেল-কীওয়ার্ড → মিল + চিপ + লিস্ট-সারি + হাইড-গণনা
E1=$(ev '(function(){var q=window.__cej294QA;var i=document.getElementById("cejJump294");var lb=document.querySelector(".ce-panel.active .ce-label-row label");if(!lb)return "NOLB";i.value=lb.textContent.trim();i.dispatchEvent(new Event("input"));var hid=document.querySelectorAll(".ce-field[hidden]").length;var rows=document.querySelectorAll("#cejList294 .cej294-m").length;var exp=Math.min(q.matches(),8);return "M"+q.matches()+"HID"+hid+"ROWS"+rows+"EXP"+exp+"CH"+(document.getElementById("cejCount294").hidden?"0":"1")})()' 2>/dev/null | tr -d '"\\')
M1=$(echo "$E1" | sed -n 's/^M\([0-9]*\).*/\1/p')
if echo "$E1" | grep -qE '^M[0-9]+HID[0-9]+ROWS[0-9]+EXP[0-9]+CH1$'; then
  HID=$(echo "$E1" | sed -n 's/^M[0-9]*HID\([0-9]*\).*/\1/p')
  if [ "$((TF-M1))" = "$HID" ] 2>/dev/null && [ "$HID" -ge 1 ] 2>/dev/null; then ok "কীওয়ার্ড-মিল: M=$M1 হাইড=$HID (F-M=হাইড-নির্ধারক) + চিপ-দৃশ্যমান"; else bad "হাইড-গণনা ($E1 — F=$TF)"; fi
  ROWS=$(echo "$E1" | sed -n 's/^M[0-9]*HID[0-9]*ROWS\([0-9]*\)EXP\([0-9]*\).*/\1 \2/p' | cut -d' ' -f1)
  EXP=$(echo "$E1" | sed -n 's/^M[0-9]*HID[0-9]*ROWS\([0-9]*\)EXP\([0-9]*\).*/\1 \2/p' | cut -d' ' -f2)
  if [ "$ROWS" = "$EXP" ] 2>/dev/null; then ok "ম্যাচ-লিস্ট-সারি=$ROWS (টপ-৮-চুক্তি)"; else bad "লিস্ট-সারি ($E1)"; fi
else
  bad "কীওয়ার্ড-মিল ($E1)"
fi
# E2: clear → পুনরুদ্ধার
E2=$(ev '(function(){window.__cej294QA.clear();var q=window.__cej294QA;return "F"+q.fields()+"M"+q.matches()+"HID"+document.querySelectorAll(".ce-field[hidden]").length+"CH"+(document.getElementById("cejCount294").hidden?"0":"1")+"LS"+(document.getElementById("cejList294").hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
if echo "$E2" | grep -qF "M${TF}HID0CH0LS1"; then ok "clear → পূর্ণ-পুনরুদ্ধার (M=$TF হাইড=০) + চিপ/লিস্ট-লুকানো"; else bad "clear ($E2)"; fi
# E3: ইউনিক-লেবেল ক্রস-পেজ জাম্প (নির্ধারক — firstMatch-চুক্তি)
E3=$(ev '(function(){var q=window.__cej294QA;q.clear();var act=q.activePage();var seen={};Array.prototype.slice.call(document.querySelectorAll(".ce-panel .ce-label-row label")).forEach(function(l){var t=l.textContent.trim();seen[t]=(seen[t]||0)+1});var uniq=Array.prototype.slice.call(document.querySelectorAll(".ce-panel")).filter(function(p){return p.getAttribute("data-page")!==act}).map(function(p){return p.querySelector(".ce-label-row label").textContent.trim()}).filter(function(t){return seen[t]===1});if(!uniq.length){return "NOUNIQ"}var i=document.getElementById("cejJump294");i.value=uniq[0];i.dispatchEvent(new Event("input"));var fm=q.firstMatch();var j=q.jumpFirst();var to=q.activePage();var fl=document.querySelectorAll(".cej294-flash").length;return "M"+q.matches()+"FM"+(fm?fm.page:"-")+"J"+j+"TO"+to+"CROSS"+(to!==act?"1":"0")+"FL"+fl})()' 2>/dev/null | tr -d '"\\')
if echo "$E3" | grep -qE '^M[1-9][0-9]*FM[a-z0-9-]+J1TO[a-z0-9-]+' && echo "$E3" | grep -qF 'CROSS1FL'; then
  FM=$(echo "$E3" | sed -n 's/^M[0-9]*FM\([a-z0-9-]*\)J1TO\([a-z0-9-]*\).*/\1 \2/p' | cut -d' ' -f1)
  TO=$(echo "$E3" | sed -n 's/^M[0-9]*FM\([a-z0-9-]*\)J1TO\([a-z0-9-]*\).*/\1 \2/p' | cut -d' ' -f2)
  if [ "$FM" = "$TO" ] 2>/dev/null; then ok "ক্রস-পেজ-জাম্প: TO=$TO = firstMatch-পেজ + ফ্ল্যাশ-রিং-সক্রিয়"; else bad "জাম্প-গন্তব্য-অসঙ্গতি ($E3)"; fi
else
  bad "ক্রস-পেজ-জাম্প ($E3)"
fi
# E4: শূন্য-অবস্থা + বাংলা-চিপ
E4=$(ev '(function(){var q=window.__cej294QA;q.clear();var i=document.getElementById("cejJump294");i.value="zzz294-nomatch";i.dispatchEvent(new Event("input"));var ct=document.getElementById("cejCountTxt294").textContent;var r="M"+q.matches()+"Z"+(document.getElementById("cejZero294").hidden?"0":"1")+"CT:"+ct;q.clear();return r})()' 2>/dev/null | tr -d '"\\')
if echo "$E4" | grep -qF 'M0Z1CT:০ ফিল্ড · ০ পেজ'; then ok "শূন্য-অবস্থা + বাংলা-কাউন্ট-চিপ (০ ফিল্ড · ০ পেজ)"; else bad "শূন্য-অবস্থা ($E4)"; fi
# E5: Escape-পরিষ্কার (input-ফোকাসে)
E5=$(ev '(function(){var q=window.__cej294QA;var i=document.getElementById("cejJump294");i.focus();i.value="zzz294-no";i.dispatchEvent(new Event("input"));i.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "V:"+i.value+"M"+q.matches()+"HID"+document.querySelectorAll(".ce-field[hidden]").length})()' 2>/dev/null | tr -d '"\\')
if echo "$E5" | grep -qF "V:M${TF}HID0"; then ok "Escape → ইনপুট-পরিষ্কার + পুনরুদ্ধার ($TF)"; else bad "Escape ($E5)"; fi
# E6: 'f'-ফোকাস (বডি-থেকে)
E6=$(ev '(function(){document.body.focus();var e=new KeyboardEvent("keydown",{key:"f",bubbles:true});document.dispatchEvent(e);return "F"+(document.activeElement?document.activeElement.id:"-")})()' 2>/dev/null | tr -d '"\\')
if echo "$E6" | grep -qF 'FcejJump294'; then ok "'f'-ফোকাস → জাম্প-ইনপুট"; else bad "'f'-ফোকাস ($E6)"; fi
# E7: ফিল্ড-গার্ড (TEXTAREA-থেকে-'f' — স্পষ্ট-focus-পূর্বক; dispatch-ফোকাস-গোটচা-সচেতন)
E7=$(ev '(function(){var ta=document.querySelector(".ce-panel.active textarea");if(!ta)return "NOTA";ta.focus();ta.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));return "G"+(document.activeElement===ta?"TA":"STOLEN")})()' 2>/dev/null | tr -d '"\\')
if echo "$E7" | grep -qF 'GTA'; then ok "ফিল্ড-গার্ড: TEXTAREA-থেকে-'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ($E7)"; fi
# E8: ফ্রেশ-লোড (stale-গোটচা) → হুক-পুনঃপ্রতিষ্ঠা
Q2="qa294b=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/content?$Q2" >/dev/null 2>&1
if poll 'window.__cej294QA && ("F" + window.__cej294QA.fields())' "F${TF}"; then ok "ফ্রেশ-লোড হুক-পুনঃপ্রতিষ্ঠা (F=$TF)"; else bad "ফ্রেশ-লোড"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' 2>/dev/null | tr -d '"\\')
if echo "$HS" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য"; else bad "390px-hScroll ($HS)"; fi
if agent-browser screenshot "$ROOT/download/s294-cejump-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s294-cejump-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: চূড়ান্ত-বুট (রিড-ওনলি — ক্লিন-শূন্য) ──"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার জীবিত (চূড়ান্ত)" || bad "চূড়ান্ত-বুট"

echo "══════════════════════════════"
echo "s294-cejump: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
