import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * Session L — মেসেঞ্জার API
 *
 * GET  /api/messages/conversations            → আমার কথোপকথনের তালিকা (অংশীদার + শেষ মেসেজ + অপঠিত সংখ্যা)
 * GET  /api/messages/conversations?unread=1   → হালকা আনরিড-কাউন্ট (টপনাভ ব্যাজ)
 * POST /api/messages/conversations  {userId}  → ইউজারের সাথে কথোপকথন খুঁজে-নাও/তৈরি করো
 */

/** আমার অংশগ্রহণ করা কথোপকথনগুলোর সাধারণ include-শেপ */
const CONV_INCLUDE = {
  participantA: true,
  participantB: true,
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1, // শেষ মেসেজ (প্রিভিউ)
  },
} as const

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })

    // হালকা মোড: শুধু অপঠিত-কাউন্ট (টপনাভ ব্যাজের পোলিং)
    const sp = req.nextUrl.searchParams
    if (sp.get('unread') === '1') {
      const conversations = await db.conversation.findMany({
        where: { OR: [{ participantAId: me.id }, { participantBId: me.id }] },
        select: { id: true, participantAId: true, participantBId: true },
      })
      if (conversations.length === 0) return NextResponse.json({ unread: 0 })

      const unread = await db.message.count({
        where: {
          conversationId: { in: conversations.map((c) => c.id) },
          senderId: { not: me.id },
          readAt: null,
        },
      })
      return NextResponse.json({ unread })
    }

    const conversations = await db.conversation.findMany({
      where: { OR: [{ participantAId: me.id }, { participantBId: me.id }] },
      include: CONV_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    })

    const ids = conversations.map((c) => c.id)

    // প্রতি-কথোপকথনে আমার অপঠিত মেসেজ-সংখ্যা (এক কুয়েরিতে গ্রুপ-কাউন্ট)
    const unreadRows = ids.length
      ? await db.message.groupBy({
          by: ['conversationId'],
          where: {
            conversationId: { in: ids },
            senderId: { not: me.id },
            readAt: null,
          },
          _count: { id: true },
        })
      : []
    const unreadMap = new Map(unreadRows.map((r) => [r.conversationId, r._count.id]))

    const items = conversations.map((c) => {
      const other = c.participantAId === me.id ? c.participantB : c.participantA
      const last = c.messages[0] ?? null
      return {
        id: c.id,
        updatedAt: c.updatedAt,
        other: {
          id: other.id,
          name: other.name,
          username: other.username,
          avatarUrl: other.avatarUrl,
        },
        lastMessage: last
          ? {
              id: last.id,
              type: last.type,
              content: last.content,
              senderId: last.senderId,
              senderName: last.senderId === me.id ? me.name : other.name,
              createdAt: last.createdAt,
              isMine: last.senderId === me.id,
            }
          : null,
        unreadCount: unreadMap.get(c.id) ?? 0,
      }
    })

    return NextResponse.json({ conversations: items })
  } catch (err) {
    console.error('Conversations GET error:', err)
    return NextResponse.json({ error: 'কথোপকথন লোড ব্যর্থ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const userId = body?.userId as string | undefined
    if (!userId) return NextResponse.json({ error: 'userId প্রয়োজন' }, { status: 400 })
    if (userId === me.id)
      return NextResponse.json({ error: 'নিজের সাথে কথোপকথন হয় না' }, { status: 400 })

    const target = await db.user.findUnique({ where: { id: userId } })
    if (!target) return NextResponse.json({ error: 'ইউজার পাওয়া যায়নি' }, { status: 404 })

    // find-or-create (দুই-ক্রমেই খুঁজি — ডেটাবেজে যে-কোনো অর্ডারে থাকতে পারে)
    let conv = await db.conversation.findFirst({
      where: { participantAId: me.id, participantBId: userId },
    })
    if (!conv) {
      conv = await db.conversation.findFirst({
        where: { participantAId: userId, participantBId: me.id },
      })
    }
    if (!conv) {
      conv = await db.conversation.create({
        data: { participantAId: me.id, participantBId: userId },
      })
    }

    return NextResponse.json({ conversationId: conv.id })
  } catch (err) {
    console.error('Conversations POST error:', err)
    return NextResponse.json({ error: 'কথোপকথন তৈরি ব্যর্থ' }, { status: 500 })
  }
}
