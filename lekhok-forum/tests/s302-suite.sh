#!/bin/bash
# s302-suite.sh — session302: ① dqf302 /moderator/daily/:type তাৎক্ষণিক-ফিল্টার E2E (**checked-pinned
#                চুক্তি** — চেক-করা-সারি-সর্বদা-দৃশ্যমান → bulk-delete-হিডেন-ঝুঁকি-শূন্য; bulk-all-পথ-সহ)
#                ② ep302 মাস-প্যানেল-কোষ-ইচ্ছা-প্রিফেচ E2E (quiet-window — panel-open arm-focus-সাপ্রেস)
#                ③ s301-রিগ্রেশন-স্যানিটি (bwf হুক + দ্বি-লোড এরর-শূন্য)
# চুক্তি: fetch-POST লগইন তিন-শাখা (session297) + authed-probe-সেটল-পোল + bopen-রিট্রাই+ডেমন-রিসাইকেল +
#         unj() (s294) + native-setter+input-event (s300) + bn() pure-bash (s298) + রেন্ডার্ড-মার্কআপ-প্রত্যাশা
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
J=/tmp/s302-jar.txt
DFQ=/tmp/s302-df-quiz.html
DFE=/tmp/s302-df-epaper.html
EPP=/tmp/s302-ep-page.html
SH_DESK=/home/z/my-project/download/s302-dqf-desk.png
SH_MOB=/home/z/my-project/download/s302-dqf-mobile390.png
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
setq(){
  # native-setter + input-event (s300-গোটচা)
  ev "(function(){var i=document.getElementById('dqfFilter302');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null
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
QC=$(curl -s -o "$DFQ" -w "%{http_code}" -b "$J" "$BASE/moderator/daily/quiz")
if [ "$QC" = "200" ]; then ok "daily/quiz পৃষ্ঠা 200"; else bad "daily/quiz HTTP $QC"; fi
EC=$(curl -s -o "$DFE" -w "%{http_code}" -b "$J" "$BASE/moderator/daily/epaper")
if [ "$EC" = "200" ]; then ok "daily/epaper পৃষ্ঠা 200"; else bad "daily/epaper HTTP $EC"; fi
PC=$(curl -s -o "$EPP" -w "%{http_code}" "$BASE/epaper")
if [ "$PC" = "200" ]; then ok "epaper পৃষ্ঠা 200"; else bad "epaper HTTP $PC"; fi
SSR_ROWS=$(grep -cF 'data-dqf-row302=' "$DFQ" || true)
if [ "$SSR_ROWS" -ge 1 ]; then ok "SSR-সারি quiz ($SSR_ROWS)"; else skip "SSR-সারি-শূন্য (খালি-ডেটা — E2E-শাখা স্কিপ)"; fi

echo "── ধাপ-১: কাঠামো (dqf302 + ep302 + [Mandatory-স্টাইল]) ──"
DFV=$(cat "$APP/views/user/moderator-daily-form.ejs")
containsF "dqf302 স্ট্রিপ-ইনপুট" "$DFV" 'id="dqfFilter302"'
containsF "dqf302 কাউন্ট-চিপ" "$DFV" 'id="dqfCount302"'
containsF "dqf302 শূন্য-অবস্থা" "$DFV" 'id="dqfZero302"'
containsF "dqf302 রো-মার্ক" "$DFV" 'data-dqf-row302="'
containsF "dqf302 হুক" "$DFV" 'window.__dqf302QA'
containsF "dqf302 checked-pinned চুক্তি" "$DFV" 'var pinned302 = !!(cb302 && cb302.checked);'
containsF "dqf302 change-ডেলিগেশন (bulk-all-পথ)" "$DFV" "e302.target.matches('input[name=\"bulk_ids\"],[data-bulk-all]')"
containsF "dqf302 boot-apply-init" "$DFV" 'dqfApply302(); /* boot-apply-init'
containsF "dqf302 hidden-গার্ড" "$DFV" '.mod-item[data-dqf-row302][hidden] { display: none !important; }'
EJV=$(cat "$APP/views/user/epaper.ejs")
containsF "ep302 মাস-ফায়ার-ফানেল" "$EJV" 'var ep302MonFire = function (cell302, reason302)'
containsF "ep302 has+disabled-গেট" "$EJV" "if (!cell302.classList.contains('has') || cell302.disabled) return;"
containsF "ep302 মাউস-ট্রিগার" "$EJV" "ep302MonFire(c302, 'mon');"
containsF "ep302 ফোকাস-ট্রিগার + quiet-গার্ড" "$EJV" 'if (ep302Quiet302) return; /* panel-open arm-focus-সাপ্রেস'
containsF "ep302 wrapper (quiet-window)" "$EJV" 'ep283OpenPanel = function () { ep302Quiet302 = true; ep302OpenBase302(); ep302Quiet302 = false; };'
containsF "ep302 ক্লিক-কনভেনশন-মিরর" "$EJV" "var first302 = Object.keys(byDate).filter(function (iso302) { return String(iso302).indexOf(pre302) === 0; }).sort()[0];"
containsF "ep302 হুক-months গেটার" "$EJV" "months: function () { try { return document.querySelectorAll('.ep-cal-m.epk300-warm').length;"
EPC=$(cat "$APP/public/assets/css/epaper.css")
containsF "epaper.css session302 ব্লক" "$EPC" "session302 — মাস-প্যানেল উষ্ণ-সংকেত"
containsF "উষ্ণ-মাস-কোষ রিং (is-cur-অস্পৃশ্য)" "$EPC" ".ep-cal-m.epk300-warm:not(.is-cur)"
containsF "epaper.css reduced-motion গার্ড" "$EPC" "prefers-reduced-motion: reduce"
python3 - <<'PYEOF'
import re, sys
def blk(text, start_marker, end_marker):
    i = text.find(start_marker)
    if i < 0: return None
    if end_marker is None: return text[i:]
    j = text.find(end_marker, i)
    return text[i:j] if j > 0 else text[i:]
ep = open('public/assets/css/epaper.css', encoding='utf-8').read()
df = open('views/user/moderator-daily-form.ejs', encoding='utf-8').read()
bad = []
for name, css in (('epaper-session302', blk(ep, 'session302 — মাস-প্যানেল', None)),
                  ('dqf302', blk(df, 'session302 — দৈনিক-পোস্ট', '</style>'))):
    if css is None:
        bad.append(name + ': ব্লক-অনুপস্থিত'); continue
    body = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits: bad.append(name + ': হেক্স ' + str(hits[:3]))
if bad:
    print("  ✗ হেক্স-শূন্য যাচাই — " + '; '.join(bad)); sys.exit(1)
print("HEXZERO-OK")
PYEOF
if [ $? -eq 0 ]; then ok "নতুন CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু) ×২"; else bad "নতুন CSS-ব্লক হেক্স-লিটারাল"; fi

echo "── ধাপ-২: SSR (স্ট্রিপ-রেন্ডার + ইঞ্জিন-প্রেজেন্স) ──"
containsF "SSR dqf-স্ট্রিপ (quiz)" "$(cat "$DFQ")" 'id="dqfInstant302"'
containsF "SSR dqf-ইঞ্জিন (quiz)" "$(cat "$DFQ")" '__dqf302QA'
containsF "SSR dqf-স্ট্রিপ (epaper-ধরন)" "$(cat "$DFE")" 'id="dqfInstant302"'
containsF "SSR epaper ep302-ইঞ্জিন" "$(cat "$EPP")" 'ep302MonFire'
containsF "SSR epaper ep301-ভিত্তি অক্ষুণ্ণ" "$(cat "$EPP")" 'epk301CalFire'

echo "── ধাপ-৩: E2E dqf302 (ব্রাউজার-লগইন → ফিল্টার+পিন-আচরণ) ──"
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
CT=$(unj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){return fetch('/admin/login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'username=testadmin&password=demo123&_csrf=$CT'}).then(function(r){return r.status}).catch(function(e){return 'ERR:'+e.message})})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 302|303|0) ok "ব্রাউজার fetch-POST লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
AP=$(ev "(function(){return fetch('/moderator/daily/quiz',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"')
i=1; while [ "$AP" != "200" ] && [ $i -le 10 ]; do sleep 0.5; AP=$(ev "(function(){return fetch('/moderator/daily/quiz',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"'); i=$((i+1)); done
if [ "$AP" = "200" ]; then ok "authed-probe সেটল (200)"; else bad "authed-probe-ব্যর্থ ($AP)"; fi
if [ "$(unj "$(ev "document.getElementById('dqfFilter302')?'1':''")")" != "1" ]; then bopen "$BASE/moderator/daily/quiz" || bad "dq-পুনঃopen ব্যর্থ"; fi
if poll "typeof window.__dqf302QA==='object'&&typeof window.__dqf302QA.pinned==='function'" "true" 10; then ok "__dqf302QA হুক (pinned-সহ) সংজ্ঞায়িত"; else bad "__dqf302QA হুক-অনুপস্থিত"; fi
TOTAL=$(unj "$(ev "window.__dqf302QA?String(window.__dqf302QA.total()):''")")
if [ -z "$TOTAL" ] || [ "$TOTAL" = "0" ]; then
  skip "dq-সারি-শূন্য (খালি-ডেটা) — E2E-আচরণ-শাখা স্কিপ"
else
  ok "হুক total() বুট-সত্য ($TOTAL)"
  if [ "$TOTAL" = "$SSR_ROWS" ]; then ok "হুক-total == SSR-সারি ($TOTAL)"; else bad "হুক-total ($TOTAL) ≠ SSR ($SSR_ROWS)"; fi
  R2=$(unj "$(ev "String((function(){var rs=document.querySelectorAll('.mod-item[data-dqf-row302]');return rs.length>1?rs[1].getAttribute('data-dqf-row302'):''})())")")
  if [ -n "$R2" ]; then ok "দ্বিতীয়-রো-আইডি প্রোব ($R2)"; else bad "দ্বিতীয়-রো-আইডি-শূন্য"; fi
  Q="#$R2"
  setq "$Q"; sleep 0.3
  M=$(unj "$(ev "String(window.__dqf302QA.matches())")")
  if [ "$M" = "1" ]; then ok "কুয়েরি '$Q' → matches=১"; else bad "কুয়েরি matches=$M (প্রত্যাশা ১)"; fi
  CHIP=$(ev "document.getElementById('dqfCount302')?document.getElementById('dqfCount302').textContent:''")
  WANT="$(bn 1) / $(bn "$TOTAL")"
  if echo "$CHIP" | grep -qF "$WANT"; then ok "কাউন্ট-চিপ বাংলা-অঙ্ক ($WANT)"; else bad "চিপ='$(unj "$CHIP")' (প্রত্যাশা $WANT)"; fi
  ev "(function(){var rs=document.querySelectorAll('.mod-item[data-dqf-row302]');var cb=rs[1].querySelector('input[name=\"bulk_ids\"]');cb.click();return 'CHK'})()" >/dev/null
  sleep 0.3
  P=$(unj "$(ev "String(window.__dqf302QA.pinned())")")
  if [ "$P" = "1" ]; then ok "চেক-ক্লিক → pinned=১"; else bad "pinned=$P (প্রত্যাশা ১)"; fi
  setq "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__dqf302QA.matches())")")
  ZV=$(ev "document.getElementById('dqfZero302').hidden")
  if [ "$M" = "1" ] && echo "$ZV" | grep -qF "true"; then ok "গার্বেজ-কুয়েরিতে-ও চেক-সারি-পিনড (matches=১, শূন্য-লুকানো)"; else bad "পিন-ব্যর্থ matches=$M zeroHidden=$ZV"; fi
  HID=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-dqf-row302]'));var r=rs.filter(function(x){return x.getAttribute('data-dqf-row302')==='$R2'})[0];return r?!r.hidden:'no'})())")")
  if [ "$HID" = "true" ]; then ok "পিনড-সারি প্রকৃত-দৃশ্যমান (hidden=false)"; else bad "পিনড-দৃশ্যমানতা=$HID"; fi
  ev "(function(){var rs=document.querySelectorAll('.mod-item[data-dqf-row302]');rs[1].querySelector('input[name=\"bulk_ids\"]').click();return 'UNCHK'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__dqf302QA.matches())")")
  ZV=$(ev "document.getElementById('dqfZero302').hidden")
  if [ "$M" = "0" ] && echo "$ZV" | grep -qF "false"; then ok "আনচেকে পিন-মুক্ত (matches=০ + শূন্য-প্রকাশ)"; else bad "আনচেক matches=$M zeroHidden=$ZV"; fi
  setq "zzqx garbage"
  ev "(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'ALL'})()" >/dev/null
  sleep 0.3
  M=$(unj "$(ev "String(window.__dqf302QA.matches())")")
  P=$(unj "$(ev "String(window.__dqf302QA.pinned())")")
  if [ "$M" = "$TOTAL" ] && [ "$P" = "$TOTAL" ]; then ok "bulk-all → সর্ব-পিন (matches=$TOTAL=$TOTAL)"; else bad "bulk-all matches=$M pinned=$P (প্রত্যাশা $TOTAL/$TOTAL)"; fi
  HIDN=$(unj "$(ev "String([].slice.call(document.querySelectorAll('.mod-item[data-dqf-row302]')).filter(function(x){return x.hidden}).length)")")
  if [ "$HIDN" = "0" ]; then ok "bulk-all-পথে হিডেন-সারি-শূন্য (bulk-ঝুঁকি-নির্মূল প্রমাণ)"; else bad "হিডেন-সারি=$HIDN"; fi
  ev "(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'UNALL'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__dqf302QA.matches())")")
  P=$(unj "$(ev "String(window.__dqf302QA.pinned())")")
  if [ "$M" = "0" ] && [ "$P" = "0" ]; then ok "bulk-all-আনচেক → পিন-শূন্য"; else bad "আন-অল matches=$M pinned=$P"; fi
  ENTER_JS="(function(){var i=document.getElementById('dqfFilter302');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$Q');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var m=[].slice.call(document.querySelectorAll('.mod-item[data-dqf-row302]')).filter(function(x){return !x.hidden});var cb=m.length?m[0].querySelector('input[name=\"bulk_ids\"]'):null;return (m.length&&m[0].classList.contains('dqf-flash302')&&cb&&document.activeElement===cb)?'flash+focus':'no'})()"
  FR=$(unj "$(ev "$ENTER_JS")")
  if [ "$FR" = "flash+focus" ]; then ok "Enter → প্রথম-মিল চেকবক্স-ফোকাস+ফ্ল্যাশ"; else bad "Enter=$FR"; fi
  sleep 1.1
  FC=$(ev "document.querySelector('.dqf-flash302')?'still':'gone'")
  if echo "$FC" | grep -qF "gone"; then ok "ফ্ল্যাশ ৯০০ms-পরে নির্মোচন"; else bad "ফ্ল্যাশ-স্থায়ী"; fi
  setq ""; sleep 0.2
  ev "(function(){var i=document.getElementById('dqfFilter302');i.focus();return 'F'})()" >/dev/null
  agent-browser press f >/dev/null 2>&1
  sleep 0.2
  AE=$(unj "$(ev "String(document.activeElement&&document.activeElement.id||'')")")
  if [ "$AE" = "dqfFilter302" ]; then ok "'f' → স্ট্রিপ-ফোকাস"; else bad "'f' ফোকাস=$AE"; fi
  setq ""; sleep 0.2
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
  agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && [ -s "$SH_DESK" ] && ok "ডেস্কটপ-স্ক্রিনশট" || bad "ডেস্কটপ-স্ক্রিনশট"
  agent-browser set viewport 390 844 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
  HS=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
  if [ "$HS" = "false" ]; then ok "মোবাইল-390 পৃষ্ঠা-স্তর hScroll-শূন্য"; else bad "মোবাইল hScroll=$HS"; fi
  T2=$(unj "$(ev "String(window.__dqf302QA?window.__dqf302QA.total():'-1')")")
  if [ "$T2" = "$TOTAL" ]; then ok "মোবাইল-রিলোডে হুক-পুনঃবুট ($T2)"; else bad "মোবাইল-হুক total=$T2"; fi
  agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && [ -s "$SH_MOB" ] && ok "মোবাইল-স্ক্রিনশট" || bad "মোবাইল-স্ক্রিনশট"
fi

echo "── ধাপ-৪: E2E ep302 (মাস-প্যানেল-প্রিফেচ + quiet-window) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
bopen "$BASE/epaper" || bad "epaper-open ব্যর্থ"
if poll "typeof window.__epk300QA==='object'&&typeof window.__epk300QA.months==='function'" "true" 10; then ok "__epk300QA.months গেটার সংজ্ঞায়িত"; else bad "months-গেটার-অনুপস্থিত"; fi
P0=$(unj "$(ev "String(window.__epk300QA.prefetched())")")
if [ "$P0" = "0" ]; then ok "বুট-প্রিফেচ-শূন্য (ইচ্ছা-গেট-ধর্ম)"; else bad "বুট-প্রিফেচ=$P0"; fi
OPEN_JS="(function(){var mb=document.getElementById('epCalMonth');mb.click();var mp=document.getElementById('epCalMPanel');return JSON.stringify({open:mp?!mp.hidden:false,p:window.__epk300QA.prefetched()})})()"
OR=$(unj "$(ev "$OPEN_JS")")
if echo "$OR" | grep -qF '"open":true' && echo "$OR" | grep -qF '"p":0'; then ok "প্যানেল-খোলা + **quiet-window** (arm-ফোকাসে-প্রিফেচ-শূন্য)"; else bad "প্যানেল/quiet=$OR"; fi
HAS=$(unj "$(ev "String(document.querySelectorAll('.ep-cal-m.has').length)")")
if [ "$HAS" = "0" ]; then
  skip "মাস-প্যানেল has-কোষ-শূন্য — ep302-আচরণ-শাখা স্কিপ"
else
  ok "তথ্য-আছে মাস-কোষ ($HAS)"
  HOV_JS="(function(){var c=document.querySelector('.ep-cal-m.has');c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return 'DISP:'+c.getAttribute('data-m')})()"
  ev "$HOV_JS" >/dev/null
  sleep 0.4
  P1=$(unj "$(ev "String(window.__epk300QA.prefetched())")"); L1=$(unj "$(ev "String(window.__epk300QA.last())")")
  if [ "$P1" -ge 1 ] 2>/dev/null && [ "$L1" = "mon" ]; then ok "হোভার → প্রিফেচ reason=mon ($P1)"; else bad "হোভার prefetched=$P1 last=$L1"; fi
  DED=$(unj "$(ev "(function(){document.querySelector('.ep-cal-m.has').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.prefetched())})()")")
  if [ "$DED" = "$P1" ]; then ok "ডিডুপ (পুনঃ-হোভারে বৃদ্ধি-শূন্য)"; else bad "ডিডুপ $P1→$DED"; fi
  MO=$(unj "$(ev "String(window.__epk300QA.months())")")
  if [ "$MO" -ge 1 ] 2>/dev/null; then ok "উষ্ণ-মাস-মিরর (months=$MO)"; else bad "months=$MO"; fi
  WARM=$(unj "$(ev "String(document.querySelector('.ep-cal-m.has').classList.contains('epk300-warm'))")")
  if [ "$WARM" = "true" ]; then ok "মাস-কোষে epk300-warm ক্লাস"; else bad "warm=$WARM"; fi
  if [ "$HAS" -ge 2 ]; then
    FOC_JS="(function(){var c=[].slice.call(document.querySelectorAll('.ep-cal-m.has')).filter(function(x){return !x.classList.contains('epk300-warm')})[0];if(!c)return 'none';c.focus();return 'DISP'})()"
    ev "$FOC_JS" >/dev/null
    sleep 0.3
    L2=$(unj "$(ev "String(window.__epk300QA.last())")")
    if [ "$L2" = "mon-focus" ]; then ok "ব্যবহারকারী-ফোকাস → reason=mon-focus (quiet-পরে)"; else bad "focusin last=$L2"; fi
  else
    skip "একক has-মাস — focusin-আলাদা-যাচাই-স্কিপ (ডিডুপ-আচরণ-সঠিক)"
  fi
  ev "(function(){var n=document.getElementById('epCalMYNext');if(n)n.click();return 'S'})()" >/dev/null
  sleep 0.4
  MO=$(unj "$(ev "String(window.__epk300QA.months())")")
  if [ "$MO" = "0" ]; then ok "ep283Render-পুনঃরেন্ডারে উষ্ণ-বিলোপ"; else bad "পুনঃরেন্ডার months=$MO"; fi
  ev "(function(){var p=document.getElementById('epCalMYPrev');if(p)p.click();return 'S'})()" >/dev/null
  sleep 0.3
  RE=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-m.has');if(!c)return 'none';c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.months())})()")")
  if [ "$RE" != "none" ] && [ "$RE" -ge 1 ] 2>/dev/null; then ok "পুনঃ-ইচ্ছায় উষ্ণ-পুনঃ-প্রতিষ্ঠা"; else bad "পুনঃ-প্রতিষ্ঠা=$RE"; fi
fi

echo "── ধাপ-৫: s301-রিগ্রেশন-স্যানিটি ──"
agent-browser errors --clear >/dev/null 2>&1
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 1.5
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 2
EN=$(agent-browser errors --json 2>/dev/null | python3 -c "import json,sys;print(len(json.load(sys.stdin)['data']['errors']))" 2>/dev/null || echo "?")
if [ "$EN" = "0" ]; then ok "epaper দ্বি-লোড এরর-শূন্য (poster-ফিক্স-ধারাবাহিক)"; else bad "পৃষ্ঠা-এরর=$EN"; fi
bopen "$BASE/moderator/best-writer" >/dev/null 2>&1; sleep 1
BT=$(unj "$(ev "String(window.__bwf301QA?window.__bwf301QA.total():'-1')")")
if [ "$BT" -ge 0 ] 2>/dev/null && [ "$BT" != "-1" ]; then ok "bwf301 হুক-সহাবস্থান (total=$BT)"; else bad "bwf301 হুক=$BT"; fi

echo ""
echo "══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" -eq 0 ] && echo "S302-SUITE-GREEN" || echo "S302-SUITE-RED"
exit "$FAIL"
