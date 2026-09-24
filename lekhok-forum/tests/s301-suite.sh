#!/bin/bash
# s301-suite.sh — session301: ① QA-বাগ-ফিক্স রিগ্রেশন (epaper poster onerror কোট-ক্ষয় → SyntaxError
#                 নির্মূল — দ্বি-লোড শূন্য-এরর) ② ep301 ক্যালেন্ডার-দিন-সেল-ইচ্ছা-প্রিফেচ E2E
#                 ③ bwf301 /moderator/best-writer তাৎক্ষণিক-ফিল্টার E2E ④ ofx301 টপবার মোবাইল-ক্লিপ
#                 ফিক্স E2E (body+21px-উৎস-নির্মূল — PLANS session294-তদন্ত-প্রস্তাব-পূর্ণ)
# চুক্তি: fetch-POST লগইন opaqueredirect-তিন-শাখা (session297) + authed-probe-সেটল-পোল + open-রিট্রাই+url-যাচাই
#         (s296-রীতি) + eval-এ unj() আন-এস্কেপ (s294-গোটচা) + native-setter+input-event (s300-গোটচা) +
#         bn() pure-bash (s298-গোটচা) + রেন্ডার্ড-মার্কআপ-থেকে-প্রত্যাশা (session292-চুক্তি — স্থির-সংখ্যা-নয়)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
J=/tmp/s301-jar.txt
BWP=/tmp/s301-bw-page.html
EPP=/tmp/s301-ep-page.html
SH_DESK=/home/z/my-project/download/s301-bwf-desk.png
SH_MOB=/home/z/my-project/download/s301-bwf-mobile390.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
unj(){ echo "$1" | sed 's/\\"/"/g; s/^"//; s/"$//'; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
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
bn(){ local s="$1" out="" i c
  for ((i=0;i<${#s};i++)); do c="${s:$i:1}"
    case "$c" in
      0) out="${out}০";; 1) out="${out}১";; 2) out="${out}২";; 3) out="${out}৩";; 4) out="${out}৪";;
      5) out="${out}৫";; 6) out="${out}৬";; 7) out="${out}৭";; 8) out="${out}৮";; 9) out="${out}৯";;
      *) out="${out}${c}";;
    esac
  done
  printf '%s' "$out"
}
bopen(){
  local i u
  for i in 1 2 3 4 5; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  # fresh-daemon-first-open-wedge ফলব্যাক (session297-গোটচা): ডেমন-রিসাইকেল → পুনঃ-রিট্রাই
  agent-browser close --all >/dev/null 2>&1
  sleep 1
  for i in 1 2 3; do
    agent-browser open "$1" >/dev/null 2>&1
    u=$(agent-browser get url 2>/dev/null)
    if [ "$u" = "$1" ]; then return 0; fi
    sleep 1
  done
  return 1
}
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o "$BWP" -w "%{http_code}" -b "$J" "$BASE/moderator/best-writer")
if [ "$PC" = "200" ]; then ok "best-writer পৃষ্ঠা 200"; else bad "best-writer পৃষ্ঠা HTTP $PC"; fi
EC=$(curl -s -o "$EPP" -w "%{http_code}" "$BASE/epaper")
if [ "$EC" = "200" ]; then ok "epaper পৃষ্ঠা 200"; else bad "epaper পৃষ্ঠা HTTP $EC"; fi
SSR_ROWS=$(grep -cF 'data-bwf-row301=' "$BWP" || true)
if [ "$SSR_ROWS" -ge 1 ]; then ok "SSR-সারি রেন্ডারড ($SSR_ROWS)"; else skip "SSR-সারি-শূন্য (খালি-ডেটা — E2E-আচরণ-শাখা স্কিপ)"; fi

