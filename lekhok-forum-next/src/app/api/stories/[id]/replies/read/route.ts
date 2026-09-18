import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** POST /api/stories/[id]/replies/read — নিজের স্টোরির সব অপঠিত রিপ্লাই পড়া-মার্ক (Session J) */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const story = await db.story.findUnique({ where: { id }, select: { authorId: true } })
  if (!story) return NextResponse.json({ error: 'স্টোরি পাওয়া যায়নি' }, { status: 404 })
  if (story.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের স্টোরির রিপ্লাই পড়া-মার্ক করা যায়' }, { status: 403 })
  }

  const result = await db.storyReply.updateMany({
    where: { storyId: id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ marked: result.count })
}
