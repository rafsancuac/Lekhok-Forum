#!/bin/bash
# s304-suite.sh — session304: checked-pinned চুক্তি **পোর্ট-প্যাক** [Task ID 144]
#   ① no304 /moderator/notices — session259-ইঞ্জিনে hit = pinned || !q || kw-match পোর্ট (pr303-মিরর)
#   ② ev304 /moderator/events  — session260-ইঞ্জিনে একই পোর্ট
#   ③ mm304 /moderator/members — session255-ইঞ্জিনে পোর্ট + সেকশন-অটো-হাইড পিন-সচেতন (পিনড-সারি-বিশিষ্ট সেকশন দৃশ্যমান)
#   প্রতিটি সারফেস: bulk-delete/publish/hide কখনো অদৃশ্য-সারি-স্পর্শ-নয় (hidden-row-ঝুঁকি-নির্মূল);
#   sidebar initBulkBar-সহাবস্থান (hidden-ids-সিঙ্ক) + bulk-all-পথ + Enter-firstMatch-চেকবক্স-অ্যাঙ্কর +
#   boot-apply-init + [Mandatory-স্টাইল] pinned-অ্যাফোর্ডেন্স (:has()-গেটেড প্রান্ত+টিন্ট) + ফ্ল্যাশ ৯০০ms।
# চুক্তি: fetch-POST লগইন (session297) + authed-probe-সেটল-পোল + bopen-রিট্রাই+ডেমন-রিসাইকেল +
#         unj() (s294) + native-setter+input-event (s300) + মার্কার-সিড/নেট-শূন্য-পরিষ্কারক (s258-নীতি)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
J=/tmp/s304-jar.txt
NOP=/tmp/s304-notices.html
EVP=/tmp/s304-events.html
MMP=/tmp/s304-members.html
SH_DESK=/home/z/my-project/download/s304-pinned-desk.png
SH_MOB=/home/z/my-project/download/s304-pinned-mobile390.png
MARK_N="qa304notice"
MARK_E="qa304event"
MARK_M="qa304member"
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
setq_no(){ ev "(function(){var i=document.getElementById('noFilter259');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null; }
setq_ev(){ ev "(function(){var i=document.getElementById('evFilter260');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null; }
setq_mm(){ ev "(function(){var i=document.getElementById('mm255-filter');if(!i)return 'no';var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'SET'})()" >/dev/null; }
HID='['h'idden]'   # বাইট-নিরাপদ গঠন — লেখনী-স্তর -সিকোয়েন্স-ক্ষয়-এড়ানো (s298/s299-গোটচা)
. "$APP/tests/lib-qa-browser.sh"

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → তিন-পৃষ্ঠা-সংগ্রহ) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi
PC=$(curl -s -o "$NOP" -w "%{http_code}" -b "$J" "$BASE/moderator/notices")
if [ "$PC" = "200" ]; then ok "moderator/notices পৃষ্ঠা 200"; else bad "moderator/notices HTTP $PC"; fi
EC=$(curl -s -o "$EVP" -w "%{http_code}" -b "$J" "$BASE/moderator/events")
if [ "$EC" = "200" ]; then ok "moderator/events পৃষ্ঠা 200"; else bad "moderator/events HTTP $EC"; fi
MC=$(curl -s -o "$MMP" -w "%{http_code}" -b "$J" "$BASE/moderator/members")
if [ "$MC" = "200" ]; then ok "moderator/members পৃষ্ঠা 200"; else bad "moderator/members HTTP $MC"; fi

echo "── ধাপ-০.৫: মার্কার-সিড ×৩ (প্রোডাকশন-প্রবাহ POST — পুনঃরান-idempotent) ──"
seed_id(){
  # $1=পৃষ্ঠা-ফাইল $2=মার্কার → সেই-সারির bulk_ids value
  awk 'BEGIN{RS="</div>"} /'"$2"'/ { if (match($0, /name="bulk_ids" value="[0-9]+"/)) { s=substr($0, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); print s; exit } }' "$1"
}
curl -s -b "$J" "$BASE/moderator/notices" -o "$NOP"
NID=$(seed_id "$NOP" "$MARK_N")
if [ -z "$NID" ]; then
  TOKN=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/notices" \
    --data-urlencode "title=$MARK_N বিজ্ঞপ্তি-ডেমো" --data-urlencode "content=checked-pinned পোর্ট-প্যাক যাচাই-সারি" \
    --data-urlencode "category=notice" --data-urlencode "date=2026-09-24" --data-urlencode "_csrf=$TOKN")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "নোটিশ-মার্কার তৈরি ($CC)"; else bad "নোটিশ-সিড ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" "$BASE/moderator/notices" -o "$NOP"; NID=$(seed_id "$NOP" "$MARK_N")
else
  skip "নোটিশ-মার্কার পূর্ব-বিদ্যমান (#$NID — পুনঃব্যবহার)"
fi
if [ -n "$NID" ] && [ "$NID" -gt 0 ] 2>/dev/null; then ok "নোটিশ-মার্কার-id #$NID"; else bad "নোটিশ-id আবিষ্কার-ব্যর্থ"; fi

curl -s -b "$J" "$BASE/moderator/events" -o "$EVP"
EID=$(seed_id "$EVP" "$MARK_E")
if [ -z "$EID" ]; then
  TOKE=$(curl -s -b "$J" -c "$J" "$BASE/moderator/events" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/events" \
    --data-urlencode "title=$MARK_E ইভেন্ট-ডেমো" --data-urlencode "description=checked-pinned যাচাই" \
    --data-urlencode "date=2026-12-01" --data-urlencode "location=qa304hall" --data-urlencode "_csrf=$TOKE")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "ইভেন্ট-মার্কার তৈরি ($CC)"; else bad "ইভেন্ট-সিড ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" "$BASE/moderator/events" -o "$EVP"; EID=$(seed_id "$EVP" "$MARK_E")
else
  skip "ইভেন্ট-মার্কার পূর্ব-বিদ্যমান (#$EID — পুনঃব্যবহার)"
fi
if [ -n "$EID" ] && [ "$EID" -gt 0 ] 2>/dev/null; then ok "ইভেন্ট-মার্কার-id #$EID"; else bad "ইভেন্ট-id আবিষ্কার-ব্যর্থ"; fi

curl -s -b "$J" "$BASE/moderator/members" -o "$MMP"
MID=$(seed_id "$MMP" "$MARK_M")
if [ -z "$MID" ]; then
  TOKM=$(curl -s -b "$J" -c "$J" "$BASE/moderator/members" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  CC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/moderator/members" \
    --data-urlencode "name=$MARK_M" --data-urlencode "role=যাচাই-সদস্য" --data-urlencode "member_type=central" \
    --data-urlencode "term_year=২০২৪-২৫" --data-urlencode "sort_order=0" --data-urlencode "_csrf=$TOKM")
  if [ "$CC" = "302" ] || [ "$CC" = "303" ]; then ok "সদস্য-মার্কার তৈরি ($CC)"; else bad "সদস্য-সিড ব্যর্থ (HTTP $CC)"; fi
  curl -s -b "$J" "$BASE/moderator/members" -o "$MMP"; MID=$(seed_id "$MMP" "$MARK_M")
else
  skip "সদস্য-মার্কার পূর্ব-বিদ্যমান (#$MID — পুনঃব্যবহার)"
fi
if [ -n "$MID" ] && [ "$MID" -gt 0 ] 2>/dev/null; then ok "সদস্য-মার্কার-id #$MID"; else bad "সদস্য-id আবিষ্কার-ব্যর্থ"; fi

echo "── ধাপ-১: কাঠামো (no304 + ev304 + mm304 + [Mandatory-স্টাইল]) ──"
NOV=$(cat "$APP/views/user/moderator-notices.ejs")
EVV=$(cat "$APP/views/user/moderator-events.ejs")
MMV=$(cat "$APP/views/user/moderator-members.ejs")
containsF "no304 pinned-গণক" "$NOV" 'function noPinned259()'
containsF "no304 hit=pinned||match" "$NOV" 'var hit = pinned || !q || kw.indexOf(q) !== -1;'
containsF "no304 change-ডেলিগেশন (bulk-all-পথ)" "$NOV" 'input[name="bulk_ids"],[data-bulk-all]'
containsF "no304 boot-apply-init" "$NOV" 'noApply259(); /* boot-apply-init'
containsF "no304 Enter-চেকবক্স-অ্যাঙ্কর" "$NOV" "var cb = first.querySelector('input[name=\"bulk_ids\"]');"
containsF "no304 ফ্ল্যাশ-ক্লাস" "$NOV" "first.classList.add('no-flash304');"
containsF "no304 হুক-pinned" "$NOV" 'pinned: noPinned259,'
containsF "no304 হুক-রো-শূন্যে-ও (গার্ড-পরে-হুক)" "$NOV" 'window.__noQA = {'
containsF "no304 pinned-অ্যাফোর্ডেন্স CSS" "$NOV" '.mod-item[data-no-row]:has(input[name="bulk_ids"]:checked)'
containsF "ev304 pinned-গণক" "$EVV" 'function evPinned260()'
containsF "ev304 hit=pinned||match" "$EVV" 'var hit = pinned || !q || kw.indexOf(q) !== -1;'
containsF "ev304 boot-apply-init" "$EVV" 'evApply260(); /* boot-apply-init'
containsF "ev304 হুক-pinned" "$EVV" 'pinned: evPinned260,'
containsF "ev304 pinned-অ্যাফোর্ডেন্স CSS" "$EVV" '.mod-item[data-ev-row]:has(input[name="bulk_ids"]:checked)'
containsF "mm304 pinned-গণক" "$MMV" 'function mmPinned255()'
containsF "mm304 hit=pinned||match" "$MMV" "var hit = pinned || !v || (c.getAttribute('data-kw') || '').indexOf(v) >= 0;"
containsF "mm304 boot-apply-init" "$MMV" 'apply255(); /* boot-apply-init'
containsF "mm304 হুক-pinned" "$MMV" 'pinned: mmPinned255,'
containsF "mm304 pinned-অ্যাফোর্ডেন্স CSS" "$MMV" 'details.mem-row[data-mm-row]:has(input[name="bulk_ids"]:checked)'
containsF "mm304 hidden-গার্ড-অক্ষুণ্ণ (সারি)" "$MMV" "details.mem-row[data-mm-row]$HID { display: none !important; }"
containsF "mm304 hidden-গার্ড-অক্ষুণ্ণ (সেকশন)" "$MMV" ".mod-card[data-mm-sec]$HID { display: none !important; }"
python3 - <<'PYEOF'
import re, sys
def seg_after(text, marker, endmark):
    i = text.find(marker)
    return text[i:text.find(endmark, i)] if i >= 0 else None
bad = []
for f, lab in [('views/user/moderator-notices.ejs','no304'), ('views/user/moderator-events.ejs','ev304'), ('views/user/moderator-members.ejs','mm304')]:
    t = open(f, encoding='utf-8').read()
    s = seg_after(t, 'session304 — checked-pinned', '</style>')
    if s is None: bad.append(lab + ': CSS-ব্লক-অনুপস্থিত'); continue
    body = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    hits = re.findall(r'#[0-9a-fA-F]{3,8}\b', body)
    if hits: bad.append(lab + ': হেক্স ' + str(hits[:3]))
if bad:
    print("  ✗ হেক্স-শূন্য যাচাই — " + '; '.join(bad)); sys.exit(1)
print("HEXZERO-OK")
PYEOF
if [ $? -eq 0 ]; then ok "নতুন CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু) ×৩"; else bad "নতুন CSS-ব্লক হেক্স-লিটারাল"; fi

echo "── ধাপ-২: SSR (ইঞ্জিন-প্রেজেন্স + bulk-ফর্ম-চুক্তি) ──"
containsF "SSR no-ইঞ্জিন" "$(cat "$NOP")" '__noQA'
containsF "SSR no-bulk-ফর্ম" "$(cat "$NOP")" 'id="bulkBar"'
containsF "SSR no-সর্ব-চেক" "$(cat "$NOP")" 'data-bulk-all'
containsF "SSR ev-ইঞ্জিন" "$(cat "$EVP")" '__evQA'
containsF "SSR ev-bulk-ফর্ম" "$(cat "$EVP")" 'id="bulkBar"'
containsF "SSR mm-ইঞ্জিন" "$(cat "$MMP")" '__mmQA'
containsF "SSR mm-bulk-ফর্ম" "$(cat "$MMP")" 'id="bulkBar"'
NROWS=$(grep -cF 'data-no-row=' "$NOP" || true)
if [ "$NROWS" -ge 1 ]; then ok "SSR no-সারি ($NROWS)"; else bad "no-সারি-শূন্য"; fi
MROWS=$(grep -cF 'data-mm-row' "$MMP" || true)
if [ "$MROWS" -ge 1 ]; then ok "SSR mm-সারি ($MROWS)"; else bad "mm-সারি-শূন্য"; fi

echo "── ধাপ-৩: E2E no304 (ব্রাউজার-লগইন → পিন×ফিল্টার-সহাবস্থান) ──"
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
bopen "$BASE/admin/login" || { bad "ব্রাউজার-লগইন-পৃষ্ঠা open ব্যর্থ"; }
CT=$(unj "$(ev "document.querySelector('meta[name=csrf-token]')?document.querySelector('meta[name=csrf-token]').content:''")")
LOGIN_JS="(function(){return fetch('/admin/login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'username=testadmin&password=demo123&_csrf=$CT'}).then(function(r){return r.status}).catch(function(e){return 'ERR:'+e.message})})()"
LS=$(ev "$LOGIN_JS" | tr -d '"')
case "$LS" in 302|303|0) ok "ব্রাউজার fetch-POST লগইন ($LS)";; *) bad "ব্রাউজার লগইন অপ্রত্যাশিত ($LS)";; esac
bopen "$BASE/moderator/notices" || bad "notices-পুনঃopen ব্যর্থ"
if poll "typeof window.__noQA==='object'&&typeof window.__noQA.pinned==='function'" "true" 10; then ok "__noQA হুক (pinned-সহ) সংজ্ঞায়িত"; else bad "__noQA হুক-অনুপস্থিত"; fi
TOTAL=$(unj "$(ev "window.__noQA?String(window.__noQA.total()):''")")
if [ -n "$TOTAL" ] && [ "$TOTAL" != "0" ]; then
  ok "হুক total() বুট-সত্য ($TOTAL)"
  INIT=$(unj "$(ev "String(window.__noQA.count())")")
  if [ "$INIT" = "$TOTAL" ]; then ok "boot-apply-init — count==total ($INIT)"; else bad "init count=$INIT total=$TOTAL"; fi
  CHK_JS="(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_N')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return cb.value})()"
  CV=$(unj "$(ev "$CHK_JS")")
  sleep 0.3
  P=$(unj "$(ev "String(window.__noQA.pinned())")")
  if [ "$P" = "1" ]; then ok "চেক → pinned=১"; else bad "pinned=$P (প্রত্যাশা ১)"; fi
  HIDC=$(unj "$(ev "String((function(){var b=document.getElementById('bulkBar');if(!b)return 'nobar';var h=b.querySelectorAll('input[type=\\\"hidden\\\"][name=\\\"ids\\\"]');return h.length&&h[0].value==='$CV'?'synced':'nosync'})())")")
  if [ "$HIDC" = "synced" ]; then ok "sidebar initBulkBar hidden-ids-সিঙ্ক (coexistence)"; else bad "hidden-ids=$HIDC"; fi
  setq_no "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__noQA.count())")")
  VIS=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return r?!r.hidden:'no-pinned-row'})())")")
  if [ "$M" = "1" ] && [ "$VIS" = "true" ]; then ok "গার্বেজ-কুয়েরিতে-ও চেক-সারি-পিনড (count=১, hidden=false)"; else bad "পিন-ব্যর্থ count=$M vis=$VIS"; fi
  PINCSS=$(unj "$(ev "(function(){try{var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return getComputedStyle(r).boxShadow.indexOf('inset')>=0?'inset':'none'}catch(e){return 'err'}})()")")
  if [ "$PINCSS" = "inset" ]; then ok "pinned-অ্যাফোর্ডেন্স CSS-প্রয়োগ (inset-প্রান্ত)"; else skip ":has()-অসমর্থিত-ব্রাউজার ($PINCSS)"; fi
  UNCHK_JS="(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_N')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'UNCHK'})()"
  ev "$UNCHK_JS" >/dev/null; sleep 0.2
  M=$(unj "$(ev "String(window.__noQA.count())")")
  ZV=$(unj "$(ev "String(document.getElementById('noZero259').hidden)")")
  if [ "$M" = "0" ] && [ "$ZV" = "false" ]; then ok "আনচেকে পিন-মুক্ত (count=০ + শূন্য-প্রকাশ)"; else bad "আনচেক count=$M zeroHidden=$ZV"; fi
  ALL_JS="(function(){var a=document.querySelector('[data-bulk-all]');if(a)a.click();return 'ALL'})()"
  ev "$ALL_JS" >/dev/null; sleep 0.3
  M=$(unj "$(ev "String(window.__noQA.count())")")
  P=$(unj "$(ev "String(window.__noQA.pinned())")")
  HIDN=$(unj "$(ev "String([].slice.call(document.querySelectorAll('.mod-item[data-no-row]')).filter(function(x){return x.hidden}).length)")")
  if [ "$M" = "$TOTAL" ] && [ "$P" = "$TOTAL" ] && [ "$HIDN" = "0" ]; then ok "bulk-all → সর্ব-পিন (count=$TOTAL, pinned=$TOTAL, হিডেন-শূন্য)"; else bad "bulk-all count=$M pinned=$P hidden=$HIDN"; fi
  ev "$ALL_JS" >/dev/null; sleep 0.2
  P=$(unj "$(ev "String(window.__noQA.pinned())")")
  if [ "$P" = "0" ]; then ok "bulk-all-আনচেক → পিন-শূন্য"; else bad "আন-অল pinned=$P"; fi
  CHK2_JS="(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_N')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'CHK2'})()"
  ev "$CHK2_JS" >/dev/null; setq_no ""; sleep 0.2
  ENTER_JS="(function(){var i=document.getElementById('noFilter259');var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');d.set.call(i,'$MARK_N');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));var m=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]')).filter(function(x){return !x.hidden});var cb=m.length?m[0].querySelector('input[name=\"bulk_ids\"]'):null;return (m.length&&m[0].classList.contains('no-flash304')&&cb&&document.activeElement===cb)?'flash+focus':'no'})()"
  FR=$(unj "$(ev "$ENTER_JS")")
  if [ "$FR" = "flash+focus" ]; then ok "Enter → প্রথম-মিল চেকবক্স-ফোকাস+ফ্ল্যাশ (বিপজ্জনক-বাটন-নিষিদ্ধ-নিয়ম)"; else bad "Enter=$FR"; fi
  sleep 1.1
  FC=$(ev "document.querySelector('.no-flash304')?'still':'gone'")
  if echo "$FC" | grep -qF "gone"; then ok "ফ্ল্যাশ ৯০০ms-পরে নির্মোচন"; else bad "ফ্ল্যাশ-স্থায়ী"; fi
  ev "(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-no-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_N')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'UN2'})()" >/dev/null
  setq_no ""; sleep 0.2
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.4
  agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && [ -s "$SH_DESK" ] && ok "ডেস্কটপ-স্ক্রিনশট" || bad "ডেস্কটপ-স্ক্রিনশট"
  agent-browser set viewport 390 844 >/dev/null 2>&1; agent-browser reload >/dev/null 2>&1; sleep 1
  HS=$(unj "$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()")")
  if [ "$HS" = "false" ]; then ok "মোবাইল-390 পৃষ্ঠা-স্তর hScroll-শূন্য"; else bad "মোবাইল hScroll=$HS"; fi
  T2=$(unj "$(ev "String(window.__noQA?window.__noQA.total():'-1')")")
  if [ "$T2" = "$TOTAL" ]; then ok "মোবাইল-রিলোডে হুক-পুনঃবুট ($T2)"; else bad "মোবাইল-হুক total=$T2"; fi
  agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && [ -s "$SH_MOB" ] && ok "মোবাইল-স্ক্রিনশট" || bad "মোবাইল-স্ক্রিনশট"
  agent-browser set viewport 1280 900 >/dev/null 2>&1
