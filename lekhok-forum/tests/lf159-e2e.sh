#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# tests/lf159-e2e.sh — সেশন ১৫৯ E2E (এক-ইনভোকেশন: সার্ভার + হারনেস)
# সুযোগ: ফিড-রেল সার্চ + কোর-শর্টকাট (ইউজার TSX FeedLeftSidebar-স্পেক) —
#   ① সার্বক্ষণিক মেনু-সার্চ (fr-search159; label+desc ফিল্টার, সেকশন-টাইটেল-অটো-লুকানো,
#     শূন্য-অবস্থা) ② FB-কোর-শর্টকাট — সংরক্ষিত(/bookmarks)/মেমোরিজ(/on-this-day)/
#     গ্রুপ(/messages)/পেজ(/press) + মতামত ও ফিডব্যাক(/complaints) ③ সেকশন-টাইটেল +
#     'নতুন' ব্যাজ ④ session156 স্ক্রল-লক রিগ্রেশন ⑤ মোবাইল-390px ⑥ কনসোল-০
# ═══════════════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
chk(){ if [ "$1" = "$2" ]; then ok "$3"; else bad "$3 (got=$1 want=$2)"; fi; }

PORT=8080
BASE="http://localhost:$PORT"
AB="agent-browser"
# agent-browser eval JSON-কোটে মোড়ে → স্ট্রিপ-হেল্পার (lf159-হারনেস-লেসন)
EV(){ EV "$1" | sed 's/^"//;s/"$//' | tr -d '\r'; }

echo "── [0] সার্ভার-বুট"
pkill -9 -f "node server.js" 2>/dev/null; sleep 0.8
PORT=$PORT LF_QA_DISABLE_RATELIMIT=1 node server.js > /tmp/lf159-server.log 2>&1 &
SRV=$!
H=""
for i in $(seq 1 25); do sleep 1; H=$(curl -s "$BASE/api/health" 2>/dev/null || true); echo "$H" | rg -q '"status":"healthy"' && break; done
echo "$H" | rg -q '"status":"healthy"' && ok "health=healthy" || { bad "health: $H"; tail -30 /tmp/lf159-server.log; exit 1; }

echo "── [1] /dashboard HTML-মার্কার (গেস্ট)"
D=$(curl -s "$BASE/dashboard")
echo "$D" | rg -q 'id="frSearch159"'          && ok "সার্চ-ইনপুট (frSearch159)"          || bad "সার্চ-ইনপুট অনুপস্থিত"
echo "$D" | rg -q 'ফিচার বা মেনু খুঁজুন'      && ok "সার্চ-প্লেসহোল্ডার"                  || bad "সার্চ-প্লেসহোল্ডার"
echo "$D" | rg -q 'href="/bookmarks"'         && ok "সংরক্ষিত লেখা → /bookmarks"         || bad "/bookmarks লিংক"
echo "$D" | rg -q 'href="/on-this-day"'       && ok "স্মৃতি ও মেমোরিজ → /on-this-day"    || bad "/on-this-day লিংক"
echo "$D" | rg -q 'href="/messages"'          && ok "পাঠচক্র ও গ্রুপ → /messages"         || bad "/messages লিংক"
echo "$D" | rg -q 'href="/press"'             && ok "পত্রিকা ও পেজ → /press"             || bad "/press লিংক"
echo "$D" | rg -q 'href="/complaints"'        && ok "মতামত ও ফিডব্যাক → /complaints"     || bad "/complaints লিংক"
echo "$D" | rg -q 'fr-sec-title157'          && ok "সেকশন-টাইটেল রেন্ডার"               || bad "সেকশন-টাইটেল অনুপস্থিত"
echo "$D" | rg -q 'fr-badge157'               && ok "'আজকের' ব্যাজ (ই-পেপার — session157-ক্যানোনিকাল)"             || bad "'আজকের' ব্যাজ"
echo "$D" | rg -q 'data-fr-hay'               && ok "data-fr-hay ফিল্টার-অ্যাট্রি"        || bad "data-fr-hay"
echo "$D" | rg -q 'কোনো মেনু মেলেনি'          && ok "সার্চ-শূন্য-অবস্থা মার্কআপ"          || bad "শূন্য-অবস্থা মার্কআপ"
echo "$D" | rg -q '© ২০২৬'                    && ok "রেল-ফুটার © ২০২৬"                   || bad "রেল-ফুটার"
CNT=$(echo "$D" | rg -c 'class="fr-item' | head -1); chk "$CNT" 16 "fr-item মোট = ১৬"
echo "$D" | rg -q 'দ্রুত অ্যাক্সেস' && bad "অপ্রত্যাশিত: হেডার-প্যানেলে কোর-টাইটেল (প্যানেল=utilSections)" || ok "হেডার-প্যানেল utilSections (ডিরেক্টরি কেবল রেলে)"

echo "── [2] রুট-স্মোক (টার্গেট-পেজ)"
chk "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/press")" 200 "/press → 200"
chk "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/on-this-day")" 200 "/on-this-day → 200"
chk "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/bookmarks")" 302 "/bookmarks গেস্ট → 302 (login-গার্ড)"
chk "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/messages")" 302 "/messages গেস্ট → 302"
chk "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/complaints")" 302 "/complaints গেস্ট → 302"

echo "── [3] লগইন-রেল (fr-me সাবটাইটেল) — টেস্ট-ইউজার থাকলে"
J=/tmp/lf159.jar; rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/login" --data-urlencode "username=testuser" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK"
DL=$(curl -s -b "$J" -c "$J" "$BASE/dashboard")
if echo "$DL" | rg -q 'fr-me-sub157'; then
  echo "$DL" | rg -q 'ব্যক্তিগত প্রোফাইল' && ok "প্রোফাইল-স্ট্রিপে 'ব্যক্তিগত প্রোফাইল' সাবটাইটেল" || bad "সাবটাইটেল অনুপস্থিত"
else
  echo "  – টেস্ট-ইউজার অনুপস্থিত — লগইন-চেক স্কিপ (গেস্ট-ফ্লো যথেষ্ট)"
fi

echo "── [4] ব্রাউজার-E2E (playwright এক-প্রসেস — fork-safe; স্যান্ডবক্স-লেসন: agent-browser CLI per-call fork → fork-exhaustion)"
LF_BASE="$BASE" node tests/lf159-browser.js
BRC=$?
chk "$BRC" 0 "playwright স্যুট সবুজ (সার্চ-ফিল্টার+কোর-শর্টকাট+স্ক্রল-লক+মোবাইল)"

echo ""
echo "════════ ফলাফল: PASS=$PASS FAIL=$FAIL ════════"
[ "$FAIL" = "0" ] && echo "🟢 ALL GREEN — session159" || echo "🔴 লাল — উপরের ✗ দেখুন"
exit $FAIL
