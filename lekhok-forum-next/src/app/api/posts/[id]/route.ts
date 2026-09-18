import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { sanitizePostHtml } from '@/lib/sanitize'

/** PATCH /api/posts/[id] — নিজের পোস্ট এডিট (কনটেন্ট, অডিয়েন্স, সাজসজ্জা, মিডিয়া রিপ্লেস) */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })
  if (post.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের পোস্ট এডিট করা যায়' }, { status: 403 })
  }

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (typeof body.content === 'string') data.content = sanitizePostHtml(body.content)
  if (typeof body.audience === 'string' && ['PUBLIC', 'FRIENDS', 'ONLY_ME'].includes(body.audience)) {
    data.audience = body.audience
  }
  if ('backgroundColor' in body) data.backgroundColor = body.backgroundColor || null
  if ('feeling' in body) data.feeling = body.feeling || null
  if ('location' in body) data.location = body.location || null
  if ('taggedUsers' in body) data.taggedUsers = body.taggedUsers || null

  // মিডিয়া রিপ্লেস (ক্লায়েন্ট নতুন তালিকা পাঠালে)
  if (Array.isArray(body.media)) {
    data.media = {
      deleteMany: {},
      create: body.media.slice(0, 20).map((m: { url: string; type?: string; posterUrl?: string }, idx: number) => ({
        url: String(m.url),
        type: ['IMAGE', 'VIDEO', 'AUDIO'].includes(m.type || '') ? m.type : 'IMAGE',
        posterUrl: m.posterUrl ? String(m.posterUrl) : null,
        order: idx,
      })),
    }
  }

  const updated = await db.post.update({
    where: { id },
    data,
    include: { media: true },
  })
  return NextResponse.json({ post: { id: updated.id, content: updated.content } })
}

/** DELETE /api/posts/[id] — নিজের পোস্ট ডিলিট */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })
  if (post.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের পোস্ট ডিলিট করা যায়' }, { status: 403 })
  }

  await db.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
