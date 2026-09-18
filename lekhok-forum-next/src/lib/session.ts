import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'lf_user_id'

/** কুকি-ভিত্তিক বর্তমান ইউজার (ডেমো সেশন) — না পেলে প্রথম ইউজার */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get(SESSION_COOKIE)?.value
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user) return user
  }
  const first = await db.user.findFirst({ orderBy: { createdAt: 'asc' } })
  return first
}
