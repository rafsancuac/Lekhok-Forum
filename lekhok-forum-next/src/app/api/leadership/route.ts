/**
 * Session 189 — পাবলিক নেতৃত্ব-তালিকা (হোমপেজের LeadershipView-এর জন্য)
 *
 * GET /api/leadership → FOUNDING (নেতৃত্বের ধারা) + CURRENT (বর্তমান নেতৃত্ব)
 * order অনুসারে সাজানো; কোনো গার্ড নেই (সবাই দেখতে পায়)।
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const members = await db.leadershipMember.findMany({
      orderBy: [{ category: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        category: true,
        name: true,
        role: true,
        term: true,
        quote: true,
        imageUrl: true,
        order: true,
      },
    })
    return NextResponse.json(
      { members },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('leadership:publicGET', error)
    return NextResponse.json({ error: 'নেতৃত্ব-তালিকা লোড ব্যর্থ' }, { status: 500 })
  }
}
