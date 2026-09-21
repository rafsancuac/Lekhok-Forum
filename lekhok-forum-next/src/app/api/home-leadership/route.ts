/**
 * পাবলিক হোম-নেতৃত্ব-স্লট API — হোমপেজের নেতৃত্ব-সেকশনের একমাত্র ডাটা-সোর্স
 *
 * GET /api/home-leadership → ৮-স্লট (slotKey, section, name, role, term, quote, imageUrl)
 * খালি-স্লট (name="") ফ্রন্টএন্ডে রেন্ডার-ই হয় না — তাই পাবলিক-ভিউতে কোনো
 * "সদস্য বসেনি" সতর্কবার্তা আসার প্রশ্নই নেই।
 * force-dynamic: অ্যাডমিন-প্যানেলে সেভ করলেই হোমপেজে সাথে-সাথে দেখা যায় (হুবহু-সিঙ্ক)।
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** প্রদর্শন-ক্রম স্থির — অ্যাডমিন প্যানেলের হোয়াইটলিস্ট-ক্রমের সমান */
const SLOT_ORDER = [
  'founder_president',
  'founder_general_secretary',
  'founding_advisor_1',
  'founding_advisor_2',
  'current_president',
  'current_general_secretary',
  'current_advisor_1',
  'current_advisor_2',
] as const

export async function GET() {
  try {
    const rows = await db.homeLeadershipSlot.findMany()
    const byKey = new Map(rows.map((r) => [r.slotKey, r]))
    const slots = SLOT_ORDER.map((slotKey) => {
      const r = byKey.get(slotKey)
      return {
        slotKey,
        section: r?.section ?? (slotKey.startsWith('current_') ? 'CURRENT' : 'FOUNDING'),
        name: r?.name ?? '',
        role: r?.role ?? '',
        term: r?.term ?? '',
        quote: r?.quote ?? '',
        imageUrl: r?.imageUrl ?? '',
      }
    })
    return NextResponse.json({ slots }, { status: 200 })
  } catch (error) {
    console.error('home-leadership:publicGET', error)
    return NextResponse.json({ error: 'লোড ব্যর্থ' }, { status: 500 })
  }
}
