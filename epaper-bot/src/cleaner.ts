/**
 * cleaner.ts — টেলিগ্রাম-চ্যানেল-প্রমো-লেয়ার ক্লিনার v2 (session173→175, ইউজার-স্পেক)
 *
 * আসল-চ্যানেল-পিডিএফ-জরিপে (session175) তিন-রকম প্রমো-কাঠামো পাওয়া গেছে:
 *   ① অ্যাপেন্ডেড কনটেন্ট-স্ট্রিম (Contents-অ্যারের শেষ-স্ট্রিম) + ক্লিকযোগ্য লিংক-অ্যানোটেশন
 *   ② একক-বড়-স্ট্রিমের টেইলে ভেক্টর-টেক্সট-ব্লক (BT…ET সিরিজ — "For More PDFs Join Our
 *      TG Channel Https://t_me/ePaperXpress" — শব্দ-ভাগ-করা, Foxit-OCR-স্তরের-পরে)
 *   ③ পূর্ণ-পাতা-র‌্যাস্টার-ইমেজের (JPEG) নিচের সাদা-মার্জিনে বেক-করা সবুজ-ব্যানার
 *      (পিক্সেল — প্রথম আলো/দিনকাল/করতোয়া/নিউ এজ সবাই এ-শ্রেণিতে)
 *
 * v2-পাস: ① অ্যারে-স্ট্রিম-বাদ ② অ্যানোটেশন-বাদ ③ ভেক্টর-টেইল-ব্লক-কাট (y-ব্যান্ড-গার্ডে
 * আশেপাশের শব্দ-ব্লকসহ) ④ র‌্যাস্টার-সবুজ-ব্যান্ড-শনাক্ত করে সাদা-কভার (শুধু ব্যান্ড-সারি —
 * ক্লাস্টার-উচ্চতা ≤৩% গার্ডে বিজ্ঞাপন/ছবির সবুজ কখনো ধরা পড়ে না)।
 *
 * v3-পাস-৪ (session179 — ইউজার-অভিযোগ "লিংক সরেছে তবে কোয়ালিটি নষ্ট হয়ে গেছে"): র‌্যাস্টার-ব্যান্ড
 * এখন লসলেস — পূর্ণ-পাতা-JPEG আর q80-রি-এনকোড হয় না (এটাই ছোট-অক্ষর ঝাপসা করত)। ব্যানার-ব্যান্ড
 * শুধু শনাক্ত হয় (পড়া-শুধু), তারপর পাতার কনটেন্ট-স্ট্রিমের শেষে সাদা-আয়ত-স্ট্রিম যোগ (ইমেজের ওপরে
 * আঁকা) — মূল-JPEG-বাইট হুবহু অক্ষত; /LF EP3 মার্কারে পুনঃপ্রক্রিয়া রোধ; ঘূর্ণিত-ম্যাট্রিক্সে পিক্সেল-ফলব্যাক।
 *
 * ব্যর্থতায় সর্বদা মূল-বাফার ফেরত — প্রধান-প্রবাহ অটুট।
 */
import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFRef,
  PDFNumber,
  PDFRawStream,
  decodePDFRawStream,
} from 'pdf-lib'
import zlib from 'zlib'
import { createCanvas, loadImage } from '@napi-rs/canvas'

/** প্রমো-মার্কার (নরমালাইজ্ড-লোয়ারকেস) — এর-যেকোনো-একটি থাকলেই প্রমো */
const PROMO_MARKERS = [
  't.me/',
  'telegram.me',
  'epaperxpress',
  'for more pdfs',
  'join our',
  'join us',
  'telegram channel',
]

/** টেক্সট-নরমালাইজ: লোয়ারকেস + t_me→t.me (নিউ-এজ-স্টাইল ভ্যারিয়েন্ট) */
function normText(t: string): string {
  return t.toLowerCase().replace(/t_me/g, 't.me')
}

function isPromoText(text: string): boolean {
  const low = normText(text)
  return PROMO_MARKERS.some((m) => low.includes(m))
}

