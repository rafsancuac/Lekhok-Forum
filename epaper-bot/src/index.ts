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
import { spawnSync } from 'child_process'
import os from 'os'
import { stripTelegramPromoLayer } from './cleaner'

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
const HEARTBEAT_FILE = path.join(import.meta.dir, '..', '.bot-heartbeat')

/* ── ক্র্যাশ-প্রুফ-গার্ড (session184): ধাক্কা-খাওয়া-অ্যাসিঙ্ক-এররে পোল-লুপ কখনো-মরবে-না ──
   আগে: কোনো-প্রমিস-রিজেক্ট-এস্কেপ করলে পুরো-প্রসেস মারা-যেত (ইউজার-অভিযোগের-মূল-কারণগুলোর-একটি)
   এখন: লগ-হবে, প্রসেস-বেঁচে-থাকবে — পরের-পোলেই-আবার-চেষ্টা। হার্টবিট-ফাইলে bot-keeper.sh তাকায়। */
process.on('uncaughtException', (e) => console.error('💥 uncaughtException (লুপ-চলমান):', e instanceof Error ? e.stack : e))
process.on('unhandledRejection', (e) => console.error('💥 unhandledRejection (লুপ-চলমান):', e instanceof Error ? e.stack : e))
function beat(): void {
  try { fs.writeFileSync(HEARTBEAT_FILE, new Date().toISOString()) } catch {}
}
setInterval(beat, 60_000) // প্রসেস-জীবিত-সংকেত (স্ক্যান-ঝুলে-গেলেও keeper পার্থক্য-করতে-পারে না, তাই-মিনিটে-ই-বিট)

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
  [/যায়যায়দিন|jaijaidin/i, 'যায়যায়দিন'],
  [/কালবেলা|kalbela/i, 'কালবেলা'],
  [/দিনকাল|dinkal/i, 'দিনকাল'],
  [/করতোয়া|karatoa/i, 'করতোয়া'],
  [/(?:^|\s)এদিন|daily\s*adin|\badin\b/i, 'এদিন'],
  [/বিজনেস\s*বাংলাদেশ|business\s*bangladesh/i, 'বিজনেস বাংলাদেশ'],
  [/ডেইলি\s*পোস্ট|daily\s*post/i, 'ডেইলি পোস্ট'],
  [/জাতীয়\s*অর্থনীতি|jatio\s*arthoniti/i, 'জাতীয় অর্থনীতি'],
]
function resolvePaperName(rawText: string, fileName: string): string {
  const hay = `${rawText || ''} ${fileName || ''}`
  for (const [re, name] of NEWSPAPER_MAP) if (re.test(hay)) return name
  // ক্যাপশনের প্রথম-লাইন থেকে তারিখ-অংশ কেটে নাম (যেমন "আমার দেশ ১৮/০৯/২০২৬" → "আমার দেশ")
  const line = String(rawText || '').split('\n')[0].trim()
  const cleaned = line.replace(/[০-৯0-9\/\-,.:]+\s*$/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.length >= 2 ? cleaned : 'দৈনিক পত্রিকা'
}

/** ম্যাপ-হিট (session176) — ম্যাপে-মিললে নিশ্চিত পত্রিকা (নন-ই-পেপার-ফিল্টারের সাদৃশ্য-সংকেত) */
function mapHit(rawText: string, fileName: string): string | null {
  const hay = `${rawText || ''} ${fileName || ''}`
  for (const [re, name] of NEWSPAPER_MAP) if (re.test(hay)) return name
  return null
}
/** নন-ই-পেপার (session176): চাকুরি-বিজ্ঞপ্তি/পে-স্কেল/ফলাফল/রুটিন-জাতীয় PDF —
 *  শুধুমাত্র ম্যাপ-হিট-বিহীন হলে বাদ (আসল পত্রিকা কখনো বাদ পড়ে না) */
const NON_EPAPER_RE = /চাকুরি|চাকরি|নিয়োগ|পে-?\s*স্কেল|বৃত্তি|ফলাফল|ভর্তি|রুটিন|বেতন\s*ও\s*ভাতাদি|আদেশ|job\s*circular|pay\s*scale|admission|exam\s*result/i

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
  // session184: ৩-চেষ্টা-রিট্রাই (৪সে/১২সে-ব্যাকঅফ) — এক-রিকোয়েস্ট-ফেইলে আর-আটকে-থাকবে-না
  let lastErr = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(20000),
      })
      const j = (await res.json()) as { access_token?: string; error_description?: string }
      if (j.access_token) return j.access_token
      lastErr = j.error_description || `HTTP-${res.status}`
      // invalid_grant = রিফ্রেশ-টোকেন-ই-মৃত — রিট্রাই-বৃথা, সরাসরি-ফেটক
      if (/invalid_grant/i.test(lastErr)) break
    } catch (e) { lastErr = e instanceof Error ? e.message : String(e) }
    if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 4000))
  }
  throw new Error(`ড্রাইভ-টোকেন রিফ্রেশ ব্যর্থ (${lastErr})`)
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

