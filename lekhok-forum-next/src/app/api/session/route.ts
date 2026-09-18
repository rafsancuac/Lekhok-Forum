import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, SESSION_COOKIE } from '@/lib/session'

/** বর্তমান সেশন ইউজার + সব ডেমো ইউজার (সুইচারের জন্য) */
export async function GET() {
  const current = await getCurrentUser()
  const users = await db.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, username: true, avatarUrl: true, coverUrl: true, bio: true, role: true },
  })
  return NextResponse.json({ current, users })
}

/** ইউজার সুইচ (ডেমো লগইন) */
export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId দরকার' }, { status: 400 })
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'ইউজার পাওয়া যায়নি' }, { status: 404 })
  const res = NextResponse.json({ current: user })
  res.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
