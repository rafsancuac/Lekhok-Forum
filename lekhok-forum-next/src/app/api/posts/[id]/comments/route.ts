import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { notify } from '@/lib/notify'

function clean(s: string) {
  return s.replace(/<[^>]*>/g, '').trim().slice(0, 2000)
}

/** POST /api/posts/[id]/comments — কমেন্ট বা রিপ্লাই */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const { content, parentId } = await req.json()
  const text = clean(String(content || ''))
  if (!text) return NextResponse.json({ error: 'কমেন্ট খালি হতে পারে না' }, { status: 400 })

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })

  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } })
    if (!parent || parent.postId !== id) {
      return NextResponse.json({ error: 'প্যারেন্ট কমেন্ট পাওয়া যায়নি' }, { status: 400 })
    }
  }

  const comment = await db.comment.create({
    data: { postId: id, authorId: me.id, content: text, parentId: parentId || null },
    include: { author: true },
  })

  const count = await db.comment.count({ where: { postId: id } })

  // নোটিফিকেশন: রিপ্লাই হলে প্যারেন্ট কমেন্টের লেখক, নাহলে পোস্টের লেখক
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } })
    if (parent) {
      await notify({
        actorId: me.id,
        recipientId: parent.authorId,
        type: 'REPLY',
        postId: id,
        commentId: comment.id,
      })
    }
  } else {
    await notify({
      actorId: me.id,
      recipientId: post.authorId,
      type: 'COMMENT',
      postId: id,
      commentId: comment.id,
    })
  }

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        parentId: comment.parentId,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          username: comment.author.username,
          avatarUrl: comment.author.avatarUrl,
        },
        reactionCounts: {},
        reactionTotal: 0,
        myReaction: null,
        replies: [],
      },
      commentCount: count,
    },
    { status: 201 }
  )
}
