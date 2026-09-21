import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { getSupportAdmin } from '@/lib/support'

/**
 * Session L — মেসেঞ্জার API
 *
 * GET  /api/messages/conversations            → আমার কথোপকথনের তালিকা (অংশীদার + শেষ মেসেজ + অপঠিত সংখ্যা)
 * GET  /api/messages/conversations?unread=1   → হালকা আনরিড-কাউন্ট (টপনাভ ব্যাজ)
 * POST /api/messages/conversations  {userId}  → ইউজারের সাথে কথোপকথন খুঁজে-নাও/তৈরি করো
 *
 * Task 43 — অফিসিয়াল সাপোর্ট-পিন: প্রতিটি ইউজারের তালিকার শীর্ষে সাপোর্ট-অ্যাডমিন
 *   • বাস্তব কথোপকথন থাকলে → splice-উত্তোলন + unshift (isSupportOfficial + isPinned ফ্ল্যাগ)
 *   • না থাকলে → প্লেসহোল্ডার-কথোপকথন id='system-support-chat' (ক্লিকে find-or-create রেজলভ)
 *   • ইউজার আনপিন/ডিলিট করতে পারে না — সার্ভার-সাইডে সবসময় শীর্ষে-ই ফেরে
 */

export const SUPPORT_PLACEHOLDER_ID = 'system-support-chat'

/** আমার অংশগ্রহণ করা কথোপকথনগুলোর সাধারণ include-শেপ */
const CONV_INCLUDE = {
  participantA: true,
  participantB: true,
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1, // শেষ মেসেজ (প্রিভিউ)
  },
} as const

/** তালিকা-আইটেম DTO — Task 43: সাপোর্ট-পিন-ফ্ল্যাগসহ (অন্যথায় অনির্ধারিত) */
interface ConversationItemDTO {
  id: string
  updatedAt: Date
  other: { id: string; name: string; username: string; avatarUrl: string | null }
  lastMessage: {
    id: string
    type: string
    content: string | null
    senderId: string
    senderName: string
    createdAt: Date
    isMine: boolean
  } | null
  unreadCount: number
  isSupportOfficial?: boolean
  isPinned?: boolean
  supportUserId?: string
}

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

    const items: ConversationItemDTO[] = conversations.map((c) => {
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

    // ─── Task 43: অফিসিয়াল সাপোর্ট-পিন-ইনজেকশন (সার্ভার-সাইড, অপসারণ-অযোগ্য) ───
    const support = await getSupportAdmin()
    if (support && support.id !== me.id) {
      const idx = items.findIndex((it) => it.other.id === support.id)
      if (idx >= 0) {
        // বাস্তব কথোপকথন — উত্তোলন করে শীর্ষে (ফ্ল্যাগসহ)
        const [row] = items.splice(idx, 1)
        items.unshift({ ...row, isSupportOfficial: true, isPinned: true })
      } else {
        // প্লেসহোল্ডার — ক্লিকে POST find-or-create দিয়ে বাস্তব থ্রেড-আইডি রেজলভ হবে
        items.unshift({
          id: SUPPORT_PLACEHOLDER_ID,
          updatedAt: new Date(0),
          other: {
            id: support.id,
            name: support.name,
            username: support.username,
            avatarUrl: support.avatarUrl,
          },
          lastMessage: null,
          unreadCount: 0,
          isSupportOfficial: true,
          isPinned: true,
          supportUserId: support.id,
        })
      }
    }

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
