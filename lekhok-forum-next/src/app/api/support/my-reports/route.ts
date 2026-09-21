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
        createdAt: true,
        updatedAt: true,
      },
    })

    const counts: Record<Status, number> = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 }
    for (const r of reports) if (counts[r.status as Status] !== undefined) counts[r.status as Status]++

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        // লিস্ট-ভিউতে দীর্ঘ টেক্সট কেটে — সম্পূর্ণ টেক্সট মেসেঞ্জার-থ্রেডেই আছে
        messageText: r.messageText.length > 220 ? r.messageText.slice(0, 220) + '…' : r.messageText,
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
