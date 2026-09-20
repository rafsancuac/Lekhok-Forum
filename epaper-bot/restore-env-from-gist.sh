#!/usr/bin/env bash
# restore-env-from-gist.sh — ভল্ট-গিস্ট → epaper-bot/.env (session184)
# ব্যবহার: GITHUB_TOKEN=ghp_xxx bash restore-env-from-gist.sh
set -eu
BOT="$(cd "$(dirname "$0")" && pwd)"
GIST_ID_FILE="$BOT/.vault-gist-id"
[ -f "$GIST_ID_FILE" ] || { echo "❌ .vault-gist-id-নেই (আগে কখনো সেভ-হয়নি)"; exit 1; }
: "${GITHUB_TOKEN:?GITHUB_TOKEN-env-দিন (কেবল-রানটাইম)}"
GID=$(cat "$GIST_ID_FILE")
HTTP=$(curl -s -o /tmp/vault-get.json -w "%{http_code}" \
  -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/gists/$GID")
[ "$HTTP" = "200" ] || { echo "❌ GET-ব্যর্থ HTTP-$HTTP"; exit 1; }
python3 - /tmp/vault-get.json "$BOT/.env" <<'PY'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
content = d["files"]["epaper-bot.env"]["content"]
open(sys.argv[2], 'w', encoding='utf-8').write(content)
PY
chmod 600 "$BOT/.env"
rm -f /tmp/vault-get.json
echo "✅ .env ভল্ট-থেকে-রিস্টোর (gist $GID)"
