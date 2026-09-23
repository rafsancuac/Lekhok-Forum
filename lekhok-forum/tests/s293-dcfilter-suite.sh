#!/bin/bash
# s293-dcfilter-suite.sh — session293 ডেইলি কনটেন্ট (/admin/daily) তাৎক্ষণিক-ফিল্টার dcf293 সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (dcf-স্ট্রিপ + tr[data-dcf-row]/data-kw/data-dcf-type/data-dcf-pub + শূন্য-অবস্থা +
#          no-regression: bulk-bar / data-bulk-all / count-pill / sidebar / DAILY_TYPES-চিপ)
#          ② স্টাইল (session293-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল;
#          reduced-motion; 640px-সংকোচন; [hidden]-গার্ড বাইট-সঠিক)
#          ③ আচরণ (__dcf293QA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; কীওয়ার্ড + ধরন-ফ্যাসেট + স্ট্যাটাস-ফ্যাসেট
#          (দ্বৈত-ফ্যাসেট AND) + নো-ম্যাচ→শূন্য-অবস্থা + clear→পুনরুদ্ধার + 'f'-ফোকাস + ফিল্ড-গার্ড + Escape)
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
# চুক্তি: ① সিড = DB-সরাসরি (s293-seeddaily — POST-নিষিদ্ধ: published=1-এ broadcastToAll-বিজ্ঞপ্তি,
#         s274/s277-চুক্তি; কিল→সিড→বুট ক্রম) ② ভিউয়ার = admin/admin123 (s277-প্রমাণিত — scope-gated
#         requireScope('daily')) ③ প্রত্যাশা-গণনা = রেন্ডার্ড-HTML থেকে (অন্য-সারি-উপস্থিতিতেও নির্ধারক)
#         ④ অ্যাঙ্করড-চেক '/admin/daily/?$' (session264-গোটচা — /admin/daily/new-সংঘর্ষ-নিরাপদ)
#         ⑤ csrf = লগইন-GET-meta-টোকেন (s272-গোটচা; সুইটে POST-শূন্য — লগইনেই-যথেষ্ট)
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
J=/tmp/s293-dcf-jar.txt
PAGE=/tmp/s293-dcf-page.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/daily"; }

echo "── ধাপ-০: পরিবেশ ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi

echo "── ধাপ-১: সোর্স-কাঠামো (daily/list.ejs) ──"
V=$(cat "$APP/admin/views/admin/daily/list.ejs")
containsF "ফিল্টার-স্ট্রিপ (id=dcfStrip293)" "$V" '<div class="dcf-instant" id="dcfStrip293">'
containsF "কীওয়ার্ড-ইনপুট" "$V" 'id="dcfFilter293"'
containsF "ধরন-ফ্যাসেট-সিলেক্ট (DAILY_TYPES-ড্রিভেন)" "$V" 'id="dcfType293"'
containsF "স্ট্যাটাস-ফ্যাসেট-সিলেক্ট (প্রকাশিত/খসড়া)" "$V" 'id="dcfPub293"'
containsF "সারি-বৈশিষ্ট্য-চতুষ্টয়" "$V" 'data-dcf-row data-kw="<%= dcfKw293(it) %>" data-dcf-type="<%= it.content_type %>" data-dcf-pub='
containsF "kw-সহায়ক (১৪০-অক্ষর-ক্যাপ)" "$V" "var dcfKw293 = function (it)"
containsF "শূন্য-অবস্থা-বক্স" "$V" 'id="dcfZero293"'
containsF "কাউন্ট-চিপ (বাংলা-সংখ্যা)" "$V" 'bn293(shown)'
containsF "'f'-ফোকাস-ফিল্ড-গার্ড" "$V" "if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey)"
containsF "Escape-পরিষ্কার (stopPropagation)" "$V" "if (ev.key === 'Escape') { ev.stopPropagation(); dcfClear293(); }"
containsF "QA-হুক __dcf293QA" "$V" 'window.__dcf293QA'
containsF "wired-গার্ড" "$V" 'if (window.__dcf293wired) return;'
B293=$(echo "$V" | sed -n '/session293 — dcf293 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p')
if [ -n "$B293" ]; then
  ok "dcf293-স্টাইল-ব্লক উপস্থিত"
  HEXN=$(echo "$B293" | grep -oE '#[0-9a-fA-F]{3,8}' | wc -l)
  if [ "$HEXN" = "0" ]; then ok "স্টাইল-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "স্টাইল-ব্লকে হেক্স $HEXN"; fi
  containsF "[hidden]-গার্ড (বাইট-সঠিক — সারি)" "$B293" 'tr[data-dcf-row][hidden] { display: none !important; }'
  containsF "[hidden]-গার্ড (চিপ/শূন্য/ক্লিয়ার)" "$B293" '.dcf-count-chip[hidden]'
  containsF "amber-টোকেন-পরিবার (sun-থিম)" "$B293" 'var(--lf-amber-deep)'
  containsF "color-mix-ফোকাস-রিং" "$B293" 'color-mix(in srgb, var(--lf-amber-deep) 45%, transparent)'
  containsF "reduced-motion-গার্ড" "$B293" 'prefers-reduced-motion'
  containsF "640px-সংকোচন" "$B293" 'max-width: 640px'
