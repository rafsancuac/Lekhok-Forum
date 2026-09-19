/**
 * getRefreshToken.ts — গুগল-ড্রাইভ OAuth কনসেন্ট → রিফ্রেশ-টোকেন (নির্ভরতা-শূন্য, বেয়ার fetch)
 *
 * চালান:  bun run token
 * ১) কনসেন্ট-URL প্রিন্ট করবে — ব্রাউজারে খুলে নিজের অ্যাকাউন্ট দিয়ে অনুমতি দিন
 * ২) redirect URI 'http://localhost:4288' থাকলে কোড স্বয়ংক্রিয়ভাবে ধরা পড়বে;
 *    নইলে অ্যাড্রেস-বারের `code=...` অংশ টার্মিনালে পেস্ট করুন
 * ৩) রিফ্রেশ-টোকেন প্রিন্ট হবে — .env-এর GOOGLE_REFRESH_TOKEN-এ বসান
 *
 * নোট: Google-Cloud-কনসোল → APIs & Services → Credentials → এই OAuth-ক্লায়েন্টে
 *   Authorized redirect URI: http://localhost:4288
 * যোগ করা থাকতে হবে। Drive-স্কোপ শুধু drive.file (শুধু বট-তৈরি ফাইল দেখে — সর্বনিম্ন-অনুমতি)।
 */
import http from 'http'
import { URL } from 'url'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REDIRECT = 'http://localhost:4288'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET .env-এ দিন')
  process.exit(1)
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
      resolve(String(d).trim().split('&')[0].replace(/^code=/, ''))
    })
  }, 90000)
})

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
const tokens = (await tokenRes.json()) as { refresh_token?: string; access_token?: string; error_description?: string }

if (!tokens.refresh_token) {
  console.error('\n❌ রিফ্রেশ-টোকেন পাওয়া যায়নি:', tokens.error_description || JSON.stringify(tokens).slice(0, 200))
  console.error('   prompt=consent সহ নতুন-করে অনুমতি দিন; Access type-এ অফলাইন অবশ্যক।')
  process.exit(1)
}
console.log('\n✅ রিফ্রেশ-টোকেন (এটি .env-এর GOOGLE_REFRESH_TOKEN-এ বসান):\n')
console.log(tokens.refresh_token + '\n')
