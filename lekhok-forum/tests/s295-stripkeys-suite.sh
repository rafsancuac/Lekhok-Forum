#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# s295-stripkeys-suite.sh — session295 QA: স্ট্রিপ মিনি-থাম্ব + ←/→ কীবোর্ড-নেভ (ep295)
# ep294-স্ট্রিপ-বিস্তার (PLANS session294-প্রস্তাব ①+②): প্রতি-পিল row-native মিনি-থাম্ব
# (payload.thumbs — মিসম্যাচ-অসম্ভব-কনস্ট্রাকশন; ep292 capture-ফলব্যাক-প্যাটার্ন-মিরর)
# + ফোকাস-স্কোপড ←/→ নেভ (wrap; next.click() = নেটিভ-সিলেক্টর change-চেইন-পুনঃব্যবহার)।
# ধারা: কাঠামো (মার্কআপ/হুক/CSS hex-zero/hidden-গার্ড-বাইট) + সার্ভার-রেন্ডার
#       (প্রত্যাশা-গণনা data-papers-JSON-থেকে — সোর্স-বনাম-রেন্ডার্ড-চুক্তি) + E2E।
# ব্যবহার: bash tests/s295-stripkeys-suite.sh   (QA-সার্ভার :8094 স্বয়ং-নিশ্চিত)
# ═══════════════════════════════════════════════════════════════════════════
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$(cd "$SCRIPT_DIR/.." && pwd)"          # lekhok-forum/lekhok-forum (views/, public/)
ROOT="$(cd "$APP/.." && pwd)"                # মোনোরিপো-রুট (ensure-server.sh)
BASE="${S295_BASE:-http://localhost:8094}"
PASS=0; FAIL=0; SKIP=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip() { SKIP=$((SKIP+1)); echo "  ∅ $1 (skip)"; }
# agent-browser eval রিটার্ন = JSON-এনকোডেড-স্ট্রিং ("{\"k\":v}") → আন-এস্কেপ
unj() { sed -e 's/\\"/"/g' -e 's/^"//' -e 's/"$//'; }

echo "── s295 স্ট্রিপকি-সুইট ──"

# ০. সার্ভার-নিশ্চিত
if ! curl -s -o /dev/null -m 2 "$BASE/"; then
  bash "$ROOT/ensure-server.sh" >/dev/null 2>&1 || { bad "QA-সার্ভার বুট ব্যর্থ"; echo "PASS=$PASS FAIL=$FAIL"; exit 1; }
fi

# ১. পেলোড-শূন্য হলে স্বয়ং-সিড (সিডার সার্ভার-বন্ধে-চালান-গোটচা)
H="$(curl -s "$BASE/epaper")"
if echo "$H" | grep -q 'data-papers="%5B%5D"' || ! echo "$H" | grep -q 'data-papers="'; then
  echo "── পেলোড-শূন্য → s280-সিডার স্বয়ং-রান (সার্ভার-বন্ধে) ──"
  pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.5
  (cd "$APP" && node scripts/s280-seed-epaper.js >/dev/null 2>&1)
  bash "$ROOT/ensure-server.sh" >/dev/null 2>&1
  H="$(curl -s "$BASE/epaper")"
fi

echo "── কাঠামো ──"
EP="$APP/views/user/epaper.ejs"
CSS="$APP/public/assets/css/epaper.css"
grep -q 'class="ep-strip294-thumb" aria-hidden="true"' "$EP" && ok "থাম্ব-স্প্যান-মার্কআপ (aria-hidden)" || bad "থাম্ব-মার্কআপ অনুপস্থিত"
grep -q 'p.thumbs && p.thumbs.length' "$EP" && ok "কন্ডিশনাল-থাম্ব (row-native payload.thumbs)" || bad "কন্ডিশন-শাখা অনুপস্থিত"
grep -q "strip.addEventListener('error', function (e) {" "$EP" && ok "capture-এরর-লিসনার (ep292-প্যাটার্ন-মিরর)" || bad "এরর-লিসনার অনুপস্থিত"
grep -q "strip.addEventListener('keydown', function (ev) {" "$EP" && ok "keydown-লিসনার (স্ট্রিপ-স্কোপড)" || bad "keydown-লিসনার অনুপস্থিত"
grep -qF "var next = ev.key === 'ArrowRight' ? pills[(idx + 1) % pills.length] : pills[(idx - 1 + pills.length) % pills.length];" "$EP" && ok "wrap-নেভ (±১ mod n)" || bad "wrap-লাইন অনুপস্থিত"
grep -q 'next.focus();' "$EP" && grep -q 'next.click();' "$EP" && ok "রোভিং-ফোকাস + একক-ফানেল-ক্লিক" || bad "ফোকাস/ক্লিক-চেইন অনুপস্থিত"
grep -q 'window.__epStrip295QA' "$EP" && ok "QA-হুক (__epStrip295QA)" || bad "QA-হুক অনুপস্থিত"
grep -q 'session295 — স্ট্রিপ মিনি-থাম্ব + কীবোর্ড-নেভ' "$CSS" && ok "CSS session295-ব্লক" || bad "CSS-ব্লক অনুপস্থিত"
grep -qF '.ep-strip294-thumb[hidden] { display: none !important; }' "$CSS" && ok "hidden-গার্ড বাইট-সঠিক (!important)" || bad "hidden-গার্ড-বাইট ভঙ্গ"
grep -qF '.ep-strip294-pill:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 2px; }' "$CSS" && ok "focus-visible-রিং (কীবোর্ড-নেভ-সামন্বয়)" || bad "focus-visible-রিং অনুপস্থিত"