else
  bad "dcf293-স্টাইল-ব্লক অনুপস্থিত"
fi
# no-regression
containsF "no-reg: bulk-bar" "$V" '/admin/daily/bulk-delete'
containsF "no-reg: data-bulk-all" "$V" 'data-bulk-all'
containsF "no-reg: count-pill" "$V" 'count-pill'
containsF "no-reg: sidebar" "$V" "include('../partials/sidebar')"
containsF "no-reg: DAILY_TYPES-চিপ-সারি" "$V" 'chip chip-accent'

echo "── ধাপ-২: মার্কার-সিড → লগইন → SSR (কিল→সিড→বুট ক্রম) ──"
kill8094; ok "পুরাতন-সার্ভার কিল (পোর্ট-ফ্রি-পোলিং)"
SR=$(node "$APP/scripts/s293-seeddaily.js" seed 2>/dev/null | tail -1)
if echo "$SR" | grep -q "SEED-OK count=3"; then ok "মার্কার-সিড ×৩ ($SR)"; else bad "সিড-ব্যর্থ ($SR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (সিড-পরে)" || bad "পুনঃ-বুট-ব্যর্থ"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন (admin — s277-প্রমাণিত scope-gated ভিউয়ার)"; else bad "লগইন-HTTP $LC"; fi
PC=$(fetch_page)
if [ "$PC" = "200" ] && grep -qF 'ডেইলি কনটেন্ট' "$PAGE" && grep -qF 'dcfStrip293' "$PAGE"; then ok "/admin/daily 200 (লগইন-সেশনে + স্ট্রিপ-উপস্থিত)"; else bad "/admin/daily HTTP $PC"; fi
if grep -qF '/admin/login' "$PAGE" && ! grep -qF 'dcfStrip293' "$PAGE"; then bad "লগইন-পেজে-আটকে (session264-গোটচা)"; else ok "অ্যাঙ্করড-চেক: সত্যিক-তালিকা-পেজ (লগইন-পেজ-নয়)"; fi
# প্রত্যাশা-গণনা (রেন্ডার্ড-HTML থেকে — অন্য-সারি-উপস্থিতিতেও নির্ধারক; গোটচা: 'data-dcf-row' একাই
# grep করলে CSS/JS-সিলেক্টর-লিটারালও গোনা হয় (+২) → সারি-ইউনিক 'data-dcf-row data-kw=' প্যাটার্ন)
TOTAL=$(grep -o 'data-dcf-row data-kw=' "$PAGE" | wc -l)
QZ=$(grep -o 'data-dcf-type="quiz"' "$PAGE" | wc -l)
DR=$(grep -o 'data-dcf-pub="0"' "$PAGE" | wc -l)
MARK=$(grep -o 'qa293-' "$PAGE" | wc -l)
if [ "$TOTAL" -ge 3 ] 2>/dev/null; then ok "সারি-মোট=$TOTAL (≥৩)"; else bad "সারি-মোট=$TOTAL"; fi
if [ "$QZ" -ge 1 ] 2>/dev/null; then ok "quiz-সারি=$QZ (ধরন-ফ্যাসেট-লাইভ)"; else bad "quiz-সারি=$QZ"; fi
if [ "$DR" -ge 1 ] 2>/dev/null; then ok "খসড়া-সারি=$DR (স্ট্যাটাস-ফ্যাসেট-লাইভ)"; else bad "খসড়া-সারি=$DR"; fi
if [ "$MARK" -ge 6 ] 2>/dev/null; then ok "মার্কার-উপস্থিতি=$MARK (≥৬ — ৩-টাইটেল+৩-বডি)"; else bad "মার্কার=$MARK"; fi

