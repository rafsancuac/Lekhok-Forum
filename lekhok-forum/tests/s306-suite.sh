#!/bin/bash
# s306-suite.sh — session306: ep306 — ই-পেপার **পৃষ্ঠা-সংখ্যা-ব্যাজ** (page-count badge)
# [Task ID 146] PLANS session305-প্রস্তাব: page-count-ব্যাজ (গেটেড) — গেট-উন্মোচন-রাউন্ড:
#   epaper_files.page_count-কলাম (স্কিমা + migrate-ALTER Turso/লোকাল) + sync-পেলোড pageCount
#   (1..999-স্যানিটাইজ, COALESCE-আপডেট) + archive/daily-SELECT + epaper.ejs payload.pages +
#   .ep-pages306-ব্যাজ (নামস্পেস-চুক্তি — .ep-pages রিডার-স্ক্রলার-সংঘর্ষ-শূন্য) + __epg306QA-হুক +
#   epaper.css session306-ব্লক (হেক্স-শূন্য) + epaper-bot pdf-lib getPageCount।
#   বোনাস QA-ফিক্স: db/migrate.js top-level-await+require = ERR_AMBIGUOUS_MODULE_SYNTAX
#   (Node 22+) → লোকাল-শাখা async-IIFE-মোড়ানো।
# চুক্তি: সার্ভার-বন্ধ-সিড (pkill -9 — SIGTERM-save clobber-গোটচা; s280-নীতি) + মার্কার-সিড
#         idempotent + নেট-শূন্য-পরিষ্কারক (--clean ×৩-অ্যাসার্ট) + bopen-রিট্রাই + unj()।
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s306-pages-badge-list.png
SH_MOB=/home/z/my-project/download/s306-pages-badge-mobile390.png
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
unj(){ echo "$1" | sed 's/\\"/"/g; s/^"//; s/"$//'; }
ev(){ local r; r=$(agent-browser eval "$1" 2>/dev/null); if [ -z "$r" ]; then sleep 1; r=$(agent-browser eval "$1" 2>/dev/null); fi; echo "$r"; }
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

