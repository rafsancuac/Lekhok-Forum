/**
 * getRefreshToken.ts — গুগল-ড্রাইভ OAuth কনসেন্ট → রিফ্রেশ-টোকেন (নির্ভরতা-শূন্য, বেয়ার fetch)
 *
 * চালান:  bun run token                ← ইন্টারঅ্যাক্টিভ (কনসেন্ট-URL প্রিন্ট + localhost:4288-লিসেন/পেস্ট)
 *        bun run token "<URL>"        ← ব্রাউজারে Allow-এর পর অ্যাড্রেস-বারের পুরো localhost-URL আর্গুমেন্ট হিসেবে দিন
 *        bun run token "<code>"       ← শুধু code-মানও চলবে
 *
 * ③ রিফ্রেশ-টোকেন স্বয়ংক্রিয়ভাবে .env-এর GOOGLE_REFRESH_TOKEN-এ বসে যাবে (এবং প্রিন্ট হবে)
 *
 * নোট: Desktop-টাইপ OAuth-ক্লায়েন্টে loopback-redirect (http://localhost:PORT) রেজিস্ট্রেশন-ছাড়াই চলে।
 * Drive-স্কোপ শুধু drive.file (শুধু বট-তৈরি ফাইল দেখে — সর্বনিম্ন-অনুমতি)।
 */
import http from 'http'
import { URL } from 'url'
import fs from 'fs'
import path from 'path'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REDIRECT = 'http://localhost:4288'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET .env-এ দিন')
  process.exit(1)
}

const arg = process.argv[2] || ''

function extractCode(raw: string): string {
  let s = raw.trim()
  if (s.includes('code=')) {
    try {
      const u = new URL(s)
      return u.searchParams.get('code') || ''
    } catch {
      const m = s.match(/[?&]code=([^&\s]+)/)
      if (m) return decodeURIComponent(m[1])
    }
  }
  return s.replace(/^code=/, '')
}

function saveToEnv(refreshToken: string): void {
  const envPath = path.join(import.meta.dir, '..', '.env')
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  const line = `GOOGLE_REFRESH_TOKEN=${refreshToken}`
  if (/^GOOGLE_REFRESH_TOKEN=.*$/m.test(content)) {
    content = content.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, line)
  } else {
    content = content.replace(/\n*$/, '\n') + line + '\n'
  }
  fs.writeFileSync(envPath, content)
  console.log('💾 .env-এর GOOGLE_REFRESH_TOKEN আপডেট হয়েছে')
}

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  })

async function exchange(code: string): Promise<void> {
  console.log('⏳ কোড এক্সচেঞ্জ হচ্ছে…')
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT,
    }),
  })
  const tokens = (await tokenRes.json()) as {
    refresh_token?: string
    access_token?: string
    error_description?: string
    error?: string
  }

  if (!tokens.refresh_token) {
    console.error('\n❌ রিফ্রেশ-টোকেন পাওয়া যায়নি:', tokens.error_description || tokens.error || JSON.stringify(tokens).slice(0, 200))
    if (tokens.error === 'invalid_grant') {
      console.error('   কোড একবারই কাজ করে / মেয়াদ-শেষ — নতুন কনসেন্ট-URL খুলে আবার চেষ্টা করুন (prompt=consent অবশ্যই)।')
    }
    process.exit(1)
  }
  console.log('\n✅ রিফ্রেশ-টোকেন পাওয়া গেছে:')
  console.log(tokens.refresh_token.slice(0, 12) + '…(গোপন)\n')
  saveToEnv(tokens.refresh_token)
  console.log('\nএখন চালান: bun start  (বা test-drive: bun run test-drive)')
}

// ── মোড-১: আর্গুমেন্টে URL/code দেওয়া ──
if (arg) {
  const code = extractCode(arg)
  if (!code) {
    console.error('❌ আর্গুমেন্ট থেকে code পাওয়া যায়নি — পুরো localhost-URL বা code-মান দিন')
    process.exit(1)
  }
  await exchange(code)
  process.exit(0)
}

// ── মোড-২: ইন্টারঅ্যাক্টিভ ──
console.log('\n① ব্রাউজারে এই URL খুলুন এবং অনুমতি দিন:\n')
console.log(authUrl + '\n')

const code = await new Promise<string>((resolve) => {
  let settled = false
  const srv = http.createServer((req, res) => {
    try {
      const u = new URL(req.url!, REDIRECT)
      const c = u.searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<meta charset="utf-8"><h2>✅ কোড পাওয়া গেছে — এই ট্যাব বন্ধ করতে পারেন</h2>')
      if (c && !settled) { settled = true; srv.close(); resolve(c) }
    } catch { /* ignore */ }
  })
  srv.listen(4288, () => console.log('② localhost:4288-এ কোডের অপেক্ষায়… (৯০ সেকেন্ড)'))
  setTimeout(() => {
    if (settled) return
    process.stdout.write('③ অ্যাড্রেস-বারের code= মানটি এখানে পেস্ট করুন: ')
    process.stdin.once('data', (d) => {
      if (settled) return
      settled = true
      srv.close()
      resolve(extractCode(String(d)))
    })
  }, 90000)
})

await exchange(code)
