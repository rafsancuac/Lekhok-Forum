/**
 * পাবলিক সাইট-কনটেন্ট API — হোমপেজের অ্যাডমিন-নিয়ন্ত্রিত সেকশনগুলোর একক ডাটা-সোর্স (Task62-c)
 *
 * GET /api/site-content →
 * {
 *   notice:   { text, linkUrl, isOn },              // জরুরি নোটিশ-বার
 *   stats:    [{ id, label, value, icon }],         // পরিসংখ্যান-কাউন্টার (শুধু isActive)
 *   welcome:  { title, body, isOn },                // স্বাগত বক্তব্য
 *   mission:  { title, body, isOn },                // লক্ষ্য ও উদ্দেশ্য
 *   timeline: [{ id, year, title, description }],   // ঐতিহাসিক মাইলফলক (শুধু isActive)
 *   footer:   { aboutText, contactEmail, helpline, facebookUrl, youtubeUrl, telegramUrl, copyrightText, isOn },
 * }
 *
 * force-dynamic: অ্যাডমিন-প্যানেলে সেভ করলেই হোমপেজে সাথে-সাথে দেখা যায় (হুবহু-সিঙ্ক)।
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const WELCOME_KEY = 'welcome_msg'
const MISSION_KEY = 'mission_vision'

export async function GET() {
  try {
    const [notice, welcome, mission, footer, stats, timeline] = await Promise.all([
      db.siteNotice.findUnique({ where: { id: 'main' } }),
      db.siteContent.findUnique({ where: { key: WELCOME_KEY } }),
      db.siteContent.findUnique({ where: { key: MISSION_KEY } }),
      db.footerSetting.findUnique({ where: { id: 'main' } }),
      db.siteStat.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      }),
      db.timelineItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      }),
    ])

    return NextResponse.json(
      {
        notice: {
          text: notice?.text ?? '',
          linkUrl: notice?.linkUrl ?? '',
          isOn: notice?.isOn ?? false,
        },
        stats: stats.map((s) => ({ id: s.id, label: s.label, value: s.value, icon: s.icon })),
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
        timeline: timeline.map((t) => ({
          id: t.id,
          year: t.year,
          title: t.title,
          description: t.description,
        })),
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
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('site-content:publicGET', error)
    return NextResponse.json({ error: 'লোড ব্যর্থ' }, { status: 500 })
  }
}
