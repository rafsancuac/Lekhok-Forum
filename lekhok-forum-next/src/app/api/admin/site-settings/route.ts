/**
 * সাইট-কনটেন্ট অ্যাডমিন API (শুধু অ্যাডমিন) — মডুলার অ্যাডমিন ড্যাশবোর্ডের একক-ব্যাকএন্ড (Task62-c)
 *
 * GET    /api/admin/site-settings        → সব সেকশনের পূর্ণ ডাটা (notice, stats, welcome, mission, timeline, footer)
 * POST   /api/admin/site-settings        → kind-ভিত্তিক upsert (নো-পপআপ ইনলাইন-সেভ; সবসময় 200 + রেকর্ড)
 * DELETE /api/admin/site-settings?kind=stat&id=…  → তালিকা-আইটেম মুছে ফেলা (stat | timeline)
 *
 * kind-ম্যাপ:
 *   notice   → SiteNotice   (সিঙ্গলটন: text, linkUrl, isOn)
 *   welcome  → SiteContent  (key=welcome_msg:  title, body, isOn) — স্বাগত বক্তব্য
 *   mission  → SiteContent  (key=mission_vision: title, body, isOn) — লক্ষ্য ও উদ্দেশ্য
 *   footer   → FooterSetting(সিঙ্গলটন: aboutText, contactEmail, helpline, social URLs, copyrightText, isOn)
 *   stat     → SiteStat     (id খালি = নতুন; label, value, icon, sortOrder, isActive)
 *   timeline → TimelineItem (id খালি = নতুন; year, title, description, sortOrder, isActive)
 *
 * ডিজাইন-নোট: প্রতিটি লেখা str()-এ ছাঁটাই + হোয়াইটলিস্ট — কোনো raw body ঢোকে না।
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

const WELCOME_KEY = 'welcome_msg'
const MISSION_KEY = 'mission_vision'

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

function str(v: unknown, max = 400): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function bool(v: unknown, fallback = true): boolean {
  return typeof v === 'boolean' ? v : fallback
}

/** সব-সেকশন পূর্ণ ম্যাপ (না-থাকা সিঙ্গলটনও ডিফল্ট-রেকর্ড হিসেবে আসে — প্যানেল সহজ) */
async function loadAll() {
  const [notice, welcome, mission, footer, stats, timeline] = await Promise.all([
    db.siteNotice.findUnique({ where: { id: 'main' } }),
    db.siteContent.findUnique({ where: { key: WELCOME_KEY } }),
    db.siteContent.findUnique({ where: { key: MISSION_KEY } }),
    db.footerSetting.findUnique({ where: { id: 'main' } }),
    db.siteStat.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] }),
    db.timelineItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] }),
  ])

  return {
    notice: {
      text: notice?.text ?? '',
      linkUrl: notice?.linkUrl ?? '',
      isOn: notice?.isOn ?? false,
    },
    welcome: {
      title: welcome?.title ?? '',
      body: welcome?.body ?? '',
      isOn: welcome?.isOn ?? true,
    },
    mission: {
      title: mission?.title ?? '',
      body: mission?.body ?? '',
      isOn: mission?.isOn ?? true,
    },
    footer: {
      aboutText: footer?.aboutText ?? '',
      contactEmail: footer?.contactEmail ?? '',
      helpline: footer?.helpline ?? '',
      facebookUrl: footer?.facebookUrl ?? '',
      youtubeUrl: footer?.youtubeUrl ?? '',
      telegramUrl: footer?.telegramUrl ?? '',
      copyrightText: footer?.copyrightText ?? '',
      isOn: footer?.isOn ?? true,
    },
    stats,
    timeline,
  }
}

/** GET — সব সেকশনের পূর্ণ ডাটা */
export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error
  try {
    return NextResponse.json(await loadAll(), { status: 200 })
  } catch (error) {
    console.error('site-settings:GET', error)
    return NextResponse.json({ error: 'ডাটা লোড ব্যর্থ' }, { status: 500 })
  }
}

