'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Users,
  Globe2,
  Lock,
  Plus,
  RefreshCw,
  Loader2,
  FileText,
  SearchX,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import type { FrontendGroup } from '@/lib/types'
import DefaultGroupCover from './DefaultGroupCover'
import { bn } from '@/lib/format'

/** গ্রুপ-লিস্ট ভিউ — আমার গ্রুপ + আবিষ্কার + তৈরি-বাটন (Session K) */
export default function GroupsView({
  refreshKey,
  onOpenGroup,
  onCreateGroup,
}: {
  refreshKey: number
  onOpenGroup: (groupId: string) => void
  onCreateGroup: () => void
}) {
  const [data, setData] = useState<{ myGroups: FrontendGroup[]; discover: FrontendGroup[] } | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups')
      if (!res.ok) throw new Error('গ্রুপ লোড ব্যর্থ')
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অজানা সমস্যা')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div className="space-y-4 lf-anim-fade">
      {/* হেডার ব্যাজ */}
      <div className="flex items-center gap-2.5 bg-[#242526] rounded-xl border border-[#3e4042] px-4 py-3">
        <span className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
          <Users className="w-4.5 h-4.5 text-[#00a86b]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">গ্রুপসমূহ</p>
          <p className="text-xs text-[#b0b3b8] truncate">
            {loading
              ? 'লোড হচ্ছে...'
              : data
                ? `${bn(data.myGroups.length)}টি গ্রুপে সদস্য · ${bn(data.discover.length)}টি নতুন আবিষ্কার`
                : '—'}
          </p>
        </div>
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-extrabold transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#00a86b] shadow-md shadow-black/20"
        >
          <Plus className="w-4 h-4" /> নতুন গ্রুপ
        </button>
      </div>

      {/* লোডিং */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden">
              <div className="h-28 lf-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3.5 w-40 lf-shimmer rounded" />
                <div className="h-2.5 w-24 lf-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* এরর */}
      {!loading && error && (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center space-y-3">
          <p className="text-rose-400 font-semibold">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006a4e] hover:bg-[#00523c] rounded-lg text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <RefreshCw className="w-4 h-4" /> আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {!loading && data && (
        <>
          {/* আমার গ্রুপ */}
          <section>
            <h2 className="text-[13px] font-extrabold text-[#b0b3b8] uppercase tracking-wide px-1 pb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#00a86b]" /> আমার গ্রুপ
            </h2>
            {data.myGroups.length === 0 ? (
              <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center space-y-2.5">
                <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
                  <Users className="w-7 h-7 text-[#00a86b]" />
                </span>
                <p className="font-bold text-white">এখনো কোনো গ্রুপে নেই</p>
                <p className="text-sm text-[#b0b3b8] leading-relaxed max-w-sm mx-auto">
                  নিচের আবিষ্কার-তালিকা থেকে যোগ দিন, অথবা নিজের লেখক-গোষ্ঠী গড়ে তুলুন।
                </p>
                <button
                  onClick={onCreateGroup}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#006a4e] hover:bg-[#00523c] text-white text-sm font-extrabold transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  <Plus className="w-4 h-4" /> প্রথম গ্রুপ তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.myGroups.map((g, i) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    delay={i * 45}
                    onOpen={() => onOpenGroup(g.id)}
                    badge={
                      g.myRole === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#ffd88a] bg-[#f7b125]/15 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> প্রশাসক
                        </span>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* আবিষ্কার */}
          {data.discover.length > 0 && (
            <section>
              <h2 className="text-[13px] font-extrabold text-[#b0b3b8] uppercase tracking-wide px-1 pb-2 flex items-center gap-1.5">
                <SearchX className="w-4 h-4 text-[#00a86b]" /> আবিষ্কার করুন
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.discover.map((g, i) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    delay={i * 45}
                    onOpen={() => onOpenGroup(g.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

/** গ্রুপ-কার্ড — কভার + নাম + স্ট্যাট + সদস্য-স্ট্যাক */
export function GroupCard({
  group: g,
  onOpen,
  badge = null,
  delay = 0,
}: {
  group: FrontendGroup
  onOpen: () => void
  badge?: React.ReactNode
  delay?: number
}) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden shadow-md hover:border-[#4a4c4e] hover:-translate-y-0.5 hover:shadow-xl transition-all lf-group-card focus-visible:ring-2 focus-visible:ring-[#00a86b] lf-pop-row"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-28 relative overflow-hidden">
        {g.coverUrl ? (
          <img src={g.coverUrl} alt="" className="w-full h-full object-cover lf-img-reveal" />
        ) : (
          <DefaultGroupCover name={g.name} />
        )}
        <span
          className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            g.privacy === 'OPEN'
              ? 'bg-black/45 text-emerald-200 ring-1 ring-emerald-400/30'
              : 'bg-black/45 text-amber-200 ring-1 ring-amber-400/30'
          }`}
        >
          {g.privacy === 'OPEN' ? <Globe2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {g.privacy === 'OPEN' ? 'প্রকাশ্য' : 'বন্ধ'}
        </span>
      </div>
      <div className="p-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-white text-[15px] leading-snug truncate">{g.name}</h3>
          {badge}
        </div>
        {g.description && (
          <p className="text-xs text-[#b0b3b8] mt-0.5 line-clamp-1">{g.description}</p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-3 text-[11.5px] text-[#8a8d91]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#00a86b]" /> {bn(g.memberCount)} সদস্য
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#00a86b]" /> {bn(g.postCount)} লেখা
            </span>
          </div>
          {/* সদস্য-অ্যাভাটার স্ট্যাক */}
          {g.coverMembers.length > 0 && (
            <span className="flex -space-x-2" aria-hidden>
              {g.coverMembers.map((m) =>
                m.avatarUrl ? (
                  <img
                    key={m.id}
                    src={m.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full ring-2 ring-[#242526] object-cover"
                  />
                ) : (
                  <span
                    key={m.id}
                    className="w-6 h-6 rounded-full bg-[#4e4f50] ring-2 ring-[#242526]"
                  />
                )
              )}
              {!g.isMember && (
                <span className="w-6 h-6 rounded-full bg-[#006a4e] ring-2 ring-[#242526] flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
