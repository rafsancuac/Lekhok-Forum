import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { notify } from '@/lib/notify'

const VALID = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD']

/** POST /api/comments/[commentId]/reactions — কমেন্ট রিঅ্যাকশন টগল */
export async function POST(req: NextRequest, ctx: { params: Promise<{ commentId: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { commentId } = await ctx.params

  const { type } = await req.json()
  if (!VALID.includes(type)) {
    return NextResponse.json({ error: 'অবৈধ রিঅ্যাকশন' }, { status: 400 })
  }

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) return NextResponse.json({ error: 'কমেন্ট পাওয়া যায়নি' }, { status: 404 })

  const existing = await db.commentReaction.findUnique({
    where: { commentId_userId: { commentId, userId: me.id } },
  })

  if (existing && existing.type === type) {
    await db.commentReaction.delete({ where: { id: existing.id } })
  } else if (existing) {
    await db.commentReaction.update({ where: { id: existing.id }, data: { type } })
  } else {
    await db.commentReaction.create({ data: { commentId, userId: me.id, type } })
    // কমেন্ট লেখককে নোটিফিকেশন
    await notify({
      actorId: me.id,
      recipientId: comment.authorId,
      type: 'REACTION',
      postId: comment.postId,
      commentId,
    })
  }

  const rows = await db.commentReaction.findMany({ where: { commentId } })
  const counts: Record<string, number> = {}
  let myReaction: string | null = null
  for (const r of rows) {
    counts[r.type] = (counts[r.type] || 0) + 1
    if (r.userId === me.id) myReaction = r.type
  }

  return NextResponse.json({
    ok: true,
    reactionCounts: counts,
    reactionTotal: rows.length,
    myReaction,
  })
}
