/**
 * login-verify.ts — ধাপ-২: ইউজারের দেওয়া OTP দিয়ে সাইন-ইন
 * চালান: TG_OTP=12345 bun run src/login-verify.ts
 * ২FA থাকলে: TG_OTP=... TG_2FA=পাসওয়ার্ড দিয়ে আবার চালান
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { Api } from 'telegram'
import { computeCheck } from 'telegram/Password'
import fs from 'fs'
import path from 'path'

const envPath = path.join(import.meta.dir, '..', '.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_]+)\s*=\s*(.*)\s*$/)
  if (m && m[1] && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
}

const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const OTP = (process.env.TG_OTP || '').replace(/\D/g, '')
const TWO_FA = process.env.TG_2FA || ''
const STATE_FILE = path.join(import.meta.dir, '..', '.tg-auth-state.json')
const SESSION_FILE = path.join(import.meta.dir, '..', '.tg-session')

if (!TG_API_ID || !TG_API_HASH || !OTP || !fs.existsSync(STATE_FILE)) {
  console.error('❌ TG_OTP দিন এবং আগে login-send চালান (state-ফাইল নেই)')
  process.exit(1)
}

const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
const client = new TelegramClient(new StringSession(state.session), TG_API_ID, TG_API_HASH, {
  connectionRetries: 5,
})
await client.connect()

try {
  await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: state.phone,
      phoneCodeHash: state.phoneCodeHash,
      phoneCode: OTP,
    })
  )
} catch (e: unknown) {
  const err = e as { errorMessage?: string; message?: string }
  const msg = err?.errorMessage || err?.message || String(e)
  if (msg.includes('SESSION_PASSWORD_NEEDED')) {
    if (!TWO_FA) {
      console.error('🔐 এই-অ্যাকাউন্টে ২-ধাপ-যাচাই চালু — TG_2FA=<পাসওয়ার্ড> দিয়ে আবার চালান')
      process.exit(2)
    }
    const pwdInfo = await client.invoke(new Api.account.GetPassword())
    const pwd = await computeCheck(pwdInfo, TWO_FA)
    await client.invoke(new Api.auth.CheckPassword({ password: pwd }))
  } else {
    console.error('❌ সাইন-ইন-ব্যর্থ:', msg)
    process.exit(1)
  }
}

const s = client.session.save() as unknown as string
fs.writeFileSync(SESSION_FILE, s)
const envFile = path.join(import.meta.dir, '..', '.env')
fs.writeFileSync(
  envFile,
  fs.readFileSync(envFile, 'utf8').replace(/^TG_SESSION=.*$/m, `TG_SESSION=${s}`)
)
console.log('✅ লগইন-সফল — সেশন সেভ হয়েছে:', SESSION_FILE)
process.exit(0)
