/**
 * test-cleaner.ts — stripTelegramPromoLayer-এর QA (session173)
 *
 * চ্যানেল-পিডিএফ-কাঠামোর অনুকরণ:
 *   পাতা ১: মূল-কনটেন্ট-স্ট্রিম ("Editor: … Printed & Published …" — নিচের অংশ)
 *           + অ্যাপেন্ডেড প্রমো-স্ট্রিম (সবুজ "For More PDFs Join … t.me/ePaperXpress")
 *           + t.me লিংক-অ্যানোটেশন + একটি বৈধ-URI অ্যানোটেশন
 *   পাতা ২: শুধু মূল-কনটেন্ট (প্রমোহীন — অক্ষত থাকা প্রমাণে)
 *
 * যাচাই: ① t.me-অ্যানোটেশন বাদ, বৈধ-অ্যানোটেশন অটুট ② প্রমো-স্ট্রিম বাদ, মূল-স্ট্রিম অটুট
 *        ③ নো-প্রমো পিডিএফে পূর্ণ-নো-অপ (বাইট-অপরিবর্তিত) ④ before/after রেন্ডার
 * চালান: bun run src/test-cleaner.ts
 */
import { PDFDocument, StandardFonts, rgb, PDFName, PDFRawStream, PDFString } from 'pdf-lib'
import zlib from 'zlib'
import fs from 'fs'
import path from 'path'
import { stripTelegramPromoLayer } from './cleaner'

async function buildDirtyPdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  /* ── পাতা ১ ── */
  const p1 = pdf.addPage([595, 842])
  p1.drawText('DAILY NEWS — Page One', { x: 50, y: 780, size: 22, font: bold, color: rgb(0.05, 0.05, 0.05) })
  p1.drawText('Metropolis Report: City wakes to a fresh morning...', { x: 50, y: 740, size: 11, font, color: rgb(0.15, 0.15, 0.15) })
  // মূল-প্রিন্ট-তথ্য (নিচের অংশ — প্রমো-স্ট্যাম্পে ঢাকা পড়বে)
  p1.drawText('Editor: Taslima Hosen. Printed & Published by Lekhok Press Ltd.', { x: 50, y: 46, size: 10, font, color: rgb(0.1, 0.1, 0.1) })
  p1.drawText('Compositor: M. Karim. All rights reserved.', { x: 50, y: 32, size: 10, font, color: rgb(0.1, 0.1, 0.1) })

  // মূল-স্ট্রিমের রেফ + ফন্ট-কি (প্রমো-অপসে একই ফন্ট-রিসোর্স ব্যবহার করব)
  const origContentsRef = p1.node.get(PDFName.of('Contents')) as any
  const resources: any = pdf.context.lookup(p1.node.get(PDFName.of('Resources')) as any)
  const fontDict: any = pdf.context.lookup(resources.get(PDFName.of('Font')))
  const fontKey = (fontDict.entries()[0][0] as PDFName).toString() // যেমন "/F1"

  /* ── অ্যাপেন্ডেড প্রমো-স্ট্রিম (সবুজ স্ট্যাম্প — মূল-লেখার ওপরে) ── */
  const promoOps =
    `q 0 0 120 90 re W n BT ${fontKey} 13 Tf 0.09 0.55 0.29 rg 40 42 Td 12 TL` +
    ` (For More PDFs Join Our TG Channel https://t.me/ePaperXpress) Tj ET Q`
  const compressed = zlib.deflateSync(Buffer.from(promoOps, 'latin1'))
  const promoStream = PDFRawStream.of(
    pdf.context.obj({ Filter: 'FlateDecode', Length: compressed.length }),
    compressed,
  )
  const promoRef = pdf.context.register(promoStream)
  // আসল-চ্যানেল-মার্কারের মতোই: বিদ্যমান Contents-অ্যারের শেষে প্রমো-স্ট্রিম অ্যাপেন্ড
  const cRef = p1.node.get(PDFName.of('Contents')) as any
  const cObj: any = pdf.context.lookup(cRef)
  if (cObj && typeof cObj.push === 'function' && typeof cObj.size === 'function') {
    cObj.push(promoRef) // Contents ইতিমধ্যে অ্যারে — স্ট্রিম-অ্যাপেন্ড (Appended Content Stream)
  } else {
    p1.node.set(PDFName.of('Contents'), pdf.context.obj([cRef, promoRef]))
  }

  /* ── অ্যানোটেশন: t.me (প্রমো) + বৈধ-নিউজ-URI ── */
  const promoAnnot = pdf.context.obj({
    Type: 'Annot', Subtype: 'Link', Rect: [35, 32, 420, 55], Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of('https://t.me/ePaperXpress') },
  })
  const legitAnnot = pdf.context.obj({
    Type: 'Annot', Subtype: 'Link', Rect: [400, 760, 540, 780], Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of('https://prothomalo.com') },
  })
  p1.node.set(PDFName.of('Annots'), pdf.context.obj([pdf.context.register(promoAnnot), pdf.context.register(legitAnnot)]))

  /* ── পাতা ২: প্রমোহীন ── */
  const p2 = pdf.addPage([595, 842])
  p2.drawText('DAILY NEWS — Page Two (clean)', { x: 50, y: 780, size: 20, font: bold, color: rgb(0.05, 0.05, 0.05) })
  p2.drawText('Sports: The national team clinched the series...', { x: 50, y: 740, size: 11, font, color: rgb(0.15, 0.15, 0.15) })

  return Buffer.from(await pdf.save())
}

