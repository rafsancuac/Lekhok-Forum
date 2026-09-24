#!/bin/bash
# s311-suite.sh — session311: epk311 — হোম ই-পেপার স্লাইডারে page-count-ব্যাজ
# [Task ID 148] PLANS session307-নোটের প্রস্তাব-② প্রয়োগ:
#   ① pages.js — গ্রেসফুল page_count-রেজলভ (পৃথক try/catch — অ-মাইগ্রেটেড ডিবিতেও হোম-জীবিত
#      s306b-ধর্ম; প্রধান-প্যারালাল-ব্যাচ অক্ষুণ্ণ) + epkSlides310-র row310-উত্তরাধিকার
#   ② today.ejs — teSlides310 দুই-শাখায় pages + .epk310-pages ব্যাজ (icon+text, hidden-গেট)
#      + applySlide-ব্যাজ-সিঙ্ক (pages-বিহীন স্লাইডে hidden — s306-অদৃশ্য-ধর্ম) + __epk310QA.pagesAt
#   ③ style.css — session311-ব্লক হেক্স-শূন্য (পিল-ওভারলে + 640px + reduced-motion)
# চুক্তি: সার্ভার-বন্ধ-সিড (s280-নীতি) + s306-সিড-পুনঃব্যবহার (৫২/১২/৮ + শূন্য-নিয়ন্ত্রণ-দল)
#         + ডায়নামিক-গণনা-অ্যাসার্ট (স্লাইড-ক্রমের-উপর-নির্ভর-শূন্য) + নেট-শূন্য-পরিষ্কারক
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
SH_DESK=/home/z/my-project/download/s311-badge-desk.png
SH_MOB=/home/z/my-project/download/s311-badge-mobile390.png
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
(cd "$APP" && node db/migrate.js >/tmp/s311-migrate.log 2>&1) && ok "db/migrate.js রান (idempotent)" || bad "db/migrate.js ব্যর্থ (লগ: /tmp/s311-migrate.log)"
(cd "$APP" && node scripts/s306-seed-epaper.js) | grep -q "SEED ✓\|SKIP ✓" && ok "s306-মার্কার-সিড (৫২/১২/৮ — idempotent)" || bad "s306-সিড ব্যর্থ"
# সেশন ৩১১: স্লাইডার = অ্যাডমিন-ব্রাঞ্চ (home_epaper_slides) — QA-স্লাইড-সিড (নাম-মিল-গ্যারান্টি —
# s296-সম্পূর্ণ-নাম-মিল-চুক্তি অক্ষুণ্ণ; মার্কার-নাম s306কিউএ-প্রিফিক্স — পরিষ্কারকে বিলোপযোগ্য)
(cd "$APP" && node -e "
const db=require('./db');
db.initDb().then(async()=>{
  const names=['s306কিউএ প্রথম আলো','s306কিউএ কালবেলা'];
  for(let i=0;i<names.length;i++){
    await db.prepare('DELETE FROM home_epaper_slides WHERE name = ?').run(names[i]);
    await db.prepare('INSERT INTO home_epaper_slides (name, slug, thumb, color, link, \"order\", isActive, createdAt, updatedAt) VALUES (?, ?, \'\', \'\', \'\', ?, 1, datetime(\'now\'), datetime(\'now\'))').run(names[i], 's311-qa-'+(i+1), i+1);
  }
  console.log('SLIDE-SEED ✓'); db.saveDb(); process.exit(0); // saveDb-তাৎক্ষণিক — debounced-ফ্লাশ exit-এ হারায় (s280-গোটচা-পরিবার)
}).catch(e=>{console.error('SLIDE-SEED-FAIL', e.message); process.exit(1);});
") | grep -q "SLIDE-SEED ✓" && ok "s311-অ্যাডমিন-স্লাইড-সিড (নাম-মিল-row310-গ্যারান্টি)" || bad "অ্যাডমিন-স্লাইড-সিড ব্যর্থ"
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "সার্ভার ensure-server-এ-বুট" || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }

