import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { notify } from '@/lib/notify'

/** POST /api/users/[username]/follow — ফলো/আনফলো টগল (Session H) */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const { username } = await params

  const target = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  })
  if (!target) return NextResponse.json({ error: 'লেখক পাওয়া যায়নি' }, { status: 404 })
  if (target.id === me.id) {
    return NextResponse.json({ error: 'নিজেকে ফলো করা যায় না' }, { status: 400 })
  }

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: me.id, followingId: target.id } },
    select: { id: true },
  })

  if (existing) {
    // আনফলো
    await db.follow.delete({ where: { id: existing.id } })
  } else {
    // ফলো (+ নোটিফিকেশন — মিউট/থ্রটল notify()-এই সামলানো)
    await db.follow.create({
      data: { followerId: me.id, followingId: target.id },
    })
    await notify({ actorId: me.id, recipientId: target.id, type: 'FOLLOW' })
  }

  const followers = await db.follow.count({ where: { followingId: target.id } })

  return NextResponse.json({
    following: !existing,
    followers,
  })
}
