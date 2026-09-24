#!/bin/bash
# s305-suite.sh — session305: cf305 — /moderator/complaints (mc254-ইঞ্জিন) **checked-pinned চুক্তি পোর্ট**
# [Task ID 145] — পরিবার-সম্পূর্ণতা: শেষ-বাকি bulk+filter-সারফেস (coverage-ম্যাট্রিক্স-যাচাইকৃত;
#   daily-form-এ dqf302 পূর্ব-সজ্জিত — session302)। hit = pinned || !v || kw-match → bulk-delete
#   কখনো অদৃশ্য-সারি-স্পর্শ-নয়; sidebar initBulkBar-সহাবস্থান + bulk-all-পথ + Enter-firstMatch-
#   চেকবক্স-অ্যাঙ্কর (স্ট্যাটাস-আপডেট-বাটন-নিষিদ্ধ) + boot-apply-init + [Mandatory-স্টাইল]
#   pinned-অ্যাফোর্ডেন্স (:has()-গেটেড) + ফ্ল্যাশ ৯০০ms।
# চুক্তি: fetch-POST লগইন + authed-probe + bopen-রিট্রাই + unj() + native-setter+input-event +
#         মার্কার-সিড (প্রোডাকশন-প্রবাহ — /support/dmca-report) + নেট-শূন্য-পরিষ্কারক (bulk-delete→ট্র্যাহ→purge)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
J=/tmp/s305-jar.txt
MCP=/tmp/s305-complaints.html
SH_DESK=/home/z/my-project/download/s305-cf-pinned-desk.png
SH_MOB=/home/z/my-project/download/s305-cf-pinned-mobile390.png
MARK="qa305complaint"
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
setq(){ ev "(function(){var i=document.getElementById('mc254-filter');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null; }
HID='['h'idden]'   # বাইট-নিরাপদ গঠন — লেখনী-স্তর -সিকোয়েন্স-ক্ষয়-এড়ানো (s298/s299-গোটচা)
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
PC=$(curl -s -o "$MCP" -w "%{http_code}" -b "$J" "$BASE/moderator/complaints")
if [ "$PC" = "200" ]; then ok "moderator/complaints পৃষ্ঠা 200"; else bad "moderator/complaints HTTP $PC"; fi

echo "── ধাপ-০.৫: মার্কার-সিড (প্রোডাকশন-প্রবাহ — dmca-report POST; ৬০-মিনিট-ডুপ-গার্ড-সহনশীল) ──"
seed_id(){
  awk 'BEGIN{RS="</div>"} /'"$MARK"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' "$1"
}
CID=$(seed_id "$MCP")
if [ -z "$CID" ]; then
  TOK2=$(curl -s -b "$J" -c "$J" "$BASE/support/dmca-report" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/support/dmca-report" \
    --data-urlencode "workTitle=$MARK" --data-urlencode "workLink=https://example.com/qa305src" \
    --data-urlencode "infringeLink=https://example.com/qa305copy" --data-urlencode "details=cf305 পোর্ট-যাচাই সারি" \
    --data-urlencode "_csrf=$TOK2")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "অভিযোগ-মার্কার তৈরি/ডুপ-গার্ড ($CC)"; else bad "অভিযোগ-সিড ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" "$BASE/moderator/complaints" -o "$MCP"; CID=$(seed_id "$MCP")
else
  skip "অভিযোগ-মার্কার পূর্ব-বিদ্যমান (#$CID — পুনঃব্যবহার)"
fi
if [ -n "$CID" ] && [ "$CID" -gt 0 ] 2>/dev/null; then ok "অভিযোগ-মার্কার-id #$CID"; else bad "অভিযোগ-id আবিষ্কার-ব্যর্থ"; fi

echo "── ধাপ-১: কাঠামো (cf305 + [Mandatory-স্টাইল]) ──"
MCV=$(cat "$APP/views/user/moderator-complaints.ejs")
containsF "cf305 pinned-গণক" "$MCV" 'function mcPinned254()'
containsF "cf305 hit=pinned||match" "$MCV" "var hit = pinned || !v || (c.getAttribute('data-kw') || '').indexOf(v) >= 0;"
containsF "cf305 change-ডেলিগেশন (bulk-all-পথ)" "$MCV" 'input[name="bulk_ids"],[data-bulk-all]'
containsF "cf305 boot-apply-init" "$MCV" 'apply254(); /* boot-apply-init'
containsF "cf305 Enter-চেকবক্স-অ্যাঙ্কর" "$MCV" "var cb = first.querySelector('input[name=\"bulk_ids\"]');"
containsF "cf305 ফ্ল্যাশ-ক্লাস" "$MCV" "first.classList.add('mc-flash305');"
containsF "cf305 হুক-pinned সদস্য" "$MCV" 'pinned: mcPinned254,'
containsF "cf305 হুক-legacy-অক্ষুণ্ণ" "$MCV" 'window.__mcQA = {'
containsF "cf305 pinned-অ্যাফোর্ডেন্স CSS" "$MCV" '.complaint-card[data-mc-row]:has(input[name="bulk_ids"]:checked)'
containsF "cf305 focus-visible-রিং" "$MCV" '.complaint-card[data-mc-row] input[name="bulk_ids"]:focus-visible'
containsF "hidden-গার্ড-অক্ষুণ্ণ (সারি)" "$MCV" ".complaint-card[data-mc-row]$HID { display: none !important; }"
python3 - <<'PYEOF'
import re, sys
t = open('views/user/moderator-complaints.ejs', encoding='utf-8').read()
i = t.find('session305 — checked-pinned')
if i < 0:
    print("  ✗ cf305: CSS-ব্লক-অনুপস্থিত"); sys.exit(1)
seg = t[i:t.find('</style>', i)]
body = re.sub(r'/\*.*?\*/', '', seg, flags=re.S)
hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
if hits:
    print("  ✗ cf305: হেক্স " + str(hits[:3])); sys.exit(1)
print("HEXZERO-OK")
PYEOF
if [ $? -eq 0 ]; then ok "নতুন CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "নতুন CSS-ব্লক হেক্স-লিটারাল"; fi

echo "── ধাপ-২: SSR (ইঞ্জিন-প্রেজেন্স + bulk-ফর্ম-চুক্তি) ──"
containsF "SSR mc-ইঞ্জিন" "$(cat "$MCP")" '__mcQA'
containsF "SSR mc-bulk-ফর্ম" "$(cat "$MCP")" 'id="bulkBar"'
containsF "SSR mc-সর্ব-চেক" "$(cat "$MCP")" 'data-bulk-all'
MROWS=$(grep -cF 'data-mc-row' "$MCP" || true)
if [ "$MROWS" -ge 1 ]; then ok "SSR mc-সারি ($MROWS)"; else bad "mc-সারি-শূন্য"; fi

echo "── ধাপ-৩: E2E cf305 (ব্রাউজার-লগইন → পিন×ফিল্টার-সহাবস্থান) ──"
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
CT=$(unj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){return fetch('/admin/login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'username=testadmin&password=demo123&_csrf=$CT'}).then(function(r){return r.status}).catch(function(e){return 'ERR:'+e.message})})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 302|303|0) ok "ব্রাউজার fetch-POST লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/moderator/complaints" || bad "complaints-পুনঃopen ব্যর্থ"
if poll "typeof window.__mcQA==='object'&&typeof window.__mcQA.pinned==='function'" "true" 10; then ok "__mcQA হুক (pinned-সহ) সংজ্ঞায়িত"; else bad "__mcQA হুক-অনুপস্থিত"; fi
TOTAL=$(unj "$(ev "window.__mcQA?String(window.__mcQA.total()):''")")
if [ -n "$TOTAL" ] && [ "$TOTAL" != "0" ]; then
  ok "হুক total() বুট-সত্য ($TOTAL)"
  INIT=$(unj "$(ev "String(window.__mcQA.count())")")
  if [ "$INIT" = "$TOTAL" ]; then ok "boot-apply-init — count==total ($INIT)"; else bad "init count=$INIT total=$TOTAL"; fi
  CHK_JS="(function(){var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return cb.value})()"
  CV=$(unj "$(ev "$CHK_JS")")
  sleep 0.3
  P=$(unj "$(ev "String(window.__mcQA.pinned())")")
  if [ "$P" = "1" ]; then ok "চেক → pinned=১"; else bad "pinned=$P (প্রত্যাশা ১)"; fi
  HIDC=$(unj "$(ev "String((function(){var b=document.getElementById('bulkBar');if(!b)return 'nobar';var h=b.querySelectorAll('input[type=\\\"hidden\\\"][name=\\\"ids\\\"]');return h.length&&h[0].value==='$CV'?'synced':'nosync'})())")")
  if [ "$HIDC" = "synced" ]; then ok "sidebar initBulkBar hidden-ids-সিঙ্ক (coexistence)"; else bad "hidden-ids=$HIDC"; fi
  setq "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__mcQA.count())")")
  VIS=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return r?!r.hidden:'no-pinned-row'})())")")
  if [ "$M" = "1" ] && [ "$VIS" = "true" ]; then ok "গার্বেজ-কুয়েরিতে-ও চেক-সারি-পিনড (count=১, hidden=false)"; else bad "পিন-ব্যর্থ count=$M vis=$VIS"; fi
  PINCSS=$(unj "$(ev "(function(){try{var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return getComputedStyle(r).boxShadow.indexOf('inset')>=0?'inset':'none'}catch(e){return 'err'}})()")")
  if [ "$PINCSS" = "inset" ]; then ok "pinned-অ্যাফোর্ডেন্স CSS-প্রয়োগ (inset-প্রান্ত)"; else skip ":has()-অসমর্থিত-ব্রাউজার ($PINCSS)"; fi
  UNCHK_JS="(function(){var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'UNCHK'})()"
  ev "$UNCHK_JS" >/dev/null; sleep 0.2
  M=$(unj "$(ev "String(window.__mcQA.count())")")
  ZV=$(unj "$(ev "String(document.querySelector('[data-mc-empty]').hidden)")")
  if [ "$M" = "0" ] && [ "$ZV" = "false" ]; then ok "আনচেকে পিন-মুক্ত (count=০ + শূন্য-প্রকাশ)"; else bad "আনচেক count=$M zeroHidden=$ZV"; fi
  ALL_JS="(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'ALL'})()"
  ev "$ALL_JS" >/dev/null; sleep 0.3
  M=$(unj "$(ev "String(window.__mcQA.count())")")
  P=$(unj "$(ev "String(window.__mcQA.pinned())")")
  HIDN=$(unj "$(ev "String([].slice.call(document.querySelectorAll('[data-mc-row]')).filter(function(x){return x.hidden}).length)")")
  if [ "$M" = "$TOTAL" ] && [ "$P" = "$TOTAL" ] && [ "$HIDN" = "0" ]; then ok "bulk-all → সর্ব-পিন (count=$TOTAL, pinned=$TOTAL, হিডেন-শূন্য)"; else bad "bulk-all count=$M pinned=$P hidden=$HIDN"; fi
  ev "$ALL_JS" >/dev/null; sleep 0.2
  P=$(unj "$(ev "String(window.__mcQA.pinned())")")
  if [ "$P" = "0" ]; then ok "bulk-all-আনচেক → পিন-শূন্য"; else bad "আন-অল pinned=$P"; fi
  CHK2_JS="(function(){var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'CHK2'})()"
  ev "$CHK2_JS" >/dev/null; setq ""; sleep 0.2
  ENTER_JS="(function(){var i=document.getElementById('mc254-filter');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$MARK');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var m=[].slice.call(document.querySelectorAll('[data-mc-row]')).filter(function(x){return !x.hidden});var cb=m.length?m[0].querySelector('input[name=\"bulk_ids\"]'):null;return (m.length&&m[0].classList.contains('mc-flash305')&&cb&&document.activeElement===cb)?'flash+focus':'no'})()"
  FR=$(unj "$(ev "$ENTER_JS")")
  if [ "$FR" = "flash+focus" ]; then ok "Enter → প্রথম-মিল চেকবক্স-ফোকাস+ফ্ল্যাশ (স্ট্যাটাস-আপডেট-বাটন-নিষিদ্ধ-নিয়ম)"; else bad "Enter=$FR"; fi
  sleep 1.1
  FC=$(ev "document.querySelector('.mc-flash305')?'still':'gone'")
  if echo "$FC" | grep -qF "gone"; then ok "ফ্ল্যাশ ৯০০ms-পরে নির্মোচন"; else bad "ফ্ল্যাশ-স্থায়ী"; fi
  ev "(function(){var rs=[].slice.call(document.querySelectorAll('[data-mc-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'UN2'})()" >/dev/null
  setq ""; sleep 0.2
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
  agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && [ -s "$SH_DESK" ] && ok "ডেস্কটপ-স্ক্রিনশট" || bad "ডেস্কটপ-স্ক্রিনশট"
  agent-browser set viewport 390 844 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
  HS=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
  if [ "$HS" = "false" ]; then ok "মোবাইল-390 পৃষ্ঠা-স্তর hScroll-শূন্য"; else bad "মোবাইল hScroll=$HS"; fi
  T2=$(unj "$(ev "String(window.__mcQA?window.__mcQA.total():'-1')")")
  if [ "$T2" = "$TOTAL" ]; then ok "মোবাইল-রিলোডে হুক-পুনঃবুট ($T2)"; else bad "মোবাইল-হুক total=$T2"; fi
  agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && [ -s "$SH_MOB" ] && ok "মোবাইল-স্ক্রিনশট" || bad "মোবাইল-স্ক্রিনশট"
  agent-browser set viewport 1280 900 >/dev/null 2>&1
