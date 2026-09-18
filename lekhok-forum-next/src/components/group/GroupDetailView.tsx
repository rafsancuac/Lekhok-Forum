'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Users,
  Globe2,
  Lock,
  FileText,
  UserPlus,
  UserCheck,
  Loader2,
  RefreshCw,
  Crown,
  CalendarDays,
} from 'lucide-react'
import type { FrontendGroupDetail, FrontendPost, FrontendUser } from '@/lib/types'
import DefaultGroupCover from './DefaultGroupCover'
import ComposerCard from '@/components/feed/ComposerCard'
import FeedPostCard from '@/components/feed/FeedPostCard'
import CreatePostModal from '@/components/post/CreatePostModal'
import { bn } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

/** গ্রুপ-বিস্তারিত ভিউ — হেডার + জয়েন/লিভ + সদস্য-স্ট্রিপ + গ্রুপ-ফিড (Session K) */
export default function GroupDetailView({
  groupId,
  me,
  users,
  onBack,
  onOpenProfile,
  onEdit,
  onBookmarkDelta,
  onSearchTag,
  refreshKey,
  onGroupChanged,
}: {
  groupId: string
  me: { id: string; name: string; username: string; avatarUrl: string | null }
  users: FrontendUser[]
  onBack: () => void
  onOpenProfile: (username: string) => void
  onEdit: (p: FrontendPost) => void
  onBookmarkDelta?: (delta: number) => void
  onSearchTag?: (tag: string) => void
  refreshKey: number
  onGroupChanged: () => void
}) {
  const [group, setGroup] = useState<FrontendGroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [posts, setPosts] = useState<FrontendPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const [joinBusy, setJoinBusy] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  /* ─── গ্রুপ বিস্তারিত লোড ─── */
  const loadGroup = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (!res.ok) throw new Error('গ্রুপ লোড ব্যর্থ')
      setGroup(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অজানা সমস্যা')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  /* ─── গ্রুপ-ফিড লোড (কার্সর) ─── */
  const loadPosts = useCallback(async () => {
    setPostsLoading(true)
    try {
      const res = await fetch(
        `/api/posts?tab=group&groupId=${encodeURIComponent(groupId)}&limit=6`
      )
      const data = await res.json()
      setPosts(data.posts || [])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      setPosts([])
    } finally {
      setPostsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    loadGroup()
    loadPosts()
  }, [loadGroup, loadPosts, refreshKey])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || postsLoading) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({
        tab: 'group',
        groupId,
        cursor: nextCursor,
      })
      const res = await fetch(`/api/posts?${params.toString()}`)
      const data = await res.json()
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...(data.posts || []).filter((p: FrontendPost) => !seen.has(p.id))]
      })
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore, postsLoading, groupId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || postsLoading) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '700px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, postsLoading, loadMore])

  /* ─── জয়েন/লিভ টগল (অপটিমিস্টিক) ─── */
  const toggleJoin = async () => {
    if (!group || joinBusy) return
    const prev = group
    const optimistic = { ...group, isMember: !group.isMember, memberCount: group.memberCount + (group.isMember ? -1 : 1) }
    setGroup(optimistic)
    setJoinBusy(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ব্যর্থ')
      setGroup((g) => (g ? { ...g, isMember: data.isMember, memberCount: data.memberCount } : g))
      toast({
        title: data.isMember ? '🤝 গ্রুপে যোগ দিয়েছেন!' : 'গ্রুপ ছেড়ে গেছেন',
      })
      onGroupChanged()
    } catch (err) {
      setGroup(prev) // রোলব্যাক
      toast({
        title: err instanceof Error ? err.message : 'জয়েন ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setJoinBusy(false)
    }
  }

  const updatePost = (updated: FrontendPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }
  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  /* ─── লোডিং/এরর ─── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden">
          <div className="h-36 lf-shimmer" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 w-48 lf-shimmer rounded" />
            <div className="h-2.5 w-28 lf-shimmer rounded" />
          </div>
        </div>
        <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 space-y-3">
          <div className="h-3 w-full lf-shimmer rounded" />
          <div className="h-3 w-4/5 lf-shimmer rounded" />
          <div className="h-40 w-full lf-shimmer rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center space-y-3">
        <p className="text-rose-400 font-semibold">{error || 'গ্রুপ পাওয়া যায়নি'}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#3a3b3c] hover:bg-[#4a4c4e] rounded-lg text-sm font-bold transition"
          >
            গ্রুপ-তালিকায় ফিরুন
          </button>
          <button
            onClick={loadGroup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006a4e] hover:bg-[#00523c] rounded-lg text-sm font-bold transition"
          >
            <RefreshCw className="w-4 h-4" /> আবার চেষ্টা
          </button>
        </div>
      </div>
    )
  }

  const isMember = group.isMember

  return (
    <div className="space-y-4 lf-anim-fade">
      {/* ═══ গ্রুপ-হেডার ═══ */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden shadow-md">
        <div className="h-36 sm:h-44 relative overflow-hidden">
          {group.coverUrl ? (
            <img src={group.coverUrl} alt="" className="w-full h-full object-cover lf-img-reveal" />
          ) : (
            <DefaultGroupCover name={group.name} />
          )}
          <button
            onClick={onBack}
            aria-label="গ্রুপ-তালিকায় ফিরুন"
            title="ফিরে যান"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center transition shadow-lg focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-4 pb-4 -mt-9 relative">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-white truncate max-w-full">
                  {group.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    group.privacy === 'OPEN'
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                  }`}
                >
                  {group.privacy === 'OPEN' ? (
                    <Globe2 className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {group.privacy === 'OPEN' ? 'প্রকাশ্য গ্রুপ' : 'বন্ধ গ্রুপ'}
                </span>
              </div>
              <p className="text-xs text-[#8a8d91] mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#00a86b]" /> {bn(group.memberCount)} সদস্য
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#00a86b]" /> {bn(group.postCount)} লেখা
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00a86b]" />
                  {new Date(group.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                  })}
                  {' '}-এ শুরু
                </span>
              </p>
            </div>

            {!group.isCreator && (
              <button
                onClick={toggleJoin}
                disabled={joinBusy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-extrabold transition active:scale-[0.97] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
                  isMember
                    ? 'bg-[#3a3b3c] hover:bg-[#4a4c4e] text-[#e4e6eb]'
                    : 'bg-[#006a4e] hover:bg-[#00523c] text-white lf-follow-glow shadow-md shadow-black/25'
                }`}
              >
                {joinBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isMember ? (
                  <UserCheck className="w-4 h-4 text-[#00a86b]" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isMember ? 'সদস্য আছেন ✓' : 'গ্রুপে যোগ দিন'}
              </button>
            )}
            {group.isCreator && (
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f7b125]/15 ring-1 ring-[#f7b125]/30 text-[#ffd88a] text-xs font-extrabold">
                <Crown className="w-4 h-4" /> আপনি প্রশাসক
              </span>
            )}
          </div>

          {group.description && (
            <p className="text-[13.5px] text-[#b0b3b8] mt-2.5 leading-relaxed">
              {group.description}
            </p>
          )}

          {/* সদস্য-স্ট্রিপ */}
          {!group.locked && group.members.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-[#3e4042]">
              <div className="flex items-center gap-2 overflow-x-auto lf-scroll pb-1">
                {group.members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onOpenProfile(m.username)}
                    title={`${m.name}${m.role === 'ADMIN' ? ' (প্রশাসক)' : ''}`}
                    className="group/member flex items-center gap-1.5 pr-2.5 py-1 rounded-full bg-[#3a3b3c]/60 hover:bg-[#4a4c4e] shrink-0 transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                  >
                    <span className="relative">
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 group-hover/member:ring-[#00a86b]/60 transition-all"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-[#4e4f50] block" />
                      )}
                      {m.role === 'ADMIN' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#f7b125] flex items-center justify-center ring-2 ring-[#242526]">
                          <Crown className="w-2 h-2 text-black" />
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] font-semibold text-[#e4e6eb] max-w-[96px] truncate">
                      {m.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ লকড-অবস্থা: বন্ধ গ্রুপ, সদস্য নই ═══ */}
      {group.locked ? (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-10 text-center space-y-3">
          <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
            <Lock className="w-7 h-7 text-[#f7b125]" />
          </span>
          <p className="font-bold text-white">এটি একটি বন্ধ গ্রুপ</p>
          <p className="text-sm text-[#b0b3b8] max-w-sm mx-auto leading-relaxed">
            শুধু সদস্যরা এই গ্রুপের লেখা ও সদস্য-তালিকা দেখতে পারবেন। যোগ দিয়ে ভেতরের আলোচনা উপভোগ করুন।
          </p>
          {!group.isCreator && (
            <button
              onClick={toggleJoin}
              disabled={joinBusy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#00523c] text-white text-sm font-extrabold transition active:scale-[0.97] lf-follow-glow"
            >
              {joinBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              গ্রুপে যোগ দিন
            </button>
          )}
        </div>
      ) : (
        <>
          {/* কম্পোজার (সদস্য হলেই লেখা যায়) */}
          {isMember && (
            <ComposerCard
              current={{ id: me.id, name: me.name, username: me.username, avatarUrl: me.avatarUrl }}
              onOpen={() => setComposerOpen(true)}
              onQuickMedia={() => setComposerOpen(true)}
              contextLabel={group.name}
            />
          )}

          {/* গ্রুপ-ফিড */}
          {postsLoading && (
            <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 space-y-3">
              <div className="h-3 w-full lf-shimmer rounded" />
              <div className="h-3 w-4/5 lf-shimmer rounded" />
              <div className="h-40 w-full lf-shimmer rounded-lg" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-10 text-center space-y-2.5">
              <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
                <FileText className="w-7 h-7 text-[#00a86b]" />
              </span>
              <p className="font-bold text-white">গ্রুপে এখনো কোনো লেখা নেই</p>
              <p className="text-sm text-[#b0b3b8] leading-relaxed max-w-sm mx-auto">
                {isMember
                  ? 'প্রথম লেখাটি আপনিই শেয়ার করে আলোচনার সূচনা করুন!'
                  : 'যোগ দিয়ে নতুন লেখাগুলো সবার আগে পড়ুন।'}
              </p>
            </div>
          )}

          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              me={me}
              users={users}
              onUpdate={updatePost}
              onDelete={deletePost}
              onEdit={onEdit}
              onBookmarkDelta={onBookmarkDelta}
              onSearchTag={onSearchTag}
              onOpenProfile={onOpenProfile}
              hideGroupChip
            />
          ))}

          {hasMore && (
            <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-4">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-sm text-[#b0b3b8]" role="status">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00a86b]" /> আরও লোড হচ্ছে...
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="px-5 py-2 bg-[#242526] border border-[#3e4042] rounded-lg text-sm font-bold text-[#e4e6eb] hover:bg-[#3a3b3c] transition"
                >
                  আরও দেখুন
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* গ্রুপ-কম্পোজার মডাল (groupId প্রিসেট) */}
      {composerOpen && (
        <CreatePostModal
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          currentUser={{ id: me.id, name: me.name, username: me.username, avatarUrl: me.avatarUrl, coverUrl: null, bio: null }}
          users={users}
          groupId={groupId}
          groupTitle={group.name}
          onPostSuccess={() => {
            loadPosts()
            onGroupChanged()
          }}
        />
      )}
    </div>
  )
}
