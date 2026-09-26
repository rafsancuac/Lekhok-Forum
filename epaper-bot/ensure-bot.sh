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
# সেশন ৫৫+ (২০২৬-০৯-২১): রিপো-এখন-প্রাইভেট — GITHUB_TOKEN (কেবল-env) থাকলে
# টোকেন-সহ-ক্লোন-URL; না-থাকলে খালি-URL (পুরনো-পাবলিক-আচরণ)। টোকেন-কোনো-
# ফাইলে-লেখা-হয়-না (ক্লোন-পরবর্তী .git/config-ছাড়া-কোথাও-নয় — gitignored-এলাকা)।
if [ -n "${GITHUB_TOKEN:-}" ]; then
  REPO_URL="https://${GITHUB_TOKEN}@github.com/rafsancuac/Lekhok-Forum.git"
fi
say(){ echo "[ensure-bot] $*"; }

# ০) সমান্তরাল-ইনভোকেশন-রোধ (session321): কিপার-ক্রন + ম্যানুয়াল-রান-ওভারল্যাপে
#    দুই-স্টার্ট-রেস → একই-TG-সেশন-দুই-সংযোগ → AUTH_KEY_DUPLICATED। flock-এ-ধারাবাহিক।
exec 9>/tmp/epaper-ensure.lock
if ! flock -n 9; then say "⏳ অন্য-ensure-bot-চলছে — স্কিপ (রেস-প্রতিষেধক)"; exit 0; fi

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

# ৪) প্রসেস — pgrep-প্যাটার্ন এখন ব্রড ("src/index.ts") যাতে pm2-চালিত প্রসেসও-ধরা-পড়ে (session273)
BOT_PAT="src/index\.ts"
if pgrep -f "$BOT_PAT" >/dev/null 2>&1; then
  say "✓ বট-ইতোমধ্যে-চলছে (pid: $(pgrep -f "$BOT_PAT" | head -1))"
  exit 0
fi
# pm2 থাকলে pm2-ই-প্রধান (ক্র্যাশ → ৫-সেকেন্ডে-অটো-রিস্টার্ট); ব্যর্থ-হলে setsid-ফলব্যাক
# 9>&-: pm2-ডেমন-সন্তান flock-fd-৯-উত্তরাধিকার-পাবে-না (session321 — নইলে-বট-জীবিত-থাকা-পর্যন্ত-সব-ensure-bot-স্কিপ-হতে-থাকবে)
if command -v pm2 >/dev/null 2>&1; then
  say "▶️ বট-স্টার্ট (pm2 — ক্র্যাশ-অটো-রিস্টার্ট)…"
  ( cd "$BOT" && pm2 start ecosystem.config.cjs --update-env 9>&- >/dev/null 2>&1 && pm2 save 9>&- >/dev/null 2>&1 ) \
    || say "⚠️ pm2-স্টার্ট-ব্যর্থ — setsid-ফলব্যাক-ব্যবহার-হবে"
fi
if ! pgrep -f "$BOT_PAT" >/dev/null 2>&1; then
  say "▶️ বট-স্টার্ট (setsid-ডিটাচড)…"
  # session321-বুলেটপ্রুফ-ডিটাচ: ব্যাকগ্রাউন্ড-সাবশেল + exec-setsid + fd-৯-বন্ধ + stdio-বিচ্ছিন্ন —
  # মূল-স্ক্রিপ্ট কখনো-সন্তানের-জন্য-অপেক্ষা-করবে-না (do_wait-ঝুলন্ত-বাগ-নির্মূল),
  # বট-সন্তান flock-fd/পাইপ-উত্তরাধিকার-পাবে-না (লক-চিরস্থায়ী-আটকে-যাওয়া-নির্মূল)।
  (
    cd "$BOT" || exit 1
    exec setsid nohup bun run src/index.ts 9>&- >> "$LOG" 2>&1 < /dev/null
  ) >/dev/null 2>&1 </dev/null &
  disown $! 2>/dev/null || true
fi
sleep 3
if pgrep -f "$BOT_PAT" >/dev/null 2>&1; then
  say "✅ বট-চালু (pid: $(pgrep -f "$BOT_PAT" | head -1))"
  exit 0
fi
say "❌ বট-স্টার্ট-ব্যর্থ — শেষ-লগ:"; tail -n 8 "$LOG" 2>/dev/null; exit 4