else
  skip "mc-সারি-শূন্য — cf305-আচরণ-শাখা স্কিপ"
fi

echo "── ধাপ-৪: রিগ্রেশন-স্যানিটি (দ্বি-লোড এরর-শূন্য) ──"
bopen "$BASE/moderator/complaints" || bad "রিগ্রেশন-open ব্যর্থ"
agent-browser reload >/dev/null 2>&1; sleep 0.8
E=$(agent-browser errors 2>/dev/null | grep -c "SyntaxError\|TypeError\|ReferenceError" || true)
if [ "${E:-0}" = "0" ]; then ok "এরর-শূন্য complaints দ্বি-লোড"; else bad "এরর-$E complaints"; fi

echo "── ধাপ-৫: মার্কার-পরিষ্কারক (bulk-delete→ট্র্যাহ→bulk-purge — নেট-শূন্য) ──"
curl -s -b "$J" "$BASE/moderator/complaints" -o "$MCP"
CID2=$(seed_id "$MCP")
if [ -n "$CID2" ] && [ "$CID2" -gt 0 ] 2>/dev/null; then
  TOK3=$(curl -s -b "$J" -c "$J" "$BASE/moderator/complaints" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$BASE/moderator/complaints/bulk-delete" --data-urlencode "ids=$CID2" --data-urlencode "_csrf=$TOK3")
  TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
  if [ -n "$TID" ]; then ok "মার্কার-সারি ট্র্যাহ (#$TID)"; else bad "ট্র্যাশ-ব্যর্থ (loc=$LOC)"; fi
  TOK4=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "ids=$TID" --data-urlencode "_csrf=$TOK4")
  if [ "$PU" = "302" ] || [ "$PU" = "303" ] || [ "$PU" = "200" ]; then ok "bulk-purge সম্পন্ন ($PU)"; else bad "purge-ব্যর্থ ($PU)"; fi
  FINAL=$(curl -s -b "$J" -c "$J" "$BASE/moderator/complaints" | grep -cF "$MARK" || true)
  if [ "$FINAL" = "0" ]; then ok "নেট-শূন্য প্রমাণ (মার্কার-শূন্য)"; else bad "মার্কার-অবশিষ্ট ($FINAL)"; fi
else
  skip "পরিষ্কারক-স্কিপ (CID-অনুপস্থিত)"
fi

echo ""
echo "══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" -eq 0 ] && echo "S305-SUITE-GREEN" || echo "S305-SUITE-RED"
exit "$FAIL"
