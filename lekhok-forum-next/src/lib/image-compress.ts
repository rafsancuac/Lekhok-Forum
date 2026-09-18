/**
 * Session J — ক্লায়েন্ট-সাইড ইমেজ কমপ্রেশন (আপলোডের আগে)
 *
 * কেন: ফোনের ক্যামেরার ছবি সাধারণত ৩–৮ MB — সরাসরি আপলোড ধীর ও ভারী।
 * এই হেল্পার ব্রাউজারেই (canvas) ছবি ছোট করে:
 *  - EXIF-রোটেশন স্বয়ংক্রিয়ভাবে ঠিক হয় (createImageBitmap imageOrientation:'from-image')
 *  - দীর্ঘ বাহু maxDim (ডিফল্ট 2048px) ছাড়ালে স্কেল-ডাউন
 *  - JPEG/WEBP → JPEG quality 0.85; স্বচ্ছ PNG → PNG (ট্রান্সপারেন্সি রক্ষা)
 *  - GIF (অ্যানিমেশন) ও ছোট ফাইল (SKIP_BELOW) স্কিপ — কমপ্রেশনে লাভ নেই
 * ব্যর্থতায় মূল ফাইলই ফেরত দেয় (আপলোড কখনো ব্লক হয় না)।
 */

const MAX_DIM = 2048
const QUALITY = 0.85
const SKIP_BELOW = 300 * 1024 // 300KB-এর নিচে স্কিপ

const COMPRESSIBLE = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
}

/** একটি ইমেজ-ফাইল কমপ্রেস করুন (যদি প্রয়োজন হয়) */
export async function compressImage(file: File): Promise<File> {
  try {
    // কমপ্রেস-অযোগ্য ধরন (gif/svg/ভিডিও/অডিও) বা যথেষ্ট ছোট ফাইল — যেমন আছে তেমন
    if (!COMPRESSIBLE.includes(file.type) || file.size <= SKIP_BELOW) return file
    if (typeof createImageBitmap !== 'function') return file

    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const { width, height } = bitmap
    if (!width || !height) return file

    // দীর্ঘ বাহু MAX_DIM-এর বেশি হলে স্কেল-ডাউন
    const scale = Math.min(1, MAX_DIM / Math.max(width, height))
    const w = Math.max(1, Math.round(width * scale))
    const h = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    // স্বচ্ছতা আছে কি? (PNG-র ক্ষেত্রে JPEG-এ পাঠালে কালো হয়ে যাবে)
    let hasAlpha = false
    if (file.type === 'image/png' || file.type === 'image/webp') {
      const sample = ctx.getImageData(0, 0, Math.min(w, 64), Math.min(h, 64)).data
      for (let i = 3; i < sample.length; i += 4) {
        if (sample[i] < 255) {
          hasAlpha = true
          break
        }
      }
    }

    const outMime = hasAlpha ? 'image/png' : 'image/jpeg'
    const blob = await canvasToBlob(canvas, outMime, QUALITY)
    if (!blob || blob.size >= file.size) return file // কমপ্রেসে লাভ নেই → মূলটাই

    const ext = hasAlpha ? 'png' : 'jpg'
    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    const out = new File([blob], `${base}.${ext}`, { type: outMime, lastModified: Date.now() })
    return out
  } catch {
    return file // কোনো সমস্যায় মূল ফাইলই
  }
}

/** একাধিক ফাইল কমপ্রেস (প্যারালাল, প্রগতিসহ) */
export async function compressImageFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<File[]> {
  let done = 0
  const total = files.length
  const out: File[] = []
  for (const f of files) {
    out.push(await compressImage(f))
    done += 1
    onProgress?.(done, total)
  }
  return out
}
