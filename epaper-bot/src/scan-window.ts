/**
 * scan-window.ts — এক-বারীয় চ্যানেল-স্ক্যান (session321 — শুধু-পড়া; কিছু-সিঙ্ক/ডাউনলোড-করে-না)
 *
 * উদ্দেশ্য: নির্দিষ্ট-তারিখে (যেমন ২৪-সেপ্টেম্বর) চ্যানেলে আসলেই পিডিএফ-পোস্ট-হয়েছিল কি না —
 *           চূড়ান্ত-প্রমাণ। বটের পোল-লুপ-ব্যতীত স্বচ্ছ-রিপোর্ট।
 *
 * ⚠️ সতর্কতা: প্রধান-বট-চলাকালীন কখনো-চালাবেন-না — একই-TG-সেশন-দুই-সংযোগ =
 *            AUTH_KEY_DUPLICATED (সেশন-স্থায়ী-মৃত্যু)। আগে বট-বন্ধ, তারপর-চালান।
 *
 * চালান:  bun src/scan-window.ts [LIMIT]   (LIMIT ডিফল্ট 150)
 * .env থেকে: TG_API_ID/TG_API_HASH/TG_SESSION(বা .tg-session-ফাইল)/EPAPER_CHANNEL
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'
import path from 'path'

const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const TG_SESSION = process.env.TG_SESSION || ''
const CHANNEL = process.env.EPAPER_CHANNEL || 'ePaperXpress'
const LIMIT = parseInt(process.argv[2] || '150', 10) || 150
const SESS_FILE = path.join(import.meta.dir, '..', '.tg-session')

async function main(): Promise<void> {
  let sessionStr = TG_SESSION
  if (!sessionStr && fs.existsSync(SESS_FILE)) sessionStr = fs.readFileSync(SESS_FILE, 'utf8').trim()
  if (!sessionStr) { console.error('❌ টেলিগ্রাম-সেশন-নেই (.env-এ TG_SESSION বা .tg-session-ফাইল)'); process.exit(1) }
  // ── সেশন-দ্বন্দ্ব-হার্ড-গার্ড (session321-সম্পূরক): বট/অন্য-TG-প্রসেস-জীবিত-থাকলে-সংযোগ-নিষিদ্ধ ──
  // একই-TG-সেশন-দুই-সংযোগ = AUTH_KEY_DUPLICATED (auth-key স্থায়ী-বাতিল → আবার-ওটিপি-লাগে)।
  // আগে-ছিল কেবল-মন্তব্য-সতর্কতা; এখন .bot-lock-জীবিত-pid-দেখলেই প্রস্থান।
  const LOCK = path.join(import.meta.dir, '..', '.bot-lock')
  try {
    const prev = JSON.parse(fs.readFileSync(LOCK, 'utf8')) as { pid?: number }
    if (prev?.pid && prev.pid !== process.pid) {
      let alive = true
      try { process.kill(prev.pid, 0) } catch { alive = false }
      if (alive) { console.error(`🚨 বট-জীবিত (pid ${prev.pid}) — এ-স্ক্রিপ্ট-বাতিল (সেশন-দ্বন্দ্ব-প্রতিষেধক)। আগে বট-বন্ধ-করুন (kill ${prev.pid}), তারপর-আবার-চালান।`); process.exit(2) }
    }
  } catch { /* লক-নেই/করাপ্ট — নিরাপদ */ }
  try { fs.writeFileSync(LOCK, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }), { flag: 'wx' }) } catch { console.error('🚨 লক-দখল-ব্যর্থ — সমসাময়িক-অন্য-TG-প্রসেস-সন্দেহ'); process.exit(2) }
  process.on('exit', () => { try { const c = JSON.parse(fs.readFileSync(LOCK, 'utf8')) as { pid?: number }; if (c?.pid === process.pid) fs.unlinkSync(LOCK) } catch {} })
  const client = new TelegramClient(new StringSession(sessionStr), TG_API_ID, TG_API_HASH, { connectionRetries: 3 })
  await client.connect()
  try {
    const msgs = await client.getMessages(CHANNEL, { limit: LIMIT })
    const byDate = new Map<string, string[]>()
    let pdfCount = 0
    for (const m of msgs) {
      if (!m.document) continue
      const doc = m.document as any
      if (!/pdf$/.test(doc.mimeType || '')) continue
      pdfCount++
      const msgDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(m.date * 1000))
      const fName = ((doc.attributes || []) as any[]).find((a) => a.fileName)?.fileName || `id-${m.id}`
      if (!byDate.has(msgDate)) byDate.set(msgDate, [])
      byDate.get(msgDate)!.push(`   msg#${m.id}: ${fName}`)
    }
    console.log(`📊 চ্যানেল-স্ক্যান (@${CHANNEL}, শেষ-${LIMIT}-মেসেজ): PDF ×${pdfCount}`)
    for (const [d, files] of [...byDate.entries()].sort()) {
      console.log(`📅 ${d} — ×${files.length}`)
      for (const f of files) console.log(f)
    }
    if (!byDate.size) console.log('(কোনো PDF-নেই)')
  } finally {
    try { await client.destroy() } catch {}
    try { const c = JSON.parse(fs.readFileSync(LOCK, 'utf8')) as { pid?: number }; if (c?.pid === process.pid) fs.unlinkSync(LOCK) } catch {}
  }
  process.exit(0)
}
main().catch((e) => { console.error('ফেটাল:', e instanceof Error ? e.message : e); process.exit(1) })
