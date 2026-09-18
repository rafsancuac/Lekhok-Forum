'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Feather, Search, Users, X, UsersRound, MessagesSquare } from 'lucide-react'
import NotificationBell from '@/components/feed/NotificationBell'
import AppLauncherMenu from '@/components/navigation/AppLauncherMenu'
import { useUnreadCounts } from '@/hooks/useUnreadCounts'
import type { FrontendUser } from '@/lib/types'
import { bn } from '@/lib/format'

export default function TopNavbar({
  current,
  users,
  onSwitchUser,
  searchQuery,
  onSearchChange,
  onNavigateToPost,
  onOpenStory,
  onOpenProfile,
  onOpenGroups,
  onOpenMessenger,
  onOpenComposer,
  onCreateGroup,
  onTabChange,
  onOpenLatestStory,
}: {
  current: FrontendUser | null
  users: FrontendUser[]
  onSwitchUser: (id: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onNavigateToPost?: (postId: string) => void
  onOpenStory?: (storyId: string) => void
  onOpenProfile?: (username: string) => void
  onOpenGroups?: () => void
  onOpenMessenger?: () => void
  /** session160 — ৯-ডট ডিরেক্টরি-অ্যাকশনসমূহ */
  onOpenComposer?: () => void
  onCreateGroup?: () => void
  onTabChange?: (t: 'feed' | 'following' | 'saved' | 'timeline') => void
  onOpenLatestStory?: () => void
}) {
  const [userMenu, setUserMenu] = useState(false)
  const [local, setLocal] = useState(searchQuery)
  /* session160: লাইভ অপঠিত-কাউন্ট — একক-হুক ৪৫-সে-পোলিং (আগের ২০-সে-ডেডিকেটেড-পোলের বদলে) */
  const { messages: unreadMsgs } = useUnreadCounts(!!current)
  const menuRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocal(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleChange = (v: string) => {
    setLocal(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(v), 350)
  }

  return (
    <header className="sticky top-0 z-40 bg-[#242526] border-b border-[#3e4042] shadow-md">
      <div className="max-w-[1240px] mx-auto flex items-center gap-3 px-3 h-14">
        {/* লোগো */}
        <button
          onClick={() => onSearchChange('')}
          className="flex items-center gap-2 shrink-0"
          aria-label="লেখক ফোরাম হোম"
        >
          <span className="w-9 h-9 rounded-full bg-[#006a4e] flex items-center justify-center shadow-md shadow-black/30">
            <Feather className="w-5 h-5 text-white" />
          </span>
          <span className="font-extrabold text-lg text-white hidden sm:block leading-tight">
            লেখক ফোরাম
            <span className="block text-[9px] font-medium text-[#b0b3b8] -mt-0.5 tracking-wide">
              LEKHOK FORUM
            </span>
          </span>
        </button>

        {/* লাইভ সার্চ */}
        <div className="flex-1 max-w-xs flex items-center gap-2 bg-[#3a3b3c] focus-within:ring-1 focus-within:ring-[#00a86b] rounded-full px-3.5 py-2 transition">
          <Search className="w-4 h-4 text-[#b0b3b8] shrink-0" />
          <input
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="লেখা বা লেখক খুঁজুন..."
            className="bg-transparent outline-none text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] w-full min-w-0"
            aria-label="খুঁজুন"
          />
          {local && (
            <button
              onClick={() => handleChange('')}
              className="text-[#8a8d91] hover:text-white shrink-0"
              aria-label="সার্চ মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 md:hidden" />

        {/* session160 — ৯-ডট ফোরাম ডিরেক্টরি (টাইপ-টু-ফিল্টার) */}
        <AppLauncherMenu
          current={current}
          onOpenComposer={onOpenComposer}
          onTabChange={onTabChange}
          onOpenGroups={onOpenGroups}
          onCreateGroup={onCreateGroup}
          onOpenMessenger={onOpenMessenger}
          onOpenProfile={onOpenProfile}
          onOpenLatestStory={onOpenLatestStory}
        />

        {/* গ্রুপসমূহ (Session K — মোবাইল সহ সর্বত্র) */}
        {onOpenGroups && (
          <button
            onClick={onOpenGroups}
            aria-label="গ্রুপসমূহ দেখুন"
            title="গ্রুপসমূহ"
            className="w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4a4c4e] flex items-center justify-center text-[#b0b3b8] hover:text-[#00a86b] transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <UsersRound className="w-4.5 h-4.5" />
          </button>
        )}

        {/* মেসেঞ্জার (Session L — মোবাইল সহ সর্বত্র) */}
        {onOpenMessenger && (
          <button
            onClick={onOpenMessenger}
            aria-label="মেসেঞ্জার খুলুন"
            title="মেসেঞ্জার"
            className="relative w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4a4c4e] flex items-center justify-center text-[#b0b3b8] hover:text-[#00a86b] transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <MessagesSquare className="w-4.5 h-4.5" />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00a86b] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#242526] lf-unread-chip">
                {bn(unreadMsgs)}
              </span>
            )}
          </button>
        )}

        {/* নোটিফিকেশন */}
        <NotificationBell
          current={current}
          onNavigateToPost={onNavigateToPost}
          onOpenStory={onOpenStory}
          onOpenProfile={onOpenProfile}
        />

        {/* ইউজার সুইচার */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] transition"
            aria-label="প্রোফাইল মেনু"
          >
            {current?.avatarUrl ? (
              <img src={current.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-[#4e4f50]" />
            )}
            <ChevronDown className="w-4 h-4 text-[#b0b3b8]" />
          </button>

          {userMenu && (
            <div className="absolute right-0 top-12 w-72 bg-[#2c2d2e] border border-[#3e4042] rounded-xl shadow-2xl overflow-hidden lf-anim-pop origin-top-right">
              {current && (
                <button
                  onClick={() => {
                    onOpenProfile?.(current.username)
                    setUserMenu(false)
                  }}
                  title="নিজের প্রোফাইলে যান"
                  className="w-full p-3 flex items-center gap-3 border-b border-[#3e4042] hover:bg-[#3a3b3c] transition text-left"
                >
                  {current.avatarUrl && (
                    <img src={current.avatarUrl} alt="" className="w-12 h-12 rounded-full ring-2 ring-transparent hover:ring-[#00a86b]/60 transition-all" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm truncate">{current.name}</p>
                    <p className="text-xs text-[#b0b3b8] truncate">@{current.username}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#00a86b]">প্রোফাইল</span>
                </button>
              )}
              <p className="px-3 pt-2.5 pb-1 text-[11px] font-bold text-[#8a8d91] uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> ডেমো আইডেন্টিটি সুইচ
              </p>
              <div className="max-h-64 overflow-y-auto lf-scroll pb-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id)
                      setUserMenu(false)
                    }}
                    className={`w-full px-3 py-2 hover:bg-[#3a3b3c] flex items-center gap-2.5 text-left transition ${
                      current?.id === u.id ? 'bg-[#3a3b3c]/60' : ''
                    }`}
                  >
                    {u.avatarUrl && (
                      <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-white truncate">
                        {u.name} {current?.id === u.id && '✓'}
                      </span>
                      <span className="block text-[11px] text-[#b0b3b8] truncate">
                        @{u.username}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
