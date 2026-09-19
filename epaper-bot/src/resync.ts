/**
 * resync.ts — ইতিমধ্যে-ক্ষয়িষ্ণু ড্রাইভ-কপি মেরামত (session179, ইউজার-স্পেক: "১০০% কোয়ালিটি চাই")
 *
 * সমস্যা: session175→178-এর মাঝে বট v2-ক্লিনার (q80-রি-এনকোড) দিয়ে পরিষ্কার করে আপলোড করত —
 * বেক-করা-ব্যানারযুক্ত ফাইলের ড্রাইভ-কপিই ক্ষয়িষ্ণু হয়ে গিয়েছিল (সাইট-প্রক্সি যত-ভালোই হোক,
 * ক্ষয়িষ্ণু উৎস থেকে ১০০% কোয়ালিটি ফেরানো যায় না)।
 *
 * সমাধান: টেলিগ্রাম-চ্যানেল থেকে মূল (অক্ষত) ফাইল পুনঃডাউনলোড → v3 লসলেস-ক্লিনার
 * (cleaner.ts v3: সাদা-আয়ত-ওভারলে — JPEG-বাইট হুবহু অক্ষত) → হুবহু একই ড্রাইভ-ফাইল-আইডিতে
 * media-PATCH রিপ্লেস (backfill.ts-চুক্তি) → থাম্বনেইল রি-রেন্ডার।
 *
 * নিরাপত্তা:
 *   ① ড্রাই-রান ডিফল্ট — --apply দিলেই ড্রাইভে লেখে
 *   ② v3-ক্লিনে কিছু-না-বদলালে ফাইল স্পর্শই হয় না (ড্রাইভ-কপি নিজে-থেকেই নিখুঁত)
 *   ③ ইন্টিগ্রিটি-গার্ড — রিপ্লেস-উত্তরের id হুবহু মিলতে হয়
 *   ④ সাইড-ইফেক্ট-শূন্য ব্যর্থতায় — পরের ফাইল চলতে থাকে
 *
 * চালান (প্রোডাকশন-বক্সে, .env-সহ):
 *   bun run src/resync.ts              # ড্রাই-রান — কোন ফাইল বদলাত তা-ই দেখায়
 *   bun run src/resync.ts -- --apply   # আসল রিপ্লেস
 *   ফ্ল্যাগ: --days N (ডিফল্ট ১০ — শেষ N দিনের মেসেজ), --limit N, --msg N (getMessages-লিমিট, ডিফল্ট ১৫০)
 */
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'
import { stripTelegramPromoLayerDetailed } from './cleaner'

/* ── কনফিগ (.env — index.ts/backfill.ts-এর মতোই) ── */
const TG_API_ID = parseInt(process.env.TG_API_ID || '', 10)
const TG_API_HASH = process.env.TG_API_HASH || ''
const TG_SESSION = process.env.TG_SESSION || ''
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID || ''
const CHANNEL = process.env.EPAPER_CHANNEL || 'ePaperXpress'
const SESS_FILE = path.join(import.meta.dir, '..', '.tg-session')

const APPLY = process.argv.includes('--apply')
function flagNum(names: string[], def: number): number {
  const i = process.argv.indexOf(names[0])
  if (i === -1 || !process.argv[i + 1]) return def
  const v = parseInt(process.argv[i + 1], 10)
  return Number.isFinite(v) && v > 0 ? v : def
}
const DAYS = flagNum(['--days'], 10)
const LIMIT = flagNum(['--limit'], 0) // ০ = সীমাহীন
const MSG_LIMIT = Math.min(flagNum(['--msg'], 150), 300)

for (const [k, v] of Object.entries({ TG_API_ID, TG_API_HASH, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN })) {
  if (!v) { console.error(`❌ .env-এ ${k} দিন`); process.exit(1) }
}

function mb(b: number): string { return (b / 1048576).toFixed(1) + ' MB' }

