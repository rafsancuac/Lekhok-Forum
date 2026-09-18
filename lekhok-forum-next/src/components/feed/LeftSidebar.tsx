'use client'

import React from 'react'
import { Home, Clock, Bookmark, FileText, Feather, Users, UserRound, UserCheck, UsersRound, MessagesSquare } from 'lucide-react'
import type { FrontendUser } from '@/lib/types'
import { bn } from '@/lib/format'

export type MainTab = 'feed' | 'following' | 'timeline' | 'saved'

export default function LeftSidebar({
  current,
  users,
  activeTab,
  profileUsername = null,
  onTabChange,
  onOpenProfile,
  savedCount = 0,
  groups = null,
  onOpenGroups,
  onOpenGroup,
  groupsActive = false,
  messengerActive = false,
  onOpenMessenger,
}: {
  current: FrontendUser | null
  users: FrontendUser[]
  activeTab: MainTab
  profileUsername?: string | null
  onTabChange: (t: MainTab) => void
  /** আর ব্যবহৃত হয় না (ডেমো-সুইচ TopNavbar মেনুতে) — page.tsx কম্প্যাটের জন্য টাইপে রাখা */
  onSwitchUser?: (id: string) => void
  onOpenProfile: (username: string) => void
  savedCount?: number
  /** Session K: আমার গ্রুপ-তালিকা (page.tsx ফেচ করে পাঠায়) */
  groups?: { id: string; name: string; memberCount: number }[] | null
  onOpenGroups?: () => void
  onOpenGroup?: (groupId: string) => void
  groupsActive?: boolean
  /** Session L: মেসেঞ্জার */
  messengerActive?: boolean
  onOpenMessenger?: () => void
}) {
  return (
    <aside className="hidden lg:flex flex-col gap-1 w-[260px] shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-90px)] overflow-y-auto lf-scroll pb-4">
      {current && (
        <button
          onClick={() => onTabChange('timeline')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition font-semibold text-[15px] ${
            activeTab === 'timeline'
              ? 'bg-[#3a3b3c] text-white'
              : 'text-[#e4e6eb] hover:bg-[#3a3b3c]'
          }`}
        >
          {current.avatarUrl ? (
            <img src={current.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
          ) : (
            <span className="w-9 h-9 rounded-full bg-[#4e4f50]" />
          )}
          <span className="truncate">{current.name}</span>
        </button>
      )}

      <NavItem
        icon={<Home className="w-6 h-6" />}
        label="সোশ্যাল ফিড"
        active={activeTab === 'feed'}
        onClick={() => onTabChange('feed')}
      />
      <NavItem
        icon={
          <UserCheck
            className={`w-6 h-6 ${activeTab === 'following' ? 'text-[#00a86b]' : ''}`}
          />
        }
        label="অনুসরণ করা ফিড"
        active={activeTab === 'following'}
        onClick={() => onTabChange('following')}
      />
      <NavItem icon={<Clock className="w-6 h-6" />} label="সাম্প্রতিক" onClick={() => onTabChange('feed')} />
      <NavItem
        icon={<Bookmark className={`w-6 h-6 ${activeTab === 'saved' ? 'text-[#00a86b]' : ''}`} />}
        label="সেভ করা পোস্ট"
        active={activeTab === 'saved'}
        badge={savedCount}
        onClick={() => onTabChange('saved')}
      />
      <NavItem
        icon={<FileText className="w-6 h-6" />}
        label="আমার লেখা"
        onClick={() => onTabChange('timeline')}
      />
      <NavItem
        icon={
          <UsersRound
            className={`w-6 h-6 ${groupsActive ? 'text-[#00a86b]' : ''}`}
          />
        }
        label="গ্রুপসমূহ"
        active={groupsActive}
        onClick={() => onOpenGroups?.()}
      />
      <NavItem
        icon={
          <MessagesSquare
            className={`w-6 h-6 ${messengerActive ? 'text-[#00a86b]' : ''}`}
          />
        }
        label="মেসেঞ্জার"
        active={messengerActive}
        onClick={() => onOpenMessenger?.()}
      />

      <hr className="border-[#3e4042] my-2" />

      {/* Session K: আমার গ্রুপ শর্টকাট */}
      {groups && groups.length > 0 && (
        <>
          <p className="px-3 py-1 text-[11px] font-bold text-[#8a8d91] uppercase tracking-wide flex items-center gap-1.5">
            <UsersRound className="w-3.5 h-3.5" /> আমার গ্রুপ
          </p>
          {groups.slice(0, 5).map((g) => (
            <button
              key={g.id}
              onClick={() => onOpenGroup?.(g.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition group/grow hover:bg-[#3a3b3c] w-full"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d4a3a] to-[#0f172a] ring-1 ring-white/10 group-hover/grow:ring-[#00a86b]/50 flex items-center justify-center shrink-0 transition-all">
                <UsersRound className="w-4 h-4 text-[#00a86b]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-[#e4e6eb] truncate">
                  {g.name}
                </span>
                <span className="block text-[11px] text-[#8a8d91]">
                  {bn(g.memberCount)} সদস্য
                </span>
              </span>
            </button>
          ))}
          {groups.length > 5 && (
            <button
              onClick={() => onOpenGroups?.()}
              className="w-full text-left px-3 py-1.5 text-[12px] font-bold text-[#00a86b] hover:text-[#33d79f] transition"
            >
              সব গ্রুপ দেখুন ({bn(groups.length)})
            </button>
          )}
          <hr className="border-[#3e4042] my-2" />
        </>
      )}

      <p className="px-3 py-1 text-[11px] font-bold text-[#8a8d91] uppercase tracking-wide flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> লেখকবৃন্দ
      </p>
      {users.map((u) => {
        const profileActive = profileUsername === u.username
        return (
          <button
            key={u.id}
            onClick={() => onOpenProfile(u.username)}
            title={`${u.name}-এর প্রোফাইল দেখুন`}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition group/writer ${
              profileActive ? 'bg-[#3a3b3c] ring-1 ring-[#00a86b]/40' : 'hover:bg-[#3a3b3c]'
            }`}
          >
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full ring-1 ring-white/10 group-hover/writer:ring-[#00a86b]/50 transition-all"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#4e4f50]" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-[#e4e6eb] truncate">
                {u.name}
              </span>
              <span className="block text-[11px] text-[#8a8d91] truncate">@{u.username}</span>
            </span>
            <UserRound
              className={`w-4 h-4 shrink-0 transition ${
                profileActive
                  ? 'text-[#00a86b]'
                  : 'text-[#65676b] opacity-0 group-hover/writer:opacity-100'
              }`}
            />
          </button>
        )
      })}

      <hr className="border-[#3e4042] my-2" />
      <p className="px-3 text-[11px] text-[#8a8d91] leading-relaxed flex items-start gap-1.5">
        <Feather className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        লেখক ফোরাম — বাংলা লেখকদের নিজের ঠিকানা। গল্প, কবিতা, প্রবন্ধ শেয়ার করুন।
      </p>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold text-[15px] transition ${
        active ? 'bg-[#3a3b3c] text-white' : 'text-[#e4e6eb] hover:bg-[#3a3b3c]'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#006a4e] text-white text-[11px] font-bold flex items-center justify-center">
          {bn(badge)}
        </span>
      )}
    </button>
  )
}
