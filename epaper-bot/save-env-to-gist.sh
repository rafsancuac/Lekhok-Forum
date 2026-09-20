#!/usr/bin/env bash
# save-env-to-gist.sh — epaper-bot/.env → প্রাইভেট-গিস্ট-ভল্ট (স্যান্ডবক্স-রিসেট-প্রুফ) (session184)
# ব্যবহার: GITHUB_TOKEN=ghp_xxx bash save-env-to-gist.sh
#   · GITHUB_TOKEN কেবল-এ-কলের-env — কোনো-ফাইলে-লেখা-হয়-না
#   · গিস্ট-আইডি প্রথম-বার তৈরি হলে .vault-gist-id-এ সংরক্ষিত-হয় (আইডি-নিজে-গোপন-নয়)
set -eu
BOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$BOT/.env"
GIST_ID_FILE="$BOT/.vault-gist-id"
: "${GITHUB_TOKEN:?GITHUB_TOKEN-env-দিন (কেবল-রানটাইম)}"
[ -f "$ENV_FILE" ] || { echo "❌ .env-নেই"; exit 1; }
grep -q "TG_SESSION=" "$ENV_FILE" || { echo "❌ .env-অসম্পূর্ণ"; exit 1; }

API="https://api.github.com/gists"
AUTH=(-H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json")
PAYLOAD_FILE=$(mktemp)
trap 'rm -f "$PAYLOAD_FILE"' EXIT
python3 - "$ENV_FILE" "$PAYLOAD_FILE" <<'PY'
import json, sys
env = open(sys.argv[1], encoding='utf-8').read()
json.dump({"files": {"epaper-bot.env": {"content": env}}}, open(sys.argv[2], 'w', encoding='utf-8'))
PY

if [ -f "$GIST_ID_FILE" ]; then
  GID=$(cat "$GIST_ID_FILE")
  HTTP=$(curl -s -o /tmp/vault-patch.json -w "%{http_code}" -X PATCH "$API/$GID" "${AUTH[@]}" -d @"$PAYLOAD_FILE")
  [ "$HTTP" = "200" ] || { echo "❌ PATCH-ব্যর্থ HTTP-$HTTP"; exit 1; }
  echo "✅ ভল্ট-আপডেট হয়েছে (gist $GID)"
else
  python3 - "$PAYLOAD_FILE" <<'PY'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
d["description"] = "lekhok-forum epaper-bot vault (private) — স্যান্ডবক্স-রিসেট-প্রুফ .env ব্যাকআপ"
d["public"] = False
json.dump(d, open(sys.argv[1], 'w', encoding='utf-8'))
PY
  HTTP=$(curl -s -o /tmp/vault-create.json -w "%{http_code}" -X POST "$API" "${AUTH[@]}" -d @"$PAYLOAD_FILE")
  [ "$HTTP" = "201" ] || { echo "❌ CREATE-ব্যর্থ HTTP-$HTTP"; exit 1; }
  GID=$(python3 -c "import json;print(json.load(open('/tmp/vault-create.json'))['id'])")
  echo "$GID" > "$GIST_ID_FILE"
  chmod 644 "$GIST_ID_FILE"
  echo "✅ ভল্ট-তৈরি (gist $GID) — আইডি .vault-gist-id-এ সেভ"
fi
rm -f /tmp/vault-patch.json /tmp/vault-create.json
