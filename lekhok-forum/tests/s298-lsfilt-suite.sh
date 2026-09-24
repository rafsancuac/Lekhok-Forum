#!/bin/bash
# s298-lsfilt-suite.sh — session298 তাৎক্ষণিক-ফিল্টার lsf298 সুইট (/admin/sections + /admin/home-leadership — স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো ×৩-ফাইল (lsf-স্ট্রিপ + ইনপুট/ক্লিয়ার/চিপ/শূন্য-অবস্থা + wired-গার্ড + QA-হুক + MO (childList+
#          characterData-শুধু) + countTxt change-guard + no-regression: sec-tabs/reRenderList/bindForms/bindDrag +
#          wireCard/data-vis/hl-addtile + ক্রম-অ্যাসার্ট: স্ট্রিপ include/forEach-এর-আগে) ② স্টাইল (উভয় session298-ব্লক
#          হেক্স-শূন্য টোকেন-শুধু; brandgreen color-mix ফোকাস-রিং; hidden-গার্ড !important; flash-outline; reduced-motion;
#          640px-সংকোচন) ③ SSR (প্রত্যাশা-গণনা রেন্ডার্ড-HTML থেকে — 'data-lsf-row298="1" data-kw="' মার্কআপ-ইউনিক জোড় —
#          CSS/JS-সিলেক্টর-ওভারকাউন্ট-নিরাপদ; partial=১-এ স্ট্রিপ-অনুপস্থিতি — re-render-ডুপ্লিকেশন-শূন্য-প্রমাণ)
#          ④ E2E দুই-সারফেস (__lsf298QA হুক + ডিটারমিনিস্টিক '#maxId'-একক-মিল + সর্ব-মিল 'আইটেম' + শূন্য-অবস্থা + বাংলা-চিপ +
#          clear-পুনরুদ্ধার + Escape + 'f'-ফোকাস + ফিল্ড-গার্ড + রানটাইম-রি-ইনডেক্স (client-side data-kw বদল → apply → মিল —
#          DB-লেখা-শূন্য) + leadership ইন-প্লেস-স্টেলনেস (textContent বদল → MO-স্বয়ং-পুনঃ-apply — লাইভ-টেক্সট-সমৃদ্ধি-প্রমাণ) +
#          jumpFirst-flash + ফ্রেশ-লোড + 390px-hScroll-শূন্য + স্ক্রিনশট ×৪)
# চুক্তি: ① রিড-ওনলি — POST-শূন্য/সিড-শূন্য (সর্ব-ইন্টারঅ্যাকশন client-side DOM — নেট-DB-লেখা-শূন্য) ② ভিউয়ার = admin/admin123
#          ③ ডিটারমিনিস্টিক: '#'+maxId (সর্ব-বৃহত্তর-আইডি — সাবস্ট্রিং-সংঘর্ষ-শূন্য) + 'আইটেম' (সর্ব-রো-kw-প্রত্যয়)
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
bn(){ local s=$1 o="" c i; local d=(০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯); for ((i=0;i<${#s};i++)); do c=${s:i:1}; if [[ "$c" =~ [0-9] ]]; then o+=${d[c]}; else o+=$c; fi; done; echo "$o"; }
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
J=/tmp/s298-lsf-jar.txt
PSEC=/tmp/s298-lsf-sec.html
PLEAD=/tmp/s298-lsf-lead.html
PPART=/tmp/s298-lsf-partial.html

fetch_pages(){
  curl -s -b "$J" -o "$PSEC" -w "%{http_code}" "$BASE/admin/sections"
  curl -s -b "$J" -o "$PLEAD" -w "%{http_code}" "$BASE/admin/home-leadership"
  curl -s -b "$J" -o "$PPART" -w "%{http_code}" "$BASE/admin/sections?section=home_faq&partial=1"
}

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (sections.ejs + partial + home-leadership.ejs) ──"
VS=$(cat "$APP/admin/views/admin/sections.ejs")
VP=$(cat "$APP/admin/views/admin/partials/sections-list.ejs")
VL=$(cat "$APP/admin/views/admin/home-leadership.ejs")
for pair in "sections:$VS" "leadership:$VL"; do
  NAM="${pair%%:*}"; VV="${pair#*:}"
  containsF "$NAM: ফিল্টার-স্ট্রিপ (id=lsfStrip298)" "$VV" '<div class="lsf298-instant" id="lsfStrip298">'
  containsF "$NAM: সার্চ-ইনপুট" "$VV" 'id="lsfInput298"'
  containsF "$NAM: ক্লিয়ার-বাটন" "$VV" 'id="lsfClear298"'
  containsF "$NAM: কাউন্ট-চিপ" "$VV" 'id="lsfCount298"'
  containsF "$NAM: শূন্য-অবস্থা-বক্স" "$VV" 'id="lsfZero298"'
  containsF "$NAM: wired-গার্ড" "$VV" 'if (window.__lsf298wired) return; window.__lsf298wired = true;'
  containsF "$NAM: QA-হুক __lsf298QA" "$VV" 'window.__lsf298QA'
  containsF "$NAM: হুক-ফিল্ড surface" "$VV" "surface: '$NAM'"
  containsF "$NAM: Escape-stopPropagation" "$VV" "if (ev.key === 'Escape') { ev.stopPropagation(); lsfClear298(); }"
  containsF "$NAM: Enter-প্রথম-মিল-জাম্প" "$VV" "if (ev.key === 'Enter') { ev.preventDefault(); lsfJumpFirst298(); }"
  containsF "$NAM: 'f'-ফোকাস-ফিল্ড-গার্ড" "$VV" "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)"
  containsF "$NAM: MutationObserver (childList+characterData)" "$VV" 'childList: true, subtree: true, characterData: true'
  containsF "$NAM: countTxt change-guard (লুপ-শূন্য)" "$VV" 'countTxt.textContent !== nt'
  containsF "$NAM: ফ্ল্যাশ-জাম্প" "$VV" 'lsf298-flash'
  containsF "$NAM: রো-সিলেক্টর (রানটাইম-ইনডেক্স)" "$VV" 'function rows298()'
done
containsF "sections: রো-সিলেক্টর sec-item" "$VS" '.sec-item[data-sec-id][data-lsf-row298]'
containsF "leadership: রো-সিলেক্টর hl-slot" "$VL" '.hl-slot[data-lsf-row298]'
containsF "leadership: লাইভ-টেক্সট-সমৃদ্ধি (visLabel)" "$VL" 'data-role="visLabel"'
# ক্রম-অ্যাসার্ট: স্ট্রিপ include/forEach-এর আগে
POS1=$(echo "$VS" | grep -bo 'lsfStrip298' | head -1 | cut -d: -f1)
POS2=$(echo "$VS" | grep -bo "include('partials/sections-list'" | head -1 | cut -d: -f1)
if [ -n "$POS1" ] && [ -n "$POS2" ] && [ "$POS1" -lt "$POS2" ] 2>/dev/null; then ok "ক্রম: sections-স্ট্রিপ include-এর আগে"; else bad "sections-ক্রম-ভাঙা"; fi
POS3=$(echo "$VL" | grep -bo 'lsfStrip298' | head -1 | cut -d: -f1)
POS4=$(echo "$VL" | grep -bo "\['legacy', 'current'\].forEach" | head -1 | cut -d: -f1)
if [ -n "$POS3" ] && [ -n "$POS4" ] && [ "$POS3" -lt "$POS4" ] 2>/dev/null; then ok "ক্রম: leadership-স্ট্রিপ forEach-এর আগে"; else bad "leadership-ক্রম-ভাঙা"; fi
# স্টাইল-ব্লক (উভয় ফাইল): হেক্স-শূন্য + টোকেন + hidden-গার্ড + reduced-motion + 640px
# (সতর্কতা: কনটেন্টে ':'-আছে — cut-পার্সিং-নিষিদ্ধ; স্পষ্ট-দুই-ব্লক)
style_checks(){
  local NAM="$1" RCL="$2" VV="$3"
  local B298
  B298=$(echo "$VV" | sed -n '/session298 — lsf298 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p')
  if [ -n "$B298" ]; then
    ok "$NAM: lsf298-স্টাইল-ব্লক উপস্থিত"
    local HEXN
    HEXN=$(echo "$B298" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
    if [ "$HEXN" = "0" ]; then ok "$NAM: স্টাইল-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "$NAM: স্টাইল-ব্লকে হেক্স $HEXN"; fi
    containsF "$NAM: hidden-গার্ড (!important — সঠিক-বাইট)" "$B298" "${RCL}[hidden] { display: none !important; }"
    containsF "$NAM: color-mix-ফোকাস-রিং" "$B298" 'color-mix(in srgb, var(--lf-brandgreen-deep) 45%, transparent)'
    containsF "$NAM: brandgreen-টোকেন-পরিবার" "$B298" 'var(--lf-brandgreen-deep)'
    containsF "$NAM: reduced-motion-গার্ড" "$B298" 'prefers-reduced-motion'
    containsF "$NAM: 640px-সংকোচন" "$B298" 'max-width: 640px'
  else
    bad "$NAM: lsf298-স্টাইল-ব্লক অনুপস্থিত"
  fi
}
style_checks "sections" ".sec-item" "$VS"
style_checks "leadership" ".hl-slot" "$VL"
# partial: রো-কীওয়ার্ড + skip + সাদা-স্পেস-নরমালাইজেশন + স্ট্রিপ-অনুপস্থিতি (re-render-ডুপ্লিকেশন-শূন্য)
containsF "partial: রো-কীওয়ার্ড (data-lsf-row298+data-kw)" "$VP" 'data-lsf-row298="1" data-kw="'
containsF "partial: সাদা-স্পেস-নরমালাইজেশন (body)" "$VP" "String(r.body||'').replace(/\\s+/g,' ')"
containsF "partial: দ্বিভাষিক-অবস্থা (দৃশ্যমান/লুকানো)" "$VP" "(r.is_active ? 'দৃশ্যমান visible' : 'লুকানো hidden')"
containsF "partial: অ্যাড-ফর্ম skip" "$VP" 'data-lsf-skip298="1"'
if echo "$VP" | grep -qF 'lsfStrip298'; then bad "partial: স্ট্রিপ-ফাঁড়ি (re-render-ডুপ্লিকেশন-ঝুঁকি)"; else ok "partial: স্ট্রিপ-অনুপস্থিত (শুধু মেইন-পেজে)"; fi
# no-regression
containsF "no-reg: sec-tabs" "$VS" 'class="sec-tabs"'
containsF "no-reg: sec-toast" "$VS" 'sec-toast'
containsF "no-reg: reRenderList" "$VS" 'function reRenderList'
containsF "no-reg: bindDrag" "$VS" 'function bindDrag'
containsF "no-reg: wireCard (leadership)" "$VL" 'function wireCard'
containsF "no-reg: data-vis সুইচ" "$VL" 'data-vis'
containsF "no-reg: hl-addtile" "$VL" 'data-addtile'
containsF "no-reg: visibility-এন্ডপয়েন্ট" "$VL" 'home-leadership/visibility'

echo "── ধাপ-২: লগইন → SSR (রিড-ওনলি — সিড/POST-শূন্য) ──"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন (admin — s277-প্রমাণিত ভিউয়ার)"; else bad "লগইন-HTTP $LC"; fi
CSECT=$(curl -s -b "$J" -o "$PSEC" -w "%{http_code}" "$BASE/admin/sections")
CLEAD=$(curl -s -b "$J" -o "$PLEAD" -w "%{http_code}" "$BASE/admin/home-leadership")
CPART=$(curl -s -b "$J" -o "$PPART" -w "%{http_code}" "$BASE/admin/sections?section=home_faq&partial=1")
if [ "$CSECT" = "200" ] && grep -qF 'lsfStrip298' "$PSEC" && grep -qF 'secList' "$PSEC"; then ok "/admin/sections 200 (স্ট্রিপ-সহ)"; else bad "/admin/sections HTTP $CSECT"; fi
if [ "$CLEAD" = "200" ] && grep -qF 'lsfStrip298' "$PLEAD" && grep -qF 'hl-slot' "$PLEAD"; then ok "/admin/home-leadership 200 (স্ট্রিপ-সহ)"; else bad "/admin/home-leadership HTTP $CLEAD"; fi
if [ "$CPART" = "200" ] && ! grep -qF 'lsfStrip298' "$PPART" && grep -qF 'data-lsf-row298' "$PPART"; then ok "partial=1 200 (রো-সহ + স্ট্রিপ-শূন্য)"; else bad "partial HTTP $CPART"; fi
# প্রত্যাশা-গণনা (রেন্ডার্ড — মার্কআপ-ইউনিক জোড়; CSS/JS-সিলেক্টর-ওভারকাউন্ট-নিরাপদ)
ROWS_SEC=$(grep -o 'data-lsf-row298="1" data-kw="' "$PSEC" | wc -l)
ROWS_LEAD=$(grep -o 'data-lsf-row298="1" data-kw="' "$PLEAD" | wc -l)
EXTRAS=$(grep -o 'data-extra="[0-9]*"' "$PLEAD" | wc -l)
MAXID=$(grep -o 'data-sec-id="[0-9]*"' "$PSEC" | grep -o '[0-9]*' | sort -n | tail -1)
if [ "$ROWS_SEC" -ge 5 ] 2>/dev/null; then ok "sections-রো=$ROWS_SEC (রেন্ডার্ড)"; else bad "sections-রো=$ROWS_SEC"; fi
if [ "$ROWS_LEAD" -ge 5 ] 2>/dev/null; then ok "leadership-কার্ড=$ROWS_LEAD (রেন্ডার্ড)"; else bad "leadership-কার্ড=$ROWS_LEAD"; fi
if [ -n "$MAXID" ] && [ "$MAXID" -ge 1 ] 2>/dev/null; then ok "sections-maxId=$MAXID (ডিটারমিনিস্টিক-প্রোব)"; else bad "maxId-অনুপস্থিত"; fi
grep -o 'id="slot-[a-z_0-9]*"' "$PLEAD" | head -1 | sed 's/id="slot-//;s/"//' > /tmp/s298-slotkey.txt
SLOTKEY=$(cat /tmp/s298-slotkey.txt)
if [ -n "$SLOTKEY" ]; then ok "leadership-স্লট-কী=$SLOTKEY (ডিটারমিনিস্টিক-প্রোব)"; else bad "স্লট-কী-অনুপস্থিত"; fi

echo "── ধাপ-৩: E2E sections (agent-browser) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
Q1="qa298a=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
LR=$(ev '(function(){var c=document.querySelector("input[name=_csrf]");if(!c)return "ALR";return fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(c.value)}).then(function(r){return String(r.status)})})()' 2>/dev/null | tr -d '"')
# session297-গোটচা: opaqueredirect (redirect:manual) → সর্বদা status-0 — ০ = রিডাইরেক্ট-প্রমাণ (গ্রহণযোগ্য)
if echo "$LR" | grep -qE '^0$|^30[23]$'; then ok "ব্রাউজার-লগইন ($LR — ০=opaqueredirect-প্রমাণ)"; else
  if echo "$LR" | grep -qF 'ALR'; then ok "ব্রাউজার-সেশন পূর্ব-লগইনড (ALR — পারসিস্টেন্ট-প্রোফাইল)"; else bad "ব্রাউজার-লগইন ($LR)"; fi
fi
if agent-browser open "$BASE/admin/sections?$Q1" >/dev/null 2>&1; then ok "open sections ($Q1 — ইউনিক-কোয়েরি)"; else bad "open-ব্যর্থ"; fi
if poll 'window.__lsf298QA && ("R" + window.__lsf298QA.rows() + "S" + window.__lsf298QA.surface)' "R${ROWS_SEC}Ssections"; then ok "বুট: হুক-জীবিত (R=$ROWS_SEC surface=sections — SSR-সমান)"; else bad "বুট-হুক (sections)"; fi
# E1: ডিটারমিনিস্টিক একক-মিল ('#'+maxId — সাবস্ট্রিং-সংঘর্ষ-শূন্য)
E1=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="#'"$MAXID"'";i.dispatchEvent(new Event("input"));var hid=0,vis=0;Array.prototype.slice.call(document.querySelectorAll(".sec-item[data-sec-id][data-lsf-row298]")).forEach(function(el){if(el.hasAttribute("hidden"))hid++;else vis++});var ct=document.getElementById("lsfCountTxt298").textContent;return "M"+q.matches()+"V"+vis+"H"+hid+"CH"+(document.getElementById("lsfCount298").hidden?"0":"1")+":"+ct})()' 2>/dev/null | tr -d '"\\')
if echo "$E1" | grep -qE "^M1V1H$((ROWS_SEC-1))CH1" && echo "$E1" | grep -qF '১ মিল'; then ok "একক-মিল: #$MAXID → M=1 দৃশ্যমান=১ হাইড=$((ROWS_SEC-1)) + বাংলা-চিপ"; else bad "একক-মিল ($E1)"; fi
# E2: সর্ব-মিল ('আইটেম' — সর্ব-রো-kw-প্রত্যয়)
E2=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="আইটেম";i.dispatchEvent(new Event("input"));var hid=document.querySelectorAll(".sec-item[data-sec-id][data-lsf-row298][hidden]").length;return "M"+q.matches()+"H"+hid})()' 2>/dev/null | tr -d '"\\')
if echo "$E2" | grep -qF "M${ROWS_SEC}H0"; then ok "সর্ব-মিল: 'আইটেম' → M=$ROWS_SEC হাইড=০"; else bad "সর্ব-মিল ($E2)"; fi
# E3: শূন্য-অবস্থা + বাংলা-চিপ
E3=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="zzz298-nomatch";i.dispatchEvent(new Event("input"));var ct=document.getElementById("lsfCountTxt298").textContent;var r="M"+q.matches()+"Z"+(document.getElementById("lsfZero298").hidden?"0":"1")+":"+ct;q.clear();return r})()' 2>/dev/null | tr -d '"\\')
if echo "$E3" | grep -qF "M0Z1:০ মিল · $(bn "$ROWS_SEC") আইটেম"; then ok "শূন্য-অবস্থা + বাংলা-চিপ (০ মিল · $ROWS_SEC আইটেম)"; else bad "শূন্য-অবস্থা ($E3)"; fi
# E4: clear → পূর্ণ-পুনরুদ্ধার
E4=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="zzz298-x";i.dispatchEvent(new Event("input"));q.clear();var hid=document.querySelectorAll(".sec-item[data-sec-id][data-lsf-row298][hidden]").length;return "V"+i.value+"M"+q.matches()+"H"+hid+"CH"+(document.getElementById("lsfCount298").hidden?"0":"1")+"Z"+(document.getElementById("lsfZero298").hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
if echo "$E4" | grep -qF "VM${ROWS_SEC}H0CH0Z1"; then ok "clear → পূর্ণ-পুনরুদ্ধার + চিপ/শূন্য-লুকানো"; else bad "clear ($E4)"; fi
# E5: Escape-পরিষ্কার (input-ফোকাসে — stopPropagation)
E5=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.focus();i.value="zzz298-no";i.dispatchEvent(new Event("input"));i.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "V:"+i.value+"M"+q.matches()})()' 2>/dev/null | tr -d '"\\')
if echo "$E5" | grep -qF "V:M${ROWS_SEC}"; then ok "Escape → ইনপুট-পরিষ্কার + পুনরুদ্ধার ($ROWS_SEC)"; else bad "Escape ($E5)"; fi
# E6: 'f'-ফোকাস (বডি-থেকে)
E6=$(ev '(function(){document.body.focus();var e=new KeyboardEvent("keydown",{key:"f",bubbles:true});document.dispatchEvent(e);return "F"+(document.activeElement?document.activeElement.id:"-")})()' 2>/dev/null | tr -d '"\\')
if echo "$E6" | grep -qF 'FlsfInput298'; then ok "'f'-ফোকাস → ফিল্টার-ইনপুট"; else bad "'f'-ফোকাস ($E6)"; fi
# E7: ফিল্ড-গার্ড (TEXTAREA-থেকে-'f' — details.open প্রথমে — session295-গোটচা: display:none-ফোকাস নীরব-ব্যর্থ)
E7=$(ev '(function(){var ta=document.querySelector(".sec-body textarea");if(!ta)return "NOTA";var d=ta.closest("details");if(d)d.open=true;ta.focus();var fok=document.activeElement===ta;ta.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));if(d)d.open=false;return "F"+(fok?"1":"0")+"G"+(document.activeElement===ta?"TA":"STOLEN")})()' 2>/dev/null | tr -d '"\\')
if echo "$E7" | grep -qF 'F1GTA'; then ok "ফিল্ড-গার্ড: TEXTAREA-থেকে-'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ($E7)"; fi
# E8: রানটাইম-রি-ইনডেক্স (client-side data-kw বদল → apply → নতুন-টোকেন-মিল — DB-লেখা-শূন্য; cej294-মূল-ধর্ম)
E8=$(ev '(function(){var q=window.__lsf298QA;var el=document.querySelector(".sec-item[data-sec-id][data-lsf-row298]");var old=el.getAttribute("data-kw");el.setAttribute("data-kw","zzz298client "+old);var i=document.getElementById("lsfInput298");i.value="zzz298client";i.dispatchEvent(new Event("input"));var m1=q.matches();var fm1=q.firstMatch();el.setAttribute("data-kw",old);q.apply();var m2=q.matches();i.value="";i.dispatchEvent(new Event("input"));return "M1:"+m1+"F:"+fm1+"M2:"+m2+"R:"+q.matches()})()' 2>/dev/null | tr -d '"\\')
if echo "$E8" | grep -qE '^M1:1F:[0-9]+M2:0R:'"${ROWS_SEC}"; then ok "রানটাইম-রি-ইনডেক্স: client-side-kw → মিল=১ + ফিরিয়ে-দিলে পূর্ণ-পুনরুদ্ধার"; else bad "রানটাইম-রি-ইনডেক্স ($E8)"; fi
# E9: jumpFirst → flash-রিং
E9=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="আইটেম";i.dispatchEvent(new Event("input"));var j=q.jumpFirst();var fl=document.querySelectorAll(".lsf298-flash").length;i.value="";i.dispatchEvent(new Event("input"));return "J"+j+"FL"+fl})()' 2>/dev/null | tr -d '"\\')
if echo "$E9" | grep -qF 'J1FL1'; then ok "jumpFirst → ফ্ল্যাশ-রিং-সক্রিয়"; else bad "jumpFirst ($E9)"; fi
# E10: ফ্রেশ-লোড (stale-গোটচা) → হুক-পুনঃপ্রতিষ্ঠা
Q2="qa298b=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/sections?$Q2" >/dev/null 2>&1
if poll 'window.__lsf298QA && ("R" + window.__lsf298QA.rows())' "R${ROWS_SEC}"; then ok "ফ্রেশ-লোড হুক-পুনঃপ্রতিষ্ঠা (R=$ROWS_SEC)"; else bad "ফ্রেশ-লোড (sections)"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' 2>/dev/null | tr -d '"\\')
if echo "$HS" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য (sections)"; else bad "390px-hScroll ($HS)"; fi
if agent-browser screenshot "$ROOT/download/s298-lsfilt-sections-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট sections-মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s298-lsfilt-sections-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট sections-ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: E2E home-leadership (agent-browser) ──"
Q3="qa298c=$(date +%s)$RANDOM"
if agent-browser open "$BASE/admin/home-leadership?$Q3" >/dev/null 2>&1; then ok "open leadership ($Q3)"; else bad "open-ব্যর্থ (leadership)"; fi
if poll 'window.__lsf298QA && ("R" + window.__lsf298QA.rows() + "S" + window.__lsf298QA.surface)' "R${ROWS_LEAD}Sleadership"; then ok "বুট: হুক-জীবিত (R=$ROWS_LEAD surface=leadership — SSR-সমান)"; else bad "বুট-হুক (leadership)"; fi
# L1: ডিটারমিনিস্টিক একক-মিল (স্লট-কী)
L1=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="'"$SLOTKEY"'";i.dispatchEvent(new Event("input"));var hid=0,vis=0;Array.prototype.slice.call(document.querySelectorAll(".hl-slot[data-lsf-row298]")).forEach(function(el){if(el.hasAttribute("hidden"))hid++;else vis++});return "M"+q.matches()+"V"+vis+"H"+hid+"FM"+(q.firstMatch()||"-")})()' 2>/dev/null | tr -d '"\\')
if echo "$L1" | grep -qE "^M1V1H$((ROWS_LEAD-1))FM" ; then ok "একক-মিল: স্লট-কী → M=1 দৃশ্যমান=১ হাইড=$((ROWS_LEAD-1)) + firstMatch"; else bad "একক-মিল (leadership) ($L1)"; fi
# L2: 'অতিরিক্ত' → extras-গণনা (SSR-প্রত্যাশা)
if [ "$EXTRAS" -ge 1 ] 2>/dev/null; then
  L2=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="অতিরিক্ত";i.dispatchEvent(new Event("input"));var m=q.matches();q.clear();return "M"+m})()' 2>/dev/null | tr -d '"\\')
  if echo "$L2" | grep -qF "M${EXTRAS}"; then ok "'অতিরিক্ত' → M=$EXTRAS (SSR-extras-সমান)"; else bad "'অতিরিক্ত' ($L2 — প্রত্যাশা $EXTRAS)"; fi