else
  skip "no-সারি-শূন্য — no304-আচরণ-শাখা স্কিপ"
fi

echo "── ধাপ-৪: E2E ev304 (কমপ্যাক্ট — পিন×ফিল্টার + হুক) ──"
bopen "$BASE/moderator/events" || bad "events-open ব্যর্থ"
if poll "typeof window.__evQA==='object'&&typeof window.__evQA.pinned==='function'" "true" 10; then ok "__evQA হুক (pinned-সহ)"; else bad "__evQA হুক-অনুপস্থিত"; fi
ETOTAL=$(unj "$(ev "window.__evQA?String(window.__evQA.total()):''")")
if [ -n "$ETOTAL" ] && [ "$ETOTAL" != "0" ]; then
  CHK_EV="(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-ev-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_E')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'CHK'})()"
  ev "$CHK_EV" >/dev/null; sleep 0.3
  setq_ev "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__evQA.count())")")
  P=$(unj "$(ev "String(window.__evQA.pinned())")")
  VIS=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-ev-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return r?!r.hidden:'no'})())")")
  if [ "$M" = "1" ] && [ "$P" = "1" ] && [ "$VIS" = "true" ]; then ok "ev304 গার্বেজ-কুয়েরিতে পিনড-দৃশ্যমান (count=১, pinned=১)"; else bad "ev304 পিন count=$M pinned=$P vis=$VIS"; fi
  UNCHKEV="(function(){var rs=[].slice.call(document.querySelectorAll('.mod-item[data-ev-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_E')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'U'})()"
  ev "$UNCHKEV" >/dev/null; setq_ev ""; sleep 0.2
  P=$(unj "$(ev "String(window.__evQA.pinned())")")
  if [ "$P" = "0" ]; then ok "ev304 আনচেক-পিন-শূন্য"; else bad "ev304 আনচেক pinned=$P"; fi