echo "── ধাপ-১: কাঠামো (রুট/ভিউ/সিএসএস) ──"
grep -q "epkPages311" "$APP/routes/pages.js" && ok "pages.js: epk311-গ্রেসফুল-ব্লক" || bad "pages.js: s311-ব্লক-অনুপস্থিত"
grep -q "} catch (e311) { epkPages311 = {}; }" "$APP/routes/pages.js" && ok "pages.js: try/catch-গ্রেসফুল-গেট (s306b-ধর্ম)" || bad "pages.js: catch-গেট-অনুপস্থিত"
grep -q "p.pageCount = epkPages311\[p.id\] || null;" "$APP/routes/pages.js" && ok "pages.js: লাইভ-সারিতে pageCount-সংযুক্তি" || bad "pages.js: pageCount-সংযুক্তি-অনুপস্থিত"
grep -q "pages: row310 ? (row310.pageCount || null) : null," "$APP/routes/pages.js" && ok "pages.js: অ্যাডমিন-স্লাইড row310-উত্তরাধিকার" || bad "pages.js: row310-উত্তরাধিকার-অনুপস্থিত"
grep -q "pages: s.pages || null," "$APP/views/partials/home/today.ejs" && ok "today.ejs: অ্যাডমিন-শাখা pages" || bad "today.ejs: অ্যাডমিন-শাখা-অনুপস্থিত"
grep -q "pages: p.pageCount || null," "$APP/views/partials/home/today.ejs" && ok "today.ejs: লাইভ-শাখা pages" || bad "today.ejs: লাইভ-শাখা-অনুপস্থিত"
grep -q 'id="epk310Pages"' "$APP/views/partials/home/today.ejs" && ok "today.ejs: ব্যাজ-র‍্যাপার (hidden-গেট-সহ)" || bad "today.ejs: ব্যাজ-র‍্যাপার-অনুপস্থিত"
grep -q 'id="epk310PagesTxt"' "$APP/views/partials/home/today.ejs" && ok "today.ejs: ব্যাজ-টেক্সট-স্প্যান" || bad "today.ejs: টেক্সট-স্প্যান-অনুপস্থিত"
grep -q "var pgTxt311 = p.pages ? (bnDigits310(p.pages)" "$APP/views/partials/home/today.ejs" && ok "today.ejs: applySlide-ব্যাজ-সিঙ্ক (বাংলা-অঙ্ক)" || bad "today.ejs: সিঙ্ক-অনুপস্থিত"
grep -q "pagesAt: function (i)" "$APP/views/partials/home/today.ejs" && ok "today.ejs: __epk310QA.pagesAt-হুক" || bad "today.ejs: pagesAt-অনুপস্থিত"
grep -q "__epk297QA" "$APP/views/partials/home/today.ejs" && ok "today.ejs: __epk297QA-হুক অক্ষুণ্ণ (legacy)" || bad "today.ejs: 297-হুক-ক্ষতিগ্রস্ত"
(cd "$APP" && node -e "const ejs=require('ejs');const fs=require('fs');ejs.compile(fs.readFileSync('views/partials/home/today.ejs','utf8'))") >/dev/null 2>&1 && ok "today.ejs: EJS-compile গ্রিন" || bad "today.ejs: EJS-compile-ব্যর্থ"
BLOCK311=$(sed -n "/session311 (epk311)/,\$p" "$APP/public/assets/css/style.css")
echo "$BLOCK311" | grep -q ".epk310-pages" && ok "style.css: session311-ব্লক .epk310-pages" || bad "style.css: 311-ব্লক-অনুপস্থিত"
if echo "$BLOCK311" | grep -qE "#[0-9a-fA-F]{3,8}\b"; then bad "css-session311-ব্লকে হেক্স-আবিষ্কৃত"; else ok "css-session311-ব্লক হেক্স-শূন্য (টোকেন/color-mix)"; fi
echo "$BLOCK311" | grep -q ".epk310-pages\[hidden\]" && ok "css-session311: hidden-গেট-রুল" || bad "css-session311: hidden-রুল-অনুপস্থিত"
echo "$BLOCK311" | grep -q "prefers-reduced-motion" && ok "css-session311: reduced-motion-গার্ড" || bad "css-session311: reduced-motion-অনুপস্থিত"
echo "$BLOCK311" | grep -q "max-width: 640px" && ok "css-session311: 640px-সংকোচন" || bad "css-session311: 640px-অনুপস্থিত"
node --check "$APP/routes/pages.js" && ok "pages.js: node --check গ্রিন" || bad "pages.js: সিনট্যাক্স-ব্যর্থ"

echo "── ধাপ-২: SSR ──"
HC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
[ "$HC" = "200" ] && ok "হোম 200" || bad "হোম HTTP $HC"
HTML=$(curl -s "$BASE/")
echo "$HTML" | grep -q 'id="epk310Pages"' && ok "SSR: ব্যাজ-উপস্থিত (structural)" || bad "SSR: ব্যাজ-অনুপস্থিত"
echo "$HTML" | grep -q '"pages":52' && ok "SSR: payload-এ pages:52-প্রবাহ (সিড-গ্যারান্টি)" || bad "SSR: pages:52-অনুপস্থিত"
echo "$HTML" | grep -q '__epk310QA' && ok "SSR: QA-হুক-এমিট" || bad "SSR: হুক-অনুপস্থিত"

