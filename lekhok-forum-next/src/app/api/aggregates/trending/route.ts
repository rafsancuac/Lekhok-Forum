import { NextResponse } from 'next/server'
import { getAggregates } from '@/lib/aggregates'

/**
 * session160 — GET /api/aggregates/trending
 *
 * ৭-দিনের আলোচিত লেখা (ক্যাশড — ক্রন-জব রিফ্রেশ করে; ঠান্ডা হলে চাহিদামতো হিসাব)।
 * উপস্থাপনযোগ্য টপ-৫ রিটার্ন করে।
 */
export async function GET() {
  try {
    const data = await getAggregates(15 * 60 * 1000)
    return NextResponse.json({
      computedAt: data.computedAt,
      windowDays: data.windowDays,
      posts: data.posts.slice(0, 5),
      authors: data.authors,
    })
  } catch {
    return NextResponse.json({ posts: [], authors: [] }, { status: 200 })
  }
}
