#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# s294-strip-suite.sh — session294 QA: ই-পেপার কুইক-সুইচ স্ট্রিপ (ep294)
# ইউজার-স্পেক অবস্থান ২ — কন্ট্রোল-বারের ঠিক উপরে হরিজন্টাল কুইক-ট্যাব।
# ধারা: কাঠামো (markup/hook/CSS hex-zero) + সার্ভার-রেন্ডার (পিল=ডিডুপ-পত্রিকা,
#       লেবেল/লিংক) + ব্রাউজার-বুট/ক্লিক (সক্রিয়-পিল-সিঙ্ক, date-aware) + মোবাইল।
# নির্ভরতা: s280-qa সিড (পেলোড-শূন্য হলে স্বয়ং-সিড — সিডার সার্ভার-বন্ধে-চালান-গোটচা)।
# ব্যবহার: bash tests/s294-strip-suite.sh   (ensure-server :8094 স্বয়ং-নিশ্চিত)
# ═══════════════════════════════════════════════════════════════════════════
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$(cd "$SCRIPT_DIR/.." && pwd)"          # lekhok-forum/lekhok-forum (views/, public/)
ROOT="$(cd "$APP/.." && pwd)"                # মনোরিপো-রুট (ensure-server.sh)
BASE="${S294_BASE:-http://localhost:8094}"
PASS=0; FAIL=0; SKIP=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip() { SKIP=$((SKIP+1)); echo "  ∅ $1 (skip)"; }
# agent-browser eval রিটার্ন = JSON-এনকোডেড-স্ট্রিং ("{\"k\":v}") → আন-এস্কেপ
unj() { sed -e 's/\\"/"/g' -e 's/^"//' -e 's/"$//'; }

echo "── s294 স্ট্রিপ-সুইট ──"

# ০. সার্ভার-নিশ্চিত
if ! curl -s -o /dev/null -m 2 "$BASE/"; then
  bash "$ROOT/ensure-server.sh" >/dev/null 2>&1 || { bad "QA-সার্ভার বুট ব্যর্থ"; echo "PASS=$PASS FAIL=$FAIL"; exit 1; }
fi

# ১. পেলোড-শূন্য হলে স্বয়ং-সিড
H="$(curl -s "$BASE/epaper")"
if ! echo "$H" | grep -q 'data-papers="' ; then
  echo "── পেলোড-শূন্য → s280-সিডার স্বয়ং-রান (সার্ভার-বন্ধে) ──"
  pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.5
  (cd "$APP" && node scripts/s280-seed-epaper.js >/dev/null 2>&1)
  bash "$ROOT/ensure-server.sh" >/dev/null 2>&1
  H="$(curl -s "$BASE/epaper")"
fi

echo "── কাঠামো ──"
EP="$APP/views/user/epaper.ejs"
CSS="$APP/public/assets/css/epaper.css"
grep -q 'id="epStrip294"' "$EP" && ok "স্ট্রিপ-নেভ মার্কআপ (epStrip294)" || bad "স্ট্রিপ-নেভ অনুপস্থিত"
grep -q 'window.__epStrip294Sync(p)' "$EP" && ok "syncPaperSelect-হুক-লাইন (guarded)" || bad "হুক-লাইন অনুপস্থিত"
grep -q 'window.__epStrip294Sync = sync294' "$EP" && ok "ক্লায়েন্ট-হুক-সংজ্ঞা (ইঞ্জিন-স্ক্রিপ্ট-পূর্বে)" || bad "হুক-সংজ্ঞা অনুপস্থিত"
grep -q 'epaper?view=dir' "$EP" && ok "সকল-পত্রিকা → ?view=dir" || bad "ডিরেক্টরি-লিংক অনুপস্থিত"
grep -q 'aria-label="শীর্ষ পত্রিকা দ্রুত-সুইচ"' "$EP" && ok "স্ট্রিপ a11y-লেবেল" || bad "a11y-লেবেল অনুপস্থিত"
grep -q 'session294 — কুইক-সুইচ স্ট্রিপ' "$CSS" && ok "CSS session294-ব্লক" || bad "CSS-ব্লক অনুপস্থিত"

# CSS-ব্লক hex-zero (র‍্যাচেট-চুক্তি) — ব্লক-বিস্তার লাইন-সংখ্যা-ভিত্তিক (grep -F ফিক্সড-স্ট্রিং)
S294="$(grep -n -F 'session294 — কুইক-সুইচ স্ট্রিপ' "$CSS" | head -1 | cut -d: -f1)"
E294="$(grep -n -F 'prefers-reduced-motion: reduce) { .ep-strip294-pill { transition: none; } }' "$CSS" | tail -1 | cut -d: -f1)"
if [ -n "$S294" ] && [ -n "$E294" ] && [ "$E294" -gt "$S294" ]; then
  HEXN="$(sed -n "${S294},${E294}p" "$CSS" | grep -cE '#[0-9a-fA-F]{3,8}' || true)"
  [ "$HEXN" = "0" ] && ok "CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)" || bad "CSS-ব্লকে hex=$HEXN"