echo "── ধাপ-৩: E2E (agent-browser — ব্যাজ + সিঙ্ক + hidden-গেট + বাংলা-অঙ্ক) ──"
agent-browser set viewport 1366 900 >/dev/null 2>&1
bopen "$BASE/" && ok "হোম-পেজ-ওপেন" || bad "হোম-ওপেন-ব্যর্থ"
sleep 2
CNT=$(ev "(function(){var h=window.__epk310QA; return h? String(h.count()) : 'NO-HOOK'})()" 2>/dev/null | tr -d '"')
[ "$CNT" != "NO-HOOK" ] && [ "$CNT" != "0" ] && [ "$CNT" != "-1" ] && ok "হুক count=$CNT" || bad "হুক count-অমিল: $CNT"
# ডায়নামিক-আবিষ্কার: ৫২-পৃষ্ঠা-স্লাইড ও শূন্য-পৃষ্ঠা-স্লাইড-ইনডেক্স
IDX=$(ev "(function(){var h=window.__epk310QA; if(!h) return '[]'; var a=[],z=-1; for(var i=0;i<h.count();i++){var p=h.pagesAt(i); a.push(p); if(p===52) z=i;} return JSON.stringify({arr:a,i52:z})})()" 2>/dev/null)
unj "$IDX" | grep -q '"i52":-1' && bad "৫২-পৃষ্ঠা-স্লাইড-অনুপস্থিত: $IDX" || ok "৫২-পৃষ্ঠা-স্লাইড-আবিষ্কৃত (ডায়নামিক)"
I52=$(unj "$IDX" | grep -o '"i52":[0-9-]*' | grep -o '[0-9-]*$')
if [ -n "$I52" ] && [ "$I52" != "-1" ]; then
  ev "(function(){var d=document.querySelectorAll('.epk310-dot'); if(d[$I52]) d[$I52].click(); return 'clicked'})()" >/dev/null 2>&1
  sleep 1
  CUR=$(ev "(function(){return String(window.__epk310QA.current())})()" 2>/dev/null | tr -d '"')
  [ "$CUR" = "$I52" ] && ok "ডট-ক্লিকে স্লাইড-$I52-সক্রিয়" || bad "স্লাইড-সুইচ ব্যর্থ (cur=$CUR)"
  BG=$(ev "(function(){var w=document.getElementById('epk310Pages'),t=document.getElementById('epk310PagesTxt'); if(!w||!t) return 'NO-BADGE'; return JSON.stringify({vis:w.offsetWidth>0,tx:t.textContent.trim()})})()" 2>/dev/null)
  unj "$BG" | grep -q '"vis":true' && ok "ব্যাজ-দৃশ্যমান (pages>0-স্লাইডে)" || bad "ব্যাজ-দৃশ্যমানতা: $BG"
  unj "$BG" | grep -q '৫২ পৃষ্ঠা' && ok "ব্যাজ-টেক্সট '৫২ পৃষ্ঠা' (বাংলা-অঙ্ক)" || bad "ব্যাজ-টেক্সট: $BG"
else
  bad "I52-দুর্বল — E2E-ব্যাজ-শাখা পরিচালিত-হয়নি"
fi
# hidden-গেট: শূন্য-পৃষ্ঠা-স্লাইড থাকলে সেখানে ব্যাজ-অদৃশ্য (s306-ধর্ম)
IZ=$(ev "(function(){var h=window.__epk310QA; if(!h) return '-1'; for(var i=0;i<h.count();i++){if(!h.pagesAt(i)) return String(i);} return '-1'})()" 2>/dev/null | tr -d '"')
if [ -n "$IZ" ] && [ "$IZ" != "-1" ]; then
  ev "(function(){var d=document.querySelectorAll('.epk310-dot'); if(d[$IZ]) d[$IZ].click(); return 'c'})()" >/dev/null 2>&1
  sleep 1
  BH=$(ev "(function(){var w=document.getElementById('epk310Pages'); return w? String(w.hidden) : 'NO-BADGE'})()" 2>/dev/null | tr -d '"')
  [ "$BH" = "true" ] && ok "hidden-গেট: শূন্য-পৃষ্ঠা-স্লাইডে ব্যাজ-অদৃশ্য" || bad "hidden-গেট: $BH"
else
  skip "শূন্য-পৃষ্ঠা-স্লাইড-আজ-টুডে-ব্যান্ডে নেই — hidden-গেট E2E-গেটেড (কাঠামো-অ্যাসার্ট দ্বারা আচৃত)"