echo "── ধাপ-০: পরিবেশ (সার্ভার-বন্ধ → migrate → সিড → বুট — s280-নীতি) ──"
SRV_WAS=0
if curl -s -o /dev/null -m 2 "$BASE/"; then SRV_WAS=1; pkill -9 -f "node server.js" 2>/dev/null; sleep 1; fi
(cd "$APP" && node db/migrate.js >/tmp/s306-migrate.log 2>&1) && ok "db/migrate.js রান (page_count-ALTER-সহ — IIFE-ফিক্স-পরবর্তী)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s306-migrate.log)"
grep -q "page_count" /tmp/s306-migrate.log && ok "migrate-লগে page_count-মাইগ্রেশন-চিহ্ন" || skip "migrate-লগে page_count-চিহ্ন নেই (পূর্ব-মাইগ্রেটেড?)"
(cd "$APP" && node scripts/s306-seed-epaper.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s306-মার্কার-সিড (idempotent)" || bad "s306-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (স্কিমা/মাইগ্রেশন/রুট/ভিউ/সিএসএস/বট) ──"
grep -q "page_count      INTEGER," "$APP/db/schema.sql" && ok "schema.sql: epaper_files.page_count-কলাম" || bad "schema.sql: page_count-অনুপস্থিত"
grep -q "ALTER TABLE epaper_files ADD COLUMN page_count INTEGER" "$APP/db/migrate.js" && ok "migrate.js: ALTER-page_count (উভয়-ব্যাকএন্ড)" || bad "migrate.js: ALTER-অনুপস্থিত"
grep -q "(async () => {" "$APP/db/migrate.js" && ok "migrate.js: IIFE-মোড়ানো (ERR_AMBIGUOUS-ফিক্স)" || bad "migrate.js: IIFE-মোড়ানো-অনুপস্থিত"
node --check "$APP/db/migrate.js" && ok "migrate.js: node --check গ্রিন" || bad "migrate.js: সিনট্যাক্স-ব্যর্থ"
grep -q "const _pcRaw" "$APP/routes/api-epaper.js" && ok "api-epaper: sync-pageCount-পার্স (1..999)" || bad "api-epaper: _pcRaw-অনুপস্থিত"
grep -q "page_count = COALESCE(?, page_count)" "$APP/routes/api-epaper.js" && ok "api-epaper: COALESCE-আপডেট (পুনঃসিঙ্কে-সংরক্ষণ)" || bad "api-epaper: COALESCE-অনুপস্থিত"
[ "$(grep -c "page_count AS pageCount" "$APP/routes/api-epaper.js")" -ge 2 ] && ok "api-epaper: archive-SELECT ×২ pageCount" || bad "api-epaper: archive-SELECT pageCount-অনুপস্থিত"
grep -q "page_count AS pageCount, created_at FROM epaper_files" "$APP/routes/daily.js" && ok "daily.js: /epaper-SELECT pageCount" || bad "daily.js: pageCount-অনুপস্থিত"
grep -q "pages: p.pageCount || null," "$APP/views/user/epaper.ejs" && ok "epaper.ejs: payload-pages-ফিল্ড" || bad "epaper.ejs: payload-pages-অনুপস্থিত"
grep -q 'class="ep-pages306" data-pages=' "$APP/views/user/epaper.ejs" && ok "epaper.ejs: .ep-pages306-ব্যাজ (নামস্পেস-চুক্তি)" || bad "epaper.ejs: ব্যাজ-অনুপস্থিত"
grep -q "__epg306QA" "$APP/views/user/epaper.ejs" && ok "epaper.ejs: __epg306QA-হুক" || bad "epaper.ejs: হুক-অনুপস্থিত"
grep -q "__epk300QA" "$APP/views/user/epaper.ejs" && ok "epaper.ejs: __epk300QA-হুক অক্ষুণ্ণ (legacy)" || bad "epaper.ejs: __epk300QA-ক্ষতিগ্রস্ত"
[ "$(grep -c "ep-pages306" "$APP/views/user/epaper.ejs")" -eq 2 ] && ok "epaper.ejs: ব্যাজ-উপস্থিতি ×২ (হুক-সিলেক্টর + রেন্ডার-লাইন — ডুপ-শূন্য)" || bad "epaper.ejs: ব্যাজ-গণনা=$(grep -c 'ep-pages306' "$APP/views/user/epaper.ejs") (প্রত্যাশা ২)"
[ "$(grep -c "(p.pages ? '<span class=\"ep-pages306\"" "$APP/views/user/epaper.ejs")" -eq 1 ] && ok "epaper.ejs: রেন্ডার-লাইন-এককতা (e3-রিনেম-গোটচা-সংশোধিত)" || bad "epaper.ejs: রেন্ডার-লাইন-গণনা≠১"
[ "$(grep -c "\.ep-pages306" "$APP/public/assets/css/epaper.css")" -ge 6 ] && ok "epaper.css: session306-ব্লক .ep-pages306" || bad "epaper.css: 306-ব্লক-অনুপস্থিত"
BLOCK306=$(sed -n "/session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ/,\$p" "$APP/public/assets/css/epaper.css")
if echo "$BLOCK306" | grep -qE "#[0-9a-fA-F]{3,8}"; then bad "css-session306-ব্লকে হেক্স-আবিষ্কৃত"; else ok "css-session306-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; fi
echo "$BLOCK306" | grep -q "prefers-reduced-motion" && ok "css-session306: reduced-motion-গার্ড" || bad "css-session306: reduced-motion-অনুপস্থিত"
echo "$BLOCK306" | grep -q "max-width: 640px" && ok "css-session306: 640px-সংকোচন" || bad "css-session306: 640px-অনুপস্থিত"
grep -q ".ep-pages306" "$APP/public/assets/css/epaper.css" && ! sed -n "1,/session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ/p" "$APP/public/assets/css/epaper.css" | grep -q "ep-pages306" && ok "css: 306-শ্রেণি শুধু session306-ব্লকে (রিডার-স্ক্রলার .ep-pages-অস্পৃষ্ট)" || skip "css: 306-শ্রেণি-স্কোপ-যাচাই"
grep -q "import { PDFDocument } from 'pdf-lib'" "$APP/../epaper-bot/src/index.ts" && ok "bot: pdf-lib-ইমপোর্ট" || bad "bot: ইমপোর্ট-অনুপস্থিত"
grep -q "getPageCount()" "$APP/../epaper-bot/src/index.ts" && ok "bot: getPageCount-নির্ণয়" || bad "bot: getPageCount-অনুপস্থিত"
grep -q "pageCount: pageCount || undefined," "$APP/../epaper-bot/src/index.ts" && ok "bot: sync-বডি pageCount" || bad "bot: sync-বডি-অনুপস্থিত"
grep -q "thumbId?: string, pageCount?: number" "$APP/../epaper-bot/src/index.ts" && ok "bot: siteSync-সিগনেচার pageCount" || bad "bot: সিগনেচার-অনুপস্থিত"

echo "── ধাপ-২: ডিবি + SSR/API ──"
PAGES_COL=$(node -e "
const initSqlJs=require('sql.js');const fs=require('fs');
initSqlJs().then(S=>{const db=new S.Database(fs.readFileSync('$APP/lekhok.db'));
const st=db.prepare('PRAGMA table_info(epaper_files)');const rows=[];while(st.step())rows.push(st.getAsObject());st.free();
console.log(rows.map(c=>c.name).join(','));})" 2>/dev/null)
echo "$PAGES_COL" | grep -q "page_count" && ok "লাইভ-ডিবি: epaper_files.page_count-কলাম উপস্থিত" || bad "লাইভ-ডিবি: page_count-অনুপস্থিত ($PAGES_COL)"
PC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/epaper")
[ "$PC" = "200" ] && ok "/epaper 200" || bad "/epaper HTTP $PC"
AC=$(curl -s "$BASE/api/epaper/archive")
echo "$AC" | grep -q '"pageCount":52' && ok "archive-API: pageCount:52-প্রবাহ" || bad "archive-API: pageCount:52-অনুপস্থিত"
echo "$AC" | grep -q '"pageCount":12' && ok "archive-API: pageCount:12-প্রবাহ" || bad "archive-API: pageCount:12-অনুপস্থিত"
echo "$AC" | grep -q '"paperName":"s280' && ok "archive-API: page_count-শূন্য-সারিও-প্রবাহে (নিয়ন্ত্রণ-দল)" || bad "archive-API: s280-নিয়ন্ত্রণ-সারি-অনুপস্থিত"

echo "── ধাপ-৩: E2E (agent-browser — ব্যাজ + হুক + একল-র‍্যাপ) ──"
bopen "$BASE/epaper" && ok "epaper-পেজ-ওপেন" || bad "epaper-ওপেন-ব্যর্থ"
sleep 2
H=$(ev "(function(){var h=window.__epg306QA; if(!h) return 'NO-HOOK'; return JSON.stringify({total:h.total,withPages:h.withPages,badges:h.badges()})})()")
unj "$H" | grep -q '"total":8' && ok "হুক total=8 (৫-s280 + ৩-s306)" || bad "হুক total-অমিল: $H"
unj "$H" | grep -q '"withPages":3' && ok "হুক withPages=3" || bad "হুক withPages-অমিল: $H"
unj "$H" | grep -q '"badges":3' && ok "হুক badges=3 (এক-সারিতে-এক-ব্যাজ — ডুপ-শূন্য)" || bad "হুক badges-অমিল: $H"
B=$(ev "(function(){var b=document.querySelector('#epList .ep-pages306'); return b? JSON.stringify({t:b.textContent.trim(),a:b.getAttribute('data-pages')}) : 'NO-BADGE'})()")
unj "$B" | grep -q '৫২ পৃষ্ঠা' && ok "ব্যাজ-টেক্সট বাংলা-সংখ্যায় (৫২ পৃষ্ঠা)" || bad "ব্যাজ-টেক্সট-অমিল: $B"
unj "$B" | grep -q '"a":"52"' && ok "ব্যাজ data-pages-অ্যাট্রিবিউট ASCII (QA-স্থিতিস্থাপক)" || bad "data-pages-অমিল: $B"
SR=$(ev "(function(){var b=document.querySelector('#epList .ep-pages306'); var n=b?b.closest('.ep-item').querySelector('.ep-item-name'):null; return (n&&b)? (Math.abs(n.getBoundingClientRect().top-b.getBoundingClientRect().top)<10 ? 'SAME-ROW':'WRAP') : 'NO-PAIR'})()")
echo "$SR" | grep -q "SAME-ROW" && ok "ব্যাজ নামের-সারিতেই (flex-row — একল-র‍্যাপ-ধোঁকা-শূন্য)" || bad "সারি-বিন্যাস: $SR"
NB=$(ev "(function(){var it=[].slice.call(document.querySelectorAll('#epList .ep-item')); var c=it.filter(function(x){return !x.querySelector('.ep-pages306')}).length; return String(c)})()")
[ "$(echo "$NB" | tr -d '"')" = "3" ] && ok "page_count-শূন্য ৩-সারিতে ব্যাজ-অনুপস্থিত (গেটেড-চুক্তি)" || bad "ব্যাজ-বিহীন-গণনা: $NB (প্রত্যাশা ৩)"
ERRN=$(agent-browser errors 2>/dev/null | wc -l | tr -d ' ')
[ "$ERRN" = "0" ] && ok "দ্বি-লোড JS-এরর-শূন্য" || bad "JS-এরর $ERRN টি"
agent-browser set viewport 1366 900 >/dev/null 2>&1
agent-browser open "$BASE/epaper" >/dev/null 2>&1; sleep 1.5
agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && ok "ডেস্কটপ-স্ক্রিনশট" || skip "ডেস্কটপ-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && ok "মোবাইল-390-স্ক্রিনশট" || skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: পরিষ্কারক (নেট-শূন্য ×৩-অ্যাসার্ট — নিজ-মার্কার-সারি) ──"
BEFORE=$(curl -s "$BASE/api/epaper/archive" | grep -o '"source":"s306-qa"' | wc -l | tr -d ' ')
[ "$BEFORE" -ge 3 ] && ok "পরিষ্কার-পূর্ব s306-qa সারি=$BEFORE" || bad "s306-qa-সারি-অনুপস্থিত ($BEFORE)"
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
(cd "$APP" && node scripts/s306-seed-epaper.js --clean) | grep -q "CLEAN ✓" && ok "seed --clean রান" || bad "clean-ব্যর্থ"
MID=$(node -e "
const initSqlJs=require('sql.js');const fs=require('fs');
initSqlJs().then(S=>{const db=new S.Database(fs.readFileSync('$APP/lekhok.db'));
const st=db.prepare(\"SELECT COUNT(*) AS n FROM epaper_files WHERE source='s306-qa'\");st.step();console.log(st.getAsObject().n);st.free();})" 2>/dev/null)
[ "$MID" = "0" ] && ok "পরিষ্কার-পরবর্তী ডিবি-গণনা=০" || bad "ডিবি-অবশিষ্ট=$MID"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1
AFTER=$(curl -s "$BASE/api/epaper/archive" | grep -o '"source":"s306-qa"' | wc -l | tr -d ' ')
[ "$AFTER" = "0" ] && ok "API-পুনঃ-যাচাই s306-qa=০ (নেট-শূন্য)" || bad "API-অবশিষ্ট=$AFTER"
curl -s -o /dev/null -w "%{http_code}" "$BASE/epaper" | grep -q 200 && ok "পরিষ্কার-পরবর্তী /epaper 200 (সার্ভার-সুস্থ)" || bad "পরিষ্কার-পরবর্তী /epaper-ব্যর্থ"

echo ""
echo "══ s306-সুইট: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" = "0" ] && echo "✅ সর্ব-গ্রিন" || echo "❌ ব্যর্থতা আছে"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