else
  bad "CSS-ব্লক-বিস্তার নির্ণয় ব্যর্থ (S=$S294 E=$E294)"
fi

echo "── সার্ভার-রেন্ডার ──"
PILLN="$(echo "$H" | grep -o 'data-ep-strip294="' | wc -l | tr -d ' ')"
if [ "$PILLN" -ge 1 ]; then
  ok "পিল-রেন্ডার ($PILLN-টি — ডিডুপ-পত্রিকা ≤৮)"
  echo "$H" | grep -q 'ep-strip294-all' && ok "সকল-পত্রিকা-লিংক রেন্ডারড" || bad "সকল-পত্রিকা-লিংক অনুপস্থিত"
  echo "$H" | grep -q 'ep-strip294-lbl' && ok "শীর্ষ-পত্রিকা-লেবেল রেন্ডারড" || bad "লেবেল অনুপস্থিত"
else
  skip "পিল-রেন্ডার — epaper-পেলোড-শূন্য (বট-সিঙ্ক-নির্ভর পরিবেশ)"
  skip "সকল-পত্রিকা-লিংক রেন্ডার"
  skip "শীর্ষ-পত্রিকা-লেবেল রেন্ডার"
fi

echo "── ব্রাউজার-বুট/ক্লিক (agent-browser) ──"
if command -v agent-browser >/dev/null 2>&1 && [ "$PILLN" -ge 1 ]; then
  agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 2.5
  B="$(agent-browser eval "JSON.stringify({pills: document.querySelectorAll('.ep-strip294-pill').length, active: (document.querySelector('.ep-strip294-pill.is-active')||{}).getAttribute('data-ep-strip294')||'', hook: typeof window.__epStrip294Sync, aria: !!document.querySelector('.ep-strip294-pill[aria-current=page]')})" 2>/dev/null | tail -1 | unj)"
  echo "$B" | grep -q "\"pills\":$PILLN" && ok "ব্রাউজারে পিল-সংখ্যা=SSR ($PILLN)" || bad "পিল-সংখ্যা-অমিল: $B"
  echo "$B" | grep -q '"hook":"function"' && ok "হুক-ফাংশন সংজ্ঞায়িত" || bad "হুক-অনুপস্থিত"
  echo "$B" | grep -q '"active":"[^"]' && ok "বুটে-সক্রিয়-পিল স্বয়ং-সিঙ্কড (top-rank)" || bad "বুটে-সক্রিয়-পিল-শূন্য"
  echo "$B" | grep -q '"aria":true' && ok "aria-current=page স্থাপিত" || bad "aria-current-অনুপস্থিত"
  LASTN="$(echo "$H" | grep -o 'data-ep-strip294="[^"]*"' | tail -1 | sed 's/.*="//;s/"$//')"
  C="$(agent-browser eval "var ps=document.querySelectorAll('.ep-strip294-pill'); var tgt=ps[ps.length-1]; tgt.click(); 'clicked'" 2>/dev/null | tail -1; sleep 1.8; agent-browser eval "JSON.stringify({now: (document.querySelector('.ep-strip294-pill.is-active')||{}).getAttribute('data-ep-strip294')||'', barDate: (document.getElementById('epBarDate')||{}).textContent||''})" 2>/dev/null | tail -1 | unj)"
  echo "$C" | grep -q "\"now\":\"$LASTN\"" && ok "পিল-ক্লিকে সক্রিয়-স্থানান্তর (date-aware চেইন)" || bad "ক্লিকে-সুইচ-ব্যর্থ: $C"
  echo "$C" | grep -q '"barDate":"—"' && bad "বার-তারিখ সিঙ্ক-শূন্য" || ok "বার-তারিখ সিঙ্কড (date-aware)"
  agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
  M="$(agent-browser eval "JSON.stringify({ph: document.documentElement.scrollWidth - window.innerWidth})" 2>/dev/null | tail -1 | unj)"
  PH="$(echo "$M" | sed -E 's/.*"ph":(-?[0-9]+).*/\1/')"
  [ -n "$PH" ] && [ "$PH" -le 0 ] 2>/dev/null && ok "মোবাইল-390 পৃষ্ঠা-hScroll-শূন্য" || bad "মোবাইল hScroll: $M"
  agent-browser set viewport 1280 900 >/dev/null 2>&1
else
  skip "ব্রাউজার-অ্যাসার্ট — agent-browser/পেলোড-অনুপস্থি"
fi

echo "── রিগ্রেশন-ন্যূনতম ──"
node --check "$APP/scripts/s280-seed-epaper.js" 2>/dev/null && ok "সিডার node --check" || bad "সিডার-সিনট্যাক্স"
(cd "$APP" && node -e "require('ejs').compile(require('fs').readFileSync('views/user/epaper.ejs','utf8'),{filename:'views/user/epaper.ejs'})" 2>/dev/null) && ok "epaper.ejs EJS-compile" || bad "EJS-compile-ব্যর্থ"

echo ""
echo "══ s294: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" = "0" ] && exit 0 || exit 1
