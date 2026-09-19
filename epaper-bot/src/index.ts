/**
 * index.ts — ই-পেপার বট মূল-ওয়ার্কার
 *
 * ফ্লো: টেলিগ্রাম (@ePaperXpress) → আজকের পত্রিকার PDF খোঁজা → ডাউনলোড →
 *       গুগল-ড্রাইভে আপলোড (যে-কেউ-পড়তে-পারে লিংক) → সাইটের /api/epaper/sync-এ ঠেলা
 *
 * চালান: bun start   (অথবা ডেভে bun run dev — ফাইল-বদলে রিস্টার্ট)
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'
import fs from 'fs'
import path from 'path'

/* ── কনফিগ (.env) ── */
const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const TG_PHONE = process.env.TG_PHONE || ''
const TG_SESSION = process.env.TG_SESSION || ''
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID || ''
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '')
const SYNC_TOKEN = process.env.SITE_SYNC_TOKEN || ''
const CHANNEL = process.env.EPAPER_CHANNEL || 'ePaperXpress'
const POLL_MINUTES = Math.max(parseInt(process.env.POLL_MINUTES || '20', 10) || 20, 3)

const SESS_FILE = path.join(import.meta.dir, '..', '.tg-session')
const STATE_FILE = path.join(import.meta.dir, '..', '.sync-state.json')

for (const [k, v] of Object.entries({ TG_API_ID, TG_API_HASH, TG_PHONE, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, SITE_URL, SYNC_TOKEN })) {
  if (!v) { console.error(`❌ .env-এ ${k} দিন`); process.exit(1) }
}

/** Asia/Dhaka 'YYYY-MM-DD' */
function dhakaDate(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
/** বাংলা-তারিখ লেবেল (একই ঢাকা-অঞ্চল) */
function bnDateLabel(d = new Date()): string {
  return new Intl.DateTimeFormat('bn-BD', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(d)
}

/* ── স্টেট (ডিডুপ) ── */
function loadState(): Record<string, string> {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) } catch { return {} }
}
function saveState(s: Record<string, string>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2))
}
const state = loadState()

/* ── গুগল-ড্রাইভ ── */
async function driveAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const j = (await res.json()) as { access_token?: string; error_description?: string }
  if (!j.access_token) throw new Error('ড্রাইভ-টোকেন রিফ্রেশ ব্যর্থ: ' + (j.error_description || ''))
  return j.access_token
}

async function driveEnsureFolder(token: string): Promise<string> {
  if (FOLDER_ID) return FOLDER_ID
  const q = encodeURIComponent(`name='Lekhok ePaper' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  const list = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json() as Promise<{ files: { id: string }[] }>)
  if (list.files?.length) return list.files[0].id
  const created = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Lekhok ePaper', mimeType: 'application/vnd.google-apps.folder' }),
  }).then((r) => r.json() as Promise<{ id: string }>)
  return created.id
}

async function driveUpload(token: string, folderId: string, name: string, bytes: Uint8Array, mime: string): Promise<string> {
  // ডুপ্লিকেট-রোধ: একই-ফোল্ডারে একই-নামের ফাইল থাকলে পুনঃআপলোড নয় — আগেরটাই ব্যবহার
  // (sync-ব্যর্থতায় রিট্রাই করলে ড্রাইভ-এ একই পত্রিকা জমতে থাকবে না)
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`)
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json() as Promise<{ files?: { id: string }[] }>)
  if (found.files?.[0]?.id) {
    console.log('↷ ড্রাইভ-এ আগেই আছে — পুরোনো ফাইলই ব্যবহার হবে:', name)
    return found.files[0].id
  }
  const meta = { name, parents: [folderId] }
  const boundary = 'lfepaper' + Date.now()
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
    `--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`
  const tail = `\r\n--${boundary}--`
  const payload = new Uint8Array([...new TextEncoder().encode(body), ...bytes, ...new TextEncoder().encode(tail)])
  const up = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: payload,
  }).then((r) => r.json() as Promise<{ id?: string; error?: unknown }>)
  if (!up.id) throw new Error('ড্রাইভ-আপলোড ব্যর্থ: ' + JSON.stringify(up).slice(0, 200))
  // যে-কেউ-লিংক-ধরে-পড়তে-পারবে
  await fetch(`https://www.googleapis.com/drive/v3/files/${up.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })
  return up.id
}

/* ── সাইট-সিঙ্ক ── */
async function siteSync(date: string, fileId: string, paperName: string): Promise<void> {
  const link = `https://drive.google.com/file/d/${fileId}/view`
  const res = await fetch(`${SITE_URL}/api/epaper/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SYNC_TOKEN}` },
    body: JSON.stringify({
      date,
      title: `📰 ${paperName} — ${bnDateLabel()}`,
      body: 'আজকের পত্রিকার সম্পূর্ণ PDF সংস্করণ — নিচের বাটনে ক্লিক করে পড়ুন। (অটো-সংগ্রহ: @' + CHANNEL + ')',
      fileUrl: link,
      source: 'epaper-bot',
    }),
  })
  const j = (await res.json()) as { ok?: boolean; error?: string }
  if (!res.ok || !j.ok) throw new Error('সাইট-সিঙ্ক ব্যর্থ: ' + (j.error || res.status))
  console.log(`✅ সাইটে সিঙ্ক হয়েছে (${date}) → ${link}`)
}

