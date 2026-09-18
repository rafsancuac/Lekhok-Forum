'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Bookmark,
  Camera,
  FileText,
  Feather,
  Home,
  Loader2,
  MessagesSquare,
  Search,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import type { FrontendUser } from '@/lib/types'
import ResponsiveModal from '@/components/shared/ui/ResponsiveModal'
import { useIsMobile } from '@/hooks/use-mobile'

/**
 * session160 — ৯-ডট ফোরাম ডিরেক্টরি + টাইপ-টু-ফিল্টার (ইউজার-স্পেক: AppLauncherMenu.tsx)
 *
 * ─ ডেস্কটপ: ৯-ডট বাটন → ৪২০px ড্রপডাউন, অটো-ফোকাস ইনপুট, টাইপের-সাথে-সাথে ফিল্টার
 * ─ মোবাইল : একই ডিরেক্টরি ResponsiveModal বটম-শিটে (দুই-কলাম গ্রিড)
 * ─ বাংলা ও ইংরেজি — দুই-ভাষার কীওয়ার্ডেই ম্যাচ করে
 */

interface LauncherItem {
  id: string
  title: string
  desc: string
  category: string
  keywords: string
  icon: React.ReactNode
  badge?: string
  action: () => void
}

const CATEGORIES = ['লেখা ও ফিড', 'ফোরাম ও কার্যক্রম', 'যোগাযোগ', 'প্রোফাইল'] as const

