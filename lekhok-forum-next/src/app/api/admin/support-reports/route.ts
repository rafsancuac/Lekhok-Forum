import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { isManager } from '@/lib/roles'
import { getSupportAdminId } from '@/lib/support'
import { notify } from '@/lib/notify'

/**
 * Task 43 — অভিযোগ-রিভিউ ডেস্ক API
 *
 * GET /api/admin/support-reports?status=PENDING  → অভিযোগ-তালিকা + স্টেটাস-কাউন্ট
 * GET /api/admin/support-reports?counts=1        → শুধু স্টেটাস-কাউন্ট (লাইট-মোড, ব্যাজ-পোলিং)
 * PUT /api/admin/support-reports  {id, status?, adminNote?} → স্টেটাস/নোট আপডেট
 * PATCH /api/admin/support-reports {id, historyIndex, action, note?} → ইতিহাস-এন্ট্রি সম্পাদনা/মুছে-ফেলা/পুনরুদ্ধার (session208/209)
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

    // লাইট-মোড (session202): শুধু কাউন্ট — সাইডবার/ড্যাশবোর্ড ব্যাজের ৩০-সে পোলিংয়ের জন্য
    // ২০০-রেকর্ড findMany বাদ → এক groupBy-ই যথেষ্ট
    if (sp.get('counts') === '1') {
      const groups = await db.userReport.groupBy({ by: ['status'], _count: { id: true } })
      const counts: Record<Status, number> = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 }
      for (const g of groups) counts[g.status] = g._count.id
      return NextResponse.json({
        counts,
        total: Object.values(counts).reduce((a, b) => a + b, 0),
      })
    }

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

    // session205 (Task 56): অ্যাকশন-ইতিহাস (noteHistory) — নোট-পরিবর্তন + স্টেটাস-পরিবর্তন
    // একটাই টাইমলাইনে; সর্বোচ্চ ৫০-এন্ট্রি (পুরোনো স্লাইস-আউট)। করাপ্ট-JSON হলে নিরাপদে রিসেট।
    const statusChanged = status !== undefined && status !== existing.status
    const newNote = adminNote !== undefined ? adminNote.trim() || null : undefined
    const noteChanged = newNote !== undefined && newNote !== existing.adminNote

    let historyArr: Record<string, unknown>[] = []
    if (existing.noteHistory) {
      try {
        const parsed = JSON.parse(existing.noteHistory)
        if (Array.isArray(parsed)) historyArr = parsed
      } catch {
        /* করাপ্ট-হিস্ট্রি → খালি-দিয়ে শুরু */
      }
    }
    let historyTouched = false
    if (statusChanged) {
      historyArr.push({
        t: 'status',
        from: existing.status,
        to: status,
        at: new Date().toISOString(),
        by: gate.me.name || gate.me.username,
        byRole: gate.me.role,
      })
      historyTouched = true
    }
    if (noteChanged && newNote) {
      historyArr.push({
        t: 'note',
        note: newNote,
        at: new Date().toISOString(),
        by: gate.me.name || gate.me.username,
        byRole: gate.me.role,
      })
      historyTouched = true
    }

    const updated = await db.userReport.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as Status } : {}),
        ...(newNote !== undefined ? { adminNote: newNote } : {}),
        ...(historyTouched ? { noteHistory: JSON.stringify(historyArr.slice(-50)) } : {}),
      },
    })

    // session203 (Task 54): অভিযোগকারীকে বেল-নোটিফিকেশন (SUPPORT_UPDATE) —
    // স্টেটাস বদলালে বা নতুন জবাব (adminNote) এলেই; নীরব-ব্যর্থতা (notify নিজেই ক্যাচ করে)
    if (statusChanged || noteChanged) {
      await notify({
        actorId: gate.me.id,
        recipientId: existing.senderId,
        type: 'SUPPORT_UPDATE',
      })
    }

    return NextResponse.json({ report: updated })
  } catch (err) {
    console.error('support-reports PUT error:', err)
    return NextResponse.json({ error: 'আপডেট ব্যর্থ' }, { status: 500 })
  }
}

/**
 * session208 (Task 59) — ইতিহাস-এন্ট্রি ম্যানেজমেন্ট
 *
 * PATCH /api/admin/support-reports  {id, historyIndex, action: 'edit-note' | 'delete-note', note?}
 *
 * নীতি:
 * - শুধু t==='note' এন্ট্রি সম্পাদনযোগ্য/মুছে-ফেল-যায় — স্টেটাস-এন্ট্রি = অডিট, অপরিবর্তনীয়
 *   (কে-কখন-স্টেটাস-বদলেছে তা পরে-সম্পাদনা-করা-যাবে-না — জবাবদিহিতা)
 * - edit: at/by অক্ষত রেখে note বদলায় + editedAt/editedBy/editedByRole যোগ হয় (টাইমলাইনে "সম্পাদিত"-ব্যাজ)
 * - delete: splice; মুছে-ফেলা-এন্ট্রিটি সর্বশেষ note হলে adminNote পরবর্তী-সর্বশেষ note-এ সিঙ্ক (না-থাকলে null) —
 *   ইউজার-দিকের my-reports-এ "ম্যানেজমেন্টের জবাব" সবসময় সর্বশেষ note-এর সাথে সামঞ্জস্যপূর্ণ থাকে
 * - edit/delete ইউজার-দৃশ্যমান-কনটেন্ট বদলায় → SUPPORT_UPDATE নোটিফিকেশন (থ্রটল notify()-এ)
 */