echo "── ধাপ-৩: E2E (agent-browser — ইউনিক-কোয়েরি-open) ──"
Q1="qa293a=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
LR=$(ev '(function(){var c=document.querySelector("input[name=_csrf]");if(!c)return "ALR";return fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=admin&password=admin123&_csrf="+encodeURIComponent(c.value)}).then(function(r){return String(r.status)})})()' 2>/dev/null | tr -d '"')
if echo "$LR" | grep -qE '30[23]'; then ok "ব্রাউজার-লগইন ($LR)"; else
  if echo "$LR" | grep -qF 'ALR'; then ok "ব্রাউজার-সেশন পূর্ব-লগইনড (ALR — পারসিস্টেন্ট-প্রোফাইল)"; else bad "ব্রাউজার-লগইন ($LR)"; fi
fi
if agent-browser open "$BASE/admin/daily/?$Q1" >/dev/null 2>&1; then ok "open ($Q1 — অ্যাঙ্করড-টার্গেট)"; else bad "open-ব্যর্থ"; fi
if poll 'window.__dcf293QA && ("T" + window.__dcf293QA.total() + "C" + window.__dcf293QA.count())' "T${TOTAL}C${TOTAL}"; then ok "বুট: হুক-জীবিত (total=$TOTAL count=$TOTAL — অফিল্টার)"; else bad "বুট-হুক"; fi
# কীওয়ার্ড-ফিল্টার (মার্কার-ইউনিক)
E1=$(ev '(function(){var i=document.getElementById("dcfFilter293");i.value="qa293";i.dispatchEvent(new Event("input"));var c=window.__dcf293QA.count();var chip=document.getElementById("dcfCount293");return "C"+c+"CH"+(!chip.hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
if echo "$E1" | grep -qF 'C3CH1'; then ok "কীওয়ার্ড 'qa293' → count=৩ + চিপ-দৃশ্যমান"; else bad "কীওয়ার্ড ($E1)"; fi
E2=$(ev '(function(){document.getElementById("dcfClear293").click();var c=window.__dcf293QA.count();return "C"+c+"CH"+(document.getElementById("dcfCount293").hidden?"0":"1")})()' 2>/dev/null | tr -d '"\\')
if echo "$E2" | grep -qF "C${TOTAL}CH0"; then ok "clear → পুনরুদ্ধার ($TOTAL) + চিপ-লুকানো"; else bad "clear ($E2)"; fi
# ধরন-ফ্যাসেট
E3=$(ev '(function(){var s=document.getElementById("dcfType293");s.value="quiz";s.dispatchEvent(new Event("change"));return "Q"+window.__dcf293QA.count()+"of"+window.__dcf293QA.total()})()' 2>/dev/null | tr -d '"\\')
if echo "$E3" | grep -qF "Q${QZ}of${TOTAL}"; then ok "ধরন=quiz → count=$QZ (ফ্যাসেট-১)"; else bad "ধরন-ফ্যাসেট ($E3)"; fi
# দ্বৈত-ফ্যাসেট AND (quiz + খসড়া = শূন্য — মার্কার-quiz প্রকাশিত) + শূন্য-অবস্থা
E4=$(ev '(function(){var s=document.getElementById("dcfPub293");s.value="0";s.dispatchEvent(new Event("change"));var c=window.__dcf293QA.count();var z=document.getElementById("dcfZero293");return "A"+c+"Z"+(!z.hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
if echo "$E4" | grep -qF 'A0Z1'; then ok "quiz+খসড়া (AND) → count=০ + শূন্য-অবস্থা-দৃশ্যমান"; else bad "AND-ফ্যাসেট ($E4)"; fi
# স্ট্যাটাস-একক-ফ্যাসেট (quiz-রিসেট + খসড়া → DR)
E5=$(ev '(function(){var t=document.getElementById("dcfType293");t.value="";t.dispatchEvent(new Event("change"));var c=window.__dcf293QA.count();var z=document.getElementById("dcfZero293");return "D"+c+"Z"+(!z.hidden?"1":"0")})()' 2>/dev/null | tr -d '"\\')
if echo "$E5" | grep -qF "D${DR}Z0"; then ok "স্ট্যাটাস=খসড়া → count=$DR + শূন্য-অবস্থা-লুকানো"; else bad "স্ট্যাটাস-ফ্যাসেট ($E5)"; fi
# Escape-পরিষ্কার (input-ফোকাসে)
E6=$(ev '(function(){var i=document.getElementById("dcfFilter293");i.focus();i.value="zzz-no-match";i.dispatchEvent(new Event("input"));var ek=new KeyboardEvent("keydown",{key:"Escape",bubbles:true});i.dispatchEvent(ek);return "C"+window.__dcf293QA.count()+"V"+i.value})()' 2>/dev/null | tr -d '"\\')
if echo "$E6" | grep -qF "C${TOTAL}V"; then ok "Escape → ইনপুট-পরিষ্কার + পুনরুদ্ধার ($TOTAL)"; else bad "Escape ($E6)"; fi
# 'f'-ফোকাস (বডি-থেকে) + ফিল্ড-গার্ড
E7=$(ev '(function(){document.body.focus();var e=new KeyboardEvent("keydown",{key:"f",bubbles:true});document.dispatchEvent(e);return "F"+(document.activeElement?document.activeElement.id:"-")})()' 2>/dev/null | tr -d '"\\')
if echo "$E7" | grep -qF 'FdcfFilter293'; then ok "'f'-ফোকাস → ফিল্টার-ইনপুট"; else bad "'f'-ফোকাস ($E7)"; fi
E8=$(ev '(function(){var s=document.getElementById("dcfPub293");s.focus();var e=new KeyboardEvent("keydown",{key:"f",bubbles:true});s.dispatchEvent(e);return "G"+(document.activeElement?document.activeElement.id:"-")})()' 2>/dev/null | tr -d '"\\')
if echo "$E8" | grep -qF 'GdcfPub293'; then ok "ফিল্ড-গার্ড: SELECT-থেকে-'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ($E8)"; fi
# ফ্রেশ-লোড (stale-গোটচা) → হুক-পুনঃপ্রতিষ্ঠা + স্ক্রিনশট
Q2="qa293b=$(date +%s)$RANDOM"
agent-browser open "$BASE/admin/daily/?$Q2" >/dev/null 2>&1
if poll 'window.__dcf293QA && ("T" + window.__dcf293QA.total())' "T${TOTAL}"; then ok "ফ্রেশ-লোড হুক-পুনঃপ্রতিষ্ঠা (T=$TOTAL)"; else bad "ফ্রেশ-লোড"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
HS=$(ev '(function(){var d=document.documentElement;return (d.scrollWidth-d.clientWidth)>2?"HS":"NO"})()' 2>/dev/null | tr -d '"\\')
if echo "$HS" | grep -qF 'NO'; then ok "390px-বডি-hScroll-শূন্য"; else bad "390px-hScroll ($HS)"; fi
if agent-browser screenshot "$ROOT/download/s293-dcf-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
if agent-browser screenshot "$ROOT/download/s293-dcf-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi

echo "── ধাপ-৪: মার্কার-ক্লিন (নেট-শূন্য) ──"
kill8094; ok "সার্ভার কিল (ক্লিন-পূর্ব)"
CR=$(node "$APP/scripts/s293-seeddaily.js" clean 2>/dev/null | tail -1)
if echo "$CR" | grep -q "CLEAN-OK deleted=3"; then ok "মার্কার-ক্লিন ($CR)"; else bad "ক্লিন ($CR)"; fi
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার পুনঃ-বুট (ক্লিন-পরে)" || bad "চূড়ান্ত-বুট"

echo "══════════════════════════════"
echo "s293-dcfilter: PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; else exit 1; fi
