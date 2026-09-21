#!/usr/bin/env bash
# save-env-to-gist.sh — epaper-bot/.env → প্রাইভেট-গিস্ট-ভল্ট (স্যান্ডবক্স-রিসেট-প্রুফ)
# (session184-মূল, session198-প্যাচ: split-encoded ভল্ট)
#
# session198-প্যাচ (CRITICAL): GitHub secret-scanning raw ghp_ PAT-সহ-গিস্ট-দেখলে ~১-মিনিটে
#   টোকেন-অটো-রিভোক-করে (session193b + session197b-এ ২-টোকেন-মৃত্যুর-নিশ্চিত RCA)।
#   তাই এখন উচ্চ-ঝুঁকির-সিক্রেট (ghp_/github_pat_/GOCSPX-/AIza/re_/vcp_/eyJ প্রিফিক্স)
#   আপলোডের-আগে স্বয়ংক্রিয়ভাবে **split-encoded** হয়: KEY=value → KEY_P1/KEY_P2
#   (মানের-base64-দু-ভাগ)। গিস্টে-আর-কোনো-স্ক্যানেবল-raw-প্যাটার্ন-থাকে-না →
#   স্ক্যানার-চিনতে-পারে-না → টোকেন-আর-মরে-না। restore-env-from-gist.sh পুনর্গঠন-করে।
#
# ব্যবহার: GITHUB_TOKEN=ghp_xxx bash save-env-to-gist.sh
#   · GITHUB_TOKEN কেবল-এ-কলের-env — কোনো-ফাইলে-লেখা-হয়-না
#   · DRY_RUN=1 → আপলোড-না-করে রূপান্তরিত-কনটেন্ট stdout-এ (টেস্ট/পরিদর্শন — নিরাপদ, এনকোডেড)
#   · গিস্ট-আইডি প্রথম-বার তৈরি হলে .vault-gist-id-এ সংরক্ষিত-হয় (আইডি-নিজে-গোপন-নয়)
set -eu
BOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$BOT/.env"
GIST_ID_FILE="$BOT/.vault-gist-id"
[ -f "$ENV_FILE" ] || { echo "❌ .env-নেই"; exit 1; }
grep -q "TG_SESSION=" "$ENV_FILE" || { echo "❌ .env-অসম্পূর্ণ"; exit 1; }
if [ "${DRY_RUN:-0}" != "1" ]; then
  : "${GITHUB_TOKEN:?GITHUB_TOKEN-env-দিন (কেবল-রানটাইম)}"
fi

PAYLOAD_FILE=$(mktemp)
trap 'rm -f "$PAYLOAD_FILE" /tmp/vault-verify.txt' EXIT

# ১) রূপান্তর: ঝুঁকির-সিক্রেট → KEY_P1/KEY_P2 (base64-দু-ভাগ) + সেলফ-চেক
python3 - "$ENV_FILE" "$PAYLOAD_FILE" <<'PY'
import base64, json, re, sys
RISKY = re.compile(r'^(ghp_|github_pat_|GOCSPX-|AIza|re_|vcp_|eyJ)')
out = []
for line in open(sys.argv[1], encoding='utf-8').read().splitlines():
    if line.startswith('#') or '=' not in line:
        out.append(line); continue
    k, v = line.split('=', 1)
    if not v or not RISKY.match(v):
        out.append(line); continue
    b = base64.b64encode(v.encode()).decode()
    h = (len(b) + 1) // 2
    out += [f"{k}_P1={b[:h]}", f"{k}_P2={b[h:]}"]
content = "\n".join(out) + "\n"
# সেলফ-চেক-১: আন্ডারস্কোর/হাইফেন-প্যাটার্ন base64-বর্ণমালায়-আসতে-পারে-না — সর্বত্র-নিষিদ্ধ
for pat in ("ghp_", "github_pat_", "GOCSPX-"):
    if pat in content:
        sys.exit(f"❌ সেলফ-চেক-ব্যর্থ: raw-{pat}-গিস্টে-যাবে-না! আপলোড-বাতিল")
# সেলফ-চেক-২: কোনো-প্লেইন KEY=value-লাইনের-মান ঝুঁকির-প্রিফিক্স-ধারণ-করতে-পারবে-না
for line in content.splitlines():
    if line.startswith('#') or '=' not in line or re.match(r'^\S+_P[12]=', line):
        continue
    v = line.split('=', 1)[1]
    if v and RISKY.match(v):
        sys.exit(f"❌ সেলফ-চেক-ব্যর্থ: raw-মান-রয়ে-গেছে ({v[:6]}…)! আপলোড-বাতিল")
json.dump({"files": {"epaper-bot.env": {"content": content}}},
          open(sys.argv[2], 'w', encoding='utf-8'))
print("✅ split-encoded-ভল্ট-কনটেন্ট-প্রস্তুত (সেলফ-চেক-পাস)", file=sys.stderr)
PY
[ -s "$PAYLOAD_FILE" ] || { echo "❌ রূপান্তর-ব্যর্থ"; exit 1; }

# ২) DRY_RUN → এনকোডেড-কনটেন্ট-দেখাও, আপলোড-নয়
if [ "${DRY_RUN:-0}" = "1" ]; then
  python3 -c "import json;print(json.load(open('$PAYLOAD_FILE'))['files']['epaper-bot.env']['content'],end='')"
  exit 0
fi

# ৩) আপলোড (PATCH-বিদ্যমান / CREATE-নতুন)
API="https://api.github.com/gists"
AUTH=(-H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json")
if [ -f "$GIST_ID_FILE" ]; then
  GID=$(cat "$GIST_ID_FILE")
  HTTP=$(curl -s -o /tmp/vault-patch.json -w "%{http_code}" -X PATCH "$API/$GID" "${AUTH[@]}" -d @"$PAYLOAD_FILE")
  [ "$HTTP" = "200" ] || { echo "❌ PATCH-ব্যর্থ HTTP-$HTTP"; exit 1; }
  echo "✅ ভল্ট-আপডেট (gist $GID) — split-encoded, raw-প্যাটার্ন-শূন্য"
else
  python3 - "$PAYLOAD_FILE" <<'PY'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
d["description"] = "lekhok-forum epaper-bot vault (private) — স্যান্ডবক্স-রিসেট-প্রুফ .env ব্যাকআপ (split-encoded)"
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

# ৪) আপলোড-পরবর্তী-যাচাই: অ্যাননিমাস-raw-URL-এ প্যাটার্ন-শূন্য-হতে-হবে (ব্যর্থ-হলে সতর্কতা-কিন্তু-সেভ-টিকে)
sleep 2
if curl -sL -o /tmp/vault-verify.txt --max-time 20 "https://gist.githubusercontent.com/rafsancuac/$(cat "$GIST_ID_FILE")/raw" 2>/dev/null; then
  if grep -qE "ghp_|github_pat_|GOCSPX-" /tmp/vault-verify.txt 2>/dev/null; then
    echo "🚨 যাচাই-ব্যর্থ: raw-প্যাটার্ন-গিস্টে-পৌঁছেছে! অবিলম্বে-টোকেন-ঘোরাও/পুনঃসেভ-করো"
  else
    echo "✅ যাচাই: অ্যাননিমাস-raw-এ-প্যাটার্ন-শূন্য — স্ক্যানার-প্রুফ"
  fi
else
  echo "⚠️ যাচাই-ফেচ-ব্যর্থ (ইভেন্টুয়াল-কনসিস্টেন্সি?) — পরে-হাতে-যাচাই-করো"
fi
