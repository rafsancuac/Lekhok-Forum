import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { isSuperAdmin } from '@/lib/roles'
import { getSupportAdmin, setSupportAdmin, clearSupportAdmin } from '@/lib/support'

/**
 * Task 43 — সাপোর্ট-অ্যাডমিন নির্ধারণ API (শুধু সুপার-অ্যাডমিন)
 *
 * GET     /api/admin/support-admin           → বর্তমান সাপোর্ট-অ্যাডমিন (ম্যানেজার-দৃশ্যমান)
 * POST    /api/admin/support-admin {userId}  → নির্ধারণ (শুধু super_admin; রোল ∈ [ADMIN, SUPER_ADMIN])
 * DELETE  /api/admin/support-admin           → সরান (শুধু super_admin)
 *
 * রোল-ম্যাট্রিক্স (curl-যাচাইকৃত): member 403 · member+সাপোর্ট 403 · admin 403 · super 200
 */

/** প্যানেল-প্রদর্শনের জন্য GET — ম্যানেজার (admin/super) দেখতে পারে */
export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me || (me.role !== 'admin' && !isSuperAdmin(me.role))) {
      return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 })
    }
    const support = await getSupportAdmin()
    return NextResponse.json({ supportAdmin: support })
  } catch (err) {
    console.error('support-admin GET error:', err)
    return NextResponse.json({ error: 'লোড ব্যর্থ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
    if (!isSuperAdmin(me.role))
      return NextResponse.json(
        { error: 'শুধু সুপার-অ্যাডমিন সাপোর্ট-অ্যাডমিন নির্ধারণ করতে পারেন' },
        { status: 403 }
      )

    const body = await req.json().catch(() => null)
    const userId = body?.userId as string | undefined
    if (!userId) return NextResponse.json({ error: 'userId প্রয়োজন' }, { status: 400 })

    const target = await db.user.findUnique({ where: { id: userId } })
    if (!target) return NextResponse.json({ error: 'ইউজার পাওয়া যায়নি' }, { status: 404 })
    if (target.role !== 'admin' && target.role !== 'super_admin')
      return NextResponse.json(
        { error: 'সাপোর্ট-অ্যাডমিন হতে হলে ইউজারের রোল অ্যাডমিন বা সুপার-অ্যাডমিন হতে হবে' },
        { status: 400 }
      )

    await setSupportAdmin(target.id)
    return NextResponse.json({
      supportAdmin: {
        id: target.id,
        name: target.name,
        username: target.username,
        avatarUrl: target.avatarUrl,
        role: target.role,
      },
    })
  } catch (err) {
    console.error('support-admin POST error:', err)
    return NextResponse.json({ error: 'নির্ধারণ ব্যর্থ' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
    if (!isSuperAdmin(me.role))
      return NextResponse.json(
        { error: 'শুধু সুপার-অ্যাডমিন সরাতে পারেন' },
        { status: 403 }
      )
    await clearSupportAdmin()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('support-admin DELETE error:', err)
    return NextResponse.json({ error: 'সরানো ব্যর্থ' }, { status: 500 })
  }
}