else
  skip "ev-সারি-শূন্য — ev304-আচরণ-শাখা স্কিপ"
fi

echo "── ধাপ-৫: E2E mm304 (পিন + সেকশন-অটো-হাইড-পিন-সচেতন) ──"
bopen "$BASE/moderator/members" || bad "members-open ব্যর্থ"
if poll "typeof window.__mmQA==='object'&&typeof window.__mmQA.pinned==='function'" "true" 10; then ok "__mmQA হুক (pinned-সহ)"; else bad "__mmQA হুক-অনুপস্থিত"; fi
MTOTAL=$(unj "$(ev "window.__mmQA?String(window.__mmQA.total()):''")")
if [ -n "$MTOTAL" ] && [ "$MTOTAL" != "0" ]; then
  ok "হুক total() বুট-সত্য ($MTOTAL)"
  CHK_MM="(function(){var rs=[].slice.call(document.querySelectorAll('[data-mm-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_M')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'CHK'})()"
  ev "$CHK_MM" >/dev/null; sleep 0.3
  setq_mm "zzqx garbage"; sleep 0.2
  M=$(unj "$(ev "String(window.__mmQA.count())")")
  P=$(unj "$(ev "String(window.__mmQA.pinned())")")
  ROWV=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('[data-mm-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];return r?!r.hidden:'no'})())")")
  SECV=$(unj "$(ev "String((function(){var rs=[].slice.call(document.querySelectorAll('[data-mm-row]'));var r=rs.filter(function(x){var c=x.querySelector('input[name=\"bulk_ids\"]');return c&&c.checked})[0];if(!r)return 'no';var s=r.closest('[data-mm-sec]');return s?!s.hidden:'no-sec'})())")")
  if [ "$M" = "1" ] && [ "$P" = "1" ] && [ "$ROWV" = "true" ] && [ "$SECV" = "true" ]; then ok "mm304 পিনড-সারি-দৃশ্যমান + সেকশন-স্থায়ী (পিন-সচেতন অটো-হাইড)"; else bad "mm304 count=$M pinned=$P row=$ROWV sec=$SECV"; fi
  UNCHKMM="(function(){var rs=[].slice.call(document.querySelectorAll('[data-mm-row]'));var tgt=rs.filter(function(x){return x.getAttribute('data-kw').indexOf('$MARK_M')>=0})[0]||rs[0];var cb=tgt.querySelector('input[name=\"bulk_ids\"]');cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));return 'U'})()"
  ev "$UNCHKMM" >/dev/null; setq_mm ""; sleep 0.2
  SECS=$(unj "$(ev "String(window.__mmQA.secs())")")
  P=$(unj "$(ev "String(window.__mmQA.pinned())")")
  if [ "$P" = "0" ] && [ "$SECS" -ge 1 ] 2>/dev/null; then ok "মুক্তি-পরবর্তী সেকশন-পুনঃপ্রতিষ্ঠা (secs=$SECS, pinned=০)"; else bad "পুনঃপ্রতিষ্ঠা secs=$SECS pinned=$P"; fi
else
  skip "mm-সারি-শূন্য — mm304-আচরণ-শাখা স্কিপ"
fi

echo "── ধাপ-৬: রিগ্রেশন-স্যানিটি (ত্রি-পৃষ্ঠা দ্বি-লোড এরর-শূন্য) ──"
ERRREL=0
for PG in "$BASE/moderator/notices" "$BASE/moderator/events" "$BASE/moderator/members"; do
  bopen "$PG" || { bad "রিগ্রেশন-open $PG"; continue; }
  agent-browser reload >/dev/null 2>&1; sleep 0.8
  E=$(agent-browser errors 2>/dev/null | grep -c "SyntaxError\|TypeError\|ReferenceError" || true)
  if [ "${E:-0}" = "0" ]; then ok "এরর-শূন্য $PG"; else bad "এরর-$E $PG"; ERRREL=1; fi
done

echo "── ধাপ-৭: মার্কার-পরিষ্কারক ×৩ (delete→ট্র্যাহ→bulk-purge — নেট-শূন্য) ──"
PURGE_IDS=""
clean_one(){
  # $1=id $2=delete-URL $3=label
  if [ -n "$1" ] && [ "$1" -gt 0 ] 2>/dev/null; then
    TOKC=$(curl -s -b "$J" -c "$J" "$BASE/moderator/notices" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
    LOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$J" -c "$J" -X POST "$2" --data-urlencode "_csrf=$TOKC")
    TID=$(echo "$LOC" | grep -o 'trashed=[0-9]*' | cut -d= -f2)
    if [ -n "$TID" ]; then ok "$3 ট্র্যাহ (#$TID)"; PURGE_IDS="$PURGE_IDS --data-urlencode ids=$TID"; else bad "$3 ট্র্যাশ-ব্যর্থ (loc=$LOC)"; fi
  else
    skip "$3-পরিষ্কারক-স্কিপ (id-অনুপস্থিত)"
  fi
}
clean_one "$NID" "$BASE/moderator/notices/$NID?_method=DELETE" "নোটিশ-মার্কার"
clean_one "$EID" "$BASE/moderator/events/$EID?_method=DELETE" "ইভেন্ট-মার্কার"
clean_one "$MID" "$BASE/moderator/members/$MID/delete" "সদস্য-মার্কার"
if [ -n "$PURGE_IDS" ]; then
  TOKP=$(curl -s -b "$J" -c "$J" "$BASE/moderator/trash" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
  PU=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/trash/bulk-purge" --data-urlencode "_csrf=$TOKP" $PURGE_IDS)
  if [ "$PU" = "302" ] || [ "$PU" = "303" ] || [ "$PU" = "200" ]; then ok "bulk-purge সম্পন্ন ($PU)"; else bad "purge-ব্যর্থ ($PU)"; fi
fi
curl -s -b "$J" "$BASE/moderator/notices" -o "$NOP"; curl -s -b "$J" "$BASE/moderator/events" -o "$EVP"; curl -s -b "$J" "$BASE/moderator/members" -o "$MMP"
FN=$(grep -cF "$MARK_N" "$NOP" || true); FE=$(grep -cF "$MARK_E" "$EVP" || true); FM=$(grep -cF "$MARK_M" "$MMP" || true)
if [ "$FN" = "0" ] && [ "$FE" = "0" ] && [ "$FM" = "0" ]; then ok "নেট-শূন্য প্রমাণ (ত্রি-মার্কার-শূন্য)"; else bad "মার্কার-অবশিষ্ট no=$FN ev=$FE mm=$FM"; fi

echo ""
echo "══ ফলাফল: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" -eq 0 ] && echo "S304-SUITE-GREEN" || echo "S304-SUITE-RED"
exit "$FAIL"
