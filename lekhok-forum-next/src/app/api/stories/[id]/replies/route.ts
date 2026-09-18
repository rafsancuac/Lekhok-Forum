import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { sanitizePlainText } from '@/lib/sanitize'
import { notify } from '@/lib/notify'

/** POST /api/stories/[id]/replies — স্টোরিতে রিপ্লাই (কমেন্ট-টু-স্টোরি, Session F) */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await ctx.params

  const story = await db.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'স্টোরি পাওয়া যায়নি' }, { status: 404 })
  if (story.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'স্টোরির মেয়াদ শেষ' }, { status: 410 })
  }
  if (story.authorId === me.id) {
    return NextResponse.json({ error: 'নিজের স্টোরিতে রিপ্লাই দেওয়া যায় না' }, { status: 400 })
  }

  let body: { content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'অবৈধ বডি' }, { status: 400 })
  }

  const content = sanitizePlainText(String(body.content || '').trim().slice(0, 300))
  if (!content) {
    return NextResponse.json({ error: 'রিপ্লাই খালি রাখা যায় না' }, { status: 400 })
  }

  const reply = await db.storyReply.create({
    data: { storyId: id, userId: me.id, content },
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  })

  // স্টোরি-লেখককে নোটিফিকেশন (মিউট সম্মান করে)
  await notify({
    actorId: me.id,
    recipientId: story.authorId,
    type: 'STORY_REPLY',
    storyId: id,
  })

  return NextResponse.json({ reply }, { status: 201 })
}
