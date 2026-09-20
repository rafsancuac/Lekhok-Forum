#!/usr/bin/env bash
# bot-keeper.sh — ২৪/৭-সুপারভিশন-হেলথচেক (session184)
# ① প্রসেস-মৃত → ensure-bot.sh  ② হার্টবিট-স্তব্ধ (>৪৫ মি) → kill+restart
# ③ সাইট-সতেজতা → আজকের (ঢাকা) পেপার /api/epaper/papers-এ আছে কি না
# exit 0=সুস্থ/মেরামত-হয়েছে · 2=.env-সমস্যা · 3=সাইটে-আজকের-পেপার-নেই
set -u
ROOT="${EPAPER_ROOT:-/home/z/lekhok-forum}"
BOT="$ROOT/epaper-bot"
HB="$BOT/.bot-heartbeat"
LOG="$BOT/bot.log"
say(){ echo "[bot-keeper] $*"; }

# সেশন ৫৫+ (২০২৬-০৯-২১): রিপো-প্রাইভেট — ensure-bot-এর ফ্রেশ-ক্লোন-যাতে-
# ভাঙা-না-লাগে, GITHUB_TOKEN-না-থাকলে বিদ্যমান-ক্লোনের origin-URL-থেকে
# টোকেন-বের-করে env-এ-দেওয়া হয় (কেবল-রানটাইম-env, কোনো-ফাইলে-নয়)।
if [ -z "${GITHUB_TOKEN:-}" ] && [ -d "$ROOT/.git" ]; then
  _ORIGIN_URL="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
  case "$_ORIGIN_URL" in
    https://ghp_*@github.com/*|https://github_pat_*@github.com/*)
      _T="${_ORIGIN_URL#https://}"; export GITHUB_TOKEN="${_T%%@github.com/*}" ;;
  esac
  unset _ORIGIN_URL _T
fi

# ① প্রসেস
if ! pgrep -f "bun run src/index.ts" >/dev/null 2>&1; then
  say "⚠️ বট-প্রসেস-মৃত — পুনঃস্টার্ট-চেষ্টা…"
  bash "$BOT/ensure-bot.sh" || exit $?
else
  # ② হার্টবিট (ঝুলন্ত-প্রসেস-ধরা)
  if [ -f "$HB" ]; then
    HB_AGE=$(( $(date +%s) - $(date -d "$(cat "$HB")" +%s 2>/dev/null || echo 0) ))
    if [ "$HB_AGE" -gt 2700 ]; then
      say "⚠️ হার্টবিট ${HB_AGE}s-পুরোনো (স্তব্ধ) — kill+restart"
      pkill -f "bun run src/index.ts" 2>/dev/null; sleep 2
      bash "$BOT/ensure-bot.sh" || exit $?
    else
      say "✓ হার্টবিট ${HB_AGE}s — সুস্থ"
    fi
  else
    say "• হার্টবিট-ফাইল-নেই (বট-এখনো-প্রথম-বিট-দেয়নি)"
  fi
fi

# ③ সাইট-সতেজতা (ঢাকা-তারিখ)
TODAY=$(TZ=Asia/Dhaka date +%F)
if curl -sf --max-time 25 "https://lekhok-forum.vercel.app/api/epaper/papers" -o /tmp/ep-papers.json 2>/dev/null; then
  if grep -q "\"date\":\"$TODAY\"" /tmp/ep-papers.json 2>/dev/null; then
    say "✅ সাইটে আজকের ($TODAY) পেপার-উপস্থিত"
  else
    LATEST=$(grep -oE '"date":"[0-9-]+"' /tmp/ep-papers.json | head -1 | cut -d'"' -f4)
    say "⏳ সাইটে আজকের ($TODAY) পেপার-নেই (সর্বশেষ: $LATEST) — বট-পোল-বা-চ্যানেল-পোস্ট-প্রতীক্ষিত"
    exit 3
  fi
else
  say "⚠️ সাইট-API-প্রোব-ব্যর্থ (নেটওয়ার্ক?)"
fi
exit 0
