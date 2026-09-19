/**
 * backfill.ts — পুরোনো সংখ্যার রেট্রো-ক্লিন ব্যাকফিল (session174, ইউজার-স্পেক)
 *
 * সমস্যা: session173-এর আগে ড্রাইভে যাওয়া সব পিডিএফে চ্যানেলের সবুজ
 *         t.me/ePaperXpress প্রমো-লেয়ার (অ্যাপেন্ডেড-স্ট্রিম + লিংক-অ্যানোটেশন)
 *         রয়ে গেছে — প্রতি-পাতার নিচের প্রিন্ট-তথ্য ("সম্পাদক: …") ঢাকা পড়ে।
 *
 * সমাধান: ড্রাইভ-ফোল্ডারের সব PDF স্ক্যান → ডাউনলোড → ক্লিনার-রিপোর্ট →
 *         প্রমো পেলে ক্লিন-বাইট **হুবহু একই ফাইল-আইডিতে** রিপ্লেস
 *         (drive files.update media) → সাইট-DB/লিংক/থাম্বনেইল-আইডি অপরিবর্তিত।
 *         ড্রাইভ-রিভিশনে আগের-ভার্সন থেকে যায় (Drive UI → Manage versions)।
 *         প্রমোযুক্ত পিডিএফের থাম্বনেইলও ক্লিন-পিডিএফ-থেকে রি-রেন্ডার হয়।
 *
 * চালান:
 *   bun run backfill                  → ড্রাই-রান (স্ক্যান+রিপোর্ট, কিছু-ই বদলায় না)
 *   bun run backfill -- --apply       → সত্যিই রিপ্লেস
 *   BACKFILL_LIMIT=5 bun run backfill -- --apply   → প্রথম ৫টা (ধাপে-ধাপে রোলআউট)
 *   bun run backfill -- --apply --force            → আগে-চিহ্নিত ফাইলও পুনঃস্ক্যান
 *
 * নোট: টেলিগ্রাম-সেশন লাগে না — শুধু GOOGLE_CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN
 *      (+ GOOGLE_FOLDER_ID ঐচ্ছিক; না-দিলে 'Lekhok ePaper' ফোল্ডার খোঁজে/বানায়)।
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'
import { PDFDocument } from 'pdf-lib'
import { stripTelegramPromoLayerDetailed } from './cleaner'

/* ── কনফিগ ── */
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID || ''

const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply') || process.env.BACKFILL_APPLY === '1'
const FORCE = argv.includes('--force')
function limitOf(): number {
  const i = argv.indexOf('--limit')
  if (i >= 0 && argv[i + 1] && /^\d+$/.test(argv[i + 1])) return parseInt(argv[i + 1], 10)
  const eq = argv.find((a) => a.startsWith('--limit='))
  if (eq) return parseInt(eq.split('=')[1], 10) || 0
  return parseInt(process.env.BACKFILL_LIMIT || '', 10) || 0 // 0 = সীমাহীন
}
const LIMIT = limitOf()

const STATE_FILE = path.join(import.meta.dir, '..', '.backfill-state.json')
const QA_DIR = path.join(import.meta.dir, '..', '.qa')

for (const [k, v] of Object.entries({ GOOGLE_CLIENT_ID: CLIENT_ID, GOOGLE_CLIENT_SECRET: CLIENT_SECRET, GOOGLE_REFRESH_TOKEN: REFRESH_TOKEN })) {
  if (!v) { console.error(`❌ .env-এ ${k} দিন (টেলিগ্রাম-সেশন ব্যাকফিলে লাগে না)`); process.exit(1) }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const mb = (b: number) => (b / 1048576).toFixed(1) + 'MB'

/* ── রিট্রাই-সাহায্যকারী (৪২৯/৫xx/নেটওয়ার্ক-ত্রুটিতে সূচকী-ব্যাকঅফ) ── */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 3): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const msg = e instanceof Error ? e.message : String(e)
      const retryable = /429|500|502|503|504|rate|quota|fetch failed|network|ECONN|timeout/i.test(msg)
      if (!retryable || i === tries - 1) break
      const wait = 1000 * 2 ** i
      console.log(`  ↻ ${label} ব্যর্থ (${msg.slice(0, 100)}) — ${wait / 1000}s পরে পুনঃচেষ্টা`)
      await sleep(wait)
    }
  }
  throw lastErr
}