/* ── ড্রাইভ-হেল্পার (backfill.ts-চুক্তি) ── */
function assertOk(res: Response, label: string): Response {
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}${res.status === 429 ? ' (rate-limit)' : ''}`)
  return res
}
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
  throw new Error('ফোল্ডার পাওয়া যায়নি — .env-এ GOOGLE_FOLDER_ID দিন')
}
async function driveFindFile(token: string, folderId: string, name: string): Promise<string | null> {
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`)
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json() as Promise<{ files?: { id: string }[] }>)
  return found.files?.[0]?.id || null
}
/** হুবহু একই ফাইল-আইডিতে কনটেন্ট-রিপ্লেস (metadata/permission অক্ষুণ্ণ) */
async function driveReplaceInPlace(token: string, fileId: string, bytes: Uint8Array): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,size`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
    body: bytes as unknown as BodyInit,
  })
  const j = (await assertOk(res, 'রিপ্লেস').json()) as { id?: string }
  if (!j.id || j.id !== fileId) throw new Error(`রিপ্লেস-আইডি-বৈষম্য (${j.id} ≠ ${fileId})`)
}
/** থাম্বনেইল রি-রেন্ডার (ক্লিন-পিডিএফের প্রথম-পাতা → একই থাম্ব-আইডিতে রিপ্লেস) */
async function refreshThumb(token: string, folderId: string, pdfName: string, cleanedBytes: Uint8Array): Promise<boolean> {
  try {
    const thumbName = pdfName.replace(/\.pdf$/i, '') + '.jpg'
    const thumbId = await driveFindFile(token, folderId, thumbName)
    if (!thumbId) return false
    const tag = Date.now()
    const tmpPdf = path.join(os.tmpdir(), `ep-rs-${tag}.pdf`)
    const tmpJpg = path.join(os.tmpdir(), `ep-rs-${tag}.jpg`)
    try {
      fs.writeFileSync(tmpPdf, cleanedBytes)
      const script = path.join(import.meta.dir, 'render-page.mjs')
      const r = spawnSync('node', [script, tmpPdf, tmpJpg, '1.1'], { cwd: import.meta.dir, timeout: 120000, encoding: 'utf8' })
      if (r.status !== 0 || !fs.existsSync(tmpJpg)) return false
      const jpg = new Uint8Array(fs.readFileSync(tmpJpg))
      if (!jpg.length || jpg.length > 4 * 1024 * 1024) return false
      const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${thumbId}?uploadType=media&fields=id`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' },
        body: jpg as unknown as BodyInit,
      })
      return assertOk(res, 'থাম্ব-রিপ্লেস').ok
    } finally {
      try { fs.unlinkSync(tmpPdf) } catch {}
      try { fs.unlinkSync(tmpJpg) } catch {}
    }
  } catch {
    return false
  }
}

