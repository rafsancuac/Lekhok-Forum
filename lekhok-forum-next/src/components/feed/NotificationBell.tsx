'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, Inbox, SlidersHorizontal } from 'lucide-react'
import type { FrontendNotification, FrontendUser } from '@/lib/types'
import { NOTIFICATION_META, NOTIF_PREF_OPTIONS } from '@/lib/types'
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
  return new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })
}

const ACTION_TEXT: Record<string, string> = {
  REACTION: 'আপনার পোস্টে রিঅ্যাকশন দিয়েছে',
  COMMENT: 'আপনার পোস্টে কমেন্ট করেছে',
  REPLY: 'আপনার কমেন্টে উত্তর দিয়েছে',
  TAG: 'আপনাকে একটি পোস্টে ট্যাগ করেছে',
  SHARE: 'আপনার পোস্ট শেয়ার করেছে',
  STORY_REPLY: 'আপনার স্টোরিতে রিপ্লাই দিয়েছে',
  FOLLOW: 'আপনাকে অনুসরণ করছেন',
}

export default function NotificationBell({
  current,
  onNavigateToPost,
  onOpenStory,
  onOpenProfile,
}: {
  current: FrontendUser | null
  onNavigateToPost?: (postId: string) => void
  /** Session G: স্টোরি-নোটিফিকেশন ক্লিকে ভিউয়ার ওপেন (?story= ডিপ-লিংক) */
  onOpenStory?: (storyId: string) => void
  /** Session H: FOLLOW-নোটিফিকেশন ক্লিকে অ্যাক্টরের প্রোফাইল */
  onOpenProfile?: (username: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<FrontendNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const [showPrefs, setShowPrefs] = useState(false)
  const [mutedTypes, setMutedTypes] = useState<string[]>([])
  const [prefsLoading, setPrefsLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setItems(data.notifications || [])
      setUnread(data.unread || 0)
    } catch {
      /* সাইলেন্ট — নোটিফিকেশন ব্যর্থ হলেও অ্যাপ চলবে */
    } finally {
      setLoading(false)
    }
  }, [])

  // ইউজার বদলালে রিসেট + প্রথম লোড + ২০ সেকেন্ড পোলিং
  useEffect(() => {
    if (!current) return
    const first = setTimeout(load, 30)
    const iv = setInterval(load, 20000)
    return () => {
      clearTimeout(first)
      clearInterval(iv)
    }
  }, [current?.id, load])

  // প্যানেল খুললে ফ্রেশ লোড + মিউট-প্রেফারেন্স ফেচ, তারপর সব পড়া মার্ক
  useEffect(() => {
    if (!open) return
    const refresh = setTimeout(load, 30)
    const prefs = setTimeout(async () => {
      try {
        const res = await fetch('/api/notifications/prefs')
        if (res.ok) {
          const data = await res.json()
          setMutedTypes(data.mutedTypes || [])
        }
      } catch {
        /* সাইলেন্ট */
      }
    }, 40)
    const mark = setTimeout(async () => {
      const res = await fetch('/api/notifications', { method: 'POST' })
      if (res.ok) setUnread(0)
    }, 1500)
    return () => {
      clearTimeout(refresh)
      clearTimeout(prefs)
      clearTimeout(mark)
    }
  }, [open, load])

  // বাইরে ক্লিকে বন্ধ
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleClick = (n: FrontendNotification) => {
    if (!n.read) {
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      }).then(() => {
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
        setUnread((u) => Math.max(0, u - 1))
      })
    }
    if (n.postId) {
      onNavigateToPost?.(n.postId)
      setOpen(false)
    } else if (n.storyId) {
      // Session G: স্টোরি-রিপ্লাই নোটিফিকেশন → স্টোরি ভিউয়ার ওপেন
      onOpenStory?.(n.storyId)
      setOpen(false)
    } else if (n.type === 'FOLLOW') {
      // Session H: নতুন ফলোয়ার → অ্যাক্টরের প্রোফাইল
      onOpenProfile?.(n.actor.username)
      setOpen(false)
    }
  }

  const markAllRead = async () => {
    const res = await fetch('/api/notifications', { method: 'POST' })
    if (res.ok) {
      setItems((prev) => prev.map((x) => ({ ...x, read: true })))
      setUnread(0)
    }
  }

  /* ─── মিউট-প্রেফারেন্স টগল (সাথে সাথে PUT) ─── */
  const togglePref = async (type: string) => {
    if (prefsLoading) return
    const next = mutedTypes.includes(type)
      ? mutedTypes.filter((t) => t !== type)
      : [...mutedTypes, type]
    setMutedTypes(next)
    setPrefsLoading(true)
    try {
      const res = await fetch('/api/notifications/prefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutedTypes: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setMutedTypes(mutedTypes) // রোলব্যাক
    } finally {
      setPrefsLoading(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-full focus-visible:ring-2 focus-visible:ring-[#00a86b] flex items-center justify-center transition ${
          open ? 'bg-[#4e4f50] text-[#00a86b]' : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
        }`}
        aria-label={`নোটিফিকেশন${unread > 0 ? ` — ${bn(unread)}টি অপঠিত` : ''}`}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 rounded-full border-2 border-[#242526] text-[10.5px] font-bold text-white flex items-center justify-center lf-badge-pop">
            {bn(unread)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 top-[3.9rem] z-50 flex max-h-[70vh] flex-col bg-[#2c2d2e] border border-[#3e4042] rounded-xl shadow-2xl overflow-hidden lf-anim-pop origin-top sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[340px] sm:max-h-none sm:flex-none sm:origin-top-right">
          {/* হেডার */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e4042] shrink-0">
            <h2 className="font-extrabold text-white text-[15px]">নোটিফিকেশন</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrefs((v) => !v)}
                aria-label="নোটিফিকেশন প্রেফারেন্স"
                aria-expanded={showPrefs}
                title="নোটিফিকেশন প্রেফারেন্স"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
                  showPrefs ? 'bg-[#00a86b]/20 text-[#00a86b]' : 'text-[#b0b3b8] hover:bg-[#3a3b3c] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={markAllRead}
                disabled={unread === 0}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-[#00a86b] hover:text-[#00c471] disabled:text-[#65676b] disabled:cursor-not-allowed transition"
              >
                <CheckCheck className="w-3.5 h-3.5" /> সব পড়া হয়েছে
              </button>
            </div>
          </div>

          {/* মিউট-প্রেফারেন্স প্যানেল */}
          {showPrefs && (
            <div className="px-4 py-3 border-b border-[#3e4042] bg-[#242526] space-y-2 lf-anim-fade">
              <p className="text-[11px] font-bold text-[#b0b3b8] uppercase tracking-wide">
                কোন নোটিফিকেশন চান?
              </p>
              {NOTIF_PREF_OPTIONS.map((opt) => {
                const enabled = !mutedTypes.includes(opt.type)
                return (
                  <button
                    key={opt.type}
                    onClick={() => togglePref(opt.type)}
                    disabled={prefsLoading}
                    role="switch"
                    aria-checked={enabled}
                    className="w-full flex items-center justify-between gap-2 group disabled:opacity-60"
                  >
                    <span className="flex items-center gap-2 text-[12.5px] text-[#e4e6eb]">
                      <span className="text-sm">{opt.emoji}</span>
                      {opt.label}
                    </span>
                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                        enabled ? 'bg-[#00a86b]' : 'bg-[#555658] group-hover:bg-[#65676b]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          enabled ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>
                )
              })}
              <p className="text-[10.5px] text-[#65676b] pt-1 leading-relaxed">
                বন্ধ করা ধরনের নোটিফিকেশন আর তৈরি হবে না (আগেরগুলো থেকে যাবে)।
              </p>
            </div>
          )}

          {/* লিস্ট */}
          <div className="overflow-y-auto lf-scroll max-h-[60vh] sm:max-h-[420px]">
            {loading && items.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full lf-shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-3/4 lf-shimmer rounded" />
                      <div className="h-2 w-1/3 lf-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 px-6 text-center space-y-2">
                <span className="inline-flex w-12 h-12 rounded-full bg-[#3a3b3c] items-center justify-center">
                  <Inbox className="w-6 h-6 text-[#00a86b]" />
                </span>
                <p className="font-bold text-white text-sm">কোনো নোটিফিকেশন নেই</p>
                <p className="text-xs text-[#b0b3b8] leading-relaxed">
                  কেউ আপনার পোস্টে রিঅ্যাকশন, কমেন্ট বা শেয়ার করলে এখানে দেখা যাবে।
                </p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const meta = NOTIFICATION_META[n.type] || NOTIFICATION_META.REACTION
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleClick(n)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-2.5 hover:bg-[#3a3b3c] transition lf-anim-fade ${
                          n.read ? 'bg-transparent' : 'bg-[#00a86b]/[0.08]'
                        }`}
                      >
                        {/* অ্যাক্টর অ্যাভাটার + টাইপ ব্যাজ */}
                        <span className="relative shrink-0">
                          {n.actor.avatarUrl ? (
                            <img
                              src={n.actor.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                            />
                          ) : (
                            <span className="w-10 h-10 rounded-full bg-[#4e4f50] block" />
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#3a3b3c] border border-[#2c2d2e] flex items-center justify-center text-[10px]">
                            {meta.emoji}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] leading-snug text-[#e4e6eb]">
                            <span className="font-bold">{n.actor.name}</span> {ACTION_TEXT[n.type] || 'আপনার সাথে যোগাযোগ করেছে'}
                          </span>
                          {n.postExcerpt && (
                            <span className="block text-[11.5px] text-[#8a8d91] truncate mt-0.5">
                              &ldquo;{n.postExcerpt}&rdquo;
                            </span>
                          )}
                          {n.storyExcerpt && !n.postExcerpt && (
                            <span className="block text-[11.5px] text-[#8a8d91] truncate mt-0.5">
                              📸 &ldquo;{n.storyExcerpt}&rdquo;
                            </span>
                          )}
                          <span className={`block text-[11px] mt-0.5 font-semibold ${meta.color}`}>
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        {!n.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00a86b] shrink-0 mt-1.5" aria-label="অপঠিত" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
