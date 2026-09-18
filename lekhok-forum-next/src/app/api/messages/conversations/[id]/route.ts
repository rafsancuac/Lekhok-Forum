import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * GET  /api/messages/conversations/[id] → থ্রেডের মেসেজগুলো (খুললেই আমার কাছে আসা মেসেজ 'পড়া' হয়ে যায়)
 * POST /api/messages/conversations/[id] → মেসেজ পাঠানো
 *      টেক্সট:  { content: "..." }
 *      ভয়েস:   { type: 'VOICE', audioUrl: '/uploads/...', duration: 12 }  ← রেকর্ডার-সাইড সেকেন্ড (০:০০-বাগ-স্থায়ী-সমাধান)
 */

const MAX_TEXT = 2000
const MAX_DURATION = 600 // ১০ মিনিট ক্যাপ

async function getConversation(id: string, meId: string) {
  return db.conversation.findFirst({
    where: {
      id,
      OR: [{ participantAId: meId }, { participantBId: meId }],
    },
    include: { participantA: true, participantB: true },
  })
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })

    const { id } = await ctx.params
    const conv = await getConversation(id, me.id)
    if (!conv) return NextResponse.json({ error: 'কথোপকথন পাওয়া যায়নি' }, { status: 404 })

    // থ্রেড খুললেই: আমার কাছে আসা অপঠিত মেসেজগুলো 'পড়া' হিসেবে চিহ্নিত
    await db.message.updateMany({
      where: { conversationId: id, senderId: { not: me.id }, readAt: null },
      data: { readAt: new Date() },
    })

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    const other = conv.participantAId === me.id ? conv.participantB : conv.participantA

    return NextResponse.json({
      conversation: {
        id: conv.id,
        other: {
          id: other.id,
          name: other.name,
          username: other.username,
          avatarUrl: other.avatarUrl,
        },
      },
      messages: messages.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        audioUrl: m.audioUrl,
        duration: m.duration,
        createdAt: m.createdAt,
        isMine: m.senderId === me.id,
        readAt: m.readAt,
      })),
    })
  } catch (err) {
    console.error('Thread GET error:', err)
    return NextResponse.json({ error: 'মেসেজ লোড ব্যর্থ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })

    const { id } = await ctx.params
    const conv = await getConversation(id, me.id)
    if (!conv) return NextResponse.json({ error: 'কথোপকথন পাওয়া যায়নি' }, { status: 404 })

    const body = await req.json().catch(() => null)
    const type = body?.type === 'VOICE' ? 'VOICE' : 'TEXT'

    if (type === 'VOICE') {
      const audioUrl = (body?.audioUrl as string | undefined)?.trim()
      const duration = Number(body?.duration)
      if (!audioUrl || !audioUrl.startsWith('/uploads/'))
        return NextResponse.json({ error: 'ভয়েস ফাইল পাওয়া যায়নি' }, { status: 400 })
      if (!Number.isFinite(duration) || duration < 0 || duration > MAX_DURATION)
        return NextResponse.json({ error: 'ভয়েসের দৈর্ঘ্য অবৈধ' }, { status: 400 })

      const message = await db.message.create({
        data: {
          conversationId: id,
          senderId: me.id,
          type: 'VOICE',
          audioUrl,
          duration: Math.round(duration),
        },
      })
      await db.conversation.update({ where: { id }, data: { updatedAt: new Date() } })
      return NextResponse.json({
        message: { ...message, isMine: true },
      })
    }

    const content = (body?.content as string | undefined)?.trim()
    if (!content) return NextResponse.json({ error: 'খালি মেসেজ' }, { status: 400 })
    if (content.length > MAX_TEXT)
      return NextResponse.json({ error: `মেসেজ খুব বড় (সর্বোচ্চ ${MAX_TEXT} অক্ষর)` }, { status: 400 })

    const message = await db.message.create({
      data: { conversationId: id, senderId: me.id, type: 'TEXT', content },
    })
    await db.conversation.update({ where: { id }, data: { updatedAt: new Date() } })

    return NextResponse.json({ message: { ...message, isMine: true } })
  } catch (err) {
    console.error('Thread POST error:', err)
    return NextResponse.json({ error: 'মেসেজ পাঠানো ব্যর্থ' }, { status: 500 })
  }
}
