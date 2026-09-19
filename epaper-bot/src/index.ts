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
const PAPER_FILTER = (process.env.PAPER_FILTER || '').trim().toLowerCase() // খালি = সব পত্রিকা; যেমন: "prothom alo"
const BACKFILL_DAYS = Math.max(parseInt(process.env.BACKFILL_DAYS || '2', 10) || 2, 1) // শেষ N দিনের পত্রিকা সিঙ্ক-হবে

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
/** নির্দিষ্ট ISO-তারিখের বাংলা-লেবেল (ব্যাকফিল-ব্যাকফিলে পুরোনো-দিনের টাইটেলের জন্য) */
function bnDateOf(iso: string): string {
  try { return bnDateLabel(new Date(iso + 'T12:00:00+06:00')) } catch { return bnDateLabel() }
}

/* ── পত্রিকা-নাম রেজলভ (session170) — ক্যাপশন/ফাইলনাম যা-ই-হোক সঠিক বাংলা-নাম ── */
const NEWSPAPER_MAP: Array<[RegExp, string]> = [
  [/টাইমস\s*অব\s*বাংলাদেশ|times\s*of\s*bangladesh|\btob\b/i, 'টাইমস অব বাংলাদেশ'],
  [/দ্য\s*ডেইলি\s*স্টার|ডেইলি\s*স্টার|daily\s*star|\btds\b/i, 'দ্য ডেইলি স্টার'],
  [/প্রথম\s*আলো|prothom\s*alo|\bprothomalo\b/i, 'প্রথম আলো'],
  [/দ্য\s*বিজনেস\s*স্ট্যান্ডার্ড|বিজনেস\s*স্ট্যান্ডার্ড|business\s*standard|\btbs\b/i, 'দ্য বিজনেস স্ট্যান্ডার্ড'],
  [/আমার\s*দেশ|amar\s*desh|amardesh|\bad\b/i, 'আমার দেশ'],
  [/নযা\s*দিগন্ত|নয়া\s*দিগন্ত|naya\s*diganta|nayadiganta/i, 'নয়া দিগন্ত'],
  [/মানব\s*জমিন|মানবজমিন|manab\s*zamin|manabzamin/i, 'মানবজমিন'],
  [/ইত্তেফাক|ittefaq/i, 'ইত্তেফাক'],
  [/দেশ\s*রূপান্তর|দেশ\s*রুপান্তর|desh\s*rupantor/i, 'দেশ রূপান্তর'],
  [/সমকাল|samakal/i, 'সমকাল'],
  [/রূপালী\s*বাংলাদেশ|রুপালি\s*বাংলাদেশ|rupali\s*bangladesh/i, 'রূপালী বাংলাদেশ'],
  [/কালের\s*কণ্ঠ|কালের\s*কন্ঠ|kaler\s*kantho/i, 'কালের কণ্ঠ'],
  [/ইনকিলাব|inqilab/i, 'ইনকিলাব'],
  [/আজকের\s*পত্রিকা|ajker\s*patrika/i, 'আজকের পত্রিকা'],
  [/বাংলাদেশ\s*প্রতিদিন|bd\s*pratidin|bangladesh\s*pratidin/i, 'বাংলাদেশ প্রতিদিন'],
  [/বণিক\s*বার্তা|বণিক\s*বর্তা|bonik\s*barta|bonik\s*barta/i, 'বণিক বার্তা'],
  [/যুগান্তর|jugantor/i, 'যুগান্তর'],
  [/ভোরের\s*কাগজ|bhorer\s*kagoj/i, 'ভোরের কাগজ'],
  [/জনকণ্ঠ|জনকন্ঠ|jonokontho|janakantha/i, 'জনকণ্ঠ'],
  [/ডেইলি\s*অবজারভার|daily\s*observer/i, 'ডেইলি অবজারভার'],
  [/নিউ\s*এজ|new\s*age/i, 'নিউ এজ'],
  [/ঢাকা\s*ট্রিবিউন|dhaka\s*tribune/i, 'ঢাকা ট্রিবিউন'],
  [/ফাইন্যান্সিয়াল\s*এক্সপ্রেস|financial\s*express/i, 'দ্য ফাইন্যান্সিয়াল এক্সপ্রেস'],
  [/ডেইলি\s*সান|daily\s*sun/i, 'ডেইলি সান'],
  [/বাংলাদেশ\s*পোস্ট|bangladesh\s*post/i, 'বাংলাদেশ পোস্ট'],
]
function resolvePaperName(rawText: string, fileName: string): string {
  const hay = `${rawText || ''} ${fileName || ''}`
  for (const [re, name] of NEWSPAPER_MAP) if (re.test(hay)) return name
  // ক্যাপশনের প্রথম-লাইন থেকে তারিখ-অংশ কেটে নাম (যেমন "আমার দেশ ১৮/০৯/২০২৬" → "আমার দেশ")
  const line = String(rawText || '').split('\n')[0].trim()
  const cleaned = line.replace(/[০-৯0-9\/\-,.:]+\s*$/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.length >= 2 ? cleaned : 'দৈনিক পত্রিকা'
}

/* ── স্টেট (ডিডুপ) — v2: তারিখ → { ফাইলনাম: ড্রাইভ-ফাইলআইডি } (প্রতি-দিনে-একাধিক-পত্রিকা) ── */
type EpaperState = Record<string, Record<string, string>>
function loadState(): EpaperState {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as Record<string, unknown>
    const out: EpaperState = {}
    // legacy-v1 ({ তারিখ: ফাইলআইডি }) ফেলে দেওয়া হয় — পুরোনো-দিন পুনঃসিঙ্ক হবে
    // (সাইটে (তারিখ+ফাইলআইডি) মার্জ থাকায় ডুপ্লিকেট হবে না, নাম-ঠিককরণও হবে)
    for (const [k, v] of Object.entries(raw || {})) {
      out[k] = v && typeof v === 'object' ? (v as Record<string, string>) : {}
    }
    return out
  } catch { return {} }
}
function saveState(s: EpaperState) {
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

/** ফোল্ডারে একই-নামের (ট্র্যাশ-বাদে) ফাইল আগে থাকলে তার id — নইলে null */
async function driveFindFile(token: string, folderId: string, name: string): Promise<string | null> {
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`)
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json() as Promise<{ files?: { id: string }[] }>)
  return found.files?.[0]?.id || null
}

async function driveUpload(token: string, folderId: string, name: string, bytes: Uint8Array, mime: string): Promise<string> {
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
async function siteSync(date: string, fileId: string, paperName: string, thumbId?: string): Promise<void> {
  const link = `https://drive.google.com/file/d/${fileId}/view`
  const res = await fetch(`${SITE_URL}/api/epaper/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SYNC_TOKEN}` },
    body: JSON.stringify({
      date,
      paperName,
      title: `📰 ${paperName} — ${bnDateOf(date)}`,
      body: 'আজকের পত্রিকার সম্পূর্ণ PDF সংস্করণ — নিচের বাটনে ক্লিক করে পড়ুন।',
      fileUrl: link,
      fileId,
      thumbId: thumbId || undefined,
      source: 'epaper-bot',
    }),
  })
  const j = (await res.json()) as { ok?: boolean; error?: string; archiveId?: number }
  if (!res.ok || !j.ok) throw new Error('সাইট-সিঙ্ক ব্যর্থ: ' + (j.error || res.status))
  console.log(`✅ সাইটে সিঙ্ক হয়েছে (${date}) ${paperName} → archive#${j.archiveId ?? '?'} ${link}`)
}