fi
ERRN=$(agent-browser errors 2>/dev/null | wc -l | tr -d ' ')
[ "$ERRN" = "0" ] && ok "JS-এরর-শূন্য" || bad "JS-এরর $ERRN টি"
agent-browser screenshot "$SH_DESK" >/dev/null 2>&1 && ok "ডেস্কটপ-স্ক্রিনশট" || skip "ডেস্কটপ-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
ev "(function(){var s=document.getElementById('today-epaper'); if(s) s.scrollIntoView(); return 'm'})()" >/dev/null 2>&1
HS=$(ev "(function(){var de=document.documentElement;return String(de.scrollWidth>de.clientWidth)})()" 2>/dev/null | tr -d '"')
[ "$HS" != "true" ] && ok "মোবাইল-390 hScroll-শূন্য (page-level — s302-চুক্তি)" || bad "hScroll-ওভারফ্লো=$HS"
agent-browser screenshot "$SH_MOB" >/dev/null 2>&1 && ok "মোবাইল-স্ক্রিনশট" || skip "মোবাইল-স্ক্রিনশট-ব্যর্থ"
agent-browser set viewport 1366 900 >/dev/null 2>&1

echo "── ধাপ-৪: পরিষ্কারক (নেট-শূন্য ×৩-অ্যাসার্ট + গ্রেসফুল-পুনঃ-প্রমাণ) ──"
(cd "$APP" && node scripts/s306-seed-epaper.js --clean) | grep -q "CLEAN\|SEED\|SKIP" && ok "seed --clean রান" || bad "clean-রান-ব্যর্থ"
LEFT=$(cd "$APP" && node -e "
const initSqlJs=require('sql.js');const fs=require('fs');
initSqlJs().then(S=>{const db=new S.Database(fs.readFileSync('lekhok.db'));
const st=db.prepare(\"SELECT COUNT(*) AS n FROM epaper_files WHERE source='s306-qa'\");st.step();
console.log(st.getAsObject().n);process.exit(0);})" 2>/dev/null)
[ "$LEFT" = "0" ] && ok "পরিষ্কার-পরবর্তী s306-সারি=০ (নেট-শূন্য-১)" || bad "অবশিষ্ট s306-সারি=$LEFT"
(cd "$APP" && node -e "
const db=require('./db');
db.initDb().then(async()=>{
  await db.prepare('DELETE FROM home_epaper_slides WHERE name LIKE ?').run('s306কিউএ%');
  const c = await db.prepare('SELECT COUNT(*) AS n FROM home_epaper_slides WHERE name LIKE ?').get('s306কিউএ%');
  console.log('SLIDES-LEFT=' + (c && c.n != null ? c.n : '?')); db.saveDb(); process.exit(0); // তাৎক্ষণিক-ফ্লাশ
}).catch(e=>{console.error(e.message);process.exit(1);});
") | grep -q 'SLIDES-LEFT=0' && ok "পরিষ্কার-পরবর্তী s311-স্লাইড=০ (নেট-শূন্য-১b)" || bad "অবশিষ্ট s311-স্লাইড≠০"
# সার্ভার = বুট-টাইম in-memory ডিবি — ডিস্ক-ক্লিন-যাচাইয়ে রিস্টার্ট-বাধ্যতমূলক (in-memory-স্টেল-গোটচা)
pkill -9 -f "node server.js" 2>/dev/null; sleep 1
(cd "$ROOT" && bash ensure-server.sh) >/dev/null 2>&1 && ok "পরিষ্কার-পরবর্তী সার্ভার-রিস্টার্ট (ডিস্ক-সত্য)" || bad "রিস্টার্ট-ব্যর্থ"
HC2=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
[ "$HC2" = "200" ] && ok "পরিষ্কার-পরবর্তী হোম 200 (সার্ভার-সুস্থ — নেট-শূন্য-২)" || bad "পরিষ্কার-পরবর্তী হোম HTTP $HC2"
HTML2=$(curl -s "$BASE/")
echo "$HTML2" | grep -q 'id="epk310Pages"' && ! echo "$HTML2" | grep -q '"pages":52' && ok "পরিষ্কার-পরবর্তী pages:52-অনুপস্থিত কিন্তু ব্যাজ-কাঠামো-জীবিত (গ্রেসফুল — নেট-শূন্য-৩)" || bad "পরিষ্কার-পরবর্তী অবস্থা-অমিল"

echo
echo "══ s311-সুইট: PASS=$PASS FAIL=$FAIL SKIP=$SKIP ══"
[ "$FAIL" = "0" ] && echo "✅ সর্ব-গ্রিন" || echo "❌ ব্যর্থতা-বিদ্যমান"
exit $FAIL