else
  skip "'অতিরিক্ত'-প্রোব (extras=০ — সিড-নির্ভরতা-শূন্য স্কিপ)"
fi
# L3: ইন-প্লেস-স্টেলনেস via MO (textContent বদল → স্বয়ং-পুনঃ-apply — DB-লেখা-শূন্য; লাইভ-টেক্সট-সমৃদ্ধি-প্রমাণ)
L3=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="zzz298live";i.dispatchEvent(new Event("input"));var m0=q.matches();var card=Array.prototype.slice.call(document.querySelectorAll(".hl-slot[data-lsf-row298]")).filter(function(el){return el.hasAttribute("hidden")})[0]||document.querySelector(".hl-slot[data-lsf-row298]");var ne=card.querySelector("[data-role=name]");if(!ne)return "NONAME";var old=ne.textContent;ne.textContent="ড. zzz298live পরীক্ষা";card.setAttribute("data-lsf-mo-probe","1");return "M0:"+m0+"ARM"})()' 2>/dev/null | tr -d '"\\')
if echo "$L3" | grep -qE '^M0:0ARM'; then
  if poll 'window.__lsf298QA && ("M" + window.__lsf298QA.matches())' 'M1' 12; then ok "MO-স্বয়ং-পুনঃ-apply: textContent-বদল → মিল=১ (ম্যানুয়াল-apply-শূন্য)"; else bad "MO-পুনঃ-apply (poll)"; fi
  L3B=$(ev '(function(){var q=window.__lsf298QA;var card=document.querySelector("[data-lsf-mo-probe]");var ne=card.querySelector("[data-role=name]");ne.textContent=ne.textContent.replace("ড. zzz298live পরীক্ষা","");var el=card;el.removeAttribute("data-lsf-mo-probe");var i=document.getElementById("lsfInput298");i.value="";i.dispatchEvent(new Event("input"));return "M"+q.matches()})()' 2>/dev/null | tr -d '"\\')
  if echo "$L3B" | grep -qF "M${ROWS_LEAD}"; then ok "প্রোব-টেক্সট-পুনরুদ্ধার → সর্ব-কার্ড-পুনঃপ্রকাশ ($ROWS_LEAD)"; else bad "প্রোব-পুনরুদ্ধার ($L3B)"; fi