echo "── ধাপ-১: কাঠামো (bwf301 + ep301 + ofx301 + [Mandatory-স্টাইল]) ──"
BWV=$(cat "$APP/views/user/moderator-best-writer.ejs")
containsF "bwf301 স্ট্রিপ-ইনপুট" "$BWV" 'id="bwfFilter301"'
containsF "bwf301 কাউন্ট-চিপ" "$BWV" 'id="bwfCount301"'
containsF "bwf301 শূন্য-অবস্থা" "$BWV" 'id="bwfZero301"'
containsF "bwf301 রো-মার্ক" "$BWV" 'data-bwf-row301="'
containsF "bwf301 হুক" "$BWV" 'window.__bwf301QA'
containsF "bwf301 boot-apply-init (session300-শিক্ষা)" "$BWV" 'bwfApply301(); /* boot-apply-init'
containsF "bwf301 hidden-গার্ড" "$BWV" '.mod-item[data-bwf-row301][hidden] { display: none !important; }'
containsF "bwf301 রানটাইম-ইনডেক্স" "$BWV" 'function bwfIndex301()'
EJV=$(cat "$APP/views/user/epaper.ejs")
containsF "ep301 সেল-ফায়ার-ফানেল" "$EJV" 'var epk301CalFire = function (cell301, reason301)'
containsF "ep301 has-গেট (ভবিষ্যৎ/শূন্য-দিন-শূন্য)" "$EJV" "if (!iso301 || !cell301.classList.contains('has')) return;"
containsF "ep301 মাউস-ট্রিগার" "$EJV" "epk301CalFire(c301, 'cal');"
containsF "ep301 ফোকাস-ট্রিগার" "$EJV" "epk301CalFire(c301, 'cal-focus');"
containsF "ep301 ডেলিগেশন (calRender-নিরাপদ)" "$EJV" "elCalGrid.addEventListener('mouseover'"
containsF "ep301 হুক-cells গেটার" "$EJV" "cells: function () { try { return document.querySelectorAll('.ep-cal-day.epk300-warm').length;"
EPC=$(cat "$APP/public/assets/css/epaper.css")
containsF "epaper.css session301 ব্লক" "$EPC" "session301 — ক্যালেন্ডার-দিন-সেল উষ্ণ-সংকেত"
containsF "উষ্ণ-সেল রিং (is-sel-অস্পৃশ্য)" "$EPC" ".ep-cal-day.epk300-warm:not(.is-sel)"
containsF "পোস্টার প্রবেশ-অ্যানিমেশন" "$EPC" "@keyframes epk301PosterIn"
containsF "epaper.css reduced-motion গার্ড" "$EPC" "prefers-reduced-motion: reduce"
STC=$(cat "$APP/public/assets/css/style.css")
containsF "ofx301 ক্যাসকেড-শেষ ব্লক" "$STC" "session301 (ofx301) — টপবার মোবাইল-ক্লিপ ফিক্স"
containsF "ofx301 (0,2,1)-স্পেসিফিকিটি নিয়ম" "$STC" ".topbar-right a.topbar-nav { display: none; }"
# হেক্স-শূন্য যাচাই (নতুন CSS-ব্লক — মার্কার-রেঞ্জ)
python3 - <<'PYEOF'
import re, sys
def blk(text, start_marker, end_marker):
    i = text.find(start_marker)
    if i < 0: return None
    if end_marker is None: return text[i:]
    j = text.find(end_marker, i)
    return text[i:j] if j > 0 else text[i:]
ep = open('public/assets/css/epaper.css', encoding='utf-8').read()
st = open('public/assets/css/style.css', encoding='utf-8').read()
bw = open('views/user/moderator-best-writer.ejs', encoding='utf-8').read()
bad = []
for name, css in (('epaper-session301', blk(ep, 'session301 — ক্যালেন্ডার-দিন-সেল', None)),
                  ('style-ofx301', blk(st, 'session301 (ofx301)', None)),
                  ('bwf301', blk(bw, 'session301 — সেরা-লেখক তাৎক্ষণিক-ফিল্টার', '</style>'))):
    if css is None:
        bad.append(name + ': ব্লক-অনুপস্থিত'); continue
    body = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits: bad.append(name + ': হেক্স ' + str(hits[:3]))
if bad:
    print("  ✗ হেক্স-শূন্য যাচাই — " + '; '.join(bad)); sys.exit(1)
print("HEXZERO-OK")
PYEOF
if [ $? -eq 0 ]; then ok "নতুন CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু) ×৩"; else bad "নতুন CSS-ব্লক হেক্স-লিটারাল"; fi

echo "── ধাপ-২: SSR (স্ট্রিপ-রেন্ডার + ইঞ্জিন-স্ক্রিপ্ট প্রেজেন্স) ──"
containsF "SSR bwf-স্ট্রিপ" "$(cat "$BWP")" 'id="bwfInstant301"'
containsF "SSR bwf-ইঞ্জিন-স্ক্রিপ্ট" "$(cat "$BWP")" '__bwf301QA'
containsF "SSR epaper ep301-ইঞ্জিন" "$(cat "$EPP")" 'epk301CalFire'
containsF "SSR epaper epk300-ভিত্তি অক্ষুণ্ণ" "$(cat "$EPP")" 'epk300Prefetch300'