function assertOk(res: Response, label: string): Response {
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}${res.status === 429 ? ' (rate-limit)' : ''}`)
  return res
}

/* ── গুগল-ড্রাইভ (index.ts-র মতোই — স্বয়ংসম্পূর্ণ CLI) ── */
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

/** ফোল্ডারে এই-নামের ফাইল থাকলে id (থাম্বনেইল-খোঁজায় ব্যবহৃত) */
async function driveFindFile(token: string, folderId: string, name: string): Promise<string | null> {
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`)
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json() as Promise<{ files?: { id: string }[] }>)
  return found.files?.[0]?.id || null
}

interface DrivePdf { id: string; name: string; size: number }

/** ফোল্ডারের সব PDF (পেজিনেশনসহ) — নাম-ক্রমে সাজানো */
async function driveListPdfs(token: string, folderId: string): Promise<DrivePdf[]> {
  const out: DrivePdf[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed = false`,
      fields: 'nextPageToken, files(id,name,size)',
      pageSize: '200',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const page = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => assertOk(r, 'files.list').json() as Promise<{ nextPageToken?: string; files?: { id: string; name: string; size?: string }[] }>)
    for (const f of page.files || []) out.push({ id: f.id, name: f.name, size: parseInt(f.size || '0', 10) || 0 })
    pageToken = page.nextPageToken
  } while (pageToken)
  out.sort((a, b) => a.name.localeCompare(b.name, 'bn'))
  return out
}

async function driveDownload(token: string, fileId: string): Promise<Uint8Array> {
  const res = await withRetry('ডাউনলোড', async () => {
    const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } })
    return assertOk(r, 'ডাউনলোড')
  })
  return new Uint8Array(await res.arrayBuffer())
}

/** হুবহু একই ফাইল-আইডিতে কনটেন্ট-রিপ্লেস (metadata/permission অক্ষুণ্ণ) */
async function driveReplaceInPlace(token: string, fileId: string, bytes: Uint8Array): Promise<{ id: string; size?: string }> {
  return withRetry('রিপ্লেস', async () => {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,size`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
      body: bytes as unknown as BodyInit,
    })
    const j = (await assertOk(res, 'রিপ্লেস').json()) as { id?: string; size?: string }
    if (!j.id) throw new Error('রিপ্লেস-উত্তরে id নেই')
    if (j.id !== fileId) throw new Error(`রিপ্লেস-আইডি-বৈষম্য (${j.id} ≠ ${fileId})`)
    return j as { id: string; size?: string }
  })
}

