import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import type { User } from '@prisma/client'

export const SESSION_COOKIE = 'lf_user_id'

/**
 * কুকি-ভিত্তিক বর্তমান ইউজার — সেশন204 (Task 55) নিরাপত্তা-সংশোধন।
 *
 * আগের আচরণ: কুকি-শূন্যে/অবৈধ-কুকিতে প্রথম-ইউজার (super_admin) ফলব্যাক —
 * anon-কলার সুপার-অ্যাডমিনের পরিচয়ে API চালাতে পারত (auth-bypass ঝুঁকি;
 * যেমন anon /api/notifications-এ super-এর নোটিফিকেশন-তালিকা ফুটো হতো)।
 *
 * নতুন আচরণ: বৈধ কুকি না থাকলে null — প্রতিটি কল-সাইট ইতিমধ্যে
 * `if (!me) return 401` গার্ড-প্যাটার্ন মানে (route-guard-অডিট যাচাইকৃত),
 * তাই ফলব্যাক-অপসারণে কোনো কল-সাইট ভাঙে না — মৃত-গার্ডগুলোই জীবিত হয়।
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get(SESSION_COOKIE)?.value
  if (!userId) return null
  const user = await db.user.findUnique({ where: { id: userId } })
  return user ?? null
}