/* ── মূল-প্রবাহ ── */
async function main(): Promise<void> {
  let sessionStr = TG_SESSION
  if (!sessionStr && fs.existsSync(SESS_FILE)) sessionStr = fs.readFileSync(SESS_FILE, 'utf8').trim()
  if (!sessionStr) { console.error('❌ টেলিগ্রাম-সেশন নেই — আগে `bun run login` চালান'); process.exit(1) }
  const client = new TelegramClient(new StringSession(sessionStr), TG_API_ID, TG_API_HASH, { connectionRetries: 5 })
  await client.connect()
  if (!client.checkAuthorization()) { console.error('❌ সেশন অবৈধ — আবার `bun run login`'); process.exit(1) }

  const token = await driveAccessToken()
  const folderId = await driveEnsureFolder(token)
  const cutoff = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() - (DAYS - 1) * 86400000))

  console.log(`🔧 resync ${APPLY ? '— APPLY (ড্রাইভে লিখবে)' : '— ড্রাই-রান (--apply দিলে লিখবে)'} | উইন্ডো: ${cutoff} → আজ | মেসেজ-লিমিট: ${MSG_LIMIT}`)
  const msgs = await client.getMessages(CHANNEL, { limit: MSG_LIMIT })
  const list = [...msgs].reverse()

  let scanned = 0, candidates = 0, replaced = 0, skippedClean = 0, notOnDrive = 0, failed = 0
  for (const m of list) {
    if (!m.document) continue
    const doc = m.document as any
    if (!/pdf$/.test(String(doc.mimeType || ''))) continue
    const msgDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(m.date * 1000))
    if (msgDate < cutoff) continue
    const fName = (doc.attributes || []).find?.((a: any) => a.fileName)?.fileName || `epaper-${msgDate}-${m.id}.pdf`
    scanned++
    if (LIMIT && candidates >= LIMIT) break
    try {
      console.log(`\n📄 ${fName} (${msgDate}, ${mb(Number(doc.size?.big || doc.size || 0))}) — মূল ডাউনলোড…`)
      const buffer = await client.downloadMedia(m, {})
      const original = Buffer.from(buffer as unknown as ArrayBuffer)
      if (original.length < 1024) { console.log('  ↷ খুব-ছোট — স্কিপ'); continue }
      candidates++
      // v3 লসলেস-ক্লিন — মূল-বাইটে প্রমো-লেয়ার না-থাকলে নো-অপ (সম-রেফারেন্স-চুক্তি)
      const report = await stripTelegramPromoLayerDetailed(original)
      if (report.error) { console.log('  ⚠️ ক্লিনার-ত্রুটি:', report.error, '— স্কিপ'); failed++; continue }
      if (!report.changed) { console.log('  ✓ মূলেই প্রমো-লেয়ার নেই — ড্রাইভ-কপি নিখুঁত, স্পর্শ-শূন্য'); skippedClean++; continue }
      console.log(`  ✨ v3-লসলেস-ক্লিন: স্ট্রিম×${report.streams} লিংক×${report.annots} টেইল×${report.tailBlocks} ওভারলে×${report.imagesCovered} (${mb(original.length)} → ${mb(report.buffer.length)})`)
      // ড্রাইভে এই-নামের ফাইল খোঁজা
      const driveId = await driveFindFile(token, folderId, fName)
      if (!driveId) { console.log('  ↷ ড্রাইভে নেই (আপলোড-হয়নি/বাদ) — স্কিপ'); notOnDrive++; continue }
      if (!APPLY) {
        console.log(`  🔍 ড্রাই-রান: ড্রাইভ-ফাইল ${driveId.slice(0, 8)}… বদলাত (সম-আইডি-রিপ্লেস)`)
        replaced++
        continue
      }
      await driveReplaceInPlace(token, driveId, new Uint8Array(report.buffer))
      const thumbDone = await refreshThumb(token, folderId, fName, report.buffer)
      console.log(`  ✅ ড্রাইভ-কপি লসলেস-ভার্সনে বদলানো হলো (সম-আইডি ${driveId.slice(0, 8)}…)${thumbDone ? ' + থাম্বনেইল রি-রেন্ডার' : ''}`)
      replaced++
    } catch (e) {
      failed++
      console.error('  ⚠️ ব্যর্থ (পরের-ফাইল চলছে):', e instanceof Error ? e.message : e)
    }
  }

  console.log(`\n═══ সারসংক্ষেপ ═══`)
  console.log(`স্ক্যান ${scanned} PDF-মেসেজ | প্রার্থী ${candidates} | বদলানো ${replaced} | মূলেই-পরিষ্কার ${skippedClean} | ড্রাইভে-নেই ${notOnDrive} | ব্যর্থ ${failed}`)
  if (!APPLY) console.log('👉 আসল-রিপ্লেসে: bun run src/resync.ts -- --apply')
  process.exit(0)
}

main().catch((e) => { console.error('ফেটাল:', e); process.exit(1) })
