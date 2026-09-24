#!/bin/bash
# s303-suite.sh — session303: ① pr303 /moderator/press — pr258-ইঞ্জিনে **checked-pinned চুক্তি পোর্ট**
#                (hit = pinned || match → bulk-delete-হিডেন-ঝুঁকি-নির্মূল; sidebar initBulkBar-সহাবস্থান —
#                hidden-ids-সিঙ্ক-প্রমাণ; bulk-all-পথ; Enter-firstMatch-চেকবক্স-অ্যাঙ্কর)
#                ② ep303 epCalYList বছর-তালিকা-কোষ-ইচ্ছা-প্রিফেচ (quiet-window — list-open arm-focus-সাপ্রেস;
#                recency-first মিরর; উষ্ণ-মিরর; পুনঃরেন্ডার-বিলোপ/পুনঃ-প্রতিষ্ঠা)
#                ③ sections (lsf298) — bulk-ফর্ম-অনুপস্থিতি-প্রমাণ (checked-pinned চুক্তি N/A — গঠনগত-নিরাপত্তা)
#                ④ epaper দ্বি-লোড এরর-শূন্য-রিগ্রেশন
# চুক্তি: fetch-POST লগইন (session297) + authed-probe-সেটল-পোল + bopen-রিট্রাই+ডেমন-রিসাইকেল +
#         unj() (s294) + native-setter+input-event (s300) + রেন্ডার্ড-মার্কআপ-প্রত্যাশা + ASCII-চিপ (s258-চুক্তি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
J=/tmp/s303-jar.txt
PRP=/tmp/s303-pr.html
SCP=/tmp/s303-sections.html
EPP=/tmp/s303-ep.html
SH_DESK=/home/z/my-project/download/s303-pr-pinned-desk.png
SH_MOB=/home/z/my-project/download/s303-pr-mobile390.png
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
  # native-setter + input-event (s300-গোটচা) — prFilter258
  ev "(function(){var i=document.getElementById('prFilter258');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null
}
HID='['h'idden]'   # বাইট-নিরাপদ গঠন — লেখনী-স্তর [h-সিকোয়েন্স-ক্ষয়-এড়ানো (s298/s299-গোটচা)
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
PC=$(curl -s -o "$PRP" -w "%{http_code}" -b "$J" "$BASE/moderator/press")
if [ "$PC" = "200" ]; then ok "moderator/press পৃষ্ঠা 200"; else bad "moderator/press HTTP $PC"; fi
SC=$(curl -s -o "$SCP" -w "%{http_code}" -b "$J" "$BASE/moderator/sections")
if [ "$SC" = "200" ]; then ok "moderator/sections পৃষ্ঠা 200"; else bad "moderator/sections HTTP $SC"; fi
EC=$(curl -s -o "$EPP" -w "%{http_code}" "$BASE/epaper")
if [ "$EC" = "200" ]; then ok "epaper পৃষ্ঠা 200"; else bad "epaper HTTP $EC"; fi
SSR_ROWS=$(grep -cF 'data-pr-row=' "$PRP" || true)
if [ "$SSR_ROWS" -ge 1 ]; then ok "SSR-সারি press ($SSR_ROWS)"; else skip "SSR-সারি-শূন্য (খালি-ডেটা — E2E-শাখা স্কিপ)"; fi

MARK="qa303press"
echo "── ধাপ-০.৫: প্রোডাকশন-প্রবাহ-সিড (মার্কার-কাটিং multipart-POST — s258-নীতি; পুনঃরান-idempotent) ──"
MARKN=$(grep -cF "$MARK" "$PRP" || true)
if [ "$MARKN" = "0" ]; then
  TOK2=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/press" \
    -H "x-csrf-token: $TOK2" \
    -F "title=$MARK প্রেস-ডেমো" -F "paper_name=qa303paper" -F "published_date=qa303date" \
    -F "sort_order=0" -F "is_active=1" -F "image_url=https://example.com/qa303press.jpg" -F "_csrf=$TOK2")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "মার্কার-কাটিং তৈরি ($CC)"; else bad "কাটিং-তৈরি ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" -c "$J" "$BASE/moderator/press" -o "$PRP"
  MARKN=$(grep -cF "$MARK" "$PRP" || true)
  if [ "$MARKN" -ge 1 ]; then ok "সিড-পরে মার্কার-রেন্ডার"; else bad "সিড-পরে-ও মার্কার-শূন্য"; fi
  SSR_ROWS=$(grep -cF 'data-pr-row=' "$PRP" || true)
