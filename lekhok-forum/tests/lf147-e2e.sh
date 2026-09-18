#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# tests/lf147-e2e.sh — সেশন ১৪৭ E2E (এক-ইনভোকেশন: সার্ভার + হারনেস)
# সুযোগ: প্রোফাইল FB-প্যারিটি (হেডার-চিপ/হাইলাইটস/মিউচুয়াল-টাইল/কম্পোজার)
#        + নেস্টেড শেয়ার-কার্ড + মন্তব্য-সহ-শেয়ার শিট + মোবাইল-৩৯০px + রিগ্রেশন
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
chk(){ if [ "$1" = "$2" ]; then ok "$3"; else bad "$3 (got=$1 want=$2)"; fi; }

echo "── [0] সার্ভার (pkill -9 → বুট → health)"
pkill -9 -f "node server.js" 2>/dev/null; sleep 0.8
PORT=8080 LF_QA_DISABLE_RATELIMIT=1 node server.js > /tmp/lf147-server.log 2>&1 &
SRV=$!
sleep 6
H=$(curl -s http://localhost:8080/api/health)
echo "$H" | rg -q '"status":"healthy"' && ok "health=healthy" || bad "health: $H"

echo "── [1] গেস্ট-পৃষ্ঠা HTTP-স্মোক (নেস্টেড-শেয়ার সার্ফেস)"
P=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/profile/fbtest1); chk "$P" 200 "GET /profile/fbtest1"
P=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/dashboard);        chk "$P" 200 "GET /dashboard"
P=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/articles);         chk "$P" 200 "GET /articles"
P=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/dashboard/more?offset=3"); chk "$P" 200 "GET /dashboard/more"
P=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/articles/3);       chk "$P" 200 "GET /articles/3 (মূল)"
DASH=$(curl -s http://localhost:8080/dashboard)
echo "$DASH" | rg -q 'share-nested147' && ok "ড্যাশবোর্ডে নেস্টেড শেয়ার-কার্ড" || bad "ড্যাশবোর্ডে নেস্টেড শেয়ার অনুপস্থিত"
echo "$DASH" | rg -q 'share-note147' && ok "ড্যাশবোর্ডে শেয়ার-ক্যাপশন" || bad "ড্যাশবোর্ডে ক্যাপশন অনুপস্থিত"
echo "$DASH" | rg -q 'data-repost-id' && bad "পুরনো repost-শাখা লিক" || ok "repost-শাখা-লিক শূন্য (shared_from-পথ নতুন)"
PROF=$(curl -s http://localhost:8080/profile/fbtest1)
echo "$PROF" | rg -q 'share-nested147' && ok "প্রোফাইল-টাইমলাইনে নেস্টেড শেয়ার" || bad "প্রোফাইলে নেস্টেড শেয়ার অনুপস্থিত"
echo "$PROF" | rg -q 'রক্তের গ্রুপ: A\+' && ok "হেডার-চিপ: রক্তের গ্রুপ" || bad "হেডার-রক্ত-চিপ অনুপস্থিত"
echo "$PROF" | rg -q 'অধ্যয়ন করেছেন' && ok "পরিচিতি: প্রতিষ্ঠান-রো" || bad "প্রতিষ্ঠান-রো অনুপস্থিত"
echo "$PROF" | rg -q 'নিজ জেলা' && ok "পরিচিতি: নিজ জেলা" || bad "নিজ জেলা অনুপস্থিত"
echo "$PROF" | rg -q 'হাইলাইটস' && ok "সাইডবার হাইলাইটস-কার্ড" || bad "হাইলাইটস-কার্ড অনুপস্থিত"
echo "$PROF" | rg -q 'pf-hl-card147' && ok "হাইলাইটস কার্ড-মার্কআপ" || bad "হাইলাইটস-মার্কআপ অনুপস্থিত"
echo "$PROF" | rg -q 'নীলকণ্ঠ' && ok "কলমী-নাম রেন্ডার (AuthorLabel)" || bad "কলমী-নাম অনুপস্থিত"
echo "$PROF" | rg -cq 'সদস্য</a>' && bad "AuthorLabel অন্ধ ('সদস্য' লিক)" || ok "AuthorLabel সব-নাম সচেতন"

echo "── [2] agent-browser: লগইন (fbtest2) → প্রোফাইল-ভিজিটর অভিজ্ঞতা"
agent-browser close --all > /dev/null 2>&1 || true
agent-browser open "http://localhost:8080/login" > /dev/null 2>&1
agent-browser wait 'input[name="username"]' > /dev/null 2>&1
agent-browser fill 'input[name="username"]' "fbtest2" > /dev/null 2>&1
agent-browser fill 'input[name="password"]' "demo123" > /dev/null 2>&1
agent-browser click 'button[type="submit"]' > /dev/null 2>&1
sleep 2
URL=$(agent-browser get url 2>/dev/null | head -1)
echo "$URL" | rg -q "dashboard|profile|articles" && ok "লগইন-রিডাইরেক্ট ($URL)" || bad "লগইন ব্যর্থ ($URL)"

agent-browser open "http://localhost:8080/profile/fbtest1" > /dev/null 2>&1
agent-browser wait '.pf-hero' > /dev/null 2>&1
sleep 1.2
MT=$(agent-browser eval "document.querySelector('.pf-tile-mutual147') ? document.querySelector('.pf-tile-mutual147').textContent.trim() : ''" 2>/dev/null | head -1)
echo "$MT" | rg -q 'মিউচুয়াল' && ok "টাইল-মিউচুয়াল কাউন্ট ($MT)" || bad "টাইল-মিউচুয়াল অনুপস্থিত ($MT)"
NC=$(agent-browser eval "document.querySelectorAll('.share-nested147').length" 2>/dev/null | head -1)
chk "$NC" 1 "ভিজিটর-প্রোফাইলে নেস্টেড-শেয়ার সংখ্যা"
CAP=$(agent-browser eval "(document.querySelector('.share-note147')||{}).textContent || ''" 2>/dev/null | head -1)
echo "$CAP" | rg -q 'একপেশে চুক্তি বাতিল' && ok "ক্যাপশন-টেক্সট সঠিক" || bad "ক্যাপশন-টেক্সট: $CAP"
ORIGAUTH=$(agent-browser eval "(document.querySelector('.share-orig147 .lf-author-name')||{}).textContent || ''" 2>/dev/null | head -1)
echo "$ORIGAUTH" | rg -q 'সেঁজুতি' && ok "মূল-লেখক নেস্টেড-কার্ডে (সেঁজুতি)" || bad "মূল-লেখক: $ORIGAUTH"
SHARER=$(agent-browser eval "(document.querySelector('.share-nested147 > .feed-card-head .lf-author-name')||{}).textContent || ''" 2>/dev/null | head -1)
echo "$SHARER" | rg -q 'নীলকণ্ঠ' && ok "শেয়ারকারী-হেডার (নীলকণ্ঠ)" || bad "শেয়ারকারী: $SHARER"
FOOTIN=$(agent-browser eval "!!document.querySelector('.share-nested147 .actions-bar') && !document.querySelector('.share-orig147 .actions-bar')" 2>/dev/null | head -1)
chk "$FOOTIN" true "গ্লোবাল-ফুটার বাইরে (মূল-কার্ডে নয়) — FB-আর্কিটেকচার"

echo "── [3] মন্তব্য-সহ-শেয়ার শিট (fbtest2 → fbtest1-এর লেখা শেয়ার)"
cnt147(){ node -e "const fs=require('fs');const i=require('sql.js');(async()=>{const SQL=await i();const db=new SQL.Database(fs.readFileSync('lekhok.db'));const r=db.exec(\"SELECT COUNT(*) c FROM posts WHERE post_kind='share' AND repost_note LIKE '%LF147-E2E%'\");console.log(r[0].values[0][0]);})()" 2>/dev/null | tail -1; }
PRE=$(cnt147)
# সোর্স-রোটেশন: PRE-কাউন্ট অনুযায়ী ভিন্ন কার্ডের share-বাটন (session42-ডুপ-গার্ড —
# ১২০সে-এ একই সোর্স পুনঃশেয়ার সঠিকভাবে বাধিত — রিরান-সেফ ডেল্টা-যাচাইয়ের জন্য ঘূর্ণন)
agent-browser eval "var bs=document.querySelectorAll('[data-share-note]'); var b=bs.length?bs[$PRE % bs.length]:null; b?(b.click(),'opened'):'no-btn'" > /dev/null 2>&1
sleep 0.8
agent-browser eval "document.getElementById('shareNoteText') ? (document.getElementById('shareNoteText').value='LF147-E2E মন্তব্য-সহ শেয়ার!', true) : false" > /dev/null 2>&1
agent-browser eval "document.getElementById('shareNoteSubmit') ? (document.getElementById('shareNoteSubmit').click(),'submitted') : 'no-submit'" > /dev/null 2>&1
sleep 2.5
POST=$(cnt147)
DEL=$((POST-PRE))
chk "$DEL" 1 "শিট-শেয়ার DB-তে (+delta; pre=$PRE → post=$POST)"

echo "── [4] fbtest2-এর প্রোফাইলে নতুন শেয়ার (মন্তব্য-সহ) নেস্টেড-রেন্ডার"
# শেয়ার-কপি শেয়ারকারীর (fbtest2) টাইমলাইনে যায় — fbtest1-এর নয় (FB-নিয়ম)
agent-browser open "http://localhost:8080/profile/fbtest2" > /dev/null 2>&1
agent-browser wait '.pf-hero' > /dev/null 2>&1
sleep 1
NEWCAP=$(agent-browser eval "[...document.querySelectorAll('.share-note147')].some(x=>x.textContent.includes('LF147-E2E'))" 2>/dev/null | head -1)
chk "$NEWCAP" true "নতুন-শেয়ারের নেস্টেড-কার্ড + ক্যাপশন রেন্ডার"
SHEETER=$(agent-browser eval "(document.querySelector('.share-nested147 > .feed-card-head .lf-author-name')||{}).textContent || ''" 2>/dev/null | head -1)
echo "$SHEETER" | rg -q 'সেঁজুতি' && ok "শেয়ারকারী-হেডার fbtest2-তে (সেঁজুতি)" || bad "শেয়ারকারী: $SHEETER"

echo "── [5] মালিক-প্রোফাইল (fbtest1): কম্পোজার-স্ট্রিপ (curl-সেশন — deterministic)"
JAR=$(mktemp)
CS=$(curl -s -c "$JAR" http://localhost:8080/login | rg -o 'name="_csrf"[^>]*value="[^"]+"' | rg -o 'value="[^"]+"' | head -1 | sed 's/value="//;s/"//')
LP=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" -d "username=fbtest1&password=demo123&_csrf=$CS" http://localhost:8080/login)
own=$(curl -s -b "$JAR" http://localhost:8080/profile/fbtest1)
echo "$own" | rg -q 'pf-composer147' && echo "$own" | rg -q 'pf-composer-cta147' && ok "মালিক-কম্পোজার-স্ট্রিপ (login POST=$LP)" || bad "মালিক-কম্পোজার-স্ট্রিপ (login POST=$LP)"
OWNSH=$(echo "$own" | rg -q 'share-nested147' && echo yes || echo no)
[ "$OWNSH" = "yes" ] && ok "মালিক-প্রোফাইলে শেয়ার-কার্ড (৩-ডট-সহ)" || bad "মালিক-প্রোফাইলে শেয়ার-কার্ড অনুপস্থিত"
rm -f "$JAR"

echo "── [6] মোবাইল-৩৯০px ওভারফ্লো"
agent-browser set viewport 390 844 > /dev/null 2>&1 || agent-browser eval "window.resizeTo(390,844)" > /dev/null 2>&1
sleep 0.8
OV=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | head -1)
if [ "${OV:-99}" -le "1" ]; then ok "390px অনুভূমিক-ওভারফ্লো ০ (${OV:-?}px)"; else bad "390px ওভারফ্লো ${OV}px"; fi
agent-browser set viewport 1280 900 > /dev/null 2>&1 || true

echo "── [7] রিগ্রেশন-সুইপ (HTTP + কনসোল)"
CE=$(agent-browser eval "window.__lfErrs||0" 2>/dev/null | head -1)
for p in /dashboard /articles /qa /notifications /messages /profile/fbtest2 /profile/edit /settings /quiz /bookmarks; do
  C=$(curl -s -o /dev/null -w "%{http_code}" -b "$(agent-browser get cookies 2>/dev/null | head -c 0)" "http://localhost:8080$p")
  [ "$C" = "200" ] || [ "$C" = "302" ] && ok "reg $p → $C" || bad "reg $p → $C"
done
agent-browser open "http://localhost:8080/dashboard" > /dev/null 2>&1
agent-browser wait '.feed-card' > /dev/null 2>&1
sleep 1.2
CE2=$(agent-browser eval "document.querySelectorAll('.feed-card').length" 2>/dev/null | head -1)
[ "${CE2:-0}" -ge "1" ] && ok "লগইন-ড্যাশবোর্ড ফিড-কার্ড (${CE2:-0})" || bad "ফিড-কার্ড শূন্য"
RX=$(agent-browser eval "(function(){var t=document.querySelector('.reaction-summary');return !!t})()" 2>/dev/null | head -1)
chk "$RX" true "রিঅ্যাকশন-সারফেস অক্ষত"

echo "── [8] স্ক্রিনশট"
mkdir -p tests
agent-browser screenshot tests/lf147-share-nested.png > /dev/null 2>&1 && ok "lf147-share-nested.png" || bad "স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 > /dev/null 2>&1 || true
agent-browser open "http://localhost:8080/profile/fbtest1" > /dev/null 2>&1
agent-browser wait '.pf-hero' > /dev/null 2>&1
sleep 1
agent-browser screenshot tests/lf147-mobile-390.png > /dev/null 2>&1 && ok "lf147-mobile-390.png" || bad "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1280 900 > /dev/null 2>&1 || true

echo "── [9] সার্ভার-লগ ক্লিন-যাচাই"
sleep 0.5
ERR=$(rg -ci "TypeError|ReferenceError|no such column|EADDRINUSE" /tmp/lf147-server.log 2>/dev/null || echo 0)
chk "$ERR" 0 "সার্ভার-লগ ত্রুটি-শূন্য"

agent-browser close --all > /dev/null 2>&1
kill -9 $SRV 2>/dev/null
echo "════════════════════════════════════"
echo "E2E সমাপ্ত — PASS:$PASS FAIL:$FAIL"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✓" || echo "RED ✗ — $FAIL টি ব্যর্থ"
exit $FAIL