/** স্ট্রিম-বাইট ডিকোড করে latin1-টেক্সট (Flate/LZW সামলায়) — ব্যর্থে খালি স্ট্রিং */
function streamText(stream: PDFRawStream): string {
  try {
    const decoded = decodePDFRawStream(stream).decode()
    return Buffer.from(decoded).toString('latin1')
  } catch {
    try {
      return Buffer.from(stream.contents).toString('latin1')
    } catch {
      return ''
    }
  }
}

/* ══════════ পাস-৩: ভেক্টর-টেইল-ব্লক-কাট (নিউ-এজ-কাঠামো) ══════════ */

interface TailBlock { start: number; end: number; text: string; y: number | null }

/** BT…ET-ব্লক সংগ্রহ (ফ্ল্যাট — নেস্টেড-নয়) */
function collectTailBlocks(text: string): TailBlock[] {
  const out: TailBlock[] = []
  const re = /BT[\s\S]*?ET/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const seg = m[0]
    // ব্লকের স্ট্রিং-অপারেন্ড (লিটারেল) — বেসিক-আনএস্কেপ
    const strs: string[] = []
    const sre = /\((?:\\.|[^\\()])*?\)/g
    let sm: RegExpExecArray | null
    while ((sm = sre.exec(seg))) {
      strs.push(sm[0].slice(1, -1).replace(/\\([nrtbf()\\])/g, (_, c: string) => (
        { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' } as Record<string, string>)[c] || c
      ))
    }
    // Tm-এর y (৬ষ্ঠ-উপাদান)
    const tm = seg.match(/([-\d.]+)\s+([-\d.]+)\s+Tm[\s\S]*?Tf/)
    const y = tm ? parseFloat(tm[2]) : null
    out.push({ start: m.index, end: m.index + seg.length, text: strs.join(' '), y })
  }
  return out
}

/**
 * একক-স্ট্রিমের ভেতর থেকে প্রমো-টেক্সট-ব্লক (ও y-ব্যান্ডের প্রতিবেশী শব্দ-ব্লক) কাটে।
 * গার্ড: কাটা-অংশের সম্মিলিত-টেক্সটে মার্কার থাকতেই হবে; স্প্যান ≤৪০ ব্লক; |Δy| ≤ ৪০।
 * ফেরত: কাটা-টেক্সট ও কাটা-ব্লক-সংখ্যা (কিছু-কাটা-না-হলে cut=0, text=আসল)।
 */
function cutPromoTailBlocks(text: string): { text: string; cut: number } {
  const blocks = collectTailBlocks(text)
  if (!blocks.length) return { text, cut: 0 }
  const matched = new Set<number>()
  blocks.forEach((b, i) => { if (b.text && isPromoText(b.text)) matched.add(i) })
  if (!matched.size) return { text, cut: 0 }

  // প্রতিবেশী-বিস্তার: ম্যাচড-ব্লকের y-ব্যান্ডে ছোট-টেক্সট-ব্লক ("For", "More"… আলাদা-ব্লক শব্দ)
  const cut = new Set<number>(matched)
  let grew = true
  while (grew && cut.size < 40) {
    grew = false
    const idx = [...cut]
    for (const i of idx) {
      for (const j of [i - 1, i + 1]) {
        if (j < 0 || j >= blocks.length || cut.has(j)) continue
        const b = blocks[j], a = blocks[i]
        const simple = b.text.length > 0 && b.text.length <= 60 && !/\b(re|Do|BI|sh)\b/.test(text.slice(b.start + 2, b.end - 2))
        // y-গার্ড: প্রমো-স্ট্যাম্প পাতার একদম-নিচের-বেল্টে (absolute y ≤ ৬০) + প্রতিবেশী-ব্লকের-সাথে কাছাকাছি
        const sameBand = a.y != null && b.y != null && Math.abs(a.y - b.y) <= 40 && a.y <= 60 && b.y <= 60
        if (simple && sameBand) { cut.add(j); grew = true }
      }
    }
  }
  if (cut.size < 2) return { text, cut: 0 } // একক-ব্লক-ম্যাচ = সন্দেহজনক → নিরাপদ-নো-অপ

  const sorted = [...cut].sort((a, b) => a - b)
  const joined = sorted.map((i) => blocks[i].text).join(' ')
  if (!isPromoText(joined)) return { text, cut: 0 } // চূড়ান্ত-গার্ড

  // কাটা-স্প্যান বাদ দিয়ে টেক্সট গোছানো
  let out = ''
  let pos = 0
  for (const i of sorted) {
    out += text.slice(pos, blocks[i].start)
    pos = blocks[i].end
  }
  out += text.slice(pos)
  return { text: out, cut: cut.size }
}

/* ══════════ পাস-৪: র‌্যাস্টার-সবুজ-ব্যান্ড (v3: লসলেস-ওভারলে + পিক্সেল-ফলব্যাক) ══════════ */

/** v3: পাতার কনটেন্ট-স্ট্রিম-অনুক্রমের শেষে সাদা-আয়ত-ওভারলে-স্ট্রিম যোগ (মূল-স্ট্রিম-বাইট অক্ষত) */
function appendWhiteOverlay(pdfDoc: PDFDocument, page: { node: { get: (n: PDFName) => any; set: (n: PDFName, v: any) => void } }, opsStr: string): void {
  const ctx = pdfDoc.context
  const overlayRef = ctx.register(ctx.flateStream(opsStr, { LF: PDFName.of('EP3') })) // /LF EP3 = ওভারলে-মার্কার
  const contentsRef = page.node.get(PDFName.of('Contents'))
  const existing = ctx.lookup(contentsRef)
  if (existing instanceof PDFArray) {
    existing.push(overlayRef)
    return
  }
  if (!existing) return // Contents-লক্ষ্য অনুপস্থিত — নিরাপদ-নো-অপ
  const baseRef = contentsRef instanceof PDFRef ? contentsRef : ctx.register(existing) // ডিরেক্ট-স্ট্রিম বিরল-কেস
  const arr = PDFArray.withContext(ctx)
  arr.push(baseRef)
  arr.push(overlayRef)
  page.node.set(PDFName.of('Contents'), arr)
}

/**
 * v3 (session179-ফিক্স): কনটেন্ট-স্ট্রিম ওয়াক করে প্রতিটি /Name Do-এর সম্পূর্ণ CTM সংগ্রহ।
 * আগের-regex শুধু Do-এর ঠিক-আগের একটি cm ধরত — স্ট্যাক্ড-cm (স্কেল+ট্রান্সলেট) সামলাতে
 * q/Q-স্তূপসহ ক্রমিক cm-গুণন; ফর্মা: CTM' = cm × CTM (PDF §8.3.2); BI…EI স্কিপ।
 */
function collectImagePlacements(text: string): Map<string, number[]> {
  const placements = new Map<string, number[]>() // ইমেজ-নাম (slash-বিহীন) → CTM [a,b,c,d,e,f]
  const stack: number[][] = []
  let ctm = [1, 0, 0, 1, 0, 0]
  const mul = (cm: number[], c: number[]): number[] => [
    cm[0] * c[0] + cm[1] * c[2],
    cm[0] * c[1] + cm[1] * c[3],
    cm[2] * c[0] + cm[3] * c[2],
    cm[2] * c[1] + cm[3] * c[3],
    cm[4] * c[0] + cm[5] * c[2] + c[4],
    cm[4] * c[1] + cm[5] * c[3] + c[5],
  ]
  const re = /(BI[\s\S]*?EI)|(\bq\b)|(\bQ\b)|([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+cm|\/([^\s/\[\]<>(){}]+)\s+Do/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m[1]) continue // ইনলাইন-ইমেজ — ভেতরের-টোকেন নয়
    if (m[2]) { stack.push(ctm.slice()); continue }
    if (m[3]) { ctm = stack.pop() || [1, 0, 0, 1, 0, 0]; continue }
    if (m[4] !== undefined) {
      ctm = mul(m.slice(4, 10).map(Number), ctm)
      continue
    }
    if (m[10]) placements.set(m[10], ctm.slice())
  }
  return placements
}

interface BandHit { top: number; bottom: number }

/** ছবির নিচের ১৫%-এ প্রমো-সবুজ-ব্যান্ড খোঁজা — নিচের-দিকের-শেষ-ক্লাস্টার (উচ্চতা ≤৩% গার্ড) */
function findPromoBand(data: Uint8Array|Uint8ClampedArray, W: number, H: number, y0: number): BandHit | null {
  const winH = H - y0
  const rows: number[] = []
  for (let y = 0; y < winH; y++) {
    let g = 0
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4
      const r = data[i], gg = data[i + 1], b = data[i + 2]
      if (gg > 70 && gg < 190 && r < gg * 0.55 && b < gg * 0.8) g++
    }
    if (g > W / 150) rows.push(y) // সারিতে-যথেষ্ট সবুজ-পিক্সেল
  }
  if (!rows.length) return null
  // ক্লাস্টার (গ্যাপ-সহনশীল) — নিচের-দিকের-শেষ-সারি থেকে ওপরে হাঁটা
  const gapTol = Math.max(8, Math.round(H * 0.004))
  const bottom = rows[rows.length - 1]
  let top = bottom
  for (let i = rows.length - 2; i >= 0; i--) {
    if (rows[i + 1] - rows[i] <= gapTol) top = rows[i]
    else break
  }
  const height = bottom - top + 1
  if (height > H * 0.03) return null // ব্যানার-টেক্সট অত-লম্বা নয় — ছবি/বিজ্ঞাপন-বাদ
  const absTop = y0 + top, absBottom = y0 + bottom
  if (absBottom < H * 0.85) return null // নিচের-১৫%-অঞ্চলের-বাইরে-উল্লেখযোগ্য নয়
  return { top: absTop, bottom: absBottom }
}