export default function AppLauncherMenu({
  current,
  onOpenComposer,
  onTabChange,
  onOpenGroups,
  onCreateGroup,
  onOpenMessenger,
  onOpenProfile,
  onOpenLatestStory,
}: {
  current: FrontendUser | null
  onOpenComposer?: () => void
  onTabChange?: (t: 'feed' | 'following' | 'saved' | 'timeline') => void
  onOpenGroups?: () => void
  onCreateGroup?: () => void
  onOpenMessenger?: () => void
  onOpenProfile?: (username: string) => void
  /** সর্বশেষ স্টোরি খোলে (page.tsx ফেচ-করে প্রথম স্টোরি-আইডি দেয়) */
  onOpenLatestStory?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [storyBusy, setStoryBusy] = useState(false)
  const isMobile = useIsMobile()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* খোলামাত্র অটো-ফোকাস + কুয়েরি-রিসেট; বন্ধেও রিসেট */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
    setQuery('')
  }, [open])

  /* বাইরে-ক্লিকে বন্ধ (শুধু ডেস্কটপ-ড্রপডাউন) */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const items: LauncherItem[] = useMemo(
    () => [
      {
        id: 'compose',
        title: 'নতুন লেখা',
        desc: 'গল্প, কবিতা বা প্রবন্ধ লিখুন',
        category: 'লেখা ও ফিড',
        keywords: 'post compose write লেখা নতুন লিখুন',
        icon: <Feather className="w-4.5 h-4.5" />,
        badge: 'নতুন',
        action: () => onOpenComposer?.(),
      },
      {
        id: 'feed',
        title: 'সোশ্যাল ফিড',
        desc: 'সব লেখকের সাম্প্রতিক কাজ',
        category: 'লেখা ও ফিড',
        keywords: 'feed home ফিড হোম সব',
        icon: <Home className="w-4.5 h-4.5" />,
        action: () => onTabChange?.('feed'),
      },
      {
        id: 'following',
        title: 'অনুসরণ করা ফিড',
        desc: 'পছন্দের লেখকদের লেখা',
        category: 'লেখা ও ফিড',
        keywords: 'following feed অনুসরণ ফলো',
        icon: <UserCheck className="w-4.5 h-4.5" />,
        action: () => onTabChange?.('following'),
      },
      {
        id: 'saved',
        title: 'সেভ করা পোস্ট',
        desc: 'পরে-পড়ার তালিকা',
        category: 'লেখা ও ফিড',
        keywords: 'saved bookmark সেভ বুকমার্ক',
        icon: <Bookmark className="w-4.5 h-4.5" />,
        action: () => onTabChange?.('saved'),
      },
      {
        id: 'timeline',
        title: 'আমার লেখা',
        desc: 'নিজের সব পোস্ট এক-জায়গায়',
        category: 'লেখা ও ফিড',
        keywords: 'my posts timeline আমার লেখা তালিকা',
        icon: <FileText className="w-4.5 h-4.5" />,
        action: () => onTabChange?.('timeline'),
      },
      {
        id: 'groups',
        title: 'গ্রুপসমূহ',
        desc: 'আড্ডা ও সাহিত্য-বৃত্ত',
        category: 'ফোরাম ও কার্যক্রম',
        keywords: 'group groups গ্রুপ বৃত্ত',
        icon: <UsersRound className="w-4.5 h-4.5" />,
        action: () => onOpenGroups?.(),
      },
      {
        id: 'create-group',
        title: 'নতুন গ্রুপ তৈরি',
        desc: 'নিজের সাহিত্য-বৃত্ত গড়ুন',
        category: 'ফোরাম ও কার্যক্রম',
        keywords: 'create group নতুন গ্রুপ তৈরি',
        icon: <Users className="w-4.5 h-4.5" />,
        action: () => onCreateGroup?.(),
      },
      {
        id: 'story',
        title: 'স্টোরি',
        desc: '২৪-ঘণ্টার ছবি ও মুহূর্ত',
        category: 'ফোরাম ও কার্যক্রম',
        keywords: 'story stories স্টোরি ছবি',
        icon: <Camera className="w-4.5 h-4.5" />,
        action: () => {
          if (storyBusy) return
          setStoryBusy(true)
          try {
            onOpenLatestStory?.()
          } finally {
            setTimeout(() => setStoryBusy(false), 600)
          }
        },
      },
      {
        id: 'messenger',
        title: 'মেসেঞ্জার',
        desc: 'ব্যক্তিগত কথোপকথন',
        category: 'যোগাযোগ',
        keywords: 'message chat messenger মেসেজ চ্যাট মেসেঞ্জার',
        icon: <MessagesSquare className="w-4.5 h-4.5" />,
        action: () => onOpenMessenger?.(),
      },
      {
        id: 'notifications',
        title: 'বিজ্ঞপ্তি',
        desc: 'রিঅ্যাকশন, কমেন্ট ও ফলো',
        category: 'যোগাযোগ',
        keywords: 'notification bell alert বিজ্ঞপ্তি নোটিফিকেশন ঘণ্টা',
        icon: <Bell className="w-4.5 h-4.5" />,
        action: () => {
          window.dispatchEvent(new CustomEvent('lf:open-notifications'))
        },
      },
      {
        id: 'profile',
        title: 'আমার প্রোফাইল',
        desc: current ? `${current.name} (@${current.username})` : 'প্রোফাইল দেখুন',
        category: 'প্রোফাইল',
        keywords: 'profile me account প্রোফাইল আমার অ্যাকাউন্ট',
        icon: <UserRound className="w-4.5 h-4.5" />,
        disabled: !current,
        action: () => current && onOpenProfile?.(current.username),
      } as LauncherItem & { disabled?: boolean },
    ],
    [current, onOpenComposer, onTabChange, onOpenGroups, onCreateGroup, onOpenMessenger, onOpenProfile, onOpenLatestStory, storyBusy]
  )

  /* টাইপ-টু-ফিল্টার — title/desc/category/keywords, কেস-অসংবেদী */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.keywords.toLowerCase().includes(q)
    )
  }, [items, query])

  const run = (it: LauncherItem) => {
    setOpen(false)
    // বন্ধ-অ্যানিমেশনের সাথে রেস না-করতে অ্যাকশন মাইক্রো-টাস্কে
    setTimeout(() => it.action(), 30)
  }

  const close = () => setOpen(false)

  /* ─── ডিরেক্টরি-বডি (ডেস্কটপ-ড্রপডাউন + মোবাইল-শিট দুই-জায়গায় একই) ─── */
  const directoryBody = (twoCol: boolean) => (
    <>
      {/* সার্চ-স্ট্রিপ */}
      <div className="p-3 border-b border-[#3e4042] bg-[#1f2021] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs text-white">ফোরাম ডিরেক্টরি</span>
          <span className="text-[10.5px] text-[#8a8d91]">সরাসরি টাইপ করে খুঁজুন</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8d91]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন: লেখা, গ্রুপ, মেসেঞ্জার, story..."
            aria-label="ডিরেক্টরি ফিল্টার"
            className="w-full bg-[#3a3b3c] border border-transparent focus:border-[#00a86b]/60 rounded-lg pl-9 pr-8 py-2 text-[12.5px] text-white placeholder:text-[#8a8d91] outline-none transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="ফিল্টার মুছুন"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8d91] hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ফিল্টারকৃত আইটেম */}
      <div className="overflow-y-auto lf-scroll overscroll-contain p-2.5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center space-y-2" role="status">
            <Search className="w-8 h-8 text-[#4e4f50] mx-auto" />
            <p className="text-[#8a8d91] text-xs">
              &ldquo;{query}&rdquo; সম্পর্কিত কোনো ফিচার পাওয়া যায়নি
            </p>
            <button
              onClick={() => setQuery('')}
              className="text-[11px] font-bold text-[#00a86b] hover:text-[#33d79f] transition"
            >
              ফিল্টার মুছে সব দেখুন
            </button>
          </div>
        ) : (
          CATEGORIES.map((cat) => {
            const rows = filtered.filter((it) => it.category === cat)
            if (rows.length === 0) return null
            return (
              <div key={cat} className="mb-2.5 last:mb-0">
                <p className="px-1.5 py-1 text-[10.5px] font-bold text-[#8a8d91] uppercase tracking-wide">
                  {cat}
                </p>
                <div className={twoCol ? 'grid grid-cols-1 sm:grid-cols-2 gap-1' : 'space-y-0.5'}>
                  {rows.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => run(it)}
                      className="lf-launch-tile w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-[#3a3b3c] border border-transparent hover:border-[#4e4f50]/60 transition group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#006a4e]/25 group-hover:bg-[#006a4e]/45 text-[#00a86b] flex items-center justify-center shrink-0 transition-colors">
                        {it.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-bold text-[#e4e6eb] group-hover:text-white truncate transition">
                            {it.title}
                          </span>
                          {it.badge && (
                            <span className="px-1.5 py-px bg-[#00a86b]/20 text-[#00a86b] rounded text-[9px] font-bold shrink-0">
                              {it.badge}
                            </span>
                          )}
                          {it.id === 'story' && storyBusy && (
                            <Loader2 className="w-3 h-3 animate-spin text-[#00a86b] shrink-0" />
                          )}
                        </span>
                        <span className="block text-[10.5px] text-[#8a8d91] truncate mt-px">
                          {it.desc}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )

  return (
    <div className="relative" ref={wrapRef}>
      {/* টপবার ৯-ডট বাটন */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="ফোরাম ডিরেক্টরি ও ফিচারসমূহ"
        aria-expanded={open}
        title="ফোরাম ডিরেক্টরি ও ফিচারসমূহ"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
          open
            ? 'bg-[#4e4f50] text-[#00a86b]'
            : 'bg-[#3a3b3c] hover:bg-[#4a4c4e] text-[#b0b3b8] hover:text-[#00a86b]'
        }`}
      >
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="5" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </svg>
      </button>

      {/* ডেস্কটপ ড্রপডাউন (শুধু md+) */}
      {open && !isMobile && (
        <div className="absolute top-11 right-0 w-[400px] bg-[#2c2d2e] border border-[#3e4042] rounded-xl shadow-2xl z-50 overflow-hidden lf-anim-pop origin-top-right">
          <div className="max-h-[70vh] flex flex-col">{directoryBody(false)}</div>
        </div>
      )}

      {/* মোবাইল বটম-শিট (ResponsiveModal ইঞ্জিন — session160) */}
      {open && isMobile && (
        <ResponsiveModal
          isOpen={open}
          onClose={close}
          title="ফোরাম ডিরেক্টরি"
          maxWidthClass="max-w-md"
          zIndexClass="z-[95]"
        >
          {directoryBody(true)}
        </ResponsiveModal>
      )}
    </div>
  )
}
