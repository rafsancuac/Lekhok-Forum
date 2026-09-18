import { NextRequest, NextResponse } from 'next/server'
import { refreshAggregates } from '@/lib/aggregates'

/**
 * session160 — GET /api/cron/sync-aggregates (ইউজার-স্পেক: ১৫-মিনিটের ব্যাকগ্রাউন্ড-ক্রন)
 *
 * ভারী এনালিটিক্স (৭-দিনের আলোচিত-পোস্ট র‍্যাঙ্কিং + লেডারবোর্ড) ব্যাকগ্রাউন্ডে
 * হিসাব করে ক্যাশে জমা রাখে — ইউজার-ফেসিং রিকোয়েস্ট শুধু ক্যাশ পড়ে।
 *
 * Auth: `Authorization: Bearer $CRON_SECRET` (Vercel-Cron/বাহ্যিক-শিডিউলার-সামঞ্জস্য)
 * CRON_SECRET আনসেট থাকলে ৫০৩ (দুর্ঘটনাজন্য-মুক্ত-এন্ডপয়েন্ট-প্রতিরোধ)।
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET কনফিগার করা হয়নি — ক্রন-এন্ডপয়েন্ট অক্ষম' },
      { status: 503 }
    )
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  }

  try {
    const started = Date.now()
    const data = await refreshAggregates()
    return NextResponse.json({
      success: true,
      tookMs: Date.now() - started,
      windowDays: data.windowDays,
      postsRanked: data.posts.length,
      authorsRanked: data.authors.length,
      computedAt: data.computedAt,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'অজানা সমস্যা' },
      { status: 500 }
    )
  }
}