else
  skip "সিড-স্কিপ (মার্কার-সারি পূর্ব-বিদ্যমান — পুনঃব্যবহার)"
fi
SID=$(awk 'BEGIN{RS="</details>"} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' "$PRP")
if [ -n "$SID" ] && [ "$SID" -gt 0 ] 2>/dev/null; then ok "মার্কার-id আবিষ্কার #$SID"; else bad "মার্কার-id আবিষ্কার-ব্যর্থ"; fi

echo "── ধাপ-১: কাঠামো (pr303 + ep303 + [Mandatory-স্টাইল]) ──"
PRV=$(cat "$APP/views/user/moderator-press.ejs")
containsF "pr303 pinned-চুক্তি-লাইন" "$PRV" 'var pinned = !!(cb && cb.checked);'
containsF "pr303 hit=pinned||match" "$PRV" 'var hit = pinned || !q || kw.indexOf(q) !== -1;'
containsF "pr303 pinned-গণক" "$PRV" 'function prPinned258()'
containsF "pr303 change-ডেলিগেশন (bulk-all-পথ)" "$PRV" 'input[name="bulk_ids"],[data-bulk-all]'
containsF "pr303 boot-apply-init" "$PRV" 'prApply258(); /* boot-apply-init'
containsF "pr303 Enter-চেকবক্স-অ্যাঙ্কর" "$PRV" "var cb = first.querySelector('input[name=\"bulk_ids\"]');"
containsF "pr303 ফ্ল্যাশ-ক্লাস" "$PRV" "first.classList.add('pr-flash258');"
containsF "pr303 হুক-pinned সদস্য" "$PRV" 'pinned: prPinned258,'
containsF "pr303 হুক-রো-শূন্যে-ও (গার্ড-পরে-হুক)" "$PRV" 'window.__prQA = {'
containsF "pr303 pinned-অ্যাফোর্ডেন্স CSS" "$PRV" ':has(input[name="bulk_ids"]:checked)'
EJV=$(cat "$APP/views/user/epaper.ejs")
containsF "ep303 বছর-ফায়ার-ফানেল" "$EJV" 'var ep303YearFire = function (cell303, reason303)'
containsF "ep303 recency-first মিরর (DESC-প্রথম)" "$EJV" '.sort().reverse()[0];'
containsF "ep303 মাউস-ট্রিগার" "$EJV" "ep303YearFire(c303, 'year');"
containsF "ep303 ফোকাস-ট্রিগার + quiet-গার্ড" "$EJV" 'if (ep303Quiet303) return; /* list-open arm-focus-সাপ্রেস'
containsF "ep303 wrapper (quiet-window)" "$EJV" 'ep284OpenList = function () { ep303Quiet303 = true; ep303OpenListBase303(); ep303Quiet303 = false; };'
containsF "ep303 হুক-years গেটার" "$EJV" "years: function () { try { return document.querySelectorAll('.ep-cal-y.epk300-warm').length;"
EPC=$(cat "$APP/public/assets/css/epaper.css")
containsF "epaper.css session303 ব্লক" "$EPC" "session303 — বছর-তালিকা"
containsF "উষ্ণ-বছর-কোষ রিং (is-cur-অস্পৃশ্য)" "$EPC" ".ep-cal-y.epk300-warm:not(.is-cur)"
containsF "epaper.css reduced-motion গার্ড" "$EPC" "prefers-reduced-motion: reduce"
python3 - <<'PYEOF'
import re, sys
def blk(text, start_marker):
    i = text.find(start_marker)
    return text[i:] if i >= 0 else None
