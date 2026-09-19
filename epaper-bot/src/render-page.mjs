/**
 * render-page.mjs — PDF-এর প্রথম-পাতা → JPEG (node-সাবপ্রসেস; bun-এ pdfjs+canvas-রেজলুশন-সমস্যা)
 * চালান: node render-page.mjs <pdf-path> <out-jpg-path> [scale]
 */
import { pdf } from 'pdf-to-img'
import fs from 'fs'

const [, , pdfPath, outPath, scaleArg] = process.argv
if (!pdfPath || !outPath) {
  console.error('usage: node render-page.mjs <pdf> <out.jpg> [scale]')
  process.exit(2)
}
const scale = Math.min(Math.max(parseFloat(scaleArg || '1.1'), 0.3), 3)
try {
  const doc = await pdf(pdfPath, { scale, format: 'jpg' })
  const buf = await doc.getPage(1)
  fs.writeFileSync(outPath, buf)
  console.log('rendered', outPath, buf.length + 'B')
  process.exit(0)
} catch (e) {
  console.error('render-error:', e && e.message ? e.message : e)
  process.exit(1)
}