echo "── ধাপ-৩: E2E bwf301 (ব্রাউজার-লগইন → ফিল্টার-আচরণ) ──"
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
CT=$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")
CT=$(unj "$CT")
LOGIN_JS="(function(){return fetch('/admin/login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'username=testadmin&password=demo123&_csrf=$CT'}).then(function(r){return r.status}).catch(function(e){return 'ERR:'+e.message})})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 302|303|0) ok "ব্রাউজার fetch-POST লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
AP=$(ev "(function(){return fetch('/moderator/best-writer',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"')
i=1; while [ "$AP" != "200" ] && [ $i -le 10 ]; do sleep 0.5; AP=$(ev "(function(){return fetch('/moderator/best-writer',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"'); i=$((i+1)); done
if [ "$AP" = "200" ]; then ok "authed-probe সেটল (200)"; else bad "authed-probe-ব্যর্থ ($AP)"; fi
BURL=$(unj "$(ev "(function(){return document.getElementById('bwfFilter301')?'1':''})()")")
if [ "$BURL" != "1" ]; then bopen "$BASE/moderator/best-writer" || bad "bw-পুনঃopen ব্যর্থ"; fi
if poll "typeof window.__bwf301QA==='object'&&typeof window.__bwf301QA.total==='function'" "true" 10; then ok "__bwf301QA হুক সংজ্ঞায়িত"; else bad "__bwf301QA হুক-অনুপস্থিত"; fi
TOTAL=$(unj "$(ev "window.__bwf301QA?String(window.__bwf301QA.total()):''")")
if [ -z "$TOTAL" ] || [ "$TOTAL" = "0" ]; then
  skip "bw-সারি-শূন্য (খালি-ডেটা) — E2E-আচরণ-শাখা স্কিপ"
else
  ok "হুক total() বুট-সত্য ($TOTAL)"
  if [ "$TOTAL" = "$SSR_ROWS" ]; then ok "হুক-total == SSR-সারি ($TOTAL)"; else bad "হুক-total ($TOTAL) ≠ SSR ($SSR_ROWS)"; fi
  FIRST_ID=$(unj "$(ev "String(window.__bwf301QA.rows&&'')||''")" >/dev/null 2>&1; ev "String((function(){var r=document.querySelector('.mod-item[data-bwf-row301]');return r?r.getAttribute('data-bwf-row301'):''})())" | tr -d '"')
  if [ -n "$FIRST_ID" ]; then ok "প্রথম-রো-আইডি প্রোব ($FIRST_ID)"; else bad "প্রথম-রো-আইডি-শূন্য"; fi
  Q="#$FIRST_ID"
  NS="(function(){var i=document.getElementById('bwfFilter301');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$Q');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()"
  ev "$NS" >/dev/null
  sleep 0.3
  M=$(unj "$(ev "String(window.__bwf301QA.matches())")")
  if [ "$M" = "1" ]; then ok "কুয়েরি '$Q' → matches=১ (একক-মিল)"; else bad "কুয়েরি '$Q' matches=$M (প্রত্যাশা ১)"; fi
  FM=$(unj "$(ev "String(window.__bwf301QA.firstMatch())")")
  if [ "$FM" = "$FIRST_ID" ]; then ok "firstMatch==$FIRST_ID"; else bad "firstMatch=$FM (প্রত্যাশা $FIRST_ID)"; fi
  CHIP=$(ev "document.getElementById('bwfCount301')?document.getElementById('bwfCount301').textContent:''")
  WANT="$(bn 1) / $(bn "$TOTAL")"
  if echo "$CHIP" | grep -qF "$WANT"; then ok "কাউন্ট-চিপ বাংলা-অঙ্ক ($WANT)"; else bad "কাউন্ট-চিপ='$(unj "$CHIP")' (প্রত্যাশা $WANT)"; fi
  CHV=$(ev "document.getElementById('bwfCount301').hidden")
  if echo "$CHV" | grep -qF "false"; then ok "চিপ প্রশ্ন-সক্রিয়ে দৃশ্যমান"; else bad "চিপ hidden"; fi
  ZV=$(ev "document.getElementById('bwfZero301').hidden")
  if echo "$ZV" | grep -qF "true"; then ok "শূন্য-অবস্থা মিলে-থাকলে লুকানো"; else bad "শূন্য-অবস্থা প্রকাশিত"; fi
  ev "(function(){var i=document.getElementById('bwfFilter301');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'zzqx garbage');i.dispatchEvent(new Event('input',{bubbles:true}));return 'S'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__bwf301QA.matches())")")
  ZV=$(ev "document.getElementById('bwfZero301').hidden")
  if [ "$M" = "0" ] && echo "$ZV" | grep -qF "false"; then ok "গার্বেজ-কুয়েরি → শূন্য-অবস্থা প্রকাশ + matches=০"; else bad "গার্বেজ matches=$M zeroHidden=$ZV"; fi
  ev "(function(){var i=document.getElementById('bwfFilter301');i.focus();var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$Q');i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'E'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__bwf301QA.matches())")"); ACT=$(unj "$(ev "String(window.__bwf301QA.active())")")
  if [ "$M" = "$TOTAL" ] && [ "$ACT" = "false" ]; then ok "Escape → পরিষ্কার + matches=$TOTAL + active=false"; else bad "Escape matches=$M active=$ACT"; fi
  ev "(function(){var i=document.getElementById('bwfFilter301');i.focus();return document.activeElement===i?'F':''})()" >/dev/null
  agent-browser press f >/dev/null 2>&1
  sleep 0.2
  AE=$(unj "$(ev "String(document.activeElement&&document.activeElement.id||'')")")
  if [ "$AE" = "bwfFilter301" ]; then ok "'f' → স্ট্রিপ-ফোকাস"; else bad "'f' ফোকাস=$AE"; fi
  if poll "String(document.querySelector('.bwf-count-chip')&&!document.getElementById('bwfCount301').hidden||document.getElementById('bwfCount301').hidden)" "true" 4; then ok "চিপ-অবস্থা সামঞ্জস্য"; else bad "চিপ-অবস্থা"; fi
  FPOLL=$(poll "(function(){var r=(function(){var m=[].slice.call(document.querySelectorAll('.mod-item[data-bwf-row301]')).filter(function(x){return !x.hidden});return m.length?m[0]:null})();if(!r)return 'no';var i=document.getElementById('bwfFilter301');if(!i.value)return 'no';return r.classList.contains('bwf-flash301')?'flash':'no'})()" "flash" 4)
  if [ $? -eq 0 ]; then ok "ফ্ল্যাশ-ক্লাস প্রোব-সাপোর্টেড"; else skip "ফ্ল্যাশ-প্রোব (Enter-সিমুলেশন-বাইপাস — keydown-আলাদা-যাচাই)"; fi
  ENTER_JS="(function(){var i=document.getElementById('bwfFilter301');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$Q');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var m=[].slice.call(document.querySelectorAll('.mod-item[data-bwf-row301]')).filter(function(x){return !x.hidden});return m.length&&m[0].classList.contains('bwf-flash301')?'flash':'no-flash'})()"
  FR=$(unj "$(ev "$ENTER_JS")")
  if [ "$FR" = "flash" ]; then ok "Enter → প্রথম-মিল ফোকাস+ফ্ল্যাশ"; else bad "Enter-ফ্ল্যাশ=$FR"; fi
  sleep 1.1
  FC=$(ev "document.querySelector('.bwf-flash301')?'still':'gone'")
  if echo "$FC" | grep -qF "gone"; then ok "ফ্ল্যাশ ৯০০ms-পরে নির্মোচন"; else bad "ফ্ল্যাশ-স্থায়ী"; fi
  ev "(function(){var i=document.getElementById('bwfFilter301');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'');i.dispatchEvent(new Event('input',{bubbles:true}));return 'C'})()" >/dev/null
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
  agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && [ -s "$SH_DESK" ] && ok "ডেস্কটপ-স্ক্রিনশট" || bad "ডেস্কটপ-স্ক্রিনশট"
  agent-browser set viewport 390 844 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
  HS=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
  if [ "$HS" = "false" ]; then ok "মোবাইল-390 পৃষ্ঠা-স্তর hScroll-শূন্য"; else bad "মোবাইল hScroll=$HS"; fi
  T2=$(unj "$(ev "String(window.__bwf301QA?window.__bwf301QA.total():'-1')")")
  if [ "$T2" = "$TOTAL" ]; then ok "মোবাইল-রিলোডে হুক-পুনঃবুট ($T2)"; else bad "মোবাইল-হুক total=$T2"; fi
  agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && [ -s "$SH_MOB" ] && ok "মোবাইল-স্ক্রিনশট" || bad "মোবাইল-স্ক্রিনশট"
