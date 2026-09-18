import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { sanitizePlainText } from '@/lib/sanitize'

const STORY_TTL_MS = 24 * 60 * 60 * 1000 // ২৪ ঘণ্টা
const MAX_TEXT = 500

/** GET /api/stories — সক্রিয় (মেয়াদোত্তীর্ণ নয়) স্টোরি লেখক-ভিত্তিক গ্রুপ করে */
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const stories = await db.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
      views: { where: { userId: me.id }, select: { id: true } },
    },
  })

  // নিজের স্টোরির ভিউ-কাউন্ট (সব ভিউয়ার) + অপঠিত রিপ্লাই-কাউন্ট (Session J)
  const myViewCounts = new Map<string, number>()
  const myUnreadReplies = new Map<string, number>()
  const myStoryIds = stories.filter((s) => s.authorId === me.id).map((s) => s.id)
  if (myStoryIds.length > 0) {
    const [grouped, replyGrouped] = await Promise.all([
      db.storyView.groupBy({
        by: ['storyId'],
        where: { storyId: { in: myStoryIds } },
        _count: { storyId: true },
      }),
      db.storyReply.groupBy({
        by: ['storyId'],
        where: { storyId: { in: myStoryIds }, read: false },
        _count: { storyId: true },
      }),
    ])
    for (const g of grouped) myViewCounts.set(g.storyId, g._count.storyId)
    for (const g of replyGrouped) myUnreadReplies.set(g.storyId, g._count.storyId)
  }

  const byAuthor = new Map<
    string,
    {
      author: { id: string; name: string; username: string; avatarUrl: string | null }
      stories: {
        id: string
        mediaUrl: string | null
        text: string | null
        background: string | null
        createdAt: Date
        expiresAt: Date
        viewed: boolean
        viewCount?: number
        unreadReplies?: number
      }[]
      isMe: boolean
    }
  >()

  for (const s of stories) {
    let ring = byAuthor.get(s.authorId)
    if (!ring) {
      ring = { author: s.author, stories: [], isMe: s.authorId === me.id }
      byAuthor.set(s.authorId, ring)
    }
    ring.stories.push({
      id: s.id,
      mediaUrl: s.mediaUrl,
      text: s.text,
      background: s.background,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      viewed: s.views.length > 0,
      viewCount: s.authorId === me.id ? (myViewCounts.get(s.id) ?? 0) : undefined,
      unreadReplies: s.authorId === me.id ? (myUnreadReplies.get(s.id) ?? 0) : undefined,
    })
  }

  const rings = Array.from(byAuthor.values()).map((r) => ({
    author: r.author,
    isMe: r.isMe,
    allSeen: r.stories.every((s) => s.viewed),
    stories: r.stories,
  }))

  // নিজের রিং প্রথমে, তারপর অদেখা, তারপর দেখা — নাম দিয়ে স্থিতিশীল সর্ট
  rings.sort((a, b) => {
    if (a.isMe !== b.isMe) return a.isMe ? -1 : 1
    if (a.allSeen !== b.allSeen) return a.allSeen ? 1 : -1
    return a.author.name.localeCompare(b.author.name, 'bn')
  })

  return NextResponse.json({ rings })
}

/** POST /api/stories — নতুন স্টোরি (ছবি বা পিওর-টেক্সট) */
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  let body: { mediaUrl?: string | null; text?: string | null; background?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'অবৈধ বডি' }, { status: 400 })
  }

  const mediaUrl = typeof body.mediaUrl === 'string' && body.mediaUrl.trim() ? body.mediaUrl.trim() : null
  const rawText = typeof body.text === 'string' ? body.text.trim() : ''
  const text = rawText ? sanitizePlainText(rawText.slice(0, MAX_TEXT)) : null
  const background =
    typeof body.background === 'string' && body.background.trim() ? body.background.trim() : null

  if (!mediaUrl && !text) {
    return NextResponse.json({ error: 'ছবি বা লেখা — কিছু একটা দরকার' }, { status: 400 })
  }
  if (mediaUrl && !/^(https?:\/\/|\/)/.test(mediaUrl)) {
    return NextResponse.json({ error: 'অবৈধ মিডিয়া URL' }, { status: 400 })
  }

  const story = await db.story.create({
    data: {
      authorId: me.id,
      mediaUrl,
      text,
      background: mediaUrl ? null : background, // গ্রেডিয়েন্ট শুধু টেক্সট-স্টোরিতে
      expiresAt: new Date(Date.now() + STORY_TTL_MS),
    },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  })

  return NextResponse.json({ story }, { status: 201 })
}