# CSS-ব্লক hex-zero (র‍্যাচেট-চুক্তি) — ব্লক-বিস্তার লাইন-সংখ্যা-ভিত্তিক (grep -F ফিক্সড-স্ট্রিং)
S295="$(grep -n -F 'session295 — স্ট্রিপ মিনি-থাম্ব + কীবোর্ড-নেভ' "$CSS" | head -1 | cut -d: -f1)"
E295="$(grep -n -F 'prefers-reduced-motion: reduce) { .ep-strip294-pill:focus-visible { outline-offset: 0; } }' "$CSS" | tail -1 | cut -d: -f1)"
if [ -n "$S295" ] && [ -n "$E295" ] && [ "$E295" -gt "$S295" ]; then
  HEXN="$(sed -n "${S295},${E295}p" "$CSS" | grep -cE '#[0-9a-fA-F]{3,8}' || true)"
  [ "$HEXN" = "0" ] && ok "CSS-ব্লক হেক্স-শূন্য (টোকেন-শুধু)" || bad "CSS-ব্লকে hex=$HEXN"
else
  bad "CSS-ব্লক-বিস্তার নির্ণয় ব্যর্থ (S=$S295 E=$E295)"
fi

# no-regression: s294-মার্কার-চতুষ্টয় অক্ষুণ্ণ
grep -q 'id="epStrip294"' "$EP" && grep -q 'window.__epStrip294Sync = sync294' "$EP" \
  && grep -q 'window.__epStrip294Sync(p)' "$EP" && grep -q 'aria-label="শীর্ষ পত্রিকা দ্রুত-সুইচ"' "$EP" \
  && ok "no-regression s294-মার্কার ×৪" || bad "s294-মার্কার-ভঙ্গ"

