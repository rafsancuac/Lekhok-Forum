'use client'

/**
 * অ্যাডমিন লেআউট — পেজ-বাই-পেজ মডুলার সাইডবার (Task62-c)
 *
 * ইউজার-স্পেক: অ্যাডমিন ড্যাশবোর্ড পেইজ বাই পেইজ, সেকশন বাই সেকশন অনুযায়ী সাজানো —
 * যেন সহজেই সব খুঁজে পাওয়া যায়, পরিবর্তন করা যায়।
 *   • বাম-সাইডবার: পেজ-ভিত্তিক গ্রুপ (হোমপেজ / পরিচিতি / সংগঠন / কনফিগারেশন)
 *   • মোবাইল: উপরে আনুভূমিক স্ক্রল-নেভ
 *   • সব প্যানেল নিজের গেট (AdminGate) নিজেই চালায় — লেআউট শুধু নেভিগেশন
 */

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupportPending } from '@/hooks/useSupportPending'

interface MenuItem {
  label: string
  href: string
  icon: string
}

interface NavGroup {
  title: string
  items: MenuItem[]
}

const ADMIN_NAVIGATION: NavGroup[] = [
  {
    title: 'হোমপেজ কনটেন্ট',
    items: [
      { label: 'নেতৃত্ব ও উপদেষ্টা পরিষদ', href: '/admin/home/leadership', icon: '👥' },
      { label: 'জরুরি নোটিশ বার', href: '/admin/home/notice', icon: '📢' },
      { label: 'পরিসংখ্যান কাউন্টার', href: '/admin/home/stats', icon: '📊' },
      { label: 'স্বাগত বক্তব্য', href: '/admin/home/welcome', icon: '📜' },
    ],
  },
  {
    title: 'পরিচিতি ও ইতিহাস',
    items: [
      { label: 'লক্ষ্য, উদ্দেশ্য ও নীতিমালা', href: '/admin/about/mission-vision', icon: '🎯' },
      { label: 'ঐতিহাসিক মাইলফলক (টাইমলাইন)', href: '/admin/about/timeline', icon: '⏳' },
    ],
  },
  {
    title: 'সংগঠন ও সদস্য',
    items: [
      { label: 'কমিটি ব্যবস্থাপনা (পূর্ণ তালিকা)', href: '/admin/leadership', icon: '🗂️' },
    ],
  },
  {
    title: '🛡️ সাপোর্ট কেন্দ্র',
    items: [
      { label: 'অভিযোগ রিভিউ ডেস্ক', href: '/admin/support/reports', icon: '🛡️' },
      { label: 'সাপোর্ট-অ্যাডমিন নির্ধারণ', href: '/admin/support/settings', icon: '📌' },
    ],
  },
  {
    title: 'সাইট কনফিগারেশন',
    items: [{ label: 'ফুটার, হেল্পলাইন ও সোশ্যাল লিঙ্ক', href: '/admin/settings/footer-social', icon: '⚙️' }],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // session202 — সাপোর্ট-কেন্দ্র লাইভ পেন্ডিং-ব্যাজ (নীরব ৪০৩-ইগনোর; মেম্বারে null)
  const { pending } = useSupportPending()

  const navLinkCls = (isActive: boolean) =>
    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
      isActive
        ? 'bg-emerald-50 text-[#006A4E] font-bold border border-emerald-200/80 shadow-2xs'
        : 'text-[#4B4C4F] hover:bg-[#F2F4F7] hover:text-[#050505] border border-transparent'
    }`

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-hind text-[#050505]">
      {/* মোবাইল-টপবার (md-এর নিচে) — আনুভূমিক স্ক্রল-নেভ */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-[#CED0D4] shadow-2xs">
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
          <Link href="/admin" className="text-sm font-bold text-[#006A4E] flex items-center gap-1.5">
            <span aria-hidden>⚙️</span>
            <span>লেখক ফোরাম কন্ট্রোল</span>
          </Link>
          <Link href="/" className="text-[11px] font-bold text-[#65676B] hover:text-[#050505]">
            সাইটে ফিরুন
          </Link>
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto lf-scroll px-3 pb-2">
          {ADMIN_NAVIGATION.flatMap((g) => g.items).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-[#006A4E] border border-emerald-200/80'
                    : 'bg-[#F0F2F5] text-[#4B4C4F] border border-transparent'
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
                {item.href === '/admin/support/reports' && pending !== null && pending > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9.5px] font-extrabold flex items-center justify-center lf-anim-fade">
                    {pending}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex">
        {/* বাম পাশের সুশৃঙ্খল সাইডবার (md+) */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[#CED0D4] flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 border-b border-[#E4E6EB]">
            <Link href="/admin" className="text-base font-bold text-[#006A4E] flex items-center gap-2 hover:opacity-80 transition">
              <span aria-hidden>⚙️</span>
              <span>লেখক ফোরাম কন্ট্রোল</span>
            </Link>
            <p className="text-[11px] text-[#65676B] mt-0.5">সাইট কনটেন্ট অ্যাডমিন প্যানেল</p>
          </div>

          <nav className="flex-1 p-3 space-y-4">
            {ADMIN_NAVIGATION.map((group) => (
              <div key={group.title} className="space-y-1">
                <span className="text-[10.5px] font-bold text-[#8A8D91] uppercase tracking-wider px-2 block">
                  {group.title}
                </span>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const showPending = item.href === '/admin/support/reports' && pending !== null && pending > 0
                  return (
                    <Link key={item.href} href={item.href} className={navLinkCls(isActive)}>
                      <span aria-hidden>{item.icon}</span>
                      <span>{item.label}</span>
                      {showPending && (
                        <span
                          aria-label={`নতুন অভিযোগ ${pending}টি`}
                          className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center lf-anim-fade shadow-2xs"
                        >
                          {pending}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-[#E4E6EB]">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] rounded-[6px] text-xs font-bold text-[#050505] transition cursor-pointer"
            >
              ← সাইটে ফিরে যান
            </Link>
          </div>
        </aside>

        {/* ডান পাশের মূল ওয়ার্কস্পেস */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
      </div>
    </div>
  )
}