/* ── থাম্বনেইল (session170): টেলিগ্রাম-প্রিভিউ বা PDF-প্রথম-পাতা-রেন্ডার → ড্রাইভ-আপলোড ──
   বড় PDF-এ ড্রাইভ নিজে থাম্বনেইল বানায় না (hasThumbnail:false) — তাই:
   ① টেলিগ্রামের ডকুমেন্ট-প্রিভিউ থাকলে সেটাই (সস্তা) ② নইলে PDF-এর প্রথম-পাতা node-সাবপ্রসেসে রেন্ডার */
async function driveDownload(token: string, fileId: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return new Uint8Array(await res.arrayBuffer())
  } catch { return null }
}

async function renderFirstPageJpg(pdfBytes: Uint8Array): Promise<Uint8Array | null> {
  const tag = Date.now()
  const tmpPdf = path.join(os.tmpdir(), 'ep-render-' + tag + '.pdf')
  const tmpJpg = path.join(os.tmpdir(), 'ep-render-' + tag + '.jpg')
  try {
    fs.writeFileSync(tmpPdf, pdfBytes)
    const script = path.join(import.meta.dir, 'render-page.mjs')
    const r = spawnSync('node', [script, tmpPdf, tmpJpg, '1.1'], { cwd: import.meta.dir, timeout: 120000, encoding: 'utf8' })
    if (r.status !== 0 || !fs.existsSync(tmpJpg)) {
      console.error('⚠️ রেন্ডার-ব্যর্থ:', (r.stderr || r.stdout || '').slice(0, 140))
      return null
    }
    const out = new Uint8Array(fs.readFileSync(tmpJpg))
    return out.length && out.length < 4 * 1024 * 1024 ? out : null
  } catch { return null }
  finally {
    try { fs.unlinkSync(tmpPdf) } catch {}
    try { fs.unlinkSync(tmpJpg) } catch {}
  }
}

async function ensureThumb(token: string, folderId: string, fName: string, client: any, msg: any, doc: any, pdfBytes?: Uint8Array, existingFileId?: string): Promise<string | undefined> {
  try {
    const thumbName = fName.replace(/\.pdf$/i, '') + '.jpg'
    const cached = await driveFindFile(token, folderId, thumbName)
    if (cached) return cached
    // ① টেলিগ্রাম-ডকুমেন্ট-প্রিভিউ (চ্যানেল থাম্ব-দিলে সবচেয়ে-সস্তা)
    const thumbs = (doc.thumbs || []).filter((t: any) => typeof t?.w === 'number')
    if (thumbs.length) {
      const buf = await client.downloadMedia(msg, { thumb: thumbs.length - 1 })
      if (buf) {
        const bytes = new Uint8Array(buf as unknown as ArrayBuffer)
        if (bytes.length && bytes.length < 2 * 1024 * 1024) {
          const tid = await driveUpload(token, folderId, thumbName, bytes, 'image/jpeg')
          console.log(`🖼️ থাম্বনেইল (টেলিগ্রাম-প্রিভিউ): ${thumbName} (${bytes.length}B)`)
          return tid
        }
      }
    }
    // ② PDF-প্রথম-পাতা-রেন্ডার — বাফার না-থাকলে ড্রাইভ থেকে এক-বার ডাউনলোড (ব্যাকফিল)
    let bytes = pdfBytes
    if ((!bytes || !bytes.length) && existingFileId) bytes = (await driveDownload(token, existingFileId)) || undefined
    if (!bytes || !bytes.length) return undefined
    const jpg = await renderFirstPageJpg(bytes)
    if (!jpg) return undefined
    const tid = await driveUpload(token, folderId, thumbName, jpg, 'image/jpeg')
    console.log(`🖼️ থাম্বনেইল (PDF-রেন্ডার): ${thumbName} (${jpg.length}B)`)
    return tid
  } catch (e) {
    console.error('⚠️ থাম্বনেইল-ব্যর্থতা (প্রধান-প্রবাহ অটুট):', e instanceof Error ? e.message : e)
    return undefined
  }
}

