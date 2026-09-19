/**
 * login.ts — টেলিগ্রাম MTProto ইন্টার‌্যাক্টিভ লগইন
 * চালান: bun run login  →  টার্মিনালে OTP (টেলিগ্রাম-অ্যাপে আসা কোড) দিন
 * সফল হলে সেশন-স্ট্রিং .tg-session ফাইলে সেভ হবে (index.ts স্বয়ংক্রিয়ভাবে পড়ে)
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'
import fs from 'fs'
import path from 'path'

const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const TG_PHONE = process.env.TG_PHONE || ''

if (!TG_API_ID || !TG_API_HASH || !TG_PHONE) {
  console.error('❌ .env-এ TG_API_ID, TG_API_HASH, TG_PHONE দিন (my.telegram.org → API development tools)')
  process.exit(1)
}

const client = new TelegramClient(new StringSession(''), TG_API_ID, TG_API_HASH, { connectionRetries: 5 })
await client.start({
  phoneNumber: async () => TG_PHONE,
  password: async () => await input.password('২-ধাপ-পাসওয়ার্ড থাকলে দিন: '),
  phoneCode: async () => await input.text('টেলিগ্রামে আসা OTP কোড: '),
  onError: (e) => console.error('লগইন-ত্রুটি:', e),
})

const s = client.session.save() as unknown as string
const f = path.join(import.meta.dir, '..', '.tg-session')
fs.writeFileSync(f, s)
console.log('\n✅ লগইন সফল — সেশন সেভ হয়েছে:', f)
console.log('এখন `bun start` দিয়ে বট চালাতে পারেন।')
process.exit(0)
