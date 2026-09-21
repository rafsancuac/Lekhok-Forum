/**
 * Task 43 — রোল-মডেল (ক্লায়েন্ট-সেফ: শুধু স্ট্রিং-তুলনা, কোনো db-import নেই)
 *
 * চুক্তি:
 *   super_admin → সব-ক্ষমতা (সাপোর্ট-অ্যাডমিন নির্ধারণ/সরানো শুধু এ-রোলে)
 *   admin       → ম্যানেজার (অভিযোগ-রিভিউ ডেস্ক, বিদ্যমান সব অ্যাডমিন-প্যানেল)
 *   member      → সাধারণ সদস্য (schema-default)
 */

export type AppRole = 'super_admin' | 'admin' | 'member'

export const APP_ROLES: AppRole[] = ['super_admin', 'admin', 'member']

/** ম্যানেজার = admin বা super_admin — বিদ্যমান অ্যাডমিন-গেট/API-গুলোতে এ-দুটোই চলে */
export function isManager(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

/** শুধু সুপার-অ্যাডমিন */
export function isSuperAdmin(role?: string | null): boolean {
  return role === 'super_admin'
}

/** বাংলা-লেবেল (ব্যাজ/পিকারে) */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'সুপার অ্যাডমিন',
  admin: 'অ্যাডমিন',
  member: 'সদস্য',
}

export function roleLabel(role?: string | null): string {
  return ROLE_LABELS[role ?? ''] ?? 'সদস্য'
}
