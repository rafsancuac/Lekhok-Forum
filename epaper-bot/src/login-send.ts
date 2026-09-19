/**
 * login-send.ts — ধাপ-১: টেলিগ্রামে OTP-কোড-অনুরোধ পাঠায়
 * ফলাফল: .tg-auth-state.json-এ phoneCodeHash + authKey সেশন সংরক্ষণ
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'
import path from 'path'

// .env লোড (প্রসেস-env-কে ওভাররাইড করে না)
const envPath = path.join(import.meta.dir, '..', '.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_]+)\s*=\s*(.*)\s*$/)
  if (m && m[1] && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
}

const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const TG_PHONE = process.env.TG_PHONE || ''
const STATE_FILE = path.join(import.meta.dir, '..', '.tg-auth-state.json')

if (!TG_API_ID || !TG_API_HASH || !TG_PHONE) {
  console.error('❌ .env-এ TG_API_ID, TG_API_HASH, TG_PHONE দিন')
  process.exit(1)
}

const client = new TelegramClient(new StringSession(''), TG_API_ID, TG_API_HASH, {
  connectionRetries: 5,
})

await client.connect()
const { phoneCodeHash, isCodeViaApp } = await client.sendCode(
  { apiId: TG_API_ID, apiHash: TG_API_HASH },
  TG_PHONE
)

fs.writeFileSync(
  STATE_FILE,
  JSON.stringify(
    { session: client.session.save(), phoneCodeHash, phone: TG_PHONE, sentAt: new Date().toISOString() },
    null,
    2
  )
)

console.log('✅ OTP-অনুরোধ পাঠানো হয়েছে')
console.log('   ফোন:', TG_PHONE)
console.log('   কোড আসবে:', isCodeViaApp ? 'টেলিগ্রাম-অ্যাপে' : 'SMS-এ')
console.log('   phoneCodeHash সংরক্ষিত:', STATE_FILE)
process.exit(0)
