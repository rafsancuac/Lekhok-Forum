import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** POST /api/posts/[id]/bookmark — সেভ টগল */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })

  const existing = await db.bookmark.findUnique({
    where: { userId_postId: { userId: me.id, postId: id } },
  })

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true, myBookmark: false })
  }
  await db.bookmark.create({ data: { userId: me.id, postId: id } })
  return NextResponse.json({ ok: true, myBookmark: true })
}
