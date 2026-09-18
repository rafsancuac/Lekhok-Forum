import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { fetchGroupDetail, canViewGroup } from '@/lib/group-data'

/** GET /api/groups/[id] — গ্রুপ বিস্তারিত (সদস্য-লিস্টসহ) */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const { id } = await params
  const detail = await fetchGroupDetail(id, me.id)
  if (!detail) return NextResponse.json({ error: 'গ্রুপ পাওয়া যায়নি' }, { status: 404 })

  // CLOSED গ্রুপ সদস্য না হলে পোস্ট-সংখ্যা/সদস্য-লিস্ট লিক হবে না
  if (!(await canViewGroup(id, me.id))) {
    return NextResponse.json({
      ...detail,
      members: [],
      posts: 0,
      locked: true,
    })
  }
  return NextResponse.json({ ...detail, locked: false })
}
