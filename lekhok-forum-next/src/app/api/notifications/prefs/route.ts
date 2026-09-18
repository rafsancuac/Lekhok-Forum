import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { VALID_NOTIF_TYPES } from '@/lib/notify'

/** GET /api/notifications/prefs — আমার মিউট করা নোটিফিকেশন টাইপ (Session F) */
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: me.id },
    select: { mutedNotifTypes: true },
  })
  const mutedTypes = (user?.mutedNotifTypes || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => (VALID_NOTIF_TYPES as string[]).includes(s))

  return NextResponse.json({ mutedTypes })
}

/** PUT /api/notifications/prefs — মিউট করা টাইপ সেট করুন */
export async function PUT(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  let body: { mutedTypes?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'অবৈধ বডি' }, { status: 400 })
  }

  if (!Array.isArray(body.mutedTypes)) {
    return NextResponse.json({ error: 'mutedTypes অ্যারে দরকার' }, { status: 400 })
  }

  const valid = body.mutedTypes
    .map(String)
    .filter((t) => (VALID_NOTIF_TYPES as string[]).includes(t))

  await db.user.update({
    where: { id: me.id },
    data: { mutedNotifTypes: valid.join(',') },
  })

  return NextResponse.json({ ok: true, mutedTypes: valid })
}
