#!/usr/bin/env bash
# restore-env-from-gist.sh — ভল্ট-গিস্ট → epaper-bot/.env
# (session184-মূল, session198-প্যাচ: split-encoded-পুনর্গঠন + অ্যাননিমাস-ফলব্যাক)
#
# session198-প্যাচ:
#   ① save-env-to-gist.sh-এর split-encoded KEY_P1/KEY_P2 → স্বয়ংক্রিয়-পুনর্গঠন KEY=value
#   ② GITHUB_TOKEN-মৃত/অনুপস্থিত হলে **অ্যাননিমাস-raw-URL-ফলব্যাক** — সিক্রেট-গিস্টের
#      raw-লিংক টোকেন-ছাড়াই-পড়া-যায় → টোকেন-মরা-অবস্থাতেও-সেলফ-হিলিং
#   ③ টেস্ট/অফলাইন-মোড: bash restore-env-from-gist.sh [লোকাল-ভল্ট-ফাইল] [আউটপুট-পাথ]
set -eu
BOT="$(cd "$(dirname "$0")" && pwd)"
GIST_ID_FILE="$BOT/.vault-gist-id"
SRC="${1:-}"
OUT="${2:-$BOT/.env}"
[ -f "$GIST_ID_FILE" ] || { echo "❌ .vault-gist-id-নেই (আগে কখনো সেভ-হয়নি)"; exit 1; }
GID=$(cat "$GIST_ID_FILE")

CONTENT_FILE=""
if [ -n "$SRC" ]; then
  [ -f "$SRC" ] || { echo "❌ লোকাল-ফাইল-নেই: $SRC"; exit 1; }
  CONTENT_FILE="$SRC"
  echo "লোকাল-ফাইল-থেকে: $SRC"
else
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    HTTP=$(curl -s -o /tmp/vault-get.json -w "%{http_code}" --max-time 30 \
      -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/gists/$GID" || echo 000)
    if [ "$HTTP" = "200" ]; then
      CONTENT_FILE="/tmp/vault-get.json"
    else
      echo "⚠️ অথ-GET-ব্যর্থ (HTTP-$HTTP) — অ্যাননিমাস-raw-ফলব্যাক…" >&2
    fi
  fi
  if [ -z "$CONTENT_FILE" ]; then
    HTTP=$(curl -sL -o /tmp/vault-raw.txt -w "%{http_code}" --max-time 30 \
      "https://gist.githubusercontent.com/rafsancuac/$GID/raw" || echo 000)
    [ "$HTTP" = "200" ] || { echo "❌ অ্যাননিমাস-raw-ও-ব্যর্থ (HTTP-$HTTP)"; exit 1; }
    CONTENT_FILE="/tmp/vault-raw.txt"
  fi
fi

# পুনর্গঠন: KEY_P1/KEY_P2 → KEY=value (অবস্থান-সংরক্ষণ); অন্য-লাইন-অপরিবর্তিত
python3 - "$CONTENT_FILE" "$OUT" <<'PY'
import base64, json, re, sys
raw = open(sys.argv[1], encoding='utf-8').read()
if raw.lstrip().startswith('{'):
    # অথ-API-পাথ JSON-রিসপন্স-দেয় — ভেতরের-ফাইল-কনটেন্ট-বের-করে-নিতে-হয়
    d = json.loads(raw)
    raw = d["files"]["epaper-bot.env"]["content"]
lines = raw.splitlines()
p2 = {}
for line in lines:
    m = re.match(r'^(\S+)_P2=(.*)$', line)
    if m:
        p2[m.group(1)] = m.group(2)
out, restored = [], 0
for line in lines:
    if line.startswith(('✅', '⚠️', '❌', '🚨')):
        continue  # status-মেসেজ-মিশ্রিত-ইনপুট-হলে-ও-নিরাপদ
    m1 = re.match(r'^(\S+)_P1=(.*)$', line)
    if m1 and m1.group(1) in p2:
        k = m1.group(1)
        out.append(f"{k}={base64.b64decode(m1.group(2) + p2[k]).decode()}")
        restored += 1
    elif re.match(r'^\S+_P2=', line):
        continue
    else:
        out.append(line)
orphans = set(p2) - {m1.group(1) for m1 in
                     (re.match(r'^(\S+)_P1=(.*)$', l) for l in lines) if m1}
if orphans:
    print(f"⚠️ P1-ছাড়া-P2-অনাথ: {sorted(orphans)}", file=sys.stderr)
open(sys.argv[2], 'w', encoding='utf-8').write("\n".join(out) + "\n")
print(f"✅ {restored}-টি-সিক্রেট-পুনর্গঠিত (split→raw), মোট-লাইন {len(out)}")
PY
chmod 600 "$OUT"
rm -f /tmp/vault-get.json /tmp/vault-raw.txt
echo "✅ .env পুনরুদ্ধার → $OUT (gist $GID)"
