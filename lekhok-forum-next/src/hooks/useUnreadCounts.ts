'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * session160 — useUnreadCounts (ইউজার-স্পেক: লাইভ অপঠিত-ব্যাজ হুক)
 *
 * ─ ৪৫-সেকেন্ড ক্লায়েন্ট-পোলিং (ব্যক্তিগত নোটিফিকেশনে ১৫-মিনিটের ক্রন ধীর —
 *   ক্রন শুধু ভারী এনালিটিক্স/ক্যাশের জন্য, ব্যাজ এই হুক দিয়েই লাইভ)
 * ─ hidden-ট্যাবে স্কিপ (বৃথা-নেটওয়ার্ক-শূন্য)
 * ─ ইভেন্ট-চালিত তাৎক্ষণিক রিফ্রেশ: 'lf:messages-changed' / 'lf:notifications-changed'
 *   (মেসেজ-পাঠানো/পড়া, বিজ্ঞপ্তি-পড়া হলেই ব্যাজ সাথে-সাথে আপডেট)
 * ─ নেটওয়ার্ক-ফেইলে আগের স্টেট অক্ষুণ্ণ
 */

export interface UnreadCounts {
  notifications: number
  messages: number
  bookmarks: number
}

export function useUnreadCounts(enabled = true): UnreadCounts {
  const [counts, setCounts] = useState<UnreadCounts>({
    notifications: 0,
    messages: 0,
    bookmarks: 0,
  })
  const inFlight = useRef(false)

  const fetchCounts = useCallback(async () => {
    if (document.hidden || inFlight.current) return
    inFlight.current = true
    try {
      const res = await fetch('/api/user/unread-counts')
      if (res.ok) {
        const data = await res.json()
        if (
          typeof data.notifications === 'number' &&
          typeof data.messages === 'number' &&
          typeof data.bookmarks === 'number'
        ) {
          setCounts({ notifications: data.notifications, messages: data.messages, bookmarks: data.bookmarks })
        }
      }
    } catch {
      /* নেটওয়ার্ক-ফেইল → আগের স্টেট অক্ষুণ্ণ */
    } finally {
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    fetchCounts()
    const iv = setInterval(fetchCounts, 45000)
    const onMsg = () => fetchCounts()
    window.addEventListener('lf:messages-changed', onMsg)
    window.addEventListener('lf:notifications-changed', onMsg)
    /* ট্যাবে ফিরে-এলে সাথে-সাথে রিফ্রেশ */
    const onVis = () => {
      if (!document.hidden) fetchCounts()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(iv)
      window.removeEventListener('lf:messages-changed', onMsg)
      window.removeEventListener('lf:notifications-changed', onMsg)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [enabled, fetchCounts])

  return counts
}
