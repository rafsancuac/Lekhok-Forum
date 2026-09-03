#!/bin/bash
# E2E test: admin/moderator login flows + scope fixes (v2.6)
# Run from the lekhok-forum repo root (needs node_modules for sql.js lookup):
#   node server.js &   # or use scripts/run-all-tests.sh
#   bash scripts/test-login-fixes.sh
cd "$(dirname "$0")/.."
B=http://localhost:8080
PASS=0; FAIL=0
check() { # name, expected, actual
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "✓ $1"; else FAIL=$((FAIL+1)); echo "✗ $1 (expected $2, got $3)"; fi
}

# 1. Smart admin login on USER page /login  → 302 /admin
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -c /tmp/cj1.txt -X POST $B/login -d "username=admin&password=admin123")
check "admin creds on /login → 302 to /admin" "302|${B}/admin" "$code"

# 2. With that session, /admin dashboard loads 200
code=$(curl -s -o /tmp/admin-dash.html -w "%{http_code}" -b /tmp/cj1.txt $B/admin)
check "GET /admin (admin session from /login)" "200" "$code"

# 3. Wrong password on /login → 200 with error re-render
code=$(curl -s -o /tmp/wrong.html -w "%{http_code}" -c /tmp/cj2.txt -X POST $B/login -d "username=admin&password=WRONG")
check "wrong admin password → error page 200" "200" "$code"
grep -q "ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড" /tmp/wrong.html && echo "✓ error message shown" || { echo "✗ error message missing"; FAIL=$((FAIL+1)); }

# 4. Moderator login via /login → 302 /dashboard
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -c /tmp/cj3.txt -X POST $B/login -d "username=moderator&password=moderator123")
check "moderator/moderator123 on /login → 302 /dashboard" "302|${B}/dashboard" "$code"

# 5. Moderator dashboard /moderator → 200
code=$(curl -s -o /tmp/mod-dash.html -w "%{http_code}" -b /tmp/cj3.txt $B/moderator)
check "GET /moderator (moderator session)" "200" "$code"
grep -q "মডারেটর" /tmp/mod-dash.html && echo "✓ moderator dashboard renders" || { echo "✗ moderator dashboard content missing"; FAIL=$((FAIL+1)); }

# 6. /admin staff dashboard with moderator session → 200
code=$(curl -s -o /tmp/mod-admin.html -w "%{http_code}" -b /tmp/cj3.txt $B/admin)
check "GET /admin (moderator session, staff)" "200" "$code"

# 7. /admin/notices with moderator (canonical 'notice' scope via alias) → 200
code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cj3.txt $B/admin/notices)
check "GET /admin/notices (moderator, scope ok)" "200" "$code"

# 8. /moderator/notices (canonical singular scope) → 200
code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cj3.txt $B/moderator/notices)
check "GET /moderator/notices (moderator)" "200" "$code"

# 9. /moderator/daily/quiz → 200
code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cj3.txt $B/moderator/daily/quiz)
check "GET /moderator/daily/quiz (moderator)" "200" "$code"

# 10. Regular user (ismail/demo123) still works via /login → 302 /dashboard
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -c /tmp/cj4.txt -X POST $B/login -d "username=ismail&password=demo123")
check "ismail/demo123 on /login → 302 /dashboard" "302|${B}/dashboard" "$code"

# 11. Regular user denied on /moderator → 403
code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cj4.txt $B/moderator)
check "GET /moderator (regular user) → 403" "403" "$code"

# 12. Regular user redirected from /admin → 302 /admin/login
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -b /tmp/cj4.txt $B/admin)
check "GET /admin (regular user) → 302 /admin/login" "302|${B}/admin/login" "$code"

# 13. Classic /admin/login POST still works → 302 /admin
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -c /tmp/cj5.txt -X POST $B/admin/login -d "username=admin&password=admin123")
check "POST /admin/login admin/admin123 → 302 /admin" "302|${B}/admin" "$code"

# 14. Admin moderators management page renders canonical scopes
code=$(curl -s -o /tmp/modmgmt.html -w "%{http_code}" -b /tmp/cj1.txt $B/admin/moderators)
check "GET /admin/moderators" "200" "$code"
grep -q "আজকের কুইজ" /tmp/modmgmt.html && echo "✓ canonical scopes visible in admin UI" || { echo "✗ canonical scopes missing in admin UI"; FAIL=$((FAIL+1)); }
grep -q "ডেমো মডারেটর" /tmp/modmgmt.html && echo "✓ demo moderator listed in staff" || { echo "✗ demo moderator not listed"; FAIL=$((FAIL+1)); }

# 15. Moderator user edit page renders scope checkboxes correctly
mid=$(node -e "
const i=require('sql.js'),fs=require('fs');
(async()=>{const S=await i();
const db=new S.Database(fs.readFileSync('lekhok.db'));
const r=db.exec(\"SELECT id FROM users WHERE username='moderator'\");
console.log(r[0].values[0][0]);})();")
code=$(curl -s -o /tmp/medit.html -w "%{http_code}" -b /tmp/cj1.txt $B/admin/users/$mid/edit)
check "GET /admin/users/:id/edit (moderator)" "200" "$code"
grep -q "value=\"notice\"" /tmp/medit.html && echo "✓ scope checkbox values correct" || { echo "✗ scope checkbox values broken"; FAIL=$((FAIL+1)); }

# 16. Logout works
code=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -b /tmp/cj1.txt -c /tmp/cj1.txt $B/admin/logout)
check "GET /admin/logout → redirect" "302" "$(echo $code | cut -d'|' -f1)"

echo ""
echo "═══════════════════════════════════"
echo "PASS: $PASS  FAIL: $FAIL"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✓" || echo "SOME CHECKS FAILED ✗"
exit $FAIL
