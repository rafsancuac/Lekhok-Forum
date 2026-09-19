/**
 * cleaner.ts — টেলিগ্রাম-চ্যানেল-প্রমো-লেয়ার ক্লিনার (session173, ইউজার-স্পেক)
 *
 * সমস্যা: @ePaperXpress-চ্যানেলের পিডিএফে প্রতি-পাতার নিচে সবুজ স্ট্যাম্প
 *          ("For More PDFs Join Our TG Channel — https://t.me/ePaperXpress")
 *          অতিরিক্ত কনটেন্ট-স্ট্রিম (Appended Content Stream) + ক্লিকযোগ্য
 *          লিংক-অ্যানোটেশন হিসেবে বসানো হয় → মূল প্রিন্ট-তথ্য ("সম্পাদক: …")
 *          ঢাকা পড়ে। আসল-লেখার লেয়ার তার নিচেই অক্ষত থাকে।
 *
 * সমাধান: ① প্রমো-URI-যুক্ত লিংক-অ্যানোটেশন সার্জিক্যাল-অপসারণ
 *          ② Contents-অ্যারের সর্বশেষ-যুক্ত স্ট্রিম ডিকোড করে প্রমো-মার্কার
 *             পেলে সেটিই বাদ (মার্কার-গার্ডেড — বৈধ মাল্টি-স্ট্রিম পিডিএফের
 *             আসল কনটেন্ট কখনো কাটবে না)
 *
 * ব্যর্থতায় সর্বদা মূল-বাফার ফেরত — প্রধান-প্রবাহ অটুট।
 */
import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFRef,
  PDFRawStream,
  decodePDFRawStream,
} from 'pdf-lib'

/** প্রমো-মার্কার (কেস-ইনসেনসিটিভ) — এর-যেকোনো-একটি থাকলেই স্ট্রিম/অ্যানোটেশন প্রমো */
const PROMO_MARKERS = [
  't.me/',
  'telegram.me',
  'epaperxpress',
  'for more pdfs',
  'join our',
  'join us',
  'telegram channel',
]

/** স্ট্রিম-বাইট ডিকোড করে latin1-টেক্সট (Flate/LZW সামলায়) — ব্যর্থে খালি স্ট্রিং */
function streamText(stream: PDFRawStream): string {
  try {
    const decoded = decodePDFRawStream(stream).decode()
    return Buffer.from(decoded).toString('latin1')
  } catch {
    try {
      // কাঁচা-বাইটেও মার্কার (URI-স্ট্রিং প্রায়ই প্লেইন-থাকে)
      return Buffer.from(stream.contents).toString('latin1')
    } catch {
      return ''
    }
  }
}

function isPromoText(text: string): boolean {
  const low = text.toLowerCase()
  return PROMO_MARKERS.some((m) => low.includes(m))
}

export async function stripTelegramPromoLayer(inputPdfBuffer: Buffer): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(inputPdfBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    })

    const pages = pdfDoc.getPages()
    let strippedStreams = 0
    let strippedAnnots = 0

    for (const page of pages) {
      // ── ১. টেলিগ্রাম-চ্যানেলের ক্লিকযোগ্য প্রমো-লিংক অ্যানোটেশন (সার্জিক্যাল) ──
      //      সব-অ্যানোটেশন নয় — শুধু t.me/telegram/ePaper-URI; বৈধ-লিংক অটুট
      const annotsRef = page.node.get(PDFName.of('Annots'))
      if (annotsRef) {
        const annots = pdfDoc.context.lookup(annotsRef)
        if (annots instanceof PDFArray) {
          const keep: PDFRef[] = []
          for (let i = 0; i < annots.size(); i++) {
            const a = pdfDoc.context.lookup(annots.get(i))
            let promo = false
            const text = a instanceof PDFRawStream ? streamText(a) : a?.toString?.() || ''
            // /URI (t.me|telegram|epaper) বা অ্যানোটেশন-ডিক্টের ভেতরেই মার্কার
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

      // ── ২. পাতার কনটেন্ট-স্ট্রিম থেকে অ্যাপেন্ডেড প্রমো-লেয়ার ──
      //      স্ট্যাম্প যোগ হলে Contents-অ্যারেতে সর্বশেষে নতুন-স্ট্রিম বসে;
      //      ডিকোড করে প্রমো-মার্কার পেলেই শুধু সেটিই বাদ (মার্কার-গার্ড)
      const contentsRef = page.node.get(PDFName.of('Contents'))
      if (!contentsRef) continue
      const contentsObj = pdfDoc.context.lookup(contentsRef)
      if (contentsObj instanceof PDFArray && contentsObj.size() > 1) {
        // শেষ-প্রান্ত থেকে স্ক্যান — সর্বশেষে-যুক্তগুলোই স্ট্যাম্প (একাধিক হলে সব-বাদ)
        while (contentsObj.size() > 1) {
          const lastRef = contentsObj.get(contentsObj.size() - 1)
          const last = pdfDoc.context.lookup(lastRef)
          const text = last instanceof PDFRawStream ? streamText(last) : ''
          if (text && isPromoText(text)) {
            contentsObj.remove(contentsObj.size() - 1)
            strippedStreams++
          } else {
            break // শেষ-স্ট্রিম প্রমো নয় → আর-কিছু ছোঁয়া নয়
          }
        }
      }
      // একক-স্ট্রিমে প্রমো মার্জ হয়ে থাকলে নিরাপদে বাদ-দেওয়া অসম্ভব — অক্ষত রাখা হয়
    }

    if (!strippedStreams && !strippedAnnots) {
      return inputPdfBuffer // কিছু-পাওয়া যায়নি → মূল-টাই রাখা (বাইট-অপরিবর্তিত)
    }

    const cleanedBytes = await pdfDoc.save({ useObjectStreams: false })
    console.log(`✨ প্রমো-লেয়ার অপসারণ: ${strippedStreams}টি স্ট্রিম, ${strippedAnnots}টি লিংক-অ্যানোটেশন (${pages.length} পাতা)`)
    return Buffer.from(cleanedBytes)
  } catch (error) {
    console.error('⚠️ ওয়াটারমার্ক সরানোর সমস্যা — মূল ফাইল রাখা হলো:', error instanceof Error ? error.message : error)
    return inputPdfBuffer
  }
}
