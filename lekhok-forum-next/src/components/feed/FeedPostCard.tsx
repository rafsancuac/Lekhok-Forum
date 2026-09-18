'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe2,
  Users,
  Lock,
  MapPin,
  Trash2,
  Pencil,
  Bookmark,
  Link2,
  Send,
  ChevronDown,
  UserPlus,
  ExternalLink,
  Share,
  UsersRound,
} from 'lucide-react'
import PostMediaCollage from '@/components/post/PostMediaCollage'
import Lightbox from '@/components/post/Lightbox'
import { REACTIONS, COMMENT_REACTIONS, AUDIENCE_META, type FrontendPost, type FrontendComment, type FrontendUser } from '@/lib/types'
import { linkifyHashtags } from '@/lib/hashtag'
import { useToast } from '@/hooks/use-toast'
import { bn } from '@/lib/format'

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'এইমাত্র'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${bn(mins)} মিনিট`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${bn(hours)} ঘণ্টা`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${bn(days)} দিন`
  // Session L: পুরোনো পোস্টের তারিখও সর্বদা বাংলাদেশ টাইমজোনে (GMT+6)
  return new Date(iso).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Dhaka',
  })
}

const REACTION_EMOJI: Record<string, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.type, r.emoji])
)

const COMMENT_EMOJI: Record<string, string> = Object.fromEntries(
  REACTIONS.filter((r) => (COMMENT_REACTIONS as readonly string[]).includes(r.type)).map((r) => [r.type, r.emoji])
)

export default function FeedPostCard({
  post,
  me,
  users,
  onUpdate,
  onDelete,
  onEdit,
  onBookmarkDelta,
  onSearchTag,
  onOpenProfile,
  hideGroupChip = false,
  onOpenGroup,
}: {
  post: FrontendPost
  me: { id: string; name: string; username: string; avatarUrl: string | null }
  users: FrontendUser[]
  onUpdate: (p: FrontendPost) => void
  onDelete: (id: string) => void
  onEdit: (p: FrontendPost) => void
  onBookmarkDelta?: (delta: number) => void
  onSearchTag?: (tag: string) => void
  onOpenProfile?: (username: string) => void
  /** গ্রুপ-ভিউয়ের ভেতরে চিপ লাগবে না (Session K) */
  hideGroupChip?: boolean
  /** গ্রুপ-চিপ ক্লিকে গ্রুপে নেভ (Session K) */
  onOpenGroup?: (groupId: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sharePos, setSharePos] = useState<{ left: number; bottom: number } | null>(null)
  const [showReactionBar, setShowReactionBar] = useState(false)
  const [showComments, setShowComments] = useState(false)

  /* ─── Session G: রিঅ্যাকশন ইউজার-লিস্ট পপওভার ─── */
  const [reactListOpen, setReactListOpen] = useState(false)
  const [reactListPos, setReactListPos] = useState<{ left: number; top: number } | null>(null)
  const [reactListData, setReactListData] = useState<{
    counts: Record<string, number>
    total: number
    users: ReactUserRow[]
  } | null>(null)
  const [reactListLoading, setReactListLoading] = useState(false)
  const [reactFilter, setReactFilter] = useState<string>('ALL')
  const [lightboxIdx, setLightboxIdx] = useState(-1)
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)
  const shareRef = useRef<HTMLDivElement>(null)
  const shareBtnRef = useRef<HTMLButtonElement>(null)
  const sharePortalRef = useRef<HTMLDivElement>(null)
  const reactSummaryRef = useRef<HTMLButtonElement>(null)
  const reactListPortalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false)
      if (
        shareRef.current &&
        !shareRef.current.contains(t) &&
        !(sharePortalRef.current && sharePortalRef.current.contains(t))
      )
        setShareOpen(false)
      if (
        reactListPortalRef.current &&
        !reactListPortalRef.current.contains(t) &&
        !reactSummaryRef.current?.contains(t)
      )
        setReactListOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const audience = AUDIENCE_META[post.audience] || AUDIENCE_META.PUBLIC
  const isMine = post.author.id === me.id
  const myReaction = post.myReaction

  // ট্যাগড ইউজারদের নাম রেজলভ
  const taggedNames = (post.taggedUsers || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => users.find((u) => u.id === id)?.name)
    .filter(Boolean) as string[]

  /* ─── রিঅ্যাকশন ─── */
  const react = async (type: string) => {
    const optimistic = myReaction === type ? null : type
    onUpdate({
      ...post,
      myReaction: optimistic,
      reactionTotal: post.reactionTotal + (optimistic ? (myReaction ? 0 : 1) : -1),
    })
    try {
      const res = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (res.ok) onUpdate({ ...post, myReaction: data.myReaction, reactionTotal: data.total })
    } catch {
      toast({ title: 'রিঅ্যাকশন ব্যর্থ', variant: 'destructive' })
    }
  }

  /* যেসব রিঅ্যাকশন-টাইপে অন্তত ১টি আছে (FB-স্টাইল স্ট্যাকড বাবলের জন্য) */
  const activeReactions = useMemo(
    () => REACTIONS.filter((r) => (post.reactionCounts[r.type] || 0) > 0),
    [post.reactionCounts]
  )

  /* ─── Session G: রিঅ্যাকশন-লিস্ট ওপেন/লোড ─── */
  const openReactList = () => {
    if (reactListOpen) {
      setReactListOpen(false)
      return
    }
    const r = reactSummaryRef.current?.getBoundingClientRect()
    if (r) {
      // হরাইজন্টাল ক্ল্যাম্প — মোবাইলে স্ক্রিনের বাইরে না যায়
      const cx = Math.min(Math.max(r.left + 24, 172), window.innerWidth - 172)
      setReactListPos({ left: cx, top: r.top - 6 })
    }
    setReactFilter('ALL')
    setReactListData(null)
    setReactListOpen(true)
    setReactListLoading(true)
    fetch(`/api/posts/${post.id}/reactions/users`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('fail'))))
      .then((d) => setReactListData(d))
      .catch(() => setReactListData(null))
      .finally(() => setReactListLoading(false))
  }

  const reactRows = reactListData
    ? reactFilter === 'ALL'
      ? reactListData.users
      : reactListData.users.filter((u) => u.type === reactFilter)
    : []

  /* ─── কমেন্ট ─── */
  const addComment = async (content: string, parentId?: string) => {
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentId }),
    })
    if (!res.ok) {
      toast({ title: 'কমেন্ট ব্যর্থ', variant: 'destructive' })
      return null
    }
    const data = await res.json()

    const newComment: FrontendComment = data.comment
    if (parentId) {
      onUpdate({
        ...post,
        commentCount: data.commentCount,
        comments: post.comments.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c
        ),
      })
    } else {
      onUpdate({ ...post, commentCount: data.commentCount, comments: [...post.comments, newComment] })
    }
    return newComment
  }

  const deleteComment = async (commentId: string, parentId?: string) => {
    const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, { method: 'DELETE' })
    if (!res.ok) {
      toast({ title: 'মুছে ফেলা ব্যর্থ', variant: 'destructive' })
      return
    }
    const data = await res.json()
    if (parentId) {
      onUpdate({
        ...post,
        commentCount: data.commentCount,
        comments: post.comments.map((c) =>
          c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c
        ),
      })
    } else {
      onUpdate({
        ...post,
        commentCount: data.commentCount,
        comments: post.comments.filter((c) => c.id !== commentId),
      })
    }
    toast({ title: 'কমেন্ট মুছে ফেলা হয়েছে' })
  }

  /* ─── কমেন্ট রিঅ্যাকশন ─── */
  const reactToComment = async (commentId: string, type: string, parentId?: string) => {
    const applyOptimistic = (c: FrontendComment): FrontendComment => {
      if (c.id !== commentId) return c
      const counts = { ...c.reactionCounts }
      if (c.myReaction) counts[c.myReaction] = Math.max(0, (counts[c.myReaction] || 0) - 1)
      const optimistic = c.myReaction === type ? null : type
      if (optimistic) counts[optimistic] = (counts[optimistic] || 0) + 1
      return {
        ...c,
        reactionCounts: counts,
        reactionTotal: c.reactionTotal + (optimistic ? (c.myReaction ? 0 : 1) : -1),
        myReaction: optimistic,
      }
    }
    if (parentId) {
      onUpdate({
        ...post,
        comments: post.comments.map((c) =>
          c.id === parentId ? { ...c, replies: c.replies.map(applyOptimistic) } : c
        ),
      })
    } else {
      onUpdate({ ...post, comments: post.comments.map(applyOptimistic) })
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const applyServer = (c: FrontendComment): FrontendComment =>
        c.id !== commentId
          ? c
          : { ...c, reactionCounts: data.reactionCounts, reactionTotal: data.reactionTotal, myReaction: data.myReaction }
      if (parentId) {
        onUpdate({
          ...post,
          comments: post.comments.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies.map(applyServer) } : c
          ),
        })
      } else {
        onUpdate({ ...post, comments: post.comments.map(applyServer) })
      }
    } catch {
      toast({ title: 'কমেন্ট রিঅ্যাকশন ব্যর্থ', variant: 'destructive' })
    }
  }

  /* ─── কমেন্ট এডিট ─── */
  const editComment = async (commentId: string, content: string, parentId?: string) => {
    try {
      const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        toast({ title: 'সম্পাদনা ব্যর্থ', variant: 'destructive' })
        return
      }
      const data = await res.json()
      const apply = (c: FrontendComment): FrontendComment =>
        c.id !== commentId ? c : { ...c, content: data.comment.content, updatedAt: data.comment.updatedAt }
      if (parentId) {
        onUpdate({
          ...post,
          comments: post.comments.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies.map(apply) } : c
          ),
        })
      } else {
        onUpdate({ ...post, comments: post.comments.map(apply) })
      }
      toast({ title: 'কমেন্ট সম্পাদিত হয়েছে' })
    } catch {
      toast({ title: 'সম্পাদনা ব্যর্থ', variant: 'destructive' })
    }
  }

  /* ─── শেয়ার (রিয়েল কাউন্ট) ─── */
  const postUrl = `${window.location.origin}/?post=${post.id}`

  const bumpShareCount = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) onUpdate({ ...post, shares: data.shares })
    } catch {
      /* কাউন্ট সিঙ্ক ব্যর্থ হলেও শেয়ার চলবে */
    }
  }

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
    } catch {
      /* ক্লিপবোর্ড ব্লক থাকলেও শেয়ার কাউন্ট হবে */
    }
    try {
      await bumpShareCount()
      toast({ title: 'লিংক কপি হয়েছে! 🔗' })
    } catch {
      toast({ title: 'শেয়ার ব্যর্থ', variant: 'destructive' })
    }
  }

  const copyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      toast({ title: 'লিংক কপি হয়েছে! 🔗' })
    } catch {
      toast({ title: 'কপি করা যায়নি', variant: 'destructive' })
    }
  }

  const nativeShare = async () => {
    setShareOpen(false)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'লেখক ফোরাম', text: `${post.author.name}-এর লেখা`, url: postUrl })
        await bumpShareCount()
      } catch {
        /* ব্যবহারকারী বাতিল করেছে */
      }
    } else {
      copyLinkOnly()
    }
  }

  const externalShare = (base: string) => {
    setShareOpen(false)
    try {
      window.open(`${base}${encodeURIComponent(postUrl)}`, '_blank', 'noopener,noreferrer')
    } catch {
      /* পপআপ ব্লক হলে চুপচাপ থাকি */
    }
    bumpShareCount()
  }

  /* ─── হ্যাশট্যাগ লিঙ্কিফাই + ক্লিক ─── */
  const contentHtml = useMemo(() => linkifyHashtags(post.content), [post.content])
  const handleContentClick = (e: React.MouseEvent) => {
    const tagEl = (e.target as HTMLElement).closest?.('.lf-hashtag') as HTMLElement | null
    if (tagEl?.dataset.tag && onSearchTag) {
      e.preventDefault()
      onSearchTag(`#${tagEl.dataset.tag}`)
    }
  }

  /* ─── বুকমার্ক ─── */
  const toggleBookmark = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        onUpdate({ ...post, myBookmark: data.myBookmark })
        onBookmarkDelta?.(data.myBookmark ? 1 : -1)
        toast({ title: data.myBookmark ? 'পোস্ট সেভ হয়েছে 🔖' : 'সেভ থেকে সরানো হয়েছে' })
      }
    } catch {
      toast({ title: 'সেভ ব্যর্থ', variant: 'destructive' })
    }
  }

  /* ─── ডিলিট ─── */
  const handleDelete = async () => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে পোস্টটি মুছে ফেলতে চান?')) return
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'পোস্ট মুছে ফেলা হয়েছে' })
      onDelete(post.id)
    } else {
      toast({ title: 'মুছে ফেলা ব্যর্থ', variant: 'destructive' })
    }
  }

  return (
    <article
      id={`post-${post.id}`}
      data-post-id={post.id}
      className="bg-[#242526] rounded-xl border border-[#3e4042] shadow-md overflow-hidden hover:border-[#4a4c4e] transition-colors lf-rise scroll-mt-20"
    >
      {/* ═══ হেডার — ইউজার-স্পেক: কম্প্যাক্ট p-3-ধাঁচ (px-3.5/pt-3 থেকে সংকোচিত) ═══ */}
      <div className="flex items-start gap-2.5 px-3 pt-2.5 pb-1.5">
        <button
          onClick={() => onOpenProfile?.(post.author.username)}
          aria-label={`${post.author.name}-এর প্রোফাইল দেখুন`}
          title={`${post.author.name} — প্রোফাইল`}
          className="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-[#00a86b]"
        >
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 hover:ring-2 hover:ring-[#00a86b]/60 transition-all"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#4e4f50]" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap leading-snug">
            <button
              onClick={() => onOpenProfile?.(post.author.username)}
              title={`${post.author.name} (@${post.author.username}) — প্রোফাইল দেখুন`}
              className="text-[13.5px] font-bold text-[#e4e6eb] hover:text-[#00a86b] hover:underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#00a86b] rounded"
            >
              {post.author.name}
            </button>
            {taggedNames.length > 0 && (
              <span className="text-xs text-[#b0b3b8] flex items-center gap-1 min-w-0">
                <UserPlus className="w-3 h-3 shrink-0 text-sky-400" />
                <span className="truncate">
                  {taggedNames.join(', ')}-কে সাথে নিয়ে
                </span>
              </span>
            )}
            {post.feeling && <span className="text-xs text-[#b0b3b8]">— {post.feeling}</span>}
          </div>
          <div className="flex items-center gap-1 text-[11.5px] text-[#b0b3b8] mt-0.5 flex-wrap">
            <span>{timeAgo(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <span title={audience.label} className="flex items-center gap-0.5">
              {post.audience === 'PUBLIC' ? (
                <Globe2 className="w-3 h-3" />
              ) : post.audience === 'FRIENDS' ? (
                <Users className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {audience.label}
            </span>
            {post.location && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                  <MapPin className="w-3 h-3" /> {post.location}
                </span>
              </>
            )}
            {/* Session K: গ্রুপ-পোস্ট চিপ — ক্লিকে গ্রুপে নিয়ে যায় */}
            {post.group && !hideGroupChip && onOpenGroup && (
              <>
                <span aria-hidden>·</span>
                <button
                  onClick={() => onOpenGroup(post.group!.id)}
                  title={`${post.group.name} গ্রুপে যান`}
                  className="lf-post-group-chip inline-flex items-center gap-1 max-w-[180px] text-[#8ecfcc] hover:text-[#33d79f] transition-colors focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  <UsersRound className="w-3 h-3 shrink-0" />
                  <span className="truncate">{post.group.name}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ৩-ডট মেনু */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] flex items-center justify-center text-[#b0b3b8] transition"
            aria-label="পোস্ট অপশন"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-60 bg-[#2c2d2e] border border-[#3e4042] rounded-xl shadow-2xl py-1.5 z-20 lf-anim-pop origin-top-right">
              <MenuBtn
                icon={<Bookmark className={`w-4 h-4 ${post.myBookmark ? 'text-[#00a86b]' : ''}`} />}
                label={post.myBookmark ? 'সেভ থেকে সরান' : 'পোস্ট সেভ করুন'}
                onClick={() => {
                  setMenuOpen(false)
                  toggleBookmark()
                }}
              />
              <MenuBtn
                icon={<Link2 className="w-4 h-4" />}
                label="লিংক কপি করুন"
                onClick={() => {
                  sharePost()
                  setMenuOpen(false)
                }}
              />
              {isMine && (
                <>
                  <MenuBtn
                    icon={<Pencil className="w-4 h-4" />}
                    label="এডিট করুন"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(post)
                    }}
                  />
                  <MenuBtn
                    icon={<Trash2 className="w-4 h-4" />}
                    label="পোস্ট মুছুন"
                    danger
                    onClick={() => {
                      setMenuOpen(false)
                      handleDelete()
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ কনটেন্ট ═══ */}
      {post.content && post.backgroundColor ? (
        <div
          className={`min-h-[220px] ${post.backgroundColor} flex items-center justify-center px-5 py-10`}
        >
          <div
            className="lf-post-content on-gradient bg-on-gradient text-white font-semibold text-lg w-full cursor-pointer"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      ) : post.content ? (
        <div
          className="lf-post-content text-[14.5px] text-[#e4e6eb] px-3 pb-1.5 cursor-pointer"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      ) : null}

      {/* ═══ মিডিয়া কোলাজ ═══ */}
      {post.media.length > 0 && (
        <div className="mt-1">
          <PostMediaCollage media={post.media} onImageClick={(i) => setLightboxIdx(i)} />
        </div>
      )}

      {/* ═══ কাউন্টার বার — কম্প্যাক্ট (py-2 থেকে py-1.5) ═══ */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[12.5px] text-[#b0b3b8]">
        {post.reactionTotal > 0 ? (
          <button
            ref={reactSummaryRef}
            onClick={openReactList}
            aria-expanded={reactListOpen}
            aria-haspopup="dialog"
            title="রিঅ্যাক্ট করেছেন যারা — দেখুন"
            className="lf-react-summary group flex items-center gap-1.5 min-w-0 pl-0.5 pr-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <span className="flex items-center shrink-0">
              {activeReactions.slice(0, 3).map((r, i) => (
                <span
                  key={r.type}
                  className={`w-5 h-5 rounded-full bg-[#3a3b3c] ring-2 ring-[#242526] flex items-center justify-center text-[11px] ${
                    i > 0 ? '-ml-1.5' : ''
                  }`}
                  title={r.label}
                >
                  {r.emoji}
                </span>
              ))}
            </span>
            <span className="truncate group-hover:underline">{bn(post.reactionTotal)} জন</span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${reactListOpen ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <span className="pl-0.5" />
        )}
        <div className="flex items-center gap-3 shrink-0">
          {post.commentCount > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {bn(post.commentCount)} কমেন্ট
            </button>
          )}
          {(post.shares ?? 0) > 0 && <span>{bn(post.shares ?? 0)} শেয়ার</span>}
        </div>
      </div>

      {/* ═══ অ্যাকশন বার ═══ */}
      <div className="flex mx-2.5 mb-1.5 border-t border-[#3e4042] pt-0.5">
        {/* লাইক + রিঅ্যাকশন পপওভার */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionBar(true)}
          onMouseLeave={() => setShowReactionBar(false)}
        >
          {showReactionBar && (
            <div className="absolute bottom-full left-2 mb-1.5 bg-[#2c2d2e] border border-[#3e4042] rounded-full shadow-2xl px-2 py-1.5 flex items-center gap-1 z-10 lf-anim-pop origin-bottom-left">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => react(r.type)}
                  title={r.label}
                  className={`lf-reaction-btn w-9 h-9 flex items-center justify-center text-2xl ${
                    myReaction === r.type ? 'scale-125' : ''
                  }`}
                  aria-label={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => react(myReaction || 'LIKE')}
            className={`w-full py-2 rounded-lg hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] flex items-center justify-center gap-1.5 text-[13px] font-semibold transition active:scale-[0.97] ${
              myReaction === 'LIKE'
                ? 'text-[#45bd62]'
                : myReaction
                  ? 'text-[#f7b125]'
                  : 'text-[#b0b3b8]'
            }`}
          >
            {myReaction ? (
              <span className="text-base leading-none">{REACTION_EMOJI[myReaction]}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            {myReaction ? REACTIONS.find((r) => r.type === myReaction)?.label : 'লাইক'}
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 rounded-lg hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#b0b3b8] transition active:scale-[0.97]"
        >
          <MessageCircle className="w-4 h-4" /> কমেন্ট
        </button>

        <div className="relative flex-1" ref={shareRef}>
          <button
            ref={shareBtnRef}
            onClick={() => {
              if (shareOpen) {
                setShareOpen(false)
                return
              }
              const r = shareBtnRef.current?.getBoundingClientRect()
              if (r) {
                // হরাইজন্টাল ক্ল্যাম্প — মোবাইলে স্ক্রিনের বাইরে না যায়
                const cx = Math.min(Math.max(r.left + r.width / 2, 140), window.innerWidth - 140)
                setSharePos({ left: cx, bottom: window.innerHeight - r.top + 8 })
              }
              setShareOpen(true)
            }}
            aria-expanded={shareOpen}
            aria-label="শেয়ার অপশন"
            className="w-full py-2 rounded-lg hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#b0b3b8] transition active:scale-[0.97]"
          >
            <Share2 className={`w-4 h-4 transition-transform ${shareOpen ? 'rotate-12' : ''}`} /> শেয়ার
          </button>
        </div>
      </div>

      {/* ═══ কমেন্ট সেকশন ═══ */}
      {showComments && (
        <div className="px-3 pb-2.5 lf-anim-fade">
          <CommentThread
            comments={post.comments}
            me={me}
            onAdd={addComment}
            onDelete={deleteComment}
            onReact={reactToComment}
            onEdit={editComment}
            onOpenProfile={onOpenProfile}
          />
        </div>
      )}

      {/* লাইটবক্স */}
      {lightboxIdx >= 0 && (
        <Lightbox
          media={post.media}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(-1)}
          onNavigate={(i) => setLightboxIdx(i)}
        />
      )}

      {/* ═══ শেয়ার মেনু — পোর্টাল (কার্ডের overflow-hidden এড়াতে) ═══ */}
      {shareOpen &&
        sharePos &&
        createPortal(
          <div
            ref={sharePortalRef}
            style={{ left: sharePos.left, bottom: sharePos.bottom }}
            role="menu"
            aria-label="শেয়ার অপশন"
            className="fixed -translate-x-1/2 w-64 bg-[#2c2d2e] border border-[#3e4042] rounded-xl shadow-2xl py-1.5 z-[70] lf-anim-pop origin-bottom"
          >
            <ShareMenuBtn
              icon={<Send className="w-4 h-4 text-[#00a86b]" />}
              label="এখনই শেয়ার করুন"
              sub="লিংক কপি + শেয়ার কাউন্ট"
              onClick={() => {
                setShareOpen(false)
                sharePost()
              }}
            />
            <ShareMenuBtn
              icon={<Link2 className="w-4 h-4" />}
              label="লিংক কপি করুন"
              onClick={() => {
                setShareOpen(false)
                copyLinkOnly()
              }}
            />
            <ShareMenuBtn
              icon={<Share className="w-4 h-4" />}
              label="অন্য অ্যাপে শেয়ার (নেটিভ)"
              onClick={nativeShare}
            />
            <ShareMenuBtn
              icon={<ExternalLink className="w-4 h-4 text-[#4a9ced]" />}
              label="Facebook-এ শেয়ার"
              onClick={() => externalShare('https://www.facebook.com/sharer/sharer.php?u=')}
            />
            <ShareMenuBtn
              icon={<ExternalLink className="w-4 h-4 text-emerald-400" />}
              label="WhatsApp-এ শেয়ার"
              onClick={() => externalShare('https://wa.me/?text=')}
            />
          </div>,
          document.body
        )}

      {/* ═══ Session G: রিঅ্যাকশন-লিস্ট পপওভার — পোর্টাল (কার্ডের overflow-hidden এড়াতে) ═══ */}
      {reactListOpen &&
        reactListPos &&
        createPortal(
          <div
            ref={reactListPortalRef}
            role="dialog"
            aria-label="রিঅ্যাকশন দিয়েছেন যারা"
            style={{ left: reactListPos.left, top: reactListPos.top }}
            className="fixed -translate-x-1/2 -translate-y-full w-[320px] max-w-[calc(100vw-16px)] bg-[#2c2d2e] border border-[#3e4042] rounded-2xl shadow-2xl overflow-hidden z-[70] lf-anim-pop origin-bottom"
          >
            {/* হেডার + টাইপ-ফিল্টার চিপ */}
            <div className="px-3 pt-3 pb-2.5 border-b border-[#3e4042]">
              <div className="flex items-center justify-between px-1 pb-2">
                <h3 className="text-[13.5px] font-extrabold text-white">রিঅ্যাকশন</h3>
                <span className="text-[11.5px] text-[#8a8d91] font-semibold">
                  {bn(reactListData?.total ?? post.reactionTotal)} জন
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto lf-story-scroll" role="tablist">
                <ReactChip
                  active={reactFilter === 'ALL'}
                  onClick={() => setReactFilter('ALL')}
                >
                  সব {bn(reactListData?.total ?? post.reactionTotal)}
                </ReactChip>
                {REACTIONS.filter((r) => (reactListData?.counts[r.type] || 0) > 0).map((r) => (
                  <ReactChip
                    key={r.type}
                    active={reactFilter === r.type}
                    onClick={() => setReactFilter(r.type)}
                  >
                    {r.emoji} {bn(reactListData?.counts[r.type] || 0)}
                  </ReactChip>
                ))}
              </div>
            </div>

            {/* লিস্ট */}
            <div className="max-h-[288px] overflow-y-auto lf-scroll">
              {reactListLoading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center gap-2.5 px-1">
                      <div className="w-9 h-9 rounded-full lf-shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-28 lf-shimmer rounded" />
                        <div className="h-2 w-16 lf-shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !reactListData ? (
                <div className="py-8 px-6 text-center">
                  <p className="text-[13px] font-semibold text-[#e4e6eb]">লোড করা যায়নি</p>
                  <p className="text-[11.5px] text-[#8a8d91] mt-1">আবার চেষ্টা করে দেখুন</p>
                </div>
              ) : reactRows.length === 0 ? (
                <div className="py-8 px-6 text-center">
                  <p className="text-[13px] font-semibold text-[#e4e6eb]">এখানে কেউ নেই</p>
                  <p className="text-[11.5px] text-[#8a8d91] mt-1">
                    {reactFilter === 'ALL' ? 'এখনো কোনো রিঅ্যাকশন পড়েনি' : 'এই রিঅ্যাকশনে কেউ নেই'}
                  </p>
                </div>
              ) : (
                reactRows.map((u, i) => (
                  <button
                    key={`${u.id}-${u.type}`}
                    onClick={() => {
                      setReactListOpen(false)
                      onOpenProfile?.(u.username)
                    }}
                    title={`${u.name}-এর প্রোফাইল দেখুন`}
                    className="lf-pop-row flex items-center gap-2.5 px-4 py-2 hover:bg-[#3a3b3c] transition w-full text-left"
                    style={{ animationDelay: `${Math.min(i * 24, 240)}ms` }}
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                    ) : (
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                          AVATAR_GRADS[Math.abs(hashString(u.id)) % AVATAR_GRADS.length]
                        }`}
                      >
                        {Array.from(u.name)[0] || 'লে'}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#e4e6eb] truncate">
                        {u.name}
                        {u.id === me.id && <span className="text-[#b0b3b8] font-medium"> (আপনি)</span>}
                      </p>
                      <p className="text-[11px] text-[#8a8d91] truncate">@{u.username}</p>
                    </div>
                    <span
                      className="w-7 h-7 rounded-full bg-[#3a3b3c] flex items-center justify-center text-sm shrink-0 ring-1 ring-white/5"
                      title={REACTIONS.find((r) => r.type === u.type)?.label}
                    >
                      {REACTION_EMOJI[u.type] || '👍'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </article>
  )
}

function MenuBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 hover:bg-[#3a3b3c] flex items-center gap-2.5 text-[13.5px] font-semibold text-left transition ${
        danger ? 'text-rose-400' : 'text-[#e4e6eb]'
      }`}
    >
      {icon} {label}
    </button>
  )
}

/** শেয়ার পপওভারের মেনু আইটেম (সাব-লেবেলসহ) */
function ShareMenuBtn({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sub?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 hover:bg-[#3a3b3c] flex items-center gap-2.5 text-left transition"
    >
      <span className="shrink-0 text-[#b0b3b8]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[#e4e6eb] leading-tight">{label}</span>
        {sub && <span className="block text-[10.5px] text-[#8a8d91] leading-tight mt-0.5">{sub}</span>}
      </span>
    </button>
  )
}

/* ═════════ Session G: রিঅ্যাকশন-লিস্ট হেল্পার ═════════ */
interface ReactUserRow {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  type: string
}

const AVATAR_GRADS = [
  'lf-gradient-forest',
  'lf-gradient-sunset',
  'lf-gradient-ocean',
  'lf-gradient-rose',
  'lf-gradient-night',
]

function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return h
}

/** রিঅ্যাকশন-লিস্টের টাইপ-ফিল্টার চিপ */
function ReactChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`lf-reaction-chip rounded-full px-2.5 py-1 text-[12px] font-bold whitespace-nowrap flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
        active
          ? 'bg-[#006a4e]/40 text-white ring-1 ring-[#00a86b]/60'
          : 'bg-[#3a3b3c] text-[#b0b3b8] hover:bg-[#4e4f50] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

/* ═════════ কমেন্ট থ্রেড ═════════ */
function CommentThread({
  comments,
  me,
  onAdd,
  onDelete,
  onReact,
  onEdit,
  onOpenProfile,
  depth = 0,
}: {
  comments: FrontendComment[]
  me: { id: string; name: string; username: string; avatarUrl: string | null }
  onAdd: (content: string, parentId?: string) => Promise<FrontendComment | null>
  onDelete: (commentId: string, parentId?: string) => void
  onReact: (commentId: string, type: string, parentId?: string) => void
  onEdit: (commentId: string, content: string, parentId?: string) => void
  onOpenProfile?: (username: string) => void
  depth?: number
}) {
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const ok = await onAdd(text.trim(), replyTo || undefined)
    if (ok) {
      setText('')
      setReplyTo(null)
    }
    setSending(false)
  }

  return (
    <div className={`space-y-2.5 pt-1 ${depth > 0 ? 'border-l-2 border-[#3e4042] pl-3' : ''}`}>
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="space-y-1.5">
              <CommentBubble
                comment={c}
                isMine={c.author.id === me.id}
                onReply={() => setReplyTo(c.id)}
                onDelete={() => onDelete(c.id)}
                onReact={(type) => onReact(c.id, type, undefined)}
                onEdit={(content) => onEdit(c.id, content, undefined)}
                onOpenProfile={onOpenProfile}
              />
              {c.replies.length > 0 && (
                <div className="space-y-1.5">
                  {c.replies.map((r) => (
                    <CommentBubble
                      key={r.id}
                      comment={r}
                      isMine={r.author.id === me.id}
                      isReply
                      onReply={() => setReplyTo(c.id)}
                      onDelete={() => onDelete(r.id, c.id)}
                      onReact={(type) => onReact(r.id, type, c.id)}
                      onEdit={(content) => onEdit(r.id, content, c.id)}
                      onOpenProfile={onOpenProfile}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* কমেন্ট ইনপুট */}
      <div className="flex items-center gap-2 pt-1">
        {me.avatarUrl ? (
          <img src={me.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#4e4f50]" />
        )}
        <div className="flex-1 flex items-center bg-[#3a3b3c] focus-within:ring-1 focus-within:ring-[#00a86b] rounded-full px-3 py-1.5 gap-2 transition">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={
              replyTo
                ? `${comments.find((c) => c.id === replyTo)?.author.name}-কে উত্তর দিন...`
                : 'একটি কমেন্ট লিখুন...'
            }
            className="flex-1 bg-transparent outline-none text-[13px] text-[#e4e6eb] placeholder:text-[#8a8d91] min-w-0"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="text-[#00a86b] hover:text-[#00c471] disabled:text-[#65676b] transition"
            aria-label="কমেন্ট পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {replyTo && (
          <button
            onClick={() => setReplyTo(null)}
            className="text-[11px] text-[#b0b3b8] hover:text-white flex items-center gap-0.5"
          >
            বাতিল <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function CommentBubble({
  comment,
  isMine,
  isReply = false,
  onReply,
  onDelete,
  onReact,
  onEdit,
  onOpenProfile,
}: {
  comment: FrontendComment
  isMine: boolean
  isReply?: boolean
  onReply: () => void
  onDelete: () => void
  onReact: (type: string) => void
  onEdit: (content: string) => void
  onOpenProfile?: (username: string) => void
}) {
  const [barOpen, setBarOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // সম্পাদিত ইন্ডিকেটর (১ মিনিটের বেশি পার্থক্য হলে)
  const isEdited =
    comment.updatedAt &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 60_000

  const openBar = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setBarOpen(true)
  }
  const closeBar = () => {
    hideTimer.current = setTimeout(() => setBarOpen(false), 250)
  }

  const saveEdit = () => {
    const t = editText.trim()
    if (!t) return
    onEdit(t)
    setEditing(false)
  }

  // রিঅ্যাকশন চিপে দেখানো ইমোজি (সর্বোচ্চ ২ টাইপ)
  const chipTypes = Object.entries(comment.reactionCounts || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)

  return (
    <div className={`flex items-start gap-2 group ${isReply ? 'ml-0' : ''}`}>
      <button
        onClick={() => onOpenProfile?.(comment.author.username)}
        aria-label={`${comment.author.name}-এর প্রোফাইল দেখুন`}
        title={`${comment.author.name} — প্রোফাইল`}
        className="rounded-full shrink-0 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
      >
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt=""
            className={`rounded-full object-cover hover:ring-2 hover:ring-[#00a86b]/60 transition-all ${isReply ? 'w-7 h-7' : 'w-8 h-8'}`}
          />
        ) : (
          <div className={`rounded-full bg-[#4e4f50] shrink-0 ${isReply ? 'w-7 h-7' : 'w-8 h-8'}`} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full">
          {editing ? (
            /* ─── এডিট মোড ─── */
            <div className="bg-[#3a3b3c] rounded-2xl px-2.5 py-2 border border-[#00a86b]/60 lf-anim-fade">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') setEditing(false)
                }}
                autoFocus
                className="bg-transparent outline-none text-[13px] text-[#e4e6eb] w-full min-w-[220px] max-w-[420px]"
                aria-label="কমেন্ট সম্পাদনা"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={saveEdit}
                  disabled={!editText.trim()}
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#006a4e] text-white hover:bg-[#00523c] disabled:opacity-40 transition"
                >
                  সংরক্ষণ
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-[11px] font-semibold text-[#b0b3b8] hover:text-white transition"
                >
                  বাতিল
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`bg-[#3a3b3c] rounded-2xl px-3 py-2 inline-block max-w-full transition-shadow ${
                  comment.myReaction ? 'ring-1 ring-[#00a86b]/50' : ''
                }`}
              >
                <p className="text-[12.5px] font-bold text-[#e4e6eb] leading-tight">
                  <button
                    onClick={() => onOpenProfile?.(comment.author.username)}
                    title={`${comment.author.name} (@${comment.author.username}) — প্রোফাইল দেখুন`}
                    className="hover:text-[#00a86b] hover:underline underline-offset-2 transition-colors"
                  >
                    {comment.author.name}
                  </button>
                </p>
                <p className="text-[13px] text-[#e4e6eb] break-words">{comment.content}</p>
              </div>

              {/* রিঅ্যাকশন কাউন্ট চিপ (বাবলের কোণে) */}
              {comment.reactionTotal > 0 && (
                <span
                  className="lf-react-chip absolute -bottom-2.5 -right-2 rounded-full px-1.5 h-[18px] flex items-center gap-0.5 text-[10.5px] font-bold text-[#e4e6eb] lf-anim-pop"
                  title={`${bn(comment.reactionTotal)} রিঅ্যাকশন`}
                >
                  {chipTypes.map(([t]) => (
                    <span key={t} className="text-[10px] leading-none">
                      {COMMENT_EMOJI[t]}
                    </span>
                  ))}
                  {comment.reactionTotal > 1 && <span>{bn(comment.reactionTotal)}</span>}
                </span>
              )}
            </>
          )}

          {/* মিনি রিঅ্যাকশন বার (হোভার/ক্লিকে) */}
          {!editing && barOpen && (
            <div
              className="absolute bottom-full left-1 mb-1.5 bg-[#2c2d2e] border border-[#3e4042] rounded-full shadow-2xl px-1.5 py-1 flex items-center gap-0.5 z-10 lf-anim-pop origin-bottom-left"
              onMouseEnter={openBar}
              onMouseLeave={closeBar}
            >
              {COMMENT_REACTIONS.map((t) => {
                const meta = REACTIONS.find((r) => r.type === t)
                return (
                  <button
                    key={t}
                    onClick={() => {
                      onReact(t)
                      setBarOpen(false)
                    }}
                    title={meta?.label}
                    aria-label={meta?.label}
                    className={`lf-mini-react w-8 h-8 flex items-center justify-center text-xl rounded-full hover:bg-[#3a3b3c] ${
                      comment.myReaction === t ? 'scale-110 bg-[#3a3b3c]' : ''
                    }`}
                  >
                    {meta?.emoji}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 pt-0.5 text-[11px] text-[#b0b3b8] lf-comment-actions">
          <span>
            {timeAgo(comment.createdAt)}
            {isEdited && <span className="text-[#8a8d91]"> (সম্পাদিত)</span>}
          </span>

          {/* লাইক ট্রিগার — হোভারে মিনি বার, ক্লিকে সরাসরি LIKE */}
          <span
            className="relative"
            onMouseEnter={openBar}
            onMouseLeave={closeBar}
          >
            <button
              onClick={() => {
                if (comment.myReaction) {
                  // আগের রিঅ্যাকশন বাতিল
                  onReact(comment.myReaction)
                } else {
                  openBar()
                }
              }}
              className={`font-semibold hover:underline transition ${
                comment.myReaction ? 'text-[#00a86b]' : ''
              }`}
            >
              {comment.myReaction ? COMMENT_EMOJI[comment.myReaction] : 'লাইক'}
            </button>
          </span>

          <button onClick={onReply} className="font-semibold hover:underline">
            উত্তর দিন
          </button>
          {isMine && (
            <>
              <button
                onClick={() => {
                  setEditText(comment.content)
                  setEditing(true)
                }}
                className="font-semibold hover:underline text-[#8ab4f8]/80 hover:text-[#8ab4f8] transition"
              >
                সম্পাদনা
              </button>
              <button
                onClick={onDelete}
                className="font-semibold hover:underline text-rose-400/80 hover:text-rose-400 transition"
              >
                মুছুন
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
