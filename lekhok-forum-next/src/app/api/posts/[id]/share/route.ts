import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { notify } from '@/lib/notify'

/** POST /api/posts/[id]/share — শেয়ার কাউন্ট বাড়াও */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })

  const updated = await db.post.update({
    where: { id },
    data: { shares: { increment: 1 } },
  })
  // পোস্ট লেখককে শেয়ার-নোটিফিকেশন
  await notify({ actorId: me.id, recipientId: updated.authorId, type: 'SHARE', postId: id })
  return NextResponse.json({ ok: true, shares: updated.shares })
}
