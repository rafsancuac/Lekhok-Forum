import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** DELETE /api/stories/[id] — নিজের স্টোরি মুছুন */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const story = await db.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'স্টোরি পাওয়া যায়নি' }, { status: 404 })
  if (story.authorId !== me.id) {
    return NextResponse.json({ error: 'শুধু নিজের স্টোরি মোছা যায়' }, { status: 403 })
  }

  await db.story.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