/* ── থাম্বনেইল রি-রেন্ডার (ক্লিন-পিডিএফের প্রথম-পাতা → একই থাম্ব-আইডিতে রিপ্লেস) ── */
async function refreshThumb(token: string, folderId: string, pdfName: string, cleanedBytes: Uint8Array): Promise<boolean> {
  try {
    const thumbName = pdfName.replace(/\.pdf$/i, '') + '.jpg'
    const thumbId = await driveFindFile(token, folderId, thumbName)
    if (!thumbId) return false // থাম্ব-নেই → কিছু-করার নেই
    const tag = Date.now()
    const tmpPdf = path.join(os.tmpdir(), `ep-bf-${tag}.pdf`)
    const tmpJpg = path.join(os.tmpdir(), `ep-bf-${tag}.jpg`)
    try {
      fs.writeFileSync(tmpPdf, cleanedBytes)
      const script = path.join(import.meta.dir, 'render-page.mjs')
      const r = spawnSync('node', [script, tmpPdf, tmpJpg, '1.1'], { cwd: import.meta.dir, timeout: 120000, encoding: 'utf8' })
      if (r.status !== 0 || !fs.existsSync(tmpJpg)) return false
      const jpg = new Uint8Array(fs.readFileSync(tmpJpg))
      if (!jpg.length || jpg.length > 4 * 1024 * 1024) return false
      await withRetry('থাম্ব-রিপ্লেস', async () => {
        const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${thumbId}?uploadType=media&fields=id`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' },
          body: jpg as unknown as BodyInit,
        })
        return assertOk(res, 'থাম্ব-রিপ্লেস')
      })
      console.log(`  🖼️ থাম্বনেইলও পরিষ্কার-ভার্সনে বদলানো হলো (${thumbName}, ${mb(jpg.length)})`)
      return true
    } finally {
      try { fs.unlinkSync(tmpPdf) } catch {}
      try { fs.unlinkSync(tmpJpg) } catch {}
    }
  } catch (e) {
    console.error('  ⚠️ থাম্বনেইল-রিফ্রেশ ব্যর্থ (প্রধান-কাজ অটুট):', e instanceof Error ? e.message : e)
    return false
  }
}

/* ── স্টেট (রিজিউম) — fileId → ফলাফল; 'clean'/'replaced' ফাইল আর-স্ক্যান হয় না (--force ব্যতীত) ── */
interface BackfillEntry { status: 'clean' | 'replaced'; streams: number; annots: number; bytes: number; name: string; at: string }
type BackfillState = Record<string, BackfillEntry>
function loadState(): BackfillState {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as BackfillState } catch { return {} }
}
function saveState(s: BackfillState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2))
}

/* ── প্রধান ── */
async function main(): Promise<void> {
  const mode = APPLY ? '🛠️ প্রয়োগ-মোড (--apply)' : '👁️ ড্রাই-রান (কিছু বদলাবে না — প্রয়োগ করতে --apply)'
  console.log(`🧹 রেট্রো-ক্লিন ব্যাকফিল — ${mode}${LIMIT ? ` (সীমা: ${LIMIT})` : ''}`)

  const token = await driveAccessToken()
  const folderId = await driveEnsureFolder(token)
  console.log('📁 ড্রাইভ-ফোল্ডার প্রস্তুত')

  const pdfs = await driveListPdfs(token, folderId)
  console.log(`📄 মোট PDF: ${pdfs.length}টি`)
  if (!pdfs.length) return

  const state = loadState()
  const results: Array<{ id: string; name: string; action: string; streams?: number; annots?: number; fromBytes?: number; toBytes?: number; error?: string }> = []
  const tally = { scanned: 0, skippedState: 0, alreadyClean: 0, wouldClean: 0, replaced: 0, thumbRefreshed: 0, errors: 0 }
  let processed = 0

  for (const [i, f] of pdfs.entries()) {
    if (LIMIT && processed >= LIMIT) { console.log(`⏹ সীমা ${LIMIT}-এ পৌঁছে থামলাম (বাকি ${pdfs.length - i}টি)`); break }
    const prev = state[f.id]
    if (prev && !FORCE && (prev.status === 'clean' || prev.status === 'replaced')) { tally.skippedState++; continue }
    processed++
    tally.scanned++
    const tag = `[${i + 1}/${pdfs.length}]`
    try {
      const bytes = await driveDownload(token, f.id)
      const report = await stripTelegramPromoLayerDetailed(Buffer.from(bytes))

      if (report.error) throw new Error('ক্লিনার-ত্রুটি: ' + report.error)
      if (!report.changed) {
        tally.alreadyClean++
        console.log(`${tag} ✅ পরিষ্কার — ${f.name} (${mb(bytes.length)})`)
        results.push({ id: f.id, name: f.name, action: 'clean' })
        if (APPLY) { state[f.id] = { status: 'clean', streams: 0, annots: 0, bytes: bytes.length, name: f.name, at: new Date().toISOString() }; saveState(state) }
        await sleep(300)
        continue
      }

      // ইন্টিগ্রিটি-গার্ড: ক্লিন-পিডিএফ খোলা যায় ও পাতা-সংখ্যা হুবহু এক
      const guard = await PDFDocument.load(report.buffer, { ignoreEncryption: true })
      if (guard.getPageCount() !== report.pages) {
        throw new Error(`ইন্টিগ্রিটি-গার্ড ব্যর্থ: পাতা ${guard.getPageCount()} ≠ মূল ${report.pages} — রিপ্লেস-বাতিল`)
      }

      if (!APPLY) {
        tally.wouldClean++
        console.log(`${tag} 🟠 প্রমো-পাওয়া গেছে — ${f.name}: স্ট্রিম ×${report.streams}, লিংক ×${report.annots} (${mb(bytes.length)}) → apply-মোডে রিপ্লেস হবে`)
        results.push({ id: f.id, name: f.name, action: 'would-clean', streams: report.streams, annots: report.annots, fromBytes: bytes.length })
        await sleep(300)
        continue
      }

      const cleanBytes = new Uint8Array(report.buffer)
      await driveReplaceInPlace(token, f.id, cleanBytes)
      tally.replaced++
      const thumbDone = await refreshThumb(token, folderId, f.name, cleanBytes)
      if (thumbDone) tally.thumbRefreshed++
      console.log(`${tag} 🧼 রিপ্লেস সম্পন্ন — ${f.name}: স্ট্রিম ×${report.streams}, লিংক ×${report.annots} (${mb(bytes.length)} → ${mb(cleanBytes.length)}; ফাইল-আইডি অপরিবর্তিত)`)
      results.push({ id: f.id, name: f.name, action: 'replaced', streams: report.streams, annots: report.annots, fromBytes: bytes.length, toBytes: cleanBytes.length })
      state[f.id] = { status: 'replaced', streams: report.streams, annots: report.annots, bytes: cleanBytes.length, name: f.name, at: new Date().toISOString() }
      saveState(state)
      await sleep(800) // আপলোডের পরে একটু বেশি বিরতি
    } catch (e) {
      tally.errors++
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`${tag} ❌ ${f.name}: ${msg}`)
      results.push({ id: f.id, name: f.name, action: 'error', error: msg })
    }
  }

  /* ── সারসংক্ষেপ ── */
  console.log('\n' + '─'.repeat(56))
  console.log(`📊 সারসংক্ষেপ (${APPLY ? 'প্রয়োগ' : 'ড্রাই-রান'}):`)
  console.log(`   স্ক্যান: ${tally.scanned} · স্টেট-স্কিপ: ${tally.skippedState} · ইতোমধ্যে-পরিষ্কার: ${tally.alreadyClean}`)
  if (APPLY) {
    console.log(`   রিপ্লেস: ${tally.replaced} · থাম্ব-রিফ্রেশ: ${tally.thumbRefreshed} · ত্রুটি: ${tally.errors}`)
  } else {
    console.log(`   প্রমোযুক্ত (apply-করলে রিপ্লেস হবে): ${tally.wouldClean}`)
    if (tally.wouldClean) console.log('   ▶ প্রয়োগ করতে: bun run backfill -- --apply')
  }

  try {
    fs.mkdirSync(QA_DIR, { recursive: true })
    const reportPath = path.join(QA_DIR, `backfill-report-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', at: new Date().toISOString(), tally, results }, null, 2))
    console.log(`📝 রিপোর্ট: ${path.relative(path.join(import.meta.dir, '..'), reportPath)}`)
  } catch { /* রিপোর্ট-লেখা ঐচ্ছিক */ }

  process.exit(tally.errors ? 1 : 0)
}

main().catch((e) => { console.error('ফেটাল:', e instanceof Error ? e.message : e); process.exit(1) })