/* ── থাম্বনেইল (session170): টেলিগ্রামের ডকুমেন্ট-প্রিভিউ JPEG → ড্রাইভ-আপলোড ──
   বড় PDF-এ ড্রাইভ নিজে থাম্বনেইল বানায় না (hasThumbnail:false) — তাই টেলিগ্রামের
   তৈরি প্রিভিউ-ছবিটাই .jpg হিসেবে আপলোড করা হয় (ছবি-ফাইলের থাম্বনেইল সবসময় কাজ করে) */
async function ensureThumb(token: string, folderId: string, fName: string, client: any, msg: any, doc: any): Promise<string | undefined> {
  try {
    const thumbName = fName.replace(/\.pdf$/i, '') + '.jpg'
    const cached = await driveFindFile(token, folderId, thumbName)
    if (cached) return cached
    const thumbs = (doc.thumbs || []).filter((t: any) => typeof t?.w === 'number')
    if (!thumbs.length) return undefined
    const buf = await client.downloadMedia(msg, { thumb: thumbs.length - 1 })
    if (!buf) return undefined
    const bytes = new Uint8Array(buf as unknown as ArrayBuffer)
    if (!bytes.length || bytes.length > 2 * 1024 * 1024) return undefined
    const thumbId = await driveUpload(token, folderId, thumbName, bytes, 'image/jpeg')
    console.log(`🖼️ থাম্বনেইল-আপলোড: ${thumbName} (${bytes.length}B)`)
    return thumbId
  } catch (e) {
    console.error('⚠️ থাম্বনেইল-ব্যর্থতা (প্রধান-প্রবাহ অটুট):', e instanceof Error ? e.message : e)
    return undefined
  }
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
    const cutoff = dhakaDate(new Date(Date.now() - (BACKFILL_DAYS - 1) * 86400000)) // শেষ N দিন
    if (!state[today]) state[today] = {}
    console.log('🔍 স্ক্যান:', today, `(উইন্ডো: ${cutoff} → আজ)`)
    const msgs = await client.getMessages(CHANNEL, { limit: 50 })
    // পুরোনো-থেকে-নতুন ক্রমে প্রসেস — ফিচার্ড-রো-তে সর্বশেষ-পোস্ট-করা পত্রিকাটি থাকে
    const list = [...msgs].reverse()
    let attempted = 0
    for (const m of list) {
      if (!m.document) continue
      const doc = m.document as any
      const mime: string = doc.mimeType || ''
      if (!/pdf$/.test(mime)) continue
      const msgDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(m.date * 1000))
      if (msgDate < cutoff || msgDate > today) continue
      const attrs = (doc.attributes || []) as any[]
      const fName = (attrs.find((a) => a.fileName)?.fileName) || `epaper-${msgDate}-${m.id}.pdf`
      // PAPER_FILTER দিলে শুধু মিলে-যাওয়া পত্রিকা (মেসেজ-টেক্সট/ফাইলনামে সার্চ)
      if (PAPER_FILTER && !(`${m.message || ''} ${fName}`.toLowerCase().includes(PAPER_FILTER))) continue
      if (!state[msgDate]) state[msgDate] = {}
      if (state[msgDate][fName]) continue // এই-ফাইল সিঙ্কড
      const paperName = resolvePaperName(String(m.message || ''), fName)
      console.log('📄 পাওয়া গেছে:', paperName, `(${msgDate}, ${fName})`)
      attempted++
      try {
        const token = await driveAccessToken()
        const folderId = await driveEnsureFolder(token)
        // ড্রাইভ-এ আগেই থাকলে ডাউনলোড-স্কিপ — সরাসরি sync-রিট্রাই (ব্যান্ডউইডথ-সাশ্রয়)
        let fileId = await driveFindFile(token, folderId, fName)
        if (!fileId) {
          const buffer = await client.downloadMedia(m, {})
          const bytes = new Uint8Array(buffer as unknown as ArrayBuffer)
          fileId = await driveUpload(token, folderId, fName, bytes, 'application/pdf')
        } else {
          console.log('↷ ড্রাইভ-এ আগেই আছে — ডাউনলোড-স্কিপ')
        }
        // থাম্বনেইল: টেলিগ্রাম-প্রিভিউ → ড্রাইভ .jpg (ডাউনলোড-স্কিপের-পরেও দরকার)
        const thumbId = await ensureThumb(token, folderId, fName, client, m, doc)
        await siteSync(msgDate, fileId, paperName, thumbId)
        state[msgDate][fName] = fileId
        saveState(state)
      } catch (err) {
        console.error('⚠️ আপলোড/সিঙ্ক-ত্রুটি:', err instanceof Error ? err.message : err)
      }
    }
    if (!attempted) console.log('↷ নতুন কিছু নেই — সব সিঙ্কড')
  }

  await scanOnce()
  setInterval(() => scanOnce().catch((e) => console.error('পোল-ত্রুটি:', e)), POLL_MINUTES * 60 * 1000)
}

main().catch((e) => { console.error('ফেটাল:', e); process.exit(1) })