export async function PATCH(req: NextRequest) {
  try {
    const gate = await requireReviewer()
    if (gate.error) return gate.error

    const body = await req.json().catch(() => null)
    const id = body?.id as string | undefined
    const action = body?.action as string | undefined
    if (!id) return NextResponse.json({ error: 'id প্রয়োজন' }, { status: 400 })
    if (action !== 'edit-note' && action !== 'delete-note' && action !== 'restore-note')
      return NextResponse.json({ error: 'অবৈধ অ্যাকশন' }, { status: 400 })
    // session209 — restore-note-এ historyIndex ঐচ্ছিক (অনুপস্থিত/অবৈধ হলে শেষে যোগ হয়)
    const idx = body?.historyIndex === undefined ? -1 : Number(body?.historyIndex)
    if (action !== 'restore-note' && (!Number.isInteger(idx) || idx < 0))
      return NextResponse.json({ error: 'historyIndex প্রয়োজন' }, { status: 400 })

    const existing = await db.userReport.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'অভিযোগ পাওয়া যায়নি' }, { status: 404 })

    let historyArr: Record<string, unknown>[] = []
    if (existing.noteHistory) {
      try {
        const parsed = JSON.parse(existing.noteHistory)
        if (Array.isArray(parsed)) historyArr = parsed
      } catch {
        /* করাপ্ট-হিস্ট্রি → খালি */
      }
    }

    if (action === 'restore-note') {
      // session209 — ভুলে-মুছে-ফেলা নোট-এন্ট্রি ফিরিয়ে-আনা (অ্যান্ডু-উইন্ডো): এন্ট্রি সার্ভারে sanitize-হয় —
      // ক্লায়েন্ট-ডেটা বিশ্বাস-নয়: t বলশাই 'note', note ≤২০০০, at/by/editedAt ভ্যালিডেট+হোয়াইটলিস্ট
      const raw = (body?.entry ?? {}) as Record<string, unknown>
      const note = typeof raw.note === 'string' ? raw.note.trim() : ''
      if (!note) return NextResponse.json({ error: 'পুনরুদ্ধার-এন্ট্রিতে নোট প্রয়োজন' }, { status: 400 })
      if (note.length > 2000)
        return NextResponse.json({ error: 'নোট খুব বড় (সর্বোচ্চ ২০০০ অক্ষর)' }, { status: 400 })
      const ROLES = ['super_admin', 'admin', 'member']
      const atRaw = typeof raw.at === 'string' && !Number.isNaN(new Date(raw.at).getTime()) ? raw.at : ''
      const clean: Record<string, unknown> = {
        t: 'note',
        note,
        at: atRaw || new Date().toISOString(),
        by: typeof raw.by === 'string' && raw.by.trim() ? raw.by.trim().slice(0, 120) : gate.me.name || gate.me.username,
      }
      if (typeof raw.byRole === 'string' && ROLES.includes(raw.byRole)) clean.byRole = raw.byRole
      if (typeof raw.editedAt === 'string' && !Number.isNaN(new Date(raw.editedAt).getTime())) {
        clean.editedAt = raw.editedAt
        if (typeof raw.editedBy === 'string' && raw.editedBy.trim()) clean.editedBy = raw.editedBy.trim().slice(0, 120)
        if (typeof raw.editedByRole === 'string' && ROLES.includes(raw.editedByRole)) clean.editedByRole = raw.editedByRole
      }
      const insertAt = Number.isInteger(idx) && idx >= 0 ? Math.min(idx, historyArr.length) : historyArr.length
      historyArr.splice(insertAt, 0, clean)
    } else {
      if (idx >= historyArr.length)
        return NextResponse.json({ error: 'ইতিহাস-এন্ট্রি পাওয়া যায়নি' }, { status: 404 })

      const entry = historyArr[idx] as Record<string, unknown>
      if (entry?.t !== 'note')
        return NextResponse.json(
          { error: 'শুধু নোট-এন্ট্রি পরিবর্তনযোগ্য (স্টেটাস-এন্ট্রি অডিট-সুরক্ষিত)' },
          { status: 400 },
        )

      if (action === 'edit-note') {
        const note = (body?.note as string | undefined)?.trim()
        if (!note) return NextResponse.json({ error: 'নোট প্রয়োজন' }, { status: 400 })
        if (note.length > 2000)
          return NextResponse.json({ error: 'নোট খুব বড় (সর্বোচ্চ ২০০০ অক্ষর)' }, { status: 400 })
        historyArr[idx] = {
          ...entry,
          note,
          editedAt: new Date().toISOString(),
          editedBy: gate.me.name || gate.me.username,
          editedByRole: gate.me.role,
        }
      } else {
        historyArr.splice(idx, 1)
      }
    }

    // adminNote-সিঙ্ক: সর্বশেষ note-এন্ট্রিই বর্তমান জবাব
    let lastNote: string | null = null
    for (let i = historyArr.length - 1; i >= 0; i--) {
      if (historyArr[i]?.t === 'note') {
        lastNote = (historyArr[i] as { note?: string }).note ?? null
        break
      }
    }
    const adminNoteSynced = lastNote !== (existing.adminNote ?? null)

    const updated = await db.userReport.update({
      where: { id },
      data: {
        noteHistory: JSON.stringify(historyArr.slice(-50)),
        ...(adminNoteSynced ? { adminNote: lastNote } : {}),
      },
    })

    await notify({
      actorId: gate.me.id,
      recipientId: existing.senderId,
      type: 'SUPPORT_UPDATE',
    })

    return NextResponse.json({ report: updated })
  } catch (err) {
    console.error('support-reports PATCH error:', err)
    return NextResponse.json({ error: 'ইতিহাস-আপডেট ব্যর্থ' }, { status: 500 })
  }
}
