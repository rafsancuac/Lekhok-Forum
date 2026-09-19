/**
 * test-drive.ts — গুগল-ড্রাইভ কনফিগ-যাচাই: রিফ্রেশ-টোকেন → ছোট টেস্ট-ফাইল আপলোড → পাবলিক-লিংক
 * চালান: bun run test-drive   (.env-এ GOOGLE_REFRESH_TOKEN থাকতে হবে)
 */
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('❌ .env-এ GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN পূরণ করুন')
  process.exit(1)
}

const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token',
  }),
}).then((r) => r.json() as Promise<{ access_token?: string; error_description?: string }>)

if (!tok.access_token) {
  console.error('❌ টোকেন-রিফ্রেশ ব্যর্থ:', tok.error_description || tok)
  process.exit(1)
}
console.log('✅ অ্যাক্সেস-টোকেন পাওয়া গেছে')

const meta = { name: `lf-epaper-test-${Date.now()}.txt` }
const boundary = 'lftest' + Date.now()
const body =
  `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
  `--${boundary}\r\nContent-Type: text/plain\r\n\r\nলেখক ফোরাম ই-পেপার বট — ড্রাইভ-কনফিগ ঠিক আছে ✅\r\n--${boundary}--`
const up = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
  method: 'POST',
  headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
  body,
}).then((r) => r.json() as Promise<{ id?: string; error?: { message: string } }>)

if (!up.id) {
  console.error('❌ আপলোড ব্যর্থ:', up.error?.message || JSON.stringify(up).slice(0, 200))
  process.exit(1)
}
await fetch(`https://www.googleapis.com/drive/v3/files/${up.id}/permissions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'reader', type: 'anyone' }),
})
console.log('✅ আপলোড+পাবলিক-পারমিশন সফল → https://drive.google.com/file/d/' + up.id + '/view')
process.exit(0)
export {}