ep = open('public/assets/css/epaper.css', encoding='utf-8').read()
pr = open('views/user/moderator-press.ejs', encoding='utf-8').read()
bad = []
c_ep = blk(ep, 'session303 — বছর-তালিকা')
if c_ep is None: bad.append('epaper-session303: ব্লক-অনুপস্থিত')
else:
    body = re.sub(r'/\*.*?\*/', '', c_ep, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits: bad.append('epaper-session303: হেক্স ' + str(hits[:3]))
i_pr = pr.find('session303 — checked-pinned')
if i_pr < 0: bad.append('press-session303: ব্লক-অনুপস্থিত')
else:
    seg = pr[i_pr:pr.find('</style>', i_pr)]
    body = re.sub(r'/\*.*?\*/', '', seg, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits: bad.append('press-session303: হেক্স ' + str(hits[:3]))
if bad:
    print("  ✗ হেক্স-শূন্য যাচাই — " + '; '.join(bad)); sys.exit(1)
print("HEXZERO-OK")
PYEOF
if [ $? -eq 0 ]; then ok "নতুন CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু) ×২"; else bad "নতুন CSS-ব্লক হেক্স-লিটারাল"; fi

echo "── ধাপ-২: SSR (স্ট্রিপ-রেন্ডার + ইঞ্জিন-প্রেজেন্স + sections-চুক্তি-N/A-প্রমাণ) ──"
containsF "SSR pr-স্ট্রিপ" "$(cat "$PRP")" 'id="prFilter258"'
containsF "SSR pr-ইঞ্জিন" "$(cat "$PRP")" '__prQA'
containsF "SSR pr-bulk-ফর্ম (bulkBar)" "$(cat "$PRP")" 'id="bulkBar"'
containsF "SSR pr-bulk-সর্ব-চেক" "$(cat "$PRP")" 'data-bulk-all'
SCB=$(grep -cF 'name="bulk_ids" value=' "$SCP" || true)
if [ "$SCB" = "0" ]; then ok "sections-SSR bulk_ids-চেকবক্স-শূন্য (চুক্তি N/A — গঠনগত-নিরাপত্তা; sidebar-script-রেফারেন্স-বর্জন)"; else bad "sections-এ bulk_ids-চেকবক্স অনুপস্থিত-প্রত্যাশিত ($SCB)"; fi
containsF "sections-SSR lsf298-উত্তরাধিকার" "$(cat "$SCP")" 'lsf298'
containsF "SSR epaper ep303-ইঞ্জিন" "$(cat "$EPP")" 'ep303YearFire'
containsF "SSR epaper ep302-ভিত্তি অক্ষুণ্ণ" "$(cat "$EPP")" 'ep302MonFire'
containsF "SSR epaper years-গেটার" "$(cat "$EPP")" "years: function ()"

echo "── ধাপ-৩: E2E pr303 (ব্রাউজার-লগইন → পিন×ফিল্টার-সহাবস্থান) ──"
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
CT=$(unj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){return fetch('/admin/login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'username=testadmin&password=demo123&_csrf=$CT'}).then(function(r){return r.status}).catch(function(e){return 'ERR:'+e.message})})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 302|303|0) ok "ব্রাউজার fetch-POST লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
AP=$(ev "(function(){return fetch('/moderator/press',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"')
i=1; while [ "$AP" != "200" ] && [ $i -le 10 ]; do sleep 0.5; AP=$(ev "(function(){return fetch('/moderator/press',{redirect:'manual'}).then(function(r){return r.status}).catch(function(e){return 'ERR'})})()" | tr -d '"'); i=$((i+1)); done
if [ "$AP" = "200" ]; then ok "authed-probe সেটল (200)"; else bad "authed-probe-ব্যর্থ ($AP)"; fi
if [ "$(unj "$(ev "document.getElementById('prFilter258')?'1':''")")" != "1" ]; then bopen "$BASE/moderator/press" || bad "pr-পুনঃopen ব্যর্থ"; fi
if poll "typeof window.__prQA==='object'&&typeof window.__prQA.pinned==='function'" "true" 10; then ok "__prQA হুক (pinned-সহ) সংজ্ঞায়িত"; else bad "__prQA হুক-অনুপস্থিত"; fi
TOTAL=$(unj "$(ev "window.__prQA?String(window.__prQA.total()):''")")
if [ -z "$TOTAL" ] || [ "$TOTAL" = "0" ]; then
  skip "pr-সারি-শূন্য (খালি-ডেটা) — E2E-আচরণ-শাখা স্কিপ"
else
  ok "হুক total() বুট-সত্য ($TOTAL)"
  if [ "$TOTAL" = "$SSR_ROWS" ]; then ok "হুক-total == SSR-সারি ($TOTAL)"; else bad "হুক-total ($TOTAL) ≠ SSR ($SSR_ROWS)"; fi
  INIT=$(unj "$(ev "String(window.__prQA.count())")")
  if [ "$INIT" = "$TOTAL" ]; then ok "boot-apply-init — count==total ($INIT)"; else bad "init count=$INIT total=$TOTAL"; fi
  R1=$(unj "$(ev "String((function(){var rs=document.querySelectorAll('details.clip-row[data-pr-row]');return rs.length?rs[0].getAttribute('data-pr-row'):''})())")")
  if [ -n "$R1" ]; then ok "প্রথম-রো-ইনডেক্স প্রোব ($R1)"; else bad "প্রথম-রো-ইনডেক্স-শূন্য"; fi
  Q="$MARK"   # মার্কার-কুয়েরি (data-kw-এ paper_name আছে — নির্ধারক-১-মিল; data-pr-row=ইনডেক্স-নন-আইডি)
  setq "$Q"; sleep 0.3
  M=$(unj "$(ev "String(window.__prQA.matches())")")
  if [ "$M" = "1" ]; then ok "কুয়েরি '$Q' → matches=১"; else bad "কুয়েরি matches=$M (প্রত্যাশা ১)"; fi
  CHIP=$(ev "document.getElementById('prCount258')?document.getElementById('prCount258').textContent:''")
  if echo "$CHIP" | grep -qF "1 / $TOTAL"; then ok "কাউন্ট-চিপ ASCII-অঙ্ক (s258-চুক্তি) — $(unj "$CHIP")"; else bad "চিপ='$(unj "$CHIP")' (প্রত্যাশা 1 / $TOTAL)"; fi
  setq ""; sleep 0.2
  ev "(function(){var rs=document.querySelectorAll('details.clip-row[data-pr-row]');var cb=rs[0].querySelector('input[name=\"bulk_ids\"]');cb.click();return 'CHK'})()" >/dev/null
  sleep 0.3
  P=$(unj "$(ev "String(window.__prQA.pinned())")")
  if [ "$P" = "1" ]; then ok "চেক-ক্লিক → pinned=১"; else bad "pinned=$P (প্রত্যাশা ১)"; fi
  HIDC=$(unj "$(ev "String((function(){var cb=document.querySelector('details.clip-row[data-pr-row] input[name=\\\"bulk_ids\\\"]');var b=document.getElementById('bulkBar');if(!b||!cb)return 'nobar';var h=b.querySelectorAll('input[type=\\\"hidden\\\"][name=\\\"ids\\\"]');return h.length&&h[0].value===cb.value?'synced':'nosync'})())")")
  if [ "$HIDC" = "synced" ]; then ok "sidebar initBulkBar hidden-ids-সিঙ্ক (coexistence)"; else bad "hidden-ids=$HIDC"; fi
  setq "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__prQA.matches())")")
  ZV=$(ev "document.querySelector('[data-pr-empty]').hidden")
  if [ "$M" = "1" ] && echo "$ZV" | grep -qF "true"; then ok "গার্বেজ-কুয়েরিতে-ও চেক-সারি-পিনড (matches=১, শূন্য-লুকানো)"; else bad "পিন-ব্যর্থ matches=$M zeroHidden=$ZV"; fi
  HIDV=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('details.clip-row[data-pr-row]'));var r=rs.filter(function(x){return x.getAttribute('data-pr-row')==='$R1'})[0];return r?!r.hidden:'no'})())")")
  if [ "$HIDV" = "true" ]; then ok "পিনড-সারি প্রকৃত-দৃশ্যমান (hidden=false)"; else bad "পিনড-দৃশ্যমানতা=$HIDV"; fi
  PINCSS=$(unj "$(ev "(function(){try{return getComputedStyle(document.querySelector('details.clip-row[data-pr-row]')).boxShadow.indexOf('inset')>=0?'inset':'none'}catch(e){return 'err'}})()")")
  if [ "$PINCSS" = "inset" ]; then ok "pinned-অ্যাফোর্ডেন্স CSS-প্রয়োগ (inset-প্রান্ত)"; else skip ":has()-অসমর্থিত-ব্রাউজার ($PINCSS)"; fi
  ev "(function(){var rs=document.querySelectorAll('details.clip-row[data-pr-row]');rs[0].querySelector('input[name=\"bulk_ids\"]').click();return 'UNCHK'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__prQA.matches())")")
  ZV=$(ev "document.querySelector('[data-pr-empty]').hidden")
  if [ "$M" = "0" ] && echo "$ZV" | grep -qF "false"; then ok "আনচেকে পিন-মুক্ত (matches=০ + শূন্য-প্রকাশ)"; else bad "আনচেক matches=$M zeroHidden=$ZV"; fi
  setq "zzqx garbage"
  ev "(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'ALL'})()" >/dev/null
  sleep 0.3
  M=$(unj "$(ev "String(window.__prQA.matches())")")
  P=$(unj "$(ev "String(window.__prQA.pinned())")")
  if [ "$M" = "$TOTAL" ] && [ "$P" = "$TOTAL" ]; then ok "bulk-all → সর্ব-পিন (matches=$TOTAL, pinned=$TOTAL)"; else bad "bulk-all matches=$M pinned=$P (প্রত্যাশা $TOTAL/$TOTAL)"; fi
  HIDN=$(unj "$(ev "String([].slice.call(document.querySelectorAll('details.clip-row[data-pr-row]')).filter(function(x){return x.hidden}).length)")")
  if [ "$HIDN" = "0" ]; then ok "bulk-all-পথে হিডেন-সারি-শূন্য (bulk-ঝুঁকি-নির্মূল প্রমাণ)"; else bad "হিডেন-সারি=$HIDN"; fi
  ev "(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'UNALL'})()" >/dev/null
  sleep 0.2
  M=$(unj "$(ev "String(window.__prQA.matches())")")
  P=$(unj "$(ev "String(window.__prQA.pinned())")")
  if [ "$M" = "0" ] && [ "$P" = "0" ]; then ok "bulk-all-আনচেক → পিন-শূন্য"; else bad "আন-অল matches=$M pinned=$P"; fi
  setq ""; sleep 0.2
  ev "(function(){var rs=document.querySelectorAll('details.clip-row[data-pr-row]');rs[0].querySelector('input[name=\"bulk_ids\"]').click();return 'CHK2'})()" >/dev/null
  sleep 0.2
  ENTER_JS="(function(){var i=document.getElementById('prFilter258');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$Q');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var m=[].slice.call(document.querySelectorAll('details.clip-row[data-pr-row]')).filter(function(x){return !x.hidden});var cb=m.length?m[0].querySelector('input[name=\"bulk_ids\"]'):null;return (m.length&&m[0].classList.contains('pr-flash258')&&cb&&document.activeElement===cb)?'flash+focus':'no'})()"
  FR=$(unj "$(ev "$ENTER_JS")")
  if [ "$FR" = "flash+focus" ]; then ok "Enter → প্রথম-মিল চেকবক্স-ফোকাস+ফ্ল্যাশ (বিপজ্জনক-বাটন-নিষিদ্ধ-নিয়ম)"; else bad "Enter=$FR"; fi
  sleep 1.1
  FC=$(ev "document.querySelector('.pr-flash258')?'still':'gone'")
  if echo "$FC" | grep -qF "gone"; then ok "ফ্ল্যাশ ৯০০ms-পরে নির্মোচন"; else bad "ফ্ল্যাশ-স্থায়ী"; fi
  ev "(function(){var rs=document.querySelectorAll('details.clip-row[data-pr-row]');rs[0].querySelector('input[name=\"bulk_ids\"]').click();return 'UN2'})()" >/dev/null
  setq ""; sleep 0.2
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
  agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && [ -s "$SH_DESK" ] && ok "ডেস্কটপ-স্ক্রিনশট" || bad "ডেস্কটপ-স্ক্রিনশট"
  agent-browser set viewport 390 844 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
  HS=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
  if [ "$HS" = "false" ]; then ok "মোবাইল-390 পৃষ্ঠা-স্তর hScroll-শূন্য"; else bad "মোবাইল hScroll=$HS"; fi
  T2=$(unj "$(ev "String(window.__prQA?window.__prQA.total():'-1')")")
  if [ "$T2" = "$TOTAL" ]; then ok "মোবাইল-রিলোডে হুক-পুনঃবুট ($T2)"; else bad "মোবাইল-হুক total=$T2"; fi
  agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && [ -s "$SH_MOB" ] && ok "মোবাইল-স্ক্রিনশট" || bad "মোবাইল-স্ক্রিনশট"
  agent-browser set viewport 1280 900 >/dev/null 2>&1
