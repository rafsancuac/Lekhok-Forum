import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

function clean(s: string) {
  return s.replace(/<[^>]*>/g, '').trim().slice(0, 2000)
}

/** PATCH /api/posts/[id]/comments/[commentId] — নিজের কমেন্ট সম্পাদনা */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; commentId: string }> }
) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id, commentId } = await ctx.params

  const { content } = await req.json()
  const text = clean(String(content || ''))
  if (!text) return NextResponse.json({ error: 'কমেন্ট খালি হতে পারে না' }, { status: 400 })

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.postId !== id) {
    return NextResponse.json({ error: 'কমেন্ট পাওয়া যায়নি' }, { status: 404 })
  }
  if (comment.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের কমেন্ট সম্পাদনা করা যায়' }, { status: 403 })
  }

  const updated = await db.comment.update({
    where: { id: commentId },
    data: { content: text },
  })
  return NextResponse.json({
    ok: true,
    comment: { id: updated.id, content: updated.content, updatedAt: updated.updatedAt.toISOString() },
  })
}

/** DELETE /api/posts/[id]/comments/[commentId] — নিজের কমেন্ট ডিলিট (রিপ্লাই সহ) */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; commentId: string }> }
) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id, commentId } = await ctx.params

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.postId !== id) {
    return NextResponse.json({ error: 'কমেন্ট পাওয়া যায়নি' }, { status: 404 })
  }
  if (comment.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের কমেন্ট মুছা যায়' }, { status: 403 })
  }

  await db.comment.delete({ where: { id: commentId } })
  const count = await db.comment.count({ where: { postId: id } })
  return NextResponse.json({ ok: true, commentCount: count })
}
