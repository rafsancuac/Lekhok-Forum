/**
 * হোম-নেতৃত্ব প্যানেল — /admin/home/leadership (ক্যানোনিকাল পাথ, Task62-c)
 * শেয়ার্ড HomeLeadershipPanel কম্পোনেন্ট রেন্ডার করে (টগল-সুইচসহ)।
 */

import HomeLeadershipPanel from '@/components/admin/HomeLeadershipPanel'

export const dynamic = 'force-dynamic'

export default function AdminHomeLeadershipPage() {
  return <HomeLeadershipPanel />
}
