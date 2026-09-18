'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Eye, Trash2, ChevronLeft, ChevronRight, Feather, Send, MessageCircle, Users, UserX, MessageSquareOff } from 'lucide-react'
import type { StoryRing } from '@/lib/story-data'
import { timeAgo, timeLeftBn, bnCount } from '@/lib/story-data'

const STORY_DURATION_MS = 5000
const QUICK_EMOJIS = ['❤️', '😆', '😮', '👏']

interface ViewerRow {
  id: string
  createdAt: string
  user: { id: string; name: string; username: string; avatarUrl: string | null }
}
interface ReplyRow {
  id: string
  content: string
  read: boolean
  createdAt: string
  user: { id: string; name: string; username: string; avatarUrl: string | null }
}

export default function StoryViewer({
  rings,
  startRing,
  startStoryIdx = 0,
  onClose,
  onViewed,
  onDeleted,
}: {
  rings: StoryRing[]
  startRing: number
  /** ডিপ-লিংকে নির্দিষ্ট স্টোরি থেকে শুরু (?story= — Session G) */
  startStoryIdx?: number
  onClose: () => void
  /** একটি স্টোরি দেখা হলে (বার-এ রিং ধূসর করতে) */
  onViewed: (storyId: string) => void
  /** স্টোরি ডিলিট হলে (লোকাল স্টেট থেকে বাদ দিতে) */
  onDeleted: (storyId: string) => void
}) {
  const [ringIdx, setRingIdx] = useState(startRing)
  const [storyIdx, setStoryIdx] = useState(Math.max(0, startStoryIdx))
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* ─── Session F: রিপ্লাই স্টেট ─── */
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [replyJustSent, setReplyJustSent] = useState(false)
  const [typingReply, setTypingReply] = useState(false)
  const replyInputRef = useRef<HTMLInputElement>(null)

  /* ─── Session F: ভিউয়ার-প্যানেল স্টেট (নিজের স্টোরি) ─── */
  const [showViewers, setShowViewers] = useState(false)
  const [viewersTab, setViewersTab] = useState<'viewers' | 'replies'>('viewers')
  const [viewersData, setViewersData] = useState<{ viewers: ViewerRow[]; replies: ReplyRow[] } | null>(null)
  const [viewersLoading, setViewersLoading] = useState(false)
  /* ─── Session J: অপঠিত রিপ্লাই (পড়া-মার্ক) ─── */
  const [unreadReplies, setUnreadReplies] = useState(0)

  const pausedRef = useRef(false)
  const typingRef = useRef(false)
  const panelOpenRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const ring = rings[ringIdx]
  const story = ring?.stories[storyIdx]
  const isImage = Boolean(story?.mediaUrl)
  const isMine = Boolean(ring?.isMe)

  /* টাইপিং/প্যানেল অবস্থায় স্টোরি থামিয়ে রাখা */
  useEffect(() => {
    typingRef.current = typingReply
    if (typingReply) pausedRef.current = true
    else if (!panelOpenRef.current) pausedRef.current = false
  }, [typingReply])

  useEffect(() => {
    panelOpenRef.current = showViewers
    if (showViewers) pausedRef.current = true
    else if (!typingRef.current) pausedRef.current = false
  }, [showViewers])

  /* ─── মাউন্ট গেট (পোর্টাল) ─── */
  useEffect(() => setMounted(true), [])

  /* ─── বডি স্ক্রল-লক ─── */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  /* ─── রিং/স্টোরি বদলালে প্রোগ্রেস + রিপ্লাই/প্যানেল রিসেট ─── */
  useEffect(() => {
    elapsedRef.current = 0
    startTimeRef.current = null
    setProgress(0)
    setReplyText('')
    setReplyJustSent(false)
    setTypingReply(false)
    setShowViewers(false)
    setViewersData(null)
    setViewersTab('viewers')
    setUnreadReplies(0)
  }, [ringIdx, storyIdx])

  /* ─── স্টোরি দেখা হলে ভিউ-মার্ক ─── */
  useEffect(() => {
    if (!story) return
    if (!story.viewed) onViewed(story.id)
    fetch(`/api/stories/${story.id}/view`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => {})
  }, [story?.id, onViewed])

  /* ─── অ্যাডভান্স লজিক ─── */
  const advance = useCallback(() => {
    const currentRing = rings[ringIdx]
    if (!currentRing) return
    if (storyIdx + 1 < currentRing.stories.length) {
      setStoryIdx((i) => i + 1)
    } else if (ringIdx + 1 < rings.length) {
      setRingIdx((r) => r + 1)
      setStoryIdx(0)
    } else {
      onClose()
    }
  }, [rings, ringIdx, storyIdx, onClose])

  const goBack = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1)
    } else if (ringIdx > 0) {
      setRingIdx((r) => r - 1)
      setStoryIdx(0)
    } else {
      setProgress(0)
      elapsedRef.current = 0
    }
  }, [ringIdx, storyIdx])

  /* ─── rAF প্রোগ্রেস-লুপ (hold-এ পজ) ─── */
  useEffect(() => {
    if (!story) return
    const step = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts
      if (!pausedRef.current) {
        elapsedRef.current += ts - startTimeRef.current
        if (elapsedRef.current >= STORY_DURATION_MS) {
          setProgress(1)
          advance()
          return
        }
        setProgress(elapsedRef.current / STORY_DURATION_MS)
      }
      startTimeRef.current = ts
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [story?.id, advance])

  /* ─── কীবোর্ড ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showViewers) setShowViewers(false)
        else onClose()
      } else if (e.key === 'ArrowRight' && !typingReply) advance()
      else if (e.key === 'ArrowLeft' && !typingReply) goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, goBack, onClose, showViewers, typingReply])

  /* ─── ডিলিট (নিজের স্টোরি) ─── */
  const handleDelete = async () => {
    if (!story || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/stories/${story.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onDeleted(story.id)
      // লোকাল ন্যাভিগেশন: রিং ফাঁকা হলে পরের রিং, নাহলে একই ইনডেক্স
      const updated = rings.map((r, i) =>
        i === ringIdx ? { ...r, stories: r.stories.filter((s) => s.id !== story.id) } : r
      )
      const currentRingUpdated = updated[ringIdx]
      if (!currentRingUpdated || currentRingUpdated.stories.length === 0) {
        if (updated.filter((r) => r.stories.length > 0).length === 0) onClose()
        else if (ringIdx + 1 < rings.length) {
          setRingIdx(ringIdx + 1)
          setStoryIdx(0)
        } else if (ringIdx > 0) {
          setRingIdx(ringIdx - 1)
          setStoryIdx(0)
        } else onClose()
      } else if (storyIdx >= currentRingUpdated.stories.length) {
        setStoryIdx(Math.max(0, currentRingUpdated.stories.length - 1))
      }
    } catch {
      /* silent */
    } finally {
      setDeleting(false)
    }
  }

  /* ─── Session F: রিপ্লাই পাঠানো ─── */
  const sendReply = useCallback(
    async (content: string) => {
      if (!story || !content.trim() || sendingReply) return
      setSendingReply(true)
      try {
        const res = await fetch(`/api/stories/${story.id}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
        })
        if (!res.ok) throw new Error()
        setReplyText('')
        setReplyJustSent(true)
        replyInputRef.current?.blur()
        setTimeout(() => setReplyJustSent(false), 2500)
      } catch {
        /* সাইলেন্ট — ইনপুটে লেখা থেকে যায় */
      } finally {
        setSendingReply(false)
      }
    },
    [story, sendingReply]
  )

  /* ─── Session F: ভিউয়ার-প্যানেল খোলা ─── */
  const openViewers = useCallback(async () => {
    if (!story) return
    setShowViewers(true)
    setViewersLoading(true)
    try {
      const res = await fetch(`/api/stories/${story.id}/viewers`)
      if (res.ok) {
        const data = await res.json()
        setViewersData({ viewers: data.viewers || [], replies: data.replies || [] })
        setUnreadReplies(data.unreadReplies ?? 0)
      }
    } catch {
      /* silent */
    } finally {
      setViewersLoading(false)
    }
  }, [story])

  /* ─── Session J: রিপ্লাই-ট্যাবে গেলেই অপঠিত রিপ্লাই পড়া-মার্ক ─── */
  const markRepliesRead = useCallback(async () => {
    if (!story) return
    try {
      const res = await fetch(`/api/stories/${story.id}/replies/read`, { method: 'POST' })
      if (res.ok) {
        setUnreadReplies(0)
        setViewersData((prev) =>
          prev ? { ...prev, replies: prev.replies.map((r) => ({ ...r, read: true })) } : prev
        )
      }
    } catch {
      /* silent */
    }
  }, [story])

  useEffect(() => {
    if (showViewers && viewersTab === 'replies' && unreadReplies > 0) markRepliesRead()
  }, [showViewers, viewersTab, unreadReplies, markRepliesRead])

  if (!mounted) return null
  if (!ring || !story) return null

  const replyCount = viewersData?.replies.length ?? 0
  const viewerCount = viewersData?.viewers.length ?? 0

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center lf-story-fade"
      role="dialog"
      aria-modal="true"
      aria-label={`${ring.author.name}-এর স্টোরি`}
      onPointerDown={() => {
        pausedRef.current = true
      }}
      onPointerUp={() => {
        pausedRef.current = typingRef.current || panelOpenRef.current
      }}
      onPointerLeave={() => {
        pausedRef.current = typingRef.current || panelOpenRef.current
      }}
    >
      {/* ক্লোজ */}
      <button
        onClick={onClose}
        aria-label="বন্ধ করুন"
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ডেস্কটপ প্রিভ/নেক্সট অ্যারো */}
      <button
        onClick={goBack}
        aria-label="আগের স্টোরি"
        className="hidden sm:flex absolute left-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={advance}
        aria-label="পরের স্টোরি"
        className="hidden sm:flex absolute right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ফোন-ফ্রেম */}
      <div className="relative w-full h-full sm:w-[400px] sm:h-[90vh] sm:max-h-[760px] sm:rounded-2xl overflow-hidden shadow-2xl select-none lf-story-pop">
        {/* কনটেন্ট */}
        {isImage ? (
          <img
            key={story.id}
            src={story.mediaUrl!}
            alt={story.text || `${ring.author.name}-এর স্টোরি`}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover lf-story-content"
          />
        ) : (
          <div
            key={story.id}
            className={`absolute inset-0 ${story.background ?? 'story-gradient-1'} lf-story-content flex items-center justify-center p-8`}
          >
            <p className="text-white text-2xl sm:text-[27px] font-extrabold leading-relaxed text-center drop-shadow-lg whitespace-pre-wrap">
              {story.text}
            </p>
          </div>
        )}

        {/* ছবির উপর ক্যাপশন */}
        {isImage && story.text && (
          <div
            className={`absolute inset-x-0 px-6 transition-all duration-300 ${
              showViewers ? 'bottom-44' : isMine ? 'bottom-16' : 'bottom-[7rem]'
            }`}
          >
            <div className="bg-black/45 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white text-[15px] font-semibold text-center leading-relaxed whitespace-pre-wrap">
                {story.text}
              </p>
            </div>
          </div>
        )}

        {/* উপর-নিচ স্ক্রিম (টেক্সট পাঠযোগ্যতা) */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* প্রোগ্রেস সেগমেন্ট */}
        <div className="absolute top-2 inset-x-3 flex gap-1 z-10">
          {ring.stories.map((s, i) => (
            <div key={s.id} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < storyIdx ? '100%' : i === storyIdx ? `${progress * 100}%` : '0%',
                  transition: i === storyIdx ? 'none' : 'width .2s',
                }}
              />
            </div>
          ))}
        </div>

        {/* হেডার */}
        <div className="absolute top-5 inset-x-3 z-10 flex items-center gap-2.5 pt-1">
          <span className="w-10 h-10 rounded-full border border-white/40 overflow-hidden bg-[#3a3b3c] shrink-0">
            {ring.author.avatarUrl ? (
              <img src={ring.author.avatarUrl} alt={ring.author.name} className="w-full h-full object-cover" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[13.5px] font-bold leading-tight truncate drop-shadow">
              {ring.isMe ? 'আপনার স্টোরি' : ring.author.name}
            </p>
            <p className="text-white/70 text-[11px] leading-tight">
              {timeAgo(story.createdAt)} · {timeLeftBn(story.expiresAt)}
            </p>
          </div>
          {ring.isMe && (
            <div className="flex items-center gap-1">
              <button
                onClick={openViewers}
                aria-label="কে দেখেছে ও রিপ্লাই দেখুন"
                title="কে দেখেছে · রিপ্লাই"
                className="flex items-center gap-1 text-white/90 text-xs font-bold bg-black/45 hover:bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1.5 transition focus-visible:ring-2 focus-visible:ring-[#00a86b] lf-viewer-chip"
              >
                <Eye className="w-3.5 h-3.5" /> {bnCount(story.viewCount ?? 0)}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="স্টোরি মুছুন"
                title="স্টোরি মুছুন"
                className="w-8 h-8 rounded-full bg-black/45 hover:bg-rose-600/80 backdrop-blur-sm text-white flex items-center justify-center transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ক্লিক-জোন (মোবাইল ট্যাপ নেভিগেশন) */}
        <button
          onClick={goBack}
          aria-label="আগের"
          className="absolute left-0 top-24 bottom-24 w-1/3 z-[5] opacity-0 cursor-pointer focus:outline-none"
        />
        <button
          onClick={advance}
          aria-label="পরের"
          className="absolute right-0 top-24 bottom-24 w-2/3 z-[5] opacity-0 cursor-pointer focus:outline-none"
        />

        {/* নিচে হিন্ট (লেখক স্টোরিতে কলম চিহ্ন) */}
        {!isImage && (
          <div className={`absolute inset-x-0 z-10 flex justify-center ${isMine ? 'bottom-3' : 'bottom-[7.2rem]'}`}>
            <span className="flex items-center gap-1.5 text-white/60 text-[11px] font-semibold bg-black/40 rounded-full px-3 py-1.5">
              <Feather className="w-3 h-3" /> লেখক ফোরাম স্টোরি{!isMine ? '' : ' · ধরে রাখলে থামে'}
            </span>
          </div>
        )}

        {/* ─── Session F: রিপ্লাই-বার (অন্যের স্টোরি) ─── */}
        {!isMine && (
          <div className="absolute bottom-3 inset-x-3 z-20 space-y-2 lf-reply-bar">
            {/* কুইক-ইমোজি */}
            <div className="flex items-center justify-center gap-2">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReply(emoji)}
                  disabled={sendingReply}
                  aria-label={`রিপ্লাই ${emoji}`}
                  className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-sm text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  {emoji}
                </button>
              ))}
            </div>
            {/* টেক্সট-ইনপুট */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-black/45 backdrop-blur-sm rounded-full border border-white/15 focus-within:border-[#00a86b]/60 focus-within:bg-black/60 transition-all">
                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value.slice(0, 300))}
                  onFocus={() => setTypingReply(true)}
                  onBlur={() => setTypingReply(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      sendReply(replyText)
                    }
                  }}
                  placeholder={replyJustSent ? 'রিপ্লাই পাঠানো হয়েছে ✓' : 'রিপ্লাই দিন...'}
                  aria-label="স্টোরিতে রিপ্লাই"
                  maxLength={300}
                  className="flex-1 bg-transparent text-white placeholder-white/50 text-[13.5px] px-4 py-2.5 outline-none min-w-0"
                />
              </div>
              <button
                onClick={() => sendReply(replyText)}
                disabled={!replyText.trim() || sendingReply}
                aria-label="রিপ্লাই পাঠান"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
                  replyJustSent
                    ? 'bg-[#00a86b] text-white'
                    : 'bg-gradient-to-br from-[#00a86b] to-[#00c471] text-white hover:brightness-110'
                }`}
              >
                {replyJustSent ? <span className="text-sm font-bold">✓</span> : <Send className="w-4 h-4 -ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {/* ─── Session F: ভিউয়ার-প্যানেল (নিজের স্টোরি) ─── */}
        {showViewers && isMine && (
          <div className="lf-story-info absolute inset-x-2 bottom-2 z-30 max-h-[52%] bg-[#1c1e21]/95 backdrop-blur-md rounded-xl border border-white/10 flex flex-col lf-sheet-up shadow-2xl">
            {/* প্যানেল হেডার */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-2 shrink-0">
              <p className="text-white text-[13px] font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#00a86b]" /> স্টোরির তথ্য
              </p>
              <button
                onClick={() => setShowViewers(false)}
                aria-label="প্যানেল বন্ধ করুন"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* ট্যাব */}
            <div className="flex gap-1 px-3.5 pb-2 shrink-0">
              <button
                onClick={() => setViewersTab('viewers')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition ${
                  viewersTab === 'viewers'
                    ? 'bg-[#00a86b]/20 text-[#00d67e]'
                    : 'bg-white/5 text-white/60 hover:text-white/90'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> দেখেছে {bnCount(viewerCount)}
              </button>
              <button
                onClick={() => setViewersTab('replies')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition relative ${
                  viewersTab === 'replies'
                    ? 'bg-[#00a86b]/20 text-[#00d67e]'
                    : 'bg-white/5 text-white/60 hover:text-white/90'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> রিপ্লাই {bnCount(replyCount)}
                {unreadReplies > 0 && (
                  <span className="lf-unread-chip absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#00a86b] text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg">
                    {bnCount(unreadReplies)}
                  </span>
                )}
              </button>
            </div>
            {/* লিস্ট */}
            <div className="overflow-y-auto lf-scroll px-3.5 pb-3.5 space-y-1.5 min-h-[120px]">
              {viewersLoading ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full lf-shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 w-1/2 lf-shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : viewersTab === 'viewers' ? (
                viewerCount === 0 ? (
                  <div className="py-7 text-center space-y-1.5">
                    <UserX className="w-7 h-7 text-white/25 mx-auto" />
                    <p className="text-white/60 text-[12.5px] font-semibold">এখনও কেউ দেখেনি</p>
                    <p className="text-white/35 text-[11px]">স্টোরি দেখা হলে নাম এখানে দেখা যাবে</p>
                  </div>
                ) : (
                  viewersData!.viewers.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/5 transition lf-anim-fade"
                    >
                      <span className="w-8 h-8 rounded-full overflow-hidden bg-[#3a3b3c] ring-1 ring-white/10 shrink-0">
                        {v.user.avatarUrl && (
                          <img src={v.user.avatarUrl} alt={v.user.name} className="w-full h-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-white text-[12.5px] font-bold truncate">{v.user.name}</span>
                        <span className="block text-white/45 text-[10.5px]">{timeAgo(v.createdAt)} আগে দেখেছে</span>
                      </span>
                    </div>
                  ))
                )
              ) : replyCount === 0 ? (
                <div className="py-7 text-center space-y-1.5">
                  <MessageSquareOff className="w-7 h-7 text-white/25 mx-auto" />
                  <p className="text-white/60 text-[12.5px] font-semibold">কোনো রিপ্লাই নেই</p>
                  <p className="text-white/35 text-[11px]">কেউ রিপ্লাই দিলে এখানে জমা হবে</p>
                </div>
              ) : (
                viewersData!.replies.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-start gap-2.5 py-1.5 px-2 rounded-lg transition lf-anim-fade ${
                      r.read ? 'hover:bg-white/5' : 'bg-[#00a86b]/12 hover:bg-[#00a86b]/20 ring-1 ring-[#00a86b]/25'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full overflow-hidden bg-[#3a3b3c] ring-1 ring-white/10 shrink-0 relative">
                      {r.user.avatarUrl && (
                        <img src={r.user.avatarUrl} alt={r.user.name} className="w-full h-full object-cover" />
                      )}
                      {!r.read && (
                        <span className="lf-dot-pulse absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00d67e] ring-2 ring-[#1c1e21]" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="text-white text-[12.5px] font-bold truncate">{r.user.name}</span>
                        {!r.read && (
                          <span className="text-[9.5px] font-extrabold text-[#00d67e] bg-[#00a86b]/15 rounded px-1 py-px shrink-0 tracking-wide">নতুন</span>
                        )}
                        <span className="text-white/35 text-[10px] shrink-0">{timeAgo(r.createdAt)}</span>
                      </span>
                      <span className={`block text-[12.5px] leading-snug break-words ${r.read ? 'text-white/85' : 'text-white'}`}>{r.content}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