/* ── সাইট-ক্লিন-ক্যাশ-ওয়ার্ম (session178): সিঙ্ক-পরবর্তী ফায়ার-অ্যান্ড-ফরগেট ──
   সাইটের /api/epaper/file প্রথম-রিকোয়েস্টে ড্রাইভ-ডাউনলোড+প্রমো-ক্লিন করে (~১৬-২৭s) —
   প্রথম-পাঠক সেই-দেরিটা খায়। সিঙ্ক শেষে বট নিজেই warm-কল দিয়ে /tmp-ক্যাশ প্রি-হিট করে রাখে,
   ফলে যে-কেউ-ক্লিক করুক, রিডার তাৎক্ষণিক খোলে। ব্যর্থতা প্রধান-প্রবাহ ভাঙে না।
   প্রতি-কলে ৫-ফাইল-চাংক (৫×~২৫s ≈ ১২৫s < Vercel maxDuration-১৫০s) — ধারাবাহিক-চাংক */
async function warmSiteCache(fileIds: string[]): Promise<void> {
  if (!SITE_URL || !SYNC_TOKEN || !fileIds.length) return
  const CHUNK = 5
  const uniq = [...new Set(fileIds.filter(Boolean))].slice(0, 40)
  for (let i = 0; i < uniq.length; i += CHUNK) {
    const chunk = uniq.slice(i, i + CHUNK)
    try {
      const res = await fetch(`${SITE_URL}/api/epaper/warm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SYNC_TOKEN}` },
        body: JSON.stringify({ fileIds: chunk }),
        signal: AbortSignal.timeout(145000),
      })
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; total?: number; warmed?: number; cached?: number; failed?: number; error?: string }
      if (!res.ok || !j.ok) {
        console.error(`⚠️ ওয়ার্ম-চাংক-${Math.floor(i / CHUNK) + 1}-ব্যর্থ (প্রধান-প্রবাহ অটুট):`, j.error || res.status)
        continue
      }
      console.log(`🔥 সাইট-ক্যাশ উষ্ণ (চাংক ${Math.floor(i / CHUNK) + 1}): মোট ${j.total} — প্রি-হিট ${j.warmed}, আগেই-ছিল ${j.cached}, ব্যর্থ ${j.failed}`)
    } catch (e) {
      console.error('⚠️ ওয়ার্ম-ত্রুটি (প্রধান-প্রবাহ অটুট):', e instanceof Error ? e.message : e)
    }
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
    const syncedIds: string[] = [] // session178: এ-স্ক্যানে সিঙ্কড ফাইল-আইডি — লুপ-শেষে ক্যাশ-ওয়ার্ম
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
      const rawMsg = String(m.message || '')
      // নন-ই-পেপার-গার্ড (session176): বিজ্ঞপ্তি/ফলাফল-জাতীয় PDF আর্কাইভে ঢুকবে না
      if (!mapHit(rawMsg, fName) && NON_EPAPER_RE.test(`${rawMsg} ${fName}`)) {
        console.log('↷ নন-ই-পেপার (বিজ্ঞপ্তি/ফলাফল-জাতীয়) — বাদ:', fName)
        continue
      }
      const paperName = resolvePaperName(rawMsg, fName)
      console.log('📄 পাওয়া গেছে:', paperName, `(${msgDate}, ${fName})`)
      attempted++
      try {
        const token = await driveAccessToken()
        const folderId = await driveEnsureFolder(token)
        // ড্রাইভ-এ আগেই থাকলে ডাউনলোড-স্কিপ — সরাসরি sync-রিট্রাই (ব্যান্ডউইডথ-সাশ্রয়)
        let fileId = await driveFindFile(token, folderId, fName)
        let pdfBytes: Uint8Array | undefined
        if (!fileId) {
          const buffer = await client.downloadMedia(m, {})
          pdfBytes = new Uint8Array(buffer as unknown as ArrayBuffer)
          // সেশন ১৭৩ (ইউজার-স্পেক): সবুজ প্রমো-স্ট্যাম্প+লিংক-লেয়ার মুছে পরিষ্কার পিডিএফ
          // (ব্যর্থতায় stripTelegramPromoLayer নিজেই মূল-বাফার ফেরত দেয় — প্রধান-প্রবাহ অটুট)
          try {
            console.log('⏳ ওয়াটারমার্ক পরিষ্কার করা হচ্ছে…')
            const rawBuf = Buffer.from(pdfBytes) // ক্লিনার নো-অপে এই-রেফারেন্সই ফেরত দেয়
            const clean = await stripTelegramPromoLayer(rawBuf)
            if (clean !== rawBuf && clean.length) {
              pdfBytes = new Uint8Array(clean)
              console.log(`✅ পরিচ্ছন্ন পিডিএফ প্রস্তুত (${pdfBytes.length}B — আগে ${rawBuf.length}B)`)
            } else {
              console.log('↷ প্রমো-লেয়ার পাওয়া যায়নি — মূল পিডিএফ-ই রাখা হলো')
            }
          } catch (e) {
            console.error('⚠️ ক্লিনার-ত্রুটি — মূল পিডিএফ আপলোড হবে:', e instanceof Error ? e.message : e)
          }
          fileId = await driveUpload(token, folderId, fName, pdfBytes, 'application/pdf')
        } else {
          console.log('↷ ড্রাইভ-এ আগেই আছে — ডাউনলোড-স্কিপ')
        }
        // থাম্বনেইল: টেলিগ্রাম-প্রিভিউ → PDF-প্রথম-পাতা-রেন্ডার (ডাউনলোড-স্কিপ হলে ড্রাইভ-থেকে-এক-বার)
        const thumbId = await ensureThumb(token, folderId, fName, client, m, doc, pdfBytes, fileId || undefined)
        await siteSync(msgDate, fileId, paperName, thumbId)
        state[msgDate][fName] = fileId
        saveState(state)
        if (fileId) syncedIds.push(fileId)
      } catch (err) {
        console.error('⚠️ আপলোড/সিঙ্ক-ত্রুটি:', err instanceof Error ? err.message : err)
      }
    }
    if (!attempted) console.log('↷ নতুন কিছু নেই — সব সিঙ্কড')
    // session178: সিঙ্ক-পরবর্তী ক্যাশ-ওয়ার্ম — ইউজার-ক্লিকের-আগেই সাইটে ক্লিন-পিডিএফ প্রস্তুত (ফায়ার-অ্যান্ড-ফরগেট)
    if (syncedIds.length) void warmSiteCache(syncedIds)
  }

  await scanOnce().catch((e) => console.error('প্রথম-স্ক্যান-ত্রুটি (পরের-পোলে-আবার):', e instanceof Error ? e.stack : e))
  setInterval(() => scanOnce().catch((e) => console.error('পোল-ত্রুটি (লুপ-অটুট):', e instanceof Error ? e.stack : e)), POLL_MINUTES * 60 * 1000)
}

main().catch((e) => { console.error('ফেটাল:', e); process.exit(1) })
