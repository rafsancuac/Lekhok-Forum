'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { UserPlus, UserCheck, Loader2, Users, Feather, Image as ImageIcon } from 'lucide-react'
import type { FrontendUser } from '@/lib/types'
import { bn } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import ResponsiveModal from '@/components/shared/ui/ResponsiveModal'

/** কানেকশন-লিস্টের রো (API /connections রেসপন্স) */
export interface ConnectionUser {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  bio: string | null
  postCount: number
  followerCount: number
  isFollowing: boolean
  isSelf: boolean
}

/**
 * Session I: ফলোয়ার/ফলোয়িং লিস্ট-মডাল — পোর্টাল, ২-ট্যাব (অনুসারী/অনুসরণ),
 * ইনলাইন ফলো-টগল, রো-ক্লিকে প্রোফাইল-নেভিগেশন।
 */
export default function FollowListModal({
  username,
  displayName,
  initialTab,
  onClose,
  onOpenProfile,
}: {
  username: string
  displayName: string
  initialTab: 'followers' | 'following'
  onClose: () => void
  onOpenProfile?: (username: string) => void
}) {
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab)
  const [users, setUsers] = useState<ConnectionUser[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => setMounted(true), [])

  /* লোড */
  const load = useCallback(async (t: 'followers' | 'following') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(username)}/connections?type=${t}`
      )
      if (!res.ok) throw new Error('লিস্ট লোড ব্যর্থ')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অজানা সমস্যা')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  /* ট্যাব-সুইচে লিস্ট-ক্যাশ ফ্রি (দুই ট্যাবের রো আলাদা) */
  useEffect(() => {
    setUsers(null)
  }, [tab])

  /* Esc-ক্লোজ ও body-লক ResponsiveModal-এ কেন্দ্রীভূত (session160) */

  /* ফলো-টগল (অপটিমিস্টিক) */
  const toggleFollow = async (u: ConnectionUser) => {
    if (busyId) return
    setBusyId(u.id)
    const prev = users
    setUsers((list) =>
      (list || []).map((x) =>
        x.id === u.id
          ? { ...x, isFollowing: !x.isFollowing, followerCount: Math.max(0, x.followerCount + (x.isFollowing ? -1 : 1)) }
          : x
      )
    )
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(u.username)}/follow`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers((list) =>
        (list || []).map((x) =>
          x.id === u.id
            ? { ...x, isFollowing: data.following, followerCount: data.followers }
            : x
        )
      )
      try {
        window.dispatchEvent(new CustomEvent('lf:follow-changed'))
      } catch {
        /* ignore */
      }
    } catch {
      setUsers(prev)
      toast({ title: 'ফলো পরিবর্তন ব্যর্থ', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const openProfile = (u: string) => {
    onClose()
    onOpenProfile?.(u)
  }

  if (!mounted) return null

  /* session160: রেসপন্সিভ-মডাল ইঞ্জিনে মাইগ্রেট — মোবাইলে বটম-শিট + ট্যাব-স্ট্রিপ headerExtra-তে */
  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-[#00a86b]" />
          {displayName}
        </span>
      }
      maxWidthClass="max-w-[420px]"
      zIndexClass="z-[85]"
      headerExtra={
        <div className="px-4 -mb-px shrink-0 border-b border-[#3e4042]">
          <div className="flex" role="tablist">
            <TabButton
              active={tab === 'followers'}
              onClick={() => setTab('followers')}
              label="অনুসারী"
            />
            <TabButton
              active={tab === 'following'}
              onClick={() => setTab('following')}
              label="অনুসরণ"
            />
          </div>
        </div>
      }
    >
          {loading && (
            <div className="space-y-3 p-4" role="status">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full lf-shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 lf-shimmer rounded" />
                    <div className="h-2.5 w-20 lf-shimmer rounded" />
                  </div>
                  <div className="w-20 h-8 rounded-lg lf-shimmer" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center space-y-2">
              <p className="text-rose-400 text-sm font-semibold">{error}</p>
              <button
                onClick={() => load(tab)}
                className="text-xs font-bold text-[#00a86b] hover:text-[#33d79f] transition"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {!loading && !error && users?.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
                <Feather className="w-7 h-7 text-[#00a86b]" />
              </span>
              <p className="font-bold text-white text-sm">
                {tab === 'followers' ? 'এখনো কোনো অনুসারী নেই' : 'কাউকে অনুসরণ করেন নি'}
              </p>
              <p className="text-xs text-[#b0b3b8] leading-relaxed">
                {tab === 'followers'
                  ? 'লেখা শেয়ার করলে পাঠকেরা এখানে জড়ো হবে।'
                  : 'পছন্দের লেখকের প্রোফাইলে গিয়ে অনুসরণ করুন।'}
              </p>
            </div>
          )}

          {!loading && !error && (users || []).length > 0 && (
            <ul className="p-2">
              {(users || []).map((u, i) => (
                <li
                  key={u.id}
                  className="lf-pop-row flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#3a3b3c]/70 transition group/row"
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                >
                  {/* রো-ক্লিক জোন (প্রোফাইল) */}
                  <button
                    onClick={() => openProfile(u.username)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                    title={`${u.name}-এর প্রোফাইল দেখুন`}
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10 group-hover/row:ring-[#00a86b]/50 transition-all shrink-0"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0b6e4f] to-[#1f8a70] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.name.slice(0, 1)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13.5px] font-bold text-[#e4e6eb] truncate">
                          {u.name}
                        </span>
                        {u.isSelf && (
                          <span className="text-[10px] font-bold text-[#8a8d91] bg-[#3a3b3c] px-1.5 py-0.5 rounded">
                            আপনি
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 text-[11px] text-[#8a8d91]">
                        <span className="truncate">@{u.username}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <ImageIcon className="w-3 h-3" /> {bn(u.postCount)}
                          <span className="text-[#65676b]">·</span>
                          <Users className="w-3 h-3" /> {bn(u.followerCount)}
                        </span>
                      </span>
                    </span>
                  </button>
                  {/* ফলো-বাটন */}
                  {!u.isSelf && (
                    <button
                      onClick={() => toggleFollow(u)}
                      disabled={busyId === u.id}
                      aria-pressed={u.isFollowing}
                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition active:scale-[0.96] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
                        u.isFollowing
                          ? 'bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4a4c4e] border border-[#4e4f50]'
                          : 'bg-[#006a4e] text-white hover:bg-[#00523c] shadow-md shadow-[#006a4e]/20'
                      }`}
                    >
                      {busyId === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.isFollowing ? (
                        <UserCheck className="w-3.5 h-3.5 text-[#00a86b]" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      {u.isFollowing ? 'অনুসরণে' : 'অনুসরণ'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
    </ResponsiveModal>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 pb-2.5 pt-1 text-[13.5px] font-bold transition border-b-2 ${
        active
          ? 'text-[#00a86b] border-[#00a86b]'
          : 'text-[#b0b3b8] border-transparent hover:text-[#e4e6eb] hover:border-[#4e4f50]'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a86b] rounded-t`}
    >
      {label}
    </button>
  )
}
