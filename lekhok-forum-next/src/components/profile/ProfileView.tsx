'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Feather,
  FileText,
  Heart,
  UserCheck,
  UserPlus,
  Users,
  Link2,
  CalendarDays,
  Check,
  Image as ImageIcon,
} from 'lucide-react'
import DefaultCover from '@/components/feed/DefaultCover'
import FeedPostCard from '@/components/feed/FeedPostCard'
import FollowListModal from '@/components/user/FollowListModal'
import Lightbox from '@/components/post/Lightbox'
import type { FrontendPost, FrontendProfile, FrontendUser } from '@/lib/types'
import { bn } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

/** Session I গ্যালারি আইটেম (media + post-রেফারেন্স) */
interface GalleryItem {
  id: string
  url: string
  type: string
  order: number
  postId: string
  postExcerpt: string
}

/**
 * Session H: অন্য লেখকের প্রোফাইল-ভিউ — কভার/অ্যাভাটার/বায়ো/স্ট্যাটস + ফলো-বাটন + পোস্ট-লিস্ট।
 * নিজের প্রোফাইল page.tsx-এর টাইমলাইন-ট্যাবেই (এডিট-কন্ট্রোলসহ) যায়, তাই এখানে সবসময় অন্য লেখক।
 */
export default function ProfileView({
  username,
  me,
  users,
  onEdit,
  onBookmarkDelta,
  onSearchTag,
  onOpenProfile,
}: {
  username: string
  me: { id: string; name: string; username: string; avatarUrl: string | null }
  users: FrontendUser[]
  onEdit: (p: FrontendPost) => void
  onBookmarkDelta?: (delta: number) => void
  onSearchTag?: (tag: string) => void
  onOpenProfile?: (username: string) => void
}) {
  const [profile, setProfile] = useState<FrontendProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [posts, setPosts] = useState<FrontendPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  /* Session I: কনটেন্ট-ট্যাব (লেখা/ছবি) + গ্যালারি + ফলো-লিস্ট মডাল */
  const [contentTab, setContentTab] = useState<'posts' | 'media'>('posts')
  const [media, setMedia] = useState<GalleryItem[] | null>(null)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  /* ─── প্রোফাইল লোড ─── */
  useEffect(() => {
    let alive = true
    setProfileLoading(true)
    setProfileError(null)
    setProfile(null)
    /* Session I: ইউজার-বদলে কনটেন্ট-স্টেট রিসেট */
    setContentTab('posts')
    setMedia(null)
    setLightboxIdx(null)
    setFollowModal(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`)
        if (!res.ok) throw new Error(res.status === 404 ? 'লেখক পাওয়া যায়নি' : 'প্রোফাইল লোড ব্যর্থ')
        const data = await res.json()
        if (alive) setProfile(data.profile)
      } catch (err) {
        if (alive) setProfileError(err instanceof Error ? err.message : 'অজানা সমস্যা')
      } finally {
        if (alive) setProfileLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [username])

  /* ─── পোস্ট-লিস্ট লোড (কার্সর-পেজিনেশন) ─── */
  const loadPosts = useCallback(async (u: string) => {
    setPostsLoading(true)
    try {
      const res = await fetch(
        `/api/posts?tab=profile&username=${encodeURIComponent(u)}&limit=6`
      )
      if (!res.ok) throw new Error('পোস্ট লোড ব্যর্থ')
      const data = await res.json()
      setPosts(data.posts || [])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      setPosts([])
      setNextCursor(null)
      setHasMore(false)
    } finally {
      setPostsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts(username)
  }, [username, loadPosts])

  /* ─── Session I: মিডিয়া-গ্যালারি লোড (ছবি-ট্যাবে প্রথমবার) ─── */
  useEffect(() => {
    if (contentTab !== 'media' || media) return
    let alive = true
    setMediaLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/posts?tab=media&username=${encodeURIComponent(username)}`)
        if (!res.ok) throw new Error('গ্যালারি লোড ব্যর্থ')
        const data = await res.json()
        if (alive) setMedia(data.media || [])
      } catch {
        if (alive) setMedia([])
      } finally {
        if (alive) setMediaLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [contentTab, media, username])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || postsLoading) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({
        tab: 'profile',
        username,
        cursor: nextCursor,
        limit: '6',
      })
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...(data.posts || []).filter((p: FrontendPost) => !seen.has(p.id))]
      })
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      toast({ title: 'আরও পোস্ট লোড ব্যর্থ', variant: 'destructive' })
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore, postsLoading, username, toast])

  /* সেন্টিনেল ইনফিনিট-স্ক্রল */
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

  /* ─── ফলো-টগল (অপটিমিস্টিক) ─── */
  const toggleFollow = async () => {
    if (!profile || followBusy) return
    setFollowBusy(true)
    const prevProfile = profile
    const optimistic = !profile.isFollowing
    setProfile({
      ...profile,
      isFollowing: optimistic,
      stats: {
        ...profile.stats,
        followers: Math.max(0, profile.stats.followers + (optimistic ? 1 : -1)),
      },
    })
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(profile.username)}/follow`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('ফলো ব্যর্থ')
      const data = await res.json()
      setProfile((p) =>
        p
          ? { ...p, isFollowing: data.following, stats: { ...p.stats, followers: data.followers } }
          : p
      )
      try {
        window.dispatchEvent(new CustomEvent('lf:follow-changed'))
      } catch {
        /* ignore */
      }
      toast({
        title: data.following
          ? `${profile.name}-কে অনুসরণ করছেন 🤝`
          : `${profile.name}-কে অনুসরণ বন্ধ করেছেন`,
      })
    } catch (err) {
      setProfile(prevProfile) // রোলব্যাক
      toast({
        title: err instanceof Error ? err.message : 'ফলো ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setFollowBusy(false)
    }
  }

  /* ─── প্রোফাইল-লিংক কপি (?user= ডিপ-লিংক) ─── */
  const copyProfileLink = async () => {
    if (!profile) return
    try {
      const u = new URL(window.location.href)
      u.search = `?user=${encodeURIComponent(profile.username)}`
      await navigator.clipboard.writeText(u.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'প্রোফাইল লিংক কপি হয়েছে 🔗' })
    } catch {
      toast({ title: 'লিংক কপি ব্যর্থ', variant: 'destructive' })
    }
  }

  /* ─── প্রোফাইলের পোস্ট-লিস্টের লোকাল আপডেট/ডিলিট (FeedPostCard রিঅ্যাকশন/কমেন্ট অপটিমিস্টিক আপডেটের জন্য) ─── */
  const updateLocalPost = (updated: FrontendPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }
  const deleteLocalPost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const memberYear = profile ? new Date(profile.createdAt).getFullYear() : null

  /* ═══ লোডিং স্কেলেটন ═══ */
  if (profileLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden">
          <div className="h-36 sm:h-44 lf-shimmer" />
          <div className="px-4 pb-4 -mt-10 flex items-end gap-3">
            <div className="w-20 h-20 rounded-full lf-shimmer border-4 border-[#242526]" />
            <div className="space-y-2 pb-2 flex-1">
              <div className="h-4 w-40 lf-shimmer rounded" />
              <div className="h-3 w-24 lf-shimmer rounded" />
            </div>
          </div>
        </div>
        {[1, 2].map((n) => (
          <div key={n} className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full lf-shimmer" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-32 lf-shimmer rounded" />
                <div className="h-2.5 w-20 lf-shimmer rounded" />
              </div>
            </div>
            <div className="h-3 w-full lf-shimmer rounded" />
            <div className="h-40 w-full lf-shimmer rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  /* ═══ এরর স্টেট ═══ */
  if (profileError || !profile) {
    return (
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-10 text-center space-y-3">
        <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
          <Feather className="w-7 h-7 text-[#00a86b]" />
        </span>
        <p className="font-bold text-white">{profileError || 'প্রোফাইল পাওয়া যায়নি'}</p>
        <p className="text-sm text-[#b0b3b8]">@{username} — এই ঠিকানায় কোনো লেখক নেই।</p>
      </div>
    )
  }

  const joinStat = (
    <span className="flex items-center gap-1.5 text-[12.5px] text-[#b0b3b8]">
      <CalendarDays className="w-4 h-4 text-[#00a86b]" />
      {memberYear ? `${bn(memberYear)} সাল থেকে সদস্য` : 'সদস্য'}
    </span>
  )

  return (
    <div className="space-y-4">
      {/* ═══ প্রোফাইল হেডার ═══ */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden shadow-md lf-anim-fade">
        <div className="h-36 sm:h-44 relative overflow-hidden">
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt={`${profile.name} কভার ছবি`}
              className="w-full h-full object-cover lf-img-reveal"
              onLoad={(e) => e.currentTarget.classList.add('lf-img-loaded')}
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0) el.classList.add('lf-img-loaded')
              }}
            />
          ) : (
            <DefaultCover name={profile.name} />
          )}
          <Feather className="absolute bottom-3 right-4 w-16 h-16 text-white/10 pointer-events-none" />
        </div>

        <div className="px-4 sm:px-5 pb-4 -mt-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            {/* অ্যাভাটার */}
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-[#242526] object-cover shadow-lg shrink-0 ring-2 ring-transparent hover:ring-[#00a86b]/50 transition-all duration-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#4e4f50] border-4 border-[#242526] shrink-0" />
            )}

            <div className="flex-1 min-w-0 sm:pb-1">
              <h1 className="text-lg sm:text-xl font-extrabold text-white truncate">
                {profile.name}
              </h1>
              <p className="text-xs text-[#b0b3b8]">@{profile.username}</p>
            </div>

            {/* অ্যাকশন-বাটন */}
            <div className="flex items-center gap-2 sm:pb-1">
              <button
                onClick={toggleFollow}
                disabled={followBusy}
                aria-pressed={profile.isFollowing}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-extrabold transition-all active:scale-[0.97] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
                  profile.isFollowing
                    ? 'bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4a4c4e] border border-[#4e4f50]'
                    : 'bg-[#006a4e] text-white hover:bg-[#00523c] shadow-lg shadow-[#006a4e]/25 lf-follow-glow'
                }`}
              >
                {followBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : profile.isFollowing ? (
                  <UserCheck className="w-4 h-4 text-[#00a86b]" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {profile.isFollowing ? 'অনুসরণ করছেন' : 'অনুসরণ করুন'}
              </button>
              <button
                onClick={copyProfileLink}
                aria-label="প্রোফাইল লিংক কপি করুন"
                title="প্রোফাইল লিংক কপি করুন"
                className="w-9 h-9 rounded-lg bg-[#3a3b3c] hover:bg-[#4a4c4e] border border-[#4e4f50] flex items-center justify-center text-[#b0b3b8] hover:text-white transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#00a86b]"
              >
                {copied ? <Check className="w-4 h-4 text-[#00a86b]" /> : <Link2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* বায়ো */}
          {profile.bio && (
            <p className="mt-2.5 text-[13.5px] text-[#b0b3b8] leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}

          <div className="mt-2.5">{joinStat}</div>
        </div>

        {/* স্ট্যাটস — অনুসারী/অনুসরণ ক্লিকযোগ্য (Session I: ফলো-লিস্ট মডাল) */}
        <div className="grid grid-cols-4 border-t border-[#3e4042] divide-x divide-[#3e4042]">
          <Stat
            icon={<FileText className="w-4 h-4" />}
            value={bn(profile.stats.posts)}
            label="পোস্ট"
          />
          <button
            onClick={() => setFollowModal('followers')}
            aria-haspopup="dialog"
            aria-label={`${profile.name}-এর অনুসারী-লিস্ট দেখুন`}
            title="অনুসারী-লিস্ট দেখুন"
            className="flex flex-col items-center py-3 gap-0.5 lf-stat-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a86b]"
          >
            <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
              <span className="text-[#00a86b]">
                <Users className="w-4 h-4" />
              </span>
              {bn(profile.stats.followers)}
            </span>
            <span className="text-[11px] text-[#8a8d91]">অনুসারী</span>
          </button>
          <button
            onClick={() => setFollowModal('following')}
            aria-haspopup="dialog"
            aria-label={`${profile.name}-এর অনুসরণ-লিস্ট দেখুন`}
            title="অনুসরণ-লিস্ট দেখুন"
            className="flex flex-col items-center py-3 gap-0.5 lf-stat-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a86b]"
          >
            <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
              <span className="text-[#00a86b]">
                <UserCheck className="w-4 h-4" />
              </span>
              {bn(profile.stats.following)}
            </span>
            <span className="text-[11px] text-[#8a8d91]">অনুসরণ</span>
          </button>
          <Stat
            icon={<Heart className="w-4 h-4" />}
            value={bn(profile.stats.reactions)}
            label="রিঅ্যাকশন"
          />
        </div>
      </section>

      {/* ═══ Session I: কনটেন্ট-ট্যাব (লেখা | ছবি) ═══ */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex gap-1 bg-[#242526] border border-[#3e4042] rounded-lg p-1">
          <MiniTab
            active={contentTab === 'posts'}
            onClick={() => setContentTab('posts')}
            icon={<FileText className="w-3.5 h-3.5" />}
            label="লেখা"
          />
          <MiniTab
            active={contentTab === 'media'}
            onClick={() => setContentTab('media')}
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            label="ছবি"
          />
        </div>
        <span className="h-px flex-1 bg-[#3e4042]" aria-hidden />
      </div>

      {/* ═══ ছবি-গ্যালারি (Session I) ═══ */}
      {contentTab === 'media' && (
        <>
          {mediaLoading && (
            <div className="grid grid-cols-3 gap-1.5" role="status">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-square rounded-lg lf-shimmer" />
              ))}
            </div>
          )}

          {!mediaLoading && (media || []).length === 0 && (
            <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-10 text-center space-y-3">
              <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
                <ImageIcon className="w-7 h-7 text-[#00a86b]" />
              </span>
              <p className="font-bold text-white">কোনো ছবি নেই</p>
              <p className="text-sm text-[#b0b3b8]">
                {profile.name} পোস্টে ছবি যোগ করলেই এখানে গ্যালারি হয়ে জমা হবে।
              </p>
            </div>
          )}

          {!mediaLoading && (media || []).length > 0 && (
            <div className="grid grid-cols-3 gap-1.5" role="list" aria-label="ছবি-গ্যালারি">
              {(media || []).map((m, i) => (
                <button
                  key={m.id}
                  role="listitem"
                  onClick={() => setLightboxIdx(i)}
                  aria-label={`ছবি ${bn(i + 1)} — বড় করে দেখুন`}
                  className="lf-media-tile relative aspect-square rounded-lg overflow-hidden bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] focus-visible:z-10 group/tile"
                >
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover lf-img-reveal"
                    onLoad={(e) => e.currentTarget.classList.add('lf-img-loaded')}
                    ref={(el) => {
                      if (el && el.complete && el.naturalWidth > 0) el.classList.add('lf-img-loaded')
                    }}
                  />
                  {/* হোভার-ওভারলে: পোস্ট-এক্সসার্প্ট */}
                  {m.postExcerpt && (
                    <span className="lf-tile-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pt-4 pb-1.5 text-left">
                      <span className="block text-[10.5px] leading-snug text-white line-clamp-2">
                        {m.postExcerpt}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ পোস্ট-লিস্ট (লেখা-ট্যাব) ═══ */}
      {contentTab === 'posts' && (
        <>
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-[15px] font-extrabold text-white">
          {profile.name}-এর লেখা
        </h2>
        <span className="h-px flex-1 bg-[#3e4042]" aria-hidden />
      </div>

      {postsLoading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full lf-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-32 lf-shimmer rounded" />
                  <div className="h-2.5 w-20 lf-shimmer rounded" />
                </div>
              </div>
              <div className="h-3 w-full lf-shimmer rounded" />
              <div className="h-40 w-full lf-shimmer rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {!postsLoading && posts.length === 0 && (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-10 text-center space-y-3">
          <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
            <Feather className="w-7 h-7 text-[#00a86b]" />
          </span>
          <p className="font-bold text-white">এখনো কোনো লেখা নেই</p>
          <p className="text-sm text-[#b0b3b8]">
            {profile.name} প্রথম লেখা শেয়ার করলেই এখানে দেখা যাবে।
          </p>
        </div>
      )}

      {!postsLoading &&
        posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            me={me}
            users={users}
            onUpdate={updateLocalPost}
            onDelete={deleteLocalPost}
            onEdit={onEdit}
            onBookmarkDelta={onBookmarkDelta}
            onSearchTag={onSearchTag}
            onOpenProfile={onOpenProfile}
          />
        ))}

      {/* ইনফিনিট-স্ক্রল */}
      {!postsLoading && hasMore && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-4">
          {loadingMore ? (
            <div className="flex items-center gap-2 text-sm text-[#b0b3b8]" role="status">
              <Loader2 className="w-4 h-4 animate-spin text-[#00a86b]" /> আরও পোস্ট লোড হচ্ছে...
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-5 py-2 bg-[#242526] border border-[#3e4042] rounded-lg text-sm font-bold text-[#e4e6eb] hover:bg-[#3a3b3c] transition focus-visible:ring-2 focus-visible:ring-[#00a86b] active:scale-[0.97]"
            >
              আরও দেখুন
            </button>
          )}
        </div>
      )}

      {!postsLoading && !hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-[#65676b] py-3 flex items-center justify-center gap-1.5">
          <span className="h-px w-8 bg-[#3e4042]" aria-hidden />
          {profile.name}-এর সব লেখা দেখা হয়ে গেছে 🌿
          <span className="h-px w-8 bg-[#3e4042]" aria-hidden />
        </p>
      )}
        </>
      )}

      {/* ═══ Session I: ফলো-লিস্ট মডাল (অনুসারী/অনুসরণ) ═══ */}
      {followModal && (
        <FollowListModal
          username={profile.username}
          displayName={profile.name}
          initialTab={followModal}
          onClose={() => setFollowModal(null)}
          onOpenProfile={onOpenProfile}
        />
      )}

      {/* ═══ গ্যালারি লাইটবক্স (Session I) ═══ */}
      {lightboxIdx !== null && (media || []).length > 0 && (
        <Lightbox
          media={(media || []).map((m) => ({ id: m.id, url: m.url, type: m.type, order: m.order }))}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="flex flex-col items-center py-3 gap-0.5 lf-stat-hover transition-colors">
      <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
        <span className="text-[#00a86b]">{icon}</span>
        {value}
      </span>
      <span className="text-[11px] text-[#8a8d91]">{label}</span>
    </div>
  )
}

/** Session I: প্রোফাইল কনটেন্ট-ট্যাব (লেখা/ছবি) */
function MiniTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`lf-mini-tab flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-extrabold transition focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
        active
          ? 'bg-[#006a4e] text-white shadow-md shadow-[#006a4e]/25'
          : 'text-[#b0b3b8] hover:text-[#e4e6eb]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