/** পিক্সেল-কভার ফলব্যাক (v3: শুধু ঘূর্ণিত-ম্যাট্রিক্স-বিরল-কেসে) — DCT-ইমেজ-স্ট্রিমে ব্যানার-ব্যান্ড সাদা-করা */
async function coverDctImageBand(stream: PDFRawStream): Promise<boolean> {
  try {
    const raw = Buffer.from(stream.contents)
    const img = await loadImage(raw)
    const W = img.width, H = img.height
    if (!W || !H) return false
    const cv = createCanvas(W, H)
    const ctx = cv.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const y0 = Math.floor(H * 0.85)
    const data = ctx.getImageData(0, y0, W, H - y0).data
    const band = findPromoBand(data, W, H, y0)
    if (!band) return false
    const pad = Math.max(4, Math.round(H * 0.002))
    const top = Math.max(0, band.top - pad)
    const bh = Math.min(H, band.bottom + pad) - top
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, top, W, bh)
    const out = cv.toBuffer('image/jpeg', 80)
    ;(stream as any).contents = new Uint8Array(out)
    stream.dict.set(PDFName.of('Length'), PDFNumber.of(out.length))
    return true
  } catch {
    return false
  }
}

/* ══════════ মূল-রিপোর্ট ══════════ */

export interface PromoStripReport {
  /** ক্লিন-বাইট — কিছু-বদলাতে-না-হলে ওই-বাফারের-ই একই-রেফারেন্স (নো-অপ-শনাক্তকরণের চুক্তি) */
  buffer: Buffer
  /** যেকোনো-পাসে কিছু বদলাল true */
  changed: boolean
  /** বাদ-পড়া প্রমো-অ্যাপেন্ডেড-কনটেন্ট-স্ট্রিম (পাস-১) */
  streams: number
  /** বাদ-পড়া প্রমো-লিংক-অ্যানোটেশন (পাস-২) */
  annots: number
  /** কাটা ভেক্টর-টেইল-ব্লক (পাস-৩) */
  tailBlocks: number
  /** সাদা-কভার-হওয়া ইমেজ-ব্যান্ড (পাস-৪) */
  imagesCovered: number
  /** পিডিএফ-পাতার সংখ্যা */
  pages: number
  /** ব্যর্থতায় ত্রুটি-বার্তা (ব্যর্থতায় buffer = মূল-বাফার) */
  error?: string
}

