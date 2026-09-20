#!/usr/bin/env bash
# ensure-bot.sh — ই-পেপার বটের আইডেম্পোটেন্ট বুটস্ট্র্যাপ+স্টার্টার (session184)
# স্যান্ডবক্স-রিসেটে যা-যা হারায় সব ঠিক করে বট চালু রাখে:
#   রিপো-নেই → ক্লোন · node_modules-নেই → bun install · .env-নেই → ভল্ট-গিস্ট-থেকে-রিস্টোর
#   বট-প্রসেস-নেই → setsid-দিয়ে-ডিটাচড-স্টার্ট
# ব্যবহার: bash ensure-bot.sh            (স্বয়ংক্রিয়-সব)
#          RESTORE=0 bash ensure-bot.sh  (ভল্ট-রিস্টোর-স্কিপ)
set -u
ROOT="${EPAPER_ROOT:-/home/z/lekhok-forum}"
BOT="$ROOT/epaper-bot"
LOG="$BOT/bot.log"
REPO_URL="https://github.com/rafsancuac/Lekhok-Forum.git"
say(){ echo "[ensure-bot] $*"; }

# ১) রিপো
if [ ! -d "$BOT" ]; then
  say "রিপো নেই — ক্লোন হচ্ছে…"
  git clone --depth 5 "$REPO_URL" "$ROOT" >/dev/null 2>&1 || { say "❌ ক্লোন-ব্যর্থ"; exit 1; }
fi

# ২) ডিপেন্ডেন্সি
if [ ! -d "$BOT/node_modules" ]; then
  say "node_modules নেই — bun install…"
  (cd "$BOT" && bun install >/dev/null 2>&1) || { say "❌ install-ব্যর্থ"; exit 1; }
fi

# ৩) .env — ভল্ট-গিস্ট-থেকে-রিস্টোর (স্যান্ডবক্স-রিসেটে-হারালে)
if [ ! -f "$BOT/.env" ] && [ "${RESTORE:-1}" = "1" ] && [ -f "$BOT/.vault-gist-id" ]; then
  say ".env নেই — ভল্ট-গিস্ট-থেকে রিস্টোর…"
  if GITHUB_TOKEN="${GITHUB_TOKEN:-}" bash "$BOT/restore-env-from-gist.sh" >/dev/null 2>&1; then
    say "✅ .env ভল্ট-থেকে-পুনরুদ্ধার"
  else
    say "⚠️ ভল্ট-রিস্টোর-ব্যর্থ (GITHUB_TOKEN দরকার) — পুনঃঅথ-লাগবে"
  fi
fi

if [ ! -f "$BOT/.env" ]; then
  say "❌ .env নেই — ইউজার-পুনঃঅথ-ছাড়া বট-চলবে-না (exit 2)"; exit 2
fi
# পূরণ-হয়নি ❌-প্লেসহোল্ডার আছে কি না
if grep -q "^TG_API_HASH=❌\|^GOOGLE_CLIENT_ID=❌\|^SITE_SYNC_TOKEN=❌" "$BOT/.env" 2>/dev/null; then
  say "⏳ .env-প্লেসহোল্ডার-পূরণ-বাকি (ইউজার-পুনঃঅথ-প্রতীক্ষিত) (exit 3)"; exit 3
fi

# ৪) প্রসেস
if pgrep -f "bun run src/index.ts" >/dev/null 2>&1; then
  say "✓ বট-ইতোমধ্যে-চলছে (pid: $(pgrep -f 'bun run src/index.ts' | head -1))"
  exit 0
fi
say "▶️ বট-স্টার্ট (setsid-ডিটাচড)…"
( cd "$BOT" && setsid nohup bun run src/index.ts >> "$LOG" 2>&1 & )
sleep 3
if pgrep -f "bun run src/index.ts" >/dev/null 2>&1; then
  say "✅ বট-চালু (pid: $(pgrep -f 'bun run src/index.ts' | head -1))"
  exit 0
fi
say "❌ বট-স্টার্ট-ব্যর্থ — শেষ-লগ:"; tail -n 8 "$LOG" 2>/dev/null; exit 4
