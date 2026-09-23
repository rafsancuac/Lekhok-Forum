// ecosystem.config.cjs — pm2-সুপারভিশন (session273 — ইউজার-স্পেক: "PM2 দিয়ে একবার রেজিস্টার")
// ক্র্যাশ → ৫-সেকেন্ডে-অটো-রিস্টার্ট · লগ → bot.log (আগের-মতোই) ·
// স্যান্ডবক্স-রিসেটে pm2-ডেমন-ও-মরলে cron-রাউন্ডের bot-keeper.sh → ensure-bot.sh আবার-চালু-করে।
const BUN = process.env.BUN_BIN || '/usr/local/bin/bun'
module.exports = {
  apps: [
    {
      name: 'epaper-bot',
      cwd: __dirname,
      script: BUN,
      args: 'run src/index.ts',
      interpreter: 'none', // বান-নিজেই-স্ক্রিপ্ট — নোড-ইন্টারপ্রেটার-লাগবে-না
      autorestart: true,
      max_restarts: 100,
      min_uptime: '30s',
      restart_delay: 5000,
      out_file: 'bot.log',
      error_file: 'bot.log',
      merge_logs: true,
      time: true,
      env: { NODE_ENV: 'production' },
    },
  ],
}
