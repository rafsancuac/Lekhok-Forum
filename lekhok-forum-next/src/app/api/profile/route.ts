import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

/** PATCH /api/profile — সেশন ইউজারের কভার/অ্যাভাটার/বায়ো আপডেট */
export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'অবৈধ রিকোয়েস্ট' }, { status: 400 })
  }

  const data: { coverUrl?: string; avatarUrl?: string; bio?: string } = {}
  if (typeof body.coverUrl === 'string' && body.coverUrl.trim()) data.coverUrl = body.coverUrl
  if (typeof body.avatarUrl === 'string' && body.avatarUrl.trim()) data.avatarUrl = body.avatarUrl
  if (typeof body.bio === 'string') data.bio = body.bio.slice(0, 300)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'কোনো পরিবর্তনযোগ্য ফিল্ড পাওয়া যায়নি' }, { status: 400 })
  }

  try {
    const user = await db.user.update({ where: { id: me.id }, data })
    revalidatePath('/')
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio,
      },
    })
  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
