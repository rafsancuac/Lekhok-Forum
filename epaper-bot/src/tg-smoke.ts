/**
 * tg-smoke.ts — সেভ-করা সেশনের কার্যকারিতা-যাচাই: getMe + @ePaperXpress চ্যানেল-অ্যাক্সেস
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'
import path from 'path'

const envPath = path.join(import.meta.dir, '..', '.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_]+)\s*=\s*(.*)\s*$/)
  if (m && m[1] && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
}

const sessionStr =
  process.env.TG_SESSION || fs.readFileSync(path.join(import.meta.dir, '..', '.tg-session'), 'utf8').trim()

const client = new TelegramClient(
  new StringSession(sessionStr),
  parseInt(process.env.TG_API_ID || '', 10),
  process.env.TG_API_HASH || '',
  { connectionRetries: 3 }
)
await client.connect()

const me = await client.getMe() as any
console.log('👤 অ্যাকাউন্ট:', me.username ? '@' + me.username : me.firstName, '| ফোন:', me.phone)

try {
  const ch = await client.getEntity(process.env.EPAPER_CHANNEL || 'ePaperXpress') as any
  console.log('📺 চ্যানেল:', ch.className, '-', ch.title || ch.username || ch.id)
  const msgs = await client.getMessages(ch, { limit: 3 })
  console.log('🧾 সাম্প্রতিক', msgs.length, 'টি-মেসেজ:')
  for (const m of msgs) {
    const kind = m.document ? 'DOC(' + (m.document as any).mimeType?.split('/')[1] + ')' : m.text ? 'TEXT' : 'OTHER'
    console.log('   -', m.id, kind, (m.text || '').slice(0, 50).replace(/\n/g, ' '))
  }
} catch (e) {
  console.log('⚠️ চ্যানেল-যাচাই:', (e as Error).message?.slice(0, 200))
  console.log('   (সেশন নিজে বৈধ — getMe সফল; চ্যানেল-অ্যাক্সেসের জন্য অ্যাকাউন্টকে @ePaperXpress সার্চ/জয়েন করতে হতে পারে)')
}

process.exit(0)