async function buildCleanPdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const p = pdf.addPage([595, 842])
  p.drawText('Ordinary single-stream PDF without any promo layer.', { x: 50, y: 700, size: 12, font })
  return Buffer.from(await pdf.save())
}

async function renderFirst(buf: Buffer, outPath: string): Promise<void> {
  const { pdf } = await import('pdf-to-img')
  const doc = await pdf(buf, { scale: 1.4 })
  let i = 0
  for await (const img of doc) {
    fs.writeFileSync(outPath.replace('.png', `-p${++i}.png`), img)
    if (i >= 2) break
  }
}

async function main() {
  const dir = path.join(import.meta.dir, '..', '.qa')
  fs.mkdirSync(dir, { recursive: true })

  /* ── টেস্ট ১: প্রমো-পিডিএফ ক্লিন ── */
  const dirty = await buildDirtyPdf()
  fs.writeFileSync(path.join(dir, 'dirty.pdf'), dirty)
  console.log('◆ dirty.pdf:', dirty.length, 'bytes')

  const clean = await stripTelegramPromoLayer(dirty)
  fs.writeFileSync(path.join(dir, 'clean.pdf'), clean)
  console.log('◆ clean.pdf:', clean.length, 'bytes', clean !== dirty ? '(পরিবর্তিত ✓)' : '(অপরিবর্তিত ✗!)')

  const doc = await PDFDocument.load(clean)
  let ok = true
  for (const [pi, page] of doc.getPages().entries()) {
    const contents = doc.context.lookup(page.node.get(PDFName.of('Contents') as any) as any) as any
    const size = contents instanceof (await import('pdf-lib')).PDFArray ? contents.size() : 1
    const annots = page.node.get(PDFName.of('Annots'))
    const annotArr = annots ? (doc.context.lookup(annots as any) as any) : null
    const annotCount = annotArr && typeof annotArr.size === 'function' ? annotArr.size() : annots ? 1 : 0
    const annotUris: string[] = []
    if (annotArr && typeof annotArr.size === 'function') {
      for (let i = 0; i < annotArr.size(); i++) {
        const a: any = doc.context.lookup(annotArr.get(i))
        const act: any = a && a.get ? doc.context.lookup(a.get(PDFName.of('A'))) : null
        const uri = act && act.get ? String(act.get(PDFName.of('URI')) || '').replace(/^\(|\)$/g, '') : ''
        annotUris.push(uri)
      }
    }
    console.log(`◆ পাতা ${pi + 1}: কনটেন্ট-স্ট্রিম=${size}, অ্যানোটেশন=${annotCount}${annotUris.length ? ' [' + annotUris.join(' | ') + ']' : ''}`)
    if (pi === 0 && size !== 1) { ok = false; console.error('  ✗ প্রমো-স্ট্রিম বাদ হয়নি!') }
    if (pi === 0 && annotUris.some((u) => /t\.me|ePaper/i.test(u))) { ok = false; console.error('  ✗ t.me-অ্যানোটেশন রয়ে গেছে!') }
    if (pi === 0 && !annotUris.includes('https://prothomalo.com')) { ok = false; console.error('  ✗ বৈধ-অ্যানোটেশন হারিয়ে গেছে!') }
    if (pi === 1 && size !== 1) { ok = false; console.error('  ✗ প্রমোহীন-পাতার স্ট্রিম নষ্ট হয়েছে!') }
  }

  /* ── টেস্ট ২: নো-প্রমো পিডিএফ = পূর্ণ-নো-অপ ── */
  const plain = await buildCleanPdf()
  const plainOut = await stripTelegramPromoLayer(plain)
  if (plainOut !== plain) { ok = false; console.error('✗ নো-প্রমো পিডিএফে নো-অপ হয়নি (বাইট বদলেছে)') }
  else console.log('◆ নো-প্রমো পিডিএফ: নো-অপ ✓ (মূল-বাফার অপরিবর্তিত)')

  /* ── রেন্ডার-তুলনা ── */
  try {
    await renderFirst(dirty, path.join(dir, 'before.png'))
    await renderFirst(clean, path.join(dir, 'after.png'))
    console.log('◆ রেন্ডার: .qa/before-p*.png বনাম .qa/after-p*.png')
  } catch (e) {
    console.log('↷ রেন্ডার-স্কিপ:', e instanceof Error ? e.message : e)
  }

  console.log(ok ? '🎉 সব টেস্ট পাস' : '💥 ব্যর্থ')
  process.exit(ok ? 0 : 1)
}

main().catch((e) => { console.error('ফেটাল:', e); process.exit(1) })