export async function stripTelegramPromoLayerDetailed(inputPdfBuffer: Buffer): Promise<PromoStripReport> {
  try {
    const pdfDoc = await PDFDocument.load(inputPdfBuffer, { ignoreEncryption: true, updateMetadata: false })
    const pages = pdfDoc.getPages()
    let strippedStreams = 0
    let strippedAnnots = 0
    let tailBlocks = 0
    let imagesCovered = 0
    const doneImgRefs = new Set<string>()

    for (const page of pages) {
      /* ── পাস-২: ক্লিকযোগ্য প্রমো-লিংক-অ্যানোটেশন (সার্জিক্যাল — বৈধ-লিংক অটুট) ── */
      const annotsRef = page.node.get(PDFName.of('Annots'))
      if (annotsRef) {
        const annots = pdfDoc.context.lookup(annotsRef)
        if (annots instanceof PDFArray) {
          const keep: PDFRef[] = []
          for (let i = 0; i < annots.size(); i++) {
            const a = pdfDoc.context.lookup(annots.get(i))
            let promo = false
            const text = a instanceof PDFRawStream ? streamText(a) : a?.toString?.() || ''
            if (isPromoText(text)) promo = true
            if (!promo && a && typeof (a as any).get === 'function') {
              try {
                const act = pdfDoc.context.lookup((a as any).get(PDFName.of('A')))
                const uri = act && typeof (act as any).get === 'function'
                  ? String((act as any).get(PDFName.of('URI')) || '')
                  : ''
                if (uri && isPromoText(uri)) promo = true
                const dest = pdfDoc.context.lookup((a as any).get(PDFName.of('Dest')))
                if (!promo && dest instanceof PDFRawStream && isPromoText(streamText(dest))) promo = true
              } catch { /* গার্ডেড */ }
            }
            if (!promo && annots.get(i) instanceof PDFRef) keep.push(annots.get(i) as PDFRef)
          }
          if (keep.length < annots.size()) {
            strippedAnnots += annots.size() - keep.length
            if (keep.length) {
              const kept = PDFArray.withContext(pdfDoc.context)
              keep.forEach((r) => kept.push(r))
              page.node.set(PDFName.of('Annots'), kept)
            } else {
              page.node.delete(PDFName.of('Annots'))
            }
          }
        }
      }

      /* ── কনটেন্ট-স্ট্রিম-তালিকা (অ্যারে বা একক) ── */
      const contentsRef = page.node.get(PDFName.of('Contents'))
      if (!contentsRef) continue
      const contentsObj = pdfDoc.context.lookup(contentsRef)
      const streamRefs: any[] = []
      if (contentsObj instanceof PDFArray) {
        for (let i = 0; i < contentsObj.size(); i++) streamRefs.push(contentsObj.get(i))
      } else if (contentsObj) {
        streamRefs.push(contentsRef)
      }

      /* ── পাস-১: অ্যাপেন্ডেড প্রমো-স্ট্রিম (শেষ-প্রান্ত-স্ক্যান, মার্কার-গার্ডেড) ── */
      if (contentsObj instanceof PDFArray && contentsObj.size() > 1) {
        while (contentsObj.size() > 1) {
          const lastRef = contentsObj.get(contentsObj.size() - 1)
          const last = pdfDoc.context.lookup(lastRef)
          const text = last instanceof PDFRawStream ? streamText(last) : ''
          if (text && isPromoText(text)) {
            contentsObj.remove(contentsObj.size() - 1)
            strippedStreams++
          } else break
        }
      }

      /* ── পাস-৩: একক-স্ট্রিমের ভেক্টর-টেইল-ব্লক-কাট ── */
      for (const ref of streamRefs) {
        const s = pdfDoc.context.lookup(ref)
        if (!(s instanceof PDFRawStream)) continue
        const t = streamText(s)
        if (!t || !isPromoText(t)) continue
        const r = cutPromoTailBlocks(t)
        if (r.cut >= 2) {
          const compressed = zlib.deflateSync(Buffer.from(r.text, 'latin1'))
          ;(s as any).contents = new Uint8Array(compressed)
          s.dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'))
          s.dict.set(PDFName.of('Length'), PDFNumber.of(compressed.length))
          tailBlocks += r.cut
        }
      }

      /* ── পাস-৪: র‌্যাস্টার-সবুজ-ব্যান্ড — v3 লসলেস-ওভারলে (session179) ──
         পূর্ণ-পাতা-JPEG আর রি-এনকোড হয় না — sharp/canvas শুধু-পড়া-মোডে ব্যানার-ব্যান্ড শনাক্ত করে,
         কনটেন্ট-স্ট্রিমে সাদা-আয়ত-ওভারলে (ইমেজের ওপরে) — মূল-JPEG-বাইট হুবহু-অক্ষত = ১০০% কোয়ালিটি। */
      const mb = page.getMediaBox()
      const resRef = page.node.get(PDFName.of('Resources'))
      const res: any = resRef ? pdfDoc.context.lookup(resRef) : null
      const xoRef = res?.get ? res.get(PDFName.of('XObject')) : null
      const xo: any = xoRef ? pdfDoc.context.lookup(xoRef) : null
      if (xo && typeof xo.entries === 'function') {
        // ইতিমধ্যে-ওভারলেড-চিহ্ন (/LF EP3) — আগে-v3-ক্লিন হওয়া ফাইল পুনঃপ্রক্রিয়া হবে না
        let alreadyOverlaid = false
        for (const ref of streamRefs) {
          const s: any = pdfDoc.context.lookup(ref)
          if (s?.dict && typeof s.dict.get === 'function' && s.dict.get(PDFName.of('LF'))) { alreadyOverlaid = true; break }
        }
        let contentText = ''
        for (const ref of streamRefs) {
          const s = pdfDoc.context.lookup(ref)
          if (s instanceof PDFRawStream) contentText += streamText(s) + '\n'
        }
        const drawn = collectImagePlacements(contentText)
        const imgNames: Array<[string, any]> = []
        for (const [name, ref] of xo.entries()) imgNames.push([String(name), ref])
        const soleImage = imgNames.length === 1
        for (const [name, ref] of imgNames) {
          if (alreadyOverlaid) break // এ-পাতায় ওভারলে আছেই — র‌্যাস্টার-কাজ শেষ
          const key = String(ref)
          // session179-ফিক্স: xo-কী PDFName ('/Image…') — regex/ওয়াক-কী slash-বিহীন — নরমালাইজ
          const nameKey = String(name).replace(/^\//, '')
          const s: any = pdfDoc.context.lookup(ref)
          const dict = s?.dict || s
          if (!dict || typeof dict.get !== 'function') continue
          const filter = String(dict.get(PDFName.of('Filter')) || '')
          const subtype = String(dict.get(PDFName.of('Subtype')) || '')
          if (!/Image/.test(subtype)) continue
          const geo = drawn.get(nameKey)
          const fullPage = geo ? (Math.abs(geo[0]) >= mb.width * 0.5 && Math.abs(geo[3]) >= mb.height * 0.5) : soleImage
          if (!fullPage) continue
          if (!filter.includes('DCT')) continue // Flate-RGB-ইমেজ বাদ — এ-চ্যানেলে সব DCT
          try {
            const W = parseInt(dict.get(PDFName.of('Width')), 10)
            const H = parseInt(dict.get(PDFName.of('Height')), 10)
            if (!W || !H) continue
            const raw = Buffer.from(s.contents)
            const img = await loadImage(raw)
            const IW = img.width || W, IH = img.height || H
            const y0 = Math.floor(IH * 0.85)
            const cv = createCanvas(IW, IH - y0)
            const c2 = cv.getContext('2d')
            c2.drawImage(img, 0, -y0)
            const data = c2.getImageData(0, 0, IW, IH - y0).data
            const band = findPromoBand(data, IW, IH, y0)
            if (!band) continue
            const pad = Math.max(4, Math.round(IH * 0.002))
            const topPx = Math.max(0, band.top - pad)
            const botPx = Math.min(IH, band.bottom + pad)
            // অক্ষ-সংরেখিত-ম্যাট্রিক্স (b/c≈০, a/d>০) = নিরাপদ-লসলেস-ওভারলে-পথ
            const [A, B, C, D, E, F] = geo || [mb.width, 0, 0, mb.height, 0, 0]
            const axisOk = Math.abs(B) < Math.abs(A) * 0.01
              && Math.abs(C) < Math.abs(D) * 0.01
              && A > 0 && D > 0
            if (axisOk) {
              // ইমেজ-পিক্সেল(ওপর-বাম-উৎস) → PDF-ইউজার-স্পেস(নিচ-বাম-উৎস): y_pdf = f + d·(1 − px/H)
              const yTopPdf = F + D * (1 - topPx / IH)
              const yBotPdf = F + D * (1 - botPx / IH)
              if (A > 0 && yTopPdf - yBotPdf > 0 && Number.isFinite(yBotPdf)) {
                const ops = `q 1 1 1 rg ${E.toFixed(2)} ${yBotPdf.toFixed(2)} ${A.toFixed(2)} ${(yTopPdf - yBotPdf).toFixed(2)} re f Q\n`
                appendWhiteOverlay(pdfDoc, page, ops)
                imagesCovered++
              }
            } else {
              // ঘূর্ণিত/তির্যক ম্যাট্রিক্স বা cm-অজানা — বিরল: পিক্সেল-কভার-ফলব্যাক (প্রতি-ইমেজ-একবার)
              if (doneImgRefs.has(key)) continue
              if (await coverDctImageBand(s as PDFRawStream)) {
                imagesCovered++
                doneImgRefs.add(key)
              }
            }
          } catch { /* প্রতি-ইমেজ-গার্ডেড */ }
        }
      }
    }

    const changed = strippedStreams > 0 || strippedAnnots > 0 || tailBlocks > 0 || imagesCovered > 0
    if (!changed) {
      return { buffer: inputPdfBuffer, changed: false, streams: 0, annots: 0, tailBlocks: 0, imagesCovered: 0, pages: pages.length }
    }

    const cleanedBytes = await pdfDoc.save({ useObjectStreams: false })
    return {
      buffer: Buffer.from(cleanedBytes),
      changed: true,
      streams: strippedStreams,
      annots: strippedAnnots,
      tailBlocks,
      imagesCovered,
      pages: pages.length,
    }
  } catch (error) {
    return {
      buffer: inputPdfBuffer,
      changed: false,
      streams: 0,
      annots: 0,
      tailBlocks: 0,
      imagesCovered: 0,
      pages: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/** সরল-রূপ (session173-চুক্তি, index.ts ব্যবহার করে): রিপোর্ট-লগসহ শুধু বাফার ফেরত */
export async function stripTelegramPromoLayer(inputPdfBuffer: Buffer): Promise<Buffer> {
  const report = await stripTelegramPromoLayerDetailed(inputPdfBuffer)
  if (report.error) {
    console.error('⚠️ ওয়াটারমার্ক সরানোর সমস্যা — মূল ফাইল রাখা হলো:', report.error)
    return report.buffer
  }
  if (report.changed) {
    console.log(`✨ প্রমো-লেয়ার অপসারণ: ${report.streams}টি স্ট্রিম, ${report.annots}টি লিংক, ${report.tailBlocks}টি ভেক্টর-টেইল, ${report.imagesCovered}টি ইমেজ-ব্যান্ড (${report.pages} পাতা)`)
  }
  return report.buffer
}
