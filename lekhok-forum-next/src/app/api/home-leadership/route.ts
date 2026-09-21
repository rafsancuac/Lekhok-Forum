/**
 * পাবলিক হোম-নেতৃত্ব কার্ড API — হোমপেজের নেতৃত্ব-সেকশনের একমাত্র ডাটা-সোর্স
 *
 * Task63: ডাইনামিক কার্ড (HomeLeaderCard) — স্থির ৮-স্লটের বদলে যত-খুশি কার্ড।
 *
 * GET /api/home-leadership → { cards: [{ id, category, name, role, term, quote, imageUrl, order }] }
 *   • শুধু isActive=true (অ্যাডমিন টগল-অন) কার্ড
 *   • শুধু নাম-আছে (name != "") কার্ড — অর্ধেক-ভরা কার্ড পাবলিকে কখনো যায় না
 *   • FOUNDING আগে, পরে CURRENT; প্রতিটির ভেতরে order-ক্রম
 *   • isActive=false মানে অ্যাডমিন লুকিয়ে রেখেছেন (যেমন: উপদেষ্টা নিয়োগ ঘোষণার আগে)
 * force-dynamic: অ্যাডমিন-প্যানেলে সেভ করলেই হোমপেজে সাথে-সাথে দেখা যায় (হুবহু-সিঙ্ক)।
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await db.homeLeaderCard.findMany({
      where: { isActive: true, name: { not: '' } },
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
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
    /* FOUNDING আগে — lexicographic-ক্রম নয়, অর্থবহ প্রদর্শন-ক্রম */
    const ordered = [...rows].sort((a, b) => {
      const rankOf = (c: string) => (c === 'FOUNDING' ? 0 : 1)
      return rankOf(a.category) - rankOf(b.category)
    })
    return NextResponse.json({ cards: ordered }, { status: 200 })
  } catch (error) {
    console.error('home-leadership:publicGET', error)
    return NextResponse.json({ error: 'লোড ব্যর্থ' }, { status: 500 })
  }
}
