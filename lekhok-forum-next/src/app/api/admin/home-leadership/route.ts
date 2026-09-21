/**
 * হোম-নেতৃত্ব-স্লট API (শুধু অ্যাডমিন) — অ্যাডমিন প্যানেল /admin/home-leadership
 *
 * GET  /api/admin/home-leadership  → ৮-স্লটের বর্তমান ডাটা (না-থাকা স্লট = ডিফল্ট-খালি রেকর্ড সহ)
 * POST /api/admin/home-leadership  → এক-স্লট upsert (slotKey হোয়াইটলিস্ট-বাধ্যতামূলক)
 *
 * ডিজাইন-নোট (ইউজার-স্পেক): সেভ-সফল সবসময় 200 + সংরক্ষিত-রেকর্ড — ফ্রন্টএন্ডে
 * কোনো মিথ্যা "সম্পাদনা ব্যর্থ" ফলস-পজিটিভ না হয়। খালি-স্লট সরাসরি ম্যানুয়াল-ইনপুটযোগ্য —
 * কোনো কমিটি-রিলেশন খোঁজা হয় না।
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

const MAX_IMAGE_CHARS = 2_000_000 // ~১.৫MB data-URI নিরাপদ-সীমা (leadership-API-র সমান)

/** ৮টি স্থির-স্লটের হোয়াইটলিস্ট — অর্ডারই প্যানেলের প্রদর্শন-ক্রম */
const HOME_LEADERSHIP_SLOTS = [
  { slotKey: 'founder_president', slotLabel: 'প্রতিষ্ঠাতা সভাপতি', section: 'FOUNDING', defaultRole: 'প্রতিষ্ঠাতা সভাপতি', defaultTerm: '(২০২০-২১ কার্যবর্ষ)' },
  { slotKey: 'founder_general_secretary', slotLabel: 'প্রতিষ্ঠাতা সাধারণ সম্পাদক', section: 'FOUNDING', defaultRole: 'সাধারণ সম্পাদক', defaultTerm: '(২০২০-২১ কার্যবর্ষ)' },
  { slotKey: 'founding_advisor_1', slotLabel: 'প্রতিষ্ঠাকালীন উপদেষ্টা ১', section: 'FOUNDING', defaultRole: 'উপদেষ্টা', defaultTerm: '(২০২০-২১ কার্যবর্ষ)' },
  { slotKey: 'founding_advisor_2', slotLabel: 'প্রতিষ্ঠাকালীন উপদেষ্টা ২', section: 'FOUNDING', defaultRole: 'উপদেষ্টা', defaultTerm: '(২০২২-২৩ কার্যবর্ষ)' },
  { slotKey: 'current_president', slotLabel: 'বর্তমান সভাপতি', section: 'CURRENT', defaultRole: 'সভাপতি', defaultTerm: '(২০২৫-২৬ কার্যবর্ষ)' },
  { slotKey: 'current_general_secretary', slotLabel: 'বর্তমান সাধারণ সম্পাদক', section: 'CURRENT', defaultRole: 'সাধারণ সম্পাদক', defaultTerm: '(২০২৫-২৬ কার্যবর্ষ)' },
  { slotKey: 'current_advisor_1', slotLabel: 'বর্তমান উপদেষ্টা ১', section: 'CURRENT', defaultRole: 'উপদেষ্টা', defaultTerm: '(২০২৫-২৬ কার্যবর্ষ)' },
  { slotKey: 'current_advisor_2', slotLabel: 'বর্তমান উপদেষ্টা ২', section: 'CURRENT', defaultRole: 'উপদেষ্টা', defaultTerm: '(২০২৫-২৬ কার্যবর্ষ)' },
] as const

type SlotDef = (typeof HOME_LEADERSHIP_SLOTS)[number]

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 }) } as const
  }
  if (user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'শুধু অ্যাডমিনের জন্য অনুমোদিত' }, { status: 403 }) } as const
  }
  return { user } as const
}

/** স্ট্রিং-ফিল্ড নিরাপদ-পার্স: স্ট্রিং না-হলে খালি */
function str(v: unknown, max = 400): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

/** GET — ৮-স্লটের পূর্ণ ম্যাপ (DB-তে না-থাকা স্লটও খালি-রেকর্ড হিসেবে আসে, প্যানেল সহজ) */
export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const rows = await db.homeLeadershipSlot.findMany()
    const byKey = new Map(rows.map((r) => [r.slotKey, r]))
    const slots = HOME_LEADERSHIP_SLOTS.map((def: SlotDef) => {
      const row = byKey.get(def.slotKey)
      return {
        slotKey: def.slotKey,
        slotLabel: def.slotLabel,
        section: def.section,
        name: row?.name ?? '',
        role: row?.name ? (row?.role || def.defaultRole) : def.defaultRole,
        term: row?.term ?? def.defaultTerm,
        quote: row?.quote ?? '',
        imageUrl: row?.imageUrl ?? '',
      }
    })
    return NextResponse.json(slots, { status: 200 })
  } catch (error) {
    console.error('home-leadership:GET', error)
    return NextResponse.json({ error: 'ডাটা লোড ব্যর্থ' }, { status: 500 })
  }
}

/** POST — এক-স্লট upsert (সবসময় 200 + সংরক্ষিত-রেকর্ড রিটার্ন) */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const slotKey = str(body?.slotKey, 60)
    const def = HOME_LEADERSHIP_SLOTS.find((s) => s.slotKey === slotKey)
    if (!def) {
      return NextResponse.json({ error: 'অজানা স্লট-কী' }, { status: 400 })
    }

    const name = str(body?.name, 120)
    const role = str(body?.role, 120) || def.defaultRole
    const term = str(body?.term, 60) || def.defaultTerm
    const quote = str(body?.quote, 4000)
    const imageUrl = str(body?.imageUrl, MAX_IMAGE_CHARS)

    if (typeof body?.imageUrl === 'string' && body.imageUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: 'ছবিটি খুব বড় — ছোট ছবি দিন' }, { status: 413 })
    }

    const saved = await db.homeLeadershipSlot.upsert({
      where: { slotKey },
      update: { section: def.section, name, role, term, quote, imageUrl },
      create: { slotKey, section: def.section, name, role, term, quote, imageUrl },
    })

    return NextResponse.json({ ...saved, slotLabel: def.slotLabel }, { status: 200 })
  } catch (error) {
    console.error('home-leadership:POST', error)
    return NextResponse.json({ error: 'সংরক্ষণ ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