echo "── সার্ভার-রেন্ডার (প্রত্যাশা-গণনা data-papers-JSON-থেকে) ──"
PAPJSON="$(echo "$H" | grep -o 'data-papers="[^"]*"' | head -1 | sed 's/^data-papers="//;s/"$//')"
read -r PILLN THUMBN <<EOF2
$(echo "$PAPJSON" | python3 -c "
import sys, urllib.parse, json
try:
    d = json.loads(urllib.parse.unquote(sys.stdin.read().strip()))
    # স্ট্রিপ-চুক্তি: নাম-ডিডুপ (প্রথম-উপস্থিতি — সর্বশেষ-সংখ্যা) + র‍্যাংক-বাছাই-পূর্ব; slice-শূন্য (≤৮)
    seen, names = set(), []
    for p in d:
        n = p.get('name')
        if n in seen:
            continue
        seen.add(n)
        names.append(p)
    print(len(names), sum(1 for p in names if p.get('thumbs')))
except Exception:
    print(0, 0)
")
EOF2
if [ "${PILLN:-0}" -ge 1 ] 2>/dev/null; then
  ok "পিল-রেন্ডার-প্রত্যাশা ($PILLN — ডিডুপ-পত্রিকা)"
  RTHUMB="$(echo "$H" | grep -o 'ep-strip294-thumb" aria-hidden="true"' | wc -l | tr -d ' ')"
  [ "$RTHUMB" = "$THUMBN" ] && ok "থাম্ব-স্প্যান-রেন্ডার = thumbs-যুক্ত-সারি ($RTHUMB/$THUMBN)" || bad "থাম্ব-গণনা-অমিল: রেন্ডার্ড=$RTHUMB প্রত্যাশা=$THUMBN"
  echo "$H" | grep -q 'ep-strip294-all' && ok "সকল-পত্রিকা-লিংক রেন্ডারড" || bad "সকল-পত্রিকা-লিংক অনুপস্থিত"
else
  skip "পিল-রেন্ডার — epaper-পেলোড-শূন্য (বট-সিঙ্ক-নির্ভর পরিবেশ)"
  skip "থাম্ব-স্প্যান-রেন্ডার-গণনা"
  skip "সকল-পত্রিকা-লিংক রেন্ডার"
fi

echo "── ব্রাউজার-E2E (agent-browser) ──"
if command -v agent-browser >/dev/null 2>&1 && [ "${PILLN:-0}" -ge 2 ]; then
  agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 2.5
  # বুট-হুক
  B="$(agent-browser eval "JSON.stringify({p: window.__epStrip295QA.pills(), t: window.__epStrip295QA.thumbs(), h: window.__epStrip295QA.thumbsHidden(), i: window.__epStrip295QA.imgs(), k: window.__epStrip295QA.keynav === true})" 2>/dev/null | tail -1 | unj)"
  echo "$B" | grep -q "\"p\":$PILLN" && ok "বুট-হুক পিল=SSR ($PILLN)" || bad "পিল-অমিল: $B"
  echo "$B" | grep -q "\"t\":$THUMBN" && ok "বুট-হুক থাম্ব=SSR ($THUMBN)" || bad "থাম্ব-অমিল: $B"
  echo "$B" | grep -q "\"i\":$THUMBN" && ok "বুট-হুক ইমগ=SSR ($THUMBN)" || bad "ইমগ-অমিল: $B"
  BH=$(echo "$B" | sed -E 's/.*"h":([0-9]+).*/\1/')
  [ -n "$BH" ] && [ "$BH" -le "$THUMBN" ] 2>/dev/null && ok "বুটে-লুকানো≤থাম্ব (fake-fid-পরিবেশে সর্বলুকানো-বৈধ) h=$BH" || bad "লুকানো-গণনা-অসঙ্গত: $B"
  echo "$B" | grep -q '"k":true' && ok "keynav-ফ্ল্যাগ" || bad "keynav-ফ্ল্যাগ-শূন্য"
  # T1: ps[0] থেকে ArrowRight → ps[1] ফোকাসড+সক্রিয়+সিলেক্টর-সিঙ্কড
  agent-browser eval "var ps=document.querySelectorAll('.ep-strip294-pill'); ps[0].focus(); ps[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); 'sent'" >/dev/null 2>&1
  sleep 1.8
  T1="$(agent-browser eval "JSON.stringify((function(){var ps=document.querySelectorAll('.ep-strip294-pill'); var a=document.querySelector('.ep-strip294-pill.is-active'); var f=document.activeElement; var s=document.getElementById('epPaperSelect'); return {ok: !!a && f===ps[1] && a===ps[1] && !!s && s.value===ps[1].getAttribute('data-ep-strip294')};})())" 2>/dev/null | tail -1 | unj)"
  echo "$T1" | grep -q '"ok":true' && ok "ArrowRight: পিল+১ ফোকাস+সক্রিয়+সিলেক্টর-সিঙ্ক" || bad "ArrowRight-ব্যর্থ: $T1"
  # T2: ps[1] থেকে ArrowLeft → ps[0]
  agent-browser eval "var ps=document.querySelectorAll('.ep-strip294-pill'); ps[1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})); 'sent'" >/dev/null 2>&1
  sleep 1.8
  T2="$(agent-browser eval "JSON.stringify((function(){var ps=document.querySelectorAll('.ep-strip294-pill'); var a=document.querySelector('.ep-strip294-pill.is-active'); var f=document.activeElement; return {ok: !!a && f===ps[0] && a===ps[0]};})())" 2>/dev/null | tail -1 | unj)"
  echo "$T2" | grep -q '"ok":true' && ok "ArrowLeft: পিল−১ ফোকাস+সক্রিয়" || bad "ArrowLeft-ব্যর্থ: $T2"
  # T3: শেষ-পিল থেকে ArrowRight → wrap প্রথম-পিল
  agent-browser eval "var ps=document.querySelectorAll('.ep-strip294-pill'); ps[ps.length-1].focus(); ps[ps.length-1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); 'sent'" >/dev/null 2>&1
  sleep 1.8
  T3="$(agent-browser eval "JSON.stringify((function(){var ps=document.querySelectorAll('.ep-strip294-pill'); var a=document.querySelector('.ep-strip294-pill.is-active'); var f=document.activeElement; return {ok: !!a && f===ps[0] && a===ps[0]};})())" 2>/dev/null | tail -1 | unj)"
  echo "$T3" | grep -q '"ok":true' && ok "wrap: শেষ→প্রথম" || bad "wrap-ব্যর্থ: $T3"
  # T4: ফিল্ড-গার্ড — স্ট্রিপ-বহির্ভূত দৃশ্যমান-কন্ট্রোলে ArrowRight → সক্রিয়-অপরিবর্তিত + ফোকাস-অটুট
  # (গোটচা: #epPaperSelect display:none — s282-কম্বো-পিছনে → focus-অক্ষম; দৃশ্যমান #epPs282Btn ব্যবহার)
  agent-browser eval "var s=document.getElementById('epPs282Btn'); s.focus(); s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); 'sent'" >/dev/null 2>&1
  sleep 0.8
  T4="$(agent-browser eval "JSON.stringify((function(){var ps=document.querySelectorAll('.ep-strip294-pill'); var a=document.querySelector('.ep-strip294-pill.is-active'); var f=document.activeElement; return {ok: !!a && a===ps[0] && f && f.id==='epPs282Btn'};})())" 2>/dev/null | tail -1 | unj)"
  echo "$T4" | grep -q '"ok":true' && ok "ফিল্ড-গার্ড: স্ট্রিপ-বহির্ভূত-হস্তক্ষেপ-শূন্য (ফোকাস-অটুট)" || bad "গার্ড-ব্যর্থ: $T4"
  # T5: error-capture — synthetic non-bubbling error → স্প্যান-লুকান (ep292-প্যাটার্ন)
  # (গোটচা: fake-fid-পরিবেশে বুটেই-সর্বলুকানো হতে-পারে → প্রথম-স্প্যান দৃশ্যমান-করে-পরীক্ষা — DOM-স্থানীয়, DB-অস্পৃশ্য)
  T5="$(agent-browser eval "JSON.stringify((function(){var w=document.querySelector('.ep-strip294-thumb'); if(!w) return {ok:false, before:-1}; var before=w.hidden; w.hidden=false; w.querySelector('img').dispatchEvent(new Event('error')); return {ok: w.hidden===true, before: before};})())" 2>/dev/null | tail -1 | unj)"
  echo "$T5" | grep -q '"ok":true' && ok "error-capture: থাম্ব-স্প্যান লুকানো (টেক্সট-অনলি-ফলব্যাক)" || bad "error-capture-ব্যর্থ: $T5"
  # T6: ফ্রেশ-লোড → পুনঃপ্রতিষ্ঠা (SSR-স্প্যান-অলুকানো শুরু; hidden ≤ সর্বমোট)
  agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 2.5
  T6="$(agent-browser eval "JSON.stringify({t: window.__epStrip295QA.thumbs(), i: window.__epStrip295QA.imgs(), h: window.__epStrip295QA.thumbsHidden()})" 2>/dev/null | tail -1 | unj)"
  echo "$T6" | grep -q "\"t\":$THUMBN" && echo "$T6" | grep -q "\"i\":$THUMBN" && ok "ফ্রেশ-লোড: থাম্ব-পুনঃপ্রতিষ্ঠা ($THUMBN)" || bad "পুনঃপ্রতিষ্ঠা-ব্যর্থ: $T6"
  # মোবাইল-390 hScroll
  agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
  M="$(agent-browser eval "JSON.stringify({ph: document.documentElement.scrollWidth - window.innerWidth})" 2>/dev/null | tail -1 | unj)"
  PH="$(echo "$M" | sed -E 's/.*"ph":(-?[0-9]+).*/\1/')"
  [ -n "$PH" ] && [ "$PH" -le 0 ] 2>/dev/null && ok "মোবাইল-390 পৃষ্ঠা-hScroll-শূন্য" || bad "মোবাইল hScroll: $M"
  if agent-browser screenshot "$ROOT/download/s295-stripkeys-mobile390.png" >/dev/null 2>&1; then ok "স্ক্রিনশট মোবাইল-৩৯০"; else bad "স্ক্রিনশট-মোবাইল"; fi
  agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 1
  if agent-browser screenshot "$ROOT/download/s295-stripkeys-desk.png" >/dev/null 2>&1; then ok "স্ক্রিনশট ডেস্কটপ"; else bad "স্ক্রিনশট-ডেস্ক"; fi
else
  skip "ব্রাউজার-অ্যাসার্ট — agent-browser/পেলোড-অনুপস্থি (<২-পিল)"
fi

echo "── রিগ্রেশন-ন্যূনতম ──"
node --check "$APP/scripts/s280-seed-epaper.js" 2>/dev/null && ok "সিডার node --check" || bad "সিডার-সিনট্যাক্স"
(cd "$APP" && node -e "require('ejs').compile(require('fs').readFileSync('views/user/epaper.ejs','utf8'),{filename:'views/user/epaper.ejs'})" 2>/dev/null) && ok "epaper.ejs EJS-compile" || bad "EJS-compile-ব্যর্থ"

echo ""
echo "══ s295: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" = "0" ] && exit 0 || exit 1
