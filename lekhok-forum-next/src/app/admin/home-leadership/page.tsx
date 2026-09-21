/**
 * পুরনো পাথ /admin/home-leadership → ক্যানোনিকাল /admin/home/leadership (Task62-c)
 * পেজ-বাই-পেজ মডুলার স্ট্রাকচারে হোমপেজ-কনটেন্ট প্যানেল /admin/home/-এর অধীনে।
 */

import { redirect } from 'next/navigation'

export default function OldHomeLeadershipRedirect() {
  redirect('/admin/home/leadership')
}
