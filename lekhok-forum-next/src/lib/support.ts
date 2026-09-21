/**
 * Task 43 — সাপোর্ট-অ্যাডমিন হেল্পার (সার্ভার-সাইড)
 *
 * SystemSetting(key="SUPPORT_ADMIN_ID") → নির্বাচিত সাপোর্ট-অ্যাডমিনের User.id।
 * শর্ত: নির্বাচিত ইউজারের রোল ∈ [ADMIN, SUPER_ADMIN] — সেট-করার-সময় যাচাই হয়
 * (/api/admin/support-admin), পড়ার-সময় হালকা-যাচাই (ইউজার-মুছে-গেলে null)।
 */
import { db } from '@/lib/db'

export const SUPPORT_ADMIN_KEY = 'SUPPORT_ADMIN_ID'

/** নির্বাচিত সাপোর্ট-অ্যাডমিনের User.id — না-থাকলে null */
export async function getSupportAdminId(): Promise<string | null> {
  const row = await db.systemSetting.findUnique({ where: { key: SUPPORT_ADMIN_KEY } })
  return row?.value ?? null
}

/** নির্বাচিত সাপোর্ট-অ্যাডমিনের হালকা-প্রোফাইল — না-থাকলে null */
export async function getSupportAdmin() {
  const id = await getSupportAdminId()
  if (!id) return null
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, avatarUrl: true, role: true },
  })
  return user
}

/** সাপোর্ট-অ্যাডমিন নির্ধারণ (আপসার্ট) */
export async function setSupportAdmin(userId: string): Promise<void> {
  await db.systemSetting.upsert({
    where: { key: SUPPORT_ADMIN_KEY },
    create: { key: SUPPORT_ADMIN_KEY, value: userId },
    update: { value: userId },
  })
}

/** সাপোর্ট-অ্যাডমিন সরানো */
export async function clearSupportAdmin(): Promise<void> {
  await db.systemSetting.deleteMany({ where: { key: SUPPORT_ADMIN_KEY } })
}

/** এই-ইউজার কি বর্তমান সাপোর্ট-অ্যাডমিন? */
export async function isSupportAdmin(userId: string): Promise<boolean> {
  const id = await getSupportAdminId()
  return !!id && id === userId
}