fi

echo "── ধাপ-৪: E2E ep303 (বছর-তালিকা-প্রিফেচ + quiet-window) ──"
bopen "$BASE/epaper" || bad "epaper-open ব্যর্থ"
if poll "typeof window.__epk300QA==='object'&&typeof window.__epk300QA.years==='function'" "true" 10; then ok "__epk300QA.years গেটার সংজ্ঞায়িত"; else bad "years-গেটার-অনুপস্থিত"; fi
P0=$(unj "$(ev "String(window.__epk300QA.prefetched())")")
if [ "$P0" = "0" ]; then ok "বুট-প্রিফেচ-শূন্য (ইচ্ছা-গেট-ধর্ম)"; else bad "বুট-প্রিফেচ=$P0"; fi
OPEN_JS="(function(){var mb=document.getElementById('epCalMonth');mb.click();var ml=document.getElementById('epCalMY');ml.click();var yl=document.getElementById('epCalYList');return JSON.stringify({open:yl?!yl.hidden:false,p:window.__epk300QA.prefetched(),y:window.__ep284QA.years()})})()"
OR=$(unj "$(ev "$OPEN_JS")")
if echo "$OR" | grep -qF '"open":true' && echo "$OR" | grep -qF '"p":0'; then ok "বছর-তালিকা-খোলা + **quiet-window** (arm-ফোকাসে-প্রিফেচ-শূন্য)"; else bad "তালিকা/quiet=$OR"; fi
YS=$(unj "$(ev "String(document.querySelectorAll('.ep-cal-y').length)")")
if [ "$YS" = "0" ]; then
  skip "বছর-কোষ-শূন্য — ep303-আচরণ-শাখা স্কিপ"
