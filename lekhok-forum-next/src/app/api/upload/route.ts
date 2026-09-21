import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { getCurrentUser } from '@/lib/session'

/**
 * POST /api/upload → মেসেঞ্জার ভয়েস/ছবি/ভিডিও আপলোড
 *
 * রেসপন্স চুক্তি (MessengerView.tsx-এর পাঠানো ফর্মের সাথে মিলে):
 *   { success: true, media: [{ url, type, name, size }], storage: 'disk' | 'inline' }
 *
 * তিন-স্তরের নিরাপত্তা-জাল (ক্লাউড-প্রিভিউ/আইফ্রেম-সেফ):
 * ১. সেশন: getCurrentUser() — session204 (Task 55)-এ ডেমো-ফলব্যাক অপসারণের
 *    পর এখানে স্পষ্ট 401-গার্ড বাধ্যতামূলক (anon ডিস্ক-রাইট বন্ধ);
 *    মেসেজ POST-এ আলাদা অনুমোদন আগের মতোই।
 * ২. ডিস্ক: public/uploads/{audio,images,videos}-এ লেখা — সফল হলে '/uploads/...' URL।
 * ৩. ফলব্যাক: রিড-ওনলি কনটেইনার (Vercel/স্যান্ডবক্স) হলে Base64 Data-URI —
 *    ব্রাউজার সরাসরি বাজবে, DB-তে স্থায়ী থাকবে (রিফ্রেশ-ধারণ ✓)।
 */

const MAX_BYTES = 15 * 1024 * 1024 // ১৫ MB/ফাইল
const MAX_FILES = 6

const EXT_BY_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/weba': 'weba',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
}

function mediaKind(mime: string): 'audio' | 'image' | 'video' | null {
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return null
}

export async function POST(req: NextRequest) {
  try {
    // ১) সেশন-গার্ড — লগইন-ছাড়া আপলোড নিষিদ্ধ (session204 নিরাপত্তা-সংশোধন)
    const me = await getCurrentUser()
    if (!me) {
      return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
    }

    const form = await req.formData().catch(() => null)
    if (!form) {
      return NextResponse.json({ error: 'ফর্ম-ডেটা পড়া যায়নি' }, { status: 400 })
    }

    const files = form.getAll('files').filter((f): f is File => f instanceof File)
    if (files.length === 0) {
      return NextResponse.json({ error: 'কোনো ফাইল পাওয়া যায়নি' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `একবারে সর্বোচ্চ ${MAX_FILES}টি ফাইল` },
        { status: 400 }
      )
    }

    const media: Array<{ url: string; type: 'AUDIO' | 'IMAGE' | 'VIDEO'; name: string; size: number }> = []
    let storage: 'disk' | 'inline' = 'disk'

    for (const file of files) {
      const kind = mediaKind(file.type || '')
      if (!kind) {
        return NextResponse.json(
          { error: `অসমর্থিত ফাইল-ধরন: ${file.type || 'অজানা'}` },
          { status: 415 }
        )
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `ফাইল খুব বড় (সর্বোচ্চ ${Math.round(MAX_BYTES / 1024 / 1024)} MB)` },
          { status: 413 }
        )
      }

      const bytes = Buffer.from(await file.arrayBuffer())
      const ext = EXT_BY_MIME[file.type] || (kind === 'audio' ? 'webm' : 'bin')
      const safeName = `${kind}-${Date.now()}-${randomBytes(4).toString('hex')}-${me.username.slice(0, 8)}.${ext}`
      const dbType = kind === 'audio' ? 'AUDIO' : kind === 'image' ? 'IMAGE' : 'VIDEO'
      const sub = kind === 'image' ? 'images' : kind === 'video' ? 'videos' : 'audio'

      // ২) ডিস্কে সেভ (প্রোডাকশন/লোকাল)
      try {
        const dir = path.join(process.cwd(), 'public', 'uploads', sub)
        await mkdir(dir, { recursive: true })
        await writeFile(path.join(dir, safeName), bytes)
        media.push({ url: `/uploads/${sub}/${safeName}`, type: dbType, name: safeName, size: bytes.length })
      } catch (fsErr) {
        // ৩) রিড-ওনলি ফাইল-সিস্টেম → Base64 Data-URI ফলব্যাক
        const fsCode = (fsErr as NodeJS.ErrnoException)?.code || (fsErr as Error)?.message
        console.warn('ডিস্ক-রাইট ব্যর্থ, Base64 ফলব্যাক:', fsCode)
        storage = 'inline'
        const inlineMime = kind === 'audio' ? 'audio/webm' : file.type
        media.push({
          url: `data:${inlineMime};base64,${bytes.toString('base64')}`,
          type: dbType,
          name: safeName,
          size: bytes.length,
        })
      }
    }

    return NextResponse.json({ success: true, storage, media })
  } catch (err) {
    console.error('Upload API error:', err)
    return NextResponse.json(
      { error: 'আপলোড প্রক্রিয়াকরণ ব্যর্থ', details: (err as Error)?.message },
      { status: 500 }
    )
  }
}
