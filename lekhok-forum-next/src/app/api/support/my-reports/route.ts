import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * session203 (Task 54) — ইউজার-দিকের "আমার অভিযোগ" স্টেটাস-ভিউ API
 *
 * GET /api/support/my-reports → আমি (senderId) পাঠানো অভিযোগগুলো — নতুন-আগে
 * রেসপন্স: { reports: [{ id, messageText, mediaType, status, adminNote, createdAt, updatedAt }], counts, total }
 *
 * প্রাইভেসি:
 * - শুধু নিজের পাঠানো অভিযোগ (senderId = সেশন-ইউজার)
 * - adminNote দেখানো হয় — এটাই ম্যানেজমেন্টের অফিসিয়াল জবাব
 * - senderEmail/senderId ফেরত যায় না (অপ্রয়োজনীয়-তথ্য-লিক-শূন্য)
 * - session205: নোট-ইতিহাস ফেরত যায়, কিন্তু শুধু {note, at} — by/byRole (অভ্যন্তরীণ-তথ্য) বাদ
 * রোল-নিরপেক্ষ: যে-কোনো লগড-ইন ইউজার নিজের অভিযোগ দেখতে পারে (member-ও)।
 */

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const
type Status = (typeof STATUSES)[number]

export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })

    const reports = await db.userReport.findMany({
      where: { senderId: me.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        messageText: true,
        mediaType: true,
        status: true,
        adminNote: true,
        noteHistory: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const counts: Record<Status, number> = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 }
    for (const r of reports) if (counts[r.status as Status] !== undefined) counts[r.status as Status]++

    /** session205 — নোট-ইতিহাস পার্স; শুধু {note, at} (by/byRole বাদ) + নতুন-আগে, সর্বোচ্চ ২০ */
    const replyHistoryFor = (raw: string | null): { note: string; at: string }[] => {
      if (!raw) return []
      try {
        const arr = JSON.parse(raw)
        if (!Array.isArray(arr)) return []
        return arr
          .filter((e) => e && e.t === 'note' && typeof e.note === 'string' && e.note.trim())
          .map((e) => ({ note: String(e.note), at: typeof e.at === 'string' ? e.at : '' }))
          .reverse()
          .slice(0, 20)
      } catch {
        return []
      }
    }

    return NextResponse.json({
      reports: reports.map((r) => ({
        // স্পষ্ট-ফিল্ড ম্যাপ — ...r-স্প্রেড নয় (noteHistory-র by/byRole ভেতরের-তথ্য, বাইরে যায় না)
        id: r.id,
        messageText: r.messageText,
        mediaType: r.mediaType,
        status: r.status,
        adminNote: r.adminNote,
        noteHistory: replyHistoryFor(r.noteHistory),
        messageTextTrunc: r.messageText.length > 220 ? r.messageText.slice(0, 220) + '…' : undefined,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      counts,
      total: reports.length,
    })
  } catch (err) {
    console.error('my-reports GET error:', err)
    return NextResponse.json({ error: 'অভিযোগ লোড ব্যর্থ' }, { status: 500 })
  }
}