else
  ok "বছর-কোষ রেন্ডারড ($YS)"
  HOV_JS="(function(){var c=[].slice.call(document.querySelectorAll('.ep-cal-y')).filter(function(x){return !x.classList.contains('is-cur')})[0]||document.querySelector('.ep-cal-y');if(!c)return 'nocell';var p0=window.__epk300QA.prefetched();c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return JSON.stringify({disp:c.getAttribute('data-y'),p:window.__epk300QA.prefetched(),p0:p0,last:window.__epk300QA.last(),warm:c.classList.contains('epk300-warm')})})()"
  HR=""
  for att303 in 1 2 3 4 5; do
    RAW303=$(agent-browser eval "$HOV_JS" 2>&1)
    echo "$RAW303" >> /tmp/s303-hov-debug.log
    HR=$(unj "$RAW303")
    if echo "$HR" | grep -q '"p":[1-9]'; then break; fi
    sleep 0.5
  done
  P1=$(echo "$HR" | grep -o '"p":[0-9]*' | cut -d: -f2); L1=$(echo "$HR" | grep -o '"last":"[^"]*"' | cut -d'"' -f4)
  if [ "$P1" -ge 1 ] 2>/dev/null && [ "$L1" = "year" ]; then ok "হোভার → প্রিফেচ reason=year ($P1 — একক-eval dispatch+read ×$att303)"; else bad "হোভার $HR"; fi
  DEDR=""
  for att303b in 1 2 3 4 5; do
    DEDR=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-y');var p0=window.__epk300QA.prefetched();c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return JSON.stringify({p:window.__epk300QA.prefetched(),p0:p0})})()")")
    if echo "$DEDR" | grep -q '"p":'; then break; fi
    sleep 0.5
  done
  DED=$(echo "$DEDR" | grep -o '"p":[0-9]*' | cut -d: -f2)
  if [ "$DED" = "$P1" ]; then ok "ডিডুপ (পুনঃ-হোভারে বৃদ্ধি-শূন্য)"; else bad "ডিডুপ $P1→$DED ($DEDR)"; fi
  YW=$(unj "$(ev "String(window.__epk300QA.years())")")
  if [ "$YW" -ge 1 ] 2>/dev/null; then ok "উষ্ণ-বছর-মিরর (years=$YW)"; else bad "years=$YW"; fi
  WARM=$(unj "$(ev "String(document.querySelector('.ep-cal-y').classList.contains('epk300-warm'))")")
  if [ "$WARM" = "true" ]; then ok "বছর-কোষে epk300-warm ক্লাস"; else bad "warm=$WARM"; fi
  if [ "$YS" -ge 2 ]; then
    FOC_JS="(function(){var c=[].slice.call(document.querySelectorAll('.ep-cal-y')).filter(function(x){return !x.classList.contains('epk300-warm')})[0];if(!c)return 'none';c.focus();return 'DISP'})()"
    ev "$FOC_JS" >/dev/null
    sleep 0.3
    L2=$(unj "$(ev "String(window.__epk300QA.last())")")
    if [ "$L2" = "year-focus" ]; then ok "ব্যবহারকারী-ফোকাস → reason=year-focus (quiet-পরে)"; else bad "focusin last=$L2"; fi
  else
    skip "একক-বছর — focusin-আলাদা-যাচাই-স্কিপ (ডিডুপ-আচরণ-সঠিক)"
  fi
  ev "(function(){window.__ep284QA.render();return 'R'})()" >/dev/null
  sleep 0.3
  YW=$(unj "$(ev "String(window.__epk300QA.years())")")
  if [ "$YW" = "0" ]; then ok "ep284Render-পুনঃরেন্ডারে উষ্ণ-বিলোপ"; else bad "পুনঃরেন্ডার years=$YW"; fi
  RE=$(unj "$(ev "(function(){var c=document.querySelector('.ep-cal-y');if(!c)return 'none';c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return String(window.__epk300QA.years())})()")")
  if [ "$RE" != "none" ] && [ "$RE" -ge 1 ] 2>/dev/null; then ok "পুনঃ-ইচ্ছায় উষ্ণ-পুনঃ-প্রতিষ্ঠা"; else bad "পুনঃ-প্রতিষ্ঠা=$RE"; fi
