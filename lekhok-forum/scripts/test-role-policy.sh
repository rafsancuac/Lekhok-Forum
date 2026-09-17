#!/bin/bash
# ═══ সেশন ৮১: রোল-হায়ারার্কি ও লগইন-বিভাজন E2E v2 ═══
P=${RP_PORT:-8080}; BASE="http://localhost:$P"
PASS=0; FAIL=0
ck() { if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (expected [$2] got [$3])"; fi }
ckc() { if echo "$3" | grep -q "$2"; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (missing: $2)"; fi }
strip() { echo "$1" | sed 's|https\?://[^/]*||'; }
# getcsrf <jar> <page> — fetch page with jar, extract csrf token
getcsrf() { curl -s -b "$1" -c "$1" "$BASE$2" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//'; }
# login <jar> <page> <user> <pass> — full login flow, echoes "code redirectpath"
# সেশন ১১৪-হার্ডেনিং: সেশন-রাইট-রেসে csrf-block (200-রেন্ডার) হলে ব্রাউজারের
# graceful "?csrf=1" রিকভারির মিরর — একবার টোকেন-ফেচ+POST রিট্রাই, নইলে ফেল-ভ্যালু।
login() {
  local J=$1 PG=$2 U=$3 PW=$4
  local TOK=$(getcsrf "$J" "$PG")
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  if [ "${R%% *}" = "200" ]; then
    TOK=$(getcsrf "$J" "$PG")
    R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PG" --data-urlencode "username=$U" --data-urlencode "password=$PW" --data-urlencode "_csrf=$TOK")
  fi
  echo "${R%% *} $(strip "${R#* }")"
}
# get <jar> <path> -> code
get() { curl -s -b "$1" -o /dev/null -w "%{http_code}" "$BASE$2"; }
# getR <jar> <path> -> "code redirectpath"
getR() { local R=$(curl -s -b "$1" -o /dev/null -w "%{http_code} %{redirect_url}" "$BASE$2"); echo "${R%% *} $(strip "${R#* }")"; }
# postf <jar> <page> <path> k=v k=v... — CSRF-valid form POST
postf() {
  local J=$1 PG=$2 PATHP=$3; shift 3
  local TOK=$(getcsrf "$J" "$PG")
  local ARGS=()
  for kv in "$@"; do ARGS+=(--data-urlencode "$kv"); done
  local R=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code} %{redirect_url}" -X POST "$BASE$PATHP" "${ARGS[@]}" --data-urlencode "_csrf=$TOK")
  echo "${R%% *} $(strip "${R#* }")"
}

JARU=/tmp/jar_user; JARM=/tmp/jar_mod; JARA=/tmp/jar_admin; JARTA=/tmp/jar_testadmin
rm -f $JARU $JARM $JARA $JARTA

echo "══ ১. লগইন-পোর্টাল বিভাজন ══"
R=$(login $JARU /login admin admin123); ck "admin via /login প্রত্যাখ্যাত (200)" "200" "${R%% *}"
LASTJAR2=/tmp/jar_msg1; rm -f $LASTJAR2
TOK=$(getcsrf $LASTJAR2 /login)
MSGHTML=$(curl -s -b $LASTJAR2 -X POST $BASE/login --data-urlencode "username=admin" --data-urlencode "password=admin123" --data-urlencode "_csrf=$TOK")
ckc "admin-/login বার্তা: স্টাফ অ্যাকাউন্ট" "স্টাফ অ্যাকাউন্ট" "$MSGHTML"
ckc "admin-/login বার্তায় স্টাফ-পোর্টাল লিংক" "/admin/login" "$MSGHTML"
R=$(login $JARU /login moderator moderator123); ck "moderator via /login প্রত্যাখ্যাত" "200" "${R%% *}"
R=$(login $JARU /login testuser demo123); ck "user via /login → /dashboard" "/dashboard" "${R##* }"
R=$(login $JARA /admin/login admin admin123); ck "admin via /admin/login → /admin" "/admin" "${R##* }"
R=$(login $JARM /admin/login moderator moderator123); ck "moderator via /admin/login → /moderator" "/moderator" "${R##* }"
R=$(login /tmp/jar_tu2 /admin/login testuser demo123); ck "user via /admin/login প্রত্যাখ্যাত" "200" "${R%% *}"
LASTJAR3=/tmp/jar_msg2; rm -f $LASTJAR3
TOK=$(getcsrf $LASTJAR3 /admin/login)
MSGHTML=$(curl -s -b $LASTJAR3 -X POST $BASE/admin/login --data-urlencode "username=testuser" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
# সেশন ১১৪: csrf-রেস-ব্লক (টোকেন-মিরর-রিট্রাই) — ব্লকড-রেসপন্সে বার্তা থাকে না
if ! echo "$MSGHTML" | grep -q "স্টাফ লগইন পোর্টাল"; then
  TOK=$(getcsrf $LASTJAR3 /admin/login)
  MSGHTML=$(curl -s -b $LASTJAR3 -X POST $BASE/admin/login --data-urlencode "username=testuser" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
fi
ckc "স্টাফ-পোর্টালে ইউজার-প্রত্যাখ্যান বার্তা" "স্টাফ লগইন পোর্টাল" "$MSGHTML"
ckc "ইউজার-লগইন লিংক" "/login" "$MSGHTML"

echo "══ ২. সেশন প্রস্তুতি (fresh jars) ══"
login $JARU /login testuser demo123 > /dev/null
login $JARM /admin/login moderator moderator123 > /dev/null
login $JARA /admin/login admin admin123 > /dev/null
login $JARTA /admin/login testadmin demo123 > /dev/null
ck "user /dashboard 200" "200" "$(get $JARU /dashboard)"
ck "moderator /moderator 200" "200" "$(get $JARM /moderator)"
ck "admin(সুপার) /admin 200" "200" "$(get $JARA /admin)"
ck "testadmin(user-role admin) /admin 200" "200" "$(get $JARTA /admin)"

echo "══ ৩. ক্রস-রোল প্যানেল-প্রত্যাখ্যান ══"
ck "moderator → /admin 200 (RBAC: ড্যাশবোর্ড-শেল moderator-ও দেখেন)" "200" "$(get $JARM /admin)"
ck "moderator → /admin/super 403" "403" "$(get $JARM /admin/super)"
ck "user → /moderator 403" "403" "$(get $JARU /moderator)"
ck "user → /admin 302 (requireStaff redirect)" "302" "$(get $JARU /admin)"
ck "testadmin → /admin/super 403 (সুপার নয়)" "403" "$(get $JARTA /admin/super)"

echo "══ ৪. সোয়াপ ══"
R=$(getR $JARTA /admin/switch); ck "testadmin /admin/switch → /dashboard" "302 /dashboard" "$R"
R=$(getR $JARTA /admin/switch); ck "testadmin /admin/switch → /admin" "302 /admin" "$R"
R=$(getR $JARM /moderator/switch); ck "moderator /moderator/switch → /dashboard" "302 /dashboard" "$R"
R=$(getR $JARM /moderator/switch); ck "moderator /moderator/switch → /moderator" "302 /moderator" "$R"
R=$(getR $JARA /admin/switch); ck "সুপার /admin/switch → /admin/login (সোয়াপ-নেই)" "302 /admin/login" "$R"

echo "══ ৫. সরাসরি-কানেকশন নীতি (DM) ══"
R=$(getR $JARU /messages/moderator); ckc "user→moderator DM ব্লক+err" "err=" "$R"
R=$(getR $JARM /messages/testuser); ck "moderator→user DM ব্লক 302" "302" "${R%% *}"
R=$(getR $JARM /messages/testadmin); ck "moderator→admin DM ব্লক 302" "302" "${R%% *}"
ck "user→user DM অনুমোদিত 200" "200" "$(get $JARU /messages/testadmin)"
R=$(curl -s -b $JARU -X POST "$BASE/messages/moderator" -H "Content-Type: application/json" -H "Accept: application/json" -d '{"body":"hi"}'); ckc "user→moderator POST JSON ব্লক" "রোল-নীতি" "$R"
MSG=$(python3 -c 'import urllib.parse;print(urllib.parse.quote("রোল-নীতি: টেস্টবার্তা"))')
HTML=$(curl -s -b $JARU "$BASE/messages?err=$MSG"); ckc "লিস্ট-পেজে নীতি-বার্তা ব্যানার" "রোল-নীতি: টেস্টবার্তা" "$HTML"

echo "══ ৬. সরাসরি-কানেকশন নীতি (ফলো) ══"
login $JARM /admin/login moderator moderator123 > /dev/null
MODID=47; TAID=49; TUID=48
R=$(curl -s -b $JARU -X POST "$BASE/follow/$MODID"); ckc "user→moderator ফলো ব্লক" "role_policy" "$R"
R=$(curl -s -b $JARM -X POST "$BASE/follow/$TUID"); ckc "moderator→user ফলো ব্লক" "role_policy" "$R"
R=$(curl -s -b $JARM -X POST "$BASE/follow/$TAID"); ckc "moderator→admin ফলো ব্লক" "role_policy" "$R"
R=$(curl -s -b $JARU -X POST "$BASE/follow/5"); ckc "user→user ফলো OK" "following" "$R"

echo "══ ৭. রোল-নিয়োগ হায়ারার্কি ══"
R=$(postf $JARTA /admin/moderators /admin/users/$TUID/role "role=admin"); ck "user-role admin→admin নিয়োগ অবাঞ্ছিত (302, role ignored)" "303" "${R%% *}"
sleep 1; ROLE=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT role FROM users WHERE id=$TUID')[0].values[0][0])})" 2>/dev/null)
ck "testuser role অপরিবর্তিত (user)" "user" "$ROLE"
R=$(postf $JARTA /admin/moderators /admin/users/$TUID/role "role=moderator"); ck "user-role admin→moderator নিয়োগ 303" "303" "${R%% *}"
sleep 1; ROLE=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT role FROM users WHERE id=$TUID')[0].values[0][0])})" 2>/dev/null)
ck "testuser এখন moderator" "moderator" "$ROLE"
R=$(postf $JARA /admin/moderators /admin/users/$TUID/role "role=user"); ck "সুপার→role=user পুনরুদ্ধার 303" "303" "${R%% *}"
sleep 1; ROLE=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT role FROM users WHERE id=$TUID')[0].values[0][0])})" 2>/dev/null)
ck "testuser role user-এ ফিরেছে" "user" "$ROLE"

echo "══ ৮. মডারেটর ইউজার-তদারকি ══"
ck "moderator /moderator/users 200" "200" "$(get $JARM /moderator/users)"
HTML=$(curl -s -b $JARM "$BASE/moderator/users"); ckc "তদারকি-পেজে testuser" "testuser" "$HTML"
R=$(postf $JARM /moderator/users /moderator/users/$TUID/status "status=banned"); ck "moderator→testuser নিষেধ 303" "303" "${R%% *}"
sleep 1; ST=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT status FROM users WHERE id=$TUID')[0].values[0][0])})" 2>/dev/null)
ck "testuser DB status=banned" "banned" "$ST"
R=$(login /tmp/jar_ban /login testuser demo123); ck "ব্যান-করা ইউজার লগইন আটকায় (200)" "200" "${R%% *}"
R=$(postf $JARM /moderator/users /moderator/users/$TUID/status "status=active"); ck "moderator→ফেরত 303" "303" "${R%% *}"
sleep 1; ST=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT status FROM users WHERE id=$TUID')[0].values[0][0])})" 2>/dev/null)
ck "testuser status=active ফেরত" "active" "$ST"
R=$(postf $JARM /moderator/users /moderator/users/$TAID/status "status=banned"); ckc "moderator→স্টাফ-নিষেধ ব্লক" "err=staff" "$R"
sleep 1; ST=$(node -e "const i=require('./node_modules/sql.js'),f=require('fs');i().then(S=>{const d=new S.Database(f.readFileSync('./lekhok.db'));console.log(d.exec('SELECT status FROM users WHERE id=$TAID')[0].values[0][0])})" 2>/dev/null)
ck "testadmin অক্ষত (active)" "active" "$ST"
ck "user /moderator/users 403" "403" "$(get $JARU /moderator/users)"
HTML=$(curl -s -b $JARM "$BASE/moderator"); ckc "মডারেটর-সাইডবারে তদারকি লিংক" "/moderator/users" "$HTML"
HTML=$(curl -s -b $JARM "$BASE/moderator"); ckc "সাইডবারে সোয়াপ বাটন" "ইউজার ইন্টারফেসে সোয়াপ" "$HTML"

echo "══ ৯. UI স্মোক ══"
HTML=$(curl -s "$BASE/admin/login"); ckc "স্টাফ-লগইন শিরোনাম" "স্টাফ লগইন" "$HTML"
ckc "স্টাফ-লগইনে ইউজার-লিংক" "/login" "$HTML"
HTML=$(curl -s "$BASE/login"); ckc "ইউজার-লগইন ব্যাজ" "সাধারণ ব্যবহারকারীদের লগইন" "$HTML"

echo "══ ১০. পাবলিক রিগ্রেশন স্মোক ══"
for pg in / /about /articles /qa /notices /events /gallery /committee /members /contact /quiz /epaper /resources /activities /best-writer /birthdays /on-this-day /search; do
  C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$pg"); ck "GET $pg 200" "200" "$C"
done

echo "══ ১১. গ্রুপ-সংযোজন নীতি (সেশন ৮৬) ══"
# moderator creates group adding testuser (adjacent pair) → group NOT created
R=$(postf $JARM /messages /messages/group/create "title=পরীক্ষা গ্রুপ ১" "members=testuser")
ckc "moderator গ্রুপে user নিতে পারে না (গ্রুপ-নির্মাণ বাতিল)" "err=" "$R"
ckc "গ্রুপ-নীতি বার্তা" "%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A7%81%E0%A6%AA%E0%A7%87%20%E0%A6%AF%E0%A7%81%E0%A6%95%E0%A7%8D%E0%A6%A4" "$R"
# user creates group with testadmin (user↔admin NOT adjacent) → OK
R=$(postf $JARU /messages /messages/group/create "title=ইউজার-গ্রুপ" "members=testadmin")
ckc "user গ্রুপে admin (skip-level) নিতে পারে" "messages/g/" "$R"
CONV=$(echo "$R" | grep -o 'messages/g/[0-9]*' | head -1 | grep -o '[0-9]*$')
# user adds moderator to that group → blocked=1
R=$(postf $JARU /messages/g/$CONV /messages/g/$CONV/members/add "members=moderator")
ckc "user গ্রুপে moderator যোগ ব্লক (blocked=1)" "blocked=1" "$R"
R=$(postf $JARU /messages/g/$CONV /messages/g/$CONV/members/add "members=jannatul_sayma")
ckc "user গ্রুপে user যোগ OK (added=1)" "added=1" "$R"
# group view renders with blocked notice
HTML=$(curl -s -b $JARU "$BASE/messages/g/$CONV?blocked=1"); ckc "গ্রুপ-চ্যাটে ব্লক-নোটিশ" "যুক্ত করা যায়নি" "$HTML"

echo "══ ১২. তদারকি-কারণ + বিজ্ঞপ্তি + স্কোপ-প্রত্যাহার (সেশন ৯০) ══"
# moderator bans testuser WITH reason → notification for testuser
R90=$(postf $JARM /moderator/users /moderator/users/$TUID/status "status=banned" "reason=পরীক্ষা-কারণ-৯০")
ck "moderator কারণসহ নিষেধ 303" "303" "${R90%% *}"
# restore with note
R90=$(postf $JARM /moderator/users /moderator/users/$TUID/status "status=active" "reason=পরীক্ষা-প্রত্যাহার-৯০")
ck "moderator নোটসহ ফেরত 303" "303" "${R90%% *}"
# নিষেধ-অবস্থায় সেশন ব্লক/ধ্বংস হয় → ফেরত-পরে রি-লগইন করে বিজ্ঞপ্তি পড়া
login $JARU /login testuser demo123 > /dev/null
HTML=$(curl -s -b $JARU "$BASE/notifications")
ckc "ইউজার বিজ্ঞপ্তি: নিষেধ-শিরোনাম" "সাময়িক নিষেধ" "$HTML"
ckc "ইউজার বিজ্ঞপ্তিতে কারণ" "পরীক্ষা-কারণ-৯০" "$HTML"
ckc "ইউজার বিজ্ঞপ্তি: প্রত্যাহার-শিরোনাম" "প্রত্যাহৃত" "$HTML"
# overlong reason rejected
LONG90=$(python3 -c "print('x'*301)")
R90=$(postf $JARM /moderator/users /moderator/users/$TUID/status "status=banned" "reason=$LONG90")
ckc "৩০০+ অক্ষর কারণ প্রত্যাখ্যাত (err=reason)" "err=reason" "$R90"
HTML=$(curl -s -b $JARU "$BASE/notifications")
if echo "$HTML" | grep -q "xxxxx"; then FAIL=$((FAIL+1)); echo "  ✗ overlong-reason নিষেধ সত্ত্বেও বিজ্ঞপ্তি গেছে"; else PASS=$((PASS+1)); echo "  ✓ overlong-কারণে বিজ্ঞপ্তি/নিষেধ নেই"; fi
# oversize guard: ensure testuser still active after rejected ban
ST87=$(curl -s -b $JARU -o /dev/null -w "%{http_code}" "$BASE/dashboard")
ck "rejected-ban পরেও testuser লগইন-সক্ষম (active)" "200" "$ST87"
# oversight page new UI
HTML=$(curl -s -b $JARM "$BASE/moderator/users")
ckc "তদারকি-পেজে স্ট্যাট-চিপ (mu-stats)" "mu-stats" "$HTML"
ckc "তদারকি-পেজে কারণসহ-ফর্ম (mu-reason)" "mu-reason" "$HTML"
ckc "তদারকি-পেজে সাম্প্রতিক-ফিড" "সাম্প্রতিক তদারকি" "$HTML"
# super dashboard: revoke button visible + audit feed shows reason
HTML=$(curl -s -b $JARA "$BASE/admin/super")
ckc "সুপার-ড্যাশবোর্ডে স্কোপ-প্রত্যাহার বাটন" "revoke-user-mgmt" "$HTML"
ckc "সুপার-অডিট-ফিডে কারণ সংরক্ষিত" "কারণ: পরীক্ষা-কারণ-৯০" "$HTML"
# profile role badge (testadmin = users.role admin)
HTML=$(curl -s "$BASE/profile/testadmin")
ckc "প্রোফাইলে এডমিন-রোল-ব্যাজ" "pf-role-badge" "$HTML"
ckc "প্রোফাইল-ব্যাজ লেবেল" "এডমিন" "$HTML"
# revoke user_mgmt from demo moderator → loses /moderator/users
R90=$(postf $JARA /admin/super /admin/super/moderators/$MODID/revoke-user-mgmt)
ckc "সুপার স্কোপ-প্রত্যাহার 303 (saved=scope_revoke)" "saved=scope_revoke" "$R90"
ck "revoke-পরে moderator /moderator/users 403" "403" "$(get $JARM /moderator/users)"
HTML=$(curl -s -b $JARA "$BASE/admin/super?saved=scope_revoke")
ckc "revoke-পরে ফ্ল্যাশ বার্তা" "প্রত্যাহার হয়েছে" "$HTML"
# re-grant to keep demo state sane (scopes POST replaces list)
R90=$(postf $JARA /admin/users /admin/users/$MODID/scopes "scopes=user_mgmt" "scopes=resources")
ck "user_mgmt পুনঃপ্রদান 303" "303" "${R90%% *}"
ck "পুনঃপ্রদান-পরে moderator /moderator/users 200" "200" "$(get $JARM /moderator/users)"

# ═══ সেশন ১০১: রিসোর্স-স্কোপ + এন্ডপয়েন্ট-গার্ড ═══
ck "anon /moderator/resources → লগইন-রিডাইরেক্ট" "302" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/moderator/resources")"
ck "plain-user /moderator/resources 403" "403" "$(get $JARU /moderator/resources)"
ck "moderator /moderator/resources 200" "200" "$(get $JARM /moderator/resources)"
ck "admin /admin/resources 200" "200" "$(get $JARA /admin/resources)"
ck "admin /admin/resources/new 200" "200" "$(get $JARA /admin/resources/new)"
R=$(curl -s -b $JARU -X POST -H "Content-Type: application/json" -d '{"kind":"view"}' "$BASE/api/resources/1/stat")
ckc "plain-user stat-কাউন্টার পাবলিক ok" '"ok":true' "$R"
R=$(curl -s -X POST -H "Content-Type: application/json" -d '{"kind":"bogus"}' "$BASE/api/resources/1/stat")
ckc "stat bogus-kind → view-তে ফলব্যাক ok" '"ok":true' "$R"
R=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/resources/0/stat")
ck "stat invalid-id 400" "400" "$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/resources/0/stat")"

echo ""

# ═══ সেশন ১১৩: কমেন্ট-এডিট/ডিলিট API — অথরাইজেশন-চেক (session105-চুক্তি) ═══
# JSON-API (CSRF-মুক্ত) — target comment id সিড-নির্ভর; চলানোর আগে SEED_CMT সেট করুন
echo "══ ১৫. কমেন্ট PUT/DELETE অথরাইজেশন ══"
# সেশন ১১৪: সেশন-১১৩-র "SEED_CMT-ডকুমেন্টেশন/ফ্রেশ-ক্লোন" বকেয়া এখন শেষ —
# টার্গেট-মন্তব্য এখন আর সিড-নির্ভর নয়: ismail হয়ে POST /api/comment দিয়ে
# নিজের-মন্তব্য HTTP-API-তেই সিড করা হয় (চলমান-সার্ভার-মধ্যস্থ — স্যান্ডবক্স-গোটচা-সেফ),
# শেষ-ধাপের নিজের-DELETE-ই ক্লিনআপ (নতুন-কভারেজ: নিজের-কমেন্ট DELETE → 200)।
put() { curl -s -b "$1" -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/comments/$2" -H "Content-Type: application/json" -d "{\"body\":\"$3\"}"; }
del() { curl -s -b "$1" -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/comments/$2"; }
api() { curl -s -b "$1" -H "Content-Type: application/json" -d "$2" "$3"; }
JARV=/tmp/jar_viewer; rm -f $JARV
R=$(login $JARV /login ismail secret123); ck "viewer-লগইন (ismail)" "/dashboard" "${R##* }"
SEED_CMT=$(curl -s -b $JARV -X POST "$BASE/api/comment" -H "Content-Type: application/json" -d '{"post_id":1,"body":"role-policy §১৫ সেলফ-সিড মন্তব্য (session114)"}' | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$SEED_CMT" ]; then echo "  ✗ §15-সেলফ-সিড ব্যর্থ (POST /api/comment)"; FAIL=$((FAIL+1)); SEED_CMT=0; else echo "  ✓ §15-সেলফ-সিড মন্তব্য id=$SEED_CMT"; PASS=$((PASS+1)); fi
ck "anon PUT → 401" "401" "$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/comments/$SEED_CMT" -H "Content-Type: application/json" -d '{"body":"x"}')"
ck "anon DELETE → 401" "401" "$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/comments/$SEED_CMT")"
ck "bogus-id PUT → 400" "400" "$(put $JARV 0 'x')"
ck "অন্যের-কমেন্ট PUT → 403" "403" "$(put $JARU $SEED_CMT 'হাইজ্যাক')"
ck "অন্যের-কমেন্ট DELETE → 403" "403" "$(del $JARU $SEED_CMT)"
ck "নিজের-কমেন্ট PUT → 200" "200" "$(put $JARV $SEED_CMT 'সম্পাদিত-চেক-১১৪')"
ck "নিজের-কমেন্ট DELETE → 200 (ক্লিনআপ)" "200" "$(del $JARV $SEED_CMT)"
R=$(curl -s -b $JARV -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/comments/$SEED_CMT" -H "Content-Type: application/json" -d '{"body":"ghost"}')
ck "মুছে-ফেলা-কমেন্ট PUT → 404 (ghost)" "404" "$R"

# ═══ সেশন ১১৭: রিসোর্স bulk/update অথরাইজেশন (RES-108-সুপারিশ ④) ═══
# bulk = JSON + X-CSRF-Token (নিজস্ব-যাচাই); update = multipart (গ্লোবাল-গার্ড + মালিকানা-গার্ড)
echo "══ ১৬. রিসোর্স bulk/update অথরাইজেশন ══"
ck "anon bulk → 303" "303" "$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/bulk" -H "Content-Type: application/json" -d '{"csv":"title\nx"}')"
ck "user bulk → 403" "403" "$(curl -s -b $JARU -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/bulk" -H "Content-Type: application/json" -d '{"csv":"title\nx"}')"
ck "mod bulk no-CSRF → 403" "403" "$(curl -s -b $JARM -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/bulk" -H "Content-Type: application/json" -d '{"csv":"title\nx"}')"
ck "anon update → 303" "303" "$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/1/update")"
ck "user update → 403" "403" "$(curl -s -b $JARU -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/1/update")"
# মালিকানা-গার্ড: মডারেটর (testuser) অ্যাডমিন-সৃষ্ট রিসোর্স-১-এর মালিক নয় → 403 (সঠিক-CSRF-সহ)
TOKM=$(getcsrf $JARM /moderator/resources)
ck "mod update other's → 403" "403" "$(curl -s -b $JARM -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/1/update?_csrf=$TOKM" -F "title=হাইজ্যাক-১১৭")"
# নিজের-আপলোড তৈরি → আপডেট → 302 (posted=2) → ট্র্যাশ-ডিলিট ক্লিন-আপ
ck "mod নিজের-আপলোড তৈরি → 303" "303" "$(curl -s -b $JARM -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources?_csrf=$TOKM" -F "title=rp117-own-check" -F "res_type=link" -F "link_url=https://example.com/rp117" -F "category=guide")"
RP117=$(curl -s -b $JARM "$BASE/moderator/resources" | grep -o 'edit=[0-9]*' | head -40 | grep -o '[0-9]*' | while read i; do curl -s -b $JARM "$BASE/resources/$i" | grep -q 'rp117-own-check' && echo $i && break; done)
TOKM2=$(getcsrf $JARM /moderator/resources)
ck "mod update own → 303" "303" "$(curl -s -b $JARM -o /dev/null -w "%{http_code}" -X POST "$BASE/moderator/resources/$RP117/update?_csrf=$TOKM2" -F "title=rp117-own-check-2" -F "res_type=link" -F "link_url=https://example.com/rp117" -F "category=guide")"
[ -n "$RP117" ] && curl -s -b $JARM -o /dev/null -X POST "$BASE/moderator/resources/$RP117/delete?_csrf=$TOKM2"

echo ""

# ═══ সেশন ১২১: রিসোর্স stat-এন্ডপয়েন্ট অ্যাবিউজ-গার্ড (RES-119-সুপারিশ ③ — playlist-ভিউ-চেক) ═══
# ভিউ-কাউন্টার = পাবলিক (প্লেলিস্ট/কার্ড-ক্লিক থেকে ফায়ার) — কিন্তু ডিডুপ-উইন্ডো (৩০সে),
# পদ্ধতি-সীমা (শুধু POST), অজানা/অসংখ্যা-id-নিরাপত্তা সঠিক থাকতে হবে (500-বিস্ফোরণ-নিষেধ)
echo "══ ১৭. রিসোর্স stat অ্যাবিউজ-গার্ড ══"
ck "stat anon view → 200 (ডিডুপ-হলেও 200)" "200" "$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/resources/1/stat" -H "Content-Type: application/json" -d '{"kind":"view"}')"
ckc "stat dedup ৩০সে-উইন্ডো → deduped:true" '"deduped":true' "$(curl -s -X POST "$BASE/api/resources/1/stat" -H "Content-Type: application/json" -d '{"kind":"view"}')"
ck "stat download-kind → 200" "200" "$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/resources/1/stat" -H "Content-Type: application/json" -d '{"kind":"download"}')"
ckc "stat অজানা-id → নিরাপদ ok:true (নো-এক্সপশন)" '"ok":true' "$(curl -s -X POST "$BASE/api/resources/999999/stat" -H "Content-Type: application/json" -d '{"kind":"view"}')"
ck "stat non-numeric-id → 400" "400" "$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/resources/abc/stat" -H "Content-Type: application/json" -d '{}')"
ck "GET stat → 404 (catch-all, 500-নয়)" "404" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/resources/1/stat")"

echo ""
echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✓" || echo "FAILURES ✗"
[ $FAIL -gt 0 ] && exit 1
exit 0