/** POST — kind-ভিত্তিক upsert (সবসময় 200 + সংরক্ষিত-রেকর্ড) */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const kind = str(body?.kind, 20)

    /* ─── নোটিশ-বার ─── */
    if (kind === 'notice') {
      const saved = await db.siteNotice.upsert({
        where: { id: 'main' },
        update: { text: str(body?.text, 400), linkUrl: str(body?.linkUrl, 500), isOn: bool(body?.isOn, false) },
        create: { id: 'main', text: str(body?.text, 400), linkUrl: str(body?.linkUrl, 500), isOn: bool(body?.isOn, false) },
      })
      return NextResponse.json(saved, { status: 200 })
    }

    /* ─── স্বাগত বক্তব্য / লক্ষ্য-উদ্দেশ্য ─── */
    if (kind === 'welcome' || kind === 'mission') {
      const key = kind === 'welcome' ? WELCOME_KEY : MISSION_KEY
      const saved = await db.siteContent.upsert({
        where: { key },
        update: { title: str(body?.title, 200), body: str(body?.body, 6000), isOn: bool(body?.isOn, true) },
        create: { key, title: str(body?.title, 200), body: str(body?.body, 6000), isOn: bool(body?.isOn, true) },
      })
      return NextResponse.json(saved, { status: 200 })
    }

    /* ─── ফুটার কনফিগারেশন ─── */
    if (kind === 'footer') {
      const saved = await db.footerSetting.upsert({
        where: { id: 'main' },
        update: {
          aboutText: str(body?.aboutText, 1200),
          contactEmail: str(body?.contactEmail, 200),
          helpline: str(body?.helpline, 100),
          facebookUrl: str(body?.facebookUrl, 500),
          youtubeUrl: str(body?.youtubeUrl, 500),
          telegramUrl: str(body?.telegramUrl, 500),
          copyrightText: str(body?.copyrightText, 300),
          isOn: bool(body?.isOn, true),
        },
        create: {
          id: 'main',
          aboutText: str(body?.aboutText, 1200),
          contactEmail: str(body?.contactEmail, 200),
          helpline: str(body?.helpline, 100),
          facebookUrl: str(body?.facebookUrl, 500),
          youtubeUrl: str(body?.youtubeUrl, 500),
          telegramUrl: str(body?.telegramUrl, 500),
          copyrightText: str(body?.copyrightText, 300),
          isOn: bool(body?.isOn, true),
        },
      })
      return NextResponse.json(saved, { status: 200 })
    }

    /* ─── পরিসংখ্যান-কার্ড (id খালি = নতুন) ─── */
    if (kind === 'stat') {
      const id = str(body?.id, 40)
      const data = {
        label: str(body?.label, 80),
        value: str(body?.value, 40),
        icon: str(body?.icon, 8) || '📊',
        sortOrder: Number.isFinite(body?.sortOrder) ? Math.trunc(body.sortOrder) : 0,
        isActive: bool(body?.isActive, true),
      }
      const saved = id
        ? await db.siteStat.upsert({ where: { id }, update: data, create: data })
        : await db.siteStat.create({ data })
      return NextResponse.json(saved, { status: 200 })
    }

    /* ─── টাইমলাইন-আইটেম (id খালি = নতুন) ─── */
    if (kind === 'timeline') {
      const id = str(body?.id, 40)
      const data = {
        year: str(body?.year, 20),
        title: str(body?.title, 200),
        description: str(body?.description, 1200),
        sortOrder: Number.isFinite(body?.sortOrder) ? Math.trunc(body.sortOrder) : 0,
        isActive: bool(body?.isActive, true),
      }
      const saved = id
        ? await db.timelineItem.upsert({ where: { id }, update: data, create: data })
        : await db.timelineItem.create({ data })
      return NextResponse.json(saved, { status: 200 })
    }

    return NextResponse.json({ error: 'অজানা kind' }, { status: 400 })
  } catch (error) {
    console.error('site-settings:POST', error)
    return NextResponse.json({ error: 'সংরক্ষণ ব্যর্থ হয়েছে' }, { status: 500 })
  }
}

/** DELETE — তালিকা-আইটেম মুছে ফেলা (?kind=stat|timeline&id=…) */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const { searchParams } = new URL(req.url)
    const kind = str(searchParams.get('kind'), 20)
    const id = str(searchParams.get('id'), 40)
    if (!id) {
      return NextResponse.json({ error: 'id প্রয়োজন' }, { status: 400 })
    }

    if (kind === 'stat') {
      await db.siteStat.delete({ where: { id } }).catch(() => null)
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    if (kind === 'timeline') {
      await db.timelineItem.delete({ where: { id } }).catch(() => null)
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    return NextResponse.json({ error: 'অজানা kind' }, { status: 400 })
  } catch (error) {
    console.error('site-settings:DELETE', error)
    return NextResponse.json({ error: 'মুছে ফেলা ব্যর্থ' }, { status: 500 })
  }
}