fi

echo "── ধাপ-৫: রিগ্রেশন-স্যানিটি (দ্বি-লোড এরর-শূন্য) ──"
agent-browser errors --clear >/dev/null 2>&1
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 1.5
bopen "$BASE/epaper" >/dev/null 2>&1; sleep 2
EN=$(agent-browser errors --json 2>/dev/null | python3 -c "import json,sys;print(len(json.load(sys.stdin)['data']['errors']))" 2>/dev/null || echo "?")
if [ "$EN" = "0" ]; then ok "epaper দ্বি-লোড এরর-শূন্য (poster-ফিক্স-ধারাবাহিক)"; else bad "পৃষ্ঠা-এরর=$EN"; fi

echo "── ধাপ-৬: মার্কার-সারি পরিষ্কারক (delete→ট্র্যাহ→bulk-purge — পুনঃরান-idempotent; নেট-শূন্য) ──"
if [ -n "${SID:-}" ] && [ "$SID" -gt 0 ] 2>/dev/null; then
  TOK3=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/press/$SID/delete" --data-urlencode "_csrf=$TOK3")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ]; then ok "মার্কার-সারি ট্র্যাশ (#$TID)"; else bad "ট্র্যাশ-ব্যর্থ (loc=$LOC)"; fi
  TOK4=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$TOK4")
  if [ "$PU" = "302" ] || [ "$PU" = "303" ] || [ "$PU" = "200" ]; then ok "bulk-purge সম্পন্ন ($PU)"; else bad "purge-ব্যর্থ ($PU)"; fi
  FINAL=$(curl -s -b "$J" -c "$J" "$BASE/moderator/press" | grep -cF "$MARK" || true)
  if [ "$FINAL" = "0" ]; then ok "নেট-শূন্য প্রমাণ (মার্কার-শূন্য)"; else bad "মার্কার-অবশিষ্ট ($FINAL)"; fi
else
  skip "পরিষ্কারক-স্কিপ (SID-অনুপস্থিত)"
fi

echo ""
echo "══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" -eq 0 ] && echo "S303-SUITE-GREEN" || echo "S303-SUITE-RED"
exit "$FAIL"
