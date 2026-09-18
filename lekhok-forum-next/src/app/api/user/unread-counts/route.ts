import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * session160 — GET /api/user/unread-counts (ইউজার-স্পেক: useUnreadCounts-এর API-প্রান্ত)
 *
 * এক-কলে তিন রকমের লাইভ কাউন্ট (ক্লায়েন্ট-হুক ৪৫-সেকেন্ড পোলিং করবে):
 *   notifications — অপঠিত বিজ্ঞপ্তি
 *   messages      — অপঠিত মেসেজ (কথোপকথন-জুড়ে)
 *   bookmarks     — সেভ করা পোস্ট
 */
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const [notifications, messages, bookmarks] = await Promise.all([
    db.notification.count({ where: { userId: me.id, read: false } }),
    (async () => {
      const conversations = await db.conversation.findMany({
        where: { OR: [{ participantAId: me.id }, { participantBId: me.id }] },
        select: { id: true },
      })
      if (conversations.length === 0) return 0
      return db.message.count({
        where: {
          conversationId: { in: conversations.map((c) => c.id) },
          senderId: { not: me.id },
          readAt: null,
        },
      })
    })(),
    db.bookmark.count({ where: { userId: me.id } }),
  ])

  return NextResponse.json({ notifications, messages, bookmarks })
}
