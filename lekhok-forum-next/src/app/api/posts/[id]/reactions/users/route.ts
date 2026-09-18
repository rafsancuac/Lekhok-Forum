import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * GET /api/posts/[id]/reactions/users — কে কী রিঅ্যাকশন দিয়েছে (ফেসবুক-স্টাইল লিস্ট)
 * রেসপন্স: { counts: Record<type, number>, total, users: [{ id, name, username, avatarUrl, type, createdAt }] }
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const post = await db.post.findUnique({ where: { id }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'পোস্ট পাওয়া যায়নি' }, { status: 404 })

  const reactions = await db.postReaction.findMany({
    where: { postId: id },
    orderBy: { createdAt: 'desc' },
    take: 120,
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  })

  const counts: Record<string, number> = {}
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1
  }

  return NextResponse.json({
    counts,
    total: reactions.length,
    users: reactions.map((r) => ({
      id: r.user.id,
      name: r.user.name,
      username: r.user.username,
      avatarUrl: r.user.avatarUrl,
      type: r.type,
      createdAt: r.createdAt,
    })),
  })
}