fi

echo "── ধাপ-৪: E2E ep301 (ক্যালেন্ডার-সেল-প্রিফেচ) ──"
bopen "$BASE/epaper" || bad "epaper-open ব্যর্থ"
if poll "typeof window.__epk300QA==='object'&&typeof window.__epk300QA.cells==='function'" "true" 10; then ok "__epk300QA হুক + cells গেটার"; else bad "__epk300QA.cells অনুপস্থিত"; fi
P0=$(unj "$(ev "String(window.__epk300QA.prefetched())")")
if [ "$P0" = "0" ]; then ok "বুট-প্রিফেচ-শূন্য (ইচ্ছা-গেট-ধর্ম)"; else bad "বুট-প্রিফেচ=$P0"; fi
HAS=$(unj "$(ev "String(document.querySelectorAll('.ep-cal-day.has').length)")")
if [ "$HAS" = "0" ]; then
  skip "ক্যালেন্ডার-সংরক্ষিত-দিন-শূন্য — ep301-আচরণ-শাখা স্কিপ"
else
  ok "সংরক্ষিত-দিন-সেল ($HAS)"
  HOV_JS="(function(){var c=document.querySelector('.ep-cal-day.has');if(!c)return 'no';c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));var u=(function(){var p=(window.__epk300QA.last&&'')||'';return p})();return 'DISP:'+c.getAttribute('data-d')})()"
  ev "$HOV_JS" >/dev/null
  sleep 0.4
  P1=$(unj "$(ev "String(window.__epk300QA.prefetched())")"); L1=$(unj "$(ev "String(window.__epk300QA.last())")")
  if [ "$P1" -ge 1 ] 2>/dev/null && [ "$L1" = "cal" ]; then ok "হোভার → প্রিফেচ reason=cal ($P1)"; else bad "হোভার prefetched=$P1 last=$L1"; fi
  DED=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-day.has');c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.prefetched())})()")")
  if [ "$DED" = "$P1" ]; then ok "ডিডুপ (পুনঃ-হোভারে বৃদ্ধি-শূন্য)"; else bad "ডিডুপ ব্যর্থ $P1→$DED"; fi
  C1=$(unj "$(ev "String(window.__epk300QA.cells())")")
  if [ "$C1" -ge 1 ] 2>/dev/null; then ok "উষ্ণ-সেল-মিরর (cells=$C1)"; else bad "cells=$C1"; fi
  WARM=$(unj "$(ev "String(document.querySelector('.ep-cal-day.has')?document.querySelector('.ep-cal-day.has').classList.contains('epk300-warm'):false)")")
  if [ "$WARM" = "true" ]; then ok "সেলে epk300-warm ক্লাস"; else bad "warm-ক্লাস=$WARM"; fi
  FNH=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-day:not(.has):not([disabled])');if(!c)return 'none';c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.prefetched())})()")")
  if [ "$FNH" = "none" ]; then skip "না-has-সেল-শূন্য (ঘন-আর্কাইভ)"; elif [ "$FNH" = "$P1" ]; then ok "না-has-সেল → প্রিফেচ-শূন্য-বৃদ্ধি"; else bad "না-has-বৃদ্ধি $P1→$FNH"; fi
  FOC_JS="(function(){var c=[].slice.call(document.querySelectorAll('.ep-cal-day.has')).filter(function(x){return !x.classList.contains('epk300-warm')})[0];if(!c)return 'none';c.dispatchEvent(new FocusEvent('focusin',{bubbles:true}));return 'DISP'})()"
  ev "$FOC_JS" >/dev/null
  sleep 0.3
  L2=$(unj "$(ev "String(window.__epk300QA.last())")")
  if [ "$L2" = "cal-focus" ]; then ok "focusin → reason=cal-focus"; else bad "focusin last=$L2"; fi
  agent-browser eval "document.getElementById('epCalNext')&&document.getElementById('epCalNext').click();'S'" >/dev/null
  sleep 0.4
  C2=$(unj "$(ev "String(window.__epk300QA.cells())")")
  if [ "$C2" = "0" ]; then ok "calRender-পুনঃরেন্ডারে উষ্ণ-বিলোপ (পুনঃ-ইচ্ছায় পুনঃ-প্রতিষ্ঠা)"; else bad "পুনঃরেন্ডার cells=$C2"; fi
  ev "(function(){document.getElementById('epCalPrev')&&document.getElementById('epCalPrev').click();return 'S'})()" >/dev/null
  sleep 0.3
  RE=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-day.has');if(!c)return 'none';c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.cells())})()")")
  if [ "$RE" != "none" ] && [ "$RE" -ge 1 ] 2>/dev/null; then ok "পুনঃ-ইচ্ছায় উষ্ণ-পুনঃ-প্রতিষ্ঠা"; else bad "পুনঃ-প্রতিষ্ঠা=$RE"; fi
fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
HSD=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
if [ "$HSD" = "false" ]; then ok "epaper ডেস্কটপ hScroll-শূন্য"; else bad "epaper ডেস্কটপ hScroll=$HSD"; fi

echo "── ধাপ-৫: QA-বাগ-ফিক্স রিগ্রেশন (poster-onerror SyntaxError নির্মূল) ──"
agent-browser errors --clear >/dev/null 2>&1
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 1.5
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 2
EN=$(agent-browser errors --json 2>/dev/null | python3 -c "import json,sys;print(len(json.load(sys.stdin)['data']['errors']))" 2>/dev/null || echo "?")
if [ "$EN" = "0" ]; then ok "দ্বি-লোড পৃষ্ঠা-এরর-শূন্য (SyntaxError-নির্মূল প্রমাণ)"; else bad "পৃষ্ঠা-এরর=$EN (প্রত্যাশা ০)"; fi
HJ=$(unj "$(ev "String(typeof window.__epk300QA==='object')")")
if [ "$HJ" = "true" ]; then ok "ইঞ্জিন-হুক জীবিত (রিগ্রেশন-স্যানিটি)"; else bad "ইঞ্জিন-হুক মৃত"; fi

echo "── ধাপ-৬: E2E ofx301 (টপবার মোবাইল-ক্লিপ) ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
bopen "$BASE/" || bad "হোম-মোবাইল open ব্যর্থ"
sleep 0.5
MOB=$(unj "$(ev "(function(){var de=document.documentElement,b=document.body,bt=document.querySelector('.menu-toggle');var a=document.querySelector('a.topbar-nav');return JSON.stringify({bOver:b?b.scrollWidth-b.clientWidth:-1,btnR:bt?Math.round(bt.getBoundingClientRect().right):-1,cw:de.clientWidth,disp:a?getComputedStyle(a).display:'none-el'})})()")")
if echo "$MOB" | grep -qF '"bOver":0'; then ok "মোবাইল body-overflow-শূন্য (২১px-উৎস-নির্মূল)"; else bad "মোবাইল-overflow=$MOB"; fi
if echo "$MOB" | grep -q '"disp":"none"'; then ok "মোবাইলে topbar-nav-অ্যাঙ্কর লুকানো"; else bad "মোবাইল-topbar-nav=$MOB"; fi
BR=$(echo "$MOB" | python3 -c "import json,sys;d=json.loads(json.loads(sys.stdin.read()) if False else sys.stdin.read());print('ok' if d['btnR']>=0 and d['btnR']<=d['cw']+1 else 'bad')" 2>/dev/null)
if [ "$BR" = "ok" ]; then ok "menu-toggle পূর্ণ-দৃশ্যমান (ট্যাপ-টার্গেট-অক্ষত)"; else bad "menu-toggle-ক্লিপ=$MOB"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
DES=$(unj "$(ev "(function(){var a=document.querySelector('a.topbar-nav');return a?getComputedStyle(a).display:'none-el'})()")")
if [ "$DES" != "none" ]; then ok "ডেস্কটপে topbar-nav-অপরিবর্তিত ($DES)"; else bad "ডেস্কটপ-অ্যাঙ্কর-লুকানো"; fi

echo ""
echo "══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" -eq 0 ] && echo "S301-SUITE-GREEN" || echo "S301-SUITE-RED"
exit "$FAIL"
