import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

/** POST /api/groups/[id]/members — জয়েন/লিভ টগল (Session K) */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const { id: groupId } = await params
  const group = await db.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) return NextResponse.json({ error: 'গ্রুপ পাওয়া যায়নি' }, { status: 404 })

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: me.id } },
  })

  let isMember: boolean
  if (existing) {
    // নির্মাতা (ADMIN) নিজের গ্রুপ ছাড়তে পারবেন না — গ্রুপটি তার পরিচয়
    if (existing.role === 'ADMIN') {
      const isCreator = (
        await db.group.findUnique({ where: { id: groupId }, select: { creatorId: true } })
      )?.creatorId
      if (isCreator === me.id) {
        return NextResponse.json(
          { error: 'আপনি এই গ্রুপের প্রশাসক — ছাড়া যাবে না' },
          { status: 400 }
        )
      }
    }
    await db.groupMember.delete({ where: { id: existing.id } })
    isMember = false
  } else {
    await db.groupMember.create({ data: { groupId, userId: me.id, role: 'MEMBER' } })
    isMember = true
  }

  const memberCount = await db.groupMember.count({ where: { groupId } })
  revalidatePath('/')
  return NextResponse.json({ isMember, memberCount })
}
