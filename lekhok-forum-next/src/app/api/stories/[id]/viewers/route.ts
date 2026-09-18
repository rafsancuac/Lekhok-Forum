import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** GET /api/stories/[id]/viewers — নিজের স্টোরির ভিউয়ার + রিপ্লাই লিস্ট (Session F) */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const story = await db.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'স্টোরি পাওয়া যায়নি' }, { status: 404 })
  if (story.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের স্টোরির ভিউয়ার দেখা যায়' }, { status: 403 })
  }

  const userSelect = { id: true, name: true, username: true, avatarUrl: true } as const

  const [views, replies] = await Promise.all([
    db.storyView.findMany({
      where: { storyId: id },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    db.storyReply.findMany({
      where: { storyId: id },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  return NextResponse.json({
    viewers: views.map((v) => ({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
      user: v.user,
    })),
    replies: replies.map((r) => ({
      id: r.id,
      content: r.content,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    unreadReplies: replies.filter((r) => !r.read).length,
  })
}
