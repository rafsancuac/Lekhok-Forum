import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { fetchGroupsForUser } from '@/lib/group-data'
import { revalidatePath } from 'next/cache'

/** GET /api/groups — আমার গ্রুপ + আবিষ্কার (Session K) */
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const { myGroups, discover } = await fetchGroupsForUser(me.id)
  return NextResponse.json({ myGroups, discover })
}

/** POST /api/groups — নতুন গ্রুপ তৈরি (নির্মাতা স্বয়ংক্রিয়ভাবে ADMIN সদস্য) */
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const description = String(body.description || '').trim() || null
    const privacy = ['OPEN', 'CLOSED'].includes(body.privacy) ? body.privacy : 'OPEN'

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: 'গ্রুপের নাম ২–৮০ অক্ষরের মধ্যে দিন' },
        { status: 400 }
      )
    }

    const group = await db.group.create({
      data: {
        name,
        description,
        privacy,
        coverUrl: body.coverUrl || null,
        creatorId: me.id,
        members: { create: { userId: me.id, role: 'ADMIN' } },
      },
    })

    revalidatePath('/')
    return NextResponse.json({ group: { id: group.id, name: group.name } }, { status: 201 })
  } catch (err) {
    console.error('Group create error:', err)
    return NextResponse.json({ error: 'গ্রুপ তৈরি ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
