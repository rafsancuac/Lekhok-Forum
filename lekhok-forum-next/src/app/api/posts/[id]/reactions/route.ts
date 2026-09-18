import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { REACTION_TYPES } from '@/lib/post-serializer'
import { notify } from '@/lib/notify'

/** POST /api/posts/[id]/reactions — রিঅ্যাকশন টগল (একই টাইপ আবার দিলে বাতিল) */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const { type } = await req.json()
  if (!REACTION_TYPES.includes(type)) {
    return NextResponse.json({ error: 'অবৈধ রিঅ্যাকশন' }, { status: 400 })
  }

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })

  const existing = await db.postReaction.findUnique({
    where: { postId_userId: { postId: id, userId: me.id } },
  })

  if (existing && existing.type === type) {
    await db.postReaction.delete({ where: { id: existing.id } })
  } else if (existing) {
    await db.postReaction.update({ where: { id: existing.id }, data: { type } })
  } else {
    await db.postReaction.create({ data: { postId: id, userId: me.id, type } })
    // পোস্ট লেখককে নোটিফিকেশন (নিজের পোস্টে নিজে নয়)
    await notify({ actorId: me.id, recipientId: post.authorId, type: 'REACTION', postId: id })
  }

  const total = await db.postReaction.count({ where: { postId: id } })
  const mine = await db.postReaction.findUnique({
    where: { postId_userId: { postId: id, userId: me.id } },
  })
  return NextResponse.json({ ok: true, total, myReaction: mine?.type ?? null })
}
