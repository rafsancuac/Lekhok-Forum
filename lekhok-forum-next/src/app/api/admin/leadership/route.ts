/**
 * Session 189 — নেতৃত্ব-ব্যবস্থাপনা API (শুধু অ্যাডমিন)
 *
 * GET    /api/admin/leadership        → সব সদস্য (FOUNDING+CURRENT+ADVISOR, order-অনুসারে)
 * POST   /api/admin/leadership        → নতুন সদস্য
 * PUT    /api/admin/leadership        → সম্পাদনা (body-তে id বাধ্যতামূলক)
 * DELETE /api/admin/leadership?id=…   → মুছে ফেলা
 * ড্র্যাগ-ড্রপ-পুনঃসাজাই: POST /api/admin/leadership/reorder (Task61)
 *
 * গার্ড: সেশন-ইউজারের role==='admin' হতে হবে (ডেমো-সেশন: ইউজার-সুইচার থেকে)।
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isManager } from '@/lib/roles'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['FOUNDING', 'CURRENT', 'ADVISOR'] as const
const MAX_IMAGE_CHARS = 2_000_000 // ~১.৫MB data-URI নিরাপদ-সীমা

/** username স্যানিটাইজ: ছোট-হাতের ল্যাটিন+সংখ্যা+._— অন্যথায় খালি (হোম-ভিউ ?user= ডিপ-লিঙ্কের জন্য) */
function sanitizeUsername(v: unknown): string {
  if (typeof v !== 'string') return ''
  return v.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40)
}

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return {
      error: NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 }),
    } as const
  }
  if (!isManager(user.role)) {
    return {
      error: NextResponse.json({ error: 'শুধু অ্যাডমিনের জন্য অনুমোদিত' }, { status: 403 }),
    } as const
  }
  return { user } as const
}

/** GET — প্যানেলের তালিকা */
export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const members = await db.leadershipMember.findMany({
      orderBy: [{ category: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('leadership:GET', error)
    return NextResponse.json({ error: 'ডাটা লোড ব্যর্থ' }, { status: 500 })
  }
}

/** POST — নতুন সদস্য */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const role = typeof body?.role === 'string' ? body.role.trim() : ''
    const category = CATEGORIES.includes(body?.category) ? body.category : 'CURRENT'

    if (!name || !role) {
      return NextResponse.json({ error: 'নাম ও পদবী দুটোই প্রয়োজন' }, { status: 400 })
    }
    if (body?.imageUrl && typeof body.imageUrl !== 'string') {
      return NextResponse.json({ error: 'ছবি-ফিল্ড অবৈধ' }, { status: 400 })
    }
    if (body?.imageUrl && body.imageUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: 'ছবিটি খুব বড় — ছোট ছবি দিন' }, { status: 413 })
    }

    const newMember = await db.leadershipMember.create({
      data: {
        name,
        role,
        term: typeof body?.term === 'string' ? body.term.trim() : '',
        quote: typeof body?.quote === 'string' ? body.quote.trim() : '',
        imageUrl: body?.imageUrl ? body.imageUrl : null,
        username: sanitizeUsername(body?.username),
        category,
        order: Number.isFinite(Number(body?.order)) ? Number(body.order) : 1,
      },
    })
    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('leadership:POST', error)
    return NextResponse.json({ error: 'যুক্ত করা যায়নি' }, { status: 500 })
  }
}

/** PUT — সম্পাদনা (id body-তে) */
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const id = typeof body?.id === 'string' ? body.id : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const role = typeof body?.role === 'string' ? body.role.trim() : ''

    if (!id) return NextResponse.json({ error: 'ID প্রয়োজন' }, { status: 400 })
    if (!name || !role) {
      return NextResponse.json({ error: 'নাম ও পদবী দুটোই প্রয়োজন' }, { status: 400 })
    }
    if (body?.imageUrl && body.imageUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: 'ছবিটি খুব বড় — ছোট ছবি দিন' }, { status: 413 })
    }

    const existing = await db.leadershipMember.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'সদস্য পাওয়া যায়নি' }, { status: 404 })
    }

    const updated = await db.leadershipMember.update({
      where: { id },
      data: {
        name,
        role,
        term: typeof body?.term === 'string' ? body.term.trim() : '',
        quote: typeof body?.quote === 'string' ? body.quote.trim() : '',
        imageUrl: typeof body?.imageUrl === 'string' && body.imageUrl ? body.imageUrl : null,
        username: sanitizeUsername(body?.username),
        order: Number.isFinite(Number(body?.order)) ? Number(body.order) : existing.order,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('leadership:PUT', error)
    return NextResponse.json({ error: 'আপডেট করা যায়নি' }, { status: 500 })
  }
}

/** DELETE — ?id= দিয়ে মুছে ফেলা */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID প্রয়োজন' }, { status: 400 })
  }

  try {
    const existing = await db.leadershipMember.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'সদস্য পাওয়া যায়নি' }, { status: 404 })
    }
    await db.leadershipMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('leadership:DELETE', error)
    return NextResponse.json({ error: 'মুছে ফেলা যায়নি' }, { status: 500 })
  }
}
