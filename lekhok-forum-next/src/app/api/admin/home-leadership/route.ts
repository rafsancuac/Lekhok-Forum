/**
 * হোম-নেতৃত্ব কার্ড API (শুধু অ্যাডমিন) — অ্যাডমিন প্যানেল /admin/home/leadership
 *
 * Task63: স্থির ৮-স্লট (HomeLeadershipSlot) → ডাইনামিক কার্ড (HomeLeaderCard)।
 * ইউজার-স্পেক: উপদেষ্টা বেশি হলে যত-খুশি নতুন কার্ড তৈরি করা যাবে; প্রতিটি কার্ডের
 * কোণায় অন/অফ টগল-সুইচ (isActive); কার্ড মোছাও যাবে।
 *
 * GET    /api/admin/home-leadership       → সব-কার্ড (category, order অনুযায়ী)
 * POST   /api/admin/home-leadership       → নতুন-কার্ড তৈরি (id ছাড়া) অথবা আপডেট (id সহ)
 * PATCH  /api/admin/home-leadership       → তাৎক্ষণিক অন/অফ টগল { id, isActive }
 * DELETE /api/admin/home-leadership?id=…  → কার্ড মুছে ফেলা
 *
 * ডিজাইন-নোট (ইউজার-স্পেক): সেভ/টগল/ডিলিট-সফল সবসময় 200 + রেকর্ড/ok — ফ্রন্টএন্ডে
 * কোনো মিথ্যা "সম্পাদনা ব্যর্থ" ফলস-পজিটিভ না হয়। নতুন-কার্ড ডিফল্ট isActive=false
 * (লুকানো) — অ্যাডমিন তথ্য-পূর্ণ করে টগল-অন করলেই হোমপেজে লাইভ।
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isManager } from '@/lib/roles'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

const MAX_IMAGE_CHARS = 2_000_000 // ~১.৫MB data-URI নিরাপদ-সীমা
const CATEGORIES = ['FOUNDING', 'CURRENT'] as const

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 }) } as const
  }
  if (!isManager(user.role)) {
    return { error: NextResponse.json({ error: 'শুধু অ্যাডমিনের জন্য অনুমোদিত' }, { status: 403 }) } as const
  }
  return { user } as const
}

/** স্ট্রিং-ফিল্ড নিরাপদ-পার্স: স্ট্রিং না-হলে খালি */
function str(v: unknown, max = 400): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

/** GET — সব-কার্ড (FOUNDING আগে, তারপর CURRENT; প্রতিটির ভেতরে order-ক্রম) */
export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const rows = await db.homeLeaderCard.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    })
    /* FOUNDING আগে — category 'CURRENT' < 'FOUNDING' lexicographically, তাই ম্যানুয়াল-ক্রম */
    const ordered = [...rows].sort((a, b) => {
      const rankOf = (c: string) => (c === 'FOUNDING' ? 0 : 1)
      return rankOf(a.category) - rankOf(b.category)
    })
    return NextResponse.json(ordered, { status: 200 })
  } catch (error) {
    console.error('home-leadership:GET', error)
    return NextResponse.json({ error: 'ডাটা লোড ব্যর্থ' }, { status: 500 })
  }
}

/** POST — নতুন-কার্ড তৈরি (id ছাড়া) অথবা আপডেট (id সহ); সফল সবসময় 200 + সংরক্ষিত-রেকর্ড */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const id = str(body?.id, 60)

    if (typeof body?.imageUrl === 'string' && body.imageUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: 'ছবিটি খুব বড় — ছোট ছবি দিন' }, { status: 413 })
    }

    /* ── আপডেট-পথ ── */
    if (id) {
      const existing = await db.homeLeaderCard.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'কার্ড পাওয়া যায়নি' }, { status: 404 })
      }
      const isActive =
        typeof body?.isActive === 'boolean' ? body.isActive : existing.isActive
      const saved = await db.homeLeaderCard.update({
        where: { id },
        data: {
          name: str(body?.name, 120),
          role: str(body?.role, 120) || existing.role || 'সদস্য',
          term: str(body?.term, 60),
          quote: str(body?.quote, 4000),
          imageUrl: str(body?.imageUrl, MAX_IMAGE_CHARS),
          isActive,
          order: Number.isFinite(Number(body?.order)) ? Number(body.order) : existing.order,
        },
      })
      return NextResponse.json(saved, { status: 200 })
    }

    /* ── তৈরি-পথ ── */
    const category = CATEGORIES.includes(body?.category) ? body.category : 'CURRENT'

    /* নতুন-কার্ড সেকশনের একদম শেষে বসে (order = max+1) */
    const last = await db.homeLeaderCard.findFirst({
      where: { category },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const order = Number.isFinite(Number(body?.order))
      ? Number(body.order)
      : (last?.order ?? 0) + 1

    const saved = await db.homeLeaderCard.create({
      data: {
        category,
        name: str(body?.name, 120),
        role: str(body?.role, 120) || 'উপদেষ্টা',
        term: str(body?.term, 60),
        quote: str(body?.quote, 4000),
        imageUrl: str(body?.imageUrl, MAX_IMAGE_CHARS),
        /* নতুন-কার্ড ডিফল্ট লুকানো (isActive=false) — ব্যতিক্রম: বডিতে স্পষ্ট-boolean */
        isActive: typeof body?.isActive === 'boolean' ? body.isActive : false,
        order,
      },
    })
    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error('home-leadership:POST', error)
    return NextResponse.json({ error: 'সংরক্ষণ ব্যর্থ হয়েছে' }, { status: 500 })
  }
}

/** PATCH — তাৎক্ষণিক অন/অফ টগল { id, isActive } (কোনো রিলোড/পপআপ ছাড়াই; সবসময় 200 + রেকর্ড) */
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const id = str(body?.id, 60)
    if (!id) {
      return NextResponse.json({ error: 'id প্রয়োজন' }, { status: 400 })
    }
    if (typeof body?.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive বুলিয়ান প্রয়োজন' }, { status: 400 })
    }
    const existing = await db.homeLeaderCard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'কার্ড পাওয়া যায়নি' }, { status: 404 })
    }
    const saved = await db.homeLeaderCard.update({
      where: { id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error('home-leadership:PATCH', error)
    return NextResponse.json({ error: 'টগল ব্যর্থ হয়েছে' }, { status: 500 })
  }
}

/** DELETE — কার্ড মুছে ফেলা (?id=…); সফল হলে 200 { ok: true } */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const id = str(req.nextUrl.searchParams.get('id') || '', 60)
    if (!id) {
      return NextResponse.json({ error: 'id প্রয়োজন' }, { status: 400 })
    }
    const existing = await db.homeLeaderCard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'কার্ড পাওয়া যায়নি' }, { status: 404 })
    }
    await db.homeLeaderCard.delete({ where: { id } })
    return NextResponse.json({ ok: true, id }, { status: 200 })
  } catch (error) {
    console.error('home-leadership:DELETE', error)
    return NextResponse.json({ error: 'ডিলিট ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