else
  bad "MO-আর্ম ($L3)"
fi
# L4: শূন্য-অবস্থা + 'f'-ফোকাস + ফিল্ড-গার্ড (leadership)
L4=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="zzz298-none";i.dispatchEvent(new Event("input"));var z=document.getElementById("lsfZero298").hidden?"0":"1";var ct=document.getElementById("lsfCountTxt298").textContent;q.clear();return "Z"+z+":"+ct})()' 2>/dev/null | tr -d '"\\')
if echo "$L4" | grep -qF "Z1:০ মিল · $(bn "$ROWS_LEAD") কার্ড"; then ok "শূন্য-অবস্থা + বাংলা-চিপ (০ মিল · $ROWS_LEAD কার্ড)"; else bad "শূন্য-অবস্থা (leadership) ($L4)"; fi
# (hl-edit form hidden — data-edit-ক্লিকে প্রকাশ → focus → guard → data-cancel — সর্ব-ক্লায়েন্ট-সাইড)
L5=$(ev '(function(){document.body.focus();var e=new KeyboardEvent("keydown",{key:"f",bubbles:true});document.dispatchEvent(e);var f1=document.activeElement?document.activeElement.id:"-";var card=document.querySelector(".hl-slot[data-lsf-row298]");var eb=card.querySelector("[data-edit]");if(!eb)return "F1:"+f1+"NOEDIT";eb.click();var ta=card.querySelector("form.hl-edit textarea");if(!ta)return "F1:"+f1+"NOTA";ta.focus();var fok=document.activeElement===ta;ta.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true}));var g=document.activeElement===ta?"TA":"STOLEN";var cb=card.querySelector("[data-cancel]");if(cb)cb.click();return "F1:"+f1+"F"+(fok?"1":"0")+"G"+g})()' 2>/dev/null | tr -d '"\\')
if echo "$L5" | grep -qF 'F1:lsfInput298' && echo "$L5" | grep -qF 'F1GTA'; then ok "'f'-ফোকাস + ফিল্ড-গার্ড (leadership)"; else bad "'f'/গার্ড (leadership) ($L5)"; fi
# L6: jumpFirst-flash
L6=$(ev '(function(){var q=window.__lsf298QA;var i=document.getElementById("lsfInput298");i.value="'"$SLOTKEY"'";i.dispatchEvent(new Event("input"));var j=q.jumpFirst();var fl=document.querySelectorAll(".hl-slot.lsf298-flash").length;i.value="";i.dispatchEvent(new Event("input"));return "J"+j+"FL"+fl})()' 2>/dev/null | tr -d '"\\')
if echo "$L6" | grep -qF 'J1FL1'; then ok "jumpFirst → ফ্ল্যাশ (leadership)"; else bad "jumpFirst (leadership) ($L6)"; fi
# L7: ফ্রেশ-লোড + hScroll + স্ক্রিনশট
Q4="qa298d=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/home-leadership?$Q4" >/dev/null 2>&1
if poll 'window.__lsf298QA && ("R" + window.__lsf298QA.rows())' "R${ROWS_LEAD}"; then ok "ফ্রেশ-লোড হুক-পুনঃপ্রতিষ্ঠা (R=$ROWS_LEAD)"; else bad "ফ্রেশ-লোড (leadership)"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS2=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' 2>/dev/null | tr -d '"\\')
if echo "$HS2" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য (leadership)"; else bad "390px-hScroll ($HS2)"; fi
if agent-browser screenshot "$ROOT/download/s298-lsfilt-leader-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট leadership-মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s298-lsfilt-leader-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট leadership-ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৫: চূড়ান্ত-বুট (রিড-ওনলি — ক্লিন-শূন্য) ──"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার জীবিত (চূড়ান্ত)" || bad "চূড়ান্ত-বুট"

echo "══════════════════════════════"
echo "s298-lsfilt: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
