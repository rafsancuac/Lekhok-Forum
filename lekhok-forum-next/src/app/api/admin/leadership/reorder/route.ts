/**
 * Task61 — নেতৃত্ব-তালিকা batch-পুনঃসাজাই (ড্র্যাগ-ড্রপ + ↑↓-উভয়ের জন্য)
 *
 * POST /api/admin/leadership/reorder
 * body: { items: [{ id: string, order: number }, ...] }
 *
 * এক-ট্রানজেকশনে সব order আপডেট — প্রতি-অদলবদলে-দুই-PUT-এর রেস/ফাটল বন্ধ।
 * গার্ড: role==='admin'।
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isManager } from '@/lib/roles'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
  }
  if (!isManager(user.role)) {
    return NextResponse.json({ error: 'শুধু অ্যাডমিনের জন্য অনুমোদিত' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const items = Array.isArray(body?.items) ? body.items : []

    // ভ্যালিডেশন: সর্বোচ্চ ৩০০টি {id, order} জোড়া
    const clean = items
      .filter(
        (it: unknown): it is { id: string; order: number } =>
          typeof it === 'object' &&
          it !== null &&
          typeof (it as { id?: unknown }).id === 'string' &&
          Number.isFinite(Number((it as { order?: unknown }).order))
      )
      .slice(0, 300)
      .map((it: { id: string; order: number }) => ({ id: it.id, order: Math.trunc(Number(it.order)) }))

    if (clean.length === 0) {
      return NextResponse.json({ error: 'পুনঃসাজাই-তালিকা অবৈধ' }, { status: 400 })
    }

    // সব id সত্যিই আছে কি না যাচাই (আংশিক-আপডেট এড়াতে)
    const ids = clean.map((it: { id: string }) => it.id)
    const found = await db.leadershipMember.findMany({ where: { id: { in: ids } }, select: { id: true } })
    if (found.length !== new Set(ids).size) {
      return NextResponse.json({ error: 'কিছু সদস্য পাওয়া যায়নি' }, { status: 404 })
    }

    await db.$transaction(
      clean.map((it: { id: string; order: number }) =>
        db.leadershipMember.update({ where: { id: it.id }, data: { order: it.order } })
      )
    )

    return NextResponse.json({ success: true, updated: clean.length })
  } catch (error) {
    console.error('leadership:reorder', error)
    return NextResponse.json({ error: 'পুনঃসাজাই করা যায়নি' }, { status: 500 })
  }
}
