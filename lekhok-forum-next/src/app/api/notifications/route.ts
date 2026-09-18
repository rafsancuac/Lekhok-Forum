import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { excerpt } from '@/lib/notify'

/** GET /api/notifications — আমার নোটিফিকেশন লিস্ট + unread কাউন্ট */
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const rows = await db.notification.findMany({
    where: { userId: me.id },
    include: {
      actor: { select: { id: true, name: true, username: true, avatarUrl: true } },
      post: { select: { content: true } },
      story: { select: { text: true, mediaUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  })

  const unread = await db.notification.count({ where: { userId: me.id, read: false } })

  return NextResponse.json({
    unread,
    notifications: rows.map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      postId: n.postId,
      commentId: n.commentId,
      storyId: n.storyId,
      actor: n.actor,
      postExcerpt: n.post ? excerpt(n.post.content) : null,
      storyExcerpt: n.story
        ? excerpt(n.story.text || n.story.mediaUrl || '(ছবি-স্টোরি)')
        : null,
    })),
  })
}

/** POST /api/notifications — সব পড়া হিসেবে মার্ক করুন */
export async function POST() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  await db.notification.updateMany({ where: { userId: me.id, read: false }, data: { read: true } })
  return NextResponse.json({ ok: true })
}

/** PATCH /api/notifications — নির্দিষ্ট নোটিফিকেশন পড়া হিসেবে মার্ক */
export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'আইডি দরকার' }, { status: 400 })
  await db.notification.updateMany({
    where: { id: String(id), userId: me.id },
    data: { read: true },
  })
  return NextResponse.json({ ok: true })
}