/* ── টেলিগ্রাম ── */
async function main(): Promise<void> {
  let sessionStr = TG_SESSION
  if (!sessionStr && fs.existsSync(SESS_FILE)) sessionStr = fs.readFileSync(SESS_FILE, 'utf8').trim()
  if (!sessionStr) {
    console.error('❌ টেলিগ্রাম-সেশন নেই — আগে `bun run login` চালান (OTP দিয়ে লগইন করবে)')
    process.exit(1)
  }
  const client = new TelegramClient(new StringSession(sessionStr), TG_API_ID, TG_API_HASH, { connectionRetries: 5 })
  await client.connect()
  if (!client.checkAuthorization()) {
    console.error('❌ সেশন-স্ট্রিং মেয়াদোত্তীর্ণ/অবৈধ — আবার `bun run login` চালান')
    process.exit(1)
  }
  console.log('🤖 বট চালু — চ্যানেল @' + CHANNEL + ', পোল ' + POLL_MINUTES + ' মিনিট')

  const scanOnce = async (): Promise<void> => {
    const today = dhakaDate()
    if (state[today]) { console.log('↷', today, 'ইতোমধ্যে সিঙ্কড'); return }
    console.log('🔍 স্ক্যান:', today)
    const msgs = await client.getMessages(CHANNEL, { limit: 30 })
    for (const m of msgs) {
      if (!m.document) continue
      const doc = m.document as any
      const mime: string = doc.mimeType || ''
      if (!/pdf$/.test(mime)) continue
      const msgDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(m.date * 1000))
      // আজকের (বা সর্বশেষ অসিন্কড) পত্রিকা
      const attrs = (doc.attributes || []) as any[]
      const fName = (attrs.find((a) => a.fileName)?.fileName) || `epaper-${msgDate}.pdf`
      console.log('📄 পাওয়া গেছে:', fName, `(${msgDate})`)
      try {
        const buffer = await client.downloadMedia(m, {})
        const bytes = new Uint8Array(buffer as unknown as ArrayBuffer)
        const token = await driveAccessToken()
        const folderId = await driveEnsureFolder(token)
        const fileId = await driveUpload(token, folderId, fName, bytes, 'application/pdf')
        await siteSync(msgDate, fileId, 'দৈনিক পত্রিকা')
        state[msgDate] = fileId
        saveState(state)
        break // এক-পাসে এক-পত্রিকা
      } catch (err) {
        console.error('⚠️ আপলোড/সিঙ্ক-ত্রুটি:', err instanceof Error ? err.message : err)
      }
    }
  }

  await scanOnce()
  setInterval(() => scanOnce().catch((e) => console.error('পোল-ত্রুটি:', e)), POLL_MINUTES * 60 * 1000)
}

main().catch((e) => { console.error('ফেটাল:', e); process.exit(1) })
