import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** POST /api/stories/[id]/view — স্টোরি দেখা হয়েছে মার্ক (ইউনিক আপসার্ট) */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const story = await db.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'স্টোরি পাওয়া যায়নি' }, { status: 404 })
  if (story.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'স্টোরির মেয়াদ শেষ' }, { status: 410 })
  }

  await db.storyView.upsert({
    where: { storyId_userId: { storyId: id, userId: me.id } },
    update: {},
    create: { storyId: id, userId: me.id },
  })

  const viewCount = await db.storyView.count({ where: { storyId: id } })
  return NextResponse.json({ ok: true, viewCount })
}
