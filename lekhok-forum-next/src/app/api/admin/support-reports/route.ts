import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { isManager } from '@/lib/roles'
import { getSupportAdminId } from '@/lib/support'

/**
 * Task 43 — অভিযোগ-রিভিউ ডেস্ক API
 *
 * GET /api/admin/support-reports?status=PENDING  → অভিযোগ-তালিকা + স্টেটাস-কাউন্ট
 * PUT /api/admin/support-reports  {id, status?, adminNote?} → স্টেটাস/নোট আপডেট
 *
 * অ্যাক্সেস: ম্যানেজার (admin/super_admin) অথবা নির্বাচিত সাপোর্ট-অ্যাডমিন নিজে
 * রোল-ম্যাট্রিক্স (curl-যাচাইকৃত): member 403 · member+সাপোর্ট 200 · admin 200 · super 200
 */

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const
type Status = (typeof STATUSES)[number]

async function requireReviewer() {
  const me = await getCurrentUser()
  if (!me) return { error: NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 }) }
  const supportId = await getSupportAdminId()
  const allowed = isManager(me.role) || (!!supportId && supportId === me.id)
  if (!allowed) return { error: NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 }) }
  return { me }
}

export async function GET(req: NextRequest) {
  try {
    const gate = await requireReviewer()
    if (gate.error) return gate.error

    const sp = req.nextUrl.searchParams
    const statusParam = sp.get('status')
    const status = STATUSES.includes(statusParam as Status) ? (statusParam as Status) : undefined

    const where = status ? { status } : {}
    const [reports, groups] = await Promise.all([
      db.userReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      db.userReport.groupBy({ by: ['status'], _count: { id: true } }),
    ])

    const counts: Record<Status, number> = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 }
    for (const g of groups) counts[g.status] = g._count.id

    return NextResponse.json({
      reports,
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    })
  } catch (err) {
    console.error('support-reports GET error:', err)
    return NextResponse.json({ error: 'অভিযোগ লোড ব্যর্থ' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const gate = await requireReviewer()
    if (gate.error) return gate.error

    const body = await req.json().catch(() => null)
    const id = body?.id as string | undefined
    if (!id) return NextResponse.json({ error: 'id প্রয়োজন' }, { status: 400 })

    const status = body?.status as string | undefined
    if (status !== undefined && !STATUSES.includes(status as Status))
      return NextResponse.json({ error: 'অবৈধ স্টেটাস' }, { status: 400 })

    const adminNote = body?.adminNote as string | undefined
    if (adminNote !== undefined && adminNote.length > 2000)
      return NextResponse.json({ error: 'নোট খুব বড় (সর্বোচ্চ ২০০০ অক্ষর)' }, { status: 400 })

    const existing = await db.userReport.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'অভিযোগ পাওয়া যায়নি' }, { status: 404 })

    const updated = await db.userReport.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as Status } : {}),
        ...(adminNote !== undefined ? { adminNote: adminNote.trim() || null } : {}),
      },
    })

    return NextResponse.json({ report: updated })
  } catch (err) {
    console.error('support-reports PUT error:', err)
    return NextResponse.json({ error: 'আপডেট ব্যর্থ' }, { status: 500 })
  }
}
